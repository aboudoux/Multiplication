export const picoThemeIds = ['pico','tika','mistral','octave','brico','corail','nami','alba'] as const;
export type PicoThemeId = typeof picoThemeIds[number];

export const picoCast = [
 {id:'pico',name:'Pico',identity:'Un renard curieux au foulard turquoise',world:'Le port des départs',tier:0,board:'#234B52',color:'#FFC878',container:'Malle de voyage',objects:['Carte','Boussole'],contribution:'Pico rassemble son équipage et prépare le voyage.',missions:['Retrouve la carte','Prépare la barque','Prends la mer']},
 {id:'tika',name:'Tika',identity:'Une tortue patiente au foulard corail',world:'Le lagon des coquillages',tier:1,board:'#205B57',color:'#9AE0C4',container:'Coquillage',objects:['Perle','Corail'],contribution:'Tika apporte la perle lumineuse du lagon.',missions:['Nettoie le lagon','Réveille les coquillages','Trouve la perle']},
 {id:'mistral',name:'Mistral',identity:'Une mouette espiègle au bonnet marin',world:'L’île des vents',tier:1,board:'#244F77',color:'#A6DFFF',container:'Coffret marin',objects:['Plume','Voile'],contribution:'Mistral apporte les voiles pour transporter notre équipage.',missions:['Rassemble les plumes','Répare les voiles','Suis les vents']},
 {id:'octave',name:'Octave',identity:'Une pieuvre inventive aux lunettes de mécanicien',world:'L’atelier sous-marin',tier:2,board:'#42366F',color:'#C7B5FF',container:'Capsule',objects:['Câble','Lanterne'],contribution:'Octave apporte le circuit qui reliera les lanternes du phare.',missions:['Retrouve les câbles','Relie les lanternes','Répare le circuit']},
 {id:'brico',name:'Brico',identity:'Un castor persévérant au casque jaune',world:'L’île des bâtisseurs',tier:2,board:'#514830',color:'#E4CA8B',container:'Caisse de chantier',objects:['Planche','Marteau'],contribution:'Brico apporte une charpente solide pour le phare.',missions:['Récupère les planches','Construis le ponton','Prépare la charpente']},
 {id:'corail',name:'Corail',identity:'Un crabe méticuleux au gilet bleu marine',world:'La crique des mécanismes',tier:3,board:'#683C40',color:'#FFB19B',container:'Coffre de cuivre',objects:['Cristal','Engrenage'],contribution:'Corail apporte le mécanisme qui fera tourner la lumière.',missions:['Dégage les cristaux','Assemble les rouages','Répare le mécanisme']},
 {id:'nami',name:'Nami',identity:'Un dauphin joyeux à l’écharpe lavande',world:'Le récif lumineux',tier:3,board:'#164F69',color:'#83E5ED',container:'Bulle magique',objects:['Bulle lumineuse','Éclair'],contribution:'Nami apporte l’énergie du courant lumineux.',missions:['Réveille les bulles','Libère le courant','Alimente le phare']},
 {id:'alba',name:'Alba',identity:'Une chouette bienveillante à la cape violette',world:'L’île du phare',tier:4,board:'#303655',color:'#FFE49A',container:'Écrin',objects:['Prisme','Rayon lumineux'],contribution:'Alba installe le prisme. Ensemble, vous rallumez le phare !',missions:['Installe le prisme','Oriente la lumière','Rallume le phare']},
] as const;

export function isPicoTheme(id: string): id is PicoThemeId { return (picoThemeIds as readonly string[]).includes(id); }

/** The same nine-cell illustrations serve the keypad, portraits and stories. */
export function picoSprite(id: PicoThemeId, cell = 2, className = ''): string {
 return `<span class="theme-sprite pico-sprite sprite-${id} ${className}" data-pico-cell="${cell}" style="background-position:${cell%3*50}% ${Math.floor(cell/3)*50}%" aria-hidden="true"></span>`;
}
