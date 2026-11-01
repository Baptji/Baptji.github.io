// ============================================================
// CLASSES IX.D (inosilicates : pyroxènes, pyroxénoïdes, amphiboles) et IX.E (phyllosilicates non argileux) : formes
// cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026. Chargé après soro-cyclosilicates-formes.js.
// Clinopyroxènes C2/c (a 9,7 · b 8,9 · c 5,25) et amphiboles C2/m (a 9,8 · b 18 · c 5,3) dans les mailles des ouvrages : prismes
// selon c, {110} à ≈ 87° (pyroxènes) ou ≈ 124° (amphiboles). Micas : tablettes pseudo-hexagonales {001} + {110} + {010} (b ≈ a√3).
// Les minéraux argileux (kaolinite, illite, smectites) renvoient à la partie Argiles.
// ============================================================

(function () {
  const CPX = (nom, couleur, m, cod, note, dS) => ({
    nom, couleur, systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C", maille: m, mailleSource: cod,
    azimut: 24, elevation: 14,
    facies: [{ nom: "Prisme trapu", formes: [
      { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
      { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.12 }, { sym: "s", hkl: [-1, 1, 1], nom: "prisme terminal", d: dS || 1.5 }], note }],
    clivages: [{ hkl: [1, 1, 0], qualite: "bon", nom: "prismatique {110}, à ≈ 87°", pas: 0.26 }],
  });
  const AMPH = (nom, couleur, m, cod, note, dR) => ({
    nom, couleur, systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C", maille: m, mailleSource: cod,
    azimut: 24, elevation: 14,
    facies: [{ nom: "Prisme", formes: [
      { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.05 },
      { sym: "r", hkl: [0, 1, 1], nom: "prisme terminal", d: dR || 1.8 }], note }],
    clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "prismatique {110}, à ≈ 124°", pas: 0.24 }],
  });
  const MICA = (nom, couleur, m, cod, reseau, note, dc) => ({
    nom, couleur, systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: reseau || "C", maille: m, mailleSource: cod,
    azimut: 20, elevation: 22,
    facies: [{ nom: "Tablette pseudo-hexagonale", formes: [
      { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: dc || 0.3 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
      { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }], note }],
    clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "basal, entre les feuillets", pas: 0.12 }],
  });

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {
    // ── pyroxènes ──
    enstatite: {
      nom: "Enstatite", couleur: "#8a8a5a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [18.21, 8.812, 5.178, 90, 90, 90], mailleSource: "cod9008164", azimut: 24, elevation: 14,
      facies: [{ nom: "Prisme", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
        { sym: "m", hkl: [2, 1, 0], nom: "prisme", d: 1.12 }, { sym: "p", hkl: [2, 1, 1], nom: "bipyramide", d: 1.7 }],
        note: "Cristaux prismatiques courts, à huit faces ; dans les péridotites, il forme des grains brun-vert à éclat bronzé (la bronzite)." }],
      clivages: [{ hkl: [2, 1, 0], qualite: "bon", nom: "prismatique {210}, à ≈ 88°", pas: 0.26 }],
    },
    diopside: CPX("Diopside", "#5a8a4a", [9.7456, 8.9198, 5.2516, 90, 105.86, 90], "cod9000797",
      "Section quasi carrée des prismes (quatre faces a et b, angles tronqués par m), extrémités en toit : les plus beaux spécimens viennent des skarns du val d'Ala (Piémont)."),
    hedenbergite: CPX("Hédenbergite", "#2a3a2a", [9.806, 9.068, 5.238, 90, 105.92, 90], "cod9016927",
      "Cristaux prismatiques noirs à vert sombre, disposés fréquemment en gerbes rayonnantes dans les skarns riches en fer."),
    augite: CPX("Augite", "#2a2a24", [9.7504, 8.9015, 5.27444, 90, 106.016, 90], "cod9009664",
      "Cristaux noirs trapus à section octogonale, terminés en toit : on trouve des cristaux isolés dans les tufs volcaniques (Vésuve, Auvergne), et des grains dans les basaltes. Les macles sur {100} sont fréquentes."),
    aegyrine: CPX("Aegyrine", "#1f2a1f", [9.6623, 8.8, 5.2956, 90, 107.579, 90], "cod9010326",
      "Les syénites et les pegmatites alcalines (Mont Saint-Hilaire, Malawi) abritent de longs prismes pointus, d'un vert presque noir.", 2.6),
    spodumene: CPX("Spodumène", "#c8b8d0", [9.479, 8.403, 5.223, 90, 110.14, 90], "cod9004744",
      "Cristaux prismatiques aplatis selon a, striés, atteignant parfois plusieurs mètres dans les pegmatites (Etta, Dakota) ; la kunzite est rose, l'hiddénite verte.", 2.4),

    // ── amphiboles ──
    tremolite: AMPH("Trémolite", "#d8d8c8", [9.8359, 18.045, 5.2752, 90, 104.75, 90], "cod9002334",
      "Cristaux prismatiques blancs et allongés, fréquemment groupés en gerbes ou en fibres (amiante trémolite) dans les marbres dolomitiques.", 2.6),
    actinote: AMPH("Actinote", "#5a8a5a", [9.881, 18.139, 5.298, 90, 104.78, 90], "cod9001926",
      "Cristaux prismatiques vert vif, disposés en baguettes rayonnantes (son nom grec signifie « rayon ») ; sa variété à fibres entremêlées est la néphrite, du jade.", 2.6),
    hornblende: AMPH("Hornblende", "#1f2a1f", [9.857, 18.112, 5.309, 90, 104.81, 90], "cod9004433",
      "Prismes noirs à six faces (quatre faces m, deux faces b), prolongés par un toit à faces r. Vus en coupe, ils dessinent un losange de 124° et 56°, critère qui les sépare des pyroxènes."),
    pargasite: AMPH("Pargasite", "#3a5a3a", [9.9, 17.95, 5.311, 90, 105.42, 90], "cod9001241",
      "Dans les marbres et les péridotites (Pargas, Finlande), on rencontre des prismes trapus, brun-vert."),
    kaersutite: AMPH("Kaersutite", "#3a2a1f", [9.718, 17.87, 5.259, 90, 105.8, 90], "cod9014020",
      "Cristaux prismatiques brun noir, isolés dans les tufs basaltiques ou sous forme de mégacristaux."),
    glaucophane: AMPH("Glaucophane", "#3a4a8a", [9.541, 17.74, 5.295, 90, 103.67, 90], "cod9000177",
      "Aiguilles bleu lavande qui donnent leur couleur aux schistes bleus (île de Groix).", 2.4),
    arfvedsonite: AMPH("Arfvedsonite", "#1a1f2a", [10.007, 18.077, 5.332, 90, 104.101, 90], "cod9004105",
      "De longs cristaux noirs, prismatiques, se rencontrent dans les syénites néphéliniques et les granites alcalins (Groenland, Kola).", 2.4),
    riebeckite: AMPH("Riébeckite", "#2a2f4a", [9.811, 18.013, 5.326, 90, 103.68, 90], "cod9004132",
      "Cristaux prismatiques bleu noir présents dans les granites alcalins (granite de Corse, microgranite d'Ailsa Craig) ; sa variété fibreuse constitue l'amiante bleu, ou crocidolite.", 2.6),

    // ── micas, chlorites ──
    muscovite: MICA("Muscovite", "#d8d0b0", [5.1988, 9.0266, 20.1058, 90, 95.782, 90], "cod9000837", "C",
      "Tablettes hexagonales (dites « livres »), incolores à brun clair, dans les pegmatites ; dans les granites et les micaschistes, elle forme des paillettes argentées."),
    paragonite: MICA("Paragonite", "#e0d8c0", [5.128, 8.898, 19.287, 90, 94.35, 90], "cod9000905", "C",
      "Paillettes blanches, difficiles à différencier de la muscovite sans analyse chimique ; son nom grec signifie « trompeuse »."),
    biotite: MICA("Biotite", "#2a1f1a", [5.355, 9.251, 10.246, 90, 100.15, 90], "cod9001266", "C",
      "Tablettes hexagonales noires, disposées en piles ; dans les granites, elle prend la forme de paillettes noires et brillantes."),
    phlogopite: MICA("Phlogopite", "#a8783a", [5.3158, 9.2036, 10.31, 90, 99.891, 90], "cod9002829", "C",
      "Les marbres et les kimberlites contiennent des tablettes hexagonales à reflets cuivrés, brun doré ; son nom grec renvoie à la « couleur de feu »."),
    lepidolite: MICA("Lépidolite", "#c8a0c8", [5.209, 9.011, 10.149, 90, 100.77, 90], "cod9000834", "C",
      "Des tablettes lilas s'agrègent fréquemment en masses écailleuses, d'où son nom grec de « pierre en écailles »."),
    zinnwaldite: MICA("Zinnwaldite", "#7a6a5a", [5.296, 9.14, 10.096, 90, 100.83, 90], "cod9000593", "C",
      "Tablettes gris-brun à argentées, caractéristiques des greisens d'étain (Zinnwald, Erzgebirge)."),
    margarite: MICA("Margarite", "#d8c0c0", [5.108, 8.844, 19.156, 90, 95.48, 90], "cod9016300", "C",
      "Paillettes rosées et nacrées (du grec « perle ») ; ses lames se brisent au lieu de se courber."),
    clintonite: MICA("Clintonite", "#a88a3a", [5.2, 9.005, 9.795, 90, 100.24, 90], "cod9001883", "C",
      "On observe dans les skarns et les marbres des tablettes allant du brun-rouge au brun-jaune, sans grande cohésion."),
    clinochlore: MICA("Clinochlore", "#4a7a4a", [5.327, 9.233, 14.381, 90.2, 97.2, 89.97], "cod9010129", "C",
      "Tablettes hexagonales vertes, flexibles mais non élastiques, c'est-à-dire qu'elles ne reprennent pas leur forme initiale ; on les rencontre dans les fentes alpines et les serpentinites."),

    // ── apophyllite ──
    apophyllite: {
      nom: "Apophyllite", couleur: "#e8eef0", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [8.9639, 8.9639, 15.754, 90, 90, 90], mailleSource: "cod9005146", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme et bipyramide", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.15 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.6 }],
        note: "Cristaux prismatiques à section carrée, coiffés d'une pyramide, transparents et d'allure presque cubique : les géodes des basaltes du Deccan (Inde) en sont tapissées. Le clivage basal est parfait." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "basal", pas: 0.2 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    morimoto: "Morimoto N. (1988). « Nomenclature of pyroxenes ». <i>Mineralogical Magazine</i> 52, p. 535–550.",
    hawthorne: "Hawthorne F. C. et al. (2012). « Nomenclature of the amphibole supergroup ». <i>American Mineralogist</i> 97, p. 2031–2048.",
    london: "London D. (2008). <i>Pegmatites</i>. Canadian Mineralogist, Special Publication 10.",
    evans: "Evans B. W. (2004). « The serpentinite multisystem revisited: chrysotile is metastable ». <i>International Geology Review</i> 46, p. 479–506.",
  };
  const PEG = "L'atlas n'offre pas de diagramme ici : la pegmatite se forme à partir d'un liquide saturé d'eau et d'éléments rares, cas qu'une représentation du granite ne saurait traduire.";
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + (t || "minéral rare, qui se forme dans des conditions particulières.") });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE()), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin) => ({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." });
  const magma = (echelle, chemin) => ({ type: "magma", echelle, chemin, note: "Chemin schématique." });
  const SKARN = (min) => contact([pt(150, 0.12, 1, "À 4 à 5 km de profondeur, un calcaire ou une dolomie se trouve à proximité d'un granite."), pt(550, 0.12, 2, "Le granite l'échauffe et y apporte de la silice :" + min + " cristallise.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]);
  const VERT = (min) => meta([pt(10, 0, 1, "Le basalte prend naissance au fond des océans."), pt(400, 0.4, 2, "Enfoui, et porté vers 300 à 450 °C en présence d'eau, il recristallise :" + min + ".", { bande: "schistes verts" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]);
  const SF = (t) => "Forme non dessinée : " + t;
  const PXF = `La structure des pyroxènes repose sur des chaînes simples de tétraèdres SiO₄ orientées selon c, reliées par des rubans d'octaèdres. Les plans de clivage passent entre ces « poutres » de chaînes et d'octaèdres, à ≈ 87° l'un de l'autre : sur une coupe, on obtient un carré presque parfait.`;
  const AMF = `Dans les amphiboles, les tétraèdres se regroupent en chaînes doubles orientées selon c, formant des rubans, un OH logé au centre de chaque anneau. Ces « poutres » étant deux fois plus larges que celles des pyroxènes, leurs clivages se croisent à ≈ 124° et 56° : critère le plus fiable pour distinguer une amphibole d'un pyroxène.`;

  Object.assign(MIN_F, {
    // ═══════════ pyroxènes ═══════════
    enstatite: {
      forme: PXF + `L'enstatite est un orthopyroxène dont tous les sites sont occupés par le magnésium ; sa maille est orthorhombique.`,
      intro: `On trouve l'enstatite comme pyroxène type du manteau, ainsi que dans les roches magmatiques les plus magnésiennes.`,
      scenarios: [s("Présente dans le manteau et dans les magmas magnésiens", `Dans la péridotite du manteau, elle constitue près d'un quart du volume ; elle se forme aussi dans les gabbros (norites) et les météorites (chondrites à enstatite).`, magma("manteau", [pt(1400, 2.0, 1, "Au sein du manteau, l'enstatite constitue un quart de la péridotite."), pt(1250, 0.4, 2, "Au sein d'un magma fortement magnésien, elle apparaît tôt, aux côtés de l'olivine.", { bande: "cristallisation" })]), ["hirschmann", SRC.morimoto])],
    },
    ferrosilite: {
      sansForme: SF("La ferrosilite se présente en grains dans les roches enrichies en fer."),
      forme: PXF + `La ferrosilite correspond au pôle ferreux de la série des orthopyroxènes.`,
      intro: `À l'état pur, la ferrosilite se rencontre peu ; il s'agit avant tout d'une composition de référence.`,
      scenarios: [s("Présente dans les roches riches en fer", `Granulites, formations de fer métamorphiques, rhyolites ; à l'état pur, on la rencontre surtout en laboratoire.`)],
    },
    diopside: {
      forme: PXF + `Le diopside est un clinopyroxène riche en calcium et en magnésium.`,
      intro: `On trouve le diopside dans les marbres, les skarns et les roches mantelliques.`,
      scenarios: [
        s("Au sein d'un skarn ou d'un marbre", `Une dolomie siliceuse portée à haute température par un granite donne naissance à du diopside et à de la calcite.`, SKARN("le diopside"), ["tuttle"]),
        s("Dans le manteau", `Le diopside chromifère, d'un vert vif (« diopside de chrome »), se rencontre dans les péridotites et les kimberlites.`, RARE("se reporter à la fiche de la péridotite.")),
      ],
    },
    hedenbergite: {
      forme: PXF + `L'hédenbergite constitue le pôle ferreux du diopside.`,
      intro: `L'hédenbergite caractérise les skarns riches en fer.`,
      scenarios: [s("Dans un skarn à fer", `Elle accompagne l'andradite et la magnétite, dans le gisement de l'Elbe ou à Costabonne (Pyrénées).`, SKARN("l'hédenbergite"), ["tuttle"])],
    },
    augite: {
      forme: PXF + `L'augite est le clinopyroxène le plus répandu : il renferme du calcium, du magnésium, du fer et un peu d'aluminium.`,
      intro: `L'augite caractérise les basaltes et les gabbros.`,
      scenarios: [s("Dans un magma basaltique", `Elle cristallise en même temps que le plagioclase, vers 1 150 à 1 200 °C ; on la trouve, en cristaux noirs, dans les basaltes d'Auvergne.`, magma("croute", [
        pt(1250, 0.4, 1, "Un magma basaltique remonte depuis le manteau."), pt(1170, 0.2, 2, "L'augite cristallise avec le plagioclase.", { bande: "cristallisation" }), pt(1100, 0, 3, "La lave s'épanche tandis que l'augite demeure sous forme de cristaux noirs.")]), ["hirschmann"])],
    },
    pigeonite: {
      sansForme: SF("La pigeonite se présente en grains microscopiques dans les laves."),
      forme: PXF + `Faible en calcium, la pigeonite ne tient qu'à haute température ; un refroidissement lent provoque sa séparation en lamelles d'augite et d'orthopyroxène.`,
      intro: `La pigeonite cristallise dans les laves qui se refroidissent rapidement.`,
      scenarios: [s("Dans une lave", `On la trouve dans les basaltes, les andésites et les météorites ; elle a été décrite à Pigeon Point (Minnesota).`, magma("croute", [pt(1200, 0.1, 1, "Une coulée basaltique se refroidit rapidement."), pt(1100, 0, 2, "La pigeonite cristallise puis demeure figée dans sa structure.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    johannsenite: {
      sansForme: SF("La johannsénite se présente en agrégats fibreux rayonnants."),
      forme: PXF + `La johannsénite est un clinopyroxène riche en manganèse.`,
      intro: `La johannsénite caractérise certains skarns à manganèse.`,
      scenarios: [s("Dans un skarn à manganèse", `Elle se rencontre dans les skarns et les filons métasomatiques riches en zinc et en manganèse.`, SKARN("la johannsénite"), ["tuttle"])],
    },
    jadeite: {
      sansForme: SF("La jadéite constitue des masses de microcristaux enchevêtrés (le jade), d'une grande ténacité ; les cristaux isolés sont rares."),
      forme: PXF + `La jadéite, composée de sodium et d'aluminium, n'est stable qu'à haute pression ; elle se forme aux dépens de l'albite.`,
      intro: `C'est dans les zones de subduction, sous forte pression et à température modeste, qu'apparaît la jadéite.`,
      scenarios: [s("Dans une zone de subduction", `Vers 30 à 40 km de profondeur, l'albite se décompose en jadéite et quartz. Les jades de Birmanie (Hpakant) ont cristallisé à partir de fluides qui circulaient dans les serpentinites des zones de subduction.`, meta([pt(15, 0, 1, "Une roche riche en albite s'enfonce dans une zone de subduction."), pt(350, 1.3, 2, "Au-delà de ≈ 1 GPa, à 350 °C, l'albite se transforme en jadéite et quartz.", { bande: "jadéite" }), pt(200, 0.4, 3, "Elle remonte en restant froide.")], { echelle: "hp", courbes: ["jadeite"] }), ["pattison"])],
    },
    aegyrine: {
      forme: PXF + `L'aegyrine, à base de sodium et de fer ferrique, caractérise les roches alcalines.`,
      intro: `Les magmas enrichis en sodium mais appauvris en silice donnent naissance à l'aegyrine.`,
      scenarios: [s("Dans une syénite néphélinique", `De longs cristaux noirs, prismatiques, se rencontrent dans les syénites et leurs pegmatites (Norvège, Mont Saint-Hilaire) ; son nom vient d'Ægir, dieu nordique de la mer.`, magma("croute", [pt(950, 0.2, 1, "Un magma alcalin, enrichi en sodium, se met en place dans la croûte."), pt(750, 0.15, 2, "En fin de cristallisation, l'aegyrine se développe sous forme de longs prismes.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    omphacite: {
      sansForme: SF("L'omphacite se présente en grains verts dans les éclogites."),
      forme: PXF + `Mélange de diopside et de jadéite, l'omphacite ne se stabilise qu'à très forte pression.`,
      intro: `Avec le grenat, l'omphacite caractérise les éclogites.`,
      scenarios: [s("Dans une éclogite", `Un basalte entraîné à plus de 50 km de profondeur dans une subduction se transforme en éclogite : grenat rouge et omphacite verte (Haut-Allier, Vendée).`,
        meta([pt(10, 0, 1, "Un basalte du plancher océanique s'enfonce dans la zone de subduction."), pt(600, 2.0, 2, "Au-delà de ≈ 1,5 GPa (vers 50 km), il se transforme en éclogite : grenat et omphacite.", { bande: "éclogite" }), pt(300, 0.5, 3, "Il remonte suffisamment vite pour conserver son omphacite.")], { echelle: "hp" }), ["pattison"])],
    },
    kosmochlor: {
      sansForme: SF("Le kosmochlor se présente en grains et en lamelles."),
      forme: PXF + `Le kosmochlor, pyroxène riche en sodium, renferme du chrome.`,
      intro: `Le kosmochlor fut d'abord décrit dans des météorites de fer.`,
      scenarios: [s("Présent dans les météorites et dans les jadéitites", `Identifié d'abord dans la météorite de fer de Toluca, il a ensuite été repéré dans les jades birmans (« maw-sit-sit »).`)],
    },
    spodumene: {
      forme: PXF + `Contenant du lithium et de l'aluminium, le spodumène appartient aux pyroxènes ; quasi parfait, son clivage le débite en baguettes.`,
      intro: `Pour le lithium, le spodumène représente la principale source tirée des pegmatites.`,
      scenarios: [s("Dans une pegmatite à lithium", `Des cristaux géants se forment dans les pegmatites (Etta, Dakota du Sud : 14 m) ; il est aujourd'hui exploité en Australie (Greenbushes) pour les batteries.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    // ── pyroxénoïdes ──
    wollastonite: {
      sansForme: SF("La wollastonite se présente en masses fibreuses et en aiguilles ; ses cristaux tricliniques sont rares."),
      forme: `Chez la wollastonite, les chaînes simples de tétraèdres se répètent tous les trois tétraèdres (contre deux dans un pyroxène) et sont reliées par du calcium : elle présente deux clivages parfaits, d'où son débit en aiguilles.`,
      intro: `La wollastonite se forme lorsqu'un calcaire et de la silice sont portés ensemble à haute température.`,
      scenarios: [s("Au sein d'un skarn ou d'un marbre", `Au contact des granites, à faible pression et au-delà de ≈ 600 °C, la calcite et le quartz donnent wollastonite et CO₂.`, contact([
        pt(150, 0.1, 1, "Un calcaire siliceux se trouve à quelques kilomètres de là."), pt(700, 0.1, 2, "Un magma le porte au-delà de 600 °C : la calcite et le quartz réagissent pour former de la wollastonite.", { bande: "wollastonite" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]), ["tuttle"])],
    },
    rhodonite: {
      sansForme: SF("Les masses roses constituent l'aspect le plus courant de la rhodonite ; quant à ses cristaux tricliniques, leurs mailles varient d'un auteur à l'autre."),
      forme: `Les chaînes de tétraèdres de la rhodonite se répètent tous les cinq tétraèdres et sont reliées par du manganèse. Rose, elle est veinée de noir par des oxydes de manganèse ; son nom vient du grec <i>rhodon</i>, la rose.`,
      intro: `Les gisements de manganèse soumis au métamorphisme abritent la rhodonite.`,
      scenarios: [s("Dans un gisement de manganèse", `Oural (pierre ornementale des tsars), Broken Hill, Franklin.`, meta([pt(15, 0, 1, "Un dépôt sédimentaire chargé en manganèse et en silice s'accumule."), pt(500, 0.4, 2, "Enfoui puis chauffé, il recristallise : la rhodonite apparaît.", { bande: "rhodonite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    pectolite: {
      sansForme: SF("La pectolite se présente en aiguilles fibro-radiées."),
      forme: `Des chaînes de tétraèdres se répètent tous les trois, associées au calcium et au sodium ; une liaison hydrogène très courte unit deux chaînes entre elles.`,
      intro: `La pectolite se forme dans les cavités des basaltes, en compagnie des zéolites.`,
      scenarios: [s("Dans une bulle de basalte", `Aiguilles blanches disposées en rayons ; sa variété bleue, le larimar, ne provient que de la République dominicaine.`, RARE("Il se dépose à partir d'eau chaude dans les cavités d'une lave."))],
    },
    bustamite: {
      sansForme: SF("La bustamite se présente en masses fibreuses roses."),
      forme: `Chaînes de tétraèdres de périodicité trois, reliées par le calcium et le manganèse.`,
      intro: `La bustamite apparaît dans les skarns à manganèse.`,
      scenarios: [s("Dans un skarn à manganèse", `Gisements de Franklin et de Broken Hill ; son nom rend hommage au général mexicain Anastasio Bustamante.`)],
    },
    // ═══════════ amphiboles ═══════════
    anthophyllite: {
      sansForme: SF("L'anthophyllite se présente en fibres et en baguettes rayonnantes."),
      forme: AMF + `L'anthophyllite appartient aux orthoamphiboles, à composition magnésienne et ferreuse.`,
      intro: `L'anthophyllite apparaît dans les roches ultrabasiques métamorphisées.`,
      scenarios: [s("Dans une roche ultrabasique métamorphisée", `Elle se forme avec le talc vers 600 °C ; elle constitue également une variété d'amiante.`, meta([pt(15, 0, 1, "Une péridotite serpentinisée est entraînée lors d'une collision."), pt(620, 0.6, 2, "Vers 600 °C, la roche recristallise en talc et en anthophyllite.", { bande: "anthophyllite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.hawthorne])],
    },
    cummingtonite: {
      sansForme: SF("La cummingtonite se présente en fibres et en baguettes."),
      forme: AMF + `La cummingtonite est une clinoamphibole dépourvue de calcium, à base de magnésium et de fer.`,
      intro: `La cummingtonite apparaît dans les amphibolites et les formations de fer métamorphiques.`,
      scenarios: [s("Dans une amphibolite", `On la trouve dans les amphibolites pauvres en calcium et les gneiss ; elle a été décrite à Cummington (Massachusetts).`, meta([pt(15, 0, 1, "Une roche enrichie en fer et en magnésium se constitue."), pt(600, 0.5, 2, "Enfouie et chauffée, elle voit croître la cummingtonite.", { bande: "amphibolites" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    grunerite: {
      sansForme: SF("La grunérite se présente en fibres (l'amiante brun, ou amosite)."),
      forme: AMF + `Pôle riche en fer de la cummingtonite, la grunérite lui correspond.`,
      intro: `On observe la grunérite dans les formations de fer rubanées ayant subi un métamorphisme.`,
      scenarios: [s("Dans un fer rubané métamorphisé", `Dans les formations rubanées, le fer et la silice recristallisent en grunérite ; sous forme fibreuse, elle a servi d'amiante (amosite).`, meta([pt(15, 0, 1, "Un fer rubané se dépose."), pt(550, 0.5, 2, "Enfoui puis chauffé, il recristallise : la grunérite se développe.", { bande: "grunérite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    tremolite: {
      forme: AMF + `La trémolite est une amphibole blanche, à calcium et magnésium.`,
      intro: `La trémolite se forme dans les dolomies siliceuses portées à haute température.`,
      scenarios: [s("Dans un marbre", `Dolomite + quartz + eau donnent trémolite, calcite et CO₂ vers 450 à 500 °C. Première description : le val Tremola, dans le Tessin.`, SKARN("la trémolite"), ["tuttle"])],
    },
    actinote: {
      forme: AMF + `L'actinote dérive de la trémolite : le fer y remplace une partie du magnésium, ce qui lui donne sa couleur verte.`,
      intro: `L'actinote caractérise les schistes verts.`,
      scenarios: [s("Dans un schiste vert", `Enfoui vers 300 à 450 °C, le pyroxène des basaltes se transforme en actinote, en même temps que la chlorite et l'épidote.`, VERT("L'actinote croît en même temps que la chlorite et l'épidote."), ["pattison"])],
    },
    hornblende: {
      forme: AMF + `La hornblende est l'amphibole la plus répandue ; elle renferme beaucoup de calcium, d'aluminium, de fer et de magnésium.`,
      intro: `La hornblende se forme dans les magmas riches en eau et dans les roches métamorphiques de degré moyen.`,
      scenarios: [
        s("Présente dans un magma riche en eau", `Dans les diorites, les granodiorites et les andésites, le magma renferme assez d'eau pour fixer des groupements OH : la hornblende se substitue au pyroxène.`, magma("croute", [pt(950, 0.3, 1, "Un magma d'arc volcanique, riche en eau, se met en place dans la croûte."), pt(850, 0.3, 2, "La hornblende cristallise.", { bande: "cristallisation" }), pt(720, 0.3, 3, "La diorite achève de cristalliser.")]), ["hirschmann"]),
        s("Dans une amphibolite", `Un basalte enfoui puis porté vers 500 à 700 °C se transforme en amphibolite : hornblende et plagioclase.`, meta([pt(10, 0, 1, "Un basalte se forme."), pt(620, 0.6, 2, "Sous l'effet d'un enfouissement suivi d'un chauffage, la roche se recristallise en hornblende et en plagioclase.", { bande: "amphibolites" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"]),
      ],
    },
    pargasite: {
      forme: AMF + `Amphibole riche en sodium et en aluminium, la pargasite reste stable jusqu'à haute température.`,
      intro: `On trouve la pargasite dans les marbres et le manteau, où elle retient un peu d'eau.`,
      scenarios: [s("Présente dans le manteau ou dans un marbre", `Dans les péridotites du manteau traversées par des fluides, elle fixe l'eau jusqu'à ≈ 90 km de profondeur ; elle a été décrite à Pargas (Finlande), dans des marbres.`, RARE("se reporter à la fiche de la péridotite."))],
    },
    kaersutite: {
      forme: AMF + `La kaersutite est une amphibole titanifère dans laquelle de l'oxygène se substitue à une partie des groupements OH.`,
      intro: `La kaersutite se forme dans les basaltes alcalins.`,
      scenarios: [s("Dans un basalte alcalin", `On la rencontre en mégacristaux dans les tufs et les basaltes alcalins du Massif central ou de l'Eifel ; la localité type est Kaersut, au Groenland.`, magma("croute", [pt(1150, 0.8, 1, "À grande profondeur, un magma basaltique alcalin gorgé d'eau se met à cristalliser."), pt(1050, 0.6, 2, "La kaersutite forme de gros cristaux.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    richterite: {
      sansForme: SF("La richtérite se présente en prismes allongés, mal décrits."),
      forme: AMF + `La richtérite est une amphibole à sodium et calcium.`,
      intro: `Les skarns et les roches alcalines potassiques livrent la richtérite.`,
      scenarios: [s("Présente dans une lamproïte ou dans un skarn", `On la rencontre dans les lamproïtes, les kimberlites (richtérite potassique) et les skarns à manganèse (Långban).`)],
    },
    glaucophane: {
      forme: AMF + `Le glaucophane est une amphibole sodique et alumineuse (sodium en site M4), stable à haute pression.`,
      intro: `Le glaucophane donne sa teinte bleue aux schistes des zones de subduction.`,
      scenarios: [s("Dans un schiste bleu", `Un basalte rapidement entraîné vers 20 à 40 km de profondeur dans une subduction demeure froid : son pyroxène et son plagioclase se transforment en glaucophane (île de Groix, Alpes).`, meta([pt(10, 0, 1, "Un basalte du plancher océanique s'enfonce dans la zone de subduction."), pt(400, 1.0, 2, "Vers 30 km, à 350 à 450 °C, le glaucophane cristallise.", { bande: "schistes bleus" }), pt(200, 0.3, 3, "La roche remonte sans se réchauffer.")], { echelle: "hp" }), ["pattison"])],
    },
    riebeckite: {
      forme: AMF + `Amphibole sodique, la riébeckite associe fer ferreux et fer ferrique.`,
      intro: `La riébeckite se forme dans les granites alcalins ; sous forme fibreuse, elle constitue l'amiante bleue.`,
      scenarios: [s("Dans un granite alcalin", `Corse (granites alcalins), Ailsa Craig (microgranite, d'où proviennent les pierres de curling) : la crocidolite des formations rubanées sud-africaines fut l'amiante le plus redoutable.`, magma("croute", [pt(850, 0.2, 1, "Un magma alcalin, riche en sodium et en fer, se met en place."), pt(720, 0.15, 2, "La riébeckite se forme en toute fin de cristallisation.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    arfvedsonite: {
      forme: AMF + `L'arfvedsonite constitue l'amphibole la plus riche en sodium.`,
      intro: `Les syénites néphéliniques et les granites alcalins hébergent l'arfvedsonite.`,
      scenarios: [s("Dans une syénite néphélinique", `Gisements du Groenland (Ilímaussaq) et de Kola ; son nom rend hommage au chimiste suédois Johan August Arfwedson, qui découvrit le lithium.`, magma("croute", [pt(900, 0.2, 1, "Un magma alcalin se met en place dans la croûte."), pt(750, 0.15, 2, "L'arfvedsonite cristallise.", { bande: "cristallisation" })]), ["hirschmann"])],
    },

    // ═══════════ phyllosilicates ═══════════
    muscovite: {
      forme: `Les micas se composent de feuillets « 2:1 », soit une couche d'octaèdres placée entre deux couches de tétraèdres, et maintenus ensemble par des ions potassium. Ces liaisons étant faibles, le clivage est parfait et les feuilles sont minces, souples et élastiques. Les feuillets présentent une symétrie presque hexagonale (b ≈ a√3), ce qui explique les tablettes à six côtés.`,
      intro: `La muscovite est le mica blanc que l'on rencontre dans les granites, les pegmatites et les micaschistes.`,
      scenarios: [
        s("Dans un granite", `Dans les leucogranites du Limousin, riches en aluminium, elle prend forme en fin de cristallisation, en compagnie du quartz.`,
          magma("croute", [pt(800, 0.4, 1, "Une fusion partielle de la croûte produit un magma enrichi en aluminium, qui gagne les niveaux supérieurs."), pt(690, 0.3, 2, "La muscovite se forme en fin de cristallisation.", { bande: "cristallisation" })]), ["hirschmann"]),
        s("Dans un micaschiste", `Entre 300 et 600 °C, les argiles enfouies évoluent d'abord en séricite, puis en muscovite.`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(500, 0.5, 2, "Enfouie puis chauffée, elle recristallise en micas : la muscovite se développe.", { bande: "micaschistes" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"]),
      ],
    },
    paragonite: {
      forme: `Mica blanc à sodium : plus petit que le potassium, le sodium rapproche davantage les feuillets.`,
      intro: `Les schistes métamorphiques enrichis en sodium et en aluminium sont le siège de la paragonite.`,
      scenarios: [s("Présente dans un schiste de haute pression", `On la trouve dans les schistes bleus et les éclogites des Alpes, avec la glaucophane et le grenat.`, meta([pt(15, 0, 1, "Une argile riche en sodium sédimente."), pt(500, 1.0, 2, "Enfouie dans une zone de subduction, elle recristallise : la paragonite se développe.", { bande: "paragonite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")], { echelle: "hp" }), ["pattison"])],
    },
    glauconie: {
      sansForme: SF("La glauconie se présente en grains verts arrondis (pelotes), dépourvus de faces cristallines."),
      forme: `Ce mica, ferrifère et potassique, se présente en grains très ténus, fréquemment associé à la smectite : la fiche de la partie Argiles le détaille.`,
      intro: `La glauconie se forme au fond des mers, dans les sédiments dont la sédimentation est très lente.`,
      scenarios: [s("Au fond de la mer", `Les plateaux continentaux, où la sédimentation avance lentement, voient les grains de boue et les excréments se convertir en glauconie verte en quelques centaines de milliers d'années : on en a les sables verts du Crétacé du Bassin parisien.`, RARE("ce sont la lenteur du dépôt et la chimie du fond qui déterminent sa formation."))],
    },
    biotite: {
      forme: `Mica noir constitué de feuillets 2:1 dont tous les sites octaédriques sont occupés par du magnésium et du fer (type trioctaédrique), le potassium se logeant entre les feuillets. Le fer lui donne sa couleur noire. Il s'altère rapidement en vermiculite et en oxydes de fer.`,
      intro: `La biotite est le mica noir que l'on trouve dans les granites, les gneiss et les micaschistes.`,
      scenarios: [
        s("Dans un granite", `Elle se forme précocement dans les granites et les granodiorites, sous forme de paillettes noires.`, magma("croute", [pt(850, 0.4, 1, "La croûte fond partiellement ; un magma granitique remonte."), pt(780, 0.3, 2, "La biotite se forme en même temps que le plagioclase.", { bande: "cristallisation" }), pt(680, 0.3, 3, "Le granite achève de cristalliser.")]), ["hirschmann"]),
        s("Dans un micaschiste", `Dans les argiles enfouies, elle surgit vers 400 à 450 °C ; elle définit la « zone de la biotite » du métamorphisme.`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(450, 0.5, 2, "Enfouie puis chauffée, elle favorise la croissance de la biotite.", { bande: "zone de la biotite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"]),
      ],
    },
    phlogopite: {
      forme: `Mica trioctaédrique à magnésium, dépourvu de fer : il est de teinte brun doré.`,
      intro: `On trouve la phlogopite dans les marbres ainsi que dans le manteau.`,
      scenarios: [
        s("Dans un marbre", `Dolomies impures portées à haute température, en compagnie du diopside et de la forstérite.`, SKARN("la phlogopite"), ["tuttle"]),
        s("Dans le manteau", `On en trouve dans les kimberlites et les lamproïtes : elle retient potassium et eau dans le manteau.`, RARE("se reporter à la fiche de la kimberlite.")),
      ],
    },
    lepidolite: {
      forme: `Mica à lithium : le lithium se substitue en partie à l'aluminium et au magnésium dans les octaèdres.`,
      intro: `Les pegmatites riches en lithium abritent typiquement la lépidolite, un mica.`,
      scenarios: [s("Dans une pegmatite à lithium", `Elle accompagne le spodumène, l'elbaïte et la montebrasite ; on l'a exploitée pour le lithium à Échassières (Allier).`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    zinnwaldite: {
      forme: `Mica renfermant du lithium et du fer.`,
      intro: `La zinnwaldite caractérise les greisens d'étain.`,
      scenarios: [s("Dans un greisen", `Des fluides fluorés émanés des granites stannifères convertissent la roche encaissante en greisen, riche en quartz, topaze et zinnwaldite (Zinnwald, Cinovec).`, RARE("fluides issus de la fin de cristallisation d'un granite."))],
    },
    margarite: {
      forme: `Mica « cassant » : le calcium, à deux charges positives, serre les feuillets plus fortement que ne le fait le potassium ; ses lames se brisent au lieu de se courber.`,
      intro: `Dans les roches métamorphiques où calcium et aluminium abondent, on rencontre la margarite.`,
      scenarios: [s("Dans une roche métamorphique alumineuse", `Elle est associée au corindon (émeris de Naxos), dans les schistes et les marbres alumineux.`, meta([pt(15, 0, 1, "Un sédiment enrichi en aluminium et en calcium sédimente."), pt(500, 0.6, 2, "Enfoui puis chauffé, il laisse croître la margarite.", { bande: "margarite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    clintonite: {
      forme: `Mica cassant de type trioctaédrique, à calcium dominant et très riche en aluminium.`,
      intro: `Skarns et marbres magnésiens hébergent la clintonite.`,
      scenarios: [s("Dans un skarn", `Au contact entre des dolomies et des intrusions ; son nom rend hommage à DeWitt Clinton, gouverneur de New York.`, SKARN("la clintonite"), ["tuttle"])],
    },
    talc: {
      sansForme: SF("Le talc se présente en masses compactes (stéatite) ou feuilletées, plus rarement en tablettes."),
      forme: `Ses feuillets 2:1, à magnésium, sont électriquement neutres et ne sont liés entre eux que par des forces de van der Waals. Il en résulte une dureté de 1 (repère de l'échelle de Mohs), un toucher gras et un débit en écailles.`,
      intro: `Le talc se forme par altération, sous l'action d'eau chaude, des roches magnésiennes.`,
      scenarios: [s("Présent dans une dolomie ou une serpentinite", `Riches en silice, des eaux chaudes convertissent dolomies et serpentinites en talc. Trimouns (Ariège), plus vaste carrière de talc au monde, s'est constituée dans une dolomie parcourue de fluides, il y a ≈ 110 millions d'années.`, meta([pt(15, 0, 1, "Une dolomie se trouve enfouie dans la croûte."), pt(400, 0.3, 2, "Vers 300 à 400 °C, des eaux saturées en silice opèrent la transformation de la roche en talc.", { bande: "talc" }), pt(15, 0, 3, "L'érosion met le gisement à jour.")]), ["pattison"])],
    },
    pyrophyllite: {
      sansForme: SF("La pyrophyllite se présente en masses compactes ou rayonnantes."),
      forme: `Feuillets 2:1 à aluminium, électriquement neutres : c'est le talc de l'aluminium. Sous l'effet de la chaleur, elle se délite en éventail (du grec « feuille de feu »).`,
      intro: `La pyrophyllite se rencontre dans les roches alumineuses faiblement métamorphisées ou altérées par des solutions acides.`,
      scenarios: [s("Dans un schiste alumineux", `Elle résulte d'un faible métamorphisme des argiles riches en aluminium, ou de l'altération acide des laves.`, meta([pt(15, 0, 1, "Une argile alumineuse se dépose."), pt(330, 0.3, 2, "Enfouis vers 300 à 350 °C, la kaolinite et le quartz réagissent pour former de la pyrophyllite.", { bande: "pyrophyllite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    chrysotile: {
      sansForme: SF("Le chrysotile se présente en fibres soyeuses (amiante blanche) : ses feuillets s'enroulent en tubes."),
      forme: `Dans la serpentine, un feuillet associe une couche de silice et une couche de magnésium. Plus étendue, cette dernière force le feuillet à se refermer en tube d'environ 25 nm. La fiche de la partie Argiles approfondit ce point.`,
      intro: `Le chrysotile apparaît lorsque l'eau pénètre dans une péridotite à basse température.`,
      scenarios: [s("Dans une serpentinite", `On trouve ces veines soyeuses dans les serpentinites de Thetford (Québec) et de Canari (Corse), exploitées jusqu'en 1965. En France, l'amiante blanche n'est plus autorisée depuis 1997.`, RARE("se reporter à la fiche de la serpentinite."), [SRC.evans])],
    },
    antigorite: {
      sansForme: SF("L'antigorite se présente en lamelles et en masses feuilletées."),
      forme: `Serpentine à feuillets ondulés : la couche de magnésium s'incurve et bascule de côté tous les 21,75 Å. Il s'agit de la serpentine stable à la température la plus élevée.`,
      intro: `L'antigorite caractérise les zones de subduction.`,
      scenarios: [s("Dans une serpentinite chauffée", `Entre ≈ 300 et 600 °C ; elle transporte l'eau du manteau jusqu'à 150 km de profondeur dans les zones de subduction.`, meta([pt(10, 0, 1, "Une péridotite du plancher océanique subit une serpentinisation."), pt(450, 1.0, 2, "Entraînée dans la zone de subduction, la lizardite se transforme en antigorite.", { bande: "antigorite" }), pt(200, 0.3, 3, "Dans son ascension, elle conserve l'eau qu'elle transporte (schistes lustrés des Alpes).")], { echelle: "hp" }), ["pattison", SRC.evans])],
    },
    lizardite: {
      sansForme: SF("La lizardite se présente en masses microscopiques."),
      forme: `Serpentine dont les feuillets sont plats : c'est la plus répandue.`,
      intro: `La lizardite constitue l'essentiel des serpentinites formées à basse température.`,
      scenarios: [s("Sous le fond de l'océan", `Le long des dorsales lentes, l'eau de mer qui atteint le manteau mis à nu convertit l'olivine en lizardite et en magnétite, sous ≈ 300 °C, avec émission d'hydrogène. Première description au cap Lizard, en Cornouailles.`, RARE("se reporter à la fiche de la serpentinite."), [SRC.evans])],
    },
    clinochlore: {
      forme: `Les chlorites superposent un feuillet 2:1 à un feuillet d'hydroxyde de magnésium (du type brucite) : des feuilles vertes, flexibles mais non élastiques.`,
      intro: `Dans les schistes verts et les serpentinites, la chlorite dominante est le clinochlore.`,
      scenarios: [s("Dans un schiste vert", `À 300 à 450 °C après enfouissement, le basalte donne chlorite, albite, actinote et épidote.`, VERT("La chlorite croît en même temps que l'albite et l'actinote"), ["pattison"])],
    },
    chamosite: {
      sansForme: SF("La chamosite se présente en oolithes et en grains microscopiques."),
      forme: `Chlorite ferreuse.`,
      intro: `Le minerai de fer oolithique a pour minéral principal la chamosite.`,
      scenarios: [s("Présente dans un minerai de fer oolithique", `Les oolithes de chamosite et de goethite de la minette lorraine se sont constituées en eaux côtières pauvres en oxygène ; la localité type est Chamoson (Valais).`, { type: "ehph", systeme: "fer", chemin: [{ pH: 7.5, Eh: 0.3, n: 1, t: "Le fer parvient à la mer, transporté par les rivières, sous forme d'oxydes." }, { pH: 7.2, Eh: -0.2, n: 2, t: "Dans la boue pauvre en oxygène, le fer repasse à l'état ferreux et se fixe dans la chamosite." }], note: "Ce domaine est indicatif : la chamosite se forme à proximité de la limite entre Fe²⁺ et oxydes ferriques." })],
    },
    apophyllite: {
      forme: `Les feuillets de l'apophyllite sont formés de tétraèdres disposés en anneaux de quatre et de huit, unis par du calcium et du potassium, avec de l'eau entre eux. Sous l'effet de la chaleur, elle perd son eau et se délite (du grec « qui s'effeuille »).`,
      intro: `L'apophyllite se forme dans les cavités des basaltes.`,
      scenarios: [s("Dans une bulle de basalte", `Elle accompagne les zéolites dans les basaltes du Deccan (Inde) et d'Islande.`, RARE("Il se dépose à partir d'eau chaude dans les cavités d'une lave."))],
    },
    prehnite: {
      sansForme: SF("La prehnite se présente en agrégats mamelonnés, vert pâle."),
      forme: `Des feuillets de tétraèdres sont reliés par des octaèdres d'aluminium et par du calcium : il s'agit d'un phyllosilicate dont les feuillets demeurent solidaires.`,
      intro: `La prehnite se forme dans les basaltes faiblement chauffés, notamment dans leurs cavités.`,
      scenarios: [s("Dans un basalte faiblement chauffé", `Vers 200 à 300 °C, on se trouve dans le faciès prehnite-pumpellyite ; la prehnite fut la première espèce nommée d'après une personne, le colonel Hendrik von Prehn (1788).`, RARE("se reporter à la fiche de la pumpellyite."))],
    },
    kaolinite_m: {
      sansForme: SF("Des plaquettes de quelques micromètres : tel est l'aspect de la kaolinite. La partie Argiles détaille sa morphologie et sa structure."),
      forme: `Feuillet « 1:1 », formé d'une couche de tétraèdres et d'une couche d'octaèdres d'aluminium : on se reportera à la fiche complète de la partie Argiles.`,
      intro: `La kaolinite caractérise l'altération acide en milieu bien drainé.`,
      scenarios: [s("Voir la partie Argiles", `On trouvera dans la fiche « Kaolinite » de la partie Argiles l'exposé de sa formation, du climat qui la favorise et de ses gisements.`, RARE("se reporter à la fiche de la partie Argiles."))],
    },
    illite_m: {
      sansForme: SF("L'illite se présente en particules microscopiques ; se reporter à la partie Argiles."),
      forme: `Mica médiocrement cristallisé et appauvri en potassium : la fiche complète figure dans la partie Argiles.`,
      intro: `Dans les roches sédimentaires, l'illite constitue l'argile la plus répandue.`,
      scenarios: [s("Voir la partie Argiles", `La fiche « Illite » de la partie Argiles présente sa formation, son enfouissement et sa diagenèse.`, RARE("se reporter à la fiche de la partie Argiles."))],
    },
    smectites_m: {
      sansForme: SF("Les smectites se présentent en particules microscopiques ; se reporter à la partie Argiles."),
      forme: `Ses feuillets 2:1 se dilatent en captant l'eau. La fiche complète se trouve dans la partie Argiles.`,
      intro: `Les smectites constituent le groupe des argiles gonflantes.`,
      scenarios: [s("Voir la partie Argiles", `La fiche « Smectites » de la partie Argiles expose leur formation et leur gonflement.`, RARE("se reporter à la fiche de la partie Argiles."))],
    },
  });
})();
