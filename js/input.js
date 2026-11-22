/* Kovai Streets: input.js
 * Keyboard, mouse, pointer lock, pause/resume, touch controls
 * Classic script, loaded in order by index.html (14 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

const K={};

/* ================= input ================= */
let mouseL=false,locked=false,lockWanted=false,paused=true,started=false,time=0;
addEventListener('keydown',e=>{if(consoleOpen)return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab','Enter'].includes(e.code))e.preventDefault();
  K[e.code]=true;if(e.repeat)return;if(!started||paused){if(started&&e.code==='KeyP')resume();return}
  const num=e.code.startsWith('Digit')?parseInt(e.code.slice(5))-1:-1;
  if(e.code==='Enter'||e.code==='NumpadEnter'||e.code==='Backquote'){openConsole();return}
  const slot=e.code==='Digit0'?9:e.code==='Minus'?10:e.code==='Equal'?11:num;
  if(wheelOpen&&e.code!=='Tab'&&e.code!=='KeyQ'){if(slot>=0&&slot<NW&&player.owned[slot]){wheelSel=slot;closeWheel(true)}else if(e.code==='Escape')closeWheel(false);return}
  if(talk){if(num>=0)chooseTalk(num);else if(e.code==='KeyT'||e.code==='Escape')closeTalk();return}
  if(shopOpen&&slot>=0&&slot<=9){buyItem(slot);return}
  if(e.code==='KeyE'||e.code==='KeyF')tryEnterExit();
  else if(e.code==='KeyT'){const t=nearestTalkable();if(t)openTalk(t)}
  else if(slot>=0&&slot<NW)setWeapon(slot);
  else if(e.code==='Tab'){openWheel('hold')}
  else if(e.code==='KeyQ'){if(!wheelOpen)openWheel('scroll');wheelStep(1)}
  else if(e.code==='KeyR')startReload();
  else if(e.code==='KeyC')toggleCrouch();
  else if(e.code==='KeyN')radioNext();
  else if(e.code==='KeyM'){bigMapOpen=!bigMapOpen;$('bigmap').classList.toggle('hidden',!bigMapOpen)}
  else if(e.code==='KeyH'){if(player.vehicle){horn(1);panic(player.vehicle.pos.x,player.vehicle.pos.z,25)}}
  else if(e.code==='KeyP'||(e.code==='Escape'&&!locked))pause()});
addEventListener('keyup',e=>{K[e.code]=false;if(e.code==='Tab'&&wheelOpen&&wheelMode==='hold')closeWheel(true)});
addEventListener('blur',()=>{for(const k in K)K[k]=false;mouseL=false;aiming=false});
canvas.addEventListener('mousedown',e=>{if(!started||paused||consoleOpen||isTouch)return;audioInit();if(!locked&&lockWanted!==false)requestLock();
  if(e.button===0){if(wheelOpen){closeWheel(true);return}mouseL=true;if(talk)return;if(player.vehicle)fire();else if(!WEAPONS[player.weapon].auto)fire()}if(e.button===2)aiming=!player.vehicle});
addEventListener('mouseup',e=>{if(e.button===0)mouseL=false;if(e.button===2)aiming=false});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('wheel',e=>{if(!started||paused||player.vehicle||talk||player.dead||isTouch)return;if(!wheelOpen)openWheel('scroll');wheelStep(e.deltaY>0?1:-1)},{passive:true});
addEventListener('mousemove',e=>{if(!started||paused||consoleOpen||isTouch)return;if(wheelOpen&&wheelMode==='hold'){wheelAim(e.movementX||0,e.movementY||0);return}if(!locked&&!e.buttons)return;const k=scoped()?0.22:aiming?0.7:1;const sx=e.movementX||0,sy=e.movementY||0;
  camYaw-=sx*0.0026*k*SET.sens;camPitch=clamp(camPitch-sy*0.0022*k*SET.sens*(SET.inv?-1:1),-1.15,0.75);lastMouseT=time});
function requestLock(){if(isTouch)return;try{const r=canvas.requestPointerLock();lockWanted=true;if(r&&r.catch)r.catch(()=>{lockWanted=false})}catch(e){lockWanted=false}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(!locked&&started&&!paused&&lockWanted&&!consoleOpen)pause()});
document.addEventListener('pointerlockerror',()=>{lockWanted=false});
function pause(){paused=true;onPause();mouseL=false;aiming=false;$('pause').classList.remove('hidden');if(document.pointerLockElement)try{document.exitPointerLock()}catch(e){}}
function resume(){$('pause').classList.add('hidden');paused=false;audioInit();requestLock();if(isTouch)goFull()}
$('resumeBtn').addEventListener('click',resume);
$('playBtn').addEventListener('click',()=>{$('start').classList.add('hidden');$('hud').classList.remove('hidden');started=true;paused=false;audioInit();requestLock();if(isTouch){document.body.classList.add('playing');$('touch').classList.remove('hidden');goFull()}
  toast('KOVAI STREETS',isTouch?'Tap CAR near the red car · coloured beams are jobs':'Grab the car next to you (E) · coloured beams are jobs',3.5)});
function lookKeys(dt){if(player.vehicle)return;const lx=(K.ArrowLeft?1:0)-(K.ArrowRight?1:0),ly=(K.ArrowUp?1:0)-(K.ArrowDown?1:0);if(lx||ly){camYaw+=lx*2.2*dt;camPitch=clamp(camPitch+ly*1.4*dt,-1.15,0.75);lastMouseT=time}}

/* ================= touch controls ================= */
const isTouch=(window.matchMedia&&matchMedia('(pointer: coarse)').matches)||('ontouchstart' in window&&navigator.maxTouchPoints>0);
const joy={on:false,x:0,y:0,id:null};
function goFull(){try{const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen){const r=el.requestFullscreen({navigationUI:'hide'});if(r&&r.then)r.then(()=>{try{const o=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape');if(o&&o.catch)o.catch(()=>{})}catch(e){}}).catch(()=>{})}}catch(e){}}
function setupTouch(){if(!isTouch)return;document.body.classList.add('touch');
  const jb=$('joy'),kn=$('knob');const R=56;
  const jmove=e=>{const r=jb.getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}
    joy.x=dx/R;joy.y=dy/R;kn.style.transform=`translate(${dx}px,${dy}px)`};
  jb.addEventListener('pointerdown',e=>{e.preventDefault();joy.on=true;joy.id=e.pointerId;try{jb.setPointerCapture(e.pointerId)}catch(_){}jmove(e)});
  jb.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)jmove(e)});
  const jend=e=>{if(e.pointerId!==joy.id)return;joy.on=false;joy.x=joy.y=0;joy.id=null;kn.style.transform=''};
  jb.addEventListener('pointerup',jend);jb.addEventListener('pointercancel',jend);
  // look: drag anywhere on the canvas
  const looks=new Map();
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;looks.set(e.pointerId,{x:e.clientX,y:e.clientY})});
  canvas.addEventListener('pointermove',e=>{const p=looks.get(e.pointerId);if(!p||!started||paused)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    const k=(scoped()?0.25:aiming?0.6:1)*0.0062*SET.sens;camYaw-=dx*k;camPitch=clamp(camPitch-dy*k*0.8*(SET.inv?-1:1),-1.15,0.75);lastMouseT=time});
  const lend=e=>looks.delete(e.pointerId);canvas.addEventListener('pointerup',lend);canvas.addEventListener('pointercancel',lend);
  const btn=(id,down,up)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!started||paused)return;audioInit();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add('on');down&&down()});
    const u=e=>{b.classList.remove('on');up&&up()};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u)};
  btn('bFire',()=>{mouseL=true;if(talk)return;if(player.vehicle)fire();else if(!WEAPONS[player.weapon].auto)fire()},()=>{mouseL=false});
  btn('bAim',()=>{if(!player.vehicle)aiming=!aiming});
  btn('bCar',()=>{tryEnterExit()});
  btn('bJump',()=>{K.Space=true},()=>{K.Space=false});
  btn('bGun',()=>{if(wheelOpen)closeWheel(false);else openWheel('tap')});
  btn('bTalk',()=>{if(talk){closeTalk();return}const t=nearestTalkable();if(t)openTalk(t);else floatMsg('Nobody close enough to talk to')});
  btn('bHorn',()=>{if(player.vehicle){horn(1);panic(player.vehicle.pos.x,player.vehicle.pos.z,25)}});
  btn('bMap',()=>{bigMapOpen=!bigMapOpen;$('bigmap').classList.toggle('hidden',!bigMapOpen)});
  btn('bCheat',()=>{openConsole()});
  btn('bPause',()=>{pause()});
  $('bigmap').addEventListener('pointerdown',()=>{bigMapOpen=false;$('bigmap').classList.add('hidden')});
  // lighter settings for phones
  
  document.addEventListener('gesturestart',e=>e.preventDefault());}
function touchHUD(){if(!isTouch)return;const inV=!!player.vehicle;
  $('bAim').style.display=inV?'none':'';$('bGun').style.display=inV?'none':'';$('bTalk').style.display=inV?'none':'';$('bHorn').style.display=inV?'':'none';
  $('bCar').textContent=inV?'EXIT':'CAR';$('bJump').textContent=inV?'BRAKE':'JUMP';$('bFire').style.display=inV&&player.vehicle.type!=='tank'?'none':'';
  $('bAim').classList.toggle('on',aiming)}
// tap options in talk / shop panels, tap cheats in pause menu
$('talk').addEventListener('click',e=>{const o=e.target.closest('[data-k]');if(o)chooseTalk(+o.dataset.k)});
$('shop').addEventListener('click',e=>{const o=e.target.closest('[data-k]');if(o)buyItem(+o.dataset.k)});
document.querySelectorAll('.cheats div').forEach(d=>d.addEventListener('click',()=>{const c=d.querySelector('b').textContent.trim();const fn=CHEATS[c];if(!fn||!started||player.dead)return;resume();const[a,b]=fn();toast('CHEAT ACTIVATED',a+' — '+b,2.6)}));
