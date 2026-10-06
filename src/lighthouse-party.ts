import { picoCast, picoSprite } from './pico-content';
import { picoProps } from './pico-art';
export const LIGHTHOUSE_DURATION_MS=30_000;
export type LighthouseChapter='arrival'|'assembly'|'light'|'boats'|'finished';
export function lighthouseChapter(ms:number):LighthouseChapter {
 if(ms>=30000)return 'finished';if(ms>=22000)return 'boats';if(ms>=17000)return 'light';if(ms>=7000)return 'assembly';return 'arrival';
}
const captions:Record<LighthouseChapter,string>={
 arrival:'Après la tempête, les huit amis se retrouvent au phare.',
 assembly:'Perle, voiles, circuit, charpente, mécanisme, énergie et prisme : chacun apporte son talent !',
 light:'Pico et Alba rallument la lumière de l’archipel !',
 boats:'Les bateaux retrouvent leur chemin. Bravo à tout l’équipage !',
 finished:'Huit compagnons, un phare qui brille : merci pour cette aventure !',
};
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
export class LighthouseParty {
 readonly root=document.createElement('section');active=false;
 private elapsed=0;private anchor:number|null=null;private userPaused=false;private background=false;
 private chapter:LighthouseChapter|null=null;
 private readonly soundtrack=new Audio('/audio/pico-finale.wav');
 private readonly reduced=matchMedia('(prefers-reduced-motion: reduce)');
 private readonly caption:HTMLElement;private readonly pauseButton:HTMLButtonElement;
 private readonly progress:HTMLElement;private readonly time:HTMLElement;
 constructor(host:HTMLElement,private readonly returnToMap:()=>void){
  this.root.id='lighthouse-party';this.root.className='birthday-party';this.root.hidden=true;
  this.root.setAttribute('aria-label','Le phare des îles');
  this.root.innerHTML=`<div class="birthday-heading"><div><span class="eyebrow">LE GRAND FINAL DE L’AVENTURE</span><h2 tabindex="-1">Le phare brille à nouveau !</h2></div><span class="birthday-duration">Un petit film de 30 secondes</span></div>
  <div class="lighthouse-cinema" role="img" aria-label="Les huit compagnons réparent le phare. Les bateaux passent sous leurs applaudissements.">
   <div class="lighthouse-island"></div><div class="lighthouse-tower">${picoProps.lighthouse}</div><div class="lighthouse-beam">${picoProps.beam}</div>
   ${picoCast.map((c,i)=>`<div class="lighthouse-friend" data-character="${c.id}" aria-label="${c.name}" style="--cast:${i}">${picoSprite(c.id,4)}</div>`).join('')}
   ${picoCast.slice(1).map((c,i)=>`<div class="lighthouse-element" data-contribution="${c.id}" aria-label="${c.contribution}" style="--cast:${i}">${c.id==='mistral'?picoProps.sail:c.id==='octave'?picoProps.circuit:c.id==='brico'?picoProps.frame:c.id==='corail'?picoProps.gear:picoSprite(c.id,c.id==='nami'?7:6)}</div>`).join('')}
   ${[0,1,2].map(i=>`<div class="lighthouse-boat" data-boat="${i}">${picoProps.boat}</div>`).join('')}
   <div class="lighthouse-applause">Bravo, les amis ! ♫</div>
  </div><p class="birthday-caption lighthouse-caption" role="status" aria-live="polite"></p><p class="lighthouse-audio-notice" role="status" hidden>Le son n’a pas pu démarrer. Revois le film pour réessayer.</p>
  <div class="birthday-controls"><button class="secondary-button lighthouse-pause" type="button">Ⅱ Pause</button><div class="birthday-playback"><div class="birthday-progress lighthouse-progress" role="progressbar" aria-label="Avancement du film" aria-valuemin="0" aria-valuemax="30" aria-valuenow="0"><span></span></div><span class="birthday-time lighthouse-time">0:00 / 0:30</span></div><button class="play-button lighthouse-replay" type="button">↻ Revoir le film</button><button class="secondary-button lighthouse-back" type="button">← La carte</button></div>`;
  host.append(this.root);this.caption=this.root.querySelector('.lighthouse-caption')!;this.pauseButton=this.root.querySelector('.lighthouse-pause')!;
  this.progress=this.root.querySelector('.lighthouse-progress')!;this.time=this.root.querySelector('.lighthouse-time')!;
  this.soundtrack.preload='auto';
  for(const c of picoCast){const img=new Image();img.src=`${import.meta.env.BASE_URL}themes/keypad-${c.id}.png`;void img.decode().catch(()=>{});}
  this.pauseButton.addEventListener('click',()=>{this.capture(performance.now());this.userPaused=!this.userPaused;this.resume(performance.now());});
  this.root.querySelector('.lighthouse-replay')!.addEventListener('click',()=>this.start(this.soundtrack.muted));
  this.root.querySelector('.lighthouse-back')!.addEventListener('click',()=>{this.close();this.returnToMap();});
 }
  private capture(now: number): void {
    if (this.anchor !== null) this.elapsed=Math.min(LIGHTHOUSE_DURATION_MS,this.elapsed+Math.max(0,now-this.anchor));
    this.anchor=null; this.soundtrack.pause();
  }
  private resume(now: number): void {
    this.pauseButton.textContent=this.userPaused?'▶ Continuer':'Ⅱ Pause';
    this.pauseButton.setAttribute('aria-label',this.userPaused?'Continuer le film':'Mettre le film en pause');
    this.root.dataset.paused=String(this.userPaused || this.background);
    if (!this.active || this.userPaused || this.background || this.elapsed>=LIGHTHOUSE_DURATION_MS) return;
    this.anchor=now;
    this.soundtrack.currentTime=this.elapsed/1000;
    const notice=this.root.querySelector<HTMLElement>('.lighthouse-audio-notice')!;
    void this.soundtrack.play().then(()=>{notice.hidden=true;}).catch(()=>{if(this.active && !this.soundtrack.muted)notice.hidden=false;});
  }
  start(muted: boolean): void {
    this.capture(performance.now()); this.active=true; this.elapsed=0; this.userPaused=false;
    this.background=document.hidden; this.chapter=null; this.soundtrack.muted=muted;
    this.root.hidden=false; this.pauseButton.hidden=false;
    this.root.querySelector<HTMLElement>('.lighthouse-audio-notice')!.hidden=true;
    this.resume(performance.now());this.update(performance.now());
    this.root.querySelector<HTMLElement>('h2')!.focus({preventScroll:true});
  }
  close(): void { this.capture(performance.now());this.active=false;this.root.hidden=true;this.soundtrack.currentTime=0; }
  setMuted(muted: boolean): void {this.soundtrack.muted=muted;}
  setBackground(hidden: boolean): void {
    if (!this.active || this.background===hidden) return;
    this.capture(performance.now());this.background=hidden;this.resume(performance.now());
  }
 update(now:number):void {
  if(!this.active||this.chapter==='finished')return;
  const ms=Math.min(LIGHTHOUSE_DURATION_MS,this.elapsed+(this.anchor===null?0:Math.max(0,now-this.anchor)));
  const t=ms/1000, chapter=lighthouseChapter(ms),reduced=this.reduced.matches;
  if(chapter!==this.chapter){this.chapter=chapter;this.root.dataset.chapter=chapter;this.caption.textContent=captions[chapter];}
  this.progress.setAttribute('aria-valuenow',String(Math.floor(t)));(this.progress.firstElementChild as HTMLElement).style.width=`${t/30*100}%`;
  this.time.textContent=`0:${String(Math.floor(t)).padStart(2,'0')} / 0:30`;
  this.root.querySelectorAll<HTMLElement>('.lighthouse-friend').forEach((el,i)=>{
   const arrival=ease((t-i*.55)/2),x=8+i*12,clap=t>=22;
   el.style.left=`${reduced?x:x+(i<4?-32:32)*(1-arrival)}%`;el.style.top=`${68+(i%2)*7-(reduced?0:Math.abs(Math.sin(t*(clap?10:2)+i))*(clap?1.5:.4))}%`;
   el.style.opacity=String(reduced?1:arrival);el.style.transform=`translate(-50%,-50%) rotate(${reduced?0:Math.sin(t*(clap?12:2)+i)*(clap?5:1)}deg)`;
  });
  this.root.querySelectorAll<HTMLElement>('.lighthouse-element').forEach((el,i)=>{
   const start=7+i*1.1, flight=reduced?(t>=start?1:0):ease((t-start)/2),x=12+i*12;
   el.style.left=`${x+(50-x)*flight}%`;el.style.top=`${73-43*flight}%`;
   el.style.opacity=String(t<start?0:(1-ease((t-16)/1)));
   el.style.transform=`translate(-50%,-50%) scale(${1-flight*.45})`;
  });
  const beam=this.root.querySelector<HTMLElement>('.lighthouse-beam')!;
  beam.style.opacity=String(ease((t-17)/2));beam.style.transform=`rotate(${reduced?0:Math.sin((t-17)*.65)*9}deg)`;
  this.root.querySelectorAll<HTMLElement>('.lighthouse-boat').forEach((el,i)=>{
   el.style.opacity=String(t>=22?1:0);el.style.left=`${reduced?20+i*30:-15+ease((t-22-i*.6)/7)*130}%`;el.style.top=`${87+i%2*5}%`;
  });
  this.root.querySelector<HTMLElement>('.lighthouse-applause')!.style.opacity=String(ease((t-23)/1));
  if(ms===LIGHTHOUSE_DURATION_MS&&this.anchor!==null){this.capture(now);this.pauseButton.hidden=true;this.root.querySelector<HTMLButtonElement>('.lighthouse-replay')!.focus({preventScroll:true});}
 }
}
