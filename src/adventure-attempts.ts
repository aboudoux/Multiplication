import type {Grade, Evidence} from './curriculum';
import {grades} from './curriculum';
import type {AdventureDifficulty} from './adventure-policy';

export const ADVENTURE_ATTEMPTS_KEY='calcul-party:adventure-attempts:v1';
export interface AdventureAttempt {
  at:string; adventure:string; stage:string; grade:Grade; difficulty:AdventureDifficulty; discovery:boolean;
  outcome:'won'|'lost'|'abandoned'; total:number; solved:number; firstAnswers:number;
  firstCorrect:number; helped:number; mistakes:number; timeouts:number; activeMs:number;
}
type Disk=Pick<Storage,'getItem'|'setItem'>;
const counters=['total','solved','firstAnswers','firstCorrect','helped','mistakes','timeouts','activeMs'] as const;
export function readAdventureAttempts(disk:Pick<Disk,'getItem'>):AdventureAttempt[] {
  try {
    const value=JSON.parse(disk.getItem(ADVENTURE_ATTEMPTS_KEY)??'null');
    if(value?.version!==1||!Array.isArray(value.attempts))return [];
    return value.attempts.filter((a:AdventureAttempt)=>a&&typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))&&typeof a.adventure==='string'&&a.adventure.length<=80&&typeof a.stage==='string'&&a.stage.length<=80&&grades.includes(a.grade)&&typeof a.discovery==='boolean'&&['easy','normal','expert'].includes(a.difficulty)&&['won','lost','abandoned'].includes(a.outcome)&&counters.every(k=>Number.isFinite(a[k])&&a[k]>=0)&&a.solved<=a.total&&a.firstCorrect<=a.firstAnswers&&a.firstAnswers<=a.total&&a.helped<=a.firstAnswers&&a.timeouts<=a.mistakes).slice(-20);
  } catch {return [];}
}
export function saveAdventureAttempt(disk:Disk,attempt:AdventureAttempt):boolean {
  try {disk.setItem(ADVENTURE_ATTEMPTS_KEY,JSON.stringify({version:1,attempts:[...readAdventureAttempts(disk),attempt].slice(-20)}));return true;}catch{return false;}
}
/** First presentations measure learning; retries and timeout totals measure pressure. */
export class AdventureAttemptTracker {
  private firstAnswers=0;private firstCorrect=0;private helped=0;private timeouts=0;
  observe(e:Evidence):void {this.firstAnswers++;if(e.first)this.firstCorrect++;if(e.helped)this.helped++;}
  timeout():void {this.timeouts++;}
  finish(context:Pick<AdventureAttempt,'adventure'|'stage'|'grade'|'difficulty'|'discovery'|'outcome'|'total'|'solved'|'mistakes'|'activeMs'>):AdventureAttempt {
    return {...context,at:new Date().toISOString(),firstAnswers:this.firstAnswers,firstCorrect:this.firstCorrect,helped:this.helped,timeouts:this.timeouts};
  }
}
