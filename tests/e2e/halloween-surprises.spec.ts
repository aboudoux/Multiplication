import {expect,test} from '@playwright/test';
import {prepareWorld,current} from './helpers';
for(const width of [390,1365])test(`Halloween adventure flights ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:1000});await page.addInitScript(()=>{Math.random=()=>.5;});await prepareWorld(page,'halloween');await page.clock.runFor(4050);
 for(let i=1;i<=7;i++){
  const q=await current(page);await page.keyboard.type(String(q.result));
  if(i===3||i===7){await expect(page.locator('#theme-surprise')).toHaveAttribute('data-effect',i===3?'bats':'witch');if(i===3)await expect(page.locator('.surprise-bat')).toHaveCount(18);await page.clock.runFor(850);await page.screenshot({path:info.outputPath(`flight-${i}.png`),fullPage:true});await page.clock.runFor(1600);}
  else await page.clock.runFor(700);
 }
 await page.locator('#pause').click();await expect(page.locator('#theme-surprise')).toBeEmpty();
});
test('reduced motion suppresses flights',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await prepareWorld(page,'halloween');await page.clock.runFor(4050);
 for(let i=0;i<4;i++){const q=await current(page);await page.keyboard.type(String(q.result));await page.clock.runFor(700);}
 await expect(page.locator('#theme-surprise')).toBeEmpty();
});
