import {expect,type Page} from '@playwright/test';
import {preset,TRAINING_KEY,type TrainingSettings} from '../../src/training';
import {defaults,STORAGE_KEY} from '../../src/storage';
import {adventures} from '../../src/adventure';
export async function setCampRhythm(page:Page,value:string) {
 for(let i=0;i<5 && await page.locator('#camp-duration').getAttribute('data-duration')!==value;i++) await page.locator('#camp-duration').click();
 await expect(page.locator('#camp-duration')).toHaveAttribute('data-duration',value);
}
export async function prepareCamp(page:Page,settings:Partial<TrainingSettings>={},sound=false) {
 await page.addInitScript(({key,legacyKey,data,saved})=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(data));
  if(!localStorage.getItem(legacyKey))localStorage.setItem(legacyKey,JSON.stringify(saved));
 },{key:TRAINING_KEY,legacyKey:STORAGE_KEY,data:{settings:{...preset('mix'),...settings},materials:0,records:{}},saved:{...defaults(),muted:!sound,voiceEnabled:sound}});
 await page.clock.install({time:new Date('2026-09-30T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-30T12:00:10Z'));
 await enterCamp(page);
}
export async function enterCamp(page:Page) { await page.locator('#open-training').click();await page.locator('nav [data-tab="workshop"]').click(); }
export async function startCamp(page:Page) { await page.locator('#camp-start').click();await page.clock.runFor(4050);await ready(page); }
export async function ready(page:Page) { await expect.poll(async()=>{await page.clock.runFor(16);return page.locator('#overlay').isHidden();}).toBe(true); }
export async function current(page:Page) {
 const label=(await page.locator('#equation').getAttribute('aria-label'))!;
 const [a,b]=label.match(/\d+/g)!.map(Number);
 return {a,b,label,result:label.includes('plus')?a+b:label.includes('moins')?a-b:a*b};
}
export async function solve(page:Page) { await ready(page);const q=await current(page);await page.keyboard.type(String(q.result));await page.clock.runFor(700);return q; }
export async function prepareWorld(page:Page,theme:string,sound=false) {
 const adventure=adventures.find(a=>a.worlds.some(w=>w.id===theme))!;
 await page.addInitScript(({key,adventureKey,saved,completed})=>{
  localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem(adventureKey,JSON.stringify({completed}));
 },{key:STORAGE_KEY,adventureKey:adventure.storageKey,saved:{...defaults(),muted:!sound,voiceEnabled:false},completed:adventure.stages.map(s=>s.id)});
 await page.clock.install({time:new Date('2026-09-30T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-30T12:00:10Z'));
 await page.locator('#open-adventure').click();await page.locator(`[data-adventure="${adventure.id}"]`).click();await page.locator(`[data-stage="${theme}-3"]`).click();
}
