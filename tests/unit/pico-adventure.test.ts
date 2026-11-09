import {describe,expect,test} from 'vitest';
import {adventures,chatonAdventure,picoAdventure,stages,worlds,completeStage,stageUnlocked,worldUnlocked,worldFinished,readAdventure,saveAdventure,resetAdventure,adventureQuestions,adventureDurations,adventureLives,type AdventureProgress} from '../../src/adventure';
import {picoCast} from '../../src/pico-content';
import {picoRewards} from '../../src/pico-rewards';
import {themes} from '../../src/themes';
import {lighthouseChapter,LIGHTHOUSE_DURATION_MS} from '../../src/lighthouse-party';
import {readFileSync} from 'node:fs';

const rgb=(hex:string)=>hex.match(/[a-f\d]{2}/gi)!.map(v=>parseInt(v,16));
const luminance=(values:number[])=>values.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast=(a:number[],b:number[])=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

describe('two independent adventures',()=>{
 test('historical exports and keys remain compatible',()=>{
  expect(chatonAdventure.stages).toBe(stages);expect(chatonAdventure.worlds).toBe(worlds);
  expect(adventures.map(a=>a.storageKey)).toEqual(['calcul-party:adventure:v1','calcul-party:adventure:pico:v1']);
  expect(new Set(adventures.flatMap(a=>a.stages.map(s=>s.id))).size).toBe(48);
  for(const a of adventures)expect(Object.keys(a.rewards).sort()).toEqual(a.stages.map(s=>s.id).sort());
 });
 for(const adventure of adventures) test(`${adventure.id}: sequential missions, two branches per tier and replay`,()=>{
  const p:AdventureProgress={completed:[]};
  expect(stageUnlocked(p,adventure.stages[0],adventure)).toBe(true);
  expect(completeStage(p,adventure.stages[1],adventure)).toBe(false);
  for(const tier of [0,1,2,3,4]){
   const islands=adventure.worlds.filter(w=>w.tier===tier);
   for(const island of islands){
    expect(worldUnlocked(p,island,adventure)).toBe(true);
    for(const stage of adventure.stages.filter(s=>s.world.id===island.id)){
     expect(completeStage(p,stage,adventure)).toBe(true);
     expect(completeStage(p,stage,adventure)).toBe(false);
    }
    expect(worldFinished(p,island.id,adventure)).toBe(true);
    const next=adventure.worlds.find(w=>w.tier===tier+1);
    if(next)expect(worldUnlocked(p,next,adventure)).toBe(islands.every(w=>worldFinished(p,w.id,adventure)));
   }
  }
  expect(p.completed).toHaveLength(24);
  const other=adventures.find(a=>a.id!==adventure.id)!;
  expect(worldFinished(p,other.hero,adventure)).toBe(false);
  expect(completeStage(p,other.stages[0],adventure)).toBe(false);
 });
 test('every Pico bank preserves the corresponding educational rules and final quotas',()=>{
  expect(picoAdventure.worlds).toHaveLength(8);expect(picoCast).toHaveLength(8);
  for(const [i,stage] of picoAdventure.stages.entries()){
   const original=stages[i],bank=adventureQuestions(stage,()=>.42);
   expect([stage.count,stage.operations,stage.limit,stage.tables,stage.quotas]).toEqual([original.count,original.operations,original.limit,original.tables,original.quotas]);
   expect(adventureDurations[stage.world.id]).toBe(adventureDurations[original.world.id]);
   expect(adventureLives[stage.world.id]).toBe(adventureLives[original.world.id]);
   expect(bank).toHaveLength(stage.count);expect(new Set(bank.map(q=>q.id)).size).toBe(stage.count);
   expect(bank.every(q=>q.result>=0&&stage.operations.includes(q.operation))).toBe(true);
   expect(bank.every(q=>q.operation==='multiply'?q.a<=stage.tables&&q.b<=10:q.a<=stage.limit&&q.b<=stage.limit&&q.result<=stage.limit)).toBe(true);
   if(stage.quotas)expect(Object.fromEntries(stage.operations.map(op=>[op,bank.filter(q=>q.operation===op).length]))).toEqual({add:20,subtract:20,multiply:100});
  }
 });
 test('saving, reloading and resetting only touch the selected adventure',()=>{
  const data=new Map<string,string>([['camp','untouched']]);
  const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);},removeItem:(key:string)=>{data.delete(key);}};
  for(const a of adventures){const p={completed:a.stages.slice(0,3).map(s=>s.id)};expect(saveAdventure(storage,p,a)).toBe(true);expect(readAdventure(storage,a)).toEqual(p);}
  resetAdventure(storage,picoAdventure);expect(readAdventure(storage,picoAdventure).completed).toEqual([]);
  expect(readAdventure(storage).completed).toHaveLength(3);expect(data.get('camp')).toBe('untouched');
 });
 test('corrupt, foreign, duplicated, out-of-order and blocked saves are safe',()=>{
  for(const a of adventures){
   expect(readAdventure({getItem:()=>'{broken'},a).completed).toEqual([]);
   expect(readAdventure({getItem:()=>JSON.stringify({completed:[a.stages[23].id,'unknown',a.stages[0].id,a.stages[0].id]})},a).completed).toEqual([a.stages[0].id]);
   const other=adventures.find(x=>x.id!==a.id)!;
   expect(readAdventure({getItem:()=>JSON.stringify({completed:other.stages.map(s=>s.id)})},a).completed).toEqual([]);
   expect(readAdventure({getItem:()=>{throw Error('blocked');}},a).completed).toEqual([]);
   expect(saveAdventure({setItem:()=>{throw Error('blocked');}},{completed:[]},a)).toBe(false);
   expect(resetAdventure({removeItem:()=>{throw Error('blocked');}},a)).toBe(false);
  }
 });
 test('Pico has two object surprises, consistent identity and a separate 30-second finale',()=>{
  expect(Object.keys(picoRewards)).toHaveLength(24);
  for(const c of picoCast){const t=themes[c.id];expect(t.voices).toEqual(['classic']);expect(t.surprises).toHaveLength(2);expect(t.home).toContain(`sprite-${c.id}`);expect(t.surprises[0].artwork).toContain('data-pico-cell="6"');expect(t.surprises[1].artwork).toContain('data-pico-cell="7"');}
  expect(LIGHTHOUSE_DURATION_MS).toBe(30000);
  expect([0,7000,17000,22000,30000].map(lighthouseChapter)).toEqual(['arrival','assembly','light','boats','finished']);
 });
 test('cream and secondary text, panels and accent buttons retain readable contrast',()=>{
  for(const c of picoCast){
   const board=rgb(c.board),panel=board.map((v,i)=>v*.75+rgb('#08121F')[i]*.25);
   for(const text of ['#FFF6E6','#A6EEEA','#E5EBE8']){
    expect(contrast(rgb(text),board),`${c.id} on board`).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb(text),panel),`${c.id} on panel`).toBeGreaterThanOrEqual(4.5);
   }
   expect(contrast(rgb('#182C45'),rgb(c.color))).toBeGreaterThanOrEqual(4.5);
  }
 });
 test('the bundled finale soundtrack has thirty seconds of audible PCM and a complete final applause',()=>{
  const wav=readFileSync(new URL('../../public/audio/pico-finale.wav',import.meta.url));
  expect(wav.toString('ascii',0,4)).toBe('RIFF');expect(wav.toString('ascii',8,12)).toBe('WAVE');
  const rate=wav.readUInt32LE(24),bytes=wav.readUInt32LE(40);
  expect(bytes/(rate*2)).toBe(30);expect(wav.readUInt16LE(22)).toBe(1);
  for(const seconds of [1,8,17,23,28]){
   let energy=0;for(let i=seconds*rate;i<(seconds+1)*rate;i++)energy+=wav.readInt16LE(44+i*2)**2;
   expect(Math.sqrt(energy/rate)).toBeGreaterThan(500);
  }
 });
});
