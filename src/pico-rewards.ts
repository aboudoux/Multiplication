import type { Actor, Pose, Reward } from './mission-rewards';
import { picoSprite, type PicoThemeId } from './pico-content';
import { picoProps, type PicoProp } from './pico-art';

const actor=(art:string,name:string,size:number,poses:Pose[]):Actor=>({art,name,size,poses});
const still=(x:number,y:number):Pose[]=>[[0,x,y],[10,x,y]];
const appear=(x:number,y:number,at:number):Pose[]=>[[0,x,y,0,0,0],[at,x,y,0,0,0],[at+1,x,y,1],[10,x,y,1]];
const move=(x:number,y:number,toX:number,toY:number,at=2):Pose[]=>[[0,x,y],[at,x,y],[at+3,toX,toY],[10,toX,toY]];
const spin=(x:number,y:number,at=3):Pose[]=>[[0,x,y],[at,x,y,1,0],[8,x,y,1,360],[10,x,y,1,360]];
const vanish=(x:number,y:number,toX:number,toY:number):Pose[]=>[[0,x,y],[2,x,y],[5,toX,toY,0,90,0],[10,toX,toY,0,90,0]];
const prop=(id:PicoProp,size:number,poses:Pose[])=>actor(picoProps[id],id,size,poses);
const object=(id:PicoThemeId,cell:6|7,size:number,poses:Pose[])=>actor(picoSprite(id,cell),`${id}-object-${cell}`,size,poses);
const box=(id:PicoThemeId,open:boolean,x:number,y:number)=>actor(picoSprite(id,open?1:0),`${id}-container`,33,still(x,y));
const friend=(id:PicoThemeId,x=22,y=60,at=0)=>actor(picoSprite(id,4),id,37,[[0,-18,y,1,0,0],[at,-18,y,1,0,0],[at+1.5,x,y],[10,x,y]]);
const reward=(id:PicoThemeId,title:string,captions:Reward['captions'],actors:Actor[]):Reward=>({title,captions,actors:[...(actors.some(a=>a.name===id)?[]:[friend(id)]),...actors]});
const beacon=(id:PicoThemeId)=>[prop('lighthouse',60,still(67,52)),object(id,6,21,move(45,77,68,27)),prop('beam',48,appear(84,30,6))];

/** A visual action and three narrative beats for every island mission. */
export const picoRewards:Record<string,Reward>={
 'pico-1':reward('pico','La carte de l’archipel est reconstituée !',['La tempête a dispersé la carte…','Pico rapproche les morceaux.','Les sept îles sont retrouvées !'],[
  ...[0,1,2].map(i=>actor(picoSprite('pico',6,`pico-map-fragment-${i}`),`map-fragment-${i}`,43,move(35+i*26,32+i*12,65,62))),object('pico',7,19,appear(77,35,6))]),
 'pico-2':reward('pico','La barque est prête !',['Une barque attend au port.','Embarquons la carte et la boussole !','Tout est à bord pour retrouver nos amis.'],[
  prop('boat',57,still(65,68)),object('pico',6,20,move(40,30,58,64)),object('pico',7,18,move(81,32,74,66,3))]),
 'pico-3':reward('pico','Cap sur l’archipel !',['Pico quitte le port des départs.','La boussole indique le lagon.','En route, les amis nous attendent !'],[
  actor(picoSprite('pico',4),'pico',32,move(38,61,75,53)),prop('boat',65,move(38,75,75,67)),object('pico',7,19,spin(80,30)),object('pico',6,18,still(52,63))]),
 'tika-1':reward('tika','Le lagon est tout propre !',['La tempête a encombré le lagon.','Tika et Pico retirent les débris.','Les coraux respirent à nouveau !'],[
  friend('pico',42,63,1),... [0,1,2].map(i=>prop('debris',22,vanish(48+i*20,75,94,22))),object('tika',7,30,appear(67,70,5))]),
 'tika-2':reward('tika','Les coquillages se réveillent !',['Les coquillages sont encore fermés.','Tika les appelle tout doucement.','Ils s’ouvrent et brillent dans le lagon !'],[
  ...[0,1,2].flatMap(i=>[actor(picoSprite('tika',0),'closed-shell',26,[[0,46+i*21,70],[2+i,46+i*21,70],[2.1+i,46+i*21,70,0,0,0],[10,46+i*21,70,0,0,0]]),actor(picoSprite('tika',1),'open-shell',26,appear(46+i*21,70,2+i))])]),
 'tika-3':reward('tika','La perle lumineuse est trouvée !',['Un dernier coquillage cache une lumière.','Tika ouvre la coquille pour Pico.','La perle éclairera le cœur du phare !'],[
  box('tika',true,62,72),object('tika',6,34,move(62,72,62,35)),friend('pico',88,60,5)]),
 'mistral-1':reward('mistral','Les plumes sont rassemblées !',['Le vent a emporté les plumes de Mistral.','Pico l’aide à les récupérer.','Toutes les plumes sont dans le panier !'],[
  prop('basket',38,still(66,76)),...[0,1,2].map(i=>object('mistral',6,21,move(43+i*21,22+i*9,62+i*6,69,i+1)))]),
 'mistral-2':reward('mistral','Les voiles sont réparées !',['Les voiles ont souffert de la tempête.','Mistral rassemble les pans de tissu.','Une grande voile prête à reprendre le vent !'],[
  ...[0,1,2].map(i=>object('mistral',7,21,vanish(44+i*19,66,65,45))),prop('sail',52,appear(65,52,4))]),
 'mistral-3':reward('mistral','Le vent nous conduit au phare !',['Les courants d’air tournent autour de l’île.','Mistral guide la barque, voiles déployées.','Les voiles transporteront tout le matériel !'],[
  prop('boat',61,move(40,74,77,60)),prop('current',36,move(38,30,81,35)),object('mistral',7,23,still(64,40))]),
 'octave-1':reward('octave','Tous les câbles sont retrouvés !',['L’atelier sous-marin est sens dessus dessous.','Octave récupère les câbles égarés.','Les branchements peuvent commencer !'],[
  box('octave',true,66,75),...[0,1,2].map(i=>object('octave',6,22,move(43+i*21,27+i*7,61+i*6,72,i+1)))]),
 'octave-2':reward('octave','Les lanternes sont reliées !',['Trois lanternes attendent de la lumière.','Octave les relie avec ses câbles.','Le signal passe de lanterne en lanterne !'],[
  prop('circuit',57,appear(65,65,2)),...[0,1,2].map(i=>object('octave',7,24,appear(43+i*22,42,3+i)))]),
 'octave-3':reward('octave','Le circuit fonctionne !',['Le circuit du phare est interrompu.','Octave branche le dernier câble.','Les lanternes confirment la réparation !'],[
  prop('circuit',61,still(67,64)),object('octave',6,24,move(41,29,69,66)),object('octave',7,27,appear(72,30,6))]),
 'brico-1':reward('brico','Les planches sont récupérées !',['Des planches flottent près de l’île.','Brico les ramène une par une.','Le chantier a tout son bois !'],[
  ...[0,1,2].map(i=>prop('plank',32,move(45+i*20,31+i*17,65,63+i*7,i+1))),object('brico',7,21,appear(80,33,6))]),
 'brico-2':reward('brico','Le ponton est construit !',['La barque n’a plus d’endroit où accoster.','Brico pose les planches du ponton.','Pico peut débarquer en toute sécurité !'],[
  ...[0,1,2].map(i=>prop('plank',24,vanish(45+i*20,30,67,69))),prop('pontoon',57,appear(64,75,4)),prop('boat',33,move(95,65,82,62,5))]),
 'brico-3':reward('brico','La charpente est prête !',['Le phare a besoin d’un support solide.','Brico assemble les poutres.','La charpente soutiendra la grande lanterne !'],[
  ...[0,1,2].map(i=>prop('plank',28,vanish(41+i*22,75,66,42))),prop('frame',58,appear(65,53,4)),object('brico',7,20,move(87,31,79,59,4))]),
 'corail-1':reward('corail','Les cristaux sont dégagés !',['Du sable recouvre les cristaux de la crique.','Corail dégage leur lumière.','Les cristaux étincellent à nouveau !'],[
  ...[0,1,2].map(i=>prop('debris',24,vanish(43+i*22,72,94,24))),...[0,1,2].map(i=>object('corail',6,26,appear(43+i*22,63,3+i)))]),
 'corail-2':reward('corail','Les rouages sont assemblés !',['Les engrenages sont éparpillés.','Corail ajuste chaque roue avec soin.','Les trois rouages tournent ensemble !'],[
  ...[0,1,2].map(i=>prop('gear',29,[[0,43+i*22,29],[3,43+i*22,59+i%2*15,1,0],[8,43+i*22,59+i%2*15,1,i%2?-360:360],[10,43+i*22,59+i%2*15,1,i%2?-360:360]]))]),
 'corail-3':reward('corail','Le mécanisme est réparé !',['La grande roue du phare est bloquée.','Corail insère le cristal et règle les rouages.','Le mécanisme entraîne la lumière !'],[
  prop('gear',58,spin(66,60)),object('corail',6,25,move(43,26,66,60)),object('corail',7,21,spin(86,30))]),
 'nami-1':reward('nami','Les bulles lumineuses sont réveillées !',['Le récif est plongé dans l’obscurité.','Nami fait monter les bulles endormies.','Le récif retrouve ses mille lumières !'],[
  ...[0,1,2,3].map(i=>object('nami',6,23,[[0,45+i*14,85,0,0,0],[1+i,45+i*14,85,1],[7,45+i*14,27+i%2*15],[10,45+i*14,27+i%2*15]]))]),
 'nami-2':reward('nami','Le courant circule librement !',['Un obstacle retient l’énergie du récif.','Nami libère le passage.','Le courant lumineux rejoint l’île du phare !'],[
  prop('debris',43,vanish(66,61,92,28)),prop('current',63,appear(63,67,3)),object('nami',7,24,move(43,66,87,40,4))]),
 'nami-3':reward('nami','Le phare reçoit son énergie !',['Le phare attend sa source d’énergie.','Nami y conduit le courant lumineux.','Il ne manque plus que le prisme !'],[
  prop('lighthouse',58,still(74,52)),prop('current',45,move(39,80,69,64)),object('nami',7,25,move(38,66,74,34,3))]),
 'alba-1':reward('alba','Le prisme est installé !',['Alba garde le dernier élément du phare.','Pico et Alba placent le prisme dans la lanterne.','La lumière peut traverser le cristal !'],[
  friend('pico',40,66,1),prop('lighthouse',60,still(70,54)),object('alba',6,23,move(47,74,70,26))]),
 'alba-2':reward('alba','La lumière montre le chemin !',['Le prisme doit éclairer le passage.','Alba oriente le rayon vers la mer.','Les bateaux peuvent retrouver la route !'],[
  prop('lighthouse',58,still(52,53)),prop('beam',55,[[0,75,29,0,-25,0],[2,75,29,1,-25],[6,75,29,1,12],[10,75,29,1,12]]),prop('boat',29,move(90,80,76,71,5))]),
 'alba-3':reward('alba','Le phare des îles brille !',['Les huit amis ont tout préparé.','Alba et Pico rallument le phare.','Merci à tout l’équipage, l’archipel est sauvé !'],[
  ...beacon('alba'),friend('pico',41,71,2),prop('boat',27,move(98,84,65,78,6))]),
};
