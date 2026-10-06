import {test,expect,type Page} from '@playwright/test';
import {adventures} from '../../src/adventure';
import {adaptedAdventure,resolveAdventureMission} from '../../src/adaptive-adventure';
import {answerLabel} from '../../src/questions';
import {adventureRulesLabel} from '../../src/adventure-policy';
const attemptKey='calcul-party:adventure-attempts:v1';
async function setup(page:Page){
 await page.addInitScript(()=>{
  Math.random=()=>.5;
  if(localStorage.getItem('calcul-party:players:v1'))return;
  localStorage.setItem('calcul-party:players:v1',JSON.stringify({version:1,active:'balance',players:[{id:'balance',name:'Camille',avatar:'🐱',grade:'CP',adaptive:true,adventureDifficulty:'normal',adventurePractice:{CP:{add:0}},data:{'multipli-party:v1':JSON.stringify({muted:true,voiceEnabled:false})},mastery:{}}]}));
 });
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
 await page.locator('#open-adventure').click();await page.locator('[data-adventure=chaton]').click();
}
async function player(page:Page){return page.evaluate(()=>JSON.parse(localStorage.getItem('calcul-party:players:v1')!).players[0]);}
test('carte, moteur, réussite et bilan utilisent la même tentative',async({page})=>{
 await page.setViewportSize({width:390,height:950});await setup(page);
 const stage=adaptedAdventure(adventures[0],'CP','normal',{CP:{add:0}}).stages[0];const {questions,policy,rules}=resolveAdventureMission(stage,{CP:{add:0}},()=>.5);
 await expect(page.locator('[data-stage=kitten-1]')).toContainText(`${questions.length} calculs`);await expect(page.locator('[data-stage=kitten-1]')).toContainText(adventureRulesLabel(policy));
 await page.screenshot({path:'artifacts/balance-map-phone.png'});
 await page.locator('[data-stage=kitten-1]').click();await page.clock.runFor(4050);
 await expect(page.locator('#progress-goal')).toHaveText(String(questions.length));await expect(page.locator('#time-left')).toHaveText(`${rules.questionTimeLimitMs(questions[0])!/1000} s`);
 for(const q of questions){await expect(page.locator('#equation')).toHaveText(q.exercise!.prompt);await page.locator('#study-input-0').fill(answerLabel(q.exercise!.answer));await page.clock.runFor(700);}
 await expect(page.locator('.mission-scene')).toHaveAttribute('data-mission','kitten-1');
 const saved=await player(page);const journal=JSON.parse(saved.data[attemptKey]).attempts;
 expect(journal).toHaveLength(1);expect(journal[0]).toMatchObject({outcome:'won',discovery:false,total:questions.length,solved:questions.length,firstCorrect:questions.length,firstAnswers:questions.length,mistakes:0,timeouts:0});
 await page.clock.runFor(10100);await page.locator('[data-action=home]').click();await page.locator('#leave-adventure').click();await page.locator('#player-picker').click();await page.locator('summary').filter({hasText:'Mes dernières aventures'}).click();
 await expect(page.locator('.adventure-attempt-list')).toContainText(stage.name);await expect(page.locator('.adventure-attempt-list')).toContainText(`${questions.length}/${questions.length} réussis au premier essai`);
 await page.locator('#player-dialog').screenshot({path:'artifacts/balance-profile-phone.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('deux défaites proposent Facile, sans changement automatique, choix conservé au rechargement',async({page})=>{
 await setup(page);await page.locator('[data-stage=kitten-1]').click();await page.clock.runFor(4050);
 for(let attempt=0;attempt<2;attempt++){
  for(let error=0;error<5;error++){await page.locator('#study-input-0').fill('-99');await page.locator('#study-input-0').press('Enter');await page.clock.runFor(4050);}
  await page.clock.runFor(6100);await expect(page.locator('#results')).toBeVisible();
  expect((await player(page)).adventureDifficulty).toBe('normal');
  if(attempt===0){await expect(page.locator('#retry-easy')).toBeHidden();await page.locator('#results [data-action=start]').click();await page.clock.runFor(4050);}
 }
 await expect(page.locator('#retry-easy')).toBeVisible();await page.locator('#retry-easy').click();await page.clock.runFor(4050);
 await expect(page.locator('#difficulty-label')).toContainText('Facile');await expect(page.locator('#time-left')).toBeHidden();await expect(page.locator('#hearts')).toContainText('À volonté');
 await page.locator('#pause').click();await page.locator('#adventure-exit').click();
 const journal=JSON.parse((await player(page)).data[attemptKey]).attempts;expect(journal.map((a:{outcome:string})=>a.outcome)).toEqual(['lost','lost','abandoned']);expect(journal[0].mistakes).toBe(5);
 await page.reload();expect((await player(page)).adventureDifficulty).toBe('easy');await page.locator('#player-picker').click();await expect(page.locator('[name=adventureDifficulty]')).toHaveValue('easy');
});
