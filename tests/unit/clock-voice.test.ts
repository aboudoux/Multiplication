import { expect, test } from 'vitest';
import { clockGameIds, clockRound } from '../../src/clock-games';
import clips from '../../src/clock-voice-clips.json';

test('les six jeux et leurs trois niveaux utilisent des extraits de voix valides', () => {
  for (const game of clockGameIds) {
    for (const level of [0, 1, 2] as const) {
      for (let seed = 1; seed <= 30; seed++) {
        let state = seed;
        const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 2 ** 32);
        for (const question of clockRound(game, level, random)) {
          expect(question.narration.length, question.prompt).toBeGreaterThan(0);
          for (const token of question.narration) {
            expect(clips[token], token).toBeDefined();
            expect(clips[token][1]).toBeGreaterThan(clips[token][0]);
          }
        }
      }
    }
  }
});
