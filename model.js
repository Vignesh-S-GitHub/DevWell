/* Pure data validation, shared by the app and Node tests. */
(function (root) {
  'use strict';
  const defaults = [
    ['09:00','Breakfast','Start with a balanced meal','food','09:30'],
    ['10:00','Hydrate','Start the workday with water','water','10:15'],
    ['10:50','Eye break','Look into the distance','eye','10:55'],
    ['11:30','Desk mobility','Relax shoulders and wrists','move','11:40'],
    ['12:50','Step away','A short walk before lunch','move','13:00'],
    ['13:00','Lunch break','1 hour away from your desk','food','14:00'],
    ['14:15','Hydrate','Take a water break','water','14:30'],
    ['15:00','Eye break','Rest your eyes','eye','15:05'],
    ['15:45','Snack & reset','Fruit, nuts or curd','food','16:00'],
    ['16:30','Posture reset','Stand and move gently','move','16:40'],
    ['17:30','Hydrate','Refill your bottle','water','17:45'],
    ['18:20','Mindful pause','Breathe and relax','heart','18:25'],
    ['19:00','After-work walk','Close your workday','move','19:30']
  ];
  const blank = () => ({water:0, meals:[], minutes:0, sleep:0, done:[], mood:'', celebrated:[]});
  const number = (x,min,max,fallback=0) => typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max ? x : fallback;
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(value + 'T12:00:00Z');
    return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0,10) === value;
  }
  const RETENTION_DAYS = 365;
  function historyCutoff(today) {
    if (!validDate(today)) throw new Error('A valid local calendar date is required for cleanup.');
    // Date keys represent local calendar days. UTC date arithmetic avoids DST
    // changing the number of retained days; today counts as the first day.
    const cutoff = new Date(today + 'T12:00:00Z');
    cutoff.setUTCDate(cutoff.getUTCDate() - (RETENTION_DAYS - 1));
    return cutoff.toISOString().slice(0,10);
  }
  function pruneHistory(value, today) {
    const cutoff = historyCutoff(today);
    let removed = 0;
    const days = value && value.days;
    if (days && typeof days === 'object' && !Array.isArray(days)) {
      for (const day of Object.keys(days)) {
        if (validDate(day) && day < cutoff) { delete days[day]; removed++; }
      }
    }
    return {cutoff, removed};
  }
  function cleanDay(value) {
    const s = value && typeof value === 'object' ? value : {};
    return {
      water: number(s.water,0,20000), minutes: number(s.minutes,0,1440), sleep: number(s.sleep,0,24),
      meals: (Array.isArray(s.meals) ? s.meals : []).slice(0,40).filter(m=>m && typeof m.name==='string' && ['Breakfast','Lunch','Snack','Dinner'].includes(m.type)).map(m=>({type:m.type,name:m.name.trim().slice(0,120)})).filter(m=>m.name),
      done: [...new Set((Array.isArray(s.done) ? s.done : []).filter(i=>Number.isInteger(i) && i>=0 && i<13))],
      mood: ['Good','Okay','Tired','Stressed'].includes(s.mood) ? s.mood : '',
      celebrated: [...new Set((Array.isArray(s.celebrated)?s.celebrated:[]).filter(kind=>['water','move','routine'].includes(kind)))]
    };
  }
  function normalize(value) {
    const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const g = input.settings && typeof input.settings==='object' ? input.settings : {};
    const out = {schemaVersion:2, days:{}, settings:{water:number(g.water,100,10000,2000),move:number(g.move,1,300,30),sleep:number(g.sleep,1,24,8),dark:g.dark!==false,visualVersion:g.visualVersion===3?3:0,notifications:g.notifications===true,routineNotifications:g.routineNotifications!==false,timerNotifications:g.timerNotifications!==false,motion:g.motion!==false,haptics:g.haptics!==false,routine:defaults.map(r=>[...r])}, timer:null};
    if (Array.isArray(g.routine) && g.routine.length===13) out.settings.routine = defaults.map((r,i)=> {
      const v=g.routine[i];
      if(!Array.isArray(v)) return [...r];
      const time=t=>typeof t==='string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
      const start=time(v[0]) ? v[0] : r[0];
      const end=time(v[4]) && v[4]>start ? v[4] : (r[4]>start ? r[4] : start);
      return [start,r[1],r[2],r[3],end];
    });
    if(input.days && typeof input.days==='object' && !Array.isArray(input.days)) for(const [key,s] of Object.entries(input.days)) if(validDate(key)) out.days[key]=cleanDay(s);
    const t=input.timer;
    if(t && Number.isInteger(t.index) && t.index>=0 && t.index<4 && validDate(t.date) && typeof t.running==='boolean' && Number.isFinite(t.remaining) && t.remaining>=0 && t.remaining<=300 && Number.isFinite(t.target)) out.timer={index:t.index,date:t.date,running:t.running,remaining:t.remaining,target:t.target};
    return out;
  }
  function parseBackup(text) {
    if (typeof text!=='string' || text.length>5*1024*1024) throw new Error('Choose a DevWell backup smaller than 5 MB.');
    let data; try { data=JSON.parse(text); } catch { throw new Error('This file is not valid JSON. Choose a DevWell backup.'); }
    if(!data || !data.days || typeof data.days!=='object' || Array.isArray(data.days) || !data.settings || typeof data.settings!=='object' || (data.schemaVersion && data.schemaVersion!==2)) throw new Error('This does not look like a supported DevWell backup.');
    return normalize(data);
  }
  const api = {defaults,blank,normalize,parseBackup,validDate,RETENTION_DAYS,historyCutoff,pruneHistory};
  root.DevWellModel=api;
  if(typeof module!=='undefined') module.exports=api;
})(globalThis);
