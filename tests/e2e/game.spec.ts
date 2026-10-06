import {setCampRhythm} from './helpers';
import {expect,test} from '@playwright/test';
import {prepareCamp,startCamp,solve,current,enterCamp} from './helpers';
import {TRAINING_KEY} from '../../src/training';

test('preferences, countdown, keyboard, mouse, erase and pause',async({page})=>{
 await prepareCamp(page,{operations:['multiply'],tables:[10],length:5,duration:15,lives:4});
 await setCampRhythm(page,'30');await page.reload();await enterCamp(page);
 await expect(page.locator('#camp-duration')).toHaveAttribute('data-duration','30');await expect(page.locator('#camp-life-4')).toHaveAttribute('aria-pressed','true');
 await page.locator('#camp-start').click();await expect(page.locator('#countdown-panel')).toBeVisible();await page.clock.runFor(4050);
 await page.locator('[data-digit="0"]').click();await expect(page.locator('[data-slot="0"]')).toHaveText('0');await page.locator('#erase').click();await expect(page.locator('[data-slot="0"]')).toHaveText('');
 await page.keyboard.type('0');await page.keyboard.press('Backspace');
 const q=await current(page);await page.clock.runFor(1000);await page.locator('#pause').click();const elapsed=await page.locator('#elapsed').innerText();
 await page.clock.runFor(20000);await expect(page.locator('#elapsed')).toHaveText(elapsed);await page.keyboard.press('Tab');await expect(page.locator('#camp-exit')).toBeFocused();
 await page.locator('#resume').click();await page.clock.runFor(4050);await expect(page.locator('#equation')).toHaveAttribute('aria-label',q.label);
 await page.keyboard.type(String(q.result));await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow','1');
});
test('100 distinct multiplications, three digits, victory and record partitioning',async({page})=>{
 test.setTimeout(150000);
 await prepareCamp(page,{operations:['multiply'],tables:[1,2,3,4,5,6,7,8,9,10],length:'all',duration:30,lives:3});await startCamp(page);
 const seen=new Set<string>();let hundred=false;
 for(let i=0;i<100;i++){const q=await solve(page);expect(seen.has(q.label)).toBe(false);seen.add(q.label);hundred ||= q.result===100;}
 expect(hundred).toBe(true);await expect(page.locator('#victory')).toBeVisible();await page.clock.runFor(6100);await expect(page.locator('#result-record')).toContainText('meilleur temps');
 const data=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),TRAINING_KEY);expect(data.materials).toBe(100);expect(Object.keys(data.records)).toHaveLength(1);
 await page.getByRole('button',{name:'Modifier ma séance'}).click();await page.locator('#camp-length-5').check();await startCamp(page);
 for(let i=0;i<5;i++)await solve(page);await page.clock.runFor(6100);
 expect(await page.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)!).records).length,TRAINING_KEY)).toBe(2);
});
test('three timeouts, correction, defeat and replay reset',async({page})=>{
 await prepareCamp(page,{duration:5,lives:3});await startCamp(page);
 for(let i=0;i<3;i++){await page.clock.runFor(5000);await expect(page.locator('#correction-card')).toBeVisible();await page.clock.runFor(2050);}
 await expect(page.locator('#defeat')).toBeVisible();await page.clock.runFor(6100);await expect(page.locator('#result-solved')).toHaveText('0');
 await page.getByRole('button',{name:'Rejouer',exact:true}).click();await page.clock.runFor(4050);await expect(page.locator('#hearts [data-heart]:not(.lost)')).toHaveCount(3);
});
test('visibility interruption freezes the question until explicit resume',async({page})=>{
 await prepareCamp(page,{duration:10,lives:3});await startCamp(page);const q=await current(page);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.runFor(20000);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.locator('#pause-panel')).toBeVisible();await page.locator('#resume').click();await page.clock.runFor(4050);await expect(page.locator('#equation')).toHaveAttribute('aria-label',q.label);
});
test('victory preview adds no materials or records',async({page})=>{
 await prepareCamp(page);const before=await page.evaluate(key=>localStorage.getItem(key),TRAINING_KEY);
 await page.keyboard.press('Control+Alt+v');await expect(page.locator('#victory')).toBeVisible();await page.clock.runFor(6100);
 expect(await page.evaluate(key=>localStorage.getItem(key),TRAINING_KEY)).toBe(before);
});
test('Web Audio plays locally and mute cuts the master output',async({page})=>{
 await page.addInitScript(()=>{const probe={tones:0,gains:[] as number[]};Object.assign(window,{campAudio:probe});const start=OscillatorNode.prototype.start;OscillatorNode.prototype.start=function(...a){probe.tones++;return start.apply(this,a);};const target=AudioParam.prototype.setTargetAtTime;AudioParam.prototype.setTargetAtTime=function(v,t,c){probe.gains.push(v);return target.call(this,v,t,c);};});
 await prepareCamp(page,{},true);await startCamp(page);expect(await page.evaluate(()=>(window as any).campAudio.tones)).toBeGreaterThan(0);
 await page.locator('#sound').click();expect(await page.evaluate(()=>(window as any).campAudio.gains)).toContain(0);
});
for(const width of [390,768,1024])test(`touch game, correction and rotation ${width}px`,async({browser})=>{
 const context=await browser.newContext({hasTouch:true,viewport:{width,height:900}});const page=await context.newPage();
 await prepareCamp(page,{operations:['multiply'],tables:[10],length:5,duration:30,lives:10});await startCamp(page);
 const q=await current(page);for(const d of String(q.result))await page.locator(`[data-digit="${d}"]`).tap();await page.clock.runFor(700);
 await page.setViewportSize({width:900,height:width});
 const area=await page.locator('#question-area').boundingBox(),equation=await page.locator('#question-content').boundingBox();
 expect(equation!.x).toBeGreaterThanOrEqual(area!.x);expect(equation!.x+equation!.width).toBeLessThanOrEqual(area!.x+area!.width);
 const next=await current(page);await page.keyboard.type('0'.repeat(String(next.result).length));await expect(page.locator('#correction-card')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
