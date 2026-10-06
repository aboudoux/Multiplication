import {expect,test} from '@playwright/test';
import {picoThemeIds} from '../../src/pico-content';
import {themes} from '../../src/themes';
import {prepareWorld,current} from './helpers';
for(const id of ['christmas','wizard','unicorn','dragon','alien','kitten',...picoThemeIds] as const)for(const width of [390,1365])test(`${id}: adventure art, three surprises and cleanup ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:1000});await page.addInitScript(()=>{Math.random=()=>.5;});await prepareWorld(page,id);await page.clock.runFor(4050);
 await expect(page.locator('html')).toHaveAttribute('data-theme',id);
 for(let i=1;i<=(['kitten','pico'].includes(id)?7:11);i++){
  const q=await current(page);await page.keyboard.type(String(q.result));
  if([3,7,11].includes(i)){
   await expect(page.locator('#theme-surprise')).toHaveAttribute('data-effect',themes[id].surprises[[3,7,11].indexOf(i)%themes[id].surprises.length].id);
   await page.clock.runFor(900);await page.screenshot({path:info.outputPath(`surprise-${i}.png`),fullPage:true});await page.clock.runFor(2200);await expect(page.locator('#theme-surprise')).toBeEmpty();
  }else await page.clock.runFor(700);
 }
 await page.locator('#pause').click();await expect(page.locator('#theme-surprise')).toBeEmpty();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
