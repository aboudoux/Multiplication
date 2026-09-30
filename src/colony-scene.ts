let sceneId=0;

const worker=(x:number,y:number,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><g stroke="#493523" stroke-width="3" stroke-linecap="round"><path d="m-8 4-8 8m8-4-10 12m21-16 9 8m-9-4 11 12M-3-16l-4-9m10 9 5-9"/></g><ellipse cx="0" cy="8" rx="10" ry="13" fill="#73513b"/><ellipse cy="-3" rx="8" ry="10" fill="#a87649"/><circle cy="-15" r="12" fill="#b98151"/><path d="M-13-20q13-19 26 0v4h-26Z" fill="#f5c85d"/><circle cx="-4" cy="-13" r="2" fill="#2e3025"/><circle cx="5" cy="-13" r="2" fill="#2e3025"/><path d="M-4-7q4 4 8 0" fill="none" stroke="#513425" stroke-width="2"/></g>`;
const room=(index:number,x:number,y:number,art:string,built:number)=>`<g class="colony-construction construction-${index} ${built>=index?'is-built':'is-planned'}" transform="translate(${x} ${y})"><rect class="room-wall" x="-115" y="-63" width="230" height="133" rx="42" fill="#7b533a" stroke="#d7a673" stroke-width="9"/><rect x="-104" y="-52" width="208" height="108" rx="33" fill="#fff0c6"/><path d="M-92 44h184" stroke="#d6b27b" stroke-width="8" stroke-linecap="round"/>${art}</g>`;

/** A scalable cutaway village, whose furnished rooms are tied to completed clicks. */
export function colonyScene(built:number,stars=0): string {
  const id=`colony-${++sceneId}`;
  const pantry=`<g fill="#b88044" stroke="#8b633c" stroke-width="3"><path d="M-85-25h170v8H-85Zm0 38h170v8H-85Z"/><path d="M-77-35v80m154-80v80"/></g>${[-59,-20,24,64].map((x,i)=>`<g transform="translate(${x} -34)"><rect x="-14" y="-12" width="28" height="27" rx="6" fill="${['#c0784f','#9ba354','#e4b758','#dc9572'][i]}"/><path d="M-13-12h26" stroke="#715536" stroke-width="5"/><ellipse cy="0" rx="5" ry="7" fill="#fff0bc"/></g>`).join('')}<path d="M-66 14q-6-18 12-18t12 18m45 0q-6-21 13-21t13 21" fill="#d8b363"/><circle cx="67" cy="0" r="13" fill="#aa6844"/>${worker(-13,22,.55)}`;
  const dorm=`${[-55,52].map(x=>`<g transform="translate(${x} 0)"><path d="M-39 31v-58m78 58v-58M-37 20h74" stroke="#9b6d43" stroke-width="6" stroke-linecap="round"/><rect x="-35" y="-19" width="70" height="30" rx="9" fill="#a9c9b1"/><rect x="-30" y="-16" width="20" height="14" rx="6" fill="#fff7df"/><path d="M-3-18h36v28H-3" fill="#749c98"/><path d="m10-10 9 7m-9 8 9-8" stroke="#d9eee0" stroke-width="2"/></g>`).join('')}<path d="M-9-35q9-13 18 0" stroke="#e2b74e" stroke-width="4" fill="none"/><circle cy="-31" r="6" fill="#f8d66c"/>`;
  const garden=`<path d="M-95 27h190v20H-95Z" fill="#8d6040"/>${[-65,-22,22,66].map((x,i)=>`<g transform="translate(${x} 10)"><path d="M0 24V-25" stroke="#5c8850" stroke-width="4"/><path d="M0 4q-32-24-28 0 20 13 28 0m0-12q30-24 26 0-17 13-26 0" fill="#8db36b"/><circle cy="-25" r="11" fill="${i%2?'#e29a88':'#e7bd59'}"/><circle cy="-25" r="4" fill="#fff1b2"/></g>`).join('')}<path d="M-110 24h220" stroke="#c39b62" stroke-width="5"/>`;
  const party=`<path d="M-94-28Q0 4 94-28" stroke="#91754b" stroke-width="2" fill="none"/>${[-75,-45,-15,15,45,75].map((x,i)=>`<path d="m${x} ${-13-Math.abs(x)/5} 16 2-7 16Z" fill="${['#d99980','#89b99a','#e5bd5e'][i%3]}"/>`).join('')}<ellipse cy="30" rx="85" ry="17" fill="#dabb83"/><path d="M-39 32v-24h78v24" stroke="#a8774e" stroke-width="5" fill="#d6a77a"/><rect x="-25" y="-15" width="50" height="23" rx="6" fill="#fff5db"/><path d="M-24-2h48" stroke="#e09d83" stroke-width="5"/><path d="M-11-15v-10m23 10v-10" stroke="#dcba59" stroke-width="4"/>${worker(-70,20,.55)}${worker(74,20,.55)}`;
  return `<svg class="camp-landscape colony-cutaway" viewBox="0 0 900 660" role="img" aria-label="Fourmilière : ${built} constructions terminées${stars?`, ${stars} étoiles`:''}">
  <defs>
    <linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="#b4d9dc"/><stop offset="1" stop-color="#e9edd0"/></linearGradient>
    <linearGradient id="${id}-soil" x2="0" y2="1"><stop stop-color="#b98a60"/><stop offset="1" stop-color="#73513b"/></linearGradient>
    <linearGradient id="${id}-hill" x2="1" y2="1"><stop stop-color="#c8a46f"/><stop offset="1" stop-color="#9d7552"/></linearGradient>
    <pattern id="${id}-grain" width="57" height="43" patternUnits="userSpaceOnUse"><circle cx="12" cy="14" r="2" fill="#f7d9a6" opacity=".18"/><path d="m34 30 8 2" stroke="#533f33" stroke-width="2" opacity=".18"/></pattern>
  </defs>
  <rect width="900" height="660" rx="30" fill="url(#${id}-sky)"/>
  <circle cx="751" cy="73" r="39" fill="#fff1b2"/><circle cx="751" cy="73" r="53" fill="#fff1b2" opacity=".2"/>
  <g fill="#fffdf0" opacity=".7"><path d="M66 73q15-21 32-5 8-27 31-11 24-8 29 16Z"/><path d="M573 57q8-16 26-10 13-19 29 2 23-3 27 8Z"/></g>
  <path d="M0 175Q100 89 226 169T485 147T900 171v116H0Z" fill="#8eb3a0"/>
  <path d="M0 219q129-85 244 0t257-12 399 16v70H0Z" fill="#668d70"/>
  <g transform="translate(72 183)"><path d="M0 58 8-46" stroke="#977353" stroke-width="13"/><path d="M9-18q-48-74-61-16 4 47 61 16m-4-25q16-69 51-32 23 38-51 32" fill="#4e8268"/><path d="M6-29q-40-50-42-21 1 29 42 21" fill="#a1bd78"/></g>
  <path d="M271 255q39-123 183-123t175 123" fill="url(#${id}-hill)" stroke="#cbae7d" stroke-width="5"/>
  <path d="M315 190q28-43 80-46" stroke="#e3c28c" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M0 265Q190 237 323 263t260-2 317 8v391H0Z" fill="url(#${id}-soil)"/>
  <path d="M0 265Q190 237 323 263t260-2 317 8" fill="none" stroke="#bcd097" stroke-width="19"/>
  <path d="M0 280Q190 252 323 278t260-2 317 8" fill="none" stroke="#e0c797" stroke-width="5"/>
  <path d="M450 244v342m-4-245H265m180 0h184m-364 0v173m365-173v173m-365 0h365" fill="none" stroke="#5d4333" stroke-width="36" stroke-linecap="round"/>
  <path d="M450 244v342m-4-245H265m180 0h184m-364 0v173m365-173v173m-365 0h365" fill="none" stroke="#d3ac7a" stroke-width="22" stroke-linecap="round"/>
  <rect y="285" width="900" height="375" fill="url(#${id}-grain)"/>
  <g class="colony-construction construction-1 ${built>=1?'is-built':'is-planned'}"><path d="M95 258q77-50 156-7" stroke="#7a573b" stroke-width="11" fill="none"/><path d="M95 244q77-50 156-7" stroke="#efd1a0" stroke-width="5" fill="none"/>${[100,128,158,189,220,247].map((x,i)=>`<path d="M${x} ${i===0||i===5?230:218}v38" stroke="#9a704a" stroke-width="5"/><path d="m${x-7} ${i===0||i===5?258:248} 15-4" stroke="#c69e68" stroke-width="9"/>`).join('')}<path d="M110 225q64-33 127-4" stroke="#ad926a" stroke-width="3" fill="none"/>${worker(176,213,.6)}</g>
  <path d="M420 257v-18q0-38 31-38t31 38v18" fill="#493e2e"/><path d="M417 259v-20q0-43 34-43t34 43v20" stroke="#d4b27c" stroke-width="9" fill="none"/>
  <path d="M433 236v-16h36v16" fill="#f7d783" opacity=".75"/>
  ${room(2,264,353,pantry,built)}${room(3,638,353,dorm,built)}
  ${room(4,264,527,garden,built)}${room(6,638,527,party,built)}
  <g class="colony-construction construction-5 ${built>=5?'is-built':'is-planned'}" transform="translate(567 136)"><path d="M-30 9v-86m60 86v-86m-60 34h60m-60 26h60" stroke="#8c6645" stroke-width="8"/><path d="M-43-70h86v-28h-86Z" fill="#efd6a5" stroke="#9d7750" stroke-width="4"/><path d="m-51-97 51-32 51 32Z" fill="#739d7b" stroke="#4c7e65" stroke-width="3"/><path d="M-19-87h38" stroke="#8aa791" stroke-width="10"/><path d="M-44-69h88" stroke="#bf9460" stroke-width="7"/>${worker(1,-88,.43)}</g>
  <g transform="translate(819 190)"><path d="M0 72V-42" stroke="#806144" stroke-width="6"/><path d="M3-40h47l-10 18 10 18H3Z" fill="#efc665"/><text x="22" y="-14" fill="#715635" text-anchor="middle" font-size="14">${stars?'★'+stars:'⚑'}</text></g>
  <g fill="#d99b80"><path d="M741 246q-9-30 12-30t12 30Z"/><path d="M768 254q-8-24 8-24t9 24Z"/></g><g fill="#fff0bf"><circle cx="749" cy="230" r="3"/><circle cx="758" cy="236" r="3"/><circle cx="775" cy="241" r="2"/></g>
  <g stroke="#a8bf83" stroke-width="3" stroke-linecap="round"><path d="m690 254 7-18m-7 18-10-13m-651-8-5-16m5 16 8-14m622 34 5-12m-5 12-6-11"/></g>
  ${worker(446,442,.5)}${worker(482,294,.5)}
  <g class="colony-sparkles" fill="#fff2b2"><path d="m105 128 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/><path d="m704 166 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/></g>
  </svg>`;
}
