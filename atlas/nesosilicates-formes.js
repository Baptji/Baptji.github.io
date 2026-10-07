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
        note: "Les arêtes du dodécaèdre sont biseautées par le trapézoèdre : forme fréquente des grenats des skarns et des micaschistes." },
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
        note: "Prismes courts, incolores, à sommet rhomboédrique ; son éclat trompeur de quartz lui a valu son nom (grec <i>phenax</i>, « trompeur »)." }],
      clivages: [],
    },
    willemite: {
      nom: "Willémite", couleur: "#9bc57a", systeme: "trigonal", classe: "-3", classeNom: "rhomboédrique", reseau: "R",
      maille: HEX(13.948, 9.315), mailleSource: "cod9007627", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme et rhomboèdre", formes: [
        { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.1 }],
        note: "Prismes hexagonaux courts ; à Franklin, en grains verts qui brillent en vert vif sous ultraviolets." }],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "bon", nom: "basal", pas: 0.25 }],
    },

    // ── olivines ──
    olivine: OLIVINE("Olivine", "#9aa63a", [4.752, 10.193, 5.977, 90, 90, 90], "cod9000535",
      "Cristaux trapus, rarement nets : l'olivine se trouve surtout en grains verts dans les basaltes et en nodules (péridot). Les beaux cristaux gemmes viennent de l'île de Zabargad (mer Rouge)."),
    forsterite: OLIVINE("Forstérite", "#b6bd63", [4.752, 10.193, 5.977, 90, 90, 90], "cod9000535",
      "Prismes trapus, incolores à vert pâle, dans les marbres dolomitiques et les péridotites."),
    fayalite: OLIVINE("Fayalite", "#5d5233", [4.818, 10.471, 6.086, 90, 90, 90], "cod9000469",
      "Même forme que la forstérite, brun-noir ; cristaux rares, dans les cavités des rhyolites et des granites alcalins."),

    // ── grenats ──
    grenat: GRENAT("Grenat", "#8a2a2a", 11.531, "cod9000233",
      "Douze losanges : la forme classique des grenats des micaschistes, qui leur a valu le nom de « grenade » (comme les graines du fruit).",
      "Vingt-quatre faces en trapèze : fréquent chez l'almandin et la spessartine des pegmatites."),
    almandin: GRENAT("Almandin", "#7a1f2a", 11.531, "cod9000233",
      "Dodécaèdres rouge sombre, parfois de plusieurs centimètres, plantés dans les micaschistes (îles de Groix, Bretagne).",
      "Trapézoèdres des pegmatites et des micaschistes."),
    pyrope: GRENAT("Pyrope", "#a8182c", 11.459, "cod9000231",
      "Le pyrope forme surtout des grains arrondis dans les péridotites et les kimberlites ; les cristaux nets sont rares.",
      "Trapézoèdres rares."),
    spessartine: GRENAT("Spessartine", "#d4652a", 11.615, "cod9002692",
      "Dodécaèdres orange, dans les pegmatites.",
      "Trapézoèdres orange vif des pegmatites de Namibie et du Pakistan."),
    grossulaire: GRENAT("Grossulaire", "#c9a548", 11.845, "cod9000236",
      "Dodécaèdres miel à vert, dans les skarns ; son nom vient du latin <i>grossularia</i>, la groseille, pour la couleur de sa variété verte.",
      "Trapézoèdres, souvent combinés au dodécaèdre (hessonite)."),
    andradite: GRENAT("Andradite", "#4f6a2a", 12.058, "cod9000239",
      "Dodécaèdres bruns à noirs (mélanite) ou verts (démantoïde, le grenat le plus dispersif).",
      "Trapézoèdres, plus rares."),
    uvarovite: GRENAT("Uvarovite", "#1f7a3a", 11.9973, "cod9007149",
      "Petits dodécaèdres vert émeraude, en druses sur la chromite (Oural, Finlande).",
      "Trapézoèdres, rares."),
    schorlomite: GRENAT("Schorlomite", "#1f1d1c", 12.1464, "cod9007370",
      "Dodécaèdres noirs, à l'éclat vitreux, dans les syénites néphéliniques et les carbonatites.",
      "Trapézoèdres, rares."),

    // ── groupe du zircon ──
    zircon: Object.assign(ZIRCON("Zircon", "#b07a4a", 6.6039, 5.9783, "cod9005518",
      "Prismes à quatre faces terminés par une pyramide : la forme des grains de zircon des granites, quelques dixièmes de millimètre, que l'on date à l'uranium–plomb."), {
      facies: [
        { nom: "Prisme et bipyramide", formes: [{ sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.35 }],
          note: "Prismes à quatre faces terminés par une pyramide : la forme des grains de zircon des granites, quelques dixièmes de millimètre, que l'on date à l'uranium–plomb." },
        { nom: "Bipyramide trapue", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }],
          note: "Prisme court et grande pyramide : fréquente dans les syénites et les roches alcalines. La forme des zircons renseigne sur la chimie et la température du magma (typologie de Pupin, 1980)." },
      ],
    }),
    thorite: ZIRCON("Thorite", "#5a3a22", 7.1328, 6.3188, "cod9007624",
      "Prismes trapus à pointe, noirs ou orange (orangite), souvent rendus amorphes par la radioactivité du thorium."),

    // ── silicates d'alumine ──
    andalousite: {
      nom: "Andalousite", couleur: "#b07a6a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [7.798, 7.9031, 5.5566, 90, 90, 90], mailleSource: "cod9000715", azimut: 22, elevation: 14,
      facies: [{ nom: "Prisme carré", formes: [{ sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.0 }],
        note: "Prismes presque carrés (a ≈ b) ; dans les schistes tachetés, la variété chiastolite montre une croix noire de matière charbonneuse repoussée par le cristal qui pousse." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "bon", nom: "{110}", pas: 0.24 }],
    },
    disthene: {
      nom: "Disthène", couleur: "#5a7ac0", systeme: "triclinique", classe: "-1", classeNom: "pinacoïdale", reseau: "P",
      maille: [7.1262, 7.852, 5.5724, 89.99, 101.11, 106.03], mailleSource: "cod9000720", azimut: 22, elevation: 14,
      facies: [{ nom: "Lame", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.35 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 3.2 }],
        note: "Longues lames bleues aplaties : sa dureté change selon la direction (4,5 dans la longueur, 6,5 en travers), d'où son nom grec « deux forces »." }],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.2 }],
    },
    sillimanite: {
      nom: "Sillimanite", couleur: "#d8d0c0", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [7.4883, 7.6808, 5.7774, 90, 90, 90], mailleSource: "cod9000710", azimut: 22, elevation: 14,
      facies: [{ nom: "Aiguille", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.05 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 4.5 }],
        note: "Fines aiguilles et fibres (fibrolite) allongées selon c, en faisceaux dans les gneiss." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },
    topaze: {
      nom: "Topaze", couleur: "#e6c27a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.6601, 8.826, 8.3778, 90, 90, 90], mailleSource: "cod9010122", azimut: 22, elevation: 14,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "l", hkl: [1, 2, 0], nom: "prisme", d: 1.05 },
        { sym: "f", hkl: [0, 2, 1], nom: "dôme", d: 1.9 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.3 }],
        note: "Prismes striés en long, terminés en toit et coupés par la base, qui est aussi son plan de clivage : un coup suffit à fendre un cristal en travers." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "basal {001}", pas: 0.22 }],
    },
    staurotide: {
      nom: "Staurotide", couleur: "#7a4a2a", systeme: "monoclinique (pseudo-orthorhombique)", classe: "mmm", classeNom: "dipyramidale rhombique (approchée)", reseau: "C",
      maille: [7.886, 16.659, 5.671, 90, 90, 90], mailleSource: "cod9002795", azimut: 22, elevation: 14,
      macleNote: "Macles en croix, à 90° sur {031} ou à 60° sur {231} : les « croisettes de Bretagne » (Coadry, Baud), que l'on portait en pendentif (non dessinées : le moteur ne dessine que les macles accolées).",
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.05 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.8 }],
        note: "Prismes brun-roux, à six pans, coupés net : la staurotide est monoclinique mais presque orthorhombique (β ≈ 90°)." }],
      clivages: [],
    },
    euclase: {
      nom: "Euclase", couleur: "#bfe0e6", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [4.78, 14.322, 4.6335, 90, 100.31, 90], mailleSource: "cod9001014", azimut: 22, elevation: 14,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.1 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 2.6 }],
        note: "Prismes incolores à bleu pâle, striés ; son clivage parfait les fend au moindre choc (grec « bien cassant »)." }],
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
  const PEG = "Pas de diagramme : la pegmatite cristallise à partir d'un liquide très riche en eau et en éléments rares, que le diagramme du granite ne représente pas.";
  const PROFOND = "Pas de diagramme : ces pressions (13 à 24 GPa, 400 à 660 km) dépassent l'échelle des diagrammes de l'atlas.";
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + t });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE("minéral rare, formé dans des conditions particulières.")), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin, o) => Object.assign({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." }, o || {});
  const magma = (echelle, chemin, o) => Object.assign({ type: "magma", echelle, chemin, note: "Chemin schématique." }, o || {});
  const SF = (t) => "Forme non dessinée : " + t;
  const AL = { courbes: ["kyAnd", "andSil", "kySil"] };

  Object.assign(MIN_F, {
    phenacite: {
      forme: `La phénacite est une charpente de tétraèdres SiO₄ et BeO₄ liés par leurs sommets, percée de canaux le long de c. Dure (7,5–8),
        elle imite le quartz, d'où son nom.`,
      intro: `La phénacite naît dans les pegmatites et les fentes alpines, souvent aux dépens du béryl.`,
      scenarios: [s("Dans une pegmatite ou une fente alpine", `Quand le béryl s'altère dans des fluides tardifs, son béryllium recristallise en phénacite ; elle
        pousse aussi dans les fentes des Alpes et de l'Oural.`, { cond: false, sansDiagramme: PEG })],
    },
    willemite: {
      forme: `Même charpente que la phénacite, avec le zinc à la place du béryllium. Le manganèse qu'elle contient la rend fluorescente
        en vert vif sous ultraviolets.`,
      intro: `La willémite se forme dans les gisements de zinc métamorphisés ou dans les zones oxydées de gisements de zinc.`,
      scenarios: [s("Dans le marbre de Franklin", `Avec la franklinite et la zincite, dans les marbres métamorphisés de Franklin (New Jersey) ; plus rarement
        dans les zones d'oxydation des gisements de zinc.`, RARE("métamorphisme d'un gisement de composition exceptionnelle."))],
    },
    eucryptite: {
      sansForme: SF("l'eucryptite forme des grains et des intercroissances avec l'albite, sans cristaux libres."),
      forme: `L'eucryptite a la charpente de la phénacite, lithium et aluminium à la place du béryllium. Chauffée, elle se dilate à peine,
        ce qui en fait un ingrédient des vitrocéramiques.`,
      intro: `L'eucryptite naît de l'altération du spodumène dans les pegmatites à lithium.`,
      scenarios: [s("Dans une pegmatite à lithium", `Le spodumène, en refroidissant dans les pegmatites, se transforme en eucryptite et albite
        (Bikita, Zimbabwe ; Branchville, Connecticut).`, { cond: false, sansDiagramme: PEG })],
    },
    olivine: {
      forme: `L'olivine est faite de tétraèdres SiO₄ isolés, reliés par du magnésium et du fer dans des octaèdres : aucune chaîne, aucun
        feuillet, d'où l'absence de bon clivage. Magnésium et fer se remplacent en toutes proportions, de la forstérite à la fayalite.
        Ces liaisons ioniques cèdent vite à l'eau : c'est l'un des minéraux qui s'altèrent le plus vite.`,
      intro: `L'olivine cristallise la première dans les magmas basiques ; c'est le minéral principal du manteau supérieur.`,
      scenarios: [
        s("Dans un magma basaltique", `Quand un basalte commence à refroidir, vers 1 200–1 300 °C, l'olivine cristallise la première, en grains verts que
          l'on voit dans les basaltes d'Auvergne.`, magma("croute", [
            pt(1300, 0.4, 1, "Un magma basaltique monte du manteau."),
            pt(1220, 0.2, 2, "L'olivine cristallise la première.", { bande: "cristallisation" }),
            pt(1100, 0, 3, "La lave s'épanche : l'olivine reste en grains dans le basalte.")]), ["hirschmann"]),
        s("Dans le manteau", `La péridotite du manteau est faite aux deux tiers d'olivine riche en magnésium (Fo₉₀). Les nodules de péridotite arrachés
          par les volcans d'Auvergne (Montferrier, Massif central) en apportent des morceaux en surface.`, RARE("voir la fiche de la péridotite.")),
      ],
    },
    forsterite: {
      forme: `Pôle magnésien de l'olivine : tétraèdres SiO₄ isolés et magnésium en octaèdres. C'est le silicate qui fond le plus haut
        (1 890 °C).`,
      intro: `La forstérite forme le manteau et les marbres dolomitiques chauffés.`,
      scenarios: [
        s("Dans le manteau", `L'olivine du manteau est à 90 % forstérite ; elle cristallise aussi la première des magmas les plus magnésiens
          (komatiites).`, RARE("voir la fiche de l'olivine.")),
        s("Dans un marbre dolomitique", `Une dolomie siliceuse chauffée au contact d'un granite réagit : la dolomite et le quartz donnent forstérite et calcite.`,
          contact([pt(150, 0.15, 1, "Une dolomie siliceuse repose à quelques kilomètres."), pt(600, 0.15, 2, "Un granite s'injecte : vers 500–650 °C, dolomite et quartz réagissent en forstérite et calcite.", { bande: "forstérite" }), pt(15, 0, 3, "L'érosion met le marbre à jour.")]), ["tuttle"]),
      ],
    },
    fayalite: {
      forme: `Pôle ferreux de l'olivine. Le fer, plus lourd, la rend plus dense (4,4) et plus fusible (1 205 °C) que la forstérite.`,
      intro: `La fayalite cristallise dans les magmas riches en fer et pauvres en magnésium.`,
      scenarios: [s("Dans une lave ou un granite riche en fer", `Dans les rhyolites, les granites alcalins et les scories métallurgiques, où le fer abonde
        et le magnésium manque. Décrite dans des scories de l'île de Fayal (Açores).`, RARE("magmas très évolués, riches en fer."))],
    },
    tephroite: {
      sansForme: SF("la téphroïte forme des masses grenues, rarement des cristaux."),
      forme: `Olivine où le manganèse remplace le magnésium.`,
      intro: `La téphroïte se forme dans les gisements de manganèse métamorphisés.`,
      scenarios: [s("Dans un gisement de manganèse métamorphisé", `Franklin, Långban : quand un sédiment riche en manganèse et en silice est chauffé.`,
        meta([pt(15, 0, 1, "Un sédiment riche en manganèse et en silice se dépose."), pt(550, 0.4, 2, "Enfoui et chauffé, il recristallise en téphroïte.", { bande: "téphroïte" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    liebenbergite: {
      sansForme: SF("la liebenbergite forme des grains microscopiques."),
      forme: `Olivine où le nickel remplace le magnésium : elle est verte, comme beaucoup de minéraux de nickel.`,
      intro: `La liebenbergite est un minéral rare des gisements de nickel métamorphisés.`,
      scenarios: [s("Dans un gisement de nickel métamorphisé", `Décrite en 1973 dans la ceinture de roches vertes de Barberton (Afrique du Sud).`)],
    },
    monticellite: {
      sansForme: SF("la monticellite forme des grains dans les marbres et les roches alcalines."),
      forme: `Olivine dont un site sur deux est occupé par le calcium, l'autre par le magnésium.`,
      intro: `La monticellite naît au contact très chaud d'un magma et d'une dolomie.`,
      scenarios: [s("Au contact d'un magma", `Dolomies chauffées au-delà de ≈ 700 °C à faible pression (Monte Somma, Crestmore), et certaines roches alcalines et
        kimberlites.`, contact([pt(150, 0.05, 1, "Une dolomie repose près de la surface."), pt(800, 0.05, 2, "Un magma la chauffe vers 750–850 °C : la monticellite cristallise.", { bande: "monticellite" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]), ["tuttle"])],
    },
    kirschsteinite: {
      sansForme: SF("la kirschsteinite forme des grains microscopiques."),
      forme: `Olivine à calcium et fer, un site chacun.`,
      intro: `La kirschsteinite cristallise dans des laves très pauvres en silice et dans certaines météorites.`,
      scenarios: [s("Dans une lave sous-saturée", `Laves du Nyiragongo (Congo), d'où elle a été décrite, et météorites anciennes (angrites).`)],
    },
    glaucochroite: {
      sansForme: SF("la glaucochroïte forme des prismes et des grains, mal décrits."),
      forme: `Olivine à calcium et manganèse, un site chacun.`,
      intro: `La glaucochroïte est un minéral de Franklin (New Jersey).`,
      scenarios: [s("Dans le marbre de Franklin", `Avec la willémite et la franklinite ; elle brille en jaune sous ultraviolets.`)],
    },
    larsenite: {
      sansForme: SF("la larsénite forme de petits prismes rares et mal décrits."),
      forme: `Silicate de plomb et de zinc ; le plomb n'est lié à des oxygènes que d'un côté (doublet libre).`,
      intro: `La larsénite ne se trouve qu'à Franklin (New Jersey).`,
      scenarios: [s("Dans le marbre de Franklin", `Une des plus de 350 espèces de Franklin et Sterling Hill, dont plusieurs dizaines n'ont été trouvées nulle part ailleurs.`)],
    },
    wadsleyite: {
      sansForme: SF("la wadsleyite naturelle forme des grains microscopiques, dans des météorites choquées."),
      forme: `La wadsleyite a la formule de l'olivine, mais ses tétraèdres vont par paires (Si₂O₇) : elle est 8 % plus dense. Un oxygène
        sur huit n'est lié à aucun silicium et peut porter un hydrogène : elle peut contenir jusqu'à 3 % d'eau.`,
      intro: `La wadsleyite est la forme de l'olivine entre 410 et 525 km de profondeur.`,
      scenarios: [s("Dans la zone de transition du manteau", `Sous 410 km, la pression (≈ 13 GPa) transforme l'olivine en wadsleyite : c'est la
        discontinuité sismique des 410 km. En surface, on ne la trouve que dans des météorites choquées (météorite de Peace River, Canada) où le choc l'a fabriquée.`,
        { cond: false, sansDiagramme: PROFOND }, [SRC.frost])],
    },
    ringwoodite: {
      sansForme: SF("la ringwoodite naturelle forme des grains microscopiques, dans des météorites choquées ou en inclusion dans un diamant."),
      forme: `La ringwoodite a la structure du spinelle : oxygènes en empilement cubique compact, silicium en tétraèdres, magnésium en
        octaèdres. Elle aussi peut contenir de l'eau.`,
      intro: `La ringwoodite est la forme de l'olivine entre 525 et 660 km de profondeur.`,
      scenarios: [s("Dans la zone de transition du manteau", `Vers 520 km (≈ 18 GPa), la wadsleyite devient ringwoodite. En 2014, une inclusion de
        ringwoodite contenant ≈ 1,5 % d'eau a été trouvée dans un diamant brésilien (Juína) : la zone de transition pourrait contenir autant d'eau que les
        océans.`, { cond: false, sansDiagramme: PROFOND }, [SRC.pearson, SRC.frost])],
    },

    // ── grenats ──
    grenat: {
      forme: `Dans les grenats, des tétraèdres SiO₄ isolés sont reliés par des octaèdres (aluminium, fer, chrome) et par de grands sites à
        huit oxygènes (calcium, magnésium, fer, manganèse). Cette charpente serrée, sans plan faible, explique l'absence de clivage, la
        dureté (6,5–7,5) et les formes très équantes : dodécaèdre et trapézoèdre.`,
      intro: `Les grenats naissent surtout du métamorphisme ; leur composition dit la pression et la température atteintes.`,
      scenarios: [s("Dans un micaschiste", `Les argiles enfouies et chauffées au-delà de ≈ 500 °C font pousser des grenats almandins, qui englobent les grains
        voisins en grandissant ; leurs zones de croissance enregistrent le chemin pression–température de la roche.`, meta([
          pt(15, 0, 1, "Une argile se dépose."), pt(550, 0.6, 2, "Enfouie dans une collision vers 20–25 km, chauffée au-delà de 500 °C, elle fait pousser des grenats.", { bande: "grenat" }),
          pt(15, 0, 3, "L'érosion de la chaîne ramène le micaschiste et ses grenats en surface.")]), ["pattison", SRC.spear])],
    },
    almandin: {
      forme: `Grenat ferreux et alumineux : fer dans les grands sites, aluminium dans les octaèdres. Rouge sombre, dense (4,3).`,
      intro: `L'almandin est le grenat du métamorphisme régional : micaschistes et gneiss.`,
      scenarios: [s("Dans un micaschiste", `Les micaschistes de l'île de Groix et du Massif central en sont piquetés ; il apparaît vers 500 °C.`, meta([
        pt(15, 0, 1, "Une argile se dépose."), pt(550, 0.6, 2, "Vers 500–600 °C, l'almandin pousse aux dépens de la chlorite et des micas.", { bande: "grenat" }),
        pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison", SRC.spear])],
    },
    pyrope: {
      forme: `Grenat magnésien : le magnésium, petit pour un site à huit oxygènes, n'y tient qu'à haute pression. Rouge sang ; le chrome le
        teinte de violet.`,
      intro: `Le pyrope est le grenat du manteau et des roches de très haute pression.`,
      scenarios: [s("Dans le manteau", `Au-delà de ≈ 80 km, l'aluminium de la péridotite passe du spinelle au grenat : la lherzolite à grenat. Les kimberlites
        en remontent des grains, avec les diamants ; en Bohême, les grenats de pyrope des basaltes ont fait la richesse des joailliers.`,
        magma("profond", [pt(1100, 3.0, 1, "Au-delà de ≈ 2,5 GPa (80 km), l'aluminium du manteau cristallise en pyrope."), pt(1050, 0.1, 2, "Une kimberlite remonte très vite et arrache des grains de pyrope.")]), ["hirschmann"])],
    },
    spessartine: {
      forme: `Grenat manganésifère et alumineux. Orange vif.`,
      intro: `La spessartine se forme dans les pegmatites et les roches métamorphiques riches en manganèse.`,
      scenarios: [s("Dans une pegmatite", `Le manganèse se concentre dans les derniers liquides des granites : la spessartine cristallise dans les pegmatites
        (Namibie, Pakistan). Décrite dans le Spessart (Bavière).`, { cond: false, sansDiagramme: PEG })],
    },
    knorringite: {
      sansForme: SF("la knorringite forme des grains en inclusion dans les diamants et les kimberlites."),
      forme: `Grenat de magnésium et de chrome, stable seulement à très haute pression.`,
      intro: `La knorringite est un grenat du manteau profond, compagnon des diamants.`,
      scenarios: [s("Dans le manteau, avec les diamants", `Les prospecteurs de diamants cherchent ces grenats violets riches en chrome dans les sables :
        ils signalent une kimberlite qui a traversé la zone du diamant.`, RARE("voir les fiches du pyrope et du diamant."))],
    },
    grossulaire: {
      forme: `Grenat calcique et alumineux. Pur, il est incolore ; un peu de fer le colore en miel (hessonite), le vanadium en vert (tsavorite).`,
      intro: `Le grossulaire naît du métamorphisme des calcaires impurs.`,
      scenarios: [s("Dans un skarn ou un marbre", `Un calcaire argileux chauffé au contact d'un granite : calcium, aluminium et silice cristallisent en grossulaire.`,
        contact([pt(150, 0.12, 1, "Un calcaire argileux repose à 4–5 km."), pt(550, 0.12, 2, "Un granite le chauffe : le grossulaire cristallise.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met le skarn à jour.")]), ["tuttle"])],
    },
    andradite: {
      forme: `Grenat calcique et ferrique : fer trivalent dans les octaèdres. Sa variété démantoïde disperse la lumière plus que le diamant.`,
      intro: `L'andradite naît dans les skarns et les serpentinites.`,
      scenarios: [
        s("Dans un skarn", `Les fluides du granite apportent fer et silice au calcaire : l'andradite cristallise avec les pyroxènes (Costabonne, Pyrénées).`,
          contact([pt(150, 0.12, 1, "Un calcaire repose près d'un granite."), pt(550, 0.12, 2, "Les fluides du granite apportent fer et silice : l'andradite cristallise.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met le skarn à jour.")]), ["tuttle"]),
        s("Dans une serpentinite", `Le démantoïde vert de l'Oural et du Val Malenco pousse dans les fissures des serpentinites.`, RARE("cristallisation dans des fissures, à basse température.")),
      ],
    },
    uvarovite: {
      forme: `Grenat calcique et chromifère, vert émeraude. Les cristaux restent petits (quelques millimètres).`,
      intro: `L'uvarovite se forme dans les serpentinites, près de la chromite.`,
      scenarios: [s("Sur la chromite", `Les fluides chargés de calcium qui traversent les serpentinites reprennent le chrome de la chromite : druses vertes de
        l'Oural (Saranovskoye) et d'Outokumpu.`, RARE("cristallisation dans des fissures, à basse température."))],
    },
    goldmanite: {
      sansForme: SF("la goldmanite forme des grains microscopiques."),
      forme: `Grenat calcique au vanadium.`,
      intro: `La goldmanite est un grenat rare des roches riches en vanadium.`,
      scenarios: [s("Dans un schiste ou un gisement d'uranium-vanadium", `Décrite en 1964 au Nouveau-Mexique (gisement de Laguna).`)],
    },
    schorlomite: {
      forme: `Grenat calcique au titane (et au fer, jusque dans les tétraèdres) : noir.`,
      intro: `La schorlomite cristallise dans les roches alcalines.`,
      scenarios: [s("Dans une syénite néphélinique", `Dans les magmas pauvres en silice et riches en titane : syénites néphéliniques, ijolites, carbonatites (Kaiserstuhl,
        Magnet Cove).`, RARE("roches magmatiques alcalines rares."))],
    },
    hydrogrossulaire: {
      sansForme: SF("l'hydrogrossulaire forme des masses compactes (« jade du Transvaal »)."),
      forme: `Grenat calcique où une partie des tétraèdres SiO₄ est remplacée par quatre OH : sans silice du tout, c'est la katoïte.`,
      intro: `L'hydrogrossulaire naît dans les roches calciques altérées par l'eau, surtout les rodingites.`,
      scenarios: [s("Dans une rodingite", `Quand l'eau qui serpentinise une péridotite traverse un filon de gabbro, elle lui apporte du calcium et lui retire de la
        silice : le filon devient rodingite, riche en hydrogrossulaire.`, RARE("voir la fiche de la rodingite."))],
    },
    majorite: {
      sansForme: SF("la majorite forme des grains microscopiques dans les météorites choquées et les inclusions de diamants."),
      forme: `Grenat où une partie du silicium entre dans les octaèdres, ce que seule une pression énorme permet.`,
      intro: `La majorite est le grenat du manteau profond, au-delà de ≈ 250 km.`,
      scenarios: [s("Dans le manteau profond", `Entre 300 et 660 km, les pyroxènes se dissolvent dans le grenat, qui devient majorite. Décrite en 1970 dans la
        météorite de Coorara (Australie).`, { cond: false, sansDiagramme: PROFOND })],
    },

    // ── groupe du zircon ──
    zircon: {
      forme: `Le zircon est fait de tétraèdres SiO₄ et d'ions zirconium entourés de huit oxygènes, en chaînes le long de c. Très dur (7,5),
        presque insoluble et réfractaire, il traverse l'érosion, le transport et même le métamorphisme sans s'altérer. L'uranium entre
        dans son réseau, le plomb non : tout le plomb d'un zircon vient de la désintégration de son uranium, d'où sa valeur de chronomètre.`,
      intro: `Le zircon cristallise dans les granites ; les plus vieux minéraux de la Terre (4,4 milliards d'années, Jack Hills) sont des zircons.`,
      scenarios: [
        s("Dans un granite", `Le zirconium se concentre dans le magma jusqu'à saturer : le zircon cristallise tôt, en petits prismes inclus dans la biotite (où
          ses radiations font des auréoles sombres). Sa forme dépend de la chimie et de la température du magma.`, magma("croute", [
            pt(850, 0.4, 1, "La croûte fond en partie et le magma emporte le zirconium."), pt(760, 0.3, 2, "En refroidissant, il sature en zirconium : le zircon cristallise.", { bande: "cristallisation" }),
            pt(680, 0.3, 3, "Le granite achève de cristalliser.")]), ["hirschmann", SRC.pupin]),
        s("Dans un sable", `Indestructible, il passe d'un sable à l'autre pendant des milliards d'années : les grains de zircon des grès d'Australie (Jack Hills)
          gardent la trace d'une croûte de 4,4 milliards d'années.`, RARE("même tri par l'eau que les autres minéraux lourds.")),
      ],
    },
    hafnon: {
      sansForme: SF("le hafnon forme de petits grains dans les pegmatites."),
      forme: `Zircon où le hafnium a remplacé le zirconium ; les deux éléments sont presque de même taille et toujours ensemble.`,
      intro: `Le hafnon est un minéral rare des pegmatites.`,
      scenarios: [s("Dans une pegmatite", `Décrit en 1974 dans les pegmatites de Zambézie (Mozambique).`, { cond: false, sansDiagramme: PEG })],
    },
    thorite: {
      forme: `Zircon où le thorium a remplacé le zirconium. Sa radioactivité détruit peu à peu le réseau : la plupart des thorites sont
        amorphes (métamictes).`,
      intro: `La thorite cristallise dans les pegmatites et les granites alcalins.`,
      scenarios: [s("Dans une pegmatite", `Décrite en Norvège (Løvøya) en 1829 : c'est en l'analysant que Berzelius a découvert le thorium.`, { cond: false, sansDiagramme: PEG })],
    },
    huttonite: {
      sansForme: SF("la huttonite forme de petits grains dans les sables lourds."),
      forme: `Même formule que la thorite, mais la structure de la monazite : forme stable du ThSiO₄ à haute température.`,
      intro: `La huttonite a été décrite dans les sables de plage de Nouvelle-Zélande.`,
      scenarios: [s("Dans un sable de plage", `Décrite en 1951 dans les sables de Gillespie's Beach (Nouvelle-Zélande).`)],
    },
    coffinite: {
      sansForme: SF("la coffinite forme des grains et des enduits microscopiques."),
      forme: `Zircon où l'uranium a remplacé le zirconium, avec de l'eau.`,
      intro: `La coffinite est un minerai d'uranium des grès, formé en milieu réducteur.`,
      scenarios: [s("Dans un grès uranifère", `Avec la pechblende, là où une eau qui portait de l'uranium oxydé rencontre de la matière organique : gisements des
        grès du Colorado Plateau, de Lodève (Hérault).`, RARE("voir la fiche de l'uraninite (diagramme Eh–pH de l'uranium)."))],
    },

    // ── silicates d'alumine ──
    andalousite: {
      forme: `L'andalousite (Al₂SiO₅) a des chaînes d'octaèdres d'aluminium le long de c, reliées par des tétraèdres SiO₄ et par
        d'autres aluminiums à cinq oxygènes. C'est le polymorphe de basse pression du trio andalousite–disthène–sillimanite.`,
      intro: `L'andalousite naît des argiles chauffées à faible profondeur, autour des granites.`,
      scenarios: [s("Autour d'un granite", `Un schiste argileux chauffé par un granite à quelques kilomètres de profondeur (moins de 0,4 GPa) fait pousser
        l'andalousite : schistes tachetés, cornéennes. La mine de Glomel (Côtes-d'Armor) en extrait pour les réfractaires.`,
        contact([pt(150, 0.12, 1, "Un schiste argileux repose à 4 km."), pt(550, 0.12, 2, "Un granite le chauffe vers 500–600 °C : l'andalousite cristallise.", { bande: "andalousite" }), pt(15, 0, 3, "L'érosion met la cornéenne à jour.")], { courbes: ["graniteEau", "kyAnd", "andSil", "kySil"] }), ["pattison", "tuttle"])],
    },
    disthene: {
      forme: `Le disthène (cyanite) a la même formule, mais tous ses aluminiums sont en octaèdres : plus compact (3,6 au lieu de 3,15),
        c'est le polymorphe de haute pression. Ses chaînes d'octaèdres le long de c font les lames, et sa dureté change selon la
        direction.`,
      intro: `Le disthène naît des argiles enfouies profondément dans les chaînes de montagnes.`,
      scenarios: [s("Dans un micaschiste enfoui", `Au-delà de ≈ 0,5 GPa (20 km), l'aluminium des argiles cristallise en disthène : micaschistes et gneiss des
        chaînes de collision, éclogites.`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(600, 0.9, 2, "Enfouie à plus de 25–30 km, elle recristallise : le disthène pousse.", { bande: "disthène" }), pt(15, 0, 3, "L'érosion le ramène en surface.")], AL), ["pattison"])],
    },
    sillimanite: {
      forme: `La sillimanite (Al₂SiO₅) a des chaînes d'octaèdres d'aluminium et des chaînes doubles de tétraèdres (Si et Al) le long de c :
        d'où les aiguilles. C'est le polymorphe de haute température.`,
      intro: `La sillimanite naît des argiles portées à très haute température.`,
      scenarios: [s("Dans un gneiss très chaud", `Au-delà de ≈ 600–650 °C, l'aluminium des gneiss cristallise en sillimanite ; elle accompagne souvent la fusion
        partielle (migmatites).`, meta([pt(15, 0, 1, "Une argile se dépose."), pt(720, 0.6, 2, "Enfouie et chauffée au-delà de 650 °C, elle recristallise : la sillimanite pousse en aiguilles.", { bande: "sillimanite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")], AL), ["pattison"])],
    },
    mullite: {
      sansForme: SF("la mullite naturelle forme des aiguilles microscopiques."),
      forme: `La mullite a des chaînes d'octaèdres d'aluminium comme la sillimanite, mais plus d'aluminium et moins d'oxygène : des sites
        restent vides. Elle se forme à très haute température et basse pression.`,
      intro: `La mullite naturelle est rare ; c'est le constituant principal des porcelaines.`,
      scenarios: [s("Dans une argile cuite par une lave", `Décrite sur l'île de Mull (Écosse), dans des enclaves d'argile cuites par les basaltes. En cuisant, toute
        porcelaine en fabrique.`, RARE("cuisson brève à très haute température."))],
    },
    topaze: {
      forme: `La topaze associe des octaèdres d'aluminium (avec fluor et OH) et des tétraèdres SiO₄. Les plans {001} ne recoupent aucun
        tétraèdre : clivage basal parfait. Dure (8), elle est l'étalon 8 de l'échelle de Mohs.`,
      intro: `La topaze cristallise à partir des fluides riches en fluor au sommet des granites.`,
      scenarios: [s("Dans un greisen ou une pegmatite", `En fin de cristallisation, les fluides fluorés transforment le granite (greisen) et remplissent les cavités
        des pegmatites : Échassières (Allier), Ouro Preto (Brésil) pour la topaze impériale.`, { cond: false, sansDiagramme: PEG })],
    },
    euclase: {
      forme: `L'euclase associe des tétraèdres SiO₄ et BeO₃(OH) en couches et des octaèdres d'aluminium ; le clivage parfait passe entre
        les couches.`,
      intro: `L'euclase se forme aux dépens du béryl, dans les pegmatites et les fentes.`,
      scenarios: [s("Dans une pegmatite", `Quand le béryl s'altère dans des fluides tardifs : Minas Gerais (Brésil), Oural, et fentes alpines.`, { cond: false, sansDiagramme: PEG })],
    },
    staurotide: {
      forme: `La staurotide alterne des couches de type disthène et des couches d'hydroxyde de fer et d'aluminium : presque un disthène
        feuilleté. Ses macles en croix lui ont donné son nom (grec <i>stauros</i>, la croix).`,
      intro: `La staurotide est le minéral repère du métamorphisme moyen des argiles riches en fer.`,
      scenarios: [s("Dans un micaschiste", `Elle apparaît vers 550 °C et disparaît vers 700 °C : les géologues s'en servent pour cartographier les zones du
        métamorphisme. Les croisettes de Coadry (Finistère) et de Baud (Morbihan) sont célèbres.`, meta([pt(15, 0, 1, "Une argile riche en fer et en aluminium se dépose."), pt(600, 0.6, 2, "Enfouie et chauffée vers 550–650 °C, elle fait pousser la staurotide.", { bande: "staurotide" }), pt(15, 0, 3, "L'érosion la ramène en surface.")], AL), ["pattison", SRC.spear])],
    },

    // ── humites ──
    norbergite: {
      sansForme: SF("la norbergite forme des grains dans les marbres."),
      forme: `Groupe de la humite : tranches d'olivine et couches de type brucite où le fluor et l'OH remplacent l'oxygène. La norbergite
        en a une de chaque.`,
      intro: `Les minéraux du groupe de la humite naissent dans les marbres dolomitiques chauffés en présence de fluor.`,
      scenarios: [s("Dans un marbre de contact", `Une dolomie siliceuse chauffée par un granite qui lui apporte du fluor (Norberg, Suède).`,
        contact([pt(150, 0.1, 1, "Une dolomie siliceuse repose près d'un granite."), pt(550, 0.1, 2, "Les fluides fluorés du granite la font recristalliser : la norbergite cristallise.", { bande: "humites" }), pt(15, 0, 3, "L'érosion met le marbre à jour.")]), ["tuttle"])],
    },
    chondrodite: {
      sansForme: SF("la chondrodite forme des grains dans les marbres."),
      forme: `Groupe de la humite : deux tranches d'olivine pour une couche Mg(F,OH)₂.`,
      intro: `La chondrodite naît dans les marbres dolomitiques chauffés en présence de fluor.`,
      scenarios: [s("Dans un marbre de contact", `Grains jaunes à orange dans les marbres et les skarns (Tilly Foster, New York ; Pargas, Finlande).`,
        contact([pt(150, 0.1, 1, "Une dolomie siliceuse repose près d'un granite."), pt(600, 0.1, 2, "Les fluides fluorés la font recristalliser : la chondrodite cristallise.", { bande: "humites" }), pt(15, 0, 3, "L'érosion met le marbre à jour.")]), ["tuttle"])],
    },
    humite: {
      sansForme: SF("la humite forme des grains et de petits cristaux mal décrits."),
      forme: `Groupe de la humite : trois tranches d'olivine pour une couche Mg(F,OH)₂.`,
      intro: `La humite naît dans les marbres dolomitiques chauffés et dans les blocs rejetés par les volcans.`,
      scenarios: [s("Dans un marbre de contact", `Décrite dans les blocs de marbre rejetés par le Vésuve (Monte Somma).`, RARE("voir la chondrodite."))],
    },
    clinohumite: {
      sansForme: SF("la clinohumite forme des grains ; les rares cristaux gemmes (Pamir) sont mal décrits."),
      forme: `Groupe de la humite : quatre tranches d'olivine pour une couche Mg(F,OH)₂. La variété à OH seule est stable jusque dans le
        manteau et y transporte de l'eau.`,
      intro: `La clinohumite naît dans les marbres et dans les serpentinites enfouies.`,
      scenarios: [s("Dans une serpentinite enfouie", `Dans les zones de subduction, les serpentinites entraînées en profondeur produisent de la clinohumite riche en
        titane, qui porte de l'eau jusqu'à 100–200 km.`, RARE("voir la fiche de la serpentinite."))],
    },
    alleghanyite: {
      sansForme: SF("l'alléghanyite forme des grains dans les gisements de manganèse."),
      forme: `Structure de la chondrodite, manganèse à la place du magnésium.`,
      intro: `L'alléghanyite est un minéral des gisements de manganèse métamorphisés.`,
      scenarios: [s("Dans un gisement de manganèse métamorphisé", `Décrite en 1932 dans le comté d'Alleghany (Caroline du Nord).`)],
    },
    titanite: {
      sansForme: SF("ses cristaux en coin (enveloppes) sont décrits dans une autre maille que celle de la structure 3D ; la conversion des indices n'a pas pu être vérifiée."),
      forme: `La titanite (sphène) est faite de chaînes d'octaèdres TiO₆ reliées par des tétraèdres SiO₄, avec le calcium dans des cavités
        à sept oxygènes. Ses cristaux en coin lui ont valu le nom de sphène (grec « coin »).`,
      intro: `La titanite est l'accessoire titané des granites, des syénites et des gneiss.`,
      scenarios: [s("Dans un granite ou une syénite", `Dans les magmas riches en calcium, le titane cristallise en titanite plutôt qu'en ilménite ; dans les gneiss,
        elle naît de la recristallisation des minéraux titanés. Ses grains servent à dater les roches (uranium–plomb).`, magma("croute", [
          pt(850, 0.3, 1, "Un magma riche en calcium monte dans la croûte."), pt(750, 0.3, 2, "Il cristallise ; le titane forme de la titanite.", { bande: "cristallisation" })]), ["hirschmann"])],
    },
    malayaite: {
      sansForme: SF("la malayaïte forme des grains dans les skarns."),
      forme: `Structure de la titanite, étain à la place du titane.`,
      intro: `La malayaïte est un minéral des skarns à étain.`,
      scenarios: [s("Dans un skarn à étain", `Décrite en 1965 en Malaisie, d'où son nom ; aussi en Cornouailles.`)],
    },
    chloritoide: {
      sansForme: SF("le chloritoïde forme des lamelles et des rosettes, sans faces mesurables."),
      forme: `Le chloritoïde alterne des couches d'octaèdres d'aluminium et des couches d'octaèdres de fer et de magnésium, reliées par
        des tétraèdres SiO₄ isolés : il ressemble à un mica, mais en lames cassantes.`,
      intro: `Le chloritoïde naît des argiles riches en aluminium et en fer, au métamorphisme faible à moyen.`,
      scenarios: [s("Dans un schiste", `Entre ≈ 400 et 550 °C, dans les schistes alumineux des Alpes et des Ardennes.`, meta([pt(15, 0, 1, "Une argile alumineuse et ferrifère se dépose."), pt(470, 0.6, 2, "Enfouie, chauffée vers 400–550 °C, elle fait pousser le chloritoïde.", { bande: "chloritoïde" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    ottrelite: {
      sansForme: SF("l'ottrélite forme des lamelles dans les schistes."),
      forme: `Chloritoïde riche en manganèse (la structure 3D est celle du chloritoïde).`,
      intro: `L'ottrélite est un chloritoïde manganésifère des schistes ardoisiers.`,
      scenarios: [s("Dans un schiste ardoisier", `Décrite à Ottré (Ardennes belges), en paillettes noires dans les phyllades.`, RARE("voir la fiche du chloritoïde."))],
    },
    datolite: {
      sansForme: SF("ses cristaux trapus, très riches en faces, sont décrits dans une autre maille que celle de la structure 3D."),
      forme: `La datolite associe des tétraèdres SiO₄ et BO₃(OH) en couches, reliées par le calcium.`,
      intro: `La datolite cristallise dans les cavités des basaltes, avec les zéolites.`,
      scenarios: [s("Dans une bulle de basalte", `Les eaux chaudes qui circulent dans les basaltes y déposent la datolite avec les zéolites et la prehnite
        (Lac Supérieur, Westfield aux États-Unis).`, RARE("dépôt d'eau chaude dans les cavités d'une lave."))],
    },
    dumortierite: {
      sansForme: SF("la dumortiérite forme des fibres et des aiguilles bleues."),
      forme: `La dumortiérite a des chaînes d'octaèdres d'aluminium le long de a, avec des tétraèdres SiO₄ et des triangles de bore : elle
        pousse en fibres bleues ou violettes.`,
      intro: `La dumortiérite cristallise dans les roches alumineuses enrichies en bore.`,
      scenarios: [s("Dans un gneiss ou une pegmatite", `Décrite en 1881 près de Lyon (Chaponost), et nommée d'après le paléontologue Eugène Dumortier.`, RARE("enrichissement en bore par les fluides."), [SRC.grew])],
    },
    kornerupine: {
      sansForme: SF("la kornérupine forme des prismes et des fibres mal décrits."),
      forme: `Chaînes d'octaèdres d'aluminium et de magnésium, reliées par des groupes Si₂O₇ et SiO₄ ; un peu de bore.`,
      intro: `La kornérupine est un minéral des granulites alumineuses et magnésiennes.`,
      scenarios: [s("Dans une granulite", `Métamorphisme de très haute température de roches riches en magnésium, aluminium et bore (Madagascar, Sri Lanka).`, RARE("métamorphisme de très haute température de compositions rares."), [SRC.grew])],
    },
    grandidierite: {
      sansForme: SF("la grandidiérite forme des prismes allongés mal décrits."),
      forme: `Chaînes d'octaèdres d'aluminium, tétraèdres SiO₄, triangles BO₃ et magnésium.`,
      intro: `La grandidiérite est un borosilicate des granulites et des pegmatites.`,
      scenarios: [s("Dans une pegmatite ou une granulite", `Décrite à Madagascar en 1902, nommée d'après l'explorateur Alfred Grandidier.`, RARE("enrichissement en bore à haute température."), [SRC.grew])],
    },
    gadolinite: {
      sansForme: SF("la gadolinite forme des masses noires et des prismes mal formés."),
      forme: `Couches de tétraèdres SiO₄ et BeO₄ reliées par du fer, avec les terres rares (yttrium) entre les couches. Souvent métamicte.`,
      intro: `La gadolinite cristallise dans les pegmatites ; c'est d'elle qu'on a tiré l'yttrium.`,
      scenarios: [s("Dans une pegmatite", `Trouvée à Ytterby (Suède) : le chimiste Johan Gadolin y a isolé l'yttria en 1794. Quatre éléments portent le nom du
        village : yttrium, ytterbium, terbium et erbium.`, { cond: false, sansDiagramme: PEG })],
    },
    cerite: {
      sansForme: SF("la cérite forme des masses grenues."),
      forme: `Silicate de cérium et de calcium. Pas de structure 3D dans l'atlas : aucun affinement trouvé dans la COD.`,
      intro: `La cérite est le minéral où le cérium a été découvert.`,
      scenarios: [s("Dans un skarn à terres rares", `À Bastnäs (Suède), Berzelius et Hisinger y ont découvert le cérium en 1803.`)],
    },
    britholite: {
      sansForme: SF("la britholite forme des grains et des prismes mal décrits."),
      forme: `Structure de l'apatite où les tétraèdres SiO₄ remplacent les PO₄ et le cérium le calcium.`,
      intro: `La britholite est un silicate de terres rares des roches alcalines.`,
      scenarios: [s("Dans une roche alcaline", `Syénites néphéliniques et carbonatites (Groenland, Kola).`)],
    },
  });
})();
