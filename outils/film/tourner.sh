#!/bin/zsh
# Tourne un extrait de l'accueil : images par film (horloge virtuelle), puis vidéo H.264 et affiche dans medias/.
# Usage : outils/film/tourner.sh <nom> <url> <largeur> <hauteur> <scenario.js> <durée> [affiche=0] [options de film…]
#   ex. : outils/film/tourner.sh concentration-25 http://localhost:9213/concentration/ 1000 500 outils/film/scenarios/concentration-25.js 12
set -e
ICI="${0:A:h}"; SITE="${ICI:h:h}"
nom=$1 url=$2 L=$3 H=$4 scen=$5 duree=$6 affiche=${7:-0}
shift 7 2>/dev/null || shift $#
[[ -x "$ICI/film" && "$ICI/film" -nt "$ICI/film.swift" ]] || swiftc -O "$ICI/film.swift" -o "$ICI/film"
IMAGES="${FILM_IMAGES:-${TMPDIR:-/tmp}}/film-$nom"
rm -rf "$IMAGES"
"$ICI/film" "$url" "$L" "$H" "$scen" "$IMAGES" --duree "$duree" "$@"
ffmpeg -loglevel error -y -framerate 30 -i "$IMAGES/%04d.png" -vf "scale=1920:960:flags=lanczos" -c:v libx264 -crf 20 \
  -tune animation -pix_fmt yuv420p -movflags +faststart "$SITE/medias/$nom.mp4"
ffmpeg -loglevel error -y -i "$IMAGES/$(printf %04d $affiche).png" -vf "scale=1920:960:flags=lanczos" -q:v 3 "$SITE/medias/$nom.jpg"
ls -la "$SITE/medias/$nom.mp4" "$SITE/medias/$nom.jpg"
echo "images gardées dans $IMAGES"
