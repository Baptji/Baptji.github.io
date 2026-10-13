// ============ Liaisons du cristal — scène de la famille « feuillets » (gabarit des micas) ============
// 10/10/2026 (prototype : biotite). Coupe perpendiculaire aux feuillets, au bord d'un paquet : deux feuillets T-O-T (tétraèdres SiO₄,
// un sur quatre AlO₄, autour d'octaèdres Mg/Fe avec leurs OH) tenus par des K⁺ sans eau (≈ 10 Å). Schématique : un octaèdre par colonne,
// K⁺ dans les creux des couches d'oxygène. Sol tempéré (Malmström et al. 1995) : le K⁺ sort par le bord, des Mg²⁺ entourés d'eau
// entrent et écartent les feuillets (≈ 14 Å), le fer s'oxyde → vermiculite. Acide (Bray et al. 2015) : Fe, Mg puis Al puis Si quittent le bord.
(function () {
  "use strict";
  const PAS = 34, X0 = 18, NC = 11, DB = 122, DB1 = 100, OUV = 40, KY = 160;
  const Y = { bT: 46, si1: 60, ap1: 76, oct: 92, ap2: 108, si2: 124, bB: 138 };
  const xi = (i) => X0 + PAS * i;
  const VK = 1 / 12;
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);

  // atomes et liaisons d'un feuillet (préfixe L, décalage vertical dy)
  // (oc : cation des octaèdres ; dioct : un site d'octaèdre sur trois vide, comme la pyrophyllite ;
  //  un1 : feuillet 1:1 des serpentines, une seule couche de tétraèdres, l'autre face des octaèdres tout en OH)
  function feuillet(L, dy, vS, vM, sansFer, sansAl, oc, dioct, un1) {
    const at = {}, li = [];
    const pose = (id, el, x, y) => { at[L + id] = { el, x, y: y + dy }; };
    for (let i = 0; i <= NC + 1; i++) { pose("b1_" + i, "O", xi(i) - 17, Y.bT); if (!un1) pose("b2_" + i, "O", xi(i) - 17, Y.bB); }
    for (let i = 0; i <= NC; i++) {
      const x = xi(i);
      pose("t1_" + i, i % 4 === 1 && !sansAl ? "Al" : "Si", x, Y.si1); if (!un1) pose("t2_" + i, i % 4 === 3 && !sansAl ? "Al" : "Si", x, Y.si2);
      pose("a1_" + i, "O", x, Y.ap1); pose("a2_" + i, "O", x, Y.ap2);
      if (un1) { pose("Ha2_" + i, "H", x, Y.ap2 + 10); li.push([L + "a2_" + i, L + "Ha2_" + i, "oh"]); }
      if (!(dioct && i % 3 === 1)) pose("c_" + i, i % 3 === 0 && !sansFer ? "Fe" : oc || "Mg", x, Y.oct);
      if (i < NC) { pose("h1_" + i, "O", x + 17, Y.ap1); pose("h2_" + i, "O", x + 17, Y.ap2); pose("H1_" + i, "H", x + 17, Y.ap1 - 10); pose("H2_" + i, "H", x + 17, Y.ap2 + 10); }
      for (const [t, b, a] of un1 ? [["t1_", "b1_", "a1_"]] : [["t1_", "b1_", "a1_"], ["t2_", "b2_", "a2_"]]) {
        const el = at[L + t + i].el;
        li.push([L + t + i, L + b + i, "cov", vS, el, `${el}–O`], [L + t + i, L + b + (i + 1), "cov", vS, el, `${el}–O`], [L + t + i, L + a + i, "cov", vS, el, `${el}–O`]);
      }
      const c = L + "c_" + i, mo = at[c] ? `${at[c].el}–O` : "";
      if (at[c]) li.push([c, L + "a1_" + i, "ion", vM, null, mo], [c, L + "a2_" + i, "ion", vM, null, mo]);
      if (at[c]) for (const j of [i - 1, i]) if (j >= 0 && j < NC) li.push([c, L + "h1_" + j, "ion", vM, null, mo], [c, L + "h2_" + j, "ion", vM, null, mo]);
      if (i < NC) li.push([L + "h1_" + i, L + "H1_" + i, "oh"], [L + "h2_" + i, L + "H2_" + i, "oh"]);
    }
    return { at, li };
  }
  // chlorite (textes.chlorite, 11/10/2026) : entre deux feuillets T-O-T, une couche d'octaèdres « brucite » (Mg, un Al sur trois, OH en
  // haut et en bas, accrochés aux oxygènes des feuillets par des liaisons hydrogène), ≈ 14 Å d'un feuillet au suivant
  const DBC = 173, ZY = { u: 160, c: 178, d: 196 };
  const ZANIM = ["Zc_11", "Zu_12", "ZHu_12", "Zd_12", "ZHd_12"];   // bord de la couche brucite : le cation et ses deux OH extérieurs
  function brucite(vM, vA, zEl = "Mg") {
    const at = {}, li = [];
    for (let i = 0; i <= NC + 1; i++) {
      const x = xi(i) - 17;
      at["Zu_" + i] = { el: "O", x, y: ZY.u }; at["ZHu_" + i] = { el: "H", x, y: ZY.u - 10 };
      at["Zd_" + i] = { el: "O", x, y: ZY.d }; at["ZHd_" + i] = { el: "H", x, y: ZY.d + 10 };
      li.push(["Zu_" + i, "ZHu_" + i, "oh"], ["Zd_" + i, "ZHd_" + i, "oh"]);
    }
    for (let i = 0; i <= NC; i++) {
      const el = i % 3 === 2 ? "Al" : zEl, v = el === "Al" ? vA : vM, c = "Zc_" + i;
      at[c] = { el, x: xi(i), y: ZY.c };
      for (const j of [i, i + 1]) li.push([c, "Zu_" + j, "ion", v, null, `${el}–O`], [c, "Zd_" + j, "ion", v, null, `${el}–O`]);
    }
    return { at, li };
  }
  // smectite (textes.smectite, 11/10/2026) : feuillet de la pyrophyllite, et entre les feuillets des Ca²⁺ entourés d'eau (≈ 15 Å)
  const DBS = 172, SY = (Y.bB + Y.bT + DBS) / 2, SX = [2, 6, 10].map((i) => xi(i) - 17);
  const KS = [1, 3, 5, 7, 9, 11];   // K⁺ sous les oxygènes b2 de A / au-dessus des b1 de B de ces colonnes
  const KX = (i) => xi(i) - 17;

  function modele(d) {
    const T = d.textes || {}, sk = !!T.sansK, sf = !!T.sansFer || sk, oc = T.octa || "Mg", di = !!T.dioct, un1 = !!T.un1;
    const chl = !!T.chlorite, sm = !!T.smectite, vS = d.valences["Si-O"], vM = d.valences[`${oc}-O`] ?? (T.fer3 ? d.valences["Al-O"] : undefined), db = un1 ? DB1 : chl ? DBC : sm ? DBS : DB;
    const A = feuillet("A", 0, vS, vM, sf, sk, oc, di, un1), B = feuillet("B", db, vS, vM, sf, sk, oc, di, un1);
    const bl = !!T.blanc, ki = T.inter || "K";
    return { vS, vM, A, B, sf, sk, oc, di, un1, db, bl, ki, chl, sm, Z: chl ? brucite(d.valences[`${T.brucite || "Mg"}-O`] ?? vM, d.valences["Al-O"] ?? vM, T.brucite || "Mg") : null, zEl: T.brucite || "Mg", ion: ki + "⁺",
      kp: !sk && !chl, suit: (k) => (un1 ? ["Ac_11", "At1_11"] : SUIT[k]) };
  }
  const SUIT = { sol: ["Ac_9", "AH2_8"], acide: ["Ac_11", "At2_11", "At1_11"] };   // atomes du feuillet A animés
  SUIT.eau = SUIT.acide;   // talc (textes.sansK) : la même dissolution du bord, dans l'eau du sol

  function decor(k, d, O) {
    const m = modele(d), anim = new Set(m.suit(k));
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>${O.relief.dessus([[0, 36], [xi(NC) + 26, 36], [xi(NC) + 26, 340]])}<path d="M0 36 H${xi(NC) + 26} V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    for (const [p, q, kk, v, el, nom] of m.A.li) {
      if (anim.has(p.slice(0)) || anim.has(q)) continue;
      const P = m.A.at[p], Q = m.A.at[q];
      l += kk === "oh" ? O.lien(P.x, P.y, Q.x, Q.y, { k: "oh" }) : O.lien(P.x, P.y, Q.x, Q.y, { k: kk, v, el: el || undefined, p: nom });
    }
    for (const [id, A] of Object.entries(m.A.at)) if (!anim.has(id)) a += A.el === "H" ? O.hlie(A.x, A.y) : O.atome(A.x, A.y, A.el);
    if (m.sm) for (const x of SX) {   // cations hydratés entre les feuillets (fixes : ils ne règlent pas la dissolution)
      for (const [dx, dy, an] of [[0, -26, -90], [26, 0, 0], [0, 26, 90], [-26, 0, 180]]) { l += O.lien(x, SY, x + dx, SY + dy, { k: "eau", v: d.valences["Ca-O"] ?? 0.25, p: "Ca–O" }); a += O.eau(x + dx, SY + dy, an); }
      a += O.atome(x, SY, "Ca");
    }
    if (m.Z) {
      const za = new Set(k === "sol" ? [] : ZANIM);
      for (const [p, q, kk, v, el, nom] of m.Z.li) {
        if (za.has(p) || za.has(q)) continue;
        const P = m.Z.at[p], Q = m.Z.at[q];
        l += kk === "oh" ? O.lien(P.x, P.y, Q.x, Q.y, { k: "oh" }) : O.lien(P.x, P.y, Q.x, Q.y, { k: kk, v, p: nom });
      }
      for (const [id, P] of Object.entries(m.Z.at)) if (!za.has(id)) a += P.el === "H" ? O.hlie(P.x, P.y) : O.atome(P.x, P.y, P.el);
      for (const id of za) { const P = m.Z.at[id]; anim.add(id); m.A.at[id] = P; }
    }
    // relief : la copie de derrière reprend les deux feuillets entiers (le feuillet B est fait d'acteurs, recopié ici à sa place de départ)
    let bl = "", ba = "";
    for (const [p, q, kk, v, el, nom] of m.B.li) { const P = m.B.at[p], Q = m.B.at[q]; bl += kk === "oh" ? O.lien(P.x, P.y, Q.x, Q.y, { k: "oh" }) : O.lien(P.x, P.y, Q.x, Q.y, { k: kk, v, el: el || undefined, p: nom }); }
    for (const A of Object.values(m.B.at)) ba += A.el === "H" ? O.hlie(A.x, A.y) : O.atome(A.x, A.y, A.el);
    for (const id of anim) { const A = m.A.at[id]; if (A) ba += A.el === "H" ? O.hlie(A.x, A.y) : O.atome(A.x, A.y, A.el); }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + bl + a + ba) + l.slice(l0);
    for (const [x, y, an] of [[470, 60, 20], [590, 110, 150], [520, 300, 60], [610, 250, 200], [455, 230, 300]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") for (const [x, y] of [[480, 120], [560, 40], [600, 180], [470, 290], [540, 220]]) a += O.hplus(x, y, { decor: true });
    else for (const [x, y] of [[560, 180]]) a += O.ion(x, y, "Ca", "2+", { decor: true, r: 10 });
    return { l, a };
  }

  function etapes(k, d, O) {
    const m = modele(d), o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const A = {}, B = {};
    const acteur = (id, P) => ({ t: P.el === "H" ? "h" : "at", el: P.el, x: P.x, y: P.y });
    const suit = m.suit(k);
    for (const id of suit) A[id] = acteur(id, m.A.at[id]);
    for (const [id, P] of Object.entries(m.B.at)) A[id] = acteur(id, P);
    if (m.kp) KS.forEach((i) => { A["K" + i] = { t: "at", el: m.ki, x: KX(i), y: KY }; });
    if (m.Z) {   // bord de la couche brucite : acteurs, et leurs liaisons vers la couche fixe
      for (const id of ZANIM) { const P = m.Z.at[id]; A[id] = { t: P.el === "H" ? "h" : "at", el: P.el, x: P.x, y: P.y }; }
      const fx = (id) => (ZANIM.includes(id) ? id : [m.Z.at[id].x, m.Z.at[id].y]);
      for (const [p, q, kk, v, el, nom] of m.Z.li) if (ZANIM.includes(p) || ZANIM.includes(q)) B["z" + p + "-" + q] = kk === "oh" ? { a: fx(p), b: fx(q), k: "oh" } : { a: fx(p), b: fx(q), k: kk, v, p: nom };
    }
    for (const [p, q, kk, v, el, nom] of m.B.li) B[p + "-" + q] = kk === "oh" ? { a: p, b: q, k: "oh" } : { a: p, b: q, k: kk, v, el: el || undefined, p: nom };
    for (const [p, q, kk, v, el, nom] of m.A.li) if (suit.includes(p) || suit.includes(q)) {
      const fx = (id) => (suit.includes(id) ? id : [m.A.at[id].x, m.A.at[id].y]);
      B[p + "-" + q] = kk === "oh" ? { a: fx(p), b: fx(q), k: "oh" } : { a: fx(p), b: fx(q), k: kk, v, el: el || undefined, p: nom };
    }
    // relief : voisins hors du plan des atomes suivis au bord (octaèdre : un O devant, un derrière ; tétraèdre : son 4ᵉ O, derrière)
    const R0 = (Bx, id) => { Bx["rV" + id] = 0; Bx["rA" + id] = 0; };
    if (k !== "sol") {
      const dl = decor(k, d, O).l;
      for (const id of ["Ac_11", "At1_11", "At2_11"]) {
        const P0 = m.A.at[id]; if (!P0) continue;
        const p0 = [P0.x, P0.y], li = (b) => ({ a: id, b, k: id[1] === "c" ? "ion" : "cov", v: id[1] === "c" ? m.vM : m.vS, el: id[1] === "c" ? undefined : P0.el, p: `${P0.el}–O` });
        if (id === "Ac_11") { const v = O.relief.devant(p0); A["V" + id] = Object.assign({ t: "at", el: "O", x: v[0], y: v[1], r: 8.5 }, O.relief.avant); B["rV" + id] = li("V" + id); }
        B["rA" + id] = li(O.relief.arriere(dl, "O", p0));
      }
    }
    if (m.kp) KS.forEach((i) => {
      const bA = m.A.at["Ab2_" + i];
      B["kA" + i] = { a: "K" + i, b: [bA.x, bA.y], k: "ion", v: VK, p: `${m.ki}–O` };
      B["kB" + i] = { a: "K" + i, b: "Bb1_" + i, k: "ion", v: VK, p: `${m.ki}–O` };
    });
    // eau et Mg²⁺ du sol (onglet sol), ions qui partent (onglet acide)
    const MX = [[103, 0], [239, 1], [375, 2]];
    if (k === "sol") MX.forEach(([x], j) => { A["M" + j] = { t: "at", el: "Mg", x: 520 + 30 * j, y: 150 + 40 * j, o: 0 };
      ["u", "d", "g", "r"].forEach((s) => { A["W" + j + s] = { t: "eau", x: 520 + 30 * j, y: 150 + 40 * j, a: 0, o: 0 }; }); });
    A.halo = k === "sol" ? { t: "halo", x: KX(11), y: KY, r: 16 } : { t: "halo", x: xi(NC), y: Y.oct, r: 16, o: 0 };
    const e = [], suite = O.suite;
    const T = d.textes || {}, L0 = { lD: { x: m.un1 ? 444 : m.chl || m.sm ? 604 : 470, y: m.un1 ? 136 : m.chl || m.sm ? 214 : 164, t: T.espace || "≈ 10 Å", m: 1 } };
    e.push({ A, B, L: L0, h: { v: hv === null ? null : 0 },
      titre: k !== "acide" ? "Le bord d'un paquet de feuillets" : "Le même bord, dans l'acide",   // eslint-disable-line
      texte: m.sm ? (k === "eau" ? (T.debut || "") : "Des ions H⁺ (en vert) dans l'eau. Les faces des feuillets ne réagissent presque pas : tout se passe au bord.")
      : m.sk ? (k === "eau" && m.un1
        ? `Chaque feuillet : une seule couche de tétraèdres SiO₄, collée à une couche d'octaèdres ${m.oc === "Al" ? "d'aluminium (deux sites sur trois occupés)" : "de magnésium"} dont l'autre face n'est faite que d'OH. D'un feuillet au suivant, ces OH s'accrochent aux oxygènes des tétraèdres par des liaisons hydrogène, ${(T.espace || "≈ 7 Å").replace("≈", "à environ")} l'un du suivant.${T.toucher ? " " + T.toucher : ""}`
        : k === "eau"
        ? `Chaque feuillet : deux couches de tétraèdres SiO₄ autour d'une couche d'octaèdres ${m.oc === "Al" ? "d'aluminium (deux sites sur trois occupés)" : "de magnésium"}, avec des OH. Aucun ion entre les feuillets : seules de faibles forces de van der Waals les tiennent, ${(T.espace || "≈ 10 Å").replace("≈", "à environ")} l'un du suivant. ${T.toucher || "D'où le toucher savonneux et la dureté 1."}`
        : "Des ions H⁺ (en vert) dans l'eau. Les faces des feuillets ne réagissent presque pas : tout se passe au bord.")
      : m.chl
        ? (k === "eau"
          ? `Chaque feuillet : deux couches de tétraèdres (SiO₄, et un AlO₄ sur quatre) autour d'une couche d'octaèdres de magnésium et de fer, avec des OH. Entre deux feuillets, pas d'ions isolés mais une deuxième couche d'octaèdres, de magnésium et d'aluminium entourés d'OH (une couche « brucite »), accrochée aux feuillets par des liaisons hydrogène, ${(T.espace || "≈ 14 Å").replace("≈", "à environ")} d'un feuillet au suivant.`
          : "Des ions H⁺ (en vert) dans l'eau. Les faces des feuillets ne réagissent presque pas : tout se passe au bord.")
      : m.bl
        ? (k === "eau"
          ? `Chaque feuillet : deux couches de tétraèdres (SiO₄, et un AlO₄ sur quatre) autour d'une couche d'octaèdres ${T.fer3 ? "de fer (Fe³⁺, avec un peu d'aluminium et de magnésium ; deux sites sur trois occupés)" : "d'aluminium (deux sites sur trois occupés)"}, avec des OH. Entre deux feuillets, des ions ${m.ion} sans eau les tiennent serrés. L'eau ne mord qu'au bord du paquet.`
          : "Des ions H⁺ (en vert) dans l'eau. Les faces des feuillets ne réagissent presque pas : tout se passe au bord.")
      : k === "sol"
        ? `Chaque feuillet : deux couches de tétraèdres (SiO₄, et un AlO₄ sur quatre) autour d'une couche d'octaèdres de magnésium${m.sf ? "" : " et de fer"}, avec des OH. Entre deux feuillets, des ions K⁺ sans eau les tiennent serrés, à 10 Å d'un feuillet au suivant.`
        : "Des ions H⁺ (en vert) dans l'eau. Les faces des feuillets ne réagissent presque pas : tout se passe au bord, cent vingt fois plus réactif.",
    });
    if (m.sk) {
      // talc (Heřmanská et al. 2023) : le Mg–O lâche d'abord, puis les Si–O du bord (étape lente) ; ni K à échanger ni Al
      const Bc = {}, Bs = {};
      for (const [p, q] of m.A.li) {
        if (p === "Ac_11" || q === "Ac_11") Bc[p + "-" + q] = 0;
        if (["At1_11", "At2_11"].includes(p) || ["At1_11", "At2_11"].includes(q)) Bs[p + "-" + q] = 0;
      }
      R0(Bc, "Ac_11"); R0(Bs, "At1_11"); R0(Bs, "At2_11");
      e.push(suite(e[0], {
        titre: m.oc === "Al" ? "L'aluminium part le premier" : "Le magnésium part le premier",
        texte: `Des H⁺ se fixent sur les oxygènes et les OH du bord${k === "eau" ? " (dans le sol, ils viennent du CO₂ dissous)" : ""} : ${m.oc === "Al"
          ? (k === "eau" ? `l'aluminium des octaèdres se détache. ${T.alSol || "Dans le sol, il ne va pas loin : il se redépose en kaolinite avec une partie de la silice."}` : "l'Al³⁺ des octaèdres s'en va, entouré d'eau.") + " Ses liaisons Al–O cèdent avant celles du silicium."
          : "le Mg²⁺ des octaèdres s'en va, entouré d'eau. Ses liaisons sont les plus fragiles du feuillet."}`,
        A: { Ac_11: { x: 520, y: 70 }, halo: { x: 520, y: 70, o: 0 } }, B: Bc,
        L: { lC: { x: 520, y: 100, t: m.oc === "Al" ? (k === "eau" ? "Al(OH)₃" : "Al³⁺") : "Mg²⁺", m: 1 } },
      }));
      e.push(suite(e[1], {
        titre: "La silice part : le bord recule",
        texte: `Privés ${m.oc === "Al" ? "de l'aluminium" : "du magnésium"}, les tétraèdres du bord ne tiennent plus que par leurs ponts Si–O–Si : l'eau les casse un à un, et le silicium part en silice dissoute, H₄SiO₄. C'est l'étape lente : ${o.lettres || "durée non mesurée"} en moyenne par groupe ${d.formule} de la surface. Le bord a reculé d'un cran.`,
        A: Object.assign({ At1_11: { x: 600, y: 120 } }, m.un1 ? {} : { At2_11: { x: 565, y: 288 } }), B: Bs, h: Object.assign({ cours: true }, H),
        L: Object.assign({ lS: { x: 600, y: 150, t: "H₄SiO₄", m: 1 } }, m.un1 ? {} : { lS2: { x: 565, y: 318, t: "H₄SiO₄", m: 1 } }),
      }));
    } else if (k === "sol") {
      const sortie = { K11: [480, 110], K9: [560, 140], K7: [600, 60], K5: [600, 300], K3: [500, 330], K1: [430, 20] };
      e.push(suite(e[0], {
        titre: "Le potassium sort par le bord",
        texte: "Le K⁺ le plus près du bord quitte l'espace entre les feuillets. Les suivants le font de proche en proche : leur sortie suit la diffusion, de plus en plus lente à mesure que le front s'enfonce. Aucune vitesse publiée ne la chiffre.",
        A: { K11: { x: sortie.K11[0], y: sortie.K11[1] }, halo: { x: sortie.K11[0], y: sortie.K11[1], o: 0 } }, B: { kA11: 0, kB11: 0 }, L: {},
      }));
      const Ab = {}, Bb = {};
      for (const id of Object.keys(m.B.at)) Ab[id] = { y: m.B.at[id].y + OUV };
      for (const i of KS) { Ab["K" + i] = { x: sortie["K" + i][0], y: sortie["K" + i][1], o: i === 11 ? 1 : 0.0 }; Bb["kA" + i] = 0; Bb["kB" + i] = 0; }
      const yi = (Y.bB + Y.bT + DB + OUV) / 2;
      MX.forEach(([x], j) => {
        Ab["M" + j] = { x, y: yi, o: 1 };
        Ab["W" + j + "u"] = { x, y: yi - 26, a: -90, o: 1 }; Ab["W" + j + "d"] = { x, y: yi + 26, a: 90, o: 1 };
        Ab["W" + j + "g"] = { x: x - 26, y: yi, a: 180, o: 1 }; Ab["W" + j + "r"] = { x: x + 26, y: yi, a: 0, o: 1 };
        ["u", "d", "g", "r"].forEach((s) => { Bb["mw" + j + s] = { a: "M" + j, b: "W" + j + s, k: "eau", v: m.vM, p: "Mg–O" }; });
      });
      e.push(suite(e[1], {
        titre: "Le magnésium et l'eau entrent : le paquet s'ouvre",
        texte: "Depuis le bord, des ions de l'eau du sol entourés d'eau, ici Mg²⁺, prennent la place du potassium : un Mg²⁺ pour deux K⁺. Trop gros avec leur eau, ils écartent les feuillets.",
        A: Ab, B: Bb, L: { lD: { x: 470, y: yi + 4, t: "≈ 14 Å", m: 1 } },
      }));
      const fe = m.A.at.Ac_9;
      if (!m.sf) e.push(suite(e[2], {
        titre: "Le fer du feuillet s'oxyde",
        texte: "Au contact de l'eau aérée, le fer des octaèdres perd un électron : Fe²⁺ devient Fe³⁺. Le feuillet perd un H⁺ d'un de ses OH, et sa charge négative baisse.",
        A: { AH2_8: { t: "hp", x: 470, y: 30 }, halo: { x: fe.x, y: fe.y, o: 1 } }, B: { "Ah2_8-AH2_8": 0 },
        L: { lF: { x: fe.x, y: 24, t: "Fe²⁺ → Fe³⁺", m: 1 } },
      }));
      const avant = e[e.length - 1];
      e.push(suite(avant, {
        titre: "Une vermiculite",
        texte: `Le paquet s'est ouvert jusqu'à 14 Å environ : c'est une vermiculite${m.sf ? "" : ", au fer oxydé"}. Ses Mg²⁺ entourés d'eau s'échangent facilement avec ceux de l'eau du sol : sa capacité d'échange (CEC) a beaucoup augmenté.`,
        A: { halo: { o: 0 } }, L: { ...(avant.L.lF ? { lF: avant.L.lF } : {}), lD: { x: 470, y: (Y.bB + Y.bT + DB + OUV) / 2 + 4, t: "≈ 14 Å", m: 1 } },
      }));
    } else {
      const c = m.A.at.Ac_11, al = m.A.at.At2_11, si = m.A.at.At1_11;
      const Bc = {};
      for (const [p, q] of m.A.li) if (p === "Ac_11" || q === "Ac_11") Bc[p + "-" + q] = 0;
      R0(Bc, "Ac_11");
      if (m.kp) { Bc.kA11 = 0; Bc.kB11 = 0; }
      if (m.chl) {
        const Bz = {}, z0 = [530, 136];
        for (const [p, q, kk] of m.Z.li) if (kk !== "oh" && (p === "Zc_11" || q === "Zc_11" || ZANIM.includes(q))) Bz["z" + p + "-" + q] = 0;
        e.push(suite(e[0], {
          titre: "La couche brucite part la première",
          texte: `Des H⁺ se fixent sur les OH du bord de la couche entre les feuillets${k === "eau" ? " (dans le sol, ils viennent du CO₂ dissous)" : ""} : ils deviennent de l'eau, et ${O.art(m.zEl, "le")} qu'ils tenaient part, entouré d'eau. Cette couche, sans silicium, ne tient que par des liaisons ${m.zEl}–O et Al–O, les plus fragiles du cristal.${k === "eau" && T.zEau ? " " + T.zEau : ""}`,
          A: { Zc_11: { x: z0[0], y: z0[1] }, Zu_12: { t: "eau", x: z0[0] - 28, y: z0[1], a: 180 }, ZHu_12: { x: z0[0] - 28, y: z0[1], o: 0 },
            Zd_12: { t: "eau", x: z0[0] + 28, y: z0[1], a: 0 }, ZHd_12: { x: z0[0] + 28, y: z0[1], o: 0 } },
          B: Object.assign(Bz, { ["zZc_11-Zu_12"]: { a: "Zc_11", b: "Zu_12", k: "eau", v: m.vM, p: `${m.zEl}–O` }, ["zZc_11-Zd_12"]: { a: "Zc_11", b: "Zd_12", k: "eau", v: m.vM, p: `${m.zEl}–O` } }),
          L: { lZ: { x: z0[0], y: z0[1] + 36, t: `${m.zEl}²⁺`, m: 1 } },
        }));
      }
      e.push(suite(e[e.length - 1], {
        titre: m.chl ? "Puis le magnésium et le fer du feuillet" : m.bl ? `Le ${m.ki === "Na" ? "sodium" : "potassium"} et ${T.fer3 ? "le fer" : "l'aluminium"} des octaèdres partent d'abord` : "Le magnésium et le fer partent d'abord",
        texte: m.chl ? `Privés de la couche voisine, les octaèdres du bord du feuillet lâchent à leur tour : ${T.octaTexte || "le Mg²⁺ et le Fe²⁺"} s'en vont, entourés d'eau${k === "eau" ? " ; dans le sol, le fer rouille aussitôt en goethite" : ""}.` : m.bl ? `${k === "eau" ? "Des H⁺ se fixent sur les oxygènes du bord (dans le sol, ils viennent du CO₂ dissous)" : "Les H⁺ se fixent sur les oxygènes du bord"} : le ${m.ion} voisin s'en va, échangé contre un H⁺, puis les liaisons ${T.fer3 ? "Fe" : "Al"}–O des octaèdres cèdent${T.fer3 ? (k === "eau" ? ". Le fer ne va pas loin : il rouille sur place en goethite." : " et le Fe³⁺ part, entouré d'eau.") : k === "eau" ? ". L'aluminium ne va pas loin : il se redépose en kaolinite avec une partie de la silice." : " et l'Al³⁺ part, entouré d'eau."}` : `Les H⁺ se fixent sur les oxygènes du bord ; les cations des octaèdres${m.sf ? ", Mg²⁺," : ", Mg²⁺ et Fe²⁺,"} et le K⁺ voisin s'en vont les premiers.`,
        A: Object.assign({ Ac_11: { x: 520, y: 70 } }, m.kp ? { K11: { x: 560, y: 230 } } : {}), B: Bc,
        L: Object.assign({ lC: { x: 520, y: 100, t: m.bl ? (T.fer3 ? (k === "eau" ? "FeO(OH)" : "Fe³⁺") : k === "eau" ? "Al(OH)₃" : "Al³⁺") : `${m.A.at.Ac_11.el}²⁺`, m: 1 } }, m.kp ? { lK: { x: 560, y: 263, t: m.ion, m: 1 } } : {}),
      }));
      const Ba = {};
      for (const [p, q] of m.A.li) if (p === "At2_11" || q === "At2_11") Ba[p + "-" + q] = 0;
      R0(Ba, "At2_11");
      e.push(suite(e[e.length - 1], {
        titre: m.bl ? "Puis l'aluminium des tétraèdres" : "Puis l'aluminium",
        texte: k === "eau" ? "Privé de ses voisins, le tétraèdre d'aluminium du bord lâche à son tour ; son aluminium se redépose lui aussi." : "Privé de ses voisins, le tétraèdre d'aluminium du bord lâche à son tour : Al³⁺ part dans l'eau acide.",
        A: { At2_11: { x: 470, y: 250 } }, B: Ba,
        L: { lA: { x: 470, y: 280, t: k === "eau" ? "Al(OH)₃" : "Al³⁺", m: 1 } },
      }));
      const Bs = {};
      for (const [p, q] of m.A.li) if (p === "At1_11" || q === "At1_11") Bs[p + "-" + q] = 0;
      R0(Bs, "At1_11");
      e.push(suite(e[e.length - 1], {
        titre: "La silice part en dernier",
        texte: "Le silicium tient le plus longtemps : ses liaisons Si–O cèdent les dernières, et il part en silice dissoute, H₄SiO₄. C'est l'étape lente ; le bord recule ensuite d'un cran." + (k === "eau" && T.fin ? " " + T.fin : ""),
        A: { At1_11: { x: 600, y: 120 } }, B: Bs, h: Object.assign({ cours: true }, H),
        L: { lS: { x: 600, y: 150, t: "H₄SiO₄", m: 1 } },
      }));
    }
    return e;
  }

  function energie(d, O) {
    if (d.textes && d.textes.sansK) return energieTalc(d, O);
    if (d.textes && d.textes.blanc) return Object.assign(energieTalc(d, O), { duo: duoMica(d, O) });
    if (d.textes && d.textes.chlorite) return energieTalc(d, O);
    return { duo: duoMica(d, O), barres: null, temps: null };
  }

  // Si–O + liaison du cation entre les feuillets (K⁺ des micas, Na⁺ de la paragonite)
  function duoMica(d, O) {
    const T = d.textes || {}, ki = T.inter || "K", nomK = ki === "Na" ? "sodium" : "potassium";
    return [
      { titre: "Si–O", sous: `liaison ${O.nature("Si–O")} (électrons en partie partagés)`,
        schema: { type: "partage", a: "Si", b: "O", aria: "Silicium et oxygène partagent des électrons" },
        li: [`Ionique ${O.fraction(O.ionicite("Si", "O"))} seulement (Pauling). Elle tient chaque feuillet : c'est la dernière à céder.`] },
      T.blanc ? { titre: `${ki}–O`, sous: `liaison ${O.nature(`${ki}–O`)} (électron cédé)`,
        schema: { type: "don", a: ki, la: ki + "⁺", ra: 19, fa: 12, b: "O", aria: `Le ${nomK} cède son électron au feuillet` },
        li: [`Ionique ${O.fraction(O.ionicite(ki, "O"))} (Pauling). Le ${ki}⁺ partage sa seule charge entre ${T.voisinsK || "douze oxygènes"} : chaque liaison ne vaut qu'une petite fraction de liaison simple.`,
          "Ce sont les liaisons les plus faibles du cristal, entre les feuillets : d'où le clivage parfait des micas."] }
      : { titre: "K–O", sous: `liaison ${O.nature("K–O")} (électron cédé)`,
        schema: { type: "don", a: "K", la: "K⁺", ra: 19, fa: 12, b: "O", aria: "Le potassium cède son électron au feuillet" },
        li: [`Ionique ${O.fraction(O.ionicite("K", "O"))} (Pauling). Le K⁺ partage sa charge entre douze oxygènes : chaque liaison ne vaut qu'un douzième de liaison simple.`,
          "Ce sont ces liaisons, entre les feuillets, que l'eau défait d'abord : d'où le clivage parfait des micas, et la vermiculite."] },
    ];
  }

  // talc : Si–O + Mg–O, rien entre les feuillets ; énergies d'activation mesurées en barres (comme les chaînes)
  function energieTalc(d, O) {
    const E = d.energie || {}, C = (d.textes && d.textes.octa) || "Mg", fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
    const duo = [
      { titre: "Si–O", sous: `liaison ${O.nature("Si–O")} (électrons en partie partagés)`,
        schema: { type: "partage", a: "Si", b: "O", aria: "Silicium et oxygène partagent des électrons" },
        li: [`Ionique ${O.fraction(O.ionicite("Si", "O"))} seulement (Pauling). Elle tient chaque feuillet : c'est la dernière à céder.`,
          (d.textes && d.textes.entre) ? d.textes.entre : (d.textes && d.textes.un1) ? "Entre deux feuillets, des liaisons hydrogène : les OH de l'un s'accrochent aux oxygènes de l'autre. Bien plus faibles que les liaisons du feuillet, elles cèdent au clivage." : `Entre deux feuillets, aucune liaison : de faibles forces de van der Waals seulement. D'où le clivage parfait et la faible dureté ${d.la.startsWith("le ") ? "du " + d.la.slice(3) : "de " + d.la}.`] },
      { titre: `${C}–O`, sous: `liaison ${O.nature(`${C}–O`)} (électrons ${/mi-/.test(O.nature(`${C}–O`)) ? "en partie " : ""}cédés)`,
        schema: { type: "don", a: C, la: C === "Al" || (d.textes && d.textes.fer3) ? `${C}³⁺` : `${C}²⁺`, ra: 18, fa: 12, b: "O", aria: `${majuscule(O.art(C, "le"))} cède ses électrons au feuillet` },
        li: [`Ionique ${O.fraction(O.ionicite(C, "O"))} (Pauling). Sa charge se répartit sur six oxygènes et OH : chaque liaison ${C}–O ne vaut qu'${C === "Al" || (d.textes && d.textes.fer3) ? "une demi-liaison" : "un tiers de liaison"} simple. C'est elle qui lâche d'abord.`] },
    ];
    const EA = [["eaAcide", "Dans l'acide (H⁺)", "dans l'acide"], ["eaNeutre", "Vers la neutralité", "vers la neutralité"]].filter(([c]) => E[c] != null);
    let barres = null;
    if (EA.length) {
      const fac = (x) => fr1(Math.exp((x * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)));
      barres = { titre: "Énergie d'activation de la dissolution", unite: "kJ/mol", max: 100, graduations: [0, 25, 50, 75, 100], onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: EA.map(([c, nom]) => { const [a, b] = E[c]; return { nom, el: C, hachure: true, val: { ea: [a, b] }, txt: { ea: a === b ? `${fr1(a)} kJ/mol` : `${fr1(a)} à ${fr1(b)} kJ/mol` } }; }),
        explic: { ea: `L'énergie qu'il faut fournir pour que la réaction se fasse : plus elle est grande, plus la chaleur accélère la dissolution. De 25 à 35 °C, la vitesse est multipliée par ${EA.map(([c, , dans]) => E[c][0] === E[c][1] ? `${fac(E[c][0])} ${dans}` : `${fac(E[c][0])} à ${fac(E[c][1])} ${dans}`).join(", ")}.` } };
    }
    const rep = d.repere, ce = d.onglets.eau;
    let temps = null;
    if (rep && rep.eau && rep.eau.t && ce && ce.t) {
      const f = O.rond2(ce.t / rep.eau.t), nb = (x) => (x < 10 ? fr1(x) : O.sp(Math.round(x)));
      temps = { titre: (d.textes && d.textes.tempsTitre) || "Ce que change la couche d'octaèdres", explic: `${(d.textes && d.textes.tempsExplic) || ""} ${majuscule(rep.la)} sert de repère. Barres : écart entre les valeurs publiées.`.trim(),
        rangees: [{ titre: "Une unité de la surface quitte le cristal, dans l'eau du sol à 25 °C",
          fois: f >= 1 ? `environ ${nb(f)} fois plus lent pour ${d.la}` : `environ ${nb(O.rond2(1 / f))} fois plus rapide pour ${d.la}`,
          pts: [{ el: rep.cation, min: rep.eau.tmin, max: rep.eau.tmax, v: rep.eau.t, et: `${rep.nom} · ${rep.eau.court}`, ou: "haut" },
            { el: C, min: ce.tmin, max: ce.tmax, v: ce.t, et: `${d.nom} · ${ce.court}`, ou: "bas" }] }] };
    }
    return { duo, barres, temps };
  }

  Liaisons.scene("feuillets", {
    onglets: (d) => d.textes && (d.textes.sansK || d.textes.blanc || d.textes.chlorite) ? [{ k: "eau", nom: "Dans l'eau du sol" }, { k: "acide", nom: "Dans l'acide" }] : [{ k: "sol", nom: "Sol tempéré" }, { k: "acide", nom: "Dans l'acide" }],
    decor, etapes, energie,
    legende: (d) => Object.assign({ "e:O": "oxygène du cristal", "i:Ca2+": "autre ion du sol (Ca²⁺)", "t:avant": "atome juste devant le plan du dessin (en contour)", "t:arriere": "couche juste derrière le plan du dessin (plus petite, pâle)" },
      d.textes && d.textes.octa === "Al" && !d.textes.sansK ? { "l:Al–O:cov": "liaison Al–O des tétraèdres, mi-ionique, mi-covalente", "l:Al–O:ion": "liaison Al–O des octaèdres, mi-ionique, mi-covalente" } : {}),
    aria: (d) => `Coupe du bord d'un paquet de feuillets de ${d.nom}, étape par étape`,
  });
})();
