import { modes, shuffle, symbols, type Calculation, type Duration, type GameSettings, type Operation } from './calculations';
import { clockGameIds, clockQuestionCount, type ClockGame } from './clock-games';

export type Carry = 'all' | 'without' | 'with';
export interface NumberRules { min: number; max: number; carry: Carry }
export interface TrainingSettings {
  operations: Operation[];
  add: NumberRules;
  subtract: NumberRules;
  zero: boolean;
  tables: number[];
  multiplierMin: number;
  multiplierMax: number;
  length: number | 'all';
  duration: Duration | null;
  lives: number | null;
  voice: 'classic' | 'ant';
}
export interface TrainingData {
  settings: TrainingSettings;
  materials: number;
  records: Record<string, { timeMs: number; mistakes: number }>;
  colony?: { built: number; spent: number; stars: number };
  clock?: ClockPracticeSettings;
}
export interface ClockPracticeSettings extends Pick<TrainingSettings, 'length' | 'duration' | 'lives' | 'voice'> {
  game: ClockGame;
  level: 0 | 1 | 2;
}
export function clockPracticePreset(game: ClockGame = 'read', level: ClockPracticeSettings['level'] = 0): ClockPracticeSettings {
  return {game,level,length:5,duration:null,lives:null,voice:'ant'};
}
export function clockPracticeRecordKey(s: ClockPracticeSettings): string {
  return `clock:${s.game}:${s.level}:${s.length === 'all' ? clockQuestionCount(s.game,s.level) : s.length}:${s.duration}:${s.lives}`;
}
export const TRAINING_KEY = 'calcul-party:training:v1';
export const buildings = ['La passerelle', 'Le garde-manger', 'Le dortoir', 'Le jardin', 'La tour d’observation', 'La place des fêtes'];
export const buildingCosts = [60,90,120,180,240,300];
export const colonyStarCost = 300;
/** Old automatic buildings remain acquired; new work always requires a click. */
export function colonyProgress(data: TrainingData): NonNullable<TrainingData['colony']> {
  if (!data.colony) {
    const built=Math.min(6,Math.floor(data.materials/20));
    const stars=Math.max(0,Math.floor((data.materials-120)/20));
    data.colony={built,spent:built*20+stars*20,stars};
  }
  return data.colony;
}
export function colonyStatus(data: TrainingData) {
  const progress=colonyProgress(data);
  const stock=Math.max(0,data.materials-progress.spent);
  const cost=buildingCosts[progress.built]??colonyStarCost;
  return {...progress,stock,cost,missing:Math.max(0,cost-stock),name:buildings[progress.built]??'Une étoile sur le drapeau'};
}
/** Spending and completion are one saved action, independent of the animation. */
export function buildColony(data: TrainingData): boolean {
  const state=colonyStatus(data);
  if(state.missing) return false;
  const progress=colonyProgress(data);
  progress.spent+=state.cost;
  if(progress.built<buildings.length) progress.built++; else progress.stars++;
  return true;
}
export function preset(kind = 'first'): TrainingSettings {
  return {
    operations: kind === 'tables' ? ['multiply'] : kind === 'mix' ? ['add','subtract','multiply'] : ['add'],
    add: { min: 1, max: kind === 'first' ? 10 : 20, carry: 'all' },
    subtract: { min: 1, max: 20, carry: 'all' }, zero: false,
    tables: kind === 'tables' ? [2,5] : [1,2,3,4,5], multiplierMin: 1, multiplierMax: 10,
    length: kind === 'first' ? 10 : 20, duration: null, lives: null, voice: 'ant',
  };
}
export function importTraining(settings: GameSettings): TrainingSettings {
  return { ...preset('mix'), operations: [...modes[settings.mode].operations],
    tables: Array.from({length:settings.tables},(_,i)=>i+1), length:settings.length,
    duration:settings.duration, lives:settings.lives };
}
const integer = (n: unknown, min: number, max: number): n is number => Number.isInteger(n) && Number(n) >= min && Number(n) <= max;
/** Structural validation also accepts incomplete drafts, so an empty selection survives a reload. */
export function isTrainingSettings(value: unknown): value is TrainingSettings {
  if (!value || typeof value !== 'object') return false;
  const s = value as TrainingSettings;
  return Array.isArray(s.operations) && s.operations.every(op=>['add','subtract','multiply'].includes(op))
    && new Set(s.operations).size === s.operations.length
    && [s.add,s.subtract].every(r=>r && integer(r.min,1,100) && integer(r.max,1,100) && ['all','with','without'].includes(r.carry))
    && typeof s.zero === 'boolean' && Array.isArray(s.tables) && s.tables.every(n=>integer(n,1,10))
    && new Set(s.tables).size === s.tables.length && integer(s.multiplierMin,0,10) && integer(s.multiplierMax,0,10)
    && (s.length === 'all' || integer(s.length,1,100)) && (s.duration === null || [5,10,15,30].includes(s.duration))
    && (s.lives === null || integer(s.lives,1,10)) && ['classic','ant'].includes(s.voice);
}
export function trainingPool(s: TrainingSettings, operation: Operation): Calculation[] {
  const result: Calculation[] = [];
  const rule = operation === 'subtract' ? s.subtract : s.add;
  const numbers = operation === 'multiply' ? s.tables : Array.from({length:Math.max(0,rule.max-rule.min+1)},(_,i)=>i+rule.min);
  const left = operation !== 'multiply' && s.zero ? [0,...numbers] : numbers;
  const right = operation === 'multiply'
    ? Array.from({length:Math.max(0,s.multiplierMax-s.multiplierMin+1)},(_,i)=>i+s.multiplierMin).filter(n=>s.zero || n!==0)
    : left;
  for (const a of left) for (const b of right) {
    const answer = operation === 'add' ? a+b : operation === 'subtract' ? a-b : a*b;
    if (operation !== 'multiply') {
      if (!(answer === 0 && s.zero) && (answer < rule.min || answer > rule.max)) continue;
      const carry = operation === 'add' ? a%10+b%10 >= 10 : a%10 < b%10;
      if (rule.carry === 'with' && !carry || rule.carry === 'without' && carry) continue;
    }
    result.push({operation,a,b,result:answer,id:`${operation}:${a}:${b}`});
  }
  return result;
}
export function inspectTraining(s: TrainingSettings): { pools: Calculation[][]; count: number; error: string } {
  if (!isTrainingSettings(s)) return {pools:[],count:0,error:'Vérifie les nombres saisis : bornes de 1 à 100, longueur de 1 à 100.'};
  if (!s.operations.length) return {pools:[],count:0,error:'Choisis au moins une opération.'};
  if ((['add','subtract'] as const).some(op=>s.operations.includes(op) && s[op].min>s[op].max)) return {pools:[],count:0,error:'Le minimum doit être inférieur ou égal au maximum.'};
  const pools = s.operations.map(op=>trainingPool(s,op));
  const count = pools.reduce((n,p)=>n+p.length,0);
  const empty = pools.findIndex(p=>!p.length);
  const error = empty >= 0 ? `Aucun calcul pour ${modes[s.operations[empty]].name}. Ajuste ses nombres, ses tables ou son passage de dizaine.`
    : s.length !== 'all' && s.length > count ? `Il reste ${count} calculs distincts : réduis la longueur ou élargis ta sélection.` : '';
  return {pools,count,error};
}
export function trainingQuestions(s: TrainingSettings, random = Math.random): Calculation[] {
  const { pools, count, error } = inspectTraining(s);
  if (error) throw new RangeError(error);
  const queues = shuffle(pools.map(p=>shuffle(p,random)),random);
  const selected: Calculation[] = [];
  const target = s.length === 'all' ? count : s.length;
  while(selected.length < target) for (const queue of queues) {
    const next = queue.pop();
    if (next) selected.push(next);
    if (selected.length === target) break;
  }
  return shuffle(selected,random);
}
export function trainingLabel(s: TrainingSettings): string {
  const count=s.length === 'all' ? inspectTraining(s).count : s.length;
  return `${count} calcul${count===1?'':'s'} · ${s.operations.map(op=>symbols[op]).join(' ')}${s.operations.includes('multiply') ? ` · tables ${s.tables.join(', ')}` : ''} · ${s.duration === null ? 'sans chrono' : `${s.duration} s`} · ${s.lives === null ? 'essais illimités' : `${s.lives} vie${s.lives===1?'':'s'}`}`;
}
export function trainingRecordKey(s: TrainingSettings): string {
  return JSON.stringify({operations:[...s.operations].sort(), add:s.operations.includes('add')?s.add:null,
    subtract:s.operations.includes('subtract')?s.subtract:null, zero:s.zero,
    tables:s.operations.includes('multiply')?[...s.tables].sort((a,b)=>a-b):[],
    multipliers:s.operations.includes('multiply')?[s.multiplierMin,s.multiplierMax]:null,
    length:s.length === 'all'?inspectTraining(s).count:s.length,duration:s.duration,lives:s.lives});
}
export function readTraining(storage: Pick<Storage,'getItem'>, legacy?: GameSettings): TrainingData {
  const fallback: TrainingData = {settings:legacy?importTraining(legacy):preset(),materials:0,records:{},colony:{built:0,spent:0,stars:0},clock:clockPracticePreset()};
  try {
    const data = JSON.parse(storage.getItem(TRAINING_KEY) ?? 'null');
    if (!data) return fallback;
    if (isTrainingSettings(data.settings)) fallback.settings = data.settings;
    const s = data.clock;
    if (s && clockGameIds.includes(s.game) && integer(s.level,0,2)
      && (s.length === 'all' || integer(s.length,1,100))
      && [null,5,10,15,30].includes(s.duration)
      && (s.lives === null || integer(s.lives,1,10))
      && ['ant','classic'].includes(s.voice)) fallback.clock = s;
    if (integer(data.materials,0,Number.MAX_SAFE_INTEGER)) fallback.materials=data.materials;
    if(data.colony===undefined) { delete fallback.colony; colonyProgress(fallback); }
    else if(data.colony && integer(data.colony.built,0,6) && integer(data.colony.spent,0,fallback.materials)
      && integer(data.colony.stars,0,Number.MAX_SAFE_INTEGER) && (data.colony.built===6 || data.colony.stars===0)) {
      fallback.colony={built:data.colony.built,spent:data.colony.spent,stars:data.colony.stars};
    }
    if (data.records && typeof data.records === 'object') for (const [key,value] of Object.entries(data.records)) {
      const score = value as {timeMs:number;mistakes:number};
      if (score && Number.isFinite(score.timeMs) && score.timeMs>=0 && integer(score.mistakes,0,Number.MAX_SAFE_INTEGER)) fallback.records[key]=score;
    }
  } catch { /* Invalid saved data never prevents entering the camp. */ }
  return fallback;
}
export function saveTraining(storage: Pick<Storage,'setItem'>, data: TrainingData): boolean {
  try { storage.setItem(TRAINING_KEY,JSON.stringify(data)); return true; } catch { return false; }
}
/** Session-local checkpoint: repeated renders cannot award the same success twice. */
export function awardMaterials(data: TrainingData, solved: number, credited: number): number {
  colonyProgress(data);
  data.materials += Math.max(0,solved-credited);
  return Math.max(solved,credited);
}
