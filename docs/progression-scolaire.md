# Progression scolaire de Calcul’Party

Référence : année scolaire 2026–2027. L’âge (5 à 15 ans) propose GS à seconde GT ; la classe est modifiable. Les compétences, sources officielles, exemples et prérequis se trouvent dans `src/curriculum.ts`. Les programmes de 4e et 3e antérieurs restent applicables en 2026 ; les nouveaux programmes entrent en vigueur en 2027 et 2028. Le catalogue est à réexaminer à ces rentrées.

Le champ de numération ne constitue pas une banque d’opérations aléatoires : CP jusqu’à 100, CE1 1 000, CE2 10 000, CM1 999 999 et CM2 999 999 999. Les calculs sont choisis selon les procédures mentales. Carrés, cubes et équations formelles commencent dans le parcours 5e ; les nombres manquants préparent l’algèbre au primaire. La géométrie générale, les statistiques et un atelier complet d’opérations posées sont hors périmètre.

## Choix propres au jeu

- Profils locaux sous `calcul-party:players:v1`, sans compte distant. Les quatre anciennes sauvegardes sont copiées dans « Joueur actuel », initialement en mode classique. Les anciens fichiers restent des sauvegardes de compatibilité ; un nouveau joueur ne les hérite pas.
- Chaque profil conserve réglages, records, matériaux, constructions, missions de chaque aventure et maîtrise. Changer de classe ne supprime aucun acquis. Stockage bloqué : mémoire de visite et avertissement ; une réinitialisation non sauvegardée ne supprime pas les missions.
- Trois états : à découvrir, en entraînement, à l’aise. Dix observations originales forment une série. Deux séries à au moins 8/10, sans aide au premier essai, confirment l’aisance ; moins de 6/10 propose un palier inférieur. Une correction suivie d’une réponse mémorisée ne fournit pas une nouvelle observation. Vitesse et exactitude sont séparées.
- Les séries sont générées au lancement : leur difficulté ne change jamais pendant la tentative. Les nouveaux apprentissages commencent sans chrono et avec essais illimités. Les exercices et niveaux restent sélectionnables manuellement.

## Lots

1. Profils, reprise des sauvegardes, catalogue sourcé et suivi : livré.
2. Questions et réponses extensibles : livré.
3. Collections, division exacte et grandes multiplications : livré.
4. Fractions, décimaux et quotient/reste : livré.
5. Relatifs, priorités, puissances et racines : livré.
6. Nombres manquants et équations : à réaliser.
7. Pourcentages, problèmes, fonctions et prolongement seconde : à réaliser.
8. Missions adaptatives des deux aventures : à réaliser.

Chaque lot requiert ses tests unitaires et navigateur pertinents, compilation, commit français et publication sur l’hébergement existant. Le pavé et ses animations demandent `npm run test:keypad`.
