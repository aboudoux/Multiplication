import type { Page } from '@playwright/test';
import { clockCorrectionMs } from '../../src/clock-games';

export async function answerClock(page: Page, correct = true) {
  const hour = (await page.locator('#clock-heading').textContent())!.match(/(\d+) h/)![1];
  const face = `Petite aiguille sur le ${hour}, grande aiguille sur le 12`;
  const answer = page.getByRole('button', { name: face, exact: true });
  const wrong = page.locator('.clock-options button').filter({ hasNot: page.locator(`svg[aria-label="${face}"]`) }).first();
  await (correct ? answer : wrong).click();
}

export async function advanceClockLesson(page: Page) {
  if (await page.locator('.clock-lesson').isVisible()) await page.clock.fastForward(clockCorrectionMs + 100);
}

export async function answerFirstClockOption(page: Page) {
  await page.locator('[data-clock-action="answer"]').first().click();
  await advanceClockLesson(page);
}
