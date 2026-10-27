'use strict';
/* Squid Ferme : état, temps, actions du joueur, interface.
   Dessin du champ : rendu.js ; vie autour de la ferme : vie.js ; effets : animations.js ;
   progression (étoiles, niveaux, commandes, trouvailles, bilan, premiers pas) : mecaniques.js. */

// ---------- Monde ----------
// Un vrai lieu (donnees/lieux.js) : grille « champs » de 50 m ou « planches » de 10 m selon le mode.
const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const CLE = 'squid-ferme-3';
const JOUR_MS = 5000;                               // durée d'un jour à la vitesse ×1
const PRIX_TERRE_HA = { champs: 9000, planches: 60000 };   // € par hectare (terres de l'Artois ≈ 9 000 €/ha)
const FAMILLE_ECHELLE = { champs: ['gc', 'acs', 'agro'], planches: ['mar'] };
const DEBUT = () => indexJour(1959, 59);            // 1er mars 1959 : les semis de printemps commencent

const OBJECTIFS = [
  { id: 'recolte', txt: 'Faire une première récolte', ok: () => total().recoltes > 0 },
  { id: 't100', txt: 'Récolter 100 tonnes', ok: () => total().kg >= 1e5 },
  { id: 'p100', txt: 'Nourrir 100 personnes pendant un an', ok: () => total().kcal >= 100 * BESOIN_KCAL * 365 },
  { id: 'record', txt: 'Dépasser le rendement moyen français sur une culture', ok: () => S.fermes.some(f => Object.entries(f.stats.parCulture).some(([id, p]) => p.dernier >= CULTURE[id].rdt)) },
  { id: 'mo', txt: 'Faire gagner un demi-point de matière organique à une ferme', ok: () => S.fermes.some(f => etatSol(f).mo - f.moDepart >= 0.5) },
  { id: 'pleine', txt: 'Acheter toutes les parcelles d’une ferme : une nouvelle ferme se débloque', ok: () => S.fermes.some(pleine) },
  { id: 'p1000', txt: 'Nourrir 1 000 personnes pendant un an', ok: () => total().kcal >= 1000 * BESOIN_KCAL * 365 },
  { id: 'an2150', txt: 'Tenir jusqu’en 2150', ok: () => dateDe(S.jour).an >= 2150 },
];

let S = null;
const F = () => S.fermes[S.active];
const pleine = f => Object.keys(f.parcelles).length >= planDe(f).unites.length;
function total() {
  const t = { kg: 0, kcal: 0, recoltes: 0 };
  for (const f of S.fermes) { t.kg += f.stats.kg; t.kcal += f.stats.kcal; t.recoltes += f.stats.recoltes; }
  return t;
}

// ---------- Outils ----------
const nf = (n, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const euros = n => nf(Math.round(n)) + ' €';
const masse = kg => kg >= 1e6 ? nf(kg / 1e6, 1) + ' kt' : kg >= 1000 ? nf(kg / 1000, kg >= 1e4 ? 0 : 1) + ' t' : nf(kg) + ' kg';
const energie = k => k >= 1e9 ? nf(k / 1e9, 1) + ' Gkcal' : k >= 1e6 ? nf(k / 1e6, k >= 1e7 ? 0 : 1) + ' Mkcal' : nf(k) + ' kcal';
const personnesAn = kcal => kcal / (BESOIN_KCAL * 365);
const cle = (x, y) => x + ',' + y;
const region = f => REGIONS.find(r => r.id === f.region);
const lieu = f => LIEUX[f.lieu];
const majuscule = s => s.replace(/^./, m => m.toUpperCase());
function texteDate(j = S.jour) { const d = dateDe(j); return `${d.jour === 1 ? '1er' : d.jour} ${NOMS_MOIS[d.mois - 1]} ${d.an}`; }
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

// ---------- Parcelles : les vrais champs (ou des lots de planches) ----------
const planDe = f => LIEUX[f.lieu][MODES[f.mode].echelle];
const typeCase = (pl, tx, ty) => tx < 0 || ty < 0 || tx >= pl.w || ty >= pl.h ? null : pl.types[ty][tx];
function parcelleDe(tx, ty) {
  const pl = planDe(F());
  if (tx < 0 || ty < 0 || tx >= pl.w || ty >= pl.h) return null;
  const u = pl.unite[ty * pl.w + tx];
  return u >= 0 ? { k: String(u), u } : null;
}
function casesDe(pl, u) {
  const out = [];
  for (let i = 0; i < pl.unite.length; i++) if (pl.unite[i] === u) out.push([i % pl.w, Math.floor(i / pl.w)]);
  return out;
}
const centreDe = cases => { const xs = cases.map(c => c[0]), ys = cases.map(c => c[1]); return () => Rendu.centre((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2); };
const surfaceUnite = (f, u) => planDe(f).unites[u].n * MODES[f.mode].caseHa;
const prixParcelle = (f, u) => Math.round(surfaceUnite(f, u) * PRIX_TERRE_HA[MODES[f.mode].echelle] * Math.pow(1.03, f.achats) / 10) * 10;
const achetable = (f, u) => u >= 0 && !f.parcelles[u];
function ajouterParcelle(f, u) {
  f.parcelles[u] = true;
  for (const [x, y] of casesDe(planDe(f), u)) f.cases[cle(x, y)] = nouvelleCase(f);
}
// Les champs les plus proches de la ferme, jusqu'à la surface de départ
function champsDeDepart(f) {
  const pl = planDe(f), [fx, fy] = pl.ferme, but = MODES[f.mode].echelle === 'champs' ? 12 : 0.15;
  const dist = pl.unites.map((_, u) => Math.min(...casesDe(pl, u).map(([x, y]) => Math.hypot(x - fx - 1.5, y - fy - 1.5))));
  const ordre = dist.map((d, u) => [d, u]).sort((a, b) => a[0] - b[0]);
  const pris = []; let surf = 0;
  for (const [, u] of ordre) { if (surf >= but) break; pris.push(u); surf += surfaceUnite(f, u); }
  return pris;
}

// Culture d'un champ voisin : celle déclarée à la PAC cette année-là, ou l'assolement d'une année réelle
const RPG_CULTURE = { BTH: 'ble', BTP: 'ble', BDH: 'ble', BDP: 'ble', EPE: 'epeautre', ORH: 'orge', ORP: 'orge', AVH: 'avoine', AVP: 'avoine',
  SGH: 'seigle', TTH: 'triticale', TTP: 'triticale', MIS: 'mais', MIE: 'mais', SOG: 'sorgho', SRS: 'sarrasin', CZH: 'colza', CZP: 'colza',
  TRN: 'tournesol', LIH: 'lin', LIP: 'lin', LIF: 'lin', SOJ: 'soja', FVL: 'feverole', FVP: 'feverole', PHI: 'pois', PPR: 'pois', PHF: 'pois',
  LEC: 'lentille', PCH: 'poischiche', PTC: 'pdt', PTF: 'pdt', BTN: 'betsucre', OIG: 'oignon', CAR: 'carotte', CHU: 'chou', EPI: 'epinard',
  POR: 'poireau', HAR: 'haricotvert', LBF: 'haricot', AIL: 'ail', ECH: 'echalote', TOM: 'tomate', FRA: 'fraise', MLO: 'melon' };
const RPG_HERBE = ['PPH', 'PRL', 'PTR', 'PPR', 'RGA', 'LUZ', 'MLG', 'TRE', 'SPH', 'SPL', 'CPL', 'FAG', 'J6S', 'JNO'];
function voisin(f, u, j) {
  const rpg = planDe(f).unites[u].rpg, an = dateDe(j).an;
  const ans = Object.keys(rpg).map(Number);
  if (!ans.length) return { type: 'friche' };
  const reel = rpg[an] != null, ref = reel ? an : ans[((an - 2015) % ans.length + ans.length) % ans.length];
  const code = rpg[ref];
  const c = RPG_CULTURE[code];
  if (c) return { type: 'culture', c: CULTURE[c], code, an: ref, reel };
  return { type: RPG_HERBE.includes(code) ? 'prairie' : 'friche', code, an: ref, reel };
}

// ---------- Partie ----------
function creerFerme(lieuId, mode) {
  const L = LIEUX[lieuId];
  const f = nouvelleFerme(L.climat, mode, S.jour);
  Object.assign(f, { lieu: lieuId, histo: [], neigeSol: 0, climatAn: {}, sec: 0 });
  if (mode !== 'gc') f.modeAvant = 'gc';            // en 1959, la terre sort d'une culture classique : transition
  S.fermes.push(f); S.active = S.fermes.length - 1;
  for (const u of champsDeDepart(f)) ajouterParcelle(f, u);
  f.moDepart = etatSol(f).mo;
  const ha = Object.keys(f.cases).length * MODES[mode].caseHa;
  S.argent += mode === 'mar' ? 4000 : ha * 900;
  noter(`Installation à ${L.nom} (${MODES[mode].nom.toLowerCase()}) sur ${surfaceTexte(ha)}, le ${texteDate()}.`);
  return f;
}
const surfaceTexte = ha => ha >= 1 ? nf(ha, ha < 10 ? 1 : 0) + ' ha' : nf(ha * 10000) + ' m²';
function sauver() { if (!S) return; try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } }
function charger() {
  try {
    const t = localStorage.getItem(CLE);
    if (t) { const s = JSON.parse(t); if ((s.v === 3 || s.v === 4) && s.fermes?.length) { S = s; Meca.completer(S); S.v = 4; return true; } }
  } catch (e) { /* partie neuve */ }
  return false;
}
function noter(txt) {
  S.journal.unshift({ d: texteDate(), txt });
  S.journal.length = Math.min(S.journal.length, 60);
  majJournal(true);
}

// ---------- Temps ----------
function unJour() {
  const avant = dateDe(S.jour);
  S.jour++;
  const d = dateDe(S.jour);
  S.fermes.forEach((f, i) => {
    const m = Climat.jour(f.region, S.jour);
    f.meteo = m;
    f.histo.push([m.tmin, m.tmax, m.pluie + m.neige]); if (f.histo.length > 60) f.histo.shift();
    f.neigeSol = Math.max(0, f.neigeSol + m.neige - Math.max(0, (m.tmin + m.tmax) / 2) * 3);
    const ca = f.climatAn[d.an] ??= { pluie: 0, t: 0, n: 0 };
    ca.pluie += m.pluie + m.neige; ca.t += (m.tmin + m.tmax) / 2; ca.n++;
    const active = i === S.active, nom = ids => [...ids].map(id => CULTURE[id].nom.toLowerCase()).join(', ');
    const murAvant = active && Object.values(f.cases).some(c => c.cult && c.p >= 1);
    const ev = journeeFerme(f, S.jour, m);
    if (active && ev.murs.size) {
      noter(`Prêt à récolter : ${nom(ev.murs)}.`);
      // le temps ralentit quand une récolte arrive, pour ne pas la manquer
      if (!murAvant && S.vitesse > 3) { S.vitesse = 1; toast(`${majuscule(nom(ev.murs))} : c’est mûr, le temps ralentit.`); }
      if (S.guide === 2) S.guide = 3;
    }
    f.dernier ??= {};
    for (const id of ev.geles) if (!(S.jour - (f.dernier['g' + id] ?? -99) < 15)) { f.dernier['g' + id] = S.jour; if (active) noter(`Gel (${nf(m.tmin, 1)} °C) : ${CULTURE[id].nom.toLowerCase()} touché.`); }
    for (const id of ev.echaudes) if (!(S.jour - (f.dernier['c' + id] ?? -99) < 15)) { f.dernier['c' + id] = S.jour; if (active) noter(`Coup de chaleur (${nf(m.tmax, 0)} °C) : ${CULTURE[id].nom.toLowerCase()} échaudé.`); }
    // Récolte automatique, champ par champ, avant que la culture ne se perde
    const pl = planDe(f), aRecolter = new Map();
    for (const k in f.cases) {
      const t = f.cases[k];
      if (!(t.cult && t.p >= 1 && t.mur >= 20)) continue;
      const [x, y] = k.split(',').map(Number), u = pl.unite[y * pl.w + x];
      if (!aRecolter.has(u)) aRecolter.set(u, []);
      aRecolter.get(u).push([x, y]);
    }
    let n = 0;
    for (const [u, cases] of aRecolter) recolterChamp(f, u, cases, n++ * 300);
    // Agroforesterie : coupe du bois à 50 ans, puis replantation
    if (MODES[f.mode].arbres && ageArbres(f, S.jour) >= 50) {
      const ha = Object.keys(f.cases).length * MODES[f.mode].caseHa, bois = ha * 0.5 * 50;
      f.stats.bois += bois; f.arbresDepuis = S.jour;
      noter(`Coupe des arbres de ${lieu(f).nom} : ${nf(bois)} t de bois d’œuvre. On replante.`);
    }
    // Sécheresse visible : réserve moyenne du sol
    const sol = etatSol(f); f.sec = d.mois >= 5 && d.mois <= 10 ? clamp((0.42 - sol.r / sol.ru) / 0.3, 0, 1) : 0;
  });
  Meca.unJour();
  // Coup de pouce : sans culture en terre ni de quoi acheter des semences, la coopérative avance de quoi repartir (une fois par an)
  if (d.jour === 1 && S.argent < 1000 && S.avanceAn !== d.an && !Object.values(F().cases).some(c => c.cult)) {
    S.avanceAn = d.an; S.argent += 2500;
    noter('La coopérative vous avance 2 500 € de semences.'); toast('La coopérative vous avance 2 500 € de semences.');
  }
  if (d.an !== avant.an) {
    for (const f of S.fermes) { const s = etatSol(f); f.solAns.push({ an: avant.an, mo: +s.mo.toFixed(3), ru: Math.round(s.ru), vdt: Math.round(s.vdt) }); }
    Meca.finAnnee(avant.an);
    sauver();
  }
  if (d.mois !== avant.mois) ongletSale = true;
}

// ---------- Actions ----------
function machinePour(f, c, type) {
  if (MODES[f.mode].echelle === 'planches') return 'personne';
  if (type === 'semis') return 'semoir';
  return ['Céréales', 'Oléagineux'].includes(c.cat) || (c.leg && c.kcal > 300) ? 'moissonneuse' : 'arracheuse';
}
function messageVerrou(f, id) {
  const i = ordreMode(f.mode).indexOf(id);
  return i < 0 ? `${CULTURE[id].nom} ne se cultive pas dans ce mode.` : `${CULTURE[id].nom} : au niveau ${Math.max(2, Math.ceil((i - 4) / 2) + 1)}. Récoltez pour gagner des étoiles.`;
}
// Un clic sème tout le champ : un tracteur et son semoir passent rang par rang
function semerChamp(f, u, id) {
  const pl = planDe(f), c = CULTURE[id], mode = MODES[f.mode];
  const libres = casesDe(pl, u).filter(([x, y]) => !f.cases[cle(x, y)].cult);
  if (!libres.length) return false;
  if (!estDebloquee(f.mode, id)) { toast(messageVerrou(f, id)); return false; }
  const pb = peutSemer(f, c, dateDe(S.jour).mois, f.meteo);
  if (pb) { toast(pb); return false; }
  const semees = [];
  for (const [x, y] of libres) { if (S.argent < c.graine * mode.caseHa) break; semer(f, f.cases[cle(x, y)], c); semees.push([x, y]); }
  if (!semees.length) return false;
  if (f === F()) { Rendu.animerChamp(semees, 'semis', machinePour(f, c, 'semis'), null); Meca.tirerTrouvaille(f, semees); }
  if (S.guide < 2) S.guide = 2;
  return true;
}
// Glisser sème case par case
function semerCase(f, k, id, bavard, tx, ty) {
  const t = f.cases[k], c = CULTURE[id];
  if (t.cult) return false;
  if (!estDebloquee(f.mode, id)) { if (bavard) toast(messageVerrou(f, id)); return false; }
  const pb = peutSemer(f, c, dateDe(S.jour).mois, f.meteo);
  if (pb) { if (bavard) toast(pb); return false; }
  semer(f, t, c);
  if (f === F()) { Rendu.animerChamp([[tx, ty]], 'semis', null, null); Rendu.graines(tx, ty); }
  if (S.guide < 2) S.guide = 2;
  return true;
}
// Récolte d'un champ : la machine passe, les caisses volent jusqu'au compteur (ou à la commande), les étoiles montent
function recolterChamp(f, u, seulement, retard = 0) {
  const pl = planDe(f), cases = (seulement || casesDe(pl, u)).filter(([x, y]) => { const c = f.cases[cle(x, y)]; return c?.cult && c.p >= 1; });
  if (!cases.length) return 0;
  const visible = f === F() && !document.hidden && install.hidden;
  const avant = new Map(), recs = [], groupes = new Map();
  for (const [x, y] of cases) {
    const k = cle(x, y), t = f.cases[k];
    avant.set(k, { c: CULTURE[t.cult], p: t.p, v: (hasard(x, y, 1) * 3) | 0, pourri: t.mur > 12 });
    const r = recolter(f, t, S.jour);
    recs.push({ x, y, r });
    const gr = groupes.get(r.c.id) || { c: r.c, kg: 0, kcal: 0, ha: 0, n: 0 };
    gr.kg += r.kg; gr.kcal += r.kcal; gr.ha += r.ha; gr.n++; groupes.set(r.c.id, gr);
  }
  let etoiles = 0, kgTot = 0, premieres = 0;
  const servies = new Set();
  for (const gr of groupes.values()) {
    const n = Meca.noterRecolte(gr.c, gr.ha / gr.n); if (!premieres) premieres = n;
    etoiles += n; kgTot += gr.kg;
    for (const id of Meca.versCommandes(gr.c.id, gr.kg)) servies.add(id);
  }
  if (!visible) { Meca.majNiveau(false); majProduction(false); if (onglet === 'commandes') ongletSale = true; return recs.length; }
  const fins = Rendu.animerChamp(cases, 'recolte', machinePour(f, recs[0].r.c, 'recolte'), avant, retard);
  const cible = () => {
    if (onglet === 'commandes') for (const id of servies) { const el = document.querySelector(`[data-commande="${id}"]`); if (el) return el; }
    return document.getElementById('production');
  };
  const par = Math.max(1, Math.ceil(recs.length / 14));     // pas plus de 14 caisses par champ
  for (let i = 0; i < recs.length; i += par) {
    const lot = recs.slice(i, i + par), kg = lot.reduce((s, o) => s + o.r.kg, 0), kcal = lot.reduce((s, o) => s + o.r.kcal, 0);
    const fin = fins[Math.min(fins.length - 1, i + par - 1)].fin, { x, y } = lot[0];
    attente.kg += kg; attente.kcal += kcal;
    Anim.caisse(() => Rendu.centre(x, y), lot[0].r.c, cible, fin, () => {
      attente.kg -= kg; attente.kcal -= kcal; majProduction(true);
      const el = cible(); if (el.dataset.commande) Compteur.rebond(el);
    });
  }
  const finTout = fins.at(-1).fin, centre = centreDe(cases);
  Meca.envoyerEtoiles(etoiles, centre, finTout + 150);
  Anim.texte(centre, `${masse(kgTot)}  ${'★'.repeat(premieres)}`, '#ffe08a', finTout);
  Meca.tirerTrouvaille(f, cases);
  setTimeout(() => { if (onglet === 'commandes') ongletSale = true; }, finTout + 1400);
  majProduction(false);
  return recs.length;
}
function recolterTout() {
  const f = F(), pl = planDe(f), unites = new Set();
  for (const k in f.cases) { const t = f.cases[k]; if (t.cult && t.p >= 1) { const [x, y] = k.split(',').map(Number); unites.add(pl.unite[y * pl.w + x]); } }
  if (!unites.size) { toast('Rien n’est mûr pour l’instant.'); return; }
  let i = 0;
  for (const u of unites) recolterChamp(f, u, null, i++ * 280);
  if (S.guide === 3) S.guide = 4;
  apresAction(true);
}
function arracher(f, k) { const t = f.cases[k]; if (!t.cult) return false; Object.assign(t, { cult: null, p: 0, dj: 0, mur: 0 }); return true; }
function acheter(u) {
  const f = F(), prix = prixParcelle(f, u);
  if (!achetable(f, u)) return;
  if (S.argent < prix) { toast(`Il vous faut ${euros(prix)}.`); return; }
  S.argent -= prix; f.achats++;
  ajouterParcelle(f, u);
  const centre = centreDe(casesDe(planDe(f), u))();
  Anim.confettis(centre.x, centre.y, 45); Anim.texte(centre, 'Champ acheté', '#ffe08a');
  noter(`Champ de ${surfaceTexte(surfaceUnite(f, u))} acheté : vous cultivez ${surfaceTexte(Object.keys(f.cases).length * MODES[f.mode].caseHa)}.`);
  selectionner(null);
  apresAction(true);
}
function changerMode(nouveau) {
  const f = F(), ancien = f.mode;
  f.modeAvant = ancien; f.mode = nouveau; f.modeDepuis = S.jour;
  if (MODES[nouveau].arbres) f.arbresDepuis = S.jour;
  noter(`Conversion vers ${MODES[nouveau].nom.toLowerCase()} : ${MODES[nouveau].transition.ans} an${MODES[nouveau].transition.ans > 1 ? 's' : ''} de transition.`);
  outilParDefaut(); apresAction(true);
}

// ---------- Champ : souris et doigt ----------
const ecran = document.getElementById('ecran');
Rendu.init(ecran);
let outil = { t: 'semer', id: 'ble' }, selection = null;
const attente = { kg: 0, kcal: 0 };
function selectionner(s) { selection = s; Rendu.selection = s; }

// Curseurs en pixels : sac de graines, faucille, pièce pour acheter
const CURSEURS = (() => {
  const fab = (dessin, hx, hy) => {
    const c = document.createElement('canvas'); c.width = c.height = 16; dessin(c.getContext('2d'));
    const d = document.createElement('canvas'); d.width = d.height = 32;
    const g = d.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, 32, 32);
    return `-webkit-image-set(url(${d.toDataURL()}) 2x) ${hx} ${hy}, pointer`;
  };
  return {
    sac: fab(g => { ellipse(g, 8, 10, 6, 5, '#3a2414'); ellipse(g, 8, 10, 5, 4, '#c8a06a'); R(g, 6, 2, 5, 4, '#3a2414'); R(g, 7, 3, 3, 3, '#c8a06a'); R(g, 5, 6, 7, 1, '#7a4a2a'); P(g, 6, 9, '#e8c890'); P(g, 7, 8, '#e8c890'); P(g, 2, 15, '#d8b878'); P(g, 13, 14, '#d8b878'); }, 8, 8),
    faucille: fab(g => {
      for (let i = 0; i < 20; i++) { const a = Math.PI * (0.05 + i / 19 * 1.05); P(g, 9 + Math.round(Math.cos(a) * 6), 7 - Math.round(Math.sin(a) * 6), '#3a3a40'); P(g, 9 + Math.round(Math.cos(a) * 5), 7 - Math.round(Math.sin(a) * 5), '#e0e4e8'); }
      ligne(g, 9, 8, 13, 13, '#5a3a1a'); ligne(g, 10, 8, 14, 13, '#9a6a3a');
    }, 3, 7),
    piece: fab(g => { disque(g, 8, 8, 6, '#7a5a10'); disque(g, 8, 8, 5, '#f2c240'); disque(g, 7, 7, 3, '#f8d870'); R(g, 7, 5, 1, 6, '#b8861a'); R(g, 6, 6, 4, 1, '#b8861a'); R(g, 6, 9, 4, 1, '#b8861a'); }, 8, 8),
  };
})();
let curseur = '';
function majCurseur(tx, ty) {
  const f = F(), p = parcelleDe(tx, ty);
  let c = 'default';
  if (trouvailleIci(tx, ty) || surLaFerme(tx, ty)) c = 'pointer';
  else if (p && f.parcelles[p.u]) {
    const cs = f.cases[cle(tx, ty)];
    c = cs?.cult && cs.p >= 1 ? CURSEURS.faucille : outil.t === 'semer' && !cs?.cult ? CURSEURS.sac : outil.t === 'arracher' && cs?.cult ? 'crosshair' : 'pointer';
  } else if (p) c = CURSEURS.piece;
  if (c !== curseur) { curseur = c; ecran.style.cursor = c; }
}

let peinture = false, derniere = null, depart = null;
const surLaFerme = (tx, ty) => { const pl = planDe(F()); return typeCase(pl, tx, ty) === 'm' || (MODES[F().mode].echelle === 'planches' && typeCase(pl, tx, ty) === 'b'); };
const trouvailleIci = (tx, ty) => !!S.trouvaille && S.trouvaille.ferme === F().id && S.trouvaille.x === tx && S.trouvaille.y === ty;
function appliquer(tx, ty, premier) {
  const f = F(), p = parcelleDe(tx, ty);
  if (premier && trouvailleIci(tx, ty)) { Meca.ramasser(); return false; }
  if (surLaFerme(tx, ty)) { if (premier) ouvrirOnglet('production'); return false; }
  if (!p) return false;
  if (!f.parcelles[p.u]) {
    if (premier) { selectionner({ type: 'parcelle', u: p.u }); majInfo(); }
    return false;
  }
  const k = cle(tx, ty), t = f.cases[k];
  let fait = false;
  if (t.cult && t.p >= 1) { fait = recolterChamp(f, p.u) > 0; if (fait && S.guide === 3) S.guide = 4; }
  else if (outil.t === 'semer') {
    if (MODES[f.mode].echelle === 'champs' && premier) fait = semerChamp(f, p.u, outil.id);
    else fait = semerCase(f, k, outil.id, premier, tx, ty);
  } else if (outil.t === 'arracher') fait = arracher(f, k);
  if (premier) selectionner({ type: 'case', tx, ty });
  if (fait) apresAction(false); else majInfo();
  return fait;
}
ecran.addEventListener('pointerdown', e => {
  const s = Rendu.sous(e);
  Rendu.onde(s.px, s.py);
  if (e.pointerType === 'mouse') {
    if (e.button !== 0) return;
    peinture = true; derniere = cle(s.tx, s.ty);
    ecran.setPointerCapture(e.pointerId);
    appliquer(s.tx, s.ty, true);
  } else depart = { x: e.clientX, y: e.clientY };
});
ecran.addEventListener('pointermove', e => {
  const s = Rendu.sous(e);
  Rendu.survol = { tx: s.tx, ty: s.ty }; Rendu.pointeur = { px: s.px, py: s.py };
  if (peinture && cle(s.tx, s.ty) !== derniere) {
    const [px, py] = derniere.split(',').map(Number), n = Math.max(Math.abs(s.tx - px), Math.abs(s.ty - py));
    for (let i = 1; i <= n; i++) appliquer(Math.round(px + (s.tx - px) * i / n), Math.round(py + (s.ty - py) * i / n), false);
    derniere = cle(s.tx, s.ty);
  }
  if (e.pointerType === 'mouse') { majBulle(e, s.tx, s.ty); majCurseur(s.tx, s.ty); }
});
ecran.addEventListener('pointerup', e => {
  peinture = false;
  if (depart && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) < 10) { const s = Rendu.sous(e); appliquer(s.tx, s.ty, true); }
  depart = null;
});
ecran.addEventListener('pointerleave', () => { Rendu.survol = null; Rendu.pointeur = null; bulle.hidden = true; });

// ---------- Bulle et panneau d'information ----------
const bulle = document.getElementById('bulle');
const etoilesTexte = n => `<span class="or">${'★'.repeat(n)}</span><span class="eteinte">${'★'.repeat(3 - n)}</span>`;
function descriptionCase(f, t, long) {
  const ru = ruMax(f, t);
  const eau = `Eau du sol ${nf(t.r)} / ${nf(ru)} mm`;
  if (!t.cult) return `<b>${MODES[f.mode].couvert ? 'Couvert végétal' : 'Terre nue'}</b><br>${eau}<br>Matière organique ${nf(t.mo, 2)} %${t.fam ? `<br>Précédent : ${t.fam}` : ''}`;
  const c = CULTURE[t.cult], r = rendement(f, t, S.jour), mode = MODES[f.mode];
  const etat = t.p >= 1 ? (t.mur > 12 ? '<span class="mauvais">Trop mûr, se perd</span>' : '<span class="bon">Mûr : cliquez pour récolter</span>')
    : `Développement ${nf(t.p * 100)} % (${nf(t.dj)} / ${nf(c.dj)} °C·j)`;
  if (t.p < 0.15) return `<b>${c.nom}</b><br>${etat}<br>Semé il y a peu : le rendement se dessine après la levée.${long ? `<br>${eau}<br>Azote minéral ${nf(t.nmin)} kg/ha · matière organique ${nf(t.mo, 2)} %` : ''}`;
  let html = `<b>${c.nom}</b> ${etoilesTexte(etoilesRecolte(r.ha / c.rdt))}<br>${etat}<br>Prévu ≈ <b>${nf(r.ha, r.ha < 10 ? 1 : 0)} t/ha</b>, soit ${masse(r.ha * 1000 * mode.caseHa)} sur la case`;
  const freins = [['eau', r.eau], ['azote', r.azote], ['gel', r.gel], ['chaleur', r.chaleur], ['ombre des arbres', r.ombre], ['transition', r.trans]].filter(([, v]) => v < 0.97);
  if (freins.length) html += `<br><span class="mauvais">Pertes : ${freins.map(([n, v]) => `${n} −${nf((1 - v) * 100)} %`).join(', ')}</span>`;
  if (t.rot < 1) html += '<br><span class="mauvais">Même famille qu’avant : −12 %</span>';
  if (t.rot > 1) html += '<br><span class="bon">Après une légumineuse : +5 %</span>';
  if (long) html += `<br>${eau}<br>Azote minéral ${nf(t.nmin)} kg/ha · matière organique ${nf(t.mo, 2)} %`;
  return html;
}
const NOM_RPG = { prairie: 'prairie', friche: 'friche ou bande enherbée' };
function descriptionVoisin(f, u) {
  const v = voisin(f, u, S.jour);
  const quoi = v.type === 'culture' ? v.c.nom.toLowerCase() : NOM_RPG[v.type];
  const quand = v.reel ? `déclaré à la PAC en ${v.an}` : v.an ? `assolement de ${v.an} à la PAC` : '';
  return `<b>Champ voisin · ${surfaceTexte(surfaceUnite(f, u))}</b><br>${majuscule(quoi)}${quand ? ` <span class="discret">(${quand})</span>` : ''}`;
}
function majBulle(e, tx, ty) {
  const f = F(), p = parcelleDe(tx, ty);
  let html = '';
  if (trouvailleIci(tx, ty)) html = '<b>Quelque chose brille</b><br>Cliquez pour ramasser.';
  else if (surLaFerme(tx, ty)) html = '<b>La ferme</b><br>Cliquez pour voir la production.';
  else if (p && f.parcelles[p.u]) html = descriptionCase(f, f.cases[cle(tx, ty)], false);
  else if (p) html = `${descriptionVoisin(f, p.u)}<br>À vendre : ${euros(prixParcelle(f, p.u))}`;
  if (!html) { bulle.hidden = true; return; }
  bulle.innerHTML = html; bulle.hidden = false;
  bulle.style.left = Math.min(e.clientX + 16, innerWidth - bulle.offsetWidth - 8) + 'px';
  bulle.style.top = Math.min(e.clientY + 16, innerHeight - bulle.offsetHeight - 8) + 'px';
}

const info = document.getElementById('info');
function majInfo() {
  const f = F();
  if (selection?.type === 'parcelle' && !f.parcelles[selection.u]) {
    const u = selection.u, prix = prixParcelle(f, u), rpg = planDe(f).unites[u].rpg;
    const histo = Object.entries(rpg).map(([an, code]) => { const c = RPG_CULTURE[code]; return `${an} ${c ? CULTURE[c].nom.toLowerCase() : RPG_HERBE.includes(code) ? 'prairie' : 'autre'}`; }).join(' · ');
    info.innerHTML = `<h3>Champ à acheter</h3><p>${descriptionVoisin(f, u)}</p>
      ${histo ? `<p class="ligne2">Cultures déclarées : ${histo}</p>` : ''}
      <button class="principal" data-action="acheter" ${S.argent < prix ? 'disabled' : ''}>Acheter pour ${euros(prix)}</button>`;
  } else if (selection?.type === 'case' && f.cases[cle(selection.tx, selection.ty)]) {
    info.innerHTML = `<h3>Case de ${surfaceTexte(MODES[f.mode].caseHa)}</h3><p>${descriptionCase(f, f.cases[cle(selection.tx, selection.ty)], true)}</p>`;
  } else {
    info.innerHTML = `<p class="discret">${lieu(f).nom} (${lieu(f).pays}). Cliquez un champ voisin pour voir ce qu’on y a vraiment cultivé, ou une de vos cases pour son eau et ce qui freine son rendement.</p>`;
  }
}
info.addEventListener('click', e => {
  if (e.target.closest('[data-action="acheter"]') && selection?.type === 'parcelle') acheter(selection.u);
});

let toastMinuteur = 0;
function toast(txt) {
  const el = document.getElementById('toast');
  el.textContent = txt; el.classList.remove('visible'); void el.offsetWidth; el.classList.add('visible');
  clearTimeout(toastMinuteur); toastMinuteur = setTimeout(() => el.classList.remove('visible'), 2800);
}

// ---------- Barre du haut ----------
const iconeMet = document.getElementById('icone-meteo').getContext('2d');
const spark = document.getElementById('spark'), gs = spark.getContext('2d');
let dateVue = '';
function majEntete() {
  const f = F(), m = f.meteo, el = document.getElementById('date'), txt = texteDate();
  if (txt !== dateVue) { dateVue = txt; el.textContent = txt; if (S.vitesse > 0 && S.vitesse <= 3) Compteur.rebond(el, 'tourne'); }
  document.getElementById('ferme-nom').textContent = `${lieu(f).nom} · ${MODES[f.mode].court}`;
  Compteur.animer(document.getElementById('argent'), S.argent, euros, 500);
  if (m) {
    document.getElementById('temp').innerHTML = `<b>${nf(m.tmax, 0)}°</b> / ${nf(m.tmin, 0)}°`;
    document.getElementById('pluie').textContent = m.neige > 0.3 ? `${nf(m.neige, m.neige < 10 ? 1 : 0)} mm de neige` : `${nf(m.pluie, m.pluie < 10 ? 1 : 0)} mm`;
    document.getElementById('meteo').title = m.futur ? 'Temps simulé (après les dernières mesures SAFRAN)' : 'Temps mesuré (SAFRAN, Météo-France)';
    document.getElementById('meteo').classList.toggle('futur', m.futur);
  }
  dessinerSpark(f);
  for (const b of document.querySelectorAll('[data-vitesse]')) b.setAttribute('aria-pressed', String(+b.dataset.vitesse === S.vitesse));
}
// 60 derniers jours : pluie en barres, températures max et min en courbes
function dessinerSpark(f) {
  const w = spark.width = Math.round(100 * devicePixelRatio), h = spark.height = Math.round(30 * devicePixelRatio);
  gs.clearRect(0, 0, w, h);
  const hs = f.histo, n = 60, bw = w / n;
  gs.fillStyle = '#7fb6e8';
  hs.forEach((d, i) => { const ph = Math.min(h, d[2] / 30 * h); gs.fillRect(i * bw, h - ph, Math.max(1, bw - 1), ph); });
  const y = v => h - (v + 10) / 50 * h;
  for (const [idx, col] of [[1, '#ffb070'], [0, '#bfe0ff']]) {
    gs.strokeStyle = col; gs.lineWidth = devicePixelRatio; gs.beginPath();
    hs.forEach((d, i) => { const px = i * bw + bw / 2, py = y(d[idx]); i ? gs.lineTo(px, py) : gs.moveTo(px, py); });
    gs.stroke();
  }
}
function majProduction(pulse) {
  const f = F(), kg = Math.max(0, f.stats.kg - attente.kg), kcal = Math.max(0, f.stats.kcal - attente.kcal);
  Compteur.animer(document.getElementById('prod-t'), kg, masse);
  Compteur.animer(document.getElementById('prod-kcal'), kcal, energie);
  Compteur.animer(document.getElementById('prod-pers'), personnesAn(kcal), p => `${nf(p, p < 10 ? 1 : 0)} pers.-an`);
  if (pulse) Compteur.rebond(document.getElementById('production'), 'pulse');
}
function regler(v) {
  S.vitesse = v;
  if (v >= 10 && S.guide === 2) S.guide = 3;
  majEntete();
}
document.getElementById('vitesses').addEventListener('click', e => { const b = e.target.closest('[data-vitesse]'); if (b) regler(+b.dataset.vitesse); });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.target.closest('input, textarea, button')) { e.preventDefault(); regler(S.vitesse ? 0 : 1); }
});
document.getElementById('niveau').addEventListener('click', () => ouvrirOnglet('commandes'));

// Choix de la ferme
const menuFermes = document.getElementById('menu-fermes');
document.getElementById('choix-ferme').addEventListener('click', () => {
  const peutCreer = S.fermes.every(pleine);
  menuFermes.innerHTML = S.fermes.map((f, i) => `<button data-ferme="${i}" ${i === S.active ? 'aria-current="true"' : ''}>${lieu(f).nom} · ${MODES[f.mode].court}<span>${masse(f.stats.kg)}</span></button>`).join('')
    + `<button data-ferme="nouvelle" ${peutCreer ? '' : 'disabled'}>Nouvelle ferme${peutCreer ? '' : '<span>quand toutes les parcelles sont achetées</span>'}</button>`;
  menuFermes.hidden = !menuFermes.hidden;
});
menuFermes.addEventListener('click', e => {
  const b = e.target.closest('[data-ferme]'); if (!b || b.disabled) return;
  menuFermes.hidden = true;
  if (b.dataset.ferme === 'nouvelle') { ouvrirInstallation(); return; }
  S.active = +b.dataset.ferme; selectionner(null); Rendu.preparer(); outilParDefaut(); apresAction(true); majProduction(false);
});
document.addEventListener('click', e => { if (!e.target.closest('#menu-fermes, #choix-ferme')) menuFermes.hidden = true; });

// ---------- Outils ----------
// Semence par défaut : celle d'une commande qui se sème ce mois-ci, sinon une culture ouverte qui se sème maintenant
function outilParDefaut() {
  const f = F(), dispo = culturesDebloquees(f.mode), mois = dateDe(S.jour).mois, semable = id => CULTURE[id].semis.includes(mois);
  if (!dispo.includes(outil.id) || !semable(outil.id)) {
    const commande = S.commandes.map(o => o.c).find(id => dispo.includes(id) && semable(id));
    outil = { t: 'semer', id: commande || dispo.find(semable) || (dispo.includes(outil.id) ? outil.id : dispo[0]) };
  }
  majOutils();
}
function choisirSemence(id) {
  const c = CULTURE[id], mois = dateDe(S.jour).mois;
  outil = { t: 'semer', id }; majOutils(); Compteur.rebond(document.querySelector('[data-outil="semer"]'));
  toast(c.semis.includes(mois) ? `${c.nom} : cliquez un de vos champs pour semer.` : `${c.nom} : semis en ${plages(c.semis)}, avancez le temps jusque-là.`);
}
function majOutils() {
  const f = F(), mode = MODES[f.mode];
  document.getElementById('nom-semence').textContent = CULTURE[outil.id].nom;
  for (const b of document.querySelectorAll('[data-outil]')) b.setAttribute('aria-pressed', String(b.dataset.outil === outil.t));
  const irr = document.querySelector('[data-action-outil="irrigation"]');
  irr.disabled = !mode.irrigation;
  irr.innerHTML = mode.irrigation ? `Irrigation : <b>${f.irrigation ? 'oui' : 'non'}</b>` : 'Pas d’irrigation';
  irr.setAttribute('aria-pressed', String(!!(f.irrigation && mode.irrigation)));
  document.querySelector('[data-action-outil="ferti"]').innerHTML = `${mode.fertilisation === 'fumier' ? 'Fumier' : mode.fertilisation === 'compost' ? 'Compost' : 'Engrais'} : <b>${{ aucune: 'aucun', moderee: 'modéré', forte: 'fort' }[f.ferti]}</b>`;
}
document.getElementById('outils').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.outil) { outil = { ...outil, t: b.dataset.outil }; if (outil.t === 'semer') ouvrirOnglet('semences'); }
  const a = b.dataset.actionOutil, f = F();
  if (a === 'recolter') recolterTout();
  if (a === 'irrigation' && MODES[f.mode].irrigation) f.irrigation = !f.irrigation;
  if (a === 'ferti') f.ferti = { aucune: 'moderee', moderee: 'forte', forte: 'aucune' }[f.ferti];
  Compteur.rebond(b, 'appui');
  majOutils(); if (onglet === 'ferme') majOnglet();
});

function majJournal(neuf) {
  const ol = document.getElementById('journal'); if (!ol || !S) return;
  ol.innerHTML = S.journal.slice(0, 4).map((n, i) => `<li${neuf && i === 0 ? ' class="neuf"' : ''}><span>${n.d}</span> ${n.txt}</li>`).join('');
}

// ---------- Onglets ----------
const vue = document.getElementById('vue');
let onglet = 'commandes', seulementSemables = true, ongletSale = true;
function ouvrirOnglet(nom) {
  const change = onglet !== nom;
  onglet = nom; ongletSale = true;
  for (const b of document.querySelectorAll('[data-onglet]')) b.setAttribute('aria-selected', String(b.dataset.onglet === nom));
  placerIndicateur();
  if (nom === 'commandes') Meca.nouvelles = 0;
  majBadge();
  majOnglet();
  if (change) Compteur.rebond(vue, 'apparait');
}
function placerIndicateur() {
  const b = document.querySelector(`[data-onglet="${onglet}"]`), ind = document.getElementById('indicateur');
  if (b && ind) { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`; }
}
document.getElementById('onglets').addEventListener('click', e => { const b = e.target.closest('[data-onglet]'); if (b) ouvrirOnglet(b.dataset.onglet); });
// Vignette d'une culture : sa terre et la plante au stade le plus parlant
function icone(cv, c) {
  const g = cv.getContext('2d'), planches = S && MODES[F().mode].echelle === 'planches';
  g.clearRect(0, 0, cv.width, cv.height);
  terre(g, 0, 0, 3, 3, { mo: 2.5, sec: 0, chaume: 0 }, planches ? 'planches' : 'champs');
  dessinerPlante(g, 0, 6, c, STADE_ICONE[c.forme] ?? 1, 1, 0, false);
}

function graphiqueAnnees(cv, f) {
  const g = cv.getContext('2d'), w = cv.width = Math.round(cv.clientWidth * devicePixelRatio), h = cv.height = Math.round(150 * devicePixelRatio);
  const css = getComputedStyle(document.documentElement), enc = css.getPropertyValue('--muted').trim(), or = css.getPropertyValue('--or').trim(), ciel = css.getPropertyValue('--ciel').trim();
  const an1 = dateDe(S.jour).an, an0 = Math.max(an1 - 39, 1959);
  const ans = []; for (let a = an0; a <= an1; a++) ans.push(a);
  const maxK = Math.max(1, ...ans.map(a => f.stats.parAn[a]?.kcal || 0)), maxP = Math.max(400, ...ans.map(a => f.climatAn[a]?.pluie || 0));
  const G = 34 * devicePixelRatio, B = 16 * devicePixelRatio, bw = (w - G) / ans.length;
  g.font = `${10 * devicePixelRatio}px system-ui, sans-serif`; g.fillStyle = enc;
  g.fillText(energie(maxK), 0, 10 * devicePixelRatio);
  ans.forEach((a, i) => {
    const k = f.stats.parAn[a]?.kcal || 0, bh = k / maxK * (h - B - 14 * devicePixelRatio);
    g.fillStyle = or; g.fillRect(G + i * bw + 1, h - B - bh, Math.max(1, bw - 2), bh);
    if (a % 10 === 0 || (i === 0 && a % 10 < 7)) { g.fillStyle = enc; g.fillText(a, G + i * bw, h - 3 * devicePixelRatio); }
  });
  g.strokeStyle = ciel; g.lineWidth = 1.5 * devicePixelRatio; g.beginPath();
  ans.forEach((a, i) => { const p = f.climatAn[a]?.pluie; if (p == null) return; const x = G + i * bw + bw / 2, y = h - B - p / maxP * (h - B - 14 * devicePixelRatio); i && f.climatAn[a - 1] ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.stroke();
}
function graphiqueSol(cv, f) {
  const g = cv.getContext('2d'), w = cv.width = Math.round(cv.clientWidth * devicePixelRatio), h = cv.height = Math.round(120 * devicePixelRatio);
  const css = getComputedStyle(document.documentElement), enc = css.getPropertyValue('--muted').trim(), terreC = css.getPropertyValue('--terre').trim();
  const pts = [...f.solAns, { an: dateDe(S.jour).an, mo: etatSol(f).mo }];
  if (pts.length < 2) { g.fillStyle = enc; g.font = `${11 * devicePixelRatio}px system-ui`; g.fillText('La courbe apparaît après la première année.', 4, h / 2); return; }
  const min = Math.min(...pts.map(p => p.mo)) - 0.2, max = Math.max(...pts.map(p => p.mo)) + 0.2;
  const X = i => 30 * devicePixelRatio + i / (pts.length - 1) * (w - 34 * devicePixelRatio), Y = v => 6 * devicePixelRatio + (max - v) / (max - min) * (h - 22 * devicePixelRatio);
  g.font = `${10 * devicePixelRatio}px system-ui`; g.fillStyle = enc;
  g.fillText(nf(max, 1) + ' %', 0, Y(max) + 8 * devicePixelRatio); g.fillText(nf(min, 1) + ' %', 0, Y(min));
  g.fillText(pts[0].an, X(0), h - 2); g.textAlign = 'right'; g.fillText(pts.at(-1).an, w, h - 2); g.textAlign = 'left';
  g.strokeStyle = terreC; g.lineWidth = 2 * devicePixelRatio; g.beginPath();
  pts.forEach((p, i) => i ? g.lineTo(X(i), Y(p.mo)) : g.moveTo(X(i), Y(p.mo))); g.stroke();
}

function carteSemence(c, mode, mois, maxK, verrou) {
  const k = kcalParHa(c), ouvert = c.semis.includes(mois), i = ordreMode(F().mode).indexOf(c.id), niv = Math.max(2, Math.ceil((i - 4) / 2) + 1);
  return `<button class="carte${outil.id === c.id ? ' choisie' : ''}${ouvert ? '' : ' fermee'}${verrou ? ' verrou' : ''}" data-semence="${c.id}">
    <canvas width="48" height="48" data-icone="${c.id}"></canvas>
    <span class="corps">
      <span class="ligne1"><b>${c.nom}</b><span class="${verrou ? 'cadenas' : ouvert ? 'bon' : 'discret'}">${verrou ? `niveau ${niv}` : plages(c.semis)}</span></span>
      <span class="ligne2"><b>${nf(c.rdt, c.rdt < 10 ? 1 : 0)} t/ha</b> · ${c.kcal} kcal/100 g · ${nf(c.dj)} °C·j</span>
      <span class="jauge"><span style="--part:${(k / maxK).toFixed(3)}"></span></span>
      <span class="ligne2">${nf(k / 1e6, 1)} Mkcal/ha · ≈ ${masse(c.rdt * 1000 * mode.caseHa)} par case</span>
    </span></button>`;
}
const ONGLETS = {
  commandes: () => Meca.vue(),
  semences() {
    const f = F(), mode = MODES[f.mode], mois = dateDe(S.jour).mois;
    const ouvertes = culturesDebloquees(f.mode).map(id => CULTURE[id]);
    const maxK = Math.max(...CULTURES.filter(c => cultureAutorisee(f.mode, c)).map(kcalParHa));
    let html = `<label class="filtre"><input type="checkbox" data-action="filtre" ${seulementSemables ? 'checked' : ''}> Seulement ce qui se sème en ${NOMS_MOIS[mois - 1]}</label>`;
    let rien = true;
    for (const cat of CATEGORIES) {
      const liste = ouvertes.filter(c => c.cat === cat && (!seulementSemables || c.semis.includes(mois)));
      if (!liste.length) continue;
      rien = false;
      html += `<h3>${cat}</h3><div class="cartes">${liste.map(c => carteSemence(c, mode, mois, maxK, false)).join('')}</div>`;
    }
    if (rien) html += `<p class="vide">Rien de ce que vous cultivez ne se sème en ${NOMS_MOIS[mois - 1]}. Décochez la case pour tout voir, ou avancez le temps.</p>`;
    const bientot = ordreMode(f.mode).slice(nbDebloquees(S.etoiles), nbDebloquees(S.etoiles) + 2).map(id => CULTURE[id]);
    if (bientot.length) html += `<h3>Bientôt</h3><div class="cartes">${bientot.map(c => carteSemence(c, mode, mois, maxK, true)).join('')}</div>`;
    return html;
  },
  production() {
    const f = F(), s = f.stats, p = personnesAn(s.kcal);
    let html = `<div class="chiffres">
      <div><b>${masse(s.kg)}</b><span>récoltées</span></div>
      <div><b>${energie(s.kcal)}</b><span>d’énergie</span></div>
      <div><b>${nf(p, p < 10 ? 1 : 0)}</b><span>personnes nourries un an</span></div></div>
      <h3>Énergie récoltée par année <span class="legende-pluie">et pluie de l’année</span></h3>
      <canvas class="graphique" id="graph-annees"></canvas>`;
    const ids = Object.keys(s.parCulture);
    if (ids.length) {
      html += `<h3>Par culture</h3><div class="defile-tableau"><table class="tableau"><thead><tr><th>Culture</th><th>Récolté</th><th>Dernier</th><th>France</th><th>Énergie</th></tr></thead><tbody>`;
      for (const id of ids.sort((a, b) => s.parCulture[b].kcal - s.parCulture[a].kcal)) {
        const c = CULTURE[id], q = s.parCulture[id], ecart = q.dernier / c.rdt;
        html += `<tr><td>${c.nom}</td><td>${masse(q.kg)}</td><td class="${ecart >= 1 ? 'bon' : ecart < 0.75 ? 'mauvais' : ''}">${nf(q.dernier, q.dernier < 10 ? 1 : 0)} t/ha</td><td class="discret">${nf(c.rdt, c.rdt < 10 ? 1 : 0)}</td><td>${energie(q.kcal)}</td></tr>`;
      }
      html += '</tbody></table></div>';
    } else html += '<p class="vide">Aucune récolte encore.</p>';
    if (s.bois) html += `<p class="ligne2">Bois d’œuvre récolté : ${nf(s.bois)} t.</p>`;
    html += `<h3>Comparer les cultures</h3><div class="defile-tableau"><table class="tableau"><thead><tr><th>Culture</th><th>t/ha</th><th>kcal/100 g</th><th>Mkcal/ha</th></tr></thead><tbody>`;
    const max = Math.max(...CULTURES.map(kcalParHa));
    for (const c of [...CULTURES].sort((a, b) => kcalParHa(b) - kcalParHa(a))) {
      html += `<tr class="${cultureAutorisee(f.mode, c) ? '' : 'hors-mode'}"><td>${c.nom}</td><td>${nf(c.rdt, c.rdt < 10 ? 1 : 0)}</td><td>${c.kcal}</td><td><span class="mini-jauge" style="--p:${(kcalParHa(c) / max * 100).toFixed(0)}%"></span>${nf(kcalParHa(c) / 1e6, 1)}</td></tr>`;
    }
    return html + `</tbody></table></div><p class="source">Rendements moyens en France (Agreste, références maraîchères) et énergie CIQUAL (ANSES), arrondis. Grisé : hors de ce mode.</p>`;
  },
  sol() {
    const f = F(), s = etatSol(f), r = region(f), part = clamp(s.r / s.ru, 0, 1);
    return `<h3>Eau dans le sol aujourd’hui</h3>
      <div class="barre-eau"><span style="--part:${part.toFixed(3)}"></span></div>
      <p class="ligne2">${nf(s.r)} mm sur ${nf(s.ru)} mm de réserve utile${part < 0.5 ? ' : <span class="mauvais">les cultures manquent d’eau</span>' : ''}</p>
      <div class="chiffres sol">
        <div><b>${nf(s.mo, 2)} %</b><span>matière organique (départ ${nf(f.moDepart, 2)} %)</span></div>
        <div><b>${nf(s.vdt)}</b><span>vers de terre, sur 100</span></div>
        <div><b>${nf(s.nmin)}</b><span>kg d’azote minéral par ha</span></div>
        <div><b>${nf(s.erosion, 1)} mm</b><span>de réserve perdus par l’érosion</span></div></div>
      <h3>Matière organique au fil des ans</h3>
      <canvas class="graphique" id="graph-sol"></canvas>
      <p class="ligne2">Sol de départ : ${r.sol}, ${r.ru} mm de réserve utile, ${nf(r.mo, 1)} % de matière organique.</p>
      <p class="discret">Le labour et le sol nu font baisser la matière organique ; couverts, résidus, fumier, compost et arbres la font remonter. Plus elle est haute, plus le sol libère d’azote et retient d’eau.</p>`;
  },
  ferme() {
    const f = F(), mode = MODES[f.mode], r = region(f), j = S.jour;
    const tr = mode.transition, ans = (j - f.modeDepuis) / 365, enTransition = f.modeAvant && ans < tr.ans;
    let html = `<h3>${r.nom} · ${r.ville}</h3>
      <p class="ligne2">${r.sol} · ${r.ru} mm de réserve utile · ${nf(r.tRef, 1)} °C et ${nf(r.pRef)} mm par an en 1961-1990 · réchauffement depuis 1990 : +${nf(r.pente * 10, 2)} °C par décennie</p>
      <h3>${mode.nom}</h3><p>${mode.texte}</p>`;
    if (enTransition) html += `<p class="mauvais">Transition en cours : encore ${nf(tr.ans - ans, 1)} an(s), rendement −${nf(tr.perte * (1 - ans / tr.ans) * 100)} %.</p>`;
    if (mode.arbres) { const age = ageArbres(f, j); html += `<p class="ligne2">Arbres de ${nf(age, 0)} ans · bois sur pied ≈ ${nf(Object.keys(f.cases).length * mode.caseHa * 0.5 * age)} t · coupe à 50 ans.</p>`; }
    html += `<h3>Eau et fertilisation</h3>
      <p class="ligne2">${mode.irrigation ? `Irrigation ${mode.irrigation === 'goutte' ? 'au goutte-à-goutte' : 'par enrouleur'} : ${f.irrigation ? 'en marche' : 'arrêtée'} · ${nf(f.stats.eau)} m³ utilisés depuis le début.` : 'Pas d’irrigation dans ce mode.'}</p>
      <div class="boutons">
        ${mode.irrigation ? `<button data-action="irrigation">${f.irrigation ? 'Arrêter l’irrigation' : 'Irriguer'}</button>` : ''}
        ${['aucune', 'moderee', 'forte'].map(v => `<button data-action="ferti" data-v="${v}" aria-pressed="${f.ferti === v}">${{ aucune: 'Sans apport', moderee: 'Apport modéré', forte: 'Apport fort' }[v]}</button>`).join('')}
      </div>`;
    const autres = FAMILLE_ECHELLE[mode.echelle].filter(m => m !== f.mode);
    if (autres.length) html += `<h3>Changer de mode</h3><div class="modes-mini">${autres.map(m => `<button data-action="mode" data-mode="${m}"><b>${MODES[m].nom}</b><span>${MODES[m].transition.ans} an${MODES[m].transition.ans > 1 ? 's' : ''} de transition</span></button>`).join('')}</div>`;
    html += `<p class="source">Prix fixes, pour l’ordre de grandeur. Trésorerie : ${euros(S.argent)}.</p>
      <button data-action="nouvelle" class="discret-bouton">Recommencer une partie</button>`;
    return html;
  },
};

const partsVues = new Map();
function majOnglet() {
  const haut = vue.scrollTop;
  vue.innerHTML = ONGLETS[onglet]();
  for (const cv of vue.querySelectorAll('canvas[data-icone]')) icone(cv, CULTURE[cv.dataset.icone]);
  if (onglet === 'commandes') {
    Meca.apresVue(vue);
    // chaque barre d'avancement repart de sa valeur précédente et glisse jusqu'à la nouvelle
    for (const el of vue.querySelectorAll('[data-commande]')) {
      const barre = el.querySelector('.barre > span'), id = el.dataset.commande, neuve = barre.style.getPropertyValue('--part'), vieille = partsVues.get(id);
      if (vieille != null && vieille !== neuve) { barre.style.setProperty('--part', vieille); void barre.offsetWidth; barre.style.setProperty('--part', neuve); }
      else if (vieille == null) el.classList.add('arrivee');
      partsVues.set(id, neuve);
    }
  }
  if (onglet === 'production') graphiqueAnnees(document.getElementById('graph-annees'), F());
  if (onglet === 'sol') graphiqueSol(document.getElementById('graph-sol'), F());
  vue.scrollTop = haut;
  ongletSale = false;
}
vue.addEventListener('click', e => {
  const s = e.target.closest('[data-semence]');
  if (s) {
    if (s.classList.contains('verrou')) { toast(messageVerrou(F(), s.dataset.semence)); Compteur.rebond(s, 'non'); return; }
    choisirSemence(s.dataset.semence); majOnglet(); return;
  }
  const a = e.target.closest('[data-action]'), cmd = e.target.closest('[data-commande]');
  if (a?.dataset.action === 'livrer' && cmd) { cmd.classList.add('livree'); Meca.livrer(cmd.dataset.commande, a); setTimeout(() => majOnglet(), 750); return; }
  if (a?.dataset.action === 'refuser' && cmd) { cmd.classList.add('refusee'); setTimeout(() => { Meca.refuser(cmd.dataset.commande); majOnglet(); }, 280); return; }
  if (cmd && !a) { const o = S.commandes.find(x => x.id === cmd.dataset.commande); if (o) { choisirSemence(o.c); Meca.avancerGuide(0); Compteur.rebond(cmd); } return; }
  if (!a) return;
  const f = F();
  if (a.dataset.action === 'irrigation') { f.irrigation = !f.irrigation; majOutils(); majOnglet(); }
  else if (a.dataset.action === 'ferti') { f.ferti = a.dataset.v; majOutils(); majOnglet(); }
  else if (a.dataset.action === 'mode') changerMode(a.dataset.mode);
  else if (a.dataset.action === 'nouvelle' && confirm('Recommencer une partie ? Toutes les fermes seront perdues.')) {
    try { localStorage.removeItem(CLE); } catch (er) { /* rien */ }
    S = null; ouvrirInstallation();
  }
});
vue.addEventListener('change', e => { if (e.target.matches('[data-action="filtre"]')) { seulementSemables = e.target.checked; majOnglet(); } });

function apresAction(structure) {
  verifierObjectifs();
  majEntete(); majInfo(); majOutils();
  if (structure || onglet !== 'semences') majOnglet();
}
// Chaque objectif atteint rapporte trois étoiles
function verifierObjectifs() {
  for (const o of OBJECTIFS) {
    if (S.objectifs[o.id] || !o.ok()) continue;
    S.objectifs[o.id] = true;
    noter(`Objectif atteint : ${o.txt.toLowerCase()}.`);
    const r = ecran.getBoundingClientRect();
    Meca.gagner(3, { x: r.left + r.width / 2, y: r.top + r.height / 3 });
    if (onglet === 'commandes') ongletSale = true;
  }
}

// ---------- Installation : carte de France ----------
// Pour commencer, un seul vrai lieu ; les autres régions sont annoncées.
const install = document.getElementById('installation');
let choixLieu = Object.keys(LIEUX)[0], choixMode = 'gc';
function ouvrirInstallation() {
  install.hidden = false;
  document.getElementById('guide').hidden = true;
  document.getElementById('install-titre').textContent = S ? 'Où installer la nouvelle ferme ?' : 'Où installer votre ferme ?';
  const svg = document.getElementById('carte-france');
  if (!svg.childElementCount) {
    const xs = FRANCE.join(' ').match(/-?\d+\.?\d*/g).map(Number);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < xs.length; i += 2) { x0 = Math.min(x0, xs[i]); x1 = Math.max(x1, xs[i]); y0 = Math.min(y0, xs[i + 1]); y1 = Math.max(y1, xs[i + 1]); }
    svg.setAttribute('viewBox', `${x0 - 12} ${y0 - 12} ${x1 - x0 + 24} ${y1 - y0 + 24}`);
    const ns = 'http://www.w3.org/2000/svg';
    for (const d of FRANCE) { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'pays'); svg.appendChild(p); }
    const actifs = new Set(Object.values(LIEUX).map(L => L.climat));
    for (const r of REGIONS) {
      if (actifs.has(r.id)) continue;
      const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'lieu bientot');
      g.innerHTML = `<title>${r.nom} : bientôt</title><circle cx="${r.x}" cy="${r.y}" r="4"></circle>`;
      svg.appendChild(g);
    }
    for (const [id, L] of Object.entries(LIEUX)) {
      const r = REGIONS.find(x => x.id === L.climat);
      const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'lieu'); g.dataset.lieu = id; g.setAttribute('tabindex', '0');
      g.innerHTML = `<title>${L.nom}</title><circle class="onde" cx="${r.x}" cy="${r.y}" r="7"></circle><circle cx="${r.x}" cy="${r.y}" r="7"></circle><text x="${r.x + 12}" y="${r.y + 5}">${L.nom}</text>`;
      svg.appendChild(g);
    }
  }
  majInstallation();
}
function majInstallation() {
  const L = LIEUX[choixLieu], r = REGIONS.find(x => x.id === L.climat);
  for (const g of document.querySelectorAll('#carte-france .lieu')) g.classList.toggle('actif', g.dataset.lieu === choixLieu);
  document.getElementById('install-region').innerHTML = `<h2>${L.nom}</h2><p class="ligne2">${L.pays} · ${r.sol} · ${L.champs.unites.length} vrais champs sur 1,6 × 1,25 km</p>
    <div class="chiffres petit"><div><b>${nf(r.tRef, 1)} °C</b><span>par an, 1961-1990</span></div><div><b>${nf(r.pRef)} mm</b><span>de pluie par an</span></div>
    <div><b>${r.ru} mm</b><span>de réserve utile</span></div><div><b>+${nf(r.pente * 10, 2)} °C</b><span>par décennie depuis 1990</span></div></div>
    <p class="discret">Champs déclarés à la PAC de 2015 à 2024, bâtiments, chemins et bois de la BD TOPO (IGN), climat SAFRAN de la maille.</p>`;
  document.getElementById('install-modes').innerHTML = Object.entries(MODES).map(([id, m]) =>
    `<button data-mode="${id}" aria-pressed="${id === choixMode}"><b>${m.nom}</b><span>1 case = ${m.echelle === 'champs' ? '50 × 50 m' : '10 × 10 m'}</span><span class="texte">${m.texte}</span></button>`).join('');
  document.getElementById('install-go').textContent = S ? `S’installer le ${texteDate()}` : 'S’installer le 1er mars 1959';
}
document.getElementById('carte-france').addEventListener('click', e => {
  const g = e.target.closest('.lieu'); if (!g || !g.dataset.lieu) return;
  choixLieu = g.dataset.lieu; majInstallation();
});
document.getElementById('carte-france').addEventListener('keydown', e => {
  const g = e.target.closest('.lieu'); if (!g || !g.dataset.lieu || (e.key !== 'Enter' && e.key !== ' ')) return;
  e.preventDefault(); choixLieu = g.dataset.lieu; majInstallation();
});
document.getElementById('install-modes').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) { choixMode = b.dataset.mode; majInstallation(); } });
document.getElementById('install-go').addEventListener('click', async () => {
  const bouton = document.getElementById('install-go');
  bouton.disabled = true; bouton.textContent = 'Chargement du climat…';
  try { await Climat.charger(LIEUX[choixLieu].climat); } catch (e) { toast(e.message); bouton.disabled = false; majInstallation(); return; }
  const neuve = !S;
  if (neuve) { S = { v: 4, jour: DEBUT(), vitesse: 1, argent: 0, fermes: [], active: 0, objectifs: {}, journal: [] }; Meca.completer(S); S.guide = 0; S.prochaineCommande = S.jour + 18; }
  const f = creerFerme(choixLieu, choixMode);
  f.meteo = Climat.jour(f.region, S.jour);
  if (neuve) for (let i = 0; i < 2; i++) { const o = Meca.nouvelleCommande(); if (o) S.commandes.push(o); }
  install.hidden = true; bouton.disabled = false;
  selectionner(null);
  if (S.commandes[0]) outil = { t: 'semer', id: S.commandes[0].c };
  demarrer();
});

// ---------- Boucle ----------
let dernier = performance.now(), cumul = 0, jourAffiche = -1, enRoute = false, dernierRendu = 0, dernierLent = 0, derniereSauvegarde = 0;
function boucle(t) {
  const dt = Math.min(250, t - dernier); dernier = t;
  if (S && install.hidden && S.fermes.length) {
    if (S.vitesse > 0) {
      cumul += dt;
      const pas = JOUR_MS / S.vitesse;
      let n = 0;
      while (cumul >= pas && n < 10) { cumul -= pas; unJour(); n++; }
      if (n >= 10) cumul = 0;
    }
    if (S.jour !== jourAffiche) {
      jourAffiche = S.jour;
      verifierObjectifs(); majEntete();
      if (selection?.type === 'case') majInfo();
      const vivant = ['sol', 'ferme', 'production', 'commandes'].includes(onglet) && S.jour % 4 === 0 && !vue.matches(':hover');
      if ((ongletSale || vivant) && !peinture) majOnglet();
    } else if (ongletSale && !peinture) majOnglet();
    if (t - dernierLent > 150) {
      dernierLent = t;
      iconeMeteo(iconeMet, F().meteo || { tmin: 5, tmax: 12, pluie: 0, neige: 0 }, t);
      Meca.guide();
      document.querySelector('[data-action-outil="recolter"]').classList.toggle('pret', Rendu.murs.length > 0);
    }
    if (t - derniereSauvegarde > 20000) { derniereSauvegarde = t; sauver(); }
    // plus rien en vol : les compteurs affichés rejoignent les vrais (au cas où une arrivée se serait perdue)
    if (!Anim.effets.length && !Anim.enRetard && (attente.kg || attente.kcal || Meca.attente.etoiles)) { attente.kg = attente.kcal = 0; Meca.attente.etoiles = 0; majProduction(false); Meca.majNiveau(false); }
    // 60 images par seconde quand quelque chose bouge vite, 30 sinon
    const vif = Rendu.revel.size || Rendu.parts.length || Rendu.ondes.length || Anim.effets.length || Rendu.survol;
    if (vif || t - dernierRendu > 30) { Rendu.dessiner(t, t - dernierRendu); dernierRendu = t; }
    Anim.dessiner(t);
  }
  requestAnimationFrame(boucle);
}
function demarrer() {
  Rendu.preparer();
  outilParDefaut();
  majEntete(); majOutils(); majJournal(false); majInfo(); majProduction(false); Meca.majNiveau(false); majBadge();
  ouvrirOnglet('commandes');
  if (!enRoute) { enRoute = true; requestAnimationFrame(boucle); }
}

// ---------- Démarrage ----------
Anim.init();
addEventListener('resize', () => { if (S && S.fermes.length && install.hidden) { Rendu.dimensionner(); placerIndicateur(); } });
addEventListener('pagehide', sauver);
document.addEventListener('visibilitychange', () => { if (document.hidden) sauver(); });
(async () => {
  if (charger()) {
    try { await Promise.all(S.fermes.map(f => Climat.charger(f.region))); }
    catch (e) { toast(e.message); }
    for (const f of S.fermes) f.meteo = Climat.jour(f.region, S.jour);
    demarrer();
  } else { S = null; ouvrirInstallation(); }
})();
