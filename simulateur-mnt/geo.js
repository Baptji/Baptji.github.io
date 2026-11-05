/* Lambert-93 et emprises : portage de Sources/Services/Lambert93.swift et Shapefile.swift.
 * Formules de l'IGN (notes ALG0001 à ALG0004), RGF93 et WGS84 confondus (moins d'un mètre). */

const N = 0.7256077650532670, C = 11754255.426096, XS = 700000, YS = 12655612.049876;
const LAMBDA0 = 3 * Math.PI / 180, E = 0.0818191910428158;

export function versL93(lat, lon) {
  const phi = lat * Math.PI / 180, lambda = lon * Math.PI / 180, es = E * Math.sin(phi);
  const latIso = Math.log(Math.tan(Math.PI / 4 + phi / 2) * Math.pow((1 - es) / (1 + es), E / 2));
  const r = C * Math.exp(-N * latIso), gamma = N * (lambda - LAMBDA0);
  return [XS + r * Math.sin(gamma), YS - r * Math.cos(gamma)];
}

export function versGeo(x, y) {
  const dx = x - XS, dy = y - YS, r = Math.hypot(dx, dy), gamma = Math.atan2(dx, -dy);
  const lambda = LAMBDA0 + gamma / N, latIso = -Math.log(Math.abs(r / C)) / N;
  let phi = 2 * Math.atan(Math.exp(latIso)) - Math.PI / 2;
  for (let k = 0; k < 12; k++) {
    const es = E * Math.sin(phi);
    const s = 2 * Math.atan(Math.pow((1 + es) / (1 - es), E / 2) * Math.exp(latIso)) - Math.PI / 2;
    if (Math.abs(s - phi) < 1e-12) { phi = s; break; }
    phi = s;
  }
  return [phi * 180 / Math.PI, lambda * 180 / Math.PI];
}

export const enMetropole = (x, y) => x >= 50000 && x <= 1250000 && y >= 6000000 && y <= 7150000;

/** Rectangle Lambert-93 { xmin, ymin, xmax, ymax }. */
export const rect = (x1, y1, x2, y2) => ({ xmin: Math.min(x1, x2), ymin: Math.min(y1, y2), xmax: Math.max(x1, x2), ymax: Math.max(y1, y2) });
export const agrandi = (r, m) => ({ xmin: r.xmin - m, ymin: r.ymin - m, xmax: r.xmax + m, ymax: r.ymax + m });
export const deGrille = g => ({ xmin: g.x0, ymin: g.y0 - g.lignes * g.pas, xmax: g.x0 + g.colonnes * g.pas, ymax: g.y0 });

/** Le point est-il dans les anneaux (pair-impair) ? */
export function contient(anneaux, x, y) {
  let dedans = false;
  for (const a of anneaux) {
    if (a.length < 3) continue;
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
      if ((a[i][1] > y) !== (a[j][1] > y) && x < (a[j][0] - a[i][0]) * (y - a[i][1]) / (a[j][1] - a[i][1]) + a[i][0]) dedans = !dedans;
    }
  }
  return dedans;
}

/** Polygones d'un .shp (types 5, 15, 25), en Lambert-93 ; WGS84 reconnu aux coordonnées ou au .prj. */
export function lireEmprise(tampon, prj = "") {
  const v = new DataView(tampon);
  if (v.getInt32(0, false) !== 9994) throw new Error("ce fichier n'est pas un shapefile (.shp).");
  const anneaux = [];
  let p = 100;
  while (p + 8 <= tampon.byteLength) {
    const lg = v.getInt32(p + 4, false) * 2, c = p + 8;
    p = c + lg;
    const type = v.getInt32(c, true);
    if (![5, 15, 25].includes(type)) continue;
    const nParts = v.getInt32(c + 36, true), nPts = v.getInt32(c + 40, true);
    const parts = [];
    for (let k = 0; k < nParts; k++) parts.push(v.getInt32(c + 44 + 4 * k, true));
    parts.push(nPts);
    const base = c + 44 + 4 * nParts;
    for (let k = 0; k < nParts; k++) {
      const a = [];
      for (let i = parts[k]; i < parts[k + 1]; i++) a.push([v.getFloat64(base + 16 * i, true), v.getFloat64(base + 16 * i + 8, true)]);
      anneaux.push(a);
    }
  }
  if (!anneaux.length) throw new Error("aucun polygone dans ce shapefile.");
  const [x, y] = anneaux[0][0];
  const geographique = /GEOGCS/i.test(prj) && !/PROJCS/i.test(prj) || (Math.abs(x) <= 180 && Math.abs(y) <= 90);
  if (geographique) {
    for (const a of anneaux) for (const q of a) { const [X, Y] = versL93(q[1], q[0]); q[0] = X; q[1] = Y; }
  } else if (!enMetropole(x, y)) {
    throw new Error("coordonnées hors de la métropole : l'emprise doit être en Lambert-93 (EPSG:2154) ou en degrés (WGS84).");
  }
  let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
  for (const a of anneaux) for (const [X, Y] of a) { xmin = Math.min(xmin, X); xmax = Math.max(xmax, X); ymin = Math.min(ymin, Y); ymax = Math.max(ymax, Y); }
  return { anneaux, boite: { xmin, ymin, xmax, ymax }, systeme: geographique ? "WGS84, converti en Lambert-93" : "Lambert-93" };
}
