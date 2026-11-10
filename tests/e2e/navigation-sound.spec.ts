import {test,expect,type Page} from '@playwright/test';
import {defaults,STORAGE_KEY} from '../../src/storage';
import { CLOCK_PROGRESS_KEY, clockCorrectionMs } from '../../src/clock-games';
import { answerClock, openClockArcade } from './clock-helpers';

const funkBassRiff = [41.2, 82.41, 41.2, 49, 55, 58.27, 61.74, 73.42, 41.2];

async function prepare(page:Page,muted=false,voiceEnabled=false) {
 await page.addInitScript(({key,saved})=>{
  localStorage.setItem(key,JSON.stringify(saved));
  const probe:{frequency:number;type:string;delay:number;cancelled:boolean}[]=[];
  Object.assign(window,{navigationProbe:probe});
  const create=AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator=function(){
   const node=create.call(this);let frequency=440;
   const set=node.frequency.setValueAtTime.bind(node.frequency);
   node.frequency.setValueAtTime=(value,at)=>{frequency=value;return set(value,at);};
   const start=node.start.bind(node);const context=this;
   let played:typeof probe[number]|undefined;
   node.start=(at=0)=>{played={frequency,type:node.type,delay:at-context.currentTime,cancelled:false};probe.push(played);start(at);};
   const stop=node.stop.bind(node);
   node.stop=(at?:number)=>{if(played && at===undefined)played.cancelled=true;stop(at);};
   return node;
  };
 },{key:STORAGE_KEY,saved:{...defaults(),muted,voiceEnabled}});
 await page.goto('/');
}
async function count(page:Page) {return page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='triangle'&&[523.25,659.25,783.99].includes(note.frequency)).length);}
async function chime(page:Page,selector:string) {
 const before=await count(page);await page.locator(selector).click();
 await expect.poll(()=>count(page)).toBe(before+3);
 const notes=await page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='triangle'&&[523.25,659.25,783.99].includes(note.frequency)).slice(-3));
 expect(notes.map((note:any)=>note.frequency)).toEqual([523.25,659.25,783.99]);
 expect(notes.every((note:any)=>note.type==='triangle')).toBe(true);
 expect(notes.every((note:any)=>!note.cancelled)).toBe(true);
 expect(notes[2].delay-notes[0].delay).toBeGreaterThan(.1);
 expect(notes[2].delay-notes[0].delay).toBeLessThan(.24);
}

test('first click, camp menus, adventure and return each play one short chime',async({page})=>{
 await prepare(page);expect(await count(page)).toBe(0);
 await chime(page,'#open-training');await chime(page,'nav [data-tab="workshop"]');
 await chime(page,'nav [data-tab="colony"]');await chime(page,'#camp-home');
 await chime(page,'#open-adventure');await chime(page,'[data-adventure="chaton"]');await chime(page,'#leave-adventure');
 await page.locator('#open-training').focus();const before=await count(page);await page.keyboard.press('Enter');
 await expect.poll(()=>count(page)).toBe(before+3);
});

test('the ants button keeps all three notes when music is already running',async({page})=>{
 await prepare(page);await page.locator('h1').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).navigationProbe.some((note:any)=>note.type==='sine'))).toBe(true);
 await chime(page,'#open-training');
 await expect(page.locator('html')).toHaveAttribute('data-theme','ant');
 await page.waitForTimeout(350);
 expect(await page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='triangle'&&[523.25,659.25,783.99].includes(note.frequency)).every((note:any)=>!note.cancelled))).toBe(true);
});

test('muting silences menus and unmuting restores the chime',async({page})=>{
 await prepare(page,true);await page.locator('#open-training').click();
 await page.locator('nav [data-tab="workshop"]').click();expect(await count(page)).toBe(0);
 await page.locator('#sound').click();await chime(page,'nav [data-tab="colony"]');
 await page.locator('#sound').click();await page.locator('#camp-home').click();expect(await count(page)).toBe(3);
});

test('blocked audio still allows menu navigation',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'AudioContext',{value:class{constructor(){throw new Error('No audio');}}});});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.locator('#open-training').click();
 await page.locator('nav [data-tab="colony"]').click();await expect(page.locator('.colony-site')).toBeVisible();
 await page.locator('#camp-home').click();await expect(page.locator('#open-adventure')).toBeVisible();expect(errors).toEqual([]);
});

test('blocked autoplay falls back to a gesture, then respects navigation, mute and visibility',async({page})=>{
 await page.addInitScript(()=>{
  const NativeAudioContext=window.AudioContext;
  window.AudioContext=class extends NativeAudioContext {
   constructor(){super();void this.suspend();}
   resume(){return navigator.userActivation.isActive?super.resume():Promise.resolve();}
  };
 });
 await prepare(page);
 const music=()=>page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='sine').length);
 await page.waitForTimeout(800);expect(await music()).toBe(0);
 await page.locator('h1').click();await expect.poll(music).toBeGreaterThan(0);
 await chime(page,'#open-training');const away=await music();await expect.poll(music).toBeGreaterThan(away);
 await chime(page,'#camp-home');await expect.poll(music).toBeGreaterThan(away);
 await page.locator('#sound').click();const muted=await music();await page.waitForTimeout(800);expect(await music()).toBe(muted);
 await page.locator('#sound').click();await expect.poll(music).toBeGreaterThan(muted);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await music();await page.waitForTimeout(800);expect(await music()).toBe(hidden);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(music).toBeGreaterThan(hidden);
});

test('menu music continues through camp and adventure, stops on launch and resumes on return',async({page})=>{
 await prepare(page);await page.locator('h1').click();
 const music=()=>page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='sine').length);
 await expect.poll(music).toBeGreaterThan(0);
 for (const selector of ['#open-training','nav [data-tab="workshop"]','nav [data-tab="colony"]','#camp-home','#open-adventure','[data-adventure="chaton"]','#leave-adventure']) {
  const before=await music();await chime(page,selector);await expect.poll(music).toBeGreaterThan(before);
 }
 await chime(page,'#open-training');await chime(page,'nav [data-tab="workshop"]');
 await page.locator('#camp-start').click();const duringCountdown=await music();
 await page.waitForTimeout(1000);expect(await music()).toBe(duringCountdown);
 await expect(page.locator('#countdown-panel')).toBeVisible();
 await page.locator('#pause').click();await page.locator('#camp-exit').click();
 await expect.poll(music).toBeGreaterThan(duringCountdown);
 await page.locator('#camp-home').click();await page.locator('#open-adventure').click();await page.locator('[data-adventure="chaton"]').click();
 await page.locator('[data-stage="kitten-1"]').click();const adventureCountdown=await music();
 await page.waitForTimeout(1000);expect(await music()).toBe(adventureCountdown);
});

test('la mélodie rythmée du lapin continue pendant la correction, la pause et le bilan', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '["read:0","read:1","read:2"]'), CLOCK_PROGRESS_KEY);
  await prepare(page);
  const notes = () => page.evaluate(() => (window as any).navigationProbe.filter((note: any) =>
    note.type === 'sine' && [130.81, 110, 87.31, 98, 146.83, 1220].includes(note.frequency)));
  await openClockArcade(page);
  await expect.poll(async () => (await notes()).some((note: any) => note.frequency === 130.81)).toBe(true);
  await expect.poll(() => page.evaluate(() => {
    const notes = (window as any).navigationProbe.filter((note: any) => note.type === 'triangle');
    return [880, 329.63, 392].every(pitch => notes.some((note: any) => note.frequency === pitch));
  })).toBe(true);
  expect((await notes()).some((note: any) => note.frequency === 1220)).toBe(true);
  await page.getByRole('button', { name: 'Lire l’histoire' }).click();
  const story = (await notes()).length;
  await expect.poll(async () => (await notes()).length).toBeGreaterThan(story);
  await page.getByRole('button', { name: 'Tous les jeux' }).click();
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-level="0"]').click();
  await expect(page.locator('.clock-guest-trail')).toBeVisible();
  const effects = (type: OscillatorType, frequencies: number[]) => page.evaluate(({ waveform, values }) =>
    (window as any).navigationProbe.filter((note: any) => note.type === waveform && values.includes(note.frequency)).map((note: any) => note.frequency), { waveform: type, values: frequencies });
  const fanfare = [369.99, 554.37, 739.99, 932.33, 739.99];
  await answerClock(page);
  await expect.poll(() => effects('triangle', fanfare)).toEqual(fanfare);
  await expect.poll(() => effects('sawtooth', fanfare)).toEqual(fanfare);
  const start = (await notes()).length;
  await answerClock(page, false);
  await expect(page.locator('.clock-lesson')).toBeVisible();
  await expect.poll(() => effects('sine', funkBassRiff)).toEqual(funkBassRiff);
  await expect.poll(async () => (await notes()).length).toBeGreaterThan(start);
  await expect(page.locator('.clock-lesson')).toBeHidden({ timeout: 8000 });
  await page.locator('[data-clock-action="pause"]').click();
  const paused = (await notes()).length;
  await expect.poll(async () => (await notes()).length).toBeGreaterThan(paused);
  await page.locator('[data-clock-action="resume"]').click();
  for (let index = 0; index < 3; index++) await answerClock(page);
  await expect(page.getByRole('heading', { name: 'Bien joué !' })).toBeVisible();
  const finished = (await notes()).length;
  await expect.poll(async () => (await notes()).length).toBeGreaterThan(finished);
  expect((await notes()).every((note: any) => !note.cancelled)).toBe(true);
  await page.locator('#sound').click();
  const muted = (await notes()).length;
  await page.waitForTimeout(700);
  expect((await notes()).length).toBe(muted);
});

test('le chrono expiré joue un riff de basse funk et le rejeu le coupe', async ({ page }) => {
  await page.clock.install();
  await prepare(page);
  await openClockArcade(page);
  await page.locator('[data-game="read"]').click();
  await page.locator('[data-level="0"]').click();
  const bass = () => page.evaluate(frequencies => (window as any).navigationProbe.filter((note: any) =>
    note.type === 'sine' && frequencies.includes(note.frequency)), funkBassRiff);
  expect(await bass()).toHaveLength(0);
  await page.clock.fastForward(100_000);
  await expect(page.getByRole('heading', { name: 'Le chrono a sonné !' })).toBeVisible();
  const riff = await bass();
  expect(riff.map((note: any) => note.frequency)).toEqual(funkBassRiff);
  expect(riff.at(-1).delay).toBeGreaterThan(1.8);
  await page.getByRole('button', { name: 'Rejouer' }).click();
  expect((await bass()).at(-1).cancelled).toBe(true);
});

test('la voix du lapin joue au bilan et s’arrête au retour aux niveaux', async ({ page }) => {
  await page.addInitScript(() => {
    const lines: { stopped: boolean }[] = [];
    Object.assign(window, { rabbitLines: lines });
    const create = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = create.call(this);
      const start = source.start.bind(source);
      const stop = source.stop.bind(source);
      let line: typeof lines[number] | undefined;
      source.start = (...args) => {
        if (source.buffer && source.buffer.duration > 1.5 && Math.abs(source.playbackRate.value - 1.15) < .01) {
          line = { stopped: false };
          lines.push(line);
        }
        start(...args);
      };
      source.stop = (...args) => {
        if (line) line.stopped = true;
        stop(...args);
      };
      return source;
    };
  });
  await prepare(page, false, true);
  await openClockArcade(page);
  await page.locator('[data-game="read"]').click();
  await page.locator('[data-level="0"]').click();
  const lines = () => page.evaluate(() => (window as any).rabbitLines);
  for (let index = 0; index < 4; index++) await answerClock(page);
  expect(await lines()).toHaveLength(0);
  await answerClock(page);
  await expect(page.locator('.clock-finish-bubble')).toHaveText('Oh là là, je suis en retard !');
  await expect.poll(lines).toEqual([{ stopped: false }]);
  await page.getByRole('button', { name: 'Retour aux niveaux' }).click();
  await expect.poll(lines).toEqual([{ stopped: true }]);
});

test('le Lapin chrono lit les questions et interrompt la voix à la correction et en pause', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(key => localStorage.setItem(key, '["read:0","read:1","read:2"]'), CLOCK_PROGRESS_KEY);
  await page.addInitScript(() => {
    const readings: { question: string; audible: boolean; stopped: boolean }[] = [];
    Object.assign(window, { clockReadings: readings });
    const start = AudioBufferSourceNode.prototype.start;
    const stop = AudioBufferSourceNode.prototype.stop;
    const active = new WeakMap<AudioBufferSourceNode, typeof readings[number]>();
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer && this.buffer.duration > .6 && this.playbackRate.value === 1) {
        const entry = { question: document.querySelector('.clock-status .streak')?.textContent ?? '',
          audible: this.buffer.getChannelData(0).some(sample => Math.abs(sample) > .005), stopped: false };
        active.set(this, entry);
        readings.push(entry);
      }
      return start.apply(this, args);
    };
    AudioBufferSourceNode.prototype.stop = function (...args) {
      const entry = active.get(this);
      if (entry) entry.stopped = true;
      return stop.apply(this, args);
    };
  });
  await prepare(page, false, true);
  await openClockArcade(page);
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-level="0"]').click();
  const readings = () => page.evaluate(() => (window as any).clockReadings);
  await expect.poll(readings).toEqual([{ question: 'Question 1 sur 5', audible: true, stopped: false }]);
  await answerClock(page);
  await expect.poll(async () => (await readings()).at(-1)).toEqual({ question: 'Question 2 sur 5', audible: true, stopped: false });
  expect((await readings())[0].stopped).toBe(true);
  await answerClock(page, false);
  await expect(page.locator('.clock-lesson')).toBeVisible();
  expect((await readings()).at(-1).stopped).toBe(true);
  await page.clock.fastForward(clockCorrectionMs + 100);
  await expect.poll(async () => (await readings()).at(-1)).toEqual({ question: 'Question 3 sur 5', audible: true, stopped: false });
  await page.locator('[data-clock-action="pause"]').click();
  expect((await readings()).at(-1).stopped).toBe(true);
  await page.locator('[data-clock-action="resume"]').click();
  await expect.poll(async () => (await readings()).length).toBe(4);
  await page.locator('#voice').click();
  expect((await readings()).at(-1).stopped).toBe(true);
  await answerClock(page);
  expect(await readings()).toHaveLength(4);
  await page.locator('#voice').click();
  await expect.poll(async () => (await readings()).at(-1)).toEqual({ question: 'Question 4 sur 5', audible: true, stopped: false });
});

test.describe('audible autoplay permitted',()=>{
 test('home music starts on arrival without any click',async({playwright})=>{
  const browser=await playwright.chromium.launch({channel:'msedge',args:['--autoplay-policy=no-user-gesture-required']});
  try {
  const page=await browser.newPage({baseURL:'http://127.0.0.1:4173'});
  await prepare(page);
  await expect.poll(()=>page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='sine').length)).toBeGreaterThan(0);
  await expect(page.locator('#home')).toBeVisible();
  } finally {await browser.close();}
 });
 test('saved mute still prevents music on arrival',async({playwright})=>{
  const browser=await playwright.chromium.launch({channel:'msedge',args:['--autoplay-policy=no-user-gesture-required']});
  try {
  const page=await browser.newPage({baseURL:'http://127.0.0.1:4173'});
  await prepare(page,true);await page.waitForTimeout(1000);
  expect(await page.evaluate(()=>(window as any).navigationProbe.length)).toBe(0);
  } finally {await browser.close();}
 });
});
