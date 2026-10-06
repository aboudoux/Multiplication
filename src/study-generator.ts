import {grades,skillById,type Grade} from './curriculum';
import {shuffle,type Calculation} from './calculations';
import {studyCalculation,answerLabel,type StudyQuestion} from './questions';
export function generateStudyQuestions(id:string,grade:Grade,level=0,count=10,random=Math.random):Calculation[] {
 const skill=skillById(id);if(!skill)throw new RangeError('Compétence inconnue');
 const index=grades.indexOf(grade),limit=id.startsWith('small-')?(level===0?5:10):index<2?(level===0?20:100):100;
 const pool:Calculation[]=[];
 for(let a=0;a<=limit;a++)for(let b=0;b<=limit;b++) {
  const operation=id==='tables'?'multiply':id.includes('subtract')?'subtract':'add';
  if(operation==='multiply'&&(a<1||b<1||a>10||b>10))continue;
  const result=operation==='multiply'?a*b:operation==='subtract'?a-b:a+b;
  if(result<0||result>limit)continue;
  const prompt=`${a} ${operation==='multiply'?'×':operation==='subtract'?'−':'+'} ${b}`;
  const exercise:StudyQuestion={kind:'arithmetic',skillId:id,prompt,spoken:`${a} ${operation==='multiply'?'fois':operation==='subtract'?'moins':'plus'} ${b}`,hint:skill.strategy,answer:{kind:'integer',value:result}};
  pool.push({...studyCalculation(exercise,`${id}:${prompt}:${answerLabel(exercise.answer)}`),a,b,operation,result});
 }
 return shuffle(pool,random).slice(0,Math.max(1,Math.min(count,pool.length)));
}
