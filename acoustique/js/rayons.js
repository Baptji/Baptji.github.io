// Calcul géométrique des aigus : lancer de rayons sur la vraie géométrie, énergie par octave,
// réflexions spéculaires ou diffuses, absorption de l'air ; son direct exact avec l'ombre des volumes.
// Traduction de l'app Mac (Rayons.swift). Tourne dans des travailleurs (Web Workers).

import { v3 } from './base.js?v=20261024222224';
import { alpha, diffusion, estOuvert, solides as solidesScene, ouvertures as ouverturesScene, passage, polyedre, axe, volume } from './modele.js?v=20261024222224';

export const Bandes = {
  /// Centres des tiers d'octave normalisés, 20 Hz → 16 kHz.
  tiers: [20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000],
  bornes: (fc) => [fc / Math.pow(2, 1 / 6), fc * Math.pow(2, 1 / 6)],
  /// Tiers d'octave qui contient f.
  tiersContenant(f) {
    let m = 0;
    this.tiers.forEach((c, i) => { if (Math.abs(Math.log2(f / c)) < Math.abs(Math.log2(f / this.tiers[m]))) m = i; });
    return m;
  },
  /// Pondération A (dB).
  ponderationA(f) {
    const f2 = f * f;
    const ra = Math.pow(12194, 2) * f2 * f2 / ((f2 + Math.pow(20.6, 2)) * Math.sqrt((f2 + Math.pow(107.7, 2)) * (f2 + Math.pow(737.9, 2))) * (f2 + Math.pow(12194, 2)));
    return 20 * Math.log10(ra) + 2.0;
  },
  /// Absorption de l'air (dB/m), 20 °C, 50 % d'humidité.
  air(f) {
    const t = [[63, 0.0001], [125, 0.0004], [250, 0.0011], [500, 0.0019], [1000, 0.0037], [2000, 0.0097], [4000, 0.0328], [8000, 0.117], [16000, 0.40]];
    if (f <= t[0][0]) return t[0][1];
    for (let i = 1; i < t.length; i++) {
      if (f <= t[i][0]) {
        const x = Math.log2(f / t[i - 1][0]) / Math.log2(t[i][0] / t[i - 1][0]);
        return Math.exp(Math.log(t[i - 1][1]) * (1 - x) + Math.log(t[i][1]) * x);
      }
    }
    return t[t.length - 1][1];
  },
};

export const OCTAVES = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const NOMBRE_DE_RAYONS = 12000;

/// Directivité en énergie (1 = source ponctuelle de même niveau dans les graves).
export function directivite(e, f) {
  const fb = 115 / Math.max(e.largeur, 0.05), x = f / fb;
  const melange = x * x / (1 + x * x);
  const t = [[500, 1], [1000, 1], [2000, 2.4], [4000, 4.4], [8000, 5.6], [16000, 7]];
  let n = 1;
  if (f >= t[t.length - 1][0]) n = t[t.length - 1][1];
  else if (f > t[0][0]) {
    for (let i = 1; i < t.length; i++) {
      if (f <= t[i][0]) { const u = Math.log2(f / t[i - 1][0]); n = t[i - 1][1] + (t[i][1] - t[i - 1][1]) * u / Math.log2(t[i][0] / t[i - 1][0]); break; }
    }
  }
  const g = e.genre;
  return (c) => {
    if (g === 'omni' || g === 'caisson') return 1;
    if (g === 'nu') return 4 * c * c;
    const b = (1 + c) / 2;
    const lobe = b > 1e-6 ? Math.exp(2 * n * Math.log(b)) : 0;
    return (1 - melange) + melange * 4 * lobe;
  };
}

/// Point de départ des rayons et du son direct (devant la caisse).
export function origine(e) {
  const o = [e.x, e.y, e.z];
  return e.genre === 'enceinte' || e.genre === 'caisson' ? v3.add(o, v3.mul(axe(e), 0.01)) : o;
}

/// Son direct (énergie relative), 0 si un volume fait écran.
export function direct(sol, e, p, dir, mAir) {
  const o = origine(e), d = v3.sub(p, o);
  const r2 = Math.max(d[0] * d[0] + d[1] * d[1] + d[2] * d[2], 0.0025), r = Math.sqrt(r2);
  for (const v of sol) if (v.coupe(o, p)) return 0;
  const a = axe(e);
  return dir((d[0] * a[0] + d[1] * a[1] + d[2] * a[2]) / r) * Math.exp(-mAir * r) / r2;
}

/// Grille des récepteurs.
export function grilleRayons(s) {
  const pas = Math.max(0.08, Math.cbrt(volume(s) / 200000));
  const n = [Math.max(1, Math.ceil(s.longueur / pas)), Math.max(1, Math.ceil(s.largeur / pas)), Math.max(1, Math.ceil(s.hauteur / pas))];
  return { pas, n };
}

/// Lance les rayons [debut, fin) d'une enceinte ; renvoie l'énergie accumulée (non normalisée) et les cellules pleines.
export function lancerPartie(s, e, debut, fin, nombre = NOMBRE_DE_RAYONS) {
  const dims = [s.longueur, s.largeur, s.hauteur];
  const { pas, n } = grilleRayons(s);
  const nc = n[0] * n[1] * n[2], nb = OCTAVES.length;
  const blocsSol = s.blocs.filter((b) => b.forme !== 'ouverture');
  const sol = blocsSol.map(polyedre);
  const lesOuv = ouverturesScene(s);
  const ouv = lesOuv.map(polyedre), passages = lesOuv.map((b) => passage(b, s));
  const acc = new Float32Array(nc * nb);
  const o = origine(e);
  if (sol.some((v) => v.contient(o))) return acc;
  const dirs = OCTAVES.map((f) => directivite(e, f));
  const mAir = OCTAVES.map((f) => Bandes.air(f) * Math.log(10) / 10);
  const absorbeFaces = s.faces.map((id) => OCTAVES.map((f) => 1 - alpha(id, f)));
  const diffFaces = s.faces.map(diffusion);
  const absorbeVol = blocsSol.map((b) => OCTAVES.map((f) => 1 - alpha(b.materiau, f)));
  const diffVol = blocsSol.map((b) => diffusion(b.materiau));
  const ouvert = s.faces.map(estOuvert);
  const normales = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const angleOr = Math.PI * (3 - Math.sqrt(5));
  const ax = axe(e);
  let graine = (0x9E3779B9 ^ (debut * 2654435761)) >>> 0 || 1;
  const hasard = () => { graine ^= graine << 13; graine >>>= 0; graine ^= graine >>> 17; graine ^= graine << 5; graine >>>= 0; return graine / 4294967296; };
  const E = new Float64Array(nb), Emid = new Float64Array(nb);
  const n0 = n[0], n01 = n[0] * n[1];

  for (let r = debut; r < fin; r++) {
    // Directions de Fibonacci : réparties uniformément sur la sphère.
    const zz = 1 - 2 * (r + 0.5) / nombre, rr = Math.sqrt(1 - zz * zz), ph = angleOr * r;
    let d = [rr * Math.cos(ph), rr * Math.sin(ph), zz];
    const c0 = d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2];
    for (let b = 0; b < nb; b++) E[b] = dirs[b](c0);
    let p = o.slice(), ordre = 0, parcours = 0;
    for (;;) {
      let tMur = Infinity, face = 0;
      for (let a = 0; a < 3; a++) {
        if (d[a] > 1e-12) { const t = (dims[a] - p[a]) / d[a]; if (t < tMur) { tMur = t; face = 2 * a + 1; } }
        else if (d[a] < -1e-12) { const t = -p[a] / d[a]; if (t < tMur) { tMur = t; face = 2 * a; } }
      }
      tMur = Math.max(tMur, 0);
      let t = tMur, vol = -1, nrm = normales[face];
      for (let vi = 0; vi < sol.length; vi++) {
        const h = sol[vi].intersection(p, d, t);
        if (h) { t = h[0]; vol = vi; nrm = h[1]; }
      }
      // Énergie réfléchie le long du segment (le son direct est compté à part).
      if (ordre >= 1 && t > 0) {
        for (let b = 0; b < nb; b++) Emid[b] = E[b] * Math.exp(-mAir[b] * t / 2);
        const cell = [0, 0, 0], step = [0, 0, 0], tMax = [Infinity, Infinity, Infinity], tDelta = [Infinity, Infinity, Infinity];
        for (let a = 0; a < 3; a++) {
          cell[a] = Math.min(Math.max(Math.floor(p[a] / pas), 0), n[a] - 1);
          if (d[a] > 1e-12) { step[a] = 1; tMax[a] = ((cell[a] + 1) * pas - p[a]) / d[a]; tDelta[a] = pas / d[a]; }
          else if (d[a] < -1e-12) { step[a] = -1; tMax[a] = (cell[a] * pas - p[a]) / d[a]; tDelta[a] = -pas / d[a]; }
        }
        let tc = 0;
        while (tc < t) {
          const a = tMax[0] < tMax[1] ? (tMax[0] < tMax[2] ? 0 : 2) : (tMax[1] < tMax[2] ? 1 : 2);
          const tn = Math.min(tMax[a], t), l = tn - tc;
          const base = (cell[2] * n01 + cell[1] * n0 + cell[0]) * nb;
          for (let b = 0; b < nb; b++) acc[base + b] += l * Emid[b];
          tc = tn;
          cell[a] += step[a];
          if (cell[a] < 0 || cell[a] >= n[a]) break;
          tMax[a] += tDelta[a];
        }
      }
      parcours += t;
      for (let b = 0; b < nb; b++) E[b] *= Math.exp(-mAir[b] * t);
      const h = [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
      let diff = 0;
      if (vol < 0) {
        if (ouvert[face] || ouv.some((v) => v.contient(h, 0.02))) break;
        for (let b = 0; b < nb; b++) E[b] *= absorbeFaces[face][b];
        diff = diffFaces[face];
      } else {
        const k = ouv.findIndex((v) => v.contient(h, 0.02));
        if (k >= 0) {
          if (!passages[k]) break;
          // Porte intérieure : on traverse l'épaisseur de la paroi, sans perte.
          let q = v3.add(h, v3.mul(d, 0.02)), garde = 0;
          while (sol.some((v) => v.contient(q)) && garde < 40) { q = v3.add(q, v3.mul(d, 0.02)); garde++; }
          p = q; parcours += 0.02 * (garde + 1);
          continue;
        }
        for (let b = 0; b < nb; b++) E[b] *= absorbeVol[vol][b];
        diff = diffVol[vol];
      }
      ordre++;
      let emax = 0;
      for (let b = 0; b < nb; b++) emax = Math.max(emax, E[b]);
      if (emax < 1e-4 || parcours > 500 || ordre > 400) break;
      if (hasard() < diff) {
        // Réflexion diffuse (loi de Lambert autour de la normale).
        const u1 = hasard(), u2 = hasard(), rt = Math.sqrt(u1), phi = 2 * Math.PI * u2;
        const tA = Math.abs(nrm[0]) < 0.9 ? v3.norm(v3.cross(nrm, [1, 0, 0])) : v3.norm(v3.cross(nrm, [0, 1, 0]));
        const tB = v3.cross(nrm, tA);
        d = v3.norm(v3.add(v3.add(v3.mul(tA, rt * Math.cos(phi)), v3.mul(tB, rt * Math.sin(phi))), v3.mul(nrm, Math.sqrt(1 - u1))));
      } else {
        const k2 = 2 * v3.dot(d, nrm);
        d = [d[0] - nrm[0] * k2, d[1] - nrm[1] * k2, d[2] - nrm[2] * k2];
      }
      p = [h[0] + nrm[0] * 1e-6, h[1] + nrm[1] * 1e-6, h[2] + nrm[2] * 1e-6];
      for (let a = 0; a < 3; a++) p[a] = Math.min(Math.max(p[a], 1e-9), dims[a] - 1e-9);
    }
  }
  return acc;
}

/// Cellules pleines de la grille des récepteurs.
export function cellulesPleines(s) {
  const { pas, n } = grilleRayons(s);
  const sol = solidesScene(s);
  const plein = new Uint8Array(n[0] * n[1] * n[2]);
  for (let k = 0; k < n[2]; k++) for (let j = 0; j < n[1]; j++) for (let i = 0; i < n[0]; i++) {
    const c = [(i + 0.5) * pas, (j + 0.5) * pas, (k + 0.5) * pas];
    if (sol.some((v) => v.contient(c))) plein[(k * n[1] + j) * n[0] + i] = 1;
  }
  return plein;
}

/// Somme des parties, normalisation (4π / N / volume de cellule) et lissage gaussien (σ ≈ 1,6 cellule).
export function terminer(parties, s, nombre = NOMBRE_DE_RAYONS) {
  const { pas, n } = grilleRayons(s);
  const nb = OCTAVES.length, nc = n[0] * n[1] * n[2];
  const solide = cellulesPleines(s);
  let brut = new Float32Array(nc * nb);
  for (const pa of parties) for (let k = 0; k < brut.length; k++) brut[k] += pa[k];
  const facteur = 4 * Math.PI / Math.max(nombre, 1) / (pas * pas * pas);
  for (let k = 0; k < brut.length; k++) brut[k] *= facteur;
  let masque = new Float32Array(nc);
  for (let id = 0; id < nc; id++) {
    if (solide[id]) { for (let b = 0; b < nb; b++) brut[id * nb + b] = 0; } else masque[id] = 1;
  }
  const R = 3, sigma = 1.6, w = [];
  for (let o = -R; o <= R; o++) w.push(Math.exp(-o * o / (2 * sigma * sigma)));
  const pasAxe = [1, n[0], n[0] * n[1]];
  for (let a = 0; a < 3; a++) {
    const b2 = new Float32Array(nc * nb), m2 = new Float32Array(nc);
    const st = pasAxe[a], na = n[a];
    for (let id = 0; id < nc; id++) {
      const c = Math.floor(id / st) % na;
      let sm = 0;
      for (let o = -R; o <= R; o++) {
        const cc = c + o;
        if (cc < 0 || cc >= na) continue;
        const v = id + o * st, wo = w[o + R];
        sm += wo * masque[v];
        const bv = v * nb, bi = id * nb;
        for (let b = 0; b < nb; b++) b2[bi + b] += wo * brut[bv + b];
      }
      m2[id] = sm;
    }
    brut = b2; masque = m2;
  }
  const lisse = new Float32Array(nc * nb);
  for (let id = 0; id < nc; id++) {
    if (solide[id] || masque[id] <= 1e-6) continue;
    for (let b = 0; b < nb; b++) lisse[id * nb + b] = brut[id * nb + b] / masque[id];
  }
  return { pas, n, reflechi: lisse, solide };
}

/// Énergie réfléchie en p à la fréquence f (interpolée dans l'espace et entre octaves).
export function energie(c, p, f) {
  if (!c) return 0;
  const nb = OCTAVES.length, n = c.n, pas = c.pas;
  const x = Math.log2(Math.max(f, OCTAVES[0]) / OCTAVES[0]);
  const b0 = Math.min(Math.floor(x), nb - 1), b1 = Math.min(b0 + 1, nb - 1), tb = Math.min(Math.max(x - b0, 0), 1);
  let e0 = 0, e1 = 0, wt = 0;
  const i0 = [0, 0, 0], t = [0, 0, 0];
  for (let a = 0; a < 3; a++) {
    const v = Math.min(Math.max(p[a] / pas - 0.5, 0), n[a] - 1);
    i0[a] = Math.min(Math.floor(v), Math.max(n[a] - 2, 0)); t[a] = n[a] > 1 ? v - i0[a] : 0;
  }
  for (let cc = 0; cc < 2; cc++) for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) {
    const ia = Math.min(i0[0] + a, n[0] - 1), ib = Math.min(i0[1] + b, n[1] - 1), ic = Math.min(i0[2] + cc, n[2] - 1);
    const id = (ic * n[1] + ib) * n[0] + ia;
    if (c.solide[id]) continue;
    const w = (a === 0 ? 1 - t[0] : t[0]) * (b === 0 ? 1 - t[1] : t[1]) * (cc === 0 ? 1 - t[2] : t[2]);
    e0 += w * c.reflechi[id * nb + b0]; e1 += w * c.reflechi[id * nb + b1]; wt += w;
  }
  if (wt <= 1e-9) return 0;
  e0 /= wt; e1 /= wt;
  if (e0 > 0 && e1 > 0) return Math.exp(Math.log(e0) * (1 - tb) + Math.log(e1) * tb);
  return e0 * (1 - tb) + e1 * tb;
}
