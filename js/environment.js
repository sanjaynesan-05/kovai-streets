/* Kovai Streets: environment.js
 * Street lamps and headlight beams, sky, day/night cycle, weather and rain
 * Classic script, loaded in order by index.html (6 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

/* --- street lamps, light pools, headlight beams --- */
let lampHeadMat,poolMat,beamMat,spot;
const beamGeo2=new THREE.PlaneGeometry(2.8,10).rotateX(-Math.PI/2);
function addBeam(v){if(v.s.boat||v.type==='tank'||!beamMat)return;const b=new THREE.Mesh(beamGeo2,beamMat);b.position.set(0,0.09,v.s.len/2+5.2);if(v.s.two)b.scale.set(0.6,1,0.8);v.mesh.add(b)}

/* --- sky dome, sun/moon, stars --- */
let sky,stars,moon,tod=8.5,dayF=1,rainF=0,rainOn=false,weatherT=RR(200,320),thunderT=20,flashT=0;
function buildSky(){scene.background=null;
  sky=new THREE.Mesh(new THREE.SphereGeometry(2400,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunCol:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},glow:{value:1}},
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top,hor,sunCol,sunDir;uniform float glow;varying vec3 vD;void main(){vec3 d=normalize(vD);float h=d.y;vec3 c=mix(hor,top,pow(clamp(h,0.0,1.0),0.55));if(h<0.0)c=hor*0.92;float s=max(dot(d,sunDir),0.0);c+=sunCol*(pow(s,900.0)*2.0+pow(s,10.0)*0.32*glow);gl_FragColor=vec4(c,1.0);}'}));
  sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
  const sp=[];for(let i=0;i<700;i++){const a=Math.random()*Math.PI*2,y=Math.random()*0.95+0.05,r=Math.sqrt(1-y*y);sp.push(Math.cos(a)*r*2200,y*2200,Math.sin(a)*r*2200)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));stars.frustumCulled=false;scene.add(stars);
  moon=new THREE.Mesh(new THREE.SphereGeometry(45,16,12),new THREE.MeshBasicMaterial({color:0xf4f1e8,fog:false,transparent:true,opacity:0}));scene.add(moon)}
const _sd=new THREE.Vector3(),_cA=new THREE.Color(),_cB=new THREE.Color(),_cC=new THREE.Color();
const C_DAYTOP=new THREE.Color('#3f7fd0'),C_NIGHTTOP=new THREE.Color('#050a1a'),C_DAYHOR=new THREE.Color('#cfe3ee'),C_DUSKHOR=new THREE.Color('#ff9a5a'),C_NIGHTHOR=new THREE.Color('#0d1730'),
  C_RAINTOP=new THREE.Color('#5d6670'),C_RAINHOR=new THREE.Color('#9aa3a8'),C_SUN=new THREE.Color('#fff1c0'),C_DUSKSUN=new THREE.Color('#ff7a2a'),C_MOON=new THREE.Color('#8fa8ff');
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function updateSky(dt,advance){if(advance)tod=(tod+dt*24/(16*60))%24;
  const th=(tod-6)/12*Math.PI,elev=Math.sin(th);_sd.set(Math.cos(th),elev,0.35).normalize();
  dayF=smooth(-0.12,0.22,elev);const dusk=Math.exp(-Math.pow(elev/0.2,2))*(elev>-0.25?1:0);
  // weather
  if(advance){weatherT-=dt;if(weatherT<=0){rainOn=!rainOn;weatherT=rainOn?RR(120,240):RR(240,480);if(rainOn)floatMsg('It\'s starting to rain…')}}
  rainF+=((rainOn?1:0)-rainF)*Math.min(1,dt*0.25);
  const top=_cA.copy(C_NIGHTTOP).lerp(C_DAYTOP,dayF),hor=_cB.copy(C_NIGHTHOR).lerp(C_DAYHOR,dayF).lerp(C_DUSKHOR,dusk*0.85*(1-rainF*0.7));
  const rb=0.25+0.75*dayF;_cC.copy(C_RAINTOP).multiplyScalar(rb);top.lerp(_cC,rainF*0.75);_cC.copy(C_RAINHOR).multiplyScalar(rb);hor.lerp(_cC,rainF*0.8);
  if(flashT>0){flashT-=dt;top.lerp(new THREE.Color(1,1,1),flashT*3);hor.lerp(new THREE.Color(1,1,1),flashT*3)}
  const u=sky.material.uniforms;u.top.value.copy(top);u.hor.value.copy(hor);
  const night=elev<-0.05;u.sunDir.value.copy(night?_sd.clone().negate():_sd);u.sunCol.value.copy(night?C_MOON:C_SUN).lerp(C_DUSKSUN,night?0:dusk).multiplyScalar((night?0.25:1)*(1-rainF*0.85));u.glow.value=night?0.3:1;
  scene.fog.color.copy(hor);scene.fog.near=lerpN(120,190,dayF)*(1-rainF*0.6);scene.fog.far=lerpN(900,1500,dayF)*(1-rainF*0.65);
  sky.position.copy(camera.position);stars.position.copy(camera.position);stars.material.opacity=(1-dayF)*(1-rainF)*0.9;
  moon.position.copy(camera.position).addScaledVector(_sd,-2150);moon.material.opacity=(1-dayF)*(1-rainF*0.8);
  const ld=night?_sd.clone().negate():_sd;SUN_OFF.copy(ld).multiplyScalar(170);
  sun.intensity=(0.95*dayF+0.16*(1-dayF))*(1-0.6*rainF);sun.color.copy(night?C_MOON:new THREE.Color('#fff0d2')).lerp(C_DUSKSUN,night?0:dusk*0.6);
  hemi.intensity=(0.16+0.5*dayF)*(1-0.3*rainF)+(flashT>0?flashT*4:0);hemi.color.setRGB(lerpN(0.55,0.93,dayF),lerpN(0.62,0.96,dayF),1);
  const nf=1-dayF;for(const fm of FACMAT)fm.emissive.setRGB(nf*0.95,0.78*nf*0.95,0.48*nf*0.95);shopMat.emissive.setRGB(nf,nf*0.92,nf*0.85);
  waterU.sunDir.value.copy(u.sunDir.value);waterU.sunCol.value.copy(u.sunCol.value);waterU.skyCol.value.copy(top).lerp(hor,0.5);waterU.fogCol.value.copy(scene.fog.color);waterU.fogNear.value=scene.fog.near;waterU.fogFar.value=scene.fog.far;waterU.dayF.value=dayF;
  if(lampHeadMat){lampHeadMat.color.setRGB(lerpN(0.45,1,nf),lerpN(0.45,0.85,nf),lerpN(0.45,0.55,nf));poolMat.opacity=0.3*nf;beamMat.opacity=0.32*nf}
  if(plainMat){const w=rainF*(0.15+0.25*dayF);plainMat.specular.setRGB(w,w,w)}
  if(advance&&rainF>0.7){thunderT-=dt;if(thunderT<=0){thunderT=RR(14,40);flashT=0.15;setTimeout(()=>noise(2.6,170,0.55,1.4),RR(400,1600))}}}
const lerpN=(a,b,t)=>a+(b-a)*t;
let rainMesh,rainPos,rainN;
function buildRain(){rainN=isTouch?700:1400;rainPos=new Float32Array(rainN*6);for(let i=0;i<rainN;i++){const x=RR(-35,35),y=RR(-15,25),z=RR(-35,35);rainPos.set([x,y,z,x+0.05,y+0.75,z],i*6)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
  rainMesh=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xaebdd0,transparent:true,opacity:0,depthWrite:false}));rainMesh.frustumCulled=false;scene.add(rainMesh)}
function updateRain(dt){if(!rainMesh)return;rainMesh.visible=rainF>0.02;rainMesh.material.opacity=0.5*rainF;if(!rainMesh.visible)return;
  rainMesh.position.copy(camera.position);const fall=30*dt;
  for(let i=0;i<rainN;i++){const k=i*6;rainPos[k+1]-=fall;rainPos[k+4]-=fall;if(rainPos[k+1]<-15){const x=RR(-35,35),z=RR(-35,35),y=RR(18,25);rainPos[k]=x;rainPos[k+1]=y;rainPos[k+2]=z;rainPos[k+3]=x+0.05;rainPos[k+4]=y+0.75;rainPos[k+5]=z}}
  rainMesh.geometry.attributes.position.needsUpdate=true}
function updateNightLights(){if(!spot)return;const v=player.vehicle;if(v&&dayF<0.7&&v.type!=='tank'){const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
    spot.position.set(v.pos.x+fx*v.s.len/2,v.pos.y+1.1,v.pos.z+fz*v.s.len/2);spot.target.position.set(v.pos.x+fx*22,v.pos.y,v.pos.z+fz*22);spot.intensity=2.4*(1-dayF)}else spot.intensity=0;
  for(const f of FLAMES)f.m&&(f.m.scale.setScalar(0.22+Math.sin(time*13+f.x)*0.04))}
function clockText(){const h=Math.floor(tod),m=Math.floor((tod-h)*60);return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}${rainF>0.3?' · RAIN':dayF<0.3?' · NIGHT':''}`}
