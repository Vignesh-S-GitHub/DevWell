const {test}=require('node:test'),assert=require('node:assert/strict');
const {create,due,upcoming}=require('../notifications.js');
const {defaults}=require('../model.js');
function fixture({permission='granted',enabled=true,secure=true,supported=true,store=new Map(),locks}={}){
 const settings={notifications:enabled,routineNotifications:true,timerNotifications:true},calls=[];
 let asks=0,fail=false;const api={permission,requestPermission:async()=>{asks++;api.permission='granted';return api.permission}};
 const worker={active:{},showNotification:async(title,options)=>{if(fail)throw Error('blocked');calls.push({title,options})}};
 const serviceWorker={getRegistration:async()=>worker,ready:Promise.resolve(worker)};
 const client=create({getNotification:()=>supported?api:undefined,serviceWorker,isSecure:()=>secure,getSettings:()=>settings,storage:{getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)},locks});
 return {client,api,worker,settings,calls,store,asks:()=>asks,fail(value){fail=value}};
}
test('permission is requested explicitly; denial, unsupported and insecure contexts never prompt',async()=>{
 const f=fixture({permission:'default',enabled:false});assert.equal(f.asks(),0);assert.equal(f.client.status().enabled,false);assert.equal((await f.client.requestPermission()).ok,true);assert.equal(f.asks(),1);
 for(const options of [{permission:'denied'},{supported:false},{secure:false}]){const x=fixture(options);assert.equal((await x.client.requestPermission()).ok,false);assert.equal(x.asks(),0)}
});
test('phone delivery uses the worker, icon, stable tag and safe click route',async()=>{
 const f=fixture();const result=await f.client.send({title:'Hydrate',body:'Drink water',kind:'routine',page:'Routine',id:'routine-day-1'});
 assert.equal(result.ok,true);assert.equal(f.calls.length,1);const {title,options}=f.calls[0];
 assert.match(title,/DevWell/);assert.match(options.icon,/icon-192.png$/);assert.equal(options.tag,'devwell-routine-day-1');assert.equal(options.data.page,'Routine');
 await f.client.send({title:'Test',body:'Test',page:'https://example.com'});assert.equal(f.calls.at(-1).options.data.page,'Today');assert.equal(f.calls.at(-1).options.renotify,true);
});
test('off, revoked permission and separate category preferences prevent delivery',async()=>{
 const f=fixture({enabled:false});assert.equal((await f.client.send({title:'Test'})).reason,'off');
 f.settings.notifications=true;f.settings.routineNotifications=false;assert.equal((await f.client.send({title:'Hydrate',kind:'routine'})).reason,'category-off');
 f.settings.timerNotifications=false;assert.equal((await f.client.send({title:'Done',kind:'timer'})).reason,'category-off');
 f.api.permission='denied';assert.equal((await f.client.send({title:'Test'})).reason,'denied');assert.equal(f.calls.length,0);
});
test('delivery receipts survive reloads and failed requests can be retried',async()=>{
 const f=fixture(),entry={title:'Hydrate',body:'Water',kind:'routine',id:'routine-2026-11-30-1'};
 assert.equal((await f.client.send(entry)).ok,true);assert.equal((await f.client.send(entry)).reason,'duplicate');
 const restored=fixture({store:f.store});assert.equal((await restored.client.send(entry)).reason,'duplicate');assert.equal(restored.calls.length,0);
 const retry={...entry,id:'retry'};f.fail(true);assert.equal((await f.client.send(retry)).reason,'delivery-error');f.fail(false);assert.equal((await f.client.send(retry)).ok,true);
 f.client.clear();assert.equal((await f.client.send(entry)).ok,true);
});
test('Web Locks serialize two tabs so only one delivers the same reminder',async()=>{
 let queue=Promise.resolve();const locks={request:(_name,callback)=>{const pending=queue.then(callback);queue=pending.catch(()=>{});return pending}};
 const store=new Map(),a=fixture({store,locks}),b=fixture({store,locks}),entry={title:'Hydrate',kind:'routine',id:'shared'};
 const results=await Promise.all([a.client.send(entry),b.client.send(entry)]);assert.equal(results.filter(r=>r.ok).length,1);assert.equal(a.calls.length+b.calls.length,1);
});
test('weekday reminders honor edited windows, completions and a bounded late-arrival grace period',()=>{
 const at=(h,m,s=0)=>new Date(2026,10,30,h,m,s);
 assert.equal(due(defaults,at(10,0)).length,1);assert.equal(due(defaults,at(10,1,59)).length,1);
 assert.equal(due(defaults,at(10,2)).length,0);assert.equal(due(defaults,at(10,0),[1]).length,0);
 assert.equal(due(defaults,new Date(2026,10,28,10,0)).length,0);
 const edited=defaults.map(r=>[...r]);edited[1][0]='10:20';assert.equal(due(edited,at(10,0)).length,0); // Original end is before new start: never send an invalid window.
 edited[1][4]='10:35';assert.equal(due(edited,at(10,20)).length,1);
});
test('next windows skip weekends and completed entries, then resume on Monday',()=>{
 const entries=upcoming(defaults,new Date(2026,10,28,12,0));assert.equal(entries.length,3);assert.equal(entries[0].at.getDay(),1);assert.equal(entries[0].time,'09:00');
 const monday=upcoming(defaults,new Date(2026,10,30,8,0),[0,1]);assert.equal(monday[0].title,'Eye break');
});
test('missing active worker and delivery errors are reported without breaking app actions',async()=>{
 const f=fixture();f.worker.active=null;assert.equal((await f.client.send({title:'Test'})).reason,'worker-unavailable');
 const x=fixture();x.fail(true);assert.equal((await x.client.send({title:'Test'})).reason,'delivery-error');
});
