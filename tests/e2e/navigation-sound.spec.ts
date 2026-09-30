import {test,expect,type Page} from '@playwright/test';
import {defaults,STORAGE_KEY} from '../../src/storage';

async function prepare(page:Page,muted=false) {
 await page.addInitScript(({key,saved})=>{
  localStorage.setItem(key,JSON.stringify(saved));
  const probe:{frequency:number;type:string;delay:number}[]=[];
  Object.assign(window,{navigationProbe:probe});
  const create=AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator=function(){
   const node=create.call(this);let frequency=440;
   const set=node.frequency.setValueAtTime.bind(node.frequency);
   node.frequency.setValueAtTime=(value,at)=>{frequency=value;return set(value,at);};
   const start=node.start.bind(node);const context=this;
   node.start=(at=0)=>{probe.push({frequency,type:node.type,delay:at-context.currentTime});start(at);};
   return node;
  };
 },{key:STORAGE_KEY,saved:{...defaults(),muted,voiceEnabled:false}});
 await page.goto('/');
}
async function count(page:Page) {return page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='triangle'&&[523.25,659.25,783.99].includes(note.frequency)).length);}
async function chime(page:Page,selector:string) {
 const before=await count(page);await page.locator(selector).click();
 await expect.poll(()=>count(page)).toBe(before+3);
 const notes=await page.evaluate(()=>(window as any).navigationProbe.filter((note:any)=>note.type==='triangle'&&[523.25,659.25,783.99].includes(note.frequency)).slice(-3));
 expect(notes.map((note:any)=>note.frequency)).toEqual([523.25,659.25,783.99]);
 expect(notes.every((note:any)=>note.type==='triangle')).toBe(true);
 expect(notes[2].delay-notes[0].delay).toBeGreaterThan(.1);
 expect(notes[2].delay-notes[0].delay).toBeLessThan(.24);
}

test('first click, camp menus, adventure and return each play one short chime',async({page})=>{
 await prepare(page);expect(await count(page)).toBe(0);
 await chime(page,'#open-training');await chime(page,'nav [data-tab="workshop"]');
 await chime(page,'nav [data-tab="colony"]');await chime(page,'#camp-home');
 await chime(page,'#open-adventure');await chime(page,'#leave-adventure');
 await page.locator('#open-training').focus();const before=await count(page);await page.keyboard.press('Enter');
 await expect.poll(()=>count(page)).toBe(before+3);
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
 await chime(page,'#open-training');const away=await music();await page.waitForTimeout(800);expect(await music()).toBe(away);
 await chime(page,'#camp-home');await expect.poll(music).toBeGreaterThan(away);
 await page.locator('#sound').click();const muted=await music();await page.waitForTimeout(800);expect(await music()).toBe(muted);
 await page.locator('#sound').click();await expect.poll(music).toBeGreaterThan(muted);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await music();await page.waitForTimeout(800);expect(await music()).toBe(hidden);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(music).toBeGreaterThan(hidden);
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
