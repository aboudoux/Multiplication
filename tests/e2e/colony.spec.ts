import {test,expect} from '@playwright/test';
import {TRAINING_KEY,preset,buildingCosts} from '../../src/training';
import {defaults,STORAGE_KEY} from '../../src/storage';

async function enter(page:import('@playwright/test').Page,materials:number,colony={built:0,spent:0,stars:0}) {
 await page.addInitScript(({key,legacy,materials,colony,settings,saved})=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({settings,materials,colony,records:{}}));
  localStorage.setItem(legacy,JSON.stringify(saved));
 },{key:TRAINING_KEY,legacy:STORAGE_KEY,materials,colony,settings:preset(),saved:{...defaults(),muted:true,voiceEnabled:false}});
 await page.clock.install({time:new Date('2026-09-30T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-30T12:00:10Z'));
 await page.locator('#open-training').click();await page.locator('[data-tab="colony"]').click();
}
for(const width of [390,768,1365]) test(`manual building, spending, animation and persistence ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'no-preference'});
 await enter(page,60);await expect(page.locator('.camp-landscape')).toHaveAttribute('aria-label','Fourmilière : 0 constructions terminées');
 await expect(page.locator('#camp-build')).toBeEnabled();await page.screenshot({path:info.outputPath('colony-before.png'),fullPage:true});
 await page.locator('#camp-build').click();await expect(page.locator('#camp-build')).toBeDisabled();
 await page.locator('#camp-build').evaluate((button:HTMLButtonElement)=>button.click());
 await expect(page.locator('.colony-site')).toHaveClass(/is-building/);
 await expect(page.locator('.colony-next h3')).toHaveText('La passerelle');
 expect(await page.locator('.construction-1').evaluate(el=>getComputedStyle(el).animationName)).toBe('colony-reveal');
 await page.clock.runFor(1000);await page.screenshot({path:info.outputPath('colony-building.png'),fullPage:true});
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).colony,TRAINING_KEY)).toEqual({built:1,spent:60,stars:0});
 await page.clock.runFor(1500);await expect(page.locator('#colony-status')).toContainText('construction terminée');
 await expect(page.locator('.colony-site')).not.toHaveClass(/is-building/);
 await expect(page.locator('.camp-buildings .built')).toHaveCount(1);await expect(page.locator('#camp-build')).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.reload();await page.locator('#open-training').click();await page.locator('[data-tab="colony"]').click();
 await expect(page.locator('.camp-landscape')).toHaveAttribute('aria-label','Fourmilière : 1 constructions terminées');
 await expect(page.locator('.colony-stock')).toContainText('0 matériaux');
 await page.screenshot({path:info.outputPath('colony-after.png'),fullPage:true});
});
test('six click-to-build stages and an earned star, reduced motion and interrupted animation',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await enter(page,1290);
 for(let i=0;i<6;i++) {
  await expect(page.locator('.camp-buildings .built')).toHaveCount(i);
  await page.locator('#camp-build').click();await page.clock.runFor(350);
 }
 await expect(page.locator('.camp-landscape')).toHaveAttribute('aria-label','Fourmilière : 6 constructions terminées');
 await page.screenshot({path:info.outputPath('colony-complete.png'),fullPage:true});
 await page.locator('#camp-build').click();await page.reload();await page.locator('#open-training').click();await page.locator('[data-tab="colony"]').click();
 await expect(page.locator('.colony-stars')).toContainText('1 étoile');await expect(page.locator('#camp-build')).toBeDisabled();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).colony.spent,TRAINING_KEY)).toBe(buildingCosts.reduce((a,b)=>a+b,0)+300);
});
test('insufficient stock cannot build and unavailable storage leaves an honest session-only notice',async({page})=>{
 await enter(page,59);await expect(page.locator('#camp-build')).toBeDisabled();
 await page.evaluate(key=>{const data=JSON.parse(localStorage.getItem(key)!);data.materials=60;localStorage.setItem(key,JSON.stringify(data));const profiles=JSON.parse(localStorage.getItem('calcul-party:players:v1')!);profiles.players.find((p:{id:string})=>p.id===profiles.active).data[key]=JSON.stringify(data);localStorage.setItem('calcul-party:players:v1',JSON.stringify(profiles));},TRAINING_KEY);
 await page.reload();await page.locator('#open-training').click();await page.locator('[data-tab="colony"]').click();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('unavailable');};});
 await page.locator('#camp-build').click();await expect(page.locator('.camp-save')).toContainText('cette visite seulement');
 await page.clock.runFor(2500);await expect(page.locator('.camp-buildings .built')).toHaveCount(1);
});
