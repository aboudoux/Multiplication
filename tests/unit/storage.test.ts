import { describe, expect, it } from "vitest";
import {
  defaults,
  formatTime,
  readSaved,
  recordKey,
  saveData,
  saveRecord,
  STORAGE_KEY,
} from "../../src/storage";

const score = { timeMs: 60000, mistakes: 1, date: "2026-09-27T10:00:00Z" };
const standard = { mode: "multiply" as const, length: "all" as const, tables: 10, duration: 5 as const, lives: 3 };
describe("local preferences and records", () => {
  it("migrates old records to 10 tables and 3 lives without losing voice preferences", () => {
    const legacy = JSON.stringify({
      duration: 5,
      muted: false,
      records: { 5: score },
    });
    const saved = readSaved({ getItem: () => legacy });
    expect(saved.voiceEnabled).toBe(true);
    expect(saved.tables).toBe(10);
    expect(saved.lives).toBe(3);
    expect(saved.records[recordKey(standard)]).toEqual(score);
    expect(
      readSaved({
        getItem: () => JSON.stringify({ ...saved, voiceEnabled: false }),
      }).voiceEnabled,
    ).toBe(false);
  });
  it("defaults to 10 tables, 10 seconds, 3 lives and sound enabled", () => {
    for (const value of [
      null,
      "{oops",
      "[]",
      "null",
      '{"duration":8,"muted":"yes"}',
    ]) {
      expect(readSaved({ getItem: () => value })).toEqual(defaults());
    }
  });
  it("validates saved data and ignores malformed records", () => {
    const value = JSON.stringify({
      duration: 30,
      tables: 5,
      lives: 4,
      muted: true,
      records: {
        5: score,
        10: { ...score, timeMs: -1 },
        15: { ...score, mistakes: 3 },
        "5-30-4": score,
        "11-30-4": score,
      },
    });
    const saved = readSaved({ getItem: () => value });
    expect(saved.duration).toBe(30);
    expect(saved.tables).toBe(5);
    expect(saved.lives).toBe(4);
    expect(saved.muted).toBe(true);
    expect(saved.records).toEqual({ "multiply-10-100-5-3": score, "multiply-5-50-30-4": score });
  });
  it("keeps independent records for tables, time and lives", () => {
    const saved = defaults();
    const slower = { ...score, timeMs: 90000 };
    expect(saveRecord(saved, standard, score)).toBe(true);
    for (const other of [
      { ...standard, tables: 5 },
      { ...standard, duration: 30 as const },
      { ...standard, lives: 4 },
    ]) expect(saveRecord(saved, other, slower)).toBe(true);
    expect(saveRecord(saved, standard, { ...score, timeMs: 70000 })).toBe(false);
    expect(saveRecord(saved, standard, { ...score, timeMs: 55000 })).toBe(true);
    expect(saved.records[recordKey(standard)]?.timeMs).toBe(55000);
    expect(Object.keys(saved.records)).toHaveLength(4);
  });
  it("ignores invalid table and life settings", () => {
    const saved = readSaved({ getItem: () => JSON.stringify({
      duration: 30, tables: 0, lives: 11,
    }) });
    expect(saved).toMatchObject({ duration: 30, tables: 10, lives: 3 });
  });
  it("survives disabled storage and round-trips preferences", () => {
    const disabled = {
      getItem: () => {
        throw new Error("disabled");
      },
      setItem: () => {
        throw new Error("disabled");
      },
    };
    expect(readSaved(disabled)).toEqual(defaults());
    expect(saveData(disabled, defaults())).toBe(false);
    const store = new Map<string, string>();
    saveData(
      {
        setItem: (key, value) => {
          store.set(key, value);
        },
      },
      defaults(),
    );
    expect(store.has(STORAGE_KEY)).toBe(true);
    expect(readSaved({ getItem: (key) => store.get(key) ?? null })).toEqual(
      defaults(),
    );
  });
  it("formats times beyond one minute", () => {
    expect(formatTime(999)).toBe("0:00");
    expect(formatTime(125900)).toBe("2:05");
  });
});

it("persists themes without changing settings or records and defaults legacy/invalid themes", () => {
  for (const theme of [undefined, null, "unknown", "star", "halloween"]) {
    const original = { ...defaults(), ...standard, theme, records: { [recordKey(standard)]: score } };
    const saved = readSaved({ getItem: () => JSON.stringify(original) });
    expect(saved.theme).toBe(theme === "halloween" ? "halloween" : "star");
    expect(saved.records).toEqual(original.records);
    expect(recordKey(saved)).toBe(recordKey(standard));
    let stored = "";
    saveData({ setItem: (_key, value) => { stored = value; } }, saved);
    expect(readSaved({ getItem: () => stored })).toEqual(saved);
  }
});

it("persists Halloween voice choice and ignores invalid styles", () => {
  for (const style of ["classic", "witch", "monster", "invalid", null]) {
    const saved = readSaved({ getItem: () => JSON.stringify({ ...defaults(), themeVoices: undefined, halloweenVoice: style }) });
    expect(saved.themeVoices.halloween).toBe(["classic", "witch", "monster"].includes(style!) ? style : "witch");
  }
});
