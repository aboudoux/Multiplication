import { expect, test, type Page } from '@playwright/test';
import { stages, ADVENTURE_KEY } from '../../src/adventure';
import { defaults, STORAGE_KEY } from '../../src/storage';

async function openParty(page: Page, completed = stages.map(s=>s.id)) {
  await page.addInitScript(({completed,key,savedKey,saved})=>{
    localStorage.setItem(key,JSON.stringify({completed}));
    localStorage.setItem(savedKey,JSON.stringify(saved));
  },{completed,key:ADVENTURE_KEY,savedKey:STORAGE_KEY,saved:{...defaults(),muted:true,voiceEnabled:false}});
  await page.clock.install({time:new Date('2026-10-01T12:00:00Z')});
  await page.goto('/');await page.clock.pauseAt(new Date('2026-10-01T12:00:05Z'));
  await page.locator('#open-adventure').click();
  if(completed.length===stages.length)await page.locator('#celebrate-adventure').click();
}

for(const width of [390,1365])test(`the 30-second birthday film, all eight guests and a clean replay (${width}px)`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await openParty(page);
  const party=page.locator('#birthday-party');
  await expect(party).toBeVisible();await expect(page.locator('#adventure-map')).toBeHidden();
  await expect(party.locator('[data-character]')).toHaveCount(8);
  await expect(party).toHaveAttribute('data-chapter','cake');
  await expect(party.locator('[data-candle]')).toHaveCount(5);
  await page.clock.runFor(4800);
  const cake=await party.locator('[data-cake]').getAttribute('transform');
  const cakeX=Number(cake!.match(/translate\(([\d.]+)/)![1]);
  expect(cakeX).toBeGreaterThan(600);expect(cakeX).toBeLessThan(780);
  await page.screenshot({path:info.outputPath('cake.png')});
  await page.clock.runFor(2500);await expect(party).toHaveAttribute('data-chapter','song');
  await expect(party).toHaveAttribute('data-singing','true');
  await page.screenshot({path:info.outputPath('song.png')});
  await page.clock.runFor(11_800);await expect(party).toHaveAttribute('data-chapter','candles');
  await expect(party).toHaveAttribute('data-candles','out');
  for(const flame of await party.locator('[data-flame]').all())await expect(flame).toHaveAttribute('opacity','0');
  await page.screenshot({path:info.outputPath('candles.png')});
  await page.clock.runFor(8000);await expect(party).toHaveAttribute('data-chapter','gifts');
  await expect(party.locator('[data-gift][opacity="1"]')).toHaveCount(24);
  await page.screenshot({path:info.outputPath('gifts.png')});
  await page.clock.runFor(3000);await expect(party).toHaveAttribute('data-chapter','finished');
  await expect(party.locator('.birthday-progress')).toHaveAttribute('aria-valuenow','30');
  await expect(party.locator('.birthday-pause')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await party.locator('.birthday-replay').click();
  await expect(party).toHaveAttribute('data-chapter','cake');
  await expect(party).toHaveAttribute('data-candles','lit');
  await expect(party.locator('[data-gift][opacity="1"]')).toHaveCount(0);
  await party.locator('.birthday-back').click();
  await expect(party).toBeHidden();await expect(page.locator('#adventure-map')).toBeVisible();
  await expect(page.locator('#celebrate-adventure')).toBeFocused();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).completed.length,ADVENTURE_KEY)).toBe(stages.length);
  expect(errors).toEqual([]);
});

test('pause, background suspension, sound and keyboard return respect the film clock',async({page})=>{
  await openParty(page);
  const party=page.locator('#birthday-party');
  await page.clock.runFor(7200);await party.locator('.birthday-pause').click();
  const stopped=await party.locator('.birthday-progress').getAttribute('aria-valuenow');
  await page.clock.runFor(20_000);await expect(party.locator('.birthday-progress')).toHaveAttribute('aria-valuenow',stopped!);
  await expect(party).toHaveAttribute('data-paused','true');
  await party.locator('.birthday-pause').click();await page.clock.runFor(500);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const hiddenAt=await party.locator('.birthday-progress').getAttribute('aria-valuenow');
  await page.clock.runFor(15_000);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(16);await expect(party.locator('.birthday-progress')).toHaveAttribute('aria-valuenow',hiddenAt!);
  await page.clock.runFor(1200);await expect(party).toHaveAttribute('data-chapter','song');
  await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
  await page.keyboard.press('Escape');await expect(party).toBeHidden();await expect(page.locator('#celebrate-adventure')).toBeFocused();
});

test('an unfinished adventure cannot start the birthday film',async({page})=>{
  await openParty(page,[]);
  await expect(page.locator('#celebrate-adventure')).toHaveCount(0);
  await expect(page.locator('#birthday-party')).toBeHidden();
});

test('reduced motion keeps the story and its ending',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await openParty(page);
  await page.clock.runFor(19_200);
  await expect(page.locator('#birthday-party')).toHaveAttribute('data-candles','out');
  await expect(page.locator('#birthday-party [data-camera]')).toHaveAttribute('transform','translate(0 0) scale(1)');
  await page.clock.runFor(11_000);await expect(page.locator('#birthday-party')).toHaveAttribute('data-chapter','finished');
});

test('the bundled soundtrack loads, follows pause and mute, and stops on return',async({page})=>{
  const missing:string[]=[];
  page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
  await page.addInitScript(()=>{
    const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function() {
      if(this.src.includes('/audio/birthday-party.mp3'))(window as Window & {birthdayMedia?:HTMLMediaElement}).birthdayMedia=this;
      return play.call(this);
    };
  });
  const media=()=>page.evaluate(()=>{
    const element=(window as Window & {birthdayMedia?:HTMLMediaElement}).birthdayMedia;
    return element?{duration:element.duration,paused:element.paused,muted:element.muted,currentTime:element.currentTime}:null;
  });
  await openParty(page);
  await expect.poll(async()=>(await media())?.duration).toBeGreaterThan(29.9);
  expect((await media())!.duration).toBeLessThan(30.15);
  expect((await media())!.muted).toBe(true);
  await page.locator('#sound').click();expect((await media())!.muted).toBe(false);
  await page.locator('.birthday-pause').click();expect((await media())!.paused).toBe(true);
  await page.locator('.birthday-pause').click();await expect.poll(async()=>(await media())?.paused).toBe(false);
  await page.locator('.birthday-back').click();expect((await media())!.paused).toBe(true);
  expect(missing).toEqual([]);
});

test('blocked soundtrack playback still allows the film and return to the map',async({page})=>{
  await page.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));});
  await openParty(page);await page.locator('#sound').click();
  await page.locator('.birthday-replay').click();
  await expect(page.locator('.birthday-audio-notice')).toBeVisible();
  await page.clock.runFor(30_100);
  await expect(page.locator('#birthday-party')).toHaveAttribute('data-chapter','finished');
  await page.locator('.birthday-back').click();await expect(page.locator('#adventure-map')).toBeVisible();
});

for(const returnWith of ['button','escape'] as const)test(`the direct preview starts automatically without unlocking missions and returns with ${returnWith}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(({key,savedKey,saved})=>{
    localStorage.setItem(key,JSON.stringify({completed:['kitten-1']}));
    localStorage.setItem(savedKey,JSON.stringify(saved));
  },{key:ADVENTURE_KEY,savedKey:STORAGE_KEY,saved:{...defaults(),muted:true,voiceEnabled:false}});
  await page.clock.install({time:new Date('2026-10-01T12:00:00Z')});
  await page.goto('/?fete=1');await page.clock.pauseAt(new Date('2026-10-01T12:00:01Z'));
  const party=page.locator('#birthday-party');
  await expect(party).toBeVisible();await expect(page.locator('#home')).toBeHidden();
  await expect(party).toHaveAttribute('data-chapter','cake');
  await page.clock.runFor(29_200);await expect(party).toHaveAttribute('data-chapter','finished');
  if(returnWith==='button')await party.locator('.birthday-back').click();
  else await page.keyboard.press('Escape');
  await expect(party).toBeHidden();await expect(page.locator('#adventure-map')).toBeVisible();
  await expect(page.locator('#map-title')).toBeFocused();
  await expect(page.locator('#celebrate-adventure')).toHaveCount(0);
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).completed,ADVENTURE_KEY)).toEqual(['kitten-1']);
  expect(errors).toEqual([]);
});
