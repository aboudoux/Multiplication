import {grades,skillById,type Grade,type Skill,type Evidence} from './curriculum';

export interface MentalPattern extends Skill { skillId:string; maxLevel:number }
const pattern=(id:string,skillId=id,options:Partial<MentalPattern>={}):MentalPattern=>({...skillById(skillId)!,id,skillId,maxLevel:2,...options});
const retained=['small-add','small-subtract','add','subtract','double','half','missing','tables','large-add','large-subtract','times-ten','divide','large-multiply','times-hundred','times-thousand','fraction-picture','fraction-compare','fraction-add','decimal-add','decimal-scale','decimal-divide','fraction-of','decimal-multiply','signed-add','priority','square','cube','substitution','equation-one','signed-multiply','fraction-multiply','root','power-ten','fraction-reduce','percent','evolution','function'];
export const mentalPatterns:readonly MentalPattern[]=[
 ...retained.map(id=>pattern(id,id,id==='cube'?{maxLevel:0}:id==='square'||id==='root'?{maxLevel:1}:{})),
 pattern('add-one','small-add',{title:'Ajouter 1',example:'4 + 1'}),
 pattern('take-one','small-subtract',{title:'Retirer 1',example:'5 − 1'}),
 pattern('add-two','small-add',{title:'Ajouter 2',example:'3 + 2'}),
 pattern('take-two','small-subtract',{title:'Retirer 2',example:'5 − 2'}),
 pattern('small-complement','small-add',{title:'Petits compléments',example:'3 + ? = 5'}),
 pattern('tens-add','large-add',{grade:'CP',maxLevel:0,title:'Ajouter des dizaines',example:'30 + 20',prerequisites:['add']}),
 pattern('tens-subtract','large-subtract',{grade:'CP',maxLevel:0,title:'Retirer des dizaines',example:'50 − 20',prerequisites:['subtract']}),
];
export const mentalPatternById=(id:string)=>mentalPatterns.find(p=>p.id===id);
export const mentalCurriculum=(grade:Grade)=>mentalPatterns.filter(p=>grades.indexOf(p.grade)<=grades.indexOf(grade));
export const mentalPaths:Record<Grade,string[]>={
 GS:['small-add','small-subtract','add-one','take-one','add-two','take-two','small-complement'],
 CP:['add','subtract','missing','double','half','tens-add','tens-subtract'],
 CE1:['tables','large-add','large-subtract','times-ten','double','fraction-picture','missing'],
 CE2:['tables','divide','large-multiply','times-hundred','large-add','fraction-picture','fraction-add'],
 CM1:['divide','large-multiply','times-thousand','decimal-add','missing','fraction-compare','fraction-add'],
 CM2:['decimal-add','decimal-scale','decimal-divide','fraction-of','large-multiply','fraction-add','divide'],
 '6e':['decimal-multiply','decimal-scale','fraction-of','percent','decimal-divide','fraction-add','large-multiply'],
 '5e':['signed-add','priority','square','cube','equation-one','fraction-add','percent'],
 '4e':['signed-multiply','fraction-multiply','root','power-ten','equation-one','signed-add','priority'],
 '3e':['fraction-reduce','power-ten','evolution','function','percent','root','equation-one'],
 '2de':['signed-multiply','fraction-multiply','power-ten','square','decimal-multiply','evolution','function'],
};
export interface MentalProgress {samples:(Evidence&{level?:number})[];series:{score:number;medianMs:number|null;level?:number}[];comfortable:boolean;level:number}
export type MentalMasteries=Record<string,MentalProgress>;
export interface MentalRegistry {version:1;skills:MentalMasteries}
export const emptyMental=():MentalRegistry=>({version:1,skills:{}});
export function recordMentalEvidence(data:MentalMasteries,id:string,evidence:Evidence,observedLevel?:number):void {
 const pattern=mentalPatternById(id);if(!pattern)return;
 const m=data[id]??={samples:[],series:[],comfortable:false,level:0};m.samples.push({...evidence,level:observedLevel??m.level});
 if(m.samples.length<10)return;
 const block=m.samples.splice(0,10),times=block.filter(e=>e.first&&!e.helped).map(e=>e.timeMs).sort((a,b)=>a-b);
 const score=times.length,mid=Math.floor(times.length/2),medianMs=score?(score%2?times[mid]:(times[mid-1]+times[mid])/2):null;
 // A running mission keeps its generated level even after a completed block promotes the player.
 const level=block.every(e=>e.level===block[0].level)?block[0].level:undefined;
 m.series.push({score,medianMs,level});m.series=m.series.slice(-12);
 if(score<6&&level===m.level){m.level=Math.max(0,m.level-1);m.comfortable=false;}
 const last=m.series.slice(-2);
 if(last.length===2&&last.every(b=>b.level===m.level&&b.score>=8&&b.medianMs!==null&&b.medianMs<=15000)){m.comfortable=true;m.level=Math.min(pattern.maxLevel,m.level+1);}
}
export function validateMental(value:unknown):MentalRegistry {
 const result=emptyMental();if(!value||typeof value!=='object')return result;
 const registry=value as MentalRegistry;if(registry.version!==1||!registry.skills||typeof registry.skills!=='object')return result;
 for(const [id,m] of Object.entries(registry.skills)){
  const p=mentalPatternById(id);if(!p||!m||![0,1,2].includes(m.level)||typeof m.comfortable!=='boolean'||!Array.isArray(m.samples)||!Array.isArray(m.series))continue;
  result.skills[id]={level:Math.min(p.maxLevel,m.level),comfortable:m.comfortable,samples:m.samples.filter(e=>e&&typeof e.first==='boolean'&&typeof e.helped==='boolean'&&Number.isFinite(e.timeMs)&&e.timeMs>=0).slice(0,9),series:m.series.filter(b=>b&&Number.isInteger(b.score)&&b.score>=0&&b.score<=10&&(b.medianMs===null||Number.isFinite(b.medianMs)&&b.medianMs>=0)).slice(-12)};
 }return result;
}
export const mentalLabel=(m?:MentalProgress)=>m?.comfortable?'À l’aise':m&&(m.samples.length||m.series.length)?'En entraînement':'À découvrir';
