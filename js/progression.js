/* Kovai Streets: progression.js
 * Progression state, Respect unlocks, save system, safehouse and garage, outfits, area gates
 * Classic script, loaded in order by index.html (15 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

const SAVE_KEY='kovaiSave1';

/* ---------- progression state ---------- */
const PROG={story:0,reels:[],jumps:[],ramp:[],house:false,garage:[],outfit:0,tut:0,lastLv:1};
const respectLv=()=>1+Math.floor(rep/3);
const JOB_LV={deliver:1,race:1,fare:1,amb:1,gang:2,chase:2,boss:3};
function lvUnlocks(lv){const a=[];for(const it of SHOPITEMS)if(it.lv===lv)a.push(it.armor?'armour':WEAPONS[WI(it.w)].name.toLowerCase());
  const j=Object.keys(JOB_LV).filter(k=>JOB_LV[k]===lv).map(k=>JOBT[k].name.toLowerCase());let s='';if(a.length)s+='Shop: '+a.join(', ');if(j.length)s+=(s?' · ':'')+'Jobs: '+j.join(', ');return s}

/* ---------- saving: versioned envelope, checksum, backup, recovery, migration ----------
   Storage keys (all in localStorage):
     kovaiSave1          current save   {v:2, t:<ms>, sum:<checksum of data>, data:{...}}
     kovaiSave1.bak      last known-good save (the previous valid main save, rotated on every write)
     kovaiSave1.corrupt  raw copy of an unreadable save, kept so it is never silently lost
     kovaiSave1.prev     copy of the save that "New game" replaced (not loaded automatically)
   Version 1 saves (flat object with v:1) are migrated on load. Saves from a newer version are left untouched. */
const SAVE_VERSION=3,SAVE_BAK=SAVE_KEY+'.bak',SAVE_BAD=SAVE_KEY+'.corrupt',SAVE_PREV=SAVE_KEY+'.prev';
let saveQ=0,saveTimer=30,savedT=null,saveBlocked=false,saveWarned=false,saveNotice='';
function queueSave(){saveQ=0.5}
function flashSaved(){const el=$('saveTag');if(!el)return;el.style.opacity=1;clearTimeout(savedT);savedT=setTimeout(()=>el.style.opacity=0,1300)}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function saveSum(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(36)+'.'+s.length}
const SAVE_MIGRATE={1:o=>{const d=Object.assign({},o);delete d.v;return d},   // v1 flat object -> v2 data
  2:d=>{const n=Object.assign({},d);n.prog=Object.assign({},d.prog||{});if(!n.prog.a2)n.prog.a2={};return n}};   // v2 -> v3: Act 2 story state
function sanitizeSave(d){if(!d||typeof d!=='object'||Array.isArray(d))return null;if(typeof d.cash!=='number'||!isFinite(d.cash))return null;
  const num=(x,def,lo,hi)=>typeof x==='number'&&isFinite(x)?clamp(x,lo,hi):def,arr=(a,n)=>Array.isArray(a)?a.slice(0,n):[];
  const ids=(a,n)=>[...new Set(arr(a,n).filter(x=>Number.isInteger(x)&&x>=0&&x<n))];const p=d.prog&&typeof d.prog==='object'?d.prog:{};
  return{cash:Math.floor(num(d.cash,0,0,1e9)),armor:num(d.armor,0,0,100),owned:arr(d.owned,NW).map(Boolean),mags:arr(d.mags,NW).map(x=>Math.floor(num(x,0,0,1e5))),
    res:arr(d.res,NW).map(x=>Math.floor(num(x,0,-1,1e6))),weapon:Math.floor(num(d.weapon,3,0,NW-1)),rep:Math.floor(num(d.rep,0,0,1e5)),
    fr:arr(d.fr,FRIENDS.length).map(a=>Array.isArray(a)?[num(a[0],0,0,100),!!a[1]]:[0,false]),tod:num(d.tod,8.5,0,24),
    prog:{story:Math.floor(num(p.story,0,0,STORY.length)),reels:ids(p.reels,REELS.length),jumps:ids(p.jumps,RAMPS.length),ramp:ids(p.ramp,RAMPAGES.length),house:!!p.house,
      garage:arr(p.garage,3).filter(c=>c&&VT[c.type]).map(c=>({type:c.type,color:typeof c.color==='string'?c.color:null})),outfit:Math.floor(num(p.outfit,0,0,OUTFITS.length-1)),
      tut:Math.floor(num(p.tut,0,0,TUT.length)),lastLv:Math.floor(num(p.lastLv,1,1,1e5)),a2:sanitizeA2(p.a2)}}}
/* parseSave(raw) -> {ok:true,data,version} or {ok:false,reason:'empty'|'corrupt'|'newer',why} */
function parseSave(raw){if(raw==null||raw==='')return{ok:false,reason:'empty'};let o;try{o=JSON.parse(raw)}catch(e){return{ok:false,reason:'corrupt',why:'not JSON'}}
  if(!o||typeof o!=='object'||!Number.isInteger(o.v))return{ok:false,reason:'corrupt',why:'no version'};
  if(o.v>SAVE_VERSION)return{ok:false,reason:'newer',why:'version '+o.v};
  let data;if(o.v>=2){if(!o.data||typeof o.data!=='object')return{ok:false,reason:'corrupt',why:'no data'};if(o.sum!==saveSum(JSON.stringify(o.data)))return{ok:false,reason:'corrupt',why:'checksum mismatch'};data=o.data}else data=o;
  for(let v=o.v;v<SAVE_VERSION;v++){const m=SAVE_MIGRATE[v];if(!m)return{ok:false,reason:'corrupt',why:'no migration from v'+v};try{data=m(data)}catch(e){return{ok:false,reason:'corrupt',why:'migration failed'}}}
  const clean=sanitizeSave(data);return clean?{ok:true,data:clean,version:o.v}:{ok:false,reason:'corrupt',why:'invalid fields'}}
function collectSave(){return{cash:Math.floor(player.cash),armor:player.armor,owned:player.owned.slice(),mags:player.mags.slice(),res:player.res.map(r=>r===Infinity?-1:r),weapon:player.weapon,rep,
  fr:FRIENDS.map(f=>[f.fr,f.perkDone]),prog:Object.assign({},PROG,{garage:garageList()}),tod}}
function hasSave(){return parseSave(lsGet(SAVE_KEY)).ok||parseSave(lsGet(SAVE_BAK)).ok}
function saveGame(){if(!started||saveBlocked)return false;let data,str;
  try{data=sanitizeSave(collectSave());if(!data)return false;str=JSON.stringify({v:SAVE_VERSION,t:Date.now(),sum:saveSum(JSON.stringify(data)),data})}catch(e){return false}
  if(!parseSave(str).ok)return false;                       // never write something we could not read back
  const cur=lsGet(SAVE_KEY);if(cur&&cur!==str&&parseSave(cur).ok)lsSet(SAVE_BAK,cur);   // keep the last known-good save
  if(!lsSet(SAVE_KEY,str)){if(!saveWarned){saveWarned=true;floatMsg('Could not save: browser storage is full or blocked')}return false}
  flashSaved();return true}
function applySave(d){player.cash=d.cash;player.armor=d.armor;
  d.owned.forEach((o,i)=>{player.owned[i]=o});d.mags.forEach((m,i)=>{player.mags[i]=m});
  d.res.forEach((r,i)=>{if(player.res[i]!==Infinity)player.res[i]=r<0?Infinity:r});
  rep=d.rep;d.fr.forEach((a,i)=>{const f=FRIENDS[i];if(f){f.fr=a[0];f.perkDone=a[1]}});
  Object.assign(PROG,d.prog);tod=d.tod;if(player.owned[d.weapon])player.weapon=d.weapon}
function loadGame(){const raw=lsGet(SAVE_KEY),main=parseSave(raw);let use=null;
  if(main.ok)use=main.data;
  else if(main.reason==='newer'){saveBlocked=true;saveNotice='This save was made by a newer version of Kovai Streets. It has not been loaded or changed, and this session will not save.';return false}
  else if(main.reason==='corrupt'){if(lsGet(SAVE_BAD)!==raw)lsSet(SAVE_BAD,raw);const bak=parseSave(lsGet(SAVE_BAK));
    if(bak.ok){use=bak.data;saveNotice='Your save could not be read ('+main.why+'). The last good backup was restored.'}
    else saveNotice='Your save could not be read ('+main.why+') and no backup was available. A copy was kept in the browser as kovaiSave1.corrupt.'}
  if(!use)return false;applySave(use);return true}
function newGameReset(){const cur=lsGet(SAVE_KEY);if(cur&&parseSave(cur).ok)lsSet(SAVE_PREV,cur);lsDel(SAVE_KEY);lsDel(SAVE_BAK)}
function deleteAllSaves(){for(const k of[SAVE_KEY,SAVE_BAK,SAVE_BAD,SAVE_PREV])lsDel(k)}
addEventListener('beforeunload',()=>saveGame());

/* ---------- safehouse & garage ---------- */
const HOUSE=(()=>{const p=W(ox(-439),15),a=W(ox(-424),14),b=W(ox(-410),28);return{px:p[0],pz:p[1],price:5000,gx0:a[0],gx1:b[0],gz0:a[1],gz1:b[1]}})();/* W: grid-world position converted to the real map */
function buildSafehouse(){const{gx0,gx1,gz0,gz1}=HOUSE;
  building(...W(ox(-439),24),14,12,7,'#f3c6c0',{noShop:true,noSign:true,noTank:true,style:0});addG(B_PLAIN,GEO.cone4,W(ox(-439),24)[0],8.7,W(ox(-439),24)[1],'#a8432f',Math.PI/4,0,0,10.6,3.4,9.2);
  addBox(B_PLAIN,1.5,2.5,0.12,W(ox(-439),17.97)[0],1.25,W(ox(-439),17.97)[1],'#6d4c41');addBox(B_PLAIN,3,0.15,1.6,W(ox(-439),17.1)[0],0.08,W(ox(-439),17.1)[1],'#cfc6b2');
  const h=4.2,C='#d9d2c4';addBox(B_PLAIN,0.4,h,gz1-gz0,gx0,h/2,(gz0+gz1)/2,C);addCollider(gx0-0.2,gz0,gx0+0.2,gz1,h);
  addBox(B_PLAIN,0.4,h,gz1-gz0,gx1,h/2,(gz0+gz1)/2,C);addCollider(gx1-0.2,gz0,gx1+0.2,gz1,h);
  addBox(B_PLAIN,gx1-gx0,h,0.4,(gx0+gx1)/2,h/2,gz1,C);addCollider(gx0,gz1-0.2,gx1,gz1+0.2,h);
  addBox(B_PLAIN,gx1-gx0+0.6,0.3,gz1-gz0+0.6,(gx0+gx1)/2,h+0.15,(gz0+gz1)/2,'#7a7a7a');addCollider(gx0,gz0,gx1,gz1,h+0.3,h);
  addBox(B_PLAIN,gx1-gx0,0.8,0.3,(gx0+gx1)/2,h-0.4,gz0,'#c0392b');addFlat(B_SIDE,gx0,gz0-7,gx1,gz1,0.05,'#ffffff',2.5);addFlat(B_SIDE,...W(ox(-442),7),...W(ox(-436),18),0.05,'#ffffff',2.5);
  const sg=textPlane('SAFEHOUSE GARAGE',7,0.9,'#1d3557','#ffd23f');sg.position.set((gx0+gx1)/2,h+0.75,gz0-0.25);sg.rotation.y=Math.PI;
  for(const x of[-452,-404])palm(...W(ox(x),12));neem(...W(ox(-450),34))}
function inGarage(x,z){return x>HOUSE.gx0+0.4&&x<HOUSE.gx1-0.4&&z>HOUSE.gz0-0.5&&z<HOUSE.gz1-0.4}
function garageList(){if(!PROG.house)return[];const a=[];for(const v of vehicles){if(v.wrecked||v.s.boat)continue;if(inGarage(v.pos.x,v.pos.z)&&a.length<3)a.push({type:v.type,color:v.color||null})}return a}
function spawnGarage(){if(!PROG.house)return;const slots=[-420.5,-417,-413.5].map(x=>W(ox(x),22));PROG.garage.slice(0,3).forEach((c,i)=>{if(!VT[c.type])return;const v=spawnVehicle(c.type,slots[i][0],slots[i][1],Math.PI,c.color||undefined);v.keep=true})}
const OUTFITS=[{n:'Teal shirt & jeans',o:{shirt:'#2a9d8f',pants:'#22223b',lower:'pants',sleeve:'short'}},
  {n:'White veshti',o:{shirt:'#f4f1e8',pants:'#f4f1e8',lower:'veshti',sleeve:'long',chain:true}},
  {n:'Checked lungi',o:{shirt:'#e9c46a',pants:'#1d4ed8',lower:'lungi',sleeve:'short'}},
  {n:'Black tee & cargos',o:{shirt:'#1d1d1d',pants:'#5c5440',lower:'pants',sleeve:'short',chain:true}},
  {n:'Kovai cricket jersey',o:{shirt:'#1d4ed8',pants:'#f4f4f4',lower:'pants',sleeve:'short'}},
  {n:'Office formals',o:{shirt:'#a8dadc',pants:'#2b2d42',lower:'pants',sleeve:'long',glasses:true}}];
function setOutfit(i){PROG.outfit=i;const old=player.human;const h=makeHuman(Object.assign({skin:'#8d5524',gun:true,stache:true,hair:'#1b1410',hairStyle:'short',shoe:'#3b2a20'},OUTFITS[i].o));
  if(old){h.g.position.copy(old.g.position);h.g.rotation.copy(old.g.rotation);h.g.visible=old.g.visible;scene.remove(old.g)}player.human=h;setGun();
  const n=$('sOutfitName');if(n)n.textContent=OUTFITS[i].n;queueSave()}
function houseOpts(){const P=HOUSE.price.toLocaleString('en-IN');
  if(!PROG.house)return[{t:`Buy the house (₹${P})`,off:player.cash<HOUSE.price,fn:()=>{if(player.cash<HOUSE.price)return'Come back when you have the money, thambi.';player.cash-=HOUSE.price;PROG.house=true;saveGame();
      toast('SAFEHOUSE BOUGHT','Save here, change clothes, sleep, and keep up to 3 vehicles in the garage',4);return'The keys are yours. Welcome home!'}},{t:'Bye',fn:()=>false}];
  return[{t:'Save the game',fn:()=>{saveGame();return'Game saved. Vehicles parked in the garage are kept too.'}},
    {t:'Change outfit (next: '+OUTFITS[(PROG.outfit+1)%OUTFITS.length].n+')',fn:()=>{setOutfit((PROG.outfit+1)%OUTFITS.length);return'Looking sharp!'}},
    {t:'Sleep until morning (full health, cops forget you)',fn:()=>{tod=7;player.hp=100;wanted=0;saveGame();return'You wake up rested. Good morning, Kovai!'}},{t:'Bye',fn:()=>false}]}
function houseTalk(){const t={kind:'house',obj:{x:HOUSE.px,z:HOUSE.pz},line:PROG.house?'Home sweet home. What do you want to do?':`A quiet house with a three-car garage on Perur Road. Yours for ₹${HOUSE.price.toLocaleString('en-IN')}.`,
  hdr:()=>`<h3>${PROG.house?'Your safehouse':'House for sale'}</h3><div class="sub">Perur Road · Cash ₹${Math.floor(player.cash).toLocaleString('en-IN')}</div>`,optsFn:houseOpts};t.opts=houseOpts();return t}


/* ---------- gated areas ---------- */