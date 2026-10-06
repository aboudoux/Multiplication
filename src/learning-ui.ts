import {grades,curriculum,masteryLabel,type Grade,type Skill} from './curriculum';
import type {Profiles} from './profiles';
import {escapeHtml} from './profile-ui';
import {preset,type TrainingSettings} from './training';
import {recommendedSkill} from './adaptive-adventure';
export function basicSettings(grade:Grade,id?:string):TrainingSettings {
  const settings=preset();const index=grades.indexOf(grade);
  settings.length=index===0?5:index<4?10:15;
  settings.add.max=settings.subtract.max=index===0?5:index===1?20:100;
  settings.zero=true;
  settings.operations=id==='tables'?['multiply']:id?.includes('subtract')?['subtract']:id?['add']:index<2?['add']:['add','subtract','multiply'];
  settings.tables=Array.from({length:index<3?5:10},(_,i)=>i+1);
  return settings;
}
export class LearningUI {
  readonly root=document.createElement('section');
  private grade:Grade;
  private level:number|null=null;
  constructor(private profiles:Profiles,private launch:(skill:Skill,grade:Grade,level:number|null)=>void) {
    this.grade=profiles.active.grade;this.root.className='learning-panel';this.root.id='learning-panel';
    this.root.addEventListener('change',e=>{const input=e.target as HTMLSelectElement;if(input.id==='learning-grade'){this.grade=input.value as Grade;this.render();}if(input.id==='learning-level')this.level=input.value==='auto'?null:Number(input.value);});
    this.root.addEventListener('click',e=>{const button=(e.target as Element).closest<HTMLButtonElement>('[data-skill],[data-recommended]');if(!button)return;const s=curriculum(this.grade).find(s=>s.id===(button.dataset.skill??button.dataset.recommended));if(s)launch(s,this.grade,this.level);});
    this.render();
  }
  open():void {this.grade=this.profiles.active.grade;this.level=null;this.render();}
  render():void {
    this.root.hidden=!this.profiles.active.adaptive;
    if(this.root.hidden){this.root.replaceChildren();return;}
    const list=curriculum(this.grade);
    const recommended=list.find(s=>s.id===recommendedSkill(this.grade,this.profiles.active.mastery))!;
    const cards=(items:Skill[])=>`<div class="learning-skills">${items.map(s=>`<button class="learning-skill" type="button" data-skill="${s.id}"><strong>${escapeHtml(s.title)}</strong><small>${s.grade} · ${masteryLabel(this.profiles.active.mastery[s.id])}</small><small>${escapeHtml(s.example)}</small></button>`).join('')}</div>`;
    this.root.innerHTML=`<span class="eyebrow">MON PARCOURS</span><h2>Un défi à ma portée</h2><div class="learning-controls"><label>Niveau conseillé ou choisi<select id="learning-grade">${grades.map(g=>`<option ${g===this.grade?'selected':''}>${g}</option>`).join('')}</select></label><label>Difficulté<select id="learning-level"><option value="auto">Selon mes réussites</option>${['Découverte','Consolidation','Défi'].map((s,i)=>`<option value="${i}" ${this.level===i?'selected':''}>${s}</option>`).join('')}</select></label><button type="button" class="play-button" id="learning-recommended" data-recommended="${recommended.id}">Défi conseillé : ${escapeHtml(recommended.title)}</button></div>${cards(list.filter(s=>s.grade===this.grade))}<details class="learning-review"><summary>Réviser une autre notion</summary>${grades.filter(g=>g!==this.grade&&list.some(s=>s.grade===g)).map(g=>`<details><summary>${g}</summary>${cards(list.filter(s=>s.grade===g))}</details>`).join('')}</details><details><summary>Comprendre mon parcours</summary><p>La classe propose un départ. Chaque compétence progresse selon tes réussites sans aide. Tu peux aussi choisir un autre niveau.</p><p>Les nombres du jeu sont choisis pour leur stratégie de calcul. Les quantités et seuils de progression sont des réglages du jeu.</p><ul>${list.map(s=>`<li>${escapeHtml(s.title)} : <a href="${s.source}" target="_blank" rel="noopener">${s.reference}</a></li>`).join('')}</ul></details>`;
  }
}
