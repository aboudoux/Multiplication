import type {Calculation} from './calculations';
export interface Rational {numerator:number;denominator:number}
export type Answer =
 | {kind:'integer';value:number}
 | {kind:'decimal';value:Rational}
 | {kind:'fraction';value:Rational;irreducible?:boolean}
 | {kind:'remainder';quotient:number;remainder:number}
 | {kind:'set';values:Rational[]}
 | {kind:'inequality';operator:'≤'|'≥'|'<'|'>';bound:Rational};
interface ExerciseBase {skillId:string;prompt:string;spoken:string;hint:string;answer:Answer;visual?:{kind:'collection'|'fraction'|'square'|'cube';a:number;b:number}}
export type StudyQuestion = ExerciseBase & (
 | {kind:'arithmetic'} | {kind:'missing'} | {kind:'power'} | {kind:'equation'} | {kind:'problem'}
);
export const gcd=(a:number,b:number):number=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
export function rational(numerator:number,denominator=1):Rational {
 if(!Number.isSafeInteger(numerator)||!Number.isSafeInteger(denominator)||denominator===0)throw new RangeError('Fraction invalide');
 const g=gcd(numerator,denominator);const sign=denominator<0?-1:1;return {numerator:sign*numerator/g,denominator:sign*denominator/g};
}
export const decimal=(coefficient:number,scale:number):Rational=>rational(coefficient,10**scale);
export const sameRational=(a:Rational,b:Rational)=>BigInt(a.numerator)*BigInt(b.denominator)===BigInt(b.numerator)*BigInt(a.denominator);
export function parseRational(raw:string):Rational|null {
 const text=raw.trim().replaceAll('−','-');
 if(text.length>40)return null;
 const fraction=text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
 if(fraction){try{return rational(Number(fraction[1]),Number(fraction[2]));}catch{return null;}}
 const parts=text.match(/^([+-]?)(\d+)(?:[.,](\d{1,9}))?$/);
 if(!parts)return null;
 const coefficient=Number(`${parts[1]}${parts[2]}${parts[3]??''}`);
 try{return decimal(coefficient,parts[3]?.length??0);}catch{return null;}
}
export function answerMatches(answer:Answer,raw:string):boolean {
 if(answer.kind==='remainder') {
  const parts=raw.split(';');if(parts.length!==2)return false;
  const q=parseRational(parts[0]),r=parseRational(parts[1]);return !!q&&!!r&&q.denominator===1&&r.denominator===1&&q.numerator===answer.quotient&&r.numerator===answer.remainder;
 }
 if(answer.kind==='set') {
  const values=raw.split(';').map(parseRational);if(values.some(v=>!v))return false;
  // Treat responses as a set, so order and repeated equivalent representations do not change the solutions.
  const unique=values.filter((v,i)=>!values.slice(0,i).some(p=>sameRational(p!,v!))) as Rational[];
  return unique.length===answer.values.length&&answer.values.every(v=>unique.some(p=>sameRational(p,v)));
 }
 if(answer.kind==='inequality') {
  const match=raw.match(/^\s*x\s*(<=|>=|≤|≥|<|>)\s*(.+)$/);if(!match)return false;
  const op=match[1].replace('<=','≤').replace('>=','≥'),value=parseRational(match[2]);
  return op===answer.operator&&!!value&&sameRational(value,answer.bound);
 }
 const value=parseRational(raw);if(!value)return false;
 if(answer.kind==='integer')return value.denominator===1&&value.numerator===answer.value;
 if(answer.kind==='fraction'&&answer.irreducible) {
  const parts=raw.trim().replaceAll('−','-').match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
  if(!parts||gcd(Number(parts[1]),Number(parts[2]))!==1)return false;
 }
 return sameRational(value,answer.value);
}
export function rationalLabel(value:Rational,asDecimal=false):string {
 if(asDecimal){let d=value.denominator;while(d%2===0)d/=2;while(d%5===0)d/=5;if(d===1)return (value.numerator/value.denominator).toLocaleString('fr-FR',{maximumFractionDigits:9,useGrouping:false});}
 return value.denominator===1?String(value.numerator):`${value.numerator}/${value.denominator}`;
}
export function answerLabel(answer:Answer):string {
 if(answer.kind==='integer')return String(answer.value);
 if(answer.kind==='remainder')return `${answer.quotient} ; reste ${answer.remainder}`;
 if(answer.kind==='set')return answer.values.map(v=>rationalLabel(v)).join(' ; ');
 if(answer.kind==='inequality')return `x ${answer.operator} ${rationalLabel(answer.bound)}`;
 return rationalLabel(answer.value,answer.kind==='decimal');
}
export const resultLabel=(q:Calculation)=>q.exercise?answerLabel(q.exercise.answer):String(q.result);
export function studyCalculation(exercise:StudyQuestion,id:string):Calculation {
 const value=exercise.answer.kind==='integer'?exercise.answer.value:0;
 return {id,operation:'add',a:0,b:0,result:value,exercise};
}
