import { clockFace, clockGameIds, clockGames, clockLevels, clockRound, roundLength, type ClockGame, type ClockQuestion } from './clock-games';

type Level = Parameters<typeof clockRound>[1];
type Screen = 'catalogue' | 'levels' | 'playing' | 'paused' | 'results';
const rabbitEvery = 5;

export class ClockArcade {
  readonly root = document.createElement('section');
  private readonly content = document.createElement('div');
  private readonly feedback = document.createElement('p');
  private readonly burst = document.createElement('div');
  private readonly parade = document.createElement('div');
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

  constructor(private readonly goHome: () => void, private readonly playSuccess: (milestone: boolean) => void) {
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
    this.root.addEventListener('click', event => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button');
      if (!button || button.disabled) return;
      const now = performance.now();
      switch (button.dataset.clockAction) {
        case 'home': this.goHome(); break;
        case 'catalogue': this.open(); break;
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
    if (!this.playing) return;
    this.remaining = Math.max(0, this.deadline - now);
    if (this.remaining === 0) this.show('results');
    else this.updateTimer();
  }

  pause(now: number): void {
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
    this.show(this.index === this.questions.length ? 'results' : 'playing');
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

    switch (this.screen) {
      case 'catalogue':
        return `<div class="clock-top"><button type="button" class="secondary-button" data-clock-action="home">← Accueil</button><span>6 JEUX · 3 NIVEAUX</span></div>
          <header class="clock-intro"><img src="/themes/lapin-chrono.svg" alt="" width="144" height="144"><div><span class="clock-kicker">LE COIN DES 5–8 ANS</span>${title('Les jeux du lapin chrono')}<p>Lis l’heure, compare les durées et joue avec les aiguilles. Par quel jeu veux-tu commencer ?</p></div></header>
          <div class="clock-games">${clockGameIds.map(id => {
            const item = clockGames[id];
            return `<button type="button" data-clock-action="game" data-game="${id}"><span class="clock-icon" aria-hidden="true">${item.icon}</span><strong>${item.name}</strong><span>${item.description}</span></button>`;
          }).join('')}</div>`;
      case 'levels':
        return `<div class="clock-top">${catalogue}</div><div class="clock-center"><span class="clock-icon" aria-hidden="true">${game.icon}</span>${title(game.name)}<p>${game.description}</p><p>Choisis ton niveau. Les ${roundLength} questions s’enchaînent pendant que le chrono tourne.</p></div>
          <div class="clock-games clock-levels">${clockLevels.map((level, index) => `<button type="button" data-clock-action="level" data-level="${index}"><span class="clock-icon" aria-hidden="true">${level.icon}</span><strong>${level.name}</strong><span>${game.skills[index]}</span><small>${level.seconds} secondes</small></button>`).join('')}</div>`;
      case 'paused':
        return `<div class="clock-center"><span class="clock-icon" aria-hidden="true">⏸️</span>${title('Petite pause')}
          <p>Ton chrono t’attend.</p><div class="clock-actions"><button type="button" class="play-button" data-clock-action="resume">On continue !</button>${catalogue}</div></div>`;
      case 'results': {
        const finished = this.index === roundLength;
        const answered = this.index === 1 ? '1 question jouée' : `${this.index} questions jouées`;
        const successes = this.score === 1 ? '1 bonne réponse' : `${this.score} bonnes réponses`;
        return `<div class="clock-center"><img src="/themes/lapin-chrono.svg" alt="" width="144" height="144">${title(finished ? 'Bien joué !' : 'Le chrono a sonné !')}
          <p><strong>${successes}</strong> · ${answered} sur ${roundLength}</p><p>Chaque essai t’aide à mieux apprivoiser le temps.</p>
          <div class="clock-actions"><button type="button" class="play-button" data-clock-action="replay">Rejouer</button>${catalogue}</div></div>`;
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
