// ============================================================
// CLASSE V — carbonates et nitrates : formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026
// Chargé après sulfures-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js).
// La calcite a été faite en F.3 (cristal.js, mineraux-formation.js) : elle n'est pas reprise ici.
// Carbonates rhomboédriques : le rhomboèdre de clivage est {10-14} dans la maille hexagonale de la structure (comme la
// calcite). Groupe de l'aragonite (aragonite, cérusite, strontianite, withérite, nitre) : maille Pmcn des ouvrages = celle du CIF.
// Non dessinés : withérite (toujours maclée en fausses bipyramides), malachite, nitratine, nitre.
// ============================================================

(function () {
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  const RHOMBO = [{ sym: "r", hkl: [1, 0, -1, 4], nom: "rhomboèdre", d: 1.0 }];
  const CLIV_R = [{ hkl: [1, 0, -1, 4], qualite: "parfait", nom: "trois directions, rhomboèdre", pas: 0.24 }];
  const rhomboedrique = (nom, couleur, a, c, cod, classe, note, plus) => Object.assign({
    nom, couleur, systeme: "trigonal (rhomboédrique)", classe, classeNom: classe === "-3" ? "rhomboédrique" : "scalénoédrique hexagonale",
    reseau: "R", maille: HEX(a, c), mailleSource: cod,
    facies: [{ nom: "Rhomboèdre", azimut: 42, elevation: 17, formes: RHOMBO, note }],
    clivages: CLIV_R,
  }, plus || {});

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {
    magnesite: rhomboedrique("Magnésite", "#ecebe6", 4.6328, 15.0129, "cod9017360", "-3m",
      "Les cristaux de magnésite sont rares : des rhomboèdres comme celui-ci, qui est aussi la forme de son clivage. Elle se trouve surtout en masses blanches, compactes, à cassure de porcelaine."),
    siderite: rhomboedrique("Sidérite", "#a7804e", 4.6916, 15.3796, "cod9017361", "-3m",
      "Rhomboèdres brun miel, souvent aux faces courbes, groupés en « selles » dans les géodes des filons. Le rhomboèdre est aussi la forme du clivage."),
    rhodochrosite: rhomboedrique("Rhodochrosite", "#d97a8c", 4.7682, 15.6354, "cod9017358", "-3m",
      "Rhomboèdres rose framboise, transparents dans les plus beaux gisements (Sweet Home, Colorado) ; le plus souvent, elle forme des croûtes et des stalactites zonées."),
    smithsonite: rhomboedrique("Smithsonite", "#b9cfc2", 4.6526, 15.0257, "cod9017357", "-3m",
      "Les cristaux de smithsonite sont petits et rares, aux faces courbes ; elle forme surtout des croûtes mamelonnées. Le rhomboèdre dessiné est celui de son clivage."),
    dolomite: rhomboedrique("Dolomite", "#e8dfd0", 4.8033, 15.984, "cod9000573", "-3",
      "Rhomboèdres aux faces souvent courbes, en « selle de cheval » : les plans de calcium et de magnésium, de tailles différentes, ne s'accordent pas parfaitement et le réseau se tord en grandissant. Moins symétrique que la calcite (classe 3̄), elle n'a pas de scalénoèdre."),
    ankerite: rhomboedrique("Ankérite", "#d8c3a0", 4.824, 16.1217, "cod9001246", "-3",
      "Rhomboèdres aux faces courbes, comme la dolomite dont elle est la sœur ferrifère ; elle brunit en surface quand son fer s'oxyde."),

    // ─────────── Aragonite ───────────
    aragonite: {
      nom: "Aragonite", couleur: "#e9e2d6", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.9616, 7.9705, 5.7394, 90, 90, 90], mailleSource: "cod9000229", azimut: 24, elevation: 14,
      macleNote: "Macles cycliques sur {110} : trois individus soudés à ≈ 120° donnent des prismes pseudo-hexagonaux, ceux de Molina de Aragón (non dessinés).",
      facies: [
        { nom: "Aiguille",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.05 },
            { sym: "k", hkl: [0, 1, 1], nom: "dôme aigu", d: 3.2 },
          ],
          note: "Aiguilles et baguettes terminées en biseau : la forme des cristaux qui poussent dans les sources chaudes et les grottes (fleurs de fer, en buissons)." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "net", nom: "{010}", pas: 0.24 }],
    },

    // ─────────── Cérusite ───────────
    cerusite: {
      nom: "Cérusite", couleur: "#eeeae0", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [5.18324, 8.4992, 6.14746, 90, 90, 90], mailleSource: "cod9013803", azimut: 24, elevation: 16,
      macleNote: "Macles sur {110}, souvent répétées : étoiles à six branches et réseaux de lames entrecroisées à 60°, la signature de la cérusite (non dessinées).",
      facies: [
        { nom: "Tablette",
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.5 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.15 },
            { sym: "x", hkl: [0, 1, 2], nom: "dôme", d: 0.75 },
          ],
          note: "Tablettes aplaties selon b, à l'éclat adamantin : la densité (6,6) et l'éclat la distinguent d'un premier coup d'œil des autres minéraux blancs." },
      ],
      clivages: [{ hkl: [1, 1, 0], qualite: "net", nom: "{110}", pas: 0.24 }],
    },

    // ─────────── Strontianite ───────────
    strontianite: {
      nom: "Strontianite", couleur: "#e6efe2", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [5.107499, 8.41382, 6.026924, 90, 90, 90], mailleSource: "cod9013802", azimut: 24, elevation: 14,
      facies: [
        { nom: "Prisme aciculaire",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 2.6 },
          ],
          note: "Prismes allongés en pointe, souvent en gerbes rayonnantes, blancs à vert pâle." },
      ],
      clivages: [{ hkl: [1, 1, 0], qualite: "net", nom: "{110}", pas: 0.24 }],
    },

    // ─────────── Azurite ───────────
    azurite: {
      nom: "Azurite", couleur: "#1f4fa8", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [5.011, 5.85, 10.353, 90, 92.41, 90], mailleSource: "cod9007013", azimut: 24, elevation: 16,
      facies: [
        { nom: "Tablette",
          formes: [
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.55 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.05 },
          ],
          note: "Tablettes épaisses bleu profond, groupées en rosettes ; les cristaux de Chessy, en boules de cristaux, ont fait connaître le minéral." },
      ],
      clivages: [{ hkl: [0, 1, 1], qualite: "net", nom: "{011}", pas: 0.24 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const q = (o, n, t, x) => Object.assign({}, o, n ? { n } : {}, t ? { t } : {}, x || {});
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    hansen: "Hansen L. D. et al. (2005). « Carbonated serpentinite (listwanite) at Atlin, British Columbia: a geological analogue to carbon dioxide sequestration ». <i>Canadian Mineralogist</i> 43, p. 225–239.",
    reichenberg: "Reichert J. et Borg G. (2008). « Numerical simulation and a geochemical model of supergene carbonate-hosted non-sulphide zinc deposits ». <i>Ore Geology Reviews</i> 33, p. 134–151.",
    ericksen: "Ericksen G. E. (1983). « The Chilean nitrate deposits ». <i>American Scientist</i> 71, p. 366–374.",
    morse: "Morse J. W., Arvidson R. S. et Lüttge A. (2007). « Calcium carbonate formation and dissolution ». <i>Chemical Reviews</i> 107, p. 342–381 (aragonite des eaux riches en magnésium).",
    williams: "Williams P. A. (1990). <i>Oxide Zone Geochemistry</i>. Ellis Horwood (malachite et azurite selon la pression de CO₂).",
  };
  const FILON = "Pas de diagramme : ce qui décide ici, c'est la chimie de l'eau chaude (gaz carbonique, métaux dissous), qu'aucun diagramme de l'atlas ne représente.";
  const OXYD = "Pas de diagramme : c'est l'oxydation près de la surface, au-dessus de la nappe, et la chimie de l'eau de pluie qui décident.";

  Object.assign(MIN_F, {

    // ─────────── Magnésite ───────────
    magnesite: {
      forme: `Même structure que la calcite : plans de magnésium et plans de groupes CO₃ triangulaires, couchés à plat. Le
        magnésium, plus petit que le calcium, resserre la maille (4,63 Å au lieu de 4,99) et rend le minéral plus dur et
        plus dense. Même clivage en rhomboèdre ; mais à froid, elle ne fait presque pas effervescence avec l'acide.`,
      intro: `La magnésite naît surtout de l'altération des roches du manteau par une eau riche en gaz carbonique.`,
      scenarios: [
        { nom: "Dans une serpentinite traversée par du CO₂",
          texte: `Une eau chargée de gaz carbonique qui circule dans une serpentinite transforme le silicate de magnésium en
            magnésite et en silice : des veines blanches, en réseau, et parfois des amas exploités pour la magnésie
            réfractaire (Grèce, Slovaquie, Australie). La même réaction est étudiée pour stocker le CO₂ dans les roches.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est la quantité de gaz carbonique apportée par l'eau qui décide, à basse température.",
          src: [SRC.hansen] },
      ],
    },

    // ─────────── Sidérite ───────────
    siderite: {
      forme: `Structure de la calcite, avec le fer à la place du calcium : même rhomboèdre de clivage. Le fer y est ferreux
        (Fe²⁺) : à l'air, il s'oxyde, et les cristaux brunissent en surface puis se changent en goethite.`,
      intro: `La sidérite précipite là où le fer est dissous sous forme Fe²⁺, sans oxygène, en présence de carbonate.`,
      scenarios: [
        { nom: "Dans une vase sans oxygène",
          texte: `Dans les marécages côtiers et les boues des deltas, l'eau manque d'oxygène mais pas de gaz carbonique : le fer
            reste dissous (Fe²⁺) et, quand il n'y a pas assez de soufre pour faire de la pyrite, il précipite en sidérite, en
            nodules et en lits. Les « minerais de fer des houillères » (blackband) en sont faits.`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: 0.45, n: 1, t: "En surface, l'eau est oxydante : le fer ne reste pas dissous, il précipite en oxydes." },
            { pH: 6.3, Eh: -0.3, n: 2, t: "Dans la vase, sans oxygène, le fer passe en Fe²⁺ dissous ; avec le gaz carbonique de la matière organique en décomposition, il précipite en sidérite." },
          ], note: "Le diagramme ne trace pas le carbone : la sidérite se forme dans le domaine du Fe²⁺ dissous quand l'eau contient assez de carbonate et peu de soufre." }, },
        { nom: "Dans un filon",
          texte: `Elle forme aussi la gangue de nombreux filons, en rhomboèdres brun miel : le « fer spathique » d'Allevard
            (Isère), exploité pour l'acier depuis le Moyen Âge.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Rhodochrosite ───────────
    rhodochrosite: {
      forme: `Structure de la calcite, avec le manganèse à la place du calcium. Le rose vient du manganèse lui-même
        (Mn²⁺) ; un peu de calcium ou de fer le pâlit ou le brunit.`,
      intro: `La rhodochrosite se dépose dans les filons riches en manganèse.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Avec la galène, la blende et le quartz, dans les filons de moyenne à basse température : Sweet Home
            (Colorado), Capillitas (Argentine), où elle forme des stalactites zonées, taillées en tranches.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Smithsonite ───────────
    smithsonite: {
      forme: `Structure de la calcite, avec le zinc à la place du calcium : maille resserrée, dureté de 4 à 4,5. Les cristaux
        sont rares : elle pousse surtout en croûtes mamelonnées, aux couleurs variées selon les traces de cuivre (vert,
        bleu), de cobalt (rose) ou de cadmium (jaune).`,
      intro: `La smithsonite naît de l'oxydation de la blende dans les calcaires.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement de zinc",
          texte: `Près de la surface, l'eau de pluie oxyde la blende ; le zinc dissous rencontre le calcaire encaissant et
            précipite en carbonate. Ces « calamines » ont été les premiers minerais de zinc exploités : Moresnet (Belgique),
            Les Malines (Gard).`,
          cond: false, sansDiagramme: OXYD, src: [SRC.reichenberg] },
      ],
    },

    // ─────────── Aragonite ───────────
    aragonite: {
      forme: `L'aragonite a la même formule que la calcite mais un autre arrangement : les calciums sont empilés de façon plus
        serrée, chacun entouré de neuf oxygènes (six dans la calcite). Elle est plus dense (2,95 contre 2,71) et n'est stable
        qu'à haute pression ; à la surface, elle se change lentement en calcite. Pas de clivage en rhomboèdre : les cristaux
        sont des aiguilles ou des prismes.`,
      intro: `L'aragonite naît des êtres vivants, des eaux riches en magnésium, et, plus rarement, de la haute pression.`,
      scenarios: [
        { nom: "Dans les coquilles et la nacre",
          texte: `Coraux, mollusques et algues vertes bâtissent leur squelette en aragonite, bien qu'elle ne soit pas stable :
            dans l'eau de mer, le magnésium gêne la croissance de la calcite et favorise l'aragonite. Nacre et perles sont
            des empilements de plaquettes d'aragonite. Après la mort, elle se change en calcite en quelques milliers à
            quelques millions d'années.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est l'organisme, et le magnésium de l'eau de mer, qui choisissent l'aragonite.",
          src: [SRC.morse] },
        { nom: "Dans une source chaude",
          texte: `Les sources chaudes riches en magnésium et en gaz carbonique déposent l'aragonite en aiguilles et en
            pisolithes, comme à Karlovy Vary (République tchèque).`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est la chimie de l'eau, et non la pression, qui fait l'aragonite ici." },
        { nom: "Dans un schiste bleu",
          texte: `Enfoui très vite dans une zone de subduction, un calcaire passe à haute pression et basse température : la
            calcite y devient aragonite, la forme stable. Elle ne se conserve que si la roche remonte froide ; sinon, elle
            redevient calcite.`,
          cond: { type: "meta", echelle: "hp", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Un calcaire du fond océanique est entraîné dans la subduction."),
            pt(350, 1.0, 2, "À ≈ 1 GPa (30 km) et 350 °C seulement, la calcite devient aragonite.", { bande: "aragonite" }),
            pt(150, 0.2, 3, "La roche remonte en restant froide : l'aragonite n'a pas le temps de redevenir calcite."),
          ], note: "Chemin schématique. Limite calcite–aragonite ≈ 0,5 GPa à 100 °C, ≈ 0,9 GPa à 400 °C." },
          src: ["pattison"] },
      ],
    },

    // ─────────── Cérusite ───────────
    cerusite: {
      forme: `La cérusite a la structure de l'aragonite, le plomb à la place du calcium : chaque plomb entouré de neuf oxygènes.
        Le plomb, lourd, la rend très dense (6,6) et lui donne un éclat adamantin. Sa maille est presque hexagonale (b ≈ a√3),
        d'où les macles à 60° en étoiles et en réseaux.`,
      intro: `La cérusite naît de l'oxydation de la galène.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `Près de la surface, l'eau de pluie, chargée de gaz carbonique, oxyde la galène ; le plomb libéré précipite sur
            place en cérusite, souvent avec l'anglésite et la pyromorphite. Tsumeb (Namibie) et Broken Hill en ont donné des
            réseaux de cristaux de plusieurs centimètres.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Strontianite ───────────
    strontianite: {
      forme: `Structure de l'aragonite, avec le strontium à la place du calcium. Elle a donné son nom au strontium, découvert
        dans des échantillons de Strontian (Écosse) en 1790.`,
      intro: `La strontianite se dépose dans les filons et les géodes de basse température.`,
      scenarios: [
        { nom: "Dans un filon ou une géode",
          texte: `Avec la calcite, la barytine et la célestine, dans les filons de basse température et les géodes des calcaires
            et des marnes (Westphalie, Strontian).`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Withérite ───────────
    witherite: {
      sansForme: "Forme non dessinée : la withérite est toujours maclée par trois, en fausses bipyramides hexagonales, que le moteur ne sait pas dessiner.",
      forme: `Structure de l'aragonite, avec le baryum à la place du calcium : le plus gros cation de la famille, qui écarte la
        maille. Comme la cérusite, sa maille est presque hexagonale, et ses cristaux, toujours maclés par trois, imitent des
        bipyramides hexagonales.`,
      intro: `La withérite se dépose dans les filons de basse température à baryum.`,
      scenarios: [
        { nom: "Dans un filon à galène et barytine",
          texte: `Rare : elle se forme quand le baryum arrive sans sulfate (sinon c'est la barytine). Alston Moor et Settlingstones
            (nord de l'Angleterre) en ont été les gisements classiques. Elle est toxique, contrairement à la barytine.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Dolomite ───────────
    dolomite: {
      forme: `La dolomite est une calcite dont un plan de calcium sur deux est remplacé par un plan de magnésium. Cet ordre
        abaisse la symétrie (classe 3̄) ; les deux cations, de tailles différentes, tordent le réseau, d'où les cristaux en selle.
        Même clivage en rhomboèdre que la calcite ; mais à froid, elle ne fait presque pas effervescence avec l'acide dilué.`,
      intro: `La dolomite se forme surtout en transformant un calcaire au contact d'une eau riche en magnésium.`,
      scenarios: [
        { nom: "Dans une lagune qui s'évapore",
          texte: `Quand l'eau de mer s'évapore, le gypse retire du calcium et la saumure s'enrichit en magnésium. Plus dense, elle
            s'infiltre dans les boues calcaires ; son magnésium y remplace la moitié du calcium et la calcite devient
            dolomite : les dolomies du Jurassique des Causses.`,
          cond: { type: "mgca", chemin: [
            q({ F: 1.2, R: 5.13 }, 1, "Dans une lagune chaude, l'eau de mer (magnésium ÷ calcium ≈ 5) dépose des boues calcaires."),
            q({ F: 3.8, R: 5.13 }),
            q({ F: 6, R: 10 }, 2, "L'évaporation concentre l'eau ; dès × 3,8, le gypse cristallise et retire du calcium : le rapport magnésium ÷ calcium dépasse 10."),
            q({ F: 6, R: 3 }, 3, "La saumure s'infiltre dans les boues calcaires : la calcite devient dolomite, et la saumure, appauvrie en magnésium, voit son rapport retomber."),
          ] }, },
        { nom: "Dans un filon (dolomite en selle)",
          texte: `Les saumures chaudes des bassins, qui déposent aussi galène et blende, déposent la dolomite en rhomboèdres courbes
            dans les cavités : la dolomite « baroque » des gisements des Causses.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Ankérite ───────────
    ankerite: {
      forme: `L'ankérite est une dolomite dont une partie du magnésium est remplacée par du fer (plus de fer que de magnésium).
        Même structure ordonnée, même clivage en rhomboèdre, mêmes faces courbes.`,
      intro: `L'ankérite est la gangue carbonatée des filons aurifères et une phase des carbonates de fer sédimentaires.`,
      scenarios: [
        { nom: "Dans un filon de quartz aurifère",
          texte: `Les eaux chaudes riches en gaz carbonique des filons d'or des chaînes de montagnes transforment la roche autour
            du filon : les silicates de fer et de magnésium deviennent ankérite. Cette auréole blanchâtre, rouillée en surface,
            guide les prospecteurs.`,
          cond: false, sansDiagramme: FILON, src: ["Groves D. I., Goldfarb R. J. et al. (1998). « Orogenic gold deposits ». <i>Ore Geology Reviews</i> 13, p. 7–27."] },
      ],
    },

    // ─────────── Malachite ───────────
    malachite: {
      sansForme: "Forme non dessinée : la malachite forme rarement des cristaux (aiguilles) ; elle pousse en masses mamelonnées à bandes concentriques.",
      forme: `La malachite associe des chaînes d'octaèdres de cuivre, liées par des groupes CO₃ et des OH. Elle croît en fibres
        serrées, rangées en rayons autour de petits centres : en grandissant, les couches successives dessinent les bandes
        claires et sombres que révèle le polissage.`,
      intro: `La malachite naît de l'altération des minerais de cuivre près de la surface, sous un climat assez humide.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement de cuivre",
          texte: `L'eau de pluie, chargée de gaz carbonique, oxyde la chalcopyrite ; le cuivre dissous précipite en malachite,
            surtout au contact d'un calcaire qui neutralise l'acidité. Elle est stable sous la pression de gaz carbonique de
            l'air ; plus riche en gaz carbonique, l'eau dépose l'azurite, qui se change en malachite quand il diminue. Chessy
            (Rhône) et l'Oural (pierre des palais des tsars) en sont célèbres.`,
          cond: false, sansDiagramme: OXYD, src: [SRC.williams] },
      ],
    },

    // ─────────── Azurite ───────────
    azurite: {
      forme: `L'azurite associe des cuivres entourés de quatre oxygènes en carré, des groupes CO₃ et des OH. Elle contient plus
        de carbonate que la malachite : il lui faut une eau plus riche en gaz carbonique. Son bleu, qui a donné son nom, a
        servi de pigment aux peintres du Moyen Âge.`,
      intro: `L'azurite se forme dans la zone oxydée des gisements de cuivre, quand l'eau est riche en gaz carbonique.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement de cuivre",
          texte: `Comme la malachite, mais là où l'eau est plus chargée en gaz carbonique (contact d'un calcaire, roche peu
            perméable). Quand le gaz carbonique diminue, elle se change en malachite en gardant sa forme : on trouve des cristaux
            d'azurite à moitié verts. Chessy (Rhône) en a livré les boules de cristaux qui ont fait le tour des musées
            (« chessylite »).`,
          cond: false, sansDiagramme: OXYD, src: [SRC.williams] },
      ],
    },

    // ─────────── Nitratine ───────────
    nitratine: {
      sansForme: "Forme non dessinée : la nitratine forme des croûtes et des masses grenues ; ses cristaux naturels sont rares.",
      forme: `La nitratine a la structure de la calcite, avec le sodium à la place du calcium et des groupes NO₃ à la place
        des CO₃ : mêmes triangles couchés, même clivage en rhomboèdre, même double réfraction très forte. Elle est très
        soluble : il suffit de quelques pluies pour la faire disparaître.`,
      intro: `La nitratine ne subsiste que dans le désert le plus sec du monde.`,
      scenarios: [
        { nom: "Dans un désert hyper-aride",
          texte: `Dans le désert d'Atacama, l'azote de l'air, fixé par la foudre et les réactions dans l'atmosphère, se dépose en
            nitrates depuis des millions d'années ; comme il ne pleut presque jamais, rien ne les lessive, et ils s'accumulent
            sous la surface en croûtes (caliche) avec le sel et le gypse. Ce « salpêtre du Chili » a été l'engrais et la
            poudre du monde jusqu'aux années 1920.`,
          cond: { type: "climat", domaines: [[10, 25, 0, 0.05]], etiquettes: [["nitrates", 17.5, 0.18]], villes: ["Perpignan", "Montpellier"], chemin: [
            { T: 17, ai: 0.01, n: 1, t: "Désert d'Atacama : ≈ 17 °C, quelques millimètres de pluie par an, moins de 1 % de l'ETP." },
            { n: 2, t: "Les nitrates tombés de l'atmosphère ne sont pas lessivés et s'accumulent sous la surface, depuis des millions d'années." },
          ], note: "Domaine schématique : sous ≈ 5 % de l'ETP. Plus humide, la pluie dissout les nitrates." },
          src: ["h5", SRC.ericksen] },
      ],
    },

    // ─────────── Nitre ───────────
    nitre: {
      sansForme: "Forme non dessinée : le nitre forme des efflorescences et des aiguilles, rarement des cristaux mesurables.",
      forme: `Le nitre a la structure de l'aragonite, avec le potassium à la place du calcium et des groupes NO₃ à la place
        des CO₃. Très soluble, il ne se conserve qu'à l'abri de la pluie.`,
      intro: `Le nitre se forme là où des bactéries transforment l'azote de la matière organique, à l'abri de la pluie.`,
      scenarios: [
        { nom: "Sur les murs et dans les grottes",
          texte: `Dans les caves, les étables et les grottes à guano, des bactéries changent l'ammoniac en nitrates, qui remontent
            avec l'humidité et cristallisent en surface. Jusqu'au XIX<sup>e</sup> siècle, des « salpêtriers » grattaient ces
            murs pour la poudre à canon.`,
          cond: false, sansDiagramme: "Pas de diagramme : ce sont les bactéries et la matière organique qui décident." },
      ],
    },
  });
})();
