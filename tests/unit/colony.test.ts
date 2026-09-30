import {describe,it,expect} from 'vitest';
import {awardMaterials,buildColony,buildingCosts,colonyStatus,preset,readTraining,saveTraining,type TrainingData} from '../../src/training';
const fresh=():TrainingData=>readTraining({getItem:()=>null});
describe('manual colony construction',()=>{
 it('requires more materials and does not build when they are earned',()=>{
  const data=fresh();awardMaterials(data,59,0);expect(buildColony(data)).toBe(false);
  awardMaterials(data,60,59);expect(colonyStatus(data)).toMatchObject({built:0,stock:60,missing:0,cost:60});
  expect(buildColony(data)).toBe(true);expect(colonyStatus(data)).toMatchObject({built:1,stock:0,cost:90});
  expect(buildColony(data)).toBe(false);expect(data.materials).toBe(60);
 });
 it('spends the progressive costs once per action and retains surplus',()=>{
  const data=fresh();data.materials=buildingCosts.reduce((a,b)=>a+b,0)+17;
  for(let built=1;built<=6;built++) {expect(buildColony(data)).toBe(true);expect(colonyStatus(data).built).toBe(built);}
  expect(colonyStatus(data)).toMatchObject({stock:17,built:6,spent:990,stars:0,cost:300});
  expect(buildColony(data)).toBe(false);data.materials+=283;expect(buildColony(data)).toBe(true);
  expect(colonyStatus(data)).toMatchObject({built:6,stars:1,stock:0,spent:1290});
 });
 it('keeps legacy automatic buildings, stars and unspent materials without remigrating',()=>{
  for(const [materials,built,stars,stock] of [[45,2,0,5],[119,5,0,19],[147,6,1,7]]) {
   const data=readTraining({getItem:()=>JSON.stringify({settings:preset(),materials,records:{}})});
   expect(colonyStatus(data)).toMatchObject({built,stars,stock});
   let raw='';expect(saveTraining({setItem:(_,value)=>{raw=value;}},data)).toBe(true);
   const reread=readTraining({getItem:()=>raw});expect(reread).toEqual(data);
   awardMaterials(reread,100,0);expect(colonyStatus(reread).built).toBe(built);
  }
 });
 it('persists a clicked construction and preserves the independent settings and records',()=>{
  const data=fresh();data.materials=64;data.records.example={timeMs:1200,mistakes:1};
  const settings=structuredClone(data.settings);buildColony(data);let raw='';saveTraining({setItem:(_,value)=>{raw=value;}},data);
  const reread=readTraining({getItem:()=>raw});expect(colonyStatus(reread)).toMatchObject({built:1,stock:4});
  expect(reread.settings).toEqual(settings);expect(reread.records).toEqual(data.records);
 });
 it('rejects malformed spending without losing earned materials',()=>{
  const data=readTraining({getItem:()=>JSON.stringify({settings:preset(),materials:70,records:{},colony:{built:9,spent:80,stars:-1}})});
  expect(colonyStatus(data)).toMatchObject({built:0,stock:70,spent:0,stars:0});
 });
});
