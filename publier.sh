#!/bin/zsh
# Met à jour le site : recopie l'édition LÉGÈRE de l'Atlas dans atlas/, puis envoie sur GitHub.
# Usage : ./publier.sh "message"   (sans message : « Mise à jour de l'Atlas »)
set -e
cd "${0:A:h}"
LEGER="$HOME/Programmes/atlas-geologique/dist/Atlas géologique (léger)"
[[ -f "$LEGER/index.html" ]] || { echo "Édition légère introuvable : $LEGER"; exit 1; }
grep -q '"legere"' "$LEGER/edition.js" || { echo "edition.js n'est pas en édition légère : arrêt"; exit 1; }
# Fichiers du site seulement : pas de lanceurs Mac/Windows, pas de LISEZ-MOI, pas de croquis
rsync -a --delete \
  --exclude '*.app' --exclude 'Windows' --exclude '*.bat' --exclude 'LISEZ-MOI.txt' \
  --exclude 'croquis-*' --exclude '* 3' --exclude '.DS_Store' \
  "$LEGER/" atlas/
git add -A
if git diff --cached --quiet; then echo "Rien de nouveau à publier."; exit 0; fi
git commit -q -m "${1:-Mise à jour de l'Atlas}"
git push -q
echo "Publié. En ligne d'ici une à deux minutes."
