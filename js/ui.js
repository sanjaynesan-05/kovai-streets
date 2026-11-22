/* Kovai Streets: ui.js
 * Loading tips, pause menu progress and settings, extra map icons
 * Classic script, loaded in order by index.html (16 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

const TIPS=['Coloured beams are jobs. Finishing jobs raises your Respect.','Respect unlocks better guns, new job types, the Western Ghats and the coast.','Buy the house on Perur Road (west of the city) to get a safehouse and a garage.','Cars parked inside your garage are kept when you save.','Hold right click to lock on to the nearest enemy.','Press C to crouch. Crouch next to a wall or car to take cover.','20 old film reels are hidden around Kovai. Each one pays ₹250.','Hit the yellow ramps fast for stunt jumps.','Walk into a skull icon to start a rampage.','Tea stalls heal you cheaply. Bun butter jam = full health.','Paramasivam Anna (gold S on the map) has the story missions.','At 4 stars the police send a helicopter. Rockets bring it down fast.','Press N in a vehicle to change the radio station.','The game saves itself every 30 seconds and when you pause.'];
{const el=$('tips');if(el)el.textContent='Tip: '+rpick(TIPS)}


/* ---------- icons, settings, pause ---------- */
function iconCanvas2(kind){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const circ=col=>{g.fillStyle=col;g.beginPath();g.arc(32,32,28,0,7);g.fill();g.lineWidth=4;g.strokeStyle='#fff';g.stroke()};
  if(kind==='story'){circ('#e8b923');g.fillStyle='#111';g.font='bold 38px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('S',32,34)}
  else if(kind==='house'){circ('#2b9348');g.fillStyle='#fff';g.beginPath();g.moveTo(13,33);g.lineTo(32,15);g.lineTo(51,33);g.fill();g.fillRect(20,32,24,17);g.fillStyle='#2b9348';g.fillRect(29,39,7,10)}
  else if(kind==='skull'){circ('#111');g.fillStyle='#fff';g.beginPath();g.arc(32,28,14,0,7);g.fill();g.fillRect(24,36,16,10);g.fillStyle='#111';g.beginPath();g.arc(26,28,4,0,7);g.arc(38,28,4,0,7);g.fill();g.fillRect(28,42,2,5);g.fillRect(34,42,2,5)}
  return c}
ICON.story=iconCanvas2('story');ICON.house=iconCanvas2('house');ICON.skull=iconCanvas2('skull');
function extraIcons(a){a.push({x:HOUSE.px,z:HOUSE.pz,img:ICON.house,edge:true});if(PROG.story<STORY.length)a.push({x:GIVER.x,z:GIVER.z,img:ICON.story,edge:true});
  if(!mission)for(const r of RAMPAGES)if((r.cd||0)<=0)a.push({x:r.x,z:r.z,img:ICON.skull,edge:false})}
function renderPause(){const el=$('progress');if(!el)return;
  el.innerHTML=[`Story <span>${PROG.story}/${STORY.length}</span>`,`Film reels <span>${PROG.reels.length}/${REELS.length}</span>`,`Stunt jumps <span>${PROG.jumps.length}/${RAMPS.length}</span>`,
    `Rampages <span>${PROG.ramp.length}/${RAMPAGES.length}</span>`,`Respect <span>LV ${respectLv()}</span>`,`Safehouse <span>${PROG.house?'Owned':'₹5,000'}</span>`].map(s=>`<div>${s}</div>`).join('');
  $('sSens').value=SET.sens;$('sVol').value=SET.vol;$('sRad').value=SET.radio;$('sInv').textContent=SET.inv?'ON':'OFF';$('sOutfitName').textContent=OUTFITS[PROG.outfit].n;$('sDel').textContent='Delete save'}
function onPause(){saveGame();renderPause();if(AC){const t=AC.currentTime;for(const g of[RADIO_G,engGain,engLfoG,sirGain,amb&&amb.city,amb&&amb.sea])if(g)g.gain.setTargetAtTime(0,t,0.05)}}
{const on=(id,ev,fn)=>{const el=$(id);if(el)el.addEventListener(ev,fn)};
  on('sSens','input',e=>{SET.sens=+e.target.value;saveSettings()});on('sVol','input',e=>{SET.vol=+e.target.value;saveSettings()});on('sRad','input',e=>{SET.radio=+e.target.value;saveSettings()});
  on('sInv','click',()=>{SET.inv=!SET.inv;saveSettings();renderPause()});on('sOutfit','click',()=>{if(player.human)setOutfit((PROG.outfit+1)%OUTFITS.length)});
  on('sTut','click',()=>{PROG.tut=0;tutS.step=-1;floatMsg('Tutorial restarted')});on('sTutSkip','click',()=>{PROG.tut=TUT.length;queueSave()});
  on('sSave','click',()=>{saveGame();$('sSave').textContent='Saved!';setTimeout(()=>$('sSave').textContent='Save now',1200)});
  on('sDel','click',()=>{const b=$('sDel');if(b.textContent!=='Click again to delete'){b.textContent='Click again to delete';return}deleteAllSaves();started=false;location.reload()});
  on('newBtn','click',()=>{newGameReset();location.reload()});
  for(const[id,fn]of[['bRadio',()=>radioNext()],['bCrouch',()=>toggleCrouch()]])on(id,'pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!started||paused)return;audioInit();fn()})}

/* The game is meant to be served over HTTP (local server or web host). Warn when it is opened as a file. */
if(location.protocol==='file:'){const n=document.createElement('div');n.id='runNote';n.className='runNote';
  n.innerHTML='You opened the game as a file. Some features need it to run through a local server: double-click <b>start-server.bat</b> in the game folder (see README).';
  const t=$('tips');if(t)t.after(n)}
