/* Shared Pulse motion: progressive enhancement, visibility-aware and disposable. */
(()=>{
 'use strict';
 let cleanup=()=>{},lastSignal='',values=new Map(),completed=new Set(),meals=new Set();
 const ease='cubic-bezier(.16,1,.3,1)';
 function init(){
  cleanup();
  const main=document.querySelector('#main');if(!main)return;
  const quiet=document.body.classList.contains('quiet-motion'),signal=document.body.dataset.signal;
  const entered=lastSignal!==signal;lastSignal=signal;
  const active=new Set(),observers=[];
  const animate=(element,frames,options={})=>{
   if(quiet||!element||document.hidden)return;
   const animation=element.animate(frames,{duration:420,easing:ease,...options});
   active.add(animation);animation.onfinish=animation.oncancel=()=>active.delete(animation);return animation;
  };
  if(!quiet&&entered){
   const elements=[...main.querySelectorAll('.page-heading,.launch-copy,.command-strip,.energy-check,.routine-overview,.day-selector,.routine-row,.hydration-station,.meal-ledger,.meal-idea,.movement-console,.reset-option,.insight-intro,.analytics,.recovery-grid>.surface,.date-review')];
   const reveal=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;
    animate(entry.target,[{opacity:.45,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{delay:Math.min(elements.indexOf(entry.target)%4*35,105)});
    reveal.unobserve(entry.target);
   }},{threshold:.08});
   elements.forEach(el=>reveal.observe(el));observers.push(reveal);
   main.querySelectorAll('.bar').forEach((bar,i)=>animate(bar,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:520,delay:i*25}));
  }
  const nextValues=new Map();
  main.querySelectorAll('.track>span,.fluid-level').forEach((element,index)=>{
   const key=signal+':'+index,transform=element.style.transform,previous=values.get(key);
   if(previous!==transform)animate(element,[{transform:previous||(element.matches('.fluid-level')?'scaleY(0)':'scaleX(0)')},{transform}],{duration:550});
   nextValues.set(key,transform);
  });values=nextValues;
  const nextCompleted=new Set();
  main.querySelectorAll('[data-routine].is-done').forEach(row=>{
   const key=signal+':'+row.dataset.routine;nextCompleted.add(key);
   if(!completed.has(key))animate(row.querySelector('.complete-button'),[{transform:'scale(.8)'},{transform:'scale(1.08)',offset:.65},{transform:'scale(1)'}],{duration:280});
  });completed=nextCompleted;
  const nextMeals=new Set();
  main.querySelectorAll('[data-meal-entry]').forEach(row=>{
   const key=signal+':'+row.dataset.mealEntry;nextMeals.add(key);
   if(!entered&&!meals.has(key))animate(row,[{opacity:.4,transform:'translateX(10px)'},{opacity:1,transform:'translateX(0)'}],{duration:280});
  });meals=nextMeals;
  const loops=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('motion-paused',!entry.isIntersecting)));
  main.querySelectorAll('.pulse-stage,.reset-art,.hydration-station,.reset-link,.live-label').forEach(el=>loops.observe(el));observers.push(loops);
  const visibility=()=>{document.body.classList.toggle('motion-suspended',document.hidden);for(const animation of active){document.hidden?animation.pause():animation.play();}};
  document.addEventListener('visibilitychange',visibility);visibility();
  cleanup=()=>{observers.forEach(observer=>observer.disconnect());for(const animation of active)animation.cancel();active.clear();document.removeEventListener('visibilitychange',visibility);};
 }
 document.addEventListener('pulse:dispose',()=>cleanup());
 document.addEventListener('pulse:render',init);
 init();
})();
