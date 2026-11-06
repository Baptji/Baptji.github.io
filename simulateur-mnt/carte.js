/* Carte IGN, zone du site et téléchargement du MNT (portage de Carte.swift et IGN.swift de l'app Mac).
 * Fonds WMTS et altitudes brutes (WMS float32) de la Géoplateforme, qui autorise les pages web. */
import { versL93, versGeo, enMetropole, rect } from "./geo.js?v=20261106235519";

const BASE = "https://data.geopf.fr";
const FONDS = {
  plan: { couche: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2", format: "image/png", zmax: 19 },
  photo: { couche: "ORTHOIMAGERY.ORTHOPHOTOS", format: "image/jpeg", zmax: 19 },
};

export const SOURCES = {
  lidarHD: { titre: "LiDAR HD", couche: "IGNF_LIDAR-HD_MNT_ELEVATION.ELEVATIONGRIDCOVERAGE.LAMB93", pasNatif: 0.5 },
  rgeAlti: { titre: "RGE ALTI", couche: "ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES", pasNatif: 1 },
};
export const PAS = [0.5, 1, 2, 5];
/** Marge prise autour de la zone tracée : l'eau qui vient de l'amont proche entre dans le calcul. */
export const MARGE = 20;

// ---------------------------------------------------------------------------
// Ce que l'IGN dit de la zone : dates des vols LiDAR HD, sources et édition du RGE ALTI
// ---------------------------------------------------------------------------
const departements = new Map();

/** Département du point (Lambert-93), par le géocodage inverse : « 62 », « 2A », « 971 ». */
async function departement(x, y, signal) {
  const [lat, lon] = versGeo(x, y);
  for (const index of ["address", "parcel"]) {
    const r = await fetch(`${BASE}/geocodage/reverse?lon=${lon.toFixed(6)}&lat=${lat.toFixed(6)}&limit=1&index=${index}`, { signal });
    if (!r.ok) continue;
    const p = (await r.json()).features?.[0]?.properties;
    const code = p?.departmentcode || p?.citycode || p?.id;
    if (code) return code.startsWith("97") ? code.slice(0, 3) : code.slice(0, 2);
  }
  return null;
}

/** Date de la dernière édition à 1 m du RGE ALTI du département (service de téléchargement de l'IGN). */
async function editionRGE(x, y, signal) {
  const d = await departement(x, y, signal);
  if (!d) return null;
  if (!departements.has(d)) {
    const zone = "D" + d.padStart(3, "0");
    const r = await fetch(`${BASE}/telechargement/resource/RGEALTI?zone=${zone}&limit=50`, { signal });
    if (!r.ok) throw new Error("service de téléchargement indisponible");
    const dates = [...(await r.text()).matchAll(new RegExp(`RGEALTI_[\\w-]+_1M_[\\w-]+_${zone}_(\\d{4}-\\d\\d-\\d\\d)`, "g"))].map(m => m[1]).sort();
    departements.set(d, dates.length ? dates[dates.length - 1] : null);
  }
  const date = departements.get(d);
  return date ? { date, annee: date.slice(0, 4) } : null;
}

/** Années et sources des deux MNT sur la zone. Chaque partie vaut undefined si l'IGN n'a pas répondu.
 *  lidar : { couvert, debut, fin, annee } (dates des vols) ; rge : { date, annee } ; sources : [{ origine, resolution, precision }]. */
export async function infosZone(z, signal) {
  const bbox = `${z.xmin.toFixed(1)},${z.ymin.toFixed(1)},${z.xmax.toFixed(1)},${z.ymax.toFixed(1)},urn:ogc:def:crs:EPSG::2154`;
  const wfs = async (couche, champs) => {
    const r = await fetch(`${BASE}/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${couche}&OUTPUTFORMAT=application/json`
      + `&COUNT=1000&PROPERTYNAME=${champs}&BBOX=${bbox}`, { signal });
    if (!r.ok) throw new Error("WFS " + r.status);
    return (await r.json()).features.map(f => f.properties);
  };
  const [lidar, sources, rge] = await Promise.allSettled([
    wfs("IGNF_LIDAR-HD_METADONNEE:metadata", "date_debut_acquisition,date_fin_acquisition").then(l => {
      const dates = l.flatMap(p => [p.date_debut_acquisition, p.date_fin_acquisition]).filter(Boolean).map(s => s.slice(0, 10)).sort();
      if (!dates.length) return { couvert: false };
      const a = dates[0].slice(0, 4), b = dates[dates.length - 1].slice(0, 4);
      return { couvert: true, debut: dates[0], fin: dates[dates.length - 1], annee: a === b ? a : `${a}–${b}` };
    }),
    wfs("ELEVATIONGRIDCOVERAGE.HIGHRES.QUALITY:source_fra", "origine,resolution,precision").then(l => {
      const vues = new Map();
      for (const p of l) if (p.origine) vues.set(p.origine, p);
      return [...vues.values()];
    }),
    editionRGE((z.xmin + z.xmax) / 2, (z.ymin + z.ymax) / 2, signal),
  ]);
  return { lidar: lidar.value, sources: sources.value, rge: rge.value };
}

// Le WMS de la Géoplateforme annonce une requête par seconde.
let prochaine = 0;
async function cadence() {
  const t = performance.now(), depart = Math.max(t, prochaine);
  prochaine = depart + 1050;
  if (depart > t) await new Promise(r => setTimeout(r, depart - t));
}
export async function telecharger(url, signal, type = "arrayBuffer") {
  for (let essai = 0; ; essai++) {
    await cadence();
    try {
      const r = await fetch(url, { signal });
      if (r.status === 429 || r.status >= 500) throw new Error("serveur de l'IGN occupé (" + r.status + ")");
      if (!r.ok) throw new Error("réponse " + r.status + " du serveur");
      return await r[type]();
    } catch (e) {
      if (signal?.aborted || essai >= 2) throw e;
      await new Promise(r => setTimeout(r, 1500 * (essai + 1)));
    }
  }
}

// ---------------------------------------------------------------------------
// Géocodage : « 680626 6871245 » (Lambert-93), « 48,94 2,73 » (degrés), ou une adresse
// ---------------------------------------------------------------------------
function coordonnees(texte) {
  const m = texte.trim().split(/[\s;]+/);
  let n = m.length === 2 ? m.map(s => parseFloat(s.replace(",", "."))) : texte.split(",").map(s => parseFloat(s));
  if (n.length !== 2 || n.some(v => !Number.isFinite(v))) return null;
  const [a, b] = n;
  if (enMetropole(a, b)) { const [lat, lon] = versGeo(a, b); return { titre: `X ${Math.round(a)} · Y ${Math.round(b)}`, detail: "Lambert-93", lat, lon, demi: 400 }; }
  const [lat, lon] = a >= 40 && a <= 52 ? [a, b] : [b, a];
  if (lat < 40 || lat > 52 || lon < -6 || lon > 10) return null;
  return { titre: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, detail: "latitude, longitude", lat, lon, demi: 400 };
}

export async function rechercher(texte) {
  const p = coordonnees(texte);
  if (p) return [p];
  const r = await fetch(`${BASE}/geocodage/search?q=${encodeURIComponent(texte)}&limit=8`);
  if (!r.ok) throw new Error("géocodage indisponible");
  const d = await r.json();
  return (d.features || []).map(f => ({
    titre: f.properties.label, detail: f.properties.context || "", lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0],
    demi: f.properties.type === "municipality" ? 2500 : f.properties.type === "street" ? 600 : 300,
  }));
}

// ---------------------------------------------------------------------------
// MNT par le flux WMS brut (float32)
// ---------------------------------------------------------------------------
/** Grille produite (centres sur les multiples du pas) et grille lue sur le serveur. */
export function plan(zone, source, pas) {
  const s = SOURCES[source];
  const cx0 = Math.floor(zone.xmin / pas) * pas, cx1 = Math.ceil(zone.xmax / pas) * pas;
  const cy0 = Math.floor(zone.ymin / pas) * pas, cy1 = Math.ceil(zone.ymax / pas) * pas;
  const colonnes = Math.round((cx1 - cx0) / pas) + 1, lignes = Math.round((cy1 - cy0) / pas) + 1;
  // Lecture au pas natif quand les bords des cellules tombent sur des centres natifs (rapport pair) :
  // la moyenne pondérée est alors exacte. Sinon, le serveur rééchantillonne.
  const rapport = pas / s.pasNatif, f = Math.round(rapport);
  const facteur = Math.abs(rapport - f) < 1e-9 && f % 2 === 0 && f <= 8 ? f : 1;
  const p = { colonnes, lignes, pas, x0: cx0 - pas / 2, y0: cy1 + pas / 2, facteur, pasLu: facteur === 1 ? pas : s.pasNatif };
  p.colonnesLues = facteur === 1 ? colonnes : colonnes * facteur + 1;
  p.lignesLues = facteur === 1 ? lignes : lignes * facteur + 1;
  p.octets = p.colonnesLues * p.lignesLues * 4;
  return p;
}

export async function telechargerMNT(zone, source, pas, progression, signal) {
  const s = SOURCES[source], p = plan(zone, source, pas);
  if (p.colonnes <= 2 || p.lignes <= 2) throw new Error("Zone trop petite.");
  const CL = p.colonnesLues, LL = p.lignesLues, n = p.pasLu;
  const premierX = p.facteur === 1 ? p.x0 + n / 2 : p.x0, premierY = p.facteur === 1 ? p.y0 - n / 2 : p.y0;
  const lu = new Float32Array(CL * LL).fill(NaN);
  const cote = 4000;   // le serveur plafonne vers 5 000 pixels de côté
  const tx = Math.ceil(CL / cote), ty = Math.ceil(LL / cote), total = tx * ty;
  let faites = 0;
  for (let j = 0; j < ty; j++) for (let i = 0; i < tx; i++) {
    const c0 = i * cote, l0 = j * cote, w = Math.min(cote, CL - c0), h = Math.min(cote, LL - l0);
    const xmin = premierX + c0 * n - n / 2, ymax = premierY - l0 * n + n / 2;
    const bbox = [xmin, ymax - h * n, xmin + w * n, ymax].map(v => v.toFixed(3)).join(",");
    progression(faites / total, `Altitudes : requête ${faites + 1} sur ${total}`);
    const d = await telecharger(`${BASE}/wms-r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${s.couche}&STYLES=`
      + `&CRS=EPSG:2154&BBOX=${bbox}&WIDTH=${w}&HEIGHT=${h}&FORMAT=image/x-bil%3Bbits=32`, signal);
    if (d.byteLength !== w * h * 4) throw new Error(`Réponse inattendue de l'IGN (${d.byteLength} octets au lieu de ${w * h * 4}).`);
    const v = new DataView(d);
    for (let l = 0; l < h; l++) for (let c = 0; c < w; c++) {
      const x = v.getFloat32((l * w + c) * 4, true);
      lu[(l0 + l) * CL + c0 + c] = x <= -9999 || Number.isNaN(x) ? NaN : x;
    }
    faites++;
  }
  progression(1, "Altitudes reçues");
  const g = { lignes: p.lignes, colonnes: p.colonnes, pas: p.pas, x0: p.x0, y0: p.y0, epsg: 2154 };
  if (p.facteur === 1) return { ...g, z: lu };
  // Moyenne pondérée par la surface : les pixels lus sur un bord de cellule comptent pour moitié.
  const f = p.facteur, poids = new Float64Array(f + 1).fill(1);
  poids[0] = poids[f] = 0.5;
  const z = new Float32Array(p.colonnes * p.lignes).fill(NaN);
  for (let l = 0; l < p.lignes; l++) for (let c = 0; c < p.colonnes; c++) {
    let s2 = 0, w = 0;
    for (let a = 0; a <= f; a++) {
      const ligne = (l * f + a) * CL + c * f;
      for (let b = 0; b <= f; b++) { const x = lu[ligne + b]; if (!Number.isNaN(x)) { const q = poids[a] * poids[b]; s2 += q * x; w += q; } }
    }
    // Une cellule à moitié vide reste vide : pas d'altitude inventée en bord de LiDAR.
    if (w >= f * f * 0.5) z[l * p.colonnes + c] = s2 / w;
  }
  return { ...g, z };
}

// ---------------------------------------------------------------------------
// La carte (Leaflet) : fonds IGN, rectangle tracé en Lambert-93, emprise importée, MNT chargé
// ---------------------------------------------------------------------------
const auxCoins = r => [[r.xmin, r.ymin], [r.xmax, r.ymin], [r.xmax, r.ymax], [r.xmin, r.ymax]].map(([x, y]) => versGeo(x, y));

export class Carte {
  constructor(div, { surZone }) {
    const L = window.L;
    this.L = L;
    this.map = L.map(div, { zoomControl: true, attributionControl: true, zoomSnap: 0.25, boxZoom: false }).setView([46.6, 2.4], 6);
    this.map.attributionControl.setPrefix(false);
    this.couches = {};
    for (const [nom, f] of Object.entries(FONDS)) {
      this.couches[nom] = L.tileLayer(`${BASE}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${f.couche}&STYLE=normal`
        + `&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=${f.format}`,
        { maxNativeZoom: f.zmax, maxZoom: 21, attribution: "© IGN, Géoplateforme", crossOrigin: true });
    }
    this.fond("plan");
    this.surZone = surZone;
    this.modeTrace = false;
    this.formeZone = null; this.formeMNT = null; this.formeEmprise = null;
    const m = this.map, debut = { p: null };
    m.on("mousedown", (e) => {
      if (!(this.modeTrace || e.originalEvent.shiftKey) || e.originalEvent.button !== 0) return;
      m.dragging.disable();
      debut.p = versL93(e.latlng.lat, e.latlng.lng);
    });
    m.on("mousemove", (e) => {
      if (!debut.p) return;
      const q = versL93(e.latlng.lat, e.latlng.lng);
      this.dessinerZone(rect(debut.p[0], debut.p[1], q[0], q[1]));
    });
    const fin = (e) => {
      if (!debut.p) return;
      const q = versL93(e.latlng.lat, e.latlng.lng), r = rect(debut.p[0], debut.p[1], q[0], q[1]);
      debut.p = null;
      m.dragging.enable();
      this.trace(false);
      if (r.xmax - r.xmin >= 5 && r.ymax - r.ymin >= 5) this.surZone(r);
      else this.surZone(null);
    };
    m.on("mouseup", fin);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && this.modeTrace) this.trace(false); });
  }

  fond(nom) {
    for (const [k, c] of Object.entries(this.couches)) { if (k === nom) c.addTo(this.map); else c.remove(); }
    this.nomFond = nom;
  }

  trace(actif) {
    this.modeTrace = actif;
    this.map.getContainer().classList.toggle("trace", actif);
  }

  dessinerZone(r) {
    this.formeZone?.remove(); this.formeZone = null;
    if (r) this.formeZone = this.L.polygon(auxCoins(r), { color: "#ff9800", weight: 2, fillOpacity: 0.12, interactive: false }).addTo(this.map);
  }

  dessinerEmprise(anneaux) {
    this.formeEmprise?.remove(); this.formeEmprise = null;
    if (anneaux) this.formeEmprise = this.L.polygon(anneaux.map(a => a.map(([x, y]) => versGeo(x, y))),
      { color: "#d81b60", weight: 2, dashArray: "6 4", fillOpacity: 0.05, interactive: false }).addTo(this.map);
  }

  dessinerMNT(r) {
    this.formeMNT?.remove(); this.formeMNT = null;
    if (r) this.formeMNT = this.L.polygon(auxCoins(r), { color: "#0a6cdf", weight: 1.5, dashArray: "4 4", fill: false, interactive: false }).addTo(this.map);
  }

  cadrer(r) {
    const c = auxCoins(r);
    this.map.fitBounds(this.L.latLngBounds(c).pad(0.15), { maxZoom: 19 });
  }

  aller(lat, lon, demi) {
    const [x, y] = versL93(lat, lon);
    this.cadrer({ xmin: x - demi, xmax: x + demi, ymin: y - demi, ymax: y + demi });
  }

  redimensionner() { this.map.invalidateSize(); }
}
