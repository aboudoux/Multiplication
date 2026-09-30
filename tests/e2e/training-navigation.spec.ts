import {test,expect} from '@playwright/test';
import {preset,TRAINING_KEY} from '../../src/training';
import {defaults,STORAGE_KEY} from '../../src/storage';

for(const width of [390,768,1365]) test(`camp opens saved settings with two clear destinations at ${width}px`,async({page},info)=>{
 const data={settings:{...preset('mix'),length:30,add:{min:1,max:50,carry:'without'}},materials:230,colony:{built:2,spent:150,stars:0},records:{saved:{timeMs:45000,mistakes:1}}};
 await page.setViewportSize({width,height:900});
 await page.addInitScript(({key,legacyKey,data,saved})=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(data));
  localStorage.setItem(legacyKey,JSON.stringify(saved));
 },{key:TRAINING_KEY,legacyKey:STORAGE_KEY,data,saved:{...defaults(),muted:true,voiceEnabled:false}});
 await page.goto('/');await page.locator('#open-training').click();
 const nav=page.locator('.camp-nav button');
 await expect(nav).toHaveCount(2);await expect(nav).toHaveText(['⚒S’entraîner','⌂La fourmilière']);
 await expect(page.locator('[data-tab="workshop"]')).toHaveAttribute('aria-current','page');
 await expect(page.locator('#camp-length-30')).toBeChecked();
 await expect(page.locator('#camp-add-ceiling-50')).toBeChecked();
 const quick=page.locator('#camp-quick-sessions');
 await expect(quick).not.toHaveAttribute('open','');
 await expect(page.locator('[data-preset="first"]')).toBeHidden();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),TRAINING_KEY)).toEqual(data);
 await quick.locator('summary').focus();await page.keyboard.press('Enter');
 await expect(quick).toHaveAttribute('open','');
 await expect(quick.getByRole('button')).toHaveCount(3);
 await expect(quick).toContainText('Choisis une séance pour remplir les réglages ci-dessous.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('quick-sessions.png'),fullPage:true});
 for(const kind of ['first','tables','mix']) {
  await page.locator(`[data-preset="${kind}"]`).click();
  await expect(page.locator('#camp-session-title')).toBeFocused();
  await expect(quick).not.toHaveAttribute('open','');
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),TRAINING_KEY)).toEqual({...data,settings:preset(kind)});
  if(kind!=='mix')await quick.locator('summary').click();
 }
 await page.locator('#camp-length-5').check();
 await page.locator('[data-tab="colony"]').click();
 await expect(page.locator('.camp-buildings .built')).toHaveCount(2);
 await expect(page.locator('.camp-materials')).toContainText('80 matériaux');
 await page.locator('[data-tab="workshop"]').click();await expect(page.locator('#camp-length-5')).toBeChecked();
 await page.locator('#camp-home').click();await page.locator('#open-training').click();
 await expect(page.locator('#camp-length-5')).toBeChecked();
 await page.reload();await page.locator('#open-training').click();await expect(page.locator('#camp-length-5')).toBeChecked();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),TRAINING_KEY)).toEqual({...data,settings:{...preset('mix'),length:5}});
});
