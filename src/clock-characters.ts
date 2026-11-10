import type { ClockFriend } from './clock-story';

function clockAnimalArt(id: 'rabbit' | ClockFriend['id']): string {
  const portrait = id === 'rabbit' ? 'clock-rabbit-art' : 'clock-friend-art';
  return `<span class="clock-character ${portrait}" data-portrait="${id}" style="--outline:url(#clock-animal-cut-${id})" aria-hidden="true"></span>`;
}

export const clockRabbitArt = clockAnimalArt('rabbit');

export function clockFriendArt(id: ClockFriend['id']): string {
  return clockAnimalArt(id);
}
