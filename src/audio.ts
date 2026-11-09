import { themes, type ThemeId } from "./themes";
import type { Calculation } from "./calculations";
import { QuestionVoice, type VoiceStyle } from "./voice";

const clubMusic = {
  melody: [392,493.88,587.33,0,523.25,493.88,440,0,349.23,440,523.25,0,493.88,440,392,0],
  bass: [196,174.61,174.61,196], beat: .3, noteLength: .24, bassLength: .27,
};
const rabbitMusic = {
  melody: [261.63,0,329.63,392,440,0,392,329.63,293.66,0,349.23,440,392,0,329.63,293.66],
  bass: [130.81,110,146.83,98], beat: .48, noteLength: .76, bassLength: 1.85,
};

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
  voiceStyle: VoiceStyle = "classic";
  private theme: ThemeId = "star";
  private sources = new Set<AudioScheduledSourceNode>();
  setTheme(theme: ThemeId): void {
    if (theme === this.theme) return;
    for (const source of this.sources) { try { source.stop(); } catch { /* Already ended. */ } }
    this.sources.clear();
    this.stopSpeech();
    this.theme = theme;
    this.beat = 0;
    this.playing = false;
  }
  transform(): void {
    themes[this.theme].danceNotes.slice(0, 4).forEach((n,i) => this.tone(n, i * .07, .2, .15));
    if (this.theme === "kitten") this.meow(.06);
  }

  surprise(): void {
    const notes = themes[this.theme].danceNotes;
    [0, 2, 4, 7].forEach((index,i) => this.tone(notes[index], i * .055, .16, .08, themes[this.theme].music.timbre));
    if (this.theme === "kitten") this.meow();
  }
  get speechStatus() {
    return this.voice?.status ?? "idle";
  }

  prepareQuestions(questions: readonly Calculation[]): void {
    this.voice?.prepare(questions);
  }

  questionPrepared(question: Calculation): boolean {
    return this.voice?.isPrepared(question) ?? true;
  }

  speakQuestion(question: Calculation, retry = false): void {
    if (this.muted) return;
    if (retry) void this.voice?.speak(question, this.voiceStyle);
    else this.voice?.speakPrepared(question, this.voiceStyle);
  }

  stopSpeech(): void {
    this.voice?.stop();
  }

  disappointment(): void {
    if (!this.muted) void this.voice?.sigh();
  }

  async unlock(): Promise<void> {
    try {
      // On iOS, request media playback rather than the default ambient channel.
      // Unsupported/blocked Audio Session APIs must not prevent Web Audio.
      try {
        const session=(navigator as Navigator & {audioSession?: {type:string}}).audioSession;
        if (session && !this.muted) session.type='playback';
      } catch { /* Optional browser capability. */ }
      if (this.context?.state === 'closed') {
        this.stopSpeech();this.context=null;this.master=null;this.voice=null;
      }
      this.context ??= new AudioContext();
      if (!this.master) {
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : 0.42;
        this.master.connect(this.context.destination);
        this.voice = new QuestionVoice(this.context, this.master);
      }
      // Safari also interrupts audio after backgrounding or an audio-session change.
      if (this.context.state !== "running") await this.context.resume();
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

  missionUnlocked(): void {
    [784, 988, 1319].forEach((note, i) => this.tone(note, i * .09, .18, .12, 'triangle'));
  }

  /** Three soft notes for menu navigation, unlocked by the user's click. */
  async navigation(): Promise<void> {
    if (this.muted) return;
    await this.unlock();
    // Event listeners can yield to promises before the destination handler runs.
    // Unlock during the gesture, then play once the whole click has finished.
    await new Promise<void>(resolve=>setTimeout(resolve,0));
    [523.25, 659.25, 783.99].forEach((note, i) => this.tone(note, i * .085, .16, .18, 'triangle'));
  }

  get ready(): boolean { return this.context?.state==='running'; }

  private homePlaying = false;
  private rabbitPlaying = false;
  private menuSources = new Set<OscillatorNode>();
  private readonly clockSources = new Set<OscillatorNode>();
  private homeBeat = 0;
  private nextHomeBeat = 0;
  /** Music-box loops for the menus and the rabbit arcade. */
  homeMusic(active: boolean, rabbit = false): void {
    const ctx=this.context;
    const audible=active && !this.muted && ctx?.state==='running';
    if (!audible || this.rabbitPlaying !== rabbit) {
      for (const source of this.menuSources) { try {source.stop();} catch { /* Already ended. */ } }
      this.menuSources.clear();this.homePlaying=false;this.homeBeat=0;
      this.rabbitPlaying=rabbit;
    }
    if (!audible) return;
    if (!this.homePlaying) { this.homePlaying=true; this.nextHomeBeat=ctx.currentTime+(rabbit ? 0 : .65); }
    if (ctx.currentTime<this.nextHomeBeat) return;
    const music = rabbit ? rabbitMusic : clubMusic;
    this.nextHomeBeat=ctx.currentTime+music.beat;
    const note=music.melody[this.homeBeat%music.melody.length];
    if (note) this.tone(note,0,music.noteLength,rabbit ? .087 : .055,'sine',this.menuSources);
    if (this.homeBeat%4===0) this.tone(music.bass[Math.floor(this.homeBeat/4)%music.bass.length],0,music.bassLength,rabbit ? .042 : .025,'sine',this.menuSources);
    if (rabbit && this.homeBeat%4===2) this.tone(note * 1.5,.12,.25,.028,'triangle',this.menuSources);
    this.homeBeat++;
  }

  private tone(
    frequency: number,
    delay = 0,
    length = 0.13,
    volume = 0.2,
    type: OscillatorType = "sine",
    group?: Set<OscillatorNode>,
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
    group?.add(oscillator);
    if (group !== this.menuSources) this.sources.add(oscillator);
    oscillator.start(start);
    oscillator.stop(start + length + 0.02);
    oscillator.onended = () => {
      group?.delete(oscillator);
      this.sources.delete(oscillator);
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  /** A short, gentle cartoon miaow: a rising pitch and a closing vowel. */
  private meow(delay = 0): void {
    const ctx = this.context;
    if (!ctx || !this.master || ctx.state !== "running" || this.muted) return;
    const voice = ctx.createOscillator();
    const vowel = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const at = ctx.currentTime + delay;
    voice.type = "sawtooth";
    voice.frequency.setValueAtTime(520, at);
    voice.frequency.exponentialRampToValueAtTime(820, at + .08);
    voice.frequency.exponentialRampToValueAtTime(630, at + .19);
    voice.frequency.exponentialRampToValueAtTime(390, at + .42);
    vowel.type = "lowpass";
    vowel.Q.value = 1.5;
    vowel.frequency.setValueAtTime(2100, at);
    vowel.frequency.exponentialRampToValueAtTime(700, at + .42);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(.14, at + .025);
    gain.gain.exponentialRampToValueAtTime(.001, at + .44);
    voice.connect(vowel);
    vowel.connect(gain);
    gain.connect(this.master);
    this.sources.add(voice);
    voice.start(at);
    voice.stop(at + .46);
    voice.onended = () => {
      this.sources.delete(voice);
      voice.disconnect();
      vowel.disconnect();
      gain.disconnect();
    };
  }

  countdown(value: number): void {
    this.tone(
      value === 0 ? (this.theme === "halloween" ? 1175 : 880) : (this.theme === "halloween" ? 587 : 440),
      0,
      value === 0 ? 0.3 : 0.15,
      0.32,
      "triangle",
    );
    if (value === 0) this.tone(1320, 0.07, 0.25, 0.15);
  }
  key(): void {
    const theme = themes[this.theme];
    this.tone(theme.danceNotes[2], 0, 0.055, 0.045, theme.music.timbre);
  }
  warning(): void {
    this.tone(740, 0, 0.08, 0.16, "triangle");
  }
  success(milestone = false): void {
    const notes = themes[this.theme].danceNotes;
    (milestone ? notes.slice(0,4) : [notes[1], notes[3]]).forEach((note,i) =>
      this.tone(note, i*.08, .24, .18, themes[this.theme].music.timbre));
  }
  clockAnswer(correct: boolean): void {
    for (const source of this.clockSources) { try { source.stop(); } catch { /* Already ended. */ } }
    this.clockSources.clear();
    if (correct) {
      [698.46, 880, 1046.5, 1396.91].forEach((note, index) =>
        this.tone(note, index * .07, .17, .18, 'triangle', this.clockSources));
      this.tone(174.61, .08, .16, .12, 'sine', this.clockSources);
    } else {
      [124, 92].forEach((note, index) => {
        this.tone(note, index * .22, .16, .25, 'triangle', this.clockSources);
        this.tone(note / 2, index * .22, .19, .15, 'sine', this.clockSources);
      });
    }
  }
  error(): void {
    // A long, low double buzzer with a square-wave growl, not a piercing beep.
    this.tone(155, 0, 0.3, 0.48, "sawtooth");
    this.tone(93, 0.17, 0.43, 0.48, "square");
    this.tone(46.5, 0.17, 0.44, 0.28, "sine");
  }
  victory(): void {
    (this.theme === "halloween" ? [587,698,880,1175,880,1175,1397] : [523, 659, 784, 1047, 784, 1047, 1319]).forEach((note, i) =>
      this.tone(note, i * 0.15, 0.35, 0.25, "triangle"),
    );
  }
  suspendReward(paused: boolean): void {
    if (!this.context) return;
    if (paused) void this.context.suspend().catch(() => {});
    else void this.context.resume().catch(() => {});
  }
  victoryDance(durationMs?: number): void {
    if (this.theme === "kitten") { this.meow(.05); this.meow(3.4); }
    const beat = 60 / themes[this.theme].music.bpm;
    const melody = themes[this.theme].danceNotes;
    const notes = durationMs ? Array.from({length:Math.max(1,Math.floor((durationMs/1000-.6)/beat))},(_,i)=>melody[i%melody.length]) : melody;
    notes.forEach((note, i) => {
      const at = i * beat;
      this.tone(note, at, beat * 0.78, .2, themes[this.theme].music.timbre);
      this.tone(note / 2, at, beat * 0.68, 0.07, "sine");
      this.tone(themes[this.theme].music.bass[Math.floor(i / 4) % 4], at, beat * 0.7, 0.16);
      this.tone(68, at, 0.11, 0.27, "sine");
      this.percussion(i % 2 ? 0.15 : 0.07, i % 2 === 1, at);
      this.percussion(0.045, false, at + beat / 2);
    });
    this.tone(melody[0], (durationMs ? notes.length : 11) * beat, durationMs ? .45 : beat * 1.15, 0.16, "triangle");
  }
  end(): void {
    (this.theme === "halloween" ? [349,294,220] : [330, 294, 220]).forEach((note, i) =>
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
    this.sources.add(source);
    source.start(start);
    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  ambience(active: boolean, progress: number, urgent: boolean): void {
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
    this.nextBeat = ctx.currentTime + 60 / themes[this.theme].music.bpm / 2;
    const notes = themes[this.theme].melody;
    const note = notes[this.beat % notes.length];
    // Bouncy 126 BPM backing, ducked while the question is being read aloud.
    const duck =
      this.speechStatus === "speaking" || this.speechStatus === "loading"
        ? 0.12
        : 1;
    if (!urgent) {
      if (note) {
        this.tone(note, 0, .16, .065 * duck, themes[this.theme].music.timbre);
        if (themes[this.theme].music.sparkle) this.tone(note * themes[this.theme].music.sparkle, .045, .24, .025 * duck);
      }
      if (this.beat % 2 === 0) this.tone(70, 0, 0.11, 0.24 * duck);
      this.percussion(
        (this.beat % 4 === 2 ? 0.11 : 0.045) * duck,
        this.beat % 4 === 2,
      );
      if (progress >= 25 && this.beat % 2 === 0)
        this.tone(
          themes[this.theme].music.bass[Math.floor(this.beat / 4) % 4],
          0,
          0.2,
          0.15 * duck,
          "triangle",
        );
      if (progress >= 50 && note && this.beat % 4 === 3)
        this.tone(note * 2, 0.12, 0.13, 0.065 * duck);
      if (progress >= 75 && note) this.tone(note * 1.5, 0, 0.15, 0.04 * duck);
    }
    this.beat++;
  }
}
