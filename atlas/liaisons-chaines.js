// ============ Liaisons du cristal — scène de la famille « chaines » (inosilicates) ============
// 10/10/2026 (prototype : diopside). Coupe schématique : chaînes de tétraèdres SiO₄ couchées (ponts Si–O–Si coudés le long de la chaîne,
// deux oxygènes non pontants par tétraèdre, en haut et en bas), tenues entre elles par les cations (Ca²⁺ et Mg²⁺ en alternance, quatre
// oxygènes dans le plan). Mécanisme : les cations du bord partent d'abord, échangés contre des H⁺ (Oelkers et al. 2018) ; puis l'eau casse
// le pont qui retient le tétraèdre au bout de la chaîne (étape lente, Heřmanská et al. 2023) et il part en H₄SiO₄.
(function () {
  "use strict";
  const S = 60, X0 = 40, YC = [190, 300], CO = 7, LO = 18, NS = 5;
  const P = (j, c) => [X0 + c * S, YC[j]];
  const existe = (j, c) => c >= 0 && c <= 10 && j >= 0 && j <= 1 && !(j === 0 && c > NS);
  const pont = (j, c) => [X0 + (c + 0.5) * S, YC[j] + CO];
  const oH = (j, c) => [X0 + c * S, YC[j] - LO], oB = (j, c) => [X0 + c * S, YC[j] + LO];
  const YM = (YC[0] + YC[1]) / 2;
  const cat = (c) => [X0 + (c + 0.5) * S, YM];
  const catEl = (c, d) => (c % 2 === 0 ? ((d.textes && d.textes.cation2) || d.cation) : d.cation);   // diopside : Ca suivi, Mg une colonne sur deux
  const MC = NS, TS = [0, NS];
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const nb = (x, O) => (x < 10 ? String(Math.round(x * 10) / 10).replace(".", ",") : O.sp(Math.round(x)));

  function decor(k, d, O) {
    const v = d.valences["Si-O"], cov = (a, b) => O.lien(a[0], a[1], b[0], b[1], { k: "cov", v, el: "Si", p: "Si–O" });
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>${O.relief.dessus([[0, 160], [X0 + NS * S + 34, 160], [X0 + NS * S + 34, YM - 22], [640, YM - 22]])}<path d="M0 160 H${X0 + NS * S + 34} V${YM - 22} H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    const estTS = (j, c) => j === TS[0] && c === TS[1];
    for (let j = 0; j <= 1; j++) for (let c = 0; c <= 10; c++) {
      if (!existe(j, c) || estTS(j, c)) continue;
      const p = P(j, c);
      if (existe(j, c + 1) && !estTS(j, c + 1)) { const o = pont(j, c); l += cov(p, o) + cov(P(j, c + 1), o); a += O.atome(o[0], o[1], "O"); }
      for (const q of [oH(j, c), oB(j, c)]) { l += cov(p, q); a += O.atome(q[0], q[1], "O"); }
      if (j === 0) { const q = oH(j, c); l += O.lien(q[0], q[1], q[0] + 9, q[1] - 9, { k: "oh" }); a += O.hlie(q[0] + 9, q[1] - 9); }
      a += O.atome(p[0], p[1], "Si", { r: 8 });
    }
    for (let c = -1; c <= 10; c++) {
      const p = cat(c);
      if (p[0] < 0 || c === MC) continue;
      const el = catEl(c, d), vM = d.valences[`${el}-O`], pn = `${el}–O`;
      for (const [j, cc, f] of [[0, c, oB], [0, c + 1, oB], [1, c, oH], [1, c + 1, oH]]) if (existe(j, cc) && !(j === 0 && cc === NS)) { const q = f(j, cc); l += O.lien(p[0], p[1], q[0], q[1], { k: "ion", v: vM, p: pn }); }
      if (c > NS) { l += O.lien(p[0], p[1], p[0], p[1] - 30, { k: "eau", v: vM, p: pn }); a += O.eau(p[0], p[1] - 30, -90); }
      a += O.atome(p[0], p[1], el);
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    for (const [x, y, an] of [[90, 110, 20], [206, 44, 150], [604, 120, 60], [540, 40, 200], [470, 150, 300]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") {
      for (const [x, y] of [[60, 70], [172, 92], [398, 30], [612, 62]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 24], [450, 110], [330, 70]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }

  function etapes(k, d, O) {
    const T = d.textes || {}, v = d.valences["Si-O"], o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const p = P(...TS), pg = P(0, NS - 1), ol = pont(0, NS - 1), ou = oH(0, NS), od = oB(0, NS), or = [p[0] + 24, p[1] - 4];
    const pc = cat(MC), el = catEl(MC, d), vM = d.valences[`${el}-O`], pg2 = cat(NS - 1), elg = catEl(NS - 1, d);
    const leA = O.art(el, "le"), leB = O.art(elg, "le"), tous = el === elg ? leA : `${leA} et ${leB}`;
    const at = (e, q, x) => Object.assign({ t: "at", el: e, x: q[0], y: q[1] }, x || {});
    const cov = (a, b) => ({ a, b, k: "cov", v, el: "Si", p: "Si–O" }), oh = (a, b) => ({ a, b, k: "oh" });
    const io = (a, b, e) => ({ a, b, k: "ion", v: d.valences[`${e}-O`], p: `${e}–O` });
    const A = {
      TS: at("Si", p, { r: 8 }), Ou: at("O", ou), Od: at("O", od), Or: at("O", or), Ol: at("O", ol),
      Hu: { t: "h", x: ou[0] + 9, y: ou[1] - 9 }, Hr: { t: "h", x: or[0] + 9, y: or[1] - 9 },
      C: at(el, pc), Wc: { t: "eau", x: pc[0] + 30, y: pc[1], a: 0 },
      Ha: { t: "hp", x: 430, y: 120 }, Hb: { t: "hp", x: 480, y: 70 }, W1: { t: "eau", x: 300, y: 120, a: -60 }, Hw: { t: "h", x: 300, y: 120, o: 0 }, Hx: { t: "h", x: 300, y: 120, o: 0 },
      halo: { t: "halo", x: pc[0], y: pc[1], r: 18 },
    };
    const q1 = oH(1, NS), q2 = oH(1, NS + 1);
    const B = { su: cov("TS", "Ou"), sd: cov("TS", "Od"), sr: cov("TS", "Or"), sl: cov("TS", "Ol"), gl: cov(pg, "Ol"), hu: oh("Ou", "Hu"), hr: oh("Or", "Hr"),
      c1: io("C", "Od", el), c2: io("C", q1, el), c3: io("C", q2, el), cw: { a: "C", b: "Wc", k: "eau", v: vM, p: `${el}–O` }, g1: io(pg2, "Od", elg) };
    // relief : les deux oxygènes du cation suivi hors du plan (devant en contour, derrière dans la copie pâle)
    const cv = O.relief.devant(pc), dc = decor(k, d, O);
    A.CV = Object.assign({ t: "at", el: "O", x: cv[0], y: cv[1], r: 8.5 }, O.relief.avant);
    B.c4 = io("C", "CV", el); B.c5 = io("C", O.relief.arriere(dc.l, "O", pc), el);
    const e = [], suite = O.suite, mono = T.charge === "⁺", Q = T.charge || "²⁺";
    e.push({ A, B, L: {}, h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? "Le bord d'une marche du cristal" : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? (T.debut || `Les tétraèdres SiO₄ forment des chaînes : chacun partage un oxygène avec ses deux voisins (ponts Si–O–Si). Les chaînes sont tenues entre elles par ${tous}. Au bord, on suit ${O.art(el, "un")} (cerclé).`)
        : "L'acide libère des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Les H⁺ sont attirés par les oxygènes du bord.",
    });
    const sortie = { x: 520, y: 92 };
    e.push(suite(e[0], {
      titre: `${majuscule(leA)} part le premier`,
      texte: `${mono ? "Un H⁺ se pose sur l'oxygène qui le tenait, à sa place" : "Deux H⁺ se posent sur les oxygènes qui le tenaient"} : ${leA} du bord part, entouré d'eau. Les cations partent avant le silicium : leurs liaisons sont les plus fragiles.${k === "eau" && T.eauH ? " " + T.eauH : ""}`,
      A: Object.assign({ C: sortie, Wc: { x: sortie.x + 30, y: sortie.y, a: 0 }, Ha: { t: "h", x: od[0] + 10, y: od[1] + 9 }, halo: { x: p[0], y: p[1], r: 26 } }, mono ? {} : { Hb: { t: "h", x: q1[0] - 10, y: q1[1] - 9 } }),
      B: Object.assign({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, ha: oh("Od", "Ha") }, mono ? {} : { hb: oh([q1[0], q1[1]], "Hb") }),
      L: Object.assign({ lC: { x: sortie.x, y: sortie.y + 30, t: `${el}${Q}`, m: 1 } }, k === "eau" ? { lB: { x: 480, y: 46, t: "HCO₃⁻", m: 1 } } : {}),
    }));
    const w1 = { x: p[0] - 20, y: p[1] - 12 };
    e.push(suite(e[1], {
      titre: T.anneau ? "L'eau casse le dernier pont de l'anneau" : "L'eau casse le pont du bout de la chaîne",
      texte: `${T.anneau ? "L'anneau est déjà ouvert de l'autre côté : ce tétraèdre ne tient plus que par un pont. " : ""}Une molécule d'eau se glisse contre le pont qui retient le dernier tétraèdre : son H passe sur l'oxygène du pont, son OH sur le silicium, et la liaison Si–O cède ; ${leB} voisin lâche aussi. C'est l'étape lente : ${o.lettres || "durée non mesurée"} en moyenne par unité de la surface.`,
      A: { W1: { t: "at", el: "Ow", x: w1.x, y: w1.y }, Hw: { x: w1.x - 9, y: w1.y - 9, o: 1 }, Hx: { x: ol[0] - 2, y: ol[1] - 13, o: 1 } },
      B: { sl: 0, g1: 0, s1: cov("TS", "W1"), h1: oh("W1", "Hw"), hx: oh("Ol", "Hx") },
      h: Object.assign({ cours: true }, H),
    }));
    const dest = [250, 96], dx = dest[0] - p[0], dy = dest[1] - p[1], dep = (q) => ({ x: q[0] + dx, y: q[1] + dy });
    e.push(suite(e[2], {
      titre: T.anneau ? "Le tétraèdre part : l'anneau se défait" : "Le tétraèdre part : la chaîne raccourcit",
      texte: `Le dernier tétraèdre, entouré de quatre OH, part en silice dissoute, H₄SiO₄ ; ${T.anneau ? "les autres tétraèdres de l'anneau suivent un à un" : "le bout de la chaîne recule d'un cran"}, et tout recommence avec ${leB} voisin.${T["fin_" + k] ? " " + T["fin_" + k] : ""}`,
      A: { TS: dep(p), Ou: dep(ou), Hu: dep([ou[0] + 9, ou[1] - 9]), Or: dep(or), Hr: dep([or[0] + 9, or[1] - 9]), Od: dep(od), Ha: dep([od[0] + 10, od[1] + 9]),
        W1: dep([w1.x, w1.y]), Hw: dep([w1.x - 9, w1.y - 9]), halo: { x: pg2[0], y: pg2[1], r: 18 } },
      h: H,
      L: { lT: { x: dest[0], y: dest[1] + 50, t: "H₄SiO₄", m: 1 } },
    }));
    return e;
  }

  function energie(d, O) {
    const E = d.energie || {}, rep = d.repere, T = d.textes || {}, A = d.cation, B = T.cation2 || d.cation;
    const duo = [
      { titre: "Si–O", sous: `liaison ${O.nature("Si–O")} (électrons en partie partagés)`,
        schema: { type: "partage", a: "Si", b: "O", aria: "Silicium et oxygène partagent des électrons" },
        li: [`Ionique ${O.fraction(O.ionicite("Si", "O"))} seulement (Pauling). ${T.anneau ? "Dans l'anneau" : "Le long de la chaîne"}, chaque oxygène de pont est tenu par deux silicium : il faut casser ce pont pour libérer un tétraèdre.`] },
      { titre: `${A}–O`, sous: `liaison ${O.nature(`${A}–O`)} (électrons cédés)`,
        schema: { type: "don", a: A, la: `${A}${T.charge || "²⁺"}`, ra: 18, fa: 12, b: "O", aria: `${majuscule(O.art(A, "le"))} cède ses électrons aux chaînes` },
        li: [`Ionique ${O.fraction(O.ionicite(A, "O"))} (Pauling). ${T.duoCation ? T.duoCation : `${A === "Ca" ? "Sa charge se répartit sur six à huit oxygènes : chaque liaison Ca–O vaut un quart à un tiers de liaison simple." : `Sa charge se répartit sur six oxygènes : chaque liaison ${A}–O ne vaut qu'un tiers de liaison simple.`} C'est elle qui lâche d'abord${B !== A ? `, avec ${B}–O` : ""}.`}`] },
    ];
    const EA = [["eaAcide", "dans l'acide (H⁺)", "dans l'acide"], ["eaNeutre", "vers la neutralité", "vers la neutralité"]].filter(([c]) => E[c] != null);
    let barres = null;
    if (EA.length) {
      const fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ","), fac = (x) => fr1(Math.exp((x * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)));
      barres = { titre: "Énergie d'activation de la dissolution", unite: "kJ/mol", max: 100, graduations: [0, 25, 50, 75, 100], onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: EA.map(([c, nom]) => { const [a, b] = E[c]; return { nom: majuscule(nom), el: A, hachure: true, val: { ea: [a, b] }, txt: { ea: a === b ? `${fr1(a)} kJ/mol` : `${fr1(a)} à ${fr1(b)} kJ/mol` } }; }),
        explic: { ea: `L'énergie qu'il faut fournir pour que la réaction se fasse : plus elle est grande, plus la chaleur accélère la dissolution. De 25 à 35 °C, la vitesse est multipliée par ${EA.map(([c, , dans]) => E[c][0] === E[c][1] ? `${fac(E[c][0])} ${dans}` : `${fac(E[c][0])} à ${fac(E[c][1])} ${dans}`).join(", ")}.${E.eaAcide && E.eaAcide[1] - E.eaAcide[0] > 15 ? " Dans l'acide, les deux bases de données ne s'accordent pas." : ""}` } };
    }
    let temps = null;
    if (rep && rep.eau && d.onglets.eau && d.onglets.eau.t) {
      const f = O.rond2(d.onglets.eau.t / rep.eau.t);
      temps = { titre: T.tempsTitre || "Ce que changent les chaînes", explic: `${T.tempsExplic || ""} ${majuscule(rep.la)} sert de repère. Barres : écart entre les valeurs publiées.`.trim(),
        rangees: [{ titre: "Une unité de la surface quitte le cristal, dans l'eau à 25 °C", fois: f >= 1 ? `environ ${nb(f, O)} fois plus lent pour ${d.la}` : `environ ${nb(O.rond2(1 / f), O)} fois plus rapide pour ${d.la}`,
          pts: [{ el: rep.cation || "Mg", min: rep.eau.tmin, max: rep.eau.tmax, v: rep.eau.t, et: `${rep.nom} · ${rep.eau.court}`, ou: "haut" },
            { el: A, min: d.onglets.eau.tmin, max: d.onglets.eau.tmax, v: d.onglets.eau.t, et: `${d.nom} · ${d.onglets.eau.court}`, ou: "bas" }] }] };
    }
    return { duo, barres, temps };
  }

  // ============ Variante « amphiboles » (11/10/2026) : chaînes DOUBLES ============
  // Deux chaînes jumelles (rangées a et b) soudées par un pont Si–O–Si un tétraèdre sur deux (tétraèdres T1, colonnes impaires ;
  // l'oxygène intérieur des T2 sort du plan du dessin, non dessiné) ; entre les chaînes doubles, la bande des cations avec des
  // groupes OH (colonnes impaires, tenus par les deux cations voisins). Mécanisme : comme les pyroxènes (Heřmanská et al. 2022, 2023),
  // les cations partent d'abord ; le tétraèdre du bout tient par DEUX ponts (le long de sa chaîne et vers la chaîne jumelle).
  const AM = { YA: [178, 286], YB: [214, 322], LO: 16, YM: 250 };
  const pA = (j, s, c) => [X0 + c * S, (s ? AM.YB : AM.YA)[j]];
  const t1 = (c) => c % 2 !== 0;
  const pontA = (j, s, c) => [X0 + (c + 0.5) * S, (s ? AM.YB : AM.YA)[j] + (s ? -7 : 7)];
  const oOut = (j, s, c) => [X0 + c * S, (s ? AM.YB : AM.YA)[j] + (s ? AM.LO : -AM.LO)];
  const xIn = (j, c) => [X0 + c * S, (AM.YA[j] + AM.YB[j]) / 2];
  const catA = (c) => [X0 + (c + 0.5) * S, AM.YM];
  const ohA = (cc) => [X0 + cc * S, AM.YM], hOH = (q) => [q[0] - 9, q[1] - 7];

  function decorA(k, d, O) {
    const v = d.valences["Si-O"], cov = (a, b) => O.lien(a[0], a[1], b[0], b[1], { k: "cov", v, el: "Si", p: "Si–O" }), bord = AM.YM - 22;
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>${O.relief.dessus([[0, 160], [X0 + NS * S + 34, 160], [X0 + NS * S + 34, bord], [640, bord]])}<path d="M0 160 H${X0 + NS * S + 34} V${bord} H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    const estTS = (j, s, c) => j === 0 && s === 0 && c === NS;
    for (let j = 0; j <= 1; j++) for (let s = 0; s <= 1; s++) for (let c = 0; c <= 10; c++) {
      if (!existe(j, c) || estTS(j, s, c)) continue;
      const p = pA(j, s, c), q = oOut(j, s, c);
      if (existe(j, c + 1) && !estTS(j, s, c + 1)) { const o = pontA(j, s, c); l += cov(p, o) + cov(pA(j, s, c + 1), o); a += O.atome(o[0], o[1], "O"); }
      l += cov(p, q); a += O.atome(q[0], q[1], "O");
      if (j === 0 && s === 0) { l += O.lien(q[0], q[1], q[0] + 9, q[1] - 9, { k: "oh" }); a += O.hlie(q[0] + 9, q[1] - 9); }
      if (s === 1 && t1(c) && !(j === 0 && c === NS)) { const m = xIn(j, c); l += cov(pA(j, 0, c), m) + cov(p, m); a += O.atome(m[0], m[1], "O"); }
      a += O.atome(p[0], p[1], "Si", { r: 8 });
    }
    for (let cc = 1; cc <= 10; cc += 2) {   // groupes OH de la bande des cations, tenus par les cations cc − 1 et cc
      const q = ohA(cc), h = hOH(q);
      for (const c of [cc - 1, cc]) if (c !== MC) { const pc = catA(c), e = catEl(c, d); l += O.lien(pc[0], pc[1], q[0], q[1], { k: "ion", v: d.valences[`${e}-O`], p: `${e}–O` }); }
      l += O.lien(q[0], q[1], h[0], h[1], { k: "oh" }); a += O.atome(q[0], q[1], "O") + O.hlie(h[0], h[1]);
    }
    for (let c = -1; c <= 10; c++) {
      const p = catA(c);
      if (p[0] < 0 || c === MC) continue;
      const el = catEl(c, d), vM = d.valences[`${el}-O`], pn = `${el}–O`;
      for (const [j, s, cc] of [[0, 1, c], [0, 1, c + 1], [1, 0, c], [1, 0, c + 1]]) if (existe(j, cc)) { const q = oOut(j, s, cc); l += O.lien(p[0], p[1], q[0], q[1], { k: "ion", v: vM, p: pn }); }
      if (c > NS) { l += O.lien(p[0], p[1], p[0] + 4, p[1] - 30, { k: "eau", v: vM, p: pn }); a += O.eau(p[0] + 4, p[1] - 30, -90); }
      a += O.atome(p[0], p[1], el);
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    for (const [x, y, an] of [[90, 110, 20], [206, 44, 150], [604, 120, 60], [540, 40, 200], [470, 150, 300]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") {
      for (const [x, y] of [[60, 70], [172, 92], [398, 30], [612, 62]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 24], [450, 110], [330, 70]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }

  function etapesA(k, d, O) {
    const T = d.textes || {}, v = d.valences["Si-O"], o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const p = pA(0, 0, NS), pg = pA(0, 0, NS - 1), pb = pA(0, 1, NS), ol = pontA(0, 0, NS - 1), ou = oOut(0, 0, NS), ox = xIn(0, NS), or = [p[0] + 24, p[1] - 4];
    const pc = catA(MC), el = catEl(MC, d), vM = d.valences[`${el}-O`], pg2 = catA(NS - 1), elg = catEl(NS - 1, d);
    const od = oOut(0, 1, NS), q1 = oOut(1, 0, NS), q2 = oOut(1, 0, NS + 1), qh = ohA(NS);
    const leA = O.art(el, "le"), leB = O.art(elg, "le"), tous = el === elg ? leA : `${leA} et ${leB}`;
    const mono = T.charge === "⁺", Q = T.charge || "²⁺";
    const at = (e, q, x) => Object.assign({ t: "at", el: e, x: q[0], y: q[1] }, x || {});
    const cov = (a, b) => ({ a, b, k: "cov", v, el: "Si", p: "Si–O" }), oh = (a, b) => ({ a, b, k: "oh" });
    const io = (a, b, e) => ({ a, b, k: "ion", v: d.valences[`${e}-O`], p: `${e}–O` });
    const wc = [pc[0] + 26, pc[1] - 30];
    const A = {
      TS: at("Si", p, { r: 8 }), Ou: at("O", ou), Ox: at("O", ox), Or: at("O", or), Ol: at("O", ol),
      Hu: { t: "h", x: ou[0] + 9, y: ou[1] - 9 }, Hr: { t: "h", x: or[0] + 9, y: or[1] - 9 },
      C: at(el, pc), Wc: { t: "eau", x: wc[0], y: wc[1], a: -60 },
      Ha: { t: "hp", x: 430, y: 120 }, Hb: { t: "hp", x: 480, y: 70 },
      W1: { t: "eau", x: 300, y: 120, a: -60 }, Hw: { t: "h", x: 300, y: 120, o: 0 }, Hx: { t: "h", x: 300, y: 120, o: 0 },
      W2: { t: "eau", x: 420, y: 140, a: 200 }, Hw2: { t: "h", x: 420, y: 140, o: 0 }, Hx2: { t: "h", x: 420, y: 140, o: 0 },
      halo: { t: "halo", x: pc[0], y: pc[1], r: 18 },
    };
    const B = { su: cov("TS", "Ou"), sx: cov("TS", "Ox"), bx: cov(pb, "Ox"), sr: cov("TS", "Or"), sl: cov("TS", "Ol"), gl: cov(pg, "Ol"), hu: oh("Ou", "Hu"), hr: oh("Or", "Hr"),
      c1: io("C", od, el), c2: io("C", q1, el), c3: io("C", q2, el), co: io("C", qh, el), cw: { a: "C", b: "Wc", k: "eau", v: vM, p: `${el}–O` } };
    const cv = O.relief.devant(pc), dc = decorA(k, d, O);
    A.CV = Object.assign({ t: "at", el: "O", x: cv[0], y: cv[1], r: 8.5 }, O.relief.avant);
    B.c4 = io("C", "CV", el); B.c5 = io("C", O.relief.arriere(dc.l, "O", pc), el);
    const e = [], suite = O.suite;
    e.push({ A, B, L: {}, h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? "Le bord d'une marche du cristal" : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? `Les tétraèdres SiO₄ forment des chaînes doubles : deux chaînes jumelles, soudées par un pont Si–O–Si un tétraèdre sur deux. Entre les chaînes doubles, ${tous}, avec des groupes OH. Au bord, on suit ${O.art(el, "un")} (cerclé).`
        : "L'acide libère des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Les H⁺ sont attirés par les oxygènes du bord.",
    });
    const sortie = { x: 520, y: 92 };
    e.push(suite(e[0], {
      titre: `${majuscule(leA)} part le premier`,
      texte: `${mono ? "Un H⁺ se pose sur l'oxygène qui le tenait, à sa place" : "Deux H⁺ se posent sur les oxygènes qui le tenaient"} : ${leA} du bord part, entouré d'eau ; le groupe OH qu'il tenait reste accroché à ${leB} voisin. Les cations partent avant le silicium : leurs liaisons sont les plus fragiles.${k === "eau" && T.eauH ? " " + T.eauH : ""}`,
      A: Object.assign({ C: sortie, Wc: { x: sortie.x + 26, y: sortie.y - 30, a: -60 }, Ha: { t: "h", x: od[0] + 10, y: od[1] + 6 }, halo: { x: p[0], y: p[1], r: 26 } },
        mono ? {} : { Hb: { t: "h", x: q1[0] + 10, y: q1[1] - 6 } }),
      B: Object.assign({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, co: 0, ha: oh([od[0], od[1]], "Ha") }, mono ? {} : { hb: oh([q1[0], q1[1]], "Hb") }),
      L: Object.assign({ lC: { x: sortie.x, y: sortie.y + 30, t: `${el}${Q}`, m: 1 } }, k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {}),
    }));
    const w1 = { x: p[0] - 20, y: p[1] - 12 }, w2 = { x: p[0] + 24, y: ox[1] + 8 };
    e.push(suite(e[1], {
      titre: "L'eau casse les deux ponts du bout",
      texte: `Dans une chaîne double, le dernier tétraèdre tient par deux ponts : l'un le long de sa chaîne, l'autre vers la chaîne jumelle. Deux molécules d'eau s'y glissent : leurs H passent sur les oxygènes des ponts, leurs OH sur le silicium, et les deux liaisons Si–O cèdent. C'est l'étape lente : ${o.lettres || "durée non mesurée"} en moyenne par unité de la surface.`,
      A: { W1: { t: "at", el: "Ow", x: w1.x, y: w1.y }, Hw: { x: w1.x - 9, y: w1.y - 9, o: 1 }, Hx: { x: ol[0] - 2, y: ol[1] - 13, o: 1 },
        W2: { t: "at", el: "Ow", x: w2.x, y: w2.y }, Hw2: { x: w2.x + 9, y: w2.y + 7, o: 1 }, Hx2: { x: ox[0] - 11, y: ox[1] + 3, o: 1 } },
      B: { sl: 0, sx: 0, s1: cov("TS", "W1"), h1: oh("W1", "Hw"), hx: oh("Ol", "Hx"), s2: cov("TS", "W2"), h2: oh("W2", "Hw2"), hx2: oh("Ox", "Hx2") },
      h: Object.assign({ cours: true }, H),
    }));
    const dest = [250, 84], dx = dest[0] - p[0], dy = dest[1] - p[1], dep = (q) => ({ x: q[0] + dx, y: q[1] + dy });
    e.push(suite(e[2], {
      titre: "Le tétraèdre part : la chaîne double raccourcit",
      texte: `Le dernier tétraèdre, entouré de quatre OH, part en silice dissoute, H₄SiO₄ ; le bout de la chaîne double recule d'un cran, et tout recommence avec ${leB} voisin.${T["fin_" + k] ? " " + T["fin_" + k] : ""}`,
      A: { TS: dep(p), Ou: dep(ou), Hu: dep([ou[0] + 9, ou[1] - 9]), Or: dep(or), Hr: dep([or[0] + 9, or[1] - 9]),
        W1: dep([w1.x, w1.y]), Hw: dep([w1.x - 9, w1.y - 9]), W2: dep([w2.x, w2.y]), Hw2: dep([w2.x + 9, w2.y + 7]), halo: { x: pg2[0], y: pg2[1], r: 18 } },
      h: H,
      L: { lT: { x: dest[0] - 34, y: dest[1] + 46, t: "H₄SiO₄", m: 1 } },
    }));
    return e;
  }

  for (const [nom, D, E] of [["chaines", decor, etapes], ["chaines-amphibole", decorA, etapesA]]) Liaisons.scene(nom, {
    onglets: () => [{ k: "eau", nom: "Dans l'eau du sol" }, { k: "acide", nom: "Dans l'acide" }],
    decor: D, etapes: E, energie,
    legende: () => ({ "e:O": "oxygène du cristal", "i:Cl−": "Cl⁻, ne réagit pas",
      "t:avant": "atome juste devant le plan du dessin (en contour)", "t:arriere": "couche juste derrière le plan du dessin (plus petite, pâle)" }),
    aria: (d) => `Coupe du bord d'un cristal de ${d.nom}, étape par étape`,
  });
})();
