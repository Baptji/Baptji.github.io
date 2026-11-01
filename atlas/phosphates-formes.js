// ============================================================
// CLASSE VIII — phosphates, arséniates et vanadates : formes cristallines (cristal.js) et modes de formation (MIN_F)
// chantier F.4, 01/10/2026. Chargé après sulfates-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js).
// Vivianite : CIF en I2/m (a 10,02 · c 4,72 · β 102,8°), ouvrages en C2/m : a(I) = a(C) + c(C) ; {010}, {110} inchangés,
// {-101} des ouvrages = {001} ici. Autunite : maille orthorhombique pseudo-quadratique (a ≈ 2c), feuillets ⊥ b.
// Non dessinés : amblygonite, turquoise, wavellite (masses, sphérules radiées).
// ============================================================

(function () {
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  const apatitique = (nom, couleur, a, c, cod, formes, note) => ({
    nom, couleur, systeme: "hexagonal", classe: "6/m", classeNom: "dipyramidale hexagonale", reseau: "P",
    maille: HEX(a, c), mailleSource: cod, azimut: 20, elevation: 14,
    facies: [{ nom: formes.nom, formes: formes.f, note }],
    clivages: [],
  });

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ─────────── Variscite et strengite (F.12, 16/10/2026) : axes du CIF (Pbca) ; ouvrages en Pcab ───────────
    variscite: {
      nom: "Variscite", couleur: "#7cc29a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [9.822, 8.561, 9.63, 90, 90, 90], mailleSource: "cod9007618", azimut: 22, elevation: 14,
      facies: [
        { nom: "Dipyramide pseudo-octaédrique", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "dipyramide", d: 1.0 }],
          note: "Les cristaux de variscite, rares, ne dépassent pas 1,5 mm et ressemblent à des octaèdres ; elle se présente presque toujours en nodules, en croûtes et en veinules vertes." },
      ],
      clivages: [{ hkl: [0, 0, 1], qualite: "bon", nom: "{001}", pas: 0.24 }],
    },
    strengite: {
      nom: "Strengite", couleur: "#b07ab8", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [8.722, 9.878, 10.1187, 90, 90, 90], mailleSource: "cod9010007", azimut: 22, elevation: 14,
      facies: [
        { nom: "Dipyramide", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "dipyramide", d: 1.0 }],
          note: "La matière se présente le plus souvent en boules à fibres rayonnantes et en croûtes violettes ; les cristaux, dominés par la dipyramide {111}, peuvent atteindre 5 cm." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "bon", nom: "{010}", pas: 0.24 }],
    },

    apatite: apatitique("Apatite", "#7fa9a0", 9.3973, 6.8782, "cod9001232",
      { nom: "Prisme et pyramide", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.5 },
        { sym: "x", hkl: [1, 0, -1, 1], nom: "bipyramide", d: 1.25 },
      ] },
      "Des prismes hexagonaux, terminés par une pyramide et tronqués à la base. Dans la classe 6/m, aucun plan de symétrie ne passe par l'axe vertical : sur les cristaux les plus riches en faces, certaines facettes n'apparaissent que six fois au lieu de douze, obliquement, ce qui révèle cette symétrie réduite."),

    pyromorphite: apatitique("Pyromorphite", "#7ba33d", 9.986, 7.3378, "cod9016947",
      { nom: "Prisme en tonnelet", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.5 },
      ] },
      "Les Farges (Ussel, Corrèze) ont fourni les plus beaux spécimens du monde : ce sont des prismes hexagonaux vert vif, bombés en tonnelet et creux au cœur."),

    mimetite: apatitique("Mimétite", "#e3a33a", 10.2382, 7.4502, "cod9016951",
      { nom: "Prisme et pyramide", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "x", hkl: [1, 0, -1, 1], nom: "bipyramide", d: 1.25 },
      ] },
      "Les prismes jaune orangé se terminent souvent en pyramide ; la variété en boules courbées porte le nom de campylite."),

    vanadinite: apatitique("Vanadinite", "#c4381f", 10.3231, 7.3399, "cod9016949",
      { nom: "Prisme court", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.9 },
      ] },
      "De courts prismes rouge vif, à sommet plat : la vanadinite de Mibladen (Maroc) en fournit l'image la plus connue."),

    // ─────────── Monazite ───────────
    monazite: {
      nom: "Monazite", couleur: "#b5683a", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [6.7902, 7.0203, 6.4674, 90, 103.38, 90], mailleSource: "cod9001646", azimut: 26, elevation: 16,
      facies: [
        { nom: "Tablette", formes: [
          { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.6 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
          { sym: "e", hkl: [0, 1, 1], nom: "prisme", d: 1.05 },
        ], note: "De petites tablettes brun-rouge, aplaties selon a, en biseau : dans les granites, elles mesurent quelques dixièmes de millimètre ; dans les pegmatites, elles atteignent plusieurs centimètres." },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "net", nom: "{100}", pas: 0.24 }],
    },

    // ─────────── Xénotime ───────────
    xenotime: {
      nom: "Xénotime", couleur: "#c99a5a", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I",
      maille: [6.8947, 6.8947, 6.0276, 90, 90, 90], mailleSource: "cod9001654", azimut: 22, elevation: 14,
      facies: [
        { nom: "Prisme et bipyramide", formes: [
          { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 },
          { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.3 },
        ], note: "Ces prismes courts se terminent en pointe ; ils partagent la structure du zircon, et les deux minéraux croissent parfois l'un sur l'autre, sans discontinuité." },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.24 }],
    },

    // ─────────── Vivianite ───────────
    vivianite: {
      nom: "Vivianite", couleur: "#2f5f6a", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "I",
      maille: [10.021, 13.441, 4.721, 90, 102.84, 90], mailleSource: "cod9012898", azimut: 22, elevation: 14,
      facies: [
        { nom: "Lame prismatique", formes: [
          { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.45 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
          { sym: "t", hkl: [0, 0, 1], nom: "pinacoïde", d: 2.0 },
        ], note: "Lames allongées selon c, aplaties selon b. Sorties de terre incolores, elles virent au bleu puis au noir en quelques jours à l'air, à mesure que le fer s'oxyde. Pour cette maille C2/m, les {001} correspondent aux {-101} rencontrés dans les ouvrages." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.2 }],
    },

    // ─────────── Érythrite ───────────
    erythrite: {
      nom: "Érythrite", couleur: "#c4447a", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C",
      maille: [10.251, 13.447, 4.764, 90, 104.98, 90], mailleSource: "cod9005271", azimut: 22, elevation: 14,
      facies: [
        { nom: "Aiguille aplatie", formes: [
          { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.4 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
          { sym: "t", hkl: [-1, 0, 1], nom: "pinacoïde", d: 2.4 },
        ], note: "En gerbes d'aiguilles et de lames rose framboise, ce minéral reprend la structure et la forme de la vivianite, en y associant du cobalt et de l'arsenic." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.2 }],
    },

    // ─────────── Autunite ───────────
    autunite: {
      nom: "Autunite", couleur: "#d9df4a", systeme: "orthorhombique (pseudo-quadratique)", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [14.0135, 20.7121, 6.9959, 90, 90, 90], mailleSource: "cod9002888", azimut: 22, elevation: 24,
      facies: [
        { nom: "Plaque carrée", formes: [
          { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.18 },
          { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
          { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.0 },
        ], note: "De minces plaques carrées jaune citron brillent en vert sous ultraviolets. Bien que la maille soit orthorhombique, elle est presque quadratique (a ≈ 2 c) : les feuillets uranyle-phosphate sont perpendiculaires à b." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "parallèle aux feuillets", pas: 0.15 }],
    },

    // ─────────── Torbernite ───────────
    torbernite: {
      nom: "Torbernite", couleur: "#3f9b4c", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [7.0267, 7.0267, 20.807, 90, 90, 90], mailleSource: "cod9004737", azimut: 22, elevation: 24,
      facies: [
        { nom: "Plaque carrée", formes: [
          { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.2 },
          { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 },
        ], note: "Empilées comme des cartes, des plaques carrées vert émeraude ne fluorescent pas sous ultraviolets : le cuivre éteint la fluorescence de l'uranyle." },
      ],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "basal, parallèle aux feuillets", pas: 0.15 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const q = (o, n, t, x) => Object.assign({}, o, n ? { n } : {}, t ? { t } : {}, x || {});
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    montel: "Montel J.-M. (1993). « A model for monazite/melt equilibrium and application to the generation of granitic magmas ». <i>Chemical Geology</i> 110, p. 127–146.",
    rothe: "Rothe M. et al. (2016). « The occurrence, identification and environmental relevance of vivianite in waterlogged soils and aquatic sediments ». <i>Earth-Science Reviews</i> 158, p. 51–64.",
    finch: "Finch R. et Murakami T. (1999). « Systematics and paragenesis of uranium minerals ». <i>Reviews in Mineralogy</i> 38, p. 91–179.",
  };
  const OXYD = "Aucun diagramme n'est proposé : l'oxydation proche de la surface et la chimie de l'eau de pluie en décident.";
  const PEG = "L'atlas n'offre pas de diagramme ici : la pegmatite se forme à partir d'un liquide saturé d'eau et d'éléments rares, cas qu'une représentation du granite ne saurait traduire.";

  Object.assign(MIN_F, {

    // ─────────── Variscite (F.12, 16/10/2026) ───────────
    variscite: {
      forme: `Chaque aluminium occupe le centre d'un octaèdre dont les sommets sont quatre oxygènes issus de phosphates distincts, complétés par deux molécules d'eau.
        Ces octaèdres et les tétraèdres PO₄ forment ensemble une charpente tridimensionnelle, que les deux molécules d'eau consolident par des liaisons hydrogène. Pas de feuillets : le clivage n'est que bon, et les cristaux, trapus, imitent l'octaèdre.`,
      intro: `La variscite se dépose à partir d'une eau chargée de phosphate qui traverse une roche riche en aluminium.`,
      scenarios: [
        { nom: "Dans une roche alumineuse traversée par du phosphate",
          texte: `Le phosphate issu d'un guano, de l'apatite ou d'os passe en solution dans l'eau de pluie, qui le conduit vers des roches alumineuses (schistes, argiles, roches volcaniques altérées). Là, en milieu acide, il précipite en variscite : nodules et veinules vertes, à Palazuelo de las Arribas (Espagne), dans l'Utah ou dans les grottes à guano.`,
          cond: false, sansDiagramme: OXYD },
        { nom: "Dans un sol acide (repère des phosphates)",
          texte: `Lorsque les sols deviennent acides, l'aluminium se dissout en abondance. Pour prévoir le pH auquel l'engrais phosphaté s'associe davantage à l'aluminium qu'au calcium (Lindsay et Moreno 1960), on consulte le diagramme de solubilité de la variscite. Dans la pratique, ce minéral reste rarement identifié : le phosphate se fixe surtout en surface des oxydes.`,
          cond: false, sansDiagramme: "Aucun diagramme ne représente ce cas : la solubilité des phosphates n'est pas tracée dans l'atlas.",
          src: ["Lindsay W. L. et Moreno E. C. (1960). « Phosphate phase equilibria in soils ». <i>Soil Science Society of America Proceedings</i> 24, p. 177–182."] },
      ],
    },

    // ─────────── Strengite (F.12, 16/10/2026) ───────────
    strengite: {
      forme: `Il suffit de substituer le fer ferrique à l'aluminium de la variscite pour obtenir la strengite : une charpente d'octaèdres FeO₄(H₂O)₂ et de tétraèdres PO₄. Entre ces deux pôles, toutes les proportions intermédiaires sont possibles. La phosphosidérite, de formule identique mais de symétrie monoclinique, se forme dans les mêmes environnements.`,
      intro: `La strengite se forme lorsque des phosphates de fer s'oxydent et s'hydratent, dans les pegmatites et les chapeaux de fer.`,
      scenarios: [
        { nom: "Dans une pegmatite à phosphates",
          texte: `Les pegmatites riches en phosphates de fer et de manganèse (Hagendorf en Bavière) s'altèrent tardivement, à basse température :
            le fer s'oxyde, l'eau pénètre et la strengite forme des boules violettes au fond des cavités.`,
          cond: false, sansDiagramme: PEG },
        { nom: "Dans un chapeau de fer",
          texte: `Les minerais de fer oxydés (« limonites » de Giessen, de Kiruna) piègent parfois le phosphate des eaux : celui-ci précipite avec le fer ferrique en croûtes de strengite.
            Dans les sols acides, la strengite, comme la variscite, sert de repère pour la solubilité du phosphate, sans avoir été identifiée de façon certaine.`,
          cond: false, sansDiagramme: OXYD,
          src: ["Lindsay W. L. et Moreno E. C. (1960). « Phosphate phase equilibria in soils ». <i>Soil Science Society of America Proceedings</i> 24, p. 177–182."] },
      ],
    },

    // ─────────── Apatite ───────────
    apatite: {
      forme: `Cette structure associe des tétraèdres PO₄ et des atomes de calcium, qui ménagent des canaux parallèles à l'axe c. Dans ces canaux se logent les ions fluor, hydroxyle ou chlore. La symétrie hexagonale du réseau engendre les prismes à six faces.
        Avec une dureté de 5, l'apatite sert d'étalon sur l'échelle de Mohs ; les os et les dents humains sont constitués d'hydroxyapatite, sous forme de nanocristaux.`,
      intro: `L'apatite est présente dans presque toutes les roches ; c'est dans les sédiments phosphatés qu'elle se concentre le plus.`,
      scenarios: [
        { nom: "Dans un magma qui cristallise",
          texte: `Dans les roches magmatiques, le phosphore s'introduit rarement dans les gros minéraux : il cristallise tôt, en fines aiguilles d'apatite, que les autres minéraux englobent. Les granites en renferment quelques dixièmes de pour cent. Les carbonatites et certaines roches alcalines, comme celles de Khibiny (Russie), en concentrent assez pour former des gisements.`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(900, 0.3, 1, "Le magma granitique remonte et se met en place à quelques kilomètres de profondeur."),
            pt(800, 0.3, 2, "Dès ≈ 800 à 900 °C, le phosphore atteint la saturation : de fines aiguilles d'apatite cristallisent, puis les autres minéraux les enferment.", { bande: "cristallisation" }),
            pt(680, 0.3, 3, "Le granite termine sa cristallisation, et l'apatite demeure piégée sous forme d'inclusions."),
          ], note: "Chemin schématique." },
          src: ["hirschmann"] },
        { nom: "Dans un karst à phosphates",
          texte: `Au contact du calcaire, l'eau se neutralise et l'apatite précipite : c'est l'origine des phosphorites du Quercy, employées comme engrais au XIX<sup>e</sup> siècle. Auparavant, l'eau traversant un guano ou des os devient acide et se charge en phosphate.`,
          cond: { type: "apatite", chemin: [
            q({ pH: 4.5, P: 100 }, 1, "Sous l'effet du guano, l'eau devient acide (pH ≈ 4 à 5) et s'enrichit en phosphate sans rien précipiter."),
            q({ pH: 7.5, P: 0.0007 }, 2, "Lorsqu'elle rencontre le calcaire et se neutralise, elle devient sursaturée dès pH ≈ 5 et l'apatite précipite ; à pH 7,5, il ne reste presque plus de phosphate dissous."),
          ] }, },
      ],
    },

    // ─────────── Monazite ───────────
    monazite: {
      forme: `Des tétraèdres PO₄ et de gros ions de terres rares (cérium, lanthane, néodyme), entourés de neuf oxygènes, composent la monazite. Le thorium remplace une partie des terres rares :
        le minéral est donc faiblement radioactif, et ce thorium le rend précieux pour dater les granites et les gneiss.`,
      intro: `La monazite accompagne en faible quantité les granites et les gneiss, puis se concentre dans les sables lourds.`,
      scenarios: [
        { nom: "Dans un granite",
          texte: `Trop volumineux pour les feldspaths, le thorium et les terres rares restent dans le liquide magmatique, puis cristallisent précocement sous forme de monazite. Sa solubilité dépend de la température, si bien que la quantité de monazite d'un granite renseigne sur la température de celui-ci.`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(850, 0.4, 1, "Lorsque la croûte fond partiellement, les terres rares contenues dans la monazite des roches passent dans le liquide."),
            pt(760, 0.3, 2, "Refroidi, le magma parvient à saturation : la monazite recristallise alors en grains fins.", { bande: "cristallisation" }),
            pt(680, 0.3, 3, "Le granite achève de cristalliser."),
          ], note: "Chemin schématique." },
          src: ["hirschmann", SRC.montel] },
        { nom: "Dans un sable de plage",
          texte: `Sa densité (5,2) et sa résistance lui permettent de traverser l'érosion des granites. Elle s'accumule avec le zircon et l'ilménite dans les sables noirs des plages (Kerala en Inde, Brésil),
            qui furent longtemps la première source de thorium et de terres rares.`,
          cond: false, sansDiagramme: "Aucun diagramme ici : le tri des minéraux lourds par les vagues obéit au même principe que pour les autres." },
      ],
    },

    // ─────────── Xénotime ───────────
    xenotime: {
      forme: `Calqué sur la structure du zircon, le xénotime associe des tétraèdres PO₄ à des ions yttrium, chacun cerné de huit oxygènes, le tout en chaînes parallèles à c. Il accueille les terres rares de petite taille, yttrium et ytterbium, les plus grosses revenant à la monazite : les deux minéraux se répartissent ainsi les terres rares.`,
      intro: `Le xénotime accompagne la monazite et le zircon dans les granites et les gneiss.`,
      scenarios: [
        { nom: "Dans un granite ou une pegmatite",
          texte: `On le rencontre en petits grains, fréquemment collés au zircon, dans les granites alumineux et les pegmatites, puis dans les sables lourds. Le nom, « hôte étranger » en grec, vient d'une méprise : un élément nouveau semblait y avoir été découvert.`,
          cond: false, sansDiagramme: "Aucun diagramme : se reporter à la monazite, qui se forme dans les mêmes conditions." },
      ],
    },

    // ─────────── Amblygonite ───────────
    amblygonite: {
      sansForme: "Forme non dessinée : les grandes masses clivables de l'amblygonite-montebrasite dominent dans les pegmatites ; ses cristaux, rares, sont mal formés.",
      forme: `Cette espèce associe des chaînes d'octaèdres d'aluminium, des tétraèdres PO₄ et du lithium. Le fluor (amblygonite) et les groupes OH (montebrasite) se substituent l'un à l'autre ;
        la plupart des échantillons relèvent de la montebrasite. Le clivage est parfait, mais le minéral est triclinique : ses cassures dessinent des angles obliques.`,
      intro: `Dans les pegmatites, l'amblygonite-montebrasite sert de minerai de lithium.`,
      scenarios: [
        { nom: "Dans une pegmatite à lithium",
          texte: `Les pegmatites, qui terminent la cristallisation des granites enrichis en éléments rares, accumulent lithium, phosphore et fluor. Dans ce contexte, la montebrasite forme de grandes masses blanches, associées à la lépidolite et au spodumène. C'est à Montebras (Creuse) qu'elle fut décrite en 1871.`,
          cond: false, sansDiagramme: PEG },
      ],
    },

    // ─────────── Vivianite ───────────
    vivianite: {
      forme: `Dans la vivianite, des paires d'octaèdres de fer, reliées par des tétraèdres PO₄, forment des feuillets entre lesquels l'eau est retenue par des liaisons hydrogène : clivage parfait selon {010}, lames souples.
        Le fer y est ferreux (Fe²⁺) ; à l'air, une partie s'oxyde, et les échanges d'électrons entre Fe²⁺ et Fe³⁺ voisins la colorent en bleu, puis en noir.`,
      intro: `La vivianite se forme dans les milieux dépourvus d'oxygène et riches en phosphore : tourbières, vases, os enfouis.`,
      scenarios: [
        { nom: "Dans une tourbière ou une vase",
          texte: `En l'absence d'oxygène, le fer demeure dissous à l'état de Fe²⁺. Lorsque du phosphate est présent (os, coquilles, matière organique) et que le soufre fait défaut, il précipite en vivianite :
            des nodules bleus se forment dans les tourbes et les argiles, des cristaux dans les os et les coquilles fossiles (Kertch, en Crimée).`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: 0.4, n: 1, t: "Au contact de l'air, le fer précipite en oxydes et fixe le phosphate sans former de vivianite." },
            { pH: 6.8, Eh: -0.25, n: 2, t: "Dans la tourbe ou la vase, où l'oxygène manque, le fer se dissout sous forme de Fe²⁺ ; si le phosphate abonde et que le soufre se fait rare, la vivianite précipite." },
          ], note: "Le phosphore ne figure pas sur ce diagramme. Il suffit d'un domaine de Fe²⁺ dissous, accompagné de phosphate et de peu de sulfure, pour que la vivianite se forme." },
          src: [SRC.rothe] },
      ],
    },

    // ─────────── Turquoise ───────────
    turquoise: {
      sansForme: "Forme non dessinée : la turquoise prend presque toujours la forme de masses microcristallines, et les cristaux visibles restent exceptionnels (Virginie).",
      forme: `Octaèdres d'aluminium, tétraèdres PO₄ et cuivre, lié à des OH et à de l'eau, composent la turquoise.
        Le cuivre fournit le bleu ; le fer, qui remplace une partie de l'aluminium, l'oriente vers le vert.`,
      intro: `La turquoise se forme par altération de roches riches en aluminium sous l'action d'eaux chargées de cuivre, dans un climat sec.`,
      scenarios: [
        { nom: "Dans une roche altérée, en climat aride",
          texte: `Dans les déserts, où l'eau de pluie est rare, celle-ci oxyde à faible profondeur les sulfures de cuivre et entraîne le phosphore de l'apatite. Elle s'infiltre dans les fissures des roches altérées, qui se couvrent de veinules de turquoise. Parmi les gisements connus figurent Nichapour (Iran), le Sinaï, exploité depuis l'Égypte ancienne, l'Arizona et le Nevada.`,
          cond: { type: "climat", domaines: [[12, 30, 0.02, 0.2]], etiquettes: [["turquoise", 21, 0.32]], villes: ["Perpignan", "Marseille"], chemin: [
            { T: 17, ai: 0.12, n: 1, t: "Les conditions de Nichapour (Iran) : ≈ 15 à 18 °C, et entre 200 et 250 mm de pluie face à une évaporation possible plus de cinq fois plus forte." },
            { n: 2, t: "Dans les fissures des roches altérées, l'eau, peu abondante, transporte un peu de cuivre et de phosphore : elle y dépose alors la turquoise." },
          ], note: "Domaine schématique : le climat y est aride, la pluie restant inférieure à ≈ 20 % de l'ETP." },
          src: ["h5"] },
      ],
    },

    // ─────────── Wavellite ───────────
    wavellite: {
      sansForme: "Forme non dessinée : la wavellite se présente en sphérules et en rosaces d'aiguilles rayonnantes, dépourvues de faces mesurables.",
      forme: `Des chaînes d'octaèdres d'aluminium (porteurs d'OH et de fluor) reliées par des tétraèdres PO₄ forment l'ossature de la wavellite, dont l'eau occupe les canaux.
        Les aiguilles croissent le long de ces chaînes et se groupent en disques rayonnants verts sur les surfaces de fracture.`,
      intro: `La wavellite naît de l'altération à basse température de roches riches en aluminium et en phosphore.`,
      scenarios: [
        { nom: "Dans les fissures d'un schiste",
          texte: `L'eau circulant dans les fissures des schistes, des cherts et des phosphorites dissout un peu de phosphore et d'aluminium, puis dépose la wavellite en rosaces.
            Les gisements se trouvent en Arkansas, dans le Devon (où William Wavell la décrivit vers 1800) et à Zbirov, en Bohême.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Autunite ───────────
    autunite: {
      forme: `Dans l'autunite, des feuillets d'ions uranyle (UO₂²⁺ : un uranium encadré de deux oxygènes très proches, à 1,8 Å) alternent avec des tétraèdres PO₄. Entre eux se logent du calcium et une forte proportion d'eau. Cette architecture explique ses plaques carrées et son clivage parfait en lamelles ; à l'air sec, l'eau s'échappe et le minéral devient de la métautunite. C'est l'uranyle qui lui donne sa fluorescence verte.`,
      intro: `L'autunite se forme lorsque l'uranium de la pechblende, dissous par une eau oxydante, rencontre du phosphate.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement d'uranium",
          texte: `En profondeur, dépourvu d'oxygène, l'uranium est tétravalent et insoluble : c'est la pechblende. Près de la surface, l'eau de pluie l'oxyde en uranyle, très soluble ;
            au contact du phosphate de l'apatite altérée du granite, il précipite sous forme d'autunite, en plaquettes dans les fissures. Ce minéral fut décrit près d'Autun (Saône-et-Loire) en 1852 ; le Limousin et le Morvan en ont également livré.`,
          cond: { type: "ehph", systeme: "uranium", chemin: [
            { pH: 7, Eh: -0.2, n: 1, t: "La pechblende marque la zone profonde où l'uranium, tétravalent, ne se dissout pas faute d'oxygène." },
            { pH: 4.2, Eh: 0.75, n: 2, t: "L'uranium s'oxyde en uranyle (U⁶⁺), soluble, sous l'action de l'eau de pluie proche de la surface ; s'il rencontre le phosphate de l'apatite altérée, c'est l'autunite qui se précipite." },
          ], note: "Le diagramme ne représente pas le phosphore : en présence de phosphate, l'uranyle précipite en autunite au lieu de rester en solution." },
          src: [SRC.finch] },
      ],
    },

    // ─────────── Torbernite ───────────
    torbernite: {
      forme: `Elle partage avec l'autunite les feuillets d'uranyle-phosphate, mais du cuivre occupe la place du calcium entre les feuillets. Le cuivre la colore en vert et éteint la fluorescence de l'uranyle.
        Elle honore le chimiste suédois Torbern Bergman.`,
      intro: `La torbernite se forme comme l'autunite, lorsque l'eau qui dissout l'uranium apporte aussi du cuivre.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement d'uranium et de cuivre",
          texte: `Le cuivre vient ici de l'oxydation de sulfures : c'est ce qui la distingue de l'autunite. On la trouve dans les mines du Limousin, aux Bois Noirs (Loire) et en Cornouailles. Une fois exposée à l'air, elle se déshydrate partiellement pour donner la métatorbernite.`,
          cond: { type: "ehph", systeme: "uranium", chemin: [
            { pH: 7, Eh: -0.2, n: 1, t: "En profondeur, à l'abri de l'oxygène, l'uranium demeure tétravalent, insoluble, et prend la forme de pechblende." },
            { pH: 4, Eh: 0.8, n: 2, t: "En surface, l'uranium s'oxyde et gagne la solution sous forme d'uranyle ; là où le phosphate et le cuivre abondent, la torbernite se dépose." },
          ], note: "Ni le phosphore ni le cuivre ne figurent sur ce diagramme." },
          src: [SRC.finch] },
      ],
    },

    // ─────────── Pyromorphite ───────────
    pyromorphite: {
      forme: `La pyromorphite adopte la structure de l'apatite : des atomes de plomb entourent des canaux hexagonaux où les chlores s'alignent, tandis que des tétraèdres PO₄ complètent l'édifice. D'où ses prismes hexagonaux. Son nom grec, « forme du feu », tient à ce qu'une goutte fondue recristallise en polyèdres lors du refroidissement.`,
      intro: `La pyromorphite résulte de l'oxydation de la galène lorsque l'eau apporte du phosphate.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `Près de la surface, la galène s'oxyde. Le plomb libéré s'associe au phosphate des sols et des roches pour former la pyromorphite, très insoluble : on met d'ailleurs ce processus à profit pour neutraliser le plomb des sols pollués. Dans les années 1980, la mine des Farges (Ussel, Corrèze) a livré les plus beaux cristaux du monde.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Mimétite ───────────
    mimetite: {
      forme: `Cette espèce reprend la structure de l'apatite et de la pyromorphite, l'arsenic remplaçant le phosphore. Son nom grec, « imitateur », rappelle sa ressemblance avec la pyromorphite.`,
      intro: `C'est l'oxydation de filons de plomb chargés d'arsenic qui donne naissance à la mimétite.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb et d'arsenic",
          texte: `Galène et arsénopyrite s'oxydent conjointement, puis le plomb et l'arséniate se recombinent en mimétite. On la trouve à Tsumeb (Namibie), Johanngeorgenstadt (Saxe) et Santa Eulalia (Mexique).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Vanadinite ───────────
    vanadinite: {
      forme: `Cette espèce adopte la structure de l'apatite, le vanadium occupant la place du phosphore. C'est le vanadate qui lui confère son rouge vif, que la lumière assombrit peu à peu.`,
      intro: `La vanadinite se forme par oxydation des filons de plomb, surtout dans un climat sec.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb, en climat aride",
          texte: `Le vanadium est puisé dans les roches encaissantes (grès rouges, argiles). Dans un climat sec, l'eau oxydante qui descend vers le filon l'emporte à l'état de vanadate, qui se fixe au plomb de la galène altérée. Mibladen et Touissit (Maroc), l'Arizona et le Nouveau-Mexique en offrent des exemples.`,
          cond: { type: "climat", domaines: [[12, 30, 0.05, 0.2]], etiquettes: [["vanadinite", 21, 0.32]], villes: ["Perpignan", "Marseille"], chemin: [
            { T: 16, ai: 0.15, n: 1, t: "Relevés à Mibladen (Haute Moulouya, Maroc) : ≈ 15 à 17 °C ; ≈ 200 mm de précipitations, soit ≈ 15 % de l'ETP." },
            { n: 2, t: "C'est l'eau oxydante, chargée du vanadium des roches voisines, qui atteint le filon et fixe ce métal avec le plomb sous forme de vanadinite." },
          ], note: "Schéma simplifié : climat aride, pluie comprise entre ≈ 5 et 20 % de l'ETP." },
          src: ["h5"] },
      ],
    },

    // ─────────── Érythrite ───────────
    erythrite: {
      forme: `La structure de l'érythrite s'apparente à celle de la vivianite : des paires d'octaèdres de cobalt, reliées par des tétraèdres AsO₄, forment des feuillets où l'eau s'intercale. Le cobalt la colore en rose ; ses « fleurs de cobalt » ont guidé les prospecteurs.`,
      intro: `L'érythrite se forme par oxydation des arséniures de cobalt.`,
      scenarios: [
        { nom: "Sur un minerai de cobalt oxydé",
          texte: `Près de la surface, les arséniures de cobalt (skuttérudite, cobaltite) s'oxydent et se recouvrent d'efflorescences roses : Bou Azzer (Maroc), Schneeberg (Saxe), Les Chalanches (Isère).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },
  });
})();
