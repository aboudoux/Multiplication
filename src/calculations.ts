export type Duration = 5 | 10 | 15 | 30;
export type Operation = "add" | "subtract" | "multiply";
export type Mode = Operation | "duo" | "mix";
export type Length = 20 | 50 | 100 | "all";
export interface GameSettings {
  mode: Mode;
  length: Length;
  tables: number;
  duration: Duration;
  lives: number;
}
export interface Calculation {
  operation: Operation;
  a: number;
  b: number;
  id: string;
  result: number;
  exercise?: import('./questions').StudyQuestion;
}
export const modes: Record<Mode, { name: string; description: string; symbol: string; operations: Operation[] }> = {
  add: { name: "Le petit plus", description: "Additions jusqu’à 20", symbol: "+", operations: ["add"] },
  subtract: { name: "Le petit moins", description: "Soustractions jusqu’à 20", symbol: "−", operations: ["subtract"] },
  duo: { name: "Le duo malin", description: "Additions et soustractions", symbol: "+ −", operations: ["add", "subtract"] },
  multiply: { name: "La ronde des tables", description: "Tes tables de multiplication", symbol: "×", operations: ["multiply"] },
  mix: { name: "Le grand mélange", description: "Les trois opérations !", symbol: "+ − ×", operations: ["add", "subtract", "multiply"] },
};
export const symbols: Record<Operation, string> = { add: "+", subtract: "−", multiply: "×" };
export const words: Record<Operation, string> = { add: "plus", subtract: "moins", multiply: "fois" };
export const usesTables = (mode: Mode) => modes[mode].operations.includes("multiply");
export const questionCount = (settings: GameSettings) => settings.length === "all" ? settings.tables * 10 : settings.length;
export const expression = (q: Calculation) => q.exercise?.prompt ?? `${q.a} ${symbols[q.operation]} ${q.b}`;
export const spokenExpression = (q: Calculation) => q.exercise?.spoken ?? `${q.a} ${words[q.operation]} ${q.b}`;
export const voicePath = (q: Pick<Calculation, "operation" | "a" | "b" | "exercise">) => {
  if(q.exercise?.voiceTokens)return `/voice/fr/study/${q.exercise.voiceTokens.join('~')}`;
  const existing = q.operation === 'multiply' ? q.a>=1 && q.a<=10 && q.b>=1 && q.b<=10
    : q.a>=0 && q.a<=20 && q.b>=0 && q.b<=20 && (q.operation==='add'?q.a+q.b:q.a-q.b)>=0 && (q.operation==='add'?q.a+q.b:q.a-q.b)<=20;
  return existing ? `/voice/fr/${q.operation === "multiply" ? "" : q.operation + "/"}${q.a}-${q.b}.wav`
    : `/voice/fr/composed/${q.operation}/${q.a}-${q.b}`;
};

export function createPool(operation: Operation, tables = 10): Calculation[] {
  if (!Number.isInteger(tables) || tables < 1 || tables > 10) throw new RangeError("Invalid tables");
  const pool: Calculation[] = [];
  const minimum = 1;
  const maximum = operation === "multiply" ? tables : 20;
  for (let a = minimum; a <= maximum; a++) {
    for (let b = minimum; b <= (operation === "multiply" ? 10 : 20); b++) {
      const result = operation === "add" ? a + b : operation === "subtract" ? a - b : a * b;
      if (operation !== "multiply" && (result <= 0 || result > 20)) continue;
      pool.push({ operation, a, b, result, id: `${a}${operation === "multiply" ? "x" : symbols[operation]}${b}` });
    }
  }
  return pool;
}
export const createDeck = (tables = 10) => createPool("multiply", tables);
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function validateSettings(settings: GameSettings): void {
  if (!Object.hasOwn(modes, settings.mode) || ![5, 10, 15, 30].includes(settings.duration)
    || !Number.isInteger(settings.tables) || settings.tables < 1 || settings.tables > 10
    || !Number.isInteger(settings.lives) || settings.lives < 1 || settings.lives > 10
    || ![20, 50, 100, "all"].includes(settings.length)
    || (settings.length === "all" && settings.mode !== "multiply")
    || (settings.mode === "multiply" && questionCount(settings) > settings.tables * 10)) {
    throw new RangeError("Invalid game settings");
  }
}
export function selectQuestions(settings: GameSettings, random = Math.random): Calculation[] {
  validateSettings(settings);
  const pools = shuffle(modes[settings.mode].operations, random).map(op => shuffle(createPool(op, settings.tables), random));
  const selected: Calculation[] = [];
  // Round-robin fills quotas evenly, redistributing when a small table pool is exhausted.
  while (selected.length < questionCount(settings)) {
    for (const pool of pools) {
      if (selected.length === questionCount(settings)) break;
      const next = pool.shift();
      if (next) selected.push(next);
    }
  }
  return shuffle(selected, random);
}
