// Appli « Climat » : carte des mailles, clic sur une maille -> figures.
// Site statique : pas de build, pas de serveur applicatif. Deux sources, interrogées
// directement depuis la page, chacune avec sa grille :
//   - France : SAFRAN-ISBA (Météo-France), via l'API EDR de GeoSAS ;
//   - Royaume-Uni : la réanalyse ERA5-Land / ERA5 (ECMWF), via l'API d'Open-Meteo.
// Chaque maille porte sa `source` ; tout le reste de l'appli lit des jours au même format.

const EDR_POSITION_URL = "https://api.geosas.fr/edr/collections/safran-isba/position";
const PARAMETRES = "T_Q,TINF_H_Q,TSUP_H_Q,PRELIQ_Q,PRENEI_Q,ETP_Q,HU_Q,RESR_NEIGE_Q";
const { MOIS, nf } = Graphiques;

// ---------- éléments DOM ----------
const attenteEl = document.getElementById("attente");
const selectionEl = document.getElementById("selection");
const cellTitle = document.getElementById("cell-title");
const figAnnee = document.getElementById("fig-annee");
const titreAnnee = document.getElementById("titre-annee");
const anneeLibelle = document.getElementById("annee-libelle");
const anneePrec = document.getElementById("annee-prec");
const anneeSuiv = document.getElementById("annee-suiv");
const legendeAnnee = document.getElementById("legende-annee");
const btnAnomalies = document.getElementById("btn-anomalies");
const pastillesEl = document.getElementById("pastilles-annee");
const pastillesPaquets = document.getElementById("pastilles-paquets");
const carteAnnuelBis = document.getElementById("carte-annuel-bis");
const figAnnuelBis = document.getElementById("fig-annuel-bis");
const titreAnnuelBis = document.getElementById("titre-annuel-bis");
const sousTitreAnnuelBis = document.getElementById("sous-titre-annuel-bis");
const tableAnnuelBis = document.getElementById("table-annuel-bis");
const echelleAnnuelBis = document.getElementById("echelle-annuel-bis");
const pastillesPaquetsBis = document.getElementById("pastilles-paquets-bis");
const reglageSeuil = document.getElementById("reglage-seuil");
const carteJoursPluie = document.getElementById("carte-jours-pluie");
const figJoursPluie = document.getElementById("fig-jours-pluie");
const figJoursAnnee = document.getElementById("fig-jours-annee");
const titreJoursAnnee = document.getElementById("titre-jours-annee");
const sousTitreJoursPluie = document.getElementById("sous-titre-jours-pluie");
const tableJoursPluie = document.getElementById("table-jours-pluie");
const reglagePluieSeuil = document.getElementById("reglage-pluie-seuil");
const reglagePluiePeriode = document.getElementById("reglage-pluie-periode");
const echelleAnnuel = document.getElementById("echelle-annuel");
const statusEl = document.getElementById("status");
const chartsDiv = document.getElementById("charts");
const resumeDiv = document.getElementById("resume");
const ongletsEl = document.getElementById("onglets");
const figMois = document.getElementById("fig-mois");
const figAnnuel = document.getElementById("fig-annuel");
const tableMois = document.getElementById("table-mois");
const tableAnnuel = document.getElementById("table-annuel");
const titreMois = document.getElementById("titre-mois");
const noteMois = document.getElementById("note-mois");
const btnDecennie = document.getElementById("btn-decennie");
const navDecennie = document.getElementById("nav-decennie");
const decPrec = document.getElementById("dec-prec");
const decSuiv = document.getElementById("dec-suiv");
const decLibelle = document.getElementById("dec-libelle");
const legendeMois = document.getElementById("legende-mois");
const titreAnnuel = document.getElementById("titre-annuel");
const sousTitreAnnuel = document.getElementById("sous-titre-annuel");
const btnRetrecir = document.getElementById("btn-retrecir");
const btnAgrandir = document.getElementById("btn-agrandir");
const coteEl = document.getElementById("cote");
const presentationDiv = document.getElementById("presentation");
const figFrise = document.getElementById("fig-frise");
const echelleFrise = document.getElementById("echelle-frise");
const btnEnregistrer = document.getElementById("btn-enregistrer");
const listeEnregistrees = document.getElementById("liste-enregistrees");
const aucuneEnregistree = document.getElementById("aucune-enregistree");

let currentCell = null;
let selectedPolygon = null;
let lignes = null;             // les jours bruts, gardés pour changer d'onglet sans refaire la requête
let sourceLignes = "safran";   // d'où viennent ces jours : quelques unités en dépendent
let altitude = null;           // { moyenne, min, max } une fois le modèle de terrain interrogé
let anneeAffichee = null;      // l'année détaillée dans le panneau du bas
let requeteEnCours = null;

// ---------- période ----------
// Pas de choix de période : on prend toujours toute la profondeur disponible,
// de la première année complète au dernier jour publié.
const MS_JOUR = 86400000;
const ANNEE_MIN = 1959;   // 1958 ne commence qu'en août (SAFRAN) ; même départ au Royaume-Uni
// décalage de publication : ~3 semaines pour SAFRAN, ~5 jours pour ERA5 chez Open-Meteo
const RETARD_JOURS = { safran: 21, era5: 5 };

const isoJour = (t) => new Date(t).toISOString().slice(0, 10);
const jourFr = (iso) => iso.split("-").reverse().join("/");
function dateDebut() { return `${ANNEE_MIN}-01-01`; }
function dateFin(source = "safran") { return isoJour(Date.now() - RETARD_JOURS[source] * MS_JOUR); }

// ---------- carte ----------
// `zoomSnap: 0` autorise les zooms fractionnaires : sans lui, `fitBounds` arrondit au
// niveau entier inférieur et la France flotte au milieu d'une carte de l'Europe.
const CENTRE_FRANCE = [46.5, 2.4];
const BORNES_FRANCE = L.latLngBounds([41.3, -5.2], [51.1, 9.7]);
const BORNES_UK = L.latLngBounds([49.1, -8.7], [60.9, 1.9]);
// `attributionControl.prefix` vidé : au cran le plus étroit, le panneau fait quelques
// dizaines de pixels et la mention Leaflet + OSM déborderait sur trois lignes.
const map = L.map("map", { preferCanvas: true, attributionControl: false, zoomSnap: 0 })
  .setView(CENTRE_FRANCE, 6);
L.control.attribution({ prefix: false }).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap",
  maxZoom: 12,
}).addTo(map);

const canvasRenderer = L.canvas({ padding: 0.5 });

/** Les quatre coins (lat, lon) d'une maille, selon sa grille. */
function coinsSafran(cell) {
  const half = SAFRAN_GRID.cellSize / 2;
  return [
    [cell.x - half, cell.y - half],
    [cell.x + half, cell.y - half],
    [cell.x + half, cell.y + half],
    [cell.x - half, cell.y + half],
  ].map(([x, y]) => {
    const p = lambertIIEtenduToWGS84(x, y);
    return [p.lat, p.lon];
  });
}

// ERA5-Land : un point tous les 0,1° en latitude ET en longitude, donc un rectangle
// couché (~11 × 6,5 km à 55° N) — c'est la vraie forme de la donnée.
function coinsUK(cell) {
  const d = UK_GRID.cellSize / 2;
  return [
    [cell.lat - d, cell.lon - d], [cell.lat - d, cell.lon + d],
    [cell.lat + d, cell.lon + d], [cell.lat + d, cell.lon - d],
  ];
}

const POLYGONES = new Map();   // « source:id » → polygone, pour rouvrir une maille enregistrée
const cleMaille = (cell) => `${cell.source}:${cell.id}`;

function buildGridLayer(cells, coins, source) {
  const layer = L.layerGroup();

  for (const cell of cells) {
    cell.source = source;
    const poly = L.polygon(coins(cell), {
      renderer: canvasRenderer,
      color: "#4A90D9",
      weight: 0.4,
      opacity: 0.5,
      fillColor: "#4A90D9",
      fillOpacity: 0.08,
    });
    poly.cellData = cell;
    POLYGONES.set(cleMaille(cell), poly);

    poly.on("click", () => selectCell(poly));
    poly.on("mouseover", () => {
      if (poly !== selectedPolygon) poly.setStyle({ fillOpacity: 0.3 });
    });
    poly.on("mouseout", () => {
      if (poly !== selectedPolygon) poly.setStyle({ fillOpacity: 0.08 });
    });

    layer.addLayer(poly);
  }
  return layer;
}

buildGridLayer(SAFRAN_GRID.cells, coinsSafran, "safran").addTo(map);
buildGridLayer(UK_GRID.cells, coinsUK, "era5").addTo(map);

// les deux pays sont sur la même carte ; ces boutons ne font que recadrer
document.getElementById("btn-france").addEventListener("click",
  () => map.fitBounds(BORNES_FRANCE, { padding: [2, 2] }));
document.getElementById("btn-uk").addEventListener("click",
  () => map.fitBounds(BORNES_UK, { padding: [2, 2] }));

// ---------- largeur de la barre latérale ----------
// Deux largeurs pour la barre latérale, donc pour la carte qui la coiffe. Le bouton « − » rétrécit, le bouton
// « + » agrandit, chacun s'éteint quand on est au bout. Leaflet mesure son conteneur au montage, donc après chaque
// changement de largeur il faut le lui redire, sinon les tuiles restent trouées.
const CRANS = ["290px", "440px"];
let cran = 0;
let premierCadrage = true;

function appliquerCran() {
  coteEl.style.setProperty("--largeur", CRANS[cran]);
  btnRetrecir.disabled = cran === 0;
  btnAgrandir.disabled = cran === CRANS.length - 1;

  const centre = map.getCenter();
  const zoom = map.getZoom();
  let fait = false;
  const fin = (ev) => {
    // `transitionend` remonte des enfants (survol d'un bouton…) : seule compte celle de
    // la barre elle-même, sinon on rétablit plus tard une vue périmée par-dessus celle
    // que l'utilisateur s'est choisie
    if (ev && ev.target !== coteEl) return;
    if (fait) return;
    fait = true;
    coteEl.removeEventListener("transitionend", fin);
    map.invalidateSize({ animate: false });
    // au tout premier passage la carte n'a pas encore de cadrage utile : on montre la
    // France entière, cadrée pour la largeur du panneau. Ensuite on respecte la vue
    // que l'utilisateur s'est choisie.
    if (premierCadrage) {
      map.fitBounds(BORNES_FRANCE, { padding: [2, 2], animate: false });
      premierCadrage = false;
    }
    else map.setView(centre, zoom, { animate: false });
    redessiner();
  };
  coteEl.addEventListener("transitionend", fin);
  setTimeout(() => fin(), 220);   // filet : `transitionend` ne part pas si la transition est coupée
}

btnRetrecir.addEventListener("click", () => { if (cran > 0) { cran--; appliquerCran(); } });
btnAgrandir.addEventListener("click", () => { if (cran < CRANS.length - 1) { cran++; appliquerCran(); } });
appliquerCran();

// ---------- sélection d'une maille ----------
function selectCell(poly) {
  if (selectedPolygon) {
    selectedPolygon.setStyle({ color: "#4A90D9", weight: 0.4, fillOpacity: 0.08 });
  }
  selectedPolygon = poly;
  poly.setStyle({ color: "#D9534F", weight: 1.6, fillOpacity: 0.4 });

  currentCell = poly.cellData;
  attenteEl.hidden = true;
  selectionEl.hidden = false;
  afficherTitre();
  majSignet();
  if (!NOMS.has(cleMaille(currentCell))) {
    const maille = currentCell;
    nomDeLieu(maille).then(() => { if (currentCell === maille) afficherTitre(); });
  }

  altitude = null;
  const maille = currentCell;
  // l'altitude d'une maille enregistrée (et de toute maille du Royaume-Uni) voyage avec
  // ses jours dans le cache : `joursSafran` / `joursEra5` s'en chargent

  loadData();
}

function afficherAltitude(maille, promesse) {
  promesse
    .then((a) => { if (currentCell === maille) { altitude = a; if (lignes) resume(); } })
    .catch(() => { if (currentCell === maille) { altitude = "erreur"; if (lignes) resume(); } });
}

/** « Maille x139_y0 » en France ; « Maille 55,9° N · 3,2° O » au Royaume-Uni, dont les
 *  identifiants ne parlent à personne. */
function titreMaille(cell) {
  if (cell.source === "safran") return `Maille ${cell.id}`;
  const deg = (v, pos, neg) => `${nf(Math.abs(v), 1)}° ${v < 0 ? neg : pos}`;
  return `Maille ${deg(cell.lat, "N", "S")} · ${deg(cell.lon, "E", "O")}`;
}

// ---------- altitude de la maille (RGE ALTI, via la Géoplateforme IGN) ----------
// SAFRAN ne publie pas l'altitude de ses mailles : on l'échantillonne nous-mêmes sur le
// modèle de terrain de l'IGN, 5 × 5 points dans le carré de 8 km, en UNE requête.
// L'écart min–max compte autant que la moyenne : c'est lui qui dit combien de relief la
// maille écrase sous une seule valeur.
const ALTITUDES = new Map();   // par identifiant de maille, pour ne demander qu'une fois

async function altitudeMaille(cell) {
  if (ALTITUDES.has(cell.id)) return ALTITUDES.get(cell.id);

  const z = cell.source === "safran" ? await altitudesIGN(cell) : await altitudesCopernicus(cell);
  if (z.length === 0) throw new Error("hors du modèle de terrain");

  const r = { moyenne: moyenne(z), min: Math.min(...z), max: Math.max(...z), points: z.length };
  ALTITUDES.set(cell.id, r);
  return r;
}

/** 5 × 5 points (lat, lon) semés régulièrement dans la maille, bords compris. */
function semis(cell, N = 5) {
  const pts = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (cell.source === "safran") {
        const demi = SAFRAN_GRID.cellSize / 2;
        pts.push(lambertIIEtenduToWGS84(cell.x - demi + (2 * demi * i) / (N - 1),
                                         cell.y - demi + (2 * demi * j) / (N - 1)));
      } else {
        const demi = UK_GRID.cellSize / 2;
        pts.push({ lon: cell.lon - demi + (2 * demi * i) / (N - 1),
                   lat: cell.lat - demi + (2 * demi * j) / (N - 1) });
      }
    }
  }
  return pts;
}

async function altitudesIGN(cell) {
  const pts = semis(cell);
  const q = new URLSearchParams({
    lon: pts.map((p) => p.lon.toFixed(5)).join("|"),
    lat: pts.map((p) => p.lat.toFixed(5)).join("|"),
    resource: "ign_rge_alti_wld",
  });
  const resp = await fetch(`https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?${q}`);
  if (!resp.ok) throw new Error("altitude indisponible");
  return (await resp.json()).elevations
    .map((e) => e.z)
    .filter((v) => typeof v === "number" && v > -1000);   // -99999 = hors du territoire
}

// Le RGE ALTI s'arrête à la frontière française (il répond -99999 à Londres). Au
// Royaume-Uni on prend le Copernicus DEM à 90 m, servi par Open-Meteo, qui répond 0,0
// tout rond en mer : on écarte ces points-là, sinon une maille côtière aurait l'air
// plus basse qu'elle n'est (les Fens, sous le niveau de la mer, répondent -1, pas 0).
async function altitudesCopernicus(cell) {
  const pts = semis(cell);
  const q = new URLSearchParams({
    latitude: pts.map((p) => p.lat.toFixed(4)).join(","),
    longitude: pts.map((p) => p.lon.toFixed(4)).join(","),
  });
  const resp = await fetch(`https://api.open-meteo.com/v1/elevation?${q}`);
  if (!resp.ok) throw new Error("altitude indisponible");
  return ((await resp.json()).elevation || []).filter((v) => typeof v === "number" && v !== 0);
}

// ---------- récupération des données ----------
async function loadData() {
  if (!currentCell) return;
  const cell = currentCell;

  // une nouvelle maille annule la requête précédente : sinon la réponse en retard
  // écrase l'affichage de la maille qu'on vient de choisir
  if (requeteEnCours) requeteEnCours.abort();
  const controle = new AbortController();
  requeteEnCours = controle;

  statusEl.className = "muted";
  statusEl.textContent = cell.source === "safran"
    ? "Chargement des données SAFRAN…"
    : "Chargement de la réanalyse ERA5 (Open-Meteo)…";
  chartsDiv.style.opacity = presentationDiv.style.opacity = lignes ? "0.4" : "";

  try {
    const { rows, debut, fin, avertissement } = cell.source === "safran"
      ? await joursSafran(cell, controle.signal)
      : await joursEra5(cell, controle.signal);
    if (rows.length === 0) throw new Error("Aucune donnée sur cette période.");
    if (controle.signal.aborted) return;

    afficherLignes(cell, rows);
    // à découvrir AVANT de dessiner : les figures se calent sur la largeur mesurée,
    // et un conteneur `hidden` mesure zéro
    afficherPartie();
    resume();
    dessiner();
    // en temps normal la ligne d'état reste vide : elle ne parle que pendant un
    // chargement ou quand quelque chose ne va pas
    statusEl.textContent = avertissement || "";
    statusEl.title = `${nf(rows.length)} jours, du ${jourFr(debut)} au ${jourFr(fin)}`;
  } catch (err) {
    if (err.name === "AbortError") return;
    // les figures encore affichées sont celles de la maille d'avant : sous le titre de la
    // nouvelle, elles mentiraient
    lignes = null;
    chartsDiv.hidden = true;
    presentationDiv.hidden = true;
    statusEl.textContent = err.message;
    statusEl.className = "muted erreur";
    // quota à la minute : il se vide tout seul, on réessaie sans attendre un clic
    if (err.reessaiDans) {
      setTimeout(() => { if (currentCell === cell && !lignes && !requeteEnCours) loadData(); },
                 err.reessaiDans);
    }
  } finally {
    if (requeteEnCours === controle) requeteEnCours = null;
    chartsDiv.style.opacity = presentationDiv.style.opacity = "";
  }
}

/** Pose les jours d'une maille à l'écran. La référence 1960-1990 est tirée de la série
 *  elle-même (elle part toujours de 1959) : pas de seconde requête. */
function afficherLignes(cell, rows) {
  lignes = rows;
  sourceLignes = cell.source;
  REFERENCES.set(cell.id, rows.filter((r) => r.year >= REFERENCE.debut && r.year <= REFERENCE.fin));
  majPastillePeriode();
}

// ---------- France : SAFRAN via GeoSAS ----------
// Une maille ENREGISTRÉE garde ses jours sur le disque (`safran_<id>`, même format que le
// cache ERA5) : elle s'ouvre sans réseau, et seuls les jours parus depuis sont demandés,
// en arrière-plan, une fois par jour au plus. Les autres mailles passent par le réseau.
const VERSION_SAFRAN = 1;
const SAFRAN_EN_MEMOIRE = new Map();
const cleSafran = (cell) => `safran_${cell.id}`;
const estEnregistree = (cell) => enregistrees.some((m) => m.cle === cleMaille(cell));

async function joursSafran(cell, signal) {
  if (estEnregistree(cell)) {
    let c = SAFRAN_EN_MEMOIRE.get(cell.id) || await CacheDisque.lire(cleSafran(cell));
    if (c && c.version === VERSION_SAFRAN) {
      SAFRAN_EN_MEMOIRE.set(cell.id, c);
      if (c.altitude) ALTITUDES.set(cell.id, c.altitude);
      afficherAltitude(cell, altitudeMaille(cell));
      const aujourdhui = isoJour(Date.now());
      if (c.fin < dateFin("safran") && c.verifie !== aujourdhui) completerSafran(cell, c);
      return { rows: lignesDepuisColonnes(c), debut: c.debut, fin: c.fin };
    }
  }
  afficherAltitude(cell, altitudeMaille(cell));   // en parallèle des jours
  const r = await telechargerSafran(cell, dateDebut(), dateFin("safran"), signal);
  // enregistrée mais pas encore sur le disque (gardée avant que ce cache existe)
  if (estEnregistree(cell)) garderSafran(cell, r.rows);
  return r;
}

/** Va chercher les jours parus depuis le cache, sans bloquer l'affichage. */
async function completerSafran(cell, c) {
  try {
    const depuis = isoJour(Date.parse(c.fin) + MS_JOUR);
    const neuf = await telechargerSafran(cell, depuis, dateFin("safran"));
    const n = colonnesDepuisLignes(neuf.rows);
    const maj = n ? recoller(c, n) : c;
    maj.verifie = isoJour(Date.now());
    SAFRAN_EN_MEMOIRE.set(cell.id, maj);
    await CacheDisque.ecrire(cleSafran(cell), maj);
    if (maj !== c && currentCell === cell) {
      afficherLignes(cell, lignesDepuisColonnes(maj));
      resume();
      dessiner();
      statusEl.title = `${nf(lignes.length)} jours, du ${jourFr(maj.debut)} au ${jourFr(maj.fin)}`;
    }
  } catch { /* hors ligne : on garde ce qu'on a, on réessaiera à la prochaine ouverture */ }
}

/** Écrit la maille sur le disque à partir des jours déjà chargés. */
function garderSafran(cell, rows) {
  const colonnes = colonnesDepuisLignes(rows);
  if (!colonnes) return;
  const c = { version: VERSION_SAFRAN, ...colonnes, verifie: isoJour(Date.now()) };
  const alt = ALTITUDES.get(cell.id);
  if (alt) c.altitude = alt;
  else altitudeMaille(cell).then((a) => { c.altitude = a; CacheDisque.ecrire(cleSafran(cell), c); }).catch(() => {});
  SAFRAN_EN_MEMOIRE.set(cell.id, c);
  CacheDisque.ecrire(cleSafran(cell), c);
}

/** L'inverse de `lignesDepuisColonnes` : une colonne par champ, un jour par case, `null`
 *  pour les jours manquants (rangés par date, pas par ordre d'arrivée). */
function colonnesDepuisLignes(rows) {
  if (!rows.length) return null;
  const jourDe = (r) => Date.UTC(r.year, r.month - 1, r.day);
  let t0 = Infinity, t1 = -Infinity;
  for (const r of rows) { const t = jourDe(r); if (t < t0) t0 = t; if (t > t1) t1 = t; }
  const n = Math.round((t1 - t0) / MS_JOUR) + 1;
  const colonnes = Object.fromEntries(CHAMPS.map((k) => [k, new Array(n).fill(null)]));
  for (const r of rows) {
    const i = Math.round((jourDe(r) - t0) / MS_JOUR);
    for (const k of CHAMPS) colonnes[k][i] = isNaN(r[k]) ? null : r[k];
  }
  return { debut: isoJour(t0), fin: isoJour(t1), colonnes };
}

async function telechargerSafran(cell, debut, fin, signal) {
  const params = new URLSearchParams({
    coords: `POINT(${cell.x} ${cell.y})`,
    crs: "IGNF:LAMBE",
    datetime: `${debut}T00:00:00Z/${fin}T00:00:00Z`,
    "parameter-name": PARAMETRES,
    f: "CSV",
  });
  const resp = await fetch(`${EDR_POSITION_URL}?${params.toString()}`, { signal });
  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`Erreur API (${resp.status}) : ${detail.slice(0, 200)}`);
  }
  return { rows: parseCSV(await resp.text()), debut, fin };
}

// ---------- Royaume-Uni : ERA5 via Open-Meteo ----------
// Modèle `era5_seamless` : ERA5-Land (0,1°, ~9 km) partout où il existe, ERA5 (0,25°)
// pour le reste — les précipitations en particulier, qu'ERA5-Land ne publie pas chez
// Open-Meteo (vérifié : `null` partout avec `models=era5_land`).
//
// ⚠️ Le quota gratuit d'Open-Meteo compte en « appels » PONDÉRÉS par la durée : une
// requête vaut (jours ÷ 14) appels. De 1959 à aujourd'hui, une maille coûte donc ~1 800
// appels, pour 600 par minute, 5 000 par heure et 10 000 par jour : environ cinq mailles
// NEUVES par jour. D'où le cache sur disque : une maille déjà ouverte ne redemande plus
// que les jours parus depuis (un appel), et reste lisible hors quota.
const OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive";
const VARIABLES_ERA5 = [
  "temperature_2m_mean", "temperature_2m_min", "temperature_2m_max",
  "precipitation_sum", "snowfall_water_equivalent_sum",
  "et0_fao_evapotranspiration", "relative_humidity_2m_mean", "snow_depth_mean",
];
const VERSION_CACHE = 1;
const ERA5_EN_MEMOIRE = new Map();   // déjà vérifiées pendant cette session

async function joursEra5(cell, signal) {
  const cle = `era5_${cell.id}`;
  let c = ERA5_EN_MEMOIRE.get(cell.id) || await CacheDisque.lire(cle);
  if (c && c.version !== VERSION_CACHE) c = null;
  let avertissement = "";

  const aujourdhui = isoJour(Date.now());
  const voulu = dateFin("era5");
  if (!c || (c.fin < voulu && c.verifie !== aujourdhui)) {
    const depuis = c ? isoJour(Date.parse(c.fin) + MS_JOUR) : dateDebut();
    try {
      const neuf = await telechargerEra5(cell, depuis, voulu, signal);
      c = c ? recoller(c, neuf) : { version: VERSION_CACHE, ...neuf };
      c.verifie = aujourdhui;
      await CacheDisque.ecrire(cle, c);
    } catch (err) {
      if (err.name === "AbortError" || !c) throw err;
      // le quota est vide mais on a déjà la maille : on la montre, en le disant
      avertissement = `(Mise à jour impossible : ${err.message})`;
    }
  }
  ERA5_EN_MEMOIRE.set(cell.id, c);

  // l'altitude voyage avec les jours : elle aussi coûte un appel
  if (c.altitude) ALTITUDES.set(cell.id, c.altitude);
  const promesse = altitudeMaille(cell);
  if (!c.altitude) promesse.then((a) => { c.altitude = a; CacheDisque.ecrire(cle, c); }).catch(() => {});
  afficherAltitude(cell, promesse);
  return { rows: lignesDepuisColonnes(c), debut: c.debut, fin: c.fin, avertissement };
}

async function telechargerEra5(cell, debut, fin, signal) {
  const q = new URLSearchParams({
    latitude: cell.lat, longitude: cell.lon,
    start_date: debut, end_date: fin,
    daily: VARIABLES_ERA5.join(","),
    models: "era5_seamless",
    timezone: "UTC",
  });
  const resp = await fetch(`${OPEN_METEO_URL}?${q}`, { signal });
  if (!resp.ok) {
    let raison = "";
    try { raison = (await resp.json()).reason || ""; } catch { /* corps illisible */ }
    const err = new Error(messageOpenMeteo(resp.status, raison));
    if (/minutely/i.test(raison)) err.reessaiDans = 60000;
    throw err;
  }
  const d = (await resp.json()).daily;

  // les derniers jours demandés ne sont pas encore parus : Open-Meteo renvoie `null`,
  // on coupe la série au dernier jour réellement publié
  let n = d.time.length;
  while (n > 0 && d.temperature_2m_mean[n - 1] === null) n--;
  const col = (nom) => d[nom].slice(0, n);
  const precip = col("precipitation_sum");
  const neige = col("snowfall_water_equivalent_sum");
  return {
    debut: d.time[0],
    fin: n ? d.time[n - 1] : isoJour(Date.parse(debut) - MS_JOUR),
    colonnes: {
      T_Q: col("temperature_2m_mean"),
      TINF_H_Q: col("temperature_2m_min"),
      TSUP_H_Q: col("temperature_2m_max"),
      // SAFRAN sépare pluie et neige (équivalent en eau) ; ERA5 donne le total et la
      // neige en équivalent en eau : la pluie est la différence
      PRELIQ_Q: precip.map((p, i) => (p === null || neige[i] === null ? null
                                       : Math.max(0, Math.round((p - neige[i]) * 10) / 10))),
      PRENEI_Q: neige,
      // ETP de référence FAO-56 (Penman-Monteith), comme l'ETP_Q de SAFRAN
      ETP_Q: col("et0_fao_evapotranspiration"),
      HU_Q: col("relative_humidity_2m_mean"),
      // ⚠️ pas d'équivalent en eau du manteau chez Open-Meteo : c'est la HAUTEUR de neige,
      // convertie de m en cm (l'onglet « Manteau neigeux » change d'unité en conséquence)
      RESR_NEIGE_Q: col("snow_depth_mean").map((v) => (v === null ? null : Math.round(v * 1000) / 10)),
    },
  };
}

/** Ajoute au bout de la série en cache les jours parus depuis. */
function recoller(ancien, neuf) {
  if (neuf.fin <= ancien.fin) return ancien;
  // jours sautés entre les deux (non publiés au moment de la requête) : des `null`
  const trou = Math.max(0, Math.round((Date.parse(neuf.debut) - Date.parse(ancien.fin)) / MS_JOUR) - 1);
  const colonnes = {};
  for (const k of Object.keys(ancien.colonnes)) {
    colonnes[k] = ancien.colonnes[k].concat(new Array(trou).fill(null), neuf.colonnes[k]);
  }
  return { ...ancien, fin: neuf.fin, colonnes };
}

function lignesDepuisColonnes(c) {
  const t0 = Date.parse(c.debut);
  const n = c.colonnes.T_Q.length;
  const rows = new Array(n);
  for (let i = 0; i < n; i++) {
    const d = new Date(t0 + i * MS_JOUR);
    const r = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
    for (const k of CHAMPS) {
      const v = c.colonnes[k][i];
      r[k] = v === null || v === undefined ? NaN : v;
    }
    rows[i] = r;
  }
  return rows;
}

function messageOpenMeteo(statut, raison) {
  const suite = " Les mailles déjà ouvertes restent consultables.";
  // une maille neuve coûte ~3 minutes de quota (600 appels par minute) : le compteur
  // à la minute reste plein un moment après chaque chargement
  if (/minutely/i.test(raison)) {
    return "Quota à la minute d'Open-Meteo atteint (une maille neuve en consomme environ " +
           "trois) : nouvel essai automatique toutes les minutes.";
  }
  if (/hourly/i.test(raison)) {
    return "Quota horaire d'Open-Meteo atteint (5 000 appels, une maille neuve en coûte " +
           "~1 800) : réessayez dans l'heure." + suite;
  }
  if (/daily/i.test(raison)) {
    return "Quota du jour d'Open-Meteo atteint (10 000 appels, une maille neuve en coûte " +
           "~1 800) : réessayez demain." + suite;
  }
  return `Erreur Open-Meteo (${statut})${raison ? ` : ${raison}` : ""}`;
}

// ---------- cache sur disque ----------
// Dans l'app Mac : un fichier par maille dans ~/Library/Application Support/Climat,
// écrit par le côté Swift (`CacheDisque.swift`). Dans un navigateur : IndexedDB.
// Un cache qui ne marche pas n'empêche rien : on retombe sur le réseau.
const CacheDisque = (() => {
  const natif = window.webkit?.messageHandlers?.cache;
  let base = null;
  const idb = () => base || (base = new Promise((ok, ko) => {
    const req = indexedDB.open("climat", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("jours");
    req.onsuccess = () => ok(req.result);
    req.onerror = () => ko(req.error);
  }));
  const transaction = async (mode, action) => {
    const db = await idb();
    return new Promise((ok, ko) => {
      const req = action(db.transaction("jours", mode).objectStore("jours"));
      req.onsuccess = () => ok(req.result);
      req.onerror = () => ko(req.error);
    });
  };
  return {
    async lire(cle) {
      try {
        if (natif) {
          const texte = await natif.postMessage({ op: "lire", cle });
          return texte ? JSON.parse(texte) : null;
        }
        return (await transaction("readonly", (s) => s.get(cle))) || null;
      } catch { return null; }
    },
    async ecrire(cle, valeur) {
      try {
        if (natif) await natif.postMessage({ op: "ecrire", cle, valeur: JSON.stringify(valeur) });
        else await transaction("readwrite", (s) => s.put(valeur, cle));
      } catch { /* tant pis : la prochaine ouverture repassera par le réseau */ }
    },
    async supprimer(cle) {
      try {
        if (natif) await natif.postMessage({ op: "supprimer", cle });
        else await transaction("readwrite", (s) => s.delete(cle));
      } catch { /* rien à supprimer */ }
    },
  };
})();

const CHAMPS = ["T_Q", "TINF_H_Q", "TSUP_H_Q", "PRELIQ_Q", "PRENEI_Q", "ETP_Q", "HU_Q", "RESR_NEIGE_Q"];

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.replace(/"/g, ""));
  const idx = {};
  header.forEach((h, i) => (idx[h] = i));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cols = lines[i].split(",");
    const timeStr = cols[idx.time].replace(/"/g, "");
    const r = { year: +timeStr.slice(0, 4), month: +timeStr.slice(5, 7),
                day: +timeStr.slice(8, 10) };
    for (const c of CHAMPS) r[c] = idx[c] === undefined ? NaN : parseFloat(cols[idx[c]]);
    rows.push(r);
  }
  return rows;
}

// ---------- calculs ----------
const moyenne = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

/**
 * Humidex : la température ressentie quand on tient compte de l'humidité. Il n'est PAS
 * fourni par SAFRAN, on le calcule (formule d'Environnement Canada) à partir de la
 * température et de l'humidité relative du jour. Par convention il ne descend jamais
 * sous la température elle-même.
 */
function humidex(t, hu) {
  const e = 6.112 * Math.pow(10, (7.5 * t) / (237.7 + t)) * (hu / 100);
  return Math.max(t, t + 0.5555 * (e - 10));
}

/** Douze valeurs : moyenne, sur les années de la période, du total de chaque mois. */
function moisCumul(rows, f) {
  const parAnneeMois = new Map();
  for (const r of rows) {
    const cle = r.year * 100 + r.month;
    if (!parAnneeMois.has(cle)) parAnneeMois.set(cle, { month: r.month, s: 0 });
    parAnneeMois.get(cle).s += f(r);
  }
  const parMois = Array.from({ length: 12 }, () => []);
  for (const g of parAnneeMois.values()) parMois[g.month - 1].push(g.s);
  return parMois.map((v) => (v.length ? moyenne(v) : 0));
}

/** Douze valeurs : moyenne de tous les jours de chaque mois. */
function moisMoyenne(rows, f) {
  const parMois = Array.from({ length: 12 }, () => []);
  for (const r of rows) {
    const v = f(r);
    if (!isNaN(v)) parMois[r.month - 1].push(v);
  }
  return parMois.map((v) => (v.length ? moyenne(v) : 0));
}

/**
 * Une valeur par année. `hydro` : année du 1er septembre au 31 août (celle qui a un sens
 * pour l'eau) ; sinon année civile. Les années incomplètes sont écartées.
 */
function parAnnee(rows, { hydro = true, mode = "somme", f, seuil = 330 } = {}) {
  const groupes = new Map();
  for (const r of rows) {
    const annee = hydro ? (r.month >= 9 ? r.year + 1 : r.year) : r.year;
    if (!groupes.has(annee)) groupes.set(annee, []);
    const v = f(r);
    if (!isNaN(v)) groupes.get(annee).push(v);
  }
  return [...groupes.entries()]
    .filter(([, v]) => v.length >= seuil)
    .sort(([a], [b]) => a - b)
    .map(([annee, v]) => ({
      annee,
      total: mode === "somme" ? v.reduce((a, b) => a + b, 0)
           : mode === "max" ? Math.max(...v)
           : moyenne(v),
    }));
}

// ---------- jours extrêmes ----------
// Un seuil réglable plutôt qu'une liste figée : le bon seuil dépend de l'endroit. Sous
// 0 °C ne dit rien à Nice, au-dessus de 35 °C ne dit rien en altitude. Deux sens
// possibles (les minimales qui descendent, les maximales qui montent), et la couleur
// s'assombrit à mesure que le seuil devient sévère.
const SEUIL = {
  min: {
    famille: "froid",
    bornes: [-25, 10], defaut: 0,
    nom: (v) => `Minimale sous ${degre(v)}`,
    sens: "minimale descend sous",
    test: (r, v) => r.TINF_H_Q < v,
    // pleine intensité à −15 °C, la teinte la plus douce à +5 °C
    intensite: (v) => (5 - v) / 20,
  },
  max: {
    famille: "chaud",
    bornes: [15, 45], defaut: 30,
    nom: (v) => `Maximale au-dessus de ${degre(v)}`,
    sens: "maximale dépasse",
    test: (r, v) => r.TSUP_H_Q > v,
    // pleine intensité à 42 °C, la teinte la plus douce à 20 °C
    intensite: (v) => (v - 20) / 22,
  },
};

let seuilSens = "min";
const seuilValeur = { min: SEUIL.min.defaut, max: SEUIL.max.defaut };

/** « −5 °C », avec le vrai signe moins et non le trait d'union du clavier. */
const degre = (v) => `${v < 0 ? "−" : ""}${Math.abs(v)} °C`;

/**
 * La couleur du seuil courant, interpolée entre les deux bouts de sa rampe.
 *
 * `color-mix` garde les variables CSS telles quelles : la figure suit donc le thème
 * clair/sombre toute seule, comme le reste de l'appli. `solide` est le repli posé
 * d'abord, au cas où le moteur ne connaîtrait pas `color-mix`.
 */
function couleurSeuil() {
  const s = SEUIL[seuilSens];
  const p = Math.round(Math.max(0, Math.min(1, s.intensite(seuilValeur[seuilSens]))) * 100);
  const doux = `var(--seuil-${s.famille}-doux)`;
  const vif = `var(--seuil-${s.famille}-vif)`;
  return { solide: p >= 50 ? vif : doux, melange: `color-mix(in oklab, ${vif} ${p}%, ${doux})` };
}

/**
 * Le nombre de jours qui franchissent le seuil réglé, par année civile.
 *
 * Toutes les années sont gardées, y compris celle en cours arrêtée à la dernière
 * publication : un compte de jours reste lisible tel quel, à condition de savoir sur
 * combien de jours il porte — c'est ce que dit l'infobulle.
 */
const ANNEE_COMPLETE = 330;   // en deçà, il manque des mois entiers

function comptesSeuil(rows) {
  const s = SEUIL[seuilSens];
  const v = seuilValeur[seuilSens];
  const groupes = new Map();
  for (const r of rows) {
    if (isNaN(r.TINF_H_Q) || isNaN(r.TSUP_H_Q)) continue;
    let c = groupes.get(r.year);
    if (!c) groupes.set(r.year, (c = { jours: 0, n: 0 }));
    c.jours++;
    if (s.test(r, v)) c.n++;
  }
  const annees = [...groupes.entries()].sort(([a], [b]) => a - b);
  return {
    annees: annees.map(([an]) => an),
    jours: annees.map(([, c]) => c.jours),
    serie: { nom: s.nom(v), valeurs: annees.map(([, c]) => c.n), ...couleurSeuil() },
  };
}

// ---------- jours de pluie sur une période ----------
// Combien de jours de pluie entre deux dates (du 1ᵉʳ juin au 1ᵉʳ septembre, par
// exemple), année par année, avec un seuil réglable. « Au moins » compte le seuil
// lui-même (≥), « plus de » l'écarte (>) : à 1 mm près ça ne change rien, mais sur
// des relevés arrondis au dixième, un seuil de 10 mm pile peut faire basculer des jours.
// Pluie + neige, comme le reste de l'onglet. Bornes INCLUSES. Une période qui passe le
// 31 décembre (du 1ᵉʳ novembre au 1ᵉʳ mars) est rangée sous l'année où elle commence.
const pluiePeriode = {
  sens: "auMoins",           // "auMoins" (≥) ou "plusDe" (>)
  seuil: 1,                  // mm ; 1 mm est le seuil d'un « jour de pluie » chez Météo-France
  debut: { mois: 1, jour: 1 },
  fin: { mois: 12, jour: 31 },
  annee: null,               // l'année détaillée en dessous ; null = la plus récente
};

const precipJour = (r) => r.PRELIQ_Q + r.PRENEI_Q;
const comptePluie = (v) => (pluiePeriode.sens === "auMoins" ? v >= pluiePeriode.seuil : v > pluiePeriode.seuil);
const cleMoisJour = ({ mois, jour }) => mois * 100 + jour;
const traverseLAn = () => cleMoisJour(pluiePeriode.debut) > cleMoisJour(pluiePeriode.fin);
const JOURS_MOIS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MOIS_LONGS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
                    "septembre", "octobre", "novembre", "décembre"];

/** La date UTC d'une borne pour une année donnée (le 29 février retombe au 28). */
function dateBorne(annee, { mois, jour }) {
  const max = mois === 2 ? joursDansLAnnee(annee) - 337 : JOURS_MOIS[mois - 1];
  return new Date(Date.UTC(annee, mois - 1, Math.min(jour, max)));
}

/** Premier et dernier jour de la période qui commence l'année `annee`. */
function bornesPeriode(annee) {
  const debut = dateBorne(annee, pluiePeriode.debut);
  const fin = dateBorne(traverseLAn() ? annee + 1 : annee, pluiePeriode.fin);
  return { debut, fin, n: Math.round((fin - debut) / 86400000) + 1 };
}

/** À quelle période (désignée par son année de début) appartient un relevé, ou null. */
function anneeDePeriode(r) {
  const cle = r.month * 100 + r.day;
  const d = cleMoisJour(pluiePeriode.debut), f = cleMoisJour(pluiePeriode.fin);
  if (!traverseLAn()) return cle >= d && cle <= f ? r.year : null;
  if (cle >= d) return r.year;
  if (cle <= f) return r.year - 1;
  return null;
}

/** « 1ᵉʳ juin – 1ᵉʳ septembre », pour les titres. */
function libellePeriode() {
  const b = ({ mois, jour }) => `${jour === 1 ? "1ᵉʳ" : jour} ${MOIS_LONGS[mois - 1]}`;
  return `${b(pluiePeriode.debut)} – ${b(pluiePeriode.fin)}`;
}
const libelleAnneePeriode = (a) => (traverseLAn() ? `${a}–${String(a + 1).slice(2)}` : `${a}`);
const libelleSeuilPluie = () =>
  `${pluiePeriode.sens === "auMoins" ? "≥" : ">"} ${nf(pluiePeriode.seuil, pluiePeriode.seuil % 1 ? 1 : 0)} mm`;

/** Le nombre de jours comptés par période, et les jours effectivement mesurés. */
function comptesPluie(rows) {
  const groupes = new Map();
  for (const r of rows) {
    const v = precipJour(r);
    if (isNaN(v)) continue;
    const a = anneeDePeriode(r);
    if (a === null) continue;
    let g = groupes.get(a);
    if (!g) groupes.set(a, (g = { jours: 0, n: 0 }));
    g.jours++;
    if (comptePluie(v)) g.n++;
  }
  const annees = [...groupes.keys()].sort((a, b) => a - b);
  return {
    annees,
    jours: annees.map((a) => groupes.get(a).jours),
    attendus: annees.map((a) => bornesPeriode(a).n),
    serie: { nom: `Jours ${libelleSeuilPluie()}`, valeurs: annees.map((a) => groupes.get(a).n),
             solide: "var(--serie-pluie)" },
  };
}

/** Les valeurs de chaque jour de la période d'une année, `null` là où il en manque. */
function joursDeLaPeriode(annee) {
  const { debut, n } = bornesPeriode(annee);
  const jours = Array(n).fill(null);
  for (const r of lignes) {
    if (anneeDePeriode(r) !== annee) continue;
    const v = precipJour(r);
    if (isNaN(v)) continue;
    const i = Math.round((Date.UTC(r.year, r.month - 1, r.day) - debut) / 86400000);
    if (i >= 0 && i < n) jours[i] = v;
  }
  return { debut, jours };
}

// ---------- les onglets ----------
// Un onglet = une variable = deux figures (le profil des douze mois, puis l'année par
// année) et un tableau. L'onglet « Pluie » garde la figure combinée pluie + ETP.
const ONGLETS = [
  {
    id: "pluie",
    divergent: -1,
    motsEcart: ["plus sec", "plus humide"],
    jour: (r) => r.PRELIQ_Q + r.PRENEI_Q,
    cumulJour: true,
    nomJour: "Précipitations",
    couleurCumul: "var(--serie-etp)",
    titreJourAxe: "Précipitations (mm/jour)",
    uniteJour: "mm",
    couleurJour: "var(--serie-pluie)",
    libelle: "Pluie",
    titreMois: "Précipitations mensuelles",
    titreAnnuel: "Précipitations annuelles",
    sousTitreAnnuel: "Cumul par année hydrologique complète (1ᵉʳ septembre – 31 août).",
    legende: [["Pluie", "var(--serie-pluie)", "pave"], ["Neige", "var(--serie-neige)", "pave"]],
    mois(rows) {
      return {
        pluie: moisCumul(rows, (r) => r.PRELIQ_Q),
        neige: moisCumul(rows, (r) => r.PRENEI_Q),
        etp: moisCumul(rows, (r) => r.ETP_Q),
      };
    },
    dessineMois(d, dispo) { return Graphiques.precipitationsMensuelles(figMois, d, dispo, false); },
    tableMois(d) {
      return [
        ["Pluie (mm)", d.pluie.map((v) => nf(v, 1))],
        ["Neige (mm)", d.neige.map((v) => nf(v, 1))],
        ["Total (mm)", d.pluie.map((v, i) => nf(v + d.neige[i], 1))],
      ];
    },
    annuel(rows) { return parAnnee(rows, { f: (r) => r.PRELIQ_Q + r.PRENEI_Q }); },
    optionsAnnuel: { titreAxe: "Précipitations (mm)", unite: "mm", nomValeur: "Cumul" },
    joursPluie: true,
  },
  {
    id: "temperature",
    divergent: +1,
    motsEcart: ["plus frais", "plus chaud"],
    jour: (r) => r.T_Q,
    cumulJour: false,
    nomJour: "Température",
    courbesJour: [
      { cle: "max", nom: "Maximale", f: (r) => r.TSUP_H_Q, couleur: "var(--temp-max)" },
      { cle: "moy", nom: "Moyenne", f: (r) => r.T_Q, couleur: "var(--temp-moy)" },
      { cle: "min", nom: "Minimale", f: (r) => r.TINF_H_Q, couleur: "var(--temp-min)" },
    ],
    titreJourAxe: "Température (°C)",
    uniteJour: "°C",
    // relevé le 25/09 sur 1991-2020 : Londres −1,1 °C sur les maximales face à Heathrow,
    // Édimbourg −2,6 °C face au Jardin botanique (dont ~0,7 °C d'altitude) ; minimales
    // et pluie tiennent (±0,6 °C, +5 à +10 %)
    get note() {
      return sourceLignes === "safran" ? "" :
        "Au Royaume-Uni, la réanalyse ERA5-Land a tendance à écraser l'écart entre le jour " +
        "et la nuit : les maximales sortent de 1 à 2 °C sous celles des stations du Met " +
        "Office, les minimales sont justes. Les jours de forte chaleur sont donc sous-comptés.";
    },
    couleurJour: "var(--serie-temp)",
    libelle: "Température",
    titreMois: "Températures mensuelles",
    titreAnnuel: "Température moyenne annuelle",
    sousTitreAnnuel: "Moyenne par année civile complète.",
    legende: [["Moyenne", "var(--serie-temp)", "trait"], ["Minimales – maximales", "var(--serie-temp)", "bande"]],
    mois(rows) {
      return {
        valeurs: moisMoyenne(rows, (r) => r.T_Q),
        min: moisMoyenne(rows, (r) => r.TINF_H_Q),
        max: moisMoyenne(rows, (r) => r.TSUP_H_Q),
      };
    },
    dessineMois(d, dispo) {
      return Graphiques.profilMensuel(figMois, {
        valeurs: d.valeurs, titreAxe: "Température (°C)", unite: "°C", decimales: 1,
        forme: "ligne", couleur: "var(--serie-temp)", nom: "Moyenne",
        bande: { min: d.min, max: d.max },
      }, dispo);
    },
    tableMois(d) {
      return [
        ["Moyenne (°C)", d.valeurs.map((v) => nf(v, 1))],
        ["Minimale moyenne (°C)", d.min.map((v) => nf(v, 1))],
        ["Maximale moyenne (°C)", d.max.map((v) => nf(v, 1))],
      ];
    },
    annuel(rows) { return parAnnee(rows, { hydro: false, mode: "moyenne", f: (r) => r.T_Q }); },
    optionsAnnuel: { titreAxe: "Température (°C)", unite: "°C", decimales: 1,
                     couleur: "var(--serie-temp)", nomValeur: "Moyenne",
                     libelle: (a) => `${a}` },
    // second graphique annuel : les jours extrêmes plutôt que la moyenne. Une moyenne
    // annuelle qui monte d'un degré ne dit pas combien de canicules ni combien de gels
    // ont changé de main ; ce compte, si.
    comptes: comptesSeuil,
    titreAnnuelBis: "Jours extrêmes par année",
    sousTitreAnnuelBis: "Nombre de jours par année civile qui franchissent le seuil réglé " +
                        "ci-dessous. Toutes les années sont comptées, l'année en cours " +
                        "comprise : elle s'arrête au dernier jour publié, et l'infobulle " +
                        "le signale.",
    optionsComptes: { titreAxe: "Nombre de jours", unite: "j", anneeComplete: ANNEE_COMPLETE },
  },
  {
    id: "neige",
    divergent: -1,
    motsEcart: ["moins de neige", "plus de neige"],
    jour: (r) => r.PRENEI_Q,
    cumulJour: true,
    nomJour: "Neige",
    couleurCumul: "var(--serie-etp)",
    titreJourAxe: "Neige (mm/jour)",
    uniteJour: "mm",
    couleurJour: "var(--serie-pluie)",
    libelle: "Neige",
    titreMois: "Précipitations solides mensuelles",
    titreAnnuel: "Précipitations solides annuelles",
    sousTitreAnnuel: "Cumul par année hydrologique complète (1ᵉʳ septembre – 31 août).",
    mois(rows) { return { valeurs: moisCumul(rows, (r) => r.PRENEI_Q) }; },
    dessineMois(d, dispo) {
      return Graphiques.profilMensuel(figMois, {
        valeurs: d.valeurs, titreAxe: "Neige (mm d'équivalent en eau)", unite: "mm",
        decimales: 1, forme: "colonnes", couleur: "var(--serie-pluie)", nom: "Neige",
      }, dispo);
    },
    tableMois(d) { return [["Neige (mm)", d.valeurs.map((v) => nf(v, 1))]]; },
    annuel(rows) { return parAnnee(rows, { f: (r) => r.PRENEI_Q }); },
    optionsAnnuel: { titreAxe: "Neige (mm)", unite: "mm", nomValeur: "Cumul" },
  },
  {
    id: "etp",
    divergent: +1,
    motsEcart: ["demande plus faible", "demande plus forte"],
    jour: (r) => r.ETP_Q,
    cumulJour: true,
    nomJour: "ETP",
    couleurCumul: "var(--serie-pluie)",
    titreJourAxe: "ETP (mm/jour)",
    uniteJour: "mm",
    couleurJour: "var(--serie-etp)",
    libelle: "Évapotranspiration",
    titreMois: "Précipitations et évapotranspiration",
    titreAnnuel: "Évapotranspiration potentielle annuelle",
    sousTitreAnnuel: "Cumul par année hydrologique complète (1ᵉʳ septembre – 31 août).",
    legende: true,
    mois(rows) {
      return {
        pluie: moisCumul(rows, (r) => r.PRELIQ_Q),
        neige: moisCumul(rows, (r) => r.PRENEI_Q),
        etp: moisCumul(rows, (r) => r.ETP_Q),
      };
    },
    dessineMois(d, dispo) { return Graphiques.precipitationsMensuelles(figMois, d, dispo); },
    tableMois(d) {
      return [
        ["Pluie (mm)", d.pluie.map((v) => nf(v, 1))],
        ["Neige (mm)", d.neige.map((v) => nf(v, 1))],
        ["Total P (mm)", d.pluie.map((v, i) => nf(v + d.neige[i], 1))],
        ["ETP (mm)", d.etp.map((v) => nf(v, 1))],
        ["Bilan P − ETP (mm)", d.etp.map((v, i) => {
          const b = d.pluie[i] + d.neige[i] - v;
          return `${b >= 0 ? "+" : "−"}${nf(Math.abs(b))}`;
        })],
      ];
    },
    annuel(rows) { return parAnnee(rows, { f: (r) => r.ETP_Q }); },
    optionsAnnuel: { titreAxe: "ETP (mm)", unite: "mm", couleur: "var(--serie-etp)",
                     nomValeur: "Cumul" },
    // second graphique annuel, propre à cet onglet : le bilan hydrique climatique
    annuelBis(rows) {
      const p = parAnnee(rows, { f: (r) => r.PRELIQ_Q + r.PRENEI_Q });
      const e = parAnnee(rows, { f: (r) => r.ETP_Q });
      const parEtp = new Map(e.map((a) => [a.annee, a.total]));
      return p.filter((a) => parEtp.has(a.annee))
              .map((a) => ({ annee: a.annee, total: a.total - parEtp.get(a.annee) }));
    },
    titreAnnuelBis: "Bilan hydrique annuel (P − ETP)",
    sousTitreAnnuelBis: "Précipitations moins évapotranspiration potentielle, " +
                        "par année hydrologique complète. Au-dessus de zéro, l'année a " +
                        "reçu plus d'eau que l'atmosphère ne pouvait en évaporer.",
    optionsAnnuelBis: { titreAxe: "P − ETP (mm)", unite: "mm", nomValeur: "Bilan" },
    divergentBis: -1,
    motsEcartBis: ["bilan plus déficitaire", "bilan plus excédentaire"],
  },
  {
    id: "humidex",
    divergent: +1,
    motsEcart: ["moins lourd", "plus lourd"],
    jour: (r) => humidex(r.T_Q, r.HU_Q),
    cumulJour: false,
    nomJour: "Humidex",
    courbesJour: [
      { cle: "max", nom: "Maximal", f: (r) => humidex(r.TSUP_H_Q, r.HU_Q), couleur: "var(--humidex-max)" },
      { cle: "moy", nom: "Moyen", f: (r) => humidex(r.T_Q, r.HU_Q), couleur: "var(--humidex-moy)" },
      { cle: "min", nom: "Minimal", f: (r) => humidex(r.TINF_H_Q, r.HU_Q), couleur: "var(--humidex-min)" },
    ],
    titreJourAxe: "Humidex",
    uniteJour: "",
    couleurJour: "var(--serie-humidex)",
    libelle: "Humidex",
    titreMois: "Humidex mensuel",
    titreAnnuel: "Humidex moyen annuel",
    sousTitreAnnuel: "Moyenne par année civile complète.",
    note: "L'humidex n'est fourni ni par SAFRAN ni par ERA5 : il est calculé ici jour par jour " +
          "(formule d'Environnement Canada) à partir de la température et de l'humidité " +
          "MOYENNES du jour. Ce n'est donc pas le pic ressenti de l'après-midi, qui est " +
          "plus élevé. Dans le détail journalier, les courbes minimale et maximale " +
          "combinent les températures extrêmes du jour avec cette même humidité moyenne, " +
          "faute d'humidité horaire : ce sont des ordres de grandeur.",
    mois(rows) { return { valeurs: moisMoyenne(rows, (r) => humidex(r.T_Q, r.HU_Q)) }; },
    dessineMois(d, dispo) {
      return Graphiques.profilMensuel(figMois, {
        valeurs: d.valeurs, titreAxe: "Humidex", unite: "", decimales: 1,
        forme: "ligne", couleur: "var(--serie-humidex)", nom: "Humidex",
      }, dispo);
    },
    tableMois(d) { return [["Humidex", d.valeurs.map((v) => nf(v, 1))]]; },
    annuel(rows) {
      return parAnnee(rows, { hydro: false, mode: "moyenne", f: (r) => humidex(r.T_Q, r.HU_Q) });
    },
    optionsAnnuel: { titreAxe: "Humidex", unite: "", decimales: 1,
                     couleur: "var(--serie-humidex)", nomValeur: "Humidex",
                     libelle: (a) => `${a}` },
  },
  {
    id: "manteau",
    divergent: -1,
    motsEcart: ["manteau plus mince", "manteau plus épais"],
    jour: (r) => r.RESR_NEIGE_Q,
    cumulJour: false,
    nomJour: "Manteau neigeux",
    get titreJourAxe() { return manteau().axe; },
    get uniteJour() { return manteau().unite; },
    couleurJour: "var(--serie-pluie)",
    libelle: "Manteau neigeux",
    titreMois: "Manteau neigeux mensuel",
    titreAnnuel: "Maximum annuel du manteau neigeux",
    sousTitreAnnuel: "Plus forte valeur de chaque année hydrologique complète.",
    mois(rows) { return { valeurs: moisMoyenne(rows, (r) => r.RESR_NEIGE_Q) }; },
    dessineMois(d, dispo) {
      return Graphiques.profilMensuel(figMois, {
        valeurs: d.valeurs, titreAxe: manteau().axe, unite: manteau().unite, decimales: 1,
        forme: "ligne", couleur: "var(--serie-pluie)", nom: "Manteau neigeux",
      }, dispo);
    },
    tableMois(d) { return [[manteau().axe, d.valeurs.map((v) => nf(v, 1))]]; },
    annuel(rows) { return parAnnee(rows, { mode: "max", f: (r) => r.RESR_NEIGE_Q }); },
    get optionsAnnuel() {
      return { titreAxe: manteau().axe, unite: manteau().unite, decimales: 1, nomValeur: "Maximum" };
    },
    get note() {
      return sourceLignes === "safran" ? "" :
        "Au Royaume-Uni, Open-Meteo ne publie pas l'équivalent en eau du manteau neigeux " +
        "comme SAFRAN : c'est sa HAUTEUR qui est tracée ici, en centimètres. Les chiffres " +
        "ne se comparent donc pas à ceux d'une maille française.";
    },
  },
];

/** L'onglet « Manteau neigeux » ne mesure pas la même chose selon la source. */
function manteau() {
  return sourceLignes === "safran"
    ? { axe: "Équivalent en eau (mm)", unite: "mm" }
    : { axe: "Hauteur de neige (cm)", unite: "cm" };
}

// La présentation n'est pas un onglet de variable : elle n'a que les chiffres de base
// et la frise. On l'ouvre d'office à chaque lancement.
const PRESENTATION = { id: "presentation", libelle: "Présentation" };
let partieActive = PRESENTATION;
let ongletActif = ONGLETS[0];   // la dernière variable ouverte : les figures la gardent

for (const o of [PRESENTATION, ...ONGLETS]) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = o.libelle;
  b.dataset.partie = o.id;
  if (o === ONGLETS[0]) b.classList.add("separe");
  b.setAttribute("role", "tab");
  b.setAttribute("aria-selected", String(o === partieActive));
  b.addEventListener("click", () => ouvrirPartie(o));
  ongletsEl.appendChild(b);
}

function ouvrirPartie(o) {
  partieActive = o;
  if (o !== PRESENTATION) ongletActif = o;
  for (const b of ongletsEl.children) b.setAttribute("aria-selected", String(b.dataset.partie === o.id));
  if (!lignes) return;
  afficherPartie();
  dessiner();
  document.getElementById("bas").scrollTop = 0;
}

/** Montre la présentation ou les figures de la variable, selon le sommaire. À faire
 *  AVANT de dessiner : les figures se calent sur la largeur mesurée, et un conteneur
 *  `hidden` mesure zéro. */
function afficherPartie() {
  presentationDiv.hidden = partieActive !== PRESENTATION;
  chartsDiv.hidden = partieActive === PRESENTATION;
}

// ---------- le panneau d'une année ----------
/** Les années présentes dans les données chargées, de la plus ancienne à la plus récente. */
function anneesDisponibles() {
  return [...new Set(lignes.map((r) => r.year))].sort((a, b) => a - b);
}

const joursDansLAnnee = (annee) =>
  ((annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0) ? 366 : 365;

/** Les 365 (ou 366) valeurs de l'année, `null` là où la journée manque encore. */
function joursDeLAnnee(annee, f) {
  const jours = Array(joursDansLAnnee(annee)).fill(null);
  const debut = Date.UTC(annee, 0, 1);
  for (const r of lignes) {
    if (r.year !== annee) continue;
    const v = f(r);
    if (isNaN(v)) continue;
    // le rang du jour dans l'année, reconstruit depuis la date du relevé
    const rang = Math.round((Date.UTC(r.year, r.month - 1, r.day) - debut) / 86400000);
    if (rang >= 0 && rang < jours.length) jours[rang] = v;
  }
  return jours;
}

// quelles courbes sont cochées dans le détail journalier ; par défaut la moyenne seule
const courbesVisibles = new Set(["moy"]);
let modeAnomalies = false;       // le détail journalier montre les écarts, pas les valeurs
let normaleVisible = false;      // afficher la moyenne de chaque jour
let cumulVisible = true;         // variables cumulées : la courbe de cumul
let jourVisible = true;          // variables cumulées : les barres du jour
let normaleSurReference = false; // la calculer sur 1960-1990 plutôt que sur la période affichée

/**
 * La moyenne de chaque jour de l'année, prise sur toutes les années des relevés fournis.
 * Indexée par (mois, jour) et non par rang : sans quoi le 29 février décalerait d'un jour
 * toute la fin des années bissextiles.
 */
function normaleJournaliere(rows, annee, f) {
  const parJour = new Map();
  for (const r of rows) {
    const v = f(r);
    if (isNaN(v)) continue;
    const cle = r.month * 100 + r.day;
    if (!parJour.has(cle)) parJour.set(cle, []);
    parJour.get(cle).push(v);
  }
  const jours = [];
  const debut = Date.UTC(annee, 0, 1);
  for (let i = 0; i < joursDansLAnnee(annee); i++) {
    const d = new Date(debut + i * 86400000);
    const v = parJour.get((d.getUTCMonth() + 1) * 100 + d.getUTCDate());
    jours.push(v && v.length ? moyenne(v) : null);
  }
  return jours;
}

/** Le cumul de la normale, remis à zéro au 1er janvier comme celui de l'année. */
function cumulNormale(jours) {
  let total = 0;
  return jours.map((v) => (v === null ? null : (total += v)));
}

// Les pastilles ne sont refaites qu'au changement d'onglet : les reconstruire à chaque
// redessin détacherait la case qu'on vient de cocher (le clic suivant tomberait dans le
// vide) et ferait perdre le focus clavier.
let pastillesOnglet = null;

/**
 * Une pastille : un bouton à deux états, allumé quand il est actif. Plus de case à
 * cocher — on clique la pastille elle-même, et sa surbrillance dit qu'elle est active.
 */
function pastille(texte, actif0, couleur, auChangement) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "pastille";
  b.setAttribute("aria-pressed", String(actif0));
  b.addEventListener("click", () => {
    const actif = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(actif));
    auChangement(actif);
  });
  if (couleur) {
    const cle = document.createElement("i");
    cle.className = "cle cle-trait";
    cle.style.background = couleur;
    b.appendChild(cle);
  }
  b.appendChild(document.createTextNode(texte));
  return b;
}

function construirePastilles(o) {
  pastillesEl.hidden = false;
  if (pastillesOnglet === o.id) { majPastillePeriode(); return; }
  pastillesOnglet = o.id;
  pastillesEl.innerHTML = "";

  for (const k of modeAnomalies ? [] : (o.courbesJour || [])) {
    pastillesEl.appendChild(pastille(k.nom, courbesVisibles.has(k.cle), k.couleur, (actif) => {
      if (actif) courbesVisibles.add(k.cle);
      else courbesVisibles.delete(k.cle);
      dessinerAnnee(placeRestante());
    }));
  }

  // Variables cumulées : deux pastilles pour choisir ce qu'on regarde. Leur moyenne
  // générale est toujours affichée, il n'y a donc rien à cocher pour elle.
  if (o.cumulJour && !modeAnomalies) {
    pastillesEl.appendChild(pastille("Cumul", cumulVisible, "var(--encre-2)", (actif) => {
      cumulVisible = actif;
      dessinerAnnee(placeRestante());
    }));
    pastillesEl.appendChild(pastille(`${o.nomJour} du jour`, jourVisible, o.couleurJour, (actif) => {
      jourVisible = actif;
      dessinerAnnee(placeRestante());
    }));
  }

  const ecart = document.createElement("span");
  ecart.className = "ecart";
  pastillesEl.appendChild(ecart);

  if (!modeAnomalies && !o.cumulJour) {
    pastillesEl.appendChild(pastille("Moyenne du jour", normaleVisible, "var(--encre-3)", (actif) => {
      normaleVisible = actif;
      dessinerAnnee(placeRestante());
    }));
  }
  // le choix de la période de référence ne sert que là où elle fait le zéro ou le fond
  if (modeAnomalies || !o.cumulJour) {
    const periode = pastille(`Période ${REFERENCE.debut}-${REFERENCE.fin}`,
                             normaleSurReference, null, (actif) => {
      normaleSurReference = actif;
      dessinerAnnee(placeRestante());
    });
    periode.id = "pastille-periode";
    pastillesEl.appendChild(periode);
    majPastillePeriode();
  }
}

/** La période de référence ne se coche que quand ses relevés sont arrivés. */
function majPastillePeriode() {
  const b = document.getElementById("pastille-periode");
  if (!b) return;
  const dispo = !!referenceRows();
  b.disabled = !dispo;
  b.title = dispo ? "" : "Relevés 1960-1990 en cours de chargement";
}

/** La largeur qui reste à droite du profil des mois, sur la même ligne. */
function placeRestante() {
  return document.getElementById("bas").clientWidth
       - figMois.closest(".figure").getBoundingClientRect().width - ECART_CARTES - GARDE;
}

btnAnomalies.addEventListener("click", () => {
  modeAnomalies = !modeAnomalies;
  btnAnomalies.setAttribute("aria-pressed", String(modeAnomalies));
  const titre = modeAnomalies
    ? "Revenir aux valeurs relevées"
    : "Afficher les écarts à la moyenne du jour";
  btnAnomalies.title = titre;
  btnAnomalies.setAttribute("aria-label", titre);
  pastillesOnglet = null;   // les pastilles utiles ne sont pas les mêmes dans les deux modes
  dessinerAnnee(placeRestante());
});

anneePrec.addEventListener("click", () => changerAnnee(-1));
anneeSuiv.addEventListener("click", () => changerAnnee(+1));

function changerAnnee(pas) {
  const dispo = anneesDisponibles();
  const i = dispo.indexOf(anneeAffichee) + pas;
  if (i < 0 || i >= dispo.length) return;
  anneeAffichee = dispo[i];
  dessinerAnnee(placeRestante());
}

const ECART_CARTES = 12;
const GARDE = 4;   // de quoi absorber les arrondis de largeur
const LARGEUR_ANNEE_MINI = 430;

/** La valeur quotidienne principale de l'onglet (la moyenne, quand il y a min et max). */
function valeurPrincipale(o) {
  return o.courbesJour ? o.courbesJour.find((k) => k.cle === "moy").f : o.jour;
}

/** Le repère « moyenne du jour ». En mode anomalies il est toujours calculé : c'est lui
    qui sert de zéro. */
function normaleDuJour(o) {
  // toujours calculée sur les variables cumulées (leur moyenne générale est permanente)
  if (!normaleVisible && !modeAnomalies && !o.cumulJour) return null;
  // sur les variables cumulées, la moyenne générale est toujours celle de la période
  // affichée : c'est la comparaison que l'on veut d'un coup d'œil
  const surReference = normaleSurReference && (modeAnomalies || !o.cumulJour);
  const source = surReference ? referenceRows() : lignes;
  if (!source || source.length === 0) return null;
  const jours = normaleJournaliere(source, anneeAffichee, valeurPrincipale(o));
  return {
    jours,
    cumul: o.cumulJour && !modeAnomalies ? cumulNormale(jours) : null,
    nom: surReference
      ? `Moyenne ${REFERENCE.debut}-${REFERENCE.fin}`
      : "Moyenne de la période",
  };
}

function dessinerAnnee(placeRestante) {
  const o = ongletActif;
  const dispo = anneesDisponibles();
  if (!dispo.includes(anneeAffichee)) anneeAffichee = dispo[dispo.length - 1];

  titreAnnee.textContent = modeAnomalies
    ? `${o.nomJour} : écart à la moyenne du jour`
    : `${o.nomJour} jour par jour`;
  construirePastilles(o);
  anneeLibelle.textContent = anneeAffichee;
  anneePrec.disabled = anneeAffichee === dispo[0];
  anneeSuiv.disabled = anneeAffichee === dispo[dispo.length - 1];

  const total = document.getElementById("bas").clientWidth;
  const largeurDispo =
    (placeRestante !== undefined && placeRestante >= LARGEUR_ANNEE_MINI ? placeRestante : total)
    - MARGE_CARTE;
  const normale = normaleDuJour(o);
  const brutes = joursDeLAnnee(anneeAffichee, valeurPrincipale(o));
  const anomalies = modeAnomalies && normale
    ? brutes.map((v, i) => (v === null || normale.jours[i] === null ? null : v - normale.jours[i]))
    : null;

  const rendu = Graphiques.anneeJourParJour(figAnnee, {
    jours: o.courbesJour ? null : brutes,
    valeursBrutes: brutes,
    anomalies,
    courbes: modeAnomalies ? null : (o.courbesJour && o.courbesJour.map((k) => ({
      ...k, visible: courbesVisibles.has(k.cle),
      valeurs: courbesVisibles.has(k.cle) ? joursDeLAnnee(anneeAffichee, k.f) : [],
    }))),
    nbJours: joursDansLAnnee(anneeAffichee),
    annee: anneeAffichee,
    titreAxe: modeAnomalies ? `Écart (${o.uniteJour || "indice"})` : o.titreJourAxe,
    unite: o.uniteJour,
    decimales: 1,
    couleur: o.couleurJour,
    nom: o.nomJour,
    cumul: o.cumulJour && !modeAnomalies,
    cumulVisible,
    jourVisible,
    sens: o.divergent,
    couleurCumul: o.couleurCumul,
    normale: normaleVisible || modeAnomalies || o.cumulJour ? normale : null,
    // le coloriage de l'écart, lui, n'attend pas la pastille : c'est la lecture
    // principale de ces courbes
    ecartNormale: !modeAnomalies && !o.cumulJour && normale
      ? { valeurs: brutes, normale: normale.jours }
      : null,
  }, largeurDispo);
  // la légende suit le sens de la variable : le rouge dit l'excès pour la température,
  // le manque pour la pluie et la neige
  const teinteHaut = o.divergent > 0 ? "var(--div-chaud-2)" : "var(--div-froid-2)";
  const teinteBas = o.divergent > 0 ? "var(--div-froid-2)" : "var(--div-chaud-2)";
  legendeAnnee.innerHTML = modeAnomalies
    ? `<span><i class="cle" style="background: ${teinteHaut}"></i>Au-dessus de la moyenne</span>` +
      `<span><i class="cle" style="background: ${teinteBas}"></i>En dessous</span>`
    : !o.cumulJour
    ? `<span><i class="cle" style="background: ${teinteHaut}; opacity: 0.55"></i>Au-dessus de la moyenne du jour</span>` +
      `<span><i class="cle" style="background: ${teinteBas}; opacity: 0.55"></i>En dessous</span>`
    : o.cumulJour
    // la légende ne parle que de ce qui est effectivement à l'écran
    ? (jourVisible
        ? `<span><i class="cle" style="background: ${o.couleurJour}"></i>${o.nomJour} du jour</span>`
        : "") +
      (cumulVisible
        ? `<span><i class="cle cle-trait" style="background: ${o.couleurCumul}"></i>Cumul ${anneeAffichee}</span>` +
          `<span><i class="cle cle-trait" style="background: var(--encre-2)"></i>Moyenne de la période</span>` +
          `<span><i class="cle" style="background: ${teinteHaut}; opacity: 0.55"></i>Au-dessus de la moyenne</span>` +
          `<span><i class="cle" style="background: ${teinteBas}; opacity: 0.55"></i>En dessous</span>`
        : "")
    : "";
  document.getElementById("carte-annee").style.width =
    rendu.largeur ? `${rendu.largeur + MARGE_CARTE}px` : "";
}

// ---------- référence 1960-1990 et paquets d'années ----------
// La référence est une PÉRIODE FIXE, tirée des jours de la maille (qui partent toujours
// de 1959) et gardée en mémoire par maille.
// (La normale climatique de l'OMM est 1961-1990, sur trente ans tout rond ; on prend ici
// 1960-1990 comme demandé — changer les deux bornes ci-dessous suffit.)
const REFERENCE = { debut: 1960, fin: 1990 };
const REFERENCES = new Map();


const PAQUETS = [
  { cle: "5", annees: 5, nom: "Moyenne du lustre", couleur: "var(--encre-2)", epaisseur: 2 },
  { cle: "10", annees: 10, nom: "Moyenne de la décennie", couleur: "var(--encre)", epaisseur: 2.5 },
];
const paquetsVisibles = new Set(["10"]);

/**
 * Découpe la série en tranches de k années calées sur les multiples de k (1990-1999,
 * 2000-2009…), et donne la moyenne de chacune. Les tranches d'une seule année sont
 * écartées : une « moyenne » sur un point n'apprend rien et encombre.
 */
function paquetsDAnnees(series, k) {
  const blocs = [];
  for (let i = 0; i < series.length; i++) {
    const debut = Math.floor(series[i].annee / k) * k;
    const bloc = blocs[blocs.length - 1];
    if (bloc && bloc.debut === debut) { bloc.dernier = i; bloc.valeurs.push(series[i].total); }
    else blocs.push({ debut, premier: i, dernier: i, valeurs: [series[i].total] });
  }
  return blocs
    .filter((b) => b.valeurs.length > 1)
    .map((b) => ({ ...b, moyenne: moyenne(b.valeurs) }));
}

/**
 * Le réglage du seuil : deux pastilles pour le sens, un curseur pour la valeur.
 *
 * Construit une seule fois — le refaire à chaque redessin détacherait le curseur qu'on
 * est en train de faire glisser.
 */
function construireReglageSeuil() {
  const conteneur = reglageSeuil;
  if (!conteneur.dataset.pret) {
    conteneur.dataset.pret = "1";
    const intitule = document.createElement("span");
    intitule.className = "intitule";
    intitule.textContent = "Compter les jours dont la température";
    conteneur.appendChild(intitule);

    for (const sens of ["min", "max"]) {
      // choix exclusif : recliquer sur la pastille active ne l'éteint pas
      const b = pastille(SEUIL[sens].sens, sens === seuilSens, null, () => {
        seuilSens = sens;
        majReglageSeuil();
        dessinerComptes();
      });
      b.dataset.sens = sens;
      conteneur.appendChild(b);
    }

    const curseur = document.createElement("input");
    curseur.type = "range";
    curseur.step = "1";
    curseur.className = "curseur-seuil";
    curseur.id = "curseur-seuil";
    curseur.setAttribute("aria-label", "Seuil de température");
    curseur.addEventListener("input", () => {
      seuilValeur[seuilSens] = +curseur.value;
      majReglageSeuil();
      dessinerComptes();
    });
    conteneur.appendChild(curseur);

    const valeur = document.createElement("output");
    valeur.className = "valeur-seuil";
    valeur.id = "valeur-seuil";
    valeur.htmlFor = "curseur-seuil";
    conteneur.appendChild(valeur);
  }
  majReglageSeuil();
}

/** Recale les bornes du curseur sur le sens choisi, et la couleur sur la valeur. */
function majReglageSeuil() {
  const s = SEUIL[seuilSens];
  const v = seuilValeur[seuilSens];
  for (const b of reglageSeuil.querySelectorAll(".pastille")) {
    b.setAttribute("aria-pressed", String(b.dataset.sens === seuilSens));
  }
  const curseur = document.getElementById("curseur-seuil");
  curseur.min = String(s.bornes[0]);
  curseur.max = String(s.bornes[1]);
  curseur.value = String(v);
  // le curseur et la valeur prennent la teinte du seuil : on voit la sévérité avant
  // même de regarder la figure
  const { solide, melange } = couleurSeuil();
  for (const el of [curseur, document.getElementById("valeur-seuil")]) {
    el.style.accentColor = solide;
    el.style.accentColor = melange;
    el.style.color = solide;
    el.style.color = melange;
  }
  document.getElementById("valeur-seuil").textContent = `${seuilSens === "min" ? "<" : ">"} ${degre(v)}`;
}

/** Les pastilles des paquets, dans chacune des cartes annuelles, sur un état commun. */
function construirePastillesPaquets(conteneur) {
  if (!conteneur.dataset.pret) {
    conteneur.dataset.pret = "1";
    const intitule = document.createElement("span");
    intitule.className = "intitule";
    intitule.textContent = "Comparer par paquets de :";
    conteneur.appendChild(intitule);
    for (const p of PAQUETS) {
      const b = pastille(`${p.annees} ans`, paquetsVisibles.has(p.cle), p.couleur, (actif) => {
        if (actif) paquetsVisibles.add(p.cle);
        else paquetsVisibles.delete(p.cle);
        dessiner();
      });
      b.dataset.cle = p.cle;
      b.querySelector("i").style.height = `${p.epaisseur}px`;
      conteneur.appendChild(b);
    }
  }
  // les deux cartes partagent le même état : on resynchronise à chaque passage
  for (const b of conteneur.querySelectorAll(".pastille")) {
    b.setAttribute("aria-pressed", String(paquetsVisibles.has(b.dataset.cle)));
  }
}

// ---------- découpage par décennie de la figure mensuelle ----------
// Même geste que pour le détail journalier : un bouton pour entrer dans le mode, deux
// flèches pour se déplacer. La figure reste celle de l'onglet (colonnes, P/ETP…), on ne
// change que les relevés qui l'alimentent — comparer sept jeux de colonnes sur une même
// figure ne marchait pas.
let decennieActive = null;   // null = toute la période

/** Les décennies présentes dans les relevés, de la plus ancienne à la plus récente. */
function decenniesDisponibles() {
  const compte = new Map();
  for (const r of lignes) {
    const debut = Math.floor(r.year / 10) * 10;
    compte.set(debut, (compte.get(debut) || 0) + 1);
  }
  return [...compte.entries()]
    .filter(([, n]) => n >= 700)   // moins de deux ans : la moyenne mensuelle ne tient pas
    .map(([debut]) => debut)
    .sort((x, y) => x - y);
}

const libelleDecennie = (debut) => `${debut}-${debut + 10}`;

btnDecennie.addEventListener("click", () => {
  const dispo = decenniesDisponibles();
  decennieActive = decennieActive === null ? dispo[dispo.length - 1] : null;
  dessiner();
});
decPrec.addEventListener("click", () => changerDecennie(-1));
decSuiv.addEventListener("click", () => changerDecennie(+1));

function changerDecennie(pas) {
  const dispo = decenniesDisponibles();
  const i = dispo.indexOf(decennieActive) + pas;
  if (i < 0 || i >= dispo.length) return;
  decennieActive = dispo[i];
  dessiner();
}

/** Les relevés de la décennie choisie, ou tous. */
function lignesDeLaFigureMensuelle() {
  if (decennieActive === null) return lignes;
  return lignes.filter((r) => Math.floor(r.year / 10) * 10 === decennieActive);
}

function majNavDecennie() {
  const dispo = lignes ? decenniesDisponibles() : [];
  if (decennieActive !== null && !dispo.includes(decennieActive)) {
    decennieActive = dispo.length ? dispo[dispo.length - 1] : null;
  }
  btnDecennie.setAttribute("aria-pressed", String(decennieActive !== null));
  navDecennie.hidden = decennieActive === null;
  if (decennieActive === null) return;
  decLibelle.textContent = libelleDecennie(decennieActive);
  decPrec.disabled = decennieActive === dispo[0];
  decSuiv.disabled = decennieActive === dispo[dispo.length - 1];
}

// ---------- affichage ----------
// bordures + rembourrage horizontal d'une carte de figure (voir .figure dans style.css)
const MARGE_CARTE = 46;

/** Un onglet par son identifiant. */
const onglet = (id) => ONGLETS.find((o) => o.id === id);

/** Les sept bandes de la frise et des tuiles : la chaleur d'abord, l'eau ensuite. Chaque
 *  bande reprend la série annuelle de son onglet, donc ses années (civiles ou
 *  hydrologiques), son unité et son sens du rouge. */
function grandeursAnnuelles() {
  const ref = referenceRows();
  const depuis = (o, nom, groupe, bis = false) => {
    const f = bis ? o.annuelBis : o.annuel;
    const options = bis ? o.optionsAnnuelBis : o.optionsAnnuel;
    const serie = f(lignes);
    const reference = ref && ref.length ? f(ref) : null;
    const surReference = !!(reference && reference.length);
    return {
      nom, groupe, onglet: o, serie, surReference,
      centre: surReference ? moyenne(reference.map((s) => s.total))
                           : serie.length ? moyenne(serie.map((s) => s.total)) : NaN,
      divergent: bis ? o.divergentBis : o.divergent,
      unite: options.unite,
      decimales: options.decimales || 0,
      libelle: options.libelle || ((a) => `${a - 1}–${a}`),
    };
  };
  return [
    depuis(onglet("temperature"), "Température", "chaleur"),
    depuis(onglet("humidex"), "Humidex", "chaleur"),
    depuis(onglet("etp"), "Évapotranspiration", "chaleur"),
    depuis(onglet("pluie"), "Précipitations", "eau"),
    depuis(onglet("etp"), "Bilan P − ETP", "eau", true),
    depuis(onglet("neige"), "Neige", "eau"),
    depuis(onglet("manteau"), "Manteau neigeux", "eau"),
  ];
}

const RECENTES = 10;   // les « années récentes » des tuiles

/** L'écart des dix dernières années complètes à la référence, en clair et coloré dans le
 *  sens de la grandeur (rouge = plus chaud ou plus sec). */
function ecartRecent(g, enPourcentage = false) {
  if (!g.surReference || g.serie.length < RECENTES) return "";
  const tranche = g.serie.slice(-RECENTES);
  const recent = moyenne(tranche.map((s) => s.total));
  const ecart = recent - g.centre;
  const signe = ecart >= 0 ? "+" : "−";
  const texte = enPourcentage && g.centre > 0
    ? `${signe}${nf(Math.abs(ecart / g.centre) * 100)} %`
    : `${signe}${nf(Math.abs(ecart), g.decimales)}${g.unite ? ` ${g.unite}` : ""}`;
  const teinte = ecart * g.divergent > 0 ? "var(--div-chaud-2)" : "var(--div-froid-2)";
  // les années hydrologiques portent le nom de l'année où elles finissent
  const premiere = g.libelle(tranche[0].annee).split("–")[0];
  const derniere = g.libelle(tranche[tranche.length - 1].annee).split("–").pop();
  return `<b style="color: ${teinte}">${texte}</b> en ${premiere}-${derniere} ` +
         `face à ${REFERENCE.debut}-${REFERENCE.fin}`;
}

/** Les chiffres de base de la maille, en tête de la présentation. */
function resume() {
  const g = Object.fromEntries(grandeursAnnuelles().map((x) => [x.nom, x]));
  const moy = (x) => (x.serie.length ? moyenne(x.serie.map((s) => s.total)) : NaN);
  const val = (x, d = 0) => (isNaN(moy(x)) ? "—" : nf(moy(x), d));
  const t = g["Température"];
  const p = g["Précipitations"];
  const e = g["Évapotranspiration"];
  const bilan = g["Bilan P − ETP"];
  const neige = g["Neige"];
  const bilanTxt = isNaN(moy(bilan)) ? "—" : `${moy(bilan) >= 0 ? "+" : "−"}${nf(Math.abs(moy(bilan)))}`;

  resumeDiv.innerHTML =
    tuile("Température moyenne", val(t, 1), "°C", ecartRecent(t)) +
    tuile("Cumul annuel moyen", val(p), "mm", ecartRecent(p, true)) +
    tuile("ETP annuelle moyenne", val(e), "mm", ecartRecent(e, true)) +
    tuile("Bilan P − ETP", bilanTxt, "mm", ecartRecent(bilan)) +
    tuile("Neige annuelle", val(neige), "mm", ecartRecent(neige, true)) +
    tuileAltitude();
}

/** La frise des années, sur toute la largeur. */
function dessinerFrise() {
  resume();
  const rangs = grandeursAnnuelles();
  const dispo = document.getElementById("bas").clientWidth - MARGE_CARTE;
  Graphiques.frise(figFrise, rangs, dispo, (rang, annee) => {
    anneeAffichee = annee;   // le détail jour par jour s'ouvre sur l'année cliquée
    ouvrirPartie(rang.onglet);
  });
  const avecReference = rangs.some((r) => r.surReference);
  echelleFrise.innerHTML =
    `<span>plus frais, plus humide</span><span class="marches">` +
    ["froid-3", "froid-2", "froid-1", "neutre", "chaud-1", "chaud-2", "chaud-3"]
      .map((m) => `<i style="background: var(--div-${m})"></i>`).join("") +
    `</span><span>plus chaud, plus sec</span>` +
    `<span class="muted">— écart ${avecReference
      ? `à la référence ${REFERENCE.debut}-${REFERENCE.fin}`
      : "à la moyenne de la période"}</span>`;
}

// ---------- titre de la maille : la commune où elle tombe ----------
// Une maille ne parle à personne par son identifiant : on lui cherche un nom de lieu à
// son centre. France : la commune (geo.api.gouv.fr, sans clé). Royaume-Uni : le lieu
// habité le plus proche (Nominatim, OpenStreetMap). Faute de réponse, on garde
// l'identifiant seul.
const NOMS = new Map();   // « source:id » → nom de lieu (ou "" si aucun)

function centreMaille(cell) {
  return cell.source === "safran" ? lambertIIEtenduToWGS84(cell.x, cell.y)
                                  : { lat: cell.lat, lon: cell.lon };
}

async function nomDeLieu(cell) {
  const cle = cleMaille(cell);
  if (NOMS.has(cle)) return NOMS.get(cle);
  const { lat, lon } = centreMaille(cell);
  let nom = "";
  try {
    if (cell.source === "safran") {
      const q = new URLSearchParams({ lat: lat.toFixed(5), lon: lon.toFixed(5), fields: "nom", format: "json" });
      const r = await fetch(`https://geo.api.gouv.fr/communes?${q}`);
      if (r.ok) nom = (await r.json())[0]?.nom || "";
    } else {
      const q = new URLSearchParams({ lat: lat.toFixed(4), lon: lon.toFixed(4), zoom: "12",
                                      format: "jsonv2", "accept-language": "fr" });
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?${q}`);
      if (r.ok) {
        const a = (await r.json()).address || {};
        nom = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || "";
      }
    }
  } catch { /* hors ligne : l'identifiant suffira */ }
  NOMS.set(cle, nom);
  return nom;
}

/** Le nom d'une maille enregistrée l'emporte : c'est celui que l'utilisateur a choisi. */
function nomAffiche(cell) {
  const gardee = enregistrees.find((m) => m.cle === cleMaille(cell));
  return gardee?.nom || NOMS.get(cleMaille(cell)) || "";
}

function afficherTitre() {
  if (!currentCell) return;
  // le nom du lieu, seul ; l'identifiant de la maille passe en infobulle
  const nom = nomAffiche(currentCell);
  const id = titreMaille(currentCell);
  cellTitle.textContent = nom || id;
  cellTitle.title = nom ? id : "";
}

const echapper = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ---------- mailles enregistrées ----------
// Gardées dans le même cache que les relevés ERA5 : un fichier dans Application Support
// côté app Mac (le stockage d'une page file:// n'est pas garanti), IndexedDB ailleurs.
let enregistrees = [];   // [{ cle, nom }]
const CLE_ENREGISTREES = "mailles_enregistrees";

CacheDisque.lire(CLE_ENREGISTREES).then((liste) => {
  if (Array.isArray(liste)) enregistrees = liste.filter((m) => POLYGONES.has(m.cle));
  majEnregistrees();
});

function sauverEnregistrees() {
  CacheDisque.ecrire(CLE_ENREGISTREES, enregistrees);
  majEnregistrees();
}

btnEnregistrer.addEventListener("click", async () => {
  if (!currentCell) return;
  const cle = cleMaille(currentCell);
  const i = enregistrees.findIndex((m) => m.cle === cle);
  const cell = currentCell;
  if (i >= 0) {
    enregistrees.splice(i, 1);
    oublierDonnees(cell);
  } else {
    enregistrees.push({ cle, nom: (await nomDeLieu(cell)) || titreMaille(cell) });
    // ses jours sont déjà là : on les écrit tout de suite sur le disque
    if (cell.source === "safran" && currentCell === cell && lignes && sourceLignes === "safran") {
      garderSafran(cell, lignes);
    }
  }
  sauverEnregistrees();
  afficherTitre();
});

/** Retirer une maille de la liste efface aussi ses jours du disque. (Le cache ERA5 du
 *  Royaume-Uni est gardé : il protège le quota d'Open-Meteo, enregistrée ou non.) */
function oublierDonnees(cell) {
  if (cell.source !== "safran") return;
  SAFRAN_EN_MEMOIRE.delete(cell.id);
  CacheDisque.supprimer(cleSafran(cell));
}

function ouvrirEnregistree(m) {
  const poly = POLYGONES.get(m.cle);
  if (!poly) return;
  // on y va : la maille enregistrée est cadrée de près, quelle que soit la vue d'avant
  map.setView(poly.getBounds().getCenter(), Math.max(map.getZoom(), 8));
  if (poly !== selectedPolygon) selectCell(poly);
}

/** Renomme sur place : double-clic sur le nom, Entrée pour garder, Échap pour annuler. */
function renommer(li, m) {
  const champ = document.createElement("input");
  champ.value = m.nom;
  champ.setAttribute("aria-label", "Nom de la maille");
  li.replaceChildren(champ);
  champ.focus();
  champ.select();
  let fini = false;
  const finir = (garder) => {
    if (fini) return;
    fini = true;
    if (garder && champ.value.trim()) m.nom = champ.value.trim();
    sauverEnregistrees();
    afficherTitre();
  };
  champ.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") finir(true);
    if (ev.key === "Escape") finir(false);
  });
  champ.addEventListener("blur", () => finir(true));
}

/** Le signet et la ligne surlignée suivent la maille choisie. La liste n'est PAS
 *  reconstruite ici : le bouton qu'on vient de cliquer serait détaché, et le second
 *  clic d'un double-clic (renommer) tomberait dans le vide. */
function majSignet() {
  const cle = currentCell ? cleMaille(currentCell) : null;
  const gardee = enregistrees.some((m) => m.cle === cle);
  btnEnregistrer.disabled = !currentCell;
  btnEnregistrer.setAttribute("aria-pressed", String(gardee));
  const titre = gardee ? "Retirer cette maille des mailles enregistrées" : "Enregistrer cette maille";
  btnEnregistrer.title = titre;
  btnEnregistrer.setAttribute("aria-label", titre);
  for (const li of listeEnregistrees.children) li.classList.toggle("active", li.dataset.cle === cle);
}

function majEnregistrees() {
  aucuneEnregistree.hidden = enregistrees.length > 0;
  listeEnregistrees.replaceChildren(...enregistrees.map((m) => {
    const li = document.createElement("li");
    li.dataset.cle = m.cle;
    const ouvrir = document.createElement("button");
    ouvrir.type = "button";
    ouvrir.className = "ouvrir";
    ouvrir.title = "Ouvrir · double-clic pour renommer";
    const poly = POLYGONES.get(m.cle);
    ouvrir.innerHTML = `<span class="nom">${echapper(m.nom)}</span>` +
      `<span class="detail">${echapper(titreMaille(poly.cellData).replace(/^Maille /, ""))}` +
      ` · ${poly.cellData.source === "safran" ? "France" : "Royaume-Uni"}</span>`;
    ouvrir.addEventListener("click", () => ouvrirEnregistree(m));
    ouvrir.addEventListener("dblclick", () => renommer(li, m));
    const retirer = document.createElement("button");
    retirer.type = "button";
    retirer.className = "retirer";
    retirer.textContent = "×";
    retirer.title = `Retirer ${m.nom}`;
    retirer.setAttribute("aria-label", `Retirer ${m.nom}`);
    retirer.addEventListener("click", () => {
      enregistrees = enregistrees.filter((x) => x !== m);
      if (poly) oublierDonnees(poly.cellData);
      sauverEnregistrees();
      afficherTitre();
    });
    li.append(ouvrir, retirer);
    return li;
  }));
  majSignet();
}

function dessiner() {
  if (!lignes) return;
  if (partieActive === PRESENTATION) { dessinerFrise(); return; }
  const o = ongletActif;
  const dispo = document.getElementById("bas").clientWidth - MARGE_CARTE;

  titreMois.textContent = decennieActive === null
    ? o.titreMois
    : `${o.titreMois} — ${libelleDecennie(decennieActive)}`;
  titreAnnuel.textContent = o.titreAnnuel;
  sousTitreAnnuel.textContent = o.sousTitreAnnuel;
  noteMois.textContent = o.note || "";
  noteMois.hidden = !o.note;

  majNavDecennie();
  const d = o.mois(lignesDeLaFigureMensuelle());
  const rendu = o.dessineMois(d, dispo);
  figMois.closest(".figure").style.width = `${rendu.largeur + MARGE_CARTE}px`;

  const secs = rendu.secs || Array(12).fill(false);
  tableMois.innerHTML = tableauMois(secs, o.tableMois(d, secs));

  legendeMois.innerHTML = o.legende === true
    ? `<span><i class="cle" style="background: var(--serie-pluie)"></i>Pluie</span>` +
      `<span><i class="cle" style="background: var(--serie-neige)"></i>Neige</span>` +
      `<span><i class="cle cle-trait" style="background: var(--serie-etp)"></i>Évapotranspiration potentielle</span>` +
      `<span><i class="cle cle-bande"></i>Mois en déficit (P &lt; ETP)</span>`
    : Array.isArray(o.legende)
      ? o.legende.map(([nom, couleur, forme]) =>
          `<span><i class="cle ${forme === "trait" ? "cle-trait" : ""}" style="background: ${couleur}` +
          `${forme === "bande" ? "; opacity: 0.25" : ""}"></i>${nom}</span>`).join("")
      : "";

  const total = document.getElementById("bas").clientWidth;
  dessinerAnnee(total - figMois.closest(".figure").getBoundingClientRect().width
                       - ECART_CARTES - GARDE);

  construirePastillesPaquets(pastillesPaquets);
  dessinerFigureAnnuelle({
    serie: o.annuel(lignes),
    reference: referenceRows() && o.annuel(referenceRows()),
    options: o.optionsAnnuel,
    divergent: o.divergent,
    mots: o.motsEcart,
    hote: figAnnuel, echelle: echelleAnnuel, table: tableAnnuel,
    dispo,
  });

  carteJoursPluie.hidden = !o.joursPluie;
  if (o.joursPluie) {
    construireReglagePluie();
    dessinerJoursPluie();
  }

  carteAnnuelBis.hidden = !(o.annuelBis || o.comptes);
  reglageSeuil.hidden = !o.comptes;
  if (o.comptes) {
    // un seuil à la fois : pas de paquets d'années ni d'échelle divergente ici, c'est le
    // réglage au-dessus de la figure qui la commande
    pastillesPaquetsBis.hidden = true;
    construireReglageSeuil();
    titreAnnuelBis.textContent = o.titreAnnuelBis;
    sousTitreAnnuelBis.textContent = o.sousTitreAnnuelBis;
    dessinerComptes();
  } else if (o.annuelBis) {
    pastillesPaquetsBis.hidden = false;
    construirePastillesPaquets(pastillesPaquetsBis);
    titreAnnuelBis.textContent = o.titreAnnuelBis;
    sousTitreAnnuelBis.textContent = o.sousTitreAnnuelBis;
    dessinerFigureAnnuelle({
      serie: o.annuelBis(lignes),
      reference: referenceRows() && o.annuelBis(referenceRows()),
      options: o.optionsAnnuelBis,
      divergent: o.divergentBis,
      mots: o.motsEcartBis,
      hote: figAnnuelBis, echelle: echelleAnnuelBis, table: tableAnnuelBis,
      dispo,
    });
  }
}

/** Les jours de la période de référence, ou `null` tant qu'ils ne sont pas arrivés. */
function referenceRows() {
  return (currentCell && REFERENCES.get(currentCell.id)) || null;
}

function dessinerFigureAnnuelle({ serie, reference, options, divergent, mots, hote, echelle, table, dispo }) {
  const paquets = PAQUETS
    .filter((p) => paquetsVisibles.has(p.cle))
    .map((p) => ({ ...p, blocs: paquetsDAnnees(serie, p.annees) }));

  const repere = reference && reference.length
    ? { valeur: moyenne(reference.map((s) => s.total)),
        libelle: `référence ${REFERENCE.debut}-${REFERENCE.fin} :` }
    : null;

  const rendu = Graphiques.cumulsAnnuels(hote, serie, dispo,
    { ...options, paquets, divergent, reference: repere });

  echelle.innerHTML = serie.length ? echelleEcart({ divergent, motsEcart: mots, repere }) : "";
  hote.closest(".figure").style.width = rendu ? `${rendu.largeur + MARGE_CARTE}px` : "";

  const libelleAnnee = options.libelle || ((a) => `${a - 1}–${a}`);
  table.innerHTML = tableau(["Année", options.titreAxe],
    serie.map((s) => [libelleAnnee(s.annee), nf(s.total, options.decimales || 0)]), true);
}

/**
 * La figure des jours extrêmes, redessinée seule.
 *
 * Le curseur la rafraîchit à chaque cran : refaire toutes les figures de l'onglet à
 * chaque pixel de glissement serait inutilement lourd.
 */
function dessinerComptes() {
  const o = ongletActif;
  if (!o.comptes || !lignes) return;
  dessinerFigureComptes({
    donnees: o.comptes(lignes),
    options: o.optionsComptes,
    hote: figAnnuelBis, echelle: echelleAnnuelBis, table: tableAnnuelBis,
    dispo: document.getElementById("bas").clientWidth - MARGE_CARTE,
  });
}

function dessinerFigureComptes({ donnees, options, hote, echelle, table, dispo }) {
  const rendu = Graphiques.comptesAnnuels(hote, donnees, dispo, options);

  echelle.innerHTML = "";   // la légende, ce sont les pastilles
  hote.closest(".figure").style.width = rendu && rendu.largeur ? `${rendu.largeur + MARGE_CARTE}px` : "";

  table.innerHTML = tableau(["Année", "Jours mesurés", donnees.serie.nom],
    donnees.annees.map((an, i) =>
      [an, nf(donnees.jours[i]), nf(donnees.serie.valeurs[i])]), true);
}

/**
 * Le réglage des jours de pluie : le sens et le seuil sur une ligne, la période sur
 * l'autre. Construit une seule fois, comme le réglage du seuil de température : le
 * refaire à chaque redessin ferait perdre le champ qu'on est en train de taper.
 */
function construireReglagePluie() {
  if (reglagePluieSeuil.dataset.pret) return;
  reglagePluieSeuil.dataset.pret = "1";

  const intitule = (texte, parent) => {
    const s = document.createElement("span");
    s.className = "intitule";
    s.textContent = texte;
    parent.appendChild(s);
  };

  intitule("Compter les jours qui reçoivent", reglagePluieSeuil);
  for (const [sens, texte] of [["auMoins", "au moins"], ["plusDe", "plus de"]]) {
    // choix exclusif : recliquer sur la pastille active ne l'éteint pas
    const b = pastille(texte, sens === pluiePeriode.sens, null, () => {
      pluiePeriode.sens = sens;
      for (const autre of reglagePluieSeuil.querySelectorAll(".pastille")) {
        autre.setAttribute("aria-pressed", String(autre.dataset.sens === sens));
      }
      dessinerJoursPluie();
    });
    b.dataset.sens = sens;
    reglagePluieSeuil.appendChild(b);
  }
  const champ = document.createElement("input");
  champ.type = "number";
  champ.min = "0";
  champ.max = "200";
  champ.step = "0.5";
  champ.value = String(pluiePeriode.seuil);
  champ.setAttribute("aria-label", "Seuil de pluie en millimètres");
  champ.addEventListener("input", () => {
    const v = parseFloat(champ.value.replace(",", "."));
    if (isNaN(v) || v < 0) return;
    pluiePeriode.seuil = v;
    dessinerJoursPluie();
  });
  reglagePluieSeuil.appendChild(champ);
  const unite = document.createElement("span");
  unite.className = "unite-seuil";
  unite.textContent = "mm";
  reglagePluieSeuil.appendChild(unite);

  // la période : jour + mois pour chaque borne
  intitule("Du", reglagePluiePeriode);
  const listes = {};
  for (const borne of ["debut", "fin"]) {
    if (borne === "fin") intitule("au", reglagePluiePeriode);
    const jour = document.createElement("select");
    jour.setAttribute("aria-label", borne === "debut" ? "Jour de début" : "Jour de fin");
    for (let j = 1; j <= 31; j++) jour.add(new Option(j === 1 ? "1ᵉʳ" : String(j), String(j)));
    const mois = document.createElement("select");
    mois.setAttribute("aria-label", borne === "debut" ? "Mois de début" : "Mois de fin");
    MOIS_LONGS.forEach((m, i) => mois.add(new Option(m, String(i + 1))));
    const maj = () => {
      // pas de 31 juin : le jour est ramené à la fin du mois choisi
      const max = JOURS_MOIS[+mois.value - 1];
      if (+jour.value > max) jour.value = String(max);
      pluiePeriode[borne] = { mois: +mois.value, jour: +jour.value };
      majRaccourcis();
      dessinerJoursPluie();
    };
    jour.addEventListener("change", maj);
    mois.addEventListener("change", maj);
    reglagePluiePeriode.append(jour, mois);
    listes[borne] = { jour, mois };
  }

  // quelques périodes toutes faites
  const RACCOURCIS = [
    ["Année", { mois: 1, jour: 1 }, { mois: 12, jour: 31 }],
    ["Été", { mois: 6, jour: 1 }, { mois: 8, jour: 31 }],
    ["Juin – août + 1ᵉʳ sept.", { mois: 6, jour: 1 }, { mois: 9, jour: 1 }],
    ["Avril – septembre", { mois: 4, jour: 1 }, { mois: 9, jour: 30 }],
    ["Hiver", { mois: 12, jour: 1 }, { mois: 2, jour: 29 }],
  ];
  const ecart = document.createElement("span");
  ecart.className = "ecart";
  reglagePluiePeriode.appendChild(ecart);
  const boutons = RACCOURCIS.map(([texte, debut, fin]) => {
    const b = pastille(texte, false, null, () => {
      pluiePeriode.debut = { ...debut };
      pluiePeriode.fin = { ...fin };
      for (const borne of ["debut", "fin"]) {
        listes[borne].jour.value = String(pluiePeriode[borne].jour);
        listes[borne].mois.value = String(pluiePeriode[borne].mois);
      }
      majRaccourcis();
      dessinerJoursPluie();
    });
    reglagePluiePeriode.appendChild(b);
    return [b, debut, fin];
  });
  // la pastille allumée est celle qui correspond à la période réglée, quel que soit
  // le chemin pris pour y arriver
  function majRaccourcis() {
    for (const [b, debut, fin] of boutons) {
      const pareil = cleMoisJour(debut) === cleMoisJour(pluiePeriode.debut) &&
                     cleMoisJour(fin) === cleMoisJour(pluiePeriode.fin);
      b.setAttribute("aria-pressed", String(pareil));
    }
  }
  for (const borne of ["debut", "fin"]) {
    listes[borne].jour.value = String(pluiePeriode[borne].jour);
    listes[borne].mois.value = String(pluiePeriode[borne].mois);
  }
  majRaccourcis();

  document.getElementById("pluie-prec").addEventListener("click", () => changerAnneePluie(-1));
  document.getElementById("pluie-suiv").addEventListener("click", () => changerAnneePluie(+1));
}

let anneesPluie = [];
function changerAnneePluie(delta) {
  const i = anneesPluie.indexOf(pluiePeriode.annee);
  const j = Math.max(0, Math.min(anneesPluie.length - 1, i + delta));
  if (j === i) return;
  pluiePeriode.annee = anneesPluie[j];
  dessinerJoursPluie();
}

/**
 * Les deux figures des jours de pluie : une colonne par année, puis le détail de
 * l'année choisie (clic sur une colonne, ou flèches). Redessinées seules : taper le
 * seuil chiffre par chiffre ne refait pas tout l'onglet.
 */
function dessinerJoursPluie() {
  if (!ongletActif.joursPluie || !lignes) return;
  const dispo = document.getElementById("bas").clientWidth - MARGE_CARTE;
  const donnees = comptesPluie(lignes);
  anneesPluie = donnees.annees;
  if (!anneesPluie.includes(pluiePeriode.annee)) {
    pluiePeriode.annee = anneesPluie.length ? anneesPluie[anneesPluie.length - 1] : null;
  }
  const iChoisie = anneesPluie.indexOf(pluiePeriode.annee);

  sousTitreJoursPluie.textContent =
    `Nombre de jours du ${libellePeriode()} qui reçoivent ${libelleSeuilPluie()} de ` +
    `précipitations (pluie + neige), bornes comprises. Cliquer une colonne pour voir ` +
    `cette année jour par jour en dessous.`;

  const rendu = Graphiques.comptesAnnuels(figJoursPluie, donnees, dispo, {
    titreAxe: "Nombre de jours", unite: "j",
    selection: iChoisie,
    libelle: (a) => libelleAnneePeriode(a),
    libelleLong: (a) => {
      const { debut, fin } = bornesPeriode(a);
      const f = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
      return `${f(debut)} – ${f(fin)}`;
    },
    texteIncomplet: "période incomplète",
    auClic: (i) => { pluiePeriode.annee = anneesPluie[i]; dessinerJoursPluie(); },
  });

  // le détail de l'année choisie
  let largeurDetail = 0;
  document.getElementById("pluie-libelle").textContent =
    pluiePeriode.annee === null ? "—" : libelleAnneePeriode(pluiePeriode.annee);
  document.getElementById("pluie-prec").disabled = iChoisie <= 0;
  document.getElementById("pluie-suiv").disabled = iChoisie < 0 || iChoisie >= anneesPluie.length - 1;
  if (pluiePeriode.annee === null) {
    titreJoursAnnee.textContent = "";
    figJoursAnnee.innerHTML = "";
  } else {
    const { debut, jours } = joursDeLaPeriode(pluiePeriode.annee);
    const n = donnees.serie.valeurs[iChoisie];
    const moyennePeriode = donnees.serie.valeurs.reduce((a, b) => a + b, 0) / anneesPluie.length;
    titreJoursAnnee.textContent =
      `${libelleAnneePeriode(pluiePeriode.annee)} : ${nf(n)} jour${n > 1 ? "s" : ""} ` +
      `${libelleSeuilPluie()} (moyenne ${nf(moyennePeriode, 1)})`;
    const r = Graphiques.joursPeriode(figJoursAnnee, {
      jours, debut, seuil: pluiePeriode.seuil, compte: comptePluie,
      nom: "Précipitations", unite: "mm", libelleSeuil: `seuil ${libelleSeuilPluie()}`,
    }, dispo);
    largeurDetail = r.largeur;
  }

  const largeur = Math.max(rendu && rendu.largeur || 0, largeurDetail);
  carteJoursPluie.style.width = largeur ? `${largeur + MARGE_CARTE}px` : "";

  tableJoursPluie.innerHTML = tableau(["Période", "Jours mesurés", donnees.serie.nom],
    donnees.annees.map((an, i) => [libelleAnneePeriode(an),
      `${nf(donnees.jours[i])} / ${nf(donnees.attendus[i])}`, nf(donnees.serie.valeurs[i])]), true);
}

/** L'altitude moyenne de la maille, avec l'amplitude du relief qu'elle recouvre. */
function tuileAltitude() {
  if (altitude === null) {
    return tuile("Altitude moyenne", "…", "",
                 currentCell && currentCell.source === "era5" ? "Copernicus DEM" : "RGE ALTI (IGN)");
  }
  if (altitude === "erreur") return tuile("Altitude moyenne", "—", "", "altitude indisponible");
  return tuile("Altitude moyenne", nf(altitude.moyenne), "m",
               `de ${nf(altitude.min)} à ${nf(altitude.max)} m dans la maille`);
}

/** La légende de l'échelle divergente : sept marches, du plus bas au plus haut. */
function echelleEcart(o) {
  const marches = o.divergent > 0
    ? ["froid-3", "froid-2", "froid-1", "neutre", "chaud-1", "chaud-2", "chaud-3"]
    : ["chaud-3", "chaud-2", "chaud-1", "neutre", "froid-1", "froid-2", "froid-3"];
  return `<span>${o.motsEcart[0]}</span><span class="marches">` +
         marches.map((m) => `<i style="background: var(--div-${m})"></i>`).join("") +
         `</span><span>${o.motsEcart[1]}</span>` +
         `<span class="muted">— écart ${o.repere
            ? `à la référence ${REFERENCE.debut}-${REFERENCE.fin}`
            : "à la moyenne de la période"}</span>`;
}

function tuile(etiquette, valeur, unite, precision) {
  return `<div class="tuile"><span class="etiquette">${etiquette}</span>` +
         `<span class="valeur">${valeur} <span class="unite">${unite}</span></span>` +
         (precision ? `<span class="precision">${precision}</span>` : "") + `</div>`;
}

/** Tableau à mois en colonnes ; les mois secs ont leur colonne grisée. */
function tableauMois(secs, lignesTable) {
  const classe = (i) => (secs[i] ? ' class="sec"' : "");
  const th = MOIS.map((m, i) => `<th${classe(i)}>${m}</th>`).join("");
  const tr = lignesTable.map(([nom, valeurs]) =>
    `<tr><th scope="row">${nom}</th>` +
    valeurs.map((v, i) => `<td${classe(i)}>${v}</td>`).join("") + "</tr>").join("");
  return `<div class="large"><table><thead><tr><th></th>${th}</tr></thead>` +
         `<tbody>${tr}</tbody></table></div>` +
         (secs.some(Boolean) ? `<p class="note">Colonnes grisées : mois en déficit (P &lt; ETP).</p>` : "");
}

function tableau(entetes, lignesTable, defile = false) {
  const th = entetes.map((h) => `<th>${h}</th>`).join("");
  const tr = lignesTable.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  const t = `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  return defile ? `<div class="defile">${t}</div>` : t;
}

// le titre rétrécit quand on descend : de 0 (en haut) à 1 (après 140 px)
const basEl = document.getElementById("bas");
basEl.addEventListener("scroll", () => {
  selectionEl.style.setProperty("--repli", Math.min(1, basEl.scrollTop / 140).toFixed(3));
}, { passive: true });

// les figures sont dessinées à la largeur mesurée : il faut les refaire quand elle change
let minuteurRedessin = null;
function redessiner() {
  if (!lignes || (chartsDiv.hidden && presentationDiv.hidden)) return;
  clearTimeout(minuteurRedessin);
  minuteurRedessin = setTimeout(dessiner, 60);
}
window.addEventListener("resize", redessiner);
