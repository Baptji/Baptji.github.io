// ═══════════════════════════════════════════════════════════════════════════════
// clivage.js — le clivage des fiches minéraux en images (02/10/2026)
// Comme le système cristallin de la carte Identité : TOUS les types de clivage en petits schémas au trait (aucun, basal, prismatique à
// 90°, prismatique oblique, cubique, rhomboédrique, octaédrique, dodécaédrique), celui du minéral en surbrillance, puis une phrase
// (nombre de directions, angles entre plans calculés, familles {hkl} et qualité). Le type est CALCULÉ : chaque famille de clivage
// {hkl} (Cristal.CRISTAUX[id].clivages, sinon les indices ou les mots du texte de la fiche) est démultipliée par la symétrie du
// minéral ; une direction → basal ; toutes dans une zone → prismatique ; sinon solide fermé (3 à 90° → cubique, 3 obliques →
// rhomboédrique, 4 → octaédrique, 6 → dodécaédrique). Les icônes sont dessinées par le même calcul (intersection des plans).
// Usage : Clivage.html(id) → HTML (SVG + légende), ou "".
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  if (!window.Cristal || !Cristal._outils || !Cristal._outils.polyedre) return;
  const { repere, normale, groupe, polyedre } = Cristal._outils;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cro = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const ech = (a, s) => a.map((v) => v * s);
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const lon = (a) => Math.sqrt(dot(a, a));
  const uni = (a) => { const l = lon(a); return l ? ech(a, 1 / l) : [0, 0, 0]; };
  const trois = (h) => (h.length === 4 ? [h[0], h[1], h[3]] : h.slice());
  const sansAccent = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const hklTxt = (h) => "{" + h.map((v) => (v < 0 ? -v + "̄" : v)).join("") + "}";

  // directions (une normale par plan, au signe près) d'une famille de clivage
  function directions(R, G, hkl) {
    const res = [];
    for (const W of G) {
      const hp = [0, 1, 2].map((j) => hkl[0] * W[0][j] + hkl[1] * W[1][j] + hkl[2] * W[2][j]);
      const n = uni(normale(R, hp));
      if (!res.some((m) => Math.abs(Math.abs(dot(m, n)) - 1) < 1e-6)) res.push(n);
    }
    return res;
  }

  // indices {hkl} écrits dans le texte de la fiche → familles, si la symétrie suffit à les placer :
  // maille et classe de la forme du cristal quand elle existe ; sinon système cristallin, seulement pour les plans dont
  // l'orientation ne dépend pas des longueurs de la maille (pinacoïdes {100} {010} {001}, prisme {hk0} et base des systèmes
  // hexagonal et quadratique, toutes les formes du cubique). Le texte entre parenthèses (« notation des ouvrages ») est ignoré.
  const QUAL = /(tres bon|assez bon|presque parfait|parfait|bon|net|moyen|imparfait|tres mediocre|mediocre|faible|distinct|probable)/g;
  function lireHkl(txt) {
    const v = [];
    const re = /(-?)(\d)(\u0304?)/g;
    let x;
    while ((x = re.exec(txt))) v.push((x[1] || x[3] ? -1 : 1) * +x[2]);
    return v.length === 4 ? [v[0], v[1], v[3]] : v.length === 3 ? v : null;
  }
  function indicesDuTexte(texte, systeme, cr) {
    const brut = (texte || "").replace(/\([^)]*\)/g, " ");
    if (/s[ée]paration| ou /i.test(brut)) return null;               // séparation (pas un clivage) ou plan incertain
    const L = [];
    const re = /\{([^}]+)\}/g;
    let x;
    while ((x = re.exec(brut))) {
      const h = lireHkl(x[1]);
      if (!h || !h.some((v) => v)) return null;
      const avant = sansAccent(brut.slice(0, x.index)), q = avant.match(QUAL);
      L.push({ h, nom: "{" + x[1] + "}", qualite: q ? q[q.length - 1] : "" });
    }
    if (!L.length) return null;
    let R, G;
    if (cr && cr.maille && cr.classe) { R = cr._R || repere(cr.maille); G = groupe(cr.classe); }
    else {
      const sys = Identite && Identite.systemesDe ? Identite.systemesDe(systeme || "")[0] : null;
      const nuls = (h) => h.filter((v) => !v).length;
      const pina = L.every((f) => nuls(f.h) === 2);
      if (sys === "cubique") { R = repere([1, 1, 1, 90, 90, 90]); G = groupe("m-3m"); }
      else if ((sys === "hexagonal" || sys === "trigonal") && L.every((f) => !f.h[2] || (!f.h[0] && !f.h[1]))) { R = repere([1, 1, 1.6, 90, 90, 120]); G = groupe("6/mmm"); }
      else if (sys === "quadratique" && L.every((f) => !f.h[2] || (!f.h[0] && !f.h[1]))) { R = repere([1, 1, 1.4, 90, 90, 90]); G = groupe("4/mmm"); }
      else if (sys === "orthorhombique" && pina) { R = repere([1, 1, 1, 90, 90, 90]); G = groupe("mmm"); }
      else if ((sys === "monoclinique" || sys === "triclinique") && pina && L.length === 1) { R = repere([1, 1, 1, 90, 90, 90]); G = groupe("-1"); }
      else if (sys === "monoclinique" && pina && L.every((f) => f.h[1] || L.length === 2 && L.some((g) => g.h[1]))) { R = repere([1, 1, 1, 90, 90, 90]); G = groupe("2/m"); }
      else return null;
    }
    return { type: "indices", fam: L.map((f) => ({ dirs: directions(R, G, f.h), qualite: f.qualite, nom: f.nom })) };
  }

  // ─────────── familles : d'après la fiche de forme, sinon d'après le texte ───────────
  function familles(id) {
    const cr = Cristal.CRISTAUX[id];
    if (cr && cr.clivages && cr.clivages.length && cr.maille && cr.classe) {
      const R = cr._R || repere(cr.maille), G = groupe(cr.classe);
      return { type: "calcul", fam: cr.clivages.map((cl) => ({ dirs: directions(R, G, trois(cl.hkl)), qualite: cl.qualite || "", nom: hklTxt(cl.hkl) })) };
    }
    const m = MINERAUX[id];
    const t = sansAccent((m && m.clivage) || "");
    if (!t) return null;
    const parIndices = indicesDuTexte(m.clivage, m.systeme, cr);
    if (parIndices) return parIndices;
    const qual = (t.match(/^(tres |presque )?(parfait|tres bon|bon|net|moyen|assez bon|imparfait|mediocre|faible|distinct)/) || [])[0] || "";
    if (/^(aucun|indistinct|tres indistinct|non signale|absent)/.test(t)) return { type: "aucun", conch: /conchoid/.test(t) };
    const cub = repere([1, 1, 1, 90, 90, 90]), Gm3m = groupe("m-3m");
    const type = (dirs, nom) => ({ type: "texte", fam: [{ dirs, qualite: qual, nom }] });
    if (/dodecaedr/.test(t)) return type(directions(cub, Gm3m, [1, 1, 0]), "{110}");
    if (/octaedr/.test(t) && !/separation/.test(t)) return type(directions(cub, Gm3m, [1, 1, 1]), "{111}");
    if (/cubique|trois clivages pseudo-cubiques/.test(t)) return type(directions(cub, Gm3m, [1, 0, 0]), "{100}");
    if (/rhomboedr/.test(t)) return type(directions(repere([4.99, 4.99, 17.06, 90, 90, 120]), groupe("-3m"), [1, 0, 4]), "{101̄4}");
    const ang = t.match(/(\d+(?:,\d+)?)\s*°/);
    if (ang && /prismatique|deux|°\/|a ~/.test(t)) {
      const a = parseFloat(ang[1].replace(",", ".")) * Math.PI / 360;
      return type([[Math.cos(a), Math.sin(a), 0], [Math.cos(a), -Math.sin(a), 0]], "prismatique");
    }
    if (/basal|[{(]0+1[})]|feuillet|lamelle|micace|un clivage|en lames/.test(t) && !/ et |;|,/.test(t.replace(/\(.*\)/g, ""))) return type([[0, 0, 1]], "basal");
    return null;
  }

  // ─────────── géométrie ───────────
  function solide(F) {
    const N = F.fam.flatMap((f, i) => f.dirs.map((n) => ({ n, f: i })));
    // rang : une direction, toutes dans une même zone (deux, ou prisme hexagonal), ou trois dimensions
    const n0 = N[0].n;
    const autre = N.find((x) => lon(cro(x.n, n0)) > 1e-3);
    const plans = [];
    let rang, axe = null;
    if (!autre) rang = 1;
    else {
      axe = uni(cro(n0, autre.n));
      rang = N.every((x) => Math.abs(dot(x.n, axe)) < 1e-3) ? 2 : 3;
    }
    if (rang === 1) {
      // feuillet : la plaque est limitée dans son plan par un hexagone (cassure)
      const u = uni(cro(n0, Math.abs(n0[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), v = cro(n0, u);
      for (const s of [1, -1]) plans.push({ n: ech(n0, s), p: 0.13, forme: N[0].f });
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; plans.push({ n: add(ech(u, Math.cos(a)), ech(v, Math.sin(a))), p: 1, forme: -1 }); }
    } else {
      for (const x of N) for (const s of [1, -1]) plans.push({ n: ech(x.n, s), p: 1, forme: x.f });
      if (rang === 2) for (const s of [1, -1]) plans.push({ n: ech(axe, s), p: 1.25, forme: -1 });
    }
    return { rang, N, axe, faces: polyedre(plans) };
  }

  // angles entre directions distinctes (degrés, ≤ 90), sans doublons
  function angles(N) {
    const vus = [];
    for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
      const a = Math.acos(Math.min(1, Math.abs(dot(N[i].n, N[j].n)))) * 180 / Math.PI;
      if (!vus.some((b) => Math.abs(b - a) < 0.6)) vus.push(a);
    }
    return vus.sort((a, b) => b - a);
  }
  const fmtA = (a) => (Math.abs(a - 90) < 0.3 ? "90°" : `${Math.round(a)}° et ${Math.round(180 - a)}°`);

  // ─────────── vue et icône au trait (comme les mailles de la carte Identité) ───────────
  // solide fermé : c vertical ; baguette debout, vue de haut (sa section se voit) ; feuillets à plat, vus de 25° au-dessus
  function vue(S) {
    let oeil, haut0;
    const n1 = S.N[0].n;
    if (S.rang === 2) {
      const n2b = S.N.find((x) => lon(cro(x.n, n1)) > 1e-3).n, n2 = dot(n1, n2b) < 0 ? ech(n2b, -1) : n2b;
      const u = uni(add(n1, n2)), w = uni(cro(S.axe, u));
      oeil = uni(add(add(ech(S.axe, 0.85), ech(u, 0.6)), ech(w, 0.25)));
      haut0 = S.axe;
    } else if (S.rang === 1) {
      const u = uni(cro(n1, Math.abs(n1[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), w = cro(n1, u);
      oeil = uni(add(add(ech(n1, 0.42), ech(u, 0.85)), ech(w, 0.3)));
      haut0 = n1;
    } else {
      const az = 28 * Math.PI / 180, el = 22 * Math.PI / 180;
      oeil = [Math.cos(el) * Math.sin(az), -Math.cos(el) * Math.cos(az), Math.sin(el)];
      haut0 = [0, 0, 1];
    }
    const droite = uni(cro(haut0, oeil));
    return { oeil, droite, haut: cro(oeil, droite) };
  }
  // icône 40 × 40 : faces visibles au trait, pleines de la couleur du fond (les feuillets du fond sont cachés par ceux de devant)
  function icone(S) {
    const { oeil, droite, haut } = vue(S);
    const n0 = S.N[0].n;
    const copies = S.rang === 1 ? [-0.62, 0, 0.62] : [0];
    const corps = copies.map((s) => S.faces.map((f) => Object.assign({}, f, { pts: f.pts.map((P) => add(add(P, ech(n0, s)), ech(droite, s * 0.25))) })));
    const px = (P) => [dot(P, droite), -dot(P, haut)];
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const c of corps) for (const f of c) for (const P of f.pts) { const [x, y] = px(P); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const k = 32 / Math.max(x1 - x0, y1 - y0), ox = 20 - (x0 + x1) / 2 * k, oy = 20 - (y0 + y1) / 2 * k;
    const pt = (P) => { const [x, y] = px(P); return (ox + x * k).toFixed(1) + "," + (oy + y * k).toFixed(1); };
    const ordre = copies.map((s, i) => [i, s * dot(n0, oeil)]).sort((a, b) => a[1] - b[1]).map(([i]) => i);
    let g = "";
    for (const i of ordre)
      for (const f of corps[i].filter((f) => dot(f.n, oeil) > 1e-6).sort((a, b) => dot(a.centre, oeil) - dot(b.centre, oeil)))
        g += `<polygon points="${f.pts.map(pt).join(" ")}"${f.forme < 0 ? ' class="cl-cassure"' : ""}/>`;
    return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">${g}</svg>`;
  }
  // éclat à cassure conchoïdale (aucun clivage)
  const ECLAT = `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><polygon points="5,28 12,8 30,5 37,19 28,34 13,36"/>`
    + `<path d="M15 33 Q20 23 32 22"/><path d="M10 28 Q16 17 33 15"/><path d="M8 21 Q14 12 28 9"/></svg>`;

  // liquide (mercure) : une goutte qui tombe dans une flaque
  const FLAQUE = `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">`
    + `<path class="cl-plein" d="M4 29 C4 24 12 22 20 22.5 C29 22 37 24 36 29 C35 34 27 35.5 19 35 C11 35.5 4 33.5 4 29 Z"/>`
    + `<path d="M12 29 C12 27 16 26.2 20 26.2 C24 26.2 28 27 28 29 C28 31 24 31.8 20 31.8 C16 31.8 12 31 12 29 Z"/>`
    + `<path class="cl-plein" d="M20 4 C18 8 15.5 11 15.5 13.5 A4.5 4.5 0 0 0 24.5 13.5 C24.5 11 22 8 20 4 Z"/></svg>`;

  // ─────────── les types de clivage (tous affichés, celui du minéral en surbrillance) ───────────
  let TYPES = null;
  function types() {
    if (TYPES) return TYPES;
    const cub = repere([1, 1, 1, 90, 90, 90]), m3m = groupe("m-3m");
    const a = 28 * Math.PI / 180;
    const def = [
      ["aucun", "Aucun", null, "pas de clivage : cassure quelconque ou courbe (conchoïdale)"],
      ["basal", "Basal", [[0, 0, 1]], "une seule direction : il se débite en feuillets"],
      ["prisme90", "Prisma­tique à 90°", [[1, 0, 0], [0, 1, 0]], "deux directions à peu près perpendiculaires : baguettes à section carrée ou rectangulaire"],
      ["prisme", "Prisma­tique oblique", [[Math.cos(a), Math.sin(a), 0], [Math.cos(a), -Math.sin(a), 0]], "deux directions (ou plus) parallèles à un même axe, qui se coupent en biais : baguettes à section en losange ou en hexagone"],
      ["cube", "Cubique", directions(cub, m3m, [1, 0, 0]), "trois directions à angle droit : cubes ou pavés"],
      ["rhombo", "Rhombo­édrique", directions(repere([4.99, 4.99, 17.06, 90, 90, 120]), groupe("-3m"), [1, 0, 4]), "trois directions qui ne sont pas à angle droit : rhomboèdres ou parallélépipèdes"],
      ["octa", "Octa­édrique", directions(cub, m3m, [1, 1, 1]), "quatre directions : octaèdres"],
      ["dodeca", "Dodéca­édrique", directions(cub, m3m, [1, 1, 0]), "six directions : dodécaèdres"],
      ["liquide", "Liquide", "flaque", "pas de cristal à la température ordinaire, donc pas de clivage : il coule et forme des gouttes"],
    ];
    TYPES = def.map(([k, nom, dirs, regle]) => ({ k, nom, regle, svg: dirs === "flaque" ? FLAQUE : dirs ? icone(solide({ fam: [{ dirs }] })) : ECLAT }));
    return TYPES;
  }
  function typeDe(F, S) {
    if (F.type === "aucun") return "aucun";
    const nb = S.N.length, ang = angles(S.N);
    if (S.rang === 1) return "basal";
    if (S.rang === 2) return nb === 2 && Math.abs(ang[0] - 90) < 6 ? "prisme90" : "prisme";
    if (nb === 3) return ang.every((x) => Math.abs(x - 90) < 6) ? "cube" : "rhombo";
    if (nb === 4 && F.fam.length === 1) return "octa";
    if (nb === 6 && F.fam.length === 1) return "dodeca";
    return null;
  }

  // la rangée est TOUJOURS affichée (sa demande du 02/10) : sans type déterminé, rien n'est allumé et la bulle dit pourquoi
  function rendu(id) {
    const m = MINERAUX[id] || {};
    const T = types();
    let F = null, S = null, on = null, note;
    if (/liquide/i.test((m.clivage || "") + " " + (m.systeme || ""))) {
      on = "liquide";
      note = "<b>Liquide</b> : pas de cristal à la température ordinaire, donc pas de clivage ; il coule et se rassemble en gouttes et en flaques.";
    } else {
      try {
        F = familles(id);
        if (F && F.type !== "aucun") { S = solide(F); if (!S.faces.length) { F = null; S = null; } }
      } catch (e) { F = null; S = null; }
      if (F) on = typeDe(F, S);
      else note = /non (disponible|mesur|observ)|^—|indetermin/i.test(m.clivage || "")
        ? "Clivage non décrit pour ce minéral (cristaux trop petits ou trop rares) : aucun type n'est allumé."
        : "La fiche ne dit pas selon quels plans le minéral se clive (seulement « " + esc(m.clivage || "") + " ») : le type ne peut pas être déterminé, aucun n'est allumé.";
    }
    const cases = T.map((t) => `<div class="id-sys cl-type${t.k === on ? " on" : ""}">${t.svg}<span>${t.nom}</span></div>`).join("");
    if (note) return { rangee: `<div class="id-systemes cl-types">${cases}</div>`, note };
    if (!S) note = F.conch ? "<b>Aucun</b> : il casse en surfaces courbes, comme le verre (cassure conchoïdale)." : "<b>Aucun</b> clivage net : il casse sans direction privilégiée.";
    else {
      const nb = S.N.length, ang = nb > 1 ? angles(S.N) : [];
      const t = T.find((x) => x.k === on);
      const fam = F.fam.map((f) => `${esc(f.nom)}${f.qualite ? " " + esc(f.qualite) : ""} (${f.dirs.length} direction${f.dirs.length > 1 ? "s" : ""})`).join(", ");
      note = `${t ? `<b>${t.nom.replace(/­/g, "")}</b> : ${t.regle}. ` : "<b>Clivage composé</b>, qui ne correspond à aucun des types simples : "}${nb === 1 ? "Une direction" : nb + " directions"} de clivage${ang.length ? `, angles entre plans : ${ang.map(fmtA).join(" ; ")}` : ""} — ${fam}.${F.type === "texte" ? " Type déduit de la description du clivage." : ""}`;
    }
    return { rangee: `<div class="id-systemes cl-types">${cases}</div>`, note };
  }
  const cache = {};
  const calcul = (id) => (id in cache ? cache[id] : (cache[id] = rendu(id) || null));
  // la rangée seule (sous le texte du clivage) ; l'explication va dans la bulle du « ? » (aide)
  const html = (id) => (calcul(id) ? calcul(id).rangee : "");
  const aide = (id) => (calcul(id) ? calcul(id).note : "");

  window.Clivage = { html, aide, _familles: familles };
})();
