# Calcul mental de 5 à 15 ans

Calcul’Party entraîne des automatismes courts et répétables. Chaque calcul vise **10–15 secondes, lecture et saisie comprises**, sans papier ni crayon. Cette cible est un choix de conception, à observer avec les joueurs ; elle ne garantit pas le temps de réponse de chacun. La classe conseille des patterns, sans chercher à couvrir tout son programme.

Les références scolaires 2026–2027 restent dans `src/curriculum.ts` : maternelle et cycle 2 depuis 2025, CM1/6e depuis 2025, CM2/5e depuis 2026. Les anciens attendus de 4e/3e restent les références en vigueur en 2026–2027 ; réexaminer leurs références aux rentrées 2027 et 2028. Connaître de grands nombres ne signifie pas devoir effectuer mentalement des opérations quelconques sur eux.

## Patterns proposés

`src/mental-patterns.ts` sélectionne les compétences visibles, leurs prérequis et leurs paliers. `src/mental-generator.ts` construit des faits bornés, sans tirage dans toute la plage de numération. `src/study-generator.ts` sert ces banques et conserve les anciens générateurs pour compatibilité et vérification mathématique ; les familles retirées ne sont accessibles ni au camp, ni dans les profils, ni dans les aventures.

| Famille | Bornes et stratégies |
| --- | --- |
| Collections GS | Résultats jusqu’à 5 → 8 → 10 ; ajouter/retirer 1 ou 2, petits compléments, voix et objets. |
| Additions/soustractions | Jusqu’à 10 → 20 → 100. Au dernier palier, le deuxième nombre est un chiffre ou une dizaine entière ; pas de paires arbitraires à deux chiffres. |
| Doubles/moitiés | Faits de 1 à 10, dizaines puis centaines usuelles. En CP, rester jusqu’à 100. |
| Nombres ronds | Dizaines, centaines, puis centaines avec dizaines ; résultats ≤1 000. Le pattern CP « dizaines » reste une banque fixe ≤100. |
| Tables/divisions | 2/5/10 → ajout de 3/4 → tables 1–10 ; multiplicateur/quotient 0–10, jamais de diviseur nul. |
| Produits structurés | Faits de tables ×10/100 ; produits simples par 2/4/5/10 ; 25 ×2/4/8/10 et 125 ×2/4/8. Aucun 125 ×7. |
| Fractions usuelles | Dénominateurs 2/4/10 → ajout de 3/5 → ajout de 6/8. Reconnaissance, comparaison même dénominateur ou fractions unitaires, opérations de même dénominateur. |
| Fractions d’une quantité | Demi/quart/dixième, puis tiers/deux tiers/trois quarts, puis cinquièmes ; quantité construite depuis un quotient entier de 1 à 10. |
| Fractions au collège | Produits de fractions unitaires usuelles ; division de parts de même taille ; simplification immédiate dans a/b × b/c. Réductions construites depuis une fraction usuelle multipliée par 2/10, puis 3/5, puis 4. |
| Décimaux | Demis, dixièmes, quarts ; additions/soustractions ≤20. Produits et divisions construits depuis des faits courts ; une seule opérande décimale. Changements de rang ×/÷10/100/1 000. |
| Relatifs/priorités | Additions/soustractions dans −20…20, produits et quotients des tables. Deux opérations maximum, sans parenthèses imbriquées. |
| Carrés/cubes/racines | Carrés 0–10 puis 11/12 ; racines correspondantes. Cubes fixes 0, 1, 2, 3, 10 ; pas d’inflation après maîtrise. |
| Inconnues | Une seule opération inverse : complément, table inverse, x+b=c ou ax=c. Solutions formelles dans −10…10. |
| Expressions/fonctions | ax+b avec |a|, |x|, |b| ≤5 ; deux opérations au maximum, petits nombres. |
| Pourcentages | 10/50 %, puis 20/25 %, puis mélange ; multiples de 20 jusqu’à 200. Une seule évolution, résultat entier et énoncé bref. |
| Puissances de 10 | Coefficient 1–9 ; exposants 0/1/2, puis 3/4, puis −1/−2/−3. |

Retirés des accès : nombres mystères imbriqués, quotient/reste, problèmes de proportionnalité, programmes de calcul, équations à plusieurs étapes ou solutions, identités remarquables, inéquations, évolutions successives et autres puissances négatives. Aucun atelier séparé. Leurs identifiants et anciennes données restent conservés.

## Les sept mondes avant le mélange final

| Classe | Patterns dans l’ordre |
| --- | --- |
| GS | Collections +, collections −, ajouter 1, retirer 1, ajouter 2, retirer 2, petits compléments |
| CP | Additions, soustractions, compléments, doubles, moitiés, dizaines +, dizaines − |
| CE1 | Tables, nombres ronds +, nombres ronds −, ×10, doubles, fractions illustrées, compléments |
| CE2 | Tables, divisions exactes, produits ronds, ×100, centaines +, fractions illustrées, fractions de même dénominateur |
| CM1 | Divisions exactes, produits ronds, ×1 000, décimaux simples, inconnue à une opération, comparaison de fractions, fractions de même dénominateur |
| CM2 | Décimaux simples, changements de rang, divisions décimales simples, fraction d’une quantité, produits ronds, fractions de même dénominateur, divisions exactes |
| 6e | Produits décimaux simples, changements de rang, fraction d’une quantité, pourcentages, divisions décimales simples, fractions de même dénominateur, produits ronds |
| 5e | Relatifs +/−, priorités simples, carrés, cubes, équations à une étape, fractions de même dénominateur, pourcentages |
| 4e | Produits de relatifs, fractions usuelles, racines, puissances de 10, équations à une étape, relatifs +/−, priorités |
| 3e | Réduction de fractions, puissances de 10, évolution unique, fonction simple, pourcentages, racines, équations à une étape |
| Seconde | Produits de relatifs, fractions usuelles, puissances de 10, carrés, produits décimaux simples, évolution unique, fonction simple |

Le camp montre ces patterns et propose des révisions repliées. Seconde réutilise des automatismes avancés courts, sans inventer un nouvel exercice long pour chaque âge. Les notions et paliers restent sélectionnables manuellement.

## Parties et suivi

- Camp : 5 questions en GS, 10 ensuite. Missions GS : 5/6/8 puis 10 au final ; autres classes : 8/10/12 puis 15. Plafonner à la banque unique ; cinq cubes font un petit défi.
- Les deux premières missions d’un monde répètent son pattern. La troisième réserve environ 20 % aux rappels pratiqués dans les mondes précédents ; le final répartit les familles pratiquées. Après un changement de classe sans observations pertinentes, il commence avec les patterns conseillés au palier 0.
- Un fait réussi ne revient pas dans la même tentative. Une erreur revient après trois variantes inédites ou plus tôt lorsque la file est courte, pour éviter une boucle sur les premiers échecs. Rejouer les missions ou les séries répète les faits sans dupliquer les acquis narratifs.
- Le chrono dépend du jeu, sans préférence dans le profil. Dans les aventures adaptées comme classiques : premier monde sans chrono, puis 30 s / 7 vies, 15 s / 5 vies et 10 s / 3 vies. Au camp adapté, les paliers facile, entraînement et défi utilisent sans chrono, 15 s / 5 vies et 10 s / 3 vies. Les séances personnalisées historiques conservent leurs réglages.
- Saisie à la craie : une barre par caractère attendu, chiffres manuscrits et signe moins séparé, sans champ blanc visible. Un calcul décimal dont le résultat est entier vérifie aussi une saisie entière complète : `1,8 × 10` attend `18`, et `80` déclenche la correction sans attendre le chrono. Entiers : auto-validation à la longueur des chiffres, signe indépendant, signe seul ignoré. Décimaux et fractions : bonne réponse acceptée automatiquement, sans bouton Valider ; virgule et point acceptés, fractions équivalentes acceptées sauf si réduction irréductible demandée ; les barres s’étendent si l’écriture choisie est plus longue. Virgule, barre de fraction et signe moins près des chiffres du pavé. Une saisie incomplète ou incorrecte reste éditable ; Entrée permet de la soumettre au clavier. Comparaisons : deux boutons. Le pavé reste utilisable sans ouvrir le clavier logiciel du téléphone.
- Réussite : transition de 650 ms. Erreur : correction de deux secondes et une phrase de stratégie. Indice disponible à la demande ; réglages figés durant la tentative.
- `mentalMastery` version 1, distinct de l’ancienne maîtrise : dix premières présentations par pattern forment un bloc. Deux blocs du même palier à ≥8/10 sans aide et médiane des bonnes premières réponses ≤15 s permettent une montée. Chaque observation conserve le palier de sa question ; un bloc mêlant des paliers ne permet pas de monter. Sous 6/10 au palier courant, simplifier ; une réponse juste mais lente maintient le palier. Les banques fixes ne gagnent pas de complexité.
- Correction, aide et réessai restent distingués ; une correction ne crée aucune preuve supplémentaire. Le temps actif exclut les pauses et la préparation des annonces.

## Sauvegarde et validation

Le registre `calcul-party:players:v1` garde chaque joueur, camp, matériaux, constructions, aventures, anciens records et ancienne maîtrise. Sans `mentalMastery`, commencer vide au premier palier ; ne rien déduire des missions acquises. Changer de classe ou de difficulté ne supprime rien. Les anciennes préférences de chrono restent enregistrées pour compatibilité, sans modifier les règles des parties. Stockage bloqué : visite jouable avec avertissement ; données corrompues : repli validé. Réinitialiser une aventure ne touche ni le camp, ni les autres joueurs, ni les compétences.

Vérifier banques autorisées, exactitude, paliers distincts lorsqu’ils existent, volumes, petits paquets, rappels et absence de double crédit. Le cas `7 × (? + 1) = 91` doit rester impossible en parcours mental. Tester saisie, voix, pause, chrono, formats téléphone/tablette/ordinateur et les deux aventures pour onze classes. Exécuter tests unitaires, navigateur pertinents, `npm run test:keypad` et compilation ; mettre à jour les guides, créer un commit français limité à la demande, publier sur l’hébergement existant et confirmer le déploiement. Les contrôles automatisés ne remplacent pas un essai avec des enfants ni sur tablette physique.
