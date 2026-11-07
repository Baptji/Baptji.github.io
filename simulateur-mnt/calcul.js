/* Web Worker du calcul : la page reste réactive pendant le remplissage, les directions, etc.
 * Messages reçus  : { type: "calculer", id, grille, methode, operations, origine }
 *   - grille : { lignes, colonnes, pas, z (Float32Array), x0, y0 } (z transféré)
 *   - methode : { comblement: "wang_liu" | "sink_removal", penteMin, partage }
 *   - operations : remodelage à appliquer à z avant le calcul (sinon [])
 *   - origine : vrai pour calculer aussi l'état initial (comparaison)
 * Messages envoyés : { type: "progres", id, etape, fraction } puis { type: "resultat", id, … }
 *                    ou { type: "erreur", id, message }
 * Pluie de projet (A.2) : { type: "ruisseler", id, idR, defaut, surfaces, pluieMm } sur le dernier calcul
 *   (id) → { type: "ruissellement", id, idR, accC } (aire drainée pondérée par C, en cellules)
 */
importScripts("noyau.js?v=20261107012032");

let courant = 0;
/** Le dernier calcul terminé : de quoi refaire l'accumulation pondérée sans tout recalculer. */
let dernier = null;

self.onmessage = (e) => {
  const m = e.data;
  if (m.type === "annuler") { courant = -1; return; }
  if (m.type === "ruisseler") { ruisseler(m); return; }
  if (m.type !== "calculer") return;
  courant = m.id;
  const id = m.id;
  try {
    const transferts = [];
    const sortie = { type: "resultat", id };
    const suivi = (base, part) => (etape, f) => {
      self.postMessage({ type: "progres", id, etape, fraction: base + part * f });
      return courant === id;
    };
    let g = m.grille;
    if (m.origine) {
      const r0 = Noyau.calculer(g, m.methode, suivi(0, 0.45));
      sortie.reference = resume(r0, transferts, true);
    }
    if (m.operations && m.operations.length) {
      self.postMessage({ type: "progres", id, etape: "Remodelage du terrain", fraction: m.origine ? 0.47 : 0.02 });
      g = Noyau.remodelerTout(g, m.operations);
      sortie.bilan = Noyau.bilanTerrassement(m.grille.z, g.z, g.pas);
      sortie.z = g.z;
      transferts.push(g.z.buffer);
    }
    const r = Noyau.calculer(g, m.methode, suivi(m.origine ? 0.5 : 0.05, m.origine ? 0.5 : 0.95));
    // Les cellules sans donnée sont les mêmes avant et après remodelage : la grille d'origine suffit.
    dernier = { id, g: m.grille, r: { methode: r.methode, surface: r.surface, dir: new Int8Array(r.dir) } };
    sortie.resultat = resume(r, transferts, false);
    self.postMessage(sortie, transferts);
  } catch (err) {
    if (err instanceof Noyau.Annule) self.postMessage({ type: "annule", id });
    else self.postMessage({ type: "erreur", id, message: String(err && err.message || err) });
  }
};

/** Ce qui part vers la page. L'état initial n'a besoin que de l'accumulation, du TWI et des dépressions. */
function resume(r, transferts, reference) {
  const o = { methode: r.methode, acc: r.acc, twi: r.twi, depressions: r.depressions, exutoire: r.exutoire, durees: r.durees };
  transferts.push(r.acc.buffer, r.twi.buffer);
  if (!reference) {
    Object.assign(o, { rempli: r.rempli, dir: r.dir, strahler: r.strahler, tanb: r.tanb, etiquettes: r.etiquettes });
    transferts.push(r.rempli.buffer, r.dir.buffer, r.strahler.buffer, r.tanb.buffer, r.etiquettes.buffer);
  }
  return o;
}

function ruisseler(m) {
  if (!dernier || dernier.id !== m.id) return;
  try {
    const accC = Noyau.ruissellement(dernier.g, dernier.r, m.defaut, m.surfaces, m.pluieMm).accC;
    self.postMessage({ type: "ruissellement", id: m.id, idR: m.idR, accC }, [accC.buffer]);
  } catch (err) {
    self.postMessage({ type: "erreur", id: m.id, message: String(err && err.message || err) });
  }
}
