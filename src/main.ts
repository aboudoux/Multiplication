import "./style.css";
import { DEFEAT_DURATION_MS, VICTORY_DURATION_MS, Game } from "./game";
import { modes, usesTables, questionCount, symbols, expression, spokenExpression } from "./calculations";
import type { Duration, Mode, Length, GameSettings } from "./calculations";
import {
  defaults,
  formatTime,
  readSaved,
  recordKey,
  saveData,
  saveRecord,
} from "./storage";
import { GameAudio } from "./audio";
import { Particles } from "./particles";

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
const mascot = `<svg class="mascot" viewBox="0 0 360 290" fill="none" aria-hidden="true">
  <g stroke="#9ac9ad" stroke-width="2" opacity=".6"><path d="m35 49 4-11 5 11 12 3-12 4-5 11-4-11-11-4 11-3ZM290 168l4-9 3 9 10 4-10 3-3 9-4-9-9-3Z"/><path d="M288 65v16m-8-8h16M44 197v12m-6-6h12M114 17l5 8m130 213 8 5"/></g>
  <ellipse cx="178" cy="164" rx="130" ry="95" stroke="#9ac9ad" stroke-opacity=".25" stroke-dasharray="6 9" transform="rotate(-16 178 164)"/>
  <path d="m134 203-8 43-25 7m106-54 19 42 27 2" stroke="#ffe39a" stroke-width="5" stroke-linecap="round"/>
  <path d="M101 253q22-13 30-2l-1 9-32 1ZM229 242q24-6 30 11l-33 1Z" fill="#a5d7c1" stroke="#d3eee1" stroke-width="2"/>
  <path d="M105 145q-28 7-33-13m178 18q26 0 33-26" stroke="#ffe39a" stroke-width="5" stroke-linecap="round"/>
  <path d="m66 133 1-14m4 14 5-12m205 5-2-14m5 12 6-10" stroke="#ffe39a" stroke-width="3" stroke-linecap="round"/>
  <path d="m175 47 33 66 73 12-51 51 10 73-66-32-63 34 10-75-52-49 73-12Z" fill="#efc965" stroke="#ffe49a" stroke-width="4" stroke-linejoin="round"/>
  <path d="m178 57 28 62 65 10-47 47 10 63-60-28-57 31 10-70-48-42 67-10Z" stroke="#fff0b4" stroke-opacity=".4" stroke-width="1.5" stroke-linejoin="round"/>
  <ellipse cx="154" cy="151" rx="5" ry="9" fill="#294b3c"/><ellipse cx="194" cy="149" rx="5" ry="9" fill="#294b3c"/>
  <path d="M159 173q17 19 31-2" stroke="#294b3c" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="140" cy="171" rx="10" ry="5" fill="#e89772"/><ellipse cx="210" cy="169" rx="10" ry="5" fill="#e89772"/>
  <path d="m219 44 9-11m-1 26 15-3M109 81l-10-8" stroke="#ffdf87" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const dancingMascot = `<svg class="party-mascot" viewBox="0 0 360 310" fill="none" aria-hidden="true">
  <g class="party-left-leg"><path d="m137 220-10 48-21 5" stroke="#ffe89c" stroke-width="6" stroke-linecap="round"/><path d="M105 272q23-12 31 2l-2 9h-33Z" fill="#ff729e" stroke="#ffc1d3" stroke-width="2"/></g>
  <g class="party-right-leg"><path d="m204 220 13 48 22 4" stroke="#ffe89c" stroke-width="6" stroke-linecap="round"/><path d="M213 271q24-8 32 10h-34Z" fill="#57f4c7" stroke="#c2ffe9" stroke-width="2"/></g>
  <g class="party-left-arm"><path d="M111 147q-31-9-36-43m-3-3-12-8m17 9-3-14m7 16 8-11" stroke="#ffe89c" stroke-width="5" stroke-linecap="round"/></g>
  <g class="party-right-arm"><path d="M245 148q31-9 36-43m3-3 12-8m-17 9 3-14m-7 16-8-11" stroke="#ffe89c" stroke-width="5" stroke-linecap="round"/></g>
  <path d="m178 47 33 66 73 12-51 51 10 73-66-32-63 34 10-75-52-49 73-12Z" fill="#ffe54b" stroke="#fff2aa" stroke-width="5" stroke-linejoin="round"/>
  <path d="m178 58 28 61 65 11-47 46 10 62-57-28-56 31 9-68-48-43 64-10Z" stroke="#fff7cb" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"/>
  <path d="M143 148q11-13 22 0m29 0q11-13 22 0" stroke="#294b3c" stroke-width="5" stroke-linecap="round"/>
  <path d="M157 177q21 32 43-1" stroke="#294b3c" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="137" cy="170" rx="10" ry="6" fill="#ff98ac"/><ellipse cx="217" cy="169" rx="10" ry="6" fill="#ff98ac"/>
  <path d="m179 29 6-13m-20 13-9-9m30 13 11-8" stroke="#ffe54b" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const disappointedMascot = `<svg class="defeat-mascot" viewBox="0 0 360 320" fill="none" aria-hidden="true">
  <ellipse class="sad-shadow" cx="180" cy="291" rx="77" ry="10" fill="#052e354d"/>
  <g class="sad-star">
    <path d="m137 220-5 48-21 5m92-53 12 48 22 5" stroke="#ffe79d" stroke-width="5" stroke-linecap="round"/>
    <path d="M109 273q22-11 29 1l-1 8h-33ZM212 272q23-8 31 9h-33Z" fill="#88ddc2" stroke="#d3eee1" stroke-width="2"/>
    <path d="M111 149q-28 17-23 46m157-46q27 19 21 47" stroke="#ffe79d" stroke-width="5" stroke-linecap="round"/>
    <path d="m84 190 2 13m6-14 2 12m168-10-1 13m7-15 1 12" stroke="#ffe79d" stroke-width="3" stroke-linecap="round"/>
    <path d="m178 47 33 66 73 12-51 51 10 73-66-32-63 34 10-75-52-49 73-12Z" fill="#f3d36b" stroke="#ffe9a2" stroke-width="4" stroke-linejoin="round"/>
    <path d="m141 139 17-5m38 0 17 5" stroke="#345047" stroke-width="3" stroke-linecap="round"/>
    <path d="M145 155q7 9 14 0m38 0q7 9 14 0M164 189q13-13 26 0" stroke="#345047" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="141" cy="173" rx="10" ry="5" fill="#e99589"/><ellipse cx="214" cy="173" rx="10" ry="5" fill="#e99589"/>
    <path class="sad-tear" d="M210 164q-9 13-1 15 9-1 1-15Z" fill="#87deff"/>
  </g>
  <g class="sad-sparkles" stroke="#a0c8cc" stroke-width="2" stroke-linecap="round"><path d="m67 75 6 9m-18 3 11 3m226-17-7 10m15 5-10 2"/></g>
</svg>`;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="page-wrap">
    <div class="outside-note"><span class="little-star">✦</span> APPRENDRE, C’EST AUSSI JOUER.</div>
    <main class="wood-frame" aria-label="Calcul’Party">
      <div class="board" id="board">
        <header class="board-header">
          <a class="brand" href="#" aria-label="Calcul’Party, accueil"><span class="brand-mark">×</span><span>Calcul’Party<span class="brand-dot">.</span></span></a>
          <div class="header-right"><span class="arcade-label"><span></span> LE CLUB DU CALCUL</span><button class="voice-button" id="voice" type="button" aria-label="Couper la voix" aria-pressed="true">${icons.voice}<span>Voix</span></button><button class="icon-button" id="sound" type="button" aria-label="Couper le son" aria-pressed="false">${icons.sound}</button></div>
        </header>
        <p class="voice-notice" id="voice-unavailable" role="status" hidden>La voix n’a pas pu se charger. Tu peux réessayer avec « Réécouter ».</p>

        <section id="home" class="home-screen" aria-label="Accueil">
          <div class="home-hero">
            <div class="hero-copy">
              <span class="eyebrow"><span class="tiny-line"></span> À TES MARQUES. PRÊT·E ? CALCULE !</span>
              <h1>Les calculs font<br><span class="title-highlight">leur show !<svg viewBox="0 0 450 18" aria-hidden="true"><path d="M5 11Q188-1 440 6M40 17Q243 4 412 12"/></svg></span></h1>
              <p class="hero-description">Un peu de vitesse, beaucoup de malice.<br>Fais chauffer tes neurones et remplis le tableau !</p>
              <div class="hero-badges"><span>${icons.star} <span id="home-challenges">100 défis</span></span><span>${icons.heart} <span id="home-lives">3 vies</span></span><span>${icons.trophy} Ton record</span></div>
            </div>
            <div class="hero-art"><div class="art-scribble">6 × 7 = <span>42</span><svg viewBox="0 0 95 30" aria-hidden="true"><path d="M4 8Q45 28 84 8m-14-3 16 2-6 13"/></svg></div>${mascot}<span class="mascot-caption">Chaque réponse, une petite victoire !</span><div class="art-chalk-star">✧</div></div>
          </div>
          <fieldset class="mode-picker"><legend>Choisis ton terrain de jeu</legend><div class="mode-options">
            ${Object.entries(modes).map(([id, mode], i) => `<button type="button" class="mode-option" data-mode="${id}" aria-pressed="false"><span class="mode-symbol">${mode.symbol}</span><span class="mode-number">MODE ${i + 1}</span><strong>${mode.name}</strong><small>${mode.description}</small></button>`).join("")}
          </div></fieldset>
          <div class="how-to" aria-label="Comment jouer">
            <div><span class="step-number">1</span><p><strong>Observe le calcul.</strong><span><span id="mode-rule">Des additions jusqu’à 20.</span></span></p></div>
            <div><span class="step-number">2</span><p><strong>Tape ta réponse.</strong><span>Elle se valide toute seule. Magique !</span></p></div>
            <div><span class="step-number">3</span><p><strong id="home-goal">Vise les 100 !</strong><span>Une erreur ? −1 vie, puis réessaie plus tard.</span></p></div>
          </div>
          <div class="launch-panel">
            <label class="setup-field" for="length-select"><span>Nombre de calculs</span><select id="length-select"></select><small id="length-summary">20 calculs à réussir</small></label>
            <label class="setup-field" id="tables-field" for="tables-select"><span>${icons.star} Nombre de tables</span><select id="tables-select">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1} table${i ? "s" : ""}</option>`).join("")}</select><small id="tables-summary">Tables de 1 à 10 · jusqu’à ×10</small></label>
            <fieldset class="difficulty"><legend>${icons.clock} Ton temps par réponse</legend><div class="difficulty-options">${([5, 10, 15, 30] as const).map((d) => `<button class="duration-option" data-duration="${d}" type="button" aria-pressed="${d === 10}"><strong>${d}<small> s</small></strong><span>${d === 5 ? "Turbo" : d === 10 ? "Tempo" : d === 15 ? "Tranquille" : "Détente"}</span></button>`).join("")}</div></fieldset>
            <label class="setup-field" for="lives-select"><span>${icons.heart} Nombre de vies</span><select id="lives-select">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1} vie${i ? "s" : ""}</option>`).join("")}</select><small>De 1 à 10 vies · 3 par défaut</small></label>
            <div class="start-area"><button class="play-button" data-action="start" type="button">C’est parti ! ${icons.arrow}</button><span class="play-note" id="play-note">100 multiplications. À toi de briller.</span></div>
          </div>
          <div class="home-bottom"><span>${icons.trophy}<span id="home-record">Ton premier record t’attend !</span></span><span class="chalk-note">Tu connais plus de réponses que tu ne le crois.</span></div>
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
                <div class="correction-card" id="correction-card" role="alert" hidden><span class="correction-kicker">OUPS !</span><span class="correction-phrase">Désolé, mais c’était</span><strong id="correct-result"></strong><span class="correction-sparkle" aria-hidden="true">✦</span></div>
                <div class="game-reaction" id="reaction" aria-hidden="true"></div>
              </div>
              <div class="feedback-line" id="feedback" role="status" aria-live="polite">Respire, tu sais le faire !</div>
            </div>
            <div class="keypad-panel"><div class="keypad-label">LE BOUT DES DOIGTS, LE PLEIN D’IDÉES.</div><div class="keypad" aria-label="Pavé numérique">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-digit="${n}" aria-label="${n}">${n}</button>`).join("")}<span class="pad-star" aria-hidden="true">✦</span><button type="button" data-digit="0" aria-label="0">0</button><button type="button" id="erase" class="erase" aria-label="Effacer le dernier chiffre">${icons.erase}</button></div><p class="keypad-tip">Pas besoin d’Entrée.<br><strong>La réponse se valide toute seule !</strong></p></div>
            <aside class="progress-panel" aria-label="Progression"><div class="progress-title">OBJECTIF<br><strong id="progress-goal">100</strong></div><div class="thermometer" role="progressbar" id="progress" aria-label="Calculs réussis" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="thermo-track"><div id="progress-fill"></div><span class="thermo-tick tick-75"></span><span class="thermo-tick tick-50"></span><span class="thermo-tick tick-25"></span></div><div class="thermo-bulb">${icons.star}</div></div><strong id="progress-percent">0 %</strong><span class="progress-caption" id="progress-caption">0 / 100</span></aside>
          </div>
          <div class="game-footer"><span id="difficulty-label">TEMPO · 10 S PAR RÉPONSE</span><span>Un calcul réussi ne revient plus. Promis.</span></div>
        </section>

        <section id="defeat" class="defeat-screen" style="--defeat-duration: ${DEFEAT_DURATION_MS}ms" role="status" aria-live="polite" tabindex="-1" hidden>
          <span class="eyebrow">PLUS DE VIES POUR CETTE PARTIE</span>
          ${disappointedMascot}
          <h2>Ooooh…</h2>
          <p>Dommage… On fera mieux au prochain essai !</p>
          <div class="defeat-dots" aria-hidden="true"><span></span><span></span><span></span></div>
        </section>
        <section id="victory" class="victory-screen" style="--victory-duration: ${VICTORY_DURATION_MS}ms" role="status" aria-live="polite" tabindex="-1" hidden>
          <span class="eyebrow" id="victory-goal">100 SUR 100 · MISSION ACCOMPLIE</span>
          <div class="victory-stage" role="img" aria-label="L’étoile danse sous les projecteurs">
            <span class="party-light party-light-left"></span><span class="party-light party-light-right"></span>
            <span class="party-note party-note-one">♫</span><span class="party-note party-note-two">♪</span><span class="party-note party-note-three">♫</span>
            <span class="party-floor"></span><div class="dancing-star">${dancingMascot}</div>
          </div>
          <h2>Tu l’as fait !</h2>
          <p id="victory-description">100 calculs réussis. Danse de la victoire !</p>
        </section>
        <section id="results" class="results-screen" aria-label="Bilan de la partie" hidden>
          <div class="result-star" aria-hidden="true">${icons.star}</div><span class="eyebrow" id="result-eyebrow">CHAQUE ESSAI TE FAIT GRANDIR</span><h2 id="result-title">Bien joué !</h2><p id="result-description"></p><p class="last-correction" id="last-correction" hidden></p>
          <div class="result-stats"><div><strong id="result-solved">0</strong><span id="result-total">sur 100 réussies</span></div><div><strong id="result-time">0:00</strong><span>de réflexion</span></div><div><strong id="result-mistakes">0</strong><span>erreurs</span></div><div><strong id="result-streak">0</strong><span>à la suite</span></div></div>
          <div class="result-record" id="result-record"></div><div class="result-actions"><button class="play-button" data-action="start" type="button">On rejoue ! ${icons.arrow}</button><button class="secondary-button" data-action="home" type="button">Changer les réglages</button></div>
        </section>

        <div class="game-overlay" id="overlay" hidden><div id="countdown-panel"><span class="eyebrow" id="countdown-caption">LES CALCULS N’ONT QU’À BIEN SE TENIR</span><div class="countdown-number" id="countdown" role="status" aria-live="assertive">3</div><span class="countdown-note">Tes doigts sont prêts ?</span></div><div class="pause-panel" id="pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-title" hidden>${icons.pause}<h2 id="pause-title">Petite pause.</h2><p>Ton temps et tes vies t’attendent.</p><button class="play-button" id="resume" type="button">On continue ! ${icons.arrow}</button></div></div>
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
let saved = defaults();
try {
  saved = readSaved(localStorage);
} catch {
  /* Storage may be disabled entirely. */
}
const audio = new GameAudio();
audio.muted = saved.muted;
const particles = new Particles(get<HTMLCanvasElement>("confetti"));
let game = new Game(saved);
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
    return saveData(localStorage, saved);
  } catch {
    return false;
  }
}
function settingsLabel(settings: GameSettings): string {
  return `${modes[settings.mode].name} · ${questionCount(settings)} calculs${usesTables(settings.mode) ? ` · ${settings.tables} table${settings.tables > 1 ? "s" : ""}` : ""} · ${difficultyNames[settings.duration]} · ${settings.lives} vie${settings.lives > 1 ? "s" : ""}`;
}
function normalizeLength(): void {
  if (saved.mode !== "multiply" && saved.length === "all") saved.length = 20;
  if (saved.mode === "multiply" && questionCount(saved) > saved.tables * 10) saved.length = "all";
}
function renderPreferences(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.mode === saved.mode)));
  get("tables-field").hidden = !usesTables(saved.mode);
  get("mode-rule").textContent = modes[saved.mode].description + ".";
  get<HTMLSelectElement>("length-select").innerHTML = [20, 50, 100].map(n => `<option value="${n}" ${saved.mode === "multiply" && n > saved.tables * 10 ? "disabled" : ""}>${n} calculs</option>`).join("") + (saved.mode === "multiply" ? `<option value="all">Toute la série · ${saved.tables * 10} calculs</option>` : "");
  get<HTMLSelectElement>("length-select").value = String(saved.length);
  get("length-summary").textContent = `${questionCount(saved)} calculs distincts à réussir`;
  get<HTMLSelectElement>("tables-select").value = String(saved.tables);
  get<HTMLSelectElement>("lives-select").value = String(saved.lives);
  get("tables-summary").textContent =
    `Tables de 1 à ${saved.tables} · jusqu’à ×10`;
  get("home-challenges").textContent = `${questionCount(saved)} défis`;
  get("home-lives").textContent =
    `${saved.lives} vie${saved.lives > 1 ? "s" : ""}`;
  get("home-goal").textContent = `Vise les ${questionCount(saved)} !`;
  get("play-note").textContent =
    `${questionCount(saved)} calculs. À toi de briller.`;
  get("victory-goal").textContent =
    `${questionCount(saved)} SUR ${questionCount(saved)} · MISSION ACCOMPLIE`;
  get("victory-description").textContent =
    `${questionCount(saved)} calculs réussis. Danse de la victoire !`;
  document
    .querySelectorAll<HTMLButtonElement>("[data-duration]")
    .forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.duration) === saved.duration),
      );
    });
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
  const record = saved.records[recordKey(saved)];
  get("home-record").textContent = record
    ? `Ton record ${settingsLabel(saved)} : ${formatTime(record.timeMs)}`
    : "Ton premier record t’attend !";
}

function start(): void {
  previewVictory = false;
  audio.stopSpeech();
  void audio.unlock();
  game = new Game(saved);
  game.start(performance.now());
  get("hearts").innerHTML = Array.from(
    { length: game.startingLives },
    (_, i) => `<span data-heart="${i}">${icons.heart}</span>`,
  ).join("");
  previousPhase = "welcome";
  previousQuestion = -1;
  previousFeedback = null;
  lastCountdown = -1;
  lastWarning = -1;
  recordProcessed = false;
  get("difficulty-label").textContent =
    `${settingsLabel(game.settings)} · ${game.duration} s`;
  get("time-progress").setAttribute("aria-valuemax", String(saved.duration));
  get("progress").setAttribute("aria-valuemax", String(game.totalQuestions));
  get("progress-goal").textContent = String(game.totalQuestions);
  render(performance.now());
}

document
  .querySelectorAll<HTMLButtonElement>("[data-duration]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      saved.duration = Number(button.dataset.duration) as Duration;
      persist();
      renderPreferences();
    }),
  );
document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach(button => button.addEventListener("click", () => {
  saved.mode = button.dataset.mode as Mode;
  normalizeLength();
  persist();
  renderPreferences();
}));
get<HTMLSelectElement>("length-select").addEventListener("change", event => {
  const value = (event.target as HTMLSelectElement).value;
  saved.length = value === "all" ? "all" : Number(value) as Length;
  normalizeLength();
  persist();
  renderPreferences();
});
for (const setting of ["tables", "lives"] as const) {
  get<HTMLSelectElement>(`${setting}-select`).addEventListener("change", (event) => {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isInteger(value) || value < 1 || value > 10) return;
    saved[setting] = value;
    normalizeLength();
    persist();
    renderPreferences();
  });
}
document
  .querySelectorAll<HTMLButtonElement>('[data-action="start"]')
  .forEach((button) => button.addEventListener("click", start));
function previewVictoryAnimation(): void {
  if (game.phase !== "welcome" || previewVictory) return;
  void audio.unlock().then(() => {
    if (game.phase !== "welcome" || previewVictory) return;
    previewVictory = true;
    previewEndsAt = performance.now() + VICTORY_DURATION_MS;
    render(performance.now());
  });
}
function goHome(): void {
  if (previewVictory) return;
  // The brand is only a home link outside an active game; no accidental loss of progress.
  if (!["welcome", "finished"].includes(game.phase)) {
    pause();
    return;
  }
  game = new Game(saved);
  previousPhase = "finished";
  renderPreferences();
  render(performance.now());
  document
    .querySelector<HTMLButtonElement>('[data-action="start"]')
    ?.focus({ preventScroll: true });
}
get("sound").addEventListener("click", () => {
  saved.muted = !saved.muted;
  audio.setMuted(saved.muted);
  void audio.unlock().then(() => {
    if (!saved.muted) speakCurrentQuestion();
  });
  persist();
  renderPreferences();
});
function speakCurrentQuestion(): void {
  if (
    game.phase === "question" &&
    game.current &&
    saved.voiceEnabled &&
    !saved.muted
  ) {
    audio.speakQuestion(game.current);
  }
}
get("voice").addEventListener("click", () => {
  saved.voiceEnabled = !saved.voiceEnabled;
  if (!saved.voiceEnabled) audio.stopSpeech();
  else void audio.unlock().then(speakCurrentQuestion);
  persist();
  renderPreferences();
});
get("repeat-question").addEventListener("click", speakCurrentQuestion);

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
  void audio.unlock();
  game.resume(performance.now());
  lastCountdown = -1;
  render(performance.now());
});
function digit(value: string): void {
  if (game.phase !== "question") return;
  audio.key();
  game.digit(value, performance.now());
  render(performance.now());
}
document
  .querySelectorAll<HTMLButtonElement>("[data-digit]")
  .forEach((button) =>
    button.addEventListener("click", () => digit(button.dataset.digit!)),
  );
get("erase").addEventListener("click", () => {
  game.erase(performance.now());
  render(performance.now());
});
document.addEventListener("keydown", (event) => {
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
  if (/^\d$/.test(event.key) && game.phase === "question") {
    event.preventDefault();
    digit(event.key);
  } else if (event.key === "Backspace" && game.phase === "question") {
    event.preventDefault();
    game.erase(performance.now());
    render(performance.now());
  } else if (
    event.key === "Escape" &&
    ["question", "countdown", "feedback"].includes(game.phase)
  ) {
    event.preventDefault();
    pause();
  } else if (event.key === "Tab" && game.phase === "paused") {
    event.preventDefault();
    get("resume").focus();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    audio.stopSpeech();
    pause();
    audio.ambience(false, game.solved, false);
  }
});
window.addEventListener("pagehide", () => {
  audio.stopSpeech();
  game.pause(performance.now());
});

function renderResults(now: number): void {
  const won = game.solved === game.totalQuestions;
  const settings = game.settings;
  let newRecord = false;
  let stored = true;
  if (!recordProcessed) {
    recordProcessed = true;
    if (won) {
      newRecord = saveRecord(saved, settings, {
        timeMs: game.elapsed(now),
        mistakes: game.mistakes,
        date: new Date().toISOString(),
      });
      stored = persist();
      audio.victory();
      particles.burst(true);
    }
    get("result-eyebrow").textContent = won
      ? "LE TABLEAU EST À TOI !"
      : "CHAQUE ESSAI TE FAIT GRANDIR";
    get("result-title").textContent = won
      ? `${game.totalQuestions} fois bravo !`
      : "On ne lâche rien !";
    get("result-description").textContent = won
      ? "Tous tes calculs sont réussis. Quelle étoile !"
      : "Plus de vies pour cette partie. Tes petites victoires, elles, restent dans ta tête.";
    get("result-solved").textContent = String(game.solved);
    get("result-total").textContent = `sur ${game.totalQuestions} réussies`;
    get("result-time").textContent = formatTime(game.elapsed(now));
    get("result-mistakes").textContent = String(game.mistakes);
    get("result-streak").textContent = String(game.bestStreak);
    get("last-correction").hidden = won || !game.feedback;
    if (!won && game.feedback) {
      const pair = game.feedback.pair;
      get("last-correction").textContent =
        `${game.feedback.timeout ? "Le temps était écoulé." : "À retenir :"} ${expression(pair)} = ${pair.result}`;
    }
    const best = saved.records[recordKey(settings)];
    get("result-record").textContent = won
      ? `${newRecord ? "✦ Nouveau record !" : "Ton record :"} ${formatTime(best!.timeMs)} · ${settingsLabel(settings)}${stored ? "" : " · Conservé pour cette visite seulement"}`
      : `${game.solved} petites victoires aujourd’hui. Encore plus la prochaine fois ?`;
    renderPreferences();
    get("results")
      .querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
  }
}

function render(now: number): void {
  const phase = previewVictory ? "victory" : game.phase;
  const isPlaying = !["welcome", "defeat", "victory", "finished"].includes(phase);
  const overlay = phase === "countdown" || phase === "paused";
  get("voice-unavailable").hidden =
    phase !== "question" || audio.speechStatus !== "unavailable";
  get("voice").classList.toggle(
    "is-speaking",
    audio.speechStatus === "speaking",
  );
  get("home").hidden = phase !== "welcome";
  get("play").hidden = !isPlaying;
  get("results").hidden = phase !== "finished";
  get("defeat").hidden = phase !== "defeat";
  get("victory").hidden = phase !== "victory";
  get("overlay").hidden = !overlay;
  get("play").inert = overlay;
  get("countdown-panel").hidden = phase !== "countdown";
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
  if (phase !== previousPhase) {
    if (phase !== "question") audio.stopSpeech();
    else {
      get("board").classList.remove("reaction-correct", "reaction-error");
      get("reaction").classList.remove("is-active");
      if (previousQuestion === game.questionNumber) speakCurrentQuestion();
    }
    if (phase === "defeat") {
      get("board").classList.remove("reaction-correct", "reaction-error");
      if (saved.voiceEnabled) audio.disappointment();
      else audio.end();
      get("defeat").focus({ preventScroll: true });
    }
    if (phase === "victory") {
      get("board").classList.remove("reaction-correct", "reaction-error");
      audio.victoryDance();
      particles.burst(true);
      get("victory").focus({ preventScroll: true });
    }
    if (phase === "paused") get("resume").focus({ preventScroll: true });
    if (phase === "question" && previousPhase === "countdown") {
      if (previousFocus?.isConnected && previousFocus.closest("#play"))
        previousFocus.focus({ preventScroll: true });
      else get("pause").focus({ preventScroll: true });
    }
    previousPhase = phase;
  }
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
    `${game.lives} vie${game.lives > 1 ? "s" : ""} restante${game.lives > 1 ? "s" : ""}`,
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
  const left = game.timeLeft(now);
  const seconds = Math.ceil(left / 1000);
  get("time-left").textContent = `${seconds} s`;
  get("time-fill").style.transform =
    `scaleX(${Math.min(1, left / (game.duration * 1000))})`;
  get("time-progress").setAttribute("aria-valuenow", String(seconds));
  get("time-box").classList.toggle(
    "urgent",
    phase === "question" && seconds <= 3,
  );
  if (
    phase === "question" &&
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
    get("equation").innerHTML =
      `<span>${game.current.a}</span><span class="multiply-sign">${symbols[game.current.operation]}</span><span>${game.current.b}</span>`;
    get("equation").setAttribute(
      "aria-label",
      spokenExpression(game.current),
    );
    get("question-announcement").textContent =
      `${spokenExpression(game.current)}. ${String(game.current.result).length} chiffre${game.current.result < 10 ? "" : "s"} à saisir.`;
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
    speakCurrentQuestion();
  }
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
      react(
        "correct",
        milestone
          ? "WAOUH !"
          : game.streak >= 3
            ? "COMBO !"
            : ["YES !", "BIM !", "BRAVO !"][game.solved % 3],
      );
    } else {
      get("feedback").textContent =
        `${timeout ? "Temps écoulé !" : "Oups !"} ${expression(pair)} = ${pair.result} · On le reverra.`;
      get("correct-result").textContent = `${pair.result} !`;
      get("correction-card").setAttribute(
        "aria-label",
        `Désolé, mais c’était ${pair.result} !`,
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
function frame(now: number): void {
  if (!document.hidden) {
    if (previewVictory && now >= previewEndsAt) {
      previewVictory = false;
      render(now);
      document
        .querySelector<HTMLButtonElement>('#home [data-action="start"]')
        ?.focus({ preventScroll: true });
    }
    game.tick(now);
    render(now);
    particles.frame(now);
    audio.ambience(
      game.phase === "question" || game.phase === "feedback",
      game.solved,
      game.phase === "question" && game.timeLeft(now) <= 3000,
    );
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
