import { CLOCK_PROGRESS_KEY, clockCorrectionMs, clockFace, clockGameIds, clockGames, clockLevels, clockRound, roundLength, type ClockGame, type ClockQuestion } from './clock-games';
import clockRabbitArt from '/themes/lapin-chrono.svg?raw';
import { clockFriendArt } from './clock-characters';
import { clockCorrectionMarkup } from './clock-correction';
import { clockFinaleChapterMs, clockFinaleChapters, clockFinaleScene, clockFriends, clockStoryIntro, clockStoryTitle, type ClockFriend } from './clock-story';
import { sprite } from './themes';
import type { ClockCue } from './audio';
import type { ClockVoiceToken } from './clock-voice';

type Level = Parameters<typeof clockRound>[1];
type Screen = 'catalogue' | 'levels' | 'playing' | 'correction' | 'paused' | 'results' | 'story' | 'finale';
type FinaleOrigin = 'catalogue' | 'results' | 'story';
type Gesture = 'cheer' | 'encourage' | 'finish';
const rabbitEvery = 5;
const levelKey = (game: ClockGame, level: number) => `${game}:${level}`;
const orderedLevels = clockGameIds.flatMap(game => clockLevels.map((_, level) => ({ game, level: level as Level, key: levelKey(game, level) })));
const sparkleTrajectories = [[-88,-24],[-74,5],[-60,-41],[-37,13],[-29,-53],[-11,-20],[14,-56],[28,12],[42,-42],[59,6],[75,-22],[88,-1]];
const successBurst = `<div class="clock-sparkles"><span class="clock-success-star">✦</span>${sparkleTrajectories.map(([x, y], index) =>
  `<i style="--burst-x:${x}px;--burst-y:${y}px;--burst-delay:${(index % 4) * 32}ms"></i>`).join('')}</div>`;
const runningRabbit = `<span class="clock-rabbit-dust" aria-hidden="true"><i></i><i></i><i></i></span>${clockRabbitArt}`;
const rabbitParade = `<div class="clock-rabbit-runner">${runningRabbit}</div>`;
const finishPass = `<div class="clock-finish-pass"><span class="clock-finish-bubble">Oh là là, je suis en retard&nbsp;!</span><div class="clock-finish-runner">${runningRabbit}</div></div>`;
const starRunner = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M4 41h15M0 54h14M8 66h12" fill="none" stroke="#e8aa46" stroke-width="4" stroke-linecap="round"/>
  <path d="m35 67-5 14-10 4m44-17 11 11 12-3M30 43l-13 7m51-10 14-10" fill="none" stroke="#685077" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="m50 13 10 19 21 3-15 15 4 21-20-10-19 10 3-21-15-15 21-3Z" fill="var(--party-color)" stroke="#a25b70" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="43" cy="43" r="2.8" fill="#52364f"/><circle cx="57" cy="43" r="2.8" fill="#52364f"/>
  <path d="M44 50q6 8 12 0" fill="none" stroke="#52364f" stroke-width="2" stroke-linecap="round"/>
</svg>`;
const partyColors = ['#ffdc74', '#f3a4c4', '#bdb0f1', '#9bdbb9'];
const quickParade = `<div class="clock-quick-party">${partyColors.map((color, index) =>
  `<div class="clock-quick-runner" style="--party-color:${color};--party-lane:${12 + index * 17}%;--party-delay:${index * 105}ms;--party-rest-x:${12 + index * 24}%">${starRunner}</div>`).join('')}
  <div class="clock-party-confetti">${Array.from({ length: 32 }, (_, index) =>
    `<i style="--paper-x:${2 + index * 37 % 96}%;--paper-y:${5 + index * 23 % 90}%;--paper-drift:${(index % 7 - 3) * 17}px;--paper-delay:${index % 8 * 45}ms;--party-color:${partyColors[index % partyColors.length]}"></i>`).join('')}</div></div>`;
const crossPositions = [[8,13],[27,6],[51,10],[77,6],[92,15],[6,36],[94,39],[7,66],[93,68],[12,89],[48,93],[85,89]];
const mistakeEffect = `<div class="clock-mistake-effect" style="--clock-lesson-duration:${clockCorrectionMs}ms">${crossPositions.map(([x, y], index) =>
  `<i style="--cross-x:${x}%;--cross-y:${y}%;--cross-delay:${(index % 4) * 65}ms">×</i>`).join('')}</div>`;
const timeoutScene = `<div class="clock-timeout-scene" aria-hidden="true">
  <span class="clock-timeout-note">♪</span><span class="clock-timeout-note">♫</span><span class="clock-timeout-note">♪</span>
  <div class="clock-timeout-dial"><svg viewBox="0 0 96 100">
    <path d="M48 19V8m-8 0h16m18 16 6-7" fill="none" stroke="#713950" stroke-width="6" stroke-linecap="round"/>
    <circle cx="48" cy="58" r="37" fill="#fff6dd" stroke="#a04c65" stroke-width="5"/>
    <circle cx="48" cy="58" r="29" fill="#fff9e9" stroke="#bd788c" stroke-width="3" stroke-dasharray="2 13.18"/>
    <path class="clock-timeout-hand" d="M48 38v20l13 9" fill="none" stroke="#713950" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="48" cy="58" r="4" fill="#a04c65"/>
  </svg></div>
  <div class="clock-timeout-rabbit">${clockRabbitArt}</div>
</div>`;

export class ClockArcade {
  readonly root = document.createElement('section');
  private readonly companion = document.createElement('aside');
  private readonly content = document.createElement('div');
  private readonly feedback = document.createElement('p');
  private readonly burst = document.createElement('div');
  private readonly quick = document.createElement('div');
  private readonly parade = document.createElement('div');
  private readonly finishLayer = document.createElement('div');
  private readonly guestTrail = document.createElement('div');
  private readonly progressLabel = document.createElement('span');
  private readonly companionFriends = document.createElement('div');
  private completed = new Set<string>();
  private screen: Screen = 'catalogue';
  private game: ClockGame = 'read';
  private level: Level = 0;
  private questions: ClockQuestion[] = [];
  private index = 0;
  private score = 0;
  private totalCorrect = 0;
  private remaining = 0;
  private deadline = 0;
  private displayedSeconds = -1;
  private mistakenOption: ClockQuestion['correct'] | null = null;
  private lessonElapsed = 0;
  private lessonFrameAt: number | null = null;
  private arrival: ClockFriend | undefined;
  private storyReturn: 'catalogue' | 'levels' = 'catalogue';
  private finaleReturn: FinaleOrigin = 'story';
  private finaleElapsed = 0;
  private finaleFrameAt: number | null = null;
  private finaleStep = 0;
  private finalePaused = false;

  constructor(
    private readonly goHome: () => void,
    private readonly playSuccess: (milestone: boolean) => void,
    private readonly playCue: (cue: ClockCue) => void,
    private readonly storage: () => Pick<Storage, 'getItem' | 'setItem'>,
    private readonly narrate: (tokens: readonly ClockVoiceToken[] | null) => void,
  ) {
    this.root.className = 'clock-arcade';
    this.root.setAttribute('aria-labelledby', 'clock-heading');
    this.root.hidden = true;
    this.feedback.className = 'clock-feedback';
    this.feedback.setAttribute('role', 'status');
    this.burst.className = 'clock-burst';
    this.quick.className = 'clock-quick-layer';
    this.parade.className = 'clock-parade';
    this.finishLayer.className = 'clock-finish-layer';
    this.finishLayer.setAttribute('role', 'status');
    this.burst.setAttribute('aria-hidden', 'true');
    this.quick.setAttribute('aria-hidden', 'true');
    this.parade.setAttribute('aria-hidden', 'true');
    this.guestTrail.className = 'clock-guest-trail';
    this.guestTrail.setAttribute('aria-hidden', 'true');
    this.guestTrail.hidden = true;
    this.root.append(this.content, this.guestTrail, this.feedback, this.burst, this.quick, this.parade, this.finishLayer, this.companion);
    this.companion.className = 'clock-companion';
    this.companion.setAttribute('aria-label', 'Le lapin chrono et ses amis');
    this.companion.innerHTML = `<div class="clock-companion-crew"><div class="clock-companion-art">${clockRabbitArt}</div></div>`;
    this.companionFriends.className = 'clock-companion-friends';
    this.companion.firstElementChild!.append(this.companionFriends);
    this.companion.append(this.progressLabel);
    this.loadProgress();
    this.root.addEventListener('click', event => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button');
      if (!button || button.disabled) return;
      const now = performance.now();
      switch (button.dataset.clockAction) {
        case 'home': this.goHome(); break;
        case 'catalogue': this.open(); break;
        case 'levels': this.show('levels'); break;
        case 'story':
          this.storyReturn = this.screen === 'results' ? 'levels' : 'catalogue';
          this.show('story');
          break;
        case 'finale':
          if (this.screen === 'finale') this.startFinale(now, this.finaleReturn);
          else if (this.screen === 'catalogue' || this.screen === 'results' || this.screen === 'story') this.startFinale(now, this.screen);
          break;
        case 'pause-finale': this.toggleFinalePause(now, button); break;
        case 'leave-finale': this.show(this.finaleReturn); break;
        case 'game': this.game = button.dataset.game as ClockGame; this.show('levels'); break;
        case 'level': this.start(now, this.game, Number(button.dataset.level) as Level); break;
        case 'next-level': {
          const next = this.nextLevel;
          if (this.screen === 'results' && next) this.start(now, next.game, next.level);
          break;
        }
        case 'pause': this.pause(now); break;
        case 'resume': this.resume(now); break;
        case 'answer': this.answer(Number(button.dataset.option), now); break;
        case 'replay': this.start(now); break;
      }
    });
  }

  get playing(): boolean { return !this.root.hidden && this.screen === 'playing'; }
  readCurrentQuestion(): void {
    if (this.playing && !document.hidden) this.narrate(this.questions[this.index].narration);
  }

  private get storyComplete(): boolean { return this.completed.size === orderedLevels.length; }
  private get nextLevel() { return orderedLevels.find(level => !this.completed.has(level.key)); }

  loadProgress(): void {
    this.completed = this.readProgress();
    this.totalCorrect = 0;
    delete this.companion.dataset.gesture;
    delete this.guestTrail.dataset.gesture;
    this.updateCompanion();
  }

  private reactCompanion(gesture: Gesture): void {
    if (this.companion.hidden) return;
    delete this.companion.dataset.gesture;
    delete this.guestTrail.dataset.gesture;
    void this.companion.offsetWidth;
    this.companion.dataset.gesture = gesture;
    if (this.playing) this.guestTrail.dataset.gesture = gesture;
  }

  private readProgress(): Set<string> {
    try {
      const saved: unknown = JSON.parse(this.storage().getItem(CLOCK_PROGRESS_KEY) ?? '[]');
      return new Set(Array.isArray(saved) ? orderedLevels.filter(({ key }) => saved.includes(key)).map(({ key }) => key) : []);
    } catch {
      return new Set();
    }
  }

  private completeLevel(): void {
    const key = levelKey(this.game, this.level);
    if (this.completed.has(key)) return;
    const before = this.completed.size;
    for (const saved of this.readProgress()) this.completed.add(saved);
    this.completed.add(key);
    this.arrival = clockFriends.find(friend => friend.at > before && friend.at <= this.completed.size);
    try { this.storage().setItem(CLOCK_PROGRESS_KEY, JSON.stringify([...this.completed])); }
    catch { /* Keep the progress for the current visit when storage is blocked. */ }
    this.updateCompanion();
  }

  private updateCompanion(): void {
    this.companion.hidden = this.completed.size === 0;
    this.progressLabel.textContent = `${this.completed.size} / ${orderedLevels.length} niveaux faits`;
    const friends = clockFriends.filter(friend => friend.at <= this.completed.size);
    this.companionFriends.innerHTML = friends.map(friend =>
      `<span class="clock-companion-friend" role="img" aria-label="${friend.name}">${clockFriendArt(friend)}</span>`).join('');
    this.guestTrail.innerHTML = friends.map(friend =>
      `<span class="clock-guest-spot" data-clock-friend="${friend.id}"><span class="clock-guest-figure">${clockFriendArt(friend)}</span></span>`).join('');
  }

  open(): void {
    this.clearCelebrations();
    this.root.hidden = false;
    this.show('catalogue');
  }

  close(): void {
    if (this.root.hidden) return;
    this.clearCelebrations();
    this.playCue('stop');
    delete this.companion.dataset.gesture;
    this.root.hidden = true;
  }

  tick(now: number): void {
    if (this.root.hidden) return;
    if (this.screen === 'finale') this.tickFinale(now);
    if (this.screen === 'correction') {
      this.lessonElapsed += now - (this.lessonFrameAt ?? now);
      this.lessonFrameAt = now;
      if (this.lessonElapsed >= clockCorrectionMs) this.continueAfterCorrection(now);
      return;
    }
    if (!this.playing) return;
    this.remaining = Math.max(0, this.deadline - now);
    if (this.remaining === 0) {
      this.clearCelebrations();
      this.feedback.textContent = '';
      this.show('results');
      if (!document.hidden) this.playCue('timeout');
    } else this.updateTimer();
  }

  pause(now: number): void {
    this.finaleFrameAt = null;
    this.lessonFrameAt = null;
    if (!this.playing) return;
    this.tick(now);
    if (this.playing) {
      this.clearCelebrations();
      this.show('paused');
    }
  }

  private start(now: number, game = this.game, level = this.level): void {
    const key = levelKey(game, level);
    if (!this.completed.has(key) && key !== this.nextLevel?.key) return;
    this.game = game;
    this.level = level;
    this.clearCelebrations();
    delete this.guestTrail.dataset.gesture;
    this.feedback.textContent = '';
    this.mistakenOption = null;
    this.arrival = undefined;
    this.questions = clockRound(this.game, this.level);
    this.index = 0;
    this.score = 0;
    this.remaining = clockLevels[this.level].seconds * 1000;
    this.resume(now);
  }

  private resume(now: number): void {
    this.deadline = now + this.remaining;
    this.show('playing');
  }

  private answer(option: number, now: number): void {
    if (!this.playing) return;
    this.tick(now);
    if (!this.playing) return;
    const question = this.questions[this.index];
    const selected = question.options[option];
    if (selected === undefined) return;
    if (selected !== question.correct) {
      this.mistakenOption = selected;
      this.lessonElapsed = 0;
      this.lessonFrameAt = now;
      this.feedback.textContent = '';
      this.clearCelebrations();
      this.show('correction');
      this.reactCompanion('encourage');
      this.playCue('mistake');
      this.celebrate(this.burst, mistakeEffect);
      return;
    }
    this.score++;
    this.totalCorrect++;
    const milestone = this.totalCorrect % rabbitEvery === 0;
    this.advance(now);
    if (this.playing) this.reactCompanion('cheer');
    this.feedback.textContent = milestone ? `Bravo, ${this.totalCorrect} bonnes réponses ! Voilà le lapin !` : 'Bravo, bonne réponse !';
    this.feedback.classList.add('clock-feedback-correct');
    this.playCue('correct');
    this.celebrate(this.burst, successBurst);
    this.celebrate(this.quick, quickParade, true);
    if (milestone && this.playing) this.celebrate(this.parade, rabbitParade);
  }

  private continueAfterCorrection(now: number): void {
    if (this.screen !== 'correction') return;
    this.clearCelebrations();
    this.mistakenOption = null;
    this.deadline = now + this.remaining;
    this.advance(now);
  }

  private advance(now: number): void {
    this.index++;
    const finished = this.index === this.questions.length;
    const storyWasComplete = this.storyComplete;
    if (finished) this.completeLevel();
    if (finished && !storyWasComplete && this.storyComplete) this.startFinale(now, 'results');
    else this.show(finished ? 'results' : 'playing');
    if (finished) {
      this.reactCompanion('finish');
      this.parade.replaceChildren();
      this.celebrate(this.finishLayer, finishPass);
      if (!document.hidden) this.playCue('rabbit-late');
    }
  }

  private celebrate(layer: HTMLElement, markup: string, append = false): void {
    if (!append) layer.replaceChildren();
    layer.insertAdjacentHTML('beforeend', markup);
    const effect = layer.lastElementChild!;
    effect.addEventListener('animationend', event => { if (event.target === effect) effect.remove(); });
  }

  private clearCelebrations(): void {
    this.burst.replaceChildren();
    this.quick.replaceChildren();
    this.parade.replaceChildren();
    this.finishLayer.replaceChildren();
  }

  private startFinale(now: number, back: FinaleOrigin): void {
    if (!this.storyComplete) return;
    this.finaleReturn = back;
    this.finaleElapsed = 0;
    this.finaleFrameAt = now;
    this.finaleStep = 0;
    this.finalePaused = false;
    this.show('finale');
  }

  private toggleFinalePause(now: number, button: HTMLButtonElement): void {
    this.finalePaused = !this.finalePaused;
    this.finaleFrameAt = this.finalePaused ? null : now;
    this.content.querySelector('.clock-finale-scene')!.toggleAttribute('data-paused', this.finalePaused);
    button.textContent = this.finalePaused ? 'Reprendre le film' : 'Pause du film';
  }

  private tickFinale(now: number): void {
    const last = clockFinaleChapters.length - 1;
    if (this.finalePaused || this.finaleStep === last) return;
    this.finaleElapsed += now - (this.finaleFrameAt ?? now);
    this.finaleFrameAt = now;
    const step = Math.min(last, Math.floor(this.finaleElapsed / clockFinaleChapterMs));
    if (step === this.finaleStep) return;
    this.finaleStep = step;
    this.content.querySelector<HTMLElement>('.clock-finale-scene')!.dataset.step = String(step);
    const chapter = clockFinaleChapters[step];
    this.content.querySelector<HTMLElement>('.clock-finale-beat')!.textContent = chapter.title;
    this.content.querySelector<HTMLElement>('.clock-finale-caption')!.textContent = chapter.caption;
    this.content.querySelector<HTMLProgressElement>('.clock-finale-progress')!.value = step + 1;
    if (step === last) this.content.querySelector<HTMLButtonElement>('[data-clock-action="finale"]')!.hidden = false;
    if (step >= 2) this.playSuccess(step !== 2);
  }

  private show(screen: Screen): void {
    if (this.screen === 'playing' && screen !== 'playing') this.narrate(null);
    if (this.screen === 'results' || this.screen === 'finale') {
      this.finishLayer.replaceChildren();
      this.playCue('stop');
    }
    this.screen = screen;
    this.content.innerHTML = this.markup();
    this.guestTrail.hidden = screen !== 'playing' || !this.guestTrail.childElementCount;
    this.feedback.hidden = screen !== 'playing' && screen !== 'results';
    if (screen === 'playing') {
      this.displayedSeconds = -1;
      this.updateTimer();
      this.readCurrentQuestion();
    }
    this.content.querySelector<HTMLElement>('#clock-heading')!.focus();
  }

  private updateTimer(): void {
    const seconds = Math.ceil(this.remaining / 1000);
    if (seconds === this.displayedSeconds) return;
    this.displayedSeconds = seconds;
    const timer = this.root.querySelector<HTMLElement>('#clock-time')!;
    timer.textContent = `${seconds} s`;
    const track = this.content.querySelector<HTMLElement>('.time-track')!;
    track.setAttribute('aria-valuenow', String(seconds));
    track.querySelector('span')!.style.transform = `scaleX(${seconds / clockLevels[this.level].seconds})`;
  }

  private markup(): string {
    const game = clockGames[this.game];
    const next = this.nextLevel;
    const title = (text: string) => `<h2 id="clock-heading" tabindex="-1">${text}</h2>`;
    const catalogue = '<button type="button" class="secondary-button" data-clock-action="catalogue">← Tous les jeux</button>';
    const levels = '<button type="button" class="secondary-button" data-clock-action="levels">← Retour aux niveaux</button>';
    const story = '<button type="button" class="secondary-button" data-clock-action="story">Lire l’histoire</button>';
    const finale = '<button type="button" class="play-button" data-clock-action="finale">Voir la fin animée</button>';

    switch (this.screen) {
      case 'catalogue':
        return `<div class="camp-top"><button type="button" class="secondary-button" data-clock-action="home">← Accueil</button><span class="camp-materials">${this.completed.size} / ${orderedLevels.length} niveaux faits</span></div>
          <header class="camp-heading clock-intro"><div><span class="eyebrow">LE COIN DES 5–8 ANS</span>${title('Les jeux du lapin chrono')}<p>Lis l’heure et compare les durées. Termine chaque niveau pour débloquer le suivant.</p></div><img src="/themes/lapin-chrono.svg" alt="" width="144" height="144"></header>
          <div class="clock-story-teaser"><div class="clock-story-invite">${sprite('kitten', 4, 'clock-kitten-sticker')}<div><span class="clock-kicker">L’HISTOIRE DU LAPIN</span><h3>${clockStoryTitle}</h3><p>Sa montre s’est arrêtée et il a raté le goûter. Retrouve ses amis en jouant !</p></div></div><div class="clock-story-actions">${story}${this.storyComplete ? '<button type="button" class="play-button" data-clock-action="finale">Revoir l’animation</button>' : ''}</div></div>
          <div class="camp-presets clock-games">${clockGameIds.map(id => {
            const item = clockGames[id];
            const done = clockLevels.filter((_, level) => this.completed.has(levelKey(id, level))).length;
            const status = next?.game === id ? '<span class="clock-next">Prochain niveau ici</span>' : done === 0 ? '<span class="clock-locked">🔒 Verrouillé</span>' : '';
            return `<button type="button" data-clock-action="game" data-game="${id}"><span class="camp-symbol clock-icon" aria-hidden="true">${item.icon}</span><strong>${item.name}</strong><span>${item.description}</span><small class="camp-preset-note">${done} / ${clockLevels.length} niveaux faits</small>${status}</button>`;
          }).join('')}</div>`;
      case 'story':
        return `<div class="clock-top">${this.storyReturn === 'levels' ? levels : catalogue}<span>${this.completed.size} / ${orderedLevels.length} niveaux faits</span></div>
          <header class="clock-center clock-story-intro"><span class="clock-kicker">L’HISTOIRE DU LAPIN</span>${title(clockStoryTitle)}<p>${clockStoryIntro}</p></header>
          <ol class="clock-chapters">${clockFriends.map(friend => friend.at <= this.completed.size
            ? `<li class="clock-chapter" data-friend="${friend.id}">${clockFriendArt(friend)}<div><span class="clock-kicker">${friend.name}</span><h3>${friend.title}</h3><p>${friend.story}</p></div></li>`
            : `<li class="clock-chapter clock-chapter-locked"><span class="clock-mystery" aria-hidden="true">?</span><div><h3>Un ami mystère</h3><p>Il te rejoint à ${friend.at} niveaux faits.</p></div></li>`).join('')}</ol>
          <div class="clock-story-end"><h3>Le dernier chapitre</h3>${this.storyComplete ? finale : `<p>Termine les ${orderedLevels.length} niveaux pour voir la fin animée.</p>`}</div>`;
      case 'finale': {
        const back = { catalogue: 'Tous les jeux', results: 'Mon bilan', story: 'L’histoire' }[this.finaleReturn];
        return `<div class="clock-top"><button type="button" class="secondary-button" data-clock-action="leave-finale">← ${back}</button><span>LE DERNIER CHAPITRE</span></div>
          <header class="clock-center">${title('Enfin l’heure du goûter&nbsp;!')}</header>${clockFinaleScene()}
          <div class="clock-finale-strip"><span class="clock-finale-beat">${clockFinaleChapters[0].title}</span><progress class="clock-finale-progress" aria-label="Tableau du film" value="1" max="${clockFinaleChapters.length}"></progress></div>
          <p class="clock-finale-caption" role="status">${clockFinaleChapters[0].caption}</p>
          <div class="clock-actions"><button type="button" class="play-button" data-clock-action="finale" hidden>Revoir l’animation</button><button type="button" class="secondary-button" data-clock-action="pause-finale">Pause du film</button></div>`;
      }
      case 'levels':
        return `<div class="clock-top">${catalogue}</div><div class="clock-center"><span class="clock-icon" aria-hidden="true">${game.icon}</span>${title(game.name)}<p>${game.description}</p><p>${next ? `À jouer maintenant · ${clockGames[next.game].name} · ${clockLevels[next.level].name}` : 'Tous les niveaux sont faits ! Tu peux les rejouer.'}</p></div>
          <div class="camp-presets clock-games clock-levels">${clockLevels.map((level, index) => {
            const key = levelKey(this.game, index);
            const done = this.completed.has(key);
            const unlocked = key === next?.key;
            const status = done ? '<span class="clock-done">✓ Fait</span>' : unlocked ? '<span class="clock-next">À jouer</span>' : '<span class="clock-locked">🔒 Verrouillé</span>';
            return `<button type="button" data-clock-action="level" data-level="${index}"${done || unlocked ? '' : ' disabled'}><span class="camp-symbol clock-icon" aria-hidden="true">${level.icon}</span><strong>${level.name}</strong><span>${game.skills[index]}</span><small class="camp-preset-note">${level.seconds} secondes</small>${status}</button>`;
          }).join('')}</div>`;
      case 'correction':
        return clockCorrectionMarkup(this.questions[this.index], this.mistakenOption!, Math.ceil(this.remaining / 1000));
      case 'paused':
        return `<div class="game-overlay clock-pause"><div class="pause-panel"><span class="clock-icon" aria-hidden="true">⏸️</span>${title('Petite pause')}
          <p>Ton chrono t’attend.</p><div class="result-actions"><button type="button" class="play-button" data-clock-action="resume">On continue !</button>${catalogue}</div></div></div>`;
      case 'results': {
        const finished = this.index === roundLength;
        const errors = this.index - this.score;
        const artwork = finished ? '<img src="/themes/lapin-chrono.svg" alt="" width="144" height="144">' : timeoutScene;
        return `<div class="results-screen clock-results">${artwork}<span class="eyebrow">${game.name} · ${clockLevels[this.level].name}</span>${title(finished ? 'Bien joué !' : 'Le chrono a sonné !')}
          ${finished ? `<p><span class="clock-done">✓ Niveau fait</span> ${clockLevels[this.level].name}</p>` : '<p>Chaque essai t’aide à mieux apprivoiser le temps.</p>'}
          <div class="result-stats"><div><strong>${this.score}</strong> <span>${this.score === 1 ? 'bonne réponse' : 'bonnes réponses'}</span></div><div><strong>${this.index} / ${roundLength}</strong><span>questions jouées</span></div><div><strong>${errors}</strong><span>${errors === 1 ? 'erreur' : 'erreurs'}</span></div></div>
          ${this.arrival ? `<div class="clock-arrival" role="status">${clockFriendArt(this.arrival)}<div><strong>${this.arrival.name} te rejoint !</strong><p>${this.arrival.story}</p></div></div>` : ''}
          <div class="result-actions">${finished && next ? '<button type="button" class="play-button" data-clock-action="next-level">Continuer le parcours →</button>' : ''}<button type="button" class="${finished && next ? 'secondary-button' : 'play-button'}" data-clock-action="levels">Retour aux niveaux</button><button type="button" class="secondary-button" data-clock-action="replay">Rejouer</button>${this.arrival ? story : ''}${this.storyComplete ? finale : ''}</div></div>`;
      }
      case 'playing': {
        const question = this.questions[this.index];
        return `<div class="game-status clock-status"><div><span class="small-label">${game.name} · ${clockLevels[this.level].name}</span><span class="streak">Question ${this.index + 1} sur ${roundLength}</span></div>
          <div class="session-actions"><button type="button" class="secondary-button" data-clock-action="pause">Pause</button></div></div>
          <div class="question-time"><div><span>◷ Temps restant</span><strong id="clock-time" role="timer"></strong></div><div class="time-track" role="progressbar" aria-label="Temps restant" aria-valuemin="0" aria-valuemax="${clockLevels[this.level].seconds}"><span></span></div></div>
          <div class="question-area clock-question"><div class="question-content clock-center">${title(question.prompt)}${question.detail ? `<p>${question.detail}</p>` : ''}${question.face === undefined ? '' : clockFace(question.face)}</div></div>
          <div class="keypad-panel"><div class="keypad-label">CHOISIS TA RÉPONSE</div><div class="keypad clock-options">${question.options.map((option, index) => `<button type="button" data-clock-action="answer" data-option="${index}">${typeof option === 'number' ? clockFace(option) : option}</button>`).join('')}</div></div>`;
      }
    }
  }
}
