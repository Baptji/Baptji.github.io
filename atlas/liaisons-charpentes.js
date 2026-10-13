// ============ Liaisons du cristal — scène de la famille « charpentes » (silicates en réseau) ============
// 10/10/2026 (prototype : quartz). Coupe schématique d'un réseau de tétraèdres : chaque silicium tient quatre oxygènes, chaque oxygène
// relie deux silicium (pont Si–O–Si, coudé). En surface, les oxygènes sans second silicium portent un H (Si–OH). Au bord d'une marche,
// le silicium suivi n'est plus tenu que par deux ponts ; l'eau les casse un à un (Si–O–Si + H₂O → 2 Si–OH) et il part en H₄SiO₄.
// Étape lente = rupture des ponts Si–O–Si (Heřmanská et al. 2023, d'après Criscenti et al. 2006).
// Amorphes (11/10/2026, opale et verre : textes.amorphe) : le même réseau, mais posé sans ordre (silicium décalés au hasard, ponts tordus)
// et troué : des ponts manquent (COUPES) ; à leur place deux Si–OH (opale) ou deux O⁻ qui retiennent un Na⁺ / K⁺ (verre, textes.modif,
// réseau « modifié » de Zachariasen). Verre : une étape de plus, les H⁺ remplacent le sodium du bord (couche appauvrie, Heřmanská 2022).
(function () {
  "use strict";
  const S = 64, X0 = 48, Y0 = 200, NS = 5, CO = 7, LH = 26;   // pas, dernier silicium de la rangée du haut, coude du pont, Si–OH
  let AM = false;                                                  // posé par decor / etapes : réseau amorphe
  const jit = (j, c) => { if (!AM) return [0, 0]; const h = (((c + 5) * 73856093) ^ ((j + 3) * 19349663)) >>> 0;
    return [(h % 25) - 12, j === 0 ? (h >> 5) % 7 - 1 : ((h >> 5) % 21) - 10]; };   // la rangée du haut ne monte pas au-dessus de la surface
  const P = (j, c) => { const [dx, dy] = jit(j, c); return [X0 + c * S + dx, Y0 + j * S + dy]; };
  const existe = (j, c) => c >= 0 && c <= 9 && j >= 0 && j <= 2 && !(j === 0 && c > NS);
  const mil = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ponH = (j, c) => { const m = mil(P(j, c), P(j, c + 1)); return [m[0], m[1] + CO]; };   // pont entre (j, c) et (j, c + 1)
  const ponV = (j, c) => { const m = mil(P(j, c), P(j + 1, c)); return [m[0] + CO, m[1]]; };   // pont entre (j, c) et (j + 1, c)
  // ponts absents du réseau amorphe (jamais autour du silicium suivi ni de ses deux voisins) : [sens, j, c]
  const COUPES = [["v", 0, 1], ["h", 1, 2], ["v", 1, 7], ["h", 2, 4], ["h", 2, 7], ["v", 1, 4]];
  const coupe = (sens, j, c) => AM && COUPES.some(([a, b, e]) => a === sens && b === j && e === c);
  const estAm = (d) => !!(d.textes && d.textes.amorphe);
  const TS = [0, NS], VG = [0, NS - 1], VB = [1, NS];
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const nb = (x, O) => (x < 10 ? String(Math.round(x * 10) / 10).replace(".", ",") : O.sp(Math.round(x)));

  function decor(k, d, O) {
    if (estF(d)) return decorF(k, d, O);
    AM = estAm(d);
    const v = d.valences["Si-O"], cov = (a, b) => O.lien(a[0], a[1], b[0], b[1], { k: "cov", v, el: "Si", p: "Si–O" });
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>${O.relief.dessus([[0, 164], [X0 + NS * S + 30, 164], [X0 + NS * S + 30, 228], [640, 228]])}<path d="M0 164 H${X0 + NS * S + 30} V228 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    const estTS = (j, c) => j === TS[0] && c === TS[1];
    for (let j = 0; j <= 2; j++) for (let c = 0; c <= 9; c++) {
      if (!existe(j, c)) continue;
      const p = P(j, c);
      if (existe(j, c + 1) && coupe("h", j, c)) ({ l, a } = trou(l, a, p, P(j, c + 1), "h", d, O, cov, c));
      else if (existe(j, c + 1)) { const o = ponH(j, c); if (!estTS(j, c) && !estTS(j, c + 1)) { l += cov(p, o) + cov(P(j, c + 1), o); a += O.atome(o[0], o[1], "O"); } }
      if (existe(j + 1, c) && coupe("v", j, c)) ({ l, a } = trou(l, a, p, P(j + 1, c), "v", d, O, cov, c));
      else if (existe(j + 1, c)) { const o = ponV(j, c); if (!estTS(j, c)) { l += cov(p, o) + cov(P(j + 1, c), o); a += O.atome(o[0], o[1], "O"); } }
      const haut = j === 0 || (j === 1 && c > NS);   // silicium de surface : un Si–OH vers le haut
      if (haut && !estTS(j, c)) { const o = [p[0] - 4, p[1] - LH]; l += cov(p, o) + O.lien(o[0], o[1], o[0] + 9, o[1] - 9, { k: "oh" }); a += O.atome(o[0], o[1], "O") + O.hlie(o[0] + 9, o[1] - 9); }
      if (!estTS(j, c)) a += O.atome(p[0], p[1], "Si", { r: 9 });
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    for (const [x, y, an] of [[90, 110, 20], [206, 44, 150], [604, 130, 60], [540, 40, 200], [150, 150, 300], [470, 90, 250]]) a += O.eau(x, y, an, { decor: true });
    if (k === "basique") for (const [x, y] of [[70, 60], [330, 40], [420, 150], [600, 70], [180, 96]]) a += O.ion(x, y, "O", "−", { decor: true, r: 9 }) + O.hlie(x + 10, y - 7, { o: 0.6 });
    if (k === "acide") {
      for (const [x, y] of [[60, 70], [172, 92], [398, 30], [612, 62], [104, 36]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 22], [520, 150], [330, 62]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }
  // pont absent : deux oxygènes chacun lié à un seul silicium ; opale → deux Si–OH ; verre → deux O⁻ et un Na⁺ ou K⁺ entre eux, côté anneau
  function trou(l, a, A, B, sens, d, O, cov, c) {
    const modif = !!d.textes.modif, f = modif ? 0.24 : 0.3, h = sens === "h";
    const oa = [A[0] + f * (B[0] - A[0]) + (h ? 0 : CO), A[1] + f * (B[1] - A[1]) + (h ? CO : 0)];
    const ob = [B[0] + f * (A[0] - B[0]) + (h ? 0 : CO), B[1] + f * (A[1] - B[1]) + (h ? CO : 0)];
    l += cov(A, oa) + cov(B, ob);
    a += O.atome(oa[0], oa[1], "O") + O.atome(ob[0], ob[1], "O");
    if (modif) {
      const el = c % 2 ? "K" : "Na", m = mil(oa, ob), q = h ? [m[0], m[1] + 13] : [m[0] + 13, m[1]];
      for (const o of [oa, ob]) l += O.lien(q[0], q[1], o[0], o[1], { k: "ion", v: 1 / 6, p: `${el}–O` });
      a += O.atome(q[0], q[1], el);
    } else {
      const ha = h ? [oa[0] + 3, oa[1] - 9] : [oa[0] - 9, oa[1] - 3], hb = h ? [ob[0] - 3, ob[1] + 9] : [ob[0] + 9, ob[1] + 3];
      l += O.lien(oa[0], oa[1], ha[0], ha[1], { k: "oh" }) + O.lien(ob[0], ob[1], hb[0], hb[1], { k: "oh" });
      a += O.hlie(ha[0], ha[1]) + O.hlie(hb[0], hb[1]);
    }
    return { l, a };
  }

  function etapes(k, d, O) {
    if (estF(d)) { AM = false; return etapesF(k, d, O); }
    AM = estAm(d);
    const T = d.textes || {}, modif = !!T.modif;
    const v = d.valences["Si-O"], o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const p = P(...TS), pg = P(...VG), pb = P(...VB), ol = ponH(0, NS - 1), ob = ponV(0, NS);
    const at = (el, q, x) => Object.assign({ t: "at", el, x: q[0], y: q[1] }, x || {});
    const cov = (a, b) => ({ a, b, k: "cov", v, el: "Si", p: "Si–O" }), oh = (a, b) => ({ a, b, k: "oh" });
    const A = {
      Ou: at("O", [p[0] - 4, p[1] - LH]), Or: at("O", [p[0] + LH, p[1] - 4]), Ol: at("O", ol), Ob: at("O", ob),
      Hu: { t: "h", x: p[0] + 5, y: p[1] - LH - 9 }, Hr: { t: "h", x: p[0] + LH + 9, y: p[1] - 13 },
      W1: { t: "eau", x: 300, y: 120, a: -60 }, W2: { t: "eau", x: 430, y: 150, a: 200 },
      Ha: { t: "h", x: 300, y: 120, o: 0 }, Hb: { t: "h", x: 300, y: 120, o: 0 }, Hc: { t: "h", x: 430, y: 150, o: 0 }, Hd: { t: "h", x: 430, y: 150, o: 0 },
      TS: at("Si", p, { r: 9 }), halo: { t: "halo", x: p[0], y: p[1], r: 17 },
    };
    const B = { su: cov("TS", "Ou"), sr: cov("TS", "Or"), sl: cov("TS", "Ol"), sb: cov("TS", "Ob"), gl: cov(pg, "Ol"), bb: cov(pb, "Ob"), hu: oh("Ou", "Hu"), hr: oh("Or", "Hr") };
    if (modif) {   // verre : l'oxygène de droite du silicium suivi est un O⁻ qui retient un Na⁺ (son H n'arrive qu'à l'échange)
      A.Hr.o = 0; A.N = at("Na", [A.Or.x + 15, A.Or.y + 15]);
      B.hr = Object.assign(oh("Or", "Hr"), { o: 0 }); B.nO = { a: "N", b: "Or", k: "ion", v: 1 / 6, p: "Na–O" };
    }
    const e = [], suite = O.suite;
    e.push({ A, B, L: {}, h: { v: hv === null ? null : 0 },
      titre: T.titre0 || "Le bord d'une marche du cristal",
      texte: k === "eau"
        ? (T.debut || "Chaque silicium tient quatre oxygènes, et chaque oxygène relie deux silicium : un réseau continu de liaisons Si–O. En surface, les oxygènes sans second silicium portent un H (Si–OH). Au bord, le silicium suivi (cerclé) n'est plus tenu que par deux ponts Si–O–Si.")
        : k === "acide" ? "Le même bord, dans une eau acide : des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas."
        : "Le même bord, dans une eau basique, chargée d'ions hydroxyde OH⁻ (en rouge, avec leur H). Le silicium suivi (cerclé) n'est tenu que par deux ponts Si–O–Si.",
    });
    if (modif) e.push(suite(e[0], {   // échange Na⁺ ⇄ H⁺ : rapide, pas chronométré
      titre: "Les H⁺ prennent la place du sodium",
      texte: T.echange || "Les H⁺ de l'eau prennent la place des ions sodium, qui partent.",
      A: { N: { x: 528, y: 100 }, Hr: { o: 1 } }, B: { nO: 0, hr: oh("Or", "Hr") },
      L: { lN: { x: 528, y: 132, t: "Na⁺", m: 1 } },
    }));
    // 1er pont : W1 se coupe en H (sur l'oxygène du pont, qui reste au voisin) et OH (sur le silicium suivi)
    const w1 = { x: p[0] - 20, y: p[1] - 14 };
    e.push(suite(e[e.length - 1], {
      titre: "L'eau casse un premier pont",
      texte: `Une molécule d'eau se glisse contre le pont : son H passe sur l'oxygène du pont, son OH sur le silicium. La liaison Si–O cède : le pont devient deux Si–OH. C'est l'étape lente : pour un silicium de la surface, ses ponts cèdent en ${o.lettres || "un temps non mesuré"} en moyenne${k === "basique" ? ", bien plus vite qu'en eau pure" : k === "acide" ? ", bien plus vite qu'à pH 7" : ""}.`,
      A: { W1: { t: "at", el: "Ow", x: w1.x, y: w1.y }, Hb: { x: w1.x - 9, y: w1.y - 9, o: 1 }, Ha: { x: ol[0] - 2, y: ol[1] - 13, o: 1 } },
      B: { sl: 0, s1: cov("TS", "W1"), h1: oh("W1", "Hb"), h2: oh("Ol", "Ha") },
      h: Object.assign({ cours: true }, H),
    }));
    const w2 = { x: p[0] + 24, y: p[1] + 16 };
    const sort = [250, 92], dx = sort[0] - p[0], dy = sort[1] - p[1], dep = (q) => ({ x: q.x + dx, y: q.y + dy });
    const g = (id) => ({ x: (id.x ?? id[0]), y: (id.y ?? id[1]) });
    e.push(suite(e[e.length - 1], {
      titre: "Le second pont cède : silice dissoute",
      texte: "Une deuxième molécule d'eau fait de même avec le dernier pont. Le silicium, entouré de quatre OH, part dans l'eau : c'est de la silice dissoute, H₄SiO₄.",
      A: {
        TS: dep(g(p)), Ou: dep(g(A.Ou)), Hu: dep(g(A.Hu)), Or: dep(g(A.Or)), Hr: dep(g(A.Hr)), W1: dep(w1), Hb: dep({ x: w1.x - 9, y: w1.y - 9 }),
        W2: Object.assign({ t: "at", el: "Ow" }, dep(w2)), Hd: Object.assign(dep({ x: w2.x + 9, y: w2.y + 9 }), { o: 1 }),
        Hc: { x: ob[0] + 13, y: ob[1] - 2, o: 1 }, halo: { x: sort[0], y: sort[1], o: 0 },
      },
      B: { sb: 0, s2: cov("TS", "W2"), h3: oh("W2", "Hd"), h4: oh("Ob", "Hc") }, h: H,
      L: { lT: { x: sort[0], y: sort[1] + 58, t: "H₄SiO₄", m: 1 } },
    }));
    e.push(suite(e[e.length - 1], {
      titre: "Le voisin devient le bord",
      texte: T.recule || `Là où étaient les ponts, les silicium voisins portent maintenant des Si–OH : ils sont au bord à leur tour, et tout recommence. Rien d'autre ne se forme : ${d.la} ne donne que de la silice dissoute.`,
      A: { halo: { x: pg[0], y: pg[1], o: 1 } },
    }));
    return e;
  }


  // ---------- Feldspaths (10/10/2026) : un tétraèdre sur quatre porte un Al, un cation (K⁺, Na⁺) dans les creux ----------
  // Mécanisme (Heřmanská et al. 2023, d'après Oelkers et al. 2009) : le cation s'échange contre des H⁺, puis l'aluminium contre des H⁺
  // (ses liaisons Al–O lâchent), ce qui libère en partie les tétraèdres de silicium ; reste à casser les ponts Si–O–Si (étape lente).
  const estF = (d) => !!(d.textes && d.textes.alu);
  const ALS = [[0, 1], [0, 4], [1, 2], [1, 6], [2, 0], [2, 4], [2, 8]];   // un T sur quatre, jamais deux Al voisins (règle de Loewenstein)
  // anorthite (textes.alu = "2") : un T sur deux, Al et Si en alternance stricte (chaque silicium n'a que des Al pour voisins)
  const an = (d) => d.textes.alu === "2";
  let ALT = false;                                                        // posé par decorF / etapesF selon le minéral
  const estAl = (j, c) => ALT ? (j + c) % 2 === 0 : ALS.some(([a, b]) => a === j && b === c);
  const deux = (d) => /²/.test(d.textes.ion || "");                       // cation à deux charges (Ca²⁺) : deux H⁺ pour l'échanger
  const CAV2 = [[0, 2], [1, 3], [1, 7]];                                  // creux où les plagioclases calciques montrent un Na⁺
  const CAV = [[0, 0], [0, 2], [1, 1], [1, 3], [1, 5], [1, 7]];          // creux (coin haut-gauche) occupés par le cation, en plus du suivi
  const KS = [0, NS - 1];                                                 // creux du cation suivi : entre l'Al et le silicium suivi
  const centreCreux = (j, c) => [X0 + (c + 0.5) * S + 6, Y0 + (j + 0.5) * S + 6];
  const ponCreux = (j, c) => [ponH(j, c), ponV(j, c + 1), ponH(j + 1, c), ponV(j, c)];   // haut, droite, bas, gauche
  const vals = (d) => ({ si: d.valences["Si-O"], al: d.valences["Al-O"] ?? 0.75, c: d.valences[`${d.cation}-O`] ?? 0.1 });

  function decorF(k, d, O) {
    ALT = an(d); AM = false;
    const V = vals(d), cat = d.cation, cat2 = d.textes.cation2;
    const lienT = (j, c, q) => estAl(j, c) ? O.lien(P(j, c)[0], P(j, c)[1], q[0], q[1], { k: "cov", v: V.al, el: "Al", p: "Al–O" })
      : O.lien(P(j, c)[0], P(j, c)[1], q[0], q[1], { k: "cov", v: V.si, el: "Si", p: "Si–O" });
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : "lp-f-eau"}"/>${O.relief.dessus([[0, 164], [X0 + NS * S + 30, 164], [X0 + NS * S + 30, 228], [640, 228]])}<path d="M0 164 H${X0 + NS * S + 30} V228 H640 V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    const mobile = (j, c) => (j === TS[0] && c === TS[1]) || (j === VG[0] && c === VG[1]);   // dessinés comme acteurs
    for (let j = 0; j <= 2; j++) for (let c = 0; c <= 9; c++) {
      if (!existe(j, c)) continue;
      const p = P(j, c);
      if (existe(j, c + 1)) { const o = ponH(j, c); if (!(j === 0 && c === NS - 1) && !(j === 0 && c === NS)) {
        if (!mobile(j, c)) l += lienT(j, c, o); if (!mobile(j, c + 1)) l += lienT(j, c + 1, o); a += O.atome(o[0], o[1], "O"); } }
      if (existe(j + 1, c)) { const o = ponV(j, c); if (!(j === TS[0] && c === TS[1])) {
        if (!mobile(j, c)) l += lienT(j, c, o); l += lienT(j + 1, c, o); a += O.atome(o[0], o[1], "O"); } }
      const haut = j === 0 || (j === 1 && c > NS);
      if (haut && !mobile(j, c)) { const o = [p[0] - 4, p[1] - LH]; l += lienT(j, c, o) + O.lien(o[0], o[1], o[0] + 9, o[1] - 9, { k: "oh" }); a += O.atome(o[0], o[1], "O") + O.hlie(o[0] + 9, o[1] - 9); }
      if (!mobile(j, c)) a += O.atome(p[0], p[1], estAl(j, c) ? "Al" : "Si", { r: 9 });
    }
    for (const [j, c] of CAV) {
      const q = centreCreux(j, c), el = cat2 && CAV2.some(([a, b]) => a === j && b === c) ? cat2 : cat;
      const v = el === cat ? V.c : (d.valences[`${el}-O`] ?? V.c);
      for (const o of ponCreux(j, c)) l += O.lien(q[0], q[1], o[0], o[1], { k: "ion", v, p: `${el}–O` });
      a += O.atome(q[0], q[1], el);
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    for (const [x, y, an] of [[90, 110, 20], [206, 44, 150], [604, 130, 60], [540, 40, 200], [150, 150, 300]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") {
      for (const [x, y] of [[60, 70], [172, 92], [398, 30], [612, 62], [104, 36]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[250, 22], [450, 150], [330, 62]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }

  function etapesF(k, d, O) {
    ALT = an(d);
    const V = vals(d), T = d.textes, cat = d.cation, o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const p = P(...TS), pg = P(...VG), pb = P(...VB), ol = ponH(0, NS - 1), ob = ponV(0, NS), oL = ponH(0, NS - 2), oD = ponV(0, NS - 1);
    const kc = centreCreux(...KS), kb = ponCreux(...KS)[2];
    const at = (el, q, x) => Object.assign({ t: "at", el, x: q[0], y: q[1] }, x || {});
    const si = (a, b) => ({ a, b, k: "cov", v: V.si, el: "Si", p: "Si–O" }), al = (a, b) => ({ a, b, k: "cov", v: V.al, el: "Al", p: "Al–O" });
    const io = (a, b) => ({ a, b, k: "ion", v: V.c, p: `${cat}–O` }), oh = (a, b) => ({ a, b, k: "oh" });
    const ion = T.ion || `${cat}⁺`, nomC = T.nomCation || cat, alPart = k === "acide" ? "Al³⁺" : "Al(OH)₃";
    const A = {
      Ou: at("O", [p[0] - 4, p[1] - LH]), Or: at("O", [p[0] + LH, p[1] - 4]), Ol: at("O", ol), Ob: at("O", ob),
      Hu: { t: "h", x: p[0] + 5, y: p[1] - LH - 9 }, Hr: { t: "h", x: p[0] + LH + 9, y: p[1] - 13 },
      Oa: at("O", [pg[0] - 4, pg[1] - LH]), Hal: { t: "h", x: pg[0] + 5, y: pg[1] - LH - 9 },
      W2: { t: "eau", x: 430, y: 150, a: 200 },
      Ha: { t: "h", x: 420, y: 110, o: 0 }, Hk: { t: "h", x: 440, y: 120, o: 0 }, Hx: { t: "h", x: 200, y: 120, o: 0 }, Hy: { t: "h", x: 260, y: 140, o: 0 },
      Hc: { t: "h", x: 430, y: 150, o: 0 }, Hd: { t: "h", x: 430, y: 150, o: 0 },
      AL: at("Al", pg, { r: 9 }), TS: at("Si", p, { r: 9 }), K: at(cat, kc),
      halo: { t: "halo", x: p[0], y: p[1], r: 17 },
    };
    const B = { su: si("TS", "Ou"), sr: si("TS", "Or"), sl: si("TS", "Ol"), sb: si("TS", "Ob"), bb: ALT ? al(pb, "Ob") : si(pb, "Ob"), hu: oh("Ou", "Hu"), hr: oh("Or", "Hr"),
      a1: al("AL", "Ol"), a2: al("AL", oL), a3: al("AL", oD), a4: al("AL", "Oa"), ha: oh("Oa", "Hal"),
      k1: io("K", "Ol"), k2: io("K", "Ob"), k3: io("K", kb), k4: io("K", oD) };
    const e = [], suite = O.suite;
    e.push({ A, B, L: {}, h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? "Le bord d'une marche du cristal" : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? (T.debut || `Un réseau de tétraèdres comme celui du quartz, mais un sur quatre porte un aluminium au lieu d'un silicium. L'aluminium n'a que trois charges positives : il manque une charge, apportée par un ion ${ion} logé dans les creux du réseau. Le silicium suivi (cerclé) tient par deux ponts, l'un vers un aluminium, l'autre vers un silicium.`)
        : "L'acide libère dans l'eau des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Le même bord, le même silicium cerclé.",
    });
    const hO = (q, dx, dy) => ({ x: q[0] + dx, y: q[1] + dy, o: 1 });
    e.push(suite(e[0], {
      titre: deux(d) ? `Le ${nomC} s'échange contre deux H⁺` : `Le ${nomC} s'échange contre un H⁺`,
      texte: `${deux(d) ? `Deux ions H⁺ prennent la place de l'ion ${ion} du bord : ils se fixent sur deux oxygènes` : `Un ion H⁺ prend la place de l'ion ${ion} du bord : il se fixe sur un oxygène`}, et le ${nomC} part dans l'eau. C'est rapide.${k === "eau" ? " Dans le sol, ces H⁺ viennent de l'acide carbonique (le CO₂ dissous), qui laisse un ion bicarbonate HCO₃⁻." : ""}`,
      A: Object.assign({ K: { x: 520, y: 110 }, Ha: hO(ol, 9, -10) }, deux(d) ? { Hk: hO(kb, 9, -10) } : {}),
      B: Object.assign({ k1: 0, k2: 0, k3: 0, k4: 0, hh: oh("Ol", "Ha") }, deux(d) ? { hk: oh(kb, "Hk") } : {}),
      L: Object.assign({ lK: { x: 520, y: 140, t: ion, m: 1 } }, k === "eau" ? { lB: { x: 470, y: 46, t: "HCO₃⁻", m: 1 } } : {}),
    }));
    const dA = [190, 70], ddx = dA[0] - pg[0], ddy = dA[1] - pg[1];
    e.push(suite(e[1], {
      titre: "L'aluminium part",
      texte: `D'autres H⁺ se fixent sur les oxygènes qui tiennent l'aluminium. Ses liaisons Al–O, plus faibles que Si–O, lâchent une à une : l'aluminium part${k === "acide" ? ", entouré d'eau (Al³⁺)" : " ; dans le sol, il se redépose aussitôt avec la silice, en kaolinite"}. Le silicium suivi ne tient plus que par un pont${ALT ? ", vers un autre aluminium : Si–O–Al" : " Si–O–Si"}.`,
      A: { AL: { x: dA[0], y: dA[1] }, Oa: { x: pg[0] - 4 + ddx, y: pg[1] - LH + ddy }, Hal: { x: pg[0] + 5 + ddx, y: pg[1] - LH - 9 + ddy }, Hx: hO(oL, 4, -13), Hy: hO(oD, 12, 4) },
      B: { a1: 0, a2: 0, a3: 0, hx: oh(oL, "Hx"), hy: oh(oD, "Hy") },
      L: { lA: { x: dA[0], y: dA[1] + 40, t: alPart, m: 1 } },
    }));
    const w2 = { x: p[0] + 24, y: p[1] + 16 }, sort = [300, 92], dx = sort[0] - p[0], dy = sort[1] - p[1];
    const dep = (q) => ({ x: (q.x ?? q[0]) + dx, y: (q.y ?? q[1]) + dy });
    if (ALT) e.push(suite(e[2], {   // anorthite : le dernier pont tient par Al–O ; aucune liaison Si–O ne casse (Heřmanská et al. 2023, fig. 1)
      titre: "Le dernier pont lâche côté aluminium",
      texte: `Un H⁺ se fixe sur l'oxygène du dernier pont : c'est la liaison Al–O qui cède, et l'oxygène reste au silicium. Entouré de quatre OH, le silicium part en silice dissoute, H₄SiO₄, sans qu'aucune liaison Si–O ait cassé. C'est l'étape lente : un groupe ${d.formule} de la surface part en ${o.lettres || "un temps non mesuré"} en moyenne.`,
      A: { TS: dep(p), Ou: dep(A.Ou), Hu: dep(A.Hu), Or: dep(A.Or), Hr: dep(A.Hr), Ol: dep(ol), Ha: Object.assign(dep({ x: ol[0] + 9, y: ol[1] - 10 }), { o: 1 }),
        Ob: dep(ob), Hc: Object.assign(dep({ x: ob[0] + 13, y: ob[1] - 2 }), { o: 1 }), halo: { x: sort[0], y: sort[1], o: 0 } },
      B: { bb: 0, h4: oh("Ob", "Hc") }, h: Object.assign({ cours: true }, H),
      L: { lT: { x: sort[0], y: sort[1] + 58, t: "H₄SiO₄", m: 1 } },
    }));
    else e.push(suite(e[2], {
      titre: "L'eau casse le dernier pont",
      texte: `Une molécule d'eau se glisse contre le dernier pont : son H passe sur l'oxygène du pont, son OH sur le silicium. Le silicium, entouré de quatre OH, part : silice dissoute, H₄SiO₄. C'est l'étape lente : un groupe ${d.formule} de la surface part en ${o.lettres || "un temps non mesuré"} en moyenne.`,
      A: { TS: dep(p), Ou: dep(A.Ou), Hu: dep(A.Hu), Or: dep(A.Or), Hr: dep(A.Hr), Ol: dep(ol), Ha: Object.assign(dep({ x: ol[0] + 9, y: ol[1] - 10 }), { o: 1 }),
        W2: Object.assign({ t: "at", el: "Ow" }, dep(w2)), Hd: Object.assign(dep({ x: w2.x + 9, y: w2.y + 9 }), { o: 1 }),
        Hc: { x: ob[0] + 13, y: ob[1] - 2, o: 1 }, halo: { x: sort[0], y: sort[1], o: 0 } },
      B: { sb: 0, s2: si("TS", "W2"), h3: oh("W2", "Hd"), h4: oh("Ob", "Hc") }, h: Object.assign({ cours: true }, H),
      L: { lT: { x: sort[0], y: sort[1] + 58, t: "H₄SiO₄", m: 1 } },
    }));
    e.push(suite(e[3], {
      titre: "Le voisin devient le bord",
      texte: T.recule || `Les tétraèdres voisins portent maintenant des OH : ils sont au bord à leur tour, et tout recommence. ${majuscule(d.la)} donne du ${nomC} et de la silice dissoute ; l'aluminium${k === "acide" ? " reste dissous tant que l'eau est acide" : " reste sur place, en argile"}.`,
      A: { halo: { x: P(1, NS)[0], y: P(1, NS)[1], o: 1 } }, h: H,
    }));
    return e;
  }

  function energie(d, O) {
    const E = d.energie || {}, rep = d.repere, T = d.textes || {};
    const duo = [{ titre: "Si–O", sous: `liaison ${O.nature("Si–O")} (électrons en partie partagés)`,
      schema: { type: "partage", a: "Si", b: "O", aria: "Silicium et oxygène partagent des électrons" },
      li: [`Ionique ${O.fraction(O.ionicite("Si", "O"))} seulement (Pauling) : le silicium et l'oxygène gardent une bonne part de leurs électrons en commun.`,
        estF(d) ? (an(d) ? "Chaque oxygène relie un silicium à un aluminium : il n'y a aucun pont Si–O–Si, et pour libérer un silicium il suffit de casser les liaisons Al–O autour de lui."
          : "Chaque oxygène relie deux tétraèdres : pour libérer un silicium, l'eau doit casser ses ponts Si–O–Si un à un.")
          : T.duoSi || "Chaque oxygène relie deux silicium : il n'y a pas de liaison plus faible où le cristal céderait. Pour libérer un silicium, l'eau doit casser ses ponts Si–O–Si un à un."] }];
    if (T.modif) duo.push({ titre: "Na–O", sous: `liaison ${O.nature("Na–O")} (électron cédé)`,
      schema: { type: "don", a: "Na", la: "Na⁺", ra: 17, fa: 12, b: "O", aria: "Le sodium cède son électron à l'oxygène" },
      li: [`Ionique ${O.fraction(O.ionicite("Na", "O"))} (Pauling) : le sodium a cédé son électron, il n'est plus retenu que par attraction, une seule charge partagée entre plusieurs oxygènes.`,
        "C'est la première à céder : les H⁺ prennent sa place bien avant que les ponts Si–O–Si ne cassent."] });
    if (estF(d)) duo.push({ titre: "Al–O", sous: `liaison ${O.nature("Al–O")} (électrons en partie partagés)`,
      schema: { type: "partage", a: "Al", b: "O", aria: "Aluminium et oxygène : électrons en partie cédés" },
      li: [`Ionique ${O.fraction(O.ionicite("Al", "O"))} (Pauling), comme Si–O ; mais l'aluminium n'a que trois charges pour quatre oxygènes : chaque liaison Al–O vaut ${String(Math.round(vals(d).al * 100) / 100).replace(".", ",")} contre ${String(Math.round(vals(d).si * 100) / 100).replace(".", ",")} pour Si–O (valences de liaison).`,
        an(d) ? "Sous les H⁺, c'est elle qui lâche, et c'est elle qui règle la vitesse : l'anorthite se défait sans casser de liaison Si–O."
          : "Sous les H⁺, c'est elle qui lâche la première : l'aluminium s'échange contre des protons et laisse des silicium à moitié détachés."] });
    const EA = [["eaAcide", "dans l'acide"], ["eaNeutre", estF(d) ? "vers la neutralité" : "dans l'eau pure"], ["eaBasique", "en eau basique"]].filter(([c]) => E[c] != null);
    let barres = null;
    if (EA.length) {
      const iv = (x) => (Array.isArray(x) ? x : [x, x]), fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
      const fac = (e) => fr1(Math.exp((e * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)));
      const facs = EA.map(([c, dans]) => { const [a, b] = iv(E[c]), fa = fac(a), fb = fac(b); return `${fa === fb ? fa : `${fa} à ${fb}`} ${dans}`; });
      barres = { titre: "Énergie d'activation de la dissolution", unite: "kJ/mol", max: 125, graduations: [0, 25, 50, 75, 100, 125],
        onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: EA.map(([c, nom]) => { const [a, b] = iv(E[c]), plage = a !== b;
          return { nom: majuscule(nom), el: "Si", hachure: plage, val: { ea: plage ? [a, b] : [0, b] }, txt: { ea: plage ? `${fr1(a)} à ${fr1(b)} kJ/mol` : `${fr1(b)} kJ/mol` } }; }),
        explic: { ea: `L'énergie qu'il faut fournir pour que la réaction se fasse : plus elle est grande, plus la chaleur accélère la dissolution. De 25 à 35 °C, la vitesse est multipliée par ${facs.join(", ")}.` } };
    }
    let temps = null;
    if (rep && rep.eau && d.onglets.eau && d.onglets.eau.t) {
      const f = O.rond2(d.onglets.eau.t / rep.eau.t);
      temps = { titre: T.tempsTitre || `Pourquoi ${d.la} résiste`, explic: `${T.tempsExplic || ""} ${majuscule(rep.la)} sert de repère. Barres : écart entre les valeurs publiées.`.trim(),
        rangees: [{ titre: "Une unité de la surface quitte le cristal, dans l'eau à 25 °C", fois: f >= 1 ? `environ ${nb(f, O)} fois plus lent pour ${d.la}` : `environ ${nb(O.rond2(1 / f), O)} fois plus rapide pour ${d.la}`,
          pts: [{ el: rep.cation, min: rep.eau.tmin, max: rep.eau.tmax, v: rep.eau.t, et: `${rep.nom} · ${rep.eau.court}`, ou: "haut" },
            { el: "Si", min: d.onglets.eau.tmin, max: d.onglets.eau.tmax, v: d.onglets.eau.t, et: `${d.nom} · ${d.onglets.eau.court}`, ou: "bas" }] }] };
    }
    return { duo, barres, temps };
  }

  Liaisons.scene("charpentes", {
    onglets: (d) => estF(d) ? [{ k: "eau", nom: "Dans l'eau du sol" }, { k: "acide", nom: "Dans l'acide" }]
      : estAm(d) ? [["eau", d.onglets.acide ? "Dans l'eau du sol" : "Dans l'eau"], ["acide", "Dans l'acide"], ["basique", "Eau basique"]].filter(([k]) => d.onglets[k]).map(([k, nom]) => ({ k, nom }))
      : [{ k: "eau", nom: "Dans l'eau" }, { k: "basique", nom: "Eau basique" }],
    decor, etapes, energie,
    legende: (d) => Object.assign(estF(d) || estAm(d) ? { "e:O": estAm(d) ? "oxygène du réseau" : "oxygène du cristal", "i:Cl−": "Cl⁻, ne réagit pas", "e:Na": "ion sodium Na⁺", "e:K": "ion potassium K⁺" } : { "e:O": "oxygène du cristal", "i:O−": "ion hydroxyde OH⁻" }, { "t:avant": "atome juste devant le plan du dessin (en contour)", "t:arriere": "couche juste derrière le plan du dessin (plus petite, pâle)" }),
    aria: (d) => estAm(d) ? `Coupe du bord d'un morceau ${d.textes.de || "de " + d.nom}, étape par étape` : `Coupe du bord d'un cristal de ${d.nom}, étape par étape`,
  });
})();
