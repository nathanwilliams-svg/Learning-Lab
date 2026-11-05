"use strict";
const app=document.getElementById("app");
let settings=Lab.load("thermalTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[];
/* k = thermal conductivity (W/m·K); cost per 1 cm layer */
const MAT={
  none:{name:"No layer",k:null,cost:0},
  foam:{name:"Foam (polystyrene)",k:0.033,cost:2.0},
  bubble:{name:"Bubble wrap",k:0.040,cost:1.5},
  cotton:{name:"Cotton batting",k:0.045,cost:1.0},
  wool:{name:"Wool fabric",k:0.050,cost:1.0},
  card:{name:"Cardboard",k:0.065,cost:0.5},
  air:{name:"Trapped air gap",k:0.060,cost:0},
  foil:{name:"Aluminum foil (shiny wrap)",k:"foil",cost:0.5}
};
const BASE={plastic:{name:"Plastic container",t:0.002,k:0.2},metal:{name:"Metal can",t:0.001,k:50},glass:{name:"Glass jar",t:0.004,k:1.0}};
const LID={tight:{name:"Tight lid",f:1},loose:{name:"Loose lid",f:1.3},none:{name:"No lid",f:1.9}};
const CH=[
 {title:"Hot soup at lunch",text:"Your soup starts at 80 °C in a 22 °C classroom. Keep it at 55 °C or hotter after 60 minutes.",hot:true,T0:80,Ta:22,min:60,goal:55},
 {title:"Warm cocoa for recess",text:"Hot cocoa starts at 75 °C in a 22 °C room. Keep it at 50 °C or warmer after 45 minutes.",hot:true,T0:75,Ta:22,min:45,goal:50},
 {title:"Cold milk at lunch",text:"Milk starts at 4 °C in a 25 °C room. Keep it at 10 °C or colder after 60 minutes.",hot:false,T0:4,Ta:25,min:60,goal:10},
 {title:"Cold drink on a field trip",text:"Your drink starts at 4 °C on a 32 °C day. Keep it at 10 °C or colder after 60 minutes.",hot:false,T0:4,Ta:32,min:60,goal:10,lvl:1},
 {title:"All-morning thermos",text:"Soup packed at 80 °C at 9:00 has to stay at 50 °C or hotter until lunch, 3 hours later. The room is 22 °C.",hot:true,T0:80,Ta:22,min:180,goal:50,lvl:1},
 {title:"Budget lunch box",text:"Keep 80 °C soup at 55 °C or hotter after 60 minutes, spending no more than $3.00 on insulation.",hot:true,T0:80,Ta:22,min:60,goal:55,budget:3,lvl:2},
 {title:"Ice cream rescue",text:"Ice cream at −10 °C must stay at −2 °C or colder for 45 minutes on a 30 °C day.",hot:false,T0:-10,Ta:30,min:45,goal:-2,lvl:2}
];
const C=0.4*4186, AREA=0.06;
function physics(s){const ch=s.ch;let foil=false,R=0,cost=0;
  s.layers.forEach(L=>{const m=MAT[L.m];if(L.m==="none")return;cost+=m.cost*(L.m==="foil"?1:L.t);if(m.k==="foil"){foil=true;return;}R+=L.t/100/m.k;});
  const h=foil?6.5:10,b=BASE[s.base],U=1/(1/h+b.t/b.k+R),K=U*AREA*LID[s.lid].f,tau=C/K;
  const T=t=>ch.Ta+(ch.T0-ch.Ta)*Math.exp(-t*60/tau);
  const end=T(ch.min),ok=ch.hot?end>=ch.goal:end<=ch.goal;
  return {T,end,ok,cost,U,tau,foil};}
function control(ch){const s={ch,layers:[],base:"plastic",lid:"tight"};return physics(s);}
function info(){return Lab.heading("Physical Science","Thermal Energy Lab","Design an insulated lunch container. Choose layers and a lid, predict the temperature, then test it.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>How insulation works</h2><p>Thermal energy always moves from <b>hotter to colder</b>. Hot soup loses energy to the room, and a cold drink gains energy from the warm air.</p><p>Insulators like foam, cotton and bubble wrap trap still air, which slows conduction. A lid stops warm air and steam from escaping (convection). Shiny foil reflects radiation.</p><p class="muted">The simulation uses Newton’s law of cooling with real conductivity values. It is a model, so your real container will differ a little.</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("thermalTeacher",settings,[{k:"rounds",label:"Challenges per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);const pool=CH.filter(c=>(c.lvl||0)<=li);list=LabKit.pick(pool.slice(1),Math.min(settings.rounds,pool.length)-1);list.unshift(pool[0]);next();}
function nLayers(){return level==="Beginner"?1:level==="Intermediate"?2:3}
function next(){if(round>=list.length)return report();st={ch:list[round],layers:Array.from({length:nLayers()},()=>({m:"none",t:1})),base:"plastic",lid:"tight",guess:"",tested:false,hinted:false};draw();}
function buckets(ch){return ch.hot?[["Above "+(ch.goal+10)+" °C",x=>x>ch.goal+10],[ch.goal+"–"+(ch.goal+10)+" °C",x=>x>=ch.goal&&x<=ch.goal+10],[(ch.goal-10)+"–"+ch.goal+" °C",x=>x>=ch.goal-10&&x<ch.goal],["Below "+(ch.goal-10)+" °C",x=>x<ch.goal-10]]
  :[["Below "+(ch.goal-6)+" °C",x=>x<ch.goal-6],[(ch.goal-6)+" to "+ch.goal+" °C",x=>x>=ch.goal-6&&x<=ch.goal],[ch.goal+" to "+(ch.goal+6)+" °C",x=>x>ch.goal&&x<=ch.goal+6],["Above "+(ch.goal+6)+" °C",x=>x>ch.goal+6]];}
function draw(){const s=st,ch=s.ch,p=physics(s),ctl=control(ch),bk=buckets(ch);
  const pts=f=>Array.from({length:31},(_,i)=>{const t=ch.min*i/30;return[t,f(t)];});
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Challenge '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="card"><span class="eyebrow">Design brief</span><h2>'+ch.title+'</h2><p>'+ch.text+'</p></div>'+
  '<div class="split"><div class="card"><h2>Build your container</h2><label for="base">Container</label><select id="base">'+Object.keys(BASE).map(k=>'<option value="'+k+'" '+(k===s.base?"selected":"")+'>'+BASE[k].name+'</option>').join("")+'</select>'+
  s.layers.map((L,i)=>'<label for="m'+i+'">Insulation layer '+(i+1)+'</label><div class="row" style="flex-wrap:nowrap"><select id="m'+i+'" style="flex:2">'+Object.keys(MAT).map(k=>'<option value="'+k+'" '+(k===L.m?"selected":"")+'>'+MAT[k].name+(MAT[k].cost?" · $"+MAT[k].cost.toFixed(2)+(k==="foil"?"":"/cm"):"")+'</option>').join("")+'</select><select id="t'+i+'" style="flex:1" aria-label="Layer '+(i+1)+' thickness" '+(L.m==="none"||L.m==="foil"?"disabled":"")+'>'+[0.5,1,2,3].map(t=>'<option value="'+t+'" '+(t===L.t?"selected":"")+'>'+t+' cm</option>').join("")+'</select></div>').join("")+
  '<label for="lid">Lid</label><select id="lid">'+Object.keys(LID).map(k=>'<option value="'+k+'" '+(k===s.lid?"selected":"")+'>'+LID[k].name+'</option>').join("")+'</select>'+
  '<p style="margin-top:12px"><b>Insulation cost:</b> $'+p.cost.toFixed(2)+(ch.budget?' of $'+ch.budget.toFixed(2)+' budget':'')+'</p>'+(nLayers()<3?'<p class="muted small">More layers unlock at higher levels.</p>':'')+'</div>'+
  '<div class="card"><h2>Predict the temperature</h2><p>After '+ch.min+' minutes, the '+(ch.hot?"soup":"food")+' will be…</p><div class="grid">'+bk.map((b,i)=>'<button class="option '+(s.guess===i?"selected":"")+'" data-g="'+i+'">'+b[0]+'</button>').join("")+'</div>'+
  '<div class="row" style="margin-top:10px"><button class="primary" id="test" '+(s.guess===""?"disabled":"")+'>🌡️ Run the '+ch.min+'-minute test</button>'+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+'</div>'+(s.hinted?'<div class="warning">'+hint(s)+'</div>':'')+
  (s.tested?'<div class="diagram" style="margin-top:12px">'+MiniChart({series:[{name:"Your container",color:"#b92430",points:pts(p.T)},{name:"Plastic box, no insulation",color:"#8a99ad",dash:true,points:pts(ctl.T)}],xLabel:"Time (minutes)",yLabel:"Temperature (°C)",xMax:ch.min,yMin:Math.min(ch.T0,ch.Ta)-4,yMax:Math.max(ch.T0,ch.Ta)+4,goal:{y:ch.goal,label:"Goal "+ch.goal+" °C"}})+'</div><p><b>After '+ch.min+' minutes:</b> '+p.end.toFixed(1)+' °C '+(p.ok?"✅ goal met":"❌ goal missed")+(ch.budget&&p.cost>ch.budget?' · ❌ over budget':'')+'</p><button class="primary" id="submit">Submit this design</button>':'')+'</div></div>';
  document.getElementById("base").onchange=e=>{s.base=e.target.value;s.tested=false;draw();};
  document.getElementById("lid").onchange=e=>{s.lid=e.target.value;s.tested=false;draw();};
  s.layers.forEach((L,i)=>{document.getElementById("m"+i).onchange=e=>{L.m=e.target.value;s.tested=false;draw();};document.getElementById("t"+i).onchange=e=>{L.t=+e.target.value;s.tested=false;draw();};});
  app.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{s.guess=+b.dataset.g;draw();});
  document.getElementById("test").onclick=()=>{s.tested=true;draw();};
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  const sb=document.getElementById("submit");if(sb)sb.onclick=submit;}
function hint(s){const p=physics(s);if(s.lid!=="tight")return"Start with the lid. An open top lets warm air and steam carry energy away fast.";
  if(s.base==="metal")return"Metal is a conductor. A plastic or glass container slows heat flow more.";
  if(!s.layers.some(L=>L.m!=="none"))return"Add an insulation layer. Materials that trap still air, like foam or cotton, insulate best.";
  return"Thicker layers of a low-conductivity material (foam is lowest) slow heat flow the most. Foil helps a little on top.";}
function submit(){const s=st,ch=s.ch,p=physics(s),bk=buckets(ch),predOk=bk[s.guess][1](p.end),budgetOk=!ch.budget||p.cost<=ch.budget;
  const earned=(p.ok?6:0)+(budgetOk&&p.ok?2:0)+(predOk?2:0)-(s.hinted?1:0);points+=Math.max(0,earned);maxPoints+=10;records.push([ch.title,p.ok&&budgetOk]);
  const best=Object.keys(MAT).filter(k=>typeof MAT[k].k==="number").sort((a,b)=>MAT[a].k-MAT[b].k)[0];
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Test results</span><h2>'+(p.ok&&budgetOk?"✅ ":"🔧 ")+ch.title+'</h2><p>After '+ch.min+' minutes your '+(ch.hot?"soup":"food")+' was <b>'+p.end.toFixed(1)+' °C</b>. The goal was '+(ch.hot?"at least ":"at most ")+ch.goal+' °C.</p>'+
  (ch.budget?'<p>Insulation cost: $'+p.cost.toFixed(2)+' of $'+ch.budget.toFixed(2)+' '+(budgetOk?"✅":"❌")+'</p>':'')+
  '<p>Your prediction ('+bk[s.guess][0]+') was '+(predOk?"<b>correct</b>.":"not quite.")+'</p>'+
  '<p><b>Why:</b> '+(ch.hot?"Energy flowed out of the hot soup into the cooler room.":"Energy flowed from the warm air into the cold food.")+' Your container slowed that flow: its heat-loss rate was '+p.U.toFixed(2)+' W per m² per °C. The lowest-conductivity material here is '+MAT[best].name.toLowerCase()+'.</p>'+
  '<p><b>+'+Math.max(0,earned)+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next challenge":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("Thermal design report · "+level,points,maxPoints,"You met "+records.filter(r=>r[1]).length+" of "+records.length+" design briefs. "+records.map(r=>(r[1]?"✅ ":"🔧 ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
