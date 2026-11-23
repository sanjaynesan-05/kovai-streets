/* Kovai Streets: actors.js
 * Player state and weapons, pedestrians, gangs, wanderers
 * Classic script, loaded in order by index.html (7 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= player ================= */
const WEAPONS=[
  {id:'fists',name:'FISTS',short:'FISTS',melee:true,auto:true,mag:0,rate:0.3,dmg:22,range:1.9,gs:[1,1,1],gc:'#1d1d1d'},
  {id:'bat',name:'CRICKET BAT',short:'BAT',melee:true,auto:true,mag:0,rate:0.55,dmg:48,range:2.5,gs:[1.6,1.75,0.7],gc:'#c8a165'},
  {id:'knife',name:'KNIFE',short:'KNIFE',melee:true,auto:true,mag:0,rate:0.36,dmg:62,range:2.0,gs:[0.45,0.75,0.45],gc:'#cfd6dc'},
  {id:'pistol',name:'PISTOL',short:'PISTOL',mag:17,rate:0.18,dmg:34,spread:0.005,auto:false,reload:1.1,snd:[0.16,2800,0.45],gs:[1,1,1],gc:'#1d1d1d',kick:0.008},
  {id:'revolver',name:'REVOLVER',short:'REVOLVER',mag:6,rate:0.45,dmg:75,spread:0.004,auto:false,reload:1.9,snd:[0.3,2000,0.62],gs:[1.1,1.25,1.1],gc:'#8a8f94',kick:0.03},
  {id:'smg',name:'SMG',short:'SMG',mag:32,rate:0.07,dmg:17,spread:0.024,auto:true,reload:1.4,snd:[0.09,3200,0.3],gs:[1.1,1.3,1.1],gc:'#2b2b2b',kick:0.004},
  {id:'shotgun',name:'SHOTGUN',short:'SHOTGUN',mag:8,rate:0.85,dmg:20,pellets:9,spread:0.065,auto:false,reload:2.2,snd:[0.4,1400,0.65],gs:[1.25,1.9,1.25],gc:'#5a3d22',kick:0.03},
  {id:'rifle',name:'ASSAULT RIFLE',short:'RIFLE',mag:30,rate:0.1,dmg:26,spread:0.012,auto:true,reload:1.8,snd:[0.14,2300,0.42],gs:[1.15,2.0,1.15],gc:'#1d1d1d',kick:0.006},
  {id:'sniper',name:'SNIPER RIFLE',short:'SNIPER',mag:5,rate:1.1,dmg:260,spread:0.0004,auto:false,reload:2.4,snd:[0.5,1800,0.6],gs:[1,2.7,1],gc:'#2f3b2f',kick:0.04,scope:true},
  {id:'minigun',name:'MINIGUN',short:'MINIGUN',mag:500,rate:0.04,dmg:20,spread:0.03,auto:true,reload:4,snd:[0.07,2600,0.26],gs:[2.4,2.0,2.4],gc:'#5b5b5b',kick:0.002,heavy:true},
  {id:'rocket',name:'ROCKET LAUNCHER',short:'ROCKET',mag:1,rate:0.9,dmg:0,rocket:true,auto:false,reload:1.5,snd:[0.5,700,0.5],gs:[2.2,2.4,2.2],gc:'#4b5d2a',kick:0.03,heavy:true},
  {id:'grenade',name:'GRENADES',short:'GRENADE',mag:1,rate:0.8,thrown:true,auto:false,reload:0.45,snd:[0.12,1500,0.15],gs:[1.7,0.45,1.7],gc:'#4b6b2a',kick:0}];
const WI=id=>WEAPONS.findIndex(w=>w.id===id),NW=WEAPONS.length;
const player={pos:new THREE.Vector3(-31,0,-157.5),vy:0,onGround:true,hp:100,armor:0,cash:500,vehicle:null,weapon:3,
  owned:WEAPONS.map(w=>w.id==='fists'||w.id==='pistol'),mags:WEAPONS.map(w=>w.id==='pistol'?17:0),res:WEAPONS.map(w=>w.melee||w.id==='pistol'?Infinity:0),punchT:0,punchK:0,
  reloading:0,fireCD:0,tankCD:0,lastDmg:-99,lastShot:-99,yaw:1,dead:false,deadT:0,phase:0,human:null};
let camYaw=1.0,camPitch=-0.12,lastMouseT=-99,aiming=false,shake=0,cheatIron=false,rep=0;
function giveWeapon(i,ammo){const w=WEAPONS[i];if(!player.owned[i]){player.owned[i]=true;const m=Math.min(w.mag,ammo);player.mags[i]=m;ammo-=m}
  if(player.res[i]!==Infinity)player.res[i]+=ammo}
function setWeapon(i){if(!player.owned[i]||i===player.weapon)return;player.weapon=i;player.reloading=0;setGun();noise(0.05,1200,0.12,1)}
function cycleWeapon(d){for(let k=1;k<=NW;k++){const i=(player.weapon+d*k+NW*10)%NW;if(player.owned[i]){setWeapon(i);return}}}
function setGun(){const g=player.human.gun;const w=WEAPONS[player.weapon];g.scale.set(w.gs[0],w.gs[1],w.gs[2]);g.material=M(w.gc);g.visible=w.id!=='fists'}

/* ================= NPCs ================= */
const peds=[],goons=[];

function pedPos(p){return geoPedPos(p)}
function placePed(p,minD){
  geoPlacePed(p,minD);p.off=RR(-1.2,1.2);p.dead=false;p.fly=null;p.flee=0;p.talk=false;p.hp=50;p.fight=false;p.stagger=0;p.punchCD=1;p.punchT=0;p.hidden=false;p.inV=null;p.h.g.rotation.x=0;p.h.g.rotation.z=0;p.h.g.visible=true;[p.x,p.z]=pedPos(p)}
const NAMES_F=['Lakshmi','Priya','Anitha','Kavitha','Saranya','Revathi','Nandhini','Shalini'],NAMES_M=['Murugan','Karthik','Senthil','Ravi','Prakash','Arun','Ganesh','Vignesh'];
function spawnPed(){const female=Math.random()<0.48;const shirt=rpick(SHIRTS);const lower=female?rpick(['saree','saree','kurta','kurta','pants']):rpick(['pants','pants','pants','veshti','lungi','lungi']);
  const h=makeHuman({shirt,pants:lower==='saree'?shirt:lower==='lungi'?rpick(LUNGI):lower==='kurta'?rpick(['#f4f1e8','#fefae0','#2b2d42','#e9d8a6']):lower==='veshti'?'#f4f1e8':rpick(PANTS),lower,skin:rpick(SKIN),hair:Math.random()<0.15?'#c9c9c9':'#1b1410',long:female,
    dupatta:rpick(['#f4f1e8','#e63946','#ffd166','#9b5de5','#06d6a0']),border:rpick(['#d4a017','#c1121f','#2b9348']),sleeve:lower==='veshti'||lower==='lungi'?rpick(['short','long']):undefined});
  const um=new THREE.Group();const pl=new THREE.Mesh(GEO.cyl,M('#333'));pl.scale.set(0.02,0.6,0.02);pl.position.y=1.95;um.add(pl);const cn=new THREE.Mesh(GEO.cone8,M(rpick(['#1d3557','#e63946','#2a9d8f','#111111','#6d597a','#f4a261'])));cn.scale.set(0.7,0.3,0.7);cn.position.y=2.3;cn.castShadow=true;um.add(cn);um.position.set(0.15,0,0.05);um.visible=false;h.g.add(um);
  const p={umb:um,hasUmb:Math.random()<0.7,h,female,name:female?rpick(NAMES_F):rpick(NAMES_M),cx:0,cz:0,s:0,dir:1,off:0,dead:false,deadT:0,flee:0,phase:Math.random()*6,x:0,z:0,yaw:0,speed:RR(1.1,1.5),fly:null};placePed(p,0);
  peds.push(p);return p}
function killPed(p,byPlayer,fl){if(p.dead||p.hidden)return;p.dead=true;p.deadT=0;p.talk=false;if(talk&&talk.obj===p)closeTalk();
  if(fl){p.fly={vx:fl.vx,vy:fl.vy,vz:fl.vz,y:groundH(p.x,p.z)+0.2,spin:RR(6,10)};p.h.armL.rotation.x=-2.6;p.h.armR.rotation.x=-2.2}else poseDead(p.h,groundH(p.x,p.z));
  if(byPlayer){witnessed(p.x,p.z,1);onPedKilled(p)}panic(p.x,p.z,35)}
function flyStep(o,dt){const f=o.fly;o.x+=f.vx*dt;o.z+=f.vz*dt;f.vy-=22*dt;f.y+=f.vy*dt;f.vx*=1-1.2*dt;f.vz*=1-1.2*dt;
  _pp.x=o.x;_pp.z=o.z;if(pushCircle(_pp,0.35)){o.x=_pp.x;o.z=_pp.z;f.vx*=-0.3;f.vz*=-0.3}
  const gy=groundH(o.x,o.z);o.h.g.position.set(o.x,f.y,o.z);o.h.g.rotation.x-=f.spin*dt;o.h.g.rotation.z=Math.sin(time*7+o.x)*0.5;o.h.armL.rotation.x=-2+Math.sin(time*17+o.x)*1.2;o.h.armR.rotation.x=-2-Math.cos(time*15)*1.2;o.h.legL.rotation.x=Math.sin(time*13)*0.9;o.h.legR.rotation.x=-Math.sin(time*11)*0.9;
  if(f.y<=gy+0.22&&f.vy<0){if(f.vy<-7&&!f.b){f.b=1;f.vy*=-0.28;f.spin*=0.5;f.y=gy+0.23}else{o.fly=null;poseDead(o.h,gy)}}}
function panic(x,z,r){for(const p of peds){if(!p.dead&&!p.hidden&&!p.talk&&!p.fight&&Math.abs(p.x-x)<r&&Math.abs(p.z-z)<r){p.flee=7;if(Math.random()<0.5)p.dir*=-1}}}
function updatePeds(dt){const P=playerP();
  for(const p of peds){if(p.hidden)continue;const dx=p.x-P.x,dz=p.z-P.z,far=dx*dx+dz*dz>200*200;
    if(p.dead){if(p.fly){flyStep(p,dt);continue}p.deadT+=dt;if(p.deadT>15&&(far||p.deadT>40))placePed(p,150);continue}
    p.h.g.visible=!far;if(far&&!p.talk){if(dx*dx+dz*dz>420*420)placePed(p,150);/* D2: walkers left far behind reappear near the player */p.s+=p.dir*p.speed*dt;[p.x,p.z]=pedPos(p);continue}
    if(p.fight){if(updPedFight(p,dt))continue}
    if(p.talk){p.yaw+=angDiff(p.yaw,Math.atan2(player.pos.x-p.x,player.pos.z-p.z))*Math.min(1,dt*6);animHuman(p.h,0,0,false);p.h.g.rotation.y=p.yaw;continue}
    p.umb.visible=rainF>0.35&&p.hasUmb;const sp=p.flee>0?5.2:p.speed*(rainF>0.35&&!p.hasUmb?2:1);p.flee-=dt;p.s+=p.dir*sp*dt;const[nx,nz]=pedPos(p);
    if(nx!==p.x||nz!==p.z)p.yaw=Math.atan2(nx-p.x,nz-p.z);p.x=nx;p.z=nz;
    p.phase+=sp*dt*3.2;p.h.g.position.set(p.x,groundH(p.x,p.z),p.z);p.h.g.rotation.y=p.yaw;animHuman(p.h,p.phase,p.flee>0?1.3:0.8,false)}}

const GW={pistol:{rate:[1.0,1.7],dmg:6,acc:1},smg:{rate:[0.35,0.6],dmg:4,acc:0.8},rifle:{rate:[0.6,1.0],dmg:7,acc:1.1}};
const gangSpots=[{i:-1,j:3,sx:1,sz:-1},{i:4,j:4,sx:-1,sz:-1},{i:-3,j:-3,sx:1,sz:1},{i:3,j:-2,sx:-1,sz:1},{i:1,j:4,sx:1,sz:1},{i:-3,j:0,sx:1,sz:-1},{i:2,j:-4,sx:-1,sz:-1}];
function spawnGoon(x,z,spot,aggro,opt){opt=opt||{};const boss=!!opt.boss;
  const cop=!!opt.cop;const h=cop?makeHuman({shirt:'#c2a878',pants:'#b39b6a',lower:'pants',sleeve:'short',skin:rpick(SKIN),band:'#7a5f3a',stache:true,shoe:'#1d1d1d',gun:true}):makeHuman({shirt:boss?(opt.shirt||'#f4f1e8'):rpick(['#141414','#3a0d0d','#1f1f1f','#5b0f0f','#2b2b2b']),pants:boss?'#111':'#202020',lower:'pants',skin:rpick(SKIN),band:boss?'#e8b923':(opt.band||'#c1121f'),gun:true});
  if(boss)h.g.scale.setScalar(1.18);
  const wep=opt.wep||(boss?'rifle':rpick(['pistol','pistol','smg','rifle']));h.gun.scale.set(wep==='pistol'?1:1.15,wep==='pistol'?1:wep==='smg'?1.3:2,wep==='pistol'?1:1.15);
  const g={h,x,z,yaw:Math.random()*6,hp:boss?(opt.hp||650):cop?80:100,dead:false,deadT:0,aggro:!!aggro,shootT:RR(0.8,1.8),phase:0,spot,boss,wep,fly:null,cop};goons.push(g);return g}
function spawnGang(sp){sp.alive=0;const{x:cx,z:cz}=gangCenter(sp);for(let k=0;k<4;k++){spawnGoon(cx+RR(-3,3),cz+RR(-3,3),sp);sp.alive++}sp.respawn=0;sp.st='neutral';sp.kills=0;sp.reinf=false}
/* Gang territory: neutral → suspicious (inside GANG_R) → warning (inside GANG_WARN_R, spoken line) → hostile (stay GANG_WARN_T s, or aim at / hit / shoot near them)
   → cooldown (more than 75 m away; back to neutral after GANG_COOL_T s). Only hangout gangs (g.spot); story-mission enemies keep their own aggro/passive. Never adds wanted stars. */
const GANG_R=30,GANG_WARN_R=16,GANG_WARN_T=6,GANG_COOL_T=60,GANG_WARN=['gang_warn_1','gang_warn_2'];
function gangCenter(sp){return sp.gx!=null?{x:sp.gx,z:sp.gz}:{x:sp.i*CELL+sp.sx*10.5,z:sp.j*CELL+sp.sz*10.5}}/* gx/gz: real-map hangout (geosites.js) */
function gangProvoke(sp){if(sp.st!=='hostile'){sp.st='hostile';say2('gang_attack')}for(const g of goons)if(g.spot===sp&&!g.dead)g.aggro=true}
function updateGangs(dt){const P=playerP();
  for(const sp of gangSpots){if(sp.alive<=0)continue;const c=gangCenter(sp),d=player.dead?999:Math.hypot(P.x-c.x,P.z-c.z);
    if(aiming&&lockT&&lockT.spot===sp&&!lockT.dead)gangProvoke(sp);
    if(sp.st==='hostile'){if(d>75){sp.st='cooldown';sp.coolT=0}continue}
    if(sp.st==='cooldown'){if(d<GANG_R){sp.st='hostile';continue}sp.coolT+=dt;if(sp.coolT>GANG_COOL_T){sp.st='neutral';sp.kills=0;sp.reinf=false;for(const g of goons)if(g.spot===sp)g.aggro=false}continue}
    if(d<GANG_WARN_R){if(sp.st!=='warning'){sp.st='warning';sp.warnT=0;if(time-(sp.warnAt||-99)>20){sp.warnAt=time;say2(rpick(GANG_WARN))}}sp.warnT+=dt;if(sp.warnT>GANG_WARN_T)gangProvoke(sp)}
    else sp.st=d<GANG_R?'suspicious':'neutral'}}
function damageGoon(g,amt,byPlayer,fl){if(g.dead)return;
  if(g.surrender&&!g.surrendered&&g.hp-amt<=g.surrender){g.surrendered=true;g.hp=g.surrender;g.aggro=false;g.passive=true;if(g.cone)g.cone.visible=false;return}/* story bosses that give up instead of dying */g.hp-=amt;g.aggro=true;if(g.spot&&byPlayer!==false)gangProvoke(g.spot);if(g.hp<=0){g.dead=true;g.deadT=0;
    if(g.spot&&byPlayer!==false&&++g.spot.kills>=2&&!g.spot.reinf){const sp=g.spot,c=gangCenter(sp);sp.reinf=true;for(let k=0;k<3;k++){spawnGoon(c.x+RR(-12,12),c.z+RR(-12,12),sp,true);sp.alive++}toast('BACKUP!','The gang called in reinforcements',1.8)}/* repeated attacks bring 3 more, once per fight */
    if(fl)g.fly={vx:fl.vx,vy:fl.vy,vz:fl.vz,y:groundH(g.x,g.z)+0.2,spin:RR(6,10)};else poseDead(g.h,groundH(g.x,g.z));
    if(byPlayer!==false)onGoonKilled(g);if(byPlayer!==false&&g.cop){witnessed(g.x,g.z,1)}else if(byPlayer!==false){dropCash(g.x,g.z,g.boss?RI(1500,2500):RI(80,260));
      if(g.boss||Math.random()<0.38){const id=g.boss?'rocket':g.wep==='smg'?'smg':g.wep==='rifle'?'rifle':rpick(['smg','shotgun','revolver','bat','knife','grenade']);const wi=WI(id);dropWeapon(g.x+RR(-1,1),g.z+RR(-1,1),wi,id==='rocket'?4:id==='shotgun'?16:id==='revolver'?18:id==='grenade'?3:WEAPONS[wi].melee?0:60)}}
    if(g.spot)g.spot.alive--;if(g.mission&&mission&&(g.mission===true||g.mission===mission))mission.left--}}
const _pp={x:0,z:0};
function updateGoons(dt){const P=playerP();
  for(let i=goons.length-1;i>=0;i--){const g=goons[i];
    if(g.dead){if(g.fly){flyStep(g,dt);continue}g.deadT+=dt;if(g.deadT>30){scene.remove(g.h.g);goons.splice(i,1)}continue}
    if(g.surrendered)continue;/* kneeling, hands up (posed by story2.js) */
    const dx=P.x-g.x,dz=P.z-g.z,d=Math.hypot(dx,dz);g.h.g.visible=d<220;if(g.cop&&(wanted===0||player.dead)){g.aggro=false;g.copT=(g.copT||0)+dt;animHuman(g.h,0,0,false);g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);if(g.copT>4&&d>40){scene.remove(g.h.g);goons.splice(i,1)}continue}g.copT=0;
    if(player.dead)g.aggro=false;
    if(g.stagger>0){g.stagger-=dt;animHuman(g.h,0,0,false);g.h.armL.rotation.x=g.h.armR.rotation.x=-0.6;g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);g.h.g.rotation.y=g.yaw;continue}
    if(!player.dead&&!player.vehicle&&d<2.4&&(g.aggro||!g.spot)){g.aggro=true;g.yaw=Math.atan2(dx,dz);g.meleeT=(g.meleeT||0.5)-dt;if(g.meleeT<=0){g.meleeT=RR(0.8,1.25);g.punchT=0.28;playerDamage(g.boss?12:8);noise(0.09,650,0.4,2);shake=Math.max(shake,0.08)}
      animHuman(g.h,0,0,true);if(g.punchT>0){g.punchT-=dt;punchAnim(g.h,g.punchT,1,'fists')}g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);g.h.g.rotation.y=g.yaw;continue}
    if(!player.dead&&((d<36&&!g.passive&&!g.spot)||(g.aggro&&d<75))){g.aggro=true;g.yaw=Math.atan2(dx,dz);let moving=false;
      if(d>13){const sp=2.8;_pp.x=g.x+dx/d*sp*dt;_pp.z=g.z+dz/d*sp*dt;pushCircle(_pp,0.35,g.y||0);g.x=_pp.x;g.z=_pp.z;moving=true}
      g.shootT-=dt;if(g.shootT<=0){const W=GW[g.wep];g.shootT=RR(W.rate[0],W.rate[1]);const m=g.h.gun.localToWorld(_v.set(0,-0.85,0));
        enemyShoot(m.x,m.y,m.z,clamp((0.55-d/100)*W.acc,0.1,0.55),W.dmg*(g.boss?1.4:1))}
      g.phase+=moving?dt*8:0;animHuman(g.h,g.phase,moving?1:0,true)}
    else{if(d>75&&!g.spot)g.aggro=false;if(g.spot&&g.spot.st!=='neutral'&&!player.dead)g.yaw+=angDiff(g.yaw,Math.atan2(dx,dz))*Math.min(1,dt*3);else g.yaw+=Math.sin(time*0.5+i)*dt*0.3;animHuman(g.h,0,0,false)}
    g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);g.h.g.rotation.y=g.yaw}
  updateGangs(dt);
  for(const sp of gangSpots){if(sp.alive<=0){sp.respawn+=dt;const{x:cx,z:cz}=gangCenter(sp);if(sp.respawn>100&&Math.hypot(P.x-cx,P.z-cz)>140)spawnGang(sp)}}}


/* ================= wanderers & static people ================= */
const WCLOTH={market:()=>({}),beach:()=>({shirt:rpick(['#f1faee','#8ecae6','#ffb703','#e63946','#06d6a0']),pants:rpick(['#264653','#1d3557','#f4f1e8'])}),college:()=>({shirt:rpick(SHIRTS),pants:rpick(['#1d3557','#2b2d42','#3d405b']),sleeve:'short'}),stadium:()=>({shirt:rpick(['#ffffff','#1d4ed8','#c1121f']),pants:'#111'})};
function updateWorldFX(dt){waterU.time.value+=dt}
