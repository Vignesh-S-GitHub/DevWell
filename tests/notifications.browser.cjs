/* Browser/API flow coverage. Headless tests cannot confirm a phone banner. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']}: {})});
 try{
  const base=process.env.BASE_URL||'http://127.0.0.1:4173/';
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.addInitScript(()=>{
   window.__permissionRequests=0;window.__notifications=[];window.__failNotification=false;
   class FakeNotification{
    static get permission(){return sessionStorage.getItem('__notificationPermission')||'default'}
    static async requestPermission(){window.__permissionRequests++;sessionStorage.setItem('__notificationPermission','granted');return 'granted'}
    constructor(){throw Error('Mobile notifications must use the service worker')}
   }
   Object.defineProperty(window,'Notification',{configurable:true,value:FakeNotification});
   ServiceWorkerRegistration.prototype.showNotification=async function(title,options){if(window.__failNotification)throw Error('denied');window.__notifications.push({title,options})};
  });
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  assert.equal(await p.evaluate(()=>window.__permissionRequests),0,'No permission prompt on load');
  await p.getByRole('button',{name:'Notifications',exact:true}).click();
  assert.match(await p.locator('.notification-state').innerText(),/Permission needed/);
  assert.equal(await p.evaluate(()=>window.__permissionRequests),0,'Opening the panel does not prompt');
  await p.getByRole('button',{name:'Enable notifications',exact:true}).click();
  assert.equal(await p.evaluate(()=>window.__permissionRequests),1);assert.equal(await p.getByRole('button',{name:'Notifications',exact:true}).getAttribute('data-enabled'),'true');
  await p.getByRole('button',{name:'Send test notification',exact:true}).click();
  await p.waitForFunction(()=>document.querySelector('#notificationResult')?.dataset.result==='requested');
  const sample=await p.evaluate(()=>window.__notifications[0]);assert.match(sample.title,/DevWell/);assert.equal(sample.options.data.page,'Today');assert.match(sample.options.icon,/icon-192/);
  await fs.mkdir('test-results',{recursive:true});
  for(const width of [320,360,390,768,1440]){await p.setViewportSize({width,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Notification header fits');assert.equal(await p.locator('dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Notification panel fits')}
  await p.setViewportSize({width:390,height:844});await p.screenshot({path:'test-results/notifications-dark-390.png'});
  await p.getByRole('button',{name:'Close dialog'}).click();
  await p.evaluate(()=>checkReminders(new Date(2026,10,30,10,0,30)));assert.equal(await p.evaluate(()=>window.__notifications.filter(n=>n.options.data.kind==='routine').length),1);
  await p.evaluate(()=>checkReminders(new Date(2026,10,30,10,0,40)));assert.equal(await p.evaluate(()=>window.__notifications.filter(n=>n.options.data.kind==='routine').length),1);
  await p.reload();await p.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  await p.evaluate(()=>checkReminders(new Date(2026,10,30,10,0,45)));assert.equal(await p.evaluate(()=>window.__notifications.length),0,'Reload does not repeat a delivered routine reminder');
  await p.getByRole('button',{name:'Notifications',exact:true}).click();await p.getByRole('switch',{name:'Routine reminders',exact:true}).click();
  assert.equal(await p.getByRole('switch',{name:'Routine reminders',exact:true}).getAttribute('aria-checked'),'false');
  await p.reload();await p.getByRole('button',{name:'Notifications',exact:true}).click();assert.equal(await p.getByRole('switch',{name:'Routine reminders',exact:true}).getAttribute('aria-checked'),'false');
  await p.getByRole('button',{name:'Close dialog'}).click();await p.evaluate(()=>checkReminders(new Date(2026,10,30,10,50,10)));assert.equal(await p.evaluate(()=>window.__notifications.length),0,'Routine category off stops reminder delivery');
  await p.evaluate(()=>{db.timer={index:1,date:keyDate(),running:true,remaining:1,target:Date.now()-1};tickTimer();tickTimer()});
  await p.waitForFunction(()=>window.__notifications.some(n=>n.options.data.kind==='timer'));
  assert.equal(await p.evaluate(()=>window.__notifications.filter(n=>n.options.data.kind==='timer').length),1);assert.equal(await p.evaluate(()=>window.__notifications.find(n=>n.options.data.kind==='timer').options.data.page),'Move');
  await p.getByRole('button',{name:'Notifications',exact:true}).click();await p.getByRole('switch',{name:'Break completion alerts',exact:true}).click();
  await p.getByRole('button',{name:'Close dialog'}).click();await p.evaluate(()=>{db.timer={index:1,date:keyDate(),running:true,remaining:1,target:Date.now()-1};tickTimer()});
  assert.equal(await p.evaluate(()=>window.__notifications.filter(n=>n.options.data.kind==='timer').length),1);
  await p.getByRole('button',{name:'Notifications',exact:true}).click();
  await p.evaluate(()=>window.__failNotification=true);await p.getByRole('button',{name:'Send test notification',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#notificationResult')?.dataset.result==='delivery-error');assert.match(await p.locator('#notificationResult').innerText(),/failed/);
  await p.evaluate(()=>window.__failNotification=false);
  const download=p.waitForEvent('download');await p.getByRole('button',{name:'Export weekday calendar',exact:true}).click();assert.match((await download).suggestedFilename(),/routine.*ics/);
  await p.evaluate(()=>navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'DEVWELL_NOTIFICATION_OPEN',page:'Routine'}})));
  await p.getByRole('heading',{name:'Your day, by design.',exact:true}).waitFor();assert.equal(await p.locator('dialog').evaluate(el=>el.open),false);
  await p.getByRole('button',{name:'Notifications',exact:true}).click();await p.getByRole('button',{name:'Turn off notifications',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Send test notification',exact:true}).isDisabled(),true);
  await p.getByRole('button',{name:'Close dialog'}).click();await p.evaluate(()=>{db.settings.dark=false;render();openNotifications()});await p.screenshot({path:'test-results/notifications-light-390.png'});
  assert.deepEqual(errors,[]);await context.close();
  for(const mode of ['denied','unsupported']){
   const c=await browser.newContext();await c.addInitScript(mode=>{
    window.__permissionRequests=0;
    Object.defineProperty(window,'Notification',{configurable:true,value:mode==='unsupported'?undefined:class{static permission='denied';static async requestPermission(){window.__permissionRequests++;return 'denied'}}});
   },mode);
   const page=await c.newPage();await page.goto(base);await page.getByRole('button',{name:'Notifications',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Enable notifications',exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'Send test notification',exact:true}).isDisabled(),true);assert.equal(await page.evaluate(()=>window.__permissionRequests),0);assert.match(await page.locator('#notificationResult').innerText(),mode==='denied'?/blocked/:/unavailable/);
   await page.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('navigation').getByRole('button',{name:'Food',exact:true}).click();await page.getByRole('button',{name:'Add 250 ml',exact:true}).click();assert.match(await page.locator('.big').innerText(),/250/);await c.close();
  }
  console.log('PASS: opt-in permission, worker test delivery, permission/error feedback, persistent category toggles, reload deduplication, routine/break alerts, notification routing, calendar export, blocked/unsupported fallback and five responsive notification layouts.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
