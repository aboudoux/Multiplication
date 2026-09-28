import { createPool } from "../../src/calculations";
const q = (a: number, b: number) => createPool("multiply").find(q => q.a === a && q.b === b)!;
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionVoice } from "../../src/voice";

function setup() {
  const source = {
    buffer: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };
  const gain = { gain: { value: 0 }, connect: vi.fn(), disconnect: vi.fn() };
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
afterEach(() => vi.unstubAllGlobals());
describe("French question narration", () => {
  it("plays a delayed disappointment without keeping the previous question queued", async () => {
    const { voice, source, gain, context, fetchMock } = setup();
    Object.assign(context, { currentTime: 20 });
    await voice.speak(q(2, 3));
    await voice.sigh();
    expect(source.stop).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenLastCalledWith("/sounds/crowd-disappointed.wav");
    expect(source.start).toHaveBeenLastCalledWith(20.55);
    expect(gain.gain.value).toBe(1);
  });
  it("plays the ordered pair and reuses the decoded clip for a replay", async () => {
    const { voice, source, fetchMock, buffer } = setup();
    await voice.speak(q(6, 7));
    expect(fetchMock).toHaveBeenCalledWith("/voice/fr/6-7.wav");
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
    expect(fetchMock).toHaveBeenLastCalledWith("/voice/fr/3-2.wav");
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
