// Meilleure place des sources : toutes les sources actives bougent ensemble (chacune à sa hauteur),
// dans les graves entre 25 et 200 Hz, niveaux lissés au 1/6 d'octave.
//
//  • Micro : la réponse au micro la plus proche de 0 dB, c'est-à-dire de sa propre moyenne (écart
//    type le plus petit). Un seul calcul des ondes, la source placée au micro : par réciprocité, le
//    champ obtenu en chaque point est la réponse au micro d'une source posée là.
//  • Toute la pièce : les niveaux sur une grille de points d'écoute, entre deux hauteurs réglables,
//    les plus proches de leur moyenne commune (écart type sur tous les points et toutes les fréquences).
//    Un calcul (finesse « brouillon ») par emplacement candidat et par source.
//
// Les combinaisons se cherchent par descente coordonnée (une source à la fois) depuis plusieurs
// départs ; les 3 propositions retenues diffèrent d'au moins 50 cm pour une source.

import { etat, notifier } from './etat.js?v=20261024222224';
import { calculer, estimation as estimationOndes } from './ondes.js?v=20261024222224';
import { nouvelleEnceinte, copie, dansSolide, dansContour } from './modele.js?v=20261024222224';
import { emprise, dansLaPiece, contourMurs } from './plan.js?v=20261024222224';
import { amplitude } from './calcul.js?v=20261024222224';
import { v2, aire } from './base.js?v=20261024222224';

const FBAS = 25, FHAUT = 200, ECART_MIN = 0.5;

/// Fenêtres de lissage au 1/6 d'octave : [indice début, indice fin] pour chaque fréquence gardée.
function fenetres(freqs) {
  const W = [];
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    if (f < FBAS || f > FHAUT) continue;
    let a = i, b = i;
    while (a > 0 && Math.abs(Math.log2(freqs[a - 1] / f)) <= 1 / 12) a--;
    while (b < freqs.length - 1 && Math.abs(Math.log2(freqs[b + 1] / f)) <= 1 / 12) b++;
    W.push([a, b]);
  }
  return W;
}
function niveau(energies, [a, b]) {
  let e = 0;
  for (let k = a; k <= b; k++) e += energies[k];
  return 10 * Math.log10(Math.max(e / (b - a + 1), 1e-20));
}

/// Écart type (dB) de la réponse autour de sa moyenne, lissée au 1/6 d'octave entre 25 et 200 Hz.
export function ecart(freqs, energies, W = fenetres(freqs)) {
  if (W.length < 2) return null;
  let m = 0, m2 = 0;
  for (const w of W) { const l = niveau(energies, w); m += l; m2 += l * l; }
  m /= W.length;
  return Math.sqrt(Math.max(m2 / W.length - m * m, 0));
}

/// Emplacements où la source tient dans la pièce (grille de pas `pas`, à sa hauteur actuelle).
function candidats(s, id, pas, loin = null) {
  const sc = copie(s), e = sc.enceintes.find((x) => x.id === id), murs = contourMurs(sc);
  const lo = murs.reduce((m, p) => v2.min(m, p), [Infinity, Infinity]), hi = murs.reduce((m, p) => v2.max(m, p), [-Infinity, -Infinity]);
  const r = [];
  for (let x = lo[0] + pas / 2; x < hi[0]; x += pas) for (let y = lo[1] + pas / 2; y < hi[1]; y += pas) {
    if (sc.contour && !dansContour(sc, x, y)) continue;
    if (dansSolide(sc, [x, y, e.z])) continue;
    if (loin && v2.dist([x, y], loin) < 0.6) continue;
    e.x = x; e.y = y;
    if (dansLaPiece(sc, emprise(sc, id) || [])) r.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
  }
  return r;
}

const sourcesActives = (s) => s.enceintes.filter((e) => e.active);

export const dureeEcoute = () => estimationOndes(etat.scene, 'normal').secondes;
export function dureeSalle() {
  const s = etat.scene, ss = sourcesActives(s);
  const runs = ss.reduce((n, e) => n + pasSalle(s, e.id, ss.length).n + 1, 0);
  return runs * estimationOndes(s, 'brouillon').secondes;
}
function pasSalle(s, id, nSources) {
  const maxi = nSources > 1 ? 12 : 16;
  let pas = Math.max(0.4, Math.sqrt(Math.abs(aire(contourMurs(s))) / maxi)), n = candidats(s, id, pas).length;
  while (n > maxi) { pas *= 1.15; n = candidats(s, id, pas).length; }
  return { pas, n };
}

/// Meilleures combinaisons : places[k] = emplacements de la source k (le n° 0 = sa place actuelle).
/// evaluer(cfg) → score (plus petit = meilleur). Rend jusqu'à 3 combinaisons bien distinctes.
function combinaisons(places, evaluer, n = 3) {
  const K = places.length, trouves = [];
  const pos = (cfg, k) => places[k][cfg[k]];
  const proche = (a, b) => a.every((_, k) => b.some((_, j) => v2.dist(pos(a, k), pos(b, j)) < ECART_MIN));
  const permis = (cfg) => {
    for (let a = 0; a < K; a++) for (let b = a + 1; b < K; b++) if (v2.dist(pos(cfg, a), pos(cfg, b)) < ECART_MIN) return false;
    return !trouves.some((t) => proche(cfg, t.cfg));
  };
  let graine = 12345;
  const hasard = (m) => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine % m; };
  for (let r = 0; r < n; r++) {
    const departs = [];
    const zero = places.map(() => 0);
    if (permis(zero)) departs.push(zero);
    for (let essai = 0, cible = K > 1 ? 10 : 1; departs.length < cible && essai < 400; essai++) {
      const c = places.map((p) => hasard(p.length));
      if (permis(c)) departs.push(c);
    }
    let meilleur = null;
    for (const d of departs) {
      let cfg = d, sc = evaluer(cfg);
      for (let tour = 0, mieux = true; mieux && tour < 6; tour++) {
        mieux = false;
        for (let k = 0; k < K; k++) for (let j = 0; j < places[k].length; j++) {
          if (j === cfg[k]) continue;
          const t = cfg.slice(); t[k] = j;
          if (!permis(t)) continue;
          const v = evaluer(t);
          if (v != null && v < sc - 1e-9) { sc = v; cfg = t; mieux = true; }
        }
      }
      if (sc != null && (!meilleur || sc < meilleur.score)) meilleur = { cfg, score: sc };
    }
    if (!meilleur) break;
    trouves.push(meilleur);
  }
  return trouves;
}

async function avecSuivi(etape, travail) {
  etat.recherche = { progression: 0, etape, annuler: false };
  notifier();
  try { return await travail(etat.recherche); }
  catch (err) { etat.message = err.message || String(err); return null; }
  finally { etat.recherche = null; notifier(); }
}

const enPositions = (ss, places, cfg) => ss.map((e, k) => ({ id: e.id, nom: e.nom, x: places[k][cfg[k]][0], y: places[k][cfg[k]][1], z: e.z }));

/// Places de toutes les sources pour la réponse au micro la plus proche de 0 dB (réciprocité : un seul calcul).
export function chercherEcoute() {
  return avecSuivi('Recherche pour le micro', async (R) => {
    const s = copie(etat.scene), ss = sourcesActives(s), micro = [s.micro[0], s.micro[1], s.ecoute];
    if (!ss.length) return null;
    const c = await calculer(s, nouvelleEnceinte('omni', ...micro), 'normal', 'placement', {
      progres: (p) => { R.progression = p; notifier(); }, annule: () => R.annuler, hauteurApercu: s.ecoute });
    if (!c) return null;
    const freqs = c.freqs, nf = freqs.length, W = fenetres(freqs);
    // H[k][j] : réponse complexe au micro de la source k posée à son emplacement j.
    const places = [], H = [];
    for (const e of ss) {
      const amp = freqs.map((f) => amplitude(e, f)), pk = [], hk = [];
      for (const [x, y] of [[e.x, e.y]].concat(candidats(s, e.id, 0.2, micro))) {
        const pw = c.poids([x, y, e.z]);
        if (!pw) continue;
        const h = new Float64Array(2 * nf);
        for (let i = 0; i < nf; i++) {
          const v = c.valeur(pw, i), a = amp[i];
          h[2 * i] = a.re * v.re - a.im * v.im; h[2 * i + 1] = a.re * v.im + a.im * v.re;
        }
        pk.push([x, y]); hk.push(h);
      }
      places.push(pk); H.push(hk);
    }
    const en = new Float64Array(nf);
    const evaluer = (cfg) => {
      for (let i = 0; i < nf; i++) {
        let re = 0, im = 0;
        for (let k = 0; k < cfg.length; k++) { const h = H[k][cfg[k]]; re += h[2 * i]; im += h[2 * i + 1]; }
        en[i] = re * re + im * im;
      }
      return ecart(freqs, en, W);
    };
    const res = combinaisons(places, evaluer);
    etat.placement = { mode: 'ecoute', resultats: res.map((r) => ({ positions: enPositions(ss, places, r.cfg), ecoute: r.score })),
      actuelle: { ecoute: evaluer(places.map(() => 0)) }, version: Date.now() };
    return etat.placement;
  });
}

/// Places de toutes les sources pour des niveaux les plus proches de leur moyenne dans toute la pièce,
/// entre les hauteurs d'écoute choisies.
export function chercherSalle() {
  return avecSuivi('Recherche pour toute la pièce', async (R) => {
    const s = copie(etat.scene), ss = sourcesActives(s), micro = [s.micro[0], s.micro[1], s.ecoute];
    if (!ss.length) return null;
    const [hb, hh] = etat.hauteursSalle;
    const nh = Math.min(Math.max(Math.round((hh - hb) / 0.2) + 1, hh > hb ? 2 : 1), 6);
    const hauteurs = Array.from({ length: nh }, (_, i) => (nh > 1 ? hb + (hh - hb) * i / (nh - 1) : hb));
    // Points d'écoute : grille de 50 cm, sur chaque hauteur ; le micro en dernier (pour l'afficher seulement).
    const murs = contourMurs(s), lo = murs.reduce((m, p) => v2.min(m, p), [Infinity, Infinity]), hi = murs.reduce((m, p) => v2.max(m, p), [-Infinity, -Infinity]);
    const points = [];
    for (let x = lo[0] + 0.25; x < hi[0]; x += 0.5) for (let y = lo[1] + 0.25; y < hi[1]; y += 0.5) for (const z of hauteurs) {
      if ((!s.contour || dansContour(s, x, y)) && !dansSolide(s, [x, y, z])) points.push([x, y, z]);
    }
    points.push(micro);
    const P = points.length;
    const places = ss.map((e) => [[e.x, e.y]].concat(candidats(s, e.id, pasSalle(s, e.id, ss.length).pas)));
    const total = places.reduce((n, p) => n + p.length, 0);
    // G[k][j] : réponses complexes en tous les points de la source k à son emplacement j.
    let freqs = null, nf = 0, fait = 0;
    const G = [];
    for (let k = 0; k < ss.length; k++) {
      const gk = [];
      for (let j = 0; j < places[k].length; j++) {
        R.etape = `Recherche pour toute la pièce : calcul ${fait + 1}/${total}`;
        const ek = Object.assign(copie(ss[k]), { x: places[k][j][0], y: places[k][j][1] });
        const c = await calculer(s, ek, 'brouillon', 'placement-salle', {
          progres: (p) => { R.progression = (fait + p) / total; notifier(); }, annule: () => R.annuler, hauteurApercu: (hb + hh) / 2 });
        if (!c) return null;
        if (!freqs) { freqs = c.freqs; nf = freqs.length; }
        const amp = freqs.map((f) => amplitude(ek, f)), g = new Float32Array(P * nf * 2).fill(NaN);
        points.forEach((p, n) => {
          const pw = c.poids(p);
          if (!pw) return;
          for (let i = 0; i < nf; i++) {
            const v = c.valeur(pw, i), a = amp[i], o = (n * nf + i) * 2;
            g[o] = a.re * v.re - a.im * v.im; g[o + 1] = a.re * v.im + a.im * v.re;
          }
        });
        gk.push(g); fait++;
      }
      G.push(gk);
    }
    const W = fenetres(freqs), en = new Float64Array(nf);
    const reponse = (cfg, n) => {
      for (let i = 0; i < nf; i++) {
        let re = 0, im = 0;
        for (let k = 0; k < cfg.length; k++) { const o = (n * nf + i) * 2, g = G[k][cfg[k]]; re += g[o]; im += g[o + 1]; }
        en[i] = re * re + im * im;
      }
      return !Number.isNaN(en[0]);
    };
    // Écart type de tous les niveaux (points × fréquences) autour de leur moyenne commune ;
    // les points à moins de 50 cm d'une source sont laissés de côté.
    const evaluer = (cfg) => {
      let m = 0, m2 = 0, nb = 0;
      for (let n = 0; n < P - 1; n++) {
        const p = points[n];
        if (cfg.some((j, k) => v2.dist(p, places[k][j]) < 0.5)) continue;
        if (!reponse(cfg, n)) continue;
        for (const w of W) { const l = niveau(en, w); m += l; m2 += l * l; nb++; }
      }
      if (!nb) return null;
      m /= nb;
      return Math.sqrt(Math.max(m2 / nb - m * m, 0));
    };
    const auMicro = (cfg) => (reponse(cfg, P - 1) ? ecart(freqs, en, W) : null);
    const res = combinaisons(places, evaluer);
    const zero = places.map(() => 0);
    etat.placement = { mode: 'salle', hauteurs: [hb, hh], resultats: res.map((r) => ({ positions: enPositions(ss, places, r.cfg), salle: r.score, ecoute: auMicro(r.cfg) })),
      actuelle: { salle: evaluer(zero), ecoute: auMicro(zero) }, version: Date.now() };
    return etat.placement;
  });
}

export function arreterRecherche() { if (etat.recherche) etat.recherche.annuler = true; }
