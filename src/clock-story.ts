export const clockStoryTitle = 'Le goûter du tic-tac';
export const clockStoryIntro = 'Le lapin doit apporter le gâteau au goûter de quatre heures. Une averse le surprend et sa montre tombe dans une flaque. Elle s’arrête à trois heures ! Il croit avoir encore le temps. Quand il arrive en retard, la clairière est vide… Où sont passés ses amis ?';

export const clockFriends = [
  { id: 'squirrel', name: 'Noisette l’écureuil', at: 3, title: 'Une dent d’or', story: 'Noisette fouille sous les feuilles. Voilà un petit rouage tombé de la montre ! Il le rapporte au lapin.' },
  { id: 'hedgehog', name: 'Pique le hérisson', at: 6, title: 'La toute petite vis', story: 'Pique remarque une vis dans la mousse. Il la transporte entre ses piquants pour ne plus la perdre.' },
  { id: 'turtle', name: 'Miette la tortue', at: 9, title: 'Au sec sous la feuille', story: 'Miette sèche la montre avec sa serviette de pique-nique. Elle propose de déplacer le goûter sous le grand chêne.' },
  { id: 'owl', name: 'Plume la chouette', at: 12, title: 'Deux aiguilles à remettre', story: 'Plume glisse le rouage à sa place et remet les aiguilles bien droites. Reste à savoir quelle heure il est.' },
  { id: 'fox', name: 'Roux le renard', at: 15, title: 'Le chemin des lanternes', story: 'Roux connaît le chemin du grand chêne. Là-bas, les amis préparent une surprise et la grande horloge donne la bonne heure.' },
] as const;

export type ClockFriend = (typeof clockFriends)[number];

const faces: Record<ClockFriend['id'], { base: string; fur: string; eyes: string; paw: string }> = {
  squirrel: {
    base: `<path d="M49 52C50 40 64 39 67 27c3-11-10-15-15-7-6-10 6-19 17-13 13 7 12 28-1 42l-9 12Z" fill="#bc663d"/><path d="M21 32 18 15q10 1 14 10m12 1q4-9 14-11l-3 18" fill="#e3975a"/><path d="M18 44c0-11 8-21 21-21s22 10 22 21-10 18-22 18-21-7-21-18Z" fill="#dc8c55"/>`,
    fur: `<path d="M26 49q12-12 25 0 1 9-12 10-13-1-13-10Z" fill="#ffe6b5"/><path d="M30 62q9-6 18 0l-2 9H32Z" fill="#eaa838"/><path d="M32 62q6-6 14 0" fill="#885438"/>`, eyes: '32 40 47 40', paw: '#dc8c55',
  },
  hedgehog: {
    base: `<path d="m13 44-4-10 10-2-2-12 12 3 5-12 8 8 10-8 5 12 12-2-2 12 9 5-6 9q2 14-13 18H24Q10 61 13 44Z" fill="#855544"/><path d="M20 48q-2-17 19-21 19 0 22 18l9 7q-10 15-30 14-16-1-20-18Z" fill="#edbd8a"/>`,
    fur: `<path d="M29 49q5-4 8 0m10 1q5-4 8 0" fill="none" stroke="#dd8e82"/><path d="M38 68v5m0-2h9" fill="none" stroke="#b17161"/>`, eyes: '32 42 49 42', paw: '#edbd8a',
  },
  turtle: {
    base: `<path d="M13 55c0-15 12-25 26-25 16 0 26 11 26 25Z" fill="#5c9771"/><path d="m21 45 12 2 7-8 10 8 10-2m-28 2-3 8m21-8 3 8" fill="none" stroke="#376b55"/><path d="M31 49V36c0-9 7-17 17-17s19 7 19 16-7 13-18 14l-4 10Z" fill="#a8cd82"/>`,
    fur: `<path d="M37 48q10 5 19-1l-2 9-10 1-2 10-7-6Z" fill="#f4a4af"/>`, eyes: '44 34 57 34', paw: '#a8cd82',
  },
  owl: {
    base: `<path d="M18 27 14 14q11 2 17 10h16q6-8 17-10l-3 13c9 11 11 29 0 37q-22 14-44 0-11-11 1-37Z" fill="#9283c6"/><path d="M24 54q14-8 31 0l4 11q-19 10-38 0Z" fill="#f8e2d4"/>`,
    fur: `<circle cx="30" cy="40" r="12" fill="#fff3d9"/><circle cx="49" cy="40" r="12" fill="#fff3d9"/><path d="m36 48 8 0-4 6Z" fill="#e6a24b"/><path d="m35 62 5 4 5-4" fill="none" stroke="#b07f99"/>`, eyes: '30 40 49 40', paw: '#9283c6',
  },
  fox: {
    base: `<path d="m16 39 1-25 23 12 24-12 1 25q13 10-5 23L41 70 20 62Q4 49 16 39Z" fill="#df7746"/><path d="m22 23 12 7-11 7m35-14-12 7 11 7" fill="#f7b091" stroke="none"/>`,
    fur: `<path d="M14 46q14-3 26 11 12-14 27-11-1 10-10 16l-16 7-17-7Q14 56 14 46Z" fill="#fff0d0"/><path d="m31 67 11 4 11-4-2 7H33Z" fill="#709db6"/>`, eyes: '29 43 50 43', paw: '#df7746',
  },
};

export function clockFriendArt(friend: ClockFriend): string {
  const { base, fur, eyes, paw } = faces[friend.id];
  const [left, leftY, right, rightY] = eyes.split(' ');
  return `<svg class="clock-friend-art" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="37" fill="#fff3de" stroke="#c688a4" stroke-width="2"/>
    <g class="clock-animal-head">
      <g stroke="#64435c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${base}${fur}</g>
      <g class="clock-animal-look" fill="#402b45"><g class="clock-animal-eyes"><circle cx="${left}" cy="${leftY}" r="2.5"/><circle cx="${right}" cy="${rightY}" r="2.5"/></g></g>
      ${friend.id === 'owl' ? '' : `<ellipse fill="#402b45" cx="${friend.id === 'turtle' ? '52' : '40'}" cy="${friend.id === 'fox' ? '58' : friend.id === 'turtle' ? '41' : '51'}" rx="3" ry="1.8"/>`}
    </g>
    <g class="clock-animal-paw" opacity="0" stroke="#64435c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M58 58q-1-5 4-7l1-8q2-5 5-1l1 5 3-2q4 0 2 5l-4 8q-5 7-12 0Z" fill="${paw}"/>
      <path d="m68 37 2-4m4 7 4-2" fill="none" stroke="#a34c7a"/>
    </g>
  </svg>`;
}

export const clockFinaleChapters = [
  { title: 'Sous le grand chêne', caption: 'Le lapin retrouve ses cinq amis. Ils lui ont gardé une place au goûter !' },
  { title: 'Une montre à réparer', caption: 'Miette a séché la montre. Noisette et Pique tendent le rouage et la vis à Plume.' },
  { title: 'Le premier tic-tac', caption: 'Roux annonce l’heure : quatre heures dix. Plume règle les aiguilles. Tic-tac, la montre repart !' },
  { title: 'Ding, ding !', caption: 'Le lapin sonne la cloche. Les lanternes s’allument une à une sous le grand chêne.' },
  { title: 'Le goûter des amis', caption: 'Le lapin partage enfin son gâteau. « Merci, les amis ! Grâce à vous, le goûter peut commencer. »' },
] as const;
export const clockFinaleChapterMs = 5000;

const grove = `<svg class="clock-finale-grove" viewBox="0 0 760 360" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="clock-grove-sky" x2="0" y2="1"><stop stop-color="#9bd2e9"/><stop offset="1" stop-color="#ffecb6"/></linearGradient></defs>
  <path d="M0 0h760v360H0Z" fill="url(#clock-grove-sky)"/>
  <circle cx="166" cy="100" r="55" fill="#fff1b5" opacity=".6"/><circle cx="166" cy="100" r="40" fill="#ffe088"/>
  <path d="M0 218q110-81 221-14t199-11q140-64 340 29v138H0Z" fill="#91bd8d"/>
  <path d="M0 278q139-80 301-34t459-17v133H0Z" fill="#aed58f"/>
  <path d="M0 331q157-71 333-39t427-22v90H0Z" fill="#97bf79"/>
  <path d="M481 270q41-20 41-99l-27-38 13-8 23 28 15-58 18 7-6 45 43-40 12 10-54 67q-5 44 23 83Z" fill="#a77762" stroke="#805a53" stroke-width="4" stroke-linejoin="round"/>
  <path d="M418 126q-11-50 51-62 26-45 91-36 51-23 103 19 61 0 66 53 24 51-30 63-31 33-98 20-59 20-104-11-65 5-79-46Z" fill="#6fa674"/>
  <path d="M438 113q14-41 70-38 27-35 91-23 39-12 80 19 31 1 42 20-30-17-66-6-50-22-89 8-71-11-128 20Z" fill="#8fbb7d"/>
  <path d="M69 144q0-10 19-11 9-17 26-9 12 1 16 12 22-2 24 8Z M289 113q9-13 25-9 11-16 31-6 17-3 26 15Z" fill="#fffaed" opacity=".8"/>
  <path d="M89 307l-4 13m12-11 1 9m594-19-5 14m14-10 1 9m-509 15-4 9m13-10 1 12" stroke="#6e9b63" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const watch = `<svg viewBox="0 0 120 120" class="clock-finale-watch" data-finale-prop="watch">
  <rect x="51" y="4" width="18" height="16" rx="5" fill="#e4a941" stroke="#855363" stroke-width="3"/>
  <circle cx="60" cy="66" r="46" fill="#ecb657" stroke="#855363" stroke-width="4"/>
  <circle cx="60" cy="66" r="37" fill="#fff7d9" stroke="#b77e57" stroke-width="2"/>
  <g fill="#623857" font-size="9" font-weight="700" text-anchor="middle"><text x="60" y="40">12</text><text x="88" y="69">3</text><text x="60" y="96">6</text><text x="32" y="69">9</text></g>
  <path class="clock-finale-minute" d="M60 66V43" stroke="#a34b76" stroke-width="3" stroke-linecap="round"/>
  <path class="clock-finale-hour" d="M60 66V50" stroke="#623857" stroke-width="5" stroke-linecap="round"/>
  <circle cx="60" cy="66" r="3.5" fill="#623857"/>
</svg>`;

const lanterns = `<div class="clock-finale-lanterns" data-finale-prop="lanterns"><i></i><i></i><i></i><i></i><i></i></div>`;
const bell = `<svg class="clock-finale-bell" viewBox="0 0 78 90" data-finale-prop="bell"><path d="M38 9v12" stroke="#775261" stroke-width="5"/><path d="M15 63q10-6 10-18c0-15 7-22 14-22s15 7 15 22q0 12 9 18Z" fill="#ffcd66" stroke="#915864" stroke-width="4" stroke-linejoin="round"/><ellipse cx="39" cy="64" rx="25" ry="7" fill="#e7a856" stroke="#915864" stroke-width="4"/><circle cx="39" cy="70" r="7" fill="#ffe69b" stroke="#915864" stroke-width="3"/></svg>`;
const cake = `<svg class="clock-finale-cake" viewBox="0 0 120 88" data-finale-prop="cake">
  <ellipse cx="60" cy="80" rx="54" ry="6" fill="#fff3d7" stroke="#a26882" stroke-width="2"/>
  <rect x="19" y="38" width="82" height="39" rx="10" fill="#ffc982" stroke="#98637c" stroke-width="3"/>
  <path d="M20 58q40 9 80 0" stroke="#e18c8b" stroke-width="7" fill="none"/>
  <path d="M20 42q0-10 12-10h56q12 0 12 10v8q-10 9-20-1-10 11-20 1-10 10-20 0-10 9-20 0Z" fill="#ffe5e9" stroke="#98637c" stroke-width="2"/>
  <circle cx="45" cy="36" r="3" fill="#bf5b86"/><circle cx="75" cy="36" r="3" fill="#bf5b86"/>
  <rect x="56" y="18" width="8" height="18" rx="3" fill="#9382c7"/><path class="clock-finale-flame" d="M60 3q11 12 0 15-11-3 0-15Z" fill="#f9a637"/>
</svg>`;

export function clockFinaleScene(): string {
  return `<div class="clock-finale-scene" data-step="0" aria-hidden="true">
    ${grove}<div class="clock-finale-late-light"></div>${lanterns}
    <div class="clock-finale-cast"><img src="/themes/lapin-chrono.svg" alt="" width="120" height="120">${clockFriends.map(clockFriendArt).join('')}</div>
    <div class="clock-finale-workbench">${watch}<span class="clock-finale-gear" data-finale-prop="gear">⚙</span><span class="clock-finale-screw"></span><span class="clock-finale-glints">✧ ✦ ✧</span></div>
    ${bell}<div class="clock-finale-blanket"></div>${cake}
    <div class="clock-finale-confetti">${[6, 14, 22, 29, 37, 45, 53, 61, 68, 76, 84, 93].map((left, index) =>
      `<i style="--paper-left:${left}%;--paper-delay:${(index % 4) * 110}ms"></i>`).join('')}</div>
  </div>`;
}
