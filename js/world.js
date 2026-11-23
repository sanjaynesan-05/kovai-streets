/* Kovai Streets: world.js
 * Map construction: roads, city blocks, buildings, Western Ghats terrain, coast and water, landmarks (flyover, mall, railway, statue, tea stalls)
 * Classic script, loaded in order by index.html (5 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= world build ================= */
const blockType={};const sp=(i,j,t)=>blockType[i+','+j]=t;
sp(3,8,'lake');sp(8,9,'lake');sp(7,5,'race');sp(6,4,'park');/* D3: Race Course and VOC Park at their real positions */sp(4,6,'townhall');sp(0,0,'temple');sp(5,2,'busstand');/* D3: Gandhipuram bus stands */
sp(8,3,'mill');sp(9,6,'mill');sp(7,8,'mill');sp(2,5,'park');sp(3,7,'hospital');sp(8,1,'tower');sp(5,8,'park');sp(3,4,'mall');sp(3,6,'market');sp(6,6,'lake');sp(5,5,'station');/* D3: Town Hall market, Valankulam Lake, Coimbatore Junction */sp(9,2,'college');sp(5,3,'stadium');
/* D3: real landmarks placed from tools/map/landmarks.json (Town Hall block (4,6) = origin) */
sp(4,7,'busstand');sp(11,5,'busstand');sp(11,6,'lake');sp(11,3,'airport');sp(-5,2,'temple');
const pedBlocks=[];let HOSP={x:0,z:0};
const BC=i=>(i-4.5)*CELL;
function dens(cx,cz){return clamp(1-Math.hypot(cx+20,cz+40)/430,0.15,1)}

function buildWorld(){
  const GW=1160+2*GX,gp=new THREE.PlaneGeometry(GW,3000);const guv=gp.attributes.uv;for(let i=0;i<guv.count;i++)guv.setXY(i,guv.getX(i)*GW/14,guv.getY(i)*3000/14);
  const ground=new THREE.Mesh(gp,new THREE.MeshLambertMaterial({map:TX.grass}));ground.rotation.x=-Math.PI/2;ground.position.set(22,0,0);ground.receiveShadow=true;scene.add(ground);
  buildTerrainGrid();buildTerrainMesh();buildCoast();
  // roads (textured asphalt) + lane dashes + zebra crossings
  for(let k=-NB;k<=NB;k++){const ext=k===0?BOUND:LIM+HR;
    addFlat(B_ROAD,-ext,k*CELL-HR,ext,k*CELL+HR,0.03,'#ffffff',8);addFlat(B_ROAD,k*CELL-HR,-ext,k*CELL+HR,ext,0.031,'#ffffff',8);
    for(let s2=-ext+4;s2<ext-4;s2+=9){const m=((s2%CELL)+CELL)%CELL;if(Math.abs(s2)<=LIM+HR&&(m<HR+5||m>CELL-HR-5))continue;
      addFlat(B_PLAIN,s2-1.5,k*CELL-0.11,s2+1.5,k*CELL+0.11,0.05,'#e8e2c8');addFlat(B_PLAIN,k*CELL-0.11,s2-1.5,k*CELL+0.11,s2+1.5,0.05,'#e8e2c8')}
    for(let j=-NB;j<=NB;j++){const nx=k*CELL,nz=j*CELL;if(Math.abs(k)===NB||Math.abs(j)===NB)continue;
      for(let t=-3;t<=3;t++){const o=t*1.9;addFlat(B_PLAIN,nx+o-0.5,nz+HR+0.6,nx+o+0.5,nz+HR+3.4,0.052,'#ece8dc');addFlat(B_PLAIN,nx+o-0.5,nz-HR-3.4,nx+o+0.5,nz-HR-0.6,0.052,'#ece8dc');
        addFlat(B_PLAIN,nx+HR+0.6,nz+o-0.5,nx+HR+3.4,nz+o+0.5,0.052,'#ece8dc');addFlat(B_PLAIN,nx-HR-3.4,nz+o-0.5,nx-HR-0.6,nz+o+0.5,0.052,'#ece8dc')}}}
  // blocks: paver sidewalks with painted kerbs
  for(let i=-5;i<15;i++)for(let j=-5;j<15;j++){const cx=BC(i),cz=BC(j),t=blockType[i+','+j]||'city';/* blocks -5..14: the 20 x 20 city (D2); the original 10 x 10 are 0..9 */
    addFlat(B_SIDE,cx-30,cz-30,cx+30,cz+30,0.16,'#ffffff',2.5);
    addWallQ(B_CURB,cx-30,cz+30,cx+30,cz+30,0,0.16,'#ffffff',2);addWallQ(B_CURB,cx+30,cz-30,cx-30,cz-30,0,0.16,'#ffffff',2);addWallQ(B_CURB,cx+30,cz+30,cx+30,cz-30,0,0.16,'#ffffff',2);addWallQ(B_CURB,cx-30,cz-30,cx-30,cz+30,0,0.16,'#ffffff',2);
    BUILD[t](cx,cz);
    if(t!=='lake')pedBlocks.push({cx,cz})}
  // outskirts: coconut groves + farmhouses
  for(let n=0;n<420;n++){const a=rng()*Math.PI*2;let x,z;
    x=R(-BOUND+8,BOUND-8);z=R(-BOUND+8,BOUND-8);if(Math.abs(x)<LIM+16&&Math.abs(z)<LIM+16)continue;if(Math.abs(x)<12||Math.abs(z)<12||excluded(x,z))continue;palm(x,z)}
  for(let n=0;n<40;n++){let x=R(-BOUND+20,BOUND-20),z=R(-BOUND+20,BOUND-20);if(Math.abs(x)<LIM+24&&Math.abs(z)<LIM+24)continue;if(Math.abs(x)<20||Math.abs(z)<20||excluded(x,z)||onNewRoad(x+4,z,12))continue;/* D4: farmhouse + shed clear of new roads */
    building(x,z,R(7,12),R(7,11),R(3.5,6.5),pick(PAL),{noSign:true});if(rng()<0.5)addBox(B_PLAIN,4,3,4,x+8,1.5,z,'#a0522d')}
  // boundary (west: top of the Ghats, east: beyond the reservoir)
  addCollider(-1190-GX,-BOUND-6,1020+GX,-BOUND,400,-50);addCollider(-1190-GX,BOUND,1020+GX,BOUND+6,400,-50);
  addCollider(-1190-GX,-BOUND,-1176-GX,BOUND,400,-50);addCollider(1010+GX,-BOUND,1020+GX,BOUND,400,-50);
  // mountains (Western Ghats to the west and north-west)
  const MC=['#58705a','#4c6650','#617a5c','#55704f'];
  for(let n=0;n<40;n++){const h=R(180,380),r=h*R(1.0,1.5);addG(B_FAR,GEO.cone7,R(-1700-GX,-1260-GX),h/2+60,R(-1500,1500),pick(MC),R(0,6),0,0,r,h,r)}
  for(let n=0;n<16;n++){const h=R(90,220),r=h*R(1.2,1.8);addG(B_FAR,GEO.cone7,R(-1100-GX,500+GX),h/2,R(-1500-GX,-900-GX),pick(MC),R(0,6),0,0,r,h,r)}
  for(let n=0;n<10;n++){const h=R(40,90),r=h*R(2,3);addG(B_FAR,GEO.cone7,R(-1100-GX,500+GX),h/2,R(900+GX,1400+GX),pick(MC),R(0,6),0,0,r,h,r)}
  buildExtras();
  finish(B_WIN,winMat,true);for(let i=1;i<4;i++)finish(B_FAC[i],FACMAT[i],true);finish(B_SHOP,shopMat,true);finish(B_ROAD,roadMat,false);finish(B_SIDE,sideMat,false);finish(B_CURB,curbMat,false);
  finish(B_PLAIN,plainMat,true);
  finish(B_FAR,new THREE.MeshLambertMaterial({vertexColors:true}),false);
  buildPalms();
}

const waterMat=new THREE.MeshPhongMaterial({color:0x3c7fa8,shininess:90,specular:0x9fc4d8});
const BUILD={
  city(cx,cz){const d=dens(cx,cz);const n=rng()<d*0.85?3:2;const lot=50/n;
    for(let a=0;a<n;a++)for(let b=0;b<n;b++){const lx=cx-25+lot*(a+.5),lz=cz-25+lot*(b+.5);
      if(rng()<0.09){rng()<0.6?palm(lx,lz):neem(lx,lz);continue}
      const w=lot-R(2.5,6),dd=lot-R(2.5,6),h=R(4.5,8)+Math.pow(rng(),1.6)*d*50;building(lx,lz,w,dd,h,pick(PAL))}
    for(const sx of[-1,1])for(const sz of[-1,1])if(rng()<0.35)palm(cx+sx*28.6,cz+sz*28.6)},
  lake(cx,cz){const w=new THREE.Mesh(new THREE.PlaneGeometry(55,55,10,10),waterMaterial(true));w.rotation.x=-Math.PI/2;w.position.set(cx,0.22,cz);w.receiveShadow=true;scene.add(w);
    addBox(B_PLAIN,56,1,0.3,cx,0.6,cz-27.7,'#ece6d8');addBox(B_PLAIN,56,1,0.3,cx,0.6,cz+27.7,'#ece6d8');
    addBox(B_PLAIN,0.3,1,56,cx-27.7,0.6,cz,'#ece6d8');addBox(B_PLAIN,0.3,1,56,cx+27.7,0.6,cz,'#ece6d8');
    LAKES.push({cx,cz});for(let k=0;k<4;k++)addBox(B_PLAIN,16,0.16,1.1,cx,0.24-k*0.18,cz-27.2+k*1.1,'#cfc6b2');
    for(let t=-24;t<=24;t+=12){palm(cx+t,cz-29.2,false);palm(cx+t,cz+29.2,false);palm(cx-29.2,cz+t,false);palm(cx+29.2,cz+t,false)}
    addBox(B_PLAIN,3,0.5,7,cx+8,0.35,cz-6,'#c0392b',0.4)},
  race(cx,cz){addBox(B_PLAIN,58,0.06,58,cx,0.19,cz,'#86b25f');
    addG(B_PLAIN,new THREE.RingGeometry(17,21.5,48),cx,0.23,cz,'#b98f5e',0,-Math.PI/2,0,1.2,1,1);
    for(let k=0;k<14;k++){const a=k/14*Math.PI*2;palm(cx+Math.sin(a)*12*1.15,cz+Math.cos(a)*11)}
    for(const sx of[-1,1])for(const sz of[-1,1])neem(cx+sx*26,cz+sz*26)},
  park(cx,cz){addBox(B_PLAIN,58,0.06,58,cx,0.19,cz,'#7fae5a');addBox(B_PLAIN,58,0.04,3,cx,0.23,cz,'#c9b48f');addBox(B_PLAIN,3,0.04,58,cx,0.231,cz,'#c9b48f');
    addBox(B_PLAIN,4,2,4,cx,1,cz,'#cfc8b8');addG(B_PLAIN,GEO.cone4,cx,5.5,cz,'#bdb3a0',Math.PI/4,0,0,1.6,7,1.6);addCollider(cx-2,cz-2,cx+2,cz+2,9);
    for(let n=0;n<14;n++){const x=cx+R(-25,25),z=cz+R(-25,25);if(Math.abs(x-cx)<4||Math.abs(z-cz)<4)continue;rng()<0.5?neem(x,z):palm(x,z)}},
  townhall(cx,cz){addBox(B_PLAIN,58,0.06,58,cx,0.19,cz,'#d9cfb8');
    building(cx,cz+6,34,18,12,'#ecdcbc',{noSign:true,noTank:true});addBox(B_PLAIN,35,1.2,19,cx,12.6,cz+6,'#a8432f');
    building(cx,cz-9,7,7,32,'#f0e4cc',{noSign:true,noTank:true});addG(B_PLAIN,GEO.cone4,cx,35.5,cz-9,'#a8432f',Math.PI/4,0,0,5.6,6,5.6);
    const cg=new THREE.CircleGeometry(2.1,24);
    for(let k=0;k<4;k++){const a=k*Math.PI/2,nx=Math.sin(a),nz=Math.cos(a);addG(B_PLAIN,cg,cx+nx*3.56,28,cz-9+nz*3.56,'#fbf6ea',a);
      addBox(B_PLAIN,0.18,1.6,0.05,cx+nx*3.62,28.6,cz-9+nz*3.62,'#222',a);addBox(B_PLAIN,1.2,0.18,0.05,cx+nx*3.62+Math.cos(a)*0.5,28,cz-9+nz*3.62-Math.sin(a)*0.5,'#222',a)}
    for(const sx of[-1,1]){palm(cx+sx*22,cz-22);palm(cx+sx*12,cz-22)}},
  hospital(cx,cz){building(cx,cz-6,40,18,20,'#f4f4f0',{noSign:true});
    addBox(B_PLAIN,6,1.6,0.3,cx,13,cz+3.1,'#d62828');addBox(B_PLAIN,1.6,6,0.3,cx,13,cz+3.1,'#d62828');
    addBox(B_PLAIN,14,0.3,6,cx,4,cz+6,'#e0e0e0');
    for(const sx of[-1,1])palm(cx+sx*20,cz+20);HOSP={x:cx,z:cz+24}},
  tower(cx,cz){building(cx-8,cz-4,22,22,74,'#86b6d9',{noSign:true,noTank:true});building(cx+15,cz+10,12,18,30,'#cfd8dc',{noSign:true});
    for(let k=-2;k<=2;k++)palm(cx+k*9,cz+22)},
  mill(cx,cz){for(const s of[-1,1]){building(cx-3,cz+s*12,42,15,8,'#cdb89a',{noSign:true,noTank:true});
      for(let k=0;k<7;k++)addG(B_PLAIN,GEO.box,cx-3-18+k*6,9.4,cz+s*12,'#8c8c8c',0,0,0.55,5.2,0.25,15)}
    addG(B_PLAIN,GEO.cyl,cx+22,17,cz,'#9c4a33',0,0,0,1.8,34,1.8);addG(B_PLAIN,GEO.cyl,cx+22,30,cz,'#eeeeee',0,0,0,1.85,1.2,1.85);
    addCollider(cx+20.2,cz-1.8,cx+23.8,cz+1.8,34)},
  busstand(cx,cz){addBox(B_PLAIN,52,0.08,48,cx,0.2,cz,'#9c9c9c');
    for(const zz of[cz-16,cz,cz+16]){addBox(B_PLAIN,44,0.35,5,cx,4.6,zz,'#2a6f97');
      for(let x=cx-21;x<=cx+21;x+=10.5){addBox(B_PLAIN,0.4,4.4,0.4,x,2.3,zz,'#dddddd');addCollider(x-0.25,zz-0.25,x+0.25,zz+0.25,4.6)}}
    building(cx-20,cz+22,10,5,4,'#f2c14e',{noTank:true})},
  temple(cx,cz){addBox(B_PLAIN,56,0.06,56,cx,0.19,cz,'#d8c9a8');
    const wall=(x,z,w,d)=>{const L=Math.max(w,d),n=Math.round(L/4);for(let k=0;k<n;k++){const t=-L/2+(k+.5)*L/n;addBox(B_PLAIN,w>d?L/n:w,3.6,w>d?d:L/n,w>d?x+t:x,1.8,w>d?z:z+t,k%2?'#f3eee2':'#b83227')}addCollider(x-w/2,z-d/2,x+w/2,z+d/2,3.6)};
    wall(cx,cz-26,52,0.8);wall(cx-26,cz,0.8,52);wall(cx+26,cz,0.8,52);wall(cx-16,cz+26,20,0.8);wall(cx+16,cz+26,20,0.8);
    const gz=cz+26,TC=['#f4a6a6','#9fd3e8','#f7e08a','#a7e0a3','#f5b97a','#c9b6ec','#f6f0e0'];
    for(const sx of[-1,1]){addBox(B_PLAIN,5,8,9,cx+sx*4.5,4,gz,'#d8c7a6');addCollider(cx+sx*4.5-2.5,gz-4.5,cx+sx*4.5+2.5,gz+4.5,8)}
    addBox(B_PLAIN,4,2,9,cx,7,gz,'#d8c7a6');
    let top=8;for(let t=0;t<7;t++){const w=14-t*1.5,d=9-t*0.85;addBox(B_PLAIN,w+0.5,0.3,d+0.5,cx,top+0.15,gz,'#8d6e63');addBox(B_PLAIN,w,2.2,d,cx,top+1.4,gz,TC[t]);top+=2.5}
    addG(B_PLAIN,GEO.cyl,cx,top+1.2,gz,'#e07a5f',0,0,Math.PI/2,1.5,4.2,1.5);
    for(let k=-2;k<=2;k++)addG(B_PLAIN,GEO.cone8,cx+k*0.8,top+3.1,gz,'#e8b923',0,0,0,0.28,1.3,0.28);
    // inner shrine
    {const SW='#e0d2b4';addBox(B_PLAIN,10,5,0.6,cx,2.5,cz-13.7,SW);addCollider(cx-5,cz-14,cx+5,cz-13.4,5);for(const sx of[-1,1]){addBox(B_PLAIN,0.6,5,10,cx+sx*4.7,2.5,cz-9,SW);addCollider(cx+sx*4.7-0.3,cz-14,cx+sx*4.7+0.3,cz-4,5);addBox(B_PLAIN,3.6,5,0.6,cx+sx*3.2,2.5,cz-4.3,SW);addCollider(cx+sx*3.2-1.8,cz-4.6,cx+sx*3.2+1.8,cz-4,5)}addBox(B_PLAIN,2.8,1.6,0.6,cx,4.2,cz-4.3,SW);addBox(B_PLAIN,9.4,0.3,9.4,cx,5,cz-9,SW);addBox(B_PLAIN,1.4,0.9,1.4,cx,0.6,cz-11.5,'#3a3a3a');addG(B_PLAIN,GEO.cyl,cx-1.5,0.7,cz-9.5,'#d4a017',0,0,0,0.18,1.1,0.18);addG(B_PLAIN,GEO.cyl,cx+1.5,0.7,cz-9.5,'#d4a017',0,0,0,0.18,1.1,0.18);FLAMES.push({x:cx-1.5,y:1.35,z:cz-9.5},{x:cx+1.5,y:1.35,z:cz-9.5})}
    for(let t=0;t<3;t++)addBox(B_PLAIN,8-t*2.2,1.6,8-t*2.2,cx,5.8+t*1.6,cz-9,TC[t+2]);
    addG(B_PLAIN,GEO.sph,cx,10.6,cz-9,'#e8b923',0,0,0,1.4,1.4,1.4);
    // mandapam
    addBox(B_PLAIN,16,0.6,9,cx,4.3,cz+4,'#cbb894');
    for(const sx of[-7,-2.4,2.4,7])for(const sz of[0.5,7.5]){addBox(B_PLAIN,0.6,4,0.6,cx+sx,2,cz+sz,'#d9c9a6');addCollider(cx+sx-0.3,cz+sz-0.3,cx+sx+0.3,cz+sz+0.3,4)}
    addG(B_PLAIN,GEO.cyl,cx,5,cz+15,'#e8b923',0,0,0,0.22,10,0.22);addCollider(cx-0.3,cz+14.7,cx+0.3,cz+15.3,10);
    for(const sx of[-1,1]){palm(cx+sx*20,cz-20);palm(cx+sx*20,cz+18);neem(cx+sx*14,cz-18)}}
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
function building(x,z,w,d,h,color,opts){opts=opts||{};if(!opts.keep&&onNewRoad(x+BO.x,z+BO.z,Math.max(w,d)/2+1))return;/* D4: keep buildings off the new roads */
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


/* ================= terrain: Western Ghats ================= */
const TER={x0:-1182-GX,x1:-552-GX,z0:-1500,z1:1500,res:6};let tH=null,tRD=null,tNX=0,tNZ=0;
function hash2(x,z){let h=Math.imul(x|0,374761393)+Math.imul(z|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
  const a=hash2(xi,zi),b=hash2(xi+1,zi),c=hash2(xi,zi+1),d=hash2(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,z){let s=0,a=0.5,f=1;for(let i=0;i<5;i++){s+=a*vnoise(x*f,z*f);f*=2.03;a*=0.5}return s}
function rawMountain(x,z){x+=GX;/* shape defined in pre-D2 coordinates */const r=smooth(-560,-1010,x);if(r<=0)return 0;const n=fbm(x*0.0045+11,z*0.0045-5),ridge=1-Math.abs(fbm(x*0.009+7,z*0.009-3)*2-1);return Math.pow(r,1.35)*(140+n*110)+r*ridge*40}
const GHAT_CP=[[-548,0],[-600,0],[-650,8],[-688,40],[-700,110],[-708,152],[-730,175],[-758,168],[-768,120],[-768,-110],[-782,-160],[-812,-176],[-836,-150],[-846,-60],[-846,110],[-862,160],[-892,176],[-916,150],[-926,60],[-932,-60],[-948,-130],[-978,-152],[-1015,-152]].map(p=>[p[0]-GX,p[1]]);/* moved west with the hills (D2) */
let GHAT=[],GHAT_TOP=null,FALLS=null;
function buildGhatPath(){const curve=new THREE.CatmullRomCurve3(GHAT_CP.map(p=>new THREE.Vector3(p[0],0,p[1])),false,'centripetal');const L=curve.getLength(),n=Math.round(L/3);const pts=curve.getSpacedPoints(n);
  let top=0;for(let a=0;a<12;a++)for(const rr of[0,25,50])top=Math.max(top,rawMountain(-1015-GX+Math.cos(a/2)*rr,-152+Math.sin(a/2)*rr));top=Math.min(250,top+5);GHAT=pts.map((p,i)=>({x:p.x,z:p.z,h:Math.max(0,top*Math.pow(i/n,1.05))}));GHAT_TOP=GHAT[GHAT.length-1]}
function buildTerrainGrid(){buildGhatPath();tNX=Math.round((TER.x1-TER.x0)/TER.res)+1;tNZ=Math.round((TER.z1-TER.z0)/TER.res)+1;tH=new Float32Array(tNX*tNZ);tRD=new Float32Array(tNX*tNZ);
  const hs=new Map(),C=30;GHAT.forEach((p,i)=>{const k=Math.floor(p.x/C)*7919+Math.floor(p.z/C);let l=hs.get(k);if(!l){l=[];hs.set(k,l)}l.push(i)});
  for(let iz=0;iz<tNZ;iz++)for(let ix=0;ix<tNX;ix++){const x=TER.x0+ix*TER.res,z=TER.z0+iz*TER.res;let h=rawMountain(x,z);
    let bd=1e9,bh=0;const cx=Math.floor(x/C),cz=Math.floor(z/C);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=hs.get((cx+a)*7919+cz+b);if(!l)continue;for(const i of l){const p=GHAT[i],d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;bh=p.h}}}
    bd=Math.sqrt(bd);const dt=Math.hypot(x-GHAT_TOP.x,z-GHAT_TOP.z);
    if(bd<7)h=bh;else if(bd<24){const t=smooth(7,24,bd);h=bh+(h-bh)*t}
    if(dt<50){const t=smooth(26,50,dt);h=GHAT_TOP.h+(h-GHAT_TOP.h)*t;if(dt<26)bd=Math.min(bd,6)}
    if(x>-566-GX)h*=smooth(-552-GX,-570-GX,x);tH[iz*tNX+ix]=h;tRD[iz*tNX+ix]=bd}}
function terrainH(x,z){if(!tH)return 0;const fx=(x-TER.x0)/TER.res,fz=(z-TER.z0)/TER.res;if(fx<0||fz<0||fx>=tNX-1||fz>=tNZ-1)return 0;const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,i=iz*tNX+ix;
  return tH[i]*(1-u)*(1-v)+tH[i+1]*u*(1-v)+tH[i+tNX]*(1-u)*v+tH[i+tNX+1]*u*v}
function roadDist(x,z){if(!tRD)return 1e9;const ix=Math.round((x-TER.x0)/TER.res),iz=Math.round((z-TER.z0)/TER.res);if(ix<0||iz<0||ix>=tNX||iz>=tNZ)return 1e9;return tRD[iz*tNX+ix]}
const TREES=[];
function buildTerrainMesh(){const pos=[],col=[],uv=[],idx=[];const c=new THREE.Color();
  for(let iz=0;iz<tNZ;iz++)for(let ix=0;ix<tNX;ix++){const x=TER.x0+ix*TER.res,z=TER.z0+iz*TER.res,h=tH[iz*tNX+ix];pos.push(x,h,z);uv.push(x/10,z/10);
    const hx=tH[iz*tNX+Math.min(tNX-1,ix+1)]-tH[iz*tNX+Math.max(0,ix-1)],hz=tH[Math.min(tNZ-1,iz+1)*tNX+ix]-tH[Math.max(0,iz-1)*tNX+ix],slope=Math.hypot(hx,hz)/(2*TER.res),rd=tRD[iz*tNX+ix],n=fbm(x*0.02,z*0.02);
    if(rd<6.5)c.set('#6b6152');else if(slope>0.85)c.set(n>0.5?'#77736a':'#6a665e');else if(h>28&&h<120&&slope<0.5&&fbm(x*0.006+3,z*0.006)>0.48)c.set(Math.sin(h*1.7)>0?'#3f7d33':'#2d5e27');
    else if(h>8)c.set(n>0.55?'#3d6b35':'#4a7a3c');else c.set(n>0.5?'#7d8f4e':'#8c9a5e');c.multiplyScalar(0.92+n*0.16);col.push(c.r,c.g,c.b);
    if(ix<tNX-1&&iz<tNZ-1){const a=iz*tNX+ix;idx.push(a,a+tNX,a+1,a+1,a+tNX,a+tNX+1)}
    if(rd>12&&h>6&&slope<0.75&&hash2(ix*3+1,iz*7+2)<QS.trees/(tNX*tNZ)*1.4&&Math.abs(z)<900)TREES.push([x+R(-2,2),h,z+R(-2,2)])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:TX.detail}));m.receiveShadow=true;scene.add(m);
  // ghat road ribbon, edge lines, posts
  for(let i=0;i<GHAT.length-1;i++){const a=GHAT[i],b=GHAT[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,px=-dz/l,pz=dx/l,W=4.6;
    const ya=terrainH(a.x,a.z)+0.07,yb=terrainH(b.x,b.z)+0.07;
    quad(B_ROAD,[a.x-px*W,ya,a.z-pz*W],[a.x+px*W,ya,a.z+pz*W],[b.x+px*W,yb,b.z+pz*W],[b.x-px*W,yb,b.z-pz*W],[a.x/8,a.z/8],[a.x/8+1.15,a.z/8],[b.x/8+1.15,b.z/8],[b.x/8,b.z/8]);
    for(const s of[-1,1])quad(B_PLAIN,[a.x+px*s*4.2,ya+0.01,a.z+pz*s*4.2],[a.x+px*s*4.35,ya+0.01,a.z+pz*s*4.35],[b.x+px*s*4.35,yb+0.01,b.z+pz*s*4.35],[b.x+px*s*4.2,yb+0.01,b.z+pz*s*4.2],[0,0],[0,0],[0,0],[0,0],'#e8e2c8');
    if(i%3===0)quad(B_PLAIN,[a.x-px*0.08,ya+0.01,a.z-pz*0.08],[a.x+px*0.08,ya+0.01,a.z+pz*0.08],[b.x+px*0.08,yb+0.01,b.z+pz*0.08],[b.x-px*0.08,yb+0.01,b.z-pz*0.08],[0,0],[0,0],[0,0],[0,0],'#f2c200');
    if(i%2===0&&i>10)for(const s of[-1,1]){const x=a.x+px*s*5.3,z=a.z+pz*s*5.3,y=terrainH(x,z);if(Math.abs(y-ya)<1.5)addBox(B_PLAIN,0.18,0.8,0.18,x,y+0.4,z,(i/2)%2?'#f4f4f4':'#1a1a1a')}}
  // hill village + viewpoint + falls
  for(const f of[0.22,0.48,0.7]){const i=Math.floor(GHAT.length*f);for(let k=0;k<3;k++){const p=GHAT[Math.min(GHAT.length-1,i+k*6)],q=GHAT[Math.min(GHAT.length-1,i+k*6+1)],dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz)||1,s=k%2?1:-1;
    const x=p.x-dz/l*s*13,z=p.z+dx/l*s*13,y=terrainH(x,z),w=R(6,8),d=R(5,7),hh=R(3.2,4.2),c=pick(['#f2e6c9','#cfe3e8','#f3c6c0','#d7e8c8','#efd28a']);
    addG(B_FAC[0],buildingGeo(w,hh+4,d),x,y-4+(hh+4)/2,z,c);addG(B_PLAIN,GEO.cone4,x,y+hh+1.1,z,'#a8432f',Math.PI/4,0,0,w*0.78,2.2,d*0.78);addCollider(x-w/2,z-d/2,x+w/2,z+d/2,y+hh,y-4)}}
  const T=GHAT_TOP;addG(B_PLAIN,GEO.cyl16,T.x-12,T.h+0.5,T.z,'#cfc6b2',0,0,0,4,1,4);
  for(let a=-1.4;a<=1.4;a+=0.14){const x=T.x+Math.cos(a+Math.PI)*24,z=T.z+Math.sin(a+Math.PI)*24,y=terrainH(x,z);addBox(B_PLAIN,0.15,1.0,0.15,x,y+0.5,z,'#e8e2c8');addCollider(x-0.6,z-0.6,x+0.6,z+0.6,y+1.1,y-2)}
  addBox(B_PLAIN,4,3,4,T.x-12,T.h+2.5,T.z,'#f2e6c9');for(let t=0;t<3;t++)addBox(B_PLAIN,3.4-t,0.9,3.4-t,T.x-12,T.h+4.4+t*0.9,T.z,['#f4a6a6','#9fd3e8','#f7e08a'][t]);addCollider(T.x-14,T.z-2,T.x-10,T.z+2,T.h+6,T.h-1);
  teaStallAt(T.x+8,T.z+12,T.h,-1);PLACES.push({n:'the hilltop viewpoint',x:T.x,z:T.z+6});PARKED.push({type:'jeep',x:T.x+6,z:T.z-10,h:0});
  {const i=Math.floor(GHAT.length*0.36),p=GHAT[i],q=GHAT[i+1],dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz);let s=1;if(terrainH(p.x+dz/l*20,p.z-dx/l*20)<terrainH(p.x-dz/l*20,p.z+dx/l*20))s=-1;
    const fx=p.x+dz/l*s*8.6,fz=p.z-dx/l*s*8.6,by=p.h,topY=Math.max(by+10,terrainH(p.x+dz/l*s*16,p.z-dx/l*s*16)+2),fh=topY-by+1;
    const fm=new THREE.Mesh(new THREE.PlaneGeometry(6,fh),new THREE.MeshLambertMaterial({map:TX.falls,transparent:true,opacity:0.85,side:THREE.DoubleSide,emissive:0x0d1a20}));fm.position.set(fx,by+fh/2-0.5,fz);fm.lookAt(p.x,by+fh/2-0.5,p.z);fm.rotation.x+=0;scene.add(fm);for(let k=0;k<5;k++)addG(B_PLAIN,GEO.sph,fx+R(-4,4),by+R(-0.5,1),fz+R(-1.5,1.5),'#4d4b47',0,0,0,R(1,1.8),R(0.8,1.4),R(1,1.8));
    const pool=new THREE.Mesh(new THREE.CircleGeometry(5,20),waterMaterial(true));pool.rotation.x=-Math.PI/2;pool.position.set(p.x+(fx-p.x)*0.62,by+0.25,p.z+(fz-p.z)*0.62);pool.scale.setScalar(0.75);scene.add(pool);
    for(let k=0;k<7;k++)addG(B_PLAIN,GEO.sph,fx+R(-6,6),by+R(0,2),fz+R(-3,3),pick(['#5c5a55','#6e6b64','#4d4b47']),0,0,0,R(1,2.2),R(0.8,1.6),R(1,2));
    FALLS={m:fm,x:fx,y:by,z:fz};PLACES.push({n:'the hill falls',x:p.x,z:p.z})}}
function buildTrees(){const n=TREES.length;if(!n)return;const tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25,0.4,1,6).translate(0,0.5,0),M('#5e4632'),n),f1=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,7).translate(0,0.5,0),M('#2f5a2b'),n),f2=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,7).translate(0,0.5,0),M('#3b6b33'),n);
  const o=new THREE.Object3D();TREES.forEach(([x,y,z],i)=>{const s=R(0.8,1.4);o.position.set(x,y-0.3,z);o.rotation.set(0,R(0,6),0);o.scale.set(s,4*s,s);o.updateMatrix();tr.setMatrixAt(i,o.matrix);
    o.position.set(x,y+2.4*s,z);o.scale.set(3*s,6*s,3*s);o.updateMatrix();f1.setMatrixAt(i,o.matrix);o.position.set(x,y+5.4*s,z);o.scale.set(2.1*s,4.5*s,2.1*s);o.updateMatrix();f2.setMatrixAt(i,o.matrix)});
  for(const m of[tr,f1,f2]){m.frustumCulled=false;m.castShadow=QS.shadow>0;scene.add(m)}}

/* ================= Kovai Reservoir (fictional; D5 turned the old coast into a reservoir with hills on the far shore), water ================= */
const SHORE0=684,SHORE=SHORE0+GX;/* SHORE0: pre-D2 coordinates used inside coastH and buildCoast */
function coastH(x,z){x-=GX;if(x<598)return 0;let h;if(x<622)h=0.12;else if(x<SHORE0){const t=(SHORE0-x)/(SHORE0-622);h=0.12*t+(vnoise(x*0.08,z*0.05)-0.5)*0.5*t*t}else h=-(x-SHORE0)*0.075-0.02;
  const dl=Math.hypot(x-700,z+420);if(dl<46)h=Math.max(h,7.5*(1-dl/46)*(1-dl/46)*1.4);return Math.max(-9,h)}
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
function seaDepth(x,z){if(REALMAP||x<SHORE-6)return 0;return Math.max(0,waveY(x,z)-coastH(x,z))}
function isDeep(x,z){return inLake(x,z)||seaDepth(x,z)>1.35}
function humanY(x,z,y){if(inLake(x,z))return -1.0;if(x>SHORE-6&&seaDepth(x,z)>1.35)return waveY(x,z)-1.12;return surfaceH(x,z,y)}
function buildCoast(){shifted(GX,0,buildCoast0)}/* built in pre-D2 coordinates, moved east by GX (D2) */
function buildCoast0(){const x0=592,x1=1012,res=5,nx=Math.round((x1-x0)/res)+1,z0=-1500,nz=Math.round(3000/6)+1;const pos=[],col=[],uv=[],idx=[];const c=new THREE.Color();
  for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){const x=x0+ix*res,z=z0+iz*6,h=coastH(x+GX,z);pos.push(x,h,z);uv.push(x/8,z/8);const n=vnoise(x*0.1,z*0.1);
    if(Math.hypot(x-700,z+420)<44&&h>1.2)c.set(n>0.5?'#7a756c':'#6a665e');else if(x<604)c.set('#9aa36a');else if(h>0.05)c.set(n>0.5?'#8c9a5e':'#7d8f4e');else if(h>-0.6)c.set('#8a7a5a');else c.set(h>-3?'#6e6650':'#5a5444');/* D5: grassy and muddy reservoir banks */
    c.multiplyScalar(0.94+n*0.12);col.push(c.r,c.g,c.b);if(ix<nx-1&&iz<nz-1){const a=iz*nx+ix;idx.push(a,a+nx,a+1,a+1,a+nx,a+nx+1)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:TX.detail}));m.receiveShadow=true;m.position.x=GX;scene.add(m);
  const wm=waterMaterial(false);const sea=(xa,xb,za,zb,sx,sz)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(xb-xa,zb-za,sx,sz),wm);p.rotation.x=-Math.PI/2;p.position.set((xa+xb)/2+GX,0,(za+zb)/2);p.frustumCulled=false;scene.add(p)};
  sea(640,1120,-900,900,96,180);sea(1120,3800,-3000,3000,60,80);sea(640,1120,900,3000,24,30);sea(640,1120,-3000,-900,24,30);
  // coastal road + link
  addFlat(B_ROAD,598,-540,612,540,0.14,'#ffffff',8);addFlat(B_ROAD,BOUND-GX-2,-HR,606,HR,0.03,'#ffffff',8);for(let z=-536;z<536;z+=9)addBox(B_PLAIN,0.22,0.02,3,605,0.16,z,'#e8e2c8');
  for(let z=-530;z<=530;z+=18){if(Math.abs(z)<12)continue;palm(594,z+R(-2,2));palm(R(618,626),z+R(-4,4))}
  for(let k=0;k<8;k++){const z=-300+k*80+R(-10,10),x=630,cc=pick(['#e63946','#2a9d8f','#f4a261','#457b9d','#ffb703']);addBox(B_PLAIN,4.4,2.6,3.4,x,1.43,z,cc);addBox(B_PLAIN,3.4,1.0,0.6,x,0.65,z+1.9,'#7a5536');
    addG(B_PLAIN,GEO.cone4,x,3.6,z,'#8d6e3c',Math.PI/4,0,0,3.9,1.8,3.2);addCollider(x-2.2,z-1.7,x+2.2,z+1.7,2.8);WZONES.push({cx:x+4+GX,cz:z+4,rx:3,rz:3,n:1,kind:'beach'})}
  /* D5: beach umbrellas removed */
  for(let k=0;k<6;k++){const x=R(660,676),z=-120+k*40+R(-6,6);for(const s of[-0.45,0.45])addG(B_PLAIN,GEO.cyl8,x+s,0.3,z,'#7a5536',Math.PI/2,0,0,0.22,7,0.22);addG(B_PLAIN,GEO.cyl8,x,1.6,z+1,'#6d4c41',0,0,0,0.06,3,0.06)}
  {const x=652,z=120;for(const sx of[-1,1])for(const sz of[-1,1])addBox(B_PLAIN,0.15,3,0.15,x+sx*1,1.5,z+sz*1,'#f4f4f4');addBox(B_PLAIN,2.4,0.2,2.4,x,3.1,z,'#c1121f');addBox(B_PLAIN,2.6,0.15,2.6,x,4.6,z,'#f4f4f4');addCollider(x-1.2,z-1.2,x+1.2,z+1.2,3.2)}
  // watchtower on the headland (was a lighthouse before D5)
  {const x=700,z=-420,y=coastH(700+GX,-420);addG(B_PLAIN,GEO.cyl16,x,y+2,z,'#cfc6b2',0,0,0,4.2,4,4.2);for(let k=0;k<6;k++)addG(B_PLAIN,CY(1,1,1,16),x,y+4+k*4.5+2.25,z,k%2?'#d9d2c4':'#b8ad97',0,0,0,3-k*0.13,4.5,3-k*0.13);
    addG(B_PLAIN,GEO.cyl16,x,y+31.3,z,'#333',0,0,0,2.9,0.4,2.9);addG(B_PLAIN,GEO.cyl16,x,y+32.8,z,'#8fb8c8',0,0,0,1.6,2.6,1.6);addG(B_PLAIN,GEO.cone8,x,y+35,z,'#c1121f',0,0,0,2,1.8,2);addCollider(x-4.2,z-4.2,x+4.2,z+4.2,y+36,-10);
    PLACES.push({n:'the reservoir watchtower',x:676+GX,z:-400})}/* D5: the lighthouse is now a stone watchtower without a beam */
  // jetty
  {const z=200,y=1.4;addBox(B_PLAIN,120,0.25,5,720,y-0.12,z,'#8b6b4a');for(let x=662;x<=780;x+=6)for(const s of[-2.3,2.3])addG(B_PLAIN,GEO.cyl8,x,(y-6)/2,z+s,'#5d4030',0,0,0,0.18,y+6,0.18);
    for(const s of[-1,1]){addBox(B_PLAIN,120,0.1,0.1,720,y+0.9,z+s*2.45,'#6d4c41');addCollider(660,z+s*2.5-0.15,780,z+s*2.5+0.15,y+1,y-0.3)}
    SURF.push({minX:660+GX,maxX:780+GX,minZ:z-2.5,maxZ:z+2.5,h:()=>y});SURF.push({minX:648+GX,maxX:660+GX,minZ:z-2.5,maxZ:z+2.5,h:x=>Math.max(0.1,y*(x-GX-648)/12)});addG(B_PLAIN,GEO.box,654,y/2,z,'#8b6b4a',0,0,Math.atan2(y,12),12.2,0.2,5);
    PARKED.push({type:'speedboat',x:786+GX,z:z-4,h:Math.PI/2},{type:'speedboat',x:786+GX,z:z+4,h:Math.PI/2},{type:'fishboat',x:770+GX,z:z+12,h:Math.PI/2},{type:'fishboat',x:760+GX,z:z-13,h:Math.PI/2});PLACES.push({n:'the jetty',x:650+GX,z:208})}
  WZONES.push({cx:650+GX,cz:-60,rx:20,rz:180,n:10,kind:'beach'},{cx:650+GX,cz:260,rx:16,rz:120,n:6,kind:'beach'});PLACES.push({n:'the reservoir bank',x:640+GX,z:40});
  for(let n=0;n<26;n++){const h=R(90,220),r=h*R(1.3,2);addG(B_FAR,GEO.cone7,R(1300,1900),h/2-10,R(-1500,1500),pick(['#58705a','#4c6650','#617a5c']),R(0,6),0,0,r,h,r)}/* D5: hills on the far shore */
  /* D5: sunbathers removed */}

/* ================= new city places ================= */
const WZONES=[],STATICS=[],PARKED=[],WANDER=[];
BUILD.market=function(cx,cz){addFlat(B_SIDE,cx-29,cz-29,cx+29,cz+29,0.18,'#e9e2d0',2.5);
  const PRODUCE=[['#d62828',0.12,'s'],['#9c4a8a',0.11,'s'],['#e76f51',0.1,'s'],['#f2c200',0.1,'b'],['#4b7f2a',0.18,'s'],['#2b9348',0.12,'s'],['#ffffff',0.06,'s']];
  for(let a=0;a<4;a++)for(let b=0;b<3;b++){const x=cx-20+a*13.3,z=cz-17+b*14;addBox(B_PLAIN,3.2,0.9,1.6,x,0.6,z,'#7a5536');addCollider(x-1.6,z-0.8,x+1.6,z+0.8,1.1);
    for(const sx of[-1.6,1.6])for(const sz of[-1.1,1.1])addBox(B_PLAIN,0.08,2.4,0.08,x+sx,1.35,z+sz,'#6d4c41');addG(B_PLAIN,GEO.box,x,2.5,z,pick(['#1d4ed8','#f77f00','#2b9348','#e63946','#7b2cbf']),0.18,0,0,3.8,0.06,2.8);
    const pr=pick(PRODUCE);for(let q=0;q<16;q++){const px=x+R(-1.4,1.4),pz=z+R(-0.6,0.6);if(pr[2]==='b')addBox(B_PLAIN,0.22,0.08,0.08,px,1.1,pz,pr[0],R(0,3));else addG(B_PLAIN,GEO.sph,px,1.1+pr[1],pz,pr[0],0,0,0,pr[1],pr[1],pr[1])}
    STATICS.push({x,z:z-1.3,yaw:0,vendor:true})}
  const sign=textPlane('KOVAI MARKET',12,1.6,'#c1121f','#ffffff');sign.position.set(cx,5.2,cz+29.2);for(const s of[-1,1]){addBox(B_PLAIN,0.6,5.6,0.6,cx+s*7,2.8,cz+29.2,'#d9c9a6');addCollider(cx+s*7-0.3,cz+28.9,cx+s*7+0.3,cz+29.5,5.6)}
  WZONES.push({cx,cz:cz+4,rx:24,rz:22,n:14,kind:'market'});PLACES.push({n:'Kovai Market',x:cx,z:cz+33})};
BUILD.college=function(cx,cz){addBox(B_PLAIN,58,0.06,58,cx,0.19,cz,'#7fae5a');addFlat(B_SIDE,cx-2.5,cz-10,cx+2.5,cz+30,0.23,'#e9e2d0',2.5);
  building(cx,cz-18,46,14,13.6,'#c26d4b',{style:1,noShop:true,noSign:true,noTank:true});building(cx-19,cz+2,10,22,10.2,'#c26d4b',{style:1,noShop:true,noSign:true,noTank:true});building(cx+19,cz+2,10,22,10.2,'#c26d4b',{style:1,noShop:true,noSign:true,noTank:true});
  addBox(B_PLAIN,8,4,4,cx,15.6,cz-18,'#c26d4b');addG(B_PLAIN,GEO.cone4,cx,19.5,cz-18,'#7b2d1d',Math.PI/4,0,0,6.4,3,3.4);
  for(const s of[-1,1]){addBox(B_PLAIN,1.2,6,1.2,cx+s*5,3,cz+28.5,'#d9c9a6');addCollider(cx+s*5-0.6,cz+27.9,cx+s*5+0.6,cz+29.1,6)}addBox(B_PLAIN,11.6,1.2,1.2,cx,6.4,cz+28.5,'#d9c9a6');
  const sg=textPlane('KOVAI INSTITUTE OF TECHNOLOGY',10,0.9,'#1d3557','#f2d13a');sg.position.set(cx,6.4,cz+29.15);
  for(let k=0;k<6;k++)neem(cx+R(-24,24),cz+R(12,24));for(let k=0;k<5;k++)PARKED.push({type:rpick(['scooter','retro','cycle','moped']),x:cx-12+k*2.2,z:cz+22,h:0});
  WZONES.push({cx,cz:cz+6,rx:14,rz:12,n:10,kind:'college'});PLACES.push({n:'the college campus',x:cx,z:cz+33})};
BUILD.station=function(cx,cz){addBox(B_PLAIN,58,0.06,58,cx,0.19,cz,'#bdb5a3');/* D3: Coimbatore Junction. The through line still runs along the south edge, so this is a terminus with buffer stops */
  for(const tz of[cz+10,cz+22]){addBox(B_PLAIN,52,0.2,4,cx+2,0.27,tz,'#7a7064');for(const d of[-0.75,0.75])addBox(B_PLAIN,52,0.14,0.12,cx+2,0.4,tz+d,'#4e535a');addBox(B_PLAIN,1,1.2,3,cx-24.5,0.8,tz,'#c1121f');addCollider(cx-25,tz-1.5,cx-24,tz+1.5,1.4)}
  addBox(B_PLAIN,50,0.9,6,cx+3,0.45,cz+16,'#d6cfc0');SURF.push({minX:cx-22,maxX:cx+28,minZ:cz+13,maxZ:cz+19,h:()=>0.9});addBox(B_PLAIN,46,0.3,8,cx+3,5,cz+16,'#9c3b2a');
  for(let x=cx-18;x<=cx+24;x+=10.5){addBox(B_PLAIN,0.35,4.1,0.35,x,2.95,cz+16,'#d8d2c4');addCollider(x-0.2,cz+15.8,x+0.2,cz+16.2,5)}
  wallW(cx,cz-14,50,14,9,0,'#a64b2a');addBox(B_PLAIN,51,0.6,15,cx,9.3,cz-14,'#7b2d1d');addG(B_WIN,buildingGeo(12,6,4),cx,12,cz-14,'#a64b2a');addG(B_PLAIN,GEO.cone4,cx,16.5,cz-14,'#7b2d1d',Math.PI/4,0,0,8,3,4);
  const sg=textPlane('COIMBATORE JUNCTION',16,2.2,'#f2d13a','#111');sg.position.set(cx,7.4,cz-6.9);PLACES.push({n:'Coimbatore Junction station',x:cx,z:cz-33})};
BUILD.airport=function(cx,cz){addBox(B_PLAIN,58,0.06,58,cx,0.19,cz,'#8c8c88');for(let x=cx-26;x<=cx+26;x+=6.5)addBox(B_PLAIN,3,0.02,0.3,x,0.23,cz+8,'#f2d13a');
  building(cx,cz-18,50,14,11,'#cfe3e8',{noShop:true,noSign:true,noTank:true});addBox(B_PLAIN,52,0.6,16,cx,11.3,cz-18,'#e8e8e8');
  addG(B_PLAIN,GEO.cyl,cx+22,11,cz+18,'#d9d9d9',0,0,0,1.6,22,1.6);addG(B_PLAIN,GEO.cyl,cx+22,23,cz+18,'#2a6f97',0,0,0,3,2.4,3);addCollider(cx+20.4,cz+16.4,cx+23.6,cz+19.6,24.2);
  addG(B_PLAIN,GEO.cyl,cx-6,2.4,cz+12,'#f4f4f4',0,0,Math.PI/2,1.4,22,1.4);addBox(B_PLAIN,4,0.3,24,cx-6,2.2,cz+12,'#e0e0e0');addBox(B_PLAIN,0.3,4,2.6,cx-16.5,4.4,cz+12,'#1d4ed8');addCollider(cx-17,cz+10.5,cx+5,cz+13.5,3.8);
  const sg=textPlane('COIMBATORE AIRPORT',14,1.6,'#1d3557','#ffffff');sg.position.set(cx,9,cz-10.9);PLACES.push({n:'the airport',x:cx,z:cz+33})};/* D3: simplified terminal, control tower and a parked plane */
BUILD.stadium=function(cx,cz){addG(B_PLAIN,new THREE.CircleGeometry(1,40),cx,0.2,cz,'#5f9e3e',0,-Math.PI/2,0,19,15,1);addG(B_PLAIN,new THREE.RingGeometry(15,18,44),cx,0.21,cz,'#b5583a',0,-Math.PI/2,0,1.22,1,1);
  for(let k=0;k<30;k++){const a=k/30*Math.PI*2;if(Math.abs(Math.sin(a)-1)<0.08&&Math.cos(a)>-0.3&&Math.cos(a)<0.3)continue;if(Math.abs(a-Math.PI/2)<0.25)continue;
    for(let t=0;t<3;t++){const rx=23.5+t*1.6,rz=19.5+t*1.6,x=cx+Math.cos(a)*rx,z=cz+Math.sin(a)*rz,hh=1.0+t*1.3;addBox(B_PLAIN,5.2,hh,1.6,x,hh/2,z,'#bdb8ad',-a+Math.PI/2);addBox(B_PLAIN,5.0,0.12,1.4,x,hh+0.06,z,pick(['#1d4ed8','#f2c200','#c1121f']),-a+Math.PI/2)}
    const x=cx+Math.cos(a)*25,z=cz+Math.sin(a)*21;addCollider(x-2,z-2,x+2,z+2,4.5)}
  for(const sx of[-1,1])for(const sz of[-1,1]){const x=cx+sx*27,z=cz+sz*26;addG(B_PLAIN,GEO.cyl8,x,14,z,'#9aa0a6',0,0,0,0.35,28,0.35);addBox(B_PLAIN,3.4,2,0.4,x,28.5,z,'#fffbe6',Math.atan2(-sx,-sz));addCollider(x-0.4,z-0.4,x+0.4,z+0.4,28)}
  const sg=textPlane('KOVAI STADIUM',10,1.4,'#0f766e','#ffffff');sg.position.set(cx,5.6,cz+27.5);
  WZONES.push({cx,cz,rx:14,rz:10,n:8,kind:'stadium'});PLACES.push({n:'Kovai Stadium',x:cx,z:cz+33})};
function teaStallAt(x,z,y,fz){addBox(B_PLAIN,2.6,1.0,1.1,x,y+0.5,z,'#2a9d8f');addBox(B_PLAIN,2.7,0.08,1.2,x,y+1.04,z,'#dddddd');addBox(B_PLAIN,2.6,2.2,0.12,x,y+1.1,z-fz*1.2,'#6d4c41');
  addG(B_PLAIN,GEO.box,x,y+2.4,z,'#d62828',fz*0.25,0,0,3.2,0.08,2.6);addG(B_PLAIN,GEO.cyl,x-0.7,y+1.35,z,'#c0c6cc',0,0,0,0.22,0.5,0.22);addCollider(x-1.3,z-0.55,x+1.3,z+0.55,y+1.2,y-1);STALLS.push({x,z:z+fz*1.4,cx:x,cz:z,fz,y})}


/* ================= living city: landmarks, sky, weather ================= */
const TRACKZ=ox(405),STATUE={x:ox(-480),z:-200},FLY={xa:86,x1:126,x2:300,xb:340,H:7,hw:6.5};
const FLY_CLEAR=3.6; // clearance (m) under the flyover deck that the tallest vehicles need
const LAKES=[],SURF=[],STALLS=[],MALLPEOPLE=[],CROSS=[],FLAMES=[];
function excluded(x,z){if(onNewRoad(x,z,4))return true;if(Math.abs(z-TRACKZ)<16)return true;if(extraExcluded(x,z))return true;if(x>30&&x<190&&z>ox(372)&&z<ox(425))return true;
  if(x>ox(-540)&&x<ox(-420)&&z>-262&&z<-140)return true;if(Math.abs(x-STATUE.x)<6&&z>-200&&z<0)return true;return false}
function flyH(x){return x<FLY.x1?FLY.H*(x-FLY.xa)/(FLY.x1-FLY.xa):x>FLY.x2?FLY.H*(FLY.xb-x)/(FLY.xb-FLY.x2):FLY.H}
function surfaceH(x,z,y){let best=groundH(x,z);if(REALMAP){const h=geoDeckH(x,z,y);if(h>best)best=h}/* flyover and bridge decks */for(const s of SURF){if(x<s.minX||x>s.maxX||z<s.minZ||z>s.maxZ)continue;const hh=s.h(x,z);if(hh>best&&y>=hh-1.6)best=hh}return best}
function inLake(x,z){if(REALMAP)return geoInWater(x,z);for(const L of LAKES)if(Math.abs(x-L.cx)<27.3&&Math.abs(z-L.cz)<27.3)return true;return false}

function textPlane(txt,w,h,bg,fg,font){const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const g=c.getContext('2d');
  g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.font=font||`bold ${Math.round(c.height*0.62)}px "Bebas Neue",Impact,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,c.width/2,c.height/2+2);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));scene.add(m);return m}
function wallW(x,z,w,d,h,y0,col){y0=y0||0;addG(B_WIN,buildingGeo(w,h,d),x,y0+h/2,z,col);addCollider(x-w/2,z-d/2,x+w/2,z+d/2,y0+h,y0>0?y0:-1)}

function buildExtras(){buildKoniamman();buildStreetSigns();buildArterials();buildFlyover();buildRail();buildStatue();buildTeaStalls();buildPlayExtras()}

/* --- Avinashi Road style flyover (east, over the main road) --- */
function buildFlyover(){const{xa,x1,x2,xb,H,hw}=FLY,L=Math.hypot(x1-xa,H),a=Math.atan2(H,x1-xa);
  addBox(B_PLAIN,x2-x1,0.7,hw*2,(x1+x2)/2,H-0.35,0,'#9a9a96');addBox(B_PLAIN,x2-x1,0.05,hw*2-1,(x1+x2)/2,H+0.02,0,'#4a4b50');
  addG(B_PLAIN,GEO.box,(xa+x1)/2,H/2-0.35,0,'#9a9a96',0,0,a,L,0.7,hw*2);addG(B_PLAIN,GEO.box,(xa+x1)/2,H/2-0.32,0,'#4a4b50',0,0,a,L,0.05,hw*2-1);
  addG(B_PLAIN,GEO.box,(x2+xb)/2,H/2-0.35,0,'#9a9a96',0,0,-a,L,0.7,hw*2);addG(B_PLAIN,GEO.box,(x2+xb)/2,H/2-0.32,0,'#4a4b50',0,0,-a,L,0.05,hw*2-1);
  for(const sz of[-1,1]){addBox(B_PLAIN,x2-x1,1.0,0.35,(x1+x2)/2,H+0.5,sz*(hw-0.2),'#c9c6bd');
    addG(B_PLAIN,GEO.box,(xa+x1)/2,H/2+0.5,sz*(hw-0.2),'#c9c6bd',0,0,a,L,1.0,0.35);addG(B_PLAIN,GEO.box,(x2+xb)/2,H/2+0.5,sz*(hw-0.2),'#c9c6bd',0,0,-a,L,1.0,0.35)}
  for(let x=x1+4;x<x2-4;x+=9)addBox(B_PLAIN,3,0.02,0.22,x,H+0.06,0,'#e8e2c8');
  for(let x=xa;x<xb;x+=8){const h0=flyH(x),h1=flyH(Math.min(xb,x+8)),lo=Math.min(h0,h1),hi=Math.max(h0,h1);if(hi<0.6)continue;
    for(const sz of[-1,1])addCollider(x,sz>0?hw-0.4:-hw,x+8,sz>0?hw:-hw+0.4,hi+1.1,lo-0.7);
    // Deck slab: the underside of the visible 0.7 m deck. It blocks anything coming up from below (actors, bullets, the
    // camera) while the road underneath stays open. Its top sits 0.5 m under the driving surface (which is the SURF height
    // function) so a climbing vehicle's front collision circle never catches the next, higher slice.
    if(lo>0.7)addCollider(x,-hw,x+8,hw,lo-0.5,lo-0.7);
    // Under the low ends of the ramps nothing fits (clearance below FLY_CLEAR), so block that wedge from the ground up.
    if(lo>1.4&&lo-0.7<FLY_CLEAR)addCollider(x,-hw,x+8,hw,lo-0.75,-1)}
  for(let x=x1+6;x<x2;x+=16){if(Math.abs(x-Math.round(x/CELL)*CELL)<10)continue;addBox(B_PLAIN,1.5,H-0.7,1.5,x,(H-0.7)/2,0,'#b5b2aa');addCollider(x-0.75,-0.75,x+0.75,0.75,H-0.8,-1)}
  SURF.push({minX:xa,maxX:xb,minZ:-hw,maxZ:hw,h:x=>flyH(x)})}

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

/* --- green street-name signs at both ends of each named road (D3/D4) --- */
function streetSign(x,z,name,yaw){addG(B_PLAIN,GEO.cyl,x,1.6,z,'#7a7a7a',0,0,0,0.08,3.2,0.08);addCollider(x-0.15,z-0.15,x+0.15,z+0.15,3.2);
  for(const s of[0,Math.PI]){const t=textPlane(name.toUpperCase(),3.6,0.5,'#1b6e3a','#ffffff');t.rotation.y=yaw+s;t.position.set(x+Math.sin(yaw+s)*0.02,3.3,z+Math.cos(yaw+s)*0.02)}}
function buildStreetSigns(){for(const r of ROADS)for(const e of[0,1]){const p=e?r.pts[r.pts.length-1]:r.pts[0],q=e?r.pts[r.pts.length-2]:r.pts[1],dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
  const x=p[0]+ux*5-uz*(HR+2.2),z=p[1]+uz*5+ux*(HR+2.2);if(Math.abs(x)>BOUND-10||Math.abs(z)>BOUND-10)continue;streetSign(x,z,r.n,Math.atan2(-uz,ux))}}
/* --- D4: drawn road segments (angled roads and countryside stretches): asphalt ribbon in 2 m pieces that follow the ground
   height (so it sits on sidewalks inside blocks and on the road between them), edge lines and a dashed centre line --- */
function buildArterials(){const W=ROAD_W/2;for(const s of NEWSEGS){const[ax,az]=s.a,[bx,bz]=s.b,L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L,px=-uz,pz=ux,n=Math.ceil(L/2);
  for(let k=0;k<n;k++){const t0=k*L/n,t1=(k+1)*L/n,x0=ax+ux*t0,z0=az+uz*t0,x1=ax+ux*t1,z1=az+uz*t1,cx=(x0+x1)/2,cz=(z0+z1)/2,g=groundH(cx,cz),y=g+(g>0.1?0.035:0.032);
    quad(B_ROAD,[x0-px*W,y,z0-pz*W],[x0+px*W,y,z0+pz*W],[x1+px*W,y,z1+pz*W],[x1-px*W,y,z1-pz*W],[t0/8,0],[t0/8,1.5],[t1/8,1.5],[t1/8,0]);
    for(const e of[-1,1])quad(B_PLAIN,[x0+px*e*(W-0.5),y+0.004,z0+pz*e*(W-0.5)],[x0+px*e*(W-0.35),y+0.004,z0+pz*e*(W-0.35)],[x1+px*e*(W-0.35),y+0.004,z1+pz*e*(W-0.35)],[x1+px*e*(W-0.5),y+0.004,z1+pz*e*(W-0.5)],[0,0],[0,0],[0,0],[0,0],'#e8e2c8');
    if(k%3===0)quad(B_PLAIN,[x0-px*0.08,y+0.004,z0-pz*0.08],[x0+px*0.08,y+0.004,z0+pz*0.08],[x1+px*0.08,y+0.004,z1+pz*0.08],[x1-px*0.08,y+0.004,z1-pz*0.08],[0,0],[0,0],[0,0],[0,0],'#e8e2c8')}}}
/* --- Koniamman Temple: small gopuram shrine on the east side of the Town Hall block (D3; real temple is about 0.3 km east of Town Hall) --- */
function buildKoniamman(){const x=-13,z=104,TC=['#f4a6a6','#9fd3e8','#f7e08a','#a7e0a3','#f5b97a'];addBox(B_PLAIN,8,0.3,8,x,0.3,z,'#d8c9a8');addBox(B_PLAIN,6,3.2,6,x,2,z,'#e0d2b4');addCollider(x-3,z-3,x+3,z+3,3.6);
  let y=3.6;for(let t=0;t<5;t++){const w=5.4-t*0.9;addBox(B_PLAIN,w,1.3,w,x,y+0.65,z,TC[t]);y+=1.3}addG(B_PLAIN,GEO.sph,x,y+0.5,z,'#e8b923',0,0,0,0.7,0.9,0.7);
  addBox(B_PLAIN,1.8,2.4,0.2,x,1.6,z+3.05,'#6d4c41');FLAMES.push({x:x-1.6,y:1.2,z:z+3.4},{x:x+1.6,y:1.2,z:z+3.4});PLACES.push({n:'Koniamman temple',x,z:z+8})}
/* --- railway: track, Podanur Junction station (south edge), level crossing --- */
function buildRail(){const Z=TRACKZ;
  addBox(B_PLAIN,2*BOUND,0.25,5,0,0.12,Z,'#7a7064');for(const dz of[-0.75,0.75])addBox(B_PLAIN,2*BOUND,0.14,0.12,0,0.32,Z+dz,'#4e535a');
  for(let x=-BOUND;x<=BOUND;x+=2.4)addBox(B_PLAIN,0.35,0.08,2.6,x,0.27,Z,'#5b4636');
  shifted(0,GX,()=>{/* station: pre-D2 coordinates, moved south with the railway (D2) */
  addBox(B_PLAIN,120,0.9,7.4,110,0.45,397.9,'#bdb5a3');addBox(B_PLAIN,120,0.06,0.3,110,0.92,401.45,'#f2d13a');
  SURF.push({minX:50,maxX:170,minZ:394.2+GX,maxZ:401.6+GX,h:()=>0.9});
  addBox(B_PLAIN,110,0.3,4.8,110,5,398.6,'#9c3b2a');for(let x=58;x<=162;x+=13){addBox(B_PLAIN,0.35,4.1,0.35,x,2.95,398.2,'#d8d2c4');addCollider(x-0.2,398,x+0.2,398.4,5)}
  for(let x=64;x<=156;x+=13)addBox(B_PLAIN,2.2,0.45,0.6,x,1.12,396.4,'#6b4f3a');
  const W='#a64b2a',T='#efe2c2',H=10;
  wallW(87.5,380,35,0.6,H,0,W);wallW(132.5,380,35,0.6,H,0,W);wallW(110,380,10,0.6,H-4.5,4.5,W);
  for(const[a,b]of[[70,85],[93,105],[115,127],[135,150]])wallW((a+b)/2,394,b-a,0.6,H,0,W);
  for(const[a,b]of[[85,93],[105,115],[127,135]])wallW((a+b)/2,394,b-a,0.6,H-4,4,W);
  wallW(70,387,0.6,14,H,0,W);wallW(150,387,0.6,14,H,0,W);
  addBox(B_PLAIN,81,0.6,15,110,H+0.3,387,'#7b2d1d');addCollider(70,380,150,394,H+0.6,H);addBox(B_PLAIN,80.8,0.5,14.8,110,H-0.4,387,T);
  addG(B_WIN,buildingGeo(14,7,3),110,H+3.5,380.6,W);addG(B_PLAIN,GEO.cone4,110,H+9,380.6,'#7b2d1d',Math.PI/4,0,0,9,4,3);
  addG(B_PLAIN,new THREE.CircleGeometry(1.6,20),110,H+4.2,379.0,'#fbf6ea',Math.PI);
  addBox(B_PLAIN,79,0.04,13,110,0.2,387,'#d6cfc0');
  for(let k=0;k<4;k++){addBox(B_PLAIN,4,1.1,1,76+k*4.5,0.7,384,'#5d4037');addBox(B_PLAIN,4,1.6,0.15,76+k*4.5,2.2,383.3,'#8d6e63')}addCollider(74,383.5,92,384.5,1.2);
  for(let r=0;r<3;r++)for(let k=0;k<4;k++)addBox(B_PLAIN,4,0.45,0.6,104+k*9,0.4,384+r*3.5,'#6b4f3a');
  const nb=textPlane('PODANUR JUNCTION',16,2.4,'#f2d13a','#111');nb.position.set(110,8.2,379.6+GX);nb.rotation.y=Math.PI;
  for(const x of[80,140]){const b=textPlane('PODANUR JUNCTION',7,1.1,'#f2d13a','#111');b.position.set(x,4.2,400.9+GX);b.rotation.y=Math.PI;
    const b2=textPlane('PODANUR JUNCTION',7,1.1,'#f2d13a','#111');b2.position.set(x,4.2,401.0+GX)}});
  for(const z of[Z-8,Z+8]){addBox(B_PLAIN,0.4,1.6,0.4,8.5,0.8,z,'#ddd');const pv=new THREE.Group();pv.position.set(8.5,1.4,z);
    const boom=new THREE.Mesh(GEO.box,M('#e63946'));boom.scale.set(14.5,0.18,0.18);boom.position.x=-7.25;pv.add(boom);
    for(let k=0;k<5;k++){const s=new THREE.Mesh(GEO.box,M('#ffffff'));s.scale.set(1.2,0.2,0.2);s.position.x=-1.5-k*2.8;pv.add(s)}pv.rotation.z=-1.45;scene.add(pv);CROSS.push(pv)}
  PLACES.push({n:'Podanur Junction station',x:110,z:ox(372)})}
const train={g:null,L:0,x:0,dir:-1,v:0,state:'wait',t:18,dwell:0,stopped:false,horned:false};
function buildTrain(){const g=new THREE.Group();const box=(w,h,d,c,x,y,mat)=>{const m=new THREE.Mesh(GEO.box,mat||M(c));m.scale.set(w,h,d);m.position.set(x,y,0);m.castShadow=true;g.add(m);return m};
  const CL=20,EL=17,gap=1.2;let cur=0;
  for(let i=0;i<6;i++){const c=cur+CL/2;box(CL,2.9,3.1,i%3===2?'#7b2d26':'#2d4f8f',c,2.15);box(CL-0.4,0.7,3.15,'#1d2a35',c,2.6);box(CL,0.18,3.16,'#efe2c2',c,1.85);box(CL,0.35,2.9,'#9aa0a6',c,3.75);box(CL-4,0.6,2.4,'#222',c,0.5);cur+=CL+gap}
  const e=cur+EL/2;box(EL,3.2,3.1,'#b03a2e',e,2.3);box(EL,0.4,3.15,'#efe2c2',e,2.0);box(2.2,1,3.0,'#1d2a35',cur+EL-1.2,3.2);box(EL,0.3,2.9,'#7f8c8d',e,4.05);box(EL-3,0.6,2.4,'#222',e,0.5);
  box(0.1,0.4,0.6,'',cur+EL+0.02,3.3,MBasic('#fff6c8'));
  train.L=cur+EL;g.children.forEach(m=>m.position.x-=train.L/2);g.visible=false;scene.add(g);train.g=g}
function trainHorn(vol){if(!AC||vol<0.02)return;const t=AC.currentTime;[196,247].forEach(fq=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=fq;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.07*vol,t+0.08);g.gain.setValueAtTime(0.07*vol,t+1.3);g.gain.exponentialRampToValueAtTime(0.0001,t+1.6);o.connect(f);f.connect(g);g.connect(OUT);o.start(t);o.stop(t+1.7)})}
function updateTrain(dt){const T=train;if(!T.g)return;
  if(T.state==='wait'){T.t-=dt;if(T.t<=0){T.state='run';T.dir=-T.dir;T.x=-T.dir*(BOUND+T.L/2+40);T.v=24;T.stopped=false;T.dwell=0;T.horned=false;T.g.visible=true;T.g.rotation.y=T.dir>0?0:Math.PI}}
  else{const d=(110-T.x)*T.dir;let target=26;
    if(!T.stopped){if(d>0&&d<240)target=Math.min(26,Math.sqrt(2*1.5*d));if(d<=0.6&&T.dwell<=0){T.dwell=10;const P=playerP();trainHorn(clamp(1-Math.hypot(T.x-P.x,TRACKZ-P.z)/300,0,1))}}
    if(T.dwell>0){T.dwell-=dt;T.v=0;target=0;if(T.dwell<=0)T.stopped=true}
    else T.v+=clamp(target-T.v,-3*dt,1.6*dt);
    T.x+=T.dir*T.v*dt;T.g.position.set(T.x,0.35,TRACKZ);
    if(T.x*T.dir>BOUND+T.L/2+60){T.state='wait';T.t=RR(25,45);T.g.visible=false}
    const front=T.x+T.dir*T.L/2;if(!T.horned&&-front*T.dir>0&&-front*T.dir<230){T.horned=true;const P=playerP();trainHorn(clamp(1-Math.hypot(front-P.x,TRACKZ-P.z)/350,0,1))}
    const x0=T.x-T.L/2-1,x1=T.x+T.L/2+1;
    for(const v of vehicles){if(v.pos.x<x0||v.pos.x>x1)continue;const dz=v.pos.z-TRACKZ,hw=1.6+v.s.w/2;if(Math.abs(dz)<hw){const s=dz>=0?1:-1;
      if(T.v>3&&!v.wrecked){explode(v,'train');v.vz+=s*14;v.vx+=T.dir*T.v*0.6}v.pos.z=TRACKZ+s*hw}}
    if(!player.vehicle&&!player.dead&&player.pos.x>x0&&player.pos.x<x1){const dz=player.pos.z-TRACKZ;if(Math.abs(dz)<2){const s=dz>=0?1:-1;if(T.v>3){playerDamage(130);player.vy=6;player.pos.z=TRACKZ+s*4}else player.pos.z=TRACKZ+s*2}}}
  const near=T.state==='run'&&Math.abs(T.x)<T.L/2+260;for(const gp of CROSS)gp.rotation.z+=((near?0:-1.45)-gp.rotation.z)*Math.min(1,dt*2)}

/* --- hill statue (an original seated meditating figure in the foothills) --- */
function buildStatue(){const{x,z}=STATUE,S='#262a2f',st='#8a8378';
  addBox(B_PLAIN,44,0.2,44,x,0.1,z,'#cfc6b2');addBox(B_PLAIN,4,0.08,178,x,0.05,z+111,'#b59a72');
  addBox(B_PLAIN,20,3,15,x,1.5,z-4,st);addCollider(x-10,z-11.5,x+10,z+3.5,3);
  addBox(B_PLAIN,18,3.6,10,x,4.8,z-3,S);addCollider(x-9,z-8,x+9,z+2,6.6);
  for(const sx of[-1,1])addG(B_PLAIN,GEO.cyl,x+sx*5,4.9,z+1.4,S,0,0,Math.PI/2,1.9,7.5,1.9);
  addBox(B_PLAIN,10,9.5,6,x,11.4,z-4,S);addBox(B_PLAIN,13,2.6,6,x,16,z-4,S);
  for(const sx of[-1,1]){addG(B_PLAIN,GEO.box,x+sx*6.5,11.4,z-1.7,S,0,-0.47,sx*0.08,2.6,10,2.6);addG(B_PLAIN,GEO.sph,x+sx*6.6,7.1,z+0.9,S,0,0,0,1.6,1.2,1.9)}
  addG(B_PLAIN,GEO.cyl,x,17.9,z-4,S,0,0,0,1.7,1.8,1.7);addG(B_PLAIN,GEO.sph,x,21.3,z-4,S,0,0,0,3.3,3.9,3.4);
  for(let k=-2;k<=2;k++){addG(B_PLAIN,GEO.cyl,x+k*5,0.8,z+13,'#b08d57',0,0,0,0.35,1.4,0.35);addCollider(x+k*5-0.35,z+12.65,x+k*5+0.35,z+13.35,1.6);FLAMES.push({x:x+k*5,y:1.7,z:z+13})}
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2;palm(x+Math.sin(a)*24,z+Math.cos(a)*24)}
  PLACES.push({n:'the hill statue',x,z:z+18})}

/* --- tea stalls on street corners --- */
const TEA_NODES=[[-1,-2,1,1],[0,1,-1,1],[2,0,1,-1],[-2,2,1,1],[3,3,-1,-1],[-4,-1,1,1],[1,-3,-1,1],[4,-3,1,1],[-2,4,1,-1],[0,-4,1,1]];
function buildTeaStalls(){for(const[i,j,sx,sz]of TEA_NODES){const x=i*CELL+sx*11.5,z=j*CELL+sz*11.5,fz=-sz;
  addBox(B_PLAIN,2.6,1.0,1.1,x,0.66,z,pick(['#2a9d8f','#e76f51','#457b9d','#e9c46a','#8338ec']));addBox(B_PLAIN,2.7,0.08,1.2,x,1.2,z,'#dddddd');
  addBox(B_PLAIN,2.6,2.2,0.12,x,1.25,z-fz*1.2,'#6d4c41');for(const px of[-1.25,1.25])addBox(B_PLAIN,0.08,2.4,0.08,x+px,1.36,z+fz*0.55,'#555');
  addG(B_PLAIN,GEO.box,x,2.55,z,pick(['#d62828','#f77f00','#2b9348','#1d4ed8']),0,fz*0.25,0,3.2,0.08,2.6);
  addG(B_PLAIN,GEO.cyl,x-0.7,1.5,z,'#c0c6cc',0,0,0,0.22,0.5,0.22);for(let k=0;k<3;k++)addBox(B_PLAIN,0.3,0.35,0.3,x+0.1+k*0.38,1.42,z,'#f2d6a2');
  addBox(B_PLAIN,2.2,0.12,0.5,x,0.62,z+fz*2.0,'#6b4f3a');for(const s of[-0.9,0.9])addBox(B_PLAIN,0.12,0.45,0.4,x+s,0.38,z+fz*2,'#4e3629');
  addCollider(x-1.3,z-0.55,x+1.3,z+0.55,1.2);STALLS.push({x,z:z+fz*1.4,cx:x,cz:z,fz})}}
function stallOpts(s){const buy=(p,g,line)=>()=>{if(player.cash<p)return'Cash illa? Come back later, thambi!';player.cash-=p;player.hp=Math.min(100,player.hp+g);noise(0.06,3000,0.15,1);floatMsg('+'+g+' health');return line};
  return[{t:'Tea · ₹10 · +20 health',fn:buy(10,20,rpick(['Hot, strong and sweet. Drink!','Fresh boiled, just now!']))},
    {t:'Medu vadai · ₹15 · +30 health',fn:buy(15,30,'Crispy outside, soft inside. Take chutney also.')},
    {t:'Bun butter jam · ₹30 · full health',fn:buy(30,100,'Our speciality! Eat slowly.')},{t:'Bye',fn:()=>false}]}
