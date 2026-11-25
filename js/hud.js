/* Kovai Streets: hud.js
 * HUD, minimap, city map, toasts, tutorial
 * Classic script, loaded in order by index.html (12 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= HUD & maps ================= */
const mm=$('minimap'),mctx=mm.getContext('2d');const MS=180/320;let offMap=null;
let MX0=-1180-GX,MX1=1020+GX,MZ0=-570-GX,MZ1=570+GX,OMS=MS;/* map bounds and the minimap image's pixels per metre (geoworld.js changes them) */
function mapIcons(){const a=geoIcons();a.push({x:HOSP.x,z:HOSP.z,img:ICON.hosp,edge:true},{x:SHOP.x,z:SHOP.z,img:ICON.gun,edge:true});for(const f of FRIENDS)if(!f.comp&&!f.goingHome)a.push({x:f.home.x,z:f.home.z,img:ICON.heart,edge:true});extraIcons(a);return a}
function drawMinimap(){const P=playerP();const c=mctx;c.save();c.clearRect(0,0,180,180);c.beginPath();c.arc(90,90,90,0,Math.PI*2);c.clip();c.fillStyle='#8f9a66';c.fillRect(0,0,180,180);
  const th=camYaw+Math.PI,cs=Math.cos(th),sn=Math.sin(th);
  if(offMap){c.save();c.translate(90,90);c.rotate(th);c.drawImage(offMap,-(P.x-MX0)*MS,-(P.z-MZ0)*MS,offMap.width*MS/OMS,offMap.height*MS/OMS);c.restore()}
  const pt=(x,z)=>{const dx=(x-P.x)*MS,dz=(z-P.z)*MS;return[dx*cs-dz*sn,dx*sn+dz*cs]};
  drawRoute(c,(x,z)=>{const[a,b]=pt(x,z);return[90+a,90+b]});/* GPS route (real-geography mode) */
  const dot=(x,z,col,r)=>{const[a,b]=pt(x,z);if(a*a+b*b>88*88)return;c.fillStyle=col;c.beginPath();c.arc(90+a,90+b,r,0,7);c.fill()};
  const edgeP=(x,z,lim)=>{let[a,b]=pt(x,z);const l=Math.hypot(a,b);if(l>lim){a*=lim/l;b*=lim/l}return[90+a,90+b]};
  for(const g of goons)if(!g.dead)dot(g.x,g.z,g.boss?'#c86bfa':'#ff3b3b',g.boss?4.5:3);
  const fl=Math.floor(time*5)%2;for(const v of vehicles)if(v.policeAI&&!v.policeAI.leaving)dot(v.pos.x,v.pos.z,fl?'#2a5cff':'#ff2a2a',4);
  for(const p of pickups)dot(p.x,p.z,p.kind==='cash'?'#38d27a':'#7fb8ff',2.5);
  for(const f of FRIENDS)if(f.comp&&!f.inCar)dot(f.x,f.z,'#ff7eb6',3.5);
  for(const ic of mapIcons()){if(!ic.edge){const[a,b]=pt(ic.x,ic.z);if(a*a+b*b>80*80)continue}const[x,y]=edgeP(ic.x,ic.z,76);c.drawImage(ic.img,x-8,y-8,16,16)}
  if(!mission)for(const o of offers){const[x,y]=edgeP(o.x,o.z,76);c.fillStyle=JOBT[o.type].c;c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.arc(x,y,8,0,7);c.fill();c.stroke();
    c.fillStyle='#111';c.font='bold 12px Rajdhani,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(JOBT[o.type].L,x,y+0.5)}
  if(mission&&marker.visible){const[x,y]=edgeP(marker.position.x,marker.position.z,78);c.fillStyle='#ffd23f';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.arc(x,y,6,0,7);c.fill();c.stroke()}
  {const[a,b]=pt(P.x,P.z-1000);const l=Math.hypot(a,b)||1;c.font='bold 13px Rajdhani,sans-serif';c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText('N',90+a/l*80,90+b/l*80)}
  c.restore();
  c.save();c.translate(90,90);const ry=player.vehicle?angDiff(camYaw,player.vehicle.heading):angDiff(camYaw,player.yaw);c.rotate(-ry);
  c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-8);c.lineTo(6,6);c.lineTo(0,3);c.lineTo(-6,6);c.closePath();c.fill();c.stroke();c.restore()}
let bigMapOpen=false;
/* R3: the city map in the concept map's style: map image, route, landmark badges, district name boxes, jobs, story marker, GPS pin, player;
   legend, north arrow, scale bar and title. Click the map to set a GPS destination (geonav.js geoMapClick uses the same frame). */
function bigMapFrame(){const cv=$('bigmapC'),W=cv.width,H=cv.height,k=Math.min(W/(MX1-MX0),H/(MZ1-MZ0));return{cv,W,H,k,ox:(W-(MX1-MX0)*k)/2,oy:(H-(MZ1-MZ0)*k)/2}}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function mapBadge(c,x,y,glyph,bg,s){s=s||22;c.save();c.fillStyle=bg;c.strokeStyle='#fff';c.lineWidth=2;rrect(c,x-s/2,y-s/2,s,s,5);c.fill();c.stroke();
  c.font=Math.round(s*0.62)+'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(glyph,x,y+1);c.restore()}
function mapLabel(c,x,y,t,size){size=size||14;c.save();c.font='700 '+size+'px Rajdhani,sans-serif';const w=c.measureText(t).width+14,h=size+8;c.fillStyle='rgba(14,17,19,.85)';rrect(c,x-w/2,y-h/2,w,h,4);c.fill();
  c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(t,x,y+1);c.restore()}
const MAP_BADGE={halt:['🚉','#1d4ed8',''],terminus:['🚌','#1d4ed8','EAST JUNCTION BUS TERMINUS'],station:['🚆','#1d4ed8','KOVAI CENTRAL'],viewpoint:['🔭','#222','SILVER HILL VIEWPOINT'],stadium:['🏆','#8a6d00','KOVAI MUNICIPAL CRICKET STADIUM'],gopuram:['🛕','#b45309',''],church:['⛪','#6b21a8',''],mosque:['🕌','#15803d','']};
const MAP_LEGEND=[['★','#d4a017','Story mission'],['J','#2a9d8f','Job (side activity)'],['🚆','#1d4ed8','Railway station'],['═','#1e1e1e','Railway line'],['✚','#d62828','Hospital'],['🛡','#1d4ed8','Police station'],['🚒','#c1121f','Fire station'],
  ['⛽','#f77f00','Petrol bunk'],['🔭','#222','Viewpoint'],['🏆','#8a6d00','Sports'],['🌳','#2b9348','Park'],['📍','#e63946','GPS destination']];
function drawBigMap(){if(!offMap)return;const F=bigMapFrame(),c=F.cv.getContext('2d'),W=F.W,H=F.H,k=F.k,ox=F.ox,oy=F.oy,X=v=>ox+(v-MX0)*k,Z=v=>oy+(v-MZ0)*k;
  c.fillStyle='#1c2b17';c.fillRect(0,0,W,H);c.drawImage(offMap,ox,oy,(MX1-MX0)*k,(MZ1-MZ0)*k);
  drawRoute(c,(x,z)=>[X(x),Z(z)],true);
  for(const L of GEO_LANDMARKS){const b=MAP_BADGE[L.model];if(!b)continue;mapBadge(c,X(L.x),Z(L.z),b[0],b[1]);if(b[2])mapLabel(c,X(L.x),Z(L.z)+24,b[2],11)}
  const lake=GEO_LANDMARKS.find(l=>l.id==='silver_lake');if(lake){mapBadge(c,X(lake.x)-52,Z(lake.z),'🌳','#2b9348',20);mapLabel(c,X(lake.x)+12,Z(lake.z),'SILVER LAKE',13)}
  for(const d of DISTRICTS)if(d.n!=='Town Hall')mapLabel(c,X(d.x),Z(d.z),d.n.toUpperCase(),15);
  for(const ic of mapIcons()){if(!ic.edge&&!ic.near)continue;c.drawImage(ic.img,X(ic.x)-10,Z(ic.z)-10,20,20)}
  c.textAlign='center';c.textBaseline='middle';
  if(!mission)for(const o of offers){c.fillStyle=JOBT[o.type].c;c.strokeStyle='#000';c.lineWidth=2;c.beginPath();c.arc(X(o.x),Z(o.z),8,0,7);c.fill();c.stroke();c.fillStyle='#111';c.font='bold 12px Rajdhani,sans-serif';c.fillText(JOBT[o.type].L,X(o.x),Z(o.z)+1)}
  if(mission&&marker.visible){c.fillStyle='#ffd23f';c.strokeStyle='#000';c.font='bold 22px sans-serif';c.lineWidth=3;c.strokeText('★',X(marker.position.x),Z(marker.position.z));c.fillText('★',X(marker.position.x),Z(marker.position.z))}
  if(GPS.manual){const x=X(GPS.manual.x),y=Z(GPS.manual.z);c.save();c.fillStyle='#e63946';c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-10,y-12,x-9,y-24,x,y-24);c.bezierCurveTo(x+9,y-24,x+10,y-12,x,y);c.fill();c.stroke();
    c.fillStyle='#fff';c.beginPath();c.arc(x,y-16,3.5,0,7);c.fill();c.restore()}
  c.save();const lw=190,lh=34+MAP_LEGEND.length*24;c.fillStyle='rgba(12,15,17,.88)';rrect(c,14,14,lw,lh,10);c.fill();c.fillStyle='#fff';c.font='700 18px Rajdhani,sans-serif';c.textAlign='left';c.textBaseline='middle';c.fillText('LEGEND',28,34);
  MAP_LEGEND.forEach((e,i)=>{const y=58+i*24;mapBadge(c,38,y,e[0],e[1],18);c.fillStyle='#fff';c.font='600 14px Rajdhani,sans-serif';c.textAlign='left';c.textBaseline='middle';c.fillText(e[2],56,y+1)});c.restore();
  c.save();c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.moveTo(W-40,26);c.lineTo(W-26,68);c.lineTo(W-40,58);c.lineTo(W-54,68);c.closePath();c.fill();c.stroke();
  c.font='700 18px Rajdhani,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('N',W-40,14);
  const sx=W/2-750*k,sy=H-30;c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+1500*k,sy);c.stroke();c.font='600 13px Rajdhani,sans-serif';
  for(const m of[0,500,1000,1500]){c.beginPath();c.moveTo(sx+m*k,sy-6);c.lineTo(sx+m*k,sy+6);c.stroke();c.fillText(m?(m/1000).toFixed(1)+(m===1500?' km':''):'0',sx+m*k,sy-16)}
  c.textAlign='left';c.textBaseline='alphabetic';c.font='italic 900 44px Rajdhani,sans-serif';c.lineWidth=5;c.strokeStyle='#000';c.strokeText('KOVAI',22,H-76);c.fillText('KOVAI',22,H-76);c.fillStyle='#f5b700';c.strokeText('STREETS',22,H-34);c.fillText('STREETS',22,H-34);
  c.fillStyle='#fff';c.font='600 13px Rajdhani,sans-serif';c.fillText('EXPLORE · DRIVE · LIVE',26,H-12);c.textAlign='right';c.fillText('KOVAI · TAMIL NADU · INDIA',W-18,H-12);c.restore();
  const P=playerP(),yaw=player.vehicle?player.vehicle.heading:player.yaw;c.save();c.translate(X(P.x),Z(P.z));c.rotate(-yaw+Math.PI);c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=2;c.beginPath();c.moveTo(0,-9);c.lineTo(7,7);c.lineTo(0,3);c.lineTo(-7,7);c.closePath();c.fill();c.stroke();c.restore()}
let areaT=0,toastT=0,floatT=0;
function toast(big,small,dur){const el=$('toast');el.innerHTML=esc(big)+(small?'<small>'+esc(small)+'</small>':'');el.style.opacity=1;toastT=dur||2.5}
function floatMsg(s){const el=$('hint');floatT=1.6;el.textContent=s}
const hud={cash:$('cash'),stars:$('stars'),rep:$('rep'),cheat:$('cheatTag'),mission:$('mission'),hp:$('hpfill'),arw:$('arwrap'),ar:$('arfill'),vhpw:$('vhpwrap'),vhp:$('vhpfill'),wstrip:$('wstrip'),weapon:$('weapon'),ammo:$('ammo'),speed:$('speed'),area:$('area'),hint:$('hint'),cross:$('cross')};
let lastMissionHTML='';const setTxt=(el,s)=>{if(el._t!==s){el._t=s;el.textContent=s}},setHTML=(el,s)=>{if(el._h!==s){el._h=s;el.innerHTML=s}};
function updateHUD(dt){setTxt(hud.cash,'₹'+Math.max(0,Math.floor(player.cash)).toLocaleString('en-IN'));
  let s='';for(let i=0;i<5;i++)s+=`<span class="${i<wanted?'on':''}">★</span>`;setHTML(hud.stars,s);
  setTxt(hud.rep,'RESPECT LV '+(1+Math.floor(rep/3))+'  ·  JOBS '+rep);setTxt(hud.cheat,cheatIron?'IRON BODY ON':'');
  hud.hp.style.width=clamp(player.hp,0,100)+'%';hud.arw.classList.toggle('hidden',player.armor<=0);hud.ar.style.width=clamp(player.armor,0,100)+'%';
  const v=player.vehicle;
  if(v){hud.vhpw.classList.remove('hidden');hud.vhp.style.width=clamp(v.hp/v.s.hp*100,0,100)+'%';setTxt(hud.weapon,v.s.name.toUpperCase());setTxt(hud.ammo,v.type==='tank'?(player.tankCD>0?'LOADING':'CANNON READY'):'');setHTML(hud.wstrip,'');
    setHTML(hud.speed,Math.round(Math.abs(v.speed)*3.6)+'<small>KM/H</small>');hud.cross.style.display=v.type==='tank'?'':'none'}
  else{hud.vhpw.classList.add('hidden');const w=WEAPONS[player.weapon];setTxt(hud.weapon,w.name);const r=player.res[player.weapon];
    setTxt(hud.ammo,w.melee?(w.id==='fists'?'COMBO x'+(combo+1):'MELEE'):player.reloading>0?'RELOADING':w.thrown?String(player.mags[player.weapon]+player.res[player.weapon]):player.mags[player.weapon]+' / '+(r===Infinity?'∞':r));setHTML(hud.speed,'');hud.cross.style.display=player.dead||scoped()?'none':'';
    setHTML(hud.wstrip,'<span class="own" style="font-size:14px;letter-spacing:1.5px">SCROLL · TAB · Q = WEAPON WHEEL</span>')}
  areaT-=dt;if(areaT<=0){areaT=0.4;const P=playerP();const rn=roadName(P.x,P.z);setTxt(hud.area,(rn?rn+' · ':'')+district(P.x,P.z)+gpsText());setTxt($('clock'),clockText())}
  let mh='';if(mission){const st=mission.steps[mission.step];let txt=mission.txt?mission.txt:st?st.txt:mission.type==='gang'?`Goons left: ${mission.left}`:mission.type==='boss'?`Kill ${mission.bossName} (white shirt). Guards: ${Math.max(0,mission.left-(mission.boss.dead?0:1))}`:mission.type==='chase'?'Wreck the black getaway car!':'';
    mh=`<div class="mT">${esc(mission.title)}${mission.reward?' · ₹'+mission.reward.toLocaleString('en-IN'):''}</div><div class="mX">${esc(txt)}</div>`;
    for(const mt of(mission.meters||[]).concat([mission.searchMeter,mission.detMeter,mission.escortMeter])){if(!mt)continue;mh+=`<div class="mM"><span>${esc(mt.label)}</span><div class="mB"><div style="width:${Math.round(clamp(mt.v,0,1)*50)*2}%;background:${mt.col}"></div></div></div>`}
    if(mission.timer!=null){const t=Math.max(0,Math.ceil(mission.timer));mh+=`<div class="mC ${t<=10?'low':''}">${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}</div>`}}
  if(mh!==lastMissionHTML){hud.mission.innerHTML=mh;lastMissionHTML=mh}
  if(floatT>0){floatT-=dt;if(floatT<=0)setTxt(hud.hint,'')}
  else{let h='';if(!player.dead&&!player.vehicle&&!talk&&!shopOpen){const nv=nearestVehicle();const nt=nearestTalkable();
      const kT=isTouch?'Tap TALK':'Press T',kE=isTouch?'Tap CAR':'Press E';if(nt&&nt.kind==='friend')h=`${kT} to talk to ${nt.obj.name}`;else if(nt&&nt.kind==='stall')h=`${kT} for tea & snacks`;else if(nt&&nt.hint)h=`${kT} ${nt.hint}`;else if(player.swim)h='Swimming · head for the shore';else if(nv)h=`${kE} to ${nv.policeAI?'steal the':'drive the'} ${nv.s.name}`;else if(nt)h=`${kT} to talk`;
      else if(Math.hypot(player.pos.x-HOSP.x,player.pos.z-HOSP.z)<3.6&&player.hp<100)h='Healing…'}
    if(!h&&player.crouch&&!player.vehicle&&!player.dead)h=player.inCover?'In cover · enemies struggle to hit you':'Crouching · get beside a wall or car for cover';setTxt(hud.hint,h)}
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0}
  if(vigT>0){vigT-=dt;if(vigT<=0)$('vig').style.opacity=player.hp<30?0.45:0}
  if(hitT>0){hitT-=dt;if(hitT<=0)hud.cross.classList.remove('hit')}
  if(talk){const o=talk.obj;const d=Math.hypot(o.x-player.pos.x,o.z-player.pos.z);if(d>5||player.vehicle||(talk.kind==='ped'&&(o.dead||o.hidden)))closeTalk()}
  if(bigMapOpen)drawBigMap()}


/* ---------- tutorial ---------- */
const TUT=[{k:'Use W A S D to walk around',t:'Use the left stick to walk',done:s=>s.walk>8},
  {k:'Move the mouse to look around',t:'Swipe the right side of the screen to look around',done:s=>s.look>1.2},
  {k:'Walk to the red car and press E to get in',t:'Walk to the red car and tap CAR',done:()=>!!player.vehicle},
  {k:'Hold W to drive, A / D to steer, Space to drift',t:'Push the stick up to drive and sideways to steer',done:()=>!!player.vehicle&&Math.abs(player.vehicle.speed)>12},
  {k:'Press M to open the city map (M again closes it)',t:'Tap MAP to open the city map (tap again to close)',done:s=>s.map&&!bigMapOpen},
  {k:'Coloured beams are jobs. Drive into one to earn cash and Respect',t:'Coloured beams are jobs. Drive into one',done:s=>!!mission||s.tt>25},
  {k:'For the story, visit Paramasivam Anna at the mills (gold S on the map)',t:'For the story, visit Paramasivam Anna (gold S on the map)',done:s=>s.tt>10}];
const tutS={walk:0,look:0,map:false,tt:0,lx:0,lz:0,ly:0,step:-1};
function updateTutorial(dt){const el=$('tut');if(PROG.tut>=TUT.length){setHTML(el,'');return}
  if(tutS.step!==PROG.tut){Object.assign(tutS,{step:PROG.tut,tt:0,walk:0,look:0,map:false,lx:player.pos.x,lz:player.pos.z,ly:camYaw})}
  tutS.tt+=dt;tutS.walk+=Math.hypot(player.pos.x-tutS.lx,player.pos.z-tutS.lz);tutS.lx=player.pos.x;tutS.lz=player.pos.z;tutS.look+=Math.abs(angDiff(tutS.ly,camYaw));tutS.ly=camYaw;if(bigMapOpen)tutS.map=true;
  const s=TUT[PROG.tut];if(tutS.tt>1&&s.done(tutS)){PROG.tut++;noise(0.08,3200,0.15,1);if(PROG.tut>=TUT.length){toast('TUTORIAL DONE','Have fun in Kovai!',2.5);queueSave()}return}
  setHTML(el,`${esc(isTouch?s.t:s.k)}<small>Tutorial ${PROG.tut+1}/${TUT.length} · skip it in the ${isTouch?'II':'Esc'} menu</small>`)}
