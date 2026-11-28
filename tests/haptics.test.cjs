const {test}=require('node:test');
const assert=require('node:assert/strict');
const {create}=require('../haptics.js');
function fixture({enabled=true,visible=true,activated=true,supported=true,result=true}={}){
 let clock=1000,on=enabled;const calls=[];
 const page=new EventTarget();page.visibilityState=visible?'visible':'hidden';
 const navigator={userActivation:{hasBeenActive:activated}};
 if(supported)navigator.vibrate=pattern=>{calls.push(pattern);return result};
 const haptics=create({navigator,document:page,isEnabled:()=>on,now:()=>clock});
 return {haptics,navigator,page,calls,advance(ms){clock+=ms},enable(value){on=value}};
}
test('haptics remain silent without support, consent, visibility, activation or a known action',()=>{
 for(const options of [{enabled:false},{visible:false},{activated:false},{supported:false}]){
  const f=fixture(options);assert.equal(f.haptics.play('log'),false);assert.deepEqual(f.calls,[]);f.haptics.dispose();
 }
 const f=fixture();assert.equal(f.haptics.play('unknown'),false);assert.deepEqual(f.calls,[]);f.haptics.dispose();
});
test('logging uses one short bounded pulse; completion has a distinct bounded pattern',()=>{
 const f=fixture();assert.equal(f.haptics.play('log'),true);const log=f.calls.at(-1);
 assert.equal(typeof log,'number');assert.ok(log>0&&log<=30);
 assert.equal(f.haptics.play('complete'),true);const complete=f.calls.at(-1);
 assert.ok(Array.isArray(complete));assert.ok(complete.reduce((a,b)=>a+b,0)<300);assert.notDeepEqual(log,complete);f.haptics.dispose();
});
test('rapid taps are throttled but completion can replace a small tap',()=>{
 const f=fixture();f.haptics.play('tap');assert.equal(f.haptics.play('log'),false);assert.equal(f.calls.length,1);
 f.advance(120);assert.equal(f.haptics.play('log'),true);assert.equal(f.haptics.play('complete'),true);assert.equal(f.calls.length,3);f.haptics.dispose();
});
test('hiding the page cancels an active pulse and never starts another',()=>{
 const f=fixture();f.haptics.play('complete');f.page.visibilityState='hidden';f.page.dispatchEvent(new Event('visibilitychange'));
 assert.equal(f.calls.at(-1),0);const count=f.calls.length;assert.equal(f.haptics.play('complete'),false);assert.equal(f.calls.length,count);f.haptics.dispose();
});
test('turning vibration off cancels pending feedback and prevents future pulses',()=>{
 const f=fixture();f.haptics.play('complete');f.enable(false);f.haptics.cancel();assert.equal(f.calls.at(-1),0);assert.equal(f.haptics.play('complete'),false);f.haptics.dispose();
});
test('expired vibrations need no cancellation call',()=>{
 const f=fixture();f.haptics.play('log');f.advance(1000);f.haptics.cancel();assert.equal(f.calls.length,1);f.haptics.dispose();
});
test('browser denial or an exception cannot interrupt activity actions',()=>{
 const denied=fixture({result:false});assert.equal(denied.haptics.play('log'),false);denied.haptics.dispose();
 const f=fixture();f.navigator.vibrate=()=>{throw new Error('policy denied')};assert.doesNotThrow(()=>f.haptics.play('complete'));assert.equal(f.haptics.play('complete'),false);f.haptics.dispose();
});
test('disposing a controller removes its visibility listener',()=>{
 const f=fixture();f.haptics.play('complete');f.haptics.dispose();const count=f.calls.length;
 f.page.visibilityState='hidden';f.page.dispatchEvent(new Event('visibilitychange'));assert.equal(f.calls.length,count);
});

test('diagnostics distinguish every gating and browser outcome',()=>{
 const cases=[
  [{supported:false},'unsupported'],[{enabled:false},'disabled'],[{visible:false},'hidden'],[{activated:false},'activation-required'],[{result:false},'declined'],[{},'accepted']
 ];
 for(const [options,reason]of cases){const f=fixture(options);f.haptics.play('test');assert.equal(f.haptics.lastResult().reason,reason);assert.equal(f.haptics.lastResult().accepted,reason==='accepted');f.haptics.dispose()}
 const f=fixture();f.haptics.play('log');f.haptics.play('tap');assert.equal(f.haptics.lastResult().reason,'throttled');f.haptics.play('nope');assert.equal(f.haptics.lastResult().reason,'invalid-action');f.navigator.vibrate=()=>{throw new Error('denied')};f.haptics.play('test');assert.equal(f.haptics.lastResult().reason,'exception');f.haptics.dispose();
});
test('explicit device test remains noticeable and can run immediately after enabling',()=>{
 const f=fixture();f.haptics.play('tap');assert.equal(f.haptics.play('test'),true);const pulse=f.calls.at(-1);assert.ok(Array.isArray(pulse));assert.equal(pulse.length,3);assert.ok(pulse[0]>=100&&pulse[2]>=100);assert.ok(pulse.reduce((a,b)=>a+b,0)<=500);f.haptics.dispose();
});

test('inhale and exhale cues are distinct and can announce a boundary after another tap',()=>{
 const f=fixture();f.haptics.play('tap');assert.equal(f.haptics.play('breathIn'),true);
 const inhale=f.calls.at(-1);assert.ok(Array.isArray(inhale));assert.equal(inhale.length,3);
 assert.equal(f.haptics.play('breathOut'),true);assert.equal(typeof f.calls.at(-1),'number');f.haptics.dispose();
});
