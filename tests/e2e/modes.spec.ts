import {test,expect} from '@playwright/test';
import {prepareCamp,startCamp,solve,enterCamp} from './helpers';
import {type Operation} from '../../src/calculations';
import {STORAGE_KEY,defaults} from '../../src/storage';
for(const operations of [['add'],['subtract'],['multiply'],['add','subtract'],['add','multiply'],['subtract','multiply'],['add','subtract','multiply']] as Operation[][])test(`${operations.join('+')}: distinct questions, balanced banks and complete session`,async({page})=>{
 await prepareCamp(page,{operations,length:20,duration:30,lives:3});await startCamp(page);const seen=new Set<string>();const counts:Record<string,number>={};
 for(let i=0;i<20;i++){const q=await solve(page);expect(seen.has(q.label)).toBe(false);seen.add(q.label);const op=q.label.includes('plus')?'add':q.label.includes('moins')?'subtract':'multiply';expect(operations).toContain(op);counts[op]=(counts[op]??0)+1;}
 expect(Math.max(...Object.values(counts))-Math.min(...Object.values(counts))).toBeLessThanOrEqual(1);await page.clock.runFor(6100);await expect(page.locator('#result-solved')).toHaveText('20');
});
test('legacy records remain consultable and settings import without changing original storage',async({page})=>{
 const old={...defaults(),mode:'multiply',tables:2,length:'all',duration:15,lives:4,records:{'multiply-2-20-15-4':{timeMs:12345,mistakes:0,date:'2026-09-01'}}};
 await page.addInitScript(({key,old})=>localStorage.setItem(key,JSON.stringify(old)),{key:STORAGE_KEY,old});await page.goto('/');await enterCamp(page);
 await expect(page.locator('#camp-length-all')).toBeChecked();await expect(page.locator('#camp-table-2')).toBeChecked();await expect(page.locator('#camp-table-3')).not.toBeChecked();await expect(page.locator('#camp-life-4')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-tab="colony"]').click();await page.locator('summary').click();await expect(page.locator('#training')).toContainText('0:12');
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),STORAGE_KEY)).toEqual(old);
});
