/* Phone notifications via the active app worker; no closed-app scheduler. */
(function(root){
 'use strict';
 const RECEIPTS='devwell-notification-receipts-v1';
 const dayKey=now=>now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
 function due(routine,now,done=[]){
  if(now.getDay()===0||now.getDay()===6)return [];
  return routine.flatMap((r,index)=>{
   const start=new Date(now),end=new Date(now),[h,m]=r[0].split(':').map(Number),[eh,em]=r[4].split(':').map(Number);
   start.setHours(h,m,0,0);end.setHours(eh,em,0,0);
   return !done.includes(index)&&now-start>=0&&now-start<120000&&now<end?[{id:'routine-'+dayKey(now)+'-'+index,title:r[1],body:r[2]+' · '+r[0]+'–'+r[4],page:'Routine',kind:'routine'}]:[];
  });
 }
 function upcoming(routine,now,done=[],limit=3){
  const entries=[];
  for(let offset=0;offset<8;offset++){
   const day=new Date(now);day.setDate(day.getDate()+offset);
   if(day.getDay()===0||day.getDay()===6)continue;
   routine.forEach((r,index)=>{const at=new Date(day),[h,m]=r[0].split(':').map(Number);at.setHours(h,m,0,0);if(at>now&&(offset>0||!done.includes(index)))entries.push({index,title:r[1],icon:r[3],at,time:r[0]})});
  }
  return entries.sort((a,b)=>a.at-b.at).slice(0,limit);
 }
 function create({getNotification,serviceWorker,isSecure,getSettings,storage,locks}){
  const seen=new Set();
  function status(){
   if(!isSecure())return {permission:'insecure',enabled:false};
   const api=getNotification();
   if(!api||typeof api.requestPermission!=='function'||!serviceWorker)return {permission:'unsupported',enabled:false};
   return {permission:api.permission,enabled:api.permission==='granted'&&getSettings().notifications};
  }
  async function requestPermission(){
   const state=status();if(['insecure','unsupported','denied'].includes(state.permission))return {ok:false,reason:state.permission};
   try{
    // Called directly from the user's enable button, before any worker await.
    const permission=state.permission==='granted'?'granted':await getNotification().requestPermission();
    return {ok:permission==='granted',reason:permission};
   }catch{return {ok:false,reason:'permission-error'}}
  }
  function read(){
   try{const ids=JSON.parse(storage.getItem(RECEIPTS)||'[]');if(Array.isArray(ids))ids.filter(id=>typeof id==='string').slice(-200).forEach(id=>seen.add(id))}catch{}
  }
  function remember(id){if(!id)return;seen.add(id);try{storage.setItem(RECEIPTS,JSON.stringify([...seen].slice(-200)))}catch{}}
  function forget(id){seen.delete(id);try{storage.setItem(RECEIPTS,JSON.stringify([...seen].slice(-200)))}catch{}}
  async function registration(){
   const current=await serviceWorker.getRegistration();
   if(current?.active&&typeof current.showNotification==='function')return current;
   let timeout;
   try{return await Promise.race([serviceWorker.ready,new Promise(resolve=>{timeout=setTimeout(()=>resolve(null),4000)})])}
   finally{clearTimeout(timeout)}
  }
  async function send({title,body,kind='test',page='Today',id}){
   const deliver=async()=>{
    const state=status(),settings=getSettings();
    if(!state.enabled)return {ok:false,reason:state.permission==='granted'?'off':state.permission};
    if(kind==='routine'&&!settings.routineNotifications||kind==='timer'&&!settings.timerNotifications)return {ok:false,reason:'category-off'};
    read();if(id&&seen.has(id))return {ok:false,reason:'duplicate'};
    try{
     const worker=await registration();if(!worker?.active||typeof worker.showNotification!=='function')return {ok:false,reason:'worker-unavailable'};
     if(!status().enabled)return {ok:false,reason:'off'};
     remember(id);
     const safePage=['Today','Routine','Food','Move','Insights'].includes(page)?page:'Today';
     await worker.showNotification('DevWell · '+title,{body,icon:'./assets/icon-192.png',tag:id?'devwell-'+id:'devwell-test',renotify:kind==='test',data:{type:'DEVWELL_NOTIFICATION_OPEN',page:safePage,kind}});
     return {ok:true,reason:'requested'};
    }catch{if(id)forget(id);return {ok:false,reason:'delivery-error'}}
   };
   try{return locks?.request?await locks.request('devwell-notification-delivery',deliver):await deliver()}
   catch{return {ok:false,reason:'delivery-error'}}
  }
  function clear(){seen.clear();try{storage.removeItem(RECEIPTS)}catch{}}
  return {status,requestPermission,send,clear};
 }
 const api={create,due,upcoming,dayKey};root.DevWellNotifications=api;
 if(typeof module!=='undefined')module.exports=api;
})(globalThis);
