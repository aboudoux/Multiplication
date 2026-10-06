import {test,expect} from '@playwright/test';
import {prepareCamp,startCamp} from './helpers';
for(const width of [390,768,1365])test(`camp owns its ant theme and reduced-motion celebration ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await prepareCamp(page);
 await expect(page.locator('html')).toHaveAttribute('data-theme','ant');await expect(page.locator('.camp-guide .ant-character')).toBeVisible();
 await page.locator('#camp-voice-classic').check();await page.reload();await page.locator('#open-training').click();await page.locator('nav [data-tab="workshop"]').click();await expect(page.locator('#camp-voice-classic')).toBeChecked();
 await page.keyboard.press('Control+Alt+v');await expect(page.locator('#victory')).toBeVisible();await page.screenshot({path:info.outputPath('ant-victory.png'),fullPage:true});
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(let i=0;i<8;i++) {
  await page.clock.runFor(120);
  const stage=(await page.locator('.victory-stage').boundingBox())!;
  const ant=(await page.locator('#dance-mascot > .ant-character').boundingBox())!;
  expect(ant.y).toBeGreaterThanOrEqual(stage.y);
  expect(ant.y+ant.height).toBeLessThanOrEqual(stage.y+stage.height);
 }
 await page.screenshot({path:info.outputPath('ant-victory-dance.png'),fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(5140);
 await startCamp(page);await expect(page.locator('.key-character .ant-character')).toBeVisible();expect(await page.locator('.key-companion-motion').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
