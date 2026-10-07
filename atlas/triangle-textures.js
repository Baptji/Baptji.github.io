// ============================================================
// Triangle des textures — diagramme du GEPPA (Groupe d'étude
// des problèmes de pédologie appliquée, 1963, révisé 1969) —
// utilisé dans « 1 kg altéré : qu'est-ce qui en sort ? » (D.2).
// ------------------------------------------------------------
// Choix du GEPPA plutôt que Jamagne (triangle de l'Aisne, 1967) :
// c'est le triangle de référence en pédologie française
// générale (Baize, "Guide des groupes de sols", 1995 ; cité
// dans le Référentiel pédologique AFES déjà utilisé pour le
// champ `pedologie` des fiches). Jamagne reste plus employé en
// cartographie régionale des sols (Aisne, Bretagne...).
//
// Sommets numérotés (fractions ARGILE, LIMON, SABLE, somme = 1)
// et classes = liste de sommets formant chaque polygone.
// Source des coordonnées : paquet R "soiltexture" (J. Moeys),
// table FR.GEPPA.TT — sigles et intitulés vérifiés contre la
// figure du GEPPA (1963) reproduite dans J.-Y. Massenet,
// "Propriétés physiques du sol" (cours de pédologie), qui
// donne la même liste de 17 classes.
//
// ⚠️ Limites granulométriques : le GEPPA distingue argile <2 µm,
// limon 2–50 µm, sable 50–2000 µm (norme AFNOR/pédologique).
// Les catégories `produits` de l'Atlas (voir data.js) utilisent
// la convention sédimentologique 2–63 µm : le classement obtenu
// ici est donc approximatif (léger décalage entre 50 et 63 µm),
// mais l'écart reste faible devant la taille des classes.
// ============================================================

const GEPPA_SOMMETS = {
  1: [1.000, 0.000, 0.000],
  2: [0.600, 0.000, 0.400],
  3: [0.550, 0.450, 0.000],
  4: [0.450, 0.000, 0.550],
  5: [0.426, 0.200, 0.374],
  6: [0.394, 0.465, 0.141],
  7: [0.375, 0.625, 0.000],
  8: [0.325, 0.000, 0.675],
  9: [0.308, 0.250, 0.442],
  10: [0.288, 0.542, 0.170],
  11: [0.275, 0.725, 0.000],
  12: [0.225, 0.000, 0.775],
  13: [0.210, 0.250, 0.540],
  14: [0.204, 0.351, 0.445],
  15: [0.188, 0.614, 0.198],
  16: [0.175, 0.825, 0.000],
  17: [0.125, 0.000, 0.875],
  18: [0.111, 0.250, 0.639],
  19: [0.103, 0.400, 0.497],
  20: [0.088, 0.687, 0.226],
  21: [0.075, 0.925, 0.000],
  22: [0.075, 0.000, 0.925],
  23: [0.033, 0.250, 0.717],
  24: [0.000, 0.000, 1.000],
  25: [0.000, 0.250, 0.750],
  26: [0.000, 0.450, 0.550],
  27: [0.000, 0.750, 0.250],
  28: [0.000, 1.000, 0.000],
}; // [argile, limon, sable] — fractions (somme = 1)

const GEPPA_CLASSES = [
  { code: "AA", nom: "Argile lourde", groupe: "argileuses", sommets: [1, 2, 3] },
  { code: "A", nom: "Argile (argileux)", groupe: "argileuses", sommets: [2, 4, 5, 6, 7, 3] },
  { code: "As", nom: "Argile sableuse", groupe: "argilo-sableuses", sommets: [4, 8, 9, 5] },
  { code: "Als", nom: "Argile limono-sableuse", groupe: "argilo-limoneuses", sommets: [5, 9, 10, 6] },
  { code: "Al", nom: "Argile limoneuse", groupe: "argilo-limoneuses", sommets: [6, 10, 11, 7] },
  { code: "AS", nom: "Argilo-sableux", groupe: "argilo-sableuses", sommets: [8, 12, 13, 9] },
  { code: "LAS", nom: "Limon argilo-sableux", groupe: "argilo-sableuses", sommets: [9, 13, 14, 15, 10] },
  { code: "La", nom: "Limon argileux", groupe: "argilo-limoneuses", sommets: [10, 15, 16, 11] },
  { code: "Sa", nom: "Sable argileux", groupe: "sablo-argileuses", sommets: [12, 17, 18, 13] },
  { code: "Sal", nom: "Sable argilo-limoneux", groupe: "sablo-argileuses", sommets: [13, 18, 19, 14] },
  { code: "LSa", nom: "Limon sablo-argileux", groupe: "limoneuses", sommets: [14, 19, 20, 15] },
  { code: "L", nom: "Limon", groupe: "limoneuses", sommets: [15, 20, 21, 16] },
  { code: "S", nom: "Sableux", groupe: "sableuses", sommets: [17, 22, 23, 18] },
  { code: "SS", nom: "Très sableux (sable)", groupe: "sableuses", sommets: [22, 24, 25, 23] },
  { code: "Sl", nom: "Sable limoneux", groupe: "sableuses", sommets: [18, 23, 25, 26, 19] },
  { code: "Ls", nom: "Limon sableux", groupe: "limoneuses", sommets: [19, 26, 27, 20] },
  { code: "LL", nom: "Très limoneux (limon pur)", groupe: "limoneuses", sommets: [20, 27, 28, 21] },
];

// argile au sommet, sable en bas à gauche, limon en bas à droite (triangle équilatéral, côté = 1)
function geppaXY(frac) {
  const [a, l] = frac;
  const h = Math.sqrt(3) / 2;
  return [0.5 * a + l, a * h];
}

function geppaPolyOf(classe) {
  return classe.sommets.map((i) => geppaXY(GEPPA_SOMMETS[i]));
}

function geppaPointDansPoly(pt, poly) {
  let dedans = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
}

// classe une composition sable/limon/argile (mêmes unités, ex. grammes) sur le triangle GEPPA
function geppaClasser(sable, limon, argile) {
  const total = (sable || 0) + (limon || 0) + (argile || 0);
  if (total <= 0) return null;
  const frac = [argile / total, limon / total, sable / total]; // [argile, limon, sable]
  const pt = geppaXY(frac);
  for (const c of GEPPA_CLASSES) {
    if (geppaPointDansPoly(pt, geppaPolyOf(c))) return { classe: c, frac, pt };
  }
  // repli si l'arrondi place le point tout juste hors d'un polygone (bord du triangle)
  let meilleure = null, dMin = Infinity;
  for (const c of GEPPA_CLASSES) {
    const poly = geppaPolyOf(c);
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const d = (cx - pt[0]) ** 2 + (cy - pt[1]) ** 2;
    if (d < dMin) { dMin = d; meilleure = c; }
  }
  return { classe: meilleure, frac, pt };
}
