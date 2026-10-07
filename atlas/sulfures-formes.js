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

    // ─────────── Galène ───────────
    galene: {
      nom: "Galène", couleur: "#8a8f96", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(5.9315), mailleSource: "cod9013403",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "La forme la plus courante : des cubes à l'éclat métallique, souvent plusieurs centimètres, posés sur la blende ou le quartz des filons." },
        { nom: "Cubo-octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.2 }],
          note: "Cube dont les sommets sont largement coupés par l'octaèdre : fréquent dans les filons chauds." },
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Plus rare ; souvent riche en argent ou en bismuth, qui changent la vitesse de croissance des faces." },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "cubique, trois directions à angle droit", pas: 0.25 }],
    },

    // ─────────── Blende ───────────
    blende: {
      nom: "Blende", couleur: "#7a4a22", systeme: "cubique", classe: "-43m", classeNom: "hexakistétraédrique", reseau: "F",
      maille: CUBIQUE(5.4093), mailleSource: "cod9000107",
      macleNote: "Macle du spinelle sur {111}, très fréquente : elle donne des cristaux aplatis et des groupements compliqués.",
      facies: [
        { nom: "Tétraèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }],
          note: "Quatre faces triangulaires seulement : sans centre de symétrie, la blende ne développe pas les deux moitiés de l'octaèdre de la même façon." },
        { nom: "Deux tétraèdres",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre positif", d: 1.0 }, { sym: "o′", hkl: [-1, -1, -1], nom: "tétraèdre négatif", d: 1.25 }],
          note: "Le tétraèdre inverse coupe les pointes : ses faces sont plus petites et, sur les vrais cristaux, d'un éclat différent (l'une est faite de zincs, l'autre de soufres)." },
        { nom: "Tétraèdre et dodécaèdre",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 0.85 }],
          note: "Le dodécaèdre {110} domine, le tétraèdre coupe un sommet sur deux : forme fréquente des cristaux bruns ou noirs des filons." },
      ],
      clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "dodécaédrique, six directions", pas: 0.28 }],
    },

    // ─────────── Chalcopyrite ───────────
    chalcopyrite: {
      nom: "Chalcopyrite", couleur: "#c9a93a", systeme: "quadratique", classe: "-42m", classeNom: "scalénoédrique quadratique", reseau: "I",
      maille: [5.289, 5.289, 10.423, 90, 90, 90], mailleSource: "cod9007572",
      macleNote: "Macles fréquentes sur {112}, qui accolent des sphénoïdes en groupements trompeurs.",
      facies: [
        { nom: "Sphénoïde", formes: [{ sym: "p", hkl: [1, 1, 2], nom: "sphénoïde", d: 1.0 }],
          note: "Un faux tétraèdre : la maille est deux fois plus haute que large (c ≈ 2 a), si bien que le sphénoïde quadratique {112} a presque les angles d'un tétraèdre régulier. Les cristaux nets sont rares ; la chalcopyrite est surtout massive." },
        { nom: "Sphénoïdes positif et négatif",
          formes: [{ sym: "p", hkl: [1, 1, 2], nom: "sphénoïde positif", d: 1.0 }, { sym: "p′", hkl: [1, -1, 2], nom: "sphénoïde négatif", d: 1.2 }],
          note: "Le sphénoïde inverse coupe les pointes, comme les deux tétraèdres de la blende, dont elle a la structure." },
      ],
      clivages: [],
    },

    // ─────────── Cinabre ───────────
    cinabre: {
      nom: "Cinabre", couleur: "#b8262c", systeme: "trigonal", classe: "32", classeNom: "trapézoédrique trigonale", reseau: "P",
      maille: [4.145, 4.145, 9.496, 90, 90, 120], mailleSource: "cod9012082", azimut: 22, elevation: 16,
      macleNote: "Macles par pénétration selon l'axe c, fréquentes en Chine (Hunan) : deux rhomboèdres tournés de 60°.",
      facies: [
        { nom: "Tablette rhomboédrique",
          formes: [{ sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.55 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
          note: "Cristaux épais, rouge vif, coupés par la base : la forme des cristaux du Hunan, posés sur la dolomite." },
        { nom: "Rhomboèdre",
          formes: [{ sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.25 }],
          note: "Rhomboèdre dont les pointes sont à peine coupées ; le plus souvent, le cinabre forme des croûtes et des imprégnations rouges." },
      ],
      clivages: [{ hkl: [1, 0, -1, 0], qualite: "parfait", nom: "prismatique, parallèle aux chaînes Hg–S", pas: 0.22 }],
    },

    // ─────────── Covellite ───────────
    covellite: {
      nom: "Covellite", couleur: "#2b3f8f", systeme: "hexagonal", classe: "6/mmm", classeNom: "dihexagonale dipyramidale", reseau: "P",
      maille: [3.7938, 3.7938, 16.341, 90, 90, 120], mailleSource: "cod9000523", azimut: 20, elevation: 22,
      facies: [
        { nom: "Plaquette hexagonale",
          formes: [{ sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.22 }, { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }],
          note: "Plaquettes minces, bleu indigo à reflets pourpres, qui se détachent en feuilles souples le long du clivage basal." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal, par les paires de soufre", pas: 0.2 }],
    },

    // ─────────── Pyrite ───────────
    pyrite: {
      nom: "Pyrite", couleur: "#d4b45a", systeme: "cubique", classe: "m-3", classeNom: "diploïdale", reseau: "P",
      maille: CUBIQUE(5.4166), mailleSource: "cod9000594",
      macleNote: "Macle de la « croix de fer » : deux pentagonododécaèdres qui se traversent, tournés de 90° (non dessinée : le moteur ne dessine que les macles accolées).",
      facies: [
        { nom: "Cube strié", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }], stries: { cyclique: true, pas: 0.07 },
          note: "Les faces portent des stries parallèles, perpendiculaires d'une face à l'autre : ce sont les marches d'un pentagonododécaèdre qui hésite avec le cube. Elles trahissent la symétrie réduite de la pyrite (classe m3̄) : les cubes de Navajún (Espagne) les montrent à la perfection." },
        { nom: "Pentagonododécaèdre", formes: [{ sym: "e", hkl: [2, 1, 0], nom: "pentagonododécaèdre", d: 1.0 }],
          note: "Douze faces pentagonales : une forme qui n'existe dans aucun autre minéral courant, d'où son nom anglais de « pyritoèdre »." },
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Plus rare ; fréquent dans les gisements chauds (Elbe)." },
        { nom: "Cube et pentagonododécaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "e", hkl: [2, 1, 0], nom: "pentagonododécaèdre", d: 1.05 }],
          note: "Les arêtes du cube sont biseautées, chaque biseau tourné à 90° de son voisin." },
      ],
      clivages: [],
    },

    // ─────────── Marcassite ───────────
    marcassite: {
      nom: "Marcassite", couleur: "#bfb47a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.4446, 5.4246, 3.3864, 90, 90, 90], mailleSource: "cod9013067", azimut: 26, elevation: 14,
      macleNote: "Macles sur {101}, répétées : cristaux en « crête de coq » et en « fer de lance ».",
      facies: [
        { nom: "Tablette",
          formes: [{ sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.32 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "l", hkl: [0, 1, 1], nom: "dôme", d: 0.95 }],
          note: "Tablettes aplaties selon b, au bord en biseau. Souvent groupées en crêtes ; dans la craie, la marcassite forme surtout des rognons à structure rayonnante." },
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
          note: "Longs prismes striés dans leur longueur, terminés en pointe par une pyramide : souvent courbés ou tordus, en gerbes. Indices dans les axes de la structure 3D (dans les ouvrages en Pbnm, le prisme est {110} et l'allongement [001])." },
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
          note: "Prismes courts, rouge orangé, striés selon c. Ils s'altèrent à la lumière : à garder dans le noir." },
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
          note: "Lamelles à six côtés, gris bleuté, prises dans le quartz : on la confond avec le graphite, mais son trait sur la porcelaine est verdâtre." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal, entre les feuillets S–Mo–S", pas: 0.2 }],
    },

    // ─────────── Tétraédrite ───────────
    tetraedrite: {
      nom: "Tétraédrite", couleur: "#6c6f73", systeme: "cubique", classe: "-43m", classeNom: "hexakistétraédrique", reseau: "I",
      maille: CUBIQUE(10.364), mailleSource: "cod9009469",
      facies: [
        { nom: "Tétraèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }],
          note: "Elle doit son nom à ces tétraèdres nets, gris d'acier, fréquents dans les géodes des filons." },
        { nom: "Tétraèdre et tristétraèdre",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }, { sym: "n", hkl: [2, 1, 1], nom: "tristétraèdre", d: 0.97 }],
          note: "Chaque face du tétraèdre est bordée de facettes {211} qui en adoucissent les arêtes." },
      ],
      clivages: [],
    },

    // ─────────── Bournonite ───────────
    bournonite: {
      nom: "Bournonite", couleur: "#5e6166", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [8.153, 8.692, 7.793, 90, 90, 90], mailleSource: "cod9008197", azimut: 24, elevation: 18,
      macleNote: "Macles répétées sur {110} : comme a ≈ b, les individus se croisent presque à angle droit et donnent les « roues dentées » (cogwheel) de Herodsfoot (Cornouailles) ou de Pribram.",
      facies: [
        { nom: "Tablette",
          formes: [
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.6 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.15 },
          ],
          note: "Tablettes épaisses à contour presque carré, biseautées aux coins. La vraie classe est mm2 (le haut et le bas diffèrent selon b), ce qui ne change pas ces faces." },
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
          note: "Prismes rouge rubis, transparents, terminés par un rhomboèdre ; ils noircissent à la lumière. La vraie classe est 3m (polaire : le haut et le bas du prisme diffèrent), simplifiée ici en 3̄m." },
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
          note: "Même forme que la proustite, en rouge sombre presque noir. Classe vraie 3m, simplifiée ici en 3̄m." },
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
  const FILON = "Pas de diagramme : ce qui décide ici, c'est la chimie de l'eau chaude (soufre dissous, oxydant ou réducteur, mélange avec une autre eau), qu'aucun diagramme de l'atlas ne représente.";
  const CEMENT = "Pas de diagramme : c'est la position de la nappe (oxydant au-dessus, réducteur au-dessous) qui décide, pas la température ni la pression.";

  Object.assign(MIN_F, {

    // ─────────── Chalcocite ───────────
    chalcocite: {
      sansForme: "Forme non dessinée : les cristaux de chalcocite sont rares (prismes pseudo-hexagonaux) ; elle se trouve presque toujours en masses gris de plomb.",
      forme: `Dans la chalcocite, les soufres sont empilés de façon presque compacte et les cuivres occupent des vides
        triangulaires entre eux. Sous 103 °C, ces cuivres sont rangés d'une façon si compliquée que la maille compte
        144 atomes ; au-dessus, ils bougent librement d'un vide à l'autre. Pas de clivage net, et un minéral qui se coupe
        au couteau : c'est un des minerais de cuivre les plus riches (80 % de cuivre).`,
      intro: `La chalcocite se forme surtout sous la zone oxydée des gisements de cuivre, où elle enrichit le minerai.`,
      scenarios: [
        { nom: "Sous la zone oxydée (enrichissement)",
          texte: `Près de la surface, l'eau de pluie oxyde la pyrite et la chalcopyrite et dissout leur cuivre. En descendant,
            elle atteint la nappe, où le milieu redevient réducteur : le cuivre y remplace le fer des sulfures restés intacts
            et précipite en chalcocite. Ces couches « cémentées », parfois plusieurs fois plus riches que le minerai d'origine,
            ont fait la fortune des grands porphyres cuprifères du Chili et de l'Arizona.`,
          cond: false, sansDiagramme: CEMENT },
      ],
    },

    // ─────────── Bornite ───────────
    bornite: {
      sansForme: "Forme non dessinée : les cristaux de bornite (pseudo-cubes) sont rares ; elle se trouve en masses dont la surface se ternit en violet, bleu et rouge.",
      forme: `Les soufres forment un réseau cubique à faces centrées ; cuivre et fer occupent une partie des vides
        tétraédriques, et la façon dont les vides restés libres s'ordonnent fait la symétrie. À haute température,
        tout est désordonné et la bornite est cubique ; en refroidissant, elle s'ordonne et devient orthorhombique,
        mais garde l'allure d'un cube. Ses couleurs irisées (« minerai paon ») viennent d'une pellicule d'altération.`,
      intro: `La bornite accompagne la chalcopyrite dans les gisements de cuivre, primaires ou enrichis.`,
      scenarios: [
        { nom: "Dans un porphyre cuprifère",
          texte: `Au cœur des porphyres cuprifères, les plus chauds, les fluides issus du granite déposent bornite et
            chalcopyrite vers 400–600 °C ; la bornite y marque les zones les plus riches en cuivre et les plus pauvres en
            soufre.`,
          cond: false, sansDiagramme: FILON, src: [SRC.sillitoe] },
        { nom: "Sous la zone oxydée",
          texte: `Comme la chalcocite, elle se forme aussi par enrichissement, quand le cuivre descendu de la zone oxydée
            remplace le fer de la chalcopyrite.`,
          cond: false, sansDiagramme: CEMENT },
      ],
    },

    // ─────────── Acanthite ───────────
    acanthite: {
      sansForme: "Forme non dessinée : ses cristaux sont presque toujours des cubes et des octaèdres hérités de l'argentite, cubique au-dessus de 173 °C, dans lesquels l'acanthite s'est réorganisée sans changer de forme (paramorphose) ; ils ne correspondent pas à sa maille actuelle.",
      forme: `Au-dessus de 173 °C, le sulfure d'argent est cubique (argentite) : ses argents se déplacent presque librement
        dans un réseau de soufres. En refroidissant, ils se fixent sur des sites précis et le réseau se déforme en
        monoclinique : c'est l'acanthite. Les cristaux cubiques gardent leur forme, mais sont devenus des mosaïques de
        petits domaines. Comme l'argent métal, elle est malléable et se coupe au couteau.`,
      intro: `L'acanthite est le principal minerai d'argent ; c'est aussi elle qui noircit l'argenterie.`,
      scenarios: [
        { nom: "Dans un filon argentifère",
          texte: `Elle se dépose dans les filons de basse à moyenne température, avec la galène, la proustite, la
            pyrargyrite et l'argent natif : Freiberg et l'Erzgebirge, Kongsberg, Guanajuato, Sainte-Marie-aux-Mines. Les
            cristaux déposés au-dessus de 173 °C ont poussé en argentite cubique.`,
          cond: false, sansDiagramme: FILON },
        { nom: "Sur l'argenterie",
          texte: `À l'air, l'argent réagit avec les traces de sulfure d'hydrogène (œufs, caoutchouc, pollution) et se couvre
            d'une pellicule noire d'acanthite de quelques dizaines de nanomètres.`,
          cond: false, sansDiagramme: "Pas de diagramme : réaction de surface à température ambiante." },
      ],
    },

    // ─────────── Pentlandite ───────────
    pentlandite: {
      sansForme: "Forme non dessinée : la pentlandite ne forme pas de cristaux libres ; elle se trouve en grains et en flammes dans la pyrrhotite.",
      forme: `Les soufres forment un réseau cubique à faces centrées ; les métaux, fer et nickel mêlés, sont groupés par huit
        en petits cubes de métal au centre des octants de la maille. Pas de clivage, mais une séparation nette selon {111}.
        Elle n'est presque jamais seule : elle naît en se séparant de la pyrrhotite au refroidissement.`,
      intro: `Principal minerai de nickel, la pentlandite naît d'un liquide sulfuré qui se sépare d'un magma basique.`,
      scenarios: [
        { nom: "Dans un magma basique riche en soufre",
          texte: `Quand un magma basaltique ou ultrabasique se charge en soufre (en assimilant des roches qui en contiennent),
            une partie du soufre se sépare en gouttes d'un liquide sulfuré, lourd, qui capte le nickel, le cuivre et le
            platine et tombe au fond de la chambre. Ce liquide cristallise vers 1 000 °C en une solution solide riche en fer ;
            la pentlandite n'en sort qu'en refroidissant, sous ≈ 600 °C, en grains puis en flammes dans la pyrrhotite.
            Norilsk (Sibérie) et Sudbury (Canada, dans un cratère d'impact de 1,85 milliard d'années) sont les grands
            exemples.`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(1250, 0.3, 1, "Un magma basaltique se charge en soufre en traversant des roches qui en contiennent : des gouttes de liquide sulfuré se séparent et tombent au fond de la chambre, en captant le nickel."),
            pt(1000, 0.3, 2, "Le liquide sulfuré cristallise en une solution solide de fer, de nickel et de soufre.", { bande: "cristallisation" }),
            pt(500, 0.3, 3, "Sous ≈ 600 °C, la pentlandite se sépare de cette solution solide, en grains et en flammes dans la pyrrhotite."),
          ], note: "Le domaine fondu est celui des silicates ; le liquide sulfuré, lui, reste liquide jusque vers 1 000 °C. Chemin schématique." },
          src: ["hirschmann", SRC.naldrett] },
      ],
    },

    // ─────────── Galène ───────────
    galene: {
      forme: `La galène a la structure du sel de cuisine : chaque plomb au centre d'un octaèdre de six soufres, et inversement.
        Les plans {100} portent autant de plombs que de soufres : ils sont neutres et se séparent sans effort. D'où le
        <b>clivage cubique</b> parfait — un coup de marteau la débite en petits cubes brillants — et les cristaux en cubes.`,
      intro: `La galène est le minerai du plomb, et souvent de l'argent qu'elle contient.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Des eaux chaudes et salées, qui ont lessivé le plomb des roches profondes, remontent par les failles ; en se
            refroidissant ou en rencontrant une eau riche en soufre, elles déposent galène, blende, quartz et barytine. C'est
            le cas de Pontpéan (Ille-et-Vilaine), qui a fourni plomb et argent du XVIII<sup>e</sup> siècle à 1904, et des
            filons de Melle (Deux-Sèvres), où l'on frappait monnaie à l'époque carolingienne.`,
          cond: false, sansDiagramme: FILON },
        { nom: "Dans les calcaires (type Mississippi Valley)",
          texte: `Des saumures chauffées à 75–200 °C au fond des bassins sédimentaires migrent vers leurs bords et rencontrent
            des calcaires et des dolomies riches en soufre réduit : galène et blende précipitent dans les cavités et les
            brèches. Ce sont les gisements des Causses : Les Malines (Gard), Largentière (Ardèche), Saint-Laurent-le-Minier.`,
          cond: false, sansDiagramme: "Pas de diagramme : ce qui décide, c'est la rencontre d'une saumure chargée de métaux et d'un calcaire riche en soufre.",
          src: [SRC.leach] },
      ],
    },

    // ─────────── Blende ───────────
    blende: {
      forme: `Chaque zinc est au centre d'un tétraèdre de quatre soufres, et inversement : c'est la structure du diamant, un
        atome sur deux remplacé. Sans centre de symétrie, le cristal ne développe pas de la même façon les deux moitiés de
        l'octaèdre : d'où les tétraèdres. Les plans {110}, où zinc et soufre alternent, sont neutres : clivage parfait selon
        six directions. Le fer remplace une partie du zinc et la fonce du miel au noir.`,
      intro: `La blende est le minerai du zinc ; elle accompagne presque toujours la galène.`,
      scenarios: [
        { nom: "Dans un filon ou un calcaire",
          texte: `Mêmes gisements que la galène : filons hydrothermaux et calcaires imprégnés par des saumures chaudes. Saint-Salvy
            (Tarn), filon de blende exploité jusqu'en 1993, fut la dernière grande mine de zinc de France ; elle y
            contenait du germanium.`,
          cond: false, sansDiagramme: FILON, src: [SRC.leach] },
        { nom: "Au fond de la mer (amas sulfurés)",
          texte: `Autour des fumeurs noirs des dorsales, l'eau de mer chauffée à 350 °C ressort chargée de métaux ; au contact
            de l'eau froide, elle dépose blende, pyrite et chalcopyrite en cheminées, qui s'effondrent en amas. Les amas
            anciens, conservés dans les chaînes de montagnes, sont des minerais de zinc et de cuivre.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est le mélange brutal d'une eau à 350 °C avec l'eau de mer à 2 °C qui fait précipiter les sulfures." },
      ],
    },

    // ─────────── Chalcopyrite ───────────
    chalcopyrite: {
      forme: `La chalcopyrite a la structure de la blende, cuivre et fer remplaçant le zinc en alternance : la maille
        devient deux fois plus haute que large, quadratique, mais garde presque les angles du cube. Ses cristaux sont donc
        de faux tétraèdres (sphénoïdes). Pas de clivage ; plus tendre que la pyrite (3,5 contre 6), plus jaune, elle se
        raye au couteau.`,
      intro: `La chalcopyrite est le minerai de cuivre le plus répandu du monde.`,
      scenarios: [
        { nom: "Dans un porphyre cuprifère",
          texte: `Un granite se met en place à quelques kilomètres de profondeur ; en cristallisant, il libère une eau salée
            chargée de cuivre qui fracture la roche autour de lui. Entre 300 et 500 °C, la chalcopyrite se dépose dans ces
            innombrables fissures avec la pyrite et la molybdénite : un gisement de plusieurs milliards de tonnes à 0,5 %
            de cuivre (Chuquicamata, Escondida au Chili).`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(900, 0.25, 1, "Un magma granitique riche en eau monte et s'arrête vers 5–10 km."),
            pt(700, 0.12, 2, "En cristallisant, il sature en eau : une eau salée riche en cuivre se sépare et fracture la roche autour.", { bande: "cristallisation" }),
            pt(400, 0.05, 3, "Entre 500 et 300 °C, la chalcopyrite se dépose dans les fissures, avec la pyrite et la molybdénite."),
          ], note: "Chemin schématique." },
          src: ["hirschmann", SRC.sillitoe] },
        { nom: "Dans un filon ou un amas sulfuré",
          texte: `Elle accompagne aussi la galène et la blende dans les filons, et les amas sulfurés nés au fond de la mer.
            Dans le Rhône, les mines de Chessy (cuivre) et de Saint-Bel (pyrite cuivreuse) en ont livré.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Pyrrhotite ───────────
    pyrrhotite: {
      sansForme: "Forme non dessinée : les cristaux de pyrrhotite (tablettes hexagonales) sont rares ; elle se trouve en masses bronze.",
      forme: `La pyrrhotite a la structure de la nickéline — fers dans des octaèdres de soufres empilés en colonnes — mais il
        lui manque des fers : jusqu'à un sur huit (Fe₇S₈). Ces vides s'ordonnent, et leur arrangement rend la pyrrhotite
        magnétique : c'est, après la magnétite, le minéral qui attire le plus l'aimant.`,
      intro: `La pyrrhotite se forme dans les magmas basiques et dans les roches métamorphiques riches en soufre.`,
      scenarios: [
        { nom: "Dans un magma basique",
          texte: `C'est le principal produit du liquide sulfuré qui se sépare des magmas basiques (voir la pentlandite) : à
            Sudbury et à Norilsk, elle forme la masse des minerais de nickel.`,
          cond: false, sansDiagramme: "Pas de diagramme : voir la fiche de la pentlandite, qui en dérive." },
        { nom: "Dans une roche métamorphique",
          texte: `En chauffant, la pyrite des schistes noirs perd une partie de son soufre au-delà de ≈ 500 °C et devient
            pyrrhotite : les schistes et les gneiss du métamorphisme moyen à fort en contiennent souvent.`,
          cond: { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Une boue noire, riche en matière organique et en pyrite, se dépose au fond de la mer."),
            pt(500, 0.6, 2, "Enfouie dans une collision, elle chauffe : au-delà de ≈ 500 °C, la pyrite perd du soufre et devient pyrrhotite.", { bande: "pyrite → pyrrhotite" }),
            pt(15, 0, 3, "L'érosion ramène la roche en surface."),
          ], note: "Chemin schématique. La température de la transformation dépend de la pression et des fluides : ordre de grandeur." },
          src: ["pattison"] },
      ],
    },

    // ─────────── Cinabre ───────────
    cinabre: {
      forme: `Le cinabre est fait de chaînes hélicoïdales –Hg–S–Hg–S–, trois mercures par tour, qui tournent autour de
        l'axe c : visibles sur la structure 3D. Les chaînes sont fortement liées, mais entre elles les liaisons sont faibles :
        d'où le clivage prismatique parfait, parallèle aux chaînes. Comme le quartz, il existe en cristaux droits et
        gauches.`,
      intro: `Le cinabre est le minerai du mercure ; il se dépose près de la surface, à basse température.`,
      scenarios: [
        { nom: "Près d'une source chaude",
          texte: `Le mercure est très volatil : il quitte facilement les roches chauffées en profondeur et remonte avec l'eau et
            la vapeur. Près de la surface, vers 100–200 °C, il précipite avec le soufre en cinabre, imprégnant grès,
            quartzites et calcaires. Almadén (Espagne), le plus grand gisement du monde, a fourni environ un tiers de tout
            le mercure extrait par l'homme ; Idrija (Slovénie) et le Monte Amiata (Toscane) suivent.`,
          cond: false, sansDiagramme: FILON, src: [SRC.rytuba] },
      ],
    },

    // ─────────── Covellite ───────────
    covellite: {
      forme: `La covellite est faite de feuillets : couches de cuivres en triangles, couches de tétraèdres CuS₄, et entre deux,
        des paires de soufre. Le clivage basal parfait passe entre ces couches ; les lamelles détachées sont souples. Son bleu
        indigo, rare chez les sulfures, vient de ces paires de soufre.`,
      intro: `La covellite naît surtout de l'altération des autres sulfures de cuivre.`,
      scenarios: [
        { nom: "Sous la zone oxydée",
          texte: `Avec la chalcocite, elle se forme sous la zone oxydée des gisements de cuivre, en placages bleus sur la
            chalcopyrite et la bornite qu'elle remplace.`,
          cond: false, sansDiagramme: CEMENT },
        { nom: "Autour des fumerolles",
          texte: `Plus rarement, elle se dépose directement autour des fumerolles volcaniques : le Vésuve, où elle a été
            décrite en 1832 et nommée d'après le minéralogiste napolitain Niccolò Covelli.`,
          cond: false, sansDiagramme: "Pas de diagramme : dépôt à la sortie des gaz, à pression atmosphérique." },
      ],
    },

    // ─────────── Nickéline ───────────
    nickeline: {
      sansForme: "Forme non dessinée : les cristaux de nickéline sont exceptionnels ; elle se trouve en masses rose cuivré.",
      forme: `La nickéline est le modèle de toute une famille de structures : arsenics empilés de façon compacte, nickels dans
        les vides octaédriques, octaèdres qui partagent leurs faces le long de l'axe c. Deux nickels voisins ne sont qu'à
        2,5 Å : la liaison est en partie métallique, d'où l'éclat et la couleur rose cuivré. Les mineurs saxons l'appelaient
        « Kupfernickel », le faux cuivre du diable, parce qu'on n'en tirait pas de cuivre : c'est d'elle que vient le nom du
        nickel.`,
      intro: `La nickéline se dépose dans les filons « à cinq éléments » (Ag, Co, Ni, As, Bi).`,
      scenarios: [
        { nom: "Dans un filon à cobalt, nickel et argent",
          texte: `Avec les arséniures de cobalt, l'argent natif et la calcite, dans les filons de basse température de
            l'Erzgebirge, de Cobalt (Ontario) ou de Sainte-Marie-aux-Mines. Elle s'altère en annabergite, une croûte vert
            pomme.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Pyrite ───────────
    pyrite: {
      forme: `La pyrite a la structure du sel de cuisine avec, à la place du chlore, des paires de soufre (S₂) couchées le
        long des diagonales du cube. Ces paires, orientées de quatre façons différentes, abaissent la symétrie : la pyrite
        garde les axes d'ordre 3 du cube, mais perd ses axes d'ordre 4. D'où le pentagonododécaèdre, forme impossible dans
        un cube parfait, et les stries perpendiculaires d'une face à l'autre. Liaisons fortes dans toutes les directions :
        pas de clivage, et une dureté de 6 qui la distingue de l'or.`,
      intro: `La pyrite se forme presque partout où il y a du fer et du soufre réduit : vases sans oxygène, filons, roches
        métamorphiques.`,
      scenarios: [
        { nom: "Dans une vase sans oxygène",
          texte: `Au fond d'une mer ou d'un lac où l'oxygène manque, des bactéries tirent leur énergie des sulfates de l'eau et
            rejettent du sulfure d'hydrogène. Celui-ci réagit avec le fer des argiles : sulfures de fer noirs d'abord, puis
            pyrite, en grains microscopiques souvent groupés en framboises, en quelques années à quelques siècles. Les marnes,
            les schistes noirs et les charbons en sont pleins ; ce soufre fait les pluies acides quand on brûle le charbon.`,
          cond: false, sansDiagramme: "Pas de diagramme : ce sont les bactéries, la matière organique et le fer disponible qui décident, pas la température.",
          src: [SRC.berner] },
        { nom: "Dans un filon",
          texte: `C'est aussi le sulfure le plus commun des filons : elle cristallise avec presque tous les autres, dans une
            large gamme de températures. Les cubes de Navajún (La Rioja, Espagne), poussés dans une marne, sont célèbres.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Marcassite ───────────
    marcassite: {
      forme: `Même formule que la pyrite (FeS₂), autre arrangement : les octaèdres de soufres autour des fers partagent des
        arêtes en colonnes, et la maille est orthorhombique. La marcassite est moins stable que la pyrite et ne se forme qu'à
        basse température, dans une eau acide. Elle s'altère facilement à l'air humide : les échantillons se couvrent d'une
        poudre blanche de sulfate et tombent en miettes.`,
      intro: `La marcassite naît à basse température, en milieu acide : rognons des craies, filons froids.`,
      scenarios: [
        { nom: "En rognons dans la craie",
          texte: `Dans la craie et les marnes, l'eau qui circule entre les grains, appauvrie en oxygène, dépose la marcassite en
            rognons à fibres rayonnantes, recouverts d'une écorce rouillée : les « pierres de tonnerre » des falaises du Cap
            Blanc-Nez et du Boulonnais, que l'on prenait pour des météorites. Un pH acide (sous ≈ 5) favorise la marcassite ;
            au-dessus, c'est la pyrite qui se forme.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est l'acidité de l'eau, et non la température, qui choisit entre pyrite et marcassite ; l'atlas n'a pas de diagramme du soufre.",
          src: [SRC.rickard] },
      ],
    },

    // ─────────── Arsénopyrite ───────────
    arsenopyrite: {
      sansForme: "Forme non dessinée : ses prismes en losange, striés, sont décrits dans une maille pseudo-orthorhombique différente de celle de la structure 3D ; la conversion des indices n'a pas pu être vérifiée.",
      forme: `L'arsénopyrite a la structure de la marcassite où chaque paire de soufres devient une paire arsenic–soufre ; les
        fers se rapprochent deux à deux, ce qui fait basculer la maille en monoclinique, mais si peu que les cristaux
        semblent orthorhombiques. Frappée, elle dégage une odeur d'ail (l'arsenic).`,
      intro: `L'arsénopyrite est le minerai d'arsenic le plus commun ; elle accompagne souvent l'or.`,
      scenarios: [
        { nom: "Dans un filon de quartz aurifère",
          texte: `Dans les filons de quartz des chaînes de montagnes, une eau chaude chargée de soufre et d'arsenic dépose
            l'arsénopyrite avec le quartz, souvent avec de l'or invisible à l'œil, piégé dans son réseau. À Salsigne (Aude),
            dernière grande mine d'or de France, l'or était surtout dans l'arsénopyrite, et les déchets arséniés posent
            encore problème. À La Roche-Balue (Loire-Atlantique), elle forme des cristaux de composition exacte.`,
          cond: { type: "silice", tmax: 350, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 350, C: 948, n: 1, t: "Vers 350 °C, en profondeur, l'eau porte silice, arsenic et soufre." },
              { T: 280, C: 948, n: 2, t: "Elle remonte par une faille et se refroidit : elle devient sursaturée." },
              { T: 250, C: 434, n: 3, t: "Le quartz du filon cristallise ; l'arsénopyrite se dépose avec lui, et l'or avec elle." },
            ],
            note: "Le diagramme montre la silice, qui forme le quartz du filon. Chemin schématique." },
          src: ["rimstidt", "fournier"] },
      ],
    },

    // ─────────── Stibine ───────────
    stibine: {
      forme: `La stibine est faite de rubans d'antimoine et de soufre allongés selon b, que l'on voit sur la structure 3D ; entre
        les rubans, seulement des liaisons faibles. Les cristaux poussent vite le long des rubans : d'où les longs prismes
        striés, souvent courbés ou tordus, et un clivage parfait parallèle aux rubans. Elle fond à la flamme d'une bougie
        (550 °C).`,
      intro: `La stibine, minerai de l'antimoine, se dépose dans les filons de quartz de basse température.`,
      scenarios: [
        { nom: "Dans un filon de quartz froid",
          texte: `Vers 150–250 °C, des eaux chaudes déposent dans les failles du quartz et de la stibine, parfois avec un peu
            d'or. Le Massif central en est riche : vers 1900, la France était le premier producteur mondial d'antimoine
            (Brioude-Massiac en Haute-Loire et Cantal, La Lucette en Mayenne, Vendée).`,
          cond: { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 280, C: 560, n: 1, t: "En profondeur, vers 250–300 °C, l'eau porte silice et antimoine." },
              { T: 200, C: 560, n: 2, t: "Elle remonte et se refroidit : elle devient sursaturée." },
              { T: 150, C: 137, n: 3, t: "Le quartz du filon cristallise, puis la stibine, en gerbes de prismes dans les vides." },
            ],
            note: "Le diagramme montre la silice, qui forme le quartz du filon. Chemin schématique." },
          src: ["rimstidt", "fournier", SRC.munoz] },
      ],
    },

    // ─────────── Orpiment ───────────
    orpiment: {
      sansForme: "Forme non dessinée : les cristaux d'orpiment sont rares et mal formés ; il se trouve en masses feuilletées, jaune d'or.",
      forme: `L'orpiment est fait de feuillets plissés de pyramides AsS₃ ; entre les feuillets, rien que des forces de van der
        Waals. D'où un clivage parfait, des lamelles souples comme du mica et une dureté de 1,5. Son nom vient du latin
        <i>auripigmentum</i>, « pigment d'or » : il a servi de jaune aux peintres, malgré sa toxicité.`,
      intro: `L'orpiment se dépose à très basse température, près de la surface, souvent avec le réalgar.`,
      scenarios: [
        { nom: "Près d'une source chaude ou d'une fumerolle",
          texte: `L'arsenic, volatil, remonte avec les eaux chaudes et les gaz volcaniques ; sous ≈ 150 °C, il précipite avec le
            soufre en orpiment et en réalgar. Il se forme aussi en altérant le réalgar exposé à la lumière.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Réalgar ───────────
    realgar: {
      forme: `Le réalgar est un cristal de <b>molécules</b> As₄S₄ en forme de cage, visibles sur la structure 3D. Les molécules
        ne se tiennent que par de faibles forces : le réalgar est tendre (1,5 à 2) et fond à 320 °C. La lumière casse les
        cages et les réarrange : le réalgar devient en quelques mois une poudre jaune orangé (pararéalgar).`,
      intro: `Le réalgar se dépose à basse température, dans les filons et autour des sources chaudes.`,
      scenarios: [
        { nom: "Dans un filon froid ou près d'une source chaude",
          texte: `Avec l'orpiment, la stibine et le cinabre, dans les filons de très basse température et les dépôts de sources
            chaudes. La mine de Matra, en Corse, en a livré de beaux cristaux.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Molybdénite ───────────
    molybdenite: {
      forme: `La molybdénite est faite de feuillets S–Mo–S, chaque molybdène au centre d'un prisme triangulaire de six soufres ;
        entre les feuillets, seulement des forces de van der Waals. D'où le clivage basal parfait, le toucher gras et
        l'usage comme lubrifiant, comme le graphite qu'elle imite. Le rhénium, l'un des éléments les plus rares, se cache dans
        son réseau.`,
      intro: `La molybdénite se dépose à partir des fluides qui s'échappent des granites.`,
      scenarios: [
        { nom: "Autour d'un granite qui cristallise",
          texte: `En fin de cristallisation, un granite riche en eau libère des fluides chargés de molybdène, qui fracturent sa
            coupole et la roche autour ; entre ≈ 600 et 350 °C, la molybdénite se dépose en lamelles dans des veines de quartz
            (Climax, Colorado), dans les greisens et les pegmatites.`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(850, 0.2, 1, "Un magma granitique riche en eau monte et s'arrête vers 5–8 km."),
            pt(700, 0.15, 2, "En cristallisant, il sature en eau : des fluides chargés de molybdène s'en séparent et fracturent sa coupole.", { bande: "cristallisation" }),
            pt(450, 0.08, 3, "Entre ≈ 600 et 350 °C, la molybdénite se dépose dans les veines de quartz."),
          ], note: "Chemin schématique." },
          src: ["hirschmann", SRC.sillitoe] },
      ],
    },

    // ─────────── Tétraédrite ───────────
    tetraedrite: {
      forme: `La tétraédrite a une charpente de type blende, ouverte : cuivres en tétraèdres et en triangles, antimoines en
        pyramides. Comme la blende, elle n'a pas de centre de symétrie : ses cristaux sont des tétraèdres, qui lui ont donné
        son nom. Fer, zinc, argent et mercure remplacent une partie du cuivre ; riche en argent, elle a été un minerai
        d'argent important (« cuivre gris » des mineurs).`,
      intro: `La tétraédrite est le sulfosel le plus répandu ; elle se dépose dans les filons de moyenne température.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Avec la galène, la blende, la chalcopyrite et le quartz, dans les filons de 200–400 °C : Banca (Pays basque),
            les Alpes (Saint-Véran), Freiberg, les Andes. Quand l'arsenic remplace l'antimoine, c'est la tennantite.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Bournonite ───────────
    bournonite: {
      forme: `La bournonite associe pyramides SbS₃, cuivres en tétraèdres et plombs entourés de sept ou huit soufres. Sa maille
        est presque carrée (a ≈ b) : un cristal peut donc se tourner de 90° en restant presque accordé au précédent. Répétée,
        cette macle donne des cristaux en roue dentée, son signe distinctif. Elle porte le nom du comte de Bournon,
        minéralogiste français émigré à Londres.`,
      intro: `La bournonite se dépose dans les filons à plomb, cuivre et antimoine.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Avec la galène, la tétraédrite et la stibine, dans les filons de moyenne température. Les roues dentées de
            Herodsfoot (Cornouailles), de Pribram (Bohême) et de Neudorf (Harz) sont célèbres.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Boulangérite ───────────
    boulangerite: {
      sansForme: "Forme non dessinée : la boulangérite forme des fibres et des « cheveux » emmêlés, sans faces mesurables.",
      forme: `La boulangérite est faite de rubans de plomb, d'antimoine et de soufre allongés selon c ; plusieurs sites sont
        partagés entre plomb et antimoine. Les cristaux poussent presque seulement le long des rubans : d'où les fibres, fines
        comme des cheveux, qui feutrent les géodes de quartz. Elle porte le nom de Charles Boulanger, ingénieur des mines
        français.`,
      intro: `La boulangérite se dépose dans les filons à plomb, zinc et antimoine.`,
      scenarios: [
        { nom: "Dans un filon à plomb et antimoine",
          texte: `Avec la galène, la blende et la stibine. Molières-sur-Cèze (Gard), où elle a été décrite en 1837, en est la
            localité type.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Proustite ───────────
    proustite: {
      forme: `La proustite est faite de pyramides AsS₃, toutes tournées dans le même sens le long de c, reliées par des argents :
        le cristal est polaire, ses deux bouts diffèrent. Transparente et rouge rubis, elle noircit à la lumière quand
        l'argent se réduit en surface. Elle porte le nom du chimiste français Joseph-Louis Proust.`,
      intro: `La proustite, l'un des deux « argents rouges », se dépose dans les filons argentifères de basse température.`,
      scenarios: [
        { nom: "Dans un filon argentifère",
          texte: `Dans les filons riches en argent et en arsenic, à basse température, souvent dans les géodes : Chañarcillo
            (Chili), Freiberg, Sainte-Marie-aux-Mines.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Pyrargyrite ───────────
    pyrargyrite: {
      forme: `Même structure que la proustite, l'antimoine à la place de l'arsenic. L'antimoine, plus lourd, assombrit la couleur
        jusqu'au rouge presque noir ; son nom grec veut dire « argent de feu », pour les reflets rouges en lumière rasante.`,
      intro: `La pyrargyrite est l'« argent rouge » le plus commun, dans les filons argentifères.`,
      scenarios: [
        { nom: "Dans un filon argentifère",
          texte: `Avec la galène, l'acanthite et la tétraédrite, dans les filons de basse température : Sankt Andreasberg (Harz),
            Guanajuato (Mexique), et les filons argentifères des Vosges.`,
          cond: false, sansDiagramme: FILON },
      ],
    },
  });
})();
