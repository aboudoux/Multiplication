# Consignes pour les agents

## Création d’aventures et de missions

- Avant toute création ou modification d’aventure ou de mission, consulter [le guide de création des aventures](docs/creation-aventure.md) et les sources concernées.
- Utiliser ses modèles de brief et ses fiches pour couvrir l’histoire, les personnages, les mondes, les calculs, les animations, le son et les récompenses. Pour une mission isolée, réutiliser les éléments de l’aventure concernée.
- Si seul un thème est donné, compléter les choix créatifs et conserver les règles de jeu existantes par défaut. Distinguer les fonctions disponibles des extensions nécessaires et mettre le guide à jour lorsque ses règles de référence évoluent.

## Après chaque demande

- Après chaque modification demandée par l’utilisateur, effectuer les vérifications adaptées puis créer un commit Git avec un message court en français, sans redemander confirmation.
- Limiter le commit aux fichiers concernés par la demande. Préserver les autres modifications présentes dans le dépôt ; ne pas les inclure ni les annuler automatiquement.
- Déployer systématiquement la mise à jour sur le site existant à chaque nouvelle demande de modification, y compris les corrections et les ajouts de tests ou de documentation, sans redemander confirmation.
- Utiliser le site Calcul’Party existant : https://multipli-party.aurelienboudoux.chatgpt.site. Conserver son hébergement et ses paramètres d’accès.
- Vérifier que le déploiement a réussi avant de le déclarer en ligne. Dans le compte rendu, indiquer le commit créé, le résultat des vérifications et le lien du site.
- Une instruction explicite de l’utilisateur de ne pas committer ou de ne pas déployer pour une demande donnée prime sur ces consignes.

## Vérifications

- Exécuter les tests pertinents pour la modification et compiler le site avant son déploiement.
- Pour les animations des boîtes du pavé numérique, lancer `npm run test:keypad` : les tests doivent protéger leur visibilité, leur relance et la variété des illustrations dans les seize mondes des deux aventures.
