/* Kovai Streets: menu.js
 * Cinematic main menu: a slow golden-hour camera over the real game city (the existing renderer and world, no screenshot),
 * a left-hand menu (Continue, New Game, Load Game, Settings, Controls, Credits, Exit) and a story-progress panel.
 * Uses the existing save system (progression.js) and settings store (SET). Keyboard, mouse and touch.
 * Classic script, loaded after ui.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const MENU={screen:'scrMain',ready:false,camT:0,savedTod:null,dlg:null};
const MENU_TOD=17.75;   // golden hour: the sun sets behind the Western Ghats
function menuIsOpen(){return!started&&!$('start').classList.contains('hidden')}
function menuSound(k){if(!AC||!OUT)return;if(k==='move')noise(0.025,3200,0.05,2);else tone(k==='back'?440:660,AC.currentTime,0.09,'triangle',0.04,OUT,0.005,2400)}

/* ---------- background: cinematic camera over the live city ---------- */
function menuCam(dt){if(MENU.savedTod===null)MENU.savedTod=tod;tod=MENU_TOD;MENU.camT+=dt;const t=MENU.camT*0.02;
  camera.position.set(340-Math.sin(t)*60,46+Math.sin(t*1.3)*4,170+Math.cos(t*0.8)*35);camera.lookAt(-140+Math.sin(t*0.7)*70,12,-40);
  if(Math.abs(camera.fov-60)>0.1){camera.fov=60;camera.updateProjectionMatrix()}}

/* ---------- screens, focus, dialog ---------- */
function showScreen(id){for(const s of document.querySelectorAll('.mn-screen'))s.classList.toggle('on',s.id===id);MENU.screen=id;$('start').classList.toggle('sub',id!=='scrMain');
  if(id==='scrLoad')renderSlots();if(id==='scrSettings')renderMenuSettings();focusFirst()}
function focusables(){const d=$('mnDialog');if(!d.classList.contains('hidden'))return[...d.querySelectorAll('button:not(.hidden)')];
  return[...$(MENU.screen).querySelectorAll('button:not([disabled]):not(.hidden),input')].filter(e=>e.offsetParent!==null)}
function focusFirst(){const f=focusables();if(f.length)f[0].focus({preventScroll:true})}
function menuDialog(title,body,ok,onOk,okOnly){MENU.dlg={onOk};$('dlgT').textContent=title;$('dlgB').textContent=body;$('dlgOk').textContent=ok||'OK';$('dlgNo').classList.toggle('hidden',!!okOnly);$('mnDialog').classList.remove('hidden');$('dlgOk').focus()}
function closeDialog(){$('mnDialog').classList.add('hidden');MENU.dlg=null;focusFirst()}
$('dlgOk').addEventListener('click',()=>{const d=MENU.dlg;closeDialog();if(d&&d.onOk)d.onOk()});
$('dlgNo').addEventListener('click',()=>{menuSound('back');closeDialog()});
function reloadAndStart(){try{sessionStorage.setItem('kovaiAutostart','1')}catch(e){}location.reload()}
function startFromMenu(){if(!MENU.ready)return;menuSound('ok');$('playBtn').click()}

/* ---------- actions ---------- */
const MENU_ACTIONS={
  continue(){if(!MENU.ready)return;if(!hasSave())return menuDialog('NO SAVED GAME YET','Start a new game to begin your story.','NEW GAME',()=>MENU_ACTIONS.new());startFromMenu()},
  new(){if(!MENU.ready)return;if(hasSave())menuDialog('START A NEW GAME?','Your current progress will be replaced. A copy is kept and can be restored from Load Game ("Before last New game").','START NEW GAME',()=>{newGameReset();reloadAndStart()});else startFromMenu()},
  load(){showScreen('scrLoad')},settings(){showScreen('scrSettings')},controls(){showScreen('scrControls')},credits(){showScreen('scrCredits')},
  exit(){menuDialog('EXIT KOVAI STREETS?','Your progress is saved automatically.','EXIT',()=>{try{window.close()}catch(e){}
    setTimeout(()=>menuDialog('CLOSE THE TAB TO EXIT','Browsers don\'t let a web page close its own tab. Your progress is saved, so you can simply close this tab or window.','OK',null,true),300)})}};
for(const b of document.querySelectorAll('#scrMain .mn-item')){b.addEventListener('click',()=>{audioInit();menuSound('ok');MENU_ACTIONS[b.dataset.act]()});
  b.addEventListener('mouseenter',()=>{if(document.activeElement!==b){b.focus({preventScroll:true});menuSound('move')}})}
for(const b of document.querySelectorAll('.mn-back'))b.addEventListener('click',()=>{menuSound('back');showScreen('scrMain')});

/* ---------- story panel & continue info (from the real save) ---------- */
function saveTime(){try{const o=JSON.parse(lsGet(SAVE_KEY)||'null');return o&&o.t?new Date(o.t):null}catch(e){return null}}
function storyLabel(st){const n=STORY.length;if(st>=n)return'Story complete';return(st<6?'Act 1':'Act 2')+' · Mission '+(st+1)+': '+STORY[st].title}
function renderStoryPanel(){const el=$('mnStory');el.classList.remove('hidden');
  if(!hasSave()){el.innerHTML=`<div class="k">NEW STORY</div><div class="t">ACT 1 · KOVAI'S MILLS</div><div class="s">Your journey begins in Gandhipuram</div>`;return}
  const st=PROG.story,n=STORY.length,pct=Math.round(st/n*100),act=st<6?'ACT 1 · KOVAI\'S MILLS':'ACT 2 · THREADS OF KOVAI';
  const next=st<n?'Next: '+STORY[st].title:(PROG.a2&&PROG.a2.done?'Act 2 complete. The Vault awaits…':'Story complete');
  el.innerHTML=`<div class="t">${act}</div><div class="s">${esc(next)}</div><div class="p"><span>STORY PROGRESS</span><b>${pct}%</b></div><div class="bar"><i style="width:${pct}%"></i></div><div class="s small">${st} of ${n} story missions · Respect LV ${respectLv()}</div>`}
function refreshMenu(){const saved=hasSave(),c=document.querySelector('[data-act="continue"]'),nw=document.querySelector('[data-act="new"]');
  c.classList.toggle('off',!saved);c.classList.toggle('primary',saved);nw.classList.toggle('primary',!saved);
  const when=saveTime();$('miContinueSub').textContent=saved?(when?'Last played '+when.toLocaleString([],{dateStyle:'medium',timeStyle:'short'}):'Resume your journey')+' · '+storyLabel(PROG.story):'No saved game yet';
  if(!saved)nw.parentNode.insertBefore(nw,c);renderStoryPanel();focusFirst()}

/* ---------- load game: the save system's real slots ---------- */
const MENU_SLOTS=[[()=>SAVE_KEY,'Current save'],[()=>SAVE_BAK,'Backup · previous autosave'],[()=>SAVE_PREV,'Before last New game']];
function renderSlots(){const L=$('slotList');let h='';
  MENU_SLOTS.forEach(([k,label],i)=>{const raw=lsGet(k()),r=raw?parseSave(raw):null;
    if(!r||!r.ok){h+=`<div class="mn-slot empty"><b>${label}</b><span>${raw?(r&&r.reason==='newer'?'Made by a newer version (not loaded)':'Unreadable (kept, not loaded)'):'Empty'}</span></div>`;return}
    let t=0;try{t=JSON.parse(raw).t||0}catch(e){}const d=r.data,pct=Math.round(d.prog.story/STORY.length*100);
    h+=`<button class="mn-slot" data-slot="${i}"><b>${label}</b><span>${esc(storyLabel(d.prog.story))} · ${pct}% story</span><span>₹${d.cash.toLocaleString('en-IN')} · Respect LV ${1+Math.floor(d.rep/3)}${t?' · saved '+new Date(t).toLocaleString([],{dateStyle:'medium',timeStyle:'short'}):''}</span></button>`});
  L.innerHTML=h;L.querySelectorAll('[data-slot]').forEach(b=>{b.addEventListener('click',()=>loadSlot(+b.dataset.slot));b.addEventListener('mouseenter',()=>b.focus({preventScroll:true}))})}
function loadSlot(i){menuSound('ok');if(i===0)return startFromMenu();const k=MENU_SLOTS[i][0](),raw=lsGet(k);
  menuDialog('LOAD THIS SAVE?','Your current save will be kept in the "Before last New game" slot, so nothing is lost.','LOAD',()=>{const cur=lsGet(SAVE_KEY);if(cur&&parseSave(cur).ok)lsSet(SAVE_PREV,cur);lsSet(SAVE_KEY,raw);reloadAndStart()})}

/* ---------- settings (the same SET store the game and pause menu use) ---------- */
function renderMenuSettings(){$('mVol').value=SET.vol;$('mRad').value=SET.radio;$('mSens').value=SET.sens;$('mInv').textContent=SET.inv?'ON':'OFF';
  $('mSubs').textContent=SET.subs==='en'?'ENGLISH ONLY':'TAMIL + ENGLISH';$('mFull').textContent=document.fullscreenElement?'FULLSCREEN':'WINDOWED';
  $('mFull').disabled=!document.documentElement.requestFullscreen}
$('mVol').addEventListener('input',e=>{SET.vol=+e.target.value;saveSettings()});$('mRad').addEventListener('input',e=>{SET.radio=+e.target.value;saveSettings()});
$('mSens').addEventListener('input',e=>{SET.sens=+e.target.value;saveSettings()});
$('mInv').addEventListener('click',()=>{SET.inv=!SET.inv;saveSettings();renderMenuSettings();menuSound('ok')});
$('mSubs').addEventListener('click',()=>{SET.subs=SET.subs==='en'?'both':'en';saveSettings();renderMenuSettings();menuSound('ok')});
$('mFull').addEventListener('click',()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen()}catch(e){}menuSound('ok')});
document.addEventListener('fullscreenchange',()=>{if(MENU.screen==='scrSettings')renderMenuSettings()});

/* ---------- keyboard: arrows move, Enter selects, Escape goes back ---------- */
addEventListener('keydown',e=>{if(!menuIsOpen())return;const f=focusables(),a=document.activeElement,i=f.indexOf(a);
  if(e.code==='ArrowDown'||e.code==='ArrowUp'){if(!f.length)return;e.preventDefault();const j=i<0?0:(i+(e.code==='ArrowDown'?1:-1)+f.length)%f.length;f[j].focus();menuSound('move')}
  else if((e.code==='Enter'||e.code==='NumpadEnter'||e.code==='Space')&&a&&a.tagName==='BUTTON'){e.preventDefault();a.click()}
  else if(e.code==='Escape'||e.code==='Backspace'&&a&&a.tagName!=='INPUT'){if(!$('mnDialog').classList.contains('hidden')){menuSound('back');closeDialog()}else if(MENU.screen!=='scrMain'){menuSound('back');showScreen('scrMain')}}});

/* ---------- layout: keep the menu just below the logo on any screen size ---------- */
function layoutMenu(){const b=document.querySelector('#start .mn-brand').getBoundingClientRect();document.documentElement.style.setProperty('--mn-top',Math.round(b.bottom+18)+'px')}
addEventListener('resize',layoutMenu);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layoutMenu);layoutMenu();

/* ---------- start-up, game start, return to menu ---------- */
$('playBtn').addEventListener('click',()=>{if(MENU.savedTod!==null){tod=MENU.savedTod;MENU.savedTod=null}showScreen('scrMain')});
$('pauseMenuBtn').addEventListener('click',()=>{saveGame();location.reload()});
(function waitReady(){if($('playBtn').classList.contains('hidden')){requestAnimationFrame(waitReady);return}MENU.ready=true;refreshMenu();
  let auto=false;try{auto=sessionStorage.getItem('kovaiAutostart')==='1';sessionStorage.removeItem('kovaiAutostart')}catch(e){}if(auto)startFromMenu()})();
