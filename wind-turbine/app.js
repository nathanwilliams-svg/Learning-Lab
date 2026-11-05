"use strict";
const app=document.getElementById("app");
let settings=Lab.load("windTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[];
const CPMAX={2:0.30,3:0.34,4:0.33,6:0.28},TSR={2:7,3:5,4:4,6:3};
const FANS=[[1.5,"Gentle breeze (1.5 m/s)"],[2,"Low fan (2 m/s)"],[3.5,"Medium fan (3.5 m/s)"],[5,"High fan (5 m/s)"],[7,"Windy day (7 m/s)"]];
const CH=[
 {title:"Light the LED",text:"Make at least 50 mW on the low fan (2 m/s) to light an LED.",v:2,check:r=>[["At least 50 mW at 2 m/s",r.P>=50]]},
 {title:"Science fair demo",text:"Make at least 300 mW on the medium fan (3.5 m/s).",v:3.5,check:r=>[["At least 300 mW at 3.5 m/s",r.P>=300]]},
 {title:"Gentle breeze starter",text:"Your turbine must start spinning in a gentle 1.5 m/s breeze and make at least 15 mW there.",v:1.5,lvl:1,check:r=>[["Starts at 1.5 m/s",r.spins],["At least 15 mW at 1.5 m/s",r.P>=15]]},
 {title:"Maximum power",text:"Produce at least 1,200 mW on the high fan (5 m/s).",v:5,lvl:1,check:r=>[["At least 1,200 mW at 5 m/s",r.P>=1200]]},
 {title:"Quiet and safe",text:"Fast blade tips are loud. On the high fan (5 m/s), keep the tip speed at or below 20 m/s and still make at least 800 mW.",v:5,lvl:2,check:r=>[["Tip speed 20 m/s or less",r.tip<=20],["At least 800 mW at 5 m/s",r.P>=800]]}
];
function model(s,v){const r=s.len/100,A=Math.PI*r*r,cp=CPMAX[s.blades]*Math.exp(-Math.pow((s.pitch-15)/12,2));
  const vStart=1.6*Math.sqrt(3/s.blades)*(1+1.2*Math.pow(Math.max(0,20-s.pitch)/20,2))/Math.sqrt(r/0.15);
  const spins=v>=vStart&&cp>0.02,P=spins?0.5*1.2*A*v*v*v*cp*0.6*1000:0,lam=TSR[s.blades]*Math.min(1,0.4+s.pitch/25)*(s.pitch>30?Math.max(.3,1-(s.pitch-30)/30):1),
  rpm=spins?lam*v/(2*Math.PI*r)*60:0,tip=spins?lam*v:0;return{P,spins,vStart,cp,rpm,tip,A};}
function info(){return Lab.heading("Engineering & Design","Wind Turbine Design Lab","Design turbine blades, test them in front of a fan, and graph how your choices change the power output.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>Catching the wind</h2><p>Wind carries kinetic energy. Your blades turn some of it into rotation, and a small generator turns rotation into electrical power.</p><p><b>Longer blades</b> sweep a bigger area and catch more wind. The <b>pitch angle</b> (how much the blades are tilted) changes how well they grab the air. <b>More blades</b> start more easily but add drag.</p><p class="muted">Power doubles when blade area doubles, but it grows 8 times when wind speed doubles. No turbine can capture more than about 59% of the wind’s energy (the Betz limit).</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("windTeacher",settings,[{k:"rounds",label:"Challenges per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);const pool=CH.filter(c=>(c.lvl||0)<=li);list=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function next(){if(round>=list.length)return report();st={ch:list[round],blades:3,pitch:0,len:15,fan:list[round].v,guess:"",tested:false,hinted:false};draw();}
function rotor(s,r){const n=s.blades,len=40+s.len*2.2;let b="";for(let i=0;i<n;i++){const a=360/n*i;b+='<g transform="rotate('+a+')"><path d="M0 -4 C '+(len*0.3)+' -10, '+(len*0.8)+' -'+(6+s.pitch/6)+', '+len+' -3 L '+len+' 3 C '+(len*0.8)+' 6, '+(len*0.3)+' 6, 0 4 Z" fill="#b92430" opacity=".9"/></g>';}
  const dur=r.rpm>0?Math.max(0.25,Math.min(6,600/r.rpm)):0;
  return '<svg viewBox="-110 -110 220 300" width="210" style="display:block;margin:auto;max-width:100%"><rect x="-4" y="0" width="8" height="180" fill="#8a99ad"/><g style="transform-origin:0 0;'+(dur?"animation:spin "+dur+"s linear infinite":"")+'">'+b+'</g><circle r="9" fill="#1b2a42"/><text x="0" y="200" text-anchor="middle" font-size="13" fill="#51627b">'+(r.rpm?Math.round(r.rpm)+" RPM":"not spinning")+'</text></svg>';}
function curve(s){const pts=[];for(let v=0;v<=7.01;v+=0.25)pts.push([v,model(s,v).P]);return pts;}
function draw(){const s=st,ch=s.ch,r=model(s,s.fan),lvl=["Beginner","Intermediate","Advanced"].indexOf(level);
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Challenge '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="card"><span class="eyebrow">Design brief</span><h2>'+ch.title+'</h2><p>'+ch.text+'</p></div>'+
  '<div class="split"><div class="card"><h2>Blade design</h2><label for="blades">Number of blades</label><select id="blades">'+[2,3,4,6].map(n=>'<option '+(n===s.blades?"selected":"")+'>'+n+'</option>').join("")+'</select>'+
  '<label for="pitch">Pitch angle: <b id="pv">'+s.pitch+'°</b></label><input type="range" id="pitch" min="0" max="45" step="5" value="'+s.pitch+'" style="width:100%;accent-color:#b92430">'+
  '<label for="len">Blade length</label><select id="len" '+(lvl<1?"disabled":"")+'>'+[10,15,20].map(n=>'<option value="'+n+'" '+(n===s.len?"selected":"")+'>'+n+' cm</option>').join("")+'</select>'+(lvl<1?'<p class="muted small">Blade length unlocks at Intermediate.</p>':'')+
  '<label for="fan">Test wind</label><select id="fan">'+FANS.map(f=>'<option value="'+f[0]+'" '+(f[0]===s.fan?"selected":"")+'>'+f[1]+'</option>').join("")+'</select>'+
  '<div class="diagram" style="margin-top:12px">'+rotor(s,r)+'</div></div>'+
  '<div class="card"><h2>Predict, then test</h2><p>Will this design meet the goal?</p><div class="grid">'+["Yes","No"].map(x=>'<button class="option '+(s.guess===x?"selected":"")+'" data-g="'+x+'">'+x+'</button>').join("")+'</div>'+
  '<div class="row" style="margin-top:10px"><button class="primary" id="test" '+(s.guess?"":"disabled")+'>🌬️ Test in the wind tunnel</button>'+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+'</div>'+(s.hinted?'<div class="warning">'+hint(s)+'</div>':'')+
  (s.tested?'<div class="notice"><p><b>Power at '+s.fan+' m/s:</b> '+r.P.toFixed(0)+' mW</p><p><b>Starts spinning at:</b> '+r.vStart.toFixed(1)+' m/s</p><p><b>Rotor:</b> '+Math.round(r.rpm)+' RPM · tip speed '+r.tip.toFixed(1)+' m/s</p></div><div class="diagram">'+MiniChart({series:[{name:"Power",color:"#b92430",points:curve(s)}],xLabel:"Wind speed (m/s)",yLabel:"Power (mW)",xMax:7,yMin:0,marks:[{x:ch.v,label:"goal wind"}]})+'</div><button class="primary" id="submit">Submit design</button>':'<p class="muted" style="margin-top:12px">Change one thing at a time and test again to see what it does.</p>')+'</div></div>';
  document.getElementById("blades").onchange=e=>{s.blades=+e.target.value;s.tested=false;draw();};
  document.getElementById("pitch").oninput=e=>{document.getElementById("pv").textContent=e.target.value+"°";};
  document.getElementById("pitch").onchange=e=>{s.pitch=+e.target.value;s.tested=false;draw();};
  document.getElementById("len").onchange=e=>{s.len=+e.target.value;s.tested=false;draw();};
  document.getElementById("fan").onchange=e=>{s.fan=+e.target.value;s.tested=false;draw();};
  app.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{s.guess=b.dataset.g;draw();});
  document.getElementById("test").onclick=()=>{s.tested=true;draw();};
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  const sb=document.getElementById("submit");if(sb)sb.onclick=submit;}
function hint(s){if(s.pitch<10)return"Flat blades (0°) barely catch the wind. Try a pitch between 10° and 25°.";if(s.pitch>30)return"Steep blades act like a brake. Try a pitch closer to 15°.";
  if(s.ch.title==="Quiet and safe")return"Tip speed grows with fewer, faster blades. More blades turn slower, and longer blades catch more wind.";
  if(s.len<20&&level!=="Beginner")return"Longer blades sweep a much bigger area. Area grows with the square of blade length.";return"Compare 2, 3, 4 and 6 blades at the same pitch. Which gives the most power?";}
function submit(){const s=st,r=model(s,s.ch.v),checks=s.ch.check(r),met=checks.every(c=>c[1]),predOk=(s.guess==="Yes")===met;
  const earned=Math.round(7*checks.filter(c=>c[1]).length/checks.length)+(predOk?2:0)+(s.hinted?0:1);points+=earned;maxPoints+=10;records.push([s.ch.title,met]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Wind tunnel results</span><h2>'+(met?"✅ ":"🔧 ")+s.ch.title+'</h2>'+checks.map(c=>'<p>'+(c[1]?"✅ ":"❌ ")+c[0]+'</p>').join("")+
  '<p><b>Your design:</b> '+s.blades+' blades, '+s.pitch+'° pitch, '+s.len+' cm blades → '+r.P.toFixed(0)+' mW at '+s.ch.v+' m/s.</p><p>You predicted “'+s.guess+'”, which was '+(predOk?"right.":"not quite.")+'</p>'+
  '<p class="muted">Real engineers test many prototypes. Small pitch changes often matter more than adding blades.</p><p><b>+'+earned+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next challenge":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("Wind turbine report · "+level,points,maxPoints,"You met "+records.filter(r=>r[1]).length+" of "+records.length+" design goals. "+records.map(r=>(r[1]?"✅ ":"🔧 ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
