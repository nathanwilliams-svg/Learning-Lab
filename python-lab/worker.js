/* Python runs in a worker so long-running student programs do not freeze the page. */
"use strict";
let pyodide=null;
async function init(){
 try{
  importScripts("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js");
  pyodide=await loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v314.0.7/full/"});
  self.postMessage({type:"ready"});
 }catch(err){self.postMessage({type:"init-error",message:String(err)})}
}
self.onmessage=async event=>{
 const msg=event.data;
 if(msg.type!=="run"||!pyodide)return;
 let output=[],errors=[];
 try{
  pyodide.setStdout({batched:s=>output.push(s)});
  pyodide.setStderr({batched:s=>errors.push(s)});
  // New globals keep separate runs independent. Builtins remain available.
  const globals=pyodide.toPy({__name__:"__main__"});
  try{await pyodide.runPythonAsync(msg.code,{globals})}finally{globals.destroy()}
  self.postMessage({type:"result",id:msg.id,ok:true,output:output.join("\n"),error:errors.join("\n")});
 }catch(err){
  const text=String(err);
  self.postMessage({type:"result",id:msg.id,ok:false,output:output.join("\n"),error:text});
 }
};
init();