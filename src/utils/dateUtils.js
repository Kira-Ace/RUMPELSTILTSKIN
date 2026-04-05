import { DAYS } from './constants.js';

export const dk = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();

export function buildMonthGrid(y,m) {
  const offset = new Date(y,m,1).getDay();
  const total  = daysInMonth(y,m);
  const prev   = daysInMonth(m===0?y-1:y, m===0?11:m-1);
  const cells  = [];
  for(let i=0;i<offset;i++) cells.push({d:prev-(offset-1-i),m:m===0?11:m-1,y:m===0?y-1:y,type:"prev"});
  for(let d=1;d<=total;d++) cells.push({d,m,y,type:"current"});
  let nd=1;
  while(cells.length%7!==0) cells.push({d:nd++,m:m===11?0:m+1,y:m===11?y+1:y,type:"next"});
  return cells;
}

export function getWeekCells(y,m,d) {
  const g=buildMonthGrid(y,m), idx=g.findIndex(c=>c.type==="current"&&c.d===d);
  return g.slice(Math.floor((idx<0?0:idx)/7)*7, Math.floor((idx<0?0:idx)/7)*7+7);
}

export function addDays({y,m,d},n) {
  const dt=new Date(y,m,d+n);
  return {y:dt.getFullYear(),m:dt.getMonth(),d:dt.getDate()};
}

export function dowName({y,m,d}) { 
  return DAYS[new Date(y,m,d).getDay()]; 
}

export function selDow({y,m,d})  { 
  return new Date(y,m,d).getDay(); 
}

export function formatDateKey(y,m,d) {
  return dk(y,m,d);
}
