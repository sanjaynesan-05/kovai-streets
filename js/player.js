/* Kovai Streets: player.js
 * On-foot movement, crouch/cover/vault/knockdown, vehicle entry animation, camera
 * Classic script, loaded in order by index.html (11 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= player on foot ================= */
function tryEnterExit(){if(player.dead)return;if(player.vehicle){exitVehicle();return}const v=nearestVehicle();if(v)enterVehicle(v)}
function nearestVehicle(){let best=null,bd=1e9;for(const v of vehicles){if(v.wrecked)continue;const d=Math.hypot(v.pos.x-player.pos.x,v.pos.z-player.pos.z);if(d<v.s.len/2+2.3&&d<bd){best=v;bd=d}}return best}
function enterVehicle(v){if(talk)closeTalk();player.vehicle=v;if(v.ai&&v.ai.reckless&&mission&&mission.target===v)missionDone();v.ai=null;if(v.policeAI){v.policeAI=null;addWanted(2)}
  if(v.rider){v.rider.g.visible=false}player.human.g.visible=true;if(!v.s.two){const fx=Math.sin(v.heading),fz=Math.cos(v.heading),o=v.s.w/2;EA={t:0,dur:0.35,ax:player.pos.x,az:player.pos.z,bx:v.pos.x+fz*o,bz:v.pos.z-fx*o,y:player.pos.y,hide:true,v}}camYaw=v.heading;player.reloading=0;aiming=false;noise(0.08,700,0.2,1);if(v.type==='tank')floatMsg(isTouch?'FIRE: cannon · swipe to aim the turret':'Left-click: fire cannon · mouse aims the turret')}
function exitVehicle(){const v=player.vehicle;if(!v)return;player.vehicle=null;const fx=Math.sin(v.heading),fz=Math.cos(v.heading),off=v.s.w/2+0.9;
  player.pos.set(v.pos.x+fz*off,v.y,v.pos.z-fx*off);_pp.x=player.pos.x;_pp.z=player.pos.z;pushCircle(_pp,0.4,v.y);player.human.g.rotation.z=0;player.pos.x=_pp.x;player.pos.z=_pp.z;
  player.human.g.visible=!player.dead;player.yaw=v.heading;camYaw=v.heading;if(!v.s.two&&!player.dead)EA={t:0,dur:0.3,ax:v.pos.x+fz*v.s.w*0.25,az:v.pos.z-fx*v.s.w*0.25,hide:false}}
function updateFoot(dt){const f=[Math.sin(camYaw),Math.cos(camYaw)],r=[-Math.cos(camYaw),Math.sin(camYaw)];const frozen=!!talk||player.down>0;
  let fw=frozen?0:(K.KeyW?1:0)-(K.KeyS?1:0),sd=frozen?0:(K.KeyD?1:0)-(K.KeyA?1:0);if(joy.on&&!frozen){fw=-joy.y;sd=joy.x}let mx=f[0]*fw+r[0]*sd,mz=f[1]*fw+r[1]*sd;const ml=Math.hypot(mx,mz);
  const moving=ml>0.12;const run=!player.crouch&&(K.ShiftLeft||K.ShiftRight||(joy.on&&Math.hypot(joy.x,joy.y)>0.92));const W=WEAPONS[player.weapon];const sp=player.swim?(run?3.6:2.4):player.crouch?2.0:aiming?2.6:run?7.6:(W.heavy)?3.6:4.3;
  if(moving){const amt=joy.on?Math.min(1,ml):1;mx/=ml;mz/=ml;player.pos.x+=mx*sp*amt*dt;player.pos.z+=mz*sp*amt*dt}
  _pp.x=player.pos.x;_pp.z=player.pos.z;const bumped=pushCircle(_pp,0.4,player.pos.y),bnx=pnx,bnz=pnz;
  for(const v of vehicles){if(Math.abs(v.pos.x-_pp.x)>8||Math.abs(v.pos.z-_pp.z)>8||Math.abs(v.y-player.pos.y)>2)continue;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
    for(const off of v.s.circ){const cx=v.pos.x+fx*off,cz=v.pos.z+fz*off,dx=_pp.x-cx,dz=_pp.z-cz,d=Math.hypot(dx,dz),mn=v.s.cr+0.4;if(d<mn&&d>1e-4){_pp.x+=dx/d*(mn-d);_pp.z+=dz/d*(mn-d)}}}
  player.pos.x=_pp.x;player.pos.z=_pp.z;
  const swim=isDeep(player.pos.x,player.pos.z);player.swim=swim;const gh=swim?humanY(player.pos.x,player.pos.z,player.pos.y):footH(player.pos.x,player.pos.z,player.pos.y);if(swim)player.crouch=false;
  if(swim){player.vy=0;player.pos.y+=(gh-player.pos.y)*Math.min(1,dt*4)}else player.vy-=24*dt;player.pos.y+=player.vy*dt;
  if(player.pos.y<=gh){player.pos.y=gh;player.vy=0;player.onGround=true}else player.onGround=player.pos.y-gh<0.05;
  if(swim)player.onGround=false;
  if(K.Space&&player.onGround&&!frozen){if(player.crouch)player.crouch=false;else{const vh=bumped&&moving?vaultHeight(player.pos.x-bnx*0.7,player.pos.z-bnz*0.7,player.pos.y):0;if(vh>0){player.vy=Math.sqrt(48*(vh+0.5));player.vaultT=0.55;noise(0.08,500,0.15,2)}else player.vy=7.5;player.onGround=false}}
  const shooting=time-player.lastShot<1.2;
  if(moving||shooting||aiming)player.yaw+=angDiff(player.yaw,camYaw)*Math.min(1,dt*12);
  player.phase+=moving?dt*sp*2.4:0;
  const h=player.human;h.g.position.copy(player.pos);h.g.rotation.y=player.yaw;animHuman(h,player.phase,moving?(run?1.25:0.85):0,(shooting||aiming)&&!W.melee&&!W.thrown);if(W.melee&&(shooting||aiming)){h.armL.rotation.x=h.armR.rotation.x=-1.0}
  h.armR.rotation.z=0;if(player.punchT>0){player.punchT-=dt;punchAnim(h,player.punchT,player.punchK,W.id)}
  if(!player.onGround&&!swim){h.legL.rotation.x=-0.5;h.legR.rotation.x=0.3}
  h.g.rotation.x=0;h.gun.visible=!swim&&W.id!=='fists';if(swim){const ph=time*5;h.armL.rotation.x=-1.6+Math.sin(ph)*1.3;h.armR.rotation.x=-1.6-Math.sin(ph)*1.3;h.legL.rotation.x=Math.sin(ph*2)*0.4;h.legR.rotation.x=-Math.sin(ph*2)*0.4;if(moving){h.g.rotation.x=0.45;player.splashT=(player.splashT||0)-dt;if(player.splashT<=0){player.splashT=0.3;puff(new THREE.Vector3(player.pos.x,0.3,player.pos.z),0xffffff,0.25)}}}
  footExtras(dt,h,moving,run,swim);
  if(player.reloading>0){player.reloading-=dt;if(player.reloading<=0)finishReload()}
  if(mouseL&&W.auto&&!talk&&!consoleOpen&&!wheelOpen)fire()}

/* ================= camera ================= */
const _tgt=new THREE.Vector3(),_f3=new THREE.Vector3();
function scoped(){return aiming&&!player.vehicle&&!player.dead&&WEAPONS[player.weapon].scope}
function updateCamera(dt){let dist,fovT=65;const sc=scoped();
  if(player.vehicle){const v=player.vehicle;
    if(time-lastMouseT>1.3&&v.type!=='tank'){camYaw+=angDiff(camYaw,v.heading)*Math.min(1,dt*2.8);camPitch+=(-0.2-camPitch)*Math.min(1,dt*2)}
    _tgt.set(v.pos.x,v.pos.y+v.s.camH*0.6,v.pos.z);dist=v.s.cam+Math.abs(v.speed)*0.06;fovT=65+Math.min(14,Math.abs(v.speed)*0.3)}
  else if(sc){_tgt.set(player.pos.x,player.pos.y+(player.crouch?1.2:1.66),player.pos.z);dist=0.05;fovT=14}
  else{_tgt.set(player.pos.x-Math.cos(camYaw)*0.6,player.pos.y+(player.crouch?1.15:1.6),player.pos.z+Math.sin(camYaw)*0.6);dist=aiming?2.3:4.2;if(aiming)fovT=50}
  if(!player.vehicle&&!player.dead)player.human.g.visible=!sc;$('scope').classList.toggle('hidden',!sc);
  _f3.set(Math.sin(camYaw)*Math.cos(camPitch),Math.sin(camPitch),Math.cos(camYaw)*Math.cos(camPitch));
  _ld.copy(_f3).negate();_ray.origin.copy(_tgt);_ray.direction.copy(_ld);
  const list=queryBoxes(_tgt.x,_tgt.z,dist+1);for(const b of list){_box.min.set(b.minX-0.2,b.y0-0.2,b.minZ-0.2);_box.max.set(b.maxX+0.2,b.h+0.2,b.maxZ+0.2);
    if(_box.containsPoint(_tgt))continue;if(_ray.intersectBox(_box,_hp)){const t=_hp.distanceTo(_tgt);if(t<dist)dist=Math.max(0.05,t-0.2)}}
  camera.position.copy(_tgt).addScaledVector(_f3,-dist);{const gy=Math.max(groundH(camera.position.x,camera.position.z),(camera.position.x>SHORE-4||inLake(camera.position.x,camera.position.z))?0.25:-99)+0.45;if(camera.position.y<gy)camera.position.y=gy}
  if(shake>0){camera.position.x+=RR(-1,1)*shake*0.5;camera.position.y+=RR(-1,1)*shake*0.5;shake=Math.max(0,shake-dt*1.8)}
  camera.lookAt(_v.copy(_tgt).addScaledVector(_f3,30));
  if(Math.abs(camera.fov-fovT)>0.1){camera.fov+=(fovT-camera.fov)*Math.min(1,dt*(sc?20:8));camera.updateProjectionMatrix()}}
let orbit=0;
function attractCam(dt){orbit+=dt*0.05;const cx=-37,cz=40;camera.position.set(cx+Math.sin(orbit)*170,75,cz+Math.cos(orbit)*170);camera.lookAt(cx,10,cz)}


function toggleCrouch(){if(player.vehicle||player.dead||player.swim)return;player.crouch=!player.crouch;noise(0.05,600,0.08,2)}
function knockDown(t){if(player.vehicle||player.dead)return;player.down=Math.max(player.down||0,t);player.crouch=false}
function footH(x,z,y){let h=surfaceH(x,z,y);const l=queryBoxes(x,z,0.1);for(let i=0;i<l.length;i++){const b=l[i];if(x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ&&b.h>h&&b.h>0&&y>=b.h-0.7&&b.h-b.y0<80)h=b.h}return h}
function vaultHeight(x,z,y){const l=queryBoxes(x,z,0.4);let best=0;for(let i=0;i<l.length;i++){const b=l[i];if(x<b.minX-0.4||x>b.maxX+0.4||z<b.minZ-0.4||z>b.maxZ+0.4)continue;const dh=b.h-y;if(dh>0.4&&dh<2.3&&b.y0<y+0.5)best=Math.max(best,dh)}return best}
function footExtras(dt,h,moving,run,swim){
  if(moving&&player.onGround&&!swim){const st=Math.floor(player.phase/Math.PI);if(st!==player.stepN){player.stepN=st;noise(0.05,run?1100:750,(run?0.08:0.045)*(player.crouch?0.4:1),3)}}
  if(player.crouch&&!swim){h.g.position.y-=0.4;const s=moving?Math.sin(player.phase)*0.3:0;h.legL.rotation.x=-1.2+s;h.legR.rotation.x=-0.5-s;if(h.shinL){h.shinL.rotation.x=1.8;h.shinR.rotation.x=1.2}}
  else if(moving&&run&&player.onGround&&!swim){h.g.rotation.x=0.14;if(time-player.lastShot>1.2){h.armL.rotation.x*=1.3;h.armR.rotation.x*=1.3}}
  player.inCover=false;if(player.crouch){const l=queryBoxes(player.pos.x,player.pos.z,1.3);
    for(const b of l){if(b.h-player.pos.y<0.9||b.y0>player.pos.y+1)continue;const cx=clamp(player.pos.x,b.minX,b.maxX),cz=clamp(player.pos.z,b.minZ,b.maxZ);if(Math.hypot(player.pos.x-cx,player.pos.z-cz)<1.3){player.inCover=true;break}}
    if(!player.inCover)for(const v of vehicles){if(v.s.two||Math.abs(v.y-player.pos.y)>2)continue;if(Math.hypot(v.pos.x-player.pos.x,v.pos.z-player.pos.z)<v.s.len/2+1.3){player.inCover=true;break}}}
  if(player.vaultT>0){player.vaultT-=dt;h.armL.rotation.x=h.armR.rotation.x=-2.7}
  if(player.down>0){player.down-=dt;h.g.rotation.x=-Math.PI/2;h.g.position.y=player.pos.y+0.2;h.armL.rotation.x=-2.6;h.armR.rotation.x=-2.1;h.legL.rotation.x=0.15;h.legR.rotation.x=-0.1;h.gun.visible=false}}
let EA=null;
function tickEA(dt){const e=EA;e.t+=dt;const k=Math.min(1,e.t/e.dur),h=player.human;
  if(e.hide){if(player.vehicle!==e.v){EA=null;return}h.g.visible=true;h.g.position.set(e.ax+(e.bx-e.ax)*k,e.y,e.az+(e.bz-e.az)*k);h.g.rotation.set(0,Math.atan2(e.bx-e.ax,e.bz-e.az),0);animHuman(h,e.t*12,0.7,false);if(k>=1){h.g.visible=false;EA=null}}
  else{if(player.vehicle||player.dead){EA=null;return}h.g.position.set(e.ax+(player.pos.x-e.ax)*k,player.pos.y,e.az+(player.pos.z-e.az)*k);if(k>=1)EA=null}}
