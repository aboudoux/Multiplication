import {curriculum,skillById,grades,type Grade,type Masteries} from './curriculum';
import {studyBank} from './study-generator';
import {shuffle,type Calculation} from './calculations';
import type {AdventureDefinition,AdventureStage} from './adventure';

const paths:Record<Grade,string[]>= {
 GS:['small-add','small-subtract','small-add','small-subtract','small-add','small-subtract','small-add','small-subtract'],
 CP:['add','subtract','double','half','missing','add','subtract','missing'],
 CE1:['large-add','tables','large-subtract','times-ten','fraction-picture','fraction-compare','tables','large-add'],
 CE2:['tables','divide','large-multiply','times-hundred','fraction-add','fraction-compare','divide','large-multiply'],
 CM1:['large-add','mystery','remainder','decimal-add','times-thousand','divide','large-multiply','decimal-add'],
 CM2:['decimal-add','decimal-scale','decimal-divide','fraction-of','program','large-multiply','mystery','program'],
 '6e':['decimal-add','decimal-multiply','fraction-of','percent','proportion','decimal-divide','program','decimal-multiply'],
 '5e':['signed-add','priority','square','cube','substitution','equation-one','fraction-add','priority'],
 '4e':['signed-multiply','fraction-multiply','root','power-ten','equation-two','equation-both','priority','fraction-multiply'],
 '3e':['fraction-reduce','negative-power','equation-set','evolution','function','equation-both','priority','function'],
 '2de':['substitution','square','identity','inequality','successive','function','equation-set','identity'],
};
/** A class supplies a starting point. Only observed difficulty redirects to a prerequisite. */
export function supportedSkill(id:string,mastery:Masteries,visited=new Set<string>()):string {
 if(visited.has(id))return id;visited.add(id);
 const skill=skillById(id),current=mastery[id];
 const prerequisite=current&&current.level===0&&(current.series.at(-1)??10)<6?skill?.prerequisites[0]:skill?.prerequisites.find(p=>{const score=mastery[p]?.series.at(-1);return score!==undefined&&score<6;});
 return prerequisite?supportedSkill(prerequisite,mastery,visited):id;
}
export function recommendedSkill(grade:Grade,mastery:Masteries):string {
 const candidates=curriculum(grade).filter(s=>s.grade===grade);
 const next=candidates.find(s=>!mastery[s.id]?.comfortable)??candidates[0];
 return supportedSkill(next?.id??'small-add',mastery);
}
function pools(ids:string[],grade:Grade,mastery:Masteries):readonly Calculation[][] {
 return ids.map(id=>[...studyBank(id,grade,mastery[id]?.level??0)]);
}
export function adaptedAdventure(original:AdventureDefinition,grade:Grade,mastery:Masteries):AdventureDefinition {
 const ids=paths[grade].map(id=>supportedSkill(id,mastery));
 const available=new Set(curriculum(grade).map(s=>s.id));
 const pathway=new Set(ids.slice(0,7));
 // A changed class keeps old acquisitions, but its final also follows the current level.
 const practiced=Object.keys(mastery).filter(id=>available.has(id)&&(pathway.has(id)||grades.indexOf(skillById(id)!.grade)>=grades.indexOf(grade)-1)&&(mastery[id].samples.length||mastery[id].series.length));
 const mixture=[...new Set(practiced.length?practiced:ids.slice(0,7))];
 const amounts=grade==='GS'?[5,6,8,10]:grades.indexOf(grade)<4?[8,10,12,15]:[10,12,15,20];
 const stages=original.stages.map(stage=>{
  const worldIndex=original.worlds.findIndex(w=>w.id===stage.world.id),mixed=worldIndex===7;
  const skills=mixed?mixture:[ids[worldIndex]];
  const capacity=skills.reduce((sum,id)=>sum+studyBank(id,grade,mastery[id]?.level??0).length,0);
  const count=Math.min(amounts[mixed&&stage.index===2?3:stage.index],capacity);
  const phase=['Découverte','Entraînement','Consolidation'][stage.index];
  const lesson=`${phase} · ${mixed?'Les compétences pratiquées':skillById(skills[0])!.title} · ${grade}`;
  return {...stage,count,lesson,quotas:undefined,study:{grade,skills,phase:stage.index}};
 });
 return {...original,adaptive:true,stages,regions:original.regions.map(s=>s.replace('et des tables','et des défis'))};
}
export function adaptiveQuestions(stage:AdventureStage,mastery:Masteries,random=Math.random):Calculation[] {
 if(!stage.study)throw new RangeError('Mission classique');
 const decks=pools(stage.study.skills,stage.study.grade,mastery).map(pool=>shuffle(pool,random));
 const questions:Calculation[]=[];
 // Round robin keeps every family represented in the final mixture.
 while(questions.length<stage.count&&decks.some(d=>d.length))for(const deck of decks){const q=deck.pop();if(q&&questions.length<stage.count)questions.push(q);}
 return shuffle(questions,random);
}
