import { test, expect } from '@playwright/test';
import { defaults, STORAGE_KEY } from '../../src/storage';
import { clockGameIds } from '../../src/clock-games';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key, settings }) => localStorage.setItem(key, JSON.stringify(settings)), {
    key: STORAGE_KEY, settings: { ...defaults(), muted: true },
  });
  await page.clock.install();
  await page.goto('/');
});

test('la vignette ouvre les six jeux et chacun propose trois niveaux', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.destination-card')).toHaveCount(3);
  const illustration = page.locator('.clock-entry img');
  await expect.poll(() => illustration.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await illustration.scrollIntoViewIfNeeded();
  const box = (await illustration.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole('heading', { name: 'Les jeux du lapin chrono' })).toBeFocused();
  for (const game of clockGameIds) {
    await page.locator(`[data-game="${game}"]`).click();
    await expect(page.locator('[data-clock-action="level"]')).toHaveCount(3);
    await page.getByRole('button', { name: 'Tous les jeux' }).click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Accueil', exact: false }).click();
  await expect(page.locator('#open-clock-arcade')).toBeFocused();
  await expect(page.locator('#open-adventure')).toBeVisible();
  await expect(page.locator('#open-training')).toBeVisible();
});

test('le chrono attend les corrections et la pause, puis termine la partie à zéro', async ({ page }) => {
  await page.locator('#open-clock-arcade').click();
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-level="0"]').click();
  const timer = page.getByRole('timer');
  await expect(timer).toHaveText('90 s');
  const prompt = await page.locator('#clock-heading').textContent();
  const hour = prompt!.match(/(\d+) h/)![1];
  await page.getByRole('button', { name: `Petite aiguille sur le ${hour}, grande aiguille sur le 12`, exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bravo !' })).toBeVisible();
  const remaining = await timer.textContent();
  await page.clock.fastForward(100_000);
  await expect(timer).toHaveText(remaining!);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.getByText('Question 2 sur 5')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Petite pause' })).toBeVisible();
  await page.clock.fastForward(100_000);
  await page.getByRole('button', { name: 'On continue !' }).click();
  await expect(timer).toHaveText(remaining!);
  await page.clock.fastForward(100_000);
  await expect(page.getByRole('heading', { name: 'Le chrono a sonné !' })).toBeVisible();
  await expect(page.getByText('1 bonne réponse')).toBeVisible();
  await page.getByRole('button', { name: 'Rejouer' }).click();
  await expect(page.getByText('Question 1 sur 5')).toBeVisible();
});

test('une manche complète propose cinq corrections et un bilan', async ({ page }) => {
  await page.locator('#open-clock-arcade').click();
  await page.locator('[data-game="elapsed"]').click();
  await page.locator('[data-level="2"]').click();
  for (let index = 1; index <= 5; index++) {
    await expect(page.getByText(`Question ${index} sur 5`)).toBeVisible();
    await page.locator('[data-clock-action="answer"]').first().click();
    await expect(page.getByText(/il s’écoule/)).toBeVisible();
    await page.locator('[data-clock-action="next"]').click();
  }
  await expect(page.getByRole('heading', { name: 'Bien joué !' })).toBeVisible();
  await expect(page.getByText('5 questions jouées sur 5', { exact: false })).toBeVisible();
});
