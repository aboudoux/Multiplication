import {mentalPatternById,mentalPaths,type MentalMasteries} from './mental-patterns';
import {studyBank} from './study-generator';
import {shuffle,type Calculation} from './calculations';
import {answerLabel} from './questions';
import type {Grade} from './curriculum';
import type {AdventureDefinition,AdventureStage} from './adventure';
import {adventureQuestionLevel,adventureRequestedCount,adventureRecallLimit,adventureLivesFor,adventureTimeLimits,adventureQuestionTimeLimit,adventureDifficultyLabels,type AdventureDifficulty,type AdventurePractice,type AdventureMissionPolicy,type AdventureLevel} from './adventure-policy';

export function supportedSkill(id:string,mastery:MentalMasteries,visited=new Set<string>()):string {
 if(visited.has(id))return id;visited.add(id);
 const p=mentalPatternById(id),m=mastery[id];
 const prerequisite=m&&m.level===0&&(m.series.at(-1)?.score??10)<6?p?.prerequisites.find(p=>mentalPatternById(p)):p?.prerequisites.find(p=>(mastery[p]?.series.at(-1)?.score??10)<6);
 return prerequisite?supportedSkill(prerequisite,mastery,visited):id;
}
export function recommendedSkill(grade:Grade,mastery:MentalMasteries):string {
 const next=mentalPaths[grade].find(id=>!mastery[id]?.comfortable)??mentalPaths[grade][0];return supportedSkill(next,mastery);
}
const factKeys=new WeakMap<Calculation,string>();
const factKey=(q:Calculation)=>{let key=factKeys.get(q);if(!key){key=`${q.exercise!.prompt}:${answerLabel(q.exercise!.answer)}:${JSON.stringify(q.exercise!.visual??null)}`;factKeys.set(q,key);}return key;};
const rotate=<T>(values:T[],offset:number):T[]=>values.length?[...values.slice(offset%values.length),...values.slice(0,offset%values.length)]:[];
const bands=['accessible','core','challenging'] as const;
type Band=typeof bands[number];
const band=(q:Calculation):Band=>q.exercise?.band??'core';

function splitEven(total:number,capacities:number[],offset:number):number[]|null {
 const counts=capacities.map(()=>0),indices=rotate(capacities.map((_,i)=>i),offset);
 while(total>0){let added=false;for(const i of indices)if(total>0&&counts[i]<capacities[i]){counts[i]++;total--;added=true;}if(!added)return null;}
 return counts;
}
function desiredBands(count:number):number[] {
 const ratios=[.25,.55,.2],counts=ratios.map(r=>Math.floor(count*r)),order=ratios.map((r,i)=>({i,remainder:count*r-counts[i]})).sort((a,b)=>b.remainder-a.remainder||a.i-b.i);
 for(let i=0,left=count-counts.reduce((a,b)=>a+b,0);i<left;i++)counts[order[i].i]++;
 return counts;
}
/** Global band targets avoid rounding 25/55/20 separately for seven tiny recalls. */
function preferredBands(decks:readonly Calculation[][],quotas:number[]):Band[][] {
 const total=quotas.reduce((a,b)=>a+b,0),desired=desiredBands(total),capacity=decks.map(deck=>bands.map(b=>deck.filter(q=>band(q)===b).length));
 if(total>=2&&capacity.reduce((sum,c)=>sum+c[0],0)>=2&&desired[0]<2){const extra=2-desired[0],fromCore=Math.min(extra,desired[1]);desired[0]+=extra;desired[1]-=fromCore;desired[2]-=extra-fromCore;}
 let states=new Map<string,{a:number;h:number;counts:number[][]}>([['0:0',{a:0,h:0,counts:[]}]]);
 for(let i=0;i<quotas.length;i++){
  const next=new Map<string,{a:number;h:number;counts:number[][]}>(),n=quotas[i];
  for(const state of states.values())for(let a=0;a<=Math.min(n,capacity[i][0]);a++)for(let h=0;h<=Math.min(n-a,capacity[i][2]);h++){
   const core=n-a-h;if(core>capacity[i][1])continue;
   const key=`${state.a+a}:${state.h+h}`;if(!next.has(key))next.set(key,{a:state.a+a,h:state.h+h,counts:[...state.counts,[a,core,h]]});
  }
  states=next;
 }
 let best:number[][]=quotas.map(()=>[0,0,0]),bestScore=Infinity;
 for(const state of states.values()){
  const actual=[state.a,total-state.a-state.h,state.h],missing=desired.reduce((sum,target,i)=>sum+Math.max(0,target-actual[i]),0),overflow=actual.map((n,i)=>Math.max(0,n-desired[i]));
  const score=missing*100+overflow[1]+overflow[0]*2+overflow[2]*3;
  if(score<bestScore){bestScore=score;best=state.counts;}
 }
 return best.map(counts=>bands.flatMap((b,i)=>Array.from({length:counts[i]},()=>b)));
}
/** Assign unique facts to family quotas, even when GS patterns share facts. */
function selectUnique(decks:readonly Calculation[][],quotas:number[],balanced:boolean):Calculation[]|null {
 const preferred=balanced?preferredBands(decks,quotas):[];
 const slots=quotas.flatMap((count,skill)=>Array.from({length:count},(_,i)=>({skill,band:preferred[skill]?.[i]})));
 const owners=new Map<string,number>(),assigned=new Map<number,Calculation>();
 const candidates=slots.map(slot=>slot.band?[...decks[slot.skill].filter(q=>band(q)===slot.band),...decks[slot.skill].filter(q=>band(q)!==slot.band)]:decks[slot.skill]);
 const place=(slot:number,seen:Set<string>):boolean=>{
  for(const q of candidates[slot]){const key=factKey(q);if(seen.has(key))continue;seen.add(key);const owner=owners.get(key);
   if(owner===undefined||place(owner,seen)){owners.set(key,slot);assigned.set(slot,q);return true;}
  }return false;
 };
 for(let i=0;i<slots.length;i++)if(!place(i,new Set()))return null;
 return slots.map((_,i)=>assigned.get(i)!);
}
function missionDecks(grade:Grade,skills:string[],levels:Record<string,AdventureLevel>):Calculation[][] {
 return skills.map(id=>[...studyBank(id,grade,levels[id])]);
}
function feasibleAllocation(decks:Calculation[][],requested:number,ratio:number,mixed:boolean,offset:number):{count:number;quotas:number[]} {
 for(let count=requested;count>0;count--){
  let quotas:number[]|null;
  if(mixed)quotas=splitEven(count,decks.map(d=>d.length),offset);
  else {const primary=Math.ceil(ratio*count),reviews=splitEven(count-primary,decks.slice(1).map(d=>d.length),offset);quotas=primary<=decks[0].length&&reviews?[primary,...reviews]:null;}
  if(quotas&&selectUnique(decks,quotas,false))return {count,quotas};
 }return {count:0,quotas:decks.map(()=>0)};
}
function describeStage(stage:AdventureStage,grade:Grade,difficulty:AdventureDifficulty,history:AdventurePractice,worldIndex:number):AdventureStage {
 const path=mentalPaths[grade],known=history[grade]??{},mixed=worldIndex===7,primary=path[worldIndex];
 const introduced=path.filter(id=>known[id]!==undefined),discovery=!mixed&&known[primary]===undefined;
 const previous=introduced.filter(id=>path.indexOf(id)<worldIndex&&id!==primary);
 const reviews=!mixed&&!discovery&&stage.index>0?rotate(previous,worldIndex+stage.index).slice(0,adventureRecallLimit(grade)):[];
 const skills=mixed?introduced:[primary,...reviews],level=adventureQuestionLevel(difficulty,stage.index,primary??path[0]);
 const levels:Record<string,AdventureLevel>={};
 for(const id of skills)levels[id]=id===primary?(discovery?0:level):Math.min(adventureQuestionLevel(difficulty,stage.index,id),known[id]) as AdventureLevel;
 const requestedCount=adventureRequestedCount(grade,difficulty,worldIndex,stage.index),primaryRatio=mixed?0:reviews.length?[1,.8,.7][stage.index]:1;
 const blockedFinal=mixed&&!skills.length,decks=missionDecks(grade,skills,levels);
 const {count}=blockedFinal?{count:0}:feasibleAllocation(decks,requestedCount,primaryRatio,mixed,worldIndex+stage.index);
 const timeLimits=adventureTimeLimits(grade,difficulty,discovery),hasFacts=decks.some(d=>d.some(q=>q.exercise?.pace==='fact')),hasStrategies=decks.some(d=>d.some(q=>q.exercise?.pace!=='fact'));
 if(!hasFacts)timeLimits.factMs=timeLimits.strategyMs;else if(!hasStrategies)timeLimits.strategyMs=timeLimits.factMs;
 const policy:AdventureMissionPolicy={grade,difficulty,worldIndex,phase:stage.index,requestedCount,count,primaryRatio,levels,discovery,blockedFinal,lives:adventureLivesFor(difficulty,count,discovery),timeLimits};
 const phase=discovery?'Découverte':['On s’échauffe','On s’entraîne','Petit mélange'][stage.index];
 return {...stage,count,lesson:`${phase} · ${mixed?'Les notions découvertes':mentalPatternById(primary)!.title} · ${grade} · ${adventureDifficultyLabels[difficulty]}`,quotas:undefined,study:{grade,skills,phase:stage.index,mixed,policy}};
}
export function adaptedAdventure(original:AdventureDefinition,grade:Grade,difficulty:AdventureDifficulty='normal',history:AdventurePractice={}):AdventureDefinition {
 const stages=original.stages.map(stage=>describeStage(stage,grade,difficulty,history,original.worlds.findIndex(w=>w.id===stage.world.id)));
 return {...original,adaptive:true,stages,regions:original.regions.map(s=>s.replace('et des tables','et des défis'))};
}
/** Ordering targets yield to the finite bank; content and uniqueness stay exact. */
export function orderAdventureQuestions(questions:Calculation[],_discovery:boolean,random=Math.random):Calculation[] {
 const remaining=shuffle(questions,random),ordered:Calculation[]=[];
 while(remaining.length){
  let candidates=remaining.map((q,i)=>({q,i}));
  if(ordered.length<2){const easy=candidates.filter(({q})=>band(q)==='accessible');if(easy.length)candidates=easy;}
  if(remaining.length>1&&ordered.slice(-2).length===2&&ordered.slice(-2).every(q=>band(q)==='challenging')){const calmer=candidates.filter(({q})=>band(q)!=='challenging');if(calmer.length)candidates=calmer;}
  // Reserve a middle or accessible calculation for the end whenever possible.
  if(remaining.length>1){
   const calm=remaining.filter(q=>band(q)==='core'),ending=calm.length?calm:remaining.filter(q=>band(q)==='accessible');
   const sustainable=candidates.filter(({q})=>{
    const future=remaining.filter(other=>other!==q),hard=future.filter(other=>band(other)==='challenging').length,soft=future.length-hard;
    const run=band(q)==='challenging'?1+(ordered.at(-1)?.exercise?.band==='challenging'?1:0):0;
    return (!ending.length||ending.some(other=>other!==q))&&(!soft||hard<=2*soft-run);
   });
   if(sustainable.length)candidates=sustainable;
  }
  if(remaining.length>1){const nonMirror=candidates.filter(({q})=>!q.exercise?.commutativeKey||!ordered.slice(-3).some(previous=>previous.exercise?.commutativeKey===q.exercise!.commutativeKey));if(nonMirror.length)candidates=nonMirror;}
  const chosen=candidates[0];ordered.push(chosen.q);remaining.splice(chosen.i,1);
 }
 return ordered;
}
export function resolveAdventureMission(stage:AdventureStage,history:AdventurePractice={},random=Math.random):{questions:Calculation[];policy:AdventureMissionPolicy;rules:{lives:number|null;questionTimeLimitMs:(q:Calculation)=>number|null};discovery:boolean;blockedFinal:boolean} {
 if(!stage.study?.policy)throw new RangeError('Mission classique');
 const old=stage.study.policy,current=describeStage(stage,old.grade,old.difficulty,history,old.worldIndex),policy=current.study!.policy!;
 const decks=missionDecks(policy.grade,current.study!.skills,policy.levels).map(deck=>shuffle(deck,random));
 const {quotas}=feasibleAllocation(decks,policy.count,policy.primaryRatio,!!current.study!.mixed,policy.worldIndex+policy.phase);
 const selected=policy.blockedFinal?[]:selectUnique(decks,quotas,true)!;
 const questions=orderAdventureQuestions(selected,policy.discovery,random);
 return {questions,policy,rules:{lives:policy.lives,questionTimeLimitMs:q=>adventureQuestionTimeLimit(policy,q)},discovery:policy.discovery,blockedFinal:policy.blockedFinal};
}
export const adaptiveQuestions=(stage:AdventureStage,history:AdventurePractice={},random=Math.random)=>resolveAdventureMission(stage,history,random).questions;
export function recordAdventureMissionSuccess(history:AdventurePractice,stage:AdventureStage,policy=stage.study?.policy):void {
 if(!policy||policy.blockedFinal||stage.study?.mixed)return;
 const id=mentalPaths[policy.grade][policy.worldIndex],grade=history[policy.grade]??={};
 grade[id]=Math.max(grade[id]??0,policy.levels[id]) as AdventureLevel;
}
