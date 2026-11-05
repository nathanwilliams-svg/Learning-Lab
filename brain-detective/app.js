"use strict";
const app=document.getElementById("app");
let settings=Lab.load("brainTeacher",{rounds:4,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[];
const LOBES={
 frontal:{name:"Frontal lobe",color:"#f4a6a6",jobs:["Planning, decisions and self-control","Personality and behavior","Starting voluntary movements (motor area at the back of the lobe)","Producing speech (Broca’s area, usually on the left)"],
  path:"M70 150 C 60 95, 105 45, 175 40 C 190 40, 200 42, 205 45 L 200 150 C 170 165, 120 175, 95 175 C 80 172, 72 165, 70 150 Z"},
 parietal:{name:"Parietal lobe",color:"#a9c9f5",jobs:["Feeling touch, temperature and pain","Knowing where your body parts are","Spatial awareness and judging distance","Helps with reading and math"],
  path:"M205 45 C 250 45, 295 65, 312 100 L 255 140 L 200 150 Z"},
 occipital:{name:"Occipital lobe",color:"#b8e0b0",jobs:["Seeing: processing everything from your eyes","Recognizing colors, shapes and motion"],
  path:"M312 100 C 335 125, 338 160, 325 185 C 305 192, 280 190, 262 182 L 255 140 Z"},
 temporal:{name:"Temporal lobe",color:"#f7d59a",jobs:["Hearing and understanding sounds","Understanding language (Wernicke’s area, usually on the left)","Forming new memories","Recognizing faces"],
  path:"M95 175 C 120 175, 170 165, 200 150 L 255 140 L 262 182 C 240 205, 190 215, 150 205 C 120 198, 100 190, 95 175 Z"},
 cerebellum:{name:"Cerebellum",color:"#d6b8ef",jobs:["Balance and posture","Coordination and smooth, accurate movement","Timing of movements, like catching a ball"],
  path:"M262 182 C 280 190, 305 192, 325 185 C 330 205, 312 228, 282 230 C 258 230, 245 215, 248 200 Z"},
 brainstem:{name:"Brainstem",color:"#b7c4cf",jobs:["Breathing and heart rate","Swallowing, coughing and blinking reflexes","Sleep and wake cycles","Connects the brain to the spinal cord"],
  path:"M212 205 C 222 206, 236 206, 246 204 L 242 268 C 236 272, 222 272, 216 268 Z"}
};
const CASES=[
 {who:"Maya, 13",story:"After a soccer collision, Maya keeps bumping into things on her left. She says part of what she sees seems to be missing, even though her eyes are fine.",ans:"occipital",clue:"Her eyes work, but her brain isn’t processing part of what she sees.",lvl:0},
 {who:"Jordan, 12",story:"Jordan fell off his bike. Luckily he wore a helmet. Now he walks unsteadily, and his hand shakes when he reaches to touch his nose.",ans:"cerebellum",clue:"Balance and smooth, accurate movement are the cerebellum’s jobs.",lvl:0},
 {who:"Mr. Reyes, 68",story:"After a stroke, Mr. Reyes understands everything people say, but he struggles to get his own words out.",ans:"frontal",clue:"Producing speech is controlled by Broca’s area in the frontal lobe.",lvl:1},
 {who:"Ana, 14",story:"Ana can’t feel light touch on her right hand, and with her eyes closed she can’t tell where her hand is.",ans:"parietal",clue:"Touch and body position are processed in the parietal lobe.",side:"left",sideWhy:"Each side of the brain senses and controls the opposite side of the body, so the right hand points to the left parietal lobe.",lvl:0},
 {who:"Sam, 15",story:"Sam can hear sounds clearly, but words don’t make sense to him, and he has trouble remembering new things.",ans:"temporal",clue:"Understanding language and forming memories happen in the temporal lobe.",lvl:1},
 {who:"Patient in the ICU",story:"Doctors are closely watching this patient’s breathing and heart rate. The patient also has trouble swallowing.",ans:"brainstem",clue:"Breathing, heart rate and swallowing are automatic jobs of the brainstem.",lvl:0},
 {who:"Eli, 14",story:"After a concussion, Eli’s parents notice he acts without thinking, has trouble planning homework, and gets frustrated easily.",ans:"frontal",clue:"Planning, self-control and behavior are frontal lobe jobs.",lvl:0},
 {who:"Ms. Patel, 52",story:"Ms. Patel’s vision is fine and she knows the people around her by their voices, but she can’t recognize their faces.",ans:"temporal",clue:"Recognizing faces relies on the lower temporal lobe.",lvl:2},
 {who:"Marcus, 16",story:"After a skateboarding fall, Marcus can’t lift his left arm on purpose, though he can feel when someone touches it.",ans:"frontal",clue:"Feeling works, but starting movement doesn’t, which points to the motor area of the frontal lobe.",side:"right",sideWhy:"The right side of the brain controls movement on the left side of the body.",lvl:2},
 {who:"Lily, 12",story:"Lily gets dizzy after spinning and stumbles more than her friends. In gym, she has trouble timing her jumps over a moving rope.",ans:"cerebellum",clue:"Timing and coordination are cerebellum jobs.",lvl:1}
];
function svg(sel,clickable){return '<svg viewBox="40 20 320 265" width="100%" style="max-width:520px;display:block;margin:auto" role="group" aria-label="Brain diagram, left side view">'+
  Object.keys(LOBES).map(k=>{const L=LOBES[k],on=sel===k;return '<path d="'+L.path+'" fill="'+L.color+'" stroke="'+(on?"#b92430":"#5b6b80")+'" stroke-width="'+(on?4:1.5)+'" '+(clickable?'data-lobe="'+k+'" tabindex="0" role="button" aria-label="'+L.name+'" style="cursor:pointer"':'')+'/>';}).join("")+
  '<text x="125" y="115" font-size="13" font-weight="700" fill="#1b2a42" pointer-events="none">Frontal</text><text x="232" y="92" font-size="13" font-weight="700" fill="#1b2a42" pointer-events="none">Parietal</text><text x="270" y="160" font-size="12" font-weight="700" fill="#1b2a42" pointer-events="none">Occipital</text><text x="155" y="192" font-size="13" font-weight="700" fill="#1b2a42" pointer-events="none">Temporal</text><text x="262" y="215" font-size="11" font-weight="700" fill="#1b2a42" pointer-events="none">Cerebellum</text><text x="250" y="258" font-size="11" font-weight="700" fill="#1b2a42" pointer-events="none">Brainstem</text>'+
  '<text x="60" y="40" font-size="11" fill="#51627b" pointer-events="none">◀ front</text></svg>';}
function bindLobes(fn){app.querySelectorAll("[data-lobe]").forEach(p=>{p.onclick=()=>fn(p.dataset.lobe);p.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fn(p.dataset.lobe);}};});}
function info(){return Lab.heading("Medical Detectives","Brain Detective","Explore the brain’s regions, then use each patient’s symptoms to figure out which part of the brain is affected.")}
let explore="frontal";
function welcome(){app.innerHTML=info()+'<div class="split"><div class="card"><h2>Explore the brain</h2><p class="muted small">Click a region to learn what it does.</p><div class="diagram">'+svg(explore,true)+'</div></div><div class="card"><span class="eyebrow">Region</span><h2>'+LOBES[explore].name+'</h2><ul>'+LOBES[explore].jobs.map(j=>'<li>'+j+'</li>').join("")+'</ul><p class="muted small">The brain is split into a left and right half. Each half mostly senses and controls the <b>opposite</b> side of the body.</p></div></div>'+
  '<div class="warning small">All patients are fictional. Any head injury needs a doctor’s care. Wear a helmet for biking, skating and sports.</div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  bindLobes(k=>{explore=k;welcome();});document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("brainTeacher",settings,[{k:"rounds",label:"Patients per session",opts:[3,4,5,6]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);const pool=CASES.filter(c=>c.lvl<=li);list=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function next(){if(round>=list.length)return report();st={c:list[round],pick:null,side:null,hinted:false};draw();}
function draw(){const s=st,c=s.c,needSide=level==="Advanced"&&c.side;
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Patient '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="split"><div class="card"><span class="eyebrow">Patient file · fictional</span><h2>'+c.who+'</h2><p>'+c.story+'</p>'+
  (s.pick?'<div class="notice"><b>You selected: '+LOBES[s.pick].name+'</b><br><span class="small">'+LOBES[s.pick].jobs.join(" · ")+'</span></div>':'<p class="muted">Click the brain region you think is affected.</p>')+
  (needSide?'<h3 style="margin-top:12px">Which side of the brain?</h3><div class="grid">'+["left","right"].map(x=>'<button class="option '+(s.side===x?"selected":"")+'" data-side="'+x+'">'+x[0].toUpperCase()+x.slice(1)+' side</button>').join("")+'</div>':'')+
  '<div class="row" style="margin-top:12px"><button class="primary" id="submit" '+(!s.pick||(needSide&&!s.side)?"disabled":"")+'>Submit diagnosis</button>'+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+'</div>'+
  (s.hinted?'<div class="warning">Underline the symptoms. Which ability is missing: seeing, hearing and understanding, feeling, moving, balance, or automatic body jobs?</div>':'')+'</div>'+
  '<div class="card"><div class="diagram">'+svg(s.pick,true)+'</div></div></div>';
  bindLobes(k=>{s.pick=k;draw();});app.querySelectorAll("[data-side]").forEach(b=>b.onclick=()=>{s.side=b.dataset.side;draw();});
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};document.getElementById("submit").onclick=submit;}
function submit(){const s=st,c=s.c,right=s.pick===c.ans,needSide=level==="Advanced"&&c.side,sideOk=needSide?s.side===c.side:true;
  const earned=(right?7:0)+(needSide?(sideOk?3:0):(s.hinted?2:3));points+=earned;maxPoints+=10;records.push([c.who,right&&sideOk]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Diagnosis review</span><h2>'+(right?"✅ ":"❌ ")+LOBES[c.ans].name+'</h2><p><b>Key clue:</b> '+c.clue+'</p>'+(right?'':'<p>You chose the '+LOBES[s.pick].name.toLowerCase()+', which handles: '+LOBES[s.pick].jobs.join("; ").toLowerCase()+'.</p>')+
  (needSide?'<p>'+(sideOk?"✅":"❌")+' <b>Side:</b> the '+c.side+' side. '+c.sideWhy+'</p>':c.side?'<p class="muted">Did you know? '+c.sideWhy+'</p>':'')+
  '<p><b>+'+earned+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next patient":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("Brain detective report · "+level,points,maxPoints,"You correctly located "+records.filter(r=>r[1]).length+" of "+records.length+" cases. "+records.map(r=>(r[1]?"✅ ":"❌ ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
