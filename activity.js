/* Pure goal and field-level undo rules; no browser or storage dependencies. */
(function(root){
 'use strict';
 const fields=new Set(['water','minutes','meals','sleep','mood','done']);
 const clone=value=>JSON.parse(JSON.stringify(value));
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function change(day,field,before,after){
  if(!fields.has(field)||equal(before,after))return null;
  return {day,field,before:clone(before),after:clone(after)};
 }
 function revert(db,entry,cutoff){
  if(!entry||!fields.has(entry.field)||entry.day<cutoff)return false;
  const day=db.days[entry.day];
  if(!day||!equal(day[entry.field],entry.after))return false;
  day[entry.field]=clone(entry.before);return true;
 }
 function goalCrossings(before,after,settings,routineTotal=13){
  const seen=after.celebrated||[],result=[];
  if(before.water<settings.water&&after.water>=settings.water&&!seen.includes('water'))result.push('water');
  if(before.minutes<settings.move&&after.minutes>=settings.move&&!seen.includes('move'))result.push('move');
  if(before.done.length<routineTotal&&after.done.length>=routineTotal&&!seen.includes('routine'))result.push('routine');
  return result;
 }
 const api={change,revert,goalCrossings,clone};
 root.DevWellActivity=api;
 if(typeof module!=='undefined')module.exports=api;
})(globalThis);
