import type { VoiceStyle } from "./voice-profiles";
import { ant } from './ants';
import { mascot, dancingMascot, disappointedMascot } from "./mascots";
import { picoThemeIds } from './pico-content';
import { picoThemes } from './pico-themes';
export const themeIds = ["star", "halloween", "christmas", "wizard", "unicorn", "dragon", "alien", "kitten", "ant", ...picoThemeIds] as const;
export type ThemeId = typeof themeIds[number];
export interface Surprise { id: string; artwork: string; motion: "swarm" | "flight" | "snow" | "hop" | "rainbow" | "orbit" | "scamper" | "roll"; count: number; }
export interface ThemeDefinition {
 name: string; home: string; dance: string; sad: string; scenery: string; victoryLabel: string;
 colors: readonly string[]; melody: readonly number[]; danceNotes: readonly number[];
 voices: readonly VoiceStyle[];
 music: { bpm: number; timbre: OscillatorType; bass: readonly number[]; sparkle: number };
 surprises: readonly Surprise[];
}
export function sprite(theme: ThemeId, cell: number, className = ""): string {
 const x = cell % 3 * 50, y = Math.floor(cell / 3) * 100;
 return `<span class="theme-sprite sprite-${theme} ${className}" style="background-position:${x}% ${y}%" aria-hidden="true"></span>`;
}
function illustratedTheme(id: ThemeId, name: string, colors: readonly string[], voices: readonly VoiceStyle[], melody: number[], danceNotes: number[], music: ThemeDefinition["music"], surprises: ThemeDefinition["surprises"]): ThemeDefinition {
 return { name, home: sprite(id,0,"mascot"), dance: sprite(id,1,"party-mascot"), sad: sprite(id,2,"defeat-mascot"),
 scenery: [0,1,2].map(i => `<span class="scene-motif motif-${i}">${sprite(id,5)}</span>`).join(""),
 victoryLabel: `La mascotte ${name} danse avec ses amis`, colors, voices, melody, danceNotes, music, surprises };
}
export const bat = `<svg viewBox="0 0 120 60" fill="none"><path d="M59 25 51 12 47 26Q27 4 3 8q8 10 5 28 15-9 22 6 14-8 23 9h14q9-17 23-9 7-15 22-6-3-18 5-28-24-4-44 18l-4-14-8 13Z" fill="#241337" stroke="#be99f5" stroke-width="2"/><circle cx="56" cy="31" r="2" fill="#ffdb69"/><circle cx="65" cy="31" r="2" fill="#ffdb69"/></svg>`;
export const witch = `<svg viewBox="0 0 180 150" fill="none"><path d="m21 127 131-33" stroke="#e1b279" stroke-width="6" stroke-linecap="round"/><path d="m141 90 31-4-4 29-29-13Z" fill="#efa743"/><path d="m145 94 21-3m-22 8 20 3m-20 0 17 8" stroke="#8d562c" stroke-width="2"/><path d="m76 64-27 46 56-4-13-42Z" fill="#965aec" stroke="#d2b2ff" stroke-width="2"/><path d="m76 101 22 20 19-5" stroke="#9df2b6" stroke-width="8" stroke-linecap="round"/><path d="m73 76 22 12 20-5" stroke="#9df2b6" stroke-width="6" stroke-linecap="round"/><path d="M62 47q-17 22 0 32l8-23" fill="#fa934d"/><ellipse cx="81" cy="53" rx="19" ry="20" fill="#b3eeac"/><path d="m94 49 12 8-13 3" fill="#b3eeac"/><circle cx="87" cy="48" r="2.5" fill="#281634"/><path d="M83 63q7 6 12-1" stroke="#281634" stroke-width="2" stroke-linecap="round"/><path d="m54 38 16-31 17 5-3 8 20 26Z" fill="#513274" stroke="#c6a0f2" stroke-width="2"/><path d="m48 37 65 9" stroke="#c6a0f2" stroke-width="7" stroke-linecap="round"/><path d="m60 29 35 5" stroke="#ffb548" stroke-width="7"/></svg>`;
function pumpkin(state: "home" | "dance" | "sad"): string {
 const sad = state === "sad";
 return `<svg class="${sad ? "defeat-mascot" : state === "dance" ? "party-mascot" : "mascot"} pumpkin" viewBox="0 0 360 320" fill="none" aria-hidden="true">
 <ellipse class="sad-shadow" cx="180" cy="286" rx="90" ry="12" fill="#180e35" opacity=".45"/>
 <g class="${sad ? "sad-star" : "pumpkin-body"}">
 <g class="party-left-leg"><path d="m144 238-12 34-20 2" stroke="#b8ee9a" stroke-width="7" stroke-linecap="round"/><path d="m107 268 31 4-2 12h-35Z" fill="#aa77f6"/></g>
 <g class="party-right-leg"><path d="m216 238 12 34 20 2" stroke="#b8ee9a" stroke-width="7" stroke-linecap="round"/><path d="m223 272 30-4 6 16h-35Z" fill="#aa77f6"/></g>
 <g class="party-left-arm"><path d="M86 163q-34 ${sad ? "25-21 47" : "-6-27-39"}" stroke="#b8ee9a" stroke-width="7" stroke-linecap="round"/></g>
 <g class="party-right-arm"><path d="M274 163q34 ${sad ? "25 21 47" : "-6 27-39"}" stroke="#b8ee9a" stroke-width="7" stroke-linecap="round"/></g>
 <path d="M172 86q13-29-2-48l25-5q12 26-5 55" fill="#85bd65" stroke="#c4ed95" stroke-width="4"/>
 <path d="M188 71q27-35 56-15-17 26-51 19" fill="#a6dd76"/>
 <path d="M180 85C81 48 42 130 73 207c20 51 70 58 107 43 37 15 87 8 107-43 31-77-8-159-107-122Z" fill="#f8902c" stroke="#ffd083" stroke-width="5"/>
 <ellipse cx="180" cy="170" rx="67" ry="88" fill="#ffab37"/>
 <path d="M155 91q-58 79 0 153m49-153q58 79 0 153" stroke="#df681f" stroke-width="4" opacity=".55"/>
 ${sad ? '<path d="m127 140 25-7m55 0 25 7m-99 18q10 10 20 0m54 0q10 10 20 0M159 209q21-23 42 0" stroke="#402337" stroke-width="6" stroke-linecap="round"/><path class="sad-tear" d="M225 170q-12 20 0 20t0-20" fill="#9de7ff"/>' : '<path d="M124 156q13-23 27 0m58 0q13-23 27 0" stroke="#402337" stroke-width="7" stroke-linecap="round"/><path d="M143 185q36 49 74 0Z" fill="#402337"/><path d="M160 188h13v12h-13m25-12h13v12h-13" fill="#fff0bb"/>'}
 <ellipse cx="117" cy="179" rx="13" ry="7" fill="#f26555"/><ellipse cx="243" cy="179" rx="13" ry="7" fill="#f26555"/>
 </g><g stroke="#ffe2a0" stroke-width="3" stroke-linecap="round"><path d="M54 80v16m-8-8h16m234 132v16m-8-8h16M271 46l6 9m-13-2 16-4"/></g></svg>`;
}
export const themes: Record<ThemeId, ThemeDefinition> = {
 ...picoThemes,
 ant: { name:'Petites fourmis',home:ant(),dance:ant('dance'),sad:ant('sad'),scenery:'',victoryLabel:'Les fourmis apportent les matériaux à la fourmilière',
  voices:['ant','classic'],colors:['#f8d16a','#a9d3b2','#95d4ef','#fff4d1','#ecaaa0'],music:{bpm:128,timbre:'triangle',bass:[131,165,196,147],sparkle:1},
  melody:[523,659,0,784,659,523,0,587,698,880,698,587,659,784,523,0],danceNotes:[523,659,784,1047,784,659,587,698,880,1175,784,523],
  surprises:[{id:'ant-builders',artwork:ant(),motion:'scamper',count:3}] },
 star: { voices: ["classic"], music: {bpm:126,timbre:"triangle",bass:[131,147,175,165],sparkle:0}, surprises:[], name: "Étoile", home: mascot, dance: dancingMascot, sad: disappointedMascot, scenery: "", victoryLabel: "L’étoile danse sous les projecteurs", colors: ["#ffe54b", "#4dffd2", "#ff6d9e", "#ffffff", "#ab8bff"], melody: [523, 0, 659, 784, 0, 659, 880, 784, 587, 0, 698, 880, 784, 698, 659, 0], danceNotes: [523,659,784,1047,880,784,659,784,1047,1175,1319,1047] },
 halloween: { voices: ["witch","monster","classic"], music:{bpm:126,timbre:"triangle",bass:[147,175,220,196],sparkle:0}, surprises:[{id:"bats",artwork:bat,motion:"swarm",count:18},{id:"witch",artwork:witch,motion:"flight",count:1}], name: "Halloween", home: pumpkin("home"), dance: pumpkin("dance"), sad: pumpkin("sad"), scenery: `<span class="halloween-moon"></span><span class="halloween-bat bat-one">${bat}</span><span class="halloween-bat bat-two">${bat}</span><span class="halloween-witch">${witch}</span><span class="magic-dust">✧ · ✦ · ✧</span>`, victoryLabel: "La citrouille danse avec la sorcière et les chauves-souris", colors: ["#ffc45d", "#ff823e", "#b8e1fa", "#fff0c4", "#ffb5cf"], melody: [587,0,698,880,0,698,1175,880,659,0,784,932,880,784,698,0], danceNotes: [587,698,880,1175,1047,880,698,880,1175,1319,1397,1175] },
 christmas: illustratedTheme("christmas", "Noël", ["#ffe493","#ff6380","#96e7fa","#ffffff","#ef3d49"], ["santa","elf","classic"],
 [784,0,988,1175,988,784,659,0,880,988,1175,1319,1175,988,784,0], [784,988,1175,1568,1319,1175,988,784,880,988,1175,1568],
 {bpm:136,timbre:"sine",bass:[196,165,220,196],sparkle:2}, [{id:"sleigh",artwork:sprite("christmas",3),motion:"flight",count:1},{id:"elf-gifts",artwork:sprite("christmas",4),motion:"hop",count:3},{id:"gift-snow",artwork:sprite("christmas",5),motion:"snow",count:15}]),
 wizard: illustratedTheme("wizard", "École des sorciers", ["#ffdb83","#b4d4ff","#dc9d46","#fff4dc","#6eacff"], ["wizard","enchanted","classic"],
 [659,0,784,988,1175,988,784,0,740,880,1047,1319,1047,880,659,0], [659,784,988,1319,1175,988,784,659,740,880,988,1319],
 {bpm:128,timbre:"triangle",bass:[165,196,220,147],sparkle:2}, [{id:"broom",artwork:sprite("wizard",3),motion:"flight",count:1},{id:"owls",artwork:sprite("wizard",4),motion:"swarm",count:9},{id:"magic-books",artwork:sprite("wizard",5),motion:"orbit",count:5}]),
 unicorn: illustratedTheme("unicorn", "Licorne", ["#fff59d","#ff85bd","#9eecff","#ffb5cf","#ffffff"], ["fairy","unicorn","classic"],
 [880,0,1109,1319,1109,988,880,0,740,880,988,1109,1319,1480,1319,0], [880,1109,1319,1760,1480,1319,1109,988,880,988,1109,1760],
 {bpm:140,timbre:"sine",bass:[220,185,165,247],sparkle:2}, [{id:"rainbow-run",artwork:sprite("unicorn",3),motion:"rainbow",count:1},{id:"fairies",artwork:sprite("unicorn",4),motion:"orbit",count:7},{id:"rainbow-stars",artwork:sprite("unicorn",5),motion:"snow",count:18}]),
 dragon: illustratedTheme("dragon", "Dragon", ["#ffdf72","#ff863e","#a9e4ff","#fff0b8","#ff5547"], ["dragon","babyDragon","classic"],
 [392,0,494,587,784,587,494,0,440,523,659,784,659,523,494,0], [392,494,587,784,988,784,587,494,440,523,659,784],
 {bpm:132,timbre:"triangle",bass:[98,123,131,147],sparkle:1.5}, [{id:"dragon-flight",artwork:sprite("dragon",3),motion:"flight",count:1},{id:"hatching",artwork:sprite("dragon",4),motion:"hop",count:3},{id:"gem-shower",artwork:sprite("dragon",5),motion:"snow",count:18}]),
 alien: illustratedTheme("alien", "Extraterrestre", ["#edff77","#8decff","#57a5ff","#ffffff","#ff97cf"], ["alien","robot","classic"],
 [622,0,932,1245,0,932,830,622,698,0,1047,1397,1245,1047,932,0], [622,830,932,1245,1661,1245,932,830,698,932,1047,1245],
 {bpm:144,timbre:"square",bass:[156,208,175,233],sparkle:2}, [{id:"ufo",artwork:sprite("alien",3),motion:"orbit",count:1},{id:"robot-skate",artwork:sprite("alien",4),motion:"rainbow",count:1},{id:"planet-parade",artwork:sprite("alien",5),motion:"swarm",count:12}]),
 kitten: illustratedTheme("kitten", "Chat trop mignon", ["#ffe09a","#ffb5cf","#bceef7","#ffc35c","#fff4df"], ["kitten","purr","classic"],
 [659,0,784,659,880,0,784,523,587,0,659,784,1047,880,784,0], [659,784,880,1047,880,784,659,587,659,784,880,1047],
 {bpm:138,timbre:"sine",bass:[131,175,147,196],sparkle:1.5}, [{id:"kitten-zoomies",artwork:sprite("kitten",3),motion:"scamper",count:1},{id:"kitten-peekaboo",artwork:sprite("kitten",4),motion:"hop",count:3},{id:"yarn-party",artwork:sprite("kitten",5),motion:"roll",count:9}]),
};
