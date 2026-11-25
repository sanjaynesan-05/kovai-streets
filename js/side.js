/* Kovai Streets: side.js
 * Rebuild step R7 (Kovai_Streets_Storyline_2.0.md section 5): optional content.
 * A. Character side missions, 3 each: Paramasivam (The Old Days, from his story menu), Kathir (Brothers in Trouble, Campus Nagar),
 *    Selvi (Workers' Lives, Old Kovai), Bhaskar (Behind the Badge, East Junction). Stage framework of missions.js/story2.js/act1.js.
 * B. District activities: district goods for deliveries (missions.js), Hillcrest off-road races, fishing at the Silver Lake jetty,
 *    a street-food stall in Lakeview.
 * C. Ten random world events, one at a time, only in free roam; all can be ignored.
 * State: PROG.side (saved, see sanitizeSide). Classic script, loaded after act3.js.
 */
'use strict';

PROG.side={para:0,kathir:0,selvi:0,bhaskar:0};
function sanitizeSide(s){s=s&&typeof s==='object'?s:{};const n=v=>typeof v==='number'&&isFinite(v)?clamp(Math.floor(v),0,3):0;return{para:n(s.para),kathir:n(s.kathir),selvi:n(s.selvi),bhaskar:n(s.bhaskar)}}
const sp=(x,z)=>{const[a,b]=geoSidewalk(x,z);return{x:a,z:b}};

/* ---------- A. character side missions ---------- */
const SIDE={
 para:{name:'Paramasivam Anna',sub:'The Old Days',unlock:()=>PROG.story>=6,missions:[
  {title:'The Old Deeds',reward:4000,intro:'The first deeds of our mill are somewhere in Old Kovai Mills. Find them before they are lost.',
   make:()=>{const O=SITE('mill_kovai');return[stGo(O.x,O.z,'Go to Old Kovai Mills',{r:30}),
    stSearch({txt:'Find the old mill documents',kind:'doc',unit:'documents',cx:O.x,cz:O.z,r:40,pts:()=>[{...sitePt(O,-10,6),y:0.7,id:'a'},{...sitePt(O,8,-6),y:0.7,id:'b'},{...sitePt(O,12,10),y:0.7,id:'c'}]}),
    stGo(GIVER.x,GIVER.z,'Bring them to Paramasivam Anna',{r:5}),stTalk('s_p1_end')]}},
  {title:'Old Friends',reward:5000,intro:'My old workers are scattered across the city now. Go and see them for me.',
   make:()=>[stMeet({txt:'Visit Paramasivam\'s old workers (Old Kovai, Lakeview, Campus Nagar)',people:()=>[{...sp(1140,-410),line:'s_p2_a'},{...sp(450,1180),line:'s_p2_b',look:{female:true,long:true,lower:'saree',shirt:'#e76f51',pants:'#e76f51',skin:'#8d5524',hair:'#c9c9c9'}},{...sp(-800,-760),line:'s_p2_c'}]}),stTalk('s_p2_end')]},
  {title:'The Mill\'s Story',reward:6000,intro:'The Town Hall archive has the mill\'s history. And photograph our old chimney for me.',
   make:()=>{const T=sp(180,-300),O=SITE('mill_kovai');return[stGo(T.x,T.z,'Go to the Town Hall archive',{r:6}),
    stSearch({txt:'Find the mill\'s founding record',kind:'doc',unit:'record',cx:T.x,cz:T.z,r:20,pts:()=>[{...a3Pt(T.x+3,T.z,2),y:0.8,id:'rec'}]}),
    stPhoto({txt:'Photograph the old chimney at Old Kovai Mills',at:()=>({x:O.x,z:O.z,y:12}),min:25,max:90}),stTalk('s_p3_end')]}}]},
 kathir:{name:'Kathir',sub:'Brothers in Trouble',letter:'K',col:'#1d4ed8',at:()=>sp(-760,-720),look:()=>LOOK.kathir,unlock:()=>PROG.a2&&PROG.a2.kathir==='forgiven',missions:[
  {title:'Loan Sharks',reward:4000,intro:'Anna, the loan sharks are at my house again. Please help.',
   make:()=>{const H=sp(-700,-770);return[stTalk('s_k1_a'),stGo(H.x,H.z,'Go to Kathir\'s house in Campus Nagar',{r:20}),stKill(H.x,H.z,4,'Drive off the loan sharks',{rx:10,rz:10,aggro:true}),stTalk('s_k1_end')]}},
  {title:'Kavya\'s Ride',reward:5000,intro:'Someone is following my sister Kavya. Stop them!',
   make:()=>{const C=sp(-820,-800);return[stTalk('s_k2_a'),stGo(C.x,C.z,'Find Kavya\'s auto near the college',{r:40}),stWreck(()=>{const v=geoFleeCar('suv',C.x,C.z,'#151515',17);v.hp=700;return v},'Stop the black SUV following Kavya',{timer:150}),stTalk('s_k2_end')]}},
  {title:'Brothers\' Race',reward:6000,intro:'One race, like brothers. Ready?',
   make:()=>{const P=[sp(-500,-760),sp(-190,-690),sp(200,-320),sp(-400,140)];return[stTalk('s_k3_a'),...P.map((p,i)=>stGo(p.x,p.z,`Race Kathir: checkpoint ${i+1}/4`,{r:14,timer:i?50:70})),stTalk('s_k3_end')]}}]},
 selvi:{name:'Selvi Akka',sub:'Workers\' Lives',letter:'W',col:'#8c1c13',at:()=>sp(1120,-390),look:()=>LOOK.selvi,unlock:()=>PROG.story>=9,missions:[
  {title:'Relief Run',reward:4000,intro:'The displaced families in Mill Estate need food. Take these supplies.',
   make:()=>{const A=sp(1160,-430),B=sp(-1300,40);return[stGo(A.x,A.z,'Pick up the relief supplies at the Old Kovai market',{r:8}),stGo(B.x,B.z,'Get them to the families in Mill Estate',{r:10,timer:240}),stTalk('s_s1_end')]}},
  {title:'Unpaid Wages',reward:5000,intro:'A contractor in Greenfield owes our workers six months of wages.',
   make:()=>{const G=sp(1790,960);return[stGo(G.x,G.z,'Find the contractor in Greenfield',{r:10}),stTalk('s_s2_a'),
    stCatch({txt:'He\'s running. Catch the contractor',look:{shirt:'#f4f1e8',pants:'#2b2d42',lower:'pants',stache:true},from:()=>({x:G.x+4,z:G.z+3}),to:()=>({x:G.x+140,z:G.z+60})}),stTalk('s_s2_end')]}},
  {title:'False Deeds',reward:7000,intro:'The land registrar keeps forged deeds in his office near the Town Hall. Get them, at night.',
   make:()=>{const R=sp(260,-360);return[stDo(()=>{tod=22}),stGo(R.x,R.z,'Go to the registrar\'s office near Town Hall Square',{r:30}),
    stDo(m=>{addGuards(m,[{path:[[R.x-10,R.z],[R.x+10,R.z]]},{path:[[R.x,R.z-8],[R.x,R.z+8]]}],{wep:'pistol',band:'#2b2d42',range:13});m.alarmLine=null;m.ticks.push((m,dt)=>stealthTick(m,dt))}),
    stSearch({txt:'Photograph the forged deeds',kind:'doc',unit:'deeds',cx:R.x,cz:R.z,r:30,pts:()=>[{...a3Pt(R.x-6,R.z+4,2),y:0.8,id:'a'},{...a3Pt(R.x+6,R.z-4,2),y:0.8,id:'b'}]}),
    stEscape({txt:'Get 100 m away',x:R.x,z:R.z,r:100}),stTalk('s_s3_end')]}}]},
 bhaskar:{name:'Inspector Bhaskar',sub:'Behind the Badge',letter:'B',col:'#7a5f3a',at:()=>({x:POLICE_ST.door.x+4,z:POLICE_ST.door.z+3}),look:()=>LOOK.bhaskar,unlock:()=>PROG.story>=11&&!!(PROG.a2&&PROG.a2.inspector),missions:[
  {title:'Bad Apples',reward:5000,intro:'One of my own officers is on Devarajan\'s payroll. I need proof.',
   make:()=>{const D=POLICE_ST.door,G=sp(1700,900);return[stTalk('s_b1_a'),stGo(D.x-10,D.z+14,'Wait near the station for Raghu\'s jeep',{r:30}),
    stTail({txt:'Follow Sub-inspector Raghu\'s jeep',type:'jeep',color:'#f4f1e8',speed:10,route:()=>{const a={x:D.x-10,z:D.z+10},leg=roadLeg(a,G)||[a,G];leg[leg.length-1].stop=1e9;return leg},onStop:(p,m)=>{m.atEnd=true},until:m=>!!m.atEnd}),
    stPhoto({txt:'Photograph Raghu taking the money',at:m=>({x:m.tgt.pos.x,z:m.tgt.pos.z}),min:20,max:70}),stTalk('s_b1_end')]}},
  {title:'Evidence Room',reward:6000,intro:'The mill fire evidence vanished from our own storage yard. Get it back, quietly.',
   make:()=>{const Y=a3Pt(POLICE_ST.door.x+30,POLICE_ST.door.z+25,6);return[stTalk('s_b2_a'),stDo(()=>{tod=23}),stGo(Y.x,Y.z,'Go to the police storage yard',{r:30}),
    stDo(m=>{addGuards(m,[{path:[[Y.x-12,Y.z-6],[Y.x+12,Y.z-6]]},{path:[[Y.x+10,Y.z-10],[Y.x+10,Y.z+10]]},{path:[[Y.x-10,Y.z+8],[Y.x+8,Y.z+8]]}],{wep:'pistol',shirt:'#c2a878',band:'#7a5f3a',range:13});m.alarmLine=null;m.ticks.push((m,dt)=>stealthTick(m,dt))}),
    stSearch({txt:'Recover the evidence boxes',kind:'doc',unit:'boxes',cx:Y.x,cz:Y.z,r:30,pts:()=>[{...a3Pt(Y.x-5,Y.z,2),y:0.6,id:'a'},{...a3Pt(Y.x+5,Y.z+3,2),y:0.6,id:'b'},{...a3Pt(Y.x,Y.z-4,2),y:0.6,id:'c'}]}),
    stEscape({txt:'Get 100 m away from the yard',x:Y.x,z:Y.z,r:100}),stTalk('s_b2_end')]}},
  {title:'The Informant',reward:6000,intro:'An informant of mine in Old Kovai has been found out. Get to him first.',
   make:()=>{const I=sp(1180,-460);return[stMeet({txt:'Find Bhaskar\'s informant in Old Kovai',people:()=>[{...I,line:'s_b3_a'}]}),
    stChoice({title:'The Informant',line:'They are coming for me tonight.',txt:'Decide what to do with the informant',opts:[
      {t:'Protect him yourself (fight off the hitmen)',fn:m=>{m.protect=true;say2('s_b3_protect')}},{t:'Hand him to Bhaskar for a safe cell',fn:m=>{say2('s_b3_hand')}}]}),
    {init(m){m.left=0;if(m.protect)spawnSquad(I.x+20,I.z+20,4,m,{rx:8,rz:8,aggro:true,weps:['pistol','smg']})},upd(m){m.txt='Fight off the hitmen · left: '+Math.max(0,m.left);m.meters=[];marker.visible=false;return m.left<=0&&!subBusy()},auto(m){killSquad(m);clearSubs()}},
    stTalk('s_b3_end')]}}]}};
function startSide(key){const C=SIDE[key],i=PROG.side[key],S=C.missions[i];if(!S||mission)return;offers=[];if(talk)closeTalk();
  mission={type:'story',idx:-1,side:key,sideI:i,title:`${C.sub} ${i+1}/3: ${S.title}`,reward:S.reward,txt:'',steps:[],step:0,timer:null,stages:S.make(),stage:0,wave:0,custom:stageTick,done:sideDone,ticks:[],cleanup:[],meters:[]};
  startStage(mission);noise(0.12,3000,0.2,1)}
function sideDone(m){player.cash+=m.reward;rep+=1;PROG.side[m.side]=Math.max(PROG.side[m.side],m.sideI+1);toast('SIDE MISSION PASSED','+₹'+m.reward.toLocaleString('en-IN'),3);noise(0.2,3500,0.25,1);
  if(m.side==='bhaskar'&&PROG.side.bhaskar===3){A3().intel=Math.min(3,A3().intel+1);setTimeout(()=>floatMsg('Bhaskar shares the tower\'s patrol logs: more intel for the heist'),3400)}endMissionCleanup()}
function sideOpts(key){const C=SIDE[key],i=PROG.side[key],S=C.missions[i];if(!S||mission||!C.unlock())return[];return[{t:`${C.sub} ${i+1}/3: "${S.title}" (₹${S.reward.toLocaleString('en-IN')})`,fn:()=>{startSide(key);return false}}]}
function sideTalk(key){const C=SIDE[key],S=C.missions[PROG.side[key]];return{kind:'side',obj:C.pos,hdr:()=>`<h3>${esc(C.name)}</h3><div class="sub">${esc(C.sub)} · ${PROG.side[key]}/3 done</div>`,
  line:mission?'Finish what you are doing first.':S?S.intro:'Thank you for everything. Come by any time.',optsFn:()=>sideOpts(key).concat([{t:'Bye',fn:()=>false}]),opts:sideOpts(key).concat([{t:'Bye',fn:()=>false}])}}

/* ---------- B. district activities ---------- */
const DGOODS={'Mill Estate':['cotton yarn bales','spare loom parts','pump-set motors'],'Old Kovai':['sacks of market vegetables','handloom silk sarees','jasmine garlands for a wedding'],
  'Central Kovai':['urgent courier envelopes','hot parcels of biryani'],'Greenfield':['fresh coconuts','sacks of turmeric','farm vegetables'],'Lakeview':['crates of fresh fish','sacks of filter-coffee powder'],
  'Campus Nagar':['exam papers for the college','cricket kit for the college team'],'East Junction':['bus spare parts','parcels for the bus terminus'],'Hillcrest':['Siruvani water cans','tea from the hill estates']};
function districtGoods(x,z){return rpick(DGOODS[district(x,z)]||GOODS)}
const ACTS={fish:null,food:null};let fishing=null;
function buildActivities(){if(ACTS.fish||!NAV.ready)return;const J=SITE('jetty');ACTS.fish=J?WO(ox(725),200):null;ACTS.food=sp(470,1150);
  const stall=GB();gbBox(stall,3,1,1.4,0,0.5,0,'#8c5a3c');gbBox(stall,3.4,0.15,1.8,0,2.4,0,'#e63946');for(const s of[-1,1])gbBox(stall,0.1,1.4,0.1,s*1.5,1.7,0.6,'#5d4037');
  const m=gbMesh(stall);m.position.set(ACTS.food.x,groundH(ACTS.food.x,ACTS.food.z),ACTS.food.z);scene.add(m);
  const s=signMesh(signTex([['KOTHU PAROTTA','bold 52px Rajdhani,sans-serif']],'#ffd23f','#111',512,96),2.8,0.55);s.position.set(ACTS.food.x,2.9,ACTS.food.z+0.95);scene.add(s)}
function foodTalk(){return{kind:'side',obj:ACTS.food,hdr:()=>`<h3>Lakeview street food</h3><div class="sub">Kothu parotta stall · Cash ₹${Math.floor(player.cash).toLocaleString('en-IN')}</div>`,line:'Hot kothu parotta, thambi! Sixty rupees.',
  optsFn:()=>foodOpts(),opts:foodOpts()}}
function foodOpts(){return[{t:'Kothu parotta (₹60, full health)',off:player.cash<60,fn:()=>{if(player.cash<60)return'Sixty rupees, thambi.';player.cash-=60;player.hp=100;return'Enjoy! Full health.'}},{t:'Bye',fn:()=>false}]}
function fishTalk(){return{kind:'side',obj:ACTS.fish,hdr:()=>`<h3>Silver Lake jetty</h3><div class="sub">Fishing spot</div>`,line:'Cast a line and keep still until something bites.',
  optsFn:()=>[{t:'Fish (bait ₹20)',fn:()=>{if(player.cash<20)return'Bait is ₹20.';player.cash-=20;fishing={t:RR(5,11),x:player.pos.x,z:player.pos.z};floatMsg('Line cast. Keep still…');return false}},{t:'Bye',fn:()=>false}],
  opts:[{t:'Fish (bait ₹20)',fn:()=>{if(player.cash<20)return'Bait is ₹20.';player.cash-=20;fishing={t:RR(5,11),x:player.pos.x,z:player.pos.z};floatMsg('Line cast. Keep still…');return false}},{t:'Bye',fn:()=>false}]}}
function updateFishing(dt){if(!fishing)return;if(player.vehicle||mission||Math.hypot(player.pos.x-fishing.x,player.pos.z-fishing.z)>1){fishing=null;floatMsg('The fish got away');return}
  fishing.t-=dt;if(fishing.t<=0){const f=rpick([['a small kendai',150],['a fat rohu',350],['a big catla',600],['an old slipper',0]]);player.cash+=f[1];floatMsg(`You caught ${f[0]}`+(f[1]?` · sold for ₹${f[1]}`:''));fishing=null}}

/* ---------- side givers in the world ---------- */
const SIDE_NPC={};
function sideTalkable(){const p=player.pos;for(const k of['kathir','selvi','bhaskar']){const C=SIDE[k];if(!C.pos||!C.unlock())continue;if(Math.hypot(p.x-C.pos.x,p.z-C.pos.z)<2.8)return{kind:'side',hint:'to talk to '+C.name,custom:()=>sideTalk(k)}}
  if(ACTS.food&&Math.hypot(p.x-ACTS.food.x,p.z-ACTS.food.z)<2.8)return{kind:'side',hint:'to buy street food',custom:foodTalk};
  if(ACTS.fish&&!fishing&&Math.hypot(p.x-ACTS.fish.x,p.z-ACTS.fish.z)<3.5)return{kind:'side',hint:'to fish',custom:fishTalk};return null}
function letterIcon(L,col){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=col;g.beginPath();g.arc(32,32,28,0,7);g.fill();g.lineWidth=4;g.strokeStyle='#fff';g.stroke();
  g.fillStyle='#fff';g.font='bold 34px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(L,32,34);return c}
const SIDE_ICON={};
function sideIcons(a){for(const k of['kathir','selvi','bhaskar']){const C=SIDE[k];if(!C.pos||!C.unlock()||PROG.side[k]>=3)continue;a.push({x:C.pos.x,z:C.pos.z,img:SIDE_ICON[k]||(SIDE_ICON[k]=letterIcon(C.letter,C.col)),edge:false})}}
function updateSideNpcs(dt){if(!NAV.ready)return;buildActivities();for(const k of['kathir','selvi','bhaskar']){const C=SIDE[k];if(!C.pos)C.pos=C.at();
  const want=C.unlock()&&PROG.side[k]<3&&!(mission&&mission.side===k)&&Math.hypot(player.pos.x-C.pos.x,player.pos.z-C.pos.z)<120;
  if(want&&!SIDE_NPC[k])SIDE_NPC[k]=npc(C.look(),C.pos.x,C.pos.z,0);else if(!want&&SIDE_NPC[k]){npcGone(SIDE_NPC[k]);SIDE_NPC[k]=null}if(SIDE_NPC[k])npcIdle(SIDE_NPC[k],dt,true)}}

/* ---------- C. random world events ---------- */
function rmGoon(g){const i=goons.indexOf(g);if(i>=0){scene.remove(g.h.g);goons.splice(i,1)}}
const EVENTS=[
 {id:'cricket',where:'Campus Nagar',start(P){const C=roadPoint(P.x,P.z,30,70),kids=[];for(let k=0;k<7;k++){const[x,z]=findOpen(C.x+RR(-8,8),C.z+RR(-8,8),2,2);kids.push(npc(LOOK.worker(),x,z,RR(0,6)))}
   floatMsg('A street cricket match has started nearby');let t=90,bat=false;return{upd(dt){t-=dt;kids.forEach((n,i)=>{if(i===0){n.moving=true;walkTo(n,C.x+Math.sin(time)*6,C.z,2.5,dt)}npcIdle(n,dt,i!==0)});
     if(!bat&&Math.hypot(player.pos.x-kids[1].x,player.pos.z-kids[1].z)<3&&!player.vehicle){bat=true;rep+=1;toast('SIXER!','The kids let you bat · Respect up',2.4)}return t<=0||farFrom(C.x,C.z)>220},end(){kids.forEach(npcGone)}}}},
 {id:'breakdown',start(P){const v=vehicles.find(v=>v.ai&&!v.keep&&!v.policeAI&&v!==player.vehicle&&Math.hypot(v.pos.x-P.x,v.pos.z-P.z)>30&&Math.hypot(v.pos.x-P.x,v.pos.z-P.z)<150);if(!v)return null;
   const ai=v.ai;v.ai=null;const o={hold:0};let t=90;floatMsg('A vehicle has broken down up the road');return{upd(dt){t-=dt;if(Math.random()<dt*3)smoke(v.pos.x,1.4,v.pos.z,0x666666);
     if(!vehicles.includes(v)||v.wrecked)return true;if(holdAt(o,v.pos.x,v.pos.z,2,dt,3.5)){player.cash+=300;floatMsg('You helped fix it. "Thanks, thambi!" +₹300');return true}return t<=0},end(){if(vehicles.includes(v)&&!v.wrecked)v.ai=ai}}}},
 {id:'harass',start(P){const C=roadPoint(P.x,P.z,40,100),keeper=npc({shirt:'#f4f1e8',pants:'#2b2d42',lower:'lungi',skin:'#6b3f1d'},C.x,C.z,0),gs=[];
   for(let k=0;k<3;k++){const g=spawnGoon(C.x+RR(-3,3),C.z+RR(-3,3),null,false,{wep:'pistol'});gs.push(g)}floatMsg('Some thugs are harassing a shopkeeper nearby');let t=120;
   return{upd(dt){t-=dt;npcIdle(keeper,dt,true);if(gs.every(g=>g.dead)){player.cash+=1200;floatMsg('Shopkeeper: "God bless you, thambi!" +₹1,200');return true}return t<=0||farFrom(C.x,C.z)>250},end(){npcGone(keeper);gs.forEach(g=>{if(!g.dead)rmGoon(g)})}}}},
 {id:'checkpoint',where:'East Junction',start(P){const C=roadPoint(P.x,P.z,80,160),cars=[spawnVehicle('police',C.x-3,C.z,Math.PI/2),spawnVehicle('police',C.x+3,C.z,-Math.PI/2)];cars.forEach(v=>v.keep=true);
   floatMsg('Police checkpoint ahead');let t=120,hit=false;return{upd(dt){t-=dt;if(!hit&&wanted>0&&farFrom(C.x,C.z)<20){hit=true;wanted=Math.min(5,wanted+1);floatMsg('You drove through a checkpoint!')}return t<=0||farFrom(C.x,C.z)>300},
     end(){cars.forEach(v=>{if(vehicles.includes(v)&&v!==player.vehicle)removeVehicle(v)})}}}},
 {id:'follow',can:()=>!!player.vehicle,start(P){const C=roadPoint(P.x,P.z,60,90),v=spawnVehicle('suv',C.x,C.z,0,'#111111');v.keep=true;v.hp=600;floatMsg('A black SUV seems to be following you…');let t=70;
   v.script=(v,dt)=>{const Q=playerP(),dx=Q.x-v.pos.x,dz=Q.z-v.pos.z,d=Math.hypot(dx,dz);v.heading+=clamp(angDiff(v.heading,Math.atan2(dx,dz)),-1.5*dt,1.5*dt);v.speed+=clamp((d>25?Math.min(22,d*0.4):0)-v.speed,-12*dt,8*dt)};
   return{upd(dt){t-=dt;if(v.wrecked||!vehicles.includes(v)){player.cash+=800;floatMsg('The SUV is done. Someone\'s leftovers… +₹800');return true}if(farFrom(v.pos.x,v.pos.z)>230){floatMsg('You lost the SUV');return true}return t<=0},
     end(){if(vehicles.includes(v)&&v!==player.vehicle&&!v.wrecked)removeVehicle(v)}}}},
 {id:'gate',can:()=>RAILW.ready&&RAILW.gates.some(g=>farFrom(g.x,g.z)<150&&!g.closed),start(){const g=RAILW.gates.find(g=>farFrom(g.x,g.z)<150);let t=90;
   return{upd(dt){t-=dt;if(g.closed){floatMsg('The railway gates are coming down: a train is coming');return true}return t<=0}}}},
 {id:'procession',where:'Old Kovai',start(P){const A=roadPoint(P.x,P.z,40,80),B=roadPoint(A.x,A.z,120,200),rt=navRoute(A.x,A.z,B.x,B.z,false),pts=rt?rt.pts:[[A.x,A.z],[B.x,B.z]],ppl=[];
   for(let k=0;k<14;k++)ppl.push(Object.assign(npc({shirt:rpick(['#e63946','#ffb703','#fb8500','#f1faee','#06d6a0']),pants:'#f4f1e8',lower:rpick(['veshti','saree']),female:k%3===0,long:k%3===0,skin:rpick(SKIN)},pts[0][0]+RR(-2,2),pts[0][1]-k*1.6,0),{pi:1}));
   floatMsg('A festival procession is passing through Old Kovai');let t=150,beat=0;return{upd(dt){t-=dt;beat-=dt;if(beat<=0&&farFrom(ppl[0].x,ppl[0].z)<80){beat=0.5;noise(0.06,140,0.25,1)}
     let done=true;for(const n of ppl){const q=pts[Math.min(n.pi,pts.length-1)];if(Math.hypot(n.x-q[0],n.z-q[1])<2&&n.pi<pts.length-1)n.pi++;n.moving=Math.hypot(n.x-q[0],n.z-q[1])>1.5;if(n.moving){done=false;walkTo(n,q[0],q[1],1.4,dt)}npcIdle(n,dt,false)}return done||t<=0},end(){ppl.forEach(npcGone)}}}},
 {id:'vendor',start(P){const C=roadPoint(P.x,P.z,10,30),n=npc({shirt:'#ffb703',pants:'#2b2d42',lower:'lungi',skin:'#8d5524'},C.x,C.z,0);floatMsg('A street vendor waves at you: "Thambi, a small job?"');let t=60;
   return{upd(dt){t-=dt;npcIdle(n,dt,true);if(!mission&&farFrom(n.x,n.z)<3){startMission({type:'deliver',x:n.x,z:n.z});return true}return t<=0},end(){npcGone(n)}}}},
 {id:'missing',start(P){const C=roadPoint(P.x,P.z,10,30),w=npc(LOOK.worker(),C.x,C.z,0);let friend=null,t=200;floatMsg('A worker looks worried. Walk up to him.');
   return{upd(dt){t-=dt;npcIdle(w,dt,true);if(!friend){if(farFrom(w.x,w.z)<3){const F=roadPoint(w.x,w.z,150,300);friend=npc(LOOK.worker(),F.x,F.z,0);floatMsg('"My friend Murugan never came back from the market. Please find him!"')}}
     else{npcIdle(friend,dt,true);if(!mission)mk(friend.x,friend.z);if(farFrom(friend.x,friend.z)<3){player.cash+=800;floatMsg('Murugan: "I got lost after the bus broke down!" +₹800');return true}}return t<=0},end(){npcGone(w);if(friend)npcGone(friend);if(!mission)marker.visible=false}}}},
 {id:'tip',start(P){const C=roadPoint(P.x,P.z,200,400),o={hold:0},g=a2Prop('opt',C.x,C.z,0.8);let t=240;openPhone({header:'UNKNOWN NUMBER',lines:['"Someone stashed cash near '+district(C.x,C.z)+'."','"Go before they come back."'],footer:'NUMBER WITHHELD'},()=>{});
   return{upd(dt){t-=dt;g.rotation.y+=dt*2;if(!mission)mk(C.x,C.z);if(holdAt(o,C.x,C.z,1,dt,2)){const c=Math.round(RR(1500,3000)/50)*50;player.cash+=c;floatMsg('You found the stash: +₹'+c.toLocaleString('en-IN'));return true}return t<=0},
     end(){scene.remove(g);if(!mission)marker.visible=false}}}}];
let EV=null,evT=90;
function updateEvents(dt){if(EV){let over=false;try{over=EV.upd(dt)}catch(e){console.error(e);over=true}if(over||(mission&&EV.id!=='tip')){try{if(EV.end)EV.end()}catch(e){}EV=null;evT=RR(70,140)}return}
  if(mission||player.dead||cineHold||player.inShop||!NAV.ready)return;evT-=dt;if(evT>0)return;evT=20;const P=playerP(),dn=district(P.x,P.z),c=EVENTS.filter(e=>(!e.where||e.where===dn)&&(!e.can||e.can()));if(!c.length)return;
  const e=rpick(c);const o=e.start(P);if(o){o.id=e.id;EV=o}}
function updateSide(dt){updateSideNpcs(dt);updateFishing(dt);updateEvents(dt)}
