/* Animated artwork and progress. Page/card positions never animate on navigation. */
(()=>{
 'use strict';
 const epoch=performance.now();
 let cleanup=()=>{},values=new Map(),completed=new Set(),meals=new Set(),lastSignal='';
 const ease='cubic-bezier(.16,1,.3,1)';
 function init(){
  cleanup();const main=document.querySelector('#main');if(!main)return;
  const quiet=document.body.classList.contains('quiet-motion'),signal=document.body.dataset.signal,entered=signal!==lastSignal;lastSignal=signal;
  const active=new Set();
  function animate(element,frames,options={}){
   if(quiet||!element||document.hidden)return;
   const animation=element.animate(frames,{duration:350,easing:ease,...options});
   active.add(animation);animation.onfinish=animation.oncancel=()=>active.delete(animation);
  }
  const nextValues=new Map();
  main.querySelectorAll('.track>span,.fluid-level,.hero-progress-value').forEach((element,index)=>{
   const key=signal+':'+index,arc=element.matches('.hero-progress-value'),property=arc?'strokeDashoffset':'transform',value=element.style[property],previous=values.get(key);
   if(value!==previous)animate(element,[{[property]:previous||(arc?'930':element.matches('.fluid-level')?'scaleY(0)':'scaleX(0)')},{[property]:value}],{duration:420});
   nextValues.set(key,value);
  });values=nextValues;
  if(entered)main.querySelectorAll('.bar').forEach((bar,i)=>animate(bar,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:400,delay:Math.min(i*16,160)}));
  const nextCompleted=new Set();
  main.querySelectorAll('[data-routine].is-done').forEach(row=>{
   const key=signal+':'+row.dataset.routine;nextCompleted.add(key);
   if(!completed.has(key))animate(row.querySelector('.complete-button svg path'),[{strokeDasharray:'28',strokeDashoffset:28},{strokeDasharray:'28',strokeDashoffset:0}],{duration:240});
  });completed=nextCompleted;
  const nextMeals=new Set();
  main.querySelectorAll('[data-meal-entry]').forEach(row=>{
   const key=signal+':'+row.dataset.mealEntry;nextMeals.add(key);
   if(!entered&&!meals.has(key))animate(row,[{opacity:.4},{opacity:1}],{duration:180});
  });meals=nextMeals;
  // Restore a shared phase on render so logging and tab changes cannot snap artwork back.
  if(!quiet)for(const animation of main.getAnimations({subtree:true})){
   const timing=animation.effect?.getTiming(),duration=Number(timing?.duration);
   if(timing?.iterations===Infinity&&Number.isFinite(duration)&&duration>0)animation.currentTime=(performance.now()-epoch)%duration;
  }
  const loops=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('animation-paused',!entry.isIntersecting)));
  main.querySelectorAll('.page-art,.pulse-stage,.reset-art,.hydration-station,.reset-link,.live-label,.routine-symbol').forEach(el=>loops.observe(el));
  const visibility=()=>{document.body.classList.toggle('animations-suspended',document.hidden);for(const animation of active){document.hidden?animation.pause():animation.play()}};
  document.addEventListener('visibilitychange',visibility);visibility();
  cleanup=()=>{loops.disconnect();for(const animation of active)animation.cancel();active.clear();document.removeEventListener('visibilitychange',visibility)};
 }
 document.addEventListener('pulse:dispose',()=>cleanup());
 document.addEventListener('pulse:render',init);init();
})();

