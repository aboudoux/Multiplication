import {mentalPatternById} from './mental-patterns';
import {grades,type Grade} from './curriculum';
import {rational,decimal,rationalLabel,gcd,type StudyQuestion,type Answer} from './questions';
import {mathTokens,numberTokens,tokensText} from './study-speech';

const cache=new Map<string,StudyQuestion[]>();
const range=(max:number,min=0)=>Array.from({length:max-min+1},(_,i)=>i+min);
const tables=(level:number)=>level===0?[2,5,10]:level===1?[2,3,4,5,10]:range(10,1);
const denominators=(level:number)=>level===0?[2,4,10]:level===1?[2,3,4,5,10]:[2,3,4,5,6,8,10];
/** Explicit facts and strategies; magnitude never substitutes for a difficulty rule. */
export function mentalFacts(id:string,grade:Grade,requestedLevel:number):readonly StudyQuestion[] {
 const p=mentalPatternById(id);if(!p)throw new RangeError('Pattern indisponible');
 const level=Math.min(requestedLevel,p.maxLevel),key=`${id}:${grade}:${level}`,saved=cache.get(key);if(saved)return saved;
 const rows=new Map<string,StudyQuestion>(),index=grades.indexOf(grade);
 const add=(prompt:string,answer:Answer,options:Partial<StudyQuestion>={})=>{
  const voice=options.voiceTokens??mathTokens(prompt);
  rows.set(prompt,{kind:'arithmetic',skillId:p.skillId,patternId:id,patternLevel:level,prompt,answer,hint:p.strategy,spoken:tokensText(voice),voiceTokens:voice,...options} as StudyQuestion);
 };
 const integer=(prompt:string,value:number,options:Partial<StudyQuestion>={})=>add(prompt,{kind:'integer',value},options);
 const fraction=(prompt:string,n:number,d:number,options:Partial<StudyQuestion>={})=>add(prompt,{kind:'fraction',value:rational(n,d)},options);
 if(['small-add','small-subtract','add-one','take-one','add-two','take-two','small-complement'].includes(id)){
  const limit=[5,8,10][level];
  for(const a of range(limit))for(const b of range(limit)){
   const minus=id==='small-subtract'||id.startsWith('take-'),value=minus?a-b:a+b;
   if(value<0||value>limit||id.endsWith('-one')&&b!==1||id.endsWith('-two')&&b!==2)continue;
   if(id==='small-complement'){integer(`${a} + ? = ${a+b}`,b,{kind:'missing'});continue;}
   integer(`${a} ${minus?'−':'+'} ${b}`,value,{visual:{kind:'collection',a,b,subtract:minus},voiceTokens:[...numberTokens(a),minus?'subtract':'add',...numberTokens(b)]});
  }
 }else if(id==='add'||id==='subtract'){
  const limit=level===0?10:level===1?20:100;
  for(const a of range(limit))for(const b of range(limit)){
   const value=id==='add'?a+b:a-b;if(value<0||value>limit)continue;
   if(level===2&&b>9&&b%10!==0)continue;
   integer(`${a} ${id==='add'?'+':'−'} ${b}`,value);
  }
 }else if(id==='double'||id==='half'){
  const values=level===0?range(10,1):level===1?range(index===1?5:10,1).map(n=>n*10):index===1?[15,20,25,30,40,50]:[100,150,200,250,300,500];
  for(const a of values)integer(`${id==='double'?'Le double':'La moitié'} de ${id==='double'?a:a*2}`,id==='double'?a*2:a,{voiceTokens:[id,...numberTokens(id==='double'?a:a*2)],...(id==='half'&&a<=5?{visual:{kind:'share' as const,a:a*2,b:2}}:{})});
 }else if(['large-add','large-subtract','tens-add','tens-subtract'].includes(id)){
  const subtract=id.includes('subtract'),scale=id.startsWith('tens-')||level===0?10:100;
  for(const a of range(10,1))for(const b of range(10,1)){
   const left=a*scale,right=b*scale,value=subtract?left-right:left+right;if(value<0||value>scale*10)continue;
   integer(`${left} ${subtract?'−':'+'} ${right}`,value);
  }
  if(level===2&&!id.startsWith('tens-'))for(const h of range(8,1))for(const t of range(9,1))for(const b of range(9,1)){
   const a=h*100+t*10,value=subtract?a-b*100:a+b*100;if(value<0||value>1000)continue;integer(`${a} ${subtract?'−':'+'} ${b*100}`,value);
  }
 }else if(id==='tables'||id==='divide'){
  for(const a of tables(level))for(const b of range(10))integer(id==='tables'?`${a} × ${b}`:`${a*b} ÷ ${a}`,id==='tables'?a*b:b);
 }else if(['times-ten','times-hundred','times-thousand'].includes(id)){
  const factor=id==='times-ten'?10:id==='times-hundred'?100:1000;
  for(const a of range(level===0?10:level===1?30:99,1))integer(`${a} × ${factor}`,a*factor);
 }else if(id==='large-multiply'){
  if(level===0)for(const a of tables(0))for(const b of range(10,1))for(const scale of [10,100])integer(`${a*scale} × ${b}`,a*scale*b);
  else if(level===1)for(const a of [15,20,30,50,150,200,250,300,500])for(const b of [2,4,5,10])integer(`${a} × ${b}`,a*b);
  else for(const a of [25,125])for(const b of (a===25?[2,4,8,10]:[2,4,8]))integer(`${a} × ${b}`,a*b);
 }else if(id==='missing'){
  const totals=level===0?[10]:level===1?[10,20]:[10,20,100];
  for(const total of totals)for(const a of range(total)){
   if(total===100&&a%10!==0)continue;integer(`${a} + ? = ${total}`,total-a,{kind:'missing'});integer(`${total} − ? = ${a}`,total-a,{kind:'missing'});
  }
  if(index>=2&&level>0)for(const a of tables(level-1))for(const x of range(10))integer(`? × ${a} = ${a*x}`,x,{kind:'missing'});
 }else if(id==='fraction-picture'){
  for(const d of denominators(level))for(const a of range(d,1))add('Quelle fraction est colorée ? '+`${a}/${d}`,{kind:'fraction',value:rational(a,d)},{prompt:'Quelle fraction est colorée ?',visual:{kind:'fraction',a,b:d},voiceTokens:['picture']});
 }else if(id==='fraction-compare'){
  const offer=(first:string,second:string,n:number,d:number)=>fraction(`La plus grande : ${first} ou ${second} ?`,n,d,{choices:[first,second],voiceTokens:['compare',...mathTokens(first),'or',...mathTokens(second)]});
  for(const d of denominators(level))for(const a of range(d,1))for(const b of range(d,1))if(a!==b)offer(`${a}/${d}`,`${b}/${d}`,Math.max(a,b),d);
  if(level>0)for(const a of denominators(level))for(const b of denominators(level))if(a!==b)offer(`1/${a}`,`1/${b}`,1,Math.min(a,b));
 }else if(id==='fraction-add'){
  for(const d of denominators(level))for(const a of range(d,1))for(const b of range(d,1)){
   if(index>=4||a+b<=d)fraction(`${a}/${d} + ${b}/${d}`,a+b,d);
   if(a>=b)fraction(`${a}/${d} − ${b}/${d}`,a-b,d);
  }
 }else if(id==='fraction-of'){
  const values=level===0?[[1,2],[1,4],[1,10]]:level===1?[[1,3],[2,3],[3,4]]:[[2,5],[3,5],[4,5]];
  for(const [a,d] of values)for(const q of range(10,1))integer(`${a}/${d} de ${d*q}`,a*q,{voiceTokens:[...mathTokens(`${a}/${d}`),'of',...numberTokens(d*q)]});
 }else if(id==='fraction-multiply'){
  if(level===0)for(const [a,b] of [[2,2],[2,3],[3,2],[2,4],[4,2]])fraction(`1/${a} × 1/${b}`,1,a*b);
  else if(level===1)for(const d of denominators(2))for(const a of range(d,1))integer(`${a}/${d} ÷ 1/${d}`,a);
  else for(const a of range(3,1))for(const b of range(5,2))for(const c of range(5,2))fraction(`${a}/${b} × ${b}/${c}`,a,c);
 }else if(id==='fraction-reduce'){
  for(const d of denominators(2))for(const a of range(Math.min(d-1,3),1))if(gcd(a,d)===1)for(const factor of (level===0?[2,10]:level===1?[3,5]:[4]))fraction(`Simplifier ${a*factor}/${d*factor}`,a,d,{answer:{kind:'fraction',value:rational(a,d),irreducible:true},voiceTokens:['reduce',...mathTokens(`${a*factor}/${d*factor}`)]});
 }else if(id==='decimal-add'){
  const scale=level===2?100:10,step=level===2?25:level===0?5:1;
  for(let a=step;a<=100*(scale/10);a+=step)for(let b=step;b<=50*(scale/10);b+=step){
   for(const minus of [false,true]){const value=a+(minus?-b:b);if(value<0||value>20*scale)continue;add(`${rationalLabel(rational(a,scale),true)} ${minus?'−':'+'} ${rationalLabel(rational(b,scale),true)}`,{kind:'decimal',value:rational(value,scale)});}
  }
 }else if(id==='decimal-scale'){
  for(const a of range(20,1))for(const factor of (level===0?[10]:level===1?[10,100]:[10,100,1000]))for(const divide of [false,true]){
   const value=rational(a,level===0?10:4);add(`${rationalLabel(value,true)} ${divide?'÷':'×'} ${factor}`,{kind:'decimal',value:divide?rational(value.numerator,value.denominator*factor):rational(value.numerator*factor,value.denominator)});
  }
 }else if(id==='decimal-divide'||id==='decimal-multiply'){
  const scale=level===0?2:level===1?4:10;
  for(const a of range(20,1))for(const b of (level===0?[2,5]:level===1?[2,4,10]:tables(2))){
   const value=rational(a,scale),dividend=rational(a*b,scale);
   add(id==='decimal-divide'?`${rationalLabel(dividend,true)} ÷ ${b}`:`${rationalLabel(value,true)} × ${b}`,{kind:'decimal',value:id==='decimal-divide'?value:dividend});
  }
 }else if(id==='signed-add'){
  const limit=level===2?20:10;
  for(const a of range(limit,-limit))for(const b of range(limit,-limit))for(const minus of (level===0?[false]:[false,true])){
   const value=a+(minus?-b:b);if(Math.abs(value)>20)continue;integer(`${a} ${minus?'−':'+'} ${b<0?`(${b})`:b}`,value);
  }
 }else if(id==='signed-multiply'){
  for(const a of tables(level))for(const b of range(10))for(const signA of [-1,1])for(const signB of [-1,1]){
   integer(`(${signA*a}) × (${signB*b})`,signA*a*signB*b);
   if(level>0)integer(`(${signA*a*signB*b}) ÷ (${signA*a})`,signB*b);
  }
 }else if(id==='priority'){
  for(const a of range(10,1))for(const b of range(level===0?5:10,1))for(const c of range(level===0?5:10,1)){
   if(level===2){if(a+b>10)continue;integer(`(${a} + ${b}) × ${c}`,(a+b)*c);}
   else integer(`${a} + ${b} × ${c}`,a+b*c);
  }
 }else if(id==='square'||id==='root'||id==='cube'){
  const bases=id==='cube'?[0,1,2,3,10]:range(level===0?10:12);
  for(const a of bases)integer(id==='root'?`√${a*a}`:`${a}${id==='cube'?'³':'²'}`,id==='root'?a:a**(id==='cube'?3:2),{kind:'power',...(id!=='root'&&a>0&&a<=3?{visual:{kind:id==='cube'?'cube' as const:'square' as const,a,b:a}}:{})});
 }else if(id==='equation-one'){
  for(const x of range(10,level===2?-10:0))for(const a of (level===0?[2,5,10]:tables(2))){
   integer(`${a}x = ${a*x}`,x,{kind:'equation'});integer(`x + ${a} = ${x+a}`,x,{kind:'equation'});
  }
 }else if(id==='substitution'||id==='function'){
  for(const x of range(5,level===2?-5:0))for(const a of (level===0?[2]:range(5,1)))for(const b of (level===0?[1]:range(5,level===2?-5:0))){
   const expression=`${a}x ${b<0?'−':'+'} ${Math.abs(b)}`;
   integer(id==='function'?`f(${x}), avec f(x) = ${expression}`:`${expression}, pour x = ${x}`,a*x+b,{kind:'problem',voiceTokens:['function',...numberTokens(x),...mathTokens(expression)]});
  }
 }else if(id==='percent'||id==='evolution'){
  for(const rate of (level===0?[10,50]:level===1?[20,25]:[10,20,25,50]))for(const qty of range(10,1).map(n=>n*20)){
   if(id==='percent')integer(`${rate} % de ${qty}`,qty*rate/100,{voiceTokens:[...numberTokens(rate),'percent','of',...numberTokens(qty)]});
   else for(const sign of [-1,1])integer(`${qty} € ${sign===1?'+':'−'} ${rate} % : prix final ?`,qty*(100+sign*rate)/100,{kind:'problem',voiceTokens:[...numberTokens(qty),'euros','change',...numberTokens(sign*rate),'percent']});
  }
 }else if(id==='power-ten'){
  for(const a of range(9,1))for(const exponent of (level===0?[0,1,2]:level===1?[3,4]:[-1,-2,-3])){
   const prompt=`${a} × 10^(${exponent})`;
   if(exponent>=0)integer(prompt,a*10**exponent,{kind:'power'});else add(prompt,{kind:'decimal',value:decimal(a,-exponent)},{kind:'power'});
  }
 }
 const facts=[...rows.values()];if(!facts.length)throw new RangeError('Aucun fait mental disponible');
 if(cache.size>=32)cache.delete(cache.keys().next().value!);cache.set(key,facts);return facts;
}
export const mentalCandidate=(id:string,n:number,grade:Grade,level:number)=>mentalFacts(id,grade,level)[n]??null;
