const {test}=require('node:test'),assert=require('node:assert/strict');
const {frame,createBreathGuide}=require('../timer.js');
const timer=(extra={})=>({index:3,date:'2026-11-28',running:true,remaining:120,target:120000,...extra});
test('one clock aligns inhale, exhale and ring geometry at exact boundaries',()=>{
 assert.equal(frame(timer(),120,0).phase,'in');
 const peak=frame(timer(),120,4000);assert.equal(peak.phase,'out');assert.equal(peak.breathScale,1.35);
 const cycle=frame(timer(),120,10000);assert.equal(cycle.phase,'in');assert.equal(cycle.breathScale,.85);assert.equal(cycle.cycle,1);
 const half=frame(timer(),120,60000);assert.equal(half.progress,.5);assert.equal(half.remaining,60);
});
test('paused timers freeze fractional progress and resume without changing phase',()=>{
 const paused=timer({running:false,remaining:114.75});
 const a=frame(paused,120,5250),b=frame(paused,120,700000);
 assert.deepEqual(a,b);assert.equal(a.elapsed,5.25);assert.equal(a.phase,'out');
 const resumed=timer({target:700000+114750});
 assert.deepEqual(frame(resumed,120,700000),a);
});
test('all activity rings clamp to real elapsed progress and stop at completion',()=>{
 for(const duration of [20,180,300,120]){
  assert.equal(frame(timer({target:duration*1000}),duration,-10000).progress,0);
  const end=frame(timer({target:duration*1000}),duration,duration*1000+100);
  assert.equal(end.progress,1);assert.equal(end.complete,true);assert.equal(end.remaining,0);
 }
});
function guideFixture(){
 let visible=true,enabled=true;const calls=[];
 const guide=createBreathGuide({play:kind=>calls.push(kind),isVisible:()=>visible,isEnabled:()=>enabled});
 return {guide,calls,visible(value){visible=value},enabled(value){enabled=value}};
}
test('breathing announces each phase once despite repeated ticks and panel reopening',()=>{
 const f=guideFixture(),t=timer();
 for(const stamp of [0,250,1000,3999,4000,4000,4250,9999,10000,10000])f.guide.update(t,120,stamp);
 assert.deepEqual(f.calls,['breathIn','breathOut','breathIn']);
});
test('pause, resume and reset do not create repeated or completed-cycle cues',()=>{
 const f=guideFixture(),t=timer();f.guide.update(t,120,0);f.guide.update(t,120,5250); // stale exhale is skipped
 const paused=timer({running:false,remaining:114.75});f.guide.update(paused,120,5250);
 const resumed=timer({target:714750});f.guide.update(resumed,120,600000);f.guide.update(resumed,120,600250);
 assert.equal(f.calls.at(-1),'breathOut');const count=f.calls.length;
 f.guide.update(resumed,120,714750);f.guide.update(null,1,714750);assert.equal(f.calls.length,count);
});
test('hidden pages and re-enabling haptics synchronize silently without missed-cue bursts',()=>{
 const f=guideFixture(),t=timer();f.guide.update(t,120,0);
 f.visible(false);f.guide.update(t,120,3000);f.guide.update(t,120,10000);
 f.visible(true);f.guide.update(t,120,11000);assert.deepEqual(f.calls,['breathIn']);
 f.guide.update(t,120,14000);assert.deepEqual(f.calls,['breathIn','breathOut']);
 f.enabled(false);f.guide.update(t,120,20000);f.enabled(true);f.guide.update(t,120,21000);
 assert.equal(f.calls.length,2);f.guide.update(t,120,24000);assert.equal(f.calls.at(-1),'breathOut');assert.equal(f.calls.length,3);
});
test('non-breathing timers never emit phase cues and late callbacks skip outdated phases',()=>{
 const f=guideFixture();f.guide.update(timer({index:1}),180,0);assert.equal(f.calls.length,0);
 const t=timer();f.guide.update(t,120,0);f.guide.update(t,120,7000);assert.deepEqual(f.calls,['breathIn']);
 f.guide.update(t,120,10000);assert.deepEqual(f.calls,['breathIn','breathIn']);
});
