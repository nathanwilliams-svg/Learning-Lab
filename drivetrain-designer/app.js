"use strict";
const app=document.getElementById("app");
let settings=Lab.load("driveTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,records=[];
const CART={100:{name:"Red (100 RPM)",torque:2.1},200:{name:"Green (200 RPM)",torque:1.05},600:{name:"Blue (600 RPM)",torque:0.35}};
const WHEELS={2.75:"2.75 in",3.25:"3.25 in",4:"4 in"};
const TEETH=[12,36,48,60,72,84];
const CHALLENGES=[
 {title:"Quick scorer",text:"Cross the 12-foot field in under 3 seconds while keeping at least 30 N of pushing force.",check:r=>[["Crosses the field in under 3.0 s",r.cross<3],["Pushing force at least 30 N",r.push>=30]]},
 {title:"Defense bot",text:"Win pushing matches: at least 45 N of pushing force and still move faster than 25 in/s.",check:r=>[["Pushing force at least 45 N",r.push>=45],["Speed over 25 in/s",r.real>25]]},
 {title:"Controllable speed",text:"Drivers struggle above 75 in/s. Build a drive between 50 and 75 in/s with at least 30 N of push.",check:r=>[["Speed from 50 to 75 in/s",r.real>=50&&r.real<=75],["Pushing force at least 30 N",r.push>=30]]},
 {title:"Two-motor budget",text:"Your team only has 2 motors for the drive. Cross the field in under 4.5 seconds with at least 25 N of push.",motors:2,check:r=>[["Uses 2 motors",r.motors===2],["Crosses in under 4.5 s",r.cross<4.5],["Pushing force at least 25 N",r.push>=25]]},
 {title:"Heavy lifter base",text:"Your robot weighs 18 lb with its lift. Reach at least 35 in/s with at least 60 N of push. (Hint: heavy robots need more motors.)",mass:18,lvl:2,check:r=>[["Speed at least 35 in/s",r.real>=35],["Pushing force at least 60 N",r.push>=60]]}
];
function calc(s){const ratio=s.driver/s.driven,rpm=s.cart*ratio,d=s.wheel;
  const theo=rpm*Math.PI*d/60, real=theo*0.8*Math.max(.55,1-Math.max(0,s.mass-12)*0.02);
  const r=d*0.0254/2, motorForce=s.motors*CART[s.cart].torque/ratio*0.8/r, mu=s.omni?0.6:0.9, traction=mu*s.mass*0.4536*9.8;
  const push=Math.min(motorForce,traction);
  return {ratio,rpm,theo,real,push,motorForce,traction,slip:motorForce>traction,cross:144/Math.max(real,.1),motors:s.motors,ft:real/12};}
function info(){return Lab.heading("Robotics","Robot Drive Train Designer","Choose motors, gears and wheels to plan a drivetrain before you build it. Every choice trades speed for pushing power.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>Speed versus power</h2><p><b>Wheel speed = motor RPM × (driver teeth ÷ driven teeth)</b>. Bigger wheels travel farther each turn, so they go faster but push with less force.</p><p>Gearing for speed costs pushing force, and gearing for force costs speed. Pushing force is also limited by <b>traction</b>: if the motors push harder than the wheels can grip, the wheels just spin.</p><p class="muted">Numbers are estimates for VEX V5 motors. Real robots lose some speed to weight and friction, so the tool assumes about 80% of theoretical speed.</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("driveTeacher",settings,[{k:"rounds",label:"Challenges per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
let list=[];
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l),pool=CHALLENGES.filter(c=>(c.lvl||0)<=li);list=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function next(){if(round>=list.length)return report();const ch=list[round];st={ch,cart:200,wheel:4,driver:12,driven:12,motors:ch.motors||4,mass:ch.mass||12,omni:false,guess:"",hinted:false,tested:false};
  if(level==="Beginner"){st.driver=12;st.driven=12;}draw();}
function sel(id,label,opts,val,dis){return '<label for="'+id+'">'+label+'</label><select id="'+id+'" '+(dis?"disabled":"")+'>'+opts.map(o=>'<option value="'+o[0]+'" '+(String(o[0])===String(val)?"selected":"")+'>'+o[1]+'</option>').join("")+'</select>';}
function draw(){const s=st,r=calc(s),ch=s.ch,gearsOn=level!=="Beginner",advanced=level==="Advanced";
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Challenge '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="card"><span class="eyebrow">Design brief</span><h2>'+ch.title+'</h2><p>'+ch.text+'</p></div>'+
  '<div class="split"><div class="card"><h2>Your drivetrain</h2>'+
  sel("cart","Motor cartridge",Object.keys(CART).map(k=>[k,CART[k].name]),s.cart)+
  sel("wheel","Wheel size",Object.keys(WHEELS).map(k=>[k,WHEELS[k]]),s.wheel)+
  sel("omni","Wheel type",[["0","Traction wheels (more grip)"],["1","Omni wheels (turn easily, less grip)"]],s.omni?"1":"0")+
  sel("driver","Driver gear (on motor)",TEETH.map(t=>[t,t+" teeth"]),s.driver,!gearsOn)+
  sel("driven","Driven gear (on wheel)",TEETH.map(t=>[t,t+" teeth"]),s.driven,!gearsOn)+
  (gearsOn?'':'<p class="muted small">Gears unlock at Intermediate. Beginner uses direct drive (1:1).</p>')+
  sel("motors","Drive motors",[[2,"2 motors"],[4,"4 motors"],[6,"6 motors"]],s.motors,!advanced||ch.motors)+
  sel("mass","Robot weight",[8,10,12,14,16,18,20].map(m=>[m,m+" lb"]),s.mass,!advanced||ch.mass)+
  (advanced?'':'<p class="muted small">Motor count and weight unlock at Advanced.</p>')+'</div>'+
  '<div class="card"><h2>Predict first</h2><p>Compared with a 1:1, 4-inch, green-cartridge drive, will your design be faster or stronger?</p><div class="grid">'+["Faster","Stronger","About the same"].map(x=>'<button class="option '+(s.guess===x?"selected":"")+'" data-guess="'+x+'">'+x+'</button>').join("")+'</div>'+
  '<div class="notice"><h3>Live calculations</h3><p><b>Gear ratio:</b> '+s.driver+':'+s.driven+' → wheels turn '+r.ratio.toFixed(2)+'× motor speed</p><p><b>Wheel speed:</b> '+r.rpm.toFixed(0)+' RPM</p><p><b>Top speed:</b> '+r.theo.toFixed(1)+' in/s theoretical · about <b>'+r.real.toFixed(1)+' in/s</b> on the field ('+r.ft.toFixed(1)+' ft/s)</p><p><b>Pushing force:</b> about <b>'+r.push.toFixed(0)+' N</b>'+(r.slip?' <span class="pill">limited by traction</span>':'')+'</p><p><b>12-foot field:</b> '+r.cross.toFixed(2)+' s</p></div>'+
  (r.slip?'<p class="small muted">The motors could push '+r.motorForce.toFixed(0)+' N, but the wheels only grip about '+r.traction.toFixed(0)+' N before slipping.</p>':'')+
  '<div class="diagram" aria-label="Race across the field"><div class="small muted">Field test · 12 ft</div><div style="position:relative;height:44px;background:repeating-linear-gradient(90deg,#e8eef6 0 8.33%,#dfe6f0 8.33% 16.66%);border-radius:8px;margin-top:6px"><div id="bot" style="position:absolute;left:0;top:7px;width:30px;height:30px;border-radius:7px;background:#b92430;color:#fff;display:grid;place-items:center;font-size:16px">🤖</div></div><div class="small muted" id="raceTxt">Press Field test to watch it cross.</div></div>'+
  '<div class="row" style="margin-top:12px"><button id="race">▶️ Field test</button>'+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+'<button class="primary" id="submit" '+(s.guess?"":"disabled")+'>Submit design</button></div>'+
  (s.hinted?'<div class="warning">'+hint(s,r)+'</div>':'')+'</div></div>';
  ["cart","wheel","driver","driven","motors","mass"].forEach(k=>{const e=document.getElementById(k);e.onchange=()=>{s[k]=+e.value;draw();};});
  document.getElementById("omni").onchange=e=>{s.omni=e.target.value==="1";draw();};
  app.querySelectorAll("[data-guess]").forEach(b=>b.onclick=()=>{s.guess=b.dataset.guess;draw();});
  document.getElementById("race").onclick=()=>race(r);
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  document.getElementById("submit").onclick=submit;}
function hint(s,r){const c=s.ch.check(r).find(x=>!x[1]);if(!c)return"Your design already meets every goal. Can you make it even more balanced?";
  if(/push/i.test(c[0]))return r.slip?"You are traction-limited. More motors won't help; try traction wheels or a heavier robot.":"Need more push? Use a slower cartridge, a smaller wheel, or a smaller driver gear driving a bigger driven gear.";
  return"Need more speed? Use a faster cartridge, a bigger wheel, or a bigger driver gear driving a smaller driven gear.";}
function race(r){const bot=document.getElementById("bot"),txt=document.getElementById("raceTxt");const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur=Math.min(r.cross,8);bot.style.transition="none";bot.style.left="0";void bot.offsetWidth;bot.style.transition=reduce?"none":"left "+dur+"s linear";bot.style.left="calc(100% - 30px)";
  txt.textContent="Crossing time: "+r.cross.toFixed(2)+" s"+(r.cross>8?" (shown sped up)":"");}
function submit(){const s=st,r=calc(s),checks=s.ch.check(r),met=checks.filter(c=>c[1]).length;
  const base={cart:200,wheel:4,driver:12,driven:12,motors:s.motors,mass:s.mass,omni:false},b=calc(base);
  const actual=r.real>b.real*1.1?"Faster":r.push>b.push*1.1?"Stronger":"About the same";
  const pred=s.guess===actual||(s.guess==="Faster"&&r.real>b.real*1.1)||(s.guess==="Stronger"&&r.push>b.push*1.1);
  const earned=Math.round(8*met/checks.length)+(pred?2:0)-(s.hinted?1:0);points+=Math.max(0,earned);maxPoints+=10;records.push([s.ch.title,met===checks.length]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Design review</span><h2>'+s.ch.title+'</h2>'+checks.map(c=>'<p>'+(c[1]?"✅ ":"❌ ")+c[0]+'</p>').join("")+
  '<p><b>Your design:</b> '+r.real.toFixed(1)+' in/s, '+r.push.toFixed(0)+' N push, '+r.cross.toFixed(2)+' s across the field.</p><p><b>Prediction:</b> you said "'+s.guess+'". Compared with the basic drive ('+b.real.toFixed(0)+' in/s, '+b.push.toFixed(0)+' N), yours is <b>'+actual.toLowerCase()+'</b>. '+(pred?"Nice reasoning!":"Think about which choices traded speed for force.")+'</p>'+
  '<p class="muted">Engineering note: there is no single best drivetrain. Each choice is a trade-off between speed, pushing power and control.</p><p><b>+'+Math.max(0,earned)+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next challenge":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("Drivetrain design report · "+level,points,maxPoints,"You fully met "+records.filter(r=>r[1]).length+" of "+records.length+" design briefs. "+records.map(r=>(r[1]?"✅ ":"🔧 ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
