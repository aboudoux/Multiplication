import { modes, questionCount, usesTables } from "./calculations";
import type { Duration, GameSettings, Mode } from "./calculations";
export type { GameSettings } from "./calculations";

export interface RecordScore {
  timeMs: number;
  mistakes: number;
  date: string;
}

export interface SavedData extends GameSettings {
  muted: boolean;
  voiceEnabled: boolean;
  records: Record<string, RecordScore>;
}
export const STORAGE_KEY = "multipli-party:v1";
export const defaults = (): SavedData => ({
  mode: "add",
  length: 20,
  duration: 10,
  tables: 10,
  lives: 3,
  muted: false,
  voiceEnabled: true,
  records: {},
});

export function readSaved(storage: Pick<Storage, "getItem">): SavedData {
  const saved = defaults();
  try {
    const data = JSON.parse(storage.getItem(STORAGE_KEY) ?? "null");
    if (!data || typeof data !== "object") return saved;
    if ([5, 10, 15, 30].includes(data.duration)) saved.duration = data.duration;
    if (Number.isInteger(data.tables) && data.tables >= 1 && data.tables <= 10)
      saved.tables = data.tables;
    if (Number.isInteger(data.lives) && data.lives >= 1 && data.lives <= 10)
      saved.lives = data.lives;
    if (Object.hasOwn(modes, data.mode)) saved.mode = data.mode;
    else if (data.mode === undefined && ([5, 10, 15, 30].includes(data.duration) || Number.isInteger(data.tables))) {
      saved.mode = "multiply";
      saved.length = "all";
    }
    if ([20, 50, 100].includes(data.length)) saved.length = data.length;
    else if (data.length === "all" && saved.mode === "multiply") saved.length = "all";
    if (saved.mode === "multiply" && questionCount(saved) > saved.tables * 10) saved.length = "all";
    if (typeof data.muted === "boolean") saved.muted = data.muted;
    if (typeof data.voiceEnabled === "boolean")
      saved.voiceEnabled = data.voiceEnabled;
    for (const [key, record] of Object.entries(data.records ?? {})) {
      // Earlier versions stored records only by duration (10 tables, 3 lives).
      let normalized = /^[0-9]+$/.test(key) && [5, 10, 15].includes(Number(key))
        ? recordKey({ mode: "multiply", length: "all", tables: 10, duration: Number(key) as Duration, lives: 3 })
        : key;
      const legacy = /^([1-9]|10)-(5|10|15|30)-([1-9]|10)$/.exec(normalized);
      if (legacy) normalized = recordKey({ mode: "multiply", length: "all", tables: Number(legacy[1]), duration: Number(legacy[2]) as Duration, lives: Number(legacy[3]) });
      const match = /^(add|subtract|duo|multiply|mix)-(0|[1-9]|10)-(10|20|30|40|50|60|70|80|90|100)-(5|10|15|30)-([1-9]|10)$/.exec(normalized);
      if (match) {
        const [, mode, tables, count] = match;
        if (usesTables(mode as Mode) !== (Number(tables) > 0)
          || (mode === "multiply" ? Number(count) > Number(tables) * 10 : ![20, 50, 100].includes(Number(count)))) continue;
      }
      if (!match || !record || typeof record !== "object") continue;
      const candidate = record as Record<string, unknown>;
      if (
        typeof candidate.timeMs === "number" &&
        Number.isFinite(candidate.timeMs) &&
        candidate.timeMs > 0 &&
        typeof candidate.mistakes === "number" &&
        Number.isInteger(candidate.mistakes) &&
        candidate.mistakes >= 0 &&
        candidate.mistakes < Number(match[5]) &&
        typeof candidate.date === "string" &&
        Number.isFinite(Date.parse(candidate.date))
      ) {
        saved.records[normalized] = {
          timeMs: candidate.timeMs,
          mistakes: candidate.mistakes,
          date: candidate.date,
        };
      }
    }
  } catch {
    /* Private browsing, blocked storage, or an older/corrupt save: use defaults. */
  }
  return saved;
}

export function saveData(
  storage: Pick<Storage, "setItem">,
  saved: SavedData,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch {
    return false;
  }
}

export function saveRecord(
  saved: SavedData,
  settings: GameSettings,
  score: RecordScore,
): boolean {
  const key = recordKey(settings);
  const previous = saved.records[key];
  if (previous && previous.timeMs <= score.timeMs) return false;
  saved.records[key] = score;
  return true;
}

export function recordKey(settings: GameSettings): string {
  return `${settings.mode}-${usesTables(settings.mode) ? settings.tables : 0}-${questionCount(settings)}-${settings.duration}-${settings.lives}`;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
