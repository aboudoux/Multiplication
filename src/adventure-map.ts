import { challenges, chatonAdventure, type AdventureDefinition, worldFinished, worldUnlocked, stageUnlocked, adventureTimeLabel, adventureLivesLabel, type AdventureProgress } from './adventure';
import { themes } from './themes';

// Transparent shoulder caps overlap the intact torso while only the arm rotates.
const greetingArms: Partial<Record<keyof typeof themes, { shoulder: [number,number]; pivot: [number,number]; width:number; ratio:number }>> = {
 kitten: {shoulder:[73,60],pivot:[17,78],width:34,ratio:144/169},
 unicorn: {shoulder:[60,58],pivot:[15,76],width:34,ratio:122/149},
 alien: {shoulder:[31,60],pivot:[90,60],width:40,ratio:126/185},
 christmas: {shoulder:[41,41],pivot:[91,76],width:42,ratio:141/182},
 wizard: {shoulder:[35,52],pivot:[82,76],width:42,ratio:141/171},
 dragon: {shoulder:[69,52],pivot:[17,65],width:40,ratio:124/196},
};
function friendPortrait(id: keyof typeof themes, invited: boolean): string {
 const art=themes[id].home, arm=greetingArms[id];
 if (!invited) return art;
 if (!arm) {
  if (id==='star') return art.replace(/(<path d="M105[^>]+>)(\s*)(<path d="m66[^>]+>)/, '<g class="friend-vector-arm">$1$2$3</g>');
  return art;
 }
 const [x,y]=arm.shoulder, [px,py]=arm.pivot;
 const left=x-arm.width*px/100, top=y-arm.width*arm.ratio*py/100;
 return `<span class="friend-layered" data-friend="${id}"><img class="friend-body" src="/themes/friend-parts-v1/${id}-body-v2.png" alt="" draggable="false"><img class="friend-raised-arm" src="/themes/friend-parts-v1/${id}-arm.png" alt="" draggable="false" style="width:${arm.width}%;left:${left}%;top:${top}%;transform-origin:${px}% ${py}%"></span>`;
}

export function mapMarkup(progress: AdventureProgress, stored: boolean, adventure:AdventureDefinition=chatonAdventure): string {
  const {worlds,stages}=adventure;
  const pico=adventure.id==='pico';
  const mentalTime=adventure.mentalDuration?`${adventure.mentalDuration} s par calcul`:'Sans chrono';
  const mentalLives=adventure.mentalDuration?'5 vies par mission':'Essais illimités';
  const invited = worlds.filter(w => worldFinished(progress,w.id,adventure));
  const finished = progress.completed.length === stages.length;
  return `<div class="adventure-heading"><div><span class="eyebrow">${adventure.title.toLocaleUpperCase('fr')}</span><h1 id="map-title" tabindex="-1">${adventure.heading}</h1><p>${adventure.description}</p></div><div class="map-actions"><button id="change-adventure" class="secondary-button" type="button">Changer d’aventure</button><button id="leave-adventure" class="secondary-button" type="button">← Accueil</button></div></div>
  <div class="adventure-passport"><span><strong>${progress.completed.length} / ${stages.length}</strong> missions accomplies</span><span><strong>${invited.length} / 8</strong> amis réunis</span><span>${adventure.adaptive?`Mon parcours · ${mentalTime.toLowerCase()}`:'Des défis progressifs · chaque cœur compte'}</span></div>
  <p class="adventure-save" role="status">${stored ? 'Tes étapes sont gardées sur cet appareil.' : 'La sauvegarde est indisponible : tes étapes sont conservées pour cette visite seulement.'}</p>
  <div class="adventure-reset"><button id="reset-adventure" class="secondary-button" type="button">Réinitialiser les missions</button><span>Efface la progression de l’aventure sur cet appareil.</span></div>
  <div class="adventure-route">${[0,1,2,3,4].map(tier => `<section class="map-region" aria-label="${adventure.regions[tier]}"><h2><span>${tier + 1}</span> ${adventure.regions[tier]}</h2>${tier > 0 ? `<p class="region-hint">${tier === 1 ? 'Termine les trois missions du départ, puis choisis le monde qui te plaît.' : 'Termine les deux mondes de l’étape précédente pour ouvrir ces chemins.'}</p>` : ''}<div class="world-row">${worlds.filter(w => w.tier === tier).map(world => {
    const unlocked = worldUnlocked(progress,world,adventure), done = worldFinished(progress,world.id,adventure);
    return `<article class="world-card ${unlocked ? '' : 'world-locked'} ${done ? 'world-complete' : ''}" style="--island-color:${world.color}" data-world="${world.id}"><div class="world-intro"><div class="world-portrait" aria-hidden="true">${themes[world.id].home}</div><div><span class="world-status">${adventure.adaptive?'À mon rythme':challenges[world.id].difficulty} · ${done ? pico ? '✓ Compagnon retrouvé' : '✓ Ami invité' : unlocked ? '✦ À explorer' : 'À découvrir bientôt'}</span><h3>${world.name}</h3><p>${done ? world.souvenir : stages.find(s=>s.world.id===world.id)!.lesson}</p></div></div><ol class="world-missions">${stages.filter(s=>s.world.id===world.id).map(stage => {
      const complete = progress.completed.includes(stage.id), available = stageUnlocked(progress,stage,adventure);
      return `<li><button type="button" data-stage="${stage.id}" class="${complete ? 'mission-complete' : available ? 'mission-available' : 'mission-locked'}" ${available ? '' : 'disabled'} aria-label="${complete ? 'Rejouer : ' : ''}${stage.name}. ${stage.count} calculs. ${stage.lesson}. ${adventure.adaptive?mentalTime:adventureTimeLabel(world.id)}. ${adventure.adaptive?mentalLives:adventureLivesLabel(world.id)}"><span class="mission-number">${complete ? '✓' : available ? stage.index+1 : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/></svg>'}</span><span><strong>${stage.name}</strong><span class="mission-state">${complete ? '✓ Réussie · Rejouer' : available ? 'À jouer' : 'Verrouillée'}</span><small>${stage.count} calculs · ${stage.lesson}<br>${adventure.adaptive?mentalTime:adventureTimeLabel(world.id)} · ${adventure.adaptive?mentalLives:adventureLivesLabel(world.id)}</small></span><span aria-hidden="true">${available ? '→' : '○'}</span></button></li>`;
    }).join('')}</ol></article>`;
  }).join('')}</div></section>`).join('')}</div>
  <section class="friends-party ${finished ? 'party-ready' : ''}" aria-label="Les huit amis"><span class="eyebrow">LE RENDEZ-VOUS DES AMIS</span><h2>${finished ? adventure.endingTitle : pico ? 'L’équipage se rassemble' : 'La fête grandit avec toi'}</h2><p>${finished ? adventure.endingDescription : pico ? 'Chaque île terminée réunit un ami et un élément pour le phare.' : 'Chaque monde terminé ramène un ami et sa surprise.'}</p><div class="friends-line">${worlds.map(w=>`<div class="friend ${worldFinished(progress,w.id,adventure) ? 'friend-invited' : ''}"><div aria-hidden="true">${friendPortrait(w.id,worldFinished(progress,w.id,adventure))}</div><span>${worldFinished(progress,w.id,adventure) ? w.friend : '?'}</span></div>`).join('')}</div>${finished ? `<button id="celebrate-adventure" class="play-button" type="button">${adventure.celebrateLabel}</button>` : ''}</section>`;
}
/** Celebrate locked-to-available transitions once, when each target is visible. */
export function revealUnlockedMissions(root: HTMLElement, ids: readonly string[], onReveal: () => void = () => {}): () => void {
  const targets = ids.map(id => root.querySelector<HTMLButtonElement>(`[data-stage="${id}"]`)).filter((button): button is HTMLButtonElement => !!button && !button.disabled);
  if (!targets.length) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const effects: HTMLElement[] = [];
  const timers: number[] = [];
  let cancelled = false;
  let sounded = false;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < .6 || cancelled) continue;
      const button = entry.target as HTMLButtonElement;
      observer.unobserve(button);
      if (!sounded) { sounded = true; onReveal(); }
      button.classList.add('mission-unlock-pop');
      if (reduced.matches) continue;
      const burst = document.createElement('span');
      burst.className = 'mission-unlock-stars';
      burst.setAttribute('aria-hidden','true');
      for (let i=0; i<12; i++) {
        const star = document.createElement('span');
        star.textContent = '\u2726';
        const angle = i * Math.PI / 6;
        star.style.setProperty('--star-x', `${Math.cos(angle)*65}px`);
        star.style.setProperty('--star-y', `${Math.sin(angle)*45}px`);
        star.style.setProperty('--star-turn', `${i*47}deg`);
        burst.append(star);
      }
      button.append(burst); effects.push(burst);
      timers.push(window.setTimeout(() => burst.remove(),1400));
    }
  }, {threshold:.6});
  for (const button of targets) {
    button.classList.add('mission-newly-unlocked');
    const badge = document.createElement('span');
    badge.className = 'mission-unlock-badge';
    badge.textContent = 'Nouvelle mission !';
    button.querySelector('strong')!.after(badge);
    effects.push(badge);
    observer.observe(button);
  }
  const status = document.createElement('p');
  status.className = 'sr-only'; status.setAttribute('role','status');
  status.textContent = `Nouvelles missions disponibles : ${targets.map(button => button.querySelector('strong')!.textContent).join(', ')}.`;
  root.append(status); effects.push(status);
  const frame = requestAnimationFrame(() => {
    if (cancelled) return;
    targets[0].focus({preventScroll:true});
    const destination = targets.length > 1 ? targets[0].closest('.world-row')! : targets[0];
    destination.scrollIntoView({behavior:reduced.matches ? 'instant' : 'smooth',block:targets.length > 1 ? 'start' : 'center'});
  });
  return () => {
    cancelled = true; cancelAnimationFrame(frame); observer.disconnect();
    timers.forEach(clearTimeout); effects.forEach(effect => effect.remove());
    targets.forEach(button => button.classList.remove('mission-newly-unlocked','mission-unlock-pop'));
  };
}

