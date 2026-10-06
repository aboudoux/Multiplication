import {test,expect,type Page} from '@playwright/test';
async function player(page:Page,age='5') {
 await page.addInitScript(()=>localStorage.setItem('multipli-party:v1',JSON.stringify({muted:true,voiceEnabled:false})));
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
 await page.locator('#player-picker').click();await page.locator('#new-player [name=name]').fill('Lina');await page.locator('#new-player [name=age]').selectOption(age);await page.locator('#new-player button[type=submit]').click();
 // New players have independent sound preferences; turn off speech for a deterministic clock-driven test.
 await page.locator('#sound').click();await page.locator('#open-training').click();
}
test('une séance explicite attend Valider et crédite le profil actif',async({page})=>{
 await player(page);await page.locator('[data-skill=small-add]').click();await page.clock.runFor(4050);
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
 await page.setViewportSize({width:390,height:844});await player(page,'15');await page.locator('[data-skill=proportion]').click();await page.clock.runFor(4050);
 const [initial,price,target]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-hint summary').click();await expect(page.locator('#study-hint')).toContainText('1.');await page.locator('#study-input-0').fill(String(price/initial*target));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await page.locator('[data-skill=inequality]').click();await page.clock.runFor(4050);
 const prompt=await page.locator('#equation').innerText();const [a,b,c]=prompt.match(/-?\d+/g)!.map(Number);const op=prompt.match(/[≤≥<>]/)![0];await page.locator('#study-input-0').fill(`x${op}${(c-b)/a}`);await page.locator('#study-input-0').press('Enter');await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.screenshot({path:'artifacts/learning-mobile.png',fullPage:true});
});
test('les équations demandent une valeur et les carrés toutes les solutions',async({page})=>{
 await player(page,'14');await page.locator('[data-skill=equation-two]').click();await page.clock.runFor(4050);
 const [a,b,c]=(await page.locator('#equation').innerText()).match(/-?\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String((c-b)/a));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await page.locator('[data-skill=equation-set]').click();await page.clock.runFor(4050);
 const squared=Number((await page.locator('#equation').innerText()).match(/\d+/)![0]);const x=Math.sqrt(squared);await page.locator('#study-input-0').fill(`${x};−${x}`);await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
});
test('le parcours est lisible sur téléphone et le clavier garde Entrée',async({page})=>{
 await page.setViewportSize({width:390,height:844});await player(page);await page.locator('[data-skill=small-subtract]').click();await page.clock.runFor(4050);
 const label=(await page.locator('#equation').getAttribute('aria-label'))!;const [a,b]=label.match(/\d+/g)!.map(Number);
 await page.locator('#study-input-0').fill(String(a-b));await page.locator('#study-input-0').press('Enter');await page.clock.runFor(700);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('division et grands produits sont jouables sans chrono',async({page})=>{
 await player(page,'8');await page.locator('[data-skill=divide]').click();await page.clock.runFor(4050);
 const numbers=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(numbers[0]/numbers[1]));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await page.locator('[data-skill=large-multiply]').click();await page.clock.runFor(4050);
 const [a,b]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(a*b));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 10');
});
test('fractions illustrées, virgule et quotient/reste ont leurs réponses dédiées',async({page})=>{
 await player(page,'10');await page.locator('[data-skill=fraction-picture]').click();await page.clock.runFor(4050);
 const label=(await page.locator('.study-fraction').getAttribute('aria-label'))!;const [a,b]=label.match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(`${a}/${b}`);await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await page.locator('[data-skill=decimal-divide]').click();await page.clock.runFor(4050);
 const values=(await page.locator('#equation').innerText()).replace(',','.').match(/\d+(?:\.\d+)?/g)!.map(Number);await page.locator('#study-input-0').fill((values[0]/values[1]).toFixed(2).replace('.',','));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await page.locator('[data-skill=remainder]').click();await page.clock.runFor(4050);
 const [dividend,divisor]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.getByLabel('Quotient',{exact:true}).fill(String(Math.floor(dividend/divisor)));await page.getByLabel('Reste',{exact:true}).fill(String(dividend%divisor));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
});
test('relatifs, priorités et puissances restent lisibles et répondables',async({page})=>{
 await player(page,'12');await page.locator('[data-skill=signed-add]').click();await page.clock.runFor(4050);
 const [a,b]=(await page.locator('#equation').innerText()).match(/-?\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(a+b));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await page.locator('[data-skill=priority]').click();await page.clock.runFor(4050);
 const [x,y,z]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator('#study-input-0').fill(String(x+y*z));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 15');
 await page.locator('#pause').click();await page.locator('#camp-exit').click();await page.locator('[data-skill=cube]').click();await page.clock.runFor(4050);const base=Number((await page.locator('#equation').innerText()).match(/\d+/)![0]);await page.locator('#study-input-0').fill(String(base**3));await page.locator('#study-submit').click();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('1 / 7');
});
