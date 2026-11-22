/* Kovai Streets: audio.js
 * Audio engine: master bus, engines, effects, sirens, gunshots, radio, ambience
 * Classic script, loaded in order by index.html (13 of 17). Shares top-level declarations with the other game scripts.
 */
'use strict';

let OUT=null,RADIO_G=null,engLfo=null,engLfoG=null;

/* ================= audio ================= */
let AC=null,engOsc=null,engGain=null,engFilt=null,sirOsc=null,sirGain=null,sirLfo=null;const nbuf={};
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null;return}OUT=AC.createGain();OUT.gain.value=SET.vol;OUT.connect(AC.destination);RADIO_G=AC.createGain();RADIO_G.gain.value=0;RADIO_G.connect(OUT);
  engOsc=AC.createOscillator();engOsc.type='sawtooth';engFilt=AC.createBiquadFilter();engFilt.type='lowpass';engFilt.frequency.value=400;engGain=AC.createGain();engGain.gain.value=0;
  engOsc.connect(engFilt);engFilt.connect(engGain);engGain.connect(OUT);engOsc.start();engLfo=AC.createOscillator();engLfo.frequency.value=10;engLfoG=AC.createGain();engLfoG.gain.value=0;engLfo.connect(engLfoG);engLfoG.connect(engGain.gain);engLfo.start();
  sirOsc=AC.createOscillator();sirOsc.type='triangle';sirOsc.frequency.value=800;sirLfo=AC.createOscillator();sirLfo.frequency.value=1.6;const lg=AC.createGain();lg.gain.value=180;sirLfo.connect(lg);lg.connect(sirOsc.frequency);
  sirGain=AC.createGain();sirGain.gain.value=0;sirOsc.connect(sirGain);sirGain.connect(OUT);sirOsc.start();sirLfo.start();
  {const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const src=AC.createBufferSource();src.buffer=b;src.loop=true;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=900;rainGain=AC.createGain();rainGain.gain.value=0;src.connect(f);f.connect(rainGain);rainGain.connect(OUT);src.start()}}
let rainGain=null;
function noise(dur,freq,vol,decay){if(!AC||vol<=0.01)return;const key=dur+'_'+decay;let b=nbuf[key];
  if(!b){const n=Math.floor(AC.sampleRate*dur);b=AC.createBuffer(1,n,AC.sampleRate);const d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay);nbuf[key]=b}
  const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;const g=AC.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(OUT);s.start()}
let hornCD=0;
function horn(vol){if(!AC)return;const t=AC.currentTime;[392,494].forEach(fq=>{const o=AC.createOscillator();o.type='square';o.frequency.value=fq;const g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.05*vol,t+0.02);g.gain.setValueAtTime(0.05*vol,t+0.3);g.gain.exponentialRampToValueAtTime(0.0001,t+0.38);o.connect(g);g.connect(OUT);o.start(t);o.stop(t+0.4)})}
function hornAt(p){const P=playerP();const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<50&&hornCD<=0){hornCD=1.5;horn(clamp(1-d/50,0.2,1))}}
function updateAudio(){if(!AC)return;const v=player.vehicle;const t=AC.currentTime;
  if(v&&!paused&&!v.s.cycle&&!v.wrecked){const E=engineFor(v);if(engOsc.type!==E.w)engOsc.type=E.w;const sp=Math.abs(v.speed),gear=E.gears?((sp/v.s.max*E.gears)%1):sp/v.s.max;engGain.gain.setTargetAtTime(E.vol,t,0.1);engOsc.frequency.setTargetAtTime(E.base+gear*E.rev+sp*E.k,t,0.06);engFilt.frequency.setTargetAtTime(E.f+sp*E.fk,t,0.1);if(engLfoG){engLfo.frequency.setTargetAtTime(E.lfo+sp*0.3,t,0.1);engLfoG.gain.setTargetAtTime(E.lfoD*E.vol,t,0.1)}}
  else{engGain.gain.setTargetAtTime(0,t,0.1);if(engLfoG)engLfoG.gain.setTargetAtTime(0,t,0.1)}
  let near=1e9;const P=playerP();for(const c of vehicles)if(c.policeAI&&!c.policeAI.leaving){const d=Math.hypot(c.pos.x-P.x,c.pos.z-P.z);if(d<near)near=d}
  sirGain.gain.setTargetAtTime(paused?0:0.045*clamp(1-near/180,0,1),t,0.2);if(rainGain)rainGain.gain.setTargetAtTime(paused?0:0.12*rainF,t,0.3)}


/* ---------- sound: guns, engines, radio, ambience ---------- */
const GSND={pistol:[160,0.18,2600,0.5],revolver:[110,0.32,1900,0.7],smg:[190,0.09,3200,0.32],shotgun:[70,0.45,1300,0.8],rifle:[130,0.16,2400,0.5],sniper:[60,0.6,1700,0.75],minigun:[200,0.07,2800,0.26],rocket:[50,0.5,700,0.6],enemy:[150,0.15,2100,0.4]};
function gunSound(id,vol){if(!AC||!OUT||vol<=0.01)return;const p=GSND[id]||GSND.pistol,t=AC.currentTime;
  const o=AC.createOscillator();o.frequency.setValueAtTime(p[0]*1.8,t);o.frequency.exponentialRampToValueAtTime(p[0]*0.5,t+p[1]);const g=AC.createGain();g.gain.setValueAtTime(0.35*vol*p[3],t);g.gain.exponentialRampToValueAtTime(0.0001,t+p[1]);o.connect(g);g.connect(OUT);o.start(t);o.stop(t+p[1]+0.02);
  noise(p[1]*1.2,p[2],p[3]*vol,3);if(id==='sniper'||id==='shotgun'||id==='revolver')noise(0.6,600,0.12*vol,1.5)}
const ENG={two:{w:'square',base:70,rev:90,k:1.2,vol:0.025,f:900,fk:40,gears:4,lfo:18,lfoD:0.5},auto:{w:'square',base:48,rev:30,k:1.0,vol:0.03,f:500,fk:30,gears:3,lfo:9,lfoD:0.8},
  heavy:{w:'sawtooth',base:32,rev:22,k:0.8,vol:0.05,f:320,fk:12,gears:5,lfo:5,lfoD:0.3},car:{w:'sawtooth',base:42,rev:55,k:0.9,vol:0.032,f:380,fk:22,gears:5,lfo:0,lfoD:0},
  sport:{w:'sawtooth',base:55,rev:110,k:1.2,vol:0.04,f:700,fk:35,gears:6,lfo:0,lfoD:0},tank:{w:'sawtooth',base:28,rev:15,k:0.6,vol:0.06,f:260,fk:8,gears:0,lfo:7,lfoD:0.5},
  boat:{w:'triangle',base:45,rev:60,k:1.5,vol:0.04,f:500,fk:20,gears:0,lfo:14,lfoD:0.3}};
function engineFor(v){const t=v.type;return v.s.boat?ENG.boat:t==='tank'?ENG.tank:v.s.two?ENG.two:t==='auto'||t==='turbo'?ENG.auto:t==='bus'||t==='lorry'||t==='tempo'?ENG.heavy:t==='sport'||t==='sports'?ENG.sport:ENG.car}
const hz=n=>440*Math.pow(2,(n-69)/12);
function tone(f,t,dur,type,vol,dest,att,flt){const o=AC.createOscillator();o.type=type;o.frequency.value=f;const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(att||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+Math.max(dur,(att||0.01)+0.02));
  let n=o;if(flt){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=flt;o.connect(fl);n=fl}n.connect(g);g.connect(dest||RADIO_G);o.start(t);o.stop(t+dur+0.05)}
function kick(t,vol){const o=AC.createOscillator();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+0.12);const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.25);o.connect(g);g.connect(RADIO_G);o.start(t);o.stop(t+0.3)}
let nzBuf=null;
function nz(t,dur,freq,vol,type,dest){if(!nzBuf){const n=AC.sampleRate;nzBuf=AC.createBuffer(1,n,n);const d=nzBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}
  const s=AC.createBufferSource();s.buffer=nzBuf;const f=AC.createBiquadFilter();f.type=type||'highpass';f.frequency.value=freq;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest||RADIO_G);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02)}
const STATIONS=[{n:'Radio off'},{n:'Kovai FM 91.4 · Carnatic fusion',bpm:96},{n:'Coast Beats 98.3 · Dance',bpm:122},{n:'Ghat Lo-fi 102.7 · Chill',bpm:78}];
let radioSt=1,radioStep=0,radioNextT=0,radioWas=false;const RS={mel:3};const RAGA=[0,1,4,5,7,8,11];
function radioNext(){radioSt=(radioSt+1)%STATIONS.length;SET.station=radioSt;saveSettings();floatMsg('📻 '+STATIONS[radioSt].n);radioNextT=0}
function playStep(st,i,t,sd){const s=i%16,bar=Math.floor(i/16);
  if(st===1){const root=50;if(s===0){tone(hz(root),t,sd*16,'sawtooth',0.03,RADIO_G,0.3,700);tone(hz(root+7),t,sd*16,'sawtooth',0.02,RADIO_G,0.3,700);tone(hz(root-12),t,sd*16,'triangle',0.05,RADIO_G,0.3)}
    if(s%2===0&&Math.random()<0.75){RS.mel=clamp(RS.mel+rpick([-2,-1,-1,1,1,2,0]),0,13);const deg=RS.mel%7,oct=Math.floor(RS.mel/7);tone(hz(root+12+RAGA[deg]+12*oct),t,sd*(Math.random()<0.3?4:2.2),'triangle',0.06,RADIO_G,0.02,2400)}
    if(s===0||s===6||s===10)kick(t,0.25);if(s===4||s===12||s===14)nz(t,0.08,1800,0.12,'bandpass');if(s===2||s===8)tone(620,t,0.06,'sine',0.06)}
  else if(st===2){const prog=[[45,[57,60,64]],[41,[53,57,60]],[48,[55,60,64]],[43,[55,59,62]]],[b,ch]=prog[bar%4];
    if(s%4===0)kick(t,0.35);if(s%4===2)nz(t,0.04,7000,0.06);if(s%8===4)nz(t,0.12,1500,0.12,'bandpass');
    if(s%4===2||s===15)tone(hz(b),t,sd*1.6,'sawtooth',0.07,RADIO_G,0.01,450);if(s%2===0)tone(hz(ch[(s/2)%3]+12),t,sd*1.2,'square',0.018,RADIO_G,0.005,2200)}
  else if(st===3){const prog=[[38,[53,57,60,64]],[43,[53,57,59,62]],[36,[52,55,59,64]],[45,[55,60,64,67]]],[b,ch]=prog[bar%4];
    if(s===0)for(const n of ch)tone(hz(n),t,sd*15,'triangle',0.025,RADIO_G,0.25,1100);if(s===0||s===10)tone(hz(b),t,sd*5,'sine',0.09,RADIO_G,0.02);
    if(s===0||s===7||s===10)kick(t,0.22);if(s===4||s===12)nz(t,0.14,1200,0.07,'bandpass');if(s%2===0)nz(t,0.03,6000,0.025);if(Math.random()<0.3)nz(t,0.02,3000,0.015);
    if(s%4===2&&Math.random()<0.5)tone(hz(rpick(ch)+12),t,sd*3,'sine',0.03,RADIO_G,0.02)}}
function updateRadio(){if(!AC||!RADIO_G)return;const v=player.vehicle,on=!!v&&radioSt>0&&!v.s.cycle&&!player.dead,t=AC.currentTime;
  if(on&&!radioWas)floatMsg('📻 '+STATIONS[radioSt].n+(isTouch?' · tap RADIO to change':' · press N to change'));radioWas=on;
  RADIO_G.gain.setTargetAtTime(on?SET.radio*0.6*(voiceActive()?0.3:1):0,t,0.3)   /* radio dips while someone speaks */;if(!on){radioNextT=0;return}
  const sd=60/STATIONS[radioSt].bpm/4;if(radioNextT<t)radioNextT=t+0.05;while(radioNextT<t+0.25){playStep(radioSt,radioStep,radioNextT,sd);radioStep++;radioNextT+=sd}}
let amb=null;
function initAmbience(){const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){last=(last+0.02*(Math.random()*2-1))/1.02;d[i]=last*3.5}
  const mk2=(type,freq,off)=>{const s=AC.createBufferSource();s.buffer=b;s.loop=true;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(OUT);s.start(0,off);return g};
  amb={city:mk2('lowpass',700,0),sea:mk2('bandpass',500,0.7),hornT:3,birdT:2}}
function updateAmbience(dt){if(!AC||!OUT)return;if(!amb)initAmbience();const t=AC.currentTime,P=playerP();
  const inCity=Math.abs(P.x)<LIM+20&&Math.abs(P.z)<LIM+20?1:0.25,hills=P.x<-552?1:0,coast=clamp((P.x-560)/80,0,1);
  amb.city.gain.setTargetAtTime(0.05*inCity*(1-hills)*(1-coast*0.8)*(0.6+0.4*dayF),t,0.5);amb.sea.gain.setTargetAtTime(coast*0.09*(0.6+0.4*Math.sin(time*0.6)),t,0.3);
  amb.hornT-=dt;if(amb.hornT<=0){amb.hornT=RR(2,7);if(inCity>0.5&&!hills){const vv=RR(0.006,0.016)*(0.5+dayF*0.5),dur=RR(0.25,0.5);for(const f of rpick([[392,494],[440,554],[330,415]]))tone(f,t+0.02,dur,'square',vv,OUT,0.02,1600)}}
  amb.birdT-=dt;if(amb.birdT<=0){amb.birdT=RR(0.8,3.5);if((hills||inCity<1||coast>0.3)&&dayF>0.4)for(let k=0;k<RI(2,4);k++){const st=t+0.01+k*0.13,o=AC.createOscillator();o.frequency.setValueAtTime(RR(2600,3400),st);o.frequency.exponentialRampToValueAtTime(RR(3600,4400),st+0.07);
    const g=AC.createGain();g.gain.setValueAtTime(0.0001,st);g.gain.exponentialRampToValueAtTime(0.015,st+0.02);g.gain.exponentialRampToValueAtTime(0.0001,st+0.09);o.connect(g);g.connect(OUT);o.start(st);o.stop(st+0.1)}}}
