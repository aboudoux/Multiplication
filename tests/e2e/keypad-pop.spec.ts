import {expect,test,type Locator,type Page} from '@playwright/test';
import {themeIds} from '../../src/themes';
import {current,prepareWorld,ready,solve} from './helpers';

// Inspect the rendered character at the peak of its animation, not just a class.
async function expectCharacterOutsideBox(page:Page,key:Locator,theme:string) {
  const pop=key.locator('.key-pop');
  await expect(pop).toBeVisible();
  const appearance=await pop.evaluate(el=>{
    const animation=el.getAnimations()[0];
    if(animation) {animation.pause();animation.currentTime=180;}
    const css=getComputedStyle(el);
    const box=el.getBoundingClientRect();
    const parent=el.parentElement!.getBoundingClientRect();
    return {image:css.backgroundImage,opacity:Number(css.opacity),width:box.width,height:box.height,
      above:box.top<parent.top,pointerEvents:css.pointerEvents,overflow:getComputedStyle(el.parentElement!).overflow};
  });
  expect(appearance.image).toContain(`keypad-${theme}.png`);
  expect(appearance.opacity).toBeGreaterThan(.9);
  expect(appearance.width).toBeGreaterThan(20);
  expect(appearance.height).toBeGreaterThan(20);
  expect(appearance.above).toBe(true);
  expect(appearance.overflow).toBe('visible');
  expect(appearance.pointerEvents).toBe('none');
  // An assigned URL alone is insufficient: the atlas must actually be decoded.
  expect(await pop.evaluate(async el=>{
    const url=getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)![1];
    const image=new Image();image.src=url;await image.decode();return image.naturalWidth;
  })).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  return pop;
}

for(const theme of themeIds.filter(id=>id!=='ant')) for(const width of [390,1365]) {
  test(`box character ${theme} ${width}px: click, keyboard, repeated press, varied objects and cleanup`,async({page},info)=>{
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({reducedMotion:'no-preference'});
    // Reproducible mission order; random questions must not make this UI test flaky.
    await page.addInitScript(()=>{
      let seed=20260930;
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    });
    await prepareWorld(page,theme);await page.clock.runFor(4050);await ready(page);
    // Leave an unfinished answer while checking several input paths.
    for(let i=0;(await current(page)).result<10;i++) {
      expect(i,'The mission must offer a two-digit question').toBeLessThan(9);
      await solve(page);
    }
    const key=page.locator('[data-digit="0"]');
    await key.click();const pop=await expectCharacterOutsideBox(page,key,theme);
    await page.screenshot({path:info.outputPath('character-outside-box.png'),fullPage:true});
    const firstAnimation=await pop.evaluateHandle(el=>el.getAnimations()[0]);
    await page.locator('#erase').click();await page.keyboard.press('0');
    await expectCharacterOutsideBox(page,key,theme);
    expect(await firstAnimation.evaluate(animation=>{
      const target=(animation.effect as KeyframeEffect).target!;
      return target.getAnimations()[0]!==animation;
    })).toBe(true);
    await firstAnimation.dispose();
    await page.keyboard.press('Backspace');await page.keyboard.press('0');
    await expectCharacterOutsideBox(page,key,theme);
    await page.clock.runFor(650);await expect(pop).toBeHidden();
    await page.keyboard.press('Backspace');await key.click();
    await expectCharacterOutsideBox(page,key,theme);
    const artwork=new Set<string>();
    for(let i=0;i<6;i++) {
      await page.keyboard.press('Backspace');
      if(i%2===0) await key.click(); else await page.keyboard.press('0');
      await expectCharacterOutsideBox(page,key,theme);
      artwork.add(await pop.evaluate(el=>getComputedStyle(el).backgroundPosition));
    }
    // Six original illustrations must appear; repeating one character is a regression.
    expect(artwork.size).toBe(6);
    expect(artwork.has('0% 100%'),'The first original object must still appear').toBe(true);
    expect(artwork.has('50% 100%'),'The second original object must still appear').toBe(true);
    await page.locator('#pause').click();await expect(page.locator('.key-pop:visible')).toHaveCount(0);
  });
}

test('reduced motion suppresses box movement while accepting the answer',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await prepareWorld(page,'kitten');await page.clock.runFor(4050);await ready(page);
  await page.keyboard.type(String((await current(page)).result));
  await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow','1');
  await expect(page.locator('.key-pop:visible')).toHaveCount(0);
});
