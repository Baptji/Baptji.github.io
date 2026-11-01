// ============================================================
// CLASSE II — sulfures et sulfosels : formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026
// Chargé après halogenures-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js).
// Formes et habitus : Klein et Dutrow (Manual of Mineral Science, 2007), Dana's System of Mineralogy, Handbook of
// Mineralogy ; distances au centre (d) réglées pour retrouver l'habitus décrit.
// Stibine : indices dans les axes du CIF (Pnma, a 11,31 · b 3,84 · c 11,22 Å) ; les ouvrages sont en Pbnm (a 11,23 ·
// b 11,31 · c 3,84) : leur prisme {110} devient {101}, leur clivage {010} devient {100}, l'allongement [001] devient [010].
// Non dessinés (MIN_F[id].sansForme) : chalcocite, bornite, acanthite, pentlandite, pyrrhotite, nickéline, arsénopyrite,
// orpiment, boulangérite — cristaux rares, déformés, ou décrits dans une autre maille que celle de la structure.
// ============================================================

(function () {
  const CUBIQUE = (a) => [a, a, a, 90, 90, 90];
  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ─────────── Greigite (F.12, 16/10/2026) ───────────
    greigite: {
      nom: "Greigite", couleur: "#3a3a44", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(9.876), mailleSource: "cod9000123",
      facies: [
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Octaèdres ne dépassant pas un demi-millimètre, à faces courbes, le plus souvent groupés en petites sphères ; les cubes sont rares. Dans les sols et les vases, il ne s'agit que de grains de quelques dizaines de nanomètres." },
      ],
      clivages: [],
    },

    // ─────────── Galène ───────────
    galene: {
      nom: "Galène", couleur: "#8a8f96", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(5.9315), mailleSource: "cod9013403",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "La forme la plus répandue est le cube, à l'éclat métallique, souvent de plusieurs centimètres, implanté sur la blende ou le quartz des filons." },
        { nom: "Cubo-octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.2 }],
          note: "Cube dont les angles sont largement tronqués par l'octaèdre : fréquent dans les filons formés à haute température." },
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Plus rare, cette forme est souvent associée à une teneur notable en argent ou en bismuth, qui modifient la vitesse de croissance des faces." },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "cubique, trois directions à angle droit", pas: 0.25 }],
    },

    // ─────────── Blende ───────────
    blende: {
      nom: "Blende", couleur: "#7a4a22", systeme: "cubique", classe: "-43m", classeNom: "hexakistétraédrique", reseau: "F",
      maille: CUBIQUE(5.4093), mailleSource: "cod9000107",
      macleNote: "Macle du spinelle sur {111}, très répandue : elle produit des cristaux aplatis et des groupements complexes.",
      facies: [
        { nom: "Tétraèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }],
          note: "Seulement quatre faces triangulaires : privée de centre de symétrie, la blende ne développe pas de la même façon les deux moitiés de l'octaèdre." },
        { nom: "Deux tétraèdres",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre positif", d: 1.0 }, { sym: "o′", hkl: [-1, -1, -1], nom: "tétraèdre négatif", d: 1.25 }],
          note: "Les pointes sont tronquées par le tétraèdre inverse, dont les faces, plus petites, n'ont pas le même éclat sur les cristaux réels : l'une est faite de zinc, l'autre de soufre." },
        { nom: "Tétraèdre et dodécaèdre",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 0.85 }],
          note: "Le dodécaèdre {110} prédomine, et le tétraèdre tronque un sommet sur deux : cette forme est fréquente chez les cristaux bruns ou noirs des filons." },
      ],
      clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "dodécaédrique, six directions", pas: 0.28 }],
    },

    // ─────────── Chalcopyrite ───────────
    chalcopyrite: {
      nom: "Chalcopyrite", couleur: "#c9a93a", systeme: "quadratique", classe: "-42m", classeNom: "scalénoédrique quadratique", reseau: "I",
      maille: [5.289, 5.289, 10.423, 90, 90, 90], mailleSource: "cod9007572",
      macleNote: "Sur {112}, des macles fréquentes accolent des sphénoïdes et donnent des groupements trompeurs.",
      facies: [
        { nom: "Sphénoïde", formes: [{ sym: "p", hkl: [1, 1, 2], nom: "sphénoïde", d: 1.0 }],
          note: "Le sphénoïde quadratique {112} présente presque les angles d'un tétraèdre régulier, parce que la maille est deux fois plus haute que large (c ≈ 2 a) : c'est un faux tétraèdre. Les cristaux nets restent rares ; la chalcopyrite se présente surtout en masses." },
        { nom: "Sphénoïdes positif et négatif",
          formes: [{ sym: "p", hkl: [1, 1, 2], nom: "sphénoïde positif", d: 1.0 }, { sym: "p′", hkl: [1, -1, 2], nom: "sphénoïde négatif", d: 1.2 }],
          note: "Comme les deux tétraèdres de la blende, dont elle reprend la structure, le sphénoïde inverse tronque les pointes." },
      ],
      clivages: [],
    },

    // ─────────── Cinabre ───────────
    cinabre: {
      nom: "Cinabre", couleur: "#b8262c", systeme: "trigonal", classe: "32", classeNom: "trapézoédrique trigonale", reseau: "P",
      maille: [4.145, 4.145, 9.496, 90, 90, 120], mailleSource: "cod9012082", azimut: 22, elevation: 16,
      macleNote: "Macles par pénétration selon l'axe c, fréquentes en Chine (Hunan) : deux rhomboèdres décalés de 60° l'un par rapport à l'autre.",
      facies: [
        { nom: "Tablette rhomboédrique",
          formes: [{ sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.55 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
          note: "Sur la dolomite, les cristaux du Hunan prennent cette forme : épais, rouge vif, tronqués à la base." },
        { nom: "Rhomboèdre",
          formes: [{ sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.25 }],
          note: "Rhomboèdre aux pointes à peine tronquées ; le plus souvent, le cinabre se présente en croûtes et en imprégnations rouges." },
      ],
      clivages: [{ hkl: [1, 0, -1, 0], qualite: "parfait", nom: "prismatique, parallèle aux chaînes Hg-S", pas: 0.22 }],
    },

    // ─────────── Covellite ───────────
    covellite: {
      nom: "Covellite", couleur: "#2b3f8f", systeme: "hexagonal", classe: "6/mmm", classeNom: "dihexagonale dipyramidale", reseau: "P",
      maille: [3.7938, 3.7938, 16.341, 90, 90, 120], mailleSource: "cod9000523", azimut: 20, elevation: 22,
      facies: [
        { nom: "Plaquette hexagonale",
          formes: [{ sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.22 }, { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }],
          note: "Se séparant en feuilles souples selon le clivage basal, des plaquettes minces d'un bleu indigo à reflets pourpres forment l'ensemble." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal, par les paires de soufre", pas: 0.2 }],
    },

    // ─────────── Pyrite ───────────
    pyrite: {
      nom: "Pyrite", couleur: "#d4b45a", systeme: "cubique", classe: "m-3", classeNom: "diploïdale", reseau: "P",
      maille: CUBIQUE(5.4166), mailleSource: "cod9000594",
      macleNote: "Deux pentagonododécaèdres se traversent, décalés de 90° : c'est la macle de la « croix de fer » (non dessinée, le moteur ne représente que les macles accolées).",
      facies: [
        { nom: "Cube strié", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }], stries: { cyclique: true, pas: 0.07 },
          note: "Des stries parallèles, perpendiculaires d'une face à l'autre, marquent les faces : elles correspondent aux marches d'un pentagonododécaèdre qui hésite avec le cube. Elles témoignent de la symétrie réduite de la pyrite (classe m3̄), et les cubes de Navajún (Espagne) les montrent parfaitement." },
        { nom: "Pentagonododécaèdre", formes: [{ sym: "e", hkl: [2, 1, 0], nom: "pentagonododécaèdre", d: 1.0 }],
          note: "Douze faces pentagonales : forme qu'aucun autre minéral courant ne présente, d'où son nom anglais de « pyritoèdre »." },
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Forme plus rare, qui apparaît dans les gisements formés à haute température (Elbe)." },
        { nom: "Cube et pentagonododécaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "e", hkl: [2, 1, 0], nom: "pentagonododécaèdre", d: 1.05 }],
          note: "Les arêtes du cube portent des biseaux, chacun décalé de 90° par rapport à son voisin." },
      ],
      clivages: [],
    },

    // ─────────── Marcassite ───────────
    marcassite: {
      nom: "Marcassite", couleur: "#bfb47a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.4446, 5.4246, 3.3864, 90, 90, 90], mailleSource: "cod9013067", azimut: 26, elevation: 14,
      macleNote: "Répétées sur {101}, les macles donnent des cristaux en « crête de coq » ou en « fer de lance ».",
      facies: [
        { nom: "Tablette",
          formes: [{ sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.32 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "l", hkl: [0, 1, 1], nom: "dôme", d: 0.95 }],
          note: "Aplaties selon b, à bord biseauté, ces tablettes se groupent souvent en crêtes ; dans la craie, la marcassite prend surtout la forme de rognons à structure rayonnante." },
      ],
      clivages: [],
    },

    // ─────────── Stibine ───────────
    stibine: {
      nom: "Stibine", couleur: "#7d8288", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [11.311, 3.8389, 11.223, 90, 90, 90], mailleSource: "cod9003460", azimut: 22, elevation: 14,
      facies: [
        { nom: "Prisme strié",
          formes: [
            { sym: "m", hkl: [1, 0, 1], nom: "prisme", d: 1.0 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "p", hkl: [1, 1, 1], nom: "pyramide", d: 6.5 },
          ],
          note: "Des prismes longs et striés, souvent courbés ou tordus, forment des gerbes ; leur extrémité se termine en pointe par une pyramide. Dans les ouvrages, en Pbnm, le prisme est noté {110} et l'allongement [001] : la structure 3D suit ces axes." },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100} ({010} dans la notation Pbnm des ouvrages)", pas: 0.2 }],
    },

    // ─────────── Réalgar ───────────
    realgar: {
      nom: "Réalgar", couleur: "#d0402a", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [9.325, 13.571, 6.587, 90, 106.38, 90], mailleSource: "cod9008210", azimut: 24, elevation: 14,
      facies: [
        { nom: "Prisme court",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.15 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.3 },
          ],
          note: "Prismes courts, rouge orangé, striés selon c. Ils se dégradent à la lumière et doivent donc être conservés à l'abri." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "bon", nom: "{010}", pas: 0.25 }],
    },

    // ─────────── Molybdénite ───────────
    molybdenite: {
      nom: "Molybdénite", couleur: "#8e939c", systeme: "hexagonal", classe: "6/mmm", classeNom: "dihexagonale dipyramidale", reseau: "P",
      maille: [3.161, 3.161, 12.295, 90, 90, 120], mailleSource: "cod9007660", azimut: 20, elevation: 22,
      facies: [
        { nom: "Tablette hexagonale",
          formes: [{ sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.3 }, { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }],
          note: "Lamelles hexagonales, gris bleuté, emprisonnées dans le quartz : on peut la confondre avec le graphite, mais sa trace sur la porcelaine est verdâtre." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal, entre les feuillets S-Mo-S", pas: 0.2 }],
    },

    // ─────────── Tétraédrite ───────────
    tetraedrite: {
      nom: "Tétraédrite", couleur: "#6c6f73", systeme: "cubique", classe: "-43m", classeNom: "hexakistétraédrique", reseau: "I",
      maille: CUBIQUE(10.364), mailleSource: "cod9009469",
      facies: [
        { nom: "Tétraèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }],
          note: "Ce sont ces tétraèdres nets, gris d'acier, fréquents dans les géodes des filons, qui lui ont donné son nom." },
        { nom: "Tétraèdre et tristétraèdre",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }, { sym: "n", hkl: [2, 1, 1], nom: "tristétraèdre", d: 0.97 }],
          note: "Des facettes {211} bordent chaque face du tétraèdre et en adoucissent les arêtes." },
      ],
      clivages: [],
    },

    // ─────────── Bournonite ───────────
    bournonite: {
      nom: "Bournonite", couleur: "#5e6166", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [8.153, 8.692, 7.793, 90, 90, 90], mailleSource: "cod9008197", azimut: 24, elevation: 18,
      macleNote: "Répétées sur {110}, les macles font se croiser les individus presque à angle droit (a ≈ b) : elles forment les « roues dentées » (cogwheel) de Herodsfoot (Cornouailles) ou de Pribram.",
      facies: [
        { nom: "Tablette",
          formes: [
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.6 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.15 },
          ],
          note: "Biseautées aux angles, ces tablettes épaisses ont un contour presque carré. Leur classe réelle, mm2 (le haut et le bas diffèrent selon b), ne change pourtant pas ces faces." },
      ],
      clivages: [],
    },

    // ─────────── Proustite ───────────
    proustite: {
      nom: "Proustite", couleur: "#b3242c", systeme: "trigonal", classe: "-3m", classeNom: "scalénoédrique ditrigonale", reseau: "R",
      maille: [10.825, 10.825, 8.704, 90, 90, 120], mailleSource: "cod9009993", azimut: 20, elevation: 14,
      facies: [
        { nom: "Prisme et rhomboèdre",
          formes: [{ sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.5 }],
          note: "Transparents et rouge rubis, les prismes se terminent par un rhomboèdre et noircissent à la lumière. Leur classe réelle, 3m (polaire : le haut et le bas diffèrent), est simplifiée ici en 3̄m." },
      ],
      clivages: [{ hkl: [1, 0, -1, 1], qualite: "net", nom: "rhomboédrique", pas: 0.25 }],
    },

    // ─────────── Pyrargyrite ───────────
    pyrargyrite: {
      nom: "Pyrargyrite", couleur: "#5a1c22", systeme: "trigonal", classe: "-3m", classeNom: "scalénoédrique ditrigonale", reseau: "R",
      maille: [11.0464, 11.0464, 8.7211, 90, 90, 120], mailleSource: "cod9015009", azimut: 20, elevation: 14,
      facies: [
        { nom: "Prisme et rhomboèdre",
          formes: [{ sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.5 }],
          note: "Forme identique à celle de la proustite, en rouge sombre presque noir. Classe réelle 3m, simplifiée ici en 3̄m." },
      ],
      clivages: [{ hkl: [1, 0, -1, 1], qualite: "net", nom: "rhomboédrique", pas: 0.25 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    naldrett: "Naldrett A. J. (2004). <i>Magmatic Sulfide Deposits: Geology, Geochemistry and Exploration</i>. Springer.",
    sillitoe: "Sillitoe R. H. (2010). « Porphyry copper systems ». <i>Economic Geology</i> 105, p. 3–41.",
    leach: "Leach D. L. et al. (2005). « Sediment-hosted lead-zinc deposits: a global perspective ». <i>Economic Geology 100th Anniversary Volume</i>, p. 561–607.",
    berner: "Berner R. A. (1984). « Sedimentary pyrite formation: an update ». <i>Geochimica et Cosmochimica Acta</i> 48, p. 605–615.",
    rickard: "Rickard D. (2012). <i>Sulfidic Sediments and Sedimentary Rocks</i>. Elsevier (formation de la pyrite et de la marcassite selon le pH).",
    munoz: "Munoz M., Courjault-Radé P. et Tollon F. (1992). « The massive stibnite veins of the French Palaeozoic basement: a metallogenic marker of Late Variscan brittle extension ». <i>Terra Nova</i> 4, p. 171–177.",
    rytuba: "Rytuba J. J. (2003). « Mercury from mineral deposits and potential environmental impact ». <i>Environmental Geology</i> 43, p. 326–338.",
  };
  const FILON = "Aucun diagramme n'est proposé : ici, c'est la chimie de l'eau chaude qui décide (soufre dissous, eau oxydante ou réductrice, mélange avec une autre eau), chimie qu'aucun diagramme de l'atlas ne représente.";
  const CEMENT = "Ce n'est pas la température ni la pression, mais la position de la nappe, oxydante au-dessus et réductrice au-dessous, qui décide : aucun diagramme n'est proposé.";

  Object.assign(MIN_F, {

    // ─────────── Mackinawite (F.12, 16/10/2026) ───────────
    mackinawite: {
      sansForme: "Forme non dessinée : la mackinawite se présente en minces tablettes d'un millimètre au plus, dont les faces latérales ne sont pas décrites ; dans les sols et les vases, il s'agit de grains de quelques nanomètres.",
      forme: `Un fer occupe le centre de chaque tétraèdre formé de quatre soufres ; les tétraèdres se rejoignent par leurs arêtes pour former des feuillets carrés, empilés selon c et retenus par de faibles liaisons de van der Waals, d'où le très bon clivage {001}. Dans le feuillet, les fers ne sont distants que de 2,60 Å, comme dans le fer métal. C'est la structure des supraconducteurs au fer (FeSe).`,
      intro: `C'est dans une eau sans oxygène, là où des bactéries produisent du sulfure d'hydrogène, que la mackinawite précipite en premier parmi les sulfures de fer.`,
      scenarios: [
        { nom: "Dans une vase ou un sol engorgé",
          texte: `Privées d'oxygène, des bactéries exploitent la matière organique pour réduire les sulfates de l'eau et rejettent du sulfure d'hydrogène. Au contact du fer ferreux dissous, ce gaz forme aussitôt un précipité noir de mackinawite, en grains de quelques nanomètres : c'est le noir des vases et des horizons réduits des sols de marais. Ce composé est éphémère ; il mûrit en greigite puis en pyrite, et rouille si l'air revient.`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: 0.4, n: 1, t: "À l'air libre, le fer se présente sous forme d'oxydes : aucun sulfure ne se forme." },
            { pH: 7, Eh: -0.2, n: 2, t: "En l'absence d'oxygène, le fer passe à l'état de Fe²⁺ dissous ; au contact du sulfure d'hydrogène produit par les bactéries, la mackinawite précipite." },
          ], note: "Sans figurer le soufre, le diagramme situe la mackinawite dans le domaine du Fe²⁺ dissous, lorsque l'eau contient du sulfure." },
          src: [SRC.rickard] },
        { nom: "Dans les gisements de nickel et les péridotites",
          texte: `On la rencontre également, en faibles quantités, avec la pyrrhotite et la pentlandite des gisements de nickel, ainsi que dans les
péridotites serpentinisées, où l'eau qui altère l'olivine est très réductrice.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : ce sont le soufre et le pouvoir réducteur de l'eau qui décident, et les diagrammes de l'atlas ne les représentent pas." },
      ],
    },

    // ─────────── Greigite (F.12, 16/10/2026) ───────────
    greigite: {
      forme: `Avec du soufre à la place de l'oxygène, la greigite reprend la structure spinelle de la magnétite : les soufres forment un empilement cubique compact, un fer sur trois occupe un tétraèdre et deux sur trois des octaèdres. Ses deux sites portent des aimantations opposées et inégales, si bien qu'elle est, comme la magnétite, fortement magnétique. Aucun clivage n'est connu, et ses octaèdres présentent des faces courbes.`,
      intro: `En route vers la pyrite, la mackinawite donne naissance à la greigite dans les vases et les sols sans oxygène.`,
      scenarios: [
        { nom: "Dans une vase ou un sol engorgé",
          texte: `Sans perdre sa structure de soufres, la mackinawite noire des vases s'oxyde un peu : une part du fer passe à l'état Fe³⁺ et les tétraèdres se réorganisent en spinelle. Ce stade intermédiaire vers la pyrite s'arrête quand le soufre manque. On trouve la greigite dans des sols engorgés, en grains assez petits pour garder chacun une seule aimantation.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : ce sont les bactéries, le soufre et le fer disponibles qui décident, et non la température.",
          src: [SRC.rickard, "Fassbinder J. W. E. et Stanjek H. (1994). « Magnetic properties of biogenic soil greigite (Fe₃S₄) ». <i>Geophysical Research Letters</i> 21, p. 2349–2352."] },
        { nom: "Dans une bactérie",
          texte: `Dans leur cellule, certaines bactéries magnétotactiques des vases élaborent des chapelets de cristaux de greigite qui les orientent comme une boussole ; d'autres produisent de la magnétite.`,
          cond: false, sansDiagramme: "C'est la bactérie qui fixe la chimie de sa vésicule : aucun diagramme n'est proposé.",
          src: ["Mann S. et al. (1990). « Biomineralization of ferrimagnetic greigite (Fe₃S₄) and iron pyrite (FeS₂) in a magnetotactic bacterium ». <i>Nature</i> 343, p. 258–261."] },
      ],
    },

    // ─────────── Chalcocite ───────────
    chalcocite: {
      sansForme: "Aucune forme n'est dessinée : les cristaux de chalcocite, en prismes pseudo-hexagonaux, restent rares ; elle se rencontre presque toujours en masses gris de plomb.",
      forme: `Les soufres forment un empilement presque compact, et les cuivres logés dans les vides triangulaires entre eux. En dessous de 103 °C, ces cuivres s'arrangent de manière si complexe que la maille compte 144 atomes ; au-dessus, ils circulent librement d'un vide à l'autre. Sans clivage net, la chalcocite se coupe au couteau : c'est l'un des minerais de cuivre les plus riches (80 % de cuivre).`,
      intro: `La chalcocite se développe principalement sous la zone oxydée des gisements de cuivre, où elle enrichit le minerai.`,
      scenarios: [
        { nom: "Sous la zone oxydée (enrichissement)",
          texte: `Sous la surface, l'eau de pluie attaque pyrite et chalcopyrite et dissout leur cuivre. Parvenue à la nappe, où le milieu redevient réducteur, cette eau cède le cuivre qui remplace le fer des sulfures intacts et précipite en chalcocite. Parfois plusieurs fois plus riches que le minerai d'origine, ces couches « cémentées » ont assuré la richesse des grands porphyres cuprifères du Chili et de l'Arizona.`,
          cond: false, sansDiagramme: CEMENT },
      ],
    },

    // ─────────── Bornite ───────────
    bornite: {
      sansForme: "Les cristaux de bornite, de forme pseudo-cubique, sont rares ; le plus souvent, elle se présente en masses, dont la surface se ternit en violet, bleu et rouge.",
      forme: `Un réseau cubique à faces centrées de soufres ; cuivre et fer logent dans une partie des vides tétraédriques, et l'ordre des vides restants fixe la symétrie. Désordonnée à haute température, la bornite est cubique ; en refroidissant, elle s'ordonne et devient orthorhombique, sans perdre l'allure d'un cube. Ses couleurs irisées (« minerai paon ») proviennent d'une pellicule d'altération.`,
      intro: `Dans les gisements de cuivre, primaires ou enrichis, la chalcopyrite est accompagnée de bornite.`,
      scenarios: [
        { nom: "Dans un porphyre cuprifère",
          texte: `Dans les zones les plus chaudes des porphyres cuprifères, les fluides venus du granite laissent bornite et chalcopyrite vers 400 à 600 °C ; la bornite signale les parties les plus riches en cuivre et les plus pauvres en soufre.`,
          cond: false, sansDiagramme: FILON, src: [SRC.sillitoe] },
        { nom: "Sous la zone oxydée",
          texte: `Par enrichissement aussi, la bornite apparaît lorsque le cuivre descendu de la zone oxydée remplace le fer de la chalcopyrite, comme pour la chalcocite.`,
          cond: false, sansDiagramme: CEMENT },
      ],
    },

    // ─────────── Acanthite ───────────
    acanthite: {
      sansForme: "Aucune forme n'est dessinée : presque toujours, ses cristaux sont des cubes et des octaèdres hérités de l'argentite, cubique au-dessus de 173 °C, dont l'acanthite a gardé la forme en se réorganisant (paramorphose) ; ils ne correspondent plus à sa maille actuelle.",
      forme: `Argentite : sulfure d'argent cubique au-dessus de 173 °C, dont les atomes d'argent se meuvent presque librement entre les soufres. Au refroidissement, ces argents se fixent sur des sites déterminés, et la maille devient monoclinique : on obtient l'acanthite. Les cristaux cubiques gardent alors leur silhouette, mais sont devenus des mosaïques de petits domaines. Malléable comme l'argent métal, elle se laisse couper au couteau.`,
      intro: `L'acanthite constitue le principal minerai d'argent ; c'est également elle qui ternit l'argenterie.`,
      scenarios: [
        { nom: "Dans un filon argentifère",
          texte: `Elle se dépose dans les filons de température basse à moyenne, en compagnie de la galène, de la proustite, de la
pyrargyrite et de l'argent natif : Freiberg et l'Erzgebirge, Kongsberg, Guanajuato, Sainte-Marie-aux-Mines. Les
cristaux formés au-dessus de 173 °C ont cristallisé sous forme d'argentite cubique.`,
          cond: false, sansDiagramme: FILON },
        { nom: "Sur l'argenterie",
          texte: `Les traces de sulfure d'hydrogène présentes dans l'air (œufs, caoutchouc, pollution) réagissent avec l'argent, qui se recouvre d'une pellicule noire d'acanthite de quelques dizaines de nanomètres.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : il s'agit d'une réaction de surface à température ambiante." },
      ],
    },

    // ─────────── Pentlandite ───────────
    pentlandite: {
      sansForme: "Aucune forme n'est dessinée : la pentlandite ne cristallise pas en cristaux libres, mais en grains et en flammes au sein de la pyrrhotite.",
      forme: `Un réseau cubique à faces centrées de soufres ; les métaux, fer et nickel mêlés, se regroupent par huit en petits cubes au centre des octants de la maille. Aucun clivage, mais une séparation nette selon {111}. Elle n'existe presque jamais seule : elle se sépare de la pyrrhotite au refroidissement.`,
      intro: `C'est d'un liquide sulfuré qui se détache d'un magma basique que naît la pentlandite, premier minerai de nickel.`,
      scenarios: [
        { nom: "Dans un magma basique riche en soufre",
          texte: `Un magma basaltique ou ultrabasique qui assimile des roches soufrées s'enrichit en soufre ; celui-ci se sépare alors en gouttes d'un liquide sulfuré, lourd, qui piège nickel, cuivre et platine et gagne le fond de la chambre. Vers 1 000 °C, ce liquide se fige en une solution solide riche en fer, et la pentlandite ne s'en détache que sous ≈ 600 °C, en grains puis en flammes dans la pyrrhotite. Les grands exemples sont Norilsk (Sibérie) et Sudbury (Canada, cratère d'impact de 1,85 milliard d'années).`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(1250, 0.3, 1, "En traversant des roches riches en soufre, un magma basaltique s'en charge ; des gouttes de liquide sulfuré se détachent alors, gagnent le fond de la chambre et entraînent le nickel."),
            pt(1000, 0.3, 2, "Une solution solide de fer, de nickel et de soufre : voilà ce que cristallise le liquide sulfuré.", { bande: "cristallisation" }),
            pt(500, 0.3, 3, "De cette solution solide, la pentlandite se détache sous ≈ 600 °C ; elle se présente en grains, puis en flammes au sein de la pyrrhotite."),
          ], note: "Le liquide sulfuré demeure fluide jusque vers 1 000 °C, alors que le domaine fondu relève des silicates. Chemin schématique." },
          src: ["hirschmann", SRC.naldrett] },
      ],
    },

    // ─────────── Galène ───────────
    galene: {
      forme: `Un plomb occupe le centre d'un octaèdre de six soufres, et inversement : la galène adopte donc la structure du sel de cuisine. Autant de plombs que de soufres dans les plans {100}, qui sont neutres et se séparent sans effort. Il en découle un <b>clivage cubique</b> parfait ; un coup de marteau la débite en petits cubes brillants, et ses cristaux prennent la forme de cubes.`,
      intro: `On extrait de la galène le plomb, et souvent aussi l'argent qu'elle renferme.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Chargées de plomb lessivé dans les roches profondes, des eaux chaudes et salées remontent par les failles ; au refroidissement ou au contact d'une eau riche en soufre, elles déposent galène, blende, quartz et barytine. Tel est le cas de Pontpéan (Ille-et-Vilaine), qui a fourni plomb et argent du XVIII<sup>e</sup> siècle à 1904, ou des filons de Melle (Deux-Sèvres), où l'on frappait monnaie à l'époque carolingienne.`,
          cond: false, sansDiagramme: FILON },
        { nom: "Dans les calcaires (type Mississippi Valley)",
          texte: `Ce sont les gisements des Causses (Les Malines, Gard ; Largentière, Ardèche ; Saint-Laurent-le-Minier) : des saumures chauffées à 75 à 200 °C, puisées au fond des bassins sédimentaires, migrent vers leurs bords, rencontrent calcaires et dolomies riches en soufre réduit, et y laissent galène et blende dans les cavités et les brèches.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : c'est la rencontre d'une saumure chargée de métaux et d'un calcaire riche en soufre qui détermine la formation.",
          src: [SRC.leach] },
      ],
    },

    // ─────────── Blende ───────────
    blende: {
      forme: `La blende reprend la structure du diamant, un atome sur deux étant remplacé : chaque zinc se trouve au centre d'un tétraèdre de quatre soufres, et réciproquement. Dépourvue de centre de symétrie, elle développe de façon différente les deux moitiés de l'octaèdre, ce qui donne des tétraèdres. Dans les plans {110}, zinc et soufre alternent ; ces plans sont neutres, et le clivage est parfait selon six directions. Le fer, qui remplace une partie du zinc, fait passer la couleur du miel au noir.`,
      intro: `Presque toujours accompagnée de galène, la blende est le minerai du zinc.`,
      scenarios: [
        { nom: "Dans un filon ou un calcaire",
          texte: `Filons hydrothermaux et calcaires imprégnés de saumures chaudes abritent, comme la galène, la blende. À Saint-Salvy (Tarn), un filon de blende exploité jusqu'en 1993 fut la dernière grande mine de zinc de France, et il renfermait du germanium.`,
          cond: false, sansDiagramme: FILON, src: [SRC.leach] },
        { nom: "Au fond de la mer (amas sulfurés)",
          texte: `Chauffée à 350 °C, l'eau de mer qui sort près des fumeurs noirs des dorsales se charge de métaux. Refroidie au contact de l'eau froide, elle laisse blende, pyrite et chalcopyrite former des cheminées, puis des amas qui s'effondrent. Les amas anciens, préservés dans les chaînes de montagnes, sont aujourd'hui des minerais de zinc et de cuivre.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : c'est le mélange brutal d'une eau à 350 °C avec l'eau de mer à 2 °C qui provoque la précipitation des sulfures." },
      ],
    },

    // ─────────── Chalcopyrite ───────────
    chalcopyrite: {
      forme: `Sur la structure de la blende, le cuivre et le fer remplacent alternativement le zinc : la maille, deux fois plus haute que large, reste presque aux angles du cube, si bien que les cristaux sont de faux tétraèdres (sphénoïdes). Sans clivage, elle est plus tendre que la pyrite (3,5 contre 6) et plus jaune ; un couteau suffit à la rayer.`,
      intro: `Le minerai de cuivre le plus répandu au monde, c'est la chalcopyrite.`,
      scenarios: [
        { nom: "Dans un porphyre cuprifère",
          texte: `Un granite, en se mettant en place à quelques kilomètres de profondeur, libère en cristallisant une eau salée et cuprifère qui fracture la roche environnante. Entre 300 et 500 °C, la chalcopyrite s'installe dans ces innombrables fissures avec la pyrite et la molybdénite ; le gisement compte plusieurs milliards de tonnes à 0,5 % de cuivre (Chuquicamata, Escondida au Chili).`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(900, 0.25, 1, "Riche en eau, un magma granitique remonte et s'immobilise vers 5 à 10 km."),
            pt(700, 0.12, 2, "Lors de sa cristallisation, le magma atteint la saturation en eau : une eau salée, riche en cuivre, s'en détache et fissure la roche alentour.", { bande: "cristallisation" }),
            pt(400, 0.05, 3, "La chalcopyrite se dépose dans les fissures entre 500 et 300 °C, en même temps que la pyrite et la molybdénite."),
          ], note: "Chemin schématique." },
          src: ["hirschmann", SRC.sillitoe] },
        { nom: "Dans un filon ou un amas sulfuré",
          texte: `On la rencontre également avec la galène et la blende dans les filons, ainsi que dans les amas sulfurés formés au fond de la mer. Dans le Rhône, les mines de Chessy (cuivre) et de Saint-Bel (pyrite cuivreuse) en ont fourni.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Pyrrhotite ───────────
    pyrrhotite: {
      sansForme: "La pyrrhotite forme rarement des cristaux (tablettes hexagonales) : elle se présente surtout en masses bronze, sans forme dessinée.",
      forme: `Sa structure rappelle celle de la nickéline : des fers logés dans des octaèdres de soufres empilés en colonnes, mais des fers manquent, jusqu'à un sur huit (Fe₇S₈). Ces vides s'ordonnent et rendent la pyrrhotite magnétique : après la magnétite, elle attire l'aimant plus que tout autre minéral.`,
      intro: `On rencontre la pyrrhotite dans les magmas basiques, mais aussi dans les roches métamorphiques où le soufre abonde.`,
      scenarios: [
        { nom: "Dans un magma basique",
          texte: `Issue du liquide sulfuré séparé des magmas basiques (voir la pentlandite), elle forme l'essentiel des minerais de nickel de Sudbury et de Norilsk.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : se reporter à la fiche de la pentlandite, dont elle est issue." },
        { nom: "Dans une roche métamorphique",
          texte: `Sous l'effet de la chaleur, la pyrite des schistes noirs perd du soufre au-delà de ≈ 500 °C et se mue en pyrrhotite. Ce minéral est fréquent dans les schistes et les gneiss du métamorphisme moyen à fort.`,
          cond: { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Au fond de la mer, une vase noire chargée de matière organique et de pyrite s'accumule."),
            pt(500, 0.6, 2, "Enfouie lors d'une collision, elle s'échauffe : au-delà de ≈ 500 °C, la pyrite perd du soufre et se transforme en pyrrhotite.", { bande: "pyrite → pyrrhotite" }),
            pt(15, 0, 3, "L'érosion amène la roche à l'affleurement."),
          ], note: "Schéma : la température de transformation varie avec la pression et les fluides, et ce chiffre n'en donne qu'un ordre de grandeur." },
          src: ["pattison"] },
      ],
    },

    // ─────────── Cinabre ───────────
    cinabre: {
      forme: `Le cinabre se compose de chaînes hélicoïdales Hg-S-Hg-S, à trois mercures par tour, enroulées autour de l'axe c ; elles sont visibles sur la structure 3D. Fortement liées en leur sein, ces chaînes sont reliées entre elles par des liaisons faibles, d'où le clivage prismatique parfait parallèle aux chaînes. Comme le quartz, il existe en cristaux droits et gauches.`,
      intro: `Minerai du mercure, le cinabre se dépose près de la surface, à basse température.`,
      scenarios: [
        { nom: "Près d'une source chaude",
          texte: `Très volatil, le mercure s'échappe des roches chauffées en profondeur et migre avec l'eau et la vapeur. Vers 100 à 200 °C, près de la surface, il se combine au soufre pour former du cinabre, qui imprègne grès, quartzites et calcaires. Almadén (Espagne), premier gisement mondial, a fourni environ un tiers du mercure extrait par l'humanité, suivi d'Idrija (Slovénie) et du Monte Amiata (Toscane).`,
          cond: false, sansDiagramme: FILON, src: [SRC.rytuba] },
      ],
    },

    // ─────────── Covellite ───────────
    covellite: {
      forme: `Des feuillets de couches de cuivres en triangles et de tétraèdres CuS₄, séparés par des paires de soufre : telle est la covellite. Son clivage basal parfait s'effectue entre ces couches, et les lamelles détachées sont souples. Son bleu indigo, rare chez les sulfures, tient à ces paires de soufre.`,
      intro: `La covellite se forme surtout par altération des autres sulfures de cuivre.`,
      scenarios: [
        { nom: "Sous la zone oxydée",
          texte: `Sous la zone oxydée des gisements de cuivre, elle se forme avec la chalcocite, en placages bleus qui remplacent la chalcopyrite et la bornite.`,
          cond: false, sansDiagramme: CEMENT },
        { nom: "Autour des fumerolles",
          texte: `Plus rarement, des fumerolles volcaniques la déposent directement : c'est au Vésuve qu'elle fut décrite en 1832, en l'honneur du minéralogiste napolitain Niccolò Covelli.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : le dépôt se fait à la sortie des gaz, à pression atmosphérique." },
      ],
    },

    // ─────────── Nickéline ───────────
    nickeline: {
      sansForme: "Aucune forme n'est dessinée : la nickéline cristallise rarement et se présente en masses rose cuivré.",
      forme: `Modèle d'une famille de structures, la nickéline présente des arsenics empilés de façon compacte, des nickels logés dans les vides octaédriques, et des octaèdres qui partagent leurs faces le long de l'axe c. Les nickels voisins ne sont distants que de 2,5 Å ; cette liaison en partie métallique explique l'éclat et la couleur rose cuivré. Les mineurs saxons la nommaient « Kupfernickel », faux cuivre du diable, car on n'en tirait pas de cuivre ; le nom du nickel en vient.`,
      intro: `C'est dans les filons dits « à cinq éléments » (Ag, Co, Ni, As, Bi) que se forme la nickéline.`,
      scenarios: [
        { nom: "Dans un filon à cobalt, nickel et argent",
          texte: `Dans les filons de basse température de l'Erzgebirge, de Cobalt (Ontario) et de Sainte-Marie-aux-Mines, on la retrouve avec des arséniures de cobalt, de l'argent natif et de la calcite. Une croûte vert pomme, l'annabergite, en marque l'altération.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Pyrite ───────────
    pyrite: {
      forme: `La pyrite a la structure du sel de cuisine, des paires de soufre (S₂) couchées sur les diagonales du cube occupant la place du chlore. Orientées de quatre façons, ces paires abaissent la symétrie : les axes d'ordre 3 du cube subsistent, ceux d'ordre 4 disparaissent. D'où le pentagonododécaèdre, forme impossible dans un cube parfait, et les stries perpendiculaires d'une face à l'autre. Les liaisons sont fortes dans toutes les directions : la pyrite n'a pas de clivage, et sa dureté de 6 la distingue de l'or.`,
      intro: `Partout où le fer rencontre du soufre réduit, la pyrite se forme : dans les vases sans oxygène, les filons ou les roches métamorphiques.`,
      scenarios: [
        { nom: "Dans une vase sans oxygène",
          texte: `Dans une mer ou un lac sans oxygène, des bactéries tirent leur énergie des sulfates de l'eau et rejettent du sulfure d'hydrogène. Ce gaz réagit avec le fer des argiles : apparaissent d'abord des sulfures de fer noirs, puis la pyrite, en grains microscopiques souvent groupés en framboises, en quelques années à quelques siècles. Marnes, schistes noirs et charbons en renferment beaucoup, et ce soufre produit des pluies acides à la combustion du charbon.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : la décision revient aux bactéries, à la matière organique et au fer disponible, et non à la température.",
          src: [SRC.berner] },
        { nom: "Dans un filon",
          texte: `Dans les filons, la pyrite est le sulfure le plus fréquent : elle cristallise avec presque tous les autres, sur une large plage de températures. Les cubes de Navajún (La Rioja, Espagne), développés dans une marne, sont célèbres.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Marcassite ───────────
    marcassite: {
      forme: `La marcassite partage la formule FeS₂ de la pyrite, mais son arrangement diffère : les octaèdres de soufres autour des fers forment des colonnes d'arêtes communes, dans une maille orthorhombique. Moins stable que la pyrite, elle ne se forme qu'à basse température en eau acide, et s'altère à l'air humide : ses échantillons se couvrent alors de sulfate blanc pulvérulent et s'émiettent.`,
      intro: `La marcassite apparaît à basse température et en milieu acide, dans les rognons des craies et les filons froids.`,
      scenarios: [
        { nom: "En rognons dans la craie",
          texte: `Entre les grains de craie et de marnes, une eau appauvrie en oxygène dépose la marcassite en rognons à fibres rayonnantes, recouverts d'une écorce rouillée : ce sont les « pierres de tonnerre » des falaises du Cap Blanc-Nez et du Boulonnais, longtemps prises pour des météorites. Au-dessous de ≈ 5, l'acidité favorise la marcassite ; au-dessus, la pyrite prend le dessus.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : c'est l'acidité de l'eau, et non la température, qui départage pyrite et marcassite ; l'atlas ne dispose pas de diagramme du soufre.",
          src: [SRC.rickard] },
      ],
    },

    // ─────────── Arsénopyrite ───────────
    arsenopyrite: {
      sansForme: "Aucune forme n'est dessinée : ses prismes losangiques et striés sont décrits dans une maille pseudo-orthorhombique différente de celle de la structure 3D, et la conversion de leurs indices reste non vérifiée.",
      forme: `Calquée sur la marcassite, la structure de l'arsénopyrite substitue une paire arsenic-soufre à chaque paire de soufres. Les fers, rapprochés deux à deux, inclinent la maille en monoclinique, si peu que les cristaux semblent orthorhombiques. Au choc, elle sent l'ail, comme l'arsenic.`,
      intro: `Le minerai d'arsenic le plus répandu, c'est l'arsénopyrite, qui accompagne fréquemment l'or.`,
      scenarios: [
        { nom: "Dans un filon de quartz aurifère",
          texte: `Une eau chaude, riche en soufre et en arsenic, circule dans les filons de quartz des chaînes de montagnes et y dépose l'arsénopyrite avec le quartz ; de l'or invisible, emprisonné dans le réseau, l'accompagne souvent. À Salsigne (Aude), dernière grande mine d'or de France, l'or se logeait surtout dans l'arsénopyrite, et les déchets arséniés restent un problème. À La Roche-Balue (Loire-Atlantique), les cristaux ont une composition exacte.`,
          cond: { type: "silice", tmax: 350, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 350, C: 948, n: 1, t: "À environ 350 °C, en profondeur, l'eau transporte silice, arsenic et soufre." },
              { T: 280, C: 948, n: 2, t: "En remontant par une faille, elle se refroidit et devient sursaturée." },
              { T: 250, C: 434, n: 3, t: "Quand le quartz du filon cristallise, l'arsénopyrite s'y dépose, et l'or la suit." },
            ],
            note: "Schématique, le chemin tracé sur le diagramme porte sur la silice, qui donne le quartz du filon." },
          src: ["rimstidt", "fournier"] },
      ],
    },

    // ─────────── Stibine ───────────
    stibine: {
      forme: `Des rubans d'antimoine et de soufre allongés selon b constituent la stibine, que la structure 3D montre nettement ; entre eux ne subsistent que des liaisons faibles. Les cristaux s'allongent vite le long des rubans : longs prismes striés, souvent courbés ou tordus, et clivage parfait parallèle aux rubans. Elle fond à la flamme d'une bougie (550 °C).`,
      intro: `Le minerai de l'antimoine, la stibine, cristallise dans les filons de quartz à basse température.`,
      scenarios: [
        { nom: "Dans un filon de quartz froid",
          texte: `Vers 150 à 250 °C, des eaux chaudes déposent quartz et stibine dans les failles, parfois avec un peu d'or. Vers 1900, la France, riche en filons du Massif central, était le premier producteur mondial d'antimoine : Brioude-Massiac (Haute-Loire et Cantal), La Lucette (Mayenne), Vendée.`,
          cond: { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 280, C: 560, n: 1, t: "Plus profondément, vers 250 à 300 °C, l'eau transporte silice et antimoine." },
              { T: 200, C: 560, n: 2, t: "Remontant et se refroidissant, elle atteint la sursaturation." },
              { T: 150, C: 137, n: 3, t: "Dans les vides du filon, la stibine vient après le quartz et forme des gerbes de prismes." },
            ],
            note: "Schématique, le chemin tracé sur le diagramme porte sur la silice, qui donne le quartz du filon." },
          src: ["rimstidt", "fournier", SRC.munoz] },
      ],
    },

    // ─────────── Orpiment ───────────
    orpiment: {
      sansForme: "Aucune forme n'est dessinée : les cristaux d'orpiment sont rares et mal formés ; on le trouve plutôt en masses feuilletées d'un jaune d'or.",
      forme: `Des feuillets plissés de pyramides AsS₃ forment l'orpiment, les seules forces de van der Waals unissant les feuillets. D'où un clivage parfait, des lamelles souples comme du mica et une dureté de 1,5. Le nom vient du latin <i>auripigmentum</i>, « pigment d'or » ; le minéral servit de jaune aux peintres, malgré sa toxicité.`,
      intro: `À très basse température, près de la surface, l'orpiment se dépose souvent avec le réalgar.`,
      scenarios: [
        { nom: "Près d'une source chaude ou d'une fumerolle",
          texte: `Volatil, l'arsenic remonte avec les eaux chaudes et les gaz volcaniques ; sous ≈ 150 °C, il se combine au soufre pour donner orpiment et réalgar. Il se forme aussi lorsque le réalgar exposé à la lumière s'altère.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Réalgar ───────────
    realgar: {
      forme: `Cristal de <b>molécules</b> As₄S₄ en cage, visible sur la structure 3D, le réalgar ne tient que par de faibles forces. Il est tendre (1,5 à 2) et fond à 320 °C. Sous la lumière, les cages se brisent et se réarrangent ; en quelques mois, il devient une poudre jaune orangé (pararéalgar).`,
      intro: `Le réalgar apparaît à basse température, dans les filons et au voisinage des sources chaudes.`,
      scenarios: [
        { nom: "Dans un filon froid ou près d'une source chaude",
          texte: `Dépôts de sources chaudes et filons de très basse température le réunissent à la stibine, à l'orpiment et au cinabre. Des cristaux remarquables ont été extraits à la mine de Matra, en Corse.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Molybdénite ───────────
    molybdenite: {
      forme: `Des feuillets S-Mo-S, chacun avec son molybdène au centre d'un prisme triangulaire de six soufres, forment la molybdénite ; entre eux, seules agissent des forces de van der Waals. Il en résulte un clivage basal parfait, un toucher gras, et un emploi comme lubrifiant, à l'instar du graphite qu'elle imite. Le rhénium, l'un des éléments les plus rares, se dissimule dans son réseau.`,
      intro: `Des fluides issus des granites font précipiter la molybdénite.`,
      scenarios: [
        { nom: "Autour d'un granite qui cristallise",
          texte: `À la fin de sa cristallisation, un granite hydraté libère des fluides molybdiques qui fissurent la coupole et les roches voisines. Entre ≈ 600 et 350 °C, la molybdénite prend place en lamelles dans des veines de quartz (Climax, Colorado), dans les greisens et les pegmatites.`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(850, 0.2, 1, "Un magma granitique riche en eau remonte puis s'immobilise vers 5 à 8 km."),
            pt(700, 0.15, 2, "Une fois saturé en eau pendant sa cristallisation, il libère des fluides chargés de molybdène, qui fracturent sa coupole.", { bande: "cristallisation" }),
            pt(450, 0.08, 3, "Dans les veines de quartz, la molybdénite précipite entre ≈ 600 et 350 °C."),
          ], note: "Chemin schématique." },
          src: ["hirschmann", SRC.sillitoe] },
      ],
    },

    // ─────────── Tétraédrite ───────────
    tetraedrite: {
      forme: `La tétraédrite repose sur une charpente ouverte de type blende : cuivres en tétraèdres et en triangles, antimoines en pyramides. Sans centre de symétrie, comme la blende, elle forme des cristaux en tétraèdres, d'où son nom. Fer, zinc, argent et mercure remplacent une partie du cuivre ; riche en argent, elle a longtemps été un minerai argentifère (« cuivre gris » des mineurs).`,
      intro: `Le sulfosel le plus répandu, la tétraédrite, se dépose dans les filons de température moyenne.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Elle se rencontre avec galène, blende, chalcopyrite et quartz, dans des filons de 200 à 400 °C : Banca (Pays basque), les Alpes (Saint-Véran), Freiberg, les Andes. Lorsque l'arsenic remplace l'antimoine, la tétraédrite devient tennantite.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Bournonite ───────────
    bournonite: {
      forme: `Pyramides SbS₃, cuivres en tétraèdres et plombs entourés de sept ou huit soufres : voilà la bournonite. Sa maille presque carrée (a ≈ b) permet à un cristal de pivoter de 90° tout en restant presque accordé ; répétée, cette macle produit des cristaux en roue dentée, sa signature. Elle porte le nom du comte de Bournon, minéralogiste français émigré à Londres.`,
      intro: `Dans les filons à plomb, cuivre et antimoine, la bournonite trouve son milieu.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Accompagnée de galène, de tétraédrite et de stibine, elle se forme dans les filons de température moyenne. Les roues dentées de Herodsfoot (Cornouailles), de Pribram (Bohême) et de Neudorf (Harz) sont célèbres.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Boulangérite ───────────
    boulangerite: {
      sansForme: "Forme non dessinée : la boulangérite se présente en fibres et en « cheveux » emmêlés, sans faces mesurables.",
      forme: `Les rubans de plomb, d'antimoine et de soufre, allongés selon c, forment la boulangérite, où plusieurs sites sont partagés entre plomb et antimoine. Les cristaux croissent presque uniquement le long des rubans : d'où des fibres, fines comme des cheveux, qui feutrent les géodes de quartz. Son nom honore Charles Boulanger, ingénieur des mines français.`,
      intro: `Filons à plomb, zinc et antimoine : c'est là qu'on rencontre la boulangérite.`,
      scenarios: [
        { nom: "Dans un filon à plomb et antimoine",
          texte: `Elle accompagne galène, blende et stibine. Décrite en 1837, Molières-sur-Cèze (Gard) en constitue la localité type.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Proustite ───────────
    proustite: {
      forme: `Des pyramides AsS₃, reliées par des argents et toutes orientées dans le même sens le long de c, composent la proustite : cristal polaire, à extrémités différentes. Rouge rubis et transparente, elle s'assombrit à la lumière lorsque l'argent se réduit à la surface. Son nom rend hommage au chimiste français Joseph-Louis Proust.`,
      intro: `Dans les filons argentifères formés à basse température se dépose la proustite, l'un des deux « argents rouges ».`,
      scenarios: [
        { nom: "Dans un filon argentifère",
          texte: `À basse température, dans les filons riches en argent et en arsenic, souvent au cœur des géodes : Chañarcillo (Chili), Freiberg, Sainte-Marie-aux-Mines.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Pyrargyrite ───────────
    pyrargyrite: {
      forme: `Même structure que la proustite, avec l'antimoine à la place de l'arsenic. L'antimoine, plus lourd, fait tirer la couleur vers le rouge presque noir ; son nom grec signifie « argent de feu », en référence aux reflets rouges en lumière rasante.`,
      intro: `C'est dans les filons argentifères que se trouve l'« argent rouge » le plus répandu, la pyrargyrite.`,
      scenarios: [
        { nom: "Dans un filon argentifère",
          texte: `Dans les filons de basse température de Sankt Andreasberg (Harz), de Guanajuato (Mexique) et des Vosges, elle se mêle à la galène, à l'acanthite et à la tétraédrite.`,
          cond: false, sansDiagramme: FILON },
      ],
    },
  });
})();
