const startDialog = document.querySelector('#start-dialog');
document.querySelectorAll('[data-start]').forEach(button=>button.addEventListener('click',()=>startDialog.showModal()));
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelectorAll('.dialog-close,.dialog-dismiss').forEach(button=>button.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
});
const menu=document.querySelector('.menu-button');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'關閉導覽':'開啟導覽');document.querySelector('.desktop-nav').classList.toggle('open',open);});
const options=document.querySelector('[data-options]');
options?.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;const selected=button.getAttribute('aria-pressed')==='true';const count=options.querySelectorAll('[aria-pressed=true]').length;const feedback=document.querySelector('#option-feedback');if(!selected&&count>=2){feedback.textContent='最多選擇 2 項，請先取消一個選項。';return;}button.setAttribute('aria-pressed',String(!selected));feedback.textContent=`已選擇 ${options.querySelectorAll('[aria-pressed=true]').length} / 2 項`;});
const profiles=[
 {name:'老師傅型',role:'經驗守門人',tags:['經驗傳承','現場熟手','人是關鍵'],summary:'經驗都在人身上。',guide:'先把關鍵流程寫下來，定出誰負責什麼。',color:'#cfdbad',person:'傳產師傅',img:'assets/craftsman-approved.png'},
 {name:'工具收集型',role:'工具整合手',tags:['工具不少','資料搬運','等待串接'],summary:'買了不少工具，但彼此對不上。',guide:'先釐清流程，再決定哪些工具留下、哪些整合。',color:'#edc19e',person:'辦公室人員',img:'assets/rc-02-office-v1.png'},
 {name:'流程明白型',role:'流程領航員',tags:['分工清楚','有章可循','工具待補'],summary:'想清楚了，工具還沒跟上。',guide:'挑最耗時的一兩個環節，補上合適的工具。',color:'#bad4d5',person:'傳產老闆',img:'assets/rc-03-owner-v1.png'},
 {name:'蓄勢待發型',role:'自動化先鋒',tags:['流程明確','資料集中','準備加速'],summary:'可以往自動化走了。',guide:'找出重複性最高的環節，評估自動化或 AI。',color:'#e5d48f',person:'二代接班人',img:'assets/rc-04-successor-v1.png'}
];
function selectProfile(index){const p=profiles[index];document.querySelectorAll('[data-profile]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});const card=document.querySelector('#result-card');card.style.setProperty('--card',p.color);card.setAttribute('aria-labelledby',`tab-${index}`);document.querySelector('#profile-number').textContent=`NO. 0${index+1} / 04`;for(const [id,value]of Object.entries({'profile-name':p.name,'profile-role':p.role,'profile-summary':p.summary,'profile-guide':p.guide}))document.getElementById(id).textContent=value;const tags=document.querySelector('#profile-tags');tags.replaceChildren(...p.tags.map(t=>{const span=document.createElement('span');span.textContent='#'+t;return span;}));const portrait=document.querySelector('#profile-portrait');portrait.replaceChildren();const img=document.createElement('img');img.src=p.img;img.alt=p.role+'：'+p.person;img.className='character-sticker';portrait.append(img);}
document.querySelectorAll('[data-profile]').forEach((button,index)=>{button.addEventListener('click',()=>selectProfile(index));button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%4;else if(event.key==='ArrowLeft')next=(index+3)%4;else if(event.key==='Home')next=0;else if(event.key==='End')next=3;else return;event.preventDefault();selectProfile(next);document.querySelector(`[data-profile="${next}"]`).focus();});});
document.querySelector('#privacy-open')?.addEventListener('click',()=>document.querySelector('#privacy-dialog').showModal());
document.querySelector('#demo-form')?.addEventListener('submit',event=>{event.preventDefault();document.querySelector('#form-feedback').textContent='表單驗證通過。這是元件示意，資料沒有傳送或儲存。';});
