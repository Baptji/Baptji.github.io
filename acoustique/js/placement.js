// Meilleure place d'une source : celle qui donne la réponse la plus régulière (la plus « fiable »)
// dans les graves, entre 25 et 200 Hz, lissée au 1/6 d'octave.
//
//  • Point d'écoute : un seul calcul des ondes, la source placée au micro. Par réciprocité, le champ
//    obtenu en chaque point est la réponse au micro d'une source posée là : on lit tous les
//    emplacements candidats d'un coup.
//  • Toute la pièce : un calcul (finesse « brouillon ») par emplacement candidat, et l'écart moyen
//    des réponses sur une grille de points d'écoute couvrant la pièce.

import { etat, notifier, aJour } from './etat.js';
import { calculer, estimation as estimationOndes } from './ondes.js';
import { nouvelleEnceinte, copie, dansSolide, dansContour } from './modele.js';
import { emprise, dansLaPiece, contourMurs } from './plan.js';
import { amplitude } from './calcul.js';
import { cxAdd, cxMul, norme2, v2, aire } from './base.js';

const FBAS = 25, FHAUT = 200;

/// Écart type (dB) de la réponse autour de sa moyenne, lissée au 1/6 d'octave entre 25 et 200 Hz.
export function ecart(freqs, energies) {
  const niveaux = [];
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    if (f < FBAS || f > FHAUT) continue;
    let e = 0, n = 0;
    for (let k = 0; k < freqs.length; k++) if (Math.abs(Math.log2(freqs[k] / f)) <= 1 / 12) { e += energies[k]; n++; }
    niveaux.push(10 * Math.log10(Math.max(e / n, 1e-20)));
  }
  if (niveaux.length < 2) return null;
  const m = niveaux.reduce((a, b) => a + b, 0) / niveaux.length;
  return Math.sqrt(niveaux.reduce((a, b) => a + (b - m) * (b - m), 0) / niveaux.length);
}

/// Emplacements où la source tient dans la pièce (grille de pas `pas`, à la hauteur actuelle).
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

/// Garde les meilleurs emplacements distants d'au moins `d` m entre eux.
function espaces(liste, d, n) {
  const r = [];
  for (const c of liste) { if (r.every((x) => v2.dist([x.x, x.y], [c.x, c.y]) >= d)) r.push(c); if (r.length >= n) break; }
  return r;
}

/// Contribution des autres sources (graves déjà calculés) en un point, fréquence par fréquence.
function autresEn(s, id, p, freqs) {
  const z = freqs.map(() => ({ re: 0, im: 0 }));
  for (const o of s.enceintes) {
    if (o.id === id || !o.active || !aJour(o)) continue;
    const c = etat.champs.get(o.id), pw = c && c.poids(p);
    if (!pw) continue;
    freqs.forEach((f, i) => { z[i] = cxAdd(z[i], cxMul(amplitude(o, f), c.valeur(pw, c.indice(f)))); });
  }
  return z;
}

export const dureeEcoute = () => estimationOndes(etat.scene, 'normal').secondes;
export function dureeSalle() {
  const s = etat.scene, e = s.enceintes.find((x) => x.id === etat.selection);
  if (!e) return 0;
  return (pasSalle(s, e.id).n + 1) * estimationOndes(s, 'brouillon').secondes;
}
function pasSalle(s, id) {
  let pas = Math.max(0.4, Math.sqrt(Math.abs(aire(contourMurs(s))) / 12)), n = candidats(s, id, pas).length;
  while (n > 16) { pas *= 1.15; n = candidats(s, id, pas).length; }
  return { pas, n };
}

async function avecSuivi(etape, travail) {
  etat.recherche = { progression: 0, etape, annuler: false };
  notifier();
  try { return await travail(etat.recherche); }
  catch (err) { etat.message = err.message || String(err); return null; }
  finally { etat.recherche = null; notifier(); }
}

/// Meilleure place pour le point d'écoute (réciprocité : un seul calcul).
export function chercherEcoute(id) {
  return avecSuivi('Recherche pour le point d’écoute', async (R) => {
    const s = copie(etat.scene), e = s.enceintes.find((x) => x.id === id), micro = [s.micro[0], s.micro[1], s.ecoute];
    const c = await calculer(s, nouvelleEnceinte('omni', ...micro), 'normal', 'placement', {
      progres: (p) => { R.progression = p; notifier(); }, annule: () => R.annuler, hauteurApercu: s.ecoute });
    if (!c) return null;
    const freqs = c.freqs, autres = autresEn(s, id, micro, freqs);
    const evaluer = (x, y) => {
      const pw = c.poids([x, y, e.z]);
      if (!pw) return null;
      return ecart(freqs, freqs.map((f, i) => norme2(cxAdd(cxMul(amplitude(e, f), c.valeur(pw, i)), autres[i]))));
    };
    const liste = candidats(s, id, 0.2, micro).map(([x, y]) => ({ x, y, z: e.z, ecoute: evaluer(x, y) }))
      .filter((r) => r.ecoute != null).sort((a, b) => a.ecoute - b.ecoute);
    etat.placement = { id, nom: e.nom, mode: 'ecoute', resultats: espaces(liste, 0.6, 3), actuelle: { ecoute: evaluer(e.x, e.y) }, version: Date.now() };
    return etat.placement;
  });
}

/// Meilleure place pour toute la pièce (un calcul par emplacement, finesse brouillon).
export function chercherSalle(id) {
  return avecSuivi('Recherche pour toute la pièce', async (R) => {
    const s = copie(etat.scene), e = s.enceintes.find((x) => x.id === id), micro = [s.micro[0], s.micro[1], s.ecoute];
    const { pas } = pasSalle(s, id);
    const places = [[e.x, e.y]].concat(candidats(s, id, pas));
    // Points d'écoute : grille de 50 cm à la hauteur d'écoute.
    const murs = contourMurs(s), lo = murs.reduce((m, p) => v2.min(m, p), [Infinity, Infinity]), hi = murs.reduce((m, p) => v2.max(m, p), [-Infinity, -Infinity]);
    const points = [];
    for (let x = lo[0] + 0.25; x < hi[0]; x += 0.5) for (let y = lo[1] + 0.25; y < hi[1]; y += 0.5) {
      if ((!s.contour || dansContour(s, x, y)) && !dansSolide(s, [x, y, s.ecoute])) points.push([x, y, s.ecoute]);
    }
    const resultats = [];
    for (let k = 0; k < places.length; k++) {
      R.etape = `Recherche pour toute la pièce : emplacement ${k + 1}/${places.length}`;
      const ek = Object.assign(copie(e), { x: places[k][0], y: places[k][1] });
      const c = await calculer(s, ek, 'brouillon', 'placement-salle', {
        progres: (p) => { R.progression = (k + p) / places.length; notifier(); }, annule: () => R.annuler, hauteurApercu: s.ecoute });
      if (!c) return null;
      const freqs = c.freqs;
      // L'amplitude de la source est déjà dans `ek` ; le champ est celui d'une source de niveau unité.
      const reponse = (p) => {
        const pw = c.poids(p);
        if (!pw) return null;
        const autres = autresEn(s, id, p, freqs);
        return ecart(freqs, freqs.map((f, i) => norme2(cxAdd(cxMul(amplitude(ek, f), c.valeur(pw, i)), autres[i]))));
      };
      const ecarts = points.filter((p) => v2.dist([p[0], p[1]], places[k]) >= 0.5).map(reponse).filter((v) => v != null);
      resultats.push({ x: places[k][0], y: places[k][1], z: e.z, salle: ecarts.reduce((a, b) => a + b, 0) / Math.max(ecarts.length, 1), ecoute: reponse(micro) });
    }
    const actuelle = resultats[0];
    const tries = resultats.slice(1).sort((a, b) => a.salle - b.salle);
    etat.placement = { id, nom: e.nom, mode: 'salle', resultats: espaces(tries, 0.5, 3), actuelle: { salle: actuelle.salle, ecoute: actuelle.ecoute }, version: Date.now() };
    return etat.placement;
  });
}

export function arreterRecherche() { if (etat.recherche) etat.recherche.annuler = true; }
