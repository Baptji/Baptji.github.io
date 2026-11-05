/* Export vers un SIG dans le navigateur (B.4) : GeoTIFF géoréférencés (DEFLATE par
 * CompressionStream, prédicteur 3 pour les flottants), CSV des dépressions et archive ZIP.
 * Même contenu que l'export de l'app Mac (Sources/Lecture/ExportSIG.swift). */

const NODATA = -99999;

async function deflater(octets) {
  // « deflate » de CompressionStream = flux zlib, ce qu'attend la compression 8 du TIFF.
  const flux = new Blob([octets]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(flux).arrayBuffer());
}

/** valeurs : Float32Array (NaN → NoData), Int32Array ou Uint8Array. */
export async function geotiff(valeurs, g, { nodata = null, description = null } = {}) {
  const C = g.colonnes, L = g.lignes;
  const flottant = valeurs instanceof Float32Array;
  const ov = valeurs.BYTES_PER_ELEMENT;
  const nd = nodata ?? (flottant ? NODATA : null);
  let brut;
  if (flottant) {
    const f = new Float32Array(valeurs.length);
    for (let i = 0; i < f.length; i++) f[i] = Number.isNaN(valeurs[i]) ? nd : valeurs[i];
    brut = new Uint8Array(f.buffer);
  } else brut = new Uint8Array(valeurs.buffer.slice(valeurs.byteOffset, valeurs.byteOffset + valeurs.byteLength));
  const predicteur = flottant ? 3 : (ov > 1 ? 2 : 1);
  const lignesParBande = Math.max(1, Math.min(L, Math.floor(262144 / Math.max(1, C * ov))));
  const blocs = [];
  for (let l0 = 0; l0 < L; l0 += lignesParBande) {
    const n = Math.min(lignesParBande, L - l0);
    const bande = new Uint8Array(n * C * ov);
    for (let l = 0; l < n; l++) {
      const ligne = brut.subarray((l0 + l) * C * ov, (l0 + l + 1) * C * ov);
      const dest = bande.subarray(l * C * ov, (l + 1) * C * ov);
      if (predicteur === 3) {
        for (let x = 0; x < C; x++) for (let b = 0; b < ov; b++) dest[b * C + x] = ligne[ov * x + (ov - 1 - b)];
        for (let i = dest.length - 1; i > 0; i--) dest[i] = (dest[i] - dest[i - 1]) & 0xFF;
      } else if (predicteur === 2) {
        const v = new DataView(ligne.buffer, ligne.byteOffset, ligne.byteLength), w = new DataView(dest.buffer, dest.byteOffset, dest.byteLength);
        for (let x = C - 1; x >= 0; x--) {
          const a = v.getInt32(4 * x, true), p = x > 0 ? v.getInt32(4 * (x - 1), true) : 0;
          w.setInt32(4 * x, (a - p) | 0, true);
        }
      } else dest.set(ligne);
    }
    blocs.push(await deflater(bande));
  }
  const tags = [
    [256, 4, [C]], [257, 4, [L]], [258, 3, [8 * ov]], [259, 3, [8]], [262, 3, [1]],
    [273, 4, blocs.map(() => 0)], [277, 3, [1]], [278, 4, [lignesParBande]], [279, 4, blocs.map(b => b.length)],
    [284, 3, [1]], [317, 3, [predicteur]], [339, 3, [flottant ? 3 : (ov === 1 ? 1 : 2)]],
    [33550, 12, [g.pas, g.pas, 0]], [33922, 12, [0, 0, 0, g.x0, g.y0, 0]],
  ];
  if (description) tags.push([270, 2, description]);
  const cles = [1, 1, 0, 0, 1024, 0, 1, 1, 1025, 0, 1, 1];
  const epsg = g.epsg || 2154;
  cles.push(3072, 0, 1, epsg);
  cles[3] = (cles.length - 4) / 4;
  tags.push([34735, 3, cles]);
  if (nd !== null) tags.push([42113, 2, String(nd)]);
  tags.sort((a, b) => a[0] - b[0]);
  const enc = new TextEncoder();
  const octetsDe = ([, type, v]) => {
    if (type === 2) { const t = enc.encode(v); const o = new Uint8Array(t.length + 1); o.set(t); return o; }
    const t = { 3: 2, 4: 4, 12: 8 }[type];
    const o = new Uint8Array(v.length * t), d = new DataView(o.buffer);
    v.forEach((x, k) => type === 3 ? d.setUint16(2 * k, x, true) : type === 4 ? d.setUint32(4 * k, x, true) : d.setFloat64(8 * k, x, true));
    return o;
  };
  const tailleIFD = 2 + 12 * tags.length + 4;
  let annexe = 8 + tailleIFD;
  const positions = new Map();
  for (const t of tags) { const n = octetsDe(t).length; if (n > 4) { positions.set(t[0], annexe); annexe += n + (n & 1); } }
  let p = annexe;
  const offsets = blocs.map(b => { const o = p; p += b.length; return o; });
  tags.find(t => t[0] === 273)[2] = offsets;
  const sortie = new Uint8Array(p), d = new DataView(sortie.buffer);
  sortie.set([0x49, 0x49, 42, 0]); d.setUint32(4, 8, true);
  d.setUint16(8, tags.length, true);
  let q = 10;
  for (const t of tags) {
    const o = octetsDe(t);
    d.setUint16(q, t[0], true); d.setUint16(q + 2, t[1], true);
    d.setUint32(q + 4, t[1] === 2 ? o.length : t[2].length, true);
    if (o.length > 4) d.setUint32(q + 8, positions.get(t[0]), true); else sortie.set(o, q + 8);
    q += 12;
  }
  d.setUint32(q, 0, true);
  for (const t of tags) if (positions.has(t[0])) sortie.set(octetsDe(t), positions.get(t[0]));
  for (let k = 0; k < blocs.length; k++) sortie.set(blocs[k], offsets[k]);
  return sortie;
}

/** Les dépressions, au format des tableurs français (« ; » et virgule décimale). */
export function csvDepressions(g, depressions, { coefficient, intensite, profondeurMini }) {
  const n = (v, d) => Number.isFinite(v) ? v.toFixed(d).replace(".", ",") : "";
  const xy = i => i < 0 ? ["", ""] : [n(g.x0 + ((i % g.colonnes) + 0.5) * g.pas, 2), n(g.y0 - (Math.floor(i / g.colonnes) + 0.5) * g.pas, 2)];
  const lignes = ["id;x_centre;y_centre;x_point_bas;y_point_bas;niveau_eau_ngf;profondeur_max_m;surface_m2;volume_m3;"
    + "bassin_versant_m2;debit_bassin_m3s;duree_remplissage_min;x_exutoire;y_exutoire;retenue"];
  for (const d of depressions) {
    const cl = d.sommeLigne / d.cellules, cc = d.sommeColonne / d.cellules;
    const q = Noyau.debit(d.bassin, g.pas, coefficient, intensite);
    lignes.push([d.id, n(g.x0 + (cc + 0.5) * g.pas, 2), n(g.y0 - (cl + 0.5) * g.pas, 2), ...xy(d.cellulePlusProfonde),
      n(d.niveau, 3), n(d.profondeur, 3), n(d.surface, 2), n(d.volume, 3), n(d.bassin * g.pas * g.pas, 1), n(q, 5),
      n(q > 0 ? d.volume / q / 60 : Infinity, 1), ...xy(d.exutoire), d.profondeur >= profondeurMini ? "oui" : "non"].join(";"));
  }
  return lignes.join("\r\n") + "\r\n";
}

// --- ZIP sans compression (les GeoTIFF le sont déjà) ---------------------------------------

const TABLE_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(o) { let c = 0xFFFFFFFF; for (let i = 0; i < o.length; i++) c = TABLE_CRC[(c ^ o[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

/** fichiers : [{ nom, octets: Uint8Array }] → Blob ZIP. */
export function zip(fichiers) {
  const enc = new TextEncoder();
  const parties = [], central = [];
  let position = 0;
  const maintenant = new Date();
  const heure = (maintenant.getHours() << 11) | (maintenant.getMinutes() << 5) | (maintenant.getSeconds() >> 1);
  const date = ((maintenant.getFullYear() - 1980) << 9) | ((maintenant.getMonth() + 1) << 5) | maintenant.getDate();
  for (const f of fichiers) {
    const nom = enc.encode(f.nom), crc = crc32(f.octets), n = f.octets.length;
    const local = new Uint8Array(30 + nom.length), d = new DataView(local.buffer);
    d.setUint32(0, 0x04034b50, true); d.setUint16(4, 20, true); d.setUint16(6, 0x0800, true); d.setUint16(8, 0, true);
    d.setUint16(10, heure, true); d.setUint16(12, date, true); d.setUint32(14, crc, true);
    d.setUint32(18, n, true); d.setUint32(22, n, true); d.setUint16(26, nom.length, true); local.set(nom, 30);
    const c = new Uint8Array(46 + nom.length), e = new DataView(c.buffer);
    e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x0800, true);
    e.setUint16(12, heure, true); e.setUint16(14, date, true); e.setUint32(16, crc, true); e.setUint32(20, n, true);
    e.setUint32(24, n, true); e.setUint16(28, nom.length, true); e.setUint32(42, position, true); c.set(nom, 46);
    parties.push(local, f.octets); central.push(c);
    position += local.length + n;
  }
  const tailleCentral = central.reduce((s, c) => s + c.length, 0);
  const fin = new Uint8Array(22), d = new DataView(fin.buffer);
  d.setUint32(0, 0x06054b50, true); d.setUint16(8, fichiers.length, true); d.setUint16(10, fichiers.length, true);
  d.setUint32(12, tailleCentral, true); d.setUint32(16, position, true);
  return new Blob([...parties, ...central, fin], { type: "application/zip" });
}

export function telecharger(blob, nom) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
