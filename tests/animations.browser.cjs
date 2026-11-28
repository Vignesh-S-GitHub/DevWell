/* Fixed composition, in-place instrument art, preference persistence and visibility. */
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
  const geometry=()=>p.locator('.sculpture-wrap,.pulse-sculpture,.orbit-node').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height,getComputedStyle(el).transform]}));
  assert.equal(await p.locator('#pulseCanvas').count(),0,'No travelling canvas decoration remains');
  await p.waitForFunction(()=>document.querySelector('.pulse-sculpture')?.complete);
  const fixed=await geometry();await p.mouse.move(15,250);await frames();await p.mouse.move(375,700);await p.waitForTimeout(450);
  assert.deepEqual(await geometry(),fixed,'Pointer movement cannot tilt or shift the hero or data controls');
  assert.equal(await p.locator('.pulse-sculpture').evaluate(el=>getComputedStyle(el).animationName),'none');
  for(const name of ['Routine','Food','Move','Insights']){
   await nav(name);
   assert.equal(await p.locator('.page-art svg[data-illustration="'+name.toLowerCase()+'"]').count(),1);
   assert.equal(await p.locator('.page-art svg').getAttribute('aria-hidden'),'true');
   const art=await p.locator('.page-art').boundingBox();
   await p.waitForFunction(()=>document.querySelector('.art-signal').getAnimations().some(a=>a.playState==='running'));
   const keys=await p.locator('.art-signal').evaluate(el=>el.getAnimations()[0].effect.getKeyframes());
   assert.ok(keys.every(k=>!('transform' in k)),'Instrument geometry stays fixed');
   assert.ok(keys.some(k=>k.opacity!==undefined),'Instrument accent animates light');
   assert.equal(await p.locator('.art-trace').first().evaluate(el=>getComputedStyle(el).animationName),'ink-draw');
   await p.mouse.move(100,300);await frames();assert.deepEqual(await p.locator('.page-art').boundingBox(),art);
   const travel=await p.locator('#main').evaluate(main=>main.getAnimations({subtree:true}).filter(a=>a.effect?.target?.matches('.page-heading,.surface,.routine-row,.meal-idea,.reset-card,.page-art')).flatMap(a=>a.effect.getKeyframes()).some(k=>k.transform&&/translate|rotate/.test(k.transform)));
   assert.equal(travel,false,'Pages and cards have no sliding or spinning animation');
  }
  await nav('Food');await p.getByRole('button',{name:'Add 250 ml',exact:true}).click();
  const fill=await p.locator('.track>span').evaluate(el=>({transform:el.style.transform,frames:el.getAnimations().flatMap(a=>a.effect.getKeyframes()).map(f=>f.transform)}));
  assert.equal(fill.transform,'scaleX(0.13)');assert.ok(fill.frames.includes('scaleX(0)'));assert.ok(fill.frames.includes('scaleX(0.13)'),'Actual hydration changes retain progress feedback');
  await nav('Routine');await p.getByRole('button',{name:'Complete Breakfast',exact:true}).click();
  assert.equal(await p.getByRole('button',{name:'Undo Breakfast',exact:true}).getAttribute('aria-pressed'),'true');
  await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));
  await p.waitForFunction(()=>document.querySelector('.page-art').classList.contains('animation-paused'));
  assert.equal(await p.locator('.art-signal').evaluate(el=>el.getAnimations()[0].playState),'paused','Offscreen art pauses');
  await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>!document.querySelector('.page-art').classList.contains('animation-paused'));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
  assert.equal(await p.locator('body.animations-suspended').count(),1);assert.equal(await p.locator('.art-signal').evaluate(el=>el.getAnimations()[0].playState),'paused','Hidden app pauses decorative loops');
  await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
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
     await p.screenshot({path:`test-results/calm-${dark?'dark':'light'}-${name.toLowerCase()}-${width}.png`,fullPage:true,animations:'disabled'});
    }
   }
  }
  await p.setViewportSize({width:390,height:844});await nav('Move');await p.locator('.reset-start').nth(3).click();await p.locator('dialog').getByRole('button',{name:'Start',exact:true}).click();
  await p.screenshot({path:'test-results/calm-breathing-390.png',animations:'disabled'});await close();
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: fixed hero under pointer input, four original in-place instruments, live progress, completion, offscreen/hidden pause, persisted animation preference, reduced motion, and both appearances across five responsive screens.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
