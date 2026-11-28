const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
async function click(page,existing=true){
 let work,closed=false,opened,focused=false,message;
 const client={url:'https://example.com/DevWell/',postMessage:data=>{message=data},focus:async()=>{focused=true}};
 const handlers={};const self={location:new URL('https://example.com/DevWell/sw.js'),addEventListener:(type,handler)=>{handlers[type]=handler},clients:{matchAll:async()=>existing?[client]:[],openWindow:async url=>{opened=url}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../sw.js'),'utf8'),{self,URL});
 handlers.notificationclick({notification:{data:{page},close:()=>{closed=true}},waitUntil:promise=>{work=promise}});
 await work;return {closed,opened,focused,message};
}
test('notification click focuses an existing app and opens its activity',async()=>{
 const result=await click('Routine');assert.equal(result.closed,true);assert.equal(result.focused,true);assert.equal(result.message.page,'Routine');assert.equal(result.message.type,'DEVWELL_NOTIFICATION_OPEN');assert.equal(result.opened,undefined);
});
test('notification click opens the correct project route when the app is closed',async()=>{
 assert.equal((await click('Move',false)).opened,'https://example.com/DevWell/#move');
 assert.equal((await click('https://evil.example/',false)).opened,'https://example.com/DevWell/#today');
});
