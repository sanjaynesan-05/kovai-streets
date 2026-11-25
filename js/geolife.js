/* Kovai Streets: geolife.js
 * Step D7 on the real map: a busier city that still runs well.
 * - Density by area: from the real number of buildings in each map chunk (geodata/processed/kovai/chunks/index.json).
 *   It sets how much traffic is around you and where pedestrians gather.
 * - Local vehicle mix: more buses and autos on main roads in busy areas; no buses or lorries in small residential lanes.
 * - Along main roads and neighbourhood streets, built per chunk at full detail and freed with it: street lamps (lit at night), parked cars,
 *   street-vendor carts and bus stops. Each item stands on a kerb that is clear of every other road surface (so nothing lands on the
 *   other half of a dual carriageway) and at least 12 m from crossing roads; if its usual kerb is blocked it moves to the other one. Bus stop positions are generated every few hundred metres along trunk and
 *   primary roads (the OpenStreetMap download has no bus-stop points); they are not real stop locations.
 * - Bus stands (OpenStreetMap bus_station areas) are filled with rows of parked buses, with passengers waiting beside them.
 * - A small pool of vendors and waiting passengers is placed at the carts and stops nearest to you.
 * - Night lighting materials and the car headlight spotlight (restored after G7 removed the grid lamps that created them).
 * Classic script, loaded after geonav.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const LIFE_MAIN={trunk:1,primary:1,secondary:1,tertiary:1},LIFE_LAMP={trunk:33,primary:33,secondary:33,tertiary:40,residential:30},LIFE_PARK={primary:0.33,secondary:0.33,tertiary:0.33,residential:0.2};   // lamp spacing (m); parked-car chance per slot
/* shared instanced geometries (gwFree must not dispose them) */
const LIFE_GEO=(()=>{const g={pole:new THREE.CylinderGeometry(0.09,0.13,7,6).translate(0,3.5,0),arm:new THREE.BoxGeometry(0.1,0.1,1.8).translate(0,0,0.9),head:new THREE.BoxGeometry(0.55,0.14,0.32),
  pool:new THREE.CircleGeometry(5,18).rotateX(-Math.PI/2),body:new THREE.BoxGeometry(1.8,1.0,4.2).translate(0,0.55,0),cabin:new THREE.BoxGeometry(1.6,0.7,2.2).translate(0,1.4,-0.2),
  cart:new THREE.BoxGeometry(2.2,1.0,1.1).translate(0,0.6,0),canopy:new THREE.BoxGeometry(2.6,0.08,1.6).translate(0,2.3,0),post:new THREE.BoxGeometry(0.12,2.6,0.12).translate(0,1.3,0),
  bus:new THREE.BoxGeometry(2.5,2.9,11).translate(0,1.75,0),busWin:new THREE.BoxGeometry(2.56,0.85,9.4).translate(0,2.35,0.4),
  roof:new THREE.BoxGeometry(4.2,0.12,1.8).translate(0,2.65,0),bench:new THREE.BoxGeometry(3.4,0.45,0.6).translate(0,0.25,0.3)};for(const k in g)g[k].userData.shared=true;return g})();
const LIFE_MAT={glass:M('#22303a'),metal:M('#5d6166'),white:new THREE.MeshLambertMaterial({color:0xffffff}),cart:M('#2a9d8f'),roof:M('#2a6f97')};
const BUS_COLS=['#c1121f','#1d4e89','#f4f1e8','#2a9d8f','#e9c46a'],CAR_COLS=['#f2f2f2','#c1121f','#1d3557','#2b2d42','#b3b3b3','#e9c46a','#3a5a40','#111111','#8d99ae'];
const LIFE_SPOTS=new Map();   // chunk key -> [{x,z,kind:'cart'|'stop',yaw}] for the vendor / passenger pool

/* night lighting: lamp heads, light pools on the road, headlight beams, the car headlight spotlight (used by environment.js) */
function initLights(){lampHeadMat=new THREE.MeshBasicMaterial({color:0x777777});
  poolMat=new THREE.MeshBasicMaterial({color:0xffc277,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  beamMat=new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});beamMat.userData.shared=true;
  spot=new THREE.SpotLight(0xfff2d0,0,70,0.55,0.5,1.2);scene.add(spot);scene.add(spot.target)}

/* density 0.25..1 per chunk, from its building count relative to the busiest chunks */
let LIFE_DENS=null;
function geoDensity(x,z){const ix=GWLD.index;if(!ix)return 0.6;if(!LIFE_DENS){LIFE_DENS=new Map();const n=ix.chunks.map(c=>c.counts.buildings||0).sort((a,b)=>b-a),ref=Math.max(1,n[Math.floor(n.length*0.1)]);
    for(const c of ix.chunks)LIFE_DENS.set(c.i+','+c.j,clamp((c.counts.buildings||0)/ref,0.25,1))}
  return LIFE_DENS.get(Math.floor(x/ix.size_m)+','+Math.floor(z/ix.size_m))||0.25}
/* local vehicle mix */
function geoMix(type,e){const small=!LIFE_MAIN[e.cls];if(small&&(type==='bus'||type==='lorry'||type==='tempo'))return rpick(['auto','scooter','hatch']);
  if(!small&&(e.cls==='trunk'||e.cls==='primary')&&Math.random()<0.3*geoDensity(e.pts[0][0],e.pts[0][1]))return rpick(['bus','auto','auto','scooter']);return type}

/* stunt ramp run-ups and landing zones stay clear of street furniture (from 15 m before a ramp to 90 m after it) */
function rampZone(x,z){if(!RAMPS_READY)return false;for(const r of RAMPS){const[ax,az]=r.a,[dx,dz]=r.d,u=(x-ax)*dx+(z-az)*dz,l=(x-ax)*dz-(z-az)*dx;if(u>-15&&u<90&&Math.abs(l)<14)return true}return false}
/* road segments of a chunk and its loaded neighbours in 20 m cells (each segment listed in every cell within 30 m of it) */
function lifeSegs(key){const[i,j]=key.split(',').map(Number),cells=new Map();
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const d=GWLD.data.get((i+di)+','+(j+dj));if(!d)continue;
    for(const r of d.roads||[]){const p=r.pts,deck=!!(r.bridge&&r.layer);
      for(let k=1;k<p.length;k++){const a=p[k-1],b=p[k],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,sg={a,b,w:r.width/2,id:r.id,ux:(b[0]-a[0])/L,uz:(b[1]-a[1])/L,deck};
        for(let x=Math.floor((Math.min(a[0],b[0])-30)/20);x<=Math.floor((Math.max(a[0],b[0])+30)/20);x++)for(let z=Math.floor((Math.min(a[1],b[1])-30)/20);z<=Math.floor((Math.max(a[1],b[1])+30)/20);z++){const c=x+','+z;if(!cells.has(c))cells.set(c,[]);cells.get(c).push(sg)}}}}
  return cells}
/* is (x, z) out from under flyover decks, off every other road surface, and at least 12 m from roads that cross this one (parallel roads, like the other half of a dual carriageway, only need 1.5 m) */
function lifeFree(cells,x,z,id,ux,uz){for(const s of cells.get(Math.floor(x/20)+','+Math.floor(z/20))||[]){if(s.deck){if(segDist(x,z,s.a,s.b)<s.w+2)return false;continue}/* nothing under a flyover deck */if(s.id===id)continue;if(segDist(x,z,s.a,s.b)<s.w+(Math.abs(s.ux*ux+s.uz*uz)>0.9?1.5:12))return false}return true}
/* per-chunk street furniture; returns nothing, adds meshes to the chunk group and colliders to cols */
function gwLife(d,key,g,cols){const lamps=[],cars=[],carts=[],stops=[],spots=[],o=new THREE.Object3D(),low=QL==='low',cells=lifeSegs(key);/* Low quality: lamps twice as far apart, no parked cars or carts */
  for(const r of d.roads||[]){if(!LIFE_LAMP[r.cls]||r.bridge||r.layer)continue;const p=r.pts,dens=geoDensity(p[0][0],p[0][1]),lampGap=LIFE_LAMP[r.cls]*(low?2:1);let run=0;
    for(let k=1;k<p.length;k++){const a=p[k-1],b=p[k],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<1)continue;const ux=dx/L,uz=dz/L,lx=uz,lz=-ux,yaw=Math.atan2(ux,uz);
      for(let s=0;s<L;s+=3){const t=run+s,h=gwHash((r.id|0)*131+Math.floor(t/3)),x=a[0]+ux*s,z=a[1]+uz*s;if(t<14||rampZone(x,z))continue;
        /* side +1 = left kerb (+lx), -1 = right kerb; the other kerb is used when the preferred one is not clear; yaw turns with the side */
        const put=(list,off,side)=>{for(const sd of[side,-side]){const px=x+lx*off*sd,pz=z+lz*off*sd;if(lifeFree(cells,px,pz,r.id,ux,uz)){list.push([px,pz,sd===side?yaw:yaw+Math.PI]);return true}}return false};
        if(t%lampGap<3)put(lamps,r.width/2+0.6,-1);                                                               // lamps on the right edge, arm over the road
        else if(!low&&t%9<3&&h<LIFE_PARK[r.cls]*dens)put(cars,r.width/2+1.0,1);                                    // parked on the left kerb
        else if(!low&&LIFE_MAIN[r.cls]&&dens>0.5&&t%57<3&&h>0.72)put(carts,r.width/2+2.3,-1);                     // vendor carts on the right footpath
        if((r.cls==='trunk'||r.cls==='primary')&&t%450<3&&t>60)put(stops,r.width/2+2.6,1)}                        // generated bus stops (left side)
      run+=L}}
  /* bus stands: rows of parked buses (nose north), clear of roads; every third bus has people waiting beside it */
  const buses=[],inPoly=(x,z,r)=>{let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],c=r[j];if((a[1]>z)!==(c[1]>z)&&x<(c[0]-a[0])*(z-a[1])/(c[1]-a[1])+a[0])ins=!ins}return ins};
  for(const a of d.landuse||[]){if(a.kind!=='bus_station')continue;const r=a.pts,xs=r.map(q=>q[0]),zs=r.map(q=>q[1]);
    for(let x=Math.min(...xs)+5;x<Math.max(...xs)-5;x+=4.5)for(let z=Math.min(...zs)+8;z<Math.max(...zs)-8;z+=16){if(gwHash(Math.round(x*3+z*7))>0.6)continue;
      if(![[-1.6,-6],[1.6,-6],[-1.6,6],[1.6,6]].every(q=>inPoly(x+q[0],z+q[1],r))||!lifeFree(cells,x,z-6,null,0,1)||!lifeFree(cells,x,z+6,null,0,1))continue;buses.push([x,z,0])}}
  for(const q of buses)cols.push(addCollider(q[0]-1.3,q[1]-5.6,q[0]+1.3,q[1]+5.6,3.2));
  buses.forEach((q,i)=>{if(i%3===0){spots.push({x:q[0]+2.1,z:q[1]-2,kind:'stop',yaw:-Math.PI/2});spots.push({x:q[0]+2.3,z:q[1]+1.5,kind:'stop',yaw:-Math.PI/2})}});
  const inst=(geo,mat,list,place)=>{if(!list.length)return null;const m=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((q,i)=>{place(q,o);o.updateMatrix();m.setMatrixAt(i,o.matrix)});g.add(m);return m};
  for(let i=cars.length-1;i>=0;i--)if(stops.some(q=>Math.hypot(q[0]-cars[i][0],q[1]-cars[i][1])<7))cars.splice(i,1);   /* keep bus stops clear */
  /* lamps: pole, arm and head point across the road (the road is to the lamp's left, +lx) */
  inst(LIFE_GEO.pole,LIFE_MAT.metal,lamps,q=>{o.rotation.set(0,0,0);o.position.set(q[0],0,q[1])});
  inst(LIFE_GEO.arm,LIFE_MAT.metal,lamps,q=>{o.rotation.set(0,q[2]+Math.PI/2,0);o.position.set(q[0],6.9,q[1])});
  inst(LIFE_GEO.head,lampHeadMat,lamps,q=>{o.rotation.set(0,q[2],0);o.position.set(q[0]+Math.cos(q[2])*1.8,6.85,q[1]-Math.sin(q[2])*1.8)});
  inst(LIFE_GEO.pool,poolMat,lamps,q=>{o.rotation.set(0,0,0);o.position.set(q[0]+Math.cos(q[2])*2.6,0.09,q[1]-Math.sin(q[2])*2.6)});
  for(const q of lamps)cols.push(addCollider(q[0]-0.15,q[1]-0.15,q[0]+0.15,q[1]+0.15,7));
  /* parked cars: body + cabin, a colour each; two small colliders along the car */
  for(const part of['body','cabin']){const m=inst(LIFE_GEO[part],LIFE_MAT.white,cars,q=>{o.rotation.set(0,q[2],0);o.position.set(q[0],0,q[1])});
    if(m){const c=new THREE.Color();cars.forEach((q,i)=>{c.set(CAR_COLS[(gwHash(Math.round(q[0]*7+q[1]*13))*CAR_COLS.length)|0]);if(part==='cabin')c.multiplyScalar(0.55);m.setColorAt(i,c)});m.instanceColor.needsUpdate=true}}
  for(const q of cars)for(const f of[-1.2,1.2]){const x=q[0]+Math.sin(q[2])*f,z=q[1]+Math.cos(q[2])*f;cols.push(addCollider(x-0.9,z-0.9,x+0.9,z+0.9,1.5))}
  /* vendor carts and bus stops */
  inst(LIFE_GEO.cart,LIFE_MAT.cart,carts,q=>{o.rotation.set(0,q[2],0);o.position.set(q[0],0,q[1])});inst(LIFE_GEO.canopy,M('#e76f51'),carts,q=>{o.rotation.set(0,q[2],0);o.position.set(q[0],0,q[1])});
  for(const q of carts){cols.push(addCollider(q[0]-1.1,q[1]-1.1,q[0]+1.1,q[1]+1.1,1.2));spots.push({x:q[0]+Math.cos(q[2])*1.2,z:q[1]-Math.sin(q[2])*1.2,kind:'cart',yaw:q[2]-Math.PI/2})}
  inst(LIFE_GEO.roof,LIFE_MAT.roof,stops,q=>{o.rotation.set(0,q[2],0);o.position.set(q[0],0,q[1])});inst(LIFE_GEO.bench,LIFE_MAT.metal,stops,q=>{o.rotation.set(0,q[2]+Math.PI/2,0);o.position.set(q[0],0,q[1])});
  const posts=[];for(const q of stops)for(const f of[-1.9,1.9])posts.push([q[0]+Math.sin(q[2])*f,q[1]+Math.cos(q[2])*f,q[2]]);inst(LIFE_GEO.post,LIFE_MAT.metal,posts,q=>{o.rotation.set(0,q[2],0);o.position.set(q[0],0,q[1])});
  for(const q of stops){spots.push({x:q[0]-Math.cos(q[2])*1.4,z:q[1]+Math.sin(q[2])*1.4,kind:'stop',yaw:q[2]+Math.PI/2});spots.push({x:q[0]-Math.cos(q[2])*1.4+Math.sin(q[2])*1.2,z:q[1]+Math.sin(q[2])*1.4+Math.cos(q[2])*1.2,kind:'stop',yaw:q[2]+Math.PI/2})}
  {const m=inst(LIFE_GEO.bus,LIFE_MAT.white,buses,q=>{o.rotation.set(0,0,0);o.position.set(q[0],0,q[1])});inst(LIFE_GEO.busWin,LIFE_MAT.glass,buses,q=>{o.rotation.set(0,0,0);o.position.set(q[0],0,q[1])});
    if(m){const c=new THREE.Color();buses.forEach((q,i)=>{c.set(BUS_COLS[(gwHash(Math.round(q[0]*5+q[1]*11))*BUS_COLS.length)|0]);m.setColorAt(i,c)});m.instanceColor.needsUpdate=true}}
  LIFE_SPOTS.set(key,spots);g.userData.lifeCounts={lamps:lamps.length,cars:cars.length,carts:carts.length,stops:stops.length,buses:buses.length}}

/* every second: traffic amount from local density; trim surplus traffic out of sight; place vendors and waiting passengers */
const LIFE_PEOPLE=[];let lifeT=0;
function updateGeoLife(dt){lifeT-=dt;if(lifeT>0||!NAV.ready)return;lifeT=1;const P=playerP(),dens=geoDensity(P.x,P.z);
  AI_TARGET=Math.round(QS.traffic*(0.45+0.55*dens));
  const ai=vehicles.filter(v=>v.ai&&!v.keep&&!(mission&&mission.target===v)&&v!==player.vehicle);
  if(ai.length>AI_TARGET+2){let far=null,fd=120;for(const v of ai){const d=Math.hypot(v.pos.x-P.x,v.pos.z-P.z);if(d>fd){fd=d;far=v}}if(far)removeVehicle(far)}
  if(!LIFE_PEOPLE.length)for(let k=0;k<40;k++){const fem=Math.random()<0.45,sh=rpick(SHIRTS),h=makeHuman({skin:rpick(SKIN),long:fem,shirt:sh,pants:fem?sh:rpick(PANTS)});h.g.visible=false;LIFE_PEOPLE.push(h)}
  const near=[];for(const[k,list]of LIFE_SPOTS){if(!GWLD.live.has(k))continue;for(const s of list){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<260)near.push([d,s])}}near.sort((a,b)=>a[0]-b[0]);
  LIFE_PEOPLE.forEach((h,i)=>{const s=near[i]&&near[i][1];h.g.visible=!!s;if(s){h.g.position.set(s.x,0,s.z);h.g.rotation.y=s.yaw;animHuman(h,0,0,false);if(s.kind==='cart')h.armR.rotation.x=-0.6}})}
