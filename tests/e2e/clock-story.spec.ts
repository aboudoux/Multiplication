import { test, expect, type Page } from '@playwright/test';
import { CLOCK_PROGRESS_KEY, clockGameIds, clockLevels, roundLength } from '../../src/clock-games';
import { defaults, STORAGE_KEY } from '../../src/storage';

const levelKeys = clockGameIds.flatMap(game => clockLevels.map((_, level) => `${game}:${level}`));

async function openStoryGame(page: Page, completed: number) {
  await page.addInitScript(({ progressKey, progress, settingsKey, settings }) => {
    if (!localStorage.getItem(progressKey)) localStorage.setItem(progressKey, JSON.stringify(progress));
    if (!localStorage.getItem(settingsKey)) localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, { progressKey: CLOCK_PROGRESS_KEY, progress: levelKeys.slice(0, completed), settingsKey: STORAGE_KEY, settings: { ...defaults(), muted: true } });
  await page.clock.install({ time: new Date('2026-11-09T12:00:00Z') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-11-09T12:00:10Z'));
  await page.locator('#open-clock-arcade').click();
}

async function finishLevel(page: Page, game: string, level: number) {
  await page.locator(`[data-game="${game}"]`).click();
  await page.locator(`[data-level="${level}"]`).click();
  for (let index = 0; index < roundLength; index++) await page.locator('[data-clock-action="answer"]').first().click();
}

test('le premier ami rejoint le lapin au troisième niveau distinct', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStoryGame(page, 2);
  const friends = page.locator('.clock-companion-friend');
  await page.getByRole('button', { name: 'Lire l’histoire' }).click();
  await expect(page.getByRole('heading', { name: 'Le goûter du tic-tac' })).toBeVisible();
  await expect(page.getByText(/sa montre tombe dans une flaque/i)).toBeVisible();
  await expect(page.locator('.clock-chapter-locked')).toHaveCount(5);
  await expect(friends).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Voir la fin animée' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tous les jeux' }).click();

  await finishLevel(page, 'read', 2);
  await expect(page.locator('.clock-arrival')).toContainText('Noisette l’écureuil te rejoint !');
  await expect(friends).toHaveCount(1);
  await expect(friends.first()).toHaveAccessibleName('Noisette l’écureuil');
  await page.getByRole('button', { name: 'Lire l’histoire' }).click();
  await expect(page.locator('.clock-chapter[data-friend="squirrel"]')).toContainText('Une dent d’or');
  await expect(page.locator('.clock-chapter-locked')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.reload();
  await expect(friends).toHaveCount(1);
  await expect(page.locator('.clock-companion')).toContainText('3 / 18 niveaux faits');
});

test('le dernier niveau lance le dénouement et permet de le revoir après rechargement', async ({ page }) => {
  await openStoryGame(page, 17);
  await expect(page.locator('.clock-companion-friend')).toHaveCount(5);
  await finishLevel(page, 'next', 2);
  const scene = page.locator('.clock-finale-scene');
  const caption = page.locator('.clock-finale-caption');
  await expect(page.getByRole('heading', { name: 'Enfin l’heure du goûter !' })).toBeVisible();
  await expect(scene.locator('.clock-finale-cast svg')).toHaveCount(5);
  await expect(scene).toHaveAttribute('data-step', '0');
  await page.clock.fastForward(4100);
  await expect(caption).toContainText('Noisette et Pique');

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(30_000);
  await expect(scene).toHaveAttribute('data-step', '1');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(50);
  await page.clock.fastForward(4100);
  await expect(caption).toContainText('partage enfin son gâteau');
  await expect(scene).toHaveAttribute('data-step', '2');
  await expect(page.getByRole('button', { name: 'Revoir l’animation' })).toBeVisible();
  await page.getByRole('button', { name: 'Mon bilan' }).click();
  await expect(page.getByText('Niveau fait', { exact: false })).toBeVisible();

  await page.reload();
  await expect(page.locator('.clock-companion')).toContainText('18 / 18 niveaux faits');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#open-clock-arcade').click();
  await page.getByRole('button', { name: 'Lire l’histoire' }).click();
  await page.getByRole('button', { name: 'Voir la fin animée' }).click();
  await page.clock.fastForward(9000);
  await expect(scene).toHaveAttribute('data-step', '2');
  await expect(scene.locator('.clock-finale-cake')).toHaveCSS('animation-name', 'none');
  await expect(scene.locator('.clock-finale-cake')).toHaveCSS('opacity', '1');
});
