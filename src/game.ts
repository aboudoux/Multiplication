import { selectQuestions, questionCount, validateSettings } from "./calculations";
import type { Calculation, GameSettings } from "./calculations";
export type { Duration } from "./calculations";
export { createDeck, shuffle } from "./calculations";
export type Phase =
  | "welcome"
  | "countdown"
  | "preparing"
  | "question"
  | "feedback"
  | "paused"
  | "defeat"
  | "victory"
  | "finished";
export const DEFEAT_DURATION_MS = 6000;
export const VICTORY_DURATION_MS = 6000;
export const ERROR_FEEDBACK_MS = 2000;

export interface Feedback {
  correct: boolean;
  timeout: boolean;
  pair: Calculation;
  submitted: string;
}
type CountdownAction = "next" | "resume-question" | "resume-feedback";
export interface PracticeRules {
  questions: readonly Calculation[];
  untimed: boolean;
  unlimitedLives: boolean;
  victoryDurationMs?: number;
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
  current: Calculation | null = null;
  answer = "";
  feedback: Feedback | null = null;
  private queue: Calculation[] = [];
  private deadline = 0;
  private questionStarted = 0;
  private activeMs = 0;
  private remainingMs = 0;
  private countdownAction: CountdownAction = "next";
  private celebrationSuspendedAt: number | null = null;

  readonly settings: Readonly<GameSettings>;
  constructor(
    settings: GameSettings,
    private readonly random = Math.random,
    private readonly canPresent: (question: Calculation) => boolean = () => true,
    private readonly practice?: PracticeRules,
  ) {
    validateSettings(settings);
    this.settings = Object.freeze({ ...settings });
    this.lives = settings.lives;
  }
  get duration() { return this.settings.duration; }
  get tables() { return this.settings.tables; }
  get startingLives() { return this.settings.lives; }
  get totalQuestions(): number { return this.practice?.questions.length ?? questionCount(this.settings); }
  get untimed(): boolean { return !!this.practice?.untimed; }
  get unlimitedLives(): boolean { return !!this.practice?.unlimitedLives; }
  get victoryDuration(): number { return this.practice?.victoryDurationMs ?? VICTORY_DURATION_MS; }
  victoryElapsed(now: number): number { return Math.max(0, this.victoryDuration - (this.deadline - (this.celebrationSuspendedAt ?? now))); }
  suspendCelebration(now: number): void {
    if (this.phase === 'victory' && this.celebrationSuspendedAt === null) this.celebrationSuspendedAt = now;
  }
  resumeCelebration(now: number): void {
    if (this.celebrationSuspendedAt === null) return;
    this.deadline += Math.max(0, now - this.celebrationSuspendedAt);
    this.celebrationSuspendedAt = null;
  }
  get upcomingQuestions(): readonly Calculation[] { return this.queue.slice(0, 3); }

  start(now: number): void {
    if (this.phase !== "welcome") return;
    this.queue = this.practice ? this.practice.questions.map(q => ({ ...q })) : selectQuestions(this.settings, this.random);
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
    if (this.phase === "paused" || this.phase === "countdown" || this.phase === "preparing") {
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
    if (this.celebrationSuspendedAt !== null) return;
    if (now < this.deadline) return;
    if (this.phase === "preparing") {
      if (this.countdownAction === "resume-question") this.resumeQuestion(now);
      else this.nextQuestion(now);
    } else if (this.phase === "countdown") {
      if (this.countdownAction === "resume-question") {
        this.resumeQuestion(now);
      } else if (this.countdownAction === "resume-feedback") {
        this.phase = "feedback";
        this.deadline = now + this.remainingMs;
      } else this.nextQuestion(now);
    } else if (this.phase === "question" && !this.untimed) this.resolve(false, true, now);
    else if (this.phase === "feedback") {
      if (this.lives === 0) {
        this.phase = "defeat";
        this.deadline = now + DEFEAT_DURATION_MS;
      } else this.nextQuestion(now);
    }
    else if (this.phase === "defeat" || this.phase === "victory")
      this.phase = "finished";
  }

  digit(digit: string, now: number): boolean {
    if (this.phase !== "question" || !/^\d$/.test(digit)) return false;
    this.tick(now);
    // An expired question cannot accept a racing click or key press.
    if (this.phase !== "question" || !this.current) return false;
    this.answer += digit;
    const expected = String(this.current.result);
    if (this.answer.length === expected.length)
      this.resolve(this.answer === expected, false, now);
    return true;
  }

  erase(now: number): boolean {
    if (this.phase !== "question") return false;
    this.tick(now);
    if (this.phase !== "question" || !this.answer) return false;
    this.answer = this.answer.slice(0, -1);
    return true;
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
    } else if (this.phase !== "countdown" && this.phase !== "preparing") return;
    this.phase = "paused";
  }

  resume(now: number): void {
    if (this.phase !== "paused") return;
    this.phase = "countdown";
    this.deadline = now + 4000;
  }

  private nextQuestion(now: number): void {
    this.countdownAction = "next";
    const next = this.queue[0];
    if (next && !this.canPresent(next)) {
      this.phase = "preparing";
      return;
    }
    this.current = this.queue.shift() ?? null;
    if (!this.current) return;
    this.questionNumber++;
    this.answer = "";
    this.feedback = null;
    this.phase = "question";
    this.questionStarted = now;
    this.deadline = this.untimed ? Infinity : now + this.duration * 1000;
    this.countdownAction = "next";
  }

  private resumeQuestion(now: number): void {
    if (this.current && !this.canPresent(this.current)) {
      this.phase = "preparing";
      return;
    }
    this.phase = "question";
    this.questionStarted = now;
    this.deadline = now + this.remainingMs;
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
      if (!this.practice?.unlimitedLives) this.lives--;
      this.mistakes++;
      this.streak = 0;
      this.queue.push(this.current);
    }
    this.phase =
      this.solved === this.totalQuestions ? "victory" : "feedback";
    this.deadline =
      now +
      (this.phase === "victory"
          ? this.victoryDuration
          : correct
            ? 650
            : ERROR_FEEDBACK_MS);
  }
}
