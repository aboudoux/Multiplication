export const grades = ['GS','CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2de'] as const;
export type Grade = typeof grades[number];
export const gradeAge = (grade: Grade) => grades.indexOf(grade) + 5;
export const gradeForAge = (age: number): Grade => grades[Math.max(0, Math.min(10, Math.round(age) - 5))];
export const sources = {
  nursery: 'https://www.education.gouv.fr/bo/2024/Hebdo41/MENE2415135A',
  primary: 'https://www.education.gouv.fr/sites/default/files/document/Annexe%204%20%E2%80%93%20Programme%20de%20math%C3%A9matiques%20du%20cycle%202-403821.pdf',
  consolidation: 'https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A',
  college: 'https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A',
  fourth: 'https://eduscol.education.gouv.fr/sites/default/files/document/16-maths-4e-attendus-eduscol1114746pdf-74682.pdf',
  third: 'https://eduscol.education.gouv.fr/sites/default/files/document/18-maths-3e-attendus-eduscol1114748pdf-74688.pdf',
  high: 'https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt',
};
export interface Skill {
  id: string; title: string; grade: Grade; lot: number; prerequisites: string[];
  strategy: string; example: string; source: string; reference: string;
}
const skill = (id: string, title: string, grade: Grade, lot: number, prerequisites: string[], strategy: string, example: string): Skill => ({
  id,title,grade,lot,prerequisites,strategy,example,
  source: grade==='GS'?sources.nursery:grades.indexOf(grade)<4?sources.primary:grades.indexOf(grade)<7?sources.consolidation:grade==='4e'?sources.fourth:grade==='3e'?sources.third:grade==='2de'?sources.high:sources.college,
  reference: grade==='4e'||grade==='3e'?'Attendus antérieurs en vigueur en 2026–2027':'Programme en vigueur en 2026–2027',
});
export const skills: readonly Skill[] = [
  skill('small-add','Réunir des collections','GS',1,[],'Réunir deux groupes, puis compter le tout.','3 + 2'),
  skill('small-subtract','Enlever des objets','GS',1,['small-add'],'Retirer une partie et compter ce qui reste.','7 − 2'),
  skill('add','Additions et dizaines','CP',1,['small-add'],'Décomposer en dizaines et unités ; compléter la dizaine.','34 + 20'),
  skill('subtract','Soustractions et dizaines','CP',1,['small-subtract'],'Enlever les dizaines puis les unités.','47 − 6'),
  skill('double','Doubles','CP',3,['small-add'],'Un double est deux fois la même quantité.','8 + 8'),
  skill('half','Moitiés et partages','CP',3,['double'],'Partager une quantité en deux groupes égaux.','La moitié de 18'),
  skill('missing','Nombres manquants','CP',6,['add','subtract'],'Chercher le complément avec l’opération inverse.','4 + ? = 12'),
  skill('tables','Tables de multiplication','CE1',1,['add'],'Voir des groupes égaux et retrouver le produit.','6 × 4'),
  skill('large-add','Additionner des centaines','CE1',3,['add'],'Additionner les centaines, dizaines puis unités.','300 + 200'),
  skill('large-subtract','Soustraire des centaines','CE1',3,['subtract'],'Retirer des centaines et des dizaines.','750 − 200'),
  skill('times-ten','Multiplier par 10','CE1',3,['tables'],'Chaque unité devient une dizaine.','72 × 10'),
  skill('fraction-picture','Reconnaître les fractions','CE1',4,[],'Partager le tout en parts égales et compter les parts choisies.','3/4 d’une bande'),
  skill('fraction-compare','Comparer des fractions','CE1',4,['fraction-picture'],'Comparer des parts du même tout ; utiliser une même unité.','Comparer 1/2 et 1/4'),
  skill('divide','Divisions exactes','CE2',3,['tables'],'Retrouver la multiplication correspondante.','42 ÷ 6'),
  skill('large-multiply','Produits de dizaines et centaines','CE2',3,['tables'],'Décomposer ou doubler deux fois.','125 × 4'),
  skill('times-hundred','Multiplier par 100','CE2',3,['times-ten'],'Chaque unité devient une centaine.','84 × 100'),
  skill('fraction-add','Additionner des fractions','CE2',4,['fraction-picture'],'Additionner les parts après avoir choisi une même unité.','1/4 + 2/4'),
  skill('times-thousand','Multiplier par 1 000','CM1',3,['times-hundred'],'Chaque unité devient un millier.','45 × 1 000'),
  skill('mystery','Nombres mystères','CM1',6,['missing','tables'],'Retrouver les étapes dans l’ordre inverse.','3 × (? + 2) = 21'),
  skill('remainder','Division avec reste','CM1',4,['divide'],'Dividende = diviseur × quotient + reste ; le reste est plus petit que le diviseur.','23 ÷ 5'),
  skill('decimal-add','Additions et soustractions décimales','CM1',4,['add','subtract'],'Aligner les unités, dixièmes et centièmes.','4,45 + 0,3'),
  skill('decimal-scale','Décimaux × et ÷ 10, 100, 1 000','CM2',4,['decimal-add'],'La valeur de chaque chiffre change de rang.','7,2 ÷ 100'),
  skill('decimal-divide','Divisions décimales finies','CM2',4,['divide','decimal-add'],'Partager en unités puis en dixièmes et centièmes.','7,5 ÷ 3'),
  skill('fraction-of','Fraction d’une quantité','CM2',4,['divide','fraction-picture'],'Diviser par le dénominateur, multiplier par le numérateur.','2/3 de 18'),
  skill('decimal-multiply','Multiplier des décimaux','6e',4,['tables','decimal-add'],'Multiplier les nombres entiers correspondants, puis rétablir les rangs.','1,5 × 4'),
  skill('percent','Pourcentage d’une quantité','6e',7,['fraction-of'],'Un pourcentage est une fraction sur 100.','25 % de 80'),
  skill('proportion','Proportionnalité','6e',7,['tables','divide'],'Trouver le prix ou la quantité d’une unité.','3 objets coûtent 12 €, combien pour 5 ?'),
  skill('signed-add','Additionner et soustraire des relatifs','5e',5,['add','subtract'],'Se déplacer sur la droite numérique.','−3 + 8'),
  skill('priority','Priorités et parenthèses','5e',5,['tables','add'],'Calculer les parenthèses, puis les produits avant les sommes.','4 + 3 × 5'),
  skill('square','Carrés','5e',5,['tables'],'Le carré est le produit d’un nombre par lui-même.','8²'),
  skill('cube','Cubes','5e',5,['square'],'Le cube multiplie trois fois la même base.','3³'),
  skill('substitution','Calculer une expression littérale','5e',6,['priority'],'Remplacer la lettre par sa valeur.','2x + 1 pour x = 3'),
  skill('equation-one','Équations à une étape','5e',6,['missing','divide'],'Effectuer l’opération inverse sur les deux membres.','5x = 30'),
  skill('signed-multiply','Produits et quotients de relatifs','4e',5,['signed-add','tables'],'Déterminer le signe, puis calculer la valeur absolue.','−6 × (−4)'),
  skill('fraction-multiply','Produits et quotients de fractions','4e',4,['fraction-add','divide'],'Multiplier les numérateurs et dénominateurs ; diviser par une fraction revient à multiplier par son inverse.','3/4 ÷ 1/2'),
  skill('root','Racines de carrés parfaits','4e',5,['square'],'Chercher le nombre positif dont le carré est donné.','√81'),
  skill('power-ten','Puissances de 10 et notation scientifique','4e',5,['times-thousand','decimal-scale'],'Compter les rangs ; en notation scientifique le premier facteur est entre 1 et 10.','3 × 10⁴'),
  skill('equation-two','Équations à plusieurs étapes','4e',6,['equation-one','signed-add'],'Enlever la constante, puis diviser par le coefficient.','3x + 5 = 20'),
  skill('equation-both','Inconnue des deux côtés','4e',6,['equation-two'],'Regrouper les termes en x dans un membre.','2x + 5 = x + 12'),
  skill('fraction-reduce','Fractions irréductibles','3e',4,['fraction-multiply'],'Diviser les deux termes par un même diviseur commun.','Simplifier 18/24'),
  skill('negative-power','Puissances négatives','3e',5,['cube','fraction-multiply'],'Un exposant négatif donne l’inverse de la puissance positive.','2⁻³'),
  skill('equation-set','Équations à plusieurs solutions','3e',6,['equation-two','square'],'Un carré positif a deux antécédents opposés ; un produit nul a un facteur nul.','x² = 25'),
  skill('evolution','Évolutions en pourcentage','3e',7,['percent'],'Multiplier par 1 + taux pour une hausse, 1 − taux pour une baisse.','80 € après une réduction de 25 %'),
  skill('function','Valeurs de fonctions','3e',7,['substitution'],'Remplacer x dans la formule et respecter les priorités.','f(3), avec f(x) = 2x + 1'),
  skill('identity','Identités remarquables','2de',7,['square','priority'],'Reconnaître (a+b)² = a² + 2ab + b².','Calculer 21² par décomposition'),
  skill('inequality','Inéquations simples','2de',7,['equation-two'],'Résoudre comme une équation ; inverser le sens si on divise par un négatif.','2x + 3 ≤ 11'),
  skill('successive','Évolutions successives','2de',7,['evolution'],'Multiplier les coefficients successifs, sans additionner les taux.','100 €, puis +10 % et −10 %'),
  skill('program','Programmes de calcul','CM2',7,['tables','add'],'Suivre les étapes dans l’ordre et conserver le résultat intermédiaire.','Ajouter 3 à 5, puis multiplier par 2'),
];
export const AVAILABLE_LOT = 7;
export const skillById = (id: string) => skills.find(s=>s.id===id);
export function curriculum(grade: Grade, available = AVAILABLE_LOT): Skill[] {
  return skills.filter(s=>grades.indexOf(s.grade)<=grades.indexOf(grade) && s.lot<=available);
}
export interface Evidence { first: boolean; helped: boolean; timeMs: number }
export interface Mastery { samples: Evidence[]; series: number[]; comfortable: boolean; level: number }
export type Masteries = Record<string, Mastery>;
export function recordEvidence(data: Masteries, id: string, evidence: Evidence): void {
  if (!skillById(id)) return;
  const m=data[id]??={samples:[],series:[],comfortable:false,level:0};
  m.samples.push(evidence);
  if(m.samples.length>=10) {
    const score=m.samples.splice(0,10).filter(e=>e.first&&!e.helped).length;
    m.series.push(score); m.series=m.series.slice(-12);
    // Adjustment happens at a series boundary; session generators snapshot this level.
    if(score<6) m.level=Math.max(0,m.level-1);
    if(m.series.slice(-2).length===2 && m.series.slice(-2).every(n=>n>=8)) {m.comfortable=true;m.level=Math.min(2,m.level+1);}
  }
}
export const masteryLabel = (m?: Mastery) => m?.comfortable?'À l’aise':m && (m.samples.length||m.series.length)?'En entraînement':'À découvrir';
