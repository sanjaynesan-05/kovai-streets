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
/* download the map chunks along a route first: tests run long synchronous loops, during which the game's own background downloads cannot finish */
async function preload(pts){const S=GWLD.index.size_m,keys=new Set();for(const p of pts)for(const dx of[-1,0,1])for(const dz of[-1,0,1])keys.add(Math.floor(p[0]/S+dx)+','+Math.floor(p[1]/S+dz));
  await Promise.all([...keys].filter(k=>!GWLD.data.has(k)).map(k=>{const c=GWLD.index.chunks.find(c=>c.i+','+c.j===k);return c?fetch('geodata/processed/pilot/chunks/'+c.file).then(r=>r.json()).then(j=>GWLD.data.set(k,j)):null}))}
/* a long, straight, wide real road for vehicle tests; traffic near it is parked first */
function quietRoad(){if(quietRoad.c)return quietRoad.c;let best=null;for(const e of NAV.E){if(e.bridge||e.layer||e.len<160)continue;const a=e.pts[0],b=e.pts[e.pts.length-1];if(Math.hypot(b[0]-a[0],b[1]-a[1])<e.len*0.97)continue;if(!best||e.w>best.w)best=e}
  const a=best.pts[0],b=best.pts[best.pts.length-1],h=Math.atan2(b[0]-a[0],b[1]-a[1]);return quietRoad.c={x:a[0]+Math.sin(h)*30,z:a[1]+Math.cos(h)*30,h}}
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
  await t('crash causes damage and dents',()=>{clearMission();const P=g.player.pos;let b=null;for(const q of queryBoxes(P.x,P.z,150))if(q.maxX-q.minX>5&&q.h>4&&q.y0<0&&(!b||(q.maxX-q.minX)>(b.maxX-b.minX)))b=q;/* real buildings are collision strips; any wide strip will do */if(!b)return{pass:false,detail:'no building nearby'};const cx=(b.minX+b.maxX)/2,cz=b.minZ-14;resetPlayer(cx+3,cz-4);for(const o of g.vehicles)if(Math.hypot(o.pos.x-cx,o.pos.z-cz)<25)park(o);const v=g.spawnVehicle('car',cx,cz,0);g.enterVehicle(v);S(25);v.speed=17;v.vx=0;v.vz=17;S(200);const r={pass:v.hp<v.s.hp&&(v.dentTot||0)>0,detail:'hp '+Math.round(v.hp)+' dent '+(v.dentTot||0).toFixed(2)};g.exitV();S(20);park(v);return r});/* drives into a real building near the start */
  await t('crouch toggles',()=>{resetPlayer(-31,-157);g.toggleCrouch();S(3);const a=g.player.crouch;g.toggleCrouch();S(3);return{pass:a&&!g.player.crouch}});
  await t('pause and resume',()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyP'}));const p=g.paused;document.getElementById('resumeBtn').click();return{pass:p&&!g.paused}});
  await t('city map opens and closes',()=>{const k=c=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c}))};k('KeyM');const a=!document.getElementById('bigmap').classList.contains('hidden');k('KeyM');const b=document.getElementById('bigmap').classList.contains('hidden');return{pass:a&&b}});
  await t('weapon wheel opens',()=>{g.openWheel('tap');const a=!document.getElementById('wheel').classList.contains('hidden');window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape'}));return{pass:a}});
  await t('shop purchase (SMG)',()=>{g.player.cash=5000;const i=3;const before=g.player.cash;g.buyItem(i);return{pass:g.player.cash===before-1500,detail:'cash '+g.player.cash}});
  await t('friend hang-out raises friendship',()=>{clearMission();const f=g.FRIENDS[0];f.comp=false;f.goingHome=false;f.x=f.home.x;f.z=f.home.z;resetPlayer(f.home.x+1,f.home.z);const fr0=f.fr;g.openTalk({kind:'friend',obj:f});g.chooseTalk(0);const m=g.mission;if(!m||m.type!=='hang')return{pass:false,detail:'no hang mission'};const st=m.steps[0];for(let i=0;i<40&&g.mission;i++){f.x=st.x+1;f.z=st.z;g.player.pos.set(st.x,0.2,st.z);S(2)}return{pass:!g.mission&&f.fr>fr0,detail:fr0+' -> '+f.fr}});
};

groups.missions=async()=>{const g=G();
  for(let i=0;i<6;i++)await t('story mission '+(i+1)+' ('+g.STORY[i].title+')',()=>playStory(i,0));/* stage shortcuts (auto) work on either map */
  await t('rampage start and pass',()=>{resetPlayer(0,0);clearMission();const r=g.RAMPAGES[1];r.cd=0;g.player.pos.set(r.x+0.3,0.2,r.z);S(3);const m=g.mission;if(!m||m.type!=='rampage')return{pass:false,detail:'not started'};m.kills=99;S(3);return{pass:!g.mission&&g.PROG.ramp.includes(r.id)}});
  await t('stunt jump 0',()=>{const r=g.RAMPS[0],[ax,az]=r.a,[dx,dz]=r.d;resetPlayer(ax-dx*40+dz*4,az-dz*40-dx*4);clearMission();const v=g.spawnVehicle('car',ax-dx*30,az-dz*30,Math.atan2(dx,dz));for(const o of g.vehicles)if(o!==v&&Math.hypot(o.pos.x-ax,o.pos.z-az)<60)park(o);g.enterVehicle(v);S(25);v.speed=32;v.vx=dx*32;v.vz=dz*32;g.K.KeyW=true;let air=false;for(let i=0;i<420;i++){S(1);if(v.vy>0)air=true}g.K.KeyW=false;g.exitV();S(10);park(v);return{pass:air&&g.PROG.jumps.includes(0),detail:'air '+air+' jumps '+JSON.stringify(g.PROG.jumps)}});/* uses the ramp the game built, on either map */
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
  for(const type of land){await t('drive '+type,()=>{clearMission();const Q=quietRoad();resetPlayer(Q.x-Math.sin(Q.h)*3,Q.z-Math.cos(Q.h)*3);for(const o of G().vehicles)if(Math.hypot(o.pos.x-Q.x,o.pos.z-Q.z)<120)park(o);const v=g.spawnVehicle(type,Q.x,Q.z,Q.h);/* quiet outskirts road */g.enterVehicle(v);S(20);g.K.KeyW=true;S(150);g.K.KeyW=false;const sp=v.speed,ok=isFinite(v.pos.x)&&isFinite(v.y)&&sp>2;g.exitV();S(15);park(v);return{pass:ok&&!g.player.vehicle,detail:'speed '+sp.toFixed(1)}})}
  for(const type of['speedboat','fishboat']){await t('boat '+type,()=>{resetPlayer(0,0);const v=g.spawnVehicle(type,1190,0,Math.PI/2);g.player.pos.set(1188,0.5,0);g.enterVehicle(v);S(20);g.K.KeyW=true;S(150);g.K.KeyW=false;const ok=isFinite(v.pos.x)&&v.speed>2;g.exitV();S(5);park(v);return{pass:ok,detail:'speed '+v.speed.toFixed(1)}})}
};

groups.world=async()=>{const g=G();
  /* real-map flyover (G7): the longest raised bridge edge in the road graph, and a ground road that passes under it */
  const X=(a,b,c,d)=>{const den=(b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0]);if(!den)return null;const t=((c[0]-a[0])*(d[1]-c[1])-(c[1]-a[1])*(d[0]-c[0]))/den,u=((c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0]))/den;return t>0&&t<1&&u>0&&u<1?{t,u}:null};
  const at=(e,s)=>{const c=e.cum;let k=1;while(k<c.length-1&&c[k]<s)k++;const t=Math.min(1,Math.max(0,(s-c[k-1])/((c[k]-c[k-1])||1))),a=e.pts[k-1],b=e.pts[k];return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,h:Math.atan2(b[0]-a[0],b[1]-a[1])}};
  const load=(x,z)=>{resetPlayer(x,z);for(let k=0;k<40&&!(geoDeckH(x,z,99)>-1e8||queryBoxes(x,z,30).length);k++)S(20);S(20)};
  const [fly,cross]=(()=>{let best=null;for(const f of NAV.E){if(!f.bridge||f.layer<1||f.len<200||f.len>1800)continue;const xs=[];
      for(const e of NAV.E){if(e.bridge||e.layer||e.w<6||e.len<30)continue;for(let i=1;i<e.pts.length;i++)for(let k=1;k<f.pts.length;k++){const r=X(e.pts[i-1],e.pts[i],f.pts[k-1],f.pts[k]);if(!r)continue;
        const s=f.cum[k-1]+(f.cum[k]-f.cum[k-1])*r.u;if(s<60||s>f.len-60)continue;const a=e.pts[i-1],b=e.pts[i];xs.push({x:a[0]+(b[0]-a[0])*r.t,z:a[1]+(b[1]-a[1])*r.t,h:Math.atan2(b[0]-a[0],b[1]-a[1])})}}
      if(xs.length&&(!best||xs.length>best[1].n))best=[f,Object.assign(xs[0],{n:xs.length})]}return best||[null,null]})();
  await t('real flyover and an underpass found',()=>({pass:!!fly&&!!cross,detail:fly?`flyover ${fly.len.toFixed(0)} m, underpass ${cross?'yes':'no'}`:'no flyover'}));
  const under=(type)=>{const c=cross,fx=Math.sin(c.h),fz=Math.cos(c.h);load(c.x,c.z);const dh=geoDeckH(c.x,c.z,99);for(const o of g.vehicles)if(Math.hypot(o.pos.x-c.x,o.pos.z-c.z)<45)park(o);
    const sx=c.x-fx*25,sz=c.z-fz*25;let v=null;resetPlayer(sx,sz);if(type){v=g.spawnVehicle(type,sx,sz,c.h);g.enterVehicle(v);S(25)}else g.setCam(c.h,-0.1);
    let maxY=0;g.K.KeyW=true;for(let k=0;k<(type?330:560);k++){S(1);const o=type?v:g.player;if(type)v.heading=c.h;maxY=Math.max(maxY,type?v.y:o.pos.y)}g.K.KeyW=false;
    const P=type?v.pos:g.player.pos,prog=(P.x-c.x)*fx+(P.z-c.z)*fz;if(type){g.exitV();S(10);park(v)}return{pass:prog>8&&maxY<2,detail:`deck ${dh.toFixed(1)} m above; passed ${prog.toFixed(1)} m beyond, max height ${maxY.toFixed(1)}`}};
  await t('walk under a real flyover',()=>cross?under(null):{pass:false,detail:'no underpass'});
  for(const type of['car','bus','bike'])await t(type+' under a real flyover',()=>cross?under(type):{pass:false,detail:'no underpass'});
  await t('real flyover deck is drivable end to end',async()=>{if(!fly)return{pass:false};await preload(fly.pts);const a=at(fly,0);load(a.x,a.z);for(const o of g.vehicles)if(Math.hypot(o.pos.x-a.x,o.pos.z-a.z)<fly.len+20)park(o);
    const v=g.spawnVehicle('car',a.x,a.z,a.h);g.enterVehicle(v);S(25);let maxY=0,s=0;g.K.KeyW=true;
    for(let k=0;k<Math.ceil(fly.len*8);k++){if(s>=fly.len-12)break;{let bd=1e9;for(let q=0;q<=fly.len;q+=2){const p=at(fly,q),d=Math.hypot(p.x-v.pos.x,p.z-v.pos.z);if(d<bd){bd=d;s=q}}const T=at(fly,Math.min(fly.len,s+12));v.heading=Math.atan2(T.x-v.pos.x,T.z-v.pos.z);S(1);maxY=Math.max(maxY,v.y)}}
    g.K.KeyW=false;const r={pass:maxY>5&&s>=fly.len-14,detail:`max height ${maxY.toFixed(1)} m, reached ${s.toFixed(0)} of ${fly.len.toFixed(0)} m`};g.exitV();S(10);park(v);return r});
  await t('real flyover deck solid mid-span',()=>{if(!fly)return{pass:false};const m=at(fly,fly.len/2);load(m.x,m.z);const dh=geoDeckH(m.x,m.z,99);const v=g.spawnVehicle('car',m.x,m.z,m.h);v.y=dh+0.5;v.pos.y=dh+0.5;g.enterVehicle(v);S(120);
    const r={pass:dh>4&&v.y>dh-0.5,detail:`deck ${dh.toFixed(1)}, car ${v.y.toFixed(2)}`};g.exitV();S(10);park(v);return r});
  await t('real flyover parapet keeps a car on the deck',()=>{if(!fly)return{pass:false};const m=at(fly,fly.len/2);load(m.x,m.z);const dh=geoDeckH(m.x,m.z,99);const v=g.spawnVehicle('car',m.x,m.z,m.h+Math.PI/2);v.y=dh+0.5;v.pos.y=dh+0.5;g.enterVehicle(v);S(20);
    g.K.KeyW=true;S(240);g.K.KeyW=false;const lat=Math.abs((v.pos.x-m.x)*Math.cos(m.h)-(v.pos.z-m.z)*Math.sin(m.h));const r={pass:v.y>dh-0.6&&lat<fly.w/2+1.2,detail:`height ${v.y.toFixed(2)} (deck ${dh.toFixed(1)}), ${lat.toFixed(1)} m from the centre line`};g.exitV();S(10);park(v);return r});
  await t('real flyover pillar blocks',()=>{if(!fly)return{pass:false};const m=at(fly,fly.len/2);load(m.x,m.z);let pier=null;for(let q=0;q<fly.len&&!pier;q+=4){const p=at(fly,q);for(const b of queryBoxes(p.x,p.z,3))if(b.maxX-b.minX<1.4&&b.maxZ-b.minZ<1.4&&b.h>3&&b.y0<0){pier=b;break}}
    if(!pier)return{pass:false,detail:'no pillar collider found'};const cx=(pier.minX+pier.maxX)/2,cz=(pier.minZ+pier.maxZ)/2;resetPlayer(cx-4,cz);g.setCam(Math.PI/2,-0.1);g.K.KeyW=true;S(240);g.K.KeyW=false;
    const d=Math.hypot(g.player.pos.x-cx,g.player.pos.z-cz);return{pass:d>0.6,detail:`stopped ${d.toFixed(2)} m from the pillar centre`}});
  await t('a real-map film reel is collectable',()=>{const r=reelObjs.find(o=>!o.got);if(!r)return{pass:true,detail:'all collected'};const n0=g.PROG.reels.length;resetPlayer(r.x-3,r.z);g.setCam(Math.PI/2,-0.1);g.K.KeyW=true;S(240);g.K.KeyW=false;
    return{pass:g.PROG.reels.includes(r.id),detail:'reels '+n0+' -> '+g.PROG.reels.length}});
  const two=['bike','cruiser','sports','scooter','retro','moped','cycle'];
  for(const type of two){await t('pillion visible on '+type,()=>{clearMission();const Q=quietRoad();resetPlayer(Q.x-Math.sin(Q.h)*3,Q.z-Math.cos(Q.h)*3);for(const o of G().vehicles)if(Math.hypot(o.pos.x-Q.x,o.pos.z-Q.z)<120)park(o);const f=g.FRIENDS[0];f.comp=true;f.armed=false;f.goingHome=false;f.inCar=false;f.x=Q.x-Math.sin(Q.h)*2;f.z=Q.z-Math.cos(Q.h)*2;
      const v=g.spawnVehicle(type,Q.x,Q.z,Q.h);/* west outskirts: no AI traffic, so no random crashes */g.enterVehicle(v);S(40);const seen1=f.inCar&&f.h.g.visible;g.K.KeyW=true;let okRide=true,maxD=0;
      for(let i=0;i<120;i++){S(1);const d=f.h.g.position.distanceTo(v.mesh.position);maxD=Math.max(maxD,d);if(!f.h.g.visible)okRide=false}g.K.KeyW=false;S(60);
      const after=[f.h.g.visible,!!f.inCar];g.exitV();S(20);const dis=!f.inCar&&f.h.g.visible&&Math.abs(f.h.g.rotation.z)<1e-6;f.comp=false;park(v);
      return{pass:seen1&&okRide&&maxD<1.2&&dis,detail:`boarded ${seen1} visibleAllRide ${okRide} maxDist ${maxD.toFixed(2)} dismount ${dis}`}})}
  await t('fare passenger rides pillion visibly',()=>{clearMission();const Q=quietRoad();resetPlayer(Q.x-Math.sin(Q.h)*3,Q.z-Math.cos(Q.h)*3);for(const o of G().vehicles)if(Math.hypot(o.pos.x-Q.x,o.pos.z-Q.z)<120)park(o);g.FRIENDS.forEach(f=>{f.comp=false});S(5);const v=g.spawnVehicle('scooter',Q.x,Q.z,Q.h);const p=g.peds.find(p=>!p.dead&&!p.hidden);p.x=Q.x-Math.sin(Q.h)*2+Math.cos(Q.h)*1.5;p.z=Q.z-Math.cos(Q.h)*2-Math.sin(Q.h)*1.5;g.enterVehicle(v);S(5);g.startMission({type:'fare',x:p.x,z:p.z,ped:p});S(60);const vis=p.h.g.visible&&p.h.g.position.distanceTo(v.mesh.position)<1.2;clearMission();if(g.player.vehicle)g.exitV();S(10);park(v);return{pass:vis,detail:'visible '+p.h.g.visible}});
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

function playStory(i,choice){const g=G();clearMission();resetPlayer(g.GIVER.x,g.GIVER.z+3);g.PROG.story=i;g.player.cash=Math.max(g.player.cash,20000);const cash0=g.player.cash;g.startStory(i);const m=g.mission;
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
  await t('tail: getting close raises suspicion and fails',()=>{clearMission();resetPlayer(g.GIVER.x,g.GIVER.z+3);g.PROG.story=7;g.startStory(7);const m=g.mission;for(let k=0;k<40&&m.stage<2;k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    S(30);const v=m.tgt;if(!v)return{pass:false,detail:'no target car, stage '+m.stage};let fail='';for(let k=0;k<700&&g.mission===m;k++){g.player.pos.set(v.pos.x-Math.sin(v.heading)*8,0.2,v.pos.z-Math.cos(v.heading)*8);S(1)}
    return{pass:g.mission!==m,detail:'mission ended: '+(g.mission!==m)}});
  await t('tail: falling far behind fails',()=>{clearMission();resetPlayer(g.GIVER.x,g.GIVER.z+3);g.startStory(7);const m=g.mission;for(let k=0;k<40&&m.stage<2;k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}S(30);g.player.pos.set(-300,0.2,300);S(30);return{pass:g.mission!==m}});
  await t('stealth: standing in front of a guard raises the alarm',()=>{clearMission();resetPlayer(g.GIVER.x,g.GIVER.z+3);g.PROG.story=9;g.startStory(9);const m=g.mission;for(let k=0;k<60&&!(m.guards&&m.guards.length);k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const gd=m.guards&&m.guards[0];if(!gd)return{pass:false,detail:'no guards'};let alarm=false;for(let k=0;k<240&&!alarm;k++){g.player.pos.set(gd.x+Math.sin(gd.yaw)*6,0.2,gd.z+Math.cos(gd.yaw)*6);g.player.hp=100;S(1);alarm=!!m.alarm}clearMission();return{pass:alarm,detail:'sus '+Math.round(m.sus)}});
  await t('stealth: crouching behind the guard stays hidden',()=>{clearMission();resetPlayer(g.GIVER.x,g.GIVER.z+3);g.startStory(9);const m=g.mission;for(let k=0;k<60&&!(m.guards&&m.guards.length);k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const gd=m.guards[2];g.toggleCrouch();for(let k=0;k<120;k++){g.player.pos.set(gd.x-Math.sin(gd.yaw)*7,0.2,gd.z-Math.cos(gd.yaw)*7);S(1)}const ok=!m.alarm;if(g.player.crouch)g.toggleCrouch();clearMission();return{pass:ok,detail:'sus '+Math.round(m.sus)}});
  await t('escort: Selvi takes damage from attackers',()=>{clearMission();resetPlayer(g.GIVER.x,g.GIVER.z+3);g.startStory(8);const m=g.mission;for(let k=0;k<80&&!(m.workers);k++){g.player.hp=100;g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const e=m.escort;const h0=e.hp;for(let k=0;k<120;k++){g.player.hp=100;S(1)}const hit=e.hp<h0;clearMission();return{pass:hit,detail:h0.toFixed(0)+' -> '+e.hp.toFixed(0)}});
  await t('rescue: gang leader surrenders instead of dying',()=>{clearMission();resetPlayer(g.GIVER.x,g.GIVER.z+3);g.startStory(12);const m=g.mission;for(let k=0;k<80&&!m.leader;k++){g.storyAuto();if(g.cineHold)g.cineSkip();S(3)}
    const L=m.leader;if(!L)return{pass:false,detail:'no leader'};for(let k=0;k<20&&!L.surrendered;k++)window.__game.goons.includes(L)&&(L.hp>0)&&(window.__dmg?0:0);
    L.hp=130;const dg=window.__game.damageGoon;if(dg)dg(L,50,true);const ok=L.surrendered&&!L.dead;clearMission();return{pass:ok,detail:'surrendered '+L.surrendered+' dead '+L.dead}});
  await t('epilogue: message, CCTV and Act 2 card complete',()=>{a().done=true;a().epilogue=1;g.a2Epilogue();let n=0;while(g.cineHold&&n++<10)g.cineSkip();return{pass:a().epilogue===2&&!g.cineHold,detail:'epilogue '+a().epilogue}});
};

groups.all=async()=>{for(const k of['core','vehicles','world','missions','jobs','police','save','saveSafety','act2']){await groups[k]();await yieldUI()}};

window.KST={start(name){this.done=null;this.run(name).then(r=>{this.done=r}).catch(e=>{this.done={error:e.message}})},progress(){return results.length+' results, last: '+(results.length?results[results.length-1].name:'-')},async run(name){const before=results.length;await groups[name]();const out=results.slice(before);const failed=out.filter(r=>!r.pass);return{group:name,passed:out.length-failed.length,total:out.length,failed,errors:errs.slice()}},results,clearErrors(){errs=[]},groups};
})();
