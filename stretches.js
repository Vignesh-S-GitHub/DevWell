/* Original seated stretch guide. Timeline is derived from the existing timer clock. */
(function(root){
 'use strict';
 const steps=Object.freeze([
  {id:'settle',title:'Settle in',duration:15,pose:'rest',text:'Use a stable chair without wheels. Sit upright with feet grounded and shoulders relaxed.'},
  {id:'neck-left',title:'Turn your head left',duration:30,pose:'neck',side:-1,text:'Slowly look left within a comfortable range. Keep shoulders down, then return to face forward.'},
  {id:'neck-right',title:'Turn your head right',duration:30,pose:'neck',side:1,text:'Turn gently right with your chin level. Return to the middle between holds.'},
  {id:'chest',title:'Open your chest',duration:45,pose:'chest',text:'Open your arms near hip height. Ease shoulders back and down, then return to rest.'},
  {id:'twist-left',title:'Turn your upper body left',duration:30,pose:'twist',side:-1,text:'Cross your arms towards your shoulders. Keep hips still while you turn comfortably left, then return.'},
  {id:'twist-right',title:'Turn your upper body right',duration:30,pose:'twist',side:1,text:'With feet grounded and hips still, turn gently right. Return to the centre between holds.'}
 ].map(Object.freeze));
 const DURATION=steps.reduce((total,step)=>total+step.duration,0),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function frame(timer,stamp=Date.now()){
  const remaining=timer?clamp(timer.running?(timer.target-stamp)/1000:timer.remaining,0,DURATION):DURATION;
  const elapsed=DURATION-remaining,complete=remaining===0;
  let start=0,index=steps.length-1;
  for(let i=0;i<steps.length;i++){if(elapsed<start+steps[i].duration){index=i;break}if(i<steps.length-1)start+=steps[i].duration}
  const step=steps[index],within=clamp(elapsed-start,0,step.duration),cycle=step.pose==='chest'?15:10,position=within%cycle;
  let phase='Prepare',cueRemaining=step.duration-within,pose=0;
  if(step.pose!=='rest'){
   const hold=step.pose==='chest'?7:5,release=cycle-3-hold;
   if(position<3){phase='Move gently';cueRemaining=3-position;pose=position/3}
   else if(position<3+hold){phase='Hold comfortably';cueRemaining=3+hold-position;pose=1}
   else {phase='Return and relax';cueRemaining=cycle-position;pose=1-(position-3-hold)/release}
  }
  if(complete){phase='Sequence complete';cueRemaining=0;pose=0}
  return {index,step,elapsed,stepElapsed:within,stepRemaining:Math.max(0,Math.ceil(step.duration-within)),remaining:Math.ceil(remaining),progress:elapsed/DURATION,phase,cueRemaining:Math.max(0,Math.ceil(cueRemaining)),pose,complete};
 }
 function createGuide({play,isVisible,isEnabled}){
  let lastTarget=null,lastIndex=-1,availableBefore=isVisible()&&isEnabled();
  return {update(timer,stamp=Date.now()){
   const active=timer?.index===1&&timer.running,state=frame(timer?.index===1?timer:null,stamp),available=isVisible()&&isEnabled();
   if(active&&!state.complete&&lastTarget===timer.target&&state.index!==lastIndex&&state.stepElapsed<=1&&available&&availableBefore)play('tap');
   lastTarget=active?timer.target:null;lastIndex=active?state.index:-1;availableBefore=available;return state;
  }};
 }
 const round=n=>Math.round(n*10)/10;
 function illustration(state,quiet=false){
  const step=state.step,p=quiet?(state.phase==='Return and relax'||step.pose==='rest'||state.complete?0:1):state.pose,side=step.side||0;
  const shift=step.pose==='twist'?side*p*8:0,left=round(75+shift+(step.pose==='twist'?p*7:0)),right=round(125+shift-(step.pose==='twist'?p*7:0));
  const face=round(100+(step.pose==='neck'||step.pose==='twist'?side*p*7:0));
  const arms=step.pose==='chest'?'M'+left+' 70 '+round(77-p*27)+' '+round(106-p*12)+'M'+right+' 70 '+round(123+p*27)+' '+round(106-p*12):step.pose==='twist'?'M'+left+' 72 '+round(right-8)+' 88 '+round(right-4)+' 73M'+right+' 72 '+round(left+8)+' 88 '+round(left+4)+' 73':'M'+left+' 72 78 108m'+round(right-78)+'-36L122 108';
  const arrow=step.pose==='neck'?(side<0?'M71 39H48m8-7-8 7 8 7':'M129 39h23m-8-7 8 7-8 7'):step.pose==='twist'?(side<0?'M64 91H42m8-7-8 7 8 7':'M136 91h22m-8-7 8 7-8 7'):step.pose==='chest'?'M55 83H35m7-6-7 6 7 6m103-6h20m-7-6 7 6-7 6':'';
  return '<svg class="stretch-illustration" viewBox="0 0 200 175" aria-hidden="true"><ellipse class="stretch-floor" cx="100" cy="157" rx="63" ry="7"/><path class="stretch-chair" d="M65 111v10h70v-10m-65 10-5 33m65-33 5 33"/><path class="stretch-body" d="M86 113v21l-2 18H72m42-39v21l2 18h12"/><path class="stretch-body" d="M'+left+' 67q25-13 '+round(right-left)+' 0l-8 45q-17 8-'+round(right-left-16)+' 0Z"/><path class="stretch-body" d="M95 54v9m10-9v9"/><circle class="stretch-body" cx="100" cy="38" r="16"/><path class="stretch-face" d="M'+round(face-3)+' 36h1m4 0h1m-6 8h7"/><path class="stretch-arms" d="'+arms+'"/><path class="stretch-direction" d="'+arrow+'"/></svg>';
 }
 const api={steps,DURATION,frame,createGuide,illustration};root.DevWellStretches=api;
 if(typeof module!=='undefined')module.exports=api;
})(globalThis);
