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
          note: "La forme presque unique du sel. Les cubes qui poussent à la surface d'une saumure grandissent plus vite par les arêtes que par le milieu des faces : ils deviennent des « trémies », des pyramides creuses en escalier, qui flottent jusqu'à couler (forme non dessinée ici)." },
      ],
      clivages: CLIV_CUBE,
    },

    // ─────────── Sylvite ───────────
    sylvite: {
      nom: "Sylvite", couleur: "#e6d2c8", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(6.2788), mailleSource: "cod9009733",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Comme la halite, dont elle a la structure : des cubes, rares, car la sylvite se trouve surtout en grains dans la sylvinite." },
        { nom: "Cube et octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.4 }],
          note: "Les sommets du cube sont coupés par de petites faces triangulaires de l'octaèdre : plus fréquent chez la sylvite que chez la halite." },
      ],
      clivages: CLIV_CUBE,
    },

    // ─────────── Fluorine ───────────
    fluorine: {
      nom: "Fluorine", couleur: "#9b7fd0", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(5.4631), mailleSource: "cod9007060",
      macleNote: "Macle d'interpénétration : deux cubes qui se traversent, l'un tourné de 180° autour d'une diagonale [111] ; des sommets du second sortent des faces du premier (non dessinée : le moteur ne dessine que les macles accolées).",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "La forme la plus courante dans les filons de basse température (Morvan, Tarn, Chaillac) : des cubes nets, souvent zonés de violet." },
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Plus rare dans la nature, fréquent dans les filons plus chauds (Alpes, Chamonix : les octaèdres roses des fentes alpines). C'est aussi la forme que révèle le clivage : on taille des octaèdres à partir d'un cube en le frappant sur ses sommets." },
        { nom: "Cube et octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.35 }],
          note: "Cube aux sommets coupés : passage d'une forme à l'autre, quand la température ou la chimie de l'eau changent pendant la croissance." },
      ],
      clivages: [{ hkl: [1, 1, 1], qualite: "parfait", nom: "octaédrique, quatre directions", pas: 0.26 }],
    },

    // ─────────── Chlorargyrite ───────────
    chlorargyrite: {
      nom: "Chlorargyrite", couleur: "#c9b99b", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(5.5463), mailleSource: "cod9011666",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Petits cubes rares ; la chlorargyrite forme surtout des croûtes et des masses cireuses, translucides, qui se coupent au couteau." },
      ],
      clivages: [],
    },

    // ─────────── Cryolite ───────────
    cryolite: {
      nom: "Cryolite", couleur: "#eef2f5", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [5.4139, 5.6012, 7.7769, 90, 90.183, 90], mailleSource: "cod9006157",
      macleNote: "Macles très fréquentes, souvent répétées (polysynthétiques), sur plusieurs lois : héritées du passage de la forme cubique de haute température à la forme monoclinique, en refroidissant.",
      facies: [
        { nom: "Pseudo-cube",
          formes: [{ sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }],
          note: "Un faux cube : la maille est presque cubique (c ≈ a√2, β ≈ 90°), si bien que le prisme {110} et la base {001} se coupent presque à angle droit. Les cristaux d'Ivigtut atteignaient une dizaine de centimètres." },
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
          note: "Prismes fins, allongés selon l'axe b et striés dans leur longueur, terminés en toit par le dôme {011}. Indices dans les axes de la structure 3D (dans les ouvrages en Pnam, le prisme est noté {110} et l'allongement [001])." },
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
  const ARIDE = "Pas de diagramme : ce qui décide, c'est la chimie de l'eau (chlore, oxydant ou non), qu'aucun diagramme de l'atlas ne représente pour ce métal.";

  Object.assign(MIN_F, {

    // ─────────── Halite ───────────
    halite_m: {
      forme: `La halite est l'empilement le plus simple qui soit entre deux ions de tailles différentes : chaque Na⁺ est
        entouré de six Cl⁻, et chaque Cl⁻ de six Na⁺, aux sommets d'un octaèdre. Le réseau est cubique dans les trois
        directions, d'où les cubes. Les plans {100} portent autant de charges + que de charges − : ils sont neutres et
        se séparent sans effort — c'est le <b>clivage cubique</b> parfait, qui casse un bloc de sel en petits cubes.`,
      intro: `La halite naît de l'évaporation de l'eau de mer ou d'un lac salé ; enfouie, elle flue et peut remonter en
        dômes.`,
      scenarios: [
        { nom: "Dans une lagune qui s'évapore",
          texte: `Une lagune séparée de la mer par un seuil se concentre à chaque saison sèche. Carbonates puis gypse
            précipitent d'abord ; quand il ne reste que 9 % de l'eau (× 10,6), le sel sature et cristallise, en petits cubes
            et en trémies à la surface, en croûtes au fond. Tant que la mer réalimente le bassin, les bancs s'empilent : le
            sel du Keuper de Lorraine (≈ 220 millions d'années) dépasse 100 m d'épaisseur cumulée.`,
          cond: { type: "saumure", sels: ["halite"], chemin: [
            q({ F: 1, C: 28.4 }, 0, "", { lab: "eau de mer" }),
            q({ F: 10.6, C: 301 }, 1, "Après les carbonates et le gypse, à × 10,6 (91 % de l'eau évaporée), le sel dissous atteint ≈ 300 g par kilogramme d'eau : la halite cristallise."),
            q({ F: 30, C: 301 }, 2, "Tant que la lagune est réalimentée, tout le sel qui arrive en plus cristallise : les cubes s'empilent en bancs."),
          ] },
          src: ["mccaffrey", "warren", "millero2008"] },
        { nom: "Dans un marais salant",
          texte: `Le même phénomène, conduit par l'homme : à Salin-de-Giraud (Camargue) ou à Guérande, l'eau de mer passe
            de bassin en bassin ; on laisse le gypse se déposer dans les premiers et l'on récolte le sel dans les derniers,
            avant que les sels de magnésium, amers, ne précipitent à leur tour.`,
          cond: false, sansDiagramme: "Pas de nouveau diagramme : même chemin que dans la lagune (onglet précédent), arrêté avant les sels de potassium." },
        { nom: "Enfouie, elle monte en dômes",
          texte: `Le sel est moins dense (2,16) que les roches qui le recouvrent (≈ 2,5) et, à quelques kilomètres de
            profondeur, il flue lentement comme un glacier. Il s'accumule là où la couverture est plus mince et monte en
            dômes et en murs (diapirs), qui percent parfois jusqu'à la surface : en Bresse, en Aquitaine, en Allemagne du
            Nord. Ses cristaux s'y recristallisent en gros grains.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est la différence de densité, pas la température ni la concentration, qui fait monter le sel." },
      ],
    },

    // ─────────── Sylvite ───────────
    sylvite: {
      forme: `Même structure que la halite, avec du potassium à la place du sodium : chaque K⁺ entre six Cl⁻. Le potassium,
        plus gros, écarte les ions (3,14 Å au lieu de 2,82) : la maille est plus grande et le cristal plus léger (1,99).
        Mêmes plans neutres, même <b>clivage cubique</b> parfait.`,
      intro: `La sylvite est un sel de toute fin d'évaporation, quand il ne reste qu'un peu plus de 1 % de l'eau.`,
      scenarios: [
        { nom: "Fin d'évaporation (bassin potassique d'Alsace)",
          texte: `Après le gypse et le sel, au-delà de ≈ 65 fois la concentration de l'eau de mer, le potassium sature. Dans
            l'eau de mer actuelle, riche en sulfate de magnésium, il précipite d'abord dans des sels complexes (kaïnite,
            carnallite) ; mais dans les saumures pauvres en sulfate, comme celle du fossé rhénan il y a 35 à 30 millions
            d'années, la sylvite cristallise directement avec la halite : c'est la sylvinite des Mines de potasse d'Alsace,
            en deux couches de 1 à 5 m.`,
          cond: { type: "saumure", sels: ["sylvite", "halite"], chemin: [
            q({ F: 1, C: 0.79 }, 0, "", { lab: "eau de mer" }),
            q({ F: 65, C: 51 }, 1, "Après le gypse (× 3,8) et le sel (× 10,6), au-delà de ≈ × 65, le potassium dissous atteint ≈ 50 g par kilogramme d'eau (compté en sylvite) : les sels de potassium cristallisent."),
            q({ F: 100, C: 51 }, 2, "Halite et sylvite précipitent ensemble, en lits alternés : la sylvinite (Alsace, 35–30 Ma)."),
          ] },
          src: ["mccaffrey", "warren", "millero2008", SRC.warren2016] },
        { nom: "En lessivant la carnallite",
          texte: `Une partie de la sylvite des gisements est secondaire : une eau peu salée qui traverse une couche de
            carnallite (KMgCl₃·6H₂O) emporte le chlorure de magnésium, très soluble, et laisse le potassium en sylvite.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est la composition de l'eau qui traverse la couche, pas sa concentration globale, qui décide." },
      ],
    },

    // ─────────── Carnallite ───────────
    carnallite: {
      sansForme: "Forme non dessinée : les cristaux de carnallite sont rares, pseudo-hexagonaux et mal décrits ; elle se trouve en masses grenues.",
      forme: `La carnallite est un sel <b>hydraté</b> : chaque magnésium est enfermé dans un octaèdre de six molécules
        d'eau (voir la structure 3D), et potassium et chlore occupent les vides entre ces octaèdres. Ce sont des liaisons
        hydrogène, faibles, qui tiennent l'ensemble : pas de clivage, une dureté de 2,5, et un cristal qui absorbe l'eau de
        l'air jusqu'à se dissoudre (déliquescence).`,
      intro: `La carnallite est l'un des tout derniers sels à cristalliser quand l'eau de mer s'évapore.`,
      scenarios: [
        { nom: "Au bout de l'évaporation",
          texte: `Quand il ne reste qu'environ 1 % de l'eau de mer (100 à 170 fois la concentration de départ), la saumure,
            devenue très riche en magnésium, dépose la carnallite avec la halite et la kiesérite. Ces couches ne se
            conservent que si elles sont vite recouvertes et jamais traversées par une eau moins salée : le Zechstein
            d'Allemagne (≈ 255 millions d'années), l'Oural (Solikamsk) en ont de grandes épaisseurs ; en Alsace, elle reste
            mineure à côté de la sylvite.`,
          cond: { type: "saumure", sels: ["sylvite"], xmax: 200, chemin: [
            q({ F: 1, C: 0.79 }, 0, "", { lab: "eau de mer" }),
            q({ F: 65, C: 51 }, 1, "Gypse puis sel sont déjà déposés ; au-delà de ≈ × 65, les sels de potassium et de magnésium commencent à cristalliser."),
            q({ F: 140, C: 51 }, 2, "Entre ≈ × 100 et × 170, la saumure riche en magnésium dépose la carnallite, avec halite et kiesérite."),
          ], note: "La courbe compte le potassium comme s'il précipitait en sylvite ; ici, il part dans la carnallite (KMgCl₃·6H₂O). Chemin schématique." },
          src: ["warren", "millero2008"] },
      ],
    },

    // ─────────── Fluorine ───────────
    fluorine: {
      forme: `Dans la fluorine, les calciums forment un réseau cubique à faces centrées et les fluors occupent tous les
        petits vides tétraédriques entre eux : chaque calcium a huit fluors, en cube, chaque fluor quatre calciums. Les
        plans {111} ne contiennent qu'une sorte d'ion : entre deux plans de fluors voisins, les charges se repoussent et
        la liaison est faible. D'où le <b>clivage octaédrique</b> parfait, qui détache des octaèdres d'un cube.`,
      intro: `La fluorine se dépose surtout dans les filons, à partir d'eaux chaudes qui ont lessivé le fluor des granites.`,
      scenarios: [
        { nom: "Dans un filon de basse température",
          texte: `Des eaux salées, chauffées en profondeur, lessivent le fluor des granites et du socle et remontent le long
            des failles. Entre ≈ 80 et 200 °C, quand elles se refroidissent ou se mélangent à une eau plus froide et plus
            riche en calcium, la fluorine précipite, en cubes, souvent avec la barytine, le quartz et la galène. Les
            grands filons de France datent pour la plupart du Jurassique (≈ 200–150 millions d'années) : Voltennes dans le
            Morvan, Le Burc et Mont-Roc dans le Tarn, Chaillac dans l'Indre.`,
          cond: false, sansDiagramme: "Pas de diagramme : la fluorine précipite par mélange de deux eaux autant que par refroidissement, ce qu'aucun diagramme de l'atlas ne représente." },
        { nom: "En fin de cristallisation d'un granite",
          texte: `Le fluor ne trouve presque pas de place dans les minéraux du granite : il se concentre dans les derniers
            liquides et les fluides qui s'en échappent. Il cristallise alors en fluorine dans les pegmatites et les greisens,
            ces granites transformés par les fluides autour des gîtes d'étain et de tungstène (Échassières dans l'Allier,
            Cornouailles).`,
          cond: false, sansDiagramme: "Pas de diagramme : la fluorine n'est ici qu'un minéral accessoire de fluides de fin de cristallisation." },
      ],
    },

    // ─────────── Chlorargyrite ───────────
    chlorargyrite: {
      forme: `Même structure que le sel de cuisine : chaque argent entre six chlores. Mais la liaison Ag–Cl est en partie
        covalente : les plans glissent sans se séparer, si bien que la chlorargyrite n'a pas de clivage et se coupe au
        couteau comme de la corne. La lumière en libère de l'argent métallique : le cristal noircit, comme une pellicule
        photographique (le même sel).`,
      intro: `La chlorargyrite naît dans la partie oxydée des filons d'argent, sous les climats secs.`,
      scenarios: [
        { nom: "Zone d'oxydation, en climat aride",
          texte: `Près de la surface, l'eau de pluie, oxydante, attaque les sulfures d'argent. Sous un climat humide, l'argent
            est emporté plus bas ; sous un climat aride, l'eau est rare et chargée de chlore (sels des sols, embruns,
            nappes salées) : l'argent est fixé sur place en chlorure. D'où les « chapeaux » de chlorargyrite massive des
            filons du Chili (Chañarcillo) et de Broken Hill, en Australie.`,
          cond: { type: "climat", domaines: [[12, 30, 0, 0.2]], etiquettes: [["chlorargyrite", 21, 0.1]], villes: ["Perpignan", "Marseille"], chemin: [
            { T: 18, ai: 0.17, n: 1, t: "Broken Hill (Australie) : ≈ 18 °C, 250 mm de pluie pour ≈ 1 500 mm d'évaporation possible — la pluie ne couvre que ≈ 17 % de l'ETP." },
            { n: 2, t: "L'eau de pluie oxyde les sulfures d'argent ; rare et salée, elle n'emporte pas l'argent, qui précipite en chlorure dans les fissures." },
          ], note: "Domaine schématique : la chlorargyrite domine les zones d'oxydation quand la pluie reste sous ≈ 20 % de l'ETP." },
          src: ["h5"] },
      ],
    },

    // ─────────── Cryolite ───────────
    cryolite: {
      forme: `La cryolite est faite d'octaèdres AlF₆ isolés, avec le sodium entre eux : un arrangement de type pérovskite.
        À haute température, les octaèdres sont droits et la maille est cubique ; en refroidissant sous ≈ 885 °C, ils se
        penchent légèrement et la maille devient monoclinique — mais si peu (β = 90,2°) que les cristaux gardent l'allure
        de cubes. Les domaines penchés dans des sens différents donnent ses macles répétées.`,
      intro: `La cryolite n'a formé qu'un seul grand gisement au monde, au sommet d'un petit granite du Groenland.`,
      scenarios: [
        { nom: "Au toit d'un granite alcalin (Ivigtut)",
          texte: `Il y a 1,27 milliard d'années, un petit massif de granite alcalin, très riche en fluor, s'est mis en place à
            Ivigtut (Groenland). Ses derniers liquides et fluides, chargés de fluor, de sodium et d'aluminium, se sont
            accumulés sous son toit et y ont cristallisé un corps de cryolite presque pure, avec sidérite, quartz et
            fluorine : ≈ 3,8 millions de tonnes, exploitées de 1854 à 1987 pour fondre l'alumine dans l'électrolyse de
            l'aluminium.`,
          cond: false, sansDiagramme: "Pas de diagramme : l'origine exacte (liquide magmatique ou fluide) reste discutée, et ces conditions ne figurent sur aucun diagramme de l'atlas.",
          src: [SRC.pauly] },
      ],
    },

    // ─────────── Atacamite ───────────
    atacamite: {
      forme: `Le cuivre y est au centre d'octaèdres déformés — quatre OH proches et deux chlores plus loin, ou cinq OH et
        un chlore — qui partagent leurs arêtes en une charpente compacte. Les liaisons hydrogène des OH vers les chlores
        tiennent les plans {001} moins fort que le reste : c'est le clivage parfait. Les chaînes d'octaèdres allongées
        selon b expliquent les prismes fins et striés.`,
      intro: `L'atacamite remplace la malachite là où il ne pleut presque jamais et où l'eau est salée.`,
      scenarios: [
        { nom: "Zone d'oxydation, en climat hyper-aride",
          texte: `Dans le désert d'Atacama, il tombe quelques millimètres de pluie par an. Les sulfures de cuivre s'y oxydent
            lentement, au contact d'eaux rares et très salées (brouillards côtiers, nappes profondes remontées par les
            failles) : au lieu des carbonates (malachite, azurite) des climats humides, c'est le chlorure de cuivre vert qui
            cristallise. Elle ne se conserve que si le climat reste sec : une seule saison des pluies abondantes la
            dissoudrait. L'hyperaridité de l'Atacama dure depuis ≈ 15 millions d'années.`,
          cond: { type: "climat", domaines: [[10, 25, 0, 0.05]], etiquettes: [["atacamite", 17.5, 0.18]], villes: ["Perpignan", "Montpellier"], chemin: [
            { T: 17, ai: 0.01, n: 1, t: "Désert d'Atacama : ≈ 17 °C, quelques millimètres de pluie par an, moins de 1 % de l'ETP." },
            { n: 2, t: "Les sulfures de cuivre s'oxydent ; l'eau rare et salée fixe le cuivre en chlorure vert : l'atacamite." },
          ], note: "Domaine schématique : sous ≈ 5 % de l'ETP. Plus humide, la malachite la remplace." },
          src: ["h5", SRC.reich, SRC.cameron] },
        { nom: "Sur les bronzes immergés",
          texte: `L'eau de mer, riche en chlore, transforme lentement le cuivre des bronzes antiques et des épaves en
            atacamite et en ses deux sœurs (paratacamite, clinoatacamite) : c'est une partie de la patine verte, et la
            « maladie du bronze » qui ronge les objets sortis de l'eau.`,
          cond: false, sansDiagramme: ARIDE },
      ],
    },
  });
})();
