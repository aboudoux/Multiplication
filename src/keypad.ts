import type { ThemeId } from './themes';
import { ant } from './ants';

/** Decorative only: input is accepted by Game before this controller is called. */
export class ThemedKeypad {
  private theme: ThemeId | null = null;
  private generation = 0;
  private ready = false;
  private active = false;
  // Keep the original characters and both objects from each 3×3 atlas in rotation.
  private readonly popCells = [2,6,7,3,4,5];
  private nextPop = 0;
  private reactionTimeout: number | undefined;
  private readonly motion = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly companion = document.createElement('span');
  private readonly character = this.sprite(2, 'key-character');
  private readonly flashes = new Map<HTMLElement, number>();

  constructor(private readonly root: HTMLElement) {
    root.classList.add('themed-keypad');
    for (const button of root.querySelectorAll<HTMLButtonElement>('button')) {
      const label = document.createElement('span');
      label.className = 'key-label';
      while (button.firstChild) label.append(button.firstChild);
      const art = this.sprite(button.id === 'erase' ? 8 : 0, 'key-art');
      button.append(art, label);
      if(button.dataset.digit) button.append(this.sprite(2,'key-pop'));
    }
    this.companion.className = 'key-companion';
    this.companion.setAttribute('aria-hidden', 'true');
    const motion = document.createElement('span');
    motion.className = 'key-companion-motion';
    motion.append(this.character);
    this.companion.append(motion);
    root.querySelector('.pad-star')!.replaceWith(this.companion);
    this.motion.addEventListener('change', () => { this.clear(); this.updateCompanion(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
      this.updateCompanion();
    });
    window.addEventListener('pagehide', () => this.clear());
  }

  private sprite(cell: number, className: string): HTMLSpanElement {
    const el = document.createElement('span');
    el.className = `key-sprite ${className}`;
    el.setAttribute('aria-hidden', 'true');
    el.style.backgroundPosition = `${cell % 3 * 50}% ${Math.floor(cell / 3) * 50}%`;
    return el;
  }

  setTheme(theme: ThemeId): void {
    if (theme === this.theme) return;
    this.theme = theme;
    this.nextPop = 0;
    this.clear();
    this.ready = false;
    this.root.classList.remove('key-art-ready');
    this.root.dataset.keyTheme = theme;
    this.updateCompanion();
    const generation = ++this.generation;
    this.character.innerHTML = '';
    if (theme === 'ant') {
      this.character.innerHTML = ant();
      this.ready = true;
      this.updateCompanion();
      return;
    }
    const url = `${import.meta.env.BASE_URL}themes/keypad-${theme}.png`;
    const image = new Image();
    image.src = url;
    void image.decode().then(() => {
      if (generation !== this.generation) return;
      this.root.style.setProperty('--key-atlas', `url("${url}")`);
      this.ready = true;
      this.root.classList.add('key-art-ready');
      this.updateCompanion();
    }).catch(() => { /* Keep the colorful, fully functional fallback keys. */ });
  }

  setActive(active: boolean): void {
    if (active === this.active) return;
    this.active = active;
    if (!active) this.clear();
    this.updateCompanion();
  }

  private updateCompanion(): void {
    this.character.hidden = !this.ready;
    this.companion.classList.toggle('is-animated', this.active && this.ready && !this.motion.matches && !document.hidden);
  }

  press(digit: string): void {
    const button = this.root.querySelector<HTMLElement>(`[data-digit="${digit}"]`);
    if (button) this.animate(button, false);
  }

  erase(): void {
    const button = this.root.querySelector<HTMLElement>('#erase');
    if (button) this.animate(button, true);
  }

  private animate(button: HTMLElement, erase: boolean): void {
    if (!this.active || document.hidden) return;
    clearTimeout(this.flashes.get(button));
    button.classList.remove('key-pressed');
    const pop=button.querySelector<HTMLElement>('.key-pop');
    if(pop && this.ready && this.theme!=='ant' && !this.motion.matches) {
      const cell=this.popCells[this.nextPop++ % this.popCells.length];
      pop.style.backgroundPosition=`${cell % 3 * 50}% ${Math.floor(cell / 3) * 50}%`;
    }
    void button.offsetWidth;
    button.classList.add('key-pressed');
    this.flashes.set(button, window.setTimeout(() => {
      button.classList.remove('key-pressed');
      this.flashes.delete(button);
    }, 600));
    if (!this.ready || this.motion.matches) return;
    clearTimeout(this.reactionTimeout);
    this.character.classList.remove('key-react', 'key-react-erase');
    // Restart the same character's reaction, even during rapid input.
    void this.character.offsetWidth;
    this.character.classList.add(erase ? 'key-react-erase' : 'key-react');
    this.reactionTimeout = window.setTimeout(() => {
      this.character.classList.remove('key-react', 'key-react-erase');
      this.reactionTimeout = undefined;
    }, 600);
  }

  clear(): void {
    clearTimeout(this.reactionTimeout);
    this.reactionTimeout = undefined;
    this.character.classList.remove('key-react', 'key-react-erase');
    for (const [button, timeout] of this.flashes) {
      clearTimeout(timeout);
      button.classList.remove('key-pressed');
    }
    this.flashes.clear();
  }
}
