import type { Page } from '@playwright/test';

export async function answerClock(page: Page, correct = true) {
  const hour = (await page.locator('#clock-heading').textContent())!.match(/(\d+) h/)![1];
  const face = `Petite aiguille sur le ${hour}, grande aiguille sur le 12`;
  const answer = page.getByRole('button', { name: face, exact: true });
  const wrong = page.locator('.clock-options button').filter({ hasNot: page.locator(`svg[aria-label="${face}"]`) }).first();
  await (correct ? answer : wrong).click();
}

export async function continueClockLesson(page: Page) {
  const next = page.locator('[data-clock-action="continue-lesson"]');
  if (await next.isVisible()) await next.click();
}

export async function answerFirstClockOption(page: Page) {
  await page.locator('[data-clock-action="answer"]').first().click();
  await continueClockLesson(page);
}
