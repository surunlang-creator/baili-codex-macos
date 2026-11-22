import {mkdir,writeFile,chmod,rm} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
const root=dirname(fileURLToPath(import.meta.url));
if(process.platform==='win32') throw new Error('Use the Windows shortcut workflow on Windows.');
const name='Codex · 白璃动画.command';
const dir=process.env.BAILI_LAUNCHER_DIR||join(homedir(),'Desktop');
const target=join(dir,name);
const action=process.argv.includes('--remove')?'remove':'install';
if(action==='remove'){await rm(target,{force:true});console.log(`Removed ${target}`);}
else {await mkdir(dir,{recursive:true});const body=`#!/bin/zsh\ncd ${JSON.stringify(root)}\nexec /usr/bin/env node launcher.mjs --interactive\n`;await writeFile(target,body);await chmod(target,0o755);console.log(`Installed ${target}`);}
