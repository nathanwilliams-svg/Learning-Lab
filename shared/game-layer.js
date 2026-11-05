(function(){
"use strict";
const id=location.pathname.split("/").filter(Boolean).pop();
const apps={
"robot-maze":["robotics","🤖","RoboKnight","Navigate the robot arena. Predict, program, test and debug."],
"python-lab":["robotics","🐍","Byte the Bot","Build real Python skills through missions and experiments."],
"gear-ratio":["robotics","⚙️","GearBot","Help the workshop tune robot gear trains."],
"robot-sensors":["robotics","📡","Sensor Scout","Give robots smart responses to sensor signals."],
"engineering-studio":["engineering","🛠️","Chief Spark","A client needs a design. Test and improve it."],
"bridge-builder":["engineering","🌉","Archie","Build stronger bridges and defend your choices."],
"crane-pulleys":["engineering","🏗️","Captain Crane","Get the lifting crew ready with ideal pulley mechanics."],
"medical-mystery":["medical","🩺","Detective Pulse","Collect patient evidence before making a claim."],
"outbreak-investigator":["medical","🔬","Agent Atlas","Trace fictional outbreak clues through the data."],
"vital-signs":["medical","💓","Pulse Pal","Study fictional vital signs in context."],
"natural-synthetic":["science","🧪","Professor Atom","Investigate how familiar materials are made."],
"change-detective":["science","⚗️","Molecule Max","Investigate whether a new substance formed."],
"conservation-mass":["science","⚖️","Atom Ace","Track every atom and account for the missing mass."],
"robot-troubleshoot":["robotics","🔧","Fix-It Fran","Find the real cause before you fix the robot."],
"drivetrain-designer":["robotics","🏎️","Torque Tess","Balance speed and pushing power for your robot."],
"wind-turbine":["engineering","🌬️","Breezy","Catch the wind and turn it into power."],
"print-checker":["engineering","🖨️","Layer Lou","Catch print problems before they waste filament."],
"thermal-lab":["science","🌡️","Thermo","Slow down the flow of thermal energy."],
"experiment-design":["science","🧪","Variable Val","Change one thing at a time and let the data decide."],
"mystery-substance":["science","🔎","Sherlock Sample","Use properties as clues to name the unknown."],
"ramp-motion":["science","🛝","Rolling Rae","Measure motion and test what changes it."],
"brain-detective":["medical","🧠","Dr. Neuron","Match each symptom to the part of the brain behind it."],
"micro-lab":["medical","🧫","Petri Pete","Grow microbes safely and run fair experiments."]
};
const cfg=apps[id],main=document.querySelector("main");if(!cfg||!main)return;
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const key="nipher-game-v2:"+id;
const s=Object.assign({sessions:0,best:0,streak:0,xp:0,scores:[],badges:[],mode:"practice",sound:false,skin:"classic",lastDaily:"",pythonSeen:0},get(key,{}));
const q=new URLSearchParams(location.search);
if(["practice","challenge","timed","mission","boss"].includes(q.get("mode")))s.mode=q.get("mode");
const daily=()=>{const d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()].join("-")};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const save=()=>put(key,s);
let startAt=0,hintCount=0,missionProgress=0,seenReport=false,pythonSeen=s.pythonSeen||0,timeExpired=false,quiet=false;
document.body.dataset.labTheme=cfg[0];document.body.dataset.labSkin=s.skin;
const bar=document.createElement("section");bar.id="lab-gamebar";
bar.innerHTML='<div class="game-top"><div class="game-avatar" aria-hidden="true">'+cfg[1]+'</div><div class="game-title"><strong>'+esc(cfg[2])+' · Mission Control</strong><small>'+esc(cfg[3])+'</small></div><div class="game-metrics"><span class="game-stat" id="game-rank"></span><span class="game-stat" id="game-xp"></span><span class="game-stat" id="game-clock" hidden>05:00</span></div><button class="game-toggle" id="game-open" aria-expanded="false">🎮 Game Hub ▾</button></div><div class="game-lounge" id="game-lounge" hidden><h3>Game Hub · Your learning adventure</h3><p class="game-muted">Choose how you want to practice. These options add rewards but never change the science.</p><div class="game-form"><label for="game-mode">Mode</label><select id="game-mode"><option value="practice">Practice</option><option value="challenge">Challenge: one hint</option><option value="timed">Timed: 5-minute goal</option><option value="mission">Mission: finish 3 rounds</option><option value="boss">Boss quiz</option></select><button id="game-boss">👑 Boss quiz</button><button id="game-sound">🔇 Sounds off</button></div><div class="game-grid"><div class="game-box"><strong>⭐ Progress and rank</strong><div id="game-progress-text"></div><div class="game-smallbar"><span id="game-progress"></span></div><p class="game-muted" id="game-unlocks"></p></div><div class="game-box"><strong>🏅 Badges</strong><div class="game-badges" id="game-badges"></div></div><div class="game-box"><strong>☀️ Daily challenge</strong><div id="game-daily"></div><small class="game-muted">Finish one activity today.</small></div><div class="game-box"><strong>🏆 Personal best scores</strong><div id="game-highs"></div><small class="game-muted">Device-only scores, not a class leaderboard.</small></div></div><div class="game-form"><label for="game-skin">Unlockable look</label><select id="game-skin"><option value="classic">Classic Knight</option><option value="arcade">Arcade · 3 wins</option><option value="cosmic">Cosmic · 10 wins</option></select><button id="game-print">📜 Print certificate</button><button id="game-link">📋 Copy teacher challenge link</button></div><p id="game-tip" class="game-muted"></p><p class="game-muted">Progress is kept in this browser. On a shared iPad, scores may belong to more than one student.</p></div>';
main.insertAdjacentElement("beforebegin",bar);
const el=name=>document.getElementById(name);
const toast=document.createElement("div");toast.id="lab-toast";toast.hidden=true;toast.setAttribute("role","status");document.body.appendChild(toast);
const sparks=document.createElement("div");sparks.id="lab-sparkles";document.body.appendChild(sparks);
const overlay=document.createElement("div");overlay.id="lab-boss-overlay";overlay.hidden=true;document.body.appendChild(overlay);
const award=document.createElement("section");award.id="lab-print-award";document.body.appendChild(award);
const badges={first:"🌟 First Victory",master:"🏆 Score Master",streak:"🔥 Three in a Row",daily:"☀️ Daily Scientist",speed:"⚡ Speed Star",mission:"🎯 Mission Complete",boss:"👑 Boss Champion",coder:"🐍 Python Apprentice"};
function notify(msg){toast.textContent=msg;toast.hidden=false;clearTimeout(notify.t);notify.t=setTimeout(()=>toast.hidden=true,3000)}
function beep(ok){if(!s.sound)return;try{const T=window.AudioContext||window.webkitAudioContext;if(!T)return;const a=new T(),o=a.createOscillator(),g=a.createGain();o.type="sine";o.frequency.value=ok?760:230;g.gain.setValueAtTime(.02,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.2);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.22);o.onended=()=>a.close()}catch(e){}}
function confetti(){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;sparks.replaceChildren();for(let i=0;i<22;i++){const p=document.createElement("i");p.style.left=(Math.random()*95)+"%";p.style.background=["#f6c351","#65b9ee","#ff8c9e","#80d8b5"][i%4];p.style.animationDelay=(Math.random()*.22)+"s";sparks.appendChild(p)}setTimeout(()=>sparks.replaceChildren(),1600)}
function badge(k){if(!badges[k]||s.badges.includes(k))return;s.badges.push(k);notify("Badge unlocked: "+badges[k]);save()}
function level(){return s.sessions>=10?3:s.sessions>=5?2:s.sessions>=2?1:0}
const rankNames={robotics:["Robot Rookie","Circuit Scout","Code Commander","Robot Master"],medical:["Medical Intern","Case Investigator","Case Cracker","Lead Detective"],engineering:["Design Apprentice","Prototype Builder","Chief Engineer","Master Engineer"],science:["Lab Explorer","Evidence Detective","Science Specialist","Lab Legend"]};
function redraw(){
el("game-rank").textContent=rankNames[cfg[0]][level()];
el("game-xp").textContent=s.xp+" XP";
el("game-progress-text").textContent=s.sessions+" completed · Best "+s.best+"/100 · Streak "+s.streak;
el("game-progress").style.width=((s.sessions%3)/3*100)+"%";
el("game-unlocks").textContent=s.sessions<3?(3-s.sessions)+" completions to unlock Arcade":s.sessions<10?(10-s.sessions)+" more completions to unlock Cosmic":"Both cosmetic themes unlocked";
el("game-badges").innerHTML=s.badges.length?s.badges.map(k=>'<span class="game-badge">'+badges[k]+'</span>').join(""):'<span class="game-muted">Complete a challenge to earn your first badge.</span>';
el("game-daily").textContent=s.lastDaily===daily()?"✅ Daily mission completed!":"Complete one activity or Python mission today.";
el("game-highs").textContent=s.scores.length?s.scores.slice().sort((a,b)=>b-a).slice(0,5).map((x,i)=>(i+1)+". "+x+"/100").join(" · "):"No reports yet.";
el("game-mode").value=s.mode;el("game-sound").textContent=s.sound?"🔊 Sounds on":"🔇 Sounds off";
el("game-boss").disabled=s.sessions===0&&!(id==="python-lab"&&s.pythonSeen>0);
el("game-skin").querySelector('[value="arcade"]').disabled=s.sessions<3;
el("game-skin").querySelector('[value="cosmic"]').disabled=s.sessions<10;
el("game-skin").value=s.skin;el("game-clock").hidden=s.mode!=="timed";
el("game-tip").textContent=({practice:"Practice freely at your own pace.",challenge:"Challenge mode limits hints to one per round.",timed:"Try to finish in five minutes. The timer never interrupts your learning.",mission:"Complete 3 activities to earn a special badge.",boss:"Complete an activity first, then attempt a 3-question Boss Quiz."})[s.mode]+(s.mode==="mission"?" Progress: "+Math.min(3,missionProgress)+"/3.":"");
}
function startSession(){startAt=Date.now();seenReport=false;hintCount=0;timeExpired=false}
function done(score){const duration=startAt?Date.now()-startAt:null;startAt=0;s.sessions++;s.best=Math.max(s.best,score);s.scores.push(score);s.scores=s.scores.slice(-50);s.xp+=25+Math.floor(score/10);s.streak=score>=70?s.streak+1:0;missionProgress++;
badge("first");if(score>=90)badge("master");if(s.streak>=3)badge("streak");if(s.mode==="timed"&&duration!==null&&duration<=300000)badge("speed");if(s.mode==="mission"&&missionProgress>=3)badge("mission");if(s.lastDaily!==daily()){s.lastDaily=daily();badge("daily")}save();redraw();beep(true);confetti();notify("Mission complete! "+score+"/100 · XP earned!")}
function detect(){
const scoreHeader=Array.from(main.querySelectorAll("h1")).find(h=>/^\s*\d{1,3}\s*\/\s*\d{1,3}\s*$/.test(h.textContent));
if(scoreHeader&&!seenReport){seenReport=true;const m=scoreHeader.textContent.match(/(\d+)\s*\/\s*(\d+)/);if(Number(m[2])>0)done(Math.round(100*Number(m[1])/Number(m[2])))}
if(!scoreHeader)seenReport=false;
if(id==="python-lab"){const data=get("nipherPythonLab",{});const n=Array.isArray(data.completed)?data.completed.length:0;if(n>pythonSeen){const delta=n-pythonSeen;s.xp+=12*delta;s.sessions+=delta;s.best=Math.max(s.best,100);s.streak+=delta;s.scores.push(...Array(Math.min(delta,50)).fill(100));s.scores=s.scores.slice(-50);s.pythonSeen=n;pythonSeen=n;missionProgress+=delta;badge("coder");badge("first");if(s.sessions>=3)badge("streak");if(n>=10)badge("master");if(s.lastDaily!==daily()){s.lastDaily=daily();badge("daily")}if(s.mode==="mission"&&missionProgress>=3)badge("mission");save();redraw();confetti();beep(true);notify("Python mission complete! +12 XP")}}}
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;setTimeout(()=>{pending=false;detect()},70)}).observe(main,{subtree:true,childList:true,characterData:true});
document.addEventListener("click",e=>{let b=e.target.closest("button");if(!b||bar.contains(b)||overlay.contains(b))return;const label=b.textContent||"";
if(/\bhint\b/i.test(label)){if(s.mode==="challenge"&&hintCount>=1){e.preventDefault();e.stopImmediatePropagation();notify("One hint allowed in Challenge mode.");beep(false);return}hintCount++}
if(b.dataset.level||/^(start|try another|choose another|new challenge|play another)/i.test(label.trim()))startSession();
},true);
el("game-open").onclick=()=>{const isOpen=!el("game-lounge").hidden;el("game-lounge").hidden=isOpen;el("game-open").textContent=isOpen?"🎮 Game Hub ▾":"🎮 Game Hub ▴";el("game-open").setAttribute("aria-expanded",String(!isOpen))};
el("game-mode").onchange=e=>{s.mode=e.target.value;missionProgress=0;save();redraw();if(s.mode==="boss")openBoss()};
el("game-sound").onclick=()=>{s.sound=!s.sound;save();redraw();beep(true)};
el("game-skin").onchange=e=>{const v=e.target.value;if(v==="arcade"&&s.sessions<3||v==="cosmic"&&s.sessions<10)return;s.skin=v;document.body.dataset.labSkin=v;save();redraw()};
el("game-print").onclick=()=>{if(!s.sessions&&!(id==="python-lab"&&s.pythonSeen)){notify("Complete a mission to unlock your certificate.");return}award.innerHTML='<div style="font-size:60px">'+cfg[1]+'</div><h1>Nipher Learning Lab Certificate</h1><h2>'+esc(cfg[2])+' Challenge</h2><p>Presented for learning through investigation, testing and improvement.</p><p><strong>'+s.sessions+' completed challenges · '+s.xp+' XP · Best '+s.best+'/100</strong></p><p>Student: ________________________________</p><p>Date: __________________________________</p>';document.body.classList.add("print-game-award");window.print();setTimeout(()=>document.body.classList.remove("print-game-award"),1500)};
el("game-link").onclick=()=>{let url=new URL(location.href);url.searchParams.set("mode",s.mode);url.hash="";if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url.toString()).then(()=>notify("Class challenge link copied")).catch(()=>window.prompt("Copy this link",url.toString()))}else window.prompt("Copy this link",url.toString())};
const quiz={
robotics:[["What makes an IF statement useful?",["Making decisions","Adding batteries","Ignoring sensors"],0],["Why test a robot?",["To debug its behavior","To avoid writing code","To remove friction"],0],["What can affect a sensor?",["Calibration or lighting","The robot name","The school day"],0]],
engineering:[["What should an engineer do after testing?",["Use results to improve","Never change the design","Ignore constraints"],0],["Why consider a material budget?",["Resources are limited","Expense guarantees strength","Budgets change physics"],0],["What does a pulley trade for reduced force?",["More pulling distance","Free extra energy","Less rope movement"],0]],
medical:[["What supports a strong diagnosis hypothesis?",["Evidence and context","One guess","The coolest story"],0],["Can one vital-sign reading diagnose illness?",["No, context matters","Yes, always","Only in class"],0],["Does outbreak association prove a cause?",["No, investigate further","Always","Only with a graph"],0]],
science:[["What happens to atoms in reactions?",["They are rearranged","They disappear","They are all destroyed"],0],["Does melting create a new substance?",["Not necessarily; changing state is physical","Always","Only with water"],0],["Can a product contain natural and synthetic materials?",["Yes, such as blends","Never","Only if colored"],0]]};
function openBoss(){if(s.sessions===0&&!(id==="python-lab"&&s.pythonSeen>0)){notify("Finish one activity to unlock the Boss Quiz.");return}let index=0,correct=0,list=quiz[cfg[0]];overlay.hidden=false;function screen(){if(index>=list.length){let pass=correct>=2;overlay.innerHTML='<div class="game-modal"><h2>'+(pass?"👑 Boss cleared!":"🔍 Keep practicing!")+'</h2><p>'+correct+' of 3 correct answers.</p><button id="boss-done">Return to Lab</button></div>';overlay.querySelector("#boss-done").onclick=()=>overlay.hidden=true;if(pass){if(!s.badges.includes("boss"))s.xp+=40;badge("boss");save();redraw();confetti();beep(true)}return}
let q=list[index];overlay.innerHTML='<div class="game-modal"><button class="game-close" id="boss-close">✕ Close</button><p class="game-muted">Boss Question '+(index+1)+' / 3</p><h2>'+esc(q[0])+'</h2>'+q[1].map((x,i)=>'<button class="game-choice" data-answer="'+i+'">'+esc(x)+'</button>').join("")+'</div>';overlay.querySelector("#boss-close").onclick=()=>overlay.hidden=true;overlay.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{if(Number(b.dataset.answer)===q[2])correct++;else beep(false);index++;screen()})}screen()}
el("game-boss").onclick=openBoss;
overlay.onclick=e=>{if(e.target===overlay)overlay.hidden=true};
document.addEventListener("keydown",e=>{if(e.key==="Escape")overlay.hidden=true});
setInterval(()=>{if(s.mode!=="timed")return;const left=startAt?Math.max(0,300000-(Date.now()-startAt)):300000;const sec=Math.ceil(left/1000);el("game-clock").textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");if(left===0&&!timeExpired){timeExpired=true;notify("Time goal reached. Finish at your own pace!")}},1000);
redraw();detect();
})();