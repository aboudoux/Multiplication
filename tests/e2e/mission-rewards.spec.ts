import { expect, test } from '@playwright/test';
import { adventures } from '../../src/adventure';
import { defaults, STORAGE_KEY } from '../../src/storage';
import { missionRewards } from '../../src/mission-rewards';

const stages=adventures.flatMap(a=>a.stages);
for(const [index,stage] of stages.entries()) test(`reward ${stage.id}: story, ten seconds, assets and layout`,async({page},info)=>{
 test.setTimeout(150000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const adventure=adventures.find(a=>a.stages.some(s=>s.id===stage.id))!;
 if(['kitten-1','pico-1'].includes(stage.id))await page.route('**/themes/*.png',route=>route.fulfill({status:401}));
 const width=[390,768,1365][index%3];await page.setViewportSize({width,height:950});
 const reduced=['alien-3','nami-3'].includes(stage.id);if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
 if(stage.id==='kitten-2')await page.addInitScript(()=>{
  const probe={ends:[] as number[],gains:[] as number[]};Object.assign(window,{rewardAudio:probe});
  const stop=OscillatorNode.prototype.stop;
  OscillatorNode.prototype.stop=function(at){probe.ends.push((at??this.context.currentTime)-this.context.currentTime);return stop.call(this,at);};
  const target=AudioParam.prototype.setTargetAtTime;
  AudioParam.prototype.setTargetAtTime=function(value,start,constant){probe.gains.push(value);return target.call(this,value,start,constant);};
 });
 await page.addInitScript(({key,adventureKey,completed,saved})=>{
  localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem(adventureKey,JSON.stringify({completed}));
 },{key:STORAGE_KEY,adventureKey:adventure.storageKey,completed:adventure.stages.map(s=>s.id),saved:{...defaults(),muted:stage.id!=='kitten-2',voiceEnabled:false}});
 await page.clock.install({time:new Date('2026-09-29T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-29T12:00:10Z'));
 await page.locator('#open-adventure').click();await page.locator(`[data-adventure="${adventure.id}"]`).click();await page.locator(`[data-stage="${stage.id}"]`).click();await page.clock.runFor(4050);
 for(let i=0;i<stage.count;i++){
  await expect(page.locator('.keypad button[data-digit="1"]')).toBeEnabled();
  const label=(await page.locator('#equation').getAttribute('aria-label'))!;
  const [a,b]=label.match(/\d+/g)!.map(Number);
  if(stage.id==='kitten-2'&&i===stage.count-1)await page.evaluate(()=>{(window as any).rewardAudio.ends=[];});
  await page.keyboard.type(String(label.includes('plus')?a+b:label.includes('moins')?a-b:a*b));
  if(i<stage.count-1)await page.clock.runFor(750);
 }
 const scene=page.locator('.mission-scene');
 await expect(scene).toHaveAttribute('data-mission',stage.id);
 await expect(scene).toHaveAttribute('aria-label',missionRewards[stage.id].title);
 await expect(page.locator('.victory-stage')).toBeHidden();
 if(stage.id==='kitten-2'){
  const duration=await page.evaluate(()=>Math.max(...(window as any).rewardAudio.ends));
  expect(duration).toBeGreaterThan(9);expect(duration).toBeLessThan(10);
  await page.locator('#sound').click();expect(await page.evaluate(()=>(window as any).rewardAudio.gains.at(-1))).toBe(0);
  await page.locator('#sound').click();expect(await page.evaluate(()=>(window as any).rewardAudio.gains.at(-1))).toBe(.42);
 }
 await expect(page.locator('.reward-caption')).toHaveText(missionRewards[stage.id].captions[reduced?2:0]);
 await page.clock.runFor(3500);
 await expect(page.locator('.reward-caption')).toHaveText(missionRewards[stage.id].captions[reduced?2:1]);
 if(reduced)expect(await page.locator('.reward-actor').first().evaluate(el=>el.getAnimations()[0].currentTime)).toBe(10000);
 if(['kitten-1','pico-1'].includes(stage.id)){
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(20000);await expect(scene).toBeVisible();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 }
 await page.clock.runFor(4000);
 if(['dragon','alien','kitten','christmas','unicorn'].includes(stage.world.id)){
  const dragon=page.locator(`.reward-actor .sprite-${stage.world.id}`);
  const before=await dragon.evaluate(el=>getComputedStyle(el).transform);
  await page.clock.runFor(280);
  if(reduced)expect(await dragon.evaluate(el=>getComputedStyle(el).transform)).toBe(before);
  else expect(await dragon.evaluate(el=>getComputedStyle(el).transform)).not.toBe(before);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.clock.runFor(20);
  const still=await dragon.evaluate(el=>getComputedStyle(el).transform);
  await page.clock.runFor(100);
  expect(await dragon.evaluate(el=>getComputedStyle(el).transform)).toBe(still);
  await page.emulateMedia({reducedMotion:'no-preference'});
 }
 await expect(page.locator('.reward-caption')).toHaveText(missionRewards[stage.id].captions[2]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 // Both the characters and the props must still decode when separate image requests are denied.
 const art=page.locator(adventure.id==='pico'?'.reward-actor .pico-sprite':'.reward-actor .theme-sprite, .reward-prop');
 expect(await art.evaluateAll(async elements=>{
  const urls=[...new Set(elements.map(el=>getComputedStyle(el).backgroundImage.slice(5,-2)))];
  return Promise.all(urls.map(async src=>{if(!src.startsWith('data:image/webp;'))throw Error('Reward artwork is not bundled');const img=new Image();img.src=src;await img.decode();return img.naturalWidth;}));
 })).toEqual(expect.arrayContaining([adventure.id==='pico'?1254:1536]));
 await page.screenshot({path:info.outputPath(`${stage.id}-${width}.png`),fullPage:true});
 await page.clock.runFor(['dragon','alien','kitten','christmas','unicorn'].includes(stage.world.id)?2000:2400);await expect(scene).toBeVisible();
 await page.keyboard.type('123');await expect(scene).toBeVisible();
 await page.clock.runFor(150);await expect(page.locator('#results')).toBeVisible();
 await expect(scene).toHaveCount(0);expect(errors).toEqual([]);
});
