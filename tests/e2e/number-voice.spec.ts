import {test,expect} from '@playwright/test';
import {studyBank} from '../../src/study-generator';

for(const example of [
 {skill:'large-multiply',grade:'CM1',level:1,prompt:'500 × 4',parts:['500','multiply','4']},
 {skill:'decimal-add',grade:'CM1',level:2,prompt:'0,25 + 0,25',parts:['0d25','add','0d25']},
 {skill:'signed-multiply',grade:'4e',level:1,prompt:'(5) × (-9)',parts:['5','multiply','subtract','9']},
 {skill:'priority',grade:'5e',level:2,prompt:'(3 + 2) × 4',parts:['3','add','2','multiply','4']},
])test(`annonce continue : ${example.prompt}`,async({page})=>{
 await page.addInitScript(grade=>{
  localStorage.setItem('calcul-party:players:v1',JSON.stringify({version:1,active:'voice',players:[{id:'voice',name:'Voix',avatar:'🐱',grade,adaptive:true,mastery:{},data:{'multipli-party:v1':JSON.stringify({muted:false,voiceEnabled:true})}}]}));
  const probe={draws:[] as number[],starts:[] as {parts:string[];label:string|null}[],stops:0};Object.assign(window,{numberVoiceProbe:probe});
  const random=Math.random;Math.random=()=>probe.draws.length?probe.draws.shift()!:random();
  const encoded=new WeakMap<ArrayBuffer,string>(),decoded=new WeakMap<AudioBuffer,string>(),composites=new WeakMap<AudioBuffer,string[]>();let joining:AudioBuffer;
  const fetchOriginal=window.fetch;window.fetch=async(...args)=>{const response=await fetchOriginal(...args),read=response.arrayBuffer.bind(response);response.arrayBuffer=async()=>{const bytes=await read();encoded.set(bytes,new URL(response.url).pathname.split('/').at(-1)!.replace('.wav',''));return bytes;};return response;};
  const decode=AudioContext.prototype.decodeAudioData;AudioContext.prototype.decodeAudioData=function(bytes){const token=encoded.get(bytes);return decode.call(this,bytes).then(buffer=>{if(token)decoded.set(buffer,token);return buffer;});};
  const create=AudioContext.prototype.createBuffer;AudioContext.prototype.createBuffer=function(...args){const buffer=create.apply(this,args);joining=buffer;composites.set(buffer,[]);return buffer;};
  const channel=AudioBuffer.prototype.getChannelData;AudioBuffer.prototype.getChannelData=function(index){const token=decoded.get(this);if(token&&joining)composites.get(joining)?.push(token);return channel.call(this,index);};
  const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start=function(...args){const parts=this.buffer&&composites.get(this.buffer);if(parts?.length)probe.starts.push({parts:[...parts],label:document.getElementById('equation')?.textContent??null});return start.apply(this,args);};
  AudioBufferSourceNode.prototype.stop=function(...args){if(this.buffer&&composites.get(this.buffer)?.length)probe.stops++;return stop.apply(this,args);};
 },example.grade);
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
 await page.locator('#open-training').click();await page.locator('#learning-level').selectOption(String(example.level));
 const bank=[...studyBank(example.skill,example.grade as 'CM1'|'4e'|'5e',example.level)],target=bank.find(q=>q.exercise!.prompt===example.prompt)!;
 expect(target).toBeTruthy();const ordered=[target,...bank.filter(q=>q.id!==target.id)],pool=[...bank],draws:number[]=[];
 for(let i=pool.length-1;i>0;i--){const j=pool.findIndex(q=>q.id===ordered[i].id);draws.push((j+.5)/(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 await page.evaluate(draws=>{(window as any).numberVoiceProbe.draws=draws;},draws);
 await page.locator(`[data-skill=${example.skill}]`).click();await page.clock.runFor(4050);
 await expect.poll(async()=>{await page.clock.runFor(16);return page.evaluate(()=>(window as any).numberVoiceProbe.starts.length);}).toBeGreaterThan(0);
 await expect(page.locator('#equation')).toHaveText(example.prompt);
 expect(await page.evaluate(()=>(window as any).numberVoiceProbe.starts[0].parts)).toEqual(example.parts);
 await page.locator('#repeat-question').click();await expect.poll(()=>page.evaluate(()=>(window as any).numberVoiceProbe.starts.length)).toBe(2);
 await page.locator('#pause').click();expect(await page.evaluate(()=>(window as any).numberVoiceProbe.stops)).toBeGreaterThan(0);
});
