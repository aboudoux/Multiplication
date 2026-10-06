import {test,expect} from '@playwright/test';
import {defaults,STORAGE_KEY} from '../../src/storage';

for (const width of [390,768,1365]) test(`club entrance ignores the saved alien world at ${width}px`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await page.addInitScript(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key:STORAGE_KEY,saved:{...defaults(),theme:'alien',muted:true}});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','club');
  await expect(page.locator('#theme-scenery')).toBeEmpty();
  await expect(page.locator('#open-adventure')).toBeVisible();
  await expect(page.locator('#open-training')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('club.png'),fullPage:true});
  await page.locator('#open-training').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','ant');
  await page.locator('#camp-home').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','club');
  await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','kitten');
  await page.locator('.brand').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','club');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','club');
});
