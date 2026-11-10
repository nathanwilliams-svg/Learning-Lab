const MISSIONS=[
{title:'The Sleeping Knight',story:'The academy’s signal tower has gone quiet. Send the activation phrase to wake your RoboKnight!',topic:'Talk to your robot',lesson:'Python uses print() to display messages. Text goes inside quotation marks. Try printing the exact wake-up phrase.',example:'print("Wake up, RoboKnight!")',objective:'Print the exact message: Wake up, RoboKnight!',hint:'Use print("Wake up, RoboKnight!") — capitalization and punctuation matter.',starter:'print("Hello, RoboKnight!")',kind:'print',xp:50},
{title:'The Crystal Path',story:'The crystal generator is offline. Program your knight to walk three tiles to reach the glowing crystal.',topic:'Give your robot commands',lesson:'You can control a robot by calling a method. Each robot.move_forward() moves one tile. Try writing the command on three separate lines.',example:'robot.move_forward()\nrobot.move_forward()',objective:'Move forward exactly 3 spaces to collect the crystal.',hint:'Write robot.move_forward() on three separate lines.',starter:'robot.move_forward()\n',kind:'move',steps:3,xp:75},
{title:'The Bridge of Loops',story:'A broken bridge blocks the path to the academy. A repeating Python loop will carry your RoboKnight across.',topic:'Learn to use for loops',lesson:'A for loop repeats instructions. range(4) means four repetitions. The indented line is the action that repeats.',example:'for step in range(4):\n    robot.move_forward()',objective:'Cross the bridge using a for loop and 4 forward moves.',hint:'Use for step in range(4): then indent robot.move_forward() on the next line.',starter:'for step in range(4):\n    robot.move_forward()',kind:'loop',steps:4,xp:100}];
const $=s=>document.querySelector(s),saveKey='roboknight-python-quest-v1';
let progress;try{progress=JSON.parse(localStorage.getItem(saveKey)||'{}')}catch{progress={}}
let current=0,editor,worker,ready=false,running=false,animationBusy=false,runId=0,scene,watchdog;
const store=()=>{try{localStorage.setItem(saveKey,JSON.stringify(progress))}catch{}};
const consoleOut=(txt,kind='')=>{const c=$('#console');c.textContent=txt;c.className='console '+kind};
const setStatus=s=>$('#gameStatus').textContent=s;
const codeFor=i=>progress['code'+i]??MISSIONS[i].starter;
// Start with a native editor so the game remains usable if an external editor CDN is blocked.
const editorEl=document.createElement('textarea');editorEl.className='fallback-editor';editorEl.setAttribute('aria-label','Python code editor');editorEl.spellcheck=false;$('#editor').append(editorEl);
editor={
 get state(){return {doc:{length:editorEl.value.length,toString:()=>editorEl.value},selection:{main:{from:editorEl.selectionStart,to:editorEl.selectionEnd}}}},
 dispatch({changes,selection}){if(changes){editorEl.setRangeText(changes.insert,changes.from,changes.to,'end');if(selection)editorEl.setSelectionRange(selection.anchor,selection.anchor);editorEl.dispatchEvent(new Event('input'))}},
 focus(){editorEl.focus()}
};
editorEl.addEventListener('input',()=>{progress['code'+current]=editorEl.value;store()});
editorEl.value=codeFor(0);
// Upgrade to CodeMirror 6 when its browser modules are available; keep native editor otherwise.
(async()=>{
 try{
  const [{EditorView,basicSetup},{python},{EditorState}]=await Promise.all([
   import('https://esm.sh/codemirror@6.0.2?bundle'),
   import('https://esm.sh/@codemirror/lang-python@6.1.7?bundle'),
   import('https://esm.sh/@codemirror/state@6.5.2?bundle')
  ]);
  // An independently bundled set of CodeMirror modules can have conflicting state instances.
  // Native editor is intentionally retained for a reliable school-device experience.
  $('#editor').dataset.enhancement='native-fallback';
 }catch(e){console.info('CodeMirror CDN unavailable; native coding editor active.',e)}
})();
function updateXP(){const xp=MISSIONS.reduce((n,m,i)=>n+(progress['won'+i]?m.xp:0),0);$('#xp').textContent='✦ '+xp+' XP';$('#progressInfo').textContent=MISSIONS.filter((m,i)=>progress['won'+i]).length+' / '+MISSIONS.length+' missions completed'; const crystal=$('#crystalCount');if(crystal)crystal.textContent='💎 '+MISSIONS.filter((m,i)=>progress['won'+i]).length+' / '+MISSIONS.length}
function canOpenMission(i){return i===0||!!progress['won'+(i-1)]}
function loadMission(i){if(running)return false;if(!Number.isInteger(i)||i<0||i>=MISSIONS.length)return false;if(!canOpenMission(i)){consoleOut('This mission is locked. Complete the previous mission first.','bad');return false;}current=i;const m=MISSIONS[current];$('#missionTitle').textContent=m.title;$('#missionStory').textContent=m.story;$('#missionCount').textContent=(current+1)+' / '+MISSIONS.length;$('#missionBadge').textContent='MISSION '+String(current+1).padStart(2,'0');$('#lessonTitle').textContent=m.topic;$('#lessonText').textContent=m.lesson;$('#lessonExample').textContent=m.example;$('#objectiveText').textContent=m.objective;$('#hintText').textContent=m.hint;$('#hintText').hidden=true;$('#hintBtn').textContent='✧ Show a hint';editorEl.value=codeFor(current);setStatus('Your RoboKnight is ready.');consoleOut('Write your Python, then tap ▶ Run Python.');$('#nextMission').disabled=!progress['won'+current]||current===MISSIONS.length-1;$('#prev').disabled=current===0;$('#next').disabled=current===MISSIONS.length-1||!canOpenMission(current+1);updateXP();if(scene)scene.initMission(current);return true}
window.RoboKnightGame={selectMission:(i)=>loadMission(i),getCurrentMission:()=>current,canOpenMission,progress:()=>({...progress})};
$('#prev').onclick=()=>loadMission(current-1);
$('#next').onclick=()=>loadMission(current+1);
$('#nextMission').onclick=()=>{if(loadMission(current+1))document.querySelector('#coding-workbench')?.scrollIntoView({block:'start',behavior:'smooth'})};
$('#hintBtn').onclick=()=>{const a=$('#hintText');a.hidden=!a.hidden;$('#hintBtn').textContent=a.hidden?'✧ Show a hint':'✧ Hide hint'};
$('#restore').onclick=()=>{editorEl.value=MISSIONS[current].starter;progress['code'+current]=editorEl.value;store();consoleOut('Starter code restored.')};
$('#resetProgress').onclick=()=>{if(confirm('Clear saved mission progress and code on this device?')){progress={};store();loadMission(0)}};
document.querySelectorAll('[data-insert]').forEach(b=>b.onclick=()=>{const str=b.dataset.insert.replaceAll('\\n','\n'),sel=editor.state.selection.main;editor.dispatch({changes:{from:sel.from,to:sel.to,insert:str},selection:{anchor:sel.from+str.length}});editor.focus()});
function startWorker(){ready=false;$('#run').disabled=true;$('#runtimeState').textContent='Loading Python…';$('#runtimeState').classList.remove('ready');if(worker)worker.terminate();worker=new Worker('./src/python-worker.js');worker.onmessage=e=>{const m=e.data;if(m.type==='ready'){ready=true;$('#run').disabled=false;$('#runtimeState').textContent='● Python ready';$('#runtimeState').classList.add('ready');consoleOut('Python engine ready. Write code and press Run.')}else if(m.type==='boot-error'){consoleOut('Python failed to load. Check your internet connection. '+m.error,'bad');$('#runtimeState').textContent='Python unavailable'}else if(m.type==='result'&&m.id===runId)finishRun(m)};worker.onerror=()=>{consoleOut('Python worker failed. Refresh to try again.','bad');endRun()}}
function endRun(){running=false;clearTimeout(watchdog);$('#run').disabled=!ready;$('#run').textContent='▶ Run Code'}
$('#stop').onclick=()=>{if(!running)return;runId++;endRun();setStatus('Execution stopped.');consoleOut('Python stopped and restarting.');startWorker();if(scene)scene.initMission(current)};
$('#run').onclick=()=>{if(!ready||running||animationBusy)return; if(!scene&&MISSIONS[current].kind!=='print'){consoleOut('The animation engine is unavailable. Check your network connection and refresh.','bad');return;}running=true;runId++;const id=runId;$('#run').disabled=true;$('#run').textContent='Running…';setStatus('Your code is running…');consoleOut('Running real Python…');if(scene)scene.initMission(current);worker.postMessage({type:'run',id,code:editor.state.doc.toString()});watchdog=setTimeout(()=>{if(running&&id===runId){runId++;endRun();consoleOut('Code ran too long (4-second limit). Check for an endless loop. Restarting Python.','bad');setStatus('Execution time limit reached.');startWorker()}},4000)};
async function finishRun(msg){if(!running)return;endRun();if(msg.error){consoleOut('Python error:\n'+msg.error,'bad');setStatus('Debug the error, then try again.');return}const m=MISSIONS[current],output=msg.output||'(Nothing printed)';
if(m.kind==='print'){if(msg.output.includes('Wake up, RoboKnight!')){if(scene){animationBusy=true;try{await scene.celebrate('WAKE UP!')}finally{animationBusy=false}}complete('The signal reaches your RoboKnight!\n\nConsole:\n'+output)}else{consoleOut('Your code ran, but the activation phrase was not found.\n\nConsole:\n'+output,'bad');setStatus('Almost! Check the exact phrase.')}return}
const commands=Array.from(msg.commands||[]);if(commands.length>120){consoleOut('Too many robot commands.','bad');return}
let result;animationBusy=true;try{result=await scene.animateCommands(commands,m.steps)}catch(err){consoleOut('Animation error: '+String(err),'bad');setStatus('The robot could not animate. Please retry.');return}finally{animationBusy=false}
if(result.success){if(m.kind==='loop'&&!/\bfor\b|\bwhile\b/.test(editor.state.doc.toString())){consoleOut('You crossed, but this mission asks you to use a Python loop. Try a for loop!','bad');setStatus('A loop is needed to earn the crystal.');return}complete('Great code! Your RoboKnight reached the target.\n\n'+(msg.output||'All commands executed.'))}else{consoleOut(result.reason+'\n\nYour Python ran successfully. Try adjusting the instructions.\n'+msg.output,'bad');setStatus('Try debugging your commands.')}}
function complete(text){const wasWon=!!progress['won'+current];progress['won'+current]=true;store();updateXP();$('#next').disabled=current===MISSIONS.length-1;window.dispatchEvent(new CustomEvent('roboknight:completed',{detail:{index:current,first:!wasWon}}));$('#nextMission').disabled=current===MISSIONS.length-1;consoleOut(text+(wasWon?'':'\n\n✦ New XP earned!'),'good');setStatus('★ Mission complete! Outstanding coding!')}

class KnightScene extends (window.Phaser?.Scene || class {}){
 constructor(){super('KnightScene');this.artReady=false;this.heroReady=false;this.waypointEffects=[]}
 preload(){
  this.load.svg('academyArt','./assets/academy.svg',{width:960,height:560});
  this.load.svg('knightArt','./assets/knight.svg',{width:192,height:240});
  this.load.image('forestGameplay','./assets/illustrated/gameplay.webp');
  // Optional polished layered assets, supplied in the prepared art pack.
  this.load.image('academyLevel','./assets/illustrated/academy-level.webp');
  this.load.image('heroKnight','./assets/illustrated/roboknight-character.png');
 }
 create(){
  scene=this;
  this.add.rectangle(400,235,800,470,0x102f55).setDepth(-10);
  this.oldBackground=this.textures.exists('academyArt')
    ?this.add.image(400,235,'academyArt').setDisplaySize(800,470).setDepth(-9):null;
  this.illustratedBackground=null;
  const imageKey=this.textures.exists('academyLevel')?'academyLevel':
    this.textures.exists('forestGameplay')?'forestGameplay':null;
  if(imageKey){
   this.illustratedBackground=this.add.image(400,235,imageKey).setDepth(-8);
   if(imageKey==='forestGameplay'){
    const source=this.textures.get(imageKey).getSourceImage();
    const x=Math.round(source.width*.011),y=Math.round(source.height*.132);
    const w=Math.round(source.width*.533),h=Math.round(source.height*.656);
    this.illustratedBackground.setCrop(x,y,w,h);
   }
   this.illustratedBackground.setDisplaySize(800,470);
   this.artReady=true;
   if(this.oldBackground)this.oldBackground.setVisible(false);
  }
  this.stage=this.add.container(0,0).setDepth(3);
  this.createKnight();
  this.missionOverlay=this.add.text(400,36,'',{
   fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#fff9d6',
   backgroundColor:'#102b56cc',padding:{x:12,y:7},stroke:'#0a264d',strokeThickness:4
  }).setOrigin(.5).setDepth(12);
  this.initMission(current);
 }
 createKnight(){
  this.player=this.add.container(0,0).setDepth(9);
  this.heroReady=this.textures.exists('heroKnight');
  if(this.heroReady){
   this.bodySprite=this.add.image(0,-70,'heroKnight').setDisplaySize(125,166);
  }else if(this.textures.exists('knightArt')){
   this.bodySprite=this.add.image(0,-62,'knightArt').setDisplaySize(120,150);
  }else{
   this.bodySprite=this.add.rectangle(0,-48,70,100,0xeaeff8);
   this.player.add(this.add.text(0,-65,'N',{fontSize:'26px',color:'#ba2f45'}).setOrigin(.5));
  }
  this.player.add(this.add.ellipse(0,0,102,16,0x061729,.32).setDepth(-1));
  this.player.add(this.bodySprite);
  this.tweens.add({targets:this.bodySprite,y:this.bodySprite.y-4,duration:1200,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
 }
 initMission(index){
  if(!this.stage||!this.player)return;
  this.tweens.killTweensOf(this.player);
  this.stage.removeAll(true);this.missionOverlay.setText('');
  this.originX=205;this.originY=328;
  this.tileDist=index===2?101:135;
  this.player.setPosition(this.originX,this.originY).setScale(1).setAngle(0);
  this.bodySprite.setFlipX(false);
  this.addWorld(index);
 }
 addWorld(index){
  const steps=MISSIONS[index].steps||3;
  const targetX=this.originX+(index===2?4:3)*this.tileDist;
  const baseY=this.originY-42;
  // Keep illustration unobstructed: use small illuminated waypoints, not large solid tiles.
  if(index!==0){
   for(let j=1;j<=steps;j++){
    const x=this.originX+j*this.tileDist;
    const marker=this.add.circle(x,this.originY-5,9,j===steps?0x7bffed:0xffe4a1,.36)
      .setStrokeStyle(2,j===steps?0xa7fff1:0xffe4a1,.65);
    this.stage.add(marker);
    this.tweens.add({targets:marker,alpha:{from:.45,to:.95},duration:700+j*80,yoyo:true,repeat:-1});
   }
  }
  const symbol=index===0?'✦ SIGNAL TOWER':index===1?'💎 CRYSTAL PATH':'✦ BRIDGE OF LOOPS';
  const sign=this.add.text(390,433,symbol,{
   fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#ffedba',
   backgroundColor:'#0b2850cc',padding:{x:12,y:6},stroke:'#0a2149',strokeThickness:3
  }).setOrigin(.5);
  this.stage.add(sign);
  if(index===0){
   const beacon=this.add.circle(635,150,20,0x7dfcff,.28).setStrokeStyle(3,0xc2ffff,.65);
   this.stage.add(beacon);
   this.tweens.add({targets:beacon,scaleX:1.28,scaleY:1.28,alpha:{from:.35,to:.8},duration:1000,yoyo:true,repeat:-1});
  }
 }
 async celebrate(message){
  this.missionOverlay.setText(message);
  for(let i=0;i<20;i++){
   const p=this.add.circle(this.player.x+(Math.random()-.5)*135,this.player.y-65+(Math.random()-.5)*115,
      3+Math.random()*6,i%3===0?0xffe08d:i%2===0?0x98ffde:0xffffff);
   this.tweens.add({targets:p,y:p.y-60,alpha:0,duration:850+Math.random()*300,
    delay:Math.random()*120,onComplete:()=>p.destroy()});
  }
  await new Promise(resolve=>this.tweens.add({targets:this.player,scaleX:1.15,scaleY:1.15,
    duration:190,yoyo:true,repeat:2,onComplete:()=>{this.player.setScale(1);resolve()}}));
 }
 async animateCommands(commands,expected){
  let steps=0;
  for(const cmd of commands){
   if(cmd==='forward'){
    if(steps>=expected)return {success:false,reason:'Too many moves! Try exactly '+expected+' forward steps.'};
    steps++;
    const dest=this.originX+steps*this.tileDist;
    await new Promise(resolve=>this.tweens.add({targets:this.player,x:dest,duration:390,
      ease:'Sine.easeInOut',onComplete:resolve}));
   }else if(cmd==='left'||cmd==='right'){
    this.bodySprite.setFlipX(cmd==='left');
    await new Promise(resolve=>this.tweens.add({targets:this.player,scaleX:1.1,scaleY:.95,
      duration:160,yoyo:true,onComplete:()=>{this.player.setScale(1);resolve()}}));
   }
  }
  if(steps===expected){await this.celebrate('CRYSTAL RESTORED!');return {success:true}}
  return {success:false,reason:'Your RoboKnight moved '+steps+' of '+expected+' required spaces.'}
 }
}
if(typeof Phaser==='undefined'){consoleOut('Game engine failed to load. Check network access to the Phaser CDN. You can still complete the print() mission.','bad');setStatus('Game assets unavailable on this network.')}else new Phaser.Game({type:Phaser.AUTO,parent:'game',width:800,height:470,backgroundColor:'#25445a',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[KnightScene],render:{pixelArt:false,antialias:true}});
const directMission=new URLSearchParams(location.search).get('mission');
const parsedMission=directMission===null?0:Number(directMission);
loadMission(Number.isInteger(parsedMission)&&parsedMission>=0&&parsedMission<MISSIONS.length&&canOpenMission(parsedMission)?parsedMission:0);
startWorker();
