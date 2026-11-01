// ============================================================
// CLASSE VII — sulfates, chromates, molybdates et tungstates : formes cristallines (cristal.js) et modes de formation (MIN_F)
// chantier F.4, 01/10/2026. Chargé après borates-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js).
// Le gypse a été fait en F.3 (cristal.js, mineraux-formation.js) : il n'est pas repris ici.
// Barytine et célestine : CIF en Pnma, comme les ouvrages. Anglésite : CIF en Pbnm (a 6,95 · b 8,47 · c 5,40) ; ouvrages en
// Pnma : (h k l) des ouvrages = (l h k) ici — tablette {001} → {100}, prisme {210} → {021}, dôme {011} → {101}.
// Non dessinés : anhydrite, epsomite, mirabilite, chalcanthite (cristaux rares ou masses, efflorescences).
// ============================================================

(function () {
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ─────────── Thénardite (F.12, 16/10/2026) ───────────
    thenardite: {
      nom: "Thénardite", couleur: "#e6e2d8", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "F",
      maille: [9.829, 12.302, 5.868, 90, 90, 90], mailleSource: "cod9004092", azimut: 22, elevation: 14,
      macleNote: "Macles sur {110}, fréquemment en croix. Plus grossières, elles prennent une forme de papillon sur {011}.",
      facies: [
        { nom: "Dipyramide", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "dipyramide", d: 1.0 }],
          note: "Forme la plus répandue parmi les cristaux libres, pouvant atteindre 20 cm dans les lacs salés de Californie et du Chili." },
        { nom: "Tablette", formes: [{ sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.5 }, { sym: "e", hkl: [1, 0, 1], nom: "dôme", d: 1.0 }],
          note: "Tablette selon b, bordée d'un large dôme {101}. Le plus souvent, la thénardite se présente seulement sous forme de poudre ou de croûte." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },

    // ─────────── Barytine ───────────
    barytine: {
      nom: "Barytine", couleur: "#e9e1d2", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [8.8842, 5.4559, 7.1569, 90, 90, 90], mailleSource: "cod9004122", azimut: 24, elevation: 20,
      facies: [
        { nom: "Tablette",
          formes: [
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.42 },
            { sym: "m", hkl: [2, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "o", hkl: [0, 1, 1], nom: "dôme", d: 0.78 },
          ],
          note: "Pour un minéral clair, ces tablettes épaisses, losangiques ou rectangulaires, sont très denses (4,5). Disposées en éventail, elles donnent les « crêtes de coq » ; enfouies dans les sables, elles produisent les « roses des sables » de barytine de l'Oklahoma." },
      ],
      clivages: [
        { hkl: [0, 0, 1], qualite: "parfait", nom: "basal {001}", pas: 0.22 },
        { hkl: [2, 1, 0], qualite: "bon", nom: "prismatique {210}", pas: 0.3 },
      ],
    },

    // ─────────── Célestine ───────────
    celestine: {
      nom: "Célestine", couleur: "#c9dcef", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [8.36, 5.35, 6.858, 90, 90, 90], mailleSource: "cod9004091", azimut: 24, elevation: 18,
      facies: [
        { nom: "Tablette allongée",
          formes: [
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.55 },
            { sym: "m", hkl: [2, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "o", hkl: [0, 1, 1], nom: "dôme", d: 0.85 },
            { sym: "d", hkl: [1, 0, 1], nom: "dôme", d: 1.1 },
          ],
          note: "Tablettes et prismes bleu ciel, dont le nom vient du latin <i>caelestis</i>, qui tapissent les géodes des calcaires et des marnes." },
      ],
      clivages: [
        { hkl: [0, 0, 1], qualite: "parfait", nom: "basal {001}", pas: 0.22 },
        { hkl: [2, 1, 0], qualite: "bon", nom: "prismatique {210}", pas: 0.3 },
      ],
    },

    // ─────────── Anglésite ───────────
    anglesite: {
      nom: "Anglésite", couleur: "#efeee6", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [6.9549, 8.472, 5.3973, 90, 90, 90], mailleSource: "cod9004484", azimut: 24, elevation: 18,
      facies: [
        { nom: "Prisme",
          formes: [
            { sym: "m", hkl: [0, 2, 1], nom: "prisme", d: 1.0 },
            { sym: "c", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.9 },
            { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.05 },
          ],
          note: "Dont ils sont issus, ces cristaux à l'éclat adamantin se logent souvent dans une cavité de la galène. Dans la structure 3D (Pbnm), les indices suivent les axes : ce que les ouvrages notent {001} pour la tablette s'écrit ici {100}." },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "bon", nom: "{100} ({001} dans la notation Pnma des ouvrages)", pas: 0.24 }],
    },

    // ─────────── Alunite ───────────
    alunite: {
      nom: "Alunite", couleur: "#ece6dc", systeme: "trigonal (rhomboédrique)", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "R",
      maille: HEX(6.9749, 17.315), mailleSource: "cod9016102", azimut: 30, elevation: 16,
      facies: [
        { nom: "Rhomboèdre pseudo-cubique",
          formes: [{ sym: "r", hkl: [1, 0, -1, 2], nom: "rhomboèdre", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.15 }],
          note: "Peu fréquents, de petits rhomboèdres presque cubiques (angle de 89°) ; dans les roches volcaniques altérées, l'alunite se présente surtout en masses grenues ou terreuses." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "net", nom: "basal", pas: 0.22 }],
    },

    // ─────────── Jarosite ───────────
    jarosite: {
      nom: "Jarosite", couleur: "#b98a2f", systeme: "trigonal (rhomboédrique)", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "R",
      maille: HEX(7.2913, 17.1744), mailleSource: "cod9016962", azimut: 30, elevation: 16,
      facies: [
        { nom: "Tablette pseudo-cubique",
          formes: [{ sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.65 }, { sym: "r", hkl: [1, 0, -1, 2], nom: "rhomboèdre", d: 1.0 }],
          note: "Sur les roches à pyrite altérée, ces petites tablettes et rhomboèdres jaune-brun composent souvent des croûtes scintillantes." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "net", nom: "basal", pas: 0.22 }],
    },

    // ─────────── Crocoïte ───────────
    crocoite: {
      nom: "Crocoïte", couleur: "#e2501f", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [7.127, 7.438, 6.799, 90, 102.43, 90], mailleSource: "cod9015975", azimut: 22, elevation: 14,
      facies: [
        { nom: "Prisme",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "e", hkl: [0, 1, 1], nom: "dôme", d: 3.4 },
          ],
          note: "À Dundas (Tasmanie), de longs prismes orange vif, striés et souvent creux, s'entrecroisent en buissons. Ce fut dans la crocoïte de Sibérie que Vauquelin identifia le chrome en 1797." },
      ],
      clivages: [{ hkl: [1, 1, 0], qualite: "net", nom: "{110}", pas: 0.24 }],
    },

    // ─────────── Wulfénite ───────────
    wulfenite: {
      nom: "Wulfénite", couleur: "#e8a33a", systeme: "quadratique", classe: "4/m", classeNom: "dipyramidale quadratique", reseau: "I",
      maille: [5.434, 5.434, 12.107, 90, 90, 90], mailleSource: "cod9009404", azimut: 22, elevation: 22,
      facies: [
        { nom: "Plaque carrée",
          formes: [{ sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.25 }, { sym: "n", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }],
          note: "On trouve, à Red Cloud (Arizona), à Los Lamentos (Mexique) et à Mežica (Slovénie), des plaques carrées et minces, aux bords biseautés, qui vont de l'orange au jaune miel." },
      ],
      clivages: [{ hkl: [1, 0, 1], qualite: "net", nom: "{101}", pas: 0.24 }],
    },

    // ─────────── Scheelite ───────────
    scheelite: {
      nom: "Scheelite", couleur: "#eadfc4", systeme: "quadratique", classe: "4/m", classeNom: "dipyramidale quadratique", reseau: "I",
      maille: [5.2429, 5.2429, 11.3737, 90, 90, 90], mailleSource: "cod9009626", azimut: 22, elevation: 12,
      facies: [
        { nom: "Bipyramide",
          formes: [{ sym: "e", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }],
          note: "Bipyramides presque octaédriques, de couleur blanc crème à orangée ; sous une lampe à ultraviolets courts, la scheelite émet une fluorescence bleue, ce qui permet aux prospecteurs de la repérer de nuit." },
      ],
      clivages: [{ hkl: [1, 0, 1], qualite: "net", nom: "{101}", pas: 0.24 }],
    },

    // ─────────── Wolframite ───────────
    wolframite: {
      nom: "Wolframite", couleur: "#3a332e", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [4.75, 5.72, 4.97, 90, 90.17, 90], mailleSource: "cod9000224", azimut: 26, elevation: 14,
      facies: [
        { nom: "Tablette prismatique",
          formes: [
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.55 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.7 },
          ],
          note: "Implantées dans le quartz des filons, les tablettes noires, allongées selon c, présentent un éclat métallique." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.24 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const q = (o, n, t, x) => Object.assign({}, o, n ? { n } : {}, t ? { t } : {}, x || {});
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    hanor: "Hanor J. S. (2000). « Barite–celestine geochemistry and environments of formation ». <i>Reviews in Mineralogy and Geochemistry</i> 40, p. 193–275.",
    nordstrom: "Nordstrom D. K. (1982). « Aqueous pyrite oxidation and the consequent formation of secondary iron minerals ». Dans <i>Acid Sulfate Weathering</i>, Soil Science Society of America, p. 37–56.",
    stoffregen: "Stoffregen R. E., Alpers C. N. et Jambor J. L. (2000). « Alunite–jarosite crystallography, thermodynamics, and geochronology ». <i>Reviews in Mineralogy and Geochemistry</i> 40, p. 453–479.",
    einaudi: "Einaudi M. T., Meinert L. D. et Newberry R. J. (1981). « Skarn deposits ». <i>Economic Geology 75th Anniversary Volume</i>, p. 317–391.",
  };
  const OXYD = "Aucun diagramme n'est proposé : l'oxydation proche de la surface et la chimie de l'eau de pluie en décident.";
  const FILON = "Aucun diagramme n'est proposé : ici, c'est la chimie de l'eau chaude qui décide (mélange de deux eaux, porteuses de sulfate et de baryum ou de strontium), chimie qu'aucun diagramme de l'atlas ne représente.";

  Object.assign(MIN_F, {

    // ─────────── Schwertmannite (F.12, 16/10/2026) ───────────
    schwertmannite: {
      sansForme: "Aucune forme n'est dessinée : la schwertmannite ne cristallise pas en faces, elle se présente en aiguilles de quelques nanomètres groupées autour de petites sphères.",
      forme: `Faiblement cristallisée, la schwertmannite ne dispose pas d'une structure établie atome par atome. Le modèle le plus répandu reprend celui de l'akaganéite : des doubles chaînes d'octaèdres de fer délimitant des tunnels carrés. Une partie des sulfates occupe ces tunnels, le reste demeure fixé à la surface des aiguilles ; le modèle 3D ne représente que la charpente du fer.`,
      intro: `La schwertmannite se forme dans les eaux acides (pH 3 à 4,5) chargées en sulfate de fer, là où la pyrite s'oxyde.`,
      scenarios: [
        { nom: "Dans un drainage acide ou un sol sulfaté acide",
          texte: `Dès qu'une vase à pyrite est drainée ou que l'eau sort d'une mine, la pyrite s'oxyde et libère acide sulfurique et fer. Ce fer, passé à l'état Fe³⁺ au contact de l'air, précipite selon le pH : en jarosite sous pH 3, en schwertmannite entre 3 et 4,5, puis en ferrihydrite et goethite au-delà. Il en résulte les boues ocre-jaune des fossés de polders et des ruisseaux miniers. Peu stable, la schwertmannite devient goethite en un à deux ans, en libérant de l'acide.`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: -0.1, n: 1, t: "En profondeur, la pyrite reste stable, car l'eau est neutre et dépourvue d'oxygène." },
            { pH: 3.8, Eh: 0.75, n: 2, t: "Une fois drainée, la pyrite s'oxyde : l'eau devient acide et oxydante. Entre pH 3 et 4,5, et en présence d'un fort excès de sulfate, le fer précipite sous forme de schwertmannite." },
          ], note: "Le diagramme ne représente pas le soufre : la schwertmannite se forme à la frontière entre le Fe³⁺ dissous et les oxydes de fer, dans une eau acide riche en sulfate." },
          src: [SRC.nordstrom, "Bigham J. M. et al. (1996). « Schwertmannite and the chemical modeling of iron in acid sulfate waters ». <i>Geochimica et Cosmochimica Acta</i> 60, p. 2111–2121."] },
      ],
    },

    // ─────────── Thénardite (F.12, 16/10/2026) ───────────
    thenardite: {
      forme: `Un soufre occupe le centre de chaque tétraèdre SO₄, et six oxygènes de sulfates entourent chaque sodium, sans eau. Le lien ionique qui unit le sodium au sulfate est faible, puisqu'une même charge se répartit sur six oxygènes : le sel est donc tendre et très soluble. Dans l'eau, au-dessous de 32,4 °C, la mirabilite, qui porte dix molécules d'eau, devient la phase stable.`,
      intro: `La thénardite cristallise à partir d'eaux riches en sulfate de sodium qui s'évaporent à chaud, ou elle apparaît lorsque la mirabilite perd son eau.`,
      scenarios: [
        { nom: "Dans un lac salé ou une croûte de sol salé",
          texte: `Au-dessus de 32,4 °C, la thénardite précipite lorsque l'eau chargée de sulfate de sodium s'évapore dans les lacs salés et les sebkhas des régions arides : elle forme alors des croûtes et des cristaux (Espartinas près d'Aranjuez, Searles Lake). Dans les sols salés, elle se rencontre en efflorescences de surface durant la saison sèche, associée à la halite et au gypse.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : la température et l'humidité de l'air déterminent le passage entre thénardite et mirabilite, mais l'atlas ne dispose pas de ce diagramme.",
          src: ["Steiger M. et Asmussen S. (2008). « Crystallization of sodium sulfate phases in porous materials: the phase diagram Na₂SO₄–H₂O and the generation of stress ». <i>Geochimica et Cosmochimica Acta</i> 72, p. 4291–4306."] },
        { nom: "Quand la mirabilite sèche",
          texte: `La mirabilite se déshydrate et se transforme en poudre blanche de thénardite lorsque l'humidité de l'air tombe sous 76 % à 20 °C ; la thénardite refixe son eau à l'air humide. Dans les pierres d'un mur, ces allers-retours provoquent leur éclatement.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : la réaction a lieu à l'air, à température ordinaire." },
        { nom: "Autour des fumerolles",
          texte: `Des gaz de fumerolles, au Vésuve comme à l'Etna, la déposent aussi.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : le dépôt se forme à partir des gaz volcaniques." },
      ],
    },

    // ─────────── Barytine ───────────
    barytine: {
      forme: `La barytine se compose de tétraèdres SO₄ isolés et de gros ions baryum, chacun entouré de douze oxygènes. Les plans
{001} sont les moins liés : ils donnent un clivage parfait qui détache des lames, auquel s'ajoutent deux autres clivages {210} ; un éclat de barytine présente des angles de 90° et de 78°. Par son baryum, lourd, elle compte parmi les minéraux clairs les plus denses.`,
      intro: `La barytine se forme lorsqu'une eau chargée de baryum rencontre une eau chargée de sulfate.`,
      scenarios: [
        { nom: "Dans un filon",
          texte: `Des eaux chaudes et salées, dépourvues de sulfate, lessivent le baryum des feldspaths et le font remonter par les failles ; au contact
d'une eau plus froide riche en sulfate, la barytine précipite aussitôt, en raison de son insolubilité. Ces filons, fréquemment
associés à la fluorine, ont été exploités dans le Massif central et à Chaillac (Indre) pour les boues de forage.`,
          cond: false, sansDiagramme: FILON, src: [SRC.hanor] },
        { nom: "En concrétions dans un sédiment",
          texte: `Au fond des mers, la barytine se dépose également sous forme de nodules et de lits, là où des eaux de vase riches en baryum
remontent vers l'eau de mer sulfatée. Dans les sables des déserts, elle cristallise entre les grains en « roses des
sables », à l'image du gypse.`,
          cond: false, sansDiagramme: FILON, src: [SRC.hanor] },
      ],
    },

    // ─────────── Célestine ───────────
    celestine: {
      forme: `Elle reprend la structure de la barytine, le strontium remplaçant le baryum : elle présente le même clivage parfait {001}, les mêmes clivages
{210} et les mêmes tablettes. Les deux minéraux forment une série continue ; le strontium, plus léger, abaisse la densité.`,
      intro: `La célestine cristallise principalement dans les roches sédimentaires, sous forme de géodes ou dans les évaporites.`,
      scenarios: [
        { nom: "Dans une géode",
          texte: `Lorsque l'aragonite des coquilles devient calcite, elle libère du strontium ; les saumures en apportent aussi. Ce strontium gagne les marnes et les calcaires, puis cristallise dans les cavités. Les géodes géantes de Sakoany (Madagascar), tapissées de cristaux bleus, sont fendues puis vendues à travers le monde.`,
          cond: false, sansDiagramme: FILON, src: [SRC.hanor] },
      ],
    },

    // ─────────── Anglésite ───────────
    anglesite: {
      forme: `Elle reprend la structure de la barytine, le plomb occupant la place du baryum. Entouré d'un nuage d'électrons, ce plomb lourd lui
confère un éclat adamantin et une densité de 6,3.`,
      intro: `C'est par l'anglésite que commence l'oxydation de la galène.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `Sous l'effet de l'eau de pluie, le soufre de la galène passe à l'état de sulfate, tandis que le plomb reste en place sous forme d'anglésite, souvent en coque autour d'un cœur de galène intact. Si l'eau apporte ensuite du gaz carbonique, l'anglésite se transforme en cérusite. Anglesey (pays de Galles) l'a livrée, et Touissit (Maroc) en a donné de grands cristaux.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Anhydrite ───────────
    anhydrite: {
      sansForme: "Forme non dessinée : les cristaux d'anhydrite sont rares ; elle se présente en masses grenues ou fibreuses, qui se brisent en blocs presque cubiques selon ses trois clivages.",
      forme: `Sans eau, l'anhydrite est un sulfate de calcium : ses tétraèdres SO₄ et ses calciums, entourés de huit oxygènes, forment des colonnes. Ses trois clivages sont presque à angle droit (pseudo-cubiques). Lorsqu'elle rencontre l'eau, elle fixe deux molécules et se mue en gypse, ce qui la fait gonfler d'environ 60 %.`,
      intro: `L'anhydrite se forme à partir du gypse enfoui, ou directement dans les saumures les plus chaudes.`,
      scenarios: [
        { nom: "Un gypse enfoui qui perd son eau",
          texte: `Enfoui sous 1 à 2 km de couches, le gypse déposé dans les lagunes monte en température ; à partir de 45 à 58 °C, selon la salinité de l'eau qui l'imprègne, il perd son eau pour devenir anhydrite. Les évaporites profondes du Keuper et du Muschelkalk sont donc faites d'anhydrite, leurs affleurements étant en gypse.`,
          cond: { type: "anhydrite", chemin: [
            q({ F: 1, T: 28 }, 0, "", { lab: "eau de mer" }),
            q({ F: 3.8, T: 30 }, 1, "Dans une lagune presque fermée, l'eau de mer s'évapore jusqu'à atteindre un facteur de concentration de 3,8 : le sulfate de calcium précipite sous forme de gypse, tant que la saumure reste en dessous de ≈ 47 °C."),
            q({ F: 4, T: 70 }, 2, "Le gypse, enfoui sous 1 à 2 km de couches, perd son eau dès que la température dépasse ≈ 45 à 58 °C : il devient alors anhydrite."),
            q({ F: 0.1, T: 15 }, 3, "Ramenée près de la surface, au contact de l'eau douce, l'anhydrite fixe de nouveau de l'eau et se transforme en gypse en gonflant."),
          ] },
          src: ["hardie"] },
        { nom: "Dans une sebkha brûlante",
          texte: `Aux sebkhas du golfe Persique, près d'Abou Dabi, de l'eau de mer très salée et chauffée à plus de 40 °C s'évapore dans des vases : l'anhydrite y précipite directement, en nodules blancs serrés qui évoquent un grillage.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : se reporter à l'onglet précédent, qui montre la limite gypse-anhydrite selon la température et la salinité." },
      ],
    },

    // ─────────── Epsomite ───────────
    epsomite: {
      sansForme: "Forme non dessinée : l'epsomite se présente en efflorescences, en croûtes et en aiguilles ; ses cristaux naturels sont rares.",
      forme: `Portant sept molécules d'eau, l'epsomite est un sulfate de magnésium : six d'entre elles encadrent le magnésium en octaèdre, la septième flotte entre les ions. Très soluble et au goût amer, le minéral gagne ou perd son eau au gré de l'humidité.`,
      intro: `Une eau riche en magnésium et en sulfate, en s'évaporant, fait cristalliser l'epsomite.`,
      scenarios: [
        { nom: "Efflorescences et lacs salés",
          texte: `On la trouve sur les parois des mines et des grottes sèches, là où l'eau d'infiltration s'évapore après avoir charrié le sulfate issu de la pyrite oxydée et le magnésium des roches ; elle se forme aussi dans les lacs salés magnésiens. Son nom provient de la source d'Epsom (Surrey), où l'on extrayait au XVII<sup>e</sup> siècle le « sel d'Epsom », purgatif.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Mirabilite ───────────
    mirabilite: {
      sansForme: "Forme non dessinée : la mirabilite se présente en croûtes et en efflorescences qui se déshydratent à l'air ; ses cristaux ne durent pas.",
      forme: `Dix molécules d'eau accompagnent le sulfate de sodium de la mirabilite (sel de Glauber) : des octaèdres Na(H₂O)₆ forment des chaînes, et des liaisons hydrogène retiennent sulfate et eau. Au-dessus de 32 °C, elle se dissout dans sa propre eau ; à l'air sec, elle se réduit en poudre de thénardite.`,
      intro: `La mirabilite se dépose lorsqu'une eau riche en sulfate de sodium se refroidit.`,
      scenarios: [
        { nom: "Dans un lac salé qui gèle",
          texte: `Un lac salé chargé de sulfate de sodium dépose la mirabilite en hiver, lorsque l'eau se refroidit, car sa solubilité chute avec la température ; il la redissout en été (Grand lac Salé, lacs de Saskatchewan, golfe de Kara-Bogaz). Ce n'est donc pas l'évaporation, mais le froid, qui déclenche la cristallisation.`,
          cond: false, sansDiagramme: "Aucun diagramme n'est proposé : c'est la baisse de température, et non l'évaporation, qui provoque la cristallisation ; l'atlas ne dispose pas de ce diagramme." },
      ],
    },

    // ─────────── Chalcanthite ───────────
    chalcanthite: {
      sansForme: "Forme non dessinée : la chalcanthite se présente en stalactites, en croûtes et en efflorescences ; les beaux cristaux vendus sont presque tous artificiels.",
      forme: `Cinq molécules d'eau entourent le sulfate de cuivre de la chalcanthite : quatre forment un carré autour du cuivre, deux oxygènes de sulfate se trouvent plus loin et la cinquième reste libre. Très soluble, ce « vitriol bleu » des chimistes blanchit à l'air sec en perdant son eau.`,
      intro: `La chalcanthite se forme par oxydation des sulfures de cuivre, dans les lieux où rien ne la dissout.`,
      scenarios: [
        { nom: "Dans les galeries de mines et les déserts",
          texte: `Ruisselant sur les sulfures de cuivre oxydés, l'eau s'acidifie et se charge en cuivre ; en s'évaporant dans les vieilles galeries, elle forme la chalcanthite, en stalactites et en croûtes bleues. À l'affleurement, elle ne survit que dans les déserts hyperarides, comme à Chuquicamata (Chili).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Alunite ───────────
    alunite: {
      forme: `L'alunite se compose de feuillets d'octaèdres d'aluminium (porteurs de groupes OH) reliés par des tétraèdres SO₄, le potassium occupant l'espace entre les feuillets. Ses cristaux, peu fréquents, prennent la forme de rhomboèdres presque cubiques ; son clivage basal suit ces feuillets.`,
      intro: `L'alunite se forme lorsqu'une eau très acide, chargée d'acide sulfurique, attaque une roche volcanique.`,
      scenarios: [
        { nom: "Dans une roche volcanique altérée par l'acide",
          texte: `Près des volcans, le soufre des gaz donne de l'acide sulfurique au contact de l'eau, et cette eau dissout les feldspaths : il ne reste que silice, alunite et kaolinite (altération « argilique avancée »). Du XV<sup>e</sup> siècle à l'époque moderne, les alunières de Tolfa, près de Rome, ont fourni l'alun qui fixait les teintures ; le Mont-Dore en renferme également.`,
          cond: false, sansDiagramme: OXYD, src: [SRC.stoffregen] },
      ],
    },

    // ─────────── Jarosite ───────────
    jarosite: {
      forme: `La jarosite adopte la structure de l'alunite, le fer ferrique remplaçant l'aluminium : on retrouve les mêmes feuillets
d'octaèdres, les mêmes tétraèdres SO₄ et le même potassium entre les feuillets. C'est le fer qui lui donne sa couleur jaune-brun.`,
      intro: `Ce sont les eaux très acides et oxydantes issues des roches à pyrite qui permettent à la jarosite de se déposer.`,
      scenarios: [
        { nom: "Dans un drainage acide",
          texte: `En s'oxydant, la pyrite produit acide sulfurique et fer. Très acide (pH inférieur à ≈ 3) et oxydante, cette eau garde le fer en Fe³⁺ ; le potassium des argiles s'y ajoute et la jarosite précipite en croûtes jaunes, sur les terrils comme sur les berges des rivières minières. Opportunity l'a repérée sur Mars en 2004 : c'était la trace d'une eau acide ancienne.`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: -0.1, n: 1, t: "En profondeur, la pyrite reste stable, car l'eau est neutre et dépourvue d'oxygène." },
            { pH: 1.5, Eh: 0.95, n: 2, t: "Au contact de l'air, la pyrite s'oxyde et libère de l'acide sulfurique : l'eau devient très acide et oxydante, le fer y demeure dissous à l'état Fe³⁺. En présence de sulfate et de potassium, la jarosite précipite." },
          ], note: "Sans représenter le soufre, le diagramme place la jarosite dans le domaine du Fe³⁺ dissous, en eau acide (pH inférieur à ≈ 3) riche en sulfate." },
          src: [SRC.nordstrom, SRC.stoffregen] },
      ],
    },

    // ─────────── Crocoïte ───────────
    crocoite: {
      forme: `La crocoïte possède la structure de la monazite : tétraèdres CrO₄ isolés, plombs entourés de neuf oxygènes. Sa couleur orange vif tient au chrome hexavalent ; la lumière l'assombrit lentement.`,
      intro: `La crocoïte se forme lorsqu'un filon de plomb oxydé recoupe une roche riche en chrome.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `Le plomb vient de l'oxydation de la galène, le chrome de celle des serpentinites voisines, où il passe à l'état de chromate dans l'eau oxydante. Ces deux éléments se rejoignent alors pour former la crocoïte, à Dundas (Tasmanie) ou à Berezovsk (Oural), où elle fut découverte en 1766.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Wulfénite ───────────
    wulfenite: {
      forme: `La wulfénite présente la structure de la scheelite : tétraèdres MoO₄ isolés et plombs entourés de huit oxygènes, dans une
maille quadratique. Elle croît rapidement selon a et b, lentement selon c, ce qui donne ces plaques carrées et minces qui la
rendent facilement identifiable.`,
      intro: `Dans la zone oxydée de filons plombeux riches en molybdène, la wulfénite se développe.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `Les plaques de wulfénite se forment dans les cavités de Red Cloud (Arizona), Los Lamentos (Mexique) et Mežica (Slovénie), après que la galène et la molybdénite ont libéré plomb et molybdate par oxydation, et que ces éléments se sont recombinés.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Scheelite ───────────
    scheelite: {
      forme: `Des tétraèdres WO₄ isolés et des calciums à huit oxygènes forment la scheelite, dont la maille quadratique est deux fois plus haute que large, d'où les bipyramides presque octaédriques. Élément lourd, le tungstène la rend très dense (6,1) pour un minéral clair.`,
      intro: `Dans un skarn, c'est surtout au contact entre granite et calcaire que naît la scheelite.`,
      scenarios: [
        { nom: "Dans un skarn",
          texte: `Lorsqu'un granite se met en place près de calcaires, les fluides chauds qu'il expulse, chargés de silice, de fer et de tungstène, attaquent le calcaire : grenats et pyroxènes cristallisent, et le calcium capte le tungstène pour former la scheelite. La mine de Salau (Ariège), exploitée de 1971 à 1986, fut l'une des grandes mines de tungstène d'Europe.`,
          cond: { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
            pt(150, 0.12, 1, "Entre 4 et 5 km de profondeur, vers 150 °C, reposent des calcaires."),
            pt(300, 0.12, 2, "En cristallisant, un granite voisin expulse des fluides chauds porteurs de tungstène."),
            pt(550, 0.12, 3, "Avec les grenats, la scheelite cristallise lorsque fluides et calcaire échangent leurs éléments, vers 400 à 650 °C.", { bande: "skarn" }),
            pt(15, 0, 4, "L'érosion dégage le skarn et sa scheelite (Salau, ≈ 295 Ma)."),
          ], note: "Chemin schématique." },
          src: ["tuttle", SRC.einaudi] },
      ],
    },

    // ─────────── Wolframite ───────────
    wolframite: {
      forme: `Chaînes d'octaèdres WO₆ et octaèdres (Fe,Mn)O₆ en zigzag, allongés selon c : telle est la structure de la wolframite. Fer et manganèse se remplacent en toutes proportions, de la ferbérite à la hübnérite. Le clivage parfait {010} et la densité de 7,3 la caractérisent. La structure affichée est celle d'une wolframite riche en fer (ferbérite).`,
      intro: `Ce sont les filons de quartz issus des coupoles granitiques qui accueillent la wolframite.`,
      scenarios: [
        { nom: "Dans un filon de quartz au-dessus d'un granite",
          texte: `En fin de cristallisation, un granite hydraté émet des fluides chargés de tungstène et d'étain ; ils fissurent la coupole ainsi que les roches qui la surmontent. Vers 250 à 400 °C, ils déposent dans ces fractures quartz, wolframite et cassitérite : Enguialès (Aveyron), Montredon (Tarn), Puy-les-Vignes (Haute-Vienne) et l'Erzgebirge.`,
          cond: { type: "silice", tmax: 350, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 350, C: 948, n: 1, t: "Vers 350 °C, la silice et le tungstène sont transportés par les fluides issus du granite." },
              { T: 280, C: 948, n: 2, t: "En remontant dans les fissures, ils se refroidissent et deviennent sursaturés." },
              { T: 250, C: 434, n: 3, t: "Au moment où le quartz du filon se forme, il entraîne avec lui des tablettes noires de wolframite." },
            ],
            note: "Schématique, le chemin tracé sur le diagramme porte sur la silice, qui donne le quartz du filon." },
          src: ["rimstidt", "fournier"] },
      ],
    },
  });
})();
