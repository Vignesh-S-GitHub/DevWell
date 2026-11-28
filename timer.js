/* One clock for countdowns, progress rings and optional breathing cues. */
(function(root){
 'use strict';
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function frame(timer,duration,stamp=Date.now()){
  const seconds=timer?clamp(timer.running?(timer.target-stamp)/1000:timer.remaining,0,duration):duration;
  const elapsed=duration-seconds,cycle=Math.floor(elapsed/10),position=elapsed%10;
  const phase=position<4?'in':'out',phaseElapsed=phase==='in'?position:position-4,phaseDuration=phase==='in'?4:6;
  const eased=(1-Math.cos(Math.PI*phaseElapsed/phaseDuration))/2;
  return {seconds,remaining:Math.ceil(seconds),elapsed,progress:elapsed/duration,complete:seconds===0,cycle,phase,phaseElapsed,phaseDuration,breathScale:phase==='in'?.85+.5*eased:1.35-.5*eased,pulseScale:.96+.1*(1-Math.cos(elapsed/6*Math.PI*2))/2};
 }
 function createBreathGuide({play,isVisible,isEnabled}){
  let previousToken='',previousTarget=null,availableBefore=isVisible()&&isEnabled();
  function update(timer,duration,stamp=Date.now()){
   const state=frame(timer,duration,stamp),active=timer?.index===3&&timer.running&&!state.complete;
   const token=active?[timer.date,timer.target,state.cycle,state.phase].join(':'):'';
   const available=isVisible()&&isEnabled(),newTimeline=timer?.target!==previousTarget;
   // Reopening a panel cannot replay a cue. Returning from a hidden page or
   // re-enabling haptics synchronizes silently; only the next boundary pulses.
   if(token&&token!==previousToken&&available&&availableBefore&&(newTimeline||state.phaseElapsed<=1))play(state.phase==='in'?'breathIn':'breathOut');
   previousToken=token;previousTarget=timer?.target??null;availableBefore=available;
   return state;
  }
  return {update};
 }
 const api={frame,createBreathGuide};root.DevWellTimer=api;
 if(typeof module!=='undefined')module.exports=api;
})(globalThis);
