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
        note: "Prismes courts à huit pans ; dans les péridotites, en grains brun-vert à éclat bronzé (bronzite)." }],
      clivages: [{ hkl: [2, 1, 0], qualite: "bon", nom: "prismatique {210}, à ≈ 88°", pas: 0.26 }],
    },
    diopside: CPX("Diopside", "#5a8a4a", [9.7456, 8.9198, 5.2516, 90, 105.86, 90], "cod9000797",
      "Prismes à section presque carrée (quatre faces a et b, coins coupés par m), terminés en toit ; les plus beaux viennent des skarns (val d'Ala, Piémont)."),
    hedenbergite: CPX("Hédenbergite", "#2a3a2a", [9.806, 9.068, 5.238, 90, 105.92, 90], "cod9016927",
      "Prismes noirs à vert sombre, souvent en gerbes rayonnantes dans les skarns à fer."),
    augite: CPX("Augite", "#2a2a24", [9.7504, 8.9015, 5.27444, 90, 106.016, 90], "cod9009664",
      "Prismes noirs trapus à section octogonale, terminés en toit : les cristaux libres des tufs volcaniques (Vésuve, Auvergne) ; dans les basaltes, en grains. Macles sur {100} fréquentes."),
    aegyrine: CPX("Aegyrine", "#1f2a1f", [9.6623, 8.8, 5.2956, 90, 107.579, 90], "cod9010326",
      "Longs prismes vert noir, pointus, dans les syénites et les pegmatites alcalines (Mont Saint-Hilaire, Malawi).", 2.6),
    spodumene: CPX("Spodumène", "#c8b8d0", [9.479, 8.403, 5.223, 90, 110.14, 90], "cod9004744",
      "Prismes aplatis selon a, striés, parfois de plusieurs mètres dans les pegmatites (Etta, Dakota) ; kunzite rose, hiddénite verte.", 2.4),

    // ── amphiboles ──
    tremolite: AMPH("Trémolite", "#d8d8c8", [9.8359, 18.045, 5.2752, 90, 104.75, 90], "cod9002334",
      "Prismes blancs allongés, souvent en gerbes ou en fibres (amiante trémolite) dans les marbres dolomitiques.", 2.6),
    actinote: AMPH("Actinote", "#5a8a5a", [9.881, 18.139, 5.298, 90, 104.78, 90], "cod9001926",
      "Prismes vert vif, en baguettes rayonnantes (son nom grec veut dire « rayon ») ; la variété feutrée est le jade néphrite.", 2.6),
    hornblende: AMPH("Hornblende", "#1f2a1f", [9.857, 18.112, 5.309, 90, 104.81, 90], "cod9004433",
      "Prismes noirs à six pans (quatre faces m et deux faces b), terminés par un toit à faces r ; en section, un losange à angles de 124° et 56° qui la distingue des pyroxènes."),
    pargasite: AMPH("Pargasite", "#3a5a3a", [9.9, 17.95, 5.311, 90, 105.42, 90], "cod9001241",
      "Prismes trapus vert-brun, dans les marbres et les péridotites (Pargas, Finlande)."),
    kaersutite: AMPH("Kaersutite", "#3a2a1f", [9.718, 17.87, 5.259, 90, 105.8, 90], "cod9014020",
      "Prismes brun noir, en cristaux libres dans les tufs basaltiques et en mégacristaux."),
    glaucophane: AMPH("Glaucophane", "#3a4a8a", [9.541, 17.74, 5.295, 90, 103.67, 90], "cod9000177",
      "Prismes bleu lavande, en aiguilles qui colorent les schistes bleus (île de Groix).", 2.4),
    arfvedsonite: AMPH("Arfvedsonite", "#1a1f2a", [10.007, 18.077, 5.332, 90, 104.101, 90], "cod9004105",
      "Longs prismes noirs dans les syénites néphéliniques et les granites alcalins (Groenland, Kola).", 2.4),
    riebeckite: AMPH("Riébeckite", "#2a2f4a", [9.811, 18.013, 5.326, 90, 103.68, 90], "cod9004132",
      "Prismes bleu noir dans les granites alcalins (granite de Corse, microgranite d'Ailsa Craig) ; la variété fibreuse est l'amiante bleu (crocidolite).", 2.6),

    // ── micas, chlorites ──
    muscovite: MICA("Muscovite", "#d8d0b0", [5.1988, 9.0266, 20.1058, 90, 95.782, 90], "cod9000837", "C",
      "Tablettes à six côtés (« livres »), incolores à brun clair, dans les pegmatites ; dans les granites et les micaschistes, en paillettes argentées."),
    paragonite: MICA("Paragonite", "#e0d8c0", [5.128, 8.898, 19.287, 90, 94.35, 90], "cod9000905", "C",
      "Paillettes blanches, difficiles à distinguer de la muscovite sans analyse : son nom grec veut dire « trompeuse »."),
    biotite: MICA("Biotite", "#2a1f1a", [5.355, 9.251, 10.246, 90, 100.15, 90], "cod9001266", "C",
      "Tablettes hexagonales noires, en piles ; dans les granites, en paillettes noires brillantes."),
    phlogopite: MICA("Phlogopite", "#a8783a", [5.3158, 9.2036, 10.31, 90, 99.891, 90], "cod9002829", "C",
      "Tablettes hexagonales brun doré à reflets cuivrés (grec « couleur de feu »), dans les marbres et les kimberlites."),
    lepidolite: MICA("Lépidolite", "#c8a0c8", [5.209, 9.011, 10.149, 90, 100.77, 90], "cod9000834", "C",
      "Tablettes lilas, souvent en masses écailleuses (grec « pierre en écailles »)."),
    zinnwaldite: MICA("Zinnwaldite", "#7a6a5a", [5.296, 9.14, 10.096, 90, 100.83, 90], "cod9000593", "C",
      "Tablettes gris-brun à argentées, dans les greisens d'étain (Zinnwald, Erzgebirge)."),
    margarite: MICA("Margarite", "#d8c0c0", [5.108, 8.844, 19.156, 90, 95.48, 90], "cod9016300", "C",
      "Paillettes rosées, nacrées (grec « perle ») ; ses lames cassent au lieu de plier."),
    clintonite: MICA("Clintonite", "#a88a3a", [5.2, 9.005, 9.795, 90, 100.24, 90], "cod9001883", "C",
      "Tablettes brun-rouge à brun-jaune, cassantes, dans les skarns et les marbres."),
    clinochlore: MICA("Clinochlore", "#4a7a4a", [5.327, 9.233, 14.381, 90.2, 97.2, 89.97], "cod9010129", "C",
      "Tablettes hexagonales vertes, souples mais non élastiques (elles ne reprennent pas leur forme), dans les fentes alpines et les serpentinites."),

    // ── apophyllite ──
    apophyllite: {
      nom: "Apophyllite", couleur: "#e8eef0", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [8.9639, 8.9639, 15.754, 90, 90, 90], mailleSource: "cod9005146", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme et bipyramide", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.15 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.6 }],
        note: "Prismes carrés coiffés d'une pyramide, transparents, presque cubiques : les géodes des basaltes du Deccan (Inde) en sont tapissées. Le clivage basal est parfait." }],
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
  const PEG = "Pas de diagramme : la pegmatite cristallise à partir d'un liquide très riche en eau et en éléments rares, que le diagramme du granite ne représente pas.";
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + (t || "minéral rare, formé dans des conditions particulières.") });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE()), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin) => ({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." });
  const magma = (echelle, chemin) => ({ type: "magma", echelle, chemin, note: "Chemin schématique." });
  const SKARN = (min) => contact([pt(150, 0.12, 1, "Un calcaire ou une dolomie repose à 4–5 km près d'un granite."), pt(550, 0.12, 2, "Le granite le chauffe et lui apporte de la silice : " + min + " cristallise.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]);
  const VERT = (min) => meta([pt(10, 0, 1, "Un basalte se forme au fond de l'océan."), pt(400, 0.4, 2, "Enfoui et chauffé vers 300–450 °C avec de l'eau, il recristallise : " + min + ".", { bande: "schistes verts" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]);
  const SF = (t) => "Forme non dessinée : " + t;
  const PXF = `Les pyroxènes sont faits de chaînes simples de tétraèdres SiO₄ le long de c, reliées par des rubans d'octaèdres. Les
        clivages passent entre ces « poutres » de chaînes et d'octaèdres, à ≈ 87° l'un de l'autre : sur une section, un carré presque
        parfait.`;
  const AMF = `Les amphiboles sont faites de chaînes DOUBLES de tétraèdres le long de c (rubans), avec un OH au centre de chaque
        anneau. Les « poutres » étant deux fois plus larges que celles des pyroxènes, les clivages se croisent à ≈ 124° et 56° : c'est le
        moyen le plus sûr de distinguer une amphibole d'un pyroxène.`;

  Object.assign(MIN_F, {
    // ═══════════ pyroxènes ═══════════
    enstatite: {
      forme: PXF + ` L'enstatite est un orthopyroxène : magnésium dans tous les sites, maille orthorhombique.`,
      intro: `L'enstatite est le pyroxène du manteau et des roches magmatiques les plus magnésiennes.`,
      scenarios: [s("Dans le manteau et les magmas magnésiens", `Un quart environ de la péridotite du manteau ; elle cristallise aussi dans les gabbros
        (norites) et les météorites (chondrites à enstatite).`, magma("manteau", [pt(1400, 2.0, 1, "Dans le manteau, l'enstatite forme un quart de la péridotite."), pt(1250, 0.4, 2, "Dans un magma très magnésien, elle cristallise tôt, avec l'olivine.", { bande: "cristallisation" })]), ["hirschmann", SRC.morimoto])],
    },
    ferrosilite: {
      sansForme: SF("la ferrosilite forme des grains dans les roches riches en fer."),
      forme: PXF + ` La ferrosilite est le pôle ferreux des orthopyroxènes.`,
      intro: `La ferrosilite pure est rare : elle est surtout un pôle de composition.`,
      scenarios: [s("Dans les roches riches en fer", `Granulites, formations de fer métamorphisées, rhyolites ; pure, on la trouve surtout en laboratoire.`)],
    },
    diopside: {
      forme: PXF + ` Le diopside est un clinopyroxène calcique et magnésien.`,
      intro: `Le diopside cristallise dans les marbres et les skarns, et dans les roches du manteau.`,
      scenarios: [
        s("Dans un skarn ou un marbre", `Une dolomie siliceuse chauffée par un granite donne diopside et calcite.`, SKARN("le diopside"), ["tuttle"]),
        s("Dans le manteau", `Le diopside chromifère vert vif (« diopside de chrome ») des péridotites et des kimberlites.`, RARE("voir la fiche de la péridotite.")),
      ],
    },
    hedenbergite: {
      forme: PXF + ` L'hédenbergite est le pôle ferreux du diopside.`,
      intro: `L'hédenbergite est le pyroxène des skarns à fer.`,
      scenarios: [s("Dans un skarn à fer", `Avec l'andradite et la magnétite (Elbe, Costabonne dans les Pyrénées).`, SKARN("l'hédenbergite"), ["tuttle"])],
    },
    augite: {
      forme: PXF + ` L'augite est le clinopyroxène commun, avec calcium, magnésium, fer et un peu d'aluminium.`,
      intro: `L'augite est le pyroxène des basaltes et des gabbros.`,
      scenarios: [s("Dans un magma basaltique", `Elle cristallise avec le plagioclase, vers 1 150–1 200 °C : dans les basaltes d'Auvergne, en cristaux noirs.`, magma("croute", [
        pt(1250, 0.4, 1, "Un magma basaltique monte du manteau."), pt(1170, 0.2, 2, "L'augite cristallise avec le plagioclase.", { bande: "cristallisation" }), pt(1100, 0, 3, "La lave s'épanche ; l'augite reste en cristaux noirs.")]), ["hirschmann"])],
    },
    pigeonite: {
      sansForme: SF("la pigeonite forme des grains microscopiques dans les laves."),
      forme: PXF + ` Pauvre en calcium, la pigeonite n'est stable qu'à haute température ; en refroidissant lentement, elle se dédouble en
        lamelles d'augite et d'orthopyroxène.`,
      intro: `La pigeonite cristallise dans les laves refroidies vite.`,
      scenarios: [s("Dans une lave", `Basaltes, andésites et météorites ; décrite à Pigeon Point (Minnesota).`, magma("croute", [pt(1200, 0.1, 1, "Une lave basaltique se refroidit vite."), pt(1100, 0, 2, "La pigeonite cristallise et reste figée.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    johannsenite: {
      sansForme: SF("la johannsénite forme des agrégats fibreux rayonnants."),
      forme: PXF + ` La johannsénite est un clinopyroxène au manganèse.`,
      intro: `La johannsénite est un pyroxène des skarns à manganèse.`,
      scenarios: [s("Dans un skarn à manganèse", `Skarns et filons métasomatiques à zinc et manganèse.`, SKARN("la johannsénite"), ["tuttle"])],
    },
    jadeite: {
      sansForme: SF("la jadéite forme des masses de microcristaux enchevêtrés (le jade), très tenaces ; les cristaux libres sont rares."),
      forme: PXF + ` La jadéite (sodium et aluminium) est stable seulement à haute pression : elle se forme en remplaçant l'albite.`,
      intro: `La jadéite naît dans les zones de subduction, à haute pression et basse température.`,
      scenarios: [s("Dans une zone de subduction", `Vers 30–40 km, l'albite se décompose en jadéite et quartz. Les jades de Birmanie (Hpakant) se sont formés dans des
        fluides circulant dans les serpentinites des subductions.`, meta([pt(15, 0, 1, "Une roche riche en albite plonge dans une subduction."), pt(350, 1.3, 2, "Au-delà de ≈ 1 GPa à 350 °C, l'albite devient jadéite + quartz.", { bande: "jadéite" }), pt(200, 0.4, 3, "Elle remonte en restant froide.")], { echelle: "hp", courbes: ["jadeite"] }), ["pattison"])],
    },
    aegyrine: {
      forme: PXF + ` L'aegyrine (sodium et fer ferrique) est le pyroxène des roches alcalines.`,
      intro: `L'aegyrine cristallise dans les magmas riches en sodium et pauvres en silice.`,
      scenarios: [s("Dans une syénite néphélinique", `Longs prismes noirs dans les syénites et leurs pegmatites (Norvège, Mont Saint-Hilaire) ; nommée d'après Ægir, dieu nordique de la mer.`, magma("croute", [pt(950, 0.2, 1, "Un magma alcalin, riche en sodium, s'installe dans la croûte."), pt(750, 0.15, 2, "En fin de cristallisation, l'aegyrine pousse en longs prismes.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    omphacite: {
      sansForme: SF("l'omphacite forme des grains verts dans les éclogites."),
      forme: PXF + ` L'omphacite est un mélange de diopside et de jadéite, stable à très haute pression.`,
      intro: `L'omphacite est, avec le grenat, le minéral des éclogites.`,
      scenarios: [s("Dans une éclogite", `Un basalte entraîné au-delà de 50 km dans une subduction devient éclogite : grenat rouge et omphacite verte (Haut-Allier, Vendée).`,
        meta([pt(10, 0, 1, "Un basalte du fond océanique plonge dans la subduction."), pt(600, 2.0, 2, "Au-delà de ≈ 1,5 GPa (50 km), il devient éclogite : grenat et omphacite.", { bande: "éclogite" }), pt(300, 0.5, 3, "Il remonte assez vite pour garder son omphacite.")], { echelle: "hp" }), ["pattison"])],
    },
    kosmochlor: {
      sansForme: SF("le kosmochlor forme des grains et des lamelles."),
      forme: PXF + ` Le kosmochlor est un pyroxène sodique au chrome.`,
      intro: `Le kosmochlor a d'abord été décrit dans des météorites de fer.`,
      scenarios: [s("Dans les météorites et les jadéitites", `Météorites de fer (Toluca), puis dans les jades de Birmanie (« maw-sit-sit »).`)],
    },
    spodumene: {
      forme: PXF + ` Le spodumène est un pyroxène au lithium et à l'aluminium ; son clivage presque parfait le débite en baguettes.`,
      intro: `Le spodumène est le principal minerai de lithium des pegmatites.`,
      scenarios: [s("Dans une pegmatite à lithium", `Cristaux géants des pegmatites (Etta, Dakota du Sud : 14 m) ; aujourd'hui exploité en Australie (Greenbushes) pour les batteries.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    // ── pyroxénoïdes ──
    wollastonite: {
      sansForme: SF("la wollastonite forme des masses fibreuses et des aiguilles ; ses cristaux tricliniques sont rares."),
      forme: `La wollastonite a des chaînes simples de tétraèdres qui se répètent tous les trois tétraèdres (au lieu de deux dans un
        pyroxène), reliées par du calcium : deux clivages parfaits, d'où le débit en aiguilles.`,
      intro: `La wollastonite naît quand un calcaire et de la silice sont chauffés ensemble.`,
      scenarios: [s("Dans un skarn ou un marbre", `Calcite + quartz → wollastonite + CO₂, au-delà de ≈ 600 °C à faible pression, au contact des granites.`, contact([
        pt(150, 0.1, 1, "Un calcaire siliceux repose à quelques kilomètres."), pt(700, 0.1, 2, "Un magma le chauffe au-delà de 600 °C : calcite et quartz réagissent en wollastonite.", { bande: "wollastonite" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]), ["tuttle"])],
    },
    rhodonite: {
      sansForme: SF("la rhodonite forme surtout des masses roses ; ses cristaux tricliniques sont décrits dans des mailles variables selon les auteurs."),
      forme: `La rhodonite a des chaînes de tétraèdres qui se répètent tous les cinq tétraèdres, reliées par du manganèse : rose (grec
        <i>rhodon</i>, la rose), veinée de noir d'oxyde de manganèse.`,
      intro: `La rhodonite se forme dans les gisements de manganèse métamorphisés.`,
      scenarios: [s("Dans un gisement de manganèse", `Oural (pierre ornementale des tsars), Broken Hill, Franklin.`, meta([pt(15, 0, 1, "Un sédiment riche en manganèse et en silice se dépose."), pt(500, 0.4, 2, "Enfoui et chauffé, il recristallise : la rhodonite se forme.", { bande: "rhodonite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    pectolite: {
      sansForme: SF("la pectolite forme des aiguilles fibro-radiées."),
      forme: `Chaînes de tétraèdres qui se répètent tous les trois, calcium et sodium ; une liaison hydrogène très courte relie deux chaînes.`,
      intro: `La pectolite cristallise dans les cavités des basaltes, avec les zéolites.`,
      scenarios: [s("Dans une bulle de basalte", `Aiguilles blanches rayonnantes ; la variété bleue, le larimar, ne vient que de la République dominicaine.`, RARE("dépôt d'eau chaude dans les cavités d'une lave."))],
    },
    bustamite: {
      sansForme: SF("la bustamite forme des masses fibreuses roses."),
      forme: `Chaînes de tétraèdres qui se répètent tous les trois, calcium et manganèse.`,
      intro: `La bustamite se forme dans les skarns à manganèse.`,
      scenarios: [s("Dans un skarn à manganèse", `Franklin, Broken Hill ; nommée d'après le général mexicain Anastasio Bustamante.`)],
    },
    // ═══════════ amphiboles ═══════════
    anthophyllite: {
      sansForme: SF("l'anthophyllite forme des fibres et des baguettes rayonnantes."),
      forme: AMF + ` L'anthophyllite est une orthoamphibole magnésienne et ferreuse.`,
      intro: `L'anthophyllite se forme dans les roches ultrabasiques métamorphisées.`,
      scenarios: [s("Dans une roche ultrabasique métamorphisée", `Avec le talc, vers 600 °C ; c'est aussi une amiante.`, meta([pt(15, 0, 1, "Une péridotite serpentinisée est entraînée dans une collision."), pt(620, 0.6, 2, "Vers 600 °C, elle recristallise en talc et anthophyllite.", { bande: "anthophyllite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.hawthorne])],
    },
    cummingtonite: {
      sansForme: SF("la cummingtonite forme des fibres et des baguettes."),
      forme: AMF + ` La cummingtonite est une clinoamphibole sans calcium, au magnésium et au fer.`,
      intro: `La cummingtonite se forme dans les amphibolites et les formations de fer métamorphisées.`,
      scenarios: [s("Dans une amphibolite", `Amphibolites pauvres en calcium, gneiss ; décrite à Cummington (Massachusetts).`, meta([pt(15, 0, 1, "Une roche riche en fer et en magnésium se forme."), pt(600, 0.5, 2, "Enfouie et chauffée, elle fait pousser la cummingtonite.", { bande: "amphibolites" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    grunerite: {
      sansForme: SF("la grunérite forme des fibres (l'amiante brune, amosite)."),
      forme: AMF + ` La grunérite est le pôle ferreux de la cummingtonite.`,
      intro: `La grunérite se forme dans les formations de fer rubanées métamorphisées.`,
      scenarios: [s("Dans un fer rubané métamorphisé", `Le fer et la silice des fers rubanés recristallisent en grunérite ; la variété fibreuse a été exploitée comme amiante (amosite).`, meta([pt(15, 0, 1, "Un fer rubané se dépose."), pt(550, 0.5, 2, "Enfoui et chauffé, il recristallise : la grunérite pousse.", { bande: "grunérite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    tremolite: {
      forme: AMF + ` La trémolite est l'amphibole calcique et magnésienne, blanche.`,
      intro: `La trémolite naît dans les dolomies siliceuses chauffées.`,
      scenarios: [s("Dans un marbre", `Dolomite + quartz + eau → trémolite + calcite + CO₂, vers 450–500 °C. Décrite dans le val Tremola (Tessin).`, SKARN("la trémolite"), ["tuttle"])],
    },
    actinote: {
      forme: AMF + ` L'actinote est une trémolite où le fer remplace une partie du magnésium : il la colore en vert.`,
      intro: `L'actinote est l'amphibole des schistes verts.`,
      scenarios: [s("Dans un schiste vert", `Le pyroxène des basaltes enfouis vers 300–450 °C se transforme en actinote, avec la chlorite et l'épidote.`, VERT("l'actinote pousse avec la chlorite et l'épidote"), ["pattison"])],
    },
    hornblende: {
      forme: AMF + ` La hornblende est l'amphibole commune, riche en calcium, aluminium, fer et magnésium.`,
      intro: `La hornblende cristallise dans les magmas riches en eau et dans les roches métamorphiques moyennes.`,
      scenarios: [
        s("Dans un magma riche en eau", `Dans les diorites, granodiorites et andésites, le magma contient assez d'eau pour fixer les OH : la hornblende remplace le
          pyroxène.`, magma("croute", [pt(950, 0.3, 1, "Un magma d'arc, riche en eau, s'installe dans la croûte."), pt(850, 0.3, 2, "La hornblende cristallise.", { bande: "cristallisation" }), pt(720, 0.3, 3, "La diorite achève de cristalliser.")]), ["hirschmann"]),
        s("Dans une amphibolite", `Un basalte enfoui et chauffé vers 500–700 °C devient amphibolite : hornblende et plagioclase.`, meta([pt(10, 0, 1, "Un basalte se forme."), pt(620, 0.6, 2, "Enfoui et chauffé, il recristallise en hornblende et plagioclase.", { bande: "amphibolites" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"]),
      ],
    },
    pargasite: {
      forme: AMF + ` La pargasite est une amphibole riche en sodium et en aluminium, stable jusqu'à haute température.`,
      intro: `La pargasite se forme dans les marbres et dans le manteau, où elle stocke un peu d'eau.`,
      scenarios: [s("Dans le manteau ou un marbre", `Dans les péridotites du manteau où des fluides ont circulé, elle fixe l'eau jusqu'à ≈ 90 km ; décrite à Pargas (Finlande), dans des marbres.`, RARE("voir la fiche de la péridotite."))],
    },
    kaersutite: {
      forme: AMF + ` La kaersutite est une amphibole riche en titane, où de l'oxygène remplace une partie des OH.`,
      intro: `La kaersutite cristallise dans les basaltes alcalins.`,
      scenarios: [s("Dans un basalte alcalin", `En mégacristaux dans les tufs et les basaltes alcalins (Massif central, Eifel) ; décrite à Kaersut (Groenland).`, magma("croute", [pt(1150, 0.8, 1, "Un magma basaltique alcalin, riche en eau, cristallise en profondeur."), pt(1050, 0.6, 2, "La kaersutite cristallise en gros cristaux.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    richterite: {
      sansForme: SF("la richtérite forme des prismes allongés mal décrits."),
      forme: AMF + ` La richtérite est une amphibole sodique et calcique.`,
      intro: `La richtérite se forme dans les skarns et les roches alcalines potassiques.`,
      scenarios: [s("Dans une lamproïte ou un skarn", `Lamproïtes, kimberlites (richtérite potassique) et skarns à manganèse (Långban).`)],
    },
    glaucophane: {
      forme: AMF + ` Le glaucophane est une amphibole sodique (sodium dans le site M4) à aluminium : stable à haute pression.`,
      intro: `Le glaucophane colore en bleu les schistes des zones de subduction.`,
      scenarios: [s("Dans un schiste bleu", `Un basalte entraîné rapidement vers 20–40 km dans une subduction reste froid : son pyroxène et son plagioclase deviennent glaucophane
        (île de Groix, Alpes).`, meta([pt(10, 0, 1, "Un basalte du fond océanique plonge dans la subduction."), pt(400, 1.0, 2, "Vers 30 km, à 350–450 °C, le glaucophane cristallise.", { bande: "schistes bleus" }), pt(200, 0.3, 3, "La roche remonte en restant froide.")], { echelle: "hp" }), ["pattison"])],
    },
    riebeckite: {
      forme: AMF + ` La riébeckite est une amphibole sodique au fer ferreux et ferrique.`,
      intro: `La riébeckite cristallise dans les granites alcalins ; fibreuse, c'est l'amiante bleue.`,
      scenarios: [s("Dans un granite alcalin", `Granites alcalins de Corse, microgranite d'Ailsa Craig (dont on fait les pierres de curling) ; la crocidolite des fers rubanés d'Afrique
        du Sud était la plus dangereuse des amiantes.`, magma("croute", [pt(850, 0.2, 1, "Un magma alcalin, riche en sodium et en fer, s'installe."), pt(720, 0.15, 2, "La riébeckite cristallise en fin de cristallisation.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    arfvedsonite: {
      forme: AMF + ` L'arfvedsonite est l'amphibole la plus sodique.`,
      intro: `L'arfvedsonite cristallise dans les syénites néphéliniques et les granites alcalins.`,
      scenarios: [s("Dans une syénite néphélinique", `Groenland (Ilímaussaq), Kola ; nommée d'après le chimiste suédois Johan August Arfwedson, qui découvrit le lithium.`, magma("croute", [pt(900, 0.2, 1, "Un magma alcalin s'installe dans la croûte."), pt(750, 0.15, 2, "L'arfvedsonite cristallise.", { bande: "cristallisation" })]), ["hirschmann"])],
    },

    // ═══════════ phyllosilicates ═══════════
    muscovite: {
      forme: `Les micas sont faits de feuillets « 2:1 » — une couche d'octaèdres prise entre deux couches de tétraèdres — tenus entre eux
        par des ions potassium. Ces liaisons sont faibles : clivage parfait, feuilles minces, souples et élastiques. Les feuillets ont une
        symétrie presque hexagonale (b ≈ a√3), d'où les tablettes à six côtés.`,
      intro: `La muscovite est le mica blanc des granites, des pegmatites et des micaschistes.`,
      scenarios: [
        s("Dans un granite", `Dans les granites riches en aluminium (leucogranites du Limousin), elle cristallise en fin de cristallisation, avec le quartz.`,
          magma("croute", [pt(800, 0.4, 1, "La croûte fond ; un magma riche en aluminium monte."), pt(690, 0.3, 2, "En fin de cristallisation, la muscovite apparaît.", { bande: "cristallisation" })]), ["hirschmann"]),
        s("Dans un micaschiste", `Les argiles enfouies se changent en séricite puis en muscovite entre 300 et 600 °C.`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(500, 0.5, 2, "Enfouie et chauffée, elle recristallise en micas : la muscovite pousse.", { bande: "micaschistes" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"]),
      ],
    },
    paragonite: {
      forme: `Mica blanc sodique : le sodium, plus petit que le potassium, tient les feuillets plus serrés.`,
      intro: `La paragonite se forme dans les schistes métamorphiques riches en sodium et en aluminium.`,
      scenarios: [s("Dans un schiste de haute pression", `Schistes bleus et éclogites des Alpes, avec la glaucophane et le grenat.`, meta([pt(15, 0, 1, "Une argile riche en sodium se dépose."), pt(500, 1.0, 2, "Enfouie dans une subduction, elle recristallise : la paragonite pousse.", { bande: "paragonite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")], { echelle: "hp" }), ["pattison"])],
    },
    glauconie: {
      sansForme: SF("la glauconie forme des grains verts arrondis (pellets), sans faces."),
      forme: `Mica ferrifère et potassique très fin, souvent mêlé de smectite : voir aussi la fiche dans la partie Argiles.`,
      intro: `La glauconie naît au fond des mers, dans les sédiments qui se déposent très lentement.`,
      scenarios: [s("Au fond de la mer", `Sur les plateaux continentaux, là où les dépôts sont lents, les grains de boue et les déjections se changent en glauconie verte en
        quelques centaines de milliers d'années : sables verts du Crétacé du Bassin parisien.`, RARE("c'est la lenteur du dépôt et la chimie du fond qui décident."))],
    },
    biotite: {
      forme: `Mica noir : feuillets 2:1 où magnésium et fer occupent tous les sites octaédriques (trioctaédrique), potassium entre les
        feuillets. Le fer le colore en noir. Il s'altère vite en vermiculite et en oxydes de fer.`,
      intro: `La biotite est le mica noir des granites, des gneiss et des micaschistes.`,
      scenarios: [
        s("Dans un granite", `Elle cristallise tôt dans les granites et les granodiorites, en paillettes noires.`, magma("croute", [pt(850, 0.4, 1, "La croûte fond ; un magma granitique monte."), pt(780, 0.3, 2, "La biotite cristallise avec le plagioclase.", { bande: "cristallisation" }), pt(680, 0.3, 3, "Le granite achève de cristalliser.")]), ["hirschmann"]),
        s("Dans un micaschiste", `Apparaît vers 400–450 °C dans les argiles enfouies : la « zone de la biotite » du métamorphisme.`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(450, 0.5, 2, "Enfouie et chauffée, elle fait pousser la biotite.", { bande: "zone de la biotite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"]),
      ],
    },
    phlogopite: {
      forme: `Mica trioctaédrique magnésien, sans fer : brun doré.`,
      intro: `La phlogopite naît dans les marbres et dans le manteau.`,
      scenarios: [
        s("Dans un marbre", `Dolomies impures chauffées, avec le diopside et la forstérite.`, SKARN("la phlogopite"), ["tuttle"]),
        s("Dans le manteau", `Les kimberlites et les lamproïtes en contiennent : elle stocke potassium et eau dans le manteau.`, RARE("voir la fiche de la kimberlite.")),
      ],
    },
    lepidolite: {
      forme: `Mica au lithium : le lithium remplace une partie de l'aluminium et du magnésium dans les octaèdres.`,
      intro: `La lépidolite est un mica des pegmatites à lithium.`,
      scenarios: [s("Dans une pegmatite à lithium", `Avec le spodumène, l'elbaïte et la montebrasite ; Échassières (Allier) en exploite pour le lithium.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    zinnwaldite: {
      forme: `Mica au lithium et au fer.`,
      intro: `La zinnwaldite est le mica des greisens d'étain.`,
      scenarios: [s("Dans un greisen", `Les fluides fluorés des granites à étain transforment le granite en greisen à quartz, topaze et zinnwaldite (Zinnwald, Cinovec).`, RARE("fluides de fin de cristallisation d'un granite."))],
    },
    margarite: {
      forme: `Mica « cassant » : le calcium, deux fois chargé, tient les feuillets plus fort que le potassium ; les lames cassent au lieu de plier.`,
      intro: `La margarite se forme dans les roches métamorphiques riches en calcium et en aluminium.`,
      scenarios: [s("Dans une roche métamorphique alumineuse", `Avec le corindon (émeris de Naxos), dans les schistes et les marbres alumineux.`, meta([pt(15, 0, 1, "Un sédiment riche en aluminium et en calcium se dépose."), pt(500, 0.6, 2, "Enfoui et chauffé, il fait pousser la margarite.", { bande: "margarite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    clintonite: {
      forme: `Mica cassant trioctaédrique, calcique, très riche en aluminium.`,
      intro: `La clintonite se forme dans les skarns et les marbres magnésiens.`,
      scenarios: [s("Dans un skarn", `Contacts entre des dolomies et des intrusions ; nommée d'après DeWitt Clinton, gouverneur de New York.`, SKARN("la clintonite"), ["tuttle"])],
    },
    talc: {
      sansForme: SF("le talc forme des masses compactes (stéatite) ou feuilletées, rarement des tablettes."),
      forme: `Le talc a des feuillets 2:1 de magnésium électriquement neutres : rien entre eux, que des forces de van der Waals. D'où la dureté
        de 1 (étalon de l'échelle de Mohs), le toucher gras et le débit en écailles.`,
      intro: `Le talc naît de l'altération par l'eau chaude des roches magnésiennes.`,
      scenarios: [s("Dans une dolomie ou une serpentinite", `Les eaux chaudes riches en silice transforment dolomies et serpentinites en talc : Trimouns (Ariège), la plus grande
        carrière de talc du monde, est née dans une dolomie traversée par des fluides il y a ≈ 110 millions d'années.`, meta([pt(15, 0, 1, "Une dolomie repose dans la croûte."), pt(400, 0.3, 2, "Des eaux chaudes riches en silice la transforment en talc, vers 300–400 °C.", { bande: "talc" }), pt(15, 0, 3, "L'érosion met le gisement à jour.")]), ["pattison"])],
    },
    pyrophyllite: {
      sansForme: SF("la pyrophyllite forme des masses compactes ou rayonnantes."),
      forme: `Feuillets 2:1 d'aluminium électriquement neutres : le talc de l'aluminium. Chauffée, elle s'exfolie en éventail (grec « feuille de
        feu »).`,
      intro: `La pyrophyllite se forme dans les roches alumineuses faiblement métamorphisées et altérées par l'acide.`,
      scenarios: [s("Dans un schiste alumineux", `Métamorphisme faible des argiles riches en aluminium, ou altération acide des laves.`, meta([pt(15, 0, 1, "Une argile alumineuse se dépose."), pt(330, 0.3, 2, "Enfouie vers 300–350 °C, la kaolinite et le quartz réagissent en pyrophyllite.", { bande: "pyrophyllite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    chrysotile: {
      sansForme: SF("le chrysotile forme des fibres soyeuses (amiante blanche), feuillets enroulés en tubes."),
      forme: `Feuillet de serpentine (une couche de silice, une couche de magnésium) : la couche de magnésium, plus large, force le feuillet à
        s'enrouler en tube de ≈ 25 nm. Voir aussi sa fiche dans la partie Argiles.`,
      intro: `Le chrysotile se forme quand l'eau traverse une péridotite à basse température.`,
      scenarios: [s("Dans une serpentinite", `Veines soyeuses dans les serpentinites (Thetford, Québec ; Canari, Corse, exploité jusqu'en 1965). L'amiante blanche, interdite en France depuis
        1997.`, RARE("voir la fiche de la serpentinite."), [SRC.evans])],
    },
    antigorite: {
      sansForme: SF("l'antigorite forme des lamelles et des masses feuilletées."),
      forme: `Serpentine à feuillets ondulés : la couche de magnésium s'incurve et change de côté toutes les 21,75 Å. C'est la serpentine de
        plus haute température.`,
      intro: `L'antigorite est la serpentine des zones de subduction.`,
      scenarios: [s("Dans une serpentinite chauffée", `Entre ≈ 300 et 600 °C ; elle transporte l'eau du manteau jusqu'à 150 km dans les subductions.`, meta([pt(10, 0, 1, "Une péridotite du fond océanique est serpentinisée."), pt(450, 1.0, 2, "Entraînée dans la subduction, la lizardite devient antigorite.", { bande: "antigorite" }), pt(200, 0.3, 3, "Elle remonte avec son eau (schistes lustrés des Alpes).")], { echelle: "hp" }), ["pattison", SRC.evans])],
    },
    lizardite: {
      sansForme: SF("la lizardite forme des masses microscopiques."),
      forme: `Serpentine à feuillets plats : la plus commune.`,
      intro: `La lizardite forme l'essentiel des serpentinites de basse température.`,
      scenarios: [s("Sous le fond de l'océan", `L'eau de mer qui pénètre dans le manteau mis à nu aux dorsales lentes transforme l'olivine en lizardite et magnétite, sous ≈ 300 °C,
        en dégageant de l'hydrogène. Décrite au cap Lizard (Cornouailles).`, RARE("voir la fiche de la serpentinite."), [SRC.evans])],
    },
    clinochlore: {
      forme: `Les chlorites alternent un feuillet 2:1 et un feuillet d'hydroxyde de magnésium (type brucite) : des feuilles souples mais non
        élastiques, vertes.`,
      intro: `Le clinochlore est la chlorite des schistes verts et des serpentinites.`,
      scenarios: [s("Dans un schiste vert", `Le basalte enfoui vers 300–450 °C se transforme en chlorite, albite, actinote et épidote.`, VERT("la chlorite pousse avec l'albite et l'actinote"), ["pattison"])],
    },
    chamosite: {
      sansForme: SF("la chamosite forme des oolithes et des grains microscopiques."),
      forme: `Chlorite ferreuse.`,
      intro: `La chamosite est le minéral des minerais de fer oolithiques.`,
      scenarios: [s("Dans un minerai de fer oolithique", `Dans les minerais de fer de Lorraine (minette), les oolithes de chamosite et de goethite se sont formées dans des eaux côtières
        peu oxygénées ; décrite à Chamoson (Valais).`, { type: "ehph", systeme: "fer", chemin: [{ pH: 7.5, Eh: 0.3, n: 1, t: "Le fer arrive en mer, apporté par les rivières, sous forme d'oxydes." }, { pH: 7.2, Eh: -0.2, n: 2, t: "Dans la boue peu oxygénée, le fer redevient ferreux et se fixe dans la chamosite." }], note: "Domaine indicatif : la chamosite se forme près de la limite Fe²⁺ / oxydes ferriques." })],
    },
    apophyllite: {
      forme: `L'apophyllite a des feuillets de tétraèdres en anneaux de quatre et de huit, reliés par le calcium et le potassium, avec de l'eau
        entre les feuillets. Chauffée, elle perd son eau et s'exfolie (grec « qui s'effeuille »).`,
      intro: `L'apophyllite cristallise dans les cavités des basaltes.`,
      scenarios: [s("Dans une bulle de basalte", `Avec les zéolites : basaltes du Deccan (Inde), Islande.`, RARE("dépôt d'eau chaude dans les cavités d'une lave."))],
    },
    prehnite: {
      sansForme: SF("la prehnite forme des agrégats mamelonnés vert pâle."),
      forme: `Feuillets de tétraèdres reliés par des octaèdres d'aluminium et du calcium : un phyllosilicate dont les feuillets restent liés.`,
      intro: `La prehnite cristallise dans les basaltes faiblement chauffés et leurs cavités.`,
      scenarios: [s("Dans un basalte faiblement chauffé", `Faciès prehnite–pumpellyite, vers 200–300 °C ; premier minéral nommé d'après une personne (le colonel Hendrik von Prehn, 1788).`, RARE("voir la fiche de la pumpellyite."))],
    },
    kaolinite_m: {
      sansForme: SF("la kaolinite forme des plaquettes de quelques micromètres ; sa forme et sa structure sont détaillées dans la partie Argiles."),
      forme: `Feuillet « 1:1 » (une couche de tétraèdres, une couche d'octaèdres d'aluminium) : voir la fiche complète dans la partie Argiles.`,
      intro: `La kaolinite est l'argile de l'altération acide et bien drainée.`,
      scenarios: [s("Voir la partie Argiles", `Formation, climat et gisements sont décrits dans la fiche « Kaolinite » de la partie Argiles.`, RARE("voir la fiche dans la partie Argiles."))],
    },
    illite_m: {
      sansForme: SF("l'illite forme des particules microscopiques ; voir la partie Argiles."),
      forme: `Mica mal cristallisé, pauvre en potassium : voir la fiche complète dans la partie Argiles.`,
      intro: `L'illite est l'argile la plus abondante des roches sédimentaires.`,
      scenarios: [s("Voir la partie Argiles", `Formation, enfouissement et diagenèse sont décrits dans la fiche « Illite » de la partie Argiles.`, RARE("voir la fiche dans la partie Argiles."))],
    },
    smectites_m: {
      sansForme: SF("les smectites forment des particules microscopiques ; voir la partie Argiles."),
      forme: `Feuillets 2:1 qui gonflent en absorbant de l'eau : voir la fiche complète dans la partie Argiles.`,
      intro: `Les smectites sont les argiles gonflantes.`,
      scenarios: [s("Voir la partie Argiles", `Formation et gonflement sont décrits dans la fiche « Smectites » de la partie Argiles.`, RARE("voir la fiche dans la partie Argiles."))],
    },
  });
})();
