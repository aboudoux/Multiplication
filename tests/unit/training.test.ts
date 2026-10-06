import { describe,it,expect } from 'vitest';
import { awardMaterials, importTraining, inspectTraining, preset, readTraining, saveTraining, trainingPool, trainingQuestions, trainingRecordKey } from '../../src/training';
import { defaults } from '../../src/storage';
import { Game } from '../../src/game';
import { voicePath } from '../../src/calculations';

describe('training banks and safe settings',()=>{
 it('limits both operands and the result and filters carrying/borrowing',()=>{
  const s=preset('mix'); s.add={min:5,max:100,carry:'with'}; s.subtract={min:5,max:100,carry:'without'};
  for(const op of ['add','subtract'] as const) {
   const pool=trainingPool(s,op); expect(pool.length).toBeGreaterThan(0);
   for(const q of pool) { expect(Math.min(q.a,q.b,q.result)).toBeGreaterThanOrEqual(5);expect(Math.max(q.a,q.b,q.result)).toBeLessThanOrEqual(100);expect(op==='add'?q.a%10+q.b%10>=10:q.a%10>=q.b%10).toBe(true); }
  }
  s.subtract.carry='with';expect(trainingPool(s,'subtract').every(q=>q.a%10<q.b%10)).toBe(true);
  s.add.carry='without';expect(trainingPool(s,'add').every(q=>q.a%10+q.b%10<10)).toBe(true);
 });
 it('selects exact tables, bounded multipliers and ordered distinct pairs',()=>{
  const s=preset('tables');s.tables=[3,7];s.multiplierMin=3;s.multiplierMax=7;s.length='all';
  const deck=trainingQuestions(s);expect(deck).toHaveLength(10);expect(new Set(deck.map(q=>q.a))).toEqual(new Set([3,7]));
  expect(deck.some(q=>q.a===3&&q.b===7)).toBe(true);expect(deck.some(q=>q.a===7&&q.b===3)).toBe(true);
 });
 it('allows zero only explicitly and never generates negatives',()=>{
  const s=preset('mix');expect(trainingPool(s,'subtract').every(q=>q.result>0&&q.b>0)).toBe(true);
  s.zero=true;expect(trainingPool(s,'subtract').some(q=>q.result===0)).toBe(true);expect(trainingPool(s,'subtract').every(q=>q.result>=0)).toBe(true);
  s.multiplierMin=0;expect(trainingPool(s,'multiply').some(q=>q.b===0)).toBe(true);
  s.zero=false;expect(trainingPool(s,'multiply').some(q=>q.b===0)).toBe(false);
 });
 it('redistributes small banks and supports all banks without duplicate questions',()=>{
  const s=preset('mix');s.tables=[7];s.multiplierMax=2;s.length=100;
  const deck=trainingQuestions(s);expect(deck.filter(q=>q.operation==='multiply')).toHaveLength(2);
  expect(deck.filter(q=>q.operation==='add')).toHaveLength(49);expect(new Set(deck.map(q=>q.id)).size).toBe(100);
  s.length='all';expect(trainingQuestions(s)).toHaveLength(inspectTraining(s).count);
 });
 it('rejects impossible selections instead of changing them or looping',()=>{
  const s=preset();s.add.min=20;s.zero=true;
  expect(inspectTraining(s).error).toContain('minimum');expect(()=>trainingQuestions(s)).toThrow();
  s.add.min=1;s.operations=[];expect(inspectTraining(s).error).toContain('opération');
  s.operations=['multiply'];s.tables=[];expect(()=>trainingQuestions(s)).toThrow();
  s.tables=[1];s.length=100;expect(inspectTraining(s).error).toContain('10 calculs');
 });
 it('imports legacy choices and protects independent settings, progress and records',()=>{
  const old={...defaults(),mode:'multiply' as const,tables:3,length:'all' as const};
  expect(importTraining(old)).toMatchObject({operations:['multiply'],tables:[1,2,3],duration:10,lives:3,length:'all'});
  const data=readTraining({getItem:()=>null},old);let raw='';
  let credited=awardMaterials(data,1,0);credited=awardMaterials(data,1,credited);awardMaterials(data,2,credited);
  expect(data.materials).toBe(2);expect(saveTraining({setItem:(_,value)=>{raw=value;}},data)).toBe(true);
  expect(readTraining({getItem:()=>raw})).toEqual(data);
  expect(saveTraining({setItem:()=>{throw Error();}},data)).toBe(false);
  expect(readTraining({getItem:()=>'{broken'}).settings).toEqual(preset());
 });
 it('keys records by effective settings rather than table order, voice or dormant fields',()=>{
  const a=preset('tables'),b=structuredClone(a);b.tables.reverse();b.voice='classic';b.add.max=100;
  expect(trainingRecordKey(a)).toBe(trainingRecordKey(b));b.multiplierMax=5;expect(trainingRecordKey(a)).not.toBe(trainingRecordKey(b));
 });
 it('runs a no-time-limit session with zero and 100 and keeps pause out of elapsed time',()=>{
  const questions=[{operation:'add' as const,a:50,b:50,result:100,id:'one'},{operation:'subtract' as const,a:7,b:7,result:0,id:'two'}];
  const game=new Game(defaults(),Math.random,()=>true,{questions,untimed:true,unlimitedLives:true});
  game.start(0);game.tick(4000);game.pause(5000);game.resume(15000);game.tick(19000);
  for(const d of '100') game.digit(d,20000);
  expect(game.elapsed(20000)).toBe(2000);game.tick(20650);game.digit('9',21000);expect(game.lives).toBe(3);game.tick(23000);game.digit('0',24000);expect(game.phase).toBe('victory');
 });
 it('keeps bundled narration and composes only new calculations',()=>{
  expect(voicePath({operation:'add',a:10,b:5})).toBe('/voice/fr/add/10-5.wav');
  expect(voicePath({operation:'add',a:53,b:27})).toBe('/voice/fr/composed/add/53-27');
  expect(voicePath({operation:'multiply',a:3,b:0})).toBe('/voice/fr/composed/multiply/3-0');
 });
});
