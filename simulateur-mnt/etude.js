/* Calques documentaires drapés sur le terrain (portage de Sources/Etude de l'app Mac, sans rapport ni export) :
 * géologie, pédologie (UCS et fiches du Référentiel), courbes de niveau, vues anciennes. */
import { telecharger } from "./carte.js?v=20261106235519";
import { contient } from "./geo.js?v=20261106235519";

const BASE = "https://data.geopf.fr";
export const CALQUES = [
  { cle: "geologie", titre: "Géologie", opacite: 0.75 },
  { cle: "sols", titre: "Pédologie", opacite: 0.75 },
  { cle: "courbes", titre: "Courbes de niveau", opacite: 1 },
  { cle: "historique", titre: "Vues anciennes", opacite: 1 },
];

const fr = (v, d = 0) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const hex = c => "#" + c.toString(16).padStart(6, "0");

/** Une toile calée sur l'étendue Lambert-93 : `cote` pixels pour le plus grand côté. */
function toile(e, cote) {
  const k = cote / Math.max(e.xmax - e.xmin, e.ymax - e.ymin);
  const W = Math.max(2, Math.round((e.xmax - e.xmin) * k)), H = Math.max(2, Math.round((e.ymax - e.ymin) * k));
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  return { canvas, ctx, W, H, k, p: (x, y) => [(x - e.xmin) * k, (e.ymax - y) * k] };
}

function chemin(t, anneaux) {
  const c = t.ctx;
  c.beginPath();
  for (const a of anneaux) {
    if (a.length < 3) continue;
    a.forEach(([x, y], i) => { const [u, v] = t.p(x, y); if (i) c.lineTo(u, v); else c.moveTo(u, v); });
    c.closePath();
  }
}

function etiquette(t, lignes, x, y, taille, gras = false) {
  const c = t.ctx, h = taille * 1.25;
  c.font = `${gras ? "600 " : ""}${taille}px -apple-system, "Segoe UI", system-ui, sans-serif`;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.lineJoin = "round"; c.lineWidth = Math.max(3, taille / 4.5); c.strokeStyle = "rgba(255,255,255,0.92)"; c.fillStyle = "#111";
  lignes.forEach((s, k) => { const yy = y + (k - (lignes.length - 1) / 2) * h; c.strokeText(s, x, yy); c.fillText(s, x, yy); });
}

/** Point d'étiquette : dans le polygone et l'étendue, le plus loin des bords (échantillonnage 24 × 24). */
function pointEtiquette(anneaux, e) {
  let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
  for (const a of anneaux) for (const [x, y] of a) { xmin = Math.min(xmin, x); xmax = Math.max(xmax, x); ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
  xmin = Math.max(xmin, e.xmin); xmax = Math.min(xmax, e.xmax); ymin = Math.max(ymin, e.ymin); ymax = Math.min(ymax, e.ymax);
  if (xmin >= xmax || ymin >= ymax) return null;
  let meilleur = null, dmax = 0;
  for (let j = 0; j < 24; j++) for (let i = 0; i < 24; i++) {
    const x = xmin + (i + 0.5) / 24 * (xmax - xmin), y = ymin + (j + 0.5) / 24 * (ymax - ymin);
    if (!contient(anneaux, x, y)) continue;
    let d = Math.min(x - e.xmin, e.xmax - x, y - e.ymin, e.ymax - y);
    for (const a of anneaux) for (let k = 0, m = a.length - 1; k < a.length; m = k++) {
      const [ax, ay] = a[m], [bx, by] = a[k], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      const u = l2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)) : 0;
      d = Math.min(d, Math.hypot(x - ax - u * dx, y - ay - u * dy));
      if (d <= dmax) break;
    }
    if (d > dmax) { dmax = d; meilleur = [x, y]; }
  }
  return meilleur && { x: meilleur[0], y: meilleur[1], rayon: dmax };
}

async function image(url, signal, ign = false) {
  const blob = ign ? await telecharger(url, signal, "blob") : await (await fetch(url, { signal })).blob();
  return await createImageBitmap(blob);
}

// ---------------------------------------------------------------------------
// Géologie : image de la carte harmonisée à 1/50 000 du BRGM (les polygones viendront avec les tuiles du site)
// ---------------------------------------------------------------------------
async function geologie(e, signal) {
  // Le service ne dessine plus la carte en dessous de 1/10 000 (environ 2,8 m par pixel) : 3 m au plus fin.
  const ech = Math.max(3, Math.max(e.xmax - e.xmin, e.ymax - e.ymin) / 2000);
  const w = Math.max(2, Math.round((e.xmax - e.xmin) / ech)), h = Math.max(2, Math.round((e.ymax - e.ymin) / ech));
  const bbox = [e.xmin, e.ymin, e.xmax, e.ymax].map(v => v.toFixed(3)).join(",");
  const img = await image(`https://geoservices.brgm.fr/geologie?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=SCAN_H_GEOL50&STYLES=`
    + `&CRS=EPSG:2154&BBOX=${bbox}&WIDTH=${w}&HEIGHT=${h}&FORMAT=image/png&TRANSPARENT=TRUE`, signal);
  const t = toile(e, Math.max(w, h));
  t.ctx.imageSmoothingEnabled = false;
  t.ctx.drawImage(img, 0, 0, t.W, t.H);
  const px = t.ctx.getImageData(0, 0, t.W, t.H).data;
  let pleins = 0;
  for (let i = 3; i < px.length; i += 16) if (px[i] > 0) pleins++;
  if (pleins < px.length / 16 * 0.02) throw new Error("La carte géologique harmonisée du BRGM ne couvre pas cette zone.");
  return { canvas: t.canvas, legende: [], source: "BRGM, carte géologique harmonisée à 1/50 000 (image du service en ligne)" };
}

// ---------------------------------------------------------------------------
// Pédologie : UCS du WFS de la Géoplateforme, composition lue dans les fiches PDF (Themes.swift, C.3)
// ---------------------------------------------------------------------------
const TYPES = {
  ANTHROPOSOL: ["Anthroposol", "Anthroposols", 0x8C8C8C], ANDOSOL: ["Andosol", "Andosols", 0x7A4E9E],
  ARENOSOL: ["Arénosol", "Arénosols", 0xF3DE8A], ALOCRISOL: ["Alocrisol", "Alocrisols", 0xF494FB],
  BRUNISOL: ["Brunisol", "Brunisols", 0xBC8230], CALCISOL: ["Calcisol", "Calcisols", 0xFFB62F],
  CALCOSOL: ["Calcosol", "Calcosols", 0xFFFC4E], COLLUVIOSOL: ["Colluviosol", "Colluviosols", 0xB5FC4E],
  DOLOMITOSOL: ["Dolomitosol", "Dolomitosols", 0xD6C2D9], FERSIALSOL: ["Fersialsol", "Fersialsols", 0xC8503C],
  FLUVIOSOL: ["Fluviosol", "Fluviosols", 0x46E7C1], HISTOSOL: ["Histosol", "Histosols", 0x3B2F2F],
  LITHOSOL: ["Lithosol", "Lithosols", 0xE9E9E9], LUVISOL: ["Luvisol", "Luvisols", 0xEFCFAE],
  NEOLUVISOL: ["Néoluvisol", "Néoluvisols", 0xD55214], ORGANOSOL: ["Organosol", "Organosols", 0x5C4A3A],
  PELOSOL: ["Pélosol", "Pélosols", 0x9CB7D6], PEYROSOL: ["Peyrosol", "Peyrosols", 0xA39E8F],
  PLANOSOL: ["Planosol", "Planosols", 0xD4B483], PODZOSOL: ["Podzosol", "Podzosols", 0xC526E8],
  RANKOSOL: ["Rankosol", "Rankosols", 0x8D8D8D], REDOXISOL: ["Redoxisol", "Redoxisols", 0x45C6FD],
  REDUCTISOL: ["Réductisol", "Réductisols", 0x0092FB], REGOSOL: ["Régosol", "Régosols", 0xEEDDDC],
  RENDISOL: ["Rendisol", "Rendisols", 0x8CB36B], RENDOSOL: ["Rendosol", "Rendosols", 0xFFFDB9],
  SODISALISOL: ["Sodisalisol", "Sodisalisols", 0xDDDDEE], THALASSOSOL: ["Thalassosol", "Thalassosols", 0x5A8FB0],
  VERACRISOL: ["Véracrisol", "Véracrisols", 0xB0627A], VERTISOL: ["Vertisol", "Vertisols", 0x8D8F2A],
};
// Composés qui ont leur couleur dans le style QGIS Referentiel_regional_pedo.qml.
const COMPOSES = { "BRUNISOL-REDOXISOL": 0x9F5A3C, "LUVISOL-REDOXISOL": 0xE3B964, "NEOLUVISOL-REDOXISOL": 0xB6423B };
const sansAccent = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

/** Les noms de types au début d'une description : « LUVISOL-REDOXISOL profond… » → « LUVISOL-REDOXISOL ». */
export function cleType(phrase) {
  const mots = sansAccent(phrase.trim()).split(/[^A-Z-]+/).filter(Boolean);
  if (!mots.length) return null;
  const parts = mots[0].split("-").filter(Boolean);
  if (parts.length && parts.every(p => TYPES[p])) return parts.join("-");
  for (const m of mots.slice(0, 6)) if (TYPES[m]) return m;   // anciennes nomenclatures
  return null;
}
const couleurType = cle => hex(COMPOSES[cle] ?? TYPES[cle.split("-")[0]]?.[2] ?? 0xBBBBBB);
export const singulier = cle => cle.split("-").map(p => TYPES[p]?.[0] ?? p).join("-");
const pluriel = cle => cle.split("-").map(p => TYPES[p]?.[1] ?? p).join("-");

/** Composition d'une UCS lue dans le texte de sa fiche : parts additionnées par type de sol. */
export function analyserFiche(t) {
  const types = {};
  for (const b of t.split(/UTS\s*n°/).slice(1)) {
    const numero = (b.match(/^\s*(\d+)/) || [])[1];
    const r = b.match(/Type\s+de\s+sol\s*:\s*([\s\S]{0,80})/);
    if (numero && r) types[numero] = cleType(r[1].replace(/\s+/g, " "));
  }
  const parts = {};
  for (const m of t.matchAll(/n°\s*(\d+)\s*\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\)/g)) parts[m[1]] = parseFloat(m[2].replace(",", "."));
  const cles = Object.keys(types);
  if (!Object.keys(parts).length && cles.length === 1) parts[cles[0]] = 100;   // UCS à un seul sol : pas de diagramme
  const somme = {};
  let inconnu = 0;
  for (const [n, p] of Object.entries(parts)) { const c = types[n]; if (c) somme[c] = (somme[c] || 0) + p; else inconnu += p; }
  return { parType: Object.entries(somme).sort((a, b) => b[1] - a[1]), nonIdentifie: inconnu };
}

let pdfjs = null;
async function textePDF(donnees) {
  if (!pdfjs) {
    const racine = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/";
    pdfjs = await import(racine + "pdf.min.mjs");
    // Le travailleur vient d'un autre domaine : on le lance par un module intermédiaire local (blob).
    const amorce = URL.createObjectURL(new Blob([`import "${racine}pdf.worker.min.mjs";`], { type: "text/javascript" }));
    pdfjs.GlobalWorkerOptions.workerPort = new Worker(amorce, { type: "module" });
  }
  const doc = await pdfjs.getDocument({ data: donnees, isEvalSupported: false }).promise;
  let t = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const c = await (await doc.getPage(p)).getTextContent();
    for (const it of c.items) t += it.str + (it.hasEOL ? "\n" : " ");
    t += "\n";
  }
  doc.destroy();
  return t;
}

const fiches = new Map();
async function composition(id, signal) {
  if (!fiches.has(id)) {
    fiches.set(id, (async () => {
      const r = await fetch(`${BASE}/annexes/ressources/INRA_carte_des_sols/INRA/id_ucs_${id}.pdf`, { signal });
      if (!r.ok) throw new Error("fiche absente");
      return analyserFiche(await textePDF(new Uint8Array(await r.arrayBuffer())));
    })().catch(err => { fiches.delete(id); throw err; }));
  }
  return fiches.get(id);
}

async function sols(e, signal, suivi) {
  const bbox = [e.xmin, e.ymin, e.xmax, e.ymax].map(v => v.toFixed(1)).join(",");
  const r = await fetch(`${BASE}/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=INRA.CARTE.SOLS:geoportail_vf`
    + `&SRSNAME=EPSG:2154&BBOX=${bbox},EPSG:2154&OUTPUTFORMAT=application/json`, { signal });
  if (!r.ok) throw new Error("Le service des sols de la Géoplateforme ne répond pas.");
  const d = await r.json();
  let polys = [];
  for (const f of d.features || []) {
    const g = f.geometry;
    if (!g) continue;
    let anneaux = g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];
    // Ordre des axes : en Lambert-93, X < 1 300 000 et Y > 6 000 000.
    if (anneaux[0]?.[0]?.[0] > 3000000) anneaux = anneaux.map(a => a.map(([x, y]) => [y, x]));
    polys.push({ anneaux, a: f.properties || {} });
  }
  polys = polys.filter(p => touche(p.anneaux, e));
  if (!polys.length) throw new Error("Aucune unité de sol ici : zone non couverte par le Référentiel régional pédologique (zones urbaines, par exemple).");
  const ids = [...new Set(polys.map(p => parseInt(p.a.id_ucs)).filter(Number.isFinite))].sort((a, b) => a - b);
  const compos = {}, sansFiche = [];
  let k = 0;
  for (const id of ids) {
    suivi(`Fiches des sols : ${++k} sur ${ids.length}`);
    try { const c = await composition(id, signal); if (c.parType.length) compos[id] = c; else sansFiche.push(id); }
    catch (err) { if (signal.aborted) throw err; sansFiche.push(id); }
  }
  for (const p of polys) {
    const c = compos[parseInt(p.a.id_ucs)];
    if (c) { p.compo = c; continue; }
    // Repli sans fiche : le seul sol dominant de la couche.
    const nom = cleType(p.a.ger2 || p.a.ger_nom || ""), part = parseFloat(p.a.pourcnt) || 100;
    p.compo = { parType: nom ? [[nom, part]] : [], nonIdentifie: nom ? 0 : 100 };
  }
  return { polys, sansFiche, cache: {} };
}

function touche(anneaux, e) {
  for (const a of anneaux) for (const [x, y] of a) if (x >= e.xmin && x <= e.xmax && y >= e.ymin && y <= e.ymax) return true;
  const w = e.xmax - e.xmin, h = e.ymax - e.ymin;
  return [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]].some(([a, b]) => contient(anneaux, e.xmin + w * a, e.ymin + h * b));
}

/** La carte des sols dans l'un des trois modes d'étiquette : dominant, numéro d'UCS, liste. */
export function dessinerSols(s, e, cote, mode) {
  if (s.cache[mode]) return s.cache[mode];
  const t = toile(e, cote), c = t.ctx;
  for (const p of s.polys) {
    const d = p.compo.parType[0];
    chemin(t, p.anneaux); c.fillStyle = d ? couleurType(d[0]) : "#c8c8c8"; c.globalAlpha = 0.85; c.fill("evenodd");
  }
  c.globalAlpha = 1; c.strokeStyle = "rgba(20,20,20,0.8)"; c.lineWidth = Math.max(1.2, t.W / 900);
  for (const p of s.polys) { chemin(t, p.anneaux); c.stroke(); }
  // Étiquettes, en commençant par les plus grandes unités ; une seule par UCS.
  const taille = Math.max(14, Math.min(t.W, t.H) / 48), posees = [], faites = new Set();
  const aire = p => { let s2 = 0; for (const a of p.anneaux) for (let i = 0, j = a.length - 1; i < a.length; j = i++) s2 += (a[j][0] - a[i][0]) * (a[j][1] + a[i][1]); return Math.abs(s2 / 2); };
  for (const p of [...s.polys].sort((a, b) => aire(b) - aire(a))) {
    const cle = p.a.id_ucs ?? Math.random();
    if (faites.has(cle)) continue;
    let lignes;
    if (mode === "dominant") { const d = p.compo.parType[0]; if (!d) continue; lignes = [`${singulier(d[0])} (${fr(d[1])} %)`]; }
    else if (mode === "numero") lignes = [`UCS ${p.a.no_ucs ? parseInt(p.a.no_ucs) : "?"}`];
    else { lignes = p.compo.parType.slice(0, 6).map(([k, v]) => `${pluriel(k)} ${fr(v)} %`); if (!lignes.length) continue; }
    const pt = pointEtiquette(p.anneaux, e);
    if (!pt) continue;
    c.font = `${taille}px -apple-system, "Segoe UI", system-ui, sans-serif`;
    const larg = Math.max(...lignes.map(l => c.measureText(l).width)), haut = taille * 1.25 * lignes.length;
    const [u, v] = t.p(pt.x, pt.y);
    const z = [u - larg / 2 - 4, v - haut / 2 - 3, u + larg / 2 + 4, v + haut / 2 + 3];
    if (z[0] < 0 || z[2] > t.W || posees.some(q => q[0] < z[2] && z[0] < q[2] && q[1] < z[3] && z[1] < q[3])) continue;
    if (pt.rayon * t.k * 2 < Math.min(larg, haut) * 0.8) continue;
    posees.push(z); faites.add(cle);
    etiquette(t, lignes, u, v, taille);
  }
  return (s.cache[mode] = t.canvas);
}

/** Légende : part de l'étendue par type de sol (surface de l'UCS × part du type dans l'UCS). */
export function legendeSols(s, e) {
  const n = 160, k = n / Math.max(e.xmax - e.xmin, e.ymax - e.ymin);
  const W = Math.max(1, Math.round((e.xmax - e.xmin) * k)), H = Math.max(1, Math.round((e.ymax - e.ymin) * k));
  const comptes = new Array(s.polys.length).fill(0);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = e.xmin + (i + 0.5) / k, y = e.ymax - (j + 0.5) / k;
    const q = s.polys.findIndex(p => contient(p.anneaux, x, y));
    if (q >= 0) comptes[q]++;
  }
  const parts = {};
  let inconnue = 0;
  s.polys.forEach((p, q) => {
    const f = comptes[q] / (W * H);
    for (const [cle, pc] of p.compo.parType) parts[cle] = (parts[cle] || 0) + f * pc / 100;
    inconnue += f * p.compo.nonIdentifie / 100;
  });
  const l = Object.entries(parts).sort((a, b) => b[1] - a[1]).filter(([, v]) => v >= 0.0005)
    .map(([cle, v]) => ({ couleur: couleurType(cle), texte: pluriel(cle), detail: `${fr(v * 100, v < 0.1 ? 1 : 0)} %` }));
  if (inconnue > 0.005) l.push({ couleur: "#c8c8c8", texte: "Type non identifié", detail: `${fr(inconnue * 100)} %` });
  return l;
}

/** L'UCS sous un point (lecture au curseur). */
export function solEn(s, x, y) {
  const p = s?.polys.find(q => contient(q.anneaux, x, y));
  if (!p) return null;
  const d = p.compo.parType;
  return { ucs: p.a.no_ucs ? parseInt(p.a.no_ucs) : null, texte: d.length ? d.slice(0, 3).map(([k, v]) => `${singulier(k)} ${fr(v)} %`).join(", ") : "type non identifié" };
}

// ---------------------------------------------------------------------------
// Courbes de niveau (CartesMNT.swift, C.5) : carrés marchants sur le MNT lissé, cotes sur les maîtresses
// ---------------------------------------------------------------------------
function lisser(g, passes) {
  let z = g.z;
  const L = g.lignes, C = g.colonnes, w = [1, 2, 1];
  for (let n = 0; n < passes; n++) {
    const s = new Float32Array(z);
    for (let l = 0; l < L; l++) for (let c = 0; c < C; c++) {
      const i = l * C + c;
      if (Number.isNaN(z[i])) continue;
      let a = 0, p = 0;
      for (let dl = -1; dl <= 1; dl++) {
        const ll = l + dl;
        if (ll < 0 || ll >= L) continue;
        for (let dc = -1; dc <= 1; dc++) {
          const cc = c + dc;
          if (cc < 0 || cc >= C) continue;
          const v = z[ll * C + cc];
          if (Number.isNaN(v)) continue;
          const q = w[dl + 1] * w[dc + 1]; a += q * v; p += q;
        }
      }
      s[i] = a / p;
    }
    z = s;
  }
  return { ...g, z };
}

/** Courbes tous les `eq` mètres, chaînées en polylignes (les cellules vides les coupent). Coordonnées Lambert-93. */
export function tracerCourbes(g, eq) {
  const L = g.lignes, C = g.colonnes, z = g.z, parNiveau = new Map();
  const arete = (l, c, h) => (l * C + c) * 2 + (h ? 0 : 1);
  for (let l = 0; l < L - 1; l++) for (let c = 0; c < C - 1; c++) {
    const i = l * C + c, v00 = z[i], v01 = z[i + 1], v10 = z[i + C], v11 = z[i + C + 1];
    if (Number.isNaN(v00) || Number.isNaN(v01) || Number.isNaN(v10) || Number.isNaN(v11)) continue;
    const lo = Math.min(v00, v01, v10, v11), hi = Math.max(v00, v01, v10, v11);
    if (lo === hi) continue;
    const x00 = g.x0 + (c + 0.5) * g.pas, y00 = g.y0 - (l + 0.5) * g.pas;
    for (let n = Math.floor(lo / eq) + 1, nMax = Math.floor(hi / eq); n <= nMax; n++) {
      const t = n * eq, ep = v => (v === t ? t + 1e-6 : v);
      const a = ep(v00), b = ep(v01), d = ep(v10), cc = ep(v11);
      const code = (a > t ? 1 : 0) | (b > t ? 2 : 0) | (cc > t ? 4 : 0) | (d > t ? 8 : 0);
      if (code === 0 || code === 15) continue;
      if (!parNiveau.has(n)) parNiveau.set(n, { segs: [], pts: new Map() });
      const N = parNiveau.get(n), f = (u, v) => (t - u) / (v - u);
      const eh = arete(l, c, true), ed = arete(l, c + 1, false), eb = arete(l + 1, c, true), eg = arete(l, c, false);
      const pt = e2 => {
        if (N.pts.has(e2)) return;
        N.pts.set(e2, e2 === eh ? [x00 + f(a, b) * g.pas, y00] : e2 === eb ? [x00 + f(d, cc) * g.pas, y00 - g.pas]
          : e2 === eg ? [x00, y00 - f(a, d) * g.pas] : [x00 + g.pas, y00 - f(b, cc) * g.pas]);
      };
      let segs;
      switch (code) {
        case 1: case 14: segs = [[eg, eh]]; break;
        case 2: case 13: segs = [[eh, ed]]; break;
        case 3: case 12: segs = [[eg, ed]]; break;
        case 4: case 11: segs = [[ed, eb]]; break;
        case 6: case 9: segs = [[eh, eb]]; break;
        case 7: case 8: segs = [[eg, eb]]; break;
        default: { const relies = ((a + b + d + cc) / 4 > t) === (code === 5); segs = relies ? [[eg, eb], [eh, ed]] : [[eg, eh], [ed, eb]]; }
      }
      for (const [u, v] of segs) { pt(u); pt(v); N.segs.push(u, v); }
    }
  }
  const sortie = [];
  for (const [n, { segs, pts }] of parNiveau) {
    const voisins = new Map(), m = segs.length / 2, pris = new Uint8Array(m);
    for (let k = 0; k < m; k++) for (const e2 of [segs[2 * k], segs[2 * k + 1]]) { if (!voisins.has(e2)) voisins.set(e2, []); voisins.get(e2).push(k); }
    for (let debut = 0; debut < m; debut++) {
      if (pris[debut]) continue;
      pris[debut] = 1;
      const chaine = [segs[2 * debut], segs[2 * debut + 1]];
      for (let sens = 0; sens < 2; sens++) {
        for (;;) {
          const bout = sens === 0 ? chaine[chaine.length - 1] : chaine[0];
          const k = (voisins.get(bout) || []).find(q => !pris[q]);
          if (k === undefined) break;
          pris[k] = 1;
          const suivant = segs[2 * k] === bout ? segs[2 * k + 1] : segs[2 * k];
          if (sens === 0) chaine.push(suivant); else chaine.unshift(suivant);
          if (suivant === (sens === 0 ? chaine[0] : chaine[chaine.length - 1])) break;
        }
      }
      sortie.push({ niveau: n * eq, points: chaine.map(e2 => pts.get(e2)) });
    }
  }
  return sortie;
}

function courbes(g, e, cote) {
  let mini = Infinity, maxi = -Infinity;
  for (const v of g.z) if (!Number.isNaN(v)) { if (v < mini) mini = v; if (v > maxi) maxi = v; }
  if (!(maxi > mini)) throw new Error("Pas de relief.");
  let eq = 1;
  const remarques = [];
  while ((maxi - mini) / eq > 120) { eq *= 2.5; if (eq === 2.5) eq = 5; }
  if (eq !== 1) remarques.push(`Équidistance portée à ${fr(eq, eq % 1 ? 1 : 0)} m pour un relief de ${fr(maxi - mini)} m.`);
  const maitresse = eq * 5, estMaitresse = n => { const r = ((n % maitresse) + maitresse) % maitresse; return r < 1e-6 || maitresse - r < 1e-6; };
  const lignes = tracerCourbes(lisser(g, g.pas <= 0.6 ? 3 : g.pas <= 1.2 ? 2 : 1), eq);
  const t = toile(e, cote), c = t.ctx, ep = Math.max(1, t.k * 0.1 + 0.8);
  c.lineJoin = c.lineCap = "round";
  for (const passe of [false, true]) {
    c.strokeStyle = passe ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.8)"; c.lineWidth = passe ? ep * 1.9 : ep;
    c.beginPath();
    for (const l of lignes) {
      if (estMaitresse(l.niveau) !== passe) continue;
      l.points.forEach(([x, y], k) => { const [u, v] = t.p(x, y); if (k) c.lineTo(u, v); else c.moveTo(u, v); });
    }
    c.stroke();
  }
  // Cotes sur les maîtresses, sans chevauchement.
  const taille = Math.max(15, Math.min(t.W, t.H) / 55), posees = [];
  c.font = `600 ${taille}px -apple-system, "Segoe UI", system-ui, sans-serif`;
  c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
  for (const l of lignes) {
    if (!estMaitresse(l.niveau) || l.points.length <= 10) continue;
    const rep = [0];
    for (let k = 1; k < l.points.length; k++) rep.push(rep[k - 1] + Math.hypot(l.points[k][0] - l.points[k - 1][0], l.points[k][1] - l.points[k - 1][1]));
    const long = rep[rep.length - 1], espace = Math.max(120, taille * 9 / t.k);
    if (long <= taille * 4 / t.k) continue;
    for (let cible = long >= espace * 1.5 ? espace / 2 : long / 2; cible < long - taille * 2 / t.k; cible += espace) {
      const k = rep.findIndex(r => r >= cible);
      if (k <= 2 || k >= l.points.length - 3) continue;
      const [ax, ay] = l.points[k - 2], [bx, by] = l.points[k + 2];
      let ang = Math.atan2(by - ay, bx - ax);
      if (ang > Math.PI / 2) ang -= Math.PI; else if (ang < -Math.PI / 2) ang += Math.PI;
      const [u, v] = t.p(l.points[k][0], l.points[k][1]), s = String(Math.round(l.niveau)), w = c.measureText(s).width;
      const z = [u - w * 0.8, v - w * 0.8, u + w * 0.8, v + w * 0.8];
      if (posees.some(q => q[0] < z[2] && z[0] < q[2] && q[1] < z[3] && z[1] < q[3])) continue;
      posees.push(z);
      c.save(); c.translate(u, v); c.rotate(-ang);
      c.lineWidth = Math.max(3, taille / 4); c.strokeStyle = "rgba(255,255,255,0.95)"; c.strokeText(s, 0, 0);
      c.fillStyle = "#000"; c.fillText(s, 0, 0); c.restore();
    }
  }
  const m = v => fr(v, v % 1 ? 1 : 0) + " m";
  return { canvas: t.canvas, remarques, legende: [
    { couleur: "#000", texte: `Courbe tous les ${m(eq)}`, forme: "trait" },
    { couleur: "#000", texte: `Maîtresse tous les ${m(maitresse)}, cote en m NGF`, forme: "trait", epais: true },
  ] };
}

// ---------------------------------------------------------------------------
// Vues anciennes (Historique.swift, C.6) : « Remonter le temps » de l'IGN, sans doublons
// ---------------------------------------------------------------------------
function couchesAnciennes() {
  const l = [
    ["1750–1790", "Carte de Cassini (BnF)", "BNF-IGNF_GEOGRAPHICALGRIDSYSTEMS.CASSINI", "carte", 1750, 1790, 4, 1],
    ["1820–1866", "Carte d'État-Major au 1/40 000", "GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40", "carte", 1820, 1866, 2, 1],
    ["années 1950", "Carte IGN au 1/50 000", "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN50.1950", "carte", 1950, 1959, 2, 1],
    ["1950–1965", "Orthophotographie IGN", "ORTHOIMAGERY.ORTHOPHOTOS.1950-1965", "photo", 1950, 1965, 0.5, 1],
    ["1965–1980", "Orthophotographie IGN", "ORTHOIMAGERY.ORTHOPHOTOS.1965-1980", "photo", 1965, 1980, 0.5, 1],
    ["1980–1995", "Orthophotographie IGN", "ORTHOIMAGERY.ORTHOPHOTOS.1980-1995", "photo", 1980, 1995, 0.5, 1],
    ["2000–2005", "BD ORTHO, mosaïque", "ORTHOIMAGERY.ORTHOPHOTOS2000-2005", "photo", 2000, 2005, 0.5, 1],
    ["2006–2010", "BD ORTHO, mosaïque", "ORTHOIMAGERY.ORTHOPHOTOS2006-2010", "photo", 2006, 2010, 0.5, 1],
    ["2011–2015", "BD ORTHO, mosaïque", "ORTHOIMAGERY.ORTHOPHOTOS2011-2015", "photo", 2011, 2015, 0.5, 1],
    ["2016–2020", "BD ORTHO, mosaïque", "ORTHOIMAGERY.ORTHOPHOTOS2016-2020", "photo", 2016, 2020, 0.5, 1],
  ];
  for (let a = 2001; a <= 2024; a++) l.push([String(a), "BD ORTHO millésime", "ORTHOIMAGERY.ORTHOPHOTOS" + a, "photo", a, a, 0.5, 0]);
  return l.map(([libelle, source, wms, nature, debut, fin, res, priorite]) => ({ libelle, source, wms, nature, debut, fin, res, priorite }));
}

function empreinte(lumi, w, h, n = 48) {
  const e = new Float32Array(n * n);
  for (let j = 0; j < n; j++) {
    const y0 = Math.floor(j * h / n), y1 = Math.max(y0 + 1, Math.floor((j + 1) * h / n));
    for (let i = 0; i < n; i++) {
      const x0 = Math.floor(i * w / n), x1 = Math.max(x0 + 1, Math.floor((i + 1) * w / n));
      let s = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) s += lumi[y * w + x];
      e[j * n + i] = s / ((y1 - y0) * (x1 - x0));
    }
  }
  let m = 0; for (const v of e) m += v; m /= e.length;
  let s2 = 0; for (let k = 0; k < e.length; k++) { e[k] -= m; s2 += e[k] * e[k]; }
  const sd = Math.max(1e-6, Math.sqrt(s2 / e.length));
  for (let k = 0; k < e.length; k++) e[k] /= sd;
  return e;
}
function ecartMoyen(a, b) {
  if (a.length !== b.length) return 1;
  let ma = 0, mb = 0;
  for (let k = 0; k < a.length; k++) { ma += a[k]; mb += b[k]; }
  ma /= a.length; mb /= a.length;
  let s = 0, n = 0;
  for (let k = 0; k < a.length; k += 3) { s += Math.abs(a[k] - ma - (b[k] - mb)); n++; }
  return s / n;
}

async function historique(e, signal, suivi) {
  const liste = couchesAnciennes(), vues = [];
  const bbox = [e.xmin, e.ymin, e.xmax, e.ymax].map(v => v.toFixed(3)).join(",");
  let faites = 0;
  // Trois requêtes en vol : le serveur répond en deux à trois secondes, la cadence d'une par seconde est gardée.
  const lire = async (c) => {
    const ech = Math.max(c.res, Math.max(e.xmax - e.xmin, e.ymax - e.ymin) / 1400);
    const w = Math.max(2, Math.round((e.xmax - e.xmin) / ech)), h = Math.max(2, Math.round((e.ymax - e.ymin) / ech));
    let img;
    try {
      img = await image(`${BASE}/wms-r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${c.wms}&STYLES=`
        + `&CRS=EPSG:2154&BBOX=${bbox}&WIDTH=${w}&HEIGHT=${h}&FORMAT=image/png&TRANSPARENT=TRUE`, signal, true);
    } catch (err) { if (signal.aborted) throw err; return; }
    finally { suivi(`Vues anciennes : ${++faites} sur ${liste.length}`); }
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data, lumi = new Float32Array(w * h);
    let opaques = 0, s = 0, s2 = 0, couleur = 0;
    for (let i = 0; i < w * h; i++) {
      const r = px[4 * i], gg = px[4 * i + 1], b = px[4 * i + 2];
      if (px[4 * i + 3] > 200) opaques++;
      const v = (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255;
      lumi[i] = v; s += v; s2 += v * v;
      if (Math.max(Math.abs(r - gg), Math.abs(gg - b), Math.abs(r - b)) > 18) couleur++;
    }
    const m = s / (w * h);
    if (opaques / (w * h) < 0.6 || Math.sqrt(Math.max(0, s2 / (w * h) - m * m)) < 0.015) return;   // hors couverture ou vide
    vues.push({ ...c, canvas: cv, lumi, w, h, couleur: couleur / (w * h) > 0.08 });
  };
  let suivante = 0;
  const ouvrier = async () => { while (suivante < liste.length) await lire(liste[suivante++]); };
  await Promise.all([ouvrier(), ouvrier(), ouvrier()]);
  // Doublons : une image par date et par source ; à ressemblance égale, le millésime l'emporte sur la mosaïque.
  const tri = [...vues].sort((a, b) => a.priorite - b.priorite || a.debut - b.debut), gardees = [];
  for (const v of tri) {
    const emp = empreinte(v.lumi, v.w, v.h);
    let doublon = false;
    for (const g of gardees) {
      if (g.v.nature !== v.nature) continue;
      let c = 0; for (let k = 0; k < emp.length; k++) c += emp[k] * g.emp[k]; c /= emp.length;
      if (c > 0.985 && ecartMoyen(g.v.lumi, v.lumi) < 0.03) { doublon = true; break; }
    }
    if (!doublon) gardees.push({ v, emp });
  }
  const res = gardees.map(g => g.v).sort((a, b) => a.debut - b.debut || a.fin - b.fin);
  for (const v of res) delete v.lumi;
  if (!res.length) throw new Error("Aucune vue ancienne sur cette zone.");
  return { vues: res };
}

// ---------------------------------------------------------------------------
// Chargement et composition
// ---------------------------------------------------------------------------
export async function charger(cle, g, e, cote, signal, suivi) {
  if (cle === "geologie") return geologie(e, signal);
  if (cle === "sols") return sols(e, signal, suivi);
  if (cle === "courbes") { suivi("Tracé des courbes"); await new Promise(r => setTimeout(r, 30)); return courbes(g, e, cote); }
  if (cle === "historique") return historique(e, signal, suivi);
  throw new Error("calque inconnu");
}

/** Une seule image pour la carte graphique : les calques cochés, de bas en haut, chacun à son opacité. */
export function composer(couches, e, cote) {
  if (!couches.length) return null;
  const t = toile(e, cote);
  for (const { image: im, opacite } of couches) {
    t.ctx.globalAlpha = opacite;
    t.ctx.imageSmoothingQuality = "high";
    t.ctx.drawImage(im, 0, 0, t.W, t.H);
  }
  return t.canvas;
}

export const libelleVue = v => `${v.libelle} · ${v.nature === "carte" ? "carte" : v.couleur ? "photo" : "photo noir et blanc"}`;
