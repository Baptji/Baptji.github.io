// ============ « 1 kg altéré : qu'est-ce qui en sort ? » calculé à partir de la composition (tâche D.6, 25/09/2026) ============
// Demande : les anciens bilans, posés à la main en chiffres ronds, étaient trop tranchés (presque tout sable, tout argile ou tout
// limon). Le bilan est désormais CALCULÉ, de façon reproductible, à partir de la composition minérale de la fiche (`mineraux`) :
// chaque minéral se partage entre sable, limons, argiles, oxydes, dissous et « autre » selon ce qu'il devient à l'altération
// complète en climat tempéré (règles `DEVENIR` ci-dessous), et les grains qui résistent (quartz, minéraux lourds) se répartissent
// entre sable, limons et argiles selon la taille des grains de la roche (`GRAIN`).
// Chargé avant app.js ; app.js appelle BilanAlteration.appliquer(ROCHES) après avoir fusionné ROCHE_EXTRAS. L'ancien bilan est
// gardé dans `produitsAvant` (pour comparer), le détail par minéral dans `produitsDetail`.
// Hypothèses (écrites sur la fiche) : altération complète ; la masse d'eau fixée par les argiles n'est pas comptée ; les argiles
// néoformées sont comptées à 90 % en argiles (< 2 µm) et 10 % en limons (agrégats) ; ordres de grandeur d'après les
// stœchiométries des réactions d'hydrolyse (ex. 2 KAlSi₃O₈ → 1 Al₂Si₂O₅(OH)₄ : 46 % de la masse reste en kaolinite).
(function () {
  "use strict";
  // taille des grains résiduels : [sable, limon, argile]
  const TAILLES = {
    tres_grossier: [0.88, 0.09, 0.03], grossier: [0.8, 0.15, 0.05], moyen: [0.65, 0.28, 0.07], fin: [0.35, 0.5, 0.15],
    sable: [0.93, 0.05, 0.02], limon: [0.12, 0.78, 0.1], tres_fin: [0.05, 0.6, 0.35], mixte: [0.5, 0.3, 0.2],
  };
  // taille des grains de chaque roche (défaut : plutonique grossier, hypovolcanique moyen, volcanique fin, autres moyen)
  const GRAIN = {
    calcaire: "fin", travertin: "moyen", craie: "tres_fin", tuffeau: "fin", dolomie: "fin", marne: "tres_fin", argile: "tres_fin",
    sable: "sable", gres: "sable", conglomerat: "tres_grossier", arkose: "grossier", grauwacke: "moyen", siltite: "limon",
    breche_sedimentaire: "tres_grossier", molasse: "moyen", flysch: "fin", tillite: "mixte", loess: "limon", alluvions: "grossier",
    colluvions: "limon", eboulis: "tres_grossier", moraine: "mixte", alterite: "grossier", dunes: "sable", terra_rossa: "tres_fin",
    argile_silex: "tres_grossier", gypse: "moyen", sel: "grossier", houille: "fin", tourbe: "fin", lignite: "fin", anthracite: "fin",
    schiste_bitumineux: "tres_fin", meuliere: "grossier", silex: "grossier", radiolarite: "fin", diatomite: "tres_fin", gaize: "fin",
    phosphorite: "moyen", anhydrite: "moyen", sylvinite: "grossier", laterite: "moyen", bauxite: "fin", cargneule: "moyen",
    falun: "grossier", vase_tangue: "limon", calcrete: "moyen", roche_ferrifere: "fin",
    pegmatite: "tres_grossier", obsidienne: "tres_fin", tuf_volcanique: "tres_fin", ignimbrite: "fin", breche_volcanique: "mixte",
    gneiss: "grossier", micaschiste: "moyen", ardoise: "tres_fin", quartzite: "sable", marbre: "moyen", serpentinite: "fin",
    amphibolite: "moyen", eclogite: "moyen", migmatite: "grossier", leptynite: "fin", granulite_meta: "moyen", schiste_bleu: "fin",
    schiste_vert: "fin", corneenne: "fin", skarn: "grossier", mylonite: "fin", cataclasite: "mixte", pseudotachylite: "tres_fin",
    greisen: "moyen", fenite: "moyen", rodingite: "moyen", calcschiste: "fin", impactite: "mixte", spilite: "fin",
  };
  // devenir d'1 g de minéral : res = part qui reste en grains (répartie selon GRAIN), puis parts directes
  const R = (o) => o;
  const PYROX = R({ argile: 0.35, oxydes: 0.1, dissous: 0.55, pourquoi: "pyroxène → argiles (smectites) + oxydes de fer ; calcium, magnésium et silice partent en solution" });
  const AMPH = R({ argile: 0.4, oxydes: 0.12, dissous: 0.48, pourquoi: "amphibole → argiles + oxydes de fer ; le reste part en solution" });
  const AL2SIO5 = R({ res: 0.8, argile: 0.15, dissous: 0.05, pourquoi: "très résistant : reste surtout en grains" });
  const CARB = R({ dissous: 1, pourquoi: "carbonate : entièrement dissous (Ca²⁺, Mg²⁺, HCO₃⁻)" });
  const SEL = R({ dissous: 1, pourquoi: "sel soluble : entièrement dissous" });
  const ARGILE = R({ argile: 0.88, limon: 0.12, pourquoi: "minéral argileux hérité : reste argile" });
  const DEVENIR = {
    quartz: R({ res: 0.99, dissous: 0.01, pourquoi: "quartz : presque insoluble, reste en grains" }),
    calcedoine: R({ res: 0.95, dissous: 0.05, pourquoi: "silice microcristalline : reste en grains et en éclats" }),
    opale: R({ res: 0.5, dissous: 0.5, pourquoi: "opale : moitié dissoute, moitié en grains fins" }),
    orthose: R({ argile: 0.5, dissous: 0.5, pourquoi: "feldspath potassique → kaolinite ou illite ; potassium et silice dissous (2 KAlSi₃O₈ → Al₂Si₂O₅(OH)₄ + 2 K⁺ + 4 H₄SiO₄)" }),
    sanidine: R({ argile: 0.5, dissous: 0.5, pourquoi: "feldspath potassique → argile ; potassium et silice dissous" }),
    albite: R({ argile: 0.5, dissous: 0.5, pourquoi: "albite → kaolinite ; sodium et silice dissous" }),
    plagioclases: R({ argile: 0.62, dissous: 0.38, pourquoi: "plagioclase → kaolinite ou smectite ; calcium, sodium et silice dissous" }),
    nepheline: R({ argile: 0.35, dissous: 0.65, pourquoi: "feldspathoïde, très altérable : peu d'argile, beaucoup de dissous" }),
    hauyne: R({ argile: 0.3, dissous: 0.7, pourquoi: "feldspathoïde, très altérable" }),
    muscovite: R({ limon: 0.3, argile: 0.55, dissous: 0.15, pourquoi: "muscovite : paillettes qui restent en partie, le reste devient illite ou kaolinite" }),
    biotite: R({ argile: 0.6, oxydes: 0.12, dissous: 0.28, pourquoi: "biotite → vermiculite, kaolinite + oxydes de fer ; potassium et magnésium dissous" }),
    phlogopite: R({ argile: 0.62, oxydes: 0.03, dissous: 0.35, pourquoi: "phlogopite → vermiculite ; potassium et magnésium dissous" }),
    zinnwaldite: R({ argile: 0.6, oxydes: 0.08, dissous: 0.32, pourquoi: "mica lithinifère → argiles ; lithium et potassium dissous" }),
    glauconie: R({ argile: 0.7, oxydes: 0.15, dissous: 0.15, pourquoi: "glauconie → argiles + oxydes de fer" }),
    chlorite_m: R({ argile: 0.7, oxydes: 0.12, dissous: 0.18, pourquoi: "chlorite → vermiculite ou kaolinite + oxydes de fer" }),
    illite_m: ARGILE, kaolinite_m: ARGILE, smectites_m: ARGILE,
    serpentine: R({ argile: 0.35, oxydes: 0.08, dissous: 0.57, pourquoi: "serpentine → smectites + oxydes ; beaucoup de magnésium dissous" }),
    olivine: R({ argile: 0.15, oxydes: 0.12, dissous: 0.73, pourquoi: "olivine, très altérable : magnésium et silice dissous, fer en oxydes" }),
    pyroxenes: PYROX, augite: PYROX, diopside: PYROX, enstatite: PYROX, aegyrine: PYROX, omphacite: PYROX,
    wollastonite: R({ argile: 0.1, dissous: 0.9, pourquoi: "wollastonite : calcium et silice presque entièrement dissous" }),
    amphiboles: AMPH, hornblende: AMPH, actinote: AMPH, glaucophane: AMPH, arfvedsonite: AMPH,
    grenat: R({ res: 0.3, argile: 0.25, oxydes: 0.15, dissous: 0.3, pourquoi: "grenat : résiste en partie, le reste → argiles + oxydes" }),
    andradite: R({ res: 0.3, argile: 0.2, oxydes: 0.2, dissous: 0.3, pourquoi: "grenat ferrifère : résiste en partie, le reste → oxydes + dissous" }),
    grossulaire: R({ res: 0.3, argile: 0.25, dissous: 0.45, pourquoi: "grenat calcique : résiste en partie" }),
    epidote: R({ argile: 0.4, oxydes: 0.08, dissous: 0.52, pourquoi: "épidote → argiles + oxydes ; calcium dissous" }),
    vesuvianite: R({ argile: 0.35, oxydes: 0.05, dissous: 0.6, pourquoi: "vésuvianite → argiles ; calcium dissous" }),
    lawsonite: R({ argile: 0.5, dissous: 0.5, pourquoi: "lawsonite → kaolinite ; calcium dissous" }),
    cordierite: R({ argile: 0.5, oxydes: 0.03, dissous: 0.47, pourquoi: "cordiérite → argiles (pinite) ; magnésium dissous" }),
    titanite: R({ res: 0.4, oxydes: 0.3, dissous: 0.3, pourquoi: "titanite → oxydes de titane (anatase) ; calcium dissous" }),
    andalousite: AL2SIO5, sillimanite: AL2SIO5, disthene: AL2SIO5, topaze: AL2SIO5, beryl: AL2SIO5,
    tourmaline: R({ res: 0.95, dissous: 0.05, pourquoi: "tourmaline : presque inaltérable" }),
    calcite: CARB, aragonite: CARB, dolomite: CARB,
    siderite: R({ oxydes: 0.6, dissous: 0.4, pourquoi: "sidérite → goethite ; le carbonate part en solution" }),
    gypse_m: SEL, anhydrite: SEL, halite_m: SEL, sylvite: SEL,
    fluorine: R({ res: 0.1, dissous: 0.9, pourquoi: "fluorine : lentement dissoute" }),
    apatite: R({ res: 0.15, dissous: 0.85, pourquoi: "apatite : phosphate et calcium dissous, un peu résiste" }),
    pyrite: R({ oxydes: 0.6, dissous: 0.4, pourquoi: "pyrite → goethite ; le soufre part en sulfate" }),
    magnetite: R({ oxydes: 1, pourquoi: "oxyde de fer : reste (se change en hématite ou goethite)" }),
    hematite: R({ oxydes: 1, pourquoi: "oxyde de fer : reste" }), goethite: R({ oxydes: 1, pourquoi: "oxyde de fer : reste" }),
    gibbsite: R({ oxydes: 1, pourquoi: "hydroxyde d'aluminium : reste" }),
    chromite: R({ oxydes: 1, pourquoi: "oxyde de chrome : inaltérable" }), rutile: R({ oxydes: 1, pourquoi: "oxyde de titane : inaltérable" }),
    cassiterite: R({ oxydes: 1, pourquoi: "oxyde d'étain : inaltérable" }), pyrochlore: R({ oxydes: 1, pourquoi: "oxyde de niobium : résistant" }),
    graphite: R({ limon: 1, pourquoi: "graphite : inaltéré, en paillettes" }),
    matorg: R({ autre: 1, pourquoi: "matière organique : oxydée, repart en CO₂" }),
    verre: R({ argile: 0.4, oxydes: 0.05, dissous: 0.55, pourquoi: "verre volcanique → halloysite, allophane, smectite ; silice et alcalins dissous" }),
  };
  const DEFAUT = R({ argile: 0.35, dissous: 0.65, pourquoi: "règle par défaut : silicate altérable" });
  const CLES = ["sable", "limon", "argile", "oxydes", "dissous", "autre"];

  function grainDe(r) {
    if (GRAIN[r.id]) return GRAIN[r.id];
    const b = typeof placeRoche === "function" && placeRoche(r.id);
    const code = b ? b.branche.code : "";
    return code === "M.1" ? "grossier" : code === "M.3" ? "moyen" : code === "M.2" ? "fin" : "moyen";
  }
  function calcul(r) {
    const L = r.mineraux || [];
    const tot = L.reduce((s, [, p]) => s + p, 0);
    if (!tot) return null;
    const g = TAILLES[grainDe(r)];
    const somme = Object.fromEntries(CLES.map((k) => [k, 0]));
    const detail = [];
    for (const [id, p] of L) {
      const d = DEVENIR[id] || DEFAUT, m = p / tot * 1000;
      const part = Object.fromEntries(CLES.map((k) => [k, (d[k] || 0) * m]));
      if (d.res) { part.sable += d.res * m * g[0]; part.limon += d.res * m * g[1]; part.argile += d.res * m * g[2]; }
      // argiles néoformées : 10 % en agrégats de la taille des limons
      if (d.argile && d !== ARGILE) { part.limon += d.argile * m * 0.1; part.argile -= d.argile * m * 0.1; }
      for (const k of CLES) somme[k] += part[k];
      detail.push({ id, g: m, pourquoi: d.pourquoi, part });
    }
    // arrondi à 5 g, total exact de 1 000 g
    const out = {};
    for (const k of CLES) { const v = Math.round(somme[k] / 5) * 5; if (v > 0) out[k] = v; }
    const ecart = 1000 - Object.values(out).reduce((s, v) => s + v, 0);
    const kmax = Object.keys(out).sort((a, b) => out[b] - out[a])[0];
    out[kmax] += ecart;
    return { produits: out, detail, grain: grainDe(r) };
  }
  // résumé écrit du bilan calculé : chaque produit de plus de 40 g, avec le minéral qui en fournit le plus
  const LIB = { sable: "de sable", limon: "de limons", argile: "d'argiles", oxydes: "d'oxydes de fer et d'aluminium", dissous: "partent dissous", autre: "repartent en CO₂" };
  function resume(r, c) {
    const nom = (id) => (typeof MINERAUX !== "undefined" && MINERAUX[id] ? MINERAUX[id].nom.split(" (")[0].toLowerCase() : id);
    const morceaux = Object.entries(c.produits).filter(([, v]) => v >= 40).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
      const top = c.detail.slice().sort((x, y) => y.part[k] - x.part[k])[0];
      return `${v} g ${LIB[k]} (apport principal : ${nom(top.id)})`;
    });
    return `Sur 1 kg : ${morceaux.join(", ")}.`;
  }
  const CHIFFRES = /\d[\d  ]*\s?(g|%)(?![a-zà-ü])/i;
  function appliquer(roches) {
    for (const r of roches) {
      const c = calcul(r);
      if (!c) continue;
      r.produitsAvant = r.produits;
      r.produitsNoteAvant = r.produitsNote;
      r.produits = c.produits;
      r.produitsDetail = c.detail;
      r.produitsGrain = c.grain;
      // les anciens commentaires chiffrés contrediraient le calcul : ils sont remplacés par le résumé calculé
      r.produitsNote = resume(r, c) + (r.produitsNote && !CHIFFRES.test(r.produitsNote) ? " " + r.produitsNote : "");
    }
  }
  const NOM_GRAIN = { sable: "de la taille des sables (ils restent entiers)", tres_grossier: "très grossiers", grossier: "grossiers", moyen: "moyens", fin: "fins", limon: "de la taille des limons", tres_fin: "très fins", mixte: "de toutes tailles" };
  // encart repliable : d'où viennent les chiffres
  function explicationHTML(r) {
    if (!r.produitsDetail) return "";
    const nom = (id) => (typeof MINERAUX !== "undefined" && MINERAUX[id] ? MINERAUX[id].nom.split(" (")[0] : id);
    const lignes = r.produitsDetail.slice().sort((a, b) => b.g - a.g).map((d) => `<li><b>${nom(d.id)}</b> (${Math.round(d.g)} g) : ${d.pourquoi.replace(/^[^:→(]{2,30} : /, "")}.</li>`).join("");
    return `<details class="reperes-climat"><summary>Comment ce bilan est calculé</summary>
      <p>Il est calculé à partir de la composition de la roche (« De quoi est-elle faite ? ») : chaque minéral se partage selon ce qu'il devient quand il s'altère complètement en climat tempéré. Les grains qui résistent, surtout le quartz, se répartissent entre sable, limons et argiles selon la taille des grains de la roche, ici ${NOM_GRAIN[r.produitsGrain]}. La masse d'eau fixée par les argiles n'est pas comptée ; les argiles formées sont comptées à 10 % en limons (agrégats).</p>
      <ul>${lignes}</ul>
      <p>Proportions tirées des réactions d'hydrolyse : par exemple 2 KAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 2 K⁺ + 4 H₄SiO₄ garde 46 % de la masse d'un feldspath potassique sous forme de kaolinite. Des ordres de grandeur : le vrai bilan dépend du climat, de la durée et de ce que l'eau emporte (calcul : alteration-bilan.js).</p>
    </details>`;
  }
  // ─────────────── réactions d'altération des minéraux de la roche (tâche D.4, 25/09/2026) ───────────────
  // Réactions équilibrées (atomes et charges vérifiés un par un), écrites pour le pôle pur de chaque minéral. Le carbone
  // repart en HCO₃⁻, la silice en H₄SiO₄ (silice dissoute, pas du quartz), le fer ferreux s'oxyde et précipite en goethite.
  const RX = {
    fk: ["Feldspath potassique → kaolinite", "2 KAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 2 K⁺ + 4 H₄SiO₄"],
    fkt: ["Feldspath potassique → gibbsite (climat tropical, altération poussée)", "KAlSi₃O₈ + H⁺ + 7 H₂O → Al(OH)₃ + K⁺ + 3 H₄SiO₄"],
    ab: ["Albite → kaolinite", "2 NaAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 2 Na⁺ + 4 H₄SiO₄"],
    an: ["Anorthite (plagioclase calcique) → kaolinite", "CaAl₂Si₂O₈ + 2 H⁺ + H₂O → Al₂Si₂O₅(OH)₄ + Ca²⁺"],
    ne: ["Néphéline → kaolinite", "2 NaAlSiO₄ + 2 H⁺ + H₂O → Al₂Si₂O₅(OH)₄ + 2 Na⁺"],
    ms: ["Muscovite → kaolinite", "2 KAl₂(AlSi₃O₁₀)(OH)₂ + 2 H⁺ + 3 H₂O → 3 Al₂Si₂O₅(OH)₄ + 2 K⁺"],
    bt: ["Biotite (pôle ferreux) → kaolinite + goethite", "4 KFe₃AlSi₃O₁₀(OH)₂ + 3 O₂ + 4 H⁺ + 20 H₂O → 2 Al₂Si₂O₅(OH)₄ + 12 FeOOH + 4 K⁺ + 8 H₄SiO₄"],
    fo: ["Olivine (forstérite) : dissolution par l'eau chargée de CO₂", "Mg₂SiO₄ + 4 CO₂ + 4 H₂O → 2 Mg²⁺ + 4 HCO₃⁻ + H₄SiO₄"],
    fa: ["Olivine (fayalite) : le fer s'oxyde", "2 Fe₂SiO₄ + O₂ + 6 H₂O → 4 FeOOH + 2 H₄SiO₄"],
    px: ["Pyroxène (diopside) : dissolution", "CaMgSi₂O₆ + 4 H⁺ + 2 H₂O → Ca²⁺ + Mg²⁺ + 2 H₄SiO₄"],
    amp: ["Amphibole (trémolite) : dissolution", "Ca₂Mg₅Si₈O₂₂(OH)₂ + 14 H⁺ + 8 H₂O → 2 Ca²⁺ + 5 Mg²⁺ + 8 H₄SiO₄"],
    serp: ["Serpentine : dissolution", "Mg₃Si₂O₅(OH)₄ + 6 H⁺ → 3 Mg²⁺ + 2 H₄SiO₄ + H₂O"],
    kao: ["Kaolinite → gibbsite (climat tropical, bauxites)", "Al₂Si₂O₅(OH)₄ + 5 H₂O → 2 Al(OH)₃ + 2 H₄SiO₄"],
    qz: ["Quartz : dissolution très lente", "SiO₂ + 2 H₂O → H₄SiO₄"],
    cc: ["Calcite : dissolution par l'eau chargée de CO₂", "CaCO₃ + CO₂ + H₂O → Ca²⁺ + 2 HCO₃⁻"],
    dol: ["Dolomite : dissolution", "CaMg(CO₃)₂ + 2 CO₂ + 2 H₂O → Ca²⁺ + Mg²⁺ + 4 HCO₃⁻"],
    sid: ["Sidérite → goethite", "4 FeCO₃ + O₂ + 2 H₂O → 4 FeOOH + 4 CO₂"],
    gy: ["Gypse : dissolution", "CaSO₄·2H₂O → Ca²⁺ + SO₄²⁻ + 2 H₂O"],
    anh: ["Anhydrite : dissolution", "CaSO₄ → Ca²⁺ + SO₄²⁻"],
    hl: ["Halite : dissolution", "NaCl → Na⁺ + Cl⁻"],
    syl: ["Sylvite : dissolution", "KCl → K⁺ + Cl⁻"],
    py: ["Pyrite → goethite + acide sulfurique", "4 FeS₂ + 15 O₂ + 10 H₂O → 4 FeOOH + 8 SO₄²⁻ + 16 H⁺"],
    ap: ["Apatite : dissolution", "Ca₅(PO₄)₃F + 6 H⁺ → 5 Ca²⁺ + 3 H₂PO₄⁻ + F⁻"],
    mo: ["Matière organique : oxydation", "CH₂O + O₂ → CO₂ + H₂O"],
    op: ["Opale : dissolution", "SiO₂·nH₂O + (2 − n) H₂O → H₄SiO₄"],
  };
  const RX_DE = {
    orthose: ["fk", "fkt"], sanidine: ["fk"], albite: ["ab"], plagioclases: ["ab", "an"], nepheline: ["ne"], hauyne: ["ne"],
    muscovite: ["ms"], biotite: ["bt"], phlogopite: ["bt"], zinnwaldite: ["bt"], olivine: ["fo", "fa"],
    pyroxenes: ["px"], augite: ["px"], diopside: ["px"], enstatite: ["px"], aegyrine: ["px"], omphacite: ["px"],
    amphiboles: ["amp"], hornblende: ["amp"], actinote: ["amp"], glaucophane: ["amp"], arfvedsonite: ["amp"], serpentine: ["serp"],
    kaolinite_m: ["kao"], quartz: ["qz"], calcedoine: ["qz"], opale: ["op"], calcite: ["cc"], aragonite: ["cc"], dolomite: ["dol"],
    siderite: ["sid"], gypse_m: ["gy"], anhydrite: ["anh"], halite_m: ["hl"], sylvite: ["syl"], pyrite: ["py"], apatite: ["ap"], matorg: ["mo"],
  };
  function reactionsHTML(r) {
    const L = (r.mineraux || []).slice().sort((a, b) => b[1] - a[1]);
    const tot = L.reduce((s, [, p]) => s + p, 0) || 1, vus = new Set(), items = [];
    for (const [id, p] of L) {
      if (p / tot < 0.03) continue;
      for (const k of RX_DE[id] || []) if (!vus.has(k)) { vus.add(k); items.push(RX[k]); }
    }
    if (!items.length) return "";
    return `<details class="reperes-climat"><summary>Les réactions d'altération de ses minéraux</summary>
      <p>L'eau de pluie, un peu acide (elle porte du CO₂ : H₂O + CO₂ → H⁺ + HCO₃⁻), attaque les liaisons des minéraux. Ce qui part en solution est écrit à droite en ions ; la silice part en silice dissoute (H₄SiO₄), pas en quartz ; le fer ferreux libéré s'oxyde et précipite sur place en goethite (FeOOH). Réactions écrites pour le pôle pur de chaque minéral (minéraux de plus de 3 % de la roche).</p>
      <ul class="rx">${items.map(([t, e]) => `<li><b>${t}</b><br><span class="rx-eq">${e}</span></li>`).join("")}</ul>
    </details>`;
  }

  // ─────────────── vitesse selon la pluie qui s'infiltre (tâche D.1, 25/09/2026) ───────────────
  // L'eau qui ruisselle n'altère presque rien : c'est l'eau qui traverse la roche qui l'altère. Évapotranspiration réelle par
  // la formule de Turc (1961) : ETR = P / √(0,9 + P²/L²), L = 300 + 25 T + 0,05 T³ ; infiltration I = (P − ETR) × (1 − part
  // ruisselée). Vitesse proportionnelle à I (le flux d'altération suit le débit d'eau : Maher 2011), et, pour les roches
  // silicatées, facteur d'Arrhenius d'énergie d'activation 59 kJ/mol (White et Blum 1995). Référence : P = 800 mm, T = 11 °C,
  // 30 % ruisselé, qui correspond au climat des vitesses données par la fiche (moyenne géométrique de vmin et vmax).
  const turc = (P, T) => { const L = 300 + 25 * T + 0.05 * T * T * T; return P / Math.sqrt(0.9 + (P * P) / (L * L)); };
  const infiltration = (P, T, k) => Math.max(0, (P - turc(P, T)) * (1 - k));
  const I_REF = infiltration(800, 11, 0.3);
  const arrh = (T) => Math.exp(-59000 / 8.314 * (1 / (T + 273.15) - 1 / (284.15)));
  const soluble = (r) => (r.produits && (r.produits.dissous || 0) >= 800);
  function pluieHTML(r) {
    const a = r.alteration;
    if (!a || a.vmin == null || a.vmax == null) return "";
    return `<div class="pluie" data-pluie>
      <h3>Et sous une autre pluie ?</h3>
      <p class="sub">C'est l'eau qui traverse la roche qui l'altère : celle qui s'évapore ou qui ruisselle n'y fait presque rien. La vitesse suit donc la pluie qui s'infiltre${soluble(r) ? "" : " et, pour une roche silicatée, la température, qui accélère les réactions"}.</p>
      <div class="pluie-ctrl">
        <label>Pluie <input type="range" min="200" max="2500" step="50" value="800" data-p> <b data-pv></b></label>
        <label>Température moyenne <input type="range" min="0" max="28" step="1" value="11" data-t> <b data-tv></b></label>
        <label>Part qui ruisselle <input type="range" min="0" max="90" step="5" value="30" data-k> <b data-kv></b></label>
      </div>
      <p class="pluie-eq">eau infiltrée = (pluie − évapotranspiration) × (1 − part ruisselée) = <b data-i></b><br>
      vitesse = vitesse de la fiche × (eau infiltrée ÷ ${Math.round(I_REF)} mm)${soluble(r) ? "" : " × facteur de température"} = <b data-v></b></p>
      <p class="pl-note">Évapotranspiration réelle par la formule de Turc (1961). Référence : 800 mm de pluie, 11 °C, 30 % ruisselés, soit ≈ ${Math.round(I_REF)} mm infiltrés par an, le climat tempéré des vitesses de la fiche. Vitesse proportionnelle à l'eau infiltrée (Maher 2011) ; pour les silicates, énergie d'activation de 59 kJ/mol (White et Blum 1995). Un ordre de grandeur : la nature de la roche, sa fissuration et la végétation comptent aussi.</p>
    </div>`;
  }
  function brancherPluie(racine, r) {
    const el = racine && racine.querySelector("[data-pluie]");
    if (!el) return;
    const a = r.alteration, vref = Math.sqrt(a.vmin * a.vmax), sol = soluble(r);
    const q = (s) => el.querySelector(s);
    const fmt = (x, d) => new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: d || 2 }).format(x);
    const maj = () => {
      const P = +q("[data-p]").value, T = +q("[data-t]").value, k = +q("[data-k]").value / 100;
      const etr = turc(P, T), I = infiltration(P, T, k);
      const v = vref * (I / I_REF) * (sol ? 1 : arrh(T));
      q("[data-pv]").textContent = `${fmt(P, 4)} mm/an`; q("[data-tv]").textContent = `${T} °C`; q("[data-kv]").textContent = `${Math.round(k * 100)} %`;
      q("[data-i]").textContent = `${fmt(Math.round(I), 4)} mm/an (évapotranspiration ≈ ${fmt(Math.round(etr), 4)} mm)`;
      q("[data-v]").textContent = I <= 0 ? "presque nulle (toute l'eau s'évapore)" : `≈ ${fmt(v)} mm/an (${fmt(v * 1000)} mm par millénaire)`;
    };
    el.addEventListener("input", maj);
    maj();
  }
  // ─────────────── sols possibles sur chaque matériau parental (tâche D.3, 25/09/2026) ───────────────
  // Références du Référentiel pédologique 2008 (AFES, Baize et Girard 2009), en majuscules comme dans le Référentiel. Posées par
  // grand type de matériau ; les 12 fiches qui avaient déjà leur champ `pedologie` (écrit à partir du Référentiel et de Baize)
  // le gardent.
  const SOLS = {
    acide: "Sur ce matériau acide, pauvre en calcium : surtout des ALOCRISOLS et des BRUNISOLS acides sous forêt et prairie, des RANKOSOLS peu épais sur les pentes, des PODZOSOLS sur les arènes sableuses sous lande ou résineux, et des RÉDOXISOLS dans les creux mal drainés.",
    intermediaire: "Des BRUNISOLS moyennement à bien pourvus en calcium et magnésium ; des ALOCRISOLS en altitude sous forte pluie ; sur les cendres et projections volcaniques récentes, des ANDOSOLS, légers et très riches en matière organique.",
    basique: "Des BRUNISOLS saturés, foncés et fertiles ; des ANDOSOLS sur les scories et cendres récentes (chaîne des Puys) ; des VERTISOLS dans les bas-fonds argileux ; des FERSIALSOLS rouges sous climat méditerranéen.",
    ultrabasique: "Des MAGNÉSISOLS : sols très riches en magnésium, souvent en nickel et en chrome, pauvres en calcium et en potassium, qui portent une flore très particulière ; des RÉGOSOLS et LITHOSOLS minces sur les pentes.",
    carbonate: "Des RENDOSOLS et RENDISOLS peu épais, pleins de cailloux calcaires ; des CALCOSOLS puis des CALCISOLS quand le sol s'épaissit et perd son calcaire ; sur les vieux plateaux, des sols rouges décarbonatés (FERSIALSOLS).",
    marne: "Des CALCOSOLS et CALCISOLS argileux, des VERTISOLS là où les argiles gonflent, et sur les pentes nues des RÉGOSOLS entaillés en ravines (badlands des Terres Noires).",
    argileux: "Des PÉLOSOLS et des VERTISOLS lourds, souvent engorgés d'eau en hiver (RÉDOXISOLS, RÉDUCTISOLS dans les fonds).",
    schisteux: "Des BRUNISOLS et ALOCRISOLS acides et caillouteux, des RANKOSOLS minces sur les pentes, des RÉDOXISOLS sur les replats.",
    sableux: "Des ARÉNOSOLS et PODZOSOLS sur les sables pauvres (landes, forêts de pins) ; des ALOCRISOLS et BRUNISOLS acides sur les grès ; des LUVISOLS quand un placage de limon les recouvre.",
    mixte: "Des BRUNISOLS et LUVISOLS ; des RÉDOXISOLS là où les niveaux argileux retiennent l'eau ; des CALCOSOLS si la roche contient du calcaire.",
    silice: "Roche siliceuse et dure : sols minces et caillouteux (RANKOSOLS, LITHOSOLS) sur les affleurements, ALOCRISOLS et PODZOSOLS acides ; souvent couverte de limons portant des LUVISOLS.",
    gypse: "Des GYPSOSOLS, rares en France (affleurements du Trias alpin et provençal), pauvres et secs, à flore spécialisée.",
    sel: "Presque jamais à l'affleurement sous le climat de la France : la roche est dissoute avant de porter un sol. En climat aride, elle donne des SALISOLS.",
    charbon: "Rarement à l'affleurement ; sur les déblais des mines et les terrils, des ANTHROPOSOLS, acides quand ils contiennent de la pyrite.",
    lateritique: "Formations fossiles en France : elles portent des FERSIALSOLS et des sols rouges argileux, ou restent à nu en cuirasse sous des sols très minces.",
    ferrugineux: "À l'affleurement, des sols minces et caillouteux (LITHOSOLS, RÉGOSOLS), rouges d'oxydes de fer.",
    phosphate: "Dans les poches karstiques, des sols rouges argileux (FERSIALSOLS), riches en phosphore.",
    moraine: "Sur une telle moraine, si elle affleurait : des BRUNISOLS et LUVISOLS, des RÉDOXISOLS là où la matrice argileuse retient l'eau.",
  };
  const SOL_DE = {
    acide: "granite granodiorite tonalite trondhjemite microgranite aplite pegmatite porphyre gneiss migmatite leptynite granulite_meta charnockite micaschiste greisen rhyolite ignimbrite dacite mylonite cataclasite corneenne arkose impactite pseudotachylite fenite",
    intermediaire: "diorite monzonite monzodiorite syenite trachyte trachyandesite andesite latite phonolite syenite_nephelinique microdiorite lamprophyre tuf_volcanique breche_volcanique obsidienne",
    basique: "basalte gabbro dolerite trachybasalte basanite pouzzolane essexite hornblendite pyroxenite amphibolite eclogite schiste_vert schiste_bleu spilite rodingite picrite foidolite",
    ultrabasique: "peridotite serpentinite komatiite kimberlite",
    carbonate: "calcaire craie dolomie tuffeau falun travertin marbre cargneule breche_sedimentaire carbonatite skarn calcschiste",
    marne: "marne", argileux: "argile", schisteux: "ardoise schiste_bitumineux siltite",
    sableux: "sable gres quartzite conglomerat", mixte: "grauwacke flysch molasse",
    silice: "meuliere silex radiolarite gaize diatomite", gypse: "gypse", sel: "sel sylvinite anhydrite",
    charbon: "houille lignite anthracite", lateritique: "laterite bauxite", ferrugineux: "roche_ferrifere", phosphate: "phosphorite", moraine: "tillite",
  };
  const SOL = {}; for (const [g, l] of Object.entries(SOL_DE)) for (const id of l.split(" ")) SOL[id] = g;
  function appliquerSols(roches) {
    for (const r of roches) if (!r.pedologie && SOL[r.id]) { r.pedologie = SOLS[SOL[r.id]]; r.pedologieAuto = true; }
  }
  window.BilanAlteration = { appliquerSols, SOLS, SOL, calcul, appliquer, explicationHTML, reactionsHTML, RX, RX_DE, pluieHTML, brancherPluie, turc, DEVENIR, GRAIN };
})();
