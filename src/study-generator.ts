import {grades,skillById,type Grade} from './curriculum';
import {shuffle,type Calculation} from './calculations';
import {studyCalculation,answerLabel,type StudyQuestion,type Answer} from './questions';
import {mathTokens,tokensText,numberTokens} from './study-speech';
export function candidate(id:string,n:number,grade:Grade,level:number):StudyQuestion|null {
 const skill=skillById(id);if(!skill)throw new RangeError('Compétence inconnue');
 const index=grades.indexOf(grade);
 let prompt='',answer:Answer={kind:'integer',value:0},kind:StudyQuestion['kind']='arithmetic',visual:StudyQuestion['visual'],voice:string[]|undefined;
 const whole=(value:number)=>{answer={kind:'integer',value};};
 if(['small-add','small-subtract','add','subtract','tables'].includes(id)) {
  const small=id.startsWith('small-');const limit=small?(level===0?5:10):id==='tables'?100:level===0?20:100;
  const a=n%(limit+1),b=Math.floor(n/(limit+1))%(limit+1),operation=id==='tables'?'multiply':id.includes('subtract')?'subtract':'add';
  if(operation==='multiply'&&(a<1||b<1||a>10||b>10))return null;
  const result=operation==='multiply'?a*b:operation==='subtract'?a-b:a+b;
  if(result<0||result>limit || (!small&&id==='add'&&level===0&&a%10+b%10>=10) || (!small&&id==='subtract'&&level===0&&a%10<b%10))return null;
  prompt=`${a} ${operation==='multiply'?'×':operation==='subtract'?'−':'+'} ${b}`;whole(result);
  if(small){visual={kind:'collection',a,b,subtract:operation==='subtract'};voice=[...numberTokens(a),operation,...numberTokens(b)];}
 } else if(id==='double'||id==='half') {
  const a=n%(level===0?10:20)+1;prompt=id==='double'?`Le double de ${a}`:`La moitié de ${a*2}`;whole(id==='double'?a*2:a);voice=[id,...numberTokens(id==='double'?a:a*2)];
  if(id==='half'&&a<=5)visual={kind:'share',a:a*2,b:2};
 } else if(id==='large-add'||id==='large-subtract') {
  const scale=level>0&&index>=3?100:10,a=(n%80+1)*scale,b=(Math.floor(n/80)%10+1)*scale;
  if(id==='large-add'){if(a+b>(index>=3?10000:1000))return null;prompt=`${a} + ${b}`;whole(a+b);}
  else {if(a<b)return null;prompt=`${a} − ${b}`;whole(a-b);}
 } else if(['times-ten','times-hundred','times-thousand'].includes(id)) {
  const factor=id==='times-ten'?10:id==='times-hundred'?100:1000,a=n%99+1;prompt=`${a} × ${factor}`;whole(a*factor);
 } else if(id==='large-multiply') {
  const bases=level===0?[10,20,30,50,100,200,300]:[15,25,40,75,125,150,250,350,500];
  const a=bases[n%bases.length],b=Math.floor(n/bases.length)%9+2;prompt=`${a} × ${b}`;whole(a*b);
 } else if(id==='divide') {
  const divisor=n%9+2,quotient=(Math.floor(n/9)%(level===0?10:20)+1)*(level===2?10:1);prompt=`${divisor*quotient} ÷ ${divisor}`;whole(quotient);
 } else return null;
 voice??=mathTokens(prompt);
 return {kind,skillId:id,prompt,spoken:tokensText(voice),voiceTokens:voice,hint:skill.strategy,answer,visual} as StudyQuestion;
}
/** Bounded candidates: never enumerate all pairs in the school's numeration range. */
export function generateStudyQuestions(id:string,grade:Grade,level=0,count=10,random=Math.random):Calculation[] {
 if(!skillById(id)||!grades.includes(grade)||!Number.isInteger(count)||count<1||count>100||![0,1,2].includes(level))throw new RangeError('Séance invalide');
 const pool=new Map<string,Calculation>();
 for(let n=0;n<12000;n++) {
  const q=candidate(id,n,grade,level);if(!q)continue;
  const key=`${id}:${q.prompt}:${answerLabel(q.answer)}:${q.visual?JSON.stringify(q.visual):''}`;
  if(!pool.has(key))pool.set(key,studyCalculation(q,key));
 }
 if(!pool.size)throw new RangeError('Aucun exercice disponible pour cette compétence');
 return shuffle([...pool.values()],random).slice(0,Math.min(count,pool.size));
}
