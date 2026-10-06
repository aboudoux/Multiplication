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
 it.each(curriculum('2de').flatMap(skill=>[0,1,2].map(level=>({skill,level}))))('$skill.id palier $level : banque unique, réponses et voix locales',({skill,level})=>{
   const deck=generateStudyQuestions(skill.id,'2de',level,20);expect(deck.length).toBeGreaterThan(0);expect(new Set(deck.map(q=>q.id)).size).toBe(deck.length);
   for(const q of deck){const exercise=q.exercise!;const raw=exercise.answer.kind==='remainder'?`${exercise.answer.quotient};${exercise.answer.remainder}`:answerLabel(exercise.answer);expect(answerMatches(exercise.answer,raw),exercise.prompt).toBe(true);for(const token of exercise.voiceTokens!){const path=`public/voice/fr/tokens/${token}.wav`;expect(existsSync(path),path).toBe(true);const wav=readFileSync(path);expect(wav.subarray(0,4).toString()).toBe('RIFF');expect(wav.length).toBeGreaterThan(100);}}
 });
 it('les voix décomposent correctement les milliers et les décimaux',()=>{expect(numberTokens(1250)).toEqual(['thousand','2','hundred','50']);expect(numberTokens('0.075')).toEqual(['0','point','0','7','5']);expect(numberTokens(-300)).toEqual(['subtract','3','hundred']);});
 it('refuse une longueur invalide au lieu de boucler',()=>{expect(()=>generateStudyQuestions('divide','CE2',0,0)).toThrow();expect(()=>generateStudyQuestions('unknown','CP')).toThrow();});
 it('construit les divisions décimales et les restes par des identités exactes',()=>{
  for(const q of generateStudyQuestions('decimal-divide','CM2',1,100)){const [a,b]=q.exercise!.prompt.replace(',','.').match(/\d+(?:\.\d+)?/g)!.map(Number);const answer=q.exercise!.answer;expect(answer.kind).toBe('decimal');if(answer.kind==='decimal')expect(a/b).toBeCloseTo(answer.value.numerator/answer.value.denominator,10);}
  for(const q of generateStudyQuestions('remainder','CM1',1,100)){const [a,b]=q.exercise!.prompt.match(/\d+/g)!.map(Number);const answer=q.exercise!.answer;if(answer.kind==='remainder'){expect(b*answer.quotient+answer.remainder).toBe(a);expect(answer.remainder).toBeLessThan(b);}}
 });
 it('les racines sont positives et les signes des carrés sont distincts',()=>{
  for(const q of generateStudyQuestions('root','4e',0,100)){const squared=Number(q.exercise!.prompt.slice(1));const answer=q.exercise!.answer;if(answer.kind==='integer'){expect(answer.value).toBeGreaterThanOrEqual(0);expect(answer.value**2).toBe(squared);}}
  const deck=generateStudyQuestions('square','4e',2,100);expect(deck.some(q=>q.exercise!.prompt.startsWith('(-'))).toBe(true);expect(deck.some(q=>q.exercise!.prompt.startsWith('−'))).toBe(true);
  for(const q of deck){const prompt=q.exercise!.prompt,base=Number(prompt.match(/\d+/)![0]);expect(q.exercise!.answer).toEqual({kind:'integer',value:prompt.startsWith('−')?-base*base:base*base});}
 });
 it('les équations construites ont les solutions annoncées dans les deux membres',()=>{
  for(const id of ['equation-two','equation-both'])for(const q of generateStudyQuestions(id,'4e',1,100)){
   const [a,b,c,d]=q.exercise!.prompt.match(/-?\d+/g)!.map(Number);const answer=q.exercise!.answer;if(answer.kind!=='integer')throw Error('Entier attendu');
   expect(a*answer.value+b).toBe(id==='equation-both'?c*answer.value+d:c);
   if(id==='equation-both')expect(a).not.toBe(c);
  }
  for(const q of generateStudyQuestions('equation-set','3e',0,20)){
   const answer=q.exercise!.answer;if(answer.kind!=='set')throw Error('Ensemble attendu');
   const squared=Number(q.exercise!.prompt.match(/\d+/)![0]);expect(answer.values).toHaveLength(2);
   for(const v of answer.values)expect(v.numerator**2).toBe(squared);
   expect(answerMatches(answer,String(answer.values[0].numerator))).toBe(false);
  }
 });
 it('les inéquations inversent le sens et les évolutions composent les taux',()=>{
  for(const q of generateStudyQuestions('inequality','2de',1,100)){
   const [a,b,c]=q.exercise!.prompt.match(/-?\d+/g)!.map(Number);const answer=q.exercise!.answer;if(answer.kind!=='inequality')throw Error('Inéquation attendue');
   expect(a*answer.bound.numerator/answer.bound.denominator+b).toBe(c);
   const op=q.exercise!.prompt.match(/[≤≥<>]/)![0];expect(answer.operator).toBe(a<0?({'≤':'≥','≥':'≤','<':'>','>':'<'} as Record<string,string>)[op]:op);
  }
  for(const q of generateStudyQuestions('successive','2de',0,100)){
   const [price,a,b]=q.exercise!.prompt.match(/-?\d+/g)!.map(Number);const answer=q.exercise!.answer;if(answer.kind!=='decimal')throw Error('Décimal attendu');
   expect(answer.value.numerator*10000).toBe(price*(100+a)*(100+b)*answer.value.denominator);
  }
 });
});
