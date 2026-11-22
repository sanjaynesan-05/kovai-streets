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
const PL=55,PP=220;
function pedPos(p){const H=27.5+p.off;let s=((p.s%PP)+PP)%PP;const seg=Math.floor(s/PL),u=(s-seg*PL)/PL*2*H;
  if(seg===0)return[p.cx-H+u,p.cz-H];if(seg===1)return[p.cx+H,p.cz-H+u];if(seg===2)return[p.cx+H-u,p.cz+H];return[p.cx-H,p.cz+H-u]}
function placePed(p,minD){for(let t=0;t<30;t++){const b=rpick(pedBlocks);const P=playerP();if(minD&&Math.hypot(b.cx-P.x,b.cz-P.z)<minD)continue;p.cx=b.cx;p.cz=b.cz;break}
  p.s=RR(0,PP);p.dir=Math.random()<0.5?1:-1;p.off=RR(-1.2,1.2);p.dead=false;p.fly=null;p.flee=0;p.talk=false;p.hp=50;p.fight=false;p.stagger=0;p.punchCD=1;p.punchT=0;p.hidden=false;p.inV=null;p.h.g.rotation.x=0;p.h.g.rotation.z=0;p.h.g.visible=true;[p.x,p.z]=pedPos(p)}
const NAMES_F=['Lakshmi','Priya','Anitha','Kavitha','Saranya','Revathi','Nandhini','Shalini'],NAMES_M=['Murugan','Karthik','Senthil','Ravi','Prakash','Arun','Ganesh','Vignesh'];
function spawnPed(){const female=Math.random()<0.48;const shirt=rpick(SHIRTS);const lower=female?rpick(['saree','saree','kurta','kurta','pants']):rpick(['pants','pants','pants','veshti','lungi','lungi']);
  const h=makeHuman({shirt,pants:lower==='saree'?shirt:lower==='lungi'?rpick(LUNGI):lower==='kurta'?rpick(['#f4f1e8','#fefae0','#2b2d42','#e9d8a6']):lower==='veshti'?'#f4f1e8':rpick(PANTS),lower,skin:rpick(SKIN),hair:Math.random()<0.15?'#c9c9c9':'#1b1410',long:female,
    dupatta:rpick(['#f4f1e8','#e63946','#ffd166','#9b5de5','#06d6a0']),border:rpick(['#d4a017','#c1121f','#2b9348']),sleeve:lower==='veshti'||lower==='lungi'?rpick(['short','long']):undefined});
  const um=new THREE.Group();const pl=new THREE.Mesh(GEO.cyl,M('#333'));pl.scale.set(0.02,0.6,0.02);pl.position.y=1.95;um.add(pl);const cn=new THREE.Mesh(GEO.cone8,M(rpick(['#1d3557','#e63946','#2a9d8f','#111111','#6d597a','#f4a261'])));cn.scale.set(0.7,0.3,0.7);cn.position.y=2.3;cn.castShadow=true;um.add(cn);um.position.set(0.15,0,0.05);um.visible=false;h.g.add(um);
  const p={umb:um,hasUmb:Math.random()<0.7,h,female,name:female?rpick(NAMES_F):rpick(NAMES_M),cx:0,cz:0,s:0,dir:1,off:0,dead:false,deadT:0,flee:0,phase:Math.random()*6,x:0,z:0,yaw:0,speed:RR(1.1,1.5),fly:null};placePed(p,0);
  peds.push(p);return p}
function killPed(p,byPlayer,fl){if(p.dead||p.hidden)return;p.dead=true;p.deadT=0;p.talk=false;if(talk&&talk.obj===p)closeTalk();
  if(fl){p.fly={vx:fl.vx,vy:fl.vy,vz:fl.vz,y:groundH(p.x,p.z)+0.2,spin:RR(6,10)};p.h.armL.rotation.x=-2.6;p.h.armR.rotation.x=-2.2}else poseDead(p.h,groundH(p.x,p.z));
  if(byPlayer){addWanted(1);onPedKilled(p)}panic(p.x,p.z,35)}
function flyStep(o,dt){const f=o.fly;o.x+=f.vx*dt;o.z+=f.vz*dt;f.vy-=22*dt;f.y+=f.vy*dt;f.vx*=1-1.2*dt;f.vz*=1-1.2*dt;
  _pp.x=o.x;_pp.z=o.z;if(pushCircle(_pp,0.35)){o.x=_pp.x;o.z=_pp.z;f.vx*=-0.3;f.vz*=-0.3}
  const gy=groundH(o.x,o.z);o.h.g.position.set(o.x,f.y,o.z);o.h.g.rotation.x-=f.spin*dt;o.h.g.rotation.z=Math.sin(time*7+o.x)*0.5;o.h.armL.rotation.x=-2+Math.sin(time*17+o.x)*1.2;o.h.armR.rotation.x=-2-Math.cos(time*15)*1.2;o.h.legL.rotation.x=Math.sin(time*13)*0.9;o.h.legR.rotation.x=-Math.sin(time*11)*0.9;
  if(f.y<=gy+0.22&&f.vy<0){if(f.vy<-7&&!f.b){f.b=1;f.vy*=-0.28;f.spin*=0.5;f.y=gy+0.23}else{o.fly=null;poseDead(o.h,gy)}}}
function panic(x,z,r){for(const p of peds){if(!p.dead&&!p.hidden&&!p.talk&&!p.fight&&Math.abs(p.x-x)<r&&Math.abs(p.z-z)<r){p.flee=7;if(Math.random()<0.5)p.dir*=-1}}}
function updatePeds(dt){const P=playerP();
  for(const p of peds){if(p.hidden)continue;const dx=p.x-P.x,dz=p.z-P.z,far=dx*dx+dz*dz>200*200;
    if(p.dead){if(p.fly){flyStep(p,dt);continue}p.deadT+=dt;if(p.deadT>15&&(far||p.deadT>40))placePed(p,150);continue}
    p.h.g.visible=!far;if(far&&!p.talk){p.s+=p.dir*p.speed*dt;[p.x,p.z]=pedPos(p);continue}
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
function spawnGang(sp){sp.alive=0;const cx=sp.i*CELL+sp.sx*10.5,cz=sp.j*CELL+sp.sz*10.5;for(let k=0;k<4;k++){spawnGoon(cx+RR(-3,3),cz+RR(-3,3),sp);sp.alive++}sp.respawn=0}
function damageGoon(g,amt,byPlayer,fl){if(g.dead)return;g.hp-=amt;g.aggro=true;if(g.hp<=0){g.dead=true;g.deadT=0;
    if(fl)g.fly={vx:fl.vx,vy:fl.vy,vz:fl.vz,y:groundH(g.x,g.z)+0.2,spin:RR(6,10)};else poseDead(g.h,groundH(g.x,g.z));
    if(byPlayer!==false)onGoonKilled(g);if(byPlayer!==false&&g.cop){addWanted(1)}else if(byPlayer!==false){dropCash(g.x,g.z,g.boss?RI(1500,2500):RI(80,260));
      if(g.boss||Math.random()<0.38){const id=g.boss?'rocket':g.wep==='smg'?'smg':g.wep==='rifle'?'rifle':rpick(['smg','shotgun','revolver','bat','knife','grenade']);const wi=WI(id);dropWeapon(g.x+RR(-1,1),g.z+RR(-1,1),wi,id==='rocket'?4:id==='shotgun'?16:id==='revolver'?18:id==='grenade'?3:WEAPONS[wi].melee?0:60)}}
    if(g.spot)g.spot.alive--;if(g.mission&&mission&&(g.mission===true||g.mission===mission))mission.left--}}
const _pp={x:0,z:0};
function updateGoons(dt){const P=playerP();
  for(let i=goons.length-1;i>=0;i--){const g=goons[i];
    if(g.dead){if(g.fly){flyStep(g,dt);continue}g.deadT+=dt;if(g.deadT>30){scene.remove(g.h.g);goons.splice(i,1)}continue}
    const dx=P.x-g.x,dz=P.z-g.z,d=Math.hypot(dx,dz);g.h.g.visible=d<220;if(g.cop&&(wanted===0||player.dead)){g.aggro=false;g.copT=(g.copT||0)+dt;animHuman(g.h,0,0,false);g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);if(g.copT>4&&d>40){scene.remove(g.h.g);goons.splice(i,1)}continue}g.copT=0;
    if(player.dead)g.aggro=false;
    if(g.stagger>0){g.stagger-=dt;animHuman(g.h,0,0,false);g.h.armL.rotation.x=g.h.armR.rotation.x=-0.6;g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);g.h.g.rotation.y=g.yaw;continue}
    if(!player.dead&&!player.vehicle&&d<2.4){g.aggro=true;g.yaw=Math.atan2(dx,dz);g.meleeT=(g.meleeT||0.5)-dt;if(g.meleeT<=0){g.meleeT=RR(0.8,1.25);g.punchT=0.28;playerDamage(g.boss?12:8);noise(0.09,650,0.4,2);shake=Math.max(shake,0.08)}
      animHuman(g.h,0,0,true);if(g.punchT>0){g.punchT-=dt;punchAnim(g.h,g.punchT,1,'fists')}g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);g.h.g.rotation.y=g.yaw;continue}
    if(!player.dead&&(d<36||(g.aggro&&d<75))){g.aggro=true;g.yaw=Math.atan2(dx,dz);let moving=false;
      if(d>13){const sp=2.8;_pp.x=g.x+dx/d*sp*dt;_pp.z=g.z+dz/d*sp*dt;pushCircle(_pp,0.35,g.y||0);g.x=_pp.x;g.z=_pp.z;moving=true}
      g.shootT-=dt;if(g.shootT<=0){const W=GW[g.wep];g.shootT=RR(W.rate[0],W.rate[1]);const m=g.h.gun.localToWorld(_v.set(0,-0.85,0));
        enemyShoot(m.x,m.y,m.z,clamp((0.55-d/100)*W.acc,0.1,0.55),W.dmg*(g.boss?1.4:1))}
      g.phase+=moving?dt*8:0;animHuman(g.h,g.phase,moving?1:0,true)}
    else{if(d>75)g.aggro=false;g.yaw+=Math.sin(time*0.5+i)*dt*0.3;animHuman(g.h,0,0,false)}
    g.h.g.position.set(g.x,(g.y=humanY(g.x,g.z,g.y||0)),g.z);g.h.g.rotation.y=g.yaw}
  for(const sp of gangSpots){if(sp.alive<=0){sp.respawn+=dt;const cx=sp.i*CELL,cz=sp.j*CELL;if(sp.respawn>100&&Math.hypot(P.x-cx,P.z-cz)>140)spawnGang(sp)}}}


/* ================= wanderers & static people ================= */
const WCLOTH={market:()=>({}),beach:()=>({shirt:rpick(['#f1faee','#8ecae6','#ffb703','#e63946','#06d6a0']),pants:rpick(['#264653','#1d3557','#f4f1e8'])}),college:()=>({shirt:rpick(SHIRTS),pants:rpick(['#1d3557','#2b2d42','#3d405b']),sleeve:'short'}),stadium:()=>({shirt:rpick(['#ffffff','#1d4ed8','#c1121f']),pants:'#111'})};
function spawnWanderers(){for(const zn of WZONES){const n=Math.round(zn.n*(QL==='low'?0.5:QL==='high'?1.3:1));for(let k=0;k<n;k++){const fem=Math.random()<0.45,base=WCLOTH[zn.kind]?WCLOTH[zn.kind]():{};const sh=base.shirt||rpick(SHIRTS);
    const h=makeHuman(Object.assign({skin:rpick(SKIN),long:fem,shirt:sh,pants:base.pants||(fem&&Math.random()<0.5?sh:rpick(PANTS))},base));const x=zn.cx+RR(-zn.rx,zn.rx),z=zn.cz+RR(-zn.rz,zn.rz);
    WANDER.push({h,zn,x,z,y:0,tx:x,tz:z,wait:RR(0,3),phase:0,yaw:RR(0,6),sp:zn.kind==='stadium'?RR(2.5,4):RR(0.9,1.4)})}}
  for(const s of STATICS){const fem=Math.random()<0.5,sh=rpick(SHIRTS);const h=makeHuman({skin:rpick(SKIN),long:fem,shirt:sh,pants:fem?sh:rpick(PANTS)});const y=surfaceH(s.x,s.z,0);
    h.g.position.set(s.x,y,s.z);h.g.rotation.y=s.yaw;if(s.lie){h.g.rotation.x=-Math.PI/2;h.g.position.y=y+0.15;h.armL.rotation.x=h.armR.rotation.x=-2.9}else if(s.vendor)h.armR.rotation.x=-0.6;s.h=h}}
function updateWanderers(dt){const P=playerP();for(const w of WANDER){const far=Math.abs(w.x-P.x)>150||Math.abs(w.z-P.z)>150;w.h.g.visible=!far;if(far)continue;
  if(w.wait>0){w.wait-=dt;animHuman(w.h,0,0,false)}else{const dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz);if(d<0.4){w.wait=RR(1,5);w.tx=w.zn.cx+RR(-w.zn.rx,w.zn.rx);w.tz=w.zn.cz+RR(-w.zn.rz,w.zn.rz)}
    else{const st=Math.min(d,w.sp*dt);_pp.x=w.x+dx/d*st;_pp.z=w.z+dz/d*st;if(pushCircle(_pp,0.3,w.y)){w.tx=w.zn.cx+RR(-w.zn.rx,w.zn.rx);w.tz=w.zn.cz+RR(-w.zn.rz,w.zn.rz)}w.x=_pp.x;w.z=_pp.z;w.yaw=Math.atan2(dx,dz);w.phase+=dt*w.sp*3.2;animHuman(w.h,w.phase,w.sp>2?1.2:0.8,false)}}
  w.y=humanY(w.x,w.z,w.y);w.h.g.position.set(w.x,w.y,w.z);w.h.g.rotation.y=w.yaw;if(w.h.umb)w.h.umb.visible=false}}
function updateWorldFX(dt){waterU.time.value+=dt;if(LH.g){LH.g.rotation.y+=dt*0.6;LH.beam.opacity=0.22*(1-dayF)}if(FALLS)FALLS.m.material.map.offset.y-=dt*1.6;updateWanderers(dt)}
