const {test}=require('node:test'),assert=require('node:assert/strict');
const {normalize,parseBackup,blank,historyCutoff,pruneHistory,RETENTION_DAYS}=require('../model.js');
const key=(offset,from='2026-11-28')=>{const date=new Date(from+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10)};
test('the retained window is today plus exactly 364 calendar days, including leap years',()=>{
 assert.equal(RETENTION_DAYS,365);
 for(const today of ['2026-11-28','2024-03-01','2024-02-29','2025-01-01','2026-03-09','2026-11-02']){
  const cutoff=historyCutoff(today);assert.equal((Date.parse(today+'T12:00:00Z')-Date.parse(cutoff+'T12:00:00Z'))/86400000,364);
 }
});
test('cleanup deletes every expired daily record while preserving the exact boundary and all recent fields',()=>{
 const today='2026-11-28',days={};
 for(let age=0;age<730;age++)days[key(-age)]={...blank(),water:500+age,minutes:30,sleep:7.5,done:[0,1],mood:'Good',meals:[{type:'Lunch',name:'Day '+age}]};
 const db=normalize({days}),cutoff=historyCutoff(today),boundary=structuredClone(db.days[cutoff]);
 const result=pruneHistory(db,today);assert.equal(result.removed,365);assert.equal(Object.keys(db.days).length,365);
 assert.deepEqual(db.days[cutoff],boundary);assert.ok(db.days[today]);assert.equal(db.days[key(-365)],undefined);
});
test('cleanup is idempotent and sparse history is filtered by date rather than record count',()=>{
 const db=normalize({days:{[key(0)]:blank(),[key(-200)]:blank(),[key(-364)]:blank(),[key(-800)]:blank()}});
 assert.equal(pruneHistory(db,'2026-11-28').removed,1);assert.equal(pruneHistory(db,'2026-11-28').removed,0);assert.equal(Object.keys(db.days).length,3);
});
test('goals, routines, preferences, timer state and future records are not deleted by old-history cleanup',()=>{
 const timer={index:1,date:key(-400),running:false,remaining:123.5,target:0};
 const db=normalize({settings:{water:2500,dark:false,notifications:true,motion:false},timer,days:{[key(1)]:blank(),[key(-400)]:blank()}});
 const settings=structuredClone(db.settings);pruneHistory(db,'2026-11-28');
 assert.deepEqual(db.settings,settings);assert.deepEqual(db.timer,timer);assert.ok(db.days[key(1)]);assert.equal(db.days[key(-400)],undefined);
});
test('a new day advances the boundary once; long periods away remove all expired records',()=>{
 const db=normalize({days:{[key(-364)]:blank(),[key(-363)]:blank(),[key(0)]:blank()}});
 assert.equal(pruneHistory(db,key(1)).removed,1);assert.ok(db.days[key(-363)]);
 assert.equal(pruneHistory(db,key(401)).removed,2);assert.deepEqual(db.days,{});
});
test('restored backups use the same policy and legacy objects retain unrelated fields',()=>{
 const raw={schemaVersion:2,settings:{water:3000},days:{[key(-400)]:{water:500},[key(-10)]:{water:900}}};
 const db=parseBackup(JSON.stringify(raw));assert.equal(pruneHistory(db,'2026-11-28').removed,1);assert.equal(db.days[key(-10)].water,900);assert.equal(db.settings.water,3000);
 const legacy={days:structuredClone(raw.days),settings:{custom:'keep'},marker:'keep'};pruneHistory(legacy,'2026-11-28');
 assert.equal(legacy.marker,'keep');assert.equal(legacy.settings.custom,'keep');assert.equal(legacy.days[key(-10)].water,900);
});
test('invalid cleanup dates cannot partially remove data',()=>{
 const db={days:{'2000-01-01':blank()}},before=structuredClone(db);
 for(const date of ['bad','2026-02-30','2026-13-01'])assert.throws(()=>pruneHistory(db,date));
 assert.deepEqual(db,before);
});
