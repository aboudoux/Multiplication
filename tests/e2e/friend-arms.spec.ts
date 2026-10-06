import { expect, test, chromium, webkit } from '@playwright/test';
import { worlds } from '../../src/adventure';
// Windows WebKit instances must run sequentially to avoid native launch crashes.
test.describe.configure({mode:'serial'});
for(const engine of ['chromium','webkit'] as const) for(const width of [390,1365]) {
 test(`friend arms: ${engine} at ${width}px`,async({},info)=>{
  const browser=await (engine==='webkit'?webkit:chromium).launch({channel:engine==='chromium'?'msedge':''});
  try {
   const page=await browser.newPage({viewport:{width,height:1000}});
   await page.addInitScript(completed=>localStorage.setItem('calcul-party:adventure:v1',JSON.stringify({completed})),worlds.filter(w=>w.id!=='star').flatMap(w=>[1,2,3].map(n=>`${w.id}-${n}`)));
   await page.goto('http://127.0.0.1:4173/');await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
   await page.locator('.friend-layered img').evaluateAll(imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode())));
   await expect(page.locator('.friend-raised-arm')).toHaveCount(6);
   await expect(page.locator('.friend:not(.friend-invited) .friend-layered')).toHaveCount(0);
   await expect(page.locator('.friends-line [style*="clip-path"], .friend-arm-defs, .friend-continuous-art')).toHaveCount(0);
   await page.locator('.friends-party').scrollIntoViewIfNeeded();
   const bodyBoxes=await page.locator('.friend-body').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
   const transforms:string[][]=[];
   for(const t of [1125,1575]) {
    await page.locator('.friend-raised-arm').evaluateAll((els,time)=>els.forEach(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=time;})),t);
    transforms.push(await page.locator('.friend-raised-arm').evaluateAll(els=>els.map(el=>getComputedStyle(el).transform)));
    await page.locator('.friends-party').scrollIntoViewIfNeeded();
    await page.locator('.friends-party').screenshot({path:info.outputPath(`friends-${t}.png`)});
   }
   expect(transforms[0]).not.toEqual(transforms[1]);
   expect(await page.locator('.friend-body').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}))).toEqual(bodyBoxes.map(([x,y,w,h])=>[x,y,w,h]));
   await page.emulateMedia({reducedMotion:'reduce'});
   expect(await page.locator('.friend-raised-arm').evaluateAll(els=>els.map(el=>getComputedStyle(el).animationName))).toEqual(Array(6).fill('none'));
  } finally {await browser.close();}
 });
}
