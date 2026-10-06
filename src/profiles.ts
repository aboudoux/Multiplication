import { grades, type Grade, type Masteries } from './curriculum';
export const PROFILES_KEY='calcul-party:players:v1';
export const scopedKeys=['multipli-party:v1','calcul-party:training:v1','calcul-party:adventure:v1','calcul-party:adventure:pico:v1'];
export interface Player {id:string;name:string;avatar:string;grade:Grade;adaptive:boolean;data:Record<string,string>;mastery:Masteries}
export interface Players {version:1;active:string;players:Player[]}
type Disk=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
const avatars=['🐱','🐜','🦊','🐉','⭐','🚀'];
export {avatars};
export class Profiles {
  state:Players;
  stored=true;
  constructor(private disk:Disk) {
    this.state={version:1,active:'current',players:[{id:'current',name:'Joueur actuel',avatar:'🐱',grade:'CP',adaptive:false,data:{},mastery:{}}]};
    try {
      let value:unknown=null;
      try {value=JSON.parse(disk.getItem(PROFILES_KEY)??'null');}catch{/* Preserve legacy backups when the registry is corrupt. */}
      const saved=value as Players|null;
      if(saved?.version===1 && Array.isArray(saved.players) && saved.players.length>0 && saved.players.length<=50) {
        const valid:Player[]=saved.players.filter((p:Player)=>p && typeof p.id==='string' && /^[a-zA-Z0-9-]{1,80}$/.test(p.id) && typeof p.name==='string' && p.name.length>0 && p.name.length<=40 && grades.includes(p.grade) && typeof p.adaptive==='boolean' && p.data && typeof p.data==='object' && !Array.isArray(p.data)).map((p:Player)=>({
          ...p,avatar:avatars.includes(p.avatar)?p.avatar:avatars[0],data:Object.fromEntries(scopedKeys.filter(k=>typeof p.data[k]==='string').map(k=>[k,p.data[k]])),mastery:validateMastery(p.mastery),
        }));
        if(valid.length && new Set(valid.map(p=>p.id)).size===valid.length) {
          this.state={version:1,active:valid.some(p=>p.id===saved.active)?saved.active:valid[0].id,players:valid}; return;
        }
      }
      for(const key of scopedKeys) { const raw=disk.getItem(key); if(raw!==null)this.active.data[key]=raw; }
      this.save();
    } catch {this.stored=false;}
  }
  get active():Player {return this.state.players.find(p=>p.id===this.state.active)!;}
  add(name:string,grade:Grade,avatar=avatars[0]):Player {
    if(!name.trim() || name.trim().length>40 || !grades.includes(grade) || this.state.players.length>=50)throw new RangeError('Profil invalide');
    const p:Player={id:crypto.randomUUID(),name:name.trim(),avatar:avatars.includes(avatar)?avatar:avatars[0],grade,adaptive:true,data:{},mastery:{}};
    this.state.players.push(p);this.state.active=p.id;this.save();return p;
  }
  select(id:string):boolean {if(!this.state.players.some(p=>p.id===id))return false;this.state.active=id;this.save();return true;}
  save():boolean {
    try{this.disk.setItem(PROFILES_KEY,JSON.stringify(this.state));this.stored=true;return true;}catch{this.stored=false;return false;}
  }
  readonly storage:Disk={
    getItem:(key)=>this.active.data[key]??null,
    setItem:(key,value)=>{
      this.active.data[key]=value;
      if(!this.save())throw new Error('Stockage indisponible');
      // Keep the migrated player's legacy save readable by older versions; never share it with new players.
      if(this.active.id==='current') {try{this.disk.setItem(key,value);}catch{/* Primary profile save succeeded. */}}
    },
    removeItem:(key)=>{
      const previous=this.active.data[key];delete this.active.data[key];
      if(!this.save()){if(previous!==undefined)this.active.data[key]=previous;throw new Error('Stockage indisponible');}
      if(this.active.id==='current'){try{this.disk.removeItem(key);}catch{/* The profile is authoritative. */}}
    },
  };
}
function validateMastery(value:unknown):Masteries {
  const output:Masteries={};
  if(!value||typeof value!=='object'||Array.isArray(value))return output;
  for(const [id,m] of Object.entries(value)) {
    if(!m||typeof m!=='object')continue;
    const v=m as Masteries[string];
    if(typeof v.comfortable!=='boolean'||![0,1,2].includes(v.level)||!Array.isArray(v.series)||!Array.isArray(v.samples))continue;
    output[id]={comfortable:v.comfortable,level:v.level,series:v.series.filter(n=>Number.isInteger(n)&&n>=0&&n<=10).slice(-12),samples:v.samples.filter(e=>e && typeof e.first==='boolean' && typeof e.helped==='boolean' && Number.isFinite(e.timeMs)&&e.timeMs>=0).slice(0,9)};
  }
  return output;
}
export function openProfiles():Profiles {
  try{return new Profiles(localStorage);}catch{return new Profiles({getItem:()=>{throw new Error('Blocked');},setItem:()=>{throw new Error('Blocked');},removeItem:()=>{throw new Error('Blocked');}});}
}
