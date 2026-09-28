import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { createDeck, DEFEAT_DURATION_MS } from "../../src/game";

it("includes the complete crowd reaction with enough time after the buzzer", () => {
  const wav = readFileSync(
    new URL("../../public/sounds/crowd-disappointed.wav", import.meta.url),
  );
  let bytes = 0;
  for (let offset = 12; offset + 8 <= wav.length;) {
    const size = wav.readUInt32LE(offset + 4);
    if (wav.toString("ascii", offset, offset + 4) === "data") bytes = size;
    offset += 8 + size + (size % 2);
  }
  const seconds = bytes / 44100;
  expect(seconds).toBeGreaterThan(4.9);
  expect(seconds + 0.55).toBeLessThan(DEFEAT_DURATION_MS / 1000);
});

it("ships 100 non-silent French WAV prompts usable within the shortest time limit", () => {
  for (const { a, b } of createDeck()) {
    const wav = readFileSync(
      new URL(`../../public/voice/fr/${a}-${b}.wav`, import.meta.url),
    );
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
    let data: Buffer | null = null;
    for (let offset = 12; offset + 8 <= wav.length;) {
      const tag = wav.toString("ascii", offset, offset + 4);
      const size = wav.readUInt32LE(offset + 4);
      if (tag === "fmt ") {
        expect(wav.readUInt16LE(offset + 8)).toBe(1); // PCM
        expect(wav.readUInt16LE(offset + 10)).toBe(1); // mono
        expect(wav.readUInt32LE(offset + 12)).toBe(22050);
        expect(wav.readUInt16LE(offset + 22)).toBe(16);
      }
      if (tag === "data") data = wav.subarray(offset + 8, offset + 8 + size);
      offset += 8 + size + (size % 2);
    }
    expect(data).not.toBeNull();
    const duration = data!.length / (22050 * 2);
    expect(duration).toBeGreaterThan(0.4);
    expect(duration).toBeLessThan(2.5);
    let peak = 0;
    for (let i = 0; i < data!.length; i += 2)
      peak = Math.max(peak, Math.abs(data!.readInt16LE(i)));
    expect(peak).toBeGreaterThan(1000);
    expect(peak).toBeLessThan(32767);
  }
});
