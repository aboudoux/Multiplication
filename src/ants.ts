/** Original illustrated mascot; SVG viewports select poses without altering the transparent atlas. */
export function ant(pose: 'home' | 'dance' | 'sad' = 'home'): string {
  const offset = { home: 31, dance: 616, sad: 1197 }[pose];
  const className = pose === 'home' ? 'mascot' : pose === 'dance' ? 'party-mascot' : 'defeat-mascot';
  return `<svg class="ant-character ${className}" viewBox="0 0 620 887" aria-hidden="true"><svg width="620" height="887" overflow="hidden"><image href="/themes/ants.png" x="${-offset}" y="0" width="1774" height="887"/></svg></svg>`;
}
export { colonyScene as campScene } from './colony-scene';
