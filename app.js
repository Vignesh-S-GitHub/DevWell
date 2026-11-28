
const I=n=>`<svg viewBox="0 0 24 24" aria-hidden="true" data-icon="${n}">${DevWellIcons[n]||DevWellIcons.pulse}</svg>`;
const {blank,normalize,parseBackup,validDate,historyCutoff,pruneHistory}=DevWellModel;
const keyDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let storageAvailable=true, savedData;
try {const raw=localStorage.getItem('devwell-v2')||localStorage.getItem('devwell-v1');savedData=raw?JSON.parse(raw):{};} catch {storageAvailable=false;}
let db=normalize(savedData), routine=db.settings.routine;
const haptics=DevWellHaptics.create({navigator,document,isEnabled:()=>db.settings.haptics});
const phoneNotifications=DevWellNotifications.create({getNotification:()=>window.Notification,serviceWorker:navigator.serviceWorker,isSecure:()=>window.isSecureContext,getSettings:()=>db.settings,storage:{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),removeItem:key=>localStorage.removeItem(key)},locks:navigator.locks});
let date=keyDate(),currentDay=keyDate(),page=['Today','Routine','Food','Move','Insights'].find(n=>n.toLowerCase()===location.hash.slice(1))||'Today';
let pendingBackup=null,installPrompt=null,lastRetentionCheck='';
const S=()=>db.days[date]||=(blank());
function applyHistoryRetention(today=keyDate()){
 const report=pruneHistory(db,today),expiredView=validDate(date)&&date<report.cutoff;
 if(expiredView)date=today;
 lastRetentionCheck=today;
 return {...report,expiredView};
}
function cleanupLegacyHistory(today){
 try{
  const raw=localStorage.getItem('devwell-v1');if(!raw)return;
  const legacy=JSON.parse(raw);
  if(pruneHistory(legacy,today).removed)localStorage.setItem('devwell-v1',JSON.stringify(legacy));
 }catch{}
}
function save(){
 const today=keyDate(),cleanup=applyHistoryRetention(today);cleanupLegacyHistory(today);
 try{localStorage.setItem('devwell-v2',JSON.stringify(db));storageAvailable=true}catch{storageAvailable=false}
 document.querySelector('#storageWarning').classList.toggle('hidden',storageAvailable);
 return cleanup;
}
function runRetentionCleanup(){
 if(lastRetentionCheck===keyDate())return;
 const report=applyHistoryRetention();save();
 if((report.removed||report.expiredView)&&typeof render==='function')render();
}

const percent=(a,b)=>b>0?Math.max(0,Math.min(100,Math.round(a/b*100))):0;
const progress=()=>percent(S().done.length,routine.length);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function go(p){
 if(!navs.some(n=>n[0]===p))return;
 page=p;history.replaceState(null,'','#'+p.toLowerCase());render();window.scrollTo(0,0);
 document.querySelector('#main').focus({preventScroll:true});
}
function toggleTask(i){
 if(!Number.isInteger(i)||i<0||i>=routine.length)return;
 const next=[...S().done],index=next.indexOf(i);
 index<0?next.push(i):next.splice(index,1);
 recordLog('done',next,index<0?'Routine completed':'Routine reopened',{haptic:index<0?'success':null});
}
function water(n){
 if(!Number.isFinite(n))return;
 recordLog('water',Math.min(20000,Math.max(0,S().water+n)),n>0?'Water logged':'Water adjusted',{haptic:n>0?'log':null});
}
function endLunch(t){let [h,m]=t.split(':').map(Number);return String((h+1)%24).padStart(2,'0')+':'+String(m).padStart(2,'0')}
function mood(value){if(['Good','Okay','Tired','Stressed'].includes(value))recordLog('mood',value,'Check-in saved')}

function updateLunchEnd(form){form.elements.e5.value=endLunch(form.elements.t5.value)}
function saveRoutine(event,form){event.preventDefault();updateLunchEnd(form);for(let i=0;i<13;i++){if(form.elements['e'+i].value<=form.elements['t'+i].value){document.querySelector('#routineError').textContent='End time must follow start time for '+routine[i][1]+'.';return;}}routine=routine.map((r,i)=>[form.elements['t'+i].value,r[1],r[2],r[3],form.elements['e'+i].value]);db.settings.routine=routine;closeModal();update('Routine windows saved')}
function removeMeal(i){
 if(!Number.isInteger(i)||i<0||i>=S().meals.length)return;
 const next=DevWellActivity.clone(S().meals);next.splice(i,1);
 recordLog('meals',next,'Meal removed',{haptic:null});
}
const exercises=[
 ['Eye reset','20 seconds','Look at a distant object and blink gently.',20,'eye'],
 ['Desk stretch','3 minutes · 6 steps','A guided seated neck, chest and upper-body reset.',180,'stretch'],
 ['Walk break','5 minutes','Stand up and walk at a comfortable pace.',300,'walk'],
 ['Breathing pause','2 minutes','Breathe comfortably, without forcing or holding.',120,'breathe']
];
function addMove(n){
 if(!Number.isFinite(n))return;
 recordLog('minutes',Math.min(1440,Math.max(0,S().minutes+n)),'Movement logged',{haptic:n>0?'log':null});
}
function fmt(n){n=Math.max(0,Math.ceil(n));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
function discardTimer(){haptics.cancel();db.timer=null;save();render();updateTimerVisual()}
function resetTimer(i){if(!exercises[i])return;haptics.cancel();db.timer={index:i,date:keyDate(),running:false,remaining:exercises[i][3],target:0};save();openTimer(i);render()}
function startTimer(i){
 if(!exercises[i])return;
 if(db.timer&&db.timer.index!==i){openTimer(i);return}
 if(!db.timer)db.timer={index:i,date:keyDate(),running:false,remaining:exercises[i][3],target:0};
 const t=db.timer;
 if(t.running){haptics.cancel();t.remaining=Math.max(0,(t.target-Date.now())/1000);t.running=false}
 else{t.target=Date.now()+t.remaining*1000;t.running=true}
 save();openTimer(i);render();if(i!==3)haptics.play('tap');
}
function tickTimer(){
 const t=db.timer;
 if(t?.running){
  const now=Date.now(),remaining=Math.max(0,Math.ceil((t.target-now)/1000));t.remaining=remaining;
  const mini=document.querySelector('#activeTimerTime');if(mini)mini.textContent=fmt(remaining);
  if(remaining===0){
   const fresh=now-t.target<=2000&&document.visibilityState==='visible';db.timer=null;
   let credited=false;
   if((t.index===1||t.index===2)&&t.date>=historyCutoff(keyDate())){
    const day=db.days[t.date]||=(blank()),minutes=Math.min(1440,day.minutes+Math.round(exercises[t.index][3]/60));
    credited=recordLog('minutes',minutes,exercises[t.index][0]+' complete · Movement logged',{day:t.date,haptic:null,feedback:fresh});
   }
   if(!credited){save();render();if(fresh)toast('Break complete')}
   const status=document.querySelector('#timerStatus');if(status){status.textContent='Break complete.';document.querySelector('#startTimer').textContent='Start again'}
   if(fresh)haptics.play('complete');
   if(now-t.target<=60000)notify('Break complete',exercises[t.index][0]+' finished.',{kind:'timer',page:'Move',id:'timer-'+t.date+'-'+t.target+'-'+t.index});
  }
 }
 updateTimerVisual();
}

function closeModal(){document.querySelector('#dialog').close();syncFeedbackHost()}
document.querySelector('#dialog').addEventListener('click',event=>{
 if(event.target!==event.currentTarget)return;
 const bounds=event.target.getBoundingClientRect();
 if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeModal();
});
function saveSettings(event,form){event.preventDefault();db.settings.water=+form.elements.water.value;db.settings.move=+form.elements.move.value;db.settings.sleep=+form.elements.sleep.value;closeModal();update('Goals saved')}
const navs=[['Today','home'],['Routine','calendar'],['Food','food'],['Move','move'],['Insights','chart']];

function dateBanner(){return date!==keyDate()?`<div class="context-banner" role="status"><span>Reviewing ${new Date(date+'T12:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span><button class="link" onclick="date=keyDate();render()">Back to today</button></div>`:''}
function timerBanner(){return db.timer?`<button class="context-banner timer-banner" onclick="openTimer(${db.timer.index})">${I('clock')}<span>${esc(exercises[db.timer.index][0])} · ${db.timer.running?'Running':'Paused'}</span><b id="activeTimerTime">${fmt(db.timer.remaining)}</b></button>`:''}
function downloadFile(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportBackup(){save();downloadFile('devwell-backup-'+keyDate()+'.json',JSON.stringify(db,null,2),'application/json');toast('Backup downloaded')}
async function readBackup(file){if(!file)return;if(file.size>5*1024*1024){toast('Choose a backup smaller than 5 MB.');return}try{pendingBackup=parseBackup(await file.text());const cleanup=pruneHistory(pendingBackup,keyDate());modal('Restore this backup?',`<p>This replaces the logs and preferences in this browser with ${Object.keys(pendingBackup.days).length} retained days from your backup.</p><p class="muted">The 365-day history policy applies. ${cleanup.removed} older day record${cleanup.removed===1?'':'s'} will not be imported.</p><p class="muted sub">Download your current backup first if you want to keep it.</p><button class="secondary sub" onclick="exportBackup()">Back up current data</button><button class="primary" onclick="restoreBackup()">Replace with backup</button><button class="secondary sub" onclick="pendingBackup=null;settings()">Cancel</button>`)}catch(error){toast(error.message);document.querySelector('#backupInput').value=''}}
function restoreBackup(){if(!pendingBackup)return;clearLogFeedback();db=pendingBackup;db.timer=null;routine=db.settings.routine;pendingBackup=null;date=keyDate();closeModal();update('Backup restored')}
function confirmReset(){modal('Clear local data?',`<p>This removes all DevWell logs and preferences from this browser. Download a backup if you want to keep them.</p><button class="secondary sub" onclick="exportBackup()">Download backup first</button><button class="primary danger-fill" onclick="resetData()">Clear all local data</button><button class="secondary sub" onclick="settings()">Keep my data</button>`)}
function resetData(){clearLogFeedback();try{localStorage.removeItem('devwell-v1');localStorage.removeItem('devwell-v2')}catch{}db=normalize({});routine=db.settings.routine;date=keyDate();phoneNotifications.clear();closeModal();update('Local data cleared')}
function downloadCalendar(){const pad=n=>String(n).padStart(2,'0');const d=new Date();while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+1);const day=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());const stamp=new Date().toISOString().replace(/[-:]|\.\d{3}/g,'');const safe=v=>v.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');let lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DevWell//Workday wellness//EN','CALSCALE:GREGORIAN'];routine.forEach((r,i)=>{lines.push('BEGIN:VEVENT','UID:devwell-'+i+'-'+Date.now()+'@devwell.local','DTSTAMP:'+stamp,'DTSTART:'+day+'T'+r[0].replace(':','')+'00','DTEND:'+day+'T'+r[4].replace(':','')+'00','RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR','SUMMARY:'+safe(r[1]),'DESCRIPTION:'+safe(r[2]+' · DevWell. Times use the calendar’s local timezone.'),'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:'+safe(r[1]),'END:VALARM','END:VEVENT')});lines.push('END:VCALENDAR');downloadFile('devwell-weekday-routine.ics',lines.join('\r\n')+'\r\n','text/calendar');toast('Calendar downloaded. Import it once in your calendar.')}
let notificationBusy=false,checkingReminders=false;
async function toggleNotifications(){
 if(notificationBusy)return;
 if(db.settings.notifications&&phoneNotifications.status().permission!=='default'){db.settings.notifications=false;save();render();openNotifications('Reminders are off. Your phone’s site permission is unchanged.');return}
 notificationBusy=true;document.querySelector('[data-notification-enable]')?.setAttribute('disabled','');
 const result=await phoneNotifications.requestPermission();
 notificationBusy=false;db.settings.notifications=result.ok;save();render();
 const message=result.ok?'Notifications enabled while DevWell is running. Send a test to check your phone.':notificationFeedback(result);
 if(document.querySelector('.notification-panel'))openNotifications(message);else toast(message);
}
async function testNotification(){
 const button=document.querySelector('[data-notification-test]');if(button)button.disabled=true;
 const pendingStatus=document.querySelector('#notificationResult');if(pendingStatus){pendingStatus.textContent='Requesting a test notification…';delete pendingStatus.dataset.result;}
 const result=await phoneNotifications.send({title:'A little better, every day.',body:'Your DevWell test notification. Tap to return to your wellbeing space.',kind:'test',page:'Today'});
 const message=result.ok?'Test notification requested. Check your phone’s notification tray.':notificationFeedback(result);
 const status=document.querySelector('#notificationResult');if(status){status.textContent=message;status.dataset.result=result.reason}else toast(message);
 if(button?.isConnected)button.disabled=!phoneNotifications.status().enabled;
}
function toggleNotificationType(key){
 if(!['routineNotifications','timerNotifications'].includes(key))return;
 db.settings[key]=!db.settings[key];save();openNotifications();
 document.querySelector('[data-notification-type="'+key+'"]')?.focus({preventScroll:true});
}
async function notify(title,body,options={}){return phoneNotifications.send({title,body,...options})}
async function checkReminders(now=new Date()){
 const today=DevWellNotifications.dayKey(now);
 if(today!==currentDay){if(date===currentDay)date=today;currentDay=today;render()}
 if(checkingReminders||!db.settings.notifications||!db.settings.routineNotifications)return;
 checkingReminders=true;
 try{for(const entry of DevWellNotifications.due(routine,now,db.days[today]?.done||[])){const result=await phoneNotifications.send(entry);if(result.ok)toast(entry.title+' · '+entry.body)}}
 finally{checkingReminders=false}
}
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',event=>{
 const data=event.data;if(data?.type!=='DEVWELL_NOTIFICATION_OPEN'||!navs.some(([name])=>name===data.page))return;
 closeModal();date=keyDate();go(data.page);
});
window.addEventListener('focus',()=>{runRetentionCleanup();if(typeof refreshNotificationPermission==='function')refreshNotificationPermission()});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event});
window.addEventListener('appinstalled',()=>{installPrompt=null;toast('DevWell installed')});
async function installApp(){if(window.matchMedia('(display-mode: standalone)').matches){toast('DevWell is already installed');return}if(installPrompt){await installPrompt.prompt();installPrompt=null;return}modal('Install DevWell',`<p>On Android, open your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</p><p class="sub">On iPhone, open DevWell in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>.</p><p class="muted sub">Visit the HTTPS hosted app once before using it offline.</p>`)}
window.addEventListener('hashchange',()=>{const match=navs.find(([name])=>name.toLowerCase()===location.hash.slice(1));if(match){page=match[0];render()}});
window.addEventListener('online',()=>toast('You’re back online'));
window.addEventListener('offline',()=>toast('Offline · Your logs still work on this device'));
window.addEventListener('storage',event=>{if(event.key==='devwell-v2'&&event.newValue){try{clearLogFeedback();db=normalize(JSON.parse(event.newValue));routine=db.settings.routine;const cleanup=applyHistoryRetention();if(cleanup.removed)save();if(!db.settings.haptics)haptics.cancel();render()}catch{}}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){runRetentionCleanup();tickTimer();checkReminders();if(typeof refreshNotificationPermission==='function')refreshNotificationPermission()}});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{reg.update().catch(()=>{});reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)document.querySelector('#updateNotice').classList.remove('hidden')})})}).catch(()=>toast('Offline setup failed. Your logs still work while online.')))}

