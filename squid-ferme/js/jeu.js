'use strict';
/* Squid Ferme : état, temps, actions du joueur, affichage. */

// ---------- Monde ----------
const PT = 4, GAP = 1, PC = 4, PR = 3;            // parcelles de 4 × 4 cases, 4 colonnes × 3 rangées
const W = PC * (PT + GAP) + GAP, H = PR * (PT + GAP) + GAP;
const MAISON = '0,1';
const SURFACE_CASE = 100;                          // m²
const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DEBUT_MOIS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const HABITANTS = 80, BESOIN = 2500;               // kcal par personne et par jour
const PRIX_KCAL = 0.15 / 1000;                     // € payés par le village pour 1 kcal
const PRIX_FUMIER = 4, ARGENT_DEPART = 400;
const CLE = 'squid-ferme-1';

const OBJECTIFS = [
  { id: 'recolte', txt: 'Faire une première récolte', prime: 50, ok: () => S.stats.recoltes > 0 },
  { id: 'vente', txt: 'Gagner 1 000 € au marché', prime: 100, ok: () => S.stats.ventes >= 1000 },
  { id: 'parcelle', txt: 'Acheter une deuxième parcelle', prime: 150, ok: () => S.achats >= 1 },
  { id: 'village', txt: 'Nourrir tout le village pendant un mois', prime: 300, ok: () => S.village.plein },
  { id: 'kcal', txt: 'Produire 100 millions de kcal', prime: 500, ok: () => S.stats.kcal >= 1e8 },
  { id: 'vallee', txt: 'Posséder toute la vallée', prime: 0, ok: () => Object.keys(S.parcelles).length >= PC * PR - 1 },
];

let S;

// ---------- Outils ----------
const nf = (n, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const euros = n => (Math.abs(n) < 100 ? nf(n, 2) : nf(n)) + ' €';
const masse = kg => kg >= 1000 ? nf(kg / 1000, kg >= 10000 ? 0 : 1) + ' t' : nf(kg) + ' kg';
const energie = k => k >= 1e6 ? nf(k / 1e6, k >= 1e7 ? 0 : 1) + ' Mkcal' : nf(k) + ' kcal';
const cle = (x, y) => x + ',' + y;

function date(j = S.jour) {
  const a = 59 + j, an = Math.floor(a / 365) + 1, d = a % 365;
  let m = 11; while (DEBUT_MOIS[m] > d) m--;
  return { an, mois: m + 1, jour: d - DEBUT_MOIS[m] + 1 };
}
function texteDate() { const d = date(); return `${d.jour === 1 ? '1er' : d.jour} ${NOMS_MOIS[d.mois - 1]}, an ${d.an}`; }

function plages(ms) {
  const s = [...ms].sort((a, b) => a - b), out = [];
  let deb = s[0], prec = s[0];
  for (let i = 1; i <= s.length; i++) {
    if (s[i] === prec + 1) { prec = s[i]; continue; }
    out.push(deb === prec ? MOIS_COURT[deb - 1] : MOIS_COURT[deb - 1] + '–' + MOIS_COURT[prec - 1]);
    deb = prec = s[i];
  }
  return out.join(', ');
}
const semableMaintenant = c => c.semis.includes(date().mois);

// ---------- Parcelles ----------
function parcelleDe(tx, ty) {
  const lx = tx - GAP, ly = ty - GAP;
  if (lx < 0 || ly < 0) return null;
  const c = Math.floor(lx / (PT + GAP)), r = Math.floor(ly / (PT + GAP));
  if (c >= PC || r >= PR || lx % (PT + GAP) >= PT || ly % (PT + GAP) >= PT) return null;
  return { c, r, k: cle(c, r) };
}
function casesDe(c, r) {
  const out = [], x0 = GAP + c * (PT + GAP), y0 = GAP + r * (PT + GAP);
  for (let y = 0; y < PT; y++) for (let x = 0; x < PT; x++) out.push([x0 + x, y0 + y]);
  return out;
}
const prixParcelle = () => Math.round(600 * Math.pow(1.4, S.achats) / 10) * 10;
function achetable(c, r) {
  const k = cle(c, r);
  if (k === MAISON || S.parcelles[k]) return false;
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const v = cle(c + dx, r + dy); return S.parcelles[v] || v === MAISON; });
}
function ajouterParcelle(c, r) {
  S.parcelles[cle(c, r)] = true;
  for (const [x, y] of casesDe(c, r)) S.cases[cle(x, y)] = { n: 55 + Math.random() * 20, cult: null, p: 0, mur: 0, fam: null, rot: 1, al: 1, fum: 0 };
  fondSale = true;
}

// ---------- Partie ----------
function nouvellePartie() {
  S = { jour: 0, argent: ARGENT_DEPART, parcelles: {}, achats: 0, cases: {}, stock: [], marche: {},
    village: { mois: 0, total: 0, plein: false }, stats: { kcal: 0, kg: 0, recoltes: 0, ventes: 0 },
    objectifs: {}, journal: [], vitesse: 1 };
  for (const c of CULTURES) S.marche[c.id] = { sat: 0, f: 1 };
  ajouterParcelle(1, 1);
  noter('Vous héritez d’une parcelle de 1 600 m². Choisissez une semence, puis cliquez sur la terre.');
}
function sauver() { try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } }
function charger() {
  try {
    const t = localStorage.getItem(CLE);
    if (t) { S = JSON.parse(t); for (const c of CULTURES) S.marche[c.id] ??= { sat: 0, f: 1 }; return true; }
  } catch (e) { /* partie neuve */ }
  return false;
}

function noter(txt) {
  S.journal.unshift({ d: texteDate(), txt });
  S.journal.length = Math.min(S.journal.length, 40);
  majJournal();
}

// ---------- Stock ----------
const stockKg = id => S.stock.reduce((s, l) => s + (l.id === id ? l.kg : 0), 0);
function retirer(id, kg) {
  for (const l of S.stock) {
    if (l.id !== id || kg <= 0) continue;
    const q = Math.min(l.kg, kg); l.kg -= q; kg -= q;
  }
  S.stock = S.stock.filter(l => l.kg > 0.01);
}
function joursRestants(id) {
  const c = CULTURE[id]; let min = Infinity;
  for (const l of S.stock) if (l.id === id) min = Math.min(min, c.conserv - (S.jour - l.j));
  return min;
}

// ---------- Rendement ----------
const facteurAzote = n => 0.45 + 0.55 * Math.min(n, 70) / 70;
function rendementCase(t) {
  const c = CULTURE[t.cult];
  const perte = Math.max(0.2, 1 - Math.max(0, t.mur - 20) * 0.02);
  return c.rdt * 1000 * (SURFACE_CASE / 10000) * facteurAzote(t.n) * t.rot * t.al * perte;
}

// ---------- Marché et village ----------
function prixMarche(id) { const c = CULTURE[id], m = S.marche[id]; return c.prix * m.f / (1 + m.sat / c.demande); }
function recetteVente(id, kg) {
  const c = CULTURE[id], m = S.marche[id], n = 20, q = kg / n; let sat = m.sat, rec = 0;
  for (let i = 0; i < n; i++) { rec += q * c.prix * m.f / (1 + (sat + q / 2) / c.demande); sat += q; }
  return { rec, sat };
}
const demandeMois = () => HABITANTS * BESOIN * JM[date().mois - 1];
function livraisonPossible(id) {
  const c = CULTURE[id], reste = Math.max(0, demandeMois() - S.village.mois), parKg = c.kcal * 10;
  const kg = Math.min(stockKg(id), reste / parKg);
  return { kg, kcal: kg * parKg, rec: kg * parKg * PRIX_KCAL };
}

function vendre(id) {
  const kg = stockKg(id); if (!kg) return;
  const { rec, sat } = recetteVente(id, kg);
  S.marche[id].sat = sat; retirer(id, kg);
  S.argent += rec; S.stats.ventes += rec;
  noter(`${masse(kg)} de ${CULTURE[id].nom.toLowerCase()} vendus au marché : ${euros(rec)}.`);
  apresAction(true);
}
function livrer(id) {
  const l = livraisonPossible(id);
  if (l.kg <= 0) { toast('Le village a tout ce qu’il lui faut ce mois-ci.'); return; }
  retirer(id, l.kg);
  S.village.mois += l.kcal; S.village.total += l.kcal; S.argent += l.rec;
  if (S.village.mois >= demandeMois() - 1) S.village.plein = true;
  noter(`${masse(l.kg)} de ${CULTURE[id].nom.toLowerCase()} livrés au village (${energie(l.kcal)}) : ${euros(l.rec)}.`);
  apresAction(true);
}

// ---------- Actions sur les cases ----------
function semer(k, id, bavard) {
  const t = S.cases[k], c = CULTURE[id];
  if (t.cult) return false;
  if (!semableMaintenant(c)) { if (bavard) toast(`${c.nom} : semis en ${plages(c.semis)} seulement.`); return false; }
  if (S.argent < c.graine) { if (bavard) toast('Pas assez d’argent pour les semences.'); return false; }
  S.argent -= c.graine;
  Object.assign(t, { cult: id, p: 0, mur: 0, rot: t.fam === c.famille ? 0.85 : 1, al: 0.88 + Math.random() * 0.24 });
  return true;
}
function recolter(k, tx, ty) {
  const t = S.cases[k], c = CULTURE[t.cult];
  const kg = rendementCase(t), kcal = kg * c.kcal * 10;
  S.stock.push({ id: c.id, kg, j: S.jour });
  S.stats.kg += kg; S.stats.kcal += kcal; S.stats.recoltes++;
  t.n = Math.max(5, Math.min(100, t.n - c.azote));
  Object.assign(t, { fam: c.famille, cult: null, p: 0, mur: 0 });
  flottant(tx, ty, '+' + masse(kg));
}
function fumer(k, bavard) {
  const t = S.cases[k];
  if (t.n >= 95) { if (bavard) toast('Cette terre est déjà riche.'); return false; }
  if (S.argent < PRIX_FUMIER) { if (bavard) toast('Pas assez d’argent pour le fumier.'); return false; }
  S.argent -= PRIX_FUMIER; t.n = Math.min(100, t.n + 25); t.fum = 30;
  return true;
}
function arracher(k) { const t = S.cases[k]; if (!t.cult) return false; Object.assign(t, { cult: null, p: 0, mur: 0 }); return true; }

function acheter(c, r) {
  const prix = prixParcelle();
  if (!achetable(c, r)) return;
  if (S.argent < prix) { toast(`Il vous faut ${euros(prix)}.`); return; }
  S.argent -= prix; S.achats++;
  ajouterParcelle(c, r);
  noter(`Nouvelle parcelle achetée pour ${euros(prix)}. Vous cultivez ${nf(Object.keys(S.cases).length * SURFACE_CASE)} m².`);
  selection = null;
  apresAction(true);
}

// ---------- Temps ----------
function unJour() {
  const moisAvant = date().mois;
  S.jour++;
  let murs = new Set();
  for (const k in S.cases) {
    const t = S.cases[k];
    if (t.cult) {
      if (t.p < 1) { t.p += 1 / CULTURE[t.cult].cycle; if (t.p >= 1) { t.p = 1; murs.add(t.cult); } }
      else t.mur++;
    } else if (t.n < 75) t.n += 0.04;
    if (t.fum > 0) t.fum--;
  }
  if (murs.size) noter(`Prêt à récolter : ${[...murs].map(id => CULTURE[id].nom.toLowerCase()).join(', ')}.`);
  // Pertes en grange
  const pertes = {};
  S.stock = S.stock.filter(l => {
    if (S.jour - l.j <= CULTURE[l.id].conserv) return true;
    pertes[l.id] = (pertes[l.id] || 0) + l.kg; return false;
  });
  for (const id in pertes) { noter(`${masse(pertes[id])} de ${CULTURE[id].nom.toLowerCase()} ont pourri en grange.`); grangeSale = true; }
  for (const id in S.marche) S.marche[id].sat *= 0.97;
  if (date().mois !== moisAvant) nouveauMois(moisAvant);
}
function nouveauMois(ancien) {
  const part = S.village.mois / (HABITANTS * BESOIN * JM[ancien - 1]);
  if (S.village.mois > 0) noter(`En ${NOMS_MOIS[ancien - 1]}, le village a reçu ${nf(Math.min(100, part * 100))} % de ce qu’il mange.`);
  S.village.mois = 0;
  for (const id in S.marche) { const m = S.marche[id]; m.f = Math.min(1.25, Math.max(0.75, 0.6 * m.f + 0.4 * (0.85 + Math.random() * 0.3))); }
  fondSale = true; ongletSale = true;
  sauver();
}
function verifierObjectifs() {
  for (const o of OBJECTIFS) {
    if (S.objectifs[o.id] || !o.ok()) continue;
    S.objectifs[o.id] = true; S.argent += o.prime;
    noter(`Objectif atteint : ${o.txt.toLowerCase()}${o.prime ? ` (prime de ${euros(o.prime)})` : ''}.`);
    if (onglet === 'objectifs') ongletSale = true;
  }
}

// ---------- Affichage du champ ----------
const art = document.createElement('canvas'); art.width = W * T; art.height = H * T;
const ga = art.getContext('2d');
const fond = document.createElement('canvas'); fond.width = W * T; fond.height = H * T;
const gf = fond.getContext('2d');
let fondSale = true, grangeSale = false, ongletSale = true;
const ecran = document.getElementById('ecran'), ge = ecran.getContext('2d');
const defile = document.getElementById('defile');
let echelle = 2, dpr = 1, survol = null, selection = null, flottants = [], artDate = 0;
let outil = { t: 'semer', id: 'pdt' };

function dessinerFond() {
  const s = couleursSaison(date().mois);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = parcelleDe(x, y);
    herbe(gf, x * T, y * T, x, y, s, p && !S.parcelles[p.k] && p.k !== MAISON);
  }
  for (let r = 0; r <= PR; r++) for (let c = 0; c <= PC; c++) {
    if (hasard(c, r, 5) < 0.55) arbuste(gf, c * (PT + GAP) * T + 12, r * (PT + GAP) * T + 10, s);
  }
  const [mc, mr] = MAISON.split(',').map(Number);
  maison(gf, (GAP + mc * (PT + GAP)) * T, (GAP + mr * (PT + GAP)) * T);
  for (let r = 0; r < PR; r++) for (let c = 0; c < PC; c++) {
    if (achetable(c, r)) panneau(gf, (GAP + c * (PT + GAP)) * T + 47, (GAP + r * (PT + GAP)) * T + 42);
  }
  fondSale = false;
}

function dessinerArt(t) {
  if (fondSale) dessinerFond();
  ga.drawImage(fond, 0, 0);
  for (const k in S.parcelles) {
    const [c, r] = k.split(',').map(Number);
    barriere(ga, (GAP + c * (PT + GAP)) * T - 4, (GAP + r * (PT + GAP)) * T - 4, PT * T + 8, PT * T + 8);
  }
  const vent = Math.floor(t / 650) % 2 === 1;
  const ordre = Object.keys(S.cases).map(k => k.split(',').map(Number)).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  for (const [x, y] of ordre) { const c = S.cases[cle(x, y)]; terre(ga, x * T, y * T, x, y, c.n, c.fum); }
  for (const [x, y] of ordre) {
    const c = S.cases[cle(x, y)];
    if (!c.cult) continue;
    plante(ga, x * T, y * T, x, y, CULTURE[c.cult], stadeDe(c.p), vent, c.mur > 20);
    if (c.p >= 1 && vent) { R(ga, x * T + 21, y * T + 1, 1, 3, '#fff8d0'); R(ga, x * T + 20, y * T + 2, 3, 1, '#fff8d0'); }
  }
}

// Chaque pixel d'art occupe un nombre entier de pixels de l'appareil : net, sans bavure
function dimensionner() {
  const champ = defile.parentElement;
  dpr = window.devicePixelRatio || 1;
  const largeur = champ.clientWidth - 30;         // marges et cadre (la barre de défilement a sa gouttière réservée)
  // En hauteur, on tolère que le journal passe sous le pli (arrondi plutôt que plancher)
  const hauteur = window.innerWidth > 900 ? champ.clientHeight - 70 : Infinity;
  // Jamais moins d'un pixel CSS par pixel d'art : sur téléphone, le champ défile plutôt que de rapetisser
  const k = Math.max(Math.round(dpr), Math.min(Math.floor(largeur / (W * T) * dpr), Math.round(hauteur / (H * T) * dpr), 3 * dpr));
  echelle = k / dpr;
  ecran.style.width = W * T * echelle + 'px'; ecran.style.height = H * T * echelle + 'px';
  ecran.width = Math.round(W * T * echelle * dpr); ecran.height = Math.round(H * T * echelle * dpr);
}

function afficher(t) {
  const k = echelle * dpr;
  ge.imageSmoothingEnabled = false;
  ge.drawImage(art, 0, 0, ecran.width, ecran.height);
  const contour = (x, y, w, h, coul) => { ge.strokeStyle = coul; ge.lineWidth = Math.max(1, dpr * 1.5); ge.strokeRect(x * k + 0.5, y * k + 0.5, w * k - 1, h * k - 1); };
  if (selection?.type === 'parcelle') {
    const x0 = (GAP + selection.c * (PT + GAP)) * T, y0 = (GAP + selection.r * (PT + GAP)) * T;
    contour(x0, y0, PT * T, PT * T, '#ffe27a');
  }
  if (survol) {
    const p = parcelleDe(survol.tx, survol.ty);
    if (p && S.parcelles[p.k]) contour(survol.tx * T, survol.ty * T, T, T, 'rgba(255,255,255,.9)');
    else if (p && achetable(p.c, p.r)) contour((GAP + p.c * (PT + GAP)) * T, (GAP + p.r * (PT + GAP)) * T, PT * T, PT * T, 'rgba(255,255,255,.75)');
  }
  // Textes flottants (+ 430 kg)
  ge.font = `600 ${13 * dpr}px system-ui, -apple-system, sans-serif`;
  ge.textAlign = 'center';
  flottants = flottants.filter(f => t - f.t0 < 1400);
  for (const f of flottants) {
    const a = (t - f.t0) / 1400, x = (f.tx + 0.5) * T * k, y = f.ty * T * k - a * 22 * dpr;
    ge.globalAlpha = 1 - a * a;
    ge.lineWidth = 3 * dpr; ge.strokeStyle = '#2b2118'; ge.strokeText(f.txt, x, y);
    ge.fillStyle = '#fff3c4'; ge.fillText(f.txt, x, y);
  }
  ge.globalAlpha = 1;
}
function flottant(tx, ty, txt) { flottants.push({ tx, ty, txt, t0: performance.now() }); }

// ---------- Souris et doigt ----------
let peinture = false, derniere = null, depart = null;
function caseSous(e) {
  const r = ecran.getBoundingClientRect();
  return { tx: Math.floor((e.clientX - r.left) / echelle / T), ty: Math.floor((e.clientY - r.top) / echelle / T) };
}
function appliquer(tx, ty, premier) {
  const p = parcelleDe(tx, ty);
  if (!p) return false;
  if (p.k === MAISON) { if (premier) ouvrirOnglet('grange'); return false; }
  if (!S.parcelles[p.k]) {
    if (premier) { selection = achetable(p.c, p.r) ? { type: 'parcelle', c: p.c, r: p.r } : null; majInfo(); }
    return false;
  }
  const k = cle(tx, ty), t = S.cases[k];
  let fait = false;
  if (t.cult && t.p >= 1 && outil.t !== 'regarder') { recolter(k, tx, ty); fait = true; }
  else if (outil.t === 'semer') fait = semer(k, outil.id, premier);
  else if (outil.t === 'fumier') fait = fumer(k, premier);
  else if (outil.t === 'arracher') fait = arracher(k);
  if (premier || outil.t === 'regarder') { selection = { type: 'case', tx, ty }; }
  if (fait) apresAction(t.cult === null);
  else majInfo();
  return fait;
}
ecran.addEventListener('pointerdown', e => {
  const { tx, ty } = caseSous(e);
  if (e.pointerType === 'mouse') {
    if (e.button !== 0) return;
    peinture = true; derniere = cle(tx, ty);
    ecran.setPointerCapture(e.pointerId);
    appliquer(tx, ty, true);
  } else depart = { x: e.clientX, y: e.clientY };
});
ecran.addEventListener('pointermove', e => {
  const { tx, ty } = caseSous(e);
  survol = { tx, ty };
  if (peinture && cle(tx, ty) !== derniere) {
    // Geste rapide : on passe aussi par les cases sautées entre deux événements
    const [px, py] = derniere.split(',').map(Number), n = Math.max(Math.abs(tx - px), Math.abs(ty - py));
    for (let i = 1; i <= n; i++) appliquer(Math.round(px + (tx - px) * i / n), Math.round(py + (ty - py) * i / n), false);
    derniere = cle(tx, ty);
  }
  if (e.pointerType === 'mouse') majBulle(e, tx, ty);
});
ecran.addEventListener('pointerup', e => {
  peinture = false;
  if (depart && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) < 10) { const { tx, ty } = caseSous(e); appliquer(tx, ty, true); }
  depart = null;
});
ecran.addEventListener('pointerleave', () => { survol = null; bulle.hidden = true; });

// ---------- Bulle et panneau d'information ----------
const bulle = document.getElementById('bulle');
function descriptionCase(t) {
  if (!t.cult) {
    return `<b>Terre nue</b><br>Fertilité ${nf(t.n)} / 100${t.fam ? `<br>Dernière culture : ${t.fam}` : ''}`;
  }
  const c = CULTURE[t.cult], reste = Math.ceil((1 - t.p) * c.cycle);
  const etat = t.p >= 1 ? (t.mur > 20 ? '<span class="mauvais">Trop mûr, se perd</span>' : '<span class="bon">Mûr : cliquez pour récolter</span>') : `Récolte dans ${reste} j (${nf(t.p * 100)} %)`;
  return `<b>${c.nom}</b><br>${etat}<br>Récolte prévue ≈ ${masse(rendementCase(t))}`
    + `<br>Fertilité ${nf(t.n)} / 100${t.rot < 1 ? '<br><span class="mauvais">Même famille qu’avant : −15 %</span>' : ''}`;
}
function majBulle(e, tx, ty) {
  const p = parcelleDe(tx, ty);
  let html = '';
  if (p?.k === MAISON) html = '<b>La ferme</b><br>Cliquez pour ouvrir la grange.';
  else if (p && S.parcelles[p.k]) html = descriptionCase(S.cases[cle(tx, ty)]);
  else if (p && achetable(p.c, p.r)) html = `<b>Parcelle à vendre</b><br>1 600 m² · ${euros(prixParcelle())}<br>Cliquez pour l’acheter.`;
  if (!html) { bulle.hidden = true; return; }
  bulle.innerHTML = html; bulle.hidden = false;
  const bx = Math.min(e.clientX + 16, window.innerWidth - bulle.offsetWidth - 8);
  const by = Math.min(e.clientY + 16, window.innerHeight - bulle.offsetHeight - 8);
  bulle.style.left = bx + 'px'; bulle.style.top = by + 'px';
}

const info = document.getElementById('info');
function majInfo() {
  if (selection?.type === 'parcelle') {
    const prix = prixParcelle();
    info.innerHTML = `<h3>Parcelle à vendre</h3><p>1 600 m², soit 16 cases de 100 m².</p>
      <button class="principal" data-action="acheter" ${S.argent < prix ? 'disabled' : ''}>Acheter pour ${euros(prix)}</button>`;
  } else if (selection?.type === 'case') {
    const t = S.cases[cle(selection.tx, selection.ty)];
    info.innerHTML = t ? `<h3>Case de 100 m²</h3><p>${descriptionCase(t)}</p>` : '';
  } else {
    info.innerHTML = `<p class="discret">Cliquez une case pour la voir en détail. Une case = 100 m², une parcelle = 1 600 m².</p>`;
  }
}
info.addEventListener('click', e => {
  if (e.target.closest('[data-action="acheter"]') && selection?.type === 'parcelle') acheter(selection.c, selection.r);
});

let toastMinuteur = 0;
function toast(txt) {
  const el = document.getElementById('toast');
  el.textContent = txt; el.classList.add('visible');
  clearTimeout(toastMinuteur); toastMinuteur = setTimeout(() => el.classList.remove('visible'), 2600);
}

// ---------- Barre du haut, outils, journal ----------
function majEntete() {
  document.getElementById('date').textContent = texteDate();
  document.getElementById('argent').textContent = euros(S.argent);
  for (const b of document.querySelectorAll('[data-vitesse]')) b.setAttribute('aria-pressed', String(+b.dataset.vitesse === S.vitesse));
}
document.getElementById('vitesses').addEventListener('click', e => {
  const b = e.target.closest('[data-vitesse]'); if (!b) return;
  S.vitesse = +b.dataset.vitesse; majEntete();
});
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.target.closest('input, textarea')) { e.preventDefault(); S.vitesse = S.vitesse ? 0 : 1; majEntete(); }
});

function majOutils() {
  const c = CULTURE[outil.id];
  document.getElementById('nom-semence').textContent = c.nom;
  for (const b of document.querySelectorAll('[data-outil]')) b.setAttribute('aria-pressed', String(b.dataset.outil === outil.t));
}
document.getElementById('outils').addEventListener('click', e => {
  const b = e.target.closest('[data-outil]'); if (!b) return;
  outil = { ...outil, t: b.dataset.outil };
  if (outil.t === 'semer') ouvrirOnglet('semences');
  majOutils();
});

function majJournal() {
  const ol = document.getElementById('journal'); if (!ol) return;
  ol.innerHTML = S.journal.slice(0, 5).map(n => `<li><span>${n.d}</span> ${n.txt}</li>`).join('');
}

// ---------- Onglets ----------
const vue = document.getElementById('vue');
let onglet = 'semences', seulementSemables = false, triComparer = { col: 'kcalHa', sens: -1 };

function ouvrirOnglet(nom) {
  onglet = nom; ongletSale = true;
  for (const b of document.querySelectorAll('[data-onglet]')) b.setAttribute('aria-selected', String(b.dataset.onglet === nom));
  majOnglet();
}
document.getElementById('onglets').addEventListener('click', e => {
  const b = e.target.closest('[data-onglet]'); if (b) ouvrirOnglet(b.dataset.onglet);
});

function icone(cv, c) {
  const g = cv.getContext('2d');
  terre(g, 0, 0, 3, 3, 60, 0);
  plante(g, 0, 0, 3, 3, c, 4, false, false);
}

const ONGLETS = {
  semences() {
    const maxK = Math.max(...CULTURES.map(kcalParHa));
    const mois = NOMS_MOIS[date().mois - 1];
    let html = `<label class="filtre"><input type="checkbox" data-action="filtre" ${seulementSemables ? 'checked' : ''}> Seulement ce qui se sème en ${mois}</label>`;
    for (const cat of CATEGORIES) {
      const liste = CULTURES.filter(c => c.cat === cat && (!seulementSemables || semableMaintenant(c)));
      if (!liste.length) continue;
      html += `<h3>${cat}</h3><div class="cartes">`;
      for (const c of liste) {
        const k = kcalParHa(c), ouvert = semableMaintenant(c);
        html += `<button class="carte${outil.id === c.id ? ' choisie' : ''}${ouvert ? '' : ' fermee'}" data-semence="${c.id}">
          <canvas width="24" height="24" data-icone="${c.id}"></canvas>
          <span class="corps">
            <span class="ligne1"><b>${c.nom}</b><span class="${ouvert ? 'bon' : 'discret'}">${plages(c.semis)}</span></span>
            <span class="ligne2">${nf(c.rdt, c.rdt < 10 ? 1 : 0)} t/ha · ${c.kcal} kcal/100 g · ${c.cycle} j</span>
            <span class="jauge"><span style="width:${(k / maxK * 100).toFixed(1)}%"></span></span>
            <span class="ligne2">${nf(k / 1e6, 1)} Mkcal/ha · semence ${euros(c.graine)} la case</span>
          </span></button>`;
      }
      html += '</div>';
    }
    return html;
  },
  grange() {
    const ids = CULTURES.map(c => c.id).filter(id => stockKg(id) > 0.01);
    if (!ids.length) return `<p class="vide">La grange est vide. Les cases mûres se récoltent d’un clic.</p>`;
    let total = 0;
    let lignes = ids.map(id => {
      const c = CULTURE[id], kg = stockKg(id), kcal = kg * c.kcal * 10; total += kcal;
      const v = recetteVente(id, kg).rec, l = livraisonPossible(id), j = joursRestants(id);
      return `<div class="stock">
        <canvas width="24" height="24" data-icone="${id}"></canvas>
        <div class="corps"><b>${c.nom}</b>
          <span class="ligne2">${masse(kg)} · ${energie(kcal)} · <span class="${j < 15 ? 'mauvais' : ''}">se garde ${j > 600 ? 'longtemps' : `encore ${j} j`}</span></span>
          <span class="boutons">
            <button data-action="vendre" data-id="${id}">Vendre <b>${euros(v)}</b></button>
            <button data-action="livrer" data-id="${id}" ${l.kg <= 0 ? 'disabled' : ''}>Au village <b>${euros(l.rec)}</b></button>
          </span></div></div>`;
    }).join('');
    return `<p class="resume">Dans la grange : <b>${energie(total)}</b>, de quoi nourrir une personne ${nf(total / BESOIN)} jours.</p>${lignes}`;
  },
  village() {
    const d = demandeMois(), part = Math.min(1, S.village.mois / d);
    const ans = S.village.total / (BESOIN * 365);
    let html = `<p>Le village voisin compte <b>${HABITANTS} habitants</b>. Chacun mange environ ${nf(BESOIN)} kcal par jour.
      Le village paie <b>${euros(PRIX_KCAL * 1000)} pour 1 000 kcal</b>, quel que soit l’aliment : les cultures riches en énergie y valent plus qu’au marché.</p>
      <div class="barre-mois"><span style="width:${(part * 100).toFixed(1)}%"></span></div>
      <p class="ligne2">Ce mois-ci : ${energie(S.village.mois)} sur ${energie(d)} (${nf(part * 100)} %)</p>
      <p class="ligne2">Depuis le début : de quoi nourrir ${nf(ans, ans < 10 ? 1 : 0)} personne${ans >= 2 ? 's' : ''} pendant un an.</p>
      <h3>Prix du marché aujourd’hui</h3>
      <p class="discret">Plus vous vendez d’un même produit, plus son prix baisse. Il remonte en quelques semaines.</p>
      <table class="tableau"><thead><tr><th>Produit</th><th>€/kg</th><th>Marché</th><th>Village</th></tr></thead><tbody>`;
    for (const c of CULTURES) {
      const p = prixMarche(c.id), ecart = p / c.prix - 1, vil = c.kcal * 10 * PRIX_KCAL;
      html += `<tr><td>${c.nom}</td><td>${nf(p, 2)}</td><td class="${ecart < -0.05 ? 'mauvais' : ecart > 0.05 ? 'bon' : 'discret'}">${ecart >= 0 ? '+' : ''}${nf(ecart * 100)} %</td>
        <td class="${vil > p ? 'bon' : 'discret'}">${nf(vil, 2)}</td></tr>`;
    }
    return html + '</tbody></table>';
  },
  comparer() {
    const cols = [
      ['nom', 'Culture'], ['rdt', 't/ha'], ['kcal', 'kcal/100 g'], ['kcalHa', 'Mkcal/ha'],
      ['kcalJour', 'kcal/ha/jour'], ['euroHa', '€/ha'], ['conserv', 'Garde'],
    ];
    const lignes = CULTURES.map(c => ({ c, nom: c.nom, rdt: c.rdt, kcal: c.kcal, kcalHa: kcalParHa(c), kcalJour: kcalParHa(c) / c.cycle, euroHa: c.rdt * 1000 * c.prix, conserv: c.conserv }));
    const { col, sens } = triComparer;
    lignes.sort((a, b) => (typeof a[col] === 'string' ? a[col].localeCompare(b[col]) : a[col] - b[col]) * sens);
    const max = Math.max(...lignes.map(l => l.kcalHa));
    let html = `<p class="discret">Énergie par hectare = rendement × densité énergétique. « Par jour » tient compte du temps que la culture occupe la terre. Cliquez un titre pour trier.</p>
      <div class="defile-tableau"><table class="tableau comparer"><thead><tr>`;
    for (const [k, t] of cols) html += `<th><button data-tri="${k}">${t}${col === k ? (sens < 0 ? ' ↓' : ' ↑') : ''}</button></th>`;
    html += '</tr></thead><tbody>';
    for (const l of lignes) {
      html += `<tr><td>${l.nom}</td><td>${nf(l.rdt, l.rdt < 10 ? 1 : 0)}</td><td>${l.kcal}</td>
        <td><span class="mini-jauge" style="--p:${(l.kcalHa / max * 100).toFixed(0)}%"></span>${nf(l.kcalHa / 1e6, 1)}</td>
        <td>${nf(l.kcalJour / 1000)} 000</td><td>${nf(l.euroHa)}</td><td>${l.conserv > 600 ? '> 1 an' : l.conserv + ' j'}</td></tr>`;
    }
    return html + `</tbody></table></div>
      <p class="source">Rendements : moyennes françaises (Agreste, FranceAgriMer, guides maraîchers). Énergie : table CIQUAL (ANSES), produit cru. Valeurs arrondies.</p>`;
  },
  objectifs() {
    let html = '<ul class="objectifs">';
    for (const o of OBJECTIFS) html += `<li class="${S.objectifs[o.id] ? 'fait' : ''}"><span class="coche">${S.objectifs[o.id] ? '✓' : ''}</span>${o.txt}${o.prime ? ` <span class="discret">+${euros(o.prime)}</span>` : ''}</li>`;
    html += `</ul><h3>Bilan</h3><p class="ligne2">Récolté : ${masse(S.stats.kg)}, soit ${energie(S.stats.kcal)}.<br>Ventes au marché : ${euros(S.stats.ventes)}.<br>Surface : ${nf(Object.keys(S.cases).length * SURFACE_CASE)} m².</p>
      <h3>Journal</h3><ol class="journal-complet">${S.journal.map(n => `<li><span>${n.d}</span> ${n.txt}</li>`).join('')}</ol>
      <button data-action="nouvelle">Nouvelle partie</button>`;
    return html;
  },
};

function majOnglet() {
  const haut = vue.scrollTop;
  vue.innerHTML = ONGLETS[onglet]();
  for (const cv of vue.querySelectorAll('canvas[data-icone]')) icone(cv, CULTURE[cv.dataset.icone]);
  vue.scrollTop = haut;
  ongletSale = false; grangeSale = false;
}
vue.addEventListener('click', e => {
  const s = e.target.closest('[data-semence]');
  if (s) { outil = { t: 'semer', id: s.dataset.semence }; majOutils(); ongletSale = true; majOnglet(); return; }
  const tri = e.target.closest('[data-tri]');
  if (tri) { const col = tri.dataset.tri; triComparer = { col, sens: triComparer.col === col ? -triComparer.sens : (col === 'nom' ? 1 : -1) }; majOnglet(); return; }
  const a = e.target.closest('[data-action]'); if (!a) return;
  if (a.dataset.action === 'vendre') vendre(a.dataset.id);
  else if (a.dataset.action === 'livrer') livrer(a.dataset.id);
  else if (a.dataset.action === 'nouvelle' && confirm('Recommencer une partie ? La ferme actuelle sera perdue.')) {
    nouvellePartie(); selection = null; fondSale = true; sauver(); apresAction(true);
  }
});
vue.addEventListener('change', e => {
  if (e.target.matches('[data-action="filtre"]')) { seulementSemables = e.target.checked; majOnglet(); }
});

// Après un geste du joueur : tout ce qui dépend de l'argent ou du stock
function apresAction(structure) {
  verifierObjectifs();
  majEntete(); majInfo();
  if (structure && (onglet === 'grange' || onglet === 'village' || onglet === 'objectifs')) majOnglet();
  artDate = 0;
}

// ---------- Boucle ----------
let dernier = performance.now(), cumul = 0, jourAffiche = -1, sauveJour = 0;
function boucle(t) {
  const dt = Math.min(250, t - dernier); dernier = t;
  if (S.vitesse > 0) {
    cumul += dt;
    const pas = 1000 / S.vitesse;
    let n = 0;
    while (cumul >= pas && n < 20) { cumul -= pas; unJour(); n++; }
  }
  if (S.jour !== jourAffiche) {
    jourAffiche = S.jour;
    verifierObjectifs(); majEntete();
    if (selection?.type === 'case') majInfo();
    // Onglets vivants : la grange suit les prix, le village sa jauge
    // (pas pendant que la souris est sur le panneau : un bouton remplacé sous le curseur perdrait le clic)
    const periodique = (onglet === 'village' || onglet === 'grange') && S.jour % 5 === 0 && !vue.matches(':hover');
    if ((ongletSale || grangeSale || periodique) && !peinture) majOnglet();
    if (S.jour - sauveJour >= 15) { sauveJour = S.jour; sauver(); }
  }
  if (t - artDate > 120) { dessinerArt(t); artDate = t; }
  afficher(t);
  requestAnimationFrame(boucle);
}

// ---------- Démarrage ----------
if (!charger()) nouvellePartie();
dimensionner();
window.addEventListener('resize', () => { dimensionner(); });
window.addEventListener('pagehide', sauver);
document.addEventListener('visibilitychange', () => { if (document.hidden) sauver(); });
majEntete(); majOutils(); majJournal(); majInfo(); ouvrirOnglet('semences');
requestAnimationFrame(boucle);
