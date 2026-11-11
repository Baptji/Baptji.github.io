// Les règles du minuteur, sans rien d'affiché : reprises de Minuteur.swift et Application.swift.

/// Le compte à rebours. On ne compte pas les tics (ça dérive, et un onglet en arrière-plan est ralenti) :
/// on garde une échéance absolue et on en déduit le temps restant à chaque rafraîchissement.
export class Minuteur {
  constructor(secondes, horloge = Date.now) {
    this.total = secondes;
    this.horloge = horloge;
    this.echeance = horloge() + secondes * 1000;
    this.enPause = false;
    this.gele = secondes;
  }

  /// Secondes restantes (figées pendant la pause).
  restant() {
    return this.enPause ? this.gele : Math.max(0, (this.echeance - this.horloge()) / 1000);
  }

  progression() {
    if (this.total <= 0) return 1;
    return Math.max(0, Math.min(1, 1 - this.restant() / this.total));
  }

  get termine() {
    return !this.enPause && this.restant() <= 0;
  }

  basculerPause() {
    if (this.enPause) {
      this.echeance = this.horloge() + this.gele * 1000;
      this.enPause = false;
    } else {
      this.gele = this.restant();
      this.enPause = true;
    }
  }
}

/// « 24:59 » ou « 1:04:59 » au-delà de l'heure.
export function texte(restant) {
  const s = Math.ceil(restant - 1e-9);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const deux = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${deux(m)}:${deux(sec)}` : `${m}:${deux(sec)}`;
}

/// La durée dans le message de fin : « 1 heure », « 25 minutes ».
export function libelle(minutes) {
  if (minutes === 60) return '1 heure';
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

/// La durée sous le curseur « Autre durée » : « 20 min », « 1 h », « 1 h 30 ».
export function libelleCurseur(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60), reste = minutes % 60;
  return reste === 0 ? `${h} h` : `${h} h ${reste}`;
}

/// L'aiguille de la petite montre : un tour par minute, dans le sens des aiguilles, en haut à chaque minute ronde (degrés).
export function aiguille(restant) {
  const s = Math.ceil(restant - 1e-9);
  return ((60 - (s % 60)) % 60) * 6;
}

// ——— la scène : une journée qui passe, du lever au coucher du soleil ———

/// La géométrie pour un écran de L × H pixels : l'horizon, la taille du soleil et sa course, une demi-ellipse
/// qui part sous l'horizon à gauche, culmine sous la pastille et replonge sous l'horizon à droite.
export function geometrie(L, H) {
  const rayon = Math.round(Math.min(64, Math.max(24, Math.min(L, H) * 0.052)));
  const horizon = Math.round(H * (L < H ? 0.62 : 0.66));
  const base = horizon + rayon * 1.25;
  const sommet = Math.max(H * 0.26, 100 + rayon);
  const ry = Math.max(rayon * 3, base - sommet);
  return { L, H, rayon, horizon, cx: L / 2, base, ry, rx: Math.min(L * 0.42, ry * 1.9) };
}

/// Le point de la course à la progression p (0 → 1) : l'angle avance d'un pas égal, comme une aiguille.
export function pointCourse(g, p) {
  const a = Math.PI * Math.max(0, Math.min(1, p));
  return { x: g.cx - g.rx * Math.cos(a), y: g.base - g.ry * Math.sin(a) };
}

/// La hauteur du centre du soleil au-dessus de l'horizon, en rayons (négative quand il est couché).
export function hauteurSoleil(g, p) {
  return (g.horizon - pointCourse(g, p).y) / g.rayon;
}

/// Un repère par minute le long de la course (progressions de 0 à 1).
export function reperes(minutes) {
  const n = Math.max(1, Math.round(minutes));
  return Array.from({ length: n + 1 }, (_, k) => k / n);
}

const CLES = ['haut', 'milieu', 'horizon', 'soleil', 'halo', 'merHaut', 'merBas', 'nuage'];
/// Les couleurs de la journée, de l'aube (0) au crépuscule (1) ; NUIT pour l'attente et la fin.
export const JOURNEE = [
  [0.00, ['#141235', '#3b2a6b', '#c8607a', '#ff8f5a', '#ff7a59', '#2a2160', '#0f0c2e', '#6b4e8e']],
  [0.12, ['#2b2c7a', '#6e5bb5', '#ffb08a', '#ffc36b', '#ffb36b', '#4a3f9a', '#1e1a55', '#f3b9b0']],
  [0.30, ['#3550c9', '#6f8df0', '#c9d6ff', '#ffe6a0', '#fff1c9', '#4c6ad8', '#22307e', '#ffffff']],
  [0.50, ['#2f5be0', '#6e9bff', '#d5e3ff', '#fff2c4', '#ffffff', '#3f6ce0', '#1c2e86', '#ffffff']],
  [0.70, ['#3049b8', '#7a86e6', '#f3d2b5', '#ffd27a', '#ffe0a8', '#4a57c2', '#1f2470', '#fff3e6']],
  [0.88, ['#2a2470', '#8a4f9e', '#ff8a5c', '#ff7a3d', '#ff8a4c', '#4b3389', '#1a1450', '#ffae8a']],
  [1.00, ['#15123d', '#4b2c6e', '#c5546e', '#f2553a', '#e0566a', '#2e1f5e', '#0e0b2c', '#7a4a7e']],
];
export const NUIT = { ...objet(['#07061c', '#15123f', '#2a2266', '#ff8f5a', '#3a2d7a', '#1b1650', '#07061a', '#2b2560']), etoiles: 1 };

function objet(couleurs) {
  return { ...Object.fromEntries(CLES.map((c, i) => [c, couleurs[i]])), etoiles: 0 };
}
function rvb(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function hex(c) {
  return '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/// Mélange de deux palettes (t de 0 à 1) ; « etoiles » est la part de nuit, de 0 à 1.
export function melange(a, b, t) {
  const m = Object.fromEntries(CLES.map((c) => {
    const x = rvb(a[c]), y = rvb(b[c]);
    return [c, hex(x.map((v, i) => v + (y[i] - v) * t))];
  }));
  m.etoiles = a.etoiles + (b.etoiles - a.etoiles) * t;
  return m;
}

/// Les couleurs du ciel, du soleil et de la mer à la progression p.
export function palette(p) {
  p = Math.max(0, Math.min(1, p));
  let i = 0;
  while (i < JOURNEE.length - 2 && p > JOURNEE[i + 1][0]) i++;
  const [p0, c0] = JOURNEE[i], [p1, c1] = JOURNEE[i + 1];
  return { ...melange(objet(c0), objet(c1), (p - p0) / (p1 - p0)), etoiles: etoiles(p) };
}

function lissage(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/// La part de nuit (étoiles visibles) : pleine au départ et à la fin, nulle en plein jour.
export function etoiles(p) {
  return Math.max(0, Math.min(1, 1 - lissage(0, 0.12, p) + lissage(0.9, 1, p)));
}

/// L'éclat du halo et du reflet selon la hauteur du soleil (en rayons) : il s'annonce avant de se lever.
export function eclat(hauteur) {
  return lissage(-2.2, 1, hauteur);
}
