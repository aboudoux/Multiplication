import type { Duration } from "./game";

export interface RecordScore {
  timeMs: number;
  mistakes: number;
  date: string;
}
export interface GameSettings {
  duration: Duration;
  tables: number;
  lives: number;
}
export interface SavedData extends GameSettings {
  muted: boolean;
  voiceEnabled: boolean;
  records: Record<string, RecordScore>;
}
export const STORAGE_KEY = "multipli-party:v1";
export const defaults = (): SavedData => ({
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
    if (typeof data.muted === "boolean") saved.muted = data.muted;
    if (typeof data.voiceEnabled === "boolean")
      saved.voiceEnabled = data.voiceEnabled;
    for (const [key, record] of Object.entries(data.records ?? {})) {
      // Earlier versions stored records only by duration (10 tables, 3 lives).
      const normalized = /^[0-9]+$/.test(key) && [5, 10, 15].includes(Number(key))
        ? recordKey({ tables: 10, duration: Number(key) as Duration, lives: 3 })
        : key;
      const match = /^([1-9]|10)-(5|10|15|30)-([1-9]|10)$/.exec(normalized);
      if (!match || !record || typeof record !== "object") continue;
      const candidate = record as Record<string, unknown>;
      if (
        typeof candidate.timeMs === "number" &&
        Number.isFinite(candidate.timeMs) &&
        candidate.timeMs > 0 &&
        typeof candidate.mistakes === "number" &&
        Number.isInteger(candidate.mistakes) &&
        candidate.mistakes >= 0 &&
        candidate.mistakes < Number(match[3]) &&
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
  return `${settings.tables}-${settings.duration}-${settings.lives}`;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
