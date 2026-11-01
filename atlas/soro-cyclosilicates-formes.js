// ============================================================
// CLASSES IX.B (sorosilicates) et IX.C (cyclosilicates) : formes cristallines (cristal.js) et modes de formation (MIN_F)
// chantier F.4, 01/10/2026. Chargé après nesosilicates-formes.js. Mailles = celles des structures 3D (COD).
// Épidotes en P2₁/m (a 8,9 · b 5,6 · c 10,2, β 115°) : allongement selon b, comme dans les ouvrages.
// Tourmalines : classe 3m polaire dessinée telle quelle (prisme trigonal + prisme hexagonal, rhomboèdre en haut, base en bas).
// ============================================================

(function () {
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  const EPIDOTE = (nom, couleur, m, cod, note) => ({
    nom, couleur, systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P", maille: m, mailleSource: cod,
    azimut: 70, elevation: 14,
    facies: [{ nom: "Prisme strié", formes: [
      { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.1 },
      { sym: "r", hkl: [-1, 0, 1], nom: "pinacoïde", d: 1.05 }, { sym: "n", hkl: [-1, 1, 1], nom: "prisme", d: 2.6 }], note }],
    clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.22 }],
  });
  const TOURMALINE = (nom, couleur, a, c, cod, note) => ({
    nom, couleur, systeme: "trigonal", classe: "3m", classeNom: "ditrigonale pyramidale (polaire)", reseau: "R", maille: HEX(a, c), mailleSource: cod,
    azimut: 18, elevation: 14,
    facies: [{ nom: "Prisme à section triangulaire", formes: [
      { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme trigonal", d: 1.0 }, { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.06 },
      { sym: "r", hkl: [1, 0, -1, 1], nom: "pyramide trigonale", d: 2.6 }, { sym: "c", hkl: [0, 0, 0, -1], nom: "pédion", d: 2.4 }], note }],
    clivages: [],
  });
  const CANAUX = (nom, couleur, a, c, cod, note, dc) => ({
    nom, couleur, systeme: "hexagonal", classe: "6/mmm", classeNom: "dihexagonale dipyramidale", reseau: "P", maille: HEX(a, c), mailleSource: cod,
    azimut: 20, elevation: 16,
    facies: [{ nom: "Prisme hexagonal", formes: [
      { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: dc || 1.8 }], note }],
    clivages: [],
  });
  const MELILITE = (nom, couleur, a, c, cod, note) => ({
    nom, couleur, systeme: "quadratique", classe: "-42m", classeNom: "scalénoédrique quadratique", reseau: "P", maille: [a, a, c, 90, 90, 90], mailleSource: cod,
    azimut: 22, elevation: 18,
    facies: [{ nom: "Tablette carrée", formes: [
      { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.5 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.05 }], note }],
    clivages: [{ hkl: [0, 0, 1], qualite: "net", nom: "basal", pas: 0.24 }],
  });

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {
    epidote: EPIDOTE("Épidote", "#5e7a2a", [8.914, 5.64, 10.162, 90, 115.4, 90], "cod9000220",
      "Cristaux prismatiques vert pistache, étirés selon b et striés dans la longueur, à terminaison en toit. Knappenwand (Autriche) et le Bourg-d'Oisans en fournissent de beaux spécimens."),
    clinozoisite: EPIDOTE("Clinozoïsite", "#b8b49a", [8.879, 5.583, 10.155, 90, 115.5, 90], "cod9000180",
      "De même forme que l'épidote, de teinte grise à vert pâle : moins de fer, donc moins de couleur."),
    piemontite: EPIDOTE("Piémontite", "#8a2a4a", [8.8727, 5.6686, 10.1682, 90, 115.48, 90], "cod9015882",
      "D'où son nom : ce minéral forme des aiguilles rouge violacé dans les quartzites manganésifères de Saint-Marcel (Val d'Aoste, Piémont)."),
    zoisite: {
      nom: "Zoïsite", couleur: "#5a6aa8", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [16.212, 5.559, 10.036, 90, 90, 90], mailleSource: "cod9000179", azimut: 70, elevation: 14,
      facies: [{ nom: "Prisme strié", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.0 }, { sym: "d", hkl: [1, 0, 1], nom: "prisme", d: 1.05 },
        { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 2.6 }],
        note: "Ces prismes s'étirent selon b. Quant à la tanzanite, d'un bleu violet, c'est une zoïsite enrichie en vanadium, provenant de Merelani (Tanzanie)." }],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.22 }],
    },
    vesuvianite: {
      nom: "Vésuvianite", couleur: "#7a6a2a", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [15.533, 15.533, 11.785, 90, 90, 90], mailleSource: "cod9004529", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme carré", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 },
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.2 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.08 }],
        note: "Les cristaux bruns des skarns et des blocs du Vésuve se présentent en prismes à huit pans, dont le sommet aplati porte des facettes." }],
      clivages: [],
    },
    lawsonite: {
      nom: "Lawsonite", couleur: "#b7c6cc", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "C",
      maille: [8.795, 5.847, 13.142, 90, 90, 90], mailleSource: "cod9000627", azimut: 22, elevation: 22,
      facies: [{ nom: "Tablette losangique", formes: [
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }],
        note: "Dans les schistes bleus, on observe des tablettes losangiques bleu pâle ; la Corse alpine et Syros en recèlent un grand nombre." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.24 }],
    },
    akermanite: MELILITE("Åkermanite", "#c9b48a", 7.8348, 5.0087, "cod9006935",
      "Tablettes carrées et courtes ; dans les laves pauvres en silice, la mélilite forme des baguettes rectangulaires visibles au microscope."),
    gehlenite: MELILITE("Gehlénite", "#bfae8a", 7.685, 5.0636, "cod9006112",
      "Les blocs de marbre rejetés par les volcans (Monte Somma, Fassa) contiennent des tablettes carrées gris-vert."),
    hemimorphite: {
      nom: "Hémimorphite", couleur: "#d6e6ea", systeme: "orthorhombique", classe: "mm2", classeNom: "pyramidale rhombique (polaire)", reseau: "I",
      maille: [8.367, 10.73, 5.115, 90, 90, 90], mailleSource: "cod9008269", azimut: 20, elevation: 12,
      facies: [{ nom: "Tablette à deux bouts différents", formes: [
        { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "t", hkl: [3, 0, 1], nom: "dôme (haut)", d: 1.7 }, { sym: "e", hkl: [0, 1, 1], nom: "dôme (haut)", d: 1.7 }, { sym: "v", hkl: [1, 2, -1], nom: "pyramide (bas)", d: 1.6 }],
        note: "Son nom (« forme à moitié ») vient de ses deux extrémités dissemblables : un sommet tronqué par des dômes d'un côté, une pyramide pointue de l'autre. Lorsqu'on la chauffe, une extrémité se charge positivement et l'autre négativement." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "{110}", pas: 0.24 }],
    },
    benitoite: {
      nom: "Bénitoïte", couleur: "#3a5ac0", systeme: "hexagonal", classe: "-6m2", classeNom: "ditrigonale dipyramidale", reseau: "P",
      maille: HEX(6.643, 9.766), mailleSource: "cod9014388", azimut: 20, elevation: 24,
      facies: [{ nom: "Dipyramide triangulaire", formes: [
        { sym: "p", hkl: [1, 1, -2, 1], nom: "dipyramide trigonale", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.55 }],
        note: "La bénitoïte, bleu saphir, cristallise en triangles : c'est la seule espèce connue de la classe 6̄m2, et elle émet une lueur bleue sous ultraviolets courts. La dipyramide porte ici les indices {11-21} (les ouvrages écrivent {10-11}), car le moteur oriente autrement les axes d'ordre 2 de la classe 6̄m2." }],
      clivages: [],
    },
    beryl: CANAUX("Béryl", "#6aa88a", 9.2077, 9.1953, "cod9001162",
      "Le béryl forme des prismes hexagonaux sectionnés net à la base. Selon l'élément coloré, il devient émeraude (chrome ou vanadium), aigue-marine (fer), morganite (manganèse) ou héliodore. Dans les pegmatites, certains atteignent plusieurs mètres.", 2.2),
    bazzite: CANAUX("Bazzite", "#5a8ac0", 9.549, 9.163, "cod9004606",
      "Baveno et le Val Vigezzo livrent de petits prismes bleu azur, logés dans les fentes alpines et les pegmatites.", 2.4),
    milarite: CANAUX("Milarite", "#c6d9a6", 10.41, 13.845, "cod9001381",
      "Dans les fentes alpines du Val Giuv (Grisons), on trouve des prismes hexagonaux vert pâle.", 1.6),
    cordierite: {
      nom: "Cordiérite", couleur: "#5a5ab0", systeme: "orthorhombique (pseudo-hexagonal)", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "C",
      maille: [17.072, 9.727, 9.351, 90, 90, 90], mailleSource: "cod9002408", azimut: 20, elevation: 16,
      macleNote: "Des macles cycliques, groupées par trois ou par six autour de {110}, donnent naissance à des prismes pseudo-hexagonaux.",
      facies: [{ nom: "Prisme pseudo-hexagonal", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.4 }],
        note: "Les prismes courts, à six pans, reflètent une maille presque hexagonale (a ≈ b√3) : les faces {110} et {010} se recoupent donc à près de 60°." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "médiocre", nom: "{010}", pas: 0.3 }],
    },
    tourmaline: TOURMALINE("Schorl", "#24242a", 15.992, 7.19, "cod9004090",
      "Prismes noirs striés dans le sens de la longueur, à section triangulaire bombée (prisme trigonal et prisme hexagonal) ; leurs deux extrémités diffèrent, conformément à la symétrie polaire 3m."),
    dravite: TOURMALINE("Dravite", "#7a4a2a", 15.926, 7.21, "cod9001513",
      "Cristaux prismatiques bruns, souvent courts, qu'on rencontre dans les marbres et les schistes magnésiens."),
    elbaite: TOURMALINE("Elbaïte", "#c8406a", 15.84, 7.1, "cod9015211",
      "Les pegmatites à lithium fournissent des prismes roses, verts ou bicolores ; le bicolore « melon d'eau » montre un cœur rose entouré d'une écorce verte."),
    uvite: TOURMALINE("Uvite", "#6a5a3a", 15.949, 7.188, "cod9004362",
      "Cristaux courts, bruns à verts, présents dans les marbres."),
    liddicoatite: TOURMALINE("Liddicoatite", "#8a3a6a", 15.88, 7.118, "cod9005381",
      "Prismes malgaches qui, sciés en travers, font apparaître des triangles concentriques de toutes les couleurs."),
    dioptase: {
      nom: "Dioptase", couleur: "#0f8a6a", systeme: "trigonal", classe: "-3", classeNom: "rhomboédrique", reseau: "R",
      maille: HEX(14.566, 7.778), mailleSource: "cod9000576", azimut: 20, elevation: 16,
      facies: [{ nom: "Prisme et rhomboèdre", formes: [
        { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.35 }],
        note: "Tsumeb (Namibie) et le Kazakhstan livrent des prismes courts, vert émeraude, surmontés d'un rhomboèdre. Longtemps prise pour de l'émeraude, elle reste fragile en raison de son clivage parfait." }],
      clivages: [{ hkl: [1, 0, -1, 1], qualite: "parfait", nom: "rhomboédrique", pas: 0.24 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    london: "London D. (2008). <i>Pegmatites</i>. Canadian Mineralogist, Special Publication 10.",
    henry: "Henry D. J. et Dutrow B. L. (1996). « Metamorphic tourmaline and its petrologic applications ». <i>Reviews in Mineralogy</i> 33, p. 503–557.",
    franz: "Franz G. et Liebscher A. (2004). « Physical and chemical properties of the epidote minerals ». <i>Reviews in Mineralogy and Geochemistry</i> 56, p. 1–81.",
    giuliani: "Giuliani G. et al. (2019). « Emerald deposits: a review and enhanced classification ». <i>Minerals</i> 9, 105.",
  };
  const PEG = "L'atlas n'offre pas de diagramme ici : la pegmatite se forme à partir d'un liquide saturé d'eau et d'éléments rares, cas qu'une représentation du granite ne saurait traduire.";
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + (t || "minéral rare, qui se forme dans des conditions particulières.") });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE()), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin) => ({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." });
  const SKARN = (min) => contact([pt(150, 0.12, 1, "Un calcaire est situé à 4 ou 5 km d'un granite."), pt(550, 0.12, 2, "Le granite, en se mettant en place, réchauffe ce calcaire et y apporte silice, fer et aluminium :" + min + " cristallise.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met le skarn à jour.")]);
  const SF = (t) => "Forme non dessinée : " + t;

  Object.assign(MIN_F, {
    // ═══════════ sorosilicates ═══════════
    epidote: {
      forme: `Les chaînes d'octaèdres d'aluminium et de fer, orientées selon b, forment l'ossature de l'épidote. Des tétraèdres SiO₄ isolés et des paires Si₂O₇ relient ces chaînes (d'où sa place parmi les sorosilicates). Les cristaux s'allongent dans le sens des chaînes, en prismes striés selon b, et le fer ferrique donne la teinte vert pistache.`,
      intro: `Dans les basaltes et les roches calciques soumis à un métamorphisme de faible degré, c'est l'épidote qui domine ; elle explique la couleur verte des schistes verts.`,
      scenarios: [
        s("Dans un schiste vert", `Porté vers 300 à 450 °C dans un contexte enfoui et aqueux, un basalte voit son plagioclase calcique et ses pyroxènes se muer en chlorite, albite, actinote et épidote : le résultat est un schiste vert.`, meta([pt(10, 0, 1, "Le basalte prend naissance au fond des océans."), pt(400, 0.4, 2, "Enfoui et porté vers 300 à 450 °C, il recristallise : l'épidote se développe en même temps que la chlorite et l'actinote.", { bande: "schistes verts" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison", SRC.franz]),
        s("Dans une fente alpine", `Ce sont des eaux chaudes qui, circulant dans les fissures alpines, précipitent l'épidote en prismes brillants, accompagnée de quartz et d'albite (Bourg-d'Oisans, Knappenwand).`, RARE("dépôt issu d'eau chaude circulant dans une fissure.")),
      ],
    },
    clinozoisite: {
      forme: `La clinozoïsite reprend l'édifice de l'épidote, l'aluminium remplaçant le fer : sa teinte s'éclaircit d'autant. Ces deux minéraux forment une série continue.`,
      intro: `La clinozoïsite se forme comme l'épidote, mais dans des roches pauvres en fer.`,
      scenarios: [s("Dans une roche métamorphique calcique", `On la rencontre dans les schistes verts, les marbres impurs et la saussurite, où un plagioclase s'est couvert d'un feutrage fin de clinozoïsite et d'albite.`, meta([pt(10, 0, 1, "Ce sont des roches enrichies en calcium et en aluminium qui en donnent naissance."), pt(400, 0.4, 2, "Lorsqu'elle s'enfouit et s'échauffe vers 300 à 500 °C, la roche laisse grandir la clinozoïsite.", { bande: "schistes verts" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.franz])],
    },
    zoisite: {
      forme: `Même formule que la clinozoïsite, mais dans une maille orthorhombique dont l'empilement de chaînes diffère. Le vanadium colore la tanzanite ; sous l'effet de la chaleur, elle vire du brun au bleu violet.`,
      intro: `On trouve la zoïsite dans les roches calciques métamorphisées, jusque dans les éclogites.`,
      scenarios: [s("Dans une roche métamorphique de haute pression", `Les gneiss calciques, les amphibolites et les éclogites hébergent cette espèce. À Merelani (Tanzanie), seul gisement mondial, la tanzanite a pris forme vers 600 °C dans des gneiss graphiteux.`, meta([pt(15, 0, 1, "Une roche calcique se forme."), pt(600, 1.0, 2, "Enfouie à grande profondeur et chauffée vers 600 °C, elle voit croître la zoïsite.", { bande: "zoïsite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    piemontite: {
      forme: `Épidote dont le manganèse trivalent occupe un site octaédrique, ce qui lui confère une teinte rouge.`,
      intro: `La piémontite se développe dans les roches métamorphiques oxydées et riches en manganèse.`,
      scenarios: [s("Dans un quartzite manganésifère", `Saint-Marcel (Val d'Aoste) : schistes et quartzites manganésifères soumis au métamorphisme.`, meta([pt(15, 0, 1, "Un sédiment siliceux, riche en manganèse, se met en place."), pt(450, 0.7, 2, "Enfoui puis chauffé, il recristallise : la piémontite forme des aiguilles rouges.", { bande: "piémontite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    allanite: {
      sansForme: SF("L'allanite se présente en grains et en tablettes, souvent métamictes (réseau cristallin détruit par sa radioactivité)."),
      forme: `Épidote dans laquelle les terres rares (cérium, lanthane) et le thorium se substituent au calcium : radioactive, elle détruit fréquemment son propre réseau (état métamicte).`,
      intro: `Dans les granites, l'allanite constitue le principal minéral accessoire porteur de terres rares.`,
      scenarios: [s("Dans un granite", `De petits grains bruns, entourés dans la biotite d'un halo d'irradiation.`, { type: "magma", echelle: "croute", chemin: [pt(850, 0.4, 1, "Lorsque la croûte entre en fusion, les terres rares migrent vers le magma."), pt(760, 0.3, 2, "Le magma refroidit : l'allanite cristallise.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"])],
    },
    vesuvianite: {
      forme: `Des colonnes de calcium et de fer, disposées selon c, se combinent avec des tétraèdres SiO₄ et des paires Si₂O₇ pour former la vésuvianite (idocrase). Ce minéral compte plus de 100 atomes par formule ; sa symétrie quadratique lui donne ses prismes carrés.`,
      intro: `Les skarns et les marbres de contact voient cristalliser la vésuvianite.`,
      scenarios: [s("Dans un skarn", `Elle naît au contact d'un granite avec un calcaire, en compagnie du grossulaire et du diopside, et fut décrite dans les blocs projetés par le Vésuve.`, SKARN("la vésuvianite"), ["tuttle"])],
    },
    pumpellyite: {
      sansForme: SF("La pumpellyite se présente en fibres et en aiguilles vertes, microscopiques."),
      forme: `Des octaèdres en chaînes sont reliés par des SiO₄ et des Si₂O₇. Plus hydratée que l'épidote, la pumpellyite demeure stable à température plus basse.`,
      intro: `Dans les basaltes, la pumpellyite signale un métamorphisme très faible.`,
      scenarios: [s("Dans un basalte faiblement chauffé", `À 200 à 300 °C, la pumpellyite et la prehnite coexistent : c'est le faciès « prehnite-pumpellyite » des basaltes enfouis.`, meta([pt(10, 0, 1, "Un basalte se forme."), pt(270, 0.3, 2, "À une dizaine de kilomètres de profondeur, vers 250 °C, la roche fait apparaître pumpellyite et prehnite.", { bande: "très faible degré" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    lawsonite: {
      forme: `Chaînes d'octaèdres d'aluminium, paires Si₂O₇, calcium et eau (11 %) constituent la lawsonite. Stable seulement sous haute pression et basse température, elle caractérise les zones de subduction froides.`,
      intro: `C'est dans les plaques océaniques en plongée, lors d'une subduction, que naît la lawsonite.`,
      scenarios: [s("Dans un schiste bleu", `Une croûte océanique qui plonge vite reste froide : vers 30 à 50 km et 300 à 400 °C, glaucophane et lawsonite remplacent ses minéraux. La lawsonite transporte l'eau jusqu'à 300 km de profondeur.`, meta([pt(10, 0, 1, "La subduction entraîne vers le bas un basalte issu du plancher océanique."), pt(380, 1.2, 2, "Vers 40 km, à 350 à 400 °C seulement, la lawsonite cristallise.", { bande: "schistes bleus" }), pt(200, 0.3, 3, "Elle remonte en surface sans avoir subi de réchauffement notable (Corse alpine, Syros).")], { echelle: "hp" }), ["pattison"])],
    },
    akermanite: {
      forme: `Le calcium occupe l'espace entre les couches de tétraèdres ; les Si₂O₇ sont reliés par un tétraèdre de magnésium. Il s'agit de la mélilite magnésienne.`,
      intro: `Les laves très pauvres en silice et les calcaires fortement cuits abritent l'åkermanite.`,
      scenarios: [s("Dans une lave sous-saturée", `Présente dans les mélilitites (Kaiserstuhl, Eifel) et les calcaires au contact de laves, cette phase figure aussi dans les laitiers de haut-fourneau et dans les inclusions blanches des météorites carbonées, parmi les plus anciens solides du Système solaire.`, RARE("laves très pauvres en silice."))],
    },
    gehlenite: {
      forme: `Mélilite alumineuse : l'aluminium se substitue au magnésium et à la moitié du silicium.`,
      intro: `La gehlénite se forme dans les calcaires argileux fortement chauffés.`,
      scenarios: [s("Au contact d'un magma très chaud", `Calcaires impurs portés au-delà de 900 °C à faible pression (Monte Somma) ; on la retrouve également dans le clinker de ciment.`, contact([pt(150, 0.05, 1, "Un calcaire argileux affleure à faible profondeur."), pt(950, 0.05, 2, "Un magma le porte au-delà de 900 °C : la gehlénite se met à cristalliser.", { bande: "gehlénite" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]), ["tuttle"])],
    },
    hardystonite: {
      sansForme: SF("la hardystonite forme des masses grenues."),
      forme: `Mélilite dans laquelle le zinc se substitue au magnésium.`,
      intro: `La hardystonite n'est connue qu'à Franklin (New Jersey).`,
      scenarios: [s("Dans le marbre de Franklin", `Grains blancs qui présentent une luminescence violette sous ultraviolets.`)],
    },
    hemimorphite: {
      forme: `L'hémimorphite associe des paires Si₂O₇ à des tétraèdres de zinc orientés dans le même sens le long de c : ses deux extrémités diffèrent, et il se charge électriquement lorsqu'on le chauffe (pyroélectricité).`,
      intro: `L'hémimorphite résulte de l'oxydation de la blende, en compagnie de la smithsonite.`,
      scenarios: [s("Dans la zone oxydée d'un gisement de zinc, à proximité de la surface.", `Les anciens mineurs appelaient « calamine » l'association de ce minéral et de la smithsonite (Les Malines, Moresnet).`, RARE("elle résulte de l'oxydation près de la surface."))],
    },
    bertrandite: {
      sansForme: SF("la bertrandite se présente en petites tablettes mal décrites."),
      forme: `Tétraèdres BeO₃(OH) et paires Si₂O₇ composent la charpente de ce minéral.`,
      intro: `Aujourd'hui, la bertrandite constitue le principal minerai de béryllium.`,
      scenarios: [s("Dans un tuf altéré", `Dans le Spor Mountain (Utah), la bertrandite s'est déposée dans des tufs rhyolitiques, sous l'action de fluides fluorés : c'est la première source de béryllium au monde. Elle se forme aussi aux dépens du béryl, dans les pegmatites. Décrite près de Nantes en 1883, elle rend hommage au minéralogiste Émile Bertrand.`, RARE())],
    },
    ilvaite: {
      sansForme: SF("Décrits dans une maille autre que celle de la structure 3D, ses prismes sont noirs et striés."),
      forme: `Des paires Si₂O₇ relient entre elles des doubles chaînes d'octaèdres, faites de fer ferreux et ferrique et orientées selon c.`,
      intro: `C'est à l'île d'Elbe (Ilva en latin) qu'a été décrite l'ilvaïte, minéral des skarns ferrifères.`,
      scenarios: [s("Dans un skarn à fer", `On la trouve dans les skarns de Rio Marina (Elbe) et de Dal'negorsk (Russie), en compagnie de l'hédenbergite et de la magnétite.`, SKARN("l'ilvaïte"), ["tuttle"])],
    },
    thortveitite: {
      sansForme: SF("la thortveitite se présente en prismes mal décrits."),
      forme: `Des paires Si₂O₇ « droites », où l'angle Si-O-Si atteint 180°, unissent des octaèdres de scandium.`,
      intro: `La thortveitite constitue le principal minéral du scandium.`,
      scenarios: [s("Dans une pegmatite", `Iveland (Norvège), Madagascar. Le scandium, prévu par Mendeleïev, est rarement concentré : cette espèce compte parmi les rares minéraux qui en renferment de grandes quantités.`, { cond: false, sansDiagramme: PEG })],
    },
    cuspidine: {
      sansForme: SF("la cuspidine se présente en grains et en cristaux en pointe de lance, mal décrits."),
      forme: `Chaînes de calcium et paires Si₂O₇, avec du fluor en plus.`,
      intro: `Dans les calcaires chauffés en milieu fluoré, la cuspidine voit le jour.`,
      scenarios: [s("Au contact d'un magma", `On la repère dans les skarns et dans les blocs de marbre du Vésuve, ainsi que dans les laitiers sidérurgiques enrichis en fluorine.`)],
    },
    tilleyite: {
      sansForme: SF("la tilleyite se présente en grains dans les marbres."),
      forme: `Paires Si₂O₇ et triangles CO₃ reliés par des atomes de calcium : il s'agit d'un silicate-carbonate.`,
      intro: `C'est dans les calcaires portés à très haute température que naît la tilleyite.`,
      scenarios: [s("Au contact d'un magma très chaud", `Crestmore (Californie), Scawt Hill (Irlande du Nord).`)],
    },
    rankinite: {
      sansForme: SF("la rankinite forme des grains."),
      forme: `Paires Si₂O₇ reliées par des calciums.`,
      intro: `Au-delà de 900 °C, dans les calcaires chauffés, apparaît la rankinite.`,
      scenarios: [s("Au contact d'un magma très chaud", `Gisements : Scawt Hill (Irlande du Nord) et Hatrurim (Israël). Elle figure également dans le clinker de ciment.`)],
    },
    axinite: {
      sansForme: SF("Triclinique, la classe la moins symétrique, rassemble ses cristaux en coins tranchants ; leur orientation de description diffère de celle retenue pour la structure 3D."),
      forme: `Groupes Si₂O₇ reliés deux à deux par des triangles de bore, octaèdres d'aluminium et de fer, calcium : tels sont les constituants de l'axinite.
Dépourvue d'axe et de plan de symétrie, elle doit son nom à des cristaux aplatis et tranchants comme une hache.`,
      intro: `Dans les fissures de roches calciques réchauffées par un granite, l'axinite prend forme.`,
      scenarios: [s("Dans une fente ou un skarn", `Des fluides venus des granites, chargés de bore, la laissent dans les fissures. Bourg-d'Oisans (Isère), qui livre les cristaux de référence, et Puiva (Oural) en sont les gisements phares.`, RARE("une fissure où se précipitent des fluides enrichis en bore."))],
    },

    // ═══════════ cyclosilicates ═══════════
    benitoite: {
      forme: `Des anneaux de trois tétraèdres (Si₃O₉), liés par des octaèdres de titane, enserrent le baryum. Aucun autre minéral connu ne partage sa symétrie 6̄m2, ce qui explique ses cristaux triangulaires.`,
      intro: `Un seul gisement notable de bénitoïte existe dans le monde, en Californie.`,
      scenarios: [s("Dans une serpentinite traversée par des fluides", `Comté de San Benito (Californie) : elle occupe des veines de natrolite recoupant une serpentinite
        convertie en schiste bleu. Elle est la pierre officielle de la Californie.`, RARE("composition et circonstances exceptionnelles."))],
    },
    wadeite: {
      sansForme: SF("la wadéite forme de petits grains."),
      forme: `Le potassium s'insère entre les anneaux de trois tétraèdres, reliés par des octaèdres de zirconium.`,
      intro: `Dans les laves riches en potassium (lamproïtes), la wadéite apparaît.`,
      scenarios: [s("Dans une lamproïte", `Décrite à partir des lamproïtes de Kimberley, en Australie occidentale.`)],
    },
    catapleiite: {
      sansForme: SF("Des tablettes pseudo-hexagonales, peu documentées, constituent la catapléiite."),
      forme: `Des octaèdres de zirconium relient des anneaux de trois tétraèdres ; le sodium et l'eau occupent les cavités.`,
      intro: `Les syénites néphéliniques et leurs pegmatites hébergent la catapléiite.`,
      scenarios: [s("Dans une pegmatite de syénite", `On la signale au fjord de Langesund (Norvège) et au Mont Saint-Hilaire (Québec).`, { cond: false, sansDiagramme: PEG })],
    },
    joaquinite: {
      sansForme: SF("la joaquinite se présente en petits cristaux bruns, mal décrits."),
      forme: `Des octaèdres de titane relient des anneaux de quatre tétraèdres ; baryum et terres rares occupent l'espace voisin.`,
      intro: `À San Benito (Californie), la joaquinite se trouve aux côtés de la bénitoïte.`,
      scenarios: [s("Avec la bénitoïte", `Ce sont les veines à bénitoïte de la crête de Joaquin Ridge qui ont livré sa description en 1909.`)],
    },
    baotite: {
      sansForme: SF("la baotite forme des grains."),
      forme: `Des colonnes d'octaèdres de titane et de niobium s'associent à des anneaux de quatre tétraèdres, tandis que les canaux abritent baryum et chlore.`,
      intro: `Le gisement géant de terres rares de Bayan Obo (Chine) a servi à décrire la baotite.`,
      scenarios: [s("Dans le gisement de Bayan Obo", `Au plus grand gisement de terres rares du monde (Mongolie-Intérieure), la baotite se loge dans des veines de quartz et de carbonates.`)],
    },
    beryl: {
      forme: `Des colonnes d'anneaux de six tétraèdres (Si₆O₁₈), disposées selon c, forment l'ossature du béryl ; octaèdres d'aluminium et tétraèdres de béryllium les relient. Les canaux laissés entre anneaux accueillent eau et alcalins, et la symétrie hexagonale produit les prismes à six pans.`,
      intro: `Pegmatites et greisens hébergent le béryl. Quant à l'émeraude, elle se forme à la rencontre de roches chargées de chrome.`,
      scenarios: [
        s("Dans une pegmatite", `Presque absent des minéraux du granite, le béryllium s'accumule dans les derniers liquides ; le béryl prend alors place dans les pegmatites, où il atteint parfois plusieurs mètres (Madagascar, Brésil), comme à Chanteloube (Haute-Vienne) en France.`, { cond: false, sansDiagramme: PEG }, [SRC.london]),
        s("L'émeraude", `Un béryl devient émeraude grâce au chrome ou au vanadium, à condition qu'un fluide porteur de béryllium, issu de granites, rencontre une roche chromifère (serpentinite, schiste noir). À Muzo (Colombie), les saumures chaudes ont fait croître les émeraudes dans des schistes noirs, sans qu'aucun granite n'intervienne.`, RARE("Ce point de rencontre réunit deux sources métalliques qui ne figurent pas dans les diagrammes de l'atlas."), [SRC.giuliani]),
      ],
    },
    bazzite: {
      forme: `Teinte bleue : dans ce béryl, le scandium remplace l'aluminium.`,
      intro: `Riche en scandium, la bazzite représente un béryl peu fréquent.`,
      scenarios: [s("Dans une fente alpine ou une pegmatite", `Dans les cavités des granites et les fentes, à Baveno (Piémont) comme dans le Val Vigezzo, apparaissent de petits prismes bleus.`, { cond: false, sansDiagramme: PEG })],
    },
    cordierite: {
      forme: `Des anneaux de six tétraèdres, silicium et aluminium ordonnés, s'empilent en canaux et sont reliés par du magnésium : telle est la cordiérite. L'ordre Si-Al la fait cristalliser en maille orthorhombique, presque hexagonale. Elle est fortement pléochroïque, bleue ou jaune selon la direction de regard, ce qui a suggéré aux Vikings l'idée de « pierre de soleil ».`,
      intro: `Les roches alumineuses chauffées sous faible pression abritent la cordiérite.`,
      scenarios: [s("Autour d'un granite", `Cornéennes, gneiss chauffés à faible profondeur (moins de 0,5 GPa) et granites ayant assimilé des schistes en renferment. Le nom honore le géologue français Louis Cordier.`, contact([pt(150, 0.12, 1, "Un schiste argileux repose à 4 km."), pt(600, 0.12, 2, "Un granite porte la roche vers 550 à 650 °C : la cordiérite cristallise.", { bande: "cordiérite" }), pt(15, 0, 3, "L'érosion met la cornéenne à jour.")]), ["pattison", "tuttle"])],
    },
    sekaninaite: {
      sansForme: SF("En grains et en prismes, la sékaninaïte est mal décrite."),
      forme: `Le fer ferreux prend la place du magnésium dans cette cordiérite.`,
      intro: `Granites et pegmatites riches en fer voient se former la sékaninaïte.`,
      scenarios: [s("Dans une pegmatite", `Dolní Bory (République tchèque) a fourni la description de grands cristaux bleus.`, { cond: false, sansDiagramme: PEG })],
    },
    indialite: {
      sansForme: SF("l'indialite forme des grains microscopiques."),
      forme: `Silicium et aluminium y sont désordonnés : cette forme hexagonale de la cordiérite exige une température très élevée pour apparaître.`,
      intro: `Des argiles cuites par des feux de charbon ou par des laves donnent l'indialite.`,
      scenarios: [s("Dans une argile cuite", `À Bokaro (Inde), des argiles cuites par la combustion spontanée d'une couche de charbon ont livré sa description.`)],
    },
    tourmaline: {
      forme: `Les tourmalines montrent des anneaux de six tétraèdres orientés dans le même sens selon c, auxquels s'ajoutent triangles de bore et octaèdres. L'absence de centre de symétrie rend le cristal polaire : sous l'effet de la chaleur ou d'une pression, ses deux extrémités se chargent électriquement (pyroélectricité, piézoélectricité). Les Hollandais s'en servaient pour retirer la cendre des pipes. Le triangle bombé de la section résulte de l'association du prisme trigonal et du prisme hexagonal.`,
      intro: `Dans les granites et les pegmatites, la tourmaline noire, ou schorl, domine.`,
      scenarios: [s("Dans un granite ou une pegmatite", `En fin de cristallisation, le bore, que les minéraux du granite rejettent, s'enrichit : le schorl pousse alors en aiguilles noires dans les granites, pegmatites et greisens (granites de Bretagne et du Limousin).`, { type: "magma", echelle: "croute", chemin: [pt(800, 0.3, 1, "Un granite riche en bore cristallise."), pt(680, 0.2, 2, "Le bore s'accumule dans les liquides résiduels, où le schorl se met à cristalliser.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann", SRC.london])],
    },
    dravite: {
      forme: `Tourmaline magnésienne, brune.`,
      intro: `Ce sont les roches magnésiennes métamorphisées qui produisent la dravite.`,
      scenarios: [s("Dans un schiste ou un marbre", `Lors du métamorphisme, le bore des argiles marines se retrouve dans la dravite, que l'on doit à la vallée de la Drave (Carinthie).`, meta([pt(15, 0, 1, "Des argiles marines chargées en bore se déposent au fond de la mer."), pt(500, 0.5, 2, "Une fois enfouie puis chauffée, cette argile fait cristalliser la dravite.", { bande: "dravite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.henry])],
    },
    elbaite: {
      forme: `Au lithium et à l'aluminium, cette tourmaline peut rester presque incolore ; ses traces la teintent ensuite de toutes les couleurs (manganèse rose, fer bleu ou vert). Les variations de composition pendant la croissance dessinent des cristaux zonés.`,
      intro: `Les pegmatites à lithium fournissent l'elbaïte, tourmaline utilisée en joaillerie.`,
      scenarios: [s("Dans une pegmatite à lithium", `Ses gisements : l'île d'Elbe, qui lui donne son nom, puis Minas Gerais, Madagascar et l'Afghanistan.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    uvite: {
      forme: `Tourmaline au calcium et au magnésium.`,
      intro: `L'uvite est la tourmaline des marbres.`,
      scenarios: [s("Dans un marbre", `La dravite se loge dans des marbres et des skarns magnésiens, au Brésil comme au Sri Lanka, où la province d'Uva a servi de référence.`, RARE(), [SRC.henry])],
    },
    liddicoatite: {
      forme: `Riche en calcium et en lithium, cette tourmaline garde dans ses cristaux la trace des changements du liquide pegmatitique : zones triangulaires concentriques, de toutes les couleurs.`,
      intro: `Madagascar est l'endroit où les pegmatites portent le plus fréquemment la liddicoatite.`,
      scenarios: [s("Dans une pegmatite à lithium", `À Anjanabonoina (Madagascar), ses cristaux, une fois débités en tranches, font référence.`, { cond: false, sansDiagramme: PEG })],
    },
    dioptase: {
      forme: `Des atomes de cuivre disposés en carré relient les anneaux de six tétraèdres de la dioptase. Dans ses canaux, les molécules d'eau dessinent également des anneaux.`,
      intro: `Sous climat sec, dans la zone oxydée des gisements de cuivre, se développe la dioptase.`,
      scenarios: [s("Dans la zone oxydée d'un gisement cuprifère", `Tsumeb (Namibie), Altyn-Tyube (Kazakhstan) et le Congo : dans ce cadre, une eau peu abondante oxyde le cuivre et fournit la silice des roches ; la dioptase croît alors dans les cavités.`, { type: "climat", domaines: [[12, 30, 0.05, 0.5]], etiquettes: [["dioptase", 21, 0.62]], villes: ["Perpignan", "Marseille"],
          chemin: [{ T: 20, ai: 0.25, n: 1, t: "Tsumeb (Namibie) : climat chaud et semi-aride." }, { n: 2, t: "Une eau peu abondante oxyde le cuivre et apporte la silice : la dioptase se développe dans les cavités." }],
          note: "Domaine schématique : climat aride à semi-aride." }, ["h5"])],
    },
    milarite: {
      forme: `La milarite appartient à un groupe dont les doubles anneaux de douze tétraèdres s'empilent en colonnes, cimentés par du béryllium et du calcium.`,
      intro: `Dans les fentes alpines comme dans les pegmatites, c'est la milarite qui se développe.`,
      scenarios: [s("Dans une fente alpine", `Val Giuv (Grisons), localité de sa description (sous le nom erroné de Val Milar).`, { cond: false, sansDiagramme: PEG })],
    },
    osumilite: {
      sansForme: SF("l'osumilite se présente en petits prismes dans les cavités des laves."),
      forme: `Les anneaux doubles, formés chacun de douze tétraèdres, sont liés par du magnésium, du fer et de l'aluminium.`,
      intro: `C'est dans les laves acides et les granulites les plus chaudes que se forme l'osumilite.`,
      scenarios: [s("Dans une lave ou une granulite", `Cavités des rhyolites de la péninsule d'Osumi (Japon) ; granulites dépassant 900 °C.`)],
    },
    sugilite: {
      sansForme: SF("la sugilite se présente en masses violettes compactes."),
      forme: `Doubles anneaux de douze tétraèdres associés à du lithium, du sodium, du fer et du manganèse.`,
      intro: `Pierre ornementale d'Afrique du Sud, la sugilite se présente en violet.`,
      scenarios: [s("Dans un gisement de manganèse", `Mine de Wessels (Kalahari) ; décrite au Japon, elle porte le nom du pétrologue Ken-ichi Sugi.`)],
    },
    roedderite: {
      sansForme: SF("la rœddérite se présente en grains microscopiques."),
      forme: `Doubles anneaux de douze tétraèdres liés entre eux par du magnésium.`,
      intro: `Une météorite a permis de décrire la rœddérite.`,
      scenarios: [s("Dans une météorite et des laves potassiques", `On retrouve cette espèce dans une chondrite à enstatite d'Indarch, ainsi que dans des lamproïtes d'Espagne.`)],
    },
    eudialyte: {
      sansForme: SF("l'eudialyte se présente en grains et en cristaux rhomboédriques, mal décrits."),
      forme: `Structure parmi les plus complexes des minéraux : anneaux de trois et de neuf tétraèdres, octaèdres de zirconium et anneaux d'octaèdres de calcium. Elle se dissout aisément dans les acides, ce qui lui vaut son nom (« bien soluble »).`,
      intro: `Riche en zirconium et en terres rares, l'eudialyte se forme dans les syénites néphéliniques et pourrait devenir un minerai.`,
      scenarios: [s("Dans une syénite néphélinique", `Ilímaussaq (Groenland), Khibiny et Lovozero (Kola).`)],
    },
  });
})();
