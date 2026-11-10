let pyodide;
const INDEX='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
async function boot(){importScripts(INDEX+'pyodide.js');pyodide=await loadPyodide({indexURL:INDEX});self.postMessage({type:'ready'});}
boot().catch(e=>self.postMessage({type:'boot-error',error:String(e)}));
self.onmessage=async(e)=>{
 if(e.data.type!=='run'||!pyodide)return;
 const {id,code}=e.data;
 try {
  const wrapper=`import builtins as _b
_commands=[]
_output=[]
class _Robot:
 def move_forward(self):
  if len(_commands)>=120: raise RuntimeError('Too many commands (limit 120).')
  _commands.append('forward')
 def turn_left(self):
  if len(_commands)>=120: raise RuntimeError('Too many commands (limit 120).')
  _commands.append('left')
 def turn_right(self):
  if len(_commands)>=120: raise RuntimeError('Too many commands (limit 120).')
  _commands.append('right')
 def activate(self):
  if len(_commands)>=120: raise RuntimeError('Too many commands (limit 120).')
  _commands.append('activate')
def _print(*args,sep=' ',end='\\n'):
 _output.append(sep.join(str(a) for a in args)+end)
 if len(_output)>100: raise RuntimeError('Too much output.')
_safe={k:getattr(_b,k) for k in ['range','len','str','int','float','bool','list','tuple','dict','set','enumerate','min','max','abs','sum','round','zip','Exception','ValueError','TypeError']}
_safe['print']=_print
_env={'__builtins__':_safe,'robot':_Robot()}
exec(${JSON.stringify(code)},_env,_env)
{'commands':_commands,'output':''.join(_output)[:2500]}`;
  const result=pyodide.runPython(wrapper).toJs({dict_converter:Object.fromEntries});
  self.postMessage({type:'result',id,commands:result.commands,output:result.output});
 }catch(err){self.postMessage({type:'result',id,error:String(err).slice(0,1500)});}
};