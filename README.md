# Calcul’Party

Un jeu de calcul mental en français : tableau à la craie, clavier tactile coloré, ambiance arcade à 126 BPM et calculs lus à voix haute. Le mode, la longueur, les tables si nécessaire, le délai et les vies se choisissent avant chaque partie.

## Jouer en local

Prérequis : Node.js 22.12 ou plus récent (vérifié avec Node.js 24.13 sous Windows).

Dans le dossier `C:\code\Multiplication` :

```powershell
npm install
npm run dev
```

Ouvrir l’adresse locale affichée par Vite, généralement <http://localhost:5173>.

Pour jouer sur une tablette, laisser le serveur actif sur le PC, connecter les deux appareils au même Wi-Fi, puis ouvrir l’adresse **Network** correspondant au Wi-Fi du PC (par exemple `http://192.168.1.136:5173`). L’adresse IP peut changer. Si Windows demande l’autorisation réseau, autoriser Node.js sur le réseau privé. Aucun changement du pare-feu n’est effectué par le projet.

## Règles et commandes

- Cinq modes accessibles : **Le petit plus** (+), **Le petit moins** (−), **Le duo malin** (+ / −), **La ronde des tables** (×) et **Le grand mélange** (+ / − / ×).
- Additions et soustractions : nombres et résultats de **0 à 20**, jamais négatifs. Les inverses des additions sont des questions distinctes. Chaque banque contient 231 calculs, zéro compris.
- Choisir **20, 50 ou 100 calculs distincts**. En multiplication seule, **Toute la série** permet de jouer toutes les tables sélectionnées. Les longueurs impossibles sont désactivées ; réduire les tables bascule vers toute la série si nécessaire.
- Les mélanges répartissent les questions aussi équitablement que possible. Une petite banque de multiplication épuisée est compensée par les autres opérations : une table avec 100 calculs en mélange donne 10 multiplications, 45 additions et 45 soustractions.
- Les nouveaux joueurs commencent avec 20 additions, 10 secondes et 3 vies. Les joueurs existants retrouvent leurs réglages dans le mode multiplication, avec toute la série.
- Dans les modes multiplication et grand mélange, choisir **1 à 10 tables** : avec N tables, les tables de 1 à N sont jouées chacune de ×1 à ×10, soit **10 × N questions** (50 questions pour 5 tables). Par défaut, les 10 tables sont jouées.
- Choisir **5 s / Turbo**, **10 s / Tempo**, **15 s / Tranquille** ou **30 s / Détente** par réponse. Le choix par défaut est 10 secondes.
- Choisir **1 à 10 vies** ; le choix par défaut est 3 vies.
- Le départ fait **3, 2, 1, 0**. Les chiffres `0–9` se saisissent au clavier, à la souris ou au doigt. Retour arrière ou le bouton d’effacement supprime un chiffre avant validation.
- La réponse se valide automatiquement à la longueur attendue, y compris les trois chiffres de `10 × 10 = 100`.
- Les couples ordonnés sélectionnés sont mélangés : `2 × 3` et `3 × 2` comptent séparément quand les deux tables sont sélectionnées.
- Un couple réussi ne revient jamais. Une erreur ou un délai dépassé coûte une vie ; une carte « Désolé, mais c’était XX ! » affiche la bonne réponse en grand pendant **2 secondes**, dès le buzzer, et le couple est placé en fin de file.
- Après la correction de la dernière erreur, une étoile déçue et un « Ooooh… » s'affichent pendant **6 secondes**, puis le bilan apparaît avec la dernière correction. Ces séquences n'ajoutent pas de temps au score et n'acceptent aucune réponse. Une nouvelle partie remet les compteurs à zéro.
- Il faut réussir tous les couples sélectionnés pour gagner. Le chronomètre du record compte uniquement le temps de réponse : départ, corrections et pauses sont exclus.
- À la dernière bonne réponse, l’étoile danse sous les projecteurs pendant 6 secondes, sur une musique de fête avec percussions et confettis. Le bilan et le record s’affichent ensuite ; la danse ne compte pas dans le temps du record.
- Pour essayer discrètement la danse sans jouer tous les calculs, appuyer sur **Ctrl + Alt + V** depuis l’accueil. L’aperçu revient automatiquement à l’accueil après 6 secondes et ne crée ni partie ni record. Le raccourci n’est pas actif pendant une partie.
- Le bouton pause ou **Échap** interrompt la partie. Le passage en arrière-plan la met également en pause. La reprise est explicite, après un nouveau décompte, avec le temps et la saisie conservés.
- Le bouton de son coupe ou réactive toute la musique et les effets. Les sons démarrent après une interaction. Le réglage système de réduction des animations est respecté.
- La lecture des calculs est activée par défaut : une voix française annonce par exemple « six fois sept ? ». Le bouton **Voix** permet de couper cette lecture indépendamment de la musique. **Réécouter** répète le calcul courant ; le bouton général de son coupe aussi la voix.
- La voix s'arrête dès la réponse, la mise en pause ou le passage en arrière-plan. Elle relit le calcul à la reprise. La musique baisse pendant la lecture ; le délai de réponse continue normalement.
- Les 562 annonces sont des fichiers audio inclus dans le jeu : aucun moteur vocal à installer ni service vocal externe à contacter. Si un fichier ne se charge pas, un message propose de réessayer et la partie reste jouable.
- Les erreurs déclenchent un double buzzer grave, la grande carte de correction et un contour rose. Les réussites déclenchent des confettis et des encouragements animés.
- À la défaite, un enregistrement de foule déçue fait un « Ooooh… » après le buzzer. Le son dure environ 5 secondes et se termine avant le bilan. Il respecte les réglages Voix et Son. L'étoile se balance et verse deux petites larmes ; avec les animations réduites, la séquence de 6 secondes reste visible sans mouvement.

Les préférences et les meilleurs temps sont enregistrés dans le navigateur, séparément pour chaque combinaison **mode + nombre réel de questions + tables utilisées + délai + vies**. Tous les anciens records de multiplication sont migrés. « Toute la série » et une longueur fixe équivalente partagent le même record. Les records ne sont pas partagés entre appareils, navigateurs ou adresses du jeu. Si le stockage local est désactivé, le jeu fonctionne et garde ses records uniquement jusqu’au rechargement.

## Compiler et vérifier

```powershell
npm test
npm run build
npm run test:e2e
```

- Les tests Vitest couvrent la pioche, les réponses de un à trois chiffres, les erreurs, les quatre délais, les vies et tables configurables, les pauses, les conditions de fin et les sauvegardes.
- Les tests Playwright lancent la **version compilée** sur le port 4173 dans Microsoft Edge installé sur Windows. Ils vérifient une victoire complète, la défaite, les commandes, la persistance, les positions et rotations, le signal de mise en arrière-plan, le graphe Web Audio et le mode muet.
- Les formats testés sont 1365 × 900, 768 × 1024, 1024 × 768 et 390 × 844, avec événements tactiles simulés. Les captures sont produites dans `test-results/` (non versionné).
- Les vérifications automatisées utilisent une horloge virtuelle pour parcourir les parties et une interruption de visibilité simulée. Elles ne remplacent pas un essai tactile et sonore sur une tablette physique, notamment sous Safari/iPadOS.

`npm run build` crée le dossier `dist/`, prêt à servir sur un hébergement statique à la racine d’un domaine. `npm run preview` permet de le consulter localement. Le site Sites existant est privé : https://multipli-party.aurelienboudoux.chatgpt.site. Son dossier de livraison `.site-checkout/` est séparé du dépôt local et conserve son identité dans `.openai/hosting.json`.

## Organisation

- `src/calculations.ts` : opérations, banques, sélection équilibrée et configuration des parties.
- `src/game.ts` : moteur déterministe, sans DOM et piloté par une horloge fournie.
- `src/main.ts` et `src/style.css` : interface, clavier/tactile et mise en page adaptative.
- `src/audio.ts` et `src/particles.ts` : synthèse sonore locale et confettis.
- `src/voice.ts` et `public/voice/fr/` : lecture des 562 annonces françaises, cache audio et annulation des lectures dépassées.
- `src/storage.ts` : lecture contrôlée des préférences et records ; tolérance au stockage indisponible.
- `tests/unit/` et `tests/e2e/` : règles et parcours navigateur.

L’interface ne charge aucun service externe. Les polices Kalam sont livrées localement sous licence SIL Open Font License ; voir `public/fonts/OFL.txt`. La mascotte et les illustrations sont dessinées en SVG/CSS. La musique et les effets arcade sont produits avec Web Audio. Le bruitage de foule déçue provient de [mrrap4food sur Freesound](https://freesound.org/people/mrrap4food/sounds/619007/), sous licence **CC0 1.0** ; il est inclus localement, avec sa provenance et les adaptations dans `public/sounds/CREDITS.md`.

Les annonces françaises ont été générées avec la voix Windows Microsoft Julie, en PCM mono 22,05 kHz (562 fichiers locaux). Le script `scripts/generate-voice.ps1` complète les fichiers manquants sous PowerShell 7 / Windows avec `System.Speech`, en passant éventuellement `-VoiceName` pour sélectionner une autre voix française installée. Ce script n'est pas nécessaire pour lancer le jeu sur un autre appareil.

Les tests supplémentaires contrôlent les 562 fichiers audio, l'arrêt de la voix même si son téléchargement se termine en retard, la relecture, la préférence persistée et le buzzer. Les essais navigateur vérifient le décodage et le démarrage effectif des sources Web Audio ; ils ne constituent pas une appréciation de la voix à l'oreille sur une tablette physique.
