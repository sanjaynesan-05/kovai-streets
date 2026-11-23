/* Kovai Streets: world.js
 * Shared builders for the real-geography world: buildings, palms, water material, surfaces, text signs, and the mill and mall blocks used by mission sites
 * Classic script, loaded in order by index.html (5 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

let HOSP={x:0,z:0};   /* real hospital spot, set by geosites.js */
/* block builders still used by the real-map mission sites (geosites.js) */
const BUILD={
  mill(cx,cz){for(const s of[-1,1]){building(cx-3,cz+s*12,42,15,8,'#cdb89a',{noSign:true,noTank:true});
      for(let k=0;k<7;k++)addG(B_PLAIN,GEO.box,cx-3-18+k*6,9.4,cz+s*12,'#8c8c8c',0,0,0.55,5.2,0.25,15)}
    addG(B_PLAIN,GEO.cyl,cx+22,17,cz,'#9c4a33',0,0,0,1.8,34,1.8);addG(B_PLAIN,GEO.cyl,cx+22,30,cz,'#eeeeee',0,0,0,1.85,1.2,1.85);
    addCollider(cx+20.2,cz-1.8,cx+23.8,cz+1.8,34)}
};

function buildPalms(){const n=palms.length;const tg=new THREE.CylinderGeometry(0.2,0.33,1,6);tg.translate(0,0.5,0);
  const fg=new THREE.BoxGeometry(0.9,0.06,4.2);fg.translate(0,0,2.1);
  const trunks=new THREE.InstancedMesh(tg,M('#7a5c3e'),n),fr=new THREE.InstancedMesh(fg,M('#3f7d2c'),n*7),nuts=new THREE.InstancedMesh(new THREE.SphereGeometry(0.22,6,5),M('#6b8e23'),n*3);
  const o=new THREE.Object3D();o.rotation.order='YXZ';const top=new THREE.Vector3();
  palms.forEach(([x,z],i)=>{const h=R(7,11.5);o.position.set(x,0,z);o.rotation.set(R(-0.13,0.13),R(0,6.28),R(-0.13,0.13));o.scale.set(1,h,1);o.updateMatrix();trunks.setMatrixAt(i,o.matrix);
    top.set(0,1,0).applyMatrix4(o.matrix);
    for(let k=0;k<7;k++){o.position.copy(top);o.rotation.set(R(0.25,0.75),k/7*6.283+R(-0.2,0.2),0);o.scale.set(1,1,R(0.8,1.15));o.updateMatrix();fr.setMatrixAt(i*7+k,o.matrix)}
    for(let k=0;k<3;k++){o.position.set(top.x+Math.sin(k*2.1)*0.3,top.y-0.3,top.z+Math.cos(k*2.1)*0.3);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.updateMatrix();nuts.setMatrixAt(i*3+k,o.matrix)}});
  for(const m of[trunks,fr,nuts]){m.castShadow=true;m.frustumCulled=false;scene.add(m)}}


/* ================= new buildings ================= */
function building(x,z,w,d,h,color,opts){opts=opts||{};
  const style=opts.style!==undefined?opts.style:(h>34?2:rng()<0.22?1:rng()<0.3?3:0);const B=B_FAC[style];
  const shop=!opts.noSign&&!opts.noShop&&h>=7&&h<44;
  if(shop){addG(B_SHOP,shopGeo(w,d),x,1.8,z,'#ffffff');addG(B,buildingGeo(w,h-3.6,d),x,3.6+(h-3.6)/2,z,color);addBox(B_PLAIN,w+0.5,0.28,d+0.5,x,3.72,z,shade(color,0.82));
    if(rng()<0.5){const side=rng()<0.5?1:-1;addG(B_PLAIN,GEO.box,x,3.25,z+side*(d/2+0.7),pick(['#1d4ed8','#c1121f','#2b9348','#f77f00','#555']),0.28*side,0,0,w*0.8,0.06,1.4)}}
  else addG(B,buildingGeo(w,h,d),x,h/2,z,color);
  addCollider(x-w/2,z-d/2,x+w/2,z+d/2,h);
  addBox(B_PLAIN,w+0.3,0.5,d+0.3,x,h+0.25,z,shade(color,0.88));
  if(!opts.noTank){const nt=rng()<0.4?2:1;for(let k=0;k<nt;k++)addG(B_PLAIN,GEO.cyl16,x+R(-w/3,w/3),h+1.25,z+R(-d/3,d/3),'#1c1c1c',0,0,0,0.85,1.5,0.85);
    if(rng()<0.6)addBox(B_PLAIN,2.6,2.5,2.6,x+R(-w/4,w/4),h+1.25,z+R(-d/4,d/4),shade(color,0.92));
    for(let k=0;k<3;k++)if(rng()<0.5)addBox(B_PLAIN,0.9,0.6,0.5,x+R(-w/2.5,w/2.5),h+0.8,z+R(-d/2.5,d/2.5),'#d9d9d9');
    if(rng()<0.25)addG(B_PLAIN,GEO.cyl8,x+R(-w/3,w/3),h+1.0,z+R(-d/3,d/3),'#eeeeee',0.6,0,0,0.45,0.08,0.45)}
  if(style===0&&h<32&&h>9&&rng()<0.55){const side=rng()<0.5?1:-1,bw=Math.min(w*0.7,9);for(let y=shop?7.0:3.4;y<h-2;y+=3.4){const bz=z+side*(d/2+0.55);
      addBox(B_PLAIN,bw,0.16,1.1,x,y,bz,'#d9d4c8');addBox(B_PLAIN,bw,0.85,0.06,x,y+0.5,z+side*(d/2+1.08),'#4a4a4a');addBox(B_PLAIN,0.06,0.85,1.1,x-bw/2,y+0.5,bz,'#4a4a4a');addBox(B_PLAIN,0.06,0.85,1.1,x+bw/2,y+0.5,bz,'#4a4a4a');
      if(rng()<0.3)addBox(B_PLAIN,bw*0.6,0.5,0.02,x,y+0.95,z+side*(d/2+0.9),pick(['#e63946','#ffd166','#118ab2','#f1faee']))}}}


/* ================= water (lakes on the real map) ================= */
const SHORE=1e9;   /* no sea on the real map (kept for the shared water and swimming checks) */
const waterU={time:{value:0},sunDir:{value:new THREE.Vector3(0,1,0)},sunCol:{value:new THREE.Color(1,1,1)},skyCol:{value:new THREE.Color('#9cc6e6')},fogCol:{value:new THREE.Color()},fogNear:{value:200},fogFar:{value:1500},dayF:{value:1}};
const WV=[[-0.97,0.24,0.09,1.1,0.12],[-0.76,-0.65,0.17,1.7,0.06],[0.29,0.96,0.33,2.3,0.03]];/* D5: calm reservoir water (was sea waves) */
const WV_GLSL=WV.map((w,i)=>`ph=dot(vec2(${w[0].toFixed(3)},${w[1].toFixed(3)}),p)*${w[2].toFixed(3)}+t*${w[3].toFixed(3)};a+=${w[4].toFixed(3)}*sin(ph);g+=${(w[4]*w[2]).toFixed(4)}*cos(ph)*vec2(${w[0].toFixed(3)},${w[1].toFixed(3)});`).join('');
function waterMaterial(isLake){return new THREE.ShaderMaterial({transparent:true,uniforms:Object.assign({},waterU,{lake:{value:isLake?1:0}}),
  vertexShader:`uniform float time;uniform float lake;varying vec3 vW;varying vec3 vN;varying float vDepth;
  void main(){vec4 w=modelMatrix*vec4(position,1.0);float depth=lake>0.5?2.0:clamp((w.x-${SHORE}.0)*0.075,0.0,9.0);float amp=lake>0.5?0.15:smoothstep(0.0,3.0,depth)*0.9+0.1;
  vec2 p=w.xz;float t=time;float a=0.0;float ph;vec2 g=vec2(0.0);${WV_GLSL}w.y+=a*amp;vN=normalize(vec3(-g.x*amp,1.0,-g.y*amp));vW=w.xyz;vDepth=depth;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`uniform vec3 sunDir;uniform vec3 sunCol;uniform vec3 skyCol;uniform vec3 fogCol;uniform float fogNear;uniform float fogFar;uniform float time;uniform float lake;uniform float dayF;varying vec3 vW;varying vec3 vN;varying float vDepth;
  void main(){vec3 n=normalize(vN+vec3(sin(vW.x*1.7+time*2.0)*0.035+sin(vW.z*2.3-time*1.6)*0.03,0.0,cos(vW.x*2.1-time*1.8)*0.035+cos(vW.z*1.3+time*1.1)*0.03));
  vec3 v=normalize(cameraPosition-vW);float fres=pow(1.0-max(dot(n,v),0.0),3.0);
  vec3 deep=mix(vec3(0.02,0.06,0.1),vec3(0.04,0.25,0.36),dayF);vec3 shal=mix(vec3(0.04,0.1,0.12),vec3(0.16,0.5,0.5),dayF);if(lake>0.5){deep=mix(vec3(0.02,0.06,0.08),vec3(0.12,0.32,0.36),dayF);shal=deep;}
  vec3 col=mix(shal,deep,smoothstep(0.0,6.0,vDepth));col=mix(col,skyCol,fres*0.55);vec3 h=normalize(sunDir+v);col+=sunCol*pow(max(dot(n,h),0.0),140.0)*1.3+sunCol*max(dot(n,sunDir),0.0)*0.07;
  float foam=0.0;if(lake<0.5){float s=vW.x-${SHORE}.0;foam=clamp((1.0-smoothstep(-1.0,8.0,s))*(0.5+0.5*sin(s*1.2-time*2.2+sin(vW.z*0.08)*2.0)),0.0,1.0);}
  col=mix(col,vec3(0.95),foam*0.3*mix(0.3,1.0,dayF));float alpha=lake>0.5?0.94:mix(0.5,0.95,smoothstep(0.0,3.5,vDepth));alpha=max(alpha,foam*0.9);
  float fd=length(vW-cameraPosition);col=mix(col,fogCol,smoothstep(fogNear,fogFar,fd));gl_FragColor=vec4(col,alpha);}`})}
function waveY(x,z){const t=waterU.time.value,depth=clamp((x-SHORE)*0.075,0,9),amp=smooth(0,3,depth)*0.9+0.1;let a=0;for(const w of WV)a+=w[4]*Math.sin((w[0]*x+w[1]*z)*w[2]+t*w[3]);return a*amp}
function seaDepth(){return 0}   /* no sea on the real map */
function isDeep(x,z){return inLake(x,z)||seaDepth(x,z)>1.35}
function humanY(x,z,y){if(inLake(x,z))return -1.0;if(x>SHORE-6&&seaDepth(x,z)>1.35)return waveY(x,z)-1.12;return surfaceH(x,z,y)}
/* ================= new city places ================= */
/* ================= living city: landmarks, sky, weather ================= */
const FLY_CLEAR=3.6; // clearance (m) under the flyover deck that the tallest vehicles need
const SURF=[],STALLS=[],MALLPEOPLE=[],FLAMES=[];
function surfaceH(x,z,y){let best=groundH(x,z);{const h=geoDeckH(x,z,y);if(h>best)best=h}/* flyover and bridge decks */for(const s of SURF){if(x<s.minX||x>s.maxX||z<s.minZ||z>s.maxZ)continue;const hh=s.h(x,z);if(hh>best&&y>=hh-1.6)best=hh}return best}
function inLake(x,z){return geoInWater(x,z)}

function textPlane(txt,w,h,bg,fg,font){const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const g=c.getContext('2d');
  g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.font=font||`bold ${Math.round(c.height*0.62)}px "Bebas Neue",Impact,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,c.width/2,c.height/2+2);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));scene.add(m);return m}
function wallW(x,z,w,d,h,y0,col){y0=y0||0;addG(B_WIN,buildingGeo(w,h,d),x,y0+h/2,z,col);addCollider(x-w/2,z-d/2,x+w/2,z+d/2,y0+h,y0>0?y0:-1)}

/* --- mall (3 floors, walk in) --- */
BUILD.mall=function(cx,cz){const H=16.5,F1=5.5,F2=11,G='#a9cfe0';
  addBox(B_PLAIN,58,0.06,58,cx,0.19,cz,'#d9d4c8');addBox(B_PLAIN,47.4,0.04,41.4,cx,0.23,cz,'#efe9dd');
  wallW(cx,cz-21,48,0.6,H,0,G);wallW(cx-24,cz,0.6,42,H,0,G);wallW(cx+24,cz-12,0.6,18,H,0,G);wallW(cx+24,cz+12,0.6,18,H,0,G);wallW(cx+24,cz,0.6,6,H-4.5,4.5,G);
  wallW(cx-14.5,cz+21,19,0.6,H,0,G);wallW(cx+14.5,cz+21,19,0.6,H,0,G);wallW(cx,cz+21,10,0.6,H-4.5,4.5,G);
  addBox(B_PLAIN,48.6,0.6,42.6,cx,H+0.3,cz,'#cfd8dc');addCollider(cx-24,cz-21,cx+24,cz+21,H+0.6,H);
  addBox(B_PLAIN,12,1.2,5,cx,H+1.2,cz+16,'#e76f51');
  const slab=(top,z0,z1)=>{addBox(B_PLAIN,47.4,0.4,z1-z0,cx,top-0.2,cz+(z0+z1)/2,'#e2ddd2');addCollider(cx-23.7,cz+z0,cx+23.7,cz+z1,top,top-0.4);SURF.push({minX:cx-23.7,maxX:cx+23.7,minZ:cz+z0,maxZ:cz+z1,h:()=>top});
    for(let k=0;k<5;k++)addBox(B_PLAIN,6,0.05,1.2,cx-18+k*9,top-0.43,cz+(z0+z1)/2,'#ffffff')};
  slab(F1,-21,3);slab(F2,-21,-7);
  // escalator ramps
  const r1=Math.atan2(F1,12),L1=Math.hypot(12,F1);addG(B_PLAIN,GEO.box,cx-21.5,F1/2-0.15,cz+9,'#8f9aa3',0,r1,0,3.8,0.3,L1);
  addG(B_PLAIN,GEO.box,cx-19.5,F1/2+0.75,cz+9,'#bfe3f0',0,r1,0,0.12,1.0,L1);addCollider(cx-19.7,cz+3,cx-19.35,cz+15,F1+1.2,0.6);
  SURF.push({minX:cx-23.4,maxX:cx-19.6,minZ:cz+3,maxZ:cz+15,h:(x,z)=>F1*(cz+15-z)/12});
  const r2=Math.atan2(F2-F1,10),L2=Math.hypot(10,F2-F1);addG(B_PLAIN,GEO.box,cx+21.5,(F1+F2)/2-0.15,cz-2,'#8f9aa3',0,r2,0,3.8,0.3,L2);
  addG(B_PLAIN,GEO.box,cx+19.5,(F1+F2)/2+0.75,cz-2,'#bfe3f0',0,r2,0,0.12,1.0,L2);addCollider(cx+19.35,cz-7,cx+19.7,cz+3,F2+1.2,F1+0.3);
  SURF.push({minX:cx+19.6,maxX:cx+23.4,minZ:cz-7,maxZ:cz+3,h:(x,z)=>F1+(F2-F1)*(cz+3-z)/10});
  // glass railings at floor edges
  addBox(B_PLAIN,39,1.1,0.1,cx,F1+0.55,cz+3,'#bfe3f0');addCollider(cx-19.5,cz+2.9,cx+19.5,cz+3.1,F1+1.1,F1-0.1);
  addBox(B_PLAIN,43.2,1.1,0.1,cx-2.25,F2+0.55,cz-7,'#bfe3f0');addCollider(cx-23.7,cz-7.1,cx+19.5,cz-6.9,F2+1.1,F2-0.1);
  // shops (ground floor) — original shop colours, no real brands
  const SC=['#e63946','#2a9d8f','#f4a261','#6d597a','#1d4ed8','#ffb703'];
  for(let k=0;k<6;k++){const x=cx-20+k*8;addBox(B_PLAIN,7,4.4,0.3,x,2.4,cz-20.4,SC[k]);addBox(B_PLAIN,7,0.8,0.4,x,4.6,cz-20.1,'#ffffff');
    addBox(B_PLAIN,5,1.0,1.0,x,0.7,cz-16,'#5d4037');addCollider(x-2.5,cz-16.5,x+2.5,cz-15.5,1.2);
    for(let r=0;r<3;r++)addBox(B_PLAIN,0.6,0.9,0.4,x-1.6+r*1.6,1.35,cz-19.8,pick(['#f1faee','#a8dadc','#ffd166','#ef476f']));
    MALLPEOPLE.push({x,z:cz-17.2,y:0.16,yaw:0})}
  // food court (first floor)
  for(let a=0;a<4;a++)for(let b=0;b<2;b++){const x=cx-14+a*9,z=cz-14+b*6;addBox(B_PLAIN,1.6,0.8,1.6,x,F1+0.4,z,'#8d6e63');addCollider(x-0.8,z-0.8,x+0.8,z+0.8,F1+0.8,F1-0.1);
    for(const s of[-1,1])addBox(B_PLAIN,0.5,0.45,0.5,x+s*1.2,F1+0.23,z,'#c8a165')}
  for(let k=0;k<4;k++){const x=cx-15+k*10;addBox(B_PLAIN,8,3.6,0.3,x,F1+1.8,cz-20.4,pick(SC));addBox(B_PLAIN,6,1.1,1,x,F1+0.55,cz-18.6,'#efe2c2');addCollider(x-3,cz-19.1,x+3,cz-18.1,F1+1.2,F1-0.1);MALLPEOPLE.push({x,z:cz-19.6,y:F1,yaw:0})}
  MALLPEOPLE.push({x:cx-10,z:cz-11,y:F1,yaw:Math.PI},{x:cx+5,z:cz-8.5,y:F1,yaw:2});
  // cinema (second floor)
  addBox(B_PLAIN,24,4.4,0.3,cx-6,F2+2.2,cz-20.4,'#2b2d42');addBox(B_PLAIN,24,0.6,0.4,cx-6,F2+4.2,cz-20.1,'#ffd23f');
  for(const s of[-1,1])addBox(B_PLAIN,3,3.2,0.35,cx-6+s*6,F2+1.6,cz-20.3,'#111');
  addBox(B_PLAIN,6,1.1,1,cx+12,F2+0.55,cz-17,'#c1121f');addCollider(cx+9,cz-17.5,cx+15,cz-16.5,F2+1.2,F2-0.1);MALLPEOPLE.push({x:cx+12,z:cz-18,y:F2,yaw:0},{x:cx-6,z:cz-15,y:F2,yaw:Math.PI});
  // fountain in the atrium
  addG(B_PLAIN,GEO.cyl,cx+6,0.5,cz+12,'#cfd8dc',0,0,0,3,0.6,3);addG(B_PLAIN,GEO.cyl,cx+6,0.82,cz+12,'#5aa9d6',0,0,0,2.6,0.05,2.6);addG(B_PLAIN,GEO.cyl,cx+6,1.5,cz+12,'#cfd8dc',0,0,0,0.3,1.6,0.3);
  addCollider(cx+3.2,cz+9.2,cx+8.8,cz+14.8,0.8);MALLPEOPLE.push({x:cx-4,z:cz+10,y:0.16,yaw:2.5},{x:cx+10,z:cz+16,y:0.16,yaw:-1});
  for(const s of[-1,1])palm(cx+s*27,cz+26);
  const sign=textPlane('KOVAI CENTRAL',22,3,'#1d3557','#ffd23f');sign.position.set(cx,13.2,cz+21.35);
  PLACES.push({n:'Kovai Central mall',x:cx,z:cz+25})};

function stallOpts(s){const buy=(p,g,line)=>()=>{if(player.cash<p)return'Cash illa? Come back later, thambi!';player.cash-=p;player.hp=Math.min(100,player.hp+g);noise(0.06,3000,0.15,1);floatMsg('+'+g+' health');return line};
  return[{t:'Tea · ₹10 · +20 health',fn:buy(10,20,rpick(['Hot, strong and sweet. Drink!','Fresh boiled, just now!']))},
    {t:'Medu vadai · ₹15 · +30 health',fn:buy(15,30,'Crispy outside, soft inside. Take chutney also.')},
    {t:'Bun butter jam · ₹30 · full health',fn:buy(30,100,'Our speciality! Eat slowly.')},{t:'Bye',fn:()=>false}]}
