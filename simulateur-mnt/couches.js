/* Couches affichées sur le terrain (port de Sources/Rendu/Couches.swift) : coloration TWI, pente,
 * écarts après remodelage, et superposition des écoulements, des dépressions et des tracés. */

export class Palette {
  constructor(hex) { this.hex = hex; this.c = hex.map(h => [(h >> 16) & 255, (h >> 8) & 255, h & 255]); }
  couleur(t) {
    const x = Math.min(1, Math.max(0, Number.isNaN(t) ? 0 : t)) * (this.c.length - 1);
    const i = Math.min(this.c.length - 2, Math.floor(x)), f = x - i, a = this.c[i], b = this.c[i + 1];
    return [(a[0] + (b[0] - a[0]) * f) | 0, (a[1] + (b[1] - a[1]) * f) | 0, (a[2] + (b[2] - a[2]) * f) | 0];
  }
  css() { return "linear-gradient(90deg," + this.hex.map(h => "#" + h.toString(16).padStart(6, "0")).join(",") + ")"; }
}

export const PALETTES = {
  ecoulement: new Palette([0x7FD3FF, 0x2E8FE8, 0x1B4FC2, 0x2A1A8C]),
  profondeur: new Palette([0xBDEBF2, 0x66BEDB, 0x2479B5, 0x0F3E7A]),
  twi: new Palette([0xB8875A, 0xE3CF94, 0xC9E0A5, 0x69B8A6, 0x2C7BB6, 0x1A3F8F]),
  pente: new Palette([0xFBF6E3, 0xF6D58E, 0xF08A4B, 0xC8322B, 0x6B1020]),
  altitude: new Palette([0x2F6B3A, 0x7FA960, 0xD8D08F, 0xB9895B, 0x8A5D47, 0xEDE6DF]),
  ecartAltitude: new Palette([0x2166AC, 0x67A9CF, 0xD1E5F0, 0xF7F7F7, 0xFDDBC7, 0xEF8A62, 0xB2182B]),
  ecartDebit: new Palette([0xB35806, 0xF1A340, 0xFEE0B6, 0xF7F7F7, 0xD8DAEB, 0x998EC3, 0x542788]),
  ecartTWI: new Palette([0x8C510A, 0xD8B365, 0xF6E8C3, 0xF5F5F5, 0xC7EAE5, 0x5AB4AC, 0x01665E]),
};

export const PENTE_MAX = 30;

function image(g) { return { largeur: g.colonnes, hauteur: g.lignes, pixels: new Uint8Array(g.colonnes * g.lignes * 4) }; }
function poser(img, i, [r, v, b], a = 255) { const o = 4 * i; img.pixels[o] = r; img.pixels[o + 1] = v; img.pixels[o + 2] = b; img.pixels[o + 3] = a; }

export function centiles(v, a, b) {
  const e = [], pas = Math.max(1, Math.floor(v.length / 200000));
  for (let i = 0; i < v.length; i += pas) if (!Number.isNaN(v[i])) e.push(v[i]);
  if (!e.length) return [0, 1];
  e.sort((x, y) => x - y);
  return [e[Math.floor((e.length - 1) * a)], e[Math.floor((e.length - 1) * b)]];
}

export function twi(r, g) {
  const [bas, haut] = centiles(r.twi, 0.02, 0.98);
  const img = image(g), p = PALETTES.twi;
  for (let i = 0; i < g.z.length; i++) {
    const v = r.twi[i];
    if (!Number.isNaN(v)) poser(img, i, p.couleur((v - bas) / Math.max(1e-6, haut - bas)));
  }
  return { img, bornes: [bas, haut] };
}

export function pente(r, g) {
  const img = image(g), p = PALETTES.pente;
  for (let i = 0; i < g.z.length; i++) {
    const t = r.tanb[i];
    if (!Number.isNaN(t)) poser(img, i, p.couleur(Math.atan(t) * 180 / Math.PI / PENTE_MAX));
  }
  return { img, bornes: [0, PENTE_MAX] };
}

export const ECARTS = {
  altitude: { titre: "Remblai / déblai", palette: PALETTES.ecartAltitude },
  debit: { titre: "Débit", palette: PALETTES.ecartDebit },
  twi: { titre: "TWI", palette: PALETTES.ecartTWI },
};

export function ecart(e, ref, origine, r, g, seuilCellules) {
  const n = g.z.length, d = new Float32Array(n).fill(NaN);
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(g.z[i]) || Number.isNaN(origine.z[i])) continue;
    if (e === "altitude") d[i] = g.z[i] - origine.z[i];
    else if (e === "twi") { if (!Number.isNaN(r.twi[i]) && !Number.isNaN(ref.twi[i])) d[i] = r.twi[i] - ref.twi[i]; }
    else { const a = ref.acc[i], b = r.acc[i]; d[i] = Math.max(a, b) >= seuilCellules ? Math.log10(Math.max(b, 0.5) / Math.max(a, 0.5)) : 0; }
  }
  let m = 0;
  for (let i = 0; i < n; i++) if (!Number.isNaN(d[i])) m = Math.max(m, Math.abs(d[i]));
  if (e === "twi") m = Math.min(m, 5);
  if (e === "debit") m = Math.min(m, 2);
  m = Math.max(m, e === "altitude" ? 0.05 : 0.1);
  const img = image(g), p = ECARTS[e].palette;
  for (let i = 0; i < n; i++) if (!Number.isNaN(d[i])) poser(img, i, p.couleur(0.5 + d[i] / (2 * m)));
  return { img, bornes: [-m, m] };
}

export function epaisseurTrait(g) { return Math.max(0.6, Math.max(g.lignes, g.colonnes) / 1600); }

function peindre(img, l, c, rayon, coul, alpha = 255) {
  const R = Math.floor(rayon), r2 = Math.max(rayon * rayon, 0.25);
  for (let dl = -R; dl <= R; dl++) {
    const ll = l + dl;
    if (ll < 0 || ll >= img.hauteur) continue;
    for (let dc = -R; dc <= R; dc++) {
      if (dl * dl + dc * dc > r2) continue;
      const cc = c + dc;
      if (cc < 0 || cc >= img.largeur) continue;
      poser(img, ll * img.largeur + cc, coul, alpha);
    }
  }
}

/** s : { ecoulements, depressions, seuilDebit, reseau, ordreMini, profondeurMini, depressionChoisie,
 *       coefficient, intensite, trace } → { img, legende } */
export function superposition(r, g, s) {
  const img = image(g), C = g.colonnes, L = g.lignes, n = g.z.length;
  const legende = { debitMax: 0, ordreMax: 0, profondeurMax: 0, depressionsAffichees: 0 };
  const gardees = new Uint8Array(r.depressions.length + 1);
  if (s.depressions) {
    for (const d of r.depressions) if (d.profondeur >= s.profondeurMini) {
      gardees[d.id] = 1; legende.depressionsAffichees++; legende.profondeurMax = Math.max(legende.profondeurMax, d.profondeur);
    }
    const pmax = Math.max(0.05, legende.profondeurMax), p = PALETTES.profondeur;
    for (let i = 0; i < n; i++) {
      const e = r.etiquettes[i];
      if (e > 0 && gardees[e]) poser(img, i, p.couleur(Math.sqrt((r.rempli[i] - g.z[i]) / pmax)), 215);
    }
    if (s.depressionChoisie) {
      const e = s.depressionChoisie, ep = epaisseurTrait(g);
      for (let l = 0; l < L; l++) for (let c = 0; c < C; c++) {
        if (r.etiquettes[l * C + c] !== e) continue;
        let bord = false;
        for (let k = 0; k < 8 && !bord; k++) {
          const ll = l + Noyau.DL[k], cc = c + Noyau.DC[k];
          if (ll < 0 || ll >= L || cc < 0 || cc >= C || r.etiquettes[ll * C + cc] !== e) bord = true;
        }
        if (bord) peindre(img, l, c, ep, [255, 196, 0]);
      }
    }
  }
  const ep = epaisseurTrait(g), p = PALETTES.ecoulement;
  if (s.ecoulements && s.reseau === "strahler") {
    let ordreMax = 0;
    for (let i = 0; i < n; i++) ordreMax = Math.max(ordreMax, r.strahler[i]);
    legende.ordreMax = ordreMax;
    const lit = [];
    for (let i = 0; i < n; i++) if (r.strahler[i] >= s.ordreMini && !gardees[r.etiquettes[i]]) lit.push(i);
    lit.sort((a, b) => r.strahler[a] - r.strahler[b]);
    const etendue = Math.max(1, ordreMax - s.ordreMini);
    for (const i of lit) { const t = (r.strahler[i] - s.ordreMini) / etendue; peindre(img, (i / C) | 0, i % C, ep * (0.55 + 1.6 * t), p.couleur(t)); }
  } else if (s.ecoulements) {
    const unite = Noyau.debit(1, g.pas, s.coefficient, s.intensite);
    let accMax = 1;
    for (let i = 0; i < n; i++) if (r.acc[i] > accMax) accMax = r.acc[i];
    legende.debitMax = accMax * unite;
    const seuil = Math.max(2, s.seuilDebit / Math.max(unite, 1e-30));
    const lit = [];
    for (let i = 0; i < n; i++) if (r.acc[i] >= seuil && !gardees[r.etiquettes[i]]) lit.push(i);
    lit.sort((a, b) => r.acc[a] - r.acc[b]);
    const lmin = Math.log(seuil), lmax = Math.log(Math.max(accMax, seuil + 1));
    for (const i of lit) {
      const t = (Math.log(r.acc[i]) - lmin) / Math.max(1e-9, lmax - lmin);
      peindre(img, (i / C) | 0, i % C, ep * (0.55 + 1.6 * t), p.couleur(t));
    }
  }
  tracer(s.trace, img, g);
  return { img, legende };
}

/** La zone dessinée, les contours des surfaces de ruissellement et les cercles de l'égalisation. */
export function tracer(t, img, g) {
  if (!t || (!t.zone.length && !t.centre && !(t.anneaux && t.anneaux.length) && !(t.site && t.site.length))) return;
  // Assez épais pour rester visible quand tout le MNT est à l'écran.
  const e = Math.max(epaisseurTrait(g) * 0.9, Math.max(g.lignes, g.colonnes) / 500);
  const cel = p => [(g.y0 - p[1]) / g.pas - 0.5, (p[0] - g.x0) / g.pas - 0.5];
  const segment = (a, b, coul) => {
    const [la, ca] = cel(a), [lb, cb] = cel(b);
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(lb - la), Math.abs(cb - ca)) * 2));
    for (let k = 0; k <= n; k++) { const f = k / n; peindre(img, Math.round(la + (lb - la) * f), Math.round(ca + (cb - ca) * f), e, coul); }
  };
  const jaune = [255, 196, 0], blanc = [255, 255, 255];
  // Le site tracé sur la carte : en tirets, comme sur la carte.
  const tiret = Math.max(4, Math.max(g.lignes, g.colonnes) / 90);
  for (const a of t.site || []) {
    let parcouru = 0;
    a.forEach((p, k) => {
      const [la, ca] = cel(a[k === 0 ? a.length - 1 : k - 1]), [lb, cb] = cel(p);
      const long = Math.hypot(lb - la, cb - ca), n = Math.max(1, Math.ceil(long * 2));
      for (let j = 0; j <= n; j++) {
        const f = j / n;
        if ((parcouru + f * long) % (tiret * 1.7) < tiret) peindre(img, Math.round(la + (lb - la) * f), Math.round(ca + (cb - ca) * f), e * 0.8, jaune);
      }
      parcouru += long;
    });
  }
  for (const a of t.anneaux || []) a.forEach((p, k) => segment(a[k === 0 ? a.length - 1 : k - 1], p, jaune));
  t.zone.forEach((p, k) => {
    if (k > 0) segment(t.zone[k - 1], p, jaune);
    const [l, c] = cel(p);
    peindre(img, Math.round(l), Math.round(c), e * 2.2, blanc);
    peindre(img, Math.round(l), Math.round(c), e * 1.4, jaune);
  });
  if (t.zoneFermee && t.zone.length > 2) segment(t.zone[t.zone.length - 1], t.zone[0], jaune);
  if (t.centre) {
    t.rayons.forEach((r, k) => {
      if (r <= 0) return;
      const n = Math.max(24, Math.round(2 * Math.PI * r / g.pas));
      for (let j = 0; j < n; j++) {
        const a1 = 2 * Math.PI * j / n, a2 = 2 * Math.PI * (j + 1) / n;
        segment([t.centre[0] + r * Math.cos(a1), t.centre[1] + r * Math.sin(a1)], [t.centre[0] + r * Math.cos(a2), t.centre[1] + r * Math.sin(a2)], k === 0 ? jaune : blanc);
      }
    });
    const [l, c] = cel(t.centre);
    peindre(img, Math.round(l), Math.round(c), e * 2.2, jaune);
  }
}
