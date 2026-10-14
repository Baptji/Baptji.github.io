/* edition.js — réglage propre à cette installation de l'atlas.

   Il n'y a plus qu'UNE édition (13/10/2026) : l'ancienne édition « complète » (≈ 3 Go, avec la
   carte vectorisée 1/50 000 data/geol50/) est abandonnée. Les cartes des fiches roche affichent
   le fond géologique BRGM servi par le web.

   ATLAS_PERSO : couche PERSONNELLE (perso/ : lames minces, à usage privé). Vraie seulement dans le dossier de travail ; build_distrib.py l'écrit false
   dans les paquets, et perso/ n'y est jamais copié (ni en ligne). */
window.ATLAS_PERSO = false;
