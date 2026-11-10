import {setCampRhythm} from './helpers';
import {test,expect,type Page} from '@playwright/test';
import {preset,TRAINING_KEY} from '../../src/training';
import {defaults,STORAGE_KEY} from '../../src/storage';
import {ADVENTURE_KEY} from '../../src/adventure';
import { clockRound, roundLength } from '../../src/clock-games';
async function load(page:Page) {
 await page.addInitScript(({key,saved})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(saved));},{key:STORAGE_KEY,saved:{...defaults(),muted:true}});
 await page.clock.install({time:new Date('2026-09-30T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-30T12:00:10Z'));
 await page.locator('#open-training').click();
}
async function solve(page:Page) {
 const label=(await page.locator('#equation').getAttribute('aria-label'))!;
 const [a,b]=label.match(/\d+/g)!.map(Number);
 await page.keyboard.type(String(label.includes('plus')?a+b:label.includes('moins')?a-b:a*b));
 await page.clock.runFor(700);
}

test('les ateliers du temps proposent trois difficultés libres et une correction à son rythme', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await load(page);
  await page.getByRole('button', { name: 'L’heure et les durées' }).click();
  await expect(page.locator('.camp-presets [data-clock-practice]')).toHaveCount(6);
  await page.locator('[data-clock-practice="read"]').click();
  await expect(page.locator('[data-clock-action="level"]:enabled')).toHaveCount(3);
  await expect(page.locator('[data-level="2"]')).toContainText('Quarts d’heure');
  await page.evaluate(() => { Math.random = () => 0; });
  await page.locator('[data-level="2"]').click();
  await expect(page.getByRole('timer')).toHaveCount(0);
  await page.clock.fastForward(120_000);
  await expect(page.getByText('Question 1 sur 5')).toBeVisible();
  const questions = clockRound('read', 2, () => 0);
  const wrong = questions[0].options.findIndex(option => option !== questions[0].correct);
  await page.locator(`[data-option="${wrong}"]`).click();
  await expect(page.locator('.clock-lesson .clock-face')).toBeVisible();
  await page.clock.fastForward(120_000);
  await page.getByRole('button', { name: 'Continuer' }).click();
  for (let index = 1; index < roundLength; index++) {
    const question = questions[index];
    await page.locator(`[data-option="${question.options.indexOf(question.correct)}"]`).click();
  }
  await expect(page.getByText('Ta séance est terminée.')).toBeVisible();
  await expect(page.locator('.clock-results .result-stats')).toContainText('4 bonnes réponses');
  await page.getByRole('button', { name: 'Retour aux ateliers' }).click();
  await expect(page.getByRole('heading', { name: 'L’heure et les durées' })).toBeFocused();
  await page.locator('#camp-home').click();
  await page.locator('#open-adventure').click();
  await expect(page.locator('[data-choice="lapin"] .choice-progress')).toHaveText('0 / 18 niveaux faits');
});
test('guided setup, exact tables, completion, materials, replay and independent adventure',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await load(page);await page.locator('#camp-quick-sessions summary').click();await page.locator('[data-preset="tables"]').click();
 await page.locator('[data-tables="none"]').click();await expect(page.locator('#camp-start')).toBeDisabled();
 await page.locator('#camp-table-3').check();await page.locator('#camp-table-7').check();
 await page.locator('#camp-length-5').check();await page.locator('#camp-start').click();await page.clock.runFor(4050);
 await expect(page.locator('html')).toHaveAttribute('data-theme','ant');await expect(page.locator('#time-left')).toBeHidden();
 await page.clock.runFor(60000);await expect(page.locator('#correction-card')).toBeHidden();
 for(let i=0;i<5;i++) {const a=Number((await page.locator('#equation').innerText()).match(/\d+/)![0]);expect([3,7]).toContain(a);await solve(page);}
 await expect(page.locator('#victory')).toBeVisible();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).materials,TRAINING_KEY)).toBe(5);
 await page.clock.runFor(6100);await expect(page.locator('#result-description')).toContainText('5 matériaux');
 await page.getByRole('button',{name:'Rejouer',exact:true}).click();await page.clock.runFor(4050);await solve(page);
 await page.locator('#pause').click();await page.locator('#camp-exit').click();
 await page.locator('[data-tab="colony"]').click();await expect(page.locator('.camp-materials')).toContainText('6 matériaux');
 await page.reload();await page.locator('#open-training').click();await expect(page.locator('.camp-materials')).toContainText('6 matériaux');
 await page.locator('#camp-home').click();await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();await page.locator('[data-stage="kitten-1"]').click();await page.clock.runFor(4050);await solve(page);
 await page.locator('#pause').click();await page.locator('#adventure-exit').click();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).materials,TRAINING_KEY)).toBe(6);
 expect(await page.evaluate(key=>localStorage.getItem(key),ADVENTURE_KEY)).toBeNull();expect(errors).toEqual([]);
});
for(const width of [390,768,1365]) test(`camp and workshop fit ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await load(page);
 await page.screenshot({path:info.outputPath('camp.png'),fullPage:true});
 await page.locator('#camp-quick-sessions summary').click();await page.locator('[data-preset="mix"]').click();await page.locator('#camp-add-advanced summary').click();
 await page.locator('#camp-add-max').fill('100');await page.locator('#camp-add-max').press('Tab');
 await page.locator('#camp-add-carry-with').check();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('workshop.png'),fullPage:true});
 await page.locator('[data-tab="colony"]').click();await page.screenshot({path:info.outputPath('colony.png'),fullPage:true});
});
test('finite lives, timeout, records, storage failure and existing preferences',async({page})=>{
 await load(page);await page.locator('nav [data-tab="workshop"]').click();
 await expect(page.locator('#camp-duration')).toHaveAttribute('data-duration','10');await expect(page.locator('#camp-life-3')).toHaveAttribute('aria-pressed','true');
 await setCampRhythm(page,'5');await page.locator('#camp-life-1').click();await page.locator('#camp-length-5').check();
 await page.locator('#camp-start').click();await page.clock.runFor(4050);await solve(page);await page.clock.runFor(5000);
 await expect(page.locator('#correction-card')).toBeVisible();await page.clock.runFor(8100);await expect(page.locator('#results')).toBeVisible();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).materials,TRAINING_KEY)).toBe(1);
 await page.getByRole('button',{name:'Modifier ma séance'}).click();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('disabled');};});
 await setCampRhythm(page,'30');await expect(page.locator('.camp-save')).toContainText('cette visite');
 await page.locator('#camp-start').click();await page.clock.runFor(4050);for(let i=0;i<5;i++)await solve(page);await page.clock.runFor(6100);
 await expect(page.locator('#result-record')).toContainText('meilleur temps');await expect(page.locator('#result-record')).toContainText('stockage indisponible');
});
test('new large calculations compose local audio and start the timer only when ready',async({page})=>{
 const requests:string[]=[];page.on('request',r=>{if(r.url().includes('/voice/fr/'))requests.push(r.url());});
 await page.addInitScript(({key,legacyKey,settings,saved})=>{
  localStorage.setItem(key,JSON.stringify({settings,materials:0,records:{}}));localStorage.setItem(legacyKey,JSON.stringify(saved));
 },{key:TRAINING_KEY,legacyKey:STORAGE_KEY,settings:{...preset(),add:{min:40,max:100,carry:'all'},length:1},saved:defaults()});
 await page.goto('/');await page.locator('#open-training').click();await page.locator('nav [data-tab="workshop"]').click();await page.locator('#camp-start').click();
 await expect(page.locator('[data-digit="1"]')).toBeEnabled({timeout:15000});
 await expect(page.locator('#voice-unavailable')).toBeHidden();
 expect(requests.some(u=>u.endsWith('/tokens/add.wav'))).toBe(true);expect(requests.some(u=>u.includes('/composed/'))).toBe(false);
 await page.locator('#pause').click();await expect(page.locator('#voice')).not.toHaveClass(/is-speaking/);
});
test('earned materials unlock a manual construction and celebration can be suspended',async({page},info)=>{
 await page.setViewportSize({width:390,height:900});
 await page.addInitScript(({key,settings})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({settings,materials:59,colony:{built:0,spent:0,stars:0},records:{}}));},{key:TRAINING_KEY,settings:{...preset(),length:1}});
 await load(page);await page.locator('nav [data-tab="workshop"]').click();await page.locator('#camp-start').click();await page.clock.runFor(4050);await solve(page);
 await expect(page.locator('#camp-victory .camp-landscape')).toHaveAttribute('aria-label','Fourmilière : 0 constructions terminées');
 await page.screenshot({path:info.outputPath('camp-complete-mobile.png'),fullPage:true});
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.clock.runFor(15000);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#victory')).toBeVisible();await page.clock.runFor(6100);
 await expect(page.locator('#camp-colony-ready')).toBeVisible();await page.locator('#camp-colony-ready').click();await expect(page.locator('.camp-buildings .built')).toHaveCount(0);
 await expect(page.locator('#camp-build')).toBeEnabled();await page.locator('#camp-build').click();await page.clock.runFor(2500);
 await expect(page.locator('.camp-buildings .built')).toHaveCount(1);
 await page.reload();await page.locator('#open-training').click();await expect(page.locator('.camp-materials')).toContainText('0 matériaux');
});
