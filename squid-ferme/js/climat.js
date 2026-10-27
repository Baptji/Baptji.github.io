'use strict';
/* Météo jour par jour : SAFRAN-ISBA mesuré du 1er janvier 1959 au dernier jour publié, puis un futur fabriqué.
   Futur : chaque année reprend une année réelle tirée parmi les 30 dernières, décalée de l'écart entre la
   tendance du lieu cette année-là et celle de l'année tirée. Tendance = pente observée depuis 1990, prolongée
   jusqu'en 2150, puis baisse lente. L'ETP gagne 3 % par degré ; la neige fond en pluie quand il fait plus doux. */

const MS_JOUR = 86400000, T0 = Date.UTC(1959, 0, 1);
const ANNEE_MAX = 2150, BAISSE = 0.01;            // °C par an après le maximum

const Climat = {
  donnees: {},
  async charger(id) {
    if (this.donnees[id]) return;
    const meta = REGIONS.find(r => r.id === id);
    const rep = await fetch(`donnees/climat/${id}.bin`);
    if (!rep.ok) throw new Error(`climat de ${meta.nom} introuvable`);
    const tout = new Int16Array(await rep.arrayBuffer()), n = meta.jours;
    this.donnees[id] = { meta, c: [0, 1, 2, 3, 4].map(k => tout.subarray(k * n, (k + 1) * n)) };
  },
  pret(id) { return !!this.donnees[id]; },

  niveau(meta, an) {
    return meta.niveau2025 + meta.pente * (Math.min(an, ANNEE_MAX) - 2025) - Math.max(0, an - ANNEE_MAX) * BAISSE;
  },

  // Météo du jour j (0 = 1er janvier 1959) : { tmin, tmax, pluie, neige, etp, futur }
  jour(id, j) {
    const d = this.donnees[id], meta = d.meta;
    if (j < meta.jours) return this.lire(d, j, 0, false);
    const { an, doy } = dateDe(j);
    const derniere = meta.derniereAnnee;
    const source = derniere - 29 + Math.floor(hasardAnnee(an, meta.id) * 30);
    const decalage = this.niveau(meta, an) - this.niveau(meta, source);
    const js = indexJour(source, Math.min(doy, 364));
    return this.lire(d, js, decalage, true);
  },
  lire(d, j, dec, futur) {
    const c = d.c;
    let tmin = c[0][j] / 10 + dec, tmax = c[1][j] / 10 + dec, pluie = c[2][j] / 10, neige = c[3][j] / 10;
    const etp = Math.max(0, c[4][j] / 10 * (1 + 0.03 * dec));
    if (neige > 0 && (tmin + tmax) / 2 > 1.5) { pluie += neige; neige = 0; }
    return { tmin, tmax, pluie, neige, etp, futur };
  },
};

function dateDe(j) {
  const d = new Date(T0 + j * MS_JOUR);
  const an = d.getUTCFullYear();
  return { an, mois: d.getUTCMonth() + 1, jour: d.getUTCDate(), doy: Math.round((d - Date.UTC(an, 0, 1)) / MS_JOUR) };
}
const indexJour = (an, doy) => Math.round((Date.UTC(an, 0, 1) - T0) / MS_JOUR) + doy;
function hasardAnnee(an, id) {
  let h = an * 2654435761 >>> 0;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}
