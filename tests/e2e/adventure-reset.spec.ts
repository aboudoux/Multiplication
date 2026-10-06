import { expect,test } from '@playwright/test';
import { ADVENTURE_KEY,stages } from '../../src/adventure';
import { defaults,STORAGE_KEY } from '../../src/storage';

async function seed(page:import('@playwright/test').Page){
 await page.addInitScript(({key,adventureKey,saved,completed})=>{
  if(!localStorage.getItem('reset-test-seeded')){
   localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem(adventureKey,JSON.stringify({completed}));
   localStorage.setItem('unrelated-data','keep');localStorage.setItem('reset-test-seeded','yes');
  }
 },{key:STORAGE_KEY,adventureKey:ADVENTURE_KEY,saved:{...defaults(),theme:'dragon',duration:15,muted:true},completed:stages.map(s=>s.id)});
 await page.goto('/');await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
}
test('cancel preserves progress; confirm resets missions only and survives reload',async({page},info)=>{
 await page.setViewportSize({width:390,height:900});await seed(page);
 const free=await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY);
 page.once('dialog',dialog=>dialog.dismiss());await page.locator('#reset-adventure').click();
 await expect(page.locator('.friend-invited')).toHaveCount(8);
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).completed.length,ADVENTURE_KEY)).toBe(24);
 page.once('dialog',dialog=>dialog.accept());await page.locator('#reset-adventure').click();
 await expect(page.locator('.adventure-save')).toContainText('réinitialisées');
 await expect(page.locator('.friend-invited')).toHaveCount(0);
 await expect(page.locator('[data-stage="kitten-1"]')).toBeEnabled();
 await expect(page.locator('[data-stage="kitten-2"]')).toBeDisabled();
 await expect(page.locator('[data-stage="unicorn-1"]')).toBeDisabled();
 expect(await page.evaluate(key=>localStorage.getItem(key),ADVENTURE_KEY)).toBeNull();
 expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBe(free);
 expect(await page.evaluate(()=>localStorage.getItem('unrelated-data'))).toBe('keep');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('reset-mobile.png'),fullPage:true});
 await page.reload();await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
 await expect(page.locator('.adventure-passport')).toContainText('0 / 24');
 await expect(page.locator('[data-stage="unicorn-1"]')).toBeDisabled();
});
test('blocked deletion reports failure without pretending to reset',async({page})=>{
 await seed(page);
 await page.evaluate(()=>{Storage.prototype.removeItem=function(){throw new DOMException('Blocked','SecurityError');};});
 page.once('dialog',dialog=>dialog.accept());await page.locator('#reset-adventure').click();
 await expect(page.locator('.adventure-save')).toContainText('Impossible d’effacer');
 await expect(page.locator('.friend-invited')).toHaveCount(8);
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).completed.length,ADVENTURE_KEY)).toBe(24);
});
