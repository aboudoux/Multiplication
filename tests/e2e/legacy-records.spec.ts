import {test,expect} from '@playwright/test';
import {STORAGE_KEY,defaults} from '../../src/storage';

for(const width of [390,768,1365]) test(`legacy records table is readable and preserves scores at ${width}px`,async({page},info)=>{
 const saved={...defaults(),muted:true,records:{
  'add-0-20-10-3':{timeMs:50000,mistakes:1,date:'2026-09-01'},
  'subtract-0-20-15-3':{timeMs:48000,mistakes:1,date:'2026-09-01'},
  'add-0-20-15-3':{timeMs:53000,mistakes:0,date:'2026-09-01'},
  'add-0-20-15-6':{timeMs:163000,mistakes:2,date:'2026-09-01'},
  'multiply-7-20-30-6':{timeMs:50000,mistakes:3,date:'2026-09-01'},
  'multiply-6-20-30-3':{timeMs:48000,mistakes:1,date:'2026-09-01'},
  'multiply-1-10-30-3':{timeMs:12000,mistakes:0,date:'2026-09-01'}
 }};
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key:STORAGE_KEY,saved});
 await page.goto('/');await page.locator('#open-training').click();await page.locator('[data-tab="colony"]').click();
 await page.getByText('Mes anciens records de partie libre',{exact:true}).click();
 const table=page.getByRole('table');await expect(table).toBeVisible();await expect(table.locator('tbody tr')).toHaveCount(7);
 await expect(table.getByRole('columnheader')).toHaveText(['Séance','Temps','Erreurs']);
 await expect(table.locator('tbody tr').first().locator('td')).toHaveText(['0:50','1']);
 await expect(table.locator('tbody tr').last()).toContainText('10 calculs · 1 table');
 await expect(table).not.toContainText('0 tables');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),STORAGE_KEY)).toEqual(saved);
 await table.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('records.png')});
});

test('no old records shows a simple empty message',async({page})=>{
 await page.goto('/');await page.locator('#open-training').click();await page.locator('[data-tab="colony"]').click();
 await page.getByText('Mes anciens records de partie libre',{exact:true}).click();
 await expect(page.getByText('Aucun ancien record enregistré.')).toBeVisible();
 await expect(page.getByRole('table')).toHaveCount(0);
});
