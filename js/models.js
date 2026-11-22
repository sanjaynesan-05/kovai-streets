/* Kovai Streets: models.js
 * Character models (makeHuman), poses, clothing palettes, map icons
 * Classic script, loaded in order by index.html (3 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= humans ================= */
const HG={torso:new THREE.BoxGeometry(0.54,0.66,0.3),
  leg:(()=>{const g=new THREE.BoxGeometry(0.2,0.82,0.22);g.translate(0,-0.41,0);return g})(),
  arm:(()=>{const g=new THREE.BoxGeometry(0.15,0.62,0.15);g.translate(0,-0.31,0);return g})(),
  head:new THREE.SphereGeometry(0.17,10,8),hair:new THREE.BoxGeometry(0.35,0.12,0.35),band:new THREE.BoxGeometry(0.37,0.07,0.37),longHair:new THREE.BoxGeometry(0.34,0.55,0.12),
  gun:(()=>{const g=new THREE.BoxGeometry(0.09,0.42,0.15);g.translate(0,-0.62,0.04);return g})()};
const SKIN=['#8d5524','#a0662f','#6b3f1d','#c68642','#7a4a2a','#5a3418'];
const SHIRTS=['#e63946','#f1faee','#a8dadc','#457b9d','#ffb703','#fb8500','#8ecae6','#06d6a0','#ef476f','#ffd166','#9b5de5','#f15bb5','#fefae0','#2a9d8f'];
const PANTS=['#f4f1e8','#f4f1e8','#2b2d42','#3d405b','#5c4033','#264653','#1d3557'];
/* ================= icons ================= */
function iconCanvas(kind){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const circ=col=>{g.fillStyle=col;g.beginPath();g.arc(32,32,28,0,7);g.fill();g.lineWidth=4;g.strokeStyle='#fff';g.stroke()};
  if(kind==='hosp'){circ('#d62828');g.fillStyle='#fff';g.fillRect(27,15,10,34);g.fillRect(15,27,34,10)}
  else if(kind==='gun'){circ('#2d3436');g.fillStyle='#fff';g.fillRect(13,23,36,9);g.fillRect(42,19,5,5);g.fillRect(15,31,10,16);g.fillRect(27,31,4,6)}
  else if(kind==='tea'){circ('#8d5524');g.fillStyle='#fff';g.fillRect(19,26,20,18);g.lineWidth=4;g.strokeStyle='#fff';g.beginPath();g.arc(41,35,6,-1.4,1.4);g.stroke();g.fillRect(16,45,26,4);g.lineWidth=3;g.beginPath();g.moveTo(25,22);g.quadraticCurveTo(21,17,25,12);g.moveTo(33,22);g.quadraticCurveTo(29,17,33,12);g.stroke()}
  else if(kind==='heart'){circ('#e84393');g.fillStyle='#fff';g.beginPath();g.moveTo(32,47);g.bezierCurveTo(8,32,16,12,32,24);g.bezierCurveTo(48,12,56,32,32,47);g.fill()}
  return c}
const ICON={tea:iconCanvas('tea'),hosp:iconCanvas('hosp'),gun:iconCanvas('gun'),heart:iconCanvas('heart')};
function iconSprite(kind,x,y,z,s){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(ICON[kind]),fog:false}));sp.position.set(x,y,z);sp.scale.set(s,s,1);scene.add(sp);return sp}


/* ================= people ================= */
const HAIRC=['#1b1410','#1b1410','#2b1a10','#120d0a','#3b2a20'];
function makeHuman(o){o=o||{};const g=new THREE.Group();g.rotation.order='YXZ';
  const fem=!!(o.female||o.long),skin=o.skin||'#8d5524',hair=o.hair||pick(HAIRC),shirt=o.shirt||'#e63946';
  const lower=o.lower||(fem?(o.pants===o.shirt?'saree':(o.pants==='#f4f1e8'?'kurta':'pants')):(o.pants==='#f4f1e8'?'veshti':'pants'));
  const pants=o.pants||'#2b2d42',shortSl=o.sleeve?o.sleeve==='short':(fem||Math.random()<0.6);
  const B=GB();
  // hips + torso
  gb(B,CY(0.16,0.15,0.2),0,0.9,0,lower==='pants'?pants:lower==='kurta'?shirt:lower==='saree'?shirt:'#f4f1e8',0,0,0,1,1,0.75);
  gb(B,CY(fem?0.175:0.2,fem?0.15:0.165,0.5,12),0,1.2,0,shirt,0,0,0,1,1,0.68);
  gb(B,GEO.sph16,0,1.42,0,shirt,0,0,0,fem?0.2:0.235,0.1,0.14);
  if(!fem)gbBox(B,0.15,0.04,0.05,0,1.48,0.07,shade(shirt,1.08));
  gb(B,CY(0.055,0.06,0.1),0,1.5,0,skin);
  gb(B,GEO.sph16,0,1.64,0,skin,0,0,0,0.112,0.132,0.122);gb(B,GEO.sph16,0,1.575,0.02,skin,0,0,0,0.082,0.06,0.088);
  for(const s of[-1,1]){gb(B,GEO.sph,s*0.112,1.64,0,skin,0,0,0,0.022,0.038,0.02);gb(B,GEO.sph,s*0.042,1.665,0.108,'#140e0a',0,0,0,0.018,0.016,0.012);gbBox(B,0.045,0.011,0.012,s*0.043,1.69,0.112,hair)}
  gbBox(B,0.026,0.042,0.034,0,1.633,0.122,shade(skin,0.93));gbBox(B,0.048,0.009,0.01,0,1.588,0.112,'#5a2a22');
  if(o.stache||(!fem&&o.stache===undefined&&Math.random()<0.55))gbBox(B,0.075,0.017,0.02,0,1.606,0.117,hair);
  if(fem&&(o.bindi||Math.random()<0.4))gb(B,GEO.sph,0,1.703,0.118,'#c1121f',0,0,0,0.009,0.009,0.005);
  const hs=o.hairStyle||(fem?(Math.random()<0.5?'long':'bun'):(o.hair==='#c9c9c9'?'bald':'short'));
  if(hs!=='bald'){gb(B,GEO.sph16,0,1.705,-0.008,hair,0,0,0,0.12,0.085,0.128);gb(B,GEO.sph16,0,1.655,-0.04,hair,0,0,0,0.117,0.1,0.098)}else gb(B,GEO.sph16,0,1.64,-0.05,'#bdbdbd',0,0,0,0.116,0.08,0.09);
  if(hs==='long'){gbBox(B,0.2,0.42,0.06,0,1.46,-0.095,hair);if(o.jasmine||Math.random()<0.5)for(let k=0;k<5;k++)gb(B,GEO.sph,R(-0.06,0.06),1.62-k*0.06,-0.13,'#ffffff',0,0,0,0.025,0.025,0.025)}
  if(hs==='bun'){gb(B,GEO.sph16,0,1.665,-0.135,hair,0,0,0,0.06,0.06,0.055);if(o.jasmine||Math.random()<0.5)gb(B,CY(0.075,0.075,0.03),0,1.665,-0.13,'#ffffff',Math.PI/2,0,0)}
  if(o.glasses)gbBox(B,0.17,0.03,0.02,0,1.665,0.118,'#111111');
  if(o.chain)gb(B,new THREE.TorusGeometry(0.085,0.009,6,16),0,1.47,0.04,'#e8b923',Math.PI/2.3,0,0);
  if(o.band)gb(B,CY(0.124,0.124,0.04,14),0,1.71,0,o.band);
  if(lower==='veshti'||lower==='lungi'){const c=lower==='veshti'?'#f4f1e8':pants;gb(B,CY(0.17,0.21,0.8,12),0,0.52,0,c);gb(B,CY(0.212,0.212,0.05,12),0,0.15,0,lower==='veshti'?'#d4a017':shade(c,0.7));if(lower==='lungi')for(const yy of[0.34,0.52,0.7]){const rr=0.21-(yy-0.12)/0.8*0.04+0.004;gb(B,CY(rr,rr,0.035,12),0,yy,0,shade(c,1.45))}}
  if(lower==='saree'){gb(B,CY(0.17,0.26,0.86,12),0,0.49,0,shirt);gb(B,CY(0.262,0.262,0.06,12),0,0.09,0,o.border||'#d4a017');gbBox(B,0.3,0.76,0.03,0.02,1.16,0.115,shade(shirt,0.92),0,0,0.45);gbBox(B,0.2,0.62,0.03,-0.06,1.14,-0.11,shade(shirt,0.92))}
  if(lower==='kurta'){gb(B,CY(0.17,0.23,0.52,12),0,0.72,0,shirt);for(const s of[-1,1])gbBox(B,0.07,0.55,0.02,s*0.1,1.2,0.12,o.dupatta||'#f4f1e8')}
  const torso=gbMesh(B);g.add(torso);
  const legC=lower==='pants'?pants:lower==='kurta'?pants:skin,shoe=o.shoe||pick(['#3b2a20','#1d1d1d','#6d4c41','#d9d9d9']);
  const mkLeg=s=>{const T=GB();gb(T,CY(0.075,0.062,0.44),0,-0.22,0,legC);const leg=gbMesh(T);leg.position.set(s*0.085,0.9,0);g.add(leg);
    const S2=GB();gb(S2,CY(0.058,0.046,0.4),0,-0.2,0,legC);gbBox(S2,0.095,0.07,0.21,0,-0.43,0.045,shoe);const sh=gbMesh(S2);sh.position.y=-0.44;leg.add(sh);leg.userData.shin=sh;return leg};
  const legL=mkLeg(-1),legR=mkLeg(1);
  const mkArm=s=>{const A=GB();if(shortSl){gb(A,CY(0.068,0.062,0.16),0,-0.08,0,shirt);gb(A,CY(0.05,0.046,0.18),0,-0.24,0,skin)}else gb(A,CY(0.06,0.052,0.32),0,-0.16,0,shirt);
    gb(A,CY(0.046,0.04,0.28),0,-0.44,0.02,shortSl?skin:shirt,-0.12,0,0);gb(A,GEO.sph,0,-0.6,0.035,skin,0,0,0,0.045,0.055,0.035);const arm=gbMesh(A);arm.position.set(s*0.235,1.43,0);g.add(arm);return arm};
  const armL=mkArm(-1),armR=mkArm(1);
  let gun=null;if(o.gun){gun=new THREE.Mesh(HG.gun,M('#1d1d1d'));gun.castShadow=true;armR.add(gun)}
  scene.add(g);return{g,legL,legR,armL,armR,gun,torso,shinL:legL.userData.shin,shinR:legR.userData.shin}}
function animHuman(h,phase,amp,aim){const s=Math.sin(phase);h.legL.rotation.z=h.legR.rotation.z=h.armL.rotation.z=h.armR.rotation.z=0;h.legL.rotation.x=s*0.72*amp;h.legR.rotation.x=-s*0.72*amp;
  if(h.shinL){h.shinL.rotation.x=(Math.max(0,-Math.sin(phase+0.9))*1.0+0.04)*Math.min(1,amp*1.2);h.shinR.rotation.x=(Math.max(0,Math.sin(phase+0.9))*1.0+0.04)*Math.min(1,amp*1.2)}
  h.armL.rotation.x=-s*0.6*amp;h.armR.rotation.x=aim?-1.5:s*0.6*amp}
function poseDead(h,y){const up=Math.random()<0.5;h.g.rotation.x=up?-Math.PI/2:Math.PI/2;h.g.rotation.z=RR(-0.35,0.35);h.g.position.y=y+0.2;h.legL.rotation.x=RR(-0.5,0.3);h.legR.rotation.x=RR(-0.5,0.3);h.legL.rotation.z=RR(-0.3,0);h.legR.rotation.z=RR(0,0.3);if(h.shinL){h.shinL.rotation.x=RR(0,0.9);h.shinR.rotation.x=RR(0,0.9)}h.armL.rotation.x=RR(-3,-0.4);h.armR.rotation.x=RR(-3,-0.4);h.armL.rotation.z=RR(-0.9,0);h.armR.rotation.z=RR(0,0.9)}
function seatPose(h){h.legL.rotation.x=h.legR.rotation.x=-1.35;if(h.shinL)h.shinL.rotation.x=h.shinR.rotation.x=1.35;h.armL.rotation.x=h.armR.rotation.x=-1.05}
function pedalPose(h,ph){h.legL.rotation.x=-1.05+Math.sin(ph)*0.45;h.legR.rotation.x=-1.05-Math.sin(ph)*0.45;if(h.shinL){h.shinL.rotation.x=1.1-Math.sin(ph)*0.45;h.shinR.rotation.x=1.1+Math.sin(ph)*0.45}h.armL.rotation.x=h.armR.rotation.x=-1.0}


const LUNGI=['#1d4ed8','#2b9348','#7b2cbf','#c1121f','#264653','#6d597a'];
