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

const faces: Record<ClockFriend['id'], { base: string; fur: string; eyes: string }> = {
  squirrel: {
    base: `<path d="M49 52C50 40 64 39 67 27c3-11-10-15-15-7-6-10 6-19 17-13 13 7 12 28-1 42l-9 12Z" fill="#bc663d"/><path d="M21 32 18 15q10 1 14 10m12 1q4-9 14-11l-3 18" fill="#e3975a"/><path d="M18 44c0-11 8-21 21-21s22 10 22 21-10 18-22 18-21-7-21-18Z" fill="#dc8c55"/>`,
    fur: `<path d="M26 49q12-12 25 0 1 9-12 10-13-1-13-10Z" fill="#ffe6b5"/><path d="M30 62q9-6 18 0l-2 9H32Z" fill="#eaa838"/><path d="M32 62q6-6 14 0" fill="#885438"/>`, eyes: '32 40 47 40',
  },
  hedgehog: {
    base: `<path d="m13 44-4-10 10-2-2-12 12 3 5-12 8 8 10-8 5 12 12-2-2 12 9 5-6 9q2 14-13 18H24Q10 61 13 44Z" fill="#855544"/><path d="M20 48q-2-17 19-21 19 0 22 18l9 7q-10 15-30 14-16-1-20-18Z" fill="#edbd8a"/>`,
    fur: `<path d="M29 49q5-4 8 0m10 1q5-4 8 0" fill="none" stroke="#dd8e82"/><path d="M38 68v5m0-2h9" fill="none" stroke="#b17161"/>`, eyes: '32 42 49 42',
  },
  turtle: {
    base: `<path d="M13 55c0-15 12-25 26-25 16 0 26 11 26 25Z" fill="#5c9771"/><path d="m21 45 12 2 7-8 10 8 10-2m-28 2-3 8m21-8 3 8" fill="none" stroke="#376b55"/><path d="M31 49V36c0-9 7-17 17-17s19 7 19 16-7 13-18 14l-4 10Z" fill="#a8cd82"/>`,
    fur: `<path d="M37 48q10 5 19-1l-2 9-10 1-2 10-7-6Z" fill="#f4a4af"/>`, eyes: '44 34 57 34',
  },
  owl: {
    base: `<path d="M18 27 14 14q11 2 17 10h16q6-8 17-10l-3 13c9 11 11 29 0 37q-22 14-44 0-11-11 1-37Z" fill="#9283c6"/><path d="M24 54q14-8 31 0l4 11q-19 10-38 0Z" fill="#f8e2d4"/>`,
    fur: `<circle cx="30" cy="40" r="12" fill="#fff3d9"/><circle cx="49" cy="40" r="12" fill="#fff3d9"/><path d="m36 48 8 0-4 6Z" fill="#e6a24b"/><path d="m35 62 5 4 5-4" fill="none" stroke="#b07f99"/>`, eyes: '30 40 49 40',
  },
  fox: {
    base: `<path d="m16 39 1-25 23 12 24-12 1 25q13 10-5 23L41 70 20 62Q4 49 16 39Z" fill="#df7746"/><path d="m22 23 12 7-11 7m35-14-12 7 11 7" fill="#f7b091" stroke="none"/>`,
    fur: `<path d="M14 46q14-3 26 11 12-14 27-11-1 10-10 16l-16 7-17-7Q14 56 14 46Z" fill="#fff0d0"/><path d="m31 67 11 4 11-4-2 7H33Z" fill="#709db6"/>`, eyes: '29 43 50 43',
  },
};

export function clockFriendArt(friend: ClockFriend): string {
  const { base, fur, eyes } = faces[friend.id];
  const [left, leftY, right, rightY] = eyes.split(' ');
  return `<svg class="clock-friend-art" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="37" fill="#fff3de" stroke="#c688a4" stroke-width="2"/>
    <g stroke="#64435c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${base}${fur}</g>
    <g fill="#402b45"><circle cx="${left}" cy="${leftY}" r="2.5"/><circle cx="${right}" cy="${rightY}" r="2.5"/>
    ${friend.id === 'owl' ? '' : `<ellipse cx="${friend.id === 'turtle' ? '52' : '40'}" cy="${friend.id === 'fox' ? '58' : friend.id === 'turtle' ? '41' : '51'}" rx="3" ry="1.8"/>`}</g>
  </svg>`;
}

export const clockFinaleCaptions = [
  'Le lapin retrouve ses cinq amis sous le chêne. Ils ont gardé une place pour lui !',
  'Noisette et Pique apportent les pièces. Miette a séché la montre. Plume remet les aiguilles, et Roux leur donne la bonne heure.',
  'Tic-tac, la montre repart ! Le lapin sonne la cloche et partage enfin son gâteau avec ses amis.',
] as const;

export function clockFinaleScene(): string {
  return `<div class="clock-finale-scene" data-step="0" aria-hidden="true">
    <div class="clock-finale-sun"></div><div class="clock-finale-hill"></div><div class="clock-finale-tree"></div>
    <span class="clock-finale-garland">✦ · ✦ · ✦ · ✦</span>
    <div class="clock-finale-watch"><i></i><b></b></div>
    <div class="clock-finale-cast"><img src="/themes/lapin-chrono.svg" alt="" width="120" height="120">${clockFriends.map(clockFriendArt).join('')}</div>
    <div class="clock-finale-cake"><i></i><b></b></div><span class="clock-finale-stars">✧ ✦ ✧</span>
  </div>`;
}
