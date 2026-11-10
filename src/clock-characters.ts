import type { ClockFriend } from './clock-story';

export const clockRabbitArt = '<span class="clock-character clock-rabbit-art" data-portrait="rabbit" aria-hidden="true"></span>';

export function clockFriendArt(id: ClockFriend['id']): string {
  return `<span class="clock-character clock-friend-art" data-portrait="${id}" aria-hidden="true"></span>`;
}
