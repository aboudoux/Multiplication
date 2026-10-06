import { createPool } from "../../src/calculations";
const q = (a: number, b: number) => createPool("multiply").find(q => q.a === a && q.b === b)!;
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionVoice, VOICE_LOAD_TIMEOUT_MS } from "../../src/voice";

function setup() {
  const source = {
    buffer: null,
    playbackRate: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };
  const gain = { gain: { value: 0, setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
  const buffer = { duration: 1.5 };
  const context = {
    decodeAudioData: vi.fn().mockResolvedValue(buffer),
    createBufferSource: vi.fn(() => source),
    createGain: vi.fn(() => gain),
  };
  const response = () =>
    Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) });
  const fetchMock = vi.fn(response);
  vi.stubGlobal("fetch", fetchMock);
  const voice = new QuestionVoice(
    context as unknown as AudioContext,
    {} as AudioNode,
  );
  return { voice, source, gain, context, fetchMock, buffer, response };
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("French question narration", () => {
  it('assembles three local tokens before playback and cancels a late composed question',async()=>{
    const {voice,context,fetchMock,source}=setup();
    const samples=new Float32Array([.1,.2,.3]);
    context.decodeAudioData.mockResolvedValue({duration:.3,sampleRate:10,length:3,getChannelData:()=>samples} as any);
    const joined=new Float32Array(11);
    Object.assign(context,{createBuffer:vi.fn(()=>({duration:1.1,sampleRate:10,length:11,getChannelData:()=>joined}))});
    const question={operation:'add' as const,a:53,b:27,result:80,id:'large'};
    await voice.speak(question,'ant');
    expect(fetchMock.mock.calls.map(call=>call[0])).toEqual(['/voice/fr/tokens/53.wav','/voice/fr/tokens/add.wav','/voice/fr/tokens/27.wav']);
    expect(Array.from(joined)).toEqual([samples[0],samples[1],samples[2],0,samples[0],samples[1],samples[2],0,samples[0],samples[1],samples[2]]);
    expect(source.start).toHaveBeenCalledOnce();
    voice.stop();
    const pending=voice.speak(question);voice.stop();await pending;
    expect(source.start).toHaveBeenCalledOnce();
  });
  it("plays a delayed disappointment without keeping the previous question queued", async () => {
    const { voice, source, gain, context, fetchMock } = setup();
    Object.assign(context, { currentTime: 20 });
    await voice.speak(q(2, 3));
    await voice.sigh();
    expect(source.stop).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenLastCalledWith("/sounds/crowd-disappointed.wav", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(source.start).toHaveBeenLastCalledWith(20.55);
    expect(gain.gain.value).toBe(1);
  });
  it("plays the ordered pair and reuses the decoded clip for a replay", async () => {
    const { voice, source, fetchMock, buffer } = setup();
    await voice.speak(q(6, 7));
    expect(fetchMock).toHaveBeenCalledWith("/voice/fr/6-7.wav", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(source.buffer).toBe(buffer);
    expect(source.start).toHaveBeenCalledOnce();
    expect(voice.status).toBe("speaking");
    source.onended!();
    expect(voice.status).toBe("idle");
    await voice.speak(q(6, 7));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(source.start).toHaveBeenCalledTimes(2);
  });
  it("invalidates a download when the player answers, pauses, or mutes", async () => {
    const { voice, source, fetchMock, response } = setup();
    let finish!: () => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => {
            void response().then(resolve);
          };
        }),
    );
    const pending = voice.speak(q(2, 3));
    expect(voice.status).toBe("loading");
    voice.stop();
    finish();
    await pending;
    expect(source.start).not.toHaveBeenCalled();
    expect(voice.status).toBe("idle");
  });
  it("never plays an older clip over a newer question", async () => {
    const { voice, source, fetchMock, response } = setup();
    let finish!: () => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => {
            void response().then(resolve);
          };
        }),
    );
    const first = voice.speak(q(2, 3));
    await voice.speak(q(3, 2));
    finish();
    await first;
    expect(source.start).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenLastCalledWith("/voice/fr/3-2.wav", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(voice.status).toBe("speaking");
  });
  it("stops active playback and releases the audio nodes immediately", async () => {
    const { voice, source } = setup();
    await voice.speak(q(10, 10));
    voice.stop();
    expect(source.stop).toHaveBeenCalledOnce();
    expect(source.disconnect).toHaveBeenCalledOnce();
    expect(source.onended).toBeNull();
    expect(voice.status).toBe("idle");
  });
  it("allows a retry after a missing or unavailable recording", async () => {
    const { voice, fetchMock } = setup();
    fetchMock.mockRejectedValueOnce(new Error("Offline"));
    await voice.speak(q(4, 5));
    expect(voice.status).toBe("unavailable");
    await voice.speak(q(4, 5));
    expect(voice.status).toBe("speaking");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

for (const [style, rate] of [["witch", 1.14], ["monster", 0.84], ["classic", 1]] as const) {
 it(`transforms ${style} narration and leaves the crowd unchanged`, async () => {
   const { voice, source, fetchMock } = setup();
   await voice.speak(q(2,3), style);
   expect(source.playbackRate.value).toBe(rate);
   expect(fetchMock).toHaveBeenLastCalledWith("/voice/fr/2-3.wav", expect.objectContaining({ signal: expect.any(AbortSignal) }));
   await voice.sigh();
   expect(source.playbackRate.value).toBe(1);
 });
}

it("adds shallow modulation to the alien voice and stops it with the source", async () => {
 const {voice,source,gain,context} = setup();
 Object.assign(context,{currentTime:10});
 await voice.speak(q(3,4), "alien");
 expect(source.playbackRate.value).toBe(1.2);
 expect(gain.gain.setValueAtTime).toHaveBeenCalled();
 const levels = gain.gain.setValueAtTime.mock.calls.map(call => call[0] as number);
 expect(Math.min(...levels)).toBeGreaterThan(1.2);
 expect(Math.max(...levels)).toBeLessThanOrEqual(1.6);
 voice.stop();
 expect(gain.disconnect).toHaveBeenCalledOnce();
});

it("silently prepares future questions and starts the selected voice synchronously", async () => {
  const { voice, source, fetchMock } = setup();
  const questions = createPool("add").filter(q => q.a === 10 || q.b === 10);
  expect(questions).toHaveLength(19);
  voice.prepare(questions);
  expect(voice.status).toBe("idle");
  expect(source.start).not.toHaveBeenCalled();
  await vi.waitFor(() => expect(questions.every(q => voice.isPrepared(q))).toBe(true));
  expect(source.start).not.toHaveBeenCalled();
  for (const question of questions) {
    const count = source.start.mock.calls.length;
    voice.speakPrepared(question, "dragon");
    // No await: presentation must not create a network/decode gap.
    expect(source.start).toHaveBeenCalledTimes(count + 1);
    expect(source.playbackRate.value).toBe(.8);
    voice.stop();
  }
  expect(fetchMock).toHaveBeenCalledTimes(19);
});

it("waits for decoding, deduplicates preparation and does not interrupt the current voice", async () => {
  const { voice, source, context, fetchMock, buffer } = setup();
  await voice.speak(q(1, 1));
  let decode!: (buffer: unknown) => void;
  context.decodeAudioData.mockImplementationOnce(() => new Promise(resolve => { decode = resolve; }));
  voice.prepare([q(10, 10)]);
  voice.prepare([q(10, 10)]);
  await vi.waitFor(() => expect(context.decodeAudioData).toHaveBeenCalledTimes(2));
  expect(voice.isPrepared(q(10, 10))).toBe(false);
  expect(voice.status).toBe("speaking");
  expect(source.stop).not.toHaveBeenCalled();
  decode(buffer);
  await vi.waitFor(() => expect(voice.isPrepared(q(10, 10))).toBe(true));
  expect(source.start).toHaveBeenCalledTimes(1);
  voice.speakPrepared(q(10, 10));
  expect(source.start).toHaveBeenCalledTimes(2);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("times out a stalled preparation without any late playback, then allows an explicit retry", async () => {
  vi.useFakeTimers();
  const { voice, source, fetchMock, response } = setup();
  let finish!: () => void;
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = () => { void response().then(resolve); }; }));
  voice.prepare([q(2, 10)]);
  expect(voice.isPrepared(q(2, 10))).toBe(false);
  await vi.advanceTimersByTimeAsync(VOICE_LOAD_TIMEOUT_MS);
  expect(voice.isPrepared(q(2, 10))).toBe(true);
  voice.speakPrepared(q(2, 10));
  expect(voice.status).toBe("unavailable");
  expect(source.start).not.toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  finish();
  await vi.advanceTimersByTimeAsync(100);
  voice.speakPrepared(q(2, 10));
  expect(source.start).not.toHaveBeenCalled();
  await voice.speak(q(2, 10));
  expect(source.start).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
