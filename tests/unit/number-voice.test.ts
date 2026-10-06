import {it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {grades} from '../../src/curriculum';
import {mentalPatterns} from '../../src/mental-patterns';
import {mentalFacts} from '../../src/mental-generator';
import {numberTokens,tokensText} from '../../src/study-speech';

it.each(grades)('%s : chaque nombre du parcours mental possède une annonce continue',grade=>{
 const numbers=new Set<string>();
 for(const p of mentalPatterns)for(let level=0;level<=p.maxLevel;level++)
  for(const q of mentalFacts(p.id,grade,level))for(const raw of q.prompt.match(/\d+(?:[.,]\d+)?/g)??[])numbers.add(raw);
 for(const raw of numbers){
  const tokens=numberTokens(raw);expect(tokens,raw).toHaveLength(1);
  expect(existsSync(`public/voice/fr/tokens/${tokens[0]}.wav`),raw).toBe(true);
 }
 expect(tokensText(['500','multiply','0d25'])).toBe('500 fois 0,25');
});
