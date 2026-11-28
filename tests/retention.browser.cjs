/* Automatic retention through boot, daily cycle, restore, cross-tab updates and offline startup. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']}: {})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Kolkata',reducedMotion:'reduce',acceptDownloads:true});
  await context.addInitScript(()=>{
   const RealDate=Date;window.__retentionNow=Number(localStorage.getItem('__retention-test-clock'))||new RealDate(2026,10,28,12).valueOf();
   window.Date=class extends RealDate{constructor(...args){args.length?super(...args):super(window.__retentionNow)}static now(){return window.__retentionNow}};
   const interval=window.setInterval.bind(window);window.setInterval=(callback,ms,...args)=>{if(ms===60000)window.__retentionCycle=()=>callback(...args);return interval(callback,ms,...args)};
   window.__retentionKey=offset=>{const day=new RealDate(window.__retentionNow);day.setDate(day.getDate()+offset);return day.getFullYear()+'-'+String(day.getMonth()+1).padStart(2,'0')+'-'+String(day.getDate()).padStart(2,'0')};
   if(!sessionStorage.getItem('__retention-test-seeded')){
    const days={};for(let age=0;age<730;age++)days[window.__retentionKey(-age)]={water:500+age,minutes:30,sleep:7.5,done:[0,1],mood:'Good',meals:[{type:'Lunch',name:'Day '+age}]};
    localStorage.setItem('devwell-v2',JSON.stringify({schemaVersion:2,settings:{water:2500,move:40,sleep:8,dark:true,visualVersion:3,motion:false,haptics:false},days,timer:{index:1,date:window.__retentionKey(-1),running:false,remaining:123.5,target:0}}));
    localStorage.setItem('devwell-v1',JSON.stringify({days:{[window.__retentionKey(-500)]:{water:1},[window.__retentionKey(-10)]:{water:700}},settings:{legacy:true},marker:'keep'}));
    localStorage.setItem('other-project-data','unchanged');
    sessionStorage.setItem('__retention-test-seeded','yes');
   }
  });
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:4173/');await p.waitForFunction(()=>!!document.querySelector('h1'));
  const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('devwell-v2')));
  const dates=await p.evaluate(()=>({today:keyDate(),cutoff:historyCutoff(keyDate()),old:window.__retentionKey(-365)}));
  let data=await state();assert.equal(Object.keys(data.days).length,365);assert.ok(data.days[dates.today]);assert.equal(data.days[dates.cutoff].water,864);assert.equal(data.days[dates.old],undefined);
  assert.equal(data.settings.water,2500);assert.equal(data.settings.move,40);assert.equal(data.timer.remaining,123.5);assert.equal(data.timer.running,false);
  const legacy=await p.evaluate(()=>JSON.parse(localStorage.getItem('devwell-v1')));
  assert.equal(Object.keys(legacy.days).length,1);assert.equal(legacy.marker,'keep');assert.equal(legacy.settings.legacy,true);assert.equal(await p.evaluate(()=>localStorage.getItem('other-project-data')),'unchanged');
  await p.reload();assert.equal(Object.keys((await state()).days).length,365,'Repeated startup keeps the same boundary');
  await p.getByRole('button',{name:'Settings',exact:true}).click();
  assert.match(await p.locator('.history-retention').innerText(),/365 days/);
  for(const width of [320,390]){await p.setViewportSize({width,height:844});assert.equal(await p.locator('dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Retention status fits mobile preferences')}
  await fs.mkdir('test-results',{recursive:true});await p.locator('.history-retention').scrollIntoViewIfNeeded();await p.screenshot({path:'test-results/automatic-retention-390.png'});
  await p.getByRole('button',{name:'Close dialog'}).click();
  await p.getByRole('navigation').getByRole('button',{name:'Insights',exact:true}).click();assert.equal(await p.getByLabel('Date',{exact:true}).getAttribute('min'),dates.cutoff);
  await p.evaluate(old=>selectDay(old),dates.old);assert.equal(await p.evaluate(()=>date),dates.today);assert.equal((await state()).days[dates.old],undefined);
  // A daily cycle advances the cutoff without reload and returns an expired view to today.
  await p.evaluate(cutoff=>selectDay(cutoff),dates.cutoff);
  await p.evaluate(()=>{const day=new Date();day.setDate(day.getDate()+1);window.__retentionNow=day.valueOf();localStorage.setItem('__retention-test-clock',String(window.__retentionNow));window.__retentionCycle();water(250)});
  data=await state();assert.equal(data.days[dates.cutoff],undefined);assert.equal(Object.keys(data.days).length,365);assert.equal(await p.evaluate(()=>date),await p.evaluate(()=>keyDate()));assert.equal(data.timer.remaining,123.5);
  await p.getByRole('button',{name:'Settings',exact:true}).click();
  const downloaded=p.waitForEvent('download');await p.getByRole('button',{name:'Download retained history',exact:true}).click();const backup=await downloaded;
  const backupText=await fs.readFile(await backup.path(),'utf8');assert.equal(Object.keys(JSON.parse(backupText).days).length,365);
  const restore=await p.evaluate(()=>({schemaVersion:2,settings:{water:3000,motion:false,haptics:false,dark:true,visualVersion:3},days:{[window.__retentionKey(-400)]:{water:1000},[window.__retentionKey(-10)]:{water:900}}}));
  const oldRestoreDate=Object.keys(restore.days).sort()[0],recentRestoreDate=Object.keys(restore.days).sort()[1];
  await p.locator('#backupInput').setInputFiles({name:'history.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(restore))});
  await p.getByRole('heading',{name:'Restore this backup?',exact:true}).waitFor();assert.match(await p.locator('dialog').innerText(),/1 older day record will not be imported/);assert.equal((await state()).settings.water,2500,'Restore preview does not change saved data');
  await p.getByRole('button',{name:'Replace with backup',exact:true}).click();
  data=await state();assert.equal(data.days[oldRestoreDate],undefined);assert.equal(data.days[recentRestoreDate].water,900);assert.equal(data.settings.water,3000);
  // Another open tab running old code must not restore an expired day.
  const crossOld=await p.evaluate(()=>window.__retentionKey(-700));
  await p.evaluate(old=>{const incoming=JSON.parse(localStorage.getItem('devwell-v2'));incoming.days[old]={water:400};const text=JSON.stringify(incoming);localStorage.setItem('devwell-v2',text);window.dispatchEvent(new StorageEvent('storage',{key:'devwell-v2',newValue:text,storageArea:localStorage}))},crossOld);
  assert.equal((await state()).days[crossOld],undefined);
  const timerDate=await p.evaluate(()=>{db.timer={index:1,date:keyDate(),running:false,remaining:123.5,target:0};save();return db.timer.date});
  // Cleanup catches up after the app was closed for more than a year.
  await p.evaluate(()=>{const day=new Date();day.setDate(day.getDate()+400);window.__retentionNow=day.valueOf();localStorage.setItem('__retention-test-clock',String(window.__retentionNow))});
  await p.reload();data=await state();assert.equal(Object.keys(data.days).length,1);assert.equal(data.settings.water,3000);assert.equal(data.timer.date,timerDate);assert.equal(data.timer.remaining,123.5);
  await p.evaluate(()=>{db.timer.running=true;db.timer.target=Date.now()-1;tickTimer();tickTimer()});data=await state();assert.equal(data.days[timerDate],undefined,'Completing a stale timer cannot recreate expired history');assert.equal(data.timer,null);
  // The same rule works entirely offline on the next opening.
  await p.waitForFunction(()=>navigator.serviceWorker.controller!==null);const offlineOld=await p.evaluate(()=>{const old=window.__retentionKey(-500),raw=JSON.parse(localStorage.getItem('devwell-v2'));raw.days[old]={water:1};localStorage.setItem('devwell-v2',JSON.stringify(raw));return old});
  await context.setOffline(true);await p.reload();assert.equal((await state()).days[offlineOld],undefined);await context.setOffline(false);
  assert.equal(await p.evaluate(()=>localStorage.getItem('other-project-data')),'unchanged');assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: exact 365-day boundary, full-record cleanup on startup and daily cycle, repeated opens, legacy pruning, date bounds, export/restore preview, cross-tab enforcement, long closures, stale timers, offline cleanup and mobile retention status.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
