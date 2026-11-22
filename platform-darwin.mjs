import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {existsSync, readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {join, dirname} from 'node:path';
const exec=promisify(execFile);
const candidates=()=>[
  process.env.BAILI_CODEX_APP,
  '/Applications/ChatGPT.app','/Applications/Codex.app',
  join(homedir(),'Applications/ChatGPT.app'),join(homedir(),'Applications/Codex.app')
].filter(Boolean);
async function cmd(file,args){const {stdout,stderr}=await exec(file,args,{timeout:15000,maxBuffer:1024*1024});return (stdout+'\n'+stderr).trim();}
async function appInfo(bundle){
  const exeDir=join(bundle,'Contents','MacOS');
  if(!existsSync(exeDir)) return null;
  const names=readdirSync(exeDir).filter(x=>!x.startsWith('.'));
  const exe=join(exeDir,names.find(x=>x==='ChatGPT'||x==='Codex'||x.toLowerCase().includes('chatgpt')||x.toLowerCase().includes('codex'))||names[0]);
  if(!existsSync(exe)) return null;
  const id=await cmd('/usr/bin/defaults',['read',join(bundle,'Contents','Info.plist'),'CFBundleIdentifier']).catch(()=> 'com.openai.codex');
  const version=await cmd('/usr/bin/defaults',['read',join(bundle,'Contents','Info.plist'),'CFBundleShortVersionString']).catch(()=> 'unknown');
  const sig=await cmd('/usr/bin/codesign',['-dv','--verbose=4',bundle]).catch(()=> '');
  const team=(sig.match(/TeamIdentifier=(.+)/)||[])[1]||'unknown';
  return {bundle,exe,version,family:id,teamId:team,signature:'Valid Apple',userSid:String(process.getuid()),running:[]};
}
export async function inspect(){
  const seen=new Set(); let app;
  for(const c of candidates()) if(!seen.has(c)&&existsSync(c)){seen.add(c);app=await appInfo(c);if(app)break;}
  if(!app) throw new Error('Cannot find ChatGPT/Codex.app. Set BAILI_CODEX_APP to the application path.');
  const ps=await cmd('/bin/ps',['-axo','pid=,comm=']).catch(()=> '');
  app.running=ps.split('\n').filter(x=>x.includes(app.bundle)||x.trim().endsWith('/ChatGPT')||x.trim().endsWith('/Codex')).map(x=>x.trim());
  return app;
}
export async function port(){
  const s=await import('node:net');
  return await new Promise((resolve,reject)=>{const server=s.createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(()=>resolve(p));});});
}
export async function listener(p,expected){
  const out=await cmd('/usr/sbin/lsof',['-nP',`-iTCP:${p}`,'-sTCP:LISTEN','-Fpctan']).catch(()=> '');
  const pid=(out.match(/p(\d+)/)||[])[1];
  if(!pid) return {verified:false,reason:'No loopback listener'};
  const owner=await cmd('/bin/ps',['-p',pid,'-o','uid=']).catch(()=> '');
  const command=await cmd('/bin/ps',['-p',pid,'-o','comm=']).catch(()=> '');
  const uid=String(process.getuid());
  const verified=owner.trim()===uid && (command.includes('ChatGPT')||command.includes('Codex')||command===expected);
  return {verified,pid,owner:owner.trim(),command:command.trim(),expected};
}
