/* edition.js — quelle édition de l'atlas est installée ici.

   "complete" : le dossier data/geol50/ est présent (≈ 3 Go, carte vectorisée 1/50 000
                de la France entière, chargée département par département à la demande).
   "legere"   : ce dossier n'est PAS livré (≈ 1 Mo au total). Tout le reste est identique ;
                seule la couche vectorielle 1/50 000 des fiches roche est absente
                (le fond géologique BRGM au 1/1 000 000, lui, vient du web et marche).

   Ce fichier est réécrit automatiquement par tools/build_distrib.py à la fabrication
   des paquets ; dans le dossier de travail il vaut toujours "complete". */
window.ATLAS_EDITION = "legere";
