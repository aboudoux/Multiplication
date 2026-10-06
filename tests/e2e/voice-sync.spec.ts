import {preset,TRAINING_KEY} from '../../src/training';
import { expect, test, type Page, type Route } from "@playwright/test";
import { createPool, spokenExpression, voicePath } from "../../src/calculations";
import type { Calculation } from "../../src/calculations";

const additions = createPool("add");
const tens = additions.filter(q => q.a === 10 || q.b === 10);

// Drive the real shuffle so every addition involving ten occurs in this game.
function drawsForQuestions(first: Calculation[]): number[] {
  const ordered = [...additions.filter(q => !first.some(f => f.id === q.id)), ...first.slice().reverse()];
  const pool = [...additions];
  const draws: number[] = [];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = pool.findIndex(q => q.id === ordered[i].id);
    draws.push((j + .5) / (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [...draws, ...Array(49).fill(.999999)];
}

async function prepare(page: Page, theme = "classic") {
  await page.addInitScript(() => {
    const probe = { draws: [] as number[], decoded: [] as string[], starts: [] as { path: string; label: string | null; lag: number; onset: number; visible: boolean }[] };
    Object.assign(window, { voiceSyncProbe: probe });
    const random = Math.random;
    Math.random = () => probe.draws.length ? probe.draws.shift()! : random();
    const encoded = new WeakMap<ArrayBuffer, string>(), decoded = new WeakMap<AudioBuffer, string>();
    const fetchOriginal = window.fetch;
    window.fetch = async (...args) => {
      const response = await fetchOriginal(...args);
      const arrayBuffer = response.arrayBuffer.bind(response);
      response.arrayBuffer = async () => {
        const bytes = await arrayBuffer();
        encoded.set(bytes, new URL(response.url).pathname);
        return bytes;
      };
      return response;
    };
    const decode = AudioContext.prototype.decodeAudioData;
    AudioContext.prototype.decodeAudioData = function (bytes) {
      const path = encoded.get(bytes);
      return decode.call(this, bytes).then(buffer => {
        if (path) { decoded.set(buffer, path); probe.decoded.push(path); }
        return buffer;
      });
    };
    let writtenAt = 0;
    const setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
      if (this.id === "equation" && name === "aria-label") writtenAt = performance.now();
      return setAttribute.call(this, name, value);
    };
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      const path = this.buffer && decoded.get(this.buffer);
      if (this.buffer && path?.includes("/voice/fr/")) {
        const samples = this.buffer.getChannelData(0);
        const first = samples.findIndex(sample => Math.abs(sample) >= 160 / 32768);
        probe.starts.push({ path, label: document.getElementById("equation")!.getAttribute("aria-label"), lag: performance.now() - writtenAt, onset: first / this.buffer.sampleRate / this.playbackRate.value * 1000, visible: document.getElementById("overlay")!.hidden && !document.getElementById("play")!.hidden });
      }
      return start.apply(this, args);
    };
  });
  await page.addInitScript(({key,settings})=>localStorage.setItem(key,JSON.stringify({settings,materials:0,records:{}})),{key:TRAINING_KEY,settings:{...preset(),add:{min:1,max:20,carry:'all'},length:50,duration:10,lives:3,voice:theme}});
  await page.clock.install({ time: new Date("2026-09-29T12:00:00Z") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-09-29T12:00:10Z"));
  await page.locator("#open-training").click();await page.locator('nav [data-tab="workshop"]').click();
  const draws = drawsForQuestions(tens);
  await page.evaluate(draws => { (window as any).voiceSyncProbe.draws = draws; }, draws);
}

async function waitForQuestion(page: Page) {
  await expect.poll(async () => {
    await page.clock.runFor(16);
    return page.locator("#overlay").isHidden();
  }).toBe(true);
}

for (const theme of ["classic", "ant"]) {
  test(`${theme}: all 19 additions containing 10 start their exact narration with the visible equation`, async ({ page }) => {
    // Each new file takes a noticeable round trip, with an empty browser cache.
    await page.route("**/voice/fr/add/*.wav", async route => {
      await new Promise(resolve => setTimeout(resolve, 250));
      await route.continue();
    });
    await prepare(page, theme);
    await page.locator("#camp-start").click();
    await page.clock.runFor(4050);
    for (const [index, q] of tens.entries()) {
      await waitForQuestion(page);
      await expect(page.locator("#equation")).toHaveAttribute("aria-label", spokenExpression(q));
      const starts = await page.evaluate(() => (window as any).voiceSyncProbe.starts);
      expect(starts).toHaveLength(index + 1);
      expect(starts[index].path).toBe(voicePath(q));
      expect(starts[index].label).toBe(spokenExpression(q));
      expect(starts[index].visible).toBe(true);
      expect(starts[index].lag).toBeGreaterThanOrEqual(0);
      expect(starts[index].lag).toBeLessThan(50);
      expect(starts[index].onset).toBeLessThan(200);
      await page.keyboard.type(String(q.result));
      await page.clock.runFor(670);
    }
    await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "19");
  });
}

test("a delayed voice holds the equation and timer, then pause prevents any late narration", async ({ page }, info) => {
  let delayed: Route | undefined;
  await page.route(`**${voicePath(tens[0])}`, route => { delayed = route; });
  await page.setViewportSize({ width:768, height:1024 });
  await prepare(page);
  await page.locator("#camp-start").click();
  await expect.poll(() => Boolean(delayed)).toBe(true);
  await page.clock.runFor(4250);
  await expect(page.locator("#preparing-panel")).toBeVisible();
  await expect(page.locator("#equation")).toHaveText("");
  await expect(page.locator("#time-left")).toHaveText("10 s");
  await expect(page.locator("#elapsed")).toHaveText("0:00");
  await page.keyboard.type(String(tens[0].result));
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "0");
  await page.screenshot({ path:info.outputPath("voice-preparation-tablet.png"), fullPage:true });
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-panel")).toBeVisible();
  await delayed!.continue();
  await expect.poll(() => page.evaluate(path => (window as any).voiceSyncProbe.decoded.includes(path), voicePath(tens[0]))).toBe(true);
  await page.clock.runFor(2000);
  expect(await page.evaluate(() => (window as any).voiceSyncProbe.starts)).toEqual([]);
  await page.getByRole("button", { name:/On continue/ }).click();
  await page.clock.runFor(4020);
  await waitForQuestion(page);
  await expect(page.locator("#equation")).toHaveAttribute("aria-label", spokenExpression(tens[0]));
  await expect(page.locator("#time-left")).toHaveText("10 s");
  const starts = await page.evaluate(() => (window as any).voiceSyncProbe.starts);
  expect(starts).toHaveLength(1);
  expect(starts[0].visible).toBe(true);
  expect(starts[0].lag).toBeLessThan(50);
});

test("a stalled download falls back without restarting itself and can be retried explicitly", async ({ page }) => {
  let delayed: Route | undefined;
  let requests = 0;
  await page.route(`**${voicePath(tens[0])}`, route => {
    requests++;
    if (requests === 1) delayed = route;
    else return route.continue();
  });
  await prepare(page);
  await page.locator("#camp-start").click();
  await expect.poll(() => Boolean(delayed)).toBe(true);
  await page.clock.runFor(5200);
  await waitForQuestion(page);
  await expect(page.locator("#voice-unavailable")).toBeVisible();
  await expect(page.locator("#time-left")).toHaveText("10 s");
  expect(requests).toBe(1);
  expect(await page.evaluate(() => (window as any).voiceSyncProbe.starts)).toEqual([]);
  await page.getByRole("button", { name:"Réécouter le calcul" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).voiceSyncProbe.starts.length)).toBe(1);
  expect(requests).toBe(2);
});

test("continuing without the voice unblocks play and a late prepared clip stays silent", async ({ page }) => {
  let delayed: Route | undefined;
  await page.route(`**${voicePath(tens[0])}`, route => { delayed = route; });
  await prepare(page);
  await page.locator("#camp-start").click();
  await expect.poll(() => Boolean(delayed)).toBe(true);
  await page.clock.runFor(4050);
  await page.getByRole("button", { name:"Continuer sans la voix" }).click();
  await waitForQuestion(page);
  await expect(page.getByRole("button", { name:"Activer la voix" })).toBeVisible();
  await delayed!.continue();
  await expect.poll(() => page.evaluate(path => (window as any).voiceSyncProbe.decoded.includes(path), voicePath(tens[0]))).toBe(true);
  await page.clock.runFor(500);
  expect(await page.evaluate(() => (window as any).voiceSyncProbe.starts)).toEqual([]);
  await page.keyboard.type(String(tens[0].result));
  await expect(page.locator("#progress")).toHaveAttribute("aria-valuenow", "1");
});
