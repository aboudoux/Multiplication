import {escapeHtml} from './profile-ui';
import type {Calculation} from './calculations';
export class AnswerUI {
 readonly root=document.createElement('form');
 private text!:HTMLInputElement;
  private focused:HTMLInputElement|null=null;
 constructor(private update:(value:string)=>void,private submit:(value:string)=>void,private helped:()=>void) {
  this.root.id='study-answer';this.root.className='study-answer';this.root.hidden=true;
  this.root.addEventListener('input',()=>update(this.value));
  this.root.addEventListener('focusin',e=>{if(e.target instanceof HTMLInputElement)this.focused=e.target;});
  this.root.addEventListener('submit',e=>{e.preventDefault();submit(this.value);});
  this.root.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('[data-char],[data-choice]');if(b?.dataset.choice!==undefined)submit(b.dataset.choice);else if(b)this.append(b.dataset.char!);});
  this.root.addEventListener('toggle',e=>{if((e.target as HTMLDetailsElement).open)helped();},true);
 }
 append(value:string):boolean {
  const input=this.focused?.isConnected?this.focused:this.text;if(!input||input.disabled||input.value.length>=40)return false;
  const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.setRangeText(value,start,end,'end');this.update(this.value);input.focus({preventScroll:true});return true;
 }
 erase():boolean {
  const input=this.focused?.isConnected?this.focused:this.text;if(!input||input.disabled||!input.value)return false;
  const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.setRangeText('',start===end?Math.max(0,start-1):start,end,'end');this.update(this.value);input.focus({preventScroll:true});return true;
 }
 get value():string {
  const inputs=[...this.root.querySelectorAll<HTMLInputElement>('input')];return inputs.map(i=>i.value).join(';');
 }
 show(q:Calculation,autoInteger=false,signed=false):void {
  const answer=q.exercise?.answer,format=answer?.kind;
  this.root.hidden=false;
  const labels=format==='remainder'?['Quotient','Reste']:['Ta réponse'];
  const note=format==='set'?'Toutes les solutions, séparées par ;':format==='inequality'?'Écris par exemple x ≤ 4':format==='fraction'?(answer?.kind==='fraction'&&answer.irreducible?'Écris une fraction irréductible, par exemple 3/4':'Écris une fraction, par exemple 3/4'):format==='decimal'?'Virgule ou point sont acceptés':'';
  this.root.innerHTML=`<div class="study-fields">${labels.map((label,i)=>`<label>${label}<input id="study-input-${i}" autocomplete="off" spellcheck="false" maxlength="40" inputmode="${format==='integer'||format==='remainder'?'numeric':format==='decimal'?'decimal':'text'}" aria-describedby="study-format" required></label>`).join('')}</div><small id="study-format">${note}</small><div class="study-symbols">${['−',',','/',';','≤','≥','<','>','x'].filter(c=>format==='inequality'||format==='set'?true:format==='fraction'?['−','/'].includes(c):format==='decimal'?['−',','].includes(c):c==='−').map(c=>`<button type="button" class="secondary-button" data-char="${c}">${c}</button>`).join('')}<button id="study-submit" type="submit" class="play-button">Valider</button></div><details id="study-hint"><summary>Un indice</summary><p>${escapeHtml(q.exercise?.hint??'Décompose le calcul.')}</p></details>`;
  this.text=this.root.querySelector('input')!;
  this.focused=this.text;
  this.text.inputMode='none';
  if(autoInteger)this.root.querySelector('#study-submit')!.remove();
  if(format==='integer'&&!signed)this.root.querySelector('[data-char="−"]')?.remove();
  if((format==='decimal'||format==='fraction')&&answer&&(answer.kind==='decimal'||answer.kind==='fraction')&&answer.value.numerator>=0)this.root.querySelector('[data-char="−"]')?.remove();
  if(q.exercise?.choices){
   this.root.querySelector('.study-fields')!.setAttribute('hidden','');this.root.querySelector('.study-symbols')!.setAttribute('hidden','');
   this.root.querySelector('#study-format')!.setAttribute('hidden','');
   this.text.required=false;
   this.root.insertAdjacentHTML('afterbegin',`<div class="study-choices">${q.exercise.choices.map(choice=>`<button type="button" class="play-button" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`).join('')}</div>`);
  }
 }
 sync(value:string,enabled:boolean):void {
  const values=value.split(';');const inputs=[...this.root.querySelectorAll<HTMLInputElement>('input')];
  inputs.forEach((input,i)=>{const next=inputs.length===1?value:values[i]??'';if(input.value!==next)input.value=next;input.disabled=!enabled;});
  this.root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=!enabled);
 }
}
