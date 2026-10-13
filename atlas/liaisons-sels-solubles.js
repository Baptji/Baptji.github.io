// ============ Liaisons du cristal — scène de la famille « sels-solubles » (type sel gemme) ============
// 10/10/2026 (prototype : halite). Coupe de la face de clivage {100} : sodiums et chlorures en damier, chacun entouré de six ions de
// signe contraire (quatre dans le plan du dessin). L'eau détache le cation (son oxygène tourné vers lui), puis l'anion (un hydrogène
// tourné vers lui) ; la marche recule d'un cran. Rien ne se forme : il ne reste que des ions dissous (ALT_REACTIONS : Na⁺, Cl⁻).
// Tout ce qui dépend du minéral vient de LIAISONS_DONNEES ; contrat : tools/liaisons/API.md.
(function () {
  "use strict";
  const S = 46, X0 = 44, Y0 = 196, LW = 30, LA = 36, RC = 10, RA = 15;   // rayons : Na⁺ 1,02 Å, Cl⁻ 1,81 Å (rapport conservé)
  const P = (r, c) => [X0 + c * S, Y0 + r * S];
  // relief : la couche d'ions juste derrière le plan du dessin, décalée en biais et réduite ; devant, seuls les voisins des ions suivis
  const DA = [16, -13], KA = 0.78, DV = [-19, 15], KV = 1.15;
  const derriere = (q) => [q[0] + DA[0], q[1] + DA[1]], devant = (q) => [q[0] + DV[0], q[1] + DV[1]];
  const existe = (r, c) => c >= 0 && c <= 12 && r >= 0 && r <= 3 && !(r === 0 && c > 6);
  const estC = (r, c) => (r + c) % 2 === 0;
  const MS = [0, 6], XS = [0, 5], VS = [0, 4];   // cation suivi, anion voisin, cation qui se retrouve au bord
  const egal = (a, b) => a[0] === b[0] && a[1] === b[1];
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const nb = (x, O) => (x < 10 ? String(Math.round(x * 10) / 10).replace(".", ",") : O.sp(Math.round(x)));   // « 1,9 » et non « 1,9000000000000001 »

  const catEl = (r, c, d, N) => (d.textes && d.textes.cation2 && (r + c) % 4 === 0 ? d.textes.cation2 : N.M);   // un cation sur deux (chalcopyrite)
  function noms(d, O) {
    const M = d.cation, X = Object.keys(d.valences)[0].split("-")[1];
    const v = d.valences[`${M}-${X}`], p = `${M}–${X}`;
    return { M, X, v, p, nom: O.nomEl(M), le: O.art(M, "le") };
  }
  const voisins = (r, c) => [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([a, b]) => [r + a, c + b]).filter(([a, b]) => existe(a, b));

  function decor(k, d, O) {
    const N = noms(d, O), touche = (q) => egal(q, MS) || egal(q, XS);
    let l = `<rect x="0" y="0" width="640" height="340" class="lp-f-eau"/><path d="M0 172 H343 V218 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    // dessus des deux terrasses et côté de la marche, fuyant vers l'arrière : le cristal se lit comme un bloc
    l += `<path d="M0 172 L${DA[0]} ${172 + DA[1]} H${343 + DA[0]} V${218 + DA[1]} H640 V218 H343 V172 Z" class="lp-f-dessus"/>`;
    const tetra = !!(d.textes && d.textes.tetra);
    const ligne = (p, q, w) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" class="lp-l-prof" stroke-width="${w}"/>`;
    if (!tetra) for (let r = 0; r <= 3; r++) for (let c = 0; c <= 12; c++) if (existe(r, c) && estC(r, c)) for (const q of voisins(r, c)) l += ligne(derriere(P(r, c)), derriere(P(...q)), 1.6);
    if (!tetra) for (let r = 0; r <= 3; r++) for (let c = 0; c <= 12; c++) {
      if (!existe(r, c)) continue;
      const [x, y] = derriere(P(r, c));   // derrière un cation, un anion, et inversement
      l += estC(r, c) ? O.atome(x, y, N.X, { r: RA * KA, cls: "lp-arriere", lg: "t:arriere" }) : O.atome(x, y, N.M, { r: RC * KA, cls: "lp-arriere", lg: "t:arriere" });
    }
    if (!tetra) for (let r = 0; r <= 3; r++) for (let c = 0; c <= 12; c++) if (existe(r, c) && !touche([r, c])) l += ligne(P(r, c), derriere(P(r, c)), 2.2);
    for (let r = 0; r <= 3; r++) for (let c = 0; c <= 12; c++) {
      if (!existe(r, c) || !estC(r, c)) continue;
      const [x, y] = P(r, c);
      for (const q of voisins(r, c)) if (!touche([r, c]) && !touche(q)) l += O.lien(x, y, ...P(...q), { k: "ion", v: N.v, p: N.p });
    }
    for (const q of [[0, 0], [0, 2], [0, 4], [1, 9]]) {   // eau déjà posée au-dessus des cations de surface
      const [x, y] = P(...q);
      l += O.lien(x, y, x, y - LW, { k: "eau", v: N.v, p: `${N.M}–O` });
      a += O.eau(x, y - LW, -90);
    }
    for (const q of [[0, 1], [1, 8]]) { const [x, y] = P(...q); a += O.eau(x, y - LA, 90); }   // et au-dessus de deux anions
    for (let r = 0; r <= 3; r++) for (let c = 0; c <= 12; c++) {
      if (!existe(r, c) || touche([r, c])) continue;
      const [x, y] = P(r, c);
      a += estC(r, c) ? O.atome(x, y, catEl(r, c, d, N), { r: RC }) : O.atome(x, y, N.X, { r: RA });
    }
    for (const [x, y, an] of [[96, 70, 20], [206, 40, 150], [604, 150, 60], [560, 40, 200], [330, 120, 110]]) a += O.eau(x, y, an, { decor: true });
    return { l, a };
  }

  function etapes(k, d, O) {
    const N = noms(d, O), o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const M0 = P(...MS), X0p = P(...XS), V0 = P(...VS), B0 = P(1, 6), C15 = P(1, 5);
    const pl = { h: [0, -1, -90], d: [1, 0, 0], b: [0, 1, 90], g: [-1, 0, 180] };
    const autour = (x, y, liste, L = LW, vers = false) => {   // vers : hydrogène tourné vers l'ion (anion)
      const out = {};
      for (const [id, p] of liste) { const [dx, dy, an] = pl[p]; out[id] = { x: x + dx * L, y: y + dy * L, a: vers ? an + 180 : an }; }
      return out;
    };
    const versA = (q, an, L = LW) => ({ x: q.x + L * Math.cos(O.rad(an)), y: q.y + L * Math.sin(O.rad(an)), a: an });
    const mx = (a, b) => ({ a, b, k: "ion", v: N.v, p: N.p }), we = (a, b) => ({ a, b, k: "eau", v: N.v, p: `${N.M}–O` });
    const suite = O.suite, e = [];
    const A0 = Object.assign({
      Wa: { t: "eau", x: 470, y: 128, a: 200 }, Wb: { t: "eau", x: 400, y: 60, a: -40 },
      Wc: { t: "eau", x: 150, y: 120, a: 60 }, Wd: { t: "eau", x: 260, y: 30, a: 10 }, We: { t: "eau", x: 520, y: 100, a: 250 },
      Wn: { t: "eau", x: 306, y: 152, a: 300 },
      X: { t: "at", el: N.X, x: X0p[0], y: X0p[1], r: RA },
      M: { t: "at", el: N.M, x: M0[0], y: M0[1], r: RC },
      halo: { t: "halo", x: M0[0], y: M0[1], r: 17 },
      MV: { t: "at", el: N.X, x: devant(M0)[0], y: devant(M0)[1], r: RA * KV, cls: "lp-avant", lg: "t:avant" },
      XV: { t: "at", el: N.M, x: devant(X0p)[0], y: devant(X0p)[1], r: RC * KV, cls: "lp-avant", lg: "t:avant" },
    }, autour(M0[0], M0[1], [["Wu", "h"], ["Wr", "d"]]));
    for (const id of ["Wu", "Wr"]) A0[id].t = "eau";
    const B0b = { mX: mx("M", "X"), mB: mx("M", B0), x4: mx(V0, "X"), x15: mx(C15, "X"), wu: we("M", "Wu"), wr: we("M", "Wr"),
      mA: mx("M", derriere(M0)), mV: mx("M", "MV"), xA: mx("X", derriere(X0p)), xV: mx("X", "XV") };
    e.push({ A: A0, B: B0b, L: {}, g: [4, 2], h: { v: hv === null ? null : 0 },
      titre: "Le bord d'une marche du cristal",
      texte: `Chaque ${N.nom} (${N.M}⁺) tient six chlorures (${N.X}⁻), et chaque chlorure six ${N.nom}s : quatre dans le plan du dessin, un devant (en contour), un derrière (plus petit et pâle). Au bord, celui qu'on suit (cerclé) en a déjà perdu deux : l'eau occupe leur place, oxygène tourné vers lui.` });
    const m1 = { x: M0[0] + 8, y: M0[1] - 10 };
    const T = d.textes || {};
    if (T.sulfure) {   // 11/10/2026 : galène (PbS, structure du sel gemme) dans l'eau acide : le soufre part en H₂S
      const tt = !!T.tetra, Le = majuscule(N.le), an = T.anionNom || "soufre", Mol = T.molecule || "H₂S";
      e[0].texte = T.debut;
      if (tt) { delete e[0].A.MV; delete e[0].A.XV; for (const kk of ["mA", "mV", "xA", "xV"]) delete e[0].B[kk]; e[0].g = [2, 2]; }
      const z = (o) => { if (tt) for (const kk of ["mA", "mV", "xA", "xV"]) delete o[kk]; return o; };
      e[0].A.Ha = { t: "hp", x: 300, y: 64 }; e[0].A.Hb = { t: "hp", x: 380, y: 110 };
      const ha = { x: X0p[0] - 10, y: X0p[1] - 15 }, hb = { x: X0p[0] + 10, y: X0p[1] - 15 };
      e.push(suite(e[0], {
        titre: `Des H⁺ s'accrochent ${an === "oxygène" ? "à l'oxygène" : "au " + an}, l'eau ${O.art(N.M, "au")}`,
        texte: `Deux H⁺ de l'eau acide se fixent sur ${an === "oxygène" ? "un oxygène" : "un " + an} du bord, et l'eau se glisse contre ${N.le} : ses liaisons ${N.p} lâchent une à une. C'est l'étape lente${o.lettres ? ` : ${o.lettres} environ par ${d.formule} de la surface` : ""}.`,
        A: { M: m1, halo: Object.assign({}, m1, { o: 0 }), Wu: { x: m1.x, y: m1.y - LW, a: -90 }, Wr: versA(m1, -25), Wa: versA(m1, 40),
          Ha: Object.assign({ t: "h" }, ha), Hb: Object.assign({ t: "h" }, hb) },
        B: z({ mB: 0, mA: 0, wa: we("M", "Wa"), ha: { a: "X", b: "Ha", k: "oh" }, hb: { a: "X", b: "Hb", k: "oh" } }), g: tt ? [1, 3] : [2, 4], h: Object.assign({ cours: true }, H),
      }));
      const m2 = { x: 470, y: 92 };
      e.push(suite(e[1], {
        titre: `${Le} s'en va, habillé d'eau`,
        texte: `Le dernier ${an} a lâché. ${Le} part entouré de molécules d'eau : ${d.hydrate}.`,
        A: Object.assign({ M: m2 }, autour(m2.x, m2.y, [["Wu", "h"], ["Wr", "d"], ["Wa", "b"], ["Wb", "g"]])),
        B: z({ mX: 0, mV: 0, wb: we("M", "Wb") }), g: tt ? [0, 4] : [0, 6], h: H,
        L: { lM: { x: m2.x + 62, y: m2.y + 5, t: d.hydrate } },
      }));
      const x2 = { x: 238, y: 92 };
      e.push(suite(e[2], {
        titre: `${an === "oxygène" ? "L'oxygène" : "Le " + an} part en ${Mol}`,
        texte: T.soufre || "Privé de ses voisins, le soufre du bord part avec ses deux hydrogènes : H₂S, un gaz dissous.",
        A: { X: x2, Ha: { x: x2.x - 10, y: x2.y - 15 }, Hb: { x: x2.x + 10, y: x2.y - 15 } },
        B: z({ x4: 0, x15: 0, xA: 0, xV: 0 }),
        L: { lX: { x: x2.x, y: x2.y + 40, t: Mol, m: 1 } },
      }));
      const vn = { x: V0[0] + LW, y: V0[1], a: 0 };
      e.push(suite(e[3], {
        titre: "La marche recule d'un cran",
        texte: T.recule || `${Le} voisin se retrouve au bord, et tout recommence.`,
        A: { Wn: vn, halo: { x: V0[0], y: V0[1], o: 1 } },
        B: { wn: we(V0, "Wn") },
      }));
      return e;
    }
    e.push(suite(e[0], {
      titre: "L'eau prend la place des chlorures",
      texte: `Une molécule d'eau se glisse : un chlorure lâche, l'oxygène de l'eau le remplace, puis un autre. C'est l'étape lente${o.lettres ? `, à l'échelle de l'atome seulement : ${o.lettres} environ par ${N.nom} de la surface` : ""}.`,
      A: { M: m1, halo: Object.assign({}, m1, { o: 0 }), Wu: { x: m1.x, y: m1.y - LW, a: -90 }, Wr: versA(m1, -25), Wa: versA(m1, 40) },
      B: { mB: 0, mA: 0, wa: we("M", "Wa") }, g: [2, 4], h: Object.assign({ cours: true }, H),
    }));
    const m2 = { x: 470, y: 92 };
    e.push(suite(e[1], {
      titre: `${majuscule(N.le)} s'en va, habillé d'eau`,
      texte: `Le dernier chlorure a lâché. ${majuscule(N.le)} part entouré de molécules d'eau : ${d.hydrate}.`,
      A: Object.assign({ M: m2 }, autour(m2.x, m2.y, [["Wu", "h"], ["Wr", "d"], ["Wa", "b"], ["Wb", "g"]])),
      B: { mX: 0, mV: 0, wb: we("M", "Wb") }, g: [0, 6], h: H,
      L: { lM: { x: m2.x + 62, y: m2.y + 5, t: d.hydrate } },
    }));
    const x2 = { x: 238, y: 92 };
    e.push(suite(e[2], {
      titre: "Le chlorure part à son tour",
      texte: "Privé de ses voisins, le chlorure du bord est pris par l'eau. Autour de lui, les molécules d'eau tournent un hydrogène vers lui : c'est leur côté chargé positivement.",
      A: Object.assign({ X: x2 }, autour(x2.x, x2.y, [["Wc", "g"], ["Wd", "h"], ["We", "d"]], LA, true)),
      B: { x4: 0, x15: 0, xA: 0, xV: 0 },
      L: { lX: { x: x2.x, y: x2.y + 52, t: `${N.X}⁻ hydraté`, m: 1 } },
    }));
    const vn = { x: V0[0] + LW, y: V0[1], a: 0 };
    e.push(suite(e[3], {
      titre: "La marche recule d'un cran",
      texte: `${majuscule(N.le)} voisin se retrouve au bord : il a perdu deux voisins, l'eau s'y pose, et tout recommence. Rien d'autre ne se forme : le sel ne donne que des ions ${N.M}⁺ et ${N.X}⁻ dissous.`,
      A: { Wn: vn, halo: { x: V0[0], y: V0[1], o: 1 } },
      B: { wn: we(V0, "Wn") },
    }));
    return e;
  }

  function energie(d, O) {
    const N = noms(d, O), E = d.energie || {}, rep = d.repere, T = d.textes || {};
    const n = Math.round(d.distances[`${N.M}-${N.X}`].n);
    if (T.sulfure) return { duo: [{
      titre: N.p, sous: `liaison ${O.nature(N.p)} (${T.duoSous || "électrons surtout partagés"})`,
      schema: { type: "don", a: N.M, la: `${N.M}${T.chargeM || "²⁺"}`, ra: 15, fa: 12, b: N.X, lb: `${N.X}²⁻`, aria: `${majuscule(N.le)} cède ses électrons au soufre` },
      li: [T.duoIon || `Ionique ${O.fraction(O.ionicite(N.M, N.X))} seulement (Pauling) : ${N.nom} et ${T.anionNom || "soufre"} gardent une bonne part de leurs électrons en commun.`,
        `Chaque ion en tient ${O.lettres(n)} de signe contraire${n === 4 ? ", en tétraèdre" : ""} : chaque liaison ${N.p} vaut ${T.duoPart || ({ 4: "la moitié d'une", 6: "un tiers d'une" })[n] || `2/${n} de`} liaison simple.`,
        `Dans l'eau acide, les H⁺ prennent ${T.anionNom === "oxygène" ? "l'oxygène" : "le soufre"}, l'eau prend ${N.le}.`] }], barres: null, temps: null };
    const duo = [{
      titre: N.p, sous: `liaison ${O.nature(N.p)} (électron cédé)`,
      schema: { type: "don", a: N.M, la: `${N.M}⁺`, ra: 15, fa: 12, b: N.X, lb: `${N.X}⁻`, aria: `${majuscule(N.le)} cède son électron au chlore` },
      li: [`${majuscule(N.le)} a cédé son électron au chlore : ${N.M}⁺ et ${N.X}⁻ s'attirent comme + et −. Ionique ${O.fraction(O.ionicite(N.M, N.X))} (Pauling).`,
        `Chaque ion en tient ${O.lettres(n)} de signe contraire : sa charge se partage entre eux, et chaque liaison ${N.p} ne vaut ${({ 4: "qu'un quart", 6: "qu'un sixième", 8: "qu'un huitième" })[n] || `que 1/${n}`} de liaison simple.`,
        `Dans l'eau, l'oxygène d'une molécule d'eau prend la place d'un chlorure autour ${O.art(N.M, "du")}, et un hydrogène celle ${O.art(N.M, "du")} autour du chlorure.`],
    }];
    let barres = null;
    if (E.eaNeutre != null) {
      const fac = String(Math.round(Math.exp((E.eaNeutre * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)) * 10) / 10).replace(".", ",");
      barres = {
        titre: "Énergie d'activation de la dissolution", unite: "kJ/mol", max: 100, graduations: [0, 25, 50, 75, 100],
        onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: [{ nom: "Dans l'eau pure", el: N.M, val: { ea: [0, E.eaNeutre] }, txt: { ea: `${String(E.eaNeutre).replace(".", ",")} kJ/mol` } }],
        explic: { ea: `L'énergie qu'il faut fournir pour que la réaction se fasse : plus elle est grande, plus la chaleur accélère la dissolution. Ici elle est très faible : de 25 à 35 °C, la vitesse n'est multipliée que par ${fac}.` },
      };
    }
    let temps = null;
    if (rep && rep.eau && d.onglets.eau && d.onglets.eau.t) {
      const f = O.rond2(rep.eau.t / d.onglets.eau.t);
      temps = {
        titre: `Pourquoi ${d.la} fond si vite`,
        explic: `${T.tempsExplic || ""} ${majuscule(rep.la)} sert de repère. Barres : écart entre les valeurs publiées.`.trim(),
        rangees: [{ titre: "Un ion de la surface quitte le cristal, dans l'eau pure à 25 °C", fois: `environ ${nb(f, O)} fois plus rapide pour ${d.la}`,
          pts: [{ el: rep.cation, min: rep.eau.tmin, max: rep.eau.tmax, v: rep.eau.t, et: `${rep.nom} · ${rep.eau.court}`, ou: "haut" },
            { el: N.M, min: d.onglets.eau.tmin, max: d.onglets.eau.tmax, v: d.onglets.eau.t, et: `${d.nom} · ${d.onglets.eau.court || d.onglets.eau.txt}`, ou: "bas" }] }],
      };
    }
    return { duo, barres, temps };
  }

  Liaisons.scene("sels-solubles", {
    onglets: (d) => (d.textes && d.textes.sulfure ? [{ k: "acide", nom: "Eau acide aérée (pH 3)" }] : [{ k: "eau", nom: "Dans l'eau" }]),
    decor, etapes, energie,
    jauge: (d) => ({ titre: `voisins du ${Liaisons.outils.nomEl(d.cation)} suivi`, n: d.textes && d.textes.tetra ? 4 : 6, classes: [d.textes && d.textes.sulfure ? `e:${d.textes.anion || "S"}` : "e:Cl", "lp-j-ow"] }),
    legende: (d) => d.textes && d.textes.sulfure ? ({ [`e:${d.cation}`]: d.textes.cationLeg || `${Liaisons.outils.nomEl(d.cation)} (${d.cation}²⁺)`, ...(d.textes.cation2 ? { [`e:${d.textes.cation2}`]: d.textes.cation2Leg || Liaisons.outils.nomEl(d.textes.cation2) } : {}), [`e:${d.textes.anion || "S"}`]: d.textes.anionLeg || "soufre (S²⁻)", "i:H+": "H⁺ de l'acide",
      "t:avant": "ion juste devant le plan du dessin (en contour)", "t:arriere": "ion juste derrière le plan du dessin (plus petit, pâle)" }) : ({ [`e:${d.cation}`]: `${Liaisons.outils.nomEl(d.cation)} (${d.cation}⁺)`, "e:Cl": "chlorure (Cl⁻)",
      "t:avant": "ion juste devant le plan du dessin (en contour)", "t:arriere": "ion juste derrière le plan du dessin (plus petit, pâle)" }),
    aria: (d) => `Coupe du bord d'un cristal de ${d.nom}, étape par étape`,
  });
})();
