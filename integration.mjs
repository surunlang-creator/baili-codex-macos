import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {mountFilm} from './film.mjs';
import {mountWorkFilms} from './work-films.mjs';

// Written independently for this project. Reference repositories were studied for architecture only.
export function installSkin(win, mount, assets, config, mountVideo, mountWork) {
  if(win.top!==win)return {installed:false,reason:'not-top-window'};
  if(win.__bailiCodexSkin)return {installed:true,alreadyActive:true};
  const doc=win.document, root=doc.documentElement;
  if(!doc.body || !doc.querySelector('#root'))return {installed:false,reason:'main-window-not-ready'};
  const requestedStrength=Number(config.backgroundStrength);
  let scene, wallpaper, wallpaperReady=false, workStarted=false, backgroundPaused=false, disposed=false, phase='loading', ready=false, presented=false, presentationTimer=0, failure='', strength=Math.max(0,Math.min(1,Number.isFinite(requestedStrength)?requestedStrength:.85));
  const original=root.getAttribute('data-baili-active');
  const previousFocus=doc.activeElement;
  const frame=doc.createElement('div'); frame.title='白璃 Codex 外观动画'; frame.id='baili-skin-frame';
  Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0',zIndex:'0',background:'#02050a',pointerEvents:'none'});
  const style=doc.createElement('style');
  style.id='baili-skin-style';
  // Backgrounds only. Never replace --color-text, app foreground, theme classes,
  // color-scheme or user accent colors. Portaled menus need the same surface vars.
  style.textContent=`html[data-baili-active] body{background:var(--baili-base,#030710)!important}
html[data-baili-active] #root{position:relative;z-index:1;background:transparent!important}
html[data-baili-active] :is([data-app-shell-frame],[data-app-shell-page-surface=true],#root>div){background:transparent!important}
html[data-baili-active],html[data-baili-active] :where(#root,[data-theme],[data-radix-popper-content-wrapper],[role=menu]){
--app-color-background-surface:var(--baili-shell,rgba(6,12,20,.16))!important;--app-color-background-surface-under:var(--baili-shell,rgba(6,12,20,.16))!important;
--color-token-bg-primary:var(--baili-shell,rgba(6,12,20,.16))!important;--color-token-main-surface-primary:var(--baili-shell,rgba(6,12,20,.16))!important;--chat-background-color:transparent!important;
--app-color-background-elevated-primary:var(--baili-panel,rgba(6,12,20,.32))!important;--app-color-background-elevated-primary-opaque:var(--baili-panel,rgba(6,12,20,.32))!important;
--app-color-background-elevated-secondary:var(--baili-panel,rgba(6,12,20,.32))!important;--app-color-background-elevated-secondary-opaque:var(--baili-panel,rgba(6,12,20,.32))!important;
--menu-background-color:var(--baili-panel,rgba(6,12,20,.32))!important;--composer-background-color:var(--baili-panel,rgba(6,12,20,.32))!important;
--color-background-composer-surface:var(--baili-panel,rgba(6,12,20,.32))!important;--app-shell-sidebar-popover-background:var(--baili-panel,rgba(6,12,20,.32))!important}
html[data-baili-active] :is([role=menu],[data-radix-menu-content],[data-radix-popover-content],#root form:has([contenteditable=true]),#root form:has(textarea)){
background:var(--baili-panel,rgba(6,12,20,.32))!important;backdrop-filter:blur(12px)}
html[data-baili-active] #root :is(textarea,[contenteditable=true]){background:transparent!important}
html[data-baili-active] #root :is(pre,[role=dialog]){background-color:var(--baili-readable,rgba(6,12,20,.85))!important}
#baili-controls{position:fixed;right:18px;bottom:18px;z-index:2147483646;max-height:90vh;overflow-y:auto;font:12px 'Segoe UI','Microsoft YaHei',sans-serif;color:var(--baili-text,#d0e1ef)}
#baili-controls button{cursor:pointer;font:inherit;border:1px solid var(--baili-border,#516e83);border-radius:6px;background:var(--baili-button,#102233);color:var(--baili-text,#d0e1ef);padding:8px 10px}
#baili-settings{width:280px;padding:14px;margin-bottom:8px;background:var(--baili-panel,#091421);border:1px solid #456077;border-radius:8px;box-shadow:0 8px 30px #0007}
#baili-settings[hidden]{display:none}#baili-settings p{margin:0 0 12px;line-height:1.5;color:var(--baili-muted,var(--baili-text,#95aec0))}
#baili-settings label{display:flex;gap:8px;align-items:center;margin-bottom:12px}#baili-settings input[type=range]{width:140px;accent-color:#9cdaff}
#baili-settings div{display:flex;gap:6px;flex-wrap:wrap}#baili-controls button:focus-visible,#baili-controls input:focus-visible{outline:2px solid #9cdaff;outline-offset:3px}`;
  style.textContent=style.textContent.slice(style.textContent.indexOf('#baili-controls'));
  style.textContent+='\n#baili-media{width:360px;max-height:70vh;overflow:auto;padding:14px;margin-bottom:8px;background:var(--baili-panel,#091421);border:1px solid var(--baili-border,#456077);border-radius:8px;box-shadow:0 8px 30px #0007}#baili-media[hidden]{display:none}#baili-media h3{margin:0 0 10px;font-size:18px}#baili-media .media-toolbar{display:flex;gap:6px;margin-bottom:8px}#baili-media .media-toolbar input{flex:1;min-width:0;background:rgba(4,10,20,.5);border:1px solid var(--baili-border,#456077);color:var(--baili-text,#d0e1ef);padding:7px;border-radius:6px}#baili-media .music-player{padding:10px 0;border-top:1px solid var(--baili-border,#456077);margin-top:10px}#baili-media .music-title{font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#baili-media .music-subtitle{font-size:11px;opacity:.72;margin-top:3px}#baili-media .music-controls{display:flex;align-items:center;gap:8px;margin:8px 0}#baili-media .music-controls button{min-width:34px}#baili-media .music-controls #baili-music-play{border-radius:50%;width:42px;height:42px;background:#579fc0;color:white}#baili-media .music-time{display:flex;align-items:center;gap:6px;font-size:11px;opacity:.75}#baili-media .media-row{display:flex;gap:6px;align-items:center;margin:8px 0}#baili-media input[type=range]{flex:1}#baili-music-volume,#baili-bg-volume{appearance:none;height:7px;border-radius:7px;background:linear-gradient(90deg,#9b6cff 0 var(--progress,80%),#263344 var(--progress,80%) 100%);outline:none}#baili-music-volume::-webkit-slider-thumb,#baili-bg-volume::-webkit-slider-thumb{appearance:none;width:15px;height:15px;border-radius:50%;background:#b58cff;border:2px solid #eee2ff;box-shadow:0 0 8px #9b6cff88}#baili-music-volume::-moz-range-thumb,#baili-bg-volume::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#b58cff;border:2px solid #eee2ff}#baili-music-progress{appearance:none;height:7px;border-radius:7px;background:linear-gradient(90deg,#e35555 0 var(--progress,0%),#263344 var(--progress,0%) 100%);outline:none}#baili-music-progress::-webkit-slider-thumb{appearance:none;width:15px;height:15px;border-radius:50%;background:#ef6a6a;border:2px solid #ffd0d0;box-shadow:0 0 8px #e3555566}#baili-music-progress::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#ef6a6a;border:2px solid #ffd0d0}#baili-media .media-list{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:180px;overflow:auto}#baili-media .media-item{padding:7px;border:1px solid var(--baili-border,#456077);border-radius:6px;cursor:pointer;overflow:hidden}#baili-media .media-item.active{outline:2px solid #9cdaff}#baili-media .media-item img{width:100%;height:105px;object-fit:cover;border-radius:5px}#baili-media .media-video{height:105px;border-radius:5px;background:linear-gradient(135deg,#15263c,#314e6b);display:grid;place-items:center;color:#b7d8ea;font-size:22px}#baili-media .media-item strong{display:block;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#baili-media .media-item small{display:block;margin-top:4px}#baili-media small{opacity:.82;color:var(--baili-muted,var(--baili-text,#b7c8d8))}';
  const controls=doc.createElement('div');controls.id='baili-controls';
  controls.innerHTML='<section id="baili-settings" hidden aria-label="白璃外观设置"><p>白璃 · v11 预渲染播放 · 非官方临时外观层<br>恢复外观不会关闭本机调试端口；退出应用后从原图标打开才能关闭。</p><label>背景强度 <input type="range" min="0" max="100" step="1" aria-label="背景强度"><output></output></label><label>壁纸内容 <select aria-label="壁纸内容"><option value="steady">角色＋标题持续动态</option></select></label><label>明暗模式 <select aria-label="明暗模式"><option value="dark">暗色</option><option value="light">亮色</option><option value="auto">跟随系统</option></select></label><label>浏览器透明度 <input type=range min=10 max=100 step=1 value=24 aria-label="右侧浏览器透明度"><output>24%</output></label><label><input type="checkbox" aria-label="减少动态效果">减少动态效果</label><div><button type="button" data-action="replay">重播</button><button type="button" data-action="pause">暂停背景</button><button type="button" data-action="restore">恢复原外观</button><button type="button" data-action="reset-default">恢复白璃默认</button></div></section><section id="baili-media" hidden aria-label="白璃素材库"><h3>素材库</h3><div class="media-toolbar"><input id="baili-media-search" placeholder="搜索素材名称" aria-label="搜索素材名称"><select id="baili-media-sort" aria-label="素材排序"><option value="name">名称</option><option value="recent">最近使用</option><option value="type">类型</option></select></div><div class="media-row"><button type="button" id="baili-bg-add">添加背景</button><button type="button" id="baili-bg-sound" title="背景视频声音">🔇</button><input id="baili-bg-volume" type="range" min="0" max="100" value="50" aria-label="背景视频音量"><span id="baili-bg-volume-label">50%</span><input id="baili-bg-files" type="file" accept="image/*,video/*" multiple hidden></div><div class="media-row"><button type="button" id="baili-music-add">添加音乐</button><input id="baili-music-files" type="file" accept="audio/*" multiple hidden></div><div id="baili-bg-list" class="media-list" aria-label="背景列表"></div><div class="music-player"><div class="music-title" id="baili-music-title">未选择音乐</div><div class="music-subtitle" id="baili-music-subtitle">本地音乐</div><div class="music-time"><span id="baili-music-current">0:00</span><input id="baili-music-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="音乐进度"><span id="baili-music-total">0:00</span></div><div class="music-controls"><button type="button" id="baili-music-prev" title="上一首">⏮</button><button type="button" id="baili-music-play" title="播放">▶</button><button type="button" id="baili-music-next" title="下一首">⏭</button><button type="button" id="baili-music-mode" title="顺序播放">⇆</button><span class="music-volume">🔊 <input id="baili-music-volume" type="range" min="0" max="100" value="80" aria-label="音乐音量"><output id="baili-music-volume-label">80%</output></span></div></div><div class="media-row" hidden><button type="button" id="baili-music-play-old">播放</button><button type="button" id="baili-music-prev-old">上一首</button><button type="button" id="baili-music-next-old">下一首</button><select id="baili-music-mode-old" aria-label="音乐播放模式"><option value="order">顺序</option><option value="loop">循环</option><option value="shuffle">随机</option></select></div><div class="media-row" hidden><span id="baili-music-current-old">0:00</span><input id="baili-music-progress-old" type="range" min="0" max="1000" value="0" step="1" aria-label="旧版音乐进度"><span id="baili-music-total-old">0:00</span></div><div id="baili-music-list" class="media-list" aria-label="音乐列表"></div><audio id="baili-audio" preload="metadata"></audio></section><button type="button" id="baili-toggle" aria-expanded="false">白璃 · 设置</button><button type="button" id="baili-skip" style="margin-left:6px">跳过动画</button>';
  const panel=controls.querySelector('#baili-settings'), toggle=controls.querySelector('#baili-toggle'), skip=controls.querySelector('#baili-skip'), appearance=controls.querySelector('select[aria-label="明暗模式"]'), browserOpacity=controls.querySelector('input[aria-label="右侧浏览器透明度"]'), browserOpacityOutput=browserOpacity.nextElementSibling;
  appearance.value='dark';
  const mediaPanel=controls.querySelector('#baili-media'), mediaToggle=doc.createElement('button'), bgFiles=controls.querySelector('#baili-bg-files'), musicFiles=controls.querySelector('#baili-music-files'), bgList=controls.querySelector('#baili-bg-list'), musicList=controls.querySelector('#baili-music-list'), audio=controls.querySelector('#baili-audio'), musicProgress=controls.querySelector('#baili-music-progress'), musicCurrent=controls.querySelector('#baili-music-current'), musicTotal=controls.querySelector('#baili-music-total'), musicPlay=controls.querySelector('#baili-music-play'), musicPrev=controls.querySelector('#baili-music-prev'), musicNext=controls.querySelector('#baili-music-next'), musicMode=controls.querySelector('#baili-music-mode'), musicVolume=controls.querySelector('#baili-music-volume'), musicVolumeLabel=controls.querySelector('#baili-music-volume-label'), bgSound=controls.querySelector('#baili-bg-sound'), bgVolume=controls.querySelector('#baili-bg-volume'), bgVolumeLabel=controls.querySelector('#baili-bg-volume-label');
  const mediaSearch=controls.querySelector('#baili-media-search'), mediaSort=controls.querySelector('#baili-media-sort'), musicTitle=controls.querySelector('#baili-music-title'), musicSubtitle=controls.querySelector('#baili-music-subtitle'); mediaToggle.type='button';mediaToggle.textContent='素材库';mediaToggle.setAttribute('aria-expanded','false');controls.querySelector('#baili-toggle').after(mediaToggle);
  const slider=controls.querySelector('input[type=range]'), output=controls.querySelector('output'), reduce=controls.querySelector('input[type=checkbox]');
  const bgItems=[{id:'builtin-baili',name:'白璃 · 默认背景',kind:'builtin',url:assets.video,bytes:0,builtin:true}], musicItems=[]; let currentBg=0,currentMusic=0;
  const mediaDB=(()=>{let p;const open=()=>p||(p=new Promise((res,rej)=>{const r=win.indexedDB?.open('baili-media-library',1);if(!r){rej(new Error('IndexedDB unavailable'));return;}r.onupgradeneeded=()=>{r.result.createObjectStore('media',{keyPath:'id'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));return {async put(v){const db=await open();return new Promise((res,rej)=>{const t=db.transaction('media','readwrite');t.objectStore('media').put(v);t.oncomplete=res;t.onerror=()=>rej(t.error);});},async all(){const db=await open();return new Promise((res,rej)=>{const t=db.transaction('media');const q=t.objectStore('media').getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error);});}}})();
  const customBg=doc.createElement('video'); customBg.muted=true;customBg.defaultMuted=true;customBg.setAttribute('muted','');customBg.volume=.5;customBg.loop=true;customBg.playsInline=true;customBg.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;z-index:3;display:none'; frame.appendChild(customBg);
  const customImg=doc.createElement('img');customImg.style.cssText=customBg.style.cssText;customImg.style.display='none';frame.appendChild(customImg);
  const fmt=t=>{if(!Number.isFinite(t))return '0:00';return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')};
  async function makeThumb(x){if(x.kind==='image'){x.thumb=x.url;return x;}if(x.thumb)return x;try{const v=doc.createElement('video');v.muted=true;v.defaultMuted=true;v.src=x.silentUrl||x.url;v.preload='metadata';await new Promise((res,rej)=>{v.onloadeddata=res;v.onerror=rej;});v.currentTime=Math.min(.2,v.duration||.2);await new Promise(res=>{v.onseeked=res;setTimeout(res,400);});const canvas=doc.createElement('canvas');canvas.width=480;canvas.height=270;canvas.getContext('2d').drawImage(v,0,0,canvas.width,canvas.height);x.thumb=canvas.toDataURL('image/jpeg',.78);return x;}catch{return x;}}
  function renderMedia(){const q=(mediaSearch?.value||'').toLowerCase();const bs=bgItems.map((x,i)=>({x,i})).filter(y=>y.x.name.toLowerCase().includes(q));const ms=musicItems.map((x,i)=>({x,i})).filter(y=>y.x.name.toLowerCase().includes(q));bgList.innerHTML=bs.map(({x,i})=>`<div class="media-item ${i===currentBg?'active':''}" data-bg="${i}">${x.thumb?`<img src="${x.thumb}">`:'<div class="media-video">视频</div>'}<strong>${x.name}</strong><small>${x.kind==='image'?'图片':'视频'} · ${x.bytes?Math.ceil(x.bytes/1024)+'KB':''}</small></div>`).join('');musicList.innerHTML=ms.map(({x,i})=>`<div class="media-item ${i===currentMusic?'active':''}" data-music="${i}"><strong>${x.name}</strong><small>音乐 · ${x.bytes?Math.ceil(x.bytes/1024)+'KB':''}</small></div>`).join('');}
  let backgroundRequest=0;
  async function silentVideo(original){
    const bytes=new Uint8Array(await original.arrayBuffer()), dv=new DataView(bytes.buffer);
    const type=p=>String.fromCharCode(...bytes.subarray(p+4,p+8));
    function boxes(start,end){const out=[];for(let p=start;p<end;){if(p+8>end)throw Error('视频容器不完整');let n=dv.getUint32(p),h=8;if(n===1){if(p+16>end)throw Error('视频容器不完整');n=Number(dv.getBigUint64(p+8));h=16;}if(n===0)n=end-p;if(n<h||p+n>end)throw Error('不支持的视频容器');out.push({p,end:p+n,h,t:type(p)});p+=n;}return out;}
    const top=boxes(0,bytes.length),moov=top.find(b=>b.t==='moov');
    if(!moov)throw Error('无音轨背景目前支持 MP4/MOV，请先转换此视频格式');
    const tracks=boxes(moov.p+moov.h,moov.end).filter(b=>b.t==='trak');let video=false;
    const free=b=>bytes.set([102,114,101,101],b.p+4);
    for(const track of tracks){const mdia=boxes(track.p+track.h,track.end).find(b=>b.t==='mdia');if(!mdia)throw Error('缺少媒体信息');const handler=boxes(mdia.p+mdia.h,mdia.end).find(b=>b.t==='hdlr');if(!handler||handler.p+handler.h+12>handler.end)throw Error('缺少轨道类型');const kind=String.fromCharCode(...bytes.subarray(handler.p+handler.h+8,handler.p+handler.h+12));if(kind==='vide')video=true;else free(track);}
    if(!video)throw Error('文件没有视频轨道');
    // Preserve all byte offsets: disabled tracks become same-size free boxes.
    // Fragmented files require a full remux; never silently play the original.
    if(top.some(b=>b.t==='moof'))throw Error('分段 MP4 请先转换为普通 MP4 后导入');
    return new win.Blob([bytes],{type:'video/mp4'});
  }
  async function ensureSilent(x){if(x.silentUrl)return x.silentUrl;if(!x.silentBlob){x.silentBlob=await silentVideo(x.blob||await (await fetch(x.url)).blob());if(!x.builtin)await mediaDB.put({...x,url:undefined,silentUrl:undefined});}x.silentUrl=win.URL.createObjectURL(x.silentBlob);return x.silentUrl;}
  async function useBg(i){if(!bgItems[i])return;const request=++backgroundRequest;currentBg=i;const x=bgItems[i];customBg.pause();customBg.muted=true;bgSound.textContent='🔇';bgSound.setAttribute('aria-pressed','false');customBg.style.display='none';customImg.style.display='none';renderMedia();if(phase!=='background')return;
    try {const url=x.kind==='image'?x.url:await ensureSilent(x);if(request!==backgroundRequest||disposed)return;frame.style.display='block';frame.hidden=false;if(x.kind==='image'){customImg.src=url;customImg.style.display='block';}else{customBg.src=url;customBg.style.display='block';await customBg.play();}}catch(e){bgSound.title=e.message;bgSound.textContent='⚠';console.error('白璃无声背景:',e.message);}
  }
  function loadMusic(i,play=true){if(!musicItems[i])return;currentMusic=i;musicTitle.textContent=musicItems[i].name;musicSubtitle.textContent=musicItems[i].type||'本地音乐';audio.pause();musicPlay.textContent='▶';audio.src=musicItems[i].url;audio.load();renderMedia();if(play){void backgroundSound(false);customBg.muted=true;bgSound.textContent='🔇';audio.play().catch(()=>{});}}
  async function restoreMedia(){try{const all=await mediaDB.all();for(const x of all){x.url=URL.createObjectURL(x.blob);if(x.kind==='video'){try{await ensureSilent(x);}catch(e){console.error(e.message);}}if(x.kind!=='music')await makeThumb(x);(x.kind==='music'?musicItems:bgItems).push(x);}if(bgItems.length)useBg(0);renderMedia();}catch{}}
  bgFiles.onchange=async()=>{for(const f of bgFiles.files){const x={id:'bg-'+Date.now()+'-'+Math.random(),name:f.name,bytes:f.size,type:f.type,kind:f.type.startsWith('image/')?'image':'video',blob:f, url:URL.createObjectURL(f)};if(x.kind==='video'){try{await ensureSilent(x);}catch(e){bgSound.title=e.message;bgSound.textContent='⚠';continue;}}await makeThumb(x);bgItems.push(x);await mediaDB.put(x);}if(bgItems.length===1)useBg(0);renderMedia();};
  mediaSearch.oninput=renderMedia;mediaSort.onchange=renderMedia;musicFiles.onchange=async()=>{for(const f of musicFiles.files){const x={id:'music-'+Date.now()+'-'+Math.random(),name:f.name,bytes:f.size,type:f.type,kind:'music',blob:f,url:URL.createObjectURL(f)};musicItems.push(x);await mediaDB.put(x);}if(musicItems.length===1)loadMusic(0,false);renderMedia();};
  controls.querySelector('#baili-bg-add').onclick=()=>bgFiles.click();bgVolume.oninput=()=>{customBg.volume=Number(bgVolume.value)/100;bgVolume.style.setProperty('--progress',bgVolume.value+'%');bgVolumeLabel.textContent=bgVolume.value+'%';};bgVolume.oninput();async function backgroundSound(on){const x=bgItems[currentBg];if(!x||x.kind==='image'||phase!=='background')return;const request=++backgroundRequest;const at=customBg.currentTime;customBg.pause();customBg.muted=true;try{const url=on?x.url:await ensureSilent(x);if(request!==backgroundRequest||disposed)return;customBg.src=url;customBg.onloadedmetadata=()=>{if(request===backgroundRequest&&Number.isFinite(customBg.duration))customBg.currentTime=Math.min(at,Math.max(0,customBg.duration-.05));};if(on){audio.pause();musicPlay.textContent='▶';}customBg.muted=!on;bgSound.textContent=on?'🔊':'🔇';bgSound.setAttribute('aria-pressed',String(on));await customBg.play();}catch(e){bgSound.title=e.message;}}bgSound.onclick=()=>backgroundSound(customBg.muted);controls.querySelector('#baili-music-add').onclick=()=>musicFiles.click();bgList.onclick=e=>{const n=e.target.closest('[data-bg]');if(n)useBg(Number(n.dataset.bg));};musicList.onclick=e=>{const n=e.target.closest('[data-music]');if(n)loadMusic(Number(n.dataset.music),false);};mediaToggle.onclick=()=>{mediaPanel.hidden=!mediaPanel.hidden;if(!mediaPanel.hidden){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}mediaToggle.setAttribute('aria-expanded',String(!mediaPanel.hidden));};
  musicPlay.onclick=()=>{if(audio.paused){void backgroundSound(false);customBg.muted=true;bgSound.textContent='🔇';audio.play().catch(()=>{});musicPlay.textContent='❚❚';}else{audio.pause();musicPlay.textContent='▶';}};musicVolume.oninput=()=>{audio.volume=Number(musicVolume.value)/100;musicVolume.style.setProperty('--progress',musicVolume.value+'%');musicVolumeLabel.textContent=musicVolume.value+'%';};musicVolume.oninput();musicPrev.onclick=()=>loadMusic((currentMusic-1+musicItems.length)%musicItems.length);musicNext.onclick=()=>loadMusic(musicMode.dataset.mode==='shuffle'?Math.floor(Math.random()*musicItems.length):(currentMusic+1)%musicItems.length);musicMode.dataset.mode='order';musicMode.onclick=()=>{const modes=[['order','⇆','顺序播放'],['loop','↻','循环播放'],['shuffle','🔀','随机播放']];const i=modes.findIndex(x=>x[0]===musicMode.dataset.mode);const n=modes[(i+1)%modes.length];musicMode.dataset.mode=n[0];musicMode.textContent=n[1];musicMode.title=n[2];};audio.ontimeupdate=()=>{musicProgress.value=audio.duration?String(Math.round(audio.currentTime/audio.duration*1000)):'0';musicProgress.style.setProperty('--progress',audio.duration?String(audio.currentTime/audio.duration*100)+'%':'0%');musicCurrent.textContent=fmt(audio.currentTime);musicTotal.textContent=fmt(audio.duration);};musicProgress.oninput=()=>{if(audio.duration){audio.currentTime=Number(musicProgress.value)/1000*audio.duration;musicProgress.style.setProperty('--progress',String(Number(musicProgress.value)/10)+'%');}};audio.onended=()=>{if(musicMode.dataset.mode==='loop'){audio.currentTime=0;audio.play();}else if(musicItems.length>1)musicNext.click();};restoreMedia();
  function applyAppearance(){
    const mode=appearance.value==='auto'?(win.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):appearance.value;
    const dark=mode==='dark';
    controls.style.setProperty('--baili-panel',dark?'rgba(7,13,24,.94)':'rgba(245,248,252,.94)');
    controls.style.setProperty('--baili-button',dark?'#102233':'#eaf1f7');
    controls.style.setProperty('--baili-border',dark?'#516e83':'#8aa4b8');
    controls.style.setProperty('--baili-text',dark?'#d0e1ef':'#172738');controls.style.setProperty('--baili-muted',dark?'#95aec0':'#344b60');
    frame.style.filter=dark?'brightness(.78) saturate(1.08)':'brightness(1.08) saturate(.92)';
  }
  appearance.onchange=applyAppearance;applyAppearance();
  function restoreDefault(){customBg.pause();customBg.style.display='none';customImg.style.display='none';scene?.pause(true);wallpaper?.pause(true);scene?.show(false);wallpaper?.show(false);currentBg=0;frame.style.filter='brightness(1) saturate(1)';frame.style.display='none';frame.hidden=true;appearance.value='light';applyAppearance();browserOpacity.value='100';applyBrowserOpacity();strength=.2;slider.value='20';output.textContent='20%';setStrength(.2);mediaPanel.hidden=true;panel.hidden=false;toggle.setAttribute('aria-expanded','true');renderMedia();}
  controls.querySelector('[data-action=restore]').onclick=restoreDefault;
  controls.querySelector('[data-action=reset-default]').onclick=restoreDefault;
  function applyBrowserOpacity(){
    const value=Math.max(10,Math.min(100,Number(browserOpacity.value)||24));
    browserOpacityOutput.textContent=value+'%';
    doc.querySelectorAll('webview').forEach(view=>{view.style.opacity=String(value/100);view.style.backgroundColor='transparent';});
  }
  browserOpacity.oninput=applyBrowserOpacity;applyBrowserOpacity();

  slider.value=String(Math.round(strength*100));output.textContent=slider.value+'%';reduce.checked=!!config.reduceMotion||win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const soundLabel=doc.createElement('label'),sound=doc.createElement('input');sound.type='checkbox';sound.setAttribute('aria-label','启用启动音乐');soundLabel.append(sound,'启用启动音乐（点击后重播生效）');panel.insertBefore(soundLabel,panel.querySelector('div'));sound.onchange=()=>scene?.sound(sound.checked);
  const cycleLabel=controls.querySelector('select').parentElement;cycleLabel.textContent='工作背景：1.5 秒文字渐隐后，无文字 16 秒静音循环';
  const opacityLabel=doc.createElement('label'),opacitySlider=doc.createElement('input'),opacityOutput=doc.createElement('output');opacitySlider.type='range';opacitySlider.min='10';opacitySlider.max='90';opacitySlider.step='1';opacitySlider.setAttribute('aria-label','菜单与输入框底色');opacitySlider.value=String(Math.round((Number(config.panelOpacity)||.24)*100));opacityLabel.append('菜单/输入框底色 ',opacitySlider,opacityOutput);panel.insertBefore(opacityLabel,panel.querySelector('div'));
  const themeStyle=doc.createElement('style');themeStyle.id='baili-theme-surfaces';
  function syncTheme(){
    if(disposed)return;const color=win.getComputedStyle(doc.querySelector('#root')).color,parts=color.match(/[\d.]+/g)||[];
    const rgb=parts.slice(0,3).map(Number),lum=rgb.length===3?(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)/255:1;
    const dark=lum>.45,tone=dark?'6,12,20':'245,247,250',base=dark?'#030710':'#f5f7fa',alpha=Number(opacitySlider.value)/100;opacityOutput.textContent=opacitySlider.value+'%';
    const next=`html[data-baili-active]{--baili-base:${base};--baili-shell:rgba(${tone},.16);--baili-panel:rgba(${tone},${alpha});--baili-readable:rgba(${tone},.85)}`;
    if(themeStyle.textContent!==next)themeStyle.textContent=next;
  }
  let themeTimer=0;const themeObserver=new win.MutationObserver(()=>{win.clearTimeout(themeTimer);themeTimer=win.setTimeout(syncTheme,40);});
  themeObserver.observe(root,{attributes:true,attributeFilter:['class','style','data-theme']});themeObserver.observe(doc.querySelector('#root'),{attributes:true,attributeFilter:['class','style','data-theme']});opacitySlider.oninput=()=>{syncTheme();frame.style.opacity=String(Number(opacitySlider.value)/100);};
  function backgroundSync(){if(phase!=='background')return;const hold=backgroundPaused||strength===0;
    if(wallpaperReady&&!workStarted){wallpaper.start();workStarted=true;}
    scene?.pause(wallpaperReady||hold);wallpaper?.show(wallpaperReady);wallpaper?.pause(hold);}
  function setStrength(value) {strength=Math.max(0,Math.min(1,Number(value)||0));output.textContent=Math.round(strength*100)+'%';
    if(phase==='background'){frame.style.opacity=String(strength);frame.hidden=strength===0;backgroundSync();}}
  function finish() {if(disposed)return;phase='background';if(bgItems[currentBg])useBg(currentBg);frame.style.zIndex='0';frame.style.opacity=String(strength);frame.style.pointerEvents='none';frame.hidden=false;
    skip.hidden=true;
    backgroundSync();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
  function replay() {if(!ready||disposed)return;phase='playing';frame.style.display='block';customBg.pause();customBg.style.display='none';customImg.style.display='none';frame.hidden=false;frame.style.zIndex='0';frame.style.opacity='1';frame.style.pointerEvents='none';
    root.removeAttribute('data-baili-active');skip.hidden=false;workStarted=false;wallpaper?.show(false);scene.pause(false);scene.replay();}
  function dispose() {if(disposed)return;disposed=true;phase='disposed';win.clearTimeout(watchdog);win.clearTimeout(themeTimer);win.clearTimeout(presentationTimer);themeObserver.disconnect();themeStyle.remove();wallpaper?.dispose();scene?.dispose();win.removeEventListener('keydown',key,true);frame.remove();controls.remove();style.remove();
    
    win.removeEventListener('keydown',key,true);win.removeEventListener('pagehide',dispose);delete win.__bailiCodexSkin;}
  function showPanel() {panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));}
  function key(e) {if(e.ctrlKey&&e.altKey&&e.code==='KeyB'){e.preventDefault();showPanel();}
    else if(e.key==='Escape' && phase==='playing'){e.preventDefault();scene?.skip();}}
  toggle.onclick=showPanel;skip.onclick=()=>scene?.skip();slider.oninput=()=>setStrength(Number(slider.value)/100);reduce.onchange=()=>{scene?.setReduced(reduce.checked);wallpaper?.setReduced(reduce.checked);backgroundSync();};
  controls.querySelector('[data-action=replay]').onclick=replay;
  controls.querySelector('[data-action=pause]').onclick=e=>{backgroundPaused=!backgroundPaused;if(phase==='background')backgroundSync();else scene?.pause(backgroundPaused);e.target.textContent=backgroundPaused?'继续背景':'暂停背景';};
  let watchdog=win.setTimeout(()=>{if(!presented){failure='No visible progressing first frame';dispose();}},25000);
  function confirmPresentation(){
    if(disposed)return;
    const s=scene?.status(),r=frame.getBoundingClientRect();
    if(ready && !doc.hidden && r.width>0 && r.height>0 && s?.presented){
      presented=true;win.clearTimeout(watchdog);return;
    }
    presentationTimer=win.setTimeout(confirmPresentation,100);
  }
  function initialize(){
    if(disposed)return;
    try{
      const fw=win, fd=doc;
      fw.addEventListener('keydown',key,true);
      scene=mountVideo(fw,frame,assets.startup,{...config,loop:false},finish);
      scene.ready.then(()=>{
        if(disposed)return;ready=true;if(phase==='loading')phase='playing';scene.show(true);scene.setReduced(reduce.checked);confirmPresentation();
        if(reduce.checked)scene.skip();
        win.setTimeout(()=>{
          if(disposed)return;wallpaper=mountWork(fw,frame,assets.entry,assets.video,config,mountVideo);
          wallpaper.ready.then(()=>{if(disposed)return;wallpaperReady=true;wallpaper.setReduced(reduce.checked);backgroundSync();}).catch(e=>{if(disposed)return;failure='Background film: '+e.message;dispose();});
        },1200);
      }).catch(()=>dispose());
    }catch{dispose();}
  }
  win.__bailiCodexSkin={dispose,replay,openSettings:showPanel,status:()=>({ready,presented,failure,visibility:doc.visibilityState,phase,strength,backgroundPaused,scene:scene?.status(),wallpaper:wallpaper?.status()})};
  doc.head.append(style,themeStyle);doc.body.appendChild(controls);syncTheme();doc.body.appendChild(frame);initialize();
  win.addEventListener('keydown',key,true);win.addEventListener('pagehide',dispose,{once:true});
  return {installed:true};
}

export async function buildPayload(root) {
  const [startup,video,entry,configText]=await Promise.all(['startup.mp4','wallpaper.mp4','handoff.mp4','config.json'].map(x=>readFile(join(root,x))));
  const config=JSON.parse(configText);
  if(config.wallpaperFile!=='wallpaper.mp4')throw new Error('Expected the dedicated local wallpaper.mp4');
  if(startup.length+video.length+entry.length>23*1024*1024)throw new Error('Combined films exceed the 23 MiB local payload limit');
  const assets={startup:'data:video/mp4;base64,'+startup.toString('base64'),video:'data:video/mp4;base64,'+video.toString('base64'),entry:'data:video/mp4;base64,'+entry.toString('base64')};
  return `(${installSkin.toString()})(window,null,${JSON.stringify(assets)},${JSON.stringify(config)},${mountFilm.toString()},${mountWorkFilms.toString()})`;
}
