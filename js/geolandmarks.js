/* Kovai Streets: geolandmarks.js
 * Step R1 (REBUILD_SPEC.md): the designed city's landmarks and trees.
 * - Landmarks with a "model" in geodata/processed/kovai/landmarks.json: temple gopuram, church, mosque, Kovai Central station,
 *   cricket stadium, Silver Hill viewpoint, mill chimneys, petrol bunks and Town Hall. Each is one merged, vertex-coloured mesh
 *   in its own local frame (local +x along its "angle"), with box colliders for the parts you can bump into.
 * - Trees: each map chunk's "trees" ([x, z, kind]: 0 broadleaf, 1 palm) as instanced meshes, built and freed with the chunk.
 * Classic script, loaded after geoworld.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

/* each builder draws into B (local metres, y up) and returns { h: height for colliders, cols: [[cx, cz, w, d], ...] local boxes } */
const LM_MODEL={
  gopuram(B,w,d){for(const s of[-1,1]){gbBox(B,w,1.6,0.6,0,0.8,s*d/2,'#e8dcc0');gbBox(B,0.6,1.6,d,s*w/2,0.8,0,'#e8dcc0')}   // compound wall
    gbBox(B,w*0.5,7,d*0.45,0,3.5,d*0.12,'#e9d9b0');gbBox(B,w*0.5+1,0.6,d*0.45+1,0,7.3,d*0.12,'#c98b4e');                   // hall
    let tw=w*0.55,td=12,y=0;for(let i=0;i<8;i++){const h=i?4.6:7;gbBox(B,tw,h,td,0,y+h/2,-d*0.32,i%2?'#d9a066':'#c4733d');gbBox(B,tw+0.6,0.5,td+0.6,0,y+h,-d*0.32,'#f2e3c0');y+=h;tw*=0.86;td*=0.9}
    gb(B,GEO.cyl16,0,y+1.6,-d*0.32,'#d4a017',0,0,Math.PI/2,2.2,tw+2,2.2);for(let k=-2;k<=2;k++)gb(B,GEO.cone8,k*tw/5,y+4.2,-d*0.32,'#e0b040',0,0,0,0.5,1.6,0.5);
    return{h:y+4,cols:[[0,-d*0.32,w*0.55,12],[0,d*0.12,w*0.5,d*0.45],[0,-d/2,w,1],[0,d/2,w,1],[-w/2,0,1,d],[w/2,0,1,d]]}},
  church(B,w,d){gbBox(B,w,12,d*0.8,0,6,d*0.1,'#f1ece0');gb(B,GEO.cone4,0,15.5,d*0.1,'#8c3b2e',0,Math.PI/4,0,w*0.72,7,d*0.57);
    gbBox(B,8,26,8,0,13,-d*0.38,'#f4f0e6');gb(B,GEO.cone8,0,32,-d*0.38,'#7a3326',0,0,0,4.6,12,4.6);gbBox(B,0.5,3,0.5,0,39,-d*0.38,'#e8c547');gbBox(B,2,0.5,0.5,0,39.6,-d*0.38,'#e8c547');
    return{h:40,cols:[[0,d*0.1,w,d*0.8],[0,-d*0.38,8,8]]}},
  mosque(B,w,d){gbBox(B,w*0.75,10,d*0.7,0,5,0,'#f4f1e8');gb(B,GEO.cyl8,0,10.7,0,'#f4f1e8',0,0,0,w*0.25,1.5,w*0.25);gb(B,GEO.sph16,0,11.4,0,'#3f8f5f',0,0,0,w*0.24,w*0.24,w*0.24);
    for(const s of[-1,1]){gb(B,GEO.cyl8,s*w*0.45,14,d*0.4,'#f4f1e8',0,0,0,1.3,28,1.3);gb(B,GEO.sph16,s*w*0.45,28.8,d*0.4,'#3f8f5f',0,0,0,1.6,1.6,1.6);gb(B,GEO.cone8,s*w*0.45,31,d*0.4,'#e0b040',0,0,0,0.4,2,0.4)}
    return{h:31,cols:[[0,0,w*0.75,d*0.7],[-w*0.45,d*0.4,3,3],[w*0.45,d*0.4,3,3]]}},
  /* station building north of the line; a platform roof over both tracks (local +z is towards the line) on pillars, open underneath */
  station(B,w,d){gbBox(B,60,10,d,0,5,0,'#efe0b8');gbBox(B,62,1,d+2,0,10.5,0,'#b23a2a');gbBox(B,14,15,d*0.8,0,7.5,0,'#f4ead0');gbBox(B,15,1.2,d*0.8+1,0,15.6,0,'#b23a2a');
    gbBox(B,w,0.9,4,0,0.45,d/2+6,'#b8b0a2');gbBox(B,w,0.9,4,0,0.45,d/2+43,'#b8b0a2');                                       // platforms
    for(let x=-w/2+6;x<w/2;x+=16)for(const z of[d/2+6,d/2+43])gbBox(B,0.5,6,0.5,x,3,z,'#6b6b6b');gbBox(B,w,0.5,41,0,6.2,d/2+24.5,'#8f9aa0');
    return{h:16,cols:[[0,0,60,d]]}},
  stadium(B,w,d){const rx=w/2,rz=d/2,n=40,cols=[];for(let i=0;i<n;i++){if(i===0||i===n/2)continue;/* two entrances */const a=(i+0.5)/n*Math.PI*2,x=Math.cos(a)*rx*0.9,z=Math.sin(a)*rz*0.9,t=Math.atan2(Math.cos(a)*rz,-Math.sin(a)*rx);
      const L=Math.PI*(rx+rz)/n*1.08;gb(B,GEO.box,x,6,z,i%2?'#d8d2c4':'#cfc8b8',0,-t,0,L,12,16);gb(B,GEO.box,x*1.04,12.4,z*1.04,'#2a6f97',0,-t,0,L,0.8,6);cols.push([x,z,10,10])}
    for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]]){gb(B,GEO.cyl8,sx*rx*0.75,20,sz*rz*0.75,'#8d99ae',0,0,0,0.6,40,0.6);gbBox(B,6,3,1,sx*rx*0.75,40,sz*rz*0.75,'#f4f4f4')}
    return{h:14,cols}},
  viewpoint(B,w,d){gbBox(B,w,1.2,d,0,0.6,0,'#a99f8f');for(const sx of[-1,1])for(const sz of[-1,1])gbBox(B,0.4,4,0.4,sx*5,3.2,sz*5,'#7a5c3e');gbBox(B,12,0.6,12,0,5.4,0,'#8c3b2e');
    gb(B,GEO.cone4,0,6.8,0,'#8c3b2e',0,Math.PI/4,0,8.5,2.4,8.5);for(const s of[-1,1]){gbBox(B,w,1,0.2,0,1.7,s*d/2,'#5d6166');gbBox(B,0.2,1,d,s*w/2,1.7,0,'#5d6166')}
    return{h:4,cols:[[-5,-5,0.6,0.6],[5,-5,0.6,0.6],[-5,5,0.6,0.6],[5,5,0.6,0.6]]}},
  chimney(B,w,d,h){gb(B,GEO.cyl16,0,h/2,0,'#9c4a33',0,0,0,2.4,h,2.4);gb(B,GEO.cyl16,0,h-3,0,'#eeeeee',0,0,0,2.45,1.4,2.45);gb(B,GEO.cyl16,0,h-6,0,'#eeeeee',0,0,0,2.45,1,2.45);gbBox(B,7,2,7,0,1,0,'#7a6a5a');
    return{h,cols:[[0,0,7,7]]}},
  /* petrol bunk: canopy you drive under, pumps, kiosk and price sign */
  fuel(B,w,d){gbBox(B,w,0.6,d*0.8,0,5.6,0,'#f4f4f4');gbBox(B,w+0.2,0.9,d*0.8+0.2,0,5,0,'#e63946');for(const sx of[-1,1])for(const sz of[-1,1])gbBox(B,0.5,5,0.5,sx*w*0.35,2.5,sz*d*0.25,'#dcdcdc');
    for(const sx of[-0.18,0.18])gbBox(B,1.2,1.8,0.8,sx*w,0.9,0,'#2a6f97');gbBox(B,8,3.2,5,w*0.42,1.6,d*0.42,'#efe6d0');gbBox(B,1,6,1,-w*0.5-3,3,-d*0.45,'#e63946');
    return{h:5,cols:[[-w*0.35,-d*0.25,0.6,0.6],[w*0.35,-d*0.25,0.6,0.6],[-w*0.35,d*0.25,0.6,0.6],[w*0.35,d*0.25,0.6,0.6],[-w*0.18,0,1.3,0.9],[w*0.18,0,1.3,0.9],[w*0.42,d*0.42,8,5]]}},
  townhall(B,w,d){gbBox(B,w,13,d,0,6.5,0,'#efe2c4');gbBox(B,w+1,1,d+1,0,13.5,0,'#c9b48c');for(let k=0;k<8;k++)gb(B,GEO.cyl8,-w*0.4+k*w*0.8/7,5,d/2+1.5,'#f6efdc',0,0,0,0.6,10,0.6);
    gbBox(B,w*0.9,1,3.5,0,10.5,d/2+1.5,'#e8dab8');gbBox(B,7,8,7,0,17,0,'#efe2c4');gb(B,GEO.sph16,0,21,0,'#c9b48c',0,0,0,4,4,4);gb(B,GEO.cyl16,0,17.5,3.55,'#ffffff',Math.PI/2,0,0,2,0.2,2);
    return{h:25,cols:[[0,0,w,d]]}}};

/* place every landmark once (they are few); colliders stay for the whole game */
const LM_COLS=[];
function buildLandmarks(list){for(const L of list){const f=LM_MODEL[L.model];if(!f)continue;const B=GB(),r=f(B,L.w,L.d,L.h||0),m=gbMesh(B,VCM,true);
    m.position.set(L.x,0,L.z);m.rotation.y=-(L.angle||0);m.receiveShadow=true;scene.add(m);
    const ca=Math.cos(L.angle||0),sa=Math.sin(L.angle||0),W=(x,z)=>[L.x+x*ca-z*sa,L.z+x*sa+z*ca];
    for(const[cx,cz,w,d]of r.cols){const ring=[W(cx-w/2,cz-d/2),W(cx+w/2,cz-d/2),W(cx+w/2,cz+d/2),W(cx-w/2,cz+d/2)];ring.push(ring[0]);gwFootprintBoxes(ring,r.h,LM_COLS)}}}

/* ---------- trees, per chunk ---------- */
const TREE_GEO=(()=>{const g={trunk:new THREE.CylinderGeometry(0.18,0.3,1,6).translate(0,0.5,0),crown:new THREE.IcosahedronGeometry(1,0),palmT:new THREE.CylinderGeometry(0.16,0.26,1,6).translate(0,0.5,0),
  frond:new THREE.BoxGeometry(0.8,0.06,3.6).translate(0,0,1.8)};for(const k in g)g[k].userData.shared=true;return g})();
const TREE_MAT={bark:M('#6b4f36'),leaf:new THREE.MeshLambertMaterial({color:0xffffff}),frond:M('#4f8a2e')};
const TREE_GREENS=['#3f7d2c','#4b8a32','#2f6b2a','#5c9638','#3a7340','#6b9a3a'];
function gwTrees(d,g,cols){const list=(d.trees||[]).filter((t,i)=>QL!=='low'||i%2===0);if(!list.length)return;
  const broad=list.filter(t=>!t[2]),palm=list.filter(t=>t[2]),o=new THREE.Object3D(),c=new THREE.Color(),h=t=>gwHash(Math.round(t[0]*13+t[1]*7));
  if(broad.length){const tr=new THREE.InstancedMesh(TREE_GEO.trunk,TREE_MAT.bark,broad.length),cr=new THREE.InstancedMesh(TREE_GEO.crown,TREE_MAT.leaf,broad.length);
    broad.forEach((t,i)=>{const r=h(t),ht=3+r*3,rad=2.4+r*2;o.rotation.set(0,r*6,0);o.position.set(t[0],0,t[1]);o.scale.set(1,ht,1);o.updateMatrix();tr.setMatrixAt(i,o.matrix);
      o.position.set(t[0],ht+rad*0.6,t[1]);o.scale.set(rad,rad*0.85,rad);o.updateMatrix();cr.setMatrixAt(i,o.matrix);cr.setColorAt(i,c.set(TREE_GREENS[(r*TREE_GREENS.length)|0]))});
    cr.instanceColor.needsUpdate=true;for(const m of[tr,cr]){m.castShadow=true;g.add(m)}}
  if(palm.length){const tr=new THREE.InstancedMesh(TREE_GEO.palmT,TREE_MAT.bark,palm.length),fr=new THREE.InstancedMesh(TREE_GEO.frond,TREE_MAT.frond,palm.length*6);
    palm.forEach((t,i)=>{const r=h(t),ht=7+r*4;o.rotation.set(0,0,0);o.position.set(t[0],0,t[1]);o.scale.set(1,ht,1);o.updateMatrix();tr.setMatrixAt(i,o.matrix);o.scale.set(1,1,1);
      for(let k=0;k<6;k++){o.position.set(t[0],ht,t[1]);o.rotation.set(0.45,k/6*6.283+r,0);o.updateMatrix();fr.setMatrixAt(i*6+k,o.matrix)}});
    for(const m of[tr,fr]){m.castShadow=true;g.add(m)}}
  for(const t of list)cols.push(addCollider(t[0]-0.3,t[1]-0.3,t[0]+0.3,t[1]+0.3,4))}
