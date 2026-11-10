'use strict';
const $=id=>document.getElementById(id);
const number=id=>String(id).padStart(2,'0');
const labels={color:'สี',size:'ขนาด',duration:'ระยะเวลา',strength:'ความแรง'};
const display=(key,value)=>value+({size:'px',duration:'ms',strength:'%'}[key]||'');
const example=lesson=>lesson.title+' สีฟ้า ขนาด 120px'+(supported(lesson).includes('duration')?' เวลา 650ms':'')+(supported(lesson).includes('strength')?' ความแรง 65%':'');
const lessonId=id=>lessons.find(lesson=>lesson.id===Number(id));
function readStorage(key){
  try{
    const value=JSON.parse(localStorage.getItem(key));
    return Array.isArray(value)?value:[];
  }catch{return [];}
}
function writeStorage(key,value){
  try{localStorage.setItem(key,JSON.stringify(value));return true;}
  catch{$('save-status').textContent='เบราว์เซอร์ไม่อนุญาตให้บันทึก กรุณาดาวน์โหลด HTML เพื่อเก็บงาน';return false;}
}
const savesKey='motion-lab-studio-saves-v1', progressKey='motion-lab-studio-progress-v1';
let saved=readStorage(savesKey).filter(item=>item && typeof item.key==='string' && lessonId(item.lesson) && typeof item.prompt==='string');
let done=readStorage(progressKey).filter(id=>lessonId(id));
let lesson, output, mode='html', compare=false, timer;

function drawLibrary(){
  const term=$('search').value.trim().toLowerCase();
  const matches=lessons.filter(item=>(number(item.id)+' '+item.title+' '+item.principle).toLowerCase().includes(term));
  $('lesson-list').replaceChildren();
  for(const item of matches){
    const button=document.createElement('button');
    button.className='lesson-item';
    button.type='button';
    button.dataset.lesson=item.id;
    button.setAttribute('aria-pressed',String(lesson?.id===item.id));
    for(const value of [number(item.id),item.title,done.includes(item.id)?'✓':'']){
      const label=document.createElement('span');
      label.textContent=value;
      button.append(label);
    }
    $('lesson-list').append(button);
  }
  if(!matches.length)$('lesson-list').textContent='ไม่พบบทเรียนที่ตรงกับคำค้น';
}
function updateLesson(){
  $('lesson-label').textContent='LEARN MODE / '+number(lesson.id)+' OF 30 · เสร็จ '+done.length+' บท';
  $('complete').setAttribute('aria-pressed',String(done.includes(lesson.id)));
  $('complete').textContent=done.includes(lesson.id)?'✓ ทำบทนี้แล้ว':'ทำบทนี้แล้ว';
}
function selectLesson(item,prompt=example(item),navigate=true){
  lesson=item;
  if(navigate)history.replaceState(null,'','?lesson='+item.id+'#workspace');
  $('lesson-title').textContent=item.title;
  $('principle').textContent=item.principle;
  $('observe').textContent='ทดลอง · '+item.observe;
  $('challenge').textContent='โจทย์ · '+item.challenge;
  $('original').href=(item.id<=15?'index.html':'vol02.html')+'#demo-'+item.id;
  $('prompt').value=prompt.slice(0,420);
  $('prompt-help').textContent='Basic รองรับ '+supported(item).map(key=>labels[key]).join(' · ')+' สำหรับบทนี้ ลองใช้ #7dcaff, 120px, 650ms, 65% ตามค่าที่รองรับ';
  updateLesson();
  drawLibrary();
  if(compare)$('before').srcdoc=documentFor(parts(lesson,defaults));
  render();
}
function render(){
  clearTimeout(timer);
  const result=parsePrompt($('prompt').value,lesson);
  output=parts(lesson,result.config);
  const html=documentFor(output);
  if($('after').srcdoc!==html)$('after').srcdoc=html;
  const message=result.applied.length?'ใช้ค่า '+result.applied.map(key=>labels[key]).join(' · '):'แสดงค่าเริ่มต้น ลองระบุค่าตามตัวอย่าง';
  $('status').textContent=message+(result.limited.length?' · จำกัดช่วง '+result.limited.map(key=>labels[key]).join(' · '):'');
  $('values').replaceChildren(...supported(lesson).map(key=>{
    const chip=document.createElement('span');
    chip.textContent=labels[key]+' '+display(key,result.config[key]);
    return chip;
  }));
  $('code').textContent=output[mode];
}
function listSaves(active=''){
  $('saved').replaceChildren(new Option(saved.length?'เลือกงาน':'ยังไม่มีงานบันทึก',''),...saved.map(item=>new Option(number(item.lesson)+' · '+item.prompt.slice(0,48),item.key)));
  $('saved').value=active;
  $('load').disabled=$('remove').disabled=!$('saved').value;
}
$('search').addEventListener('input',drawLibrary);
$('lesson-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-lesson]');
  if(!button)return;
  selectLesson(lessonId(button.dataset.lesson));
  $('lesson-list').querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
});
$('prompt').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(render,200);});
$('reset').addEventListener('click',()=>{$('prompt').value=example(lesson);render();});
$('compare').addEventListener('click',()=>{
  compare=!compare;
  $('compare').setAttribute('aria-pressed',String(compare));
  $('before-panel').hidden=!compare;
  $('after-label').textContent=compare?'B / ผลจากพรอมต์':'LIVE / ผลจากพรอมต์';
  if(compare)$('before').srcdoc=documentFor(parts(lesson,defaults));
  else $('before').removeAttribute('srcdoc');
});
$('complete').addEventListener('click',()=>{
  const next=done.includes(lesson.id)?done.filter(id=>id!==lesson.id):[...done,lesson.id];
  if(writeStorage(progressKey,next)){done=next;updateLesson();drawLibrary();}
});
for(const tab of document.querySelectorAll('[data-code]')){
  tab.addEventListener('click',()=>{
    mode=tab.dataset.code;
    for(const button of document.querySelectorAll('[data-code]'))button.setAttribute('aria-pressed',String(button===tab));
    render();
  });
}
$('copy').addEventListener('click',async()=>{
  render();
  try{await navigator.clipboard.writeText(output[mode]);$('save-status').textContent='คัดลอกโค้ดแล้ว';}
  catch{const range=document.createRange();range.selectNodeContents($('code'));getSelection().removeAllRanges();getSelection().addRange(range);$('save-status').textContent='เลือกโค้ดไว้แล้ว ใช้คำสั่งคัดลอกของอุปกรณ์';}
});
$('save').addEventListener('click',()=>{
  const prompt=$('prompt').value.trim();
  if(!prompt){$('save-status').textContent='พิมพ์พรอมต์ก่อนบันทึก';return;}
  if(saved.length>=50){$('save-status').textContent='บันทึกได้ 50 งาน กรุณาลบงานเก่าก่อน';return;}
  const key=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
  const next=[{key,lesson:lesson.id,prompt},...saved];
  if(writeStorage(savesKey,next)){saved=next;listSaves(key);$('save-status').textContent='บันทึกในเบราว์เซอร์แล้ว';}
});
$('saved').addEventListener('change',()=>{$('load').disabled=$('remove').disabled=!$('saved').value;});
$('load').addEventListener('click',()=>{
  const item=saved.find(item=>item.key===$('saved').value);
  if(item){selectLesson(lessonId(item.lesson),item.prompt);$('save-status').textContent='เปิดงานแล้ว';$('prompt').focus();}
});
$('remove').addEventListener('click',()=>{
  const next=saved.filter(item=>item.key!==$('saved').value);
  if(writeStorage(savesKey,next)){saved=next;listSaves();$('save-status').textContent='ลบงานแล้ว';}
});
$('export').addEventListener('click',()=>{
  render();
  const link=document.createElement('a');
  link.href=URL.createObjectURL(new Blob([documentFor(output)],{type:'text/html;charset=utf-8'}));
  link.download='motion-lab-'+number(lesson.id)+'.html';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  $('save-status').textContent='ส่งออกไฟล์ HTML แล้ว';
});
selectLesson(lessonId(new URLSearchParams(location.search).get('lesson'))||lessons[16],undefined,false);
listSaves();
