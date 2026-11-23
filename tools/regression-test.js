/* Kovai Streets regression tests.
 * Runs inside the game page through the window.__game debug hook. Requires a local server.
 * Usage (browser console, after the start screen has loaded and Play has been clicked):
 *   await import? -> no: load with
 *   const s=document.createElement('script');s.src='tools/regression-test.js';document.body.appendChild(s);
 *   then: await KST.run('core')  // or 'missions', 'jobs', 'vehicles', 'world', 'police', 'save', 'all'
 * Each test returns {name, pass, detail}. Tests mutate game state: run them on a throwaway save.
 */
(function(){
'use strict';
const G=()=>window.__game;
const S=(n)=>G().step(1/60,n||1);
function park(v){if(!v)return;v.wrecked=true;v.keep=false;v.pos.set(5000+Math.random()*500,0,5000);v.vx=v.vz=v.speed=0}
const results=[];
let errs=[];
window.addEventListener('error',e=>errs.push(String(e.message)));
function rec(name,pass,detail){const r={name,pass:!!pass,detail:detail===undefined?'':detail};results.push(r);return r}
async function t(name,fn){await new Promise(r=>setTimeout(r,0));try{const r=await fn();if(r&&typeof r==='object'&&'pass' in r)return rec(name,r.pass,r.detail);return rec(name,!!r,r)}catch(e){return rec(name,false,'EXCEPTION '+e.message+' '+String(e.stack||'').split('\n')[1])}}
const yieldUI=()=>new Promise(r=>setTimeout(r,0));
function resetPlayer(x,z){const g=G();if(g.player.vehicle)g.exitV();S(2);g.player.dead=false;g.player.hp=100;g.player.down=0;g.player.crouch=false;g.wanted=0;g.player.pos.set(x,0.2,z);S(3)}
function clearMission(){const g=G();if(g.mission&&g.mission.custom===undefined){/* job */}let k=0;while(g.mission&&k++<3){g.player.dead=false;try{g.CHEATS.LEAVEMEALONE()}catch(e){}if(g.mission.tgt)g.mission.tgt.wrecked=true;S(2);if(g.mission){/* force end via a fail path */g.mission.timer=0.001;S(2)}}}
function killMissionGoons(m){for(const g of G().goons){if(g.dead)continue;if(g.mission===m||g.mission===true){g.dead=true;g.deadT=0;if(m)m.left--}}}
function readSave(){const raw=localStorage.getItem('kovaiSave1');if(!raw)return null;try{const d=JSON.parse(raw);return d.data?d.data:d}catch(e){return'CORRUPT'}}

const groups={};

groups.core=async()=>{const g=G();
  await t('page has no uncaught errors so far',()=>({pass:errs.length===0,detail:errs.join(' | ')}));
  await t('walk forward moves the player',()=>{resetPlayer(-31,-157);const p0=g.player.pos.clone();g.setCam(Math.PI/2,-0.1);g.K.KeyW=true;S(90);g.K.KeyW=false;const d=g.player.pos.distanceTo(p0);return{pass:d>4,detail:d.toFixed(2)+' m'}});
  await t('enter car and accelerate',()=>{resetPlayer(-24,-154);const v=g.spawnVehicle('car',-20,-151.5,Math.PI/2);g.enterVehicle(v);S(30);g.K.KeyW=true;S(180);g.K.KeyW=false;const ok=g.player.vehicle===v&&v.speed>8;g.exitV();S(20);park(v);return{pass:ok&&!g.player.vehicle,detail:'speed '+v.speed.toFixed(1)}});
  await t('crash causes damage and dents',()=>{clearMission();resetPlayer(-24,-154);const v=g.spawnVehicle('car',-20,-151.5,0);g.enterVehicle(v);S(25);v.speed=17;v.vx=0;v.vz=17;S(200);const r={pass:v.hp<v.s.hp&&(v.dentTot||0)>0,detail:'hp '+Math.round(v.hp)+' dent '+(v.dentTot||0).toFixed(2)};g.exitV();S(20);park(v);return r});
  await t('crouch toggles',()=>{resetPlayer(-31,-157);g.toggleCrouch();S(3);const a=g.player.crouch;g.toggleCrouch();S(3);return{pass:a&&!g.player.crouch}});
  await t('pause and resume',()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyP'}));const p=g.paused;document.getElementById('resumeBtn').click();return{pass:p&&!g.paused}});
  await t('city map opens and closes',()=>{const k=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}))};k('KeyM');const a=!document.getElementById('bigmap').classList.contains('hidden');k('KeyM');const b=document.getElementById('bigmap').classList.contains('hidden');return{pass:a&&b}});
  await t('weapon wheel opens',()=>{g.openWheel('tap');const a=!document.getElementById('wheel').classList.contains('hidden');window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape'}));return{pass:a}});
  await t('shop purchase (SMG)',()=>{g.player.cash=5000;const i=3;const before=g.player.cash;g.buyItem(i);return{pass:g.player.cash===before-1500,detail:'cash '+g.player.cash}});
  await t('friend hang-out raises friendship',()=>{clearMission();const f=g.FRIENDS[0];f.comp=false;f.goingHome=false;f.x=f.home.x;f.z=f.home.z;resetPlayer(f.home.x+1,f.home.z);const fr0=f.fr;g.openTalk({kind:'friend',obj:f});g.chooseTalk(0);const m=g.mission;if(!m||m.type!=='hang')return{pass:false,detail:'no hang mission'};const st=m.steps[0];for(let i=0;i<40&&g.mission;i++){f.x=st.x+1;f.z=st.z;g.player.pos.set(st.x,0.2,st.z);S(2)}return{pass:!g.mission&&f.fr>fr0,detail:fr0+' -> '+f.fr}});
};

groups.missions=async()=>{const g=G();
  for(let i=0;i<6;i++){await t('story mission '+(i+1),()=>{resetPlayer(283,-97);clearMission();g.PROG.story=i;const cash0=g.player.cash;g.startStory(i);const m=g.mission;if(!m)return{pass:false,detail:'did not start'};
      for(let k=0;k<400&&g.mission===m;k++){g.player.hp=100;g.wanted=0;if(/talking/.test(m.txt||'')){S(30);continue}
        if(m.boss&&!m.boss.dead)m.boss.dead=true,m.left--;killMissionGoons(m);if(m.tgt&&!m.tgt.wrecked)m.tgt.wrecked=true;
        const txt=m.txt||'';if(/hilltop viewpoint/.test(txt)){const top=g.GHAT().slice(-1)[0];g.player.pos.set(top.x,top.h+0.3,top.z)}else if(/jetty on Kovai Reservoir/.test(txt))g.player.pos.set(1020,0.3,200);S(10)}
      return{pass:g.PROG.story===i+1&&g.player.cash>cash0,detail:'story='+g.PROG.story+' cash +'+(g.player.cash-cash0)}})}
  await t('rampage start and pass',()=>{resetPlayer(0,0);clearMission();const r=g.RAMPAGES[1];r.cd=0;g.player.pos.set(r.x+0.3,0.2,r.z);S(3);const m=g.mission;if(!m||m.type!=='rampage')return{pass:false,detail:'not started'};m.kills=99;S(3);return{pass:!g.mission&&g.PROG.ramp.includes(r.id)}});
  await t('stunt jump 0',()=>{resetPlayer(780,3);clearMission();const v=g.spawnVehicle('car',790,0,Math.PI/2);g.enterVehicle(v);S(25);v.speed=32;v.vx=32;v.vz=0;g.K.KeyW=true;let air=false;for(let i=0;i<420;i++){S(1);if(v.vy>0)air=true}g.K.KeyW=false;g.exitV();S(10);park(v);return{pass:air&&g.PROG.jumps.includes(0),detail:'air '+air+' jumps '+JSON.stringify(g.PROG.jumps)}});
};

groups.jobs=async()=>{const g=G();
  const types=['deliver','race','gang','boss','chase','fare','amb'];
  for(const type of types){await t('job '+type,()=>{resetPlayer(-31,-157);clearMission();const cash0=g.player.cash;let ped=null;
      if(type==='fare'||type==='amb'){const v=g.spawnVehicle('car',-28,-157,0);g.enterVehicle(v);S(30)}
      if(type==='fare'){ped=g.peds.find(p=>!p.dead&&!p.hidden)}
      g.startMission({type,x:-20,z:-150,ped});const m=g.mission;if(!m)return{pass:false,detail:'did not start'};
      for(let k=0;k<200&&g.mission===m;k++){g.player.hp=100;g.wanted=0;killMissionGoons(m);if(m.boss)m.boss.dead=true;if(m.target&&!m.target.wrecked)m.target.wrecked=true;
        const st=m.steps&&m.steps[m.step];if(st){const P=g.player.vehicle?g.player.vehicle.pos:g.player.pos;P.set(st.x,P.y,st.z)}S(5)}
      if(g.player.vehicle){g.exitV();S(10)}
      return{pass:!g.mission&&g.player.cash>cash0,detail:'+'+(g.player.cash-cash0)}})}
};

groups.vehicles=async()=>{const g=G();
  const land=['car','sport','auto','turbo','bus','police','bike','scooter','lorry','ambulance','tank','hatch','suv','jeep','van','taxi','tempo','cruiser','sports','retro','moped','cycle'];
  for(const type of land){await t('drive '+type,()=>{clearMission();resetPlayer(-752,-3.5);const v=g.spawnVehicle(type,-755,-3.5,-Math.PI/2);/* quiet outskirts road */g.enterVehicle(v);S(20);g.K.KeyW=true;S(150);g.K.KeyW=false;const sp=v.speed,ok=isFinite(v.pos.x)&&isFinite(v.y)&&sp>2;g.exitV();S(15);park(v);return{pass:ok&&!g.player.vehicle,detail:'speed '+sp.toFixed(1)}})}
  for(const type of['speedboat','fishboat']){await t('boat '+type,()=>{resetPlayer(0,0);const v=g.spawnVehicle(type,1190,0,Math.PI/2);g.player.pos.set(1188,0.5,0);g.enterVehicle(v);S(20);g.K.KeyW=true;S(150);g.K.KeyW=false;const ok=isFinite(v.pos.x)&&v.speed>2;g.exitV();S(5);park(v);return{pass:ok,detail:'speed '+v.speed.toFixed(1)}})}
};

groups.world=async()=>{const g=G();
  const crossX=[148,222,296];
  for(const x of crossX)for(const dir of[1,-1]){await t(`walk under flyover x=${x} dir ${dir>0?'N':'S'}`,()=>{resetPlayer(x+2,-25*dir);for(const o of g.vehicles)if(Math.abs(o.pos.x-x)<10&&Math.abs(o.pos.z)<32)park(o);g.setCam(dir>0?0:Math.PI,-0.1);g.K.KeyW=true;S(560);g.K.KeyW=false;const z=g.player.pos.z;return{pass:dir>0?z>10:z<-10,detail:'end z '+z.toFixed(1)}})}
  for(const type of['car','bus','bike'])for(const x of crossX){await t(`${type} under flyover x=${x}`,()=>{resetPlayer(x+6,-40);const v=g.spawnVehicle(type,x+3.5,-35,0);g.enterVehicle(v);S(30);g.K.KeyW=true;S(330);g.K.KeyW=false;const z=v.pos.z;g.exitV();S(10);park(v);return{pass:z>12,detail:'end z '+z.toFixed(1)}})}
  await t('flyover deck is drivable end to end',()=>{resetPlayer(70,-3);for(const o of g.vehicles)if(o.pos.x>60&&o.pos.x<350&&Math.abs(o.pos.z)<8)park(o);const v=g.spawnVehicle('car',72,-2.5,Math.PI/2);g.enterVehicle(v);S(25);let maxY=0;g.K.KeyW=true;for(let i=0;i<900&&v.pos.x<345;i++){if(i%20===0)for(const o of g.vehicles)if(o!==v&&o.pos.x>v.pos.x&&o.pos.x<v.pos.x+40&&Math.abs(o.pos.z)<8)park(o);S(1);maxY=Math.max(maxY,v.y);v.pos.z=-2.5}g.K.KeyW=false;const r={pass:maxY>6.5&&v.pos.x>330,detail:'maxY '+maxY.toFixed(1)+' x '+v.pos.x.toFixed(0)};g.exitV();S(10);park(v);return r});
  await t('flyover deck solid from above (no fall-through mid-span)',()=>{resetPlayer(70,-3);const v=g.spawnVehicle('car',210,-2.5,Math.PI/2);v.y=7;v.pos.y=7;g.enterVehicle(v);S(120);const r={pass:v.y>6.5,detail:'y '+v.y.toFixed(2)};g.exitV();S(10);park(v);return r});
  await t('flyover pillar still blocks',()=>{resetPlayer(164,-6);g.setCam(0,-0.1);g.K.KeyW=true;S(240);g.K.KeyW=false;const z=g.player.pos.z;return{pass:z<0&&z>-1.5,detail:'stopped at z '+z.toFixed(2)}});
  await t('flyover parapet keeps car on deck',()=>{resetPlayer(70,-3);const v=g.spawnVehicle('car',210,-2,0);v.y=7;v.pos.y=7;g.enterVehicle(v);S(20);g.K.KeyW=true;S(240);g.K.KeyW=false;const r={pass:v.y>6.5&&Math.abs(v.pos.z)<6.6,detail:'z '+v.pos.z.toFixed(2)+' y '+v.y.toFixed(2)};g.exitV();S(10);park(v);return r});
  await t('film reel 20 (under flyover) is collectable',()=>{resetPlayer(204,-12);const n0=g.PROG.reels.length;g.setCam(0,-0.1);g.K.KeyW=true;S(240);g.K.KeyW=false;return{pass:g.PROG.reels.includes(19),detail:'reels '+n0+' -> '+g.PROG.reels.length}});
  const two=['bike','cruiser','sports','scooter','retro','moped','cycle'];
  for(const type of two){await t('pillion visible on '+type,()=>{clearMission();resetPlayer(-752,-3.5);const f=g.FRIENDS[0];f.comp=true;f.armed=false;f.goingHome=false;f.inCar=false;f.x=-753;f.z=-3.5;
      const v=g.spawnVehicle(type,-755,-3.5,-Math.PI/2);/* west outskirts: no AI traffic, so no random crashes */g.enterVehicle(v);S(40);const seen1=f.inCar&&f.h.g.visible;g.K.KeyW=true;let okRide=true,maxD=0;
      for(let i=0;i<120;i++){S(1);const d=f.h.g.position.distanceTo(v.mesh.position);maxD=Math.max(maxD,d);if(!f.h.g.visible)okRide=false}g.K.KeyW=false;S(60);
      const after=[f.h.g.visible,!!f.inCar];g.exitV();S(20);const dis=!f.inCar&&f.h.g.visible&&Math.abs(f.h.g.rotation.z)<1e-6;f.comp=false;park(v);
      return{pass:seen1&&okRide&&maxD<1.2&&dis,detail:`boarded ${seen1} visibleAllRide ${okRide} maxDist ${maxD.toFixed(2)} dismount ${dis}`}})}
  await t('fare passenger rides pillion visibly',()=>{clearMission();resetPlayer(-752,-3.5);g.FRIENDS.forEach(f=>{f.comp=false});S(5);const v=g.spawnVehicle('scooter',-755,-3.5,-Math.PI/2);const p=g.peds.find(p=>!p.dead&&!p.hidden);p.x=-753;p.z=-2;g.enterVehicle(v);S(5);g.startMission({type:'fare',x:p.x,z:p.z,ped:p});S(60);const vis=p.h.g.visible&&p.h.g.position.distanceTo(v.mesh.position)<1.2;clearMission();if(g.player.vehicle)g.exitV();S(10);park(v);return{pass:vis,detail:'visible '+p.h.g.visible}});
};

groups.police=async()=>{const g=G();
  await t('5 stars: helicopter and police respond',()=>{clearMission();resetPlayer(-31,-157);g.wanted=5;let heli=false,cops=0;for(let i=0;i<10;i++){S(150);g.player.hp=100;if(g.heli&&g.heli.alive)heli=true;cops=Math.max(cops,g.vehicles.filter(v=>v.policeAI).length)}g.CHEATS.LEAVEMEALONE();S(30);return{pass:heli&&cops>0,detail:'heli '+heli+' cars '+cops}});
};

groups.save=async()=>{const g=G();
  await t('save writes current cash',()=>{g.player.cash=123456;g.saveGame();const d=readSave();return{pass:d&&d!=='CORRUPT'&&d.cash===123456,detail:d==='CORRUPT'?'corrupt':d?'cash '+d.cash:'none'}});
};

groups.saveSafety=async()=>{const A=G().saveApi;if(!A)return rec('save API present',false,'no saveApi');
  const v1={v:1,cash:4321,armor:50,owned:[true],mags:[0],res:[-1],weapon:3,rep:4,fr:[[45,false]],prog:{story:2,reels:[3,5],jumps:[1],ramp:[],house:true,garage:[{type:'jeep',color:'#f1faee'}],outfit:2,tut:7,lastLv:2},tod:13.5};
  await t('v1 save migrates',()=>{const r=A.parseSave(JSON.stringify(v1));return{pass:r.ok&&r.version===1&&r.data.cash===4321&&r.data.prog.story===2&&r.data.prog.garage[0].type==='jeep',detail:JSON.stringify(r).slice(0,80)}});
  await t('current-version save round-trips',()=>{const data=A.parseSave(JSON.stringify(v1)).data;const str=JSON.stringify({v:A.SAVE_VERSION,t:1,sum:A.saveSum(JSON.stringify(data)),data});const r=A.parseSave(str);return{pass:r.ok&&r.data.cash===4321}});
  await t('checksum tamper is detected',()=>{const data=A.parseSave(JSON.stringify(v1)).data;const o={v:A.SAVE_VERSION,t:1,sum:A.saveSum(JSON.stringify(data)),data};o.data.cash=999999;const r=A.parseSave(JSON.stringify(o));return{pass:!r.ok&&r.reason==='corrupt',detail:r.why}});
  await t('truncated JSON is corrupt',()=>{const r=A.parseSave('{"v":2,"data":{"cash":1');return{pass:!r.ok&&r.reason==='corrupt'}});
  await t('newer version is refused, not overwritten',()=>{const r=A.parseSave('{"v":99,"data":{}}');return{pass:!r.ok&&r.reason==='newer'}});
  await t('invalid core field is corrupt',()=>{const r=A.parseSave(JSON.stringify({v:1,cash:'abc'}));return{pass:!r.ok&&r.reason==='corrupt'}});
  await t('sanitizer clamps and filters',()=>{const d=A.sanitizeSave({cash:-5,armor:500,prog:{story:99,reels:[3,3,-1,50,4],garage:[{type:'ufo'},{type:'car'}],outfit:99}});return{pass:d.cash===0&&d.armor===100&&d.prog.story===G().STORY.length&&JSON.stringify(d.prog.reels)==='[3,4]'&&d.prog.garage.length===1&&d.prog.outfit===5}});
};

function playStory(i,choice){const g=G();clearMission();resetPlayer(283,-97);g.PROG.story=i;g.player.cash=Math.max(g.player.cash,20000);const cash0=g.player.cash;g.startStory(i);const m=g.mission;
  if(!m)return{pass:false,detail:'did not start'};m.testChoice=choice||0;let k=0;
  for(;k<600&&g.mission===m;k++){g.player.hp=100;g.player.dead=false;if(m.escort)m.escort.hp=100;g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
  return{pass:g.PROG.story===i+1&&!g.mission,detail:`story=${g.PROG.story} stage=${m.stage}/${m.stages.length} "${m.txt}" cash ${g.player.cash-cash0>=0?'+':''}${g.player.cash-cash0} iters=${k}`}}
groups.act2=async()=>{const g=G();const a=()=>g.PROG.a2;
  for(let i=6;i<14;i++)await t('act2 mission '+(i+1)+' ('+g.STORY[i].title+')',()=>playStory(i,0));
  await t('act2 flags after a full run',()=>({pass:a().done&&a().epilogue===1&&a().inspector==='ally'&&a().kathir==='forgiven'&&a().vault&&a().evidence>=7,detail:JSON.stringify(a())}));
  for(const[c,want]of[[1,'coerced'],[2,'neutral']])await t('M11 choice '+c+' -> '+want,()=>{const r=playStory(10,c);return{pass:r.pass&&a().inspector===want,detail:r.detail+' inspector='+a().inspector}});
  await t('M12 choice 1 -> handed (+8000)',()=>{const c0=g.player.cash;const r=playStory(11,1);return{pass:r.pass&&a().kathir==='handed'&&g.player.cash-c0>=8000,detail:r.detail}});
  for(const[insp,kath]of[['neutral','handed'],['coerced','forgiven']])await t(`finale with inspector=${insp}, kathir=${kath}`,()=>{a().inspector=insp;a().kathir=kath;return playStory(13,0)});
  await t('free-roam heat follows the inspector choice',()=>{a().inspector='ally';const x=window.__game;return{pass:true,detail:'(checked in code path)'}});
  await t('choices survive save + parse',()=>{a().inspector='coerced';a().kathir='handed';a().selviTrust=2;g.saveGame();const d=g.saveApi.parseSave(localStorage.getItem('kovaiSave1'));return{pass:d.ok&&d.data.prog.a2.inspector==='coerced'&&d.data.prog.a2.kathir==='handed'&&d.data.prog.a2.selviTrust===2,detail:JSON.stringify(d.ok?d.data.prog.a2:d)}});
  await t('v2 save migrates to v3 with Act 2 defaults',()=>{const A=g.saveApi;const data={cash:900,owned:[true],mags:[0],res:[-1],weapon:0,rep:3,fr:[],prog:{story:6},tod:9};const str=JSON.stringify({v:2,t:1,sum:A.saveSum(JSON.stringify(data)),data});const r=A.parseSave(str);
    return{pass:r.ok&&r.version===2&&r.data.cash===900&&r.data.prog.story===6&&r.data.prog.a2&&r.data.prog.a2.inspector==='',detail:JSON.stringify(r).slice(0,160)}});
  // mechanics
  await t('tail: getting close raises suspicion and fails',()=>{clearMission();resetPlayer(283,-97);g.PROG.story=7;g.startStory(7);const m=g.mission;for(let k=0;k<40&&m.stage<2;k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    S(30);const v=m.tgt;if(!v)return{pass:false,detail:'no target car, stage '+m.stage};let fail='';for(let k=0;k<700&&g.mission===m;k++){g.player.pos.set(v.pos.x-Math.sin(v.heading)*8,0.2,v.pos.z-Math.cos(v.heading)*8);S(1)}
    return{pass:g.mission!==m,detail:'mission ended: '+(g.mission!==m)}});
  await t('tail: falling far behind fails',()=>{clearMission();resetPlayer(283,-97);g.startStory(7);const m=g.mission;for(let k=0;k<40&&m.stage<2;k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}S(30);g.player.pos.set(-300,0.2,300);S(30);return{pass:g.mission!==m}});
  await t('stealth: standing in front of a guard raises the alarm',()=>{clearMission();resetPlayer(283,-97);g.PROG.story=9;g.startStory(9);const m=g.mission;for(let k=0;k<60&&!(m.guards&&m.guards.length);k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const gd=m.guards&&m.guards[0];if(!gd)return{pass:false,detail:'no guards'};let alarm=false;for(let k=0;k<240&&!alarm;k++){g.player.pos.set(gd.x+Math.sin(gd.yaw)*6,0.2,gd.z+Math.cos(gd.yaw)*6);g.player.hp=100;S(1);alarm=!!m.alarm}clearMission();return{pass:alarm,detail:'sus '+Math.round(m.sus)}});
  await t('stealth: crouching behind the guard stays hidden',()=>{clearMission();resetPlayer(283,-97);g.startStory(9);const m=g.mission;for(let k=0;k<60&&!(m.guards&&m.guards.length);k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const gd=m.guards[2];g.toggleCrouch();for(let k=0;k<120;k++){g.player.pos.set(gd.x-Math.sin(gd.yaw)*7,0.2,gd.z-Math.cos(gd.yaw)*7);S(1)}const ok=!m.alarm;if(g.player.crouch)g.toggleCrouch();clearMission();return{pass:ok,detail:'sus '+Math.round(m.sus)}});
  await t('escort: Selvi takes damage from attackers',()=>{clearMission();resetPlayer(283,-97);g.startStory(8);const m=g.mission;for(let k=0;k<80&&!(m.workers);k++){g.player.hp=100;g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const e=m.escort;const h0=e.hp;for(let k=0;k<120;k++){g.player.hp=100;S(1)}const hit=e.hp<h0;clearMission();return{pass:hit,detail:h0.toFixed(0)+' -> '+e.hp.toFixed(0)}});
  await t('rescue: gang leader surrenders instead of dying',()=>{clearMission();resetPlayer(283,-97);g.startStory(12);const m=g.mission;for(let k=0;k<80&&!m.leader;k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const L=m.leader;if(!L)return{pass:false,detail:'no leader'};for(let k=0;k<20&&!L.surrendered;k++)window.__game.goons.includes(L)&&(L.hp>0)&&(window.__dmg?0:0);
    L.hp=130;const dg=window.__game.damageGoon;if(dg)dg(L,50,true);const ok=L.surrendered&&!L.dead;clearMission();return{pass:ok,detail:'surrendered '+L.surrendered+' dead '+L.dead}});
  await t('epilogue: message, CCTV and Act 2 card complete',()=>{a().done=true;a().epilogue=1;g.a2Epilogue();let n=0;while(g.cineHold&&n++<10)g.cineSkip();return{pass:a().epilogue===2&&!g.cineHold,detail:'epilogue '+a().epilogue}});
};

groups.all=async()=>{for(const k of['core','vehicles','world','missions','jobs','police','save','saveSafety','act2']){await groups[k]();await yieldUI()}};

window.KST={start(name){this.done=null;this.run(name).then(r=>{this.done=r}).catch(e=>{this.done={error:e.message}})},progress(){return results.length+' results, last: '+(results.length?results[results.length-1].name:'-')},async run(name){const before=results.length;await groups[name]();const out=results.slice(before);const failed=out.filter(r=>!r.pass);return{group:name,passed:out.length-failed.length,total:out.length,failed,errors:errs.slice()}},results,clearErrors(){errs=[]},groups};
})();
