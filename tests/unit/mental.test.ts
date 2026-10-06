import {describe,it,expect} from 'vitest';
import {grades} from '../../src/curriculum';
import {mentalPatterns,mentalCurriculum,mentalPaths,recordMentalEvidence,emptyMental,type MentalMasteries} from '../../src/mental-patterns';
import {mentalFacts} from '../../src/mental-generator';
import {studyBank} from '../../src/study-generator';
import {adaptedAdventure,adaptiveQuestions} from '../../src/adaptive-adventure';
import {adventures} from '../../src/adventure';
import {Game} from '../../src/game';
import {defaults} from '../../src/storage';
import {Profiles,PROFILES_KEY} from '../../src/profiles';

describe('calcul mental',()=>{
 it('toutes les classes proposent seulement les patterns courts et les niveaux existent',()=>{
  const banned=['mystery','remainder','proportion','program','equation-two','equation-both','equation-set','identity','inequality','successive','negative-power'];
  for(const grade of grades){const ids=mentalCurriculum(grade).map(p=>p.id);for(const id of mentalPaths[grade])expect(ids).toContain(id);for(const id of banned)expect(ids).not.toContain(id);}
  for(const p of mentalPatterns)for(let level=0;level<=p.maxLevel;level++){
   const bank=studyBank(p.id,'2de',level);expect(bank.length).toBeGreaterThan(0);
   for(const q of bank){expect(q.exercise!.patternId).toBe(p.id);expect(['remainder','set','inequality']).not.toContain(q.exercise!.answer.kind);}
   if(level>0)expect(bank.map(q=>q.id),`${p.id} ${level}`).not.toEqual(studyBank(p.id,'2de',level-1).map(q=>q.id));
  }
 });
 it('les inconnues CM1 sont toujours à une seule opération et les produits spéciaux sont bornés',()=>{
  for(const level of [0,1,2]){
   for(const q of studyBank('missing','CM1',level)){expect(q.exercise!.prompt).not.toMatch(/[()]/);expect(q.exercise!.prompt.match(/[+−×÷]/g)).toHaveLength(1);}
   for(const q of studyBank('large-multiply','CM1',level)){const [a,b]=q.exercise!.prompt.match(/\d+/g)!.map(Number);expect(q.result).toBe(a*b);if(a===125)expect([2,4,8]).toContain(b);}
   for(const q of studyBank('divide','CM1',level)){const [a,b]=q.exercise!.prompt.match(/\d+/g)!.map(Number);expect(b).toBeGreaterThan(0);expect(q.result).toBe(a/b);expect(q.result).toBeLessThanOrEqual(10);}
  }
 });
 it('les décimaux restent courts et les cubes ne grandissent jamais',()=>{
  for(const level of [0,1,2]){
   expect(studyBank('cube','5e',level).map(q=>q.result).sort((a,b)=>a-b)).toEqual([0,1,8,27,1000]);
   for(const id of ['decimal-add','decimal-multiply','decimal-divide'])for(const q of studyBank(id,'CM2',level)){
    const [a,b]=q.exercise!.prompt.replaceAll(',','.').match(/\d+(?:\.\d+)?/g)!.map(Number);const answer=q.exercise!.answer;if(answer.kind!=='decimal')throw Error('Décimal attendu');
    expect(a).toBeLessThanOrEqual(id==='decimal-divide'?100:20);const value=answer.value.numerator/answer.value.denominator;
    expect(value).toBeCloseTo(id==='decimal-add'?q.exercise!.prompt.includes('−')?a-b:a+b:id==='decimal-multiply'?a*b:a/b,10);
   }
  }
 });
 it('la troisième mission rappelle seulement les patterns pratiqués et le final les répartit',()=>{
  const m:MentalMasteries={};recordMentalEvidence(m,'divide',{first:true,helped:false,timeMs:1000});
  const a=adaptedAdventure(adventures[0],'CM1',m),third=a.stages[5];
  const deck=adaptiveQuestions(third,m,()=>.5);expect(deck.filter(q=>q.exercise!.patternId==='divide')).toHaveLength(Math.round(third.count*.2));
  expect(adaptiveQuestions(a.stages[3],m).every(q=>q.exercise!.patternId==='large-multiply')).toBe(true);
  const final=adaptiveQuestions(a.stages.at(-1)!,m);expect(final.every(q=>q.exercise!.patternId==='divide')).toBe(true);
 });
 it('la vitesse limite la montée, jamais la réussite et les acquis anciens sont isolés',()=>{
  const fast:MentalMasteries={},slow:MentalMasteries={};
  for(let i=0;i<20;i++){recordMentalEvidence(fast,'add',{first:true,helped:false,timeMs:1000});recordMentalEvidence(slow,'add',{first:true,helped:false,timeMs:20000});}
  expect(fast.add.level).toBe(1);expect(fast.add.comfortable).toBe(true);expect(slow.add.level).toBe(0);
  for(let i=0;i<10;i++)recordMentalEvidence(fast,'add',{first:true,helped:false,timeMs:1000});expect(fast.add.level).toBe(1);
  slow.add.level=1;for(let i=0;i<10;i++)recordMentalEvidence(slow,'add',{first:true,helped:false,timeMs:20000});expect(slow.add.level).toBe(1);
  for(let i=0;i<10;i++)recordMentalEvidence(fast,'add',{first:false,helped:false,timeMs:1000});expect(fast.add.level).toBe(0);expect(fast.add.comfortable).toBe(false);
  const helped:MentalMasteries={};for(let i=0;i<20;i++)recordMentalEvidence(helped,'cube',{first:true,helped:true,timeMs:1000});expect(helped.cube.comfortable).toBe(false);
  const cube:MentalMasteries={};for(let i=0;i<20;i++)recordMentalEvidence(cube,'cube',{first:true,helped:false,timeMs:1000});expect(cube.cube.level).toBe(0);expect(cube.cube.comfortable).toBe(true);
 });
 it('migre sans perte, conserve les familles retirées et isole rythme et progrès',()=>{
  const data=new Map<string,string>(),disk={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};
  const p=new Profiles(disk);p.active.mastery.mystery={samples:[],series:[10,10],comfortable:true,level:2};p.active.data['calcul-party:training:v1']='{"materials":40}';p.save();
  const loaded=new Profiles(disk);expect(loaded.mental).toEqual({});expect(loaded.active.mastery.mystery.level).toBe(2);expect(loaded.active.data['calcul-party:training:v1']).toContain('40');
  loaded.active.mentalDuration=10;recordMentalEvidence(loaded.mental,'add',{first:true,helped:false,timeMs:1000});loaded.save();loaded.add('Lina','GS');expect(loaded.mental).toEqual({});expect(loaded.active.mentalDuration??null).toBeNull();loaded.select('current');expect(loaded.active.mentalDuration).toBe(10);
  const malformed=JSON.parse(data.get(PROFILES_KEY)!);malformed.players[0].mentalMastery={version:1,skills:{unknown:{},add:{level:20,samples:[],series:[]}}};malformed.players[0].mentalDuration=30;disk.setItem(PROFILES_KEY,JSON.stringify(malformed));expect(new Profiles(disk).mental).toEqual({});expect(new Profiles(disk).active.mentalDuration).toBeNull();
 });
 it('ne crédite pas le nouveau palier avec les questions restantes du précédent',()=>{
  const m:MentalMasteries={},e={first:true,helped:false,timeMs:1000};
  for(let i=0;i<20;i++)recordMentalEvidence(m,'add',e,0);
  expect(m.add.level).toBe(1);
  for(let i=0;i<10;i++)recordMentalEvidence(m,'add',e,0);
  for(let i=0;i<10;i++)recordMentalEvidence(m,'add',e,1);
  expect(m.add.level).toBe(1);
  for(let i=0;i<10;i++)recordMentalEvidence(m,'add',e,1);
  expect(m.add.level).toBe(2);
  expect(mentalFacts('add','CP',0).every(q=>q.patternLevel===0)).toBe(true);
 });
});

describe('saisie mentale et rappels',()=>{
 const question=(value:number,id='q')=>({operation:'add' as const,a:0,b:0,result:value,id,exercise:{kind:'arithmetic' as const,skillId:'signed-add',patternId:'signed-add',prompt:'Calcul',spoken:'Calcul',hint:'Petit geste',answer:{kind:'integer' as const,value}}});
 const start=(questions:ReturnType<typeof question>[],onAnswer=()=>{})=>{const g=new Game({...defaults(),duration:10,lives:5},()=>.5,()=>true,{questions,untimed:true,unlimitedLives:true,explicitAnswers:true,autoIntegers:true,retryAfter:3,onAnswer});g.start(0);g.tick(4001);return g;};
 it.each([0,7,-7,12,-12])('valide %i automatiquement sans double résolution',value=>{
  let observed=0;const g=start([question(value)],()=>observed++);if(value<0){g.setAnswer('−',4100);expect(g.phase).toBe('question');}
  g.setAnswer(String(value),4200);expect(g.solved).toBe(1);expect(observed).toBe(1);g.submitAnswer(String(value),4200);expect(observed).toBe(1);
 });
 it('replace une erreur après trois autres calculs et déduplique la preuve',()=>{
  let observed=0;const questions=[1,2,3,4,5].map((n)=>question(n,String(n))),g=start(questions,()=>observed++);
  g.setAnswer('9',4100);g.tick(6101);expect(g.current?.id).toBe('2');
  let t=6101;for(const n of [2,3,4]){g.setAnswer(String(n),t+10);t+=700;g.tick(t);}
  expect(g.current?.id).toBe('1');g.setAnswer('1',t+10);expect(g.solved).toBe(4);expect(observed).toBe(4);expect(g.mistakes).toBe(1);
 });
 it('des erreurs répétées ne masquent pas les variantes encore inconnues',()=>{
  const seen=new Set<string>(),g=start(Array.from({length:10},(_,i)=>question(i,String(i))),q=>seen.add(q.id));let t=4001;
  for(let i=0;i<30&&seen.size<10;i++){g.setAnswer(g.current!.result===9?'8':'9',t+10);t+=2100;g.tick(t);}
  expect(seen.size).toBe(10);expect(g.solved).toBe(0);
 });
 it('un dépassement ne compte qu’une fois et les décimaux justes se valident seuls',()=>{
  let observed=0;const g=new Game({...defaults(),duration:10,lives:5},()=>.5,()=>true,{questions:[question(2)],untimed:false,unlimitedLives:false,explicitAnswers:true,autoIntegers:true,onAnswer:()=>observed++});g.start(0);g.tick(4001);g.setAnswer('2',14002);g.tick(14002);expect(g.lives).toBe(4);expect(observed).toBe(1);
  const decimalQ=mentalFacts('decimal-add','CM1',0)[0],d=new Game(defaults(),()=>.5,()=>true,{questions:[{...question(0),exercise:decimalQ}],untimed:true,unlimitedLives:true,explicitAnswers:true,autoIntegers:true});d.start(0);d.tick(4001);d.setAnswer('1,0',4100);expect(d.phase).toBe('victory');d.submitAnswer('1.0',4101);expect(d.solved).toBe(1);
 });
});
