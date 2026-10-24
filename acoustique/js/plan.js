// Pièce dessinée : contour au sol, rampant par mur, toit unique (pentes + plafond plat) d'où
// dérivent murs, pentes affichées et volumes solides ; fenêtres ancrées ; cotes et aimant.
// Traduction de l'app Mac (Plan.swift, Toit.swift).

import { v2, aire, trianguler, dansPolygone } from './base.js?v=20261024205355';
import { nouveauBloc, borner, polyedre, axe, solides } from './modele.js?v=20261024205355';

export const EPAISSEUR = 0.14;

export const nouveauMur = () => ({ materiau: 'platre', rampant: false, pied: 1.0, pente: 45.0 });

export function nouveauPlan(coins, murs) {
  return { coins: coins.map((c) => c.slice()), murs: murs || coins.map(nouveauMur), pas: 0.25, decalage: [0, 0] };
}
export const rectangle = (l, w) => nouveauPlan([[0, 0], [l, 0], [l, w], [0, w]]);
export const aimanter = (pl, v) => (pl.pas > 0 ? Math.round(v / pl.pas) * pl.pas : v);

export const FORMES_PLAN = [
  { id: 'rectangle', nom: 'Rectangle', plan: () => [rectangle(5, 4), 2.5] },
  { id: 'enL', nom: 'En L', plan: () => [nouveauPlan([[0, 0], [6, 0], [6, 3], [2.5, 3], [2.5, 5.5], [0, 5.5]]), 2.5] },
  { id: 'enT', nom: 'En T', plan: () => [nouveauPlan([[2, 0], [4.5, 0], [4.5, 2.5], [6.5, 2.5], [6.5, 5], [0, 5], [0, 2.5], [2, 2.5]]), 2.5] },
  { id: 'trapeze', nom: 'Trapèze', plan: () => [nouveauPlan([[0, 0], [5.5, 0], [4.5, 4], [1, 4]]), 2.5] },
  { id: 'mansarde', nom: 'Mansarde (deux rampants)', plan: () => {
    const p = rectangle(5.2, 4);
    for (const i of [0, 2]) Object.assign(p.murs[i], { rampant: true, pied: 1.0, pente: 50 });
    return [p, 2.7];
  } },
  { id: 'combles', nom: 'Combles à quatre pans', plan: () => {
    const p = rectangle(6, 4.5);
    for (let i = 0; i < 4; i++) Object.assign(p.murs[i], { rampant: true, pied: 0.8, pente: 40 });
    return [p, 2.6];
  } },
];

export const idMur = (i, k = 0) => `mur-${i}-${k}`;
export const idRampant = (i, k = 0) => `rampant-${i}-${k}`;

/// Coins du plan dans le repère de la scène.
export function coinsPlan(s) {
  if (!s.plan) return [];
  const o = s.plan.decalage;
  return s.plan.coins.map((c) => [c[0] + o[0], c[1] + o[1]]);
}

/// Mur du plan auquel appartient ce volume.
export function murDuPlan(s, id) {
  if (!s.plan || !id) return null;
  const b = s.blocs.find((x) => x.id === id);
  return b && b.duPlan != null ? b.duPlan : null;
}

/// Normale intérieure du mur i.
export function normalePlan(s, i) {
  const q = coinsPlan(s);
  if (q.length < 3) return null;
  const v = v2.sub(q[(i + 1) % q.length], q[i]), l = v2.len(v);
  return l > 1e-6 ? [-v[1] / l, v[0] / l] : null;
}

/// Origine des cotes : le coin bas-gauche de la pièce, sinon celui de la boîte.
export function origine(s) {
  const q = s.plan ? coinsPlan(s) : (s.contour || []);
  if (!q.length) return [0, 0];
  return q.reduce((m, p) => v2.min(m, p), [Infinity, Infinity]);
}

function decaler(s, d) {
  if (d[0] === 0 && d[1] === 0) return;
  for (const e of s.enceintes) { e.x += d[0]; e.y += d[1]; }
  for (const b of s.blocs) if (b.duPlan == null) { b.x += d[0]; b.y += d[1]; }
  s.micro = [s.micro[0] + d[0], s.micro[1] + d[1]];
}

/// Passe d'une boîte à une pièce dessinée.
export function dessinerPlan(s) {
  if (s.plan) return;
  const p = rectangle(s.longueur, s.largeur);
  [2, 1, 3, 0].forEach((c, i) => { if (s.faces[c] !== 'ouvert') p.murs[i].materiau = s.faces[c]; });
  s.plan = p;
  appliquerPlan(s);
}

/// Revient à une boîte.
export function retirerPlan(s) {
  const p = s.plan;
  if (!p) return;
  const q = coinsPlan(s);
  const lo = q.reduce((m, x) => v2.min(m, x), [Infinity, Infinity]), hi = q.reduce((m, x) => v2.max(m, x), [-Infinity, -Infinity]);
  s.blocs = s.blocs.filter((b) => b.duPlan == null);
  decaler(s, [-lo[0], -lo[1]]);
  s.longueur = hi[0] - lo[0]; s.largeur = hi[1] - lo[1];
  [2, 1, 3, 0].forEach((c, i) => { if (i < p.murs.length) s.faces[c] = p.murs[i].materiau; });
  s.plan = null; s.contour = null;
  borner(s);
}

// MARK: Toit

/// Garde la partie d'un polygone convexe où g · p + c ≤ 0.
export function couper(poly, g, c) {
  if (!poly.length) return [];
  const r = [];
  for (let i = 0; i < poly.length; i++) {
    const u = poly[i], v = poly[(i + 1) % poly.length];
    const fu = g[0] * u[0] + g[1] * u[1] + c, fv = g[0] * v[0] + g[1] * v[1] + c;
    if (fu <= 0) r.push(u);
    if ((fu < 0 && fv > 0) || (fu > 0 && fv < 0)) { const k = fu / (fu - fv); r.push([u[0] + (v[0] - u[0]) * k, u[1] + (v[1] - u[1]) * k]); }
  }
  return r;
}

class PanToit {
  constructor(o) { Object.assign(this, o); this.bords = []; this.bandes = []; }
  u(p) { return (p[0] - this.a[0]) * this.t[0] + (p[1] - this.a[1]) * this.t[1]; }
  d(p) { return (p[0] - this.a[0]) * this.n[0] + (p[1] - this.a[1]) * this.n[1]; }
  z(p) { return this.pied + this.pente * this.d(p); }
  get g() { return [this.n[0] * this.pente, this.n[1] * this.pente]; }
  get c() { return this.pied - this.pente * (this.a[0] * this.n[0] + this.a[1] * this.n[1]); }
  couvre(p) { return this.actif && this.bords.every(([g, c]) => g[0] * p[0] + g[1] * p[1] + c <= 1e-7); }
}

export class Toit {
  constructor(pans, H, contour) { this.pans = pans; this.H = H; this.contour = contour; }
  bord(m) { return this.pans.find((p) => p.mur === m) || null; }
  z(k, p) { return k == null ? this.H : this.pans[k].z(p); }
  lineaire(k) { return k == null ? [[0, 0], this.H] : [this.pans[k].g, this.pans[k].c]; }

  /// Hauteur du toit au point p et le rampant qui la donne (null : plafond plat).
  hauteur(p) {
    let best = [this.H, null];
    this.pans.forEach((r, k) => { if (r.couvre(p)) { const v = r.z(p); if (v < best[0] - 1e-9) best = [v, k]; } });
    return best;
  }

  /// Faces du toit vues du dessous : chaque rampant et le plafond plat, découpés exactement.
  faces() {
    let morceaux = trianguler(this.contour).map((t) => (aire(t) < 0 ? t.slice().reverse() : t));
    for (const r of this.pans) {
      if (!r.actif) continue;
      for (const [g, c] of r.bords) {
        const suite = [];
        for (const m of morceaux) {
          for (const part of [couper(m, g, c), couper(m, [-g[0], -g[1]], -c)]) if (aire(part) > 1e-9) suite.push(part);
        }
        morceaux = suite;
      }
    }
    const faces = [];
    for (const m of morceaux) {
      const centre = [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length];
      const candidats = [null].concat(this.pans.map((r, k) => (r.couvre(centre) ? k : -1)).filter((k) => k >= 0));
      candidats.forEach((k, ic) => {
        const [gk, ck] = this.lineaire(k);
        let region = m;
        candidats.forEach((o, io) => {
          if (io === ic || region.length < 3) return;
          const [go, co] = this.lineaire(o);
          region = couper(region, [gk[0] - go[0], gk[1] - go[1]], ck - co + (io < ic ? 1e-9 : 0));
        });
        if (region.length >= 3 && aire(region) > 1e-9) {
          faces.push({ mur: k == null ? null : this.pans[k].mur, points: region.map((p) => [p[0], p[1], this.z(k, p)]) });
        }
      });
    }
    return faces;
  }

  /// Retombées : faces verticales là où le toit fait une marche (donnée une fois, par le côté bas).
  retombees() {
    const r = [];
    for (const f of this.faces()) {
      const pts = f.points.map((p) => [p[0], p[1]]);
      const sens = aire(pts) >= 0 ? 1 : -1;
      const k = f.mur == null ? null : this.pans.findIndex((p) => p.mur === f.mur);
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], d = v2.sub(b, a), l = v2.len(d);
        if (l <= 1e-6) continue;
        const dehors = [d[1] / l * sens, -d[0] / l * sens];
        const m = [(a[0] + b[0]) / 2 + dehors[0] * 1e-5, (a[1] + b[1]) / 2 + dehors[1] * 1e-5];
        if (!dansPolygone(m[0], m[1], this.contour)) continue;
        const ko = this.hauteur(m)[1];
        const za = Math.min(this.z(k, a), this.H), zb = Math.min(this.z(k, b), this.H);
        const oa = Math.min(this.z(ko, a), this.H), ob = Math.min(this.z(ko, b), this.H);
        if (oa > za + 1e-6 || ob > zb + 1e-6) r.push([[a[0], a[1], za], [b[0], b[1], zb], [b[0], b[1], Math.max(ob, zb)], [a[0], a[1], Math.max(oa, za)]]);
      }
    }
    return r;
  }

  /// Hauteur la plus basse du mur i (face intérieure) entre u0 et u1.
  hautMini(i, u0, u1) {
    let m = this.H;
    for (const [a, b] of this.hautDuMur(i)) {
      const s0 = Math.max(a[0], u0), s1 = Math.min(b[0], u1);
      if (s1 < s0) continue;
      for (const s of [s0, s1]) m = Math.min(m, a[1] + (b[1] - a[1]) * (s - a[0]) / Math.max(b[0] - a[0], 1e-12));
    }
    return m;
  }

  /// Haut du mur i le long de sa face intérieure : tronçons droits [abscisse, hauteur].
  hautDuMur(i) {
    const w = this.bord(i);
    if (!w) return [];
    const p = (s) => [w.a[0] + w.t[0] * s, w.a[1] + w.t[1] * s];
    const cassures = [w.debut, w.fin];
    const actifs = this.pans.map((r, k) => (r.actif ? k : -1)).filter((k) => k >= 0);
    for (const k of actifs) {
      for (const [g, c] of this.pans[k].bords) {
        const a0 = g[0] * p(0)[0] + g[1] * p(0)[1] + c, a1 = g[0] * w.t[0] + g[1] * w.t[1];
        if (Math.abs(a1) > 1e-12) cassures.push(-a0 / a1);
      }
    }
    const cand = [null].concat(actifs);
    for (let x = 0; x < cand.length; x++) for (let y = x + 1; y < cand.length; y++) {
      const [g1, c1] = this.lineaire(cand[x]), [g2, c2] = this.lineaire(cand[y]);
      const gg = [g1[0] - g2[0], g1[1] - g2[1]];
      const a0 = gg[0] * p(0)[0] + gg[1] * p(0)[1] + c1 - c2, a1 = gg[0] * w.t[0] + gg[1] * w.t[1];
      if (Math.abs(a1) > 1e-12) cassures.push(-a0 / a1);
    }
    const s = cassures.filter((v) => v >= w.debut - 1e-9 && v <= w.fin + 1e-9).sort((a, b) => a - b);
    const r = [];
    for (let j = 0; j < s.length - 1; j++) {
      if (s[j + 1] - s[j] <= 1e-6) continue;
      const mil = p((s[j] + s[j + 1]) / 2);
      // Un rien côté pièce : la face du mur borde parfois une bande voisine.
      const k = this.hauteur([mil[0] + w.n[0] * 1e-5, mil[1] + w.n[1] * 1e-5])[1];
      const a = [s[j], Math.max(this.z(k, p(s[j])), 0.02)], b = [s[j + 1], Math.max(this.z(k, p(s[j + 1])), 0.02)];
      const last = r[r.length - 1];
      if (last && last[2] === k && Math.abs(last[1][1] - a[1]) < 1e-9) last[1] = b; else r.push([a, b, k]);
    }
    return r.map(([a, b]) => [a, b]);
  }
}

/// Le toit de la pièce dessinée.
export function toit(s) {
  const pl = s.plan;
  if (!pl || pl.coins.length < 3) return null;
  const q = coinsPlan(s), n = q.length, e = EPAISSEUR, H = s.hauteur;
  const pans = [];
  for (let i = 0; i < n; i++) {
    const a = q[i], b = q[(i + 1) % n], v = v2.sub(b, a), len = v2.len(v);
    if (len <= 0.02) continue;
    const t = [v[0] / len, v[1] / len], nIn = [-t[1], t[0]];
    const avantV = v2.sub(a, q[(i + n - 1) % n]), apres = v2.sub(q[(i + 2) % n], b);
    const extA = v2.croix(avantV, t) > 1e-9 ? e : 0, extB = v2.croix(t, apres) > 1e-9 ? e : 0;
    const m = pl.murs[i];
    const actif = m.rampant && m.pied < H - 0.05;
    const tanP = Math.tan(Math.min(Math.max(m.pente, 5), 85) * Math.PI / 180);
    const pied = Math.max(m.pied, 0);
    pans.push(new PanToit({ mur: i, actif, a, t, n: nIn, longueur: len, debut: -extA, fin: len + extB, pied, pente: tanP, avancee: (H - pied) / tanP }));
  }
  const lo = q.reduce((m, x) => v2.min(m, x), [Infinity, Infinity]).map((v) => v - 2);
  const hi = q.reduce((m, x) => v2.max(m, x), [-Infinity, -Infinity]).map((v) => v + 2);
  for (const r of pans) {
    const ua = v2.dot(r.a, r.t), da = v2.dot(r.a, r.n);
    const commun = [[[-r.n[0], -r.n[1]], da - e]];
    const prec = pans.find((x) => x.mur === (r.mur + n - 1) % n), suiv = pans.find((x) => x.mur === (r.mur + 1) % n);
    [[0, prec], [1, suiv]].forEach(([bout, v]) => {
      const saillant = bout === 0 ? r.debut < 0 : r.fin > r.longueur;
      if (saillant) commun.push(bout === 0 ? [[-r.t[0], -r.t[1]], r.debut + ua] : [r.t, -r.fin - ua]);
      else if (v && v.actif) commun.push([[v.g[0] - r.g[0], v.g[1] - r.g[1]], v.c - r.c]);      // noue
      else if (v) commun.push([v.n, -v2.dot(v.a, v.n)]);                                         // retombée
    });
    r.bords = commun;
    let poly = [lo, [hi[0], lo[1]], hi, [lo[0], hi[1]]];
    for (const [g, c] of commun.concat([[r.g, r.c - H]])) poly = couper(poly, g, c);
    r.bandes = aire(poly) > 1e-9 ? [poly] : [];
  }
  return new Toit(pans, H, q);
}

/// Refait le contour, les murs, les rampants et la place des ouvertures d'après le plan.
export function appliquerPlan(s, recadrer = true) {
  const p = s.plan;
  if (!p || p.coins.length < 3) return;
  const n = p.coins.length;
  while (p.murs.length < n) p.murs.push(Object.assign({}, p.murs[p.murs.length - 1] || nouveauMur()));
  if (p.murs.length > n) p.murs.length = n;
  if (aire(p.coins) < 0) {
    const m = p.murs.slice();
    p.coins.reverse();
    p.murs = [...Array(n).keys()].map((j) => m[(2 * n - 2 - j) % n]);
  }
  const e = EPAISSEUR;
  if (recadrer) {
    const lo = p.coins.reduce((m, x) => v2.min(m, x), [Infinity, Infinity]), hi = p.coins.reduce((m, x) => v2.max(m, x), [-Infinity, -Infinity]);
    const nouveau = [e - lo[0], e - lo[1]];
    decaler(s, [nouveau[0] - p.decalage[0], nouveau[1] - p.decalage[1]]);
    p.decalage = nouveau;
    s.longueur = hi[0] - lo[0] + 2 * e;
    s.largeur = hi[1] - lo[1] + 2 * e;
  }
  for (const c of [0, 1, 2, 3]) s.faces[c] = 'rigide';
  const q = coinsPlan(s);
  s.contour = q.map((x) => x.slice());
  s.blocs = s.blocs.filter((b) => b.duPlan == null);
  const H = s.hauteur, t0 = toit(s);
  if (!t0) return;
  const gen = [];
  for (let i = 0; i < n; i++) {
    const a = q[i], len = v2.dist(q[(i + 1) % n], a), pan = t0.bord(i);
    if (len <= 0.02 || !pan) continue;
    const t = pan.t, nIn = pan.n, az = Math.atan2(nIn[1], nIn[0]) * 180 / Math.PI, m = p.murs[i];
    t0.hautDuMur(i).forEach(([d0, d1], k) => {
      const sMil = (d0[0] + d1[0]) / 2;
      const c = [a[0] + t[0] * sMil - nIn[0] * e / 2, a[1] + t[1] * sMil - nIn[1] * e / 2];
      const section = [[d0[0], 0], [d1[0], 0], d1, d0];
      const profil = section.map((x) => [-(x[0] - sMil), x[1] - H / 2]).reverse();
      gen.push(nouveauBloc({ id: idMur(i, k), nom: `Mur ${i + 1}`, forme: 'paroi', x: c[0], y: c[1], z: H / 2, longueur: d1[0] - d0[0],
        profondeur: e, hauteur: H, azimut: az, materiau: m.materiau, profil, dansParoi: true, duPlan: i }));
    });
    const r = t0.pans.find((x) => x.mur === i && x.actif);
    if (r) {
      r.bandes.forEach((bande, k) => {
        const c = [bande.reduce((sm, x) => sm + x[0], 0) / bande.length, bande.reduce((sm, x) => sm + x[1], 0) / bande.length];
        gen.push(nouveauBloc({ id: idRampant(i, k), nom: `Rampant ${i + 1}`, forme: 'toit', x: c[0], y: c[1], z: H / 2, longueur: 0, profondeur: 0,
          hauteur: H, azimut: az, materiau: s.faces[5], profil: bande.map((x) => x.slice()), pente: [r.g[0], r.g[1], r.c, H], duPlan: i }));
      });
    }
  }
  s.blocs = gen.concat(s.blocs);
  // Fenêtres et portes : ancrées à leur mur, dans son épaisseur et sa hauteur réelle.
  const repere = (i) => {
    if (i < 0 || i >= n) return null;
    const a = q[i], v = v2.sub(q[(i + 1) % n], a), len = v2.len(v);
    if (len <= 0.05) return null;
    const t = [v[0] / len, v[1] / len];
    return [a, t, [-t[1], t[0]], len];
  };
  for (const b of s.blocs) {
    if (b.duPlan != null || !(b.forme === 'ouverture' || b.dansParoi === true)) continue;
    let mur, u;
    const an = b.ancrage;
    if (an && an.length === 4 && Math.abs(an[2] - b.x) < 1e-6 && Math.abs(an[3] - b.y) < 1e-6 && repere(an[0])) { mur = an[0]; u = an[1]; }
    else {
      let meilleur = null;
      for (let i = 0; i < n; i++) {
        const rp = repere(i); if (!rp) continue;
        const [a, t, nIn, len] = rp;
        const uu = Math.min(Math.max((b.x - a[0]) * t[0] + (b.y - a[1]) * t[1], 0), len);
        const dist = Math.hypot(b.x - (a[0] + t[0] * uu - nIn[0] * e / 2), b.y - (a[1] + t[1] * uu - nIn[1] * e / 2));
        if (!meilleur || dist < meilleur[2]) meilleur = [i, uu, dist];
      }
      if (!meilleur) continue;
      [mur, u] = meilleur;
    }
    const [a, t, nIn, len] = repere(mur);
    const demi = Math.min(b.longueur / 2, len / 2);
    u = Math.min(Math.max(u, demi), len - demi);
    const pt = [a[0] + t[0] * u - nIn[0] * e / 2, a[1] + t[1] * u - nIn[1] * e / 2];
    b.x = pt[0]; b.y = pt[1];
    b.azimut = Math.atan2(nIn[1], nIn[0]) * 180 / Math.PI;
    b.profondeur = e + 0.03;
    b.longueur = 2 * demi;
    const haut = t0.hautMini(mur, u - demi, u + demi);
    const h = Math.min(b.hauteur, Math.max(haut - 0.1, 0.2));
    b.hauteur = h;
    b.z = Math.max(Math.min(b.z, haut - 0.05 - h / 2), h / 2);
    b.ancrage = [mur, u, pt[0], pt[1]];
    b.dansParoi = true;
  }
  borner(s);
}

/// Volume d'air de la pièce dessinée (échantillons de 10 cm).
export function volumePlan(s) {
  if (!s.plan || !s.contour) return null;
  const pas = 0.1, pans = s.blocs.filter((b) => b.duPlan != null && b.forme === 'toit').map(polyedre);
  let v = 0;
  for (let x = pas / 2; x < s.longueur; x += pas) for (let y = pas / 2; y < s.largeur; y += pas) {
    if (!dansPolygone(x, y, s.contour)) continue;
    for (let z = pas / 2; z < s.hauteur; z += pas) if (!pans.some((p) => p.contient([x, y, z]))) v += pas * pas * pas;
  }
  return v;
}

// MARK: Cotes et aimant

/// Murs vus du dessus : contour intérieur, sinon la boîte.
export function contourMurs(s) {
  if (s.plan) return coinsPlan(s);
  if (s.contour && s.contour.length > 2) return s.contour;
  return [[0, 0], [s.longueur, 0], [s.longueur, s.largeur], [0, s.largeur]];
}

/// Emprise au sol d'un meuble, d'un volume ou d'une enceinte.
export function emprise(s, id) {
  const b = s.blocs.find((x) => x.id === id);
  if (b && b.duPlan == null && b.dansParoi !== true) return polyedre(b).sommets.map((p) => [p[0], p[1]]);
  const e = s.enceintes.find((x) => x.id === id);
  if (e) {
    const a = axe(e);
    const boite = nouveauBloc({ x: e.x - a[0] * e.profondeur / 2, y: e.y - a[1] * e.profondeur / 2, z: e.z,
      longueur: Math.max(e.genre === 'nu' ? e.baffle : e.largeur, 0.05), profondeur: Math.max(e.genre === 'nu' ? 0.02 : e.profondeur, 0.02),
      hauteur: 0.1, azimut: e.azimut });
    return polyedre(boite).sommets.map((p) => [p[0], p[1]]);
  }
  return null;
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function premierMur(murs, depart, dir) {
  let tMin = Infinity;
  for (let i = 0; i < murs.length; i++) {
    const a = murs[i], b = murs[(i + 1) % murs.length], sv = v2.sub(b, a);
    const den = dir[0] * sv[1] - dir[1] * sv[0];
    if (Math.abs(den) <= 1e-12) continue;
    const w = v2.sub(a, depart);
    const t = (w[0] * sv[1] - w[1] * sv[0]) / den, u = (w[0] * dir[1] - w[1] * dir[0]) / den;
    if (t > -1e-9 && u >= -1e-9 && u <= 1 + 1e-9) tMin = Math.min(tMin, Math.max(t, 0));
  }
  return tMin;
}

/// Cotes d'un objet aux murs : du bord de son emprise jusqu'au mur, vers les quatre côtés.
export function cotesAuxMurs(s, pts) {
  const murs = contourMurs(s);
  if (pts.length < 2 || murs.length < 3) return [];
  const centre = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const r = [];
  for (const dir of DIRS) {
    const ext = Math.max(...pts.map((p) => v2.dot(v2.sub(p, centre), dir)));
    const depart = v2.add(centre, v2.mul(dir, ext));
    const t = premierMur(murs, depart, dir);
    if (isFinite(t) && t < 60) r.push([depart, v2.add(depart, v2.mul(dir, t))]);
  }
  return r;
}

/// Cotes à montrer pour l'objet sélectionné (ouverture : distances aux coins de son mur).
export function cotes(s, id) {
  const b = s.blocs.find((x) => x.id === id);
  if (b && b.ancrage && b.ancrage.length === 4) {
    const q = coinsPlan(s), i = b.ancrage[0];
    if (q.length < 3 || i < 0 || i >= q.length) return [];
    const a = q[i], v = v2.sub(q[(i + 1) % q.length], a), len = v2.len(v), nIn = normalePlan(s, i);
    if (!len || !nIn) return [];
    const t = [v[0] / len, v[1] / len], dec = v2.mul(nIn, 0.12);
    const u0 = b.ancrage[1] - b.longueur / 2, u1 = b.ancrage[1] + b.longueur / 2;
    return [[v2.add(a, dec), v2.add(v2.add(a, v2.mul(t, u0)), dec)], [v2.add(v2.add(a, v2.mul(t, u1)), dec), v2.add(v2.add(a, v), dec)]];
  }
  const emp = emprise(s, id);
  return emp ? cotesAuxMurs(s, emp) : [];
}

function jeux(s, pts) {
  const murs = contourMurs(s);
  if (pts.length < 2 || murs.length < 3) return [];
  const centre = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const r = [];
  for (const dir of DIRS) {
    const ext = Math.max(...pts.map((p) => v2.dot(v2.sub(p, centre), dir)));
    let tMin = Infinity;
    for (let i = 0; i < murs.length; i++) {
      const a = murs[i], b = murs[(i + 1) % murs.length], sv = v2.sub(b, a);
      const den = dir[0] * sv[1] - dir[1] * sv[0];
      if (Math.abs(den) <= 1e-12) continue;
      const w = v2.sub(a, centre);
      const t = (w[0] * sv[1] - w[1] * sv[0]) / den, u = (w[0] * dir[1] - w[1] * dir[0]) / den;
      if (t > 1e-9 && u >= -1e-9 && u <= 1 + 1e-9) tMin = Math.min(tMin, t);
    }
    if (isFinite(tMin)) r.push({ jeu: tMin - ext, dir, mur: v2.add(centre, v2.mul(dir, tMin)) });
  }
  return r;
}

/// Aimant : un objet à moins de `prise` d'un mur s'y colle ; un objet qui entre dans un mur en ressort.
export function aimanterObjet(s, id, prise = 0.06) {
  const pts = emprise(s, id);
  if (!pts) return;
  const j = jeux(s, pts);
  const d = [0, 0];
  for (const ax of [[1, 0], [0, 1]]) {
    const cs = j.filter((x) => Math.abs(v2.dot(x.dir, ax)) > 0.5 && x.jeu < prise);
    const neg = cs.filter((x) => x.jeu < 0).sort((a, b) => a.jeu - b.jeu);
    const c = neg[0] || cs.sort((a, b) => a.jeu - b.jeu)[0];
    if (c) { d[0] += c.dir[0] * c.jeu; d[1] += c.dir[1] * c.jeu; }
  }
  if (d[0] === 0 && d[1] === 0) return;
  const b = s.blocs.find((x) => x.id === id);
  if (b) { b.x += d[0]; b.y += d[1]; }
  const e = s.enceintes.find((x) => x.id === id);
  if (e) { e.x += d[0]; e.y += d[1]; }
}

/// Poignées d'étirement du meuble sélectionné : milieu de chaque côté du dessus (n = normale sortante),
/// et le centre du dessus pour la hauteur. Seulement pour un bloc posé (pas une fenêtre ni un mur).
export function poigneesBloc(s, id) {
  const b = s.blocs.find((x) => x.id === id);
  if (!b || b.duPlan != null || b.dansParoi || b.forme !== 'boite') return [];
  const a = b.azimut * Math.PI / 180, av = [Math.cos(a), Math.sin(a)], co = [-Math.sin(a), Math.cos(a)], z = b.z + b.hauteur / 2;
  const pt = (d, k) => [b.x + d[0] * k, b.y + d[1] * k, z];
  return [
    { nom: 'avant', p: pt(av, b.profondeur / 2), n: av },
    { nom: 'arriere', p: pt(av, -b.profondeur / 2), n: [-av[0], -av[1]] },
    { nom: 'gauche', p: pt(co, b.longueur / 2), n: co },
    { nom: 'droite', p: pt(co, -b.longueur / 2), n: [-co[0], -co[1]] },
    { nom: 'haut', p: [b.x, b.y, z], n: null },
  ];
}

/// Enveloppe convexe (chaîne monotone).
function enveloppe(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const bas = [], haut = [];
  for (const q of p) { while (bas.length >= 2 && x(bas[bas.length - 2], bas[bas.length - 1], q) <= 1e-12) bas.pop(); bas.push(q); }
  for (const q of p.reverse()) { while (haut.length >= 2 && x(haut[haut.length - 2], haut[haut.length - 1], q) <= 1e-12) haut.pop(); haut.push(q); }
  return bas.slice(0, -1).concat(haut.slice(0, -1));
}

/// L'emprise tient-elle dans la pièce ? (coins dedans, aucun mur traversé ; toucher un mur est permis)
export function dansLaPiece(s, pts) {
  const murs = contourMurs(s);
  if (pts.length < 3 || murs.length < 3) return true;
  pts = enveloppe(pts);
  const c = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const q = pts.map((p) => { const d = v2.sub(c, p), l = v2.len(d); return l > 0.002 ? v2.add(p, v2.mul(d, 0.0015 / l)) : p; });
  if (!q.every((p) => dansPolygone(p[0], p[1], murs))) return false;
  const coupe = (a, b, p, r) => {
    const o = (u, v, w) => (v[0] - u[0]) * (w[1] - u[1]) - (v[1] - u[1]) * (w[0] - u[0]);
    return o(a, b, p) * o(a, b, r) < 0 && o(p, r, a) * o(p, r, b) < 0;
  };
  for (let i = 0; i < q.length; i++) for (let j = 0; j < murs.length; j++)
    if (coupe(q[i], q[(i + 1) % q.length], murs[j], murs[(j + 1) % murs.length])) return false;
  return true;
}

/// Côtés de l'objet collés à un mur : le tronçon de mur touché.
export function contacts(s, id) {
  const pts = emprise(s, id);
  if (!pts) return [];
  const centre = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const r = [];
  for (const x of jeux(s, pts)) {
    if (Math.abs(x.jeu) >= 0.005) continue;
    const perp = [-x.dir[1], x.dir[0]];
    const proj = pts.map((p) => v2.dot(v2.sub(p, centre), perp));
    r.push([v2.add(x.mur, v2.mul(perp, Math.min(...proj))), v2.add(x.mur, v2.mul(perp, Math.max(...proj)))]);
  }
  return r;
}

export { solides };
