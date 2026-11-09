import { test, expect } from '@playwright/test';
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
  await page.clock.fastForward(1500);
  await expect(timer).toHaveText(remaining!);
  await expect(page.getByRole('button', { name: 'Question suivante' })).toHaveCount(0);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(100_000);
  await expect(timer).toHaveText(remaining!);
  await expect(page.getByRole('heading', { name: 'Bravo !' })).toBeVisible();
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(2700);
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
    await page.clock.fastForward(5000);
  }
  await expect(page.getByRole('heading', { name: 'Bien joué !' })).toBeVisible();
  await expect(page.getByText('5 questions jouées sur 5', { exact: false })).toBeVisible();
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
  for (const selector of ['#clock-heading', '.clock-intro p', '.clock-games strong', '.clock-games button span:last-child']) {
    expect(await contrast(selector), selector).toBeGreaterThanOrEqual(4.5);
  }
  await page.locator('[data-game="elapsed"]').click();
  await page.locator('[data-level="0"]').click();
  for (const selector of ['#clock-heading', '.clock-center p', '.clock-options button', '#clock-time']) {
    expect(await contrast(selector), selector).toBeGreaterThanOrEqual(4.5);
  }
});
