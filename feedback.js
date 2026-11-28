/* Accessible, reversible logging and once-per-day goal feedback. */
'use strict';
const feedbackHost=document.querySelector('#feedbackLayer');
const UNDO_WINDOW_MS=10000;
let undoEntry=null,undoTimeout=0,undoRemaining=0,undoStarted=0,undoHeld=false;
let toastTimeout=0,goalTimeout=0,goalQueue=[];
function quietAnimations(){return !db.settings.motion||matchMedia('(prefers-reduced-motion: reduce)').matches}
function syncFeedbackHost(){
 const dialog=document.querySelector('#dialog'),parent=dialog.open?dialog:document.body;
 if(feedbackHost.parentElement!==parent)parent.append(feedbackHost);
 feedbackHost.classList.toggle('in-dialog',dialog.open);
}
function toast(message){
 const el=document.querySelector('#toast');el.textContent=message;el.classList.remove('hidden');
 syncFeedbackHost();clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.add('hidden'),3500);
}
function pauseUndo(){
 clearTimeout(undoTimeout);
 if(undoStarted)undoRemaining=Math.max(0,undoRemaining-(performance.now()-undoStarted));
 undoStarted=0;
}
function resumeUndo(){
 pauseUndo();
 if(!undoEntry||undoHeld||document.hidden||feedbackHost.contains(document.activeElement))return;
 if(undoRemaining<=0){clearUndo();return}
 undoStarted=performance.now();undoTimeout=setTimeout(clearUndo,undoRemaining);
}
function clearUndo(){
 clearTimeout(undoTimeout);undoEntry=null;undoStarted=0;undoRemaining=0;
 feedbackHost.querySelector('.undo-notice')?.remove();
}
function showUndo(entry,message){
 clearUndo();undoEntry=entry;undoRemaining=UNDO_WINDOW_MS;
 const bar=document.createElement('section');bar.className='undo-notice';bar.setAttribute('aria-label','Last log');
 const status=document.createElement('span');status.setAttribute('role','status');status.textContent=message;
 const action=document.createElement('button');action.type='button';action.className='text-button';action.textContent='Undo';action.onclick=undoLastLog;
 const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='icon-button';dismiss.setAttribute('aria-label','Dismiss undo');dismiss.innerHTML=I('close');dismiss.onclick=clearUndo;
 bar.append(status,action,dismiss);feedbackHost.append(bar);syncFeedbackHost();resumeUndo();
}
function undoLastLog(){
 const entry=undoEntry;clearUndo();
 // Read the latest saved state before reverting, including updates whose storage event has not arrived.
 try{const raw=localStorage.getItem('devwell-v2');if(raw){db=normalize(JSON.parse(raw));routine=db.settings.routine}}catch{}
 if(!DevWellActivity.revert(db,entry,historyCutoff(keyDate()))){render();if(document.querySelector('#dialog').open&&document.querySelector('.dialog-readout'))openWater();toast('That entry changed. Your latest data was kept.');return}
 clearGoalFeedback();save();render();
 if(document.querySelector('#dialog').open&&document.querySelector('.dialog-readout'))openWater();
 (document.querySelector('#dialog').open?document.querySelector('.dialog-heading button'):document.querySelector('#main')).focus({preventScroll:true});toast('Last log undone');
}
function clearGoalFeedback(){
 clearTimeout(goalTimeout);goalQueue=[];feedbackHost.querySelector('.goal-celebration')?.remove();
}
function showNextGoal(){
 if(feedbackHost.querySelector('.goal-celebration')||!goalQueue.length)return;
 const goal=goalQueue.shift(),card=document.createElement('section');
 card.className='goal-celebration'+(quietAnimations()?' is-quiet':'');card.dataset.goal=goal.kind;card.setAttribute('role','status');
 const icon={water:'water',move:'move',routine:'check'}[goal.kind];
 card.innerHTML='<span class="goal-emblem" aria-hidden="true"><i></i><i></i><i></i><i></i>'+I(icon)+'</span><div><b>'+goal.title+'</b><p>'+goal.detail+'</p></div>';
 const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='icon-button';dismiss.setAttribute('aria-label','Dismiss celebration');dismiss.innerHTML=I('close');
 const finish=()=>{clearTimeout(goalTimeout);card.remove();showNextGoal()};
 const extend=()=>{clearTimeout(goalTimeout);goalTimeout=setTimeout(finish,6000)};
 card.addEventListener('pointerenter',()=>clearTimeout(goalTimeout));card.addEventListener('pointerleave',extend);
 card.addEventListener('focusin',()=>clearTimeout(goalTimeout));card.addEventListener('focusout',extend);
 dismiss.onclick=finish;card.append(dismiss);feedbackHost.prepend(card);syncFeedbackHost();extend();
}
function celebrateGoals(kinds,day){
 for(const kind of kinds){
  const item=kind==='water'?{title:'Hydration goal reached',detail:day.water.toLocaleString()+' ml today'}:kind==='move'?{title:'Movement goal reached',detail:day.minutes+' minutes today'}:{title:'Your routine is complete',detail:routine.length+' healthy breaks, one good day'};
  goalQueue.push({kind,...item});
 }
 showNextGoal();
}
function clearLogFeedback(){clearUndo();clearGoalFeedback()}
function recordLog(field,value,message,{day=date,haptic='log',feedback=true}={}){
 if(day<historyCutoff(keyDate())){toast('That day has expired from retained history.');return false}
 const data=db.days[day]||=(blank()),entry=DevWellActivity.change(day,field,data[field],value);
 if(!entry)return false;
 const before={water:data.water,minutes:data.minutes,done:[...data.done]};
 data[field]=DevWellActivity.clone(value);
 const goals=DevWellActivity.goalCrossings(before,data,db.settings,routine.length);
 data.celebrated=[...new Set([...(data.celebrated||[]),...goals])];
 update();
 if(feedback){
  document.querySelector('#toast').classList.add('hidden');showUndo(entry,message);
  if(day===keyDate()&&document.visibilityState==='visible')celebrateGoals(goals,data);
  if(haptic)haptics.play(haptic);
 }else clearUndo();
 return true;
}
feedbackHost.addEventListener('pointerenter',()=>{undoHeld=true;pauseUndo()});
feedbackHost.addEventListener('pointerleave',()=>{undoHeld=false;resumeUndo()});
feedbackHost.addEventListener('focusin',pauseUndo);
feedbackHost.addEventListener('focusout',()=>queueMicrotask(resumeUndo));
document.addEventListener('visibilitychange',()=>document.hidden?pauseUndo():resumeUndo());
