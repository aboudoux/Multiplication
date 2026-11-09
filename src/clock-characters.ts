import type { ClockFriend } from './clock-story';

type Character = {
  sky: string;
  rim: string;
  shadow: string;
  paw: string;
  eyes: [left: number, right: number, height: number];
  body: string;
  head: string;
};

const characters: Record<ClockFriend['id'], Character> = {
  squirrel: {
    sky: '#ffe0ab', rim: '#e5a55f', shadow: '#b66d49', paw: '#d58450', eyes: [43, 63, 49],
    body: `<g class="clock-animal-detail"><path d="M66 88q-3-21 15-33 15-12 7-21-6-6-12 2-4-15 8-23 16-9 25 7 12 20-4 39-8 11-24 13-9 2-9 18Z" fill="#bb654a"/><path d="M86 55q17-13 13-27-3-10-14-7 10 4 7 11 0 13-15 27Z" fill="#f2a767" stroke="none"/></g>
      <ellipse cx="44" cy="98" rx="13" ry="6" fill="#b9674c"/><ellipse cx="71" cy="98" rx="13" ry="6" fill="#b9674c"/><path d="M36 91q0-24 18-26 23 1 25 25-7 12-23 11-13 0-20-10Z" fill="#d58450"/><path d="M43 92q-1-16 13-18 14 1 15 16-5 9-15 9-9 0-13-7Z" fill="#ffdda3"/>
      <path d="m61 71 17 22" fill="none" stroke="#506854" stroke-width="4"/><rect x="66" y="80" width="18" height="16" rx="5" fill="#8fae74"/><path d="M72 88q3-5 7 0-2 5-4 5-2 0-3-5Z" fill="#ffe6a6" stroke-width="1.4"/>`,
    head: `<path d="M34 41q-9-15-4-25 13 1 20 15m13-1q10-12 20-11 4 12-7 23" fill="#d58450"/><path d="m34 22 10 11-9 3m42-11-10 10 9 1" fill="#f7ae9a" stroke="none"/>
      <path d="M28 51q1-20 25-22 26-1 32 20 6 22-29 25-30 0-28-23Z" fill="#df935a"/><path d="M36 59q8-8 17-4 12-5 23 2 2 12-19 14-20 0-21-12Z" fill="#ffe5ba" stroke="none"/>
      <path d="M48 31q6-6 14-4l-2 5" fill="#f2af70"/><path d="M51 58q5-4 10 0l-5 5Z" fill="#683d48"/><path d="M50 64q5 6 11 0" fill="none"/><path d="M54 65h5v5h-5Z" fill="#fffaf0" stroke-width="1"/>`,
  },
  hedgehog: {
    sky: '#ffd8c7', rim: '#d79594', shadow: '#aa746e', paw: '#ecb48d', eyes: [49, 70, 52],
    body: `<g class="clock-animal-detail"><path d="m24 69-8-11 9-5-7-13 12-4-3-13 14 3 5-12 12 8 10-10 7 12 14-3 1 13 12 4-4 12 8 9-9 9 5 12-13 3-2 13H41Q21 93 24 69Z" fill="#97604f"/><path d="m24 48 10 5m7-23 6 10m16-13-1 10m24-7-7 11m15 7-10 5" fill="none" stroke="#c98b69" stroke-width="3"/></g>
      <ellipse cx="44" cy="98" rx="13" ry="6" fill="#b97b63"/><ellipse cx="76" cy="98" rx="13" ry="6" fill="#b97b63"/><ellipse cx="62" cy="81" rx="26" ry="19" fill="#f0c095"/><path d="M41 76q20 9 39 0l-3 13-13 4-16-4Z" fill="#d68aa4"/><path d="M67 85q6-6 11-1-2 8-11 6-3-2 0-5Z" fill="#f6d990" stroke-width="1.5"/>`,
    head: `<path d="M41 46q-8-7-5-14 9-3 14 7" fill="#f3bf99"/><path d="M38 56q1-18 21-20 19-1 28 17l10 6q-5 12-28 15-27 2-31-18Z" fill="#f2c39c"/><path d="M50 64q11 9 30 3" fill="none" stroke="#db8d86" stroke-width="2"/><ellipse cx="92" cy="58" rx="5" ry="3.5" fill="#683f50"/><path d="M72 63q5 5 10-1" fill="none"/>`,
  },
  turtle: {
    sky: '#d9edc1', rim: '#93b88c', shadow: '#779d72', paw: '#9ec984', eyes: [66, 83, 47],
    body: `<path d="M22 86 13 91l5-10" fill="#86b780"/><ellipse cx="32" cy="98" rx="13" ry="6" fill="#79a87b"/><ellipse cx="76" cy="98" rx="13" ry="6" fill="#79a87b"/>
      <path d="M19 85q3-34 32-33 27 1 30 32-6 12-32 12-24-1-30-11Z" fill="#608e78"/><path d="M25 81q6-25 26-25 20 1 24 25-19 8-50 0Z" fill="#98ba76"/><path d="m31 72 11 1 8-11 11 11 11-2m-30 2-4 11m23-11 5 11" fill="none" stroke="#648966" stroke-width="2.2"/><path d="M22 85q19 10 57 0" fill="none" stroke="#d4dd91" stroke-width="3"/>
      <g class="clock-animal-detail"><path d="M59 74q14 6 31-2l1 9-8 4 1 15-11-7-1-7-13-4Z" fill="#e59bad"/><path d="m74 87 9-3" fill="none" stroke="#f9d3ce" stroke-width="2.5"/></g>`,
    head: `<path d="M55 68V52q0-20 21-24 19-1 25 16 4 19-17 27-8 4-18 3Z" fill="#a9ce87"/><path d="M61 62q12-3 18 0 13-5 18-3-8 12-23 11Z" fill="#d2e3a0" stroke="none"/><path d="M79 59q7 5 13-1" fill="none"/><path d="m94 52 1-2" fill="none" stroke="#729b71"/>`,
  },
  owl: {
    sky: '#e5dcf5', rim: '#b4a2d2', shadow: '#9984b8', paw: '#9b87c7', eyes: [45, 73, 49],
    body: `<ellipse cx="46" cy="99" rx="11" ry="5" fill="#e2a66d"/><ellipse cx="74" cy="99" rx="11" ry="5" fill="#e2a66d"/>
      <path d="M32 87q-5-15 8-29h37q14 13 11 28-7 15-28 15-20 0-28-14Z" fill="#a090c9"/><path d="M42 84q0-16 17-16 17 0 20 17-5 12-18 12-14-1-19-13Z" fill="#fae8d7"/>
      <g class="clock-animal-detail"><path d="M35 68q-14 8-12 19 11 6 23-5m32-12q15 3 19 15-6 9-20 4" fill="#8675b0"/><path d="m27 82 11-5m52 5-8-5" fill="none" stroke="#bcabd8" stroke-width="2"/></g>
      <path d="m48 84 5 3 5-3m4 3 5 3 5-3" fill="none" stroke="#bd8fa8" stroke-width="1.8"/>`,
    head: `<path d="M29 45 24 22q13 2 22 12h24q7-12 23-13l-4 24q11 14 0 26-14 10-31 10-19-1-30-11-9-12 1-25Z" fill="#a998cc"/><path d="m30 28 12 8-10 4m55-11-11 7 9 5" fill="#dfb6d3" stroke="none"/>
      <path d="M31 54q1-18 15-17 10 0 13 9 3-9 14-9 16 2 16 17 0 15-18 18l-12-6-11 6q-17-3-17-18Z" fill="#fff2df" stroke="none"/>
      <g fill="none" stroke="#9f735b" stroke-width="2"><circle cx="45" cy="50" r="13"/><circle cx="73" cy="50" r="13"/><path d="M58 49h2"/></g><path d="m54 59 11-1-6 8Z" fill="#eda763"/>`,
  },
  fox: {
    sky: '#ffd9ad', rim: '#e29a76', shadow: '#b5755a', paw: '#dc8056', eyes: [46, 70, 49],
    body: `<g class="clock-animal-detail"><path d="M66 92q8-25 26-26 16 1 20-14 9 9 5 23-6 20-29 23-14 3-22-6Z" fill="#d77753"/><path d="M105 64q6-5 7-12 10 10 4 25-9-2-11-13Z" fill="#fff1d3" stroke="none"/></g>
      <ellipse cx="47" cy="98" rx="13" ry="6" fill="#ac6656"/><ellipse cx="74" cy="98" rx="13" ry="6" fill="#ac6656"/><path d="M34 90q4-25 24-24 20-1 25 23-6 12-26 12-14-1-23-11Z" fill="#df8c61"/><path d="M47 86q12 9 25-2-1 13-15 13-8-1-10-11Z" fill="#fff0ce" stroke="none"/>
      <path d="M37 72q25 10 47-2l-4 10-14 4-12 11-5-13-10-3Z" fill="#7bacc1"/><path d="M55 82 65 86 55 91Z" fill="#d7e5b5" stroke-width="1.2"/>`,
    head: `<path d="M31 49 26 20q2-7 8-4l24 19 23-19q6-2 8 4l-3 28q13 14-3 24L60 81 35 72Q20 64 31 49Z" fill="#e48d5b"/><path d="m32 23 16 14-13 5m49-19-15 14 13 5" fill="#f3b6a5" stroke="none"/>
      <path d="M29 58q12-7 30 8 18-15 31-8-3 11-12 16l-18 7-19-7q-11-5-12-16Z" fill="#fff0cf" stroke="none"/><path d="M54 65q6-4 12 0l-6 6Z" fill="#694353"/><path d="M53 72q7 6 14 0" fill="none"/>`,
  },
};

export function clockFriendArt(friend: ClockFriend): string {
  const { sky, rim, shadow, paw, eyes: [left, right, height], body, head } = characters[friend.id];
  const eyeWhites = [left, right].map(x => `<ellipse cx="${x}" cy="${height}" rx="6.2" ry="7.2" fill="#fffaf0"/>`).join('');
  const pupils = [left, right].map(x => `<ellipse cx="${x}" cy="${height + 1}" rx="3.7" ry="4.8" fill="#493447"/><circle cx="${x - 1}" cy="${height - 1}" r="1.3" fill="#fffaf0"/>`).join('');
  return `<svg class="clock-friend-art" data-animal="${friend.id}" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="54" fill="${sky}" stroke="${rim}" stroke-width="2.5"/><path d="M19 74q43 16 82-7-6 35-42 45-30-1-40-38Z" fill="${rim}" opacity=".23"/>
    <path d="m18 32 2 4 4 2-4 2-2 5-2-5-4-2 4-2zm84 1 1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#fff9de"/>
    <ellipse cx="60" cy="104" rx="41" ry="7" fill="${shadow}" opacity=".23"/>
    <g stroke="#76505b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}
      <g class="clock-animal-head">${head}
        <g class="clock-animal-eyes" stroke="none">${eyeWhites}<g class="clock-animal-look">${pupils}</g></g>
        <ellipse cx="${left - 8}" cy="${height + 11}" rx="4.4" ry="2.4" fill="#e995a1" stroke="none" opacity=".85"/><ellipse cx="${right + 6}" cy="${height + 10}" rx="4.4" ry="2.4" fill="#e995a1" stroke="none" opacity=".85"/>
      </g>
      <g class="clock-animal-paw" opacity="0"><path d="M83 82q-3-4 2-9l3-8q1-5 5-4 3 1 2 7l3-2q6-1 5 5l-5 9q-4 8-10 6Z" fill="${paw}"/>
        <path d="m100 59 3-5m1 9 5-2" fill="none" stroke="#a4587d" stroke-width="1.9"/></g>
    </g>
  </svg>`;
}
