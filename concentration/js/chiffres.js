// Les chiffres de la pastille, dessinés au trait (bouts ronds, comme l'aiguille de l'icône) : les mêmes dans la page,
// dans tous les navigateurs et dans la vidéo de la fenêtre flottante (tools/video-pastille.swift relit ce fichier).
// Repère : 100 unités de haut, tracé entre y = 6 et y = 94 ; chaque chiffre avance de 70, les deux-points de 32.
export const EPAISSEUR = 12;
export const AVANCE = 70;
export const AVANCE_DEUX_POINTS = 32;

export const CHIFFRES = {
  '0': 'M32 6C47 6 57 18 57 36L57 64C57 82 47 94 32 94C17 94 7 82 7 64L7 36C7 18 17 6 32 6Z',
  '1': 'M17 21L35 6L35 94',
  '2': 'M9 29C9 15 19 6 32 6C45 6 55 15 55 28C55 42 46 52 34 64L9 94L56 94',
  '3': 'M10 17C14 10 22 6 32 6C45 6 54 14 54 26C54 38 45 46 31 46C47 46 57 55 57 69C57 84 46 94 32 94C21 94 12 89 8 80',
  '4': 'M44 94L44 6L7 66L58 66',
  '5': 'M53 6L15 6L11 45C17 40 24 38 32 38C46 38 57 49 57 65C57 82 46 94 31 94C20 94 12 89 8 81',
  '6': 'M51 13C46 8 40 6 33 6C18 6 7 20 7 44L7 66M32 40C46 40 57 51 57 67C57 83 46 94 32 94C18 94 7 83 7 67C7 51 18 40 32 40Z',
  '7': 'M7 6L57 6C44 30 33 58 27 94',
  '8': 'M32 6C44 6 53 14 53 26C53 38 44 46 32 46C20 46 11 38 11 26C11 14 20 6 32 6ZM32 46C46 46 57 55 57 69C57 84 46 94 32 94C18 94 7 84 7 69C7 55 18 46 32 46Z',
  '9': 'M57 34L57 56C57 80 46 94 31 94C24 94 18 92 13 87M32 60C18 60 7 49 7 33C7 17 18 6 32 6C46 6 57 17 57 33C57 49 46 60 32 60Z',
};
/// Les deux-points : deux pastilles pleines (centre x, centre y, rayon).
export const DEUX_POINTS = [[16, 33, 7], [16, 71, 7]];
/// Les chemins sont dessinés pour une avance de 64 : on les recentre dans l'avance de 70.
export const DECALAGE = 3;

/// Largeur d'un texte comme « 24:59 », en unités.
export function largeur(texte) {
  let l = 0;
  for (const c of texte) l += c === ':' ? AVANCE_DEUX_POINTS : AVANCE;
  return l;
}

/// Le texte en SVG (chemins à tracer, pastilles à remplir), à poser dans un <svg viewBox="0 0 largeur 100">.
export function svg(texte) {
  let x = 0, traits = '', points = '';
  for (const c of texte) {
    if (c === ':') {
      for (const [cx, cy, r] of DEUX_POINTS) points += `<circle cx="${cx + x}" cy="${cy}" r="${r}"/>`;
      x += AVANCE_DEUX_POINTS;
    } else {
      traits += `<path transform="translate(${x + DECALAGE} 0)" d="${CHIFFRES[c]}"/>`;
      x += AVANCE;
    }
  }
  return { largeur: x, traits, points };
}
