import type { Calculation } from "./calculations";
import { QuestionVoice } from "./voice";

/** Original synthesized arcade sounds and bundled French voice prompts. */
export class GameAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private nextBeat = 0;
  private beat = 0;
  private playing = false;
  private voice: QuestionVoice | null = null;
  private percussionBuffer: AudioBuffer | null = null;
  muted = false;

  get speechStatus() {
    return this.voice?.status ?? "idle";
  }

  speakQuestion(question: Calculation): void {
    if (!this.muted) void this.voice?.speak(question);
  }

  stopSpeech(): void {
    this.voice?.stop();
  }

  disappointment(): void {
    if (!this.muted) void this.voice?.sigh();
  }

  async unlock(): Promise<void> {
    try {
      this.context ??= new AudioContext();
      if (!this.master) {
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : 0.42;
        this.master.connect(this.context.destination);
        this.voice = new QuestionVoice(this.context, this.master);
      }
      if (this.context.state === "suspended") await this.context.resume();
    } catch {
      /* The visual game remains fully usable without audio support. */
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stopSpeech();
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(
        muted ? 0 : 0.42,
        this.context.currentTime,
        0.025,
      );
  }

  /** Three soft notes for menu navigation, unlocked by the user's click. */
  async navigation(): Promise<void> {
    if (this.muted) return;
    await this.unlock();
    [523.25, 659.25, 783.99].forEach((note, i) => this.tone(note, i * .085, .14, .1, 'triangle'));
  }

  private homePlaying = false;
  private homeBeat = 0;
  private nextHomeBeat = 0;
  /** A gentle music-box loop for the club entrance, separate from game music. */
  homeMusic(active: boolean): void {
    const ctx=this.context;
    if (!active || this.muted || !ctx || ctx.state!=='running') { this.homePlaying=false; this.homeBeat=0; return; }
    if (!this.homePlaying) { this.homePlaying=true; this.nextHomeBeat=ctx.currentTime+.65; }
    if (ctx.currentTime<this.nextHomeBeat) return;
    this.nextHomeBeat=ctx.currentTime+.3;
    const melody=[392,493.88,587.33,0,523.25,493.88,440,0,349.23,440,523.25,0,493.88,440,392,0];
    const note=melody[this.homeBeat%melody.length];
    if (note) this.tone(note,0,.24,.055,'sine');
    if (this.homeBeat%4===0) this.tone([196,174.61,174.61,196][Math.floor(this.homeBeat/4)%4],0,.27,.025,'sine');
    this.homeBeat++;
  }

  private tone(
    frequency: number,
    delay = 0,
    length = 0.13,
    volume = 0.2,
    type: OscillatorType = "sine",
  ): void {
    const ctx = this.context;
    if (!ctx || !this.master || ctx.state !== "running" || this.muted) return;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const start = ctx.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(volume, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + length);
    oscillator.connect(envelope);
    envelope.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + length + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  countdown(value: number): void {
    this.tone(
      value === 0 ? 880 : 440,
      0,
      value === 0 ? 0.3 : 0.15,
      0.32,
      "triangle",
    );
    if (value === 0) this.tone(1320, 0.07, 0.25, 0.15);
  }
  key(): void {
    this.tone(650, 0, 0.045, 0.06);
  }
  warning(): void {
    this.tone(740, 0, 0.08, 0.16, "triangle");
  }
  success(milestone = false): void {
    (milestone ? [523, 659, 784, 1047] : [659, 880]).forEach((note, i) =>
      this.tone(note, i * 0.08, 0.24, 0.2, "triangle"),
    );
  }
  error(): void {
    // A long, low double buzzer with a square-wave growl, not a piercing beep.
    this.tone(155, 0, 0.3, 0.48, "sawtooth");
    this.tone(93, 0.17, 0.43, 0.48, "square");
    this.tone(46.5, 0.17, 0.44, 0.28, "sine");
  }
  victory(): void {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((note, i) =>
      this.tone(note, i * 0.15, 0.35, 0.25, "triangle"),
    );
  }
  victoryDance(): void {
    const beat = 60 / 126;
    const melody = [523, 659, 784, 1047, 880, 784, 659, 784, 1047, 1175, 1319, 1047];
    melody.forEach((note, i) => {
      const at = i * beat;
      this.tone(note, at, beat * 0.78, 0.26, "triangle");
      this.tone(note / 2, at, beat * 0.68, 0.07, "sine");
      this.tone(i < 4 ? 131 : i < 8 ? 175 : 196, at, beat * 0.7, 0.16);
      this.tone(68, at, 0.11, 0.27, "sine");
      this.percussion(i % 2 ? 0.15 : 0.07, i % 2 === 1, at);
      this.percussion(0.045, false, at + beat / 2);
    });
    this.tone(523, 11 * beat, beat * 1.15, 0.16, "triangle");
  }
  end(): void {
    [330, 294, 220].forEach((note, i) =>
      this.tone(note, 0.65 + i * 0.18, 0.3, 0.18, "triangle"),
    );
  }

  private percussion(volume: number, snare: boolean, delay = 0): void {
    const ctx = this.context;
    if (!ctx || !this.master || this.muted) return;
    if (!this.percussionBuffer) {
      this.percussionBuffer = ctx.createBuffer(
        1,
        Math.ceil(ctx.sampleRate * 0.09),
        ctx.sampleRate,
      );
      const data = this.percussionBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = this.percussionBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = snare ? 1600 : 6500;
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      start + (snare ? 0.08 : 0.035),
    );
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(start);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  ambience(active: boolean, solved: number, urgent: boolean): void {
    const ctx = this.context;
    if (!active || !ctx || this.muted || ctx.state !== "running") {
      this.playing = false;
      return;
    }
    if (!this.playing) {
      this.nextBeat = ctx.currentTime + 0.3;
      this.playing = true;
    }
    if (ctx.currentTime < this.nextBeat) return;
    this.nextBeat = ctx.currentTime + 60 / 126 / 2;
    const notes = [
      523, 0, 659, 784, 0, 659, 880, 784, 587, 0, 698, 880, 784, 698, 659, 0,
    ];
    const note = notes[this.beat % notes.length];
    // Bouncy 126 BPM backing, ducked while the question is being read aloud.
    const duck =
      this.speechStatus === "speaking" || this.speechStatus === "loading"
        ? 0.12
        : 1;
    if (!urgent) {
      if (note) this.tone(note, 0, 0.16, 0.09 * duck, "triangle");
      if (this.beat % 2 === 0) this.tone(70, 0, 0.11, 0.24 * duck);
      this.percussion(
        (this.beat % 4 === 2 ? 0.11 : 0.045) * duck,
        this.beat % 4 === 2,
      );
      if (solved >= 25 && this.beat % 2 === 0)
        this.tone(
          [131, 147, 175, 165][Math.floor(this.beat / 4) % 4],
          0,
          0.2,
          0.15 * duck,
          "triangle",
        );
      if (solved >= 50 && note && this.beat % 4 === 3)
        this.tone(note * 2, 0.12, 0.13, 0.065 * duck);
      if (solved >= 75 && note) this.tone(note * 1.5, 0, 0.15, 0.04 * duck);
    }
    this.beat++;
  }
}
