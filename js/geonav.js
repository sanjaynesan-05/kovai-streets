/* Kovai Streets: geonav.js
 * Step G4 (real-geography mode only, index.html?world=geo): road graph, traffic, traffic signals and pedestrians.
 * Data: geodata/processed/pilot/graph_pilot.json (directed edges, so one-way streets are respected; flyovers never join the road below)
 * and roads.json (edge shapes and road classes). Traffic reuses the grid AI in vehicles.js (updAI: steering, braking for cars ahead,
 * unsticking, respawning); only the waypoints (geoAINext) and red lights (geoRed) come from here. Keeps to the left, like Indian roads.
 * Pedestrians walk the sidewalks of ordinary roads (not flyovers), turning at junctions. Footways are not used yet.
 * Classic script, loaded after geoworld.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const NAV={ready:false,E:[],OUT:[],PADJ:[],CELL:new Map(),SIG:new Map(),REV:new Map()};
const NAV_C=100;                                             // spawn index cell size (m)
const NAV_W={trunk:3,primary:3,secondary:2.5,tertiary:2,trunk_link:1.5,primary_link:1.5,secondary_link:1.2,tertiary_link:1,unclassified:1,residential:0.8,living_street:0.4,service:0.1,track:0.05};
const NAV_V={trunk:1.15,primary:1.05,secondary:1,tertiary:0.9,unclassified:0.75,residential:0.65,living_street:0.45,service:0.4,track:0.35};   // cruise speed factor by road class
const SIG_CYCLE=18;                                          // seconds per signal phase (east-west, then north-south)

function initGeoNav(){Promise.all(['graph_pilot','roads'].map(n=>fetch('geodata/processed/pilot/'+n+'.json').then(r=>r.json()))).then(([g,rd])=>{
  const roads=rd.roads,E=NAV.E;for(let i=0;i<g.nodes.length;i++){NAV.OUT.push([]);NAV.PADJ.push([])}
  g.edges.forEach(([f,t,len,ri,a,b],k)=>{const r=roads[ri],n0=g.nodes[f];let pts=r.pts.slice(a,b+1);if(Math.hypot(pts[0][0]-n0[0],pts[0][1]-n0[1])>0.5)pts=pts.slice().reverse();
    const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    E.push({f,t,pts,cum,len:cum[cum.length-1],w:r.width,cls:r.cls,two:!r.oneway,layer:r.layer,bridge:r.bridge,ri,a,b});NAV.OUT[f].push(k);
    const key=ri+':'+a+':'+b;if(NAV.REV.has(key)){const o=NAV.REV.get(key);E[o].rev=k;E[k].rev=o}else NAV.REV.set(key,k);
    if(!r.bridge&&!r.layer&&r.cls!=='trunk_link'&&r.cls!=='primary_link'){NAV.PADJ[f].push({e:k,rev:false});NAV.PADJ[t].push({e:k,rev:true})}
    const ck=Math.floor(n0[0]/NAV_C)+','+Math.floor(n0[1]/NAV_C);let l=NAV.CELL.get(ck);if(!l){l=[];NAV.CELL.set(ck,l)}l.push(k)});
  for(const s of rd.signals){let best=-1,bd=25;const l=[];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const k of NAV.CELL.get((Math.floor(s[0]/NAV_C)+i)+','+(Math.floor(s[1]/NAV_C)+j))||[])l.push(E[k].f);
    for(const n of l){const d=Math.hypot(g.nodes[n][0]-s[0],g.nodes[n][1]-s[1]);if(d<bd){bd=d;best=n}}if(best>=0&&!NAV.SIG.has(best))NAV.SIG.set(best,{x:g.nodes[best][0],z:g.nodes[best][1],off:gwHash(best)*SIG_CYCLE*2,m:null})}
  NAV.nodes=g.nodes;NAV.ready=true;
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
    const two=!!(VT[type]&&VT[type].two),lane=navLane(e,two),w=navWps(e,lane,0);if(vehicles.some(v=>Math.abs(v.pos.x-w[0].x)<8&&Math.abs(v.pos.z-w[0].z)<8))continue;
    const v=spawnVehicle(type,w[0].x,w[0].z,navDir(e,false)),cr=CRUISE[type]||[9,11],base=RR(cr[0],cr[1]);
    v.ai={geo:true,e:k,lane,two,base,cruise:base*(NAV_V[e.cls]||0.7),wps:w.slice(1),turnWp:null,blockT:0,stuck:0,hitT:0,i:0,j:0,dx:0,dz:0};v.speed=v.ai.cruise*0.6;v.vx=Math.sin(v.heading)*v.speed;v.vz=Math.cos(v.heading)*v.speed;
    if(v.s.two)addRider(v);return v}
  return null}
/* next edge at a junction: straighter and bigger roads are more likely; no U-turns unless it is a dead end */
function geoAINext(v){const a=v.ai,cur=NAV.E[a.e],h0=navDir(cur,true);const opts=[];
  for(const k of NAV.OUT[cur.t]){if(k===cur.rev)continue;const e=NAV.E[k];let turn=Math.abs(angDiff(h0,navDir(e,false)));if(turn>2.6)continue;
    opts.push([k,(NAV_W[e.cls]||0.5)*(0.25+Math.cos(turn/2)**4)])}
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
function pedAt(e,s,side,off){const c=e.cum,pts=e.pts;let k=1;while(k<c.length-1&&c[k]<s)k++;const t=clamp((s-c[k-1])/((c[k]-c[k-1])||1),0,1),a=pts[k-1],b=pts[k],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,o=(e.w/2+1.6+(off||0)*0.3)*side;
  return[a[0]+dx*t+dz/l*o,a[1]+dz*t-dx/l*o]}
