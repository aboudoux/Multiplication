import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function load(page: Page) {
  await page.clock.install({ time: new Date("2026-09-28T12:00:00Z") });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.clock.pauseAt(new Date("2026-09-28T12:00:10Z"));
}
async function question(page: Page) {
  const label = (await page.locator("#equation").getAttribute("aria-label"))!;
  const [a, b] = label.match(/\d+/g)!.map(Number);
  const operation = label.includes("plus") ? "add" : label.includes("moins") ? "subtract" : "multiply";
  return { label, a, b, operation, answer: String(operation === "add" ? a + b : operation === "subtract" ? a - b : a * b) };
}

test("new-player defaults, length limits, mode-specific controls and persistence", async ({ page }, info) => {
  await load(page);
  await expect(page).toHaveTitle(/Calcul’Party/);
  await expect(page.locator('[data-mode="add"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#tables-field")).toBeHidden();
  await expect(page.locator("#length-select")).toHaveValue("20");
  await page.locator('[data-mode="multiply"]').click();
  await page.locator("#length-select").selectOption("100");
  await page.locator("#tables-select").selectOption("1");
  await expect(page.locator("#length-select")).toHaveValue("all");
  await expect(page.locator('#length-select option[value="20"]')).toHaveAttribute("disabled", "");
  await expect(page.locator("#home-challenges")).toHaveText("10 défis");
  await page.locator('[data-mode="mix"]').click();
  await expect(page.locator("#length-select")).toHaveValue("20");
  await page.locator("#length-select").selectOption("50");
  await page.reload();
  await expect(page.locator('[data-mode="mix"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#length-select")).toHaveValue("50");
  await page.screenshot({ path: info.outputPath("modes-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("modes-mobile.png"), fullPage: true });
});

for (const mode of ["add", "subtract", "duo", "multiply", "mix"]) {
  test(`${mode}: narration, correction, twenty distinct successes and record`, async ({ page }, info) => {
    const requests: string[] = [];
    page.on("request", request => { if (request.url().includes("/voice/fr/")) requests.push(request.url()); });
    await load(page);
    await page.locator(`[data-mode="${mode}"]`).click();
    await page.getByRole("button", { name: /C’est parti/ }).click();
    await page.clock.runFor(4050);
    const first = await question(page);
    const voiceSuffix = `${first.operation === "multiply" ? "" : first.operation + "/"}${first.a}-${first.b}.wav`;
    await expect.poll(() => requests.some(url => url.endsWith(voiceSuffix))).toBe(true);
    for (const d of (first.answer === "0" ? "1" : "0".repeat(first.answer.length))) await page.keyboard.press(d);
    await expect(page.locator("#correct-result")).toHaveText(`${first.answer} !`);
    await page.clock.runFor(1900);
    await expect(page.locator("#correction-card")).toBeVisible();
    await page.clock.runFor(150);
    const seen = new Set<string>();
    const counts: Record<string, number> = {};
    for (let i = 0; i < 20; i++) {
      const q = await question(page);
      expect(seen.has(q.label)).toBe(false);
      seen.add(q.label);
      counts[q.operation] = (counts[q.operation] ?? 0) + 1;
      if (i === 19) expect(q.label).toBe(first.label);
      for (const d of q.answer) await page.keyboard.press(d);
      if (i < 19) await page.clock.runFor(700);
    }
    await expect(page.locator("#victory")).toBeVisible();
    await page.clock.runFor(6100);
    await expect(page.locator("#result-solved")).toHaveText("20");
    await expect(page.locator("#result-mistakes")).toHaveText("1");
    const keys = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("multipli-party:v1")!).records));
    expect(keys).toEqual([`${mode}-${["mix", "multiply"].includes(mode) ? 10 : 0}-20-10-3`]);
    if (mode === "duo") expect(counts).toEqual({ add: 10, subtract: 10 });
    if (mode === "mix") expect(Math.max(...Object.values(counts)) - Math.min(...Object.values(counts))).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath(`${mode}-results.png`), fullPage: true });
  });
}

test("existing multiplication settings and records survive the upgrade", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("multipli-party:v1", JSON.stringify({
    duration: 15, tables: 7, lives: 4, voiceEnabled: false,
    records: { "7-15-4": { timeMs: 100000, mistakes: 1, date: "2026-09-28" } },
  })));
  await load(page);
  await expect(page.locator('[data-mode="multiply"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#length-select")).toHaveValue("all");
  await expect(page.locator("#home-record")).toContainText("1:40");
  await expect(page.locator("#home-challenges")).toHaveText("70 défis");
  await page.locator('[data-mode="add"]').click();
  await expect(page.locator("#home-record")).toHaveText("Ton premier record t’attend !");
});
