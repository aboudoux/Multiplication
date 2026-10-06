import {describe,it,expect} from 'vitest';
import {rational,decimal,answerMatches,parseRational,studyCalculation,type StudyQuestion} from '../../src/questions';
import {Game} from '../../src/game';
import {defaults} from '../../src/storage';
describe('réponses exactes',()=>{
 it('accepte les décimaux français et clavier, avec équivalences exactes',()=>{
  const answer={kind:'decimal' as const,value:decimal(3,1)};expect(answerMatches(answer,'0,30')).toBe(true);expect(answerMatches(answer,'0.3')).toBe(true);expect(answerMatches(answer,'3/10')).toBe(true);expect(answerMatches(answer,'0.300000001')).toBe(false);
 });
 it('valide les fractions sans confondre équivalence et forme irréductible',()=>{
  const answer={kind:'fraction' as const,value:rational(3,4)};expect(answerMatches(answer,'18/24')).toBe(true);expect(answerMatches({...answer,irreducible:true},'18/24')).toBe(false);expect(answerMatches({...answer,irreducible:true},'3/4')).toBe(true);
  for(const raw of ['1/0','NaN','1e2','Infinity','1,','--2','9007199254740992'])expect(parseRational(raw)).toBeNull();
 });
 it('exige toutes les solutions et conserve le reste dans son champ',()=>{
  expect(answerMatches({kind:'set',values:[rational(-5),rational(5)]},'5')).toBe(false);expect(answerMatches({kind:'set',values:[rational(-5),rational(5)]},'5;-5')).toBe(true);
  expect(answerMatches({kind:'remainder',quotient:4,remainder:3},'4;3')).toBe(true);expect(answerMatches({kind:'remainder',quotient:4,remainder:3},'3;4')).toBe(false);
  expect(answerMatches({kind:'inequality',operator:'≤',bound:rational(4)},'x <= 4')).toBe(true);expect(answerMatches({kind:'inequality',operator:'≤',bound:rational(4)},'x ≥ 4')).toBe(false);
 });
});
describe('moteur explicite',()=>{
 it('ne révèle pas la longueur, attend Valider et ne recompte pas une correction',()=>{
  const q:StudyQuestion={kind:'arithmetic',skillId:'add',prompt:'1 + 2',spoken:'un plus deux',hint:'Réunir',answer:{kind:'integer',value:3}};
  const observed:unknown[]=[];const game=new Game(defaults(),()=>0,()=>true,{questions:[studyCalculation(q,'a')],untimed:true,unlimitedLives:true,onAnswer:(_,e)=>observed.push(e)});
  game.start(0);game.tick(4000);game.digit('9',4001);expect(game.phase).toBe('question');game.submitAnswer('9',4002);game.tick(7000);game.useHint();game.submitAnswer('3',7001);expect(game.phase).toBe('victory');expect(observed).toHaveLength(1);expect(observed[0]).toMatchObject({first:false,helped:false});
 });
});
