import { describe, expect, it } from 'vitest';
import { birthdayChapter, BIRTHDAY_DURATION_MS } from '../../src/birthday-party';

describe('birthday film timeline', () => {
  it('keeps the cake, song, candles and presents in their narrative order for exactly 30 seconds', () => {
    expect(BIRTHDAY_DURATION_MS).toBe(30_000);
    expect([0,5_499,5_500,17_999,18_000,19_999,20_000,29_999,30_000,40_000].map(birthdayChapter))
      .toEqual(['cake','cake','song','song','candles','candles','gifts','gifts','finished','finished']);
  });
});
