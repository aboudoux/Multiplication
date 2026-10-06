import {mentalCurriculum,mentalPatternById,mentalPaths,type MentalMasteries} from './mental-patterns';
import {studyBank} from './study-generator';
import {shuffle,type Calculation} from './calculations';
import {answerLabel} from './questions';
import type {Grade} from './curriculum';
import type {AdventureDefinition,AdventureStage} from './adventure';

export function supportedSkill(id:string,mastery:MentalMasteries,visited=new Set<string>()):string {
 if(visited.has(id))return id;visited.add(id);
 const p=mentalPatternById(id),m=mastery[id];
 const prerequisite=m&&m.level===0&&(m.series.at(-1)?.score??10)<6?p?.prerequisites.find(p=>mentalPatternById(p)):p?.prerequisites.find(p=>(mastery[p]?.series.at(-1)?.score??10)<6);
 return prerequisite?supportedSkill(prerequisite,mastery,visited):id;
}
export function recommendedSkill(grade:Grade,mastery:MentalMasteries):string {
 const next=mentalPaths[grade].find(id=>!mastery[id]?.comfortable)??mentalPaths[grade][0];return supportedSkill(next,mastery);
}
const bank=(id:string,grade:Grade,mastery:MentalMasteries)=>studyBank(id,grade,mastery[id]?.level??0);
const factKeys=new WeakMap<Calculation,string>();
const factKey=(q:Calculation)=>{let key=factKeys.get(q);if(!key){key=`${q.exercise!.prompt}:${answerLabel(q.exercise!.answer)}:${JSON.stringify(q.exercise!.visual??null)}`;factKeys.set(q,key);}return key;};
export function adaptedAdventure(original:AdventureDefinition,grade:Grade,mastery:MentalMasteries):AdventureDefinition {
 const ids=mentalPaths[grade].map(id=>supportedSkill(id,mastery));
 const available=new Set(mentalCurriculum(grade).map(p=>p.id));
 const practiced=[...new Set(ids)].filter(id=>available.has(id)&&((mastery[id]?.samples.length??0)+(mastery[id]?.series.length??0)>0));
 const mixture=practiced.length?practiced:[...new Set(ids)];
 const finalCapacity=new Set(mixture.flatMap(id=>bank(id,grade,mastery).map(factKey))).size;
 const amounts=grade==='GS'?[5,6,8,10]:[8,10,12,15];
 const stages=original.stages.map(stage=>{
  const worldIndex=original.worlds.findIndex(w=>w.id===stage.world.id),mixed=worldIndex===7,primary=ids[worldIndex];
  const review=stage.index===2&&!mixed?practiced.filter(id=>id!==primary&&ids.slice(0,worldIndex).includes(id)):[];
  const skills=mixed?mixture:[primary,...review];
  const requested=amounts[mixed&&stage.index===2?3:stage.index];
  const count=mixed?Math.min(requested,finalCapacity):Math.min(requested,bank(primary,grade,mastery).length);
  const phase=['On s’échauffe','On s’entraîne','Petit mélange'][stage.index];
  return {...stage,count,lesson:`${phase} · ${mixed?'Les calculs pratiqués':mentalPatternById(primary)!.title} · ${grade}`,quotas:undefined,study:{grade,skills,phase:stage.index,mixed}};
 });
 return {...original,adaptive:true,stages,regions:original.regions.map(s=>s.replace('et des tables','et des défis'))};
}
export function adaptiveQuestions(stage:AdventureStage,mastery:MentalMasteries,random=Math.random):Calculation[] {
 if(!stage.study)throw new RangeError('Mission classique');
 const {skills,grade,mixed}=stage.study;
 const decks=skills.map(id=>shuffle([...bank(id,grade,mastery)],random));
 const questions:Calculation[]=[];
 const seen=new Set<string>();
 const take=(deck:Calculation[],count:number)=>{while(deck.length&&count>0){const q=deck.pop()!,key=factKey(q);if(seen.has(key))continue;seen.add(key);questions.push(q);count--;}};
 if(!mixed){
  const reviewCount=skills.length>1?Math.round(stage.count*.2):0;take(decks[0],stage.count-reviewCount);
  while(questions.length<stage.count&&decks.slice(1).some(d=>d.length))for(const deck of decks.slice(1))if(questions.length<stage.count)take(deck,1);
  take(decks[0],stage.count-questions.length);
 }else while(questions.length<stage.count&&decks.some(d=>d.length))for(const deck of decks)if(questions.length<stage.count)take(deck,1);
 return shuffle(questions,random);
}
