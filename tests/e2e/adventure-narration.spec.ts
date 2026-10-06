import {test,expect,type Page} from '@playwright/test';
import {adventures,type AdventureDefinition} from '../../src/adventure';
import {mentalPaths} from '../../src/mental-patterns';

interface Narration {
  question:string;startedAt:number;durationMs:number;pcm:boolean;stopped:boolean;endedAt?:number;
  limit:string|null;waiting:string|null;
}
const probe=(page:Page)=>page.evaluate(()=>(window as unknown as {adventureNarrationProbe:Narration[]}).adventureNarrationProbe);

async function setup(page:Page,adventure:AdventureDefinition,world=0) {
  await page.addInitScript(({adventures,paths})=>{
    Math.random=()=>.5;
    localStorage.setItem('calcul-party:players:v1',JSON.stringify({version:1,active:'narration',players:[{
      id:'narration',name:'Narration',avatar:'🐱',grade:'CE1',adaptive:true,adventureDifficulty:'normal',
      adventurePractice:{CE1:Object.fromEntries(paths.map(id=>[id,1]))},mastery:{},
      data:{'multipli-party:v1':JSON.stringify({muted:false,voiceEnabled:true}),
        ...Object.fromEntries(adventures.map(a=>[a.storageKey,JSON.stringify({completed:a.stages.map(s=>s.id)})]))},
    }]}));
    // Observe actual decoded WAV playback and native ended events; do not fake the audio clock.
    const records: Narration[]=[],active=new WeakMap<AudioBufferSourceNode,Narration>();
    Object.assign(window,{adventureNarrationProbe:records});
    const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start=function(...args){
      const input=document.getElementById('study-input-0') as HTMLInputElement|null;
      if(this.buffer&&args.length===0&&input&&document.getElementById('overlay')!.hidden&&!document.getElementById('play')!.hidden){
        const clock=document.getElementById('time-progress')!;
        const record:Narration={question:document.getElementById('equation')!.textContent!,startedAt:performance.now(),
          durationMs:this.buffer.duration/this.playbackRate.value*1000,pcm:this.buffer.getChannelData(0).some(sample=>Math.abs(sample)>.001),
          stopped:false,limit:clock.getAttribute('aria-valuemax'),waiting:clock.getAttribute('aria-valuetext')};
        active.set(this,record);records.push(record);
        this.addEventListener('ended',()=>{record.endedAt=performance.now();},{once:true});
      }
      return start.apply(this,args);
    };
    AudioBufferSourceNode.prototype.stop=function(...args){const record=active.get(this);if(record)record.stopped=true;return stop.apply(this,args);};
  },{adventures,paths:mentalPaths.CE1});
  await page.goto('/');
  await page.locator('#open-adventure').click();
  await page.locator(`[data-adventure=${adventure.id}]`).click();
  const stage=adventure.stages.find(s=>s.world.id===adventure.worlds[world].id&&s.index===0)!;
  await page.locator(`[data-stage="${stage.id}"]`).click();
  await expect(page.locator('#study-input-0')).toBeEnabled({timeout:10000});
}
async function waitForNaturalEnd(page:Page,index=0) {
  await expect.poll(async()=>{const records=await probe(page);return records[index]?.endedAt!==undefined&&!records[index].stopped;},{timeout:10000}).toBe(true);
  await expect(page.locator('#time-progress')).toHaveAttribute('aria-valuetext',/secondes restantes/);
}
const seconds=async(page:Page)=>Number((await page.locator('#time-left').innerText()).replace(' s',''));

for(const adventure of adventures)for(const [world,budget]of [[0,20],[1,25]] as const)test(`${adventure.id} : budget ${budget}s après la vraie lecture, saisie active`,async({page})=>{
  await setup(page,adventure,world);
  await expect.poll(async()=>(await probe(page)).length).toBe(1);
  const first=(await probe(page))[0];
  expect(first.pcm).toBe(true);
  expect(first.limit).toBe(String(budget));
  expect(first.waiting).toBe('Le chrono attend la lecture');
  await expect(page.locator('#repeat-question')).toBeDisabled();
  await page.locator('#study-input-0').fill('-');
  await expect(page.locator('#study-input-0')).toHaveValue('-');
  await page.locator('#study-input-0').fill('');
  await waitForNaturalEnd(page);
  const finished=(await probe(page))[0];
  expect(finished.endedAt!-finished.startedAt).toBeGreaterThan(finished.durationMs-150);
  expect(await seconds(page)).toBeGreaterThanOrEqual(budget-1);
  expect(await seconds(page)).toBeLessThanOrEqual(budget);
  await expect(page.locator('#repeat-question')).toBeEnabled();
  await expect.poll(()=>seconds(page)).toBeLessThan(budget);
});

test('une pause pendant la lecture conserve la réponse, puis une pause du chrono conserve son reste',async({page})=>{
  await setup(page,adventures[0],1);
  await page.locator('#study-input-0').fill('-');
  await page.locator('#pause').click();
  await expect(page.locator('#pause-panel')).toBeVisible();
  expect((await probe(page))[0].stopped).toBe(true);
  await expect(page.locator('#time-left')).toHaveText('25 s');
  await page.locator('#resume').click();
  await expect.poll(async()=>(await probe(page)).length,{timeout:10000}).toBe(2);
  await expect(page.locator('#study-input-0')).toHaveValue('-');
  await expect(page.locator('#time-left')).toHaveText('25 s');
  await waitForNaturalEnd(page,1);
  await expect.poll(()=>seconds(page)).toBeLessThan(25);
  await page.locator('#pause').click();
  const remaining=await seconds(page);
  await page.locator('#resume').click();
  await expect(page.locator('#study-input-0')).toBeEnabled({timeout:10000});
  expect(await seconds(page)).toBeLessThanOrEqual(remaining);
  expect(await seconds(page)).toBeGreaterThanOrEqual(remaining-1);
  await expect(page.locator('#time-progress')).toHaveAttribute('aria-valuetext',/secondes restantes/);
});

test('le passage en arrière-plan pendant la voix conserve l’attente de lecture à la reprise',async({page})=>{
  await setup(page,adventures[1],1);
  // Headless browsers keep each test page visible; exercise the real visibility handler.
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{value:true,configurable:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#pause-panel')).toBeVisible();
  expect((await probe(page))[0].stopped).toBe(true);
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{value:false,configurable:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.locator('#resume').click();
  await expect.poll(async()=>(await probe(page)).length,{timeout:10000}).toBe(2);
  expect((await probe(page))[1].waiting).toBe('Le chrono attend la lecture');
  await expect(page.locator('#time-left')).toHaveText('25 s');
  await waitForNaturalEnd(page,1);
  expect(await seconds(page)).toBeGreaterThanOrEqual(24);
});

test('une voix indisponible démarre le chrono sans bloquer et la réécoute ne le renouvelle pas',async({page})=>{
  await page.route('**/voice/fr/**',route=>route.abort('failed'));
  await setup(page,adventures[1],1);
  await expect(page.locator('#voice-unavailable')).toBeVisible();
  await expect(page.locator('#time-progress')).toHaveAttribute('aria-valuetext',/secondes restantes/);
  expect(await probe(page)).toEqual([]);
  await expect.poll(()=>seconds(page)).toBeLessThan(25);
  const before=await seconds(page);
  await page.locator('#repeat-question').click();
  expect(await seconds(page)).toBeLessThanOrEqual(before);
  await expect(page.locator('#study-input-0')).toBeEnabled();
});

test('couper puis réactiver la voix pendant un calcul ne redonne pas son budget',async({page})=>{
  await setup(page,adventures[0],1);
  await page.locator('#voice').click();
  expect((await probe(page))[0].stopped).toBe(true);
  await expect(page.locator('#time-progress')).toHaveAttribute('aria-valuetext',/secondes restantes/);
  await expect.poll(()=>seconds(page)).toBeLessThan(25);
  const before=await seconds(page);
  await page.locator('#voice').click();
  await expect.poll(async()=>(await probe(page)).length).toBe(2);
  expect(await seconds(page)).toBeLessThanOrEqual(before);
  await waitForNaturalEnd(page,1);
  expect(await seconds(page)).toBeLessThanOrEqual(before);
});

test('répondre pendant la première voix ne démarre pas le chrono du calcul suivant',async({page})=>{
  await setup(page,adventures[1],0);
  const operands=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);
  await page.locator('#study-input-0').fill(String(operands[0]*operands[1]));
  await expect(page.locator('#progress')).toHaveAttribute('aria-valuenow','1');
  await expect.poll(async()=>(await probe(page)).length).toBe(2);
  const records=await probe(page);
  expect(records[0].stopped).toBe(true);
  expect(records[1].waiting).toBe('Le chrono attend la lecture');
  await expect(page.locator('#time-left')).toHaveText('20 s');
  await waitForNaturalEnd(page,1);
  expect(await seconds(page)).toBeGreaterThanOrEqual(19);
});
