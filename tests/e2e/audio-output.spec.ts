import {test,expect,type Page} from '@playwright/test';
import {defaults,STORAGE_KEY} from '../../src/storage';

async function open(page:Page,muted=false) {
 await page.addInitScript(({key,saved})=>{
  localStorage.setItem(key,JSON.stringify(saved));
  const createGain=AudioContext.prototype.createGain;
  AudioContext.prototype.createGain=function(){
   const gain=createGain.call(this),context=this,connect=gain.connect.bind(gain);
   gain.connect=((target:AudioNode,...args:any[])=>{
    if(target===context.destination){
     const analyser=context.createAnalyser();analyser.fftSize=2048;
     connect(analyser);analyser.connect(target);
     Object.assign(window,{outputAnalyser:analyser,outputContext:context});
     return target;
    }
    return (connect as any)(target,...args);
   }) as typeof gain.connect;
   return gain;
  };
 },{key:STORAGE_KEY,saved:{...defaults(),muted,voiceEnabled:false}});
 await page.goto('/');
}
const rms=(page:Page)=>page.evaluate(()=>{
 const analyser=(window as any).outputAnalyser as AnalyserNode|undefined;
 if(!analyser)return 0;
 const samples=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(samples);
 return Math.sqrt(samples.reduce((total,value)=>total+value*value,0)/samples.length);
});

test('activation produces actual audio output and mute silences it',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true}));
 await open(page,true);await expect(page.locator('#menu-audio-enable')).toBeVisible();
 await page.locator('#menu-audio-enable').click();await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 expect(await page.evaluate(()=>(navigator as any).audioSession.type)).toBe('playback');
 await expect(page.locator('#menu-audio-enable')).toBeHidden();
 await page.locator('#open-training').click();await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await page.locator('#sound').click();await expect.poll(()=>rms(page)).toBeLessThan(.0001);
});

test('a rejected optional audio-session setting does not prevent sound',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'audioSession',{get(){throw new Error('Unavailable');},configurable:true}));
 await open(page,true);await page.locator('#menu-audio-enable').click();
 await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
});

test('an interrupted Safari-style context resumes on a menu click and emits audio',async({page})=>{
 await page.addInitScript(()=>{
  const Native=window.AudioContext;
  const nativeState=Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'state')!.get!;
  window.AudioContext=class extends Native {
   private interrupted=true;
   constructor(){super();void this.suspend();}
   get state(){return this.interrupted?'interrupted' as AudioContextState:nativeState.call(this);}
   resume(){if(!navigator.userActivation.isActive)return Promise.resolve();this.interrupted=false;return super.resume();}
  };
 });
 await open(page);await expect(page.locator('#menu-audio-enable')).toBeVisible();
 expect(await rms(page)).toBe(0);
 await page.locator('#open-training').click();await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await expect(page.locator('#menu-audio-enable')).toBeHidden();
});

test('a closed context is recreated on the next menu click',async({page})=>{
 await open(page);await page.locator('h1').click();await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await page.evaluate(async()=>{await (window as any).outputContext.close();});
 await expect(page.locator('#menu-audio-enable')).toBeVisible();
 await page.locator('#open-training').click();await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await expect(page.locator('#menu-audio-enable')).toBeHidden();
});
