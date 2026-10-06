import {studyVisual} from './study-visual';
import {adaptedAdventure,adaptiveQuestions} from './adaptive-adventure';
import {generateStudyQuestions} from './study-generator';
import {AnswerUI} from './answer-ui';
import {resultLabel} from './questions';
import {escapeHtml} from './profile-ui';
import {LearningUI,basicSettings} from './learning-ui';
import {openProfiles} from './profiles';
import {ProfileUI} from './profile-ui';
import {recordEvidence} from './curriculum';
import {recordMentalEvidence,mentalPatternById} from './mental-patterns';
import './learning.css';
import { ant, campScene } from './ants';
import { TrainingUI } from './training-ui';
import { readTraining, saveTraining, awardMaterials, colonyStatus, trainingQuestions, trainingLabel, trainingRecordKey, inspectTraining, type TrainingData } from './training';
import { ThemeSurprises } from "./surprises";
import { themes } from "./themes";
import { mascot, dancingMascot, disappointedMascot } from "./mascots";
import "./style.css";
import { DEFEAT_DURATION_MS, VICTORY_DURATION_MS, Game } from "./game";
import { modes, symbols, expression, spokenExpression } from "./calculations";
import type { Mode } from "./calculations";
import {
  defaults,
  formatTime,
  readSaved,
  saveData,
} from "./storage";
import { GameAudio } from "./audio";
import { Particles } from "./particles";
import { adventures, chatonAdventure, type AdventureDefinition, type AdventureId, adventureQuestions, readAdventure, saveAdventure, completeStage, stageUnlocked, worldFinished, type AdventureStage, type AdventureProgress } from './adventure';
import { mapMarkup, revealUnlockedMissions } from './adventure-map';
import './adventure.css';
import { adventureDurations, adventureTimeLabel, adventureLives, adventureLivesLabel, resetAdventure } from './adventure';
import { MISSION_REWARD_MS, MissionRewardScene } from './mission-rewards';
import './mission-rewards.css';
import { ThemedKeypad } from './keypad';
import './keypad.css';
import './training.css';
import './landing.css';
import './colony.css';
import { BirthdayParty } from './birthday-party';
import './birthday-party.css';
import { LighthouseParty } from './lighthouse-party';
import './pico.css';

const svg = (body: string, className = "") =>
  `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const icons = {
  sound: svg(
    '<path d="m11 5-5 4H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  ),
  voice: svg(
    '<path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 9v3m4-5v7m4-5v3"/>',
  ),
  mute: svg('<path d="m11 5-5 4H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/>'),
  heart: svg(
    '<path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-9.3a5.5 5.5 0 0 0 0-7.8Z"/>',
  ),
  star: svg(
    '<path d="m12 2 3.1 6.3L22 9.4l-5 4.9 1.2 6.9L12 18l-6.2 3.2L7 14.3 2 9.4l6.9-1.1L12 2Z"/>',
  ),
  clock: svg(
    '<circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 1M9 2h6m-3 0v3m6 2 2-2"/>',
  ),
  arrow: svg('<path d="M4 12h16m-6-6 6 6-6 6"/>'),
  pause: svg('<path d="M8 5v14m8-14v14" stroke-width="4"/>'),
  erase: svg('<path d="M9 5h12v14H9l-7-7 7-7Z"/><path d="m12 9 6 6m0-6-6 6"/>'),
  trophy: svg(
    '<path d="M8 3h8v7a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8"/>',
  ),
};
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="page-wrap">
    <div class="outside-note"><span class="little-star">✦</span> APPRENDRE, C’EST AUSSI JOUER.</div>
    <main class="wood-frame" aria-label="Calcul’Party">
      <div class="board" id="board"><div id="theme-scenery" class="theme-scenery" aria-hidden="true"></div><div id="theme-surprise" aria-hidden="true"></div>
        <header class="board-header">
          <a class="brand" href="#" aria-label="Calcul’Party, accueil"><span class="brand-mark">×</span><span>Calcul’Party<span class="brand-dot">.</span></span></a>
          <div class="header-right"><span class="arcade-label"><span></span> LE CLUB DU CALCUL</span><button class="voice-button" id="voice" type="button" aria-label="Couper la voix" aria-pressed="true">${icons.voice}<span>Voix</span></button><button class="icon-button" id="sound" type="button" aria-label="Couper le son" aria-pressed="false">${icons.sound}</button></div>
        </header>
        <button id="menu-audio-enable" type="button" class="menu-audio-notice" hidden>♫ Activer musique et sons</button>
        <p class="voice-notice" id="voice-unavailable" role="status" hidden>La voix n’a pas pu se charger. Tu peux réessayer avec « Réécouter ».</p>

        <section id="home" class="home-screen" aria-label="Accueil">
          <div class="club-bunting" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="destination-heading"><span class="eyebrow">BIENVENUE AU CLUB DU CALCUL</span><h1>À chaque jour son expédition !</h1><p>Un monde à explorer, des choses à construire.</p><div class="club-supplies" aria-hidden="true"><span>+</span><span>−</span><span>×</span><span>=</span></div></div>
          <div class="destinations">
            <article class="destination-card"><span class="destination-tag">EXPLORER & DÉCOUVRIR</span><div class="destination-art adventure-entry-art" aria-hidden="true"><img src="/themes/adventure-map.png" alt="" width="1254" height="1254" decoding="async"></div><h2>Partir à l’aventure</h2><p>Une fête avec le chaton ou un voyage en mer avec Pico : choisis ton aventure.</p><button id="open-adventure" class="play-button" type="button">Choisir mon aventure →</button></article>
            <article class="destination-card camp-entry"><span class="destination-tag">S’ENTRAÎNER & CONSTRUIRE</span><div class="destination-art">${ant()}</div><h2>Le camp d’entraînement</h2><p>Choisis tes calculs et aide les petites fourmis à bâtir leur maison.</p><button id="open-training" class="play-button" type="button">S’entraîner avec les fourmis →</button></article>
          </div>
        </section>

        <section id="play" class="play-screen" aria-label="Partie en cours" hidden>
          <div class="game-status">
            <div class="lives-group"><span class="small-label">TES VIES</span><div id="hearts" class="hearts" role="img" aria-label="3 vies restantes">${[0, 1, 2].map((i) => `<span data-heart="${i}">${icons.heart}</span>`).join("")}</div></div>
            <div class="status-middle"><span class="small-label">CHAQUE BONNE RÉPONSE COMPTE</span><span id="streak" class="streak">À toi de briller !</span></div>
            <div class="session-actions"><span class="session-time">${icons.clock}<span id="elapsed">0:00</span></span><button class="icon-button" id="pause" type="button" aria-label="Mettre en pause">${icons.pause}</button></div>
          </div>
          <div class="game-layout">
            <div class="challenge-column">
              <div class="question-time" id="time-box"><div><span>${icons.clock} À toi de jouer</span><button class="repeat-question" id="repeat-question" type="button" aria-label="Réécouter le calcul">${icons.voice}<span>Réécouter</span></button><strong id="time-left">10 s</strong></div><div class="time-track" role="progressbar" aria-label="Temps restant" aria-valuemin="0" aria-valuemax="10" id="time-progress"><span id="time-fill"></span></div></div>
              <div class="question-area" id="question-area">
                <span class="board-doodle doodle-one">✧</span><span class="board-doodle doodle-two">×</span>
                <div class="question-content" id="question-content"><div class="question-caption" id="question-caption">À toi de trouver !</div><div class="equation" id="equation" aria-label="Calcul"></div><div id="answer" class="answer-slots" aria-label="Ta réponse"></div></div>
                <div class="correction-card" id="correction-card" role="alert" hidden><span class="correction-kicker">OUPS !</span><span class="correction-phrase">Désolé, mais c’était</span><strong id="correct-result"></strong><p id="study-explanation" hidden></p><span class="correction-sparkle" aria-hidden="true">✦</span></div>
                <div class="game-reaction" id="reaction" aria-hidden="true"></div>
              </div>
              <div class="feedback-line" id="feedback" role="status" aria-live="polite">Respire, tu sais le faire !</div>
            </div>
            <div class="keypad-panel"><div class="keypad-label">LE BOUT DES DOIGTS, LE PLEIN D’IDÉES.</div><div class="keypad" aria-label="Pavé numérique">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-digit="${n}" aria-label="${n}">${n}</button>`).join("")}<span class="pad-star" aria-hidden="true">✦</span><button type="button" data-digit="0" aria-label="0">0</button><button type="button" id="erase" class="erase" aria-label="Effacer le dernier chiffre">${icons.erase}</button></div></div>
            <aside class="progress-panel" aria-label="Progression"><div class="progress-title">OBJECTIF<br><strong id="progress-goal">100</strong></div><div class="thermometer" role="progressbar" id="progress" aria-label="Calculs réussis" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="thermo-track"><div id="progress-fill"></div><span class="thermo-tick tick-75"></span><span class="thermo-tick tick-50"></span><span class="thermo-tick tick-25"></span></div><div class="thermo-bulb">${icons.star}</div></div><strong id="progress-percent">0 %</strong><span class="progress-caption" id="progress-caption">0 / 100</span></aside>
          </div>
          <div class="game-footer"><span id="difficulty-label">TEMPO · 10 S PAR RÉPONSE</span><span>Un calcul réussi ne revient plus. Promis.</span></div>
        </section>

        <section id="defeat" class="defeat-screen" style="--defeat-duration: ${DEFEAT_DURATION_MS}ms" role="status" aria-live="polite" tabindex="-1" hidden>
          <span class="eyebrow">PLUS DE VIES POUR CETTE PARTIE</span>
          <div id="sad-mascot">${disappointedMascot}</div>
          <h2>Ooooh…</h2>
          <p>Dommage… On fera mieux au prochain essai !</p>
          <div class="defeat-dots" aria-hidden="true"><span></span><span></span><span></span></div>
        </section>
        <section id="victory" class="victory-screen" style="--victory-duration: ${VICTORY_DURATION_MS}ms" role="status" aria-live="polite" tabindex="-1" hidden>
          <span class="eyebrow" id="victory-goal">100 SUR 100 · MISSION ACCOMPLIE</span>
          <div class="victory-stage" role="img" aria-label="L’étoile danse sous les projecteurs">
            <span class="party-light party-light-left"></span><span class="party-light party-light-right"></span>
            <span class="party-note party-note-one">♫</span><span class="party-note party-note-two">♪</span><span class="party-note party-note-three">♫</span>
            <span class="party-floor"></span><div class="dancing-star" id="dance-mascot">${dancingMascot}</div>
          </div>
          <h2>Tu l’as fait !</h2>
          <p id="victory-description">100 calculs réussis. Danse de la victoire !</p>
        </section>
        <section id="results" class="results-screen" aria-label="Bilan de la partie" hidden>
          <div class="result-star" aria-hidden="true">${icons.star}</div><span class="eyebrow" id="result-eyebrow">CHAQUE ESSAI TE FAIT GRANDIR</span><h2 id="result-title">Bien joué !</h2><p id="result-description"></p><p class="last-correction" id="last-correction" hidden></p>
          <div class="result-stats"><div><strong id="result-solved">0</strong><span id="result-total">sur 100 réussies</span></div><div><strong id="result-time">0:00</strong><span>de réflexion</span></div><div><strong id="result-mistakes">0</strong><span>erreurs</span></div><div><strong id="result-streak">0</strong><span>à la suite</span></div></div>
          <div class="result-record" id="result-record"></div><div class="result-actions"><button class="play-button" data-action="start" type="button">On rejoue ! ${icons.arrow}</button><button class="secondary-button" data-action="home" type="button">Changer les réglages</button></div>
        </section>

        <div class="game-overlay" id="overlay" hidden><div id="countdown-panel"><span class="eyebrow" id="countdown-caption">LES CALCULS N’ONT QU’À BIEN SE TENIR</span><div class="countdown-number" id="countdown" role="status" aria-live="assertive">3</div><span class="countdown-note">Tes doigts sont prêts ?</span></div><div class="pause-panel" id="preparing-panel" hidden>${icons.voice}<div role="status"><h2>La voix se prépare…</h2><p>Ton chrono attend aussi !</p></div><button class="secondary-button" id="skip-voice" type="button">Continuer sans la voix</button></div><div class="pause-panel" id="pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-title" hidden>${icons.pause}<h2 id="pause-title">Petite pause.</h2><p>Ton temps et tes vies t’attendent.</p><button class="play-button" id="resume" type="button">On continue ! ${icons.arrow}</button></div></div>
        <canvas id="confetti" aria-hidden="true"></canvas>
        <div class="board-ledge" aria-hidden="true"><span class="chalk chalk-white"></span><span class="chalk chalk-yellow"></span><span class="eraser-prop"></span></div>
        <p class="sr-only" id="question-announcement" aria-live="polite"></p>
      </div>
    </main>
    <footer class="page-footer"><span>FAIT POUR LES PETITS DÉCLICS ${icons.star}</span><span>Souris, clavier ou petits doigts.</span></footer>
  </div>`;

function get<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}
const profiles=openProfiles();
const playerStorage=profiles.storage;
let saved = defaults();
try {
  saved = readSaved(playerStorage);
} catch {
  /* Storage may be disabled entirely. */
}
let campOpen = false;
let trainingActive = false;
let studySkill:string|null=null;
let studyGrade=profiles.active.grade;
let studyLevel:number|null=null;
let studyQuestions:import('./calculations').Calculation[]=[];
let creditedMaterials = 0;
let trainingStored = profiles.stored;
let trainingData: TrainingData = { settings: readTraining({getItem:()=>null}).settings, materials:0, records:{} };
try { trainingData = readTraining(playerStorage,playerStorage.getItem('multipli-party:v1') ? saved : undefined); } catch { trainingStored=false; }
const audio = new GameAudio();
let activeStage: AdventureStage | null = null;
let mapOpen = false;
let chooserOpen=false;
let activeAdventure:AdventureDefinition=chatonAdventure;
let worlds=activeAdventure.worlds, stages=activeAdventure.stages;
const adventureSaves=new Map<AdventureId,{progress:AdventureProgress;stored:boolean}>();
for(const adventure of adventures) {
  let stored=profiles.stored, progress:AdventureProgress={completed:[]};
  try { playerStorage.getItem(adventure.storageKey); progress=readAdventure(playerStorage,adventure); } catch {stored=false;}
  adventureSaves.set(adventure.id,{progress,stored});
}
let adventureProgress=adventureSaves.get(activeAdventure.id)!.progress;
let adventureStored=adventureSaves.get(activeAdventure.id)!.stored;
function cacheAdventure():void {adventureSaves.set(activeAdventure.id,{progress:adventureProgress,stored:adventureStored});}
const adventureChoice=document.createElement('section');
adventureChoice.id='adventure-choice';adventureChoice.className='adventure-choice';adventureChoice.hidden=true;
adventureChoice.setAttribute('aria-label','Choisir une aventure');get('home').before(adventureChoice);
const adventureMap = document.createElement('section');
adventureMap.id = 'adventure-map'; adventureMap.hidden = true;
adventureMap.setAttribute('aria-label', 'La carte de l’aventure');
get('home').before(adventureMap);
get('pause-panel').insertAdjacentHTML('beforeend','<button id="adventure-exit" class="secondary-button" type="button" hidden>Retour à la carte · recommencer cette mission plus tard</button>');
get('victory-description').insertAdjacentHTML('afterend',`<div id="adventure-guests" aria-label="Tous les amis réunis" hidden>${worlds.map(w=>themes[w.id].home).join('')}</div>`);
get('victory-description').insertAdjacentHTML('beforebegin','<div id="mission-reward" hidden></div>');
const missionReward = new MissionRewardScene(get('mission-reward'));
function returnFromFinale(): void {
  showMap();
  (document.querySelector<HTMLButtonElement>('#celebrate-adventure') ?? get('map-title')).focus({preventScroll:true});
}
const kittenBirthday = new BirthdayParty(get('board'), returnFromFinale);
const lighthouseParty=new LighthouseParty(get('board'),returnFromFinale);
let activeFinale:BirthdayParty|LighthouseParty=kittenBirthday;
function showFinale(): void {
  audio.homeMusic(false); audio.stopSpeech();
  activeFinale.start(saved.muted); render(performance.now());
}
audio.muted = saved.muted;
// Mobile browsers require a gesture before music can begin.
const unlockMenuAudio=()=>{ if (!audio.muted) void audio.unlock(); };
document.addEventListener('pointerdown',unlockMenuAudio,{passive:true});
document.addEventListener('touchend',unlockMenuAudio,{passive:true});
document.addEventListener('click',unlockMenuAudio,{capture:true});
document.addEventListener('keydown',unlockMenuAudio);
unlockMenuAudio(); // Start immediately when the browser permits audible autoplay.
// Capture the target before menu rendering replaces it. Unlock during the click;
// navigation() plays after the destination has finished changing the world.
document.addEventListener('click', event => {
  const target=(event.target as Element).closest<HTMLButtonElement|HTMLAnchorElement>(
    '.brand, [data-adventure], #change-adventure, #leave-adventure-choice, #open-adventure, #open-training, #leave-adventure, [data-tab], [data-preset], #camp-home, #camp-exit, #camp-results-exit, #camp-colony-ready, #adventure-exit, [data-action="home"], [data-stage], #camp-start, [data-action="start"]',
  );
  if (target && !target.matches(':disabled')) void audio.navigation();
}, {capture:true});
const particles = new Particles(get<HTMLCanvasElement>("confetti"));
const surprises = new ThemeSurprises(get("theme-surprise"));
const themedKeypad = new ThemedKeypad(document.querySelector<HTMLElement>('.keypad')!);
get('menu-audio-enable').addEventListener('click',()=>{
  saved.muted=false;audio.setMuted(false);void audio.navigation();persist();renderPreferences();
});
function persistTraining(): boolean {
  try { trainingStored=saveTraining(playerStorage,trainingData); } catch { trainingStored=false; }
  return trainingStored;
}
const camp = new TrainingUI(trainingData,()=>{ const stored=persistTraining(); audio.voiceStyle=trainingData.settings.voice; return stored; },()=>{ studySkill=null; trainingActive=true; start(); },()=>showLanding(),()=>{
  const entries=Object.entries(saved.records);
  return entries.length ? `<table class="camp-records"><caption>Meilleurs résultats par réglage</caption><thead><tr><th scope="col">Séance</th><th scope="col">Temps</th><th scope="col">Erreurs</th></tr></thead><tbody>${entries.map(([key,r])=>{
    const [mode,tables,count,duration,lives]=key.split('-');
    const tableCount=Number(tables), lifeCount=Number(lives);
    return `<tr><th scope="row"><strong>${modes[mode as Mode]?.name??'Ancienne partie'}</strong><span>${Number(count)} calculs${tableCount?` · ${tableCount} table${tableCount===1?'':'s'}`:''}</span><span>Chrono ${Number(duration)} s · ${lifeCount} vie${lifeCount===1?'':'s'}</span></th><td>${formatTime(r.timeMs)}</td><td>${r.mistakes}</td></tr>`;
  }).join('')}</tbody></table>` : '<p>Aucun ancien record enregistré.</p>';
});
get('home').before(camp.root);
const profileUI=new ProfileUI(profiles,()=>{
  cacheAdventure(); saved=readSaved(playerStorage);
  Object.assign(trainingData,readTraining(playerStorage,playerStorage.getItem('multipli-party:v1')?saved:undefined));
  if(profiles.active.adaptive&&!playerStorage.getItem('calcul-party:training:v1'))trainingData.settings=basicSettings(profiles.active.grade);
  trainingStored=profiles.stored;
  for(const adventure of adventures)adventureSaves.set(adventure.id,{progress:readAdventure(playerStorage,adventure),stored:profiles.stored});
  adventureProgress=adventureSaves.get(activeAdventure.id)!.progress;adventureStored=profiles.stored;
  audio.setMuted(saved.muted);showLanding();renderPreferences();
});
document.querySelector('.header-right')!.prepend(profileUI.button);
const learningUI=new LearningUI(profiles,(skill,grade,level)=>{studySkill=skill.id;studyGrade=grade;studyLevel=level;trainingActive=true;start();});
camp.root.before(learningUI.root);
get('play').insertAdjacentHTML('beforeend',`<div id="camp-cargo" class="camp-cargo" hidden>${ant()}<span id="camp-cargo-label"></span></div>`);
get('victory-description').insertAdjacentHTML('afterend','<div id="camp-victory" class="camp-victory-scene" hidden></div>');
get('pause-panel').insertAdjacentHTML('beforeend','<button id="camp-exit" class="secondary-button" type="button" hidden>Retour au camp · garder mes matériaux</button>');
get('results').querySelector('.result-actions')!.insertAdjacentHTML('beforeend','<button id="camp-results-exit" class="secondary-button" type="button" hidden>Retour au camp</button>');
get('camp-results-exit').insertAdjacentHTML('afterend','<button id="camp-colony-ready" class="play-button" type="button" hidden>Un chantier est prêt ! Aller construire →</button>');
function openCamp(tab: 'workshop'|'colony' = 'workshop'): void {
  trainingActive=false; studySkill=null; activeStage=null; mapOpen=false; chooserOpen=false; campOpen=true; previewVictory=false;
  audio.stopSpeech(); surprises.clear(); game=createGame(); previousPhase='finished';
  get('board').classList.remove('adventure-playing','untimed-playing');
  persistTraining(); applyTheme(); render(performance.now()); camp.open(tab,trainingStored); camp.root.before(learningUI.root); learningUI.open();
}
function showLanding(): void {
  campOpen=false; trainingActive=false; studySkill=null; activeStage=null; mapOpen=false; chooserOpen=false; previewVictory=false;
  audio.stopSpeech(); surprises.clear(); game=createGame(); previousPhase='finished';
  get('board').classList.remove('adventure-playing','untimed-playing');
  applyTheme(); render(performance.now()); get('open-training').focus();
}
get('open-training').addEventListener('click',()=>openCamp());
get('camp-exit').addEventListener('click',()=>openCamp());
get('camp-results-exit').addEventListener('click',()=>openCamp());
get('camp-colony-ready').addEventListener('click',()=>openCamp('colony'));
function createGame(): Game {
  if(trainingActive && studySkill) {
    studyQuestions=generateStudyQuestions(studySkill,studyGrade,studyLevel??profiles.mental[studySkill]?.level??0,studyGrade==='GS'?5:10);
    return new Game({...defaults(),duration:profiles.active.mentalDuration??15,lives:5},Math.random,q=>!saved.voiceEnabled||saved.muted||audio.questionPrepared(q),{questions:studyQuestions,untimed:!profiles.active.mentalDuration,unlimitedLives:!profiles.active.mentalDuration,explicitAnswers:true,autoIntegers:true,retryAfter:3,onAnswer:(q,e)=>{recordMentalEvidence(profiles.mental,q.exercise!.patternId!,e,q.exercise!.patternLevel);profiles.save();}});
  }
  if (trainingActive) {
    const s=trainingData.settings;
    return new Game({...defaults(),duration:s.duration??10,lives:s.lives??3},Math.random,
      question=>!saved.voiceEnabled || saved.muted || audio.questionPrepared(question),
      {questions:trainingQuestions(s),untimed:s.duration===null,unlimitedLives:s.lives===null,onAnswer:(q,e)=>{
        const id=q.operation==='multiply'?'tables':q.operation==='add'?s.add.max<=10?'small-add':'add':s.subtract.max<=10?'small-subtract':'subtract';
        recordEvidence(profiles.active.mastery,id,e);profiles.save();
      }});
  }
  if(activeStage?.study) {
    return new Game({...defaults(),duration:profiles.active.mentalDuration??15,lives:5},Math.random,q=>!saved.voiceEnabled||saved.muted||audio.questionPrepared(q),{questions:adaptiveQuestions(activeStage,profiles.mental),untimed:!profiles.active.mentalDuration,unlimitedLives:!profiles.active.mentalDuration,explicitAnswers:true,autoIntegers:true,retryAfter:3,victoryDurationMs:MISSION_REWARD_MS,onAnswer:(q,e)=>{recordMentalEvidence(profiles.mental,q.exercise!.patternId!,e,q.exercise!.patternLevel);profiles.save();}});
  }
  const duration = activeStage ? adventureDurations[activeStage.world.id] : null;
  const lives = activeStage ? adventureLives[activeStage.world.id] : null;
  return new Game({...saved,duration:duration ?? saved.duration,lives:lives ?? saved.lives}, Math.random, question =>
    !saved.voiceEnabled || saved.muted || audio.questionPrepared(question),
    activeStage ? {questions:adventureQuestions(activeStage),untimed:duration === null,unlimitedLives:lives === null,victoryDurationMs:MISSION_REWARD_MS} : undefined);
}
function prepareUpcomingQuestions(): void {
  if (saved.voiceEnabled && !saved.muted) {
    audio.prepareQuestions([...(game.current ? [game.current] : []), ...game.upcomingQuestions]);
  }
}
let game = createGame();
let previousPhase = game.phase;
let previousQuestion = -1;
let previousFeedback: typeof game.feedback = null;
let lastCountdown = -1;
let lastWarning = -1;
let renderedAnswer = "";
let recordProcessed = false;
let previewVictory = false;
let previewEndsAt = 0;
let lastPosition = -1;
let previousFocus: HTMLElement | null = null;
const positions = [
  [-0.85, -0.8],
  [0.85, 0.7],
  [-0.7, 0.8],
  [0.75, -0.7],
  [0, 0.05],
];
const difficultyNames = { 5: "Turbo", 10: "Tempo", 15: "Tranquille", 30: "Détente" };
const keypadButtons = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-digit], #erase"),
];

function positionQuestion(): void {
  if (lastPosition < 0) return;
  const area = get("question-area");
  const content = get("question-content");
  const [x, y] = positions[lastPosition];
  // Keep a safety margin for the chalk tilt and recalculate on tablet rotation.
  const travelX = Math.max(
    0,
    (area.clientWidth - content.offsetWidth) / 2 - 18,
  );
  const travelY = Math.max(
    0,
    (area.clientHeight - content.offsetHeight) / 2 - 14,
  );
  content.style.transform = `translate(${Math.round(x * travelX)}px, ${Math.round(y * travelY)}px) rotate(${x > 0 ? -1.5 : 1}deg)`;
}
new ResizeObserver(positionQuestion).observe(get("question-area"));

function persist(): boolean {
  try {
    return saveData(playerStorage, saved);
  } catch {
    return false;
  }
}
function applyTheme(): void {
  const landing = !previewVictory && !activeStage && !campOpen && !trainingActive && !mapOpen;
  const id = activeStage?.world.id ?? (campOpen || trainingActive ? 'ant' : previewVictory ? mapOpen ? activeAdventure.hero : saved.theme : mapOpen ? activeAdventure.hero : landing ? 'kitten' : saved.theme);
  const theme = themes[id];
  get('board').classList.toggle('pico-playing',!!activeStage && activeAdventure.id==='pico');
  document.documentElement.dataset.theme = landing ? 'club' : id;
  document.documentElement.style.setProperty("--dance-beat", `${120 / theme.music.bpm}s`);
  get("sad-mascot").innerHTML = theme.sad;
  get("dance-mascot").innerHTML = theme.dance;
  get("theme-scenery").innerHTML = landing ? '' : theme.scenery;
  document.querySelector(".victory-stage")!.setAttribute("aria-label", theme.victoryLabel);
  document.querySelector(".result-star")!.innerHTML = theme.home;
  audio.voiceStyle = campOpen || trainingActive ? trainingData.settings.voice : saved.themeVoices[id];
  surprises.setTheme(id);
  themedKeypad.setTheme(id);
  audio.setTheme(id);
  particles.setTheme(id);
}
let newlyUnlockedMissions: string[] = [];
let clearUnlockReveal = () => {};
function showMap(): void {
  clearUnlockReveal();
  const original=adventures.find(a=>a.id===activeAdventure.id)!;
  activeAdventure=profiles.active.adaptive?adaptedAdventure(original,profiles.active.grade,profiles.mental,profiles.active.mentalDuration??null):original;
  worlds=activeAdventure.worlds;stages=activeAdventure.stages;
  activeStage = null; mapOpen = true; chooserOpen=false; previewVictory = false; campOpen=false; trainingActive=false;
  audio.stopSpeech(); surprises.clear();
  game = createGame(); previousPhase = 'finished';
  adventureMap.innerHTML = mapMarkup(adventureProgress,adventureStored,activeAdventure);
  applyTheme(); render(performance.now());
  get('map-title').focus();
}
function showAdventureChoice():void {
  clearUnlockReveal(); newlyUnlockedMissions=[];cacheAdventure();
  activeFinale.close();activeStage=null;mapOpen=false;chooserOpen=true;campOpen=false;trainingActive=false;previewVictory=false;
  audio.stopSpeech();surprises.clear();game=createGame();previousPhase='finished';
  adventureChoice.innerHTML=`<span class="eyebrow">DEUX HISTOIRES, TES PROPRES DÉCOUVERTES</span><h1 id="choice-title" tabindex="-1">Quelle aventure aujourd’hui ?</h1><p>Chaque aventure garde ses missions sur cet appareil. Le camp des fourmis reste indépendant.</p><div class="adventure-choice-grid">${adventures.map(a=>{
    const save=adventureSaves.get(a.id)!;
    return `<article class="adventure-choice-card" data-choice="${a.id}"><div class="choice-portrait" aria-hidden="true">${themes[a.hero].home}</div><h2>${a.title}</h2><p>${a.description}</p><p class="choice-progress"><strong>${save.progress.completed.length} / 24</strong> missions · ${a.worlds.filter(w=>worldFinished(save.progress,w.id,a)).length} / 8 amis${save.stored?'':' · Pour cette visite'}</p><button type="button" class="play-button" data-adventure="${a.id}">${save.progress.completed.length?'Continuer':'Commencer'} →</button></article>`;
  }).join('')}</div><button id="leave-adventure-choice" type="button" class="secondary-button">← Accueil</button>`;
  applyTheme();render(performance.now());get('choice-title').focus();
}
adventureChoice.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('button');if(!button)return;
  if(button.id==='leave-adventure-choice'){showLanding();get('open-adventure').focus();return;}
  const adventure=adventures.find(a=>a.id===button.dataset.adventure);if(!adventure)return;
  cacheAdventure();activeAdventure=adventure;worlds=adventure.worlds;stages=adventure.stages;
  const save=adventureSaves.get(adventure.id)!;adventureProgress=save.progress;adventureStored=save.stored;
  activeFinale=adventure.finale==='lighthouse'?lighthouseParty:kittenBirthday;
  get('adventure-guests').innerHTML=worlds.map(w=>themes[w.id].home).join('');showMap();
});
get('open-adventure').addEventListener('click',showAdventureChoice);
get('adventure-exit').addEventListener('click',showMap);
adventureMap.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button || button.disabled) return;
  if (button.id === 'reset-adventure') {
    if (!window.confirm('Recommencer l’aventure depuis le début ?\n\nToutes les missions accomplies et les amis débloqués seront effacés sur cet appareil. Les réglages du camp, ses matériaux et les anciens records seront conservés.\n\nCette action ne peut pas être annulée.')) return;
    let reset = false;
    try { reset = resetAdventure(playerStorage,activeAdventure); } catch { /* Access to storage can itself be blocked. */ }
    if (!reset) {
      adventureMap.querySelector('.adventure-save')!.textContent = 'Impossible d’effacer la sauvegarde : le navigateur bloque le stockage. Ta progression est conservée. Tu peux réessayer.';
      return;
    }
    adventureProgress = {completed:[]}; adventureStored = true;cacheAdventure();
    showMap();
    adventureMap.querySelector('.adventure-save')!.textContent = `Les missions de ${activeAdventure.title} ont été réinitialisées. Une nouvelle aventure commence !`;
    return;
  }
  if(button.id==='change-adventure'){showAdventureChoice();return;}
  if (button.id === 'leave-adventure') {
    mapOpen = false; applyTheme(); goHome(); get('open-adventure').focus(); return;
  }
  if (button.id === 'celebrate-adventure') {
    if (adventureProgress.completed.length !== stages.length || activeFinale.active) return;
    showFinale(); return;
  }
  const stage = stages.find(s => s.id === button.dataset.stage);
  if (!stage || !stageUnlocked(adventureProgress,stage,activeAdventure)) return;
  clearUnlockReveal(); newlyUnlockedMissions = [];
  activeStage = stage; mapOpen = false; applyTheme(); start();
});
applyTheme();
function renderPreferences(): void {
  get("sound").innerHTML = saved.muted ? icons.mute : icons.sound;
  get("sound").setAttribute(
    "aria-label",
    saved.muted ? "Activer le son" : "Couper le son",
  );
  get("sound").setAttribute("aria-pressed", String(saved.muted));
  get("voice").setAttribute("aria-pressed", String(saved.voiceEnabled));
  get("voice").setAttribute(
    "aria-label",
    saved.voiceEnabled ? "Couper la voix" : "Activer la voix",
  );
  get("voice").title = saved.voiceEnabled
    ? "Lecture automatique des calculs activée"
    : "Lecture automatique des calculs désactivée";
  if (trainingActive) {
    get('victory-goal').textContent = `${game.totalQuestions} SUR ${game.totalQuestions} · BRAVO LES FOURMIS !`;
    get('victory-description').textContent = `${game.totalQuestions} ${game.totalQuestions===1?'matériau apporté':'matériaux apportés'} à la fourmilière !`;
  }
  if (activeStage) {
    get('victory-goal').textContent = `${game.totalQuestions} SUR ${game.totalQuestions} · MISSION ACCOMPLIE`;
    get('victory-description').textContent = activeStage.index === 2 ? activeStage.world.souvenir : `${activeStage.name} : bravo, c’est fait !`;
  } else if (mapOpen) {
    get('victory-goal').textContent = 'LES HUIT AMIS SONT RÉUNIS';
    get('victory-description').textContent = activeAdventure.endingDescription;
  }
}

function start(): void {
  if (trainingActive && !studySkill && inspectTraining(trainingData.settings).error) { openCamp('workshop'); return; }
  audio.homeMusic(false);
  creditedMaterials=0;
  get('camp-cargo-label').textContent='Chaque calcul réussi apporte un matériau.';
  get('camp-exit').hidden=!trainingActive;
  get('camp-results-exit').hidden=!trainingActive;
  if (activeStage) missionReward.preload(activeStage);
  surprises.reset();
  previewVictory = false;
  audio.stopSpeech();
  game = createGame();
  game.start(performance.now());
  renderPreferences();
  get('board').classList.toggle('adventure-playing', !!activeStage);
  get('board').classList.toggle('untimed-playing', game.untimed);
  get('adventure-exit').hidden = !activeStage;
  get('pause-panel').querySelector('p')!.textContent = game.unlimitedLives ? 'Tes calculs t’attendent. Prends ton temps !' : 'Ton temps et tes vies t’attendent.';
  document.querySelector('.lives-group .small-label')!.textContent = game.unlimitedLives ? 'TES ESSAIS' : 'TES VIES';
  const startedGame = game;
  void audio.unlock().then(() => {
    if (game === startedGame) prepareUpcomingQuestions();
  });
  get("hearts").innerHTML = Array.from(
    { length: game.startingLives },
    (_, i) => `<span data-heart="${i}">${icons.heart}</span>`,
  ).join("");
  if (game.unlimitedLives) get('hearts').innerHTML = '<span class="practice-heart">∞</span><span class="practice-label">À volonté</span>';
  previousPhase = "welcome";
  previousQuestion = -1;
  previousFeedback = null;
  lastCountdown = -1;
  lastWarning = -1;
  recordProcessed = false;
  get("difficulty-label").textContent =
    trainingActive&&studySkill ? `${studyGrade} · ${mentalPatternById(studySkill)?.title} · ${game.untimed?'Sans chrono · Essais illimités':`${game.duration} s · 5 vies`}` : trainingActive ? trainingLabel(trainingData.settings) : activeStage ? `${activeStage.world.name} · ${activeStage.name} · ${activeStage.study?(game.untimed?'Sans chrono · Essais illimités':`${game.duration} s · 5 vies`):`${adventureTimeLabel(activeStage.world.id)} · ${adventureLivesLabel(activeStage.world.id)}`}` : '';
  get("time-progress").setAttribute("aria-valuemax", String(game.duration));
  get("progress").setAttribute("aria-valuemax", String(game.totalQuestions));
  get("progress-goal").textContent = String(game.totalQuestions);
  render(performance.now());
}

document
  .querySelectorAll<HTMLButtonElement>('[data-action="start"]')
  .forEach((button) => button.addEventListener("click", start));
function previewVictoryAnimation(): void {
  if (game.phase !== "welcome" || previewVictory) return;
  void audio.unlock().then(() => {
    if (game.phase !== "welcome" || previewVictory) return;
    previewVictory = true;
    applyTheme();renderPreferences();
    previewEndsAt = performance.now() + VICTORY_DURATION_MS;
    render(performance.now());
  });
}
function goHome(): void {
  if (activeFinale.active) activeFinale.close();
  if (previewVictory) return;
  // The brand is only a home link outside an active game; no accidental loss of progress.
  if (!["welcome", "finished"].includes(game.phase)) {
    pause();
    return;
  }
  if (trainingActive) { openCamp('workshop'); return; }
  if (campOpen || mapOpen || chooserOpen) { showLanding(); return; }
  if (activeStage) {
    const unlocked = newlyUnlockedMissions;
    newlyUnlockedMissions = [];
    showMap();
    clearUnlockReveal = revealUnlockedMissions(adventureMap, unlocked, () => audio.missionUnlocked());
    return;
  }
  showLanding();
}
get("sound").addEventListener("click", () => {
  saved.muted = !saved.muted;
  audio.setMuted(saved.muted);
  activeFinale.setMuted(saved.muted);
  void audio.unlock().then(() => {
    prepareUpcomingQuestions();
    if (!saved.muted) speakCurrentQuestion(true);
  });
  persist();
  renderPreferences();
});
function speakCurrentQuestion(retry = false): void {
  if (
    game.phase === "question" &&
    game.current &&
    saved.voiceEnabled &&
    !saved.muted
  ) {
    audio.speakQuestion(game.current, retry);
  }
}
get("voice").addEventListener("click", () => {
  saved.voiceEnabled = !saved.voiceEnabled;
  if (!saved.voiceEnabled) audio.stopSpeech();
  else void audio.unlock().then(() => {
    prepareUpcomingQuestions();
    speakCurrentQuestion(true);
  });
  persist();
  renderPreferences();
});
get("repeat-question").addEventListener("click", () => speakCurrentQuestion(true));
get("skip-voice").addEventListener("click", () => {
  saved.voiceEnabled = false;
  audio.stopSpeech();
  persist();
  renderPreferences();
});

function react(kind: "correct" | "error", label: string): void {
  const reaction = get("reaction");
  reaction.textContent = label;
  reaction.className = `game-reaction ${kind}`;
  get("board").classList.remove("reaction-correct", "reaction-error");
  void reaction.offsetWidth;
  reaction.classList.add("is-active");
  get("board").classList.add(`reaction-${kind}`);
}
document.querySelector(".brand")!.addEventListener("click", (event) => {
  event.preventDefault();
  goHome();
});
document
  .querySelector('[data-action="home"]')!
  .addEventListener("click", goHome);
function pause(): void {
  previousFocus = document.activeElement as HTMLElement;
  game.pause(performance.now());
  render(performance.now());
}
get("pause").addEventListener("click", pause);
get("resume").addEventListener("click", () => {
  void audio.unlock().then(prepareUpcomingQuestions);
  game.resume(performance.now());
  lastCountdown = -1;
  render(performance.now());
});
const answerUI=new AnswerUI(value=>{game.setAnswer(value,performance.now());render(performance.now());},value=>{game.submitAnswer(value,performance.now());render(performance.now());},()=>game.useHint());
get('answer').after(answerUI.root);
function digit(value: string): void {
  if (game.phase !== "question") return;
  if (game.explicitAnswers ? answerUI.append(value) : game.digit(value, performance.now())) {
    audio.key();
    themedKeypad.press(value);
  }
  render(performance.now());
}
document
  .querySelectorAll<HTMLButtonElement>("[data-digit]")
  .forEach((button) =>
    button.addEventListener("click", () => digit(button.dataset.digit!)),
  );
get("erase").addEventListener("click", () => {
  if (game.explicitAnswers ? answerUI.erase() : game.erase(performance.now())) themedKeypad.erase();
  render(performance.now());
});
document.addEventListener("keydown", (event) => {
  if (activeFinale.active) {
    if (event.key === 'Escape') {
      event.preventDefault(); activeFinale.close(); returnFromFinale();
    }
    return;
  }
  if (
    event.ctrlKey &&
    event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "v" &&
    game.phase === "welcome" &&
    !previewVictory
  ) {
    event.preventDefault();
    previewVictoryAnimation();
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if(game.explicitAnswers && (event.target as Element).closest('#study-answer') && event.key!=='Escape'){
    if(game.phase==='question'&&(event.target instanceof HTMLInputElement)){
      if(/^\d$/.test(event.key)){event.preventDefault();digit(event.key);}
      else if(event.key==='Backspace'){event.preventDefault();if(answerUI.erase())themedKeypad.erase();render(performance.now());}
    }
    return;
  }
  if(game.explicitAnswers && game.phase==='question' && event.key==='Enter'){event.preventDefault();game.submitAnswer(game.answer,performance.now());render(performance.now());return;}
  if(game.explicitAnswers && game.phase==='question' && ['-','−',',','.','/',';'].includes(event.key)){event.preventDefault();game.setAnswer(game.answer+event.key,performance.now());render(performance.now());return;}
  if (/^\d$/.test(event.key) && game.phase === "question") {
    event.preventDefault();
    digit(event.key);
  } else if (event.key === "Backspace" && game.phase === "question") {
    event.preventDefault();
    if (game.explicitAnswers ? answerUI.erase() : game.erase(performance.now())) themedKeypad.erase();
    render(performance.now());
  } else if (
    event.key === "Escape" &&
    ["question", "countdown", "preparing", "feedback"].includes(game.phase)
  ) {
    event.preventDefault();
    pause();
  } else if (event.key === "Tab" && game.phase === "paused") {
    event.preventDefault();
    const exit = get('adventure-exit');
    ((activeStage || trainingActive) && document.activeElement === get('resume') ? trainingActive ? get('camp-exit') : exit : get('resume')).focus();
  }
});
document.addEventListener("visibilitychange", () => {
  activeFinale.setBackground(document.hidden);
  document.documentElement.classList.toggle('camp-background',document.hidden);
  if ((activeStage || trainingActive) && game.phase === 'victory') {
    if (document.hidden) game.suspendCelebration(performance.now());
    else game.resumeCelebration(performance.now());
    audio.suspendReward(document.hidden);
    return;
  }
  if (document.hidden) {
    audio.stopSpeech();
    pause();
    audio.ambience(false, game.solved, false);
  }
});
window.addEventListener("pagehide", () => {
  activeFinale.setBackground(true);
  document.documentElement.classList.add('camp-background');
  audio.stopSpeech();
  if ((activeStage || trainingActive) && game.phase === 'victory') { game.suspendCelebration(performance.now()); audio.suspendReward(true); }
  game.pause(performance.now());
});
window.addEventListener('pageshow', () => {
  activeFinale.setBackground(document.hidden);
  document.documentElement.classList.toggle('camp-background',document.hidden);
  if ((activeStage || trainingActive) && game.phase === 'victory' && !document.hidden) { game.resumeCelebration(performance.now()); audio.suspendReward(false); }
});

function renderResults(now: number): void {
  if (trainingActive) {
    if (recordProcessed) return;
    recordProcessed=true;
    const won=game.solved===game.totalQuestions;
    const s=trainingData.settings;
    let recordText='Une séance pour progresser à ton rythme.';
    if (won && !studySkill && s.duration!==null && s.lives!==null) {
      const key=trainingRecordKey(s), score={timeMs:game.elapsed(now),mistakes:game.mistakes};
      const best=trainingData.records[key];
      if (!best || score.timeMs<best.timeMs) { trainingData.records[key]=score; persistTraining(); }
      recordText=`Ton meilleur temps pour ces réglages : ${formatTime(trainingData.records[key].timeMs)}.`;
    }
    get('result-eyebrow').textContent='LA FOURMILIÈRE GRANDIT AVEC TOI';
    get('result-title').textContent=won?'Bravo, petite fourmi !':'Chaque petit pas compte !';
    get('result-description').textContent=`${creditedMaterials} ${creditedMaterials===1?'matériau gagné':'matériaux gagnés'} · ${colonyStatus(trainingData).stock} dans ta réserve. À toi de lancer les travaux dans la fourmilière !`;
    get('result-solved').textContent=String(game.solved);
    get('result-total').textContent=`sur ${game.totalQuestions} réussis`;
    get('result-time').textContent=formatTime(game.elapsed(now));
    get('result-mistakes').textContent=String(game.mistakes);
    get('result-streak').textContent=String(game.bestStreak);
    get('last-correction').hidden=true;
    get('result-record').textContent=recordText+(trainingStored?'':' Pour cette visite seulement : stockage indisponible.');
    const replay=get('results').querySelector<HTMLButtonElement>('[data-action="start"]')!;
    const edit=get('results').querySelector<HTMLButtonElement>('[data-action="home"]')!;
    replay.textContent='Rejouer'; replay.className='play-button';
    edit.textContent='Modifier ma séance'; edit.className='secondary-button';
    replay.parentElement!.append(replay,edit,get('camp-results-exit'));
    replay.focus();
    return;
  }
  if (activeStage) {
    if (!recordProcessed) {
      const won = game.solved === game.totalQuestions;
      recordProcessed = true;
      get('result-eyebrow').textContent = won ? activeAdventure.id==='pico' ? 'UNE ÉTAPE DE PLUS VERS LE PHARE' : 'UNE ÉTAPE DE PLUS VERS LA FÊTE' : 'UN NOUVEL ESSAI T’ATTEND';
      get('result-title').textContent = won ? activeStage.index === 2 ? `${activeStage.world.friend} ${activeAdventure.id==='pico'?'rejoint l’équipage':'rejoint la fête'} !` : 'Mission accomplie !' : 'On retente la mission ?';
      get('result-description').textContent = won ? activeStage.index === 2 ? activeStage.world.souvenir : `${activeStage.name} : c’est réussi. La prochaine mission t’attend sur la carte.` : 'Tu n’as plus de vies. Recommence cette mission avec tous tes cœurs : les missions déjà gagnées restent acquises !';
      get('result-solved').textContent = String(game.solved);
      get('result-total').textContent = `sur ${game.totalQuestions} réussis`;
      get('result-time').textContent = formatTime(game.elapsed(now));
      get('result-mistakes').textContent = String(game.mistakes);
      get('result-streak').textContent = String(game.bestStreak);
      get('last-correction').hidden = true;
      get('result-record').textContent = `${adventureProgress.completed.length} / ${stages.length} missions · ${worlds.filter(w=>worldFinished(adventureProgress,w.id,activeAdventure)).length} amis réunis${adventureStored ? '' : ' · Pour cette visite seulement'}`;
      const replay = get('results').querySelector<HTMLButtonElement>('[data-action="start"]')!;
      replay.textContent = won ? 'Rejouer la mission' : 'Réessayer la mission';
      const next = get('results').querySelector<HTMLButtonElement>('[data-action="home"]')!;
      next.textContent = won ? 'Choisir ma prochaine destination →' : 'Retour à la carte';
      replay.className = won ? 'secondary-button' : 'play-button';
      next.className = won ? 'play-button' : 'secondary-button';
      replay.parentElement!.append(...(won ? [next, replay] : [replay, next]));
      (won ? next : replay).focus();
    }
    return;
  }

}

function render(now: number): void {
  if (trainingActive && game.solved>creditedMaterials) {
    creditedMaterials=awardMaterials(trainingData,game.solved,creditedMaterials);
    persistTraining();
    get('camp-cargo-label').textContent=`${creditedMaterials} ${creditedMaterials===1?'matériau apporté':'matériaux apportés'} · ${colonyStatus(trainingData).missing || 'Chantier prêt ! Clique dans la fourmilière'}${colonyStatus(trainingData).missing ? ' matériaux avant le prochain chantier' : ''}${trainingStored?'':' · Pour cette visite seulement'}`;
    get('camp-cargo').classList.remove('delivering');
    void get('camp-cargo').offsetWidth;
    get('camp-cargo').classList.add('delivering');
  }
  const phase = previewVictory ? "victory" : game.phase;
  get('camp-colony-ready').hidden=phase!=='finished' || !trainingActive || colonyStatus(trainingData).missing>0;
  const isPlaying = !["welcome", "defeat", "victory", "finished"].includes(phase);
  const overlay = phase === "countdown" || phase === "paused" || phase === "preparing";
  get("voice-unavailable").hidden =
    phase !== "question" || audio.speechStatus !== "unavailable";
  get("voice").classList.toggle(
    "is-speaking",
    audio.speechStatus === "speaking",
  );
  get("home").hidden = phase !== "welcome" || mapOpen || campOpen || chooserOpen;
  camp.root.hidden = phase !== 'welcome' || !campOpen;
  learningUI.root.hidden=camp.root.hidden || !profiles.active.adaptive;
  get('camp-cargo').hidden=!trainingActive || !isPlaying;
  get('camp-victory').hidden=!trainingActive || phase!=='victory';
  get('camp-results-exit').hidden=!trainingActive;
  adventureChoice.hidden=phase!=='welcome'||!chooserOpen||activeFinale.active;
  adventureMap.hidden = phase !== 'welcome' || !mapOpen || activeFinale.active;
  get("play").hidden = !isPlaying;
  themedKeypad.setActive(!document.hidden && (phase === 'question' || phase === 'feedback'));
  get("results").hidden = phase !== "finished";
  get("defeat").hidden = phase !== "defeat";
  get("victory").hidden = phase !== "victory";
  get('adventure-guests').hidden = phase !== 'victory' || !!activeStage || !(adventureProgress.completed.length === stages.length && mapOpen);
  get("overlay").hidden = !overlay;
  get("play").inert = overlay;
  get("countdown-panel").hidden = phase !== "countdown";
  get("preparing-panel").hidden = phase !== "preparing";
  get("pause-panel").hidden = phase !== "paused";
  get("board").classList.toggle("is-game", isPlaying);
  document
    .querySelector(".brand")!
    .setAttribute(
      "aria-label",
      previewVictory
        ? "Danse de victoire en cours"
        : isPlaying
          ? "Mettre la partie en pause"
          : "Calcul’Party, accueil",
    );
  profileUI.button.disabled=isPlaying || phase==='victory' || phase==='defeat' || activeFinale.active;
  if (phase !== previousPhase) {
    if (phase !== 'victory') { missionReward.clear(); get('victory').classList.remove('mission-victory'); }
    if (!["question", "feedback"].includes(phase)) surprises.clear();
    if (phase !== "feedback") get("board").classList.remove("magic-celebration");
    if (phase !== "question") audio.stopSpeech();
    else {
      get("board").classList.remove("reaction-correct", "reaction-error");
      get("reaction").classList.remove("is-active");
      if (previousQuestion === game.questionNumber) speakCurrentQuestion();
    }
    if (phase === "defeat") {
      get("board").classList.remove("reaction-correct", "reaction-error");
      if (saved.voiceEnabled) { audio.disappointment(); if (saved.theme !== "star") audio.end(); }
      else audio.end();
      get("defeat").focus({ preventScroll: true });
    }
    if (phase === "victory") {
      const availableBefore = new Set(stages.filter(stage => stageUnlocked(adventureProgress, stage,activeAdventure)).map(stage => stage.id));
      if (activeStage && !previewVictory && completeStage(adventureProgress,activeStage,activeAdventure)) {
        newlyUnlockedMissions = stages.filter(stage => !availableBefore.has(stage.id) && stageUnlocked(adventureProgress, stage,activeAdventure)).map(stage => stage.id);
        try { adventureStored = saveAdventure(playerStorage,adventureProgress,activeAdventure); } catch { adventureStored = false; } cacheAdventure();
      }
      get("board").classList.remove("reaction-correct", "reaction-error");
      const mission = activeStage && !previewVictory;
      get('victory').classList.toggle('mission-victory',!!mission);
      if (mission) missionReward.show(activeStage!);
      if (trainingActive) get('camp-victory').innerHTML=campScene(colonyStatus(trainingData).built,colonyStatus(trainingData).stars)+`<div class="camp-victory-builder">${ant()}</div>`;
      audio.victoryDance(mission ? MISSION_REWARD_MS : undefined);
      particles.burst(true);
      get("victory").focus({ preventScroll: true });
    }
    if (phase === "paused") get("resume").focus({ preventScroll: true });
    if (phase === "preparing") get("skip-voice").focus({ preventScroll: true });
    if (phase === "question" && (previousPhase === "countdown" || previousPhase === "preparing")) {
      if (previousFocus?.isConnected && previousFocus.closest("#play"))
        previousFocus.focus({ preventScroll: true });
      else get("pause").focus({ preventScroll: true });
    }
    previousPhase = phase;
  }
  if (phase === 'victory' && activeStage && !previewVictory) missionReward.update(game.victoryElapsed(now));
  if (phase === "countdown") {
    const count = game.countdown(now);
    if (lastCountdown !== count) {
      get("countdown").textContent = String(count);
      get("countdown").classList.remove("pop");
      void get("countdown").offsetWidth;
      get("countdown").classList.add("pop");
      audio.countdown(count);
      lastCountdown = count;
    }
  }
  if (!isPlaying) {
    if (phase === "finished") renderResults(now);
    return;
  }

  get("hearts").setAttribute(
    "aria-label",
    game.unlimitedLives ? 'Essais illimités' : `${game.lives} vie${game.lives > 1 ? "s" : ""} restante${game.lives > 1 ? "s" : ""}`,
  );
  document
    .querySelectorAll<HTMLElement>("[data-heart]")
    .forEach((heart) =>
      heart.classList.toggle("lost", Number(heart.dataset.heart) >= game.lives),
    );
  get("elapsed").textContent = formatTime(game.elapsed(now));
  get("streak").textContent =
    game.streak >= 3
      ? `${game.streak} à la suite. Ça pétille !`
      : "À toi de briller !";
  get("progress").setAttribute("aria-valuenow", String(game.solved));
  const progressPercent = (game.solved / game.totalQuestions) * 100;
  get("progress-fill").style.setProperty("--progress", `${progressPercent}%`);
  get("progress-percent").textContent = `${Math.round(progressPercent)} %`;
  get("progress-caption").textContent =
    `${game.solved} / ${game.totalQuestions}`;
  keypadButtons.forEach((button) => {
    button.disabled = phase !== "question";
  });
  get<HTMLButtonElement>("repeat-question").disabled =
    phase !== "question" || !saved.voiceEnabled || saved.muted;
  const left = game.untimed ? 0 : game.timeLeft(now);
  const seconds = Math.ceil(left / 1000);
  get("time-left").textContent = `${seconds} s`;
  get("time-fill").style.transform =
    `scaleX(${Math.min(1, left / (game.duration * 1000))})`;
  get("time-progress").setAttribute("aria-valuenow", String(seconds));
  get("time-box").classList.toggle(
    "urgent",
    !game.untimed && phase === "question" && seconds <= 3,
  );
  if (
    !game.untimed && phase === "question" &&
    seconds <= 3 &&
    seconds > 0 &&
    lastWarning !== seconds
  ) {
    audio.warning();
    lastWarning = seconds;
  }

  if (game.current && previousQuestion !== game.questionNumber) {
    previousQuestion = game.questionNumber;
    lastWarning = -1;
    const candidates = positions
      .map((_, i) => i)
      .filter((i) => i !== lastPosition);
    lastPosition = candidates[Math.floor(Math.random() * candidates.length)];
    get("equation").innerHTML = game.current.exercise ? escapeHtml(expression(game.current)) :
      `<span>${game.current.a}</span><span class="multiply-sign">${symbols[game.current.operation]}</span><span>${game.current.b}</span>`;
    answerUI.root.hidden=!game.explicitAnswers;
    get("board").classList.toggle("is-study",game.explicitAnswers);
    if(game.explicitAnswers){answerUI.show(game.current,game.autoInteger,game.hasNegativeIntegers);const visual=game.current.exercise?studyVisual(game.current.exercise):'';answerUI.root.insertAdjacentHTML('afterbegin',visual);}
    get("equation").setAttribute(
      "aria-label",
      spokenExpression(game.current),
    );
    get("question-announcement").textContent =
      game.explicitAnswers ? `${spokenExpression(game.current)}. Saisis ta réponse, puis valide.` : `${spokenExpression(game.current)}. ${String(game.current.result).length} chiffre${game.current.result < 10 ? "" : "s"} à saisir.`;
    get("answer").innerHTML = [...String(game.current.result)]
      .map((_, i) => `<span class="answer-slot" data-slot="${i}"></span>`)
      .join("");
    get("correction-card").hidden = true;
    get("question-area").classList.remove("has-correction");
    renderedAnswer = "\0";
    get("question-area").classList.remove("chalk-write");
    void get("question-area").offsetWidth;
    get("question-area").classList.add("chalk-write");
    get("feedback").textContent = "Respire, tu sais le faire !";
    get("feedback").className = "feedback-line";
    get("question-caption").textContent = "À toi de trouver !";
    positionQuestion();
    if(game.explicitAnswers)(answerUI.root.querySelector<HTMLElement>('[data-choice]')??get<HTMLInputElement>('study-input-0')).focus({preventScroll:true});
    speakCurrentQuestion();
    prepareUpcomingQuestions();
  }
  if(game.explicitAnswers)answerUI.sync(game.answer,phase==='question');
  if (renderedAnswer !== game.answer) {
    get("answer")
      .querySelectorAll<HTMLElement>("[data-slot]")
      .forEach((slot, i) => {
        slot.textContent = game.answer[i] ?? "";
        slot.classList.toggle("filled", Boolean(game.answer[i]));
      });
    renderedAnswer = game.answer;
  }
  if (game.feedback && previousFeedback !== game.feedback) {
    previousFeedback = game.feedback;
    const { correct, timeout, pair } = game.feedback;
    get("feedback").className =
      `feedback-line ${correct ? "correct" : "incorrect"}`;
    if (correct) {
      const previousProgress = (game.solved - 1) / game.totalQuestions;
      const currentProgress = game.solved / game.totalQuestions;
      const milestone = [0.25, 0.5, 0.75].some(
        (threshold) => previousProgress < threshold && currentProgress >= threshold,
      );
      get("feedback").textContent = milestone
        ? `${game.solved} réussites ! Tu fais des étincelles !`
        : [
            "Bien joué !",
            "Dans le mille !",
            "Et une de plus !",
            "Trop fort !",
            "Ça, c’est du calcul !",
          ][game.solved % 5];
      get("question-caption").textContent = "Oui, c’est ça !";
      audio.success(milestone);
      particles.burst(milestone);
      if (game.phase === "feedback" && surprises.success(now)) audio.surprise();
      get("board").classList.toggle("magic-celebration", milestone);
      react(
        "correct",
        milestone
          ? "WAOUH !"
          : game.streak >= 3
            ? "COMBO !"
            : ["YES !", "BIM !", "BRAVO !"][game.solved % 3],
      );
    } else {
      surprises.clear();
      get("feedback").textContent = pair.exercise?`La réponse est ${resultLabel(pair)}.`:
        `${timeout ? "Temps écoulé !" : "Oups !"} ${expression(pair)} = ${resultLabel(pair)} · On le reverra.`;
      get("correct-result").textContent = `${resultLabel(pair)} !`;
      get('study-explanation').hidden=!pair.exercise;
      get('study-explanation').textContent=pair.exercise?.hint??'';
      get("correction-card").setAttribute(
        "aria-label",
        `Désolé, mais c’était ${resultLabel(pair)} !`,
      );
      get("correction-card").hidden = false;
      get("question-area").classList.add("has-correction");
      audio.error();
      get("board").classList.remove("reaction-correct");
      get("board").classList.add("reaction-error");
      get("question-area").classList.remove("shake");
      void get("question-area").offsetWidth;
      get("question-area").classList.add("shake");
    }
  }
}

renderPreferences();
render(performance.now());
// A shareable preview of the film; adventure progress is only read, never unlocked.
if (new URLSearchParams(location.search).get('fete') === '1') {
  showMap(); showFinale();
}
function frame(now: number): void {
  const inMenus=!activeFinale.active && !previewVictory && !trainingActive && !activeStage
    && game.phase==='welcome' && (campOpen || mapOpen || chooserOpen || !get('home').hidden);
  get('menu-audio-enable').hidden=!inMenus || (!saved.muted && audio.ready);
  audio.homeMusic(!document.hidden && inMenus);
  if (!document.hidden) {
    activeFinale.update(now);
    if (previewVictory && now >= previewEndsAt) {
      previewVictory = false;
      applyTheme();render(now);
      document
        .querySelector<HTMLButtonElement>('#open-training')
        ?.focus({ preventScroll: true });
    }
    game.tick(now);
    render(now);
    particles.frame(now);
    surprises.frame(now);
    audio.ambience(
      game.phase === "question" || game.phase === "feedback",
      Math.round(game.solved / game.totalQuestions * 100),
      !game.untimed && game.phase === "question" && game.timeLeft(now) <= 3000,
    );
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
