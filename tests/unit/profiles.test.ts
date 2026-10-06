import {describe,it,expect} from 'vitest';
import {Profiles,PROFILES_KEY} from '../../src/profiles';
import {recordEvidence,masteryLabel,gradeForAge,curriculum,skills} from '../../src/curriculum';
const disk=()=>{const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};};
describe('profils locaux',()=>{
 it('migre les profils anciens en Normal sans déduire de découvertes des acquis',()=>{
  const d=disk();d.setItem(PROFILES_KEY,JSON.stringify({version:1,active:'old',players:[{id:'old',name:'Ancien',avatar:'🐱',grade:'CP',adaptive:true,mastery:{add:{samples:[],series:[10,10],comfortable:true,level:2}},data:{'calcul-party:adventure:v1':'{"completed":["kitten-1"]}','calcul-party:training:v1':'{"materials":40}'}}]}));
  const p=new Profiles(d);expect(p.active.adventureDifficulty).toBe('normal');expect(p.active.adventurePractice).toEqual({});expect(p.active.mastery.add.level).toBe(2);expect(p.storage.getItem('calcul-party:training:v1')).toContain('40');expect(p.storage.getItem('calcul-party:adventure:v1')).toContain('kitten-1');
 });
 it('conserve classe, choix manuel, découvertes et journal propres à chaque joueur',()=>{
  const d=disk(),p=new Profiles(d),first=p.add('Lina','CP');first.adventureDifficulty='expert';first.adventurePractice={CP:{add:1}};p.storage.setItem('calcul-party:adventure-attempts:v1','journal Lina');first.grade='CM1';p.save();
  const second=p.add('Noé','GS');expect(second.adventureDifficulty).toBe('normal');expect(second.adventurePractice).toEqual({});expect(p.storage.getItem('calcul-party:adventure-attempts:v1')).toBeNull();p.select(first.id);
  const loaded=new Profiles(d);expect(loaded.active.grade).toBe('CM1');expect(loaded.active.adventureDifficulty).toBe('expert');expect(loaded.active.adventurePractice).toEqual({CP:{add:1}});expect(loaded.storage.getItem('calcul-party:adventure-attempts:v1')).toBe('journal Lina');
 });
 it('rejette un choix invalide et filtre un historique corrompu sans perdre le profil',()=>{
  const d=disk(),p=new Profiles(d);const data=JSON.parse(d.data.get(PROFILES_KEY)!);data.players[0].adventureDifficulty='automatic';data.players[0].adventurePractice={CP:{add:2,subtract:100,unknown:0},GS:[],unknown:{add:0}};d.setItem(PROFILES_KEY,JSON.stringify(data));
  const loaded=new Profiles(d);expect(loaded.active.id).toBe(p.active.id);expect(loaded.active.adventureDifficulty).toBe('normal');expect(loaded.active.adventurePractice).toEqual({CP:{add:2}});
 });
 it('migre les quatre sauvegardes sans inventer de maîtrise et isole un nouveau joueur',()=>{
  const d=disk();for(const key of ['multipli-party:v1','calcul-party:training:v1','calcul-party:adventure:v1','calcul-party:adventure:pico:v1'])d.setItem(key,'{"completed":["kitten-1"]}');
  const p=new Profiles(d);expect(Object.keys(p.active.data)).toHaveLength(4);expect(p.active.mastery).toEqual({});
  p.add('Lina','GS');expect(p.storage.getItem('calcul-party:adventure:v1')).toBeNull();p.storage.setItem('calcul-party:training:v1','{"materials":5}');
  p.select('current');expect(p.storage.getItem('calcul-party:training:v1')).not.toContain('materials');
  expect(new Profiles(d).active.id).toBe('current');
 });
 it('garde une visite jouable quand le disque est bloqué et refuse un effacement non sauvegardé',()=>{
  const p=new Profiles({getItem:()=>{throw Error();},setItem:()=>{throw Error();},removeItem:()=>{throw Error();}});p.active.data.x='keep';
  expect(p.stored).toBe(false);expect(()=>p.storage.removeItem('x')).toThrow();expect(p.active.data.x).toBe('keep');p.add('Noé','CM1');expect(p.active.name).toBe('Noé');
 });
 it('revient à la sauvegarde historique si le registre est corrompu',()=>{const d=disk();d.setItem(PROFILES_KEY,'{');d.setItem('calcul-party:training:v1','backup');expect(new Profiles(d).storage.getItem('calcul-party:training:v1')).toBe('backup');});
 it('réinitialise seulement l’aventure active et conserve les autres joueurs et compétences',()=>{
  const d=disk(),p=new Profiles(d);const a=p.add('Lina','CM1');p.storage.setItem('calcul-party:adventure:v1','chaton');p.storage.setItem('calcul-party:adventure:pico:v1','pico');p.storage.setItem('calcul-party:training:v1','camp');recordEvidence(a.mastery,'add',{first:true,helped:false,timeMs:100});p.save();
  const b=p.add('Noé','GS');p.storage.setItem('calcul-party:adventure:v1','autre');p.select(a.id);p.storage.removeItem('calcul-party:adventure:v1');
  expect(p.storage.getItem('calcul-party:adventure:pico:v1')).toBe('pico');expect(p.storage.getItem('calcul-party:training:v1')).toBe('camp');expect(a.mastery.add.samples).toHaveLength(1);
  p.select(b.id);expect(p.storage.getItem('calcul-party:adventure:v1')).toBe('autre');expect(new Profiles(d).active.name).toBe('Noé');
 });
});
describe('compétences',()=>{
 it('sépare aide, correction et premier essai et ajuste après dix observations',()=>{
  const m={};for(let i=0;i<19;i++)recordEvidence(m,'add',{first:true,helped:false,timeMs:100});expect(masteryLabel(m['add' as keyof typeof m])).toBe('En entraînement');
  recordEvidence(m,'add',{first:true,helped:false,timeMs:100});expect(masteryLabel(m['add' as keyof typeof m])).toBe('À l’aise');
  const helped={};for(let i=0;i<20;i++)recordEvidence(helped,'add',{first:true,helped:true,timeMs:100});expect(masteryLabel(helped['add' as keyof typeof helped])).toBe('En entraînement');
 });
 it('associe les âges et conserve un catalogue sourcé sans prérequis inconnus',()=>{expect(gradeForAge(5)).toBe('GS');expect(gradeForAge(15)).toBe('2de');expect(curriculum('GS').map(s=>s.id)).toEqual(['small-add','small-subtract']);for(const s of skills){expect(s.source).toMatch(/^https:/);for(const id of s.prerequisites)expect(skills.some(p=>p.id===id)).toBe(true);}});
});
