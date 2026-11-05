"use strict";
const app=document.getElementById("app");
let settings=Lab.load("substanceTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[];
/* Real reference properties. d = density g/cm³ */
const SUB={
 aluminum:{name:"Aluminum",look:"Shiny, silvery metal pieces",d:2.70,sol:"Does not dissolve",condS:"Conducts",condW:"—",mag:"Not attracted",vin:"No fizzing",heat:"Does not melt on a hot plate (melts at 660 °C)",iod:"No color change",lvl:0},
 iron:{name:"Iron",look:"Dull gray metal pieces",d:7.87,sol:"Does not dissolve",condS:"Conducts",condW:"—",mag:"Strongly attracted",vin:"No quick reaction",heat:"Does not melt on a hot plate (melts at 1538 °C)",iod:"No color change",lvl:0},
 copper:{name:"Copper",look:"Shiny, reddish-orange metal",d:8.96,sol:"Does not dissolve",condS:"Conducts",condW:"—",mag:"Not attracted",vin:"No fizzing",heat:"Does not melt on a hot plate (melts at 1085 °C)",iod:"No color change",lvl:1},
 salt:{name:"Table salt",look:"Small white cube-shaped crystals",d:2.17,sol:"Dissolves",condS:"Does not conduct",condW:"Solution conducts",mag:"Not attracted",vin:"No fizzing",heat:"Does not melt on a hot plate (melts at 801 °C)",iod:"No color change",lvl:0},
 sugar:{name:"Sugar",look:"Small white crystals",d:1.59,sol:"Dissolves",condS:"Does not conduct",condW:"Solution does not conduct",mag:"Not attracted",vin:"No fizzing",heat:"Melts and turns brown (caramelizes) near 186 °C",iod:"No color change",lvl:0},
 soda:{name:"Baking soda",look:"Fine white powder",d:2.20,sol:"Dissolves",condS:"Does not conduct",condW:"Solution conducts weakly",mag:"Not attracted",vin:"Fizzes and bubbles",heat:"Breaks down and gives off gas, no melting",iod:"No color change",lvl:1},
 chalk:{name:"Chalk (calcium carbonate)",look:"White powdery chunks",d:2.71,sol:"Does not dissolve",condS:"Does not conduct",condW:"—",mag:"Not attracted",vin:"Fizzes and bubbles",heat:"Does not melt on a hot plate",iod:"No color change",lvl:1},
 wax:{name:"Candle wax",look:"Waxy white solid",d:0.90,sol:"Does not dissolve, floats",condS:"Does not conduct",condW:"—",mag:"Not attracted",vin:"No fizzing",heat:"Melts at about 60 °C",iod:"No color change",lvl:0},
 starch:{name:"Cornstarch",look:"Very fine, squeaky white powder",d:1.50,sol:"Does not dissolve; makes a cloudy mixture",condS:"Does not conduct",condW:"Mixture does not conduct",mag:"Not attracted",vin:"No fizzing",heat:"Turns brown and burns, no clear melting",iod:"Turns blue-black",lvl:2},
 glass:{name:"Glass",look:"Clear, hard pieces",d:2.50,sol:"Does not dissolve",condS:"Does not conduct",condW:"—",mag:"Not attracted",vin:"No fizzing",heat:"Does not melt on a hot plate",iod:"No color change",lvl:2}
};
const TESTS={
 look:{name:"Observe appearance",cost:0,icon:"👁️",key:"look"},
 dens:{name:"Measure density",cost:2,icon:"⚖️"},
 sol:{name:"Add to water and stir",cost:1,icon:"💧",key:"sol"},
 condS:{name:"Test solid for electrical conductivity",cost:1,icon:"🔋",key:"condS"},
 condW:{name:"Test water mixture for conductivity",cost:1,icon:"⚡",key:"condW"},
 mag:{name:"Bring a magnet close",cost:1,icon:"🧲",key:"mag"},
 vin:{name:"Add vinegar",cost:1,icon:"🧪",key:"vin"},
 heat:{name:"Heat on a hot plate",cost:2,icon:"🔥",key:"heat"},
 iod:{name:"Add a drop of iodine",cost:1,icon:"🟤",key:"iod"}
};
function info(){return Lab.heading("Physical Science","Mystery Substance Lab","Identify unknown samples using their properties. Every test costs lab credits, so plan which evidence you need.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>Properties are clues</h2><p>Every pure substance has its own set of <b>characteristic properties</b>, like density, solubility, conductivity and whether it reacts with vinegar. One property is rarely enough. Combine clues until only one substance fits.</p><p>Compare your results to the <b>reference table</b>. Credits you save add to your score.</p><p class="muted">Simulated lab. Never taste or touch unknown chemicals in a real lab.</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("substanceTeacher",settings,[{k:"rounds",label:"Samples per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function pool(){const li=["Beginner","Intermediate","Advanced"].indexOf(level);return Object.keys(SUB).filter(k=>SUB[k].lvl<=li);}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];list=LabKit.pick(pool(),settings.rounds);next();}
function credits(){return level==="Beginner"?9:level==="Intermediate"?7:6}
function next(){if(round>=list.length)return report();const k=list[round],m=LabKit.noise(12+Math.random()*30,0),v=m/SUB[k].d;
  st={k,mass:m,vol:LabKit.noise(v,.03),done:["look"],used:0,choice:"",hinted:false,showRef:true};draw();}
function result(t){const sub=SUB[st.k];if(t==="dens")return"Mass: "+st.mass.toFixed(1)+" g · Volume (water displacement): "+st.vol.toFixed(1)+" mL → density ≈ <b>"+(st.mass/st.vol).toFixed(2)+" g/cm³</b>";
  if(t==="condW"&&sub.condW==="—")return"It doesn’t dissolve, so the water mixture doesn’t conduct.";return sub[TESTS[t].key];}
function refTable(keys){const cols=[["Substance",k=>SUB[k].name],["Density g/cm³",k=>SUB[k].d.toFixed(2)],["In water",k=>SUB[k].sol],["Solid conducts?",k=>SUB[k].condS],["Water mixture",k=>SUB[k].condW],["Magnet",k=>SUB[k].mag],["Vinegar",k=>SUB[k].vin],["Heating",k=>SUB[k].heat]];
  if(level==="Advanced")cols.push(["Iodine",k=>SUB[k].iod]);
  return '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:.82rem;min-width:760px">'+'<tr>'+cols.map(c=>'<th style="text-align:left;padding:5px 7px;border-bottom:2px solid #d9e1ec;background:#f2f6fb">'+c[0]+'</th>').join("")+'</tr>'+keys.map(k=>'<tr>'+cols.map(c=>'<td style="padding:5px 7px;border-bottom:1px solid #eef2f7">'+c[1](k)+'</td>').join("")+'</tr>').join("")+'</table></div>';}
function draw(){const s=st,left=credits()-s.used,keys=pool();
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Sample '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span><span class="pill">🪙 '+left+' credits left</span></div>'+
  '<div class="split"><div class="card"><span class="eyebrow">Unknown sample '+String.fromCharCode(65+round)+'</span><h2>Run tests</h2>'+Object.keys(TESTS).filter(k=>k!=="iod"||level==="Advanced").map(k=>{const t=TESTS[k],did=s.done.includes(k);return '<button class="option" data-t="'+k+'" '+(did||t.cost>left?"disabled":"")+'>'+t.icon+' '+t.name+' <span class="muted small">· '+(t.cost?t.cost+" credit"+(t.cost>1?"s":""):"free")+(did?" · done":"")+'</span></button>';}).join("")+
  (settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+(s.hinted?'<div class="warning">'+hint()+'</div>':'')+'</div>'+
  '<div class="card"><h2>Lab notebook</h2>'+s.done.map(k=>'<div class="notice"><b>'+TESTS[k].icon+' '+TESTS[k].name+':</b> '+result(k)+'</div>').join("")+
  '<label for="guess">My identification</label><select id="guess"><option value="">Choose a substance…</option>'+keys.map(k=>'<option value="'+k+'" '+(s.choice===k?"selected":"")+'>'+SUB[k].name+'</option>').join("")+'</select>'+
  '<div class="row" style="margin-top:12px"><button class="primary" id="submit" '+(s.choice?"":"disabled")+'>Submit identification</button></div></div></div>'+
  '<div class="card"><h2>Reference table</h2><p class="muted small">Possible substances for this level. Cross off any that don’t match your evidence.</p>'+refTable(keys)+'</div>';
  app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{s.done.push(b.dataset.t);s.used+=TESTS[b.dataset.t].cost;draw();});
  document.getElementById("guess").onchange=e=>{s.choice=e.target.value;draw();};
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  document.getElementById("submit").onclick=submit;}
function hint(){const sub=SUB[st.k];if(/metal/i.test(sub.look))return"It looks like a metal. Density or a magnet can tell metals apart.";
  if(sub.sol.startsWith("Dissolves"))return"It dissolves. Testing the water mixture’s conductivity or adding vinegar can separate the soluble white solids.";
  return"It doesn’t dissolve. Try vinegar, density, or heating to narrow it down.";}
function submit(){const s=st,sub=SUB[s.k],right=s.choice===s.k,left=credits()-s.used;
  const earned=(right?7:0)+(right?Math.min(3,Math.floor(left/2)):0)-(s.hinted?1:0);points+=Math.max(0,earned);maxPoints+=10;records.push([sub.name,right]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Identification</span><h2>'+(right?"✅ Correct! ":"❌ ")+'Sample '+String.fromCharCode(65+round)+' was '+sub.name+'</h2>'+
  (right?'':'<p>You chose '+SUB[s.choice].name+'. Compare the two rows in the reference table to find a property that tells them apart.</p>')+
  '<p><b>Key evidence:</b> density '+sub.d.toFixed(2)+' g/cm³; '+sub.sol.toLowerCase()+'; '+sub.vin.toLowerCase()+'; '+sub.mag.toLowerCase()+' by a magnet.</p><p>You used '+s.used+' of '+credits()+' credits.</p><p><b>+'+Math.max(0,earned)+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next sample":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("Substance identification report · "+level,points,maxPoints,"You identified "+records.filter(r=>r[1]).length+" of "+records.length+" samples: "+records.map(r=>(r[1]?"✅ ":"❌ ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
