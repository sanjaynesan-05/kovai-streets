/* Kovai Streets: main.js
 * Per-frame update, main loop, initialisation, debug hook
 * Classic script, loaded in order by index.html (17 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ---------- init & per-frame ---------- */
/* film reels: grid spots, or real-map sidewalks near the same places (step G6) */
function createReels(){
  const rg=(()=>{const B=GB();gb(B,CY(0.38,0.38,0.08,20),0,0,0,'#e8b923',Math.PI/2,0,0);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;gb(B,CY(0.08,0.08,0.1,10),Math.cos(a)*0.2,Math.sin(a)*0.2,0,'#3a2a10',Math.PI/2,0,0)}gb(B,CY(0.06,0.06,0.12,8),0,0,0,'#111',Math.PI/2,0,0);return gbGeo(B)})();
  REELS.forEach((e,id)=>{let x,z,hi=0;if(REALMAP){const T=e[0]==='hill'?SITE('dealyard'):e[0]==='falls'?SITE('hideout'):null;[x,z]=T?[T.x-12,T.z+4]:geoSidewalk(...W(e[0],e[1]))}else {if(e[0]==='hill'){x=GHAT_TOP.x-12;z=GHAT_TOP.z+4}else if(e[0]==='falls'){const p=PLACES.find(q=>q.n==='the hill falls')||{x:-700,z:110};x=p.x;z=p.z}else{x=e[0];z=e[1];hi=e[2]}}
    const y=surfaceH(x,z,hi?99:0)+0.9;const m=new THREE.Mesh(rg,VCB);m.position.set(x,y,z);scene.add(m);reelObjs.push({id,x,z,y,m,got:PROG.reels.includes(id)});if(PROG.reels.includes(id))m.visible=false});
}
function initPlay(){
  giverH=makeHuman({shirt:'#f4f1e8',pants:'#f4f1e8',lower:'veshti',sleeve:'long',glasses:true,hair:'#c9c9c9',hairStyle:'short',stache:true,skin:'#6b3f1d'});giverH.g.position.set(GIVER.x,0.16,GIVER.z);giverH.g.rotation.y=-Math.PI/2;
  const gs=iconSprite('story',GIVER.x,3.4,GIVER.z,1.8);gs.userData.y=3.4;zoneSprites.push(gs);
  giverBeam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xe8b923,transparent:true,opacity:0.33,depthWrite:false,side:THREE.DoubleSide}));giverBeam.position.set(GIVER.x,0,GIVER.z);scene.add(giverBeam);
  {const r=new THREE.Mesh(new THREE.RingGeometry(1.8,2.5,32),new THREE.MeshBasicMaterial({color:0x2bd36b,transparent:true,opacity:0.8,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.set(HOUSE.px,0.3,HOUSE.pz);scene.add(r);
   const s=iconSprite('house',HOUSE.px,3.6,HOUSE.pz,2.2);s.userData.y=3.6;zoneSprites.push(s)}
  for(const r of RAMPAGES){r.sp=iconSprite('skull',r.x,1.6,r.z,1.5)}
  const loaded=loadGame();
  if(!REALMAP)createReels();/* real map: created by initGeoSites once the road graph has loaded */
  setOutfit(PROG.outfit||0);
  if(loaded){if(PROG.house){player.pos.set(HOUSE.px,0,HOUSE.pz-3);camYaw=Math.PI;player.yaw=Math.PI}spawnGarage();
    const f=FRIENDS[0];if(f.perkDone){const v=spawnVehicle('sport',f.home.x+8,f.home.z+4.5,Math.PI/2);v.keep=true}}
  for(const k in GATES)if(areaOpen(k))openGate(k,false);
  PROG.lastLv=respectLv();radioSt=SET.station!=null?SET.station:1;setGun();
  initAct2();
  if(loaded){$('playBtn').textContent='Continue';$('newBtn').classList.remove('hidden')}
  if(saveNotice){const n=$('saveNote');n.textContent=saveNotice;n.classList.remove('hidden');$('playBtn').addEventListener('click',()=>setTimeout(()=>toast('SAVE NOTICE',saveNotice,6),3800),{once:true})}}
function updatePlay(dt){
  if(EA)tickEA(dt);updateLockOn(dt);updatePoliceExtra(dt);updateStunts(dt);updateCollect(dt);updateGates(dt);updateTutorial(dt);updateRadio();updateAmbience(dt);
  if(giverH){const d=Math.hypot(player.pos.x-GIVER.x,player.pos.z-GIVER.z);if(d<14)giverH.g.rotation.y+=angDiff(giverH.g.rotation.y,Math.atan2(player.pos.x-GIVER.x,player.pos.z-GIVER.z))*Math.min(1,dt*4)}
  if(giverBeam)giverBeam.visible=!mission&&PROG.story<STORY.length;
  if(player.vehicle&&player.crouch)player.crouch=false;
  const lv=respectLv();if(lv>PROG.lastLv){PROG.lastLv=lv;setTimeout(()=>toast('RESPECT LV '+lv,lvUnlocks(lv)||'The streets know your name',4.5),3200);queueSave()}
  updateAct2(dt);
  if(saveQ>0){saveQ-=dt;if(saveQ<=0)saveGame()}saveTimer-=dt;if(saveTimer<=0){saveTimer=30;saveGame()}}


/* ================= main loop ================= */
function sim(dt){if(REALMAP){updateGeoWorld();updateGeoSignals(dt);updateGPS(dt)}updateWorldFX(dt);updateTrain(dt);updateGrenades(dt);updateVehicles(dt);updatePeds(dt);updateGoons(dt);updateFriends(dt);updateRockets(dt);updateFx(dt)}
function update(dt){dt*=slowMo();if(wheelOpen){if(wheelMode==='scroll'&&performance.now()>wheelT)closeWheel(true);dt*=0.3}time+=dt;hornCD-=dt;player.tankCD-=dt;
  if(!player.dead){lookKeys(dt);if(!player.vehicle)updateFoot(dt);else if(mouseL&&player.vehicle.type==='tank')fire();
    if(time-player.lastDmg>6&&player.hp<100)player.hp=Math.min(100,player.hp+4*dt)}
  else{player.deadT-=dt;if(player.deadT<=0)respawn()}
  player.fireCD-=dt;
  sim(dt);updatePickups(dt);updateWanted(dt);updateOffers(dt);updateMission(dt);updateZones(dt);updatePlay(dt);
  if(player.vehicle&&player.vehicle.s.two){const v=player.vehicle,h=player.human;h.g.visible=true;v.pedal=(v.pedal||0)+v.speed*dt*1.6;h.g.position.set(v.pos.x-Math.sin(v.heading)*0.2,v.y+0.08,v.pos.z-Math.cos(v.heading)*0.2);h.g.rotation.set(0,v.heading,v.lean);if(v.s.cycle)pedalPose(h,v.pedal);else seatPose(h);h.gun.visible=false}
  updatePassengers(dt);
  updateCamera(dt);updateSky(dt,true);updateRain(dt);updateNightLights();updateHUD(dt);drawMinimap();updateAudio();touchHUD();
  const P0=playerP();for(const s of zoneSprites){s.position.y=s.userData.y+Math.sin(time*2+s.userData.y)*0.25;s.visible=Math.hypot(s.position.x-P0.x,s.position.z-P0.z)>8}
  const P=playerP();sun.position.set(P.x+SUN_OFF.x,SUN_OFF.y,P.z+SUN_OFF.z);sun.target.position.set(P.x,0,P.z)}
let last=performance.now();const zoneSprites=[];
function loop(now){requestAnimationFrame(loop);const dt=Math.min(0.05,Math.max(0,(now-last)/1000));last=now;
  if(started&&!paused&&!consoleOpen){if(cineHold)cineTick(dt);else update(dt)}
  else if(!started){time+=dt;sim(dt);menuCam(dt);updateSky(dt,false);if(AC)updateAmbience(dt);sun.position.set(-37+SUN_OFF.x,SUN_OFF.y,40+SUN_OFF.z);sun.target.position.set(-37,0,40);updateAudio()}
  renderer.render(scene,camera)}

/* ================= init ================= */
function init(){buildWheel();setupTouch();if(REALMAP){initGeo();return}buildWorld();buildTrees();spawnWanderers();
  for(const p of PARKED){const v=spawnVehicle(p.type,p.x,p.z,p.h);v.keep=true}
  spawnVehicle('rowboat',-111,240,0);spawnVehicle('cruiser',-44,-154.4,Math.PI/2);spawnVehicle('cycle',-48,-154.6,Math.PI/2);spawnVehicle('suv',BC(5)+20,BC(2)+31,-Math.PI/2);buildSky();buildLamps();buildTrain();buildRain();buildMinimapBase();
  for(const st of STALLS){const h=makeHuman({shirt:rpick(['#f4f1e8','#8ecae6','#ffd166']),pants:'#f4f1e8',skin:rpick(SKIN)});h.g.position.set(st.cx,0.16,st.cz-st.fz*0.85);h.g.rotation.y=st.fz>0?0:Math.PI;h.armR.rotation.x=-0.8}
  for(const mp of MALLPEOPLE){const fem=Math.random()<0.5,sh=rpick(SHIRTS);const h=makeHuman({shirt:sh,pants:fem?sh:rpick(PANTS),skin:rpick(SKIN),long:fem});h.g.position.set(mp.x,mp.y,mp.z);h.g.rotation.y=mp.yaw}
  for(const f of FLAMES){const m=new THREE.Mesh(GEO.sph,MBasic('#ffb347'));m.position.set(f.x,f.y,f.z);m.scale.setScalar(0.22);scene.add(m);f.m=m}
  spawnVehicle('ambulance',HOSP.x+12,HOSP.z-2,Math.PI/2);spawnVehicle('bike',-36,-154.4,Math.PI/2);spawnVehicle('scooter',-40,-154.4,Math.PI/2);spawnVehicle('lorry',BC(8)+20,BC(3)+31,-Math.PI/2);
  player.human=makeHuman({shirt:'#2a9d8f',pants:'#22223b',skin:'#8d5524',gun:true});player.human.g.position.copy(player.pos);setGun();
  // hospital heal pad + shop pad
  const pad=(x,z,col)=>{const r=new THREE.Mesh(new THREE.RingGeometry(2.6,3.4,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.8,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.set(x,0.3,z);scene.add(r)};
  pad(HOSP.x,HOSP.z,0xff4d4d);pad(SHOP.x,SHOP.z,0x7fb8ff);
  for(const[k,x,z]of[['hosp',HOSP.x,HOSP.z],['gun',SHOP.x,SHOP.z]]){const s=iconSprite(k,x,3.6,z,2.6);s.userData.y=3.6;zoneSprites.push(s)}
  for(const f of FRIENDS){f.h=makeHuman({...f.look,gun:true});f.h.gun.visible=false;f.icon=iconSprite('heart',f.home.x,3.4,f.home.z,2)}
  spawnVehicle('car',-25,-154.2,Math.PI/2,'#b3202a');spawnVehicle('auto',-15,-154.4,Math.PI/2);
  const bs={x:BC(5),z:BC(2)};for(const[ox,oz]of[[-10,-8],[10,-8],[-10,8],[10,8]])spawnVehicle('bus',bs.x+ox,bs.z+oz,Math.PI/2);
  for(let n=0;n<12;n++){const i=RI(-NB,NB),j=RI(-NB,NB);const[dx,dz]=rpick(DIRS);if(!inGrid(i+dx,j+dz))continue;const t=RR(15,55);
    spawnVehicle(Math.random()<0.7?'car':'auto',i*CELL+dx*t+dz*6.2,j*CELL+dz*t-dx*6.2,Math.atan2(dx,dz))}
  for(let n=0;n<AI_TARGET;n++)spawnAI(aiType(),25)
  for(let n=0;n<QS.peds;n++)spawnPed();
  for(const sp of gangSpots)spawnGang(sp);
  initPlay();$('loading').classList.add('hidden');$('playBtn').classList.remove('hidden');
  requestAnimationFrame(loop)}
/* real-geography pilot (step G2): world, sky, player and a car to drive; traffic, people, gangs and missions follow in G4-G6 */
function initGeo(){initGeoWorld();initGeoNav();initGeoPois();$('bigmap').querySelector('.k').textContent='Click the map to set a GPS destination (click it again to clear) · + hospital · P police · B bus stand · press M to close';buildSky();buildRain();
  player.human=makeHuman({shirt:'#2a9d8f',pants:'#22223b',skin:'#8d5524',gun:true});player.human.g.position.copy(player.pos);setGun();
  for(const f of FRIENDS){f.h=makeHuman({...f.look,gun:true});f.h.gun.visible=false;f.icon=iconSprite('heart',f.home.x,3.4,f.home.z,2)}
  initPlay();GWLD.starters.push(spawnVehicle('car',player.pos.x+4,player.pos.z+3,0,'#b3202a'),spawnVehicle('bike',player.pos.x+7,player.pos.z+3,0));
  toast('REAL COIMBATORE · PILOT','Story, jobs and GPS on real streets · M = map',6);$('loading').classList.add('hidden');$('playBtn').classList.remove('hidden');requestAnimationFrame(loop)}
setTimeout(()=>{try{const t0=performance.now();init();window.__initMs=performance.now()-t0}catch(e){console.error(e);$('loading').textContent='Something went wrong while building the city: '+e.message}},30);
window.__game={step:(dt,n)=>{for(let i=0;i<(n||1);i++)update(dt)},storyAuto:()=>{const m=mission;if(m&&m.stages){const s=m.stages[m.stage];if(s&&s.auto)s.auto(m)}},cineSkip,get cineHold(){return cineHold},a2Epilogue:startEpilogue,damageGoon,setTod:v=>{tod=v},STORY,saveApi:{parseSave,sanitizeSave,saveSum,SAVE_VERSION,get blocked(){return saveBlocked},get notice(){return saveNotice}},abortMission:()=>{if(mission)missionFail('test')},markerPos:()=>marker.visible?marker.position.clone():null,PROG,startStory,startRampage,RAMPAGES,saveGame,loadGame,toggleCrouch,get heli(){return heli},get respect(){return respectLv()},set rep(v){rep=v},get paused(){return paused},GHAT:()=>GHAT,spawnVehicle,FALLS:()=>FALLS,train,setRain:v=>{rainF=v;rainOn=v>0.5},exitV:()=>exitVehicle(),get tod(){return tod},openWheel:m=>openWheel(m),renderer,raycastAll,camera,player,vehicles,goons,peds,FRIENDS,CHEATS,get mission(){return mission},get offers(){return offers},get wanted(){return wanted},set wanted(v){wanted=v},enterVehicle,startMission,K,setCam:(y,p)=>{camYaw=y;camPitch=p},openTalk,chooseTalk,get talk(){return talk},buyItem};
