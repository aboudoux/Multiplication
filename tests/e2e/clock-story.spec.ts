import { test, expect, type Page } from '@playwright/test';
import { CLOCK_PROGRESS_KEY, clockGameIds, clockLevels, roundLength } from '../../src/clock-games';
import { defaults, STORAGE_KEY } from '../../src/storage';
import { answerFirstClockOption } from './clock-helpers';

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
  for (let index = 0; index < roundLength; index++) await answerFirstClockOption(page);
}

test('le premier ami rejoint le lapin au troisième niveau distinct', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStoryGame(page, 2);
  const friends = page.locator('.clock-companion-friend');
  await expect(page.getByRole('button', { name: 'Revoir l’animation' })).toHaveCount(0);
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
  await page.getByRole('button', { name: 'Retour aux niveaux' }).click();
  await expect(page.getByRole('heading', { name: 'Lis l’horloge' })).toBeVisible();

  await page.reload();
  await expect(friends).toHaveCount(1);
  await expect(friends.first()).toBeHidden();
  await page.locator('#open-clock-arcade').click();
  await expect(friends.first()).toBeVisible();
  await expect(page.locator('.clock-companion')).toContainText('3 / 18 niveaux faits');
});

test('le dernier niveau lance le dénouement et permet de le revoir après rechargement', async ({ page }) => {
  await openStoryGame(page, 17);
  await expect(page.locator('.clock-companion-friend')).toHaveCount(5);
  await finishLevel(page, 'next', 2);
  const scene = page.locator('.clock-finale-scene');
  const caption = page.locator('.clock-finale-caption');
  await expect(page.getByRole('heading', { name: 'Enfin l’heure du goûter !' })).toBeVisible();
  await expect(page.locator('.clock-finish-bubble')).toHaveText('Oh là là, je suis en retard !');
  const portraits = scene.locator('.clock-finale-cast .clock-character');
  await expect(portraits).toHaveCount(6);
  const artwork = await portraits.evaluateAll(elements => Promise.all(elements.map(async element => {
    const image = new Image();
    image.src = getComputedStyle(element).backgroundImage.slice(5, -2);
    await image.decode();
    return { animal: element.getAttribute('data-portrait'), width: image.naturalWidth, src: image.src };
  })));
  expect(artwork.map(portrait => portrait.animal)).toEqual(['rabbit', 'squirrel', 'hedgehog', 'turtle', 'owl', 'fox']);
  expect(artwork.every(portrait => portrait.width === 520 && portrait.src.startsWith('data:image/webp;'))).toBe(true);
  expect(new Set(artwork.map(portrait => portrait.src)).size).toBe(6);
  await expect(scene).toHaveAttribute('data-step', '0');
  await page.clock.fastForward(5100);
  await expect(caption).toContainText('Noisette et Pique');
  await expect(scene.locator('.clock-finale-gear')).toHaveCSS('animation-name', 'clock-finale-gear-fit');
  await expect(scene.locator('.clock-finale-actor[data-animal="squirrel"]')).toHaveCSS('animation-name', 'clock-finale-offer');
  await page.getByRole('button', { name: 'Pause du film' }).click();
  await expect(scene.locator('.clock-finale-gear')).toHaveCSS('animation-play-state', 'paused');
  await page.clock.fastForward(30_000);
  await expect(scene).toHaveAttribute('data-step', '1');
  await page.getByRole('button', { name: 'Reprendre le film' }).click();

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
  await page.clock.fastForward(5100);
  await expect(caption).toContainText('quatre heures dix');
  await expect(scene.locator('.clock-finale-minute')).toHaveCSS('animation-name', 'clock-finale-minute-set');
  await page.clock.fastForward(5100);
  await expect(caption).toContainText('Les lanternes s’allument');
  await expect(scene.locator('.clock-finale-bell')).toHaveCSS('animation-name', 'clock-finale-bell-swing');
  await page.clock.fastForward(5100);
  await expect(caption).toContainText('partage enfin son gâteau');
  await expect(scene).toHaveAttribute('data-step', '4');
  await expect(page.getByRole('progressbar', { name: 'Tableau du film' })).toHaveAttribute('value', '5');
  await expect(scene.locator('.clock-finale-confetti i')).toHaveCount(12);
  const replay = page.getByRole('button', { name: 'Revoir l’animation' });
  await expect(replay).toBeVisible();
  await replay.click();
  await expect(scene).toHaveAttribute('data-step', '0');
  await expect(page.getByRole('progressbar', { name: 'Tableau du film' })).toHaveAttribute('value', '1');
  await page.getByRole('button', { name: 'Mon bilan' }).click();
  await expect(page.getByText('Niveau fait', { exact: false })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('.clock-companion')).toContainText('18 / 18 niveaux faits');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#open-clock-arcade').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await replay.click();
  await expect(scene).toHaveAttribute('data-step', '0');
  await page.getByRole('button', { name: 'Tous les jeux' }).click();
  await expect(replay).toBeVisible();
  await page.getByRole('button', { name: 'Lire l’histoire' }).click();
  await page.getByRole('button', { name: 'Voir la fin animée' }).click();
  await page.clock.fastForward(21_000);
  await expect(scene).toHaveAttribute('data-step', '4');
  await expect(scene.locator('.clock-finale-cake')).toHaveCSS('animation-name', 'none');
  await expect(scene.locator('.clock-finale-cake')).toHaveCSS('opacity', '1');
});

test('les portraits des cinq amis s’inclinent et avancent sous les réponses sans bloquer le jeu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStoryGame(page, 15);
  const trail = page.locator('.clock-guest-trail');
  await expect(trail).toBeHidden();
  await page.locator('[data-game="read"]').click();
  await page.locator('[data-level="0"]').click();
  await expect(trail).toBeVisible();
  await expect(trail).toHaveCSS('pointer-events', 'none');
  await expect(trail.locator('.clock-guest-spot')).toHaveCount(5);
  const figure = trail.locator('[data-clock-friend="squirrel"] .clock-guest-figure');
  const squirrel = figure.locator('.clock-friend-art');
  const movement = await figure.evaluate(figure => {
    const seek = (node: Element, name: string, fraction: number) => {
      const animation = node.getAnimations().find(animation => (animation as CSSAnimation).animationName === name)!;
      const { delay, duration } = animation.effect!.getTiming();
      animation.pause();
      animation.currentTime = delay + Number(duration) * (1 + fraction);
      return getComputedStyle(node);
    };
    const left = parseFloat(seek(figure, 'clock-guest-stroll', 0).left);
    const right = parseFloat(seek(figure, 'clock-guest-stroll', .5).left);
    const portrait = figure.querySelector('.clock-friend-art')!;
    const still = seek(portrait, 'clock-animal-tilt', 0).transform;
    const greeting = seek(portrait, 'clock-animal-tilt', .34).transform;
    return { distance: right - left, still, greeting };
  });
  expect(movement.distance).toBeGreaterThan(8);
  expect(movement.greeting).not.toBe(movement.still);
  await expect(squirrel).toHaveAttribute('data-portrait', 'squirrel');
  const actor = await squirrel.elementHandle();
  const face = (await page.locator('.clock-face').getAttribute('aria-label'))!;
  const hour = face.match(/Petite aiguille sur le (\d+)/)![1];
  await page.getByRole('button', { name: `${hour} h`, exact: true }).click();
  await expect(page.getByText('Question 2 sur 5')).toBeVisible();
  await expect(squirrel).toHaveCSS('animation-name', 'clock-friend-cheer');
  expect(await actor!.evaluate(node => node.isConnected)).toBe(true);
  await page.locator('[data-clock-action="pause"]').click();
  await expect(trail).toBeHidden();
  await page.locator('[data-clock-action="resume"]').click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(figure).toHaveCSS('animation-name', 'none');
  await expect(squirrel).toHaveCSS('animation-name', 'none');
  await expect(trail).toBeVisible();
});
