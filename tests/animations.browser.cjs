/* Lively artwork on all five screens; page/card positions stay steady on tab changes. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage']}: {})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:4173/');
  const nav=name=>p.getByRole('navigation').getByRole('button',{name,exact:true}).click();
  const close=()=>p.getByRole('button',{name:'Close dialog',exact:true}).click();
  const frames=()=>p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const geometry=()=>p.locator('.sculpture-wrap,.orbit-node,.launch-copy').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height,getComputedStyle(el).transform]}));
  assert.equal(await p.locator('#pulseCanvas').count(),0,'No travelling canvas decoration remains');
  await p.waitForFunction(()=>document.querySelector('.pulse-sculpture')?.complete);await p.evaluate(()=>document.fonts.ready);
  const fixed=await geometry();await p.mouse.move(15,250);await frames();await p.mouse.move(375,700);await p.waitForTimeout(450);
  assert.deepEqual(await geometry(),fixed,'Pointer movement cannot tilt or shift the hero or data controls');
  assert.equal(await p.locator('.pulse-sculpture').evaluate(el=>getComputedStyle(el).animationName),'ring-orbit');
  const sculpture=p.locator('.pulse-sculpture'),turnBefore=await sculpture.evaluate(el=>getComputedStyle(el).transform);
  await p.waitForTimeout(160);assert.notEqual(await sculpture.evaluate(el=>getComputedStyle(el).transform),turnBefore,'Home ring actually spins while its container stays fixed');
  for(const name of ['Routine','Food','Move','Insights']){
   await nav(name);
   assert.equal(await p.locator('.page-art svg[data-illustration="'+name.toLowerCase()+'"]').count(),1);
   assert.equal(await p.locator('.page-art svg').getAttribute('aria-hidden'),'true');
   const art=await p.locator('.page-art').boundingBox();
   await p.waitForFunction(()=>document.querySelector('.art-signal').getAnimations().some(a=>a.playState==='running'));
   assert.equal(await p.locator('.art-trace').first().evaluate(el=>el.getAnimations().some(a=>a.effect.getTiming().iterations===Infinity)),true,'Header illustrations keep animating after tab entry');
   const stable=()=>p.locator('.page-heading,.surface,.routine-row,.meal-idea,.reset-option').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));
   const positions=await stable();await p.waitForTimeout(160);assert.deepEqual(await stable(),positions,'Switching tabs never makes headings or cards wiggle');
   if(name==='Food'){
    assert.equal(await p.locator('.fluid-level').evaluate(el=>getComputedStyle(el,'::before').animationName),'water-surface');
    assert.equal(await p.locator('.water-bubbles>i').count(),3);
   }
   if(name==='Move')assert.equal(await p.locator('.reset-ring-accent').first().evaluate(el=>el.getAnimations().some(a=>a.animationName==='ring-orbit'&&a.playState==='running')),true,'Reset ring markers orbit');
   if(name==='Insights')assert.equal(await p.locator('.art-bar').first().evaluate(el=>el.getAnimations().some(a=>a.animationName==='insight-bars'&&a.playState==='running')),true,'Decorative Insights bars keep animating');
   await p.mouse.move(100,300);await frames();assert.deepEqual(await p.locator('.page-art').boundingBox(),art);
   const travel=await p.locator('#main').evaluate(main=>main.getAnimations({subtree:true}).filter(a=>a.effect?.target?.matches('.page-heading,.surface,.routine-row,.meal-idea,.reset-option,.page-art,main,nav')).flatMap(a=>a.effect.getKeyframes()).some(k=>k.transform&&/translate|rotate/.test(k.transform)));
   assert.equal(travel,false,'Pages and cards have no sliding or spinning animation');
  }
  await nav('Food');await p.getByRole('button',{name:'Add 250 ml',exact:true}).click();
  const fill=await p.locator('.track>span').evaluate(el=>({transform:el.style.transform,frames:el.getAnimations().flatMap(a=>a.effect.getKeyframes()).map(f=>f.transform)}));
  assert.equal(fill.transform,'scaleX(0.13)');assert.ok(fill.frames.includes('scaleX(0)'));assert.ok(fill.frames.includes('scaleX(0.13)'),'Actual hydration changes retain progress feedback');
  const bubble=await p.locator('.water-bubbles>i').first().evaluate(el=>getComputedStyle(el).bottom);
  await p.waitForTimeout(180);assert.notEqual(await p.locator('.water-bubbles>i').first().evaluate(el=>getComputedStyle(el).bottom),bubble,'Hydration bubbles actually rise through the recorded fill');
  await nav('Routine');await p.getByRole('button',{name:'Complete Breakfast',exact:true}).click();
  assert.equal(await p.getByRole('button',{name:'Undo Breakfast',exact:true}).getAttribute('aria-pressed'),'true');
  await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));
  await p.waitForFunction(()=>document.querySelector('.page-art').classList.contains('animation-paused'));
  assert.equal(await p.locator('.art-signal').evaluate(el=>el.getAnimations()[0].playState),'paused','Offscreen art pauses');
  await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>!document.querySelector('.page-art').classList.contains('animation-paused'));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
  assert.equal(await p.locator('body.animations-suspended').count(),1);assert.equal(await p.locator('.art-signal').evaluate(el=>el.getAnimations()[0].playState),'paused','Hidden app pauses decorative loops');
  await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
  // A log/render resumes decorative loops at their shared phase instead of snapping to zero.
  await nav('Today');
  const phaseBefore=await sculpture.evaluate(el=>el.getAnimations().find(a=>a.animationName==='ring-orbit').currentTime);
  await p.getByRole('button',{name:'Quick add 250 ml',exact:true}).click();
  const phaseAfter=await sculpture.evaluate(el=>el.getAnimations().find(a=>a.animationName==='ring-orbit').currentTime);
  assert.ok(phaseAfter>=phaseBefore-50&&phaseAfter-phaseBefore<2000,'Logging preserves artwork phase');
  await p.getByRole('button',{name:'Settings',exact:true}).click();await p.getByRole('switch',{name:'Gentle animations',exact:true}).click();await close();
  assert.equal(await p.locator('body.quiet-motion').count(),1);await p.reload();assert.equal(await p.locator('body.quiet-motion').count(),1,'Existing preference persists');
  await nav('Routine');assert.equal(await p.locator('#main').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
  await p.getByRole('button',{name:'Settings',exact:true}).click();await p.getByRole('switch',{name:'Gentle animations',exact:true}).click();await close();
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.body.classList.contains('quiet-motion'));
  assert.equal(await p.locator('#main').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'Device reduced-motion overrides enabled preference');
  // One screenshot batch: both appearances, all routes, phone and desktop.
  await fs.mkdir('test-results',{recursive:true});await p.emulateMedia({reducedMotion:'no-preference'});
  for(const dark of [true,false]){
   await p.evaluate(dark=>{db.settings.dark=dark;save();render()},dark);
   for(const width of [390,1440]){
    await p.setViewportSize({width,height:900});
    for(const name of ['Today','Routine','Food','Move','Insights']){
     await nav(name);await p.evaluate(()=>scrollTo(0,0));
     assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} fits ${width}`);
     if(name!=='Today'){
      const bounds=await p.locator('.page-art').boundingBox(),date=await p.getByRole('button',{name:'Review date',exact:true}).boundingBox();
      assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,'Art fits without covering controls');
      assert.ok(bounds.y+bounds.height<=date.y||bounds.x+bounds.width<=date.x,'Header art and date control do not overlap');
     }
     await p.screenshot({path:`test-results/alive-${dark?'dark':'light'}-${name.toLowerCase()}-${width}.png`,fullPage:true,animations:'disabled'});
    }
   }
  }
  await p.setViewportSize({width:390,height:844});await nav('Move');await p.locator('.reset-start').nth(3).click();await p.locator('dialog').getByRole('button',{name:'Start',exact:true}).click();
  await p.screenshot({path:'test-results/alive-breathing-390.png',animations:'disabled'});await close();
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: steady tab transitions with no card wiggle, spinning home ring, looping Routine artwork, flowing/bubbling water, orbiting Move rings, animated Insights instruments, phase continuity after logging, live progress, visibility pause, persisted preference, reduced motion and five responsive screens in both appearances.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
