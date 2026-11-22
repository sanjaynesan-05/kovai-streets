/* Kovai Streets: vehicles.js
 * Vehicle types, spawning, traffic AI, vehicle meshes, vehicle physics and collisions, visible damage
 * Classic script, loaded in order by index.html (4 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= vehicles ================= */
const VT={
  car:{len:4.4,w:1.85,max:40,acc:13,brake:30,steer:1.9,circ:[-1.25,1.25],cr:1.05,hp:400,cam:7.5,camH:2.8,y:1.0,name:'car',mass:1300,grip:7},
  sport:{len:4.5,w:1.9,max:60,acc:25,brake:40,steer:2.1,circ:[-1.25,1.25],cr:1.05,hp:520,cam:7.5,camH:2.6,y:0.95,name:'Kovai Racer',mass:1200,grip:9},
  auto:{len:2.8,w:1.4,max:21,acc:9,brake:22,steer:2.5,circ:[-0.55,0.55],cr:0.85,hp:260,cam:6,camH:2.6,y:1.0,name:'auto',mass:450,grip:6},
  turbo:{len:2.8,w:1.4,max:46,acc:24,brake:30,steer:2.6,circ:[-0.55,0.55],cr:0.85,hp:450,cam:6,camH:2.6,y:1.0,name:'turbo auto',mass:500,grip:7},
  bus:{len:10.5,w:2.5,max:25,acc:5.5,brake:15,steer:1.05,circ:[-3.9,-1.3,1.3,3.9],cr:1.35,hp:900,cam:14,camH:5.2,y:1.6,name:'bus',mass:9000,grip:8},
  police:{len:4.5,w:1.9,max:44,acc:16,brake:32,steer:2.0,circ:[-1.25,1.25],cr:1.05,hp:500,cam:7.5,camH:2.8,y:1.0,name:'police car',mass:1500,grip:8},
  bike:{len:2.0,w:0.7,max:40,acc:17,brake:30,steer:2.9,circ:[0],cr:0.65,hp:160,cam:5.5,camH:2.4,y:1.0,name:'motorbike',mass:200,grip:7.5,two:true},
  scooter:{len:1.8,w:0.7,max:27,acc:12,brake:24,steer:3.0,circ:[0],cr:0.6,hp:140,cam:5.2,camH:2.3,y:0.95,name:'scooter',mass:150,grip:7,two:true},
  lorry:{len:8.4,w:2.5,max:24,acc:5,brake:14,steer:1.1,circ:[-2.8,0,2.8],cr:1.35,hp:1100,cam:13,camH:5,y:1.6,name:'lorry',mass:8000,grip:8},
  ambulance:{len:5.2,w:2.0,max:42,acc:15,brake:30,steer:1.9,circ:[-1.5,1.5],cr:1.1,hp:500,cam:8.5,camH:3.2,y:1.3,name:'ambulance',mass:2000,grip:7.5},
  tank:{len:7.2,w:3.4,max:19,acc:7,brake:20,steer:1.1,circ:[-2.4,0,2.4],cr:1.75,hp:6000,cam:12,camH:4.6,y:1.4,name:'tank',mass:40000,grip:14}};
const CAR_COLORS=['#f4f4f4','#c9ccd1','#b3202a','#1f4e8c','#202225','#e3b23c','#2d6a4f','#7b8b94','#f4f4f4','#c9ccd1'];
const vehicles=[];
function spawnVehicle(type,x,z,h,color){const s=VT[type];color=color||vehColor(type);
  const{g,wheels,lights,turret}=makeVehicleMesh(type,color);g.rotation.order='YXZ';const y0=surfaceH(x,z,0);g.position.set(x,y0,z);g.rotation.y=h;scene.add(g);
  const v={color,type,s,mesh:g,pos:g.position,heading:h,speed:0,vx:0,vz:0,av:0,hp:s.hp,wrecked:false,ai:null,policeAI:null,wheels,lights,turret,wreckT:0,smokeT:0,burn:0,lastSrc:null,y:y0,vy:0,lean:0,sink:0,prevH:h};addBeam(v);
  vehicles.push(v);return v}
function removeVehicle(v){const i=vehicles.indexOf(v);if(i>=0)vehicles.splice(i,1);scene.remove(v.mesh)}

/* traffic AI (keeps to the left, like Indian roads) */
const inGrid=(i,j)=>i>=-NB&&i<=NB&&j>=-NB&&j<=NB;
const laneWP=(i,j,dx,dz,off,ln)=>{ln=ln||LANE;return{x:i*CELL+dx*off+dz*ln,z:j*CELL+dz*off-dx*ln}};
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function aiNext(v){const a=v.ai;const opts=[];
  for(const[dx,dz,w]of[[a.dx,a.dz,0.5],[a.dz,-a.dx,0.25],[-a.dz,a.dx,0.25]])if(inGrid(a.i+dx,a.j+dz))opts.push([dx,dz,w]);
  let ch;if(!opts.length)ch=[-a.dx,-a.dz];else{let tot=0;for(const o of opts)tot+=o[2];let r=Math.random()*tot;ch=opts[opts.length-1];for(const o of opts){r-=o[2];if(r<=0){ch=o;break}}}
  if(a.flee&&opts.length){const P=playerP();let best=-1e9;for(const o of opts){const nx=(a.i+o[0])*CELL,nz=(a.j+o[1])*CELL;const d=Math.hypot(nx-P.x,nz-P.z)+Math.random()*60;if(d>best){best=d;ch=o}}}
  if(v.y>2.5&&inGrid(a.i+a.dx,a.j+a.dz))ch=[a.dx,a.dz];const nx=ch[0],nz=ch[1];const exit=laneWP(a.i,a.j,nx,nz,8,a.lane);a.i+=nx;a.j+=nz;a.dx=nx;a.dz=nz;a.wps=[exit,laneWP(a.i,a.j,nx,nz,-9,a.lane)];a.turnWp=exit}
function playerP(){return player.vehicle?player.vehicle.pos:player.pos}
function makeAI(v,i,j,dx,dz,cruise){const lane=v.s.cycle?RR(5.0,5.6):v.s.two?RR(2.0,5.4):LANE;v.ai={lane,i,j,dx,dz,wps:[laneWP(i,j,dx,dz,-9,lane)],turnWp:null,cruise,blockT:0,stuck:0,hitT:0};v.speed=cruise*0.6;v.vx=Math.sin(v.heading)*v.speed;v.vz=Math.cos(v.heading)*v.speed}
function spawnAI(type,minDist){
  for(let t=0;t<80;t++){const i=RI(-NB,NB),j=RI(-NB,NB);const[dx,dz]=rpick(DIRS);if(!inGrid(i-dx,j-dz))continue;
    const p=laneWP(i,j,dx,dz,-RR(12,58));const P=playerP();if(Math.hypot(p.x-P.x,p.z-P.z)<minDist)continue;
    if(vehicles.some(v=>Math.abs(v.pos.x-p.x)<9&&Math.abs(v.pos.z-p.z)<9))continue;
    const v=spawnVehicle(type,p.x,p.z,Math.atan2(dx,dz));const cr=CRUISE[type]||[9,11];makeAI(v,i,j,dx,dz,RR(cr[0],cr[1]));if(v.s.two)addRider(v);return v}
  return null}
const CRUISE={car:[12,16],auto:[8.5,11],bus:[9,11],bike:[13,17],scooter:[9,12],lorry:[9,11],ambulance:[16,19],hatch:[11,15],suv:[12,16],jeep:[11,14],van:[10,13],taxi:[12,15],tempo:[9,11],cruiser:[12,15],sports:[15,19],retro:[8,11],moped:[7,9],cycle:[4,5.5]};
function aiType(){const T=[['car',14],['hatch',12],['auto',14],['bike',8],['scooter',7],['retro',3],['moped',3],['cycle',5],['cruiser',3],['sports',2],['suv',6],['jeep',3],['van',4],['taxi',4],['tempo',4],['bus',5],['lorry',5],['ambulance',2]];let t=0;for(const x of T)t+=x[1];let r=Math.random()*t;for(const x of T){r-=x[1];if(r<=0)return x[0]}return'car'}

function addRider(v){const fem=Math.random()<0.3,sh=rpick(SHIRTS);const h=makeHuman({shirt:sh,pants:fem?sh:rpick(PANTS),skin:rpick(SKIN),long:fem});v.mesh.add(h.g);h.g.position.set(0,v.s.cycle?0.0:0.08,v.s.cycle?-0.15:-0.2);if(v.s.cycle)pedalPose(h,0);else seatPose(h);
  if(!fem&&Math.random()<0.6){const hm=new THREE.Mesh(GEO.sph,M(rpick(['#111','#c1121f','#f4f4f4'])));hm.scale.set(0.21,0.19,0.23);hm.position.set(0,1.7,0);h.g.add(hm)}v.rider=h}
function blockedAhead(v){const fx=Math.sin(v.heading),fz=Math.cos(v.heading);const look=6+Math.abs(v.speed)*0.75+v.s.len/2;
  const test=(ox,oz,hw)=>{const dx=ox-v.pos.x,dz=oz-v.pos.z;const f=dx*fx+dz*fz;if(f<=0.5||f>look)return false;return Math.abs(dx*fz-dz*fx)<v.s.w/2+hw+0.45};
  if(!player.vehicle&&!player.dead&&Math.abs(player.pos.y-v.y)<2.5&&test(player.pos.x,player.pos.z,0.4))return true;
  for(const o of vehicles){if(o===v||Math.abs(o.y-v.y)>2.5)continue;if(Math.abs(o.pos.x-v.pos.x)>look+6||Math.abs(o.pos.z-v.pos.z)>look+6)continue;
    for(const off of o.s.circ){if(test(o.pos.x+Math.sin(o.heading)*off,o.pos.z+Math.cos(o.heading)*off,o.s.w/2))return true}}
  return false}
function updAI(v,dt){const a=v.ai;if(!a.wps.length)aiNext(v);let wp=a.wps[0];
  let dx=wp.x-v.pos.x,dz=wp.z-v.pos.z,d=Math.hypot(dx,dz);
  if(d<3.4){a.wps.shift();if(!a.wps.length)aiNext(v);wp=a.wps[0];dx=wp.x-v.pos.x;dz=wp.z-v.pos.z;d=Math.hypot(dx,dz)}
  const diff=angDiff(v.heading,Math.atan2(dx,dz));
  let target=a.cruise;const slow=a.reckless?13:7.5;if(wp===a.turnWp||(a.wps.length===1&&d<16))target=Math.min(target,slow);if(Math.abs(diff)>0.6)target=Math.min(target,a.reckless?9:5);
  const blocked=!a.reckless&&blockedAhead(v);
  if(blocked){a.blockT+=dt;target=0}else a.blockT=0;
  if(a.hitT>0){a.hitT-=dt;target=0}
  v.speed+=clamp(target-v.speed,-v.s.brake*dt,v.s.acc*dt);
  const rate=v.s.steer*1.3*Math.min(1,Math.abs(v.speed)/3);v.heading+=clamp(diff,-rate*dt,rate*dt);
  if(!blocked&&target>1&&Math.abs(v.speed)<0.6)a.stuck+=dt;else a.stuck=0;
  const P=playerP();const far=Math.hypot(v.pos.x-P.x,v.pos.z-P.z)>60;
  if(a.reckless){if(a.stuck>1.5){v.heading+=Math.PI*0.5*(Math.random()<0.5?-1:1);a.stuck=0;a.wps=[];}return}
  if((a.stuck>4||a.blockT>10)&&far){relocateAI(v)}
  if(a.blockT>2.5&&!far&&Math.random()<dt*0.4&&a.blockT<12)hornAt(v.pos)}
function relocateAI(v){const t=v.type;removeVehicle(v);spawnAI(t,110)}


/* ================= vehicles: new types + detailed meshes ================= */
Object.assign(VT,{
  hatch:{len:3.8,w:1.7,max:36,acc:12,brake:30,steer:2.1,circ:[-1.0,1.0],cr:1.0,hp:350,cam:7,camH:2.7,y:1.0,name:'hatchback',mass:1000,grip:7},
  suv:{len:4.7,w:1.95,max:38,acc:12,brake:30,steer:1.8,circ:[-1.3,1.3],cr:1.12,hp:520,cam:8,camH:3.1,y:1.2,name:'SUV',mass:1900,grip:7.5},
  jeep:{len:4.0,w:1.8,max:34,acc:13,brake:28,steer:2.0,circ:[-1.1,1.1],cr:1.05,hp:460,cam:7.5,camH:2.9,y:1.1,name:'jeep',mass:1500,grip:8.5},
  van:{len:3.8,w:1.6,max:30,acc:10,brake:26,steer:2.0,circ:[-1.0,1.0],cr:0.95,hp:350,cam:7,camH:2.9,y:1.2,name:'van',mass:1100,grip:6.5},
  taxi:{len:4.4,w:1.85,max:38,acc:13,brake:30,steer:1.9,circ:[-1.25,1.25],cr:1.05,hp:400,cam:7.5,camH:2.8,y:1.0,name:'taxi',mass:1300,grip:7},
  tempo:{len:4.6,w:1.8,max:24,acc:8,brake:22,steer:1.7,circ:[-1.3,1.3],cr:1.0,hp:420,cam:8,camH:3.2,y:1.2,name:'mini truck',mass:1800,grip:7},
  cruiser:{len:2.2,w:0.8,max:36,acc:14,brake:28,steer:2.6,circ:[0],cr:0.7,hp:200,cam:5.8,camH:2.4,y:1.0,name:'cruiser bike',mass:220,grip:7.5,two:true},
  sports:{len:2.0,w:0.7,max:52,acc:24,brake:34,steer:2.8,circ:[0],cr:0.65,hp:170,cam:5.6,camH:2.3,y:0.95,name:'sports bike',mass:190,grip:8,two:true},
  retro:{len:1.8,w:0.7,max:24,acc:11,brake:22,steer:3.0,circ:[0],cr:0.6,hp:130,cam:5.2,camH:2.3,y:0.95,name:'retro scooter',mass:140,grip:7,two:true},
  moped:{len:1.8,w:0.65,max:20,acc:9,brake:20,steer:3.0,circ:[0],cr:0.6,hp:110,cam:5.2,camH:2.3,y:0.95,name:'moped',mass:110,grip:7,two:true},
  cycle:{len:1.75,w:0.6,max:9.5,acc:4.5,brake:12,steer:3.2,circ:[0],cr:0.55,hp:60,cam:5,camH:2.2,y:0.9,name:'bicycle',mass:80,grip:7,two:true,cycle:true},
  speedboat:{len:6,w:2.2,max:32,acc:10,brake:12,steer:1.4,circ:[-1.8,0,1.8],cr:1.1,hp:500,cam:10,camH:3.4,y:1.0,name:'speedboat',mass:1500,grip:1.6,boat:true},
  fishboat:{len:8,w:2.6,max:15,acc:5,brake:8,steer:0.9,circ:[-2.6,0,2.6],cr:1.3,hp:700,cam:12,camH:4,y:1.2,name:'fishing boat',mass:3000,grip:1.4,boat:true},
  rowboat:{len:3.4,w:1.4,max:6,acc:3,brake:6,steer:1.6,circ:[-0.9,0.9],cr:0.75,hp:200,cam:6.5,camH:2.6,y:0.8,name:'rowboat',mass:300,grip:1.8,boat:true}});
function vehColor(t){return t==='bike'?rpick(['#b3202a','#111','#1f4e8c','#555']):t==='cruiser'?rpick(['#111','#3b3b3b','#5b0f0f','#1f3b2a']):t==='sports'?rpick(['#d62828','#1d4ed8','#f1faee','#111','#2b9348']):
  t==='scooter'?rpick(['#e9c46a','#ffffff','#2a9d8f','#e76f51','#6d597a','#bcbcbc']):t==='retro'?rpick(['#9bd1c6','#f4acb7','#f2e8cf','#a8dadc']):t==='moped'?rpick(['#1f4e8c','#2b2b2b','#7b2d26']):t==='cycle'?rpick(['#111','#1d4ed8','#c1121f','#2b9348']):
  t==='lorry'?rpick(['#e67e22','#f1c40f','#2f6fb0','#c0392b']):t==='tempo'?rpick(['#1d4ed8','#f1faee','#e9c46a','#2b9348']):t==='jeep'?rpick(['#3f5130','#f1faee','#1f1f1f','#7b2d26']):t==='van'?rpick(['#f4f4f4','#c9ccd1','#e9c46a','#1f4e8c']):
  t==='suv'?rpick(['#f4f4f4','#202225','#7b8b94','#5b0f0f']):t==='hatch'?rpick(['#f4f4f4','#c1121f','#1d4ed8','#e3b23c','#c9ccd1','#2d6a4f']):t==='taxi'?'#f2c200':t==='car'?rpick(CAR_COLORS):t==='police'?'#f5f5f5':t==='sport'?'#ff3b30':t==='bus'?rpick(['#c8462b','#2f6fb0','#2e8b57']):t==='ambulance'?'#f5f5f5':null}
const wheelCache={};
function wheelMesh(r,wid,rim){const k=r+'_'+wid+'_'+rim;let geo=wheelCache[k];if(!geo){const B=GB();
    gb(B,new THREE.TorusGeometry(1,0.42,8,18).rotateY(Math.PI/2),0,0,0,'#161616',0,0,0,wid/0.84,r/1.42,r/1.42);
    gb(B,CY(0.62,0.62,0.6,14).rotateZ(Math.PI/2),0,0,0,rim,0,0,0,wid*0.7/0.6,r/1.42,r/1.42);
    gb(B,CY(0.2,0.2,0.7,8).rotateZ(Math.PI/2),0,0,0,shade(rim,0.7),0,0,0,wid*0.75/0.7,r/1.42,r/1.42);geo=wheelCache[k]=gbGeo(B)}
  const m=new THREE.Mesh(geo,VCM);m.castShadow=true;return m}
const GLASS='#1e2a35',TRIM='#1a1a1a',CHROME='#c9ced3';
const ROUTES=['1C GANDHIPURAM','12 UKKADAM','45 PEELAMEDU','70 R.S. PURAM','3A SINGANALLUR','90 PODANUR'];const routeTex={};
function routeBoard(){const r=rpick(ROUTES);if(!routeTex[r]){const c=cv(256,40),g=c.getContext('2d');g.fillStyle='#111';g.fillRect(0,0,256,40);g.fillStyle='#ffb000';g.font='bold 24px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(r,128,21);routeTex[r]=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)})}return routeTex[r]}
function makeVehicleMesh(type,color){const g=new THREE.Group();const s=VT[type],w=s.w,L=s.len;const wheels=[],lights=[];let turret=null;
  const B=GB(),LB=GB();const lamp=(x,y,z,sx,sy,c)=>gbBox(LB,sx,sy,0.06,x,y,z,c);
  const wheel=(x,y,z,r,wid,rim)=>{const m=wheelMesh(r,wid,rim||'#9aa0a6');m.position.set(x,y,z);g.add(m);wheels.push(m)};
  const flasher=(x,y,z,c)=>{const m=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:c}));m.scale.set(0.5,0.16,0.3);m.position.set(x,y,z);g.add(m);lights.push(m)};
  const car4=(r,rim,zf,zr,yw)=>{for(const sx of[-1,1]){wheel(sx*(w/2-0.13),r,zf,r,0.24,rim);wheel(sx*(w/2-0.13),r,zr,r,0.24,rim)}};
  const sedanLike=(hatch,sport)=>{const h2=L/2;
    const low=sport?[[-h2,0.32],[h2-0.1,0.32],[h2+0.05,0.42,h2,0.55],[0.9,0.82],[-h2+0.3,0.88],[-h2-0.05,0.85,-h2,0.5]]:
      hatch?[[-h2,0.32],[h2-0.1,0.32],[h2+0.06,0.45,h2,0.66],[0.8,0.95],[-h2+0.15,0.98],[-h2-0.02,0.9,-h2,0.5]]:
      [[-h2,0.32],[h2-0.12,0.32],[h2+0.08,0.45,h2,0.68],[1.05,0.95],[-1.6,0.98],[-h2-0.04,0.98,-h2,0.62]];
    gbM(B,profileGeo(low,w,0.08),new THREE.Matrix4(),color);
    const cab=sport?[[0.9,0.84],[0.15,1.2],[-0.9,1.22],[-1.6,0.9]]:hatch?[[0.8,0.96],[0.2,1.44],[-1.45,1.46],[-1.72,0.98]]:[[1.05,0.96],[0.38,1.42],[-0.85,1.45],[-1.58,0.99]];
    gbM(B,profileGeo(cab,w-0.12,0.06),new THREE.Matrix4(),GLASS);
    const ry=sport?1.2:1.44;gbM(B,profileGeo([[cab[1][0]-0.05,ry],[cab[2][0]+0.05,ry+(hatch?0.02:0.03)],[cab[2][0]+0.05,ry+0.1],[cab[1][0]-0.05,ry+0.08]],w-0.16,0.04),new THREE.Matrix4(),color);
    gbBox(B,0.07,ry-0.97,w-0.1,0,(ry+0.97)/2,-0.25,color,0,Math.PI/2,0);
    gbBox(B,w*0.55,0.16,0.06,0,0.55,h2+0.04,TRIM);gbBox(B,w+0.04,0.16,0.18,0,0.36,h2-0.02,'#2b2b2b');gbBox(B,w+0.04,0.16,0.18,0,0.38,-h2+0.02,'#2b2b2b');
    for(const sx of[-1,1]){gbBox(B,0.1,0.07,0.16,sx*(w/2+0.06),1.0,0.95,color);lamp(sx*w*0.33,0.66,h2+0.03,0.36,0.12,'#fff3d0');lamp(sx*w*0.36,0.74,-h2-0.01,0.34,0.12,'#b81d18')}
    car4(sport?0.33:0.34,CHROME,L*0.31,-L*0.31)};
  if(type==='car'||type==='police'||type==='taxi'||type==='sport'){sedanLike(false,type==='sport');
    if(type==='police'){gbBox(B,w+0.03,0.14,L*0.86,0,0.75,0,'#1d4ed8');flasher(-0.32,1.58,-0.2,0xff2a2a);flasher(0.32,1.58,-0.2,0x2a5cff);gbBox(B,1.1,0.08,0.3,0,1.5,-0.2,'#222')}
    if(type==='taxi'){gbBox(B,0.6,0.18,0.25,0,1.6,-0.25,'#111');gbBox(B,w+0.03,0.1,L*0.8,0,0.72,0,'#111')}
    if(type==='sport'){gbBox(B,w+0.04,0.08,0.45,0,1.02,-L/2+0.25,'#111');gbBox(B,0.5,0.03,L*0.9,0,0.9,0,'#f4f4f4')}}
  else if(type==='hatch')sedanLike(true,false);
  else if(type==='suv'||type==='van'||type==='ambulance'){const h2=L/2,van=type!=='suv';const top=type==='ambulance'?2.4:van?1.95:1.8,belt=van?1.05:1.1;
    gbM(B,profileGeo(van?[[-h2,0.36],[h2-0.1,0.36],[h2+0.06,0.5,h2,0.75],[h2-0.35,belt],[-h2,belt]]:[[-h2,0.4],[h2-0.1,0.4],[h2+0.06,0.55,h2,0.85],[1.2,belt],[-h2,belt+0.02]],w,0.08),new THREE.Matrix4(),color);
    const cab=van?[[h2-0.35,belt],[h2-0.95,top-0.05],[-h2+0.05,top-0.05],[-h2+0.05,belt]]:[[1.2,belt],[0.55,top-0.05],[-h2+0.1,top-0.05],[-h2+0.05,belt]];
    gbM(B,profileGeo(cab,w-0.1,0.06),new THREE.Matrix4(),type==='ambulance'?'#f5f5f5':GLASS);
    if(type!=='ambulance'){gbM(B,profileGeo([[cab[1][0]-0.05,top-0.06],[-h2+0.08,top-0.06],[-h2+0.08,top+0.05],[cab[1][0]-0.05,top+0.05]],w-0.14,0.04),new THREE.Matrix4(),color);
      for(const z of[0.2,-0.9])gbBox(B,0.08,top-belt,w-0.08,0,(top+belt)/2,z,color,0,Math.PI/2,0)}
    else{for(const sx of[-1,1])gbBox(B,0.03,0.5,1.8,sx*(w/2),1.55,-0.4,GLASS);gbM(B,profileGeo([[h2-0.35,belt],[h2-0.95,1.75],[h2-1.05,1.75],[h2-0.45,belt]],w-0.06,0.04),new THREE.Matrix4(),GLASS);
      gbBox(B,w+0.03,0.22,L*0.98,0,1.18,0,'#d62828');for(const sx of[-1,1]){gbBox(B,0.04,0.7,0.22,sx*(w/2+0.02),1.7,-0.7,'#d62828');gbBox(B,0.04,0.22,0.7,sx*(w/2+0.02),1.7,-0.7,'#d62828')}
      flasher(-0.35,top+0.12,h2-1.1,0xff2a2a);flasher(0.35,top+0.12,h2-1.1,0x2a5cff)}
    if(type==='suv'){for(const sx of[-1,1])gbBox(B,0.05,0.05,L*0.6,sx*(w/2-0.15),top+0.12,-0.3,TRIM);gbBox(B,w+0.06,0.22,0.3,0,0.45,h2,'#2b2b2b')}
    gbBox(B,w+0.04,0.16,0.16,0,0.4,-h2,'#2b2b2b');for(const sx of[-1,1]){lamp(sx*w*0.34,0.75,h2+0.03,0.34,0.14,'#fff3d0');lamp(sx*w*0.38,0.85,-h2-0.01,0.18,0.3,'#b81d18');gbBox(B,0.1,0.08,0.16,sx*(w/2+0.06),belt+0.05,h2-0.6,color)}
    car4(type==='suv'?0.4:0.33,type==='suv'?'#5b6066':CHROME,L*0.31,-L*0.3)}
  else if(type==='jeep'){const h2=L/2;gbM(B,profileGeo([[-h2,0.45],[h2-0.05,0.45],[h2,1.0],[0.55,1.05],[-h2,1.05]],w,0.06),new THREE.Matrix4(),color);
    for(const sx of[-1,1]){gbBox(B,0.32,0.12,1.1,sx*(w/2+0.06),0.95,h2-0.6,shade(color,0.8));gbBox(B,0.32,0.12,1.0,sx*(w/2+0.06),0.95,-h2+0.6,shade(color,0.8))}
    gbBox(B,w-0.1,0.6,0.05,0,1.35,0.55,GLASS,-0.15,0,0);gbBox(B,w-0.04,0.06,0.06,0,1.66,0.5,TRIM);
    if(color!=='#f1faee'){gbM(B,profileGeo([[0.45,1.05],[0.45,1.95],[-h2+0.05,1.95],[-h2+0.05,1.05]],w-0.04,0.05),new THREE.Matrix4(),'#4b4a33')}
    else{for(const z of[-0.2,-h2+0.2])gbTube(B,[-w/2+0.1,1.05,z],[-w/2+0.1,1.85,z],0.04,TRIM),gbTube(B,[w/2-0.1,1.05,z],[w/2-0.1,1.85,z],0.04,TRIM);gbTube(B,[-w/2+0.1,1.85,-0.2],[w/2-0.1,1.85,-0.2],0.04,TRIM)}
    gb(B,new THREE.TorusGeometry(1,0.42,8,16),0,0.95,-h2-0.12,'#161616',0,0,0,0.26,0.26,0.4);gbBox(B,w*0.5,0.3,0.06,0,0.8,h2+0.02,'#2b2b2b');
    for(const sx of[-1,1])lamp(sx*w*0.3,0.85,h2+0.04,0.22,0.22,'#fff3d0'),lamp(sx*w*0.4,0.75,-h2-0.01,0.12,0.18,'#b81d18');car4(0.38,'#5b6066',L*0.3,-L*0.3)}
  else if(type==='tempo'){const h2=L/2;gbM(B,profileGeo([[h2-1.5,0.5],[h2-0.05,0.5],[h2+0.05,0.9,h2-0.1,1.3],[h2-0.5,1.95],[h2-1.5,1.95]],w,0.08),new THREE.Matrix4(),color);
    gbM(B,profileGeo([[h2-0.12,1.32],[h2-0.5,1.85],[h2-1.0,1.85],[h2-1.0,1.32]],w+0.02,0.03),new THREE.Matrix4(),GLASS);
    gbBox(B,w,0.2,L-1.6,0,0.75,-0.8,'#3b3b3b');for(const sx of[-1,1])gbBox(B,0.06,0.5,L-1.6,sx*(w/2-0.03),1.1,-0.8,'#7a5536');gbBox(B,w,0.5,0.06,0,1.1,-h2+0.03,'#7a5536');
    for(let k=0;k<4;k++)gbBox(B,0.6,0.5,0.6,R(-0.5,0.5),1.1,-0.4-k*0.6,'#c8a165');
    for(const sx of[-1,1])lamp(sx*w*0.33,0.8,h2+0.03,0.28,0.14,'#fff3d0'),lamp(sx*w*0.4,0.75,-h2-0.01,0.16,0.14,'#b81d18');car4(0.36,'#9aa0a6',L*0.32,-L*0.28)}
  else if(type==='auto'||type==='turbo'){const body=type==='turbo'?'#ff6b00':'#f2c200',h2=L/2;
    gbM(B,profileGeo([[-h2,0.35],[h2-0.15,0.35],[h2+0.05,0.7,h2-0.1,1.05],[h2-0.45,1.6],[h2-0.75,1.6],[h2-0.6,1.0],[-h2,0.95]],w,0.06),new THREE.Matrix4(),body);
    gbBox(B,w+0.02,0.1,L*0.98,0,0.82,0,type==='turbo'?'#111':'#2e7d32');
    gbM(B,profileGeo([[h2-0.65,1.62],[h2-0.5,2.0,h2-0.85,2.05],[-h2+0.3,2.05],[-h2+0.05,2.0,-h2,1.7],[-h2,1.0],[-h2+0.15,1.0],[-h2+0.15,1.85],[h2-0.75,1.88]],w+0.04,0.04),new THREE.Matrix4(),'#1a1a1a');
    gbBox(B,w*0.62,0.42,0.04,0,1.55,h2-0.6,GLASS,-0.35,0,0);gbBox(B,w*0.8,0.45,0.55,0,1.15,-0.55,'#3b3b3b');gbBox(B,0.5,0.05,0.05,0,1.42,h2-0.55,TRIM);
    lamp(0,1.12,h2+0.02,0.2,0.16,'#fff3d0');for(const sx of[-1,1])lamp(sx*w*0.4,0.7,-h2-0.01,0.12,0.1,'#b81d18');
    wheel(0,0.28,h2-0.35,0.28,0.18);wheel(-w/2+0.08,0.3,-h2+0.55,0.3,0.2);wheel(w/2-0.08,0.3,-h2+0.55,0.3,0.2)}
  else if(type==='bus'){const h2=L/2;gbM(B,profileGeo([[-h2,0.5],[h2,0.5],[h2,2.6],[h2-0.15,3.0,h2-0.4,3.05],[-h2+0.3,3.05],[-h2,3.0,-h2,2.7]],w,0.1),new THREE.Matrix4(),'#efe2c2');
    gbBox(B,w+0.04,1.25,L,0,1.15,0,color);gbBox(B,w+0.05,0.75,L*0.86,0,2.25,-0.3,GLASS);gbBox(B,w*0.92,1.05,0.06,0,2.15,h2+0.03,GLASS);for(let k=0;k<9;k++)gbBox(B,w+0.06,0.75,0.08,0,2.25,-h2+0.8+k*1.1,'#efe2c2');
    gbBox(B,w+0.06,0.06,L,0,2.95,0,color);for(const sx of[-1,1])lamp(sx*0.85,0.9,h2+0.04,0.32,0.18,'#fff3d0'),lamp(sx*1.0,0.9,-h2-0.03,0.2,0.3,'#b81d18');
    const rb=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.3),routeBoard());rb.position.set(0,2.8,h2+0.06);g.add(rb);
    for(const sx of[-1,1])for(const z of[-L*0.33,L*0.3])wheel(sx*(w/2-0.12),0.5,z,0.5,0.3,'#5b6066')}
  else if(type==='lorry'){const h2=L/2;gbM(B,profileGeo([[h2-2.5,0.6],[h2,0.6],[h2+0.05,1.6,h2-0.05,2.3],[h2-0.3,2.8],[h2-2.5,2.8]],w,0.1),new THREE.Matrix4(),color);
    gbBox(B,w*0.88,0.85,0.05,0,2.1,h2+0.02,GLASS,-0.08,0,0);for(const[c,y]of[['#d62828',2.95],['#2b9348',3.1],['#f2c200',3.25]])gbBox(B,w+0.02,0.14,0.3,0,y,h2-0.25,c);
    gbBox(B,w,1.6,5.6,0,1.75,-1.3,'#7d5a3c');for(let k=0;k<6;k++)gbBox(B,w+0.02,1.5,0.06,0,1.75,-3.9+k*1.05,'#5d4030');gbBox(B,w+0.05,0.55,5.6,0,2.83,-1.3,'#2e7d32');gbBox(B,w,0.3,L,0,0.75,0,'#222');
    for(const sx of[-1,1])lamp(sx*0.8,1.0,h2+0.04,0.36,0.2,'#fff3d0'),lamp(sx*1.0,0.9,-h2-0.03,0.2,0.2,'#b81d18');
    for(const sx of[-1,1])for(const z of[L*0.33,-L*0.15,-L*0.35])wheel(sx*(w/2-0.12),0.5,z,0.5,0.32,'#5b6066')}
  else if(s.two){const h2=L/2;const cyc=!!s.cycle,r=cyc?0.34:type==='scooter'||type==='retro'?0.25:type==='moped'?0.28:0.33,zw=cyc?0.55:h2-0.35,rimC=cyc?'#bbbbbb':type==='cruiser'?'#222':'#9aa0a6',tw=cyc?0.05:type==='cruiser'?0.16:0.12;
    wheel(0,r,zw,r,tw,rimC);wheel(0,r,-zw,r,tw,rimC);
    if(cyc){const F=color;gbTube(B,[0,r,-zw],[0,0.72,-0.08],0.022,F);gbTube(B,[0,r,-zw],[0,0.42,0.02],0.022,F);gbTube(B,[0,0.42,0.02],[0,0.74,-0.12],0.025,F);gbTube(B,[0,0.42,0.02],[0,0.78,0.45],0.025,F);gbTube(B,[0,0.72,-0.08],[0,0.8,0.44],0.022,F);
      gbTube(B,[0,r,zw],[0,0.95,0.48],0.02,CHROME);gbTube(B,[-0.28,0.98,0.45],[0.28,0.98,0.45],0.015,TRIM);gbBox(B,0.13,0.05,0.24,0,0.82,-0.13,TRIM);gbTube(B,[-0.12,0.42,0.02],[0.12,0.42,0.02],0.02,TRIM);
      if(Math.random()<0.35)gb(B,CY(0.13,0.11,0.32,10),0.18,0.7,-0.45,'#c9ced3'),gb(B,CY(0.13,0.11,0.32,10),-0.18,0.7,-0.45,'#c9ced3');else if(Math.random()<0.4)gbBox(B,0.32,0.22,0.26,0,0.95,0.62,'#a0522d')}
    else if(type==='scooter'||type==='retro'){const rt=type==='retro';gbM(B,profileGeo([[0.3,0.32],[h2-0.25,0.32],[h2-0.1,0.6,h2-0.05,1.0],[h2-0.22,1.08],[0.3,0.42]],0.42,0.06),new THREE.Matrix4(),color);
      if(rt)gb(B,GEO.sph16,0,0.62,-0.42,color,0,0,0,0.3,0.28,0.5);else gbM(B,profileGeo([[-h2+0.05,0.5],[0.25,0.38],[0.3,0.78],[-h2+0.1,0.85]],0.44,0.06),new THREE.Matrix4(),color);
      gbBox(B,0.3,0.1,0.62,0,0.92,-0.38,TRIM);gbTube(B,[-0.32,1.15,h2-0.18],[0.32,1.15,h2-0.18],0.02,TRIM);gbTube(B,[0,1.05,h2-0.15],[0,0.32,h2-0.35],0.03,TRIM);
      lamp(0,rt?1.05:0.98,h2+0.02,0.14,0.1,'#fff3d0');lamp(0,0.75,-h2-0.01,0.14,0.06,'#b81d18');if(rt)gb(B,CY(0.09,0.09,0.06,12),0,1.05,h2-0.04,CHROME,Math.PI/2,0,0)}
    else if(type==='moped'){gbTube(B,[0,r,zw],[0,1.05,h2-0.2],0.03,TRIM);gbTube(B,[0,1.0,h2-0.25],[0,0.4,-0.1],0.04,color);gbTube(B,[0,0.4,-0.1],[0,r,-zw],0.03,color);gbTube(B,[0,0.4,-0.1],[0,0.82,-0.3],0.035,color);
      gbBox(B,0.26,0.08,0.4,0,0.86,-0.32,TRIM);gbBox(B,0.34,0.05,0.42,0,0.88,-0.72,TRIM);gb(B,CY(0.11,0.11,0.25,10),0,0.45,-0.35,color,0,0,Math.PI/2);gbTube(B,[-0.3,1.08,h2-0.2],[0.3,1.08,h2-0.2],0.02,TRIM);
      if(Math.random()<0.4)gb(B,CY(0.14,0.12,0.34,10),0.2,0.98,-0.72,'#c9ced3'),gb(B,CY(0.14,0.12,0.34,10),-0.2,0.98,-0.72,'#c9ced3');lamp(0,1.0,h2-0.12,0.12,0.1,'#fff3d0')}
    else{const cr=type==='cruiser',sp=type==='sports';
      gbTube(B,[0,r,zw],[0,cr?1.12:1.0,h2-(cr?0.2:0.3)],cr?0.04:0.035,CHROME);gbTube(B,[0,0.5,-0.25],[0,cr?0.95:0.92,h2-0.35],0.05,TRIM);gbTube(B,[0,0.5,-0.25],[0,r,-zw],0.04,TRIM);
      if(sp){gbM(B,profileGeo([[0.1,0.55],[h2-0.15,0.6],[h2+0.05,0.85,h2-0.1,1.05],[0.5,1.12],[0.1,0.95]],0.5,0.06),new THREE.Matrix4(),color);gbM(B,profileGeo([[-0.2,0.85],[-h2+0.1,0.95],[-h2,1.1],[-0.25,1.0]],0.36,0.05),new THREE.Matrix4(),color);gbBox(B,0.24,0.06,0.42,0,1.0,-0.2,TRIM)}
      else{gb(B,GEO.sph16,0,0.98,0.18,color,0,0,0,0.19,0.13,cr?0.38:0.3);gbBox(B,0.28,0.1,cr?0.75:0.6,0,0.94,-0.35,cr?'#3b2a20':TRIM);if(cr)gbBox(B,0.24,0.08,0.3,0,1.04,-0.58,'#3b2a20');gbBox(B,0.24,0.28,0.32,0,0.62,-0.05,'#3b3b3b')}
      gbTube(B,[0.14,0.42,-0.1],[0.16,cr?0.5:0.6,-h2+(cr?0.0:0.1)],cr?0.05:0.045,CHROME);
      const hb=cr?0.42:sp?0.3:0.36;gbTube(B,[-hb,cr?1.25:1.05,h2-(cr?0.25:0.32)],[hb,cr?1.25:1.05,h2-(cr?0.25:0.32)],0.022,cr?CHROME:TRIM);
      if(!sp){gb(B,CY(0.1,0.1,0.08,14),0,cr?1.05:0.98,h2-0.15,CHROME,Math.PI/2,0,0);lamp(0,cr?1.05:0.98,h2-0.1,0.13,0.13,'#fff3d0')}else lamp(0,0.9,h2+0.03,0.18,0.08,'#fff3d0');
      lamp(0,0.85,-h2+(sp?0.02:0.1),0.14,0.07,'#b81d18')}
    for(const z of[zw,-zw])if(!cyc)gbBox(B,0.16,0.04,0.5,0,r*2+0.04,z,shade(color,0.85))}
  else if(s.boat){const h2=L/2,bw=w/2;
    const hull=type==='speedboat'?[[-bw,-h2],[bw,-h2],[bw,h2*0.35],[0.05,h2,0,h2],[-0.05,h2,-bw,h2*0.35]]:type==='fishboat'?[[-bw,-h2+0.6],[-bw*0.5,-h2,0,-h2],[bw*0.5,-h2,bw,-h2+0.6],[bw,h2*0.3],[0.05,h2,0,h2],[-0.05,h2,-bw,h2*0.3]]:[[-bw,-h2+0.3],[0,-h2-0.05],[bw,-h2+0.3],[bw,h2*0.4],[0,h2],[-bw,h2*0.4]];
    const hh=type==='speedboat'?0.9:type==='fishboat'?1.1:0.55;gbM(B,topGeo(hull,hh,0.08),new THREE.Matrix4().makeTranslation(0,-0.45,0),type==='speedboat'?'#f4f4f4':type==='fishboat'?color||'#2f6fb0':'#8b5a2b');
    if(type==='speedboat'){gbBox(B,w+0.06,0.12,L*0.8,0,0.1,-0.2,'#1d4ed8');gbBox(B,w-0.3,0.06,L*0.75,0,0.47,-0.3,'#c8b89a');gbBox(B,w-0.4,0.45,0.05,0,0.75,h2*0.25,GLASS,-0.5,0,0);for(const sx of[-0.45,0.45])gbBox(B,0.5,0.4,0.5,sx,0.7,-0.4,'#ececec');gbBox(B,0.35,0.9,0.4,0,0.4,-h2-0.1,'#222')}
    else if(type==='fishboat'){gbBox(B,w+0.04,0.18,L*0.9,0,0.55,0,'#f4f4f4');gbBox(B,1.5,1.3,1.8,0,1.3,-1.4,'#f1faee');gbBox(B,1.6,0.1,1.9,0,2.0,-1.4,'#c1121f');gbBox(B,1.3,0.35,0.05,0,1.55,-0.48,GLASS);gbTube(B,[0,0.6,1.2],[0,4.2,1.2],0.06,'#6d4c41');gbBox(B,1.0,0.6,1.6,0,0.85,1.6,'#7a5536')}
    else{gbBox(B,w-0.2,0.06,0.3,0,0.05,0.2,'#6d4c41');gbBox(B,w-0.2,0.06,0.3,0,0.05,-0.6,'#6d4c41');for(const sx of[-1,1])gbTube(B,[sx*0.6,0.15,0],[sx*1.4,-0.2,0.2],0.03,'#a0522d')}
    lamp(0,type==='fishboat'?2.1:0.6,h2*0.6,0.12,0.12,'#fff3d0')}
  else if(type==='tank'){const c='#4b5d2a';gbBox(B,w-1.2,1.0,L,0,1.05,0,c);gbBox(B,w-1.0,0.3,L*0.6,0,1.65,-0.4,'#3f4f22');
    for(const sx of[-1,1]){gbBox(B,0.75,1.0,L+0.3,sx*(w/2-0.38),0.55,0,'#262626');for(let k=-3;k<=3;k++)gbBox(B,0.8,0.12,0.25,sx*(w/2-0.38),1.08,k*1.05,'#3a3a3a')}
    turret=new THREE.Group();turret.position.set(0,1.8,-0.5);g.add(turret);const T=GB();gbBox(T,2.3,0.8,2.9,0,0.4,0,c);gb(T,GEO.cyl,0,0.45,3.2,'#3d4a22',Math.PI/2,0,0,0.17,3.8,0.17);turret.add(gbMesh(T))}
  const body=gbMesh(B);g.add(body);g.userData.body=body;if(LB.pos.length){const lm=gbMesh(LB,VCB,false);g.add(lm)}
  return{g,wheels,lights,turret}}


function driveUpdate(v,dt){const s=v.s;
  let thr=(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0),st=(K.KeyA||K.ArrowLeft?1:0)-(K.KeyD||K.ArrowRight?1:0);if(joy.on){thr=joy.y<-0.25?1:joy.y>0.3?-1:0;st=Math.abs(joy.x)>0.12?-joy.x:0}
  if(thr>0)v.speed+=(v.speed<0?s.brake:s.acc*(1-Math.max(0,v.speed)/s.max*0.6))*dt;
  else if(thr<0){v.speed-=(v.speed>0.5?s.brake:s.acc*0.7)*dt;if(v.speed<-s.max*0.35)v.speed=-s.max*0.35}
  else{v.speed*=Math.max(0,1-0.35*dt);if(Math.abs(v.speed)<0.3)v.speed=0}
  if(K.Space)v.speed*=Math.max(0,1-1.6*dt);
  if(v.speed>s.max)v.speed=s.max;if(v.flat){if(v.speed>s.max*0.7)v.speed-=s.acc*1.5*dt;v.heading+=v.flat*0.12*dt*Math.min(1,Math.abs(v.speed)/8)}
  const sf=Math.min(1,Math.abs(v.speed)/5)*(1-Math.min(0.45,Math.abs(v.speed)/s.max*0.45));
  v.heading+=st*s.steer*sf*dt*(v.speed<0?-1:1)*(K.Space?1.6:1);
  if(v.turret)v.turret.rotation.y+=angDiff(v.turret.rotation.y,camYaw-v.heading)*Math.min(1,dt*4)}
const _p={x:0,z:0};
function integrate(v,dt){const fx=Math.sin(v.heading),fz=Math.cos(v.heading),lx=fz,lz=-fx;
  let lat=v.vx*lx+v.vz*lz;const grip=(v.wrecked?2.5:(v===player.vehicle&&K.Space)?1.4:v.s.grip)*(1-0.45*rainF);lat*=Math.exp(-grip*dt);
  v.vx=fx*v.speed+lx*lat;v.vz=fz*v.speed+lz*lat;
  if(v.av){v.heading+=v.av*dt;v.av*=Math.exp(-3.2*dt);if(Math.abs(v.av)<0.01)v.av=0}
  if(Math.abs(v.vx)+Math.abs(v.vz)>0.002){v.pos.x+=v.vx*dt;v.pos.z+=v.vz*dt;
    if(v.s.boat&&!v.wrecked){const bx=v.pos.x+Math.sin(v.heading)*v.s.len*0.45*Math.sign(v.speed||1),bz=v.pos.z+Math.cos(v.heading)*v.s.len*0.45*Math.sign(v.speed||1);if(!inLake(bx,bz)&&seaDepth(bx,bz)<0.7){v.pos.x-=v.vx*dt;v.pos.z-=v.vz*dt;v.vx*=-0.25;v.vz*=-0.25;v.speed*=-0.25}}
    const f2x=Math.sin(v.heading),f2z=Math.cos(v.heading);let sx=0,sz=0,hit=false;
    for(const off of v.s.circ){_p.x=v.pos.x+f2x*off;_p.z=v.pos.z+f2z*off;const ox=_p.x,oz=_p.z;if(pushCircle(_p,v.s.cr,v.y,2.4)){v.pos.x+=_p.x-ox;v.pos.z+=_p.z-oz;sx+=pnx;sz+=pnz;hit=true}}
    if(hit){const l=Math.hypot(sx,sz)||1,nx=sx/l,nz=sz/l,vn=v.vx*nx+v.vz*nz;
      if(vn<0){v.vx-=1.2*vn*nx;v.vz-=1.2*vn*nz;v.vx*=0.9;v.vz*=0.9;const imp=-vn;
        if(imp>3)v.av+=RR(-1,1)*imp*0.04;
        if(imp>7){if(!(v===player.vehicle&&cheatIron)&&v.type!=='tank'){damageVehicle(v,(imp-7)*11,'crash');dentVehicle(v,v.pos.x-nx*3,v.pos.z-nz*3,(imp-7)*0.05)}
          if(v===player.vehicle){shake=Math.max(shake,Math.min(0.8,imp/25));noise(0.3,900,Math.min(0.55,imp/40),2);sparks(v.pos.x+f2x*v.s.len/2,v.y+0.7,v.pos.z+f2z*v.s.len/2,6);if(v.s.two&&imp>9)ejectBike(imp)}}}}}
  const fx2=Math.sin(v.heading),fz2=Math.cos(v.heading);v.speed=v.vx*fx2+v.vz*fz2;
  vertical(v,dt);v.mesh.rotation.y=v.heading;
  if(!v.s.boat&&!(v.sink>0)){const fx4=Math.sin(v.heading),fz4=Math.cos(v.heading),hl=Math.max(1,v.s.len*0.4);const hf=surfaceH(v.pos.x+fx4*hl,v.pos.z+fz4*hl,v.y+1.5),hb=surfaceH(v.pos.x-fx4*hl,v.pos.z-fz4*hl,v.y+1.5);
    const gr=(hf-hb)/(2*hl);if(Math.abs(gr)<1.2&&v.vy===0){v.mesh.rotation.x=-Math.atan(gr);if(!v.wrecked)v.speed-=9.8*gr*0.7*dt}else v.mesh.rotation.x*=0.9;
    if(!v.s.two){const hl2=surfaceH(v.pos.x+fz4*v.s.w*0.5,v.pos.z-fx4*v.s.w*0.5,v.y+1.5),hr2=surfaceH(v.pos.x-fz4*v.s.w*0.5,v.pos.z+fx4*v.s.w*0.5,v.y+1.5);const rl=(hl2-hr2)/v.s.w;v.mesh.rotation.z=Math.abs(rl)<1?Math.atan(rl)*0.8:0}}const wr=v.speed*dt/0.36;for(const w of v.wheels)w.rotation.x+=wr;
  if(v.s.two){const dh=angDiff(v.prevH,v.heading)/Math.max(dt,1e-3);v.lean+=(clamp(-dh*0.2*(Math.abs(v.speed)>2?1:0),-0.45,0.45)-v.lean)*Math.min(1,dt*6);v.mesh.rotation.z=v.lean}v.prevH=v.heading}
function vertical(v,dt){
  if(v.s.boat){const fx=Math.sin(v.heading),fz=Math.cos(v.heading),lk=inLake(v.pos.x,v.pos.z),wl=p=>lk?0.22:waveY(p[0],p[1]);const hl=v.s.len*0.4;
    const yc=wl([v.pos.x,v.pos.z]),yb=wl([v.pos.x+fx*hl,v.pos.z+fz*hl]),ys=wl([v.pos.x-fx*hl,v.pos.z-fz*hl]),yl=wl([v.pos.x+fz,v.pos.z-fx]),yr=wl([v.pos.x-fz,v.pos.z+fx]);
    v.y=yc+0.12+(v.wrecked?-1.2:0);v.mesh.position.y=v.y;v.mesh.rotation.x=-Math.atan2(yb-ys,hl*2)-Math.min(0.12,Math.abs(v.speed)*0.004);v.mesh.rotation.z=(yl-yr)*0.35;
    if(Math.abs(v.speed)>4&&Math.random()<dt*6)puff(new THREE.Vector3(v.pos.x-fx*v.s.len/2+RR(-0.5,0.5),yc+0.1,v.pos.z-fz*v.s.len/2+RR(-0.5,0.5)),0xffffff,0.12);return}
  if(v.sink>0){const wl=inLake(v.pos.x,v.pos.z)?0.22:waveY(v.pos.x,v.pos.z);v.mesh.position.y=wl-0.55-Math.min(3.2,Math.max(0,v.sink-1.6)*0.9)+(v.sink<1.6?Math.sin(time*2.4)*0.08:0);v.mesh.rotation.z=Math.sin(time*1.3)*0.05*(v.sink<1.6?1:0);return}
  const sh=surfaceH(v.pos.x,v.pos.z,v.y);
  if(v.y>sh+0.08){v.vy-=22*dt;v.y+=v.vy*dt;if(v.y<=sh){if(v.vy<-11&&!v.wrecked&&!(v===player.vehicle&&cheatIron))damageVehicle(v,(-v.vy-11)*25,'crash');if(v===player.vehicle&&v.vy<-8){shake=Math.max(shake,0.4);noise(0.3,600,0.4,2)}v.y=sh;v.vy=0}}
  else{v.y=sh;v.vy=0}
  v.mesh.position.y=v.y}
function ejectBike(imp){const v=player.vehicle;if(!v||!v.s.two)return;exitVehicle();player.vy=5;playerDamage(Math.min(40,imp*1.2));floatMsg('Thrown off the '+v.s.name+'!')}
let lastCopBump=-99;
function collideVehicles(){const n=vehicles.length;
  for(let a=0;a<n;a++){const A=vehicles[a];for(let b=a+1;b<n;b++){const B=vehicles[b];
    const qx=A.pos.x-B.pos.x,qz=A.pos.z-B.pos.z,rr=(A.s.len+B.s.len)/2+1;if(qx>rr||qx<-rr||qz>rr||qz<-rr||Math.abs(A.y-B.y)>2.5)continue;
    const fax=Math.sin(A.heading),faz=Math.cos(A.heading),fbx=Math.sin(B.heading),fbz=Math.cos(B.heading);
    for(const oa of A.s.circ)for(const ob of B.s.circ){const ax=A.pos.x+fax*oa,az=A.pos.z+faz*oa,bx=B.pos.x+fbx*ob,bz=B.pos.z+fbz*ob;
      const dx=ax-bx,dz=az-bz,mn=A.s.cr+B.s.cr,d2=dx*dx+dz*dz;if(d2>=mn*mn||d2<1e-8)continue;
      const d=Math.sqrt(d2),nx=dx/d,nz=dz/d,pen=mn-d,ia=1/A.s.mass,ib=1/B.s.mass,sum=ia+ib;
      A.pos.x+=nx*pen*ia/sum;A.pos.z+=nz*pen*ia/sum;B.pos.x-=nx*pen*ib/sum;B.pos.z-=nz*pen*ib/sum;
      const rv=(A.vx-B.vx)*nx+(A.vz-B.vz)*nz;if(rv>=0)continue;
      const j=-1.3*rv/sum;A.vx+=nx*j*ia;A.vz+=nz*j*ia;B.vx-=nx*j*ib;B.vz-=nz*j*ib;
      const ca=(fax*nz-faz*nx)*oa,cb=(fbx*nz-fbz*nx)*ob;
      A.av=clamp(A.av-ca*j*ia*6/(A.s.len*A.s.len),-4,4);B.av=clamp(B.av+cb*j*ib*6/(B.s.len*B.s.len),-4,4);
      onCrash(A,B,-rv,(ax+bx)/2,(az+bz)/2)}}}
  for(const v of vehicles)v.speed=v.vx*Math.sin(v.heading)+v.vz*Math.cos(v.heading)}
function onCrash(A,B,imp,x,z){if(imp<3)return;const pv=player.vehicle,inv=A===pv||B===pv;
  if(!inv&&A.ai&&B.ai)return;
  if(imp>5){const ma=A.s.mass,mb=B.s.mass;let dA=(imp-5)*16*mb/(ma+mb)*1.3,dB=(imp-5)*16*ma/(ma+mb)*1.3;if(A.type==='tank')dB*=5;if(B.type==='tank')dA*=5;if(A.type==='tank')dA=0;if(B.type==='tank')dB=0;
    if(!(A===pv&&cheatIron))damageVehicle(A,dA,B===pv?'player':'crash');if(!(B===pv&&cheatIron))damageVehicle(B,dB,A===pv?'player':'crash');if(!(A===pv&&cheatIron))dentVehicle(A,x,z,(imp-5)*0.04);if(!(B===pv&&cheatIron))dentVehicle(B,x,z,(imp-5)*0.04)}
  if(inv){noise(0.3,800,clamp(imp/35,0.08,0.6),2);shake=Math.max(shake,Math.min(0.7,imp/28));if(imp>5)sparks(x,0.8,z,Math.min(12,Math.round(imp/2)));
    if(pv&&pv.s.two&&imp>9)ejectBike(imp);const o=A===pv?B:A;if(o.policeAI&&imp>7&&time-lastCopBump>6){lastCopBump=time;addWanted(1)}if(o.ai){o.ai.hitT=2.5;hornAt(o.pos)}}}
function vehHitsPeople(v){const sp=Math.hypot(v.vx,v.vz);if(sp<4||v.y>2)return;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);const byP=v===player.vehicle;
  for(const off of v.s.circ){const cx=v.pos.x+fx*off,cz=v.pos.z+fz*off,r=v.s.cr+0.45;
    const fl=()=>({vx:v.vx*0.9+RR(-2,2),vy:3+sp*0.25,vz:v.vz*0.9+RR(-2,2)});
    for(const p of peds){if(!p.dead&&!p.hidden&&Math.abs(p.x-cx)<r&&Math.abs(p.z-cz)<r&&Math.hypot(p.x-cx,p.z-cz)<r){killPed(p,byP,fl());v.speed*=0.95;if(byP)noise(0.15,500,0.3,2)}}
    for(const g of goons){if(!g.dead&&Math.hypot(g.x-cx,g.z-cz)<r){damageGoon(g,sp*22,byP,fl());v.speed*=0.95}}
    for(const f of FRIENDS){if(f.inCar)continue;if(Math.hypot(f.x-cx,f.z-cz)<r&&sp>6){f.x+=fx*2;f.z+=fz*2;if(byP&&time-f.hitT>3){f.hitT=time;f.fr=Math.max(0,f.fr-5);floatMsg(f.name+': Hey! Watch it!')}}}
    if(!byP&&!player.vehicle&&!player.dead&&Math.hypot(player.pos.x-cx,player.pos.z-cz)<r){playerDamage(sp*1.4);player.pos.x+=fx*1.5;player.pos.z+=fz*1.5;player.vy=4;knockDown(1.2)}}}

function updateVehicles(dt){const P=playerP();
  for(let i=vehicles.length-1;i>=0;i--){const v=vehicles[i];
    if(!v.s.boat&&v.pos.x>SHORE-8&&!v.sunk&&seaDepth(v.pos.x,v.pos.z)>0.25&&seaDepth(v.pos.x,v.pos.z)<0.9){v.speed*=Math.exp(-1.2*dt);if(Math.abs(v.speed)>2&&Math.random()<dt*10)puff(new THREE.Vector3(v.pos.x,0.3,v.pos.z),0xffffff,0.4)}
    if(!v.s.boat&&!v.sunk&&isDeep(v.pos.x,v.pos.z)&&v.y<1.5){v.sink+=dt;v.speed*=Math.exp(-2.5*dt);v.vx*=Math.exp(-2.5*dt);v.vz*=Math.exp(-2.5*dt);if(Math.random()<dt*8)puff(new THREE.Vector3(v.pos.x+RR(-1,1),0.3,v.pos.z+RR(-1,1)),0xffffff,0.3);
      if(v===player.vehicle&&v.sink>1.4){exitVehicle();floatMsg('Your ride sank! Swim to the shore')}if(v.sink>3){v.sunk=true;v.wrecked=true;v.wreckT=20;v.ai=null;v.policeAI=null}}
    if(v.wrecked){v.wreckT+=dt;v.speed*=Math.max(0,1-1.5*dt);if(v.wreckT<6&&Math.random()<dt*6)smoke(v.pos.x,1.5,v.pos.z);
      if(v.wreckT>45&&Math.hypot(v.pos.x-P.x,v.pos.z-P.z)>90)removeVehicle(v);continue}
    if(v===player.vehicle)driveUpdate(v,dt);else if(v.policeAI)updPolice(v,dt);else if(v.ai)updAI(v,dt);
    else{v.speed*=Math.max(0,1-2.5*dt);if(Math.abs(v.speed)<0.05)v.speed=0}}
  for(const v of vehicles)integrate(v,dt);
  collideVehicles();
  for(const v of vehicles)if(v.rider&&v.s.cycle&&v.rider.g.visible){v.pedal=(v.pedal||0)+v.speed*dt*1.6;pedalPose(v.rider,v.pedal)}
  for(const v of vehicles){if(v.wrecked)continue;
    if(v===player.vehicle||v.policeAI||(v.ai&&v.ai.reckless)||!v.ai)vehHitsPeople(v);
    if(v.lights.length){const on=Math.floor(time*6)%2===0,act=v.policeAI||v===player.vehicle||v.type==='ambulance';v.lights[0].visible=on||!act;v.lights[1].visible=!on||!act}
    if(v.hp<v.s.hp*0.35){v.smokeT-=dt;if(v.smokeT<=0){v.smokeT=0.12;smoke(v.pos.x+Math.sin(v.heading)*v.s.len*0.4,1.2,v.pos.z+Math.cos(v.heading)*v.s.len*0.4)}}
    if(v.hp<v.s.hp*0.12){v.burn+=dt;if(Math.random()<dt*12)smoke(v.pos.x+Math.sin(v.heading)*v.s.len*0.35,1.4,v.pos.z+Math.cos(v.heading)*v.s.len*0.35,0xff7b1a);
      if(v===player.vehicle&&v.burn<0.1)toast('ON FIRE!',isTouch?'Get out (EXIT)!':'Get out (E)!',1.5);if(v.burn>5)explode(v,v.lastSrc)}}
  let ai=0;for(const v of vehicles)if(v.ai&&!v.ai.reckless)ai++;
  trafficT-=dt;if(ai<AI_TARGET&&trafficT<=0){trafficT=0.6;spawnAI(aiType(),120)}
  if(vehicles.length>80){let far=null,fd=150;for(const v of vehicles){if(v.ai||v.policeAI||v===player.vehicle||v.keep)continue;const d=Math.hypot(v.pos.x-P.x,v.pos.z-P.z);if(d>fd){fd=d;far=v}}if(far)removeVehicle(far)}}
let AI_TARGET=QS.traffic;let trafficT=0;


/* ---------- visible vehicle damage ---------- */
const _GL=new THREE.Color(GLASS);
function dentVehicle(v,wx,wz,amt){if(!(amt>0.01)||v.s.boat||v.type==='tank'||v.wrecked)return;const body=v.mesh.userData.body;if(!body)return;v.dentTot=v.dentTot||0;if(v.dentTot>1.4)return;amt=Math.min(amt,0.35);v.dentTot+=amt;
  const c=Math.cos(v.heading),s=Math.sin(v.heading),dx=wx-v.pos.x,dz=wz-v.pos.z;const lx=clamp(dx*c-dz*s,-v.s.w/2,v.s.w/2),lz=clamp(dx*s+dz*c,-v.s.len/2,v.s.len/2);
  const pa=body.geometry.attributes.position,a=pa.array,R=Math.max(0.8,v.s.w*0.55);
  for(let i=0;i<a.length;i+=3){const d=Math.hypot(a[i]-lx,a[i+2]-lz);if(d>R)continue;const f=(1-d/R)*amt,l=Math.hypot(a[i],a[i+2])||1;a[i]-=a[i]/l*f*0.7;a[i+2]-=a[i+2]/l*f*0.7;if(a[i+1]>0.9)a[i+1]-=f*0.25}
  pa.needsUpdate=true;body.geometry.computeVertexNormals()}
function vehDamageFX(v){if(v.wrecked||v.s.boat||v.type==='tank')return;const r=v.hp/v.s.hp,body=v.mesh.userData.body;
  if(r<0.55&&!v.glassBroke&&body){v.glassBroke=true;const ca=body.geometry.attributes.color,a=ca.array;for(let i=0;i<a.length;i+=9){if(Math.abs(a[i]-_GL.r)<0.02&&Math.abs(a[i+1]-_GL.g)<0.02&&Math.abs(a[i+2]-_GL.b)<0.02){const k=RR(0.35,0.6);for(let q=0;q<9;q+=3){a[i+q]=k;a[i+q+1]=k+0.04;a[i+q+2]=k+0.08}}}ca.needsUpdate=true;if(v===player.vehicle)floatMsg('Windows smashed!')}
  if(r<0.3&&!v.flat&&!v.s.two&&v.wheels.length>=3){const w=rpick(v.wheels);w.scale.set(1,0.8,0.8);w.position.y-=0.08;v.flat=w.position.x>0?-1:1;if(v===player.vehicle)floatMsg('Flat tyre! The car pulls to one side')}}

/* ---------- passenger seats ----------
   n: how many passengers fit besides the driver. visible: passengers are drawn sitting on the vehicle (two-wheelers);
   otherwise they ride hidden inside. p: pillion position in vehicle space (feet origin), behind the rider at z=-0.2. */
const PILLION={bike:{y:0.14,z:-0.62},cruiser:{y:0.12,z:-0.68},sports:{y:0.3,z:-0.55},scooter:{y:0.16,z:-0.6},retro:{y:0.16,z:-0.58},moped:{y:0.14,z:-0.62},cycle:{y:0.02,z:-0.56}};
function seatsOf(v){if(v.s.two)return{n:1,visible:true,p:PILLION[v.type]||PILLION.bike};if(v.type==='bus')return{n:20,visible:false};if(v.type==='tank')return{n:2,visible:false};return{n:3,visible:false}}
