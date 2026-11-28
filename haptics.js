/* Optional, bounded haptic feedback. Never substitutes for visible feedback. */
(function(root){
 'use strict';
 const patterns=Object.freeze({tap:12,log:18,success:Object.freeze([18,45,25]),complete:Object.freeze([45,60,75]),test:Object.freeze([150,80,150]),breathIn:Object.freeze([35,50,35]),breathOut:75});
 function create({navigator:device,document:page,isEnabled,now=()=>Date.now()}){
  let last=-Infinity,until=0,result={accepted:false,reason:'idle'};
  const finish=(reason,accepted=false)=>{result={accepted,reason};return accepted};
  const supported=()=>typeof device?.vibrate==='function';
  function cancel(){
   if(until>now()&&supported()){try{device.vibrate(0)}catch{}}
   until=0;last=-Infinity;
  }
  function play(kind){
   const pattern=patterns[kind];
   if(pattern===undefined)return finish('invalid-action');
   if(!supported())return finish('unsupported');
   if(!isEnabled())return finish('disabled');
   if(page.visibilityState!=='visible')return finish('hidden');
   if(device.userActivation?.hasBeenActive===false)return finish('activation-required');
   const time=now();
   if(!['complete','test','breathIn','breathOut'].includes(kind)&&time-last<120)return finish('throttled');
   try{
    if(device.vibrate(Array.isArray(pattern)?[...pattern]:pattern)!==true)return finish('declined');
    last=time;until=time+(Array.isArray(pattern)?pattern.reduce((a,b)=>a+b,0):pattern);
    return finish('accepted',true);
   }catch{return finish('exception')}
  }
  const onVisibility=()=>{if(page.visibilityState!=='visible')cancel()};
  page.addEventListener('visibilitychange',onVisibility);
  root.addEventListener?.('pagehide',cancel);
  return {play,cancel,supported,lastResult:()=>({...result}),dispose(){cancel();page.removeEventListener('visibilitychange',onVisibility);root.removeEventListener?.('pagehide',cancel)}};
 }
 const api={create,patterns};
 root.DevWellHaptics=api;
 if(typeof module!=='undefined')module.exports=api;
})(globalThis);
