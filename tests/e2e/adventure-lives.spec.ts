import {expect,test} from '@playwright/test';
import {stages,ADVENTURE_KEY,adventureLives} from '../../src/adventure';
import {defaults,STORAGE_KEY} from '../../src/storage';
for(const id of ['unicorn','christmas','wizard'] as const)test(`lose and retry ${id} mission without losing completed missions`,async({page},info)=>{
 const stage=stages.find(s=>s.world.id===id)!;
 const completed=stages.slice(0,stages.indexOf(stage)).map(s=>s.id);
 await page.setViewportSize({width:390,height:1000});
 await page.addInitScript(({completed,key,saveKey,saved})=>{localStorage.setItem(key,JSON.stringify({completed}));localStorage.setItem(saveKey,JSON.stringify(saved));},{completed,key:ADVENTURE_KEY,saveKey:STORAGE_KEY,saved:{...defaults(),lives:10,muted:true}});
 await page.clock.install({time:new Date('2026-09-29T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-29T12:00:10Z'));
 await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();await expect(page.locator(`[data-stage="${stage.id}"]`)).toContainText(`${adventureLives[id]} vies`);
 const before=await page.evaluate(key=>localStorage.getItem(key),ADVENTURE_KEY);
 await page.locator(`[data-stage="${stage.id}"]`).click();await page.clock.runFor(4050);
 await expect(page.locator('#hearts [data-heart]')).toHaveCount(adventureLives[id]!);
 await page.screenshot({path:info.outputPath(`${id}-hearts.png`),fullPage:true});
 for(let i=0;i<adventureLives[id]!;i++){
  const label=(await page.locator('#equation').getAttribute('aria-label'))!;const [a,b]=label.match(/\d+/g)!.map(Number);
  const result=label.includes('plus')?a+b:label.includes('moins')?a-b:a*b;
  await page.keyboard.type('0'.repeat(String(result).length));await page.clock.runFor(2050);
 }
 await expect(page.locator('#defeat')).toBeVisible();await page.clock.runFor(6100);
 await expect(page.locator('#result-title')).toHaveText('On retente la mission ?');
 expect(await page.evaluate(key=>localStorage.getItem(key),ADVENTURE_KEY)).toBe(before);
 await page.getByRole('button',{name:'Réessayer la mission',exact:true}).click();await page.clock.runFor(4050);
 await expect(page.locator('#hearts [data-heart]:not(.lost)')).toHaveCount(adventureLives[id]!);
 await expect(page.locator('#progress-caption')).toHaveText(`0 / ${stage.count}`);
 await page.locator('#pause').click();await page.locator('#adventure-exit').click();
 await expect(page.locator(`[data-stage="${id}-2"]`)).toBeDisabled();
 await expect(page.locator('[data-world="kitten"]')).toHaveClass(/world-complete/);
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).lives,STORAGE_KEY)).toBe(10);
});
