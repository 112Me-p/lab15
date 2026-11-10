'use strict';
const defaults = {color:'#ff9373',size:120,duration:550,strength:45};
const limits = {size:[48,220],duration:[80,3000],strength:[0,100]};
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const colors = {ฟ้า:'#7dcaff',น้ำเงิน:'#6698ff',เขียว:'#a7d8a2',แดง:'#ff6f75',ส้ม:'#ff9373',ม่วง:'#bf9bff',เหลือง:'#ffe187',ชมพู:'#ff9bd0',ขาว:'#ffffff',ดำ:'#25272b',blue:'#7dcaff',green:'#a7d8a2',red:'#ff6f75',orange:'#ff9373',purple:'#bf9bff',yellow:'#ffe187',pink:'#ff9bd0',white:'#ffffff',black:'#25272b'};
const fields = {
  range:['color','size','duration','strength'], pointer:['color','size','duration','strength'],
  press:['color','size','duration'], hotspot:['color','size','duration'],
  grid:['color','size','duration'], scroll:['color','size','duration','strength']
};
const unused = {9:['strength'],15:['strength','duration'],19:['strength','duration'],24:['strength'],30:['strength'],5:['strength','duration'],23:['strength'],12:['strength']};
const supported = lesson => fields[lesson.kind].filter(key=>!unused[lesson.id]?.includes(key));
function parsePrompt(prompt, lesson) {
  const source=prompt.normalize('NFKC').toLowerCase().replace(/[๐-๙]/g,d=>String('๐๑๒๓๔๕๖๗๘๙'.indexOf(d)));
  const named=source.match(/สี\s*(น้ำเงิน|ฟ้า|เขียว|แดง|ส้ม|ม่วง|เหลือง|ชมพู|ขาว|ดำ)|\b(blue|green|red|orange|purple|yellow|pink|white|black)\b/u);
  const hex=source.match(/#[a-f0-9]{6}(?![a-f0-9])/u);
  const size=source.match(/(-?\d+(?:\.\d+)?)\s*(?:px\b|พิกเซล)/u);
  const duration=source.match(/(-?\d+(?:\.\d+)?)\s*(ms\b|s\b|วินาที|มิลลิวินาที)/u);
  const strength=source.match(/(-?\d+(?:\.\d+)?)\s*%/u);
  const raw={color:hex?.[0] || colors[named?.[1] || named?.[2]],size:size && Number(size[1]),duration:duration && Number(duration[1])*(/^(s|วินาที)$/.test(duration[2])?1000:1),strength:strength && Number(strength[1])};
  const config={...defaults};
  const applied=[], limited=[];
  for (const key of supported(lesson)) {
    if (raw[key]==null) continue;
    config[key]=key==='color'?raw[key]:Math.round(clamp(raw[key],...limits[key]));
    applied.push(key);
    if (key!=='color' && (raw[key]<limits[key][0] || raw[key]>limits[key][1])) limited.push(key);
  }
  return {config,applied,limited};
}
function parts(lesson, config) {
  const {color,size,duration,strength}=config;
  const {id,kind}=lesson;
  const letters='MOTION'.split('').map((l,i)=>'<span style="--i:'+i+'">'+l+'</span>').join('');
  let shape='<b>ML</b>';
  if([13,20,25].includes(id)) shape='<b class="letters" aria-label="MOTION">'+letters+'</b>';
  if(id===24) shape='<svg viewBox="0 0 220 100" aria-label="เส้นโค้ง"><path pathLength="100" d="M5 70 C50 5 85 115 110 55 S160 0 215 45"/></svg>';
  if([6,14,29].includes(id)) shape=[1,2,3].map(n=>id===6?'<span>0'+n+'</span>':'<button type="button" aria-pressed="'+(n===1)+'">0'+n+'</button>').join('');
  if(id===8) shape='<button type="button" data-note="A">+ A</button><button type="button" data-note="B">+ B</button>';
  if(id===28) shape=Array.from({length:35},(_,n)=>'<i style="--x:'+((n%7)*14+7)+'%;--y:'+(Math.floor(n/7)*19+12)+'%"></i>').join('');
  const action=kind==='range'?'<label for="progress">ความคืบหน้า</label><input id="progress" type="range" min="0" max="100" value="35">':kind==='press'?'<button id="play" type="button">เล่น ↻</button>':kind==='pointer'?'<button id="play" type="button">ลองขยับ ↻</button>':'';
  const scroll=kind==='scroll'?'<div class="runway"><p>01 / START</p><p>02 / MOTION</p><p>03 / END</p></div>':'';
  const html='<main class="sample d'+id+'"><div id="stage" class="'+kind+'" '+(kind==='scroll'?'tabindex="0" aria-label="เลื่อนในกรอบเพื่อทดลอง"':'')+'><div id="object">'+shape+'</div>'+scroll+'</div><div class="control">'+action+'<output id="readout"></output></div></main>';
  const css=`/* ค่าที่ได้จาก Prompt */
:root{--color:${color};--size:${size}px;--time:${duration}ms;--p:.35;--x:0px;--y:0px;--px:50%;--py:50%;--turn:0deg;--tilt:0deg;--zoom:1}
*{box-sizing:border-box}body{margin:0;background:#111813;color:#f3eee4;font:14px system-ui,sans-serif}button,input{font:inherit;accent-color:var(--color)}button{cursor:pointer;color:inherit;background:#25352c;border:1px solid #68796d;border-radius:6px;padding:.38rem .65rem}button:focus-visible,input:focus-visible,#stage:focus-visible{outline:2px solid white;outline-offset:-2px}
#stage{height:224px;position:relative;display:grid;place-items:center;overflow:hidden;perspective:550px;background-color:#18251e;background-image:linear-gradient(#78908233 1px,transparent 1px),linear-gradient(90deg,#78908233 1px,transparent 1px);background-size:28px 28px}
#object{position:relative;width:min(var(--size),70vw);height:min(var(--size),180px);display:grid;place-items:center;border-radius:16px;color:#101713;background:var(--color);box-shadow:0 9px 30px #0007;transition:transform var(--time),clip-path var(--time),border-radius var(--time),background var(--time);font-weight:900;letter-spacing:.06em}
.pointer{touch-action:pan-y}.pointer #object{transform:translate(var(--x),var(--y)) scale(var(--zoom));transition-timing-function:cubic-bezier(.2,.75,.2,1)}
.control{min-height:52px;padding:.4rem .6rem;display:flex;align-items:center;justify-content:center;gap:.45rem;font-size:12px}.control input{width:min(42vw,150px)}output{color:#bccbc0}
.d1 #object{clip-path:inset(0 calc(100% - var(--p)*100%) 0 0);transform:scale(var(--zoom))}
.d2 #object,.d7 #object,.d21 #object{transform:rotateY(var(--turn)) rotateX(var(--tilt));border:4px double #fff9;background:linear-gradient(115deg,#192a25 3%,var(--color) 50%,#2b3f36 100%)}
.d3 #stage{background-position:var(--bx) var(--by)}.d3 #object::after{content:'';position:absolute;inset:-24%;border:1px solid var(--color);border-radius:16px;transform:translate(var(--bx),var(--by))}
.d4 #object,.d26 #object{width:min(calc(var(--size)*2),90vw);overflow:hidden}.d4 #object.active,.d26 #object.active{animation:wipe var(--time) both}.d26 #object{border-radius:0;height:min(var(--size),190px)}@keyframes wipe{45%{clip-path:inset(0 0 0 100%)}55%{clip-path:inset(0 100% 0 0)}}
#stage.scroll{display:block;overflow:auto}.runway{height:520px;display:grid;place-items:center;color:#cddad0;font-family:monospace}.scroll #object{position:sticky;top:14px;margin:0 auto;height:min(var(--size),82px);transform:skewX(var(--turn))}
.d6 #object,.d14 #object,.d29 #object{width:min(90vw,350px);height:min(var(--size),155px);background:none;box-shadow:none;display:flex;gap:.35rem;align-items:stretch}.d6 #object{transform:translateX(var(--x));width:max-content}.d6 #object span,.d14 #object button,.d29 #object button{width:min(var(--size),24vw);background:var(--color);color:#142019;border-radius:10px;display:grid;place-items:center}.d14 #object button,.d29 #object button{flex:1;transition:flex var(--time),transform var(--time);min-width:0}.d14 button[aria-pressed=true]{flex:2!important}.d29 button[aria-pressed=false]{transform:perspective(300px) rotateY(27deg) scale(.8);opacity:.7}
.d8 #object{display:flex;justify-content:space-around;gap:3px}.d8 button{padding:.3rem}
.d9 #object{width:min(calc(var(--size)*1.6),76vw);overflow:hidden;background:#7e9b87}.d9 #object::after{content:'A';position:absolute;inset:0;display:grid;place-items:center;background:var(--color);clip-path:inset(0 calc(100% - var(--p)*100%) 0 0);transition:clip-path var(--time)}
.d10 #object.active{border-radius:50% 20% 50% 25%;transform:rotate(40deg) scale(.85)}
.d11 #object{height:62px;border-radius:40px}.d12 #object,.d17 #object,.d15 #object{border-radius:50%}.d12 #object{transform:translate(var(--x),var(--y)) scale(.45)}.d15 #object{transform:rotate(var(--turn));background:conic-gradient(var(--color),#4b6857,var(--color))}
.letters{font-size:clamp(14px,calc(var(--size)*.21),36px);display:flex}.letters span{display:inline-block}.d13 #object,.d20 #object,.d25 #object{width:min(calc(var(--size)*1.65),86vw);background:none;box-shadow:none;color:var(--color)}.d13 .active span{animation:arrive var(--time) both;animation-delay:calc(var(--i)*35ms)}@keyframes arrive{from{opacity:0;transform:translateY(32px)}}
.d16 #stage{background-image:repeating-linear-gradient(35deg,#537263 0 12px,#b2997a 12px 24px)}.d16 #object{background:color-mix(in srgb,var(--color) 38%,transparent);backdrop-filter:blur(7px);border:1px solid #fff9}
.d18 #object{background:repeating-linear-gradient(32deg,var(--color) 0 8px,#192820 8px 16px);color:white;transform:skew(var(--turn),var(--tilt))}
.d19 #stage{background-position:var(--x) var(--y);background-size:var(--size) var(--size)}.d19 #object{height:55px}
.d23 #object{display:none}.trail{position:absolute;left:var(--tx);top:var(--ty);width:min(calc(var(--size)*.2),45px);aspect-ratio:1;border-radius:50%;background:var(--color);pointer-events:none;animation:fade var(--time) linear forwards}@keyframes fade{to{opacity:0;transform:scale(.15)}}
.d24 #object{width:min(calc(var(--size)*2),90vw);background:none;box-shadow:none}.d24 svg{width:100%;fill:none;stroke:var(--color);stroke-width:5;stroke-dasharray:100;stroke-dashoffset:calc(100 - var(--p)*100);transition:stroke-dashoffset var(--time)}
.d25 #object{transform:none}.d25 span,.d28 i{transition:transform var(--time)}
.d27 #stage{background:#273e32}.d27 #object{position:absolute;inset:0;width:auto;height:auto;transform:none;border-radius:0;background:repeating-linear-gradient(40deg,var(--color) 0 14px,#456453 14px 28px);clip-path:circle(calc(var(--size)*.45 + var(--zoom)*6px) at var(--px) var(--py))}
.d28 #object{width:min(calc(var(--size)*1.65),80vw);background:none;box-shadow:none;transform:none}.d28 i{position:absolute;left:var(--x);top:var(--y);left:var(--x-origin,var(--x));top:var(--y-origin,var(--y));width:6px;aspect-ratio:1;border-radius:50%;background:var(--color)}
.d30 #object{width:min(calc(var(--size)*1.8),84vw);background:linear-gradient(90deg,var(--color) calc(var(--p)*100%),#607f6e 0);font-family:monospace}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important}}
`;
  const js='const technique = '+id+';\nconst strength = '+strength+' / 100;\nconst duration = '+duration+';\n('+previewRuntime.toString()+')(technique, strength, duration);';
  return {html,css,js};
}
function previewRuntime(id, strength, duration) {
  const stage=document.querySelector('#stage');
  const object=document.querySelector('#object');
  const output=document.querySelector('#readout');
  const progress=document.querySelector('#progress');
  const play=document.querySelector('#play');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ms=reduced?0:duration;
  const set=(key,value)=>stage.style.setProperty('--'+key,value);
  const show=value=>output.textContent=value;
  function scrub() {
    let p=Number(progress.value)/100;
    if(id===15) p=Math.round(p*47)/47;
    set('p',p);
    set('zoom',1+p*strength*.45);
    set('turn',(id===15?p*360:(p-.5)*360*strength)+'deg');
    set('x',(0.5-p)*strength*stage.clientWidth*.65+'px');
    const time=(p*4).toFixed(2)+' / 4.00 s';
    if(id===30) object.textContent=time;
    show(id===15?'FRAME '+(Math.round(p*47)+1)+' / 48':id===30?time:progress.value+'%');
  }
  if(progress){progress.addEventListener('input',scrub);scrub();}
  if(stage.classList.contains('scroll')){
    let last=0, previous=performance.now(), settle;
    stage.addEventListener('scroll',()=>{
      const now=performance.now();
      const delta=stage.scrollTop-last;
      if(id===22){
        const velocity=delta/Math.max(16,now-previous);
        set('turn',Math.max(-30,Math.min(30,velocity*100*strength))+'deg');
        clearTimeout(settle);
        settle=setTimeout(()=>set('turn','0deg'),100);
      }
      last=stage.scrollTop;
      previous=now;
      show(Math.round(last/(stage.scrollHeight-stage.clientHeight)*100)+'%');
    });
  }
  function point(x,y) {
    const sx=(x-.5), sy=(y-.5);
    const gain=[12,19,23].includes(id)?1:strength;
    set('x',sx*gain*Math.min(stage.clientWidth,260)+'px');
    set('y',sy*gain*140+'px');
    set('bx',sx*gain*52+'px');
    set('by',sy*gain*52+'px');
    set('px',x*100+'%');
    set('py',y*100+'%');
    set('turn',sx*gain*(id===7?160:65)+'deg');
    set('tilt',-sy*gain*65+'deg');
    set('zoom',1+Math.hypot(sx,sy)*strength*.35);
    if(id===23 && !reduced && stage.childElementCount<40){
      const dot=document.createElement('i');
      dot.className='trail';
      dot.style.setProperty('--tx',x*100+'%');
      dot.style.setProperty('--ty',y*100+'%');
      stage.append(dot);
      setTimeout(()=>dot.remove(),ms+30);
    }
    if(id===25 || id===28){
      const nodes=[...object.querySelectorAll(id===25?'span':'i')];
      const rect=stage.getBoundingClientRect();
      for(const node of nodes){
        const dx=(node.offsetLeft+object.offsetLeft-rect.width*x);
        const dy=(node.offsetTop+object.offsetTop-rect.height*y);
        const power=Math.max(0,1-Math.hypot(dx,dy)/100)*strength;
        node.style.transform=id===25?'scale('+(1+power)+')':'translate('+dx*power+'px,'+dy*power+'px)';
      }
    }
    show('X '+Math.round(x*100)+' · Y '+Math.round(y*100));
  }
  if(stage.classList.contains('pointer')){
    const move=event=>{
      if(event.pointerType==='touch' && event.type==='pointermove' && event.buttons===0)return;
      const box=stage.getBoundingClientRect();
      point((event.clientX-box.left)/box.width,(event.clientY-box.top)/box.height);
    };
    stage.addEventListener('pointerdown',move);
    stage.addEventListener('pointermove',move);
    stage.addEventListener('pointerleave',()=>point(.5,.5));
  }
  object.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button) return;
    if(id===8){
      const active=button.getAttribute('aria-pressed')==='true';
      for(const item of object.querySelectorAll('button'))item.setAttribute('aria-pressed',String(!active && item===button));
      show(active?'':button.dataset.note==='A'?'A / วัสดุ':'B / พื้นผิว');
      object.style.transform=active?'':'scale(1.06)';
    }else{
      for(const item of object.querySelectorAll('button'))item.setAttribute('aria-pressed',String(item===button));
      show('ACTIVE '+button.textContent);
    }
  });
  let scene=1, pending=0, run=0;
  play?.addEventListener('click',()=>{
    if(stage.classList.contains('pointer')){
      point(scene++%2?.8:.2,.55);
      return;
    }
    if(id===10){
      object.classList.toggle('active');
      show(object.classList.contains('active')?'FORM 02':'FORM 01');
      return;
    }
    object.classList.remove('active');
    void object.offsetWidth;
    object.classList.add('active');
    if(id===4 || id===26){
      clearTimeout(pending);
      pending=setTimeout(()=>{scene=scene===1?2:1;object.textContent='SCENE 0'+scene;show('SCENE 0'+scene);},ms/2);
    }
    if(id===20){
      cancelAnimationFrame(run);
      const start=performance.now(), letters=[...object.querySelectorAll('span')], target='MOTION';
      function tick(now){
        const p=ms?Math.min(1,(now-start)/ms):1;
        letters.forEach((letter,index)=>letter.textContent=index<p*letters.length?target[index]:'X#?@$%'[Math.floor(Math.random()*6)]);
        if(p<1)run=requestAnimationFrame(tick);
      }
      run=requestAnimationFrame(tick);
    }
  });
  if(id===4 || id===26)object.textContent='SCENE 01';
}
function documentFor(parts) {
  return '<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'"><title>MOTION LAB experiment</title><style>'+parts.css+'</style><body>'+parts.html+'<script>'+parts.js+'</script></body></html>';
}
