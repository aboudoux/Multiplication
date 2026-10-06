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
test('le parcours est lisible sur téléphone et le clavier garde Entrée',async({page})=>{
 await page.setViewportSize({width:390,height:844});await player(page);await page.locator('[data-skill=small-subtract]').click();await page.clock.runFor(4050);
 const label=(await page.locator('#equation').getAttribute('aria-label'))!;const [a,b]=label.match(/\d+/g)!.map(Number);
 await page.locator('#study-input-0').fill(String(a-b));await page.locator('#study-input-0').press('Enter');await page.clock.runFor(700);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
