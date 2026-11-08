'use strict';
/* Squid Ferme : état, temps, actions du joueur, interface.
   Dessin du champ : rendu.js ; vie autour de la ferme : vie.js ; effets : animations.js ;
   progression et marché (expérience, niveaux, stock, vente, bilan, premiers pas) : mecaniques.js. */

// ---------- Monde ----------
// Un lieu tiré d'une graine (js/carte.js) : grille « champs » de 50 m ou « planches » de 10 m selon le mode.
const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const CLE = 'squid-ferme-8';                     // changer ce numéro remet toutes les parties à zéro (les clés précédentes sont effacées au chargement)
const JOUR_MS = 5000;                               // durée d'un jour à la vitesse ×1
const DEBUT = () => indexJour(1959, 59);            // 1er mars 1959 : les semis de printemps commencent

// Objectifs : chacun fait entrer un champ voisin dans l'exploitation (attribués par parcellesAObjectif, du plus proche au plus lointain).
// On n'en voit que trois à la fois (objectifsActifs). Conditions comptées ferme par ferme et, sauf trois, cumulatives : le temps et les récoltes suffisent, le joueur n'est jamais bloqué.
const nbCultures = f => Object.keys(f.stats.parCulture).length;
const nbFamilles = f => new Set(Object.keys(f.stats.parCulture).map(id => CULTURE[id].famille)).size;
const nbAnnees = f => Object.values(f.stats.parAn).filter(a => a.kg > 0).length;
// Le meilleur gain d'une mesure de sol sur une parcelle (moyenne de ses cases)
function meilleureParcelle(f, mesure) {
  const pl = planDe(f), par = new Map();
  for (const k in f.cases) { const [x, y] = k.split(',').map(Number), u = pl.unite[y * pl.w + x], e = par.get(u) || [0, 0]; e[0] += mesure(f.cases[k]); e[1]++; par.set(u, e); }
  return Math.max(0, ...[...par.values()].map(([v, n]) => v / n));
}
const OBJ_T = (n, t) => ({ id: 't' + n, court: `${t} tonnes`, txt: `Récolter ${t} tonnes`, ok: f => f.stats.kg >= n * 1000 });
const OBJ_P = (n, t) => ({ id: 'p' + n, court: `${t} personnes`, txt: `Nourrir ${t} personnes pendant un an`, ok: f => f.stats.kcal >= n * BESOIN_KCAL * 365 });
const OBJ_E = (n, t) => ({ id: 'e' + n, court: `${t} €`, txt: `Vendre pour ${t} € de récoltes`, ok: f => (f.ventes || 0) >= n });
const OBJ_N = n => ({ id: 'niv' + n, court: `Niveau ${n}`, txt: `Atteindre le niveau ${n}`, ok: () => niveauDe(S.exp) >= n });
const OBJ_C = (n, t) => ({ id: 'c' + n, court: `${n} cultures`, txt: `Récolter ${t} cultures différentes`, ok: f => nbCultures(f) >= n });
const OBJ_F = (n, t) => ({ id: 'fam' + n, court: `${n} familles`, txt: `Récolter ${t} familles de plantes`, ok: f => nbFamilles(f) >= n });
const OBJ_A = (n, t) => ({ id: 'ans' + n, court: `${n} années`, txt: `Récolter pendant ${t} années`, ok: f => nbAnnees(f) >= n });
const OBJ_PREMIERS = 15;                              // jusqu'à l'objectif de matière organique compris
const OBJ_PARCELLES = [
  { id: 'recolte', court: '1re récolte', txt: 'Faire une première récolte', ok: f => f.stats.recoltes > 0 },
  { id: 'vente', court: '1re vente', txt: 'Vendre une première récolte', ok: f => (f.ventes || 0) > 0 },
  OBJ_P(100, '100'), OBJ_C(3, 'trois'), OBJ_T(100, '100'), OBJ_E(10000, '10 000'), OBJ_N(3),
  { id: 'leg', court: 'Légumineuse', txt: 'Récolter une légumineuse', ok: f => Object.keys(f.stats.parCulture).some(id => CULTURE[id].leg) },
  OBJ_F(3, 'trois'), OBJ_T(500, '500'), OBJ_N(5), OBJ_P(500, '500'),
  { id: 'record', court: 'Record', txt: 'Dépasser le rendement moyen français sur une culture', ok: f => Object.entries(f.stats.parCulture).some(([id, p]) => p.dernier >= CULTURE[id].rdt) },
  OBJ_E(50000, '50 000'),
  { id: 'mo', court: 'MO + 0,5', txt: 'Gagner un demi-point de matière organique sur une parcelle', ok: f => meilleureParcelle(f, t => t.mo - t.mo0) >= 0.5 },
  OBJ_A(5, 'cinq'), OBJ_C(6, 'six'), OBJ_T(1000, '1 000'), OBJ_P(1000, '1 000'), OBJ_N(8), OBJ_E(100000, '100 000'), OBJ_F(5, 'cinq'),
  { id: 'vers', court: '60 vers', txt: 'Porter une parcelle à 60 vers de terre sur 100', ok: f => meilleureParcelle(f, t => t.vdt) >= 60 },
  OBJ_T(2500, '2 500'), OBJ_A(10, 'dix'), OBJ_N(10), OBJ_P(2500, '2 500'), OBJ_C(10, 'dix'), OBJ_E(250000, '250 000'), OBJ_T(5000, '5 000'),
  OBJ_A(15, 'quinze'), OBJ_N(13), OBJ_P(5000, '5 000'), OBJ_E(500000, '500 000'), OBJ_F(7, 'sept'), OBJ_T(10000, '10 000'), OBJ_A(20, 'vingt'), OBJ_N(16), OBJ_P(10000, '10 000'), OBJ_E(1000000, '1 million de'),
];
let S = null;
const F = () => S.fermes[S.active];
const pleine = f => Object.keys(f.parcelles).length >= planDe(f).unites.filter(d => d.n).length;

// ---------- Outils ----------
const nf = (n, d = 0) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const euros = n => nf(Math.round(n)) + ' €';
const masse = kg => kg >= 1e6 ? nf(kg / 1e6, 1) + ' kt' : kg >= 1000 ? nf(kg / 1000, kg >= 1e4 ? 0 : 1) + ' t' : nf(kg) + ' kg';
const energie = k => k >= 1e9 ? nf(k / 1e9, 1) + ' Gkcal' : k >= 1e6 ? nf(k / 1e6, k >= 1e7 ? 0 : 1) + ' Mkcal' : nf(k) + ' kcal';
const personnesAn = kcal => kcal / (BESOIN_KCAL * 365);
const cle = (x, y) => x + ',' + y;
const region = f => REGIONS.find(r => r.id === f.region);
const lieu = f => LIEUX[f.lieu];
// Le lieu d'une graine dans une région : fabriqué une fois, rangé avec les autres lieux
function lieuDe(region, graine) { const L = Carte.generer(graine, region); LIEUX[L.id] = L; return L.id; }
const majuscule = s => s.replace(/^./, m => m.toUpperCase());
// « de pommes de terre », « d'orge » : la culture après une quantité
const PLURIEL = { pdt: 'pommes de terre', pois: 'petits pois', haricot: 'haricots secs', lentille: 'lentilles', poischiche: 'pois chiches', feverole: 'féveroles', haricotvert: 'haricots verts', betsucre: 'betteraves sucrières', betterave: 'betteraves rouges', topinambour: 'topinambours', carotte: 'carottes', panais: 'panais', radis: 'radis', navet: 'navets', oignon: 'oignons', echalote: 'échalotes', tournesol: 'tournesol' };
const deCulture = c => { const n = PLURIEL[c.id] || c.nom.toLowerCase(); return (/^[aeiouyàâéèêh]/.test(n) && !/^haricot/.test(n) ? 'd’' : 'de ') + n; };
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

// ---------- Parcelles : les champs de la carte (ou des lots de planches) ----------
const planDe = f => LIEUX[f.lieu].champs;
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
const surfaceUnite = (f, u) => planDe(f).unites[u].n * CASE_HA;
// Le mode d'une parcelle : celui de ses cases, toutes changées ensemble
const modeDe = (f, u) => { const [x, y] = casesDe(planDe(f), u)[0]; return f.cases[cle(x, y)]?.mode || 'gc'; };
// Chaque champ voisin porte un objectif, le plus proche de l'exploitation le premier (attribués une fois pour toutes)
function parcellesAObjectif(f) {
  if (f.parcellesObjectif) return f.parcellesObjectif;
  const pl = planDe(f), own = Object.keys(f.cases).map(k => k.split(',').map(Number));
  const dist = u => Math.min(...casesDe(pl, u).map(([x, y]) => Math.min(...own.map(([a, b]) => Math.hypot(x - a, y - b)))));
  const cand = pl.unites.map((_, u) => u).filter(u => !f.parcelles[u]).map(u => [dist(u), u]).sort((a, b) => a[0] - b[0]).map(([, u]) => u), out = {};
  // Les premiers objectifs pour tout le monde (ils apprennent le jeu), puis la suite répartie jusqu'au dernier : une petite carte se finit aussi par les grands objectifs
  const N = OBJ_PARCELLES.length, d = OBJ_PREMIERS, reste = cand.length - d;
  cand.forEach((u, i) => { const k = i < d || reste <= 0 ? i : reste === 1 ? N - 1 : d + Math.round((i - d) * (N - 1 - d) / (reste - 1)); if (OBJ_PARCELLES[k]) out[u] = OBJ_PARCELLES[k].id; });
  return (f.parcellesObjectif = out);
}
// Les trois objectifs visibles : les premiers de la liste qui restent à valider
function objectifsActifs(f) {
  const po = Object.values(parcellesAObjectif(f));
  return OBJ_PARCELLES.filter(o => po.includes(o.id) && !f.objectifs[o.id]).slice(0, 3);
}
// L'objectif d'un champ voisin, seulement s'il est parmi les trois visibles
const objectifVisible = (f, u) => objectifsActifs(f).find(o => o.id === parcellesAObjectif(f)[u]) || null;
function ajouterParcelle(f, u) {
  f.parcelles[u] = Object.keys(f.parcelles).length + 1;   // son numéro : l'ordre d'entrée dans l'exploitation
  for (const [x, y] of casesDe(planDe(f), u)) f.cases[cle(x, y)] = nouvelleCase(f);
}
// Les champs les plus proches de la ferme, jusqu'à la surface de départ
function champsDeDepart(f) {
  const pl = planDe(f), [fx, fy] = pl.ferme, but = 12;
  const dist = pl.unites.map((_, u) => Math.min(...casesDe(pl, u).map(([x, y]) => Math.hypot(x - fx - 1.5, y - fy - 1.5))));
  const herbe = u => Object.values(pl.unites[u].rpg).every(c => RPG_HERBE.includes(c));
  const ordre = dist.map((d, u) => [d, u]).filter(([, u]) => !herbe(u)).sort((a, b) => a[0] - b[0]);
  const pris = []; let surf = 0;
  for (const [, u] of ordre) {
    if (surf >= but) break;
    const s = surfaceUnite(f, u);
    if (surf > 0 && surf + s > but * 1.5) continue;     // un trop grand champ attend : on cherche plus petit un peu plus loin
    pris.push(u); surf += s;
  }
  return pris;
}

// Culture d'un champ voisin : sa rotation, une culture par an
const RPG_CULTURE = { BTH: 'ble', BTP: 'ble', BDH: 'bledur', BDP: 'bledur', EPE: 'epeautre', ORH: 'escourgeon', ORP: 'orge', AVH: 'avoine', AVP: 'avoine',
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
function creerFerme(lieuId) {
  const L = LIEUX[lieuId];
  const f = nouvelleFerme(L.climat);
  Object.assign(f, { lieu: lieuId, graine: L.graine, histo: [], neigeSol: 0, climatAn: {}, sec: 0, lots: {}, objectifs: {}, ventes: 0 });
  S.fermes.push(f); S.active = S.fermes.length - 1;
  for (const u of champsDeDepart(f)) ajouterParcelle(f, u);
  parcellesAObjectif(f);
  S.argent += Object.keys(f.cases).length * CASE_HA * 900;
  return f;
}
const surfaceTexte = ha => ha >= 1 ? nf(ha, ha < 10 ? 1 : 0) + ' ha' : nf(ha * 10000) + ' m²';
function sauver() { if (!S) return; try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } }
function charger() {
  try {
    for (const k of ['squid-ferme-3', 'squid-ferme-4', 'squid-ferme-5', 'squid-ferme-6', 'squid-ferme-7']) localStorage.removeItem(k);   // parties des clés précédentes : on repart de zéro
    const t = localStorage.getItem(CLE);
    if (t) {
      const s = JSON.parse(t);
      if (s.v === 7 && s.fermes?.length && s.fermes.every(f => f.graine)) {
        for (const f of s.fermes) { f.lieu = lieuDe(f.region, f.graine); Carte.rejouerDecoupe(LIEUX[f.lieu].champs, f.decoupe); }
        // Irrigation et engrais se décident maintenant champ par champ ; les parcelles reçoivent leur numéro
        for (const f of s.fermes) { let n = 0; for (const u in f.parcelles) if (f.parcelles[u] === true) f.parcelles[u] = ++n; f.irrigation = false; f.ferti = 'moderee'; delete f.mode; for (const k in f.cases) { const t = f.cases[k]; t.mode ??= 'gc'; t.modeDepuis ??= 0; t.modeAvant ??= null; } }
        S = s; Meca.completer(S); return true;
      }
    }
  } catch (e) { /* partie neuve */ }
  return false;
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
    const murAvant = active && Object.values(f.cases).some(c => creneaux(c).some(s => s.cult && s.p >= 1));
    const ev = journeeFerme(f, S.jour, m);
    if (active && ev.finies.size) toast(`${majuscule(nom(ev.finies))} : la plantation s’épuise, le champ est libre.`);
    if (active && ev.murs.size) {
      // le temps ralentit quand une récolte arrive, pour ne pas la manquer
      if (!murAvant && S.vitesse > 3) { S.vitesse = 1; toast(`${majuscule(nom(ev.murs))} : c’est mûr, le temps ralentit.`); }
      if (S.guide === 2) S.guide = 3;
    }
    // Récolte automatique, champ par champ, avant que la culture ne se perde
    const pl = planDe(f), aRecolter = new Map();
    for (const k in f.cases) {
      const t = f.cases[k];
      if (!creneaux(t).some(s => s.cult && s.p >= 1 && s.mur >= 20)) continue;
      const [x, y] = k.split(',').map(Number), u = pl.unite[y * pl.w + x];
      if (!aRecolter.has(u)) aRecolter.set(u, []);
      aRecolter.get(u).push([x, y]);
    }
    let n = 0;
    for (const [u, cases] of aRecolter) recolterChamp(f, u, cases, n++ * 300);
    // Sécheresse visible : réserve moyenne du sol
    const sol = etatSol(f); f.sec = d.mois >= 5 && d.mois <= 10 ? clamp((0.42 - sol.r / sol.ru) / 0.3, 0, 1) : 0;
  });
  Meca.unJour();
  if (d.an !== avant.an) {
    for (const f of S.fermes) { const s = etatSol(f); f.solAns.push({ an: avant.an, mo: +s.mo.toFixed(3), ru: Math.round(s.ru), vdt: Math.round(s.vdt) }); }
    Meca.finAnnee(avant.an);
    sauver();
  }
  if (d.mois !== avant.mois) ongletSale = true;
}

// ---------- Actions ----------
function machinePour(f, c, type) {
  if (type === 'semis') return 'semoir';
  if (c.machine) return c.machine;
  return ['Céréales', 'Oléagineux'].includes(c.cat) || (c.leg && c.kcal > 300) ? 'moissonneuse' : 'arracheuse';
}
function messageVerrou(modeId, id) {
  const i = ordreMode(modeId).indexOf(id);
  return i < 0 ? `${CULTURE[id].nom} ne se cultive pas dans ce mode.` : `${CULTURE[id].nom} : au niveau ${Math.max(2, Math.ceil((i - 4) / 2) + 1)}. Vendez vos récoltes pour gagner de l’expérience.`;
}
// La semence d'une parcelle : celle choisie si son mode la permet, sinon une culture ouverte de ce mode
function semencePour(f, u) {
  const dispo = culturesDebloquees(modeDe(f, u)), mois = dateDe(S.jour).mois;
  return dispo.includes(outil.id) ? outil.id : dispo.find(id => CULTURE[id].semis.includes(mois)) || dispo[0];
}
// Cultures associées : la seconde est choisie dans l'onglet Semences, sinon la première ouverte d'une autre famille
function secondeDe(f, u, a) {
  const dispo = culturesDebloquees(modeDe(f, u));
  return outil.b && outil.b !== a && dispo.includes(outil.b) ? outil.b : dispo.find(id => id !== a && CULTURE[id].famille !== CULTURE[a].famille) || dispo.find(id => id !== a);
}
const casesParcelle = (f, u) => casesDe(planDe(f), u).map(([x, y]) => f.cases[cle(x, y)]).filter(Boolean);
// Ce qu'il reste à semer sur la parcelle : [[culture, créneau], …]
function aSemer(f, u) {
  const cs = casesParcelle(f, u), a = semencePour(f, u);
  if (!MODES[modeDe(f, u)].assoc) return cs.some(t => !t.cult) ? [[a, 0]] : [];
  const enPlace = new Set(cs.flatMap(t => creneaux(t).map(s => s.cult)).filter(Boolean)), libres = [a, secondeDe(f, u, a)].filter(id => id && !enPlace.has(id)), L = [];
  if (cs.some(t => !t.cult) && libres.length) L.push([libres.shift(), 0]);
  if (cs.some(t => !t.b?.cult) && libres.length) L.push([libres.shift(), 1]);
  return L;
}
// Un clic sème tout le champ : en intensive la charrue passe d'abord, puis le tracteur et son semoir, rang par rang
function semerParcelle(f, u) {
  const pl = planDe(f), L = aSemer(f, u), mois = dateDe(S.jour).mois, mode = MODES[modeDe(f, u)];
  if (!L.length) return false;
  const t0 = casesParcelle(f, u)[0], pb = ([id]) => peutSemer(t0, CULTURE[id], mois, f.meteo), semables = L.filter(x => !pb(x));
  if (!semables.length) { toast(pb(L[0])); return false; }
  const semees = new Map();
  for (const [id, n] of semables) {
    const c = CULTURE[id], vie = vieTiree(c), cout = coutSemis(mode, c) * CASE_HA;   // une plantation meurt d'un seul bloc, pas case par case
    for (const [x, y] of casesDe(pl, u)) {
      const t = f.cases[cle(x, y)];
      if ((n ? t.b?.cult : t.cult) || S.argent < cout) continue;
      semer(f, t, c, vie, n); semees.set(y * pl.w + x, [x, y]);
    }
  }
  if (!semees.size) return false;
  if (semables.length < L.length) toast(`${pb(L.find(x => pb(x)))} À semer le moment venu.`);
  if (f === F()) {
    const cs = [...semees.values()], lab = mode.labour ? Rendu.animerChamp(cs, 'labour', 'charrue', null, 0, { sansVoile: true }) : null;
    Rendu.animerChamp(cs, 'semis', machinePour(f, CULTURE[semables[0][0]], 'semis'), null, 0, { apres: lab?.passage, slots: semables.map(x => x[1]) });
  }
  if (S.guide < 2) S.guide = 2;
  return true;
}
// Glisser sème case par case
function semerCase(f, k, id, bavard, tx, ty) {
  const t = f.cases[k], c = CULTURE[id], n = !t.cult ? 0 : MODES[t.mode].assoc && !t.b?.cult && t.cult !== id ? 1 : -1;
  if (n < 0) return false;
  if (!estDebloquee(t.mode, id)) { if (bavard) toast(messageVerrou(t.mode, id)); return false; }
  const pb = peutSemer(t, c, dateDe(S.jour).mois, f.meteo);
  if (pb) { if (bavard) toast(pb); return false; }
  semer(f, t, c, undefined, n);
  if (f === F()) { Rendu.animerChamp([[tx, ty]], 'semis', null, null, 0, { slots: [n] }); Rendu.graines(tx, ty); }
  if (S.guide < 2) S.guide = 2;
  return true;
}
// Récolte d'un champ : la machine passe, la récolte rejoint le stock de la ferme à son arrivée
function recolterChamp(f, u, seulement, retard = 0) {
  const pl = planDe(f), cases = (seulement || casesDe(pl, u)).filter(([x, y]) => { const c = f.cases[cle(x, y)]; return c && creneaux(c).some(s => s.cult && s.p >= 1); });
  if (!cases.length) return 0;
  // au-delà de huit engins en attente (coupes en série à ×30), la récolte se fait sans passage de machine : pas de file sans fin
  const visible = f === F() && !document.hidden && install.hidden && Rendu.passages.filter(p => p.phase === 'attente').length < 8;
  const avant = new Map(), recs = [], groupes = new Map();
  let finie = null;
  for (const [x, y] of cases) {
    const k = cle(x, y), t = f.cases[k], av = { v: (hasard(x, y, 1) * 3) | 0, kg: 0 };
    creneaux(t).forEach((s, n) => {
      if (!(s.cult && s.p >= 1)) return;
      const info = { c: CULTURE[s.cult], p: s.p, pourri: s.mur > 12 };
      if (n) av.b = info; else Object.assign(av, info);
      const r = recolter(f, t, S.jour, s);
      if (r.finie && !finie) finie = r.c;
      av.kg += r.kg;
      recs.push({ x, y, r });
      const gr = groupes.get(r.c.id) || { c: r.c, kg: 0, kcal: 0, ha: 0, n: 0 };
      gr.kg += r.kg; gr.kcal += r.kcal; gr.ha += r.ha; gr.n++; groupes.set(r.c.id, gr);
    });
    avant.set(k, av);
  }
  const an = dateDe(S.jour).an, rec = ((f.stats.recAn ??= {})[an] ??= {}), caseHa = CASE_HA;
  let kgTot = 0;
  for (const gr of groupes.values()) {
    const q = rec[gr.c.id] ??= { kg: 0, kcal: 0, ha: 0 };
    q.kg += gr.kg; q.kcal += gr.kcal; q.ha += gr.n * caseHa;
    Meca.noterRecolte(gr.c, gr.ha / gr.n); Meca.ajouterLot(f, gr.c, gr.kg, visible);
    kgTot += gr.kg;
  }
  recolteChangee();
  if (finie && f === F()) toast(`${finie.nom} : dernière récolte, le champ est libre.`);
  if (!visible) return recs.length;
  const machine = machinePour(f, recs[0].r.c, 'recolte'), c = recs[0].r.c;
  if (Rendu.transporte(machine)) {
    // le grain part dans la trémie puis dans la benne : les tonnes ne comptent qu'à la livraison à la ferme
    const kcalTot = recs.reduce((s, o) => s + o.r.kcal, 0), kcalKg = kgTot ? kcalTot / kgTot : 0;
    enAttente(c.id, kgTot, kcalTot);
    const livrer = kg => {
      if (kg >= 50) Anim.texte(() => { const p = Rendu.centreFerme(); return { x: p.x, y: p.y - 54 }; }, `+${masse(kg)} ${deCulture(c)}`, '#ffe08a', 0, Anim.spriteCaisse(c));
      enAttente(c.id, -kg, -kg * kcalKg); Meca.arrivee(f, c); recolteChangee();
    };
    Rendu.animerChamp(cases, 'recolte', machine, avant, retard, { livrer });
    return recs.length;
  }
  // à la main (planches) : la récolte est à la grange quand le dernier geste est fini
  const finTout = Rendu.animerChamp(cases, 'recolte', machine, avant, retard).at(-1).fin;
  for (const gr of groupes.values()) enAttente(gr.c.id, gr.kg, gr.kcal);
  Anim.texte(centreDe(cases), `+${masse(kgTot)} ${deCulture(c)}`, '#ffe08a', finTout, Anim.spriteCaisse(c));
  setTimeout(() => { for (const gr of groupes.values()) { enAttente(gr.c.id, -gr.kg, -gr.kcal); Meca.arrivee(f, gr.c); } recolteChangee(); }, finTout);
  return recs.length;
}
function recolterTout() {
  const f = F(), pl = planDe(f), unites = new Set();
  for (const k in f.cases) { const t = f.cases[k]; if (creneaux(t).some(s => s.cult && s.p >= 1)) { const [x, y] = k.split(',').map(Number); unites.add(pl.unite[y * pl.w + x]); } }
  if (!unites.size) { toast('Rien n’est mûr pour l’instant.'); return; }
  let i = 0;
  for (const u of unites) recolterChamp(f, u, null, i++ * 280);
  if (S.guide === 3) S.guide = 4;
  apresAction(true);
}
function arracher(f, t) { if (!creneaux(t).some(s => s.cult)) return false; Object.assign(t, { cult: null, p: 0, dj: 0, mur: 0, inst: null, coupe: 0, dort: false, fauche: null }); if (t.b) Object.assign(t.b, { cult: null, p: 0, dj: 0, mur: 0 }); return true; }

// ---------- Champ : souris et doigt ----------
const ecran = document.getElementById('ecran');
Rendu.init(ecran);
let outil = { id: 'ble' }, selection = null;   // outil : la semence choisie dans l'onglet Semences
const attente = { kg: 0, kcal: 0, parC: {} };
function selectionner(s) { selection = s; Rendu.selection = s; majVolante(); if (onglet === 'semences') ongletSale = true; }

let curseur = '';
function majCurseur(tx, ty) {
  const f = F(), p = parcelleDe(tx, ty);
  let c = decoupe ? 'crosshair' : 'default';
  if (decoupe) { if (c !== curseur || ecran.style.cursor !== c) { curseur = c; ecran.style.cursor = c; } return; }
  if (surLaFerme(tx, ty)) c = 'pointer';
  else if (p && f.parcelles[p.u]) c = 'pointer';
  if (c === 'default') c = 'grab';
  if (c !== curseur || ecran.style.cursor !== c) { curseur = c; ecran.style.cursor = c; }
}

let peinture = false, derniere = null, depart = null;
const surLaFerme = (tx, ty) => typeCase(planDe(F()), tx, ty) === 'm';
// Option + glisser : sème la semence choisie
function appliquer(tx, ty, premier) {
  const f = F(), p = parcelleDe(tx, ty);
  if (surLaFerme(tx, ty) || !p || !f.parcelles[p.u]) return false;
  const fait = premier ? semerParcelle(f, p.u) : semerCase(f, cle(tx, ty), semencePour(f, p.u), premier, tx, ty);
  if (fait) apresAction(false);
  return fait;
}
// Un clic ouvre la fenêtre du champ ; un clic sur la ferme ouvre la récolte
function cliquerCarte(tx, ty) {
  if (decoupe) { cliquerDecoupe(tx, ty); return; }
  if (surLaFerme(tx, ty)) { ouvrirOnglet('recolte'); return; }
  const p = parcelleDe(tx, ty);
  if (p) selectionner({ type: 'parcelle', u: p.u });
}
// Le plateau est en 3D (rendu.js) : glisser fait tourner la vue, un clic sans glisser désigne le champ visé
// (lancer de rayon jusqu'au sol), Option + glisser sème case par case.
Rendu.quandClic = s => { Rendu.onde(s.px, s.py); cliquerCarte(s.tx, s.ty); };
Rendu.quandPeint = (s, e, premier) => {
  if (decoupe) { peindreDivision(s, premier); return; }
  if (premier) { Rendu.onde(s.px, s.py); peinture = true; derniere = cle(s.tx, s.ty); appliquer(s.tx, s.ty, true); return; }
  if (!peinture || cle(s.tx, s.ty) === derniere) return;
  const [px, py] = derniere.split(',').map(Number), n = Math.max(Math.abs(s.tx - px), Math.abs(s.ty - py));
  for (let i = 1; i <= n; i++) appliquer(Math.round(px + (s.tx - px) * i / n), Math.round(py + (s.ty - py) * i / n), false);
  derniere = cle(s.tx, s.ty);
};
Rendu.quandSurvol = (s, e) => { Rendu.survol = { tx: s.tx, ty: s.ty }; Rendu.pointeur = { px: s.px, py: s.py }; majBulle(e, s.tx, s.ty); majCurseur(s.tx, s.ty); };
Rendu.quandSort = () => { Rendu.survol = null; Rendu.pointeur = null; bulle.hidden = true; };
addEventListener('pointerup', () => { peinture = false; });

// ---------- Bulle et panneau d'information ----------
const bulle = document.getElementById('bulle');
// q/ha et Mkcal/ha (rdt en t/ha, kcal pour 100 g : Mkcal/ha = t/ha × kcal / 100)
const chiffres = (ha, c) => `${nf(ha * 10, 0)} q/ha${c.kcal ? ` · ${nf(ha * c.kcal / 100, 1)} Mkcal/ha` : ''}`;
function blocSol(f, t) {
  const ru = ruMax(f, t), barre = (v, max, c) => `<i><b style="width:${Math.round(clamp(v / max, 0, 1) * 100)}%;background:${c}"></b></i>`;
  return `<div class="sol"><span>Eau du sol</span>${barre(t.r, ru, '#4f9fdc')}<span>${nf(t.r)} / ${nf(ru)} mm</span>`
    + `<span>Azote minéral</span>${barre(t.nmin, 120, '#6fb85a')}<span>${nf(t.nmin)} kg N/ha</span>`
    + `<span>Vie du sol</span>${barre(t.vdt, 100, '#c08a52')}<span>vers ${nf(t.vdt)}/100 · MO ${nf(t.mo, 1)} %</span></div>`;
}
const nomFamille = fam => majuscule(fam) + 's';                     // « brassicacée » → « Brassicacées »
const textePrecedent = t => `Précédent : ${nomFamille(t.fam)}${t.prec ? ` (${CULTURE[t.prec].nom.toLowerCase()})` : ''}`;
function descriptionCase(f, t) {
  const s = t.cult ? t : t.b?.cult ? t.b : t;
  if (!s.cult) return `<b>${MODES[t.mode].couvert ? 'Couvert végétal' : 'Terre nue'}</b>${t.fam ? `<br>${textePrecedent(t)}` : ''}${blocSol(f, t)}`;
  const c = CULTURE[s.cult], r = rendement(f, t, S.jour, s);
  const etat = s.dort ? 'En repos jusqu’au 1er février' : s.p >= 1 ? (s.mur > 12 ? '<span class="mauvais">Trop mûr, se perd</span>' : '<span class="bon">Mûr</span>')
    : `Développement ${nf(s.p * 100)} % (${nf(s.dj)} / ${nf(djCible(c, s))} °C·j)`;
  if (s.p < 0.15) return `<b>${c.nom}</b><br>${etat}<br>Référence ${chiffres(c.rdt, c)}${blocSol(f, t)}`;
  let html = `<b>${c.nom}</b><br>${etat}<br>Prévu ≈ <b>${nf(r.ha * 10, 0)} q/ha</b>${c.kcal ? ` · ${nf(r.ha * c.kcal / 100, 1)} Mkcal/ha` : ''}`;
  const freins = [['eau', r.eau], ['azote', r.azote], ['gel', r.gel], ['chaleur', r.chaleur], ['ombre des arbres', r.ombre], ['transition', r.trans]].filter(([, v]) => v < 0.97);
  if (freins.length) html += `<br><span class="mauvais">Pertes : ${freins.map(([n, v]) => `${n} −${nf((1 - v) * 100)} %`).join(', ')}</span>`;
  if (s.rot < 1) html += '<br><span class="mauvais">Même famille qu’avant : −12 %</span>';
  if (s.rot > 1) html += '<br><span class="bon">Après une légumineuse : +5 %</span>';
  return html + blocSol(f, t);
}
const NOM_RPG = { prairie: 'prairie', friche: 'friche ou bande enherbée' };
function ligneVoisin(f, u) {
  const v = voisin(f, u, S.jour);
  const quoi = v.type === 'culture' ? v.c.nom.toLowerCase() : NOM_RPG[v.type];
  const quand = lieu(f).genere ? '' : v.reel ? `déclaré à la PAC en ${v.an}` : v.an ? `assolement de ${v.an} à la PAC` : '';
  return `${majuscule(quoi)}${quand ? ` <span class="discret">(${quand})</span>` : ''}${v.type === 'culture' ? `<br>${chiffres(v.c.rdt, v.c)} <span class="discret">(moyenne)</span>` : ''}`;
}
const descriptionVoisin = (f, u) => `<b>Champ voisin · ${surfaceTexte(surfaceUnite(f, u))}</b><br>${ligneVoisin(f, u)}`;
function majBulle(e, tx, ty) {
  if (decoupe) { bulle.hidden = true; return; }
  // la bulle ne nomme que les cultures et les bêtes : rien sur la ferme, les routes, les chemins, les bois ou les haies
  const f = F(), p = parcelleDe(tx, ty), bete = Rendu.animalSous(e);
  let html = '';
  if (window.SF3D && SF3D.modeCommentaire) { const h = Rendu.objetSous(e.clientX, e.clientY); html = h ? `<b>${Rendu.nommer(h).libelle}</b>` : ''; }
  else if (bete) html = `<b>${bete[0]}</b><br>${bete[1]}`;
  else if (surLaFerme(tx, ty)) html = '';
  else if (p && f.parcelles[p.u]) html = descriptionCase(f, f.cases[cle(tx, ty)]);
  else if (p) { const o = objectifVisible(f, p.u); html = `${descriptionVoisin(f, p.u)}${o ? `<br>À débloquer : ${o.court}` : ''}`; }
  if (!html) { bulle.hidden = true; return; }
  bulle.innerHTML = html; bulle.hidden = false;
  bulle.style.left = Math.min(e.clientX + 16, innerWidth - bulle.offsetWidth - 8) + 'px';
  bulle.style.top = Math.min(e.clientY + 16, innerHeight - bulle.offsetHeight - 8) + 'px';
}

// ---------- Fiche d'une parcelle : fenêtre volante et onglet Parcelles ----------
const volante = document.getElementById('volante');
// Un champ résumé : moyennes de ses cases, culture majoritaire
function etatParcelle(f, u, n = 0) {
  const cases = casesParcelle(f, u), sl = t => n ? t.b : t, cr = cases.map(sl).filter(Boolean);
  const moy = (L, g) => L.reduce((s, t) => s + g(t), 0) / (L.length || 1), compte = {};
  for (const s of cr) if (s.cult) compte[s.cult] = (compte[s.cult] || 0) + 1;
  const id = Object.keys(compte).sort((a, b) => compte[b] - compte[a])[0], c = id ? CULTURE[id] : null, en = cr.filter(s => s.cult === id), sols = cases.filter(t => sl(t)?.cult === id);
  const prec = cases.filter(t => t.fam).sort((a, b) => cases.filter(t => t.prec === b.prec).length - cases.filter(t => t.prec === a.prec).length)[0] || null;
  return { cases, c, prec, ha: surfaceUnite(f, u), num: f.parcelles[u], but: c ? djCible(c, en[0]) : 0, dort: en.some(s => s.dort), inst: en[0]?.inst || null, ru: moy(cases, t => ruMax(f, t)), eau: moy(cases, t => t.r), azote: moy(cases, t => t.nmin), vers: moy(cases, t => t.vdt), mo: moy(cases, t => t.mo),
    dj: moy(en, s => s.dj), vern: en.every(s => s.vern), pretes: cr.filter(s => s.cult && s.p >= 1).length,
    stress: moy(sols, t => { const m = 0.5 * ruMax(f, t); return t.r >= m ? 0 : 100 * (1 - clamp(t.r / m, 0, 1)); }) };   // le Ks de FAO 56 du moteur (agronomie.js)
}
function pastille(e) {
  if (!e.c) return { cls: 'nu', txt: 'Terre nue' };
  if (e.pretes) return { cls: 'pret', txt: 'Prête' };
  if (e.stress >= 50) return { cls: 'mal', txt: 'Sécheresse' };
  if (e.stress >= 20) return { cls: 'moyen', txt: 'Stress léger' };
  return { cls: 'bien', txt: 'Sans stress' };
}
// Date de maturité : on rejoue les degrés-jours restants (même calcul que journeeFerme, vernalisation comprise) sur la météo
// des dix dernières années, à partir du même jour du calendrier. Avant 1969, on complète avec les années suivantes, faute de passé.
const ANS_PREVISION = 10;
function joursDeMaturite(f, c, dj0, vern0, jour = S.jour, but = c.dj) {
  const { an, doy } = dateDe(jour), ans = [], sorties = [];
  for (let y = an - 1; y >= 1959 && ans.length < ANS_PREVISION; y--) ans.push(y);
  for (let y = an + 1; ans.length < ANS_PREVISION; y++) ans.push(y);
  for (const y of ans) {
    const j0 = indexJour(y, doy);
    let dj = dj0, vern = vern0;
    for (let d = 1; d <= 430; d++) {
      const m = Climat.jour(f.region, j0 + d), mois = dateDe(j0 + d).mois;
      dj += Math.max(0, Math.min((m.tmin + m.tmax) / 2, 30) - c.tb);
      if (c.hiver) { if (mois >= 2 && mois <= 6) vern = true; if (!vern) dj = Math.min(dj, c.dj * 0.5); }
      if (dj >= but) { sorties.push(jour + d); break; }
    }
  }
  return sorties.sort((a, b) => a - b);
}
// Huit années sur dix : on écarte la plus précoce et la plus tardive
function intervalleRecolte(L) {
  if (L.length < ANS_PREVISION * 0.6) return null;
  const iv = [L[Math.round(0.15 * (L.length - 1))], L[Math.round(0.85 * (L.length - 1))]];
  return iv[1] - iv[0] > 45 ? null : iv;       // semis tardif : selon l'année, la maturité passe de l'automne au printemps
}
function textePrevision(iv) {
  if (!iv) return 'Récolte incertaine cette année';
  const J = j => { const d = dateDe(j); return { txt: d.jour === 1 ? '1er' : String(d.jour), mois: NOMS_MOIS[d.mois - 1] }; }, a = J(iv[0]), b = J(iv[1]);
  if (iv[0] === iv[1]) return `Récolte prévue vers le ${a.txt} ${a.mois}`;
  return `Récolte prévue entre le ${a.txt}${a.mois === b.mois ? '' : ' ' + a.mois} et le ${b.txt} ${b.mois}`;
}
const mesure = (nom, part, val, c) => `<div class="mesure"><span>${nom}</span><i class="barre" style="--c:${c}"><i style="width:${Math.round(clamp(part, 0, 100))}%"></i></i><small>${val}</small></div>`;
// Découpage des parcelles : boutons écrits dans la fenêtre, icônes en haut de la fiche de l'onglet
const decoupable = f => true;
// Ce qui pousse sur la parcelle, les deux cultures en associées : deux parcelles ne fusionnent que si cela coïncide
const cultureDe = (f, u) => { const n = {}; for (const t of casesParcelle(f, u)) { const c = creneaux(t).map(s => s.cult).filter(Boolean).sort().join('+'); if (c) n[c] = (n[c] || 0) + 1; } return Object.keys(n).sort((a, b) => n[b] - n[a])[0] || null; };
// Les parcelles qui touchent u, de même mode, nues comme elle ou portant la même culture
function voisinesFusion(f, u) {
  const pl = planDe(f), W = pl.w, ici = cultureDe(f, u), v = new Set();
  pl.unite.forEach((w, i) => { if (w !== u) return; for (const j of [i - 1, i + 1, i - W, i + W]) { const q = pl.unite[j]; if (q >= 0 && q !== u && f.parcelles[q] && Math.abs((j % W) - (i % W)) <= 1) v.add(q); } });
  return [...v].filter(q => cultureDe(f, q) === ici && modeDe(f, q) === modeDe(f, u));
}
const peutDiviser = (f, u) => surfaceUnite(f, u) > CASE_HA;
function boutonsDecoupe(f, u, volanteOuIcones) {
  if (!decoupable(f)) return '';
  const nf1 = voisinesFusion(f, u).length ? '' : ' disabled', div = peutDiviser(f, u) ? '' : ' disabled';
  if (volanteOuIcones === 'volante') return `<div class="actions decoupe-b"><button data-p="fusionner" data-u="${u}"${nf1}>Fusionner</button><button data-p="diviser" data-u="${u}"${div}>Diviser</button></div>`;
  return `<div class="icones"><button class="ic" data-p="fusionner" data-u="${u}"${nf1} title="Fusionner" aria-label="Fusionner"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M5.5 12h5M8 9l3 3-3 3M18.5 12h-5M16 9l-3 3 3 3"/></svg></button><button class="ic" data-p="diviser" data-u="${u}"${div} title="Diviser" aria-label="Diviser"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16" stroke-dasharray="2.6 2.4"/></svg></button></div>`;
}
// Menu du mode : onglet Parcelles seulement, sur une parcelle nue
let menuMode = null;
function blocMode(f, u) {
  const id = modeDe(f, u), nue = !casesParcelle(f, u).some(t => creneaux(t).some(s => s.cult)), ouvert = nue && menuMode === u;
  const ligne = m => { const c = MODES[m].conversion && m !== id ? ` · ${euros(MODES[m].conversion * surfaceUnite(f, u))}` : ''; return `<li><button data-p="mode" data-m="${m}" data-u="${u}" aria-pressed="${m === id}">${MODES[m].nom}${c}</button></li>`; };
  return `<div class="mode${ouvert ? ' ouvert' : ''}"><button data-p="menu" data-u="${u}" aria-expanded="${ouvert}"${nue ? '' : ' disabled title="Récoltez ou arrachez d’abord"'}><span>${MODES[id].nom}</span><i>▾</i></button>${ouvert ? `<ul>${MENU_MODES.map(ligne).join('')}</ul>` : ''}</div>`;
}
// Bilan de la culture en cours (sur une parcelle nue : de la dernière récoltée), moyenne des cases
function blocBilan(e, mode) {
  const encours = e.cases.some(t => creneaux(t).some(s => s.cult)), L = e.cases.map(t => (encours ? t.bilan : t.bilanPrec) || nouveauBilan());
  const m = k => L.reduce((a, b) => a + (b[k] || 0), 0) / L.length, signe = v => v > 0 ? '+' : v < 0 ? '−' : '';
  const mo = v => Math.abs(v) < 0.0005 ? '—' : `${signe(v)}${nf(Math.abs(v), 3)}`, az = v => Math.abs(v) < 0.5 ? '—' : `+${nf(v)}`;
  const lignes = [['Minéralisation', -m('minMO'), m('minN')], ['Compost', m('compostMO'), m('compostN')], ['Fumier', m('fumierMO'), m('fumierN')], ['Résidus de culture', m('resMO'), m('resN')]];
  if (m('couvMO') > 0) lignes.push([mode.paillage ? 'Paillage' : mode.couvert ? 'Couverts' : 'Rangs alternés', m('couvMO'), 0]);
  return `<h4>Bilan ${encours ? 'de la culture' : 'de la dernière culture'}</h4><table class="bilan-sol"><thead><tr><th></th><th>MO, point</th><th>Azote, kg/ha</th></tr></thead><tbody>${lignes.map(([n, a, b]) => `<tr><td>${n}</td><td>${mo(a)}</td><td>${az(b)}</td></tr>`).join('')}</tbody></table>`;
}
function corpsFiche(f, u, e, ou = 'onglet') {
  const mode = MODES[modeDe(f, u)], haut = ou === 'onglet' ? boutonsDecoupe(f, u, 'onglet') : '', bas = ou === 'volante' ? boutonsDecoupe(f, u, 'volante') : '';
  const sol = (e.prec ? `<p class="ligne2">${textePrecedent(e.prec)}</p>` : '') + '<h4>Sol</h4>' + mesure('Eau', e.eau / e.ru * 100, `${nf(e.eau)} / ${nf(e.ru)} mm`, 'var(--humide)') + mesure('Azote', e.azote / 1.2, `${nf(e.azote)} kg/ha`, 'var(--accent)')
    + mesure('Vers de terre', e.vers, `${nf(e.vers)} /100`, 'var(--or)') + mesure('Matière organique', e.mo * 25, `${nf(e.mo, 1)} %`, 'var(--sec)');
  const act = `<div class="actions"><button data-p="irriguer" data-u="${u}"${mode.irrigation && e.eau < e.ru - 1 ? '' : ' disabled'}>Irriguer · 25 mm</button><button data-p="apport" data-u="${u}"${mode.fertilisation.startsWith('minéral') ? '' : ' disabled'}>Apport · 40 kg N</button><button data-p="fumier" data-u="${u}">Fumier · 30 t/ha</button><button data-p="compost" data-u="${u}">Compost · 30 t/ha</button></div>`;
  const fin = ou === 'onglet' ? blocBilan(e, mode) + blocMode(f, u) : '';
  const L = aSemer(f, u), cout = mode.miseEnPlace ? ` · ${euros(L.reduce((a, [id]) => a + coutSemis(mode, CULTURE[id]), 0) * e.ha)}` : '';
  const semer = L.length ? `<button class="recolter" data-p="semer" data-u="${u}">Semer : ${L.map(([id]) => CULTURE[id].nom).join(' + ')}${cout}</button>` : '';
  const etats = [e, mode.assoc ? etatParcelle(f, u, 1) : null].filter(x => x?.c);
  if (!etats.length) return `<div class="fiche">${haut}${sol}${act}<div class="prevue">${semer}</div>${bas}${fin}</div>`;
  const plusieurs = etats.length > 1 || mode.assoc;
  const blocs = etats.map(x => `<h4>${x.c.nom}</h4>${mesure('Degrés-jours', x.dj / x.but * 100, `${nf(Math.min(x.dj, x.but))} / ${nf(x.but)} °C·j`, 'var(--accent)')}${mesure('Stress hydrique', x.stress, x.stress >= 50 ? 'fort' : x.stress >= 20 ? 'léger' : 'aucun', x.stress >= 50 ? 'var(--mauvais)' : x.stress >= 20 ? 'var(--sec)' : 'var(--bon)')}`).join('');
  const prev = etats.map(x => {
    const c = x.c, txt = c.vivace?.finHiver ? 'Récolte de février à avril, sur tiges sèches' : x.dort ? 'En repos jusqu’au 1er février' : textePrevision(intervalleRecolte(joursDeMaturite(f, c, x.dj, x.vern, S.jour, x.but)));
    const age = x.inst ? `<p>${x.inst.ans ? `Installée depuis ${x.inst.ans} an${x.inst.ans > 1 ? 's' : ''}` : 'Implantation'}${c.vivace.ans ? ` · vit ${c.vivace.ans[0]} à ${c.vivace.ans[1]} ans` : ''}</p>` : '';
    return age + (x.pretes ? '' : `<p>${plusieurs ? `${c.nom} : ` : ''}${txt}</p>`);
  }).join('');
  const pretes = etats.some(x => x.pretes);
  return `<div class="fiche">${haut}${sol}${blocs}
    ${act}<div class="prevue">${prev}${semer}<div class="fin-fiche"><button class="recolter" data-p="recolter" data-u="${u}"${pretes ? '' : ' disabled'}>Récolter</button><button class="arracher" data-p="arracher" data-u="${u}">Arracher</button></div></div>${bas}${fin}</div>`;
}
const enteteVolante = (titre, sous) => `<header><b>${titre}</b><span>${sous}</span><button class="fermer" data-fermer="1" aria-label="Fermer">×</button></header>`;
function ficheVoisin(f, u) {
  const o = objectifVisible(f, u), un = planDe(f).unites[u];
  const nomCode = code => { const c = RPG_CULTURE[code]; return c ? CULTURE[c].nom.toLowerCase() : RPG_HERBE.includes(code) ? 'prairie' : 'autre'; };
  const histo = un.rot ? (new Set(un.rot).size > 1 ? un.rot.map(nomCode).join(' → ') : '') : Object.entries(un.rpg).map(([an, code]) => `${an} ${nomCode(code)}`).join(' · ');
  return `<div class="fiche"><p>${ligneVoisin(f, u)}</p>${histo ? `<p class="ligne2">${un.rot ? 'Rotation du voisin' : 'Cultures déclarées'} : ${histo}</p>` : ''}
    ${o ? `<p class="ligne2">Il rejoint votre exploitation quand cet objectif est atteint : <b>${o.txt.toLowerCase()}</b>.</p>` : ''}</div>`;
}
function majVolante() {
  if (!selection || !S || decoupe) { volante.hidden = true; return; }
  const f = F(), u = selection.u, haut = volante.scrollTop;
  if (f.parcelles[u]) {
    const e = etatParcelle(f, u);
    volante.innerHTML = enteteVolante(`Parcelle ${e.num}`, `${e.c ? e.c.nom : 'Terre nue'} · ${surfaceTexte(e.ha)}`) + corpsFiche(f, u, e, 'volante');
  } else volante.innerHTML = enteteVolante('Champ voisin', surfaceTexte(surfaceUnite(f, u))) + ficheVoisin(f, u);
  volante.hidden = false; volante.scrollTop = haut;
}
// Doses par clic. Tarifs du moteur (agronomie.js) : engrais 1,2 €/kg N ; apports de 30 t/ha : voir APPORTS
function agir(quoi, u) {
  const f = F(), ha = surfaceUnite(f, u), cases = casesParcelle(f, u);
  const payer = eur => { if (S.argent < eur) { toast(`Il vous faut ${euros(eur)}.`); return false; } S.argent -= eur; return true; };
  if (quoi === 'irriguer') { for (const t of cases) t.r = Math.min(ruMax(f, t), t.r + 25); f.stats.eau += 250 * ha; }
  else if (quoi === 'apport') { if (!payer(48 * ha)) return; for (const t of cases) t.nmin += 40; }
  else if (quoi === 'fumier' || quoi === 'compost') { if (!payer(APPORTS[quoi].eur * ha)) return; for (const t of cases) apporter(t, quoi); }
  else if (quoi === 'semer') { if (!semerParcelle(f, u)) return; }
  else if (quoi === 'recolter') { if (!recolterChamp(f, u)) return; if (S.guide === 3) S.guide = 4; }
  else if (quoi === 'arracher') { for (const t of cases) arracher(f, t); Rendu.jourVu = -1; }
  apresAction(true);
}
// Changer de mode : sur parcelle nue ; la conversion en serre se paie à l'installation des tunnels
function changerMode(f, u, id) {
  const cases = casesParcelle(f, u), avant = modeDe(f, u), prix = MODES[id].conversion ? MODES[id].conversion * surfaceUnite(f, u) : 0;
  menuMode = null;
  if (id === avant || cases.some(t => creneaux(t).some(s => s.cult))) { majOnglet(); return; }
  if (S.argent < prix) { toast(`Il vous faut ${euros(prix)}.`); majOnglet(); return; }
  S.argent -= prix;
  for (const t of cases) { t.modeAvant = t.mode; t.mode = id; t.modeDepuis = S.jour; t.b = null; }
  Rendu.jourVu = -1; apresAction(true);
}
function commandeParcelle(ev) {
  const b = ev.target.closest('button'); if (!b || b.disabled) return false;
  if (b.dataset.fermer) { selectionner(null); return true; }
  if (b.dataset.p === 'fusionner' || b.dataset.p === 'diviser') { entrerDecoupe(b.dataset.p, +b.dataset.u); return true; }
  if (b.dataset.p === 'menu') { menuMode = menuMode === +b.dataset.u ? null : +b.dataset.u; majOnglet(); return true; }
  if (b.dataset.p === 'mode') { changerMode(F(), +b.dataset.u, b.dataset.m); return true; }
  if (b.dataset.p) { agir(b.dataset.p, +b.dataset.u); return true; }
  return false;
}
volante.addEventListener('click', commandeParcelle);

// ---------- Diviser, fusionner ----------
// Diviser : clic maintenu sur les carrés de la parcelle, puis Valider ; la nouvelle parcelle prend la haie percée.
// Fusionner : clic sur une parcelle voisine. Une parcelle sans accès possible est refusée (Carte.diviser, Carte.fusionner).
let decoupe = null;
const barreDecoupe = document.getElementById('decoupe'), texteDecoupe = document.getElementById('decoupe-t'), okDecoupe = document.getElementById('decoupe-ok');
function dunTenant(cases, W) {
  if (!cases.size) return true;
  const vu = new Set([cases.values().next().value]), pile = [...vu];
  while (pile.length) { const i = pile.pop(); for (const j of [i - 1, i + 1, i - W, i + W]) if (cases.has(j) && !vu.has(j) && Math.abs((j % W) - (i % W)) <= 1) { vu.add(j); pile.push(j); } }
  return vu.size === cases.size;
}
function peutOperer(f, us) {
  if (Rendu.enTravail(new Set(us.flatMap(u => casesDe(planDe(f), u).map(([x, y]) => y * planDe(f).w + x))))) { toast('Un engin travaille sur cette parcelle : attendez qu’il ait fini.'); return false; }
  return true;
}
function entrerDecoupe(type, u) {
  const f = F(), pl = planDe(f), W = pl.w;
  if (!decoupable(f) || !f.parcelles[u] || !peutOperer(f, [u])) return;
  if (type === 'fusionner') {
    const v = voisinesFusion(f, u); if (!v.length) return;
    decoupe = { type, u, voisines: new Set(v.flatMap(q => casesDe(pl, q).map(([x, y]) => y * W + x))), parcelles: new Set(v) };
  } else {
    if (!peutDiviser(f, u)) return;
    decoupe = { type, u, cases: new Set(casesDe(pl, u).map(([x, y]) => y * W + x)), sel: new Set(), ajoute: true, derniere: null };
  }
  Rendu.decoupe = decoupe; Rendu.peinture = type === 'diviser'; bulle.hidden = true;
  const cs = casesDe(pl, u), m = cs.reduce((a, c) => [a[0] + c[0] / cs.length, a[1] + c[1] / cs.length], [0, 0]);
  Rendu.regarder(Rendu.versMonde(m[0], m[1], 0), Math.min(Rendu.cam.zoom, 0.4));
  majVolante(); majBarreDecoupe();
}
function sortirDecoupe() { decoupe = null; Rendu.decoupe = null; Rendu.peinture = false; barreDecoupe.hidden = true; majVolante(); }
function majBarreDecoupe() {
  barreDecoupe.hidden = !decoupe; if (!decoupe) return;
  if (decoupe.type === 'fusionner') { texteDecoupe.textContent = 'Cliquez sur une parcelle voisine'; okDecoupe.hidden = true; return; }
  const f = F(), pl = planDe(f), { sel, cases, u } = decoupe, reste = new Set([...cases].filter(i => !sel.has(i)));
  let msg = '', ok = false;
  if (!sel.size) msg = 'Maintenez le clic sur les carrés à séparer';
  else if (!reste.size) msg = '<small>Il faut laisser au moins un carré</small>';
  else if (!dunTenant(sel, pl.w)) msg = '<small>Les carrés choisis doivent se toucher</small>';
  else if (!dunTenant(reste, pl.w)) msg = '<small>Le reste de la parcelle doit rester d’un seul tenant</small>';
  else if (Carte.diviser(pl, u, [...sel], true).erreur) msg = '<small>Une parcelle resterait sans accès</small>';
  else { msg = `${sel.size} carré${sel.size > 1 ? 's' : ''} · ${surfaceTexte(sel.size * CASE_HA)}`; ok = true; }
  texteDecoupe.innerHTML = msg; okDecoupe.hidden = false; okDecoupe.disabled = !ok;
}
function peindreDivision(s, premier) {
  const pl = planDe(F()), W = pl.w, i = s.ty * W + s.tx, dc = decoupe; if (dc.type !== 'diviser') return;
  if (premier) { dc.ajoute = !dc.sel.has(i); dc.derniere = null; }
  const de = dc.derniere ?? [s.tx, s.ty], n = Math.max(Math.abs(s.tx - de[0]), Math.abs(s.ty - de[1]), 1);
  for (let k = 0; k <= n; k++) { const j = Math.round(de[1] + (s.ty - de[1]) * k / n) * W + Math.round(de[0] + (s.tx - de[0]) * k / n); if (dc.cases.has(j)) { if (dc.ajoute) dc.sel.add(j); else dc.sel.delete(j); } }
  dc.derniere = [s.tx, s.ty]; majBarreDecoupe();
}
function cliquerDecoupe(tx, ty) {
  if (decoupe.type !== 'fusionner') return;
  const p = parcelleDe(tx, ty); if (!p || !decoupe.parcelles.has(p.u)) return;
  const f = F(), pl = planDe(f), a = decoupe.u, b = p.u; if (!peutOperer(f, [a, b])) return;
  // la parcelle de plus petit numéro reste, les autres numéros se resserrent
  const [g, q] = f.parcelles[a] < f.parcelles[b] ? [a, b] : [b, a], cQ = casesDe(pl, q).map(([x, y]) => y * pl.w + x);
  if (Carte.fusionner(pl, g, q).erreur) { toast('Fusion impossible : la parcelle n’aurait plus d’accès.'); return; }
  const num = f.parcelles[q]; delete f.parcelles[q];
  for (const k in f.parcelles) if (f.parcelles[k] > num) f.parcelles[k]--;
  noterDecoupe(f, pl, cQ, g); finDecoupe(f, g);
}
okDecoupe.addEventListener('click', () => {
  const f = F(), pl = planDe(f), { u, sel } = decoupe; if (!peutOperer(f, [u])) return;
  const r = Carte.diviser(pl, u, [...sel]);
  if (r.erreur) { toast('Division impossible : une parcelle resterait sans accès.'); return; }
  f.parcelles[r.u] = Object.keys(f.parcelles).length + 1;
  noterDecoupe(f, pl, [...sel], r.u); finDecoupe(f, r.u);
});
document.getElementById('decoupe-non').addEventListener('click', sortirDecoupe);
// Le découpage se sauvegarde à part : la carte, elle, se refait depuis sa graine
function noterDecoupe(f, pl, cases, u) { const d = f.decoupe ||= { cases: {}, trous: [], n: 0 }; for (const i of cases) d.cases[i] = u; d.trous = [...pl.trous]; d.n = pl.unites.length; }
function finDecoupe(f, u) {
  Rendu.replan(); Alertes.ferme = null; parcelleOuverte = parcelleOuverte != null ? u : null;
  sortirDecoupe(); selectionner({ type: 'parcelle', u }); sauver(); apresAction(true);
}

let toastMinuteur = 0;
function toast(txt) {
  const el = document.getElementById('toast');
  el.textContent = txt; el.classList.remove('visible'); void el.offsetWidth; el.classList.add('visible');
  clearTimeout(toastMinuteur); toastMinuteur = setTimeout(() => el.classList.remove('visible'), 2800);
}

// ---------- Barre du haut ----------
const iconeMet = document.getElementById('icone-meteo').getContext('2d');
let dateVue = '';
// ---------- Faillite : argent négatif et plus rien à vendre (les lots en route comptent, une culture encore en terre non) ----------
const enFaillite = () => S.argent < 0 && !S.fermes.some(f => Object.keys(f.lots).some(id => stockTotal(f, id) >= 0.5));
const ICONE_CAMION = '<svg viewBox="0 0 30 20" aria-hidden="true"><rect x="1" y="3" width="17" height="11" rx="1.5" fill="#2f6a8a"/><path d="M18 6h6.500l4 4.500V14H18z" fill="#33495a"/><circle cx="7" cy="16" r="3" fill="#1f1f1f"/><circle cx="23" cy="16" r="3" fill="#1f1f1f"/></svg>';
let faillitePeinte = null;
function majFaillite() {
  const on = !!S && enFaillite(), etat = on ? (Convoi.en ? 'embuscade' : 'ouverte') : 'non';
  if (etat === faillitePeinte) return;
  faillitePeinte = etat;
  $i('faillite').hidden = !on; $i('faillite-zone').classList.toggle('en-faillite', on);
  const b = $i('capturer'); b.disabled = etat === 'embuscade'; b.innerHTML = etat === 'embuscade' ? 'En embuscade…' : ICONE_CAMION + 'Capturer un convoi';
}
function capturerConvoi() {
  if (!enFaillite() || Convoi.en) return;
  let paye = false;
  const encaisser = () => { if (paye) return; paye = true; S.argent += Convoi.PRIX; sauver(); majEntete(); faillitePeinte = null; majFaillite(); };
  if (!Convoi.lancer(encaisser)) { encaisser(); toast(`Convoi capturé : +${euros(Convoi.PRIX)}.`); }
  majFaillite();
}
document.getElementById('capturer').addEventListener('click', capturerConvoi);
function majEntete() {
  const f = F(), m = f.meteo, el = document.getElementById('date'), txt = texteDate();
  if (txt !== dateVue) {
    const nouvelAn = dateVue && dateVue.slice(-4) !== txt.slice(-4);
    dateVue = txt; el.textContent = txt; if (S.vitesse > 0 && S.vitesse <= 3) Compteur.rebond(el, 'tourne');
    Saison.maj(dateDe(S.jour)); if (nouvelAn) recolteChangee();
  }
  document.getElementById('ferme-nom').textContent = `Ferme ${S.active + 1}`;
  Compteur.animer(document.getElementById('argent'), S.argent, euros, 500);
  if (m) {
    document.getElementById('temp').textContent = `${nf((m.tmax + m.tmin) / 2, 1)} °C`;
    document.getElementById('pluie').textContent = m.neige > 0.3 ? `${nf(m.neige, m.neige < 10 ? 1 : 0)} mm de neige` : `${nf(m.pluie, m.pluie < 10 ? 1 : 0)} mm`;
    document.getElementById('meteo').title = m.futur ? 'Temps simulé (après les dernières mesures SAFRAN)' : 'Temps mesuré (SAFRAN, Météo-France)';
    document.getElementById('meteo').classList.toggle('futur', m.futur);
  }
  majAnnee(f);
  for (const b of document.querySelectorAll('[data-vitesse]')) b.setAttribute('aria-pressed', String(+b.dataset.vitesse === S.vitesse));
}
// Indicateur de l'année : jour de l'année et pluie cumulée depuis le 1er janvier (recalculée au changement d'année, de ferme ou de partie)
let cumulPluie = null;
function majAnnee(f) {
  const d = dateDe(S.jour), m = f.meteo; if (!m) return;
  if (!cumulPluie || cumulPluie.f !== f || cumulPluie.j > S.jour || cumulPluie.an !== d.an) {
    let mm = 0; for (let j = S.jour - d.doy; j < S.jour; j++) { const x = Climat.jour(f.region, j); mm += x.pluie + x.neige; }
    cumulPluie = { f, an: d.an, j: S.jour, mm };
  } else while (cumulPluie.j < S.jour) { const x = Climat.jour(f.region, cumulPluie.j); cumulPluie.mm += x.pluie + x.neige; cumulPluie.j++; }
  const long = dateDe(S.jour - d.doy + 365).an === d.an ? 366 : 365;
  document.getElementById('an-jour').textContent = `Jour ${d.doy + 1} sur ${long}`;
  document.getElementById('an-pluie').textContent = `${nf(cumulPluie.mm + m.pluie + m.neige)} mm`;
}
// L'onglet Récolte se redessine quand le stock change
function recolteChangee() { if (onglet === 'recolte') ongletSale = true; }
// Ce qui roule encore vers la ferme : pas encore compté ni vendable
function enAttente(id, kg, kcal) {
  attente.kg += kg; attente.kcal += kcal;
  const q = attente.parC[id] ??= { kg: 0, kcal: 0 }; q.kg += kg; q.kcal += kcal;
  if (q.kg < 0.5) delete attente.parC[id];
}
function regler(v) {
  S.vitesse = v;
  if (v >= 10 && S.guide === 2) S.guide = 3;
  majEntete();
}
document.getElementById('vitesses').addEventListener('click', e => { const b = e.target.closest('[data-vitesse]'); if (b) regler(+b.dataset.vitesse); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && decoupe) { sortirDecoupe(); return; }
  if (e.code === 'Space' && !e.target.closest('input, textarea, button')) { e.preventDefault(); regler(S.vitesse ? 0 : 1); }
});
document.getElementById('niveau').addEventListener('click', () => ouvrirOnglet('objectifs'));

// Choix de la ferme
const menuFermes = document.getElementById('menu-fermes');
document.getElementById('choix-ferme').addEventListener('click', () => {
  const peutCreer = S.fermes.every(pleine);
  menuFermes.innerHTML = S.fermes.map((f, i) => `<button data-ferme="${i}" ${i === S.active ? 'aria-current="true"' : ''}>Ferme ${i + 1}<span>${masse(f.stats.kg)}</span></button>`).join('')
    + `<button data-ferme="nouvelle" ${peutCreer ? '' : 'disabled'}>Nouvelle ferme${peutCreer ? '' : '<span>quand toutes les parcelles sont débloquées</span>'}</button>`
    + '<button data-ferme="recommencer">Recommencer une partie</button>';
  menuFermes.hidden = !menuFermes.hidden;
});
menuFermes.addEventListener('click', e => {
  const b = e.target.closest('[data-ferme]'); if (!b || b.disabled) return;
  menuFermes.hidden = true;
  if (b.dataset.ferme === 'nouvelle') { ouvrirInstallation(); return; }
  if (b.dataset.ferme === 'recommencer') {
    if (!confirm('Recommencer une partie ? Toutes les fermes seront perdues.')) return;
    try { localStorage.removeItem(CLE); } catch (er) { /* rien */ }
    selectionner(null); S = null; ouvrirInstallation(); return;
  }
  S.active = +b.dataset.ferme; selectionner(null); Rendu.preparer(); outilParDefaut(); apresAction(true);
});
document.addEventListener('click', e => { if (!e.target.closest('#menu-fermes, #choix-ferme')) menuFermes.hidden = true; });

// ---------- Semence ----------
// Le mode dont l'onglet Semences montre les cultures : celui de la parcelle désignée
const modeVise = f => { const u = selection?.u ?? parcelleOuverte; return u != null && f.parcelles[u] ? modeDe(f, u) : 'gc'; };
// Semence par défaut : une culture ouverte qui se sème maintenant
function outilParDefaut() {
  const f = F(), dispo = culturesDebloquees(modeVise(f)), mois = dateDe(S.jour).mois, semable = id => CULTURE[id].semis.includes(mois);
  if (!dispo.includes(outil.id) || !semable(outil.id)) {
    outil = { id: dispo.find(semable) || (dispo.includes(outil.id) ? outil.id : dispo[0]) };
  }
}
function choisirSemence(id) {
  const c = CULTURE[id], mois = dateDe(S.jour).mois;
  // Cultures associées : les deux dernières choisies font la paire
  outil = MODES[modeVise(F())].assoc && id !== outil.id ? { id, b: outil.id } : { id }; majVolante();
  toast(c.semis.includes(mois) ? `${c.nom} : cliquez un de vos champs, puis Semer.` : `${c.nom} : semis en ${plages(c.semis)}, avancez le temps jusque-là.`);
}
// ---------- Onglets ----------
const vue = document.getElementById('vue');
let onglet = 'objectifs', seulementSemables = true, ongletSale = true, carnetOuvert = false, vuePressee = false, parcelleOuverte = null;
function ouvrirOnglet(nom) {
  const change = onglet !== nom;
  onglet = nom; ongletSale = true; if (change) carnetOuvert = false;
  for (const b of document.querySelectorAll('[data-onglet]')) b.setAttribute('aria-selected', String(b.dataset.onglet === nom));
  placerIndicateur();
  majOnglet();
  // l'apparition ne se joue qu'au changement d'onglet : un redessin (stock qui arrive) ne fait pas clignoter la liste
  if (change) { Compteur.rebond(vue, 'apparait'); clearTimeout(ouvrirOnglet.fin); ouvrirOnglet.fin = setTimeout(() => vue.classList.remove('apparait'), 600); }
}
function placerIndicateur() {
  const b = document.querySelector(`[data-onglet="${onglet}"]`), ind = document.getElementById('indicateur');
  if (b && ind) { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`; }
}
document.getElementById('onglets').addEventListener('click', e => { const b = e.target.closest('[data-onglet]'); if (b) ouvrirOnglet(b.dataset.onglet); });
// Vignette d'une culture : sa terre et la plante au stade le plus parlant
function icone(cv, c) {
  const g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height);
  terre(g, 0, 0, 3, 3, { mo: 2.5, sec: 0, chaume: 0 }, 'champs');
  dessinerPlante(g, 0, 6, c, STADE_ICONE[c.forme] ?? 1, 1, 0, false);
}

function carteSemence(c, modeId, mois, maxK, verrou) {
  const mode = MODES[modeId], k = kcalParHa(c), ouvert = c.semis.includes(mois), i = ordreMode(modeId).indexOf(c.id), niv = Math.max(2, Math.ceil((i - 4) / 2) + 1);
  return `<button class="carte${outil.id === c.id || (mode.assoc && outil.b === c.id) ? ' choisie' : ''}${ouvert ? '' : ' fermee'}${verrou ? ' verrou' : ''}" data-semence="${c.id}">
    <canvas width="48" height="48" data-icone="${c.id}"></canvas>
    <span class="corps">
      <span class="ligne1"><b>${c.nom}</b><span class="${verrou ? 'cadenas' : ouvert ? 'bon' : 'discret'}">${verrou ? `niveau ${niv}` : plages(c.semis)}</span></span>
      <span class="ligne2">${nomFamille(c.famille)}</span>
      <span class="ligne2"><b>${nf(c.rdt, c.rdt < 10 ? 1 : 0)} t/ha</b>${c.kcal ? ` · ${c.kcal} kcal/100 g` : ''} · ${nf(c.dj)} °C·j</span>
      ${c.kcal ? `<span class="jauge"><span style="--part:${(k / maxK).toFixed(3)}"></span></span>` : ''}
      <span class="ligne2">${c.kcal ? `${nf(k / 1e6, 1)} Mkcal/ha · ` : ''}≈ ${masse(c.rdt * 1000 * CASE_HA)} par case${mode.miseEnPlace ? ` · semis ${euros(coutSemis(mode, c))}/ha` : ''}${c.vivace ? (c.vivace.ans ? ` · vivace ${c.vivace.ans[0]} à ${c.vivace.ans[1]} ans` : ' · vivace') : ''}</span>
    </span></button>`;
}
const ONGLETS = {
  objectifs() {
    const L = objectifsActifs(F());
    return '<h3>Objectifs</h3>' + (L.length ? L.map(o => `<div class="objectif"><span class="boite"></span><p>${o.txt}</p><small>débloque un champ</small></div>`).join('') : '<p class="rien">Tous les champs voisins sont à vous.</p>');
  },
  semences() {
    const f = F(), mode = modeVise(f), mois = dateDe(S.jour).mois;
    const ouvertes = culturesDebloquees(mode).map(id => CULTURE[id]);
    const maxK = Math.max(...CULTURES.filter(c => cultureAutorisee(mode, c)).map(kcalParHa));
    const choisi = selection && f.parcelles[selection.u] ? etatParcelle(f, selection.u) : null;
    let html = choisi?.prec ? `<p class="ligne2">Parcelle ${choisi.num} · ${textePrecedent(choisi.prec)}</p>` : '';
    html += `<label class="filtre"><input type="checkbox" data-action="filtre" ${seulementSemables ? 'checked' : ''}> Seulement ce qui se sème en ${NOMS_MOIS[mois - 1]}</label>`;
    let rien = true;
    for (const cat of CATEGORIES) {
      const liste = ouvertes.filter(c => c.cat === cat && (!seulementSemables || c.semis.includes(mois)));
      if (!liste.length) continue;
      rien = false;
      html += `<h3>${cat}</h3><div class="cartes">${liste.map(c => carteSemence(c, mode, mois, maxK, false)).join('')}</div>`;
    }
    if (rien) html += `<p class="vide">Rien de ce que vous cultivez ne se sème en ${NOMS_MOIS[mois - 1]}. Décochez la case pour tout voir, ou avancez le temps.</p>`;
    const bientot = ordreMode(mode).slice(nbDebloquees(S.exp), nbDebloquees(S.exp) + 2).map(id => CULTURE[id]);
    if (bientot.length) html += `<h3>Bientôt</h3><div class="cartes">${bientot.map(c => carteSemence(c, mode, mois, maxK, true)).join('')}</div>`;
    return html;
  },
  recolte() {
    if (carnetOuvert) return carnet();
    const f = F(), s = f.stats, ids = culturesEnGrange(f).sort((a, b) => vendable(f, b) - vendable(f, a));
    const enGrange = ids.reduce((t, id) => t + vendable(f, id) * CULTURE[id].kcal * 10, 0);
    return `<div class="tuiles"><div class="tuile"><b>${masse(Math.max(0, s.kg - attente.kg))}</b><span>récoltées au total</span></div><div class="tuile"><b>${energie(Math.max(0, s.kcal - attente.kcal))}</b><span>d’énergie au total</span></div></div>
      <h3 class="titre-stock">Stock et vente <small>${energie(enGrange)} en grange</small></h3>`
      + (ids.length ? ids.map(id => {
        const c = CULTURE[id], kg = vendable(f, id), t = kg / 1000, P = prixAnnee(c), pc = Math.round(P.e * 100), g = Meca.resteGarde(f, id);
        return `<div class="vente"><div class="haut"><span class="nom"><i class="pt" style="background:${teinteProduit(c)}"></i>${c.nom}</span><b>${masse(kg)}</b></div>
          <div class="bas"><span class="ligne2">${nf(s.parCulture[id].dernier, 2)} t/ha · <span class="garde${g.court ? ' court' : ''}" data-g="${id}">${g.txt}</span></span><span class="prix">${nf(P.p)} €/t<i class="${pc >= 0 ? 'plus' : 'moins'}">${pc >= 0 ? '+' : '−'}${Math.abs(pc)} %</i></span></div>
          <button class="vendre" data-vendre="${id}">Vendre pour ${euros(t * P.p)}<span>+${nf(gainExp(c, t))} d’exp.</span></button></div>`;
      }).join('') : '<p class="rien">Rien en grange pour le moment.</p>')
      + '<button class="lien" data-carnet="1">Carnet de la ferme <span aria-hidden="true">›</span></button>';
  },
  parcelles() {
    const f = F(), us = Object.keys(f.parcelles).map(Number).sort((a, b) => f.parcelles[a] - f.parcelles[b]), etats = us.map(u => etatParcelle(f, u));
    const n = etats.filter(e => e.pretes).length;
    return (n ? `<button class="tout" data-tout="1">Récolter tout · ${n} parcelle${n > 1 ? 's' : ''}</button>` : '') + us.map((u, i) => {
      const e = etats[i], e2 = MODES[modeDe(f, u)].assoc ? etatParcelle(f, u, 1) : null, p = pastille(e.c || !e2?.c ? e : e2), ouverte = parcelleOuverte === u;
      return `<div class="parcelle"><button data-ouvre="${u}" aria-expanded="${ouverte}"><b>Parcelle ${e.num}</b><span>${[e, e2].filter(x => x?.c).map(x => x.c.nom).join(' + ') || '—'} · ${surfaceTexte(e.ha)}</span><i class="etat ${p.cls}">${p.txt}</i></button>${ouverte ? corpsFiche(f, u, e) : ''}</div>`;
    }).join('');
  },
};

// Carnet de la ferme : total produit par culture, puis les récoltes année par année
function carnet() {
  const s = F().stats, ids = Object.keys(s.parCulture).sort((a, b) => s.parCulture[b].kg - s.parCulture[a].kg);
  let html = '<button class="retour" data-carnet="0">‹ Récolte</button><h3>Total produit par la ferme</h3>';
  if (!ids.length) return html + '<p class="rien">Aucune récolte encore.</p>';
  html += '<div class="defile-tableau"><table class="tableau"><thead><tr><th>Culture</th><th>Récolté</th><th>Dernier</th><th>France</th><th>Énergie</th></tr></thead><tbody>';
  for (const id of ids) {
    const c = CULTURE[id], q = s.parCulture[id], ecart = q.dernier / c.rdt;
    html += `<tr><td>${c.nom}</td><td>${masse(q.kg)}</td><td class="${ecart >= 1 ? 'bon' : ecart < 0.75 ? 'mauvais' : ''}">${nf(q.dernier, q.dernier < 10 ? 1 : 0)} t/ha</td><td class="discret">${nf(c.rdt, c.rdt < 10 ? 1 : 0)}</td><td>${energie(q.kcal)}</td></tr>`;
  }
  html += '</tbody></table></div><h3>Récoltes, année par année</h3><div class="defile-tableau"><table class="tableau"><thead><tr><th>Récolte</th><th>Surface</th><th>Rendement</th><th>Tonnes</th></tr></thead><tbody>';
  for (const an of Object.keys(s.recAn || {}).sort((a, b) => b - a)) {
    const L = Object.entries(s.recAn[an]).sort((a, b) => b[1].kg - a[1].kg);
    for (const [id, q] of L) html += `<tr><td>${an} · ${CULTURE[id].nom}</td><td>${surfaceTexte(q.ha)}</td><td>${nf(q.kg / 1000 / q.ha, 1)} t/ha</td><td>${masse(q.kg)}</td></tr>`;
  }
  return html + '</tbody></table></div>';
}

function majOnglet() {
  const haut = vue.scrollTop;
  vue.innerHTML = ONGLETS[onglet]();
  for (const cv of vue.querySelectorAll('canvas[data-icone]')) icone(cv, CULTURE[cv.dataset.icone]);
  vue.scrollTop = haut;
  ongletSale = false;
}
vue.addEventListener('click', e => {
  const s = e.target.closest('[data-semence]');
  if (s) {
    if (s.classList.contains('verrou')) { toast(messageVerrou(modeVise(F()), s.dataset.semence)); Compteur.rebond(s, 'non'); return; }
    choisirSemence(s.dataset.semence); majOnglet(); return;
  }
  const v = e.target.closest('[data-vendre]');
  if (v) { Meca.vendreTout(v.dataset.vendre, v); majOnglet(); return; }
  const cn = e.target.closest('[data-carnet]');
  if (cn) { carnetOuvert = cn.dataset.carnet === '1'; vue.scrollTop = 0; majOnglet(); return; }
  const o = e.target.closest('[data-ouvre]');
  if (o) { parcelleOuverte = parcelleOuverte === +o.dataset.ouvre ? null : +o.dataset.ouvre; majOnglet(); return; }
  if (e.target.closest('[data-tout]')) { recolterTout(); return; }
  commandeParcelle(e);
});
// Pas de redessin entre l'appui et le relâchement : le clic sur « Vendre » se perdrait
for (const el of [vue, volante]) el.addEventListener('pointerdown', () => { vuePressee = true; });
addEventListener('pointerup', () => { vuePressee = false; });
addEventListener('pointercancel', () => { vuePressee = false; });
vue.addEventListener('change', e => { if (e.target.matches('[data-action="filtre"]')) { seulementSemables = e.target.checked; majOnglet(); } });

function apresAction(structure) {
  verifierObjectifs();
  majEntete(); majVolante();
  if (structure || onglet !== 'semences') majOnglet();
}
// Un objectif atteint disparaît de la liste, fait entrer son champ dans l'exploitation et laisse place au suivant (un seul à la fois : chacun se voit)
function verifierObjectifs() {
  for (const f of S.fermes) {
    const o = objectifsActifs(f).find(x => x.ok(f));
    if (!o) continue;
    f.objectifs[o.id] = true;
    const po = parcellesAObjectif(f), u = +Object.keys(po).find(k => po[k] === o.id);
    if (!planDe(f).unites[u]?.n || f.parcelles[u]) continue;   // champ déjà entré puis fusionné : l'objectif reste atteint
    ajouterParcelle(f, u);
    if (f !== F()) continue;
    ongletSale = true;
    if (!document.hidden && install.hidden) {
      Rendu.integrer(u);
      Meca.bandeau('Champ débloqué', `${surfaceTexte(surfaceUnite(f, u))} · ${o.txt}`);
      const c = centreDe(casesDe(planDe(f), u))(); Anim.confettis(c.x, c.y, 70, true);
    } else if (Rendu.gl && Rendu.pl) Rendu.majVerrous(f);
  }
}

// ---------- Installation : région, graine, manière de cultiver ----------
// La carte se tire d'une graine (js/carte.js) : la même graine, dans la même région, redonne la même carte partout.
const install = document.getElementById('installation');
const REGIONS_JOUABLES = REGIONS.filter(r => r.id !== 'monchy');   // Monchy : maille de l'ancien lieu réel, doublon de l'Artois
// Plus de choix de la manière de cultiver à l'installation (demande du 07/11) : on s'installe en grande culture ;
// mêler maraîchage, permaculture et grande culture sur une même ferme se fera dans le jeu.
let choixRegion = 'artois', choixGraine = Carte.nouvelleGraine();
const $i = id => document.getElementById(id);
function ouvrirInstallation() {
  install.hidden = false;
  $i('guide').hidden = true;
  $i('install-titre').textContent = `Choisissez où installer votre ${S ? 'nouvelle' : 'première'} ferme`;
  if (S) choixGraine = Carte.nouvelleGraine();
  const svg = $i('carte-france');
  if (!svg.childElementCount) {
    const xs = FRANCE.join(' ').match(/-?\d+\.?\d*/g).map(Number);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < xs.length; i += 2) { x0 = Math.min(x0, xs[i]); x1 = Math.max(x1, xs[i]); y0 = Math.min(y0, xs[i + 1]); y1 = Math.max(y1, xs[i + 1]); }
    svg.setAttribute('viewBox', `${x0 - 12} ${y0 - 12} ${x1 - x0 + 24} ${y1 - y0 + 24}`);
    const ns = 'http://www.w3.org/2000/svg';
    for (const d of FRANCE) { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'pays'); svg.appendChild(p); }
    for (const r of REGIONS_JOUABLES) {
      const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'lieu'); g.dataset.lieu = r.id; g.setAttribute('tabindex', '0');
      const gauche = r.x > 330;   // à l'est, l'étiquette passe à gauche du point
      g.innerHTML = `<title>${r.nom} (${r.ville})</title><circle class="cible" cx="${r.x}" cy="${r.y}" r="8"></circle><circle class="onde" cx="${r.x}" cy="${r.y}" r="5"></circle><circle cx="${r.x}" cy="${r.y}" r="3.5"></circle><text x="${gauche ? r.x - 11 : r.x + 11}" y="${r.y + 5}" text-anchor="${gauche ? 'end' : 'start'}">${r.nom}</text>`;
      svg.appendChild(g);
    }
  }
  const boite = $i('install-region');
  if (!boite.dataset.pret) {
    boite.dataset.pret = '1';
    boite.innerHTML = `<h2 id="i-nom"></h2><p class="ligne2" id="i-ligne"></p>
      <canvas id="i-apercu" class="apercu" aria-label="Carte de l’exploitation vue d’avion"></canvas>
      <div class="graine"><label for="i-graine">Graine</label><input id="i-graine" maxlength="12" spellcheck="false" autocomplete="off" autocapitalize="characters">
        <button id="i-de" type="button">Autre carte</button></div>
      <div class="jauges-lieu" id="i-chiffres"></div>`;
    $i('i-graine').addEventListener('input', e => { const g = Carte.normaliser(e.target.value); if (g) { choixGraine = g; majInstallation(); } });
    $i('i-graine').addEventListener('change', e => { e.target.value = choixGraine; });
    $i('i-de').addEventListener('click', () => {
      choixGraine = Carte.nouvelleGraine(); majInstallation();
      $i('i-apercu').animate([{ opacity: 0.25, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'ease-out' });
    });
  }
  majInstallation();
}
// Chiffres du lieu en jauges à six segments (demande du 08/11) : barre entièrement colorée, texte neutre.
// Température et réchauffement : bleu foncé, bleu, vert, jaune, orange, rouge (du froid au chaud) ; pluie et réserve du sol :
// rouge, orange, jaune, vert, bleu, bleu foncé. La moyenne française est dans le segment vert (gi) et repérée par un trait.
// Les segments se répartissent de part et d'autre du vert entre le 2e et le 98e centile des régions du jeu (mêmes données SAFRAN).
const signe = v => v < 0 ? '−' : '+';
const COULEURS_CHAUD = ['b1', 'b2', 'v', 'j', 'o', 'r'], COULEURS_EAU = ['r', 'o', 'j', 'v', 'b2', 'b1'];
const JAUGES_LIEU = [
  { k: 'tRef', nom: 'Température moyenne annuelle', cl: COULEURS_CHAUD, gi: 2, unite: v => `${nf(v, 1)} °C`, sous: '1961-1990',
    niveaux: ['Très froid', 'Froid', 'Moyen', 'Doux', 'Chaud', 'Très chaud'],
    ecart: d => `${nf(Math.abs(d), 1)} °C de ${d < 0 ? 'moins' : 'plus'} que la moyenne française` },
  { k: 'pente60', f: 10, nom: 'Réchauffement', cl: COULEURS_CHAUD, gi: 2, unite: v => `${signe(v)}${nf(Math.abs(v), 2)} °C`, sous: 'par décennie depuis 1960',
    niveaux: ['Très lent', 'Lent', 'Moyen', 'Assez rapide', 'Rapide', 'Très rapide'],
    ecart: d => `${d < 0 ? 'plus lent' : 'plus rapide'} que la moyenne française (${signe(d)}${nf(Math.abs(d), 2)} °C)` },
  { k: 'pRef', nom: 'Pluie', cl: COULEURS_EAU, gi: 3, unite: v => `${nf(v)} mm`, sous: 'par an, 1961-1990',
    niveaux: ['Très sec', 'Sec', 'Assez sec', 'Moyen', 'Arrosé', 'Très arrosé'],
    ecart: (d, moy) => `${nf(Math.abs(d) / moy * 100)} % de ${d < 0 ? 'moins' : 'plus'} que la moyenne française` },
  { k: 'ru', nom: 'Réserve utile du sol', cl: COULEURS_EAU, gi: 3, unite: v => `${nf(v)} mm`, sous: '',
    niveaux: ['Très faible', 'Faible', 'Assez faible', 'Moyenne', 'Bonne', 'Très bonne'],
    ecart: d => `${nf(Math.abs(d))} mm de ${d < 0 ? 'moins' : 'plus'} que la moyenne française` },
];
const statsJauge = {};
function jaugeLieu(q, r) {
  if (!statsJauge[q.k]) {
    const v = REGIONS_JOUABLES.map(x => x[q.k] * (q.f || 1)).sort((a, b) => a - b), c = p => v[Math.round(p * (v.length - 1))];
    const moy = v.reduce((a, b) => a + b, 0) / v.length, lo = c(0.02), hi = c(0.98), w = 0.08 * (hi - lo), gi = q.gi, b = [lo];
    for (let i = 1; i <= gi; i++) b.push(lo + (moy - w - lo) * i / gi);
    for (let i = 1; i <= 5 - gi; i++) b.push(moy + w + (hi - moy - w) * i / (5 - gi));
    b.splice(gi + 1, 0, moy + w); b.pop(); b[6] = hi;
    statsJauge[q.k] = { moy, bornes: b };
  }
  const s = statsJauge[q.k], b = s.bornes, d = r[q.k] * (q.f || 1) - s.moy, val = r[q.k] * (q.f || 1);
  const place = x => { const n = Math.min(5, b.slice(1, 6).filter(y => x > y).length); return [n, Math.max(0, Math.min(1, (n + Math.max(0, Math.min(1, (x - b[n]) / ((b[n + 1] - b[n]) || 1)))) / 6))]; };
  const [n, pos] = place(val), posMoy = place(s.moy)[1];
  const segs = q.cl.map(c => `<i class="c-${c}"></i>`).join('');
  return `<div class="jauge-lieu">
    <p><span>${q.nom}</span><b>${q.unite(val)}</b><em>${q.niveaux[n]}</em></p>
    <i class="barre6" style="--pos:${(pos * 100).toFixed(1)}%;--moy:${(posMoy * 100).toFixed(1)}%">${segs}<i class="repere"></i><i class="pastille"></i></i>
    <small>${q.sous ? q.sous + ' · ' : ''}${n === q.gi ? 'dans la moyenne française' : q.ecart(d, s.moy)}</small></div>`;
}
function majInstallation() {
  const r = REGIONS.find(x => x.id === choixRegion), id = lieuDe(choixRegion, choixGraine), L = LIEUX[id], pl = L.champs;
  for (const g of document.querySelectorAll('#carte-france .lieu')) { const a = g.dataset.lieu === choixRegion; g.classList.toggle('actif', a); if (a) g.parentNode.appendChild(g); }
  $i('i-nom').textContent = L.nom;
  $i('i-ligne').textContent = `${r.nom} (${r.ville}) · ${r.sol} · ${pl.unites.length} champs sur 1,6 × 1,2 km`;
  if (document.activeElement !== $i('i-graine')) $i('i-graine').value = choixGraine;
  Carte.apercu($i('i-apercu'), pl, { depart: new Set(champsDeDepart({ lieu: id })) });
  $i('i-chiffres').innerHTML = JAUGES_LIEU.map(q => jaugeLieu(q, r)).join('');
  $i('install-go').textContent = S ? `Démarrer le ${texteDate()}` : 'Démarrer le 1er mars 1959';
}
function choisirRegion(g) { if (!g || !g.dataset.lieu) return; choixRegion = g.dataset.lieu; majInstallation(); }
$i('carte-france').addEventListener('click', e => choisirRegion(e.target.closest('.lieu')));
$i('carte-france').addEventListener('keydown', e => { if (e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault(); choisirRegion(e.target.closest('.lieu')); });
$i('install-go').addEventListener('click', async () => {
  const bouton = $i('install-go');
  bouton.disabled = true; bouton.textContent = 'Chargement du climat…';
  try { await Climat.charger(choixRegion); } catch (e) { toast(e.message); bouton.disabled = false; majInstallation(); return; }
  const neuve = !S;
  if (neuve) { S = { v: 7, jour: DEBUT(), vitesse: 1, argent: 0, fermes: [], active: 0 }; Meca.completer(S); }
  const f = creerFerme(lieuDe(choixRegion, choixGraine));
  f.meteo = Climat.jour(f.region, S.jour);
  install.hidden = true; bouton.disabled = false;
  selectionner(null);
  demarrer();
});

// ---------- Alertes au-dessus des parcelles ----------
// Gérable : stress hydrique en cours (Ks de FAO 56 du moteur, mêmes seuils que la fiche : 20 % léger, 50 % dangereux) ou manque d'azote
// (facteur azote du rendement : sous 0,90 léger, sous 0,70 dangereux, et le sol ne couvre plus ce qu'il reste à prélever).
// Subi : perte de rendement déjà acquise par le gel (toute perte) ou la sécheresse (à partir de 10 %). Elle reste jusqu'à la récolte ;
// une culture détruite par le gel (−100 %) s'affiche jusqu'au semis suivant, au plus 90 jours.
const ALERTE = { stressLeger: 20, stressFort: 50, azoteLeger: 0.9, azoteFort: 0.7, secheMin: 10, joursDetruite: 90 };
function alertesParcelle(f, u) {
  const cases = casesDe(planDe(f), u).map(([x, y]) => f.cases[cle(x, y)]).filter(Boolean);
  const moy = (L, g) => L.reduce((s, t) => s + g(t), 0) / (L.length || 1);
  const crs = cases.flatMap(t => creneaux(t).map(s => ({ t, s })));
  const detruite = ({ s }) => !s.cult && s.perdu != null && S.jour - s.perdu < ALERTE.joursDetruite;
  const touchees = crs.filter(x => x.s.cult || detruite(x));
  if (!touchees.length) return {};
  const pousse = crs.filter(({ s }) => s.cult && s.p < 1 && !s.dort);
  const stress = moy(pousse, ({ t }) => { const m = 0.5 * ruMax(f, t); return t.r >= m ? 0 : 100 * (1 - clamp(t.r / m, 0, 1)); });
  const suivies = pousse.filter(({ s }) => s.p >= 0.15 && !CULTURE[s.cult].leg);   // avant 15 % du cycle, le rapport azote n'a pas de sens (voir rendement)
  const reste = ({ t, s }) => { const c = CULTURE[s.cult]; return potentielHa(t, c, s) * partCycle(c, s) * c.npt * (1 - s.p) * 1.1; };
  const azote = suivies.length && moy(suivies, reste) > moy(suivies, ({ t }) => t.nmin) ? moy(suivies, ({ t, s }) => rendement(f, t, S.jour, s).azote) : 1;
  const gravite = stress >= ALERTE.stressFort || azote < ALERTE.azoteFort ? 'fort' : stress >= ALERTE.stressLeger || azote < ALERTE.azoteLeger ? 'leger' : null;
  const gel = Math.round(100 * moy(touchees, x => detruite(x) ? 1 : x.s.dgel));
  const seche = Math.round(100 * moy(touchees, ({ s }) => { if (!s.cult || s.etc <= 20) return 0; const c = CULTURE[s.cult]; return clamp(c.ky * (1 - s.etr / s.etc), 0, 1); }));
  const niveau = (v, leger, fort) => v >= fort ? 2 : v >= leger ? 1 : 0;
  const sy = 3 * niveau(stress, ALERTE.stressLeger, ALERTE.stressFort) + niveau(-azote, -ALERTE.azoteLeger, -ALERTE.azoteFort);   // aspect des plantes et du sol (Rendu.symptomes)
  return { gravite, gel, seche: seche >= ALERTE.secheMin ? seche : 0, sy };
}
const Alertes = {
  couche: document.getElementById('alertes'), vues: new Map(), ferme: null, cam: '',
  dessinExcl(g) {
    const [fond, trait] = g === 'fort' ? ['#e23c2c', '#5a120a'] : ['#f7c62f', '#6a4608'];
    return `<span class="excl"><span class="ombre-sol"></span><svg viewBox="0 0 38 62"><path d="M12 5h14c2 0 3.2 1.7 3 3.6l-3.3 30.6c-.2 1.6-1.4 2.8-3 2.8h-7.4c-1.6 0-2.8-1.2-3-2.8L9 8.6C8.8 6.7 10 5 12 5z" fill="${fond}" stroke="${trait}" stroke-width="3" stroke-linejoin="round"/><circle cx="19" cy="52" r="6.5" fill="${fond}" stroke="${trait}" stroke-width="3"/><path d="M13.5 9l2.2 26" stroke="rgba(255,255,255,.65)" stroke-width="2.6" stroke-linecap="round"/></svg></span>`;
  },
  GEL: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="#dcf0fb" stroke="#2f6fb0" stroke-width="3"/><g stroke="#2f6fb0" stroke-width="2.8" stroke-linecap="round" fill="none"><path d="M24 9v30M11 16.5l26 15M11 31.5l26-15"/><path d="M24 14l-4-3.5M24 14l4-3.5M24 34l-4 3.5M24 34l4 3.5M15.3 19l-5 1M15.3 19l-1.6-5M32.7 29l5-1M32.7 29l1.6 5M15.3 29l-5-1M15.3 29l-1.6 5M32.7 19l5 1M32.7 19l1.6-5"/></g></svg>',
  SECHE: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="#f6dfa8" stroke="#a8601a" stroke-width="3"/><circle cx="24" cy="17" r="6.5" fill="#e8921f"/><g stroke="#e8921f" stroke-width="2.4" stroke-linecap="round"><path d="M24 6.5v2.5M13.5 17h2.5M32 17h2.5M16.6 9.6l1.8 1.8M31.4 9.6l-1.8 1.8"/></g><path d="M8 32c5-3 11-3.5 16-3s11 .5 16 3c-1.8 5.2-9 9-16 9s-14.2-3.8-16-9z" fill="#b5834a"/><path d="M15 31.5l2.5 3.500-2 3M26 30l-1.500 4 3 3.500-1.500 3.500M34 32.500l-2.500 3" fill="none" stroke="#6b421a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  jeton(svg, n) { return `<span class="jeton">${svg}<b class="${n >= 100 ? 'tout-perdu' : ''}">−${n} %</b></span>`; },
  // Une fois par tour lent : seules les parcelles dont l'état a changé sont réécrites, pour ne pas relancer les rebonds des autres
  maj(f) {
    if (!Rendu.gl || !Rendu.pl) return;
    if (this.ferme !== f) { this.ferme = f; this.couche.textContent = ''; this.vues.clear(); }
    let change = false;
    const symptomes = new Map();
    for (const k in f.parcelles) {
      const u = +k, a = alertesParcelle(f, u);
      if (a.sy) symptomes.set(u, a.sy);
      const sig = a.gravite || a.gel || a.seche ? `${a.gravite}|${a.gel}|${a.seche}` : '';
      let v = this.vues.get(u);
      if (!sig) { if (v) { v.el.remove(); this.vues.delete(u); } continue; }
      if (!v) { const cs = casesDe(planDe(f), u); v = { el: document.createElement('div'), sig: '', x: cs.reduce((s, c) => s + c[0], 0) / cs.length, y: cs.reduce((s, c) => s + c[1], 0) / cs.length }; v.el.className = 'alerte'; this.couche.append(v.el); this.vues.set(u, v); change = true; }
      if (v.sig !== sig) { v.sig = sig; v.el.innerHTML = (a.gravite ? this.dessinExcl(a.gravite) : '') + (a.gel ? this.jeton(this.GEL, a.gel) : '') + (a.seche ? this.jeton(this.SECHE, a.seche) : ''); }
    }
    Rendu.symptomes = symptomes;
    if (change) this.placer(true);
  },
  // À chaque image, mais on ne projette que si la caméra a bougé
  placer(force) {
    if (!Rendu.gl || !this.vues.size) return;
    const cam = Rendu.camera.matrixWorld.elements.join() + Rendu.camera.aspect + Rendu.camera.fov;
    if (!force && cam === this.cam) return;
    this.cam = cam;
    const r = this.couche.getBoundingClientRect();
    for (const v of this.vues.values()) {
      const m = Rendu.versMonde(v.x, v.y, 0.3), p = Rendu.ecranDe(m.x, m.y, m.z);
      v.el.style.transform = `translate(${(p.x - r.left).toFixed(1)}px, ${(p.y - r.top).toFixed(1)}px) translate(-50%, -100%)`;
    }
  },
};

// ---------- Boucle ----------
let dernier = performance.now(), cumul = 0, jourAffiche = -1, enRoute = false, dernierRendu = 0, dernierLent = 0, derniereSauvegarde = 0;
function boucle(t) {
  requestAnimationFrame(boucle);        // d'abord : quoi qu'il arrive dans la suite, l'image d'après aura lieu
  const dt = Math.min(250, t - dernier); dernier = t;
  if (S && install.hidden && S.fermes.length) {
    if (S.vitesse > 0) {
      cumul += dt;
      const pas = JOUR_MS / S.vitesse;
      let n = 0;
      while (cumul >= pas && n < 10) { cumul -= pas; unJour(); n++; }
      if (n >= 10) cumul = 0;
      majHeure(cumul / pas);
    }
    if (S.jour !== jourAffiche) {
      jourAffiche = S.jour;
      verifierObjectifs(); majEntete();
      if (selection && !vuePressee) majVolante();
      const vivant = onglet === 'parcelles' && (S.vitesse <= 3 || S.jour % 4 === 0);
      if (onglet === 'recolte' && !carnetOuvert) for (const el of vue.querySelectorAll('[data-g]')) { const f = F(), id = el.dataset.g; if (!f.lots[id]) continue; const g = Meca.resteGarde(f, id); el.textContent = g.txt; el.classList.toggle('court', g.court); }
      if ((ongletSale || vivant) && !peinture && !vuePressee) majOnglet();
    } else if (ongletSale && !peinture && !vuePressee) majOnglet();
    if (t - dernierLent > 150) {
      dernierLent = t;
      iconeMeteo(iconeMet, F().meteo || { tmin: 5, tmax: 12, pluie: 0, neige: 0 }, t);
      Meca.guide();
      Alertes.maj(F());
      majFaillite();
    }
    if (t - derniereSauvegarde > 20000) { derniereSauvegarde = t; sauver(); }
    // plus rien en vol : les compteurs affichés rejoignent les vrais (au cas où une arrivée se serait perdue)
    if (!Anim.effets.length && !Anim.enRetard && !Rendu.transportEnCours() && (attente.kg || attente.kcal || Meca.attente.exp)) { attente.kg = attente.kcal = 0; attente.parC = {}; Meca.attente.exp = 0; recolteChangee(); Meca.majNiveau(false); }
    // 60 images par seconde quand quelque chose bouge vite (geste, machine, effet), 20 au calme : le Mac reste frais
    const vif = Rendu.revel.size || Rendu.parts.length || Rendu.ondes.length || Anim.effets.length || Rendu.bouge();
    if (vif || t - dernierRendu > (Rendu.calme() ? 48 : 30)) { Rendu.dessiner(t, t - dernierRendu); dernierRendu = t; Alertes.placer(); }
    Anim.dessiner(t);
  }
}
// Horloge de la barre du haut : chaque jour de jeu déroule la journée de travail, de 6 h à 21 h (heure écrite)
let heureVue = -1;
function majHeure(part) {
  const h = 6 + 15 * Math.max(0, Math.min(1, part));
  if (Math.floor(h) !== heureVue) { heureVue = Math.floor(h); $i('heure-txt').textContent = `${heureVue} h`; }
}
function demarrer() {
  Rendu.preparer();
  outilParDefaut();
  majEntete(); Meca.majNiveau(false); majHeure(0);
  ouvrirOnglet('objectifs');
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
