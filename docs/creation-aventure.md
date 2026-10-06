# Concevoir une aventure Calcul’Party

Ce guide sert de référence pour créer une aventure à partir d’un thème, d’une ambiance ou d’une demande d’invention libre. Il couvre l’histoire, les personnages, les mondes, les calculs et tous les éléments visuels et sonores à préparer. Pour ajouter une seule mission, reprendre la fiche mission et les éléments de l’aventure concernée.

**Format de référence : huit personnages au total, dont un héros et sept autres personnages ; huit mondes ; trois missions par monde ; 24 missions.** Le monde de départ appartient au héros. Les six mondes intermédiaires et le monde final correspondent aux sept autres personnages. Les figurants et les petites créatures décoratives ne comptent pas comme de nouveaux personnages principaux.

Les règles ci-dessous distinguent **l’existant**, les **choix de création** et les **extensions du moteur**. Inventer un nouvel univers ne signifie pas que toutes les variantes de jeu sont déjà prises en charge.

## 1. Construire une histoire qui relie les huit personnages

Commencer par une idée exprimable en deux ou trois phrases : qui est le héros, que veut-il accomplir, pourquoi a-t-il besoin des autres et que se passera-t-il à la fin ? Le thème doit relier les rencontres, et pas seulement fournir huit habillages différents.

Pour chacun des sept autres personnages, définir son lien avec le héros, son problème ou son obstacle, ce que le joueur fait pour lui et sa contribution au dénouement. La rencontre peut consister à aider, retrouver, recruter, délivrer ou affronter le personnage. Pour un affrontement, prévoir une résolution compréhensible et adaptée aux enfants. Le moteur actuel mesure la réussite par les calculs : un combat avec points de vie d’adversaire ou attaques serait une extension, pas un simple changement d’histoire.

Les trois missions d’un monde forment une petite histoire :

1. **Découverte** : comprendre le lieu et commencer à résoudre son problème.
2. **Action** : réparer, rassembler, préparer ou surmonter un obstacle.
3. **Accomplissement** : obtenir l’aide du personnage, résoudre la rencontre ou achever le monde.

Exemple actuel : « Allume les étoiles », « Répare la soucoupe », puis « Invite Ziggy ». Chaque réussite montre un résultat concret, et la soucoupe ou les bulles peuvent réapparaître dans le dénouement.

### Carte et déblocages

| Palier | Mondes | Rôle dans le parcours |
| --- | --- | --- |
| 0 | 1 monde du héros | Introduire l’histoire et les premières règles |
| 1 | 2 mondes | Proposer deux premiers voyages au choix |
| 2 | 2 mondes | Développer les préparatifs et la difficulté |
| 3 | 2 mondes | Proposer les défis avancés |
| 4 | 1 monde final | Résoudre l’objectif commun |

Dans l’existant, les trois missions d’un monde se débloquent dans l’ordre. Les deux mondes d’un même palier sont accessibles ensemble ; leurs missions peuvent être alternées. Tous les mondes des paliers précédents doivent être terminés pour ouvrir le suivant. Une mission réussie reste rejouable.

La carte présente le nom du monde, son portrait, sa difficulté, ses trois missions, leurs contraintes et leur état : verrouillée, disponible ou réussie. Prévoir également le texte du monde terminé, la représentation du personnage acquis et le signalement des nouvelles missions disponibles. La carte adapte ses textes aux « amis invités » du chaton ou aux « compagnons retrouvés » de Pico ; une autre aventure devra définir son vocabulaire. L’interface du chaton parle d’« amis invités » : une aventure de confrontation nécessiterait d’adapter ces textes et états visuels.

## 2. Donner une identité complète à chaque personnage et monde

La fiche personnage doit contenir : nom, personnalité, silhouette reconnaissable, accessoires, rôle narratif, lien avec le héros, particularité du monde et apport à la conclusion. Conserver la même identité entre portrait, compagnon, récompense et scène finale.

Prévoir ses représentations d’**accueil**, d’**attente**, de **réaction à la saisie ou à une réussite**, de **victoire** et de **déception**. Ces états peuvent utiliser des poses illustrées, des transformations ou des éléments séparés, sans exiger une image différente pour chaque mouvement. Une déception doit encourager à réessayer. Prévoir aussi le portrait sur la carte et l’état du personnage lorsque son monde est terminé.

Le compagnon du pavé reste dans sa case en bas à gauche, à côté de zéro. Son attente et ses réactions restent contenues dans cette case : elles ne doivent pas masquer les touches voisines.

### Décor et palette

Définir les motifs du décor, leur position et leur discrétion, puis une palette avec des valeurs de couleur précises :

- Fond de page, fond du tableau, cadre et panneaux.
- Texte principal et secondaire, bordures, accent et couleur complémentaire.
- Couleur de la carte du monde et couleurs des particules de célébration.

**La couleur de la carte n’est pas le fond du tableau.** Dans l’existant, la première vient du monde ; les fonds, textes et accents viennent de variables CSS propres à l’univers. Vérifier les contrastes et les états normal, survol, appui, désactivé, erreur et urgence. Ne pas utiliser la couleur comme seul indicateur de réussite ou de verrouillage.

Les chiffres doivent rester clairement identifiables quelle que soit la palette. Choisir le style graphique de toute l’aventure avant de produire les illustrations : proportions, contours, éclairage, niveau de détail et transparence doivent rester cohérents.

## 3. Concevoir les touches, leurs objets et leurs animations

### Contenant et planche d’illustrations

Chaque monde possède un contenant lié à son histoire : coffre, cadeau, capsule, panier, boîte magique… Prévoir sa version **fermée**, sa version **ouverte**, les éléments qui sortent et une illustration pour l’effacement. Réserver une zone lisible au chiffre ; son placement peut être ajusté selon le contenant.

Le pavé actuel utilise une planche transparente de **3 × 3 cases** par univers, dans cet ordre :

| Ligne | Première case | Deuxième case | Troisième case |
| --- | --- | --- | --- |
| 1 | Contenant fermé | Contenant ouvert | Personnage 1 / compagnon |
| 2 | Personnage 2 | Personnage 3 | Personnage 4 |
| 3 | Objet 1 | Objet 2 | Illustration d’effacement |

Les quatre personnages de cette planche peuvent être des poses, variantes ou petites créatures du monde ; ils ne s’ajoutent pas à la distribution des huit personnages principaux. Les deux objets doivent être liés au monde et suffisamment différents pour enrichir les appuis successifs.

### Trois animations à ne pas confondre

| Animation | Déclencheur | Fonction |
| --- | --- | --- |
| Ouverture d’une touche | Chaque chiffre accepté, par clic, tactile ou clavier | Accompagner la saisie |
| Réaction du compagnon | Saisie ou effacement ; attente pendant la partie | Donner une présence au personnage |
| Surprise du monde | Certaines bonnes réponses | Récompenser ponctuellement le joueur |

**Existant du pavé :** l’image fermée devient ouverte ; un élément apparaît depuis la boîte, monte, puis disparaît. L’appui dure environ **600 ms**. Six illustrations alternent : quatre personnages et deux objets. Un seul élément sort par appui ; des touches distinctes peuvent toutefois s’animer simultanément. Un nouvel appui sur la même touche relance l’animation immédiatement.

Pour chaque animation, définir le déclencheur, les éléments visibles, leur nombre, la trajectoire, la durée et le retour à l’état initial. L’effacement a sa propre réaction. Les éléments décoratifs ne capturent aucun clic, et la saisie est traitée avant leur animation. En pause, à la sortie ou en arrière-plan, les effets du pavé sont nettoyés. Une image indisponible doit laisser des touches utilisables.

**Variante à développer :** plusieurs éléments sortant de la même boîte pendant un seul appui. Décrire alors quantité, décalage, trajectoires, disparition et budget visuel ; le contrôleur actuel ne fournit qu’un élément par touche. Une ouverture avec un couvercle articulé serait également une adaptation, puisque l’existant échange deux images.

**Surprises existantes :** premier effet après trois bonnes réponses, puis tous les trois à cinq succès, avec alternance des effets du monde. Leur durée actuelle est de 2,4 à 3 secondes. Définir illustrations, nombre d’éléments, déplacement et bruitage, en laissant le calcul lisible. Ces effets ne changent ni les questions, ni le chrono, ni les vies.

## 4. Définir les missions et leur difficulté

Une mission associe un objectif narratif à un défi de calcul explicite : titre, opérations, bornes, tables, quantité, chrono, vies et résultat attendu. Ne pas choisir une quantité supérieure à la banque de questions distinctes disponible ; contrôler les quotas lorsqu’un mélange impose un nombre précis de chaque opération.

### Référence actuelle, adaptable à une nouvelle aventure

| Monde actuel | Calculs des missions 1 / 2 / 3 | Contenu | Chrono par calcul | Vies |
| --- | --- | --- | --- | --- |
| Chaton | 5 / 8 / 10 | Additions jusqu’à 5 / 8 / 10 | Aucun | Illimitées |
| Licorne | 10 / 15 / 20 | Addition, soustraction, puis mélange ; bornes 10 / 10 / 12 | 30 s | 7 |
| Ziggy | 15 / 20 / 30 | Addition, soustraction, puis mélange ; bornes 15 / 15 / 20 | 30 s | 7 |
| Père Noël | 20 / 30 / 40 | Additions et soustractions jusqu’à 20 | 15 s | 5 |
| Citrouille | 20 / 30 / 50 | Trois opérations ; bornes 20 ; tables jusqu’à 2 / 3 / 5 | 15 s | 5 |
| Sorcier | 30 / 50 / 70 | Multiplications ; tables de 1 à 3 / 5 / 7 | 10 s | 3 |
| Dragon | 50 / 70 / 100 | Multiplications ; tables de 1 à 5 / 7 / 10 | 10 s | 3 |
| Étoile | 50 / 75 / 140 | Trois opérations ; bornes 20 ; tables jusqu’à 7 / 10 / 10 | 10 s | 3 |

Les bornes concernent les opérandes **et** le résultat des additions et soustractions. Les multiplications utilisent les tables indiquées, avec des multiplicateurs de 1 à 10. Le dernier défi contient les 100 multiplications ordonnées des dix tables, 20 additions et 20 soustractions ; `2 × 3` et `3 × 2` sont deux questions distinctes.

Ces valeurs constituent le réglage actuel, pas une obligation pour chaque thème. Par défaut, les conserver lors d’un changement d’univers. Toute modification pédagogique doit rester progressive et être vérifiée sur les banques de calculs. Le moteur d’aventure ne propose actuellement ni division ni résultat négatif ; les réglages étendus du camp ne se transposent pas automatiquement à l’aventure.

### Déroulement d’une tentative

- Réussir tous les calculs de la mission avant d’épuiser ses vies valide la mission. Un calcul déjà réussi ne revient pas pendant cette tentative.
- Une erreur ou un délai dépassé coûte une vie lorsqu’elles sont limitées. La correction apparaît pendant deux secondes, puis le calcul reste à résoudre dans la banque.
- La saisie se valide automatiquement à la longueur attendue ; clavier, tactile et effacement doivent rester opérationnels.
- Le chrono attend la préparation vocale avant de démarrer avec le calcul visible. La pause suspend la partie ; la reprise conserve la tentative.
- À zéro vie, recommencer restaure les vies et repart de zéro calcul validé, en conservant les missions précédemment gagnées.
- Quitter vers la carte ou recharger abandonne la tentative en cours. Rejouer une mission réussie ne duplique pas son acquisition.

## 5. Préparer 24 scènes de réussite et un dénouement

**Chaque mission possède sa propre scène**, qui montre ce que le joueur vient d’accomplir : fleurs réveillées, véhicule réparé, trésor découvert… Une danse générique ou un simple changement de couleur ne remplace pas cette conclusion narrative.

Préparer pour chacune des **24 scènes** : titre, personnages présents, objets, état initial, action, trajectoires, état final, trois légendes et accompagnement musical. Réutiliser les illustrations cohérentes entre les scènes sans répéter la même action partout.

L’existant dure **dix secondes de temps visible** : une première légende présente la situation de 0 à 3 s, une deuxième accompagne l’action de 3 à 7 s, une troisième montre le résultat de 7 à 10 s. Les trajectoires couvrent toute la scène. La musique du monde couvre la récompense ; la saisie de calcul est bloquée. La progression est sauvegardée dès la réussite, avant la fin de l’animation.

Distinguer trois résultats :

1. **Mission réussie** : une action accomplie et une scène spécifique.
2. **Monde terminé** : trois missions réussies, personnage acquis et contribution annoncée.
3. **Aventure terminée** : huit mondes achevés, objectif commun résolu et huit personnages présents dans le dénouement.

La dernière mission conserve sa scène de dix secondes. Dans l’aventure actuelle, une célébration distincte de **30 secondes** est accessible avec le bouton de fête sur la carte une fois les 24 missions terminées : Ziggy apporte le gâteau, les amis chantent pour le chaton, les bougies sont soufflées et le Père Noël distribue les cadeaux. Elle peut être rejouée depuis la carte. Pour un autre thème, concevoir une conclusion collective liée à l’objectif du héros ; définir son contrôleur de conclusion. Pico dispose de son propre film de 30 secondes : réunion des huit amis, installation des apports, allumage du phare et passage des bateaux. Les deux films partagent les commandes Son, pause/reprise, rejeu et retour à la carte ; `?fete=1` conserve la prévisualisation de l’anniversaire du chaton.

## 6. Prévoir le son, les assets et les contraintes de jeu

**Son et voix.** Définir musique d’attente ou de partie, tempo, instruments, musique de victoire et bruitages utiles. Le système actuel synthétise les musiques d’univers avec Web Audio et lit des annonces françaises locales. Les voix de personnages sont des profils appliqués à ces annonces ; une nouvelle voix enregistrée ou un nouveau dialogue demande des assets supplémentaires. Respecter les commandes Son et Voix, la réécoute et la synchronisation entre annonce et calcul. Éviter que musique et effets couvrent la voix.

**Illustrations.** Préparer portraits, poses, décor, planche du pavé, objets de récompense et scène finale. Utiliser des fonds transparents pour les éléments superposés, un cadrage constant et des marges qui empêchent les cases voisines de déborder dans une planche. Vérifier les images réellement décodées et visibles, pas seulement leurs chemins. Précharger les assets nécessaires avant la récompense ; vérifier que toute ressource requise est livrée. Le pavé possède un repli fonctionnel sans illustration ; les autres scènes doivent être contrôlées séparément.

**Affichage et accessibilité.** Vérifier téléphone, tablette et ordinateur, les changements d’orientation et l’absence de débordement horizontal. Garder des touches d’au moins 44 px, des libellés accessibles, un focus visible et une zone de calcul dégagée. Avec réduction des animations, le pavé accepte la saisie sans sortie d’élément, les surprises sont supprimées et les récompenses de mission montrent leur état final immobile pendant dix secondes. Les scènes de réussite se suspendent avec leur musique en arrière-plan et reprennent au retour.

**Sauvegarde.** Les missions acquises sont enregistrées sur l’appareil dans la clé de l’aventure active : `calcul-party:adventure:v1` pour le chaton et `calcul-party:adventure:pico:v1` pour Pico. Seules les missions réussies sont conservées, pas une tentative interrompue. Une sauvegarde bloquée doit être signalée sans empêcher de jouer ; une sauvegarde corrompue ne doit pas débloquer un monde tardif. La réinitialisation de l’aventure demande confirmation et conserve le camp des fourmis, ses matériaux et ses réglages.

**Plusieurs aventures.** La coexistence est disponible : l’entrée aventure ouvre un choix entre le chaton et [Pico et le phare des îles](aventure-pico.md). Chaque `AdventureDefinition` porte une identité, ses textes, ses mondes, ses missions, ses récompenses et son contrôleur final. Passer cette définition aux fonctions de progression, à la carte et aux sauvegardes ; ne pas assimiler la liste des thèmes à une seule aventure. Les exports historiques `worlds` et `stages` restent ceux du chaton. Conserver sa clé `calcul-party:adventure:v1` ; Pico utilise `calcul-party:adventure:pico:v1`, au même format `completed`. Toute nouvelle aventure doit avoir ses propres identifiants et sa propre clé. Les résumés des deux aventures sont lus au choix ; seule la progression active est écrite et réinitialisée. Le changement conserve les acquis de chacune, même dans la mémoire de visite lorsque le stockage est bloqué. Ne pas réutiliser silencieusement les anciens acquis.

## 7. Utiliser ce guide lors d’une demande

Si l’utilisateur fournit seulement un thème ou demande de se débrouiller, inventer histoire, personnages, mondes, objets, musiques et scènes manquants en respectant le format ci-dessus. Conserver les règles de jeu existantes par défaut et expliciter les choix créatifs. Identifier les extensions nécessaires avant de les présenter comme des fonctions disponibles.

Pour une **mission isolée**, réutiliser le héros, les personnages, les assets et la progression de l’aventure concernée. Préciser s’il s’agit de remplacer une mission ou d’en ajouter une : ajouter une quatrième mission sort du format actuel à trois missions par monde et demande d’adapter les déblocages et la sauvegarde. Une simple création de contenu ne doit pas modifier le camp des fourmis.

### Modèle A — Brief d’aventure

- Nom et thème :
- Ambiance et style graphique :
- Héros, objectif et raison de partir :
- Sept autres personnages et lien de chacun avec le héros :
- Mode de rencontre : aide, recrutement, délivrance, affrontement ou mélange :
- Huit mondes et répartition dans les paliers 0 / 1 / 2 / 3 / 4 :
- Trois missions par monde, soit 24 titres et objectifs :
- Contribution de chaque personnage et dénouement collectif :
- Difficulté : conserver les réglages actuels ou préciser les changements :
- Identité musicale et vocale :
- Assets à créer, assets réutilisés et extensions nécessaires :
- Remplacement de l’aventure ou coexistence ; traitement des sauvegardes :

### Modèle B — Fiche personnage / monde

- Identifiant stable, nom du personnage et nom du monde :
- Personnalité, silhouette, couleurs et accessoires :
- Rôle, lien avec le héros, problème et contribution finale :
- Portrait ; poses d’accueil, attente, réaction, victoire et déception :
- Palier, présentation sur la carte et texte du monde terminé :
- Décor ; couleurs de page, tableau, cadre, panneaux, textes, accents et carte :
- Contenant du pavé fermé / ouvert ; zone du chiffre ; effacement :
- Quatre illustrations de personnages ou variantes et deux objets de sortie :
- Animation des touches, du compagnon et surprises ponctuelles :
- Musique, tempo, instruments, bruitages et profils de voix :
- Trois missions et assets nécessaires :

### Modèle C — Fiche mission

- Identifiant stable, monde, position 1 / 2 / 3 et titre :
- Objectif narratif et résultat visible :
- Prérequis et ce que la réussite débloque :
- Opérations, bornes, tables et éventuels quotas :
- Quantité de calculs, banque disponible, chrono et vies :
- Condition de réussite ; erreurs, nouvelle tentative et rejeu :
- Scène de réussite : titre, personnages, objets et état initial :
- Action et trajectoires ; état final ; durée de référence de dix secondes :
- Trois légendes : situation, action, résultat :
- Musique, bruitages, préchargement et comportement en arrière-plan :
- Version avec réduction des animations et libellé accessible :
- Acquisition sauvegardée ; contribution au monde et au dénouement :

### Checklist de complétude et de livraison

- [ ] Huit personnages principaux au total, dont un héros lié aux sept autres.
- [ ] Huit mondes, trois missions par monde et 24 objectifs cohérents.
- [ ] Paliers, déblocages, textes de carte et états des personnages définis.
- [ ] Identités, poses, décors et palettes complètes ; chiffres et calculs lisibles.
- [ ] Contenants fermé / ouvert, six sorties variées et effacement préparés.
- [ ] Appuis rapides, relance, visibilité, clavier/tactile et nettoyage des effets vérifiés.
- [ ] Compagnon, surprises et récompenses de mission distingués.
- [ ] Banques suffisantes, quotas valides, difficulté progressive et règles de tentative vérifiées.
- [ ] 24 scènes distinctes, trois légendes chacune et dénouement collectif prévu.
- [ ] Images chargées, son, voix, mode muet et synchronisation vérifiés.
- [ ] Formats téléphone/tablette/ordinateur, réduction des animations et arrière-plan vérifiés.
- [ ] Sauvegarde, rejeu, abandon, réinitialisation et indépendance du camp vérifiés.
- [ ] Choix créatifs et extensions du moteur explicitement distingués.
- [ ] Tests unitaires pertinents avec `npm test`, puis compilation avec `npm run build`.
- [ ] Pour toute modification des animations du pavé, **`npm run test:keypad` obligatoire** sur les **16 mondes des deux aventures** : visibilité réelle, relance et variété des illustrations.
- [ ] Pour les changements de parcours ou de récompenses, tests navigateur pertinents avec `npm run test:e2e -- <fichiers concernés>` ; un test simulé ne remplace pas un essai sur tablette physique.
- [ ] Commit limité à la demande, message court en français, déploiement sur le site existant avec ses accès conservés et succès confirmé, conformément à `AGENTS.md`.

## Repères dans le code

| Sujet | Source principale |
| --- | --- |
| Mondes, missions, banques, déblocages et sauvegarde | [`src/adventure.ts`](../src/adventure.ts) |
| Carte et personnages acquis | [`src/adventure-map.ts`](../src/adventure-map.ts) |
| Illustrations, musiques, voix et surprises des univers | [`src/themes.ts`](../src/themes.ts) |
| Couleurs du tableau et décors | [`src/style.css`](../src/style.css) |
| Touches et compagnon | [`src/keypad.ts`](../src/keypad.ts), [`src/keypad.css`](../src/keypad.css) |
| Surprises après les bonnes réponses | [`src/surprises.ts`](../src/surprises.ts) |
| Scènes des 48 missions | [`src/mission-rewards.ts`](../src/mission-rewards.ts), [`src/pico-rewards.ts`](../src/pico-rewards.ts) |
| Célébration finale de l’anniversaire | [`src/birthday-party.ts`](../src/birthday-party.ts) |
| Pico : distribution, palettes et musique | [`src/pico-content.ts`](../src/pico-content.ts), [`src/pico-themes.ts`](../src/pico-themes.ts), [`src/pico.css`](../src/pico.css) |
| Conclusion du phare | [`src/lighthouse-party.ts`](../src/lighthouse-party.ts) |
| Moteur de calcul et branchement des écrans | [`src/game.ts`](../src/game.ts), [`src/main.ts`](../src/main.ts) |

Lire ces sources avant de modifier les règles : ce guide décrit la référence actuelle et doit être mis à jour lorsqu’elle évolue.
