/* Kovai Streets: story2.js
 * Act 2, "Threads of Kovai" (story missions 7-14), its gameplay systems and the open ending.
 *   Systems: subtitles (line IDs ready for the future voice system), phone / CCTV / fade overlays, investigation search
 *   points, scripted driving, tailing suspicion, stealth guards with vision cones and alarms, escort health, choices.
 *   State: PROG.a2 (saved). Choices change free-roam police behaviour and the finale.
 * Classic script, loaded after progression.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ---------- persistent Act 2 state ---------- */
const A2_DEFAULT={inspector:'',kathir:'',selviTrust:0,evidence:0,insider:false,plate:false,workers:0,stealth:false,leader:'',vault:false,done:false,epilogue:0,strongCase:false};
PROG.a2=Object.assign({},A2_DEFAULT);
const A2=()=>PROG.a2;
function sanitizeA2(a){a=a&&typeof a==='object'?a:{};const s=v=>typeof v==='string'?v.slice(0,12):'',n=(v,hi)=>typeof v==='number'&&isFinite(v)?clamp(Math.floor(v),0,hi):0;
  return{inspector:['ally','coerced','neutral'].includes(a.inspector)?a.inspector:'',kathir:['forgiven','handed'].includes(a.kathir)?a.kathir:'',selviTrust:n(a.selviTrust,5),evidence:n(a.evidence,20),
    insider:!!a.insider,plate:!!a.plate,workers:n(a.workers,3),stealth:!!a.stealth,leader:['captured','killed','escaped'].includes(a.leader)?a.leader:s(''),vault:!!a.vault,done:!!a.done,epilogue:n(a.epilogue,2),strongCase:!!a.strongCase}}

/* ---------- dialogue lines (IDs are stable: the voice system will map recordings to them) ---------- */
const A2L=DIALOGUE;   /* all lines live in lines.js (Tamil primary, English secondary) */
const A2_AFTER=['after_1','after_2','after_3'];

/* ---------- subtitles ---------- */
let subQ=[],subCur=null,subT=0;
function say2(id){const L=A2L[id];if(!L)return;const dur=clamp(1.6+(L.en.length+(L.ta?L.ta.length*0.5:0))/16,3,10);subQ.push({L,dur,id})}
function subBusy(){return!!subCur||subQ.length>0}
function updateSub(dt){const el=$('sub');resumeVoice();if(subCur){subT-=dt;if(subT<=0)subCur=null}
  if(!subCur&&subQ.length){subCur=subQ.shift();subT=subCur.dur;const L=subCur.L;
    el.className=L.spk==='architect'?'altered':'';el.innerHTML=`<b>${esc(whoText(L))}</b>${lineHTML(L)}`;
    const it=subCur;playVoice(it.id,len=>{if(subCur===it)subT=Math.max(subT,len+0.4)})}
  if(!subCur&&!el.classList.contains('hidden'))el.classList.add('hidden');else if(subCur)el.classList.remove('hidden')}
function clearSubs(){stopVoice();subQ=[];subCur=null;subT=0;$('sub').classList.add('hidden')}

/* ---------- cinematic overlays: phone message, CCTV, title card, fade ---------- */
let cineHold=false,cine=null;
function openPhone(cfg,done){cine={type:'phone',cfg,done,shown:0,t:0};cineHold=true;mouseL=false;const el=$('phone');el.classList.remove('hidden');el.innerHTML=`<div class="ph-h">${esc(cfg.header)}</div><div class="ph-b"></div><div class="ph-f"></div>`;noise(0.08,2600,0.2,2)}
function openCard(cfg,done){cine={type:'card',cfg,done,t:0};cineHold=true;mouseL=false;const el=$('card');el.classList.remove('hidden');
  el.innerHTML=`<h2>${esc(cfg.title)}</h2>${(cfg.lines||[]).map(l=>`<p>${esc(l)}</p>`).join('')}${cfg.quote?`<blockquote>${esc(cfg.quote)}</blockquote>`:''}<small>${isTouch?'Tap':'Click or press Enter'} to continue</small>`}
function openCCTV(cfg,done){cine={type:'cctv',cfg,done,t:0};cineHold=true;mouseL=false;$('cctv').classList.remove('hidden');$('cctv').classList.remove('off');$('cctvTxt').textContent=cfg.label}
function cineTick(dt){if(!cine)return;cine.t+=dt;
  if(cine.type==='phone'){const L=cine.cfg.lines;if(cine.shown<L.length&&cine.t>0.75*(cine.shown+1)){const p=document.createElement('p');p.textContent=L[cine.shown];if(L[cine.shown]===L[cine.shown].toUpperCase()&&L[cine.shown].length<40)p.className='big';$('phone').querySelector('.ph-b').appendChild(p);cine.shown++;noise(0.03,3400,0.08,1)}
    if(cine.shown>=L.length&&!cine.ready){cine.ready=true;$('phone').querySelector('.ph-f').innerHTML=`${esc(cine.cfg.footer||'')}<br><small>${isTouch?'Tap':'Click or press Enter'} to continue</small>`}}
  else if(cine.type==='cctv'){const c=cine.cfg;camera.position.set(c.cam.x,c.cam.y,c.cam.z);camera.lookAt(c.look.x,c.look.y,c.look.z);$('cctvTs').textContent=new Date(2026,10,22,23,41,7+Math.floor(cine.t)).toLocaleTimeString('en-GB');
    if(cine.t>4.2&&!cine.off){cine.off=true;$('cctv').classList.add('off');noise(0.5,4000,0.25,0.5)}if(cine.t>6)cineDone()}}
function cineKey(e){if(!cine)return;const go=!e||e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter';if(!go)return;
  if(cine.type==='phone'){if(cine.ready)cineDone();else{while(cine.shown<cine.cfg.lines.length){cine.t=99;cineTick(0)}}}else if(cine.type==='card'&&cine.t>0.6)cineDone()}
function cineDone(){const c=cine;if(!c)return;cine=null;cineHold=false;for(const id of['phone','card','cctv'])$(id).classList.add('hidden');if(c.done)c.done()}
function cineSkip(){while(cine)cineDone()}
function fade(op,secs){const f=$('fade');f.style.transition=`opacity ${secs||1}s`;f.style.opacity=op}
for(const id of['phone','card','cctv'])$(id).addEventListener('pointerdown',e=>{e.preventDefault();cineKey(null)});

/* ---------- small helpers ---------- */
const LOOK={selvi:{female:true,long:true,lower:'saree',shirt:'#8c1c13',pants:'#8c1c13',border:'#d4a017',hairStyle:'bun',jasmine:true,bindi:true,glasses:true,skin:'#7a4a2a'},
  kathir:{shirt:'#1d4ed8',pants:'#2b2d42',lower:'pants',sleeve:'short',skin:'#a0662f',hairStyle:'short',hair:'#1b1410',stache:false},
  bhaskar:{shirt:'#c2a878',pants:'#b39b6a',lower:'pants',sleeve:'short',skin:'#6b3f1d',band:'#7a5f3a',stache:true,hairStyle:'short'},
  devarajan:{shirt:'#f4f1e8',pants:'#f4f1e8',lower:'veshti',sleeve:'long',chain:true,glasses:true,hair:'#c9c9c9',hairStyle:'short',stache:true,skin:'#8d5524'},
  contact:{shirt:'#222222',pants:'#1a1a1a',lower:'pants',sleeve:'long',glasses:true,hairStyle:'short',stache:false},
  worker:()=>({shirt:rpick(['#f4f1e8','#a8dadc','#e9c46a','#8ecae6']),pants:rpick(LUNGI),lower:rpick(['lungi','veshti']),skin:rpick(SKIN)}),
  guest:()=>({shirt:rpick(['#f4f1e8','#cfd8dc','#1d3557','#e9d8a6']),pants:rpick(['#2b2d42','#1d1d1d','#3d405b']),lower:'pants',sleeve:'long',skin:rpick(SKIN)})};
function npc(look,x,z,yaw){const h=makeHuman(look);const o={h,x,z,y:humanY(x,z,0),yaw:yaw||0,phase:0,moving:false,spd:0,inV:null,hp:100,dead:false};h.g.position.set(x,o.y,z);h.g.rotation.y=o.yaw;return o}
function npcIdle(o,dt,face){if(face){const t=Math.atan2(player.pos.x-o.x,player.pos.z-o.z);o.yaw+=angDiff(o.yaw,t)*Math.min(1,dt*3)}
  o.y=humanY(o.x,o.z,o.y);o.h.g.position.set(o.x,o.y,o.z);o.h.g.rotation.set(0,o.yaw,0);if(o.moving){o.phase+=dt*(o.spd||3)*2.4;animHuman(o.h,o.phase,0.9,false)}else animHuman(o.h,0,0,false)}
function npcGone(o){if(o&&o.h)scene.remove(o.h.g)}
function a2Prop(kind,x,z,y){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.OctahedronGeometry(0.26),MBasic(kind==='opt'?'#7fb8ff':kind==='doc'?'#ffffff':'#ffd23f'));g.add(m);
  const s=new THREE.Mesh(GEO.box,M(kind==='doc'?'#e9e2d0':'#2b2b2b'));s.scale.set(0.45,0.08,0.32);s.position.y=-0.6;g.add(s);g.position.set(x,(y!==undefined?y:humanY(x,z,0))+0.95,z);scene.add(g);return g}
function ringPhone(n){if(!AC||!OUT)return;const t=AC.currentTime;for(let k=0;k<(n||3);k++)for(const o of[0,0.18])tone(880,t+k*1.1+o,0.14,'square',0.05,OUT,0.01,2400)}
function a2Mission(){return mission&&mission.type==='story'&&mission.idx>=6?mission:null}
function farFrom(x,z){return Math.hypot(playerP().x-x,playerP().z-z)}
function holdAt(o,x,z,secs,dt,r){const ok=!player.vehicle&&!player.dead&&Math.hypot(player.pos.x-x,player.pos.z-z)<(r||1.8);o.hold=ok?(o.hold||0)+dt:Math.max(0,(o.hold||0)-dt*2);return o.hold>=secs}

/* ---------- generic stages ---------- */
function stTalk(...ids){return{init(m){for(const id of ids){const r=typeof id==='function'?id(m):id;if(r)say2(r)}},upd(m){m.txt=subCur?'Conversation · '+subCur.L.who.split(' ').map(w=>w.charAt(0)+w.slice(1).toLowerCase()).join(' '):'';return!subBusy()},auto(){clearSubs()}}}
function stDo(fn){return{init(m){fn(m)},upd(){return true}}}
function stPhone(cfg){return{init(m){m.cineDone=false;openPhone(cfg,()=>{m.cineDone=true})},upd(m){m.txt='';return m.cineDone},auto(m){cineSkip();m.cineDone=true}}}
function stCard(cfg){return{init(m){m.cineDone=false;openCard(cfg,()=>{m.cineDone=true})},upd(m){return m.cineDone},auto(m){cineSkip();m.cineDone=true}}}
function stWait(secs,txt){return{init(m){m.w=secs},upd(m,dt){m.txt=txt||'';return(m.w-=dt)<=0},auto(m){m.w=0}}}
/* Search points: hold position on foot near each point to search it. pts:[{x,z,y?,id,optional?}].
   The points are processed by a mission tick, so optional points stay searchable until the mission ends. */
function stSearch(o){const H=o.hold||1.6;return{timer:o.timer,init(m){const pts=m.pts=o.pts().map(p=>Object.assign({},p,{got:false,hold:0,g:a2Prop(p.optional?'opt':(o.kind||'clue'),p.x,p.z,p.y)}));
    m.cleanup.push(()=>pts.forEach(p=>scene.remove(p.g)));
    m.ticks.push((m,dt)=>{m.searchNear=null;for(const p of pts){if(p.got)continue;p.g.rotation.y+=dt*2;p.g.visible=farFrom(p.x,p.z)<(o.vis||45);
      if(holdAt(p,p.x,p.z,H,dt)){p.got=true;scene.remove(p.g);noise(0.12,3600,0.22,1);if(o.found)o.found(p,m)}else if(p.hold>0)m.searchNear=p}
      m.searchMeter=m.searchNear?{label:o.verb||'Searching…',v:m.searchNear.hold/H,col:'#ffd23f'}:null});if(o.init)o.init(m)},
  upd(m,dt){const req=m.pts.filter(p=>!p.optional),got=req.filter(p=>p.got).length;m.txt=`${o.txt} · ${o.unit||'evidence'} ${got}/${req.length}`;
    if(o.tick)o.tick(m,dt);
    if(farFrom(o.cx,o.cz)>(o.r||30))mk(o.cx,o.cz);else marker.visible=false;return got>=req.length},
  auto(m){for(const p of m.pts)if(!p.got&&!p.optional){p.got=true;scene.remove(p.g);if(o.found)o.found(p,m)}}}}
function openChoice(m,o){const build=()=>o.opts.map(op=>({t:op.t,off:op.off?op.off():false,fn:()=>{const r=op.fn(m);if(typeof r==='string')return r;m.choiceDone=true;return false}}));
  talk={kind:'choice',obj:player.pos,line:o.line,hdr:()=>`<h3>${esc(o.title)}</h3><div class="sub">This choice is permanent and changes what happens later</div>`,optsFn:build,opts:build()};renderTalk()}
function stChoice(o){return{init(m){m.choiceDone=false;m.choiceT=0;if(player.vehicle)exitVehicle()},upd(m,dt){if(m.choiceDone)return true;m.txt=o.txt||'Make your choice';
    if(!talk){m.choiceT-=dt;if(m.choiceT<=0){m.choiceT=0.4;openChoice(m,o)}}return false},
  auto(m){const op=o.opts[m.testChoice||0];op.fn(m);m.choiceDone=true;if(talk)closeTalk()}}}

/* ---------- escort health ---------- */
function escortTick(m,e,dt){if(!e||e.dead)return;const P=e.inV?e.inV.pos:e;let dmg=0;
  for(const g of goons){if(g.dead||!g.aggro||g.surrendered)continue;const d=Math.hypot(g.x-P.x,g.z-P.z);if(d<30&&los(g.x,1.5,g.z,P.x,1.2,P.z))dmg+=(e.inV?0.7:2.0)*(1.15-d/30)}
  e.hp-=dmg*dt;if(e.inV){if(e.lastVhp!=null&&e.inV===e.lastV&&e.inV.hp<e.lastVhp)e.hp-=(e.lastVhp-e.inV.hp)*0.06;e.lastVhp=e.inV.hp;e.lastV=e.inV}else e.lastV=null;
  m.escortMeter={label:e.name,v:e.hp/100,col:e.hp>40?'#2ecc71':'#ff6b6b'};if(e.hp<=0&&!e.dead){e.dead=true;poseDead(e.h,humanY(P.x,P.z,0));missionFail(e.name+' was badly hurt')}}

/* ---------- scripted driving (vehicle.script runs inside updateVehicles, before physics) ---------- */
function nodeRoute(nodes,stops){const pts=[];for(let k=0;k<nodes.length-1;k++){const a=nodes[k],b=nodes[k+1],dx=Math.sign(b[0]-a[0]),dz=Math.sign(b[1]-a[1]);
  const p1=laneWP(a[0],a[1],dx,dz,9),p2=laneWP(b[0],b[1],dx,dz,-9);pts.push(p1);if(stops&&stops[k])pts.push(Object.assign({x:(p1.x+p2.x)/2,z:(p1.z+p2.z)/2},stops[k]));pts.push(p2)}return pts}
function routeDrive(R){return(v,dt)=>{if(R.hold>0){R.hold-=dt;v.speed*=Math.max(0,1-4*dt);return}const p=R.pts[R.i];if(!p){v.speed*=Math.max(0,1-3*dt);R.done=true;return}
  const dx=p.x-v.pos.x,dz=p.z-v.pos.z,d=Math.hypot(dx,dz);if(d<4.5){if(p.stop){R.hold=p.stop;if(R.onStop)R.onStop(p)}R.i++;return}
  const diff=angDiff(v.heading,Math.atan2(dx,dz));let target=R.speed;if(Math.abs(diff)>0.5)target=Math.min(target,7);const n=R.pts[R.i+1];
  if(d<16&&(p.stop||(n&&Math.abs(angDiff(Math.atan2(dx,dz),Math.atan2(n.x-p.x,n.z-p.z)))>0.6)))target=Math.min(target,8);if(!R.reckless&&blockedAhead(v))target=0;
  v.speed+=clamp(target-v.speed,-v.s.brake*dt,v.s.acc*dt);const rate=v.s.steer*1.3*Math.min(1,Math.abs(v.speed)/3);v.heading+=clamp(diff,-rate*dt,rate*dt)}}

/* ---------- stealth guards ---------- */
function coneMesh(r,half){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CircleGeometry(r,22,-Math.PI/2-half,half*2),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:0.16,depthWrite:false,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.position.y=0.08;g.add(m);g.userData.mat=m.material;scene.add(g);return g}
function addGuards(m,list,opt){m.guards=m.guards||[];m.sus=m.sus||0;for(const gd of list){const[x,z]=gd.path[0];const g=spawnGoon(x,z,null,false,Object.assign({wep:'pistol',band:'#111'},opt,gd.opt||{}));
    g.passive=true;g.mission=m;g.path=gd.path;g.pi=0;g.wait=0;g.cone=coneMesh(opt.range||14,0.7);m.guards.push(g)}
  m.cleanup.push(()=>{for(const g of m.guards)if(g.cone)scene.remove(g.cone);(m.cams||[]).forEach(c=>scene.remove(c.g))})}
function addCams(m,list){m.cams=(m.cams||[]).concat(list.map(c=>{const g=coneMesh(16,0.45);g.position.set(c.x,0,c.z);return Object.assign({g,on:true},c)}))}
function raiseAlarm(m,line){if(m.alarm)return;m.alarm=true;for(const g of m.guards||[]){g.passive=false;g.aggro=true;if(g.cone)g.cone.visible=false}for(const c of m.cams||[])c.g.visible=false;
  m.detMeter=null;if(line)say2(line);if(AC&&OUT){const t=AC.currentTime;for(let k=0;k<6;k++)tone(k%2?660:880,t+k*0.35,0.3,'sawtooth',0.04,OUT,0.01,1800)}m.meters=[]}
function stealthTick(m,dt){if(m.alarm)return;let seen=0,close=false;const P=player.vehicle?player.vehicle.pos:player.pos;const py=player.vehicle?player.vehicle.y:player.pos.y;
  const look=(x,z,yaw,range,half,eye)=>{const dx=P.x-x,dz=P.z-z,d=Math.hypot(dx,dz);if(d<1.8)return 3;const R=range*(player.vehicle?1.6:player.crouch?0.55:1)*(dayF<0.3?0.85:1);if(d>R)return 0;
    if(Math.abs(angDiff(yaw,Math.atan2(dx,dz)))>half)return 0;if(!los(x,eye,z,P.x,py+(player.crouch?0.8:1.4),P.z))return 0;return 1.25-d/R};
  for(const g of m.guards||[]){if(g.dead||!g.passive||g.surrendered)continue;if(g.aggro){raiseAlarm(m,m.alarmLine);return}
    if(g.path&&g.path.length>1){if(g.wait>0)g.wait-=dt;else{const t=g.path[g.pi];if(Math.hypot(t[0]-g.x,t[1]-g.z)<0.6){g.pi=(g.pi+1)%g.path.length;g.wait=1.4}else walkTo(g,t[0],t[1],1.6,dt)}}
    else g.moving=false;g.phase=(g.phase||0)+(g.moving?dt*4:0);g.y=humanY(g.x,g.z,g.y||0);g.h.g.position.set(g.x,g.y,g.z);g.h.g.rotation.set(0,g.yaw,0);animHuman(g.h,g.phase,g.moving?0.8:0,false);
    const s=look(g.x,g.z,g.yaw,14,0.7,(g.y||0)+1.6);if(s){seen+=s;if(s===3)close=true}g.cone.position.set(g.x,g.y,g.z);g.cone.rotation.y=g.yaw;g.cone.userData.mat.color.set(s?0xff4d4d:0xffd23f);g.cone.userData.mat.opacity=s?0.3:0.16}
  for(const c of m.cams||[]){if(!c.on)continue;const yaw=c.yaw+Math.sin(time*0.6+c.x)*0.9;c.g.rotation.y=yaw;const s=look(c.x,c.z,yaw,16,0.45,4);if(s)seen+=s;c.g.userData.mat.color.set(s?0xff4d4d:0x7fb8ff)}
  m.sus=clamp(m.sus+(seen?(close?220:seen*75):-22)*dt,0,100);m.detMeter={label:m.sus>0?'Detection':'Unseen',v:m.sus/100,col:m.sus>60?'#ff4d4d':'#ffb347'};if(m.sus>=100)raiseAlarm(m,m.alarmLine)}
function surrenderTick(m,dt){for(const g of m.guards||[]){if(!g.surrendered||g.dead)continue;const h=g.h;h.g.position.set(g.x,humanY(g.x,g.z,0)-0.42,g.z);h.legL.rotation.x=h.legR.rotation.x=-1.45;if(h.shinL)h.shinL.rotation.x=h.shinR.rotation.x=1.5;h.armL.rotation.x=h.armR.rotation.x=-2.9;if(h.gun)h.gun.visible=false}}

/* ---------- free-roam consequences of Act 2 choices ---------- */
let policeFavourT=0;
function heatMult(){const a=A2();return policeFavourT>0?0.5:a.inspector==='ally'?0.6:a.inspector==='neutral'?1.3:1}
function heliStars(){return A2().inspector==='ally'?5:4}

/* ---------- world additions (built with the map) ---------- */
const POLICE_ST={x:32,z:-402,door:{x:21,z:-402}},GODOWN={x:-125,z:455};
function a2Excluded(x,z){return(x>2&&x<48&&z>-418&&z<-386)||(x>-162&&x<-88&&z>426&&z<484)}
function buildAct2World(){
  // Kovai Central Police Station (north road)
  building(POLICE_ST.x,POLICE_ST.z,16,12,7,'#e8d8b0',{noShop:true,noSign:true,noTank:true,style:0});addBox(B_PLAIN,16.3,0.6,12.3,POLICE_ST.x,3.6,POLICE_ST.z,'#c1121f');addBox(B_PLAIN,16.3,0.3,12.3,POLICE_ST.x,4.05,POLICE_ST.z,'#1d4ed8');
  addFlat(B_SIDE,7,-410,24,-394,0.05,'#ffffff',2.5);const ps=textPlane('KOVAI CENTRAL POLICE STATION',11,1.1,'#1d3557','#ffffff');ps.position.set(POLICE_ST.x-8.2,5.4,POLICE_ST.z);ps.rotation.y=-Math.PI/2;
  for(const z of[-408,-396])PARKED.push({type:'police',x:14,z,h:0});
  // Thendral Builders godown (south of Ukkadam): walled yard, warehouse with doors, crates for cover
  const W=(x0,z0,x1,z1,h,c)=>{addBox(B_PLAIN,Math.abs(x1-x0)||0.4,h,Math.abs(z1-z0)||0.4,(x0+x1)/2,h/2,(z0+z1)/2,c);addCollider(Math.min(x0,x1)-(x0===x1?0.2:0),Math.min(z0,z1)-(z0===z1?0.2:0),Math.max(x0,x1)+(x0===x1?0.2:0),Math.max(z0,z1)+(z0===z1?0.2:0),h)};
  const C='#9a958a',H=2.8;addFlat(B_SIDE,-155,433,-95,477,0.04,'#d9d4c8',2.5);
  W(-155,433,-130,433,H,C);W(-120,433,-95,433,H,C);W(-155,477,-110,477,H,C);W(-106,477,-95,477,H,C);W(-155,433,-155,477,H,C);W(-95,433,-95,477,H,C);
  const WC='#b7a98f',WH=7;W(-145,448,-133,448,WH,WC);W(-127,448,-115,448,WH,WC);W(-145,468,-115,468,WH,WC);W(-145,448,-145,468,WH,WC);W(-115,448,-115,460,WH,WC);W(-115,463,-115,468,WH,WC);
  addBox(B_PLAIN,30.6,0.3,20.6,-130,WH+0.15,458,'#6d6a63');addCollider(-145,448,-115,468,WH+0.3,WH);addBox(B_PLAIN,6,1.2,0.3,-130,WH-0.6,448,'#4a4a4a');
  for(const[x,z]of[[-142,466],[-130,466],[-118,450]]){addBox(B_PLAIN,1.6,0.85,0.8,x,0.43,z,'#6d4c41');addCollider(x-0.8,z-0.4,x+0.8,z+0.4,0.85)}
  for(const[x,z]of[[-150,440],[-110,442],[-102,470],[-151,475],[-118,474],[-136,442]]){addBox(B_PLAIN,1.4,1.4,1.4,x,0.7,z,'#8b6b4a');addCollider(x-0.7,z-0.7,x+0.7,z+0.7,1.4)}
  addBox(B_PLAIN,0.5,0.8,0.15,-114.7,1.4,452,'#2b2b2b');
  const gs=textPlane('THENDRAL BUILDERS · GODOWN 4',8,0.9,'#2b2d42','#f2d13a');gs.position.set(-125,3.4,432.7);gs.rotation.y=Math.PI}

/* ---------- Act 2 missions (story 7-14) ---------- */
const MILL_S={x:333,z:111};
function selviEscort(m,x,z,follow){const e=npc(LOOK.selvi,x,z,0);e.name='Selvi Akka';e.follow=!!follow;m.escort=e;m.cleanup.push(()=>{if(e.inV)alightPassenger(e);npcGone(e)});
  m.ticks.push((m,dt)=>{if(m.escort!==e)return;if(e.follow===false&&!e.dead){if(e.inV)alightPassenger(e);npcIdle(e,dt,true)}if(m.escortActive)escortTick(m,e,dt)});return e}
STORY.push(
 {title:'Ashes and Ledgers',reward:5000,intro:'Thambi, the burned mill at Singanallur still has secrets. Someone searched it after the fire. I want to know what they missed.',
  onStart:()=>toast('ACT 2','THREADS OF KOVAI',4),
  make:()=>[stTalk('m7_brief','m7_intro','m7_player'),stGo(MILL_S.x,MILL_S.z,'Go to the burned Singanallur mill',{r:32}),
   stSearch({txt:'Search the burned mill',cx:MILL_S.x,cz:MILL_S.z,r:34,pts:()=>[{x:318,z:111,id:'ledger'},{x:340,z:113,id:'phone'},{x:358,z:98,id:'agreement'},{x:306,z:125,id:'pass',optional:true}],
     init(m){addGuards(m,[{path:[[316,109],[344,109]]},{path:[[360,92],[360,128]]},{path:[[305,95],[305,128]]}],{wep:'pistol',band:'#111'});m.alarmLine=null;
       m.ticks.push((m,dt)=>{if(Math.random()<dt*3)smoke(MILL_S.x+RR(-22,22),RR(1,6),MILL_S.z+RR(-14,14),0x3a3a3a);stealthTick(m,dt)})},
     found(p,m){A2().evidence++;floatMsg({ledger:'Found: a burned financial ledger',phone:'Found: Silk Sundaram\'s old phone',agreement:'Found: a land agreement signed by Devarajan',pass:'Found: a visitor pass from the night of the fire'}[p.id]);
       if(p.id==='pass'){A2().insider=true;say2('m7_insider')}}}),
   stGo(GIVER.x,GIVER.z,'Take the evidence to Paramasivam Anna',{r:5}),stTalk('m7_end'),
   stPhone({header:'RECOVERED PHONE · SILK SUNDARAM',lines:['"Payment received. The old mill burns tonight."','"The workers will sign by Friday."','Saved contact:','A'],footer:'NUMBER UNREGISTERED · NO CALL HISTORY'})]},
 {title:'The Tail',reward:7500,intro:'Devarajan smiles for the newspapers. Let us see where he goes when the cameras are away.',
  make:()=>[stTalk('m8_brief'),stGo(-100,-151.5,'Wait near Gandhipuram for Devarajan\'s white SUV',{r:16}),
   {init(m){const R={pts:nodeRoute([[-1,-2],[1,-2],[1,-1],[2,-1],[3,-1],[3,-2],[4,-2],[4,-3],[4,-4]],{2:{stop:8,id:'hotel'},5:{stop:9,id:'office'},7:{stop:1e9,id:'meet'}}),i:0,speed:13,hold:0};
      const p0=R.pts[0];const v=spawnVehicle('suv',p0.x,p0.z,Math.PI/2,'#f2f2f2');v.keep=true;v.hp=1e6;v.script=routeDrive(R);m.tgt=v;m.R=R;m.sus=0;m.lostT=0;m.photo=0;m.plateT=0;
      R.onStop=p=>{if(p.id==='hotel')floatMsg('He\'s stopped at the Race Course hotel. Keep your distance.');if(p.id==='office'){floatMsg('A construction office in Peelamedu…');say2('m8_call');say2('m8_call2')}
        if(p.id==='meet'){m.atMeet=true;const van=spawnVehicle('van',301.5,-272,Math.PI,'#1a1a1a');van.keep=true;m.van=van;m.contact=npc(LOOK.contact,295.5,-259,-Math.PI/2);floatMsg('A meeting. Photograph it from 20–75 m: stop and hold steady.')}};
      m.cleanup.push(()=>{removeVehicle(v);if(m.van)removeVehicle(m.van);npcGone(m.contact)})},
    upd(m,dt){const v=m.tgt,P=playerP(),d=Math.hypot(v.pos.x-P.x,v.pos.z-P.z);mk(v.pos.x,v.pos.z);
      if(d<20)m.sus+=((20-d)*2.5+12)*dt;else m.sus=Math.max(0,m.sus-7*dt);if(d>75)m.lostT+=dt;else m.lostT=0;
      if(m.sus>=100)return'He spotted you';if(m.lostT>9||d>220)return'You lost him';
      m.meters=[{label:d>75?'Losing him…':'Suspicion',v:d>75?Math.min(1,m.lostT/9):m.sus/100,col:d>75?'#7fb8ff':m.sus>60?'#ff4d4d':'#ffb347'}];
      if(m.contact)npcIdle(m.contact,dt,false);
      if(m.atMeet){const spd=player.vehicle?Math.abs(player.vehicle.speed):0,steady=spd<2&&d>=20&&d<=75&&los(P.x,(P.y||0)+1.5,P.z,v.pos.x,1.4,v.pos.z);m.photo=steady?m.photo+dt:Math.max(0,m.photo-dt);
        m.meters.push({label:'Photo',v:m.photo/3,col:'#ffd23f'});m.txt='Photograph the meeting (stop 20–75 m away with a clear view)';
        if(m.van&&!A2().plate){if(Math.hypot(m.van.pos.x-P.x,m.van.pos.z-P.z)<14)m.plateT+=dt;if(m.plateT>1.5){A2().plate=true;say2('m8_plate');noise(0.08,5000,0.2,1)}}
        if(m.photo>=3){noise(0.08,5200,0.3,1);say2('m8_photo');return true}}
      else m.txt='Tail Devarajan: stay 20–75 m behind him';return false},
    auto(m){m.atMeet=true;m.photo=99;m.lostT=0;m.sus=0;A2().plate=true;testNear(m.tgt.pos,35)}},
   stTalk('m8_end')]},
 {title:'Workers\' Voice',reward:10000,intro:'Selvi Akka leads the mill workers\' union. She has proof of what Devarajan did. She needs protection today.',
  make:()=>[stDo(m=>{selviEscort(m,190,231,false)}),stGo(190,231,'Meet Selvi Akka at the Podanur mill gate',{r:4}),stTalk('m9_brief'),
   {init(m){m.escort.follow=true;m.escortActive=true},upd(m){const e=m.escort,P=e.inV?e.inV.pos:e;mk(-37,88);m.txt='Get Selvi Akka to the rally at Town Hall';m.meters=[];
      return Math.hypot(P.x+37,P.z-88)<10&&Math.hypot(playerP().x+37,playerP().z-88)<12},auto(m){if(m.escort.inV)alightPassenger(m.escort);m.escort.x=-37;m.escort.z=88;testNear({x:-37,z:88},1)}},
   {init(m){const e=m.escort;e.follow=false;if(e.inV)alightPassenger(e);e.x=-37;e.z=91;m.left=0;say2('m9_ambush');marker.visible=false;
      spawnSquad(-37,88,6,m,{rx:18,rz:12,aggro:true,weps:['pistol','smg','pistol']});m.workers=[0,1,2].map(k=>{const[x,z]=findOpen(-37,92,14,6);const w=npc(LOOK.worker(),x,z,RR(0,6));w.free=false;return w});
      m.cleanup.push(()=>m.workers.forEach(npcGone))},
    upd(m,dt){for(const w of m.workers){if(w.free){w.moving=true;walkTo(w,w.x+(w.x+37)*0.5,w.z-20,4,dt);npcIdle(w,dt,false);continue}npcIdle(w,dt,false);w.h.g.position.y-=0.4;
        if(holdAt(w,w.x,w.z,1,dt)){w.free=true;A2().workers++;floatMsg(`Worker safe (${m.workers.filter(q=>q.free).length}/3)`)}}
      m.txt=`Stop the attackers · left: ${Math.max(0,m.left)} · optional: free trapped workers ${m.workers.filter(w=>w.free).length}/3`;m.meters=[];return m.left<=0},
    auto(m){killSquad(m)}},
   stDo(m=>{m.escortActive=false;m.escortMeter=null;const a=A2();a.selviTrust++;a.evidence++;if(m.workers.every(w=>w.free)){a.selviTrust++;m.reward+=2500;toast('BONUS','All three workers saved · +₹2,500',2.5)}}),
   stTalk('m9_end','m9_docs')]},
 {title:'Night at the Godown',reward:12500,intro:'The ownership papers lead to a Thendral Builders godown south of Ukkadam. We need what is inside. Quietly.',
  make:()=>[stTalk('m10_brief'),stDo(()=>{tod=21.3}),stGo(GODOWN.x,418,'Go to the Thendral Builders godown, south of Ukkadam',{r:22}),
   stSearch({txt:'Disable the security panel, photograph the documents',kind:'doc',unit:'done',verb:'Working…',cx:GODOWN.x,cz:GODOWN.z,r:40,vis:60,
     pts:()=>[{x:-114.2,z:452,y:0.6,id:'panel'},{x:-142,z:466,y:0.86,id:'doc1'},{x:-130,z:466,y:0.86,id:'doc2'},{x:-118,z:450,y:0.86,id:'doc3'}],
     init(m){m.alarmLine='m10_alarm';addGuards(m,[{path:[[-150,438],[-100,438]]},{path:[[-100,445],[-100,472],[-112,472]]},{path:[[-140,452],[-120,452],[-120,464],[-140,464]]},{path:[[-150,445],[-150,472]]}],{wep:'pistol',band:'#2b2d42'});
       addCams(m,[{x:-125,z:434.6,yaw:0},{x:-115.6,z:447.4,yaw:-2.2}]);m.ticks.push((m,dt)=>{stealthTick(m,dt);if(m.alarm&&!m.reinf){m.reinf=true;for(let k=0;k<2;k++){const g=spawnGoon(-125+RR(-4,4),430,null,true,{wep:'smg'});g.mission=m}}})},
     found(p,m){if(p.id==='panel'){for(const c of m.cams||[]){c.on=false;c.g.visible=false}floatMsg('Security cameras disabled')}else{A2().evidence++;floatMsg('Document photographed')}}}),
   {upd(m){mk(GODOWN.x,412);m.txt='Get out of the compound';m.meters=[];return farFrom(GODOWN.x,GODOWN.z)>48},auto(m){player.pos.set(GODOWN.x,player.pos.y,400)}},
   stDo(m=>{if(!m.alarm){A2().stealth=true;m.reward+=3000;toast('GHOST','No alarms raised · +₹3,000',2.5)}}),
   stPhone({header:'PHOTOGRAPHED DOCUMENTS · GODOWN 4',lines:['Payments to "intermediaries": ₹4.2 crore','Officials receiving money: 11 names','Shipment record: private storage facility, Western Ghats','PROJECT KOVAI','AUTHORIZED BY: A'],footer:'3 DOCUMENTS · STORED'}),
   stTalk('m10_end')]},
 {title:'The Inspector\'s Price',reward:3000,intro:'Inspector Bhaskar has asked for you. He knows something about the fire. Hear him out, but watch your back.',
  make:()=>[stTalk('m11_brief'),stDo(m=>{const b=npc(LOOK.bhaskar,POLICE_ST.door.x,POLICE_ST.door.z,-Math.PI/2);m.bh=b;m.cleanup.push(()=>npcGone(b));m.ticks.push((m,dt)=>npcIdle(b,dt,true))}),
   stGo(POLICE_ST.door.x-2.5,POLICE_ST.door.z,'Meet Inspector Bhaskar at the Kovai Central Police Station',{r:3.5}),stTalk('m11_a','m11_b','m11_c'),
   stChoice({title:'The Inspector\'s Price',line:'I need protection, or a reason.',txt:'Decide what to do about Inspector Bhaskar',opts:[
     {t:'Pay him ₹10,000 (he becomes a practical ally)',off:()=>player.cash<10000,fn:m=>{if(player.cash<10000)return'You don\'t have ₹10,000. Come back when you do, or choose something else.';player.cash-=10000;A2().inspector='ally';say2('m11_pay');floatMsg('Bhaskar is now an ally: police ease off faster')}},
     {t:'Threaten him with the evidence (he cooperates, out of fear)',fn:m=>{A2().inspector='coerced';say2('m11_threat');floatMsg('Bhaskar will cooperate… for now')}},
     {t:'Walk away (he stays neutral, and police come down harder)',fn:m=>{A2().inspector='neutral';say2('m11_walk');floatMsg('Bhaskar stays out of it. The police won\'t go easy on you.')}}]}),
   {upd(){return!subBusy()},auto(){clearSubs()}},stTalk('m11_end')]},
 {title:'Kathir\'s Secret',reward:4000,intro:'Every move we make, Devarajan knows before we do. Someone close is talking. I cannot sleep, thambi.',
  make:()=>[stTalk('m12_brief'),stGo(-60,-160,'Watch the meeting spot by the Gandhipuram bus stand',{r:20}),
   {timer:180,init(m){const p=laneWP(0,-2,1,0,-22);const v=spawnVehicle('scooter',p.x,p.z,Math.PI/2,'#2a9d8f');v.keep=true;v.hp=1e6;makeAI(v,0,-2,1,0,16);v.ai.reckless=true;v.ai.flee=true;
      const k=makeHuman(LOOK.kathir);v.mesh.add(k.g);k.g.position.set(0,0.08,-0.2);seatPose(k);v.rider=k;m.kv=v;m.close=0;m.seen=false;m.cleanup.push(()=>removeVehicle(v));floatMsg('A scooter is leaving the meeting spot. Follow it!')},
    upd(m,dt){const v=m.kv,P=playerP(),d=Math.hypot(v.pos.x-P.x,v.pos.z-P.z);mk(v.pos.x,v.pos.z);if(!m.seen&&d<40){m.seen=true;say2('m12_seen')}
      if(d<7||(d<12&&Math.abs(v.speed)<1.5))m.close+=dt;else m.close=Math.max(0,m.close-dt*0.5);m.meters=[{label:'Cornering him',v:m.close/2.5,col:'#ffd23f'}];m.txt='Chase the scooter and corner the rider';
      if(d>350)return'The rider got away';return m.close>=2.5},
    auto(m){m.close=99;testNear(m.kv.pos,4)}},
   stDo(m=>{const v=m.kv;v.ai=null;v.speed=0;v.vx=v.vz=0;if(player.vehicle)exitVehicle();v.mesh.remove(v.rider.g);v.rider=null;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
     const k=npc(LOOK.kathir,v.pos.x+fz*1.4,v.pos.z-fx*1.4,0);m.kathir=k;m.cleanup.push(()=>npcGone(k));m.ticks.push((m,dt)=>{if(m.kathir===k)npcIdle(k,dt,true)});player.pos.set(k.x+fz*2.2,player.pos.y,k.z-fx*2.2)}),
   stTalk('m12_caught','m12_why'),
   stChoice({title:'Kathir\'s Secret',line:'I was protecting my sister. What happens now is your call.',txt:'Decide Kathir\'s fate',opts:[
     {t:'Forgive Kathir (he will help you in the finale)',fn:m=>{A2().kathir='forgiven';say2('m12_forgive')}},
     {t:'Hand him to the police (₹8,000, police ease off for a while)',fn:m=>{A2().kathir='handed';m.reward=8000;wanted=0;policeFavourT=600;say2('m12_hand')}}]}),
   {upd(){return!subBusy()},auto(){clearSubs()}}]},
 {title:'Ghat Wolves',reward:15000,intro:'They have taken Selvi. The Ghat Wolves, smugglers from the hills. Bring her back, thambi. Please.',
  make:()=>{const i=Math.min(GHAT.length-8,Math.floor(GHAT.length*0.7)+6),c=GHAT[i],n=GHAT[i+1],l=Math.hypot(n.x-c.x,n.z-c.z)||1,sx=-(n.z-c.z)/l,sz=(n.x-c.x)/l;
   const V={x:c.x,z:c.z},S={x:c.x+sx*8,z:c.z+sz*8};
   return[stTalk('m13_brief'),stGo(V.x,V.z,'Find the Ghat Wolves\' hideout in the hill village',{r:70}),
    stDo(m=>{const e=selviEscort(m,S.x,S.z,false);e.tied=true;m.ticks.push((m,dt)=>{if(e.tied){e.h.g.position.y-=0.45;seatPose(e.h);e.h.armL.rotation.x=e.h.armR.rotation.x=0.4}});
      const pts=k=>{const[x,z]=findOpen(V.x,V.z,16,16);return[[x,z],findOpen(x,z,8,8)]};
      addGuards(m,[0,1,2,3,4,5].map(k=>({path:pts(k)})),{wep:'rifle',band:'#3f5130',range:15});
      const L=spawnGoon(S.x+(n.x-c.x)/l*3.5,S.z+(n.z-c.z)/l*3.5,null,false,{boss:true,hp:600,shirt:'#4b5320',band:'#3f5130',wep:'rifle'});L.passive=true;L.mission=m;L.surrender=120;L.path=[[L.x,L.z]];L.pi=0;L.wait=0;L.cone=coneMesh(15,0.7);m.guards.push(L);m.leader=L;
      m.ticks.push((m,dt)=>{stealthTick(m,dt);surrenderTick(m,dt);const a=A2();if(L.surrendered&&!L.dead&&!m.captured){if(!m.surSaid){m.surSaid=true;say2('m13_surrender');floatMsg('The leader surrendered. Walk up to him to capture him (optional).')}
          if(holdAt(L,L.x,L.z,1,dt,2)){m.captured=true;a.leader='captured';say2('m13_leader')}}if(L.dead&&!a.leader)a.leader='killed'})}),
    {timer:240,upd(m,dt){const e=m.escort;mk(e.x,e.z);m.txt='Free Selvi Akka before they move her';const h=holdAt(e,e.x,e.z,2,dt);m.meters=e.hold>0?[{label:'Untying…',v:e.hold/2,col:'#ffd23f'}]:[];return h},auto(m){m.escort.hold=99}},
    stDo(m=>{const e=m.escort;e.tied=false;e.follow=true;m.escortActive=true;say2('m13_found');raiseAlarm(m,null);setTimeout(()=>{if(mission===m)for(let k=0;k<3;k++){const g=spawnGoon(V.x-sx*30+RR(-5,5),V.z-sz*30+RR(-5,5),null,true,{wep:'rifle',band:'#3f5130'});g.mission=m}},20000)}),
    {upd(m){const e=m.escort,P=e.inV?e.inV.pos:e;m.txt='Escape with Selvi Akka: get 250 m away from the village';m.meters=[];marker.visible=false;return Math.hypot(P.x-V.x,P.z-V.z)>250},
     auto(m){if(m.escort.inV)alightPassenger(m.escort);m.escort.x=V.x+300;m.escort.z=V.z;testNear(m.escort,2)}},
    stDo(m=>{m.escortActive=false;m.escortMeter=null;const a=A2();a.vault=true;if(!a.leader)a.leader='escaped';if(m.captured){a.selviTrust++;m.reward+=3000;toast('BONUS','Gang leader captured alive · +₹3,000',2.5)}}),
    stTalk(m=>m.captured?'m13_end':'m13_vault','m13_selvi')]}},
 {title:'The Auction',reward:25000,intro:'This is the last piece, thambi. Devarajan sells the mills today at Kovai Central. Stop the auction. Stop him.',
  onDone:m=>{const a=A2();a.done=true;a.epilogue=1;a.strongCase=a.selviTrust>=2;queueSave();setTimeout(()=>{say2(a.strongCase?'end_strong':'end_weak');floatMsg(PROG.house?'Head back to your safehouse.':'Take a breather. The city feels quiet… too quiet.')},3600)},
  make:()=>{const MC={x:-111,z:-37},POD={x:-111,z:-43.5};return[stTalk('m14_brief'),
   stDo(m=>{const a=A2();const g=[];g.push(m.dev=npc(LOOK.devarajan,POD.x,POD.z,0));g.push(npc(LOOK.guest(),POD.x-3,POD.z,0));
     for(let r=0;r<2;r++)for(let k=0;k<4;k++)g.push(npc(LOOK.guest(),MC.x-7+k*4.5,MC.z+1+r*3,Math.PI));if(a.selviTrust>=2)for(let k=0;k<4;k++)g.push(npc(LOOK.worker(),MC.x-16+k*2,-20,Math.PI));m.crowd=g;
     const pod=new THREE.Mesh(GEO.box,M('#5d4037'));pod.scale.set(2.4,1.1,1);pod.position.set(POD.x,0.55,POD.z+0.9);scene.add(pod);m.cleanup.push(()=>{scene.remove(pod);g.forEach(npcGone)});
     m.ticks.push((m,dt)=>{for(const o of m.crowd)if(o.h.g.visible)npcIdle(o,dt,false)});selviEscort(m,MC.x,-12,false)}),
   stGo(MC.x,-11,'Go to the auction at Kovai Central mall',{r:7}),
   {init(m){m.escort.follow=true},upd(m){mk(POD.x,POD.z+3);m.txt='Interrupt the auction (Selvi follows you)';return Math.hypot(player.pos.x-POD.x,player.pos.z-POD.z-3)<5},auto(m){player.pos.set(POD.x,player.pos.y,POD.z+3)}},
   stTalk('m14_selvi','m14_dev'),
   {init(m){const a=A2();m.escort.follow=false;m.escortActive=true;m.left=0;let guards=5;if(a.inspector==='ally'){guards=3;say2('a_police')}else if(a.inspector==='coerced'){guards=4;say2('a_coerced')}if(a.selviTrust>=2)say2('a_workers');
      m.boss=spawnGoon(POD.x+2,POD.z+5,null,true,{boss:true,hp:1400,shirt:'#111',band:'#c1121f',wep:'rifle'});m.boss.mission=m;m.left++;spawnSquad(MC.x,MC.z,guards,m,{rx:9,rz:8,aggro:true,weps:['smg','rifle']});
      for(const o of m.crowd)if(o!==m.dev)o.h.g.visible=false;m.dev.h.g.visible=false;panic(MC.x,MC.z,40);toast('KANAL KANNAN','Devarajan\'s enforcer',2.4)},
    upd(m){m.txt=`Take down Kanal Kannan (gold shirt) · guards left: ${Math.max(0,m.left-(m.boss.dead?0:1))}`;m.meters=[];marker.visible=false;return m.boss.dead},auto(m){m.boss.dead=true;killSquad(m)}},
   {init(m){const a=A2();m.escortActive=false;m.escortMeter=null;say2('m14_run');const pts=[{x:-100,z:-3.5},{x:80,z:-3.5},{x:345,z:-3.5},{x:590,z:-3.5},{x:608.5,z:8},{x:608.5,z:188},{x:640,z:200}];
      const R={pts,i:0,speed:26,hold:0,reckless:true};const v=spawnVehicle('suv',-100,-3.5,Math.PI/2,'#f2f2f2');v.keep=true;v.hp=1e6;v.script=routeDrive(R);m.dv=v;m.R=R;m.cleanup.push(()=>removeVehicle(v));
      if(a.kathir==='forgiven'){const k=spawnVehicle('sport',-118,-4,Math.PI/2,'#ff3b30');k.keep=true;say2('a_kathir')}
      if(a.inspector==='neutral'){wanted=Math.max(wanted,2);say2('a_neutral')}else if(a.inspector==='coerced'&&Math.random()<0.5){wanted=Math.max(wanted,2);say2('a_betray')}},
    upd(m){const v=m.dv,d=farFrom(v.pos.x,v.pos.z);mk(v.pos.x,v.pos.z);m.txt='Chase Devarajan';if(d>380)return'Devarajan got away';return m.R.done},auto(m){m.R.done=true;m.dv.pos.set(640,0,200);testNear(m.dv.pos,10)}},
   {init(m){const v=m.dv;v.script=null;v.speed=0;const d=m.dev;d.x=v.pos.x+2;d.z=v.pos.z;d.h.g.visible=true;m.boat=null;floatMsg('He\'s running for a boat at the end of the jetty!')},
    upd(m,dt){const d=m.dev,P=playerP();
      if(!m.boat){d.moving=true;walkTo(d,778,200,4.6,dt);npcIdle(d,dt,false);mk(d.x,d.z);m.txt='Stop Devarajan before he reaches his boat';
        if(Math.hypot(P.x-d.x,P.z-d.z)<3.2)return true;
        if(d.x>775){const b=spawnVehicle('speedboat',790,200,Math.PI/2);b.keep=true;b.hp=250;b.script=(v,dt)=>{v.speed=Math.min(v.speed+4*dt,9);v.heading+=Math.sin(time*0.3)*0.2*dt};m.boat=b;d.h.g.visible=false;m.cleanup.push(()=>removeVehicle(b));floatMsg('He\'s on the boat. Disable it!')}}
      else{const b=m.boat;mk(b.pos.x,b.pos.z);m.txt='Disable Devarajan\'s boat';if(b.wrecked||b.hp<=0){d.x=b.pos.x;d.z=b.pos.z;return true}}return false},
    auto(m){const d=m.dev;player.pos.set(d.x+1,player.pos.y,d.z)}},
   {init(m){const d=m.dev;if(player.vehicle)exitVehicle();d.h.g.visible=true;d.moving=false;if(m.boat){d.x=773;d.z=200;player.pos.set(770,1.6,200)}m.ticks.push((m,dt)=>npcIdle(d,dt,true))},upd(){return true}},
   stTalk('m14_q','m14_d1','m14_what','m14_d2'),stDo(()=>ringPhone(3)),stWait(3.3,'A phone is ringing…'),stTalk('m14_call','m14_late'),
   stDo(()=>fade(1,1.4)),stWait(2.6,''),stDo(()=>fade(0,1.4))]}});

/* ---------- epilogue: the Architect's message ---------- */
let epiT=0,watchers=[];
function spawnWatchers(){if(watchers.length)return;for(const[x,z,h]of[[-454,-10.5,Math.PI/2],[-398,-10.5,Math.PI/2]])/* parked on the verge opposite the safehouse, off the carriageway */{const v=spawnVehicle('suv',x,z,h,'#111111');v.keep=true;watchers.push(v)}}
function startEpilogue(){const a=A2();if(a.epilogue!==1)return;a.epilogue=1.5;
  openPhone({header:'UNKNOWN NUMBER · ENCRYPTED MESSAGE',lines:['"You have been busy."','You removed a few pieces from the board.','Silk Sundaram.','Devarajan.','The mills.','Interesting.','But you still don\'t understand the game.','Coimbatore is only one part of the plan.','We should meet someday.','— A'],footer:'MESSAGE STATUS: DELIVERED · SENDER UNKNOWN'},()=>{
    openPhone({header:'UNKNOWN NUMBER · ENCRYPTED MESSAGE',lines:['"I know where you live."'],footer:'MESSAGE STATUS: DELIVERED'},()=>{
      spawnWatchers();const H=PROG.house?{x:HOUSE.px,z:HOUSE.pz+6}:{x:player.pos.x,z:player.pos.z};
      openCCTV({label:'CAM 07 · '+(PROG.house?'PERUR ROAD':'STREET')+' · ● REC',cam:{x:H.x+18,y:9,z:H.z-16},look:{x:H.x,y:1.5,z:H.z}},()=>{
        openCard({title:'ACT 2 COMPLETE',lines:['The immediate story is resolved.','The conspiracy remains active.'],quote:'"The city was never the target. It was the testing ground."'},()=>{a.epilogue=2;saveGame();floatMsg('Free roam continues. Paramasivam Anna may have more to say.')})})})})}
function updateAct2(dt){updateSub(dt);if(policeFavourT>0)policeFavourT-=dt;const a=A2();
  if(a.epilogue===1&&!mission&&!player.dead&&!cineHold){epiT+=dt;if((PROG.house&&Math.hypot(player.pos.x-HOUSE.px,player.pos.z-HOUSE.pz)<25)||(!PROG.house&&epiT>90)||epiT>420)startEpilogue()}}
function initAct2(){const a=A2();if(a.epilogue===1.5)a.epilogue=1;if(a.epilogue>=2)spawnWatchers()}
/* test helper: put the player (on foot) next to a point */
function testNear(p,d){if(player.vehicle)exitVehicle();player.pos.set(p.x-d,groundH(p.x-d,p.z)+0.3,p.z)}
function killSquad(m){for(const g of goons){if(!g.dead&&(g.mission===m)){g.dead=true;g.deadT=0;m.left--}}}
