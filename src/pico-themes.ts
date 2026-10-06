import type { ThemeDefinition } from './themes';
import { picoCast, picoSprite, type PicoThemeId } from './pico-content';

// One original maritime phrase, eight different tonal and rhythmic variations.
const phrase = [0,4,7,0,9,7,4,-1,2,5,9,7,4,2,0,-1];
const roots = [261.63,293.66,329.63,246.94,220,349.23,311.13,392];
const tempos = [122,124,126,128,130,132,134,136];
export const picoThemes = Object.fromEntries(picoCast.map((character,i) => {
 const tone=(step:number)=>Math.round(roots[i]*2**(step/12));
 const melody=phrase.map((step,n)=>step===-1?0:tone(step+(n%4===i%4?12:0)));
 const theme:ThemeDefinition = {
  name:character.name,home:picoSprite(character.id,2,'mascot'),dance:picoSprite(character.id,4,'party-mascot'),sad:picoSprite(character.id,5,'defeat-mascot'),
  scenery:[0,1,2].map(n=>`<span class="scene-motif motif-${n}">${picoSprite(character.id,6+n%2)}</span>`).join(''),
  victoryLabel:`${character.name} célèbre une étape vers le phare`,voices:['classic'],colors:[character.color,'#8ADFD9','#FFF6E6','#D6BDFF','#FFB49B'],
  melody,danceNotes:[0,4,7,12,9,7,4,2,5,9,7,12].map(tone),
  music:{bpm:tempos[i],timbre:i%3===1?'sine':'triangle',bass:[0,5,7,4].map(n=>tone(n)/2),sparkle:i%2?2:1},
  surprises:[
   {id:`${character.id}-object-1`,artwork:picoSprite(character.id,6),motion:i%2?'snow':'orbit',count:5},
   {id:`${character.id}-object-2`,artwork:picoSprite(character.id,7),motion:i%2?'orbit':'snow',count:5},
  ],
 };
 return [character.id,theme];
})) as Record<PicoThemeId,ThemeDefinition>;
