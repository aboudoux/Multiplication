import { describe, expect, it } from "vitest";
import { createDeck, DEFEAT_DURATION_MS, ERROR_FEEDBACK_MS, Game, shuffle, VICTORY_DURATION_MS } from "../../src/game";
import type { Duration } from "../../src/game";

// An injectable random source keeps the production deck in its original order.
function started(duration: Duration = 10, tables = 10, lives = 3) {
  const game = new Game({ mode: "multiply", length: "all", duration, tables, lives }, () => 0.999999);
  game.start(0);
  game.tick(4000);
  return game;
}
function answerCorrectly(game: Game, now: number) {
  for (const digit of String(game.current!.result)) game.digit(digit, now);
}
function reach(game: Game, id: string, now = 4000) {
  for (let i = 0; i < 100 && game.current?.id !== id; i++) {
    answerCorrectly(game, now + 100);
    now += 750;
    game.tick(now);
  }
  expect(game.current?.id).toBe(id);
  return now;
}

describe("the multiplication deck", () => {
  it("contains all 100 ordered pairs, including inverses and 10 × 10", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(100);
    expect(new Set(deck.map((pair) => pair.id)).size).toBe(100);
    expect(deck.find((pair) => pair.id === "2x3")?.result).toBe(6);
    expect(deck.find((pair) => pair.id === "3x2")?.result).toBe(6);
    expect(deck.find((pair) => pair.id === "10x10")?.result).toBe(100);
  });
  it("uses each selected table through ×10 and keeps inverse pairs where both tables are selected", () => {
    for (const tables of [1, 5, 10]) {
      const deck = createDeck(tables);
      expect(deck).toHaveLength(tables * 10);
      expect(new Set(deck.map((pair) => pair.id)).size).toBe(deck.length);
      expect(deck.at(-1)?.id).toBe(`${tables}x10`);
      expect(deck.some((pair) => pair.a > tables)).toBe(false);
    }
    expect(createDeck(5).some((pair) => pair.id === "2x3")).toBe(true);
    expect(createDeck(5).some((pair) => pair.id === "3x2")).toBe(true);
    expect(createDeck(1).some((pair) => pair.id === "10x1")).toBe(false);
    expect(() => createDeck(0)).toThrow(RangeError);
    expect(() => createDeck(11)).toThrow(RangeError);
  });
  it("shuffles a copy without losing or duplicating a pair", () => {
    const deck = createDeck();
    const mixed = shuffle(deck, () => 0.2);
    expect(mixed).not.toEqual(deck);
    expect(mixed.map((pair) => pair.id).sort()).toEqual(
      deck.map((pair) => pair.id).sort(),
    );
    expect(deck[0].id).toBe("1x1");
  });
});

describe("the game rules", () => {
  it("reports accepted digits and erasures without accepting a racing timeout or transition", () => {
    const game = started();
    expect(game.digit('x', 4001)).toBe(false);
    expect(game.erase(4001)).toBe(false);
    expect(game.digit('1', 4002)).toBe(true);
    expect(game.digit('1', 4002)).toBe(false);
    const late = started();
    expect(late.digit('1', 14000)).toBe(false);
    expect(late.lives).toBe(2);
    expect(late.digit('1', 14000)).toBe(false);
    expect(late.lives).toBe(2);
    const three = started(30);
    const now = reach(three, '10x10');
    expect(three.digit('1', now + 1)).toBe(true);
    expect(three.erase(now + 2)).toBe(true);
    expect(three.erase(now + 3)).toBe(false);
    for (const digit of '100') expect(three.digit(digit, now + 4)).toBe(true);
    expect(three.digit('0', now + 4)).toBe(false);
  });
  it("finishes after every selected table is solved", () => {
    const game = started(30, 1, 5);
    expect(game.totalQuestions).toBe(10);
    expect(game.lives).toBe(5);
    let now = 4000;
    for (let i = 0; i < 10; i++) {
      answerCorrectly(game, now + 100);
      expect(game.solved).toBe(i + 1);
      if (i < 9) {
        expect(game.phase).toBe("feedback");
        now += 750;
        game.tick(now);
      }
    }
    expect(game.phase).toBe("victory");
    expect(game.current?.id).toBe("1x10");
  });
  it("uses the selected number of lives and rejects out-of-range settings", () => {
    const game = started(10, 2, 1);
    game.digit("0", 4100);
    expect(game.phase).toBe("feedback");
    expect(game.lives).toBe(0);
    game.tick(4100 + ERROR_FEEDBACK_MS);
    expect(game.phase).toBe("defeat");
    expect(() => new Game({ mode: "multiply", length: "all", duration: 10, tables: 0, lives: 3 })).toThrow(RangeError);
    expect(() => new Game({ mode: "multiply", length: "all", duration: 10, tables: 10, lives: 11 })).toThrow(RangeError);
  });
  it("shows all four countdown values and ignores input before play", () => {
    const game = new Game({ mode: "multiply", length: "all", tables: 10, duration: 10, lives: 3 });
    game.start(0);
    expect([0, 1000, 2000, 3000].map((now) => game.countdown(now))).toEqual([
      3, 2, 1, 0,
    ]);
    game.digit("1", 1000);
    expect(game.answer).toBe("");
    game.tick(3999);
    expect(game.phase).toBe("countdown");
    game.tick(4000);
    expect(game.phase).toBe("question");
    expect(game.elapsed(4000)).toBe(0);
  });
  it("validates a one-digit answer immediately and locks further input", () => {
    const game = started();
    game.digit("1", 4100);
    expect(game.solved).toBe(1);
    expect(game.phase).toBe("feedback");
    game.digit("2", 4100);
    game.erase(4100);
    expect(game.answer).toBe("1");
    expect(game.solved).toBe(1);
  });
  it("waits for two digits, supports erase and compares the complete answer", () => {
    const game = started();
    const now = reach(game, "1x10");
    game.digit("9", now + 10);
    expect(game.phase).toBe("question");
    game.erase(now + 20);
    expect(game.answer).toBe("");
    game.digit("1", now + 30);
    expect(game.phase).toBe("question");
    game.digit("0", now + 40);
    expect(game.feedback?.correct).toBe(true);
    expect(game.solved).toBe(10);
  });
  it("rejects a complete wrong answer and does not accept unsupported input", () => {
    const game = started();
    const now = reach(game, "1x10");
    game.digit("Enter", now);
    game.digit("12", now);
    expect(game.answer).toBe("");
    game.digit("0", now + 10);
    expect(game.lives).toBe(3);
    game.digit("1", now + 20);
    expect(game.lives).toBe(2);
    expect(game.feedback?.submitted).toBe("01");
    expect(game.feedback?.correct).toBe(false);
  });
  it("requires three digits for 100, then celebrates before showing the result", () => {
    const game = started();
    const now = reach(game, "10x10");
    expect(game.solved).toBe(99);
    game.digit("1", now + 10);
    game.digit("0", now + 20);
    expect(game.phase).toBe("question");
    game.digit("0", now + 30);
    expect(game.phase).toBe("victory");
    expect(game.solved).toBe(100);
    expect(game.lives).toBe(3);
    expect(game.bestStreak).toBe(100);
    const elapsed = game.elapsed(now + 30);
    game.digit("1", now + 100);
    game.erase(now + 100);
    game.tick(now + 30 + VICTORY_DURATION_MS - 1);
    expect(game.phase).toBe("victory");
    expect(game.elapsed(now + 30 + VICTORY_DURATION_MS - 1)).toBe(elapsed);
    game.tick(now + 30 + VICTORY_DURATION_MS);
    expect(game.phase).toBe("finished");
    expect(game.elapsed(now + 30 + VICTORY_DURATION_MS)).toBe(elapsed);
  });
  it("puts a failed pair at the end and never repeats a successful pair", () => {
    const game = started();
    game.digit("0", 4100);
    expect(game.lives).toBe(2);
    expect(game.solved).toBe(0);
    game.tick(4100 + ERROR_FEEDBACK_MS - 1);
    expect(game.current?.id).toBe("1x1");
    game.tick(4100 + ERROR_FEEDBACK_MS);
    expect(game.current?.id).toBe("1x2");
    let now = 4100 + ERROR_FEEDBACK_MS;
    const seen = new Set<string>();
    for (let i = 0; i < 99; i++) {
      expect(seen.has(game.current!.id)).toBe(false);
      seen.add(game.current!.id);
      answerCorrectly(game, now + 100);
      now += 750;
      game.tick(now);
    }
    expect(game.solved).toBe(99);
    expect(game.current?.id).toBe("1x1");
    answerCorrectly(game, now + 100);
    expect(game.solved).toBe(100);
    expect(game.mistakes).toBe(1);
    expect(game.phase).toBe("victory");
    game.tick(now + 100 + VICTORY_DURATION_MS);
    expect(game.phase).toBe("finished");
  });
  it("shows the last correction for two seconds, then keeps the defeat visible for six seconds", () => {
    const game = started();
    for (let i = 0; i < 3; i++) {
      const wrongAt = 4100 + i * (ERROR_FEEDBACK_MS + 100);
      game.digit("0", wrongAt);
      expect(game.phase).toBe("feedback");
      game.tick(wrongAt + ERROR_FEEDBACK_MS - 1);
      expect(game.phase).toBe("feedback");
      game.tick(wrongAt + ERROR_FEEDBACK_MS);
    }
    expect(game.phase).toBe("defeat");
    expect(game.lives).toBe(0);
    expect(game.mistakes).toBe(3);
    const defeatAt = 4100 + 2 * (ERROR_FEEDBACK_MS + 100) + ERROR_FEEDBACK_MS;
    game.digit("1", defeatAt + 100);
    game.erase(defeatAt + 200);
    expect(game.lives).toBe(0);
    const resultsAt = defeatAt + DEFEAT_DURATION_MS;
    expect(DEFEAT_DURATION_MS).toBeGreaterThanOrEqual(5000);
    expect(game.elapsed(resultsAt - 1)).toBe(300);
    game.tick(resultsAt - 1);
    expect(game.phase).toBe("defeat");
    game.tick(resultsAt);
    expect(game.phase).toBe("finished");
    expect(game.elapsed(100000)).toBe(300);
    expect(started().lives).toBe(3);
    expect(started().solved).toBe(0);
  });
});

describe("timers and interruption", () => {
  it.each([5, 10, 15, 30] as const)("waits for presentation readiness without consuming the %s-second clock or accepting input", duration => {
    let ready = false;
    const game = new Game({ mode:"add", length:20, duration, tables:10, lives:3 }, () => .999999, () => ready);
    game.start(0);
    expect(game.upcomingQuestions[0].id).toBe("1+1");
    game.tick(4000);
    expect(game.phase).toBe("preparing");
    expect(game.current).toBeNull();
    game.digit("0", 5000);
    game.tick(12000);
    expect(game.solved).toBe(0);
    expect(game.lives).toBe(3);
    expect(game.elapsed(12000)).toBe(0);
    expect(game.timeLeft(12000)).toBe(duration * 1000);
    ready = true;
    game.tick(13000);
    expect(game.current?.id).toBe("1+1");
    game.digit("2", 13500);
    ready = false;
    game.tick(14150);
    expect(game.phase).toBe("preparing");
    expect(game.questionNumber).toBe(1);
    expect(game.elapsed(25000)).toBe(500);
    ready = true;
    game.tick(25000);
    expect(game.current?.id).toBe("1+2");
    expect(game.questionNumber).toBe(2);
    expect(game.timeLeft(25000)).toBe(duration * 1000);
  });
  it("keeps a preparation paused until explicit resume, including a partly answered question", () => {
    let ready = false;
    const game = new Game({mode:"multiply", length:"all", tables:1, duration:10, lives:3}, () => .999999, () => ready);
    game.start(0);
    game.tick(4000);
    game.pause(4500);
    ready = true;
    game.tick(15000);
    expect(game.phase).toBe("paused");
    expect(game.current).toBeNull();
    game.resume(15000);
    game.tick(19000);
    const now = reach(game, "1x10", 19000);
    game.digit("1", now + 100);
    game.pause(now + 300);
    ready = false;
    game.resume(now + 1000);
    game.tick(now + 5000);
    expect(game.phase).toBe("preparing");
    expect(game.answer).toBe("1");
    expect(game.timeLeft(now + 6000)).toBe(9700);
    const elapsed = game.elapsed(now + 6000);
    ready = true;
    game.tick(now + 10000);
    expect(game.phase).toBe("question");
    expect(game.elapsed(now + 10000)).toBe(elapsed);
    expect(game.timeLeft(now + 10000)).toBe(9700);
    game.digit("0", now + 10100);
    expect(game.phase).toBe("victory");
  });
  it("keeps the correction visible for two seconds even after a delayed browser frame", () => {
    const game = started(5);
    game.tick(12000);
    expect(game.feedback?.timeout).toBe(true);
    expect(game.elapsed(12000)).toBe(5000);
    game.tick(12000 + ERROR_FEEDBACK_MS - 1);
    expect(game.phase).toBe("feedback");
    game.tick(12000 + ERROR_FEEDBACK_MS);
    expect(game.phase).toBe("question");
    expect(game.timeLeft(12000 + ERROR_FEEDBACK_MS)).toBe(5000);
  });
  it.each([5, 10, 15, 30] as const)(
    "provides exactly %s seconds per question",
    (duration) => {
      const game = started(duration);
      game.tick(4000 + duration * 1000 - 1);
      expect(game.phase).toBe("question");
      expect(game.lives).toBe(3);
      game.tick(4000 + duration * 1000);
      expect(game.feedback?.timeout).toBe(true);
      expect(game.lives).toBe(2);
      expect(game.elapsed(100000)).toBe(duration * 1000);
    },
  );
  it("resolves a timeout and a simultaneous key only once", () => {
    const game = started(5);
    game.digit("1", 9000);
    game.tick(9000);
    game.digit("1", 9000);
    expect(game.feedback?.timeout).toBe(true);
    expect(game.lives).toBe(2);
    expect(game.solved).toBe(0);
  });
  it("does not count feedback, countdowns, or pauses toward the record", () => {
    const game = started();
    game.pause(4500);
    expect(game.elapsed(20000)).toBe(500);
    expect(game.timeLeft(20000)).toBe(9500);
    game.resume(20000);
    game.tick(24000);
    expect(game.timeLeft(24000)).toBe(9500);
    game.digit("1", 24500);
    expect(game.elapsed(100000)).toBe(1000);
    game.tick(25150);
    expect(game.timeLeft(25150)).toBe(10000);
    expect(game.elapsed(25250)).toBe(1100);
  });
  it("preserves an incomplete answer through repeated pauses and countdowns", () => {
    const game = started();
    const now = reach(game, "1x10");
    game.digit("1", now + 100);
    game.pause(now + 200);
    game.resume(now + 10000);
    game.pause(now + 11000);
    expect(game.timeLeft(now + 20000)).toBe(9800);
    game.resume(now + 20000);
    game.tick(now + 24000);
    expect(game.answer).toBe("1");
    expect(game.timeLeft(now + 24000)).toBe(9800);
    game.digit("0", now + 24100);
    expect(game.feedback?.correct).toBe(true);
  });
  it("pauses an initial countdown without creating an unseen question", () => {
    const game = new Game({ mode: "multiply", length: "all", tables: 10, duration: 10, lives: 3 });
    game.start(0);
    game.pause(2500);
    expect(game.current).toBe(null);
    game.resume(10000);
    game.tick(14000);
    expect(game.questionNumber).toBe(1);
    expect(game.timeLeft(14000)).toBe(10000);
  });
  it("preserves the remainder of a correction without removing another life", () => {
    const game = started();
    game.digit("0", 4100);
    game.pause(4600);
    game.resume(30000);
    game.tick(34000);
    expect(game.phase).toBe("feedback");
    game.tick(35499);
    expect(game.phase).toBe("feedback");
    game.tick(35500);
    expect(game.phase).toBe("question");
    expect(game.lives).toBe(2);
    expect(game.questionNumber).toBe(2);
  });
  it("charges one timeout when pausing just after the deadline", () => {
    const game = started(5);
    game.pause(9100);
    expect(game.phase).toBe("paused");
    expect(game.lives).toBe(2);
    expect(game.elapsed(20000)).toBe(5000);
  });
});
