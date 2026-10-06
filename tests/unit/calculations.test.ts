import { describe, expect, it } from "vitest";
import { createPool, selectQuestions, questionCount, modes, voicePath } from "../../src/calculations";
import type { GameSettings, Mode } from "../../src/calculations";
import { Game, ERROR_FEEDBACK_MS } from "../../src/game";
import { defaults, readSaved, recordKey, saveRecord } from "../../src/storage";

const config = (mode: Mode, length: GameSettings["length"] = 20, tables = 10): GameSettings => ({ mode, length, tables, duration: 10, lives: 3 });
describe("arithmetic question banks", () => {
  it.each(["add", "subtract"] as const)("contains all valid ordered %s calculations without zero operands or results", operation => {
    const pool = createPool(operation);
    expect(pool).toHaveLength(190);
    expect(new Set(pool.map(q => q.id)).size).toBe(190);
    for (const q of pool) {
      expect(q.result).toBe(operation === "add" ? q.a + q.b : q.a - q.b);
      expect(q.a).toBeGreaterThan(0); expect(q.b).toBeGreaterThan(0); expect(q.result).toBeGreaterThan(0);
      expect(q.result).toBeLessThanOrEqual(20);
    }
    expect(pool.some(q => q.a === 0 && q.b === 0 && q.result === 0)).toBe(false);
    expect(pool.some(q => q.a === 20 && q.b === 0 && q.result === 20)).toBe(false);
  });
  it("keeps inverse additions and distinct operations", () => {
    const pool = [...createPool("add"), ...createPool("subtract"), ...createPool("multiply")];
    expect(new Set(pool.map(q => q.id)).size).toBe(480);
    expect(pool.some(q => q.id === "3+7")).toBe(true);
    expect(pool.some(q => q.id === "7+3")).toBe(true);
  });
  it("selects every supported length without repeats and balances available operations", () => {
    for (const mode of Object.keys(modes) as Mode[]) for (const length of [20, 50, 100] as const) {
      const deck = selectQuestions(config(mode, length));
      expect(deck).toHaveLength(length);
      expect(new Set(deck.map(q => q.id)).size).toBe(length);
      const counts = modes[mode].operations.map(op => deck.filter(q => q.operation === op).length);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
  });
  it("redistributes the grand mix when one table has only ten calculations", () => {
    const deck = selectQuestions(config("mix", 100, 1));
    expect(deck.filter(q => q.operation === "multiply")).toHaveLength(10);
    expect(deck.filter(q => q.operation === "add")).toHaveLength(45);
    expect(deck.filter(q => q.operation === "subtract")).toHaveLength(45);
  });
  it("rejects impossible lengths and preserves exhaustive multiplication", () => {
    expect(() => selectQuestions(config("multiply", 20, 1))).toThrow(RangeError);
    expect(() => selectQuestions(config("add", "all"))).toThrow(RangeError);
    for (let tables = 1; tables <= 10; tables++) {
      const settings = config("multiply", "all", tables);
      expect(selectQuestions(settings)).toHaveLength(questionCount(settings));
    }
  });
  it.each(Object.keys(modes) as Mode[])("wins %s only after the selected set is solved, including a retried error", mode => {
    const game = new Game(config(mode), () => 0.999999);
    game.start(0); game.tick(4000);
    let now = 4100;
    const failed = game.current!.id;
    for (const d of String(game.current!.result).replace(/./g, "9")) game.digit(d, now);
    // If 9 or 99 was the expected answer, use timeout instead in a separate game test.
    expect(game.feedback?.correct).toBe(false);
    now += ERROR_FEEDBACK_MS; game.tick(now);
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      expect(seen.has(game.current!.id)).toBe(false);
      seen.add(game.current!.id);
      if (i === 19) expect(game.current!.id).toBe(failed);
      for (const d of String(game.current!.result)) game.digit(d, now + 100);
      now += 750;
      if (i < 19) game.tick(now);
    }
    expect(game.phase).toBe("victory");
    expect(game.solved).toBe(20);
    expect(game.mistakes).toBe(1);
  });
  it("rejects zero as an answer while keeping the zero key for numbers like 10", () => {
    const game = new Game(config("subtract"), () => 0.999999);
    game.start(0); game.tick(4000);
    expect(game.current!.result).toBeGreaterThan(0);
    game.digit("0", 4100);
    expect(game.solved).toBe(0);
    expect(game.mistakes).toBe(1);
  });
  it("routes narration by operation while preserving multiplication recordings", () => {
    expect(voicePath({ operation: "add", a: 0, b: 20 })).toBe("/voice/fr/add/0-20.wav");
    expect(voicePath({ operation: "subtract", a: 20, b: 20 })).toBe("/voice/fr/subtract/20-20.wav");
    expect(voicePath({ operation: "multiply", a: 10, b: 10 })).toBe("/voice/fr/10-10.wav");
  });
});
describe("mode preferences and compatible records", () => {
  it("starts new players on twenty additions and migrates existing players to the full multiplication series", () => {
    expect(defaults()).toMatchObject({ mode: "add", length: 20 });
    const score = { timeMs: 12345, mistakes: 0, date: "2026-09-28" };
    const saved = readSaved({ getItem: () => JSON.stringify({ tables: 7, duration: 15, lives: 4, records: { "7-15-4": score } }) });
    expect(saved).toMatchObject({ mode: "multiply", length: "all", tables: 7 });
    expect(saved.records[recordKey(saved)]).toEqual(score);
  });
  it("separates modes and lengths but ignores unused tables and equates all with the same actual count", () => {
    const saved = defaults();
    const score = { timeMs: 1000, mistakes: 0, date: "2026-09-28" };
    for (const mode of Object.keys(modes) as Mode[]) for (const length of [20, 50, 100] as const) saveRecord(saved, config(mode, length), score);
    expect(Object.keys(saved.records)).toHaveLength(15);
    expect(recordKey(config("add", 20, 1))).toBe(recordKey(config("add", 20, 10)));
    expect(recordKey(config("multiply", "all", 2))).toBe(recordKey(config("multiply", 20, 2)));
    expect(readSaved({ getItem: () => JSON.stringify(saved) })).toEqual(saved);
  });
});
