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
          note: "Tablettes épaisses à contour losangique ou rectangulaire, très lourdes pour un minéral clair (4,5). Groupées en éventail, elles font les « crêtes de coq » ; dans les sables, les « roses des sables » de barytine de l'Oklahoma." },
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
          note: "Tablettes et prismes bleu ciel (d'où son nom, du latin <i>caelestis</i>), tapissant les géodes des calcaires et des marnes." },
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
          note: "Cristaux à l'éclat adamantin, souvent posés dans une cavité de la galène dont ils sont nés. Indices dans les axes de la structure 3D (Pbnm) : la tablette {001} des ouvrages est ici {100}." },
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
          note: "Petits rhomboèdres presque cubiques (angle de 89°), rares : l'alunite forme surtout des masses grenues ou terreuses dans les roches volcaniques altérées." },
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
          note: "Petites tablettes et rhomboèdres jaune-brun, souvent en croûtes scintillantes sur les roches à pyrite altérées." },
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
          note: "Longs prismes orange vif, striés, souvent creux, entrecroisés en buissons (Dundas, Tasmanie). C'est dans la crocoïte de Sibérie que Vauquelin a découvert le chrome en 1797." },
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
          note: "Plaques carrées, minces, orange à jaune miel, aux bords biseautés : Red Cloud (Arizona), Los Lamentos (Mexique), Mežica (Slovénie)." },
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
          note: "Bipyramides presque octaédriques, blanc crème à orangé ; sous une lampe à ultraviolets courts, la scheelite brille en bleu, et c'est ainsi que les prospecteurs la cherchent la nuit." },
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
          note: "Tablettes noires allongées selon c, à l'éclat métallique, plantées dans le quartz des filons." },
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
  const OXYD = "Pas de diagramme : c'est l'oxydation près de la surface et la chimie de l'eau de pluie qui décident.";
  const FILON = "Pas de diagramme : ce qui décide ici, c'est la chimie de l'eau chaude (mélange de deux eaux, sulfate et baryum ou strontium), qu'aucun diagramme de l'atlas ne représente.";

  Object.assign(MIN_F, {

    // ─────────── Barytine ───────────
    barytine: {
      forme: `La barytine est faite de tétraèdres SO₄ isolés et de gros ions baryum, chacun entouré de douze oxygènes. Les plans
        {001} sont les moins liés : clivage parfait, qui détache des lames, et deux autres clivages {210} : un éclat de barytine
        a des angles de 90° et de 78°. Le baryum, lourd, en fait le plus dense des minéraux clairs courants.`,
      intro: `La barytine précipite quand une eau qui porte du baryum rencontre une eau qui porte du sulfate.`,
      scenarios: [
        { nom: "Dans un filon",
          texte: `Le baryum, lessivé des feldspaths par des eaux chaudes et salées sans sulfate, remonte par les failles ; au contact
            d'une eau plus froide riche en sulfate, la barytine précipite aussitôt, tant elle est insoluble. Ces filons, souvent
            avec la fluorine, ont été exploités dans le Massif central et à Chaillac (Indre) pour les boues de forage.`,
          cond: false, sansDiagramme: FILON, src: [SRC.hanor] },
        { nom: "En concrétions dans un sédiment",
          texte: `Au fond de la mer, la barytine précipite aussi en nodules et en lits là où des eaux de la vase riches en baryum
            remontent vers l'eau de mer sulfatée. Dans les sables des déserts, elle cristallise entre les grains en « roses des
            sables », comme le gypse.`,
          cond: false, sansDiagramme: FILON, src: [SRC.hanor] },
      ],
    },

    // ─────────── Célestine ───────────
    celestine: {
      forme: `Même structure que la barytine, avec le strontium à la place du baryum : même clivage parfait {001} et clivages
        {210}, mêmes tablettes. Les deux minéraux forment une série ; le strontium, plus léger, la rend moins dense.`,
      intro: `La célestine cristallise surtout dans les roches sédimentaires, en géodes et dans les évaporites.`,
      scenarios: [
        { nom: "Dans une géode",
          texte: `Le strontium, libéré quand l'aragonite des coquilles se change en calcite, ou apporté par les saumures, migre
            dans les marnes et les calcaires et cristallise dans les cavités. Les géodes géantes de Sakoany (Madagascar),
            tapissées de cristaux bleus, sont fendues et vendues dans le monde entier.`,
          cond: false, sansDiagramme: FILON, src: [SRC.hanor] },
      ],
    },

    // ─────────── Anglésite ───────────
    anglesite: {
      forme: `Même structure que la barytine, avec le plomb à la place du baryum. Le plomb, lourd et entouré d'électrons, lui
        donne un éclat adamantin et une densité de 6,3.`,
      intro: `L'anglésite est le premier produit d'oxydation de la galène.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `L'eau de pluie oxyde le soufre de la galène en sulfate ; le plomb reste sur place en anglésite, souvent en coque
            autour d'un cœur de galène intact. Plus tard, si l'eau apporte du gaz carbonique, l'anglésite se change en
            cérusite. Elle a été décrite à Anglesey (pays de Galles) ; Touissit (Maroc) en a donné de grands cristaux.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Anhydrite ───────────
    anhydrite: {
      sansForme: "Forme non dessinée : les cristaux d'anhydrite sont rares ; elle forme des masses grenues ou fibreuses, qui se cassent en blocs presque cubiques le long de ses trois clivages.",
      forme: `L'anhydrite est un sulfate de calcium sans eau : tétraèdres SO₄ et calciums entourés de huit oxygènes, en colonnes.
        Ses trois clivages sont presque à angle droit (pseudo-cubiques). Au contact de l'eau, elle en reprend deux molécules et
        devient gypse, en gonflant d'environ 60 %.`,
      intro: `L'anhydrite naît du gypse enfoui, ou directement des saumures les plus chaudes.`,
      scenarios: [
        { nom: "Un gypse enfoui qui perd son eau",
          texte: `Le gypse déposé dans les lagunes, enfoui sous 1 à 2 km de couches, chauffe ; au-delà de 45 à 58 °C selon la
            salinité de l'eau qui l'imprègne, il perd son eau et devient anhydrite. C'est pourquoi les évaporites profondes du
            Keuper et du Muschelkalk sont faites d'anhydrite, et leurs affleurements de gypse.`,
          cond: { type: "anhydrite", chemin: [
            q({ F: 1, T: 28 }, 0, "", { lab: "eau de mer" }),
            q({ F: 3.8, T: 30 }, 1, "Dans une lagune presque fermée, l'eau de mer s'évapore jusqu'à × 3,8 : le sulfate de calcium précipite, en gypse tant que la saumure reste sous ≈ 47 °C."),
            q({ F: 4, T: 70 }, 2, "Enfoui sous 1 à 2 km de couches, le gypse chauffe : au-delà de ≈ 45–58 °C, il perd son eau et devient anhydrite."),
            q({ F: 0.1, T: 15 }, 3, "Ramenée près de la surface, au contact de l'eau douce, l'anhydrite reprend de l'eau et regonfle en gypse."),
          ] },
          src: ["hardie"] },
        { nom: "Dans une sebkha brûlante",
          texte: `Sur les côtes du golfe Persique (Abou Dabi), l'eau de mer qui s'évapore dans les vases des sebkhas, à plus de
            40 °C et très salée, dépose directement l'anhydrite, en nodules blancs serrés comme un grillage.`,
          cond: false, sansDiagramme: "Pas de diagramme : voir l'onglet précédent, qui montre la limite gypse–anhydrite selon la température et la salinité." },
      ],
    },

    // ─────────── Epsomite ───────────
    epsomite: {
      sansForme: "Forme non dessinée : l'epsomite forme des efflorescences, des croûtes et des aiguilles ; ses cristaux naturels sont rares.",
      forme: `L'epsomite est un sulfate de magnésium à sept molécules d'eau : six entourent le magnésium en octaèdre, la
        septième est libre entre les ions. Très soluble, au goût amer, elle perd et reprend son eau avec l'humidité de l'air.`,
      intro: `L'epsomite cristallise là où une eau riche en magnésium et en sulfate s'évapore.`,
      scenarios: [
        { nom: "Efflorescences et lacs salés",
          texte: `Sur les parois des mines et des grottes sèches, quand l'eau d'infiltration, chargée du sulfate de la pyrite
            oxydée et du magnésium des roches, s'évapore ; et dans les lacs salés magnésiens. Elle doit son nom à la source
            d'Epsom (Surrey), dont on tirait au XVII<sup>e</sup> siècle le « sel d'Epsom » purgatif.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Mirabilite ───────────
    mirabilite: {
      sansForme: "Forme non dessinée : la mirabilite forme des croûtes et des efflorescences qui se déshydratent à l'air ; ses cristaux sont éphémères.",
      forme: `La mirabilite (sel de Glauber) est un sulfate de sodium à dix molécules d'eau : chaînes d'octaèdres Na(H₂O)₆, ions
        sulfate et molécules d'eau tenues par des liaisons hydrogène. Au-dessus de 32 °C, elle se dissout dans sa propre eau ;
        à l'air sec, elle devient une poudre de thénardite.`,
      intro: `La mirabilite précipite quand une eau riche en sulfate de sodium se refroidit.`,
      scenarios: [
        { nom: "Dans un lac salé qui gèle",
          texte: `Sa solubilité baisse beaucoup avec la température : un lac salé chargé de sulfate de sodium la dépose en hiver,
            quand l'eau se refroidit, et la redissout l'été (Grand lac Salé, lacs de Saskatchewan, golfe de Kara-Bogaz). Ce
            n'est pas l'évaporation, mais le froid, qui la fait cristalliser.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est la baisse de température, et non l'évaporation, qui la fait cristalliser ; l'atlas n'a pas ce diagramme." },
      ],
    },

    // ─────────── Chalcanthite ───────────
    chalcanthite: {
      sansForme: "Forme non dessinée : la chalcanthite forme des stalactites, des croûtes et des efflorescences ; les beaux cristaux vendus sont presque tous artificiels.",
      forme: `La chalcanthite est un sulfate de cuivre à cinq molécules d'eau : quatre entourent le cuivre en carré, avec deux
        oxygènes de sulfate plus loin, la cinquième est libre. C'est le « vitriol bleu » des chimistes, très soluble ; à l'air
        sec, il perd son eau et blanchit.`,
      intro: `La chalcanthite naît de l'oxydation des sulfures de cuivre, là où rien ne la dissout.`,
      scenarios: [
        { nom: "Dans les galeries de mines et les déserts",
          texte: `L'eau qui ruisselle sur les sulfures de cuivre oxydés s'acidifie et se charge en cuivre ; en s'évaporant, elle
            dépose la chalcanthite en stalactites et en croûtes bleues dans les vieilles galeries. Elle ne subsiste à
            l'affleurement que dans les déserts hyper-arides, comme à Chuquicamata (Chili).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Alunite ───────────
    alunite: {
      forme: `L'alunite est faite de feuillets d'octaèdres d'aluminium (avec des OH) reliés par des tétraèdres SO₄, et de
        potassium entre les feuillets. Ses cristaux, rares, sont des rhomboèdres presque cubiques ; son clivage basal suit les
        feuillets.`,
      intro: `L'alunite naît de l'attaque d'une roche volcanique par une eau très acide, chargée d'acide sulfurique.`,
      scenarios: [
        { nom: "Dans une roche volcanique altérée par l'acide",
          texte: `Près des volcans, le soufre des gaz s'oxyde en acide sulfurique au contact de l'eau ; cette eau dissout les
            feldspaths et ne laisse que de la silice, de l'alunite et de la kaolinite (altération « argilique avancée »). Les
            alunières de Tolfa, près de Rome, ont fourni du XV<sup>e</sup> siècle à l'époque moderne l'alun qui fixait les
            teintures ; le Mont-Dore en contient.`,
          cond: false, sansDiagramme: OXYD, src: [SRC.stoffregen] },
      ],
    },

    // ─────────── Jarosite ───────────
    jarosite: {
      forme: `La jarosite a la structure de l'alunite, avec le fer ferrique à la place de l'aluminium : mêmes feuillets
        d'octaèdres, mêmes tétraèdres SO₄, même potassium entre les feuillets. Le fer la colore en jaune-brun.`,
      intro: `La jarosite précipite dans les eaux très acides et oxydantes qui coulent des roches à pyrite.`,
      scenarios: [
        { nom: "Dans un drainage acide",
          texte: `Quand la pyrite s'oxyde, elle libère de l'acide sulfurique et du fer. Dans cette eau très acide (pH sous ≈ 3)
            et oxydante, le fer reste dissous en Fe³⁺ ; avec le potassium des argiles, il précipite en jarosite, en croûtes jaunes
            sur les terrils et les berges des rivières minières. Le robot Opportunity en a trouvé sur Mars en 2004 : la preuve
            d'une eau acide passée.`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: -0.1, n: 1, t: "En profondeur, la pyrite est stable : l'eau est neutre et sans oxygène." },
            { pH: 1.5, Eh: 0.95, n: 2, t: "À l'air, la pyrite s'oxyde et libère de l'acide sulfurique : l'eau devient très acide et oxydante, le fer y reste dissous en Fe³⁺. Avec le sulfate et le potassium, la jarosite précipite." },
          ], note: "Le diagramme ne trace pas le soufre : la jarosite se forme dans le domaine du Fe³⁺ dissous, en eau acide (pH sous ≈ 3) riche en sulfate." },
          src: [SRC.nordstrom, SRC.stoffregen] },
      ],
    },

    // ─────────── Crocoïte ───────────
    crocoite: {
      forme: `La crocoïte a la structure de la monazite : tétraèdres CrO₄ isolés et plombs entourés de neuf oxygènes. Le chrome
        hexavalent lui donne son orange vif ; la lumière l'assombrit lentement.`,
      intro: `La crocoïte naît quand un filon de plomb oxydé traverse une roche riche en chrome.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `L'oxydation de la galène libère le plomb ; celle des serpentinites voisines libère le chrome, qui passe en chromate
            dans l'eau oxydante. Les deux se rencontrent et la crocoïte cristallise : Dundas (Tasmanie), Berezovsk (Oural), où
            elle a été découverte en 1766.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Wulfénite ───────────
    wulfenite: {
      forme: `La wulfénite a la structure de la scheelite : tétraèdres MoO₄ isolés et plombs entourés de huit oxygènes, dans une
        maille quadratique. Elle pousse vite selon a et b, lentement selon c : d'où les plaques carrées, minces, qui la
        rendent si reconnaissable.`,
      intro: `La wulfénite se forme dans la zone oxydée des filons de plomb qui contiennent du molybdène.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `L'oxydation de la galène et de la molybdénite libère plomb et molybdate, qui se recombinent en plaques de
            wulfénite dans les cavités : Red Cloud (Arizona), Los Lamentos (Mexique), Mežica (Slovénie).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Scheelite ───────────
    scheelite: {
      forme: `La scheelite est faite de tétraèdres WO₄ isolés et de calciums entourés de huit oxygènes, dans une maille
        quadratique deux fois plus haute que large : d'où les bipyramides presque octaédriques. Le tungstène, lourd, la rend
        très dense (6,1) pour un minéral clair.`,
      intro: `La scheelite naît surtout au contact d'un granite et d'un calcaire (skarn).`,
      scenarios: [
        { nom: "Dans un skarn",
          texte: `Un granite se met en place près de calcaires ; les fluides chauds qu'il libère, chargés de silice, de fer et de
            tungstène, réagissent avec le calcaire : grenats et pyroxènes cristallisent, et le tungstène se fixe avec le calcium en
            scheelite. Salau (Ariège), exploitée de 1971 à 1986, fut l'une des grandes mines de tungstène d'Europe.`,
          cond: { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
            pt(150, 0.12, 1, "Des calcaires reposent à 4–5 km de profondeur, vers 150 °C."),
            pt(300, 0.12, 2, "Un granite s'injecte tout près et libère, en cristallisant, des fluides chauds chargés de tungstène."),
            pt(550, 0.12, 3, "Vers 400–650 °C, fluides et calcaire échangent leurs éléments ; la scheelite cristallise avec les grenats.", { bande: "skarn" }),
            pt(15, 0, 4, "L'érosion met au jour le skarn et sa scheelite (Salau, ≈ 295 Ma)."),
          ], note: "Chemin schématique." },
          src: ["tuttle", SRC.einaudi] },
      ],
    },

    // ─────────── Wolframite ───────────
    wolframite: {
      forme: `La wolframite est faite de chaînes d'octaèdres WO₆ et d'octaèdres (Fe,Mn)O₆ en zigzag, allongées selon c. Fer et
        manganèse se remplacent en toutes proportions, de la ferbérite à la hübnérite. Clivage parfait {010}, densité de 7,3.
        La structure affichée est celle d'une wolframite riche en fer (ferbérite).`,
      intro: `La wolframite se dépose dans les filons de quartz qui s'échappent des coupoles granitiques.`,
      scenarios: [
        { nom: "Dans un filon de quartz au-dessus d'un granite",
          texte: `En fin de cristallisation, un granite riche en eau libère des fluides chargés de tungstène et d'étain, qui
            fracturent sa coupole et la roche au-dessus. Vers 250–400 °C, ils déposent dans ces fissures du quartz, de la
            wolframite et de la cassitérite : Enguialès (Aveyron), Montredon (Tarn), Puy-les-Vignes (Haute-Vienne), et
            l'Erzgebirge.`,
          cond: { type: "silice", tmax: 350, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 350, C: 948, n: 1, t: "Vers 350 °C, les fluides issus du granite portent silice et tungstène." },
              { T: 280, C: 948, n: 2, t: "Ils montent dans les fissures et se refroidissent : ils sont sursaturés." },
              { T: 250, C: 434, n: 3, t: "Le quartz du filon cristallise ; la wolframite se dépose avec lui, en tablettes noires." },
            ],
            note: "Le diagramme montre la silice, qui forme le quartz du filon. Chemin schématique." },
          src: ["rimstidt", "fournier"] },
      ],
    },
  });
})();
