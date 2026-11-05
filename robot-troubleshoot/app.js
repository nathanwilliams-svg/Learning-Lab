"use strict";
const app=document.getElementById("app");
let settings=Lab.load("troubleTeacher",{rounds:4,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,cases=[],cur=null,records=[];

/* Diagnostic tests. Cost = minutes of build time used. */
const TESTS={
  spin:{name:"Spin the wheel by hand (motor off)",cost:1,icon:"🖐️"},
  drive:{name:"Drive forward and watch from above",cost:1,icon:"👀"},
  ports:{name:"Check motor ports and reversed settings in the code",cost:2,icon:"💻"},
  support:{name:"Look at how each axle is supported",cost:1,icon:"🔩"},
  collars:{name:"Check shaft collars and spacers",cost:1,icon:"⭕"},
  wiggle:{name:"Wiggle the wheel and shaft",cost:1,icon:"↔️"},
  temp:{name:"Run for 3 minutes, then check motor temperature",cost:3,icon:"🌡️"},
  gears:{name:"Inspect how the gears mesh",cost:1,icon:"⚙️"},
  cables:{name:"Check smart cables and the brain's device screen",cost:2,icon:"🔌"},
  insert:{name:"Look inside the wheel for the square shaft insert",cost:1,icon:"🔍"},
  hold:{name:"Stop the arm mid-lift and watch it",cost:1,icon:"🦾"}
};
const OK="Nothing unusual. Everything looks normal here.";
/* Each case: symptom, the real cause, distractors, test results (others return OK), fix, and the building lesson. */
const CASES=[
 {title:"The robot drives in circles",story:"When the driver pushes the joystick forward, the robot spins in place instead of driving straight.",
  cause:"One drive motor is reversed in the code",wrong:["A wheel is missing its shaft collar","The battery is low","The gears are not meshed"],
  results:{drive:"Both wheels turn, but the left side spins forward while the right side spins backward.",ports:"The right motor is set to forward in the code, but it is mounted facing the opposite way. It needs to be reversed.",spin:"Both wheels spin freely by hand."},
  fix:"Set the right motor to reversed in the motor configuration, or swap the sign in the code.",lesson:"Motors mounted on opposite sides of a robot face opposite directions, so one side must be reversed.",best:["drive","ports"],level:0},
 {title:"Motor hums, wheel stays still",story:"You can hear the motor running and the shaft turning, but one wheel does not move at all.",
  cause:"The wheel is missing its square shaft insert",wrong:["One motor is reversed in the code","The axle has no bearing support","The motor is overheating"],
  results:{spin:"This wheel spins very easily by hand while the shaft stays still.",insert:"The round hole in the wheel has no square insert, so the square shaft turns inside the wheel without gripping it.",wiggle:"The shaft turns inside the wheel's hole."},
  fix:"Add a square shaft insert to the wheel so the shaft can grip and turn it.",lesson:"Square shafts transfer torque only through square holes or inserts. A round hole lets the shaft slip.",best:["spin","insert"],level:0},
 {title:"The wheel slides off",story:"After a few runs, one wheel creeps outward on its axle until it falls off.",
  cause:"A shaft collar is missing",wrong:["The wheel is missing its square insert","The gears are skipping","The smart cable is loose"],
  results:{collars:"There is no shaft collar on the outside of the wheel. Only a spacer is there, and it has slid off.",wiggle:"The wheel slides side to side along the axle.",support:"The axle passes through two bearings, which is good."},
  fix:"Add a shaft collar on the outside of the wheel and tighten its set screw.",lesson:"Shaft collars lock parts in place along the shaft. Without them, wheels and gears drift.",best:["collars","wiggle"],level:0},
 {title:"Wobbly wheels and a bent axle",story:"The wheels wobble as the robot drives, and after a hard hit the axle looks bent.",
  cause:"The axle is supported on only one side",wrong:["A drive motor is reversed in the code","The gears are not meshed","The robot is overheating"],
  results:{support:"The axle goes through only one piece of C-channel. The wheel hangs out on the end with nothing supporting the other side.",wiggle:"The wheel tilts a lot when you push on it.",drive:"The wheels wobble side to side while driving."},
  fix:"Support the axle on both sides of the wheel with bearings, like a bridge instead of a diving board.",lesson:"Axles need support on both sides. A shaft held on one side bends easily under load.",best:["support","wiggle"],level:0},
 {title:"Strong at first, then sluggish",story:"The robot drives fine for the first minute, then slows down and finally stops responding well.",
  cause:"Too much friction is making the motors overheat",wrong:["A motor port is wrong in the code","The wheel is missing its square insert","A shaft collar is missing"],
  results:{temp:"The drive motors are hot and the brain shows a temperature warning.",spin:"The wheels are hard to turn by hand and stop as soon as you let go.",collars:"The shaft collars are squeezed very tightly against the bearings, pinching the shaft.",support:"Each axle has two bearings, but they don't line up perfectly."},
  fix:"Loosen the collars slightly, line up the bearings, and check that the wheels spin freely by hand.",lesson:"A free-spinning drivetrain is a fast drivetrain. Friction turns motor power into heat.",best:["spin","temp"],level:1},
 {title:"Clicking gears under load",story:"When the arm lifts a heavy game piece, the gears make a loud clicking sound and the arm drops a little.",
  cause:"The gears are not meshed tightly and are skipping teeth",wrong:["The arm motor is reversed in the code","The axle is missing a shaft collar","The smart cable is loose"],
  results:{gears:"The gears are slightly too far apart. Under load, the metal bends and the teeth jump over each other.",hold:"The arm holds when empty, but clicks and slips when it carries a load.",support:"The gear axles are supported on both sides."},
  fix:"Mount the gears at the correct spacing and brace the structure so it can't flex apart.",lesson:"Gears must mesh at the right distance, and the frame must be stiff so they stay meshed under load.",best:["gears","hold"],level:1},
 {title:"Motor won't respond",story:"One intake motor never moves, even though the code looks right and the other motors work.",
  cause:"The smart cable is loose or plugged into the wrong port",wrong:["The motor is overheating","The intake axle is missing a collar","The gears are skipping"],
  results:{cables:"The brain's device screen shows no motor in port 7. The cable is half pushed in and the code expects port 8.",ports:"The code says the intake motor is in port 8.",temp:"The motor is cool, because it never ran."},
  fix:"Push the smart cable in until it clicks and make sure the port in the code matches.",lesson:"Check the brain's device screen first. Many 'broken' motors are really cable or port problems.",best:["cables","ports"],level:1},
 {title:"The arm sags when stopped",story:"The arm lifts fine, but when the driver lets go of the button, the arm slowly drops back down.",
  cause:"The arm motor is set to coast instead of hold",wrong:["The gears are skipping","The arm axle is supported on one side","The smart cable is loose"],
  results:{hold:"When the motor stops, the arm drifts down smoothly with no clicking.",ports:"The arm motor's stop mode is set to coast.",gears:"The gears mesh well."},
  fix:"Set the arm motor's stopping mode to hold so the motor actively keeps the arm in place.",lesson:"Coast lets a mechanism fall freely. Hold uses the motor to keep its position.",best:["hold","ports"],level:2},
 {title:"Drifts to the left",story:"The robot drives almost straight but slowly drifts to the left over the length of the field.",
  cause:"The left side of the drivetrain has extra friction",wrong:["The right motor is reversed in the code","A wheel is missing its square insert","The battery is unplugged"],
  results:{spin:"The right wheels spin freely. The left wheels slow down and stop quickly.",support:"A spacer on the left side is rubbing against the C-channel.",drive:"Both sides go forward, but the left side is a little slower."},
  fix:"Remove the rubbing spacer or add a washer, then check that both sides spin equally by hand.",lesson:"Drivetrains drift when one side has more friction. Spin-test both sides and compare.",best:["spin","support"],level:2}
];
function info(){return Lab.heading("Robotics","Robotics Troubleshooting Detective","Real robots break in sneaky ways. Choose tests wisely, gather evidence, and find the real cause before you fix anything.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>How to investigate</h2><p>Each case is a robot with a problem. Every test costs build time. <b>Pick the tests most likely to give useful evidence</b>, then choose the cause and the fix.</p><p>You earn points for the right cause, for using few minutes, and for choosing the best tests.</p><p class="muted">Cases are based on common VEX V5 and EXP build problems.</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("troubleTeacher",settings,[{k:"rounds",label:"Cases per session",opts:[3,4,5,6]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);
  const pool=CASES.filter(c=>c.level<=li);cases=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function budget(){return level==="Beginner"?8:level==="Intermediate"?6:5}
function next(){if(round>=cases.length)return report();const c=cases[round];
  const opts=LabKit.pick([c.cause].concat(level==="Advanced"?c.wrong:c.wrong.slice(0,level==="Beginner"?2:3)),9);
  cur={c,done:[],used:0,opts,choice:null,hinted:false};draw();}
function draw(){const s=cur,c=s.c,left=budget()-s.used;
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Case '+(round+1)+' / '+cases.length+'</span><span class="pill">Score '+points+'</span><span class="pill">⏱️ '+left+' build minutes left</span></div>'+
  '<div class="card"><span class="eyebrow">Case file</span><h2>'+c.title+'</h2><p>'+c.story+'</p></div>'+
  '<div class="split"><div class="card"><h2>Run a test</h2>'+Object.keys(TESTS).map(k=>{const t=TESTS[k],did=s.done.includes(k);return '<button class="option" data-test="'+k+'" '+(did||t.cost>left?"disabled":"")+'>'+t.icon+' '+t.name+' <span class="muted small">· '+t.cost+' min'+(did?" · done":"")+'</span></button>';}).join("")+
  (settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+(s.hinted?'<div class="warning">Hint: start with '+c.best.map(k=>TESTS[k].name.toLowerCase()).join(", or ")+'.</div>':'')+'</div>'+
  '<div class="card"><h2>Evidence</h2>'+(s.done.length?s.done.map(k=>'<div class="notice"><b>'+TESTS[k].icon+' '+TESTS[k].name+'</b><br>'+(c.results[k]||OK)+'</div>').join(""):'<p class="muted">No tests yet. Choose a test on the left.</p>')+
  '<h2 style="margin-top:18px">What is the cause?</h2>'+s.opts.map((o,i)=>'<button class="option '+(s.choice===i?"selected":"")+'" data-cause="'+i+'">'+o+'</button>').join("")+
  '<div class="row" style="margin-top:12px"><button class="primary" id="submit" '+(s.choice==null||!s.done.length?"disabled":"")+'>Submit diagnosis</button>'+(!s.done.length?'<span class="muted small">Run at least one test first.</span>':'')+'</div></div></div>';
  app.querySelectorAll("[data-test]").forEach(b=>b.onclick=()=>{s.done.push(b.dataset.test);s.used+=TESTS[b.dataset.test].cost;draw();});
  app.querySelectorAll("[data-cause]").forEach(b=>b.onclick=()=>{s.choice=+b.dataset.cause;draw();});
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  document.getElementById("submit").onclick=submit;}
function submit(){const s=cur,c=s.c,right=s.opts[s.choice]===c.cause;
  const useful=s.done.filter(k=>c.best.includes(k)).length;
  const p=(right?6:0)+(right&&s.used<=3?2:right&&s.used<=5?1:0)+(useful>0?2:0)-(s.hinted?1:0);
  const earned=Math.max(0,p);points+=earned;maxPoints+=10;records.push([c.title,right,earned]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">'+(right?"Case solved":"Not quite")+'</span><h2>'+(right?"✅ ":"🔧 ")+c.cause+'</h2><p><b>Fix:</b> '+c.fix+'</p><p><b>Building lesson:</b> '+c.lesson+'</p>'+
  (right?'':'<div class="warning">You chose: '+s.opts[s.choice]+'. Look at the evidence again: which test result pointed to the real cause?</div>')+
  '<p class="muted">The most useful tests were: '+c.best.map(k=>TESTS[k].name.toLowerCase()).join(" and ")+'. You used '+s.used+' build minutes.</p><p><b>+'+earned+' points</b></p><button class="primary" id="nx">'+(round+1<cases.length?"Next case":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("Troubleshooting report · "+level,points,maxPoints,"You solved "+records.filter(r=>r[1]).length+" of "+records.length+" cases. "+records.map(r=>(r[1]?"✅ ":"❌ ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
