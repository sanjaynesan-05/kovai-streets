/* Kovai Streets: voice.js
 * Plays recorded dialogue listed in assets/voice/manifest.json ({"ta":{"<lineId>":"<file>"}, "en":{...}}).
 * Tamil is the default voice language; English can be chosen in Settings. A line with no recording in the chosen
 * language plays as subtitles only. Recordings can be added or replaced later without code changes.
 * Classic script, loaded after progression.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

if(SET.voice!=='en')SET.voice='ta';                              // voice language: 'ta' (default) or 'en'
if(!['both','ta','en'].includes(SET.subs))SET.subs='both';       // subtitles: Tamil + small English, Tamil only, English only
if(typeof SET.dialog!=='number')SET.dialog=1;                    // dialogue volume (multiplied by master volume)
const VOICE={files:{ta:{},en:{}},el:null};
fetch('assets/voice/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(m=>{if(m){VOICE.files.ta=m.ta||{};VOICE.files.en=m.en||{}}}).catch(()=>{});
function voiceFile(id){const lang=SET.voice==='en'?'en':'ta',f=VOICE.files[lang][id];return f?`assets/voice/${lang}/${f}`:null}
/* Play a line's recording. onLength(seconds) is called once its length is known. Returns false if there is no recording. */
function playVoice(id,onLength){stopVoice();const src=voiceFile(id);if(!src)return false;const a=new Audio(src);a.volume=clamp(SET.vol*SET.dialog,0,1);VOICE.el=a;
  a.addEventListener('loadedmetadata',()=>{if(VOICE.el===a&&onLength&&isFinite(a.duration))onLength(a.duration)});
  const done=()=>{if(VOICE.el===a)VOICE.el=null};a.addEventListener('ended',done);a.addEventListener('error',done);a.play().catch(done);return true}
function stopVoice(){if(VOICE.el){VOICE.el.pause();VOICE.el=null}}
function pauseVoice(){if(VOICE.el)VOICE.el.pause()}
function resumeVoice(){const a=VOICE.el;if(a&&a.paused&&!a.ended)a.play().catch(()=>{})}
function voiceActive(){return!!VOICE.el&&!VOICE.el.paused}
/* Subtitle text for a line, following the subtitle setting. Tamil is the main line; English sits under it in smaller type. */
function lineHTML(L){const ta=SET.subs!=='en',en=SET.subs!=='ta';return(ta?`<span class="ta">${esc(L.ta)}</span>`:'')+(en?`<span class="en${ta?'':' main'}">${esc(L.en)}</span>`:'')}
function whoText(L){return SET.subs==='en'?L.who:L.whoTa}
/* settings helpers used by the main menu and the pause menu */
function subsLabel(){return SET.subs==='ta'?'TAMIL ONLY':SET.subs==='en'?'ENGLISH ONLY':'TAMIL + ENGLISH'}
function cycleSubs(){SET.subs=SET.subs==='both'?'ta':SET.subs==='ta'?'en':'both';saveSettings()}
function toggleVoiceLang(){SET.voice=SET.voice==='en'?'ta':'en';saveSettings()}
