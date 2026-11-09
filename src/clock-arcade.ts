import { CLOCK_PROGRESS_KEY, clockFace, clockGameIds, clockGames, clockLevels, clockRound, roundLength, type ClockGame, type ClockQuestion } from './clock-games';
import { clockFinaleCaptions, clockFinaleScene, clockFriendArt, clockFriends, clockStoryIntro, clockStoryTitle, type ClockFriend } from './clock-story';

type Level = Parameters<typeof clockRound>[1];
type Screen = 'catalogue' | 'levels' | 'playing' | 'paused' | 'results' | 'story' | 'finale';
type Gesture = 'cheer' | 'encourage' | 'finish';
const rabbitEvery = 5;
const levelKey = (game: ClockGame, level: number) => `${game}:${level}`;
const levelKeys = clockGameIds.flatMap(game => clockLevels.map((_, level) => levelKey(game, level)));

export class ClockArcade {
  readonly root = document.createElement('section');
  readonly companion = document.createElement('aside');
  private readonly content = document.createElement('div');
  private readonly feedback = document.createElement('p');
  private readonly burst = document.createElement('div');
  private readonly parade = document.createElement('div');
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
  private arrival: ClockFriend | undefined;
  private finaleReturn: 'story' | 'results' = 'story';
  private finaleElapsed = 0;
  private finaleFrameAt: number | null = null;
  private finaleStep = 0;

  constructor(
    private readonly goHome: () => void,
    private readonly playSuccess: (milestone: boolean) => void,
    private readonly storage: () => Pick<Storage, 'getItem' | 'setItem'>,
  ) {
    this.root.className = 'clock-arcade';
    this.root.setAttribute('aria-labelledby', 'clock-heading');
    this.root.hidden = true;
    this.feedback.className = 'clock-feedback';
    this.feedback.setAttribute('role', 'status');
    this.burst.className = 'clock-burst';
    this.parade.className = 'clock-parade';
    this.burst.setAttribute('aria-hidden', 'true');
    this.parade.setAttribute('aria-hidden', 'true');
    this.root.append(this.content, this.feedback, this.burst, this.parade);
    this.companion.className = 'clock-companion';
    this.companion.setAttribute('aria-label', 'Le lapin chrono et ses amis');
    this.companion.innerHTML = '<div class="clock-companion-crew"><div class="clock-companion-art"><img src="/themes/lapin-chrono.svg" alt="" width="80" height="80"></div></div>';
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
        case 'story': this.show('story'); break;
        case 'finale': this.startFinale(now, this.screen === 'results' ? 'results' : this.screen === 'finale' ? this.finaleReturn : 'story'); break;
        case 'leave-finale': this.show(this.finaleReturn); break;
        case 'game': this.game = button.dataset.game as ClockGame; this.show('levels'); break;
        case 'level': this.level = Number(button.dataset.level) as Level; this.start(now); break;
        case 'pause': this.pause(now); break;
        case 'resume': this.resume(now); break;
        case 'answer': this.answer(Number(button.dataset.option), now); break;
        case 'replay': this.start(now); break;
      }
    });
  }

  get playing(): boolean { return !this.root.hidden && this.screen === 'playing'; }
  private get storyComplete(): boolean { return this.completed.size === levelKeys.length; }

  loadProgress(): void {
    this.completed = this.readProgress();
    this.totalCorrect = 0;
    delete this.companion.dataset.gesture;
    this.updateCompanion();
  }

  reactCompanion(gesture: Gesture): void {
    if (this.companion.hidden) return;
    delete this.companion.dataset.gesture;
    void this.companion.offsetWidth;
    this.companion.dataset.gesture = gesture;
  }

  private readProgress(): Set<string> {
    try {
      const saved: unknown = JSON.parse(this.storage().getItem(CLOCK_PROGRESS_KEY) ?? '[]');
      return new Set(Array.isArray(saved) ? levelKeys.filter(key => saved.includes(key)) : []);
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
    this.progressLabel.textContent = `${this.completed.size} / ${levelKeys.length} niveaux faits`;
    this.companionFriends.innerHTML = clockFriends.filter(friend => friend.at <= this.completed.size).map(friend =>
      `<span class="clock-companion-friend" role="img" aria-label="${friend.name}">${clockFriendArt(friend)}</span>`).join('');
  }

  open(): void {
    this.clearCelebrations();
    this.root.hidden = false;
    this.show('catalogue');
  }

  close(): void {
    this.clearCelebrations();
    this.root.hidden = true;
  }

  tick(now: number): void {
    if (!this.root.hidden && this.screen === 'finale') this.tickFinale(now);
    if (!this.playing) return;
    this.remaining = Math.max(0, this.deadline - now);
    if (this.remaining === 0) this.show('results');
    else this.updateTimer();
  }

  pause(now: number): void {
    this.finaleFrameAt = null;
    if (!this.playing) return;
    this.tick(now);
    if (this.playing) {
      this.clearCelebrations();
      this.show('paused');
    }
  }

  private start(now: number): void {
    this.clearCelebrations();
    this.feedback.textContent = '';
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
    const correct = question.options[option] === question.correct;
    if (correct) {
      this.score++;
      this.totalCorrect++;
    }
    const milestone = correct && this.totalCorrect % rabbitEvery === 0;
    this.index++;
    const finished = this.index === this.questions.length;
    const storyWasComplete = this.storyComplete;
    if (finished) this.completeLevel();
    if (finished && !storyWasComplete && this.storyComplete) this.startFinale(now, 'results');
    else this.show(finished ? 'results' : 'playing');
    this.reactCompanion(finished ? 'finish' : correct ? 'cheer' : 'encourage');
    this.feedback.textContent = correct
      ? milestone ? `Bravo, ${this.totalCorrect} bonnes réponses ! Voilà le lapin !` : 'Bravo, bonne réponse !'
      : `Pour la question précédente : ${question.explanation}`;
    this.feedback.classList.toggle('clock-feedback-correct', correct);
    if (correct) {
      this.playSuccess(milestone);
      this.celebrate(this.burst, '<div class="clock-sparkles">✦<span>✧</span><span>✦</span><span>✧</span><span>✦</span></div>');
      if (milestone) this.celebrate(this.parade, '<img class="clock-rabbit-runner" src="/themes/lapin-chrono.svg" alt="" width="132" height="132">');
    } else this.burst.replaceChildren();
  }

  private celebrate(layer: HTMLElement, markup: string): void {
    layer.innerHTML = markup;
    const effect = layer.firstElementChild!;
    effect.addEventListener('animationend', () => effect.remove(), { once: true });
  }

  private clearCelebrations(): void {
    this.burst.replaceChildren();
    this.parade.replaceChildren();
  }

  private startFinale(now: number, back: 'story' | 'results'): void {
    if (!this.storyComplete) return;
    this.finaleReturn = back;
    this.finaleElapsed = 0;
    this.finaleFrameAt = now;
    this.finaleStep = 0;
    this.show('finale');
  }

  private tickFinale(now: number): void {
    this.finaleElapsed += now - (this.finaleFrameAt ?? now);
    this.finaleFrameAt = now;
    const step = Math.min(clockFinaleCaptions.length - 1, Math.floor(this.finaleElapsed / 4000));
    if (step === this.finaleStep) return;
    this.finaleStep = step;
    this.content.querySelector<HTMLElement>('.clock-finale-scene')!.dataset.step = String(step);
    this.content.querySelector<HTMLElement>('.clock-finale-caption')!.textContent = clockFinaleCaptions[step];
    if (step === clockFinaleCaptions.length - 1) {
      this.content.querySelector<HTMLButtonElement>('[data-clock-action="finale"]')!.hidden = false;
      this.playSuccess(true);
    }
  }

  private show(screen: Screen): void {
    this.screen = screen;
    this.content.innerHTML = this.markup();
    this.feedback.hidden = screen !== 'playing' && screen !== 'results';
    if (screen === 'playing') {
      this.displayedSeconds = -1;
      this.updateTimer();
    }
    this.content.querySelector<HTMLElement>('#clock-heading')!.focus();
  }

  private updateTimer(): void {
    const seconds = Math.ceil(this.remaining / 1000);
    if (seconds === this.displayedSeconds) return;
    this.displayedSeconds = seconds;
    const timer = this.root.querySelector<HTMLElement>('#clock-time')!;
    timer.textContent = `${seconds} s`;
    this.root.querySelector<HTMLProgressElement>('.clock-progress')!.value = seconds;
  }

  private markup(): string {
    const game = clockGames[this.game];
    const title = (text: string) => `<h2 id="clock-heading" tabindex="-1">${text}</h2>`;
    const catalogue = '<button type="button" class="secondary-button" data-clock-action="catalogue">← Tous les jeux</button>';
    const story = '<button type="button" class="secondary-button" data-clock-action="story">Lire l’histoire</button>';
    const finale = '<button type="button" class="play-button" data-clock-action="finale">Voir la fin animée</button>';

    switch (this.screen) {
      case 'catalogue':
        return `<div class="clock-top"><button type="button" class="secondary-button" data-clock-action="home">← Accueil</button><span>${this.completed.size} / ${levelKeys.length} niveaux faits</span></div>
          <header class="clock-intro"><img src="/themes/lapin-chrono.svg" alt="" width="144" height="144"><div><span class="clock-kicker">LE COIN DES 5–8 ANS</span>${title('Les jeux du lapin chrono')}<p>Lis l’heure, compare les durées et joue avec les aiguilles. Par quel jeu veux-tu commencer ?</p></div></header>
          <div class="clock-story-teaser"><div><span class="clock-kicker">L’HISTOIRE DU LAPIN</span><h3>${clockStoryTitle}</h3><p>Sa montre s’est arrêtée et il a raté le goûter. Retrouve ses amis en jouant !</p></div>${story}</div>
          <div class="clock-games">${clockGameIds.map(id => {
            const item = clockGames[id];
            const done = clockLevels.filter((_, level) => this.completed.has(levelKey(id, level))).length;
            return `<button type="button" data-clock-action="game" data-game="${id}"><span class="clock-icon" aria-hidden="true">${item.icon}</span><strong>${item.name}</strong><span>${item.description}</span><small>${done} / ${clockLevels.length} niveaux faits</small></button>`;
          }).join('')}</div>`;
      case 'story':
        return `<div class="clock-top">${catalogue}<span>${this.completed.size} / ${levelKeys.length} niveaux faits</span></div>
          <header class="clock-center clock-story-intro"><span class="clock-kicker">L’HISTOIRE DU LAPIN</span>${title(clockStoryTitle)}<p>${clockStoryIntro}</p></header>
          <ol class="clock-chapters">${clockFriends.map(friend => friend.at <= this.completed.size
            ? `<li class="clock-chapter" data-friend="${friend.id}">${clockFriendArt(friend)}<div><span class="clock-kicker">${friend.name}</span><h3>${friend.title}</h3><p>${friend.story}</p></div></li>`
            : `<li class="clock-chapter clock-chapter-locked"><span class="clock-mystery" aria-hidden="true">?</span><div><h3>Un ami mystère</h3><p>Il te rejoint à ${friend.at} niveaux faits.</p></div></li>`).join('')}</ol>
          <div class="clock-story-end"><h3>Le dernier chapitre</h3>${this.storyComplete ? finale : `<p>Termine les ${levelKeys.length} niveaux pour voir la fin animée.</p>`}</div>`;
      case 'finale':
        return `<div class="clock-top"><button type="button" class="secondary-button" data-clock-action="leave-finale">${this.finaleReturn === 'results' ? '← Mon bilan' : '← L’histoire'}</button><span>LE DERNIER CHAPITRE</span></div>
          <header class="clock-center">${title('Enfin l’heure du goûter&nbsp;!')}</header>${clockFinaleScene()}
          <p class="clock-finale-caption" role="status">${clockFinaleCaptions[0]}</p>
          <div class="clock-actions"><button type="button" class="secondary-button" data-clock-action="finale" hidden>Revoir l’animation</button></div>`;
      case 'levels':
        return `<div class="clock-top">${catalogue}</div><div class="clock-center"><span class="clock-icon" aria-hidden="true">${game.icon}</span>${title(game.name)}<p>${game.description}</p><p>Choisis ton niveau. Les ${roundLength} questions s’enchaînent pendant que le chrono tourne.</p></div>
          <div class="clock-games clock-levels">${clockLevels.map((level, index) => `<button type="button" data-clock-action="level" data-level="${index}"><span class="clock-icon" aria-hidden="true">${level.icon}</span><strong>${level.name}</strong><span>${game.skills[index]}</span><small>${level.seconds} secondes</small>${this.completed.has(levelKey(this.game, index)) ? '<span class="clock-done">✓ Fait</span>' : ''}</button>`).join('')}</div>`;
      case 'paused':
        return `<div class="clock-center"><span class="clock-icon" aria-hidden="true">⏸️</span>${title('Petite pause')}
          <p>Ton chrono t’attend.</p><div class="clock-actions"><button type="button" class="play-button" data-clock-action="resume">On continue !</button>${catalogue}</div></div>`;
      case 'results': {
        const finished = this.index === roundLength;
        const answered = this.index === 1 ? '1 question jouée' : `${this.index} questions jouées`;
        const successes = this.score === 1 ? '1 bonne réponse' : `${this.score} bonnes réponses`;
        return `<div class="clock-center"><img src="/themes/lapin-chrono.svg" alt="" width="144" height="144">${title(finished ? 'Bien joué !' : 'Le chrono a sonné !')}
          <p><strong>${successes}</strong> · ${answered} sur ${roundLength}</p>${finished ? `<p><span class="clock-done">✓ Niveau fait</span> ${clockLevels[this.level].name}</p>` : '<p>Chaque essai t’aide à mieux apprivoiser le temps.</p>'}
          ${this.arrival ? `<div class="clock-arrival" role="status">${clockFriendArt(this.arrival)}<div><strong>${this.arrival.name} te rejoint !</strong><p>${this.arrival.story}</p></div></div>` : ''}
          <div class="clock-actions"><button type="button" class="play-button" data-clock-action="replay">Rejouer</button>${catalogue}${this.arrival ? story : ''}${this.storyComplete ? finale : ''}</div></div>`;
      }
      case 'playing': {
        const question = this.questions[this.index];
        const banner = `<div class="clock-top"><span>${game.name} · ${clockLevels[this.level].name}</span><span>Question ${this.index + 1} sur ${roundLength}</span></div>
          <div class="clock-timer"><progress class="clock-progress" aria-label="Temps restant" max="${clockLevels[this.level].seconds}"></progress><span id="clock-time" role="timer"></span>
          <button type="button" class="secondary-button" data-clock-action="pause">Pause</button></div>`;
        return `${banner}<div class="clock-center">${title(question.prompt)}${question.detail ? `<p>${question.detail}</p>` : ''}${question.face === undefined ? '' : clockFace(question.face)}</div>
          <div class="clock-options">${question.options.map((option, index) => `<button type="button" data-clock-action="answer" data-option="${index}">${typeof option === 'number' ? clockFace(option) : option}</button>`).join('')}</div>`;
      }
    }
  }
}
