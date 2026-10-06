import {test,expect} from '@playwright/test';
import {adventures} from '../../src/adventure';
test('un nouveau joueur a une classe et des progrès isolés',async({page})=>{
 await page.goto('/');await page.locator('#player-picker').click();
 await page.locator('#new-player [name=name]').fill('Lina');await page.locator('#new-player [name=age]').selectOption('5');await page.locator('#new-player button[type=submit]').click();
 await expect(page.locator('#player-picker')).toContainText('Lina · GS');await page.locator('#open-training').click();
 await expect(page.locator('#learning-panel')).toBeVisible();await expect(page.locator('#learning-grade')).toHaveValue('GS');
 await page.locator('#player-picker').click();await page.locator('[data-player=current]').click();await expect(page.locator('#player-picker')).toContainText('Joueur actuel · Classique');
 await page.reload();await expect(page.locator('#player-picker')).toContainText('Joueur actuel');
});

for(const width of [390,1365])test(`choisir CM1 active le parcours sans deuxième réglage à ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:950});
 await page.addInitScript(adventures=>{
  if(localStorage.getItem('calcul-party:players:v1'))return;
  localStorage.setItem('calcul-party:players:v1',JSON.stringify({version:1,active:'current',players:[{id:'current',name:'Aurélien',avatar:'🐱',grade:'CM1',adaptive:false,mastery:{},data:{'multipli-party:v1':JSON.stringify({muted:true,voiceEnabled:false}),...Object.fromEntries(adventures.map(a=>[a.storageKey,JSON.stringify({completed:[a.stages[0].id]})]))}}]}));
 },adventures);
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
 await expect(page.locator('#player-picker')).toContainText('Aurélien · Classique');
 await page.locator('#player-picker').click();await expect(page.locator('#edit-player [name=grade]')).toHaveValue('classic');await expect(page.locator('[name=adaptive]')).toHaveCount(0);
 await page.locator('#edit-player [name=grade]').selectOption('CM1');await page.locator('#edit-player button[type=submit]').click();
 await expect(page.locator('#player-picker')).toContainText('Aurélien · CM1');
 await page.locator('#open-training').click();await expect(page.locator('#learning-grade')).toHaveValue('CM1');await expect(page.locator('[data-skill=divide]')).toBeVisible();await page.locator('#camp-home').click();
 for(const adventure of adventures){
  await page.locator('#open-adventure').click();await page.locator(`[data-adventure=${adventure.id}]`).click();
  const mission=page.locator(`[data-stage=${adventure.stages[0].id}]`);await expect(mission).toContainText('CM1');await expect(mission).toHaveClass(/mission-complete/);await mission.click();await page.clock.runFor(4050);
  await expect(page.locator('#equation')).toContainText('÷');await expect(page.locator('#study-input-0')).toBeEnabled();
  await page.locator('#pause').click();await page.locator('#adventure-exit').click();await page.locator('#leave-adventure').click();
 }
 await page.reload();await expect(page.locator('#player-picker')).toContainText('Aurélien · CM1');await page.locator('#player-picker').click();await expect(page.locator('#edit-player [name=grade]')).toHaveValue('CM1');
 await page.locator('#edit-player [name=grade]').selectOption('classic');await page.locator('#edit-player button[type=submit]').click();await expect(page.locator('#player-picker')).toContainText('Aurélien · Classique');
 await page.locator('#open-training').click();await expect(page.locator('#learning-panel')).toBeHidden();
 const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('calcul-party:players:v1')!).players[0]);expect(p.grade).toBe('CM1');expect(p.adaptive).toBe(false);
 for(const adventure of adventures)expect(JSON.parse(p.data[adventure.storageKey]).completed).toEqual([adventure.stages[0].id]);
});
