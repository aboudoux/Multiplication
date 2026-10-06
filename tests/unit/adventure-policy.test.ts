import {describe,it,expect} from 'vitest';
import {grades} from '../../src/curriculum';
import {adventureDifficulties,adventureRequestedCount,adventureQuestionLevel,adventureLivesFor,adventureTimeLimits,validateAdventurePractice,adventureRulesLabel} from '../../src/adventure-policy';
import {adaptedAdventure,resolveAdventureMission} from '../../src/adaptive-adventure';
import {adventures} from '../../src/adventure';

describe('politique annoncée des aventures',()=>{
 it('reprend les quotas nominaux de l’étude pour les onze classes',()=>{
  const totals=[224,305,368,382,382,382,341,341,341,341,341];
  grades.forEach((grade,i)=>expect(Array.from({length:8},(_,world)=>[0,1,2].reduce((sum,phase)=>sum+adventureRequestedCount(grade,'normal',world,phase),0)).reduce((a,b)=>a+b,0)).toBe(totals[i]));
  expect([0,1,2].map(phase=>adventureRequestedCount('CP','easy',0,phase))).toEqual([5,6,8]);
  expect([0,1,2].map(phase=>adventureRequestedCount('CE2','expert',7,phase))).toEqual([24,29,36]);
 });
 it('sépare classe, choix manuel, niveaux bornés et pression',()=>{
  for(const difficulty of adventureDifficulties){const expected=difficulty==='easy'?[0,0,1]:difficulty==='normal'?[0,1,1]:[1,2,2];expect([0,1,2].map(phase=>adventureQuestionLevel(difficulty,phase,'tables'))).toEqual(expected);}
  expect(adventureQuestionLevel('expert',2,'cube')).toBe(0);expect(adventureQuestionLevel('expert',2,'root')).toBe(1);
  expect(adventureLivesFor('normal',30)).toBe(6);expect(adventureLivesFor('expert',36)).toBe(4);
  expect(adventureLivesFor('expert',36,true)).toBeNull();expect(adventureLivesFor('easy',30)).toBeNull();
  expect(adventureTimeLimits('CP','normal')).toEqual({factMs:20000,strategyMs:30000});expect(adventureTimeLimits('CE1','expert')).toEqual({factMs:15000,strategyMs:20000});
  for(const difficulty of adventureDifficulties)expect(adventureTimeLimits('GS',difficulty)).toEqual({factMs:null,strategyMs:null});
 });
 it('normalise les seuls historiques valides sans ajouter de notions',()=>{
  expect(validateAdventurePractice({GS:{'small-add':0,'add':2},'5e':{cube:2,priority:1,unknown:0},CP:{add:4,subtract:-1,double:'1'},unknown:{add:0}})).toEqual({GS:{'small-add':0},'5e':{cube:0,priority:1}});
  expect(validateAdventurePractice(null)).toEqual({});expect(validateAdventurePractice([])).toEqual({});
 });
 it('les textes annoncent les règles de la mission résolue',()=>{
  expect(adventureRulesLabel(adaptedAdventure(adventures[0],'CP').stages[0].study!.policy!)).toBe('Sans chrono · Essais illimités');
  const known=adaptedAdventure(adventures[0],'CP','normal',{CP:{add:0,subtract:0}}).stages[4],resolved=resolveAdventureMission(known,{CP:{add:0,subtract:0}},()=>.5);
  expect(adventureRulesLabel(resolved.policy)).toContain('5 vies par mission');
  expect(adventureRulesLabel(adaptedAdventure(adventures[0],'CP').stages.at(-1)!.study!.policy!)).toContain('Découvre d’abord');
 });
});
