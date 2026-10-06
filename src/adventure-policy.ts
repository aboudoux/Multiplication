import {grades,type Grade} from './curriculum';
import {mentalPaths,mentalPatternById} from './mental-patterns';
import type {Calculation} from './calculations';

export const adventureDifficulties=['easy','normal','expert'] as const;
export type AdventureDifficulty=typeof adventureDifficulties[number];
export const adventureDifficultyLabels:Record<AdventureDifficulty,string>={easy:'Facile',normal:'Normal',expert:'Expert'};
export type AdventureLevel=0|1|2;
/** Completed calculation levels, independently of narrative progress and camp mastery. */
export type AdventurePractice=Partial<Record<Grade,Record<string,AdventureLevel>>>;
export interface AdventureMissionPolicy {
 grade:Grade; difficulty:AdventureDifficulty; worldIndex:number; phase:number;
 requestedCount:number; count:number; primaryRatio:number; levels:Record<string,AdventureLevel>;
 discovery:boolean; blockedFinal:boolean; lives:number|null;
 timeLimits:{factMs:number|null;strategyMs:number|null};
}
type Counts=readonly [number,number,number];
type Matrix=readonly [Counts,Counts,Counts,Counts,Counts];
const gs:Matrix=[[5,6,8],[6,8,10],[8,10,12],[8,10,12],[10,12,15]];
const cp:Matrix=[[6,8,10],[8,10,12],[10,12,15],[12,15,18],[15,18,24]];
const ce1:Matrix=[[8,10,12],[10,12,15],[12,15,18],[15,18,20],[18,22,28]];
const primary:Matrix=[[8,10,12],[10,12,15],[12,15,18],[15,18,24],[20,24,30]];
const secondary:Matrix=[[8,10,12],[10,12,15],[12,15,18],[12,15,18],[15,18,24]];
export const adventureNormalCounts:Record<Grade,Matrix>={GS:gs,CP:cp,CE1:ce1,CE2:primary,CM1:primary,CM2:primary,'6e':secondary,'5e':secondary,'4e':secondary,'3e':secondary,'2de':secondary};
const normalTimes:Record<Grade,readonly [number|null,number|null]>={GS:[null,null],CP:[20,30],CE1:[20,25],CE2:[15,25],CM1:[15,25],CM2:[15,25],'6e':[15,25],'5e':[15,25],'4e':[10,20],'3e':[10,20],'2de':[10,20]};
const levels:Record<AdventureDifficulty,readonly AdventureLevel[]>={easy:[0,0,1],normal:[0,1,1],expert:[1,2,2]};
export const isAdventureDifficulty=(value:unknown):value is AdventureDifficulty=>typeof value==='string'&&adventureDifficulties.includes(value as AdventureDifficulty);
export function adventureRequestedCount(grade:Grade,difficulty:AdventureDifficulty,worldIndex:number,phase:number):number {
 const group=worldIndex===0?0:worldIndex===7?4:Math.ceil(worldIndex/2),count=adventureNormalCounts[grade][group][phase];
 return difficulty==='easy'?Math.max(5,Math.round(count*.8)):difficulty==='expert'?Math.min(36,Math.ceil(count*1.2)):count;
}
export function adventureQuestionLevel(difficulty:AdventureDifficulty,phase:number,id:string):AdventureLevel {
 return Math.min(levels[difficulty][phase],mentalPatternById(id)?.maxLevel??0) as AdventureLevel;
}
export function adventureLivesFor(difficulty:AdventureDifficulty,count:number,discovery=false):number|null {
 return discovery||difficulty==='easy'?null:difficulty==='normal'?Math.max(5,3+Math.ceil(count*.1)):Math.max(3,2+Math.ceil(count*.05));
}
export function adventureTimeLimits(grade:Grade,difficulty:AdventureDifficulty,discovery=false):AdventureMissionPolicy['timeLimits'] {
 const [fact,strategy]=normalTimes[grade],convert=(seconds:number|null)=>seconds===null||discovery||difficulty==='easy'?null:1000*(difficulty==='expert'?Math.max(10,Math.round(seconds*.75/5)*5):seconds);
 return {factMs:convert(fact),strategyMs:convert(strategy)};
}
export const adventureRecallLimit=(grade:Grade)=>grade==='GS'||grade==='CP'?1:grade==='CE1'||grade==='CE2'?2:3;
export function adventureRulesLabel(policy:AdventureMissionPolicy):string {
 if(policy.blockedFinal)return 'Découvre d’abord une notion de cette classe';
 const values=[policy.timeLimits.factMs,policy.timeLimits.strategyMs].filter((value):value is number=>value!==null).map(value=>value/1000);
 const min=Math.min(...values),max=Math.max(...values),time=values.length?(min===max?`${min} s par calcul`:`${min}–${max} s selon le calcul`):'Sans chrono';
 return `${time} · ${policy.lives===null?'Essais illimités':`${policy.lives} vies par mission`}`;
}
export function adventureQuestionTimeLimit(policy:AdventureMissionPolicy,q:Calculation):number|null {
 return q.exercise?.pace==='fact'?policy.timeLimits.factMs:policy.timeLimits.strategyMs;
}
export function validateAdventurePractice(value:unknown):AdventurePractice {
 const result:AdventurePractice={};if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const grade of grades){
  const entries=(value as Record<string,unknown>)[grade];if(!entries||typeof entries!=='object'||Array.isArray(entries))continue;
  const known:Record<string,AdventureLevel>={};
  for(const [id,level] of Object.entries(entries))if(mentalPaths[grade].includes(id)&&typeof level==='number'&&Number.isInteger(level)&&level>=0&&level<=2)known[id]=Math.min(level,mentalPatternById(id)!.maxLevel) as AdventureLevel;
  if(Object.keys(known).length)result[grade]=known;
 }
 return result;
}
