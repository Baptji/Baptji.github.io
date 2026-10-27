'use strict';
/* Pousse des cultures et vie du sol, jour par jour, à l'hectare (la surface d'une case ne change que les tonnes).
   - Développement : degrés-jours au-dessus de la base de la culture.
   - Eau : réserve utile remplie par la pluie et l'irrigation, vidée par Kc × ETP (FAO 56) ; stress quand la
     réserve passe sous la moitié ; rendement selon 1 − Y/Ymax = Ky (1 − ETr/ETc) (FAO 33).
   - Gel et échaudage aux stades sensibles.
   - Azote : minéralisation de la matière organique (plus rapide au chaud et à l'humide), engrais, fumier,
     compost, fixation des légumineuses, lessivage par l'eau qui draine. Réponse de Mitscherlich.
   - Sol : matière organique, réserve utile (érosion, matière organique), vers de terre (labour, couverts). */

const BESOIN_KCAL = 2500;                         // kcal par personne et par jour
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const MULT_FERTI = { aucune: 0, moderee: 0.6, forte: 1.0 };

function nouvelleFerme(regionId, mode, jour) {
  return {
    id: 'f' + Math.random().toString(36).slice(2, 8), region: regionId, mode, modeDepuis: jour, modeAvant: null,
    parcelles: {}, achats: 0, cases: {}, irrigation: false, ferti: 'moderee', arbresDepuis: jour,
    stats: { kg: 0, kcal: 0, recoltes: 0, eau: 0, bois: 0, parCulture: {}, parAn: {} },
    solAns: [],
  };
}

function nouvelleCase(f) {
  const r = REGIONS.find(x => x.id === f.region), m = MODES[f.mode], v = () => 0.94 + Math.random() * 0.12;
  const ru = r.ru * v();
  return { mo: r.mo * v(), ruSol: ru, ruBase: ru, r: r.ru * 0.8, nmin: 40, vdt: m.labour ? 30 : 45, erosion: 0,
    cult: null, p: 0, dj: 0, etc: 0, etr: 0, nabs: 0, dgel: 0, dch: 0, mur: 0, fam: null, rot: 1, al: 1, apport2: false, fum: 0 };
}

const ruMax = (f, t) => t.ruSol * clamp(1 + 0.06 * (t.mo - REGIONS.find(x => x.id === f.region).mo), 0.7, 1.5);
const ageArbres = (f, j) => MODES[f.mode].arbres ? (j - f.arbresDepuis) / 365 : 0;
const potentielHa = (f, c) => c.rdt * 1.3 * MODES[f.mode].potentiel;

function transition(f, j) {
  const tr = MODES[f.mode].transition, ans = (j - f.modeDepuis) / 365;
  if (!f.modeAvant || ans >= tr.ans) return 1;
  return 1 - tr.perte * (1 - ans / tr.ans);
}

// Un jour pour toute la ferme. m = météo du jour. Rend les événements à noter.
function journeeFerme(f, j, m) {
  const mode = MODES[f.mode], ev = { murs: new Set(), geles: new Set(), echaudes: new Set() };
  const tmoy = (m.tmin + m.tmax) / 2, eau = m.pluie + m.neige;
  const age = ageArbres(f, j), arbre = clamp(age / 20, 0, 1);
  const tmaxCulture = m.tmax - 1.5 * arbre, etp = m.etp * (1 - 0.08 * arbre);
  const fT = clamp(tmoy / 12, 0, 2);
  const mult = MULT_FERTI[f.ferti], mois = dateDe(j).mois;
  for (const k in f.cases) {
    const t = f.cases[k], c = t.cult ? CULTURE[t.cult] : null, rm = ruMax(f, t);
    const couvre = c ? t.p > 0.3 : mode.couvert;
    // Pluie : ruissellement des grosses averses, plus fort sur sol nu et sans vers de terre
    let ruis = 0;
    if (eau > 15) ruis = (eau - 15) * clamp(0.55 - 0.4 * t.vdt / 100 - (couvre ? 0.2 : 0) - mode.couverture * 0.3, 0.05, 0.6);
    if (ruis > 0 && !couvre) {
      const perte = ruis * 0.006 * mode.erosion;
      t.ruSol = Math.max(t.ruBase * 0.5, t.ruSol - perte); t.erosion += perte; t.mo = Math.max(0.5, t.mo - perte * 0.002);
    }
    t.r += eau - ruis;
    // Irrigation automatique quand la réserve baisse
    if (c && t.p < 1 && f.irrigation && mode.irrigation) {
      let dose = 0;
      if (mode.irrigation === 'enrouleur' && t.r < 0.5 * rm) dose = 30;
      if (mode.irrigation === 'goutte' && t.r < 0.8 * rm) dose = Math.min(6, 0.8 * rm - t.r);
      t.r += dose; f.stats.eau += dose * 10 * mode.caseHa;
    }
    const drainage = Math.max(0, t.r - rm);
    if (drainage > 0) {
      t.nmin -= t.nmin * Math.min(1, drainage / (rm * 0.5)) * 0.4 * (couvre ? 0.3 : 1);
      t.r = rm;
    }
    // Évapotranspiration
    if (c) {
      const p = t.p, kc = p < 0.15 ? 0.4 : p < 0.4 ? 0.4 + (c.kc - 0.4) * (p - 0.15) / 0.25 : p < 0.8 ? c.kc : Math.max(0.35, c.kc - (c.kc - 0.35) * (p - 0.8) / 0.2);
      const etcJ = kc * etp * (1 - 0.1 * mode.couverture);        // −5 %/10 % couverts [13] sur l'évaporation du sol, ≈ 20 % de l'ETc
      const ks = t.r >= 0.5 * rm ? 1 : clamp(t.r / (0.5 * rm), 0, 1);
      const etrJ = Math.min(t.r, etcJ * ks);
      t.r -= etrJ;
      if (t.p < 1) {
        t.etc += etcJ; t.etr += etrJ;
        // Développement
        const avant = t.p;
        t.dj += Math.max(0, Math.min(tmoy, 30) - c.tb);
        // Cultures d'hiver : pas de montaison avant d'avoir passé l'hiver (vernalisation) : au plus la moitié du cycle
        // tant que la culture n'a pas vu le mois de février
        if (c.hiver) { if (mois >= 2 && mois <= 6) t.vern = true; if (!t.vern) t.dj = Math.min(t.dj, c.dj * 0.5); }
        t.p = Math.min(1, t.dj / c.dj);
        // Azote : la culture puise à mesure qu'elle pousse
        const besoin = potentielHa(f, c) * c.npt * (t.p - avant) * 1.1;
        const pris = Math.min(besoin, t.nmin * 0.35);
        t.nmin -= pris; t.nabs += pris;
        if (c.leg && tmoy > 6) t.nabs += (besoin - pris) * 0.9;
        // Second apport d'engrais minéral à la reprise
        if (!t.apport2 && t.p >= 0.3 && !c.leg && mode.fertilisation.startsWith('minéral')) {
          const dose = potentielHa(f, c) * c.npt * 0.55 * mult * (mode.fertilisation === 'minéral' ? 1 : 0.7);
          t.nmin += dose; t.apport2 = true; S.argent -= dose * 1.2 * mode.caseHa;
        }
        // Gel et échaudage
        const seuilGel = c.hiver && t.p > 0.6 && t.p < 0.76 ? -2 : c.gel;
        if (m.tmin < seuilGel && t.p < 0.97) {
          if (c.gel >= -1.5 && t.p < 0.45 && m.tmin < seuilGel - 1.5) { ev.geles.add(c.id); Object.assign(t, { cult: null, p: 0, dj: 0 }); continue; }
          t.dgel = Math.min(1, t.dgel + 0.12 + 0.08 * (seuilGel - m.tmin));
          ev.geles.add(c.id);
        }
        if (t.p > 0.5 && t.p < 0.92 && tmaxCulture > c.chaud) { t.dch = Math.min(0.7, t.dch + 0.025 * (tmaxCulture - c.chaud)); ev.echaudes.add(c.id); }
        if (t.p >= 1) ev.murs.add(c.id);
      } else t.mur++;
    } else {
      // Sol nu ou couvert végétal
      const evap = etp * (mode.couvert && tmoy > 5 ? 0.55 : 0.25) * (1 - 0.5 * mode.couverture);
      t.r -= Math.min(t.r, evap * clamp(t.r / rm * 1.5, 0, 1));
      if (mode.couvert && tmoy > 5) t.mo += 0.017 / 365;       // ≈ +0,013 point par an [4]
    }
    // Vie du sol : minéralisation, humus, vers de terre
    const fW = clamp(t.r / rm * 1.5, 0.2, 1);
    t.nmin += t.mo * 0.15 * fT * fW * (1 + 0.3 * t.vdt / 100);
    t.mo -= t.mo * mode.kMO / 365 * fT;
    if (mode.arbres) t.mo += 0.010 / 365 * arbre;               // +0,24 t C/ha/an à maturité [6]
    t.vdt += (mode.vdtMax - t.vdt) * 0.00028;                    // constante de temps ≈ 10 ans [3]
    if (t.fum > 0) t.fum--;
  }
  return ev;
}

function peutSemer(f, c, mois, m) {
  if (!cultureAutorisee(f.mode, c)) return `${c.nom} ne se cultive pas en ${MODES[f.mode].court.toLowerCase()}.`;
  if (!c.semis.includes(mois)) return `${c.nom} : semis en ${plages(c.semis)} seulement.`;
  if (m && (m.tmin < -3 || m.neige > 1)) return 'Sol gelé ou sous la neige aujourd’hui.';
  if (S.argent < c.graine * MODES[f.mode].caseHa) return 'Pas assez d’argent pour les semences.';
  return null;
}

function semer(f, t, c) {
  const mode = MODES[f.mode], mult = MULT_FERTI[f.ferti];
  const precLeg = t.fam === 'fabacée';
  Object.assign(t, { cult: c.id, p: 0, dj: 0, etc: 0, etr: 0, nabs: 0, dgel: 0, dch: 0, mur: 0, apport2: c.leg, vern: false,
    rot: t.fam === c.famille ? 0.88 : precLeg ? 1.05 : 1, al: 0.92 + Math.random() * 0.16 });
  S.argent -= c.graine * mode.caseHa;
  if (mode.labour) { t.nmin += t.mo * 2; t.mo -= t.mo * 0.002; }
  if (mode.couvert) t.nmin += 12;                   // couvert détruit au semis
  const besoin = potentielHa(f, c) * c.npt;
  if (!c.leg) {
    if (mode.fertilisation.startsWith('minéral')) {
      const dose = besoin * 0.4 * mult * (mode.fertilisation === 'minéral' ? 1 : 0.7);
      t.nmin += dose; S.argent -= dose * 1.2 * mode.caseHa;
    } else if (mode.fertilisation === 'fumier') {
      t.nmin += besoin * 0.5 * mult; t.mo += 0.07 * mult; t.fum = mult ? 25 : 0; S.argent -= 400 * mult * mode.caseHa;
    } else if (mode.fertilisation === 'compost') {
      t.nmin += besoin * 0.45 * mult; t.mo += 0.12 * mult; t.fum = mult ? 25 : 0; S.argent -= 1500 * mult * mode.caseHa;
    }
  }
}

// Rendement en t/ha et le détail des facteurs
function rendement(f, t, j) {
  const c = CULTURE[t.cult], pot = potentielHa(f, c);
  const eau = t.etc > 1 ? clamp(1 - c.ky * (1 - t.etr / t.etc), 0, 1) : 1;
  const ratio = t.nabs / (pot * c.npt * Math.max(t.p, 0.15));   // en cours de route : rapporté à ce qui a poussé
  const azote = c.leg ? 1 : clamp((1 - Math.exp(-3 * ratio)) / (1 - Math.exp(-3)), 0, 1);
  const gel = 1 - t.dgel, chaleur = 1 - t.dch;
  const sol = 1;                                   // les vers de terre jouent sur l'eau et l'azote, pas directement sur le rendement
  const age = ageArbres(f, j), ombre = 1 - clamp((age - 5) / 35, 0, 1) * (c.id === 'mais' || c.id === 'sorgho' ? 0.4 : 0.3);
  const trans = transition(f, j);
  const perte = Math.max(0.2, 1 - Math.max(0, t.mur - 20) * (c.cat === 'Céréales' ? 0.005 : 0.015));
  const ha = pot * eau * azote * gel * chaleur * sol * ombre * trans * t.rot * t.al * perte;
  return { ha, eau, azote, gel, chaleur, sol, ombre, trans, rot: t.rot };
}

function recolter(f, t, j) {
  const c = CULTURE[t.cult], r = rendement(f, t, j), mode = MODES[f.mode];
  const kg = r.ha * 1000 * mode.caseHa, kcal = kg * c.kcal * 10;
  const s = f.stats, an = dateDe(j).an;
  s.kg += kg; s.kcal += kcal; s.recoltes++;
  const pc = s.parCulture[c.id] ??= { kg: 0, kcal: 0, ha: 0, dernier: 0 };
  pc.kg += kg; pc.kcal += kcal; pc.ha += mode.caseHa; pc.dernier = r.ha;
  const pa = s.parAn[an] ??= { kg: 0, kcal: 0 };
  pa.kg += kg; pa.kcal += kcal;
  S.argent += kg * c.prix;
  // Résidus laissés au sol, azote rendu par les légumineuses
  t.mo += c.cat === 'Céréales' ? (c.id === 'mais' || c.id === 'sorgho' ? 0.029 : 0.020) : c.cat === 'Oléagineux' ? 0.014 : c.leg && c.kcal > 300 ? 0.012 : 0.007;   // k1 0,15-0,20 [10]
  if (c.leg) t.nmin += 35;
  Object.assign(t, { fam: c.famille, cult: null, p: 0, dj: 0, mur: 0, chaume: ['Céréales', 'Oléagineux'].includes(c.cat) || (c.leg && c.kcal > 300) ? j : null });
  return { kg, kcal, ha: r.ha, c };
}

// Moyennes du sol d'une ferme
function etatSol(f) {
  const ks = Object.values(f.cases), n = ks.length || 1;
  const s = { mo: 0, ru: 0, r: 0, vdt: 0, nmin: 0, erosion: 0 };
  for (const t of ks) { s.mo += t.mo; s.ru += ruMax(f, t); s.r += t.r; s.vdt += t.vdt; s.nmin += t.nmin; s.erosion += t.erosion; }
  for (const k in s) s[k] /= n;
  return s;
}
