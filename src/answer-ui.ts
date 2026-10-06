import {escapeHtml} from './profile-ui';
import type {Calculation} from './calculations';
import {resultLabel} from './questions';
export class AnswerUI {
 readonly root=document.createElement('form');
 readonly symbolControls=document.createElement('div');
 private text!:HTMLInputElement;
 private focused:HTMLInputElement|null=null;
 constructor(private update:(value:string)=>void,private submit:(value:string)=>void,private helped:()=>void) {
  this.root.id='study-answer';this.root.className='study-answer';this.root.hidden=true;
  this.symbolControls.className='study-keypad-symbols';this.symbolControls.hidden=true;
  this.symbolControls.addEventListener('click',e=>{const button=(e.target as Element).closest<HTMLButtonElement>('[data-char]');if(button)this.append(button.dataset.char!);});
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
 show(q:Calculation,autoInteger=false,signed=false,autoExact=false):void {
  const answer=q.exercise?.answer,format=answer?.kind;
  this.root.hidden=false;
  const labels=format==='remainder'?['Quotient','Reste']:['Ta réponse'];
  const lengths=answer?.kind==='remainder'?[String(answer.quotient).length,String(answer.remainder).length]:[resultLabel(q).replace(/^[-−]/,'').length];
  const slots=(count:number)=>Array.from({length:count},()=>'<span class="answer-slot"></span>').join('');
  const formatNote=format==='set'?'Toutes les solutions, séparées par ;':format==='inequality'?'Écris par exemple x ≤ 4':format==='fraction'?(answer?.kind==='fraction'&&answer.irreducible?'Écris une fraction irréductible, par exemple 3/4':'Écris une fraction, par exemple 3/4'):format==='decimal'?'Virgule ou point sont acceptés':'';
  const note=formatNote+(autoExact?(answer?.kind==='decimal'&&answer.value.denominator===1?' · Réponse vérifiée automatiquement':' · Bonne réponse validée automatiquement'):'');
  this.root.innerHTML=`<div class="study-fields">${labels.map((label,i)=>`<label><span class="sr-only">${label}${format==='integer'?` : ${lengths[i]} chiffre${lengths[i]>1?'s':''} à saisir`:''}</span><div class="study-chalk-field"><div class="study-chalk-display" aria-hidden="true"><span class="study-chalk-sign" hidden></span><div class="answer-slots study-chalk-slots" data-characters="${lengths[i]}" data-signed="${signed||resultLabel(q).startsWith('-')}">${slots(lengths[i])}</div></div><input id="study-input-${i}" autocomplete="off" spellcheck="false" maxlength="40" inputmode="none" aria-describedby="study-format" required></div></label>`).join('')}</div><small id="study-format" ${note?'':'hidden'}>${note}</small><div class="study-symbols">${['−',',','/',';','≤','≥','<','>','x'].filter(c=>format==='inequality'||format==='set'?true:format==='fraction'?['−','/'].includes(c):format==='decimal'?['−',','].includes(c):c==='−').map(c=>`<button type="button" class="secondary-button" data-char="${c}">${c}</button>`).join('')}<button id="study-submit" type="submit" class="play-button">Valider</button></div><details id="study-hint"><summary>Un indice</summary><p>${escapeHtml(q.exercise?.hint??'Décompose le calcul.')}</p></details>`;
  this.text=this.root.querySelector('input')!;
  this.focused=this.text;
  this.text.inputMode='none';
  if(autoInteger||autoExact)this.root.querySelector('#study-submit')!.remove();
  if(format==='integer'&&!signed&&!resultLabel(q).startsWith('-'))this.root.querySelector('[data-char="−"]')?.remove();
  if((format==='decimal'||format==='fraction')&&answer&&(answer.kind==='decimal'||answer.kind==='fraction')&&answer.value.numerator>=0)this.root.querySelector('[data-char="−"]')?.remove();
  this.symbolControls.replaceChildren();
  if(!q.exercise?.choices)this.root.querySelectorAll<HTMLButtonElement>('[data-char]').forEach(button=>{
   const char=button.dataset.char!;
   button.setAttribute('aria-label',char==='−'?'Signe moins':char===','?'Virgule':char==='/'?'Barre de fraction':char);
   this.symbolControls.append(button);
  });
  this.symbolControls.hidden=!this.symbolControls.children.length;
  if(!this.root.querySelector('.study-symbols')!.children.length)this.root.querySelector('.study-symbols')!.setAttribute('hidden','');
  if(q.exercise?.choices){
   this.root.querySelector('.study-fields')!.setAttribute('hidden','');this.root.querySelector('.study-symbols')!.setAttribute('hidden','');
   this.root.querySelector('#study-format')!.setAttribute('hidden','');
   this.text.required=false;
   this.root.insertAdjacentHTML('afterbegin',`<div class="study-choices">${q.exercise.choices.map(choice=>`<button type="button" class="play-button" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`).join('')}</div>`);
  }
 }
 sync(value:string,enabled:boolean):void {
  const values=value.split(';');const inputs=[...this.root.querySelectorAll<HTMLInputElement>('input')];
  inputs.forEach((input,i)=>{
   const next=inputs.length===1?value:values[i]??'';if(input.value!==next)input.value=next;input.disabled=!enabled;
   const display=input.parentElement!.querySelector<HTMLElement>('.study-chalk-slots')!;
   if(display.dataset.value===next)return;
   display.dataset.value=next;
   const hasSign=/^[-−+]/.test(next),characters=[...(hasSign?next.slice(1):next)];
   const sign=input.parentElement!.querySelector<HTMLElement>('.study-chalk-sign')!;
   sign.hidden=display.dataset.signed!=='true'&&!hasSign;sign.textContent=hasSign?(next[0]==='+'?'+':'−'):'';
   display.innerHTML=Array.from({length:Math.max(Number(display.dataset.characters),characters.length)},(_,n)=>`<span class="answer-slot${characters[n]?' filled':''}">${escapeHtml(characters[n]??'')}</span>`).join('');
  });
  this.root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=!enabled);
  this.symbolControls.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=!enabled);
 }
}
