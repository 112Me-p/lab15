/* MOTION/LAB — 15 real interactive effects. No framework / no build step. */
'use strict';
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const clamp = (v, min=0, max=1) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a+(b-a)*t;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Global navigation, scroll progress, and menu */
const scrollProgress = $('#scrollProgress');
const topbar = $('#topbar');
$('#menuToggle').addEventListener('click', () => {
  const isOpen = topbar.classList.toggle('menu-open');
  $('#menuToggle').setAttribute('aria-expanded', String(isOpen));
});
$$('.nav-links a').forEach(a => a.addEventListener('click', () => {
  topbar.classList.remove('menu-open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');
}));

/* 01: Scrollytelling: real scroll-to-install visual reveal */
const storySection = $('#demo-1');
const storyAfter = $('#storyAfter');
function renderStory() {
  const r = storySection.getBoundingClientRect();
  const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
  storyAfter.style.clipPath = `inset(0 ${((1-p)*100).toFixed(2)}% 0 0)`;
  $('#storyIndicator').style.width = (p*100).toFixed(0) + '%';
  $('#storyPercent').textContent = String(Math.round(p*100)).padStart(2,'0') + '%';
  if(p < .21) {
    $('#storyStage').textContent = 'STEP 01 — BEFORE';
    $('#storyCaption').textContent = 'เริ่มต้นจากผนังเรียบธรรมดา ...';
  } else if(p < .77) {
    $('#storyStage').textContent = 'STEP 02 — TRANSFORMING';
    $('#storyCaption').textContent = 'แพตเทิร์นใหม่ค่อย ๆ เปลี่ยนบรรยากาศห้อง';
  } else {
    $('#storyStage').textContent = 'STEP 03 — AFTER';
    $('#storyCaption').textContent = 'ดีไซน์ผนังใหม่ เปลี่ยนอารมณ์ของทั้งห้อง';
  }
}

/* 02: scroll controlled CSS 3D */
const cubeSection = $('#demo-2');
const cube = $('#scrollCube');
function renderScrollCube() {
  const r = cubeSection.getBoundingClientRect();
  const p = clamp((window.innerHeight - r.top) / Math.max(1, window.innerHeight + r.height));
  const y = Math.round(-45+p*400);
  const x = Math.round(-23+34*Math.sin(p*Math.PI));
  cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
  $('#scroll3dAngle').textContent = `ROTATION / ${String((y+360)%360).padStart(3,'0')}°`;
}

/* 03: parallax layers via pointer and scroll, without external library */
const parallaxWorld = $('#parallaxWorld');
let paraMouseX = 0, paraMouseY = 0;
function moveParallax() {
  const r = parallaxWorld.getBoundingClientRect();
  if(r.bottom < -250 || r.top > window.innerHeight+250) return;
  const scrollOffset = clamp((window.innerHeight-r.top)/(window.innerHeight+r.height));
  $$('[data-depth]', parallaxWorld).forEach(layer=>{
    const depth = Number(layer.dataset.depth);
    const dx = paraMouseX * depth * .9;
    const dy = paraMouseY * depth * .6 + (scrollOffset-.5)*depth*1.6;
    layer.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
  });
}
parallaxWorld.addEventListener('pointermove', e => {
  if(e.pointerType === 'touch') return;
  const r=parallaxWorld.getBoundingClientRect();
  paraMouseX=clamp((e.clientX-r.left)/r.width,0,1)*2-1;
  paraMouseY=clamp((e.clientY-r.top)/r.height,0,1)*2-1;
  moveParallax();
});
parallaxWorld.addEventListener('pointerleave',()=>{paraMouseX=0;paraMouseY=0;moveParallax();});

/* 04: cinematic wipe that really switches scenes */
const scenes = [
  {src:'assets/room-clay.svg',title:'WARM<br>MINIMALISM.'},
  {src:'assets/room-sage.svg',title:'GREEN<br>SANCTUARY.'},
  {src:'assets/room-night.svg',title:'AFTER<br>HOURS.'}
];
let sceneIndex=0, cinemaBusy=false;
scenes.forEach(s=>{const img=new Image(); img.src=s.src;});
$('#cinemaNext').addEventListener('click',()=>{
  if(cinemaBusy)return;
  cinemaBusy=true;
  const el=$('#cinema'); el.classList.remove('is-transitioning'); void el.offsetWidth;
  el.classList.add('is-transitioning');
  setTimeout(()=>{
    sceneIndex=(sceneIndex+1)%scenes.length;
    $('#cinemaImage').src=scenes[sceneIndex].src;
    $('#cinemaTitle').innerHTML=scenes[sceneIndex].title;
    $('#filmCount').textContent=`SCENE ${String(sceneIndex+1).padStart(2,'0')} / 03`;
  },520);
  setTimeout(()=>{el.classList.remove('is-transitioning');cinemaBusy=false;},1180);
});

/* 05: pinned story content and visual switching */
const pinSteps=$$('[data-pin]');
const pinImages=['assets/room-sand.svg','assets/room-sage.svg','assets/room-clay.svg'];
let currentPin=-1;
function renderPinStory(){
  let closest=0,dist=Infinity;
  pinSteps.forEach((step,i)=>{
    const r=step.getBoundingClientRect();
    const d=Math.abs(r.top+r.height*.5-window.innerHeight*.57);
    if(d<dist){dist=d;closest=i;}
  });
  if(currentPin!==closest){
    currentPin=closest;
    $('#pinnedImage').src=pinImages[closest];
    $('#pinCounter').textContent=String(closest+1).padStart(2,'0');
    pinSteps.forEach((step,i)=>step.classList.toggle('is-active',i===closest));
  }
}

/* 06: vertical scroll translating the real horizontal gallery */
const horizontalSection=$('#demo-6');
const hTrack=$('#hTrack');
function renderHorizontal(){
  const r=horizontalSection.getBoundingClientRect();
  const p=clamp(-r.top/Math.max(1,r.height-window.innerHeight));
  const visualWidth=hTrack.parentElement.clientWidth;
  const target=Math.max(0,hTrack.scrollWidth - visualWidth*.88);
  hTrack.style.transform=`translate3d(${-Math.round(target*p)}px,0,0)`;
  $('#hProgress').style.width=(p*100).toFixed(2)+'%';
}

/* 07: drag-to-rotate 3D material packaging */
const viewerArea=$('#viewerArea');
const viewerObject=$('#viewerObject');
let rotationX=-12,rotationY=-24;
let viewerDrag=null;
function renderViewer(){
  viewerObject.style.transform=`rotateX(${rotationX.toFixed(1)}deg) rotateY(${rotationY.toFixed(1)}deg)`;
  $('#viewerAngle').textContent=`X ${Math.round(rotationX)}° / Y ${Math.round(rotationY)}°`;
}
viewerArea.addEventListener('pointerdown',e=>{
  viewerDrag={x:e.clientX,y:e.clientY,rx:rotationX,ry:rotationY,id:e.pointerId};
  viewerArea.classList.add('is-dragging');
  viewerArea.setPointerCapture(e.pointerId);
});
viewerArea.addEventListener('pointermove',e=>{
  if(!viewerDrag)return;
  rotationY=viewerDrag.ry+(e.clientX-viewerDrag.x)*.55;
  rotationX=clamp(viewerDrag.rx-(e.clientY-viewerDrag.y)*.38,-82,82);
  renderViewer();
});
function endViewer(){viewerDrag=null;viewerArea.classList.remove('is-dragging');}
viewerArea.addEventListener('pointerup',endViewer);
viewerArea.addEventListener('pointercancel',endViewer);
viewerArea.addEventListener('lostpointercapture',endViewer);
viewerArea.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();
  if(e.key==='ArrowLeft')rotationY-=12;
  if(e.key==='ArrowRight')rotationY+=12;
  if(e.key==='ArrowUp')rotationX=clamp(rotationX+12,-82,82);
  if(e.key==='ArrowDown')rotationX=clamp(rotationX-12,-82,82);
  renderViewer();
});
$('#viewerReset').addEventListener('click',()=>{rotationX=-12;rotationY=-24;renderViewer();});

/* 08: contextual scene hotspots */
const spotData=[
 {category:'01 / MATERIAL DETAIL',title:'ARCH WALLPAPER',desc:'วอลเปเปอร์ลายโค้ง โทนอบอุ่น เหมาะกับห้องพักผ่อน'},
 {category:'02 / WINDOW DETAIL',title:'WINDOW TREATMENT',desc:'การจัดแสงธรรมชาติด้วยหน้าต่างและผ้าม่านโทนครีม'},
 {category:'03 / FURNITURE DETAIL',title:'SOFT FURNISHING',desc:'โซฟาและองค์ประกอบตกแต่งที่ช่วยเสริมบรรยากาศของห้อง'},
 {category:'04 / FLOORING DETAIL',title:'WOOD-TONE FLOOR',desc:'พื้นผิวโทนไม้ธรรมชาติ เติมความรู้สึกอบอุ่นให้ทุกพื้นที่'}
];
$$('.hotspot').forEach(button=>button.addEventListener('click',()=>{
  const i=Number(button.dataset.spot),d=spotData[i];
  $$('.hotspot').forEach(b=>b.classList.toggle('active',b===button));
  $('#hotspotInfo').innerHTML=`<span>${d.category}</span><h4>${d.title}</h4><p>${d.desc}</p><small>CLICK OTHER POINTS ↗</small>`;
}));

/* 09: accessible native range input controlling layered image clip */
const comparisonRange=$('#comparisonRange');
function renderComparison(){ $('#comparison').style.setProperty('--split',`${comparisonRange.value}%`); }
comparisonRange.addEventListener('input',renderComparison);renderComparison();

/* 10: actual SVG path d-value interpolation (three matching cubic paths) */
const paths=[
 'M 300 65 C 420 65 510 130 510 225 C 510 340 400 385 300 385 C 200 385 90 340 90 225 C 90 130 180 65 300 65 Z',
 'M 290 40 C 435 50 460 155 540 190 C 545 300 450 412 316 350 C 165 433 120 345 74 219 C 43 120 160 86 290 40 Z',
 'M 300 82 C 400 0 550 125 482 230 C 568 350 410 410 295 380 C 175 429 63 330 114 226 C 37 100 200 10 300 82 Z'
];
const numberPattern=/-?\d+(?:\.\d+)?/g;
const pathValues=paths.map(p=>[...p.matchAll(numberPattern)].map(m=>Number(m[0])));
const pathPattern=paths[0].replace(numberPattern,'~');
function pathString(vals){let i=0;return pathPattern.replace(/~/g,()=>String(Math.round(vals[i++]*100)/100));}
let shapeIndex=0, shapeValues=pathValues[0].slice(), morphAnimation=0;
$('#morphNext').addEventListener('click',()=>{
  cancelAnimationFrame(morphAnimation);
  shapeIndex=(shapeIndex+1)%3;
  $('#morphIndex').textContent=String(shapeIndex+1).padStart(2,'0');
  const initial=shapeValues.slice(),target=pathValues[shapeIndex],start=performance.now();
  const duration=reducedMotion?1:1000;
  function animate(now){
    const p=clamp((now-start)/duration);
    const eased=1-Math.pow(1-p,3);
    shapeValues=initial.map((v,i)=>lerp(v,target[i],eased));
    $('#morphPath').setAttribute('d',pathString(shapeValues));
    if(p<1)morphAnimation=requestAnimationFrame(animate);
  }
  morphAnimation=requestAnimationFrame(animate);
});

/* 11: button attracted to pointer in its surrounding magnetic field */
const magneticDemo=$('.magnetic-demo');
const magneticButton=$('#magneticButton');
magneticDemo.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const r=magneticDemo.getBoundingClientRect();
  const dx=e.clientX-(r.left+r.width*.5),dy=e.clientY-(r.top+r.height*.5);
  const dist=Math.hypot(dx,dy);
  const factor=clamp(1-dist/290);
  magneticButton.style.transform=`translate(${(dx*.27*factor).toFixed(1)}px,${(dy*.27*factor).toFixed(1)}px)`;
});
magneticDemo.addEventListener('pointerleave',()=>magneticButton.style.transform='translate(0,0)');
magneticButton.addEventListener('click',()=>{
  $('#magneticMessage').textContent='YOU HAVE JUST EXPERIENCED A MAGNETIC BUTTON ✳';
});

/* 12: custom contextual pointer inside one stage */
const cursorDemo=$('#cursorDemo'), customCursor=$('#customCursor');
cursorDemo.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const r=cursorDemo.getBoundingClientRect();
  customCursor.style.left=(e.clientX-r.left)+'px';
  customCursor.style.top=(e.clientY-r.top)+'px';
  cursorDemo.classList.add('is-hovered');
});
cursorDemo.addEventListener('pointerleave',()=>cursorDemo.classList.remove('is-hovered'));
$$('.cursor-line').forEach(line=>{
  line.addEventListener('pointerenter',()=>{customCursor.textContent=line.dataset.cursor;});
  line.addEventListener('click',()=>{
    $$('.cursor-line').forEach(el=>el.style.color='');
    line.style.color='#f77a57';
    setTimeout(()=>{line.style.color='';},800);
  });
});

/* 13: character-by-character staggered typography */
const splitDemo=$('.split-demo');
$$('[data-split]').forEach(line=>{
  const text=line.dataset.split;
  line.setAttribute('aria-hidden','true');
  line.innerHTML='';
  [...text].forEach((ch,i)=>{
    const span=document.createElement('span');span.className='split-char';
    span.textContent=ch===' '?'\u00A0':ch;
    span.style.transitionDelay=(i*65+(line===line.parentNode.firstElementChild?0:190))+'ms';
    line.appendChild(span);
  });
});
function playSplit(){splitDemo.classList.remove('playing');void splitDemo.offsetWidth;requestAnimationFrame(()=>splitDemo.classList.add('playing'));}
$('#splitReplay').addEventListener('click',playSplit);
const splitObserver=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){playSplit();splitObserver.disconnect();}
},{threshold:.35});
splitObserver.observe(splitDemo);

/* 14: animated selectable bento cards */
const bentoData=[
 {title:'DESIGN THE WALL',desc:'พื้นผิวและลวดลายที่ออกแบบให้พื้นที่มีเอกลักษณ์'},
 {title:'NATURE INSIDE',desc:'เพิ่มความละมุนด้วยสีเขียว ลายใบไม้ และองค์ประกอบจากธรรมชาติ'},
 {title:'FIND YOUR TONE',desc:'จับคู่เฉดสีให้เหมาะกับบุคลิกและบรรยากาศที่ต้องการ'},
 {title:'SMALL THINGS',desc:'รายละเอียดเล็ก ๆ ของวัสดุช่วยเปลี่ยนความรู้สึกโดยรวม'}
];
$$('[data-bento]').forEach(card=>card.addEventListener('click',()=>{
  const i=Number(card.dataset.bento),item=bentoData[i];
  $$('[data-bento]').forEach(b=>b.classList.toggle('active',b===card));
  $('#bentoTitle').textContent=item.title;
  $('#bentoDescription').textContent=item.desc;
}));

/* 15: true pre-rendered image sequence, all 48 WebP frames live locally */
const sequenceSection=$('#demo-15');
const sequenceCanvas=$('#sequenceCanvas');
const ctx=sequenceCanvas.getContext('2d',{alpha:false});
const frames=Array.from({length:48},()=>null);
let currentFrame=-1;
let lastManualScrub=0;
let lastRequestedFrame=0;
function drawFrame(index){
  index=clamp(Math.round(index),0,47);
  lastRequestedFrame=index;
  $('#sequenceNumber').textContent=String(index+1).padStart(2,'0');
  $('#sequencePercent').textContent=String(Math.round(index/47*100)).padStart(3,'0')+'%';
  $('#sequenceRange').value=String(index);
  if(frames[index]?.complete && frames[index].naturalWidth){
    if(index!==currentFrame){ctx.drawImage(frames[index],0,0,960,590);currentFrame=index;}
  } else {
    const nearest=frames.reduce((acc,img,i)=>{
      if(!img?.complete || !img.naturalWidth)return acc;
      return !acc || Math.abs(index-i)<Math.abs(index-acc.i)?{i,img}:acc;
    },null);
    if(nearest && nearest.i!==currentFrame){ctx.drawImage(nearest.img,0,0,960,590);currentFrame=nearest.i;}
  }
}
function renderSequenceScroll(){
  if(Date.now()-lastManualScrub<1400)return;
  const r=sequenceSection.getBoundingClientRect();
  const p=clamp(-r.top/Math.max(1,r.height-window.innerHeight));
  drawFrame(Math.round(p*47));
}
$('#sequenceRange').addEventListener('input',e=>{
  lastManualScrub=Date.now();drawFrame(Number(e.target.value));
});
frames.forEach((unused,i)=>{
  const img=new Image();
  img.src=`assets/sequence/${String(i).padStart(3,'0')}.webp`;
  img.onload=()=>{if(i===0 || i===lastRequestedFrame)drawFrame(lastRequestedFrame);};
  frames[i]=img;
});

/* One shared passive scroll + resize renderer, only one scheduled frame per event. */
let scrollPending=false;
function renderScroll(){
  scrollPending=false;
  const maxScroll=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  scrollProgress.style.width=(window.scrollY/maxScroll*100).toFixed(2)+'%';
  renderStory();renderScrollCube();moveParallax();renderPinStory();renderHorizontal();renderSequenceScroll();
}
function requestScrollRender(){if(scrollPending)return;scrollPending=true;requestAnimationFrame(renderScroll);}
window.addEventListener('scroll',requestScrollRender,{passive:true});
window.addEventListener('resize',requestScrollRender,{passive:true});
window.addEventListener('load',requestScrollRender);
requestScrollRender();
