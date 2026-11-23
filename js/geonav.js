/* Kovai Streets: geonav.js
 * Step G4: road graph, traffic, traffic signals and pedestrians on the real map.
 * Data: geodata/processed/pilot/graph_pilot.json (directed edges, so one-way streets are respected; flyovers never join the road below)
 * and roads.json (edge shapes and road classes). Traffic reuses the grid AI in vehicles.js (updAI: steering, braking for cars ahead,
 * unsticking, respawning); only the waypoints (geoAINext) and red lights (geoRed) come from here. Keeps to the left, like Indian roads.
 * Pedestrians walk the sidewalks of ordinary roads (not flyovers), turning at junctions. Footways are not used yet.
 * Classic script, loaded after geoworld.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const NAV={ready:false,E:[],OUT:[],IN:[],PADJ:[],CELL:new Map(),SIG:new Map(),REV:new Map()};
const NAV_C=100;                                             // spawn index cell size (m)
const NAV_W={trunk:3,primary:3,secondary:2.5,tertiary:2,trunk_link:1.5,primary_link:1.5,secondary_link:1.2,tertiary_link:1,unclassified:1,residential:0.8,living_street:0.4,service:0.1,track:0.05};
const NAV_V={trunk:1.15,primary:1.05,secondary:1,tertiary:0.9,unclassified:0.75,residential:0.65,living_street:0.45,service:0.4,track:0.35};   // cruise speed factor by road class
const SIG_CYCLE=18;                                          // seconds per signal phase (east-west, then north-south)

function initGeoNav(){Promise.all(['graph_pilot','roads','pois'].map(n=>fetch('geodata/processed/pilot/'+n+'.json',{cache:'no-cache'}).then(r=>r.json()))).then(([g,rd,pois])=>{GEO_POIS=pois.pois.filter(p=>POI_ICON[p.kind]);
  const roads=rd.roads,E=NAV.E;for(let i=0;i<g.nodes.length;i++){NAV.OUT.push([]);NAV.IN.push([]);NAV.PADJ.push([])}
  g.edges.forEach(([f,t,len,ri,a,b],k)=>{const r=roads[ri],n0=g.nodes[f];let pts=r.pts.slice(a,b+1);if(Math.hypot(pts[0][0]-n0[0],pts[0][1]-n0[1])>0.5)pts=pts.slice().reverse();
    const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    E.push({f,t,pts,cum,len:cum[cum.length-1],w:r.width,cls:r.cls,two:!r.oneway,layer:r.layer,bridge:r.bridge,ri,a,b});NAV.OUT[f].push(k);NAV.IN[t].push(k);
    const key=ri+':'+a+':'+b;if(NAV.REV.has(key)){const o=NAV.REV.get(key);E[o].rev=k;E[k].rev=o}else NAV.REV.set(key,k);
    if(!r.bridge&&!r.layer&&r.cls!=='trunk_link'&&r.cls!=='primary_link'){NAV.PADJ[f].push({e:k,rev:false});NAV.PADJ[t].push({e:k,rev:true})}
    const ck=Math.floor(n0[0]/NAV_C)+','+Math.floor(n0[1]/NAV_C);let l=NAV.CELL.get(ck);if(!l){l=[];NAV.CELL.set(ck,l)}l.push(k)});
  for(const s of rd.signals){let best=-1,bd=25;const l=[];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const k of NAV.CELL.get((Math.floor(s[0]/NAV_C)+i)+','+(Math.floor(s[1]/NAV_C)+j))||[])l.push(E[k].f);
    for(const n of l){const d=Math.hypot(g.nodes[n][0]-s[0],g.nodes[n][1]-s[1]);if(d<bd){bd=d;best=n}}if(best>=0&&!NAV.SIG.has(best))NAV.SIG.set(best,{x:g.nodes[best][0],z:g.nodes[best][1],off:gwHash(best)*SIG_CYCLE*2,m:null})}
  NAV.nodes=g.nodes;{const N=g.nodes.length,comp=NAV.comp=new Int32Array(N).fill(-1),size=[];for(let s=0;s<N;s++){if(comp[s]>=0)continue;let n=0;const st=[s];comp[s]=size.length;
    while(st.length){const u=st.pop();n++;for(const k of NAV.OUT[u].concat(NAV.IN[u])){const e=E[k];for(const v of[e.f,e.t])if(comp[v]<0){comp[v]=size.length;st.push(v)}}}size.push(n)}NAV.mainC=size.indexOf(Math.max(...size))}   /* connected pieces; GPS snaps to the main one */
  NAV.ready=true;initGeoSites();/* G6: mission sites, gangs, reels, ramps */
  for(let n=0;n<AI_TARGET;n++)spawnAI(aiType(),25);for(let n=0;n<QS.peds;n++)spawnPed()}).catch(e=>console.error('road graph',e))}

/* edges whose start lies within r metres of (x, z) */
function navNear(x,z,r){const out=[],c0=Math.floor((x-r)/NAV_C),c1=Math.floor((x+r)/NAV_C),d0=Math.floor((z-r)/NAV_C),d1=Math.floor((z+r)/NAV_C);
  for(let i=c0;i<=c1;i++)for(let j=d0;j<=d1;j++)for(const k of NAV.CELL.get(i+','+j)||[])out.push(k);return out}
function navLane(e,two){const w=e.w;return e.two?clamp(w/4,1.4,4.5)+(two?0.8:0):clamp(w*0.15,0,2)+(two?0.6:0)}
/* waypoints along an edge, offset to the left lane */
function navWps(e,lane,from){const p=e.pts,out=[];for(let k=from;k<p.length;k++){const a=p[Math.max(0,k-1)],b=p[Math.min(p.length-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
  out.push({x:p[k][0]+dz/l*lane,z:p[k][1]-dx/l*lane})}return out}
function navDir(e,end){const p=e.pts,n=p.length,a=end?p[n-2]:p[0],b=end?p[n-1]:p[1];return Math.atan2(b[0]-a[0],b[1]-a[1])}

/* ---------- traffic ---------- */
function geoSpawnAI(type,minDist){if(!NAV.ready)return null;const P=playerP(),cand=navNear(P.x,P.z,380);
  for(let t=0;t<60&&cand.length;t++){const k=cand[(Math.random()*cand.length)|0],e=NAV.E[k],n=NAV.nodes[e.f],d=Math.hypot(n[0]-P.x,n[1]-P.z);
    if(d<minDist||d>380||Math.random()>(NAV_W[e.cls]||0.5)/3||e.len<12)continue;
    type=geoMix(type,e);/* D7: local vehicle mix (geolife.js) */const two=!!(VT[type]&&VT[type].two),lane=navLane(e,two),w=navWps(e,lane,0);if(vehicles.some(v=>Math.abs(v.pos.x-w[0].x)<8&&Math.abs(v.pos.z-w[0].z)<8))continue;
    const v=spawnVehicle(type,w[0].x,w[0].z,navDir(e,false)),cr=CRUISE[type]||[9,11],base=RR(cr[0],cr[1]);
    v.ai={geo:true,e:k,lane,two,base,cruise:base*(NAV_V[e.cls]||0.7),wps:w.slice(1),turnWp:null,blockT:0,stuck:0,hitT:0,i:0,j:0,dx:0,dz:0};v.speed=v.ai.cruise*0.6;v.vx=Math.sin(v.heading)*v.speed;v.vz=Math.cos(v.heading)*v.speed;
    if(v.s.two)addRider(v);return v}
  return null}
/* next edge at a junction: straighter and bigger roads are more likely; no U-turns unless it is a dead end */
function geoAINext(v){const a=v.ai,cur=NAV.E[a.e],h0=navDir(cur,true);const opts=[];
  for(const k of NAV.OUT[cur.t]){if(k===cur.rev)continue;const e=NAV.E[k];let turn=Math.abs(angDiff(h0,navDir(e,false)));if(turn>2.6)continue;
    opts.push([k,(NAV_W[e.cls]||0.5)*(0.25+Math.cos(turn/2)**4)])}
  if(a.flee&&opts.length){const P=playerP();let best=-1e9,bo=null;for(const o of opts){const n=NAV.nodes[NAV.E[o[0]].t],d=Math.hypot(n[0]-P.x,n[1]-P.z)+Math.random()*60;if(d>best){best=d;bo=o}}if(bo)bo[1]=1e6}/* runaways pick the road leading away from the player */
  let k=null;if(!opts.length){if(cur.rev!=null)k=cur.rev;else{a.stuck=99;a.wps=[{x:v.pos.x,z:v.pos.z}];return}}
  else{let tot=0;for(const o of opts)tot+=o[1];let r=Math.random()*tot;k=opts[opts.length-1][0];for(const o of opts){r-=o[1];if(r<=0){k=o[0];break}}}
  const e=NAV.E[k],turn=Math.abs(angDiff(h0,navDir(e,false)));a.e=k;a.lane=navLane(e,a.two);a.cruise=a.base*(NAV_V[e.cls]||0.7);a.wps=navWps(e,a.lane,1);a.turnWp=turn>0.6?a.wps[0]:null}
/* red light ahead: east-west and north-south approaches take turns */
function sigRed(node,heading){const s=NAV.SIG.get(node);if(!s)return false;const ew=Math.abs(Math.sin(heading))>Math.abs(Math.cos(heading));return((Math.floor((time+s.off)/SIG_CYCLE)%2)===0)!==ew}
function geoRed(v){const a=v.ai,e=NAV.E[a.e];if(!e||!NAV.SIG.has(e.t))return false;const p=e.pts[e.pts.length-1],d=Math.hypot(p[0]-v.pos.x,p[1]-v.pos.z);return d<18&&d>6&&sigRed(e.t,navDir(e,true))}
/* signal heads: a pole with two lamps (east-west and north-south), coloured every few frames; built for signals near the player */
let sigT=0;
function updateGeoSignals(dt){if(!NAV.ready)return;sigT-=dt;if(sigT>0)return;sigT=0.25;const P=playerP();
  for(const[n,s]of NAV.SIG){const near=Math.abs(s.x-P.x)<500&&Math.abs(s.z-P.z)<500;
    if(near&&!s.m){const g=new THREE.Group(),pole=new THREE.Mesh(GEO.cyl,M('#3a3a3a'));pole.scale.set(0.12,5,0.12);pole.position.y=2.5;g.add(pole);
      s.lamps=[0,1].map(k=>{const m=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:0xff2222}));m.scale.set(k?0.35:0.9,0.35,k?0.9:0.35);m.position.y=5.1+k*0.45;g.add(m);return m});
      g.position.set(s.x+6,0,s.z+6);scene.add(g);s.m=g}
    else if(!near&&s.m){scene.remove(s.m);s.lamps.forEach(m=>m.material.dispose());s.m=null}
    if(s.m){s.lamps[0].material.color.setHex(sigRed(n,Math.PI/2)?0xff2222:0x22dd55);s.lamps[1].material.color.setHex(sigRed(n,0)?0xff2222:0x22dd55)}}}

/* ---------- pedestrians: sidewalks of ordinary roads ---------- */
function geoPlacePed(p,minD){const P=playerP();let cand=navNear(P.x,P.z,300).filter(k=>NAV.PADJ[NAV.E[k].f].some(o=>o.e===k));
  for(let t=0;t<40&&cand.length;t++){const k=cand[(Math.random()*cand.length)|0],e=NAV.E[k],n=NAV.nodes[e.f];if(minD&&Math.hypot(n[0]-P.x,n[1]-P.z)<minD)continue;
    if(t<30&&Math.random()>geoDensity(n[0],n[1])*(LIFE_MAIN[e.cls]?1:0.6))continue;/* D7: more people in busy areas and on main roads */
    p.ge=k;p.rev=Math.random()<0.5;p.s=RR(0,e.len);p.side=Math.random()<0.5?1:-1;p.dir=1;return}
  p.ge=null}
function geoPedPos(p){if(p.ge==null||!NAV.ready)return[p.x||0,p.z||0];let e=NAV.E[p.ge];
  if(p.dir<0){p.rev=!p.rev;p.s=e.len-Math.max(0,p.s);p.dir=1;p.cl=0}   /* turning round = walking the same edge the other way (the side is measured against the edge, so it stays) */
  for(let g=0;g<4&&p.s>e.len;g++){const node=p.rev?e.f:e.t,opts=NAV.PADJ[node].filter(o=>o.e!==p.ge&&o.e!==e.rev),o=opts.length?rpick(opts):{e:p.ge,rev:!p.rev};
    const was=pedAt(e,p.rev?0:e.len,p.side,p.off);p.s-=e.len;p.ge=o.e;p.rev=o.rev;e=NAV.E[p.ge];
    const at=p.rev?e.len:0,A=pedAt(e,at,1,p.off),B=pedAt(e,at,-1,p.off);p.side=Math.hypot(A[0]-was[0],A[1]-was[1])<=Math.hypot(B[0]-was[0],B[1]-was[1])?1:-1;   /* stay on the nearer sidewalk */
    const st=pedAt(e,at,p.side,p.off);p.cw=was;p.cn=st;p.cl=Math.hypot(st[0]-was[0],st[1]-was[1]);p.s-=p.cl}   /* then walk round the corner to it (negative s = on the corner path) */
  if(p.s<0&&p.cl>0){const t=clamp(1+p.s/p.cl,0,1);return[p.cw[0]+(p.cn[0]-p.cw[0])*t,p.cw[1]+(p.cn[1]-p.cw[1])*t]}
  return pedAt(e,p.rev?e.len-Math.max(0,p.s):Math.max(0,p.s),p.side,p.off)}
/* point on an edge's sidewalk, s metres from the edge's first point, side +1/-1 relative to the edge's own direction */
function pedAt(e,s,side,off){const c=e.cum,pts=e.pts;let k=1;while(k<c.length-1&&c[k]<s)k++;const t=clamp((s-c[k-1])/((c[k]-c[k-1])||1),0,1),a=pts[k-1],b=pts[k],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,o=(e.w/2+2.8+(off||0)*0.3)*side;/* D7: clear of parked cars and lamp posts */
  return[a[0]+dx*t+dz/l*o,a[1]+dz*t-dx/l*o]}

/* ---------- step G5: route finding, GPS, police on real roads, map icons ---------- */
/* nearest graph node to (x, z), or -1 */
function navNearestNode(x,z,main){for(const r of[60,160,420,1200]){let best=-1,bd=1e18;for(const k of navNear(x,z,r)){const e=NAV.E[k];for(const n of[e.f,e.t]){if(main&&NAV.comp[n]!==NAV.mainC)continue;const q=NAV.nodes[n],d=(q[0]-x)**2+(q[1]-z)**2;if(d<bd){bd=d;best=n}}}if(best>=0)return best}return-1}
/* A* along the road graph. oneway=true follows one-way rules (driving); false allows both directions (on foot, police).
   Returns {pts:[[x,z],...], len} from (ax,az) to (bx,bz), or null. */
function navRoute(ax,az,bx,bz,oneway){if(!NAV.ready)return null;let s=navNearestNode(ax,az),g=navNearestNode(bx,bz);if(s<0||g<0)return null;
  if(NAV.comp[s]!==NAV.comp[g]){s=navNearestNode(ax,az,true);g=navNearestNode(bx,bz,true);if(s<0||g<0)return null}   /* different pieces: use the main road network at both ends */
  const N=NAV.nodes.length,gs=NAV.gs||(NAV.gs=new Float64Array(N)),came=NAV.came||(NAV.came=new Int32Array(N)),cameR=NAV.cameR||(NAV.cameR=new Uint8Array(N)),seen=NAV.seen||(NAV.seen=new Uint32Array(N));
  const run=NAV.run=(NAV.run||0)+1,G=NAV.nodes[g],h=n=>Math.hypot(NAV.nodes[n][0]-G[0],NAV.nodes[n][1]-G[1]);const heap=[[h(s),s]];seen[s]=run;gs[s]=0;came[s]=-1;
  const push=it=>{heap.push(it);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=it[0])break;heap[i]=heap[p];i=p}heap[i]=it};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;for(;;){let c=2*i+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1][0]<heap[c][0])c++;if(heap[c][0]>=last[0])break;heap[i]=heap[c];i=c}heap[i]=last}return top};
  let found=false,it=0;while(heap.length&&it++<60000){const[f,n]=pop();if(n===g){found=true;break}if(f-h(n)>gs[n]+1e-6)continue;
    const relax=(k,rev)=>{const e=NAV.E[k],m=rev?e.f:e.t,c=gs[n]+e.len;if(seen[m]!==run||c<gs[m]){seen[m]=run;gs[m]=c;came[m]=k;cameR[m]=rev?1:0;push([c+h(m),m])}};
    for(const k of NAV.OUT[n])relax(k,false);if(!oneway)for(const k of NAV.IN[n])if(NAV.E[k].rev==null)relax(k,true)}
  if(!found)return null;const edges=[];for(let n=g;came[n]>=0&&edges.length<5000&&n!==s;){const k=came[n];edges.push([k,cameR[n]]);n=cameR[n]?NAV.E[k].t:NAV.E[k].f}edges.reverse();
  const pts=[[ax,az]];for(const[k,rev]of edges){const p=NAV.E[k].pts;for(const q of(rev?p.slice().reverse():p))pts.push(q)}pts.push([bx,bz]);
  let len=0;for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return{pts,len}}

/* GPS: destination clicked on the big map (M), or the mission marker. Re-routes when you leave the route. */
const GPS={manual:null,route:null,dest:null,t:0,len:0};
function gpsDest(){return GPS.manual||(mission&&marker.visible?{x:marker.position.x,z:marker.position.z}:null)}
function updateGPS(dt){if(!NAV.ready)return;const D=gpsDest(),P=playerP();if(!D){GPS.route=null;return}
  if(GPS.manual&&Math.hypot(D.x-P.x,D.z-P.z)<25){GPS.manual=null;GPS.route=null;toast('ARRIVED','GPS destination reached',2.5);return}
  GPS.t-=dt;let off=1e9,cut=0;if(GPS.route){const p=GPS.route.pts;for(let i=1;i<p.length;i++){const d=segDist(P.x,P.z,p[i-1],p[i]);if(d<off){off=d;cut=i-1}}}
  const moved=!GPS.dest||Math.hypot(GPS.dest.x-D.x,GPS.dest.z-D.z)>20;
  if(moved||(GPS.t<=0&&off>30)){GPS.t=1.5;GPS.dest={x:D.x,z:D.z};GPS.route=navRoute(P.x,P.z,D.x,D.z,!!player.vehicle)||navRoute(P.x,P.z,D.x,D.z,false)}/* one-way rules can make a place unreachable from here: then show a route ignoring them */
  else if(GPS.route&&cut>0){GPS.route.pts.splice(0,cut);GPS.route.pts[0]=[P.x,P.z]}
  if(GPS.route){const p=GPS.route.pts;let L=0;for(let i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);GPS.len=L}}
function gpsText(){if(!GPS.route)return'';const L=GPS.len;return' · GPS '+(L<1000?Math.round(L/10)*10+' m':(L/1000).toFixed(1)+' km')}
/* big map click: set (or clear) the GPS destination */
function geoMapClick(e){const cv=$('bigmapC'),r=cv.getBoundingClientRect(),S=cv.width,k=S/(MX1-MX0),oy=(S-(MZ1-MZ0)*k)/2,px=(e.clientX-r.left)*S/r.width,py=(e.clientY-r.top)*S/r.height;
  const x=MX0+px/k,z=MZ0+(py-oy)/k;if(GPS.manual&&Math.hypot(GPS.manual.x-x,GPS.manual.z-z)<60){GPS.manual=null;GPS.route=null;floatMsg('GPS destination cleared');return}
  GPS.manual={x,z};GPS.dest=null;floatMsg('GPS destination set')}
/* purple route line; map(x,z) converts world metres to canvas pixels */
function drawRoute(c,map,wide){if(!GPS.route)return;c.save();c.strokeStyle='#b14dff';c.lineWidth=wide?4:3.5;c.lineJoin=c.lineCap='round';c.beginPath();
  GPS.route.pts.forEach((q,i)=>{const[x,y]=map(q[0],q[1]);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();
  const D=GPS.dest;if(D){const[x,y]=map(D.x,D.z);c.fillStyle='#b14dff';c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x,y,6,0,7);c.fill();c.stroke()}c.restore()}

/* police: spawn on a road 110-220 m away; when far, follow the road route instead of driving straight through buildings */
function geoSpawnPolice(){if(!NAV.ready)return null;const P=playerP(),cand=navNear(P.x,P.z,230);
  for(let t=0;t<40&&cand.length;t++){const e=NAV.E[cand[(Math.random()*cand.length)|0]],n=NAV.nodes[e.f],d=Math.hypot(n[0]-P.x,n[1]-P.z);if(d<110||d>220||e.layer)continue;
    if(vehicles.some(v=>Math.abs(v.pos.x-n[0])<6&&Math.abs(v.pos.z-n[1])<6))continue;
    const v=spawnVehicle('police',n[0],n[1],Math.atan2(P.x-n[0],P.z-n[1]));v.speed=14;v.policeAI={shootT:2,stuck:0,reverse:0,revSteer:1,leaving:false,leaveT:0};return v}return null}
function geoPoliceAim(v,pa,T,dt){if(!NAV.ready)return null;pa.rtT=(pa.rtT||0)-dt;
  if(!pa.route||pa.rtT<=0||Math.hypot((pa.rtX||0)-T.x,(pa.rtZ||0)-T.z)>25){pa.rtT=2;pa.rtX=T.x;pa.rtZ=T.z;const r=navRoute(v.pos.x,v.pos.z,T.x,T.z,false);pa.route=r?r.pts:null}
  const p=pa.route;if(!p)return null;while(p.length>2&&Math.hypot(p[0][0]-v.pos.x,p[0][1]-v.pos.z)<12)p.shift();return{x:p[0][0],z:p[0][1]}}
/* roadblock: two police cars across the road at a junction 70-190 m ahead of the player */
function geoRoadblock(){const v=player.vehicle;if(!v||!NAV.ready)return;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);let best=null,bd=1e9;
  for(const k of navNear(v.pos.x,v.pos.z,200)){const e=NAV.E[k];if(e.layer)continue;const n=NAV.nodes[e.f],dx=n[0]-v.pos.x,dz=n[1]-v.pos.z,ahead=dx*fx+dz*fz,lat=Math.abs(dx*fz-dz*fx);if(ahead<70||ahead>190||lat>14)continue;if(ahead<bd){bd=ahead;best=n}}
  if(!best)return;for(const o of[-3.4,3.4]){const x=best[0]+fz*o,z=best[1]-fx*o;if(vehicles.some(u=>Math.abs(u.pos.x-x)<3&&Math.abs(u.pos.z-z)<3))continue;
    const pv=spawnVehicle('police',x,z,v.heading+Math.PI/2);pv.speed=0;pv.vx=pv.vz=0;pv.policeAI={shootT:1,stuck:0,reverse:0,revSteer:1,leaving:false,leaveT:0,block:true,out:true}}}

/* map icons from OpenStreetMap: hospitals, police stations, bus stands (geodata/processed/pilot/pois.json) */
const POI_ICON={};let GEO_POIS=[];
function letterIcon(L,bg){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.fillStyle=bg;g.beginPath();g.arc(16,16,14,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=2.5;g.stroke();
  g.fillStyle='#fff';g.font='bold 18px Rajdhani,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(L,16,17);return c}
function initGeoPois(){POI_ICON.hospital=ICON.hosp;POI_ICON.police=letterIcon('P','#1d4ed8');POI_ICON.bus_station=letterIcon('B','#2b9348')}/* the list itself loads with the road graph */
function geoIcons(){return GEO_POIS.map(p=>({x:p.x,z:p.z,img:POI_ICON[p.kind],edge:false,near:true}))}
