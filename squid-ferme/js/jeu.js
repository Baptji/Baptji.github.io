'use strict';
/* Squid Ferme : état, temps, actions du joueur, interface.
   Dessin du champ : rendu.js ; vie autour de la ferme : vie.js ; effets : animations.js ;
   progression et marché (expérience, niveaux, stock, vente, bilan, premiers pas) : mecaniques.js. */

// ---------- Monde ----------
// Un lieu tiré d'une graine (js/carte.js) : grille « champs » de 50 m ou « planches » de 10 m selon le mode.
const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const CLE = 'squid-ferme-6';                     // changer ce numéro remet toutes les parties à zéro (les clés précédentes sont effacées au chargement)
const JOUR_MS = 5000;                               // durée d'un jour à la vitesse ×1
const PRIX_TERRE_HA = { champs: 9000, planches: 60000 };   // € par hectare (terres de l'Artois ≈ 9 000 €/ha)
const DEBUT = () => indexJour(1959, 59);            // 1er mars 1959 : les semis de printemps commencent

// Objectifs : chacun fait entrer un champ voisin dans l'exploitation (répartis par parcellesAObjectif) ; une fois atteint, il le reste
const OBJ_PARCELLES = [
  { id: 'recolte', court: '1re récolte', txt: 'Faire une première récolte', ok: () => total().recoltes > 0 },
  { id: 't100', court: '100 tonnes', txt: 'Récolter 100 tonnes', ok: () => total().kg >= 1e5 },
  { id: 'niv3', court: 'Niveau 3', txt: 'Atteindre le niveau 3', ok: () => niveauDe(S.exp) >= 3 },
  { id: 'p100', court: '100 personnes', txt: 'Nourrir 100 personnes pendant un an', ok: () => total().kcal >= 100 * BESOIN_KCAL * 365 },
  { id: 'record', court: 'Record', txt: 'Dépasser le rendement moyen français sur une culture', ok: () => S.fermes.some(f => Object.entries(f.stats.parCulture).some(([id, p]) => p.dernier >= CULTURE[id].rdt)) },
  { id: 'niv5', court: 'Niveau 5', txt: 'Atteindre le niveau 5', ok: () => niveauDe(S.exp) >= 5 },
  { id: 'mo', court: 'MO + 0,5', txt: 'Faire gagner un demi-point de matière organique à une ferme', ok: () => S.fermes.some(f => etatSol(f).mo - f.moDepart >= 0.5) },
  { id: 'p1000', court: '1 000 personnes', txt: 'Nourrir 1 000 personnes pendant un an', ok: () => total().kcal >= 1000 * BESOIN_KCAL * 365 },
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
const achetable = (f, u) => u >= 0 && !f.parcelles[u] && parcellesAObjectif(f)[u] == null;
// Un champ voisin sur deux parmi les plus proches de l'exploitation porte un objectif (attribués une fois pour toutes)
function parcellesAObjectif(f) {
  if (f.parcellesObjectif) return f.parcellesObjectif;
  const pl = planDe(f), own = Object.keys(f.cases).map(k => k.split(',').map(Number));
  const dist = u => Math.min(...casesDe(pl, u).map(([x, y]) => Math.min(...own.map(([a, b]) => Math.hypot(x - a, y - b)))));
  const cand = pl.unites.map((_, u) => u).filter(u => !f.parcelles[u]).map(u => [dist(u), u]).sort((a, b) => a[0] - b[0]).map(([, u]) => u), out = {};
  OBJ_PARCELLES.forEach((o, i) => { const u = cand[i * 2 + 1] ?? cand[i]; if (u != null && out[u] == null) out[u] = o.id; });
  return (f.parcellesObjectif = out);
}
function debloquerParcelles() {
  for (const f of S.fermes) {
    for (const [u, id] of Object.entries(parcellesAObjectif(f))) {
      const o = OBJ_PARCELLES.find(x => x.id === id);
      if (f.parcelles[u] || !o || !S.objectifs[o.id]) continue;
      ajouterParcelle(f, +u);
      if (f === F() && !document.hidden && install.hidden) {
        Rendu.integrer(+u);
        Meca.bandeau('Champ débloqué', `${surfaceTexte(surfaceUnite(f, +u))} · ${o.txt}`);
        const c = centreDe(casesDe(planDe(f), +u))(); Anim.confettis(c.x, c.y, 70, true);
      }
    }
  }
}
function ajouterParcelle(f, u) {
  f.parcelles[u] = Object.keys(f.parcelles).length + 1;   // son numéro : l'ordre d'entrée dans l'exploitation
  for (const [x, y] of casesDe(planDe(f), u)) f.cases[cle(x, y)] = nouvelleCase(f);
}
// Les champs les plus proches de la ferme, jusqu'à la surface de départ
function champsDeDepart(f) {
  const pl = planDe(f), [fx, fy] = pl.ferme, but = MODES[f.mode].echelle === 'champs' ? 12 : 0.15;
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
  Object.assign(f, { lieu: lieuId, graine: L.graine, histo: [], neigeSol: 0, climatAn: {}, sec: 0, lots: {} });
  if (mode !== 'gc') f.modeAvant = 'gc';            // en 1959, la terre sort d'une culture classique : transition
  S.fermes.push(f); S.active = S.fermes.length - 1;
  for (const u of champsDeDepart(f)) ajouterParcelle(f, u);
  parcellesAObjectif(f);
  f.moDepart = etatSol(f).mo;
  const ha = Object.keys(f.cases).length * MODES[mode].caseHa;
  S.argent += mode === 'mar' ? 4000 : ha * 900;
  return f;
}
const surfaceTexte = ha => ha >= 1 ? nf(ha, ha < 10 ? 1 : 0) + ' ha' : nf(ha * 10000) + ' m²';
function sauver() { if (!S) return; try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } }
function charger() {
  try {
    for (const k of ['squid-ferme-3', 'squid-ferme-4', 'squid-ferme-5']) localStorage.removeItem(k);   // parties des clés précédentes : on repart de zéro
    const t = localStorage.getItem(CLE);
    if (t) {
      const s = JSON.parse(t);
      if (s.v === 6 && s.fermes?.length && s.fermes.every(f => f.graine)) {
        for (const f of s.fermes) f.lieu = lieuDe(f.region, f.graine);
        // Irrigation et engrais se décident maintenant champ par champ ; les parcelles reçoivent leur numéro
        for (const f of s.fermes) { let n = 0; for (const u in f.parcelles) if (f.parcelles[u] === true) f.parcelles[u] = ++n; f.irrigation = false; f.ferti = 'moderee'; }
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
    const murAvant = active && Object.values(f.cases).some(c => c.cult && c.p >= 1);
    const ev = journeeFerme(f, S.jour, m);
    if (active && ev.murs.size) {
      // le temps ralentit quand une récolte arrive, pour ne pas la manquer
      if (!murAvant && S.vitesse > 3) { S.vitesse = 1; toast(`${majuscule(nom(ev.murs))} : c’est mûr, le temps ralentit.`); }
      if (S.guide === 2) S.guide = 3;
    }
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
    }
    // Sécheresse visible : réserve moyenne du sol
    const sol = etatSol(f); f.sec = d.mois >= 5 && d.mois <= 10 ? clamp((0.42 - sol.r / sol.ru) / 0.3, 0, 1) : 0;
  });
  Meca.unJour();
  // Coup de pouce : sans culture en terre, sans rien à vendre ni de quoi acheter des semences, la coopérative avance de quoi repartir (une fois par an)
  if (d.jour === 1 && S.argent < 1000 && S.avanceAn !== d.an && !Object.values(F().cases).some(c => c.cult) && !Object.keys(F().lots).length) {
    S.avanceAn = d.an; S.argent += 2500;
    toast('La coopérative vous avance 2 500 € de semences.');
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
  return i < 0 ? `${CULTURE[id].nom} ne se cultive pas dans ce mode.` : `${CULTURE[id].nom} : au niveau ${Math.max(2, Math.ceil((i - 4) / 2) + 1)}. Vendez vos récoltes pour gagner de l’expérience.`;
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
  if (f === F()) Rendu.animerChamp(semees, 'semis', machinePour(f, c, 'semis'), null);
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
// Récolte d'un champ : la machine passe, la récolte rejoint le stock de la ferme à son arrivée
function recolterChamp(f, u, seulement, retard = 0) {
  const pl = planDe(f), cases = (seulement || casesDe(pl, u)).filter(([x, y]) => { const c = f.cases[cle(x, y)]; return c?.cult && c.p >= 1; });
  if (!cases.length) return 0;
  const visible = f === F() && !document.hidden && install.hidden;
  const avant = new Map(), recs = [], groupes = new Map();
  for (const [x, y] of cases) {
    const k = cle(x, y), t = f.cases[k];
    avant.set(k, { c: CULTURE[t.cult], p: t.p, v: (hasard(x, y, 1) * 3) | 0, pourri: t.mur > 12 });
    const r = recolter(f, t, S.jour);
    avant.get(k).kg = r.kg;
    recs.push({ x, y, r });
    const gr = groupes.get(r.c.id) || { c: r.c, kg: 0, kcal: 0, ha: 0, n: 0 };
    gr.kg += r.kg; gr.kcal += r.kcal; gr.ha += r.ha; gr.n++; groupes.set(r.c.id, gr);
  }
  const an = dateDe(S.jour).an, rec = ((f.stats.recAn ??= {})[an] ??= {}), caseHa = MODES[f.mode].caseHa;
  let kgTot = 0;
  for (const gr of groupes.values()) {
    const q = rec[gr.c.id] ??= { kg: 0, kcal: 0, ha: 0 };
    q.kg += gr.kg; q.kcal += gr.kcal; q.ha += gr.n * caseHa;
    Meca.noterRecolte(gr.c, gr.ha / gr.n); Meca.ajouterLot(f, gr.c, gr.kg, visible);
    kgTot += gr.kg;
  }
  recolteChangee();
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
  for (const k in f.cases) { const t = f.cases[k]; if (t.cult && t.p >= 1) { const [x, y] = k.split(',').map(Number); unites.add(pl.unite[y * pl.w + x]); } }
  if (!unites.size) { toast('Rien n’est mûr pour l’instant.'); return; }
  let i = 0;
  for (const u of unites) recolterChamp(f, u, null, i++ * 280);
  if (S.guide === 3) S.guide = 4;
  apresAction(true);
}
function arracher(f, t) { if (!t.cult) return false; Object.assign(t, { cult: null, p: 0, dj: 0, mur: 0 }); return true; }
function acheter(u) {
  const f = F(), prix = prixParcelle(f, u);
  if (!achetable(f, u)) { const o = OBJ_PARCELLES.find(x => x.id === parcellesAObjectif(f)[u]); if (o) toast(`Ce champ se débloque avec un objectif : ${o.txt.toLowerCase()}.`); return; }
  if (S.argent < prix) { toast(`Il vous faut ${euros(prix)}.`); return; }
  S.argent -= prix; f.achats++;
  ajouterParcelle(f, u);
  Rendu.integrer(u);
  const centre = centreDe(casesDe(planDe(f), u))();
  Anim.confettis(centre.x, centre.y, 70, true); Anim.texte(centre, 'Champ acheté', '#ffe08a');
  selectionner(null);
  apresAction(true);
}

// ---------- Champ : souris et doigt ----------
const ecran = document.getElementById('ecran');
Rendu.init(ecran);
let outil = { id: 'ble' }, selection = null;   // outil : la semence choisie dans l'onglet Semences
const attente = { kg: 0, kcal: 0, parC: {} };
function selectionner(s) { selection = s; Rendu.selection = s; majVolante(); }

// Curseur en pixels : la pièce pour acheter
const CURSEURS = (() => {
  const fab = (dessin, hx, hy) => {
    const c = document.createElement('canvas'); c.width = c.height = 16; dessin(c.getContext('2d'));
    const d = document.createElement('canvas'); d.width = d.height = 32;
    const g = d.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, 32, 32);
    return `-webkit-image-set(url(${d.toDataURL()}) 2x) ${hx} ${hy}, pointer`;
  };
  return {
    piece: fab(g => { disque(g, 8, 8, 6, '#7a5a10'); disque(g, 8, 8, 5, '#f2c240'); disque(g, 7, 7, 3, '#f8d870'); R(g, 7, 5, 1, 6, '#b8861a'); R(g, 6, 6, 4, 1, '#b8861a'); R(g, 6, 9, 4, 1, '#b8861a'); }, 8, 8),
  };
})();
let curseur = '';
function majCurseur(tx, ty) {
  const f = F(), p = parcelleDe(tx, ty);
  let c = 'default';
  if (surLaFerme(tx, ty)) c = 'pointer';
  else if (p && f.parcelles[p.u]) c = 'pointer';
  else if (p) c = CURSEURS.piece;
  if (c === 'default') c = 'grab';
  if (c !== curseur || ecran.style.cursor !== c) { curseur = c; ecran.style.cursor = c; }
}

let peinture = false, derniere = null, depart = null;
const surLaFerme = (tx, ty) => { const pl = planDe(F()); return typeCase(pl, tx, ty) === 'm' || (MODES[F().mode].echelle === 'planches' && typeCase(pl, tx, ty) === 'b'); };
// Option + glisser : sème la semence choisie
function appliquer(tx, ty, premier) {
  const f = F(), p = parcelleDe(tx, ty);
  if (surLaFerme(tx, ty) || !p || !f.parcelles[p.u]) return false;
  const fait = MODES[f.mode].echelle === 'champs' && premier ? semerChamp(f, p.u, outil.id) : semerCase(f, cle(tx, ty), outil.id, premier, tx, ty);
  if (fait) apresAction(false);
  return fait;
}
// Un clic ouvre la fenêtre du champ ; un clic sur la ferme ouvre la récolte
function cliquerCarte(tx, ty) {
  if (surLaFerme(tx, ty)) { ouvrirOnglet('recolte'); return; }
  const p = parcelleDe(tx, ty);
  if (p) selectionner({ type: 'parcelle', u: p.u });
}
// Le plateau est en 3D (rendu.js) : glisser fait tourner la vue, un clic sans glisser désigne le champ visé
// (lancer de rayon jusqu'au sol), Option + glisser sème case par case.
Rendu.quandClic = s => { Rendu.onde(s.px, s.py); cliquerCarte(s.tx, s.ty); };
Rendu.quandPeint = (s, e, premier) => {
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
const chiffres = (ha, c) => `${nf(ha * 10, 0)} q/ha · ${nf(ha * c.kcal / 100, 1)} Mkcal/ha`;
function blocSol(f, t) {
  const ru = ruMax(f, t), barre = (v, max, c) => `<i><b style="width:${Math.round(clamp(v / max, 0, 1) * 100)}%;background:${c}"></b></i>`;
  return `<div class="sol"><span>Eau du sol</span>${barre(t.r, ru, '#4f9fdc')}<span>${nf(t.r)} / ${nf(ru)} mm</span>`
    + `<span>Azote minéral</span>${barre(t.nmin, 120, '#6fb85a')}<span>${nf(t.nmin)} kg N/ha</span>`
    + `<span>Vie du sol</span>${barre(t.vdt, 100, '#c08a52')}<span>vers ${nf(t.vdt)}/100 · MO ${nf(t.mo, 1)} %</span></div>`;
}
function descriptionCase(f, t) {
  if (!t.cult) return `<b>${MODES[f.mode].couvert ? 'Couvert végétal' : 'Terre nue'}</b>${t.fam ? `<br>Précédent : ${t.fam}` : ''}${blocSol(f, t)}`;
  const c = CULTURE[t.cult], r = rendement(f, t, S.jour);
  const etat = t.p >= 1 ? (t.mur > 12 ? '<span class="mauvais">Trop mûr, se perd</span>' : '<span class="bon">Mûr</span>')
    : `Développement ${nf(t.p * 100)} % (${nf(t.dj)} / ${nf(c.dj)} °C·j)`;
  if (t.p < 0.15) return `<b>${c.nom}</b><br>${etat}<br>Référence ${chiffres(c.rdt, c)}${blocSol(f, t)}`;
  let html = `<b>${c.nom}</b><br>${etat}<br>Prévu ≈ <b>${nf(r.ha * 10, 0)} q/ha</b> · ${nf(r.ha * c.kcal / 100, 1)} Mkcal/ha`;
  const freins = [['eau', r.eau], ['azote', r.azote], ['gel', r.gel], ['chaleur', r.chaleur], ['ombre des arbres', r.ombre], ['transition', r.trans]].filter(([, v]) => v < 0.97);
  if (freins.length) html += `<br><span class="mauvais">Pertes : ${freins.map(([n, v]) => `${n} −${nf((1 - v) * 100)} %`).join(', ')}</span>`;
  if (t.rot < 1) html += '<br><span class="mauvais">Même famille qu’avant : −12 %</span>';
  if (t.rot > 1) html += '<br><span class="bon">Après une légumineuse : +5 %</span>';
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
  // la bulle ne nomme que les cultures et les bêtes : rien sur la ferme, les routes, les chemins, les bois ou les haies
  const f = F(), p = parcelleDe(tx, ty), bete = Rendu.animalSous(e);
  let html = '';
  if (window.SF3D && SF3D.modeCommentaire) { const h = Rendu.objetSous(e.clientX, e.clientY); html = h ? `<b>${Rendu.nommer(h).libelle}</b>` : ''; }
  else if (bete) html = `<b>${bete[0]}</b><br>${bete[1]}`;
  else if (surLaFerme(tx, ty)) html = '';
  else if (p && f.parcelles[p.u]) html = descriptionCase(f, f.cases[cle(tx, ty)]);
  else if (p) { const o = OBJ_PARCELLES.find(x => x.id === parcellesAObjectif(f)[p.u]); html = `${descriptionVoisin(f, p.u)}<br>${o ? `À débloquer : ${o.court}` : `À vendre : ${euros(prixParcelle(f, p.u))}`}`; }
  if (!html) { bulle.hidden = true; return; }
  bulle.innerHTML = html; bulle.hidden = false;
  bulle.style.left = Math.min(e.clientX + 16, innerWidth - bulle.offsetWidth - 8) + 'px';
  bulle.style.top = Math.min(e.clientY + 16, innerHeight - bulle.offsetHeight - 8) + 'px';
}

// ---------- Fiche d'une parcelle : fenêtre volante et onglet Parcelles ----------
const volante = document.getElementById('volante');
// Un champ résumé : moyennes de ses cases, culture majoritaire
function etatParcelle(f, u) {
  const cases = casesDe(planDe(f), u).map(([x, y]) => f.cases[cle(x, y)]).filter(Boolean);
  const moy = (L, g) => L.reduce((s, t) => s + g(t), 0) / (L.length || 1), compte = {};
  for (const t of cases) if (t.cult) compte[t.cult] = (compte[t.cult] || 0) + 1;
  const id = Object.keys(compte).sort((a, b) => compte[b] - compte[a])[0], c = id ? CULTURE[id] : null, en = cases.filter(t => t.cult === id);
  return { cases, c, ha: surfaceUnite(f, u), num: f.parcelles[u], ru: moy(cases, t => ruMax(f, t)), eau: moy(cases, t => t.r), azote: moy(cases, t => t.nmin), vers: moy(cases, t => t.vdt), mo: moy(cases, t => t.mo),
    dj: moy(en, t => t.dj), vern: en.every(t => t.vern), pretes: cases.filter(t => t.cult && t.p >= 1).length,
    stress: moy(en, t => { const m = 0.5 * ruMax(f, t); return t.r >= m ? 0 : 100 * (1 - clamp(t.r / m, 0, 1)); }) };   // le Ks de FAO 56 du moteur (agronomie.js)
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
function joursDeMaturite(f, c, dj0, vern0, jour = S.jour) {
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
      if (dj >= c.dj) { sorties.push(jour + d); break; }
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
function corpsFiche(f, u, e) {
  const c = e.c, mode = MODES[f.mode];
  const sol = '<h4>Sol</h4>' + mesure('Eau', e.eau / e.ru * 100, `${nf(e.eau)} / ${nf(e.ru)} mm`, 'var(--humide)') + mesure('Azote', e.azote / 1.2, `${nf(e.azote)} kg/ha`, 'var(--accent)')
    + mesure('Vers de terre', e.vers, `${nf(e.vers)} /100`, 'var(--or)') + mesure('Matière organique', e.mo * 25, `${nf(e.mo, 1)} %`, 'var(--sec)');
  const act = `<div class="actions"><button data-p="irriguer" data-u="${u}"${mode.irrigation && e.eau < e.ru - 1 ? '' : ' disabled'}>Irriguer · 25 mm</button><button data-p="apport" data-u="${u}"${mode.fertilisation.startsWith('minéral') ? '' : ' disabled'}>Apport · 40 kg N</button><button class="large2" data-p="fumier" data-u="${u}">Fumier ou compost · 30 t/ha</button></div>`;
  if (!c) return `<div class="fiche">${sol}${act}<div class="prevue"><button class="recolter" data-p="semer" data-u="${u}">Semer : ${CULTURE[outil.id].nom}</button></div></div>`;
  const prev = e.pretes ? '' : `<p>${textePrevision(intervalleRecolte(joursDeMaturite(f, c, e.dj, e.vern)))}</p>`;
  return `<div class="fiche">${sol}<h4>${c.nom}</h4>${mesure('Degrés-jours', e.dj / c.dj * 100, `${nf(Math.min(e.dj, c.dj))} / ${nf(c.dj)} °C·j`, 'var(--accent)')}${mesure('Stress hydrique', e.stress, e.stress >= 50 ? 'fort' : e.stress >= 20 ? 'léger' : 'aucun', e.stress >= 50 ? 'var(--mauvais)' : e.stress >= 20 ? 'var(--sec)' : 'var(--bon)')}
    ${act}<div class="prevue">${prev}<div class="fin-fiche"><button class="recolter" data-p="recolter" data-u="${u}"${e.pretes ? '' : ' disabled'}>Récolter</button><button class="arracher" data-p="arracher" data-u="${u}">Arracher</button></div></div></div>`;
}
const enteteVolante = (titre, sous) => `<header><b>${titre}</b><span>${sous}</span><button class="fermer" data-fermer="1" aria-label="Fermer">×</button></header>`;
function ficheVoisin(f, u) {
  const o = OBJ_PARCELLES.find(x => x.id === parcellesAObjectif(f)[u]), prix = prixParcelle(f, u), un = planDe(f).unites[u];
  const nomCode = code => { const c = RPG_CULTURE[code]; return c ? CULTURE[c].nom.toLowerCase() : RPG_HERBE.includes(code) ? 'prairie' : 'autre'; };
  const histo = un.rot ? (new Set(un.rot).size > 1 ? un.rot.map(nomCode).join(' → ') : '') : Object.entries(un.rpg).map(([an, code]) => `${an} ${nomCode(code)}`).join(' · ');
  return `<div class="fiche"><p>${ligneVoisin(f, u)}</p>${histo ? `<p class="ligne2">${un.rot ? 'Rotation du voisin' : 'Cultures déclarées'} : ${histo}</p>` : ''}
    ${o ? `<p class="ligne2">Il rejoint votre exploitation quand cet objectif est atteint : <b>${o.txt.toLowerCase()}</b>.</p>` : `<div class="prevue"><button class="recolter" data-action="acheter" ${S.argent < prix ? 'disabled' : ''}>Acheter pour ${euros(prix)}</button></div>`}</div>`;
}
function majVolante() {
  if (!selection || !S) { volante.hidden = true; return; }
  const f = F(), u = selection.u, haut = volante.scrollTop;
  if (f.parcelles[u]) {
    const e = etatParcelle(f, u);
    volante.innerHTML = enteteVolante(`Parcelle ${e.num}`, `${e.c ? e.c.nom : 'Terre nue'} · ${surfaceTexte(e.ha)}`) + corpsFiche(f, u, e);
  } else volante.innerHTML = enteteVolante('Champ voisin', surfaceTexte(surfaceUnite(f, u))) + ficheVoisin(f, u);
  volante.hidden = false; volante.scrollTop = haut;
}
// Doses par clic. Tarifs du moteur (agronomie.js) : engrais 1,2 €/kg N, fumier 400 €/ha ; un fumier à 30 t/ha : +0,07 point de matière organique, ≈ 25 kg d'azote disponible
function agir(quoi, u) {
  const f = F(), ha = surfaceUnite(f, u), cases = casesDe(planDe(f), u).map(([x, y]) => f.cases[cle(x, y)]).filter(Boolean);
  const payer = eur => { if (S.argent < eur) { toast(`Il vous faut ${euros(eur)}.`); return false; } S.argent -= eur; return true; };
  if (quoi === 'irriguer') { for (const t of cases) t.r = Math.min(ruMax(f, t), t.r + 25); f.stats.eau += 250 * ha; }
  else if (quoi === 'apport') { if (!payer(48 * ha)) return; for (const t of cases) t.nmin += 40; }
  else if (quoi === 'fumier') { if (!payer(400 * ha)) return; for (const t of cases) { t.mo += 0.07; t.nmin += 25; t.vdt = Math.min(100, t.vdt + 5); t.fum = 25; } }
  else if (quoi === 'semer') { if (!semerChamp(f, u, outil.id)) return; }
  else if (quoi === 'recolter') { if (!recolterChamp(f, u)) return; if (S.guide === 3) S.guide = 4; }
  else if (quoi === 'arracher') { for (const t of cases) arracher(f, t); Rendu.jourVu = -1; }
  apresAction(true);
}
function commandeParcelle(ev) {
  const b = ev.target.closest('button'); if (!b || b.disabled) return false;
  if (b.dataset.fermer) { selectionner(null); return true; }
  if (b.dataset.action === 'acheter' && selection) { acheter(selection.u); return true; }
  if (b.dataset.p) { agir(b.dataset.p, +b.dataset.u); return true; }
  return false;
}
volante.addEventListener('click', commandeParcelle);

let toastMinuteur = 0;
function toast(txt) {
  const el = document.getElementById('toast');
  el.textContent = txt; el.classList.remove('visible'); void el.offsetWidth; el.classList.add('visible');
  clearTimeout(toastMinuteur); toastMinuteur = setTimeout(() => el.classList.remove('visible'), 2800);
}

// ---------- Barre du haut ----------
const iconeMet = document.getElementById('icone-meteo').getContext('2d');
let dateVue = '';
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
  if (e.code === 'Space' && !e.target.closest('input, textarea, button')) { e.preventDefault(); regler(S.vitesse ? 0 : 1); }
});
document.getElementById('niveau').addEventListener('click', () => ouvrirOnglet('objectifs'));

// Choix de la ferme
const menuFermes = document.getElementById('menu-fermes');
document.getElementById('choix-ferme').addEventListener('click', () => {
  const peutCreer = S.fermes.every(pleine);
  menuFermes.innerHTML = S.fermes.map((f, i) => `<button data-ferme="${i}" ${i === S.active ? 'aria-current="true"' : ''}>Ferme ${i + 1} · ${MODES[f.mode].court}<span>${masse(f.stats.kg)}</span></button>`).join('')
    + `<button data-ferme="nouvelle" ${peutCreer ? '' : 'disabled'}>Nouvelle ferme${peutCreer ? '' : '<span>quand toutes les parcelles sont achetées</span>'}</button>`
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
// Semence par défaut : une culture ouverte qui se sème maintenant
function outilParDefaut() {
  const f = F(), dispo = culturesDebloquees(f.mode), mois = dateDe(S.jour).mois, semable = id => CULTURE[id].semis.includes(mois);
  if (!dispo.includes(outil.id) || !semable(outil.id)) {
    outil = { id: dispo.find(semable) || (dispo.includes(outil.id) ? outil.id : dispo[0]) };
  }
}
function choisirSemence(id) {
  const c = CULTURE[id], mois = dateDe(S.jour).mois;
  outil = { id }; majVolante();
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
  const g = cv.getContext('2d'), planches = S && MODES[F().mode].echelle === 'planches';
  g.clearRect(0, 0, cv.width, cv.height);
  terre(g, 0, 0, 3, 3, { mo: 2.5, sec: 0, chaume: 0 }, planches ? 'planches' : 'champs');
  dessinerPlante(g, 0, 6, c, STADE_ICONE[c.forme] ?? 1, 1, 0, false);
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
  objectifs: () => '<h3>Objectifs</h3>' + OBJ_PARCELLES.map(o => {
    const fait = S.objectifs[o.id];
    return `<div class="objectif${fait ? ' fait' : ''}"><span class="boite">${fait ? '✓' : ''}</span><p>${o.txt}</p><small>${fait ? 'champ débloqué' : 'débloque un champ'}</small></div>`;
  }).join(''),
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
    const bientot = ordreMode(f.mode).slice(nbDebloquees(S.exp), nbDebloquees(S.exp) + 2).map(id => CULTURE[id]);
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
      const e = etats[i], p = pastille(e), ouverte = parcelleOuverte === u;
      return `<div class="parcelle"><button data-ouvre="${u}" aria-expanded="${ouverte}"><b>Parcelle ${e.num}</b><span>${e.c ? e.c.nom : '—'} · ${surfaceTexte(e.ha)}</span><i class="etat ${p.cls}">${p.txt}</i></button>${ouverte ? corpsFiche(f, u, e) : ''}</div>`;
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
    if (s.classList.contains('verrou')) { toast(messageVerrou(F(), s.dataset.semence)); Compteur.rebond(s, 'non'); return; }
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
// Un objectif atteint le reste, et fait entrer son champ dans l'exploitation
function verifierObjectifs() {
  for (const o of OBJ_PARCELLES) {
    if (S.objectifs[o.id] || !o.ok()) continue;
    S.objectifs[o.id] = true;
    if (onglet === 'objectifs') ongletSale = true;
  }
  debloquerParcelles();
}

// ---------- Installation : région, graine, manière de cultiver ----------
// La carte se tire d'une graine (js/carte.js) : la même graine, dans la même région, redonne la même carte partout.
const install = document.getElementById('installation');
const REGIONS_JOUABLES = REGIONS.filter(r => r.id !== 'monchy');   // Monchy : maille de l'ancien lieu réel, doublon de l'Artois
// Plus de choix de la manière de cultiver à l'installation (demande du 07/11) : on s'installe en grande culture ;
// mêler maraîchage, permaculture et grande culture sur une même ferme se fera dans le jeu.
let choixRegion = 'artois', choixGraine = Carte.nouvelleGraine(), choixMode = 'gc';
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
  const r = REGIONS.find(x => x.id === choixRegion), id = lieuDe(choixRegion, choixGraine), L = LIEUX[id], m = MODES[choixMode], pl = L[m.echelle];
  for (const g of document.querySelectorAll('#carte-france .lieu')) { const a = g.dataset.lieu === choixRegion; g.classList.toggle('actif', a); if (a) g.parentNode.appendChild(g); }
  $i('i-nom').textContent = L.nom;
  $i('i-ligne').textContent = `${r.nom} (${r.ville}) · ${r.sol} · ${m.echelle === 'champs' ? `${pl.unites.length} champs sur 1,6 × 1,2 km` : `${pl.unites.length} lots de planches sur 320 × 240 m`}`;
  if (document.activeElement !== $i('i-graine')) $i('i-graine').value = choixGraine;
  Carte.apercu($i('i-apercu'), pl, { depart: new Set(champsDeDepart({ lieu: id, mode: choixMode })) });
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
  if (neuve) { S = { v: 6, jour: DEBUT(), vitesse: 1, argent: 0, fermes: [], active: 0, objectifs: {} }; Meca.completer(S); }
  const f = creerFerme(lieuDe(choixRegion, choixGraine), choixMode);
  f.meteo = Climat.jour(f.region, S.jour);
  install.hidden = true; bouton.disabled = false;
  selectionner(null);
  demarrer();
});

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
    }
    if (t - derniereSauvegarde > 20000) { derniereSauvegarde = t; sauver(); }
    // plus rien en vol : les compteurs affichés rejoignent les vrais (au cas où une arrivée se serait perdue)
    if (!Anim.effets.length && !Anim.enRetard && !Rendu.transportEnCours() && (attente.kg || attente.kcal || Meca.attente.exp)) { attente.kg = attente.kcal = 0; attente.parC = {}; Meca.attente.exp = 0; recolteChangee(); Meca.majNiveau(false); }
    // 60 images par seconde quand quelque chose bouge vite (geste, machine, effet), 20 au calme : le Mac reste frais
    const vif = Rendu.revel.size || Rendu.parts.length || Rendu.ondes.length || Anim.effets.length || Rendu.bouge();
    if (vif || t - dernierRendu > (Rendu.calme() ? 48 : 30)) { Rendu.dessiner(t, t - dernierRendu); dernierRendu = t; }
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
