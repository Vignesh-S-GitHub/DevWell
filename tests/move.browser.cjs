/* Phase and ring integration, with a deterministic timer clock and mocked motor. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']}: {})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  await context.addInitScript(()=>{window.__now=Date.now();Date.now=()=>window.__now;window.__vibes=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.__vibes.push(pattern);return true}})});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:4173/');
  await p.getByRole('navigation').getByRole('button',{name:'Move',exact:true}).click();
  await fs.mkdir('test-results',{recursive:true});
  assert.equal(await p.locator('.reset-ring-preview').count(),4);
  const advance=ms=>p.evaluate(ms=>{window.__now+=ms;tickTimer()},ms);
  const vibes=()=>p.evaluate(()=>window.__vibes.filter(v=>v!==0));
  const start=()=>p.locator('dialog').getByRole('button',{name:'Start',exact:true}).click();
  const close=()=>p.getByRole('button',{name:'Close dialog'}).click();
  for(let index=0;index<3;index++){
   await p.locator('.reset-start').nth(index).click();await start();
   const before=await p.locator('.activity-ring-field').evaluate(el=>el.style.transform);
   await advance(1250);
   assert.ok(Number(await p.locator('#timerCircle').evaluate(el=>el.style.strokeDashoffset))<553,'Every activity has live elapsed progress');
   assert.notEqual(await p.locator('.activity-ring-field').evaluate(el=>el.style.transform),before,'Every activity has a clock-driven inner-ring animation');
   assert.equal(await p.locator('[data-reset-ring="'+index+'"]').getAttribute('class').then(c=>c.includes('is-active-reset')),true);
   assert.ok(Number(await p.locator('[data-reset-ring="'+index+'"] .reset-ring-fill').evaluate(el=>el.style.strokeDashoffset))<283);
   await p.getByRole('button',{name:'Pause',exact:true}).click();
   const paused=await p.locator('#timerCircle').evaluate(el=>el.style.strokeDashoffset);
   await advance(5000);assert.equal(await p.locator('#timerCircle').evaluate(el=>el.style.strokeDashoffset),paused,'Pause freezes ring progress');
   await start();assert.equal(await p.locator('#timerCircle').evaluate(el=>el.style.strokeDashoffset),paused,'Resume preserves fractional elapsed time');
   await p.screenshot({path:'test-results/reset-timer-'+index+'-390.png',animations:'disabled'});
   await close();await p.evaluate(()=>discardTimer());
  }
  await p.locator('.reset-start').nth(3).click();await p.evaluate(()=>window.__vibes=[]);await start();
  assert.match(await p.locator('#timerCue').innerText(),/Breathe in/);assert.deepEqual(await vibes(),[[35,50,35]]);
  await advance(4000);assert.match(await p.locator('#timerCue').innerText(),/Breathe out/);assert.deepEqual(await vibes(),[[35,50,35],75]);
  await p.evaluate(()=>{tickTimer();tickTimer();updateTimerVisual()});assert.equal((await vibes()).length,2,'No buzzing on repeated ticks');
  await advance(1250);await p.getByRole('button',{name:'Pause',exact:true}).click();
  const frozen=await p.locator('.activity-ring-field').evaluate(el=>el.style.transform);
  await advance(6000);assert.equal(await p.locator('.activity-ring-field').evaluate(el=>el.style.transform),frozen);
  await start();assert.match(await p.locator('#timerCue').innerText(),/Breathe out/);assert.equal((await vibes()).length,3);
  await advance(4750);assert.match(await p.locator('#timerCue').innerText(),/Breathe in/);assert.equal((await vibes()).length,4);
  await advance(2000);await p.screenshot({path:'test-results/breathe-in-ring-390.png',animations:'disabled'});
  await close();await p.getByRole('navigation').getByRole('button',{name:'Today',exact:true}).click();
  await advance(2000);assert.equal((await vibes()).length,5,'Visible running break continues cues outside its panel');
  await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))});
  await advance(6000);assert.equal((await vibes()).length,5,'No phase vibration while hidden');
  await p.evaluate(()=>{delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))});
  assert.equal((await vibes()).length,5,'No missed-cue replay on return');
  await advance(4000);assert.equal((await vibes()).length,6);
  await p.evaluate(()=>{db.settings.haptics=false;updateTimerVisual()});await advance(6000);assert.equal((await vibes()).length,6);
  await p.evaluate(()=>{db.settings.haptics=true;updateTimerVisual()});assert.equal((await vibes()).length,6);
  await advance(4000);assert.equal((await vibes()).length,7);
  await p.getByRole('navigation').getByRole('button',{name:'Move',exact:true}).click();await p.locator('.reset-start').nth(3).click();
  await p.screenshot({path:'test-results/breathe-out-ring-390.png',animations:'disabled'});
  await p.evaluate(()=>{db.settings.motion=false;render();openTimer(3)});
  assert.equal(await p.locator('.activity-ring-field').evaluate(el=>el.style.transform),'scale(1)');
  await advance(6000);assert.equal((await vibes()).length,8,'Reduced visual motion keeps independently enabled tactile cues');
  await advance(80000);assert.equal((await vibes()).length,9,'Completion signals once without an extra inhale');
  assert.match(await p.locator('#timerCue').innerText(),/Reset complete/);assert.equal(await p.locator('.timer-progress-accessible').getAttribute('aria-valuenow'),'100');
  await p.evaluate(()=>{tickTimer();tickTimer()});assert.equal((await vibes()).length,9);
  assert.equal(await p.evaluate(()=>S().minutes),0,'Breathing does not create movement minutes');
  await close();await p.evaluate(()=>{db.settings.motion=true;render()});
  for(const width of [320,390,768,1440]){
   await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Move rings fit viewport');
  }
  await p.setViewportSize({width:390,height:844});await p.locator('.reset-start').nth(0).click();await close();assert.equal(await p.locator('.skip-link').isVisible().then(async visible=>visible&&await p.locator('.skip-link').evaluate(el=>el.getBoundingClientRect().top>=0)),false,'Closing reset returns focus without a stray skip-link overlay');await p.evaluate(()=>discardTimer());await p.screenshot({path:'test-results/move-shared-rings-390.png',fullPage:true,animations:'disabled'});
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: all four activity rings, fractional pause/resume, exact inhale/exhale cues without duplicates, closed-panel continuity, hidden/off suppression without replay, reduced motion, once-only completion and responsive Move layouts.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
