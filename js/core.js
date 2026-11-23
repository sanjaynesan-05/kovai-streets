/* Kovai Streets: core.js
 * Shared utilities, renderer, scene and lights, world constants, collision grid, static geometry batching, mesh-building helpers, graphics quality, settings store
 * Classic script, loaded in order by index.html (1 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

const $=id=>document.getElementById(id);
if(!window.THREE){$('loading').textContent='Could not load the 3D engine. Check your connection and reload.';throw new Error('Three.js failed to load')}
const QL=(()=>{let q=(location.hash||'').replace('#','');if(!['low','medium','high'].includes(q)){try{q=localStorage.getItem('kovaiQ')||''}catch(e){}}
  if(!['low','medium','high'].includes(q))q=(window.matchMedia&&matchMedia('(pointer: coarse)').matches)?'low':'medium';return q})();
const QS={low:{pr:1,shadow:0,peds:38,traffic:30,trees:380},medium:{pr:1.25,shadow:1024,peds:70,traffic:42,trees:800},high:{pr:1.75,shadow:2048,peds:95,traffic:52,trees:1300}}[QL];

/* ================= basics ================= */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rng=mulberry32(641001);
const R=(a,b)=>a+(b-a)*rng(), pick=a=>a[Math.floor(rng()*a.length)];
const RR=(a,b)=>a+(b-a)*Math.random(), rpick=a=>a[Math.floor(Math.random()*a.length)], RI=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function angDiff(a,b){let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d}
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

const canvas=$('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,QS.pr));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=QS.shadow>0;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,0.1,3000);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
{const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#4f8fd0');gr.addColorStop(0.5,'#9cc6e6');gr.addColorStop(1,'#e2eae6');g.fillStyle=gr;g.fillRect(0,0,2,256);scene.background=new THREE.CanvasTexture(c)}
scene.fog=new THREE.Fog(0xdde7e4,180,1500);
const hemi=new THREE.HemisphereLight(0xeef5ff,0x9a958a,0.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d2,0.85);sun.castShadow=QS.shadow>0;sun.shadow.mapSize.set(QS.shadow||512,QS.shadow||512);
{const c=sun.shadow.camera;c.left=-90;c.right=90;c.top=90;c.bottom=-90;c.near=1;c.far=420}
sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;scene.add(sun);scene.add(sun.target);
const SUN_OFF=new THREE.Vector3(70,140,45);

const matCache=new Map();
function M(c){let m=matCache.get(c);if(!m){m=new THREE.MeshLambertMaterial({color:c});matCache.set(c,m)}return m}
const MB={};function MBasic(c){return MB[c]||(MB[c]=new THREE.MeshBasicMaterial({color:c}))}
const GEO={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),cone7:new THREE.ConeGeometry(1,1,7),cone4:new THREE.ConeGeometry(1,1,4),cone8:new THREE.ConeGeometry(1,1,8),sph:new THREE.SphereGeometry(1,12,9)};

/* ================= world constants ================= */
const CELL=74,NB=10,LIM=NB*CELL,HR=7,LANE=3.5,GX=370,BOUND=560+GX;
/* Map step D2: the city grew from 10 x 10 to 20 x 20 blocks, so the map edge moved outward by GX. ox() converts an x or z
   coordinate written for the old map: beyond the old city edge (±370) it moves outward by GX; inside the city it is unchanged.
   Hills (west) and coast (east) positions only move in x. */
function ox(v){return v>370?v+GX:v<-370?v-GX:v}
/* Build offset: everything added with addG/addBox/addFlat/quad/addCollider/palm while it is set moves by (BO.x, BO.z).
   Used to move whole outskirts areas (coast, railway station, statue) without rewriting their coordinates. */
const BO={x:0,z:0};function shifted(dx,dz,fn){BO.x=dx;BO.z=dz;try{fn()}finally{BO.x=0;BO.z=0}}
const PAL=['#f2e6c9','#e8d3a9','#cfe3e8','#f3c6c0','#d7e8c8','#f5f1e6','#efd28a','#a8c5da','#f2b38a','#d9d2e9','#e4e0d6','#bfe0d0','#f6d6e0'];
const SIGN=['#d62828','#f77f00','#2a9d8f','#1d4ed8','#7b2cbf','#e9c46a','#2b9348','#c1121f','#118ab2'];
/* Map step D3: district label points from tools/map/landmarks.json (real direction from Town Hall, see tools/map/REPORT.md),
   shifted so Town Hall sits on the game's Town Hall block at (-37, 111). Saravanampatti, Kuniyamuthur and the hill/coast names are not in the registry yet. */
const TH={x:-37,z:111};const DISTRICTS=[{n:'Gandhipuram',x:44,z:-196},{n:'R.S. Puram',x:-169,z:-70},{n:'Town Hall',x:-37,z:111},{n:'Race Course',x:168,z:15},{n:'Peelamedu',x:283,z:-187},{n:'Ukkadam',x:-16,z:136},{n:'Singanallur',x:447,z:36},{n:'Saibaba Colony',x:-206,z:-216},{n:'Vadavalli',x:-466,z:-138},{n:'Marudhamalai',x:-703,z:-218},{n:'Ramanathapuram',x:312,z:94},{n:'Uppilipalayam',x:431,z:-33},{n:'Podanur',x:213,z:433},{n:'Perur',x:-442,z:259},{n:'Lakshmi Mills',x:240,z:-109},{n:'Hope College',x:393,z:-145},{n:'Airport',x:497,z:-146},{n:'Saravanampatti',x:150,z:ox(-390)},{n:'Kuniyamuthur',x:-330,z:260},{n:'Velliangiri Foothills',x:ox(-480),z:-170},{n:'Ghat Road',x:ox(-780),z:0},{n:'Hilltop Viewpoint',x:ox(-1000),z:-150},{n:'Kovai Coast',x:ox(660),z:60},{n:'Lighthouse Point',x:ox(690),z:-410},{n:'Open Sea',x:ox(900),z:0}];
/* Named roads (grid segments). The HUD shows the name while you are on one. Step D4 adds the main roads. Big Bazaar Street's direction still needs checking on a map. */
const ROADS=[{n:'Big Bazaar Street',x0:-HR,x1:HR,z0:74,z1:148}];
function roadName(x,z){for(const r of ROADS)if(x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1)return r.n;return null}
function district(x,z){let b=null,bd=1e18;for(const d of DISTRICTS){const q=(d.x-x)**2+(d.z-z)**2;if(q<bd){bd=q;b=d}}return b.n}

/* ================= colliders ================= */
const GS=16,grid=new Map(),boxes=[];let stamp=0;
function addCollider(minX,minZ,maxX,maxZ,h,y0){minX+=BO.x;maxX+=BO.x;minZ+=BO.z;maxZ+=BO.z;const b={minX,minZ,maxX,maxZ,h,y0:y0===undefined?-1:y0,s:0};boxes.push(b);
  for(let ix=Math.floor(minX/GS);ix<=Math.floor(maxX/GS);ix++)for(let iz=Math.floor(minZ/GS);iz<=Math.floor(maxZ/GS);iz++){const k=ix*4099+iz;let l=grid.get(k);if(!l){l=[];grid.set(k,l)}l.push(b)}return b}
const qOut=[];
function queryBoxes(x,z,r){qOut.length=0;stamp++;const x0=Math.floor((x-r)/GS),x1=Math.floor((x+r)/GS),z0=Math.floor((z-r)/GS),z1=Math.floor((z+r)/GS);
  for(let ix=x0;ix<=x1;ix++)for(let iz=z0;iz<=z1;iz++){const l=grid.get(ix*4099+iz);if(!l)continue;for(let i=0;i<l.length;i++){const b=l[i];if(b.s!==stamp){b.s=stamp;qOut.push(b)}}}return qOut}
let pnx=0,pnz=0;
function pushCircle(p,r,y,ht){y=y||0;ht=ht||1.8;let hit=false;pnx=0;pnz=0;const list=queryBoxes(p.x,p.z,r);
  for(let i=0;i<list.length;i++){const b=list[i];if(y+ht<b.y0||y>b.h-0.25)continue;const cx=p.x<b.minX?b.minX:p.x>b.maxX?b.maxX:p.x,cz=p.z<b.minZ?b.minZ:p.z>b.maxZ?b.maxZ:p.z;
    const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;if(d2>=r*r)continue;
    if(d2>1e-9){const d=Math.sqrt(d2),pen=r-d;p.x+=dx/d*pen;p.z+=dz/d*pen;pnx+=dx/d;pnz+=dz/d}
    else{const l=p.x-b.minX,rr=b.maxX-p.x,t=p.z-b.minZ,bt=b.maxZ-p.z,m=Math.min(l,rr,t,bt);
      if(m===l){p.x=b.minX-r;pnx-=1}else if(m===rr){p.x=b.maxX+r;pnx+=1}else if(m===t){p.z=b.minZ-r;pnz-=1}else{p.z=b.maxZ+r;pnz+=1}}
    hit=true}
  return hit}
const _ray=new THREE.Ray(),_box=new THREE.Box3(),_hp=new THREE.Vector3();
function rayBoxes(origin,dir,maxD,minT){_ray.origin.copy(origin);_ray.direction.copy(dir);let best=maxD;
  for(let i=0;i<boxes.length;i++){const b=boxes[i];_box.min.set(b.minX,b.y0,b.minZ);_box.max.set(b.maxX,b.h,b.maxZ);
    if(_ray.intersectBox(_box,_hp)){const t=_hp.distanceTo(origin);if(t>minT&&t<best)best=t}}
  return best}
const _la=new THREE.Vector3(),_lb=new THREE.Vector3(),_ld=new THREE.Vector3();
function los(ax,ay,az,bx,by,bz){_la.set(ax,ay,az);_lb.set(bx,by,bz);_ld.subVectors(_lb,_la);const d=_ld.length();_ld.divideScalar(d);return rayBoxes(_la,_ld,d-0.4,0.3)>=d-0.4}
function groundH(x,z){if(x<-552-GX)return terrainH(x,z);if(x>596+GX)return coastH(x,z);if(Math.abs(x)>LIM||Math.abs(z)>LIM)return 0;const lx=x-(Math.floor(x/CELL)+0.5)*CELL,lz=z-(Math.floor(z/CELL)+0.5)*CELL;return(Math.abs(lx)<30&&Math.abs(lz)<30)?0.16:0}

/* ================= static geometry batching ================= */
function batch(){return{pos:[],nor:[],uv:[],col:[]}}
const B_WIN=batch(),B_PLAIN=batch(),B_FAR=batch();
const _o=new THREE.Object3D(),_col=new THREE.Color();
function addG(B,geom,x,y,z,color,ry,rx,rz,sx,sy,sz){
  _o.position.set(x+BO.x,y,z+BO.z);_o.rotation.set(rx||0,ry||0,rz||0);_o.scale.set(sx||1,sy||1,sz||1);_o.updateMatrix();
  const g=geom.index?geom.toNonIndexed():geom.clone();g.applyMatrix4(_o.matrix);
  const p=g.attributes.position.array,n=g.attributes.normal.array,uv=g.attributes.uv?g.attributes.uv.array:null;
  _col.set(color);const vc=p.length/3;
  for(let i=0;i<p.length;i++){B.pos.push(p[i]);B.nor.push(n[i])}
  for(let i=0;i<vc;i++){B.col.push(_col.r,_col.g,_col.b);if(uv&&B.tex)B.uv.push(uv[i*2],uv[i*2+1]);else B.uv.push(0.01,0.01)}
  g.dispose()}
const addBox=(B,w,h,d,x,y,z,c,ry)=>addG(B,GEO.box,x,y,z,c,ry||0,0,0,w,h,d);
function finish(B,mat,shadow){const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(B.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.nor,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(B.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(B.col,3));
  g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.castShadow=shadow;m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);B.pos=B.nor=B.uv=B.col=null;return m}

const [wallTex,emTex]=(()=>{const mk=()=>{const c=document.createElement('canvas');c.width=c.height=256;return c};const c=mk(),e=mk(),g=c.getContext('2d'),ge=e.getContext('2d');
  ge.fillStyle='#000';ge.fillRect(0,0,256,256);
  for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const ox=bx*64,oy=by*64;g.fillStyle='#ffffff';g.fillRect(ox,oy,64,64);g.fillStyle='#d4d4d4';g.fillRect(ox,oy+58,64,6);
    g.fillStyle='#e9e9e9';g.fillRect(ox+13,oy+44,38,4);g.fillStyle='#35424e';g.fillRect(ox+16,oy+14,32,30);g.fillStyle='#55697a';g.fillRect(ox+16,oy+14,32,6);g.fillStyle='#262f38';g.fillRect(ox+31,oy+14,2,30);
    if(Math.random()<0.45){ge.fillStyle=Math.random()<0.7?'#ffcf7a':'#cfe8ff';ge.fillRect(ox+16,oy+14,32,30);ge.fillStyle='#000';ge.fillRect(ox+31,oy+14,2,30)}}
  const t=new THREE.CanvasTexture(c),te=new THREE.CanvasTexture(e);for(const x of[t,te]){x.wrapS=x.wrapT=THREE.RepeatWrapping;x.anisotropy=4}return[t,te]})();
const winMat=new THREE.MeshLambertMaterial({map:wallTex,emissiveMap:emTex,emissive:0x000000,vertexColors:true});
const plainMat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:55,specular:0x000000});
function buildingGeo(w,h,d){const g=new THREE.BoxGeometry(w,h,d);const uv=g.attributes.uv;const fl=h/3.4;
  for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;if(f===2||f===3){uv.setXY(i,0.01,0.01);continue}
    const horiz=f<2?d:w;uv.setXY(i,uv.getX(i)*Math.max(1,Math.round(horiz/5))/4,uv.getY(i)*fl/4)}return g}
const palms=[];function palm(x,z,coll){palms.push([x+BO.x,z+BO.z]);if(coll!==false)addCollider(x-0.35,z-0.35,x+0.35,z+0.35,8)}
function neem(x,z){addG(B_PLAIN,GEO.cyl,x,1.6,z,'#5e4632',0,0,0,0.3,3.2,0.3);addG(B_PLAIN,GEO.sph,x,4.4,z,pick(['#4e7d36','#5b8a3c','#46703a']),0,0,0,R(2.4,3.2),R(2,2.6),R(2.4,3.2));addCollider(x-0.35,z-0.35,x+0.35,z+0.35,6)}


/* ================= realism overhaul: shared helpers ================= */
const VCM=new THREE.MeshLambertMaterial({vertexColors:true}),VCB=new THREE.MeshBasicMaterial({vertexColors:true});
function GB(){return{pos:[],nor:[],col:[]}}
const _gm=new THREE.Matrix4(),_gq=new THREE.Quaternion(),_ge=new THREE.Euler(),_gv=new THREE.Vector3(),_gs=new THREE.Vector3(),_gc=new THREE.Color();
function gbM(B,geom,mat,color){const g=geom.index?geom.toNonIndexed():geom.clone();g.applyMatrix4(mat);const p=g.attributes.position.array,n=g.attributes.normal.array;_gc.set(color);
  for(let i=0;i<p.length;i++){B.pos.push(p[i]);B.nor.push(n[i])}for(let i=0;i<p.length/3;i++)B.col.push(_gc.r,_gc.g,_gc.b);g.dispose()}
function gb(B,geom,x,y,z,color,rx,ry,rz,sx,sy,sz){_ge.set(rx||0,ry||0,rz||0);_gq.setFromEuler(_ge);_gm.compose(_gv.set(x,y,z),_gq,_gs.set(sx||1,sy||1,sz||1));gbM(B,geom,_gm,color)}
const gbBox=(B,w,h,d,x,y,z,c,rx,ry,rz)=>gb(B,GEO.box,x,y,z,c,rx,ry,rz,w,h,d);
function gbTube(B,a,b,r,c){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);_gq.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L));
  _gm.compose(_gv.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),_gq,_gs.set(r,L,r));gbM(B,GEO.cyl8,_gm,c)}
function gbGeo(B){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(B.col,3));g.computeBoundingSphere();return g}
function gbMesh(B,mat,shadow){const m=new THREE.Mesh(gbGeo(B),mat||VCM);m.castShadow=shadow!==false;return m}
GEO.cyl8=new THREE.CylinderGeometry(1,1,1,8);GEO.cyl16=new THREE.CylinderGeometry(1,1,1,16);GEO.sph16=new THREE.SphereGeometry(1,16,12);
const CY=(rt,rb,h,s)=>new THREE.CylinderGeometry(rt,rb,h,s||10);
function shade(hex,f){const c=new THREE.Color(hex);c.multiplyScalar(f);return'#'+c.getHexString()}
function profileGeo(pts,width,bevel){const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)sh.quadraticCurveTo(p[0],p[1],p[2],p[3]);else sh.lineTo(p[0],p[1])}sh.closePath();
  const b=bevel===undefined?0.07:bevel,d=Math.max(0.04,width-2*b);const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:6});
  g.rotateY(-Math.PI/2);g.translate(d/2,0,0);return g}
function topGeo(pts,height,bevel){const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)sh.quadraticCurveTo(p[0],p[1],p[2],p[3]);else sh.lineTo(p[0],p[1])}sh.closePath();
  const b=bevel||0.05;const g=new THREE.ExtrudeGeometry(sh,{depth:height,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:8});g.rotateX(Math.PI/2);g.translate(0,height,0);return g}

/* ================= quality setting ================= */
function setQuality(q){try{localStorage.setItem('kovaiQ',q)}catch(e){}try{location.hash=q}catch(e){}location.reload()}
document.querySelectorAll('.qsel button').forEach(b=>{b.classList.toggle('on',b.dataset.q===QL);b.addEventListener('click',e=>{e.stopPropagation();if(b.dataset.q!==QL)setQuality(b.dataset.q)})});


const SET_KEY='kovaiSettings1';
const SET=Object.assign({sens:1,inv:false,vol:0.8,radio:0.6,station:1},(()=>{try{return JSON.parse(localStorage.getItem(SET_KEY)||'{}')}catch(e){return{}}})());
function saveSettings(){try{localStorage.setItem(SET_KEY,JSON.stringify(SET))}catch(e){}if(OUT)OUT.gain.value=SET.vol}
