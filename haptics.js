/* Optional, bounded haptic feedback. Never substitutes for visible feedback. */
(function(root){
 'use strict';
 const patterns=Object.freeze({tap:12,log:18,success:Object.freeze([18,45,25]),complete:Object.freeze([45,60,75])});
 function create({navigator:device,document:page,isEnabled,now=()=>Date.now()}){
  let last=-Infinity,until=0;
  const supported=()=>typeof device?.vibrate==='function';
  function cancel(){
   if(until>now()&&supported()){try{device.vibrate(0)}catch{}}
   until=0;last=-Infinity;
  }
  function play(kind){
   const pattern=patterns[kind];
   if(pattern===undefined||!supported()||!isEnabled()||page.visibilityState!=='visible'||device.userActivation?.hasBeenActive===false)return false;
   const time=now();
   if(kind!=='complete'&&time-last<120)return false;
   try{
    if(device.vibrate(Array.isArray(pattern)?[...pattern]:pattern)!==true)return false;
    last=time;until=time+(Array.isArray(pattern)?pattern.reduce((a,b)=>a+b,0):pattern);
    return true;
   }catch{return false}
  }
  const onVisibility=()=>{if(page.visibilityState!=='visible')cancel()};
  page.addEventListener('visibilitychange',onVisibility);
  root.addEventListener?.('pagehide',cancel);
  return {play,cancel,supported,dispose(){cancel();page.removeEventListener('visibilitychange',onVisibility);root.removeEventListener?.('pagehide',cancel)}};
 }
 const api={create,patterns};
 root.DevWellHaptics=api;
 if(typeof module!=='undefined')module.exports=api;
})(globalThis);
