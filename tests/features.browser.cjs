/* Production flows for goal feedback, safe Undo and guided seated stretches. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']}: {})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  await context.addInitScript(()=>{
   window.__now=Number(sessionStorage.getItem('__feature-clock'))||Date.now();Date.now=()=>window.__now;window.__vibes=[];
   Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.__vibes.push(pattern);return true}});
  });
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const base=process.env.BASE_URL||'http://127.0.0.1:4173/';
  await p.goto(base);await p.evaluate(()=>document.fonts.ready);await fs.mkdir('test-results',{recursive:true});
  const nav=name=>p.getByRole('navigation').getByRole('button',{name,exact:true}).click();
  const button=name=>p.getByRole('button',{name,exact:true});
  const undo=()=>p.locator('.undo-notice').getByRole('button',{name:'Undo',exact:true}).click();
  const close=()=>button('Close dialog').click();
  const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('devwell-v2')));
  const today=await p.evaluate(()=>keyDate());
  const advance=ms=>p.evaluate(ms=>{window.__now+=ms;sessionStorage.setItem('__feature-clock',String(window.__now));tickTimer()},ms);
  const vibeCount=()=>p.evaluate(()=>window.__vibes.filter(v=>v!==0).length);
  await p.evaluate(()=>{db.settings.water=500;db.settings.move=5;save();render()});
  await nav('Food');await button('Add 250 ml').click();assert.equal(await p.locator('.goal-celebration').count(),0);
  await button('Add 250 ml').click();assert.equal(await p.locator('[data-goal="water"]').count(),1);
  assert.match(await p.locator('.goal-celebration').innerText(),/Hydration goal reached/);
  await p.screenshot({path:'test-results/goal-water-390.png',animations:'disabled'});await undo();
  assert.equal((await state()).days[today].water,250);assert.deepEqual((await state()).days[today].celebrated,['water']);
  await button('Add 250 ml').click();assert.equal(await p.locator('.goal-celebration').count(),0,'Undo and re-log do not repeat a goal celebration');
  await p.reload();assert.equal(await p.locator('.goal-celebration,.undo-notice').count(),0);assert.equal((await state()).days[today].water,500);
  await nav('Move');await button('+ 5 min').click();assert.equal(await p.locator('[data-goal="move"]').count(),1);
  await undo();assert.equal((await state()).days[today].minutes,0);assert.equal((await state()).days[today].water,500);
  await nav('Routine');await p.evaluate(()=>{S().done=Array.from({length:12},(_,i)=>i);save();render()});
  await button('Complete After-work walk').click();assert.equal(await p.locator('[data-goal="routine"]').count(),1);await undo();
  assert.equal((await state()).days[today].done.length,12);
  await button('Complete After-work walk').click();assert.equal(await p.locator('.goal-celebration').count(),0);
  await nav('Food');await button('+ Log meal').click();await p.getByLabel('What did you eat?').fill('<img src=x onerror=alert(1)> Rice & dal');await button('Save meal').click();
  assert.equal(await p.locator('img[src=x]').count(),0);await undo();assert.equal((await state()).days[today].meals.length,0);
  await button('+ Log meal').click();await p.getByLabel('What did you eat?').fill('Rice & dal');await button('Save meal').click();await button('Remove Breakfast meal').click();await undo();
  assert.equal((await state()).days[today].meals[0].name,'Rice & dal','Meal removal can be undone too');
  await nav('Insights');await button('Log sleep').click();await p.getByLabel('Hours slept last night').fill('7.5');await button('Save sleep').click();await undo();assert.equal((await state()).days[today].sleep,0);
  await button('Good').click();await undo();assert.equal((await state()).days[today].mood,'');
  // Read the latest saved fields even if another tab's storage event has not arrived.
  await p.evaluate(()=>water(250));
  await p.evaluate(()=>{const raw=JSON.parse(localStorage.getItem('devwell-v2'));raw.days[keyDate()].sleep=9;localStorage.setItem('devwell-v2',JSON.stringify(raw))});
  await undo();assert.equal((await state()).days[today].sleep,9);assert.equal((await state()).days[today].water,500);
  await p.evaluate(()=>water(250));
  await p.evaluate(()=>{const raw=JSON.parse(localStorage.getItem('devwell-v2'));raw.days[keyDate()].water=999;localStorage.setItem('devwell-v2',JSON.stringify(raw))});
  await undo();assert.equal((await state()).days[today].water,999);assert.match(await p.locator('#toast').innerText(),/latest data was kept/);
  await p.evaluate(()=>water(250));await p.evaluate(()=>window.dispatchEvent(new StorageEvent('storage',{key:'devwell-v2',newValue:localStorage.getItem('devwell-v2')})));
  assert.equal(await p.locator('.undo-notice').count(),0,'Cross-tab updates invalidate pending Undo');
  const prior=await p.evaluate(()=>{const d=new Date();d.setDate(d.getDate()-1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')});
  await p.evaluate(day=>{selectDay(day);water(250);selectDay(keyDate())},prior);await undo();assert.equal((await state()).days[prior].water,0,'Undo uses the captured date');
  // Feedback remains accessible in the native dialog top layer.
  await nav('Today');await button('Open hydration details').click();await button('+ 250 ml').click();
  assert.equal(await p.locator('dialog .undo-notice').count(),1);await undo();assert.equal(await p.locator('dialog .dialog-readout').isVisible(),true);await close();
  // Six steps use exactly the existing countdown; pause/reload/close do not restart the guide.
  await p.evaluate(()=>{clearLogFeedback();db.timer=null;db.settings.move=3;S().minutes=0;S().celebrated=S().celebrated.filter(v=>v!=='move');save();render()});
  await nav('Move');await p.locator('.reset-start').nth(1).click();assert.equal(await p.locator('[data-stretch-step]').count(),6);assert.equal(await p.locator('#stretchTitle').innerText(),'Settle in');
  await p.locator('dialog').getByRole('button',{name:'Start',exact:true}).click();await advance(15000);assert.equal(await p.locator('#stretchTitle').innerText(),'Turn your head left');
  const cues=await vibeCount();await p.evaluate(()=>{tickTimer();updateTimerVisual()});assert.equal(await vibeCount(),cues);
  await advance(3250);assert.equal(await p.locator('#stretchPhaseText').innerText(),'Hold comfortably');await button('Pause').click();
  const pose=await p.locator('#stretchVisual').innerHTML(),count=await p.locator('#count').innerText();await advance(5000);
  assert.equal(await p.locator('#stretchVisual').innerHTML(),pose);assert.equal(await p.locator('#count').innerText(),count);
  await p.locator('dialog').getByRole('button',{name:'Start',exact:true}).click();await close();await p.reload();await p.locator('.timer-banner').click();
  assert.equal(await p.locator('#stretchTitle').innerText(),'Turn your head left');assert.equal(await p.locator('#count').innerText(),count);
  await advance(26750);assert.equal(await p.locator('#stretchTitle').innerText(),'Turn your head right');
  await advance(30000);assert.equal(await p.locator('#stretchTitle').innerText(),'Open your chest');
  for(const dark of [true,false]){
   await p.evaluate(dark=>{db.settings.dark=dark;save();render()},dark);
   for(const width of [320,390,1440]){
    await p.setViewportSize({width,height:844});assert.equal(await p.locator('dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Stretch guide fits dialog');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await p.screenshot({path:'test-results/stretch-'+(dark?'dark':'light')+'-'+width+'.png',animations:'disabled'});
   }
  }
  await p.setViewportSize({width:390,height:844});await close();await advance(45000);const outsideCues=await vibeCount();await p.locator('.timer-banner').click();
  assert.equal(await p.locator('#stretchTitle').innerText(),'Turn your upper body left');assert.equal(await vibeCount(),outsideCues,'Reopening does not repeat step cues');
  await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))});
  await advance(30000);assert.equal(await vibeCount(),outsideCues);
  await p.evaluate(()=>{delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))});assert.equal(await vibeCount(),outsideCues);
  assert.equal(await p.locator('#stretchTitle').innerText(),'Turn your upper body right');
  await advance(30000);assert.equal((await state()).days[today].minutes,3);assert.equal((await state()).timer,null);assert.equal(await p.locator('#count').innerText(),'00:00');
  assert.equal(await p.locator('.timer-progress-accessible').getAttribute('aria-valuenow'),'100');assert.equal(await p.locator('dialog [data-goal="move"]').count(),1);
  await p.screenshot({path:'test-results/stretch-complete-390.png',animations:'disabled'});await undo();assert.equal((await state()).days[today].minutes,0);assert.equal((await state()).timer,null);
  await p.evaluate(()=>{tickTimer();tickTimer()});assert.equal((await state()).days[today].minutes,0);await close();
  await p.locator('.reset-start').nth(1).click();await p.locator('dialog').getByRole('button',{name:'Start',exact:true}).click();await advance(60000);await button('Stop stretch').click();
  assert.equal((await state()).timer,null);assert.equal((await state()).days[today].minutes,0,'Stopping a partial sequence never credits three minutes');
  // Reduced visual animation keeps text, progress and tactile settings available.
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.reset-start').nth(1).click();await p.locator('dialog').getByRole('button',{name:'Start',exact:true}).click();await advance(18000);
  const quietPose=await p.locator('#stretchVisual').innerHTML();await advance(1000);assert.equal(await p.locator('#stretchVisual').innerHTML(),quietPose);
  await button('Stop stretch').click();await p.evaluate(()=>{S().water=250;S().celebrated=[];save();water(250)});
  assert.equal(await p.locator('.goal-celebration.is-quiet').count(),1);assert.equal(await p.locator('.goal-celebration').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
  await undo();assert.equal((await state()).days[today].water,250);
  // A virtual clock checks expiration while focus protects the action from timing out.
  const ec=await browser.newContext({reducedMotion:'reduce'}),ep=await ec.newPage();await ep.clock.install();await ep.goto(base);await ep.evaluate(()=>water(250));await ep.mouse.move(0,0);
  await ep.locator('.undo-notice button').first().focus();await ep.clock.fastForward(11000);assert.equal(await ep.locator('.undo-notice').count(),1,'Focused Undo does not expire');
  await ep.locator('#main').focus();await ep.clock.fastForward(11000);assert.equal(await ep.locator('.undo-notice').count(),0,'Undo expires after the available window');
  await ec.close();assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: all three goal celebrations with persistent once-daily receipts, reduced animation, field-safe Undo for every log/removal, captured dates, stale/cross-tab protection, modal access, focused/expired Undo, six timed illustrated stretches, pause/resume/reload, foreground step cues, hidden suppression, once-only credit, Stop without credit, and dark/light responsive guide layouts.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
