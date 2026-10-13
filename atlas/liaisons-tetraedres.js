// ============ Liaisons du cristal — scène de la famille « tetraedres » (silicates à tétraèdres isolés) ============
// 10/10/2026 (prototype : forstérite). Coupe schématique tirée de la topologie de l'olivine : tétraèdres SiO₄ ISOLÉS (aucun oxygène
// partagé entre deux silicium), vus selon un axe 4̄ (les 4 oxygènes en carré), reliés seulement par les cations en octaèdre (4 des 6
// oxygènes dans le plan) ; chaque oxygène tient 1 Si et 3 cations (2 dans le plan). Sites des cations : entre deux tétraèdres d'une
// rangée (M2) et au centre des mailles (M1). Mécanisme (Oelkers et al. 2018) : des H⁺ prennent la place du cation, qui part ; le
// tétraèdre, retenu par ses dernières liaisons cation–O, part ensuite entier (H₄SiO₄) : aucune liaison Si–O ne casse.
(function () {
  "use strict";
  const S = 70, X0 = 60, Y0 = 196, L = 12, LW = 32;   // pas des tétraèdres, demi-côté du carré des O, longueur cation–eau
  const NS = 4;                                      // la rangée du haut s'arrête au tétraèdre n° 4 (bord de la marche)
  const siP = (j, c) => [X0 + c * S, Y0 + j * S];
  const siExiste = (j, c) => c >= 0 && c <= 8 && j >= 0 && j <= 2 && !(j === 0 && c > NS);
  const OS = [[1, -1], [1, 1], [-1, -1], [-1, 1]];   // ur, dr, ul, dl
  const oP = (j, c, i) => { const [x, y] = siP(j, c); return [x + OS[i][0] * L, y + OS[i][1] * L]; };
  // cations : M2 = entre deux tétraèdres d'une rangée (y = rangée), M1 = centre de maille (y = rangée + ½)
  const m2P = (j, c) => [X0 + (c + 0.5) * S, Y0 + j * S], m1P = (j, c) => [X0 + (c + 0.5) * S, Y0 + (j + 0.5) * S];
  const m2Existe = (j, c) => siExiste(j, c) && (siExiste(j, c + 1) || (j === 0 && c === NS)) && c <= 7;
  const m1Existe = (j, c) => j >= 0 && j <= 1 && c >= -1 && c <= 7 && X0 + (c + 0.5) * S > 0;
  // oxygènes liés à chaque cation (dans le plan)
  const m2O = (j, c) => [[j, c, 0], [j, c, 1], [j, c + 1, 2], [j, c + 1, 3]].filter(([a, b]) => siExiste(a, b));
  const m1O = (j, c) => [[j, c, 1], [j, c + 1, 3], [j + 1, c, 0], [j + 1, c + 1, 2]].filter(([a, b]) => siExiste(a, b));
  const MS = [0, NS];                     // cation suivi : M2 au bord de la marche (il a perdu le tétraèdre n° 5)
  const TS = [0, NS];                     // tétraèdre suivi : le dernier de la rangée du haut
  const egal = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const nb = (x, O) => (x < 10 ? String(Math.round(x * 10) / 10).replace(".", ",") : O.sp(Math.round(x)));   // « 1,9 » et non « 1,9000000000000001 »

  function noms(d, O) {
    const M = d.cation, Y = (d.textes && d.textes.octa) || "Al";
    return { M, vS: d.valences["Si-O"], vM: d.valences[`${M}-O`], pM: `${M}–O`, nom: O.nomEl(M), le: O.art(M, "le"), du: O.art(M, "du"),
      Y, vY: d.valences[`${Y}-O`], pY: `${Y}–O`, nomY: O.nomEl(Y) };
  }
  // variante « grenat » (V.g) : les sites M2 portent le cation en 8 (Fe, Ca, Mg : d.cation), les sites M1 (centres de maille) l'aluminium
  // des octaèdres (textes.octa) ; chaque oxygène tient alors 1 Si, 1 Al et 2 cations en 8 (Novak et Gibbs 1971), dont un dans le plan
  const OLI = { g: false, n: 6 }, GRE = { g: true, n: 8 };
  const m1El = (N, V) => (V.g ? [N.Y, N.vY, N.pY] : [N.M, N.vM, N.pM]);
  // liaisons cation–O du tétraèdre suivi, et à quel cation elles appartiennent
  const autourTS = [["m2", 0, NS - 1, 2], ["m2", 0, NS - 1, 3], ["m1", 0, NS - 1, 3], ["m1", 0, NS, 1]];   // [type, j, c, i de l'O de TS]

  // relief : arête du dessus du cristal (gauche → droite), positions de tous les O et de tous les cations (pour la couche de derrière)
  const XB = X0 + (NS + 0.5) * S + 14, BORD = [[0, 172], [XB, 172], [XB, 212], [640, 212]];
  const tousO = [], tousM = [];
  for (let j = 0; j <= 2; j++) for (let c = 0; c <= 8; c++) if (siExiste(j, c)) for (let i = 0; i < 4; i++) tousO.push(oP(j, c, i));
  for (let j = 0; j <= 2; j++) for (let c = 0; c <= 7; c++) if (m2Existe(j, c)) tousM.push(m2P(j, c));
  for (let j = 0; j <= 1; j++) for (let c = -1; c <= 7; c++) if (m1Existe(j, c)) tousM.push(m1P(j, c));

  function decor(k, d, O, V) {
    const N = noms(d, O);
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>`
      + O.relief.dessus(BORD) + `<path d="M0 172 H${XB} V212 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    const estTS = (j, c) => j === TS[0] && c === TS[1];
    // tétraèdres (sauf le suivi)
    for (let j = 0; j <= 2; j++) for (let c = 0; c <= 8; c++) {
      if (!siExiste(j, c) || estTS(j, c)) continue;
      const [x, y] = siP(j, c);
      for (let i = 0; i < 4; i++) { const [ox, oy] = oP(j, c, i); l += O.lien(x, y, ox, oy, { k: "cov", v: N.vS, el: "Si", p: "Si–O" }); a += O.atome(ox, oy, "O"); }
      a += O.atome(x, y, "Si");
    }
    // cations et leurs liaisons (celles qui touchent le tétraèdre suivi ou le cation suivi sont des acteurs)
    const poser = (P, liste, suivi, [el, v, p] = [N.M, N.vM, N.pM]) => {
      const [x, y] = P;
      for (const [oj, oc, oi] of liste) if (!estTS(oj, oc) && !suivi) { const [ox, oy] = oP(oj, oc, oi); l += O.lien(x, y, ox, oy, { k: "ion", v, p }); }
      if (!suivi) a += O.atome(x, y, el);
    };
    for (let j = 0; j <= 2; j++) for (let c = 0; c <= 7; c++) if (m2Existe(j, c)) poser(m2P(j, c), m2O(j, c), j === MS[0] && c === MS[1]);
    for (let j = 0; j <= 1; j++) for (let c = -1; c <= 7; c++) if (m1Existe(j, c)) {
      const [x, y] = m1P(j, c);
      if (j === 0 && x > X0 + (NS + 0.5) * S + 1) {   // sur la terrasse basse, le cation M1 devient la surface : eau au-dessus
        const [, v1, p1] = m1El(N, V);
        l += O.lien(x, y, x, y - LW, { k: "eau", v: v1, p: p1 }); a += O.eau(x, y - LW, -90);
      }
      poser([x, y], m1O(j, c), false, m1El(N, V));
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    for (const [x, y, an] of [[90, 120, 20], [206, 44, 150], [604, 130, 60], [540, 40, 200], [150, 150, 300]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") {
      for (const [x, y] of [[60, 70], [172, 92], [398, 30], [612, 62], [300, 150]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 22], [450, 150], [330, 62]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }

  function etapes(k, d, O, V) {
    if (V.g) return etapesGrenat(k, d, O);
    const N = noms(d, O), T = d.textes || {}, o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const M0 = m2P(...MS), T0 = siP(...TS);
    const pl = { h: [0, -1, -90], d: [1, 0, 0], b: [0, 1, 90], g: [-1, 0, 180] };
    const autour = (x, y, liste) => { const out = { M: { x, y } }; for (const [id, p] of liste) { const [dx, dy, an] = pl[p]; out[id] = { x: x + dx * LW, y: y + dy * LW, a: an }; } return out; };
    const versA = (q, an, Lg = LW) => ({ x: q.x + Lg * Math.cos(O.rad(an)), y: q.y + Lg * Math.sin(O.rad(an)), a: an });
    const posT = (x, y) => { const r = {}; OS.forEach(([sx, sy], i) => { r["T" + i] = { x: x + sx * L, y: y + sy * L }; }); r.TS = { x, y }; return r; };
    const io = (a, b) => ({ a, b, k: "ion", v: N.vM, p: N.pM }), we = (b) => ({ a: "M", b, k: "eau", v: N.vM, p: N.pM });
    const so = (b) => ({ a: "TS", b, k: "cov", v: N.vS, el: "Si", p: "Si–O" }), oh = (a, b) => ({ a, b, k: "oh" });
    const t0 = posT(...T0), suite = O.suite, e = [];
    const A = Object.assign({
      Wu: { t: "eau", x: M0[0], y: M0[1] - LW, a: -90 }, Wr: { t: "eau", x: M0[0] + LW, y: M0[1], a: 0 },
      Wa: { t: "eau", x: 486, y: 132, a: 200 }, Wb: { t: "eau", x: 560, y: 90, a: 30 },
      Ha: { t: "hp", x: 430, y: 120 }, Hb: { t: "hp", x: 470, y: 60 }, Hc: { t: "hp", x: 260, y: 120 }, Hd: { t: "hp", x: 220, y: 70 },
      M: { t: "at", el: N.M, x: M0[0], y: M0[1] },
      halo: { t: "halo", x: M0[0], y: M0[1], r: 17 },
      Wn: { t: "eau", x: 330, y: 150, a: 300, o: 0 },
    }, Object.fromEntries(Object.entries(t0).map(([key, p]) => [key, Object.assign({ t: "at", el: key === "TS" ? "Si" : "O" }, p)])));
    // relief : les deux oxygènes du cation suivi hors du plan (devant en contour, derrière dans la copie pâle) ; un cation de chaque côté du tétraèdre suivi
    const R = O.relief, mv = R.devant(M0), tv = R.devant(T0);
    A.MV = Object.assign({ t: "at", el: "O", x: mv[0], y: mv[1], r: 8.5 }, R.avant);
    A.TV = Object.assign({ t: "at", el: N.M, x: tv[0], y: tv[1] }, R.avant);
    const oA = tousO.map(R.derriere), mA = tousM.map(R.derriere), oTS = [0, 1, 2, 3].map((i) => oP(...TS, i));
    const B = {
      wu: we("Wu"), wr: we("Wr"), mUr: io("M", "T0"), mDr: io("M", "T1"),
      s0: so("T0"), s1: so("T1"), s2: so("T2"), s3: so("T3"),
    };
    autourTS.forEach(([ty, j, c, i], n) => { B["c" + n] = io(ty === "m2" ? m2P(j, c) : m1P(j, c), "T" + i); });
    B.mV = io("M", "MV"); B.mA = io("M", oA[R.proche(oA, M0)]);
    B.tV = io("TV", "T" + R.proche(oTS, tv));
    const ma = mA[R.proche(mA, T0)]; B.tA = io(ma, "T" + R.proche(oTS, ma));
    e.push({ A, B, L: {}, g: [4, 2], h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? "Le bord d'une marche du cristal" : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? (T.debut || `Chaque silicium tient quatre oxygènes : un tétraèdre SiO₄. Les tétraèdres ne se touchent pas ; seuls les ${N.nom}s, qui tiennent chacun six oxygènes, les relient. Au bord, ${N.le} qu'on suit (cerclé) en a déjà perdu deux : l'eau occupe leur place.`)
        : "L'acide libère dans l'eau des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Les H⁺ sont attirés par les oxygènes de la surface, chargés négativement.",
    });
    const m1 = { x: M0[0] + 8, y: M0[1] - 6 };
    const hO = (q, an) => Object.assign(versA(q, an, 13), { t: "h" });
    if (T.alu3) {   // 11/10/2026 : Al₂SiO₅ (Heřmanská et al. 2023) : aucune liaison Si–O–Si ; la rupture des Al–O des octaèdres règle la vitesse
      const m2 = { x: 500, y: 96 }, t3 = posT(250, 92), v = m2P(0, NS - 1);
      e.push(suite(e[0], {
        titre: "Des H⁺ se posent sur les oxygènes",
        texte: `Des H⁺ se fixent sur les oxygènes qui tiennent ${N.le} du bord : ses liaisons ${N.pM} s'affaiblissent. Mais à trois charges, ${N.le} ne s'échange pas vite contre des H⁺, comme le magnésium de l'olivine : il tient encore.${k === "eau" && T.eauH ? " " + T.eauH : ""}`,
        A: { Ha: hO(t0.T0, -60), Hb: hO(t0.T1, 60) }, B: { h0: oh("T0", "Ha"), h1: oh("T1", "Hb") },
        L: k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {},
      }));
      e.push(suite(e[1], {
        titre: `Les liaisons ${N.pM} lâchent : c'est l'étape lente`,
        texte: `Une à une, les liaisons ${N.pM} cèdent, et ${N.le} se détache. C'est l'étape lente : ${o.lettres || "durée non mesurée"} en moyenne par groupe ${d.formule} de la surface. ${k === "eau" ? (T.alSol || `Dans le sol, ${N.le} ne va pas loin : il se redépose aussitôt en Al(OH)₃ ou, avec la silice, en kaolinite.`) : `Dans l'acide, il part entouré d'eau : ${d.hydrate}.`}`,
        A: Object.assign(autour(m2.x, m2.y, [["Wu", "h"], ["Wr", "d"], ["Wa", "b"], ["Wb", "g"]]), { halo: { x: m2.x, y: m2.y, o: 0 } }),
        B: { mUr: 0, mDr: 0, mV: 0, mA: 0, wa: we("Wa"), wb: we("Wb") }, g: [0, 6], h: Object.assign({ cours: true }, H),
        L: { lM: { x: m2.x + 62, y: m2.y + 5, t: k === "eau" ? "→ Al(OH)₃" : d.hydrate } },
      }));
      e.push(suite(e[2], {
        titre: "Le tétraèdre part aussitôt, entier",
        texte: "D'autres H⁺ se posent ; plus rien ne retient le tétraèdre, qui part en silice dissoute, H₄SiO₄. Aucune liaison Si–O n'a cassé : dans ce cristal, aucun oxygène ne relie deux silicium.",
        A: Object.assign({}, t3, { Ha: hO(t3.T0, -45), Hb: hO(t3.T1, 45), Hc: hO(t3.T2, -135), Hd: hO(t3.T3, 135) }),
        B: { c0: 0, c1: 0, c2: 0, c3: 0, tV: 0, tA: 0, h2: oh("T2", "Hc"), h3: oh("T3", "Hd") }, h: H,
        L: { lT: { x: 250, y: 140, t: "H₄SiO₄", m: 1 } },
      }));
      e.push(suite(e[3], {
        titre: "La marche recule d'un cran",
        texte: `${majuscule(N.le)} voisin se retrouve au bord et tout recommence.${T["fin_" + k] ? " " + T["fin_" + k] : ""}`,
        A: { Wn: { x: v[0] + LW, y: v[1], a: 0, o: 1 }, halo: { x: v[0], y: v[1], o: 1 } },
        B: { wn: { a: v, b: "Wn", k: "eau", v: N.vM, p: N.pM } }, h: H,
      }));
      return e;
    }
    if (T.reste) {   // 11/10/2026 : zircon : les H⁺ se posent, mais les liaisons Zr–O (une demi-liaison chacune, plus d'un tiers covalentes) tiennent ; rien ne part
      e.push(suite(e[0], {
        titre: "Des H⁺ se posent sur les oxygènes",
        texte: `Des H⁺ se fixent sur les oxygènes qui tiennent ${N.le} du bord.${k === "eau" && T.eauH ? " " + T.eauH : ""}`,
        A: { Ha: hO(t0.T0, -60), Hb: hO(t0.T1, 60) }, B: { h0: oh("T0", "Ha"), h1: oh("T1", "Hb") },
        L: k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {},
      }));
      e.push(suite(e[1], {
        titre: `${majuscule(N.le)} ne part pas`,
        texte: `${T.reste} ${o.lettres ? "" : "Aucune vitesse de départ n'a été mesurée à 25 °C."}`.trim(),
        h: Object.assign({ cours: true }, H),
      }));
      e.push(suite(e[2], {
        titre: "Les H⁺ repartent, la marche ne bouge pas",
        texte: `Les H⁺ retournent à l'eau : le bord est le même qu'au début.${T["fin_" + k] ? " " + T["fin_" + k] : ""}`,
        A: { Ha: { t: "hp", x: 430, y: 120 }, Hb: { t: "hp", x: 470, y: 60 } }, B: { h0: 0, h1: 0 }, L: { lB: 0 }, h: H,
      }));
      return e;
    }
    e.push(suite(e[0], {
      titre: `Deux H⁺ prennent la place ${N.du}`,
      texte: `Deux H⁺ se posent sur les oxygènes qui le tenaient : ${N.le} n'est plus retenu, la charge reste équilibrée (deux + pour deux +). Toute la surface s'échange ainsi en quelques minutes.${k === "eau" && T.eauH ? " " + T.eauH : ""}`,
      A: { Ha: hO(t0.T0, -60), Hb: hO(t0.T1, 60), M: m1, halo: Object.assign({}, m1, { o: 0 }), Wu: { x: m1.x, y: m1.y - LW, a: -90 }, Wr: versA(m1, -10), Wa: versA(m1, 50) },
      B: { mUr: 0, mDr: 0, h0: oh("T0", "Ha"), h1: oh("T1", "Hb"), wa: we("Wa") }, g: [2, 4],
      L: k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {},
    }));
    const m2 = { x: 500, y: 96 };
    e.push(suite(e[1], {
      titre: `${majuscule(N.le)} s'en va, habillé d'eau`,
      texte: `${majuscule(N.le)} part entouré de six molécules d'eau : ${d.hydrate}. Sous la surface, il reste une couche privée de ${N.nom}, épaisse de quelques atomes.`,
      A: autour(m2.x, m2.y, [["Wu", "h"], ["Wr", "d"], ["Wa", "b"], ["Wb", "g"]]),
      B: { mV: 0, mA: 0, wb: we("Wb") }, g: [0, 6],
      L: { lM: { x: m2.x + 62, y: m2.y + 5, t: d.hydrate } },
    }));
    const t3 = posT(250, 92);
    e.push(suite(e[2], {
      titre: "Le tétraèdre se détache, entier",
      texte: `Deux autres H⁺ se posent ; le tétraèdre ne tient plus que par ses dernières liaisons ${N.pM}, qui lâchent une à une. C'est l'étape lente. Il part sous forme de silice dissoute, H₄SiO₄ : aucune de ses liaisons Si–O n'a cassé.`,
      A: Object.assign({}, t3, { Ha: hO(t3.T0, -45), Hb: hO(t3.T1, 45), Hc: hO(t3.T2, -135), Hd: hO(t3.T3, 135) }),
      B: { c0: 0, c1: 0, c2: 0, c3: 0, tV: 0, tA: 0, h2: oh("T2", "Hc"), h3: oh("T3", "Hd") },
      h: Object.assign({ cours: true }, H),
      L: { lT: { x: 250, y: 140, t: "H₄SiO₄", m: 1 } },
    }));
    const v = m2P(0, NS - 1);
    e.push(suite(e[3], {
      titre: "La marche recule d'un cran",
      texte: `${majuscule(N.le)} voisin se retrouve au bord et tout recommence. ${k === "eau" ? "Dans un sol bien drainé, il" : "Il"} ne reste rien du cristal : ${d.la} se dissout entièrement en ${N.M}²⁺ et silice dissoute${k === "eau" ? ", avec le bicarbonate laissé par l'acide carbonique" : ""}.`,
      A: { Wn: { x: v[0] + LW, y: v[1], a: 0, o: 1 }, halo: { x: v[0], y: v[1], o: 1 } },
      B: { wn: { a: v, b: "Wn", k: "eau", v: N.vM, p: N.pM } }, h: H,
    }));
    return e;
  }

  function etapesGrenat(k, d, O) {
    const N = noms(d, O), T = d.textes || {}, o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const M0 = m2P(...MS), T0 = siP(...TS);
    const pl = { h: [0, -1, -90], d: [1, 0, 0], b: [0, 1, 90], g: [-1, 0, 180] };
    const autour = (x, y, liste) => { const out = { M: { x, y } }; for (const [id, p] of liste) { const [dx, dy, an] = pl[p]; out[id] = { x: x + dx * LW, y: y + dy * LW, a: an }; } return out; };
    const versA = (q, an, Lg = LW) => ({ x: q.x + Lg * Math.cos(O.rad(an)), y: q.y + Lg * Math.sin(O.rad(an)), a: an });
    const posT = (x, y) => { const r = {}; OS.forEach(([sx, sy], i) => { r["T" + i] = { x: x + sx * L, y: y + sy * L }; }); r.TS = { x, y }; return r; };
    const io = (a, b) => ({ a, b, k: "ion", v: N.vM, p: N.pM }), we = (b) => ({ a: "M", b, k: "eau", v: N.vM, p: N.pM });
    const iy = (a, b) => ({ a, b, k: "ion", v: N.vY, p: N.pY });
    const so = (b) => ({ a: "TS", b, k: "cov", v: N.vS, el: "Si", p: "Si–O" }), oh = (a, b) => ({ a, b, k: "oh" });
    const t0 = posT(...T0), suite = O.suite, e = [], Le = majuscule(N.le), Y = N.Y, leY = O.art(Y, "le");
    const A = Object.assign({
      Wu: { t: "eau", x: M0[0], y: M0[1] - LW, a: -90 }, Wr: { t: "eau", x: M0[0] + LW, y: M0[1], a: 0 },
      Wa: { t: "eau", x: 486, y: 132, a: 200 }, Wb: { t: "eau", x: 560, y: 90, a: 30 },
      Ha: { t: "hp", x: 430, y: 120 }, Hb: { t: "hp", x: 470, y: 60 }, Hc: { t: "hp", x: 260, y: 120 }, Hd: { t: "hp", x: 220, y: 70 },
      M: { t: "at", el: N.M, x: M0[0], y: M0[1] },
      halo: { t: "halo", x: M0[0], y: M0[1], r: 17 },
      Wn: { t: "eau", x: 330, y: 150, a: 300, o: 0 },
    }, Object.fromEntries(Object.entries(t0).map(([key, p]) => [key, Object.assign({ t: "at", el: key === "TS" ? "Si" : "O" }, p)])));
    // relief : quatre des huit oxygènes du cation suivi sont hors du plan, deux devant (contour) et deux derrière (copie pâle)
    const R = O.relief, mv = R.devant(M0), tv = R.devant(T0);
    A.MV = Object.assign({ t: "at", el: "O", x: mv[0], y: mv[1], r: 8.5 }, R.avant);
    A.MV2 = Object.assign({ t: "at", el: "O", x: mv[0] + 22, y: mv[1] + 2, r: 8.5 }, R.avant);
    A.TV = Object.assign({ t: "at", el: N.M, x: tv[0], y: tv[1] }, R.avant);
    const oA = tousO.map(R.derriere), mA = tousM.map(R.derriere), oTS = [0, 1, 2, 3].map((i) => oP(...TS, i));
    const iA = R.proche(oA, M0), oA2 = oA.map((q, i) => (i === iA ? [1e9, 1e9] : q));
    const B = { wu: we("Wu"), wr: we("Wr"), mUr: io("M", "T0"), mDr: io("M", "T1"), s0: so("T0"), s1: so("T1"), s2: so("T2"), s3: so("T3") };
    // liaisons du tétraèdre suivi : deux vers le cation en 8 de gauche (site M2), deux vers les aluminiums (sites M1)
    autourTS.forEach(([ty, j, c, i], n) => { B["c" + n] = ty === "m2" ? io(m2P(j, c), "T" + i) : iy(m1P(j, c), "T" + i); });
    B.mV = io("M", "MV"); B.mV2 = io("M", "MV2"); B.mA = io("M", oA[iA]); B.mA2 = io("M", oA2[R.proche(oA2, M0)]);
    B.tV = io("TV", "T" + R.proche(oTS, tv));
    const ma = mA[R.proche(mA, T0)]; B.tA = io(ma, "T" + R.proche(oTS, ma));
    e.push({ A, B, L: {}, g: [6, 2], h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? "Le bord d'une marche du cristal" : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? (T.debut || `Chaque silicium tient quatre oxygènes : un tétraèdre SiO₄. Les tétraèdres ne se touchent pas : les ${N.nomY}s, au centre d'octaèdres (six oxygènes), et les ${N.nom}s, qui en tiennent huit, les relient. Au bord, ${N.le} qu'on suit (cerclé) a perdu deux de ses oxygènes : l'eau occupe leur place.`)
        : "L'acide libère dans l'eau des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Les H⁺ sont attirés par les oxygènes de la surface, chargés négativement.",
    });
    const m1 = { x: M0[0] + 8, y: M0[1] - 6 };
    const hO = (q, an) => Object.assign(versA(q, an, 13), { t: "h" });
    e.push(suite(e[0], {
      titre: `Deux H⁺ prennent la place ${N.du}`,
      texte: `Deux H⁺ se posent sur les oxygènes qui le tenaient : ${N.le} n'est plus retenu. Les ${N.nom}s de la surface s'échangent ainsi les premiers, vite.${k === "eau" && T.eauH ? " " + T.eauH : ""}`,
      A: { Ha: hO(t0.T0, -60), Hb: hO(t0.T1, 60), M: m1, halo: Object.assign({}, m1, { o: 0 }), Wu: { x: m1.x, y: m1.y - LW, a: -90 }, Wr: versA(m1, -10), Wa: versA(m1, 50) },
      B: { mUr: 0, mDr: 0, h0: oh("T0", "Ha"), h1: oh("T1", "Hb"), wa: we("Wa") }, g: [4, 4],
      L: k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {},
    }));
    const m2 = { x: d.hydrate.length > 10 ? 462 : 500, y: 96 };   // étiquette longue (« Ca²⁺ hydraté ») : le groupe se décale à gauche
    e.push(suite(e[1], {
      titre: `${Le} s'en va, habillé d'eau`,
      texte: `${Le} part entouré de molécules d'eau : ${d.hydrate}.${k === "eau" && T.eauX ? " " + T.eauX : ""} Le reste tient encore : les tétraèdres sont accrochés aux octaèdres ${Y}O₆.`,
      A: autour(m2.x, m2.y, [["Wu", "h"], ["Wr", "d"], ["Wa", "b"], ["Wb", "g"]]),
      B: { mV: 0, mV2: 0, mA: 0, mA2: 0, wb: we("Wb") }, g: [0, 6],
      L: { lM: { x: m2.x + 62, y: m2.y + 5, t: d.hydrate } },
    }));
    const t3 = posT(250, 92);
    e.push(suite(e[2], {
      titre: `Les liaisons ${N.pY} lâchent : le tétraèdre part`,
      texte: `D'autres H⁺ se posent ; le tétraèdre ne tient plus que par les ${N.nomY}s des octaèdres voisins. Ce sont ces liaisons ${N.pY}, les plus solides après Si–O, qui cèdent en dernier : c'est l'étape lente. Le tétraèdre part en silice dissoute, H₄SiO₄, sans qu'aucune liaison Si–O ait cassé.`,
      A: Object.assign({}, t3, { Ha: hO(t3.T0, -45), Hb: hO(t3.T1, 45), Hc: hO(t3.T2, -135), Hd: hO(t3.T3, 135) }),
      B: { c0: 0, c1: 0, c2: 0, c3: 0, tV: 0, tA: 0, h2: oh("T2", "Hc"), h3: oh("T3", "Hd") },
      h: Object.assign({ cours: true }, H),
      L: { lT: { x: 250, y: 140, t: "H₄SiO₄", m: 1 } },
    }));
    const v = m1P(0, NS);
    e.push(suite(e[3], {
      titre: k === "eau" || T.yReste ? `${majuscule(leY)} reste sur place` : `${majuscule(leY)} part à son tour`,
      texte: k === "eau" ? (T.finSol || `Privé de ses tétraèdres, ${leY} ne part pas : avec un peu de silice, il se redépose sur place en kaolinite.`)
        : (T.finAcide || `Dans l'acide, ${leY} part aussi, en ${Y}³⁺ : il ne reste rien du cristal.`),
      A: { halo: { x: v[0], y: v[1], o: 1, r: 17 } },
      L: { lA: { x: v[0] + 4, y: v[1] - (T.finEtiq ? 44 : 30), t: T.finEtiq || (k === "eau" ? "→ kaolinite" : `→ ${Y}³⁺`), m: 1 } },
      h: H,
    }));
    return e;
  }

  function energie(d, O, V = OLI) {
    const N = noms(d, O), E = d.energie || {}, rep = d.repere, T = d.textes || {};
    const ratio = Math.round(N.vS / N.vM);
    const duo = V.g ? [
      { titre: "Si–O", sous: `liaison ${O.nature("Si–O")} (électrons en partie partagés)`,
        schema: { type: "partage", a: "Si", b: "O", aria: "Silicium et oxygène partagent des électrons" },
        li: [`Ionique ${O.fraction(O.ionicite("Si", "O"))} seulement (Pauling). Chaque liaison Si–O vaut presque une liaison simple entière.`,
          "Elle ne casse pas ici : le tétraèdre part entier, en silice dissoute."] },
      { titre: N.pY, sous: `liaison ${O.nature(N.pY)} (électrons en partie cédés)`,
        schema: { type: "don", a: N.Y, la: `${N.Y}${T.chargeY || "³⁺"}`, ra: 15, fa: 12, b: "O", aria: `${majuscule(O.art(N.Y, "le"))} cède ses électrons aux oxygènes` },
        li: [`Ionique ${O.fraction(O.ionicite(N.Y, "O"))} (Pauling).${T.duoY ? "" : ` ${majuscule(O.art(N.Y, "le"))} répartit ses trois charges sur six oxygènes : chaque liaison vaut une demi-liaison simple.`}`,
          T.duoY || T.duoM || `${majuscule(N.le)}, lui, répartit deux charges sur huit oxygènes (un quart de liaison chacune) : il part le premier. Ce sont les liaisons ${N.pY} qui fixent le rythme.`] },
    ] : [
      { titre: "Si–O", sous: `liaison ${O.nature("Si–O")} (électrons en partie partagés)`,
        schema: { type: "partage", a: "Si", b: "O", aria: "Silicium et oxygène partagent des électrons" },
        li: T.liSi ? T.liSi.split(" | ") : [`Ionique ${O.fraction(O.ionicite("Si", "O"))} seulement (Pauling) : le silicium et l'oxygène gardent une bonne part de leurs électrons en commun.`,
          `Chaque silicium répartit sa charge sur quatre oxygènes : chaque liaison Si–O vaut presque une liaison simple entière. L'eau ne la casse pas ici : le tétraèdre part entier.`] },
      { titre: N.pM, sous: `liaison ${O.nature(N.pM)} (électrons cédés)`,
        schema: { type: "don", a: N.M, la: `${N.M}${T.charge || (T.alu3 ? "³⁺" : "²⁺")}`, ra: 17, fa: 12, b: "O", aria: `${majuscule(N.le)} cède ses électrons aux tétraèdres` },
        li: T.liM ? T.liM.split(" | ").map((x) => x.replace("{ion}", O.fraction(O.ionicite(N.M, "O")))) : T.alu3 ? [`Ionique ${O.fraction(O.ionicite(N.M, "O"))} (Pauling), presque autant partagée que Si–O.`,
          `${majuscule(N.le)} répartit ses trois charges sur six oxygènes : chaque liaison ${N.pM} vaut une demi-liaison simple, plus que Mg–O dans l'olivine (un tiers). C'est elle qui lâche, lentement : elle règle la vitesse.`]
        : [`${majuscule(N.le)} a cédé ses deux électrons aux tétraèdres. Ionique ${O.fraction(O.ionicite(N.M, "O"))} (Pauling).`,
          `Sa charge se répartit sur six oxygènes : chaque liaison ${N.pM} ne vaut qu'un tiers de liaison simple, ${O.lettres(ratio, true)} fois moins qu'une liaison Si–O. C'est elle qui lâche.`] },
    ];
    const EA = [["eaAcide", "dans l'acide (H⁺)", "dans l'acide"], ["eaNeutre", "vers la neutralité", "vers la neutralité"]].filter(([c]) => E[c] != null);
    let barres = null;
    if (EA.length) {
      const iv = (x) => (Array.isArray(x) ? x : [x, x]), fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
      const fac = (e) => fr1(Math.exp((e * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)));
      const facs = EA.map(([c, , dans]) => { const [a, b] = iv(E[c]), fa = fac(a), fb = fac(b); return `${fa === fb ? fa : `${fa} à ${fb}`} ${dans}`; });
      barres = {
        titre: "Énergie d'activation de la dissolution", unite: "kJ/mol", max: 100, graduations: [0, 25, 50, 75, 100],
        onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: EA.map(([c, nom]) => { const [a, b] = iv(E[c]), plage = a !== b;
          return { nom: majuscule(nom), el: N.M, hachure: plage, val: { ea: plage ? [a, b] : [0, b] }, txt: { ea: plage ? `${fr1(a)} à ${fr1(b)} kJ/mol` : `${fr1(b)} kJ/mol` } }; }),
        explic: { ea: `L'énergie qu'il faut fournir pour que la réaction se fasse : plus elle est grande, plus la chaleur accélère la dissolution. De 25 à 35 °C, la vitesse est multipliée par ${facs.join(", ")} : un sol chaud altère nettement plus vite l'olivine.` },
      };
    }
    let temps = null;
    if (rep && rep.eau && d.onglets.eau && d.onglets.eau.t) {
      const lent = d.onglets.eau.t > rep.eau.t, f = O.rond2(lent ? d.onglets.eau.t / rep.eau.t : rep.eau.t / d.onglets.eau.t);
      temps = {
        titre: "Ce qui règle la vitesse",
        explic: `${T.tempsExplic || ""} ${majuscule(rep.la)} sert de repère. Barres : écart entre les valeurs publiées.`.trim(),
        rangees: [{ titre: "Une unité de la surface quitte le cristal, dans l'eau à 25 °C", fois: `environ ${nb(f, O)} fois plus ${lent ? "lent" : "rapide"} pour ${d.la}`,
          pts: [{ el: rep.cation, min: rep.eau.tmin, max: rep.eau.tmax, v: rep.eau.t, et: `${rep.nom} · ${rep.eau.court}`, ou: "haut" },
            { el: "Si", min: d.onglets.eau.tmin, max: d.onglets.eau.tmax, v: d.onglets.eau.t, et: `${d.nom} · ${d.onglets.eau.court}`, ou: "bas" }] }],
      };
    }
    return { duo, barres, temps };
  }

  for (const [nom, V] of [["tetraedres", OLI], ["tetraedres-grenat", GRE]]) Liaisons.scene(nom, {
    onglets: () => [{ k: "eau", nom: "Dans l'eau du sol" }, { k: "acide", nom: "Dans l'acide" }],
    decor: (k, d, O) => decor(k, d, O, V), etapes: (k, d, O) => etapes(k, d, O, V), energie: (d, O) => energie(d, O, V),
    jauge: (d) => ({ titre: `voisins du ${Liaisons.outils.nomEl(d.cation)} suivi`, n: V.n, classes: ["lp-j-o", "lp-j-ow"] }),
    legende: () => ({ "e:O": "oxygène du cristal", "i:Cl−": "Cl⁻, ne réagit pas",
      "t:avant": "atome juste devant le plan du dessin (en contour)", "t:arriere": "couche juste derrière le plan du dessin (plus petite, pâle)" }),
    aria: (d) => `Coupe du bord d'un cristal de ${d.nom}, étape par étape`,
  });
})();
