const {test}=require('node:test'),assert=require('node:assert/strict');
const {steps,DURATION,frame,createGuide,illustration}=require('../stretches.js');
const timer=extra=>({index:1,date:'2026-11-28',running:true,target:180000,remaining:180,...extra});
test('the six guided steps total the existing three minutes and switch at exact boundaries',()=>{
 assert.equal(steps.length,6);assert.equal(DURATION,180);
 const times=[0,15000,45000,75000,120000,150000];
 times.forEach((stamp,index)=>{assert.equal(frame(timer(),stamp).index,index);assert.equal(frame(timer(),stamp).stepRemaining,steps[index].duration)});
 assert.equal(frame(timer(),180000).complete,true);assert.equal(frame(timer(),180100).remaining,0);
});
test('guidance holds and relaxes on the same timeline as the countdown',()=>{
 assert.equal(frame(timer(),15000).phase,'Move gently');assert.equal(frame(timer(),18000).phase,'Hold comfortably');
 assert.equal(frame(timer(),23000).phase,'Return and relax');assert.equal(frame(timer(),25000).phase,'Move gently');
 assert.equal(frame(timer(),78000).phase,'Hold comfortably');assert.equal(frame(timer(),85000).phase,'Return and relax');
 assert.equal(frame(timer(),180000).phase,'Sequence complete');
});
test('pause, resume and reload preserve the illustrated step and fractional pose',()=>{
 const paused=timer({running:false,remaining:123.5});
 const a=frame(paused,0);assert.deepEqual(frame(paused,999999),a);
 const resumed=timer({target:999999+123500});assert.deepEqual(frame(resumed,999999),a);
 assert.equal(a.index,2);
});
test('step taps are deduplicated and do not replay after hidden or disabled periods',()=>{
 let visible=true,enabled=true;const calls=[],guide=createGuide({play:v=>calls.push(v),isVisible:()=>visible,isEnabled:()=>enabled}),t=timer();
 guide.update(t,0);guide.update(t,15000);guide.update(t,15250);guide.update(t,15000);assert.deepEqual(calls,['tap']);
 visible=false;guide.update(t,45000);visible=true;guide.update(t,45500);assert.equal(calls.length,1);
 guide.update(t,75000);assert.equal(calls.length,2);
 enabled=false;guide.update(t,120000);enabled=true;guide.update(t,120500);assert.equal(calls.length,2);
 guide.update(t,150000);guide.update(t,180000);assert.equal(calls.length,3);
});
test('pausing or changing activities cannot emit a cue and late callbacks skip old steps',()=>{
 const calls=[],guide=createGuide({play:v=>calls.push(v),isVisible:()=>true,isEnabled:()=>true});
 guide.update(timer(),0);guide.update(timer(),46000);assert.equal(calls.length,1);
 guide.update(timer({running:false,remaining:134}),46000);
 guide.update(timer({target:280000,remaining:134}),146000);assert.equal(calls.length,1);
 guide.update(timer({index:2}),150000);assert.equal(calls.length,1);
 const late=createGuide({play:v=>calls.push(v),isVisible:()=>true,isEnabled:()=>true});late.update(timer(),0);late.update(timer(),90000);assert.equal(calls.length,1);
});
test('original illustrations are finite geometry and reduced motion changes only on phase boundaries',()=>{
 for(const stamp of [0,16000,18000,23000,46000,78000,122000,151000,180000]){
  const svg=illustration(frame(timer(),stamp));assert.match(svg,/class="stretch-illustration"/);assert.doesNotMatch(svg,/NaN|undefined|Infinity|<script/);
 }
 assert.equal(illustration(frame(timer(),18100),true),illustration(frame(timer(),19900),true));
});
