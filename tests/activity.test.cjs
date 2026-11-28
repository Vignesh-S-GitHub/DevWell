const {test}=require('node:test'),assert=require('node:assert/strict');
const {change,revert,goalCrossings}=require('../activity.js');
const {blank,normalize,parseBackup}=require('../model.js');
const settings={water:2000,move:30};
test('goals celebrate only an upward threshold crossing, never an ordinary log or lowered value',()=>{
 const before={...blank(),water:1750,minutes:25,done:Array.from({length:12},(_,i)=>i)};
 const after={...before,water:2000,minutes:30,done:Array.from({length:13},(_,i)=>i)};
 assert.deepEqual(goalCrossings(before,after,settings),['water','move','routine']);
 assert.deepEqual(goalCrossings(after,{...after,water:2500,minutes:35},settings),[]);
 assert.deepEqual(goalCrossings(after,before,settings),[]);
});
test('celebrated goals survive reload and backup restore without duplicating or trusting unknown markers',()=>{
 const db=normalize({settings,days:{'2026-11-28':{water:2000,celebrated:['water','water','bad','move']}}});
 assert.deepEqual(parseBackup(JSON.stringify(db)).days['2026-11-28'].celebrated,['water','move']);
 const after={...db.days['2026-11-28'],water:2000};
 assert.deepEqual(goalCrossings({...after,water:1750},after,settings),[]);
 assert.deepEqual(goalCrossings({...blank(),water:1750},{...blank(),water:2000},settings),['water']);
});
test('Undo restores only the captured field and leaves other logs, goals and timer state intact',()=>{
 const db={days:{'2026-11-28':{...blank(),water:500,minutes:15}},settings,timer:{index:1}};
 const entry=change('2026-11-28','water',250,500);db.days['2026-11-28'].sleep=8;
 assert.equal(revert(db,entry,'2025-11-30'),true);assert.equal(db.days['2026-11-28'].water,250);
 assert.equal(db.days['2026-11-28'].sleep,8);assert.equal(db.days['2026-11-28'].minutes,15);assert.equal(db.settings,settings);assert.equal(db.timer.index,1);
});
test('meal and routine changes take detached snapshots and remain reversible',()=>{
 const before=[{type:'Lunch',name:'Rice'}],after=[...before,{type:'Snack',name:'Nuts'}],entry=change('2026-11-28','meals',before,after);
 before[0].name='Changed outside the log';const db={days:{'2026-11-28':{...blank(),meals:JSON.parse(JSON.stringify(entry.after))}}};
 assert.equal(revert(db,entry,'2025-11-30'),true);assert.equal(db.days['2026-11-28'].meals[0].name,'Rice');
 const routine=change('2026-11-28','done',[0],[0,1]);db.days['2026-11-28'].done=[0,1];
 assert.equal(revert(db,routine,'2025-11-30'),true);assert.deepEqual(db.days['2026-11-28'].done,[0]);
});
test('Undo refuses stale fields, missing days, expired history and unsupported fields',()=>{
 const entry=change('2026-11-28','water',250,500),db={days:{'2026-11-28':{...blank(),water:750}}};
 assert.equal(revert(db,entry,'2025-11-30'),false);assert.equal(db.days['2026-11-28'].water,750);
 assert.equal(revert({days:{}},entry,'2025-11-30'),false);
 assert.equal(revert({days:{'2026-11-28':{water:500}}},entry,'2026-11-29'),false);
 assert.equal(revert(db,{...entry,field:'settings'},'2025-11-30'),false);
 assert.equal(change('2026-11-28','water',500,500),null);assert.equal(change('2026-11-28','timer',{},{}),null);
});
test('Undo does not erase a celebration receipt or make a completed timer run again',()=>{
 const db={days:{'2026-11-28':{...blank(),minutes:30,celebrated:['move']}},timer:null};
 assert.equal(revert(db,change('2026-11-28','minutes',27,30),'2025-11-30'),true);
 assert.deepEqual(db.days['2026-11-28'].celebrated,['move']);assert.equal(db.timer,null);
});
