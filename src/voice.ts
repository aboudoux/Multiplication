import { voicePath } from "./calculations";
import type { Calculation } from "./calculations";
export type VoiceStatus = "idle" | "loading" | "speaking" | "unavailable";

/** Bundled French prompts work without a device-specific speech service. */
export class QuestionVoice {
  status: VoiceStatus = "idle";
  private generation = 0;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private cache = new Map<string, Promise<AudioBuffer>>();

  constructor(
    private context: AudioContext,
    private output: AudioNode,
  ) {}

  async speak(question: Calculation): Promise<void> {
    this.stop();
    await this.play(voicePath(question));
  }

  async sigh(): Promise<void> {
    this.stop();
    await this.play("/sounds/crowd-disappointed.wav", 0.55, 1);
  }

  private async play(url: string, delay = 0, volume = 1.6): Promise<void> {
    const generation = this.generation;
    this.status = "loading";
    try {
      let pending = this.cache.get(url);
      if (!pending) {
        pending = fetch(url).then(async (response) => {
          if (!response.ok) throw new Error("Voice unavailable");
          return this.context.decodeAudioData(await response.arrayBuffer());
        });
        this.cache.set(url, pending);
        void pending.catch(() => this.cache.delete(url));
      }
      const buffer = await pending;
      // A fast answer, pause, mute, or new question invalidates older downloads.
      if (generation !== this.generation) return;
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      gain.gain.value = volume;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(this.output);
      this.source = source;
      this.gain = gain;
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (generation === this.generation) {
          this.source = null;
          this.gain = null;
          this.status = "idle";
        }
      };
      if (delay > 0) source.start(this.context.currentTime + delay);
      else source.start();
      this.status = "speaking";
    } catch {
      if (generation === this.generation) {
        this.stop();
        this.status = "unavailable";
      }
    }
  }

  stop(): void {
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
    this.status = "idle";
  }
}
