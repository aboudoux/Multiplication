import { picoRewards } from './pico-rewards';
import { themes, sprite, type ThemeId } from './themes';
import type { AdventureStage } from './adventure';

export const MISSION_REWARD_MS = 10_000;
type Prop = 'yarn'|'snack'|'house'|'flowers'|'butterfly'|'rainbow'|'star'|'ufo'|'gift'|'sleigh'|'lantern'|'candy'|'potion'|'broom'|'crystals'|'chest'|'bunting'|'disco';
const props: Prop[] = ['yarn','snack','house','flowers','butterfly','rainbow','star','ufo','gift','sleigh','lantern','candy','potion','broom','crystals','chest','bunting','disco'];
export type Pose = [time:number, x:number, y:number, scale?:number, rotation?:number, opacity?:number];
export interface Actor { art:string; size:number; poses:Pose[]; name:string }
export interface Reward { title:string; captions:readonly[string,string,string]; actors:Actor[] }
function prop(name:Prop):string {
 const i=props.indexOf(name), cell=i%6;
 return `<span class="reward-prop reward-atlas-${Math.floor(i/6)}" style="background-position:${cell%3*50}% ${Math.floor(cell/3)*100}%"></span>`;
}
const item=(name:Prop,size:number,...poses:Pose[]):Actor=>({art:prop(name),size,poses,name});
const friend=(id:ThemeId,size:number,...poses:Pose[]):Actor=>({art:themes[id].home,size,poses,name:id});
const special=(id:ThemeId,cell:number,size:number,...poses:Pose[]):Actor=>({art:sprite(id,cell),size,poses,name:id});
const pop=(x:number,y:number,at:number):Pose[]=>[[0,x,y,0,0,0],[at,x,y,0,0,0],[at+.5,x,y,1.18],[at+.85,x,y,1],[10,x,y,1]];
const arrive=(x:number,y:number,at=0):Pose[]=>[[0,-20,y,1,0,0],[at,-20,y,1,0,0],[at+1.5,x,y,1],[at+2,x,y-4,1.05,-7],[at+2.5,x,y,1],[10,x,y,1]];
const bloom=(x:number,y:number,at:number):Actor=>item('flowers',24,...pop(x,y,at));
const fly=(name:Prop,y:number,at:number):Actor=>item(name,15,[0,-15,y,1,0,0],[at,-15,y,1,0,0],[at+1,25,y-15,1,15],[at+2,55,y+8,1,-15],[at+3,80,y-8,1,12],[at+4,65,y,1],[10,65,y,1]);
const bunting=(at:number)=>item('bunting',77,[0,50,-25,1,0,0],[at,50,-25,1,0,0],[at+1.5,50,17,1],[10,50,17,1]);
const rainbow=(at:number)=>item('rainbow',65,...pop(52,35,at));
const gems=(at:number)=>[25,50,75].map((x,i)=>item('crystals',22,...pop(x,73,at+i*.65)));
const gifts=(at:number)=>[30,50,70].map((x,i)=>item('gift',22,[0,x,-20,1,0,0],[at+i*.7,x,-20,1,0,0],[at+1+i*.7,x,73,1,12],[at+1.4+i*.7,x,69,1],[10,x,69,1]));
const confetti=()=>Array.from({length:16},(_,i):Actor=>({name:'confetti',art:'<i class="reward-confetti"></i>',size:2,poses:[[0,50,45,0,0,0],[6,50,45,0,0,0],[6.6,8+(i*23%84),12+(i*13%38),1,i*37],[10,8+(i*23%84),95,1,i*63,0]]}));

/** Every mission has its own small story; all coordinates are percentages of the stage. */
export const missionRewards:Record<string,Reward> = {
 ...picoRewards,
 'kitten-1':{title:'Toutes les pelotes retrouvées !',captions:['Mais où sont les pelotes ?','Attrape-les, petit chat !','Bien rangées… enfin, presque !'],actors:[
  special('kitten',3,33,[0,12,66,1],[2,32,66,1,-8],[4,72,61,1,8],[6,50,64,1,-8],[7.5,27,64,1],[10,27,64,1]),
  ...[0,1,2].map(i=>item('yarn',18,[0,26+i*25,74,1],[2+i,80-i*26,65,1,180],[5+i*.5,62+i*10,74,1,360],[10,62+i*10,74,1,360]))]},
 'kitten-2':{title:'Le goûter est servi !',captions:['Le chaton a invité ses amis…','Les gourmandises arrivent !','Miam ! Il y en a pour tout le monde.'],actors:[
  friend('kitten',33,...arrive(25,48)),item('snack',43,[0,115,73,1],[2,115,73,1],[4,58,73,1],[4.5,58,69,1.1],[5,58,73,1],[10,58,73,1])]},
 'kitten-3':{title:'Une maison prête pour la fête !',captions:['Une jolie maison à décorer…','Accrochons les guirlandes !','Bienvenue chez le chaton !'],actors:[
  item('house',62,...pop(54,58,0)),friend('kitten',28,...arrive(20,76,1)),bunting(3),item('flowers',23,...pop(80,78,5)),...confetti()]},
 'unicorn-1':{title:'La forêt est en fleurs !',captions:['La forêt se réveille doucement…','Un petit bond… et ça pousse !','Quel merveilleux jardin !'],actors:[
  friend('unicorn',34,[0,14,55,1],[2,28,46,1],[3,28,55,1],[4,53,43,1],[5,53,55,1],[6,78,43,1],[7,78,55,1],[10,78,55,1]),bloom(23,77,2),bloom(49,77,4),bloom(76,77,6)]},
 'unicorn-2':{title:'Le chemin des papillons !',captions:['Un papillon nous fait signe…','Suivons ses amis dans la forêt !','Ils nous ont guidés jusqu’à l’arc-en-ciel.'],actors:[rainbow(5),special('unicorn',3,37,...arrive(48,76,2)),fly('butterfly',36,0),fly('butterfly',57,1),fly('butterfly',27,2)]},
 'unicorn-3':{title:'La licorne vient à la fête !',captions:['Une invitée très spéciale arrive…','Elle apporte toutes ses couleurs !','Un arc-en-ciel pour le chaton !'],actors:[rainbow(2),special('unicorn',3,40,[0,-24,66,1],[2,32,49,1,-12],[4,68,61,1],[6,66,67,1],[10,66,67,1]),friend('kitten',27,...arrive(25,76,4)),...confetti()]},
 'alien-1':{title:'La galaxie brille à nouveau !',captions:['Ziggy cherche les étoiles éteintes…','Une, deux, trois… lumière !','Tout le ciel scintille grâce à toi !'],actors:[friend('alien',35,...arrive(50,73)),...[18,39,61,82].map((x,i)=>item('star',18,...pop(x,25+(i%2)*14,1.4+i*1.2)))]},
 'alien-2':{title:'Soucoupe réparée, décollage !',captions:['Oh ! La soucoupe ne démarre plus…','Ziggy remet son moteur en route !','Elle vole ! Direction les étoiles !'],actors:[
  friend('alien',31,[0,24,74,1],[3,38,67,1,12],[4,35,72,1,-12],[5,24,74,1],[10,24,74,1]),item('ufo',48,[0,67,73,1,-18],[2,67,73,1,-18],[3,67,70,1,12],[4,67,73,1,-8],[5,67,65,1],[7,65,28,.8],[8.5,40,24,.65],[10,62,30,.8]),item('star',17,...pop(83,18,6))]},
 'alien-3':{title:'Ziggy apporte ses bulles !',captions:['Un invité arrive de très loin…','Sa soucoupe est pleine de bulles !','Bienvenue à la fête, Ziggy !'],actors:[item('ufo',38,[0,115,22,1],[3,68,26,1],[5,65,35,1],[10,65,35,1]),friend('alien',33,...pop(62,72,4)),friend('kitten',27,...arrive(24,75,3)),...Array.from({length:9},(_,i):Actor=>({name:'bubble',art:'<i class="reward-bubble"></i>',size:6+i%3*2,poses:[[0,64,46,0,0,0],[3+i*.3,64,46,0,0,0],[6+i*.25,13+i*9,26+i%3*19,1],[10,13+i*9,18+i%3*19,1]]}))]},
 'christmas-1':{title:'Tous les cadeaux sont là !',captions:['Le Père Noël vérifie sa liste…','Les cadeaux arrivent un par un !','Trois jolies surprises, bien comptées !'],actors:[friend('christmas',33,...arrive(50,40)),...gifts(1.5)]},
 'christmas-2':{title:'Le traîneau est prêt !',captions:['Il reste à charger le traîneau…','Hop ! Les cadeaux sont à bord !','En route pour la fête !'],actors:[item('sleigh',53,[0,55,72,1],[6,55,72,1],[8,73,42,.85,-15],[10,65,38,.85]),friend('christmas',28,[0,22,69,1],[4,22,69,1],[6,52,51,.85],[8,70,24,.7,-15],[10,62,20,.7]),item('gift',20,[0,15,78,1],[2,15,78,1],[4,63,63,.8],[6,63,63,.8],[8,78,35,.65],[10,70,31,.65])]},
 'christmas-3':{title:'Une livraison pleine de surprises !',captions:['On entend les grelots au loin…','Le Père Noël dépose ses cadeaux !','Le chaton va être gâté !'],actors:[special('christmas',3,50,[0,-30,30,1],[3,53,30,1],[7,70,28,1],[10,65,28,1]),friend('kitten',29,...arrive(18,75,2)),...gifts(4)]},
 'halloween-1':{title:'Les lanternes illuminent le jardin !',captions:['Le jardin est un peu sombre…','La citrouille allume ses lanternes !','Une lumière douce pour tous les amis.'],actors:[friend('halloween',34,...arrive(50,47)),...[25,50,75].map((x,i)=>item('lantern',24,...pop(x,77,2+i*1.5)))]},
 'halloween-2':{title:'Les bonbons sont retrouvés !',captions:['Les bonbons se sont cachés…','Ah ! Les voilà qui rebondissent !','Une belle réserve à partager !'],actors:[friend('halloween',35,...arrive(24,65)),...[0,1,2].map(i=>item('candy',22,[0,110,75,1,0,0],[1+i,110,75,1,0,0],[3+i,57+i*10,32,1,160],[5+i*.5,53+i*12,76,1,360],[10,53+i*12,76,1,360]))]},
 'halloween-3':{title:'Une invitée qui rayonne !',captions:['La citrouille vient nous voir…','Elle apporte ses jolies lanternes !','Une fête lumineuse, même la nuit !'],actors:[friend('halloween',37,...arrive(65,61)),friend('kitten',28,...arrive(25,73,2)),item('lantern',25,...pop(48,79,4)),bunting(5),...confetti()]},
 'wizard-1':{title:'Les potions sont bien rangées !',captions:['Quel bazar dans les potions !','Le sorcier les fait léviter…','Chaque fiole a trouvé sa place !'],actors:[friend('wizard',33,...arrive(20,65)),...[0,1,2].map(i=>item('potion',23,[0,40+i*19,70-i*17,1,-30+i*25],[2,40+i*19,70-i*17,1,-30+i*25],[4+i*.4,50+i*15,35,1,20],[6+i*.3,48+i*17,74,1],[10,48+i*17,74,1]))]},
 'wizard-2':{title:'Les balais prennent leur envol !',captions:['Un petit sort et…','Les balais s’envolent !','Quel ballet dans le ciel !'],actors:[friend('wizard',30,...arrive(22,76)),...[0,1,2].map(i=>item('broom',31,[0,48+i*14,80,1,-50],[1+i*.4,48+i*14,80,1,-50],[3+i*.5,35+i*20,30+i*12,1,10],[5+i*.3,75-i*20,23+i*12,1,-15],[7,45+i*18,35+i*10,1],[10,45+i*18,35+i*10,1]))]},
 'wizard-3':{title:'Un invité et mille tours de magie !',captions:['Le sorcier arrive sur son balai…','Abracadabra ! Des cadeaux apparaissent !','La fête sera vraiment magique !'],actors:[special('wizard',3,43,[0,-25,25,1],[3,64,30,1],[5,65,36,1],[10,65,36,1]),friend('kitten',27,...arrive(20,76,2)),item('potion',24,...pop(48,74,4)),item('gift',26,...pop(77,76,6)),...confetti()]},
 'dragon-1':{title:'Les cristaux sont découverts !',captions:['Le dragon explore la montagne…','Regarde ! Ça brille sous ses pattes !','Trois trésors aux mille couleurs !'],actors:[friend('dragon',37,[0,15,47,1],[2,24,49,1],[4,48,46,1],[6,73,47,1],[10,73,47,1]),...gems(2)]},
 'dragon-2':{title:'Le coffre révèle son trésor !',captions:['Un mystérieux coffre attend…','Le dragon a trouvé comment l’ouvrir !','Waouh ! Une pluie de trésors !'],actors:[friend('dragon',38,...arrive(25,60)),item('chest',44,[0,64,70,.8,0,0],[2,64,70,.8,0,0],[3.5,64,66,1.05,-10],[4,64,68,1,10],[4.5,64,68,1],[10,64,68,1]),item('crystals',25,...pop(76,81,5)),...confetti()]},
 'dragon-3':{title:'Le dragon apporte son trésor !',captions:['Un grand ami descend de la montagne…','Il apporte un coffre pour la fête !','Un trésor de confettis à partager !'],actors:[special('dragon',3,45,[0,115,18,1],[3,67,28,1],[5,65,33,1],[10,65,33,1]),friend('kitten',28,...arrive(23,75,2)),item('chest',37,[0,100,46,.8,0,0],[2,82,46,.8],[5,64,75,1],[10,64,75,1]),...confetti()]},
 'star-1':{title:'Les guirlandes sont accrochées !',captions:['La fête manque encore de couleurs…','L’étoile déploie ses guirlandes !','Voilà une salle qui pétille !'],actors:[friend('star',34,[0,20,73,1],[3,25,35,1,-10],[5,74,37,1,10],[7,50,69,1],[10,50,69,1]),bunting(2),item('bunting',68,[0,50,-25,1,0,0],[4,50,-25,1,0,0],[6,50,42,1],[10,50,42,1]),...confetti()]},
 'star-2':{title:'La piste de danse est prête !',captions:['Il nous faut une piste qui brille…','La boule disco descend !','L’étoile teste la piste : ça groove !'],actors:[item('disco',35,[0,50,-25,1],[3,50,23,1],[10,50,23,1]),friend('star',38,[0,20,76,1],[3,50,73,1],[4,40,68,1,-15],[5,60,73,1,15],[6,40,68,1,-15],[7,60,73,1,15],[8,50,69,1],[10,50,69,1]),...confetti()]},
 'star-3':{title:'Tous réunis pour la grande fête !',captions:['Les invités arrivent de tous les mondes…','Bienvenue les amis !','Tu as préparé une fête extraordinaire !'],actors:[bunting(0),item('disco',24,...pop(50,25,1)),...(['kitten','unicorn','alien','christmas','halloween','wizard','dragon','star'] as ThemeId[]).map((id,i)=>friend(id,23,[0,i%2?-20:120,48+Math.floor(i/4)*29,1,0,0],[i*.45,i%2?-20:120,48+Math.floor(i/4)*29,1,0,0],[2+i*.45,17+i%4*22,48+Math.floor(i/4)*29,1],[6,17+i%4*22,48+Math.floor(i/4)*29,1,-8],[7,17+i%4*22,44+Math.floor(i/4)*29,1,8],[8,17+i%4*22,48+Math.floor(i/4)*29,1,-8],[9,17+i%4*22,44+Math.floor(i/4)*29,1,8],[10,17+i%4*22,48+Math.floor(i/4)*29,1])),...confetti()]},
};

function frames(poses:Pose[]):Keyframe[] {
 return poses.map(([t,x,y,scale=1,rotation=0,opacity=1])=>({offset:t/10,left:`${x}%`,top:`${y}%`,transform:`translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,opacity}));
}

/** Paused Web Animations are scrubbed from the engine clock, including tab suspension. */
export class MissionRewardScene {
 private animations:Animation[]=[];
 private reward:Reward|null=null;
 private lastCaption=-1;
 private readonly reduced=matchMedia('(prefers-reduced-motion: reduce)');
 private readonly images=new Map<string,HTMLImageElement>();
 constructor(private readonly host:HTMLElement) {}
 preload(stage:AdventureStage):void {
  const artwork=missionRewards[stage.id].actors.map(a=>a.art).join('');
  for(const match of artwork.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
   const url=match[1];
   if(!this.images.has(url)){const img=new Image();img.src=url;this.images.set(url,img);void img.decode().catch(()=>{});}
  }
  for(let i=0;i<3;i++)if(artwork.includes(`reward-atlas-${i}`)) {
   const url=`/themes/rewards-${'abc'[i]}.png`;
   if(!this.images.has(url)){const img=new Image();img.src=url;this.images.set(url,img);void img.decode().catch(()=>{});}
  }
 }
 show(stage:AdventureStage):void {
  this.clear();this.reward=missionRewards[stage.id];
  const reward=this.reward;
  this.host.innerHTML=`<h2 class="reward-title">${reward.title}</h2><div class="mission-scene" data-mission="${stage.id}" style="--reward-color:${stage.world.color}" role="img" aria-label="${reward.title}"><div class="reward-halo"></div>${reward.actors.map((a,i)=>`<span class="reward-actor" data-art="${a.name}" style="--actor-width:${a.size}%;--piece:${i}">${a.art}</span>`).join('')}<span class="reward-stamp">Mission accomplie !</span></div><p class="reward-caption"></p><div class="reward-progress" aria-hidden="true"><i></i></div>`;
  this.host.querySelectorAll<HTMLElement>('.reward-actor').forEach((el,i)=>{
   const animation=el.animate(frames(reward.actors[i].poses),{duration:MISSION_REWARD_MS,fill:'both',easing:'ease-in-out'});
   animation.pause();this.animations.push(animation);
   const creature=el.querySelector<HTMLElement>('.sprite-dragon, .sprite-alien, .sprite-kitten, .sprite-christmas, .sprite-unicorn, .pico-sprite[data-pico-cell="4"]');
   if(creature){
    const alien=creature.classList.contains('sprite-alien');
    const kitten=creature.classList.contains('sprite-kitten');
    const christmas=creature.classList.contains('sprite-christmas');
    const unicorn=creature.classList.contains('sprite-unicorn');
    // Animate the creature inside its travel path, using the same suspendable clock.
    const dance=creature.animate(unicorn?[
     {transform:'translate(-5px,0) rotate(-6deg) scale(1.02,.98)'},
     {transform:'translate(0,-16px) rotate(5deg) scale(.98,1.02)'},
     {transform:'translate(5px,0) rotate(6deg) scale(1.02,.98)'},
     {transform:'translate(0,-16px) rotate(-5deg) scale(.98,1.02)'},
     {transform:'translate(-5px,0) rotate(-6deg) scale(1.02,.98)'},
    ]:christmas?[
     {transform:'translate(-6px,0) rotate(-8deg)'},
     {transform:'translate(0,-10px) rotate(0deg)'},
     {transform:'translate(6px,0) rotate(8deg)'},
     {transform:'translate(0,-10px) rotate(0deg)'},
     {transform:'translate(-6px,0) rotate(-8deg)'},
    ]:kitten?[
     {transform:'translate(-5px,0) rotate(-8deg) scale(1.03,.97)'},
     {transform:'translate(0,-14px) rotate(0deg) scale(.97,1.03)'},
     {transform:'translate(5px,0) rotate(8deg) scale(1.03,.97)'},
     {transform:'translate(0,-14px) rotate(0deg) scale(.97,1.03)'},
     {transform:'translate(-5px,0) rotate(-8deg) scale(1.03,.97)'},
    ]:alien?[
     {transform:'translate(-7px,0) rotate(-7deg)'},
     {transform:'translate(7px,-10px) rotate(7deg)'},
     {transform:'translate(-7px,0) rotate(-7deg)'},
    ]:[
     {transform:'translateY(0) rotate(-5deg) scale(1.03,.97)'},
     {transform:'translateY(-12px) rotate(7deg) scale(.97,1.03)'},
     {transform:'translateY(0) rotate(-5deg) scale(1.03,.97)'},
    ],{duration:120000/themes[creature.classList.contains('pico-sprite')?stage.world.id:unicorn?'unicorn':christmas?'christmas':kitten?'kitten':alien?'alien':'dragon'].music.bpm,iterations:Infinity,easing:'ease-in-out'});
    creature.style.transformOrigin='50% 80%';
    dance.pause();this.animations.push(dance);
   }
  });
  this.host.hidden=false;this.update(0);
 }
 update(elapsed:number):void {
  if(!this.reward)return;
  const time=Math.min(MISSION_REWARD_MS,Math.max(0,elapsed));
  for(const animation of this.animations) animation.currentTime=this.reduced.matches?MISSION_REWARD_MS:time;
  const caption=this.reduced.matches?2:time<3000?0:time<7000?1:2;
  if(caption!==this.lastCaption){this.host.querySelector('.reward-caption')!.textContent=this.reward.captions[caption];this.lastCaption=caption;}
  this.host.querySelector<HTMLElement>('.reward-progress i')!.style.transform=`scaleX(${time/MISSION_REWARD_MS})`;
  this.host.querySelector<HTMLElement>('.reward-stamp')!.style.opacity=this.reduced.matches||time>=7000?'1':'0';
 }
 clear():void {for(const animation of this.animations)animation.cancel();this.animations=[];this.reward=null;this.lastCaption=-1;this.host.replaceChildren();this.host.hidden=true;}
}
