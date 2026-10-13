// ============ Liaisons du cristal — scène de la famille « carbonates » (type calcite) ============
// 09/10/2026 (étape 1 du chantier) : la scène validée de la magnésite, portée sur le moteur liaisons.js. Elle vaut pour les carbonates
// du type calcite : un cation en octaèdre (6 oxygènes de 6 carbonates différents), le groupe CO₃ part entier dans l'eau ; dans l'acide,
// H⁺ sur un oxygène, H₂CO₃, puis CO₂ + H₂O (seule liaison C–O cassée). Coupe en damier de la face de clivage {104} (structure de la
// calcite = celle du sel gemme, CO₃ à la place de Cl), marche en surface. Tout ce qui dépend du minéral vient de LIAISONS_DONNEES
// (cation, hydrate, valences, durées, textes propres) ; contrat : tools/liaisons/API.md.
(function () {
  "use strict";
  const S = 56, X0 = 40, Y0 = 196, RCO = 24, LMO = 34;
  const P = (r, c) => [X0 + c * S, Y0 + r * S];
  const existe = (r, c) => c >= 0 && c <= 10 && r >= 0 && r <= 3 && !(r === 0 && c > 6);
  const estM = (r, c) => (r + c) % 2 === 0;
  const angle = (r, c) => ((c + r) % 4 === 1 ? 0 : 180);
  // type aragonite (cation en 9) : rangées paires, triangles tournés de 0 ou 300° ; rangées impaires, de 90 ou 270° → certains carbonates
  // présentent une ARÊTE au cation (deux oxygènes liés) ; le carbonate suivi (0,5), celui du dessous (1,6) et celui de devant en font partie
  const angleA = (r, c) => (r % 2 === 0 ? ((c + r) % 4 === 1 ? 300 : 0) : ((c + r) % 4 === 3 ? 90 : 270));
  const CAL = { angle, angleV: (d) => angle(...MS), bi: false, n: 6 };
  const ARA = { angle: angleA, angleV: () => 262, bi: true, n: 9 };
  const MS = [0, 6], TS = [0, 5];
  // relief (comme le sel gemme) : couche juste derrière le plan, décalée en biais et réduite ; devant, les voisins des deux suivis
  const DA = [18, -15], KA = 0.74, DV = [-22, 17], KV = 1.1;
  const derriere = (q) => [q[0] + DA[0], q[1] + DA[1]], devant = (q) => [q[0] + DV[0], q[1] + DV[1]];
  const proche = (os, p) => { let k = 0, b = 1e9; os.forEach((o, i) => { const dd = Math.hypot(o[0] - p[0], o[1] - p[1]); if (dd < b) { b = dd; k = i; } }); return k; };
  const egal = (a, b) => a[0] === b[0] && a[1] === b[1];
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const nb = (x, O) => (x < 10 ? String(Math.round(x * 10) / 10).replace(".", ",") : O.sp(Math.round(x)));   // « 1,9 » et non « 1,9000000000000001 »

  function geometrie(O, V) {
    const carb = (x, y, t, l = RCO) => [0, 120, 240].map((a) => [x + l * Math.cos(O.rad(t + a)), y + l * Math.sin(O.rad(t + a))]);
    // liaisons cation → oxygène le plus proche de chaque carbonate voisin (4 dans le plan ; les 2 autres sont hors du dessin)
    const liens = [];
    for (let r = 0; r <= 3; r++) for (let c = 0; c <= 10; c++) {
      if (!existe(r, c) || !estM(r, c)) continue;
      const [mx, my] = P(r, c);
      for (const [dr, dc] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const r2 = r + dr, c2 = c + dc;
        if (!existe(r2, c2)) continue;
        const os = carb(...P(r2, c2), V.angle(r2, c2));
        let k = 0, best = 1e9;
        os.forEach((o, i) => { const dd = Math.hypot(o[0] - mx, o[1] - my); if (dd < best - 0.01) { best = dd; k = i; } });
        const L = { m: [r, c], co: [r2, c2], k, o: os[k], p: [mx, my] };
        if (V.bi) os.forEach((o, i) => { if (i !== k && Math.hypot(o[0] - mx, o[1] - my) < best + 1) { L.k2 = i; L.o2 = o; } });   // arête : deux oxygènes liés
        liens.push(L);
      }
    }
    const lienDe = (m, co) => liens.find((l) => egal(l.m, m) && egal(l.co, co));
    return { carb, liens, lienDe };
  }
  const val = (d) => ({ co: d.valences["C-O"], mo: d.valences[`${d.cation}-O`] });
  // dolomite : un second cation (textes.cation2) une colonne sur deux, en rangées alternées ; le cation suivi reste d.cation
  const elDe = (d, r, c) => (d.textes && d.textes.cation2 && (Math.floor(c / 2) + r) % 2 === 0 ? d.textes.cation2 : d.cation);

  // décor fixe : solution, cristal, ions et liaisons qui ne bougent pas
  function decor(k, d, O, V) {
    const G = geometrie(O, V), M = d.cation, v = val(d), pMO = `${M}–O`;
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>`
      + `<path d="M0 166 L${DA[0]} ${166 + DA[1]} H${404 + DA[0]} V${222 + DA[1]} H640 V222 H404 V166 Z" class="lp-f-dessus"/>`
      + `<path d="M0 166 H404 V222 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    // couche de derrière : un carbonate derrière chaque cation, un cation derrière chaque carbonate
    const ligne = (p, q, w) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" class="lp-l-prof" stroke-width="${w}"/>`;
    const arr = { cls: "lp-arriere", lg: "t:arriere" };
    for (const L of G.liens) l += ligne(derriere(P(...L.m)), derriere(P(...L.co)), 1.6);
    for (let r = 0; r <= 3; r++) for (let c = 0; c <= 10; c++) {
      if (!existe(r, c)) continue;
      const q = derriere(P(r, c));
      if (estM(r, c)) {
        const os = G.carb(q[0], q[1], V.angle(r, c) + 180, RCO * KA);
        l += os.map(([ox, oy]) => ligne(q, [ox, oy], 1.4)).join("") + os.map(([ox, oy]) => O.atome(ox, oy, "O", Object.assign({ r: 7.5 * KA }, arr))).join("") + O.atome(q[0], q[1], "C", Object.assign({ r: 5.5 * KA }, arr));
      } else l += O.atome(q[0], q[1], elDe(d, r, c + 1), Object.assign({ r: O.rayon ? O.rayon(d.cation) * KA : 8 }, arr));
      if (!egal([r, c], MS) && !egal([r, c], TS)) l += ligne(P(r, c), q, 2.2);
    }
    for (const L of G.liens) if (!egal(L.m, MS) && !egal(L.co, TS)) {
      const e2 = elDe(d, ...L.m);
      for (const o of L.o2 ? [L.o, L.o2] : [L.o]) l += O.lien(L.p[0], L.p[1], o[0], o[1], { k: "ion", v: d.valences[`${e2}-O`], p: `${e2}–O` });
    }
    for (const [r, c] of [[0, 0], [0, 2], [0, 4], [1, 9]]) {   // eau déjà posée au-dessus des cations de surface
      const [x, y] = P(r, c);
      l += O.lien(x, y, x, y - LMO, { k: "eau", v: v.mo, p: pMO });
      a += O.eau(x, y - LMO, -90);
    }
    for (let r = 0; r <= 3; r++) for (let c = 0; c <= 10; c++) {
      if (!existe(r, c) || egal([r, c], MS) || egal([r, c], TS)) continue;
      const [x, y] = P(r, c);
      if (estM(r, c)) { a += O.atome(x, y, elDe(d, r, c)); continue; }
      const os = G.carb(x, y, V.angle(r, c));
      l += os.map(([ox, oy]) => O.lien(x, y, ox, oy, { k: "cov", v: v.co, el: "C", p: "C–O" })).join("");
      a += os.map(([ox, oy]) => O.atome(ox, oy, "O")).join("") + O.atome(x, y, "C");
    }
    for (const [x, y, an] of [[96, 92, 20], [206, 44, 150], [604, 150, 60], [520, 168, 200]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") {   // l'acide chlorhydrique dans l'eau : beaucoup d'ions H⁺ (H₃O⁺) et des ions chlorure qui ne réagissent pas
      for (const [x, y] of [[60, 124], [172, 72], [398, 36], [612, 62], [590, 196], [262, 150]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 22], [440, 150], [130, 140]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }

  // acteurs : eau (Wu, Wr, Wa, Wb), carbonate suivi (T0..T2 + TC), cation suivi (M), deux H, une bulle, un halo — dans l'ordre du dessin
  function etapes(k, d, O, V) {
    const G = geometrie(O, V), M = d.cation, v = val(d), pMO = `${M}–O`, nom = O.nomEl(M), T = d.textes || {};
    const le = O.art(M, "le"), du = O.art(M, "du");
    const M0 = P(...MS), TC0 = P(...TS), LB = G.lienDe(MS, [1, 6]), OB = LB.o, LT = G.lienDe(MS, TS), MG4 = P(0, 4), MG15 = P(1, 5);
    const kT4 = G.lienDe([0, 4], TS).k, kT15 = G.lienDe([1, 5], TS).k;
    const posT = (x, y, t, l = RCO) => { const o = G.carb(x, y, t, l); return { T0: { x: o[0][0], y: o[0][1] }, T1: { x: o[1][0], y: o[1][1] }, T2: { x: o[2][0], y: o[2][1] }, TC: { x, y } }; };
    const pl = { h: [0, -1, -90], d: [1, 0, 0], b: [0, 1, 90], g: [-1, 0, 180] };
    const autour = (x, y, liste) => {   // eau autour du cation : haut, droite, bas, gauche
      const out = { M: { x, y } };
      for (const [id, p] of liste) { const [dx, dy, a] = pl[p]; out[id] = { x: x + dx * LMO, y: y + dy * LMO, a }; }
      return out;
    };
    const versO = (o, a, dd = 15) => ({ x: o.x + dd * Math.cos(O.rad(a)), y: o.y + dd * Math.sin(O.rad(a)) });
    const o = d.onglets[k] || {}, hv = o.t ?? null;
    const cristal = V.bi ? 7 : 4, a2 = (b) => (V.bi ? b : {});   // a2 : liaisons de la seconde moitié des arêtes
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };   // une seule valeur publiée : pas de fourchette
    const mo = (a, b) => ({ a, b, k: "ion", v: v.mo, p: pMO }), we = (b) => ({ a: "M", b, k: "eau", v: v.mo, p: pMO });
    const moS = (sq, a, b) => { const e2 = elDe(d, ...sq); return { a, b, k: "ion", v: d.valences[`${e2}-O`], p: `${e2}–O` }; };
    const co = (b) => ({ a: "TC", b, k: "cov", v: v.co, el: "C", p: "C–O" });

    function depart() {
      const au = autour(M0[0], M0[1], [["Wu", "h"], ["Wr", "d"]]), t0 = posT(TC0[0], TC0[1], V.angle(...TS));
      const A = {
        Wu: Object.assign({ t: "eau" }, au.Wu), Wr: Object.assign({ t: "eau" }, au.Wr),
        Wa: { t: "eau", x: 486, y: 132, a: 200 },
        Wb: Object.assign({ t: "eau" }, k === "eau" ? { x: 318, y: 106, a: -40 } : { x: 556, y: 52, a: 30 }),
        T0: Object.assign({ t: "at", el: "O" }, t0.T0), T1: Object.assign({ t: "at", el: "O" }, t0.T1), T2: Object.assign({ t: "at", el: "O" }, t0.T2),
        TC: Object.assign({ t: "at", el: "C" }, t0.TC),
        M: { t: "at", el: M, x: M0[0], y: M0[1] },
        Ha: k === "eau" ? { t: "h", x: 170, y: 60, o: 0 } : { t: "hp", x: 362, y: 116 },
        Hb: k === "eau" ? { t: "h", x: 170, y: 60, o: 0 } : { t: "hp", x: 300, y: 70 },
        bulle: { t: "bulle", x: 320, y: 60, r: 34, o: 0 },
        halo: k === "eau" ? { t: "halo", x: M0[0], y: M0[1], r: 17 } : { t: "halo", x: TC0[0], y: TC0[1], r: 34 },
      };
      // devant le cation suivi, un carbonate (en contour) ; devant le carbonate suivi, un cation
      const cv = devant(M0), osV = G.carb(cv[0], cv[1], V.angleV(d), RCO * KV), av = { cls: "lp-avant", lg: "t:avant" };
      osV.forEach(([x, y], i) => { A["V" + i] = Object.assign({ t: "at", el: "O", x, y, r: 7.5 * KV }, av); });
      A.VC = Object.assign({ t: "at", el: "C", x: cv[0], y: cv[1], r: 5.5 * KV }, av);
      const tv = devant(TC0);
      A.TV = Object.assign({ t: "at", el: M, x: tv[0], y: tv[1] }, av);
      const B = {
        mT: mo("M", "T" + G.lienDe(MS, TS).k), mB: mo("M", OB), m4: moS([0, 4], MG4, "T" + kT4), m15: moS([1, 5], MG15, "T" + kT15),
        wu: we("Wu"), wr: we("Wr"), c0: co("T0"), c1: co("T1"), c2: co("T2"),
        mV: mo("M", "V" + proche(osV, M0)),
        mA: mo("M", (() => { const q = derriere(M0), os = G.carb(q[0], q[1], V.angle(...MS) + 180, RCO * KA); return os[proche(os, M0)]; })()),
        tV: mo("TV", "T" + proche(G.carb(TC0[0], TC0[1], V.angle(...TS)), tv)),
        tA: mo(derriere(TC0), "T" + proche(G.carb(TC0[0], TC0[1], V.angle(...TS)), derriere(TC0))),
      };
      if (V.bi) {   // les arêtes : second oxygène du carbonate suivi, de celui du dessous et de celui de devant
        if (LT.o2) B.mT2 = mo("M", "T" + LT.k2);
        if (LB.o2) B.mB2 = mo("M", LB.o2);
        const iV = proche(osV, M0), d2 = osV.map((o, i) => (i === iV ? 1e9 : Math.hypot(o[0] - M0[0], o[1] - M0[1])));
        B.mV2 = mo("M", "V" + d2.indexOf(Math.min(...d2)));
      }
      for (const i of [0, 1, 2]) B["v" + i] = { a: "VC", b: "V" + i, k: "cov", v: v.co, el: "C", p: "C–O", o: 0.5 };
      return { A, B, L: {}, g: [cristal, 2], h: { v: hv === null ? null : 0 } };
    }
    const e = [], suite = O.suite;
    if (k === "eau") {
      e.push(suite(depart(), {
        titre: "Le bord d'une marche du cristal",
        texte: `${T.debut || `Chaque ${nom} tient six oxygènes, pris à six carbonates différents.`} Au bord, celui qu'on suit (cerclé) en a déjà perdu deux : l'eau occupe leur place.`,
      }));
      const m1 = { x: M0[0] + 10, y: M0[1] - 14 };
      e.push(suite(e[0], {
        titre: "L'eau prend la place des oxygènes",
        texte: `Une molécule d'eau se glisse : un oxygène du cristal lâche, celui de l'eau le remplace, puis un autre. L'eau tourne son oxygène vers ${le} : c'est le côté de la molécule qui porte une charge partielle négative. ${T.eauLent || `C'est l'étape lente : ${le} garde longtemps chacun de ses voisins.`}`,
        A: { M: m1, halo: Object.assign({}, m1, { o: 0 }), Wu: { x: m1.x, y: m1.y - LMO, a: -90 }, Wr: Object.assign(versO(m1, -25, LMO), { a: -25 }), Wa: Object.assign(versO(m1, 40, LMO), { a: 40 }) },
        B: Object.assign({ mB: 0, mA: 0, wa: we("Wa") }, a2({ mB2: 0 })), g: V.bi ? [4, 5] : [2, 4], h: Object.assign({ cours: true }, H),
      }));
      const m2 = { x: 452, y: 90 }, rep = d.repere;
      e.push(suite(e[1], {
        titre: `${majuscule(le)} s'en va, habillé d'eau`,
        texte: `Le dernier oxygène du cristal a lâché. ${majuscule(le)} part ${T.hydrateTxt || "entouré de six molécules d'eau"} : ${d.hydrate}.`
          + (rep && rep.eau ? ` Un ${O.nomEl(rep.cation)} de ${rep.la} part, lui, en ${O.quelques(rep.eau.t)}.` : ""),
        A: autour(m2.x, m2.y, [["Wu", "h"], ["Wr", "d"], ["Wa", "b"], ["Wb", "g"]]),
        B: Object.assign({ mT: 0, mV: 0, wb: we("Wb") }, a2({ mT2: 0, mV2: 0 })), g: [0, 6], h: H,
        L: { lM: { x: 506, y: 97, t: d.hydrate } },
      }));
      e.push(suite(e[2], {
        titre: "Le carbonate part entier",
        texte: "Privé de son voisin, le carbonate du bord part à son tour, dans la foulée. Ses trois liaisons C–O n'ont pas bougé : l'eau ne sait pas les casser.",
        A: posT(250, 96, 20), B: { m4: 0, m15: 0, tA: 0, tV: 0 },
        L: { lT: { x: 290, y: 104, t: "CO₃²⁻" } },
      }));
      const T2 = posT(250, 96, 20).T2;
      e.push(suite(e[3], {
        titre: "Le CO₂ dissous le change en bicarbonate",
        texte: "Le CO₂ de l'air ou du sol, dissous dans l'eau, lui cède presque aussitôt un H⁺ : HCO₃⁻. Le bicarbonate ne se raccroche plus au cristal ; c'est pourquoi une eau chargée de CO₂ dissout davantage." + (T.eauFin ? " " + T.eauFin : ""),
        A: { Ha: Object.assign(versO(T2, 260, 14), { o: 1 }) }, B: { h1: { a: "T2", b: "Ha", k: "oh" } },
        L: { lT: { x: 290, y: 104, t: "HCO₃⁻" } },
      }));
    } else {
      e.push(suite(depart(), {
        titre: "Le même bord, dans l'acide",
        texte: "L'acide chlorhydrique libère dans l'eau des ions H⁺ (en vert ; chacun est porté par une molécule d'eau, H₃O⁺) et des ions chlorure Cl⁻ (en gris), qui, eux, ne réagissent pas. Les H⁺ sont attirés par les oxygènes des carbonates, chargés négativement. On suit le carbonate cerclé.",
      }));
      const m1 = { x: M0[0] + 6, y: M0[1] - 4 }, t0d = posT(TC0[0], TC0[1], V.angle(...TS));
      const versH = (q) => ({ x: q.x + 15 * (q.y - TC0[1]) / RCO, y: q.y - 15 * (q.x - TC0[0]) / RCO });   // H posé au-delà de l'oxygène, de côté
      e.push(suite(e[0], {
        titre: "Un H⁺ se pose sur un oxygène",
        texte: `Lié au H, cet oxygène n'a presque plus besoin ${du} : leur liaison lâche. Cela se fait presque aussitôt.`,
        A: { Ha: Object.assign(versH(t0d.T0), { t: "h" }), halo: { o: 0 }, M: m1, Wu: { x: m1.x, y: m1.y - LMO, a: -90 }, Wr: { x: m1.x + LMO, y: m1.y, a: 0 } },
        B: { h1: { a: "T0", b: "Ha", k: "oh" }, mT: 0 }, g: [cristal - 1, 2],
      }));
      const t2 = posT(282, 92, 180);
      e.push(suite(e[1], {
        titre: "Le carbonate se détache",
        texte: `${T.acideLent || `Il doit encore attendre que les autres ${nom}s lâchent ses oxygènes : c'est l'étape lente, car ${le} garde longtemps ses voisins.`} Une fois libre, un deuxième H⁺ s'y pose : c'est de l'acide carbonique, H₂CO₃.`,
        A: Object.assign({}, t2, { Ha: versO(t2.T0, 215), Hb: Object.assign(versO(t2.T2, 60), { t: "h" }), Wa: { x: m1.x - LMO, y: m1.y, a: 180 } }),
        B: Object.assign({ m4: 0, m15: 0, tA: 0, tV: 0, h2: { a: "T2", b: "Hb", k: "oh" }, wa: we("Wa") }, a2({ mT2: 0 })), g: [cristal - (V.bi ? 2 : 1), 3],
        h: Object.assign({ cours: true }, H),
        L: { lT: { x: 318, y: 90, t: "H₂CO₃" } },
      }));
      const w = { x: 222, y: 126 };
      e.push(suite(e[2], {
        titre: "Une liaison C–O cède : la bulle",
        texte: "Les deux H se retrouvent sur un même oxygène et l'emportent : une molécule d'eau part, il reste du CO₂. C'est la seule liaison C–O qui casse, et le CO₂ fait les bulles de l'effervescence.",
        A: {
          TC: { x: 320, y: 58 }, T1: { x: 300, y: 58 }, T2: { x: 340, y: 58 },
          T0: Object.assign({}, w, { el: "Ow" }), Ha: Object.assign(versO(w, 128, 13), { t: "h" }), Hb: Object.assign(versO(w, 232, 13), { t: "h" }),
          bulle: { x: 320, y: 58, r: 34, o: 1 },
        },
        B: { c0: 0, c1: { v: 2 }, c2: { v: 2 }, h2: { a: "T0", b: "Hb", k: "oh" } },   // C=O du CO₂ : valence 2
        h: Object.assign({}, H, { sous: o.bulle || H.sous }),
        L: { lT: { x: 362, y: 63, t: "CO₂" }, lW: { x: w.x, y: w.y + 36, t: "H₂O", m: 1 } },
      }));
      const m4 = { x: 470, y: 112 };
      e.push(suite(e[3], {
        titre: `${majuscule(le)} part à son tour`,
        texte: `Privé de ses carbonates, il est pris par l'eau. ${T.acideFin || `Chaque carbonate de la surface attend en moyenne ${o.lettres} avant de partir.`}`,
        A: Object.assign(autour(m4.x, m4.y, [["Wu", "h"], ["Wr", "d"], ["Wa", "b"], ["Wb", "g"]]), { TC: { x: 320, y: 46 }, T1: { x: 300, y: 46 }, T2: { x: 340, y: 46 }, bulle: { x: 320, y: 46 } }),
        B: Object.assign({ mB: 0, mA: 0, mV: 0, wb: we("Wb") }, a2({ mB2: 0, mV2: 0 })), g: [0, 6], h: H,
        L: { lM: { x: 524, y: 119, t: d.hydrate }, lT: { x: 362, y: 51, t: "CO₂" } },
      }));
    }
    return e;
  }

  // ---------- énergie de liaison et cinétique ----------
  function energie(d, O) {
    const M = d.cation, v = val(d), E = d.energie || {}, f = d.four, rep = d.repere;
    const n = Math.round(d.distances[`${M}-O`].n), le = O.art(M, "le"), du = O.art(M, "du"), T = d.textes || {};
    const ratio = Math.round(v.co / v.mo);
    // part de liaison simple portée par chaque liaison M–O : charge 2 répartie sur n oxygènes
    const part = { 3: "deux tiers", 4: "la moitié", 6: "un tiers", 8: "un quart", 9: "deux neuvièmes", 12: "un sixième" }[n] || `2/${n}`;
    const que = /^[aeiouy]/i.test(part) ? `qu'${part}` : `que ${part}`;
    const duo = [
      { titre: "C–O", sous: "liaison covalente (électrons partagés)",
        schema: { type: "partage", a: "C", b: "O", aria: "Carbone et oxygène partagent deux électrons" },
        li: [`Le carbone et l'oxygène gardent leurs électrons en commun, entre eux deux : ionique ${O.fraction(O.ionicite("C", "O"))} (Pauling).`,
          `L'eau ne sait pas la remplacer. Elle cède à l'acide, qui en fait du CO₂${f ? `, ou au four dès ${f.debut} : ${f.equation}, ${f.produit}` : ""}.`] },
      { titre: `${M}–O`, sous: `liaison ${O.nature(`${M}–O`)} (électrons cédés)`,
        schema: { type: "don", a: M, la: `${M}²⁺`, ra: 17, fa: 12, b: "O", aria: `${majuscule(le)} cède ses électrons au carbonate` },
        li: [`${majuscule(le)} a cédé ses deux électrons au carbonate, dont les trois oxygènes se partagent la charge 2−. ${M}²⁺ et ces oxygènes s'attirent comme + et −.`,
          `Ionique ${O.fraction(O.ionicite(M, "O"))} (Pauling). Et sa charge se répartit sur ${O.lettres(n)} oxygènes : chaque liaison ${M}–O ne vaut ${que} de liaison simple, ${O.lettres(ratio, true)} fois moins qu'une liaison C–O.`,
          "Dans l'eau, l'oxygène d'une molécule d'eau peut prendre la place de celui du cristal."] },
    ];
    let barres = null;
    if (E.co && E.reseau && E.dHdiss != null) {
      const sec = E.reseau / n, eau = E.dHdiss / n;
      barres = {
        titre: "Énergie pour casser une liaison", unite: "kJ/mol", max: 800, graduations: [0, 200, 400, 600, 800],
        onglets: [{ k: "sec", nom: "À sec" }, { k: "eau", nom: "Dans l'eau" }],
        rangs: [
          { nom: "C–O du carbonate", el: "C", hachure: true, val: { sec: E.co, eau: E.co }, txt: { sec: `${E.co[0]} à ≈ ${E.co[1]} kJ/mol`, eau: `${E.co[0]} à ≈ ${E.co[1]} kJ/mol` } },
          { nom: `${M}–O`, el: M, val: { sec: [0, sec], eau: [0, Math.abs(eau)] }, txt: { sec: `≈ ${O.sp(Math.round(sec / 10) * 10)} kJ/mol`, eau: `≈ ${Math.round(eau)} kJ/mol`.replace("-", "−") } },
        ],
        explic: {
          sec: `À sec, séparer les ions d'une unité ${d.formule} coûte environ ${O.sp(Math.round(E.reseau / 100) * 100)} kJ/mol, soit environ ${O.sp(Math.round(sec / 10) * 10)} par liaison ${M}–O : autant qu'une liaison C–O.`,
          eau: `Dans l'eau, chaque oxygène perdu par ${le} est remplacé par celui d'une molécule d'eau. Pour toute l'unité, soit ${n} liaisons ${M}–O, le bilan est de ${Math.round(E.dHdiss)} kJ/mol, environ ${Math.round(eau)} par liaison. Le signe moins veut dire que l'eau rend un peu plus d'énergie qu'il n'en faut : la dissolution dégage même un peu de chaleur. La liaison C–O ne change pas, car l'eau ne sait pas la remplacer.`.replace(/-(\d)/g, "−$1"),
        },
      };
    }
    const EA = [["eaAcide", "dans l'acide (H⁺)", "dans l'acide"], ["eaNeutre", "dans l'eau pure", "dans l'eau pure"], ["eaCO2", "avec du CO₂ dissous", "avec du CO₂ dissous"]]
      .filter(([c]) => E[c] != null);
    if (!barres && EA.length) {   // décision du 09/10 : énergie d'activation MESURÉE, un rang par mécanisme
      const iv = (x) => (Array.isArray(x) ? x : [x, x]), fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
      const fac = (e) => fr1(Math.exp((e * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)));   // vitesse à 35 °C ÷ vitesse à 25 °C
      const facs = EA.map(([c, , dans]) => { const [a, b] = iv(E[c]), fa = fac(a), fb = fac(b); return `${fa === fb ? fa : `${fa} à ${fb}`} ${dans}`; });
      barres = {
        titre: "Énergie d'activation de la dissolution", unite: "kJ/mol", max: 100, graduations: [0, 25, 50, 75, 100],
        onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: EA.map(([c, nom]) => {
          const [a, b] = iv(E[c]), plage = a !== b;
          return { nom: majuscule(nom), el: M, hachure: plage, val: { ea: plage ? [a, b] : [0, b] }, txt: { ea: plage ? `${fr1(a)} à ${fr1(b)} kJ/mol` : `${fr1(b)} kJ/mol` } };
        }),
        explic: { ea: `L'énergie qu'il faut fournir pour que la réaction se fasse : plus elle est grande, plus la chaleur accélère la dissolution. De 25 à 35 °C, la vitesse est multipliée par ${facs.join(", ")}.${T.eaExplic ? " " + T.eaExplic : ""}` },
      };
    }
    let temps = null;
    if (rep && rep.eau && d.onglets.eau && d.onglets.eau.t) {
      const R = rep.cation, lent = d.onglets.eau.t > rep.eau.t;
      const ech = !!(rep.echange && d.echange), lentE = ech && d.echange.v > rep.echange.v;
      const fEch = ech ? O.rond2(lentE ? d.echange.min / rep.echange.max : rep.echange.min / d.echange.max) : 0;
      const fDep = O.rond2(lent ? d.onglets.eau.t / rep.eau.t : rep.eau.t / d.onglets.eau.t);
      temps = {
        titre: `Pourquoi ${d.la} fond si ${lent ? "lentement" : "vite"}`,
        explic: `${T.tempsExplic || `Pour changer de voisin, ${le} doit en lâcher un avant de tenir le suivant.`} Le ${O.nomEl(R)} de ${rep.la} sert de repère. Barres : écart entre les valeurs publiées.`,
        rangees: [
          ech && { titre: "Une molécule d'eau reste collée à l'ion, dans l'eau", fois: `au moins ${nb(fEch, O)} fois ${lentE ? "plus" : "moins"} longtemps pour ${M}²⁺`,
            pts: [{ el: R, min: rep.echange.min, max: rep.echange.max, v: rep.echange.v, et: `${R}²⁺ · ${rep.echange.court}`, ou: "haut" },
              { el: M, min: d.echange.min, max: d.echange.max, v: d.echange.v, et: `${M}²⁺ · ${d.echange.court}`, ou: "bas" }] },
          { titre: "Un ion de la surface quitte le cristal, dans l'eau pure à 25 °C", fois: `environ ${nb(fDep, O)} fois plus ${lent ? "lent" : "rapide"} pour ${d.la}`,
            pts: [{ el: R, min: rep.eau.tmin, max: rep.eau.tmax, v: rep.eau.t, et: `${rep.nom} · ${rep.eau.court}`, ou: "haut" },
              { el: M, min: d.onglets.eau.tmin, max: d.onglets.eau.tmax, v: d.onglets.eau.t, et: `${d.nom} · ${d.onglets.eau.court}`, ou: "bas" }] },
        ].filter(Boolean),
      };
    }
    return { duo, barres, temps };
  }

  for (const [nom, V] of [["carbonates", CAL], ["carbonates-aragonite", ARA]]) Liaisons.scene(nom, {
    onglets: () => [{ k: "eau", nom: "Dans l'eau" }, { k: "acide", nom: "Dans l'acide" }],
    decor: (k, d, O) => decor(k, d, O, V), etapes: (k, d, O) => etapes(k, d, O, V), energie,
    jauge: (d) => ({ titre: `voisins du ${Liaisons.outils.nomEl(d.cation)} suivi`, n: V.n, classes: ["lp-j-o", "lp-j-ow"] }),
    legende: () => ({ "e:O": "oxygène du cristal", "i:Cl−": "Cl⁻, ne réagit pas",
      "t:avant": "ion juste devant le plan du dessin (en contour)", "t:arriere": "ion juste derrière le plan du dessin (plus petit, pâle)" }),
    aria: (d) => `Coupe du bord d'un cristal de ${d.nom}, étape par étape`,
  });
})();
