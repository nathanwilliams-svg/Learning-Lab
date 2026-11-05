"use strict";
const app=document.getElementById("app");
let settings=Lab.load("printTeacher",{rounds:3,hints:true}),level="Beginner",round=0,points=0,maxPoints=0,st=null,list=[],records=[];
const PLATE=[220,220,250],NOZ=0.4;
/* Orientation data: d = [width, depth, height] on the plate (mm); oh = steepest overhang (degrees from vertical); br = longest bridge (mm); weak = load pulls layers apart */
const PARTS=[
 {name:"Phone stand",goal:"A sturdy stand that holds a phone at an angle.",functional:true,shape:.45,start:{o:1,wall:0.4,infill:10,sup:false,layer:0.2,brim:false},
  orient:[{n:"Lying on its back",d:[80,90,70],oh:30,br:0},{n:"Standing up",d:[80,70,90],oh:62,br:0},{n:"On its side",d:[70,90,80],oh:40,br:0}]},
 {name:"Sensor mount bracket",goal:"An L-shaped bracket that holds a distance sensor on a robot. The sensor pushes on the short arm.",functional:true,shape:.35,start:{o:0,wall:0.8,infill:10,sup:false,layer:0.2,brim:false},
  orient:[{n:"L standing upright",d:[40,20,40],oh:0,br:0,weak:true},{n:"L lying flat",d:[40,40,20],oh:0,br:0}]},
 {name:"Pencil cup",goal:"A cylinder to hold pencils on your desk.",shape:.25,hollow:true,start:{o:0,wall:0.4,infill:20,sup:false,layer:0.28,brim:false},
  orient:[{n:"Standing up (open end on top)",d:[70,70,100],oh:0,br:0},{n:"Upside down (open end on the plate)",d:[70,70,100],oh:0,br:66}]},
 {name:"Keychain name tag",goal:"A thin tag with raised letters for your backpack. The letters must look crisp.",detail:true,shape:.9,start:{o:1,wall:0.8,infill:20,sup:false,layer:0.28,brim:false},
  orient:[{n:"Flat on the plate",d:[60,25,3],oh:0,br:0},{n:"Standing on its edge",d:[60,3,25],oh:0,br:0,tippy:true}]},
 {name:"Robot flag pole",goal:"A thin pole that holds your team flag.",shape:.8,start:{o:0,wall:0.8,infill:20,sup:false,layer:0.2,brim:false},lvl:1,
  orient:[{n:"Standing straight up",d:[8,8,150],oh:0,br:0},{n:"Lying on its side",d:[150,8,8],oh:0,br:0}]},
 {name:"Electronics box",goal:"A box with a 30 mm window opening in the lid for a display.",functional:true,shape:.3,hollow:true,start:{o:0,wall:1.2,infill:20,sup:false,layer:0.2,brim:false},lvl:1,
  orient:[{n:"Lid on top",d:[60,50,35],oh:0,br:40},{n:"Upside down (lid on the plate)",d:[60,50,35],oh:0,br:0}]},
 {name:"Drone frame",goal:"A big flat frame for a classroom drone kit.",functional:true,shape:.25,start:{o:0,wall:1.2,infill:20,sup:false,layer:0.2,brim:false},lvl:2,
  orient:[{n:"One piece, flat",d:[260,260,20],oh:0,br:0},{n:"Split into two halves, flat",d:[260,130,20],oh:0,br:0,split:true,fitsNote:"Each half is 260 × 130 mm."},{n:"Two halves, turned diagonally",d:[184,184,20],oh:0,br:0,split:true}]}
];
function checks(s){const p=s.p,o=p.orient[s.o],[w,d,h]=o.d,out=[];
  out.push(["Fits on the 220 × 220 × 250 mm build plate",w<=PLATE[0]&&d<=PLATE[1]&&h<=PLATE[2],"Too big. Change the orientation or split the part."]);
  out.push(["Walls at least 0.8 mm (two nozzle widths)",s.wall>=0.8,"Walls thinner than two nozzle widths print with gaps or not at all."]);
  if(p.functional)out.push(["Strong enough for a working part (walls ≥ 1.2 mm, infill ≥ 15%)",s.wall>=1.2&&(p.hollow||s.infill>=15),"Working parts need thicker walls and some infill."]);
  out.push(["Overhangs 45° or less, or supports on",o.oh<=45||s.sup,"Steep overhangs droop because there’s nothing underneath."]);
  out.push(["Bridges 10 mm or shorter, or supports on",o.br<=10||s.sup,"Long bridges sag in the middle."]);
  out.push(["Stable on the plate",!(h/Math.min(w,d)>5&&!s.brim)&&!o.tippy,"Tall, thin parts wobble and get knocked over. Lay it down or add a brim."]);
  if(o.weak)out.push(["Load doesn’t pull layers apart",false,"Layer lines are the weakest direction. Orient the part so the load runs along the layers."]);
  if(p.detail)out.push(["Fine layers for crisp details (0.12 mm)",s.layer<=0.12,"Small raised letters need thin layers."]);
  return out;}
function estimate(s){const p=s.p,o=p.orient[s.o],[w,d,h]=o.d,parts=o.split?2:1;
  const Vout=w*d*h*p.shape*(o.split?1:1),area=2*(w*d+w*h+d*h)*p.shape*1.4,shell=Math.min(Vout,area*s.wall),inner=p.hollow?0:Math.max(0,Vout-shell)*s.infill/100,sup=s.sup?w*d*h*0.06:0;
  const V=shell+inner+sup,flow={0.12:3.5,0.2:6,0.28:8}[s.layer],sec=V/flow+h/s.layer*2.5+(s.brim?240:0);return{grams:V/1000*1.24*(parts===2&&!o.split?2:1),min:sec/60};}
function info(){return Lab.heading("Engineering & Design","3D Printing Design Checker","Check a part before you print it. Fix the problems a slicer would catch, and save filament and time.")}
function welcome(){app.innerHTML=info()+'<div class="card"><h2>Design for 3D printing</h2><p>Printers build parts one thin layer at a time from the bottom up. That means:</p><p>• Every layer needs something underneath it. <b>Overhangs</b> steeper than about 45° and long <b>bridges</b> need supports.<br>• Walls need to be at least <b>two nozzle widths</b> thick (0.8 mm for a 0.4 mm nozzle).<br>• Parts are weakest <b>between layers</b>, so orientation changes strength.<br>• Thinner layers look smoother but take longer.</p><p class="muted">Estimates assume PLA filament on a 220 × 220 × 250 mm printer with a 0.4 mm nozzle.</p></div><h2>Choose a level</h2>'+Lab.levels()+'<button id="teach">⚙️ Teacher controls</button>';
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>begin(b.dataset.level));
  document.getElementById("teach").onclick=()=>LabKit.teacher("printTeacher",settings,[{k:"rounds",label:"Parts per session",opts:[2,3,4,5]},{k:"hints",label:"Hints",type:"check",note:"Show a hint button"}],s=>{settings=s;welcome();});}
function begin(l){level=l;round=0;points=0;maxPoints=0;records=[];const li=["Beginner","Intermediate","Advanced"].indexOf(l);const pool=PARTS.filter(c=>(c.lvl||0)<=li);list=LabKit.pick(pool,Math.min(settings.rounds,pool.length));next();}
function next(){if(round>=list.length)return report();const p=list[round];st=Object.assign({p,hinted:false,first:null},JSON.parse(JSON.stringify(p.start)));st.first=estimate(st);draw();}
function view(s){const o=s.p.orient[s.o],[w,d,h]=o.d,sc=Math.min(150/Math.max(w,h,1),2.4),pw=w*sc,ph=Math.max(4,h*sc),x=150-pw/2,y=190-ph;
  const ohBad=o.oh>45&&!s.sup,brBad=o.br>10&&!s.sup;
  return '<svg viewBox="0 0 300 220" width="100%" style="display:block;max-width:420px;margin:auto"><rect x="10" y="190" width="280" height="10" fill="#8a99ad"/><text x="150" y="214" text-anchor="middle" font-size="11" fill="#51627b">build plate · side view</text>'+
   (s.brim?'<rect x="'+(x-10)+'" y="187" width="'+(pw+20)+'" height="3" fill="#f2b632"/>':'')+
   (s.sup?'<rect x="'+x+'" y="'+y+'" width="'+pw+'" height="'+ph+'" fill="url(#hatch)"/>':'')+
   '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#c9d4e4" stroke-width="2"/></pattern></defs>'+
   '<rect x="'+x+'" y="'+y+'" width="'+pw+'" height="'+ph+'" rx="3" fill="#b92430" opacity=".82"/>'+
   (ohBad?'<polygon points="'+(x+pw)+','+y+' '+(x+pw+28)+','+y+' '+(x+pw)+','+(y+22)+'" fill="#f2b632"/><text x="'+(x+pw+4)+'" y="'+(y-6)+'" font-size="11" fill="#9a5a00">'+o.oh+'° overhang</text>':'')+
   (brBad?'<line x1="'+x+'" y1="'+(y+6)+'" x2="'+(x+pw)+'" y2="'+(y+6)+'" stroke="#f2b632" stroke-width="4" stroke-dasharray="5 4"/><text x="150" y="'+(y-6)+'" text-anchor="middle" font-size="11" fill="#9a5a00">'+o.br+' mm bridge</text>':'')+
   (o.weak?'<text x="150" y="'+(y+ph/2+4)+'" text-anchor="middle" font-size="11" fill="#fff">load ↔ layers</text>':'')+
   '<text x="150" y="16" text-anchor="middle" font-size="12" fill="#1b2a42">'+w+' × '+d+' × '+h+' mm</text></svg>';}
function sel(id,label,opts,val){return '<label for="'+id+'">'+label+'</label><select id="'+id+'">'+opts.map(o=>'<option value="'+o[0]+'" '+(String(o[0])===String(val)?"selected":"")+'>'+o[1]+'</option>').join("")+'</select>';}
function draw(){const s=st,p=s.p,c=checks(s),e=estimate(s),pass=c.every(x=>x[1]);
  app.innerHTML=info()+'<div class="row"><span class="pill">'+level+'</span><span class="pill">Part '+(round+1)+' / '+list.length+'</span><span class="pill">Score '+points+'</span></div>'+
  '<div class="card"><span class="eyebrow">Print job</span><h2>'+p.name+'</h2><p>'+p.goal+'</p><p class="muted small">A classmate set this part up, but some settings will cause a failed print. Find and fix them.</p></div>'+
  '<div class="split"><div class="card"><h2>Print settings</h2>'+sel("o","Orientation on the plate",p.orient.map((o,i)=>[i,o.n]),s.o)+
  sel("wall","Wall thickness",[0.4,0.8,1.2,1.6,2.0].map(v=>[v,v+" mm"]),s.wall)+(p.hollow?'':sel("infill","Infill",[0,10,20,40,100].map(v=>[v,v+"%"]),s.infill))+
  sel("layer","Layer height",[[0.12,"0.12 mm (fine)"],[0.2,"0.20 mm (standard)"],[0.28,"0.28 mm (draft)"]],s.layer)+
  sel("sup","Supports",[["0","Off"],["1","On"]],s.sup?"1":"0")+sel("brim","Brim (extra edge for grip)",[["0","Off"],["1","On"]],s.brim?"1":"0")+
  '<div class="diagram" style="margin-top:12px">'+view(s)+'</div></div>'+
  '<div class="card"><h2>Checker</h2>'+c.map(x=>'<p>'+(x[1]?"✅ ":"❌ ")+x[0]+(x[1]?'':'<br><span class="small muted">'+x[2]+'</span>')+'</p>').join("")+
  '<div class="notice"><b>Estimate:</b> about '+e.grams.toFixed(0)+' g of filament and '+fmt(e.min)+' to print.<br><span class="small">Started at '+st.first.grams.toFixed(0)+' g and '+fmt(st.first.min)+'.</span></div>'+
  '<div class="row"><button class="primary" id="submit">'+(pass?"Send to printer":"Print anyway")+'</button>'+(settings.hints&&!s.hinted?'<button id="hint">💡 Hint</button>':'')+'</div>'+(s.hinted?'<div class="warning">'+hint(s,c)+'</div>':'')+'</div></div>';
  ["o","wall","infill","layer"].forEach(k=>{const el=document.getElementById(k);if(el)el.onchange=()=>{s[k]=+el.value;draw();};});
  ["sup","brim"].forEach(k=>{document.getElementById(k).onchange=e=>{s[k]=e.target.value==="1";draw();};});
  const h=document.getElementById("hint");if(h)h.onclick=()=>{s.hinted=true;draw();};
  document.getElementById("submit").onclick=submit;}
function fmt(m){return m>=60?Math.floor(m/60)+" h "+Math.round(m%60)+" min":Math.max(1,Math.round(m))+" min";}
function hint(s,c){const bad=c.find(x=>!x[1]);if(!bad)return"Everything passes. Can you save time or filament without breaking a rule? Supports and 100% infill cost a lot.";
  if(/plate/.test(bad[0]))return"Look at the orientation list. Is there a way to make the part fit?";if(/Overhang|Bridge|layers|Stable/i.test(bad[0]))return"Try every orientation. Often the best fix is turning the part, not adding supports.";return bad[2];}
function submit(){const s=st,c=checks(s),pass=c.every(x=>x[1]),e=estimate(s),o=s.p.orient[s.o];
  const lean=pass&&!(s.sup&&o.oh<=45&&o.br<=10)&&s.infill<=40;const earned=(pass?7:Math.round(4*c.filter(x=>x[1]).length/c.length))+(lean?2:0)+(s.hinted?0:1);points+=earned;maxPoints+=10;records.push([s.p.name,pass]);
  app.innerHTML=info()+'<div class="card"><span class="eyebrow">Print result</span><h2>'+(pass?"✅ Print successful: ":"💥 Print failed: ")+s.p.name+'</h2>'+
  (pass?'<p>The part came off the plate clean and strong. It used about '+e.grams.toFixed(0)+' g of filament and took '+fmt(e.min)+'.</p>':'<p>Problems the printer ran into:</p>'+c.filter(x=>!x[1]).map(x=>'<p>❌ '+x[0]+': '+x[2]+'</p>').join(""))+
  (pass&&!lean?'<p class="muted">It worked, but you could save filament: turn off supports you don’t need and keep infill at 40% or less.</p>':'')+
  '<p><b>+'+earned+' points</b></p><button class="primary" id="nx">'+(round+1<list.length?"Next part":"See my report")+'</button></div>';
  document.getElementById("nx").onclick=()=>{round++;next();};}
function report(){app.innerHTML=info()+Lab.report("3D printing report · "+level,points,maxPoints,"You fixed "+records.filter(r=>r[1]).length+" of "+records.length+" print jobs. "+records.map(r=>(r[1]?"✅ ":"💥 ")+r[0]).join(" · "))+' <button class="primary" onclick="welcome()">Try another level</button>';}
welcome();
