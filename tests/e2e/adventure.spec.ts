import { expect, test, type Page } from '@playwright/test';
import { stages, ADVENTURE_KEY } from '../../src/adventure';
import { defaults, STORAGE_KEY } from '../../src/storage';

async function setup(page: Page, completed:string[] = []) {
 await page.addInitScript(({saved,completed,key,adventureKey})=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(saved));
  if(!localStorage.getItem(adventureKey))localStorage.setItem(adventureKey,JSON.stringify({completed}));
 },{saved:{...defaults(),theme:'alien',mode:'multiply',tables:4,duration:15,length:'all',lives:5,muted:true},completed,key:STORAGE_KEY,adventureKey:ADVENTURE_KEY});
 await page.clock.install({time:new Date('2026-09-29T12:00:00Z')});
 await page.goto('/'); await page.clock.pauseAt(new Date('2026-09-29T12:00:10Z'));
 await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
}
async function solve(page: Page) {
 await expect(page.locator('.keypad button[data-digit="1"]')).toBeEnabled();
 const label=(await page.locator('#equation').getAttribute('aria-label'))!;
 const [a,b]=label.match(/\d+/g)!.map(Number);
 await page.keyboard.type(String(label.includes('plus')?a+b:label.includes('moins')?a-b:a*b));
 await page.clock.runFor(750);
}
test('garden, forgiving corrections, persistence and free play remain independent',async({page},info)=>{
 await setup(page);
 await expect(page.locator('[data-stage="unicorn-1"]')).toBeDisabled();
 await page.screenshot({path:info.outputPath('map-garden.png'),fullPage:true,animations:'disabled'});
 const free=await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY);
 for(const stage of stages.slice(0,3)) {
  await page.locator(`[data-stage="${stage.id}"]`).click();await page.clock.runFor(4050);
  await expect(page.locator('#time-left')).toBeHidden();
  if(stage.index===0) {
   await page.clock.runFor(60000); await expect(page.locator('#equation')).toBeVisible();
   await page.keyboard.type('9'); await expect(page.locator('#correction-card')).toBeVisible();
   await page.clock.runFor(2000);
   await page.getByRole('button',{name:'Mettre en pause',exact:true}).click();
   await page.keyboard.press('Tab');await expect(page.locator('#adventure-exit')).toBeFocused();
   await page.locator('#resume').click();await page.clock.runFor(4050);
  }
  for(let i=0;i<stage.count;i++) await solve(page);
  await expect(page.locator('#victory')).toBeVisible();await page.clock.runFor(10100);
  await expect(page.locator('#result-title')).toContainText(stage.index===2?'rejoint la fête':'Mission accomplie');
  await expect(page.locator('.result-actions button:visible').first()).toHaveAttribute('data-action','home');
  await expect(page.locator('.result-actions button:visible').first()).toHaveClass('play-button');
  await expect(page.locator('.result-actions button:visible').last()).toHaveClass('secondary-button');
  await page.getByRole('button',{name:'Choisir ma prochaine destination →'}).click();
 }
 await expect(page.locator('[data-stage="unicorn-1"]')).toBeEnabled();
 await expect(page.locator('[data-stage="alien-1"]')).toBeEnabled();
 await expect(page.locator('[data-stage="christmas-1"]')).toBeDisabled();
 await page.reload();await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
 await expect(page.locator('[data-world="kitten"]')).toHaveClass(/world-complete/);
 await expect(page.locator('[data-stage="alien-1"]')).toBeEnabled();
 await page.locator('#leave-adventure').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','club');
 await page.locator('#open-training').click();await page.locator('nav [data-tab="workshop"]').click();
 await expect(page.locator('#camp-table-4')).toBeChecked();await expect(page.locator('#camp-table-5')).not.toBeChecked();
 await expect(page.locator('#camp-life-5')).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBe(free);
 await page.locator('#camp-start').click();await page.clock.runFor(4050);
 await expect(page.locator('#time-left')).toBeVisible();
 await expect(page.locator('#hearts [data-heart]')).toHaveCount(5);
});
for(const width of [390,768]) test(`map and mission fit ${width}px and leaving an unfinished mission preserves progress`,async({page},info)=>{
 await page.setViewportSize({width,height:1024});await page.emulateMedia({reducedMotion:'reduce'});
 await setup(page,stages.slice(0,3).map(s=>s.id));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath(`map-${width}.png`),fullPage:true,animations:'disabled'});
 await page.locator('[data-stage="alien-1"]').click();await page.clock.runFor(4050);
 await solve(page);await page.getByRole('button',{name:'Mettre en pause',exact:true}).click();
 await page.locator('#adventure-exit').click();
 await expect(page.locator('#adventure-map')).toBeVisible();
 await expect(page.locator('[data-world="kitten"]')).toHaveClass(/world-complete/);
 await expect(page.locator('[data-world="alien"]')).not.toHaveClass(/world-complete/);
});
test('last mission reunites all eight friends and does not create a free-play record',async({page},info)=>{
 await setup(page,stages.slice(0,-1).map(s=>s.id));
 await page.locator('[data-stage="star-3"]').click();await page.clock.runFor(4050);
 test.setTimeout(120000);
 for(let i=0;i<stages.at(-1)!.count;i++) await solve(page);
 await expect(page.locator('.mission-scene[data-mission="star-3"]')).toBeVisible();
 await page.screenshot({path:info.outputPath('all-friends-victory.png'),fullPage:true,animations:'disabled'});
 await page.clock.runFor(10100);await page.getByRole('button',{name:'Choisir ma prochaine destination →'}).click();
 await expect(page.locator('.friend-invited')).toHaveCount(8);
 await page.locator('#celebrate-adventure').click();await expect(page.locator('#birthday-party')).toBeVisible();
 await page.clock.runFor(30100);await expect(page.locator('#birthday-party')).toHaveAttribute('data-chapter','finished');
 await page.locator('.birthday-back').click();await expect(page.locator('#adventure-map')).toBeVisible();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).records,STORAGE_KEY)).toEqual({});
});

for (const width of [390,1365]) {
 test(`newly unlocked worlds are revealed at ${width}px and replay does not repeat the reveal`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await setup(page,['kitten-1','kitten-2']);
  const stage=stages.find(s=>s.id==='kitten-3')!;
  await page.locator('[data-stage="kitten-3"]').click(); await page.clock.runFor(4050);
  for(let i=0;i<stage.count;i++) await solve(page);
  await page.clock.runFor(10100);
  await page.getByRole('button',{name:'Choisir ma prochaine destination →'}).click();
  await page.clock.runFor(100);
  await expect(page.locator('.mission-newly-unlocked')).toHaveCount(2);
  const unicorn=page.locator('[data-stage="unicorn-1"]');
  const alien=page.locator('[data-stage="alien-1"]');
  await expect(unicorn).toHaveClass(/mission-newly-unlocked/);
  await expect(alien).toHaveClass(/mission-newly-unlocked/);
  await expect(unicorn).toBeInViewport({ratio:.6});
  await expect(unicorn).toHaveClass(/mission-unlock-pop/);
  await expect(unicorn.locator('.mission-unlock-stars span')).toHaveCount(12);
  await expect(unicorn).toBeFocused();
  await page.screenshot({path:info.outputPath('new-worlds.png'),fullPage:false});
  await alien.scrollIntoViewIfNeeded();
  await expect(alien).toHaveClass(/mission-unlock-pop/);
  await page.clock.runFor(1500);
  await expect(page.locator('.mission-unlock-stars')).toHaveCount(0);
  await page.locator('[data-stage="kitten-3"]').click(); await page.clock.runFor(4050);
  for(let i=0;i<stage.count;i++) await solve(page);
  await page.clock.runFor(10100);
  await page.getByRole('button',{name:'Choisir ma prochaine destination →'}).click();
  await page.clock.runFor(100);
  await expect(page.locator('.mission-newly-unlocked')).toHaveCount(0);
 });
}
test('a single newly unlocked mission remains clearly marked with reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await setup(page);
 await page.locator('[data-stage="kitten-1"]').click();await page.clock.runFor(4050);
 for(let i=0;i<stages[0].count;i++) await solve(page);
 await page.clock.runFor(10100);
 await page.getByRole('button',{name:'Choisir ma prochaine destination →'}).click();
 await page.clock.runFor(100);
 await expect(page.locator('.mission-newly-unlocked')).toHaveCount(1);
 const next=page.locator('[data-stage="kitten-2"]');
 await expect(next).toBeInViewport();await expect(next).toBeFocused();
 await expect(next.locator('.mission-unlock-badge')).toHaveText('Nouvelle mission !');
 await expect(page.locator('.mission-unlock-stars')).toHaveCount(0);
 expect(await next.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
