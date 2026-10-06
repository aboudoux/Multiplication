import { themes, type ThemeId } from "./themes";
/** Sparse rewards, independent from gameplay timing and question selection. */
export class ThemeSurprises {
  private theme: ThemeId = "star";
  private untilNext = 3;
  private next = 0;
  private endsAt = 0;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)");
  constructor(private layer: HTMLElement, private random = Math.random) {}
  setTheme(theme: ThemeId): void { this.theme = theme; this.reset(); }
  reset(): void { this.clear(); this.untilNext = 3; this.next = 0; }
  clear(): void { this.layer.replaceChildren(); delete this.layer.dataset.effect; this.endsAt = 0; }
  success(now: number): boolean {
    const effects = themes[this.theme].surprises;
    if (!effects.length || --this.untilNext > 0) return false;
    this.untilNext = 3 + Math.min(2, Math.floor(this.random() * 3));
    const effect = effects[this.next++ % effects.length];
    this.clear();
    if (this.reduced.matches) return false;
    this.layer.dataset.effect = effect.id;
    this.layer.innerHTML = Array.from({ length: effect.count }, (_, i) => {
      const legacy = effect.id === "bats" ? "surprise-bat" : effect.id === "witch" ? "surprise-witch" : "";
      return `<span class="surprise-actor motion-${effect.motion} ${legacy}" style="--i:${i};--y:${8 + (i % 5) * 13}%;--x:${5 + i * 89 / Math.max(1,effect.count-1)}%;--size:${effect.count === 1 ? 200 : effect.motion === "hop" ? 145 : 42 + (i % 4) * 12}px">${effect.artwork}</span>`;
    }).join("");
    this.endsAt = now + (this.theme === "halloween" ? 2400 : 3000);
    return true;
  }
  frame(now: number): void {
    if (this.endsAt && (now >= this.endsAt || this.reduced.matches)) this.clear();
  }
}
