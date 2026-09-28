import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function load(page: Page) {
  await page.clock.install({ time: new Date("2026-09-27T12:00:00Z") });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.clock.pauseAt(new Date("2026-09-27T12:00:10Z"));
  await page.locator('[data-mode="multiply"]').click();
  await page.locator("#length-select").selectOption("all");
}
async function start(page: Page) {
  await page.getByRole("button", { name: /C’est parti/ }).click();
  await expect(page.locator("#countdown")).toHaveText("3");
  await page.clock.runFor(4050);
  await expect(page.locator("#overlay")).toBeHidden();
  await expect(page.locator("#equation")).toBeVisible();
}
async function result(page: Page): Promise<string> {
  const expression = await page.locator("#equation").getAttribute("aria-label");
  const [a, b] = expression!.match(/\d+/g)!.map(Number);
  return String(a * b);
}
async function correct(page: Page, touch = false) {
  const answer = await result(page);
  for (const digit of answer) {
    if (touch)
      await page.getByRole("button", { name: digit, exact: true }).tap();
    else await page.keyboard.press(digit);
  }
}
async function assertLayout(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const board = await page.locator("#board").boundingBox();
  for (const selector of ["#equation", "#answer", ".keypad", "#progress"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(board!.x);
    expect(box!.x + box!.width).toBeLessThanOrEqual(
      board!.x + board!.width + 1,
    );
  }
  const keypad = await page.locator(".keypad").boundingBox();
  const equation = await page.locator("#equation").boundingBox();
  expect(
    equation!.x + equation!.width <= keypad!.x ||
      equation!.y + equation!.height <= keypad!.y,
  ).toBe(true);
  const area = await page.locator("#question-area").boundingBox();
  const content = await page.locator("#question-content").boundingBox();
  expect(content!.x).toBeGreaterThanOrEqual(area!.x);
  expect(content!.x + content!.width).toBeLessThanOrEqual(
    area!.x + area!.width + 1,
  );
  expect(content!.y).toBeGreaterThanOrEqual(area!.y);
  expect(content!.y + content!.height).toBeLessThanOrEqual(
    area!.y + area!.height + 1,
  );
}

test("desktop: preferences, countdown, keyboard, mouse and pause", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await load(page);
  await expect(page.locator('[data-duration="10"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.screenshot({
    path: testInfo.outputPath("home-desktop.png"),
    fullPage: true,
  });
  await page.locator('[data-duration="15"]').click();
  await page.getByRole("button", { name: "Couper le son" }).click();
  await page.reload();
  await expect(page.locator('[data-duration="15"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("button", { name: "Activer le son" }),
  ).toBeVisible();
  await start(page);
  await assertLayout(page);
  await page.screenshot({
    path: testInfo.outputPath("game-desktop.png"),
    fullPage: true,
  });
  const expression = await page.locator("#equation").getAttribute("aria-label");
  await page.clock.runFor(1200);
  const before = await page.locator("#time-left").innerText();
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-panel")).toBeVisible();
  await page.clock.runFor(30000);
  await page.getByRole("button", { name: /On continue/ }).click();
  await page.clock.runFor(4050);
  await expect(page.locator("#equation")).toHaveAttribute(
    "aria-label",
    expression!,
  );
  await expect(page.locator("#time-left")).toHaveText(before);
  await correct(page);
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "1");
  await page.clock.runFor(700);
  const answer = await result(page);
  for (const digit of answer)
    await page.getByRole("button", { name: digit, exact: true }).click();
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "2");
  expect(errors).toEqual([]);
});

test("secret victory shortcut plays from home without saving a record", async ({ page }) => {
  await load(page);
  const before = await page.evaluate(() => localStorage.getItem("multipli-party:v1"));
  await expect(page.getByRole("button", { name: "Voir la danse de victoire" })).toHaveCount(0);
  await page.keyboard.press("Control+Alt+v");
  await expect(page.locator("#victory")).toBeVisible();
  await expect(page.locator("#results")).toBeHidden();
  await page.clock.runFor(5900);
  await expect(page.locator("#victory")).toBeVisible();
  await page.clock.runFor(200);
  await expect(page.locator("#home")).toBeVisible();
  await expect(page.locator("#victory")).toBeHidden();
  await expect(page.locator("#home-record")).toHaveText("Ton premier record t’attend !");
  expect(await page.evaluate(() => localStorage.getItem("multipli-party:v1"))).toBe(before);
  await start(page);
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "0");
  await page.keyboard.press("Control+Alt+v");
  await expect(page.locator("#victory")).toBeHidden();
  await expect(page.locator("#equation")).toBeVisible();
});

test("timeouts cost three lives, show the last correction, and replay resets the game", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const probe = { duration: 0 };
    Object.assign(window, { defeatAudioProbe: probe });
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer && this.buffer.duration > 4)
        probe.duration = this.buffer.duration;
      return start.apply(this, args);
    };
  });
  await load(page);
  await page.locator('[data-duration="5"]').click();
  await start(page);
  await page.clock.runFor(5000);
  await expect(page.locator("#hearts")).toHaveAttribute(
    "aria-label",
    "2 vies restantes",
  );
  await expect(page.locator("#feedback")).toContainText("Temps écoulé");
  await expect(page.locator("#correction-card")).toBeVisible();
  await expect(page.locator("#correction-card")).toHaveAttribute(
    "aria-label",
    `Désolé, mais c’était ${await result(page)} !`,
  );
  await page.clock.runFor(7000);
  await expect(page.locator("#hearts")).toHaveAttribute(
    "aria-label",
    "1 vie restante",
  );
  const crowdResponse = page.waitForResponse("**/sounds/crowd-disappointed.wav");
  await page.clock.runFor(7000);
  await expect(page.locator("#play")).toBeVisible();
  await expect(page.locator("#defeat")).toBeHidden();
  await expect(page.locator("#correction-card")).toHaveAttribute(
    "aria-label",
    `Désolé, mais c’était ${await result(page)} !`,
  );
  await page.clock.runFor(1900);
  await expect(page.locator("#correction-card")).toBeVisible();
  await page.clock.runFor(150);
  await expect(page.locator("#defeat")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ooooh…" })).toBeVisible();
  await expect(page.locator("#results")).toBeHidden();
  expect((await crowdResponse).ok()).toBe(true);
  await expect.poll(() => page.evaluate(
    () => (window as any).defeatAudioProbe.duration,
  )).toBeGreaterThan(4.9);
  expect(await page.locator(".sad-star").evaluate(
    (star) => getComputedStyle(star).animationDuration,
  )).toBe("6s");
  await page.screenshot({
    path: testInfo.outputPath("defeat-interlude.png"),
    animations: "disabled",
    fullPage: true,
  });
  await page.keyboard.press("1");
  await page.clock.runFor(5100);
  await expect(page.locator("#results")).toBeHidden();
  await page.clock.runFor(1000);
  await expect(page.locator("#results")).toBeVisible();
  await expect(page.locator("#defeat")).toBeHidden();
  await expect(page.locator("#result-mistakes")).toHaveText("3");
  await expect(page.locator("#last-correction")).toContainText(
    "Le temps était écoulé.",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("multipli-party:v1")!).records,
    ),
  ).toEqual({});
  await page.getByRole("button", { name: /On rejoue/ }).click();
  await page.clock.runFor(4050);
  await expect(page.locator("#hearts")).toHaveAttribute(
    "aria-label",
    "3 vies restantes",
  );
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "0");
});

test("complete game: 100 distinct pairs, three digits, victory and durable record", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    const probe = { tones: 0 };
    Object.assign(window, { partyAudioProbe: probe });
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      probe.tones++;
      return start.apply(this, args);
    };
  });
  await load(page);
  await start(page);
  const seen = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const expression = (await page
      .locator("#equation")
      .getAttribute("aria-label"))!;
    expect(seen.has(expression)).toBe(false);
    seen.add(expression);
    await page.clock.runFor(100);
    const tonesBefore = i === 99 ? await page.evaluate(() => (window as any).partyAudioProbe.tones) : 0;
    await correct(page);
    if (i === 99) {
      await expect(page.locator("#victory")).toBeVisible();
      await expect(page.locator("#results")).toBeHidden();
      await expect(page.getByRole("heading", { name: "Tu l’as fait !" })).toBeVisible();
      expect(await page.evaluate(
        (before) => (window as any).partyAudioProbe.tones - before,
        tonesBefore,
      )).toBeGreaterThan(40);
      expect(await page.locator(".dancing-star").evaluate(
        (star) => getComputedStyle(star).animationName,
      )).toBe("victory-dance");
      await page.screenshot({ path: testInfo.outputPath("victory-dance.png"), fullPage: true });
      await page.keyboard.press("1");
      await page.clock.runFor(5100);
      await expect(page.locator("#victory")).toBeVisible();
      await expect(page.locator("#results")).toBeHidden();
      await page.clock.runFor(1000);
      await expect(page.locator("#victory")).toBeHidden();
    }
    if (i < 99) {
      await expect(page.locator("#progress")).toHaveAttribute(
        "aria-valuenow",
        String(i + 1),
      );
      await page.clock.runFor(700);
    }
  }
  expect(seen.size).toBe(100);
  expect(seen.has("10 fois 10")).toBe(true);
  await expect(page.locator("#result-title")).toHaveText("100 fois bravo !");
  await expect(page.locator("#result-solved")).toHaveText("100");
  await expect(page.locator("#result-mistakes")).toHaveText("0");
  await expect(page.locator("#result-record")).toContainText("Nouveau record");
  await page.screenshot({
    path: testInfo.outputPath("victory-desktop.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("#home-record")).toContainText("La ronde des tables");
  await page.locator('[data-duration="5"]').click();
  await expect(page.locator("#home-record")).toHaveText(
    "Ton premier record t’attend !",
  );
});

test("custom tables, 30-second answers and lives persist with their own record", async ({ page }) => {
  await load(page);
  await page.locator("#tables-select").selectOption("2");
  await page.locator('[data-duration="30"]').click();
  await page.locator("#lives-select").selectOption("4");
  await expect(page.locator("#home-challenges")).toHaveText("20 défis");
  await page.reload();
  await expect(page.locator("#tables-select")).toHaveValue("2");
  await expect(page.locator("#lives-select")).toHaveValue("4");
  await expect(page.locator('[data-duration="30"]')).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Control+Alt+v");
  await expect(page.locator("#victory-goal")).toHaveText("20 SUR 20 · MISSION ACCOMPLIE");
  await page.clock.runFor(6100);
  await expect(page.locator("#home")).toBeVisible();
  await start(page);
  await expect(page.locator("#hearts")).toHaveAttribute("aria-label", "4 vies restantes");
  await expect(page.locator("[data-heart]")).toHaveCount(4);
  await expect(page.locator("#time-left")).toHaveText("30 s");
  await expect(page.locator("#progress-goal")).toHaveText("20");
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuemax", "20");
  const seen = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const expression = (await page.locator("#equation").getAttribute("aria-label"))!;
    expect(Number(expression.match(/\d+/)![0])).toBeLessThanOrEqual(2);
    seen.add(expression);
    await correct(page);
    if (i < 19) {
      await expect(page.locator("#progress-caption")).toHaveText(`${i + 1} / 20`);
      if (i === 0) await expect(page.locator("#progress-percent")).toHaveText("5 %");
      await page.clock.runFor(700);
    }
  }
  expect(seen.size).toBe(20);
  await expect(page.locator("#victory-goal")).toHaveText("20 SUR 20 · MISSION ACCOMPLIE");
  await page.clock.runFor(6100);
  await expect(page.locator("#result-title")).toHaveText("20 fois bravo !");
  await expect(page.locator("#result-total")).toHaveText("sur 20 réussies");
  expect(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("multipli-party:v1")!).records))).toEqual(["multiply-2-20-30-4"]);
  await page.getByRole("button", { name: "Changer les réglages" }).click();
  await expect(page.locator("#home-record")).toContainText("2 tables");
  await page.locator("#lives-select").selectOption("3");
  await expect(page.locator("#home-record")).toHaveText("Ton premier record t’attend !");
  await page.locator("#lives-select").selectOption("4");
  await page.locator("#tables-select").selectOption("3");
  await expect(page.locator("#home-record")).toHaveText("Ton premier record t’attend !");
  await page.locator("#tables-select").selectOption("2");
  await page.locator('[data-duration="15"]').click();
  await expect(page.locator("#home-record")).toHaveText("Ton premier record t’attend !");
  await page.locator('[data-duration="30"]').click();
  await expect(page.locator("#home-record")).toContainText("2 tables");
});

test("visibility interruption freezes the question until an explicit resume", async ({
  page,
}) => {
  await load(page);
  await start(page);
  await page.clock.runFor(1200);
  const expression = await page.locator("#equation").getAttribute("aria-label");
  const remaining = await page.locator("#time-left").innerText();
  // Browser lifecycle signal, controlled explicitly so this is reproducible headlessly.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.clock.runFor(30000);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /On continue/ }).click();
  await page.clock.runFor(4050);
  await expect(page.locator("#time-left")).toHaveText(remaining);
  await expect(page.locator("#equation")).toHaveAttribute(
    "aria-label",
    expression!,
  );
  await expect(page.locator("#hearts")).toHaveAttribute(
    "aria-label",
    "3 vies restantes",
  );
});

test("Web Audio starts after a gesture, synthesizes notes, and the mute control cuts gain", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const probe = {
      contexts: [] as AudioContext[],
      gains: [] as GainNode[],
      targets: [] as number[],
      notes: 0,
    };
    Object.assign(window, { audioProbe: probe });
    const createGain = AudioContext.prototype.createGain;
    const createOscillator = AudioContext.prototype.createOscillator;
    const setTarget = AudioParam.prototype.setTargetAtTime;
    AudioParam.prototype.setTargetAtTime = function (target, time, constant) {
      if (this === probe.gains[0]?.gain) probe.targets.push(target);
      return setTarget.call(this, target, time, constant);
    };
    AudioContext.prototype.createGain = function () {
      if (!probe.contexts.includes(this)) probe.contexts.push(this);
      const gain = createGain.call(this);
      probe.gains.push(gain);
      return gain;
    };
    AudioContext.prototype.createOscillator = function () {
      probe.notes++;
      return createOscillator.call(this);
    };
  });
  await load(page);
  expect(await page.evaluate(() => (window as any).audioProbe.notes)).toBe(0);
  await start(page);
  expect(
    await page.evaluate(() => (window as any).audioProbe.notes),
  ).toBeGreaterThan(3);
  expect(
    await page.evaluate(() => (window as any).audioProbe.contexts[0].state),
  ).toBe("running");
  await page.getByRole("button", { name: "Couper le son" }).click();
  expect(
    await page.evaluate(() => (window as any).audioProbe.targets.at(-1)),
  ).toBe(0);
  const mutedNotes = await page.evaluate(
    () => (window as any).audioProbe.notes,
  );
  await page.clock.runFor(1000);
  expect(await page.evaluate(() => (window as any).audioProbe.notes)).toBe(
    mutedNotes,
  );
  await page.getByRole("button", { name: "Activer le son" }).click();
  expect(
    await page.evaluate(() => (window as any).audioProbe.targets.at(-1)),
  ).toBe(0.42);
  await page.keyboard.press("0");
  expect(
    await page.evaluate(() => (window as any).audioProbe.notes),
  ).toBeGreaterThan(mutedNotes);
});

test("calculations move within their reserved area, including after rotation", async ({
  page,
}) => {
  await load(page);
  await start(page);
  const positions = new Set<string>();
  for (let i = 0; i < 8; i++) {
    await assertLayout(page);
    positions.add(
      (await page.locator("#question-content").getAttribute("style"))!,
    );
    await correct(page);
    await page.clock.runFor(700);
  }
  expect(positions.size).toBeGreaterThan(1);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.clock.runFor(50);
  await assertLayout(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.clock.runFor(50);
  await assertLayout(page);
});

for (const viewport of [
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`touch layout ${viewport.width}x${viewport.height}`, async ({
    browser,
  }, testInfo) => {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:4173",
      viewport,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await load(page);
    await page.locator("#tables-select").selectOption("3");
    await page.locator("#lives-select").selectOption("10");
    await page.locator('[data-duration="30"]').click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("home.png"),
      fullPage: true,
    });
    await start(page);
    await expect(page.locator("[data-heart]")).toHaveCount(10);
    await expect(page.locator("#progress")).toHaveAttribute("aria-valuemax", "30");
    await assertLayout(page);
    const before = await page.locator(".keypad").boundingBox();
    await correct(page, true);
    await expect(page.locator("#progress")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    await page.clock.runFor(700);
    expect(await page.locator(".keypad").boundingBox()).toEqual(before);
    await assertLayout(page);
    await page.screenshot({
      path: testInfo.outputPath("game.png"),
      fullPage: true,
    });
    expect(
      await page
        .locator("#question-area")
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe("none");
    await context.close();
  });
}
