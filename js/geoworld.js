/* Kovai Streets: geoworld.js
 * Real-geography world (step G2): draws the 6 x 6 km Coimbatore pilot from geodata/processed/pilot/chunks (1 x 1 km chunks,
 * game metres from tools/geo/geo.py, 1:1, origin Victoria Town Hall) and streams chunks in and out around the player.
 * Active only with index.html?world=geo (REALMAP in core.js). Until step G7 the grid world stays the default.
 * Not done yet: collisions (G3), traffic and pedestrians on the road graph (G4), GPS (G5), missions (G6), elevation (needs DEM).
 * Classic script, loaded after world.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const GW_DIR='geodata/processed/pilot/chunks/';
const GW_NEAR=1600,GW_FAR=2700,GW_DROP=300;   // chunk-centre distances (m): full detail, roads/ground only, extra margin before unloading
const GW={starters:[],index:null,data:new Map(),live:new Map(),pending:new Set(),queue:[],started:false,snapped:false,mapReady:false};
const GW_ROADY={trunk:0.075,primary:0.07,secondary:0.065,tertiary:0.06,trunk_link:0.07,primary_link:0.068,secondary_link:0.063,tertiary_link:0.058,unclassified:0.055,residential:0.05,living_street:0.05,service:0.045,track:0.045};
const GW_LAND={residential:'#b9ae92',commercial:'#bdb1a0',retail:'#c4b39c',industrial:'#9c978d',railway:'#9a8f80',park:'#6f9e4f',garden:'#77a556',pitch:'#5f9e3e',
  playground:'#86ad5e',stadium:'#7aa05a',track:'#b5583a',grass:'#7fae5a',recreation_ground:'#7fae5a',cemetery:'#8a9a6a',farmland:'#9aa86a',meadow:'#8fae62',
  school:'#c9bfa8',college:'#c9bfa8',university:'#c9bfa8',hospital:'#d8cfc4',place_of_worship:'#d9c39a',marketplace:'#d1b98f',bus_station:'#a9a9a9',police:'#b8b2a6',
  religious:'#d9c39a',construction:'#a8957a',brownfield:'#a8957a',military:'#8d9178',orchard:'#86a35a',plant_nursery:'#7ea45a',basin:'#6f9cb8',reservoir:'#6f9cb8'};
const GW_BLD={apartments:[14,26],commercial:[9,18],retail:[7,12],industrial:[7,10],warehouse:[6,9],hospital:[12,22],school:[8,12],college:[10,16],
  university:[10,16],hotel:[14,24],office:[12,24],temple:[8,14],church:[9,15],mosque:[8,14],house:[5,8],residential:[6,11],shed:[3,4],roof:[3,4],garage:[3,4]};
const DS=THREE.DoubleSide;/* outline direction varies in OSM data, so flat surfaces are double-sided */
const gwMat={bld:new THREE.MeshLambertMaterial({vertexColors:true,side:DS}),flat:new THREE.MeshLambertMaterial({vertexColors:true,side:DS}),
  road:new THREE.MeshPhongMaterial({map:TX.asphalt,shininess:30,specular:0x000000,side:DS}),line:new THREE.MeshBasicMaterial({color:0xece6d2,side:DS}),
  rail:new THREE.MeshLambertMaterial({color:0x4e535a,side:DS}),ballast:new THREE.MeshLambertMaterial({color:0x6e655a,side:DS}),pier:new THREE.MeshLambertMaterial({color:0x9a9a96}),water:null};
const gwUp=pos=>{const n=new Array(pos.length);for(let k=0;k<pos.length;k+=3){n[k]=0;n[k+1]=1;n[k+2]=0}return n};
function gwHash(n){n=Math.imul((n|0)^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);return((n^(n>>>16))>>>0)/4294967296}

function gwGeom(pos,nor,uv,col){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  if(nor)g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));else g.computeVertexNormals();if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  if(col)g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g}
const _gc=new THREE.Color();
function gwTri(ring){const c=ring.map(p=>new THREE.Vector2(p[0],p[1]));if(c.length>3&&c[0].equals(c[c.length-1]))c.pop();if(c.length<3)return null;return{c,f:THREE.ShapeUtils.triangulateShape(c,[])}}
/* flat polygon (lake or land use) at height y */
function gwFlat(ring,y,pos,nor,col,color){const t=gwTri(ring);if(!t)return;_gc.set(color);for(const f of t.f)for(const k of[f[0],f[2],f[1]]){pos.push(t.c[k].x,y,t.c[k].y);nor.push(0,1,0);if(col)col.push(_gc.r,_gc.g,_gc.b)}}
/* height of a bridge point: ramps up over the first and last 40 m of the bridge way */
function gwBridgeY(r,d,L){return r.bridge?Math.max(0.4,(r.layer>0?r.layer:1)*6.5)*Math.min(1,d/40,(L-d)/40):0}
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
/* building: walls + flat roof, deterministic height and colour from its OSM id when not tagged */
function gwBldH(b){const rng=GW_BLD[b.kind]||[5,12];return b.h||Math.round((rng[0]+(rng[1]-rng[0])*gwHash(b.id))*2)/2}
function gwBuilding(b,pos,nor,col){const t=gwTri(b.pts);if(!t)return;const h=gwBldH(b);
  const wall=_gc.set(PAL[(gwHash(b.id*7+1)*PAL.length)|0]).clone(),roof=wall.clone().multiplyScalar(0.82),c=t.c,m=c.length;
  let ar=0;for(let k=0;k<m;k++){const a=c[k],q=c[(k+1)%m];ar+=a.x*q.y-q.x*a.y}const s=ar>0?1:-1;
  for(let k=0;k<m;k++){const a=c[k],q=c[(k+1)%m],dx=q.x-a.x,dz=q.y-a.y,l=Math.hypot(dx,dz)||1,nx=s*dz/l,nz=-s*dx/l,shade=0.86+0.14*Math.abs(nx);
    pos.push(a.x,0,a.y,q.x,0,q.y,q.x,h,q.y,a.x,0,a.y,q.x,h,q.y,a.x,h,a.y);for(let v=0;v<6;v++){nor.push(nx,0,nz);col.push(wall.r*shade,wall.g*shade,wall.b*shade)}}
  for(const f of t.f)for(const k of[f[0],f[2],f[1]]){pos.push(c[k].x,h,c[k].y);nor.push(0,1,0);col.push(roof.r,roof.g,roof.b)}}

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
function geoInWater(x,z){const S=GW.index?GW.index.size_m:1000,d=GW.data.get(Math.floor(x/S)+','+Math.floor(z/S));if(!d||!d.water)return false;
  for(const w of d.water){const r=w.pts;let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside}if(inside)return true}return false}
function gwBuild(key,full){const d=GW.data.get(key),g=new THREE.Group();g.userData.full=full;g.userData.key=key;const cols=g.userData.cols=[];
  {const pos=[],nor=[],col=[];for(const a of d.landuse||[])gwFlat(a.pts,0.012+0.02/(1+ringArea(a.pts)/2e4),pos,nor,col,GW_LAND[a.kind]||'#b3aa8e');
    if(pos.length)g.add(new THREE.Mesh(gwGeom(pos,nor,null,col),gwMat.flat))}
  {const pos=[],nor=[];for(const w of d.water||[])gwFlat(w.pts,0.08,pos,nor,null,'#000');
    if(pos.length){if(!gwMat.water){gwMat.water=waterMaterial(true);gwMat.water.side=DS}g.add(new THREE.Mesh(gwGeom(pos,nor),gwMat.water))}}
  {const pos=[],uv=[],line=[],piers=[];for(const r of d.roads||[]){const o=gwRibbon(r,pos,uv,line);if(o&&r.bridge){for(let k=0;k<r.pts.length;k++)if(o.Y[k]>2.5&&k%2===0)piers.push([r.pts[k][0],o.Y[k],r.pts[k][1]]);
      if(full)for(let k=1;k<r.pts.length;k++)gwAddDeck({ax:r.pts[k-1][0],az:r.pts[k-1][1],bx:r.pts[k][0],bz:r.pts[k][1],ya:o.Y[k-1],yb:o.Y[k],w:r.width/2+0.3},key)}}
    if(full)for(const[x,y,z]of piers)cols.push(addCollider(x-0.6,z-0.6,x+0.6,z+0.6,y-0.5));/* pillars stop at the deck underside */
    if(pos.length){const m=new THREE.Mesh(gwGeom(pos,gwUp(pos),uv),gwMat.road);m.receiveShadow=true;g.add(m)}if(line.length)g.add(new THREE.Mesh(gwGeom(line,gwUp(line)),gwMat.line));
    if(piers.length){const im=new THREE.InstancedMesh(GEO.box,gwMat.pier,piers.length),o=new THREE.Object3D();piers.forEach(([x,y,z],i)=>{o.position.set(x,y/2,z);o.scale.set(1.2,y,1.2);o.updateMatrix();im.setMatrixAt(i,o.matrix)});g.add(im)}}
  {const pos=[],uv=[],rails=[];for(const r of d.rail||[]){gwRibbon({pts:r.pts,width:3.2,cls:'track'},pos,uv,null);for(const off of[-0.72,0.72])gwRibbon({pts:r.pts.map((q,k)=>gwOffset(r.pts,k,off)),width:0.12,cls:'track'},rails,[],null)}
    if(pos.length)g.add(new THREE.Mesh(gwGeom(pos,gwUp(pos)),gwMat.ballast));if(rails.length){for(let k=1;k<rails.length;k+=3)rails[k]+=0.12;g.add(new THREE.Mesh(gwGeom(rails,gwUp(rails)),gwMat.rail))}}
  if(full){const pos=[],nor=[],col=[];for(const b of d.buildings||[]){gwBuilding(b,pos,nor,col);gwFootprintBoxes(b.pts,gwBldH(b),cols)}
    if(pos.length){const m=new THREE.Mesh(gwGeom(pos,nor,null,col),gwMat.bld);m.castShadow=QS.shadow>0;m.receiveShadow=true;g.add(m)}}
  scene.add(g);return g}
function gwOffset(p,k,off){const a=p[Math.max(0,k-1)],b=p[Math.min(p.length-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[p[k][0]-dz/l*off,p[k][1]+dx/l*off]}
function ringArea(r){let s=0;for(let k=0;k<r.length;k++){const a=r[k],b=r[(k+1)%r.length];s+=a[0]*b[1]-b[0]*a[1]}return Math.abs(s)/2}
function gwFree(g){removeColliders(g.userData.cols);if(g.userData.full)gwDropDecks(g.userData.key);scene.remove(g);g.traverse(o=>{if(o.geometry&&o.geometry!==GEO.box)o.geometry.dispose()})}

/* ---------- streaming ---------- */
function initGeoWorld(){GW.started=true;
  const gt=TX.grass.clone();gt.needsUpdate=true;gt.wrapS=gt.wrapT=THREE.RepeatWrapping;gt.repeat.set(860,860);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000),new THREE.MeshLambertMaterial({color:0xa39e82,map:gt}));ground.rotation.x=-Math.PI/2;ground.position.set(1500,0,-1300);ground.receiveShadow=true;scene.add(ground);
  fetch(GW_DIR+'index.json').then(r=>r.json()).then(ix=>{GW.index=ix;geoMinimapBase()}).catch(e=>{console.error(e);toast('MAP DATA MISSING','Run the game through start-server.bat',6)});
  fetch('geodata/processed/pilot/landmarks.json').then(r=>r.json()).then(j=>{DISTRICTS.length=0;for(const L of j.landmarks)if(L.in_pilot&&(L.category==='district'||L.id==='town_hall'))DISTRICTS.push({n:L.name.replace('Victoria ',''),x:L.x,z:L.z})}).catch(()=>{})}
function updateGeoWorld(){if(!GW.index)return;const P=playerP(),S=GW.index.size_m;
  for(const c of GW.index.chunks){const key=c.i+','+c.j,d=Math.hypot(P.x-(c.i+0.5)*S,P.z-(c.j+0.5)*S),want=d<GW_NEAR?2:d<GW_FAR?1:0,live=GW.live.get(key);
    if(want&&!GW.data.has(key)){if(!GW.pending.has(key)){GW.pending.add(key);fetch(GW_DIR+c.file).then(r=>r.json()).then(j=>{GW.data.set(key,j);GW.pending.delete(key);gwMapChunk(j)}).catch(e=>console.error(e))}continue}
    if(want&&(!live||live.userData.full!==(want===2))){if(!GW.queue.includes(key))GW.queue.push(key)}
    else if(!want&&live&&d>GW_FAR+GW_DROP){gwFree(live);GW.live.delete(key)}}
  const key=GW.queue.shift();if(key){const c=GW.index.chunks.find(c=>c.i+','+c.j===key),d=Math.hypot(P.x-(c.i+0.5)*S,P.z-(c.j+0.5)*S),old=GW.live.get(key);
    if(old)gwFree(old);GW.live.set(key,gwBuild(key,d<GW_NEAR));if(!GW.snapped)gwSnapPlayer()}}   /* one chunk per frame keeps frames smooth */
/* first time the player's chunk is built: move the player to the nearest road point, and park the starter car and bike along that road */
function gwSnapPlayer(){const P=player.pos,S=GW.index.size_m,d=GW.data.get(Math.floor(P.x/S)+','+Math.floor(P.z/S));if(!d)return;GW.snapped=true;let best=null,bd=1e9,dir=[1,0];
  for(const r of d.roads||[])if(!r.bridge&&r.width>=6)for(let k=0;k<r.pts.length;k++){const q=r.pts[k],dd=Math.hypot(q[0]-P.x,q[1]-P.z);if(dd<bd){bd=dd;best=q;const n=r.pts[Math.min(k+1,r.pts.length-1)],p=r.pts[Math.max(k-1,0)],l=Math.hypot(n[0]-p[0],n[1]-p[1])||1;dir=[(n[0]-p[0])/l,(n[1]-p[1])/l]}}
  if(!best)return;if(!player.vehicle)player.pos.set(best[0],0,best[1]);const h=Math.atan2(dir[0],dir[1]);
  GW.starters.forEach((v,k)=>{const a=k?-6:8;v.pos.set(best[0]+dir[0]*a+dir[1]*1.8,v.pos.y,best[1]+dir[1]*a-dir[0]*1.8);v.heading=h;v.vx=v.vz=v.speed=0})}
/* name of the road under (x, z), from the loaded chunk data */
function geoRoadName(x,z){const S=GW.index?GW.index.size_m:1000,d=GW.data.get(Math.floor(x/S)+','+Math.floor(z/S));if(!d)return null;let best=null,bd=1e9;
  for(const r of d.roads||[]){if(!r.name)continue;for(let k=1;k<r.pts.length;k++){const dd=segDist(x,z,r.pts[k-1],r.pts[k]);if(dd<r.width/2+1&&dd<bd){bd=dd;best=r.name}}}return best}

/* ---------- minimap: same data, drawn as chunks arrive ---------- */
const GW_MS=0.25;
function geoMinimapBase(){const R=GW.index.rect;MX0=R[0]-200;MZ0=R[1]-200;MX1=R[2]+200;MZ1=R[3]+200;OMS=GW_MS;
  offMap=document.createElement('canvas');offMap.width=Math.ceil((MX1-MX0)*GW_MS);offMap.height=Math.ceil((MZ1-MZ0)*GW_MS);const o=offMap.getContext('2d');o.fillStyle='#b9b39a';o.fillRect(0,0,offMap.width,offMap.height);
  GW.mapReady=true;for(const d of GW.data.values())gwMapChunk(d)}
function gwMapChunk(d){if(!GW.mapReady)return;const o=offMap.getContext('2d'),X=v=>(v-MX0)*GW_MS,Z=v=>(v-MZ0)*GW_MS;
  const poly=(r,c)=>{o.fillStyle=c;o.beginPath();r.forEach((q,k)=>k?o.lineTo(X(q[0]),Z(q[1])):o.moveTo(X(q[0]),Z(q[1])));o.closePath();o.fill()};
  for(const a of d.landuse||[])poly(a.pts,GW_LAND[a.kind]||'#b3aa8e');for(const w of d.water||[])poly(w.pts,'#4f93c4');
  for(const b of d.buildings||[])poly(b.pts,'#a29a88');
  o.lineCap='round';o.strokeStyle='#6d655a';o.lineWidth=2.4*GW_MS*4;for(const r of d.rail||[]){o.beginPath();r.pts.forEach((q,k)=>k?o.lineTo(X(q[0]),Z(q[1])):o.moveTo(X(q[0]),Z(q[1])));o.stroke()}
  for(const r of(d.roads||[]).slice().sort((a,b)=>a.width-b.width)){o.strokeStyle=r.width>=10?'#f4f1e8':'#e2ddd0';o.lineWidth=Math.max(1.2,r.width*GW_MS);o.beginPath();r.pts.forEach((q,k)=>k?o.lineTo(X(q[0]),Z(q[1])):o.moveTo(X(q[0]),Z(q[1])));o.stroke()}}
