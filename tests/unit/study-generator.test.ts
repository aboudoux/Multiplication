import {describe,it,expect} from 'vitest';
import {generateStudyQuestions} from '../../src/study-generator';
import {curriculum} from '../../src/curriculum';
import {answerMatches,answerLabel} from '../../src/questions';
import {numberTokens} from '../../src/study-speech';
import {existsSync,readFileSync} from 'node:fs';
describe('exercices structurés',()=>{
 it('les divisions sont exactes, non nulles et reproductibles',()=>{
  const deck=generateStudyQuestions('divide','CE2',0,100,()=>.5);expect(deck).toHaveLength(90);expect(new Set(deck.map(q=>q.id)).size).toBe(90);
  for(const q of deck){const [a,b]=q.exercise!.prompt.match(/\d+/g)!.map(Number);expect(b).toBeGreaterThan(0);expect(a%b).toBe(0);expect(q.exercise!.answer).toEqual({kind:'integer',value:a/b});}
  expect(generateStudyQuestions('divide','CE2',0,100,()=>.5)).toEqual(deck);
 });
 it('les grands produits contiennent des opérandes au-delà de 100 et restent calculables',()=>{
  const deck=generateStudyQuestions('large-multiply','CE2',1,100);expect(deck.some(q=>Number(q.exercise!.prompt.split(' ')[0])>100)).toBe(true);
  for(const q of deck){const [a,b]=q.exercise!.prompt.match(/\d+/g)!.map(Number);expect(q.exercise!.answer).toEqual({kind:'integer',value:a*b});}
 });
 it('chaque famille livrée dispose de questions, de réponses acceptées et de tous ses sons',()=>{
  for(const skill of curriculum('2de'))for(const level of [0,1,2]) {
   const deck=generateStudyQuestions(skill.id,'2de',level,20);expect(deck.length).toBeGreaterThan(0);expect(new Set(deck.map(q=>q.id)).size).toBe(deck.length);
   for(const q of deck){const exercise=q.exercise!;expect(answerMatches(exercise.answer,answerLabel(exercise.answer))).toBe(true);for(const token of exercise.voiceTokens!){const path=`public/voice/fr/tokens/${token}.wav`;expect(existsSync(path),path).toBe(true);const wav=readFileSync(path);expect(wav.subarray(0,4).toString()).toBe('RIFF');expect(wav.length).toBeGreaterThan(100);}}
  }
 });
 it('les voix décomposent correctement les milliers et les décimaux',()=>{expect(numberTokens(1250)).toEqual(['thousand','2','hundred','50']);expect(numberTokens('0.075')).toEqual(['0','point','0','7','5']);expect(numberTokens(-300)).toEqual(['subtract','3','hundred']);});
 it('refuse une longueur invalide au lieu de boucler',()=>{expect(()=>generateStudyQuestions('divide','CE2',0,0)).toThrow();expect(()=>generateStudyQuestions('missing','CP')).toThrow();});
});
