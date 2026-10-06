import {grades,skillById,type Grade} from './curriculum';
import {shuffle,type Calculation} from './calculations';
import {studyCalculation,answerLabel,rational,decimal,rationalLabel,type StudyQuestion,type Answer} from './questions';
import {mathTokens,tokensText,numberTokens} from './study-speech';
export function candidate(id:string,n:number,grade:Grade,level:number):StudyQuestion|null {
 const skill=skillById(id);if(!skill)throw new RangeError('Compétence inconnue');
 const index=grades.indexOf(grade);
 let prompt='',answer:Answer={kind:'integer',value:0},kind:StudyQuestion['kind']='arithmetic',visual:StudyQuestion['visual'],voice:string[]|undefined;
 const whole=(value:number)=>{answer={kind:'integer',value};};
 if(['small-add','small-subtract','add','subtract','tables'].includes(id)) {
  const small=id.startsWith('small-');const limit=small?(level===0?5:10):id==='tables'?100:level===0?20:100;
  const a=id==='tables'?n%10+1:n%(limit+1),b=id==='tables'?Math.floor(n/10)%10+1:Math.floor(n/(limit+1))%(limit+1),operation=id==='tables'?'multiply':id.includes('subtract')?'subtract':'add';
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
 } else if(id==='fraction-picture') {
  const denominators=index<3?[2,3,4,5,6,8,10]:[2,3,4,5,6,8,10,12],b=denominators[n%denominators.length],a=Math.floor(n/denominators.length)%b+1;
  prompt='Quelle fraction est colorée ?';answer={kind:'fraction',value:rational(a,b)};visual={kind:'fraction',a,b};voice=['picture'];
 } else if(id==='fraction-compare') {
  const pair=(index<3?[[2,4],[3,6],[5,10],[2,8],[4,8]]:[[2,4],[3,6],[4,8],[5,10],[6,12]])[n%5],d=pair[0],e=pair[1],a=Math.floor(n/5)%d+1;
  const first=n%2?`${a}/${d}`:`1/${e}`,second=n%2?`1/${e}`:`${a}/${d}`;
  prompt=`Quelle fraction est la plus grande : ${first} ou ${second} ?`;answer={kind:'fraction',value:rational(a,d)};voice=['compare',...mathTokens(first),'or',...mathTokens(second)];
 } else if(id==='fraction-add') {
  const d=n%9+2,a=Math.floor(n/9)%d+1,b=Math.floor(n/90)%d+1;
  const e=level>0&&index>=7?(level===1?d*2:d+1):d,minus=n%2===1;
  if(index<4 && !minus && a+b>d)return null;
  if(minus&&a*e<b*d)return null;
  prompt=`${a}/${d} ${minus?'−':'+'} ${b}/${e}`;answer={kind:'fraction',value:rational(a*e+(minus?-1:1)*b*d,d*e)};
 } else if(id==='fraction-of') {
  const d=n%9+2,a=Math.floor(n/9)%d+1,qty=(Math.floor(n/90)%20+1)*d;
  prompt=`${a}/${d} de ${qty}`;whole(a*qty/d);voice=[...mathTokens(`${a}/${d}`),'of',...numberTokens(qty)];
 } else if(id==='fraction-multiply') {
  const a=n%7+1,b=Math.floor(n/7)%9+2,c=Math.floor(n/63)%7+1,d=Math.floor(n/441)%9+2,divide=n%2===1;
  prompt=`${a}/${b} ${divide?'÷':'×'} ${c}/${d}`;answer={kind:'fraction',value:divide?rational(a*d,b*c):rational(a*c,b*d)};
 } else if(id==='fraction-reduce') {
  const a=n%9+1,b=Math.floor(n/9)%11+2,factor=Math.floor(n/99)%8+2;
  prompt=`Simplifier ${a*factor}/${b*factor}`;answer={kind:'fraction',value:rational(a,b),irreducible:true};voice=['reduce',...mathTokens(`${a*factor}/${b*factor}`)];
 } else if(id==='remainder') {
  const divisor=n%8+2,quotient=Math.floor(n/8)%20+1,remainder=Math.floor(n/160)%divisor;
  prompt=`${divisor*quotient+remainder} ÷ ${divisor} : quotient et reste`;answer={kind:'remainder',quotient,remainder};
 } else if(id==='decimal-add') {
  const scale=level===0?1:level===2&&index>=5?3:2,a=n%300+1,b=Math.floor(n/300)%30+1,minus=n%2===1;
  if(minus&&a<b)return null;
  prompt=`${rationalLabel(decimal(a,scale),true)} ${minus?'−':'+'} ${rationalLabel(decimal(b,scale),true)}`;answer={kind:'decimal',value:decimal(a+(minus?-b:b),scale)};
 } else if(id==='decimal-scale') {
  const power=n%3+1,scale=Math.min(level+1,3-power),a=Math.floor(n/3)%400+1,factor=10**power,divide=n%2===1;
  prompt=`${rationalLabel(decimal(a,scale),true)} ${divide?'÷':'×'} ${factor}`;answer={kind:'decimal',value:divide?rational(a,10**scale*factor):rational(a*factor,10**scale)};
 } else if(id==='decimal-divide') {
  const divisor=n%8+2,coefficient=Math.floor(n/8)%300+1,scale=level===0?1:2;
  prompt=`${rationalLabel(decimal(coefficient*divisor,scale),true)} ÷ ${divisor}`;answer={kind:'decimal',value:decimal(coefficient,scale)};
 } else if(id==='decimal-multiply') {
  const a=n%99+1,b=Math.floor(n/99)%9+2,scaleA=level===2?2:1,scaleB=level>0?1:0;
  prompt=`${rationalLabel(decimal(a,scaleA),true)} × ${rationalLabel(decimal(b,scaleB),true)}`;answer={kind:'decimal',value:decimal(a*b,scaleA+scaleB)};
 } else if(id==='signed-add') {
  const limit=level===0?10:20,a=n%(limit*2+1)-limit,b=Math.floor(n/(limit*2+1))%(limit*2+1)-limit,minus=level>0&&n%2===1;
  prompt=`${a} ${minus?'−':'+'} ${b<0?`(${b})`:b}`;whole(a+(minus?-b:b));
 } else if(id==='signed-multiply') {
  const a=n%21-10,b=Math.floor(n/21)%21-10,divide=n%2===1;if(divide&&b===0)return null;
  prompt=divide?`(${a*b}) ÷ (${b})`:`(${a}) × (${b})`;whole(divide?a:a*b);
 } else if(id==='priority') {
  const a=n%15+1,b=Math.floor(n/15)%9+1,c=Math.floor(n/135)%9+1;
  prompt=level===0?`${a} + ${b} × ${c}`:level===1?`(${a} + ${b}) × ${c}`:`${a} − ${b} × ${c}`;whole(level===0?a+b*c:level===1?(a+b)*c:a-b*c);
 } else if(id==='square'||id==='cube') {
  const bases=id==='cube'?[0,1,2,3,4,5,10]:level===0?Array.from({length:13},(_,i)=>i):[0,1,2,3,4,5,6,7,8,9,10,11,12,15,20,25];
  const base=bases[n%bases.length];kind='power';
  if(id==='square'&&level===2&&index>=8&&n%2===1){prompt=n%4===1?`(-${base})²`:`−${base}²`;whole(n%4===1?base*base:-base*base);}
  else {prompt=`${base}${id==='square'?'²':'³'}`;whole(base**(id==='square'?2:3));if(base>0&&base<=4)visual={kind:id==='square'?'square':'cube',a:base,b:base};}
 } else if(id==='root') {
  const base=n%13;prompt=`√${base*base}`;whole(base);kind='power';
 } else if(id==='power-ten') {
  const coefficient=n%9+1,exponent=level===0?Math.floor(n/9)%6+1:Math.floor(n/9)%7-3;
  prompt=`${coefficient} × 10^(${exponent})`;kind='power';answer=exponent>=0?{kind:'integer',value:coefficient*10**exponent}:{kind:'decimal',value:rational(coefficient,10**-exponent)};
 } else if(id==='negative-power') {
  const base=[2,3,4,5,10][n%5],exponent=Math.floor(n/5)%4+1;
  prompt=`${base}^(−${exponent})`;kind='power';answer={kind:'fraction',value:rational(1,base**exponent)};
 } else if(id==='missing') {
  const x=n%11,a=Math.floor(n/11)%11,minus=n%2===1;
  if(minus){prompt=`${x+a} − ? = ${a}`;}else{prompt=`${a} + ? = ${a+x}`;}
  whole(x);kind='missing';
 } else if(id==='mystery') {
  const x=n%13,a=Math.floor(n/13)%8+2,b=Math.floor(n/104)%9+1;
  prompt=`${a} × (? + ${b}) = ${a*(x+b)}`;whole(x);kind='missing';
 } else if(id==='substitution') {
  const x=n%21-10,a=Math.floor(n/21)%8+2,b=Math.floor(n/168)%10;
  prompt=`${a}x + ${b}, pour x = ${x}`;whole(a*x+b);voice=['function',...numberTokens(x),...mathTokens(`${a}x + ${b}`)];
 } else if(id==='equation-one') {
  const x=level===0?n%13: n%25-12,a=Math.floor(n/25)%9+1;
  prompt=n%2===0?`x + ${a} = ${x+a}`:`${a}x = ${a*x}`;whole(x);kind='equation';
 } else if(id==='equation-two'||id==='equation-both') {
  const x=n%25-12,a=Math.floor(n/25)%8+2,b=Math.floor(n/200)%11-5,c=id==='equation-both'?a-1-Math.floor(n/25)%3:0;
  prompt=id==='equation-both'?`${a}x + (${b}) = ${c}x + (${(a-c)*x+b})`:`${a}x + (${b}) = ${a*x+b}`;
  whole(x);kind='equation';
 } else if(id==='equation-set') {
  const a=n%10+1,b=Math.floor(n/10)%10+1;kind='equation';
  if(level===0){prompt=`x² = ${a*a}`;answer={kind:'set',values:[rational(-a),rational(a)]};}
  else {if(a===b)return null;prompt=`(x − ${a}) × (x + ${b}) = 0`;answer={kind:'set',values:[rational(a),rational(-b)]};}
  voice=['all',...mathTokens(prompt)];
 } else return null;
 voice??=mathTokens(prompt);
 return {kind,skillId:id,prompt,spoken:tokensText(voice),voiceTokens:voice,hint:skill.strategy,answer,visual} as StudyQuestion;
}
/** Bounded candidates: never enumerate all pairs in the school's numeration range. */
export function generateStudyQuestions(id:string,grade:Grade,level=0,count=10,random=Math.random):Calculation[] {
 if(!skillById(id)||!grades.includes(grade)||!Number.isInteger(count)||count<1||count>100||![0,1,2].includes(level))throw new RangeError('Séance invalide');
 const pool=new Map<string,Calculation>();
 const candidates=id==='tables'?100:id.startsWith('small-')?121:id==='add'||id==='subtract'?10201:2048;
 for(let n=0;n<candidates;n++) {
  const q=candidate(id,n,grade,level);if(!q)continue;
  const key=`${id}:${q.prompt}:${answerLabel(q.answer)}:${q.visual?JSON.stringify(q.visual):''}`;
  if(!pool.has(key))pool.set(key,studyCalculation(q,key));
 }
 if(!pool.size)throw new RangeError('Aucun exercice disponible pour cette compétence');
 return shuffle([...pool.values()],random).slice(0,Math.min(count,pool.size));
}
