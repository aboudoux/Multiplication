import {test,expect} from '@playwright/test';
import {prepareCamp,enterCamp} from './helpers';
import {TRAINING_KEY} from '../../src/training';

test('visible choices preserve precise settings, keyboard navigation and saved equipment',async({page})=>{
 await prepareCamp(page);
 await expect(page.locator('#training select')).toHaveCount(0);
 await page.locator('#camp-add-ceiling-100').check();
 await page.locator('#camp-subtract-ceiling-50').check();
 await page.locator('#camp-add-advanced summary').click();
 await page.locator('#camp-add-carry-with').check();
 await expect(page.locator('#camp-add-advanced')).toHaveAttribute('open','');
 await page.locator('#camp-add-max').fill('75');await page.locator('#camp-add-max').press('Tab');
 await expect(page.locator('#camp-add-ceiling-75')).toBeChecked();
 await page.locator('#camp-multiplier-min-2').check();
 await page.locator('#camp-multiplier-max-8').check();
 await page.locator('#camp-length-custom').check();
 await page.locator('#camp-custom-length').fill('17');await page.locator('#camp-custom-length').press('Tab');
 await expect(page.locator('#camp-length-custom')).toBeChecked();
 await page.locator('#camp-voice-ant').focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('#camp-voice-classic')).toBeChecked();
 await expect(page.locator('#camp-voice-classic')).toBeFocused();
 const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).settings,TRAINING_KEY);
 expect(saved).toMatchObject({add:{max:75,carry:'with'},subtract:{max:50},multiplierMin:2,multiplierMax:8,length:17,voice:'classic'});
 await page.reload();await enterCamp(page);
 await expect(page.locator('#camp-add-ceiling-75')).toBeChecked();
 await expect(page.locator('#camp-custom-length')).toHaveValue('17');
 await expect(page.locator('#camp-voice-classic')).toBeChecked();
 await page.locator('#camp-length-all').check();await expect(page.locator('#camp-custom-length')).toHaveCount(0);
 await expect(page.locator('#camp-start')).toBeEnabled();
 await page.locator('#camp-multiplier-min-10').check();
 await expect(page.locator('#camp-start')).toBeDisabled();
 await expect(page.locator('#training [role="alert"]')).toBeVisible();
});

for(const width of [390,768,1365]) test(`choice tiles fit and remain touchable at ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await prepareCamp(page);await page.locator('#camp-add-advanced summary').click();
 await page.locator('#camp-length-5').check();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const sizes=await page.locator('.camp-choice span').evaluateAll(items=>items.map(item=>{const r=item.getBoundingClientRect();return {width:r.width,height:r.height};}));
 expect(sizes.every(size=>size.width>=44&&size.height>=44)).toBe(true);
 await page.screenshot({path:info.outputPath('choices.png'),fullPage:true});
});
