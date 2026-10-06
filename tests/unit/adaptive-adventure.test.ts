import {describe,it,expect} from 'vitest';
import {adaptedAdventure,adaptiveQuestions,supportedSkill} from '../../src/adaptive-adventure';
import {adventures,completeStage} from '../../src/adventure';
import {grades,recordEvidence,type Masteries} from '../../src/curriculum';
import {Game} from '../../src/game';
import {defaults} from '../../src/storage';
import {answerLabel} from '../../src/questions';
describe('aventures scolaires',()=>{
 it.each(grades.flatMap(grade=>adventures.map(adventure=>({grade,adventure}))))('$adventure.id : parcours complet $grade, acquis et récompenses',({grade,adventure})=>{
  const mastery:Masteries={},progress={completed:[] as string[]};
  let clock=0;
  for(const originalStage of adventure.stages){
   const adapted=adaptedAdventure(adventure,grade,mastery),stage=adapted.stages.find(s=>s.id===originalStage.id)!;
   expect(stage.world).toBe(originalStage.world);expect(stage.name).toBe(originalStage.name);expect(adapted.rewards[stage.id]).toBe(adventure.rewards[stage.id]);
   const questions=adaptiveQuestions(stage,mastery,()=>.5);expect(questions).toHaveLength(stage.count);expect(new Set(questions.map(q=>q.id)).size).toBe(stage.count);
   const game=new Game(defaults(),()=>.5,()=>true,{questions,untimed:true,unlimitedLives:true,explicitAnswers:true,onAnswer:(q,e)=>recordEvidence(mastery,q.exercise!.skillId,e)});
   game.start(clock);clock+=4001;game.tick(clock);
   for(const question of questions){
    expect(game.current!.id).toBe(question.id);const a=question.exercise!.answer;const raw=a.kind==='remainder'?`${a.quotient};${a.remainder}`:answerLabel(a);
    game.submitAnswer(raw,clock+10);clock+=700;game.tick(clock);
   }
   expect(game.solved).toBe(stage.count);expect(game.mistakes).toBe(0);expect(completeStage(progress,stage,adapted)).toBe(true);
  }
  expect(progress.completed).toEqual(adventure.stages.map(s=>s.id));
  const newGrade=adaptedAdventure(adventure,'2de',mastery);expect(newGrade.stages.map(s=>s.id)).toEqual(progress.completed);
 },20000);
 it('plafonne une petite banque, mélange le final et utilise les difficultés observées',()=>{
  const fifth=adaptedAdventure(adventures[0],'5e',{});expect(fifth.stages.filter(s=>s.study!.skills[0]==='cube').map(s=>s.count)).toEqual([7,7,7]);
  const gs=adaptedAdventure(adventures[0],'GS',{});expect(gs.stages.slice(0,3).map(s=>s.count)).toEqual([5,6,8]);expect(gs.stages.at(-1)!.count).toBe(10);
  expect(new Set(adaptiveQuestions(gs.stages.at(-1)!,{}).map(q=>q.exercise!.skillId)).size).toBe(2);
  expect(supportedSkill('equation-two',{ 'equation-one':{samples:[],series:[4],comfortable:false,level:0}})).toBe('missing');
  expect(supportedSkill('root',{root:{samples:[],series:[3],comfortable:false,level:0}})).toBe('square');
  const changed=adaptedAdventure(adventures[0],'2de',{'small-add':{samples:[],series:[10,10],comfortable:true,level:1}});
  expect(changed.stages.at(-1)!.study!.skills).not.toContain('small-add');
 });
});
