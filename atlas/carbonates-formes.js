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
      "Les cristaux de magnésite restent rares : ce sont des rhomboèdres, forme que reprend aussi le clivage. Le minéral se présente surtout en masses blanches et compactes, à cassure de porcelaine."),
    siderite: rhomboedrique("Sidérite", "#a7804e", 4.6916, 15.3796, "cod9017361", "-3m",
      "Des rhomboèdres brun miel, aux faces souvent courbes, s'assemblent en « selles » dans les géodes des filons. Cette même forme caractérise aussi le clivage."),
    rhodochrosite: rhomboedrique("Rhodochrosite", "#d97a8c", 4.7682, 15.6354, "cod9017358", "-3m",
      "Dans les plus beaux gisements (Sweet Home, Colorado), les rhomboèdres rose framboise sont transparents ; le plus souvent, le minéral forme des croûtes et des stalactites zonées."),
    smithsonite: rhomboedrique("Smithsonite", "#b9cfc2", 4.6526, 15.0257, "cod9017357", "-3m",
      "La smithsonite cristallise rarement, en petits cristaux aux faces courbes ; elle prend surtout la forme de croûtes mamelonnées. Le rhomboèdre représenté correspond à son clivage."),
    dolomite: rhomboedrique("Dolomite", "#e8dfd0", 4.8033, 15.984, "cod9000573", "-3",
      "Ses rhomboèdres, souvent à faces incurvées (« selle de cheval »), reflètent des plans de calcium et de magnésium de tailles inégales, mal accordés : le réseau se déforme pendant la croissance. Moins symétrique que la calcite (classe 3̄), elle ne forme pas de scalénoèdre."),
    ankerite: rhomboedrique("Ankérite", "#d8c3a0", 4.824, 16.1217, "cod9001246", "-3",
      "Des rhomboèdres aux faces courbes, à la manière de la dolomite dont elle est l'équivalent ferrifère ; elle brunit en surface lorsque son fer s'oxyde."),

    // ─────────── Aragonite ───────────
    aragonite: {
      nom: "Aragonite", couleur: "#e9e2d6", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.9616, 7.9705, 5.7394, 90, 90, 90], mailleSource: "cod9000229", azimut: 24, elevation: 14,
      macleNote: "Trois individus soudés à ≈ 120° sur {110} forment des macles cycliques, à prismes pseudo-hexagonaux comme ceux de Molina de Aragón (non dessinés).",
      facies: [
        { nom: "Aiguille",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.05 },
            { sym: "k", hkl: [0, 1, 1], nom: "dôme aigu", d: 3.2 },
          ],
          note: "Les cristaux qui se développent dans les sources chaudes et les grottes prennent souvent des aiguilles ou des baguettes en biseau (fleurs de fer, en buissons)." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "net", nom: "{010}", pas: 0.24 }],
    },

    // ─────────── Cérusite ───────────
    cerusite: {
      nom: "Cérusite", couleur: "#eeeae0", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [5.18324, 8.4992, 6.14746, 90, 90, 90], mailleSource: "cod9013803", azimut: 24, elevation: 16,
      macleNote: "Les macles sur {110}, fréquemment répétées, dessinent des étoiles à six branches et des réseaux de lames croisées à 60° : c'est la signature de la cérusite (non dessinées).",
      facies: [
        { nom: "Tablette",
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.5 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.15 },
            { sym: "x", hkl: [0, 1, 2], nom: "dôme", d: 0.75 },
          ],
          note: "Aplatis selon b, ces cristaux en tablettes ont un éclat adamantin ; leur densité (6,6) et cet éclat les séparent immédiatement des autres minéraux blancs." },
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
          note: "Des prismes allongés, en pointe, forment souvent des gerbes rayonnantes, blanches à vert pâle." },
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
          note: "Des tablettes épaisses, bleu profond, se regroupent en rosettes ; les cristaux de Chessy, réunis en boules, ont rendu le minéral célèbre." },
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
  const FILON = "Aucun diagramme : ici, c'est la chimie de l'eau chaude (gaz carbonique, métaux dissous) qui décide, et aucun diagramme de l'atlas ne la représente.";
  const OXYD = "Aucun diagramme ici : ce qui compte, c'est l'oxydation juste sous la surface, au-dessus de la nappe, ainsi que la composition de l'eau de pluie.";

  Object.assign(MIN_F, {

    // ─────────── Magnésite ───────────
    magnesite: {
      forme: `La magnésite a la même architecture que la calcite : des plans de magnésium alternent avec des plans de groupes CO₃ triangulaires posés à plat. Plus petit que le calcium, le magnésium resserre la maille (4,63 Å contre 4,99) et rend le minéral plus dur et plus dense. Le clivage reste rhomboédrique, mais à froid, l'acide ne provoque presque aucune effervescence.`,
      intro: `La magnésite se forme surtout par altération des roches du manteau, sous l'action d'une eau riche en gaz carbonique.`,
      scenarios: [
        { nom: "Dans une serpentinite traversée par du CO₂",
          texte: `Dans une serpentinite, une eau chargée de gaz carbonique convertit le silicate de magnésium en
            magnésite et en silice : il en résulte des veines blanches en réseau et, parfois, des amas exploités pour la magnésie
            réfractaire (Grèce, Slovaquie, Australie). Cette même réaction fait l'objet de recherches pour stocker le CO₂ dans les roches.`,
          cond: false, sansDiagramme: "Aucun diagramme : à basse température, la quantité de gaz carbonique apportée par l'eau détermine la formation.",
          src: [SRC.hansen] },
      ],
    },

    // ─────────── Sidérite ───────────
    siderite: {
      forme: `La structure est celle de la calcite, le fer occupant la place du calcium : le clivage reste rhomboédrique. Le fer y est à l'état ferreux
        (Fe²⁺) ; à l'air, il s'oxyde, et les cristaux brunissent en surface avant de se transformer en goethite.`,
      intro: `La sidérite précipite lorsque le fer dissous sous forme Fe²⁺ rencontre du carbonate, en l'absence d'oxygène.`,
      scenarios: [
        { nom: "Dans une vase sans oxygène",
          texte: `Dans les marais côtiers et les boues deltaïques, l'eau manque d'oxygène tout en restant riche en gaz carbonique : le fer
            demeure dissous (Fe²⁺) et, faute de soufre suffisant pour former de la pyrite, il se dépose en sidérite, en
            nodules et en lits. Les « minerais de fer des houillères » (blackband) en sont constitués.`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: 0.45, n: 1, t: "À la surface, l'eau est oxydante : le fer précipite alors sous forme d'oxydes, sans rester en solution." },
            { pH: 6.3, Eh: -0.3, n: 2, t: "Dans la vase privée d'oxygène, le fer passe à l'état de Fe²⁺ dissous ; le gaz carbonique issu de la matière organique en décomposition le fait alors précipiter en sidérite." },
          ], note: "Le carbone n'apparaît pas sur le diagramme : la sidérite se stabilise dans le domaine du Fe²⁺ dissous dès que l'eau renferme assez de carbonate et peu de soufre." }, },
        { nom: "Dans un filon",
          texte: `Dans de nombreux filons, la sidérite sert de gangue, en rhomboèdres brun miel ; à Allevard (Isère), ce « fer spathique » a alimenté l'acier depuis le Moyen Âge.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Rhodochrosite ───────────
    rhodochrosite: {
      forme: `La structure reprend celle de la calcite, le manganèse occupant la place du calcium. La teinte rose provient du manganèse lui-même
        (Mn²⁺) ; un peu de calcium ou de fer la pâlit ou la brunit.`,
      intro: `La rhodochrosite se dépose dans les filons riches en manganèse.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `On la voit avec la galène, la blende et le quartz, dans des filons à température moyenne ou basse : à Sweet Home (Colorado) et Capillitas (Argentine), elle forme des stalactites zonées, débitées en tranches.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Smithsonite ───────────
    smithsonite: {
      forme: `Avec le zinc à la place du calcium, la structure reprend celle de la calcite, mais la maille se resserre. Le minéral se rencontre rarement en cristaux ; il forme surtout des croûtes mamelonnées, teintées de vert ou de bleu par le cuivre, de rose par le cobalt, de jaune par le cadmium. Sa dureté va de 4 à 4,5.`,
      intro: `C'est par oxydation de la blende, au sein des calcaires, que se forme la smithsonite.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement de zinc, à proximité de la surface.",
          texte: `En surface, l'eau de pluie attaque la blende ; le zinc dissous rencontre alors le calcaire environnant et se dépose sous forme de carbonate. Ces « calamines » furent les premiers minerais de zinc exploités, à Moresnet (Belgique) et aux Malines (Gard).`,
          cond: false, sansDiagramme: OXYD, src: [SRC.reichenberg] },
      ],
    },

    // ─────────── Aragonite ───────────
    aragonite: {
      forme: `Malgré la même formule que la calcite, l'aragonite s'organise autrement : chaque calcium, entouré de neuf oxygènes au lieu de six, occupe un espace plus serré. Plus dense (2,95 contre 2,71), elle ne demeure stable qu'à haute pression ; en surface, elle se transforme lentement en calcite. Elle ne présente pas de clivage rhomboédrique et forme des aiguilles ou des prismes.`,
      intro: `L'aragonite provient surtout des êtres vivants, d'eaux riches en magnésium et, plus rarement, d'une haute pression.`,
      scenarios: [
        { nom: "Dans les coquilles et la nacre",
          texte: `Coraux, mollusques et algues vertes édifient leur squelette en aragonite, forme pourtant instable : dans l'eau de mer, le magnésium entrave la croissance de la calcite et favorise l'aragonite. La nacre et les perles résultent d'un empilement de plaquettes d'aragonite. Après la mort de l'organisme, cette aragonite se convertit en calcite au bout de quelques milliers à quelques millions d'années.`,
          cond: false, sansDiagramme: "Ce sont l'organisme et le magnésium de l'eau de mer qui sélectionnent l'aragonite : aucun diagramme n'en rend compte.",
          src: [SRC.morse] },
        { nom: "Dans une source chaude",
          texte: `Les sources chaudes, riches en magnésium et en gaz carbonique, laissent l'aragonite former aiguilles et pisolithes : c'est le cas à Karlovy Vary (République tchèque).`,
          cond: false, sansDiagramme: "Ici, c'est la chimie de l'eau, et non la pression, qui conduit à l'aragonite. Aucun diagramme ne le représente." },
        { nom: "Dans un schiste bleu",
          texte: `Un calcaire enfoui très rapidement dans une zone de subduction passe à haute pression et basse température : la calcite y cède la place à l'aragonite, forme stable dans ces conditions. Pour se conserver, la roche doit remonter froide ; sinon, elle redevient calcite.`,
          cond: { type: "meta", echelle: "hp", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Entraîné par la subduction, un calcaire issu du fond océanique s'enfonce."),
            pt(350, 1.0, 2, "À environ 1 GPa (30 km) et seulement 350 °C, la calcite se transforme en aragonite.", { bande: "aragonite" }),
            pt(150, 0.2, 3, "Lors de la remontée, la roche reste froide : l'aragonite n'a pas le temps de redevenir calcite."),
          ], note: "Chemin schématique. Limite calcite-aragonite ≈ 0,5 GPa à 100 °C, ≈ 0,9 GPa à 400 °C." },
          src: ["pattison"] },
      ],
    },

    // ─────────── Cérusite ───────────
    cerusite: {
      forme: `Dans la cérusite, le plomb occupe la place du calcium d'une structure de type aragonite : chaque plomb est entouré de neuf oxygènes. Ce métal lourd rend le minéral très dense (6,6) et lui confère un éclat adamantin ; sa maille, presque hexagonale (b ≈ a√3), explique les macles à 60° en étoiles et en réseaux.`,
      intro: `La cérusite résulte de l'oxydation de la galène.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `Près de la surface, l'eau de pluie chargée de gaz carbonique attaque la galène ; le plomb libéré se dépose sur place sous forme de cérusite, souvent accompagnée d'anglésite et de pyromorphite. Tsumeb (Namibie) et Broken Hill ont livré des réseaux de cristaux de plusieurs centimètres.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Strontianite ───────────
    strontianite: {
      forme: `Structure de l'aragonite, avec le strontium à la place du calcium. En 1790, des échantillons issus de Strontian (Écosse) ont permis d'identifier cet élément, qui lui doit son nom.`,
      intro: `Dans les filons à basse température et les géodes, on rencontre la strontianite.`,
      scenarios: [
        { nom: "Dans un filon ou une géode",
          texte: `Filons à basse température et géodes de calcaires ou de marnes (Westphalie, Strontian) : la strontianite voisine la calcite, la barytine et la célestine.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Withérite ───────────
    witherite: {
      sansForme: "Non dessinée : la withérite se macle systématiquement par trois, formant de fausses bipyramides hexagonales que le moteur ne représente pas.",
      forme: `Le baryum, cation le plus volumineux de la famille, prend la place du calcium dans une structure d'aragonite et dilate la maille. Presque hexagonale comme celle de la cérusite, elle engendre des cristaux maclés par trois, qui imitent des bipyramides hexagonales.`,
      intro: `La withérite cristallise dans les filons à baryum formés à basse température.`,
      scenarios: [
        { nom: "Dans un filon à galène et barytine",
          texte: `Rare, elle apparaît lorsque le baryum rencontre des ions carbonate sans sulfate (sinon, c'est la barytine qui se forme). Alston Moor et Settlingstones (nord de l'Angleterre) ont été ses gisements classiques. Contrairement à la barytine, elle est toxique.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Dolomite ───────────
    dolomite: {
      forme: `Dans la dolomite, un plan de calcium sur deux cède la place à un plan de magnésium. Cet ordre réduit la symétrie (classe 3̄) : les deux cations, de tailles différentes, déforment le réseau et donnent les cristaux en selle. Le clivage rhomboédrique est identique à celui de la calcite, mais à froid, l'acide dilué ne produit presque pas de bulles.`,
      intro: `La dolomite naît le plus souvent d'un calcaire transformé au contact d'une eau magnésienne.`,
      scenarios: [
        { nom: "Dans une lagune qui s'évapore",
          texte: `À mesure que l'eau de mer s'évapore, le gypse élimine le calcium et la saumure s'enrichit en magnésium. Plus dense, celle-ci s'infiltre dans les boues calcaires : son magnésium remplace la moitié du calcium et la calcite se mue en dolomite, comme dans les dolomies jurassiques des Causses.`,
          cond: { type: "mgca", chemin: [
            q({ F: 1.2, R: 5.13 }, 1, "Dans une lagune chaude, les boues calcaires se déposent à partir d'une eau de mer au rapport magnésium sur calcium voisin de 5."),
            q({ F: 3.8, R: 5.13 }),
            q({ F: 6, R: 10 }, 2, "Dès que l'évaporation atteint un facteur 3,8, le gypse précipite et soustrait du calcium : le rapport magnésium sur calcium dépasse alors 10."),
            q({ F: 6, R: 3 }, 3, "La saumure, en s'infiltrant dans les boues calcaires, transforme la calcite en dolomite ; appauvrie en magnésium, elle voit ensuite son rapport retomber."),
          ] }, },
        { nom: "Dans un filon (dolomite en selle)",
          texte: `Les saumures chaudes des bassins, porteuses aussi de galène et de blende, déposent dans les cavités une dolomite en rhomboèdres courbes, dite « baroque » dans les gisements des Causses.`,
          cond: false, sansDiagramme: FILON },
      ],
    },

    // ─────────── Ankérite ───────────
    ankerite: {
      forme: `Dans l'ankérite, une part du magnésium de la dolomite est remplacée par du fer, en quantité supérieure au magnésium. La structure ordonnée, le clivage rhomboédrique et les faces courbes sont conservés.`,
      intro: `L'ankérite constitue la gangue carbonatée des filons aurifères et figure parmi les carbonates de fer sédimentaires.`,
      scenarios: [
        { nom: "Dans un filon de quartz aurifère",
          texte: `Les eaux chaudes et chargées de gaz carbonique qui circulent autour des filons d'or des chaînes de montagnes transforment les silicates de fer et de magnésium de la roche en ankérite. Cette auréole blanchâtre, rouillée en surface, sert de guide aux prospecteurs.`,
          cond: false, sansDiagramme: FILON, src: ["Groves D. I., Goldfarb R. J. et al. (1998). « Orogenic gold deposits ». <i>Ore Geology Reviews</i> 13, p. 7–27."] },
      ],
    },

    // ─────────── Malachite ───────────
    malachite: {
      sansForme: "Non dessinée : la malachite cristallise rarement en aiguilles ; elle prend le plus souvent des masses mamelonnées à bandes concentriques.",
      forme: `La malachite est construite de chaînes d'octaèdres de cuivre, reliées par des groupes CO₃ et des OH. Ses fibres serrées rayonnent autour de petits centres ; en grandissant, les couches successives forment les bandes claires et sombres que révèle le polissage.`,
      intro: `La malachite se forme par altération des minerais de cuivre proches de la surface, sous un climat suffisamment humide.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement cuprifère",
          texte: `L'eau de pluie chargée de gaz carbonique oxyde la chalcopyrite ; le cuivre dissous précipite en malachite, surtout au contact d'un calcaire qui neutralise l'acidité. Stable sous la pression de gaz carbonique de l'air, elle cède la place à l'azurite lorsque l'eau en contient davantage ; l'azurite se reconvertit en malachite quand cette pression baisse. Chessy (Rhône) et l'Oural (pierre des palais des tsars) sont des sites célèbres.`,
          cond: false, sansDiagramme: OXYD, src: [SRC.williams] },
      ],
    },

    // ─────────── Azurite ───────────
    azurite: {
      forme: `Constituée de cuivres entourés de quatre oxygènes en carré, de groupes CO₃ et d'OH, l'azurite contient plus de carbonate que la malachite ; une eau plus chargée en gaz carbonique lui est nécessaire. Son bleu, qui lui vaut son nom, teintait les peintures médiévales.`,
      intro: `Dans la zone oxydée des gisements de cuivre, l'azurite apparaît lorsque l'eau est riche en gaz carbonique.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement cuprifère",
          texte: `Elle se rapproche de la malachite, mais se forme là où l'eau est plus chargée en gaz carbonique (contact d'un calcaire, roche peu perméable). Lorsque le gaz carbonique diminue, elle se transforme en malachite sans changer de forme : certains cristaux d'azurite sont ainsi à moitié verts. Chessy (Rhône) a livré les boules de cristaux qui ont fait le tour des musées (« chessylite »).`,
          cond: false, sansDiagramme: OXYD, src: [SRC.williams] },
      ],
    },

    // ─────────── Nitratine ───────────
    nitratine: {
      sansForme: "Non dessinée : la nitratine se présente en croûtes et en masses grenues, ses cristaux naturels étant rares.",
      forme: `La nitratine adopte la structure de la calcite : le sodium y occupe la place du calcium et des groupes NO₃ remplacent les CO₃. Les triangles couchés, le clivage rhomboédrique et la forte double réfraction sont donc les mêmes. Très soluble, elle disparaît après quelques pluies.`,
      intro: `Seul le désert le plus aride du monde conserve la nitratine.`,
      scenarios: [
        { nom: "Dans un désert hyper-aride",
          texte: `Dans le désert d'Atacama, la foudre et les réactions de l'atmosphère fixent l'azote, qui retombe en nitrates depuis des millions d'années. Il ne pleut quasiment jamais : rien ne lessive ces sels, qui s'accumulent sous la surface en croûtes (caliche) avec le sel et le gypse. Ce « salpêtre du Chili » a servi d'engrais et de poudre à canon jusqu'aux années 1920.`,
          cond: { type: "climat", domaines: [[10, 25, 0, 0.05]], etiquettes: [["nitrates", 17.5, 0.18]], villes: ["Perpignan", "Montpellier"], chemin: [
            { T: 17, ai: 0.01, n: 1, t: "Atacama : température moyenne ≈ 17 °C, quelques millimètres de pluie annuelle, moins de 1 % de l'ETP." },
            { n: 2, t: "Les nitrates apportés par l'atmosphère, non lessivés, s'accumulent sous la surface depuis des millions d'années." },
          ], note: "Domaine schématique : sous ≈ 5 % de l'ETP, les nitrates résistent ; dans un climat plus humide, la pluie les dissout." },
          src: ["h5", SRC.ericksen] },
      ],
    },

    // ─────────── Nitre ───────────
    nitre: {
      sansForme: "Non dessinée : le nitre se présente en efflorescences et en aiguilles, rarement en cristaux mesurables.",
      forme: `Le potassium remplace le calcium dans la structure de l'aragonite, et des groupes NO₃ succèdent aux CO₃. Très soluble, il ne subsiste qu'à l'abri de la pluie.`,
      intro: `Le nitre se développe là où des bactéries transforment en nitrate l'azote de la matière organique, à l'abri des précipitations.`,
      scenarios: [
        { nom: "Sur les murs et dans les grottes",
          texte: `Dans les caves, les étables et les grottes à guano, des bactéries oxydent l'ammoniac en nitrates : l'humidité les remonte et ils cristallisent à la surface. Jusqu'au XIX<sup>e</sup> siècle, des « salpêtriers » raclaient ces parois pour fabriquer de la poudre à canon.`,
          cond: false, sansDiagramme: "Aucun diagramme : bactéries et matière organique gouvernent ce processus." },
      ],
    },
  });
})();
