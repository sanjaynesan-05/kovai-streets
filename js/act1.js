/* Kovai Streets: act1.js
 * Rebuild step R4 (REBUILD_SPEC.md, Kovai_Streets_Storyline_2.0.md): Act 1, "Kovai's Mills" (story missions 1-6), multi-stage.
 * New reusable stages (also used by Acts 2-3): stMeet (talk to people), stFree (free captives), stCatch (catch someone on foot),
 * stPhoto (photograph from a distance), stTail (follow a vehicle unseen), stDefend (hold off attackers while arsonists go for
 * the looms), stEscape (get away before reinforcements), stBoss2 (a boss who changes cover and may run for it).
 * Places: the mission sites of geosites.js (the Mill Estate mill, the spinning mill, the Silver Hill quarry yard, the Silver Lake jetty,
 * Old Kovai Mills). Classic script, loaded after story2.js; Act 1 is put at the front of STORY (Act 2 follows as 7-14).
 */
'use strict';

/* ---------- reusable stages ---------- */
/* talk to people: walk up to each one and stay close a moment; each says their line */
function stMeet(o){return{init(m){m.meet=o.people().map(p=>{const n=p.n||npc(p.look||LOOK.worker(),p.x,p.z,p.yaw||0);/* p.n: someone already there */n.line=p.line;n.done=false;return n});
    m.cleanup.push(()=>m.meet.forEach(npcGone));m.ticks.push((m,dt)=>{for(const n of m.meet||[])npcIdle(n,dt,true)})},
  upd(m,dt){for(const n of m.meet){if(n.done)continue;if(!subBusy()&&holdAt(n,n.x,n.z,0.8,dt,2.6)){n.done=true;say2(n.line)}}
    const left=m.meet.filter(n=>!n.done);if(left.length)mk(left[0].x,left[0].z);else marker.visible=false;m.txt=`${o.txt} · ${m.meet.length-left.length}/${m.meet.length}`;m.meters=[];return!left.length&&!subBusy()},
  auto(m){for(const n of m.meet)n.done=true;clearSubs()}}}
/* free people held captive (stay close a moment); optional ones are a bonus */
function stFree(o){return{timer:o.timer,init(m){m.cap=o.people().map(p=>{const n=npc(LOOK.worker(),p.x,p.z,RR(0,6));n.opt=!!p.optional;n.free=false;return n});m.cleanup.push(()=>m.cap.forEach(npcGone));
    m.ticks.push((m,dt)=>{for(const n of m.cap||[]){if(n.free){n.moving=true;walkTo(n,n.x+(n.x-o.cx),n.z+(n.z-o.cz),3,dt);npcIdle(n,dt,false)}else{npcIdle(n,dt,false);seatPose(n.h);n.h.g.position.y-=0.45}}})},
  upd(m,dt){for(const n of m.cap){if(n.free)continue;if(holdAt(n,n.x,n.z,o.hold||1.4,dt,2.2)){n.free=true;floatMsg(o.freedMsg||'Freed');if(o.onFree)o.onFree(n,m)}}
    const req=m.cap.filter(n=>!n.opt),left=req.filter(n=>!n.free),near=m.cap.find(n=>!n.free&&n.hold>0);m.meters=near?[{label:'Untying…',v:near.hold/(o.hold||1.4),col:'#ffd23f'}]:[];
    if(left.length)mk(left[0].x,left[0].z);m.txt=`${o.txt} · ${req.length-left.length}/${req.length}`;return!left.length},
  auto(m){for(const n of m.cap){n.free=true;if(o.onFree)o.onFree(n,m)}}}}
/* chase someone on foot and catch them (get within 2 m); fails if they get 120 m away */
function stCatch(o){return{timer:o.timer||90,init(m){const a=o.from(),b=o.to(),r=npc(o.look||LOOK.worker(),a.x,a.z,0);r.tx=b.x;r.tz=b.z;m.runner=r;m.cleanup.push(()=>npcGone(r));if(o.line)say2(o.line)},
  upd(m,dt){const r=m.runner,P=playerP(),d=Math.hypot(r.x-P.x,r.z-P.z);r.moving=Math.hypot(r.x-r.tx,r.z-r.tz)>1.5;if(r.moving)walkTo(r,r.tx,r.tz,d<25?(o.speed||5.4):3.2,dt);npcIdle(r,dt,false);
    mk(r.x,r.z);m.txt=o.txt;m.meters=[];if(d<2.2){r.moving=false;if(o.onCatch)o.onCatch(r,m);return true}return d>120?(o.fail||'He got away'):false},
  auto(m){testNear(m.runner,1.5)}}}
/* photograph: stand still in range with a clear view and hold steady */
function stPhoto(o){const mn=o.min||15,mx=o.max||70,S=o.secs||2.5;return{init(m){m.ph=0;m.at=o.at(m)},
  upd(m,dt){if(m.forced){if(o.onDone)o.onDone(m);return true}const t=m.at,P=playerP(),py=player.vehicle?player.vehicle.y:player.pos.y,d=Math.hypot(t.x-P.x,t.z-P.z),still=player.vehicle?Math.abs(player.vehicle.speed)<1:!(K.KeyW||K.KeyS||K.KeyA||K.KeyD),
      ok=d>=mn&&d<=mx&&still&&los(P.x,py+1.5,P.z,t.x,(t.y||0)+1.4,t.z);m.ph=ok?m.ph+dt:Math.max(0,m.ph-dt*0.5);
    m.meters=[{label:ok?'Photographing…':`Photo: stand still ${mn}–${mx} m away with a clear view`,v:m.ph/S,col:'#ffd23f'}];if(d>mx)mk(t.x,t.z);else marker.visible=false;m.txt=o.txt;
    if(m.ph>=S){noise(0.08,5200,0.3,1);m.meters=[];if(o.onDone)o.onDone(m);return true}return false},
  auto(m){m.forced=true}}}
/* tail a vehicle on a route without being spotted; o.until(m) ends the stage (default: route done) */
function stTail(o){const mn=o.min||20,mx=o.max||85;return{init(m){const pts=o.route(m),p0=pts[0],p1=pts[1]||p0,v=spawnVehicle(o.type||'suv',p0.x,p0.z,Math.atan2(p1.x-p0.x,p1.z-p0.z),o.color||'#151515');
    v.keep=true;v.hp=o.hp||1e6;const R={pts,i:1,speed:o.speed||11,hold:0};R.onStop=p=>{if(o.onStop)o.onStop(p,m)};v.script=routeDrive(R);m.tgt=v;m.R=R;m.sus=0;m.lostT=0;m.cleanup.push(()=>{if(vehicles.includes(v)&&v!==player.vehicle)removeVehicle(v)})},
  upd(m,dt){const v=m.tgt,P=playerP(),d=Math.hypot(v.pos.x-P.x,v.pos.z-P.z);mk(v.pos.x,v.pos.z);
    if(d<mn)m.sus+=((mn-d)*2.5+12)*dt;else m.sus=Math.max(0,m.sus-7*dt);if(d>mx)m.lostT+=dt;else m.lostT=0;
    if(m.sus>=100)return'They spotted you';if(m.lostT>10||d>240)return'You lost them';
    m.meters=[{label:d>mx?'Losing them…':'Suspicion',v:d>mx?Math.min(1,m.lostT/10):m.sus/100,col:d>mx?'#7fb8ff':m.sus>60?'#ff4d4d':'#ffb347'}];m.txt=`${o.txt} (stay ${mn}–${mx} m behind)`;
    return m.forced||(o.until?o.until(m):!!m.R.done)},
  auto(m){m.R.done=true;m.forced=true}}}
/* hold off attackers while arsonists walk to the looms; a loom burning for 8 s fails the mission */
function stDefend(o){return{timer:o.timer,init(m){m.left=0;m.wave=0;spawnSquad(o.x,o.z,o.n,m,{rx:16,rz:16,aggro:true});m.ars=[];
    for(const L of o.looms){const[x,z]=findOpen(L[0]+(L[0]-o.x)*1.8,L[1]+(L[1]-o.z)*1.8,4,4),g=spawnGoon(x,z,null,false,{wep:'pistol',band:'#111',shirt:'#5c2a0e'});g.mission=m;g.passive=true;g.arsonist=L;g.burn=0;m.left++;m.ars.push(g)}
    m.ticks.push((m,dt)=>{for(const g of m.ars){if(g.dead)continue;const[lx,lz]=g.arsonist;if(Math.hypot(g.x-lx,g.z-lz)>1.5){g.moving=true;walkTo(g,lx,lz,2.4,dt)}else{g.burn+=dt;if(Math.random()<dt*8)smoke(lx+RR(-1,1),RR(0.5,2.5),lz+RR(-1,1),0x553322)}}})},
  upd(m){const worst=Math.max(0,...m.ars.map(g=>g.dead?0:g.burn));if(worst>=8)return'The looms caught fire';m.meters=worst>0?[{label:'The looms are catching fire!',v:worst/8,col:'#ff4d4d'}]:[];
    if(o.waves&&m.left<=0&&m.wave<o.waves){m.wave++;spawnSquad(o.x,o.z,o.n,m,{rx:16,rz:16,aggro:true});toast('MORE OF THEM!','Wave '+(m.wave+1)+' is here',1.8)}
    m.txt=`${o.txt} · attackers left: ${Math.max(0,m.left)}`+(m.ars.some(g=>!g.dead)?' · stop the men going for the looms':'');if(farFrom(o.x,o.z)>40)mk(o.x,o.z);else marker.visible=false;
    return m.left<=0&&m.wave>=(o.waves||0)},
  auto(m){m.wave=99;killSquad(m)}}}
/* get clear of a place (reinforcements arrive) */
function stEscape(o){return{timer:o.timer,init(m){m.left=0;if(o.n){const[fx,fz]=o.from();spawnSquad(fx,fz,o.n,m,{rx:8,rz:8,aggro:true})}if(o.line)say2(o.line)},
  upd(m){m.txt=o.txt;marker.visible=false;m.meters=[];return farFrom(o.x,o.z)>(o.r||110)},auto(m){killSquad(m);testNear({x:o.x+(o.r||110)+5,z:o.z},1)}}}
/* boss: moves between cover points (every 6 s, or when hurt); with o.flee he runs for it when badly hurt and escapes if he gets there */
function stBoss2(o){return{auto(m){if(m.boss&&!m.boss.dead){m.boss.dead=true;m.left--}killSquad(m)},
  init(m){m.left=0;const[px,pz]=findOpen(o.x,o.z,3,3),b=m.boss=spawnGoon(px,pz,null,true,{boss:true,hp:o.hp,shirt:o.shirt||'#e8b923',band:'#111',wep:'rifle'});b.mission=m;m.left++;m.lastHp=o.hp;m.coverI=0;m.coverT=4;
    if(o.guards)spawnSquad(o.x,o.z,o.guards,m,{weps:['smg','rifle'],rx:9,rz:9,aggro:true});toast(o.name.toUpperCase(),o.sub,2.6);if(o.line)say2(o.line);
    m.ticks.push((m,dt)=>{const b=m.boss;if(!b||b.dead)return;
      if(o.flee&&!m.fleeing&&b.hp<o.hp*0.35){m.fleeing=true;if(o.fleeLine)say2(o.fleeLine);floatMsg(o.name+' is running for it. Stop him!')}
      if(m.fleeing){b.aggro=false;b.moving=true;walkTo(b,o.flee.x,o.flee.z,5,dt);return}
      if(o.cover){m.coverT-=dt;if(m.coverT<=0||b.hp<m.lastHp-o.hp*0.15){m.coverT=6;m.lastHp=b.hp;m.coverI=(m.coverI+1)%o.cover.length}const c=o.cover[m.coverI];if(Math.hypot(b.x-c[0],b.z-c[1])>1.2){b.moving=true;walkTo(b,c[0],c[1],4.2,dt)}}})},
  upd(m){const b=m.boss;if(farFrom(o.x,o.z)>45)mk(o.x,o.z);else marker.visible=false;
    if(m.fleeing&&Math.hypot(b.x-o.flee.x,b.z-o.flee.z)<3)return o.name+' escaped';
    m.txt=(m.fleeing?`Stop ${o.name} before he gets away`:`Take down ${o.name} (gold shirt)`)+(m.left>1?` · guards left: ${m.left-1}`:'');return b.dead}}}
/* a point beside site s at (dx, dz) metres, moved to open ground */
function sitePt(s,dx,dz,r){const[x,z]=findOpen(s.x+dx,s.z+dz,r||2,r||2);return{x,z}}
function a1Bonus(m,cash,msg){m.reward+=cash;toast('BONUS',msg+' · +₹'+cash.toLocaleString('en-IN'),2.5)}

/* ---------- Act 1 missions ---------- */
const ACT1=[
 {title:'Smoke Over the Mills',reward:2000,intro:'Vanakkam, thambi. I ran the looms at this Mill Estate mill for thirty years. Now the Black Scorpions squeeze my workers every week. Go in and talk to them.',
  onStart:()=>toast('ACT 1','KOVAI\'S MILLS',4),
  make:()=>{const S=SITE('mill_podanur');return[
   stMeet({txt:'Talk to the workers outside the mill',people:()=>[{...sitePt(S,-30,-28),line:'r4_m1_w1'},{...sitePt(S,-22,-34),line:'r4_m1_w2',look:{female:true,long:true,lower:'saree',shirt:'#6a994e',pants:'#6a994e',skin:'#8d5524'}},{...sitePt(S,-14,-30),line:'r4_m1_w3'}]}),
   stGo(S.x+30,S.z-6,'Go in by the side entrance',{r:6}),
   stSearch({txt:'Optional: find the workers\' pay register (or carry on)',cx:S.x,cz:S.z,r:40,pts:()=>[{...sitePt(S,-8,10),id:'register',optional:true}],
     found(p,m){a1Bonus(m,1000,'Pay register recovered');say2('r4_m1_register')},init(m){},tick(){}}),
   stKill(S.x,S.z,5,'The Scorpions have taken the factory floor. Drive them out',{rx:14,rz:10}),stTalk('r4_m1_recog'),
   stFree({txt:'Help the beaten worker',cx:S.x,cz:S.z,people:()=>[sitePt(S,6,4)],freedMsg:'He can walk',onFree:()=>say2('r4_m1_beaten')}),
   stEscape({txt:'Get out before their reinforcements arrive (110 m away)',x:S.x,z:S.z,r:110,timer:60,n:4,from:()=>[S.x+40,S.z+40]}),
   stGo(GIVER.x,GIVER.z,'Back to Paramasivam Anna at the mill gate',{r:5}),stTalk('r4_m1_end')]}},
 {title:'The Courier',reward:3000,intro:'Sundaram sends a collector round in a black SUV. Today is collection day. My nephew Kathir will show you.',
  make:()=>{const shops=[[-1050,30],[-850,-90],[-650,-160]],J={x:-430,z:-240};return[
   stDo(m=>{const k=npc(LOOK.kathir,GIVER.x+2,GIVER.z+2,0);m.kathir=k;m.cleanup.push(()=>npcGone(k));m.ticks.push((m,dt)=>{if(m.kathir===k&&!m.kathirAway)npcIdle(k,dt,true)})}),
   stGo(GIVER.x+2,GIVER.z+4,'Meet Kathir at the gate',{r:4}),stTalk('r4_m2_kathir'),
   stTail({txt:'Follow the black SUV on its collection round',speed:10,min:18,max:85,
     route:m=>{let pts=[{x:-1290,z:48}],a=pts[0];for(const[x,z]of[...shops,[J.x,J.z]]){const b={x,z},leg=roadLeg(a,b)||[a,b];leg[leg.length-1].stop=x===J.x?18:8;leg[leg.length-1].id=x===J.x?'junction':'shop';pts=pts.concat(leg);a=b}return pts},
     onStop:(p,m)=>{if(p.id==='shop'){m.shops=(m.shops||0)+1;floatMsg(`They're collecting at a shop (${m.shops}/3)`);if(m.shops===1)say2('r4_m2_shop')}
       if(p.id==='junction'){m.atJ=true;const k=m.kathir;k.x=J.x+6;k.z=J.z+4;m.kathirAway=true;say2('r4_m2_block');floatMsg('Kathir has them blocked. Now!')}},
     until:m=>!!m.atJ}),
   stWreck(()=>mission.tgt,'Wreck or steal the courier SUV before it gets away',{timer:90}),
   stGo(GIVER.x,GIVER.z,'Take the money back to the workers at the Mill Estate mill gate',{r:5}),stTalk('r4_m2_end')]}},
 {title:'Burning Looms',reward:4000,intro:'Thambi! They are attacking the spinning mill! The workers are inside. Go, quickly!',
  make:()=>{const S=SITE('mill_singanallur'),looms=[[S.x-8,S.z+2],[S.x+8,S.z-2]];return[
   stGo(S.x,S.z,'Get to the spinning mill',{r:30,timer:120}),
   stFree({txt:'Get the workers out',cx:S.x,cz:S.z,hold:0.8,freedMsg:'Worker out',people:()=>[sitePt(S,-10,-6),sitePt(S,4,8),sitePt(S,12,-4)],onFree:(n,m)=>{if(!m.saidEvac){m.saidEvac=true;say2('r4_m3_evac')}}}),
   stSearch({txt:'Optional: save the production records (or carry on)',cx:S.x,cz:S.z,r:40,pts:()=>[{...sitePt(S,0,-12),id:'records',optional:true}],found(p,m){a1Bonus(m,1000,'Production records saved');say2('r4_m3_records')}}),
   stDefend({txt:'Defend the mill',x:S.x,z:S.z,n:5,waves:1,timer:240,looms}),
   stCatch({txt:'One attacker is running. Catch him',line:'r4_m3_flee',look:{shirt:'#1f1f1f',pants:'#202020',lower:'pants',band:'#111'},from:()=>sitePt(S,18,10),to:()=>({x:S.x+150,z:S.z+90})}),
   stTalk('r4_m3_interrog'),stGo(GIVER.x,GIVER.z,'Tell Paramasivam Anna',{r:5}),stTalk('r4_m3_end')]}},
 {title:'Silver Hill Deal',reward:5000,intro:'Vettu Velu is buying guns at the Silver Hill quarry. Watch first, take photos, then strike.',
  make:()=>{const Q=SITE('dealyard'),gen=sitePt(Q,-14,10);return[
   stGo(Q.x+45,Q.z+40,'Go to the quarry rim, above the yard',{r:12}),
   stDo(m=>{const vans=[spawnVehicle('van',Q.x-4,Q.z-3,0.4,'#2b2d42'),spawnVehicle('van',Q.x+5,Q.z+4,3.6,'#3a3a3a')];vans.forEach(v=>v.keep=true);m.cleanup.push(()=>vans.forEach(v=>{if(v!==player.vehicle)removeVehicle(v)}));
     addGuards(m,[{path:[[Q.x-12,Q.z-12],[Q.x+12,Q.z-12]]},{path:[[Q.x+14,Q.z-8],[Q.x+14,Q.z+12]]},{path:[[Q.x-14,Q.z+12],[Q.x+10,Q.z+14]]},{path:[[Q.x-2,Q.z+2]]}],{wep:'rifle',band:'#111',range:15});
     m.alarmLine=null;m.ticks.push((m,dt)=>{stealthTick(m,dt);if(m.distract>0){m.distract-=dt;m.sus=Math.max(0,m.sus-40*dt)}})}),
   stPhoto({txt:'Photograph the buyers and sellers',at:()=>({x:Q.x,z:Q.z}),min:25,max:75,onDone:()=>say2('r4_m4_photo')}),
   stSearch({txt:'Sneak in by the service road and knock out the generator',kind:'doc',unit:'done',verb:'Pulling the wires…',cx:Q.x,cz:Q.z,r:50,vis:60,pts:()=>[{...gen,y:0.6,id:'gen'}],
     found(p,m){m.distract=15;say2('r4_m4_gen');for(const g of m.guards||[]){if(!g.dead&&g.path){g.path=[[gen.x+RR(-3,3),gen.z+RR(-3,3)]];g.pi=0}}floatMsg('The guards are going to check the generator')}}),
   stDo(m=>raiseAlarm(m,null)),
   stBoss2({x:Q.x,z:Q.z,name:'Vettu Velu',sub:'Sundaram\'s gun buyer',hp:900,guards:2,line:'r4_m4_velu',cover:[[Q.x-5,Q.z-4],[Q.x+6,Q.z+5],[Q.x-8,Q.z+8],[Q.x+9,Q.z-6]]}),
   stSearch({txt:'Take the shipment records from the van',kind:'doc',unit:'records',cx:Q.x,cz:Q.z,pts:()=>[{x:Q.x-4,z:Q.z-1,y:0.6,id:'rec'}],found:()=>say2('r4_m4_records')}),
   stTalk('r4_m4_end')]}},
 {title:'The Lake Shipment',reward:6000,intro:'The last shipment comes to the Silver Lake jetty by boat. A fisherman there has seen something.',
  make:()=>{const J0=WO(ox(640),206),JE=WO(ox(725),200);return[
   stMeet({txt:'Talk to the fisherman by the jetty',people:()=>[{x:J0.x,z:J0.z,line:'r4_m5_fisher',look:{shirt:'#e9d8a6',pants:'#f4f1e8',lower:'lungi',skin:'#6b3f1d',hair:'#c9c9c9'}}]}),
   stDo(m=>{m.left=0;m.smug=[];for(let k=0;k<4;k++){const[x,z]=W(ox(700+k*10),200),g=spawnGoon(x,z,null,false,{wep:rpick(['pistol','smg']),band:'#111'});g.passive=true;g.mission=m;m.left++;m.smug.push(g)}}),
   stPhoto({txt:'Photograph the smugglers loading the boat',at:()=>JE,min:25,max:80,onDone:()=>say2('r4_m5_photo')}),
   {init(m){for(const g of m.smug){g.passive=false;g.aggro=true}},upd(m){m.txt='Take the jetty · smugglers left: '+Math.max(0,m.left);m.meters=[];if(farFrom(JE.x,JE.z)>40)mk(JE.x,JE.z);else marker.visible=false;return m.left<=0},auto(m){killSquad(m);testNear(JE,3)}},
   {init(m){const b=spawnVehicle('speedboat',...W(ox(820),170),siteHeading(SITE('jetty'),0));b.keep=true;b.hp=600;m.boat=b;m.close=0;say2('r4_m5_boat');m.cleanup.push(()=>{if(vehicles.includes(b)&&b!==player.vehicle)removeVehicle(b)});
      b.script=(v,dt)=>{v.heading+=0.32*dt;v.speed=Math.min(v.speed+3*dt,14)}},
    upd(m,dt){const b=m.boat,P=playerP();if(!vehicles.includes(b)||b.wrecked)return true;mk(b.pos.x,b.pos.z);const d=Math.hypot(b.pos.x-P.x,b.pos.z-P.z);
      m.close=player.vehicle&&player.vehicle.s.boat&&d<10?m.close+dt:Math.max(0,m.close-dt);m.meters=[{label:'Pull alongside',v:m.close/2,col:'#ffd23f'}];m.txt='Chase the smugglers\' speedboat: take a boat and pull alongside, or sink it';
      if(d>700)return'The boat got away';return m.close>=2},auto(m){m.close=9}},
   stChoice({title:'The Lake Shipment',line:'The boat is yours. What do you do with the cargo?',txt:'Decide what to do with the cargo',opts:[
     {t:'Recover the cargo (evidence, +₹3,000)',fn:m=>{m.boat.script=null;m.boat.speed=0;a1Bonus(m,3000,'Cargo recovered');say2('r4_m5_cargo')}},
     {t:'Disable the boat and sink the guns',fn:m=>{m.boat.script=null;damageVehicle(m.boat,9999,'crash');say2('r4_m5_sink')}}]}),
   {upd(){return!subBusy()},auto(){clearSubs()}},stTalk('r4_m5_end')]}},
 {title:'Silk Sundaram',reward:25000,intro:'Sundaram is hiding in Old Kovai Mills, and he is holding our people inside. Take Kathir. End it tonight.',
  make:()=>{const O=SITE('mill_kovai'),LB=sitePt(O,24,26),YD={x:O.x+60,z:O.z+70};return[
   stDo(()=>{tod=21.5}),
   stDo(m=>{const k=npc(LOOK.kathir,LB.x+3,LB.z+3,0);m.kathir=k;m.cleanup.push(()=>npcGone(k));m.ticks.push((m,dt)=>npcIdle(k,dt,true))}),
   stGo(LB.x,LB.z,'Meet Kathir at the loading area of Old Kovai Mills',{r:5}),stTalk('r4_m6_kathir'),
   stKill(O.x+10,O.z+10,5,'Clear the first section',{rx:10,rz:10}),
   stFree({txt:'Find and free the workers held inside',cx:O.x,cz:O.z,people:()=>[sitePt(O,-6,-4),sitePt(O,-2,-8),sitePt(O,4,-6)],onFree:(n,m)=>{if(!m.saidHeld){m.saidHeld=true;say2('r4_m6_held')}}}),
   stDo(()=>say2('r4_m6_final')),stKill(O.x,O.z,6,'Survive the last Scorpion attack',{rx:16,rz:16,aggro:true,waves:1}),
   stBoss2({x:O.x,z:O.z,name:'Silk Sundaram',sub:'Boss of the Black Scorpions',hp:2200,guards:3,line:'r4_m6_sundaram',fleeLine:'r4_m6_run',flee:YD,cover:[[O.x-6,O.z-6],[O.x+7,O.z-4],[O.x+5,O.z+7],[O.x-7,O.z+5]]}),
   stTalk('r4_m6_down'),stGo(GIVER.x,GIVER.z,'The workers are gathering at the Mill Estate mill gate',{r:6}),stTalk('r4_m6_begin')]}}];
STORY.unshift(...ACT1);
