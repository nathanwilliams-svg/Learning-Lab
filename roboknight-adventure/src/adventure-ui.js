(function(){
const titles=['The Sleeping Knight','The Crystal Path','The Bridge of Loops'],xp=[50,75,100],key='roboknight-python-quest-v1';
const get=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
let selected=0,lastReward=50;
const root=document.createElement('div');root.id='questOverlay';root.className='quest-overlay';
root.innerHTML='<div class="quest-frame"><div class="quest-top"><strong>🛡 NIPHER ROBOKNIGHTS</strong><span id="questStats"></span><button id="questClose" aria-label="Close menu">✕</button></div><div class="quest-view" id="questView"></div></div>';
document.body.appendChild(root);
const view=document.getElementById('questView');
const stats=()=>{const p=get();document.getElementById('questStats').textContent='⭐ '+xp.reduce((n,v,i)=>n+(p['won'+i]?v:0),0)+' XP   💎 '+titles.filter((_,i)=>p['won'+i]).length+'/3'};
function paint(kind){
stats();root.hidden=false;root.dataset.view=kind;root.dataset.mission=String(selected);
if(kind==='title'){view.innerHTML='<section class="quest-title"><div class="quest-mountains"></div><div class="quest-float island1">🏰</div><div class="quest-float island2">💎</div><div class="quest-hero"><img src="./assets/knight.svg" alt="RoboKnight hero"></div><div class="quest-brand"><div class="quest-crest">N</div><h1>RoboKnight<br><i>Adventure</i></h1><div class="quest-ribbon">THE LOST CODE</div><p>Code • Explore • Build • Save the Kingdom</p></div><div class="quest-title-buttons"><button class="quest-btn red" data-go="map">▶ PLAY ADVENTURE</button><button data-go="profile">👤 Profile</button><button data-go="awards">🏆 Achievements</button><button data-go="help">📖 How to Play</button></div></section>'}
if(kind==='map'){let cards=titles.map((t,i)=>{const p=get(),locked=i>0&&!p['won'+(i-1)];return '<button class="quest-mission '+(p['won'+i]?'won':'')+'" data-mission="'+i+'" '+(locked?'disabled':'')+'><span>'+(locked?'🔒':p['won'+i]?'⭐':'▶')+'</span><strong>'+(i+1)+'. '+t+'</strong><small>'+(locked?'Complete previous mission':'Knight Academy')+'</small></button>'}).join('');view.innerHTML='<section class="quest-map"><div class="quest-head"><span class="quest-ribbon">ADVENTURE MAP</span><h2>The Kingdom of Nipheria</h2><p>Choose a Python mission and restore the Code Crystals.</p></div><div class="quest-islands"><div>🏰<strong>Knight Academy</strong><small>3 missions</small></div><div>💎<strong>Crystal Caves</strong><small>Coming later</small></div><div>⚙️<strong>Gear Ruins</strong><small>Coming later</small></div><div>🏔️<strong>Glitch Peak</strong><small>Coming later</small></div></div><div class="quest-missions">'+cards+'</div><button class="quest-btn blue" data-go="title">← Main menu</button></section>'}
if(kind==='brief'){const text=['Use print() to send a message and wake the sleeping RoboKnight.','Use robot.move_forward() three times to reach the crystal.','Use a for loop to cross the bridge in four steps.'];const examples=['print("Wake up, RoboKnight!")','robot.move_forward()','for i in range(4):&#10;    robot.move_forward()'];view.innerHTML='<section class="quest-brief"><div class="quest-brief-hero"><img src="./assets/knight.svg" alt="RoboKnight"/><div class="quest-speech">Let’s learn Python and save the kingdom!</div></div><div class="quest-brief-content"><div class="quest-ribbon">MISSION '+(selected+1)+': '+titles[selected]+'</div><div class="quest-lesson"><h2>📖 Learn Python</h2><p>'+text[selected]+'</p><pre>'+examples[selected]+'</pre></div><div class="quest-objective"><h3>🎯 YOUR MISSION</h3><p>'+text[selected]+'</p></div><button class="quest-btn green" data-go="start">▶ START MISSION</button><button class="quest-back" data-go="map">← World Map</button></div></section>'}
if(kind==='victory'){view.innerHTML='<section class="quest-victory"><div class="quest-celebrate"><img src="./assets/knight.svg" alt="RoboKnight celebrates"/></div><div class="quest-award"><div class="quest-stars">⭐ ⭐ ⭐</div><h2>MISSION COMPLETE!</h2><h3>'+titles[selected]+'</h3><p>✅ Your Python executed<br>✅ You completed the challenge<br>✅ RoboKnight powered up!</p><div class="quest-gained">⭐ '+xp[selected]+' XP</div><div>💎 Code crystal restored!</div><button class="quest-btn green" data-go="continue">CONTINUE →</button><button class="quest-back" data-go="map">Back to world map</button></div></section>'}
if(kind==='profile'){const p=get(),earned=titles.filter((_,i)=>p['won'+i]).length,total=xp.reduce((a,b,i)=>a+(p['won'+i]?b:0),0);view.innerHTML='<section class="quest-awards quest-profile"><div class="quest-head"><div class="quest-ribbon">PLAYER PROFILE</div><h2>RoboCoder</h2><p>Novice RoboKnight · Your adventure continues!</p></div><div class="quest-profile-content"><img src="./assets/knight.svg" alt="RoboKnight hero"><div><h3>⭐ '+total+' XP</h3><p>💎 '+earned+' / 3 Code Crystals</p><p>✅ '+earned+' missions completed</p><p>🏆 '+earned+' / 4 achievements earned</p><p>Progress is saved on this device.</p></div></div><button class="quest-btn blue" data-go="title">← Main menu</button></section>'}
if(kind==='awards'){const p=get(),n=titles.filter((_,i)=>p['won'+i]).length;const labels=[['🛡','First Steps',!!p.won0],['💎','Crystal Collector',!!p.won1],['🔁','Loop Master',!!p.won2],['🏆','Academy Graduate',n===3]];view.innerHTML='<section class="quest-awards"><div class="quest-head"><div class="quest-ribbon">KNIGHT’S HALL</div><h2>🏆 Achievements</h2><p>Earn badges by solving Python missions.</p></div><div class="quest-badges">'+labels.map(a=>'<div class="quest-badge '+(a[2]?'earned':'locked')+'"><div>'+a[0]+'</div><strong>'+a[1]+'</strong><small>'+(a[2]?'UNLOCKED':'LOCKED')+'</small></div>').join('')+'</div><button class="quest-btn blue" data-go="title">← Main menu</button></section>'}
if(kind==='help'){view.innerHTML='<section class="quest-awards"><div class="quest-head"><div class="quest-ribbon">WELCOME, APPRENTICE</div><h2>How to Play</h2></div><div class="quest-help"><p>📖 Read the short Python lesson.</p><p>⌨️ Type real Python or tap the quick commands.</p><p>▶ Run your code to control RoboKnight.</p><p>🔧 Debug your mistakes using the feedback.</p><p>💎 Earn crystals and XP for completing missions.</p></div><button class="quest-btn blue" data-go="title">← Main menu</button></section>'}
}
view.addEventListener('click',e=>{const mission=e.target.closest('[data-mission]');if(mission&&!mission.disabled){selected=Number(mission.dataset.mission);paint('brief');return}const b=e.target.closest('[data-go]');if(!b)return;const dest=b.dataset.go;if(dest==='start'){if(typeof window.RoboKnightGame?.selectMission==='function'){window.RoboKnightGame.selectMission(selected);root.hidden=true}else alert('The Python game is still loading. Please refresh and try again.')}else if(dest==='continue'){if(selected<2){selected++;paint('brief')}else paint('awards')}else paint(dest)});
document.getElementById('questClose').onclick=()=>{root.hidden=true};
const nav=document.createElement('div');nav.className='quest-quicknav';nav.innerHTML='<button id="questOpenMap">🗺️ World Map</button><button id="questOpenAwards">🏆 Achievements</button>';
document.querySelector('.topbar')?.after(nav);
document.getElementById('questOpenMap').onclick=()=>paint('map');
document.getElementById('questOpenAwards').onclick=()=>paint('awards');
window.addEventListener('roboknight:completed',e=>{selected=e.detail.index;lastReward=e.detail.first?xp[selected]:0;setTimeout(()=>paint('victory'),650)});
// Load images independently so a missing file never blocks every illustrated screen.
// Absolute URLs avoid path differences between GitHub Pages and local development.
const artNames=['title','map','briefing','victory','achievements'];
const artBase=new URL('../assets/illustrated/',document.currentScript?.src||new URL('./src/adventure-ui.js',document.baseURI));
const artStatus=document.createElement('div');
artStatus.id='questArtStatus';
artStatus.setAttribute('role','status');
artStatus.className='quest-art-status';
artStatus.textContent='Loading illustrated game artwork…';
root.querySelector('.quest-top').append(artStatus);
const loaded=new Set(),failed=new Set();
function reportArtwork(){
 const count=loaded.size+failed.size;
 artStatus.textContent=count===artNames.length
  ? failed.size ? 'Art loading issue: '+[...failed].join(', ') : 'Illustrated art ready ✓'
  : 'Loading illustrated art '+count+'/'+artNames.length+'…';
 artStatus.classList.toggle('error',failed.size>0);
 if(count===artNames.length&&!failed.size){setTimeout(()=>{artStatus.hidden=true},2800)}
}
for(const name of artNames){
 const img=new Image();
 const file=new URL(name+'.webp',artBase);
 file.searchParams.set('v','20261109-2');
 img.onload=()=>{loaded.add(name);root.classList.add('art-'+name+'-ready');reportArtwork();};
 img.onerror=()=>{failed.add(name);console.error('RoboKnight image failed to load:',file.href);reportArtwork();};
 img.src=file.href;
}
reportArtwork();
window.RoboKnightMenus={open:paint};paint('title');
})();