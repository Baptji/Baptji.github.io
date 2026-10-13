// ============ Liaisons du cristal — scène de la famille « sels-peu-solubles » (gabarit de l'apatite) ============
// 10/10/2026 (prototype : apatite). Même coupe schématique que les tétraèdres isolés : groupes PO₄ (les 4 O en carré) reliés par le
// calcium ; un site de centre de maille sur trois porte un F⁻ au lieu d'un Ca : 3 PO₄, 5 Ca, 1 F, soit Ca₅(PO₄)₃F. Mécanisme (Chaïrat
// et al. 2007) : le fluor et un calcium quittent d'abord la surface (Ca échangé contre des H⁺) ; la couche appauvrie se défait ensuite
// (étape lente) et le phosphate part en H₂PO₄⁻. Produits (« Ce que donne son altération ») : Ca²⁺, H₂PO₄⁻, F⁻ (+ HCO₃⁻ avec le CO₂).
(function () {
  "use strict";
  const S = 70, X0 = 60, Y0 = 196, L = 12, LW = 32, NS = 4;
  const tP = (j, c) => [X0 + c * S, Y0 + j * S];
  const tExiste = (j, c) => c >= 0 && c <= 8 && j >= 0 && j <= 2 && !(j === 0 && c > NS);
  const OS = [[1, -1], [1, 1], [-1, -1], [-1, 1]];
  const oP = (j, c, i) => { const [x, y] = tP(j, c); return [x + OS[i][0] * L, y + OS[i][1] * L]; };
  const m2P = (j, c) => [X0 + (c + 0.5) * S, Y0 + j * S], m1P = (j, c) => [X0 + (c + 0.5) * S, Y0 + (j + 0.5) * S];
  const m2Existe = (j, c) => tExiste(j, c) && (tExiste(j, c + 1) || (j === 0 && c === NS)) && c <= 7;
  const m1Existe = (j, c) => j >= 0 && j <= 1 && c >= -1 && c <= 7 && X0 + (c + 0.5) * S > 0;
  const estF = (c, d) => !(d.textes && d.textes.sansF) && ((c % 3) + 3) % 3 === 2;
  const m2O = (j, c) => [[j, c, 0], [j, c, 1], [j, c + 1, 2], [j, c + 1, 3]].filter(([a, b]) => tExiste(a, b));
  const m1O = (j, c) => [[j, c, 1], [j, c + 1, 3], [j + 1, c, 0], [j + 1, c + 1, 2]].filter(([a, b]) => tExiste(a, b));
  const MS = [0, NS], TS = [0, NS], FS = [0, NS + 1];
  const autourTS = [["m2", 0, NS - 1, 2], ["m2", 0, NS - 1, 3], ["m1", 0, NS - 1, 3], ["m1", 0, NS, 1]];
  const VF = 1 / 3;
  // oxalates (whewellite, weddellite : textes.oxalate, 11/10/2026) : le groupe C₂O₄ remplace le tétraèdre, mêmes quatre oxygènes ;
  // deux carbones liés entre eux au centre (DC de part et d'autre), chacun tenant les deux oxygènes de son côté (T0, T1 à droite ; T2, T3 à gauche)
  const DC = 6, cOx = (i) => (OS[i][0] > 0 ? 1 : -1);
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const nb = (x, O) => (x < 10 ? String(Math.round(x * 10) / 10).replace(".", ",") : O.sp(Math.round(x)));
  // sulfates (barytine, célestine, anglésite : textes.anion = "S", textes.sansF) : même coupe, S au centre des carrés, tous les creux
  // occupés par le cation ; l'anion de l'apatite est P, son cation Ca
  const vals = (d) => { const an = (d.textes && d.textes.anion) || "P", cat = d.cation;
    return { an, cat, vP: d.valences[`${an}-O`], vC: d.valences[`${cat}-O`], pP: `${an}–O`, pC: `${cat}–O` }; };

  // relief (comme la forstérite) : arête du dessus, positions de tous les O et cations pour la couche de derrière
  const XB = X0 + (NS + 0.5) * S + 14, BORD = [[0, 172], [XB, 172], [XB, 212], [640, 212]];
  const tousO = [], tousM = [], tousM2 = [];
  for (let j = 0; j <= 2; j++) for (let c = 0; c <= 8; c++) if (tExiste(j, c)) for (let i = 0; i < 4; i++) tousO.push(oP(j, c, i));
  for (let j = 0; j <= 2; j++) for (let c = 0; c <= 7; c++) if (m2Existe(j, c)) { tousM.push(m2P(j, c)); tousM2.push(m2P(j, c)); }
  for (let j = 0; j <= 1; j++) for (let c = -1; c <= 7; c++) if (m1Existe(j, c)) tousM.push(m1P(j, c));
  function relief(A, B, M0, T0, io, el, O, seulM2) {   // voisins hors du plan du cation suivi et du tétraèdre suivi (liaisons mV, mA, tV, tA)
    const R = O.relief, mv = R.devant(M0), tv = R.devant(T0), oA = tousO.map(R.derriere), mA = (seulM2 ? tousM2 : tousM).map(R.derriere), oTS = [0, 1, 2, 3].map((i) => oP(...TS, i));
    A.MV = Object.assign({ t: "at", el: "O", x: mv[0], y: mv[1], r: 8.5 }, R.avant);
    A.TV = Object.assign({ t: "at", el, x: tv[0], y: tv[1] }, R.avant);
    B.mV = io("M", "MV"); B.mA = io("M", oA[R.proche(oA, M0)]); B.tV = io("TV", "T" + R.proche(oTS, tv));
    const ma = mA[R.proche(mA, T0)]; B.tA = io(ma, "T" + R.proche(oTS, ma));
  }

  function decor(k, d, O) {
    if (d.textes && d.textes.hydrate) return decorH(k, d, O);
    const { an, cat, vP, vC, pP, pC } = vals(d);
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>${O.relief.dessus(BORD)}<path d="M0 172 H${XB} V212 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    const estTS = (j, c) => j === TS[0] && c === TS[1];
    for (let j = 0; j <= 2; j++) for (let c = 0; c <= 8; c++) {
      if (!tExiste(j, c) || estTS(j, c)) continue;
      const [x, y] = tP(j, c);
      if (d.textes && d.textes.oxalate) {
        l += O.lien(x - DC, y, x + DC, y, { k: "cov", v: 1, el: an, p: "C–C" });
        for (let i = 0; i < 4; i++) { const [ox, oy] = oP(j, c, i); l += O.lien(x + cOx(i) * DC, y, ox, oy, { k: "cov", v: vP, el: an, p: pP }); a += O.atome(ox, oy, "O"); }
        a += O.atome(x - DC, y, an) + O.atome(x + DC, y, an);
        continue;
      }
      for (let i = 0; i < 4; i++) { const [ox, oy] = oP(j, c, i); l += O.lien(x, y, ox, oy, { k: "cov", v: vP, el: an, p: pP }); a += O.atome(ox, oy, "O"); }
      a += O.atome(x, y, an);
    }
    for (let j = 0; j <= 2; j++) for (let c = 0; c <= 7; c++) if (m2Existe(j, c) && !(j === MS[0] && c === MS[1])) {
      const [x, y] = m2P(j, c);
      for (const [oj, oc, oi] of m2O(j, c)) if (!estTS(oj, oc)) { const [ox, oy] = oP(oj, oc, oi); l += O.lien(x, y, ox, oy, { k: "ion", v: vC, p: pC }); }
      a += O.atome(x, y, cat);
    }
    for (let j = 0; j <= 1; j++) for (let c = -1; c <= 7; c++) if (m1Existe(j, c)) {
      const [x, y] = m1P(j, c);
      if (estF(c, d)) {   // F⁻ : tenu par les calcium au-dessus et au-dessous (dans le plan)
        if (j === FS[0] && c === FS[1]) continue;
        for (const q of [[j, c], [j + 1, c]]) if (m2Existe(...q)) { const [cx, cy] = m2P(...q); l += O.lien(x, y, cx, cy, { k: "ion", v: VF, p: "Ca–F" }); }
        a += O.atome(x, y, "F");
        continue;
      }
      if (d.textes && d.textes.eauCristal) {   // gypse : une molécule d'eau du cristal, tenue par les calcium au-dessus et au-dessous
        for (const q of [[j, c], [j + 1, c]]) if (m2Existe(...q)) { const [cx, cy] = m2P(...q); l += O.lien(x, y, cx, cy, { k: "eau", v: vC, p: pC }); }
        a += O.eau(x, y, 0);
        continue;
      }
      if (j === 0 && x > X0 + (NS + 0.5) * S + 1) { l += O.lien(x, y, x, y - LW, { k: "eau", v: vC, p: pC }); a += O.eau(x, y - LW, -90); }
      for (const [oj, oc, oi] of m1O(j, c)) if (!estTS(oj, oc)) { const [ox, oy] = oP(oj, oc, oi); l += O.lien(x, y, ox, oy, { k: "ion", v: vC, p: pC }); }
      a += O.atome(x, y, cat);
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    for (const [x, y, an] of [[90, 120, 20], [206, 44, 150], [604, 130, 60], [540, 40, 200], [150, 150, 300]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") {
      for (const [x, y] of [[60, 70], [172, 92], [398, 30], [612, 62], [300, 150]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 22], [450, 150], [330, 62]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }

  function etapes(k, d, O) {
    if (d.textes && d.textes.hydrate) return etapesH(k, d, O);
    if (d.textes && d.textes.sansF) return etapesSulfate(k, d, O);
    const { vP, vC } = vals(d), o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const M0 = m2P(...MS), T0 = tP(...TS), F0 = m1P(...FS), CF = m2P(1, NS + 1);
    const versA = (q, an, Lg = LW) => ({ x: q.x + Lg * Math.cos(an * Math.PI / 180), y: q.y + Lg * Math.sin(an * Math.PI / 180), a: an });
    const posT = (x, y) => { const r = {}; OS.forEach(([sx, sy], i) => { r["T" + i] = { x: x + sx * L, y: y + sy * L }; }); r.TS = { x, y }; return r; };
    const io = (a, b) => ({ a, b, k: "ion", v: vC, p: "Ca–O" }), we = (b) => ({ a: "M", b, k: "eau", v: vC, p: "Ca–O" });
    const po = (b) => ({ a: "TS", b, k: "cov", v: vP, el: "P", p: "P–O" }), oh = (a, b) => ({ a, b, k: "oh" });
    const t0 = posT(...T0), suite = O.suite, e = [];
    const A = Object.assign({
      Wu: { t: "eau", x: M0[0], y: M0[1] - LW, a: -90 }, Wr: { t: "eau", x: M0[0] + LW, y: M0[1], a: 0 },
      Wa: { t: "eau", x: 486, y: 132, a: 200 }, Wb: { t: "eau", x: 560, y: 90, a: 30 },
      Ha: { t: "hp", x: 430, y: 120 }, Hb: { t: "hp", x: 470, y: 60 },
      F: { t: "at", el: "F", x: F0[0], y: F0[1] },
      M: { t: "at", el: "Ca", x: M0[0], y: M0[1] },
      halo: { t: "halo", x: F0[0], y: F0[1], r: 16 },
    }, Object.fromEntries(Object.entries(t0).map(([key, p]) => [key, Object.assign({ t: "at", el: key === "TS" ? "P" : "O" }, p)])));
    const B = { wu: we("Wu"), wr: we("Wr"), mUr: io("M", "T0"), mDr: io("M", "T1"), s0: po("T0"), s1: po("T1"), s2: po("T2"), s3: po("T3"),
      fc: { a: "F", b: CF, k: "ion", v: VF, p: "Ca–F" } };
    autourTS.forEach(([ty, j, c, i], n) => { B["c" + n] = io(ty === "m2" ? m2P(j, c) : m1P(j, c), "T" + i); });
    relief(A, B, M0, T0, io, d.cation, O);
    e.push({ A, B, L: {}, h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? "Le bord d'une marche du cristal" : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? "Des groupes phosphate PO₄ (le phosphore au centre de quatre oxygènes) tenus par le calcium ; dans certains creux, un ion fluorure F⁻ (cerclé, au bord) à la place d'un calcium. Trois PO₄, cinq calcium, un fluor : Ca₅(PO₄)₃F."
        : "L'acide libère des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Le fluorure du bord est cerclé.",
    });
    const m1 = { x: M0[0] + 8, y: M0[1] - 6 }, hO = (q, an) => Object.assign(versA(q, an, 13), { t: "h" });
    e.push(suite(e[0], {
      titre: "Le fluor et un calcium partent d'abord",
      texte: `Le fluorure du bord s'en va, et deux H⁺ prennent la place d'un calcium : la surface s'appauvrit vite en fluor et en calcium.${k === "eau" ? " Ces H⁺ viennent de l'acide carbonique, le CO₂ dissous dans l'eau du sol : chacun laisse un ion bicarbonate HCO₃⁻." : ""}`,
      A: { F: { x: 396, y: 128 }, halo: { x: 396, y: 128, o: 0 }, Ha: hO(t0.T0, -60), Hb: hO(t0.T1, 60), M: { x: 520, y: 92 },
        Wu: { x: 520, y: 60, a: -90 }, Wr: { x: 552, y: 92, a: 0 }, Wa: { x: 520, y: 124, a: 90 }, Wb: { x: 488, y: 92, a: 180 } },
      B: { fc: 0, mUr: 0, mDr: 0, mV: 0, mA: 0, h0: oh("T0", "Ha"), h1: oh("T1", "Hb"), wa: we("Wa"), wb: we("Wb") },
      L: Object.assign({ lF: { x: 396, y: 154, t: "F⁻", m: 1 }, lM: { x: 520, y: 156, t: "Ca²⁺", m: 1 } }, k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {}),
    }));
    const t3 = posT(250, 92);
    e.push(suite(e[1], {
      titre: "La couche appauvrie se défait",
      texte: `Privé de fluor et de calcium, le bord ne tient plus : ${k === "acide" ? "les H⁺ y pénètrent" : "l'eau s'y fixe"}, les dernières liaisons Ca–O du phosphate lâchent, et il part en H₂PO₄⁻. C'est l'étape lente ; ses liaisons P–O, elles, ne cassent pas.`,
      A: Object.assign({}, t3, { Ha: hO(t3.T0, -45), Hb: hO(t3.T1, 45) }),
      B: { c0: 0, c1: 0, c2: 0, c3: 0, tV: 0, tA: 0 }, h: Object.assign({ cours: true }, H),
      L: { lT: { x: 250, y: 140, t: "H₂PO₄⁻", m: 1 } },
    }));
    const v = m2P(0, NS - 1);
    e.push(suite(e[2], {
      titre: "La marche recule d'un cran",
      texte: `Le calcium voisin se retrouve au bord, et tout recommence. Ce qui part avec l'eau : du calcium, du phosphate et du fluorure ; c'est la source du phosphore des sols et des rivières.`,
      A: { halo: { x: v[0], y: v[1], o: 1, r: 17 } }, h: H,
    }));
    return e;
  }

  // ---- sulfates : le cation du bord part entouré d'eau, puis le sulfate part entier (les liaisons S–O ne cassent pas) ----
  function etapesSulfate(k, d, O) {
    const { an, cat, vP, vC, pP, pC } = vals(d), o = d.onglets[k] || {}, hv = o.t ?? null;
    const nomC = d.textes.nomCation || cat, H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const M0 = m2P(...MS), T0 = tP(...TS);
    const ox = !!d.textes.oxalate;
    const posT = (x, y) => { const r = {}; OS.forEach(([sx, sy], i) => { r["T" + i] = { x: x + sx * L, y: y + sy * L }; });
      if (ox) { r.TS = { x: x + DC, y }; r.TS2 = { x: x - DC, y }; } else r.TS = { x, y }; return r; };
    const io = (a, b) => ({ a, b, k: "ion", v: vC, p: pC }), we = (b) => ({ a: "M", b, k: "eau", v: vC, p: pC });
    const so = (b) => ({ a: ox && cOx(+b.slice(1)) < 0 ? "TS2" : "TS", b, k: "cov", v: vP, el: an, p: pP });
    const t0 = posT(...T0), suite = O.suite, e = [];
    const A = Object.assign({
      Wu: { t: "eau", x: M0[0], y: M0[1] - LW, a: -90 }, Wr: { t: "eau", x: M0[0] + LW, y: M0[1], a: 0 },
      Wa: { t: "eau", x: 486, y: 132, a: 200 }, Wb: { t: "eau", x: 560, y: 90, a: 30 },
      M: { t: "at", el: cat, x: M0[0], y: M0[1] },
      halo: { t: "halo", x: M0[0], y: M0[1], r: 17 },
    }, Object.fromEntries(Object.entries(t0).map(([key, p]) => [key, Object.assign({ t: "at", el: key === "TS" || key === "TS2" ? an : "O" }, p)])));
    const B = { wu: we("Wu"), wr: we("Wr"), mUr: io("M", "T0"), mDr: io("M", "T1"), s0: so("T0"), s1: so("T1"), s2: so("T2"), s3: so("T3") };
    if (ox) B.cc = { a: "TS2", b: "TS", k: "cov", v: 1, el: an, p: "C–C" };
    const eC = !!d.textes.eauCristal;   // gypse : les creux m1 portent de l'eau, liée au sulfate par liaison hydrogène
    autourTS.forEach(([ty, j, c, i], n) => { B["c" + n] = ty === "m1" && eC ? { a: m1P(j, c), b: "T" + i, k: "oh" } : io(ty === "m2" ? m2P(j, c) : m1P(j, c), "T" + i); });
    relief(A, B, M0, T0, io, d.cation, O, eC);
    const ion = `${cat}${d.textes.charge || "²⁺"}`;   // jarosite : K⁺
    e.push({ A, B, L: {}, h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? "Le bord d'une marche du cristal" : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? (d.textes.debut || `Des groupes sulfate SO₄ (le soufre au centre de quatre oxygènes) tenus par le ${nomC}, chaque ion ${ion} entre ${d.textes.voisins || "une dizaine d'"}oxygènes. Le ${nomC} du bord est cerclé ; l'eau le touche déjà.`)
        : "L'acide libère des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Le même bord, le même ion cerclé.",
    });
    if (d.textes.reste) {   // 11/10/2026 : monazite : les H⁺ se posent sur les oxygènes du phosphate, mais les terres rares ne partent pas
      const hO = (q, an) => ({ t: "h", x: q.x + 13 * Math.cos(an * Math.PI / 180), y: q.y + 13 * Math.sin(an * Math.PI / 180) });
      A.Ha = { t: "hp", x: 430, y: 120 }; A.Hb = { t: "hp", x: 470, y: 60 };
      const oh = (a, b) => ({ a, b, k: "oh" });
      e.push(suite(e[0], {
        titre: "Des H⁺ se posent sur les oxygènes",
        texte: `Des H⁺ se fixent sur les oxygènes qui tiennent le ${nomC} du bord.${k === "eau" && d.textes.eauH ? " " + d.textes.eauH : ""}`,
        A: { Ha: hO(t0.T0, -60), Hb: hO(t0.T1, 60) }, B: { h0: oh("T0", "Ha"), h1: oh("T1", "Hb") },
        L: k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {},
      }));
      e.push(suite(e[1], {
        titre: `Le ${nomC} ne part pas`,
        texte: `${d.textes.reste} ${o.lettres ? "" : "Aucune vitesse de départ n'a été mesurée à 25 °C."}`.trim(),
        h: Object.assign({ cours: true }, H),
      }));
      e.push(suite(e[2], {
        titre: "Les H⁺ repartent, la marche ne bouge pas",
        texte: `Les H⁺ retournent à l'eau : le bord est le même qu'au début.${d.textes["fin_" + k] ? " " + d.textes["fin_" + k] : ""}`,
        A: { Ha: { t: "hp", x: 430, y: 120 }, Hb: { t: "hp", x: 470, y: 60 } }, B: { h0: 0, h1: 0 }, L: { lB: 0 }, h: H,
      }));
      return e;
    }
    const anNom = d.textes.anionNom || "sulfate", anIon = d.textes.anionIon || "SO₄²⁻";   // vivianite : phosphate (11/10/2026)
    const t3 = posT(250, 92), tE = d.onglets.eau && d.onglets.eau.t, tA = d.onglets.acide && d.onglets.acide.t;
    const plusVite = k !== "acide" || !tE || !tA ? "" : Math.abs(tE / tA - 1) < 0.05
      ? " Les H⁺ n'y changent rien : on n'a mesuré aucun effet du pH." : ` Les H⁺ ne font qu'aider un peu : ${nb(tE / tA, O)} fois plus vite qu'à pH 7.`;
    e.push(suite(e[0], {
      titre: `Le ${nomC}, puis le ${anNom}, partent`,
      texte: `L'eau entoure le ${nomC} du bord : ses liaisons ${cat}–O avec le cristal lâchent et il part en ${ion}. Le ${anNom}, qui ne tient plus que par ses voisins, part à son tour, entier : ${anIon}. Ses liaisons ${an}–O ne cassent pas.${plusVite} Le temps est celui ${d.textes.unite || "d'un groupe " + d.formule} de la surface.`,
      A: Object.assign({}, t3, { halo: { x: 520, y: 92, o: 0 }, M: { x: 520, y: 92 },
        Wu: { x: 520, y: 60, a: -90 }, Wr: { x: 552, y: 92, a: 0 }, Wa: { x: 520, y: 124, a: 90 }, Wb: { x: 488, y: 92, a: 180 } }),
      B: { mUr: 0, mDr: 0, mV: 0, mA: 0, c0: 0, c1: 0, c2: 0, c3: 0, tV: 0, tA: 0, wa: we("Wa"), wb: we("Wb") }, h: Object.assign({ cours: true }, H),
      L: { lM: { x: 520, y: 156, t: ion, m: 1 }, lT: { x: 250, y: 140, t: anIon, m: 1 } },
    }));
    const v = m2P(0, NS - 1);
    e.push(suite(e[1], {
      titre: "La marche recule d'un cran",
      texte: d.textes.recule || `Le ${nomC} voisin se retrouve au bord, et tout recommence. Mais l'eau se sature vite en ${nomC} et en sulfate : la dissolution ralentit puis s'arrête. ${majuscule(d.la)} dure parce qu'elle est peu soluble, pas parce que ses liaisons sont lentes à lâcher.`,
      A: { halo: { x: v[0], y: v[1], o: 1, r: 17 } }, h: H,
    }));
    return e;
  }


  // ---- sels hydratés (epsomite, mirabilite : textes.hydrate, 11/10/2026) : le cation ne touche AUCUN sulfate ; il est entouré de six
  // molécules d'eau DANS le cristal (quatre dessinées, dans le plan) ; les octaèdres M(H₂O)₆ et les sulfates ne se tiennent que par des
  // liaisons hydrogène (les H des eaux tournés vers les O des sulfates). Damier : sulfate si (j + c) impair, cation hydraté sinon ; le
  // cation suivi est au coin de la marche (0, NS), le sulfate suivi juste à gauche (0, NS − 1). Rien ne casse dans les groupes : le cation
  // part avec ses eaux, le sulfate part entier.
  const estSulf = (j, c) => (j + c) % 2 === 1, RW = 26;
  const WH = [[RW, 0, 0], [-RW, 0, 180], [0, -RW, -90], [0, RW, 90]];
  const XBH = X0 + (NS + 0.5) * S + 14, BORDH = [[0, 150], [XBH, 150], [XBH, 220], [640, 220]];
  function decorH(k, d, O) {
    const { an, cat, vP, vC, pP, pC } = vals(d), MH = [0, NS], TH = [0, NS - 1];
    let l = `<rect x="0" y="0" width="640" height="340" class="lp-f-eau"/>${O.relief.dessus(BORDH)}<path d="M0 150 H${XBH} V220 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    for (let j = 0; j <= 2; j++) for (let c = 0; c <= 8; c++) {
      if (!tExiste(j, c) || (j === MH[0] && c === MH[1]) || (j === TH[0] && c === TH[1])) continue;
      const [x, y] = tP(j, c);
      if (estSulf(j, c)) {
        for (let i = 0; i < 4; i++) { const [ox, oy] = oP(j, c, i); l += O.lien(x, y, ox, oy, { k: "cov", v: vP, el: an, p: pP }); a += O.atome(ox, oy, "O"); }
        a += O.atome(x, y, an);
      } else {
        for (const [dx, dy, ang] of WH) { l += O.lien(x, y, x + dx, y + dy, { k: "eau", v: vC, p: pC }); a += O.eau(x + dx, y + dy, ang); }
        a += O.atome(x, y, cat);
      }
    }
    for (const [x, y, ang] of [[90, 110, 20], [206, 44, 150], [604, 130, 60], [560, 40, 200], [150, 140, 300], [440, 120, 80]]) a += O.eau(x, y, ang, { decor: true });
    return { l, a };
  }
  function etapesH(k, d, O) {
    const { an, cat, vP, vC, pP, pC } = vals(d), T = d.textes, o = d.onglets[k] || {}, hv = o.t ?? null;
    const nomC = T.nomCation || cat, H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const M0 = tP(0, NS), T0 = tP(0, NS - 1), suite = O.suite, e = [];
    const posT = (x, y) => { const r = {}; OS.forEach(([sx, sy], i) => { r["T" + i] = { x: x + sx * L, y: y + sy * L }; }); r.TS = { x, y }; return r; };
    const posM = (x, y) => { const r = { M: { x, y } }; WH.forEach(([dx, dy, ang], i) => { r["W" + i] = { x: x + dx, y: y + dy, a: ang }; }); return r; };
    const so = (b) => ({ a: "TS", b, k: "cov", v: vP, el: an, p: pP }), we = (b) => ({ a: "M", b, k: "eau", v: vC, p: pC });
    const A = Object.assign({ halo: { t: "halo", x: M0[0], y: M0[1], r: 17 } },
      Object.fromEntries(Object.entries(posT(...T0)).map(([key, p]) => [key, Object.assign({ t: "at", el: key === "TS" ? an : "O" }, p)])),
      Object.fromEntries(Object.entries(posM(...M0)).map(([key, p]) => [key, Object.assign(key === "M" ? { t: "at", el: cat } : { t: "eau" }, p)])));
    const B = { s0: so("T0"), s1: so("T1"), s2: so("T2"), s3: so("T3"), w0: we("W0"), w1: we("W1"), w2: we("W2"), w3: we("W3") };
    e.push({ A, B, L: {}, h: { v: hv === null ? null : 0 },
      titre: "Le bord d'une marche du cristal",
      texte: T.debut || `Le ${nomC} ne touche aucun sulfate : dans le cristal même, il est déjà entouré de six molécules d'eau (quatre dessinées). Ses eaux tiennent les sulfates voisins par leurs hydrogènes : de simples liaisons hydrogène. Le ${nomC} du bord est cerclé.`,
    });
    e.push(suite(e[0], {
      titre: `Le ${nomC} part avec ses eaux`,
      texte: `L'eau du sol prend la place des sulfates auprès des hydrogènes : les liaisons hydrogène lâchent, et le ${nomC} s'en va tel quel, en ${d.hydrate}. Aucune liaison ${cat}–O ne casse.${T.lent ? " " + T.lent : ""}`,
      A: Object.assign({ halo: { x: 520, y: 92, o: 0 } }, posM(520, 92)),
      h: Object.assign({ cours: true }, H),
      L: { lM: { x: 520, y: 148, t: d.hydrate, m: 1 } },
    }));
    e.push(suite(e[1], {
      titre: "Le sulfate part, entier",
      texte: "Le sulfate du bord ne tient plus que par les eaux de ses autres voisins : il part à son tour, SO₄²⁻, sans qu'aucune liaison S–O ne casse.",
      A: posT(250, 92), L: { lT: { x: 250, y: 132, t: "SO₄²⁻", m: 1 } },
    }));
    const v = tP(0, NS - 2);
    e.push(suite(e[2], {
      titre: "La marche recule d'un cran",
      texte: T.recule || `Le ${nomC} voisin se retrouve au bord, et tout recommence.`,
      A: { halo: { x: v[0], y: v[1], o: 1, r: 17 } }, h: H,
    }));
    return e;
  }
  function energieH(d, O) {
    const { cat, vC } = vals(d), T = d.textes, nomC = T.nomCation || cat;
    return { barres: null, temps: null, duo: [
      { titre: "S–O", sous: `liaison ${O.nature("S–O")} (électrons en partie partagés)`,
        schema: { type: "partage", a: "S", b: "O", aria: "Soufre et oxygène partagent des électrons" },
        li: [`Ionique ${O.fraction(O.ionicite("S", "O"))} seulement (Pauling) : le groupe sulfate part entier.`] },
      { titre: `${cat}–O de l'eau`, sous: `liaison ${O.nature(`${cat}–O`)} (électrons cédés)`,
        schema: { type: "don", a: cat, la: `${cat}${T.charge || "²⁺"}`, ra: 20, fa: 12, b: "O", aria: `Le ${nomC} cède ses électrons à ses molécules d'eau` },
        li: [`Ionique ${O.fraction(O.ionicite(cat, "O"))} (Pauling) ; chaque liaison vaut ${String(vC).replace(".", ",")} de liaison simple. Elle ne casse pas : le ${nomC} part avec ses eaux.`,
          "Ce qui lâche, ce sont les liaisons hydrogène entre ces eaux et les sulfates, bien plus faibles qu'une liaison entre ions."] },
    ] };
  }

  function energie(d, O) {
    if (d.textes && d.textes.hydrate) return energieH(d, O);
    if (d.textes && d.textes.sansF) {
      const { an, cat, vC } = vals(d), T = d.textes, ion = (x) => x.replace("{ion}", O.fraction(O.ionicite(cat, "O"))), nomC = d.textes.nomCation || cat, n = d.distances[`${cat}-O`] ? d.distances[`${cat}-O`].n : null;
      return { barres: null, temps: null, duo: [
        { titre: `${an}–O`, sous: `liaison ${O.nature(`${an}–O`)} (électrons en partie partagés)`,
          schema: { type: "partage", a: an, b: "O", aria: `${an === "P" ? "Phosphore" : "Soufre"} et oxygène partagent des électrons` },
          li: T.liAn ? T.liAn.split(" | ") : [`Ionique ${O.fraction(O.ionicite("S", "O"))} seulement (Pauling) : le soufre partage ses électrons avec ses quatre oxygènes, une liaison et demie chacun. Le groupe sulfate part entier.`] },
        { titre: `${cat}–O`, sous: `liaison ${O.nature(`${cat}–O`)} (électrons cédés)`,
          schema: { type: "don", a: cat, la: `${cat}${T.charge || "²⁺"}`, ra: 20, fa: 12, b: "O", aria: `Le ${nomC} cède ses électrons aux sulfates` },
          li: T.liM ? T.liM.split(" | ").map(ion) : [`Ionique ${O.fraction(O.ionicite(cat, "O"))} (Pauling). Sa charge se répartit sur ${n && n >= 10 ? "une dizaine d'" : "huit à douze "}oxygènes : chaque liaison ${cat}–O vaut un cinquième de liaison simple environ (${String(vC).replace(".", ",")}). C'est elle qui lâche.`] },
      ] };
    }
    const duo = [
      { titre: "P–O", sous: `liaison ${O.nature("P–O")} (électrons en partie partagés)`,
        schema: { type: "partage", a: "P", b: "O", aria: "Phosphore et oxygène partagent des électrons" },
        li: [`Ionique ${O.fraction(O.ionicite("P", "O"))} seulement (Pauling) : le phosphore partage ses électrons avec ses quatre oxygènes, plus d'une liaison simple chacun. Le groupe phosphate part entier.`] },
      { titre: "Ca–O", sous: `liaison ${O.nature("Ca–O")} (électrons cédés)`,
        schema: { type: "don", a: "Ca", la: "Ca²⁺", ra: 18, fa: 12, b: "O", aria: "Le calcium cède ses électrons aux phosphates" },
        li: [`Ionique ${O.fraction(O.ionicite("Ca", "O"))} (Pauling). Sa charge se répartit sur sept à neuf oxygènes : chaque liaison Ca–O vaut un quart de liaison simple ou moins. C'est elle qui lâche.`] },
    ];
    return { duo, barres: null, temps: null };
  }

  Liaisons.scene("sels-peu-solubles", {
    onglets: (d) => [{ k: "eau", nom: "Dans l'eau du sol" }, { k: "acide", nom: "Dans l'acide" }].filter((o) => !d || !d.onglets || d.onglets[o.k]),
    decor, etapes, energie,
    legende: (d) => d && d.textes && d.textes.hydrate ? { "e:O": "oxygène du sulfate", "t:eau": "molécule d'eau (du cristal ou du sol)" } : Object.assign(d && d.textes && d.textes.sansF ? { "e:O": "oxygène du cristal", "i:Cl−": "Cl⁻, ne réagit pas" }
      : { "e:O": "oxygène du cristal", "e:F": "fluorure (F⁻)", "i:Cl−": "Cl⁻, ne réagit pas" },
      { "t:avant": "atome juste devant le plan du dessin (en contour)", "t:arriere": "couche juste derrière le plan du dessin (plus petite, pâle)" }),
    aria: (d) => `Coupe du bord d'un cristal d'${d.nom}, étape par étape`,
  });
})();
