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

    apatite: apatitique("Apatite", "#7fa9a0", 9.3973, 6.8782, "cod9001232",
      { nom: "Prisme et pyramide", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.5 },
        { sym: "x", hkl: [1, 0, -1, 1], nom: "bipyramide", d: 1.25 },
      ] },
      "Prismes hexagonaux coiffés d'une pyramide et coupés par la base. La classe 6/m n'a pas de plans de symétrie verticaux : sur les cristaux riches en faces, certaines facettes ne se répètent que six fois au lieu de douze, en biais, ce qui trahit cette symétrie réduite."),

    pyromorphite: apatitique("Pyromorphite", "#7ba33d", 9.986, 7.3378, "cod9016947",
      { nom: "Prisme en tonnelet", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.5 },
      ] },
      "Prismes hexagonaux vert vif, souvent bombés en tonnelet et creux au cœur. Les Farges (Ussel, Corrèze) en ont livré les plus beaux du monde."),

    mimetite: apatitique("Mimétite", "#e3a33a", 10.2382, 7.4502, "cod9016951",
      { nom: "Prisme et pyramide", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "x", hkl: [1, 0, -1, 1], nom: "bipyramide", d: 1.25 },
      ] },
      "Prismes jaune orangé, souvent terminés en pyramide ; la variété en boules courbées s'appelle campylite."),

    vanadinite: apatitique("Vanadinite", "#c4381f", 10.3231, 7.3399, "cod9016949",
      { nom: "Prisme court", f: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.9 },
      ] },
      "Prismes courts, rouge vif, à sommet plat : la vanadinite de Mibladen (Maroc) est l'image du minéral."),

    // ─────────── Monazite ───────────
    monazite: {
      nom: "Monazite", couleur: "#b5683a", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [6.7902, 7.0203, 6.4674, 90, 103.38, 90], mailleSource: "cod9001646", azimut: 26, elevation: 16,
      facies: [
        { nom: "Tablette", formes: [
          { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.6 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
          { sym: "e", hkl: [0, 1, 1], nom: "prisme", d: 1.05 },
        ], note: "Petites tablettes brun-rouge, aplaties selon a, en biseau : dans les granites, des grains de quelques dixièmes de millimètre ; dans les pegmatites, des cristaux de plusieurs centimètres." },
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
        ], note: "Prismes courts terminés en pointe, comme le zircon, dont il a la structure : les deux minéraux poussent parfois l'un sur l'autre, en continuité." },
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
        ], note: "Lames allongées selon c, aplaties selon b : incolores à la sortie de la terre, elles deviennent bleues puis noires en quelques jours à l'air, quand le fer s'oxyde. Les {-101} des ouvrages (maille C2/m) sont les {001} de cette maille." },
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
        ], note: "Aiguilles et lames rose framboise, en gerbes : même structure et même forme que la vivianite, avec le cobalt et l'arsenic." },
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
        ], note: "Plaques carrées très minces, jaune citron, qui brillent en vert sous ultraviolets. La maille de la structure est orthorhombique mais presque quadratique (a ≈ 2 c) : les feuillets d'uranyle-phosphate sont perpendiculaires à b." },
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
        ], note: "Plaques carrées vert émeraude, empilées comme des cartes. Elle ne brille pas sous ultraviolets : le cuivre éteint la fluorescence de l'uranyle." },
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
  const OXYD = "Pas de diagramme : c'est l'oxydation près de la surface et la chimie de l'eau de pluie qui décident.";
  const PEG = "Pas de diagramme : la pegmatite cristallise à partir d'un liquide très riche en eau et en éléments rares, que le diagramme du granite ne représente pas.";

  Object.assign(MIN_F, {

    // ─────────── Apatite ───────────
    apatite: {
      forme: `L'apatite est faite de tétraèdres PO₄ et de calciums, disposés autour de canaux parallèles à l'axe c ; les ions
        fluor (ou OH, ou chlore) s'alignent dans ces canaux. La symétrie hexagonale du réseau donne les prismes à six faces.
        Dureté 5, l'étalon de l'échelle de Mohs ; nos os et nos dents sont faits d'une apatite à OH (hydroxyapatite) en
        nanocristaux.`,
      intro: `L'apatite est présente dans presque toutes les roches ; elle se concentre aussi dans les sédiments phosphatés.`,
      scenarios: [
        { nom: "Dans un magma qui cristallise",
          texte: `Le phosphore n'entre presque pas dans les grands minéraux des roches magmatiques : il cristallise tôt, en petites
            aiguilles d'apatite incluses dans les autres minéraux. Les granites en contiennent quelques dixièmes de pour cent ;
            les carbonatites et certaines roches alcalines (Khibiny, Russie) en font des gisements.`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(900, 0.3, 1, "Un magma granitique monte et s'installe à quelques kilomètres de profondeur."),
            pt(800, 0.3, 2, "Tôt, dès ≈ 800–900 °C, le phosphore sature : de fines aiguilles d'apatite cristallisent, que les autres minéraux engloberont.", { bande: "cristallisation" }),
            pt(680, 0.3, 3, "Le granite achève de cristalliser ; l'apatite y reste en inclusions."),
          ], note: "Chemin schématique." },
          src: ["hirschmann"] },
        { nom: "Dans un karst à phosphates",
          texte: `L'eau qui traverse les dépôts de guano ou d'os s'acidifie et se charge de phosphate ; au contact du calcaire, elle se
            neutralise et l'apatite précipite : les phosphorites du Quercy, exploitées comme engrais au XIX<sup>e</sup> siècle.`,
          cond: { type: "apatite", chemin: [
            q({ pH: 4.5, P: 100 }, 1, "L'eau qui traverse le guano devient acide (pH ≈ 4–5) et se charge de phosphate, sans rien précipiter."),
            q({ pH: 7.5, P: 0.0007 }, 2, "Au contact du calcaire, elle se neutralise : dès pH ≈ 5, elle devient sursaturée et l'apatite précipite ; à pH 7,5, il ne reste presque plus de phosphate dissous."),
          ] }, },
      ],
    },

    // ─────────── Monazite ───────────
    monazite: {
      forme: `La monazite est faite de tétraèdres PO₄ et de gros ions de terres rares (cérium, lanthane, néodyme) entourés de
        neuf oxygènes. Le thorium remplace une partie des terres rares : elle est faiblement radioactive, et ce thorium la rend
        précieuse pour dater les granites et les gneiss.`,
      intro: `La monazite est un minéral accessoire des granites et des gneiss, concentré ensuite dans les sables lourds.`,
      scenarios: [
        { nom: "Dans un granite",
          texte: `Les terres rares et le thorium, trop gros pour les feldspaths, s'accumulent dans le magma et cristallisent tôt en
            petits grains de monazite. Sa solubilité dans le magma dépend de la température : la quantité de monazite renseigne
            sur la température du granite.`,
          cond: { type: "magma", echelle: "croute", chemin: [
            pt(850, 0.4, 1, "La croûte fond en partie ; les terres rares de la monazite des roches passent dans le liquide."),
            pt(760, 0.3, 2, "Le magma se refroidit : la monazite, saturée, recristallise en petits grains.", { bande: "cristallisation" }),
            pt(680, 0.3, 3, "Le granite achève de cristalliser."),
          ], note: "Chemin schématique." },
          src: ["hirschmann", SRC.montel] },
        { nom: "Dans un sable de plage",
          texte: `Dense (5,2) et résistante, elle survit à l'érosion des granites et se concentre avec le zircon et l'ilménite dans
            les sables noirs des plages (Kerala en Inde, Brésil), longtemps la principale source de thorium et de terres rares.`,
          cond: false, sansDiagramme: "Pas de diagramme : même tri par les vagues que les autres minéraux lourds." },
      ],
    },

    // ─────────── Xénotime ───────────
    xenotime: {
      forme: `Le xénotime a la structure du zircon : tétraèdres PO₄ et ions yttrium entourés de huit oxygènes, en chaînes le long
        de c. Les petites terres rares (yttrium, ytterbium) y entrent, les grosses vont dans la monazite : les deux minéraux se
        partagent les terres rares.`,
      intro: `Le xénotime accompagne la monazite et le zircon dans les granites et les gneiss.`,
      scenarios: [
        { nom: "Dans un granite ou une pegmatite",
          texte: `En petits grains, souvent accolés au zircon, dans les granites riches en aluminium et les pegmatites ; puis dans les
            sables lourds. Son nom grec, « hôte étranger », vient d'une erreur : on avait cru y trouver un nouvel élément.`,
          cond: false, sansDiagramme: "Pas de diagramme : voir la monazite, qui se forme dans les mêmes conditions." },
      ],
    },

    // ─────────── Amblygonite ───────────
    amblygonite: {
      sansForme: "Forme non dessinée : l'amblygonite-montebrasite forme surtout de grandes masses de clivage dans les pegmatites ; ses cristaux sont rares et mal formés.",
      forme: `L'amblygonite-montebrasite associe des chaînes d'octaèdres d'aluminium, des tétraèdres PO₄ et du lithium. Le fluor
        (amblygonite) et l'OH (montebrasite) se remplacent ; la plupart des échantillons sont des montebrasites. Clivage parfait,
        dans un minéral triclinique : ses cassures font des angles obliques.`,
      intro: `L'amblygonite-montebrasite est un minerai de lithium des pegmatites.`,
      scenarios: [
        { nom: "Dans une pegmatite à lithium",
          texte: `En fin de cristallisation des granites riches en éléments rares, les pegmatites concentrent lithium, phosphore et
            fluor : la montebrasite y cristallise en grandes masses blanches, avec la lépidolite et le spodumène. Elle a été décrite
            à Montebras (Creuse) en 1871.`,
          cond: false, sansDiagramme: PEG },
      ],
    },

    // ─────────── Vivianite ───────────
    vivianite: {
      forme: `La vivianite est faite de paires d'octaèdres de fer reliées par des tétraèdres PO₄ en feuillets, et d'eau tenue par
        des liaisons hydrogène entre les feuillets : clivage parfait {010}, lames souples. Le fer y est ferreux (Fe²⁺) : à l'air,
        il s'oxyde en partie, et les échanges d'électrons entre Fe²⁺ et Fe³⁺ voisins la colorent en bleu, puis en noir.`,
      intro: `La vivianite naît dans les milieux sans oxygène riches en phosphore : tourbières, vases, os enfouis.`,
      scenarios: [
        { nom: "Dans une tourbière ou une vase",
          texte: `Sans oxygène, le fer reste dissous en Fe²⁺ ; s'il y a du phosphate (os, coquilles, matière organique) et peu de
            soufre, il précipite en vivianite : nodules bleus dans les tourbes et les argiles, cristaux dans les os et les coquilles
            fossiles (Kertch en Crimée).`,
          cond: { type: "ehph", systeme: "fer", chemin: [
            { pH: 7, Eh: 0.4, n: 1, t: "À l'air libre, le fer précipite en oxydes : le phosphate y est fixé, sans vivianite." },
            { pH: 6.8, Eh: -0.25, n: 2, t: "Dans la tourbe ou la vase, sans oxygène, le fer passe en Fe²⁺ dissous ; avec le phosphate et peu de soufre, la vivianite précipite." },
          ], note: "Le diagramme ne trace pas le phosphore : la vivianite se forme dans le domaine du Fe²⁺ dissous quand l'eau contient du phosphate et peu de sulfure." },
          src: [SRC.rothe] },
      ],
    },

    // ─────────── Turquoise ───────────
    turquoise: {
      sansForme: "Forme non dessinée : la turquoise est presque toujours en masses microcristallines ; les cristaux visibles sont exceptionnels (Virginie).",
      forme: `La turquoise est faite d'octaèdres d'aluminium, de tétraèdres PO₄ et de cuivres liés à des OH et à de l'eau. Le
        cuivre donne le bleu ; le fer, qui remplace une partie de l'aluminium, le tire vers le vert.`,
      intro: `La turquoise naît de l'altération des roches riches en aluminium par des eaux chargées de cuivre, sous un climat sec.`,
      scenarios: [
        { nom: "Dans une roche altérée, en climat aride",
          texte: `Près de la surface, l'eau de pluie, rare, oxyde les sulfures de cuivre et lessive le phosphore de l'apatite ; elle
            remplit les fissures des roches altérées de veinules de turquoise. Les gisements célèbres sont dans des déserts :
            Nichapour (Iran), Sinaï (exploité dès l'Égypte ancienne), Arizona et Nevada.`,
          cond: { type: "climat", domaines: [[12, 30, 0.02, 0.2]], etiquettes: [["turquoise", 21, 0.32]], villes: ["Perpignan", "Marseille"], chemin: [
            { T: 17, ai: 0.12, n: 1, t: "Nichapour (Iran) : ≈ 15–18 °C, 200–250 mm de pluie pour une évaporation possible plus de cinq fois supérieure." },
            { n: 2, t: "L'eau rare oxyde le cuivre et lessive le phosphore ; elle dépose la turquoise dans les fissures des roches altérées." },
          ], note: "Domaine schématique : climat aride, pluie sous ≈ 20 % de l'ETP." },
          src: ["h5"] },
      ],
    },

    // ─────────── Wavellite ───────────
    wavellite: {
      sansForme: "Forme non dessinée : la wavellite forme des sphérules et des rosaces d'aiguilles rayonnantes, sans faces mesurables.",
      forme: `La wavellite est faite de chaînes d'octaèdres d'aluminium (avec OH et fluor), reliées par des tétraèdres PO₄, et
        d'eau dans des canaux. Elle pousse en aiguilles le long de ces chaînes, groupées en disques rayonnants verts sur les
        surfaces de fracture.`,
      intro: `La wavellite naît de l'altération à basse température des roches riches en aluminium et en phosphore.`,
      scenarios: [
        { nom: "Dans les fissures d'un schiste",
          texte: `L'eau qui circule dans les fissures des schistes, des cherts et des phosphorites dissout un peu de phosphore et
            d'aluminium et dépose la wavellite en rosaces : Arkansas, Dévon (où elle a été décrite par William Wavell vers 1800),
            Zbirov (Bohême).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Autunite ───────────
    autunite: {
      forme: `L'autunite est faite de feuillets d'ions uranyle (UO₂²⁺, un uranium flanqué de deux oxygènes très proches, 1,8 Å)
        et de tétraèdres PO₄ ; entre les feuillets, du calcium et beaucoup d'eau. D'où les plaques carrées, le clivage parfait
        en lamelles, et une eau qui part à l'air sec (elle devient métautunite). L'uranyle lui donne sa fluorescence verte.`,
      intro: `L'autunite naît quand l'uranium de la pechblende est dissous par une eau oxydante et rencontre du phosphate.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement d'uranium",
          texte: `En profondeur, sans oxygène, l'uranium est tétravalent et insoluble (pechblende). Près de la surface, l'eau de pluie
            l'oxyde en uranyle, très soluble ; s'il rencontre du phosphate (apatite du granite altéré), il précipite en autunite,
            en plaquettes dans les fissures. Elle a été décrite près d'Autun (Saône-et-Loire) en 1852 ; le Limousin et le Morvan
            en ont livré.`,
          cond: { type: "ehph", systeme: "uranium", chemin: [
            { pH: 7, Eh: -0.2, n: 1, t: "En profondeur, sans oxygène, l'uranium est tétravalent et insoluble : c'est la pechblende." },
            { pH: 4.2, Eh: 0.75, n: 2, t: "Près de la surface, l'eau de pluie oxyde l'uranium en uranyle (U⁶⁺), soluble ; avec le phosphate de l'apatite altérée, l'autunite précipite." },
          ], note: "Le diagramme ne trace pas le phosphore : avec du phosphate, l'uranyle précipite en autunite au lieu de rester dissous." },
          src: [SRC.finch] },
      ],
    },

    // ─────────── Torbernite ───────────
    torbernite: {
      forme: `Même feuillets d'uranyle-phosphate que l'autunite, avec du cuivre entre les feuillets au lieu du calcium. Le cuivre la
        colore en vert et éteint la fluorescence de l'uranyle. Elle porte le nom du chimiste suédois Torbern Bergman.`,
      intro: `La torbernite naît comme l'autunite, quand l'eau qui dissout l'uranium apporte aussi du cuivre.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un gisement d'uranium et de cuivre",
          texte: `Comme l'autunite, mais là où l'oxydation des sulfures de cuivre fournit le cuivre : les mines du Limousin, les Bois
            Noirs (Loire), Cornouailles. Elle perd une partie de son eau à l'air et devient métatorbernite.`,
          cond: { type: "ehph", systeme: "uranium", chemin: [
            { pH: 7, Eh: -0.2, n: 1, t: "En profondeur, l'uranium est tétravalent et insoluble (pechblende)." },
            { pH: 4, Eh: 0.8, n: 2, t: "Oxydé près de la surface, il passe en uranyle soluble ; avec le phosphate et le cuivre, la torbernite précipite." },
          ], note: "Le diagramme ne trace ni le phosphore ni le cuivre." },
          src: [SRC.finch] },
      ],
    },

    // ─────────── Pyromorphite ───────────
    pyromorphite: {
      forme: `La pyromorphite a la structure de l'apatite : plombs autour de canaux hexagonaux où s'alignent les chlores, tétraèdres
        PO₄. D'où les prismes hexagonaux. Son nom grec, « forme du feu », vient de ce qu'une goutte fondue recristallise en
        polyèdres au refroidissement.`,
      intro: `La pyromorphite naît de l'oxydation de la galène, quand l'eau apporte du phosphate.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb",
          texte: `Près de la surface, la galène s'oxyde ; le plomb libéré se fixe avec le phosphate des sols et des roches en
            pyromorphite, très insoluble — c'est d'ailleurs le moyen de neutraliser le plomb des sols pollués. Les Farges (Ussel,
            Corrèze) ont donné, dans les années 1980, les plus beaux cristaux du monde.`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Mimétite ───────────
    mimetite: {
      forme: `Structure de l'apatite et de la pyromorphite, avec l'arsenic à la place du phosphore. Son nom grec, « imitateur »,
        vient de sa ressemblance avec la pyromorphite.`,
      intro: `La mimétite naît de l'oxydation des filons de plomb riches en arsenic.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb et d'arsenic",
          texte: `La galène et l'arsénopyrite s'oxydent ensemble ; plomb et arséniate se recombinent en mimétite : Tsumeb (Namibie),
            Johanngeorgenstadt (Saxe), Santa Eulalia (Mexique).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },

    // ─────────── Vanadinite ───────────
    vanadinite: {
      forme: `Structure de l'apatite, avec le vanadium à la place du phosphore. Le vanadate lui donne son rouge vif ; la lumière
        l'assombrit lentement.`,
      intro: `La vanadinite naît de l'oxydation des filons de plomb, surtout sous un climat sec.`,
      scenarios: [
        { nom: "Dans la zone oxydée d'un filon de plomb, en climat aride",
          texte: `Le vanadium vient des roches encaissantes (grès rouges, argiles) ; sous un climat sec, l'eau oxydante qui descend
            jusqu'au filon le porte en vanadate, qui précipite avec le plomb de la galène oxydée. Mibladen et Touissit (Maroc),
            Arizona et Nouveau-Mexique.`,
          cond: { type: "climat", domaines: [[12, 30, 0.05, 0.2]], etiquettes: [["vanadinite", 21, 0.32]], villes: ["Perpignan", "Marseille"], chemin: [
            { T: 16, ai: 0.15, n: 1, t: "Mibladen (Haute Moulouya, Maroc) : ≈ 15–17 °C, ≈ 200 mm de pluie, pluie ≈ 15 % de l'ETP." },
            { n: 2, t: "L'eau oxydante porte le vanadium des roches voisines jusqu'au filon et le fixe avec le plomb en vanadinite." },
          ], note: "Domaine schématique : climat aride, pluie entre ≈ 5 et 20 % de l'ETP." },
          src: ["h5"] },
      ],
    },

    // ─────────── Érythrite ───────────
    erythrite: {
      forme: `L'érythrite a la structure de la vivianite : paires d'octaèdres de cobalt reliées par des tétraèdres AsO₄ en feuillets,
        eau entre les feuillets. Le cobalt la colore en rose : ses « fleurs de cobalt » ont servi de guide aux prospecteurs.`,
      intro: `L'érythrite naît de l'oxydation des arséniures de cobalt.`,
      scenarios: [
        { nom: "Sur un minerai de cobalt oxydé",
          texte: `Les arséniures de cobalt (skuttérudite, cobaltite) s'oxydent près de la surface et se couvrent d'efflorescences
            roses : Bou Azzer (Maroc), Schneeberg (Saxe), Les Chalanches (Isère).`,
          cond: false, sansDiagramme: OXYD },
      ],
    },
  });
})();
