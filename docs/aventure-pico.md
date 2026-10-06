# Pico et le phare des îles

Aventure coopérative jouable à côté de [l’aventure du chaton](creation-aventure.md), avec huit personnages principaux, huit mondes et 24 missions. Cette fiche applique les trois modèles du guide et décrit le contenu livré.

## Brief d’aventure

Après une tempête, le phare magique de l’archipel s’est éteint. Pico, petit renard curieux au foulard turquoise, quitte son port pour retrouver ses sept amis dispersés. Aider chacun permet de préparer un élément du phare. L’objectif commun est de rendre aux bateaux leur chemin dans la nuit.

Le parcours respecte les paliers **0 → deux mondes de palier 1 → deux de palier 2 → deux de palier 3 → monde final**. Les deux îles d’un palier peuvent être explorées dans l’ordre choisi ; les deux doivent être terminées pour avancer. Chaque monde comporte découverte, action et accomplissement. Aucune division ni nouvelle règle pédagogique n’est introduite.

Le style est celui d’un album jeunesse : silhouettes rondes, contours doux, animaux expressifs et accessoires constants. Les huit planches originales ont été produites avec Imagegen, en PNG RGBA transparent de 1254 × 1254 pixels. Les personnages et les deux objets de chaque planche sont réutilisés dans la carte, le pavé, les surprises et les scènes de réussite. Les accessoires de construction et le phare sont des illustrations vectorielles locales.

| Palier | Personnage | Monde | Tableau | Carte et accent | Élément apporté |
| --- | --- | --- | --- | --- | --- |
| 0 | Pico | Le port des départs | `#234B52` | `#FFC878` | Équipage et voyage |
| 1 | Tika | Le lagon des coquillages | `#205B57` | `#9AE0C4` | Perle lumineuse |
| 1 | Mistral | L’île des vents | `#244F77` | `#A6DFFF` | Voiles de transport |
| 2 | Octave | L’atelier sous-marin | `#42366F` | `#C7B5FF` | Circuit |
| 2 | Brico | L’île des bâtisseurs | `#514830` | `#E4CA8B` | Charpente |
| 3 | Corail | La crique des mécanismes | `#683C40` | `#FFB19B` | Mécanisme |
| 3 | Nami | Le récif lumineux | `#164F69` | `#83E5ED` | Énergie |
| 4 | Alba | L’île du phare | `#303655` | `#FFE49A` | Prisme |

## Règles communes aux fiches

**Palette.** Le fond du tableau est la couleur sombre du tableau ci-dessus ; la carte du monde et l’accent utilisent sa couleur claire. Page : mélange 80 % tableau / 20 % `#08121F` ; panneaux : 75 % tableau / 25 % `#08121F` ; bordures : 70 % accent / 30 % tableau ; cadre : accent. Textes crème `#FFF6E6`, secondaires `#A6EEEA`, atténués `#E5EBE8` ; texte des boutons et chiffres `#182C45`. La couche du calcul masque les motifs derrière les nombres. Les chiffres occupent l’étiquette claire de chaque contenant et les libellés accessibles restent présents sans image.

**Planche et poses.** Cases 0/1 : contenant fermé/ouvert ; 2 : accueil souriant et attente ; 3 : réaction enthousiaste ; 4 : victoire ; 5 : petite déception ; 6/7 : deux objets ; 8 : coquillage d’effacement. Le portrait emploie la pose d’accueil ; l’ami retrouvé salue sur la carte. La pose du compagnon demeure dans la case inférieure gauche. Les six sorties alternent dans l’ordre 2, 6, 7, 3, 4, 5. Un appui ouvre le contenant pendant 600 ms, fait monter un seul élément puis l’efface. Une nouvelle saisie relance immédiatement l’effet. Clic, clavier et tactile utilisent le même contrôleur et le traitement du chiffre précède l’animation.

**Surprises.** Deux effets par île alternent les objets 6/7, après certaines bonnes réponses, avec cinq éléments en orbite ou en chute douce. Ils ne modifient pas le calcul. Les effets du pavé et les surprises se nettoient à la pause, au départ et en arrière-plan. La réduction des animations supprime les sorties et les surprises en conservant la saisie.

**Calculs.** Les bornes indiquées s’appliquent aux opérandes et au résultat de l’addition et de la soustraction ; pas de résultat négatif. Les tables couvrent toutes les tables de 1 à la limite donnée, avec multiplicateurs 1 à 10. Les banques sont suffisantes et sans répétition d’une question déjà réussie. Dans le final, les couples ordonnés `2 × 3` et `3 × 2` restent distincts.

**Tentative.** Tous les calculs doivent être réussis. Erreur ou délai dépassé : perte d’une vie si elles sont limitées, correction pendant deux secondes puis nouvelle tentative du calcul. La voix préparée précède le chrono. Pause et reprise conservent la tentative ; abandon ou rechargement recommencent la mission depuis le début. À zéro vie, on recommence avec tous ses cœurs. Le rejeu d’une mission acquise ne duplique pas sa progression.

**Récompense.** Chaque mission possède un titre, une action spécifique, des trajectoires et trois légendes, durant dix secondes de temps visible. Légendes situation/action/résultat à 0/3/7 s. Le personnage de l’île apparaît dans chaque scène ; les partenaires utiles sont nommés ci-dessous. La musique de victoire est celle de son monde. Préchargement des images pendant la mission, pause des trajectoires et de la musique en arrière-plan. Avec réduction des animations, l’état final reste immobile pendant dix secondes. La sauvegarde intervient dès la réussite.

## Fiches personnage / monde et missions

### Pico — Le port des départs

- **Identité :** Un renard curieux au foulard turquoise. Héros et organisateur du voyage.
- **Lien et obstacle :** Pico veut retrouver ses sept amis après la tempête.
- **Palier :** 0. **Contribution et texte du monde terminé :** Pico rassemble son équipage et prépare le voyage.
- **Décor :** port, carte et boussole. **Tableau / carte :** `#234B52` / `#FFC878` ; déclinaisons communes ci-dessus.
- **Pavé :** Malle de voyage fermé/ouvert, carte et boussole, coquillage d’effacement.
- **Assets :** [`keypad-pico.png`](../public/themes/keypad-pico.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 1, 122 BPM, triangle doux, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `pico-1` — Retrouve la carte

- **Position / objectif :** mission 1, découverte ; retrouve la carte.
- **Prérequis :** Première mission disponible au départ. **Débloque :** La mission suivante du monde.
- **Calculs :** 5 calculs ; addition ; borne 5 ; chrono aucun, vies illimitées.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `pico-1` sauvegardée sans doublon.
- **Scène :** « La carte de l’archipel est reconstituée ! », 10 s. Les morceaux de carte se rejoignent, puis la boussole apparaît.
- **Trois légendes :**
  1. La tempête a dispersé la carte…
  2. Pico rapproche les morceaux.
  3. Les sept îles sont retrouvées !
- **Son et accessibilité :** musique de Pico, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `pico-2` — Prépare la barque

- **Position / objectif :** mission 2, action ; prépare la barque.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 8 calculs ; addition ; borne 8 ; chrono aucun, vies illimitées.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `pico-2` sauvegardée sans doublon.
- **Scène :** « La barque est prête ! », 10 s. Carte et boussole descendent dans la barque.
- **Trois légendes :**
  1. Une barque attend au port.
  2. Embarquons la carte et la boussole !
  3. Tout est à bord pour retrouver nos amis.
- **Son et accessibilité :** musique de Pico, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `pico-3` — Prends la mer

- **Position / objectif :** mission 3, accomplissement ; prends la mer.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Les deux îles du palier 1.
- **Calculs :** 10 calculs ; addition ; borne 10 ; chrono aucun, vies illimitées.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `pico-3` sauvegardée sans doublon.
- **Scène :** « Cap sur l’archipel ! », 10 s. La barque prend la mer et la boussole pivote.
- **Trois légendes :**
  1. Pico quitte le port des départs.
  2. La boussole indique le lagon.
  3. En route, les amis nous attendent !
- **Son et accessibilité :** musique de Pico, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

### Tika — Le lagon des coquillages

- **Identité :** Une tortue patiente au foulard corail. Amie de Pico, gardienne du lagon.
- **Lien et obstacle :** Ami de longue date de Pico, isolé par la tempête ; les trois missions restaurent son île et son matériel.
- **Palier :** 1. **Contribution et texte du monde terminé :** Tika apporte la perle lumineuse du lagon.
- **Décor :** lagon, perles et coraux. **Tableau / carte :** `#205B57` / `#9AE0C4` ; déclinaisons communes ci-dessus.
- **Pavé :** Coquillage fermé/ouvert, perle et corail, coquillage d’effacement.
- **Assets :** [`keypad-tika.png`](../public/themes/keypad-tika.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 2, 124 BPM, sinusoïde douce, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `tika-1` — Nettoie le lagon

- **Position / objectif :** mission 1, découverte ; nettoie le lagon.
- **Prérequis :** Tous les mondes des paliers précédents terminés. **Débloque :** La mission suivante du monde.
- **Calculs :** 10 calculs ; addition ; borne 10 ; chrono 30 s, vies 7.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `tika-1` sauvegardée sans doublon.
- **Scène :** « Le lagon est tout propre ! », 10 s. Pico aide Tika à sortir les débris ; les coraux apparaissent.
- **Trois légendes :**
  1. La tempête a encombré le lagon.
  2. Tika et Pico retirent les débris.
  3. Les coraux respirent à nouveau !
- **Son et accessibilité :** musique de Tika, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `tika-2` — Réveille les coquillages

- **Position / objectif :** mission 2, action ; réveille les coquillages.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 15 calculs ; soustraction ; borne 10 ; chrono 30 s, vies 7.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `tika-2` sauvegardée sans doublon.
- **Scène :** « Les coquillages se réveillent ! », 10 s. Trois coquilles passent de fermé à ouvert, l’une après l’autre.
- **Trois légendes :**
  1. Les coquillages sont encore fermés.
  2. Tika les appelle tout doucement.
  3. Ils s’ouvrent et brillent dans le lagon !
- **Son et accessibilité :** musique de Tika, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `tika-3` — Trouve la perle

- **Position / objectif :** mission 3, accomplissement ; trouve la perle.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Le compagnon et sa contribution ; le palier suivant lorsque les deux îles de ce palier sont achevées.
- **Calculs :** 20 calculs ; addition et soustraction ; borne 12 ; chrono 30 s, vies 7.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `tika-3` sauvegardée sans doublon.
- **Scène :** « La perle lumineuse est trouvée ! », 10 s. Une perle sort du coquillage ouvert ; Pico rejoint Tika.
- **Trois légendes :**
  1. Un dernier coquillage cache une lumière.
  2. Tika ouvre la coquille pour Pico.
  3. La perle éclairera le cœur du phare !
- **Son et accessibilité :** musique de Tika, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

### Mistral — L’île des vents

- **Identité :** Une mouette espiègle au bonnet marin. Ami de Pico, guide des vents.
- **Lien et obstacle :** Ami de longue date de Pico, isolé par la tempête ; les trois missions restaurent son île et son matériel.
- **Palier :** 1. **Contribution et texte du monde terminé :** Mistral apporte les voiles pour transporter notre équipage.
- **Décor :** île venteuse, plumes et voiles. **Tableau / carte :** `#244F77` / `#A6DFFF` ; déclinaisons communes ci-dessus.
- **Pavé :** Coffret marin fermé/ouvert, plume et voile, coquillage d’effacement.
- **Assets :** [`keypad-mistral.png`](../public/themes/keypad-mistral.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 3, 126 BPM, triangle doux, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `mistral-1` — Rassemble les plumes

- **Position / objectif :** mission 1, découverte ; rassemble les plumes.
- **Prérequis :** Tous les mondes des paliers précédents terminés. **Débloque :** La mission suivante du monde.
- **Calculs :** 15 calculs ; addition ; borne 15 ; chrono 30 s, vies 7.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `mistral-1` sauvegardée sans doublon.
- **Scène :** « Les plumes sont rassemblées ! », 10 s. Les plumes descendent dans un panier.
- **Trois légendes :**
  1. Le vent a emporté les plumes de Mistral.
  2. Pico l’aide à les récupérer.
  3. Toutes les plumes sont dans le panier !
- **Son et accessibilité :** musique de Mistral, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `mistral-2` — Répare les voiles

- **Position / objectif :** mission 2, action ; répare les voiles.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 20 calculs ; soustraction ; borne 15 ; chrono 30 s, vies 7.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `mistral-2` sauvegardée sans doublon.
- **Scène :** « Les voiles sont réparées ! », 10 s. Les pans de voile rejoignent un mât et forment une voile.
- **Trois légendes :**
  1. Les voiles ont souffert de la tempête.
  2. Mistral rassemble les pans de tissu.
  3. Une grande voile prête à reprendre le vent !
- **Son et accessibilité :** musique de Mistral, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `mistral-3` — Suis les vents

- **Position / objectif :** mission 3, accomplissement ; suis les vents.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Le compagnon et sa contribution ; le palier suivant lorsque les deux îles de ce palier sont achevées.
- **Calculs :** 30 calculs ; addition et soustraction ; borne 20 ; chrono 30 s, vies 7.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `mistral-3` sauvegardée sans doublon.
- **Scène :** « Le vent nous conduit au phare ! », 10 s. Une barque avance sur les courants d’air, voiles déployées.
- **Trois légendes :**
  1. Les courants d’air tournent autour de l’île.
  2. Mistral guide la barque, voiles déployées.
  3. Les voiles transporteront tout le matériel !
- **Son et accessibilité :** musique de Mistral, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

### Octave — L’atelier sous-marin

- **Identité :** Une pieuvre inventive aux lunettes de mécanicien. Ami de Pico, réparateur des lanternes.
- **Lien et obstacle :** Ami de longue date de Pico, isolé par la tempête ; les trois missions restaurent son île et son matériel.
- **Palier :** 2. **Contribution et texte du monde terminé :** Octave apporte le circuit qui reliera les lanternes du phare.
- **Décor :** atelier sous-marin, câbles et lanternes. **Tableau / carte :** `#42366F` / `#C7B5FF` ; déclinaisons communes ci-dessus.
- **Pavé :** Capsule fermé/ouvert, câble et lanterne, coquillage d’effacement.
- **Assets :** [`keypad-octave.png`](../public/themes/keypad-octave.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 4, 128 BPM, triangle doux, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `octave-1` — Retrouve les câbles

- **Position / objectif :** mission 1, découverte ; retrouve les câbles.
- **Prérequis :** Tous les mondes des paliers précédents terminés. **Débloque :** La mission suivante du monde.
- **Calculs :** 20 calculs ; addition et soustraction ; borne 20 ; chrono 15 s, vies 5.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `octave-1` sauvegardée sans doublon.
- **Scène :** « Tous les câbles sont retrouvés ! », 10 s. Trois câbles rejoignent la capsule ouverte.
- **Trois légendes :**
  1. L’atelier sous-marin est sens dessus dessous.
  2. Octave récupère les câbles égarés.
  3. Les branchements peuvent commencer !
- **Son et accessibilité :** musique de Octave, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `octave-2` — Relie les lanternes

- **Position / objectif :** mission 2, action ; relie les lanternes.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 30 calculs ; addition et soustraction ; borne 20 ; chrono 15 s, vies 5.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `octave-2` sauvegardée sans doublon.
- **Scène :** « Les lanternes sont reliées ! », 10 s. Le circuit apparaît et trois lanternes s’allument successivement.
- **Trois légendes :**
  1. Trois lanternes attendent de la lumière.
  2. Octave les relie avec ses câbles.
  3. Le signal passe de lanterne en lanterne !
- **Son et accessibilité :** musique de Octave, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `octave-3` — Répare le circuit

- **Position / objectif :** mission 3, accomplissement ; répare le circuit.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Le compagnon et sa contribution ; le palier suivant lorsque les deux îles de ce palier sont achevées.
- **Calculs :** 40 calculs ; addition et soustraction ; borne 20 ; chrono 15 s, vies 5.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `octave-3` sauvegardée sans doublon.
- **Scène :** « Le circuit fonctionne ! », 10 s. Un dernier câble rejoint le circuit ; une lanterne confirme sa réparation.
- **Trois légendes :**
  1. Le circuit du phare est interrompu.
  2. Octave branche le dernier câble.
  3. Les lanternes confirment la réparation !
- **Son et accessibilité :** musique de Octave, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

### Brico — L’île des bâtisseurs

- **Identité :** Un castor persévérant au casque jaune. Ami de Pico, constructeur du phare.
- **Lien et obstacle :** Ami de longue date de Pico, isolé par la tempête ; les trois missions restaurent son île et son matériel.
- **Palier :** 2. **Contribution et texte du monde terminé :** Brico apporte une charpente solide pour le phare.
- **Décor :** chantier de bois, planches et marteaux. **Tableau / carte :** `#514830` / `#E4CA8B` ; déclinaisons communes ci-dessus.
- **Pavé :** Caisse de chantier fermé/ouvert, planche et marteau, coquillage d’effacement.
- **Assets :** [`keypad-brico.png`](../public/themes/keypad-brico.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 5, 130 BPM, sinusoïde douce, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `brico-1` — Récupère les planches

- **Position / objectif :** mission 1, découverte ; récupère les planches.
- **Prérequis :** Tous les mondes des paliers précédents terminés. **Débloque :** La mission suivante du monde.
- **Calculs :** 20 calculs ; addition, soustraction et multiplication ; borne 20 ; tables 1 à 2 (×1 à ×10) ; chrono 15 s, vies 5.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `brico-1` sauvegardée sans doublon.
- **Scène :** « Les planches sont récupérées ! », 10 s. Trois planches rejoignent la pile du chantier.
- **Trois légendes :**
  1. Des planches flottent près de l’île.
  2. Brico les ramène une par une.
  3. Le chantier a tout son bois !
- **Son et accessibilité :** musique de Brico, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `brico-2` — Construis le ponton

- **Position / objectif :** mission 2, action ; construis le ponton.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 30 calculs ; addition, soustraction et multiplication ; borne 20 ; tables 1 à 3 (×1 à ×10) ; chrono 15 s, vies 5.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `brico-2` sauvegardée sans doublon.
- **Scène :** « Le ponton est construit ! », 10 s. Les planches s’assemblent en ponton ; une barque accoste.
- **Trois légendes :**
  1. La barque n’a plus d’endroit où accoster.
  2. Brico pose les planches du ponton.
  3. Pico peut débarquer en toute sécurité !
- **Son et accessibilité :** musique de Brico, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `brico-3` — Prépare la charpente

- **Position / objectif :** mission 3, accomplissement ; prépare la charpente.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Le compagnon et sa contribution ; le palier suivant lorsque les deux îles de ce palier sont achevées.
- **Calculs :** 50 calculs ; addition, soustraction et multiplication ; borne 20 ; tables 1 à 5 (×1 à ×10) ; chrono 15 s, vies 5.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `brico-3` sauvegardée sans doublon.
- **Scène :** « La charpente est prête ! », 10 s. Les poutres forment une charpente ; le marteau rejoint le chantier.
- **Trois légendes :**
  1. Le phare a besoin d’un support solide.
  2. Brico assemble les poutres.
  3. La charpente soutiendra la grande lanterne !
- **Son et accessibilité :** musique de Brico, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

### Corail — La crique des mécanismes

- **Identité :** Un crabe méticuleux au gilet bleu marine. Ami de Pico, horloger du mécanisme.
- **Lien et obstacle :** Ami de longue date de Pico, isolé par la tempête ; les trois missions restaurent son île et son matériel.
- **Palier :** 3. **Contribution et texte du monde terminé :** Corail apporte le mécanisme qui fera tourner la lumière.
- **Décor :** crique de cuivre, cristaux et engrenages. **Tableau / carte :** `#683C40` / `#FFB19B` ; déclinaisons communes ci-dessus.
- **Pavé :** Coffre de cuivre fermé/ouvert, cristal et engrenage, coquillage d’effacement.
- **Assets :** [`keypad-corail.png`](../public/themes/keypad-corail.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 6, 132 BPM, triangle doux, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `corail-1` — Dégage les cristaux

- **Position / objectif :** mission 1, découverte ; dégage les cristaux.
- **Prérequis :** Tous les mondes des paliers précédents terminés. **Débloque :** La mission suivante du monde.
- **Calculs :** 30 calculs ; multiplication ; borne 20 ; tables 1 à 3 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `corail-1` sauvegardée sans doublon.
- **Scène :** « Les cristaux sont dégagés ! », 10 s. Les débris sortent de la crique et révèlent les cristaux.
- **Trois légendes :**
  1. Du sable recouvre les cristaux de la crique.
  2. Corail dégage leur lumière.
  3. Les cristaux étincellent à nouveau !
- **Son et accessibilité :** musique de Corail, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `corail-2` — Assemble les rouages

- **Position / objectif :** mission 2, action ; assemble les rouages.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 50 calculs ; multiplication ; borne 20 ; tables 1 à 5 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `corail-2` sauvegardée sans doublon.
- **Scène :** « Les rouages sont assemblés ! », 10 s. Trois rouages se rejoignent et tournent en sens alternés.
- **Trois légendes :**
  1. Les engrenages sont éparpillés.
  2. Corail ajuste chaque roue avec soin.
  3. Les trois rouages tournent ensemble !
- **Son et accessibilité :** musique de Corail, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `corail-3` — Répare le mécanisme

- **Position / objectif :** mission 3, accomplissement ; répare le mécanisme.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Le compagnon et sa contribution ; le palier suivant lorsque les deux îles de ce palier sont achevées.
- **Calculs :** 70 calculs ; multiplication ; borne 20 ; tables 1 à 7 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `corail-3` sauvegardée sans doublon.
- **Scène :** « Le mécanisme est réparé ! », 10 s. Un cristal rejoint la grande roue ; les engrenages tournent.
- **Trois légendes :**
  1. La grande roue du phare est bloquée.
  2. Corail insère le cristal et règle les rouages.
  3. Le mécanisme entraîne la lumière !
- **Son et accessibilité :** musique de Corail, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

### Nami — Le récif lumineux

- **Identité :** Un dauphin joyeux à l’écharpe lavande. Ami de Pico, guide du courant.
- **Lien et obstacle :** Ami de longue date de Pico, isolé par la tempête ; les trois missions restaurent son île et son matériel.
- **Palier :** 3. **Contribution et texte du monde terminé :** Nami apporte l’énergie du courant lumineux.
- **Décor :** récif bleu, bulles et éclairs. **Tableau / carte :** `#164F69` / `#83E5ED` ; déclinaisons communes ci-dessus.
- **Pavé :** Bulle magique fermé/ouvert, bulle lumineuse et éclair, coquillage d’effacement.
- **Assets :** [`keypad-nami.png`](../public/themes/keypad-nami.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 7, 134 BPM, triangle doux, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `nami-1` — Réveille les bulles

- **Position / objectif :** mission 1, découverte ; réveille les bulles.
- **Prérequis :** Tous les mondes des paliers précédents terminés. **Débloque :** La mission suivante du monde.
- **Calculs :** 50 calculs ; multiplication ; borne 20 ; tables 1 à 5 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `nami-1` sauvegardée sans doublon.
- **Scène :** « Les bulles lumineuses sont réveillées ! », 10 s. Quatre bulles lumineuses remontent du récif.
- **Trois légendes :**
  1. Le récif est plongé dans l’obscurité.
  2. Nami fait monter les bulles endormies.
  3. Le récif retrouve ses mille lumières !
- **Son et accessibilité :** musique de Nami, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `nami-2` — Libère le courant

- **Position / objectif :** mission 2, action ; libère le courant.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 70 calculs ; multiplication ; borne 20 ; tables 1 à 7 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `nami-2` sauvegardée sans doublon.
- **Scène :** « Le courant circule librement ! », 10 s. Un obstacle est retiré ; le courant circule et l’éclair traverse la scène.
- **Trois légendes :**
  1. Un obstacle retient l’énergie du récif.
  2. Nami libère le passage.
  3. Le courant lumineux rejoint l’île du phare !
- **Son et accessibilité :** musique de Nami, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `nami-3` — Alimente le phare

- **Position / objectif :** mission 3, accomplissement ; alimente le phare.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Le compagnon et sa contribution ; le palier suivant lorsque les deux îles de ce palier sont achevées.
- **Calculs :** 100 calculs ; multiplication ; borne 20 ; tables 1 à 10 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `nami-3` sauvegardée sans doublon.
- **Scène :** « Le phare reçoit son énergie ! », 10 s. Le courant et l’éclair rejoignent la lanterne du phare.
- **Trois légendes :**
  1. Le phare attend sa source d’énergie.
  2. Nami y conduit le courant lumineux.
  3. Il ne manque plus que le prisme !
- **Son et accessibilité :** musique de Nami, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

### Alba — L’île du phare

- **Identité :** Une chouette bienveillante à la cape violette. Amie de Pico, gardienne du phare.
- **Lien et obstacle :** Ami de longue date de Pico, isolé par la tempête ; les trois missions restaurent son île et son matériel.
- **Palier :** 4. **Contribution et texte du monde terminé :** Alba installe le prisme. Ensemble, vous rallumez le phare !
- **Décor :** île nocturne, prismes et rayons. **Tableau / carte :** `#303655` / `#FFE49A` ; déclinaisons communes ci-dessus.
- **Pavé :** Écrin fermé/ouvert, prisme et rayon lumineux, coquillage d’effacement.
- **Assets :** [`keypad-alba.png`](../public/themes/keypad-alba.png), les quatre poses et six sorties du contrat commun ; deux surprises propres aux objets.
- **Son :** variation maritime originale n° 8, 136 BPM, sinusoïde douce, basse et clochettes ; motif de victoire distinct. Voix **Classique**, annonces françaises existantes, Son/Voix/Réécouter conservés.

#### `alba-1` — Installe le prisme

- **Position / objectif :** mission 1, découverte ; installe le prisme.
- **Prérequis :** Tous les mondes des paliers précédents terminés. **Débloque :** La mission suivante du monde.
- **Calculs :** 50 calculs ; addition, soustraction et multiplication ; borne 20 ; tables 1 à 7 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `alba-1` sauvegardée sans doublon.
- **Scène :** « Le prisme est installé ! », 10 s. Pico et Alba placent le prisme dans la lanterne.
- **Trois légendes :**
  1. Alba garde le dernier élément du phare.
  2. Pico et Alba placent le prisme dans la lanterne.
  3. La lumière peut traverser le cristal !
- **Son et accessibilité :** musique de Alba, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `alba-2` — Oriente la lumière

- **Position / objectif :** mission 2, action ; oriente la lumière.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** La mission suivante du monde.
- **Calculs :** 75 calculs ; addition, soustraction et multiplication ; borne 20 ; tables 1 à 10 (×1 à ×10) ; chrono 10 s, vies 3.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `alba-2` sauvegardée sans doublon.
- **Scène :** « La lumière montre le chemin ! », 10 s. Le rayon pivote vers la mer et un bateau approche.
- **Trois légendes :**
  1. Le prisme doit éclairer le passage.
  2. Alba oriente le rayon vers la mer.
  3. Les bateaux peuvent retrouver la route !
- **Son et accessibilité :** musique de Alba, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

#### `alba-3` — Rallume le phare

- **Position / objectif :** mission 3, accomplissement ; rallume le phare.
- **Prérequis :** Mission précédente du monde réussie. **Débloque :** Le film collectif, une fois les 24 missions réussies.
- **Calculs :** 140 calculs ; addition, soustraction et multiplication ; borne 20 ; tables 1 à 10 (×1 à ×10) ; chrono 10 s, vies 3.
- **Quotas obligatoires :** 100 multiplications, 20 additions, 20 soustractions ; 140 au total.
- **Réussite :** toute la banque sélectionnée réussie, selon les règles communes. Acquisition `alba-3` sauvegardée sans doublon.
- **Scène :** « Le phare des îles brille ! », 10 s. Pico rejoint Alba ; le phare s’allume et un bateau passe.
- **Trois légendes :**
  1. Les huit amis ont tout préparé.
  2. Alba et Pico rallument le phare.
  3. Merci à tout l’équipage, l’archipel est sauvé !
- **Son et accessibilité :** musique de Alba, mode muet, préchargement, suspension et résultat immobile selon le contrat commun. Le titre de la scène sert de libellé accessible.

## Conclusion collective : 30 secondes

Accessible depuis la carte après `alba-3` et l’ensemble des 24 missions. Le contrôleur `LighthouseParty` est indépendant de l’anniversaire du chaton.

| Temps | Action | Légende |
| --- | --- | --- |
| 0–7 s | Arrivée progressive des huit personnages autour du phare | Après la tempête, les huit amis se retrouvent au phare. |
| 7–17 s | Chaque compagnon apporte sa pièce vers la lanterne : perle, voile, circuit, charpente, mécanisme, énergie, prisme | Perle, voiles, circuit, charpente, mécanisme, énergie et prisme : chacun apporte son talent ! |
| 17–22 s | Le phare s’allume, le faisceau s’oriente vers la mer | Pico et Alba rallument la lumière de l’archipel ! |
| 22–30 s | Trois bateaux traversent la mer ; les huit amis applaudissent par leurs mouvements de joie | Les bateaux retrouvent leur chemin. Bravo à tout l’équipage ! |
| Fin | Dernière image, commandes de rejeu et carte disponibles | Huit compagnons, un phare qui brille : merci pour cette aventure ! |

La bande originale locale `public/audio/pico-finale.wav` dure exactement 30 s : motif maritime, basse douce, clochette de l’allumage et applaudissements synthétiques. Le script Python standard `scripts/generate-pico-music.py` permet de la régénérer. Pause et reprise suspendent image et bande-son ; arrière-plan suspend automatiquement ; Son applique le mode muet au film, y compris au rejeu. La réduction des animations conserve les chapitres et apports visibles avec personnages immobiles, sans oscillations ni traversées. Les huit planches sont préchargées.

## Coexistence et sauvegardes

L’accueil conserve deux destinations : aventure et camp des fourmis. L’entrée aventure ouvre les cartes « L’aventure du chaton » et « Pico et le phare des îles », avec présentation, missions réussies et amis acquis. « Changer d’aventure » revient à ce choix.

`AdventureDefinition` regroupe identité, héros, textes, mondes, missions, récompenses, régions et identité de conclusion ; les scènes sont indexées par les identifiants de ses missions. Les fonctions de progression prennent cette définition, avec le chaton par défaut pour compatibilité. Les exports historiques `worlds` et `stages` continuent de désigner le chaton. Les 17 thèmes sont 16 mondes d’aventure et le camp : une liste de thèmes ne constitue plus un parcours.

| Aventure | Clé | Format |
| --- | --- | --- |
| Chaton | `calcul-party:adventure:v1` | `{ "completed": ["kitten-1", …] }` |
| Pico | `calcul-party:adventure:pico:v1` | `{ "completed": ["pico-1", …] }` |
| Camp | `calcul-party:training:v1` | Format du camp conservé |

Les deux résumés sont lus pour le choix d’aventure ; pendant le jeu, seule l’aventure active est chargée dans le moteur et écrite. Changer d’aventure conserve les deux progressions. Les identifiants inconnus, duplications et acquis sans prérequis sont filtrés à la relecture. Une corruption ou un stockage bloqué n’empêchent pas de jouer. La progression reste en mémoire pour la visite ; une suppression refusée ne remet pas la progression à zéro. Réinitialiser efface uniquement l’aventure choisie, après confirmation. Le film ne crée aucun nouvel acquis. L’anniversaire et son lien `?fete=1` restent associés au chaton.

## Vérifications et maintenance

- Huit personnages, huit mondes, 24 titres et 24 scènes Pico ; 48 scènes avec le chaton.
- Tests des banques, des deux parcours, des quotas finaux, du rejeu, des sauvegardes indépendantes et de la corruption.
- Tests navigateur du choix, de la persistance, du reset actif, du stockage bloqué et des deux films.
- `npm run test:keypad` obligatoire : les 16 mondes, six sorties réelles, appuis répétés, clic/clavier, nettoyage et réduction des animations.
- Les 48 récompenses sont parcourues avec capture à des largeurs 390, 768 et 1365 px ; les images sont décodées réellement. Les films sont contrôlés pour durée, son, suspension et réduction des mouvements.
- `npm test`, `npm run build`, `npm run test:e2e`. Le tactile est simulé dans Edge ; un essai sonore et tactile sur tablette physique, notamment Safari/iPadOS, reste un contrôle d’appareil distinct.

Les boîtes à plusieurs sorties par appui, les dialogues vocaux nouveaux, un quatrième niveau par monde, les combats et la migration vers un stockage distant restent des extensions du moteur. La coexistence de deux aventures et la conclusion propre à Pico sont désormais disponibles.
