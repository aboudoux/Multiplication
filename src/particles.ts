interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
  rotation: number;
}
export class Particles {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D | null;
  private width = 0;
  private height = 0;
  private previous = 0;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)");
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
  }
  private resize(): void {
    const bounds = this.canvas.getBoundingClientRect();
    this.width = bounds.width;
    this.height = bounds.height;
    const scale = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = this.width * scale;
    this.canvas.height = this.height * scale;
    this.ctx?.setTransform(scale, 0, 0, scale, 0, 0);
  }
  burst(big = false): void {
    if (this.reduced.matches) return;
    const colors = ["#ffe54b", "#4dffd2", "#ff6d9e", "#ffffff", "#ab8bff"];
    for (let i = 0; i < (big ? 180 : 45); i++) {
      this.particles.push({
        x: this.width * (big ? Math.random() : 0.4),
        y: this.height * (big ? 0.1 : 0.42),
        vx: (Math.random() - 0.5) * (big ? 330 : 250),
        vy: -80 - Math.random() * 210,
        age: 0,
        life: 0.8 + Math.random() * (big ? 2.2 : 0.7),
        size: 3 + Math.random() * 6,
        color: colors[i % colors.length],
        rotation: Math.random() * Math.PI,
      });
    }
    this.particles = this.particles.slice(-250);
  }
  frame(now: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const dt = Math.min((now - this.previous) / 1000, 0.04);
    this.previous = now;
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.reduced.matches) this.particles = [];
    this.particles = this.particles.filter((p) => p.age < p.life);
    for (const p of this.particles) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 210 * dt;
      p.rotation += dt * 2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
      ctx.restore();
    }
  }
}
