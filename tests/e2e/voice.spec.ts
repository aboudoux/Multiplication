import {prepareCamp,enterCamp,ready} from './helpers';
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function prepare(page: Page) {
  await page.addInitScript(() => {
    const probe = { clips: [] as number[], stops: 0, tones: [] as string[] };
    Object.assign(window, { speechProbe: probe });
    const start = AudioBufferSourceNode.prototype.start;
    const stop = AudioBufferSourceNode.prototype.stop;
    const tone = OscillatorNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer && this.buffer.duration > 0.4)
        probe.clips.push(this.buffer.duration);
      return start.apply(this, args);
    };
    AudioBufferSourceNode.prototype.stop = function (...args) {
      if (this.buffer && this.buffer.duration > 0.4) probe.stops++;
      return stop.apply(this, args);
    };
    OscillatorNode.prototype.start = function (...args) {
      probe.tones.push(this.type);
      return tone.apply(this, args);
    };
  });
  await prepareCamp(page,{operations:['multiply'],tables:[1,2,3,4,5,6,7,8,9,10],length:'all',duration:10,lives:3},true);
}
async function begin(page: Page) {
  await page.locator("#camp-start").click();
  await page.clock.runFor(4050);
  await ready(page);
}
async function clipCount(page: Page) {
  return page.evaluate(() => (window as any).speechProbe.clips.length);
}

test("reads the exact question, can repeat it, cancels on pause and reads again on resume", async ({
  page,
}, testInfo) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/voice/fr/")) requests.push(request.url());
  });
  await prepare(page);
  await expect(
    page.getByRole("button", { name: "Couper la voix" }),
  ).toBeVisible();
  expect(await clipCount(page)).toBe(0);
  await begin(page);
  await expect.poll(() => clipCount(page)).toBe(1);
  const expression = await page.locator("#equation").getAttribute("aria-label");
  const [a, b] = expression!.match(/\d+/g)!.map(Number);
  expect(requests.some((url) => url.endsWith(`/${a}-${b}.wav`))).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("arcade-voice.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Réécouter le calcul" }).click();
  await expect.poll(() => clipCount(page)).toBe(2);
  await page
    .getByRole("button", { name: "Mettre en pause", exact: true })
    .click();
  expect(
    await page.evaluate(() => (window as any).speechProbe.stops),
  ).toBeGreaterThan(0);
  await page.clock.runFor(6000);
  expect(await clipCount(page)).toBe(2);
  await page.getByRole("button", { name: /On continue/ }).click();
  await page.clock.runFor(4050);
  await expect.poll(() => clipCount(page)).toBe(3);
  await expect(page.locator("#equation")).toHaveAttribute(
    "aria-label",
    expression!,
  );
  for (const digit of String(a * b)) await page.keyboard.press(digit);
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "1");
  await expect(
    page.getByRole("button", { name: "Réécouter le calcul" }),
  ).toBeDisabled();
});

test("the voice preference persists and global mute also silences narration", async ({
  page,
}) => {
  await prepare(page);
  await page.getByRole("button", { name: "Couper la voix" }).click();
  await page.reload();await enterCamp(page);
  await expect(
    page.getByRole("button", { name: "Activer la voix" }),
  ).toBeVisible();
  await begin(page);
  expect(await clipCount(page)).toBe(0);
  await page.getByRole("button", { name: "Activer la voix" }).click();
  await expect.poll(() => clipCount(page)).toBe(1);
  await page.getByRole("button", { name: "Couper le son" }).click();
  await page.clock.runFor(200);
  await expect(
    page.getByRole("button", { name: "Réécouter le calcul" }),
  ).toBeDisabled();
  const count = await clipCount(page);
  await page.clock.runFor(500);
  expect(await clipCount(page)).toBe(count);
  await page.getByRole("button", { name: "Activer le son" }).click();
  await expect.poll(() => clipCount(page)).toBe(count + 1);
});

test("a failed voice download leaves the game playable with a clear retry message", async ({
  page,
}) => {
  await page.route("**/voice/fr/*.wav", (route) => route.abort());
  await prepare(page);
  await begin(page);
  await expect(page.locator("#voice-unavailable")).toBeVisible();
  const expression = await page.locator("#equation").getAttribute("aria-label");
  const [a, b] = expression!.match(/\d+/g)!.map(Number);
  for (const digit of String(a * b)) await page.keyboard.press(digit);
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "1");
});

test("a wrong answer triggers a real arcade buzzer and a visible reaction", async ({
  page,
}, testInfo) => {
  await prepare(page);
  await begin(page);
  const expression = await page.locator("#equation").getAttribute("aria-label");
  const [a, b] = expression!.match(/\d+/g)!.map(Number);
  for (const digit of "0".repeat(String(a * b).length))
    await page.keyboard.press(digit);
  await expect(page.locator("#hearts")).toHaveAttribute(
    "aria-label",
    "2 vies restantes",
  );
  await expect(page.locator("#board")).toHaveClass(/reaction-error/);
  await expect(page.locator("#correction-card")).toBeVisible();
  await expect(page.locator("#correction-card")).toHaveAttribute(
    "aria-label",
    `Désolé, mais c’était ${a * b} !`,
  );
  expect(await page.evaluate(() => (window as any).speechProbe.tones)).toEqual(
    expect.arrayContaining(["sawtooth", "square"]),
  );
  await page.screenshot({
    path: testInfo.outputPath("buzzer.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const card = await page.locator("#correction-card").boundingBox();
  const area = await page.locator("#question-area").boundingBox();
  expect(card!.x).toBeGreaterThanOrEqual(area!.x - 1);
  expect(card!.x + card!.width).toBeLessThanOrEqual(area!.x + area!.width + 1);
  await page.screenshot({
    path: testInfo.outputPath("buzzer-mobile.png"),
    fullPage: true,
  });
  await page.clock.runFor(1900);
  await expect(page.locator("#correction-card")).toBeVisible();
  await page.clock.runFor(150);
  await expect(page.locator("#correction-card")).toBeHidden();
});
