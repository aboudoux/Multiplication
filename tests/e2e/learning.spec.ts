import {test,expect,type Page} from '@playwright/test';
async function player(page:Page,age='5') {
 await page.addInitScript(()=>localStorage.setItem('multipli-party:v1',JSON.stringify({muted:true,voiceEnabled:false})));
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
 await page.locator('#player-picker').click();await page.locator('#new-player [name=name]').fill('Lina');await page.locator('#new-player [name=age]').selectOption(age);await page.locator('#new-player button[type=submit]').click();
 // New players have independent sound preferences; turn off speech for a deterministic clock-driven test.
 await page.locator('#sound').click();await page.locator('#open-training').click();
}
async function launch(page:Page,id:string) {
 const button=page.locator(`[data-skill=${id}]`);
 await button.evaluate(element=>{let parent=element.parentElement;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}});
 await button.click();
}
test('les nouveaux opérateurs ont une voix locale prête, réécoutable et annulable',async({page})=>{
 const requests:string[]=[];page.on('request',request=>{if(request.url().includes('/voice/fr/tokens/'))requests.push(request.url());});
 await page.addInitScript(()=>{
  const probe:{clips:{label:string|null;duration:number}[];stops:number}={clips:[],stops:0};Object.assign(window,{studySpeechProbe:probe});
  const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer&&this.buffer.duration>1)probe.clips.push({label:document.getElementById('equation')?.getAttribute('aria-label')??null,duration:this.buffer.duration});return start.apply(this,args);};
  AudioBufferSourceNode.prototype.stop=function(...args){if(this.buffer&&this.buffer.duration>1)probe.stops++;return stop.apply(this,args);};
 });
 await player(page,'8');await page.locator('#sound').click();await launch(page,'divide');await page.clock.runFor(4050);
 await expect.poll(async()=>{await page.clock.runFor(16);return page.locator('#study-input-0').isEnabled();}).toBe(true);
 const label=await page.locator('#equation').getAttribute('aria-label');await expect.poll(()=>page.evaluate(label=>(window as any).studySpeechProbe.clips.filter((c:{label:string})=>c.label===label).length,label)).toBeGreaterThan(0);
 expect(requests.some(url=>url.endsWith('/divide.wav'))).toBe(true);await page.locator('#repeat-question').click();await page.locator('#pause').click();
 expect(await page.evaluate(()=>(window as any).studySpeechProbe.stops)).toBeGreaterThan(0);
});
test('une série difficile propose un prérequis à la séance suivante',async({page})=>{
 await player(page,'6');await launch(page,'add');await page.clock.runFor(4050);
 for(let i=0;i<10;i++){
  const [a,b]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(a+b+1));await page.locator('#study-submit').click();await expect(page.locator('#study-explanation')).toBeVisible();await page.clock.runFor(2100);
 }
 await expect(page.locator('.study-visual')).toHaveCount(0);await page.locator('#pause').click();await page.locator('#camp-exit').click();await expect(page.locator('#learning-recommended')).toHaveAttribute('data-recommended','small-add');
 await page.locator('#learning-recommended').click();await page.clock.runFor(4050);await expect(page.locator('.study-visual')).toBeVisible();
});
test('une séance explicite attend Valider et crédite le profil actif',async({page})=>{
 await player(page);await launch(page,'small-add');await page.clock.runFor(4050);
 for(let i=0;i<5;i++){
  const label=(await page.locator('#equation').getAttribute('aria-label'))!;const [a,b]=label.match(/\d+/g)!.map(Number);
  await page.locator('#study-input-0').fill(String(a+b));await expect(page.locator('#progress-caption')).toHaveText(`${i} / 5`);
  await page.locator('#study-submit').click();await page.clock.runFor(700);
 }
 await expect(page.locator('#victory')).toBeVisible();await page.clock.runFor(6500);await page.locator('#camp-results-exit').click();
 await expect(page.locator('#learning-panel')).toContainText('En entraînement');
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('calcul-party:players:v1')!));const active=data.players.find((p:{id:string})=>p.id===data.active);expect(JSON.parse(active.data['calcul-party:training:v1']).materials).toBe(5);
});
test('les problèmes guidés et inéquations sont jouables en seconde',async({page})=>{
 await page.setViewportSize({width:390,height:844});await player(page,'15');await launch(page,'proportion');await page.clock.runFor(4050);
 const [initial,price,target]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-hint summary').click();await expect(page.locator('#study-hint')).toContainText('1.');await page.locator('#study-input-0').fill(String(price/initial*target));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await launch(page,'inequality');await page.clock.runFor(4050);
 const prompt=await page.locator('#equation').innerText();const [a,b,c]=prompt.match(/-?\d+/g)!.map(Number);const op=prompt.match(/[≤≥<>]/)![0];await page.locator('#study-input-0').fill(`x${op}${(c-b)/a}`);await page.locator('#study-input-0').press('Enter');await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 const form=await page.locator('#study-answer').boundingBox(),keypad=await page.locator('.keypad').boundingBox();expect(form!.y+form!.height).toBeLessThan(keypad!.y);
 await page.screenshot({path:'artifacts/learning-mobile.png',fullPage:true});
});
test('les équations demandent une valeur et les carrés toutes les solutions',async({page})=>{
 await player(page,'14');await launch(page,'equation-two');await page.clock.runFor(4050);
 const [a,b,c]=(await page.locator('#equation').innerText()).match(/-?\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String((c-b)/a));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await launch(page,'equation-set');await page.clock.runFor(4050);
 const squared=Number((await page.locator('#equation').innerText()).match(/\d+/)![0]);const x=Math.sqrt(squared);await page.locator('#study-input-0').fill(`${x};−${x}`);await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
});
test('le parcours est lisible sur téléphone et le clavier garde Entrée',async({page})=>{
 await page.setViewportSize({width:390,height:844});await player(page);await launch(page,'small-subtract');await page.clock.runFor(4050);
 const label=(await page.locator('#equation').getAttribute('aria-label'))!;const [a,b]=label.match(/\d+/g)!.map(Number);
 await page.locator('#study-input-0').fill(String(a-b));await page.locator('#study-input-0').press('Enter');await page.clock.runFor(700);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('division et grands produits sont jouables sans chrono',async({page})=>{
 await player(page,'8');await launch(page,'divide');await page.clock.runFor(4050);
 const numbers=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(numbers[0]/numbers[1]));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await launch(page,'large-multiply');await page.clock.runFor(4050);
 const [a,b]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(a*b));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
});
test('fractions illustrées, virgule et quotient/reste ont leurs réponses dédiées',async({page})=>{
 await player(page,'10');await launch(page,'fraction-picture');await page.clock.runFor(4050);
 const label=(await page.locator('.study-fraction').getAttribute('aria-label'))!;const [a,b]=label.match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(`${a}/${b}`);await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await launch(page,'decimal-divide');await page.clock.runFor(4050);
 const values=(await page.locator('#equation').innerText()).replace(',','.').match(/\d+(?:\.\d+)?/g)!.map(Number);await page.locator('#study-input-0').fill((values[0]/values[1]).toFixed(2).replace('.',','));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await launch(page,'remainder');await page.clock.runFor(4050);
 const [dividend,divisor]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.getByLabel('Quotient',{exact:true}).fill(String(Math.floor(dividend/divisor)));await page.getByLabel('Reste',{exact:true}).fill(String(dividend%divisor));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
});
test('relatifs, priorités et puissances restent lisibles et répondables',async({page})=>{
 await player(page,'12');await launch(page,'signed-add');await page.clock.runFor(4050);
 const [a,b]=(await page.locator('#equation').innerText()).match(/-?\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(a+b));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await launch(page,'priority');await page.clock.runFor(4050);
 const [x,y,z]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(x+y*z));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await launch(page,'cube');await page.clock.runFor(4050);const base=Number((await page.locator('#equation').innerText()).match(/\d+/)![0]);await page.locator('#study-input-0').fill(String(base**3));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 7');
});
