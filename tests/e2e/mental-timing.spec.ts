import {test,expect,type Page} from '@playwright/test';
import {adventures,adventureDurations,adventureLives} from '../../src/adventure';

async function setup(page:Page) {
 await page.addInitScript(adventures=>{
  Math.random=()=>.5;
  localStorage.setItem('calcul-party:players:v1',JSON.stringify({version:1,active:'old',players:[{id:'old',name:'Chrono',avatar:'🐱',grade:'CM1',adaptive:true,mastery:{},mentalDuration:10,data:{'multipli-party:v1':JSON.stringify({muted:true,voiceEnabled:false}),...Object.fromEntries(adventures.map(a=>[a.storageKey,JSON.stringify({completed:a.stages.map(s=>s.id)})]))}}]}));
 },adventures);
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
}
for(const adventure of adventures)for(const [index,world] of adventure.worlds.entries())test(`${adventure.id} monde ${index+1} : chrono du jeu, ancienne préférence ignorée`,async({page})=>{
 await page.setViewportSize({width:index%2?390:768,height:950});await setup(page);
 await page.locator('#open-adventure').click();await page.locator(`[data-adventure=${adventure.id}]`).click();
 const stage=adventure.stages.find(s=>s.world.id===world.id)!,duration=adventureDurations[world.id],lives=adventureLives[world.id];
 const mission=page.locator(`[data-stage=${stage.id}]`);
 await expect(mission).toContainText(duration===null?'Sans chrono':`${duration} s par calcul`);
 await expect(mission).toContainText(lives===null?'Essais illimités':`${lives} vies par mission`);
 await mission.click();await page.clock.runFor(4050);
 if(duration===null){await expect(page.locator('#time-left')).toBeHidden();await page.clock.runFor(60000);await expect(page.locator('#study-input-0')).toBeEnabled();}
 else {
  await expect(page.locator('#time-left')).toHaveText(`${duration} s`);await expect(page.locator('#hearts [data-heart]')).toHaveCount(lives!);
  await page.clock.runFor(1000);const before=await page.locator('#time-left').innerText();
  await page.locator('#pause').click();await page.clock.runFor(60000);await page.locator('#resume').click();await page.clock.runFor(4050);
  await expect(page.locator('#time-left')).toHaveText(before);
  await page.clock.runFor(duration*1000);await expect(page.locator('#hearts [data-heart]:not(.lost)')).toHaveCount(lives!-1);
  await expect(page.locator('#study-input-0')).toBeDisabled();
 }
});
test('enregistrer le profil conserve les anciennes données sans réglage du chrono',async({page})=>{
 await setup(page);await page.locator('#player-picker').click();await expect(page.locator('[name=mentalDuration]')).toHaveCount(0);
 await page.locator('#player-dialog').screenshot({path:'artifacts/profile-game-timing.png'});
 await page.locator('#edit-player [name=name]').fill('Camille');await page.locator('#edit-player button[type=submit]').click();
 const player=await page.evaluate(()=>JSON.parse(localStorage.getItem('calcul-party:players:v1')!).players[0]);
 expect(player.mentalDuration).toBe(10);expect(player.name).toBe('Camille');
 for(const adventure of adventures)expect(JSON.parse(player.data[adventure.storageKey]).completed).toHaveLength(24);
});
