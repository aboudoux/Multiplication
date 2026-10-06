import {grades,curriculum,masteryLabel,type Grade,type Skill} from './curriculum';
import type {Profiles} from './profiles';
import {escapeHtml} from './profile-ui';
import {preset,type TrainingSettings} from './training';
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
  constructor(private profiles:Profiles,private launch:(skill:Skill,grade:Grade)=>void) {
    this.grade=profiles.active.grade;this.root.className='learning-panel';this.root.id='learning-panel';
    this.root.addEventListener('change',e=>{const input=e.target as HTMLSelectElement;if(input.id==='learning-grade'){this.grade=input.value as Grade;this.render();}});
    this.root.addEventListener('click',e=>{const button=(e.target as Element).closest<HTMLButtonElement>('[data-skill]');if(!button)return;const s=curriculum(this.grade).find(s=>s.id===button.dataset.skill);if(s)launch(s,this.grade);});
    this.render();
  }
  open():void {this.grade=this.profiles.active.grade;this.render();}
  render():void {
    this.root.hidden=!this.profiles.active.adaptive;
    const list=curriculum(this.grade);
    this.root.innerHTML=`<span class="eyebrow">MON PARCOURS</span><h2>Un défi à ma portée</h2><div class="learning-controls"><label>Niveau conseillé ou choisi<select id="learning-grade">${grades.map(g=>`<option ${g===this.grade?'selected':''}>${g}</option>`).join('')}</select></label></div><div class="learning-skills">${list.map(s=>`<button class="learning-skill" type="button" data-skill="${s.id}"><strong>${escapeHtml(s.title)}</strong><small>${s.grade} · ${masteryLabel(this.profiles.active.mastery[s.id])}</small><small>${escapeHtml(s.example)}</small></button>`).join('')}</div><details><summary>Comprendre mon parcours</summary><p>La classe propose un départ. Chaque compétence progresse selon tes réussites sans aide. Tu peux aussi choisir un autre niveau.</p><p>Les nombres du jeu sont choisis pour leur stratégie de calcul. Les quantités et seuils de progression sont des réglages du jeu.</p><ul>${list.map(s=>`<li>${escapeHtml(s.title)} : <a href="${s.source}" target="_blank" rel="noopener">${s.reference}</a></li>`).join('')}</ul></details>`;
  }
}
