import {expect,test} from '@playwright/test';
import {prepareCamp,enterCamp,startCamp} from './helpers';
for(const width of [390,768,1024])test(`camp lives choice keyboard and persistence ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:900});await prepareCamp(page);
 await page.locator('#camp-life-10').click();await page.reload();await enterCamp(page);await expect(page.locator('#camp-life-10')).toHaveAttribute('aria-pressed','true');
 await page.locator('#camp-lives-unlimited').focus();await page.keyboard.press('Enter');await expect(page.locator('#camp-lives-unlimited')).toHaveAttribute('aria-pressed','true');
 await page.locator('#camp-life-7').click();await expect(page.locator('.camp-life-hearts .filled')).toHaveCount(7);
 for(const value of ['5','10','15','30','none']) {
  await page.locator('#camp-duration').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#camp-duration')).toHaveAttribute('data-duration',value);
  await expect(page.locator('#camp-duration')).toBeFocused();await page.clock.runFor(400);
 }
 await page.locator('#camp-duration').scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('equipment-pickers.png'),fullPage:true});
 await page.reload();await enterCamp(page);await expect(page.locator('#camp-duration')).toHaveAttribute('data-duration','none');
 await expect(page.locator('#camp-life-7')).toHaveAttribute('aria-pressed','true');
 await startCamp(page);await expect(page.locator('#hearts [data-heart]')).toHaveCount(7);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
