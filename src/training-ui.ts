import { ant, campScene } from './ants';
import { buildings, buildingCosts, buildColony, colonyStatus, inspectTraining, preset, trainingLabel, type TrainingData, type TrainingSettings } from './training';
import { expression, type Operation } from './calculations';

type Choice = { value: number|string; label: string; note?: string };
function choices(id: string, title: string, value: unknown, items: Choice[], attributes='', compact=false): string {
  return `<fieldset id="${id}" class="camp-choices ${compact?'camp-choices-compact':''}"><legend>${title}</legend><div class="camp-choice-grid">${items.map(item=>`<label class="camp-choice"><input type="radio" id="${id}-${item.value}" name="${id}" value="${item.value}" ${attributes} ${item.value===value?'checked':''}><span><strong>${item.label}</strong>${item.note?`<small>${item.note}</small>`:''}</span></label>`).join('')}</div></fieldset>`;
}
const numberChoices = (values: number[]): Choice[] => values.map(value=>({value,label:String(value)}));
const lengths = [5,10,20,30,50,100];
const rhythms: TrainingSettings['duration'][] = [null,5,10,15,30];
const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-9.3a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
function rhythmPicker(s: TrainingSettings): string {
  const label=s.duration===null?'Sans chrono':`${s.duration} secondes`;
  return `<fieldset class="camp-play-setting"><legend>Mon rythme</legend><button id="camp-duration" type="button" class="camp-clock-button" data-duration="${s.duration??'none'}" aria-label="Mon rythme : ${label}. Cliquer pour changer"><svg class="camp-clock" viewBox="0 0 100 100" aria-hidden="true"><path d="M21 22 12 13M79 22l9-9M27 83l-6 9m52-9 6 9"/><path class="camp-clock-bells" d="M9 26Q5 5 24 7l10 10ZM66 17 76 7q19-2 15 19Z"/><circle cx="50" cy="51" r="35"/><path d="M50 22v5m29 24h-5M50 80v-5m-29-24h5"/><path class="camp-clock-hand" style="transform:rotate(${rhythms.indexOf(s.duration)*72}deg)" d="M50 51V30"/><circle class="camp-clock-pin" cx="50" cy="51" r="3"/></svg><span><strong>${label}</strong><small>Un clic pour changer de rythme</small></span></button><small class="camp-rhythm-options">Sans chrono · 5 · 10 · 15 · 30 s</small></fieldset>`;
}
function livesPicker(s: TrainingSettings): string {
  return `<fieldset class="camp-play-setting"><legend>Mes essais</legend><div class="camp-life-hearts" role="group" aria-label="Choisir le nombre de vies">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button id="camp-life-${n}" type="button" data-lives="${n}" aria-label="${n} vie${n===1?'':'s'}" aria-pressed="${s.lives===n}" class="${s.lives!==null&&n<=s.lives?'filled':''}">${heart}</button>`).join('')}</div><div class="camp-life-summary"><strong>${s.lives===null?'Essais illimités':`${s.lives} vie${s.lives===1?'':'s'}`}</strong><button id="camp-lives-unlimited" type="button" data-lives="none" aria-pressed="${s.lives===null}">∞ Illimités</button></div></fieldset>`;
}
export class TrainingUI {
  readonly root = document.createElement('section');
  private tab: 'workshop'|'colony' = 'workshop';
  private stored = true;
  private building: number | null = null;
  private constructionTimer: number | undefined;
  private constructionMessage = '';
  private buildingName = '';
  private buildingCost = 0;
  constructor(private data: TrainingData, private onChange:()=>boolean, private onStart:()=>void, private onHome:()=>void, private legacyRecords:()=>string) {
    this.root.id='training'; this.root.hidden=true; this.root.setAttribute('aria-label','Le camp des petites fourmis');
    this.root.addEventListener('click',event=>{
      const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button) return;
      if (button.dataset.tab) { this.stopConstruction(); this.tab=button.dataset.tab as typeof this.tab; this.render(); this.root.querySelector<HTMLElement>(`[data-tab="${this.tab}"]`)?.focus(); }
      if (button.dataset.preset) { this.data.settings=preset(button.dataset.preset); this.tab='workshop'; this.save(); this.render(); this.root.querySelector<HTMLElement>('#camp-session-title')?.focus(); }
      if (button.id==='camp-home') {this.stopConstruction();this.onHome();}
      if (button.id==='camp-build') this.construct();
      if (button.id==='camp-start') this.onStart();
      if (button.id==='camp-duration' || button.dataset.lives) {
        const details=[...this.root.querySelectorAll<HTMLDetailsElement>('details')].map(el=>el.open);
        const before=rhythms.indexOf(this.data.settings.duration)*72;
        if(button.id==='camp-duration') this.data.settings.duration=rhythms[(rhythms.indexOf(this.data.settings.duration)+1)%rhythms.length];
        else this.data.settings.lives=button.dataset.lives==='none'?null:Number(button.dataset.lives);
        this.save(); this.render();
        this.root.querySelectorAll<HTMLDetailsElement>('details').forEach((el,i)=>el.open=details[i]??false);
        this.root.querySelector<HTMLElement>(`#${button.id}`)?.focus({preventScroll:true});
        if(button.id==='camp-duration' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.root.querySelector('.camp-clock-hand')?.animate([{transform:`rotate(${before}deg)`},{transform:`rotate(${before+72}deg)`}],{duration:350,easing:'ease-in-out'});
        }
      }
      if (button.dataset.tables) { this.data.settings.tables=button.dataset.tables==='all'?Array.from({length:10},(_,i)=>i+1):[]; this.save(); this.render(); this.root.querySelector<HTMLElement>(`[data-tables="${button.dataset.tables}"]`)?.focus(); }
    });
    this.root.addEventListener('change',event=>this.change(event.target as HTMLInputElement));
  }
  open(tab: typeof this.tab = 'workshop',stored=this.stored): void { this.stopConstruction(); this.tab=tab; this.stored=stored; this.render(); this.focusTitle(); }
  private stopConstruction(): void {clearTimeout(this.constructionTimer);this.building=null;}
  private construct(): void {
    if(this.building!==null) return;
    const before=colonyStatus(this.data);
    if(!buildColony(this.data)) return;
    this.building=Math.min(6,before.built+1);
    this.buildingName=before.name;this.buildingCost=before.cost;
    this.constructionMessage=before.built<6?`${before.name} : construction terminée !`:'Une nouvelle étoile brille sur le drapeau !';
    this.save();this.render();
    this.root.querySelector<HTMLElement>('#colony-status')?.focus({preventScroll:true});
    this.root.querySelector<HTMLElement>('.colony-site')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    this.constructionTimer=window.setTimeout(()=>{
      this.building=null;this.render();
      this.root.querySelector<HTMLElement>('#camp-build')?.focus({preventScroll:true});
    },matchMedia('(prefers-reduced-motion: reduce)').matches?300:2400);
  }
  private colonyMarkup(): string {
    const state=colonyStatus(this.data);
    const cost=this.building!==null?this.buildingCost:state.cost;
    const available=this.building!==null?cost:Math.min(state.stock,cost);
    const name=this.building!==null?this.buildingName:state.name;
    return `<div class="colony-heading"><div><span class="eyebrow">LE VILLAGE DES PETITES FOURMIS</span><h2>Un grand chantier, à ton rythme.</h2></div><span class="colony-count">${state.built} / 6<br><small>constructions</small></span></div>
    <div class="colony-site ${this.building!==null?'is-building':''}" data-building="${this.building??''}">${campScene(state.built,state.stars)}<span class="colony-scene-caption">Au-dessus, la nature. En dessous, toute une vie !</span>${this.building!==null?`<div class="colony-crew" aria-hidden="true">${ant()}<span class="colony-hammer">⚒</span><i></i><i></i><i></i></div>`:''}</div>
    <div class="colony-stock"><div><span>TA RÉSERVE</span><strong>${state.stock} <small>matériaux</small></strong></div><div><span>DEPUIS TES DÉBUTS</span><strong>${this.data.materials} <small>gagnés</small></strong></div></div>
    <section class="colony-next" aria-label="Le prochain chantier"><span class="eyebrow">${this.building!==null?'CHANTIER EN COURS':state.built<6?'PROCHAIN CHANTIER':'LA FOURMILIÈRE EST COMPLÈTE'}</span><h3>${name}</h3><div class="colony-budget"><span>${available} / ${cost} matériaux</span><span>${this.building!==null?'Matériaux livrés':state.missing?`Encore ${state.missing}`:'Tout est prêt !'}</span></div><progress max="${cost}" value="${available}" aria-label="Matériaux pour ${name}"></progress><button id="camp-build" type="button" class="play-button" ${state.missing||this.building!==null?'disabled':''}>${this.building!==null?'Les fourmis construisent…':state.built<6?'⚒ Construire maintenant':'★ Ajouter une étoile'}</button><p>1 calcul réussi = 1 matériau. Construire utilise ta réserve.</p><p id="colony-status" role="status" tabindex="-1">${this.building!==null?'Chantier en cours…':this.constructionMessage||'Rassemble les matériaux, puis clique pour lancer les travaux.'}</p></section>
    <ol class="camp-buildings">${buildings.map((name,i)=>`<li class="${i<state.built?'built':i===state.built?'next-building':''}"><span>${i<state.built?'✓':i+1}</span><strong>${name}</strong><small>${i<state.built?'Construite':`${buildingCosts[i]} matériaux`}</small>${i===state.built?'<em>Prochain chantier</em>':''}</li>`).join('')}</ol>
    ${state.stars?`<p class="colony-stars">★ ${state.stars} étoile${state.stars===1?'':'s'} sur ton drapeau</p>`:''}<p class="camp-help">Chaque chantier demande davantage de matériaux. Tes constructions restent acquises et le surplus attend dans ta réserve. Tous les réglages d’entraînement restent accessibles.</p><details><summary>Mes anciens records de partie libre</summary>${this.legacyRecords()}</details>`;
  }
  private focusTitle():void { this.root.querySelector<HTMLElement>('h1')?.focus(); }
  private save():void { this.stored=this.onChange(); }
  private change(input: HTMLInputElement):void {
    const s=this.data.settings;
    if (input.name==='operation') s.operations=[...this.root.querySelectorAll<HTMLInputElement>('[name="operation"]:checked')].map(el=>el.value as Operation);
    else if (input.name==='table') s.tables=[...this.root.querySelectorAll<HTMLInputElement>('[name="table"]:checked')].map(el=>Number(el.value));
    else if (input.id==='camp-zero') s.zero=input.checked;
    else if (input.dataset.rule) {
      const op=input.dataset.rule as 'add'|'subtract';
      if (input.dataset.field==='ceiling') { s[op].min=1; s[op].max=Number(input.value); }
      else if (input.dataset.field==='carry') s[op].carry=input.value as typeof s.add.carry;
      else s[op][input.dataset.field as 'min'|'max']=Number(input.value);
    } else if (input.name==='camp-length') s.length=input.value==='all'?'all':input.value==='custom'?15:Number(input.value);
    else if (input.id==='camp-custom-length') s.length=Number(input.value);
    else if (input.name==='camp-voice') s.voice=input.value as TrainingSettings['voice'];
    else if (input.name==='camp-multiplier-min') s.multiplierMin=Number(input.value);
    else if (input.name==='camp-multiplier-max') s.multiplierMax=Number(input.value);
    const focusId=input.id;
    const details=[...this.root.querySelectorAll<HTMLDetailsElement>('details')].map(el=>el.open);
    this.save(); this.render();
    this.root.querySelectorAll<HTMLDetailsElement>('details').forEach((el,i)=>el.open=details[i]??false);
    if (focusId) this.root.querySelector<HTMLElement>(`#${focusId}`)?.focus({preventScroll:true});
  }
  render():void {
    const s=this.data.settings;
    const {pools,count,error}=inspectTraining(s);
    const examples=[.2,.6,.99].flatMap(f=>pools.filter(pool=>pool.length).map(pool=>pool[Math.floor(pool.length*f)])).slice(0,3);
    const stock=colonyStatus(this.data).stock;
    this.root.innerHTML=`<div class="camp-top"><button id="camp-home" class="secondary-button" type="button">← Accueil</button><span class="camp-materials">✦ ${stock} matériaux</span></div>
    <header class="camp-heading"><div><span class="eyebrow">PETITS CALCULS, GRANDES CONSTRUCTIONS</span><h1 tabindex="-1">Le camp des<br><em>petites fourmis</em></h1><p>Choisis ton défi. Enfile ton casque.<br>Construisons quelque chose ensemble !</p></div><div class="camp-guide">${ant()}</div></header>
    <nav class="camp-nav" aria-label="Les lieux du camp">${[['workshop','⚒','S’entraîner'],['colony','⌂','La fourmilière']].map(([id,icon,label])=>`<button type="button" data-tab="${id}" aria-current="${id===this.tab?'page':'false'}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}</nav>
    <div class="camp-content">${this.tab==='colony'?this.colonyMarkup():
    `<details id="camp-quick-sessions" class="camp-quick-sessions"><summary>Séances prêtes à l’emploi</summary><p>Choisis une séance pour remplir les réglages ci-dessous.</p><div class="camp-presets">${[['first','+','Premiers calculs','10 additions jusqu’à 10'],['tables','×','Mes tables','20 calculs · tables de 2 et 5'],['mix','+ − ×','Grand mélange','20 calculs · trois opérations']].map(([id,icon,title,desc])=>`<button type="button" data-preset="${id}"><span class="camp-symbol">${icon}</span><strong>${title}</strong><small>${desc}</small><span class="camp-preset-note">Sans chrono · essais illimités →</span></button>`).join('')}</div></details><h2 id="camp-session-title" tabindex="-1">Personnaliser ma séance</h2><fieldset class="camp-field"><legend>Mes opérations</legend><div class="camp-checks">${(['add','subtract','multiply'] as const).map((op,i)=>`<label><input id="camp-op-${op}" name="operation" type="checkbox" value="${op}" ${s.operations.includes(op)?'checked':''}><span>${['+ Addition','− Soustraction','× Multiplication'][i]}</span></label>`).join('')}</div></fieldset>
    <div class="camp-number-grid">${(['add','subtract'] as const).filter(op=>s.operations.includes(op)).map(op=>`<fieldset class="camp-field"><legend>${op==='add'?'Mes additions':'Mes soustractions'}</legend>${choices(`camp-${op}-ceiling`,'Nombres jusqu’à',s[op].max,numberChoices([...new Set([10,20,50,100,s[op].max])].sort((a,b)=>a-b)),`data-rule="${op}" data-field="ceiling"`,true)}<details id="camp-${op}-advanced"><summary>Affiner mon entraînement</summary><div class="camp-inline"><label>Minimum<input id="camp-${op}-min" data-rule="${op}" data-field="min" type="number" min="1" max="100" value="${s[op].min}"></label><label>Maximum<input id="camp-${op}-max" data-rule="${op}" data-field="max" type="number" min="1" max="100" value="${s[op].max}"></label></div><small>Les deux nombres et le résultat restent dans cette plage.</small>${choices(`camp-${op}-carry`,'Passage de dizaine',s[op].carry,[{value:'all',label:'Tous',note:'On mélange !'},{value:'without',label:'Sans passage',note:op==='add'?'8 + 1 = 9':'18 − 5 = 13'},{value:'with',label:'Avec passage',note:op==='add'?'8 + 5 = 13':'13 − 5 = 8'}],`data-rule="${op}" data-field="carry"`)}<small>${op==='add'?'8 + 5 : on franchit 10 avec une retenue.':'13 − 5 : on emprunte une dizaine.'}</small></details></fieldset>`).join('')}</div>
    ${s.operations.includes('multiply')?`<fieldset class="camp-field"><legend>Mes tables</legend><div class="camp-table-actions"><button type="button" data-tables="all">Toutes</button><button type="button" data-tables="none">Aucune</button></div><div class="camp-checks camp-tables">${Array.from({length:10},(_,i)=>i+1).map(n=>`<label><input id="camp-table-${n}" name="table" type="checkbox" value="${n}" ${s.tables.includes(n)?'checked':''}><span>${n}</span></label>`).join('')}</div><div class="camp-multiplier-grid">${choices('camp-multiplier-min','Multiplier à partir de',s.multiplierMin,numberChoices(Array.from({length:11},(_,i)=>i)),'',true)}${choices('camp-multiplier-max','Jusqu’à',s.multiplierMax,numberChoices(Array.from({length:11},(_,i)=>i)),'',true)}</div><small>×0 est utilisé uniquement si le zéro est autorisé.</small></fieldset>`:''}
    <label class="camp-zero"><input id="camp-zero" type="checkbox" ${s.zero?'checked':''}> Autoriser le zéro comme nombre ou résultat</label>
    <div class="camp-number-grid"><div>${choices('camp-length','Ma séance',s.length==='all'?'all':lengths.includes(s.length)?s.length:'custom',[...lengths.map(value=>({value,label:String(value),note:'calculs'})),{value:'all',label:'Tout',note:'Toute la sélection'},{value:'custom',label:'✎ Sur mesure',note:'Choisis ta quantité'}])}${s.length!=='all'?`<label class="camp-exact-length">Nombre exact de calculs<input id="camp-custom-length" type="number" min="1" max="100" value="${s.length}"></label>`:''}</div>${rhythmPicker(s)}${livesPicker(s)}${choices('camp-voice','Voix des calculs',s.voice,[{value:'ant',label:'🐜 Fourmi malicieuse',note:'Une voix de petite fourmi'},{value:'classic',label:'🔊 Classique',note:'Une voix naturelle'}])}</div>
    <p class="camp-help">Observe le calcul puis tape la réponse : elle se valide toute seule. Les boutons Son et Voix en haut de l’écran contrôlent la lecture et la musique.</p>
    <div class="camp-launch"><div><strong>${count} calculs disponibles</strong><p class="camp-examples">${examples.map(q=>`${expression(q)} = ?`).join(' &nbsp; · &nbsp; ')}</p><p>${trainingLabel(s)}</p>${error?`<p role="alert" class="camp-error">${error}</p>`:''}</div><button id="camp-start" type="button" class="play-button" ${error?'disabled':''}>Casques prêts… on y va ! →</button></div>`}</div>
    <p class="camp-save" role="status">${this.stored?'Enregistré sur cet appareil.':'Le stockage est indisponible : tes changements restent pour cette visite seulement.'}</p>`;
  }
}
