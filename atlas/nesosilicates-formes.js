// ============================================================
// CLASSE IX.A — nésosilicates : formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026
// Chargé après oxydes-formes.js (la braunite y est déjà traitée). Mailles = celles des structures 3D (COD).
// Olivines en Pbnm (a 4,75 · b 10,2 · c 5,98) comme les ouvrages ; Al₂SiO₅, topaze, zircon, grenats : maille des ouvrages.
// Non dessinés (MIN_F[id].sansForme) : minéraux en grains, en fibres, ou de très haute pression, et ceux dont les faces publiées
// sont décrites dans une autre maille que celle de la structure (titanite, datolite).
// ============================================================

(function () {
  const CUB = (a) => [a, a, a, 90, 90, 90];
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  const GRENAT = (nom, couleur, a, cod, noteD, noteT) => ({
    nom, couleur, systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "I", maille: CUB(a), mailleSource: cod,
    facies: [
      { nom: "Dodécaèdre", formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }], note: noteD },
      { nom: "Trapézoèdre", formes: [{ sym: "n", hkl: [2, 1, 1], nom: "trapézoèdre", d: 1.0 }], note: noteT },
      { nom: "Dodécaèdre et trapézoèdre", formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }, { sym: "n", hkl: [2, 1, 1], nom: "trapézoèdre", d: 1.06 }],
        note: "Le trapézoèdre biseaute les arêtes du dodécaèdre : cette combinaison est fréquente chez les grenats des skarns et des micaschistes." },
    ],
    clivages: [],
  });
  const OLIVINE = (nom, couleur, m, cod, note) => ({
    nom, couleur, systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P", maille: m, mailleSource: cod,
    azimut: 24, elevation: 14,
    facies: [{ nom: "Prisme", formes: [
      { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
      { sym: "k", hkl: [0, 2, 1], nom: "prisme", d: 1.15 }, { sym: "d", hkl: [1, 0, 1], nom: "prisme", d: 1.2 }], note }],
    clivages: [{ hkl: [0, 1, 0], qualite: "imparfait", nom: "{010}", pas: 0.3 }],
  });
  const ZIRCON = (nom, couleur, a, c, cod, notePrisme) => ({
    nom, couleur, systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I", maille: [a, a, c, 90, 90, 90], mailleSource: cod,
    azimut: 22, elevation: 14,
    facies: [{ nom: "Prisme et bipyramide", formes: [
      { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.35 }], note: notePrisme }],
    clivages: [],
  });

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {
    // ── silicates de béryllium et de zinc à charpente de tétraèdres ──
    phenacite: {
      nom: "Phénacite", couleur: "#eef0f2", systeme: "trigonal", classe: "-3", classeNom: "rhomboédrique", reseau: "R",
      maille: HEX(12.472, 8.251), mailleSource: "cod9001088", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme et rhomboèdre", formes: [
        { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.1 }],
        note: "Prismes courts et incolores, terminés par un rhomboèdre ; son éclat, qui imite celui du quartz, lui a valu son nom (du grec <i>phenax</i>, « trompeur »)." }],
      clivages: [],
    },
    willemite: {
      nom: "Willémite", couleur: "#9bc57a", systeme: "trigonal", classe: "-3", classeNom: "rhomboédrique", reseau: "R",
      maille: HEX(13.948, 9.315), mailleSource: "cod9007627", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme et rhomboèdre", formes: [
        { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.1 }],
        note: "Prismes hexagonaux courts ; à Franklin, les grains verts deviennent vert vif sous ultraviolets." }],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "bon", nom: "basal", pas: 0.25 }],
    },

    // ── olivines ──
    olivine: OLIVINE("Olivine", "#9aa63a", [4.752, 10.193, 5.977, 90, 90, 90], "cod9000535",
      "Ses cristaux, trapus, sont rarement nets ; en général, l'olivine se présente en grains verts, dans les basaltes ou sous forme de nodules (péridot). Les plus beaux cristaux gemmes proviennent de l'île de Zabargad, en mer Rouge."),
    forsterite: OLIVINE("Forstérite", "#b6bd63", [4.752, 10.193, 5.977, 90, 90, 90], "cod9000535",
      "Prismes trapus, de teinte allant de l'incolore au vert pâle, dans les marbres dolomitiques et les péridotites."),
    fayalite: OLIVINE("Fayalite", "#5d5233", [4.818, 10.471, 6.086, 90, 90, 90], "cod9000469",
      "Forme identique à celle de la forstérite, de teinte brun-noir ; les cristaux sont rares et se rencontrent dans les cavités des rhyolites et des granites alcalins."),

    // ── grenats ──
    grenat: GRENAT("Grenat", "#8a2a2a", 11.531, "cod9000233",
      "Douze faces en losange : c'est la forme classique des grenats des micaschistes, dont le nom évoque la « grenade », par comparaison avec les graines du fruit.",
      "Vingt-quatre faces trapézoïdales, fréquentes chez l'almandin et la spessartine des pegmatites."),
    almandin: GRENAT("Almandin", "#7a1f2a", 11.531, "cod9000233",
      "Dans les micaschistes des îles de Groix (Bretagne), il forme des dodécaèdres rouge sombre, qui atteignent parfois plusieurs centimètres.",
      "Trapézoèdres des pegmatites et des micaschistes."),
    pyrope: GRENAT("Pyrope", "#a8182c", 11.459, "cod9000231",
      "Le pyrope se présente surtout en grains arrondis dans les péridotites et les kimberlites ; les cristaux à faces nettes sont rares.",
      "Trapézoèdres rares."),
    spessartine: GRENAT("Spessartine", "#d4652a", 11.615, "cod9002692",
      "Dodécaèdres orange, dans les pegmatites.",
      "Trapézoèdres d'un orange vif, observés dans les pegmatites de Namibie et du Pakistan."),
    grossulaire: GRENAT("Grossulaire", "#c9a548", 11.845, "cod9000236",
      "Dans les skarns, il apparaît en dodécaèdres miel à verts. Son nom latin, grossularia, renvoie à la groseille, par allusion à la couleur de sa variété verte.",
      "Trapézoèdres, souvent combinés au dodécaèdre (hessonite)."),
    andradite: GRENAT("Andradite", "#4f6a2a", 12.058, "cod9000239",
      "Dodécaèdres de teinte brune à noire (mélanite) ou verte (démantoïde, variété au pouvoir dispersif le plus élevé).",
      "Trapézoèdres, plus rares."),
    uvarovite: GRENAT("Uvarovite", "#1f7a3a", 11.9973, "cod9007149",
      "De petits dodécaèdres vert émeraude tapissent des druses de chromite (Oural, Finlande).",
      "Trapézoèdres, rares."),
    schorlomite: GRENAT("Schorlomite", "#1f1d1c", 12.1464, "cod9007370",
      "Il prend la forme de dodécaèdres noirs au très bel éclat vitreux, dans les syénites néphéliniques et les carbonatites.",
      "Trapézoèdres, rares."),

    // ── groupe du zircon ──
    zircon: Object.assign(ZIRCON("Zircon", "#b07a4a", 6.6039, 5.9783, "cod9005518",
      "Dans les granites, le zircon se présente en grains de quelques dixièmes de millimètre : prismes à quatre faces coiffés d'une pyramide. On les date par la méthode uranium-plomb."), {
      facies: [
        { nom: "Prisme et bipyramide", formes: [{ sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.35 }],
          note: "Dans les granites, le zircon se présente en grains de quelques dixièmes de millimètre : prismes à quatre faces coiffés d'une pyramide. On les date par la méthode uranium-plomb." },
        { nom: "Bipyramide trapue", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }],
          note: "On observe souvent un prisme court surmonté d'une grande pyramide dans les syénites et les roches alcalines. La morphologie des zircons trahit la chimie et la température du magma (typologie de Pupin, 1980)." },
      ],
    }),
    thorite: ZIRCON("Thorite", "#5a3a22", 7.1328, 6.3188, "cod9007624",
      "Ses prismes trapus, à pointe, sont noirs ou orangés (orangite) ; la radioactivité du thorium les rend souvent amorphes."),

    // ── silicates d'alumine ──
    andalousite: {
      nom: "Andalousite", couleur: "#b07a6a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [7.798, 7.9031, 5.5566, 90, 90, 90], mailleSource: "cod9000715", azimut: 22, elevation: 14,
      facies: [{ nom: "Prisme carré", formes: [{ sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.0 }],
        note: "Ses prismes sont presque carrés (a ≈ b). Dans les schistes tachetés, la variété chiastolite affiche une croix noire faite de matière charbonneuse, que la croissance du cristal a repoussée." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "bon", nom: "{110}", pas: 0.24 }],
    },
    disthene: {
      nom: "Disthène", couleur: "#5a7ac0", systeme: "triclinique", classe: "-1", classeNom: "pinacoïdale", reseau: "P",
      maille: [7.1262, 7.852, 5.5724, 89.99, 101.11, 106.03], mailleSource: "cod9000720", azimut: 22, elevation: 14,
      facies: [{ nom: "Lame", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.35 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 3.2 }],
        note: "Ce sont de longues lames bleues et aplaties ; la dureté varie avec la direction (4,5 dans la longueur, 6,5 en travers), d'où son nom grec de « deux forces »." }],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.2 }],
    },
    sillimanite: {
      nom: "Sillimanite", couleur: "#d8d0c0", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [7.4883, 7.6808, 5.7774, 90, 90, 90], mailleSource: "cod9000710", azimut: 22, elevation: 14,
      facies: [{ nom: "Aiguille", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.05 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 4.5 }],
        note: "Dans les gneiss, il forme des faisceaux de fines aiguilles et de fibres (fibrolite), allongées selon c." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },
    topaze: {
      nom: "Topaze", couleur: "#e6c27a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.6601, 8.826, 8.3778, 90, 90, 90], mailleSource: "cod9010122", azimut: 22, elevation: 14,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "l", hkl: [1, 2, 0], nom: "prisme", d: 1.05 },
        { sym: "f", hkl: [0, 2, 1], nom: "dôme", d: 1.9 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.3 }],
        note: "Prismes striés dans le sens de la longueur, terminés en toit et tronqués à la base, plan qui constitue aussi son clivage : un choc suffit à fendre un cristal en travers." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "basal {001}", pas: 0.22 }],
    },
    staurotide: {
      nom: "Staurotide", couleur: "#7a4a2a", systeme: "monoclinique (pseudo-orthorhombique)", classe: "mmm", classeNom: "dipyramidale rhombique (approchée)", reseau: "C",
      maille: [7.886, 16.659, 5.671, 90, 90, 90], mailleSource: "cod9002795", azimut: 22, elevation: 14,
      macleNote: "Les « croisettes de Bretagne » (Coadry, Baud) sont des macles en croix, à 90° selon {031} ou à 60° selon {231} ; on les portait en pendentif. Elles ne sont pas dessinées, le moteur ne représentant que les macles accolées.",
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.05 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.8 }],
        note: "La staurotide forme des prismes brun-roux à six pans, nettement tronqués. Monoclinique, elle ressemble pourtant à un minéral orthorhombique (β ≈ 90°)." }],
      clivages: [],
    },
    euclase: {
      nom: "Euclase", couleur: "#bfe0e6", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [4.78, 14.322, 4.6335, 90, 100.31, 90], mailleSource: "cod9001014", azimut: 22, elevation: 14,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.1 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 2.6 }],
        note: "Striés, ses prismes vont de l'incolore au bleu pâle. Leur clivage parfait les fend au moindre choc, d'où un nom grec qui signifie « bien cassant »." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },
  });
  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    pupin: "Pupin J.-P. (1980). « Zircon and granite petrology ». <i>Contributions to Mineralogy and Petrology</i> 73, p. 207–220.",
    frost: "Frost D. J. (2008). « The upper mantle and transition zone ». <i>Elements</i> 4, p. 171–176.",
    pearson: "Pearson D. G. et al. (2014). « Hydrous mantle transition zone indicated by ringwoodite included within diamond ». <i>Nature</i> 507, p. 221–224.",
    spear: "Spear F. S. (1993). <i>Metamorphic Phase Equilibria and Pressure-Temperature-Time Paths</i>. Mineralogical Society of America.",
    grew: "Grew E. S. et Anovitz L. M. (dir.) (1996). <i>Boron: Mineralogy, Petrology and Geochemistry</i>. Reviews in Mineralogy 33.",
  };
  const PEG = "L'atlas n'offre pas de diagramme ici : la pegmatite se forme à partir d'un liquide saturé d'eau et d'éléments rares, cas qu'une représentation du granite ne saurait traduire.";
  const PROFOND = "Pas de diagramme : les pressions en jeu (13 à 24 GPa, soit 400 à 660 km) excèdent l'échelle des diagrammes.";
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + t });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE("minéral rare, qui se forme dans des conditions particulières.")), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin, o) => Object.assign({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." }, o || {});
  const magma = (echelle, chemin, o) => Object.assign({ type: "magma", echelle, chemin, note: "Chemin schématique." }, o || {});
  const SF = (t) => "Forme non dessinée : " + t;
  const AL = { courbes: ["kyAnd", "andSil", "kySil"] };

  Object.assign(MIN_F, {
    phenacite: {
      forme: `Une charpente de tétraèdres SiO₄ et BeO₄ reliés par leurs sommets forme la phénacite, percée de canaux parallèles à c. Sa dureté (7,5 à 8) la fait ressembler au quartz, d'où son nom.`,
      intro: `Souvent aux dépens du béryl, la phénacite cristallise dans les pegmatites et les fentes alpines.`,
      scenarios: [s("Dans une pegmatite ou une fente alpine", `Lorsque le béryl s'altère au contact de fluides tardifs, son béryllium recristallise en phénacite ; le minéral croît aussi dans les fentes des Alpes et de l'Oural.`, { cond: false, sansDiagramme: PEG })],
    },
    willemite: {
      forme: `Le zinc prend ici la place du béryllium, sur la même charpente que la phénacite. Le manganèse qu'elle contient lui donne une fluorescence vert vif sous ultraviolets.`,
      intro: `On voit la willémite dans les gisements de zinc soumis au métamorphisme, ou dans les parties oxydées de ces gisements.`,
      scenarios: [s("Dans le marbre de Franklin", `Dans les marbres métamorphisés de Franklin (New Jersey), la willémite côtoie franklinite et zincite ; elle est plus rare dans les zones d'oxydation des gisements de zinc.`, RARE("métamorphisme d'un gisement de composition exceptionnelle."))],
    },
    eucryptite: {
      sansForme: SF("L'eucryptite se présente en grains et en intercroissances avec l'albite, sans cristaux isolés."),
      forme: `L'eucryptite possède la charpente de la phénacite, le lithium et l'aluminium y remplaçant le béryllium. Chauffée, elle se dilate à peine, ce qui en fait un constituant des vitrocéramiques.`,
      intro: `Dans les pegmatites à lithium, l'eucryptite provient de la transformation du spodumène.`,
      scenarios: [s("Dans une pegmatite à lithium", `Dans les pegmatites, le refroidissement fait passer le spodumène à l'eucryptite et à l'albite (Bikita, Zimbabwe ; Branchville, Connecticut).`, { cond: false, sansDiagramme: PEG })],
    },
    olivine: {
      forme: `L'olivine est constituée de tétraèdres SiO₄ isolés, reliés par du magnésium et du fer disposés en octaèdres : sans chaîne ni feuillet, elle ne présente pas de bon clivage. Le magnésium et le fer se substituent l'un à l'autre en toutes proportions, de la forstérite à la fayalite. Ces liaisons ioniques cèdent rapidement à l'eau : c'est l'un des minéraux qui s'altèrent le plus vite.`,
      intro: `Dans les magmas basiques, l'olivine est la première à cristalliser ; elle constitue le minéral principal du manteau supérieur.`,
      scenarios: [
        s("Dans un magma basaltique", `Lorsqu'un basalte commence à se refroidir, vers 1 200 à 1 300 °C, l'olivine cristallise en premier, sous forme de grains verts visibles dans les basaltes d'Auvergne.`, magma("croute", [
            pt(1300, 0.4, 1, "Un magma basaltique remonte depuis le manteau."),
            pt(1220, 0.2, 2, "L'olivine cristallise la première.", { bande: "cristallisation" }),
            pt(1100, 0, 3, "La lave s'épanche ; l'olivine demeure sous forme de grains dans le basalte.")]), ["hirschmann"]),
        s("Dans le manteau", `Aux deux tiers, la péridotite du manteau est faite d'olivine riche en magnésium (Fo₉₀). Des nodules arrachés par les volcans d'Auvergne (Montferrier, Massif central) en ramènent des fragments jusqu'à la surface.`, RARE("se reporter à la fiche de la péridotite.")),
      ],
    },
    forsterite: {
      forme: `Pôle magnésien de l'olivine : tétraèdres SiO₄ isolés et magnésium en octaèdres. C'est le silicate dont le point de fusion est le plus élevé (1 890 °C).`,
      intro: `La forstérite constitue le manteau et se forme dans les marbres dolomitiques chauffés.`,
      scenarios: [
        s("Dans le manteau", `L'olivine du manteau est forstéritique à 90 % ; elle cristallise également en premier dans les magmas les plus magnésiens (komatiites).`, RARE("voir la fiche de l'olivine.")),
        s("Dans un marbre dolomitique", `Au contact d'un granite, une dolomie siliceuse chauffée réagit : dolomite et quartz se transforment en forstérite et en calcite.`,
          contact([pt(150, 0.15, 1, "Une dolomie siliceuse repose à quelques kilomètres."), pt(600, 0.15, 2, "Un granite se met en place : vers 500 à 650 °C, dolomite et quartz réagissent pour donner forstérite et calcite.", { bande: "forstérite" }), pt(15, 0, 3, "L'érosion met le marbre à jour.")]), ["tuttle"]),
      ],
    },
    fayalite: {
      forme: `Plus lourd, le fer rend le pôle ferreux de l'olivine plus dense (4,4) et plus fusible (1 205 °C) que la forstérite.`,
      intro: `La fayalite cristallise dans les magmas riches en fer et pauvres en magnésium.`,
      scenarios: [s("Au sein d'une lave ou d'un granite riche en fer", `Rhyolites, granites alcalins et scories métallurgiques en renferment, partout où le fer est abondant et le magnésium absent. Elle a été décrite dans des scories de l'île de Fayal (Açores).`, RARE("magmas très évolués, riches en fer."))],
    },
    tephroite: {
      sansForme: SF("La téphroïte se présente en masses grenues, rarement en cristaux."),
      forme: `Olivine où le manganèse remplace le magnésium.`,
      intro: `Les gisements de manganèse métamorphisés donnent naissance à la téphroïte.`,
      scenarios: [s("Dans un gisement de manganèse métamorphisé", `Franklin, Långban : un sédiment riche en manganèse et en silice, porté à haute température.`,
        meta([pt(15, 0, 1, "Un dépôt sédimentaire chargé en manganèse et en silice s'accumule."), pt(550, 0.4, 2, "Enfoui et chauffé, il recristallise en téphroïte.", { bande: "téphroïte" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    liebenbergite: {
      sansForme: SF("la liebenbergite forme des grains microscopiques."),
      forme: `Olivine dans laquelle le nickel se substitue au magnésium : sa couleur verte est commune à de nombreux minéraux nickélifères.`,
      intro: `La liebenbergite se rencontre rarement, dans les gisements de nickel métamorphisés.`,
      scenarios: [s("Dans un gisement de nickel métamorphisé", `C'est en 1973 que l'on a décrit ce minéral dans la ceinture de roches vertes de Barberton (Afrique du Sud).`)],
    },
    monticellite: {
      sansForme: SF("La monticellite se présente en grains dans les marbres et les roches alcalines."),
      forme: `Olivine où le calcium occupe un site sur deux, le magnésium l'autre.`,
      intro: `La monticellite se forme au contact très chaud entre un magma et une dolomie.`,
      scenarios: [s("Au contact d'un magma", `Certaines roches alcalines et kimberlites, de même que des dolomies chauffées au-delà de ≈ 700 °C sous faible pression (Monte Somma, Crestmore), en contiennent.`, contact([pt(150, 0.05, 1, "Une dolomie repose près de la surface."), pt(800, 0.05, 2, "Au contact d'un magma, vers 750 à 850 °C, la monticellite cristallise.", { bande: "monticellite" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]), ["tuttle"])],
    },
    kirschsteinite: {
      sansForme: SF("la kirschsteinite forme des grains microscopiques."),
      forme: `Olivine dont le calcium et le fer occupent chacun un site.`,
      intro: `Certaines météorites et des laves très pauvres en silice donnent la kirschsteinite.`,
      scenarios: [s("Dans une lave sous-saturée", `Laves du Nyiragongo (Congo), où elle a été décrite pour la première fois, et météorites anciennes (angrites).`)],
    },
    glaucochroite: {
      sansForme: SF("La glaucochroïte se présente en prismes et en grains, mal décrits."),
      forme: `Olivine dont le calcium et le manganèse occupent chacun un site.`,
      intro: `On trouve la glaucochroïte à Franklin (New Jersey).`,
      scenarios: [s("Dans le marbre de Franklin", `Elle s'associe à la willémite et à la franklinite, et luit en jaune sous ultraviolets.`)],
    },
    larsenite: {
      sansForme: SF("La larsénite se présente en petits prismes, rares et mal décrits."),
      forme: `Silicate de plomb et de zinc ; le plomb ne se lie aux oxygènes que d'un côté, en laissant un doublet libre.`,
      intro: `On ne rencontre la larsénite qu'à Franklin (New Jersey).`,
      scenarios: [s("Dans le marbre de Franklin", `Elle fait partie des plus de 350 espèces recensées à Franklin et à Sterling Hill, dont plusieurs dizaines n'ont été observées nulle part ailleurs.`)],
    },
    wadsleyite: {
      sansForme: SF("La wadsleyite naturelle se présente en grains microscopiques, dans des météorites choquées."),
      forme: `Sa formule est celle de l'olivine, mais ses tétraèdres s'accolent par paires (Si₂O₇), ce qui la rend 8 % plus dense. Un oxygène sur huit ne se lie à aucun silicium et peut porter un hydrogène : la wadsleyite accueille jusqu'à 3 % d'eau.`,
      intro: `Entre 410 et 525 km de profondeur, l'olivine adopte la structure de la wadsleyite.`,
      scenarios: [s("Dans la zone de transition du manteau", `Dès 410 km de profondeur, sous ≈ 13 GPa, l'olivine se change en wadsleyite : d'où la discontinuité sismique des 410 km. À la surface, on ne la rencontre que dans des météorites choquées (météorite de Peace River, Canada), où le choc l'a produite.`,
        { cond: false, sansDiagramme: PROFOND }, [SRC.frost])],
    },
    ringwoodite: {
      sansForme: SF("On observe la ringwoodite naturelle sous forme de grains microscopiques, dans des météorites choquées ou emprisonnée dans un diamant."),
      forme: `Structure du spinelle pour la ringwoodite : oxygènes en empilement cubique compact, silicium en tétraèdres, magnésium en octaèdres. Elle peut également renfermer de l'eau.`,
      intro: `Entre 525 et 660 km, l'olivine prend la forme de la ringwoodite.`,
      scenarios: [s("Dans la zone de transition du manteau", `Vers 520 km (≈ 18 GPa), la wadsleyite se transforme en ringwoodite. En 2014, on a découvert, dans un diamant brésilien (Juína), une inclusion de ringwoodite contenant ≈ 1,5 % d'eau : la zone de transition pourrait renfermer autant d'eau que les océans.`, { cond: false, sansDiagramme: PROFOND }, [SRC.pearson, SRC.frost])],
    },

    // ── grenats ──
    grenat: {
      forme: `Dans les grenats, les tétraèdres SiO₄ isolés se relient à des octaèdres (aluminium, fer, chrome) et à de grands sites à huit oxygènes (calcium, magnésium, fer, manganèse). Cette charpente serrée n'a aucun plan faible : pas de clivage, une dureté de 6,5 à 7,5, et des formes très équantes, dodécaèdre et trapézoèdre.`,
      intro: `Les grenats se forment surtout par métamorphisme ; leur composition renseigne sur la pression et la température atteintes.`,
      scenarios: [s("Dans un micaschiste", `Des argiles enfouies puis chauffées au-delà de ≈ 500 °C produisent des grenats almandins ; en grandissant, ces cristaux englobent les grains voisins, et leurs zones de croissance gardent la trace du trajet pression-température suivi par la roche.`, meta([
          pt(15, 0, 1, "Une argile se dépose."), pt(550, 0.6, 2, "Enfouie lors d'une collision vers 20 à 25 km et chauffée au-delà de 500 °C, la roche voit croître des grenats.", { bande: "grenat" }),
          pt(15, 0, 3, "Une fois la chaîne érodée, le micaschiste et ses grenats remontent à la surface.")]), ["pattison", SRC.spear])],
    },
    almandin: {
      forme: `Grenat ferreux et alumineux : le fer occupe les grands sites, l'aluminium les octaèdres. Teinte rouge sombre et densité élevée (4,3).`,
      intro: `L'almandin caractérise le métamorphisme régional : il se rencontre dans les micaschistes et les gneiss.`,
      scenarios: [s("Dans un micaschiste", `Piqués de grenats, les micaschistes de l'île de Groix et du Massif central l'illustrent ; il se forme vers 500 °C.`, meta([
        pt(15, 0, 1, "Une argile se dépose."), pt(550, 0.6, 2, "Vers 500 à 600 °C, les micas et la chlorite laissent place à l'almandin.", { bande: "grenat" }),
        pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison", SRC.spear])],
    },
    pyrope: {
      forme: `Grenat magnésien : le magnésium, de taille trop faible pour un site à huit oxygènes, ne s'y loge qu'à haute pression. Teinte rouge sang ; le chrome la fait tirer sur le violet.`,
      intro: `Le pyrope caractérise le manteau et les roches formées à très haute pression.`,
      scenarios: [s("Dans le manteau", `Dès ≈ 80 km de profondeur, la péridotite voit l'aluminium passer du spinelle au grenat : c'est la lherzolite à grenat. Des kimberlites en remontent des grains avec les diamants ; en Bohême, les grenats de pyrope issus des basaltes ont fait la fortune des joailliers.`,
        magma("profond", [pt(1100, 3.0, 1, "À partir de ≈ 2,5 GPa (80 km), l'aluminium du manteau cristallise sous forme de pyrope."), pt(1050, 0.1, 2, "Une kimberlite, qui monte très vite, en détache des grains de pyrope.")]), ["hirschmann"])],
    },
    spessartine: {
      forme: `Grenat manganésifère et alumineux. Orange vif.`,
      intro: `Riche en manganèse, la spessartine apparaît dans les pegmatites et les roches métamorphiques.`,
      scenarios: [s("Dans une pegmatite", `Dans les derniers liquides des granites, le manganèse se concentre : la spessartine cristallise dans les pegmatites (Namibie, Pakistan). Elle a été décrite dans le Spessart (Bavière).`, { cond: false, sansDiagramme: PEG })],
    },
    knorringite: {
      sansForme: SF("La knorringite se présente en grains inclus dans les diamants et les kimberlites."),
      forme: `Ce grenat, riche en magnésium et en chrome, n'est stable qu'à très haute pression.`,
      intro: `On trouve la knorringite dans le manteau profond, en compagnie des diamants.`,
      scenarios: [s("Dans le manteau, avec les diamants", `Dans les sables, les chercheurs de diamants traquent ces grenats violets, chargés de chrome : leur présence annonce une kimberlite ayant traversé la zone du diamant.`, RARE("Se reporter aux fiches du pyrope et du diamant."))],
    },
    grossulaire: {
      forme: `Grenat calcique et alumineux. Incolore à l'état pur, il prend une teinte miel avec un peu de fer (hessonite), et verte avec du vanadium (tsavorite).`,
      intro: `Le grossulaire se forme par métamorphisme des calcaires impurs.`,
      scenarios: [s("Au sein d'un skarn ou d'un marbre", `Chauffé au contact d'un granite, un calcaire argileux voit le calcium, l'aluminium et la silice cristalliser en grossulaire.`,
        contact([pt(150, 0.12, 1, "Un calcaire argileux repose à 4 à 5 km."), pt(550, 0.12, 2, "Un granite le chauffe : le grossulaire cristallise.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met le skarn à jour.")]), ["tuttle"])],
    },
    andradite: {
      forme: `Grenat calcique et ferrique où le fer trivalent prend place dans les octaèdres. Sa variété démantoïde renvoie davantage de lumière dispersée qu'un diamant.`,
      intro: `On rencontre l'andradite dans les skarns et dans les serpentinites.`,
      scenarios: [
        s("Dans un skarn", `Au contact du granite, des fluides chargés de fer et de silice pénètrent le calcaire : l'andradite cristallise avec les pyroxènes (Costabonne, Pyrénées).`,
          contact([pt(150, 0.12, 1, "Un calcaire repose près d'un granite."), pt(550, 0.12, 2, "Des fluides issus du granite apportent fer et silice : l'andradite se met à cristalliser.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met le skarn à jour.")]), ["tuttle"]),
        s("Dans une serpentinite", `La variété verte démantoïde, de l'Oural et du Val Malenco, croît dans les fissures des serpentinites.`, RARE("cristallisation dans des fissures, à basse température.")),
      ],
    },
    uvarovite: {
      forme: `Grenat calcique et chromifère, à la teinte vert émeraude. Ses cristaux demeurent petits, de quelques millimètres.`,
      intro: `L'uvarovite se développe dans les serpentinites, au voisinage de la chromite.`,
      scenarios: [s("Sur la chromite", `Des fluides chargés de calcium traversent les serpentinites et reprennent le chrome de la chromite : elles forment des druses vertes dans l'Oural (Saranovskoye) et à Outokumpu.`, RARE("cristallisation dans des fissures, à basse température."))],
    },
    goldmanite: {
      sansForme: SF("la goldmanite forme des grains microscopiques."),
      forme: `Grenat calcique au vanadium.`,
      intro: `La goldmanite, grenat rare, se rencontre dans les roches riches en vanadium.`,
      scenarios: [s("On la trouve dans un schiste ou dans un gisement d'uranium-vanadium.", `C'est au gisement de Laguna, au Nouveau-Mexique, qu'on la décrit en 1964.`)],
    },
    schorlomite: {
      forme: `Grenat calcique riche en titane (et en fer, jusque dans les tétraèdres) : de teinte noire.`,
      intro: `La schorlomite cristallise dans les roches alcalines.`,
      scenarios: [s("Dans une syénite néphélinique", `Ce grenat se forme dans les magmas pauvres en silice et riches en titane ; on le rencontre dans les syénites néphéliniques, les ijolites et les carbonatites (Kaiserstuhl, Magnet Cove).`, RARE("roches magmatiques alcalines rares."))],
    },
    hydrogrossulaire: {
      sansForme: SF("L'hydrogrossulaire se présente en masses compactes (« jade du Transvaal »)."),
      forme: `Grenat calcique dans lequel quatre OH remplacent une partie des tétraèdres SiO₄ ; dépourvu de silice, il devient la katoïte.`,
      intro: `Ce sont surtout les rodingites, roches calciques ayant subi l'action de l'eau, qui donnent l'hydrogrossulaire.`,
      scenarios: [s("Dans une rodingite", `Un filon de gabbro traversé par l'eau qui serpentinise une péridotite se charge de calcium et perd de la silice : il devient une rodingite, riche en hydrogrossulaire.`, RARE("voir la fiche de la rodingite."))],
    },
    majorite: {
      sansForme: SF("Dans les météorites choquées et les inclusions de diamants, la majorite forme des grains microscopiques."),
      forme: `Grenat dans lequel une fraction du silicium occupe les octaèdres, ce qu'une pression extrême peut seule rendre possible.`,
      intro: `Au-delà de ≈ 250 km, le grenat du manteau profond est la majorite.`,
      scenarios: [s("Dans le manteau profond", `Entre 300 et 660 km, le grenat absorbe les pyroxènes et devient majorite. La première description date de 1970, dans la météorite de Coorara (Australie).`, { cond: false, sansDiagramme: PROFOND })],
    },

    // ── groupe du zircon ──
    zircon: {
      forme: `Le zircon est formé de chaînes de tétraèdres SiO₄ et d'ions zirconium entourés de huit oxygènes, étirées le long de c. Très dur (7,5), presque insoluble et réfractaire, il survit à l'érosion, au transport et même au métamorphisme. Seul l'uranium entre dans son réseau : tout le plomb qu'il contient vient de la désintégration de cet uranium, d'où sa valeur de chronomètre.`,
      intro: `Dans les granites, le zircon cristallise ; les minéraux les plus anciens connus sur Terre (4,4 milliards d'années, Jack Hills) sont des zircons.`,
      scenarios: [
        s("Dans un granite", `Quand le magma approche de la saturation en zirconium, le zircon se met à cristalliser tôt, en petits prismes inclus dans la biotite, où ses radiations dessinent des auréoles sombres. Sa forme dépend de la chimie et de la température du magma.`, magma("croute", [
            pt(850, 0.4, 1, "La croûte entre en fusion partielle, et le magma se charge en zirconium."), pt(760, 0.3, 2, "Au refroidissement, la saturation en zirconium est atteinte : le zircon cristallise.", { bande: "cristallisation" }),
            pt(680, 0.3, 3, "Le granite achève de cristalliser.")]), ["hirschmann", SRC.pupin]),
        s("Dans un sable", `Presque indestructible, le zircon voyage d'un sable à l'autre pendant des milliards d'années : les grains du grès de Jack Hills, en Australie, conservent la trace d'une croûte vieille de 4,4 milliards d'années.`, RARE("Il subit le même tri hydraulique que les autres minéraux lourds.")),
      ],
    },
    hafnon: {
      sansForme: SF("Le hafnon se présente en petits grains dans les pegmatites."),
      forme: `Zircon dans lequel le hafnium se substitue au zirconium ; ces deux éléments ont presque la même taille et se trouvent toujours associés.`,
      intro: `Minéral rare, le hafnon se rencontre dans les pegmatites.`,
      scenarios: [s("Dans une pegmatite", `Sa description date de 1974, dans les pegmatites de Zambézie (Mozambique).`, { cond: false, sansDiagramme: PEG })],
    },
    thorite: {
      forme: `Zircon dans lequel le thorium se substitue au zirconium. Sa radioactivité désorganise peu à peu le réseau : la plupart des thorites sont amorphes (métamictes).`,
      intro: `Dans les pegmatites et les granites alcalins, la thorite cristallise.`,
      scenarios: [s("Dans une pegmatite", `La description remonte à 1829, en Norvège (Løvøya) : c'est en l'analysant que Berzelius isola le thorium.`, { cond: false, sansDiagramme: PEG })],
    },
    huttonite: {
      sansForme: SF("La huttonite se présente en petits grains dans les sables lourds."),
      forme: `La thorite et ce minéral partagent la formule ThSiO₄, mais le second adopte la structure de la monazite, forme stable à haute température.`,
      intro: `Les sables de plage néo-zélandais ont livré la première description de la huttonite.`,
      scenarios: [s("Dans un sable de plage", `Sa description date de 1951 : elle provient des sables de Gillespie's Beach (Nouvelle-Zélande).`)],
    },
    coffinite: {
      sansForme: SF("La coffinite se présente en grains et en enduits microscopiques."),
      forme: `Zircon dans lequel l'uranium se substitue au zirconium, accompagné d'eau.`,
      intro: `Minerai d'uranium des grès, la coffinite prend naissance en milieu réducteur.`,
      scenarios: [s("Dans un grès uranifère", `Là où une eau chargée d'uranium oxydé rencontre de la matière organique, la coffinite accompagne la pechblende : grès du Colorado Plateau, Lodève (Hérault).`, RARE("Le diagramme Eh-pH de l'uranium est à consulter sur la fiche de l'uraninite."))],
    },

    // ── silicates d'alumine ──
    andalousite: {
      forme: `Le polymorphe de basse pression du trio andalousite-disthène-sillimanite, l'andalousite (Al₂SiO₅), présente des chaînes d'octaèdres d'aluminium selon c. Des tétraèdres SiO₄ et d'autres aluminiums, à cinq oxygènes, relient ces chaînes.`,
      intro: `L'andalousite se forme dans les argiles chauffées à faible profondeur, au contact des granites.`,
      scenarios: [s("Autour d'un granite", `Dans un schiste argileux porté à quelques kilomètres de profondeur (moins de 0,4 GPa) par la chaleur d'un granite, l'andalousite croît : schistes tachetés, cornéennes. La mine de Glomel (Côtes-d'Armor) en extrait pour les réfractaires.`,
        contact([pt(150, 0.12, 1, "Un schiste argileux repose à 4 km."), pt(550, 0.12, 2, "Au contact d'un granite, vers 500 à 600 °C, l'andalousite cristallise.", { bande: "andalousite" }), pt(15, 0, 3, "L'érosion met la cornéenne à jour.")], { courbes: ["graniteEau", "kyAnd", "andSil", "kySil"] }), ["pattison", "tuttle"])],
    },
    disthene: {
      forme: `Avec la même formule, le disthène (cyanite) place tous ses aluminiums en octaèdres : il est plus compact (3,6 au lieu de 3,15), c'est le polymorphe de haute pression. Ses chaînes d'octaèdres le long de c dessinent les lames, dont la dureté varie avec la direction.`,
      intro: `Le disthène se forme à partir d'argiles profondément enfouies dans les chaînes de montagnes.`,
      scenarios: [s("Dans un micaschiste enfoui", `Au-delà de ≈ 0,5 GPa (20 km), l'aluminium des argiles cristallise en disthène : on le trouve dans les micaschistes et les gneiss des chaînes de collision, ainsi que dans les éclogites.`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(600, 0.9, 2, "Enfouie à plus de 25 à 30 km, la roche recristallise et le disthène croît.", { bande: "disthène" }), pt(15, 0, 3, "L'érosion le ramène en surface.")], AL), ["pattison"])],
    },
    sillimanite: {
      forme: `Des chaînes d'octaèdres d'aluminium et des chaînes doubles de tétraèdres (Si et Al) courent le long de c dans la sillimanite (Al₂SiO₅), d'où son allure en aiguilles. Elle est le polymorphe de haute température.`,
      intro: `La sillimanite se forme à partir d'argiles portées à très haute température.`,
      scenarios: [s("Dans un gneiss très chaud", `Dès ≈ 600 à 650 °C, les gneiss voient leur aluminium cristalliser en sillimanite ; elle accompagne souvent la fusion partielle des migmatites.`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(720, 0.6, 2, "Enfouie et chauffée au-delà de 650 °C, la roche recristallise et la sillimanite croît en aiguilles.", { bande: "sillimanite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")], AL), ["pattison"])],
    },
    mullite: {
      sansForme: SF("la mullite naturelle forme des aiguilles microscopiques."),
      forme: `Comme la sillimanite, la mullite aligne des chaînes d'octaèdres d'aluminium ; elle contient toutefois plus d'aluminium et moins d'oxygène, si bien que certains sites restent vides. Elle se forme à très haute température et basse pression.`,
      intro: `La mullite naturelle demeure rare, alors qu'elle forme le constituant principal des porcelaines.`,
      scenarios: [s("Dans une argile cuite par une lave", `On l'a décrite sur l'île de Mull (Écosse), dans des enclaves d'argile cuites par les basaltes : toute porcelaine en produit lors de la cuisson.`, RARE("cuisson brève à très haute température."))],
    },
    topaze: {
      forme: `Le clivage basal parfait de la topaze s'explique par l'absence de tout tétraèdre recoupant les plans {001}. Ses octaèdres d'aluminium, liés au fluor et à des OH, s'associent à des tétraèdres SiO₄. Dure (8), elle est l'étalon 8 de l'échelle de Mohs.`,
      intro: `Au sommet des granites, des fluides riches en fluor donnent la topaze.`,
      scenarios: [s("Dans un greisen ou une pegmatite", `Les fluides fluorés de fin de cristallisation transforment le granite en greisen et emplissent les cavités des pegmatites. Pour la topaze impériale, on citera Échassières (Allier) et Ouro Preto (Brésil).`, { cond: false, sansDiagramme: PEG })],
    },
    euclase: {
      forme: `Des couches de tétraèdres SiO₄ et de BeO₃(OH) se combinent aux octaèdres d'aluminium dans l'euclase ; le clivage parfait passe entre ces couches.`,
      intro: `Aux dépens du béryl, l'euclase apparaît dans les pegmatites et les fentes.`,
      scenarios: [s("Dans une pegmatite", `Lorsque le béryl s'altère au contact de fluides tardifs : Minas Gerais (Brésil), Oural et fentes alpines.`, { cond: false, sansDiagramme: PEG })],
    },
    staurotide: {
      forme: `Des couches de type disthène alternent avec des couches d'hydroxyde de fer et d'aluminium dans la staurotide : on la prendrait presque pour un disthène feuilleté. Ses macles en croix lui ont valu son nom (grec <i>stauros</i>, la croix).`,
      intro: `Le minéral repère du métamorphisme moyen des argiles riches en fer, c'est la staurotide.`,
      scenarios: [s("Dans un micaschiste", `Sa présence marque une plage de température d'environ 550 à 700 °C, ce qui permet aux géologues de cartographier les zones du métamorphisme. Les croisettes de Coadry (Finistère) et de Baud (Morbihan) sont célèbres.`, meta([pt(15, 0, 1, "Un dépôt d'argile riche en fer et en aluminium se forme."), pt(600, 0.6, 2, "Enfouie et chauffée vers 550 à 650 °C, elle voit croître la staurotide.", { bande: "staurotide" }), pt(15, 0, 3, "L'érosion la ramène en surface.")], AL), ["pattison", SRC.spear])],
    },

    // ── humites ──
    norbergite: {
      sansForme: SF("La norbergite se présente en grains dans les marbres."),
      forme: `Dans le groupe de la humite, des tranches d'olivine alternent avec des couches de type brucite, où fluor et OH prennent la place de l'oxygène. La norbergite en possède une de chaque.`,
      intro: `En présence de fluor, les marbres dolomitiques chauffés donnent naissance aux minéraux du groupe de la humite.`,
      scenarios: [s("Dans un marbre de contact", `Au contact d'un granite qui lui apporte du fluor, une dolomie siliceuse se transforme (Norberg, Suède).`,
        contact([pt(150, 0.1, 1, "Une dolomie siliceuse repose près d'un granite."), pt(550, 0.1, 2, "Des fluides fluorés venus du granite la recristallisent, et la norbergite apparaît.", { bande: "humites" }), pt(15, 0, 3, "L'érosion met le marbre à jour.")]), ["tuttle"])],
    },
    chondrodite: {
      sansForme: SF("La chondrodite se présente en grains dans les marbres."),
      forme: `Une couche Mg(F,OH)₂ s'intercale entre deux tranches d'olivine dans le groupe de la humite.`,
      intro: `La chondrodite apparaît dans les marbres dolomitiques chauffés en présence de fluor.`,
      scenarios: [s("Dans un marbre de contact", `Dans les marbres et les skarns (Tilly Foster, New York ; Pargas, Finlande), elle forme des grains jaunes à orangés.`,
        contact([pt(150, 0.1, 1, "Une dolomie siliceuse repose près d'un granite."), pt(600, 0.1, 2, "Les fluides fluorés la recristallisent : la chondrodite se forme.", { bande: "humites" }), pt(15, 0, 3, "L'érosion met le marbre à jour.")]), ["tuttle"])],
    },
    humite: {
      sansForme: SF("La humite se présente en grains et en petits cristaux mal décrits."),
      forme: `Dans le groupe de la humite, trois tranches d'olivine se succèdent autour d'une couche Mg(F,OH)₂.`,
      intro: `La humite se rencontre dans les marbres dolomitiques chauffés et dans les blocs rejetés par les volcans.`,
      scenarios: [s("Dans un marbre de contact", `Les blocs de marbre éjectés par le Vésuve (Monte Somma) ont fourni sa première description.`, RARE("voir la chondrodite."))],
    },
    clinohumite: {
      sansForme: SF("La clinohumite se présente en grains ; ses rares cristaux gemmes (Pamir) sont mal décrits."),
      forme: `Groupe de la humite : quatre tranches d'olivine alternant avec une couche Mg(F,OH)₂. La variété à OH seul demeure stable jusque dans le manteau, où elle véhicule de l'eau.`,
      intro: `Dans les marbres et les serpentinites enfouies, la clinohumite apparaît.`,
      scenarios: [s("Dans une serpentinite enfouie", `En zone de subduction, des serpentinites plongeant en profondeur produisent une clinohumite riche en titane, qui emporte de l'eau jusqu'à 100 à 200 km.`, RARE("se reporter à la fiche de la serpentinite."))],
    },
    alleghanyite: {
      sansForme: SF("L'alléghanyite se présente en grains dans les gisements de manganèse."),
      forme: `Même architecture que la chondrodite, avec du manganèse en lieu et place du magnésium.`,
      intro: `L'alléghanyite se rencontre dans les gisements de manganèse métamorphisés.`,
      scenarios: [s("Dans un gisement de manganèse métamorphisé", `Sa description date de 1932, dans le comté d'Alleghany (Caroline du Nord).`)],
    },
    titanite: {
      sansForme: SF("La maille où sont décrits les cristaux en coin (enveloppes) diffère de celle de la structure 3D ; impossible donc de vérifier la conversion des indices."),
      forme: `Chaînes d'octaèdres TiO₆ reliées par des tétraèdres SiO₄ : voilà la titanite (sphène), avec le calcium logé dans des cavités à sept oxygènes. C'est de ses cristaux en coin qu'elle tire son nom de sphène (grec « coin »).`,
      intro: `La titanite constitue un accessoire titané fréquent dans les granites, les syénites et les gneiss.`,
      scenarios: [s("Dans un granite ou une syénite", `Dans les magmas riches en calcium, c'est la titanite, et non l'ilménite, qui retient le titane ; dans les gneiss, elle se forme par recristallisation de minéraux titanés. Ses grains permettent de dater les roches par la méthode uranium-plomb.`, magma("croute", [
          pt(850, 0.3, 1, "Dans la croûte, un magma enrichi en calcium s'élève."), pt(750, 0.3, 2, "Il cristallise, et le titane se fixe dans la titanite.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    malayaite: {
      sansForme: SF("La malayaïte se présente en grains dans les skarns."),
      forme: `La malayaïte reprend la structure de la titanite, l'étain occupant la place du titane.`,
      intro: `La malayaïte se rencontre dans les skarns à étain.`,
      scenarios: [s("Dans un skarn à étain", `Elle a été décrite en 1965 en Malaisie, d'où son nom ; on la trouve aussi en Cornouailles.`)],
    },
    chloritoide: {
      sansForme: SF("Le chloritoïde se présente en lamelles et en rosettes, sans faces mesurables."),
      forme: `Couches d'octaèdres d'aluminium et couches d'octaèdres de fer et de magnésium s'alternent dans le chloritoïde, reliées par des tétraèdres SiO₄ isolés : l'aspect rappelle un mica, mais les lames sont cassantes.`,
      intro: `Le chloritoïde se forme à partir d'argiles riches en aluminium et en fer, lors d'un métamorphisme faible à moyen.`,
      scenarios: [s("Dans un schiste", `Il apparaît dans les schistes alumineux des Alpes et des Ardennes, entre ≈ 400 et 550 °C.`, meta([pt(15, 0, 1, "Un dépôt argileux, alumineux et ferrifère, se forme."), pt(470, 0.6, 2, "Enfouie et chauffée vers 400 à 550 °C, elle voit croître le chloritoïde.", { bande: "chloritoïde" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    ottrelite: {
      sansForme: SF("L'ottrélite se présente en lamelles dans les schistes."),
      forme: `Variété de chloritoïde enrichie en manganèse, dont la structure 3D est celle du chloritoïde ordinaire.`,
      intro: `L'ottrélite est un chloritoïde riche en manganèse, présent dans les schistes ardoisiers.`,
      scenarios: [s("Dans un schiste ardoisier", `Elle a été décrite à Ottré (Ardennes belges), sous forme de paillettes noires dans les phyllades.`, RARE("voir la fiche du chloritoïde."))],
    },
    datolite: {
      sansForme: SF("Les cristaux trapus, aux nombreuses faces, sont décrits selon une maille autre que celle de la structure 3D."),
      forme: `Des tétraèdres SiO₄ et des BO₃(OH) forment des couches reliées par le calcium : telle est la structure de la datolite.`,
      intro: `Dans les cavités des basaltes, la datolite se forme aux côtés des zéolites.`,
      scenarios: [s("Dans une bulle de basalte", `Des eaux chaudes circulant dans les basaltes y déposent la datolite, accompagnée de zéolites et de prehnite (Lac Supérieur, Westfield aux États-Unis).`, RARE("Il se dépose à partir d'eau chaude dans les cavités d'une lave."))],
    },
    dumortierite: {
      sansForme: SF("La dumortiérite se présente en fibres et en aiguilles bleues."),
      forme: `Le long de a, la dumortiérite aligne des chaînes d'octaèdres d'aluminium, auxquelles s'ajoutent tétraèdres SiO₄ et triangles de bore : elle pousse en fibres bleues ou violettes.`,
      intro: `Les roches alumineuses enrichies en bore accueillent la dumortiérite.`,
      scenarios: [s("Dans un gneiss ou une pegmatite", `Elle a été décrite en 1881 près de Lyon (Chaponost) et nommée en l'honneur du paléontologue Eugène Dumortier.`, RARE("enrichissement en bore par les fluides."), [SRC.grew])],
    },
    kornerupine: {
      sansForme: SF("La kornérupine se présente en prismes et en fibres mal décrits."),
      forme: `Chaînes d'octaèdres d'aluminium et de magnésium, reliées par des groupes Si₂O₇ et des SiO₄ ; une faible part de bore s'y ajoute.`,
      intro: `La kornérupine se rencontre dans les granulites alumineuses et magnésiennes.`,
      scenarios: [s("Dans une granulite", `Un métamorphisme à très haute température, appliqué à des roches riches en magnésium, en aluminium et en bore, la produit (Madagascar, Sri Lanka).`, RARE("Elle se forme lors d'un métamorphisme à très haute température, sur des compositions rares."), [SRC.grew])],
    },
    grandidierite: {
      sansForme: SF("La grandidiérite se présente en prismes allongés, mal décrits."),
      forme: `On y trouve des chaînes d'octaèdres d'aluminium, des tétraèdres SiO₄, des triangles BO₃ et du magnésium.`,
      intro: `La grandidiérite, borosilicate, se rencontre dans les granulites et les pegmatites.`,
      scenarios: [s("Dans une pegmatite ou une granulite", `Elle a été décrite à Madagascar en 1902 et doit son nom à l'explorateur Alfred Grandidier.`, RARE("enrichissement en bore à haute température."), [SRC.grew])],
    },
    gadolinite: {
      sansForme: SF("La gadolinite se présente en masses noires et en prismes mal formés."),
      forme: `Des tétraèdres SiO₄ et BeO₄ forment des couches reliées par du fer ; l'yttrium et d'autres terres rares logent entre elles. Elle est souvent métamicte.`,
      intro: `Dans les pegmatites, la gadolinite cristallise ; c'est à partir d'elle que l'on a extrait l'yttrium.`,
      scenarios: [s("Dans une pegmatite", `Découverte à Ytterby (Suède) : le chimiste Johan Gadolin y a isolé l'yttria en 1794. Quatre éléments tirent leur nom de ce village : yttrium, ytterbium, terbium et erbium.`, { cond: false, sansDiagramme: PEG })],
    },
    cerite: {
      sansForme: SF("la cérite forme des masses grenues."),
      forme: `Silicate de cérium et de calcium. L'atlas ne dispose d'aucune structure 3D : la COD ne renferme aucun affinement pour ce minéral.`,
      intro: `C'est dans la cérite que l'on a découvert le cérium.`,
      scenarios: [s("Dans un skarn à terres rares", `C'est à Bastnäs (Suède) que Berzelius et Hisinger découvrirent le cérium en 1803.`)],
    },
    britholite: {
      sansForme: SF("La britholite se présente en grains et en prismes mal décrits."),
      forme: `Structure de l'apatite : des tétraèdres SiO₄ occupent la place des PO₄, et le cérium celle du calcium.`,
      intro: `La britholite, silicate de terres rares, se rencontre dans les roches alcalines.`,
      scenarios: [s("Dans une roche alcaline", `Syénites néphéliniques et carbonatites (Groenland, Kola).`)],
    },
  });
})();
