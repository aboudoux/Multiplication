import {describe,it,expect} from 'vitest';
import {mentalFacts} from '../../src/mental-generator';
import {mentalPatterns} from '../../src/mental-patterns';
import type {Grade} from '../../src/curriculum';

const question=(id:string,prompt:string,level=0,grade:Grade='2de')=>{
 const result=mentalFacts(id,grade,level).find(q=>q.prompt===prompt);
 if(!result)throw new Error(`Calcul absent : ${id}, ${prompt}`);
 return result;
};

describe('métadonnées pédagogiques des calculs mentaux',()=>{
 it('donne un rythme et une bande explicites à chaque fait généré',()=>{
  for(const pattern of mentalPatterns)for(let level=0;level<=pattern.maxLevel;level++){
   for(const q of mentalFacts(pattern.id,'2de',level)){
    expect(['fact','strategy'],`${pattern.id} : ${q.prompt}`).toContain(q.pace);
    expect(['accessible','core','challenging'],`${pattern.id} : ${q.prompt}`).toContain(q.band);
   }
  }
 });
 it('distingue la récupération de faits d’une stratégie, même à résultat court',()=>{
  for(const id of ['tables','divide','double','half','square','cube','root']){
   for(const q of mentalFacts(id,'2de',0))expect(q.pace).toBe('fact');
  }
  expect(question('add','4 + 3').pace).toBe('fact');
  expect(question('subtract','7 − 2').pace).toBe('fact');
  expect(question('add','8 + 4',1).pace).toBe('strategy');
  expect(question('subtract','10 − 3').pace).toBe('strategy');
  expect(question('add','15 + 2',1).pace).toBe('strategy');
  for(const id of ['small-complement','missing','fraction-picture','fraction-compare','fraction-add','fraction-of','fraction-multiply','fraction-reduce','decimal-add','decimal-scale','decimal-divide','decimal-multiply','signed-add','signed-multiply','priority','equation-one','function']){
   for(const q of mentalFacts(id,'2de',0))expect(q.pace).toBe('strategy');
  }
 });
 it('repère les points d’appui, les faits centraux et les difficultés de stratégie',()=>{
  expect(question('tables','2 × 2',2).band).toBe('accessible');
  expect(question('tables','2 × 8',2).band).toBe('core');
  expect(question('tables','7 × 8',2).band).toBe('challenging');
  expect(question('add','8 + 4',1).band).toBe('challenging');
  expect(question('signed-add','3 − (-2)',1).band).toBe('challenging');
  expect(question('priority','(1 + 1) × 1',2).band).toBe('accessible');
  expect(question('priority','(3 + 4) × 8',2).band).toBe('challenging');
  expect(new Set(mentalFacts('priority','5e',2).map(q=>q.band))).toEqual(new Set(['accessible','core','challenging']));
 });
 it('groupe les produits miroirs par opérandes, sans regrouper tous les résultats égaux',()=>{
  expect(question('tables','3 × 7',2).commutativeKey).toBe(question('tables','7 × 3',2).commutativeKey);
  expect(question('tables','2 × 6',2).commutativeKey).not.toBe(question('tables','3 × 4',2).commutativeKey);
  expect(question('signed-multiply','(-2) × (3)',2).commutativeKey).toBe(question('signed-multiply','(3) × (-2)',2).commutativeKey);
  expect(question('signed-multiply','(-2) × (3)',2).commutativeKey).not.toBe(question('signed-multiply','(2) × (-3)',2).commutativeKey);
 });
 it('normalise les opérandes rationnels et conserve le sens des divisions',()=>{
  expect(question('fraction-multiply','1/2 × 1/3').commutativeKey).toBe(question('fraction-multiply','1/3 × 1/2').commutativeKey);
  expect(question('fraction-multiply','2/2 × 2/4',2).commutativeKey).toBe(question('decimal-multiply','0,5 × 1',2).commutativeKey);
  expect(question('decimal-multiply','2 × 5').commutativeKey).toBe(question('tables','2 × 5').commutativeKey);
  for(const id of ['divide','decimal-divide'])for(const q of mentalFacts(id,'2de',2))expect(q.commutativeKey).toBeUndefined();
 });
 it('conserve les petites banques et les cinq cubes usuels à tous les paliers',()=>{
  expect([0,1,2].map(level=>mentalFacts('double','CP',level).length)).toEqual([10,5,6]);
  expect([0,1,2].map(level=>mentalFacts('large-multiply','CM1',level).length)).toEqual([60,36,7]);
  for(const level of [0,1,2]){
   const cubes=mentalFacts('cube','5e',level);
   expect(cubes.map(q=>q.answer)).toEqual([0,1,8,27,1000].map(value=>({kind:'integer',value})));
   expect(cubes.map(q=>q.prompt)).toEqual(['0³','1³','2³','3³','10³']);
  }
 });
});
