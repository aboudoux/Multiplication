import { selectQuestions, questionCount, validateSettings } from "./calculations";
import type { Calculation, GameSettings } from "./calculations";
export type { Duration } from "./calculations";
export { createDeck, shuffle } from "./calculations";
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

export interface Feedback {
  correct: boolean;
  timeout: boolean;
  pair: Calculation;
  submitted: string;
}
type CountdownAction = "next" | "resume-question" | "resume-feedback";

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

  readonly settings: Readonly<GameSettings>;
  constructor(settings: GameSettings, private readonly random = Math.random) {
    validateSettings(settings);
    this.settings = Object.freeze({ ...settings });
    this.lives = settings.lives;
  }
  get duration() { return this.settings.duration; }
  get tables() { return this.settings.tables; }
  get startingLives() { return this.settings.lives; }
  get totalQuestions(): number { return questionCount(this.settings); }

  start(now: number): void {
    if (this.phase !== "welcome") return;
    this.queue = selectQuestions(this.settings, this.random);
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
