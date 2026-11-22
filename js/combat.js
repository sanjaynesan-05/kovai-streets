/* Kovai Streets: combat.js
 * Shooting, melee, grenades, weapon wheel, rockets, effects, pickups, lock-on
 * Classic script, loaded in order by index.html (8 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= combat ================= */
const _v=new THREE.Vector3(),_v2=new THREE.Vector3(),_dir=new THREE.Vector3(),_org=new THREE.Vector3(),_pr=new THREE.Vector3(),_sa=new THREE.Vector3(),_sb=new THREE.Vector3();
function raycastAll(origin,dir,maxD,minT){let best=rayBoxes(origin,dir,maxD,minT);let res={type:best<maxD?'world':'none',obj:null};
  _ray.origin.copy(origin);_ray.direction.copy(dir);
  const tryHuman=(x,z,o,type,r2,yy)=>{const y=yy!==undefined?yy:groundH(x,z);_sa.set(x,y+0.1,z);_sb.set(x,y+1.85,z);const d2=_ray.distanceSqToSegment(_sa,_sb,_pr);if(d2<(r2||0.2)){const t=_pr.distanceTo(origin);if(t>minT&&t<best){best=t;res={type,obj:o}}}};
  for(const g of goons)if(!g.dead)tryHuman(g.x,g.z,g,'goon',g.boss?0.3:0.2,g.y);
  for(const p of peds)if(!p.dead&&!p.hidden&&p.h.g.visible)tryHuman(p.x,p.z,p,'ped');
  for(const v of vehicles){if(v===player.vehicle)continue;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
    for(const off of v.s.circ){const cx=v.pos.x+fx*off,cz=v.pos.z+fz*off;_sa.set(cx,0.3,cz);_sb.set(cx,v.s.y*1.5,cz);
      const d2=_ray.distanceSqToSegment(_sa,_sb,_pr);if(d2<v.s.cr*v.s.cr){const t=_pr.distanceTo(origin);if(t>minT&&t<best){best=t;res={type:'veh',obj:v}}}}}
  if(heli&&heli.alive){const d2=_ray.distanceSqToPoint(heli.g.position);if(d2<9){const t=heli.g.position.distanceTo(origin);if(t>minT&&t<best){best=t;res={type:'heli',obj:heli}}}}
  res.t=best;res.point=origin.clone().addScaledVector(dir,best);return res}
function camDir(){return _dir.set(Math.sin(camYaw)*Math.cos(camPitch),Math.sin(camPitch),Math.cos(camYaw)*Math.cos(camPitch))}
function fire(){if(player.dead||player.down>0)return;
  if(player.vehicle){if(player.vehicle.type==='tank')tankFire();return}
  const w=WEAPONS[player.weapon];if(player.reloading>0||player.fireCD>0||wheelOpen)return;if(player.swim){floatMsg('Can\'t use weapons while swimming');player.fireCD=0.6;return}if(w.melee){melee(w);return}
  if(player.mags[player.weapon]<=0){if(player.res[player.weapon]>0)startReload();else{noise(0.04,600,0.12,1);player.fireCD=0.3}return}
  player.mags[player.weapon]--;player.fireCD=w.rate;player.lastShot=time;
  _org.copy(camera.position);const minT=_org.distanceTo(_v.set(player.pos.x,player.pos.y+1.5,player.pos.z))+0.3;
  const muzzle=player.human.gun.localToWorld(_v2.set(0,-0.83,0.04)).clone();
  if(w.thrown){throwGrenade();noise(0.12,1500,0.15,1);player.lastShot=time;if(player.mags[player.weapon]===0&&player.res[player.weapon]>0)setTimeout(()=>{if(!player.vehicle)startReload()},500);return}
  if(w.rocket){const hit=raycastAll(_org,camDir().clone(),400,minT);const d=hit.point.clone().sub(muzzle).normalize();spawnRocket(muzzle,d,true,72)}
  else{const n=w.pellets||1;const sp=w.spread*(aiming?0.45:1);
    const base=assist(camDir().clone(),_org);
    for(let k=0;k<n;k++){const d=base.clone();d.x+=RR(-sp,sp);d.y+=RR(-sp,sp);d.z+=RR(-sp,sp);d.normalize();
      const hit=raycastAll(_org,d,w.scope?700:350,minT);if(k<4)tracer(muzzle,hit.point,0xfff3a0);
      if(hit.type==='goon'){const g=hit.obj;damageGoon(g,w.dmg,true,g.hp-w.dmg<=0&&w.dmg>=200?{vx:d.x*6,vy:2,vz:d.z*6}:null);hitMark()}
      else if(hit.type==='ped'){killPed(hit.obj,true);hitMark()}
      else if(hit.type==='veh'){damageVehicle(hit.obj,w.dmg*0.9,'player');hitMark();if(k<3)sparks(hit.point.x,hit.point.y,hit.point.z,2)}
      else if(hit.type==='heli'){damageHeli(w.dmg);hitMark()}else if(hit.type==='world'&&k<4)puff(hit.point,0xbbb5a5,0.18)}}
  flash(muzzle);gunSound(w.id,1);
  camPitch+=w.kick;shake=Math.max(shake,w.kick*2);
  panic(player.pos.x,player.pos.z,45);
  for(const g of goons)if(!g.dead&&Math.abs(g.x-player.pos.x)<70&&Math.abs(g.z-player.pos.z)<70)g.aggro=true;
  if(player.mags[player.weapon]===0&&player.res[player.weapon]>0)setTimeout(()=>{if(!player.vehicle)startReload()},w.rate*1000)}
function assist(d,org){if(!isTouch)return d;let best=null,ba=0.13;
  const tryT=(x,y,z)=>{_v.set(x-org.x,y-org.y,z-org.z);const L=_v.length();if(L>140||L<1)return;_v.divideScalar(L);const a=Math.acos(clamp(_v.dot(d),-1,1));if(a<ba&&los(org.x,org.y,org.z,x,y,z)){ba=a;best=_v.clone()}};
  for(const g of goons)if(!g.dead&&g.h.g.visible)tryT(g.x,groundH(g.x,g.z)+1.2,g.z);
  if(wanted>0)for(const v of vehicles)if(v.policeAI&&!v.policeAI.leaving)tryT(v.pos.x,1,v.pos.z);
  return best||d}
function tankFire(){const v=player.vehicle;if(player.tankCD>0)return;player.tankCD=1.1;
  const muzzle=v.turret.localToWorld(_v2.set(0,0.45,5.2)).clone();
  const hit=raycastAll(camera.position.clone(),camDir().clone(),500,v.s.cam*0.5);const d=hit.point.clone().sub(muzzle).normalize();
  spawnRocket(muzzle,d,true,110);flash(muzzle);noise(0.7,500,0.7,2);shake=Math.max(shake,0.35)}
function startReload(){const w=WEAPONS[player.weapon];if(player.reloading>0||player.mags[player.weapon]>=w.mag||player.res[player.weapon]<=0)return;player.reloading=w.reload;noise(0.08,900,0.15,1)}
function finishReload(){const i=player.weapon,w=WEAPONS[i];const take=Math.min(w.mag-player.mags[i],player.res[i]);player.mags[i]+=take;if(player.res[i]!==Infinity)player.res[i]-=take}
function enemyShoot(x,y,z,acc,dmg){if(player.dead)return false;const T=playerP();const ty=player.vehicle?player.vehicle.s.y:player.pos.y+(player.crouch?0.75:1.25);
  if(!los(x,y,z,T.x,ty,T.z))return false;if(!player.vehicle&&player.crouch)acc*=player.inCover?0.25:0.7;
  const hit=Math.random()<acc;_v.set(T.x,ty,T.z);if(!hit){_v.x+=RR(-1.8,1.8);_v.y+=RR(-0.6,1.2);_v.z+=RR(-1.8,1.8)}
  tracer(new THREE.Vector3(x,y,z),_v.clone(),0xffa48a);flash(new THREE.Vector3(x,y,z));
  const d=Math.hypot(x-T.x,z-T.z);gunSound('enemy',clamp(1-d/140,0,1));
  if(hit){if(player.vehicle){if(!cheatIron)damageVehicle(player.vehicle,dmg*2.2,'enemy');if(player.vehicle&&player.vehicle.type!=='tank')playerDamage(dmg*(player.vehicle.s.two?1:0.2))}else playerDamage(dmg)}
  return true}
function damageVehicle(v,amt,src){if(v.wrecked)return;v.hp-=amt;if(src)v.lastSrc=src;vehDamageFX(v);if(v.hp<=0)explode(v,src)}
function explode(v,src){if(v.wrecked)return;v.wrecked=true;v.hp=0;v.wreckT=0;
  v.mesh.traverse(m=>{if(m.isMesh)m.material=M('#2a2a2a')});
  if(v.policeAI){if(src==='player')addWanted(1);v.policeAI=null}
  v.ai=null;v.vy=0;
  const byP=src==='player';boom(v.pos.x,1,v.pos.z,byP,v);v.av+=RR(-2,2);
  if(v===player.vehicle){exitVehicle();playerDamage(60)}}
function boom(x,y,z,byP,src){
  const f=new THREE.Mesh(GEO.sph,new THREE.MeshBasicMaterial({color:0xffa22b,transparent:true,opacity:1,depthWrite:false}));f.position.set(x,y,z);
  addFx(f,0.7,(m,k)=>{m.scale.setScalar(1+k*6);m.material.opacity=1-k;m.material.color.setHSL(0.08-k*0.06,1,0.55-k*0.2)});
  const s=new THREE.Mesh(GEO.sph,new THREE.MeshLambertMaterial({color:0x2d2d2d,transparent:true,opacity:0.8,depthWrite:false}));s.position.set(x,y+1,z);
  addFx(s,2.2,(m,k)=>{m.scale.setScalar(2+k*7);m.position.y=y+1+k*8;m.material.opacity=0.8*(1-k)});
  sparks(x,y+0.5,z,10);
  const P=playerP();const dd=Math.hypot(x-P.x,z-P.z);noise(1.4,500,0.9*clamp(1-dd/250,0.05,1),2);shake=Math.max(shake,clamp(1-dd/60,0,1));
  const R=8.5;
  for(const p of peds)if(!p.dead&&!p.hidden){const d=Math.hypot(p.x-x,p.z-z);if(d<R){const k=(R-d)/R;killPed(p,byP,{vx:(p.x-x)/(d+0.1)*12*k,vy:6+8*k,vz:(p.z-z)/(d+0.1)*12*k})}}
  for(const g of goons)if(!g.dead){const d=Math.hypot(g.x-x,g.z-z);if(d<R){const k=(R-d)/R;damageGoon(g,700*k+60,byP,{vx:(g.x-x)/(d+0.1)*12*k,vy:6+8*k,vz:(g.z-z)/(d+0.1)*12*k})}}
  for(const o of vehicles){if(o===src||o.wrecked)continue;const d=Math.hypot(o.pos.x-x,o.pos.z-z);if(d<R+2){const k=Math.max(0,(R+2-d)/(R+2));
    if(!(o===player.vehicle&&cheatIron))damageVehicle(o,(o.type==='tank'?120:480)*k+40,byP?'player':'boom');
    const imp=9000*k/o.s.mass;o.vx+=(o.pos.x-x)/(d+0.1)*imp;o.vz+=(o.pos.z-z)/(d+0.1)*imp;o.av+=RR(-1,1)*imp*0.3}}
  if(!player.vehicle&&!player.dead){const d=Math.hypot(player.pos.x-x,player.pos.z-z);if(d<R){playerDamage(80*(1-d/R)+10);player.vy=5;knockDown(1.4)}}
  if(heli&&heli.alive){const d=heli.g.position.distanceTo(_v.set(x,y,z));if(d<R+3)damageHeli(500*(1-d/(R+3))+150)}
  panic(x,z,60)}
function playerDamage(n){if(player.dead||n<=0)return;if(player.armor>0){const a=Math.min(player.armor,n*0.75);player.armor-=a;n-=a}
  player.hp-=n;player.lastDmg=time;$('vig').style.opacity=clamp(n/25,0.35,0.9);vigT=0.25;if(player.hp<=0)die()}
let vigT=0;

/* melee */
let combo=0,comboT=-9;
function punchAnim(h,t,k,wid){const e=Math.sin(Math.PI*(1-clamp(t/0.28,0,1)));
  if(wid==='bat'||wid==='knife'){h.armR.rotation.x=-2.6+2.5*(1-t/0.28);h.armR.rotation.z=0.5*e;return}
  if(k===2){h.legR.rotation.x=-1.6*e;return}(k===0?h.armR:h.armL).rotation.x=-1.65*e}
function knock(o,r,amt){_pp.x=o.x+r.dx*amt;_pp.z=o.z+r.dz*amt;pushCircle(_pp,0.35);o.x=_pp.x;o.z=_pp.z}
function melee(w){player.fireCD=w.rate;player.lastShot=time;combo=time-comboT>0.9?0:(combo+1)%3;comboT=time;player.punchT=0.28;player.punchK=combo;player.yaw=camYaw;
  const fx=Math.sin(player.yaw),fz=Math.cos(player.yaw),heavy=combo===2,dmg=w.dmg*(heavy?1.6:1),R=w.range;let hit=false;
  const inFront=(x,z)=>{const dx=x-player.pos.x,dz=z-player.pos.z,d=Math.hypot(dx,dz);if(d>R+0.4||d<0.01)return null;if((dx*fx+dz*fz)/d<0.4)return null;return{d,dx:dx/d,dz:dz/d}};
  for(const g of goons){if(g.dead)continue;const r=inFront(g.x,g.z);if(!r)continue;hit=true;const kill=g.hp-dmg<=0;
    damageGoon(g,dmg,true,kill?{vx:r.dx*(heavy?8:4),vy:heavy?4:2.5,vz:r.dz*(heavy?8:4)}:null);if(!kill){g.stagger=heavy?0.9:0.4;knock(g,r,heavy?1.3:0.5)}}
  for(const p of peds){if(p.dead||p.hidden)continue;const r=inFront(p.x,p.z);if(!r)continue;hit=true;if(talk&&talk.obj===p)closeTalk();p.hp-=dmg;
    if(p.hp<=0)killPed(p,true,{vx:r.dx*(heavy?7:4),vy:3,vz:r.dz*(heavy?7:4)});else{p.stagger=heavy?0.8:0.35;if(p.fight||(!p.female&&Math.random()<0.5)){p.fight=true;p.flee=0;knock(p,r,0.4)}else p.flee=7}}
  if(w.id!=='fists')for(const v of vehicles){if(v===player.vehicle||v.wrecked)continue;const r=inFront(v.pos.x,v.pos.z);if(r&&r.d<v.s.len/2+R){damageVehicle(v,w.dmg*0.5,'player');sparks(player.pos.x+fx*1.6,1,player.pos.z+fz*1.6,3);hit=true;break}}
  if(hit){noise(0.09,w.id==='knife'?2600:w.id==='bat'?1100:650,0.5,2);shake=Math.max(shake,heavy?0.16:0.07);hitMark()}else noise(0.1,2400,0.08,1);
  panic(player.pos.x,player.pos.z,12)}
function updPedFight(p,dt){const dx=player.pos.x-p.x,dz=player.pos.z-p.z,d=Math.hypot(dx,dz);
  if(player.vehicle||player.dead||d>25){p.fight=false;return false}
  p.yaw=Math.atan2(dx,dz);p.h.g.visible=true;
  if(p.stagger>0){p.stagger-=dt;animHuman(p.h,0,0,false);p.h.armL.rotation.x=p.h.armR.rotation.x=-0.5}
  else if(d>1.3){const sp=3.8;_pp.x=p.x+dx/d*sp*dt;_pp.z=p.z+dz/d*sp*dt;pushCircle(_pp,0.35);p.x=_pp.x;p.z=_pp.z;p.phase+=dt*10;animHuman(p.h,p.phase,1,false);p.h.armL.rotation.x=p.h.armR.rotation.x=-0.9}
  else{p.punchCD-=dt;animHuman(p.h,0,0,false);p.h.armL.rotation.x=p.h.armR.rotation.x=-0.9;if(p.punchCD<=0){p.punchCD=RR(0.8,1.3);p.punchT=0.28;playerDamage(5);noise(0.08,700,0.3,2)}}
  if(p.punchT>0){p.punchT-=dt;punchAnim(p.h,p.punchT,Math.random()<0.5?0:1,'fists')}
  p.h.g.position.set(p.x,groundH(p.x,p.z),p.z);p.h.g.rotation.y=p.yaw;return true}

/* grenades */
const grenades=[];
function throwGrenade(){const d=camDir().clone();d.y+=0.32;d.normalize();const p=player.human.armR.localToWorld(_v2.set(0,-0.6,0)).clone();
  const m=new THREE.Mesh(GEO.sph,M('#4b6b2a'));m.scale.setScalar(0.15);m.position.copy(p);m.castShadow=true;scene.add(m);grenades.push({m,p,v:d.multiplyScalar(18),t:0});player.punchT=0.28;player.punchK=0}
function updateGrenades(dt){for(let i=grenades.length-1;i>=0;i--){const g=grenades[i];g.t+=dt;g.v.y-=20*dt;g.p.addScaledVector(g.v,dt);
  const gh=groundH(g.p.x,g.p.z)+0.15;if(g.p.y<gh){g.p.y=gh;g.v.y*=-0.35;g.v.x*=0.6;g.v.z*=0.6}
  _pp.x=g.p.x;_pp.z=g.p.z;if(pushCircle(_pp,0.15)){g.p.x=_pp.x;g.p.z=_pp.z;if(pnx)g.v.x*=-0.4;if(pnz)g.v.z*=-0.4}
  g.m.position.copy(g.p);g.m.rotation.x+=dt*8;if(g.t>2.6){scene.remove(g.m);grenades.splice(i,1);boom(g.p.x,Math.max(0.6,g.p.y),g.p.z,true,null)}}}

/* weapon wheel */
const WICON={fists:'<circle cx="16" cy="13" r="8"/><rect x="9" y="17" width="14" height="8" rx="2"/>',bat:'<rect x="2" y="12" width="28" height="5" rx="2.5" transform="rotate(-30 16 14)"/>',
  knife:'<path d="M9 16 L24 10 L31 12 L24 17 Z"/><rect x="1" y="15" width="9" height="5" rx="1"/>',pistol:'<path d="M3 9h23v6H14v9H8v-9H3z"/>',
  revolver:'<path d="M2 10h21v5H15v9H9v-9H2z"/><circle cx="15" cy="12.5" r="4.2"/>',smg:'<path d="M1 9h27v6H19v9h-5v-9H9v4H5v-4H1z"/>',
  shotgun:'<rect x="1" y="10" width="30" height="4"/><path d="M1 14h10l-2 8H3z"/>',rifle:'<path d="M1 10h30v4H20v8h-4v-8H9l-3 7H2l2-7H1z"/>',
  sniper:'<rect x="1" y="13" width="30" height="3"/><rect x="9" y="7" width="11" height="4" rx="1"/><path d="M1 16h9l-2 7H2z"/>',
  minigun:'<rect x="7" y="8" width="24" height="10" rx="2"/><rect x="0" y="10" width="8" height="6"/><rect x="13" y="18" width="5" height="6"/>',
  rocket:'<rect x="1" y="10" width="28" height="7" rx="3.5"/><path d="M27 9l5 4.5-5 4.5z"/><rect x="12" y="17" width="4" height="7"/>',
  grenade:'<circle cx="16" cy="17" r="8.5"/><rect x="13" y="4" width="6" height="6" rx="1"/><rect x="18" y="5" width="7" height="2.5"/>'};
let wheelOpen=false,wheelMode=null,wheelSel=0,wheelT=0;const wheelVec={x:0,y:0};
function buildWheel(){const box=$('wslots');let h='';WEAPONS.forEach((w,i)=>{const a=i/NW*Math.PI*2;
    h+=`<div class="ws" data-i="${i}" style="left:${50+Math.sin(a)*38}%;top:${50-Math.cos(a)*38}%"><svg viewBox="0 0 32 26" width="40" height="32" fill="currentColor">${WICON[w.id]}</svg><span>${w.short}</span><em></em></div>`});
  box.innerHTML=h;box.querySelectorAll('.ws').forEach(el=>el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const i=+el.dataset.i;if(player.owned[i]){wheelSel=i;closeWheel(true)}else{wheelSel=i;renderWheel()}}));
  $('wheel').addEventListener('pointerdown',e=>{if(e.target.id==='wheel'||e.target.id==='wheelRing')closeWheel(false)})}
function ammoTxt(i){const w=WEAPONS[i];if(w.melee)return'';const r=player.res[i];if(w.thrown)return'×'+(player.mags[i]+r);return player.mags[i]+' / '+(r===Infinity?'∞':r)}
function renderWheel(){document.querySelectorAll('#wslots .ws').forEach(el=>{const i=+el.dataset.i;el.classList.toggle('own',player.owned[i]);el.classList.toggle('cur',i===player.weapon);el.classList.toggle('sel',i===wheelSel);
    el.querySelector('em').textContent=player.owned[i]?ammoTxt(i):'🔒'});
  const w=WEAPONS[wheelSel];$('wname').textContent=w.name;$('wammo').textContent=player.owned[wheelSel]?(w.melee?(w.id==='fists'?'Punch combo: jab · jab · kick':'Melee weapon'):ammoTxt(wheelSel)):'Not owned yet: find it or buy it at the gun shop';
  $('whelp').textContent=isTouch?'Tap a weapon':wheelMode==='hold'?'Move the mouse, release TAB':'Scroll to choose · click to pick'}
function openWheel(mode){if(player.vehicle||player.dead||talk)return;wheelOpen=true;wheelMode=mode;wheelSel=player.weapon;wheelVec.x=wheelVec.y=0;wheelT=performance.now()+1100;mouseL=false;renderWheel();$('wheel').classList.remove('hidden')}
function closeWheel(apply){if(!wheelOpen)return;wheelOpen=false;$('wheel').classList.add('hidden');if(apply&&player.owned[wheelSel])setWeapon(wheelSel)}
function wheelStep(d){for(let k=1;k<=NW;k++){const i=(wheelSel+d*k+NW*10)%NW;if(player.owned[i]){wheelSel=i;break}}wheelT=performance.now()+1100;renderWheel();noise(0.03,3000,0.06,1)}
function wheelAim(mx,my){wheelVec.x+=mx;wheelVec.y+=my;const l=Math.hypot(wheelVec.x,wheelVec.y);if(l>120){wheelVec.x*=120/l;wheelVec.y*=120/l}
  if(l>25){let a=Math.atan2(wheelVec.x,-wheelVec.y);if(a<0)a+=Math.PI*2;const i=Math.round(a/(Math.PI*2)*NW)%NW;if(i!==wheelSel){wheelSel=i;renderWheel()}}}

/* rockets */
const rockets=[];
function spawnRocket(pos,dir,byP,speed){const m=new THREE.Group();const b=new THREE.Mesh(GEO.cyl,M('#556b2f'));b.scale.set(0.11,0.8,0.11);m.add(b);
  const gl=new THREE.Mesh(GEO.sph,MBasic('#ffb347'));gl.scale.setScalar(0.18);gl.position.y=-0.45;m.add(gl);
  m.position.copy(pos);m.quaternion.setFromUnitVectors(_v.set(0,1,0),dir);scene.add(m);rockets.push({m,pos:pos.clone(),dir:dir.clone(),t:0,byP,speed,trail:0});noise(0.4,900,0.35,2)}
function updateRockets(dt){for(let i=rockets.length-1;i>=0;i--){const r=rockets[i];r.t+=dt;const step=r.speed*dt;
  let hitT=null;if(r.t>0.03){const h=raycastAll(r.pos,r.dir,step,0);if(h.type!=='none')hitT=h.t}
  if(r.dir.y<0){const tg=(r.pos.y-0.05)/-r.dir.y;if(tg<step&&(hitT===null||tg<hitT))hitT=tg}
  if(hitT!==null||r.t>4){const t=hitT===null?0:hitT;const x=r.pos.x+r.dir.x*t,y=r.pos.y+r.dir.y*t,z=r.pos.z+r.dir.z*t;scene.remove(r.m);rockets.splice(i,1);boom(x,Math.max(0.5,y),z,r.byP,null);continue}
  r.pos.addScaledVector(r.dir,step);r.m.position.copy(r.pos);r.trail-=dt;if(r.trail<=0){r.trail=0.025;puff(r.pos.clone(),0xdddddd,0.22)}}}

/* ================= effects ================= */
const fxList=[];
function addFx(mesh,ttl,upd){scene.add(mesh);fxList.push({mesh,t:0,ttl,upd})}
function updateFx(dt){for(let i=fxList.length-1;i>=0;i--){const f=fxList[i];f.t+=dt;const k=Math.min(1,f.t/f.ttl);f.upd(f.mesh,k,dt);
  if(f.t>=f.ttl){scene.remove(f.mesh);if(f.mesh.geometry&&f.mesh.geometry.userData.tmp)f.mesh.geometry.dispose();if(f.mesh.material&&f.mesh.material.transparent&&!f.mesh.material.userData.shared)f.mesh.material.dispose();fxList.splice(i,1)}}}
function tracer(a,b,color){const g=new THREE.BufferGeometry().setFromPoints([a,b]);g.userData.tmp=true;
  const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:0.9}));addFx(l,0.07,(m,k)=>{m.material.opacity=0.9*(1-k)})}
function flash(p){const m=new THREE.Mesh(GEO.sph,new THREE.MeshBasicMaterial({color:0xfff2a8,transparent:true,depthWrite:false}));m.position.copy(p);m.scale.setScalar(0.16);addFx(m,0.05,(m,k)=>{m.material.opacity=1-k})}
function puff(p,color,size){const m=new THREE.Mesh(GEO.sph,new THREE.MeshLambertMaterial({color,transparent:true,opacity:0.8,depthWrite:false}));m.position.copy(p);
  addFx(m,0.45,(m,k)=>{m.scale.setScalar(size*(1+k*3));m.material.opacity=0.8*(1-k);m.position.y+=0.01})}
function smoke(x,y,z,col){const m=new THREE.Mesh(GEO.sph,new THREE.MeshLambertMaterial({color:col||0x444444,transparent:true,opacity:0.55,depthWrite:false}));m.position.set(x,y,z);
  addFx(m,1.4,(m,k,dt)=>{m.scale.setScalar(0.4+k*1.6);m.position.y+=dt*2.2;m.material.opacity=0.55*(1-k)})}
const sparkMat=new THREE.MeshBasicMaterial({color:0xffd27a});sparkMat.userData.shared=true;
function sparks(x,y,z,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(GEO.sph,sparkMat);m.scale.setScalar(0.06);m.position.set(x,y,z);const vx=RR(-5,5),vy=RR(1,6),vz=RR(-5,5);
  addFx(m,0.4,(m,k,dt)=>{m.position.x+=vx*dt;m.position.y+=(vy-k*10)*dt;m.position.z+=vz*dt})}}
let hitT=0;function hitMark(){hitT=0.12;$('cross').classList.add('hit')}

/* pickups */
const pickups=[];const cashGeo=new THREE.BoxGeometry(0.55,0.3,0.28),wpGeo=new THREE.BoxGeometry(0.25,0.25,0.9);
function dropCash(x,z,amt){const m=new THREE.Mesh(cashGeo,MBasic('#38d27a'));m.position.set(x,0.6,z);scene.add(m);pickups.push({m,x,z,amt,t:0,kind:'cash'})}
function dropWeapon(x,z,wi,ammo){const m=new THREE.Mesh(wpGeo,MBasic(WEAPONS[wi].heavy?'#9acd32':'#7fb8ff'));m.position.set(x,0.6,z);scene.add(m);pickups.push({m,x,z,wi,ammo,t:0,kind:'weapon'})}
function updatePickups(dt){for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.t+=dt;p.m.rotation.y+=dt*3;p.m.position.y=0.6+groundH(p.x,p.z)+Math.sin(p.t*4)*0.12;
  const P=playerP();if(!player.dead&&Math.hypot(P.x-p.x,P.z-p.z)<(player.vehicle?2.6:1.4)){
    if(p.kind==='cash'){player.cash+=p.amt;floatMsg('+₹'+p.amt)}else{const had=player.owned[p.wi];giveWeapon(p.wi,p.ammo);floatMsg((had?'+Ammo: ':'New gun: ')+WEAPONS[p.wi].name)}
    noise(0.05,4000,0.15,1);scene.remove(p.m);pickups.splice(i,1)}
  else if(p.t>50){scene.remove(p.m);pickups.splice(i,1)}}}


/* ---------- combat: lock-on, cover, knockdown, climbing ---------- */
let lockT=null;
function updateLockOn(dt){const ring=$('lockRing');if(!aiming||player.vehicle||player.dead||scoped()){lockT=null;ring.style.display='none';return}
  if(lockT&&(lockT.dead||lockT.hidden||Math.hypot(lockT.x-player.pos.x,lockT.z-player.pos.z)>45))lockT=null;
  if(!lockT){let best=null,bs=-9;const fx=Math.sin(camYaw),fz=Math.cos(camYaw);
    const cand=o=>{const dx=o.x-player.pos.x,dz=o.z-player.pos.z,d=Math.hypot(dx,dz);if(d>40||d<0.5)return;const dot=(dx*fx+dz*fz)/d;if(dot<0.55)return;const s=dot*2-d/40+(o.aggro?0.6:0);
      if(s>bs&&los(player.pos.x,player.pos.y+1.5,player.pos.z,o.x,(o.y!==undefined?o.y:groundH(o.x,o.z))+1.3,o.z)){bs=s;best=o}};
    for(const g of goons)if(!g.dead&&g.h.g.visible)cand(g);if(!best)for(const p of peds)if(!p.dead&&!p.hidden&&p.h.g.visible)cand(p);lockT=best}
  if(!lockT){ring.style.display='none';return}
  const ty=(lockT.y!==undefined?lockT.y:groundH(lockT.x,lockT.z))+1.25,dx=lockT.x-camera.position.x,dz=lockT.z-camera.position.z,dy=ty-camera.position.y;
  const k=Math.min(1,dt*10);camYaw+=angDiff(camYaw,Math.atan2(dx,dz))*k;camPitch+=(Math.atan2(dy,Math.hypot(dx,dz))-camPitch)*k;
  _v.set(lockT.x,ty,lockT.z).project(camera);ring.style.display='block';ring.style.left=((_v.x+1)/2*innerWidth)+'px';ring.style.top=((1-_v.y)/2*innerHeight)+'px'}
