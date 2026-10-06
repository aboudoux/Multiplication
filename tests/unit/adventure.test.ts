import { describe, expect, test } from 'vitest';
import { ADVENTURE_KEY, worlds, stages, stageUnlocked, worldUnlocked, completeStage, readAdventure, saveAdventure, adventureQuestions } from '../../src/adventure';
import { Game } from '../../src/game';
import { defaults, recordKey } from '../../src/storage';

describe('the kitten adventure', () => {
 test('important characters require every multiplication, including inverses and 10 × 10', () => {
  for(const id of ['wizard-3','dragon-3','star-3']) {
   const stage=stages.find(s=>s.id===id)!;
   const deck=adventureQuestions(stage,()=>.5);
   const multiplications=deck.filter(q=>q.operation==='multiply');
   expect(multiplications).toHaveLength(stage.tables*10);
   for(let a=1;a<=stage.tables;a++) for(let b=1;b<=10;b++) expect(multiplications.some(q=>q.a===a&&q.b===b)).toBe(true);
  }
  const final=adventureQuestions(stages.at(-1)!);
  expect(final.filter(q=>q.operation==='add')).toHaveLength(20);
  expect(final.filter(q=>q.operation==='subtract')).toHaveLength(20);
  expect(()=>adventureQuestions({...stages[0],count:999})).toThrow(RangeError);
 });
 test('the dragon is won only after all 100 unique pairs, including a corrected mistake', () => {
  const stage=stages.find(s=>s.id==='dragon-3')!;
  const game=new Game(defaults(),()=>.5,()=>true,{questions:adventureQuestions(stage,()=>.5),untimed:true,unlimitedLives:true});
  game.start(0);let now=4000;game.tick(now);
  const failed=game.current!.id;
  for(const digit of '0'.repeat(String(game.current!.result).length))game.digit(digit,++now);
  game.tick(now+=2000);
  const seen=new Set<string>();
  for(let n=0;n<100;n++) {
   expect(game.phase).toBe('question');expect(seen.has(game.current!.id)).toBe(false);
   seen.add(game.current!.id);
   if(n===99)expect(game.current!.id).toBe(failed);
   for(const digit of String(game.current!.result))game.digit(digit,++now);
   if(n<99)game.tick(now+=650);
  }
  expect(game.phase).toBe('victory');expect(seen.size).toBe(100);
 });
 test('24 short missions, a garden first, then two independent branches', () => {
  const progress = {completed:[] as string[]};
  expect(stages).toHaveLength(24);
  expect(stages.filter(s=>stageUnlocked(progress,s)).map(s=>s.id)).toEqual(['kitten-1']);
  expect(completeStage(progress,stages[5])).toBe(false);
  stages.slice(0,3).forEach(s=>expect(completeStage(progress,s)).toBe(true));
  expect(worlds.filter(w=>worldUnlocked(progress,w)).map(w=>w.id)).toEqual(['kitten','unicorn','alien']);
  stages.slice(3,6).forEach(s=>completeStage(progress,s));
  expect(worldUnlocked(progress,worlds[3])).toBe(false);
  stages.slice(6,9).forEach(s=>completeStage(progress,s));
  expect(worldUnlocked(progress,worlds[3])).toBe(true);
  expect(worldUnlocked(progress,worlds[4])).toBe(true);
  expect(completeStage(progress,stages[0])).toBe(false);
 });
 test('each mission has distinct, age-appropriate calculations and balanced operations', () => {
  for(const stage of stages) {
   const deck=adventureQuestions(stage,()=>.5);
   expect(deck).toHaveLength(stage.count);
   expect(new Set(deck.map(q=>q.id)).size).toBe(stage.count);
   expect(stage.count).toBeGreaterThanOrEqual(5); expect(stage.count).toBeLessThanOrEqual(140);
   for(const q of deck) {
    expect(stage.operations).toContain(q.operation);
    expect(q.a).toBeGreaterThan(0); expect(q.b).toBeGreaterThan(0); expect(q.result).toBeGreaterThan(0);
    if(q.operation==='multiply') expect(q.a).toBeLessThanOrEqual(stage.tables);
    else for(const n of [q.a,q.b,q.result]) expect(n).toBeLessThanOrEqual(stage.limit);
   }
   const counts=stage.operations.map(op=>deck.filter(q=>q.operation===op).length);
   if(stage.quotas) expect(counts).toEqual(stage.operations.map(op=>stage.quotas![op]));
   else expect(Math.max(...counts)-Math.min(...counts)).toBeLessThanOrEqual(1);
  }
 });
 test('persistence validates dependencies, ignores duplicates and tolerates corrupt/blocked storage', () => {
  const map=new Map<string,string>(); const storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};
  const progress={completed:[] as string[]};
  stages.forEach(s=>completeStage(progress,s));
  expect(saveAdventure(storage,progress)).toBe(true);
  expect(readAdventure(storage)).toEqual(progress);
  map.set(ADVENTURE_KEY,JSON.stringify({completed:['kitten-1','kitten-1','kitten-3','star-3','evil']}));
  expect(readAdventure(storage).completed).toEqual(['kitten-1']);
  map.set(ADVENTURE_KEY,'{broken'); expect(readAdventure(storage).completed).toEqual([]);
  expect(saveAdventure({setItem(){throw new Error();}},progress)).toBe(false);
 });
 test('practice waits indefinitely, retries errors, survives pause and reaches victory without touching free rules', () => {
  const settings=defaults(), initialKey=recordKey(settings), deck=adventureQuestions(stages[0],()=>.5);
  const game=new Game(settings,()=>.5,()=>true,{questions:deck,untimed:true,unlimitedLives:true});
  let now=0; game.start(now); game.tick(now=4000);
  game.tick(now=100000); expect(game.phase).toBe('question'); expect(game.mistakes).toBe(0);
  for(let i=0;i<5;i++) { game.digit('9',++now); expect(game.phase).toBe('feedback'); game.tick(now+=2000); }
  expect(game.lives).toBe(3); expect(game.mistakes).toBe(5); expect(game.solved).toBe(0);
  game.pause(++now); game.resume(now+=1000); game.tick(now+=4000);
  expect(game.timeLeft(now)).toBe(Infinity);
  while(game.phase==='question') { for(const d of String(game.current!.result)) game.digit(d,++now); if(game.solved<game.totalQuestions)game.tick(now+=650); }
  expect(game.phase).toBe('victory'); expect(game.solved).toBe(5);
  expect(recordKey(settings)).toBe(initialKey);
  const free=new Game(settings); free.start(0);free.tick(4000);free.tick(14000);
  expect(free.lives).toBe(2);expect(free.mistakes).toBe(1);
 });
});
