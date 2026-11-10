import {test,expect,type Page} from '@playwright/test';
import {adventures,picoAdventure,chatonAdventure} from '../../src/adventure';
import {defaults,STORAGE_KEY} from '../../src/storage';
import {TRAINING_KEY,preset} from '../../src/training';
import {solve,ready} from './helpers';

async function select(page:Page,id:'pico'|'chaton'){
 if(await page.locator('#change-adventure').isVisible())await page.locator('#change-adventure').click();
 else await page.locator('#open-adventure').click();
 await page.locator(`[data-adventure="${id}"]`).click();
}
async function setup(page:Page,completed=false){
 await page.addInitScript(({adventures,key,saved,completed})=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(saved));
  if(completed)for(const a of adventures)if(!localStorage.getItem(a.storageKey))localStorage.setItem(a.storageKey,JSON.stringify({completed:a.stages.map(s=>s.id)}));
 },{adventures,key:STORAGE_KEY,saved:{...defaults(),muted:true,voiceEnabled:false},completed});
 await page.clock.install({time:new Date('2026-10-01T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-01T12:00:10Z'));
}
for(const width of [390,768,1365])test(`adventure chooser displays three portraits at ${width}px`,async({page},info)=>{
 await page.route('**/themes/*.png',route=>route.fulfill({status:401}));
 await page.setViewportSize({width,height:950});await setup(page);
 await expect(page.locator('.destination-card')).toHaveCount(2);await page.locator('#open-adventure').click();
 await expect(page.locator('.adventure-choice-card')).toHaveCount(3);
 await expect(page.locator('[data-choice="lapin"]')).toContainText('Le Lapin chrono');
 await expect(page.locator('[data-choice="pico"]')).toContainText('Pico et le phare des îles');
 expect(await page.locator('.choice-portrait .theme-sprite').evaluateAll(elements=>Promise.all(elements.map(async element=>{
  const src=getComputedStyle(element).backgroundImage.slice(5,-2);
  if(!src.startsWith('data:image/webp;'))throw Error('Adventure portrait is not bundled');
  const img=new Image();img.src=src;await img.decode();return img.naturalWidth;
 })))).toEqual([1536,1254]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('chooser.png'),fullPage:true});
 await page.locator('[data-adventure="pico"]').click();await expect(page.locator('#map-title')).toHaveText('Un phare, huit compagnons !');
 await expect(page.locator('.world-card')).toHaveCount(8);await expect(page.locator('[data-stage]:enabled')).toHaveCount(1);
 await expect(page.locator('[data-stage="pico-1"]')).toBeEnabled();await expect(page.locator('#celebrate-adventure')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('pico-map.png'),fullPage:true});
 await select(page,'chaton');await expect(page.locator('[data-stage="kitten-1"]')).toBeEnabled();await expect(page.locator('[data-stage="pico-1"]')).toHaveCount(0);
});
test('a won Pico mission survives reload and replay; reset preserves kitten and camp',async({page})=>{
 await page.addInitScript(({kitten,camp,key})=>{
  if(!localStorage.getItem(kitten.storageKey))localStorage.setItem(kitten.storageKey,JSON.stringify({completed:kitten.stages.slice(0,3).map(s=>s.id)}));
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(camp));
 },{kitten:chatonAdventure,camp:{settings:preset('mix'),materials:42,records:{}},key:TRAINING_KEY});
 await setup(page);await select(page,'pico');
 for(let run=0;run<2;run++){
  await page.locator('[data-stage="pico-1"]').click();await page.clock.runFor(4050);await ready(page);
  for(let i=0;i<5;i++)await solve(page);
  await expect(page.locator('.mission-scene')).toHaveAttribute('data-mission','pico-1');await page.clock.runFor(10100);
  await page.locator('[data-action="home"]').click();await expect(page.locator('[data-stage="pico-2"]')).toBeEnabled();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).completed,picoAdventure.storageKey)).toEqual(['pico-1']);
 }
 await page.reload();await select(page,'pico');await expect(page.locator('[data-stage="pico-1"]')).toHaveClass(/mission-complete/);
 await select(page,'chaton');await expect(page.locator('.adventure-passport')).toContainText('3 / 24');
 await select(page,'pico');page.once('dialog',dialog=>dialog.accept());await page.locator('#reset-adventure').click();
 await expect(page.locator('.adventure-passport')).toContainText('0 / 24');
 const saved=await page.evaluate(({a,c})=>({kitten:JSON.parse(localStorage.getItem(a)!),camp:JSON.parse(localStorage.getItem(c)!)}),{a:chatonAdventure.storageKey,c:TRAINING_KEY});
 expect(saved.kitten.completed).toHaveLength(3);expect(saved.camp.materials).toBe(42);
});
test('blocked storage retains each adventure for this visit; failed reset preserves progress',async({page})=>{
 await page.addInitScript(()=>{
  const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){if(key.startsWith('calcul-party:adventure:'))throw Error('blocked');return get.call(this,key);};
  const set=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.startsWith('calcul-party:adventure:'))throw Error('blocked');return set.call(this,key,value);};
  Storage.prototype.removeItem=function(){throw Error('blocked');};
 });
 await setup(page);await select(page,'pico');await expect(page.locator('.adventure-save')).toContainText('indisponible');
 await page.locator('[data-stage="pico-1"]').click();await page.clock.runFor(4050);for(let i=0;i<5;i++)await solve(page);await page.clock.runFor(10100);
 await page.locator('[data-action="home"]').click();await select(page,'chaton');await expect(page.locator('.adventure-passport')).toContainText('0 / 24');
 await select(page,'pico');await expect(page.locator('.adventure-passport')).toContainText('1 / 24');
 page.once('dialog',d=>d.accept());await page.locator('#reset-adventure').click();await expect(page.locator('.adventure-save')).toContainText('Impossible');
 await expect(page.locator('[data-stage="pico-1"]')).toHaveClass(/mission-complete/);
});
for(const reduced of [false,true])test(`lighthouse finale: eight friends, soundtrack, pause, background, replay (${reduced?'reduced':'full'})`,async({page},info)=>{
 await page.setViewportSize({width:reduced?390:1365,height:950});if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  const probe:{src:string;muted:boolean;time:number}[]=[];Object.assign(window,{filmAudio:probe});
  const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){probe.push({src:this.src,muted:this.muted,time:this.currentTime});return play.call(this);};
 });
 await setup(page,true);await select(page,'pico');await page.locator('#celebrate-adventure').click();
 const film=page.locator('#lighthouse-party');await expect(film).toBeVisible();await expect(page.locator('#birthday-party')).toBeHidden();
 await expect(film.locator('[data-character]')).toHaveCount(8);await expect(film.locator('[data-contribution]')).toHaveCount(7);
 expect(await film.locator('.lighthouse-friend .pico-sprite').evaluateAll(async els=>Promise.all(els.map(async el=>{const src=getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)![1];const img=new Image();img.src=src;await img.decode();return img.naturalWidth;})))).toEqual(Array(8).fill(1254));
 expect(await page.evaluate(()=>(window as any).filmAudio.at(-1).src)).toContain('/audio/pico-finale.wav');
 expect(await page.evaluate(()=>(window as any).filmAudio.at(-1).muted)).toBe(true);
 await page.clock.runFor(8000);await expect(film).toHaveAttribute('data-chapter','assembly');
 await film.locator('.lighthouse-pause').click();const paused=await film.locator('.lighthouse-progress').getAttribute('aria-valuenow');
 await page.clock.runFor(15000);await expect(film.locator('.lighthouse-progress')).toHaveAttribute('aria-valuenow',paused!);
 await film.locator('.lighthouse-pause').click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.runFor(15000);await expect(film.locator('.lighthouse-progress')).toHaveAttribute('aria-valuenow',paused!);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.runFor(12000);await expect(film).toHaveAttribute('data-chapter','light');
 await expect(film.locator('.lighthouse-beam')).toHaveCSS('opacity','1');
 await page.clock.runFor(5000);await expect(film).toHaveAttribute('data-chapter','boats');
 await expect(film.locator('.lighthouse-boat')).toHaveCount(3);await expect(film.locator('.lighthouse-applause')).toHaveCSS('opacity','1');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('lighthouse.png'),fullPage:true});
 await page.clock.runFor(6100);await expect(film).toHaveAttribute('data-chapter','finished');
 await expect(film.locator('.lighthouse-time')).toHaveText('0:30 / 0:30');
 await page.locator('#sound').click();await film.locator('.lighthouse-replay').click();
 expect(await page.evaluate(()=>(window as any).filmAudio.at(-1).muted)).toBe(false);
 await expect(film).toHaveAttribute('data-chapter','arrival');
 await film.locator('.lighthouse-back').click();await expect(film).toBeHidden();await expect(page.locator('#map-title')).toBeVisible();
 await select(page,'chaton');await page.locator('#celebrate-adventure').click();await expect(page.locator('#birthday-party')).toBeVisible();await expect(film).toBeHidden();
});
