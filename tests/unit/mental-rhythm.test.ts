import {it,expect} from 'vitest';
import {mentalTrainingRhythm} from '../../src/mental-rhythm';
import {adaptedAdventure} from '../../src/adaptive-adventure';
import {adventures,adventureDurations,adventureLives} from '../../src/adventure';
import {grades} from '../../src/curriculum';
import {mapMarkup} from '../../src/adventure-map';

it('la difficulté du camp réduit le temps et les vies',()=>{
 expect(mentalTrainingRhythm(0)).toEqual({duration:null,lives:null});
 expect(mentalTrainingRhythm(1)).toEqual({duration:15,lives:5});
 expect(mentalTrainingRhythm(2)).toEqual({duration:10,lives:3});
 expect(()=>mentalTrainingRhythm(3)).toThrow();
});
 it.each(grades)('%s : la découverte adaptée ne modifie pas les chronos classiques',grade=>{
 for(const original of adventures){
   const adapted=adaptedAdventure(original,grade);
  expect(adapted.worlds.map(w=>adventureDurations[w.id])).toEqual([null,30,30,15,15,10,10,10]);
  expect(adapted.worlds.map(w=>adventureLives[w.id])).toEqual([null,7,7,5,5,3,3,3]);
   expect(adapted.stages[0].study!.policy!.discovery).toBe(true);
   expect(adapted.stages[0].study!.policy!.timeLimits).toEqual({factMs:null,strategyMs:null});
   const map=mapMarkup({completed:[]},true,original);
  for(const text of ['Sans chrono','30 s par calcul','15 s par calcul','10 s par calcul','7 vies par mission','5 vies par mission','3 vies par mission'])expect(map).toContain(text);
 }
});
