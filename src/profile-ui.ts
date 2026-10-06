import {avatars,type Profiles} from './profiles';
import {grades,gradeAge,gradeForAge,type Grade} from './curriculum';
import {mentalCurriculum,mentalLabel} from './mental-patterns';
import {adventureDifficulties,adventureDifficultyLabels} from './adventure-policy';
import {readAdventureAttempts} from './adventure-attempts';
import {adventures} from './adventure';
export const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export class ProfileUI {
  readonly button=document.createElement('button');
  readonly dialog=document.createElement('dialog');
  constructor(private profiles:Profiles,private changed:()=>void) {
    this.button.id='player-picker';this.button.className='secondary-button';this.button.type='button';
    this.dialog.id='player-dialog';this.dialog.setAttribute('aria-label','Les joueurs');document.body.append(this.dialog);
    this.button.addEventListener('click',()=>{this.render();this.dialog.showModal();});
    this.dialog.addEventListener('click',e=>{
      const b=(e.target as Element).closest<HTMLButtonElement>('button');if(!b)return;
      if(b.dataset.player){profiles.select(b.dataset.player);this.dialog.close();changed();this.update();}
      if(b.id==='player-close')this.dialog.close();
    });
    this.dialog.addEventListener('change',e=>{const select=e.target as HTMLSelectElement;if(select.name==='grade'){const setting=this.dialog.querySelector<HTMLElement>('#adventure-difficulty-setting');if(setting)setting.hidden=select.value==='classic';}});
    this.dialog.addEventListener('submit',e=>{
      e.preventDefault();const form=e.target as HTMLFormElement;const fields=new FormData(form);
      if(form.id==='new-player')profiles.add(String(fields.get('name')),gradeForAge(Number(fields.get('age'))),String(fields.get('avatar')));
      else {
        const grade=fields.get('grade');
        profiles.active.name=String(fields.get('name')).trim()||profiles.active.name;
        profiles.active.adaptive=grade!=='classic';
        if(profiles.active.adaptive)profiles.active.grade=grade as Grade;
        const difficulty=String(fields.get('adventureDifficulty'));
        if(adventureDifficulties.includes(difficulty as typeof adventureDifficulties[number]))profiles.active.adventureDifficulty=difficulty as typeof adventureDifficulties[number];
        profiles.save();
      }
      this.dialog.close();changed();this.update();
    });this.update();
  }
  update():void{const p=this.profiles.active;this.button.textContent=`${p.avatar} ${p.name} · ${p.adaptive?p.grade:'Classique'}`;}
  private render():void {
    const p=this.profiles.active;
    this.dialog.innerHTML=`<button id="player-close" type="button" class="secondary-button">Fermer</button><h2>Qui joue aujourd’hui ?</h2><div class="player-list">${this.profiles.state.players.map(player=>`<button type="button" class="secondary-button" data-player="${player.id}" aria-pressed="${player.id===p.id}">${player.avatar} ${escapeHtml(player.name)}</button>`).join('')}</div>
    <form id="edit-player"><h3>Mon profil</h3><label>Prénom ou pseudonyme<input name="name" value="${escapeHtml(p.name)}" maxlength="40" required></label><label>Mon parcours<select name="grade"><option value="classic" ${p.adaptive?'':'selected'}>Classique (sans adaptation)</option>${grades.map(g=>`<option ${p.adaptive&&g===p.grade?'selected':''}>${g}</option>`).join('')}</select></label><div id="adventure-difficulty-setting" ${p.adaptive?'':'hidden'}><label>Ma difficulté dans les aventures<select name="adventureDifficulty">${adventureDifficulties.map(d=>`<option value="${d}" ${d===p.adventureDifficulty?'selected':''}>${adventureDifficultyLabels[d]}</option>`).join('')}</select></label><p>Facile : prends ton temps. Normal : un défi progressif. Expert : plus de calculs et un chrono plus court.</p></div><p>Ta classe fixe les notions. Une nouvelle notion commence sans chrono. Le camp garde ses propres réglages.</p><button class="play-button" type="submit">Enregistrer mon profil</button></form>
    <details><summary>Mes compétences au camp</summary><ul>${mentalCurriculum(p.grade).map(s=>`<li>${s.title} — ${mentalLabel(this.profiles.mental[s.id])}</li>`).join('')}</ul></details>
    <details><summary>Mes dernières aventures</summary>${this.attemptsMarkup()}</details>
    <form id="new-player"><h3>Ajouter un joueur</h3><label>Prénom ou pseudonyme<input name="name" maxlength="40" required></label><label>Âge indicatif<select name="age">${grades.map(g=>`<option value="${gradeAge(g)}">${gradeAge(g)} ans · ${g}</option>`).join('')}</select></label><label>Avatar<select name="avatar">${avatars.map(a=>`<option>${a}</option>`).join('')}</select></label><p>La classe proposée pourra être corrigée. Chaque joueur garde ses propres progrès.</p><button class="play-button" type="submit" ${this.profiles.state.players.length>=50?'disabled':''}>Créer le joueur</button></form><p role="status">${this.profiles.stored?'Profils enregistrés sur cet appareil.':'Stockage indisponible : les profils restent pour cette visite.'}</p>`;
  }
  private attemptsMarkup():string {
    const attempts=readAdventureAttempts(this.profiles.storage).reverse();
    if(!attempts.length)return '<p>Après une mission, retrouve ici tes réussites, erreurs et temps de jeu. Les vingt dernières tentatives restent sur cet appareil.</p>';
    return `<ol class="adventure-attempt-list">${attempts.map(a=>`<li><strong>${a.adventure==='pico'?'Pico':'Le chaton'} · ${escapeHtml(adventures.find(adventure=>adventure.id===a.adventure)?.stages.find(s=>s.id===a.stage)?.name??'Mission')} · ${a.grade} · ${a.discovery?'Découverte':adventureDifficultyLabels[a.difficulty]}</strong><span>${a.outcome==='won'?'Réussie':a.outcome==='lost'?'À réessayer':'Quittée'} · ${a.solved}/${a.total} calculs · ${Math.round(a.activeMs/1000)} s de jeu</span><small>${a.firstCorrect}/${a.firstAnswers} réussis au premier essai · ${a.mistakes} erreurs, dont ${a.timeouts} délais dépassés · ${a.helped} aides</small></li>`).join('')}</ol>`;
  }
}
