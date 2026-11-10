import { test, expect, type Page } from '@playwright/test';
import { defaults, STORAGE_KEY } from '../../src/storage';
import { CLOCK_PROGRESS_KEY, clockGameIds, clockLevels, clockRound, clockTime } from '../../src/clock-games';
import { advanceClockLesson, answerClock, answerFirstClockOption, openClockArcade } from './clock-helpers';

async function prepareClockPage(page: Page, completed: number | string[] = 0) {
  const progress = typeof completed === 'number'
    ? clockGameIds.flatMap(game => clockLevels.map((_, level) => `${game}:${level}`)).slice(0, completed)
    : completed;
  await page.addInitScript(({ settingsKey, settings, progressKey, progress }) => {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    if (!localStorage.getItem(progressKey)) localStorage.setItem(progressKey, JSON.stringify(progress));
  }, { settingsKey: STORAGE_KEY, settings: { ...defaults(), muted: true }, progressKey: CLOCK_PROGRESS_KEY, progress });
  await page.clock.install({ time: new Date('2026-11-09T12:00:00Z') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-11-09T12:00:10Z'));
}

test('la vignette ouvre les six jeux et chacun propose trois niveaux', async ({ page }) => {
  await prepareClockPage(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.destination-card')).toHaveCount(2);
  await page.locator('#open-adventure').click();
  await expect(page.locator('.adventure-choice-card')).toHaveCount(3);
  const illustration = page.locator('.clock-entry [data-portrait="rabbit"]');
  await expect(illustration).toHaveCSS('clip-path', /#clock-animal-cut-rabbit/);
  await expect(page.locator('#clock-animal-cut-rabbit')).toHaveCount(1);
  await expect(illustration).toHaveCSS('animation-name', 'clock-portrait-hop');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(illustration).toHaveCSS('animation-name', 'none');
  expect(await illustration.evaluate(async element => {
    const image = new Image();
    image.src = getComputedStyle(element).backgroundImage.slice(5, -2);
    await image.decode();
    return [image.src.startsWith('data:image/webp;'), image.naturalWidth];
  })).toEqual([true, 520]);
  await illustration.scrollIntoViewIfNeeded();
  const box = (await illustration.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole('heading', { name: 'Les jeux du lapin chrono' })).toBeFocused();
  const introRabbit = page.locator('.clock-intro [data-portrait="rabbit"]');
  await expect(introRabbit).toHaveCSS('clip-path', /#clock-animal-cut-rabbit/);
  await expect(introRabbit).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(introRabbit).toHaveCSS('animation-name', 'clock-portrait-hop');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ant');
  await expect(page.locator('.clock-map-stop')).toHaveCount(6);
  await expect(page.locator('.clock-map-level')).toHaveCount(18);
  await expect(page.getByRole('button', { name: /La prairie du lapin/ })).toBeVisible();
  await expect(page.locator('.clock-map-level').first()).toHaveAccessibleName('Niveau 1, Découverte, À jouer');
  await expect(page.locator('.clock-map-level').last()).toHaveAccessibleName('Niveau 18, Défi, Verrouillé');
  await expect(page.locator('.clock-map-level').last().locator('.clock-map-marker')).toHaveCSS('background-color', 'rgb(222, 222, 222)');
  await expect(page.locator('.clock-map-level:disabled .clock-level-lock')).toHaveCount(17);
  await expect(page.locator('.clock-map-level:enabled .clock-level-lock')).toHaveCount(0);
  await expect(page.locator('.clock-map-level[data-state="next"] .clock-map-rabbit')).toBeVisible();
  await expect(page.locator('.clock-map-level:enabled')).toHaveCount(1);
  await page.locator('.clock-map-level:enabled').click();
  await expect(page.getByText('Question 1 sur 5')).toBeVisible();
  await page.locator('[data-clock-action="pause"]').click();
  await page.getByRole('button', { name: 'Tous les jeux' }).click();
  for (const game of clockGameIds) {
    await page.locator(`[data-game="${game}"]`).click();
    await expect(page.locator('[data-clock-action="level"]')).toHaveCount(3);
    await expect(page.locator('[data-clock-action="level"]:enabled')).toHaveCount(game === 'read' ? 1 : 0);
    await expect(page.locator('.clock-levels .clock-locked')).toHaveCount(game === 'read' ? 2 : 3);
    await page.getByRole('button', { name: 'Tous les jeux' }).click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Choix des aventures' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'club');
  await expect(page.locator('#open-clock-arcade')).toBeFocused();
  await expect(page.locator('#adventure-choice')).toBeVisible();
  await page.locator('#leave-adventure-choice').click();
  await expect(page.locator('#open-adventure')).toBeVisible();
  await expect(page.locator('#open-training')).toBeVisible();
});

test('une réussite avance immédiatement et une fiche d’erreur se ferme seule', async ({ page }) => {
  await prepareClockPage(page, 3);
  await page.setViewportSize({ width: 390, height: 844 });
  await openClockArcade(page);
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-level="0"]').click();
  const timer = page.getByRole('timer');
  await expect(timer).toHaveText('90 s');
  const timeTrack = page.getByRole('progressbar', { name: 'Temps restant' });
  await expect(timeTrack).toHaveAttribute('aria-valuenow', '90');
  await expect(page.locator('.clock-options.keypad button')).toHaveCount(3);
  const question = await page.locator('#clock-heading').boundingBox();
  const arcade = await page.locator('.clock-arcade').boundingBox();
  expect(question!.x).toBeGreaterThanOrEqual(arcade!.x);
  expect(question!.x + question!.width).toBeLessThanOrEqual(arcade!.x + arcade!.width);
  await answerClock(page);
  await expect(page.getByText('Question 2 sur 5')).toBeVisible();
  await expect(page.locator('.clock-feedback')).toHaveText('Bravo, bonne réponse !');
  await expect(page.locator('.clock-quick-runner')).toHaveCount(4);
  await expect(page.locator('.clock-quick-runner').first()).toHaveCSS('animation-name', 'clock-quick-sprint');
  await page.clock.runFor(1500);
  await expect(timer).toHaveText('89 s');
  await expect(timeTrack).toHaveAttribute('aria-valuenow', '89');
  await answerClock(page, false);
  await expect(page.getByRole('heading', { name: 'Regardons ensemble' })).toBeFocused();
  await expect(page.locator('.clock-lesson')).toContainText('89 S RESTANTES');
  await expect(page.locator('.clock-options')).toHaveCount(0);
  await expect(page.locator('.clock-lesson .clock-face')).toBeVisible();
  await expect(page.locator('.clock-lesson.correction-card')).toBeVisible();
  await expect(page.locator('.clock-lesson .theme-sprite')).toHaveCount(0);
  await expect(page.locator('.clock-sparkles')).toHaveCount(0);
  const mistake = page.locator('.clock-mistake-effect');
  await expect(mistake.locator('i')).toHaveCount(12);
  await expect(mistake).toHaveCSS('animation-duration', '4.5s');
  await expect(mistake).toHaveCSS('pointer-events', 'none');
  await expect(page.getByRole('button', { name: 'J’ai compris, on continue' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Passer' })).toHaveCount(0);
  await page.clock.runFor(1700);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(100_000);
  await expect(page.locator('.clock-lesson')).toContainText('89 S RESTANTES');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(2300);
  await expect(page.locator('.clock-lesson')).toBeVisible();
  await page.clock.fastForward(650);
  await expect(page.getByText('Question 3 sur 5')).toBeVisible();
  await expect(mistake).toHaveCount(0);
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
  await expect(page.locator('.clock-finish-pass')).toHaveCount(0);
  await expect(page.getByText('1 bonne réponse')).toBeVisible();
  await expect(page.locator('.clock-results .result-stats > div')).toHaveCount(3);
  await page.getByRole('button', { name: 'Rejouer' }).click();
  await expect(page.getByText('Question 1 sur 5')).toBeVisible();
});

test('chaque mini-jeu montre une fiche illustrée avec la bonne réponse', async ({ page }) => {
  await prepareClockPage(page, 15);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { Math.random = () => 0; });
  for (const game of clockGameIds) {
    await openClockArcade(page);
    await page.locator(`[data-game="${game}"]`).click();
    await page.locator('[data-level="0"]').click();
    const question = clockRound(game, 0, () => 0)[0];
    const wrong = question.options.findIndex(option => option !== question.correct);
    await page.locator(`[data-option="${wrong}"]`).click();
    await expect(page.locator('.clock-lesson')).toHaveAttribute('data-lesson-kind', question.correction.kind);
    await expect(page.locator('.clock-lesson-answer strong')).toHaveText(typeof question.correct === 'number' ? clockTime(question.correct, true) : question.correct);
    await expect(page.locator('.clock-lesson-figure')).toBeVisible();
    await expect(page.locator('.clock-lesson .sprite-kitten')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator('.brand').click();
  }
});

test('le bonhomme et les étoiles repartent à chaque réussite, le lapin tous les cinq succès', async ({ page }) => {
  await prepareClockPage(page, 3);
  await openClockArcade(page);
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-level="0"]').click();
  let successes = 0;
  for (const wrongFirst of [true, false, false]) {
    for (let index = 1; index <= 5; index++) {
      await expect(page.getByText(`Question ${index} sur 5`)).toBeVisible();
      if (wrongFirst && index === 1) {
        await answerClock(page, false);
        await advanceClockLesson(page);
        continue;
      }
      const previous = await page.locator('.clock-sparkles').elementHandles();
      const previousRunner = await page.locator('.clock-quick-party').last().elementHandles();
      if (previousRunner[0]) await previousRunner[0].evaluate(node => (node as HTMLElement).style.animationPlayState = 'paused');
      await answerClock(page);
      successes++;
      await expect(page.locator('.clock-sparkles')).toHaveCount(1);
      await expect(page.locator('.clock-sparkles i')).toHaveCount(12);
      const party = page.locator('.clock-quick-party').last();
      await expect(party.locator('.clock-quick-runner')).toHaveCount(4);
      await expect(party.locator('.clock-party-confetti i')).toHaveCount(32);
      await expect(party).toHaveCSS('animation-duration', '3s');
      await expect(party.locator('.clock-quick-runner').first()).toHaveCSS('animation-name', successes <= 5 ? 'clock-quick-sprint' : 'none');
      if (previous[0]) expect(await previous[0].evaluate(node => node.isConnected)).toBe(false);
      if (previousRunner[0]) {
        expect(await previousRunner[0].evaluate(node => node.isConnected)).toBe(true);
        await previousRunner[0].evaluate(node => node.dispatchEvent(new Event('animationend')));
      }
      if (successes % 5 === 0) {
        await expect(page.locator('.clock-feedback')).toContainText(`${successes} bonnes réponses`);
        const runner = page.locator('.clock-rabbit-runner');
        await expect(runner).toHaveCSS('animation-name', successes === 5 ? 'clock-rabbit' : 'clock-celebration-fade');
        await expect(runner.locator('[data-portrait="rabbit"]')).toHaveCSS('animation-name', successes === 5 ? 'clock-animal-tilt' : 'none');
        await expect(page.locator('.clock-parade')).toHaveCSS('pointer-events', 'none');
        await runner.evaluate(element => element.dispatchEvent(new Event('animationend')));
        await page.emulateMedia({ reducedMotion: 'reduce' });
      }
      await expect(page.locator('.clock-rabbit-runner')).toHaveCount(0);
    }
    await expect(page.getByRole('heading', { name: 'Bien joué !' })).toBeVisible();
    const played = page.locator('.clock-results .result-stats > div').filter({ hasText: 'questions jouées' });
    await expect(played.getByText('5 / 5')).toBeVisible();
    await page.getByRole('button', { name: 'Rejouer' }).click();
  }
});

test('les titres, consignes et réponses contrastent avec leur fond', async ({ page }) => {
  await prepareClockPage(page, 12);
  await openClockArcade(page);
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
  for (const selector of ['#clock-heading', '.clock-intro p', '.clock-map-heading strong', '.clock-map-heading small', '.clock-map-level']) {
    expect(await contrast(selector), selector).toBeGreaterThanOrEqual(4.5);
  }
  await page.locator('[data-game="elapsed"]').click();
  await page.locator('[data-level="0"]').click();
  for (const selector of ['#clock-heading', '.clock-center p', '.clock-options button', '#clock-time']) {
    expect(await contrast(selector), selector).toBeGreaterThanOrEqual(4.5);
  }
});

test('les niveaux faits débloquent un compagnon qui reste dans le Lapin chrono', async ({ page }) => {
  await prepareClockPage(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const companion = page.locator('.clock-companion');
  const games = page.getByRole('button', { name: 'Tous les jeux' });
  const levels = page.getByRole('button', { name: 'Retour aux niveaux' });
  const firstLevel = page.locator('[data-level="0"]');
  const finishRound = async () => {
    for (let index = 0; index < 5; index++) await answerFirstClockOption(page);
  };

  await expect(companion).toBeHidden();
  await openClockArcade(page);
  await page.locator('[data-game="read"]').click();
  await firstLevel.click();
  await answerClock(page, false);
  await advanceClockLesson(page);
  await page.clock.fastForward(100_000);
  await expect(page.getByRole('heading', { name: 'Le chrono a sonné !' })).toBeVisible();
  await expect(companion).toBeHidden();
  await expect(page.getByRole('button', { name: 'Niveau suivant' })).toHaveCount(0);
  const timeoutScene = page.locator('.clock-timeout-scene');
  await expect(timeoutScene.locator('.clock-timeout-dial')).toHaveCSS('animation-name', 'clock-timeout-ring');
  await expect(timeoutScene.locator('.clock-timeout-rabbit')).toHaveCSS('animation-name', 'clock-timeout-dance');
  await expect(timeoutScene.locator('[data-portrait="rabbit"]')).toHaveCSS('animation-name', 'clock-portrait-hop');
  await expect(timeoutScene.locator('[data-portrait="rabbit"]')).toHaveCSS('clip-path', /#clock-animal-cut-rabbit/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(timeoutScene.locator('.clock-timeout-rabbit')).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.getByRole('button', { name: 'Rejouer' }).click();
  await expect(timeoutScene).toHaveCount(0);
  for (let index = 0; index < 5; index++) {
    await answerClock(page, false);
    await advanceClockLesson(page);
  }
  await expect(page.getByText('Niveau fait', { exact: false })).toBeVisible();
  await expect(page.locator('.clock-results > [data-portrait="rabbit"]')).toHaveCSS('animation-name', 'clock-portrait-hop');
  await expect(page.locator('.clock-results > [data-portrait="rabbit"]')).toHaveCSS('clip-path', /#clock-animal-cut-rabbit/);
  const finishPass = page.locator('.clock-finish-pass');
  await expect(finishPass).toContainText('Oh là là, je suis en retard !');
  await expect(finishPass.locator('.clock-finish-runner')).toHaveCSS('animation-name', 'clock-rabbit');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(finishPass.locator('.clock-finish-runner')).toHaveCSS('animation-name', 'none');
  await expect(finishPass).toBeVisible();
  await expect(companion).toBeVisible();
  await expect(companion).toContainText('1 / 18 niveaux faits');
  await expect(companion).toHaveAttribute('data-gesture', 'finish');

  await expect(games).toHaveCount(0);
  await levels.click();
  await expect(finishPass).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByRole('heading', { name: 'Lis l’horloge' })).toBeVisible();
  await expect(firstLevel.locator('.clock-done')).toHaveText('✓ Fait');
  await expect(page.locator('[data-level="1"]')).toBeEnabled();
  await expect(page.locator('[data-level="2"]')).toBeDisabled();
  await games.click();
  await expect(page.locator('[data-game="read"]')).toContainText('1 / 3 niveaux faits');
  await page.locator('[data-game="read"]').click();
  await expect(firstLevel.locator('.clock-done')).toHaveText('✓ Fait');
  await expect(page.locator('.clock-levels .clock-done')).toHaveCount(1);
  await firstLevel.click();
  await answerClock(page);
  await expect(companion).toHaveAttribute('data-gesture', 'cheer');
  await expect(companion.locator('.clock-companion-art')).toHaveCSS('animation-name', 'clock-companion-hop');
  await answerClock(page, false);
  await expect(companion).toHaveAttribute('data-gesture', 'encourage');
  await advanceClockLesson(page);
  for (let index = 0; index < 3; index++) await answerClock(page);
  await expect(companion).toContainText('1 / 18 niveaux faits');

  await page.getByRole('button', { name: 'Niveau suivant' }).click();
  const nextLevel = page.getByRole('button', { name: 'Niveau 2, Exploration, À jouer' });
  await expect(nextLevel).toBeFocused();
  await expect(page.getByText('Niveau débloqué !')).toHaveCount(0);
  await expect(nextLevel.locator('.clock-level-lock')).toHaveCount(0);
  await nextLevel.click();
  await expect(page.getByText('Lis l’horloge · Exploration')).toBeVisible();
  await finishRound();
  await expect(companion).toContainText('2 / 18 niveaux faits');
  await levels.click();
  await games.click();
  await expect(companion).toBeVisible();
  await expect(companion).toHaveCSS('position', 'fixed');
  await expect(companion).toHaveCSS('pointer-events', 'none');
  await page.getByRole('button', { name: 'Choix des aventures' }).click();
  await expect(companion).toBeHidden();
  await expect(page.locator('[data-choice="lapin"] .choice-progress')).toHaveText('2 / 18 niveaux faits');
  await page.locator('#leave-adventure-choice').click();
  await page.locator('#open-training').click();
  await expect(companion).toBeHidden();
  await page.reload();
  await expect(companion).toBeHidden();
  await openClockArcade(page);
  await expect(companion).toBeVisible();
  await expect(companion).toContainText('2 / 18 niveaux faits');
  await page.locator('[data-game="read"]').click();
  await expect(firstLevel.locator('.clock-done')).toHaveText('✓ Fait');
  await expect(page.locator('[data-level="1"] .clock-done')).toHaveText('✓ Fait');
  await expect(page.locator('[data-level="2"]')).toBeEnabled();
});

test('une ancienne sauvegarde conserve ses niveaux et reprend au premier niveau manquant', async ({ page }) => {
  await prepareClockPage(page, ['read:1', 'next:2']);
  await openClockArcade(page);
  await page.locator('[data-game="next"]').click();
  await expect(page.locator('[data-level="2"] .clock-done')).toHaveText('✓ Fait');
  await expect(page.locator('[data-level="2"]')).toBeEnabled();
  await expect(page.locator('[data-level="0"]')).toBeDisabled();
  await page.getByRole('button', { name: 'Tous les jeux' }).click();
  await page.locator('[data-game="read"]').click();
  await expect(page.locator('[data-level="0"]')).toBeEnabled();
  await expect(page.locator('[data-level="1"] .clock-done')).toHaveText('✓ Fait');
  const locked = page.locator('[data-level="2"]');
  await expect(locked).toBeDisabled();
  await locked.evaluate((button: HTMLButtonElement) => { button.disabled = false; button.click(); });
  await expect(page.locator('.clock-options')).toHaveCount(0);

  await page.locator('[data-level="0"]').click();
  for (let index = 0; index < 5; index++) await answerFirstClockOption(page);
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('button', { name: 'Niveau suivant' }).click();
  const nextLevel = page.getByRole('button', { name: 'Niveau 3, Défi, À jouer' });
  const rabbit = nextLevel.locator('.clock-map-rabbit');
  const route = await rabbit.evaluate(element =>
    (element.getAnimations()[0].effect as KeyframeEffect).getKeyframes()
      .map(frame => new DOMMatrix(frame.transform as string).m42));
  expect(Math.max(...route)).toBeGreaterThan(Math.max(route[0], route.at(-1)!) + 20);
  await expect(nextLevel).toBeFocused();
  await expect(nextLevel).toHaveAccessibleDescription('Niveau débloqué !');
  await expect(nextLevel.locator('.clock-map-marker')).toHaveCSS('animation-name', 'clock-map-unlock');
  const pieces = nextLevel.locator('.clock-level-lock > g');
  await expect(pieces).toHaveCount(4);
  for (const piece of await pieces.all()) await expect(piece).toHaveCSS('animation-name', 'clock-lock-break');
  await expect(pieces.first()).toHaveCSS('opacity', '0');
  await expect(rabbit).toHaveCSS('transform', 'none');
  await expect(rabbit).toBeVisible();
  await expect(page.locator('.clock-burst > *, .clock-quick-layer > *')).toHaveCount(0);
  await expect(page.locator('.clock-options')).toHaveCount(0);
  await nextLevel.click();
  await expect(page.getByText('Lis l’horloge · Défi')).toBeVisible();
  for (let index = 0; index < 5; index++) await answerFirstClockOption(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Niveau suivant' }).click();
  const nextRegion = page.getByRole('button', { name: 'Niveau 4, Découverte, À jouer' });
  await expect(nextRegion).toBeFocused();
  await expect(nextRegion).toHaveAccessibleDescription('Niveau débloqué !');
  await expect(nextRegion.locator('.clock-map-marker')).toHaveCSS('animation-name', 'none');
  await expect(nextRegion.locator('.clock-level-lock')).toBeHidden();
  const nextRabbit = nextRegion.locator('.clock-map-rabbit');
  await expect(nextRabbit).toBeVisible();
  expect(await nextRabbit.evaluate(element => element.getAnimations().length)).toBe(0);
  await nextRegion.click();
  await expect(page.getByText('Trouve le cadran · Découverte')).toBeVisible();
});

test('la remise à zéro du Lapin chrono demande confirmation et reste après rechargement', async ({ page }) => {
  const progress = clockGameIds.flatMap(game => clockLevels.map((_, level) => `${game}:${level}`));
  await page.addInitScript(({ key, progress, settingsKey, settings }) => {
    if (sessionStorage.getItem('clock-reset-test')) return;
    sessionStorage.setItem('clock-reset-test', 'seeded');
    localStorage.setItem(key, JSON.stringify(progress));
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, { key: CLOCK_PROGRESS_KEY, progress, settingsKey: STORAGE_KEY, settings: { ...defaults(), muted: true } });
  await page.goto('/');
  await openClockArcade(page);
  const reset = page.getByRole('button', { name: 'Réinitialiser les niveaux' });
  page.once('dialog', dialog => dialog.dismiss());
  await reset.click();
  await expect(page.locator('.clock-map-level[data-state="done"]')).toHaveCount(18);
  page.once('dialog', dialog => dialog.accept());
  await reset.click();
  await expect(page.locator('#clock-reset-status')).toContainText('Progression remise à zéro');
  await expect(page.locator('.clock-map-level:enabled')).toHaveAccessibleName('Niveau 1, Découverte, À jouer');
  await expect(page.locator('.clock-map-level:disabled')).toHaveCount(17);
  await expect(page.getByRole('button', { name: 'Revoir l’animation' })).toHaveCount(0);
  await expect(page.locator('.clock-companion')).toBeHidden();
  await page.reload();
  await openClockArcade(page);
  await expect(page.locator('.camp-top .camp-materials')).toHaveText('0 / 18 niveaux faits');
  await expect(reset).toBeDisabled();
});
