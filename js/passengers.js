/* Kovai Streets: passengers.js
 * Passengers riding with the player: companion friends and fare customers.
 * On two-wheelers the passenger sits on the pillion and stays visible for the whole ride; in enclosed vehicles
 * (cars, autos, buses, boats, the tank) passengers ride hidden inside. Boarding, seat limits and getting off all go
 * through boardPassenger / alightPassenger so a passenger's normal on-foot state is always restored.
 * Classic script, loaded after missions.js. Shares top-level declarations with the other game scripts.
 */
'use strict';

const _pe=new THREE.Euler(0,0,0,'YXZ'),_po=new THREE.Vector3();
function farePassenger(){if(!mission)return null;if(mission.type==='fare')return mission.ped&&!mission.ped.dead?mission.ped:null;const e=mission.escort;return e&&!e.dead&&e.follow!==false?e:null}   // fare customer, or a story escort (e.g. Selvi Akka)
function isFriend(o){return FRIENDS.includes(o)}
function ridersOf(v){const a=[],fp=farePassenger();if(fp&&fp.inV===v)a.push(fp);for(const f of FRIENDS)if(f.inCar&&f.inV===v)a.push(f);return a}
function seatFree(v){return ridersOf(v).length<seatsOf(v).n}
function boardPassenger(o,v){o.inV=v;if(isFriend(o))o.inCar=true;o.moving=false;placeRider(o,v)}
function alightPassenger(o){const v=o.inV,h=o.h;o.inV=null;if(isFriend(o))o.inCar=false;
  h.g.rotation.set(0,v?v.heading:(o.yaw||0),0);h.g.visible=true;h.armL.rotation.z=h.armR.rotation.z=0;if(h.gun)h.gun.visible=!!o.armed;
  if(v){const fx=Math.sin(v.heading),fz=Math.cos(v.heading),side=v.s.w/2+0.9;_pp.x=v.pos.x-fz*side;_pp.z=v.pos.z+fx*side;pushCircle(_pp,0.4);o.x=_pp.x;o.z=_pp.z;o.yaw=v.heading}}
/* Draw a passenger on their seat. Visible seats follow the vehicle's heading, lean and slope; the passenger sits
   with the seated pose and holds the rider's waist. Hidden seats keep the character out of view. */
function placeRider(o,v,seat){const h=o.h;seat=seat||seatsOf(v);o.x=v.pos.x;o.z=v.pos.z;if(!seat.visible){h.g.visible=false;return}
  const r=v.mesh.rotation;_pe.set(r.x,v.heading,r.z,'YXZ');_po.set(0,seat.p.y,seat.p.z).applyEuler(_pe);
  h.g.visible=true;h.g.position.set(v.mesh.position.x+_po.x,v.mesh.position.y+_po.y,v.mesh.position.z+_po.z);h.g.rotation.set(r.x,v.heading,r.z);
  seatPose(h);h.armL.rotation.x=h.armR.rotation.x=-0.62;h.armL.rotation.z=0.18;h.armR.rotation.z=-0.18;if(h.gun)h.gun.visible=false}
function updatePassengers(dt){const pv=player.vehicle,p=farePassenger();
  if(p){if(p.inV&&p.inV!==pv)alightPassenger(p);
    if(pv&&!p.inV){const d=Math.hypot(p.x-pv.pos.x,p.z-pv.pos.z);
      if(!seatFree(pv)){const f=FRIENDS.find(f=>f.inCar&&f.inV===pv);if(f)alightPassenger(f)}   // the paying customer gets the seat
      if(seatFree(pv)&&(d<8||d>80))boardPassenger(p,pv);else if(d>2.5)walkTo(p,pv.pos.x,pv.pos.z,d>10?6:4.5,dt);else p.moving=false}
    if(!pv){const tx=player.pos.x-Math.sin(player.yaw)*1.6,tz=player.pos.z-Math.cos(player.yaw)*1.6,d=Math.hypot(tx-p.x,tz-p.z);   // walk with the player
      if(d>60){p.x=tx;p.z=tz}else if(d>1)walkTo(p,tx,tz,d>8?7:4.3,dt);else p.moving=false}
    if(!p.inV){const h=p.h;h.g.visible=true;p.phase+=p.moving?dt*(p.spd||4)*2.4:0;h.g.position.set(p.x,(p.y=humanY(p.x,p.z,p.y||0)),p.z);h.g.rotation.set(0,p.yaw,0);animHuman(h,p.phase,p.moving?0.9:0,false)}}
  if(pv){const seat=seatsOf(pv);for(const o of ridersOf(pv))placeRider(o,pv,seat)}}
