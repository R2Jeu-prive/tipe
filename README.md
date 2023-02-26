# TIPE - Gueguen Pierre - MP2I Clemenceau

Ce projet a pour but de déterminer les trajectoires optimales pour une voiture sur un circuit.
L'objectif est donc de déterminer pour un tracé donné une trajectoire qui minimse le temps de parcours.

J'aimerai résoudre ce problème en utilisant un algorithme génétique :
 - On part d'une trajectoire de départ : la trajectoire au centre de la piste à tout instant
 - On fait évoluer/varier cette trajectoire de manière pseudo-aléatoire
 - On garde les trajectoires avec les meilleurs évaluations
 - On répète l'opération sur plusieurs générations

La difficulté réside dans la programmation des deux fonctions : "faire évoluer" et "évaluer" une trajectoire donné.
La modélisation de la voiture se limite pour le moment à un objet de vitesse constante et sera modifié dans un second temps.

# Comment installer ?

[Avec Node]
1) Installer Node (npm inclus) : https://nodejs.org/fr/download/
2) Démarrer le serveur node.js ```node server.js```
3) Ouvrir un navigateur à l'adresse ```localhost```

[En local]
Ouvrir le fichier ```www/index.html``` dans votre navigateur
