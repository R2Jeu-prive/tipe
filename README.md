# TIPE - Gueguen Pierre - MPI* Clemenceau

Ce projet a pour but de déterminer les trajectoires optimales pour une voiture sur un circuit.
L'objectif est donc de déterminer pour un tracé donné une trajectoire qui minimise distance/courbure/temps.

J'aimerai résoudre ce problème en utilisant un algorithme génétique :
 - On part d'une trajectoire initiale choisie
 - On fait évoluer/varier cette trajectoire de manière aléatoire
 - On garde les trajectoires avec les meilleurs évaluations
 - On répète l'opération sur plusieurs générations

La difficulté réside dans la programmation des deux fonctions : "faire évoluer" et "évaluer" une trajectoire donné.
Il peut être pertinent également d'étudier les différences d'évolutions en fonction des conditions initiales choisies
La modélisation de la voiture se limite pour le moment à un point selon [ce modèle](papers/1-s2.0-S0045794908000163-main.pdf)

# Comment utiliser l'outil de visualisation ?

Ouvrir [ce fichier](2.0/index.html) dans un navigateur (Chrome de préférence)
Déplacez la carte avec le clic molette
Zoom avec + et - du pavé numérique