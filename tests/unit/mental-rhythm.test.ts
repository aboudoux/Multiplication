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
it.each(grades)('%s : les deux aventures gardent la progression de chrono et de vies',grade=>{
 for(const original of adventures){
  const adapted={...adaptedAdventure(original,grade,{}),mentalDuration:10};
  expect(adapted.worlds.map(w=>adventureDurations[w.id])).toEqual([null,30,30,15,15,10,10,10]);
  expect(adapted.worlds.map(w=>adventureLives[w.id])).toEqual([null,7,7,5,5,3,3,3]);
  const map=mapMarkup({completed:[]},true,adapted);
  for(const text of ['Sans chrono','30 s par calcul','15 s par calcul','10 s par calcul','7 vies par mission','5 vies par mission','3 vies par mission'])expect(map).toContain(text);
 }
});
