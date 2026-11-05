"use strict";
const app=document.getElementById("app");
let settings=Lab.load("expTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[];
const SC=[
 {title:"Toy car ramp",q:"Does ramp height affect how far a toy car rolls?",iv:"height",truth:"increases",unit:"cm",
  vars:[{k:"height",name:"Ramp height",vals:[10,20,30,40],u:"cm"},{k:"mass",name:"Car mass",vals:["Light","Heavy"]},{k:"surface",name:"Floor surface",vals:["Tile","Carpet"]},{k:"start",name:"How the car starts",vals:["Let go","Pushed"]}],
  dvs:[["dist","Distance the car rolls (cm)",true],["color","Color of the car",false],["wheels","Number of wheels",false],["time","Time of day",false]],
  model:c=>6*c.height*(c.surface==="Carpet"?0.45:1)*(c.start==="Pushed"?1.35:1),noise:.08},
 {title:"Dissolving sugar",q:"Does water temperature affect how fast sugar dissolves?",iv:"temp",truth:"decreases",unit:"s",
  vars:[{k:"temp",name:"Water temperature",vals:[10,25,40,60],u:"°C"},{k:"stir",name:"Stirring",vals:["No stirring","Stirred"]},{k:"sugar",name:"Sugar type",vals:["Granulated","Sugar cube"]},{k:"water",name:"Water amount",vals:[100,200],u:"mL"}],
  dvs:[["dtime","Time until the sugar disappears (s)",true],["cup","Color of the cup",false],["taste","How sweet it tastes",false],["level","Water level in the cup",false]],
  model:c=>300*Math.pow(0.5,(c.temp-10)/18)*(c.stir==="Stirred"?0.5:1)*(c.sugar==="Sugar cube"?2.2:1)*(c.water===200?0.95:1),noise:.1},
 {title:"Plant fertilizer",q:"Does the amount of fertilizer affect how tall a bean plant grows in 3 weeks?",iv:"fert",truth:"increases",unit:"cm",
  vars:[{k:"fert",name:"Fertilizer per week",vals:[0,5,10,20],u:"mL"},{k:"light",name:"Light",vals:["Sunny window","Shady corner"]},{k:"water",name:"Water per day",vals:[10,50],u:"mL"},{k:"pot",name:"Pot size",vals:["Small","Large"]}],
  dvs:[["ht","Plant height after 3 weeks (cm)",true],["leafcolor","Favorite leaf color",false],["potcolor","Pot color",false],["seeds","Seeds in the packet",false]],
  model:c=>12*(c.light==="Shady corner"?0.4:1)*(c.water===10?0.75:1)*(c.pot==="Large"?1.1:1)*(1+0.045*c.fert-0.0011*c.fert*c.fert),noise:.1},
 {title:"Paper airplanes",q:"Does wing span affect how far a paper airplane flies?",iv:"span",truth:"increases",unit:"m",
  vars:[{k:"span",name:"Wing span",vals:[10,14,18,22],u:"cm"},{k:"paper",name:"Paper type",vals:["Printer paper","Cardstock"]},{k:"throw",name:"Throw",vals:["Gentle","Hard"]},{k:"clip",name:"Nose weight",vals:["None","Paper clip"]}],
  dvs:[["fd","Flight distance (m)",true],["fold","Number of folds",false],["name","Name of the plane",false],["thrower","Who threw it",false]],
  model:c=>(2+0.22*(c.span-10))*(c.paper==="Cardstock"?0.8:1)*(c.throw==="Hard"?1.4:1)*(c.clip==="Paper clip"?1.15:1),noise:.12,lvl:1},
 {title:"Pendulum swing",q:"Does the mass of a pendulum bob affect how long 10 swings take?",iv:"mass",truth:"none",unit:"s",
  vars:[{k:"mass",name:"Bob mass",vals:[20,50,100,200],u:"g"},{k:"len",name:"String length",vals:[25,50],u:"cm"},{k:"angle",name:"Release angle",vals:[10,20],u:"°"},{k:"string",name:"String type",vals:["Cotton","Fishing line"]}],
  dvs:[["t10","Time for 10 swings (s)",true],["height","Height of the stand",false],["bobcolor","Color of the bob",false],["count","Number of people watching",false]],
  model:c=>10*2*Math.PI*Math.sqrt(c.len/100/9.8)*(1+(c.angle===20?0.008:0.002)),noise:.025,lvl:2},
 {title:"Bouncing balls",q:"Does drop height affect how high a ball bounces?",iv:"drop",truth:"increases",unit:"cm",
  vars:[{k:"drop",name:"Drop height",vals:[50,100,150,200],u:"cm"},{k:"ball",name:"Ball type",vals:["Tennis ball","Rubber ball"]},{k:"floor",name:"Floor",vals:["Concrete","Carpet"]},{k:"temp",name:"Ball temperature",vals:["Room temp","Cold"]}],
  dvs:[["bounce","Bounce height (cm)",true],["sound","Sound of the bounce",false],["brand","Ball brand",false],["size","Size of the room",false]],
  model:c=>c.drop*(c.ball==="Rubber ball"?0.75:0.55)*(c.floor==="Carpet"?0.6:1)*(c.temp==="Cold"?0.8:1),noise:.06,lvl:1}
];
function info(){return Lab.heading("Physical Science","Experimental Design Simulator","Plan a fair test, run it, and use the data to make a claim. Change only one thing at a time.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>What makes a fair test?</h2><p>The <b>independent variable</b> is the one thing you change on purpose. The <b>dependent variable</b> is what you measure. Everything else stays the same: those are your <b>controlled variables</b>.</p><p>If you change two things at once, you can’t tell which one caused the result. Repeating trials makes your results more reliable.</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("expTeacher",settings,[{k:"rounds",label:"Investigations per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);const pool=SC.filter(c=>(c.lvl||0)<=li);list=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function next(){if(round>=list.length)return report();const sc=list[round];const plan={};sc.vars.forEach(v=>plan[v.k]={change:false,val:v.vals[0]});
  st={sc,plan,dv:"",trials:level==="Beginner"?3:1,data:null,claim:"",hinted:false,dvOpts:LabKit.pick(sc.dvs,9)};draw();}
const fmtV=(v,x)=>x+(v.u?" "+v.u:"");
function draw(){const s=st,sc=s.sc,changed=sc.vars.filter(v=>s.plan[v.k].change);
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Investigation '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="card"><span class="eyebrow">Research question</span><h2>'+sc.q+'</h2></div>'+
  '<div class="split"><div class="card"><h2>1 · Plan your variables</h2><p class="muted small">Choose which variable to <b>change</b>. Set every other variable to one value to <b>keep the same</b>.</p>'+
  sc.vars.map(v=>{const p=s.plan[v.k];return '<div style="border-top:1px solid #e4eaf2;padding:8px 0"><b>'+v.name+'</b><div class="row" style="margin-top:4px"><label class="small" style="margin:0;font-weight:600"><input type="checkbox" data-change="'+v.k+'" '+(p.change?"checked":"")+'> Change it (test '+v.vals.length+' values)</label>'+
   (p.change?'<span class="small muted">Testing: '+v.vals.map(x=>fmtV(v,x)).join(", ")+'</span>':'<select data-keep="'+v.k+'" aria-label="Keep '+v.name+' at" style="width:auto">'+v.vals.map(x=>'<option '+(String(x)===String(p.val)?"selected":"")+'>'+x+'</option>').join("")+'</select><span class="small muted">'+(v.u||"")+' (kept the same)</span>')+'</div></div>';}).join("")+
  '<h2 style="margin-top:14px">2 · What will you measure?</h2>'+s.dvOpts.map(d=>'<button class="option '+(s.dv===d[0]?"selected":"")+'" data-dv="'+d[0]+'">'+d[1]+'</button>').join("")+
  '<label for="trials">3 · Trials for each value</label><select id="trials">'+[1,3,5].map(n=>'<option '+(n===s.trials?"selected":"")+'>'+n+'</option>').join("")+'</select>'+
  '<div class="row" style="margin-top:12px"><button class="primary" id="run" '+(!changed.length||!s.dv?"disabled":"")+'>🧪 Run the experiment</button>'+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+'</div>'+
  (!changed.length?'<p class="muted small">Pick one variable to change.</p>':'')+(s.hinted?'<div class="warning">The question names the variable to change. Find it in the question, change only that one, and measure what the question asks about.</div>':'')+'</div>'+
  '<div class="card"><h2>Results</h2>'+(s.data?results():'<p class="muted">Run your experiment to see a data table and graph.</p>')+'</div></div>';
  app.querySelectorAll("[data-change]").forEach(c=>c.onchange=()=>{s.plan[c.dataset.change].change=c.checked;s.data=null;draw();});
  app.querySelectorAll("[data-keep]").forEach(c=>c.onchange=()=>{const v=sc.vars.find(x=>x.k===c.dataset.keep);s.plan[v.k].val=v.vals.find(x=>String(x)===c.value);s.data=null;draw();});
  app.querySelectorAll("[data-dv]").forEach(b=>b.onclick=()=>{s.dv=b.dataset.dv;s.data=null;draw();});
  document.getElementById("trials").onchange=e=>{s.trials=+e.target.value;s.data=null;draw();};
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  document.getElementById("run").onclick=run;
  app.querySelectorAll("[data-claim]").forEach(b=>b.onclick=()=>{s.claim=b.dataset.claim;draw();});
  const sb=document.getElementById("submit");if(sb)sb.onclick=submit;}
function run(){const s=st,sc=s.sc,changed=sc.vars.filter(v=>s.plan[v.k].change),main=changed[0];
  const dvOk=sc.dvs.find(d=>d[0]===s.dv)[2];
  const rows=main.vals.map((x,i)=>{const c={};sc.vars.forEach(v=>{const p=s.plan[v.k];c[v.k]=p.change?v.vals[Math.min(i,v.vals.length-1)]:p.val;});
    const trials=Array.from({length:s.trials},()=>dvOk?LabKit.noise(sc.model(c),sc.noise):null);return{x,c,trials};});
  s.data={main,changed,rows,dvOk};s.claim="";draw();}
function results(){const s=st,sc=s.sc,d=s.data,dvName=sc.dvs.find(x=>x[0]===s.dv)[1];
  if(!d.dvOk)return '<div class="warning">You can’t measure “'+dvName+'” with numbers that answer this question. Choose a measurement that the question is asking about.</div>';
  const avg=r=>r.trials.reduce((a,b)=>a+b,0)/r.trials.length,num=typeof d.main.vals[0]==="number";
  let html='<div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;font-size:.92rem"><tr><th style="text-align:left;padding:6px;border-bottom:2px solid #d9e1ec">'+d.main.name+'</th>'+(d.changed.length>1?'<th style="text-align:left;padding:6px;border-bottom:2px solid #d9e1ec">Also changed</th>':'')+s.data.rows[0].trials.map((_,i)=>'<th style="padding:6px;border-bottom:2px solid #d9e1ec">Trial '+(i+1)+'</th>').join("")+'<th style="padding:6px;border-bottom:2px solid #d9e1ec">Average</th></tr>'+
   d.rows.map(r=>'<tr><td style="padding:6px;border-bottom:1px solid #eef2f7">'+fmtV(d.main,r.x)+'</td>'+(d.changed.length>1?'<td style="padding:6px;border-bottom:1px solid #eef2f7">'+d.changed.slice(1).map(v=>v.name+": "+r.c[v.k]).join(", ")+'</td>':'')+r.trials.map(t=>'<td style="padding:6px;text-align:right;border-bottom:1px solid #eef2f7">'+t.toFixed(1)+'</td>').join("")+'<td style="padding:6px;text-align:right;font-weight:700;border-bottom:1px solid #eef2f7">'+avg(r).toFixed(1)+'</td></tr>').join("")+'</table></div>';
  if(num)html+='<div class="diagram" style="margin-top:10px">'+MiniChart({series:[{name:"Average",color:"#b92430",dots:true,points:d.rows.map(r=>[r.x,avg(r)])}],xLabel:d.main.name+(d.main.u?" ("+d.main.u+")":""),yLabel:dvName,xMax:Math.max(...d.main.vals)*1.05,yMin:0})+'</div>';
  if(d.changed.length>1)html+='<div class="warning">⚠️ You changed '+d.changed.length+' variables at once ('+d.changed.map(v=>v.name.toLowerCase()).join(", ")+'). This isn’t a fair test: you can’t tell which change caused the results.</div>';
  html+='<h2 style="margin-top:14px">4 · Make a claim</h2><p>As '+d.main.name.toLowerCase()+' '+(num?"increases":"changes")+', '+dvName.replace(/\s*\(.*\)/,"").toLowerCase()+'…</p>'+
   [["increases","increases"],["decreases","decreases"],["none","stays about the same"]].map(c=>'<button class="option '+(st.claim===c[0]?"selected":"")+'" data-claim="'+c[0]+'">'+c[1]+'</button>').join("")+
   '<button class="primary" id="submit" '+(st.claim?"":"disabled")+' style="margin-top:8px">Submit my investigation</button>';
  return html;}
function submit(){const s=st,sc=s.sc,d=s.data;const one=d.changed.length===1,rightIV=one&&d.main.k===sc.iv,claimOk=rightIV&&s.claim===sc.truth;
  const pts=(rightIV?3:one?1:0)+(d.dvOk?2:0)+(s.trials>=3?2:0)+(claimOk?3:0)-(s.hinted?1:0);const earned=Math.max(0,pts);points+=earned;maxPoints+=10;records.push([sc.title,rightIV&&claimOk]);
  const ivV=sc.vars.find(v=>v.k===sc.iv),truthTxt={increases:"increases",decreases:"decreases",none:"stays about the same"}[sc.truth];
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Investigation review</span><h2>'+sc.title+'</h2>'+
  '<p>'+(rightIV?"✅":"❌")+' <b>Independent variable:</b> '+(one?(rightIV?"You changed only "+ivV.name.toLowerCase()+". Fair test!":"You changed "+d.main.name.toLowerCase()+", but the question asks about "+ivV.name.toLowerCase()+"."):"You changed more than one variable, so the test wasn’t fair.")+'</p>'+
  '<p>'+(d.dvOk?"✅":"❌")+' <b>Dependent variable:</b> '+sc.dvs.find(x=>x[2])[1]+'.</p>'+
  '<p>'+(s.trials>=3?"✅":"❌")+' <b>Trials:</b> '+s.trials+' per value. '+(s.trials>=3?"Repeating trials helps you spot unusual results.":"One trial can be thrown off by random error. Use 3 or more.")+'</p>'+
  '<p>'+(claimOk?"✅":"❌")+' <b>Claim:</b> as '+ivV.name.toLowerCase()+' increases, the measurement '+truthTxt+'.'+(sc.truth==="none"?" Surprised? Galileo found the same thing: a pendulum’s mass doesn’t change its swing time; only its length does.":"")+'</p>'+
  '<p><b>+'+earned+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next investigation":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("Experimental design report · "+level,points,maxPoints,"You designed "+records.filter(r=>r[1]).length+" of "+records.length+" fully fair tests with correct claims. "+records.map(r=>(r[1]?"✅ ":"🔧 ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
