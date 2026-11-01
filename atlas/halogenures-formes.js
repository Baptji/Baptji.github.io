// ============================================================
// CLASSE III — halogénures : formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026
// Chargé après natifs-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js).
// Formes et habitus : Klein et Dutrow (Manual of Mineral Science, 2007), Dana's System of Mineralogy, Handbook of
// Mineralogy ; distances au centre (d) réglées pour retrouver l'habitus décrit.
// Atacamite : indices dans les axes du CIF (Pnma, a 6,03 · b 6,865 · c 9,12 Å) ; le Handbook est en Pnam (b et c
// échangés) : son prisme {110} devient {101}, son clivage {010} devient {001}, l'allongement [001] devient [010].
// Carnallite non dessinée (cristaux rares, pseudo-hexagonaux, mal décrits).
// ============================================================

(function () {
  const CUBIQUE = (a) => [a, a, a, 90, 90, 90];
  const CLIV_CUBE = [{ hkl: [1, 0, 0], qualite: "parfait", nom: "cubique, trois directions à angle droit", pas: 0.25 }];
  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ─────────── Halite ───────────
    halite_m: {
      nom: "Halite", couleur: "#eef0f4", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(5.6401), mailleSource: "cod9003308",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Quasi seule forme du sel. Des cubes apparaissent à la surface d'une saumure et croissent plus vite le long des arêtes qu'au centre des faces : ils forment des « trémies », pyramides creuses en gradins, qui flottent avant de sombrer (non dessinée ici)." },
      ],
      clivages: CLIV_CUBE,
    },

    // ─────────── Sylvite ───────────
    sylvite: {
      nom: "Sylvite", couleur: "#e6d2c8", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(6.2788), mailleSource: "cod9009733",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Structure identique à celle de la halite ; les cubes sont peu fréquents, la sylvite se rencontrant surtout en grains au sein de la sylvinite." },
        { nom: "Cube et octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.4 }],
          note: "De minuscules facettes triangulaires d'octaèdre rognent les angles du cube, plus souvent chez la sylvite que chez la halite." },
      ],
      clivages: CLIV_CUBE,
    },

    // ─────────── Fluorine ───────────
    fluorine: {
      nom: "Fluorine", couleur: "#9b7fd0", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(5.4631), mailleSource: "cod9007060",
      macleNote: "Macle par interpénétration : deux cubes s'entrecroisent, l'un tourné de 180° autour d'une diagonale [111], si bien que les angles du second ressortent des faces du premier (absente du dessin, qui ne montre que les macles accolées).",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Dans les filons froids (Morvan, Tarn, Chaillac), on rencontre surtout des cubes nets, fréquemment zonés en violet." },
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Rare à l'état naturel mais courant dans les filons chauds (Alpes, Chamonix : les octaèdres roses des fentes alpines), cette forme apparaît aussi au clivage : frapper un cube par ses angles en détache des octaèdres." },
        { nom: "Cube et octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.35 }],
          note: "Un cube à angles rognés témoigne d'un basculement d'une forme à l'autre au gré des variations de température ou de chimie de l'eau." },
      ],
      clivages: [{ hkl: [1, 1, 1], qualite: "parfait", nom: "octaédrique, quatre directions", pas: 0.26 }],
    },

    // ─────────── Chlorargyrite ───────────
    chlorargyrite: {
      nom: "Chlorargyrite", couleur: "#c9b99b", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(5.5463), mailleSource: "cod9011666",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Cubes minuscules et peu fréquents ; la chlorargyrite donne surtout des croûtes et des masses cireuses et translucides, taillables au couteau." },
      ],
      clivages: [],
    },

    // ─────────── Cryolite ───────────
    cryolite: {
      nom: "Cryolite", couleur: "#eef2f5", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [5.4139, 5.6012, 7.7769, 90, 90.183, 90], mailleSource: "cod9006157",
      macleNote: "Très courantes, ces macles se répètent souvent (polysynthétiques), selon plusieurs lois ; elles résultent du basculement de la forme cubique haute température vers la forme monoclinique lors du refroidissement.",
      facies: [
        { nom: "Pseudo-cube",
          formes: [{ sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }],
          note: "Faux cube : la maille s'approche du cube (c ≈ a√2, β ≈ 90°), si bien que le prisme {110} rencontre la base {001} presque à l'équerre. À Ivigtut, les cristaux dépassaient une dizaine de centimètres." },
      ],
      clivages: [],
    },

    // ─────────── Atacamite ───────────
    atacamite: {
      nom: "Atacamite", couleur: "#2f8a5a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [6.03, 6.865, 9.12, 90, 90, 90], mailleSource: "cod9007718", azimut: 24, elevation: 14,
      facies: [
        { nom: "Prisme strié",
          formes: [
            { sym: "m", hkl: [1, 0, 1], nom: "prisme", d: 1.0 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.05 },
            { sym: "e", hkl: [0, 1, 1], nom: "dôme", d: 4.5 },
          ],
          note: "Cristaux prismatiques minces, étirés suivant b, striés en long et coiffés d'un dôme {011}. Les indices suivent les axes de la structure 3D (les ouvrages en Pnam notent le prisme {110} et l'allongement [001])." },
      ],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "{001} ({010} dans la notation Pnam des ouvrages)", pas: 0.22 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const q = (o, n, t, x) => Object.assign({}, o, n ? { n } : {}, t ? { t } : {}, x || {});
  const SRC = {
    pauly: "Pauly H. et Bailey J. C. (1999). « Genesis and evolution of the Ivigtut cryolite deposit, SW Greenland ». <i>Meddelelser om Grønland, Geoscience</i> 37.",
    reich: "Reich M., Palacios C. et al. (2009). « Supergene enrichment of copper deposits since the onset of modern hyperaridity in the Atacama Desert, Chile ». <i>Mineralium Deposita</i> 44, p. 497–504.",
    cameron: "Cameron E. M., Leybourne M. I. et Palacios C. (2007). « Atacamite in the oxide zone of copper deposits in northern Chile: involvement of deep formation waters? ». <i>Mineralium Deposita</i> 42, p. 205–218.",
    warren2016: "Warren J. K. (2016). <i>Evaporites: A Geological Compendium</i>, 2ᵉ éd., Springer, chap. 11 (potasse) : la sylvite primaire suppose une saumure pauvre en sulfate de magnésium.",
  };
  const ARIDE = "Aucun diagramme n'est proposé : le comportement dépend de la composition chimique de l'eau (teneur en chlore, caractère oxydant ou non), que nul diagramme de l'atlas ne figure pour ce métal.";

  Object.assign(MIN_F, {

    // ─────────── Halite ───────────
    halite_m: {
      forme: `La halite présente l'empilement le plus simple entre deux ions de tailles différentes : chaque Na⁺ est entouré de six Cl⁻, et réciproquement, aux sommets d'un octaèdre. Le réseau est cubique selon les trois directions, d'où la forme cubique des cristaux. Les plans {100} portent autant de charges positives que de charges négatives : neutres, ils se séparent sans effort, si bien qu'un <b>clivage cubique</b> parfait fragmente un bloc de sel en petits cubes.`,
      intro: `La halite se forme par évaporation de l'eau de mer ou d'un lac salé ; enfouie, elle se déforme plastiquement et peut former des dômes qui remontent vers la surface.`,
      scenarios: [
        { nom: "Dans une lagune qui s'évapore",
          texte: `Une lagune isolée de la mer par un seuil se concentre à chaque saison sèche. Les carbonates puis le gypse précipitent en premier ; lorsqu'il ne subsiste que 9 % de l'eau initiale (× 10,6), le chlorure de sodium sature et cristallise, en petits cubes à la surface et en croûtes au fond. Tant que la mer réalimente le bassin, les bancs s'accumulent : le sel du Keuper de Lorraine (≈ 220 millions d'années) atteint plus de 100 m d'épaisseur cumulée.`,
          cond: { type: "saumure", sels: ["halite"], chemin: [
            q({ F: 1, C: 28.4 }, 0, "", { lab: "eau de mer" }),
            q({ F: 10.6, C: 301 }, 1, "La halite apparaît lorsque, après le départ des carbonates et du gypse, le sel dissous atteint ≈ 300 g par kilogramme d'eau, soit × 10,6 de la concentration initiale, c'est-à-dire 91 % de l'eau évaporée."),
            q({ F: 30, C: 301 }, 2, "Tant que la lagune est réalimentée, tout le sel apporté en supplément cristallise : les cubes s'accumulent en couches successives."),
          ] },
          src: ["mccaffrey", "warren", "millero2008"] },
        { nom: "Dans un marais salant",
          texte: `Dans les marais salants de Salin-de-Giraud (Camargue) ou de Guérande, ce processus est reproduit à dessein : l'eau de mer progresse d'un bassin à l'autre, le gypse s'y dépose d'abord, le sel est récupéré dans les bassins terminaux, et les sels de magnésium, au goût amer, précipitent en dernier.`,
          cond: false, sansDiagramme: "Aucun nouveau diagramme n'est proposé : le parcours est identique à celui de la lagune (onglet précédent), interrompu avant le dépôt des sels de potassium." },
        { nom: "Enfouie, elle monte en dômes",
          texte: `Plus léger (2,16) que les terrains sus-jacents (≈ 2,5), le sel se déplace lentement, à quelques kilomètres de profondeur, à la manière d'un glacier. Il se concentre sous les zones où la couverture s'amincit et s'élève en dômes ou en murs appelés diapirs, dont certains affleurent, en Bresse, en Aquitaine ou dans le nord de l'Allemagne. Ses cristaux s'y reforment en grains volumineux.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : c'est la différence de densité, et non la température ou la concentration, qui provoque la remontée du sel." },
      ],
    },

    // ─────────── Sylvite ───────────
    sylvite: {
      forme: `Structure identique à celle de la halite, le potassium remplaçant le sodium : chaque K⁺ est entouré de six Cl⁻. Plus volumineux, le potassium écarte les ions (3,14 Å au lieu de 2,82) : la maille est plus grande et le cristal moins dense (1,99). Les plans restent neutres et le <b>clivage cubique</b> parfait est conservé.`,
      intro: `La sylvite est un sel de la toute fin de l'évaporation, lorsqu'il ne reste qu'un peu plus de 1 % de l'eau initiale.`,
      scenarios: [
        { nom: "Fin d'évaporation (bassin potassique d'Alsace)",
          texte: `Une fois passés le gypse et le sel, la saturation en potassium survient au-delà de ≈ 65 fois la concentration de l'eau de mer. Dans l'eau actuelle, riche en sulfate de magnésium, celui-ci se fixe d'abord dans des sels complexes (kaïnite, carnallite). À l'inverse, les saumures appauvries en sulfate, telles que celle du fossé rhénan entre 35 et 30 millions d'années, laissent la sylvite cristalliser en même temps que la halite. C'est l'origine de la sylvinite exploitée dans les Mines de potasse d'Alsace, formée de deux couches de 1 à 5 m.`,
          cond: { type: "saumure", sels: ["sylvite", "halite"], chemin: [
            q({ F: 1, C: 0.79 }, 0, "", { lab: "eau de mer" }),
            q({ F: 65, C: 51 }, 1, "Passé le gypse (× 3,8) et le sel (× 10,6), le potassium dissous atteint, au-delà de ≈ × 65, une teneur de ≈ 50 g par kilogramme d'eau (calculée en sylvite) : c'est le seuil de cristallisation des sels potassiques."),
            q({ F: 100, C: 51 }, 2, "Halite et sylvite se déposent conjointement, en lits superposés : cet ensemble forme la sylvinite (Alsace, 35 à 30 Ma)."),
          ] },
          src: ["mccaffrey", "warren", "millero2008", SRC.warren2016] },
        { nom: "En lessivant la carnallite",
          texte: `Certaines sylvites des gisements résultent d'une transformation postérieure. Lorsqu'une eau faiblement minéralisée traverse une couche de carnallite (KMgCl₃·6H₂O), elle dissout le chlorure de magnésium, très soluble, et abandonne le potassium sous la forme de sylvite.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : ce qui détermine le phénomène est la composition de l'eau qui traverse la couche, et non sa concentration globale." },
      ],
    },

    // ─────────── Carnallite ───────────
    carnallite: {
      sansForme: "Aucune forme n'est représentée : les cristaux de carnallite, rares, sont pseudo-hexagonaux et peu documentés ; le minéral se présente plutôt en agrégats grenus.",
      forme: `La carnallite est un sel <b>hydraté</b> : chaque magnésium est enfermé dans un octaèdre de six molécules d'eau (voir la structure 3D), tandis que le potassium et le chlore occupent les vides entre ces octaèdres. La cohésion de l'ensemble repose sur des liaisons hydrogène, faibles, d'où l'absence de clivage, une dureté de 2,5 et une déliquescence marquée : le cristal absorbe l'humidité de l'air jusqu'à se dissoudre.`,
      intro: `La carnallite compte parmi les tout derniers sels à cristalliser lors de l'évaporation de l'eau de mer.`,
      scenarios: [
        { nom: "Au bout de l'évaporation",
          texte: `Quand 1 % seulement de l'eau de mer subsiste (soit 100 à 170 fois la concentration initiale), la saumure, très enrichie en magnésium, précipite la carnallite avec la halite et la kiesérite. Pour se préserver, ces dépôts doivent être vite enfouis et jamais recoupés par une eau moins salée. Le Zechstein allemand (≈ 255 millions d'années) et le site de Solikamsk, dans l'Oural, en contiennent de vastes épaisseurs ; en Alsace, elle reste secondaire face à la sylvite.`,
          cond: { type: "saumure", sels: ["sylvite"], xmax: 200, chemin: [
            q({ F: 1, C: 0.79 }, 0, "", { lab: "eau de mer" }),
            q({ F: 65, C: 51 }, 1, "Une fois le gypse et le sel déposés, les sels de potassium et de magnésium entament leur cristallisation au-delà de ≈ × 65."),
            q({ F: 140, C: 51 }, 2, "Pour des concentrations comprises entre ≈ × 100 et × 170, la carnallite se dépose depuis la saumure magnésienne, en compagnie de la halite et de la kiesérite."),
          ], note: "Sur la courbe, le potassium est comptabilisé comme s'il précipitait sous forme de sylvite, alors qu'il se fixe ici dans la carnallite (KMgCl₃·6H₂O). Ce tracé n'est qu'une schématisation." },
          src: ["warren", "millero2008"] },
      ],
    },

    // ─────────── Fluorine ───────────
    fluorine: {
      forme: `La structure de la fluorine repose sur un empilement cubique à faces centrées de calciums, dont tous les petits sites tétraédriques sont occupés par des fluors. Chaque calcium est ainsi cerné de huit fluors disposés en cube, tandis que chaque fluor est lié à quatre calciums. Les plans {111} ne portent qu'un seul type d'ion : deux plans de fluor contigus se repoussent, d'où une cohésion faible. Il en découle le <b>clivage octaédrique</b> parfait, qui sépare des octaèdres au sein d'un cube.`,
      intro: `Le dépôt de fluorine a lieu principalement dans les filons : il provient d'eaux chaudes qui ont extrait le fluor des granites.`,
      scenarios: [
        { nom: "Dans un filon de basse température",
          texte: `Chauffées en profondeur, des eaux salées extraient le fluor du granite et du socle, puis remontent par les failles. Entre ≈ 80 et 200 °C, au moment où elles refroidissent ou se mêlent à une eau plus froide et plus calcique, la fluorine se dépose sous forme de cubes, accompagnée fréquemment de barytine, de quartz et de galène. Les grands filons français sont en majorité jurassiques (≈ 200 à 150 millions d'années) : Voltennes (Morvan), Le Burc et Mont-Roc (Tarn), ou encore Chaillac (Indre).`,
          cond: false, sansDiagramme: "L'atlas ne propose aucun diagramme ici, car la fluorine se forme autant par mélange de deux eaux que par refroidissement, un processus qu'aucune représentation de l'atlas ne restitue." },
        { nom: "En fin de cristallisation d'un granite",
          texte: `Le granite n'offre presque aucune place au fluor, qui s'accumule dans les dernières fractions liquides et dans les fluides qui en émanent. Il se fixe alors sous forme de fluorine dans les pegmatites et dans les greisens, granites remaniés par ces fluides à proximité des gisements d'étain et de tungstène (Échassières dans l'Allier, Cornouailles).`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : la fluorine n'est ici qu'un minéral accessoire issu des fluides de fin de cristallisation." },
      ],
    },

    // ─────────── Chlorargyrite ───────────
    chlorargyrite: {
      forme: `La chlorargyrite adopte la structure du sel de cuisine, chaque atome d'argent étant cerné de six atomes de chlore. Toutefois, la liaison Ag-Cl présente un caractère covalent partiel, si bien que les plans coulissent sans se désolidariser : le minéral est dépourvu de clivage et se taille au couteau, à la manière de la corne. Sous l'effet de la lumière, il libère de l'argent métallique et noircit, tout comme une pellicule photographique (c'est précisément le sel des pellicules).`,
      intro: `On rencontre la chlorargyrite dans la zone d'oxydation des filons d'argent, en milieu aride.`,
      scenarios: [
        { nom: "Zone d'oxydation, en climat aride",
          texte: `En surface, les sulfures d'argent subissent l'attaque oxydante de l'eau de pluie. En climat humide, l'argent migre vers les profondeurs ; en climat aride en revanche, l'eau se raréfie et se charge de chlore issu des sels du sol, des embruns ou des nappes salées, de sorte que l'argent demeure en place et précipite en chlorure. On observe ainsi des « chapeaux » de chlorargyrite massive, notamment dans les filons chiliens (Chañarcillo) et à Broken Hill, en Australie.`,
          cond: { type: "climat", domaines: [[12, 30, 0, 0.2]], etiquettes: [["chlorargyrite", 21, 0.1]], villes: ["Perpignan", "Marseille"], chemin: [
            { T: 18, ai: 0.17, n: 1, t: "À Broken Hill (Australie), la température moyenne atteint ≈ 18 °C ; la pluie, de ≈ 250 mm, ne représente que ≈ 17 % d'une évapotranspiration potentielle d'environ 1 500 mm." },
            { n: 2, t: "Oxydés par l'eau de pluie, les sulfures d'argent libèrent un métal que la rareté et la salinité de l'eau ne permettent pas d'évacuer : il précipite donc en chlorure dans les fissures." },
          ], note: "Limite indicative : la chlorargyrite prend le pas sur les autres minéraux d'oxydation dès que les précipitations descendent sous ≈ 20 % de l'ETP." },
          src: ["h5"] },
      ],
    },

    // ─────────── Cryolite ───────────
    cryolite: {
      forme: `Les octaèdres AlF₆, isolés les uns des autres, sont séparés par des ions sodium : l'ensemble rappelle la structure pérovskite. Au-dessus de ≈ 885 °C, ces octaèdres demeurent alignés et la maille reste cubique. Plus froide, la structure s'incline légèrement, passant en monoclinique avec un angle β de 90,2°, si faible que le cristal garde une silhouette cubique. Des domaines inclinés différemment engendrent alors ses macles multiples.`,
      intro: `La cryolite ne forme qu'un seul grand gisement mondial, au sommet d'un petit granite du Groenland.`,
      scenarios: [
        { nom: "Au toit d'un granite alcalin (Ivigtut)",
          texte: `Voici 1,27 milliard d'années, un modeste massif de granite alcalin, riche en fluor, s'installe à Ivigtut, au Groenland. Ses ultimes liquides et fluides, porteurs de fluor, de sodium et d'aluminium, s'accumulent sous la voûte et y forment une masse de cryolite quasi pure, mêlée de sidérite, de quartz et de fluorine : ≈ 3,8 millions de tonnes, extraites de 1854 à 1987 pour fournir le fondant de l'alumine lors de l'électrolyse de l'aluminium.`,
          cond: false, sansDiagramme: "L'atlas ne propose pas de diagramme ici : l'origine précise, liquide magmatique ou fluide, fait encore débat, et aucune représentation de l'atlas ne rend compte de ces conditions.",
          src: [SRC.pauly] },
      ],
    },

    // ─────────── Atacamite ───────────
    atacamite: {
      forme: `Chaque cuivre se place au cœur d'un octaèdre déformé : quatre OH rapprochés et deux chlores plus éloignés, ou bien cinq OH et un seul chlore. Ces octaèdres se touchent par leurs arêtes et composent un édifice serré. Des liaisons hydrogène relient OH et chlores, plus lâches sur les plans {001}, ce qui produit le clivage parfait. Des chaînes d'octaèdres étirées le long de b rendent compte des prismes fins et striés.`,
      intro: `Dans les régions presque dépourvues de pluie et où l'eau est chargée de sel, l'atacamite prend la place de la malachite.`,
      scenarios: [
        { nom: "Zone d'oxydation, en climat hyper-aride",
          texte: `Au désert d'Atacama, les précipitations ne se mesurent qu'en millimètres annuels. Les sulfures de cuivre y réagissent lentement avec des eaux rares et très chargées en sel, issues des brouillards côtiers ou de nappes profondes remontées par les failles. Là où les climats humides forment carbonates (malachite, azurite), le chlorure de cuivre vert s'impose. Sa conservation suppose un climat constamment sec : une seule saison pluvieuse importante suffirait à le dissoudre. Cette hyperaridité persiste depuis ≈ 15 millions d'années.`,
          cond: { type: "climat", domaines: [[10, 25, 0, 0.05]], etiquettes: [["atacamite", 17.5, 0.18]], villes: ["Perpignan", "Montpellier"], chemin: [
            { T: 17, ai: 0.01, n: 1, t: "Atacama : température moyenne ≈ 17 °C, quelques millimètres de pluie annuelle, moins de 1 % de l'ETP." },
            { n: 2, t: "Lorsque les sulfures de cuivre s'oxydent au contact d'une eau peu abondante et salée, le métal se fixe en chlorure vert : c'est l'atacamite." },
          ], note: "Ce domaine est schématique : en dessous de ≈ 5 % de l'ETP. Dans un milieu plus humide, la malachite lui succède." },
          src: ["h5", SRC.reich, SRC.cameron] },
        { nom: "Sur les bronzes immergés",
          texte: `Dans le milieu marin, le cuivre des bronzes anciens et des épaves se transforme peu à peu en atacamite et en ses deux polymorphes (paratacamite, clinoatacamite). Ces minéraux entrent dans la composition de la patine verte, de même que dans la « maladie du bronze », qui attaque les objets remontés de l'eau.`,
          cond: false, sansDiagramme: ARIDE },
      ],
    },
  });
})();
