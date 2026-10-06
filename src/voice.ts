import { voicePath } from "./calculations";
import type { Calculation } from "./calculations";
import { voiceProfiles, voiceRates, type VoiceStyle } from "./voice-profiles";
export { voiceRates, type VoiceStyle } from "./voice-profiles";
export type VoiceStatus = "idle" | "loading" | "speaking" | "unavailable";
export type VoiceCompletion = 'ended' | 'unavailable' | 'interrupted';
export const VOICE_LOAD_TIMEOUT_MS = 5000;
const STUDY_TOKEN_REVISION='2';
interface VoiceClip {
  state: "loading" | "ready" | "unavailable";
  buffer?: AudioBuffer;
  pending: Promise<AudioBuffer>;
}

/** Bundled French prompts work without a device-specific speech service. */
export class QuestionVoice {
  status: VoiceStatus = "idle";
  private generation = 0;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private cache = new Map<string, VoiceClip>();
  private completion: ((reason: VoiceCompletion) => void) | null = null;
  private completionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private context: AudioContext,
    private output: AudioNode,
  ) {}

  /** Preparation is silent and does not interrupt the current narration. */
  prepare(questions: readonly Calculation[]): void {
    for (const question of questions) this.load(voicePath(question));
  }

  isPrepared(question: Calculation): boolean {
    // A failed clip must not block the visual game or start playing late.
    return this.load(voicePath(question)).state !== "loading";
  }

  /** Called in the same render as the equation: no download or async decoding. */
  speakPrepared(question: Calculation, style: VoiceStyle = "classic", onComplete?: (reason: VoiceCompletion) => void): void {
    this.stop();
    this.completion = onComplete ?? null;
    const clip = this.cache.get(voicePath(question));
    if (clip?.state !== "ready" || !clip.buffer) {
      this.terminate('unavailable');
      return;
    }
    this.startBuffer(clip.buffer, 0, 1.6, style, this.generation);
  }

  async speak(question: Calculation, style: VoiceStyle = "classic", onComplete?: (reason: VoiceCompletion) => void): Promise<void> {
    this.stop();
    this.completion = onComplete ?? null;
    await this.play(voicePath(question), 0, 1.6, style);
  }

  async sigh(): Promise<void> {
    this.stop();
    await this.play("/sounds/crowd-disappointed.wav", 0.55, 1);
  }

  private load(url: string, retry = false): VoiceClip {
    const existing = this.cache.get(url);
    if (existing && !(retry && existing.state === "unavailable")) return existing;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout>;
    const limit = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("Voice preparation timed out"));
      }, VOICE_LOAD_TIMEOUT_MS);
    });
    const composed = url.match(/^\/voice\/fr\/composed\/(add|subtract|multiply)\/(\d+)-(\d+)$/);
    const study=url.startsWith('/voice/fr/study/')?url.slice('/voice/fr/study/'.length).split('~'):null;
    const download = study ? this.composeTokens(study) : composed ? this.compose(composed[1],composed[2],composed[3]) : fetch(url, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Voice unavailable");
      return this.context.decodeAudioData(await response.arrayBuffer());
    });
    const clip: VoiceClip = { state: "loading", pending: Promise.race([download, limit]) };
    clip.pending = clip.pending.then(buffer => {
      clip.buffer = buffer;
      clip.state = "ready";
      return buffer;
    }, error => {
      clip.state = "unavailable";
      throw error;
    }).finally(() => clearTimeout(timeout));
    // Prefetch failures are reported only if that question is presented.
    void clip.pending.catch(() => {});
    this.cache.set(url, clip);
    return clip;
  }

  private async compose(operation: string, a: string, b: string): Promise<AudioBuffer> {
    return this.composeTokens([a,operation,b]);
  }
  private async composeTokens(tokens:string[]):Promise<AudioBuffer> {
    if(!tokens.length||tokens.length>120||tokens.some(token=>!/^([a-zA-Z]+|\d{1,9}(d\d{1,9})?)$/.test(token)))throw new Error('Invalid narration');
    // Changed word recordings need new cache keys; existing table/number clips keep theirs.
    const parts = await Promise.all(tokens.map(token=>{
      const revised=/^[a-zA-Z]+$/.test(token)&&!['add','subtract','multiply'].includes(token);
      return this.load(`/voice/fr/tokens/${token}.wav${revised?`?v=${STUDY_TOKEN_REVISION}`:''}`,true).pending;
    }));
    const rate=parts[0].sampleRate;
    const gap=Math.round(rate*.085);
    const buffer=this.context.createBuffer(1,parts.reduce((n,p)=>n+p.length,0)+gap*(parts.length-1),rate);
    const output=buffer.getChannelData(0);
    let offset=0;
    for (const part of parts) { output.set(part.getChannelData(0),offset); offset+=part.length+gap; }
    // Large sessions must not retain thousands of decoded composed announcements.
    const completed=[...this.cache].filter(([key,clip])=>(key.includes('/composed/')||key.includes('/study/')) && clip.state!=='loading');
    for (const [key] of completed.slice(0,Math.max(0,completed.length-24))) this.cache.delete(key);
    return buffer;
  }

  private async play(url: string, delay = 0, volume = 1.6, style: VoiceStyle = "classic"): Promise<void> {
    const generation = this.generation;
    this.status = "loading";
    try {
      const buffer = await this.load(url, true).pending;
      // A fast answer, pause, mute, or new question invalidates older downloads.
      if (generation !== this.generation) return;
      this.startBuffer(buffer, delay, volume, style, generation);
    } catch {
      if (generation === this.generation) {
        this.terminate('unavailable');
      }
    }
  }

  private startBuffer(buffer: AudioBuffer, delay: number, volume: number, style: VoiceStyle, generation: number): void {
    try {
      if (this.completion && this.context.state && this.context.state !== 'running') {
        this.terminate('unavailable');
        return;
      }
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      gain.gain.value = volume;
      source.buffer = buffer;
      source.playbackRate.value = voiceRates[style];
      const tremolo = voiceProfiles[style].tremolo;
      if (tremolo) {
        // A shallow, dry modulation keeps consonants and numbers clear.
        const start = this.context.currentTime + delay;
        const duration = buffer.duration / voiceRates[style];
        for (let t = 0; t < duration; t += 1 / (tremolo * 8)) {
          gain.gain.setValueAtTime(volume * (.88 + .12 * Math.sin(t * Math.PI * 2 * tremolo)), start + t);
        }
      }
      source.connect(gain);
      gain.connect(this.output);
      this.source = source;
      this.gain = gain;
      source.onended = () => {
        if (generation !== this.generation || this.source !== source) return;
        source.disconnect();
        gain.disconnect();
        this.source = null;
        this.gain = null;
        this.status = "idle";
        this.complete('ended');
      };
      if (delay > 0) source.start(this.context.currentTime + delay);
      else source.start();
      this.status = "speaking";
      if (this.completion) {
        this.completionTimer = setTimeout(() => {
          if (generation === this.generation && this.source === source) this.terminate('unavailable');
        }, Math.max(0, (delay + buffer.duration / voiceRates[style]) * 1000) + 1000);
      }
    } catch {
      if (generation === this.generation) {
        this.terminate('unavailable');
      }
    }
  }

  stop(): void {
    this.terminate('interrupted');
  }

  private complete(reason: VoiceCompletion): void {
    if (this.completionTimer !== null) clearTimeout(this.completionTimer);
    this.completionTimer = null;
    const callback = this.completion;
    this.completion = null;
    callback?.(reason);
  }

  private terminate(reason: VoiceCompletion): void {
    this.generation++;
    if (this.source) {
      this.source.onended = null;
      try {
        this.source.stop();
      } catch {
        /* A failed start may leave an unstarted node. */
      }
      this.source.disconnect();
    }
    this.gain?.disconnect();
    this.source = null;
    this.gain = null;
    this.status = reason === 'unavailable' ? 'unavailable' : 'idle';
    this.complete(reason);
  }
}
