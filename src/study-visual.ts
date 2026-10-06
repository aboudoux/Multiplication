import type {StudyQuestion} from './questions';
export function studyVisual(q:StudyQuestion):string {
 const v=q.visual;if(!v)return '';
 const dot=(removed=false)=>`<span class="study-object ${removed?'removed':''}" aria-hidden="true">●</span>`;
 if(v.kind==='collection')return `<div class="study-visual" role="img" aria-label="${v.a} objets ${v.subtract?`dont ${v.b} retirés`:`et ${v.b} objets ajoutés`}">${v.subtract?Array.from({length:v.a},(_,i)=>dot(i>=v.a-v.b)).join(''):`<span>${dot().repeat(v.a)}</span><span aria-hidden="true">+</span><span>${dot().repeat(v.b)}</span>`}</div>`;
 if(v.kind==='share')return `<div class="study-visual" role="img" aria-label="${v.a} objets répartis en ${v.b} groupes égaux">${Array.from({length:v.b},()=>`<span class="study-basket">${dot().repeat(v.a/v.b)}</span>`).join('')}</div>`;
 if(v.kind==='fraction')return `<div class="study-fraction" role="img" aria-label="${v.a} parts colorées sur ${v.b} parts égales">${Array.from({length:v.b},(_,i)=>`<span class="${i<v.a?'colored':''}"></span>`).join('')}</div>`;
 if(v.kind==='square')return `<div class="study-square" role="img" aria-label="Carré de ${v.a} rangées de ${v.a} cases" style="grid-template-columns:repeat(${v.a},1fr)">${'<i></i>'.repeat(v.a*v.a)}</div>`;
 return `<div class="study-visual" role="img" aria-label="${v.a} couches de ${v.a} fois ${v.a} petits cubes">${Array.from({length:v.a},()=>`<span class="study-basket">${dot().repeat(v.a*v.a)}</span>`).join('')}</div>`;
}
