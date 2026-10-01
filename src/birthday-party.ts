import { themes, type ThemeId } from './themes';

export const BIRTHDAY_DURATION_MS = 30_000;
export type BirthdayChapter = 'cake' | 'song' | 'candles' | 'gifts' | 'finished';
export function birthdayChapter(elapsed: number): BirthdayChapter {
  if (elapsed >= BIRTHDAY_DURATION_MS) return 'finished';
  if (elapsed >= 20_000) return 'gifts';
  if (elapsed >= 18_000) return 'candles';
  if (elapsed >= 5_500) return 'song';
  return 'cake';
}

const captions: Record<BirthdayChapter, string> = {
  cake: 'Le chaton attend sa surprise… Ziggy apporte le gâteau !',
  song: '♪ Joyeux anniversaire, joyeux anniversaire, petit chaton ! ♪',
  candles: 'Un grand souffle… et un vœu pour le chaton !',
  gifts: 'Bravo ! Le Père Noël a des cadeaux pour tout le monde !',
  finished: 'Quelle fête ! Merci d’avoir réuni tous les amis !',
};
const guests: {id: ThemeId; name: string; x: number; y: number; size: number}[] = [
  {id:'unicorn', name:'Licorne', x:275, y:421, size:185},
  {id:'halloween', name:'Citrouille', x:421, y:390, size:155},
  {id:'wizard', name:'Petit sorcier', x:785, y:392, size:185},
  {id:'dragon', name:'Dragon', x:966, y:435, size:208},
  {id:'star', name:'Étoile', x:1055, y:262, size:165},
  {id:'kitten', name:'Chaton', x:600, y:452, size:257},
  {id:'christmas', name:'Père Noël', x:132, y:505, size:212},
  {id:'alien', name:'Ziggy', x:800, y:531, size:181},
];
const arms: Partial<Record<ThemeId, [number,number,number,number,number,number]>> = {
  kitten:[73,60,17,78,34,144/169], unicorn:[60,58,15,76,34,122/149],
  alien:[31,60,90,60,40,126/185], christmas:[41,41,91,76,42,141/182],
  wizard:[35,52,82,76,42,141/171], dragon:[69,52,17,65,40,124/196],
};
function character(id: ThemeId, size: number): string {
  const arm = arms[id];
  if (!arm) {
    const vector = themes[id].home.replace(/class="[^"]*"/g, '').replace('<svg ', '<svg x="-90" y="-180" width="180" height="180" ');
    return `<g transform="scale(${size/180})">${vector}</g>`;
  }
  const [sx,sy,px,py,width,ratio] = arm;
  const x = (sx-width*px/100)/100*size-size/2;
  const y = (sy-width*ratio*py/100)/100*size-size;
  return `<image href="/themes/friend-parts-v1/${id}-body-v2.png" x="${-size/2}" y="${-size}" width="${size}" height="${size}"/>
    <g transform="translate(${sx/100*size-size/2} ${sy/100*size-size})"><g data-arm="${id}">
      <image href="/themes/friend-parts-v1/${id}-arm.png" x="${x-(sx/100*size-size/2)}" y="${y-(sy/100*size-size)}" width="${width/100*size}" height="${width*ratio/100*size}"/>
    </g></g>`;
}
function giftArt(color: string, ribbon: string): string {
  return `<rect x="-24" y="-25" width="48" height="45" rx="5" fill="${color}"/><rect x="-27" y="-28" width="54" height="12" rx="4" fill="${color}" stroke="#fff4dc" stroke-width="2"/><path d="M-4-28h8v48h-8Z" fill="${ribbon}"/><path d="M0-28C-38-59-26-2 0-28 38-59 26-2 0-28" fill="none" stroke="${ribbon}" stroke-width="6"/><path d="M-18-10v23" stroke="#fff" stroke-width="3" opacity=".3"/>`;
}
function sceneMarkup(): string {
  return `<svg class="birthday-film" viewBox="0 0 1200 700" role="img" aria-labelledby="birthday-svg-title birthday-svg-description">
    <title id="birthday-svg-title">L’anniversaire du chaton</title><desc id="birthday-svg-description">Les huit amis sont réunis autour de la table. Ziggy apporte un gâteau, les amis chantent, le chaton souffle ses cinq bougies et le Père Noël distribue des cadeaux sous les applaudissements.</desc>
    <defs>
      <linearGradient id="birthday-wall" x2="0" y2="1"><stop stop-color="#402657"/><stop offset="1" stop-color="#b06889"/></linearGradient>
      <linearGradient id="birthday-floor" x2="0" y2="1"><stop stop-color="#875b89"/><stop offset="1" stop-color="#493858"/></linearGradient>
      <radialGradient id="birthday-glow"><stop stop-color="#ffe6a4" stop-opacity=".7"/><stop offset="1" stop-color="#ffe6a4" stop-opacity="0"/></radialGradient>
      <linearGradient id="birthday-cake" x2="0" y2="1"><stop stop-color="#fff0c8"/><stop offset="1" stop-color="#ffc784"/></linearGradient>
      <linearGradient id="birthday-cloth" x2="0" y2="1"><stop stop-color="#f9a9a7"/><stop offset="1" stop-color="#d66c91"/></linearGradient>
      <filter id="birthday-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#291b40" flood-opacity=".24"/></filter>
      <symbol id="birthday-star" viewBox="0 0 30 30"><path d="m15 0 4 10 11 1-8 7 3 12-10-6-10 6 3-12-8-7 11-1Z" fill="currentColor"/></symbol>
    </defs>
    <g data-camera>
      <rect width="1200" height="700" fill="url(#birthday-wall)"/>
      <ellipse cx="600" cy="340" rx="510" ry="350" fill="url(#birthday-glow)"/>
      <rect y="519" width="1200" height="181" fill="url(#birthday-floor)"/><path d="M0 519h1200" stroke="#efb6ba" stroke-width="7"/>
      ${[90,310,530,750,970,1190].map(x=>`<path d="M${x} 530 ${600+(x-600)*1.8} 700" stroke="#f6cecf" stroke-opacity=".08" stroke-width="3"/>`).join('')}
      <g opacity=".75"><rect x="57" y="130" width="150" height="221" rx="72" fill="#252344" stroke="#ddadbd" stroke-width="12"/><path d="M132 134v207M59 244h146" stroke="#ddadbd" stroke-width="7"/><path d="M181 165a29 29 0 1 0 0 55 26 26 0 0 1 0-55" fill="#fff0ba"/>${[[89,180],[166,217],[95,288],[169,316]].map(([x,y])=>`<path d="M${x-4} ${y}h8m-4-4v8" stroke="#e9d8ff" stroke-width="2"/>`).join('')}</g>
      <path d="M0 44Q600 222 1200 44" fill="none" stroke="#ffe6ae" stroke-width="3"/>
      ${Array.from({length:17},(_,i)=>{const x=30+i*71,y=44+174*(x/1200)*(1-x/1200);return `<path d="m${x} ${y} 42 7-24 47Z" fill="${['#ffbc77','#efa7d0','#99d9d4','#c3b4ee'][i%4]}"/><circle cx="${x}" cy="${y}" r="4" fill="#fff5c4"/>`;}).join('')}
      <path d="M0 10Q600 100 1200 10" stroke="#7f5773" stroke-width="3" fill="none"/>
      ${Array.from({length:25},(_,i)=>`<circle data-fairy-light cx="${i*50}" cy="${10+90*(i/24)*(1-i/24)}" r="5" fill="#fff4bd"/>`).join('')}
      <g font-family="Kalam, cursive" text-anchor="middle"><text x="600" y="174" fill="#ffeabb" font-size="43" font-weight="700">Joyeux anniversaire !</text><text x="600" y="204" fill="#ffe3ef" font-size="17" letter-spacing="5">UNE FÊTE POUR NOTRE CHATON</text></g>
      ${[[40,400,'#e6a0c9'],[1135,315,'#f9ca76'],[1180,405,'#9edddd'],[45,510,'#acbbee']].map(([x,y,c],i)=>`<g data-balloon="${i}"><path d="M${x} ${y}q-25 60 5 120t-5 70" fill="none" stroke="#e7c3cc" stroke-width="2"/><ellipse cx="${x}" cy="${Number(y)-45}" rx="33" ry="44" fill="${c}"/><ellipse cx="${Number(x)-10}" cy="${Number(y)-60}" rx="7" ry="15" fill="#fff" opacity=".35"/><path d="m${x} ${Number(y)-3}-6 10h12Z" fill="${c}"/></g>`).join('')}
      <ellipse cx="600" cy="615" rx="465" ry="43" fill="#291b40" opacity=".2"/>
      ${guests.filter(g=>g.id!=='alien').map(g=>`<g data-character="${g.id}" aria-label="${g.name}" transform="translate(${g.x} ${g.y})"><g data-pose="${g.id}" filter="url(#birthday-shadow)">${character(g.id,g.size)}</g></g>`).join('')}
      <g data-singing-notes fill="#ffe9a9" font-family="sans-serif" font-size="38">${[275,421,785,970,1070,132].map((x,i)=>`<text data-note="${i}" x="${x}" y="${i===4?100:245}">${i%2?'♫':'♪'}</text>`).join('')}</g>
      <g filter="url(#birthday-shadow)"><path d="m247 490-15 148h31l28-140m-28-3h43l-15 135h-31m629-140 16 148h-31l-27-140m27-3h-43l15 135h31" fill="#664560"/>
        <path d="M165 470v82q24 47 64 6 37 48 75 3 37 46 76 3 37 46 76 3 37 46 76 3 37 46 76 0 37 46 76-3 37 46 76-3 37 46 76-3 37 46 76-3 37 46 76-3 35 38 65-6v-78Z" fill="url(#birthday-cloth)"/>
        <ellipse cx="600" cy="474" rx="443" ry="62" fill="#ffdfb5" stroke="#fff0d5" stroke-width="6"/>
        <ellipse cx="600" cy="474" rx="399" ry="47" fill="none" stroke="#e8b78f" stroke-width="2"/>
        ${[220,347,858,986].map(x=>`<ellipse cx="${x}" cy="470" rx="36" ry="12" fill="#fff1e1" stroke="#dbc4d3" stroke-width="3"/><path d="m${x-46} 464 2 24m${x+45} 0 2-26" stroke="#ad7995" stroke-width="3" stroke-linecap="round"/>`).join('')}
        ${[275,910].map(x=>`<g transform="translate(${x} 448)"><path d="M-13-32h26l-3 35h-20Z" fill="#e6e0fd" stroke="#fff8ef" stroke-width="3"/><path d="M-10-16h20L7 0H-7Z" fill="#ee8eaa"/></g>`).join('')}
        ${[245,355,465,575,685,795,905].map(x=>`<use href="#birthday-star" x="${x}" y="540" width="19" height="19" color="#ffe1b9" opacity=".65"/>`).join('')}
      </g>
      <g data-character="alien" aria-label="Ziggy" transform="translate(1550 495)"><g data-pose="alien" filter="url(#birthday-shadow)">${character('alien',181)}</g></g>
      <g data-cake transform="translate(1390 438)" filter="url(#birthday-shadow)">
        <ellipse cx="0" cy="33" rx="123" ry="22" fill="#c1a3d7"/><ellipse cx="0" cy="26" rx="116" ry="18" fill="#fff4e5"/>
        <path d="M-96-41v60c0 29 192 29 192 0v-60Z" fill="url(#birthday-cake)"/>
        <path d="M-94-6q94 31 188 0v14q-94 34-188 0Z" fill="#e97eaa"/>
        <ellipse cy="-41" rx="96" ry="25" fill="#f7a9bd"/>
        <path d="M-96-43v24q10 15 17 0v-7q9-9 15 7v18q13 16 19 0v-20q13-7 19 8v14q12 19 20 0v-11q10-11 20 0v5q11 18 20 0v-15q12-7 21 6v18q12 11 18-5v-21q13-12 23-2v-19Z" fill="#fff3dc"/>
        <path d="M-58-87v38q0 26 116 0v-38Z" fill="#ffc989"/><ellipse cy="-87" rx="58" ry="18" fill="#fff3dc"/>
        <path d="M-57-82v14q8 13 16 0v-2q10-8 17 7v6q10 10 17-4v-9q10-5 19 4v10q11 10 18-3v-12q11-9 27-2v-13" fill="#ef92b4"/>
        ${[-72,-40,0,40,72].map(x=>`<path d="m${x-6}-48q6-19 12 0Z" fill="#e94f79"/><path d="m${x}-56 3-6" stroke="#82b67c" stroke-width="3"/>`).join('')}
        ${[-43,-21,0,21,43].map((x,i)=>`<g data-candle="${i}" transform="translate(${x} ${-89+(Math.abs(x)>25?4:0)})"><rect x="-4" y="-35" width="8" height="36" rx="3" fill="${['#92dce2','#eeb0d6','#b6a3ee'][i%3]}"/><path d="m-3-29 6 4m-6 5 6 4m-6 5 6 4" stroke="#fff" stroke-width="2"/><path d="M0-35v-4" stroke="#76516b" stroke-width="2"/><g data-flame="${i}"><path d="M0-64q-15 18-5 24t5-24" fill="#ffb14c"/><path d="M0-52q-7 10-2 13t2-13" fill="#fff0a7"/></g><path data-smoke="${i}" d="M0-38q-12-10 1-19t-2-21" fill="none" stroke="#fff4ed" stroke-width="4" stroke-linecap="round" opacity="0"/></g>`).join('')}
      </g>
      <g data-blow opacity="0" stroke="#e8fbff" fill="none" stroke-width="4" stroke-linecap="round"><path d="M588 322q13 12 22 35m-8-34q18 4 28 25m-54-6q12 8 20 24"/></g>
      <g data-santa-sack transform="translate(125 568)"><path d="M-40-15q-44 66-3 82h77q45-29 4-82Z" fill="#c75581" stroke="#f0a4be" stroke-width="3"/><path d="m-32-16-8-31 35 12 38-12-8 32Z" fill="#eb8ba6"/><path d="M-38-13h72" stroke="#ffda9e" stroke-width="7"/><use href="#birthday-star" x="-13" y="10" width="30" height="30" color="#ffd486"/></g>
      <g data-gifts>${Array.from({length:24},(_,i)=>`<g data-gift="${i}" opacity="0">${giftArt(['#ed83ad','#95d8d4','#b8a3ed','#f6be70'][i%4],['#ffe6aa','#fff0db','#edb4d9'][i%3])}</g>`).join('')}</g>
      <g data-confetti>${Array.from({length:65},(_,i)=>`<rect data-confetti-piece="${i}" x="-4" y="-8" width="${i%3===0?5:9}" height="13" rx="2" fill="${['#ffc67e','#efa5d1','#a2e1da','#d1c1fa','#fff1bd'][i%5]}" opacity="0"/>`).join('')}</g>
      <g data-applause opacity="0" font-family="Kalam, cursive" text-anchor="middle" fill="#fff1c6"><text x="600" y="288" font-size="44" font-weight="700">Bravo, petit chaton !</text></g>
      <g data-finale opacity="0"><rect x="342" y="607" width="516" height="60" rx="30" fill="#fff0c7"/><text x="600" y="648" text-anchor="middle" fill="#754b78" font-family="Kalam, cursive" font-size="30" font-weight="700">Huit amis, mille mercis ! ♡</text></g>
    </g>
  </svg>`;
}

const ease = (v: number) => { const t=Math.max(0,Math.min(1,v)); return t*t*(3-2*t); };
const opacity = (el: Element | null, value: number) => el?.setAttribute('opacity',String(value));
const transform = (el: Element | null, value: string) => el?.setAttribute('transform',value);

/** One scrubbed SVG timeline; its clock and bundled soundtrack pause together. */
export class BirthdayParty {
  readonly root = document.createElement('section');
  active = false;
  private elapsed = 0;
  private anchor: number | null = null;
  private userPaused = false;
  private background = false;
  private chapter: BirthdayChapter | null = null;
  private readonly soundtrack = new Audio('/audio/birthday-party.mp3');
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly nodes = new Map<string, Element>();
  private readonly caption: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly progress: HTMLElement;
  private readonly time: HTMLElement;

  constructor(host: HTMLElement, private readonly returnToMap: () => void) {
    this.root.id='birthday-party'; this.root.className='birthday-party'; this.root.hidden=true;
    this.root.setAttribute('aria-label','La fête d’anniversaire du chaton');
    this.root.innerHTML=`<div class="birthday-heading"><div><span class="eyebrow">LE GRAND FINAL DE L’AVENTURE</span><h2 tabindex="-1">La fête du chaton</h2></div><span class="birthday-duration">Un petit film de 30 secondes</span></div>
      <div class="birthday-cinema">${sceneMarkup()}<span class="birthday-cinema-tag" aria-hidden="true">CALCUL’PARTY · LES HUIT AMIS</span></div>
      <p class="birthday-caption" role="status" aria-live="polite"></p><p class="birthday-audio-notice" role="status" hidden>Le son n’a pas pu démarrer. Tu peux revoir la fête pour réessayer.</p>
      <div class="birthday-controls"><button class="secondary-button birthday-pause" type="button" aria-label="Mettre la fête en pause">Ⅱ Pause</button><div class="birthday-playback"><div class="birthday-progress" role="progressbar" aria-label="Avancement du film" aria-valuemin="0" aria-valuemax="30" aria-valuenow="0"><span></span></div><span class="birthday-time">0:00 / 0:30</span></div><button class="play-button birthday-replay" type="button">↻ Revoir la fête</button><button class="secondary-button birthday-back" type="button">← La carte</button></div>`;
    host.append(this.root);
    this.root.querySelectorAll('[data-camera], [data-character], [data-pose], [data-arm], [data-note], [data-flame], [data-smoke], [data-cake], [data-blow], [data-gift], [data-confetti-piece], [data-applause], [data-finale], [data-balloon], [data-fairy-light]').forEach(el=>{
      const attr=el.getAttributeNames().find(a=>a.startsWith('data-'))!;
      this.nodes.set(`${attr}:${el.getAttribute(attr)}`,el);
    });
    this.caption=this.root.querySelector('.birthday-caption')!;
    this.pauseButton=this.root.querySelector('.birthday-pause')!;
    this.progress=this.root.querySelector('.birthday-progress')!;
    this.time=this.root.querySelector('.birthday-time')!;
    this.soundtrack.preload='auto';
    this.pauseButton.addEventListener('click',()=>{
      this.capture(performance.now()); this.userPaused=!this.userPaused; this.resume(performance.now());
    });
    this.root.querySelector('.birthday-replay')!.addEventListener('click',()=>this.start(this.soundtrack.muted));
    this.root.querySelector('.birthday-back')!.addEventListener('click',()=>{this.close();this.returnToMap();});
  }
  private node(key: string, value: string | number = '') { return this.nodes.get(`data-${key}:${value}`) ?? null; }
  private capture(now: number): void {
    if (this.anchor !== null) this.elapsed=Math.min(BIRTHDAY_DURATION_MS,this.elapsed+Math.max(0,now-this.anchor));
    this.anchor=null; this.soundtrack.pause();
  }
  private resume(now: number): void {
    this.pauseButton.textContent=this.userPaused?'▶ Continuer':'Ⅱ Pause';
    this.pauseButton.setAttribute('aria-label',this.userPaused?'Continuer la fête':'Mettre la fête en pause');
    this.root.dataset.paused=String(this.userPaused || this.background);
    if (!this.active || this.userPaused || this.background || this.elapsed>=BIRTHDAY_DURATION_MS) return;
    this.anchor=now;
    this.soundtrack.currentTime=this.elapsed/1000;
    const notice=this.root.querySelector<HTMLElement>('.birthday-audio-notice')!;
    void this.soundtrack.play().then(()=>{notice.hidden=true;}).catch(()=>{if(this.active && !this.soundtrack.muted)notice.hidden=false;});
  }
  start(muted: boolean): void {
    this.capture(performance.now()); this.active=true; this.elapsed=0; this.userPaused=false;
    this.background=document.hidden; this.chapter=null; this.soundtrack.muted=muted;
    this.root.hidden=false; this.pauseButton.hidden=false;
    this.root.querySelector<HTMLElement>('.birthday-audio-notice')!.hidden=true;
    this.resume(performance.now());this.update(performance.now());
    this.root.querySelector<HTMLElement>('h2')!.focus({preventScroll:true});
  }
  close(): void { this.capture(performance.now());this.active=false;this.root.hidden=true;this.soundtrack.currentTime=0; }
  setMuted(muted: boolean): void {this.soundtrack.muted=muted;}
  setBackground(hidden: boolean): void {
    if (!this.active || this.background===hidden) return;
    this.capture(performance.now());this.background=hidden;this.resume(performance.now());
  }
  update(now: number): void {
    if (!this.active || this.chapter==='finished') return;
    const ms=Math.min(BIRTHDAY_DURATION_MS,this.elapsed+(this.anchor===null?0:Math.max(0,now-this.anchor)));
    const t=ms/1000, chapter=birthdayChapter(ms), reduced=this.reduced.matches;
    if (chapter!==this.chapter) {
      this.chapter=chapter;this.root.dataset.chapter=chapter;this.caption.textContent=captions[chapter];
    }
    this.progress.setAttribute('aria-valuenow',String(Math.floor(t)));
    this.progress.firstElementChild!.setAttribute('style',`width:${t/30*100}%`);
    this.time.textContent=`0:${String(Math.floor(t)).padStart(2,'0')} / 0:30`;
    const singing=t>=5.5 && t<18, clapping=t>=20 && t<30;
    this.root.dataset.candles=t<18.75?'lit':'out';
    this.root.dataset.singing=String(singing);
    const zoom=reduced?1:1+.013*Math.sin(t/30*Math.PI);
    transform(this.node('camera'),`translate(${600*(1-zoom)} ${350*(1-zoom)}) scale(${zoom})`);
    for (const [i,g] of guests.entries()) {
      let x=g.x, y=g.y, rotation=0;
      if (g.id==='alien') {
        x=1550-620*ease((t-.5)/3.8);y=495;
        if(t>=4.8) {x=930+160*ease((t-4.8)/1.8);y=495+78*ease((t-4.8)/1.8);}
      }
      if (g.id==='christmas' && t>=21) x=132+75*ease((t-21)/2);
      if (!reduced) {
        const rhythm=Math.sin(t*(clapping?13:singing?6.5:2.3)+i*.7);
        y-=Math.abs(rhythm)*(clapping?8:singing?4:1.8);
        rotation=rhythm*(clapping?4:singing?2.4:1);
        if(g.id==='star')y+=Math.sin(t*2)*9;
      }
      if(g.id==='kitten' && t>=18 && t<20) {y+=12*ease((t-18)/.4)*(1-ease((t-19)/.5));rotation=0;}
      transform(this.node('character',g.id),`translate(${x} ${y})`);
      transform(this.node('pose',g.id),`rotate(${rotation} 0 ${-g.size*.4})`);
      const armAngle=reduced?0:clapping?Math.sin(t*16+i)*23:singing?Math.sin(t*6.5+i)*12:g.id==='alien' && t<5.2?-28:g.id==='christmas' && t>22?Math.sin(t*8)*35:Math.sin(t*2+i)*5;
      transform(this.node('arm',g.id),`rotate(${armAngle})`);
    }
    let cakeX=1390-620*ease((t-.5)/3.8),cakeY=438;
    if(t>=4.3) {cakeX=770-170*ease((t-4.3)/1.2);cakeY=438+12*ease((t-4.3)/1.2);}
    transform(this.node('cake'),`translate(${cakeX} ${cakeY}) scale(.88)`);
    for(let i=0;i<5;i++) {
      const blown=ease((t-18.35-i*.08)/.18);
      opacity(this.node('flame',i),1-blown);
      transform(this.node('flame',i),reduced?'':`rotate(${Math.sin(t*13+i)*5} 0 -38)`);
      opacity(this.node('smoke',i),blown*(1-ease((t-19.2)/1)));
      transform(this.node('smoke',i),`translate(${(t-18.4)*8} ${-Math.max(0,t-18.4)*11})`);
    }
    opacity(this.node('blow'),t>=18.25 && t<19.1?Math.sin((t-18.25)/.85*Math.PI):0);
    for(let i=0;i<6;i++) {
      opacity(this.node('note',i),singing?.55+.4*Math.sin(t*4+i)**2:0);
      transform(this.node('note',i),reduced?'':`translate(${Math.sin(t*2+i)*12} ${-Math.sin(t*3+i)*13}) rotate(${Math.sin(t*3+i)*8} ${[275,421,785,970,1070,132][i]} 220)`);
    }
    for(let i=0;i<24;i++) {
      const start=21.1+i*.23, flight=Math.max(0,Math.min(1,(t-start)/1.25)), destination=270+(i*127)%805;
      const x=207+(destination-207)*flight, y=515+(609+(i%3)*15-515)*flight-230*Math.sin(flight*Math.PI);
      opacity(this.node('gift',i),t>=start?1:0);
      transform(this.node('gift',i),`translate(${x} ${y}) rotate(${reduced?0:flight<1?flight*300-20:(i%5-2)*9}) scale(${.75+(i%3)*.12})`);
    }
    for(let i=0;i<65;i++) {
      const age=t-20.1-(i%13)*.13, visible=age>=0 && t<29.5;
      const fall=reduced?1:((Math.max(0,age)*130+i*97)%790)/790;
      opacity(this.node('confetti-piece',i),visible?(1-ease((t-28.4)/1.1))*.85:0);
      transform(this.node('confetti-piece',i),`translate(${(i*193)%1200+(!reduced?Math.sin(age*2+i)*25:0)} ${reduced?90+(i*63)%500:-40+fall*790}) rotate(${reduced?i*23:age*95+i*19})`);
    }
    opacity(this.node('applause'),ease((t-20)/.5)*(1-ease((t-24.8)/.7)));
    opacity(this.node('finale'),ease((t-27.2)/1));
    for(let i=0;i<4;i++) transform(this.node('balloon',i),reduced?'':`translate(${Math.sin(t*1.4+i)*5} ${Math.cos(t*1.3+i)*4})`);
    if(ms===BIRTHDAY_DURATION_MS && this.anchor!==null) {
      this.capture(now);this.pauseButton.hidden=true;
      this.root.querySelector<HTMLButtonElement>('.birthday-replay')!.focus({preventScroll:true});
    }
  }
}
