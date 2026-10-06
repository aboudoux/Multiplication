# Équilibrage des aventures par classe et difficulté

Les deux aventures conservent huit mondes, trois missions par monde, leurs identifiants, histoires, personnages, illustrations, sons et récompenses. Le mode classique garde la progression du commit `6fda960`. Le camp reste indépendant. Les nouvelles règles concernent uniquement les profils scolaires des aventures.

## Choix et quantités

Chaque joueur choisit Facile, Normal ou Expert dans son profil ; Normal est le défaut. La classe choisit les sept notions du parcours. La difficulté fixe les quantités, paliers, vies et délais, sans promotion automatique dans les aventures. Les règles et questions sont figées au début de chaque tentative ; un changement manuel s'applique à la suivante.

Objectifs Normal, avec M1 / M2 / M3 pour chaque monde :

| Classe | Monde 1 | Mondes 2–3 | Mondes 4–5 | Mondes 6–7 | Monde 8 |
| --- | --- | --- | --- | --- | --- |
| GS | 5 / 6 / 8 | 6 / 8 / 10 | 8 / 10 / 12 | 8 / 10 / 12 | 10 / 12 / 15 |
| CP | 6 / 8 / 10 | 8 / 10 / 12 | 10 / 12 / 15 | 12 / 15 / 18 | 15 / 18 / 24 |
| CE1 | 8 / 10 / 12 | 10 / 12 / 15 | 12 / 15 / 18 | 15 / 18 / 20 | 18 / 22 / 28 |
| CE2, CM1, CM2 | 8 / 10 / 12 | 10 / 12 / 15 | 12 / 15 / 18 | 15 / 18 / 24 | 20 / 24 / 30 |
| 6e à 2de | 8 / 10 / 12 | 10 / 12 / 15 | 12 / 15 / 18 | 12 / 15 / 18 | 15 / 18 / 24 |

Facile : `max(5, round(0,8 × N))`. Expert : `min(36, ceil(1,2 × N))`. Ces valeurs sont des plafonds avant vérification des banques. Une banque de quatre ou cinq faits peut réduire une mission sous cinq calculs : ne pas inventer de nombres ni dupliquer des faits pour remplir le quota.

Les paliers mathématiques M1 / M2 / M3 sont 0 / 0 / 1 en Facile, 0 / 1 / 1 en Normal, 1 / 2 / 2 en Expert, plafonnés au maximum disponible pour chaque notion. Les notions à banque fixe, notamment les cubes, restent fixes.

## Découverte, révisions et sauvegardes

Une notion encore inconnue dans la classe actuelle commence au palier 0, sans chrono ni limite de vies, quelle que soit la mission narrative jouée. Seule une mission réussie enregistre la notion et son palier dans `adventurePractice`, indexé par classe. Un abandon, une réponse isolée ou une ancienne victoire narrative ne constitue pas une découverte. Cet historique est partagé entre les deux histoires d'un joueur, tandis que leurs missions gagnées restent indépendantes.

M1 travaille uniquement la notion principale ; M2 vise 80 % principale et 20 % révisions ; M3 vise 70 % principale et 30 % révisions. Le quota principal est arrondi au supérieur. Les révisions viennent de notions découvertes dans les mondes précédents : au maximum une famille en GS–CP, deux en CE1–CE2, trois à partir du CM1. Sans révision disponible ou pendant la découverte, la mission reste homogène.

Le final répartit les notions découvertes de la classe actuelle, en équilibrant les parts et les restes selon les capacités. Révisions et final ne dépassent ni le palier demandé par la difficulté ni le plus haut palier effectivement réussi pour cette classe. Après changement de classe sans historique, le bouton du final oriente vers la première découverte ; les anciens badges restent acquis. Revenir à une classe retrouve son propre historique.

Le générateur cherche la plus grande quantité possible respectant les quotas et l'unicité du fait (énoncé, réponse et visuel). Pour la variété, il vise 25 % accessibles, 55 % courants et 20 % exigeants lorsqu'ils existent. Les manques sont redistribués vers les courants puis les accessibles. L'ordre privilégie deux calculs accessibles au début, au maximum deux exigeants consécutifs, une fin courante, et sépare les produits miroirs d'au moins trois autres questions lorsque possible. Ces objectifs d'ordre restent souples face aux petites banques.

## Temps et vies

Les métadonnées des exercices distinguent les automatismes et les calculs avec stratégie, directement à partir des opérandes et de la famille enseignée. Les tables, divisions exactes, doubles, moitiés, carrés, cubes et racines sont des automatismes. Les fractions, décimaux, priorités, inconnues, fonctions et calculs avec décomposition sont des stratégies.

| Classe | Normal : automatisme / stratégie | Expert : automatisme / stratégie |
| --- | --- | --- |
| GS | Sans chrono | Sans chrono |
| CP | 20 / 30 s | 15 / 25 s |
| CE1 | 20 / 25 s | 15 / 20 s |
| CE2, CM1, CM2, 6e, 5e | 15 / 25 s | 10 / 20 s |
| 4e, 3e, 2de | 10 / 20 s | 10 / 15 s |

Facile et découverte : sans chrono, vies illimitées. Normal : `max(5, 3 + ceil(0,1 × nombre effectif))` vies. Expert : `max(3, 2 + ceil(0,05 × nombre effectif))` vies. En GS, Normal et Expert ont des vies limitées après découverte, mais restent sans chrono. Le chrono optionnel GS est différé.

Le délai commence après la première lecture audio complète ; une réponse pendant la lecture est acceptée. Sans voix, après une indisponibilité ou une coupure volontaire du son, il commence immédiatement. Une pause pendant la première lecture conserve l'attente : la reprise relit la question avant de démarrer le délai complet. Après démarrage, la pause conserve le restant. Réécouter ensuite ne réinitialise pas le délai. Le temps actif observé inclut lecture, réflexion et saisie ; il exclut les pauses, préparations audio, corrections et scènes.

Une erreur coûte une vie lorsque les vies sont limitées. Le calcul revient après trois variantes inédites, ou plus tôt si la file est courte. La correction reste visible quatre secondes en GS–CP, trois secondes pour les stratégies des autres classes et deux pour leurs automatismes. Transition correcte : 650 ms. Récompense narrative : dix secondes. Les animations du pavé et surprises restent identiques.

Une défaite recommence la mission avec toutes ses vies et zéro calcul validé ; les missions déjà gagnées sont conservées. Après deux défaites dans la mission pendant la visite, le joueur peut choisir « Réessayer en Facile ». Aucun changement automatique de difficulté. Aucun point de sauvegarde au milieu d'une tentative.

## Bilan local et essais de jouabilité

Les vingt dernières tentatives d'aventure de chaque joueur sont gardées sur cet appareil dans `calcul-party:adventure-attempts:v1`, à côté des sauvegardes existantes. Elles contiennent classe, difficulté, découverte ou entraînement, issue, quantité réussie, premières réponses justes, aides, erreurs, délais dépassés et durée active. Aucun envoi de statistiques. Le profil les présente dans « Mes dernières aventures ». Le registre de maîtrise du camp continue de recevoir les observations sans piloter les aventures.

Les cibles suivantes sont des hypothèses de conception, à vérifier avec des enfants : séance choisie de 10–15 minutes, environ 90 % de premières réponses correctes dans le délai pour les notions déjà connues en Normal, au moins 80 % de missions terminées. Calculer la précision sur les premières présentations, distinguer les découvertes, et compter les abandons dans le bilan de complétion.

Prévoir un premier panel de douze enfants, deux par classe de GS à CM2, sur téléphone ou tablette physique. Observer lecture, saisie, aides, erreurs, fatigue et changements manuels de difficulté ; après chaque monde, demander « trop facile / juste bien / trop difficile » et « envie de continuer ? ». Revoir quelques notions après sept jours. Ce petit panel sert à corriger des problèmes observés ; il ne constitue pas une preuve statistique de l'efficacité pédagogique. Aucun résultat d'essai avec des enfants n'est présumé.

## Vérification technique

Les tests couvrent les 11 classes × 3 difficultés × 2 aventures × 24 missions, les capacités réduites, quotas et alias GS, les changements de classe, les migrations et le stockage bloqué. Vérifier carte et moteur, saisie, vrais événements de fin audio, budgets de 20/25 secondes, pauses, interruptions et callbacks obsolètes. Préserver les tests classiques et du camp, lancer `npm test`, les scénarios navigateur pertinents, `npm run test:keypad` et `npm run build`. Après commit français limité à cette demande, déployer sur l'hébergement Calcul'Party existant sans modifier ses accès et confirmer le résultat de publication.
