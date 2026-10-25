// Combinaison des enceintes : niveau, délai, polarité et filtre s'appliquent après coup (aucun
// nouveau calcul). Ondes sous la limite de la grille, rayons au-dessus. Traduction de Champ.swift.

import { cxAdd, cxMul, cxPhase, cxScal, cxDiv, norme2, v3 } from './base.js?v=20261025135051';
import { cleGeometrie, cleRayons, solides, dansContour } from './modele.js?v=20261025135051';
import { Bandes, directivite, direct, energie, NOMBRE_DE_RAYONS } from './rayons.js?v=20261025135051';
import { frequences } from './ondes.js?v=20261025135051';

// MARK: Filtres et amplitude

/// Filtre de Linkwitz-Riley 4ᵉ ordre (24 dB/oct), réponse complexe.
export function filtre(e, f) {
  if (e.filtre === 'aucun') return { re: 1, im: 0 };
  const s = { re: 0, im: f / Math.max(e.coupure, 1) };
  const den = cxAdd(cxAdd(cxMul(s, s), cxScal(s, Math.SQRT2)), { re: 1, im: 0 });
  const b2 = e.filtre === 'passeBas' ? cxDiv({ re: 1, im: 0 }, den) : cxDiv(cxMul(s, s), den);
  return cxMul(b2, b2);
}

/// Ce qui multiplie la réponse propre d'une enceinte : niveau, filtre, polarité, délai.
export function amplitude(e, f) {
  const g = Math.pow(10, e.niveau / 20) * (e.inverse ? -1 : 1);
  return cxScal(cxMul(filtre(e, f), cxPhase(-2 * Math.PI * f * e.delai / 1000)), g);
}

export const sources = (E) => E.scene.enceintes.filter((e) => e.active && (E.solo == null || E.solo === e.id));

/// Jusqu'où toutes les sources affichées ont un calcul ondulatoire.
export function fmaxOndes(E) {
  const s = sources(E);
  if (!s.length) return 0;
  return Math.min(...s.map((e) => (E.champs.get(e.id) ? E.champs.get(e.id).fmax : 0)));
}

// MARK: Rayons (travailleurs en parallèle, avec cache)

const travailleurs = [];
let suivant = 0;
const attente = new Map();
function pool() {
  if (!travailleurs.length) {
    const n = Math.max(1, Math.min((navigator.hardwareConcurrency || 4) - 1, 6));
    for (let i = 0; i < n; i++) {
      const w = new Worker(new URL('./travailleur.js?v=20261025135051', import.meta.url), { type: 'module' });
      w.onmessage = (ev) => { const r = attente.get(ev.data.id); attente.delete(ev.data.id); if (r) r(ev.data); };
      travailleurs.push(w);
    }
  }
  return travailleurs;
}
function envoyer(w, msg, transfert) {
  const id = ++suivant;
  return new Promise((ok) => { attente.set(id, ok); w.postMessage(Object.assign({ id }, msg), transfert || []); });
}

const cache = new Map();
export const cleRayonsSource = (s, e) => cleGeometrie(e) + '#' + cleRayons(s);
export const rayonsDeja = (s, e) => { const c = cache.get(cleRayonsSource(s, e)); return c && !(c instanceof Promise) ? c : null; };

/// Champ réfléchi d'une enceinte (calculé une fois par géométrie).
export function rayonsPour(s, e) {
  const cle = cleRayonsSource(s, e);
  if (cache.has(cle)) return Promise.resolve(cache.get(cle));
  const ws = pool();
  const scene = JSON.parse(JSON.stringify(s)), enceinte = JSON.parse(JSON.stringify(e));
  const part = Math.ceil(NOMBRE_DE_RAYONS / ws.length);
  const p = Promise.all(ws.map((w, i) => envoyer(w, { type: 'partie', scene, enceinte, debut: i * part, fin: Math.min(NOMBRE_DE_RAYONS, (i + 1) * part) })))
    .then((rs) => envoyer(ws[0], { type: 'terminer', parties: rs.map((r) => r.acc), scene }, rs.map((r) => r.acc.buffer)))
    .then((r) => { if (cache.size > 24) cache.clear(); cache.set(cle, r.champ); return r.champ; });
  cache.set(cle, p);
  return p;
}

// MARK: Carte

/// Axe et sens de la coupe : orientation 0 = vue depuis le sud (x), 1 = l'est (y), 2 = le nord (−x), 3 = l'ouest (−y).
const axeCoupe = (E) => (E.orientation || 0) % 2;
export function taille(E, maxi) {
  const lm = E.vue === 'plan' || axeCoupe(E) === 0 ? E.scene.longueur : E.scene.largeur, hm = E.vue === 'plan' ? E.scene.largeur : E.scene.hauteur, r = hm / lm;
  const l = r <= 1 ? maxi : Math.max(8, Math.floor(maxi / r)), h = r <= 1 ? Math.max(8, Math.floor(maxi * r)) : maxi;
  return [l, h, lm, hm];
}

function morceauTiers(b, fO, poids) {
  const [lo, hi] = Bandes.bornes(Bandes.tiers[b]);
  if (hi <= fO) {
    const f = frequences(hi).filter((x) => x >= lo);
    if (f.length) return { bande: null, freqs: f, fRayons: 0, poids };
  }
  return { bande: b, freqs: [], fRayons: 0, poids };
}

/// Carte des niveaux (plan à la hauteur d'écoute, ou coupe passant par le micro).
/// champsR : Map id → champ réfléchi (rayons). Renvoie { l, h, largeurM, hauteurM, db, phaseurs, ondes, vue }.
export function raster(E, champsR, maxi = 220, brut = false) {
  const [l, h, lm, hm] = taille(E, maxi);
  const s = E.scene, src = sources(E), fO = fmaxOndes(E);
  const db = new Float32Array(l * h).fill(-Infinity);
  if (!src.length) return { l, h, largeurM: lm, hauteurM: hm, db, phaseurs: null, ondes: false, vue: E.vue };
  let morceaux = [];
  const coherentSeul = E.mode === 'frequence' && E.frequence <= fO;
  if (E.mode === 'frequence') {
    morceaux = coherentSeul ? [{ bande: null, freqs: [E.frequence], fRayons: 0, poids: 1 }]
      : [{ bande: Bandes.tiersContenant(E.frequence), freqs: [], fRayons: E.frequence, poids: 1 }];
  } else if (E.mode === 'bande') {
    morceaux = [morceauTiers(Bandes.tiersContenant(E.frequence), fO, 1)];
  } else {
    const n = Bandes.tiers.length;
    Bandes.tiers.forEach((fc, b) => morceaux.push(morceauTiers(b, fO, (E.ponderationA ? Math.pow(10, Bandes.ponderationA(fc) / 10) : 1) / n)));
  }
  const avecOndes = morceaux.some((m) => m.bande == null);
  const sol = solides(s);
  const fDe = (m) => (m.fRayons > 0 ? m.fRayons : Bandes.tiers[m.bande]);
  const dirs = new Map(), airs = new Map();
  for (const m of morceaux) if (m.bande != null) airs.set(m.bande, Bandes.air(fDe(m)) * Math.log(10) / 10);
  for (const e of src) { const t = new Map(); for (const m of morceaux) if (m.bande != null) t.set(m.bande, directivite(e, fDe(m))); dirs.set(e.id, t); }
  const toutes = morceaux.flatMap((m) => m.freqs);
  const indices = new Map(), amps = new Map();
  for (const e of src) {
    const c = E.champs.get(e.id);
    if (c) indices.set(e.id, toutes.map((f) => c.indice(f)));
    amps.set(e.id, toutes.map((f) => amplitude(e, f)));
  }
  const phaseurs = coherentSeul ? new Float32Array(l * h * 2) : null;
  const ax = axeCoupe(E), retourne = (E.orientation || 0) >= 2;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < l; i++) {
      const u = (i + 0.5) / l * lm, w = retourne ? lm - u : u, zc = (j + 0.5) / h * s.hauteur;
      const p = E.vue === 'plan' ? [u, (j + 0.5) / h * s.largeur, E.z ?? s.ecoute] : (ax === 0 ? [w, s.micro[1], zc] : [s.micro[0], w, zc]);
      let dedans = dansContour(s, p[0], p[1]) && !sol.some((v) => v.contient(p));
      const pw = [];
      if (avecOndes && dedans) {
        for (const e of src) { const c = E.champs.get(e.id), w = c && c.poids(p); if (w) pw.push(w); else { dedans = false; break; } }
      }
      let en = 0, k0 = 0;
      if (dedans) {
        for (const m of morceaux) {
          if (m.bande != null) {
            const f = fDe(m);
            for (const e of src) {
              const dir = direct(sol, e, p, dirs.get(e.id).get(m.bande), airs.get(m.bande));
              const ref = energie(champsR.get(e.id), p, f);
              en += m.poids * norme2(amplitude(e, f)) * (dir + ref);
            }
          } else {
            let acc = 0;
            for (let fi = 0; fi < m.freqs.length; fi++) {
              let z = { re: 0, im: 0 };
              src.forEach((e, si) => { z = cxAdd(z, cxMul(amps.get(e.id)[k0 + fi], E.champs.get(e.id).valeur(pw[si], indices.get(e.id)[k0 + fi]))); });
              acc += norme2(z);
              if (coherentSeul) { phaseurs[2 * (j * l + i)] = z.re; phaseurs[2 * (j * l + i) + 1] = z.im; }
            }
            en += m.poids * acc / Math.max(m.freqs.length, 1);
            k0 += m.freqs.length;
          }
        }
      }
      db[j * l + i] = !dedans ? NaN : (en > 0 ? 10 * Math.log10(en) : -Infinity);
    }
  }
  if (phaseurs && !brut) {
    // Échelle au 95ᵉ centile : le champ proche de l'enceinte n'écrase pas le reste.
    const modules = [];
    for (let k = 0; k < l * h; k++) if (!isNaN(db[k])) modules.push(Math.hypot(phaseurs[2 * k], phaseurs[2 * k + 1]));
    modules.sort((a, b) => a - b);
    const mx = modules.length ? modules[Math.min(modules.length - 1, Math.floor(modules.length * 0.95))] : 0;
    if (mx > 0) for (let k = 0; k < phaseurs.length; k++) phaseurs[k] = Math.min(Math.max(phaseurs[k] / mx, -1.5), 1.5);
  }
  return { l, h, largeurM: lm, hauteurM: hm, db, phaseurs, ondes: avecOndes, vue: E.vue };
}

/// Tout le volume de la pièce, couche horizontale par couche (cellules à peu près cubiques).
/// Renvoie { nx, ny, nz, db, phaseurs } ou null si annule() devient vrai en route.
export async function rasterVolume(E, champsR, annule) {
  const s = E.scene, dx = Math.max(s.longueur, s.largeur, s.hauteur) / 76;
  const nz = Math.min(Math.max(Math.round(s.hauteur / dx), 8), 56);
  let nx = 0, ny = 0, db = null, ph = null;
  for (let k = 0; k < nz; k++) {
    if (k % 6 === 0) await new Promise((ok) => setTimeout(ok, 0));
    if (annule()) return null;
    const r = raster(Object.assign({}, E, { vue: 'plan', z: (k + 0.5) / nz * s.hauteur }), champsR, 76, true);
    if (!db) { nx = r.l; ny = r.h; db = new Float32Array(nx * ny * nz); ph = r.phaseurs ? new Float32Array(nx * ny * nz * 2) : null; }
    db.set(r.db, k * nx * ny);
    if (ph && r.phaseurs) ph.set(r.phaseurs, k * nx * ny * 2);
  }
  if (ph) {
    const modules = [];
    for (let k = 0; k < db.length; k++) if (!isNaN(db[k])) modules.push(Math.hypot(ph[2 * k], ph[2 * k + 1]));
    modules.sort((a, b) => a - b);
    const mx = modules.length ? modules[Math.min(modules.length - 1, Math.floor(modules.length * 0.95))] : 0;
    if (mx > 0) for (let k = 0; k < ph.length; k++) ph[k] = Math.min(Math.max(ph[k] / mx, -1.5), 1.5);
  }
  return { nx, ny, nz, db, phaseurs: ph };
}

/// Minimum et haut d'échelle (98ᵉ centile : le pic collé à l'enceinte n'écrase pas tout).
export function bornes(r) {
  const v = Array.from(r.db).filter((x) => isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return [Infinity, -Infinity];
  return [v[0], v[Math.min(v.length - 1, Math.floor(v.length * 0.98))]];
}

export function valeurRaster(r, x, y) {
  const i = Math.floor(x / r.largeurM * r.l), j = Math.floor(y / r.hauteurM * r.h);
  if (i < 0 || j < 0 || i >= r.l || j >= r.h) return null;
  const v = r.db[j * r.l + i];
  return isFinite(v) ? v : null;
}

// MARK: Courbe au micro

export function courbe(E, p, champsR) {
  const src = sources(E);
  if (!src.length) return [];
  const fO = fmaxOndes(E), r = [];
  if (fO > 0) {
    const ws = src.map((e) => E.champs.get(e.id) && E.champs.get(e.id).poids(p));
    if (ws.every(Boolean)) {
      for (const f of frequences(fO)) {
        let z = { re: 0, im: 0 };
        src.forEach((e, i) => { const c = E.champs.get(e.id); z = cxAdd(z, cxMul(amplitude(e, f), c.valeur(ws[i], c.indice(f)))); });
        r.push({ f, db: 10 * Math.log10(Math.max(norme2(z), 1e-12)), ondes: true });
      }
    }
  }
  const haut = Bandes.tiers.filter((f) => f > fO * 0.99);
  if (haut.length) {
    const sol = solides(E.scene);
    const en = haut.map(() => 0);
    for (const e of src) {
      const c = champsR.get(e.id);
      haut.forEach((f, bi) => {
        const dir = direct(sol, e, p, directivite(e, f), Bandes.air(f) * Math.log(10) / 10);
        en[bi] += (dir + energie(c, p, f)) * norme2(amplitude(e, f));
      });
    }
    haut.forEach((f, bi) => r.push({ f, db: 10 * Math.log10(Math.max(en[bi], 1e-12)), ondes: false }));
  }
  return r;
}

/// Réponse de chaque enceinte seule au micro, dans les graves.
export function courbesSources(E, p) {
  const src = sources(E), fO = fmaxOndes(E);
  if (src.length < 2 || fO <= 0) return [];
  const freqs = frequences(fO);
  return src.map((e) => {
    const c = E.champs.get(e.id), w = c && c.poids(p);
    if (!w) return null;
    return { id: e.id, nom: e.nom, points: freqs.map((f) => ({ f, db: 10 * Math.log10(Math.max(norme2(cxMul(amplitude(e, f), c.valeur(w, c.indice(f)))), 1e-12)), ondes: true })) };
  }).filter(Boolean);
}

export { v3 };
