import {test,expect,type Page} from '@playwright/test';
import {adventures} from '../../src/adventure';
import {grades,gradeAge,type Grade} from '../../src/curriculum';
import {adaptedAdventure,resolveAdventureMission} from '../../src/adaptive-adventure';
import {adventureRulesLabel,type AdventureDifficulty,type AdventurePractice} from '../../src/adventure-policy';
import {answerLabel,answerMatches} from '../../src/questions';
async function setup(page:Page,grade:Grade){
 await page.addInitScript(()=>{Math.random=()=>.5;localStorage.setItem('multipli-party:v1',JSON.stringify({muted:true,voiceEnabled:false}));});
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
 await page.locator('#player-picker').click();await page.locator('#new-player [name=name]').fill('Camille');await page.locator('#new-player [name=age]').selectOption(String(gradeAge(grade)));await page.locator('#new-player button[type=submit]').click();await page.locator('#sound').click();
}
async function solveStage(page:Page,adventure:typeof adventures[number],id:string,grade:Grade){
 const player=await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('calcul-party:players:v1')!);const active=state.players.find((p:{id:string})=>p.id===state.active);return {difficulty:active.adventureDifficulty??'normal',history:active.adventurePractice??{}};}) as {difficulty:AdventureDifficulty;history:AdventurePractice};
 const adapted=adaptedAdventure(adventure,grade,player.difficulty,player.history),requested=adapted.stages.find(s=>s.id===id)!;
 const stage=requested.study!.policy!.blockedFinal?adapted.stages[0]:requested;
 const {questions,policy}=resolveAdventureMission(stage,player.history,()=>.5);
 await page.locator(`[data-stage="${id}"]`).click();await page.clock.runFor(4050);
 await expect(page.locator('#difficulty-label')).toContainText(adventureRulesLabel(policy));
 await expect(page.locator('#progress-goal')).toHaveText(String(questions.length));
 if(policy.timeLimits.factMs===null&&policy.timeLimits.strategyMs===null)await expect(page.locator('#time-left')).toBeHidden();else await expect(page.locator('#time-left')).toBeVisible();
 for(const q of questions){
  await expect(page.locator('#equation')).toHaveText(q.exercise!.prompt);const answer=q.exercise!.answer;
  if(q.exercise!.choices){const choice=q.exercise!.choices.find(value=>answerMatches(answer,value))!;await page.locator('.study-choices').getByRole('button',{name:choice,exact:true}).click();}
  else if(answer.kind==='remainder'){await page.locator('#study-input-0').fill(String(answer.quotient));await page.locator('#study-input-1').fill(String(answer.remainder));}
  else await page.locator('#study-input-0').fill(answerLabel(answer));
  await page.clock.runFor(700);
 }
 await expect(page.locator('.mission-scene')).toHaveAttribute('data-mission',stage.id);await page.clock.runFor(10100);await page.locator('[data-action=home]').click();
}
for(const grade of grades)for(const adventure of adventures)test(`${adventure.id} : première mission adaptée ${grade}`,async({page})=>{
 await page.setViewportSize({width:grade==='GS'?390:768,height:950});await setup(page,grade);await page.locator('#open-adventure').click();await page.locator(`[data-adventure=${adventure.id}]`).click();
 await expect(page.locator('#adventure-map')).toBeVisible();
 await expect(page.locator(`[data-stage="${adventure.stages[0].id}"]`)).toContainText('Découverte');
 await expect(page.locator(`[data-stage="${adventure.stages[0].id}"]`)).toContainText('Sans chrono · Essais illimités');
 await solveStage(page,adventure,adventure.stages[0].id,grade);
 await expect(page.locator(`[data-stage="${adventure.stages[0].id}"]`)).toHaveClass(/mission-complete/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('deux aventures indépendantes, changement de classe et relecture au niveau actuel',async({page})=>{
 await setup(page,'GS');await page.locator('#open-adventure').click();await page.locator('[data-adventure=chaton]').click();await solveStage(page,adventures[0],'kitten-1','GS');
 await page.locator('#change-adventure').click();await page.locator('[data-adventure=pico]').click();await expect(page.locator('.adventure-passport')).toContainText('0 / 24');await solveStage(page,adventures[1],'pico-1','GS');
 await page.locator('#leave-adventure').click();await page.locator('#player-picker').click();await page.locator('#edit-player [name=grade]').selectOption('5e');await page.locator('#edit-player button[type=submit]').click();
 await page.locator('#open-adventure').click();await page.locator('[data-adventure=chaton]').click();await expect(page.locator('[data-stage=kitten-1]')).toHaveClass(/mission-complete/);await solveStage(page,adventures[0],'kitten-1','5e');
 await page.reload();await page.locator('#open-adventure').click();await page.locator('[data-adventure=pico]').click();await expect(page.locator('[data-stage=pico-1]')).toHaveClass(/mission-complete/);
});
test('la saisie automatique garde les animations au clavier et au toucher',async({page})=>{
 await setup(page,'GS');await page.locator('#open-adventure').click();await page.locator('[data-adventure=pico]').click();await page.locator('[data-stage=pico-1]').click();await page.clock.runFor(4050);
 const [a,b]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);const result=String(a+b);
 await page.locator('#study-input-0').press(result);await expect(page.locator(`[data-digit="${result}"] .key-pop`)).toBeVisible();await page.clock.runFor(700);
 await expect(page.locator('#progress-caption')).toHaveText('1 / 5');
 const [c,d]=(await page.locator('#equation').innerText()).match(/\d+/g)!.map(Number);await page.locator(`[data-digit="${c+d}"]`).click();await expect(page.locator(`[data-digit="${c+d}"] .key-pop`)).toBeVisible();await page.clock.runFor(700);await expect(page.locator('#progress-caption')).toHaveText('2 / 5');
});

test('le final sans notion introduite après changement de classe redirige vers la découverte et garde les 24 badges',async({page})=>{
 await setup(page,'GS');await page.evaluate(adventure=>{
  const key='calcul-party:players:v1',state=JSON.parse(localStorage.getItem(key)!);const player=state.players.find((p:{id:string})=>p.id===state.active);
  player.data[adventure.storageKey]=JSON.stringify({completed:adventure.stages.map(s=>s.id)});player.mastery={'small-add':{samples:[],series:[10,10],comfortable:true,level:1}};localStorage.setItem(key,JSON.stringify(state));
 },adventures[0]);await page.reload();
 await page.locator('#player-picker').click();await page.locator('#edit-player [name=grade]').selectOption('2de');await page.locator('#edit-player button[type=submit]').click();await page.locator('#open-adventure').click();await page.locator('[data-adventure=chaton]').click();
 await expect(page.locator('.adventure-passport')).toContainText('24 / 24');
 await expect(page.locator('[data-stage=star-3]')).toContainText('Découvre d’abord une notion de cette classe');
 await solveStage(page,adventures[0],'star-3','2de');
 await expect(page.locator('.adventure-passport')).toContainText('24 / 24');
 const introduced=await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('calcul-party:players:v1')!);return state.players.find((p:{id:string})=>p.id===state.active).adventurePractice['2de'];});
 expect(introduced).toEqual({'signed-multiply':0});
 await expect(page.locator('[data-stage=star-3]')).not.toContainText('Découvre d’abord');
});
