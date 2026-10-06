import { expect, test, type Page } from '@playwright/test';
import { themeIds } from '../../src/themes';

import { prepareWorld, prepareCamp, current } from './helpers';
async function open(page: Page, theme: string) {
 if(theme==='ant') {await prepareCamp(page);return;}
 await prepareWorld(page,theme);
}
async function start(page: Page) {
 if(await page.locator('#camp-start').isVisible())await page.locator('#camp-start').click();
 await page.clock.runFor(4050);
}
for (const [index, theme] of themeIds.entries()) {
  test(`${theme}: single corner companion, immediate input and contained animations`, async ({ page }, info) => {
    const width = [1365,390,768,1024][index % 4];
    await page.setViewportSize({ width, height: width === 1024 ? 768 : 900 });
    await open(page, theme);
    if(theme!=='ant')await expect(page.locator('.keypad')).toHaveClass(/key-art-ready/);
    await start(page);
    await expect(page.locator('.key-character')).toBeVisible();
    await expect(page.locator('.key-character')).toHaveCount(1);
    await expect(page.locator('.keypad-tip')).toHaveCount(0);
    await expect(page.locator('.key-companion')).toHaveClass(/is-animated/);
    await expect(page.locator('.key-workers, .pad-star')).toHaveCount(0);
    await expect(page.locator('.key-pop:visible')).toHaveCount(0);
    const cell = await page.locator('.key-companion').boundingBox();
    const zero = await page.locator('[data-digit="0"]').boundingBox();
    expect(cell!.x + cell!.width).toBeLessThanOrEqual(zero!.x);
    expect(Math.abs(cell!.y - zero!.y)).toBeLessThan(1);
    expect(Math.abs(cell!.width - zero!.width)).toBeLessThan(1);
    expect(await page.locator('.key-companion').evaluate(el => getComputedStyle(el).overflow)).toBe('hidden');
    const motion = page.locator('.key-companion-motion');
    expect(await motion.evaluate(el => getComputedStyle(el).animationName)).toBe(`companion-${theme==='ant'?'star':theme}`);
    // Sample a complete idle loop without letting the question timer expire.
    await motion.evaluate(el => el.getAnimations().forEach(a => a.pause()));
    for (const time of [0,1750,3500,5250,6999]) {
      await motion.evaluate((el,t) => el.getAnimations().forEach(a => a.currentTime = t),time);
      expect(await page.locator('.key-companion').evaluate(el => {
        const r=el.getBoundingClientRect();
        return [...document.querySelectorAll('.keypad button, .keypad-tip')].every(other => {
          const b=other.getBoundingClientRect();
          return r.right<=b.left || r.left>=b.right || r.bottom<=b.top || r.top>=b.bottom;
        });
      })).toBe(true);
    }
    await motion.evaluate(el => el.getAnimations().forEach(a => a.play()));
    const label = (await page.locator('#equation').getAttribute('aria-label'))!;
    const [a,b] = label.match(/\d+/g)!.map(Number);
    const answer = String(label.includes('plus')?a+b:label.includes('moins')?a-b:a*b);
    await page.locator(`[data-digit="${answer[0]}"]`).click();
    if (answer.length > 1) await page.keyboard.type(answer.slice(1));
    await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow','1');
    await expect(page.locator('.key-character')).toHaveClass(/key-react/);
    if(theme!=='ant') {
      const pop=page.locator(`[data-digit="${answer[0]}"] .key-pop`);
      await expect(pop).toBeVisible();
      expect(await pop.evaluate(el=>getComputedStyle(el).animationName)).toBe('key-box-pop');
      expect(await pop.evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
    }
    await page.clock.runFor(220);
    await page.screenshot({path:info.outputPath(`${theme}-keypad.png`),fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const box of await page.locator('.keypad button').evaluateAll(buttons=>buttons.map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})))) {
      expect(box.w).toBeGreaterThanOrEqual(44); expect(box.h).toBeGreaterThanOrEqual(44);
    }
    await page.clock.runFor(550);
    await expect(page.locator('.key-character')).not.toHaveClass(/key-react/);
    await expect(page.locator('.key-pop:visible')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('.key-companion')).not.toHaveClass(/is-animated/);
    expect(await motion.evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
    await expect(page.locator('.key-pressed')).toHaveCount(0);
  });
}
test('reduced motion keeps illustrated keys and accepts input without moving characters', async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page,'christmas'); await start(page);
  await expect(page.locator('.keypad')).toHaveClass(/key-art-ready/);
  await expect(page.locator('.key-character')).toBeVisible();
  expect(await page.locator('.key-companion-motion').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.keyboard.press('1');
  await expect(page.locator('.key-character')).not.toHaveClass(/key-react/);
  await expect(page.locator('[data-digit="1"]')).toHaveClass(/key-pressed/);
});
for(const theme of ['christmas','alba'])test(`${theme}: missing artwork keeps the colorful keypad usable`, async ({page})=>{
  await page.route('**/themes/keypad-*.png',route=>route.abort());
  await open(page,theme); await start(page);
  await expect(page.locator('.keypad')).not.toHaveClass(/key-art-ready/);
  const [a,b]=(await page.locator('#equation').getAttribute('aria-label'))!.match(/\d+/g)!.map(Number);
  await page.keyboard.type(String((await current(page)).result));
  await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow','1');
  await expect(page.locator('.key-character')).toBeHidden();
  const colors=await page.locator('.keypad [data-digit]').evaluateAll(keys=>keys.map(k=>getComputedStyle(k).backgroundColor));
  expect(new Set(colors).size).toBeGreaterThanOrEqual(4);
});

for(const theme of ['dragon','nami'])test(`${theme}: touch, erase and rapid input reuse the same companion; background suspends motion`, async ({browser}) => {
  const context = await browser.newContext({hasTouch:true,viewport:{width:390,height:900}});
  const page = await context.newPage();
  await open(page,theme); await start(page);
  let [a,b]=(await page.locator('#equation').getAttribute('aria-label'))!.match(/\d+/g)!.map(Number);
  let solved = 0;
  while ((await current(page)).result < 10) {
    await page.keyboard.type(String((await current(page)).result));
    solved++;
    await page.clock.runFor(750);
    [a,b]=(await page.locator('#equation').getAttribute('aria-label'))!.match(/\d+/g)!.map(Number);
  }
  // A leading zero leaves the question open while exercising all input paths.
  await page.locator('[data-digit="0"]').tap();
  await expect(page.locator('.key-character')).toHaveClass(/key-react/);
  await page.locator('#erase').tap();
  await expect(page.locator('.key-character')).toHaveClass(/key-react-erase/);
  await page.keyboard.type('0');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('0');
  await page.clock.runFor(400);
  await page.keyboard.press('Backspace');
  await page.clock.runFor(400);
  await expect(page.locator('.key-character')).toHaveClass(/key-react-erase/);
  await expect(page.locator('.key-character')).toHaveCount(1);
  await page.keyboard.type(String((await current(page)).result));
  await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow',String(solved+1));
  await page.evaluate(() => {
    Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.key-companion')).not.toHaveClass(/is-animated/);
  await expect(page.locator('.key-character')).not.toHaveClass(/key-react/);
  await page.evaluate(() => {
    Object.defineProperty(document,'hidden',{configurable:true,value:false});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.key-companion')).not.toHaveClass(/is-animated/);
  await page.getByRole('button', { name: /On continue/ }).click();
  await page.clock.runFor(4050);
  await expect(page.locator('.key-companion')).toHaveClass(/is-animated/);
  await context.close();
});
