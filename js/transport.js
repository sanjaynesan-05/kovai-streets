/* Kovai Streets: transport.js
 * Step R3b (REBUILD_SPEC.md, EXECUTION_PLAN.md): living transport.
 * R3b-1 parking slots: every parked vehicle (Kovai Central forecourt, bus terminus bays, kerbs) is a slot. Far from the player it is
 *   cheap instanced scenery; near the player (slot.r metres) it is a real vehicle you can enter, drive, crash or steal. A vehicle you
 *   move or take is no longer the slot's; the slot refills with scenery once you are far away.
 * Classic script, loaded after geolandmarks.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const SLOTS=[],ZERO_M=new THREE.Matrix4().makeScale(0,0,0);
/* scen: [{im (InstancedMesh), i (instance index)}] drawing this vehicle as scenery; their current matrices are kept to show it again */
function addSlot(o){const sl=Object.assign({state:'scen',v:null},o);sl.scen=o.scen.map(s=>{const m=new THREE.Matrix4();s.im.getMatrixAt(s.i,m);return{im:s.im,i:s.i,m}});SLOTS.push(sl);return sl}
function slotShow(sl,on){for(const s of sl.scen){s.im.setMatrixAt(s.i,on?s.m:ZERO_M);s.im.instanceMatrix.needsUpdate=true}}
/* a chunk unloads: its slots go, and real vehicles nobody touched go with them */
function dropSlots(key){for(let i=SLOTS.length-1;i>=0;i--){const sl=SLOTS[i];if(sl.key!==key)continue;if(sl.state==='real'&&slotIdle(sl))removeVehicle(sl.v);else if(sl.v)sl.v.keep=false;SLOTS.splice(i,1)}}
function slotIdle(sl){const v=sl.v;return v&&vehicles.includes(v)&&v!==player.vehicle&&!v.wrecked&&!v.script&&Math.hypot(v.pos.x-sl.x,v.pos.z-sl.z)<3}
let slotT=0;
function updateSlots(dt){slotT-=dt;if(slotT>0)return;slotT=0.3;const P=playerP();
  for(const sl of SLOTS){const d=Math.hypot(sl.x-P.x,sl.z-P.z);
    if(sl.state==='scen'){if(d<sl.r&&!sl.busy){const v=spawnVehicle(sl.type,sl.x,sl.z,sl.h,sl.color);v.keep=true;v.slot=sl;sl.v=v;sl.state='real';slotShow(sl,false)}}
    else if(sl.state==='real'){if(!slotIdle(sl)){if(sl.v&&!sl.v.script)sl.v.keep=false;/* taken, moved or wrecked: no longer this slot's */sl.v=null;sl.state='gone'}
      else if(d>sl.r+60){removeVehicle(sl.v);sl.v=null;sl.state='scen';slotShow(sl,true)}}
    else if(sl.state==='gone'&&d>sl.r+120&&!sl.busy){sl.state='scen';slotShow(sl,true)}}}

function updateTransport(dt){updateSlots(dt);updateBuses(dt);updateCabs(dt);if(RAILW.ready){updateTrains(dt);updateGates(dt)}}

/* ---------- R3b-2: city buses from East Junction terminus ---------- */
/* Each departure: a parked bus leaves its bay, drives (left lane) to one line's stop, waits, comes back to the gate, and parks in a
   free bay. A bus that is hijacked or wrecked leaves service. At most 6 on the road; one leaves about every 45 s. */
const BUS_LINES=[{n:'Kovai Central',x:230,z:-212},{n:'Mill Estate',x:-1300,z:42},{n:'Campus Nagar',x:-800,z:-770},{n:'Lakeview',x:450,z:1185},{n:'Greenfield',x:1800,z:960},{n:'Old Kovai',x:1140,z:-402}];
const BUSES=[];let busT=6,busLine=0;
/* keep-left lane: route points moved off the centre line to the left of the direction of travel */
function laneOf(pts,off){return pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],h=Math.atan2(b[0]-a[0],b[1]-a[1]);return{x:p[0]+Math.cos(h)*off,z:p[1]-Math.sin(h)*off}})}
function roadLeg(a,b){const r=navRoute(a.x,a.z,b.x,b.z,true)||navRoute(a.x,a.z,b.x,b.z,false);return r?laneOf(r.pts,2.6):null}
function busDepart(){if(!TERM||!NAV.ready||BUSES.length>=6)return;
  const ready=TERM.bays.filter(b=>b.slot&&!b.claim&&(b.slot.state==='scen'||(b.slot.state==='real'&&slotIdle(b.slot))));if(!ready.length)return;
  const b=ready[(Math.random()*ready.length)|0],sl=b.slot,line=BUS_LINES[busLine++%BUS_LINES.length],to=roadLeg(TERM.gate,line),back=to&&roadLeg(line,TERM.gate);if(!to||!back)return;
  let v=sl.v;if(sl.state==='scen'){v=spawnVehicle('bus',sl.x,sl.z,sl.h,sl.color);slotShow(sl,false)}sl.v=null;sl.state='out';v.keep=true;v.slot=null;
  to[(to.length/2)|0].stop=8;to[to.length-1].stop=15;const R={pts:[...TERM.outPath(b),...to,...back],i:0,speed:11,hold:0};v.script=routeDrive(R);BUSES.push({v,R,line,stuck:0,home:null})}
function updateBuses(dt){if(!TERM)return;busT-=dt;if(busT<=0){busT=BUSES.length<3?8:45;busDepart()}const P=playerP();
  for(let i=BUSES.length-1;i>=0;i--){const B=BUSES[i],v=B.v,far=Math.hypot(v.pos.x-P.x,v.pos.z-P.z)>160;
    if(!vehicles.includes(v)||v.wrecked||v===player.vehicle){if(vehicles.includes(v)){v.script=null;v.keep=false}if(B.home)B.home.claim=null;BUSES.splice(i,1);continue}   /* hijacked or destroyed: out of service */
    B.stuck=Math.abs(v.speed)<0.5&&!(B.R.hold>0)?B.stuck+dt:0;
    if(B.stuck>40&&far){removeVehicle(v);if(B.home)B.home.claim=null;BUSES.splice(i,1);continue}                                                       /* jammed out of sight */
    if(!B.R.done)continue;
    if(!B.home){const bay=TERM.bays.find(b=>b.slot&&b.slot.state==='out'&&!b.claim);if(!bay){if(far){removeVehicle(v);BUSES.splice(i,1)}continue}
      bay.claim=B;B.home=bay;B.R={pts:TERM.inPath(bay),i:0,speed:7,hold:0};v.script=routeDrive(B.R)}
    else{const sl=B.home.slot;v.script=null;v.speed=0;sl.x=v.pos.x;sl.z=v.pos.z;sl.h=v.heading;sl.v=v;sl.state='real';v.slot=sl;B.home.claim=null;BUSES.splice(i,1)}}}   /* parked in its bay */

/* ---------- Kovai Central forecourt: taxis and autos drop off and leave ---------- */
const CABS=[];let cabT=12;
function updateCabs(dt){cabT-=dt;const st=GEO_LANDMARKS.find(l=>l.id==='station'),P=playerP();if(!st)return;
  if(cabT<=0){cabT=18;if(CABS.length<3&&Math.hypot(P.x-st.x,P.z-st.z)<400){const ca=Math.cos(st.angle),sa=Math.sin(st.angle),W=(u,v)=>({x:st.x+u*ca-v*sa,z:st.z+u*sa+v*ca});
    const pts=[{x:40,z:-203},{x:70,z:-170},W(-20,-66),{x:300,z:-150},{x:360,z:-204},{x:520,z:-203}];pts[2].stop=8;
    const v=spawnVehicle(Math.random()<0.5?'auto':'taxi',pts[0].x,pts[0].z,Math.atan2(pts[1].x-pts[0].x,pts[1].z-pts[0].z));v.keep=true;const R={pts,i:1,speed:8,hold:0};v.script=routeDrive(R);CABS.push({v,R})}}
  for(let i=CABS.length-1;i>=0;i--){const c=CABS[i];if(!vehicles.includes(c.v)||c.v===player.vehicle||c.v.wrecked){if(vehicles.includes(c.v)){c.v.script=null;c.v.keep=false}CABS.splice(i,1);continue}
    if(c.R.done&&Math.hypot(c.v.pos.x-P.x,c.v.pos.z-P.z)>80){removeVehicle(c.v);CABS.splice(i,1)}}}   /* gone once out of sight */

/* ---------- R3b-3: trains, level-crossing gates, the fence along the line, riding ---------- */
/* The line is straight (rail.json "line"). Positions on it: t = metres from its west end, v = metres to its side (+ = south).
   Eastbound trains run on v=+2.2, westbound on v=-2.2. Passenger trains stop at Kovai Central (40 s) and the two halts (20 s);
   goods trains run through. Gates close about 25 s before a train and open once it has passed; traffic and buses stop at them. */
const RAILW={ready:false,stations:[],gates:[],trains:[],timer:[20,95]},TRAIN_GEO={};
function railT(x,z){const R=RAILW;return(x-R.ax)*R.ux+(z-R.az)*R.uz}
function railV(x,z){const R=RAILW;return(x-R.ax)*R.nx+(z-R.az)*R.nz}
function railP(t,v){const R=RAILW;return[R.ax+R.ux*t+R.nx*v,R.az+R.uz*t+R.nz*v]}
function trainGeo(kind){if(TRAIN_GEO[kind])return TRAIN_GEO[kind];const B=GB();let x=0;const loco=c=>{gbBox(B,17,4.2,3.1,x-8.5,2.5,0,c);gbBox(B,17.2,0.5,3.2,x-8.5,2.2,0,'#f4f1e8');gbBox(B,0.3,1.2,2.6,x+0.05,3.5,0,'#1a2630');gbBox(B,0.2,0.4,0.6,x+0.1,1.6,0,'#fff6c0');x-=17.8};
  if(kind==='pass'){loco('#b23a2a');for(let k=0;k<8;k++){gbBox(B,22,3.8,3.1,x-11,2.4,0,'#1f4e8c');gbBox(B,22.1,0.9,3.16,x-11,2.95,0,'#1a2630');gbBox(B,22.1,0.25,3.16,x-11,1.9,0,'#e8dcc0');gbBox(B,22,0.6,2.6,x-11,0.5,0,'#222');x-=22.8}}
  else{loco('#1d4e89');for(let k=0;k<14;k++){gbBox(B,14,2.8,2.9,x-7,1.9,0,k%3?'#7a4a2a':'#5c5c5c');gbBox(B,14,0.6,2.5,x-7,0.5,0,'#222');x-=14.8}}
  return TRAIN_GEO[kind]={geo:gbGeo(B),len:-x}}
function initRailway(rail){if(RAILW.ready||!rail.line)return;const R=RAILW,[A,B]=rail.line,L=Math.hypot(B[0]-A[0],B[1]-A[1]);Object.assign(R,{ax:A[0],az:A[1],L,ux:(B[0]-A[0])/L,uz:(B[1]-A[1])/L});R.nx=-R.uz;R.nz=R.ux;R.yaw=Math.atan2(R.ux,R.uz);
  R.stations=rail.stations.map(s=>({name:s.name,t:railT(s.p[0],s.p[1]),dwell:s.name==='Kovai Central'?40:20}));
  for(const g of rail.gates||[])R.gates.push(buildGate(g));buildFence(rail);R.ready=true;
  spawnTrain(1,'pass',L*0.35);spawnTrain(-1,'goods',L*0.7)}
function spawnTrain(dir,kind,tf){const G=trainGeo(kind),m=new THREE.Mesh(G.geo,VCM);m.castShadow=true;scene.add(m);
  const tr={dir,kind,len:G.len,tf:tf!==undefined?tf:(dir>0?0:RAILW.L),speed:kind==='pass'?20:15,cruise:kind==='pass'?20:15,mesh:m,dwell:0,done:new Set(),honked:new Set()};RAILW.trains.push(tr);placeTrain(tr);return tr}
/* the mesh's +x is the front; it is turned to face the direction of travel */
function placeTrain(tr){const[x,z]=railP(tr.tf,tr.dir*2.2);tr.mesh.position.set(x,0.1,z);tr.mesh.rotation.y=RAILW.yaw-Math.PI/2+(tr.dir<0?Math.PI:0)}
/* the part of the line a train covers: [t0, t1] */
function trainSpan(tr){return tr.dir>0?[tr.tf-tr.len,tr.tf]:[tr.tf,tr.tf+tr.len]}
function updateTrains(dt){const R=RAILW;for(let k=0;k<2;k++){R.timer[k]-=dt;if(R.timer[k]<=0){R.timer[k]=150+Math.random()*80;spawnTrain(k?-1:1,Math.random()<0.65?'pass':'goods')}}
  for(let i=R.trains.length-1;i>=0;i--){const tr=R.trains[i];
    if(tr.dwell>0){tr.dwell-=dt;tr.speed=0;if(tr.dwell<=0&&tr===player.onTrain&&!nextStation(tr))leaveTrain(true);continue}   /* at a station; the last stop puts riders off */
    let target=tr.cruise;const ns=tr.kind==='pass'?nextStation(tr):null;
    if(ns){const stopTf=ns.t+tr.dir*tr.len/2,d=(stopTf-tr.tf)*tr.dir;target=Math.min(target,Math.sqrt(2*0.9*Math.max(0,d))+0.6);
      if(d<1.2){tr.tf=stopTf;tr.speed=0;tr.dwell=ns.dwell;tr.done.add(ns.name);placeTrain(tr);if(tr===player.onTrain)floatMsg(ns.name+' · press E to get off');continue}}
    tr.speed+=clamp(target-tr.speed,-1.2*dt,0.8*dt);tr.tf+=tr.dir*tr.speed*dt;placeTrain(tr);
    const[t0,t1]=trainSpan(tr);if(t0>R.L+30||t1<-30){if(tr===player.onTrain)leaveTrain(true);scene.remove(tr.mesh);R.trains.splice(i,1);continue}
    trainHits(tr);const P=playerP();for(const g of R.gates){const d=(g.t-tr.tf)*tr.dir;if(d>0&&d<260&&!tr.honked.has(g)&&Math.hypot(g.x-P.x,g.z-P.z)<450){tr.honked.add(g);noise(1.1,220,0.45,1.5)}}}}
function nextStation(tr){let best=null,bd=1e9;for(const s of RAILW.stations){if(tr.done.has(s.name))continue;const d=(s.t-tr.tf)*tr.dir+tr.len/2;if(d>-5&&d<bd){bd=d;best=s}}return best}
/* trains wreck vehicles and knock people over; standing still they just push */
function trainHits(tr){const[t0,t1]=trainSpan(tr),tv=tr.dir*2.2,mov=tr.speed>1.5,P=playerP();if(Math.abs(railT(P.x,P.z)-(t0+t1)/2)>600)return;
  const inside=(x,z,r)=>{const t=railT(x,z),v=railV(x,z);return t>t0-1&&t<t1+1&&Math.abs(v-tv)<1.6+r?(Math.sign(v-tv)||1):0};
  for(const veh of vehicles){if(veh.s.boat)continue;const s=inside(veh.pos.x,veh.pos.z,veh.s.w/2);if(!s)continue;const o=railP(railT(veh.pos.x,veh.pos.z),tv+s*(2.9+veh.s.w/2));veh.pos.x=o[0];veh.pos.z=o[1];
    if(mov){damageVehicle(veh,40*tr.speed,'crash');veh.speed=0;veh.vx+=RAILW.nx*s*6;veh.vz+=RAILW.nz*s*6}}
  if(!player.vehicle&&!player.onTrain){const s=inside(player.pos.x,player.pos.z,0.4);if(s){const o=railP(railT(player.pos.x,player.pos.z),tv+s*2.4);player.pos.x=o[0];player.pos.z=o[1];if(mov)playerDamage(4*tr.speed)}}
  if(mov)for(const p of peds){if(p.dead||p.hidden)continue;const s=inside(p.x,p.z,0.4);if(s)killPed(p,false,{vx:RAILW.nx*s*8,vy:5,vz:RAILW.nz*s*8})}}

/* riding: E beside a passenger train stopped at a station boards it (fare Rs 20); E at a stop gets off onto the platform */
function trainBoardOrAlight(){if(!RAILW.ready)return false;if(player.onTrain){if(player.onTrain.dwell>0){leaveTrain(false);return true}floatMsg('Wait for the next station');return true}
  if(player.vehicle||player.dead)return false;const P=player.pos;
  for(const tr of RAILW.trains){if(tr.kind!=='pass'||tr.dwell<=1)continue;const[t0,t1]=trainSpan(tr),t=railT(P.x,P.z),v=railV(P.x,P.z);
    if(t>t0&&t<t1&&Math.abs(v-tr.dir*2.2)<6){if(player.cash<20){floatMsg('The fare is ₹20');return true}player.cash-=20;player.onTrain=tr;if(player.human)player.human.g.visible=false;
      const nx=RAILW.stations.filter(s=>!tr.done.has(s.name)).map(s=>s.name);floatMsg(nx.length?'On the train · next stops: '+nx.join(', '):'On the train');return true}}
  return false}
function leaveTrain(forced){const tr=player.onTrain;if(!tr)return;const sp=trainSpan(tr),t=clamp(railT(player.pos.x,player.pos.z),sp[0]+3,sp[1]-3),[x,z]=railP(t,tr.dir*6.2);
  player.onTrain=null;player.pos.set(x,surfaceH(x,z,5)+0.1,z);player.vy=0;if(player.human)player.human.g.visible=true;floatMsg(forced?'End of the line: everyone off':'You got off the train')}
function rideTrain(){const tr=player.onTrain;if(!tr)return false;const[t0,t1]=trainSpan(tr),[x,z]=railP((t0+t1)/2,tr.dir*2.2);player.pos.set(x,3.2,z);player.vy=0;return true}

/* level-crossing gate: a boom each side of the line, red lights, a gatekeeper's hut and gatekeeper */
function buildGate(g){const R=RAILW,t=railT(g.x,g.z),rx=Math.sin(g.h),rz=Math.cos(g.h),cross=Math.abs(rx*R.uz-rz*R.ux)||1,off=Math.min(16,7/cross),G={x:g.x,z:g.z,t,h:g.h,w:g.w,ang:1.4,booms:[],cols:[],closed:false,bellT:0};
  G.lightMat=new THREE.MeshBasicMaterial({color:0x331111});
  for(const side of[-1,1]){const px=g.x+rx*off*side,pz=g.z+rz*off*side,ex=Math.cos(g.h)*side,ez=-Math.sin(g.h)*side,ox=px+ex*(g.w/2+0.6),oz=pz+ez*(g.w/2+0.6);   /* pivot at the road edge, arm across the road */
    const post=new THREE.Mesh(GEO.box,M('#4a4a4a'));post.scale.set(0.4,1.3,0.4);post.position.set(ox,0.65,oz);scene.add(post);addCollider(ox-0.25,oz-0.25,ox+0.25,oz+0.25,1.3);
    const lt=new THREE.Mesh(GEO.sph,G.lightMat);lt.scale.setScalar(0.22);lt.position.set(ox,1.6,oz);scene.add(lt);
    const piv=new THREE.Group();piv.position.set(ox,1.1,oz);piv.rotation.y=g.h;scene.add(piv);const arm=new THREE.Group();piv.add(arm);
    const L=g.w+1,bar=new THREE.Mesh(GEO.box,M('#f4f4f4'));bar.scale.set(L,0.18,0.18);bar.position.set(-side*L/2,0,0);arm.add(bar);
    for(let k=0;k<4;k++){const red=new THREE.Mesh(GEO.box,M('#c1121f'));red.scale.set(L/9,0.2,0.2);red.position.set(-side*L*(0.15+k*0.22),0,0);arm.add(red)}
    G.booms.push({arm,side,ox,oz,ex,ez,L})}
  const hx=g.x+Math.cos(g.h)*(g.w/2+5)+rx*(off+4),hz=g.z-Math.sin(g.h)*(g.w/2+5)+rz*(off+4),hut=new THREE.Mesh(GEO.box,M('#e9d8a6'));hut.scale.set(2.6,2.6,2.6);hut.position.set(hx,1.3,hz);scene.add(hut);
  const roof=new THREE.Mesh(GEO.box,M('#8c2d19'));roof.scale.set(3.2,0.25,3.2);roof.position.set(hx,2.75,hz);scene.add(roof);addCollider(hx-1.3,hz-1.3,hx+1.3,hz+1.3,2.8);
  const k=makeHuman({shirt:'#2b4c7e',pants:'#2b2d42',skin:rpick(SKIN)});k.g.position.set(hx-Math.cos(g.h)*2.2,0,hz+Math.sin(g.h)*2.2);k.g.rotation.y=g.h+Math.PI/2;scene.add(k.g);G.keeper=k;
  return G}
function updateGates(dt){const R=RAILW,P=playerP();
  for(const G of R.gates){let need=false;for(const tr of R.trains){const[t0,t1]=trainSpan(tr),front=(G.t-tr.tf)*tr.dir;if((front>0&&front<tr.cruise*25+20)||(G.t>t0-15&&G.t<t1+15)){need=true;break}}
    G.closed=need;G.ang+=clamp((need?0:1.4)-G.ang,-0.7*dt,0.7*dt);for(const b of G.booms)b.arm.rotation.z=-b.side*G.ang;
    const flash=need||G.ang<1.35;G.lightMat.color.setHex(flash&&Math.floor(time*2.5)%2?0xff2a2a:0x331111);
    if(G.ang<0.35&&!G.cols.length){for(const b of G.booms){const a=[b.ox,b.oz],c=[b.ox-b.ex*b.L,b.oz-b.ez*b.L],nx=-(c[1]-a[1])/b.L*0.25,nz=(c[0]-a[0])/b.L*0.25;gwFootprintBoxes([[a[0]+nx,a[1]+nz],[c[0]+nx,c[1]+nz],[c[0]-nx,c[1]-nz],[a[0]-nx,a[1]-nz],[a[0]+nx,a[1]+nz]],1.3,G.cols)}}
    else if(G.ang>=0.35&&G.cols.length){removeColliders(G.cols);G.cols.length=0}
    if(flash&&Math.hypot(G.x-P.x,G.z-P.z)<120){G.bellT-=dt;if(G.bellT<=0){G.bellT=0.6;noise(0.12,1400,0.18,4)}}
    if(G.keeper)animHuman(G.keeper,0,0,false)}}
/* a closed (or closing) gate 4-24 m ahead of this vehicle, on its road */
function gateAhead(v){if(!RAILW.ready)return false;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
  for(const G of RAILW.gates){if(!G.closed&&G.ang>1.3)continue;const dx=G.x-v.pos.x,dz=G.z-v.pos.z,ahead=dx*fx+dz*fz;if(ahead<4||ahead>24)continue;if(Math.abs(dx*fz-dz*fx)<G.w/2+3)return true}return false}

/* fence along both sides of the line (v = +-9), with gaps at road crossings, Kovai Central and the halts; posts and two rails, solid */
function buildFence(rail){const R=RAILW,gaps=[];for(const g of[...(rail.gates||[]),...(rail.overs||[])]){const rx=Math.sin(g.h),rz=Math.cos(g.h),cross=Math.abs(rx*R.uz-rz*R.ux)||1,t=railT(g.x,g.z),hw=(g.w/2+4)/cross;gaps.push([t-hw,t+hw])}
  for(const s of R.stations)gaps.push(s.name==='Kovai Central'?[s.t-245,s.t+245]:[s.t-95,s.t+95]);
  const posts=[],cols=[];
  for(const side of[-9,9]){let run=null;const flush=()=>{if(run&&run[1]-run[0]>4){const a=railP(run[0],side),b=railP(run[1],side),nx=R.nx*0.2,nz=R.nz*0.2;gwFootprintBoxes([[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz],[a[0]+nx,a[1]+nz]],1.6,cols)}run=null};
    for(let t=0;t<=R.L;t+=4){if(gaps.some(g=>t>g[0]&&t<g[1])){flush();continue}posts.push(railP(t,side));if(!run)run=[t,t];run[1]=t}flush()}
  const o=new THREE.Object3D(),pm=new THREE.InstancedMesh(GEO.box,M('#6b6b6b'),posts.length),rm=new THREE.InstancedMesh(GEO.box,M('#9a9a9a'),posts.length*2);
  posts.forEach(([x,z],i)=>{o.position.set(x,0.8,z);o.rotation.set(0,0,0);o.scale.set(0.15,1.6,0.15);o.updateMatrix();pm.setMatrixAt(i,o.matrix);
    for(const k of[0,1]){o.position.set(x+R.ux*2,0.55+k*0.8,z+R.uz*2);o.rotation.set(0,R.yaw,0);o.scale.set(0.06,0.08,4);o.updateMatrix();rm.setMatrixAt(i*2+k,o.matrix)}});scene.add(pm);scene.add(rm)}
