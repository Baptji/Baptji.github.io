/* Simulateur 3D dans le navigateur (B.2 à B.4) : chargement du MNT, calcul dans un Web Worker,
 * vue 3D et couches, remodelage et comparaison, export. Même logique que l'app Mac. */
import * as THREE from "three";
import { fromArrayBuffer } from "geotiff";
import { Vue3D } from "./vue3d.js?v=20261107012032";
import * as Couches from "./couches.js?v=20261107012032";
import { geotiff, csvDepressions, zip, telecharger } from "./export.js?v=20261107012032";
import * as Outils from "./outils.js?v=20261107012032";
import { Carte, rechercher, plan as planMNT, telechargerMNT, infosZone, boiteDe, SOURCES, PAS, MARGE } from "./carte.js?v=20261107012032";
import { Evenement } from "./evenement.js?v=20261107012032";
import * as Etude from "./etude.js?v=20261107012032";
import { deGrille, agrandi, lireEmprise } from "./geo.js?v=20261107012032";

const $ = id => document.getElementById(id);

// ---------------------------------------------------------------------------
// Mise en forme à la française (Texte de l'app Mac)
// ---------------------------------------------------------------------------
const formats = new Map();
function nombre(v, d = 0) {
  if (!Number.isFinite(v)) return "—";
  if (!formats.has(d)) formats.set(d, new Intl.NumberFormat("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }));
  return formats.get(d).format(v);
}
const metres = v => (v < 10 && v !== Math.round(v) ? nombre(v, 1) : nombre(v)) + " m";
const surface = m2 => m2 >= 10000 ? nombre(m2 / 10000, m2 >= 1e6 ? 0 : 2) + " ha" : nombre(m2) + " m²";
const volume = m3 => m3 >= 100 ? nombre(m3) + " m³" : nombre(m3, m3 >= 10 ? 1 : 2) + " m³";
function debitTexte(q) {
  if (q >= 10) return nombre(q, 1) + " m³/s";
  if (q >= 0.1) return nombre(q, 2) + " m³/s";
  if (q >= 0.001) return nombre(q * 1000, q >= 0.01 ? 0 : 1) + " L/s";
  return nombre(q * 1000, 2) + " L/s";
}
function duree(s) {
  if (!Number.isFinite(s)) return "jamais";
  const m = s / 60;
  if (m < 1) return "moins d'une minute";
  if (m < 60) return nombre(m) + " min";
  const h = Math.floor(m / 60), reste = Math.floor(m % 60);
  if (h >= 48) return nombre(m / 1440, 1) + " jours";
  return reste === 0 ? h + " h" : h + " h " + String(reste).padStart(2, "0");
}
const echapper = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------------------------------------------------------------------------
// Réglages gardés par le navigateur (commodité : la page marche sans)
// ---------------------------------------------------------------------------
const GARDES = ["intensite", "coefficient", "seuilDebit", "profondeurMini", "reseau", "ordreMini", "partage", "comblement", "penteMin", "pinceau", "debitPinceau",
  "modePluie", "montanaA", "montanaB", "duree", "station", "montrerSurfaces", "source", "pasMNT", "ongletAffichage", "modeSols", "fondCarte"];
function lireReglages() { try { return JSON.parse(localStorage.getItem("simulateur-reglages") || "{}"); } catch { return {}; } }
function garderReglages() {
  try { localStorage.setItem("simulateur-reglages", JSON.stringify(Object.fromEntries(GARDES.map(k => [k, E[k]])))); } catch { /* navigation privée */ }
}

// ---------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------
const E = Object.assign({
  nom: "", detail: "", remarques: [], origine: null, grille: null,
  resultat: null, reference: null, comparaison: null, bilan: null,
  etatPhoto: null, fond: "photo", opacitePhoto: 1, exageration: 2, opaciteCouches: 0.9,
  ecoulements: true, reseau: "debit", seuilDebit: 0.01, ordreMini: 5,
  depressions: true, profondeurMini: 0.10, depressionChoisie: null,
  partage: "mfd", comblement: "wang_liu", penteMin: 0.1, intensite: 50, coefficient: 0.3,
  modePluie: "intensite", montanaA: 5, montanaB: 0.6, duree: 60, station: "", montrerSurfaces: false,
  surfaces: [], zoneSurface: [], accC: null, sigAccC: null, idResultat: 0, cleProjet: null,
  outil: "egaliser", portee: "tout", decalage: 0.5, altitudeFixe: 0, point: null, altitudeEgal: 0, rayon: 10, raccord: 10,
  saisie: "aucune", zone: [], operations: [], historique: [], refaire: [],
  pinceau: { forme: "rond", longueur: 10, largeur: 5, angle: 0, repartition: -0.5 }, debitPinceau: 0.2,
  ecart: "altitude", bornesEcart: [-1, 1], bornesTWI: [0, 1], legende: {},
  travail: null, erreur: null, lecture: null,
  // Carte : zone du site, emprise importée, téléchargement du MNT
  ecran: "carte", zoneSite: null, emprise: null, infosZone: null, source: "lidarHD", pasMNT: 0.5, fondCarte: "plan",
  recherche: "", lieux: [], erreurCarte: null,
  // Affichage en onglets et calques de l'étude (vus sur le terrain, jamais exportés)
  ongletAffichage: "terrain", calques: [], etatCalques: {}, opaciteCalques: {}, modeSols: "dominant", vueAncienne: 0,
}, lireReglages());
if (!["terrain", "hydrologie", "etude"].includes(E.ongletAffichage)) E.ongletAffichage = "terrain";
if (!SOURCES[E.source]) E.source = "lidarHD";
if (!PAS.includes(E.pasMNT)) E.pasMNT = 0.5;
if (E.fondCarte !== "photo") E.fondCarte = "plan";
if (E.comblement !== "sink_removal") E.comblement = "wang_liu";   // réglage gardé inconnu ou périmé

const FONDS = [["photo", "Photo", 0], ["altitudes", "Altitudes", 1], ["twi", "TWI", 2], ["ecarts", "Écarts", 2]];
const COEFFICIENTS = [["Forêt", 0.15], ["Prairie", 0.25], ["Cultures", 0.40], ["Zone bâtie", 0.70], ["Imperméable", 0.95]];
/** Surfaces types (Surface.types de l'app Mac) : C de la méthode rationnelle ou CN (sol hydrologique B à C). */
const TYPES_SURFACES = [["Toiture, voirie", "c", 0.95], ["Stabilisé, gravier", "c", 0.6], ["Terre nue, chantier", "c", 0.5],
  ["Culture", "c", 0.3], ["Prairie", "c", 0.2], ["Bois", "c", 0.15], ["Zone humide", "c", 0.05],
  ["Culture (CN 78)", "cn", 78], ["Prairie (CN 69)", "cn", 69], ["Bois (CN 60)", "cn", 60]];

// Limite de taille annoncée : la mémoire du navigateur est la vraie borne (environ 60 octets par cellule).
const memoire = navigator.deviceMemory || 8;
const LIMITE = memoire <= 2 ? 3e6 : memoire <= 4 ? 6e6 : memoire <= 8 ? 12e6 : 20e6;

const vue = new Vue3D($("vue3d"));
const evt = new Evenement(vue, { surImage: imageEvenement });
const travailleur = new Worker("calcul.js?v=20261107012032");
let idCalcul = 0, idRuissellement = 0, enCalcul = false, minuterieRecalcul = 0;

// ---------------------------------------------------------------------------
// Lecture du MNT (B.2) : GeoTIFF par geotiff.js, ou grille ASCII
// ---------------------------------------------------------------------------
async function lireFichier(fichier) {
  const nom = fichier.name.replace(/\.[^.]+$/, "");
  const ext = fichier.name.split(".").pop().toLowerCase();
  const tampon = await fichier.arrayBuffer();
  let g;
  if (ext === "asc" || ext === "txt") g = lireASC(new TextDecoder().decode(tampon));
  else if (ext === "tif" || ext === "tiff") g = await lireGeoTIFF(tampon);
  else throw new Error("Format non reconnu (." + ext + "). Formats acceptés : GeoTIFF (.tif) et grille ASCII (.asc).");
  return { g, nom, detail: ext === "asc" ? "Grille ASCII" : "GeoTIFF", octets: tampon.byteLength };
}

async function lireGeoTIFF(tampon) {
  const tiff = await fromArrayBuffer(tampon);
  const img = await tiff.getImage();
  const C = img.getWidth(), L = img.getHeight();
  const [pasX, pasY] = img.getResolution();
  if (Math.abs(Math.abs(pasX) - Math.abs(pasY)) > 1e-6 * Math.abs(pasX)) throw new Error("Cellules rectangulaires : le simulateur attend des cellules carrées.");
  let [x0, y0] = img.getOrigin();
  const cles = img.getGeoKeys() || {};
  if (cles.GTRasterTypeGeoKey === 2) { x0 -= Math.abs(pasX) / 2; y0 += Math.abs(pasY) / 2; }   // PixelIsPoint
  const ras = await img.readRasters({ samples: [0], interleave: true });
  const z = new Float32Array(C * L);
  const nd = img.getGDALNoData();
  for (let i = 0; i < z.length; i++) {
    const v = ras[i];
    z[i] = (nd !== null && (v === nd || Math.fround(v) === Math.fround(nd))) || v <= -9999 || v >= 1e20 || Number.isNaN(v) ? NaN : v;
  }
  let epsg = cles.ProjectedCSTypeGeoKey || cles.GeographicTypeGeoKey || null;
  if (epsg === 32767) epsg = null;
  return { lignes: L, colonnes: C, pas: Math.abs(pasX), z, x0, y0, epsg };
}

function lireASC(t) {
  const lignes = t.split(/\r?\n/);
  const en = {};
  let k = 0;
  for (; k < lignes.length; k++) {
    const m = lignes[k].trim().match(/^([a-zA-Z_]+)\s+(\S+)$/);
    if (!m) break;
    en[m[1].toLowerCase()] = parseFloat(m[2]);
  }
  const C = en.ncols, L = en.nrows, pas = en.cellsize, nd = en.nodata_value;
  if (!C || !L || !pas) throw new Error("En-tête de grille ASCII incomplet.");
  const z = new Float32Array(C * L);
  let i = 0;
  for (; k < lignes.length && i < z.length; k++) for (const s of lignes[k].trim().split(/\s+/)) {
    if (!s) continue;
    const v = parseFloat(s);
    z[i++] = v === nd || v <= -9999 ? NaN : v;
  }
  const x0 = en.xllcorner ?? (en.xllcenter - pas / 2), ybas = en.yllcorner ?? (en.yllcenter - pas / 2);
  return { lignes: L, colonnes: C, pas, z, x0, y0: ybas + L * pas, epsg: null };
}

function reduite(g, f) {
  const L = Math.floor(g.lignes / f), C = Math.floor(g.colonnes / f), z = new Float32Array(L * C).fill(NaN);
  for (let l = 0; l < L; l++) for (let c = 0; c < C; c++) {
    let s = 0, n = 0;
    for (let dl = 0; dl < f; dl++) for (let dc = 0; dc < f; dc++) { const v = g.z[(l * f + dl) * g.colonnes + c * f + dc]; if (!Number.isNaN(v)) { s += v; n++; } }
    if (n) z[l * C + c] = s / n;
  }
  return { ...g, lignes: L, colonnes: C, pas: g.pas * f, z };
}

function decoupee(g, cote) {
  const C = Math.min(g.colonnes, cote), L = Math.min(g.lignes, cote);
  const c0 = Math.floor((g.colonnes - C) / 2), l0 = Math.floor((g.lignes - L) / 2), z = new Float32Array(L * C);
  for (let l = 0; l < L; l++) z.set(g.z.subarray((l0 + l) * g.colonnes + c0, (l0 + l) * g.colonnes + c0 + C), l * C);
  return { ...g, lignes: L, colonnes: C, z, x0: g.x0 + c0 * g.pas, y0: g.y0 - l0 * g.pas };
}

const enLambert93 = g => g.epsg === 2154 || (!g.epsg && g.x0 > 50000 && g.x0 < 1300000 && g.y0 > 6000000 && g.y0 < 7200000);

async function ouvrir(fichier, autres = []) {
  if (/\.(shp|prj|dbf|shx)$/i.test(fichier.name)) return importerEmprise([fichier, ...autres]);
  try {
    travail("Lecture de " + fichier.name, 0.02);
    const { g, nom, detail, octets } = await lireFichier(fichier);
    travail(null);
    const cle = [fichier.name, octets, g.colonnes, g.lignes, g.pas, g.x0, g.y0].join("|");
    const n = g.lignes * g.colonnes;
    const cote = Math.max(g.lignes, g.colonnes);
    if (n > LIMITE || cote > Math.min(8192, vue.maxTexture)) return proposerReduction(g, nom, detail, cle);
    installer(g, nom, detail, [], cle);
  } catch (e) {
    travail(null);
    alerte("Lecture impossible : " + (e.message || e));
  }
}

/** Au-delà de la limite : ramener à un pas plus grand ou garder le centre, au choix. */
function proposerReduction(g, nom, detail, cle) {
  const n = g.lignes * g.colonnes, cote = Math.min(8192, vue.maxTexture);
  let f = 1;
  while ((Math.floor(g.lignes / f) * Math.floor(g.colonnes / f) > LIMITE) || Math.max(g.lignes, g.colonnes) / f > cote) f++;
  const garde = Math.min(cote, Math.floor(Math.sqrt(LIMITE)));
  const choix = [
    [`Ramener au pas de ${metres(g.pas * f)} (${nombre(Math.floor(g.lignes / f) * Math.floor(g.colonnes / f) / 1e6, 1)} million de cellules)`, () => {
      const h = reduite(g, f);
      installer(h, nom, detail, [`MNT de ${nombre(n / 1e6, 1)} millions de cellules : ramené au pas de ${metres(h.pas)} (moyenne des cellules).`], cle);
    }],
    [`Garder le centre au pas de ${metres(g.pas)} (${metres(garde * g.pas)} de côté au plus)`, () => {
      const h = decoupee(g, garde);
      installer(h, nom, detail, [`MNT découpé : seul le centre (${metres(h.colonnes * h.pas)} × ${metres(h.lignes * h.pas)}) est gardé.`], cle);
    }],
  ];
  if (n <= 2 * LIMITE && Math.max(g.lignes, g.colonnes) <= cote) choix.push(["Calculer tel quel (risque de manquer de mémoire)", () => installer(g, nom, detail, [], cle)]);
  dialogue(`<h3>MNT trop grand pour cet ordinateur</h3>
    <p>${nombre(g.colonnes)} × ${nombre(g.lignes)} = ${nombre(n / 1e6, 1)} millions de cellules. Ce navigateur en traite environ
    ${nombre(LIMITE / 1e6)} millions (${memoire} Go de mémoire annoncés). Au-delà, l'onglet risque de s'arrêter.</p>`, choix);
}

/** Chaque MNT ouvert ou téléchargé a son onglet ; le terrain affiché jusque-là garde le sien. */
/** Découpe selon le polygone : les cellules dont le centre est dehors n'ont plus d'altitude (pair-impair,
 *  par lignes de balayage). Rend le nombre de cellules retirées. */
function decouper(g, anneaux) {
  const C = g.colonnes, xs = [];
  let retirees = 0;
  for (let l = 0; l < g.lignes; l++) {
    const y = g.y0 - (l + 0.5) * g.pas;
    xs.length = 0;
    for (const a of anneaux) for (let k = 0, n = a.length; k < n; k++) {
      const [x1, y1] = a[k], [x2, y2] = a[(k + 1) % n];
      if ((y1 > y) !== (y2 > y)) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    xs.sort((u, v) => u - v);
    let k = 0;
    for (let c = 0; c < C; c++) {
      const x = g.x0 + (c + 0.5) * g.pas;
      while (k < xs.length && xs[k] <= x) k++;
      if (k % 2 === 0) { const i = l * C + c; if (!Number.isNaN(g.z[i])) retirees++; g.z[i] = NaN; }
    }
  }
  return retirees;
}

/** Contour du terrain affiché sur la carte : le polygone découpé, sinon le rectangle du MNT. */
function dessinerMNTCarte() {
  const g = E.grille;
  carte.dessinerMNT(g && enLambert93(g) ? (E.decoupe ? { anneaux: E.decoupe } : deGrille(g)) : null);
}

/** decoupe : anneaux du polygone selon lequel le MNT a été découpé ; horsSite : cellules retirées par ce découpage. */
function installer(g, nom, detail, remarques, cle = null, decoupe = null, horsSite = 0) {
  finirPassage();
  quitterTerrain();
  Object.assign(E, etatTerrainVide(), { calques: E.calques.slice() });
  const o = { id: ++compteurOnglets, titre: nom, etat: null, photo: null, vue: null, donnees: {}, aRecalculer: false };
  onglets.push(o);
  ongletActif = o;
  E.origine = g; E.grille = g; E.nom = nom; E.detail = detail; E.remarques = remarques.slice();
  E.cleProjet = cle; E.decoupe = decoupe;
  chargerProjet();
  let s = 0, n = 0, vides = 0;
  for (const v of g.z) if (Number.isNaN(v)) vides++; else { s += v; n++; }
  E.altitudeFixe = Math.round(s / Math.max(1, n));
  // Hors du polygone découpé, le vide est voulu : seuls les trous dans le site sont signalés.
  if (vides - horsSite > 0) E.remarques.push(`${nombre((vides - horsSite) / (g.z.length - horsSite) * 100, 1)} % du site sans altitude : l'eau s'y perd comme au bord.`);
  if (g.epsg && g.epsg !== 2154) E.remarques.push(`Système EPSG:${g.epsg} : la photo aérienne suppose du Lambert-93 (EPSG:2154).`);
  if (E.fond === "ecarts") E.fond = "altitudes";
  const p = E.pinceau;
  p.longueur = Math.min(tailleMaxi(g), Math.max(g.pas, p.longueur));
  p.largeur = Math.min(tailleMaxi(g), Math.max(g.pas, p.largeur));
  vue.charger(g);
  montrerEcran("terrain");
  dessinerMNTCarte();
  reinitialiserCalques();
  modeOutil();
  vue.regler({ fond: indiceFond(), exageration: E.exageration, opaciteCouches: E.opaciteCouches, opacitePhoto: E.opacitePhoto });
  chercherPhoto(g);
  calculer();
  for (const c of E.calques) chargerCalque(c);
}

function chercherPhoto(g) {
  E.etatPhoto = null;
  if (!enLambert93(g)) { E.etatPhoto = "Pas de photo aérienne : le MNT n'est pas en Lambert-93."; if (E.fond === "photo") E.fond = "altitudes"; return; }
  const W = g.colonnes * g.pas, H = g.lignes * g.pas;
  const echelle = Math.max(0.2, Math.max(W, H) / Math.min(4096, vue.maxTexture));
  const w = Math.max(2, Math.round(W / echelle)), h = Math.max(2, Math.round(H / echelle));
  const bbox = [g.x0, g.y0 - H, g.x0 + W, g.y0].map(v => v.toFixed(3)).join(",");
  const url = "https://data.geopf.fr/wms-r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ORTHOIMAGERY.ORTHOPHOTOS&STYLES="
    + `&CRS=EPSG:2154&BBOX=${bbox}&WIDTH=${w}&HEIGHT=${h}&FORMAT=image/jpeg`;
  E.etatPhoto = "Photo aérienne : téléchargement…";
  const origine = E.origine;
  // L'onglet du MNT : on a pu en changer, ou le fermer, pendant le téléchargement.
  const onglet = () => onglets.find(o => (o === ongletActif ? E.origine : o.etat?.origine) === origine);
  new THREE.TextureLoader().loadAsync(url).then(t => {
    const o = onglet();
    if (!o) return t.dispose();
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    if (o !== ongletActif) {
      o.photo = t; o.etat.etatPhoto = null;
      if (o.etat.fond === "altitudes") o.etat.fond = "photo";
      return;
    }
    vue.photo(t);
    E.etatPhoto = null;
    if (E.fond === "altitudes") E.fond = "photo";
    appliquerFond();
    afficher();
  }).catch(() => {
    const o = onglet(), texte = "Photo aérienne indisponible (réseau ou serveur de l'IGN). Le terrain est coloré par altitude.";
    if (!o) return;
    if (o !== ongletActif) { o.etat.etatPhoto = texte; if (o.etat.fond === "photo") o.etat.fond = "altitudes"; return; }
    E.etatPhoto = texte;
    if (E.fond === "photo") E.fond = "altitudes";
    appliquerFond();
    afficher();
  });
  afficher();
}

// ---------------------------------------------------------------------------
// Onglets (BarreOnglets de l'app Mac) : Carte, Photo aérienne, puis un onglet par terrain.
// L'état du terrain affiché vit dans E ; celui des autres est rangé dans leur onglet.
// ---------------------------------------------------------------------------
const etatTerrainVide = () => ({ nom: "", detail: "", remarques: [], origine: null, grille: null, resultat: null, reference: null,
  comparaison: null, bilan: null, etatPhoto: null, surfaces: [], zoneSurface: [], accC: null, sigAccC: null, idResultat: 0, cleProjet: null,
  operations: [], historique: [], refaire: [], zone: [], point: null, saisie: "aucune", altitudeFixe: 0, altitudeEgal: 0,
  depressionChoisie: null, lecture: null, erreur: null, etatCalques: {}, vueAncienne: 0, legende: {}, bornesEcart: [-1, 1], bornesTWI: [0, 1], site: null, decoupe: null, jauges: [] });
const CLES_TERRAIN = [...Object.keys(etatTerrainVide()), "fond", "calques", "modePluie", "intensite", "montanaA", "montanaB", "duree", "station", "coefficient"];
const onglets = [];
let ongletActif = null, compteurOnglets = 0;
/** Dernier calcul terminé par le Worker : c'est sur lui seul qu'il sait refaire le ruissellement pondéré. */
let dernierCalcul = 0, ruissellementEnVol = false;

function nomTerrainLibre() {
  let n = 1;
  while (onglets.some(o => o.titre === "Terrain " + n)) n++;
  return "Terrain " + n;
}

/** Range le terrain affiché dans son onglet ; un calcul en cours sera relancé au retour. */
function quitterTerrain() {
  const o = ongletActif;
  evt.oublier();
  if (!o) return;
  finirPassage();
  if (enCalcul || minuterieRecalcul) {
    clearTimeout(minuterieRecalcul); minuterieRecalcul = 0;
    if (enCalcul) { travailleur.postMessage({ type: "annuler" }); idCalcul++; enCalcul = false; }
    o.aRecalculer = true;
    travail(null);
  }
  if (ruissellementEnVol) { idRuissellement++; ruissellementEnVol = false; E.sigAccC = null; }
  for (const c of Object.keys(controleurs)) { controleurs[c].abort(); delete controleurs[c]; }
  for (const c of Object.keys(E.etatCalques)) if (E.etatCalques[c].chargement !== undefined) delete E.etatCalques[c];
  o.etat = Object.fromEntries(CLES_TERRAIN.map(k => [k, E[k]]));
  o.donnees = { ...donneesCalques };
  o.photo = vue.detacherPhoto();
  o.vue = vue.etatVue();
  ongletActif = null;
}

function entrerTerrain(o) {
  ongletActif = o;
  Object.assign(E, o.etat);
  o.etat = null;
  for (const c of Object.keys(donneesCalques)) delete donneesCalques[c];
  Object.assign(donneesCalques, o.donnees);
  o.donnees = {};
  E.lecture = null;
  vue.charger(E.grille);
  if (o.photo) vue.photo(o.photo);
  o.photo = null;
  vue.retablirVue(o.vue);
  vue.regler({ fond: indiceFond() });
  dessinerMNTCarte();
  modeOutil();
  if (o.aRecalculer || !E.resultat) { o.aRecalculer = false; calculer(); }
  else { couchesAJour(); colorationAJour(); ruissellementAJour(); }
  calquesAJour();
  for (const c of E.calques) if (!E.etatCalques[c]?.pret) chargerCalque(c);
  afficherJauges();
}

function choisirOnglet(o) {
  if (o !== ongletActif) { quitterTerrain(); entrerTerrain(o); }
  montrerEcran("terrain");
}

function fermerOnglet(o) {
  const k = onglets.indexOf(o);
  if (k < 0) return;
  const actif = o === ongletActif;
  if (actif) quitterTerrain();
  o.photo?.dispose();
  o.photo = o.etat = o.donnees = null;
  onglets.splice(k, 1);
  if (!actif) { barreOnglets(); return; }
  const suivant = onglets[k] || onglets[k - 1];
  if (suivant && E.ecran === "terrain") { entrerTerrain(suivant); montrerEcran("terrain"); return; }
  Object.assign(E, etatTerrainVide());
  reinitialiserCalques();
  vue.vider();
  afficherJauges();
  carte.dessinerMNT(null);
  montrerEcran("carte");
}

function renommerOnglet(o, titre) {
  titre = titre.trim();
  if (!titre) return;
  o.titre = titre;
  if (o === ongletActif) E.nom = titre; else if (o.etat) o.etat.nom = titre;
}

/** La barre est mise à jour sur place (sans tout refaire) : le double-clic qui renomme survit au premier clic qui choisit. */
function barreOnglets() {
  const nav = $("onglets"), surCarte = E.ecran === "carte";
  const anciens = new Map([...nav.children].map(el => [el.dataset.cle, el]));
  const voulus = [
    ...[["plan", "Carte"], ["photo", "Photo aérienne"]].map(([v, titre]) => ({ cle: "carte-" + v, actif: surCarte && E.fondCarte === v,
      creer: () => Object.assign(document.createElement("button"), { className: "onglet", textContent: titre }), donnees: { carte: v } })),
    ...(onglets.length ? [{ cle: "separation", creer: () => Object.assign(document.createElement("span"), { className: "separation" }) }] : []),
    ...onglets.map(o => ({ cle: "terrain-" + o.id, actif: !surCarte && o === ongletActif, onglet: o, donnees: { onglet: o.id },
      creer: () => {
        const el = document.createElement("div");
        el.className = "onglet terrain";
        el.title = "Double-clic pour renommer";
        el.innerHTML = `<span class="nom"></span><button class="fermer" data-fermer="${o.id}" title="Fermer l'onglet">×</button>`;
        return el;
      } })),
  ];
  voulus.forEach((v, k) => {
    let el = anciens.get(v.cle);
    anciens.delete(v.cle);
    if (!el) { el = v.creer(); el.dataset.cle = v.cle; Object.assign(el.dataset, v.donnees || {}); }
    if (v.actif !== undefined) el.classList.toggle("actif", v.actif);
    if (v.onglet) {
      const nom = el.querySelector(".nom");
      if (nom && nom.textContent !== v.onglet.titre) nom.textContent = v.onglet.titre;
      el.querySelector(".fermer").setAttribute("aria-label", "Fermer " + v.onglet.titre);
    }
    if (nav.children[k] !== el) nav.insertBefore(el, nav.children[k] || null);
  });
  for (const el of anciens.values()) el.remove();
}

const ongletDe = el => onglets.find(o => o.id === +el.dataset.onglet || o.id === +el.dataset.fermer);
$("onglets").addEventListener("click", (e) => {
  const f = e.target.closest("[data-fermer]");
  if (f) { e.stopPropagation(); fermerOnglet(ongletDe(f)); return; }
  const c = e.target.closest("[data-carte]");
  if (c) { E.fondCarte = c.dataset.carte; carte.fond(E.fondCarte); garderReglages(); montrerEcran("carte"); return; }
  const t = e.target.closest("[data-onglet]");
  if (t && !e.target.closest("input")) choisirOnglet(ongletDe(t));
});
// Clic du milieu : fermer, comme dans un navigateur.
$("onglets").addEventListener("auxclick", (e) => {
  const t = e.target.closest("[data-onglet]");
  if (t && e.button === 1) { e.preventDefault(); fermerOnglet(ongletDe(t)); }
});
$("onglets").addEventListener("dblclick", (e) => {
  const t = e.target.closest("[data-onglet]"), o = t && ongletDe(t);
  if (!o || e.target.closest(".fermer")) return;
  const nom = t.querySelector(".nom"), champ = document.createElement("input");
  champ.value = o.titre;
  champ.className = "renommer";
  nom.replaceWith(champ);
  champ.focus(); champ.select();
  let fini = false;
  const finir = (garder) => {
    if (fini) return;
    fini = true;
    if (garder) renommerOnglet(o, champ.value);
    nom.textContent = o.titre;
    champ.replaceWith(nom);
    barreOnglets();
    if (o === ongletActif) afficher();
  };
  champ.addEventListener("keydown", (k) => { if (k.key === "Enter") finir(true); else if (k.key === "Escape") finir(false); k.stopPropagation(); });
  champ.addEventListener("blur", () => finir(true));
});

// ---------------------------------------------------------------------------
// Calcul dans le Web Worker
// ---------------------------------------------------------------------------
function calculer() {
  const o = E.origine;
  clearTimeout(minuterieRecalcul); minuterieRecalcul = 0;
  if (!o) return;
  const id = ++idCalcul;
  enCalcul = true;
  const besoinReference = E.operations.length > 0 && !E.reference;
  travail(E.operations.length ? "Remodelage du terrain" : "Remplissage des dépressions", 0.02);
  travailleur.postMessage({ type: "calculer", id, methode: { comblement: E.comblement, penteMin: E.penteMin, partage: E.partage },
    grille: { lignes: o.lignes, colonnes: o.colonnes, pas: o.pas, z: o.z, x0: o.x0, y0: o.y0 },
    operations: E.operations, origine: besoinReference });
}

travailleur.onmessage = (e) => {
  const m = e.data;
  if (m.type === "ruissellement") {
    if (m.id !== E.idResultat || m.idR !== idRuissellement || !E.resultat) return;
    ruissellementEnVol = false;
    E.accC = m.accC;
    couchesAJour();
    afficherJauges();
    afficher();
    return;
  }
  if (m.id !== idCalcul) return;
  if (m.type === "progres") { travail(m.etape, m.fraction); return; }
  enCalcul = false;
  if (m.type === "annule") { travail(null); return; }
  if (m.type === "erreur") { travail(null); E.erreur = "Calcul interrompu : " + m.message; afficher(); return; }
  const o = E.origine;
  if (m.reference) E.reference = m.reference;
  const g = m.z ? { ...o, z: m.z } : o;
  if (g !== E.grille) { evt.oublier(); E.grille = g; vue.remplacerAltitudes(g); if (E.calques.includes("courbes")) chargerCalque("courbes"); }
  E.resultat = m.resultat;
  E.idResultat = m.id; E.accC = null; dernierCalcul = m.id;
  E.lecture = null; E.depressionChoisie = null;
  if (!E.operations.length) { E.reference = { acc: m.resultat.acc, twi: m.resultat.twi, depressions: m.resultat.depressions, exutoire: m.resultat.exutoire }; E.comparaison = null; }
  else E.comparaison = comparer(E.reference, o, m.resultat, g, m.bilan);
  travail(null);
  ruissellementAJour();
  couchesAJour();
  colorationAJour();
  modeOutil();
  afficherJauges();
  afficher();
};
travailleur.onerror = (e) => { enCalcul = false; travail(null); E.erreur = "Le calcul a échoué (" + (e.message || "mémoire insuffisante ?") + ")."; afficher(); };

function comparer(ref, o, r, g, bilan) {
  const aire = g.pas * g.pas;
  let n = 0, sa = 0, sb = 0, plusHumide = 0, plusSec = 0, modifiee = 0;
  for (let i = 0; i < g.z.length; i++) {
    if (o.z[i] !== g.z[i] && !Number.isNaN(g.z[i])) modifiee += aire;
    const a = ref.twi[i], w = r.twi[i];
    if (Number.isNaN(a) || Number.isNaN(w)) continue;
    n++; sa += a; sb += w;
    if (w - a > 1) plusHumide += aire; else if (a - w > 1) plusSec += aire;
  }
  return { ...bilan, surfaceModifiee: modifiee, twiAvant: sa / n, twiApres: sb / n, plusHumide, plusSec,
           exutoireAvant: ref.exutoire, exutoireApres: r.exutoire, depAvant: ref.depressions, depApres: r.depressions };
}

/** Débit de `cellules` drainées jusqu'à la cellule i (C moyen des surfaces dessinées en amont). */
const debit = (cellules, i) => Noyau.debit(cellules, E.grille?.pas || 1, coefficientEn(i), E.intensite);
const retenues = deps => { const d = deps.filter(x => x.profondeur >= E.profondeurMini); return { nombre: d.length, volume: d.reduce((s, x) => s + x.volume, 0) }; };
const depressionsRetenues = () => (E.resultat?.depressions || []).filter(d => d.profondeur >= E.profondeurMini).sort((a, b) => b.volume - a.volume);
const dureeRemplissage = d => { const q = debit(d.bassin, d.exutoire); return q > 0 ? d.volume / q : Infinity; };

// ---------------------------------------------------------------------------
// Pluie de projet (A.2) : Montana, durée, surfaces dessinées avec leur C ou leur CN
// ---------------------------------------------------------------------------
/** Hauteur de pluie (mm) : sert au C des surfaces données par leur CN. */
const pluieMm = () => E.intensite * E.duree / 60;
const coefficientSurface = s => s.genre === "cn" ? Noyau.coefficientCN(s.valeur, pluieMm()) : s.valeur;

/** C moyen de ce qui est drainé jusqu'à la cellule i (le C par défaut sans surface dessinée). */
function coefficientEn(i) {
  const a = E.accC, r = E.resultat;
  if (i === undefined || i === null || i < 0 || !a || !r || i >= a.length || !(r.acc[i] > 0)) return E.coefficient;
  return a[i] / r.acc[i];
}

/** Après un changement de la pluie : Montana recalculé, réglages gardés, débits pondérés à jour. */
function pluieModifiee() {
  if (evt.actif) finEvenement(false);
  if (E.modePluie === "montana") {
    const i = Noyau.intensiteMontana(E.montanaA, E.montanaB, Math.max(1, E.duree));
    if (Number.isFinite(i)) E.intensite = i;
  }
  garderReglages();
  enregistrerProjet();
  ruissellementAJour();
  couchesAJour();
  afficherJauges();
  afficher();
}

/** Relance l'accumulation pondérée dans le Worker quand la carte des C change (rien sans surface). */
function ruissellementAJour() {
  if (!E.resultat || !E.surfaces.length) {
    E.sigAccC = null;
    if (E.accC) { E.accC = null; couchesAJour(); }
    return;
  }
  const p = pluieMm();
  const surfaces = E.surfaces.map(s => s.genre === "cn" ? { zone: s.anneaux, cn: s.valeur } : { zone: s.anneaux, c: s.valeur });
  const sig = JSON.stringify([E.idResultat, Math.fround(E.coefficient), surfaces.map(s => [s.zone, Math.fround("c" in s ? s.c : Noyau.coefficientCN(s.cn, p))])]);
  if (sig === E.sigAccC) return;
  // Le Worker a calculé un autre onglet depuis : il lui faut d'abord refaire celui-ci.
  if (E.idResultat !== dernierCalcul) { calculer(); return; }
  E.sigAccC = sig;
  ruissellementEnVol = true;
  travailleur.postMessage({ type: "ruisseler", id: E.idResultat, idR: ++idRuissellement, defaut: E.coefficient, surfaces, pluieMm: p });
}

function commencerSurface() {
  if (aLaMain()) choisirOutil("egaliser");
  E.zoneSurface = [];
  E.saisie = "surface";
  couchesAJour();
  afficher();
}

function terminerSurface(type) {
  if (E.zoneSurface.length < 3) return;
  const [titre, genre, valeur] = type, nom = titre.split(" (")[0];
  const n = E.surfaces.filter(s => s.nom === nom || s.nom.startsWith(nom + " ")).length;
  E.surfaces = [...E.surfaces, { nom: n === 0 ? nom : `${nom} ${n + 1}`, genre, valeur, anneaux: [E.zoneSurface] }];
  E.zoneSurface = [];
  E.saisie = "aucune";
  E.montrerSurfaces = true;
  pluieModifiee();
}

function abandonnerSurface() {
  E.zoneSurface = [];
  if (E.saisie === "surface") E.saisie = "aucune";
  couchesAJour();
  afficher();
}

/** La pluie en une ligne, pour la note d'export (ReglagesPluie.description de l'app Mac). */
function descriptionPluie() {
  let t = E.modePluie === "montana"
    ? `Montana a = ${nombre(E.montanaA, 3)} mm/min, b = ${nombre(E.montanaB, 3)}${E.station ? ` (${E.station})` : ""}, durée ${nombre(E.duree)} min → ${nombre(E.intensite, 1)} mm/h`
    : `${nombre(E.intensite, 1)} mm/h pendant ${nombre(E.duree)} min`;
  t += ` (${nombre(pluieMm(), 1)} mm), C = ${nombre(E.coefficient, 2)}`;
  if (E.surfaces.length) t += " hors surfaces dessinées ; " + E.surfaces.map(s => s.nom + " "
    + (s.genre === "c" ? `C = ${nombre(s.valeur, 2)}` : `CN ${nombre(s.valeur)} → C = ${nombre(coefficientSurface(s), 2)}`)).join(", ");
  return t;
}

// Préréglages (tous MNT, sans les surfaces) et pluie gardée par MNT, dans le navigateur.
const CLE_PREREGLAGES = "simulateur-prereglages-pluie";
const reglagesPluie = () => ({ mode: E.modePluie, intensite: E.intensite, montanaA: E.montanaA, montanaB: E.montanaB,
  duree: E.duree, station: E.station, coefficient: E.coefficient });
function lirePrereglages() {
  try { const p = JSON.parse(localStorage.getItem(CLE_PREREGLAGES) || "[]"); return Array.isArray(p) ? p : []; } catch { return []; }
}
function ecrirePrereglages(p) { try { localStorage.setItem(CLE_PREREGLAGES, JSON.stringify(p)); } catch { /* navigation privée */ } }
function enregistrerPrereglage(nom) {
  const p = lirePrereglages().filter(x => x.nom !== nom);
  p.push({ nom, ...reglagesPluie() });
  p.sort((a, b) => a.nom.localeCompare(b.nom, "fr", { numeric: true }));
  ecrirePrereglages(p);
}
function demanderNomPrereglage() {
  dialogue(`<h3>Enregistrer la pluie de projet</h3><input id="nom-prereglage" class="champ-texte" type="text"
    placeholder="ex. Mâcon T = 10 ans" value="${echapper(E.modePluie === "montana" ? E.station : "")}">`,
    [["Enregistrer", () => { const n = $("nom-prereglage").value.trim(); if (n) enregistrerPrereglage(n); afficher(); }], ["Annuler", () => afficher()]]);
  setTimeout(() => $("nom-prereglage")?.focus(), 0);
}

/** Les réglages d'un préréglage ou d'un projet ; les surfaces seulement si elles y sont. */
function appliquerPluie(p) {
  if (p.mode === "intensite" || p.mode === "montana") E.modePluie = p.mode;
  for (const k of ["intensite", "montanaA", "montanaB", "duree", "coefficient"]) if (Number.isFinite(p[k])) E[k] = p[k];
  if (typeof p.station === "string") E.station = p.station;
  if (Array.isArray(p.surfaces)) E.surfaces = p.surfaces;
  pluieModifiee();
}

function enregistrerProjet() {
  if (!E.cleProjet) return;
  try { localStorage.setItem("simulateur-projet:" + E.cleProjet, JSON.stringify({ ...reglagesPluie(), surfaces: E.surfaces })); } catch { /* plein ou privé */ }
}

/** Au chargement d'un MNT : sa pluie et ses surfaces s'il en a, sinon les derniers réglages, sans surface. */
function chargerProjet() {
  E.accC = null; E.sigAccC = null; E.zoneSurface = []; E.surfaces = [];
  let p = null;
  try { p = E.cleProjet ? JSON.parse(localStorage.getItem("simulateur-projet:" + E.cleProjet) || "null") : null; } catch { p = null; }
  if (p && typeof p === "object") appliquerPluie({ ...p, surfaces: Array.isArray(p.surfaces) ? p.surfaces.filter(surfaceValide) : [] });
}
const surfaceValide = s => s && typeof s.nom === "string" && (s.genre === "c" || s.genre === "cn") && Number.isFinite(s.valeur) && Array.isArray(s.anneaux);

// ---------------------------------------------------------------------------
// Couches et fond
// ---------------------------------------------------------------------------
const indiceFond = () => FONDS.find(f => f[0] === E.fond)[2];
function appliquerFond() { vue.regler({ fond: indiceFond() }); colorationAJour(); }

function traceRemodelage() {
  const t = { zone: [], zoneFermee: false, centre: null, rayons: [], anneaux: [], site: E.site || [] };
  if (!E.resultat) return t;
  // Surfaces de ruissellement (A.2) : celle qu'on dessine, et les autres en contour.
  if (E.saisie === "surface" || E.montrerSurfaces) t.anneaux = E.surfaces.flatMap(s => s.anneaux);
  if (E.saisie === "surface") { t.zone = E.zoneSurface; return t; }
  if (aLaMain()) return t;
  if (E.outil === "egaliser") { if (E.point) { t.centre = E.point; t.rayons = [E.rayon, E.rayon + E.raccord]; } }
  else if (E.portee === "zone") { t.zone = E.zone; t.zoneFermee = E.saisie !== "zone" && E.zone.length >= 3; }
  return t;
}

let minuterieCouches = 0;
function couchesAJour(delai = 0) {
  clearTimeout(minuterieCouches);
  minuterieCouches = setTimeout(() => {
    const r = E.resultat, g = E.grille;
    if (!r || !g) return;
    // Avec des surfaces, la couche des débits suit l'aire drainée pondérée par C.
    const pondere = E.accC && E.accC.length === r.acc.length;
    const s = { ecoulements: E.ecoulements, depressions: E.depressions && !evt.actif, seuilDebit: E.seuilDebit, reseau: E.reseau, ordreMini: E.ordreMini,
                profondeurMini: E.profondeurMini, depressionChoisie: E.depressionChoisie, coefficient: pondere ? 1 : E.coefficient, intensite: E.intensite,
                trace: traceRemodelage() };
    const { img, legende } = Couches.superposition(pondere ? { ...r, acc: E.accC } : r, g, s);
    E.legende = legende;
    vue.couches(s.ecoulements || s.depressions || s.trace.zone.length || s.trace.centre || s.trace.anneaux.length || s.trace.site.length ? img : null);
    afficherLegende();
  }, delai);
}

function colorationAJour() {
  const r = E.resultat, g = E.grille;
  if (!r || !g) return;
  let c = null;
  if (E.fond === "twi") { c = Couches.twi(r, g); E.bornesTWI = c.bornes; }
  else if (E.fond === "ecarts" && E.reference && E.operations.length) {
    const seuil = Math.max(2, E.seuilDebit / Math.max(1e-30, debit(1)));
    c = Couches.ecart(E.ecart, E.reference, E.origine, r, g, seuil);
    E.bornesEcart = c.bornes;
  }
  vue.coloration(c ? c.img : null);
  afficherLegende();
}

// ---------------------------------------------------------------------------
// Remodelage (B.4) : historique annulable rejoué sur le MNT d'origine
// ---------------------------------------------------------------------------
function operationProposee() {
  if (aLaMain()) return { erreur: "Maintenez le clic sur le terrain." };
  let zone = null, nomZone = "";
  if (E.outil !== "egaliser" && E.portee === "zone") {
    if (E.zone.length < 3) return { erreur: "Dessinez la zone : au moins 3 points sur le terrain." };
    zone = [E.zone]; nomZone = "la zone dessinée";
  }
  if (E.outil === "decaler") {
    if (!E.decalage || !Number.isFinite(E.decalage)) return { erreur: "Décalage nul." };
    return { op: { type: "decaler", dz: E.decalage, zone }, nomZone };
  }
  if (E.outil === "niveler") {
    if (!Number.isFinite(E.altitudeFixe)) return { erreur: "Altitude invalide." };
    return { op: { type: "niveler", altitude: E.altitudeFixe, zone }, nomZone };
  }
  if (!E.point) return { erreur: "Choisissez le centre : cliquez sur le terrain." };
  if (!(E.rayon >= 0 && E.raccord >= 0 && E.rayon + E.raccord > 0)) return { erreur: "Rayon et raccord positifs." };
  return { op: { type: "egaliser", x: E.point[0], y: E.point[1], altitude: E.altitudeEgal, rayon: E.rayon, raccord: E.raccord } };
}

function decrire(op) {
  if (op.type === "pinceau") {
    const taille = op.forme === "rectangle" ? `${court(op.longueur)} m × ${court(op.largeur)} m` : court(op.longueur) + " m";
    const r = Math.abs(op.repartition) < 0.05 ? "homogène"
      : `${op.repartition < 0 ? "plus au centre" : "plus sur les bords"} (${nombre(Math.abs(op.repartition) * 100)} %)`;
    const rot = op.forme !== "rond" && op.angle ? `, tourné de ${nombre(op.angle)}°` : "";
    const n = op.touches.length;
    return `${op.volume >= 0 ? "camion" : "aspirateur"} : ${op.volume >= 0 ? "+" : "−"}${volume(Math.abs(op.volume))}, `
      + `${Outils.FORMES.find(f => f[0] === op.forme)[1].toLowerCase()} ${taille}${rot}, ${r}, ${n} touche${n > 1 ? "s" : ""}`;
  }
  const ou = op.zone ? "dans " + (op.nomZone || "la zone dessinée") : "sur tout le MNT";
  if (op.type === "decaler") return (op.dz >= 0 ? "+" : "−") + nombre(Math.abs(op.dz), 2) + " m " + ou;
  if (op.type === "niveler") return "altitude " + nombre(op.altitude, 2) + " m NGF " + ou;
  return `égalisation à ${nombre(op.altitude, 2)} m NGF autour de (${nombre(op.x)} ; ${nombre(op.y)}), rayon ${metres(op.rayon)}, raccord ${metres(op.raccord)}`;
}

/** `differe` : après un passage du camion ou de l'aspirateur, on attend un instant
 * qu'un autre passage ne suive pas avant de relancer l'hydrologie. */
function changerOperations(nouvelles, differe = false) {
  E.historique.push(E.operations);
  E.refaire = [];
  E.operations = nouvelles;
  if (differe) { clearTimeout(minuterieRecalcul); minuterieRecalcul = setTimeout(calculer, DELAI_RECALCUL * 1000); }
  else calculer();
  afficher();
}
function annulerRemodelage() { if (!E.historique.length || E.travail || M.debut) return; E.refaire.push(E.operations); E.operations = E.historique.pop(); calculer(); afficher(); }
function retablirRemodelage() { if (!E.refaire.length || E.travail || M.debut) return; E.historique.push(E.operations); E.operations = E.refaire.pop(); calculer(); afficher(); }

// ---------------------------------------------------------------------------
// Camion et aspirateur (A.7 « Ajout 16/10 ») : peints en direct sur une copie du terrain,
// puis l'opération « pinceau » est rejouée depuis l'origine dans le Web Worker
// ---------------------------------------------------------------------------
const TOUCHES_PAR_SECONDE = 30, DELAI_RECALCUL = 1.2;
/** Le passage en cours : position du curseur dans la vue, cellule visée, début et fin (animation), touches. */
const M = { position: null, client: null, cellule: null, debut: 0, fin: 0, volume: 0, trait: [], minuteur: 0, relance: false };
const aLaMain = () => E.outil === "camion" || E.outil === "aspirateur";
const tailleMaxi = (g = E.grille) => g ? Math.max(20 * g.pas, Math.min(200, Math.min(g.colonnes, g.lignes) * g.pas / 2)) : 50;
const court = v => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: v >= 10 ? 0 : v >= 1 ? 1 : 2 }).format(v);

function choisirOutil(o) {
  finirPassage();
  E.outil = o;
  E.saisie = "aucune";
  modeOutil();
  couchesAJour();
  afficher();
}

/** La vue suit l'outil choisi : clic gauche qui peint, empreinte, animation. */
function modeOutil() {
  const main = aLaMain() && !!E.resultat;
  vue.modePinceau(main);
  if (!main) { M.position = M.cellule = null; }
  apercuAJour();
  animer();
  afficherBulle();
}

function apercuAJour() {
  vue.apercu(aLaMain() && E.resultat && M.cellule !== null ? { cellule: M.cellule, pinceau: E.pinceau, ajout: E.outil === "camion" } : null);
}

/** Curseur à (x, y) dans la fenêtre ; `i` : cellule sous le curseur (déjà cherchée) ou undefined. */
function viser(x, y, i) {
  const r = canvas.getBoundingClientRect();
  M.client = [x, y];
  M.position = { x: x - r.left, y: y - r.top };
  if (i === undefined) i = vue.cellule(x, y);
  // Pendant un passage, on garde la dernière cellule touchée quand le curseur sort du terrain.
  if (i !== null || !M.debut) M.cellule = i;
  apercuAJour();
  animer();
}

function debutPassage() {
  const g = E.grille;
  if (!g || !E.resultat || M.debut) return;
  if (evt.actif) finEvenement();
  // Le calcul en cours (ou en attente) repartira à la fin du passage.
  M.relance = enCalcul || !!minuterieRecalcul;
  clearTimeout(minuterieRecalcul); minuterieRecalcul = 0;
  if (enCalcul) { travailleur.postMessage({ type: "annuler" }); idCalcul++; enCalcul = false; travail(null); }
  // Le MNT d'origine reste intact : on peint sur une copie.
  if (g.z === E.origine.z) { E.grille = { ...g, z: new Float32Array(g.z) }; vue.grille = E.grille; }
  M.trait = []; M.volume = 0; M.debut = performance.now(); M.fin = 0;
  toucherUneFois();
  clearInterval(M.minuteur);
  M.minuteur = setInterval(toucherUneFois, 1000 / TOUCHES_PAR_SECONDE);
  animer();
}

function toucherUneFois() {
  const g = E.grille, i = M.cellule;
  if (!M.debut || !g || i === null || i < 0 || i >= g.z.length) return;
  const x = (g.x0 || 0) + ((i % g.colonnes) + 0.5) * g.pas, y = (g.y0 || 0) - (Math.floor(i / g.colonnes) + 0.5) * g.pas;
  const dz = (E.outil === "camion" ? 1 : -1) * E.debitPinceau / TOUCHES_PAR_SECONDE;
  const r = Outils.toucher(g, x, y, dz, E.pinceau);
  if (!r) return;
  vue.peindre(g, r);
  M.trait.push([x, y, dz]);
  M.volume += r.volume;
}

function finirPassage() {
  clearInterval(M.minuteur); M.minuteur = 0;
  if (!M.debut) return;
  M.debut = 0; M.fin = performance.now();
  animer();
  const trait = M.trait, relance = M.relance;
  M.trait = []; M.relance = false;
  if (!trait.length) { if (relance) calculer(); return; }
  // Les touches successives au même endroit n'en font qu'une (même effet au float32 près).
  const touches = [];
  for (const t of trait) {
    const d = touches[touches.length - 1];
    if (d && d[0] === t[0] && d[1] === t[1]) d[2] += t[2]; else touches.push(t.slice());
  }
  const p = E.pinceau;
  changerOperations([...E.operations, { type: "pinceau", forme: p.forme, longueur: p.longueur, largeur: p.largeur, angle: p.angle,
    repartition: p.repartition, touches, volume: M.volume }], true);
}

// Le camion qui vide sa benne, ou l'aspirateur, suivent la souris (pixels de 2 points, comme sur Mac).
let animation = 0;
function animer() { if (!animation) animation = requestAnimationFrame(dessinerOutilMain); }

function dessinerOutilMain(maintenant) {
  animation = 0;
  const cv = $("outil-main"), dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!aLaMain() || !E.resultat || !M.position) return;
  const t = maintenant / 1000, p = M.position, actif = !!M.debut;
  const bascule = actif ? Math.min(1, (maintenant - M.debut) / 300) : M.fin ? Math.max(0, 1 - (maintenant - M.fin) / 450) : 0;
  if (E.outil === "camion") Outils.camion(ctx, p, 2, bascule, t, actif);
  else Outils.aspirateur(ctx, p, 2, E.pinceau.forme, t, actif);
  if (actif && Math.abs(M.volume) > 0) Outils.pastille(ctx, p, (M.volume >= 0 ? "+" : "−") + volume(Math.abs(M.volume)), E.outil === "camion");
  if (actif || bascule > 0) animer();
}

// ---------------------------------------------------------------------------
// Export (B.4)
// ---------------------------------------------------------------------------
const nomFichier = () => (E.nom || "simulation").replace(/[\\/:*?"<>|\s]+/g, "_");

async function exporterTout() {
  const g = E.grille, r = E.resultat;
  if (!g || !r) return;
  travail("Export des couches", 0.3);
  try {
    const base = nomFichier(), aire = g.pas * g.pas, n = g.z.length, f = [];
    const ajouter = async (nom, valeurs, options) => f.push({ nom: `${base}_simulation/${base}_${nom}`, octets: await geotiff(valeurs, g, options) });
    const map = fn => { const t = new Float32Array(n); for (let i = 0; i < n; i++) t[i] = Number.isNaN(g.z[i]) ? NaN : fn(i); return t; };
    await ajouter("mnt.tif", g.z, { description: E.operations.length ? "MNT remodelé (m NGF)" : "MNT (m NGF)" });
    if (E.operations.length) {
      await ajouter("mnt_origine.tif", E.origine.z, { description: "MNT d'origine (m NGF)" });
      await ajouter("ecart_altitude.tif", map(i => g.z[i] - E.origine.z[i]), { description: "Remblai (+) et déblai (−), en m" });
    }
    await ajouter("surface_drainee_m2.tif", map(i => r.acc[i] * aire), { description: "Surface drainée (m²)" });
    const accC = E.accC && E.accC.length === n ? E.accC : null;
    await ajouter("debit_m3s.tif", map(i => accC ? Noyau.debitPondere(accC[i], g.pas, E.intensite) : debit(r.acc[i])),
      { description: accC ? `Débit de pointe (m³/s), méthode rationnelle, C par surface, i = ${nombre(E.intensite, 2)} mm/h`
                          : `Débit de pointe (m³/s), méthode rationnelle, C = ${E.coefficient}, i = ${nombre(E.intensite, 2)} mm/h` });
    await ajouter("twi.tif", r.twi, { description: "TWI, méthode de SAGA" });
    await ajouter("pente_degres.tif", map(i => Math.atan(r.tanb[i]) * 180 / Math.PI), { description: "Pente (degrés)" });
    await ajouter("hauteur_eau.tif", map(i => r.rempli[i] - g.z[i]), { description: "Hauteur d'eau des dépressions (m)" });
    await ajouter("depressions.tif", r.etiquettes, { nodata: 0, description: "Numéro de dépression" });
    await ajouter("strahler.tif", r.strahler, { nodata: 0, description: "Ordre de Strahler" });
    const enc = new TextEncoder();
    f.push({ nom: `${base}_simulation/${base}_depressions.csv`, octets: enc.encode(csvDepressions(g, r.depressions, E)) });
    f.push({ nom: `${base}_simulation/${base}_lisez-moi.txt`, octets: enc.encode(note()) });
    telecharger(zip(f), `${base}_simulation.zip`);
  } catch (e) { alerte("Export impossible : " + (e.message || e)); }
  travail(null);
}

function note() {
  const g = E.grille, m = E.resultat.methode;
  return `Simulation « ${E.nom} » — exportée le ${new Date().toLocaleDateString("fr-FR")} par le Simulateur (version navigateur)

MNT : ${g.colonnes} × ${g.lignes} cellules de ${g.pas} m, coin nord-ouest ${g.x0} ; ${g.y0}
Système : EPSG:${g.epsg || 2154} (Lambert-93), altitudes NGF-IGN69. NoData des flottants : -99999.

Méthodes (celles de SAGA) : ${m.comblement === "sink_removal" ? "comblement Sink Removal du Basic Terrain Analysis (ε = 0,001 m)" : `remplissage de Wang & Liu (pente minimale ${m.penteMin}°)`} pour l'eau,
remplissage à plat pour les volumes ; accumulation ${m.partage === "mfd" ? "MFD (Freeman 1991, convergence 1,1)" : "D8"} ;
pente de Zevenbergen & Thorne ; TWI = ln(aire spécifique / tan β) ; Strahler sur les directions D8.

Pluie de projet : ${descriptionPluie()}.
Débit = i × Σ (C × aire drainée) (méthode rationnelle ; C d'une surface donnée par son CN :
SCS, pertes initiales 0,2 S, sous la hauteur de pluie de projet) : débit de pointe théorique,
sans laminage. Ce n'est pas un dimensionnement réglementaire.
${E.operations.length ? "\nRemodelage appliqué, dans l'ordre :\n" + E.operations.map(o => "- " + decrire(o)).join("\n") + "\n" : ""}
Données IGN sous Licence ouverte Etalab 2.0.
`;
}

async function exporterImage() {
  const blob = await vue.capturer(2400, 1500);
  telecharger(blob, nomFichier() + "_3D.png");
}

// ---------------------------------------------------------------------------
// Panneau de droite
// ---------------------------------------------------------------------------
const segments = (cle, liste, valeur) => `<div class="segments">${liste.map(([v, t]) =>
  `<button data-segment="${cle}" data-valeur="${v}" class="${v === valeur ? "actif" : ""}">${t}</button>`).join("")}</div>`;
const curseur = (cle, titre, min, max, pas, valeur, texte) => `<div class="curseur"><div class="haut"><span>${titre}</span><span id="t-${cle}">${texte}</span></div>
  <input type="range" data-curseur="${cle}" min="${min}" max="${max}" step="${pas}" value="${valeur}"></div>`;
const champ = (cle, titre, valeur, unite, pas, d = 2) => `<div class="ligne"><span class="etiq">${titre}</span>
  <input type="number" data-nombre="${cle}" value="${Number.isFinite(valeur) ? +valeur.toFixed(d) : ""}" step="${pas}"><span class="petit-texte">${unite}</span></div>`;
const choix = (cle, liste, valeur) => `<select data-choix="${cle}">${liste.map(([v, t]) => `<option value="${v}" ${String(v) === String(valeur) ? "selected" : ""}>${t}</option>`).join("")}</select>`;
const bloc = (titre, contenu) => `<section class="bloc"><h2>${titre}</h2>${contenu}</section>`;

const TEXTES = {
  opacitePhoto: v => nombre(v * 100) + " %",
  exageration: v => "× " + nombre(v, 1),
  opaciteCouches: v => nombre(v * 100) + " %",
  seuilLog: v => debitTexte(Math.pow(10, v)),
  coefficient: v => nombre(v, 2),
  intensite: v => nombre(v) + " mm/h",
  duree: v => `${nombre(v)} min · ${nombre(pluieMm(), 1)} mm`,
};

function afficher() {
  const p = [];
  const g = E.grille, r = E.resultat;
  if (E.ecran === "carte") {
    p.push(blocRecherche(), blocZone());
  } else if (!g) {
    p.push(bloc("MNT", `<p class="petit-texte">Ouvrez ou déposez un MNT (GeoTIFF ou .asc). Le fichier reste sur cet ordinateur.</p>
      <p class="petit-texte">Jusqu'à environ ${nombre(LIMITE / 1e6)} millions de cellules sur ce navigateur (${memoire} Go de mémoire annoncés),
      soit ${surface(LIMITE)} au pas de 1 m ou ${surface(LIMITE / 4)} au pas de 0,5 m.</p>`));
  } else {
    let mini = Infinity, maxi = -Infinity;
    for (const v of g.z) if (!Number.isNaN(v)) { if (v < mini) mini = v; if (v > maxi) maxi = v; }
    p.push(bloc("MNT", `<div class="moyen">${echapper(E.nom)}</div>
      <div class="petit-texte">${E.detail}<br>${nombre(g.colonnes)} × ${nombre(g.lignes)} cellules · pas ${metres(g.pas)}${g.epsg ? " · EPSG:" + g.epsg : ""}<br>
      ${metres(g.colonnes * g.pas)} × ${metres(g.lignes * g.pas)} · ${surface(g.colonnes * g.lignes * g.pas * g.pas)}<br>
      Altitudes ${nombre(mini, 2)} → ${nombre(maxi, 2)} m</div>
      ${E.etatPhoto ? `<div class="petit-texte">${E.etatPhoto}</div>` : ""}
      ${E.remarques.map(t => `<div class="alerte">ⓘ ${echapper(t)}</div>`).join("")}
      ${E.erreur ? `<div class="erreur">${echapper(E.erreur)}</div>` : ""}`));
  }
  if (r && E.ecran === "terrain") {
    p.push(blocAffichage(), blocMethode(), blocPluie(), blocResultats(), blocRemodelage());
    if (E.operations.length) p.push(blocComparaison());
    p.push(bloc("Exporter", `<button class="outil large" data-action="exporter">Couches pour un SIG (.zip)</button>
      <div class="ligne"><button class="outil petit" data-action="csv">Dépressions (.csv)</button><button class="outil petit" data-action="image">Vue 3D (.png)</button></div>
      <div class="tres-petit">MNT${E.operations.length ? " remodelé et d'origine, écart d'altitude" : ""}, surface drainée, débit, TWI, pente, hauteur d'eau,
      dépressions et Strahler en GeoTIFF Lambert-93, le CSV des dépressions et une note des hypothèses.</div>`));
  }
  p.push(`<div class="pied">Altitudes NGF-IGN69, coordonnées Lambert-93. Cartes, photos et altitudes © IGN (Licence ouverte Etalab 2.0) ;
    sols © INRAE, Gis Sol ; géologie © BRGM. Débits théoriques de ruissellement (méthode rationnelle), pas un dimensionnement.</div>`);
  const panneau = $("panneau"), defil = panneau.scrollTop;
  // Le panneau est refait : on rend le focus au même réglage (flèches du clavier sur un curseur, Tab).
  const actif = document.activeElement;
  const focus = actif && actif !== panneau && panneau.contains(actif)
    ? actif.tagName.toLowerCase() + [...actif.attributes].filter(a => a.name.startsWith("data-")).map(a => `[${a.name}="${CSS.escape(a.value)}"]`).join("") : null;
  panneau.innerHTML = p.join("");
  panneau.scrollTop = defil;
  if (focus && focus.includes("[")) panneau.querySelector(focus)?.focus({ preventScroll: true });
  dessinerPanneau();
  afficherLegende();
  afficherBulle();
}

function blocAffichage() {
  const onglets = segments("ongletAffichage", [["terrain", "Terrain"], ["hydrologie", "Hydrologie"], ["etude", "Étude"]], E.ongletAffichage);
  let contenu = "";
  if (E.ongletAffichage === "terrain") {
    const fonds = FONDS.filter(f => f[0] !== "ecarts" || E.operations.length).map(f => [f[0], f[1]]);
    contenu = segments("fond", fonds, E.fond)
      + (E.fond === "photo" && !vue.aUnePhoto ? `<div class="petit-texte">Pas de photo aérienne : coloration par altitude.</div>`
        : E.fond === "photo" ? curseur("opacitePhoto", "Opacité de la photo", 0, 1, 0.05, E.opacitePhoto, TEXTES.opacitePhoto(E.opacitePhoto)) : "")
      + curseur("exageration", "Exagération du relief", 1, 10, 0.5, E.exageration, TEXTES.exageration(E.exageration));
  } else if (E.ongletAffichage === "hydrologie") {
    contenu = blocEvenement() + `<hr><label class="case"><input type="checkbox" data-case="ecoulements" ${E.ecoulements ? "checked" : ""}> Écoulements</label>`
      + (E.ecoulements ? segments("reseau", [["debit", "Débit"], ["strahler", "Strahler"]], E.reseau)
        + (E.reseau === "debit" ? curseur("seuilLog", "Afficher à partir de", -4, 1, 0.1, Math.log10(E.seuilDebit), TEXTES.seuilLog(Math.log10(E.seuilDebit)))
          : champ("ordreMini", "À partir de l'ordre", E.ordreMini, "", 1, 0)
            + `<div class="tres-petit">Ordre de Strahler sur les directions D8, comme le réseau de SAGA (seuil 5 par défaut). Ordre maximal ici : ${E.legende.ordreMax ?? "—"}.</div>`) : "")
      + `<label class="case"><input type="checkbox" data-case="depressions" ${E.depressions ? "checked" : ""}> Dépressions</label>`
      + (E.depressions ? `<div class="ligne"><span class="etiq">Plus profondes que</span>${choix("profondeurMini", [0.01, 0.05, 0.10, 0.20, 0.50, 1].map(v => [v, v < 1 ? nombre(v * 100) + " cm" : "1 m"]), E.profondeurMini)}</div>` : "")
      + (E.ecoulements || E.depressions ? curseur("opaciteCouches", "Opacité des couches", 0.2, 1, 0.05, E.opaciteCouches, TEXTES.opaciteCouches(E.opaciteCouches)) : "");
  } else {
    contenu = enLambert93(E.grille) ? Etude.CALQUES.map(ligneCalque).join("")
      : `<div class="petit-texte">Les calques de l'étude demandent un MNT en Lambert-93.</div>`;
  }
  return bloc("Affichage", onglets + contenu);
}

// ---------------------------------------------------------------------------
// Événement de pluie et jauges (evenement.js) : notre modèle, déroulé dans le temps
// ---------------------------------------------------------------------------
const temps = s => s < 3600 ? `${Math.floor(s / 60)} min ${String(Math.floor(s % 60)).padStart(2, "0")}`
  : `${Math.floor(s / 3600)} h ${String(Math.floor(s % 3600 / 60)).padStart(2, "0")}`;
/** Débit d'une cellule, comme la lecture au curseur et l'export : C par surface s'il y en a. */
const debitCellule = i => E.accC && E.accC.length === E.resultat.acc.length
  ? Noyau.debitPondere(E.accC[i], E.grille.pas, E.intensite) : debit(E.resultat.acc[i]);
const signatureEvenement = () => [E.idResultat, E.intensite, E.duree, E.coefficient, E.sigAccC, !!E.accC, E.seuilDebit, E.profondeurMini].join("|");

/** Prépare l'événement pour la pluie actuelle ; un changement de pluie ou de calcul le refait. */
function preparerEvenement() {
  if (!E.grille || !E.resultat) return false;
  const sig = signatureEvenement();
  if (evt.pret && evt.pret.signature !== sig && evt.actif) finEvenement(false);
  evt.preparer({ g: E.grille, r: E.resultat, signature: sig, intensite: E.intensite, dureeS: E.duree * 60,
    debitDepression: d => debit(d.bassin, d.exutoire), debitCellule, seuil: E.seuilDebit, profondeurMini: E.profondeurMini });
  return true;
}

function finEvenement(redessiner = true) {
  evt.arreter();
  vue.regler({ opaciteCouches: E.opaciteCouches });
  $("bilan-pluie").hidden = true;
  couchesAJour();
  afficherJauges();
  if (redessiner) afficher();
}

function blocEvenement() {
  const T = E.duree * 60, fin = T * 1.2, t = evt.actif ? evt.t : 0;
  const bouton = evt.enMarche ? "❚❚ Pause" : evt.actif && t > 0 && t < fin ? "▶ Reprendre" : "▶ Faire pleuvoir";
  const jauges = E.jauges.map(j => {
    const v = valeursJauge(j);
    return `<div class="ligne jauge"><span class="nom-jauge">${echapper(j.nom)}</span><span class="mono">${nombre(v.profondeur, 2)} m · max ${nombre(v.maxi, 2)} m</span>
      <span class="ressort"></span><button class="supprimer" data-jauge-supprimer="${j.id}" title="Retirer">✕</button></div>`;
  }).join("");
  return `<div class="ligne"><button class="outil principal pluie" data-action="pluie">${bouton}</button>
      <button class="outil" data-action="pluie-arreter" ${evt.actif ? "" : "disabled"} title="Effacer l'eau">↺</button></div>`
    + curseur("tempsEvt", "Temps", 0, fin, fin / 500, t, texteTemps(t))
    + segments("vitessePluie", [[30, "Lente"], [120, "Normale"], [600, "Rapide"]], evt.vitesse)
    + jauges
    + `<button class="outil ${E.saisie === "jauge" ? "actif" : ""}" data-action="poser-jauge">${E.saisie === "jauge" ? "Cliquez sur le terrain…" : "⊕ Poser une jauge"}</button>`;
}
const texteTemps = t => { const T = E.duree * 60; return t <= T ? `${temps(t)} / ${temps(T)}` : `après la pluie (+ ${temps(t - T)})`; };

/** Chaque image de l'événement : bilan, écoulements qui s'éteignent après la pluie, jauges, barre de temps. */
function imageEvenement(e) {
  const d = $("bilan-pluie");
  const pleut = e.t < e.duree;
  d.innerHTML = `<div><b>${pleut ? "Pluie" : "Après la pluie"}</b> ${temps(Math.min(e.t, e.duree))} / ${temps(e.duree)} · ${nombre(e.pluieMm, 1)} mm</div>
    <div>Dépressions pleines ${nombre(e.pleines)} / ${nombre(e.depressions)} · eau retenue ${volume(e.retenu)}</div>`;
  d.hidden = E.ecran !== "terrain";
  vue.regler({ opaciteCouches: E.opaciteCouches * e.facteur });
  afficherJauges();
  const c = document.querySelector('[data-curseur="tempsEvt"]');
  if (c && document.activeElement !== c) c.value = e.t;
  if ($("t-tempsEvt")) $("t-tempsEvt").textContent = texteTemps(e.t);
  const b = document.querySelector('[data-action="pluie"]');
  if (b) b.textContent = e.enMarche ? "❚❚ Pause" : e.t >= e.fin ? "▶ Faire pleuvoir" : "▶ Reprendre";
  // Les valeurs des jauges dans le panneau.
  document.querySelectorAll(".ligne.jauge .mono").forEach((m, k) => {
    const j = E.jauges[k];
    if (j) { const v = valeursJauge(j); m.textContent = `${nombre(v.profondeur, 2)} m · max ${nombre(v.maxi, 2)} m`; }
  });
}

/** Hauteur maintenant, plus haut niveau de l'événement (connu d'avance : le modèle le donne), débit qui passe. */
function valeursJauge(j) {
  if (!preparerEvenement()) return { profondeur: 0, maxi: 0, debit: 0, echelle: 0.5 };
  const g = E.grille, r = E.resultat, t = evt.actif ? evt.t : 0, i = j.cellule;
  const e = r.etiquettes[i], plein = e > 0 ? Math.max(0, r.rempli[i] - g.z[i]) : 0;
  // Dans une dépression qui se remplit, l'eau est au repos : pas de débit qui passe.
  const passe = evt.actif && (e <= 0 || evt.niveauA(e - 1, t)[1]);
  return { profondeur: evt.profondeur(i, t), maxi: evt.profondeur(i, evt.duree), debit: passe ? evt.debitEn(i, t) * evt.facteur() : 0,
           echelle: Math.max(0.5, Math.ceil((plein + 0.05) / 0.5) * 0.5) };
}

function afficherJauges() {
  const zone = $("etiquettes-jauges");
  if (!E.grille || !E.resultat || !E.jauges.length) { vue.jauges([]); zone.innerHTML = ""; return; }
  const valeurs = E.jauges.map(j => ({ j, v: valeursJauge(j) }));
  vue.jauges(valeurs.map(({ j, v }) => ({ cle: j.id, cellule: j.cellule, echelle: v.echelle, profondeur: v.profondeur, maxi: v.maxi })));
  zone.innerHTML = valeurs.map(({ j, v }) => `<div class="etiquette-jauge" data-cle="${j.id}"><b>${echapper(j.nom)}</b>
      <span>${nombre(v.profondeur, 2)} m</span><span class="maxi">max ${nombre(v.maxi, 2)} m</span>${v.debit > 0 ? `<span class="debit">${debitTexte(v.debit)}</span>` : ""}</div>`).join("");
  placerEtiquettes();
}

function placerEtiquettes() {
  const zone = $("etiquettes-jauges");
  zone.hidden = E.ecran !== "terrain";
  if (zone.hidden || !zone.children.length) return;
  const pos = vue.positionsJauges();
  for (const el of zone.children) {
    const p = pos.get(+el.dataset.cle);
    el.hidden = !p;
    if (p) el.style.transform = `translate(${Math.round(p[0])}px, ${Math.round(p[1])}px) translate(-50%, -100%)`;
  }
}
vue.controls.addEventListener("change", placerEtiquettes);
new ResizeObserver(placerEtiquettes).observe($("centre"));

function ligneCalque(c) {
  const actif = E.calques.includes(c.cle), etat = E.etatCalques[c.cle] || {}, d = donneesCalques[c.cle];
  let h = `<div class="calque"><div class="ligne"><label class="case"><input type="checkbox" data-calque="${c.cle}" ${actif ? "checked" : ""}> ${c.titre}</label>
    <span class="ressort"></span>${etat.chargement !== undefined ? `<span class="rouet" title="Chargement"></span>` : ""}</div>`;
  if (etat.chargement) h += `<div class="tres-petit">${echapper(etat.chargement)}</div>`;
  if (etat.echec && !actif) h += `<div class="erreur petit">${echapper(etat.echec)}</div>`;
  if (actif && etat.pret && d) {
    if (c.cle === "sols") h += segments("modeSols", [["dominant", "Sol dominant"], ["numero", "N° d'UCS"], ["liste", "Tous les sols"]], E.modeSols);
    if (c.cle === "historique" && d.vues.length > 1) {
      const v = d.vues[Math.min(E.vueAncienne, d.vues.length - 1)];
      h += curseur("vueAncienne", "Époque", 0, d.vues.length - 1, 1, E.vueAncienne, Etude.libelleVue(v));
    }
    h += curseur("opacite-" + c.cle, "Opacité", 0.1, 1, 0.05, opaciteCalque(c.cle), nombre(opaciteCalque(c.cle) * 100) + " %");
    if (c.cle === "geologie") h += `<div class="tres-petit">Image de la carte harmonisée à 1/50 000 du BRGM.</div>`;
  }
  return h + `</div>`;
}

function blocMethode() {
  return bloc("Méthode de calcul", `<div class="ligne"><span class="etiq">Partage de l'eau</span>${choix("partage", [["mfd", "MFD (SAGA)"], ["d8", "D8"]], E.partage)}</div>
    <div class="tres-petit">${E.partage === "mfd" ? "L'eau se partage entre tous les voisins plus bas (Freeman 1991, convergence 1,1), comme le Basic Terrain Analysis de SAGA." : "Toute l'eau d'une cellule va au voisin le plus pentu."}</div>
    <div class="ligne" title="Wang & Liu : Fill Sinks (ta_preprocessor 4 de SAGA), avec une pente minimale. Sink Removal : celui du Basic Terrain Analysis (ta_preprocessor 2), chaque cuvette relevée jusqu'à son exutoire, plus 0,001 m par cellule de chemin."><span class="etiq">Comblement</span>${choix("comblement", [["wang_liu", "Wang & Liu (défaut)"], ["sink_removal", "Sink Removal (BTA)"]], E.comblement)}</div>`
    + (E.comblement === "sink_removal" ? "" : `<div class="ligne"><span class="etiq">Pente minimale (Wang & Liu)</span>${choix("penteMin", [[0, "0° (à plat)"], [0.01, "0,01°"], [0.1, "0,1°"], [0.5, "0,5°"]], E.penteMin)}</div>
    <div class="tres-petit">Les cuvettes sont comblées avec cette pente pour que l'eau en sorte (0,1° dans SAGA). Les volumes des dépressions restent calculés à plat.</div>`));
}

function blocPluie() {
  const preset = COEFFICIENTS.find(c => Math.abs(c[1] - E.coefficient) < 0.001);
  const pres = lirePrereglages(), n = E.zoneSurface.length;
  const menu = `<select class="menu-pluie" data-choix="prereglage" title="Préréglages de pluie"><option value="">Préréglages</option>
    ${pres.map((p, k) => `<option value="a${k}">${echapper(p.nom)}</option>`).join("")}
    <option value="enregistrer">Enregistrer la pluie actuelle…</option>
    ${pres.length ? `<optgroup label="Supprimer">${pres.map((p, k) => `<option value="s${k}">${echapper(p.nom)}</option>`).join("")}</optgroup>` : ""}</select>`;
  const surfaces = E.surfaces.length ? `<div class="ligne"><span class="etiq">Surfaces</span>
      <label class="case"><input type="checkbox" data-case="montrerSurfaces" ${E.montrerSurfaces ? "checked" : ""}> Contours</label></div>
    ${E.surfaces.map((s, k) => `<div class="ligne surface">
      <input type="text" data-surface-nom="${k}" value="${echapper(s.nom)}">
      <select data-surface-genre="${k}"><option value="c" ${s.genre === "c" ? "selected" : ""}>C</option><option value="cn" ${s.genre === "cn" ? "selected" : ""}>CN</option></select>
      <input type="number" data-surface-valeur="${k}" value="${+s.valeur.toFixed(2)}" step="${s.genre === "c" ? 0.05 : 1}" min="0" max="${s.genre === "c" ? 1 : 100}">
      ${s.genre === "cn" ? `<span class="mono">C ${nombre(coefficientSurface(s), 2)}</span>` : ""}
      <button class="supprimer" data-surface-supprimer="${k}" title="Supprimer">✕</button></div>`).join("")}` : "";
  const saisie = E.saisie === "surface"
    ? `<div class="ligne saisie-surface"><span class="etiq">${n} sommet${n > 1 ? "s" : ""}</span>
        <select data-choix="terminer-surface" ${n < 3 ? "disabled" : ""}><option value="">Terminer</option>
        ${TYPES_SURFACES.map(([t, genre, v], k) => `<option value="${k}">${t} — ${genre === "c" ? "C " + nombre(v, 2) : "CN " + nombre(v)}</option>`).join("")}</select>
        <button class="outil petit" data-action="abandonner-surface">Annuler</button></div>`
    : `<button class="outil" data-action="dessiner-surface">Dessiner une surface</button>`;
  return bloc("Précipitations", `<div class="ligne">${segments("modePluie", [["intensite", "Intensité"], ["montana", "Montana"]], E.modePluie)}${menu}</div>`
    + (E.modePluie === "intensite" ? curseur("intensite", "Intensité", 1, 200, 1, E.intensite, TEXTES.intensite(E.intensite))
      : champ("montanaA", "a", E.montanaA, "mm/min", 0.1, 3) + champ("montanaB", "b", E.montanaB, "", 0.01, 3)
        + `<div class="ligne"><input type="text" class="champ-texte" data-texte="station" value="${echapper(E.station)}" placeholder="Station, période de retour"></div>
        <div class="ligne"><span class="etiq">Intensité</span><span class="mono" id="t-montana">${nombre(E.intensite, 2)} mm/h</span></div>`)
    + curseur("duree", "Durée", 5, 360, 5, E.duree, TEXTES.duree(E.duree))
    + `<div class="ligne"><span class="etiq">${E.surfaces.length ? "C ailleurs" : "Ruissellement C"}</span>${choix("presetC", [["", preset ? "…" : nombre(E.coefficient, 2)], ...COEFFICIENTS.map(([n, c]) => [c, n + " — " + nombre(c, 2)])], preset ? preset[1] : "")}</div>`
    + curseur("coefficient", "", 0.05, 1, 0.05, E.coefficient, TEXTES.coefficient(E.coefficient))
    + surfaces + saisie);
}

function blocResultats() {
  const g = E.grille, r = E.resultat, ex = r.exutoire, deps = depressionsRetenues();
  let valides = 0;
  for (const v of g.z) if (!Number.isNaN(v)) valides++;
  const total = r.durees.reduce((s, d) => s + d[1], 0);
  return bloc("Résultats", (ex ? `<div><div class="tres-petit">Exutoire principal</div><div class="fort">${debitTexte(debit(ex.cellules, ex.cellule))}</div>
      <div class="petit-texte">Bassin de ${surface(ex.cellules * g.pas * g.pas)} · ${nombre(ex.cellules / valides * 100)} % du MNT${E.accC ? " · C moyen " + nombre(coefficientEn(ex.cellule), 2) : ""}</div></div>` : "")
    + `<div><div class="tres-petit">Dépressions de plus de ${nombre(E.profondeurMini * 100)} cm</div>
      <div class="moyen">${deps.length ? deps.length + " · " + volume(deps.reduce((s, d) => s + d.volume, 0)) + " au total" : "Aucune"}</div>
      ${deps.length ? `<div class="tres-petit">Volume d'eau retenu avant débordement. Cliquez une dépression sur le terrain ou dans la liste.</div>` : ""}</div>`
    + (deps.length ? `<div class="liste-dep">${deps.slice(0, 8).map(d => `<button data-depression="${d.id}" class="${E.depressionChoisie === d.id ? "choisi" : ""}">
        <div class="l1"><span class="n">n° ${d.id}</span><b>${volume(d.volume)}</b><span class="petit-texte">· ${nombre(d.profondeur, 2)} m</span></div>
        <div class="l2">${surface(d.surface)} · bassin ${surface(d.bassin * g.pas * g.pas)} · remplie en ${duree(dureeRemplissage(d))}</div></button>`).join("")}</div>` : "")
    + `<div class="tres-petit">Calcul en ${nombre(total, total < 10 ? 1 : 0)} s dans le navigateur : ${r.methode.comblement === "sink_removal" ? "Sink Removal" : "Wang & Liu (" + nombre(r.methode.penteMin, 2) + "°)"}, D8, ${r.methode.partage === "d8" ? "D8" : "MFD"}, Strahler, pente et TWI de SAGA.</div>`);
}

const TEXTES_PINCEAU = {
  longueur: v => `${court(v)} m · ${nombre(Math.round(v / (E.grille?.pas || 1)))} cell.`,
  largeur: v => court(v) + " m",
  angle: v => nombre(v) + "°",
  debit: v => v < 1 ? nombre(v * 100) + " cm/s" : nombre(v, 1) + " m/s",
  repartition: v => Math.abs(v) < 0.05 ? "homogène" : (v < 0 ? "au centre " : "sur les bords ") + nombre(Math.abs(v) * 100) + " %",
};

/** Curseur à l'échelle logarithmique (tailles et débits couvrent plusieurs ordres de grandeur). */
function curseurLog(cle, titre, valeur, mini, maxi) {
  maxi = Math.max(maxi, mini * 1.01);
  const t = Math.log(Math.min(maxi, Math.max(mini, valeur)) / mini) / Math.log(maxi / mini);
  return `<div class="curseur"><div class="haut"><span>${titre}</span><span id="t-p-${cle}">${TEXTES_PINCEAU[cle](valeur)}</span></div>
    <input type="range" data-pinceau="${cle}" data-mini="${mini}" data-maxi="${maxi}" min="0" max="1" step="0.001" value="${t}"></div>`;
}
const curseurPinceau = (cle, titre, min, max, pas, valeur) => `<div class="curseur"><div class="haut"><span>${titre}</span><span id="t-p-${cle}">${TEXTES_PINCEAU[cle](valeur)}</span></div>
  <input type="range" data-pinceau="${cle}" min="${min}" max="${max}" step="${pas}" value="${valeur}"></div>`;

/** Deux chiffres significatifs : des valeurs qu'on peut relire et noter. */
function arrondi(v) {
  if (!(v > 0)) return v;
  const e = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return Math.round(v / e) * e;
}

function tuilesOutils() {
  return `<div class="tuiles">${[["camion", "Camion · ajouter"], ["aspirateur", "Aspirateur · retirer"]].map(([o, t]) => {
    const choisi = E.outil === o;
    return `<button class="tuile ${choisi ? "actif" : ""}" data-outil-main="${o}" title="${choisi ? "Reposer l'outil (Échap)" : o === "camion" ? "Verser de la terre" : "Aspirer la terre"}">
      <canvas data-dessin="tuile-${o}"></canvas><span>${t}</span></button>`;
  }).join("")}</div>`;
}

function reglagesPinceau() {
  const p = E.pinceau, ajout = E.outil === "camion", pas = E.grille.pas, maxi = tailleMaxi();
  return `<div class="petit-texte">${ajout ? "Forme du tas" : "Bout de l'aspirateur"}</div>
    <div class="formes">${Outils.FORMES.map(([f, t]) => `<button class="forme ${p.forme === f ? "actif" : ""}" data-forme="${f}">
      <canvas data-dessin="forme-${f}"></canvas><span>${t}</span></button>`).join("")}</div>`
    + curseurLog("longueur", Outils.MESURES[p.forme], p.longueur, pas, maxi)
    + (p.forme === "rectangle" ? curseurLog("largeur", "Largeur", p.largeur, pas, maxi) : "")
    + (p.forme !== "rond" ? curseurPinceau("angle", "Orientation", 0, 180, 5, p.angle) : "")
    + curseurLog("debit", ajout ? "Débit" : "Puissance", E.debitPinceau, 0.01, 2)
    + curseurPinceau("repartition", "Répartition", -1, 1, 0.05, p.repartition)
    + `<div class="graduation"><span>au centre</span><span>homogène</span><span>sur les bords</span></div>
    <canvas class="coupe" data-dessin="coupe" title="${ajout ? "Coupe du tas versé d'un coup" : "Coupe du trou aspiré d'un coup"}"></canvas>`;
}

/** Les petits dessins du panneau (tuiles, formes, coupe), refaits à chaque affichage. */
function dessinerPanneau() {
  const dpr = window.devicePixelRatio || 1, ajout = E.outil === "camion", p = E.pinceau;
  for (const cv of $("panneau").querySelectorAll("canvas[data-dessin]")) {
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const [genre, quoi] = cv.dataset.dessin.split("-");
    if (genre === "tuile" && quoi === "camion") Outils.camion(ctx, { x: w / 2 + 14, y: h - 6 }, 1.5, 0, 0, false);
    else if (genre === "tuile") Outils.aspirateur(ctx, { x: w / 2 + 16, y: h - 6 }, 1.5, p.forme, 0, false);
    else if (genre === "forme" && ajout) Outils.empreinte(ctx, { x: w / 2, y: h / 2 }, 9, 2.4, quoi, p.repartition, true);
    else if (genre === "forme") Outils.bec(ctx, quoi, w / 2, h / 2, 2.5);
    else if (genre === "coupe") Outils.coupe(ctx, w, h, p, ajout);
  }
}

// Panneau dessiné pendant que la page était cachée (largeur nulle) : on redessine quand il prend sa taille.
new ResizeObserver(() => dessinerPanneau()).observe($("panneau"));

function blocRemodelage() {
  let outil = "";
  if (aLaMain()) outil = reglagesPinceau();
  else if (E.outil === "decaler") outil = champ("decalage", "Décalage", E.decalage, "m", 0.1) + `<div class="tres-petit">Monte (+) ou descend (−) le terrain de la même hauteur.</div>` + blocPortee();
  else if (E.outil === "niveler") outil = champ("altitudeFixe", "Altitude fixe", E.altitudeFixe, "m NGF", 0.5) + `<div class="tres-petit">Met le terrain à cette altitude (plateforme, remblai ou déblai).</div>` + blocPortee();
  else outil = `<div class="ligne"><span class="${E.point ? "mono" : "etiq"}">${E.point ? `Centre X ${nombre(E.point[0])} · Y ${nombre(E.point[1])}` : "Aucun centre choisi"}</span><span class="ressort"></span>
      <button class="outil petit" data-action="choisir-point">${E.saisie === "point" ? "Cliquez le terrain…" : E.point ? "Changer" : "Choisir"}</button></div>`
    + champ("altitudeEgal", "Altitude", E.altitudeEgal, "m NGF", 0.1) + champ("rayon", "Rayon nivelé", E.rayon, "m", 1, 1) + champ("raccord", "Raccord", E.raccord, "m", 1, 1)
    + `<div class="tres-petit">Le disque (trait jaune) est mis à l'altitude choisie ; au-delà, le terrain rejoint l'existant progressivement jusqu'au cercle blanc (raccord en cosinus).</div>`;
  const prop = operationProposee();
  return bloc("Remodelage du terrain", tuilesOutils() + segments("outil", [["decaler", "± X m"], ["niveler", "Altitude"], ["egaliser", "Égaliser"]], E.outil) + outil
    + (aLaMain() ? "" : `<button class="outil principal large" data-action="appliquer" ${prop.erreur || E.travail ? "disabled" : ""}>⚒ Appliquer et recalculer</button>`
      + (prop.erreur ? `<div class="petit-texte">${prop.erreur}</div>` : ""))
    + (E.operations.length ? `<ol class="historique">${E.operations.map(o => `<li>${decrire(o)}</li>`).join("")}</ol>` : "")
    + `<div class="ligne"><button class="outil petit" data-action="annuler" ${E.historique.length ? "" : "disabled"} title="Ctrl+Z">↶ Annuler</button>
       <button class="outil petit" data-action="retablir" ${E.refaire.length ? "" : "disabled"} title="Ctrl+Maj+Z">↷ Rétablir</button><span class="ressort"></span>
       <button class="outil petit" data-action="origine" ${E.operations.length ? "" : "disabled"}>Origine</button></div>
     <div class="tres-petit">Le MNT d'origine reste intact : les opérations s'appliquent à une copie, dans l'ordre, et tout est recalculé.</div>`);
}

function blocPortee() {
  return `<div class="ligne">${choix("portee", [["tout", "Tout le MNT"], ["zone", "Zone dessinée"]], E.portee)}</div>`
    + (E.portee === "zone" ? `<div class="ligne"><span class="etiq">${E.zone.length ? E.zone.length + " sommet" + (E.zone.length > 1 ? "s" : "") : "Aucun point"}</span>
      ${E.saisie === "zone" ? `<button class="outil petit" data-action="terminer">Terminer</button>` : `<button class="outil petit" data-action="dessiner">${E.zone.length ? "Redessiner" : "Dessiner"}</button>`}
      ${E.zone.length ? `<button class="outil petit" data-action="effacer-zone">Effacer</button>` : ""}</div>` : "");
}

function blocComparaison() {
  const c = E.comparaison;
  if (!c) return bloc("Comparaison avec l'état initial", `<div class="petit-texte">Calcul en cours…</div>`);
  const da = retenues(c.depAvant), dp = retenues(c.depApres);
  const rangee = (t, a, b) => `<tr><td>${t}</td><td>${a}</td><td class="${a === b ? "" : "change"}">${b}</td></tr>`;
  let deplace = "";
  if (c.exutoireAvant && c.exutoireApres && c.exutoireAvant.cellule !== c.exutoireApres.cellule) {
    const g = E.grille, pa = c.exutoireAvant.cellule, pb = c.exutoireApres.cellule;
    deplace = `<br>L'exutoire principal s'est déplacé de ${metres(Math.hypot((pa % g.colonnes) - (pb % g.colonnes), Math.floor(pa / g.colonnes) - Math.floor(pb / g.colonnes)) * g.pas)}.`;
  }
  return bloc("Comparaison avec l'état initial", `<table class="comparaison"><tr><th></th><th>Avant</th><th>Après</th></tr>
      ${rangee("Exutoire principal", c.exutoireAvant ? debitTexte(debit(c.exutoireAvant.cellules, c.exutoireAvant.cellule)) : "—", c.exutoireApres ? debitTexte(debit(c.exutoireApres.cellules, c.exutoireApres.cellule)) : "—")}
      ${rangee("Dépressions > " + nombre(E.profondeurMini * 100) + " cm", String(da.nombre), String(dp.nombre))}
      ${rangee("Volume retenu", volume(da.volume), volume(dp.volume))}
      ${rangee("TWI moyen", nombre(c.twiAvant, 2), nombre(c.twiApres, 2))}</table><hr>
    <div><div class="moyen" style="font-size:11.5px">Remblai ${volume(c.remblai)} · déblai ${volume(c.deblai)}</div>
    <div class="petit-texte">Bilan ${c.remblai >= c.deblai ? "+" : "−"}${volume(Math.abs(c.remblai - c.deblai))} sur ${surface(c.surfaceModifiee)} modifiés${deplace}<br>
    TWI : ${surface(c.plusHumide)} plus humides, ${surface(c.plusSec)} plus secs (écart de plus de 1).</div></div><hr>
    <div class="ligne">${choix("ecart", Object.entries(Couches.ECARTS).map(([k, v]) => [k, v.titre]), E.ecart)}<span class="ressort"></span>
    <button class="outil petit" data-action="voir-ecarts" ${E.fond === "ecarts" ? "disabled" : ""}>Voir la carte</button></div>`);
}

// Événements du panneau, par délégation.
$("panneau").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.lieu) { const l = E.lieux[+b.dataset.lieu]; if (l) carte.aller(l.lat, l.lon, l.demi); return; }
  if (b.dataset.segment) {
    const cle = b.dataset.segment, v = b.dataset.valeur;
    if (cle === "source") { E.source = v; garderReglages(); afficher(); return; }
    if (cle === "modeSols") { E.modeSols = v; garderReglages(); calquesAJour(); afficher(); return; }
    if (cle === "ongletAffichage") { E.ongletAffichage = v; garderReglages(); afficher(); return; }
    if (cle === "vitessePluie") { evt.vitesse = +v; afficher(); return; }
    E[cle] = v;
    if (cle === "fond") appliquerFond();
    if (cle === "reseau") { garderReglages(); couchesAJour(); }
    if (cle === "outil") { choisirOutil(v); return; }
    if (cle === "modePluie") { pluieModifiee(); return; }
    afficher();
    return;
  }
  if (b.dataset.outilMain) { choisirOutil(E.outil === b.dataset.outilMain ? "egaliser" : b.dataset.outilMain); return; }
  if (b.dataset.forme) { E.pinceau.forme = b.dataset.forme; garderReglages(); apercuAJour(); afficher(); return; }
  if (b.dataset.depression) { montrerDepression(+b.dataset.depression); return; }
  if (b.dataset.jaugeSupprimer) { E.jauges = E.jauges.filter(j => j.id !== +b.dataset.jaugeSupprimer); afficherJauges(); afficher(); return; }
  if (b.dataset.surfaceSupprimer) { E.surfaces = E.surfaces.filter((_, k) => k !== +b.dataset.surfaceSupprimer); pluieModifiee(); return; }
  const a = b.dataset.action;
  if (a === "appliquer") { const p = operationProposee(); if (p.op) { p.op.nomZone = p.nomZone; E.saisie = "aucune"; changerOperations([...E.operations, p.op]); } }
  else if (a === "annuler") annulerRemodelage();
  else if (a === "retablir") retablirRemodelage();
  else if (a === "origine") { if (E.operations.length && !E.travail) changerOperations([]); }
  else if (a === "choisir-point") { E.saisie = E.saisie === "point" ? "aucune" : "point"; afficher(); }
  else if (a === "dessiner") { E.zone = []; E.saisie = "zone"; couchesAJour(); afficher(); }
  else if (a === "terminer") { E.saisie = "aucune"; couchesAJour(); afficher(); }
  else if (a === "effacer-zone") { E.zone = []; E.saisie = "aucune"; couchesAJour(); afficher(); }
  else if (a === "dessiner-surface") commencerSurface();
  else if (a === "abandonner-surface") abandonnerSurface();
  else if (a === "voir-ecarts") { E.fond = "ecarts"; appliquerFond(); afficher(); }
  else if (a === "pluie") {
    if (evt.enMarche) evt.pause();
    else if (preparerEvenement()) { finirPassage(); const neuf = !evt.actif; evt.lancer(); if (neuf) couchesAJour(); }
    afficher();
  }
  else if (a === "pluie-arreter") finEvenement();
  else if (a === "poser-jauge") { E.saisie = E.saisie === "jauge" ? "aucune" : "jauge"; afficher(); }
  else if (a === "exporter") exporterTout();
  else if (a === "csv") telecharger(new Blob([csvDepressions(E.grille, E.resultat.depressions, E)], { type: "text/csv" }), nomFichier() + "_depressions.csv");
  else if (a === "image") exporterImage();
  else if (a === "tracer") { carte.trace(carte.modeTrace === b.dataset.mode ? false : b.dataset.mode); afficher(); }
  else if (a === "trace-retirer") carte.retirer();
  else if (a === "trace-fermer") carte.fermer();
  else if (a === "arreter-zone") { telechargement?.abort(); }
  else if (a === "effacer-zone-site") { controleInfos?.abort(); E.zoneSite = null; E.emprise = null; E.infosZone = null; carte.trace(false); carte.dessinerSite(null); afficher(); }
  else if (a === "recentrer") { const z = etendue(); if (z) carte.cadrer(z); }
  else if (a === "charger-zone") telechargerZone();
  else if (a === "chercher") chercher();
  else if (a === "exemple") ouvrirExemple();
});

$("panneau").addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.texte === "recherche") {
    E.recherche = t.value;
    if (!t.value.trim() && (E.lieux.length || E.erreurCarte)) { E.lieux = []; E.erreurCarte = null; afficher(); }
    return;
  }
  if (t.dataset.pinceau) {
    const cle = t.dataset.pinceau;
    let v = parseFloat(t.value);
    if (t.dataset.mini) {
      const a = +t.dataset.mini, b = +t.dataset.maxi;
      v = Math.min(b, Math.max(a, arrondi(a * Math.pow(b / a, v))));
    }
    if (cle === "debit") E.debitPinceau = v; else E.pinceau[cle] = v;
    $("t-p-" + cle).textContent = TEXTES_PINCEAU[cle](v);
    dessinerPanneau();
    apercuAJour();
    return;
  }
  const cle = t.dataset.curseur;
  if (!cle) return;
  const v = parseFloat(t.value);
  if (cle.startsWith("opacite-")) {
    E.opaciteCalques[cle.slice(8)] = v;
    $("t-" + cle).textContent = nombre(v * 100) + " %";
    calquesAJour(60);
    return;
  }
  if (cle === "tempsEvt") {
    if (preparerEvenement()) { const neuf = !evt.actif; evt.aller(v); if (neuf) { couchesAJour(); afficherLegende(); } }
    return;
  }
  if (cle === "vueAncienne") {
    const d = donneesCalques.historique;
    E.vueAncienne = Math.round(v);
    if (d) $("t-" + cle).textContent = Etude.libelleVue(d.vues[Math.min(E.vueAncienne, d.vues.length - 1)]);
    calquesAJour(30);
    afficherLegende();
    return;
  }
  if (cle === "intensite" || cle === "duree") {
    E[cle] = v;
    if (E.modePluie === "montana") { E.intensite = Noyau.intensiteMontana(E.montanaA, E.montanaB, Math.max(1, E.duree)); if ($("t-montana")) $("t-montana").textContent = nombre(E.intensite, 2) + " mm/h"; }
  }
  $("t-" + cle).textContent = TEXTES[cle](v);
  if (cle === "intensite" || cle === "duree") couchesAJour(150);
  else if (cle === "seuilLog") { E.seuilDebit = Math.pow(10, v); couchesAJour(150); }
  else if (cle === "coefficient") { E.coefficient = v; couchesAJour(150); }
  else { E[cle] = v; vue.regler({ [cle]: v }); if (cle === "exageration") afficherJauges(); }
});

$("panneau").addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.pinceau) { garderReglages(); return; }
  if (t.dataset.curseur) {
    if (["coefficient", "intensite", "duree"].includes(t.dataset.curseur)) pluieModifiee();
    else if (t.dataset.curseur === "seuilLog") { garderReglages(); afficher(); }
    return;
  }
  if (t.dataset.calque) {
    const c = t.dataset.calque;
    E.calques = t.checked ? [...E.calques.filter(x => x !== c), c] : E.calques.filter(x => x !== c);
    if (t.checked && !E.etatCalques[c]?.pret) chargerCalque(c);
    else if (!t.checked && E.etatCalques[c]?.chargement !== undefined) { controleurs[c]?.abort(); delete E.etatCalques[c]; }
    calquesAJour();
    afficher();
    return;
  }
  if (t.dataset.texte === "recherche") { E.recherche = t.value; return; }
  if (t.dataset.case) { E[t.dataset.case] = t.checked; if (t.dataset.case === "montrerSurfaces") garderReglages(); couchesAJour(); afficher(); return; }
  if (t.dataset.texte === "station") { E.station = t.value.trim(); pluieModifiee(); return; }
  if (t.dataset.surfaceNom || t.dataset.surfaceGenre || t.dataset.surfaceValeur) {
    const k = +(t.dataset.surfaceNom || t.dataset.surfaceGenre || t.dataset.surfaceValeur), s = E.surfaces[k];
    if (!s) return;
    const m = { ...s };
    if (t.dataset.surfaceNom !== undefined) m.nom = t.value.trim() || s.nom;
    else if (t.dataset.surfaceGenre !== undefined) {
      m.genre = t.value;
      // Valeur de départ du nouveau genre : un CN pour un C, un C pour un CN.
      if (m.genre !== s.genre) m.valeur = m.genre === "cn" ? 70 : +coefficientSurface(s).toFixed(2);
    } else {
      const v = parseFloat(t.value.replace(",", "."));
      if (Number.isFinite(v)) m.valeur = Math.min(m.genre === "c" ? 1 : 100, Math.max(0, v));
    }
    E.surfaces = E.surfaces.map((x, j) => j === k ? m : x);
    pluieModifiee();
    return;
  }
  if (t.dataset.nombre) {
    const cle = t.dataset.nombre, v = parseFloat(t.value.replace(",", "."));
    if (!Number.isFinite(v)) { afficher(); return; }
    E[cle] = cle === "ordreMini" ? Math.max(1, Math.min(15, Math.round(v))) : cle === "intensite" ? Math.max(1, Math.min(300, v)) : v;
    if (["montanaA", "montanaB"].includes(cle)) { pluieModifiee(); return; }
    if (["intensite", "ordreMini"].includes(cle)) { garderReglages(); couchesAJour(); }
    if (["rayon", "raccord"].includes(cle)) couchesAJour();
    afficher();
    return;
  }
  if (t.dataset.choix) {
    const cle = t.dataset.choix, v = t.value;
    if (cle === "presetC") { if (v) { E.coefficient = parseFloat(v); pluieModifiee(); return; } }
    else if (cle === "prereglage") {
      const pres = lirePrereglages(), k = +v.slice(1);
      if (v === "enregistrer") { demanderNomPrereglage(); return; }
      if (v[0] === "a" && pres[k]) { appliquerPluie({ ...pres[k], surfaces: undefined }); return; }
      if (v[0] === "s" && pres[k]) ecrirePrereglages(pres.filter((_, j) => j !== k));
    }
    else if (cle === "terminer-surface") { if (v !== "" && TYPES_SURFACES[+v]) { terminerSurface(TYPES_SURFACES[+v]); return; } }
    else if (cle === "partage" || cle === "comblement" || cle === "penteMin") {
      E[cle] = cle === "penteMin" ? parseFloat(v) : v;
      garderReglages();
      if (E.operations.length) E.reference = null;
      calculer();
    } else if (cle === "profondeurMini") { E.profondeurMini = parseFloat(v); garderReglages(); couchesAJour(); }
    else if (cle === "ecart") { E.ecart = v; colorationAJour(); }
    else if (cle === "pasMNT") { E.pasMNT = parseFloat(v); garderReglages(); }
    else if (cle === "portee") { E.portee = v; E.saisie = "aucune"; couchesAJour(); }
    afficher();
  }
});

// ---------------------------------------------------------------------------
// Légende, lecture au curseur, bulles, progression
// ---------------------------------------------------------------------------
function entree(titre, palette, bas, haut) {
  return `<div><div class="legende-titre">${titre}</div><div class="degrade" style="background:${palette.css()}"></div>
    <div class="bornes"><span>${bas}</span><span>${haut}</span></div></div>`;
}

function afficherLegende() {
  const l = $("legende");
  if (!E.resultat || E.ecran !== "terrain") { l.hidden = true; return; }
  const t = [], P = Couches.PALETTES;
  if (E.fond === "twi") t.push(entree("TWI (indice d'humidité)", P.twi, nombre(E.bornesTWI[0], 1) + " sec", "humide " + nombre(E.bornesTWI[1], 1)));
  else if (E.fond === "altitudes") t.push(entree("Altitude NGF", P.altitude, nombre(vue.hmin, 1) + " m", nombre(vue.hmax, 1) + " m"));
  else if (E.fond === "ecarts" && E.operations.length) {
    const [a, b] = E.bornesEcart, pal = Couches.ECARTS[E.ecart].palette;
    if (E.ecart === "altitude") t.push(entree("Remblai (+) / déblai (−)", pal, nombre(a, 2) + " m", "+" + nombre(b, 2) + " m"));
    else if (E.ecart === "debit") t.push(entree("Débit après / avant", pal, "÷ " + nombre(Math.pow(10, b), b < 1 ? 1 : 0), "× " + nombre(Math.pow(10, b), b < 1 ? 1 : 0)));
    else t.push(entree("Écart de TWI", pal, nombre(a, 1) + " plus sec", "plus humide +" + nombre(b, 1)));
  }
  const L = E.legende;
  if (E.ecoulements && E.reseau === "strahler" && L.ordreMax >= E.ordreMini) t.push(entree("Réseau (ordre de Strahler)", P.ecoulement, "ordre " + E.ordreMini, "ordre " + L.ordreMax));
  else if (E.ecoulements && E.reseau === "debit" && L.debitMax > 0) t.push(entree("Écoulements (débit)", P.ecoulement, debitTexte(E.seuilDebit), debitTexte(L.debitMax)));
  if (E.depressions && L.depressionsAffichees > 0) t.push(entree("Dépressions (hauteur d'eau)", P.profondeur, metres(E.profondeurMini), nombre(L.profondeurMax, 2) + " m"));
  if (evt.actif) t.push(entree("Eau des dépressions (événement)", { css: () => "linear-gradient(90deg, rgb(128, 199, 250), rgb(15, 66, 153))" }, "quelques mm", "40 cm et plus"));
  t.push(...legendeCalques());
  l.innerHTML = t.join("");
  l.hidden = t.length === 0;
}

function lire(i) {
  const g = E.grille, r = E.resultat;
  if (!g || !r || i === null || i < 0 || Number.isNaN(g.z[i])) return null;
  const e = r.etiquettes[i];
  const l = { i, x: g.x0 + ((i % g.colonnes) + 0.5) * g.pas, y: g.y0 - (Math.floor(i / g.colonnes) + 0.5) * g.pas, z: g.z[i],
    pente: Math.atan(r.tanb[i]) * 180 / Math.PI, acc: r.acc[i], twi: r.twi[i], strahler: r.strahler[i],
    dep: e > 0 ? r.depressions[e - 1] : null, eau: r.rempli[i] - g.z[i] };
  if (E.operations.length && E.reference) { l.dz = g.z[i] - E.origine.z[i]; l.accAvant = E.reference.acc[i]; l.twiAvant = E.reference.twi[i]; }
  return l;
}

function afficherLecture() {
  const l = E.lecture, d = $("lecture");
  if (!l) { d.hidden = true; return; }
  const g = E.grille, aire = g.pas * g.pas, lignes = [];
  const ligne = (a, b) => lignes.push(`<tr><td>${a}</td><td>${b}</td></tr>`);
  ligne("Altitude", nombre(l.z, 2) + " m NGF");
  if (l.dz) ligne(l.dz > 0 ? "Remblai" : "Déblai", `${nombre(Math.abs(l.dz), 2)} m (avant ${nombre(l.z - l.dz, 2)} m)`);
  ligne("Pente", `${nombre(l.pente, 1)}° (${nombre(Math.tan(l.pente * Math.PI / 180) * 100, 1)} %)`);
  if (l.dep && l.dep.profondeur >= E.profondeurMini) {
    ligne("Dépression n° " + l.dep.id, `${nombre(l.eau, 2)} m d'eau ici, ${nombre(l.dep.profondeur, 2)} m au plus`);
    ligne("Volume retenu", `${volume(l.dep.volume)} sur ${surface(l.dep.surface)}`);
    ligne("Bassin versant", `${surface(l.dep.bassin * aire)} · ${debitTexte(debit(l.dep.bassin, l.dep.exutoire))}`);
    ligne("Remplie en", `${duree(dureeRemplissage(l.dep))} de pluie à ${nombre(E.intensite)} mm/h`);
  } else {
    ligne("Surface drainée", surface(l.acc * aire));
    ligne("Débit", debitTexte(debit(l.acc, l.i)) + (l.accAvant !== undefined && Math.abs(l.accAvant - l.acc) > 0.5 ? ` (avant ${debitTexte(debit(l.accAvant, l.i))})` : ""));
    if (E.accC) ligne("C moyen", nombre(coefficientEn(l.i), 2));
    ligne("TWI", nombre(l.twi, 1) + (l.twiAvant !== undefined && Math.abs(l.twiAvant - l.twi) >= 0.05 ? ` (avant ${nombre(l.twiAvant, 1)})` : ""));
    ligne("Ordre de Strahler", String(l.strahler));
  }
  if (E.calques.includes("sols") && donneesCalques.sols) {
    const s = Etude.solEn(donneesCalques.sols, l.x, l.y);
    if (s) ligne(s.ucs ? "Sol (UCS " + s.ucs + ")" : "Sol", s.texte);
  }
  d.innerHTML = `<div class="mono">X ${nombre(l.x)} · Y ${nombre(l.y)}</div><table>${lignes.join("")}</table>`;
  d.hidden = false;
}

function afficherBulle() {
  const b = $("bulle");
  if (E.ecran === "carte") {
    b.hidden = carte.modeTrace !== "polygone";
    b.textContent = carte.points.length >= 3 ? "Double-clic, Entrée ou clic sur le sommet 1 pour fermer · ⌫ : retirer le dernier · Échap : abandonner"
      : "Cliquez les sommets du site · glisser : déplacer la carte · Échap : abandonner";
    return;
  }
  if (E.saisie === "surface") { b.textContent = `Surface : ${E.zoneSurface.length} sommet${E.zoneSurface.length > 1 ? "s" : ""} · « Terminer » dans le panneau`; b.hidden = false; }
  else if (E.saisie === "zone") { b.textContent = `Cliquez sur le terrain pour poser les sommets de la zone (${E.zone.length} posés) · « Terminer » dans le panneau`; b.hidden = false; }
  else if (E.saisie === "point") { b.textContent = "Cliquez sur le terrain pour choisir le centre de l'égalisation"; b.hidden = false; }
  else if (E.saisie === "jauge") { b.textContent = "Cliquez sur le terrain pour poser la jauge · Échap : annuler"; b.hidden = false; }
  else if (aLaMain() && E.resultat) {
    b.textContent = E.outil === "camion" ? "Camion : maintenez le clic sur le terrain pour verser de la terre" : "Aspirateur : maintenez le clic sur le terrain pour aspirer la terre";
    b.hidden = false;
  }
  else b.hidden = true;
  const main = aLaMain() && !!E.resultat;
  $("vue3d").style.cursor = E.saisie !== "aucune" || main ? "crosshair" : "";
  $("aide").textContent = main
    ? `Clic maintenu : ${E.outil === "camion" ? "verser" : "aspirer"} · clic droit : tourner · deux doigts : déplacer · pincer : zoomer · Échap : reposer l'outil`
    : "Glisser : tourner · deux doigts ou clic droit : déplacer · pincer : zoomer · double-clic : s'approcher · 0 : vue d'ensemble";
}

function travail(etape, fraction = 0) {
  E.travail = etape ? { etape, fraction } : null;
  $("voile").hidden = !etape;
  if (etape) { $("etape").textContent = etape; $("progres").value = fraction; }
  document.querySelectorAll('[data-action="appliquer"]').forEach(b => b.disabled = !!etape || !!operationProposee().erreur);
}

function alerte(t) { dialogue(`<h3>Simulateur</h3><p>${echapper(t)}</p>`, [["OK", () => {}]]); }

function dialogue(html, boutons) {
  const d = $("dialogue"), c = $("dialogue-contenu");
  c.innerHTML = html + `<div class="choix">${boutons.map((b, k) => `<button class="outil ${k === 0 ? "principal" : ""}" data-k="${k}">${b[0]}</button>`).join("")}</div>`;
  d.hidden = false;
  c.querySelectorAll("button").forEach(b => b.onclick = () => { d.hidden = true; boutons[+b.dataset.k][1](); });
}

function montrerDepression(id) {
  const d = E.resultat?.depressions[id - 1];
  if (!d) return;
  E.depressionChoisie = id;
  vue.approcher(d.cellulePlusProfonde, 1);
  const dist = vue.camera.position.distanceTo(vue.controls.target), cote = Math.max(30, Math.sqrt(d.surface) * 4);
  if (dist > cote) vue.approcher(d.cellulePlusProfonde, cote / dist);
  couchesAJour();
  afficher();
}

// ---------------------------------------------------------------------------
// Souris et clavier sur la vue 3D
// ---------------------------------------------------------------------------
const canvas = $("vue3d");
let survol = 0, appui = null, dernier = null;
canvas.addEventListener("pointermove", (e) => {
  dernier = e;
  if (survol || !E.resultat) return;
  survol = requestAnimationFrame(() => {
    survol = 0;
    const i = vue.cellule(dernier.clientX, dernier.clientY);
    E.lecture = lire(i);
    afficherLecture();
    if (aLaMain()) viser(dernier.clientX, dernier.clientY, i);
  });
});
canvas.addEventListener("pointerleave", () => {
  E.lecture = null; afficherLecture();
  if (!M.debut) { M.position = M.cellule = null; apercuAJour(); animer(); }
});
// Camion ou aspirateur en main : le clic gauche peint (capté avant les commandes de la vue) ;
// ⇧ + glisser reste aux commandes de la vue.
$("centre").addEventListener("pointerdown", (e) => {
  if (e.target !== canvas || e.button !== 0 || e.shiftKey || !aLaMain() || !E.resultat) return;
  e.stopPropagation();
  e.preventDefault();
  appui = null;
  try { canvas.setPointerCapture(e.pointerId); } catch { /* pointeur simulé */ }
  viser(e.clientX, e.clientY);
  debutPassage();
}, true);
for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(type, () => { if (M.debut) finirPassage(); });
// La vue bouge (molette, ⇧ + glisser) : la cellule sous le curseur change.
vue.controls.addEventListener("change", () => { if (aLaMain() && M.client && E.resultat) viser(M.client[0], M.client[1]); });
canvas.addEventListener("pointerdown", (e) => { appui = { x: e.clientX, y: e.clientY, t: Date.now(), bouton: e.button }; });
canvas.addEventListener("pointerup", (e) => {
  if (!appui || appui.bouton !== 0 || Math.hypot(e.clientX - appui.x, e.clientY - appui.y) > 4 || Date.now() - appui.t > 500) return;
  const i = vue.cellule(e.clientX, e.clientY), g = E.grille;
  if (E.saisie !== "aucune") {
    if (i === null || !g) return;
    const p = [g.x0 + ((i % g.colonnes) + 0.5) * g.pas, g.y0 - (Math.floor(i / g.colonnes) + 0.5) * g.pas];
    if (E.saisie === "jauge") {
      const n = Math.max(0, ...E.jauges.map(j => j.id)) + 1;
      E.jauges = [...E.jauges, { id: n, nom: "J" + n, cellule: i }];
      E.saisie = "aucune";
      afficherJauges(); afficher();
      return;
    }
    if (E.saisie === "surface") E.zoneSurface = [...E.zoneSurface, p];
    else if (E.saisie === "zone") E.zone = [...E.zone, p];
    else { E.point = p; E.altitudeEgal = Math.round(g.z[i] * 100) / 100; E.saisie = "aucune"; }
    couchesAJour(); afficher();
    return;
  }
  const r = E.resultat;
  if (!r) return;
  const e2 = i !== null ? r.etiquettes[i] : 0;
  const avant = E.depressionChoisie;
  E.depressionChoisie = e2 > 0 && r.depressions[e2 - 1].profondeur >= E.profondeurMini ? e2 : null;
  if (avant !== E.depressionChoisie) { couchesAJour(); afficher(); }
});
canvas.addEventListener("dblclick", (e) => { if (E.saisie !== "aucune" || aLaMain()) return; const i = vue.cellule(e.clientX, e.clientY); if (i !== null) vue.approcher(i, 0.6); });
canvas.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener("keydown", (e) => {
  if (e.target.closest?.("input, select, textarea")) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? retablirRemodelage() : annulerRemodelage(); return; }
  if (e.key === "0" && E.grille) vue.recadrer();
  if (e.key === "Escape" && E.saisie === "surface") abandonnerSurface();
  else if (e.key === "Escape" && E.saisie !== "aucune") { E.saisie = "aucune"; couchesAJour(); afficher(); }
  else if (e.key === "Escape" && aLaMain()) choisirOutil("egaliser");
});

// ---------------------------------------------------------------------------
// Barre du haut, dépôt de fichier, exemple
// ---------------------------------------------------------------------------
$("fichier").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) ouvrir(f); e.target.value = ""; });
$("b-dessus").onclick = () => vue.vueDessus();
$("b-arreter").onclick = () => {
  travailleur.postMessage({ type: "annuler" }); idCalcul++; travail(null);
};
async function ouvrirExemple() {
  try {
    travail("Téléchargement de l'exemple", 0.05);
    const r = await fetch("exemple/exemple.tif");
    if (!r.ok) throw new Error("exemple introuvable");
    const f = new File([await r.blob()], "Exemple LiDAR HD (Grand Paris).tif");
    travail(null);
    ouvrir(f);
  } catch (e) { travail(null); alerte("Exemple indisponible : " + e.message); }
}
let profondeurDepot = 0;
window.addEventListener("dragenter", (e) => { e.preventDefault(); profondeurDepot++; $("zone-depot").hidden = false; });
window.addEventListener("dragleave", () => { if (--profondeurDepot <= 0) { profondeurDepot = 0; $("zone-depot").hidden = true; } });
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  e.preventDefault(); profondeurDepot = 0; $("zone-depot").hidden = true;
  const fs = [...e.dataTransfer.files];
  if (fs.length) ouvrir(fs[0], fs.slice(1));
});

// ---------------------------------------------------------------------------
// Carte : recherche, zone du site, téléchargement du MNT (Panneau.swift de l'app Mac)
// ---------------------------------------------------------------------------
let telechargement = null;
const carte = new Carte($("carte"), {
  // Rectangle tracé (comme avant) : la zone, et 20 m autour, affichés en orange.
  surZone: (r) => {
    if (r) { E.zoneSite = r; E.emprise = null; chargerInfosZone(); }
    dessinerZoneActuelle();
    afficher();
  },
  // Polygone fermé, ou sommet déplacé : c'est le site, le MNT couvrira sa boîte et 20 m autour.
  surSite: (anneau) => {
    E.emprise = { nom: null, anneaux: [anneau], boite: boiteDe([anneau]), trace: true };
    E.zoneSite = E.emprise.boite;
    carte.dessinerSite(E.emprise.anneaux, true);
    chargerInfosZone();
    afficher();
  },
  surTrace: (n) => {
    if (n < 0) dessinerZoneActuelle();
    if (E.ecran === "carte") afficher();
  },
});
carte.fond(E.fondCarte === "photo" ? "photo" : "plan");

/** Le site retenu sur la carte : polygone (tracé ou importé) ou rectangle et sa marge. */
function dessinerZoneActuelle() {
  if (E.emprise) carte.dessinerSite(E.emprise.anneaux, !!E.emprise.trace);
  else carte.dessinerZone(E.zoneSite ? etendue() : null);
}

function montrerEcran(ecran) {
  E.ecran = ecran;
  $("carte").hidden = ecran !== "carte";
  $("vue3d").hidden = $("outil-main").hidden = ecran !== "terrain";
  $("aide").hidden = ecran !== "terrain" || !E.grille;
  $("lecture").hidden = true;
  $("b-dessus").hidden = ecran !== "terrain" || !E.grille;
  $("bilan-pluie").hidden = ecran !== "terrain" || !evt.actif;
  $("etiquettes-jauges").hidden = ecran !== "terrain";
  barreOnglets();
  if (ecran === "carte") setTimeout(() => carte.redimensionner(), 0);
  else { carte.trace(false); vue.redimensionner(); }
  afficher();
}

/** Étendue téléchargée : la zone tracée (ou la boîte de l'emprise) agrandie de la marge. */
// Un polygone est découpé tel quel (sa boîte suffit) ; un rectangle prend 20 m de marge.
const etendue = () => !E.zoneSite ? null : E.emprise ? E.zoneSite : agrandi(E.zoneSite, MARGE);
const planActuel = () => { const z = etendue(); return z ? planMNT(z, E.source, E.pasMNT) : null; };
function probleme(p) {
  if (!p) return null;
  const n = p.colonnes * p.lignes;
  if (n > LIMITE) return `Zone trop grande pour ce pas : ${nombre(n / 1e6, 1)} millions de cellules, ce navigateur en traite environ ${nombre(LIMITE / 1e6)}. Augmentez le pas ou réduisez la zone.`;
  if (Math.max(p.colonnes, p.lignes) > Math.min(8192, vue.maxTexture)) return "Zone trop allongée pour la carte graphique : augmentez le pas.";
  if (p.octets > 900e6) return "Plus de 900 Mo à télécharger : augmentez le pas ou réduisez la zone.";
  return null;
}

function blocRecherche() {
  return bloc("Rechercher", `<div class="ligne"><input type="search" class="champ-texte" data-texte="recherche" value="${echapper(E.recherche)}"
      placeholder="Commune, adresse, X Y en Lambert-93, lat lon"><button class="outil petit" data-action="chercher">Chercher</button></div>`
    + (E.erreurCarte ? `<div class="erreur">${echapper(E.erreurCarte)}</div>` : "")
    + (E.lieux.length ? `<div class="liste-dep">${E.lieux.map((l, k) => `<button data-lieu="${k}"><div class="l1"><b>${echapper(l.titre)}</b></div>
        <div class="l2">${echapper(l.detail)}</div></button>`).join("")}</div>` : ""));
}

/** Zone du site et MNT à télécharger, en un seul bloc. */
function blocZone() {
  const z = E.zoneSite, e = etendue(), p = planActuel(), pb = probleme(p);
  const h = [];
  const tracer = (mode, texte) => `<button class="outil ${carte.modeTrace === mode ? "actif" : ""}" data-action="tracer" data-mode="${mode}">${texte}</button>`;
  if (carte.modeTrace === "polygone") {
    const n = carte.points.length;
    h.push(`<div class="petit-texte">${n ? `${n} sommet${n > 1 ? "s" : ""} posé${n > 1 ? "s" : ""}` : "Cliquez les sommets du site sur la carte"}</div>
      <div class="ligne"><button class="outil petit" data-action="trace-retirer" ${n ? "" : "disabled"}>Retirer le dernier</button>
      <button class="outil petit" data-action="tracer" data-mode="polygone">Abandonner</button>
      <button class="outil petit principal" data-action="trace-fermer" ${n >= 3 ? "" : "disabled"}>Fermer</button></div>`);
  } else if (!z) {
    h.push(`<div class="ligne">${tracer("rectangle", "▭ Rectangle")}${tracer("polygone", "⬠ Polygone")}</div>`);
  } else {
    const aire = E.emprise ? E.emprise.anneaux.reduce((s, an) => s + Math.abs(an.reduce((q, p, k) => { const r = an[(k + 1) % an.length]; return q + p[0] * r[1] - r[0] * p[1]; }, 0)) / 2, 0) : 0;
    h.push(`<div class="petit-texte">${aire ? `Site ${surface(aire)}`
        : `${metres(e.xmax - e.xmin)} × ${metres(e.ymax - e.ymin)} · ${surface((e.xmax - e.xmin) * (e.ymax - e.ymin))}`}</div>
      <div class="ligne">${tracer("rectangle", "▭ Rectangle")}${tracer("polygone", "⬠ Polygone")}</div>
      <div class="ligne"><button class="outil petit" data-action="recentrer">Recentrer</button><button class="outil petit" data-action="effacer-zone-site">Effacer la zone</button></div>`);
  }
  const bouton = k => `<button data-segment="source" data-valeur="${k}" class="${E.source === k ? "actif" : ""}">${libelleSource(k)}</button>`;
  h.push(`<hr><div class="segments sources">${bouton("lidarHD")}<span class="point-aide" tabindex="0" aria-label="Comment sont calculés les deux MNT">?<span
      class="infobulle" role="tooltip">${infobulleSources()}</span></span>${bouton("rgeAlti")}</div>
    <div class="ligne"><span class="etiq">Résolution</span>${choix("pasMNT", PAS.map(v => [v, metres(v)]), E.pasMNT)}</div>`
    + (p ? `<div class="petit-texte">${nombre(p.colonnes)} × ${nombre(p.lignes)} cellules · ≈ ${nombre(p.octets / 1e6, p.octets < 1e7 ? 1 : 0)} Mo</div>` : "")
    + (pb ? `<div class="alerte">⚠ ${echapper(pb)}</div>` : "")
    + (E.chargementZone
      ? `<div class="progres-zone" id="progres-zone"><div class="piste"><span style="width:${Math.round(Math.max(0.02, E.chargementZone.fraction) * 100)}%"></span></div>
          <div class="ligne"><span class="texte">${echapper(E.chargementZone.etape)}</span><span class="ressort"></span><button class="outil petit" data-action="arreter-zone">Arrêter</button></div></div>`
      : `<button class="outil principal large" data-action="charger-zone" ${!p || pb || E.travail || carte.modeTrace === "polygone" ? "disabled" : ""}>Charger et simuler</button>`));
  if (!z && carte.modeTrace !== "polygone") {
    h.push(`<hr><div class="ligne"><label class="outil">Ouvrir un MNT…<input type="file" data-fichier="mnt" accept=".tif,.tiff,.asc" hidden></label>
      <button class="outil" data-action="exemple">Essayer un exemple</button></div>
      <div class="tres-petit">GeoTIFF ou grille .asc : le fichier reste sur cet ordinateur.</div>`);
  }
  return bloc("Zone du site", h.join(""));
}

/** « LiDAR 2023 », « RGE ALTI 2021 » : l'année des données sur la zone tracée, quand l'IGN l'a donnée. */
function libelleSource(k) {
  const i = E.infosZone;
  if (k === "lidarHD") return !i?.lidar ? "LiDAR" : i.lidar.couvert ? "LiDAR " + i.lidar.annee : "LiDAR : non couvert";
  return i?.rge ? "RGE ALTI " + i.rge.annee : "RGE ALTI";
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const dateLongue = s => { const [a, m, j] = s.split("-").map(Number); return `${j === 1 ? "1er" : j} ${MOIS[m - 1]} ${a}`; };
const minuscule = s => /^[A-ZÉ]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);

/** Le « ? » entre les deux sources : comment chaque MNT est obtenu, puis ce qu'il en est sur la zone. */
function infobulleSources() {
  const i = E.infosZone, l = i?.lidar, r = i?.rge, s = i?.sources;
  let iciL = "", iciR = "";
  if (l) iciL = l.couvert ? (l.debut === l.fin ? `Ici : vol du ${dateLongue(l.debut)}.` : `Ici : vols du ${dateLongue(l.debut)} au ${dateLongue(l.fin)}.`)
    : "Ici : MNT LiDAR HD pas encore publié.";
  const partsR = [];
  if (s?.length) partsR.push(s.map(x => `${minuscule(x.origine)} (${x.resolution}, ${String(x.precision).replace(/Emq/g, "EMQ").replace(/(\d)\.(\d)/g, "$1,$2")})`).join(" ; "));
  if (r) partsR.push(`édition du ${dateLongue(r.date)}`);
  if (partsR.length) iciR = "Ici : " + partsR.join(" ; ") + ".";
  return `<p><b>LiDAR HD</b> — Laser aéroporté, au moins 10 impulsions/m², plusieurs échos par impulsion : une part traverse
    les trouées du feuillage, le sol est donc mesuré sous les arbres (moins densément sous couvert fermé). Nuage classé ; MNT interpolé
    à 0,5 m sur les seuls points sol, eau et virtuels : bâti, végétation et tabliers de ponts exclus. Laser proche infrarouge,
    absorbé par l'eau : surface du plan d'eau, pas le fond. Année : celle du vol.</p>${iciL ? `<p class="ici">${iciL}</p>` : ""}
    <p><b>RGE ALTI</b> — Sources hétérogènes rééchantillonnées à 1 m. Laser aéroporté en zones inondables, sur le littoral et les grands
    massifs forestiers (EMQ < 30 cm). Ailleurs, corrélation stéréoscopique de photographies aériennes d'hiver (EMQ < 70 cm) : surface
    vue, sursol retiré ; sous les grands boisements, sol invisible, altitudes anciennes (BD ALTI). Radar en montagne (5 m, EMQ de 1 à 7 m).
    Eau : surface, sauf les petits fonds littoraux levés au laser topo-bathymétrique. Année : édition départementale.</p>${iciR ? `<p class="ici">${echapper(iciR)}</p>` : ""}`;
}

/** Années et sources de la zone, demandées à l'IGN à chaque nouvelle zone. */
let controleInfos = null;
function chargerInfosZone() {
  controleInfos?.abort();
  E.infosZone = null;
  const z = etendue();
  if (!z) return;
  const ctl = new AbortController();
  controleInfos = ctl;
  infosZone(z, ctl.signal).then(i => {
    if (ctl.signal.aborted) return;
    E.infosZone = i;
    if (E.ecran === "carte") afficher();
  }).catch(() => { /* hors ligne : les sources restent sans année */ });
}

async function chercher() {
  const q = (E.recherche || "").trim();
  if (!q) return;
  E.erreurCarte = null;
  try {
    E.lieux = await rechercher(q);
    if (!E.lieux.length) E.erreurCarte = "Aucun lieu trouvé.";
    else carte.aller(E.lieux[0].lat, E.lieux[0].lon, E.lieux[0].demi);
  } catch (err) { E.erreurCarte = "Recherche impossible : " + err.message; }
  afficher();
}

/** Progression du téléchargement, dans le bloc de la zone (la carte reste visible, le site miroite). */
function progresZone(etape, fraction = 0) {
  E.chargementZone = etape ? { etape, fraction } : null;
  const b = $("progres-zone");
  if (!b) return afficher();
  if (!etape) return afficher();
  b.querySelector("span").style.width = Math.round(Math.max(0.02, fraction) * 100) + "%";
  b.querySelector(".texte").textContent = etape;
}

async function telechargerZone() {
  const z = etendue(), p = planActuel();
  if (!z || probleme(p) || E.travail || E.chargementZone) return;
  const ctl = new AbortController(), site = E.emprise?.anneaux || null;
  telechargement = ctl;
  carte.trace(false);
  progresZone("Altitudes : préparation", 0.01);
  carte.chargement(true);
  try {
    const g = await telechargerMNT(z, E.source, E.pasMNT, (f, t) => progresZone(t, f * 0.95), ctl.signal);
    if (ctl.signal.aborted) throw new Error("arrêté");
    telechargement = null;
    carte.chargement(false);
    progresZone(null);
    let vides = 0;
    for (const v of g.z) if (Number.isNaN(v)) vides++;
    if (vides === g.z.length) { alerte(`Aucune altitude ${SOURCES[E.source].titre} sur cette zone : essayez le RGE ALTI.`); return; }
    const horsSite = site ? decouper(g, site) : 0;
    if (horsSite + vides >= g.z.length) { alerte("Le polygone ne contient aucune cellule du MNT : tracez-le plus grand ou baissez la résolution."); return; }
    const nom = E.emprise?.nom || nomTerrainLibre();
    const cle = ["zone", E.source, E.pasMNT, z.xmin, z.ymin, z.xmax, z.ymax].map(v => typeof v === "number" ? v.toFixed(1) : v).join("|");
    const an = E.source === "lidarHD" ? E.infosZone?.lidar?.annee : E.infosZone?.rge?.annee;
    installer(g, nom, `${SOURCES[E.source].titre}${an ? " " + an : ""}, résolution ${metres(E.pasMNT)} (téléchargé à l'IGN)`, [], cle, site, horsSite);
  } catch (err) {
    telechargement = null;
    carte.chargement(false);
    progresZone(null);
    if (!ctl.signal.aborted) alerte("Téléchargement impossible : " + (err.message || err));
  }
}

async function importerEmprise(fichiers) {
  const shp = fichiers.find(f => /\.shp$/i.test(f.name)), prj = fichiers.find(f => /\.prj$/i.test(f.name));
  if (!shp) { alerte("Choisissez le fichier .shp de l'emprise (et son .prj si possible)."); return; }
  try {
    const em = lireEmprise(await shp.arrayBuffer(), prj ? await prj.text() : "");
    em.nom = shp.name.replace(/\.shp$/i, "");
    E.emprise = em; E.zoneSite = em.boite;
    chargerInfosZone();
    montrerEcran("carte");
    carte.trace(false);
    carte.dessinerSite(em.anneaux, false);
    carte.cadrer(etendue());
    afficher();
  } catch (err) { alerte("Emprise illisible : " + (err.message || err)); }
}
$("fichier-emprise").addEventListener("change", (e) => { const fs = [...e.target.files]; if (fs.length) importerEmprise(fs); e.target.value = ""; });
$("panneau").addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.fichier === "mnt" && t.files[0]) { ouvrir(t.files[0]); t.value = ""; }
});
$("panneau").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.dataset?.texte === "recherche") { E.recherche = e.target.value; chercher(); }
});

// ---------------------------------------------------------------------------
// Calques de l'étude : chargés à la demande, composés en une texture drapée sur le terrain
// ---------------------------------------------------------------------------
const donneesCalques = {}, controleurs = {};
const coteCalques = () => Math.min(3000, vue.maxTexture);
const opaciteCalque = c => E.opaciteCalques[c] ?? Etude.CALQUES.find(x => x.cle === c).opacite;

function reinitialiserCalques() {
  for (const c of Object.keys(controleurs)) controleurs[c].abort();
  for (const c of Object.keys(donneesCalques)) delete donneesCalques[c];
  E.etatCalques = {}; E.vueAncienne = 0;
  vue.calque(null);
}

function chargerCalque(c) {
  const g = E.grille;
  if (!g) return;
  controleurs[c]?.abort();
  const ctl = new AbortController(), origine = E.origine, e = deGrille(g);
  controleurs[c] = ctl;
  E.etatCalques[c] = { chargement: null };
  Etude.charger(c, g, e, coteCalques(), ctl.signal, (t) => {
    if (ctl.signal.aborted) return;
    E.etatCalques[c] = { chargement: t };
    if (E.ecran === "terrain" && E.ongletAffichage === "etude") afficher();
  }).then((d) => {
    if (ctl.signal.aborted || E.origine !== origine) return;
    if (c === "sols") d.legende = Etude.legendeSols(d, e);
    donneesCalques[c] = d;
    E.etatCalques[c] = { pret: true };
    if (c === "historique" && E.vueAncienne >= d.vues.length) E.vueAncienne = d.vues.length - 1;
    calquesAJour();
    afficher();
  }).catch((err) => {
    if (ctl.signal.aborted) return;
    E.etatCalques[c] = { echec: err.message || String(err) };
    E.calques = E.calques.filter(x => x !== c);
    afficher();
  });
  afficher();
}

let minuterieCalques = 0;
function calquesAJour(delai = 0) {
  clearTimeout(minuterieCalques);
  minuterieCalques = setTimeout(() => {
    const g = E.grille;
    if (!g) return;
    const e = deGrille(g), cote = coteCalques(), liste = [];
    // De bas en haut : vue ancienne, géologie, sols, courbes.
    for (const c of ["historique", "geologie", "sols", "courbes"]) {
      const d = donneesCalques[c];
      if (!E.calques.includes(c) || !d) continue;
      const im = c === "sols" ? Etude.dessinerSols(d, e, cote, E.modeSols)
        : c === "historique" ? d.vues[Math.min(E.vueAncienne, d.vues.length - 1)].canvas : d.canvas;
      liste.push({ image: im, opacite: opaciteCalque(c) });
    }
    vue.calque(Etude.composer(liste, e, cote));
    afficherLegende();
  }, delai);
}

function legendeCalques() {
  const t = [];
  const actif = c => E.calques.includes(c) && donneesCalques[c];
  if (actif("historique")) {
    const d = donneesCalques.historique, v = d.vues[Math.min(E.vueAncienne, d.vues.length - 1)];
    t.push(`<div><div class="legende-titre">Vue ancienne : ${echapper(v.libelle)}</div><div class="tres-petit">${echapper(v.source)}</div></div>`);
  }
  if (actif("geologie")) t.push(`<div><div class="legende-titre">Géologie à 1/50 000</div><div class="tres-petit">BRGM, carte harmonisée</div></div>`);
  if (actif("sols")) {
    const l = donneesCalques.sols.legende || [];
    t.push(`<div><div class="legende-titre">Sols (part de la zone)</div>${l.slice(0, 8).map(x =>
      `<div class="cle-leg"><span class="pastille" style="background:${x.couleur}"></span><span>${echapper(x.texte)}</span><span class="part">${x.detail}</span></div>`).join("")}
      ${l.length > 8 ? `<div class="tres-petit">et ${l.length - 8} autre${l.length > 9 ? "s" : ""}</div>` : ""}</div>`);
  }
  if (actif("courbes")) {
    t.push(`<div><div class="legende-titre">Courbes de niveau</div>${donneesCalques.courbes.legende.map(x =>
      `<div class="cle-leg"><span class="trait${x.epais ? " epais" : ""}"></span><span>${echapper(x.texte)}</span></div>`).join("")}</div>`);
  }
  return t;
}

montrerEcran("carte");

// Accès pour les essais automatiques (test/essai.html) : l'état et quelques actions.
window.simulateur = { E, M, carte, evt, preparerEvenement, afficherJauges, montrerEcran, onglets, choisirOnglet, fermerOnglet, renommerOnglet, chargerInfosZone, telechargerZone, chargerCalque, donneesCalques, ouvrir, installer, changerOperations, annulerRemodelage, retablirRemodelage, exporterTout, vue, choisirOutil,
  pluieModifiee, commencerSurface, terminerSurface, appliquerPluie, debit, coefficientEn, descriptionPluie, note, TYPES_SURFACES,
  attendre: () => new Promise(res => { const v = () => (E.travail ? setTimeout(v, 50) : res()); v(); }) };
