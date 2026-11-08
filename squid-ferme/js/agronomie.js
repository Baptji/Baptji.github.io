'use strict';
/* Pousse des cultures et vie du sol, jour par jour, à l'hectare (la surface d'une case ne change que les tonnes).
   - Développement : degrés-jours au-dessus de la base de la culture.
   - Eau : réserve utile remplie par la pluie et l'irrigation, vidée par Kc × ETP (FAO 56) ; stress quand la
     réserve passe sous la moitié ; rendement selon 1 − Y/Ymax = Ky (1 − ETr/ETc) (FAO 33).
   - Gel et échaudage aux stades sensibles.
   - Azote : minéralisation de la matière organique (plus rapide au chaud et à l'humide), engrais, fumier,
     compost, résidus, fixation des légumineuses, lessivage par l'eau qui draine. Réponse de Mitscherlich.
   - Sol : matière organique, réserve utile (érosion, matière organique), vers de terre.
   - Le mode de culture est porté par chaque case (t.mode). En cultures associées, la case a un second créneau (t.b) :
     deux cultures sur des rangs alternés, chacune sur la moitié de la surface, même sol, même eau, même azote. */

const BESOIN_KCAL = 2500;                         // kcal par personne et par jour
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const MULT_FERTI = { aucune: 0, moderee: 0.6, forte: 1.0 };
const N_HUMUS = 0.125;                            // kg N/ha/jour par point de MO à 12 °C, pour kMO = 0,015 (entre [10] et l'ancienne valeur, tranché le 8/11)
const N_COUVERTS = 50, ANS_COUVERTS = 60;         // couverts répétés : montée vers +50 kg N/ha/an sur soixante ans [22]
const K_RESIDUS = 1 - Math.pow(0.2, 1 / 56);      // azote des résidus de légumes : 80 % en huit semaines [38]
const N_RESIDUS = { epinard: 40, celeri: 40, choufleur: 100, chou: 200 };   // kg N/ha [37]
// Apports de 30 t/ha : matière organique (point), azote (kg N/t) et part disponible la première année [31] ; prix du jeu en €/ha
const APPORTS = { fumier: { mo: 0.05, N: 5.8, keq: 0.25, eur: 400 }, compost: { mo: 0.05, N: 6.5, keq: 0.10, eur: 1500 } };

function nouvelleFerme(regionId) {
  return {
    id: 'f' + Math.random().toString(36).slice(2, 8), region: regionId,
    parcelles: {}, cases: {}, irrigation: false, ferti: 'moderee',
    stats: { kg: 0, kcal: 0, recoltes: 0, eau: 0, bois: 0, parCulture: {}, parAn: {} },
    solAns: [],
  };
}

function nouvelleCase(f) {
  const r = REGIONS.find(x => x.id === f.region), v = () => 0.94 + Math.random() * 0.12;
  const ru = r.ru * v(), mo = r.mo * v();
  return { mo, mo0: mo, ruSol: ru, ruBase: ru, r: r.ru * 0.8, nmin: 40, vdt: 30, erosion: 0, mode: 'gc', modeDepuis: 0, modeAvant: null,
    cult: null, p: 0, dj: 0, etc: 0, etr: 0, nabs: 0, dgel: 0, dch: 0, mur: 0, fam: null, rot: 1, al: 1, apport2: false, fum: 0 };
}
// Les créneaux d'une case : elle-même et, en cultures associées, ses rangs pairs
const creneaux = t => t.b ? [t, t.b] : [t];
const creneauVide = () => ({ cult: null, p: 0, dj: 0, etc: 0, etr: 0, nabs: 0, dgel: 0, dch: 0, mur: 0, rot: 1, al: 1, apport2: false });
const nouveauBilan = () => ({ minMO: 0, minN: 0, compostMO: 0, compostN: 0, fumierMO: 0, fumierN: 0, resMO: 0, resN: 0, couvMO: 0 });
const bilanDe = t => (t.bilan ??= nouveauBilan());

const ruMax = (f, t) => t.ruSol * clamp(1 + 0.06 * (t.mo - REGIONS.find(x => x.id === f.region).mo), 0.7, 1.5);
const ageArbres = (t, j) => MODES[t.mode].arbres ? (j - t.modeDepuis) / 365 : 0;
// Rapport de surface équivalente : cycles sans mois de semis commun 1,15 ; même premier mois de semis 0,90 [43] ; entre les deux 1,08 [44]
function ler(a, b) {
  if (!b) return 1;
  if (!a.semis.some(m => b.semis.includes(m))) return 1.15;
  return a.semis[0] === b.semis[0] ? 0.90 : 1.08;
}
const partAssoc = (t, c, s) => MODES[t.mode].assoc ? (s.associe ? ler(c, CULTURE[s.associe]) : 1) / 2 : 1;
const potentielHa = (t, c, s = t) => c.rdt * 1.3 * MODES[t.mode].potentiel * partAssoc(t, c, s);
// Cultures installées (vivaces) : but de degrés-jours du cycle en cours, part de l'année que vaut cette coupe, montée en production
const djCible = (c, t) => c.vivace?.repousse && t.coupe ? c.vivace.repousse : c.dj;
const partCycle = (c, t) => c.vivace?.coupes ? c.vivace.coupes[Math.min(t.coupe || 0, c.vivace.coupes.length - 1)] : 1;
const monteeVivace = (c, t) => { if (!c.vivace || !t.inst) return 1; const m = c.vivace.montee; return m[Math.min(t.inst.ans, m.length - 1)]; };
const vieTiree = c => c.vivace?.ans ? c.vivace.ans[0] + Math.floor(Math.random() * (c.vivace.ans[1] - c.vivace.ans[0] + 1)) : null;
// Fin d'une culture installée : la parcelle redevient libre
function finirInstallee(t, c, ev) {
  if (ev) ev.finies.add(c.id);
  if (c.leg) t.nmin += 35;
  Object.assign(t, { cult: null, p: 0, dj: 0, mur: 0, inst: null, coupe: 0, dort: false, fauche: null, fam: c.famille, prec: c.id, chaume: null });
}

function transition(t, j) {
  const tr = MODES[t.mode].transition, ans = (j - t.modeDepuis) / 365;
  if (!t.modeAvant || ans >= tr.ans) return 1;
  return 1 - tr.perte * (1 - ans / tr.ans);
}

// Une journée de culture sur un créneau s (la case t elle-même, ou ses rangs pairs). part : surface occupée dans la case.
function pousser(f, t, s, c, x, ev, part) {
  const { mode, m, tmoy, mois, etp, tmaxCulture, rm, mult, j } = x;
  const p = s.p, kc = p < 0.15 ? 0.4 : p < 0.4 ? 0.4 + (c.kc - 0.4) * (p - 0.15) / 0.25 : p < 0.8 ? c.kc : Math.max(0.35, c.kc - (c.kc - 0.35) * (p - 0.8) / 0.2);
  const etcJ = kc * etp * (1 - 0.1 * mode.couverture);        // −5 %/10 % couverts [13] sur l'évaporation du sol, ≈ 20 % de l'ETc
  const ks = t.r >= 0.5 * rm ? 1 : clamp(t.r / (0.5 * rm), 0, 1);
  const etrJ = Math.min(t.r, etcJ * ks);
  t.r -= Math.min(t.r, etrJ * part);
  if (s.p < 1 && !s.dort) {
    s.etc += etcJ; s.etr += etrJ;
    // Développement
    const avant = s.p;
    s.dj += Math.max(0, Math.min(tmoy, 30) - c.tb);
    // Cultures d'hiver : pas de montaison avant d'avoir passé l'hiver (vernalisation) : au plus la moitié du cycle
    // tant que la culture n'a pas vu le mois de février
    if (c.hiver) { if (mois >= 2 && mois <= 6) s.vern = true; if (!s.vern) s.dj = Math.min(s.dj, c.dj * 0.5); }
    if (c.vivace?.finHiver) {
      // Récolte de février à avril, sur tiges sèches : ce qui a poussé jusqu'à l'hiver fait le rendement
      s.dj = Math.min(s.dj, c.dj);
      if (mois === 12 || mois === 1) s.vern = true;
      const pret = s.vern && mois >= 2 && mois <= 4;
      if (pret && s.p < 1) s.fdj = clamp(s.dj / c.dj, 0.25, 1);
      s.p = pret ? 1 : Math.min(0.99, s.dj / c.dj);
    } else s.p = Math.min(1, s.dj / djCible(c, s));
    // Azote : la culture puise à mesure qu'elle pousse
    const besoin = potentielHa(t, c, s) * partCycle(c, s) * c.npt * (s.p - avant) * 1.1;
    const pris = Math.min(besoin, t.nmin * 0.35);
    t.nmin -= pris; s.nabs += pris;
    if (c.leg && tmoy > 6) s.nabs += (besoin - pris) * 0.9;
    // Second apport d'engrais minéral à la reprise
    if (!s.apport2 && s.p >= 0.3 && !c.leg && mode.fertilisation.startsWith('minéral')) {
      const dose = potentielHa(t, c, s) * partCycle(c, s) * c.npt * 0.55 * mult * (mode.fertilisation === 'minéral' ? 1 : 0.7);
      t.nmin += dose; s.apport2 = true; S.argent -= dose * 1.2 * CASE_HA;
    }
    // Gel et échaudage
    const seuilGel = c.hiver && s.p > 0.6 && s.p < 0.76 ? -2 : c.gel;
    // Une culture installée ne gèle que sur ses jeunes pousses de printemps : le rhizome ou la souche repart
    const gelVise = !c.vivace || (s.p > 0.03 && s.p < 0.85 && (!c.vivace.finHiver || mois <= 6));
    if (gelVise && m.tmin < seuilGel && s.p < 0.97) {
      if (!c.vivace && c.gel >= -1.5 && s.p < 0.45 && m.tmin < seuilGel - 1.5) { ev.geles.add(c.id); Object.assign(s, { cult: null, p: 0, dj: 0, perdu: j }); return; }
      s.dgel = Math.min(1, s.dgel + 0.12 + 0.08 * (seuilGel - m.tmin));
      ev.geles.add(c.id);
    }
    if (s.p > 0.5 && s.p < 0.92 && tmaxCulture > c.chaud) { s.dch = Math.min(0.7, s.dch + 0.025 * (tmaxCulture - c.chaud)); ev.echaudes.add(c.id); }
    if (s.p >= 1) ev.murs.add(c.id);
  } else if (!s.dort) s.mur++;
}

// Un jour pour toute la ferme. m = météo du jour. Rend les événements à noter.
function journeeFerme(f, j, m) {
  const ev = { murs: new Set(), geles: new Set(), echaudes: new Set(), finies: new Set() }, date = dateDe(j);
  const tmoy = (m.tmin + m.tmax) / 2, eau = m.pluie + m.neige;
  const fT = clamp(tmoy / 12, 0, 2);
  const mult = MULT_FERTI[f.ferti], mois = date.mois;
  const x = { m, tmoy, mois, mult, j };
  for (const k in f.cases) {
    const t = f.cases[k], mode = MODES[t.mode]; let c = t.cult ? CULTURE[t.cult] : null; const rm = ruMax(f, t);
    const age = ageArbres(t, j), arbre = clamp(age / 20, 0, 1);
    if (mode.arbres && age >= 50) { f.stats.bois += CASE_HA * 0.5 * 50; t.modeDepuis = j; }   // coupe du bois à 50 ans, puis replantation
    // Cultures à plusieurs coupes : repos de novembre au 1er février, puis une nouvelle saison (sommes de températures comptées du 1er février)
    if (c?.vivace?.coupes) {
      if (date.mois === 2 && date.jour === 1 && t.dort) {
        if (t.inst.rec) t.inst.ans++;
        t.inst.rec = 0;
        if (t.inst.vie && t.inst.ans >= t.inst.vie) { finirInstallee(t, c, ev); c = null; }
        else Object.assign(t, { dort: false, coupe: 0, p: 0, dj: 0, etc: 0, etr: 0, nabs: 0, dgel: 0, dch: 0, mur: 0, apport2: !!c.leg });
      } else if (date.mois === 11 && date.jour === 1 && t.p < 1 && !t.dort) Object.assign(t, { dort: true, p: 0, dj: 0 });
    }
    const cb = t.b?.cult ? CULTURE[t.b.cult] : null;
    const couvre = c || cb ? c?.vivace || (c && t.p > 0.3) || (cb && t.b.p > 0.3) : mode.couvert;
    // Pluie : ruissellement des grosses averses, plus fort sur sol nu et sans vers de terre
    let ruis = 0;
    if (eau > 15) ruis = (eau - 15) * clamp(0.55 - 0.4 * t.vdt / 100 - (couvre ? 0.2 : 0) - mode.couverture * 0.3, 0.05, 0.6);
    if (ruis > 0 && !couvre) {
      const perte = ruis * 0.006 * mode.erosion;
      t.ruSol = Math.max(t.ruBase * 0.5, t.ruSol - perte); t.erosion += perte; t.mo = Math.max(0.5, t.mo - perte * 0.002);
    }
    t.r += eau - ruis;
    // Irrigation automatique quand la réserve baisse
    if (((c && t.p < 1 && !t.dort) || (cb && t.b.p < 1)) && f.irrigation && mode.irrigation) {
      let dose = 0;
      if (mode.irrigation === 'enrouleur' && t.r < 0.5 * rm) dose = 30;
      if (mode.irrigation === 'goutte' && t.r < 0.8 * rm) dose = Math.min(6, 0.8 * rm - t.r);
      t.r += dose; f.stats.eau += dose * 10 * CASE_HA;
    }
    const drainage = Math.max(0, t.r - rm);
    if (drainage > 0) {
      t.nmin -= t.nmin * Math.min(1, drainage / (rm * 0.5)) * 0.4 * (couvre ? 0.3 : 1);
      t.r = rm;
    }
    // Évapotranspiration et développement, créneau par créneau
    if (c || cb) {
      x.mode = mode; x.etp = m.etp * (1 - 0.08 * arbre); x.tmaxCulture = m.tmax - 1.5 * arbre; x.rm = rm;
      const part = t.b ? 0.5 : 1;
      if (c) pousser(f, t, t, c, x, ev, part);
      if (cb) pousser(f, t, t.b, cb, x, ev, part);
      c = t.cult ? CULTURE[t.cult] : null;
    } else {
      // Sol nu ou couvert végétal
      const evap = m.etp * (1 - 0.08 * arbre) * (mode.couvert && tmoy > 5 ? 0.55 : 0.25) * (1 - 0.5 * mode.couverture);
      t.r -= Math.min(t.r, evap * clamp(t.r / rm * 1.5, 0, 1));
    }
    // Vie du sol : minéralisation, humus, vers de terre
    const b = bilanDe(t), fW = clamp(t.r / rm * 1.5, 0.2, 1);
    const nHumus = t.mo * N_HUMUS * (mode.kMO / 0.015) * fT * fW + (mode.couvert ? N_COUVERTS / 365 * clamp((j - t.modeDepuis) / 365 / ANS_COUVERTS, 0, 1) : 0);
    t.nmin += nHumus; b.minN += nHumus;
    if (t.nRes > 0) { const lib = t.nRes * K_RESIDUS; t.nRes -= lib; t.nmin += lib; b.resN += lib; }
    // Sous une culture installée, le sol n'est plus travaillé : on applique le gain net mesuré, sans la perte d'humus du calcul annuel
    const vv = c?.vivace;
    if (vv) { const g = vv.moAn / 365 * clamp((6 - t.mo) / 2, 0, 1); t.mo += g; b.resMO += g; }   // le sol finit par saturer
    else { const perte = t.mo * mode.kMO / 365 * fT; t.mo -= perte; b.minMO += perte; if (mode.moNet) { t.mo += mode.moNet / 365; b.couvMO += mode.moNet / 365; } }
    if (mode.arbres) t.mo += 0.010 / 365 * arbre;               // +0,24 t C/ha/an à maturité [6]
    t.vdt += ((vv ? Math.max(mode.vdtMax, vv.vdt) : mode.vdtMax) - t.vdt) * 0.00028;                    // constante de temps ≈ 10 ans [3]
    if (t.fum > 0) t.fum--;
  }
  return ev;
}

function peutSemer(t, c, mois, m) {
  const mode = MODES[t.mode];
  if (!cultureAutorisee(t.mode, c)) return `${c.nom} ne se cultive pas en ${mode.nom.toLowerCase()}.`;
  if (!c.semis.includes(mois)) return `${c.nom} : semis en ${plages(c.semis)} seulement.`;
  if (m && (m.tmin < -3 || m.neige > 1)) return 'Sol gelé ou sous la neige aujourd’hui.';
  if (S.argent < coutSemis(mode, c) * CASE_HA) return 'Pas assez d’argent pour le semis.';
  return null;
}

// Un apport de 30 t/ha de fumier ou de compost : effet sur le sol, sans le prix
function apporter(t, quoi) {
  const a = APPORTS[quoi], n = 30 * a.N * a.keq, b = bilanDe(t);
  t.mo += a.mo; t.nmin += n; t.fum = 25;
  b[quoi + 'MO'] += a.mo; b[quoi + 'N'] += n;
}

function semer(f, t, c, vie, n = 0) {
  const mode = MODES[t.mode], mult = MULT_FERTI[f.ferti];
  const s = n ? (t.b ??= creneauVide()) : t, autre = n ? t : t.b;
  const precLeg = t.fam === 'fabacée';
  Object.assign(s, { cult: c.id, perdu: null, p: 0, dj: 0, etc: 0, etr: 0, nabs: 0, dgel: 0, dch: 0, mur: 0, apport2: c.leg, vern: false,
    rot: t.fam === c.famille ? 0.88 : precLeg ? 1.05 : 1, al: 0.92 + Math.random() * 0.16, coupe: 0, dort: false, fauche: null, fdj: null,
    inst: c.vivace ? { ans: 0, rec: 0, vie: vie ?? vieTiree(c) } : null, associe: autre?.cult || null });
  if (autre?.cult) autre.associe = c.id;
  S.argent -= coutSemis(mode, c) * CASE_HA;
  const besoin = potentielHa(t, c, s) * partCycle(c, s) * c.npt;
  if (!c.leg && mode.fertilisation.startsWith('minéral')) {
    const dose = besoin * 0.4 * mult * (mode.fertilisation === 'minéral' ? 1 : 0.7);
    t.nmin += dose; S.argent -= dose * 1.2 * CASE_HA;
  }
  // Maraîchage : un fumier par an, au premier semis de l'année
  const an = dateDe(S.jour ?? 0).an;
  if (mode.fertilisation === 'fumier' && t.fumAn !== an) { apporter(t, 'fumier'); t.fumAn = an; S.argent -= APPORTS.fumier.eur * CASE_HA; }
}

// Rendement en t/ha et le détail des facteurs
function rendement(f, t, j, s = t) {
  const c = CULTURE[s.cult], pot = potentielHa(t, c, s) * partCycle(c, s);
  const eau = s.etc > 1 ? clamp(1 - c.ky * (1 - s.etr / s.etc), 0, 1) : 1;
  const ratio = s.nabs / (pot * c.npt * Math.max(s.p, 0.15));   // en cours de route : rapporté à ce qui a poussé
  const azote = c.leg ? 1 : clamp((1 - Math.exp(-3 * ratio)) / (1 - Math.exp(-3)), 0, 1);
  const gel = 1 - s.dgel, chaleur = 1 - s.dch;
  const sol = 1;                                   // les vers de terre jouent sur l'eau et l'azote, pas directement sur le rendement
  const age = ageArbres(t, j), ombre = 1 - clamp((age - 5) / 35, 0, 1) * (c.id === 'mais' || c.id === 'sorgho' ? 0.4 : 0.3);
  const trans = transition(t, j);
  const perte = Math.max(0.2, 1 - Math.max(0, s.mur - 20) * (c.cat === 'Céréales' ? 0.005 : 0.015));
  const ha = pot * eau * azote * gel * chaleur * sol * ombre * trans * s.rot * s.al * perte * monteeVivace(c, s) * (s.fdj ?? 1);
  return { ha, eau, azote, gel, chaleur, sol, ombre, trans, rot: s.rot };
}

function recolter(f, t, j, s = t) {
  const c = CULTURE[s.cult], r = rendement(f, t, j, s), part = t.b ? 0.5 : 1;
  const kg = r.ha * 1000 * CASE_HA, kcal = kg * c.kcal * 10;
  const st = f.stats, an = dateDe(j).an;
  st.kg += kg; st.kcal += kcal; st.recoltes++;
  const pc = st.parCulture[c.id] ??= { kg: 0, kcal: 0, ha: 0, dernier: 0 };
  pc.kg += kg; pc.kcal += kcal; pc.ha += CASE_HA; pc.dernier = r.ha;
  const pa = st.parAn[an] ??= { kg: 0, kcal: 0 };
  pa.kg += kg; pa.kcal += kcal;
  // Résidus laissés au sol, azote rendu par les légumineuses et les légumes (culture installée : gain compté chaque jour)
  const b = bilanDe(t);
  if (!c.vivace) { const g = (c.cat === 'Céréales' ? (c.id === 'mais' || c.id === 'sorgho' ? 0.029 : 0.020) : c.cat === 'Oléagineux' ? 0.014 : c.leg && c.kcal > 300 ? 0.012 : 0.007) * part; t.mo += g; b.resMO += g; }   // k1 0,15-0,20 [10]
  if (c.leg && !c.vivace) { t.nmin += 35 * part; b.resN += 35 * part; }
  if (N_RESIDUS[c.id]) t.nRes = (t.nRes || 0) + N_RESIDUS[c.id] * part;
  let finie = false;
  if (c.vivace) {
    // Elle reste en terre : seul le cycle repart, sauf si c'était sa dernière récolte
    const vv = c.vivace, inst = t.inst ??= { ans: 0, rec: 0, vie: vieTiree(c) }, mois = dateDe(j).mois;
    let coupe = (t.coupe || 0) + 1, dort = false;
    if (vv.coupes) { inst.rec++; dort = coupe >= vv.coupes.length || mois >= 11; }
    else inst.ans++;
    if (!vv.coupes && inst.vie && inst.ans >= inst.vie) { finirInstallee(t, c); finie = true; }
    else Object.assign(t, { p: 0, dj: 0, etc: 0, etr: 0, nabs: 0, dgel: 0, dch: 0, mur: 0, apport2: !!c.leg, vern: false, rot: 1, al: 0.92 + Math.random() * 0.16,
      coupe: vv.coupes ? coupe : 0, dort, fauche: j, fdj: null, fam: c.famille, prec: c.id, chaume: null });
  } else {
    Object.assign(s, { cult: null, p: 0, dj: 0, mur: 0, fauche: c.rouit ? j : null, chaume: ['Céréales', 'Oléagineux'].includes(c.cat) || (c.leg && c.kcal > 300) ? j : null });
    Object.assign(t, { fam: c.famille, prec: c.id });
  }
  // Le bilan de la culture est clos : ce qui suit compte pour la suivante
  t.bilanPrec = t.bilan; t.bilan = nouveauBilan();
  return { kg, kcal, ha: r.ha, c, finie };
}

// Moyennes du sol d'une ferme
function etatSol(f) {
  const ks = Object.values(f.cases), n = ks.length || 1;
  const s = { mo: 0, ru: 0, r: 0, vdt: 0, nmin: 0, erosion: 0 };
  for (const t of ks) { s.mo += t.mo; s.ru += ruMax(f, t); s.r += t.r; s.vdt += t.vdt; s.nmin += t.nmin; s.erosion += t.erosion; }
  for (const k in s) s[k] /= n;
  return s;
}
