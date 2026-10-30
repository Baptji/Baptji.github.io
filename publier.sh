#!/bin/zsh
# Met à jour le site : recopie l'édition LÉGÈRE de l'Atlas dans atlas/, puis envoie sur GitHub.
# Usage : ./publier.sh "message"   (sans message : « Mise à jour de l'Atlas »)
set -e
cd "${0:A:h}"
LEGER="$HOME/Programmes/atlas-geologique/dist/Atlas géologique (léger)"
[[ -f "$LEGER/index.html" ]] || { echo "Édition légère introuvable : $LEGER"; exit 1; }
# Une seule édition depuis le 13/10/2026 : pas de carte 1/50 000 (data/geol50/, ≈ 3 Go)
[[ -e "$LEGER/data/geol50" ]] && { echo "data/geol50/ est dans le paquet : arrêt"; exit 1; }
grep -q 'ATLAS_PERSO = false' "$LEGER/edition.js" || { echo "edition.js n'a pas ATLAS_PERSO = false : arrêt"; exit 1; }
# Couche personnelle (lames minces sous licence ND) : jamais en ligne
grep -q 'ATLAS_PERSO = true' "$LEGER/edition.js" && { echo "edition.js a ATLAS_PERSO = true : arrêt"; exit 1; }
[[ -e "$LEGER/perso" ]] && { echo "Le dossier perso/ est dans l'édition légère : arrêt"; exit 1; }
# Fichiers du site seulement : pas de lanceurs Mac/Windows, pas de LISEZ-MOI, pas de croquis
rsync -a --delete \
  --exclude '*.app' --exclude 'Windows' --exclude '*.bat' --exclude 'LISEZ-MOI.txt' \
  --exclude 'croquis-*' --exclude '* 3' --exclude '.DS_Store' \
  --exclude 'perso' --exclude 'sources' --exclude 'SOURCES.md' \
  "$LEGER/" atlas/
git add -A
outils/versions.py   # numéro de version et date sur l'accueil (dossiers indexés)
git add versions.js
if git diff --cached --quiet; then echo "Rien de nouveau à publier."; exit 0; fi
git commit -q -m "${1:-Mise à jour de l'Atlas}"
git push -q
echo "Publié. En ligne d'ici une à deux minutes."
