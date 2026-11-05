"use strict";
/* Small SVG line chart used by several labs.
   MiniChart({series:[{name,color,points:[[x,y],...],dash}], xLabel, yLabel, xMax, yMin, yMax, goal:{y,label}, marks:[{x,label}]}) -> SVG string */
window.MiniChart=function(o){
  const W=640,H=300,L=58,R=18,T=18,B=46,pw=W-L-R,ph=H-T-B;
  const all=o.series.flatMap(s=>s.points);
  const xMax=o.xMax!=null?o.xMax:Math.max(1,...all.map(p=>p[0]));
  let yMin=o.yMin!=null?o.yMin:Math.min(0,...all.map(p=>p[1]));
  let yMax=o.yMax!=null?o.yMax:Math.max(1,...all.map(p=>p[1]),o.goal?o.goal.y:0)*1.1;
  if(yMax<=yMin)yMax=yMin+1;
  const nice=(span)=>{const raw=span/5,m=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/m;return (f<1.5?1:f<3?2:f<7?5:10)*m;};
  const xs=v=>L+v/xMax*pw, ys=v=>T+ph-(v-yMin)/(yMax-yMin)*ph;
  const fmt=v=>Math.abs(v)>=100||Number.isInteger(v)?String(Math.round(v)):v.toFixed(1);
  let g='';
  const yStep=nice(yMax-yMin);
  for(let v=Math.ceil(yMin/yStep)*yStep;v<=yMax+1e-9;v+=yStep){g+='<line x1="'+L+'" x2="'+(L+pw)+'" y1="'+ys(v)+'" y2="'+ys(v)+'" stroke="#dde4ee"/><text x="'+(L-8)+'" y="'+(ys(v)+4)+'" text-anchor="end" font-size="12" fill="#51627b">'+fmt(v)+'</text>';}
  const xStep=nice(xMax);
  for(let v=0;v<=xMax+1e-9;v+=xStep){g+='<line x1="'+xs(v)+'" x2="'+xs(v)+'" y1="'+T+'" y2="'+(T+ph)+'" stroke="#eef2f7"/><text x="'+xs(v)+'" y="'+(T+ph+18)+'" text-anchor="middle" font-size="12" fill="#51627b">'+fmt(v)+'</text>';}
  g+='<line x1="'+L+'" x2="'+(L+pw)+'" y1="'+(T+ph)+'" y2="'+(T+ph)+'" stroke="#8a99ad"/><line x1="'+L+'" x2="'+L+'" y1="'+T+'" y2="'+(T+ph)+'" stroke="#8a99ad"/>';
  if(o.goal){const y=ys(o.goal.y);g+='<line x1="'+L+'" x2="'+(L+pw)+'" y1="'+y+'" y2="'+y+'" stroke="#b92430" stroke-dasharray="6 5" stroke-width="1.5"/><text x="'+(L+pw-4)+'" y="'+(y-6)+'" text-anchor="end" font-size="12" font-weight="700" fill="#b92430">'+Lab.esc(o.goal.label||"Goal")+'</text>';}
  (o.marks||[]).forEach(m=>{const x=xs(m.x);g+='<line x1="'+x+'" x2="'+x+'" y1="'+T+'" y2="'+(T+ph)+'" stroke="#087b65" stroke-dasharray="3 4"/><text x="'+(x+4)+'" y="'+(T+12)+'" font-size="11" fill="#087b65">'+Lab.esc(m.label)+'</text>';});
  o.series.forEach(s=>{if(!s.points.length)return;const d=s.points.map((p,i)=>(i?"L":"M")+xs(Math.min(p[0],xMax)).toFixed(1)+" "+ys(Math.max(yMin,Math.min(yMax,p[1]))).toFixed(1)).join(" ");
    g+='<path d="'+d+'" fill="none" stroke="'+s.color+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"'+(s.dash?' stroke-dasharray="7 6"':'')+'/>';
    if(s.dots)s.points.forEach(p=>{g+='<circle cx="'+xs(p[0])+'" cy="'+ys(p[1])+'" r="4.5" fill="'+s.color+'"/>';});});
  g+='<text x="'+(L+pw/2)+'" y="'+(H-6)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#1b2a42">'+Lab.esc(o.xLabel||"")+'</text>';
  g+='<text transform="translate(15 '+(T+ph/2)+') rotate(-90)" text-anchor="middle" font-size="13" font-weight="700" fill="#1b2a42">'+Lab.esc(o.yLabel||"")+'</text>';
  const legend=o.series.length>1?'<div class="row small" style="margin-top:6px">'+o.series.map(s=>'<span class="pill"><span style="display:inline-block;width:14px;height:4px;border-radius:2px;background:'+s.color+';vertical-align:middle;margin-right:6px"></span>'+Lab.esc(s.name)+'</span>').join("")+'</div>':"";
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="'+Lab.esc((o.yLabel||"")+" versus "+(o.xLabel||""))+'" style="max-width:100%;height:auto;display:block">'+g+'</svg>'+legend;
};
/* Tiny shared helpers for the newer labs */
window.LabKit={
  pick:(arr,n)=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);},
  noise:(v,pct)=>v*(1+(Math.random()*2-1)*pct),
  teacher:(key,defaults,fields,onClose)=>{
    const s=Lab.load(key,defaults);const app=document.getElementById("app");
    app.innerHTML='<div class="card"><span class="eyebrow">Teacher controls</span><h2>Settings for this device</h2>'+fields.map(f=>'<label for="t-'+f.k+'">'+f.label+'</label>'+(f.type==="check"?'<label class="small"><input type="checkbox" id="t-'+f.k+'" '+(s[f.k]?"checked":"")+'> '+f.note+'</label>':'<select id="t-'+f.k+'">'+f.opts.map(v=>'<option '+(String(v)===String(s[f.k])?"selected":"")+'>'+v+'</option>').join("")+'</select>')).join("")+'<p class="muted small">Saved in this browser only.</p><div class="row"><button class="primary" id="t-save">Save and return</button></div></div>';
    document.getElementById("t-save").onclick=()=>{fields.forEach(f=>{const el=document.getElementById("t-"+f.k);s[f.k]=f.type==="check"?el.checked:(isNaN(+el.value)?el.value:+el.value);});Lab.save(key,s);onClose(s);};
  }
};
