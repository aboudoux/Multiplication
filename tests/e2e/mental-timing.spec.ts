import {test,expect,type Page} from '@playwright/test';
import {adventures} from '../../src/adventure';
import {adaptedAdventure,resolveAdventureMission} from '../../src/adaptive-adventure';
import {mentalPaths} from '../../src/mental-patterns';
import {adventureRulesLabel,adventureQuestionTimeLimit,type AdventureDifficulty,type AdventurePractice} from '../../src/adventure-policy';
import {answerLabel,answerMatches} from '../../src/questions';

const known:AdventurePractice={CM1:Object.fromEntries(mentalPaths.CM1.map(id=>[id,1 as const]))};
async function setup(page:Page,history:AdventurePractice=known,difficulty:AdventureDifficulty='normal') {
 await page.addInitScript(({adventures,history,difficulty})=>{
  Math.random=()=>.5;
  if(!localStorage.getItem('calcul-party:players:v1'))localStorage.setItem('calcul-party:players:v1',JSON.stringify({version:1,active:'old',players:[{id:'old',name:'Chrono',avatar:'🐱',grade:'CM1',adaptive:true,mastery:{},mentalDuration:10,adventureDifficulty:difficulty,adventurePractice:history,data:{'multipli-party:v1':JSON.stringify({muted:true,voiceEnabled:false}),...Object.fromEntries(adventures.map(a=>[a.storageKey,JSON.stringify({completed:a.stages.map(s=>s.id)})]))}}]}));
 },{adventures,history,difficulty});
 await page.clock.install({time:new Date('2026-10-06T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-10-06T12:00:10Z'));
}
async function openAdventure(page:Page,id:string){await page.locator('#open-adventure').click();await page.locator('[data-adventure='+id+']').click();}
async function answer(page:Page,q:ReturnType<typeof resolveAdventureMission>['questions'][number]){
 const exercise=q.exercise!;
 if(exercise.choices){const choice=exercise.choices.find(value=>answerMatches(exercise.answer,value))!;await page.locator('.study-choices').getByRole('button',{name:choice,exact:true}).click();}
 else await page.locator('#study-input-0').fill(answerLabel(exercise.answer));
 await page.clock.runFor(700);
}

for(const adventure of adventures)for(const [index,world] of adventure.worlds.entries())test(adventure.id+' monde '+(index+1)+' : les notions introduites utilisent le chrono et les vies annoncés',async({page})=>{
 await page.setViewportSize({width:index%2?390:768,height:950});await setup(page);await openAdventure(page,adventure.id);
 const stage=adaptedAdventure(adventure,'CM1','normal',known).stages.find(s=>s.world.id===world.id)!;
 const resolved=resolveAdventureMission(stage,known,()=>.5),{policy,questions}=resolved;
 const mission=page.locator('[data-stage='+stage.id+']');
 await expect(mission).toContainText(adventureRulesLabel(policy));await expect(mission).toContainText(questions.length+' calculs');
 await mission.click();await page.clock.runFor(4050);
 await expect(page.locator('#equation')).toHaveText(questions[0].exercise!.prompt);
 await expect(page.locator('#progress-goal')).toHaveText(String(questions.length));
 const duration=adventureQuestionTimeLimit(policy,questions[0])!/1000;
 expect([15,25]).toContain(duration);await expect(page.locator('#time-left')).toHaveText(duration+' s');
 await expect(page.locator('#hearts [data-heart]')).toHaveCount(policy.lives!);
 await page.clock.runFor(1000);const before=await page.locator('#time-left').innerText();
 await page.locator('#pause').click();await page.clock.runFor(60000);await page.locator('#resume').click();await page.clock.runFor(4050);
 await expect(page.locator('#time-left')).toHaveText(before);
 await page.clock.runFor(duration*1000);await expect(page.locator('#hearts [data-heart]:not(.lost)')).toHaveCount(policy.lives!-1);
 await expect(page.locator('#study-input-0')).toBeDisabled();
});

test('une finale CM1 alterne les délais de faits et de stratégies dans la même tentative',async({page})=>{
 await setup(page);await openAdventure(page,'chaton');
 const stage=adaptedAdventure(adventures[0],'CM1','normal',known).stages.at(-1)!,{policy,questions}=resolveAdventureMission(stage,known,()=>.5);
 await expect(page.locator('[data-stage=star-3]')).toContainText('15–25 s selon le calcul');
 await page.locator('[data-stage=star-3]').click();await page.clock.runFor(4050);
 const seen=new Set<string>();
 for(const q of questions){
  await expect(page.locator('#equation')).toHaveText(q.exercise!.prompt);
  await expect(page.locator('#time-left')).toHaveText(adventureQuestionTimeLimit(policy,q)!/1000+' s');
  seen.add(q.exercise!.pace!);await answer(page,q);if(seen.size===2)break;
 }
 expect(seen).toEqual(new Set(['fact','strategy']));
 await expect(page.locator('#hearts [data-heart]:not(.lost)')).toHaveCount(policy.lives!);
});

for(const adventure of adventures)test(adventure.id+' : une nouvelle notion du monde avancé reste sans chrono',async({page})=>{
 await setup(page,{});await openAdventure(page,adventure.id);
 const stage=adaptedAdventure(adventure,'CM1','normal',{}).stages[18],mission=page.locator('[data-stage='+stage.id+']');
 await expect(mission).toContainText('Découverte');await expect(mission).toContainText('Sans chrono · Essais illimités');
 await mission.click();await page.clock.runFor(4050);await expect(page.locator('#time-left')).toBeHidden();
 await expect(page.locator('#hearts')).toContainText('À volonté');await page.clock.runFor(60000);
 await expect(page.locator('#study-input-0')).toBeEnabled();await expect(page.locator('#correction-card')).toBeHidden();
});

test('Expert est choisi manuellement, persiste et change le quota et le chrono effectifs',async({page})=>{
 await setup(page);await openAdventure(page,'chaton');
 await expect(page.locator('[data-stage=kitten-2]')).toContainText('10 calculs');await expect(page.locator('[data-stage=kitten-2]')).toContainText('15 s par calcul');
 await page.locator('#leave-adventure').click();await page.locator('#player-picker').click();await page.locator('#edit-player [name=adventureDifficulty]').selectOption('expert');await page.locator('#edit-player button[type=submit]').click();
 await page.reload();await page.locator('#player-picker').click();await expect(page.locator('#edit-player [name=adventureDifficulty]')).toHaveValue('expert');await page.locator('#player-close').click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('calcul-party:players:v1')!).players[0]);expect(stored.adventureDifficulty).toBe('expert');expect(stored.adventurePractice).toEqual(known);
 await openAdventure(page,'chaton');
 const stage=adaptedAdventure(adventures[0],'CM1','expert',known).stages[1],{policy,questions}=resolveAdventureMission(stage,known,()=>.5);
 expect(questions).toHaveLength(12);expect(policy.lives).toBe(3);await expect(page.locator('[data-stage=kitten-2]')).toContainText(adventureRulesLabel(policy));
 await page.locator('[data-stage=kitten-2]').click();await page.clock.runFor(4050);
 await expect(page.locator('#progress-goal')).toHaveText('12');await expect(page.locator('#difficulty-label')).toContainText('Expert');await expect(page.locator('#time-left')).toHaveText('10 s');await expect(page.locator('#hearts [data-heart]')).toHaveCount(3);
});

test('enregistrer le profil conserve les anciennes données et le choix Normal sans préférence de chrono',async({page})=>{
 await setup(page);await page.locator('#player-picker').click();await expect(page.locator('[name=mentalDuration]')).toHaveCount(0);
 await expect(page.locator('#edit-player [name=adventureDifficulty]')).toHaveValue('normal');
 await page.locator('#edit-player [name=name]').fill('Camille');await page.locator('#edit-player button[type=submit]').click();
 const player=await page.evaluate(()=>JSON.parse(localStorage.getItem('calcul-party:players:v1')!).players[0]);
 expect(player.mentalDuration).toBe(10);expect(player.name).toBe('Camille');expect(player.adventureDifficulty).toBe('normal');expect(player.adventurePractice).toEqual(known);
 for(const adventure of adventures)expect(JSON.parse(player.data[adventure.storageKey]).completed).toHaveLength(24);
});
