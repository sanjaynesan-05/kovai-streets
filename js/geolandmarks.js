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
  /* Kovai Central (local frame: +x along the line, -z towards Temple Loop; the line is at z=0). From the north: forecourt with auto stand and
     parking, station building (clock tower, porch, arched windows), platform 1, loop line, island platform 2, the two main lines,
     island platform 3, loop line. Platforms are 0.9 m high and walkable; roofs on pillars; a footbridge with stairs; two trains standing. */
  station(B){const C='#efe3c2',T='#8c2d19',D='#2b3a44',cols=[],surf=[];
    gbBox(B,140,12,24,0,6,-36,C);gbBox(B,141,0.8,25,0,12.4,-36,T);gbBox(B,141,0.5,25,0,6.2,-36,T);
    for(let u=-66;u<=66;u+=6){if(Math.abs(u)<15)continue;for(const y of[3,9]){gbBox(B,2.2,3.2,0.3,u,y,-48.1,D);gb(B,GEO.cyl16,u,y+1.6,-48.1,D,Math.PI/2,0,0,1.1,0.3,1.1);gbBox(B,2.2,3.2,0.3,u,y,-23.9,D)}}
    gbBox(B,28,0.8,10,0,8.4,-53,C);gbBox(B,29,0.5,11,0,8.9,-53,T);for(let k=0;k<6;k++)gb(B,GEO.cyl8,-12.5+k*5,4,-57.5,'#f6efdc',0,0,0,0.5,8,0.5);gbBox(B,10,3.8,0.3,0,1.9,-48.2,'#3a2a1a');
    gbBox(B,10,16,10,0,20,-36,C);gbBox(B,11,0.8,11,0,28.4,-36,T);gb(B,GEO.cone4,0,31.2,-36,T,0,Math.PI/4,0,8,4,8);
    for(const s of[-1,1]){gb(B,GEO.cyl16,0,22,-36+s*5.06,'#ffffff',Math.PI/2,0,0,2.4,0.2,2.4);gbBox(B,0.22,1.7,0.12,0,22.6,-36+s*5.2,'#111');gbBox(B,1.3,0.22,0.12,0.55,22,-36+s*5.2,'#111')}
    cols.push([0,-36,140,24],[0,-53,28,10]);
    const PL=[[-19.8,8.4],[-8.1,8.4],[8.1,8.4]];
    for(const[v,w]of PL){gbBox(B,270,0.9,w,0,0.45,v,'#b8b0a2');for(const e of[-1,1])gbBox(B,270,0.03,0.35,0,0.92,v+e*(w/2-0.25),'#f2c230');surf.push([0,v,270,w,0.9]);
      gbBox(B,210,0.35,w+1.5,0,5.6,v,'#8f9aa0');for(const e of[-1,1])gbBox(B,210,0.5,0.3,0,5.4,v+e*(w/2+0.75),'#6b2d1f');
      for(let u=-100;u<=100;u+=15){gbBox(B,0.35,4.7,0.35,u,3.25,v,'#5d6166');cols.push([u,v,0.5,0.5])}
      for(let u=-90;u<=90;u+=30)gbBox(B,2.4,0.45,0.6,u+7,1.15,v,'#4a4a4a');
      for(const u of[-60,0,60])for(const e of[-1.6,1.6])gbBox(B,0.12,2.6,0.12,u+e,2.2,v,'#2b2b2b');
      gb(B,GEO.box,64,4,v,'#9a9a96',0,0,0.65,10,0.3,2.4)}                                                  // stairs up to the footbridge
    gbBox(B,3.6,0.4,48,70,7.2,-4,'#9a9a96');for(const e of[-1,1])gbBox(B,0.12,1.1,48,70+e*1.8,7.95,-4,'#5d6166');for(const v of[-27,19])gbBox(B,1,7,1,70,3.5,v,'#8a8a86');
    const train=(v,n,body,band)=>{let u=-118;gbBox(B,17,4.2,3.1,u+8.5,2.5,v,'#b23a2a');gbBox(B,17.2,0.5,3.2,u+8.5,2.2,v,'#f4f1e8');gbBox(B,0.4,1.2,2.6,u-0.1,3.5,v,'#1a2630');u+=17.8;
      for(let k=0;k<n;k++){gbBox(B,22,3.8,3.1,u+11,2.4,v,body);gbBox(B,22.1,0.9,3.16,u+11,2.95,v,'#1a2630');gbBox(B,22.1,0.25,3.16,u+11,1.9,v,band);gbBox(B,22,0.6,2.6,u+11,0.5,v,'#222');u+=22.8}
      cols.push([(u-118)/2,v,u+118,3.2])};
    train(-14,8,'#1f4e8c','#e8dcc0');train(14,6,'#7a1f1f','#e6c36a');
    gbBox(B,64,0.25,9,-90,3.6,-80,'#e9c46a');for(const u of[-120,-90,-60])for(const v of[-76,-84]){gbBox(B,0.3,3.6,0.3,u,1.8,v,'#5d6166');cols.push([u,v,0.4,0.4])}   // prepaid auto stand
    for(let u=-140;u<=140;u+=20)for(const v of[-60,-150])gbBox(B,1.6,0.5,1.6,u,0.25,v,'#7a6a5a');                                       // planters
    return{h:30,cols,surf,extra:(g,spots,W)=>{
      const main=signMesh(signTex([['கோவை சென்ட்ரல்','bold 56px "Nirmala UI",sans-serif'],['KOVAI CENTRAL','bold 64px Rajdhani,sans-serif']],'#8c2d19','#ffe08a',1024,220),26,5.6);
      main.position.set(0,12.2,-58.3);main.rotation.y=Math.PI;g.add(main);const back=main.clone();back.position.set(0,15,-23.7);back.rotation.y=0;g.add(back);
      const board=signTex([['கோவை சென்ட்ரல்','bold 44px "Nirmala UI",sans-serif'],['KOVAI CENTRAL','bold 52px Rajdhani,sans-serif']],'#f2c230','#111',512,180);
      for(const[v]of PL)for(const u of[-60,0,60]){const m=signMesh(board,3.6,1.3);m.position.set(u,3.8,v);g.add(m)}
      const auto=signMesh(signTex([['PREPAID AUTO','bold 64px Rajdhani,sans-serif']],'#1d3557','#fff',512,96),10,1.9);auto.position.set(-90,4.8,-75.4);auto.rotation.y=Math.PI;g.add(auto);
      const autos=[],cars=[],taxis=[];for(let k=0;k<22;k++)autos.push([-121+k*2.8,0,-80,Math.PI]);
      for(let k=0;k<12;k++){cars.push([20+k*3.2,0,-110,0]);(gwHash(k*7+1)<0.5?cars:taxis).push([20+k*3.2,0,-128,Math.PI])}
      parkedVehicles('auto',null,autos,g);parkedVehicles('car','#e9ecef',cars.filter((q,i)=>i%3!==1),g);parkedVehicles('hatch','#c1121f',cars.filter((q,i)=>i%3===1),g);parkedVehicles('taxi',null,taxis,g);
      for(const q of[...autos,...cars,...taxis])cols.push([q[0],q[2],q[0]>0?2:1.5,q[0]>0?4.5:2.8]);
      for(let u=-110;u<=110;u+=12)for(const[v]of PL){const[x,z]=W(u,v+1.5);spots.push({x,z,y:0.9,kind:'stop',yaw:Math.random()*6})}}}},
  stadium(B,w,d){const rx=w/2,rz=d/2,n=40,cols=[];for(let i=0;i<n;i++){if(i===0||i===n/2)continue;/* two entrances */const a=(i+0.5)/n*Math.PI*2,x=Math.cos(a)*rx*0.9,z=Math.sin(a)*rz*0.9,t=Math.atan2(Math.cos(a)*rz,-Math.sin(a)*rx);
      const L=Math.PI*(rx+rz)/n*1.08;gb(B,GEO.box,x,6,z,i%2?'#d8d2c4':'#cfc8b8',0,-t,0,L,12,16);gb(B,GEO.box,x*1.04,12.4,z*1.04,'#2a6f97',0,-t,0,L,0.8,6);cols.push([x,z,10,10])}
    for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]]){gb(B,GEO.cyl8,sx*rx*0.75,20,sz*rz*0.75,'#8d99ae',0,0,0,0.6,40,0.6);gbBox(B,6,3,1,sx*rx*0.75,40,sz*rz*0.75,'#f4f4f4')}
    return{h:14,cols}},
  /* East Junction bus terminus (local frame, north side on East Junction Road): raised passenger platform under a long roof,
     real buses parked nose-in on both sides, ticket office with the terminus sign, entrance gate. */
  terminus(B,w,d){const cols=[],surf=[];gbBox(B,150,0.3,12,-5,0.15,0,'#b8b0a2');surf.push([-5,0,150,12,0.3]);gbBox(B,150,0.35,17,-5,5.4,0,'#2a6f97');
    for(let u=-75;u<=65;u+=14)for(const e of[-1,1]){gbBox(B,0.35,5.1,0.35,u,2.85,e*5.4,'#d9d9d9');cols.push([u,e*5.4,0.5,0.5])}
    for(let u=-70;u<=60;u+=20)gbBox(B,3,0.45,0.6,u+5,0.75,0,'#4a4a4a');
    gbBox(B,14,8,40,76,4,0,'#efe6d0');gbBox(B,14.5,0.6,40.5,76,8.3,0,'#c1121f');cols.push([76,0,14,40]);
    for(const u of[-55,-25])gbBox(B,1,7,1,u,3.5,-43,'#c1121f');gbBox(B,32,1.6,1,-40,7.6,-43,'#c1121f');cols.push([-55,-43,1,1],[-25,-43,1,1]);
    return{h:9,cols,surf,extra:(g,spots,W)=>{
      const sign=signMesh(signTex([['கிழக்கு சந்திப்பு பேருந்து நிலையம்','bold 40px "Nirmala UI",sans-serif'],['EAST JUNCTION BUS TERMINUS','bold 52px Rajdhani,sans-serif']],'#c1121f','#fff',1024,200),13,2.5);
      sign.position.set(68.7,6,0);sign.rotation.y=-Math.PI/2;g.add(sign);const gate=signMesh(signTex([['EAST JUNCTION BUS STAND','bold 60px Rajdhani,sans-serif']],'#c1121f','#fff',1024,110),30,1.5);gate.position.set(-40,7.6,-43.6);gate.rotation.y=Math.PI;g.add(gate);
      const red=[],blue=[],green=[];for(let u=-72;u<=62;u+=5.2)for(const e of[-1,1]){const h=gwHash(Math.round(u*13+e*7));if(h<0.18)continue;(h<0.55?red:h<0.8?blue:green).push([u,0,e*12,e<0?0:Math.PI]);cols.push([u,e*12,2.6,10.6])}
      parkedVehicles('bus','#c1121f',red,g);parkedVehicles('bus','#1d4ed8',blue,g);parkedVehicles('bus','#2b9348',green,g);
      for(let u=-70;u<=60;u+=8)for(const e of[-1,1]){const[x,z]=W(u,e*3.5);spots.push({x,z,y:0.3,kind:'stop',yaw:e<0?Math.PI:0})}}}},
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
const LM_COLS=[];let GEO_LANDMARKS=[];   /* all landmarks, for the city map's badges and labels (hud.js) */
function buildLandmarks(list){for(const L of list){const f=LM_MODEL[L.model];if(!f)continue;const B=GB(),r=f(B,L.w,L.d,L.h||0),gy=groundH(L.x,L.z),g=new THREE.Group();
    g.position.set(L.x,gy,L.z);g.rotation.y=-(L.angle||0);const m=gbMesh(B,VCM,true);m.receiveShadow=true;g.add(m);scene.add(g);/* R2: on the ground (the viewpoint is on Silver Hill) */
    const ca=Math.cos(L.angle||0),sa=Math.sin(L.angle||0),W=(x,z)=>[L.x+x*ca-z*sa,L.z+x*sa+z*ca];
    if(r.extra){const spots=[];r.extra(g,spots,W);if(spots.length)LIFE_SPOTS.set('lm:'+L.id,spots)}
    for(const[cx,cz,w,d]of r.cols){const ring=[W(cx-w/2,cz-d/2),W(cx+w/2,cz-d/2),W(cx+w/2,cz+d/2),W(cx-w/2,cz+d/2)];ring.push(ring[0]);gwFootprintBoxes(ring,r.h+gy,LM_COLS)}
    /* walkable raised areas (platforms): a bounding box for the quick test, then the exact turned rectangle */
    for(const[cx,cz,w,d,h]of r.surf||[]){const c=[W(cx-w/2,cz-d/2),W(cx+w/2,cz-d/2),W(cx+w/2,cz+d/2),W(cx-w/2,cz+d/2)],[ox,oz]=W(cx,cz);
      SURF.push({minX:Math.min(...c.map(q=>q[0])),maxX:Math.max(...c.map(q=>q[0])),minZ:Math.min(...c.map(q=>q[1])),maxZ:Math.max(...c.map(q=>q[1])),
        h:(x,z)=>{const dx=x-ox,dz=z-oz,u=dx*ca+dz*sa,v=-dx*sa+dz*ca;return Math.abs(u)<=w/2&&Math.abs(v)<=d/2?gy+h:-1e9}})}}}

/* signs: text drawn on a canvas, shown on a plane (Tamil first, English below) */
function signTex(lines,bg,fg,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';
  lines.forEach((l,i)=>{x.font=l[1];x.fillText(l[0],w/2,h*(i+0.5)/lines.length)});const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
function signMesh(tex,w,h){return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}))}
/* real vehicle models parked as scenery: one instanced mesh per part of the model, so many vehicles cost a few draw calls ([x, y, z, heading] in the parent's frame) */
function parkedVehicles(type,color,list,parent){if(!list.length)return;const tpl=makeVehicleMesh(type,color||vehColor(type)).g;tpl.updateMatrixWorld(true);const T=new THREE.Matrix4(),m=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1),up=new THREE.Vector3(0,1,0),p=new THREE.Vector3();
  tpl.traverse(o=>{if(!o.isMesh)return;const im=new THREE.InstancedMesh(o.geometry,o.material,list.length);list.forEach(([x,y,z,h],i)=>{q.setFromAxisAngle(up,h);T.compose(p.set(x,y,z),q,one);m.multiplyMatrices(T,o.matrixWorld);im.setMatrixAt(i,m)});im.castShadow=true;parent.add(im)})}

/* ---------- trees, per chunk ---------- */
const TREE_GEO=(()=>{const g={trunk:new THREE.CylinderGeometry(0.18,0.3,1,6).translate(0,0.5,0),crown:new THREE.IcosahedronGeometry(1,0),palmT:new THREE.CylinderGeometry(0.16,0.26,1,6).translate(0,0.5,0),
  frond:new THREE.BoxGeometry(0.8,0.06,3.6).translate(0,0,1.8)};for(const k in g)g[k].userData.shared=true;return g})();
const TREE_MAT={bark:M('#6b4f36'),leaf:new THREE.MeshLambertMaterial({color:0xffffff}),frond:M('#4f8a2e')};
const TREE_GREENS=['#3f7d2c','#4b8a32','#2f6b2a','#5c9638','#3a7340','#6b9a3a'];
function gwTrees(d,g,cols){const list=(d.trees||[]).filter((t,i)=>QL!=='low'||i%2===0);if(!list.length)return;
  const broad=list.filter(t=>!t[2]),palm=list.filter(t=>t[2]),o=new THREE.Object3D(),c=new THREE.Color(),h=t=>gwHash(Math.round(t[0]*13+t[1]*7));
  if(broad.length){const tr=new THREE.InstancedMesh(TREE_GEO.trunk,TREE_MAT.bark,broad.length),cr=new THREE.InstancedMesh(TREE_GEO.crown,TREE_MAT.leaf,broad.length);
    broad.forEach((t,i)=>{const r=h(t),ht=3+r*3,rad=2.4+r*2,gy=groundH(t[0],t[1]);o.rotation.set(0,r*6,0);o.position.set(t[0],gy-0.3,t[1]);o.scale.set(1,ht+0.3,1);o.updateMatrix();tr.setMatrixAt(i,o.matrix);
      o.position.set(t[0],gy+ht+rad*0.6,t[1]);o.scale.set(rad,rad*0.85,rad);o.updateMatrix();cr.setMatrixAt(i,o.matrix);cr.setColorAt(i,c.set(TREE_GREENS[(r*TREE_GREENS.length)|0]))});
    cr.instanceColor.needsUpdate=true;for(const m of[tr,cr]){m.castShadow=true;g.add(m)}}
  if(palm.length){const tr=new THREE.InstancedMesh(TREE_GEO.palmT,TREE_MAT.bark,palm.length),fr=new THREE.InstancedMesh(TREE_GEO.frond,TREE_MAT.frond,palm.length*6);
    palm.forEach((t,i)=>{const r=h(t),ht=7+r*4,gy=groundH(t[0],t[1]);o.rotation.set(0,0,0);o.position.set(t[0],gy-0.3,t[1]);o.scale.set(1,ht+0.3,1);o.updateMatrix();tr.setMatrixAt(i,o.matrix);o.scale.set(1,1,1);
      for(let k=0;k<6;k++){o.position.set(t[0],gy+ht,t[1]);o.rotation.set(0.45,k/6*6.283+r,0);o.updateMatrix();fr.setMatrixAt(i*6+k,o.matrix)}});
    for(const m of[tr,fr]){m.castShadow=true;g.add(m)}}
  for(const t of list){const gy=groundH(t[0],t[1]);cols.push(addCollider(t[0]-0.3,t[1]-0.3,t[0]+0.3,t[1]+0.3,gy+4,gy-1))}}
