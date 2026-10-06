import { describe, expect, it, vi, afterEach } from "vitest";
import { themeIds, themes } from "../../src/themes";
import { voiceProfiles } from "../../src/voice-profiles";
import { defaults, readSaved, recordKey } from "../../src/storage";
import { ThemeSurprises } from "../../src/surprises";

afterEach(() => vi.unstubAllGlobals());
describe("independent worlds", () => {
 it("defines unique soundtracks and valid cast and voice choices", () => {
  expect(themeIds).toHaveLength(17);
  expect(new Set(themeIds.map(id => themes[id].melody.join(','))).size).toBe(themeIds.length);
  for(const id of themeIds) {
   const theme = themes[id];
   expect(theme.home).toBeTruthy(); expect(theme.dance).toBeTruthy(); expect(theme.sad).toBeTruthy();
   for (const voice of theme.voices) expect(voiceProfiles[voice]).toBeDefined();
   expect(theme.danceNotes).toHaveLength(12);
   expect(60 / theme.music.bpm * theme.danceNotes.length).toBeLessThan(6);
  }
 });
 it("migrates Halloween narration and preserves independent voice preferences and records", () => {
  const base=defaults();
  const score={timeMs:12345,mistakes:0,date:"2026-09-28T12:00:00Z"};
  const legacy=readSaved({getItem:()=>JSON.stringify({...base,themeVoices:undefined,theme:"halloween",halloweenVoice:"monster",records:{[recordKey(base)]:score}})});
  expect(legacy.themeVoices.halloween).toBe("monster");
  for(const id of themeIds) {
   const saved=readSaved({getItem:()=>JSON.stringify({...legacy,theme:id,themeVoices:{...legacy.themeVoices,[id]:"classic"}})});
   expect(saved.theme).toBe(id);
   expect(saved.themeVoices[id]).toBe("classic");
   expect(saved.records[recordKey(base)]).toEqual(score);
  }
  const invalid=readSaved({getItem:()=>JSON.stringify({theme:"unknown",themeVoices:{alien:"witch"}})});
  expect(invalid.theme).toBe("star"); expect(invalid.themeVoices.alien).toBe("alien");
 });
 it("cycles sparse theme rewards, cleans them up, and honors reduced motion", () => {
  const media={matches:false};vi.stubGlobal("matchMedia",()=>media);
  const layer={innerHTML:"",dataset:{} as Record<string,string>,replaceChildren(){this.innerHTML="";}};
  const rewards=new ThemeSurprises(layer as unknown as HTMLElement,()=>0);
  for(const id of themeIds.filter(id=>id!=="star")) {
   rewards.setTheme(id);
   for(const effect of themes[id].surprises) {
    expect(rewards.success(0)).toBe(false);expect(rewards.success(0)).toBe(false);
    expect(rewards.success(100)).toBe(true); expect(layer.dataset.effect).toBe(effect.id);
    rewards.frame(3200);expect(layer.innerHTML).toBe("");
   }
  }
  media.matches=true;rewards.reset();rewards.success(0);rewards.success(0);
  expect(rewards.success(0)).toBe(false);expect(layer.innerHTML).toBe("");
 });
});
