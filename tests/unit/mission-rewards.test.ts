import { describe, expect, test } from 'vitest';
import { adventures } from '../../src/adventure';
import { missionRewards, MISSION_REWARD_MS } from '../../src/mission-rewards';
import { Game, VICTORY_DURATION_MS } from '../../src/game';
import { defaults } from '../../src/storage';
import { createPool } from '../../src/calculations';

const stages=adventures.flatMap(a=>a.stages);
describe('mission reward stories',()=>{
 test('all 48 missions have a unique story and valid complete animation timelines',()=>{
  expect(Object.keys(missionRewards).sort()).toEqual(stages.map(s=>s.id).sort());
  expect(new Set(Object.values(missionRewards).map(r=>r.title)).size).toBe(48);
  for(const stage of stages){
   const reward=missionRewards[stage.id];
   expect(reward.captions).toHaveLength(3);
   expect(reward.actors.some(a=>a.name===stage.world.id)).toBe(true);
   for(const actor of reward.actors){
    const times=actor.poses.map(p=>p[0]);
    expect(times[0]).toBe(0);expect(times.at(-1)).toBe(10);
    expect(times).toEqual([...times].sort((a,b)=>a-b));
    expect(actor.art).toBeTruthy();
   }
  }
 });
 test('reward lasts ten visible seconds, locks input and excludes its duration from answering time',()=>{
  const game=new Game(defaults(),Math.random,()=>true,{questions:createPool('add',1).slice(0,1),untimed:true,unlimitedLives:true,victoryDurationMs:MISSION_REWARD_MS});
  game.start(0);game.tick(4000);
  for(const d of String(game.current!.result))game.digit(d,4500);
  expect(game.phase).toBe('victory');expect(game.elapsed(4500)).toBe(500);
  game.digit('9',5000);expect(game.mistakes).toBe(0);
  game.suspendCelebration(7500);game.suspendCelebration(9000);game.tick(90000);
  expect(game.phase).toBe('victory');expect(game.victoryElapsed(90000)).toBe(3000);
  game.resumeCelebration(90000);game.tick(96999);expect(game.phase).toBe('victory');
  game.tick(97000);expect(game.phase).toBe('finished');expect(game.elapsed(97000)).toBe(500);
  expect(new Game(defaults()).victoryDuration).toBe(VICTORY_DURATION_MS);
 });
});
