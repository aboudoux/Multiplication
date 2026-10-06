import {test,expect,type Page} from '@playwright/test';
async function player(page:Page,age='5') {
 await page.addInitScript(()=>localStorage.setItem('multipli-party:v1',JSON.stringify({muted:true,voiceEnabled:false})));
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
 await page.locator('#player-picker').click();await page.locator('#new-player [name=name]').fill('Lina');await page.locator('#new-player [name=age]').selectOption(age);await page.locator('#new-player button[type=submit]').click();
 await page.locator('#sound').click();await page.locator('#open-training').click();
}
async function launch(page:Page,id:string) {
 const button=page.locator(`[data-skill=${id}]`);await button.evaluate(element=>{let p=element.parentElement;while(p){if(p instanceof HTMLDetailsElement)p.open=true;p=p.parentElement;}});await button.click();await page.clock.runFor(4050);
}
async function numbers(page:Page){return (await page.locator('#equation').innerText()).replaceAll('−','-').replaceAll(',','.').match(/-?\d+(?:\.\d+)?/g)!.map(Number);}
async function answer(page:Page,value:string|number){await page.locator('#study-input-0').fill(String(value));if(await page.locator('#study-submit').count())await page.locator('#study-submit').click();await page.clock.runFor(700);}
async function leave(page:Page){await page.locator('#pause').click();await page.locator('#camp-exit').click();}

test('les opérateurs ont une voix locale prête, réécoutable et annulable',async({page})=>{
 const requests:string[]=[];page.on('request',r=>{if(r.url().includes('/voice/fr/tokens/'))requests.push(r.url());});
 await page.addInitScript(()=>{
  const probe:{clips:{label:string|null;duration:number}[];stops:number}={clips:[],stops:0};Object.assign(window,{studySpeechProbe:probe});
  const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer&&this.buffer.duration>1)probe.clips.push({label:document.getElementById('equation')?.getAttribute('aria-label')??null,duration:this.buffer.duration});return start.apply(this,args);};
  AudioBufferSourceNode.prototype.stop=function(...args){if(this.buffer&&this.buffer.duration>1)probe.stops++;return stop.apply(this,args);};
 });
 await player(page,'8');await page.locator('#sound').click();await launch(page,'divide');
 await expect.poll(async()=>{await page.clock.runFor(16);return page.locator('#study-input-0').isEnabled();}).toBe(true);
 const label=await page.locator('#equation').getAttribute('aria-label');await expect.poll(()=>page.evaluate(label=>(window as any).studySpeechProbe.clips.filter((c:{label:string})=>c.label===label).length,label)).toBeGreaterThan(0);
 expect(requests.some(url=>new URL(url).pathname.endsWith('/divide.wav')&&new URL(url).searchParams.get('v')==='2')).toBe(true);await page.locator('#repeat-question').click();await page.locator('#pause').click();expect(await page.evaluate(()=>(window as any).studySpeechProbe.stops)).toBeGreaterThan(0);
});
test('une difficulté propose un prérequis sans compter la correction comme première réussite',async({page})=>{
 await player(page,'6');await launch(page,'add');
 for(let i=0;i<30;i++){const [a,b]=await numbers(page),value=a+b;await page.locator('#study-input-0').fill(String(value===9?8:value+1));await expect(page.locator('#study-explanation')).toBeVisible();await page.clock.runFor(2100);const complete=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('calcul-party:players:v1')!);return s.players.find((p:any)=>p.id===s.active).mentalMastery.skills.add.series.length>0;});if(complete)break;}
 await leave(page);await expect(page.locator('#learning-recommended')).toHaveAttribute('data-recommended','small-add');
 const mastery=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('calcul-party:players:v1')!);return s.players.find((p:any)=>p.id===s.active).mentalMastery;});expect(mastery.skills.add.series[0].score).toBe(0);
 await page.locator('#learning-recommended').click();await page.clock.runFor(4050);await expect(page.locator('.study-visual')).toBeVisible();
});
test('les entiers partent automatiquement et les matériaux sont attribués une fois',async({page})=>{
 await player(page);await launch(page,'small-add');await expect(page.locator('#study-submit')).toHaveCount(0);await expect(page.locator('[data-char="−"]')).toHaveCount(0);
 for(let i=0;i<5;i++){const [a,b]=await numbers(page);await answer(page,a+b);}
 await expect(page.locator('#victory')).toBeVisible();await page.clock.runFor(6500);await page.locator('#camp-results-exit').click();
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('calcul-party:players:v1')!));const active=data.players.find((p:any)=>p.id===data.active);expect(JSON.parse(active.data['calcul-party:training:v1']).materials).toBe(5);expect(active.mentalMastery.skills['small-add'].samples).toHaveLength(5);expect(active.mastery).toEqual({});
});
test('les réponses gardent les barres à la craie, le compte des chiffres et le signe séparé',async({page})=>{
 await player(page,'12');await launch(page,'large-multiply');
 const [a,b]=await numbers(page),digits=String(a*b),input=page.locator('#study-input-0'),slots=page.locator('.study-chalk-slots .answer-slot');
 await expect(slots).toHaveCount(digits.length);await expect(input).toHaveCSS('opacity','0');
 await expect(slots.first()).toHaveCSS('border-bottom-width','3px');expect(await slots.first().evaluate(e=>getComputedStyle(e).fontFamily)).toContain('Kalam');
 await page.keyboard.press(digits[0]);await expect(page.locator('.study-chalk-slots .filled')).toHaveCount(1);await expect(slots.first()).toHaveText(digits[0]);
 await page.locator('#erase').click();await expect(page.locator('.study-chalk-slots .filled')).toHaveCount(0);
 for(const digit of digits)await page.locator(`[data-digit="${digit}"]`).click();await expect(page.locator('.study-chalk-slots .filled')).toHaveCount(digits.length);await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
 await leave(page);await launch(page,'signed-add');const [left,right]=await numbers(page),length=String(Math.abs(left+right)).length;
 await page.locator('[data-char="−"]').click();await expect(page.locator('.study-chalk-sign')).toHaveText('−');await expect(page.locator('.study-chalk-slots .answer-slot')).toHaveCount(length);await expect(page.locator('.study-chalk-slots .filled')).toHaveCount(0);await expect(page.locator('#progress-caption')).toHaveText('0 / 10');
 const signBox=await page.locator('.study-chalk-sign').boundingBox(),digitBox=await page.locator('.study-chalk-slots .answer-slot').first().boundingBox();expect(Math.abs(signBox!.y-digitBox!.y)).toBeLessThan(1);
 await page.locator('#erase').click();await expect(page.locator('.study-chalk-sign')).toBeEmpty();await answer(page,left+right);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
});
test('les exercices longs disparaissent de tous les accès, même en seconde',async({page})=>{
 await player(page,'15');for(const id of ['mystery','remainder','proportion','program','equation-two','equation-both','equation-set','identity','inequality','successive','negative-power'])await expect(page.locator(`[data-skill=${id}]`)).toHaveCount(0);
 await expect(page.locator('#learning-recommended')).toBeVisible();await launch(page,'function');const [x,a,b]=await numbers(page);await answer(page,a*x+b);await expect(page.locator('#progress-caption')).toHaveText('1 / 6');
});
test('le CM1 ne rencontre que des inconnues à une opération',async({page})=>{
 await player(page,'9');await launch(page,'missing');for(let i=0;i<3;i++){const text=await page.locator('#equation').innerText();expect(text).not.toMatch(/[()]/);expect(text.match(/[+−×÷]/g)).toHaveLength(1);const [a,b]=await numbers(page);await answer(page,text.includes('+')?b-a:a-b);}await expect(page.locator('#progress-caption')).toHaveText('3 / 10');
});
test('fractions et virgule attendent Valider, les comparaisons offrent deux choix',async({page})=>{
 await player(page,'10');await launch(page,'fraction-picture');const [a,b]=(await page.locator('.study-fraction').getAttribute('aria-label'))!.match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(`${a}/${b}`);await expect(page.locator('.study-chalk-slots')).toHaveText(`${a}/${b}`);await expect(page.locator('.study-chalk-slots .answer-slot')).toHaveCount(`${a}/${b}`.length);await expect(page.locator('#progress-caption')).toHaveText('0 / 10');await page.locator('#study-input-0').press('Enter');await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
 await leave(page);await launch(page,'decimal-divide');const [dividend,divisor]=await numbers(page);await page.locator('#study-input-0').fill((dividend/divisor).toFixed(2).replace('.',','));await expect(page.locator('#progress-caption')).toHaveText('0 / 10');await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
 await leave(page);await launch(page,'fraction-compare');const buttons=page.locator('[data-choice]');await expect(buttons).toHaveCount(2);const values=await buttons.allTextContents();const ratio=(v:string)=>{const [n,d]=v.split('/').map(Number);return n/d;};await buttons.nth(ratio(values[0])>ratio(values[1])?0:1).click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
});
test('relatifs, équations simples et petits cubes se jouent de tête',async({page})=>{
 await player(page,'12');await launch(page,'signed-add');await expect(page.locator('[data-char="−"]')).toBeVisible();const [a,b]=await numbers(page);await answer(page,a+b);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
 await leave(page);await launch(page,'equation-one');const [coefficient,result]=await numbers(page);const prompt=await page.locator('#equation').innerText();await answer(page,prompt.includes('x +')?result-coefficient:result/coefficient);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
 await leave(page);await launch(page,'cube');const [base]=await numbers(page);expect([0,1,2,3,10]).toContain(base);await answer(page,base**3);await expect(page.locator('#progress-caption')).toHaveText('1 / 5');
});
test('le chrono facultatif a cinq vies, respecte la pause et suit le joueur dans les aventures',async({page})=>{
 await player(page,'9');await page.locator('#learning-rhythm').selectOption('15');await launch(page,'divide');await expect(page.locator('#time-left')).toBeVisible();await expect(page.locator('#hearts [data-heart]')).toHaveCount(5);await expect(page.locator('#difficulty-label')).toContainText('15 s · 5 vies');
 await page.locator('#pause').click();await page.clock.runFor(30000);await page.locator('#camp-exit').click();await expect(page.locator('#learning-rhythm')).toHaveValue('15');
 await page.locator('#camp-home').click();await page.locator('#open-adventure').click();await page.locator('[data-adventure=chaton]').click();await expect(page.locator('[data-stage=kitten-1]')).toContainText('15 s par calcul');await page.locator('[data-stage=kitten-1]').click();await page.clock.runFor(4050);await expect(page.locator('#time-left')).toBeVisible();await expect(page.locator('#difficulty-label')).toContainText('15 s · 5 vies');
 await page.reload();await page.locator('#player-picker').click();await expect(page.locator('[name=mentalDuration]')).toHaveValue('15');
});
test('le défi chronométré se termine après cinq dépassements',async({page})=>{
 await player(page);await page.locator('#learning-rhythm').selectOption('10');await launch(page,'small-add');for(let i=0;i<5;i++)await page.clock.runFor(12100);await expect(page.locator('#defeat')).toBeVisible();
});
for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1365,height:900}])test(`saisie et calcul restent lisibles à ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);await player(page,'9');await launch(page,'large-multiply');const [left,right]=await numbers(page);await expect(page.locator('.study-chalk-slots .answer-slot')).toHaveCount(String(left*right).length);await expect(page.locator('#study-input-0')).toHaveCSS('opacity','0');await page.screenshot({path:`artifacts/chalk-${viewport.width}.png`,fullPage:true});await leave(page);await launch(page,'decimal-add');const form=await page.locator('#study-answer').boundingBox(),keypad=await page.locator('.keypad').boundingBox();expect(form!.x+form!.width<=keypad!.x||form!.y+form!.height<=keypad!.y).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`artifacts/mental-${viewport.width}.png`,fullPage:true});
 const [a,b]=await numbers(page),prompt=await page.locator('#equation').innerText();await answer(page,(prompt.includes('−')?a-b:a+b).toFixed(1));await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
});
