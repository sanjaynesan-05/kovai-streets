/* Kovai Streets: gameplay.js
 * Police and wanted level, hospital and gun shop, friends and conversations, cheats, death and respawn, police extras (foot officers, roadblocks, helicopter)
 * Classic script, loaded in order by index.html (9 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= police / wanted ================= */
let wanted=0,wantedCool=0,policeSpawnT=0;
function addWanted(n){if(player.dead)return;const before=wanted;if(before===0){const P=playerP();lastSeen.x=P.x;lastSeen.z=P.z}wanted=Math.min(5,wanted+n);wantedCool=0;if(wanted>before)$('stars').classList.add('flash');starFlashT=3}
/* Witnesses: a crime at (x,z) only adds stars if someone sees it within WIT_R. Police add them at once; a pedestrian
   runs off and reports after REPORT_T s, unless they are stopped first. */
const WIT_R=40,REPORT_T=5;let reports=[],policeSeen=false;const lastSeen={x:0,z:0};
function witnessed(x,z,n){const sees=(ox,oz,oy)=>Math.hypot(ox-x,oz-z)<WIT_R&&los(ox,oy,oz,x,1.2,z);
  for(const v of vehicles)if(v.policeAI&&!v.policeAI.leaving&&sees(v.pos.x,v.pos.z,1.5)){addWanted(n);return}
  for(const g of goons)if(g.cop&&!g.dead&&sees(g.x,g.z,1.6)){addWanted(n);return}
  let w=null,bd=WIT_R;for(const p of peds){if(p.dead||p.hidden||p.talk)continue;const d=Math.hypot(p.x-x,p.z-z);if(d<bd&&sees(p.x,p.z,1.6)){bd=d;w=p}}
  if(!w)return;w.flee=REPORT_T+3;if(!reports.some(r=>r.p===w)){reports.push({p:w,t:REPORT_T,n});floatMsg('A witness is calling the police!')}else reports.find(r=>r.p===w).n+=n}
function updateReports(dt){for(let i=reports.length-1;i>=0;i--){const r=reports[i];if(r.p.dead||r.p.hidden){reports.splice(i,1);continue}
  r.t-=dt;if(r.t<=0){reports.splice(i,1);addWanted(r.n);toast('REPORTED','A witness called the police',2)}}}
/* Search: without sight of you, police cars drive to your last known position and search around it. */
function policeGoal(pa){if(policeSeen){pa.st=null;return playerP()}
  if(!pa.st)pa.st={x:lastSeen.x,z:lastSeen.z};return pa.st}
let starFlashT=0;
function spawnPolice(){const P=playerP();
  for(let t=0;t<60;t++){const i=RI(-NB,NB),j=RI(-NB,NB);const x=i*CELL,z=j*CELL;const d=Math.hypot(x-P.x,z-P.z);if(d<110||d>220)continue;
    if(vehicles.some(v=>Math.abs(v.pos.x-x)<6&&Math.abs(v.pos.z-z)<6))continue;
    const v=spawnVehicle('police',x,z,Math.atan2(P.x-x,P.z-z));v.speed=14;v.policeAI={shootT:2,stuck:0,reverse:0,revSteer:1,leaving:false,leaveT:0};return v}}
function updPolice(v,dt){const pa=v.policeAI;const T=policeGoal(pa);const dx=T.x-v.pos.x,dz=T.z-v.pos.z,d=Math.hypot(dx,dz);
  if(!policeSeen&&d<18)pa.st={x:lastSeen.x+RR(-30,30),z:lastSeen.z+RR(-30,30)};/* reached the search point: check another spot nearby */
  if(wanted===0||player.dead)pa.leaving=true;
  if(pa.leaving){pa.leaveT+=dt;v.speed+=clamp(16-v.speed,-v.s.brake*dt,v.s.acc*dt);if(pa.leaveT>9&&d>70)removeVehicle(v);return}
  if(d>300){removeVehicle(v);return}
  if(pa.block&&!pa.broke&&d>22){v.speed*=Math.max(0,1-4*dt);pa.shootT-=dt;if(policeSeen&&d<34&&pa.shootT<=0){pa.shootT=RR(1,1.6);enemyShoot(v.pos.x,1.5,v.pos.z,clamp(0.55-d/80,0.15,0.45),6)}return}pa.broke=true;
  if(pa.reverse>0){pa.reverse-=dt;v.speed+=clamp(-8-v.speed,-v.s.brake*dt,v.s.acc*dt);v.heading+=pa.revSteer*dt*1.3;return}
  const diff=angDiff(v.heading,Math.atan2(dx,dz));
  let target=d>18?Math.min(v.s.max,12+d*0.5):(player.vehicle?9:0);if(Math.abs(diff)>1.2&&d>18)target=Math.min(target,11);
  v.speed+=clamp(target-v.speed,-v.s.brake*dt,v.s.acc*dt);
  const rate=v.s.steer*1.4*Math.min(1,Math.abs(v.speed)/3);v.heading+=clamp(diff,-rate*dt,rate*dt);
  if(target>3&&Math.abs(v.speed)<1.2){pa.stuck+=dt;if(pa.stuck>1.3){pa.reverse=1.1;pa.revSteer=Math.random()<0.5?-1:1;pa.stuck=0}}else pa.stuck=0;
  pa.shootT-=dt;if(policeSeen&&d<34&&pa.shootT<=0){pa.shootT=RR(0.8,1.4);enemyShoot(v.pos.x-Math.cos(v.heading),1.5,v.pos.z+Math.sin(v.heading),clamp(0.6-d/80,0.2,0.5),7)}}
function updateWanted(dt){if(starFlashT>0){starFlashT-=dt;if(starFlashT<=0)$('stars').classList.remove('flash')}
  updateReports(dt);
  let cops=0,seen=false;const P=playerP();
  for(const v of vehicles)if(v.policeAI&&!v.policeAI.leaving){cops++;if(Math.hypot(v.pos.x-P.x,v.pos.z-P.z)<75&&los(v.pos.x,1.5,v.pos.z,P.x,1.2,P.z))seen=true}
  if(!seen)for(const g of goons)if(g.cop&&!g.dead&&Math.hypot(g.x-P.x,g.z-P.z)<50&&los(g.x,1.6,g.z,P.x,1.2,P.z)){seen=true;break}
  policeSeen=seen;if(seen){lastSeen.x=P.x;lastSeen.z=P.z}
  if(wanted>0){const want=Math.min(4,wanted);policeSpawnT-=dt;if(cops<want&&policeSpawnT<=0){policeSpawnT=3.5;spawnPolice()}
    if(seen)wantedCool=0;else{wantedCool+=dt;if(wantedCool>(10+wanted*3)*heatMult()){wanted--;wantedCool=0;if(wanted===0)toast('Lost the cops','The heat is off',2.2)}}}}

/* ================= places, hospital, shop ================= */
let SHOP={x:9.5,z:83.5};
const PLACES=[{n:'Kovai Coast beach',x:ox(640),z:40},{n:'the Race Course walking track',x:185,z:8.6},{n:'VOC Park',x:111,z:-65.4},{n:'the Saibaba Colony temple',x:-333,z:-301},{n:'Ukkadam lake',x:-111,z:229},
  {n:'the Town Hall clock tower',x:-37,z:81},{n:'the Podanur pond',x:259,z:303},{n:'Singanallur lake',x:481,z:144},{n:'the Singanallur bus stand',x:481,z:70},{n:'the Ukkadam bus stand',x:-37,z:218},{n:'Marudhamalai temple',x:-703,z:-152},{n:'the Gandhipuram bus stand',x:37,z:-155},{n:'R.S. Puram park',x:-185,z:7.5}];
function updateZones(dt){const healEl=$('heal');let healing=false;
  if(!player.dead&&!player.vehicle){const dh=Math.hypot(player.pos.x-HOSP.x,player.pos.z-HOSP.z);
    if(dh<3.6&&(player.hp<100)){player.hp=Math.min(100,player.hp+45*dt);healing=true}
    if(dh<3.6&&player.hp>=100&&!zoneMsg.h){zoneMsg.h=1;floatMsg('All patched up!')}if(dh>5)zoneMsg.h=0}
  healEl.style.opacity=healing?0.8:0;
  const ds=Math.hypot(player.pos.x-SHOP.x,player.pos.z-SHOP.z);shopOpen=!player.dead&&!player.vehicle&&ds<3.4;
  $('shop').classList.toggle('hidden',!shopOpen);if(shopOpen)renderShop()}
const zoneMsg={};let shopOpen=false,shopMsg='';
const SHOPITEMS=[{w:'bat',price:300,ammo:0,lv:1},{w:'knife',price:250,ammo:0,lv:1},{w:'revolver',price:2000,ammo:36,lv:1},{w:'smg',price:1500,ammo:96,lv:1},{w:'shotgun',price:2500,ammo:32,lv:2},{w:'rifle',price:4000,ammo:120,lv:3},{w:'sniper',price:6000,ammo:20,lv:3},{w:'rocket',price:9000,ammo:6,lv:4},{w:'grenade',price:1500,ammo:5,lv:2},{armor:true,price:800,lv:1}];
function renderShop(){let h=`<h3>Kovai Arms Depot</h3><div class="sub">Cash: ₹${Math.floor(player.cash).toLocaleString('en-IN')} · ${isTouch?'tap to buy · ':''}walk away to close</div>`;
  SHOPITEMS.forEach((it,k)=>{const wi=it.armor?-1:WI(it.w),W=WEAPONS[wi],lk=(it.lv||1)>respectLv();const name=it.armor?'Body armour (full)':W.name+(player.owned[wi]?(W.melee?' — owned':' — ammo'):'');h+=`<div class="opt ${player.cash<it.price||lk?'off':''}" data-k="${k}"><b>${(k+1)%10}</b>${lk?'🔒 '+name+' (Respect LV '+it.lv+')':name} · ₹${it.price.toLocaleString('en-IN')}</div>`});
  if(shopMsg)h+=`<div class="foot">${esc(shopMsg)}</div>`;if($('shop')._h!==h){$('shop').innerHTML=h;$('shop')._h=h}}
function buyItem(k){const it=SHOPITEMS[k];if(!it)return;if((it.lv||1)>respectLv()){shopMsg='Locked: reach Respect LV '+it.lv+' first.';return}if(player.cash<it.price){shopMsg='Not enough cash.';noise(0.05,500,0.15,1);return}
  const wi=it.armor?-1:WI(it.w);if(wi>=0&&WEAPONS[wi].melee&&player.owned[wi]){shopMsg='You already have that.';return}player.cash-=it.price;if(it.armor){player.armor=100;shopMsg='Armour on.'}else{giveWeapon(wi,it.ammo);setWeapon(wi);shopMsg='Bought '+WEAPONS[wi].name+'.'}noise(0.1,3500,0.2,1)}

/* ================= friends & talking ================= */
const FRIENDS=[
  {name:'Meena',bio:'College student · loves fast cars',home:{x:111,z:-8.6},look:{shirt:'#e83e8c',pants:'#f4f1e8',skin:'#8d5524',long:true,hair:'#1b1410'},fr:20,perk:'car',
   lines:{hi:['Hey you! Back again?','Vanakkam! I was just thinking about you.','Oh hi! Bored of classes already.'],gift:['Malli flowers! They smell amazing. Thank you!','Aww, you remembered. Thank you!'],
     arrive:['This is my favourite spot in all of Kovai. Thanks for bringing me!','Okay, this was fun. You drive like a maniac though!','Let us come here again sometime, okay?'],low:'Hmm, I don\'t know you that well yet. Maybe hang out first?'}},
  {name:'Divya',bio:'Software engineer at the IT park',home:{x:259,z:-230.6},look:{shirt:'#4361ee',pants:'#22223b',skin:'#a0662f',long:true,hair:'#2b1a10'},fr:10,perk:'armor',
   lines:{hi:['Hi! Escaping a meeting, don\'t tell anyone.','Hey! Need a break from my laptop.','Vanakkam! Good timing, I just pushed my code.'],gift:['Jasmine! Best thing that happened today.','You are sweet. Thank you!'],
     arrive:['Wow, I needed this. Thank you!','Nice! Much better than my office view.','We should do this every Friday.'],low:'Let\'s hang out a bit more first, then we\'ll see.'}}];
FRIENDS.forEach(f=>Object.assign(f,{x:f.home.x,z:f.home.z,yaw:0,comp:false,armed:false,inCar:false,shootT:1,phase:0,giftT:-99,hitT:-99,perkDone:false,awayT:0}));
let talk=null;
function nearestTalkable(){if(player.vehicle||player.dead)return null;let best=null,bd=3.2;
  for(const f of FRIENDS){if(f.inCar)continue;const d=Math.hypot(f.x-player.pos.x,f.z-player.pos.z);if(d<bd+0.8){best={kind:'friend',obj:f};bd=d}}
  if(best)return best;const xt=extraTalkable();if(xt)return xt;for(const st of STALLS){if(Math.hypot(st.x-player.pos.x,st.z-player.pos.z)<2.6)return{kind:'stall',obj:st}}for(const p of peds){if(p.dead||p.hidden||!p.h.g.visible)continue;const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(d<bd){best={kind:'ped',obj:p};bd=d}}return best}
function openTalk(t){if(t.custom){talk=t.custom();renderTalk();return}if(t.kind==='ped'){const p=t.obj;if(wanted>=2||p.flee>0){p.flee=6;floatMsg(p.name+': Aiyo! Stay away from me!');return}p.talk=true;
    talk={kind:'ped',obj:p,line:rpick(['Vanakkam! Yes?','Hello! Need something?','Hi! What happened?']),opts:pedOpts(p)}}
  else if(t.kind==='stall')talk={kind:'stall',obj:t.obj,line:rpick(['Vanakkam! Tea, coffee?','Fresh tea, just boiled!','Come, sit. What you want?']),opts:stallOpts(t.obj)};
  else talk={kind:'friend',obj:t.obj,line:rpick(t.obj.lines.hi),opts:friendOpts(t.obj)};renderTalk()}
function closeTalk(){if(talk&&talk.kind==='story')stopVoice();if(talk&&talk.kind==='ped')talk.obj.talk=false;talk=null;$('talk').classList.add('hidden')}
function renderTalk(){if(!talk)return;const o=talk.obj;let h='';
  if(talk.hdr)h=talk.hdr();else if(talk.kind==='ped')h=`<h3>${esc(o.name)}</h3><div class="sub">Passer-by</div>`;
  else if(talk.kind==='stall')h=`<h3>Tea kadai</h3><div class="sub">Roadside tea stall · Cash ₹${Math.floor(player.cash).toLocaleString('en-IN')}</div>`;
  else h=`<h3>${esc(o.name)}</h3><div class="sub">${esc(o.bio)} · Friendship ${Math.round(o.fr)}%</div><div class="fbar"><div style="width:${o.fr}%"></div></div>`;
  h+=`<div class="line">“${esc(talk.line)}”</div>${talk.lineEn?`<div class="lineEn">${esc(talk.lineEn)}</div>`:''}`;talk.opts.forEach((op,k)=>{h+=`<div class="opt ${op.off?'off':''}" data-k="${k}"><b>${k+1}</b>${esc(op.t)}</div>`});
  h+=`<div class="foot">${isTouch?'Tap an option':'Press a number to choose'} · walk away to leave</div>`;$('talk').innerHTML=h;$('talk').classList.remove('hidden')}
function chooseTalk(k){if(!talk)return;const op=talk.opts[k];if(!op)return;const r=op.fn();if(r===false){closeTalk();return}if(typeof r==='string')talk.line=r;
  talk.opts=talk.optsFn?talk.optsFn():talk.kind==='ped'?pedOpts(talk.obj):talk.kind==='stall'?stallOpts(talk.obj):friendOpts(talk.obj);renderTalk()}
const PED_GREET=['Vanakkam! Lovely weather today, no?','Vanakkam! Have you eaten?','Kovai is the best city. Fight me.','Careful near Gandhipuram, traffic is crazy.','I am off to the market. Onions are cheap today!','My uncle worked in the mills for thirty years.','Try the parotta near the bus stand. Super.'];
function pedOpts(p){return[
  {t:'Say vanakkam',fn:()=>rpick(PED_GREET)},
  {t:'Need a lift somewhere? (paid fare)',fn:()=>{if(mission)return'Looks like you are busy already!';const nv=player.vehicle||vehicles.find(v=>!v.wrecked&&!v.policeAI&&Math.hypot(v.pos.x-player.pos.x,v.pos.z-player.pos.z)<15);
    if(!nv)return'You don\'t even have a ride! Get a vehicle first.';startMission({type:'fare',x:p.x,z:p.z,ped:p});return false}},
  {t:'Treat them to a filter coffee (₹20)',fn:()=>{if(player.cash<20)return'Aiyo, you can\'t even afford coffee?';player.cash-=20;return rpick(['Nandri! Filter coffee fixes everything.','You are a good soul. Thank you!','Aha, strong and sweet, just how I like it!'])}},
  {t:'Heard any news around here?',fn:()=>{const P=player.pos;let best=null,bd=1e9;for(const sp of gangSpots){if(sp.alive<=0)continue;const x=sp.i*CELL,z=sp.j*CELL,d=Math.hypot(x-P.x,z-P.z);if(d<bd){bd=d;best={x,z}}}
    const o=offers[0];if(o&&Math.random()<0.5)return`Someone near ${district(o.x,o.z)} was looking for help. ${JOBT[o.type].name} job, I think.`;
    return best?`Goondas hang around ${district(best.x,best.z)}. Stay away from there!`:'All quiet today, touch wood.'}},
  {t:'Bye',fn:()=>false}]}
function friendOpts(f){const o=[];
  if(!f.comp){o.push({t:'Let\'s hang out',fn:()=>{if(mission)return'Finish what you are doing first, then call me!';startHangout(f);return false}});
    o.push({t:'Gift jasmine flowers (₹100)',off:player.cash<100,fn:()=>{if(player.cash<100)return'That\'s sweet, but you\'re broke!';if(time-f.giftT<45)return'You just gave me some! Save your money.';player.cash-=100;f.giftT=time;addFriend(f,6);return rpick(f.lines.gift)}});
    o.push({t:'Watch my back (she joins and fights)',off:f.fr<30,fn:()=>{if(f.fr<30)return f.lines.low;f.comp=true;f.armed=true;f.h.gun.visible=true;return false}});
    if(f.perk==='armor'&&f.fr>=100)o.push({t:'Ask for a spare armour vest',fn:()=>{player.armor=100;return'Here, from our office security guy. Stay safe!'}});}
  else{o.push({t:'Head home for now',fn:()=>{sendHome(f);return false}})}
  o.push({t:'Bye',fn:()=>false});return o}
function addFriend(f,n){const b=f.fr;f.fr=Math.min(100,f.fr+n);floatMsg(`${f.name} ♥ +${n}`);
  if(b<30&&f.fr>=30)toast(f.name.toUpperCase()+' TRUSTS YOU','She can now watch your back in fights',3);
  if(b<100&&f.fr>=100&&!f.perkDone){f.perkDone=true;if(f.perk==='car'){const v=spawnVehicle('sport',f.home.x+8,f.home.z+4.5,Math.PI/2);v.keep=true;toast('BEST FRIENDS!','Meena gave you her Kovai Racer sports car',4)}else toast('BEST FRIENDS!','Divya will give you armour whenever you visit',4)}}
function startHangout(f){const opts=PLACES.filter(p=>Math.hypot(p.x-f.home.x,p.z-f.home.z)>150&&placeOpen(p.x));const pl=rpick(opts);
  f.comp=true;f.armed=false;f.h.gun.visible=false;mission={type:'hang',friend:f,title:'Hang out with '+f.name,reward:0,steps:[{x:pl.x,z:pl.z,txt:`Take ${f.name} to ${pl.n}`}],step:0,timer:null};
  toast('HANG OUT',`${f.name}: "Let's go to ${pl.n}!"`,2.8)}
function sendHome(f){if(f.inCar)alightPassenger(f);f.comp=false;f.armed=false;f.inCar=false;f.h.gun.visible=false;f.awayT=0;f.goingHome=true;if(mission&&mission.type==='hang'&&mission.friend===f){mission=null;offerT=3}floatMsg(f.name+': See you later!')}
function updateFriends(dt){for(const f of FRIENDS){const h=f.h;
  if(f.comp){
    if(player.dead){sendHome(f);continue}
    if(player.vehicle){const pv=player.vehicle;if(f.inCar&&f.inV!==pv)alightPassenger(f);
      if(!f.inCar){const d=Math.hypot(f.x-pv.pos.x,f.z-pv.pos.z),free=seatFree(pv);if(free&&(d<8||d>80))boardPassenger(f,pv);
        else if(!free&&d>80){f.x=pv.pos.x-Math.sin(pv.heading)*6;f.z=pv.pos.z-Math.cos(pv.heading)*6}else if(d>4||free)walkTo(f,pv.pos.x,pv.pos.z,7,dt);else f.moving=false}
      if(f.inCar){f.x=player.vehicle.pos.x;f.z=player.vehicle.pos.z}}
    else{if(f.inCar)alightPassenger(f);
      const tx=player.pos.x+Math.cos(camYaw)*1.6-Math.sin(camYaw)*1.6,tz=player.pos.z-Math.sin(camYaw)*1.6-Math.cos(camYaw)*1.6;const d=Math.hypot(tx-f.x,tz-f.z);
      if(d>60){f.x=tx;f.z=tz}else if(d>1.2)walkTo(f,tx,tz,d>8?7.5:4.3,dt);else{f.moving=false;f.yaw+=angDiff(f.yaw,player.yaw)*Math.min(1,dt*4)}
      if(f.armed)friendCombat(f,dt)}}
  else if(f.goingHome){f.awayT+=dt;const P=playerP();const far=Math.hypot(f.x-P.x,f.z-P.z)>80;if(far||f.awayT>20){f.x=f.home.x;f.z=f.home.z;f.goingHome=false;h.g.visible=true}else walkTo(f,f.home.x,f.home.z,4,dt)}
  else{f.moving=false;const d=Math.hypot(player.pos.x-f.x,player.pos.z-f.z);if(d<12&&!player.vehicle)f.yaw+=angDiff(f.yaw,Math.atan2(player.pos.x-f.x,player.pos.z-f.z))*Math.min(1,dt*4)}
  if(!f.inCar){h.g.visible=true;f.phase+=f.moving?dt*f.spd*2.4:0;h.g.position.set(f.x,(f.y=humanY(f.x,f.z,f.y||0)),f.z);h.g.rotation.y=f.yaw;animHuman(h,f.phase,f.moving?0.9:0,f.aimT>0);f.aimT-=dt}
  f.icon.visible=!f.comp&&!f.goingHome&&Math.hypot(f.home.x-player.pos.x,f.home.z-player.pos.z)>8;f.icon.position.set(f.home.x,3.4+Math.sin(time*2)*0.2,f.home.z)}}
function walkTo(f,tx,tz,sp,dt){const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d<0.05)return;const st=Math.min(d,sp*dt);_pp.x=f.x+dx/d*st;_pp.z=f.z+dz/d*st;pushCircle(_pp,0.35);f.x=_pp.x;f.z=_pp.z;f.yaw=Math.atan2(dx,dz);f.moving=true;f.spd=sp}
function friendCombat(f,dt){f.shootT-=dt;if(f.shootT>0)return;f.shootT=RR(0.6,0.9);let tgt=null,td=36;
  for(const g of goons){if(g.dead||!g.aggro)continue;const d=Math.hypot(g.x-f.x,g.z-f.z);if(d<td){td=d;tgt={x:g.x,z:g.z,y:1.2,g}}}
  if(!tgt&&wanted>0)for(const v of vehicles){if(!v.policeAI||v.policeAI.leaving)continue;const d=Math.hypot(v.pos.x-f.x,v.pos.z-f.z);if(d<td){td=d;tgt={x:v.pos.x,z:v.pos.z,y:1,v}}}
  if(!tgt)return;if(!los(f.x,1.4,f.z,tgt.x,tgt.y,tgt.z))return;f.yaw=Math.atan2(tgt.x-f.x,tgt.z-f.z);f.aimT=1;
  const m=f.h.gun.localToWorld(_v.set(0,-0.85,0)).clone();const hit=Math.random()<0.6;const end=new THREE.Vector3(tgt.x+(hit?0:RR(-1.5,1.5)),tgt.y,tgt.z+(hit?0:RR(-1.5,1.5)));
  tracer(m,end,0xffc2e2);flash(m);noise(0.14,2600,0.25,3);if(hit){if(tgt.g)damageGoon(tgt.g,34,true);else damageVehicle(tgt.v,30,'friend')}}


/* ================= cheats ================= */
const CHEATS={
  NUTTERTOOLS:()=>{['minigun','rocket','sniper','rifle','grenade','knife'].forEach(id=>{const i=WI(id);giveWeapon(i,(WEAPONS[i].mag||1)*(WEAPONS[i].mag<=1?10:6))});setWeapon(WI('minigun'));return['NUTTER TOOLS','Minigun, rockets, grenades, sniper, rifle & knife']},
  PROFESSIONALTOOLS:()=>{['smg','shotgun','rifle','sniper','revolver','bat'].forEach(id=>{const i=WI(id);giveWeapon(i,WEAPONS[i].mag*6)});setWeapon(WI('rifle'));return['PROFESSIONAL TOOLS','SMG, shotgun, rifle, sniper, revolver & cricket bat']},
  LEAVEMEALONE:()=>{wanted=0;wantedCool=0;return['LEAVE ME ALONE','Wanted level cleared']},
  COOLDOWN:()=>{wanted=0;wantedCool=0;return['COOL DOWN','The cops have chilled out']},
  BIGBANG:()=>{const P=playerP();vehicles.slice().forEach(v=>{if(v!==player.vehicle&&!v.wrecked&&Math.hypot(v.pos.x-P.x,v.pos.z-P.z)<150)explode(v,'cheat')});return['BIG BANG','Boom.']},
  PANZER:()=>{spawnNear('tank');return['PANZER',isTouch?'Tank delivered. FIRE shoots the cannon':'Tank delivered. Left-click fires the cannon']},
  FILTERCOFFEE:()=>{player.hp=100;player.armor=100;return['FILTER COFFEE','Full health & armour']},
  KOVAICASH:()=>{player.cash+=50000;return['KOVAI CASH','+₹50,000']},
  AUTORAJA:()=>{spawnNear('turbo');return['AUTO RAJA','Turbo auto delivered']},
  SUNRISE:()=>{tod=6.2;return['SUNRISE','Good morning, Kovai']},
  SUNDOWN:()=>{tod=18.1;return['SUNDOWN','Golden hour over the Ghats']},
  MIDNIGHT:()=>{tod=0;return['MIDNIGHT','Lights on']},
  MONSOON:()=>{rainOn=!rainOn;weatherT=rainOn?240:400;return['MONSOON',rainOn?'Here comes the rain':'Skies clearing']},
  IRONBODY:()=>{cheatIron=!cheatIron;return['IRON BODY',cheatIron?'Your vehicles can\'t be damaged':'Turned off']}};
function spawnNear(type){const yaw=player.vehicle?player.vehicle.heading:camYaw;const P=playerP();const d=type==='tank'?9:6;
  let x=P.x+Math.sin(yaw)*d,z=P.z+Math.cos(yaw)*d;_pp.x=x;_pp.z=z;pushCircle(_pp,VT[type].cr+0.5);const v=spawnVehicle(type,_pp.x,_pp.z,yaw);v.keep=true;return v}
let consoleOpen=false;
function openConsole(){consoleOpen=true;mouseL=false;$('console').classList.remove('hidden');const i=$('cheatIn');i.value='';setTimeout(()=>i.focus(),0)}
function closeConsole(){consoleOpen=false;$('console').classList.add('hidden');$('cheatIn').blur();canvas.focus()}
$('cheatIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='Enter'||e.key==='Enter'||e.keyCode===13){const c=$('cheatIn').value.toUpperCase().replace(/[^A-Z]/g,'');closeConsole();
    const fn=CHEATS[c];if(fn&&started&&!player.dead){const[a,b]=fn();toast('CHEAT ACTIVATED',a+' — '+b,2.6);noise(0.3,4000,0.25,1)}else if(c)toast('UNKNOWN CODE','Check the pause menu for the cheat list',2)}
  else if(e.code==='Escape')closeConsole()});
$('cheatIn').addEventListener('keyup',e=>e.stopPropagation());
$('cheatGo').addEventListener('click',()=>{$('cheatIn').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}))});

/* ================= death / respawn ================= */
function die(){player.dead=true;player.hp=0;player.deadT=3.6;if(player.vehicle)exitVehicle();poseDead(player.human,groundH(player.pos.x,player.pos.z));
  const fee=Math.min(player.cash,500);player.cash-=fee;$('deadMsg').innerHTML=`Waking up at the Government Hospital… Bill: ₹${fee}<br><small style="opacity:.7">Tip: ${esc(rpick(TIPS))}</small>`;$('dead').classList.remove('hidden');
  wanted=0;reports=[];missionFail('You got knocked out');closeTalk();noise(0.6,300,0.4,2)}
function respawn(){player.dead=false;player.hp=100;player.pos.set(HOSP.x,0,HOSP.z);player.vy=0;player.human.g.rotation.x=0;player.human.g.rotation.z=0;player.down=0;player.crouch=false;player.human.g.visible=true;camYaw=0;camPitch=-0.1;
  for(let i=0;i<NW;i++){if(player.owned[i]&&player.mags[i]===0&&player.res[i]>0){const t=Math.min(WEAPONS[i].mag,player.res[i]);player.mags[i]=t;player.res[i]-=t}}{const pi=WI('pistol');if(player.mags[pi]===0)player.mags[pi]=17}$('dead').classList.add('hidden')}


/* ---------- police: on foot, roadblocks, helicopter ---------- */
let roadblockT=20,heli=null,heliCD=0;
function updatePoliceExtra(dt){const P=playerP();
  if(wanted>0&&!player.dead){let foot=0;for(const g of goons)if(g.cop&&!g.dead)foot++;
    for(const v of vehicles){const pa=v.policeAI;if(!pa||pa.leaving||pa.out||v.wrecked)continue;const d=Math.hypot(v.pos.x-P.x,v.pos.z-P.z);
      if(d<26&&Math.abs(v.speed)<3&&!player.vehicle&&foot<2+wanted*1.5){pa.out=true;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
        for(const s of[-1,1]){spawnGoon(v.pos.x+fz*s*1.9,v.pos.z-fx*s*1.9,null,true,{cop:true,wep:wanted>=3?rpick(['pistol','smg','rifle']):'pistol'});foot++}}}
    if(wanted>=3){roadblockT-=dt;if(roadblockT<=0){roadblockT=RR(22,32);if(player.vehicle&&Math.abs(player.vehicle.speed)>8)spawnRoadblock()}}}
  heliCD-=dt;if(wanted>=heliStars()&&!player.dead&&(!heli||(!heli.alive&&!heli.falling))&&heliCD<=0)spawnHeli();
  if(heli)updateHeli(dt)}
function spawnRoadblock(){const v=player.vehicle;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);let best=null,bd=1e9;
  for(let i=-NB;i<=NB;i++)for(let j=-NB;j<=NB;j++){const nx=i*CELL,nz=j*CELL,dx=nx-v.pos.x,dz=nz-v.pos.z,ahead=dx*fx+dz*fz,lat=Math.abs(dx*fz-dz*fx);if(ahead<70||ahead>190||lat>14)continue;if(ahead<bd){bd=ahead;best={nx,nz}}}
  if(!best)return;const alongX=Math.abs(fx)>Math.abs(fz),sg=alongX?Math.sign(fx):Math.sign(fz);const cx=alongX?best.nx-sg*12:best.nx,cz=alongX?best.nz:best.nz-sg*12;
  for(const o of[-3.4,3.4]){const x=alongX?cx:cx+o,z=alongX?cz+o:cz;if(vehicles.some(u=>Math.abs(u.pos.x-x)<3&&Math.abs(u.pos.z-z)<3))continue;
    const pv=spawnVehicle('police',x,z,alongX?0:Math.PI/2);pv.speed=0;pv.vx=pv.vz=0;pv.policeAI={shootT:1,stuck:0,reverse:0,revSteer:1,leaving:false,leaveT:0,block:true,out:true}}
  for(const o of[-1,1]){const x=alongX?cx+sg*3:cx+o*6,z=alongX?cz+o*6:cz+sg*3;spawnGoon(x,z,null,true,{cop:true,wep:rpick(['pistol','smg'])})}floatMsg('Police roadblock ahead!')}
function buildHeliMesh(){const g=new THREE.Group();const B=GB();
  gb(B,GEO.sph16,0,0,0,'#1d3557',0,0,0,1.3,1.1,2.4);gb(B,GEO.sph16,0,0.15,1.35,'#9fd3e8',0,0,0,0.95,0.75,1.1);gbBox(B,2.66,0.3,2.6,0,-0.3,0.1,'#f4f4f4');
  gbBox(B,0.35,0.35,4.5,0,0.25,-3.6,'#1d3557');gbBox(B,0.12,1.2,0.7,0,0.8,-5.7,'#f4f4f4');gbBox(B,1.6,0.08,0.5,0,0.3,-5.5,'#1d3557');
  for(const s of[-1,1]){gbBox(B,0.1,0.1,3,s*0.9,-1.25,0,'#333');gbBox(B,0.08,0.5,0.08,s*0.9,-1.0,0.8,'#333');gbBox(B,0.08,0.5,0.08,s*0.9,-1.0,-0.8,'#333')}gbBox(B,0.3,0.3,0.4,0,1.2,0,'#333');
  g.add(gbMesh(B));const rg=new THREE.Group();rg.position.y=1.35;for(const a of[0,Math.PI/2]){const r=new THREE.Mesh(GEO.box,M('#222'));r.scale.set(9,0.06,0.35);r.rotation.y=a;rg.add(r)}g.add(rg);
  const tr=new THREE.Group();tr.position.set(0.15,0.8,-5.7);const tb=new THREE.Mesh(GEO.box,M('#222'));tb.scale.set(0.05,1.4,0.18);tr.add(tb);g.add(tr);
  const lt=new THREE.Mesh(new THREE.ConeGeometry(9,32,16,1,true).translate(0,-16,0),new THREE.MeshBasicMaterial({color:0xfff6d0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));lt.position.y=-1.2;g.add(lt);
  g.visible=false;scene.add(g);return{g,rg,tr,lt,alive:false,falling:false,hp:0}}
function spawnHeli(){if(!heli)heli=buildHeliMesh();const P=playerP();Object.assign(heli,{alive:true,falling:false,hp:900,shootT:3,ang:0,snd:0,vy:0});heli.g.position.set(P.x+150,70,P.z+150);heli.g.visible=true;floatMsg('Police helicopter incoming!')}
function damageHeli(n){if(!heli||!heli.alive)return;heli.hp-=n;if(heli.hp<=0){heli.alive=false;heli.falling=true;heli.vy=0;heli.vx=RR(-6,6);heli.vz=RR(-6,6);addWanted(1);toast('HELICOPTER DOWN','',2)}}
function updateHeli(dt){const h=heli,p=h.g.position;h.rg.rotation.y+=dt*30;h.tr.rotation.x+=dt*40;
  if(h.falling){h.vy-=14*dt;p.y+=h.vy*dt;p.x+=h.vx*dt;p.z+=h.vz*dt;h.g.rotation.y+=dt*4;if(Math.random()<dt*20)smoke(p.x,p.y,p.z,0x333333);
    if(p.y<=groundH(p.x,p.z)+1){h.falling=false;h.g.visible=false;heliCD=60;boom(p.x,1,p.z,true,null)}return}
  if(!h.alive)return;const P=playerP();h.lt.material.opacity=0.12*(1-dayF);
  if(wanted<4||player.dead){p.y+=dt*8;p.x+=dt*25;if(p.y>150){h.alive=false;h.g.visible=false}return}
  h.ang+=dt*0.25;const tx=P.x+Math.cos(h.ang)*35,tz=P.z+Math.sin(h.ang)*35,ty=(P.y||0)+32;
  p.x+=(tx-p.x)*Math.min(1,dt*0.8);p.z+=(tz-p.z)*Math.min(1,dt*0.8);p.y+=(ty-p.y)*Math.min(1,dt*0.6);h.g.rotation.y=Math.atan2(P.x-p.x,P.z-p.z);h.g.rotation.x=0.12;
  const d=Math.hypot(P.x-p.x,P.z-p.z);h.snd-=dt;if(h.snd<=0&&d<200){h.snd=0.11;noise(0.06,180,0.22*clamp(1-d/200,0,1),2)}
  h.shootT-=dt;if(h.shootT<=0&&d<90){h.shootT=wanted>=5?0.5:0.9;enemyShoot(p.x,p.y-1.4,p.z,wanted>=5?0.45:0.35,wanted>=5?8:6)}}
