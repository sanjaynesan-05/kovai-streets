/* Kovai Streets: geoworld.js
 * Draws the city: the fictional city of Kovai Streets (REBUILD_SPEC.md, tools/geo/build_kovai.py) from geodata/processed/kovai/chunks (500 m chunks,
 * game metres from tools/geo/geo.py, 1:1, origin Victoria Town Hall) and streams chunks in and out around the player.
 * Since step G7 this is the game's only world.
 * Classic script, loaded after world.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const GW_DIR='geodata/processed/kovai/chunks/';
const GW_NEAR=1000,GW_FAR=1900,GW_DROP=250;   // chunk-centre distances (m) for 500 m chunks: full detail, roads/ground only, extra margin before unloading (haze hides beyond ~1.2 km)
const GWLD={starters:[],index:null,data:new Map(),live:new Map(),pending:new Set(),queue:[],started:false,snapped:false,mapReady:false};
const GW_ROADY={side:0.035,trunk:0.075,primary:0.07,secondary:0.065,tertiary:0.06,trunk_link:0.07,primary_link:0.068,secondary_link:0.063,tertiary_link:0.058,unclassified:0.055,residential:0.05,living_street:0.05,service:0.045,track:0.045};
const GW_LAND={forest:'#4a7a35',quarry:'#a89070',residential:'#b9ae92',commercial:'#bdb1a0',retail:'#c4b39c',industrial:'#9c978d',railway:'#9a8f80',park:'#6f9e4f',garden:'#77a556',pitch:'#5f9e3e',
  playground:'#86ad5e',stadium:'#7aa05a',track:'#b5583a',grass:'#7fae5a',recreation_ground:'#7fae5a',cemetery:'#8a9a6a',farmland:'#9aa86a',meadow:'#8fae62',
  school:'#c9bfa8',college:'#c9bfa8',university:'#c9bfa8',hospital:'#d8cfc4',place_of_worship:'#d9c39a',marketplace:'#d1b98f',bus_station:'#a9a9a9',police:'#b8b2a6',
  religious:'#d9c39a',construction:'#a8957a',brownfield:'#a8957a',military:'#8d9178',orchard:'#86a35a',plant_nursery:'#7ea45a',basin:'#6f9cb8',reservoir:'#6f9cb8'};
const GW_BLD={apartments:[14,26],commercial:[9,18],retail:[7,12],industrial:[7,10],warehouse:[6,9],hospital:[12,22],school:[8,12],college:[10,16],
  university:[10,16],hotel:[14,24],office:[12,24],temple:[8,14],church:[9,15],mosque:[8,14],house:[5,8],residential:[6,11],shed:[3,4],roof:[3,4],garage:[3,4]};
const DS=THREE.DoubleSide;/* outline direction varies in OSM data, so flat surfaces are double-sided */
const gwMat={flat:new THREE.MeshLambertMaterial({vertexColors:true,side:DS}),
  road:new THREE.MeshPhongMaterial({map:TX.asphalt,shininess:30,specular:0x000000,side:DS}),line:new THREE.MeshBasicMaterial({color:0xece6d2,side:DS}),
  rail:new THREE.MeshLambertMaterial({color:0x4e535a,side:DS}),ballast:new THREE.MeshLambertMaterial({color:0x6e655a,side:DS}),side:new THREE.MeshLambertMaterial({map:TX.pavers,color:0xd8d0c2,side:DS}),pier:new THREE.MeshLambertMaterial({color:0x9a9a96}),parapet:new THREE.MeshLambertMaterial({color:0xb8b4aa,side:DS}),water:null};
const gwUp=pos=>{const n=new Array(pos.length);for(let k=0;k<pos.length;k+=3){n[k]=0;n[k+1]=1;n[k+2]=0}return n};
function gwHash(n){n=Math.imul((n|0)^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);return((n^(n>>>16))>>>0)/4294967296}

function gwGeom(pos,nor,uv,col){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  if(nor)g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));else g.computeVertexNormals();if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  if(col)g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g}
const _gwc=new THREE.Color();
function gwTri(ring){const c=ring.map(p=>new THREE.Vector2(p[0],p[1]));if(c.length>3&&c[0].equals(c[c.length-1]))c.pop();if(c.length<3)return null;return{c,f:THREE.ShapeUtils.triangulateShape(c,[])}}
/* flat polygon (lake or land use) at height y */
function gwFlat(ring,y,pos,nor,col,color){const t=gwTri(ring);if(!t)return;_gwc.set(color);for(const f of t.f)for(const k of[f[0],f[2],f[1]]){pos.push(t.c[k].x,y,t.c[k].y);nor.push(0,1,0);if(col)col.push(_gwc.r,_gwc.g,_gwc.b)}}
/* height of a bridge point: ramps up over the first and last 40 m of the bridge way */
function gwBridgeY(r,d,L){if(r.L){d+=r.s0;L=r.L}/* position along the whole bridge, not just this chunk's piece (G7 fix) */return r.bridge?Math.max(0.4,(r.layer>0?r.layer:1)*6.5)*Math.min(1,d/40,(L-d)/40):0}
/* road ribbon with mitred joins; returns the road's points with heights for piers */
function gwRibbon(r,pos,uv,line){const p=r.pts,n=p.length,W=r.width/2,base=GW_ROADY[r.cls]||0.05;if(n<2)return;
  const cum=[0];for(let k=1;k<n;k++)cum.push(cum[k-1]+Math.hypot(p[k][0]-p[k-1][0],p[k][1]-p[k-1][1]));const L=cum[n-1];
  const L0=[],R0=[],Y=[];for(let k=0;k<n;k++){const a=p[Math.max(0,k-1)],b=p[Math.min(n-1,k+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    let mx=-dz,mz=dx,s=1;if(k>0&&k<n-1){const ax=p[k][0]-p[k-1][0],az=p[k][1]-p[k-1][1],al=Math.hypot(ax,az)||1;const dot=(-az/al)*mx+(ax/al)*mz;s=1/Math.max(0.5,dot)}
    const y=base+gwBridgeY(r,cum[k],L);Y.push(y);L0.push([p[k][0]+mx*W*s,y,p[k][1]+mz*W*s]);R0.push([p[k][0]-mx*W*s,y,p[k][1]-mz*W*s])}
  for(let k=1;k<n;k++){const a=L0[k-1],b=R0[k-1],c=R0[k],d=L0[k],u0=cum[k-1]/8,u1=cum[k]/8;
    pos.push(...a,...b,...c,...a,...c,...d);uv.push(u0,0,u0,1.2,u1,1.2,u0,0,u1,1.2,u1,0);
    if(line&&r.width>=8&&Math.floor(cum[k]/6)%2===0){const mx0=(a[0]+b[0])/2,mz0=(a[2]+b[2])/2,mx1=(c[0]+d[0])/2,mz1=(c[2]+d[2])/2,dx=mx1-mx0,dz=mz1-mz0,l=Math.hypot(dx,dz)||1,px=-dz/l*0.08,pz=dx/l*0.08,ya=a[1]+0.006,yb=d[1]+0.006;
      line.push(mx0-px,ya,mz0-pz,mx0+px,ya,mz0+pz,mx1+px,yb,mz1+pz,mx0-px,ya,mz0-pz,mx1+px,yb,mz1+pz,mx1-px,yb,mz1-pz)}}
  return{Y,cum}}
/* building height: OSM height or levels, else a plausible height for its type, fixed per building id */
function gwBldH(b){const rng=GW_BLD[b.kind]||[5,12];return b.h||Math.round((rng[0]+(rng[1]-rng[0])*gwHash(b.id))*2)/2}
/* building detail on real OSM outlines (restores the grid-world look): the four facade styles with window textures
   that light up at night (FACMAT), ground-floor shopfronts (shopMat), roof parapets, and per-chunk instanced rooftop
   water tanks, stair rooms, AC units, balconies and shop awnings. Texture coordinates follow buildingGeo/shopGeo:
   a facade tile is 4 bays (5 m each) across and 4 floors (3.4 m each) up; the shopfront texture holds 8 shops. */
const BLD_NOSHOP={house:1,residential:1,apartments:1,school:1,college:1,university:1,hospital:1,temple:1,church:1,mosque:1,industrial:1,warehouse:1,shed:1,garage:1,roof:1};
const BLD_GEO=(()=>{const g={tank:new THREE.CylinderGeometry(0.85,0.85,1.5,8),box:new THREE.BoxGeometry(1,1,1),dish:new THREE.CylinderGeometry(0.45,0.45,0.08,6)};for(const k in g)g[k].userData.shared=true;return g})();
const BLD_MAT={tank:M('#1c1c1c'),ac:M('#d9d9d9'),dish:M('#eeeeee'),rail:M('#4a4a4a'),white:new THREE.MeshLambertMaterial({color:0xffffff})};
function bldBucket(){return{pos:[],nor:[],uv:[],col:[]}}
/* one triangle, wound so its front face points along n (the facade materials only draw front faces) */
function bldTri(B,A,Bv,C,n,ua,ub,uc,col){const ex=Bv[0]-A[0],ey=Bv[1]-A[1],ez=Bv[2]-A[2],fx=C[0]-A[0],fy=C[1]-A[1],fz=C[2]-A[2],cx=ey*fz-ez*fy,cy=ez*fx-ex*fz,cz=ex*fy-ey*fx;
  const flip=cx*n[0]+cy*n[1]+cz*n[2]<0,P=flip?[A,C,Bv]:[A,Bv,C],U=flip?[ua,uc,ub]:[ua,ub,uc];
  for(let i=0;i<3;i++){B.pos.push(P[i][0],P[i][1],P[i][2]);B.nor.push(n[0],n[1],n[2]);B.uv.push(U[i][0],U[i][1]);B.col.push(col.r,col.g,col.b)}}
function bldQuad(B,a,b,y0,y1,n,u0,u1,v0,v1,col){const A=[a.x,y0,a.y],Bq=[b.x,y0,b.y],C=[b.x,y1,b.y],D=[a.x,y1,a.y];
  bldTri(B,A,Bq,C,n,[u0,v0],[u1,v0],[u1,v1],col);bldTri(B,A,C,D,n,[u0,v0],[u1,v1],[u0,v1],col)}
function bldInside(x,z,c){let ins=false;for(let i=0,j=c.length-1;i<c.length;j=i++){const a=c[i],q=c[j];if((a.y>z)!==(q.y>z)&&x<(q.x-a.x)*(z-a.y)/(q.y-a.y)+a.x)ins=!ins}return ins}
const _bc=new THREE.Color(),_bc2=new THREE.Color();
/* R1: mills, sheds and warehouses: plain walls without windows, a roller door on the longest wall, and a pitched metal roof on 4-sided outlines */
const SHED_KIND={industrial:1,warehouse:1,shed:1},SHED_WALL=['#c9c2b4','#b8b2a6','#d4cbb8','#a9a294'],SHED_ROOF=['#8c8f94','#9c5a3c','#7d8a96','#a0a4a8'];
function gwShed(b,BK,t,h){const c=t.c,m=c.length,F=BK.fac[0],r=gwHash(b.id),wall=new THREE.Color(SHED_WALL[(r*4)|0]),roofC=new THREE.Color(SHED_ROOF[(gwHash(b.id*3+1)*4)|0]),door=new THREE.Color('#5d6166');
  let ar=0,cx=0,cz=0;for(let k=0;k<m;k++){const a=c[k],q=c[(k+1)%m];ar+=a.x*q.y-q.x*a.y;cx+=a.x;cz+=a.y}cx/=m;cz/=m;const s=ar>0?1:-1,U=0.01;let lk=0,ll=0;
  for(let k=0;k<m;k++){const a=c[k],q=c[(k+1)%m],dx=q.x-a.x,dz=q.y-a.y,l=Math.hypot(dx,dz);if(l<0.05)continue;const n=[s*dz/l,0,-s*dx/l];if(l>ll){ll=l;lk=k}bldQuad(F,a,q,0,h,n,U,U,U,U,wall)}
  {const a=c[lk],q=c[(lk+1)%m],dx=q.x-a.x,dz=q.y-a.y,l=Math.hypot(dx,dz),n=[s*dz/l,0,-s*dx/l],dw=Math.min(8,l*0.4),t0=0.5-dw/l/2,t1=0.5+dw/l/2,o=0.06;
    bldQuad(F,{x:a.x+dx*t0+n[0]*o,y:a.y+dz*t0+n[2]*o},{x:a.x+dx*t1+n[0]*o,y:a.y+dz*t1+n[2]*o},0,Math.min(5,h-1),n,U,U,U,U,door)}
  const tri=(A,Bv,C,col)=>{const ex=Bv[0]-A[0],ey=Bv[1]-A[1],ez=Bv[2]-A[2],fx=C[0]-A[0],fy=C[1]-A[1],fz=C[2]-A[2];let n=[ey*fz-ez*fy,ez*fx-ex*fz,ex*fy-ey*fx];const L=Math.hypot(...n)||1;n=n.map(v=>v/L);
    const mx=(A[0]+Bv[0]+C[0])/3-cx,my=(A[1]+Bv[1]+C[1])/3-h*0.5,mz=(A[2]+Bv[2]+C[2])/3-cz;if(n[0]*mx+n[1]*my+n[2]*mz<0)n=n.map(v=>-v);bldTri(F,A,Bv,C,n,[U,U],[U,U],[U,U],col)};
  if(m===4){const A=c[lk],B2=c[(lk+1)%4],C2=c[(lk+2)%4],D=c[(lk+3)%4],rh=Math.min(5,Math.hypot(C2.x-B2.x,C2.y-B2.y)*0.22),y=h+rh;
    const Rb=[(B2.x+C2.x)/2,y,(B2.y+C2.y)/2],Rd=[(D.x+A.x)/2,y,(D.y+A.y)/2],P3=q=>[q.x,h,q.y];
    tri(P3(A),P3(B2),Rb,roofC);tri(P3(A),Rb,Rd,roofC);tri(P3(C2),P3(D),Rd,roofC);tri(P3(C2),Rd,Rb,roofC);tri(P3(B2),P3(C2),Rb,wall);tri(P3(D),P3(A),Rd,wall)}
  else for(const f of t.f){const A=c[f[0]],Bv=c[f[1]],C=c[f[2]];bldTri(F,[A.x,h,A.y],[Bv.x,h,Bv.y],[C.x,h,C.y],[0,1,0],[U,U],[U,U],[U,U],roofC)}}
function gwBuilding(b,BK,P){const t=gwTri(b.pts);if(!t)return;if(SHED_KIND[b.kind]){gwShed(b,BK,t,gwBldH(b));return}const h=gwBldH(b),r1=gwHash(b.id),r2=gwHash(b.id*7+1),r3=gwHash(b.id*13+5),c=t.c,m=c.length;
  const style=h>34?2:r3<0.22?1:r3<0.3?3:0,shop=!BLD_NOSHOP[b.kind]&&h>=7&&h<44&&r1<0.7,y0=shop?3.6:0;
  const wall=_bc.set(PAL[(r2*PAL.length)|0]),roof=_bc2.copy(wall).multiplyScalar(0.88),white={r:1,g:1,b:1},F=BK.fac[style];
  let ar=0,cx=0,cz=0;for(let k=0;k<m;k++){const a=c[k],q=c[(k+1)%m];ar+=a.x*q.y-q.x*a.y;cx+=a.x;cz+=a.y}cx/=m;cz/=m;const s=ar>0?1:-1,area=Math.abs(ar)/2;
  let longest=-1,ll=0;const off=Math.floor(r1*8),fl=(h-y0)/3.4;
  for(let k=0;k<m;k++){const a=c[k],q=c[(k+1)%m],dx=q.x-a.x,dz=q.y-a.y,l=Math.hypot(dx,dz);if(l<0.05)continue;const n=[s*dz/l,0,-s*dx/l],bays=Math.max(1,Math.round(l/5));
    if(l>ll){ll=l;longest=k}
    if(shop)bldQuad(BK.shop,a,q,0,3.6,n,off/8,(bays+off)/8,0.01,0.99,white);                       // shopfronts on the ground floor
    bldQuad(F,a,q,y0,h,n,0,bays/4,y0/3.4/4,(y0/3.4+fl)/4,wall);                                   // windows above
    bldQuad(F,a,q,h,h+0.5,n,0.01,0.01,0.01,0.01,roof)}                                            // roof parapet
  for(const f of t.f){const A=c[f[0]],Bv=c[f[1]],C=c[f[2]];bldTri(F,[A.x,h+0.5,A.y],[Bv.x,h+0.5,Bv.y],[C.x,h+0.5,C.y],[0,1,0],[0.01,0.01],[0.01,0.01],[0.01,0.01],roof)}
  /* rooftop clutter, inside the outline */
  const R=Math.sqrt(area)/3,top=h+0.5;if(area>30&&h<44){const tryAt=(ox,oz,fn)=>{const x=cx+ox,z=cz+oz;if(bldInside(x,z,c))fn(x,z)};
    tryAt((r1-0.5)*R,(r2-0.5)*R,(x,z)=>P.tank.push([x,top+0.75,z]));if(r3<0.4)tryAt((r2-0.5)*R*1.6,(r1-0.5)*R*1.6,(x,z)=>P.tank.push([x,top+0.75,z]));
    if(r2<0.6)tryAt((r3-0.5)*R,(0.5-r1)*R,(x,z)=>P.room.push([x,top+1.25,z,wall.getHex()]));
    for(let k=0;k<3;k++)if(gwHash(b.id*31+k)<0.5)tryAt((gwHash(b.id+k)-0.5)*R*2,(gwHash(b.id*3+k)-0.5)*R*2,(x,z)=>P.ac.push([x,top+0.3,z]));
    if(r1<0.25)tryAt((0.5-r3)*R,(r2-0.5)*R,(x,z)=>P.dish.push([x,top+0.5,z]))}
  /* balconies on the longest wall (painted style, mid-rise), shop awnings */
  if(longest>=0){const a=c[longest],q=c[(longest+1)%m],dx=q.x-a.x,dz=q.y-a.y,l=Math.hypot(dx,dz),nx=s*dz/l,nz=-s*dx/l,mx=(a.x+q.x)/2,mz=(a.y+q.y)/2,yaw=Math.atan2(dx,dz);
    if(style===0&&h<32&&h>9&&r2<0.55){const bw=Math.min(l*0.7,9);for(let y=shop?7.0:3.4;y<h-2;y+=3.4)P.bal.push([mx+nx*0.55,y,mz+nz*0.55,yaw,bw,nx,nz])}
    if(shop&&r3<0.5)P.awn.push([mx+nx*0.7,3.25,mz+nz*0.7,yaw,l*0.8,['#1d4ed8','#c1121f','#2b9348','#f77f00','#555555'][(r1*5)|0]])}}
/* adds one chunk's building meshes: 4 facade styles, shopfronts, and instanced rooftop/balcony/awning details */
function gwBuildingMeshes(g,BK,P){const o=new THREE.Object3D(),sh=QS.shadow>0;
  BK.fac.forEach((B,i)=>{if(!B.pos.length)return;const m=new THREE.Mesh(gwGeom(B.pos,B.nor,B.uv,B.col),FACMAT[i]);m.castShadow=sh;m.receiveShadow=true;g.add(m)});
  if(BK.shop.pos.length){const m=new THREE.Mesh(gwGeom(BK.shop.pos,BK.shop.nor,BK.shop.uv,BK.shop.col),shopMat);m.receiveShadow=true;g.add(m)}
  const inst=(geo,mat,list,place,color)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((q,i)=>{place(q);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(color)im.setColorAt(i,_bc.set(color(q)))});if(color)im.instanceColor.needsUpdate=true;im.castShadow=sh;g.add(im)};
  inst(BLD_GEO.tank,BLD_MAT.tank,P.tank,q=>{o.rotation.set(0,0,0);o.scale.set(1,1,1);o.position.set(q[0],q[1],q[2])});
  inst(BLD_GEO.box,BLD_MAT.white,P.room,q=>{o.rotation.set(0,0,0);o.scale.set(2.6,2.5,2.6);o.position.set(q[0],q[1],q[2])},q=>q[3]);
  inst(BLD_GEO.box,BLD_MAT.ac,P.ac,q=>{o.rotation.set(0,0,0);o.scale.set(0.9,0.6,0.5);o.position.set(q[0],q[1],q[2])});
  inst(BLD_GEO.dish,BLD_MAT.dish,P.dish,q=>{o.rotation.set(0.6,0,0);o.scale.set(1,1,1);o.position.set(q[0],q[1],q[2])});
  inst(BLD_GEO.box,M('#d9d4c8'),P.bal,q=>{o.rotation.set(0,q[3],0);o.scale.set(1.1,0.16,q[4]);o.position.set(q[0],q[1],q[2])});
  inst(BLD_GEO.box,BLD_MAT.rail,P.bal,q=>{o.rotation.set(0,q[3],0);o.scale.set(0.06,0.85,q[4]);o.position.set(q[0]+q[5]*0.53,q[1]+0.5,q[2]+q[6]*0.53)});
  inst(BLD_GEO.box,BLD_MAT.white,P.awn,q=>{o.rotation.set(0,q[3],0);o.scale.set(1.4,0.06,q[4]);o.position.set(q[0],q[1],q[2])},q=>q[5])}

/* G3: a footprint becomes axis-aligned collision strips: rows 1.5 m deep, each covering the footprint's width in that row;
   rows with the same width are merged, so a square building is one box and an angled one a short staircase (error about 0.75 m) */
const GW_ROW=1.5;
function gwFootprintBoxes(ring,h,out){let z0=1e9,z1=-1e9;for(const q of ring){if(q[1]<z0)z0=q[1];if(q[1]>z1)z1=q[1]}let cur=null;const flush=()=>{if(cur)for(const c of cur)out.push(addCollider(c[0],c[2],c[1],c[3],h));cur=null};
  for(let z=z0;z<z1;z+=GW_ROW){const zm=Math.min(z+GW_ROW/2,(z+z1)/2),xs=[];for(let k=1;k<ring.length;k++){const a=ring[k-1],b=ring[k];if((a[1]<=zm)!==(b[1]<=zm))xs.push(a[0]+(zm-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);const spans=[];for(let k=0;k+1<xs.length;k+=2)if(xs[k+1]-xs[k]>0.3)spans.push([xs[k],xs[k+1]]);const ze=Math.min(z+GW_ROW,z1);
    if(cur&&cur.length===spans.length&&spans.every((sp,k)=>Math.abs(sp[0]-cur[k][0])<0.4&&Math.abs(sp[1]-cur[k][1])<0.4)){cur.forEach((c,k)=>{c[0]=Math.min(c[0],spans[k][0]);c[1]=Math.max(c[1],spans[k][1]);c[3]=ze})}
    else{flush();cur=spans.map(sp=>[sp[0],sp[1],z,ze])}}flush()}
/* G3: flyover and bridge decks you can drive on (and under). Segments live in a 32 m hash; surfaceH() asks geoDeckH(). */
const GW_DECK=new Map(),GW_DC=32;
function gwAddDeck(seg,owner){seg.owner=owner;const x0=Math.floor((Math.min(seg.ax,seg.bx)-seg.w)/GW_DC),x1=Math.floor((Math.max(seg.ax,seg.bx)+seg.w)/GW_DC),z0=Math.floor((Math.min(seg.az,seg.bz)-seg.w)/GW_DC),z1=Math.floor((Math.max(seg.az,seg.bz)+seg.w)/GW_DC);
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const k=i+','+j;let l=GW_DECK.get(k);if(!l){l=[];GW_DECK.set(k,l)}l.push(seg)}}
function gwDropDecks(owner){for(const[k,l]of GW_DECK){const f=l.filter(s=>s.owner!==owner);if(f.length)GW_DECK.set(k,f);else GW_DECK.delete(k)}}
function geoDeckH(x,z,y){const l=GW_DECK.get(Math.floor(x/GW_DC)+','+Math.floor(z/GW_DC));if(!l)return-1e9;let best=-1e9;
  for(const s of l){const dx=s.bx-s.ax,dz=s.bz-s.az,L=dx*dx+dz*dz;let t=L?((x-s.ax)*dx+(z-s.az)*dz)/L:0;if(t<0||t>1)continue;const ex=s.ax+dx*t-x,ez=s.az+dz*t-z;if(ex*ex+ez*ez>s.w*s.w)continue;
    const h=s.ya+(s.yb-s.ya)*t;if(h>best&&y>=h-1.6)best=h}return best}
/* G3: real lake shapes for swimming and boats */
function geoInWater(x,z){const S=GWLD.index?GWLD.index.size_m:1000,d=GWLD.data.get(Math.floor(x/S)+','+Math.floor(z/S));if(!d||!d.water)return false;
  for(const w of d.water){const r=w.pts;let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside}if(inside)return true}return false}
function gwBuild(key,full){const d=GWLD.data.get(key),g=new THREE.Group();g.userData.full=full;g.userData.key=key;const cols=g.userData.cols=[];
  {const pos=[],nor=[],col=[];for(const a of d.landuse||[])gwFlat(a.pts,0.012+0.02/(1+ringArea(a.pts)/2e4),pos,nor,col,GW_LAND[a.kind]||'#b3aa8e');
    if(pos.length)g.add(new THREE.Mesh(gwGeom(pos,nor,null,col),gwMat.flat))}
  {const pos=[],nor=[];for(const w of d.water||[])gwFlat(w.pts,0.08,pos,nor,null,'#000');
    if(pos.length){if(!gwMat.water){gwMat.water=waterMaterial(true);gwMat.water.side=DS}g.add(new THREE.Mesh(gwGeom(pos,nor),gwMat.water))}}
  /* paved footpaths: a 3.5 m strip each side of every road, just under the road surface */
  {const pos=[],uv=[];for(const r of d.roads||[])if(!r.tunnel)gwRibbon({pts:r.pts,width:r.width+7,cls:'side'},pos,uv,null);/* also paves the ground under flyover decks */
    if(pos.length){const m=new THREE.Mesh(gwGeom(pos,gwUp(pos),uv),gwMat.side);m.receiveShadow=true;g.add(m)}}
  {const pos=[],uv=[],line=[],piers=[],par=[];for(const r of d.roads||[]){const o=gwRibbon(r,pos,uv,line);if(o&&r.bridge){for(let k=0;k<r.pts.length;k++)if(o.Y[k]>2.5&&k%2===0){const a=r.pts[Math.max(0,k-1)],b=r.pts[Math.min(r.pts.length-1,k+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;piers.push([r.pts[k][0],o.Y[k],r.pts[k][1],(b[0]-a[0])/l,(b[1]-a[1])/l])}
      if(full)for(let k=1;k<r.pts.length;k++)gwAddDeck({ax:r.pts[k-1][0],az:r.pts[k-1][1],bx:r.pts[k][0],bz:r.pts[k][1],ya:o.Y[k-1],yb:o.Y[k],w:r.width/2+0.3},key)
      /* G7: parapets on raised deck sections: a low wall you can see, and collision posts every 2 m at deck height only (traffic underneath is not blocked) */
      for(const side of[-1,1]){const e=r.pts.map((q,k)=>gwOffset(r.pts,k,side*(r.width/2+0.15)));for(let k=1;k<e.length;k++){const ya=o.Y[k-1],yb=o.Y[k];if(Math.min(ya,yb)<2)continue;
        par.push(e[k-1][0],ya,e[k-1][1],e[k][0],yb,e[k][1],e[k][0],yb+0.9,e[k][1],e[k-1][0],ya,e[k-1][1],e[k][0],yb+0.9,e[k][1],e[k-1][0],ya+0.9,e[k-1][1]);
        if(full){const L=Math.hypot(e[k][0]-e[k-1][0],e[k][1]-e[k-1][1]);for(let d=0;d<L;d+=2){const t=d/L,x=e[k-1][0]+(e[k][0]-e[k-1][0])*t,z=e[k-1][1]+(e[k][1]-e[k-1][1])*t,y=ya+(yb-ya)*t;cols.push(addCollider(x-0.35,z-0.35,x+0.35,z+0.35,y+1.0,y-0.3))}}}}}}
    /* no pillar on a street that crosses under the flyover (pillars in the median of a road running along underneath stay) */
    {const gr=(d.roads||[]).filter(r=>!r.bridge&&!r.layer);for(let i=piers.length-1;i>=0;i--){const[x,,z,fx,fz]=piers[i];if(gr.some(r=>{for(let k=1;k<r.pts.length;k++){const a=r.pts[k-1],b=r.pts[k],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;if(Math.abs(((b[0]-a[0])*fx+(b[1]-a[1])*fz)/l)<0.7&&segDist(x,z,a,b)<r.width/2+1.2)return true}return false}))piers.splice(i,1)}}
    if(full)for(const[x,y,z]of piers)cols.push(addCollider(x-0.6,z-0.6,x+0.6,z+0.6,y-0.5));/* pillars stop at the deck underside */
    if(pos.length){const m=new THREE.Mesh(gwGeom(pos,gwUp(pos),uv),gwMat.road);m.receiveShadow=true;g.add(m)}if(line.length)g.add(new THREE.Mesh(gwGeom(line,gwUp(line)),gwMat.line));
    if(par.length)g.add(new THREE.Mesh(gwGeom(par),gwMat.parapet));
    if(piers.length){const im=new THREE.InstancedMesh(GEO.box,gwMat.pier,piers.length),o=new THREE.Object3D();piers.forEach(([x,y,z],i)=>{o.position.set(x,y/2,z);o.scale.set(1.2,y,1.2);o.updateMatrix();im.setMatrixAt(i,o.matrix)});g.add(im)}}
  {const pos=[],uv=[],rails=[];for(const r of d.rail||[]){gwRibbon({pts:r.pts,width:3.2,cls:'track'},pos,uv,null);for(const off of[-0.72,0.72])gwRibbon({pts:r.pts.map((q,k)=>gwOffset(r.pts,k,off)),width:0.12,cls:'track'},rails,[],null)}
    if(pos.length)g.add(new THREE.Mesh(gwGeom(pos,gwUp(pos)),gwMat.ballast));if(rails.length){for(let k=1;k<rails.length;k+=3)rails[k]+=0.12;g.add(new THREE.Mesh(gwGeom(rails,gwUp(rails)),gwMat.rail))}}
  if(full){const BK={fac:[0,1,2,3].map(bldBucket),shop:bldBucket()},P={tank:[],room:[],ac:[],dish:[],bal:[],awn:[]};
    for(const b of d.buildings||[]){if(gwCleared(b))continue;/* G6: cleared for a mission site */gwBuilding(b,BK,P);gwFootprintBoxes(b.pts,gwBldH(b),cols)}
    gwBuildingMeshes(g,BK,P)}
  if(full)gwTrees(d,g,cols);/* R1: trees (geolandmarks.js) */
  if(full)gwLife(d,key,g,cols);/* D7: lamps, parked cars, vendor carts, bus stops (geolife.js) */
  scene.add(g);return g}
function gwOffset(p,k,off){const a=p[Math.max(0,k-1)],b=p[Math.min(p.length-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[p[k][0]-dz/l*off,p[k][1]+dx/l*off]}
function ringArea(r){let s=0;for(let k=0;k<r.length;k++){const a=r[k],b=r[(k+1)%r.length];s+=a[0]*b[1]-b[0]*a[1]}return Math.abs(s)/2}
function gwFree(g){removeColliders(g.userData.cols);if(g.userData.full)gwDropDecks(g.userData.key);scene.remove(g);g.traverse(o=>{if(o.geometry&&o.geometry!==GEO.box&&!o.geometry.userData.shared)o.geometry.dispose()});LIFE_SPOTS.delete(g.userData.key)}

/* ---------- streaming ---------- */
function initGeoWorld(){GWLD.started=true;PLACES.length=0;/* grid-world place names; real landmarks are added below */
  const gt=TX.grass.clone();gt.needsUpdate=true;gt.wrapS=gt.wrapT=THREE.RepeatWrapping;gt.repeat.set(860,860);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000),new THREE.MeshLambertMaterial({color:0x9fb27a,map:gt})/* green, as in the concept map */);ground.rotation.x=-Math.PI/2;ground.position.set(1500,0,-1300);ground.receiveShadow=true;scene.add(ground);
  /* backdrop beyond the map edge (tools/geo/build_city.py): real buildings around the city as plain boxes, and the lakes there; drawn once, no collisions */
  fetch('geodata/processed/kovai/backdrop.json',{cache:'no-cache'}).then(r=>r.json()).then(j=>{const n=j.boxes.length;if(n){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),new THREE.MeshLambertMaterial(),n),o=new THREE.Object3D(),c=new THREE.Color();
      j.boxes.forEach(([x,z,w,d,a,h],i)=>{o.position.set(x,0,z);o.rotation.set(0,-a,0);o.scale.set(Math.max(w,2),h,Math.max(d,2));o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,c.set(PAL[(gwHash(i*7+3)*PAL.length)|0]))});
      m.instanceColor.needsUpdate=true;m.castShadow=false;scene.add(m)}
    const pos=[],nor=[];for(const w of j.water)gwFlat(w.pts,0.06,pos,nor,null,'#000');if(pos.length){if(!gwMat.water){gwMat.water=waterMaterial(true);gwMat.water.side=DS}scene.add(new THREE.Mesh(gwGeom(pos,nor),gwMat.water))}}).catch(()=>{});
  fetch(GW_DIR+'index.json',{cache:'no-cache'}).then(r=>r.json()).then(ix=>{GWLD.index=ix;geoMinimapBase()}).catch(e=>{console.error(e);toast('MAP DATA MISSING','Run the game through start-server.bat',6)});
  fetch('geodata/processed/kovai/landmarks.json',{cache:'no-cache'}).then(r=>r.json()).then(j=>{DISTRICTS.length=0;for(const L of j.landmarks)if(L.in_pilot&&(L.category==='district'||L.id==='town_hall'))DISTRICTS.push({n:L.name.replace('Victoria ',''),x:L.x,z:L.z});
    for(const L of j.landmarks)if(L.in_pilot&&L.category!=='district'&&L.category!=='fuel'&&L.category!=='industry')PLACES.push({n:L.name,x:L.x,z:L.z});buildLandmarks(j.landmarks.filter(L=>L.model))}/* real places for friends' hangouts */).catch(()=>{})}
function updateGeoWorld(){if(!GWLD.index)return;const P=playerP(),S=GWLD.index.size_m;
  for(const c of GWLD.index.chunks){const key=c.i+','+c.j,d=Math.hypot(P.x-(c.i+0.5)*S,P.z-(c.j+0.5)*S),want=d<GW_NEAR?2:d<GW_FAR?1:0,live=GWLD.live.get(key);
    if(want&&!GWLD.data.has(key)){if(!GWLD.pending.has(key)){GWLD.pending.add(key);fetch(GW_DIR+c.file,{cache:'no-cache'}).then(r=>r.json()).then(j=>{GWLD.data.set(key,j);GWLD.pending.delete(key);gwMapChunk(j)}).catch(e=>{console.warn('chunk '+key+' failed to load, retrying',e);setTimeout(()=>GWLD.pending.delete(key),2000)})}continue}/* G7: a failed download is retried instead of leaving a hole in the map */
    if(want&&(!live||live.userData.full!==(want===2))){if(!GWLD.queue.includes(key))GWLD.queue.push(key)}
    else if(!want&&live&&d>GW_FAR+GW_DROP){gwFree(live);GWLD.live.delete(key)}}
  const key=GWLD.queue.shift();if(key){const c=GWLD.index.chunks.find(c=>c.i+','+c.j===key),d=Math.hypot(P.x-(c.i+0.5)*S,P.z-(c.j+0.5)*S),old=GWLD.live.get(key);
    if(old)gwFree(old);GWLD.live.set(key,gwBuild(key,d<GW_NEAR));if(!GWLD.snapped)gwSnapPlayer()}}   /* one chunk per frame keeps frames smooth */
/* first time the player's chunk is built: move the player to the nearest road point, and park the starter car and bike along that road */
function gwSnapPlayer(){const P=player.pos,S=GWLD.index.size_m,d=GWLD.data.get(Math.floor(P.x/S)+','+Math.floor(P.z/S));if(!d)return;GWLD.snapped=true;let best=null,bd=1e9,dir=[1,0];
  for(const r of d.roads||[])if(!r.bridge&&r.width>=6)for(let k=0;k<r.pts.length;k++){const q=r.pts[k],dd=Math.hypot(q[0]-P.x,q[1]-P.z);if(dd<bd){bd=dd;best=q;const n=r.pts[Math.min(k+1,r.pts.length-1)],p=r.pts[Math.max(k-1,0)],l=Math.hypot(n[0]-p[0],n[1]-p[1])||1;dir=[(n[0]-p[0])/l,(n[1]-p[1])/l]}}
  if(!best)return;if(!player.vehicle)player.pos.set(best[0],0,best[1]);const h=Math.atan2(dir[0],dir[1]);
  GWLD.starters.forEach((v,k)=>{const a=k?-6:8;v.pos.set(best[0]+dir[0]*a+dir[1]*1.8,v.pos.y,best[1]+dir[1]*a-dir[0]*1.8);v.heading=h;v.vx=v.vz=v.speed=0})}
/* name of the road under (x, z), from the loaded chunk data */
function geoRoadName(x,z){const S=GWLD.index?GWLD.index.size_m:1000,d=GWLD.data.get(Math.floor(x/S)+','+Math.floor(z/S));if(!d)return null;let best=null,bd=1e9;
  for(const r of d.roads||[]){if(!r.name)continue;for(let k=1;k<r.pts.length;k++){const dd=segDist(x,z,r.pts[k-1],r.pts[k]);if(dd<r.width/2+1&&dd<bd){bd=dd;best=r.name}}}return best}

/* ---------- minimap: same data, drawn as chunks arrive ---------- */
const GW_MS=0.25;
function geoMinimapBase(){const R=GWLD.index.rect;MX0=R[0]-200;MZ0=R[1]-200;MX1=R[2]+200;MZ1=R[3]+200;OMS=GW_MS;
  offMap=document.createElement('canvas');offMap.width=Math.ceil((MX1-MX0)*GW_MS);offMap.height=Math.ceil((MZ1-MZ0)*GW_MS);const o=offMap.getContext('2d');o.fillStyle='#b9b39a';o.fillRect(0,0,offMap.width,offMap.height);
  GWLD.mapReady=true;for(const d of GWLD.data.values())gwMapChunk(d);
  Promise.all(['landuse','water','roads'].map(n=>fetch('geodata/processed/kovai/'+n+'.json',{cache:'no-cache'}).then(r=>r.json()))).then(([lu,wa,rd])=>gwMapChunk({landuse:lu.landuse,water:wa.water,roads:rd.roads})).catch(()=>{})}/* G5: whole pilot on the map from the start; buildings fill in by chunk */
function gwMapChunk(d){if(!GWLD.mapReady)return;const o=offMap.getContext('2d'),X=v=>(v-MX0)*GW_MS,Z=v=>(v-MZ0)*GW_MS;
  const poly=(r,c)=>{o.fillStyle=c;o.beginPath();r.forEach((q,k)=>k?o.lineTo(X(q[0]),Z(q[1])):o.moveTo(X(q[0]),Z(q[1])));o.closePath();o.fill()};
  for(const a of d.landuse||[])poly(a.pts,GW_LAND[a.kind]||'#b3aa8e');for(const w of d.water||[])poly(w.pts,'#4f93c4');
  for(const b of d.buildings||[])if(!gwCleared(b))poly(b.pts,'#a29a88');
  o.lineCap='round';o.strokeStyle='#6d655a';o.lineWidth=2.4*GW_MS*4;for(const r of d.rail||[]){o.beginPath();r.pts.forEach((q,k)=>k?o.lineTo(X(q[0]),Z(q[1])):o.moveTo(X(q[0]),Z(q[1])));o.stroke()}
  for(const r of(d.roads||[]).slice().sort((a,b)=>a.width-b.width)){o.strokeStyle=r.width>=10?'#f4f1e8':'#e2ddd0';o.lineWidth=Math.max(1.2,r.width*GW_MS);o.beginPath();r.pts.forEach((q,k)=>k?o.lineTo(X(q[0]),Z(q[1])):o.moveTo(X(q[0]),Z(q[1])));o.stroke()}}
