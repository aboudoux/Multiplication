export type Duration = 5 | 10 | 15 | 30;
export type Phase =
  | "welcome"
  | "countdown"
  | "question"
  | "feedback"
  | "paused"
  | "defeat"
  | "victory"
  | "finished";
export const DEFEAT_DURATION_MS = 6000;
export const VICTORY_DURATION_MS = 6000;
export const ERROR_FEEDBACK_MS = 2000;
export interface Pair {
  a: number;
  b: number;
  id: string;
  result: number;
}
export interface Feedback {
  correct: boolean;
  timeout: boolean;
  pair: Pair;
  submitted: string;
}
type CountdownAction = "next" | "resume-question" | "resume-feedback";

export function createDeck(tables = 10): Pair[] {
  if (!Number.isInteger(tables) || tables < 1 || tables > 10)
    throw new RangeError("The number of tables must be between 1 and 10.");
  return Array.from({ length: tables * 10 }, (_, i) => {
    const a = Math.floor(i / 10) + 1;
    const b = (i % 10) + 1;
    return { a, b, id: `${a}x${b}`, result: a * b };
  });
}

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Pure clock-driven state machine. Only active answering time counts toward records. */
export class Game {
  phase: Phase = "welcome";
  lives = 3;
  solved = 0;
  mistakes = 0;
  streak = 0;
  bestStreak = 0;
  questionNumber = 0;
  current: Pair | null = null;
  answer = "";
  feedback: Feedback | null = null;
  private queue: Pair[] = [];
  private deadline = 0;
  private questionStarted = 0;
  private activeMs = 0;
  private remainingMs = 0;
  private countdownAction: CountdownAction = "next";

  constructor(
    readonly duration: Duration = 10,
    private readonly random = Math.random,
    readonly tables = 10,
    readonly startingLives = 3,
  ) {
    if (![5, 10, 15, 30].includes(duration))
      throw new RangeError("Unsupported answer time.");
    if (!Number.isInteger(tables) || tables < 1 || tables > 10)
      throw new RangeError("The number of tables must be between 1 and 10.");
    if (!Number.isInteger(startingLives) || startingLives < 1 || startingLives > 10)
      throw new RangeError("The number of lives must be between 1 and 10.");
    this.lives = startingLives;
  }

  get totalQuestions(): number {
    return this.tables * 10;
  }

  start(now: number): void {
    if (this.phase !== "welcome") return;
    this.queue = shuffle(createDeck(this.tables), this.random);
    this.phase = "countdown";
    this.deadline = now + 4000;
  }

  countdown(now: number): number {
    return Math.max(
      0,
      Math.min(3, Math.ceil((this.deadline - now) / 1000) - 1),
    );
  }

  timeLeft(now: number): number {
    if (this.phase === "question") return Math.max(0, this.deadline - now);
    if (this.phase === "paused" || this.phase === "countdown") {
      return this.countdownAction === "resume-question"
        ? this.remainingMs
        : this.duration * 1000;
    }
    return 0;
  }

  elapsed(now: number): number {
    return (
      this.activeMs +
      (this.phase === "question"
        ? Math.max(0, Math.min(now, this.deadline) - this.questionStarted)
        : 0)
    );
  }

  tick(now: number): void {
    if (now < this.deadline) return;
    if (this.phase === "countdown") {
      if (this.countdownAction === "resume-question") {
        this.phase = "question";
        this.questionStarted = now;
        this.deadline = now + this.remainingMs;
      } else if (this.countdownAction === "resume-feedback") {
        this.phase = "feedback";
        this.deadline = now + this.remainingMs;
      } else this.nextQuestion(now);
    } else if (this.phase === "question") this.resolve(false, true, now);
    else if (this.phase === "feedback") {
      if (this.lives === 0) {
        this.phase = "defeat";
        this.deadline = now + DEFEAT_DURATION_MS;
      } else this.nextQuestion(now);
    }
    else if (this.phase === "defeat" || this.phase === "victory")
      this.phase = "finished";
  }

  digit(digit: string, now: number): void {
    if (this.phase !== "question" || !/^\d$/.test(digit)) return;
    this.tick(now);
    // An expired question cannot accept a racing click or key press.
    if (this.phase !== "question" || !this.current) return;
    this.answer += digit;
    const expected = String(this.current.result);
    if (this.answer.length === expected.length)
      this.resolve(this.answer === expected, false, now);
  }

  erase(now: number): void {
    if (this.phase !== "question") return;
    this.tick(now);
    if (this.phase === "question") this.answer = this.answer.slice(0, -1);
  }

  pause(now: number): void {
    this.tick(now);
    if (this.phase === "question") {
      this.activeMs += Math.max(0, now - this.questionStarted);
      this.remainingMs = this.deadline - now;
      this.countdownAction = "resume-question";
    } else if (this.phase === "feedback") {
      this.remainingMs = this.deadline - now;
      this.countdownAction = "resume-feedback";
    } else if (this.phase !== "countdown") return;
    this.phase = "paused";
  }

  resume(now: number): void {
    if (this.phase !== "paused") return;
    this.phase = "countdown";
    this.deadline = now + 4000;
  }

  private nextQuestion(now: number): void {
    this.current = this.queue.shift() ?? null;
    if (!this.current) return;
    this.questionNumber++;
    this.answer = "";
    this.feedback = null;
    this.phase = "question";
    this.questionStarted = now;
    this.deadline = now + this.duration * 1000;
    this.countdownAction = "next";
  }

  private resolve(correct: boolean, timeout: boolean, now: number): void {
    if (this.phase !== "question" || !this.current) return;
    this.activeMs += Math.max(
      0,
      Math.min(now, this.deadline) - this.questionStarted,
    );
    this.feedback = {
      correct,
      timeout,
      pair: this.current,
      submitted: this.answer,
    };
    if (correct) {
      this.solved++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.lives--;
      this.mistakes++;
      this.streak = 0;
      this.queue.push(this.current);
    }
    this.phase =
      this.solved === this.totalQuestions ? "victory" : "feedback";
    this.deadline =
      now +
      (this.phase === "victory"
          ? VICTORY_DURATION_MS
          : correct
            ? 650
            : ERROR_FEEDBACK_MS);
  }
}
