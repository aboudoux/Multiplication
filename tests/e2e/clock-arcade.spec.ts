import { test, expect, type Page } from '@playwright/test';
import { defaults, STORAGE_KEY } from '../../src/storage';
import { clockGameIds } from '../../src/clock-games';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key, settings }) => localStorage.setItem(key, JSON.stringify(settings)), {
    key: STORAGE_KEY, settings: { ...defaults(), muted: true },
  });
  await page.clock.install({ time: new Date('2026-11-09T12:00:00Z') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-11-09T12:00:10Z'));
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

async function answerClock(page: Page, correct = true) {
  const hour = (await page.locator('#clock-heading').textContent())!.match(/(\d+) h/)![1];
  const answer = page.getByRole('button', { name: `Petite aiguille sur le ${hour}, grande aiguille sur le 12`, exact: true });
  await (correct ? answer : page.locator('.clock-options button').filter({ hasNot: page.locator(`svg[aria-label="Petite aiguille sur le ${hour}, grande aiguille sur le 12"]`) }).first()).click();
}

test('la prochaine question est immédiatement jouable et le chrono respecte la pause', async ({ page }) => {
  await page.locator('#open-clock-arcade').click();
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-level="0"]').click();
  const timer = page.getByRole('timer');
  await expect(timer).toHaveText('90 s');
  await answerClock(page);
  await expect(page.getByText('Question 2 sur 5')).toBeVisible();
  await expect(page.locator('.clock-feedback')).toHaveText('Bravo, bonne réponse !');
  await answerClock(page, false);
  await expect(page.getByText('Question 3 sur 5')).toBeVisible();
  await expect(page.locator('.clock-feedback')).toContainText('Pour la question précédente');
  await expect(page.locator('.clock-sparkles')).toHaveCount(0);
  await page.clock.runFor(1500);
  await expect(timer).toHaveText('89 s');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(100_000);
  await expect(page.getByRole('heading', { name: 'Petite pause' })).toBeVisible();
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.getByRole('button', { name: 'On continue !' }).click();
  await expect(timer).toHaveText('89 s');
  await page.clock.fastForward(100_000);
  await expect(page.getByRole('heading', { name: 'Le chrono a sonné !' })).toBeVisible();
  await expect(page.getByText('1 bonne réponse')).toBeVisible();
  await page.getByRole('button', { name: 'Rejouer' }).click();
  await expect(page.getByText('Question 1 sur 5')).toBeVisible();
});

test('chaque réussite relance les étoiles et le lapin passe tous les cinq succès', async ({ page }) => {
  await page.locator('#open-clock-arcade').click();
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-level="0"]').click();
  let successes = 0;
  for (const wrongFirst of [true, false, false]) {
    for (let index = 1; index <= 5; index++) {
      await expect(page.getByText(`Question ${index} sur 5`)).toBeVisible();
      if (wrongFirst && index === 1) {
        await answerClock(page, false);
        continue;
      }
      const previous = await page.locator('.clock-sparkles').elementHandles();
      await answerClock(page);
      successes++;
      await expect(page.locator('.clock-sparkles')).toHaveCount(1);
      if (previous[0]) expect(await previous[0].evaluate(node => node.isConnected)).toBe(false);
      if (successes % 5 === 0) {
        await expect(page.locator('.clock-feedback')).toContainText(`${successes} bonnes réponses`);
        const runner = page.locator('.clock-rabbit-runner');
        await expect(runner).toHaveCSS('animation-name', successes === 5 ? 'clock-rabbit' : 'clock-celebration-fade');
        await expect(page.locator('.clock-parade')).toHaveCSS('pointer-events', 'none');
        await runner.evaluate(element => element.dispatchEvent(new Event('animationend')));
        await page.emulateMedia({ reducedMotion: 'reduce' });
      }
      await expect(page.locator('.clock-rabbit-runner')).toHaveCount(0);
    }
    await expect(page.getByRole('heading', { name: 'Bien joué !' })).toBeVisible();
    await expect(page.getByText('5 questions jouées sur 5', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Rejouer' }).click();
  }
});

test('les titres, consignes et réponses contrastent avec leur fond', async ({ page }) => {
  await page.locator('#open-clock-arcade').click();
  const contrast = (selector: string) => page.locator(selector).first().evaluate(element => {
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(value => Number(value) / 255);
      const [red, green, blue] = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return red * 0.2126 + green * 0.7152 + blue * 0.0722;
    };
    const foreground = luminance(getComputedStyle(element).color);
    let surface: Element | null = element;
    while (surface) {
      const background = getComputedStyle(surface).backgroundColor;
      if (background.startsWith('rgb(')) {
        const light = luminance(background);
        return (Math.max(light, foreground) + 0.05) / (Math.min(light, foreground) + 0.05);
      }
      surface = surface.parentElement;
    }
    return 0;
  });
  for (const selector of ['#clock-heading', '.clock-intro p', '.clock-games strong', '.clock-games button span:not(.clock-icon)', '.clock-games small']) {
    expect(await contrast(selector), selector).toBeGreaterThanOrEqual(4.5);
  }
  await page.locator('[data-game="elapsed"]').click();
  await page.locator('[data-level="0"]').click();
  for (const selector of ['#clock-heading', '.clock-center p', '.clock-options button', '#clock-time']) {
    expect(await contrast(selector), selector).toBeGreaterThanOrEqual(4.5);
  }
});

test('les niveaux faits débloquent un compagnon persistant et ne sont comptés qu’une fois', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const companion = page.locator('.clock-companion');
  const games = page.getByRole('button', { name: 'Tous les jeux' });
  const levels = page.getByRole('button', { name: 'Retour aux niveaux' });
  const firstLevel = page.locator('[data-level="0"]');
  const finishRound = async () => {
    for (let index = 0; index < 5; index++) await page.locator('[data-clock-action="answer"]').first().click();
  };

  await expect(companion).toBeHidden();
  await page.locator('#open-clock-arcade').click();
  await page.locator('[data-game="match"]').click();
  await firstLevel.click();
  await answerClock(page, false);
  await page.clock.fastForward(100_000);
  await expect(page.getByRole('heading', { name: 'Le chrono a sonné !' })).toBeVisible();
  await expect(companion).toBeHidden();

  await page.getByRole('button', { name: 'Rejouer' }).click();
  for (let index = 0; index < 5; index++) await answerClock(page, false);
  await expect(page.getByText('Niveau fait', { exact: false })).toBeVisible();
  await expect(companion).toBeVisible();
  await expect(companion).toContainText('1 / 18 niveaux faits');
  await expect(companion).toHaveAttribute('data-gesture', 'finish');

  await expect(games).toHaveCount(0);
  await levels.click();
  await expect(page.getByRole('heading', { name: 'Trouve le cadran' })).toBeVisible();
  await expect(firstLevel.locator('.clock-done')).toHaveText('✓ Fait');
  await games.click();
  await expect(page.locator('[data-game="match"]')).toContainText('1 / 3 niveaux faits');
  await page.locator('[data-game="match"]').click();
  await expect(firstLevel.locator('.clock-done')).toHaveText('✓ Fait');
  await expect(page.locator('.clock-levels .clock-done')).toHaveCount(1);
  await firstLevel.click();
  await answerClock(page);
  await expect(companion).toHaveAttribute('data-gesture', 'cheer');
  await expect(companion.locator('.clock-companion-art')).toHaveCSS('animation-name', 'clock-companion-hop');
  await answerClock(page, false);
  await expect(companion).toHaveAttribute('data-gesture', 'encourage');
  for (let index = 0; index < 3; index++) await answerClock(page);
  await expect(companion).toContainText('1 / 18 niveaux faits');

  await levels.click();
  await games.click();
  await page.locator('[data-game="elapsed"]').click();
  await expect(page.locator('.clock-levels .clock-done')).toHaveCount(0);
  await firstLevel.click();
  await finishRound();
  await expect(companion).toContainText('2 / 18 niveaux faits');
  await levels.click();
  await games.click();
  await page.getByRole('button', { name: 'Accueil', exact: false }).click();
  await expect(companion).toBeVisible();
  await expect(companion).toHaveCSS('position', 'fixed');
  await expect(companion).toHaveCSS('pointer-events', 'none');
  await page.locator('#open-training').click();
  await expect(companion).toContainText('2 / 18 niveaux faits');
  await page.reload();
  await expect(companion).toContainText('2 / 18 niveaux faits');
  await page.locator('#open-clock-arcade').click();
  await page.locator('[data-game="match"]').click();
  await expect(firstLevel.locator('.clock-done')).toHaveText('✓ Fait');
});
