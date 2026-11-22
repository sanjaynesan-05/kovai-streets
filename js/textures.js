/* Kovai Streets: textures.js
 * Procedural canvas textures and shared surface materials
 * Classic script, loaded in order by index.html (2 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* ================= procedural textures ================= */
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function grain(g,w,h,amt,blot){const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-0.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0);
  if(blot){for(let k=0;k<blot;k++){g.fillStyle=`rgba(0,0,0,${Math.random()*0.06})`;g.beginPath();g.arc(Math.random()*w,Math.random()*h,Math.random()*w*0.08+4,0,7);g.fill()}}}
function tex(c,rep){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(rep)t.repeat.set(rep,rep);return t}
const CURT=['#e9d8a6','#94d2bd','#ee9b00','#f4acb7','#cdb4db','#a8dadc','#fefae0','#e5989b'];
function facade(style){const S=512,B=128,c=cv(S,S),e=cv(S,S),g=c.getContext('2d'),ge=e.getContext('2d');ge.fillStyle='#000';ge.fillRect(0,0,S,S);
  g.fillStyle='#ffffff';g.fillRect(0,0,S,S);
  if(style===1){g.fillStyle='#e6e6e6';for(let y=0;y<S;y+=8){g.fillRect(0,y,S,1);const off=(y/8)%2?0:10;for(let x=off;x<S;x+=20)g.fillRect(x,y,1,8)}}
  for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const ox=bx*B,oy=by*B,lit=Math.random()<0.42,lc=Math.random()<0.75?'#ffcf7a':'#d6ecff';
    if(style===2){g.fillStyle='#2c4250';g.fillRect(ox+4,oy+6,B-8,B-34);const gr=g.createLinearGradient(ox,oy,ox+B,oy+B);gr.addColorStop(0,'rgba(255,255,255,.28)');gr.addColorStop(0.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.12)');g.fillStyle=gr;g.fillRect(ox+4,oy+6,B-8,B-34);
      g.fillStyle='#d0d6da';g.fillRect(ox+B/2-2,oy+6,4,B-34);g.fillStyle='#bfc6cc';g.fillRect(ox,oy+B-28,B,28);if(lit){ge.fillStyle=lc;ge.fillRect(ox+6,oy+8,B-12,B-38)}continue}
    g.fillStyle='#e2e2e2';g.fillRect(ox,oy+B-10,B,6);g.fillStyle='#cfcfcf';g.fillRect(ox,oy+B-4,B,4);
    const wx=ox+30,wy=oy+26,ww=68,wh=70;
    g.fillStyle=style===3?'#bdbdbd':'#f4f4f4';g.fillRect(wx-6,wy-6,ww+12,wh+14);
    g.fillStyle='#2b3a46';g.fillRect(wx,wy,ww,wh);const gr=g.createLinearGradient(wx,wy,wx+ww,wy+wh);gr.addColorStop(0,'rgba(170,200,220,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(wx,wy,ww,wh);
    if(Math.random()<0.6){g.fillStyle=pick(CURT);g.fillRect(wx+2,wy+2,ww*R(0.2,0.45),wh-4)}
    if(style===3){g.fillStyle='#7a7a7a';for(let k=0;k<6;k++)g.fillRect(wx,wy+k*12+3,ww,5)}
    else{g.fillStyle='#4a4a4a';for(let k=1;k<6;k++)g.fillRect(wx+k*ww/6,wy,2,wh)}
    g.fillStyle='#d8d8d8';g.fillRect(wx-8,wy+wh+4,ww+16,6);
    if(style===0&&Math.random()<0.3){g.fillStyle='#e8e8e8';g.fillRect(wx+ww+10,wy+wh-34,22,26);g.fillStyle='#9a9a9a';for(let k=0;k<5;k++)g.fillRect(wx+ww+12,wy+wh-30+k*5,18,2)}
    if(style!==3&&Math.random()<0.5){const sx=wx+R(0,ww);const sg=g.createLinearGradient(0,wy+wh+10,0,oy+B);sg.addColorStop(0,'rgba(60,50,40,.18)');sg.addColorStop(1,'rgba(60,50,40,0)');g.fillStyle=sg;g.fillRect(sx,wy+wh+10,6,B-wh-30)}
    if(style===3){g.fillStyle='#d0d0d0';g.fillRect(ox,oy,8,B);g.fillRect(ox+B-8,oy,8,B)}
    if(lit){ge.fillStyle=lc;ge.fillRect(wx,wy,ww,wh);ge.fillStyle='rgba(0,0,0,.45)';ge.fillRect(wx+2,wy+2,ww*0.3,wh-4)}}
  grain(g,S,S,18,30);return{map:tex(c),em:tex(e)}}
const SHOPNAMES=['SRI LAKSHMI STORES','KOVAI TEXTILES','NEW MODERN BAKERY','SAKTHI MOBILES','SELVAM HARDWARES','RAJ MEDICALS','HOTEL ARUL','GANESH SWEETS','MURUGAN TEA STALL','VELAN OPTICALS','PRIYA FANCY STORE','ANBU ELECTRICALS'];
const SIGNC=['#c1121f','#1d4ed8','#2b9348','#f77f00','#7b2cbf','#0f766e','#b45309','#be123c'];
function shopTex(){const W=1024,H=128,c=cv(W,H),e=cv(W,H),g=c.getContext('2d'),ge=e.getContext('2d');ge.fillStyle='#000';ge.fillRect(0,0,W,H);
  for(let k=0;k<8;k++){const ox=k*128;g.fillStyle='#d9d4c8';g.fillRect(ox,0,128,H);
    const sc=SIGNC[k%SIGNC.length];g.fillStyle=sc;g.fillRect(ox+3,4,122,34);g.fillStyle='#fff';g.font='bold 15px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
    const nm=SHOPNAMES[(k*5+3)%SHOPNAMES.length];const words=nm.split(' ');if(nm.length>14){g.font='bold 12px Arial,sans-serif';g.fillText(words.slice(0,2).join(' '),ox+64,14);g.fillText(words.slice(2).join(' '),ox+64,29)}else g.fillText(nm,ox+64,21);
    ge.fillStyle=shade(sc,0.9);ge.fillRect(ox+3,4,122,34);ge.fillStyle='#fff';ge.font=g.font;ge.textAlign='center';ge.textBaseline='middle';if(nm.length>14){ge.font='bold 12px Arial,sans-serif';ge.fillText(words.slice(0,2).join(' '),ox+64,14);ge.fillText(words.slice(2).join(' '),ox+64,29)}else ge.fillText(nm,ox+64,21);
    g.fillStyle='#8c8c8c';g.fillRect(ox,40,6,88);g.fillRect(ox+122,40,6,88);
    if(k%3===1){g.fillStyle='#9aa0a6';g.fillRect(ox+8,44,112,84);g.fillStyle='#7d8389';for(let y=46;y<128;y+=5)g.fillRect(ox+8,y,112,2)}
    else{g.fillStyle='#3a2f28';g.fillRect(ox+8,44,112,84);for(let r=0;r<3;r++){g.fillStyle='#6d4c41';g.fillRect(ox+10,58+r*22,108,3);for(let q=0;q<9;q++){g.fillStyle=pick(['#e63946','#ffb703','#8ecae6','#06d6a0','#f1faee','#fb8500','#9b5de5']);g.fillRect(ox+12+q*12,47+r*22,8,11)}}
      ge.fillStyle='#ffe2a8';ge.fillRect(ox+8,44,112,84);ge.fillStyle='rgba(0,0,0,.5)';for(let r=0;r<3;r++)ge.fillRect(ox+10,58+r*22,108,3)}}
  grain(g,W,H,14);const t=tex(c),te=tex(e);return{map:t,em:te}}
function surfTex(kind){const S=256,c=cv(S,S),g=c.getContext('2d');
  if(kind==='asphalt'){g.fillStyle='#55565b';g.fillRect(0,0,S,S);grain(g,S,S,34);for(let k=0;k<6;k++){g.fillStyle=`rgba(20,20,22,${R(0.05,0.15)})`;g.fillRect(R(0,S),R(0,S),R(20,70),R(10,40))}for(let k=0;k<3;k++){g.strokeStyle='rgba(15,15,15,.35)';g.lineWidth=1;g.beginPath();let x=R(0,S),y=R(0,S);g.moveTo(x,y);for(let q=0;q<6;q++){x+=R(-20,20);y+=R(-20,20);g.lineTo(x,y)}g.stroke()}}
  else if(kind==='pavers'){g.fillStyle='#b9b4aa';g.fillRect(0,0,S,S);for(let y=0;y<S;y+=32)for(let x=0;x<S;x+=32){g.fillStyle=pick(['#bdb8ae','#b2ada2','#c4bfb5','#aaa59b']);g.fillRect(x+1,y+1,30,30)}grain(g,S,S,16)}
  else if(kind==='curb'){g.fillStyle='#f2c200';g.fillRect(0,0,S,S);g.fillStyle='#1b1b1b';g.fillRect(0,0,S/2,S);grain(g,S,S,20)}
  else if(kind==='grass'){g.fillStyle='#8c9a5e';g.fillRect(0,0,S,S);for(let k=0;k<1400;k++){g.fillStyle=pick(['#7f8f52','#97a565','#a3a46a','#7a8a4c','#b0a774']);g.fillRect(R(0,S),R(0,S),R(1,3),R(1,4))}grain(g,S,S,16,20)}
  else if(kind==='detail'){g.fillStyle='#ffffff';g.fillRect(0,0,S,S);for(let k=0;k<2200;k++){const v=R(200,255)|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(R(0,S),R(0,S),R(1,3),R(1,3))}grain(g,S,S,24)}
  else if(kind==='falls'){g.fillStyle='#cfe8f2';g.fillRect(0,0,S,S);for(let k=0;k<160;k++){g.fillStyle=`rgba(255,255,255,${R(0.3,0.9)})`;g.fillRect(R(0,S),R(0,S),R(2,5),R(20,80))}for(let k=0;k<60;k++){g.fillStyle=`rgba(120,170,190,${R(0.2,0.5)})`;g.fillRect(R(0,S),R(0,S),R(2,6),R(20,60))}}
  return tex(c)}
const FAC=[0,1,2,3].map(facade),SHOPT=shopTex();
const TX={asphalt:surfTex('asphalt'),pavers:surfTex('pavers'),curb:surfTex('curb'),grass:surfTex('grass'),detail:surfTex('detail'),falls:surfTex('falls')};
winMat.map=FAC[0].map;winMat.emissiveMap=FAC[0].em;winMat.needsUpdate=true;
const FACMAT=[winMat,...[1,2,3].map(i=>new THREE.MeshLambertMaterial({map:FAC[i].map,emissiveMap:FAC[i].em,emissive:0x000000,vertexColors:true}))];
FACMAT[2].shininess=60;
const shopMat=new THREE.MeshLambertMaterial({map:SHOPT.map,emissiveMap:SHOPT.em,emissive:0x000000,vertexColors:true});
const roadMat=new THREE.MeshPhongMaterial({map:TX.asphalt,shininess:30,specular:0x000000}),sideMat=new THREE.MeshPhongMaterial({map:TX.pavers,shininess:20,specular:0x000000}),curbMat=new THREE.MeshLambertMaterial({map:TX.curb});
B_WIN.tex=true;const B_FAC=[B_WIN,batch(),batch(),batch()];B_FAC.forEach(b=>b.tex=true);const B_SHOP=batch(),B_ROAD=batch(),B_SIDE=batch(),B_CURB=batch();[B_SHOP,B_ROAD,B_SIDE,B_CURB].forEach(b=>b.tex=true);
function quad(B,a,b,c,d,ua,ub,uc,ud,color){const v=[a,b,c,a,c,d],u=[ua,ub,uc,ua,uc,ud];
  const nx=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),nz=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),nl=Math.hypot(nx,ny,nz)||1;
  _col.set(color||'#ffffff');for(let i=0;i<6;i++){B.pos.push(v[i][0],v[i][1],v[i][2]);B.nor.push(nx/nl,ny/nl,nz/nl);B.uv.push(u[i][0],u[i][1]);B.col.push(_col.r,_col.g,_col.b)}}
function addFlat(B,x0,z0,x1,z1,y,color,us){us=us||8;quad(B,[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0],[x0/us,z1/us],[x1/us,z1/us],[x1/us,z0/us],[x0/us,z0/us],color)}
function addWallQ(B,x0,z0,x1,z1,y0,y1,color,us){const L=Math.hypot(x1-x0,z1-z0)/(us||2);quad(B,[x0,y0,z0],[x1,y0,z1],[x1,y1,z1],[x0,y1,z0],[0,0],[L,0],[L,1],[0,1],color)}
function shopGeo(w,d){const g=new THREE.BoxGeometry(w,3.6,d);const uv=g.attributes.uv;const off=Math.floor(rng()*8);
  for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;if(f===2||f===3){uv.setXY(i,0.002,0.99);continue}const horiz=f<2?d:w,bays=Math.max(1,Math.round(horiz/5));uv.setXY(i,(uv.getX(i)*bays+off)/8,uv.getY(i)*0.98+0.01)}return g}
