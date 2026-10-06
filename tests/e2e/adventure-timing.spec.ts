import { expect,test } from '@playwright/test';
import { adventureDurations,adventureLives,worlds,stages,ADVENTURE_KEY } from '../../src/adventure';
import { defaults,STORAGE_KEY } from '../../src/storage';

for(const world of worlds)test(`mission timer ${world.id}`,async({page},info)=>{
 await page.setViewportSize({width:world.id==='wizard'?390:768,height:1024});
 await page.addInitScript(({key,adventureKey,completed,saved})=>{
  localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem(adventureKey,JSON.stringify({completed}));
 },{key:STORAGE_KEY,adventureKey:ADVENTURE_KEY,completed:stages.map(s=>s.id),saved:{...defaults(),duration:5,muted:true}});
 await page.clock.install({time:new Date('2026-09-29T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-29T12:00:10Z'));
 await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
 const duration=adventureDurations[world.id];
 await expect(page.locator(`[data-stage="${world.id}-1"]`)).toContainText(duration?`${duration} s par calcul`:'Sans chrono');
 await page.locator(`[data-stage="${world.id}-1"]`).click();await page.clock.runFor(4050);
 if(duration===null){await expect(page.locator('#time-left')).toBeHidden();await page.clock.runFor(35000);await expect(page.locator('#correction-card')).toBeHidden();return;}
 await expect(page.locator('#time-left')).toHaveText(`${duration} s`);
 await expect(page.locator('#time-progress')).toBeVisible();await expect(page.locator('#time-progress')).toHaveAttribute('aria-valuemax',String(duration));
 await page.clock.runFor(2000);await page.locator('#pause').click();await page.clock.runFor(35000);
 await page.locator('#resume').click();await page.clock.runFor(4050);
 await expect(page.locator('#time-left')).toHaveText(`${duration-2} s`);
 await page.clock.runFor((duration-5)*1000);await expect(page.locator('#time-box')).toHaveClass(/urgent/);
 await page.screenshot({path:info.outputPath(`${world.id}-timer.png`),fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.clock.runFor(3000);await expect(page.locator('#correction-card')).toBeVisible();
 await expect(page.locator('#hearts [data-heart]:not(.lost)')).toHaveCount(adventureLives[world.id]!-1);
 await page.clock.runFor(2050);await expect(page.locator('#correction-card')).toBeHidden();await expect(page.locator('#time-left')).toHaveText(`${duration} s`);
 await page.locator('#pause').click();await page.locator('#adventure-exit').click();await page.locator('#leave-adventure').click();
 await page.locator('#open-training').click();await page.locator('nav [data-tab="workshop"]').click();await expect(page.locator('#camp-duration')).toHaveAttribute('data-duration','5');
 await page.locator('#camp-start').click();await page.clock.runFor(4050);await expect(page.locator('#time-left')).toHaveText('5 s');
});
