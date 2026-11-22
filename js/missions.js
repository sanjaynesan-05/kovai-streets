/* Kovai Streets: missions.js
 * Jobs, story campaign stage framework, film reels, stunt jumps, rampages
 * Classic script, loaded in order by index.html (10 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= jobs ================= */
const JOBT={deliver:{c:'#ffd23f',L:'D',name:'Delivery'},race:{c:'#33d6ff',L:'R',name:'Street race'},gang:{c:'#ff4d4d',L:'G',name:'Gang clean-up'},
  boss:{c:'#c86bfa',L:'B',name:'Take down a gang boss'},chase:{c:'#ff8c1a',L:'C',name:'Getaway chase'},fare:{c:'#3ddc84',L:'F',name:'Passenger fare'},amb:{c:'#ffffff',L:'+',name:'Emergency run'}};
const GOODS=['wet-grinder parts','cotton yarn bales','pump-set motors','handloom silk sarees','jasmine garlands for a wedding','sacks of filter-coffee powder','hot parcels of biryani','a crate of Siruvani water cans'];
const BOSSES=['Kaala Kumar','Bullet Babu','Scrap Selvam','Mill Mani','Tiger Thangam'];
let offers=[],mission=null,offerT=2,needVehT=-99;
const beamGeo=new THREE.CylinderGeometry(2.6,2.6,70,20,1,true);beamGeo.translate(0,35,0);
const offerBeams=[0,1,2].map(()=>{const m=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3,depthWrite:false,side:THREE.DoubleSide}));m.visible=false;scene.add(m);return m});
const marker=new THREE.Group();
{const beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:0.3,depthWrite:false,side:THREE.DoubleSide}));marker.add(beam);
 const ring=new THREE.Mesh(new THREE.RingGeometry(2.3,3.1,32),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:0.85,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=0.3;marker.add(ring);
 marker.visible=false;scene.add(marker)}
function roadPoint(nx,nz,minD,maxD){let p=null;for(let t=0;t<300;t++){const i=RI(-NB,NB),j=RI(-NB,NB);const[dx,dz]=rpick(DIRS);if(!inGrid(i+dx,j+dz))continue;const tt=RR(18,56);
  const q={x:i*CELL+dx*tt+dz*5.2,z:j*CELL+dz*tt-dx*5.2};const d=Math.hypot(q.x-nx,q.z-nz);p=q;if(d>=minD&&d<=maxD)return q}return p}
const r50=n=>Math.round(n/50)*50;
function addOffer(){const pool=Object.keys(JOBT).filter(t=>!offers.some(o=>o.type===t)&&respectLv()>=(JOB_LV[t]||1));const t=rpick(pool);const P=playerP();
  let A;for(let k=0;k<10;k++){A=roadPoint(P.x,P.z,70,360);if(!offers.some(o=>Math.hypot(o.x-A.x,o.z-A.z)<60))break}offers.push({type:t,x:A.x,z:A.z,born:time})}
function updateOffers(dt){
  if(mission){offerBeams.forEach(b=>b.visible=false);return}
  if(offers.length<3){offerT-=dt;if(offerT<=0){offerT=0.5;addOffer()}}
  offerBeams.forEach((b,i)=>{const o=offers[i];b.visible=!!o;if(o){b.position.set(o.x,groundH(o.x,o.z),o.z);b.material.color.set(JOBT[o.type].c)}});
  const P=playerP();
  for(let i=0;i<offers.length;i++){const o=offers[i];const d=Math.hypot(P.x-o.x,P.z-o.z);
    if(d>700||(time-o.born>240&&d>200)){offers.splice(i,1);break}
    if(d<5.5&&!player.dead){if((o.type==='fare'||o.type==='amb')&&!player.vehicle){if(time-needVehT>3){needVehT=time;floatMsg('You need a vehicle for this job')}continue}
      offers.splice(i,1);startMission(o);break}}}
function startMission(o){const T=JOBT[o.type],mult=1+rep*0.08;let m={type:o.type,title:T.name,step:0,timer:null,steps:[]};
  if(o.type==='deliver'){const B=roadPoint(o.x,o.z,250,560);const goods=rpick(GOODS);const dist=Math.hypot(B.x-o.x,B.z-o.z);
    Object.assign(m,{reward:r50((dist*4+600)*mult),steps:[{...B,txt:`Rush the ${goods} to ${district(B.x,B.z)}`}],timer:Math.round(dist/12+22)});toast('PICKED UP',goodsCap(goods),2)}
  else if(o.type==='race'){let i=Math.round(o.x/CELL),j=Math.round(o.z/CELL),pd=null,len=0,px=o.x,pz=o.z;
    for(let k=0;k<7;k++){const opts=DIRS.filter(d=>inGrid(i+d[0],j+d[1])&&!(pd&&d[0]===-pd[0]&&d[1]===-pd[1]));const d=rpick(opts.length?opts:DIRS);pd=d;i+=d[0];j+=d[1];
      const q={x:i*CELL,z:j*CELL};len+=Math.hypot(q.x-px,q.z-pz);px=q.x;pz=q.z;m.steps.push({...q,txt:`Checkpoint ${m.steps.length+1} of 7`})}
    Object.assign(m,{reward:r50(2000*mult),timer:Math.round(len/17+8)});toast('GO!','Hit every checkpoint',1.5)}
  else if(o.type==='gang'){m.left=0;for(let k=0;k<6;k++){const g=spawnGoon(o.x+RR(-9,9),o.z+RR(-9,9),null,true);g.mission=true;m.left++}m.reward=r50(2500*mult);toast('TAKE THEM OUT','6 goons',1.8)}
  else if(o.type==='boss'){const name=rpick(BOSSES);m.left=0;m.boss=spawnGoon(o.x,o.z,null,true,{boss:true});m.boss.mission=true;m.left++;
    for(let k=0;k<4;k++){const g=spawnGoon(o.x+RR(-7,7),o.z+RR(-7,7),null,true,{wep:rpick(['smg','rifle'])});g.mission=true;m.left++}
    Object.assign(m,{reward:r50(6000*mult),bossName:name,title:'Take down '+name});toast(name.toUpperCase(),'The boss wears white. Bring him down.',2.4)}
  else if(o.type==='chase'){let i=clamp(Math.round(o.x/CELL),-NB,NB),j=clamp(Math.round(o.z/CELL),-NB,NB);let dir=rpick(DIRS.filter(d=>inGrid(i-d[0],j-d[1])));
    const p=laneWP(i,j,dir[0],dir[1],-22);const v=spawnVehicle('car',p.x,p.z,Math.atan2(dir[0],dir[1]),'#151515');makeAI(v,i,j,dir[0],dir[1],25);v.ai.reckless=true;v.ai.flee=true;v.hp=800;v.keep=true;
    Object.assign(m,{target:v,reward:r50(3500*mult),timer:150});toast('STOP THAT CAR!','The black getaway car — wreck it',2.2)}
  else if(o.type==='fare'){const B=roadPoint(o.x,o.z,200,520);const dist=Math.hypot(B.x-o.x,B.z-o.z);const p=o.ped;const nm=p?p.name:rpick(NAMES_F.concat(NAMES_M));
    if(p){p.hidden=true;p.talk=false;p.h.g.visible=false}m.ped=p;
    Object.assign(m,{reward:r50((dist*2.5+300)*mult),steps:[{...B,txt:`Drop ${nm} at ${district(B.x,B.z)}`}],timer:Math.round(dist/12+28),title:'Passenger fare: '+nm});toast('PASSENGER ON BOARD',`${nm}: "${district(B.x,B.z)}, please. Quick!"`,2.4)}
  else if(o.type==='amb'){const dist=Math.hypot(HOSP.x-o.x,HOSP.z-o.z);Object.assign(m,{reward:r50(1500*mult),steps:[{x:HOSP.x,z:HOSP.z,txt:'Rush the injured person to the Government Hospital'}],timer:Math.round(dist/11+22)});toast('EMERGENCY!','Get them to the hospital, fast',2.2)}
  mission=m;noise(0.12,3000,0.2,1)}
const goodsCap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function endMissionCleanup(){queueSave();if(mission&&mission.cleanup)for(const f of mission.cleanup){try{f()}catch(e){console.error(e)}}if(mission&&mission.escort)clearSubs();if(mission&&mission.tgt)mission.tgt.keep=false;if(mission&&mission.ped){placePed(mission.ped,0)}if(mission&&mission.target)mission.target.keep=false;mission=null;marker.visible=false;offers=[];offerT=3}
function missionDone(){const m=mission;if(m.type==='hang'){const f=m.friend;addFriend(f,12);toast(f.name.toUpperCase(),'"'+rpick(f.lines.arrive)+'"',3.5);mission=null;marker.visible=false;offerT=3;return}
  player.cash+=m.reward;rep++;toast('JOB DONE','+₹'+m.reward.toLocaleString('en-IN')+' · Respect up',3);noise(0.2,3500,0.25,1);
  if(m.ped){const B=m.steps[m.steps.length-1];m.ped.hidden=false;placePed(m.ped,0)}endMissionCleanup()}
function missionFail(why){if(!mission)return;if(mission.type==='hang'){const f=mission.friend;mission=null;marker.visible=false;if(why)floatMsg(f.name+': Maybe another time.');return}
  toast(mission.type==='story'?'MISSION FAILED':mission.type==='rampage'?'RAMPAGE FAILED':'JOB FAILED',why,2.8);endMissionCleanup()}
function updateMission(dt){if(!mission)return;if(mission.custom){mission.custom(dt);return}const P=playerP();
  if(mission.type==='chase'){const v=mission.target;if(!vehicles.includes(v)||v.wrecked){missionDone();return}
    marker.visible=true;marker.position.set(v.pos.x,0,v.pos.z);if(Math.hypot(v.pos.x-P.x,v.pos.z-P.z)>420){missionFail('They got away');return}}
  else if(mission.type==='gang'||mission.type==='boss'){marker.visible=false;if(mission.type==='gang'&&mission.left<=0){missionDone();return}if(mission.type==='boss'&&mission.boss.dead){missionDone();return}}
  else{const st=mission.steps[mission.step];if(st){marker.visible=true;marker.position.set(st.x,groundH(st.x,st.z),st.z);
    const r=mission.type==='race'?8:5.5;if(Math.hypot(P.x-st.x,P.z-st.z)<r){mission.step++;noise(0.1,3200,0.2,1);if(mission.step>=mission.steps.length){missionDone();return}}}}
  marker.children[1].rotation.z+=dt;
  if(mission&&mission.type==='hang'&&!mission.friend.comp){mission=null;marker.visible=false;return}
  if(mission&&mission.timer!=null){mission.timer-=dt;if(mission.timer<=0)missionFail('Out of time')}}


/* ---------- story: the Black Scorpions ---------- */
const GIVER={x:283,z:-100};let giverH=null,giverBeam=null;
function mk(x,z){marker.visible=true;marker.position.set(x,groundH(x,z),z);marker.children[1].rotation.z+=0.02}
function findOpen(x,z,rx,rz){for(let t=0;t<30;t++){const px=x+RR(-rx,rx),pz=z+RR(-rz,rz);_pp.x=px;_pp.z=pz;if(!pushCircle(_pp,0.6,0))return[px,pz]}return[x,z]}
function spawnSquad(x,z,n,m,opt){for(let k=0;k<n;k++){const[px,pz]=findOpen(x,z,opt.rx||8,opt.rz||8);const g=spawnGoon(px,pz,null,!!opt.aggro,{wep:rpick(opt.weps||['pistol','smg','pistol','rifle']),band:'#111'});g.mission=m;m.left++}}
function stSay(who,line){return{auto(m){m.sayT=0},init(m){m.sayT=3.6;toast(who,line,3.6)},upd(m,dt){m.txt=who+' is talking…';return(m.sayT-=dt)<=0}}}
function stGo(x,z,txt,opt){opt=opt||{};return{auto(m){if(player.vehicle)exitVehicle();player.pos.set(x,groundH(x,z)+0.3,z)},timer:opt.timer,upd(m){mk(x,z);m.txt=txt;const P=playerP();return Math.hypot(P.x-x,P.z-z)<(opt.r||6)}}}
function stKill(x,z,n,txt,opt){opt=opt||{};return{auto(m){m.wave=99;killSquad(m)},timer:opt.timer,init(m){m.left=0;spawnSquad(x,z,n,m,opt)},upd(m){const P=playerP();if(Math.hypot(P.x-x,P.z-z)>40)mk(x,z);else marker.visible=false;
  m.txt=txt+' · enemies left: '+Math.max(0,m.left);if(opt.waves&&m.left<=0&&m.wave<opt.waves){m.wave++;spawnSquad(x,z,n,m,Object.assign({},opt,{aggro:true}));toast('MORE OF THEM!','Wave '+(m.wave+1)+' is here',1.8)}return m.left<=0}}}
function stBoss(x,z,name,guards,hp,sub){return{auto(m){if(m.boss&&!m.boss.dead){m.boss.dead=true;m.left--}killSquad(m)},init(m){m.left=0;const[px,pz]=findOpen(x,z,3,3);m.boss=spawnGoon(px,pz,null,false,{boss:true,hp,shirt:'#e8b923',band:'#111',wep:'rifle'});m.boss.mission=m;m.left++;
    spawnSquad(x,z,guards,m,{weps:['smg','rifle'],rx:7,rz:7});toast(name.toUpperCase(),sub,2.6)},
  upd(m){const P=playerP();if(Math.hypot(P.x-x,P.z-z)>40)mk(x,z);else marker.visible=false;m.txt=`Take down ${name} (gold shirt) · guards left: ${Math.max(0,m.left-(m.boss.dead?0:1))}`;return m.boss.dead}}}
function stWreck(make,txt,opt){opt=opt||{};return{auto(m){if(m.tgt)m.tgt.wrecked=true},timer:opt.timer,init(m){m.tgt=make();m.tgt.keep=true},upd(m,dt){const v=m.tgt;if(!vehicles.includes(v)||v.wrecked||v===player.vehicle)return true;
  mk(v.pos.x,v.pos.z);m.txt=txt;if(opt.tick)opt.tick(v,dt);const P=playerP();if(Math.hypot(v.pos.x-P.x,v.pos.z-P.z)>(opt.far||420))return'They got away';return false}}}
function courierCar(){let i=clamp(Math.round(GIVER.x/CELL),-NB,NB),j=clamp(Math.round(GIVER.z/CELL),-NB,NB);const dir=rpick(DIRS.filter(d=>inGrid(i-d[0],j-d[1])));
  const p=laneWP(i,j,dir[0],dir[1],-22);const v=spawnVehicle('suv',p.x,p.z,Math.atan2(dir[0],dir[1]),'#151515');makeAI(v,i,j,dir[0],dir[1],22);v.ai.reckless=true;v.ai.flee=true;v.hp=900;return v}
function scorpionBoat(){const v=spawnVehicle('speedboat',820,170,0);v.hp=600;return v}
const STORY=[
  {title:'Smoke Over the Mills',reward:2000,intro:'Vanakkam, thambi. I ran the looms at Podanur for thirty years. Now the Black Scorpions squeeze my workers for money every week. Will you help?',
   make:()=>[stSay('PARAMASIVAM','"Go to the Podanur mill and chase those Scorpions out!"'),stKill(182,259,5,'Clear the Black Scorpions out of the Podanur mill',{rx:16,rz:3}),stSay('PARAMASIVAM','"Nandri! But they answer to someone bigger: Silk Sundaram."')]},
  {title:'The Courier',reward:3000,intro:'Sundaram sends a courier around in a black SUV to collect his "protection" money. Today is collection day.',
   make:()=>[stSay('PARAMASIVAM','"The courier is near the mills right now. Stop that black SUV!"'),stWreck(courierCar,'Wreck or steal the black courier SUV',{timer:150}),stSay('KATHIR','"I\'m Kathir, Anna\'s nephew. The workers got their money back. Sundaram will be furious."')]},
  {title:'Burning Looms',reward:4000,intro:'Kathir was right. The Scorpions are attacking the Singanallur mill to teach us a lesson!',
   make:()=>[stSay('KATHIR','"They\'re torching the looms! Get to the Singanallur mill, fast!"'),stKill(330,111,5,'Defend the Singanallur mill',{rx:16,rz:3,aggro:true,waves:1,timer:240}),stSay('PARAMASIVAM','"The looms are safe. Sundaram\'s man Vettu Velu buys guns up in the Ghats. I had the forest checkpoint opened for you."')]},
  {title:'Ghat Road Deal',reward:5000,intro:'Vettu Velu is meeting gun runners at the hilltop viewpoint. Without those guns, Sundaram is weak.',
   make:()=>[stGo(GHAT_TOP.x,GHAT_TOP.z,'Drive up the ghat road to the hilltop viewpoint',{r:40}),stBoss(GHAT_TOP.x+6,GHAT_TOP.z+4,'Vettu Velu',4,900,'Sundaram\'s right-hand man'),stSay('PARAMASIVAM','"Velu is finished! Their last guns come by sea. The coast road is open to you now."')]},
  {title:'The Jetty Shipment',reward:6000,intro:'Sundaram\'s last shipment arrives by speedboat at the jetty on Kovai Coast. Stop it.',
   make:()=>[stGo(650,200,'Go to the jetty on Kovai Coast',{r:14}),stKill(725,200,4,'Take out the smugglers on the jetty',{rx:24,rz:1.4}),
     stWreck(scorpionBoat,'Sink the smugglers\' speedboat (take a boat, or shoot it from the jetty)',{far:700,tick:(v,dt)=>{if(v!==player.vehicle){v.heading+=0.35*dt;v.speed=13}}}),
     stSay('PARAMASIVAM','"No guns, no money. Sundaram is hiding in the old Kovai Mills. Finish this, thambi."')]},
  {title:'Silk Sundaram',reward:25000,intro:'This is it. Sundaram and every Scorpion left are holed up in the old Kovai Mills. End it tonight.',
   make:()=>[stKill(256,-111,6,'Storm the old Kovai Mills',{rx:16,rz:3,waves:1}),stBoss(240,-111,'Silk Sundaram',3,2200,'Boss of the Black Scorpions'),stSay('SILK SUNDARAM','"This city… was supposed to be mine…"')]}];
function startStory(i){const S=STORY[i];if(!S||mission)return;offers=[];
  mission={type:'story',idx:i,title:`Story ${i+1}/${STORY.length}: ${S.title}`,reward:S.reward,txt:'',steps:[],step:0,timer:null,stages:S.make(),stage:0,wave:0,custom:stageTick,done:storyDone,ticks:[],cleanup:[],meters:[]};startStage(mission);noise(0.12,3000,0.2,1);if(S.onStart)S.onStart(mission)}
function startStage(m){const s=m.stages[m.stage];marker.visible=false;m.timer=s.timer||null;m.wave=0;m.meters=[];if(s.init)s.init(m)}
function stageTick(dt){const m=mission;if(m.ticks){for(const f of m.ticks)f(m,dt);if(mission!==m)return}if(m.timer!=null){m.timer-=dt;if(m.timer<=0){missionFail('Out of time');return}}
  const r=m.stages[m.stage].upd(m,dt);if(mission!==m)return;
  if(r===true){m.stage++;if(m.stage>=m.stages.length){marker.visible=false;m.done(m);return}startStage(m)}else if(typeof r==='string')missionFail(r)}
function storyDone(m){if(m.tgt)m.tgt.keep=false;player.cash+=m.reward;rep+=2;PROG.story=Math.max(PROG.story,m.idx+1);
  toast('MISSION PASSED','+₹'+m.reward.toLocaleString('en-IN')+' · Respect +2',3.2);noise(0.2,3500,0.25,1);
  if(STORY[m.idx].onDone)STORY[m.idx].onDone(m);if(m.idx===5){player.armor=100;setTimeout(()=>toast('KOVAI IS FREE','You beat the Black Scorpions. Story complete!',5),3400)}
  else setTimeout(()=>{if(!mission)floatMsg('Paramasivam Anna has more work for you (gold S on the map)')},3600);endMissionCleanup()}
function storyOpts(){const S=STORY[PROG.story];const o=[];if(S&&!mission)o.push({t:`Start "${S.title}" (₹${S.reward.toLocaleString('en-IN')})`,fn:()=>{startStory(PROG.story);return false}});o.push({t:'Bye',fn:()=>false});return o}
function storyTalk(){const S=STORY[PROG.story];const t={kind:'story',obj:{x:GIVER.x,z:GIVER.z},
  hdr:()=>`<h3>Paramasivam Anna</h3><div class="sub">Retired mill foreman · Story ${Math.min(PROG.story,STORY.length)}/${STORY.length} done</div>`,optsFn:storyOpts,
  line:mission?'Finish what you are doing first, thambi.':S?S.intro:rpick(PROG.a2&&PROG.a2.done?A2_AFTER:['Kovai is quiet again, thanks to you.','The workers ask about you every day. Have some tea!','Sundaram is gone, but stay sharp, thambi.'])};t.opts=storyOpts();return t}
function extraTalkable(){const p=player.pos;if(Math.hypot(p.x-GIVER.x,p.z-GIVER.z)<3.2)return{kind:'story',hint:'to talk to Paramasivam Anna',custom:storyTalk};
  if(Math.hypot(p.x-HOUSE.px,p.z-HOUSE.pz)<2.8)return{kind:'house',hint:PROG.house?'to use your safehouse':'to look at the house for sale',custom:houseTalk};return null}

/* ---------- collectibles: film reels, stunt jumps, rampages ---------- */
const REELS=[[-106,-49,1],[-96,-37,1],[110,398,1],[213,0,1],[-333,-339.5,0],[-21,95,0],[111,-18,0],[-487,-180,0],['hill'],['falls'],[676,-410,0],[776,200,1],[652,125,0],[37,-111,0],[333,-175,0],[-43.7,27,0],[-111,160,0],[-182,47,0],[265,303.8,0],[204,3,0]];
const reelObjs=[];
const RAMPS=[{id:0,a:[440,0],d:[1,0]},{id:1,a:[-470,0],d:[-1,0]},{id:2,a:[0,-440],d:[0,-1]},{id:3,a:[0,440],d:[0,1]},{id:4,a:[645,-150],d:[0,1]}];
function buildRamps(){for(const r of RAMPS){const[ax,az]=r.a,[dx,dz]=r.d,L=r.L=9,H=r.H=2.4,W=r.W=5;const cx=ax+dx*L/2,cz=az+dz*L/2,ang=Math.atan2(H,L),Ls=Math.hypot(L,H);const gy=r.gy=surfaceH(cx,cz,0);
  if(dx!==0)addG(B_PLAIN,GEO.box,cx,gy+H/2-0.1,cz,'#e0a800',0,0,dx*ang,Ls,0.25,W);else addG(B_PLAIN,GEO.box,cx,gy+H/2-0.1,cz,'#e0a800',-dz*ang,0,0,W,0.25,Ls);
  for(const s of[-1,1]){const ox=dz*s*(W/2-0.4),oz=dx*s*(W/2-0.4);if(dx!==0)addG(B_PLAIN,GEO.box,cx+ox,gy+H/2-0.02,cz+oz,'#111',0,0,dx*ang,Ls,0.25,0.35);else addG(B_PLAIN,GEO.box,cx+ox,gy+H/2-0.02,cz+oz,'#111',-dz*ang,0,0,0.35,0.25,Ls)}
  const ex=ax+dx*L,ez=az+dz*L;addBox(B_PLAIN,dx?0.3:W,H,dx?W:0.3,ex,gy+H/2,ez,'#333');addCollider(ex-(dx?0.2:W/2),ez-(dx?W/2:0.2),ex+(dx?0.2:W/2),ez+(dx?W/2:0.2),gy+H*0.45);
  SURF.push({minX:Math.min(ax,ex)-(dx?0:W/2),maxX:Math.max(ax,ex)+(dx?0:W/2),minZ:Math.min(az,ez)-(dz?0:W/2),maxZ:Math.max(az,ez)+(dz?0:W/2),h:(x,z)=>gy+clamp(((x-ax)*dx+(z-az)*dz)/L,0,1)*H})}}
let stunt=null;
function slowMo(){return stunt&&stunt.t<1.6?0.45:1}
function updateStunts(dt){const v=player.vehicle;
  if(stunt){stunt.t+=dt;const sv=stunt.v;if(sv!==player.vehicle||sv.wrecked){stunt=null;return}const sh=surfaceH(sv.pos.x,sv.pos.z,sv.y);
    if(stunt.t>0.25&&sv.y<=sh+0.12&&sv.vy===0){const dist=Math.hypot(sv.pos.x-stunt.x,sv.pos.z-stunt.z),air=stunt.t,r=stunt.r;stunt=null;
      if(air>0.8&&dist>14){const first=!PROG.jumps.includes(r.id),pay=first?1000:150;player.cash+=pay;if(first){PROG.jumps.push(r.id);queueSave()}
        toast(first?'UNIQUE STUNT JUMP!':'STUNT JUMP',`${Math.round(dist)} m · ${air.toFixed(1)} s in the air · +₹${pay}`+(first?` · ${PROG.jumps.length}/${RAMPS.length} found`:''),3);
        if(first&&PROG.jumps.length===RAMPS.length){player.cash+=10000;setTimeout(()=>toast('ALL STUNT JUMPS DONE','+₹10,000 bonus',4),3100)}}
      else floatMsg('Weak jump. Hit the ramp faster!')}return}
  if(!v||v.s.boat)return;
  for(const r of RAMPS){const u=(v.pos.x-r.a[0])*r.d[0]+(v.pos.z-r.a[1])*r.d[1],lat=Math.abs((v.pos.x-r.a[0])*r.d[1]-(v.pos.z-r.a[1])*r.d[0]);
    if(lat<r.W/2+0.5&&u>r.L-0.9&&u<r.L+1.2&&v.vy<=0&&v.y>r.gy+r.H*0.7){const along=v.vx*r.d[0]+v.vz*r.d[1];if(along>10){v.vy=clamp(along*0.33,4,12);v.y=Math.max(v.y,r.gy+r.H)+0.15;stunt={v,r,t:0,x:v.pos.x,z:v.pos.z};noise(0.2,500,0.3,2)}break}}}
const RAMPAGES=[{id:0,x:-9.5,z:-185,w:'rocket',ammo:30,need:15,n:'Rocket rampage'},{id:1,x:-9.5,z:125,w:'smg',ammo:300,need:20,n:'SMG rampage'},
  {id:2,x:-231.5,z:37,w:'bat',ammo:0,need:10,n:'Cricket bat rampage'},{id:3,x:231.5,z:-259,w:'grenade',ammo:25,need:12,n:'Grenade rampage'}];
function startRampage(r){if(mission)return;const wi=WI(r.w);giveWeapon(wi,r.ammo||0);setWeapon(wi);const first=!PROG.ramp.includes(r.id);
  const m={type:'rampage',title:'RAMPAGE: '+r.n,reward:first?2500:500,txt:'',steps:[],step:0,timer:60,kills:0,need:r.need,custom:dt=>{
    m.txt=`Take out ${m.need} people or goons · ${m.kills}/${m.need}`;m.timer-=dt;
    if(m.kills>=m.need){r.cd=30;player.cash+=m.reward;if(first)PROG.ramp.push(r.id);toast('RAMPAGE PASSED','+₹'+m.reward.toLocaleString('en-IN')+(first?` · ${PROG.ramp.length}/${RAMPAGES.length} done`:''),3);endMissionCleanup();return}
    if(m.timer<=0){r.cd=30;missionFail('Time\'s up')}}};
  mission=m;offers=[];for(let k=0;k<6;k++){const[px,pz]=findOpen(r.x,r.z,14,14);spawnGoon(px,pz,null,true,{wep:'pistol'})}toast('RAMPAGE!',`${r.n}: ${r.need} kills in 60 seconds`,2.4);noise(0.3,300,0.4,2)}
function onGoonKilled(g){if(mission&&mission.type==='rampage')mission.kills++}
function onPedKilled(p){if(mission&&mission.type==='rampage')mission.kills++}
function updateCollect(dt){const P=playerP(),py=player.vehicle?player.vehicle.y:player.pos.y;
  for(const r of reelObjs){if(r.got)continue;const near=Math.abs(P.x-r.x)<160&&Math.abs(P.z-r.z)<160;r.m.visible=near;if(!near)continue;r.m.rotation.y+=dt*2.5;r.m.position.y=r.y+Math.sin(time*3+r.x)*0.12;
    if(!player.dead&&Math.abs(P.x-r.x)<1.8&&Math.abs(P.z-r.z)<1.8&&Math.abs(py+0.9-r.y)<2.6){r.got=true;r.m.visible=false;PROG.reels.push(r.id);player.cash+=250;noise(0.15,4200,0.25,1);const n=PROG.reels.length;
      toast('FILM REEL '+n+'/'+REELS.length,n===REELS.length?'You found every reel! +₹25,000':'A lost reel from an old Kovai cinema · +₹250',2.6);if(n===REELS.length)player.cash+=25000;queueSave()}}
  for(const r of RAMPAGES){r.cd=(r.cd||0)-dt;const vis=!mission&&r.cd<=0;r.sp.visible=vis;if(!vis)continue;r.sp.position.y=1.6+Math.sin(time*2)*0.2;
    if(!player.vehicle&&!player.dead&&Math.hypot(player.pos.x-r.x,player.pos.z-r.z)<1.6)startRampage(r)}}
