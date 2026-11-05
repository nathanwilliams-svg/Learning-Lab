"use strict";
const app=document.getElementById("app");
let settings=Lab.load("microTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[],timer=0;
const SRC={sterile:{name:"Sterile swab (control)",cfu:0},unwashed:{name:"Unwashed hands",cfu:55},washed:{name:"Hands after soap and water",cfu:10},phone:{name:"Phone screen",cfu:35},door:{name:"Classroom doorknob",cfu:40},desk:{name:"Desk",cfu:28},wiped:{name:"Desk after disinfectant wipe",cfu:3}};
const AGAR={nutrient:{name:"Nutrient agar",f:1},plain:{name:"Plain agar (no nutrients)",f:0.12}};
const TEMP={4:{name:"Fridge (4 °C)",k:0.02,tf:0.5},22:{name:"Room (22 °C)",k:0.16,tf:0.85},37:{name:"Warm (37 °C)",k:0.24,tf:1.2}};
const LIDS={sealed:"Taped shut",open:"Left open"};
const QS=[
 {q:"Does washing with soap and water reduce the microbes on hands?",cmp:"src",pair:["unwashed","washed"],opts:["Yes, far fewer colonies grow from washed hands","No, washed and unwashed hands grow the same","Washed hands grow more colonies"],ans:0,why:"Soap lifts oils and dirt that microbes cling to, and rinsing carries them away, so far fewer colonies grow."},
 {q:"Which temperature makes microbes grow fastest?",cmp:"temp",opts:["Fridge (4 °C)","Room (22 °C)","Warm (37 °C)"],ans:2,why:"Many common microbes grow fastest near body temperature. Cold slows them down, which is why fridges keep food fresh longer."},
 {q:"Do microbes need nutrients to grow?",cmp:"agar",opts:["No, they grow the same on plain agar","Yes, far fewer colonies grow without nutrients","Plain agar grows more colonies"],ans:1,why:"Microbes are living things. Without food in the agar, very few can grow and divide."},
 {q:"Does a disinfectant wipe reduce microbes on a desk?",cmp:"src",pair:["desk","wiped"],opts:["Yes, the wiped desk grows far fewer colonies","No difference","The wiped desk grows more"],ans:0,why:"Disinfectants kill most microbes on surfaces, so few are left to grow on the plate.",lvl:1},
 {q:"Why should a scientist include a dish swabbed with a sterile swab?",cmp:"control",opts:["To grow the most colonies","To check that the dish and agar weren’t already contaminated","To make the experiment faster"],ans:1,why:"A control with nothing added should stay clear. If it grows colonies, something else contaminated the experiment, and the results can’t be trusted.",lvl:1},
 {q:"What happens to a dish that is left open?",cmp:"lid",opts:["Nothing changes","Microbes from the air land on it and grow, ruining the results","It grows fewer colonies"],ans:1,why:"Air carries mold spores and bacteria. Open dishes collect them, so you can’t tell which colonies came from your sample. Real dishes stay taped shut for safety too.",lvl:2}
];
function rng(seed){let v=seed%2147483647;if(v<=0)v+=2147483646;return()=>{v=v*16807%2147483647;return(v-1)/2147483646;};}
function colonies(d,h){const k=TEMP[d.temp].k,f=AGAR[d.agar].f,r=rng(d.seed);const out=[];
  const n=Math.round(SRC[d.src].cfu*(d.agar==="plain"?0.35:1));
  for(let i=0;i<n;i++){const a=r()*Math.PI*2,rad=Math.sqrt(r())*0.86,lag=6+r()*10,rmax=(2+r()*4)*f+0.3;const size=rmax*TEMP[d.temp].tf/(1+Math.exp(-k*(h-lag-3/k)));out.push({x:Math.cos(a)*rad,y:Math.sin(a)*rad,s:size,col:r()<0.75?"#f3e7b8":"#f6c99a",mold:false});}
  if(d.lid==="open"){for(let i=0;i<9;i++){const a=r()*Math.PI*2,rad=Math.sqrt(r())*0.86,size=(4+r()*4)/(1+Math.exp(-0.12*(h-30)));out.push({x:Math.cos(a)*rad,y:Math.sin(a)*rad,s:size,col:"#9fb59a",mold:true});}}
  return out;}
function visible(list){return list.filter(c=>c.s>0.7).length;}
function dishSVG(d,h){const cs=colonies(d,h),R=62;return '<svg viewBox="-70 -70 140 140" width="140" height="140" aria-label="Petri dish"><circle r="66" fill="#e9eef3" stroke="#8a99ad" stroke-width="2"/><circle r="'+R+'" fill="'+(d.agar==="plain"?"#f4f1e6":"#efd9a6")+'"/>'+
  cs.filter(c=>c.s>0.25).map(c=>'<circle cx="'+(c.x*R).toFixed(1)+'" cy="'+(c.y*R).toFixed(1)+'" r="'+(c.s*1.6).toFixed(1)+'" fill="'+c.col+'" stroke="'+(c.mold?"#5f7a59":"#c9a35a")+'" stroke-width="'+(c.mold?1.6:0.8)+'" '+(c.mold?'stroke-dasharray="2 1.5"':'')+'/>').join("")+
  (d.lid==="sealed"?'<circle r="66" fill="none" stroke="#7fa6f5" stroke-width="3" stroke-dasharray="10 8" opacity=".8"/>':'')+'</svg>';}
function info(){return Lab.heading("Medical Detectives","Virtual Microbiology Lab","Grow microbes safely in virtual petri dishes. Plan a fair experiment, incubate, count colonies, and draw conclusions.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>Growing microbes</h2><p>Bacteria and molds are too small to see one at a time. On agar (a jelly with food), one microbe divides again and again until it forms a visible <b>colony</b>. Counting colonies tells us how many microbes were in a sample.</p><p>A good experiment changes <b>one factor</b> between dishes and includes a <b>control</b> dish swabbed with a sterile swab.</p><div class="warning small"><b>Real lab safety:</b> school labs tape dishes shut, never open them after growth, and incubate at room temperature (no warmer than about 30 °C) so they don’t grow disease-causing germs. You can try 37 °C here because it’s virtual.</div></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("microTeacher",settings,[{k:"rounds",label:"Experiments per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);const pool=QS.filter(q=>(q.lvl||0)<=li);list=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function blankDish(i){return{src:i===0?"sterile":"desk",agar:"nutrient",temp:22,lid:"sealed",seed:1+Math.floor(Math.random()*1e6)};}
function next(){clearInterval(timer);if(round>=list.length)return report();st={q:list[round],dishes:[0,1,2,3].map(blankDish),h:0,ran:false,ans:null,hinted:false};draw();}
function sel(id,opts,val,lab){return '<select id="'+id+'" aria-label="'+lab+'" style="margin-top:4px;padding:6px;font-size:.88rem">'+Object.keys(opts).map(k=>'<option value="'+k+'" '+(String(k)===String(val)?"selected":"")+'>'+(opts[k].name||opts[k])+'</option>').join("")+'</select>';}
function draw(){const s=st,q=s.q;
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Experiment '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="card"><span class="eyebrow">Research question</span><h2>'+q.q+'</h2>'+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+(s.hinted?'<div class="warning">'+hint(q)+'</div>':'')+'</div>'+
  '<div class="grid">'+s.dishes.map((d,i)=>'<div class="card" style="text-align:center"><b>Dish '+(i+1)+'</b><div>'+dishSVG(d,s.h)+'</div>'+(s.ran?'<div class="pill">'+visible(colonies(d,s.h))+' colonies</div>':'')+
   '<div style="text-align:left">'+sel("src"+i,SRC,d.src,"Dish "+(i+1)+" sample")+sel("agar"+i,AGAR,d.agar,"Dish "+(i+1)+" agar")+sel("temp"+i,TEMP,d.temp,"Dish "+(i+1)+" temperature")+sel("lid"+i,LIDS,d.lid,"Dish "+(i+1)+" lid")+'</div></div>').join("")+'</div>'+
  '<div class="card"><h2>Incubate</h2><div class="row"><button class="primary" id="run">'+(s.ran?"🔁 Start over with fresh dishes":"🧫 Incubate for 72 hours")+'</button><span class="pill" id="hours">'+s.h+' hours</span></div>'+
  (s.ran?'<label for="hslider">Look back in time</label><input type="range" id="hslider" min="0" max="72" step="6" value="'+s.h+'" style="width:100%;accent-color:#b92430">':'')+
  (s.ran?'<h2 style="margin-top:14px">Conclusion</h2>'+q.opts.map((o,i)=>'<button class="option '+(s.ans===i?"selected":"")+'" data-a="'+i+'">'+o+'</button>').join("")+'<button class="primary" id="submit" '+(s.ans==null?"disabled":"")+' style="margin-top:8px">Submit conclusion</button>':'<p class="muted">Set up your four dishes, then incubate.</p>')+'</div>';
  s.dishes.forEach((d,i)=>["src","agar","temp","lid"].forEach(k=>{document.getElementById(k+i).onchange=e=>{d[k]=k==="temp"?+e.target.value:e.target.value;if(s.ran){s.ran=false;s.h=0;s.ans=null;}draw();};}));
  document.getElementById("run").onclick=()=>{if(s.ran){s.dishes.forEach(d=>d.seed=1+Math.floor(Math.random()*1e6));s.ran=false;s.h=0;s.ans=null;draw();return;}incubate();};
  const hs=document.getElementById("hslider");if(hs)hs.oninput=e=>{s.h=+e.target.value;draw();};
  app.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{s.ans=+b.dataset.a;draw();});
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  const sb=document.getElementById("submit");if(sb)sb.onclick=submit;}
function hint(q){return{src:"Use the two samples you’re comparing in two dishes, keep the agar, temperature and lid the same, and keep a sterile control.",temp:"Use the same sample in dishes at different temperatures. Keep everything else the same. After incubating, slide back to 24 hours and compare.",agar:"Use the same sample on nutrient agar and on plain agar. Keep everything else the same.",control:"Compare a sterile swab dish with a dish that has a real sample.",lid:"Try one sterile dish taped shut and one sterile dish left open."}[q.cmp];}
function incubate(){const s=st;clearInterval(timer);const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce){s.h=72;s.ran=true;draw();return;}s.h=0;timer=setInterval(()=>{s.h+=6;if(s.h>=72){s.h=72;s.ran=true;clearInterval(timer);}draw();},180);}
function evaluate(s){const q=s.q,D=s.dishes,same=(a,b,except)=>["src","agar","temp","lid"].every(k=>k===except||String(a[k])===String(b[k]));
  const control=D.some(d=>d.src==="sterile"&&d.lid==="sealed");let fair=false;
  if(q.cmp==="src")fair=D.some(a=>a.src===q.pair[0]&&D.some(b=>b.src===q.pair[1]&&same(a,b,"src")));
  if(q.cmp==="temp")fair=D.some(a=>D.some(b=>a!==b&&a.temp!==b.temp&&a.src!=="sterile"&&same(a,b,"temp")));
  if(q.cmp==="agar")fair=D.some(a=>D.some(b=>a.agar==="nutrient"&&b.agar==="plain"&&a.src!=="sterile"&&same(a,b,"agar")));
  if(q.cmp==="control")fair=control&&D.some(d=>d.src!=="sterile"&&d.lid==="sealed");
  if(q.cmp==="lid")fair=D.some(a=>D.some(b=>a.lid==="sealed"&&b.lid==="open"&&same(a,b,"lid")));
  return{fair,control};}
function submit(){clearInterval(timer);const s=st,q=s.q,e=evaluate(s),right=s.ans===q.ans;
  const earned=(right?4:0)+(e.fair?3:0)+(e.control?2:0)+(s.hinted?0:1);points+=earned;maxPoints+=10;records.push([q.q,right&&e.fair]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Lab review</span><h2>'+(right?"✅ ":"❌ ")+q.opts[q.ans]+'</h2><p>'+q.why+'</p>'+
  '<p>'+(e.fair?"✅ Your dishes made a fair comparison: only the factor you were testing was different.":"🔧 Your dishes didn’t include a fair comparison for this question. "+hint(q))+'</p>'+
  '<p>'+(e.control?"✅ You included a sealed sterile control dish.":"🔧 Include a sealed dish swabbed with a sterile swab as a control.")+'</p>'+
  '<p><b>+'+earned+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next experiment":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){clearInterval(timer);app.innerHTML=info()+Lab.report("Microbiology lab report · "+level,points,maxPoints,"You ran "+records.filter(r=>r[1]).length+" of "+records.length+" fair experiments with correct conclusions.")+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
