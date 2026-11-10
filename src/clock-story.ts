import { clockFriendArt, clockRabbitArt } from './clock-characters';
import { finaleVoiceClips } from './clock-finale-voice-clips';

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

export const clockFinaleChapters = [
  { title: 'Sous le grand chêne', caption: 'Le lapin retrouve ses cinq amis. Ils lui ont gardé une place au goûter !' },
  { title: 'Une montre à réparer', caption: 'Miette a séché la montre. Noisette et Pique tendent le rouage et la vis à Plume.' },
  { title: 'Le premier tic-tac', caption: 'Roux annonce l’heure : quatre heures dix. Plume règle les aiguilles. Tic-tac, la montre repart !' },
  { title: 'Ding, ding !', caption: 'Le lapin sonne la cloche. Les lanternes s’allument une à une sous le grand chêne.' },
  { title: 'Le goûter des amis', caption: 'Le lapin partage enfin son gâteau. « Merci, les amis ! Grâce à vous, le goûter peut commencer. »' },
] as const;
export const clockFinaleOpeningMs = 3300;
export const clockFinaleChapterStarts = finaleVoiceClips.reduce((starts, [start, end]) => {
  starts.push(starts[starts.length - 1] + Math.max(5000, Math.ceil((end - start) * 1000) + 400));
  return starts;
}, [0]);

const grove = `<svg class="clock-finale-grove" viewBox="0 0 760 360" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="clock-grove-sky" x2="0" y2="1"><stop stop-color="#b4a6e1"/><stop offset=".7" stop-color="#f7ceba"/><stop offset="1" stop-color="#fff0ad"/></linearGradient>
    <linearGradient id="clock-grove-lawn" x2="0" y2="1"><stop stop-color="#dbe494"/><stop offset="1" stop-color="#8fb16c"/></linearGradient>
    <radialGradient id="clock-grove-sun"><stop offset=".45" stop-color="#fff8bc"/><stop offset="1" stop-color="#fff6b500"/></radialGradient>
    <g id="clock-grove-flower"><path d="M0 12Q-2 6 0 0M0 10Q5 6 7 7" fill="none" stroke="#5f824e" stroke-width="1.7" stroke-linecap="round"/><path d="M0-2Q-7-8-7-1Q-10 5-3 4Q0 11 3 4Q10 5 7-1Q7-8 0-2Z" fill="currentColor"/><circle r="2.2" fill="#f5ad55"/></g>
  </defs>
  <path d="M0 0h760v360H0Z" fill="url(#clock-grove-sky)"/>
  <circle cx="166" cy="101" r="93" fill="url(#clock-grove-sun)"/><circle cx="166" cy="101" r="38" fill="#fff0ae"/>
  <path d="M51 106q8-15 31-11 20-27 44 11Zm226-17q10-16 28-12 15-18 35-4 17-2 24 16Zm148 33q13-15 30-11 16-22 37 11Z" fill="#fff8ea" opacity=".69"/>
  <path d="M0 218q110-81 221-14t199-11q140-64 340 29v138H0Z" fill="#b7b4c6"/>
  <path d="M0 255q139-80 301-34t459-17v156H0Z" fill="#a9bd91"/>
  <path d="M0 284q96-45 257-20 159 22 279-18 110-29 224 10v104H0Z" fill="url(#clock-grove-lawn)"/>
  <path d="M381 235q-56 23-22 47t-108 78h118q112-46 58-81-32-19-24-44Z" fill="#f8e3b6" opacity=".84"/>
  <path d="M593 254q36-19 39-91 1-39-26-62l9-11 35 29 14-79 16 7-4 75 56-44 11 15-65 67q-4 69 41 95-65 14-126-1Z" fill="#9a5e50" stroke="#825448" stroke-width="3"/>
  <path d="M633 246q21-36 20-74m17-35 41-33m-52 124q8 20 21 26" fill="none" stroke="#bd8963" stroke-width="4" stroke-linecap="round"/>
  <path d="M523 79Q492 23 548 7q22-24 67-16 39-17 80 5 50-7 67 16l15 106q-36 29-82 14-47 28-85 1-62 21-80-23Z" fill="#699265"/>
  <path d="M523 63q9-40 50-37 32-24 70-7 48-18 88 12l31 6v42q-31-22-76-8-38-15-83 7-53-13-80 14Z" fill="#8fac67"/>
  <path d="M0 344q90-22 135-8 45 14 112 24H0Zm535 16q68-33 118-22 48 8 107-18v40Z" fill="#789d62"/>
  <g color="#fff2b9"><use href="#clock-grove-flower" x="43" y="321"/><use href="#clock-grove-flower" x="112" y="301"/><use href="#clock-grove-flower" x="648" y="308"/><use href="#clock-grove-flower" x="728" y="280"/></g>
  <g color="#f3a6bc"><use href="#clock-grove-flower" x="79" y="336"/><use href="#clock-grove-flower" x="153" y="319"/><use href="#clock-grove-flower" x="684" y="325"/><use href="#clock-grove-flower" x="742" y="308"/></g>
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
  const cast = ['rabbit', ...clockFriends.map(friend => friend.id)] as const;
  return `<div class="clock-finale-scene" data-step="0" aria-hidden="true">
    ${grove}<div class="clock-finale-late-light"></div>${lanterns}
    <div class="clock-finale-fireflies"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="clock-finale-cast">${cast.map(animal =>
      `<span class="clock-finale-actor" data-animal="${animal}"><span class="clock-finale-puppet">${animal === 'rabbit' ? clockRabbitArt : clockFriendArt(animal)}</span></span>`).join('')}</div>
    <div class="clock-finale-workbench">${watch}<span class="clock-finale-gear" data-finale-prop="gear">⚙</span><span class="clock-finale-screw"></span><span class="clock-finale-glints">✧ ✦ ✧</span></div>
    ${bell}<div class="clock-finale-blanket"></div>${cake}
    <div class="clock-finale-confetti">${[6, 14, 22, 29, 37, 45, 53, 61, 68, 76, 84, 93].map((left, index) =>
      `<i style="--paper-left:${left}%;--paper-delay:${(index % 4) * 110}ms"></i>`).join('')}</div>
  </div>`;
}
