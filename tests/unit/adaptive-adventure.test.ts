import {describe,it,expect} from 'vitest';
import {adaptedAdventure,resolveAdventureMission,recordAdventureMissionSuccess,orderAdventureQuestions,supportedSkill} from '../../src/adaptive-adventure';
import {adventures,completeStage} from '../../src/adventure';
import {grades} from '../../src/curriculum';
import {mentalPaths,recordMentalEvidence,type MentalMasteries} from '../../src/mental-patterns';
import {adventureDifficulties,type AdventurePractice} from '../../src/adventure-policy';
import {answerLabel} from '../../src/questions';
import type {Calculation} from '../../src/calculations';
const facts=(questions:Calculation[])=>questions.map(q=>`${q.exercise!.prompt}:${answerLabel(q.exercise!.answer)}:${JSON.stringify(q.exercise!.visual??null)}`);

describe('aventures scolaires choisies',()=>{
 it.each(grades.flatMap(grade=>adventureDifficulties.flatMap(difficulty=>adventures.map(adventure=>({grade,difficulty,adventure})))))('$adventure.id : parcours complet $grade $difficulty',({grade,difficulty,adventure})=>{
  const history:AdventurePractice={},progress={completed:[] as string[]};
  for(const originalStage of adventure.stages){
   const adapted=adaptedAdventure(adventure,grade,difficulty,history),stage=adapted.stages.find(s=>s.id===originalStage.id)!;
   expect(stage.world).toBe(originalStage.world);expect(stage.name).toBe(originalStage.name);expect(adapted.rewards[stage.id]).toBe(adventure.rewards[stage.id]);
   const mission=resolveAdventureMission(stage,history,()=>.5);
   expect(mission.questions).toHaveLength(stage.count);expect(new Set(facts(mission.questions)).size).toBe(stage.count);expect(mission.blockedFinal).toBe(false);
   expect(mission.questions.every(q=>mentalPaths[grade].includes(q.exercise!.patternId!))).toBe(true);
   expect(mission.questions.every(q=>q.exercise!.patternLevel===mission.policy.levels[q.exercise!.patternId!])).toBe(true);
   if(originalStage.index===0&&originalStage.world.tier!==4){expect(mission.discovery).toBe(true);expect(mission.rules.lives).toBeNull();expect(mission.questions.every(q=>mission.rules.questionTimeLimitMs(q)===null)).toBe(true);}
   if(!stage.study!.mixed)expect(mission.questions.filter(q=>q.exercise!.patternId===stage.study!.skills[0])).toHaveLength(Math.ceil(stage.count*mission.policy.primaryRatio));
   recordAdventureMissionSuccess(history,stage,mission.policy);expect(completeStage(progress,stage,adapted)).toBe(true);
  }
  expect(progress.completed).toEqual(adventure.stages.map(s=>s.id));expect(Object.keys(history[grade]!)).toEqual(mentalPaths[grade]);
 },20000);
 it('donne les petits plafonds corrects avec et sans rappels',()=>{
  expect(adaptedAdventure(adventures[0],'5e').stages.slice(9,12).map(s=>s.count)).toEqual([5,5,5]);
  const known:AdventurePractice={'5e':{'signed-add':0,priority:0,square:0,cube:0}};
  expect(adaptedAdventure(adventures[0],'5e','normal',known).stages.slice(9,12).map(s=>s.count)).toEqual([5,6,7]);
  const gs:AdventurePractice={GS:{'small-add':0,'small-subtract':0,'add-one':0,'take-one':0,'add-two':0}};
  expect(adaptedAdventure(adventures[0],'GS','normal',gs).stages.slice(12,15).map(s=>s.count)).toEqual([4,8,10]);
  expect(adaptedAdventure(adventures[0],'GS','easy',gs).stages.slice(12,14).map(s=>s.count)).toEqual([4,5]);
 });
 it('la découverte reste homogène même si l’ancien récit donne accès à M3',()=>{
  const history:AdventurePractice={CM1:{divide:0}},stage=adaptedAdventure(adventures[0],'CM1','expert',history).stages[5],mission=resolveAdventureMission(stage,history,()=>.5);
  expect(mission.discovery).toBe(true);expect(mission.rules.lives).toBeNull();expect(mission.questions.every(q=>q.exercise!.patternId==='large-multiply'&&q.exercise!.patternLevel===0)).toBe(true);
  expect(history.CM1).toEqual({divide:0});recordAdventureMissionSuccess(history,stage,mission.policy);expect(history.CM1).toEqual({divide:0,'large-multiply':0});
 });
 it('la maîtrise du camp ne relève pas les questions et les rappels restent au niveau acquis',()=>{
  const mastery:MentalMasteries={},history:AdventurePractice={CP:{add:0,subtract:0}},before=adaptedAdventure(adventures[0],'CP','normal',history).stages[4];
  for(let i=0;i<40;i++)recordMentalEvidence(mastery,'add',{first:true,helped:false,timeMs:1000});
  const after=adaptedAdventure(adventures[0],'CP','normal',history).stages[4];expect(after.study).toEqual(before.study);
  const mission=resolveAdventureMission(after,history,()=>.5);expect(mission.questions.filter(q=>q.exercise!.patternId==='add').every(q=>q.exercise!.patternLevel===0)).toBe(true);
  expect(mission.questions.filter(q=>q.exercise!.patternId==='subtract').every(q=>q.exercise!.patternLevel===1)).toBe(true);
 });
 it('le final ne présente jamais de nouvelle notion après changement de classe',()=>{
  const history:AdventurePractice={CP:{add:1,subtract:1}},changed=adaptedAdventure(adventures[0],'2de','normal',history),blocked=resolveAdventureMission(changed.stages.at(-1)!,history);
  expect(blocked.blockedFinal).toBe(true);expect(blocked.questions).toEqual([]);expect(blocked.policy.count).toBe(0);
  history['2de']={'signed-multiply':0};const final=resolveAdventureMission(changed.stages.at(-1)!,history,()=>.5);
  expect(final.blockedFinal).toBe(false);expect(final.questions.every(q=>q.exercise!.patternId==='signed-multiply'&&q.exercise!.patternLevel===0)).toBe(true);
  expect(adaptedAdventure(adventures[0],'CP','normal',history).stages.at(-1)!.study!.skills).toEqual(['add','subtract']);
 });
 it('les paramètres résolus restent stables si le profil change pendant une tentative',()=>{
  const history:AdventurePractice={CP:{add:0}},stage=adaptedAdventure(adventures[0],'CP','expert',history).stages[2],mission=resolveAdventureMission(stage,history,()=>.5),limits=mission.questions.map(mission.rules.questionTimeLimitMs);
  history.CP!.add=2;expect(mission.questions.map(mission.rules.questionTimeLimitMs)).toEqual(limits);expect(mission.policy.levels.add).toBe(2);
 });
 it('répartit 25/55/20 sur le final entier, malgré ses petites familles',()=>{
  const history:AdventurePractice={'5e':{'signed-add':2,priority:2,square:1,cube:0,'equation-one':2,'fraction-add':2,percent:2}},stage=adaptedAdventure(adventures[0],'5e','expert',history).stages.at(-1)!;
  for(const seed of [7,123,987]){
   let state=seed;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;},mission=resolveAdventureMission(stage,history,random),qs=mission.questions;
   expect(qs).toHaveLength(29);expect(['accessible','core','challenging'].map(b=>qs.filter(q=>q.exercise!.band===b).length)).toEqual([7,16,6]);
   expect(qs.slice(0,2).every(q=>q.exercise!.band==='accessible')).toBe(true);expect(qs.at(-1)!.exercise!.band).toBe('core');
   for(let i=2;i<qs.length;i++)expect(qs.slice(i-2,i+1).every(q=>q.exercise!.band==='challenging')).toBe(false);
  }
 });
 it('les aides de sélection du camp restent disponibles',()=>{
  expect(supportedSkill('equation-one',{'equation-one':{samples:[],series:[{score:4,medianMs:1000}],comfortable:false,level:0}})).toBe('missing');
  expect(supportedSkill('root',{root:{samples:[],series:[{score:3,medianMs:1000}],comfortable:false,level:0}})).toBe('square');
 });
 it('ordonne doucement les exemples et espace les produits miroir lorsque possible',()=>{
  const question=(id:string,band:'accessible'|'core'|'challenging',commutativeKey?:string):Calculation=>({id,operation:'multiply',a:2,b:3,result:6,exercise:{kind:'arithmetic',skillId:'tables',patternId:'tables',prompt:id,spoken:id,hint:'',answer:{kind:'integer',value:6},band,commutativeKey}});
  const qs=[question('a','accessible'),question('b','accessible'),question('2x3','core','2x3'),question('3x2','core','2x3'),question('c','core'),question('d','core'),question('e','challenging'),question('f','challenging'),question('g','challenging')];
  const ordered=orderAdventureQuestions(qs,true,()=>.99);expect(ordered.slice(0,2).every(q=>q.exercise!.band==='accessible')).toBe(true);expect(ordered.at(-1)!.exercise!.band).toBe('core');
  for(let i=2;i<ordered.length;i++)expect(ordered.slice(i-2,i+1).every(q=>q.exercise!.band==='challenging')).toBe(false);
  expect(Math.abs(ordered.findIndex(q=>q.id==='2x3')-ordered.findIndex(q=>q.id==='3x2'))).toBeGreaterThanOrEqual(4);expect(new Set(ordered.map(q=>q.id)).size).toBe(qs.length);
 });
});
