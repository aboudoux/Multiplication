import type { ClockGame } from './clock-games';

const landmarks: Record<ClockGame, string> = {
  read: `<path d="M45 60q8-15 8-31h7q0 20 9 31" fill="#a96542"/>
    <path d="m55 49-13-15m14 8 14-14" fill="none" stroke="#a96542" stroke-width="5"/>
    <path d="M25 35c-4-10 5-18 14-17 1-11 19-17 29-5 9-4 21 3 20 14 11 8 3 20-9 20H41c-9 1-16-4-16-12Z" fill="#83a85e" stroke="#56764a" stroke-width="2"/>
    <path d="M37 28q7-5 14-3m15-5q6 0 10 4" fill="none" stroke="#bfd478" stroke-width="3" stroke-linecap="round"/>
    <path d="M75 59v-7m-4 3h8" stroke="#bb7138" stroke-width="2" stroke-linecap="round"/>`,
  match: `<path d="M24 58V33c0-23 54-23 54 0v25H64V35c0-11-26-11-26 0v23Z" fill="#d9a577" stroke="#976549" stroke-width="2"/>
    <path d="M24 45h14m26 0h14M30 24l11 5m32-5-11 5" stroke="#ac774f" stroke-width="2"/>
    <circle cx="51" cy="24" r="14" fill="#fff4cb" stroke="#95624c" stroke-width="3"/>
    <path d="M51 15v9l5 3" fill="none" stroke="#845768" stroke-width="2.5" stroke-linecap="round"/>`,
  order: `<circle cx="57" cy="25" r="14" fill="#ffd27b"/>
    <path d="m13 51 20-27 21 24 24-20 15 25Z" fill="#99ad7e" stroke="#708a65" stroke-width="2"/>
    <path d="m13 56 30-17 15 9 19-6 18 14Z" fill="#b4c985"/>
    <path d="M24 24q4-7 11 0m1 0q5-7 11 0" fill="none" stroke="#7b6276" stroke-width="2" stroke-linecap="round"/>`,
  compare: `<path d="M20 59q7-24 33-24t34 24" fill="none" stroke="#ad7754" stroke-width="10"/>
    <path d="M18 50q9-22 35-22 27 0 36 22M24 51v-9m16-2v-9m25 9v-9m16 20v-9" fill="none" stroke="#855442" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M44 15h18m-18 19h18m-15-19c0 5 2 7 6 9-4 2-6 5-6 10m12-19c0 5-2 7-6 9 4 2 6 5 6 10" fill="#ffe4a7" stroke="#855442" stroke-width="2.5" stroke-linecap="round"/>`,
  elapsed: `<path d="M15 55c16-31 27-16 44-18s14-19 30-22l8 15c-17 5-11 21-36 24-19 2-23-6-29 5Z" fill="#96c7cd" stroke="#6e9ca9" stroke-width="2"/>
    <path d="m27 51 9-3m31-4 10-3m7-14 5-3" stroke="#e8f6e9" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="43" cy="43" rx="8" ry="5" fill="#bdab9c"/><ellipse cx="61" cy="48" rx="8" ry="5" fill="#978d91"/>
    <path d="m28 36-3-9m3 9 6-7m42 26 3-7m-3 7-4-5" stroke="#678256" stroke-width="2" stroke-linecap="round"/>`,
  next: `<path d="M28 58V33q0-15 25-15t25 15v25" fill="none" stroke="#709052" stroke-width="11"/>
    <path d="M29 32q8 10 24 10t24-10" fill="none" stroke="#a26862" stroke-width="2"/>
    <path d="m34 37 9 4-7 7Zm15 5 9 0-5 9Zm16-1 8-4-2 11Z" fill="#db8b8b"/>
    <path d="M48 18q-4 8 5 21 9-13 5-21Z" fill="#ed9c50" stroke="#a66540" stroke-width="2"/>
    <path d="m53 17-3-7m3 7 5-7" stroke="#729454" stroke-width="3" stroke-linecap="round"/>`,
};

export function clockMapLandmark(game: ClockGame): string {
  return `<svg class="clock-map-landmark" viewBox="0 0 104 68" aria-hidden="true">
    <path d="M9 58q11-10 43-10t43 10q-7 7-43 7T9 58Z" fill="#dbe4aa"/>
    ${landmarks[game]}
  </svg>`;
}

export const clockMapCompass = `<svg class="clock-map-compass" viewBox="0 0 80 80" aria-hidden="true">
  <circle cx="40" cy="40" r="23" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <path d="m40 6 6 28 28 6-28 6-6 28-6-28-28-6 28-6Z" fill="#e7bc7b" stroke="currentColor" stroke-width="1.5"/>
  <path d="M40 6v34L6 40l28-6ZM40 74V40h34l-28 6Z" fill="currentColor"/>
  <circle cx="40" cy="40" r="3.5" fill="#fff5d9"/>
</svg>`;

export const clockMapTreasure = `<svg class="clock-map-treasure" viewBox="0 0 104 76" aria-hidden="true">
  <path d="M36 27c0-9 32-9 32 0v12H36Z" fill="#e9a075" stroke="#895441" stroke-width="2"/>
  <path d="M36 27q5 5 10 1 6 5 12 0 5 4 10-1" fill="#ffe6b5" stroke="#895441" stroke-width="2"/>
  <path d="M52 20v-7" stroke="#9d5c6f" stroke-width="4"/>
  <path d="M52 5q7 8 0 9-7-1 0-9Z" fill="#e3a446"/>
  <path d="M14 43q38-14 76 0v21q-3 5-8 5H22q-5 0-8-5Z" fill="#bc7b53" stroke="#8a503f" stroke-width="2.5"/>
  <path d="M24 43v24m56-24v24M14 49h76" stroke="#efc177" stroke-width="5"/>
  <rect x="46" y="46" width="12" height="12" rx="2" fill="#ffe4a0" stroke="#895441" stroke-width="2"/>
  <path d="m23 17 2 5 5 2-5 2-2 5-2-5-5-2 5-2Zm58 1 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#d58b46"/>
</svg>`;
