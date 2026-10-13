// ============ Liaisons du cristal — scène de la famille « sulfures » (gabarit de la pyrite) ============
// 10/10/2026 (prototype : pyrite). Coupe de la face du cube {100} : la structure du sel gemme, avec des paires de soufre S₂ (haltères
// tournés alternativement) à la place du chlore ; chaque fer tient six soufres (quatre dans le plan), chaque soufre son jumeau et trois
// fers. Mécanisme (Williamson et Rimstidt 1994) : l'oxydant (O₂ ou Fe³⁺) prend des électrons en un point de la surface (étape lente),
// la pyrite les conduit ; ailleurs, l'eau donne ses oxygènes au soufre (2 SO₄²⁻ + H⁺) ; le fer part (Fe²⁺) et, à l'air, rouille sur place.
(function () {
  "use strict";
  const S = 54, X0 = 44, Y0 = 196, D = 8, LW = 30;
  const P = (r, c) => [X0 + c * S, Y0 + r * S];
  const existe = (r, c) => c >= 0 && c <= 11 && r >= 0 && r <= 2 && !(r === 0 && c > 6);
  const estFe = (r, c) => (r + c) % 2 === 0;
  const sens = (r, c) => ((r * 3 + c) % 4 === 1 ? 1 : -1);
  const paireP = (r, c) => { const [x, y] = P(r, c), o = sens(r, c); return [[x - D, y + D * o], [x + D, y - D * o]]; };
  // marcassite (Rieder et al. 2007), vue le long de c : même damier fer / paires S₂ en projection, mais les paires sont COUCHÉES dans le plan,
  // à ≈ 36° de l'axe a (S–S 2,215 Å : 1,78 Å selon a, 1,32 selon b), inclinées dans un sens une rangée sur deux (couches z = 0 et z = ½)
  const paireM = (r, c) => { const [x, y] = P(r, c), o = r % 2 ? 1 : -1; return [[x - 9.1, y + 6.7 * o], [x + 9.1, y - 6.7 * o]]; };
  let paire = paireP;
  const PYR = { paire: paireP, marc: false }, MAR = { paire: paireM, marc: true };
  const MS = [0, 6], TS = [0, 5], CA = [0, 2];   // fer suivi, paire suivie, fer où se pose l'oxydant
  const egal = (a, b) => a[0] === b[0] && a[1] === b[1];
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const VFS = 2 / 6;   // compte des charges (les paramètres de valence de liaison ne conviennent pas à la pyrite : note des sources)
  const voisins = (r, c) => [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([a, b]) => [r + a, c + b]).filter(([a, b]) => existe(a, b));
  const proche = (p, q) => { const s = paire(...q); return Math.hypot(s[0][0] - p[0], s[0][1] - p[1]) < Math.hypot(s[1][0] - p[0], s[1][1] - p[1]) ? 0 : 1; };

  function decor(k, d, O, V) {
    paire = V.paire;
    const fs = (a, b) => O.lien(a[0], a[1], b[0], b[1], { k: "ion", v: VFS, p: "Fe–S" });
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>${O.relief.dessus([[0, 170], [X0 + 6 * S + 26, 170], [X0 + 6 * S + 26, 224], [640, 224]])}<path d="M0 170 H${X0 + 6 * S + 26} V224 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    for (let r = 0; r <= 2; r++) for (let c = 0; c <= 11; c++) {
      if (!existe(r, c)) continue;
      if (estFe(r, c)) {
        const p = P(r, c);
        if (!egal([r, c], MS)) for (const q of voisins(r, c)) if (!egal(q, TS)) l += fs(p, paire(...q)[proche(p, q)]);
        if (!egal([r, c], MS)) a += O.atome(p[0], p[1], "Fe");
      } else if (!egal([r, c], TS)) {
        const [s1, s2] = paire(r, c);
        l += O.lien(s1[0], s1[1], s2[0], s2[1], { k: "cov", v: 1, el: "S", p: "S–S" });
        a += O.atome(s1[0], s1[1], "S") + O.atome(s2[0], s2[1], "S");
      }
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    for (const [x, y, an] of [[90, 110, 20], [206, 44, 150], [604, 120, 60], [540, 40, 200], [40, 150, 300], [600, 172, 250]]) a += O.eau(x, y, an, { decor: true });
    if (k === "air") {
      for (const [x, y] of V.marc ? [[300, 40], [400, 125]] : [[300, 40], [470, 140]]) { l += O.lien(x - 7, y, x + 7, y, { k: "cov", v: 2, el: "O", p: "O=O" }); a += O.atome(x - 7, y, "O", { o: 0.55 }) + O.atome(x + 7, y, "O", { o: 0.55 }); }
      if (V.marc) for (const [x, y] of [[60, 70], [398, 30], [612, 62]]) a += O.hplus(x, y, { decor: true });   // eau acide aérée (pH 3)
    }
    else {
      for (const [x, y] of [[60, 70], [172, 92], [398, 30], [612, 62]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 24], [470, 150], [330, 70]]) a += O.ion(x, y, "Fe", "3+", { decor: true, r: 11 });
    }
    return { l, a };
  }

  function etapes(k, d, O, V) {
    paire = V.paire;
    const o = d.onglets[k] || {}, hv = o.t ?? null, T = d.textes || {};
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const pm = P(...MS), [s1, s2] = paire(...TS), pt = P(...TS), pc = P(...CA);
    const fs = (a, b) => ({ a, b, k: "ion", v: VFS, p: "Fe–S" });
    const pres = (fe, i) => fs(P(...fe), i === 0 ? "Sa" : "Sb");
    const A = {
      Sa: { t: "at", el: "S", x: s1[0], y: s1[1] }, Sb: { t: "at", el: "S", x: s2[0], y: s2[1] },
      M: { t: "at", el: "Fe", x: pm[0], y: pm[1] },
      Wu: { t: "eau", x: pm[0], y: pm[1] - LW, a: -90 }, Wr: { t: "eau", x: pm[0] + LW, y: pm[1], a: 0 },
      Wa: { t: "eau", x: 470, y: 90, a: 200 }, Wb: { t: "eau", x: 560, y: 150, a: 30 },
      Xa: k === "air" ? { t: "at", el: "O", x: 230, y: 70 } : { t: "at", el: "Fe", x: 230, y: 70 },
      Xb: k === "air" ? { t: "at", el: "O", x: 244, y: 70 } : { t: "at", el: "Fe", x: 230, y: 70, o: 0 },
      halo: { t: "halo", x: pt[0], y: pt[1], r: 22 },
    };
    const OX = ["O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8"], HX = ["H1", "H2", "H3"];
    OX.forEach((id) => { A[id] = { t: "at", el: "Ow", x: 330, y: 120, o: 0 }; });
    HX.forEach((id) => { A[id] = { t: "hp", x: 330, y: 120, o: 0 }; });
    const B = { ss: { a: "Sa", b: "Sb", k: "cov", v: 1, el: "S", p: "S–S" }, wu: { a: "M", b: "Wu", k: "eau", v: VFS, p: "Fe–O" }, wr: { a: "M", b: "Wr", k: "eau", v: VFS, p: "Fe–O" } };
    for (const fe of voisins(...TS)) if (estFe(...fe)) B["f" + fe.join("")] = pres(fe, proche(P(...fe), TS));
    // relief : chaque soufre de la paire a aussi un fer hors du plan (devant pour l'un, derrière pour l'autre) ; « f… » : cassées avec les autres
    const fv = O.relief.devant(s1);
    A.FV = Object.assign({ t: "at", el: "Fe", x: fv[0], y: fv[1] }, O.relief.avant);
    B.fV = fs("FV", "Sa"); B.fA = fs(O.relief.arriere(decor(k, d, O, V).l, "Fe", s2), "Sb");
    if (k === "air") B.xx = { a: "Xa", b: "Xb", k: "cov", v: 2, el: "O", p: "O=O" };
    const e = [], suite = O.suite;
    e.push({ A, B, L: k === "acide" ? { lX: { x: 230, y: 96, t: "Fe³⁺", m: 1 } } : { lX: { x: 237, y: 96, t: "O₂", m: 1 } }, h: { v: hv === null ? null : 0 },
      titre: k === "air" ? "Le bord d'une marche du cristal" : "Le même bord, dans une eau acide de mine",
      texte: k === "air"
        ? (T.debut || "Chaque fer tient six soufres ; les soufres vont par paires (S₂), chacun lié à son jumeau et à trois fers. Au bord, on suit une paire (cerclée). L'eau contient de l'oxygène dissous, O₂.")
        : (T.debutAcide || "Une eau acide (H⁺, en vert) chargée d'ions ferriques Fe³⁺ (en brun), comme celle qui sort des mines : c'est elle, et non l'oxygène, qui attaque le plus vite la pyrite."),
    });
    const sur = [pc[0], pc[1] - 26];
    e.push(suite(e[0], {
      titre: k === "air" ? "L'oxygène prend des électrons au cristal" : "Un ion Fe³⁺ prend un électron au cristal",
      texte: (k === "air"
        ? (T.air2 || "Une molécule d'O₂ se pose sur un fer de la surface et prend des électrons au cristal ; elle finira en eau. ")
        : "Un ion Fe³⁺ se pose sur la surface et prend un électron : il redevient Fe²⁺. Il en faut quatorze pour défaire une unité FeS₂. ")
        + (T.electrons || "La pyrite conduit les électrons : ils peuvent venir d'ailleurs, de la paire qu'on suit. C'est l'étape lente."),
      A: k === "air" ? { Xa: { x: sur[0] - 7, y: sur[1] }, Xb: { x: sur[0] + 7, y: sur[1] } } : { Xa: { x: sur[0], y: sur[1] } },
      L: { lX: { x: sur[0], y: sur[1] - 22, t: k === "air" ? "O₂ + électrons" : "Fe³⁺ → Fe²⁺", m: 1 } },
      h: Object.assign({ cours: true }, H),
    }));
    const c1 = [228, 92], c2 = [318, 120], car = (c) => [[c[0] - 14, c[1] - 14], [c[0] + 14, c[1] - 14], [c[0] - 14, c[1] + 14], [c[0] + 14, c[1] + 14]];
    const pos = {}; car(c1).forEach((p, i) => { pos[OX[i]] = { x: p[0], y: p[1], o: 1 }; }); car(c2).forEach((p, i) => { pos[OX[i + 4]] = { x: p[0], y: p[1], o: 1 }; });
    const Bn = { ss: 0 }; for (const id of Object.keys(B)) if (id.startsWith("f")) Bn[id] = 0;
    OX.forEach((id, i) => { Bn["so" + i] = { a: i < 4 ? "Sa" : "Sb", b: id, k: "cov", v: 1.5, el: "S", p: "S–O" }; });
    e.push(suite(e[1], {
      titre: T.titreSoufre || "L'eau donne ses oxygènes au soufre",
      texte: (k === "air" ? T.soufre : T.soufreAcide) || "Privés d'électrons, les deux soufres de la paire se séparent et prennent chacun quatre oxygènes, venus de l'eau (les isotopes le montrent) : deux ions sulfate SO₄²⁻ partent, et l'eau s'acidifie (H⁺).",
      A: Object.assign(pos, { Sa: { x: c1[0], y: c1[1] }, Sb: { x: c2[0], y: c2[1] }, halo: { x: c1[0], y: c1[1], o: 0 },
        H1: { x: 400, y: 70, o: 1 }, H2: { x: 160, y: 120, o: 1 }, H3: { x: 352, y: 150, o: 1 } }),
      B: Bn, h: H,
      L: { lS: { x: (c1[0] + c2[0]) / 2, y: 64, t: "2 SO₄²⁻", m: 1 }, lH: { x: 418, y: 58, t: "H⁺", m: 1 } },
    }));
    const m2 = { x: 470, y: 92 };
    if (k === "air" && !T.ferAir) {
      const g = { x: 440, y: 208 };   // retombé sur la terrasse, au pied de la marche
      e.push(suite(e[2], {
        titre: "Le fer part… et rouille sur place",
        texte: "Privé de ses soufres, le fer passe dans l'eau (Fe²⁺). À l'air, il s'oxyde à son tour et retombe sur place : de la rouille, la goethite FeOOH. Ce qui part avec l'eau : du sulfate et de l'acidité.",
        A: { M: g, Wu: { x: g.x - 20, y: g.y - 10, a: 180 }, Wr: { x: g.x + 20, y: g.y - 10, a: 0 } },
        L: { lG: { x: g.x, y: g.y - 40, t: "FeOOH (goethite)", m: 1 } },
      }));
    } else {
      e.push(suite(e[2], {
        titre: "Le fer part avec l'eau",
        texte: k === "air" ? T.ferAir : "Privé de ses soufres, le fer part entouré d'eau, en Fe²⁺. Dans l'eau acide, il y reste : avec le sulfate et les H⁺, il fait les eaux rouges et acides des mines.",
        A: { M: m2, Wu: { x: m2.x, y: m2.y - LW, a: -90 }, Wr: { x: m2.x + LW, y: m2.y, a: 0 }, Wa: { x: m2.x, y: m2.y + LW, a: 90 }, Wb: { x: m2.x - LW, y: m2.y, a: 180 } },
        B: { wa: { a: "M", b: "Wa", k: "eau", v: VFS, p: "Fe–O" }, wb: { a: "M", b: "Wb", k: "eau", v: VFS, p: "Fe–O" } },
        L: { lM: { x: m2.x + 62, y: m2.y + 5, t: d.hydrate } },
      }));
    }
    return e;
  }

  function energie(d, O) {
    const E = d.energie || {};
    const duo = [
      { titre: "S–S", sous: `liaison ${O.nature("S–S")} (électrons partagés)`,
        schema: { type: "partage", a: "S", b: "S", aria: "Deux soufres partagent deux électrons" },
        li: ["Les deux soufres d'une paire partagent deux électrons : une liaison simple, sans rien d'ionique.",
          "Elle casse pourtant : privés d'électrons par l'oxydant, les deux soufres se séparent et prennent les oxygènes de l'eau."] },
      { titre: "Fe–S", sous: `liaison ${O.nature("Fe–S")}`,
        schema: { type: "partage", a: "Fe", b: "S", aria: "Le fer et le soufre partagent des électrons" },
        li: [`Ionique ${O.fraction(O.ionicite("Fe", "S"))} seulement (Pauling) : la pyrite est presque covalente, d'où son éclat de métal.`,
          "Les électrons y circulent d'un point à l'autre de la surface : c'est ce qui permet à l'oxydant de les prendre loin du soufre qui réagit."] },
    ];
    let barres = null;
    if (E.ea) {
      const [a, b] = E.ea, fac = (x) => String(Math.round(Math.exp((x * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)) * 10) / 10).replace(".", ",");
      barres = { titre: "Énergie d'activation de l'oxydation", unite: "kJ/mol", max: 100, graduations: [0, 25, 50, 75, 100], onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: [{ nom: (d.textes || {}).eaNom || "Par l'O₂ ou le Fe³⁺", el: "Fe", hachure: true, val: { ea: [a, b] }, txt: { ea: `${a} à ${b} kJ/mol` } }],
        explic: { ea: `${(d.textes || {}).eaTexte || "Une énergie de réaction chimique, pas de simple diffusion"} : de 25 à 35 °C, l'oxydation va ${fac(a)} à ${fac(b)} fois plus vite.${E.eaPalandri ? ` Palandri et Kharaka retiennent ${String(E.eaPalandri).replace(".", ",")} kJ/mol.` : ""}` } };
    }
    return { duo, barres, temps: null };
  }

  for (const [nom, V] of [["sulfures", PYR], ["sulfures-marcassite", MAR]]) Liaisons.scene(nom, {
    onglets: (d) => [{ k: "air", nom: (d.textes && d.textes.ongletAir) || "À l'air (O₂)" }, { k: "acide", nom: "Eau acide (Fe³⁺)" }],
    decor: (k, d, O) => decor(k, d, O, V), etapes: (k, d, O) => etapes(k, d, O, V), energie,
    legende: () => ({ "e:Ow": "oxygène venu de l'eau", "i:Fe3+": "ion ferrique Fe³⁺",
      "t:avant": "atome juste devant le plan du dessin (en contour)", "t:arriere": "couche juste derrière le plan du dessin (plus petite, pâle)" }),
    aria: (d) => `Coupe du bord d'un cristal de ${d.nom}, étape par étape`,
  });
})();
