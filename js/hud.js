/* Kovai Streets: hud.js
 * HUD, minimap, city map, toasts, tutorial
 * Classic script, loaded in order by index.html (12 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= HUD & maps ================= */
const mm=$('minimap'),mctx=mm.getContext('2d');const MS=180/320;let offMap=null;
let MX0=-1180-GX,MX1=1020+GX,MZ0=-570-GX,MZ1=570+GX,OMS=MS;/* map bounds and the minimap image's pixels per metre (geoworld.js changes them) */
function buildMinimapBase(){if(REALMAP)return;/* geoworld.js draws its own map */const Wd=Math.ceil((MX1-MX0)*MS),Hd=Math.ceil((MZ1-MZ0)*MS);offMap=document.createElement('canvas');offMap.width=Wd;offMap.height=Hd;const o=offMap.getContext('2d');
  const X=v=>(v-MX0)*MS,Z=v=>(v-MZ0)*MS;o.fillStyle='#8f9a66';o.fillRect(0,0,Wd,Hd);
  for(let x=-1176-GX;x<-552-GX;x+=8)for(let z=MZ0;z<MZ1;z+=8){const h=terrainH(x,z),t=clamp(h/170,0,1);o.fillStyle=`rgb(${(110-60*t)|0},${(140-50*t)|0},${(80-30*t)|0})`;o.fillRect(X(x),Z(z),8*MS+0.6,8*MS+0.6)}
  o.fillStyle='#e3cf9a';o.fillRect(X(598+GX),0,(SHORE-598-GX)*MS,Hd);const sg=o.createLinearGradient(X(SHORE),0,X(MX1),0);sg.addColorStop(0,'#5aa6c8');sg.addColorStop(1,'#245f8a');o.fillStyle=sg;o.fillRect(X(SHORE),0,(MX1-SHORE)*MS,Hd);
  o.fillStyle='#7a756c';o.beginPath();o.arc(X(700+GX),Z(-420),30*MS,0,7);o.fill();
  const BCOL={station:'#bdb5a3',airport:'#8c8c88',mall:'#9fc6d9',market:'#e3b67a',college:'#c98b6b',stadium:'#6fae5a',city:'#d3cab2',lake:'#4f93c4',race:'#7fae5a',park:'#7fae5a',temple:'#e2bf86',busstand:'#b4b4b4',mill:'#bba88a',hospital:'#f4f4f4',tower:'#a9c8de',townhall:'#e6d6b0'};
  for(let i=-5;i<15;i++)for(let j=-5;j<15;j++){const t=blockType[i+','+j]||'city';o.fillStyle=BCOL[t];o.fillRect(X(BC(i)-30),Z(BC(j)-30),60*MS,60*MS)}
  o.fillStyle='#55565c';for(let k=-NB;k<=NB;k++){const ext=k===0?BOUND:LIM+HR;o.fillRect(X(-ext),Z(k*CELL-HR),2*ext*MS,2*HR*MS);o.fillRect(X(k*CELL-HR),Z(-ext),2*HR*MS,2*ext*MS)}
  o.fillRect(X(598+GX),Z(-540),14*MS,1080*MS);o.fillRect(X(BOUND),Z(-HR),46*MS,2*HR*MS);
  o.strokeStyle='#55565c';o.lineWidth=ROAD_W*MS;o.lineCap='round';for(const s of NEWSEGS){o.beginPath();o.moveTo(X(s.a[0]),Z(s.a[1]));o.lineTo(X(s.b[0]),Z(s.b[1]));o.stroke()}/* D4 drawn roads */
  o.strokeStyle='#55565c';o.lineWidth=9*MS;o.lineJoin='round';o.beginPath();GHAT.forEach((p,i)=>i?o.lineTo(X(p.x),Z(p.z)):o.moveTo(X(p.x),Z(p.z)));o.stroke();
  o.fillStyle='#6d655a';o.fillRect(X(-BOUND),Z(TRACKZ-2.5),2*BOUND*MS,5*MS);o.fillStyle='#a64b2a';o.fillRect(X(70),Z(380+GX),80*MS,14*MS);o.fillStyle='#bdb5a3';o.fillRect(X(50),Z(394.2+GX),120*MS,7.4*MS);
  o.fillStyle='#9a9a96';o.fillRect(X(FLY.xa),Z(-FLY.hw),(FLY.xb-FLY.xa)*MS,FLY.hw*2*MS);o.fillStyle='#cfc6b2';o.fillRect(X(STATUE.x-22),Z(STATUE.z-22),44*MS,44*MS);o.fillRect(X(STATUE.x-2),Z(STATUE.z),4*MS,190*MS);
  o.fillStyle='#262a2f';o.fillRect(X(STATUE.x-6),Z(STATUE.z-8),12*MS,10*MS);o.fillStyle='#8b6b4a';o.fillRect(X(648+GX),Z(197.5),132*MS,5*MS)}
function mapIcons(){if(REALMAP)return geoIcons();const a=[{x:HOSP.x,z:HOSP.z,img:ICON.hosp,edge:true},{x:SHOP.x,z:SHOP.z,img:ICON.gun,edge:true}];
  for(const f of FRIENDS)if(!f.comp&&!f.goingHome)a.push({x:f.home.x,z:f.home.z,img:ICON.heart,edge:true});for(const st of STALLS)a.push({x:st.cx,z:st.cz,img:ICON.tea,edge:false});extraIcons(a);return a}
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
function drawBigMap(){const cv=$('bigmapC'),c=cv.getContext('2d'),S=cv.width,k=S/(MX1-MX0),Hh=(MZ1-MZ0)*k,oy=(S-Hh)/2,X=v=>(v-MX0)*k,Z=v=>oy+(v-MZ0)*k;
  c.fillStyle='#0b0f14';c.fillRect(0,0,S,S);c.drawImage(offMap,0,oy,S,Hh);c.textAlign='center';c.textBaseline='middle';c.font='600 11px Rajdhani,sans-serif';
  for(const d of DISTRICTS){if(d.x<MX0||d.x>MX1||d.z<MZ0||d.z>MZ1)continue;c.fillStyle='rgba(0,0,0,.6)';c.fillText(d.n.toUpperCase(),X(d.x),Z(d.z)-10)}
  drawRoute(c,(x,z)=>[X(x),Z(z)],true);
  for(const ic of mapIcons()){if(!ic.edge&&!ic.near)continue;c.drawImage(ic.img,X(ic.x)-8,Z(ic.z)-8,16,16)}
  if(!mission)for(const o of offers){c.fillStyle=JOBT[o.type].c;c.strokeStyle='#000';c.lineWidth=2;c.beginPath();c.arc(X(o.x),Z(o.z),8,0,7);c.fill();c.stroke();c.fillStyle='#111';c.font='bold 12px Rajdhani,sans-serif';c.fillText(JOBT[o.type].L,X(o.x),Z(o.z)+1)}
  if(mission&&marker.visible){c.fillStyle='#ffd23f';c.beginPath();c.arc(X(marker.position.x),Z(marker.position.z),7,0,7);c.fill();c.stroke()}
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
