// Base commune : constantes physiques, nombres complexes, vecteurs, polyèdres convexes, couleurs.
// Traduction fidèle de l'app Mac (Modele.swift, Volumes.swift, Couleurs.swift).

export const celerite = 343.0;   // m/s, air à 20 °C
export const rhoAir = 1.204;     // kg/m³

// MARK: Nombres complexes (objets {re, im})

export const cx = (re, im = 0) => ({ re, im });
export const cxAdd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
export const cxMul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
export const cxScal = (a, k) => ({ re: a.re * k, im: a.im * k });
export const cxDiv = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};
export const cxPhase = (phi) => ({ re: Math.cos(phi), im: Math.sin(phi) });
export const norme2 = (a) => a.re * a.re + a.im * a.im;

// MARK: Vecteurs 2D et 3D (tableaux)

export const v2 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, k) => [a[0] * k, a[1] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1],
  len: (a) => Math.hypot(a[0], a[1]),
  dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
  norm: (a) => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
  croix: (a, b) => a[0] * b[1] - a[1] * b[0],
  min: (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])],
  max: (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])],
};

export const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
};

/// Point (x, y) dans un polygone (règle pair-impair).
export function dansPolygone(x, y, c) {
  if (!c || c.length < 3) return true;
  let dedans = false;
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const a = c[i], b = c[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) dedans = !dedans;
  }
  return dedans;
}

/// Aire signée d'un polygone (positive dans le sens trigonométrique).
export function aire(p) {
  let a = 0;
  for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; }
  return a / 2;
}

/// Triangulation d'un polygone simple par oreilles (sommets dans un sens quelconque).
export function trianguler(p) {
  let pts = p.slice();
  if (aire(pts) < 0) pts.reverse();
  const r = [];
  const croix = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  let garde = 0;
  while (pts.length > 3 && garde < 1000) {
    garde++;
    let coupe = false;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i + pts.length - 1) % pts.length], b = pts[i], c = pts[(i + 1) % pts.length];
      if (croix(a, b, c) <= 1e-12) continue;
      let vide = true;
      for (const q of pts) {
        if (q === a || q === b || q === c) continue;
        if (croix(a, b, q) >= 0 && croix(b, c, q) >= 0 && croix(c, a, q) >= 0) { vide = false; break; }
      }
      if (!vide) continue;
      r.push([a, b, c]);
      pts.splice(i, 1);
      coupe = true;
      break;
    }
    if (!coupe) break;
  }
  if (pts.length === 3) r.push([pts[0], pts[1], pts[2]]);
  return r;
}

// MARK: Polyèdre convexe

export class Polyedre {
  constructor(sommets, facettes, materiau) {
    this.sommets = sommets;
    this.materiau = materiau;
    const c = [0, 0, 0];
    for (const s of sommets) { c[0] += s[0]; c[1] += s[1]; c[2] += s[2]; }
    const k = Math.max(sommets.length, 1);
    c[0] /= k; c[1] /= k; c[2] /= k;
    this.facettes = []; this.plans = [];
    for (const f of facettes) {
      // Normale de Newell, orientée vers l'extérieur.
      let n = [0, 0, 0];
      for (let i = 0; i < f.length; i++) {
        const a = sommets[f[i]], b = sommets[f[(i + 1) % f.length]];
        n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
      }
      const l = v3.len(n);
      if (l <= 1e-12) continue;
      n = v3.mul(n, 1 / l);
      let face = f.slice();
      if (v3.dot(n, v3.sub(sommets[f[0]], c)) < 0) { n = v3.mul(n, -1); face.reverse(); }
      this.facettes.push(face);
      this.plans.push({ n, d: v3.dot(n, sommets[f[0]]) });
    }
    this.bmin = [Infinity, Infinity, Infinity]; this.bmax = [-Infinity, -Infinity, -Infinity];
    for (const s of sommets) for (let a = 0; a < 3; a++) { this.bmin[a] = Math.min(this.bmin[a], s[a]); this.bmax[a] = Math.max(this.bmax[a], s[a]); }
  }

  contient(p, marge = 0) {
    for (let a = 0; a < 3; a++) if (p[a] < this.bmin[a] - marge || p[a] > this.bmax[a] + marge) return false;
    for (const pl of this.plans) if (pl.n[0] * p[0] + pl.n[1] * p[1] + pl.n[2] * p[2] > pl.d + marge) return false;
    return true;
  }

  /// Entrée d'un rayon venant de l'extérieur : [distance, normale] ou null.
  intersection(o, dir, tmax) {
    let a0 = 0, a1 = tmax;
    for (let ax = 0; ax < 3; ax++) {
      if (Math.abs(dir[ax]) < 1e-14) {
        if (o[ax] < this.bmin[ax] || o[ax] > this.bmax[ax]) return null;
      } else {
        let ta = (this.bmin[ax] - o[ax]) / dir[ax], tb = (this.bmax[ax] - o[ax]) / dir[ax];
        if (ta > tb) { const x = ta; ta = tb; tb = x; }
        a0 = Math.max(a0, ta); a1 = Math.min(a1, tb);
        if (a0 > a1) return null;
      }
    }
    let t0 = 1e-9, t1 = tmax, nEntree = [0, 0, 1];
    for (const pl of this.plans) {
      const den = pl.n[0] * dir[0] + pl.n[1] * dir[1] + pl.n[2] * dir[2];
      const dist = pl.d - (pl.n[0] * o[0] + pl.n[1] * o[1] + pl.n[2] * o[2]);
      if (Math.abs(den) < 1e-14) { if (dist < 0) return null; continue; }
      const t = dist / den;
      if (den < 0) { if (t > t0) { t0 = t; nEntree = pl.n; } }
      else if (t < t1) t1 = t;
      if (t0 > t1) return null;
    }
    if (t0 <= 1e-9) return null;
    return [t0, nEntree];
  }

  /// Le segment [a, b] traverse-t-il le volume ?
  coupe(a, b) {
    const d = v3.sub(b, a);
    let t0 = 0, t1 = 1;
    for (const pl of this.plans) {
      const den = v3.dot(pl.n, d);
      const dist = pl.d - v3.dot(pl.n, a);
      if (Math.abs(den) < 1e-14) { if (dist < 0) return false; continue; }
      const t = dist / den;
      if (den < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
    return t1 - t0 > 1e-6;
  }
}

// MARK: Couleurs

/// Palette « turbo » (Google, approximation polynomiale) : bleu froid → rouge chaud. Composantes 0…255.
export function turbo(t) {
  const x = Math.min(Math.max(t, 0), 1);
  const r = 0.13572138 + x * (4.61539260 + x * (-42.66032258 + x * (132.13108234 + x * (-152.94239396 + x * 59.28637943))));
  const g = 0.09140261 + x * (2.19418839 + x * (4.84296658 + x * (-14.18503333 + x * (4.27729857 + x * 2.82956604))));
  const b = 0.10667330 + x * (12.64194608 + x * (-60.58204836 + x * (110.36276771 + x * (-89.90310912 + x * 27.34824973))));
  const o = (v) => Math.round(Math.min(Math.max(v, 0), 1) * 255);
  return [o(r), o(g), o(b)];
}

/// Divergente pour la pression instantanée : bleu (dépression) → blanc → rouge (surpression).
export function divergente(v) {
  const x = Math.min(Math.max(v, -1), 1);
  const bleu = [0.16, 0.33, 0.72], blanc = [0.97, 0.96, 0.94], rouge = [0.80, 0.20, 0.15];
  const a = x < 0 ? bleu : rouge, t = Math.abs(x);
  return [0, 1, 2].map((i) => Math.round((blanc[i] * (1 - t) + a[i] * t) * 255));
}

const teintes = {
  platre: [0.93, 0.91, 0.87], beton: [0.66, 0.66, 0.66], 'beton-peint': [0.84, 0.84, 0.82], brique: [0.72, 0.42, 0.32],
  facade: [0.88, 0.83, 0.72], vitre: [0.66, 0.80, 0.88], bois: [0.70, 0.52, 0.34], parquet: [0.74, 0.57, 0.38],
  carrelage: [0.80, 0.80, 0.78], moquette: [0.46, 0.43, 0.52], rideau: [0.58, 0.32, 0.36], 'faux-plafond': [0.95, 0.95, 0.95],
  laine: [0.86, 0.78, 0.46], public: [0.42, 0.46, 0.60], bitume: [0.32, 0.32, 0.34], paves: [0.56, 0.53, 0.49],
  pelouse: [0.38, 0.60, 0.32], ouvert: [0.30, 0.55, 0.95],
};
/// Teinte d'un matériau (0…1).
export const teinteMateriau = (id) => teintes[id] || [0.62, 0.64, 0.68];
export const cssMateriau = (id) => { const t = teinteMateriau(id); return `rgb(${t.map((v) => Math.round(v * 255)).join(',')})`; };
