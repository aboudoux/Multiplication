import { missionRewards, type Reward } from './mission-rewards';
import { createPool, shuffle, type Calculation, type Operation, type Duration } from './calculations';
import type { ThemeId as AllThemeIds } from './themes';
import { picoCast, type PicoThemeId } from './pico-content';
import type {Grade} from './curriculum';
type ThemeId = Exclude<AllThemeIds, 'ant'>;
type OriginalThemeId = Exclude<ThemeId, PicoThemeId>;
const originalThemeIds:readonly OriginalThemeId[] = ['kitten','unicorn','alien','christmas','halloween','wizard','dragon','star'];

export const ADVENTURE_KEY = 'calcul-party:adventure:v1';
export const PICO_ADVENTURE_KEY = 'calcul-party:adventure:pico:v1';
const originalLives: Record<OriginalThemeId, number | null> = {
  kitten:null, unicorn:7, alien:7, christmas:5, halloween:5, wizard:3, dragon:3, star:3,
};
export const adventureLives = {...originalLives,...Object.fromEntries(picoCast.map((c,i)=>[c.id,originalLives[originalThemeIds[i]]]))} as Record<ThemeId,number|null>;
export function adventureLivesLabel(world: ThemeId): string {
  const lives=adventureLives[world];
  return lives === null ? 'Essais illimités' : `${lives} vies par mission`;
}
const originalDurations: Record<OriginalThemeId, Duration | null> = {
  kitten:null, unicorn:30, alien:30, christmas:15, halloween:15, wizard:10, dragon:10, star:10,
};
export const adventureDurations = {...originalDurations,...Object.fromEntries(picoCast.map((c,i)=>[c.id,originalDurations[originalThemeIds[i]]]))} as Record<ThemeId,Duration|null>;
export function adventureTimeLabel(world: ThemeId): string {
  const duration=adventureDurations[world];
  return duration === null ? 'Sans chrono' : `${duration} s par calcul`;
}
export interface AdventureProgress { completed: string[] }
export interface AdventureWorld {
  id: ThemeId; name: string; friend: string; tier: number; color: string;
  missions: readonly [string, string, string]; souvenir: string;
}
export const worlds: readonly AdventureWorld[] = [
  {id:'kitten',name:'Le jardin du chaton',friend:'Chaton',tier:0,color:'#ffc35c',missions:['Retrouve les pelotes','Prépare le goûter','Décore la maison'],souvenir:'Les invitations sont prêtes !'},
  {id:'unicorn',name:'La forêt arc-en-ciel',friend:'Licorne',tier:1,color:'#ffafd3',missions:['Réveille les fleurs','Suis les papillons','Invite la licorne'],souvenir:'La licorne apporte les arcs-en-ciel !'},
  {id:'alien',name:'La planète des bulles',friend:'Ziggy',tier:1,color:'#8decff',missions:['Allume les étoiles','Répare la soucoupe','Invite Ziggy'],souvenir:'Ziggy apporte une machine à bulles !'},
  {id:'christmas',name:'Le village des cadeaux',friend:'Père Noël',tier:2,color:'#ff879b',missions:['Compte les cadeaux','Prépare le traîneau','Invite le Père Noël'],souvenir:'Le Père Noël apporte des surprises !'},
  {id:'halloween',name:'Le potager enchanté',friend:'Citrouille',tier:2,color:'#ffb65b',missions:['Éclaire les lanternes','Retrouve les bonbons','Invite la citrouille'],souvenir:'La citrouille apporte des lanternes !'},
  {id:'wizard',name:'Le château des sorts',friend:'Petit sorcier',tier:3,color:'#ffdb83',missions:['Range les potions','Fais voler les balais','Invite le sorcier'],souvenir:'Le sorcier apporte ses tours de magie !'},
  {id:'dragon',name:'La montagne des trésors',friend:'Dragon',tier:3,color:'#ff9959',missions:['Découvre les cristaux','Ouvre le coffre','Invite le dragon'],souvenir:'Le dragon apporte un trésor de confettis !'},
  {id:'star',name:'La grande fête',friend:'Étoile',tier:4,color:'#fff17d',missions:['Installe les guirlandes','Prépare la piste','Que la fête commence !'],souvenir:'Tous les amis sont réunis. Place à la fête !'},
];
export interface AdventureStage { id: string; world: AdventureWorld; index: number; name: string; count: number; operations: Operation[]; limit: number; tables: number; lesson: string; quotas?: Partial<Record<Operation,number>>; study?:{grade:Grade;skills:string[];phase:number;mixed?:boolean;policy?:import('./adventure-policy').AdventureMissionPolicy} }
type Challenge = {difficulty:string; counts:number[]; limits:number[]; tables:number[]; operations:Operation[][]};
const originalChallenges: Record<OriginalThemeId,Challenge> = {
 kitten:{difficulty:'Découverte',counts:[5,8,10],limits:[5,8,10],tables:[1,1,1],operations:[['add'],['add'],['add']]},
 unicorn:{difficulty:'Facile',counts:[10,15,20],limits:[10,10,12],tables:[1,1,1],operations:[['add'],['subtract'],['add','subtract']]},
 alien:{difficulty:'Malin',counts:[15,20,30],limits:[15,15,20],tables:[1,1,1],operations:[['add'],['subtract'],['add','subtract']]},
 christmas:{difficulty:'Intermédiaire',counts:[20,30,40],limits:[20,20,20],tables:[1,1,1],operations:[['add','subtract'],['add','subtract'],['add','subtract']]},
 halloween:{difficulty:'Corsé',counts:[20,30,50],limits:[20,20,20],tables:[2,3,5],operations:[['add','subtract','multiply'],['add','subtract','multiply'],['add','subtract','multiply']]},
 wizard:{difficulty:'Difficile',counts:[30,50,70],limits:[20,20,20],tables:[3,5,7],operations:[['multiply'],['multiply'],['multiply']]},
 dragon:{difficulty:'Expert',counts:[50,70,100],limits:[20,20,20],tables:[5,7,10],operations:[['multiply'],['multiply'],['multiply']]},
 star:{difficulty:'Grand final',counts:[50,75,140],limits:[20,20,20],tables:[7,10,10],operations:[['add','subtract','multiply'],['add','subtract','multiply'],['add','subtract','multiply']]},
};
export const challenges = {...originalChallenges,...Object.fromEntries(picoCast.map((c,i)=>[c.id,originalChallenges[originalThemeIds[i]]]))} as Record<ThemeId,Challenge>;
function createStages(adventureWorlds:readonly AdventureWorld[]):readonly AdventureStage[] { return adventureWorlds.flatMap(world => world.missions.map((name,index) => {
  const config=challenges[world.id], operations=config.operations[index], limit=config.limits[index], tables=config.tables[index];
  const final=world.tier===4 && index===2;
  return {id:`${world.id}-${index + 1}`,world,index,name,count:config.counts[index],operations,limit,tables,
    quotas:final ? {add:20,subtract:20,multiply:100} : undefined,
    lesson:final ? 'Les 100 multiplications + 40 additions et soustractions' : operations.length===1 && operations[0]==='multiply' ? `Toutes les tables de 1 à ${tables} · de ×1 à ×10` : operations.includes('multiply') ? `Les trois opérations · tables jusqu’à ${tables}` : `${operations.length === 2 ? 'Additions et soustractions' : operations[0] === 'add' ? 'Additions' : 'Soustractions'} jusqu’à ${limit}`};
})); }
/** Historical exports always describe the kitten adventure. */
export const stages = createStages(worlds);
export const picoWorlds:readonly AdventureWorld[] = picoCast.map(c=>({id:c.id,name:c.world,friend:c.name,tier:c.tier,color:c.color,missions:c.missions,souvenir:c.contribution}));
export const picoStages = createStages(picoWorlds);
export type AdventureId = 'chaton'|'pico';
export interface AdventureDefinition {
 adaptive?:boolean;
 id:AdventureId; title:string; heading:string; description:string; hero:ThemeId; storageKey:string;
 worlds:readonly AdventureWorld[]; stages:readonly AdventureStage[]; rewards:Readonly<Record<string,Reward>>; regions:readonly string[];
 endingTitle:string; endingDescription:string; celebrateLabel:string; finale:'birthday'|'lighthouse';
}
export const chatonAdventure:AdventureDefinition = {
 id:'chaton',title:'L’aventure du chaton',heading:'Une fête, huit amis !',description:'Aide le chaton à préparer sa fête. Explore les mondes et invite leurs habitants.',hero:'kitten',storageKey:ADVENTURE_KEY,worlds,stages,rewards:Object.fromEntries(stages.map(s=>[s.id,missionRewards[s.id]])),
 regions:['Tout commence dans le jardin','Choisis ton premier voyage','Deux invités hauts en couleur','Un peu de magie… et des tables !','Tous ensemble à la fête'],
 endingTitle:'Tout le monde est là !',endingDescription:'Bravo ! Tu peux refaire tes missions préférées ou t’entraîner au camp des fourmis.',celebrateLabel:'Que la fête commence ! ♫',finale:'birthday',
};
export const picoAdventure:AdventureDefinition = {
 id:'pico',title:'Pico et le phare des îles',heading:'Un phare, huit compagnons !',description:'La tempête a éteint le phare. Prends la mer avec Pico, retrouve ses amis et rallume la lumière de l’archipel.',hero:'pico',storageKey:PICO_ADVENTURE_KEY,worlds:picoWorlds,stages:picoStages,rewards:Object.fromEntries(picoStages.map(s=>[s.id,missionRewards[s.id]])),
 regions:['Le grand départ de Pico','Cap sur le lagon et les vents','Les ateliers de l’archipel','Le mécanisme et l’énergie','Tous ensemble au phare'],
 endingTitle:'Le phare brille à nouveau !',endingDescription:'Les huit compagnons ont réuni leurs talents. Les bateaux retrouvent leur chemin !',celebrateLabel:'Voir le phare s’allumer ! ✦',finale:'lighthouse',
};
export const adventures:readonly AdventureDefinition[] = [chatonAdventure,picoAdventure];
export function adventureForTheme(id:ThemeId):AdventureDefinition { return picoWorlds.some(w=>w.id===id)?picoAdventure:chatonAdventure; }

export function worldFinished(progress: AdventureProgress, id: ThemeId, adventure:AdventureDefinition=chatonAdventure): boolean {
  const missions=adventure.stages.filter(s=>s.world.id===id);
  return missions.length===3 && missions.every(s => progress.completed.includes(s.id));
}
export function worldUnlocked(progress: AdventureProgress, world: AdventureWorld, adventure:AdventureDefinition=chatonAdventure): boolean {
  return adventure.worlds.some(w=>w.id===world.id) && (world.tier === 0 || adventure.worlds.filter(w => w.tier < world.tier).every(w => worldFinished(progress,w.id,adventure)));
}
export function stageUnlocked(progress: AdventureProgress, stage: AdventureStage, adventure:AdventureDefinition=chatonAdventure): boolean {
  return adventure.stages.some(s=>s.id===stage.id && s.world.id===stage.world.id) && worldUnlocked(progress,stage.world,adventure) && (stage.index === 0 || progress.completed.includes(`${stage.world.id}-${stage.index}`));
}
export function completeStage(progress: AdventureProgress, stage: AdventureStage, adventure:AdventureDefinition=chatonAdventure): boolean {
  if (!stageUnlocked(progress,stage,adventure) || progress.completed.includes(stage.id)) return false;
  progress.completed.push(stage.id); return true;
}
export function readAdventure(storage: Pick<Storage,'getItem'>, adventure:AdventureDefinition=chatonAdventure): AdventureProgress {
  const progress: AdventureProgress = {completed:[]};
  try {
    const value = JSON.parse(storage.getItem(adventure.storageKey) ?? 'null');
    if (!Array.isArray(value?.completed)) return progress;
    // Validate dependencies as well as IDs; damaged saves never unlock a late world.
    for (const stage of adventure.stages) if (value.completed.includes(stage.id)) completeStage(progress,stage,adventure);
  } catch { /* A blocked or damaged save must not prevent playing. */ }
  return progress;
}
export function saveAdventure(storage: Pick<Storage,'setItem'>, progress: AdventureProgress, adventure:AdventureDefinition=chatonAdventure): boolean {
  try { storage.setItem(adventure.storageKey,JSON.stringify(progress)); return true; } catch { return false; }
}
export function resetAdventure(storage: Pick<Storage,'removeItem'>, adventure:AdventureDefinition=chatonAdventure): boolean {
  try { storage.removeItem(adventure.storageKey); return true; } catch { return false; }
}
export function adventureQuestions(stage: AdventureStage, random = Math.random): Calculation[] {
  const pools = stage.operations.map(op => shuffle(createPool(op,stage.tables).filter(q => op === 'multiply' || (q.a <= stage.limit && q.b <= stage.limit && q.result <= stage.limit)),random));
  if(stage.quotas) {
    const selected=pools.flatMap((pool,i)=>{
      const quota=stage.quotas![stage.operations[i]] ?? 0;
      if(quota>pool.length) throw new RangeError('Insufficient questions for mission quota');
      return pool.slice(0,quota);
    });
    if(selected.length!==stage.count) throw new RangeError('Invalid mission quota total');
    return shuffle(selected,random);
  }
  if(pools.reduce((sum,pool)=>sum+pool.length,0)<stage.count) throw new RangeError('Insufficient questions for mission');
  const questions: Calculation[] = [];
  while (questions.length < stage.count) for (const pool of pools) {
    const q = pool.shift(); if (q && questions.length < stage.count) questions.push(q);
  }
  return shuffle(questions,random);
}
