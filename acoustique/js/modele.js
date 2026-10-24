// Modèle : matériaux, enceintes, volumes, scène, modèles de départ. Traduction de l'app Mac
// (Modele.swift, Volumes.swift). Les objets sont de simples données (JSON) ; les fonctions les lisent.

import { Polyedre, dansPolygone, v3 } from './base.js?v=20261024222224';

// MARK: Faces de la boîte de calcul (ordre fixe : ouest, est, sud, nord, sol, plafond)

export const COTES = ['ouest', 'est', 'sud', 'nord', 'sol', 'plafond'];
export const NOMS_COTES = ['Mur gauche (ouest)', 'Mur droit (est)', 'Mur bas (sud)', 'Mur haut (nord)', 'Sol', 'Plafond / ciel'];
export const axeCote = (c) => Math.floor(c / 2);
export const hautCote = (c) => c % 2 === 1;

// MARK: Matériaux (α par octave, 125 Hz → 8 kHz)

export const OCTAVES_ALPHA = [125, 250, 500, 1000, 2000, 4000, 8000];

export const MATERIAUX = [
  ['ouvert', 'Ouvert (rien)', [1, 1, 1, 1, 1, 1, 1]],
  ['beton', 'Béton brut', [0.01, 0.01, 0.02, 0.02, 0.02, 0.03, 0.03]],
  ['beton-peint', 'Béton ou parpaing peint', [0.10, 0.05, 0.06, 0.07, 0.09, 0.08, 0.08]],
  ['brique', 'Brique apparente', [0.03, 0.03, 0.03, 0.04, 0.05, 0.07, 0.07]],
  ['facade', 'Façade enduite, pierre', [0.02, 0.02, 0.03, 0.04, 0.05, 0.05, 0.05]],
  ['platre', 'Plaque de plâtre sur ossature', [0.29, 0.10, 0.05, 0.04, 0.07, 0.09, 0.09]],
  ['vitre', 'Grande vitre', [0.18, 0.06, 0.04, 0.03, 0.02, 0.02, 0.02]],
  ['bois', 'Lambris bois sur tasseaux', [0.30, 0.25, 0.15, 0.10, 0.10, 0.07, 0.07]],
  ['parquet', 'Parquet sur lambourdes', [0.15, 0.11, 0.10, 0.07, 0.06, 0.07, 0.07]],
  ['carrelage', 'Carrelage', [0.01, 0.01, 0.01, 0.01, 0.02, 0.02, 0.02]],
  ['moquette', 'Moquette épaisse', [0.02, 0.06, 0.14, 0.37, 0.60, 0.65, 0.65]],
  ['rideau', 'Rideau lourd plissé', [0.07, 0.31, 0.49, 0.75, 0.70, 0.60, 0.60]],
  ['faux-plafond', 'Faux plafond acoustique', [0.50, 0.70, 0.60, 0.70, 0.70, 0.50, 0.50]],
  ['laine', 'Panneau de laine minérale 10 cm', [0.45, 0.90, 0.99, 0.99, 0.99, 0.99, 0.99]],
  ['public', 'Public debout (sol)', [0.25, 0.44, 0.59, 0.73, 0.77, 0.77, 0.77]],
  ['bitume', 'Enrobé, bitume', [0.02, 0.03, 0.03, 0.03, 0.03, 0.02, 0.02]],
  ['paves', 'Pavés', [0.02, 0.03, 0.03, 0.04, 0.05, 0.05, 0.05]],
  ['pelouse', 'Pelouse, terre meuble', [0.11, 0.26, 0.60, 0.69, 0.92, 0.99, 0.99]],
  ['rigide', 'Parfaitement réfléchissant', [0, 0, 0, 0, 0, 0, 0]],
].map(([id, nom, alpha], i) => ({ id, nom, alphas: alpha, numero: i + 1 }));

const parId = new Map(MATERIAUX.map((m) => [m.id, m]));
export const materiau = (id) => parId.get(id) || MATERIAUX[1];
export const estOuvert = (id) => id === 'ouvert';

/// α à la fréquence f, interpolé en log-fréquence entre les octaves.
export function alpha(id, f) {
  if (estOuvert(id)) return 1;
  const a = materiau(id).alphas, o = OCTAVES_ALPHA;
  if (f <= o[0]) return a[0];
  if (f >= o[o.length - 1]) return a[o.length - 1];
  const x = Math.log2(f / o[0]);
  const i = Math.min(Math.floor(x), o.length - 2), t = x - i;
  return a[i] * (1 - t) + a[i + 1] * t;
}

/// α du calcul ondulatoire : moyenne des octaves qu'il couvre.
export function alphaOndes(id, fmax) {
  if (estOuvert(id)) return 1;
  const a = materiau(id).alphas;
  const utiles = OCTAVES_ALPHA.map((o, i) => [o, a[i]]).filter(([o]) => o <= Math.max(fmax, 125)).map(([, v]) => v);
  return utiles.reduce((s, v) => s + v, 0) / Math.max(utiles.length, 1);
}

/// Part de l'énergie renvoyée dans toutes les directions plutôt qu'en miroir.
export function diffusion(id) {
  switch (id) {
    case 'public': return 0.6;
    case 'rideau': case 'pelouse': return 0.4;
    case 'brique': case 'paves': case 'laine': case 'faux-plafond': return 0.25;
    case 'bois': case 'moquette': return 0.2;
    case 'vitre': case 'carrelage': case 'rigide': return 0.05;
    default: return 0.1;
  }
}

// MARK: Identifiants

let compteur = 0;
export const nouvelId = () => (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}-${++compteur}`;

// MARK: Enceintes

export const GENRES = [
  ['enceinte', 'Enceinte (caisse close)', 'Enceinte'],
  ['caisson', 'Caisson de basses', 'Caisson'],
  ['nu', 'Haut-parleur nu (sans caisse)', 'Haut-parleur nu'],
  ['omni', 'Source ponctuelle', 'Source'],
].map(([id, nom, court]) => ({ id, nom, court }));
export const genre = (id) => GENRES.find((g) => g.id === id) || GENRES[0];

export const FILTRES = [['aucun', 'Pleine bande'], ['passeBas', 'Passe-bas (caisson)'], ['passeHaut', 'Passe-haut (satellite)']]
  .map(([id, nom]) => ({ id, nom }));

export function nouvelleEnceinte(g, x, y, z, nom) {
  const e = {
    id: nouvelId(), nom: nom || genre(g).court, genre: g, x, y, z, azimut: 0, niveau: 100, delai: 0, inverse: false,
    filtre: 'aucun', coupure: 90, largeur: 0.25, hauteur: 0.40, profondeur: 0.28, baffle: 0.20, active: true,
  };
  if (g === 'caisson') { e.largeur = 0.50; e.hauteur = 0.50; e.profondeur = 0.55; e.filtre = 'passeBas'; e.coupure = 90; }
  return e;
}

export const axe = (e) => { const a = e.azimut * Math.PI / 180; return [Math.cos(a), Math.sin(a), 0]; };

/// Ce qui change le calcul ondulatoire d'une enceinte (le reste se combine après coup).
export function cleGeometrie(e) {
  const r = (v) => v.toFixed(3);
  let s = `${e.genre}|${r(e.x)}|${r(e.y)}|${r(e.z)}|${r(e.azimut)}`;
  if (e.genre === 'enceinte' || e.genre === 'caisson') s += `|${r(e.largeur)}|${r(e.hauteur)}|${r(e.profondeur)}`;
  else if (e.genre === 'nu') s += `|${r(e.baffle)}`;
  return s;
}

// MARK: Volumes

export const FORMES = {
  boite: { nom: 'Bloc (meuble, estrade, mur)', court: 'Bloc' },
  pan: { nom: 'Pan de toit (rampant)', court: 'Pan de toit' },
  cylindre: { nom: 'Pilier rond', court: 'Pilier' },
  ouverture: { nom: 'Ouverture (fenêtre, porte)', court: 'Ouverture' },
  paroi: { nom: 'Paroi scannée', court: 'Paroi' },
  toit: { nom: 'Toit de la pièce dessinée', court: 'Toit' },
};
export const FORMES_AJOUTABLES = ['boite', 'pan', 'cylindre', 'ouverture'];

export function nouveauBloc(champs) {
  return Object.assign({ id: nouvelId(), nom: 'Bloc', forme: 'boite', x: 0, y: 0, z: 0, longueur: 1, profondeur: 1, hauteur: 1,
    azimut: 0, materiau: 'platre', profil: null, dansParoi: null, duPlan: null, pente: null, ancrage: null }, champs);
}

export const avant = (b) => { const a = b.azimut * Math.PI / 180; return [Math.cos(a), Math.sin(a), 0]; };
export const cote = (b) => { const a = b.azimut * Math.PI / 180; return [-Math.sin(a), Math.cos(a), 0]; };

const cachePoly = new WeakMap();

/// Polyèdre convexe d'un volume (mis en cache tant que l'objet n'est pas remplacé).
export function polyedre(b) {
  const deja = cachePoly.get(b);
  const cle = cleBloc(b, -1);
  if (deja && deja.cle === cle) return deja.p;
  const p = construirePolyedre(b);
  cachePoly.set(b, { cle, p });
  return p;
}

function construirePolyedre(b) {
  const av = avant(b), co = cote(b), c = [b.x, b.y, b.z];
  const monde = (f, l, h) => [c[0] + av[0] * f + co[0] * l, c[1] + av[1] * f + co[1] * l, c[2] + h];
  const p = b.profondeur / 2, l = b.longueur / 2, h = b.hauteur / 2;
  const mat = b.materiau;
  switch (b.forme) {
    case 'pan': {
      const s = [monde(-p, -l, -h), monde(-p, -l, h), monde(p, -l, h), monde(-p, l, -h), monde(-p, l, h), monde(p, l, h)];
      return new Polyedre(s, [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [0, 2, 5, 3]], mat);
    }
    case 'paroi': {
      const pr = b.profil || [[-l, -h], [l, -h], [l, h], [-l, h]];
      const k = pr.length;
      const s = pr.map((q) => monde(-p, q[0], q[1])).concat(pr.map((q) => monde(p, q[0], q[1])));
      const f = [[...Array(k).keys()], [...Array(k).keys()].map((i) => k + i).reverse()];
      for (let i = 0; i < k; i++) f.push([i, (i + 1) % k, k + (i + 1) % k, k + i]);
      return new Polyedre(s, f, mat);
    }
    case 'toit': {
      // Prisme vertical sur la bande, entre la pente (dessous) et le plafond plat (dessus).
      const bande = b.profil || [], pl = b.pente || [0, 0, 0, 0], k = bande.length;
      const bas = bande.map((q) => [q[0], q[1], Math.min(pl[0] * q[0] + pl[1] * q[1] + pl[2], pl[3])]);
      const haut = bande.map((q) => [q[0], q[1], pl[3]]);
      const f = [[...Array(k).keys()].reverse(), [...Array(k).keys()].map((i) => k + i)];
      for (let i = 0; i < k; i++) f.push([i, (i + 1) % k, k + (i + 1) % k, k + i]);
      return new Polyedre(bas.concat(haut), f, mat);
    }
    case 'cylindre': {
      const n = 20, r = b.longueur / 2, s = [];
      for (let k = 0; k < n; k++) { const t = 2 * Math.PI * k / n; s.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t), c[2] - h]); }
      for (let k = 0; k < n; k++) { const t = 2 * Math.PI * k / n; s.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t), c[2] + h]); }
      const f = [[...Array(n).keys()].reverse(), [...Array(n).keys()].map((i) => n + i)];
      for (let k = 0; k < n; k++) f.push([k, (k + 1) % n, n + (k + 1) % n, n + k]);
      return new Polyedre(s, f, mat);
    }
    default: {
      const s = [monde(-p, -l, -h), monde(p, -l, -h), monde(p, l, -h), monde(-p, l, -h),
        monde(-p, -l, h), monde(p, -l, h), monde(p, l, h), monde(-p, l, h)];
      return new Polyedre(s, [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], mat);
    }
  }
}

/// Clé d'un volume (géométrie et matériau ; fmax < 0 : matériau par son nom).
export function cleBloc(b, fmax) {
  const m = fmax < 0 ? b.materiau : alphaOndes(b.materiau, fmax).toFixed(4);
  const r = (v) => (+v).toFixed(3);
  const pr = (b.profil ? b.profil.map((q) => `${r(q[0])},${r(q[1])}`).join(' ') : '') + (b.pente ? b.pente.map((v) => (+v).toFixed(4)).join(',') : '');
  return `${b.forme}|${r(b.x)}|${r(b.y)}|${r(b.z)}|${r(b.longueur)}|${r(b.profondeur)}|${r(b.hauteur)}|${(+b.azimut).toFixed(2)}|${m}${pr}`;
}

// MARK: Scène

export function nouvelleScene(champs) {
  return Object.assign({ nom: 'Pièce', longueur: 5, largeur: 4, hauteur: 2.5, faces: ['platre', 'platre', 'platre', 'platre', 'parquet', 'platre'],
    enceintes: [], ecoute: 1.2, micro: [1, 1], blocs: [], contour: null, plan: null }, champs);
}

export const materiauCote = (s, c) => s.faces[c];
export const ouvertCote = (s, c) => estOuvert(s.faces[c]);
export const dims = (s) => [s.longueur, s.largeur, s.hauteur];
export const volume = (s) => s.longueur * s.largeur * s.hauteur;
export function aireCote(s, c) {
  switch (axeCote(c)) { case 0: return s.largeur * s.hauteur; case 1: return s.longueur * s.hauteur; default: return s.longueur * s.largeur; }
}

export const dansContour = (s, x, y) => dansPolygone(x, y, s.contour);

/// Volumes qui arrêtent le son (les ouvertures n'en sont pas).
export const solides = (s) => s.blocs.filter((b) => b.forme !== 'ouverture').map(polyedre);
export const ouvertures = (s) => s.blocs.filter((b) => b.forme === 'ouverture');
export const dansSolide = (s, p) => solides(s).some((v) => v.contient(p));

/// Ramène les enceintes et le micro dans l'espace.
export function borner(s) {
  for (const e of s.enceintes) {
    e.x = Math.min(Math.max(e.x, 0.05), s.longueur - 0.05);
    e.y = Math.min(Math.max(e.y, 0.05), s.largeur - 0.05);
    e.z = Math.min(Math.max(e.z, 0.05), s.hauteur - 0.05);
  }
  s.micro = [Math.min(Math.max(s.micro[0], 0), s.longueur), Math.min(Math.max(s.micro[1], 0), s.largeur)];
  s.ecoute = Math.min(Math.max(s.ecoute, 0.05), s.hauteur - 0.05);
}

/// Ouverture entre deux parties de la pièce (porte intérieure) : le son passe au lieu de sortir.
export function passage(b, s) {
  if (b.forme !== 'ouverture') return false;
  const d = Math.max(b.profondeur / 2 + 0.25, 0.3), av = avant(b), sol = solides(s);
  const dedans = (p) => p[0] > 0 && p[1] > 0 && p[2] > 0 && p[0] < s.longueur && p[1] < s.largeur && p[2] < s.hauteur
    && dansContour(s, p[0], p[1]) && !sol.some((v) => v.contient(p));
  const c = [b.x, b.y, b.z];
  return dedans(v3.add(c, v3.mul(av, d))) && dedans(v3.sub(c, v3.mul(av, d)));
}

/// Ce qui change le domaine du calcul ondulatoire.
export function cleEspace(s, fmax) {
  const m = s.faces.map((id) => alphaOndes(id, fmax).toFixed(4) + (estOuvert(id) ? 'o' : '')).join(',');
  return `${s.longueur.toFixed(3)}|${s.largeur.toFixed(3)}|${s.hauteur.toFixed(3)}|${m}|` + s.blocs.map((b) => cleBloc(b, fmax)).join(';');
}

/// Ce qui change le lancer de rayons (tous les matériaux, toutes les bandes).
export function cleRayons(s) {
  return `${s.longueur.toFixed(3)}|${s.largeur.toFixed(3)}|${s.hauteur.toFixed(3)}|${s.faces.join(',')}|` + s.blocs.map((b) => cleBloc(b, -1)).join(';');
}

export const copie = (o) => JSON.parse(JSON.stringify(o));
