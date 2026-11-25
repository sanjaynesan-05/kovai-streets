/* Kovai Streets: act3.js
 * Rebuild step R6 (REBUILD_SPEC.md, Kovai_Streets_Storyline_2.0.md): Act 3, "The Vault Job" (story missions 15-21).
 * Opens after the Act 2 epilogue. New specialist Arjun Varadhan; prep missions gather intel, credentials, a getaway car and an
 * access card, then the Vault Job (stealth or loud), No Way Out (escape; shaped by the Act 2 choices) and The Architect.
 * Interiors: Devarajan Tower's lobby and Vault, and the Royal Grand Hotel's banquet hall, built away from the city like the
 * shops (interiors.js). New stage: stHack (type codes at a panel). State: PROG.a3 (saved, see sanitizeA3).
 * Classic script, loaded after act1.js.
 */
'use strict';

const A3_DEFAULT={intel:0,creds:false,car:'',carCol:'',card:false,prakash:'',approach:'',done:false};
PROG.a3=Object.assign({},A3_DEFAULT);
const A3=()=>PROG.a3;
function sanitizeA3(a){a=a&&typeof a==='object'?a:{};return{intel:typeof a.intel==='number'&&isFinite(a.intel)?clamp(Math.floor(a.intel),0,3):0,creds:!!a.creds,car:VT[a.car]?a.car:'',
  carCol:typeof a.carCol==='string'&&/^#[0-9a-f]{6}$/i.test(a.carCol)?a.carCol:'',card:!!a.card,prakash:['exposed','informant'].includes(a.prakash)?a.prakash:'',approach:['stealth','loud'].includes(a.approach)?a.approach:'',done:!!a.done}}
Object.assign(LOOK,{arjun:{shirt:'#3d405b',pants:'#1d1d1d',lower:'pants',sleeve:'long',skin:'#8d5524',glasses:true,hairStyle:'short',hair:'#2b2b2b',stache:false},
  prakash:{shirt:'#f4f1e8',pants:'#1d1d1d',lower:'pants',sleeve:'long',skin:'#a0662f',hairStyle:'short',stache:true},
  mechanic:{shirt:'#264653',pants:'#264653',lower:'pants',sleeve:'short',skin:'#6b3f1d',hairStyle:'short',stache:true}});

/* ---------- interiors: tower (lobby + Vault) and hotel (banquet hall + back office) ---------- */
const A3_ROOMS={};
function a3Room(kind){if(A3_ROOMS[kind])return A3_ROOMS[kind];const x0=kind==='tower'?8800:8900,z0=8200,B=GB(),cols=[],Wd=30,Dp=kind==='tower'?24:20,WC=kind==='tower'?'#dfe3e6':'#f1e3c8';
  const box=(w,h,d,x,y,z,c,col)=>{gbBox(B,w,h,d,x,y,z,c);if(col)cols.push([x,z,w,d])};
  box(Wd,0.1,Dp,0,0.05,0,kind==='tower'?'#d9d4cc':'#8c2d19');box(Wd,0.2,Dp,0,5.1,0,'#f4efe4');box(Wd,5,0.3,0,2.5,-Dp/2,WC,1);
  for(const s of[-1,1]){box(0.3,5,Dp,s*Wd/2,2.5,0,WC,1);box((Wd-4)/2,5,0.3,s*(Wd+4)/4,2.5,Dp/2,WC,1)}box(4,1.4,0.3,0,4.3,Dp/2,WC);
  for(let u=-10;u<=10;u+=10)for(const v of[-Dp/4,Dp/4])box(4,0.06,1,u,4.98,v,'#fffbe8');
  const R={x:x0,z:z0,kind,door:{x:x0,z:z0+Dp/2-1.5}};
  if(kind==='tower'){/* lobby z -2..12, Vault z -12..-2 behind a wall with a round door */
    for(const s of[-1,1])box(13.5,5,0.4,s*8.25,2.5,-2,'#5d6166',1);box(3,1.5,0.4,0,4.25,-2,'#5d6166');
    box(7,1.1,1.2,0,0.55,6,'#2b2d42',1);box(7.2,0.08,1.4,0,1.14,6,'#c0c0c0');for(const v of[3,7])box(0.1,3,2,-14.8,1.5,v,'#b0b0b0');
    box(0.3,1.2,1.4,-14.7,1.5,0.5,'#1b263b');box(0.05,0.5,0.8,-14.5,1.7,0.5,'#7dffb0');
    for(const s of[-1,1]){box(1,2.6,7,s*13,1.3,-7,'#6d4c41',1);for(let y=0.6;y<2.6;y+=0.7)for(let k=0;k<5;k++)box(0.7,0.4,0.9,s*13,y,-10+k*1.4,k%2?'#2a9d8f':'#e9c46a')}
    for(const s of[-1,1])box(2,1,1.4,s*5,0.5,-9.5,'#3a5a40',1);
    const door=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.5,24),M('#9a9a9a'));door.rotation.x=Math.PI/2;door.position.set(x0,1.8,z0-2);scene.add(door);R.vdoor=door;
    R.doorBox=[x0-1.5,z0-2.3,x0+1.5,z0-1.7];
    const sg=signMesh(signTex([['DEVARAJAN TOWER','bold 52px Rajdhani,sans-serif'],['B2 · PRIVATE ACCESS · VAULT','bold 36px Rajdhani,sans-serif']],'#1d3557','#fff',512,160),4,1.25);sg.position.set(x0+8,3.2,z0+11.8);sg.rotation.y=Math.PI;scene.add(sg)}
  else{/* banquet hall with round tables and a stage; back office in the corner (x 8..15, z -10..-3) */
    for(const tx of[-9,-3,3])for(const tz of[-4,2,6]){gb(B,GEO.cyl16,tx,0.75,tz,'#f4f1e8',0,0,0,1.6,0.08,1.6);gb(B,GEO.cyl8,tx,0.37,tz,'#5d4037',0,0,0,0.15,0.74,0.15);cols.push([tx,tz,2.6,2.6])}
    box(10,0.6,3,-4,0.3,-8.5,'#5d4037',1);box(0.3,5,7,8,2.5,-6.5,WC,1);box(2,5,0.3,9,2.5,-3,WC,1);box(3,5,0.3,13.5,2.5,-3,WC,1);box(2,1.4,0.3,11,4.3,-3,WC);
    box(2.4,0.9,1.1,11.5,0.45,-7,'#5d4037',1);R.doorBox=[x0+10,z0-3.2,x0+12,z0-2.8];
    const sg=signMesh(signTex([['ROYAL GRAND HOTEL','bold 52px Rajdhani,sans-serif'],['KOVAI BUSINESS FORUM','bold 36px Rajdhani,sans-serif']],'#8c2d19','#ffe08a',512,160),5,1.6);sg.position.set(x0-4,3.4,z0-9.8);scene.add(sg)}
  const mesh=gbMesh(B,VCM,false);mesh.position.set(x0,0,z0);scene.add(mesh);for(const[cx,cz,w,d]of cols)addCollider(x0+cx-w/2,z0+cz-d/2,x0+cx+w/2,z0+cz+d/2,5);
  R.pt=(lx,lz)=>({x:x0+lx,z:z0+lz});
  R.reset=()=>{if(!R.doorCol)R.doorCol=addCollider(...R.doorBox,5);if(R.vdoor)R.vdoor.visible=true};R.open=()=>{if(R.doorCol){removeColliders([R.doorCol]);R.doorCol=null}if(R.vdoor)R.vdoor.visible=false};
  return A3_ROOMS[kind]=R}
/* go in (and come out at `out` if the mission ends while inside) */
function a3Enter(m,room,out,yaw){if(player.vehicle)exitVehicle();room.reset();player.pos.set(room.door.x,0.05,room.door.z-1);player.vy=0;camYaw=yaw===undefined?Math.PI:yaw;
  if(!shopLight){shopLight=new THREE.PointLight(0xfff1d6,1.2,18);scene.add(shopLight)}shopLight.distance=40;shopLight.position.set(room.x,4.6,room.z);shopLight.visible=true;m.inRoom=room;m.roomOut=out;
  if(!m.roomClean){m.roomClean=true;m.cleanup.push(()=>{if(m.inRoom)a3Leave(m)})}}
function a3Leave(m){const o=m.roomOut;m.inRoom=null;player.pos.set(o.x,surfaceH(o.x,o.z,5)+0.05,o.z);player.vy=0;if(shopLight)shopLight.visible=false}
function stExitRoom(txt){return{upd(m){const d=m.inRoom.door;mk(d.x,d.z);m.txt=txt||'Leave the building';m.meters=[];if(farFrom(d.x,d.z)<1.8){a3Leave(m);return true}return false},auto(m){a3Leave(m)}}}

/* ---------- hacking: type the codes on the number keys at a panel ---------- */
let HACK=null;
addEventListener('keydown',e=>{if(!HACK)return;const r=/^(?:Digit|Numpad)(\d)$/.exec(e.code);if(!r)return;e.preventDefault();e.stopImmediatePropagation();HACK(+r[1])},true);
function stHack(o){const N=o.len||4,R=o.rounds||3,T=o.time||30;return{
  init(m){const h=m.hk={code:[],pos:0,round:0,t:T},roll=()=>{h.code=Array.from({length:N},()=>Math.floor(Math.random()*10));h.pos=0};roll();if(o.line)say2(o.line);
    HACK=n=>{if(farFrom(o.x,o.z)>2.5||player.vehicle)return;if(n===h.code[h.pos]){h.pos++;noise(0.04,2600,0.15,1);if(h.pos>=N){h.round++;if(h.round<R)roll()}}else{h.pos=0;h.t-=3;noise(0.12,500,0.3,1)}};m.cleanup.push(()=>{HACK=null})},
  upd(m,dt){const h=m.hk;if(h.round>=R){HACK=null;return true}const near=farFrom(o.x,o.z)<=2.5&&!player.vehicle;if(near)h.t-=dt;if(h.t<=0){HACK=null;return o.fail||'The system locked you out'}
    if(near){marker.visible=false;m.txt=`HACK ${h.round+1}/${R}: type `+h.code.map((d,i)=>i<h.pos?'✓':i===h.pos?'['+d+']':d).join(' ')+' on the number keys'}else{mk(o.x,o.z);m.txt=o.txt}
    m.meters=[{label:'Time before lockout',v:Math.max(0,h.t/T),col:'#7fb8ff'}];return false},
  auto(m){m.hk.round=R;HACK=null}}}

/* ---------- places ---------- */
const TOWER={x:420,z:-300},HOTEL={x:-40,z:-300};
function a3House(){return a3Pt(HOUSE.px,HOUSE.pz+6,2)}
function a3Gate(){let b=null,bd=1e9;for(const g of RAILW.gates){const d=Math.hypot(g.x-430,g.z+150);if(d<bd){bd=d;b=g}}return b?{x:b.x,z:b.z}:{x:430,z:-150}}
function a3Pt(x,z,r){const[a,b]=findOpen(x,z,r||3,r||3);return{x:a,z:b}}
function a3Chain(i){setTimeout(()=>{if(!mission&&!player.dead&&PROG.story===i)startStory(i)},2500)}
const a3Ready=()=>!!(PROG.a2&&PROG.a2.epilogue>=2);

/* ---------- Act 3 missions ---------- */
const ACT3=[
 {title:'The Blueprint',reward:8000,ready:a3Ready,onStart:()=>toast('ACT 3','THE VAULT JOB',4),onDone:m=>{A3().intel=Math.max(A3().intel,m.intel||1)},
  make:()=>{const H=a3House(),F=a3Pt(TOWER.x,TOWER.z+24),S=a3Pt(TOWER.x+26,TOWER.z),L=a3Pt(TOWER.x,TOWER.z-24),T=a3Room('tower');return[
   stDo(m=>{m.intel=1;const p=npc({shirt:'#f4f1e8',pants:'#f4f1e8',lower:'veshti',skin:'#8d5524',hair:'#d9d9d9',stache:true},H.x-1.5,H.z,0),a=npc(LOOK.arjun,H.x+1.5,H.z,0);m.cleanup.push(()=>{npcGone(p);npcGone(a)});m.ticks.push((m,dt)=>{npcIdle(p,dt,true);npcIdle(a,dt,true)})}),
   stGo(H.x,H.z+2.5,'Paramasivam Anna is waiting at the Lakeview safehouse',{r:6}),stTalk('r6_m15_para','r6_m15_vault','r6_m15_arjun'),
   stGo(TOWER.x,TOWER.z+70,'Scout Devarajan Tower in Central Kovai',{r:30}),
   stDo(m=>{addGuards(m,[{path:[[TOWER.x-15,TOWER.z+20],[TOWER.x+15,TOWER.z+20]]},{path:[[TOWER.x+20,TOWER.z-12],[TOWER.x+20,TOWER.z+12]]},{path:[[TOWER.x-15,TOWER.z-20],[TOWER.x+15,TOWER.z-20]]}],{wep:'pistol',band:'#1b263b',range:12});
     m.alarmLine=null;m.ticks.push((m,dt)=>{stealthTick(m,dt);if(m.alarm&&!m.inRoom)missionFail('You were recognised')})}),
   stPhoto({txt:'Photograph the main gate (1/3)',at:()=>F,min:18,max:60}),stPhoto({txt:'Photograph the service ramp (2/3)',at:()=>S,min:18,max:60}),
   stPhoto({txt:'Photograph the loading bay (3/3)',at:()=>L,min:18,max:60,onDone:()=>say2('r6_m15_entr')}),
   {init(m){m.obs=0},upd(m,dt){const P=playerP();let ok=false;for(const g of m.guards){if(g.dead)continue;const d=Math.hypot(g.x-P.x,g.z-P.z);if(d>=14&&d<=45&&los(P.x,(player.vehicle?player.vehicle.y:player.pos.y)+1.5,P.z,g.x,1.4,g.z)){ok=true;break}}
      if(ok)m.obs+=dt;m.meters=[{label:ok?'Watching the guards…':'Watch a guard from 14–45 m away',v:Math.min(1,m.obs/8),col:'#ffd23f'}];m.txt='Learn the guard rotations';marker.visible=false;
      if(m.obs>=8){say2('r6_m15_rot');return true}return false},auto(m){m.obs=8}},
   stGo(F.x,F.z,'Walk in through the main entrance as a visitor',{r:3}),stDo(m=>a3Enter(m,T,F)),
   stSearch({txt:'Find where the Vault is (optional: the guard roster and the fire plan)',cx:T.x,cz:T.z,r:30,pts:()=>[{...T.pt(8,10.6),y:1.6,id:'dir'},{...T.pt(0,5.2),y:1.3,id:'roster',optional:true},{...T.pt(-12,10.6),y:1.6,id:'plan',optional:true}],
     found(p,m){if(p.id==='dir')say2('r6_m15_board');else{m.intel++;floatMsg(p.id==='roster'?'Guard roster photographed: more intel for the heist':'Fire escape plan photographed: more intel for the heist')}}}),
   stExitRoom('Walk out calmly'),stEscape({txt:'Get 120 m away without being recognised',x:TOWER.x,z:TOWER.z,r:120}),stTalk('r6_m15_end')]}},
 {title:'Dead Frequency',reward:10000,ready:a3Ready,onDone:()=>{A3().creds=true},
  make:()=>{const C=a3Pt(1330,-230,20),door={x:C.x,z:C.z+2.9};return[
   stDo(()=>{tod=22}),stGo(C.x,C.z+40,'Go to the communications relay in East Junction',{r:25}),
   stDo(m=>{const B=GB();gbBox(B,6,3,4,0,1.5,0,'#cfc8b8');gbBox(B,6.4,0.3,4.4,0,3.1,0,'#5d6166');gbBox(B,1.1,2.1,0.1,0,1.05,2.01,'#2b2d42');gbBox(B,0.6,26,0.6,9,13,4,'#9a9a9a');
     for(let k=0;k<3;k++)gbBox(B,3,0.2,0.2,9,8+k*6,4,'#9a9a9a');gb(B,GEO.cyl16,9,20,4.6,'#f4f1e8',Math.PI/2,0,0,1.4,0.2,1.4);gbBox(B,1.6,1.2,0.5,-1.6,1.2,2.3,'#1b263b');
     const mesh=gbMesh(B);mesh.position.set(C.x,groundH(C.x,C.z),C.z);scene.add(mesh);const cols=[addCollider(C.x-3,C.z-2,C.x+3,C.z+2,3.2),addCollider(C.x+8.7,C.z+3.7,C.x+9.3,C.z+4.3,26)];m.cleanup.push(()=>{scene.remove(mesh);removeColliders(cols)});
     addGuards(m,[{path:[[C.x-14,C.z+10],[C.x+14,C.z+10]]},{path:[[C.x+14,C.z-10],[C.x+14,C.z+12]]},{path:[[C.x-14,C.z-10],[C.x-14,C.z+12]]}],{wep:'smg',band:'#1b263b',range:14});
     addCams(m,[{x:C.x-3,z:C.z+2.3,yaw:0.6},{x:C.x+3,z:C.z+2.3,yaw:-0.6}]);m.alarmLine='r6_m19_alarm';
     m.ticks.push((m,dt)=>{stealthTick(m,dt);if(m.alarm&&!m.reinf){m.reinf=true;for(let k=0;k<2;k++){const g=spawnGoon(C.x+RR(-6,6),C.z-30,null,true,{wep:'smg'});g.mission=m}}})}),
   stSearch({txt:'Find the surveillance control room',cx:C.x,cz:C.z,r:40,vis:60,pts:()=>[{...door,y:1.2,id:'room'}],found:()=>say2('r6_m16_arjun')}),
   stHack({x:door.x,z:door.z,txt:'Get back to the control panel',line:'r6_m16_hack',len:4,rounds:3,time:32}),
   stSearch({txt:'Recover the access credentials',kind:'doc',unit:'credentials',cx:C.x,cz:C.z,r:40,vis:60,pts:()=>[{...a3Pt(C.x-4.2,C.z+1,1),y:0.8,id:'creds'}],found:()=>say2('r6_m16_creds')}),
   stEscape({txt:'The backup system is coming online: get 150 m away',x:C.x,z:C.z,r:150,timer:45,n:2,from:()=>[C.x,C.z-25],line:'r6_m16_backup'}),stTalk('r6_m16_end')]}},
 {title:'Wheels of Escape',reward:9000,ready:a3Ready,onDone:m=>{const v=m.gv;if(v){A3().car=v.type;A3().carCol=/^#[0-9a-f]{6}$/i.test(v.color||'')?v.color:''}},
  make:()=>{const kf=A2().kathir==='forgiven',M0=geoSidewalk(-1250,-40),MC={x:M0[0],z:M0[1]},FAST=['sport','suv','jeep','car'],CEN=a3Pt(TOWER.x,TOWER.z+40,5),RG=a3Gate(),H=a3House();
   const getCar=kf?[stDo(m=>{const[x,z]=findOpen(GIVER.x+6,GIVER.z+6,3,3),v=spawnVehicle('sport',x,z,0,'#ff3b30');v.keep=true;m.kcar=v;const k=npc(LOOK.kathir,x-2.5,z,0);m.cleanup.push(()=>{npcGone(k);if(v!==player.vehicle&&v!==m.gv)removeVehicle(v)});m.ticks.push((m,dt)=>npcIdle(k,dt,true))}),
      stGo(GIVER.x+4,GIVER.z+6,'Kathir is waiting by the Mill Estate gate',{r:5}),stTalk('r6_m17_kathir'),
      {upd(m){const v=m.kcar;mk(v.pos.x,v.pos.z);m.txt='Get into Kathir\'s car';m.meters=[];if(player.vehicle===v||m.gv){m.gv=v;return true}return v.wrecked?'Kathir\'s car was wrecked':false},auto(m){m.gv=m.kcar}}]
    :[stTalk('r6_m17_find'),{upd(m){const v=player.vehicle;m.txt='Find a getaway car: steal a sports car, SUV, jeep or car';m.meters=[];marker.visible=false;if(v&&FAST.includes(v.type)&&!v.wrecked){m.gv=v;v.keep=true;return true}return false},
      auto(m){const v=spawnVehicle('suv',player.pos.x+4,player.pos.z,0,'#151515');m.gv=v;v.keep=true}}];
   return[...getCar,
    {upd(m){const v=m.gv;mk(MC.x,MC.z);m.txt='Drive it to Mani\'s garage in Mill Estate';m.meters=[];if(v.wrecked)return'The car was wrecked';return m.forced||player.vehicle===v&&farFrom(MC.x,MC.z)<8},auto(m){m.forced=true}},
    {init(m){m.up=0;const n=npc(LOOK.mechanic,MC.x+3,MC.z+2,0);m.cleanup.push(()=>npcGone(n));m.ticks.push((m,dt)=>npcIdle(n,dt,true))},
     upd(m,dt){const v=m.gv,ok=player.vehicle===v&&Math.abs(v.speed)<1&&farFrom(MC.x,MC.z)<9;if(ok)m.up+=dt;m.meters=[{label:ok?'Mani is upgrading the car…':'Stop the car at the garage',v:Math.min(1,m.up/4),col:'#ffd23f'}];m.txt='Get the car upgraded';
       if(m.up>=4){v.hp=v.s.hp*2;say2('r6_m17_mech');return true}return false},auto(m){m.up=4}},
    stGo(CEN.x,CEN.z,'Test the escape route (1/3): Devarajan Tower',{r:20,timer:150}),stGo(RG.x,RG.z,'Test the escape route (2/3): the railway corridor',{r:22,timer:90}),
    stGo(H.x,H.z,'Test the escape route (3/3): the Lakeview safehouse',{r:20,timer:150}),stTalk('r6_m17_end')]}},
 {title:'The Inside Man',reward:12000,ready:a3Ready,onDone:m=>{A3().card=true;if(m.prakash)A3().prakash=m.prakash;if(m.prakash==='informant')A3().intel=Math.min(3,A3().intel+1)},
  make:()=>{const E=a3Pt(HOTEL.x,HOTEL.z+20),R=a3Room('hotel');return[
   stDo(()=>{tod=20}),stGo(E.x,E.z,'Go to the business dinner at the Royal Grand Hotel',{r:4}),
   stDo(m=>{a3Enter(m,R,E);const sp=[];for(const[tx,tz]of[[-9,-4],[-3,-4],[3,-4],[-9,2],[3,2],[-3,6],[3,6]])sp.push(npc(LOOK.guest(),R.x+tx+1.5,R.z+tz,-Math.PI/2));
     m.g1=sp[3];m.g2=sp[4];m.pk=npc(LOOK.prakash,R.x+5,R.z-5.5,Math.PI);const bg=npc(LOOK.contact,R.x+11,R.z-1.6,0);m.crowd=sp.concat([m.pk,bg]);
     m.cleanup.push(()=>m.crowd.forEach(npcGone));m.ticks.push((m,dt)=>{for(const n of m.crowd)npcIdle(n,dt,true)})}),
   stMeet({txt:'Mingle: ask the guests about Devarajan',people:()=>[{n:mission.g1,x:mission.g1.x,z:mission.g1.z,line:'r6_m18_g1'},{n:mission.g2,x:mission.g2.x,z:mission.g2.z,line:'r6_m18_g2'}]}),
   stMeet({txt:'Find Prakash, Devarajan\'s security man',people:()=>[{n:mission.pk,x:mission.pk.x,z:mission.pk.z,line:'r6_m18_prak'}]}),
   stChoice({title:'The Inside Man',line:'Who let you in? This is a private party.',txt:'Talk your way into the back office',opts:[
     {t:'Bluff: say Devarajan sent you for his papers (works if you scouted the tower)',fn:m=>{if(A3().intel>=1)say2('r6_m18_ok');else{m.fight=true;say2('r6_m18_bad')}}},
     {t:'Show him the tower\'s guard roster (needs the roster from The Blueprint)',off:()=>A3().intel<2,fn:m=>{if(A3().intel<2)return'You don\'t have the roster. Choose something else.';say2('r6_m18_ok')}},
     {t:'Push past his bodyguard',fn:m=>{m.fight=true;say2('r6_m18_bad')}}]}),
   {init(m){m.left=0;if(m.fight)spawnSquad(R.x+6,R.z-1,3,m,{rx:4,rz:3,aggro:true,weps:['pistol']})},upd(m){m.txt='Deal with Prakash\'s bodyguards · left: '+Math.max(0,m.left);m.meters=[];marker.visible=false;return m.left<=0},auto(m){killSquad(m)}},
   stDo(m=>{R.open();const b=m.crowd[m.crowd.length-1];b.x+=2.5}),
   stSearch({txt:'Take the access card from the back office',kind:'doc',unit:'card',cx:R.x+11,cz:R.z-6,r:12,pts:()=>[{...R.pt(11.5,-6.2),y:1.1,id:'card'}],found:()=>say2('r6_m18_card')}),
   stChoice({title:'The Inside Man',line:'Prakash is caught. What do you do with him?',txt:'Decide what to do with Prakash',opts:[
     {t:'Expose him: send his name to the newspapers',fn:m=>{m.prakash='exposed';say2('r6_m18_expose')}},
     {t:'Let him go (he becomes your informant: more intel for the heist)',fn:m=>{m.prakash='informant';say2('r6_m18_free')}}]}),
   {upd(){return!subBusy()},auto(){clearSubs()}},stExitRoom('Leave the hotel'),stTalk('r6_m18_end')]}},
 {title:'The Vault Job',reward:50000,ready:a3Ready,onDone:m=>{A3().approach=m.loud?'loud':'stealth';a3Chain(STORY.indexOf(ACT3[5]))},
  make:()=>{const F=a3Pt(TOWER.x,TOWER.z+24),S=a3Pt(TOWER.x+26,TOWER.z),T=a3Room('tower'),a=A3(),ng=4-Math.min(2,a.intel);return[
   stDo(m=>{tod=23;const[x,z]=findOpen(F.x+10,F.z+10,5,5),v=spawnVehicle(a.car||'suv',x,z,0,a.carCol||'#151515');v.keep=true;v.hp=v.s.hp*2;m.car=v;
     m.cleanup.push(()=>{if(v!==player.vehicle)removeVehicle(v)});/* kept when you drive off in it (No Way Out continues in it) */if(A2().kathir==='forgiven')floatMsg('Kathir is at the wheel of the getaway car, engine running')}),
   stGo(F.x,F.z+30,'Go to Devarajan Tower',{r:15}),stTalk('r6_m19_arjun'),
   stChoice({title:'The Vault Job',line:'Stealth through the service entrance, or loud through the front door?',txt:'Choose your approach',opts:[
     {t:'Stealth: service entrance, avoid the guards, keep the police out of it',fn:m=>{m.loud=false;say2('r6_m19_quiet')}},
     {t:'Loud: storm the lobby, fight security, police come at once',fn:m=>{m.loud=true;say2('r6_m19_loud')}}]}),
   {upd(m){const p=m.loud?F:S;mk(p.x,p.z);m.txt=m.loud?'Go in through the front entrance':'Go round to the service entrance';m.meters=[];return farFrom(p.x,p.z)<3&&!player.vehicle},auto(m){testNear(m.loud?F:S,1)}},
   stDo(m=>{a3Enter(m,T,m.loud?F:S);m.left=0;if(m.loud){spawnSquad(T.x,T.z+3,6,m,{rx:10,rz:5,aggro:true,weps:['smg','rifle']});wanted=Math.max(wanted,3);say2('r6_m19_alarm')}
     else{addGuards(m,[{path:[[T.x-10,T.z+8],[T.x+10,T.z+8]]},{path:[[T.x-12,T.z-0.6],[T.x+12,T.z-0.6]]},{path:[[T.x+12,T.z+10],[T.x+12,T.z+1]]},{path:[[T.x-12,T.z+1],[T.x-12,T.z+10]]}].slice(0,ng),{wep:'smg',band:'#1b263b',range:11});
       addCams(m,[{x:T.x-13,z:T.z+10.5,yaw:2.4},{x:T.x+13,z:T.z+10.5,yaw:-2.4}]);m.alarmLine='r6_m19_alarm';m.ticks.push((m,dt)=>stealthTick(m,dt))}}),
   {init(m){const p=T.pt(-13.8,0.5);m.pp={x:p.x,z:p.z,hold:0,g:a2Prop('doc',p.x,p.z,1.3)};m.cleanup.push(()=>scene.remove(m.pp.g));m.panelDone=!!m.loud;
      if(!m.loud&&a.creds){m.panelDone=true;for(const c of m.cams||[]){c.on=false;c.g.visible=false}say2('r6_m19_cams')}if(m.panelDone)scene.remove(m.pp.g)},
    upd(m,dt){m.meters=[];if(m.loud){marker.visible=false;m.txt='Fight through tower security · left: '+Math.max(0,m.left);return m.left<=0}
      if(!m.panelDone){const p=m.pp;p.g.rotation.y+=dt*2;if(holdAt(p,p.x,p.z,1.8,dt)){m.panelDone=true;scene.remove(p.g);for(const c of m.cams||[]){c.on=false;c.g.visible=false}floatMsg('Cameras and alarms disabled')}
        else if(p.hold>0)m.meters=[{label:'Disabling the cameras…',v:p.hold/1.8,col:'#ffd23f'}];mk(p.x,p.z);m.txt='Disable the cameras and alarms at the security panel';return false}return true},
    auto(m){killSquad(m);m.panelDone=true}},
   {init(m){m.vd={hold:0};say2(a.card?'r6_m19_vault':'r6_m19_drill')},
    upd(m,dt){const need=a.card?2:9,p=T.pt(0,-0.6);mk(p.x,p.z);const done=holdAt(m.vd,p.x,p.z,need,dt,2.2);m.meters=m.vd.hold>0?[{label:a.card?'Using the access card…':'Drilling the lock…',v:m.vd.hold/need,col:'#ffd23f'}]:[];
      m.txt=a.card?'Open the Vault with Prakash\'s access card':'Drill through the Vault door';if(!a.card&&!m.loud&&m.vd.hold>need/2&&!m.alarm)raiseAlarm(m,'r6_m19_alarm');
      if(done){T.open();if(m.loud||m.alarm)spawnSquad(T.x,T.z-7,2,m,{rx:5,rz:3,aggro:true,weps:['smg']});return true}return false},auto(m){m.vd.hold=99}},
   stSearch({txt:'Take the records (the cash is a bonus)',kind:'doc',unit:'records',cx:T.x,cz:T.z-7,r:30,pts:()=>[{...T.pt(-6,-8),y:1,id:'rec'},{...T.pt(6,-8),y:1,id:'ledger'},{...T.pt(-10.5,-5),y:1,id:'cash1',optional:true},{...T.pt(10.5,-5),y:1,id:'cash2',optional:true}],
     found(p,m){if(p.id.startsWith('cash'))a1Bonus(m,15000,'Cash from the Vault');else if(p.id==='ledger')say2('r6_m19_loot')}}),
   stExitRoom('Get out of the tower'),
   stDo(m=>{if(m.loud)wanted=Math.max(wanted,3);else if(m.alarm)wanted=Math.max(wanted,2);else{m.reward+=10000;toast('GHOST','In and out unseen · +₹10,000',2.5)}}),
   {upd(m){const v=m.car;mk(v.pos.x,v.pos.z);m.txt='Get to the getaway car';m.meters=[];if(v.wrecked)return'The getaway car was wrecked';return player.vehicle===v},auto(m){enterVehicle(m.car)}}]}},
 {title:'No Way Out',reward:20000,ready:a3Ready,onDone:()=>a3Chain(STORY.indexOf(ACT3[6])),
  make:()=>{const G=a3Gate(),H=a3House(),a2=A2();return[
   stDo(m=>{say2('r6_m20_comp');wanted=Math.max(wanted,a2.inspector==='ally'?1:a2.inspector==='coerced'?2:3);if(a2.inspector==='ally')say2('r6_m20_bhaskar');
     if(a2.kathir==='forgiven')setTimeout(()=>{if(mission===m){say2('r6_m20_kathir');wanted=Math.max(0,wanted-1);floatMsg('Kathir pulls some of the police away in his car')}},8000);
     if(a2.selviTrust>=2)setTimeout(()=>{if(mission===m){say2('r6_m20_workers');floatMsg('Selvi\'s workers block the road behind you')}},16000)}),
   stGo(G.x,G.z,'The main road is blocked: take the railway corridor to the level crossing',{r:25,timer:150}),
   stKill(G.x,G.z,a2.selviTrust>=2?3:5,'Devarajan\'s security team is waiting at the crossing. Fight through',{rx:16,rz:16,aggro:true,weps:['smg','rifle']}),
   {upd(m){mk(H.x,H.z);m.txt=wanted>0?'Lose the police, then get to the Lakeview safehouse':'Get the files to the Lakeview safehouse';m.meters=[];return wanted===0&&farFrom(H.x,H.z)<15},auto(m){wanted=0;testNear(H,2)}},
   stTalk('r6_m20_end')]}},
 {title:'The Architect',reward:25000,ready:a3Ready,onDone:()=>{A3().done=true;queueSave()},
  make:()=>{const H=a3House();return[
   stDo(m=>{const p=npc({shirt:'#f4f1e8',pants:'#f4f1e8',lower:'veshti',skin:'#8d5524',hair:'#d9d9d9',stache:true},H.x-1.5,H.z,0),a=npc(LOOK.arjun,H.x+1.5,H.z,0);m.cleanup.push(()=>{npcGone(p);npcGone(a)});m.ticks.push((m,dt)=>{npcIdle(p,dt,true);npcIdle(a,dt,true)})}),
   stGo(H.x,H.z+2.5,'Take the files into the safehouse',{r:6}),stTalk('r6_m21_arjun'),stWait(3,'Decrypting the files…'),
   stPhone({header:'DECRYPTED · DEVARAJAN VAULT',lines:['PROJECT KOVAI','PHASE 01 – COMPLETED','NEXT LOCATION – PENDING','','ENCRYPTED TRANSMISSION RECEIVED','THE ARCHITECT IS WATCHING.'],footer:'CONNECTION TERMINATED'}),
   stDo(()=>ringPhone(3)),stWait(3.3,'A phone is ringing…'),stTalk('r6_m21_call'),stDo(()=>fade(1,1.4)),stWait(2.6,''),
   stCard({title:'KOVAI STREETS',lines:['ACT 3 COMPLETE'],quote:'"You have been looking at the wrong city."'}),stDo(()=>fade(0,1.4)),stTalk('r6_m21_para')]}}];
STORY.push(...ACT3);
