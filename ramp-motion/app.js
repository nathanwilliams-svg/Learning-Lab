"use strict";
const app=document.getElementById("app");
let settings=Lab.load("rampTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[],raf=0;
const G=9.8,L=1.0;
const SURF={wood:{name:"Wood",cr:0.04},carpet:{name:"Carpet",cr:0.12},plastic:{name:"Smooth plastic",cr:0.025}};
const Q=[
 {q:"How does ramp height affect the car’s speed at the bottom of the ramp?",vary:"h",opts:["Higher ramp → faster at the bottom","Higher ramp → slower at the bottom","Height doesn’t change the speed"],ans:0,why:"A higher ramp turns more gravitational potential energy into kinetic energy, so the car is moving faster at the bottom."},
 {q:"Does a heavier car reach a higher speed at the bottom of the ramp?",vary:"m",opts:["Yes, heavier cars are faster","No, mass makes almost no difference","Heavier cars are much slower"],ans:1,why:"Gravity pulls harder on a heavier car, but it also takes more force to speed up more mass. The two effects cancel, just like dropped objects falling together."},
 {q:"Which floor surface lets the car roll the farthest?",vary:"surf",opts:["Carpet","Wood","Smooth plastic"],ans:2,why:"Smooth plastic has the least rolling friction, so the car loses its kinetic energy most slowly and rolls farthest."},
 {q:"What happens to the car’s speed while it rolls across the floor?",vary:"any",opts:["It speeds up","It stays the same","It slows down steadily"],ans:2,why:"On the flat floor, friction is the only horizontal force, and it acts against the motion, so the car slows down steadily until it stops.",graph:true},
 {q:"If you double the ramp height, does the speed at the bottom double?",vary:"h",opts:["Yes, it doubles","No, it increases by less than double","No, it stays the same"],ans:1,why:"Kinetic energy depends on speed squared. Doubling the height doubles the energy, which raises the speed by about 1.4 times (√2), not 2 times.",lvl:2}
];
function sim(s){const th=Math.asin(s.h/100/L),cr=SURF[s.surf].cr,a=G*(Math.sin(th)-cr*Math.cos(th));
  if(a<=0)return{stuck:true,v:0,a:0,t1:0,t2:0,dist:0};
  const v=Math.sqrt(2*a*L),t1=v/a,dec=cr*G,t2=v/dec,dist=v*v/(2*dec);return{v,a,t1,t2,dist,dec};}
function info(){return Lab.heading("Physical Science","Virtual Ramp & Motion Lab","Release a toy car down a ramp, measure its motion, and use controlled experiments to answer questions about forces.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>Energy and friction</h2><p>At the top of the ramp, the car has <b>gravitational potential energy</b>. As it rolls down, that energy becomes <b>kinetic energy</b> (motion). On the floor, <b>friction</b> slowly takes that energy away until the car stops.</p><p>To answer each question, run at least two tests that change <b>only one variable</b>, then compare the data.</p><p class="muted">The model uses a 1-meter ramp and real rolling-friction estimates for a toy car.</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("rampTeacher",settings,[{k:"rounds",label:"Questions per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);const pool=Q.filter(q=>(q.lvl||0)<=li);list=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function next(){if(round>=list.length)return report();st={q:list[round],h:20,m:100,surf:"wood",runs:[],ans:null,hinted:false,last:null};draw();}
function draw(){cancelAnimationFrame(raf);const s=st,q=s.q,r=sim(s);
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Question '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="card"><span class="eyebrow">Investigation question</span><h2>'+q.q+'</h2></div>'+
  '<div class="card"><div class="diagram"><svg id="scene" viewBox="0 0 800 220" width="100%" style="display:block;max-width:100%;height:auto"></svg></div>'+
  '<div class="split" style="margin-top:12px"><div><label for="h">Ramp height: <b id="hv">'+s.h+' cm</b></label><input type="range" id="h" min="5" max="60" step="5" value="'+s.h+'" style="width:100%;accent-color:#b92430">'+
  '<label for="m">Car mass</label><select id="m">'+[50,100,200].map(v=>'<option value="'+v+'" '+(v===s.m?"selected":"")+'>'+v+' g</option>').join("")+'</select>'+
  '<label for="surf">Surface</label><select id="surf">'+Object.keys(SURF).map(k=>'<option value="'+k+'" '+(k===s.surf?"selected":"")+'>'+SURF[k].name+'</option>').join("")+'</select>'+
  '<div class="row" style="margin-top:12px"><button class="primary" id="go">▶️ Release the car</button></div></div>'+
  '<div class="notice" id="readout">'+(s.last?readout(s.last):'Set up the ramp and release the car. Photogates measure its speed.')+'</div></div></div>'+
  (s.runs.length?'<div class="card"><h2>Data table</h2><div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;font-size:.9rem"><tr>'+["Run","Height","Mass","Surface","Speed at bottom","Time on ramp","Distance on floor"].map(h=>'<th style="text-align:left;padding:6px;border-bottom:2px solid #d9e1ec">'+h+'</th>').join("")+'</tr>'+
   s.runs.map((x,i)=>'<tr>'+[i+1,x.h+" cm",x.m+" g",SURF[x.surf].name,x.r.stuck?"didn’t move":x.r.v.toFixed(2)+" m/s",x.r.stuck?"–":x.r.t1.toFixed(2)+" s",x.r.stuck?"–":x.r.dist.toFixed(2)+" m"].map(v=>'<td style="padding:6px;border-bottom:1px solid #eef2f7">'+v+'</td>').join("")+'</tr>').join("")+'</table></div>'+
   (q.graph&&s.last&&!s.last.r.stuck?'<div class="diagram" style="margin-top:10px">'+speedGraph(s.last.r)+'</div>':'')+'</div>':'')+
  '<div class="card"><h2>Your answer</h2>'+q.opts.map((o,i)=>'<button class="option '+(s.ans===i?"selected":"")+'" data-a="'+i+'">'+o+'</button>').join("")+
  '<div class="row" style="margin-top:10px"><button class="primary" id="submit" '+(s.ans==null||s.runs.length<2?"disabled":"")+'>Submit answer</button>'+(s.runs.length<2?'<span class="muted small">Run at least 2 tests first.</span>':'')+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+'</div>'+(s.hinted?'<div class="warning">'+hint(q)+'</div>':'')+'</div>';
  scene(r,0,0);
  document.getElementById("h").oninput=e=>{s.h=+e.target.value;document.getElementById("hv").textContent=s.h+" cm";scene(sim(s),0,0);};
  document.getElementById("h").onchange=()=>draw();
  document.getElementById("m").onchange=e=>{s.m=+e.target.value;draw();};
  document.getElementById("surf").onchange=e=>{s.surf=e.target.value;draw();};
  document.getElementById("go").onclick=release;
  app.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{s.ans=+b.dataset.a;draw();});
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  document.getElementById("submit").onclick=submit;}
function hint(q){return{h:"Keep the mass and surface the same. Run once with a low ramp and once with a high ramp, then compare speeds.",m:"Keep the height and surface the same. Change only the mass and compare the speeds.",surf:"Keep the height and mass the same. Try each surface and compare the floor distances.",any:"Release the car and read the speed–time graph for the part on the floor."}[q.vary];}
function readout(x){const r=x.r;return r.stuck?"The ramp is too shallow for this surface: friction keeps the car from rolling.":'<b>Speed at bottom:</b> '+r.v.toFixed(2)+' m/s<br><b>Time on ramp:</b> '+r.t1.toFixed(2)+' s<br><b>Rolled on floor:</b> '+r.dist.toFixed(2)+' m in '+r.t2.toFixed(1)+' s';}
function speedGraph(r){const pts=[];for(let i=0;i<=20;i++){const t=r.t1*i/20;pts.push([t,r.a*t]);}for(let i=1;i<=30;i++){const t=r.t2*i/30;pts.push([r.t1+t,Math.max(0,r.v-r.dec*t)]);}
  return MiniChart({series:[{name:"Speed",color:"#b92430",points:pts}],xLabel:"Time (s)",yLabel:"Speed (m/s)",yMin:0,marks:[{x:r.t1,label:"reaches floor"}]});}
function scene(r,phase,pos){const svg=document.getElementById("scene");if(!svg)return;const s=st,hpx=Math.max(8,s.h*2.6),rampW=200,x0=30,yG=190,floorPx=540,maxD=12;
  let cx,cy;if(phase===0){cx=x0+8;cy=yG-hpx-8;}else if(phase===1){cx=x0+pos*rampW;cy=yG-hpx*(1-pos)-8;}else{cx=x0+rampW+Math.min(pos,maxD)/maxD*floorPx;cy=yG-8;}
  let ticks="";for(let m=0;m<=maxD;m+=2){const x=x0+rampW+m/maxD*floorPx;ticks+='<line x1="'+x+'" x2="'+x+'" y1="'+yG+'" y2="'+(yG+8)+'" stroke="#51627b"/><text x="'+x+'" y="'+(yG+22)+'" font-size="12" text-anchor="middle" fill="#51627b">'+m+' m</text>';}
  const surfCol={wood:"#c89a68",carpet:"#7d8fb3",plastic:"#bfe3f2"}[s.surf];
  svg.innerHTML='<rect x="'+(x0+rampW)+'" y="'+yG+'" width="'+floorPx+'" height="6" fill="'+surfCol+'"/><polygon points="'+x0+','+yG+' '+(x0+rampW)+','+yG+' '+x0+','+(yG-hpx)+'" fill="'+surfCol+'" opacity=".85"/><line x1="'+x0+'" y1="'+(yG-hpx)+'" x2="'+(x0+rampW)+'" y2="'+yG+'" stroke="#1b2a42" stroke-width="2"/>'+ticks+
   '<line x1="'+(x0+rampW)+'" x2="'+(x0+rampW)+'" y1="'+(yG-40)+'" y2="'+yG+'" stroke="#087b65" stroke-dasharray="4 3"/><text x="'+(x0+rampW+4)+'" y="'+(yG-44)+'" font-size="11" fill="#087b65">photogate</text>'+
   '<g transform="translate('+cx+' '+cy+')"><rect x="-14" y="-9" width="28" height="12" rx="4" fill="#b92430"/><circle cx="-8" cy="4" r="4.5" fill="#1b2a42"/><circle cx="8" cy="4" r="4.5" fill="#1b2a42"/></g>'+
   '<text x="'+(x0)+'" y="'+(yG-hpx-14)+'" font-size="12" fill="#1b2a42">'+s.h+' cm</text>'+(r.dist>maxD&&phase===2?'<text x="760" y="'+(yG-14)+'" font-size="12" text-anchor="end" fill="#b92430">rolled past '+maxD+' m →</text>':'');}
function release(){const s=st,r=sim(s);s.runs.push({h:s.h,m:s.m,surf:s.surf,r});s.last={r};
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(r.stuck||reduce){draw();scene(r,2,r.dist);return;}
  const total=r.t1+r.t2,speed=total>6?total/6:1,start=performance.now();
  document.getElementById("go").disabled=true;
  const step=now=>{const t=(now-start)/1000*speed;if(t<r.t1){scene(r,1,0.5*r.a*t*t/L);}else if(t<total){const u=t-r.t1;scene(r,2,r.v*u-0.5*r.dec*u*u);}else{draw();scene(r,2,r.dist);return;}raf=requestAnimationFrame(step);};
  raf=requestAnimationFrame(step);}
function fair(s,q){if(q.vary==="any")return s.runs.length>=1;const keys=["h","m","surf"];
  for(let i=0;i<s.runs.length;i++)for(let j=i+1;j<s.runs.length;j++){const a=s.runs[i],b=s.runs[j];const diff=keys.filter(k=>a[k]!==b[k]);if(diff.length===1&&diff[0]===q.vary)return true;}return false;}
function submit(){cancelAnimationFrame(raf);const s=st,q=s.q,right=s.ans===q.ans,isFair=fair(s,q);
  const earned=(right?6:0)+(isFair?4:0)-(s.hinted?1:0);points+=Math.max(0,earned);maxPoints+=10;records.push([q.q,right]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Answer review</span><h2>'+(right?"✅ Correct":"❌ Not quite")+'</h2><p><b>Answer:</b> '+q.opts[q.ans]+'</p><p>'+q.why+'</p>'+
  '<p>'+(isFair?"✅ You ran a controlled comparison that changed only one variable.":"🔧 Your data didn’t include two runs that changed only "+({h:"the height",m:"the mass",surf:"the surface",any:"one thing"}[q.vary])+". A fair comparison makes your evidence stronger.")+'</p>'+
  '<p><b>+'+Math.max(0,earned)+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next question":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){cancelAnimationFrame(raf);app.innerHTML=info()+Lab.report("Motion lab report · "+level,points,maxPoints,"You answered "+records.filter(r=>r[1]).length+" of "+records.length+" questions correctly.")+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
