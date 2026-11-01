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
  // grains d'un minéral plus gros que ceux de la roche : rognons de silex de la craie, centimétriques à décimétriques
  const GRAIN_MIN = { craie: { calcedoine: "tres_grossier" } };
  // devenir d'1 g de minéral : res = part qui reste en grains (répartie selon GRAIN), puis parts directes
  const R = (o) => o;
  const PYROX = R({ argile: 0.35, oxydes: 0.1, dissous: 0.55, pourquoi: "Le pyroxène donne des smectites et des oxydes de fer, tandis que le calcium, le magnésium et la silice passent en solution." });
  const AMPH = R({ argile: 0.4, oxydes: 0.12, dissous: 0.48, pourquoi: "L'amphibole se change en argiles et en oxydes de fer ; le reste est entraîné en solution." });
  const AL2SIO5 = R({ res: 0.8, argile: 0.15, dissous: 0.05, pourquoi: "Très résistant, il subsiste surtout sous forme de grains." });
  const CARB = R({ dissous: 1, pourquoi: "carbonate : entièrement dissous (Ca²⁺, Mg²⁺, HCO₃⁻)" });
  const SEL = R({ dissous: 1, pourquoi: "sel soluble : entièrement dissous" });
  const ARGILE = R({ argile: 0.88, limon: 0.12, pourquoi: "minéral argileux hérité : reste argile" });
  const DEVENIR = {
    quartz: R({ res: 0.99, dissous: 0.01, pourquoi: "quartz : presque insoluble, reste en grains" }),
    calcedoine: R({ res: 0.95, dissous: 0.05, pourquoi: "La silice microcristalline demeure sous forme de grains et d'éclats." }),
    opale: R({ res: 0.5, dissous: 0.5, pourquoi: "L'opale se dissout pour moitié, le reste subsistant sous forme de grains fins." }),
    orthose: R({ argile: 0.5, dissous: 0.5, pourquoi: "Le feldspath potassique se transforme en kaolinite ou en illite, et libère potassium et silice en solution (2 KAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 2 K⁺ + 4 H₄SiO₄)." }),
    sanidine: R({ argile: 0.5, dissous: 0.5, pourquoi: "feldspath potassique → argile ; potassium et silice dissous" }),
    albite: R({ argile: 0.5, dissous: 0.5, pourquoi: "albite → kaolinite ; sodium et silice dissous" }),
    plagioclases: R({ argile: 0.62, dissous: 0.38, pourquoi: "Le plagioclase donne de la kaolinite ou de la smectite, et libère calcium, sodium et silice en solution." }),
    nepheline: R({ argile: 0.9, dissous: 0.1, pourquoi: "Très altérable, la néphéline se change en kaolinite ou en halloysite ; seul le sodium part en solution (2 NaAlSiO₄ + 2 H⁺ + H₂O → Al₂Si₂O₅(OH)₄ + 2 Na⁺ : 91 % de la masse reste en argile)." }),
    hauyne: R({ argile: 0.7, dissous: 0.3, pourquoi: "Très altérable, l'haüyne se change en kaolinite ; sodium, calcium et sulfate partent en solution (≈ 70 % de la masse reste en argile)." }),
    muscovite: R({ limon: 0.3, argile: 0.55, dissous: 0.15, pourquoi: "La muscovite conserve en partie ses paillettes ; le reste se transforme en illite ou en kaolinite." }),
    biotite: R({ argile: 0.6, oxydes: 0.12, dissous: 0.28, pourquoi: "La biotite se change en vermiculite, en kaolinite et en oxydes de fer ; le potassium et le magnésium passent en solution." }),
    phlogopite: R({ argile: 0.62, oxydes: 0.03, dissous: 0.35, pourquoi: "La phlogopite se transforme en vermiculite, et libère potassium et magnésium en solution." }),
    zinnwaldite: R({ argile: 0.6, oxydes: 0.08, dissous: 0.32, pourquoi: "Le mica lithinifère donne des argiles et libère lithium et potassium en solution." }),
    glauconie: R({ argile: 0.7, oxydes: 0.15, dissous: 0.15, pourquoi: "glauconie → argiles + oxydes de fer" }),
    chlorite_m: R({ argile: 0.7, oxydes: 0.12, dissous: 0.18, pourquoi: "La chlorite se change en vermiculite ou en kaolinite, accompagnées d'oxydes de fer." }),
    illite_m: ARGILE, kaolinite_m: ARGILE, smectites_m: ARGILE,
    serpentine: R({ argile: 0.35, oxydes: 0.08, dissous: 0.57, pourquoi: "La serpentine donne des smectites et des oxydes, et libère une grande quantité de magnésium en solution." }),
    olivine: R({ argile: 0.15, oxydes: 0.12, dissous: 0.73, pourquoi: "Très altérable, l'olivine libère magnésium et silice en solution ; le fer se fixe dans des oxydes." }),
    pyroxenes: PYROX, augite: PYROX, diopside: PYROX, enstatite: PYROX, aegyrine: PYROX, omphacite: PYROX,
    wollastonite: R({ argile: 0.1, dissous: 0.9, pourquoi: "La wollastonite se dissout presque entièrement, calcium et silice passant en solution." }),
    amphiboles: AMPH, hornblende: AMPH, actinote: AMPH, glaucophane: AMPH, arfvedsonite: AMPH,
    grenat: R({ res: 0.3, argile: 0.25, oxydes: 0.15, dissous: 0.3, pourquoi: "Le grenat résiste en partie ; le reste se change en argiles et en oxydes." }),
    andradite: R({ res: 0.3, argile: 0.2, oxydes: 0.2, dissous: 0.3, pourquoi: "Le grenat ferrifère résiste en partie ; le reste donne des oxydes et des éléments dissous." }),
    grossulaire: R({ res: 0.3, argile: 0.25, dissous: 0.45, pourquoi: "grenat calcique : résiste en partie" }),
    epidote: R({ argile: 0.4, oxydes: 0.08, dissous: 0.52, pourquoi: "épidote → argiles + oxydes ; calcium dissous" }),
    vesuvianite: R({ argile: 0.35, oxydes: 0.05, dissous: 0.6, pourquoi: "vésuvianite → argiles ; calcium dissous" }),
    lawsonite: R({ argile: 0.5, dissous: 0.5, pourquoi: "lawsonite → kaolinite ; calcium dissous" }),
    cordierite: R({ argile: 0.5, oxydes: 0.03, dissous: 0.47, pourquoi: "cordiérite → argiles (pinite) ; magnésium dissous" }),
    titanite: R({ res: 0.4, oxydes: 0.3, dissous: 0.3, pourquoi: "titanite → oxydes de titane (anatase) ; calcium dissous" }),
    andalousite: AL2SIO5, sillimanite: AL2SIO5, disthene: AL2SIO5, topaze: AL2SIO5, beryl: AL2SIO5,
    tourmaline: R({ res: 0.95, dissous: 0.05, pourquoi: "tourmaline : presque inaltérable" }),
    calcite: CARB, aragonite: CARB, dolomite: CARB,
    siderite: R({ oxydes: 0.6, dissous: 0.4, pourquoi: "La sidérite se transforme en goethite, et le carbonate passe en solution." }),
    gypse_m: SEL, anhydrite: SEL, halite_m: SEL, sylvite: SEL,
    fluorine: R({ res: 0.1, dissous: 0.9, pourquoi: "fluorine : lentement dissoute" }),
    apatite: R({ res: 0.6, dissous: 0.4, pourquoi: "Plus résistante que les carbonates, l'apatite s'accumule dans le résidu (gisements résiduels des carbonatites et des phosphorites) ; en sol acide, elle cède lentement phosphate et calcium." }),
    pyrite: R({ oxydes: 0.6, dissous: 0.4, pourquoi: "La pyrite se change en goethite, et le soufre est évacué en sulfate." }),
    magnetite: R({ oxydes: 1, pourquoi: "L'oxyde de fer subsiste et se transforme en hématite ou en goethite." }),
    hematite: R({ oxydes: 1, pourquoi: "oxyde de fer : reste" }), goethite: R({ oxydes: 1, pourquoi: "oxyde de fer : reste" }),
    gibbsite: R({ oxydes: 1, pourquoi: "hydroxyde d'aluminium : reste" }),
    chromite: R({ oxydes: 1, pourquoi: "oxyde de chrome : inaltérable" }), rutile: R({ oxydes: 1, pourquoi: "oxyde de titane : inaltérable" }),
    cassiterite: R({ oxydes: 1, pourquoi: "oxyde d'étain : inaltérable" }), pyrochlore: R({ oxydes: 1, pourquoi: "oxyde de niobium : résistant" }),
    graphite: R({ limon: 1, pourquoi: "graphite : inaltéré, en paillettes" }),
    matorg: R({ autre: 1, pourquoi: "La matière organique s'oxyde et repart sous forme de CO₂." }),
    verre: R({ argile: 0.4, oxydes: 0.05, dissous: 0.55, pourquoi: "verre volcanique → halloysite, allophane, smectite ; silice et alcalins dissous" }),
    // minéraux des météorites (B.5, 08/10/2026)
    fer_natif: R({ oxydes: 0.9, dissous: 0.1, pourquoi: "Le fer-nickel se rouille en goethite et en akaganéite ; le nickel est entraîné par l'eau." }),
    taenite: R({ oxydes: 0.65, dissous: 0.35, pourquoi: "La taénite, alliage de fer riche en nickel, rouille par son fer, tandis que le nickel part avec l'eau." }),
    troilite: R({ oxydes: 0.6, dissous: 0.4, pourquoi: "Le sulfure de fer laisse son fer en oxydes, et son soufre est emporté en sulfate." }),
    pyrrhotite: R({ oxydes: 0.6, dissous: 0.4, pourquoi: "Le sulfure de fer laisse son fer en oxydes, et son soufre est emporté en sulfate." }),
    schreibersite: R({ oxydes: 0.75, dissous: 0.25, pourquoi: "Le phosphure de fer et de nickel donne des oxydes de fer ; le phosphore et le nickel passent en solution." }),
    cohenite: R({ oxydes: 0.9, autre: 0.1, pourquoi: "Le carbure de fer laisse son fer en oxydes, et son carbone est oxydé en CO₂." }),
    oldhamite: R({ dissous: 1, pourquoi: "Le sulfure de calcium se dissout entièrement." }),
    daubreelite: R({ oxydes: 0.7, dissous: 0.3, pourquoi: "Le sulfure de fer et de chrome conserve le chrome et le fer sous forme d'oxydes, le soufre étant emporté." }),
    merrillite: R({ res: 0.1, dissous: 0.9, pourquoi: "phosphate de calcium : dissous lentement" }),
    moissanite: R({ res: 1, pourquoi: "carbure de silicium : inaltérable" }),
    pigeonite: PYROX, tridymite: R({ res: 0.97, dissous: 0.03, pourquoi: "La silice de haute température subsiste sous forme de grains." }),
    cristobalite: R({ res: 0.95, dissous: 0.05, pourquoi: "La silice de haute température subsiste sous forme de grains." }),
    ilmenite: R({ oxydes: 1, pourquoi: "L'oxyde de fer et de titane est très résistant." }),
    spinelle: R({ oxydes: 1, pourquoi: "Le spinelle, oxyde de magnésium et d'aluminium, est très résistant." }),
  };
  if (!DEVENIR.anorthite && DEVENIR.plagioclases) DEVENIR.anorthite = DEVENIR.plagioclases;
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
      const gm = (GRAIN_MIN[r.id] || {})[id], gg = gm ? TAILLES[gm] : g;
      if (d.res) { part.sable += d.res * m * gg[0]; part.limon += d.res * m * gg[1]; part.argile += d.res * m * gg[2]; }
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
      // fraction < 2 µm venue de grains résiduels (silice, quartz) : ce ne sont pas des minéraux argileux
      const lib = k === "argile" && !(DEVENIR[top.id] || DEFAUT).argile ? "de particules de moins de 2 µm" : LIB[k];
      return `${v} g ${lib} (apport principal : ${nom(top.id)})`;
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
  const NOM_GRAIN = { sable: "Ils sont de la taille des sables et demeurent intacts.", tres_grossier: "très grossiers", grossier: "grossiers", moyen: "moyens", fin: "fins", limon: "de la taille des limons", tres_fin: "très fins", mixte: "de toutes tailles" };
  // encart repliable : d'où viennent les chiffres
  function explicationHTML(r) {
    if (!r.produitsDetail) return "";
    const nom = (id) => (typeof MINERAUX !== "undefined" && MINERAUX[id] ? MINERAUX[id].nom.split(" (")[0] : id);
    const lignes = r.produitsDetail.slice().sort((a, b) => b.g - a.g).map((d) => `<li><b>${nom(d.id)}</b> (${Math.round(d.g)} g) : ${d.pourquoi.replace(/^[^:→(]{2,30} : /, "")}.</li>`).join("");
    return `<details class="reperes-climat"><summary>Mode de calcul du bilan</summary>
      <p>La composition de la roche (« De quoi est-elle faite ? ») fixe ce que chaque minéral devient lorsqu'il s'altère complètement en climat tempéré. Les grains résistants, surtout le quartz, se répartissent entre sables, limons et argiles selon la taille des grains de la roche, ici ${NOM_GRAIN[r.produitsGrain]}. L'eau fixée par les argiles n'entre pas dans le bilan, et les argiles néoformées sont comptées à 10 % en limons (agrégats).</p>
      <ul>${lignes}</ul>
      <p>Les proportions proviennent des réactions d'hydrolyse : par exemple, 2 KAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 2 K⁺ + 4 H₄SiO₄ conserve 46 % de la masse d'un feldspath potassique sous forme de kaolinite. Ces chiffres sont des ordres de grandeur : le bilan réel dépend du climat, de la durée et de ce que l'eau emporte (calcul : alteration-bilan.js).</p>
    </details>`;
  }
  // ─────────────── réactions d'altération des minéraux de la roche (tâche D.4, 25/09/2026) ───────────────
  // Réactions équilibrées (atomes et charges vérifiés un par un), écrites pour le pôle pur de chaque minéral. Le carbone
  // repart en HCO₃⁻, la silice en H₄SiO₄ (silice dissoute, pas du quartz), le fer ferreux s'oxyde et précipite en goethite.
  const RX = {
    fk: ["Feldspath potassique → kaolinite", "2 KAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 2 K⁺ + 4 H₄SiO₄"],
    fkt: ["Le feldspath potassique donne de la gibbsite, sous climat tropical et par altération poussée.", "KAlSi₃O₈ + H⁺ + 7 H₂O → Al(OH)₃ + K⁺ + 3 H₄SiO₄"],
    ab: ["Albite → kaolinite", "2 NaAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 2 Na⁺ + 4 H₄SiO₄"],
    an: ["Anorthite (plagioclase calcique) → kaolinite", "CaAl₂Si₂O₈ + 2 H⁺ + H₂O → Al₂Si₂O₅(OH)₄ + Ca²⁺"],
    ne: ["Néphéline → kaolinite", "2 NaAlSiO₄ + 2 H⁺ + H₂O → Al₂Si₂O₅(OH)₄ + 2 Na⁺"],
    ms: ["Muscovite → kaolinite", "2 KAl₂(AlSi₃O₁₀)(OH)₂ + 2 H⁺ + 3 H₂O → 3 Al₂Si₂O₅(OH)₄ + 2 K⁺"],
    bt: ["Biotite (pôle ferreux) → kaolinite + goethite", "4 KFe₃AlSi₃O₁₀(OH)₂ + 3 O₂ + 4 H⁺ + 20 H₂O → 2 Al₂Si₂O₅(OH)₄ + 12 FeOOH + 4 K⁺ + 8 H₄SiO₄"],
    fo: ["L'olivine (forstérite) se dissout dans l'eau chargée de CO₂.", "Mg₂SiO₄ + 4 CO₂ + 4 H₂O → 2 Mg²⁺ + 4 HCO₃⁻ + H₄SiO₄"],
    fa: ["Olivine (fayalite) : le fer s'oxyde", "2 Fe₂SiO₄ + O₂ + 6 H₂O → 4 FeOOH + 2 H₄SiO₄"],
    px: ["Pyroxène (diopside) : dissolution", "CaMgSi₂O₆ + 4 H⁺ + 2 H₂O → Ca²⁺ + Mg²⁺ + 2 H₄SiO₄"],
    amp: ["Amphibole (trémolite) : dissolution", "Ca₂Mg₅Si₈O₂₂(OH)₂ + 14 H⁺ + 8 H₂O → 2 Ca²⁺ + 5 Mg²⁺ + 8 H₄SiO₄"],
    serp: ["Serpentine : dissolution", "Mg₃Si₂O₅(OH)₄ + 6 H⁺ → 3 Mg²⁺ + 2 H₄SiO₄ + H₂O"],
    kao: ["Kaolinite → gibbsite (climat tropical, bauxites)", "Al₂Si₂O₅(OH)₄ + 5 H₂O → 2 Al(OH)₃ + 2 H₄SiO₄"],
    qz: ["Quartz : dissolution très lente", "SiO₂ + 2 H₂O → H₄SiO₄"],
    cc: ["La calcite se dissout dans l'eau chargée de CO₂.", "CaCO₃ + CO₂ + H₂O → Ca²⁺ + 2 HCO₃⁻"],
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
    return `<details class="reperes-climat"><summary>Réactions d'altération des minéraux de la roche</summary>
      <p>L'eau de pluie, légèrement acide puisqu'elle porte du CO₂ (H₂O + CO₂ → H⁺ + HCO₃⁻), attaque les liaisons des minéraux. Les espèces passées en solution figurent à droite sous forme d'ions ; la silice part sous forme de silice dissoute (H₄SiO₄) et non de quartz ; le fer ferreux libéré s'oxyde et précipite sur place en goethite (FeOOH). Les réactions concernent le pôle pur de chaque minéral présent à plus de 3 % dans la roche.</p>
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
      <p class="sub">Ce qui altère la roche, c'est l'eau qui la traverse : l'eau qui s'évapore ou ruisselle n'agit presque pas. La vitesse suit donc la pluie infiltrée${soluble(r) ? "" : " ainsi que, pour une roche silicatée, la température, dont l'effet accélère les réactions"}.</p>
      <div class="pluie-ctrl">
        <label>Pluie <input type="range" min="200" max="2500" step="50" value="800" data-p> <b data-pv></b></label>
        <label>Température moyenne <input type="range" min="0" max="28" step="1" value="11" data-t> <b data-tv></b></label>
        <label>Part qui ruisselle <input type="range" min="0" max="90" step="5" value="30" data-k> <b data-kv></b></label>
      </div>
      <p class="pluie-eq">eau infiltrée = (pluie − évapotranspiration) × (1 − part ruisselée) = <b data-i></b><br>
      vitesse = vitesse de la fiche × (eau infiltrée ÷ ${Math.round(I_REF)} mm)${soluble(r) ? "" : " × facteur de température"} = <b data-v></b></p>
      <p class="pl-note">L'évapotranspiration réelle est calculée selon la formule de Turc (1961). Référence : 800 mm de pluie, 11 °C et 30 % ruisselés, soit ≈ ${Math.round(I_REF)} mm infiltrés chaque année, climat tempéré auquel se rapportent les vitesses de la fiche. La vitesse est proportionnelle à l'eau infiltrée (Maher 2011) ; pour les silicates, l'énergie d'activation vaut 59 kJ/mol (White et Blum 1995). Un ordre de grandeur seulement : la nature de la roche, sa fissuration et la végétation interviennent aussi.</p>
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
  window.BilanAlteration = { calcul, appliquer, explicationHTML, reactionsHTML, RX, RX_DE, pluieHTML, brancherPluie, turc, DEVENIR, GRAIN };
})();
