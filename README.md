# Calcul’Party

Un jeu de calcul mental en français : deux aventures de huit mondes chacune et un camp d’entraînement personnalisable avec des fourmis bâtisseuses. Additions, soustractions, multiplications, voix locales et sauvegarde sur l’appareil.

## Créer une aventure ou une mission

Consulter le [guide de création des aventures](docs/creation-aventure.md) : histoire, huit personnages dont le héros, huit mondes, 24 missions, palettes, touches animées, calculs, scènes de réussite et modèles de brief.

## Jouer en local

PrÃ©requis : Node.js 22.12 ou plus rÃ©cent (vÃ©rifiÃ© avec Node.js 24.13 sous Windows).

Dans le dossier `C:\code\Multiplication` :

```powershell
npm install
npm run dev
```

Ouvrir lâ€™adresse locale affichÃ©e par Vite, gÃ©nÃ©ralement <http://localhost:5173>.

Pour jouer sur une tablette, laisser le serveur actif sur le PC, connecter les deux appareils au mÃªme Wi-Fi, puis ouvrir lâ€™adresse **Network** correspondant au Wi-Fi du PC (par exemple `http://192.168.1.136:5173`). Lâ€™adresse IP peut changer. Si Windows demande lâ€™autorisation rÃ©seau, autoriser Node.js sur le rÃ©seau privÃ©. Aucun changement du pare-feu nâ€™est effectuÃ© par le projet.

## RÃ¨gles et commandes

### Lâ€™aventure du chaton

Le bouton **Explorer la carte** ouvre un parcours séparé du **camp d’entraînement**, avec ses propres missions et sa progression indépendante.

- Huit mondes et **24 missions de 5 Ã  140 calculs** : le jardin du chaton, puis licorne/extraterrestre, NoÃ«l/Halloween, sorcier/dragon et la grande fÃªte.
- Les trois missions dâ€™un monde se suivent. AprÃ¨s le jardin, chaque palier propose deux destinations au choix ; terminer les deux ouvre le palier suivant.
- Le jardin commence par des additions jusquâ€™Ã  5, puis 8 et 10. La licorne reste facile (10/15/20 calculs), tandis que lâ€™extraterrestre va jusquâ€™Ã  30 calculs et des nombres plus grands. NoÃ«l propose 20/30/40 additions et soustractions ; Halloween mÃ©lange les trois opÃ©rations sur 20/30/50 calculs. Le sorcier exige toutes les tables 1â€“3, puis 1â€“5 et 1â€“7 (30/50/70 calculs). Le dragon exige toutes les tables 1â€“5, 1â€“7, puis 1â€“10 (50/70/100 calculs). La fÃªte propose 50, 75, puis 140 calculs : les 100 multiplications ordonnÃ©es des dix tables, 20 additions et 20 soustractions. Les difficultÃ©s sont affichÃ©es sur la carte. Les missions dÃ©jÃ  validÃ©es avant ce rÃ©Ã©quilibrage restent acquises.
- **Chrono et vies progressifs** : Chaton sans chrono et essais illimitÃ©s ; Licorne et Extraterrestre 30 secondes par calcul et 7 vies ; NoÃ«l et Halloween 15 secondes et 5 vies ; Sorcier, Dragon et fÃªte finale 10 secondes et 3 vies. Une erreur ou un dÃ©passement coÃ»te un cÅ“ur, affiche la correction pendant 2 secondes et remet le calcul en attente. Ã€ zÃ©ro cÅ“ur, la mission est perdue : on peut la recommencer avec tous ses cÅ“urs et zÃ©ro calcul validÃ©, sans perdre les missions dÃ©jÃ  gagnÃ©es. Les calculs dÃ©jÃ  rÃ©ussis ne reviennent pas pendant une tentative. Le chrono commence avec le calcul lisible, attend la prÃ©paration vocale et se suspend en pause. Les rÃ©glages de partie libre restent indÃ©pendants.
- Chaque mission dÃ©clenche la danse de victoire ; terminer un monde invite son personnage. La derniÃ¨re mission rÃ©unit les huit amis, et la fÃªte peut Ãªtre rejouÃ©e depuis la carte.
- La progression est sauvegardÃ©e dÃ¨s la rÃ©ussite dâ€™une mission, dans `calcul-party:adventure:v1`, indÃ©pendamment des prÃ©fÃ©rences et records de partie libre. Les missions terminÃ©es peuvent Ãªtre rejouÃ©es sans dupliquer les rÃ©compenses.
- Sur la carte, **RÃ©initialiser les missions** demande confirmation puis supprime uniquement la sauvegarde de lâ€™aventure sur cet appareil. Les amis et missions sont remis Ã  zÃ©ro ; les rÃ©glages et records de partie libre sont conservÃ©s. Si le navigateur refuse la suppression, la progression reste intacte et un message permet de rÃ©essayer.
- Chacune des 24 missions se termine par une scÃ¨ne illustrÃ©e de **10 secondes** reprÃ©sentant son rÃ©sultat : pelotes rassemblÃ©es, goÃ»ter servi, maison dÃ©corÃ©e, fleurs rÃ©veillÃ©es, soucoupe rÃ©parÃ©e, traÃ®neau chargÃ©, lanternes allumÃ©es, potions rangÃ©es, balais volants, coffre au trÃ©sor et grande fÃªte avec les huit amis. Trois lÃ©gendes accompagnent lâ€™action et la musique de lâ€™univers couvre la scÃ¨ne. La danse de la partie libre garde sa durÃ©e habituelle.
- Ces rÃ©compenses se figent quand lâ€™onglet passe en arriÃ¨re-plan et reprennent au retour, musique comprise. Avec la rÃ©duction des animations, le rÃ©sultat final est affichÃ© immobile pendant les mÃªmes dix secondes. Les illustrations sont prÃ©chargÃ©es pendant la mission ; le mode muet reste disponible.
- Les scÃ¨nes et leurs trajectoires sont dÃ©finies dans `src/mission-rewards.ts`, avec trois planches originales transparentes `public/themes/rewards-{a,b,c}.png`. Les tests parcourent les 24 fins de mission dans le navigateur, sur des largeurs tÃ©lÃ©phone, tablette et ordinateur ; ils ne remplacent pas un essai sur tablette physique.
- Depuis la pause, **Retour Ã  la carte** conserve les missions terminÃ©es. Une mission quittÃ©e en cours ou interrompue par un rechargement recommence au dÃ©but ; les autres Ã©tapes restent acquises. En cas de stockage indisponible, un message indique que la progression vaut uniquement pour la visite en cours.

### Le camp des petites fourmis

L’accueil propose **Partir à l’aventure** et **S’entraîner avec les fourmis**. Le camp remplace la partie libre et reste accessible dès le départ. Ses personnages, son pavé, sa musique et ses récompenses utilisent un univers original de fourmis en casque de chantier, illustré dans `public/themes/ants.png`, avec trois poses sélectionnées par `src/ants.ts`.

- **Les missions** : Premiers calculs (10 additions jusqu’à 10), Mes tables (20 calculs des tables de 2 et 5), Grand mélange (20 calculs, additions/soustractions jusqu’à 20, tables de 1 à 5). Ces propositions sont sans chrono et à essais illimités, puis entièrement modifiables.
- **L’atelier** : sélection indépendante des trois opérations ; bornes de 1 à 100 pour les opérandes et le résultat des additions/soustractions ; retenue ou emprunt autorisé, exclu ou obligatoire ; zéro facultatif ; tables individuelles de 1 à 10 et intervalle de multiplicateurs de 0 à 10 (zéro seulement si autorisé).
- **Ma séance** : 5/10/20/30/50/100 calculs, quantité personnalisée de 1 à 100, ou toute la banque disponible. Un résumé, trois exemples et la taille de la banque sont affichés avant le départ. Un réglage impossible bloque le départ avec une explication, sans modifier les choix.
- **Mon rythme** : sans chrono ou 5/10/15/30 secondes ; essais illimités ou 1 à 10 vies. Les mélanges équilibrent les opérations et redistribuent le quota d’une petite banque épuisée. Les couples ordonnés restent distincts et un calcul réussi ne revient pas dans la même séance.
- Une erreur affiche la correction pendant deux secondes et replace le calcul en attente. La saisie se valide automatiquement à la longueur attendue, y compris zéro et 100. Pause, reprise, clavier, tactile, effacement et arrière-plan conservent les règles du moteur existant.
- **La fourmilière** : chaque réussite donne un matériau immédiatement sauvegardé. Aucun matériau n’est retiré en cas d’erreur, de défaite ou de départ anticipé. Le joueur lance lui-même chaque chantier : passerelle (60 matériaux), garde-manger (90), dortoir (120), jardin (180), tour d’observation (240), place des fêtes (300). Le bouton **Construire maintenant** dépense ce coût, conserve le surplus et lance une animation de 2,4 secondes. Après les six chantiers (990 matériaux au total), une étoile supplémentaire coûte 300 matériaux et demande elle aussi un clic. La vue en coupe montre les pièces meublées et les aménagements acquis. Les anciennes constructions et étoiles sont conservées lors de la migration ; seuls les nouveaux chantiers suivent ces coûts. Aucun réglage n’est verrouillé.
- Le bilan montre réussites, erreurs, temps de réflexion et matériaux ; il permet de rejouer, modifier la séance ou retourner au camp. Un meilleur temps est enregistré uniquement avec chrono et vies limités, pour la configuration effective complète. Les séances sans contraintes affichent un bilan personnel.

La sauvegarde du camp est indépendante dans **`calcul-party:training:v1`** : derniers réglages, matériaux et records. Au premier accès, un ancien joueur retrouve ses réglages de partie libre ; les anciennes préférences et les anciens records ne sont pas supprimés. Ceux-ci restent consultables depuis la fourmilière. Sans stockage, un message indique que les changements restent pour cette visite. Une séance en cours ne reprend pas après rechargement, mais les matériaux déjà enregistrés restent acquis.

Les réglages **Son** et **Voix** restent accessibles en haut. La voix du camp peut être Classique ou Fourmi malicieuse. Les annonces déjà disponibles sont conservées ; les nouveaux calculs utilisent 104 fragments français locaux (0 à 100, plus, moins, fois), assemblés avant l’affichage du calcul. Ils sont générés avec `scripts/generate-training-voice.ps1` (Microsoft Julie, PCM mono 22,05 kHz), puis leurs silences sont ajustés. Aucun service externe ni moteur vocal du navigateur n’est requis. Le chargement reste borné à cinq secondes ; pause, arrêt, réécoute et poursuite sans voix empêchent les lectures tardives. Le cache des annonces assemblées reste limité.

La progression du camp n’invite aucun ami de l’aventure. Réinitialiser l’aventure conserve le camp et ses matériaux. Les divisions, nombres négatifs et tables supérieures à 10 ne sont pas proposés.

## Compiler et vÃ©rifier

```powershell
npm test
npm run build
npm run test:e2e
```

- Les tests Vitest couvrent la pioche, les rÃ©ponses de un Ã  trois chiffres, les erreurs, les quatre dÃ©lais, les vies et tables configurables, les pauses, les conditions de fin et les sauvegardes.
- Les tests Playwright lancent la **version compilÃ©e** sur le port 4173 dans Microsoft Edge installÃ© sur Windows. Ils vÃ©rifient une victoire complÃ¨te, la dÃ©faite, les commandes, la persistance, les positions et rotations, le signal de mise en arriÃ¨re-plan, le graphe Web Audio et le mode muet.
- Les formats testÃ©s sont 1365 Ã— 900, 768 Ã— 1024, 1024 Ã— 768 et 390 Ã— 844, avec Ã©vÃ©nements tactiles simulÃ©s. Les captures sont produites dans `test-results/` (non versionnÃ©).
- Les vÃ©rifications automatisÃ©es utilisent une horloge virtuelle pour parcourir les parties et une interruption de visibilitÃ© simulÃ©e. Elles ne remplacent pas un essai tactile et sonore sur une tablette physique, notamment sous Safari/iPadOS.

`npm run build` crÃ©e le dossier `dist/`, prÃªt Ã  servir sur un hÃ©bergement statique Ã  la racine dâ€™un domaine. `npm run preview` permet de le consulter localement. Le site Sites existant est privÃ© : https://multipli-party.aurelienboudoux.chatgpt.site. Son dossier de livraison `.site-checkout/` est sÃ©parÃ© du dÃ©pÃ´t local et conserve son identitÃ© dans `.openai/hosting.json`.

## Organisation

- `src/calculations.ts` : opÃ©rations, banques, sÃ©lection Ã©quilibrÃ©e et configuration des parties.
- `src/game.ts` : moteur dÃ©terministe, sans DOM et pilotÃ© par une horloge fournie.
- `src/main.ts` et `src/style.css` : interface, clavier/tactile et mise en page adaptative.
- `src/audio.ts` et `src/particles.ts` : synthÃ¨se sonore locale et confettis.
- `src/voice.ts` et `public/voice/fr/` : lecture des 562 annonces franÃ§aises, cache audio et annulation des lectures dÃ©passÃ©es.
- `src/storage.ts` : lecture contrÃ´lÃ©e des prÃ©fÃ©rences et records ; tolÃ©rance au stockage indisponible.
- `tests/unit/` et `tests/e2e/` : rÃ¨gles et parcours navigateur.

Lâ€™interface ne charge aucun service externe. Les polices Kalam sont livrÃ©es localement sous licence SIL Open Font License ; voir `public/fonts/OFL.txt`. La mascotte et les illustrations sont dessinÃ©es en SVG/CSS. La musique et les effets arcade sont produits avec Web Audio. Le bruitage de foule dÃ©Ã§ue provient de [mrrap4food sur Freesound](https://freesound.org/people/mrrap4food/sounds/619007/), sous licence **CC0 1.0** ; il est inclus localement, avec sa provenance et les adaptations dans `public/sounds/CREDITS.md`.

Les annonces franÃ§aises ont Ã©tÃ© gÃ©nÃ©rÃ©es avec la voix Windows Microsoft Julie, en PCM mono 22,05 kHz (562 fichiers locaux). Le script `scripts/generate-voice.ps1` complÃ¨te les fichiers manquants sous PowerShell 7 / Windows avec `System.Speech`, en passant Ã©ventuellement `-VoiceName` pour sÃ©lectionner une autre voix franÃ§aise installÃ©e. Ce script n'est pas nÃ©cessaire pour lancer le jeu sur un autre appareil.

Les tests audio contrôlent les annonces et les 104 fragments locaux, leur format et leur début audible. Les essais navigateur comparent le calcul visible et l’annonce démarrée, avec réseau ralenti, interruption, échec de chargement, réécoute et reprise sans voix. La synchronisation des 19 additions contenant 10 est vérifiée avec les voix Classique et Fourmi. Ces mesures ne remplacent pas un essai sonore sur appareil physique.

### Univers et illustrations

Les seize mondes des deux aventures conservent leurs illustrations, personnages, mélodies, voix, surprises et scènes de récompense. L’univers des fourmis est réservé au camp ; il utilise une mascotte illustrée originale et un décor vectoriel et une musique synthétisée localement. Tous respectent le mode muet et la réduction des animations.

Les anciens sélecteurs d’univers et les cinq boutons de partie libre sont remplacés par les deux destinations de l’accueil et l’atelier. Les préférences historiques restent conservées pour les voix des univers de l’aventure. Le raccourci de prévisualisation **Ctrl + Alt + V** reste disponible au repos et n’attribue ni record ni matériau.

### Organisation du camp

- `src/training.ts` : configuration, banques filtrées, répartition des questions, import des anciens réglages, sauvegarde et attribution des matériaux.
- `src/training-ui.ts` et `src/training.css` : missions proposées, atelier, fourmilière et présentation adaptative.
- `src/ants.ts` : affichage des trois poses de fourmi ; `src/colony-scene.ts` et `src/colony.css` : village vectoriel en coupe, pièces meublées et animation de construction.
- `src/main.ts` : navigation et branchement au moteur partagé ; `src/voice.ts` : assemblage des annonces locales.
- Les tests du camp couvrent les calculs jusqu’à 100, les tables non consécutives, les filtres, les matériaux, les anciens réglages, les records, la voix, le stockage indisponible et les formats téléphone/tablette/ordinateur. Les tests des anciens écrans de partie libre ont été adaptés au camp et aux missions d’aventure.

Les tests navigateur utilisent Edge et un tactile simulé. Ils ne remplacent pas un essai tactile et sonore sur Safari/iPadOS et sur tablette physique.

### Protection des animations du pavé

`npm run test:keypad` lance les tests du pavé et ceux de la sortie des personnages. `tests/e2e/keypad-pop.spec.ts` vérifie les seize mondes des deux aventures sur mobile et ordinateur : image réellement chargée, personnage visible au-dessus de la boîte, saisie par clic et clavier, relance sur la même touche, alternance de six illustrations originales (quatre personnages et deux objets), disparition après l’animation et lors d’une pause. Le mode de réduction des animations conserve la saisie sans faire sortir le personnage. Ces tests sont également inclus dans `npm run test:e2e`.

Illustration des fourmis : `public/themes/ants.png`, générée avec l’outil intégré Imagegen. Brief : fourmi adorable de style album jeunesse, casque jaune, salopette bleue, corps caramel, grands yeux expressifs, fond transparent ; trois poses du même personnage : accueil souriant, danse joyeuse et petite déception. `src/ants.ts` cadre les poses dans des fenêtres SVG pour conserver la transparence et les animations.


### Pico et le phare des îles

L’entrée aventure propose le chaton et **Pico et le phare des îles** : huit animaux amis réparent ensemble le phare de leur archipel, en 24 missions. Les règles pédagogiques restent celles du chaton, avec une progression indépendante dans `calcul-party:adventure:pico:v1`. Une réinitialisation n’efface que l’aventure choisie et conserve l’autre aventure ainsi que le camp. Les huit planches originales, 24 récompenses de dix secondes, deux surprises par île et le film collectif de trente secondes utilisent des animaux de style album jeunesse et une musique maritime originale.

Voir les [fiches complètes de l’aventure Pico](docs/aventure-pico.md) et le [guide de création des aventures](docs/creation-aventure.md). Les sources spécifiques sont `src/pico-content.ts`, `src/pico-themes.ts`, `src/pico-rewards.ts`, `src/pico-art.ts`, `src/lighthouse-party.ts` et `src/pico.css`. Le choix et la progression sont reliés par `src/adventure.ts`, `src/adventure-map.ts` et `src/main.ts`. Les tests de récompenses couvrent maintenant les 48 missions et les contrôles du pavé couvrent les 16 mondes d’aventure. L’anniversaire du chaton et `?fete=1` restent disponibles.
