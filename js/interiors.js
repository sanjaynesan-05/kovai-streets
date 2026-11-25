/* Kovai Streets: interiors.js
 * Step R3c (REBUILD_SPEC.md, EXECUTION_PLAN.md): interiors.
 * - Level 1, walk-in places built into the city: Kovai Central's concourse and the bus terminus's waiting hall (geolandmarks.js),
 *   with live departures boards drawn here.
 * - Level 2, shops: at any ground-floor shopfront that is open, E takes you inside a shop matching its sign (mobiles, textiles,
 *   Hotel Arul, hardware, opticals) with a shopkeeper; E at the door (or walking out of it) brings you back to the same spot.
 *   Shops are a few shared rooms built away from the city, one per kind. Shutters-down shopfronts are closed.
 * - Level 3: other buildings stay closed.
 * Classic script, loaded after transport.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ---------- departures boards (Kovai Central) ---------- */
const BOARDS=[];
function departuresBoard(){const c=document.createElement('canvas');c.width=512;c.height=256;const t=new THREE.CanvasTexture(c),m=new THREE.Mesh(new THREE.PlaneGeometry(8,4),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));
  BOARDS.push({c,t});drawBoard(BOARDS[BOARDS.length-1]);return m}
function drawBoard(b){const x=b.c.getContext('2d');x.fillStyle='#0b1a2a';x.fillRect(0,0,512,256);x.fillStyle='#ffd23f';x.font='bold 30px Rajdhani,sans-serif';x.textAlign='left';x.fillText('DEPARTURES · புறப்பாடு',18,38);
  x.font='bold 24px Rajdhani,sans-serif';const st=RAILW.ready&&RAILW.stations.find(s=>s.name==='Kovai Central'),rows=[];
  if(st)for(const tr of RAILW.trains){if(tr.kind!=='pass'||tr.done.has(st.name)&&tr.dwell<=0)continue;const dest=tr.dir>0?'EAST JUNCTION HALT':'MILL ESTATE HALT',plat=tr.dir>0?3:2,
    at=tr.done.has(st.name)&&tr.dwell>0,eta=Math.max(0,((st.t-tr.dir*tr.len/2-tr.tf)*tr.dir)/Math.max(8,tr.cruise));rows.push([at?0:eta,dest,plat,at?'AT PLATFORM':Math.ceil(eta/60)+' MIN'])}
  rows.sort((a,b)=>a[0]-b[0]);if(!rows.length)rows.push([0,'NO TRAINS DUE','','']);
  rows.slice(0,4).forEach((r,i)=>{x.fillStyle=i?'#e8f1ff':'#7dffb0';x.fillText(r[1],18,86+i*42);x.fillText(r[2]?'PF '+r[2]:'',300,86+i*42);x.fillText(r[3],380,86+i*42)});b.t.needsUpdate=true}
let boardT=0;

/* ---------- shops ---------- */
/* the open shopfront signs (textures.js shopTex: slot k shows SHOPNAMES[(k*5+3)%12]; slots 1, 4 and 7 have shutters down) */
const SHOP_KIND={'SAKTHI MOBILES':'mobiles','KOVAI TEXTILES':'textiles','HOTEL ARUL':'hotel','SELVAM HARDWARES':'hardware','VELAN OPTICALS':'optical'};
const SHOP_ROOMS={},SHOP_BASE={x:8200,z:8200};let shopLight=null,shopHint=null;
/* the shopfront the player stands at: building outline edge within 2.5 m, outside it, with a shop on the ground floor */
function shopfrontAt(P){const S=GWLD.index?GWLD.index.size_m:500;let best=null;
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const d=GWLD.data.get((Math.floor(P.x/S)+di)+','+(Math.floor(P.z/S)+dj));if(!d)continue;
    for(const b of d.buildings||[]){const q=b.pts[0];if(Math.abs(q[0]-P.x)>60||Math.abs(q[1]-P.z)>60||gwCleared(b)||SHED_KIND[b.kind]||BLD_NOSHOP[b.kind])continue;const h=gwBldH(b),r1=gwHash(b.id);if(!(h>=7&&h<44&&r1<0.7))continue;
      const t=gwTri(b.pts);if(!t)continue;const c=t.c,m=c.length;let ar=0;for(let k=0;k<m;k++){const a=c[k],e=c[(k+1)%m];ar+=a.x*e.y-e.x*a.y}const sg=ar>0?1:-1,off=Math.floor(r1*8);
      for(let k=0;k<m;k++){const a=c[k],e=c[(k+1)%m],dx=e.x-a.x,dz=e.y-a.y,l=Math.hypot(dx,dz);if(l<2)continue;const nx=sg*dz/l,nz=-sg*dx/l,px=P.x-a.x,pz=P.z-a.y,f=(px*dx+pz*dz)/(l*l),out=px*nx+pz*nz;
        if(f<0.02||f>0.98||out<0||out>2.5)continue;if(best&&out>=best.out)continue;const bays=Math.max(1,Math.round(l/5)),slot=((Math.floor(off+f*bays))%8+8)%8,name=SHOPNAMES[(slot*5+3)%SHOPNAMES.length];
        best={out,name,open:slot%3!==1,x:a.x+dx*f+nx*1.6,z:a.y+dz*f+nz*1.6,yaw:Math.atan2(nx,nz)}}}}
  return best}
/* one room per kind, built the first time it is needed: 12 x 9 m, door in the front (+z) wall, counter, shelves and goods, a shopkeeper */
function shopRoom(kind,name){if(SHOP_ROOMS[kind])return SHOP_ROOMS[kind];const i=Object.keys(SHOP_ROOMS).length,x0=SHOP_BASE.x+i*60,z0=SHOP_BASE.z,B=GB(),W='#efe6d0';
  gbBox(B,12,0.1,9,0,0.05,0,'#cdbfa8');gbBox(B,12,0.2,9,0,3.7,0,'#f4efe4');gbBox(B,12,3.6,0.3,0,1.8,-4.5,W);for(const s of[-1,1]){gbBox(B,0.3,3.6,9,s*6,1.8,0,W);gbBox(B,4.8,3.6,0.3,s*3.6,1.8,4.5,W)}gbBox(B,2.4,1.2,0.3,0,3,4.5,W);
  gbBox(B,3,0.06,0.8,-2,3.58,0,'#fffbe8');gbBox(B,3,0.06,0.8,2.5,3.58,0,'#fffbe8');
  const shelf=(xx,col)=>{gbBox(B,0.5,2.6,3.2,xx,1.3,-1.5,'#6d4c41');for(let y=0.5;y<2.6;y+=0.6)for(let k=0;k<5;k++)gbBox(B,0.35,0.35,0.45,xx,y+0.2,-2.8+k*0.6,col[(k+Math.round(y*3))%col.length])};
  if(kind==='hotel'){for(const[tx,tz]of[[-3,1],[3,1],[-3,-1.8],[3,-1.8]]){gbBox(B,1.6,0.08,1,tx,0.8,tz,'#8c5a3c');gbBox(B,0.12,0.8,0.12,tx,0.4,tz,'#5d4037');for(const s of[-1,1])gbBox(B,0.5,0.5,0.5,tx+s*1.1,0.25,tz,'#c1121f')}gbBox(B,4,1.1,0.8,0,0.55,-3.4,'#8c5a3c');gbBox(B,0.6,0.7,0.6,1.2,1.45,-3.4,'#c0c0c0')}
  else{gbBox(B,6,1.05,0.8,0,0.52,-2.6,kind==='mobiles'||kind==='optical'?'#9fd3e8':'#8c5a3c');
    const col={mobiles:['#111','#333','#1d4ed8','#c1121f'],textiles:['#e63946','#ffb703','#06d6a0','#9b5de5','#f1faee','#fb8500'],hardware:['#5d6166','#9a9a9a','#f77f00','#3a5a40'],optical:['#222','#c0c0c0','#8ecae6']}[kind];
    shelf(-5.5,col);shelf(5.5,col);for(let k=0;k<6;k++)gbBox(B,1,0.8,0.3,-2.5+k,2.4,-4.3,col[k%col.length])}
  const mesh=gbMesh(B,VCM,false);mesh.position.set(x0,0,z0);scene.add(mesh);
  const tex=signTex([[name,'bold 56px Rajdhani,sans-serif']],'#1d3557','#fff',512,96),sg=signMesh(tex,5,0.95);sg.position.set(x0,3.1,z0-4.3);scene.add(sg);
  const keeper=makeHuman({shirt:rpick(SHIRTS),pants:'#2b2d42',skin:rpick(SKIN)});keeper.g.position.set(x0,0,z0+(kind==='hotel'?-4:-3.4));scene.add(keeper.g);
  for(const[cx,cz,w,d]of[[0,-4.5,12,0.3],[-6,0,0.3,9],[6,0,0.3,9],[-3.6,4.5,4.8,0.3],[3.6,4.5,4.8,0.3],kind==='hotel'?[0,-3.4,4,0.8]:[0,-2.6,6,0.8],[-5.5,-1.5,0.5,3.2],[5.5,-1.5,0.5,3.2]])addCollider(x0+cx-w/2,z0+cz-d/2,x0+cx+w/2,z0+cz+d/2,3.6);
  return SHOP_ROOMS[kind]={x:x0,z:z0,kind,name,keeper}}
function enterShop(sf){const kind=SHOP_KIND[sf.name],room=shopRoom(kind,sf.name);player.inShop={room,ret:sf};player.pos.set(room.x,0.05,room.z+3.2);player.vy=0;camYaw=Math.PI;
  if(!shopLight){shopLight=new THREE.PointLight(0xfff1d6,1.2,18);scene.add(shopLight)}shopLight.position.set(room.x,3.2,room.z);shopLight.visible=true;
  floatMsg(kind==='hotel'?'Vanakkam! Hotel Arul · E at the counter: meals ₹40':'Vanakkam! Welcome to '+sf.name)}
function leaveShop(){const s=player.inShop;if(!s)return;player.inShop=null;player.pos.set(s.ret.x,surfaceH(s.ret.x,s.ret.z,5)+0.05,s.ret.z);player.vy=0;camYaw=s.ret.yaw;if(shopLight)shopLight.visible=false}
/* E: leave by the door, eat at Hotel Arul's counter, or go into the shop you stand at (not while wanted, in a vehicle or on a train) */
function shopEnterExit(){const s=player.inShop;if(s){const lz=player.pos.z-s.room.z,lx=player.pos.x-s.room.x;
    if(lz>2.6&&Math.abs(lx)<2){leaveShop();return true}
    if(s.room.kind==='hotel'&&lz<-1.8&&Math.abs(lx)<2.5){if(player.cash<40){floatMsg('A meal is ₹40');return true}player.cash-=40;player.hp=100;floatMsg('A full meals plate. Health restored.');return true}
    return false}
  if(player.vehicle||player.onTrain||player.dead)return false;const sf=shopfrontAt(player.pos);if(!sf)return false;
  const v=nearestVehicle();if(v&&Math.hypot(v.pos.x-player.pos.x,v.pos.z-player.pos.z)<3.5)return false;
  if(!sf.open){floatMsg(sf.name+' is closed');return true}if(wanted>0){floatMsg('Lose the cops first');return true}enterShop(sf);return true}

let intT=0;
function updateInteriors(dt){boardT-=dt;if(boardT<=0){boardT=2;for(const b of BOARDS)drawBoard(b)}
  const s=player.inShop;if(s){if(player.pos.z-s.room.z>4.9||player.vehicle||player.dead)leaveShop();else if(s.room.keeper)animHuman(s.room.keeper,0,0,false);return}
  intT-=dt;if(intT>0||player.vehicle||player.onTrain)return;intT=0.5;const sf=shopfrontAt(player.pos),key=sf&&sf.name+Math.round(sf.x)+','+Math.round(sf.z);
  if(sf&&key!==shopHint){shopHint=key;floatMsg(sf.open?'E · go into '+sf.name:sf.name+' (closed)')}else if(!sf)shopHint=null}
