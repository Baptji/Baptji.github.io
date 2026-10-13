// ============ Comment naissent les oxydes de fer : la carte des chemins (12/10/2026, H.4 refait de zéro, à valider) ============
// Sa demande : « recommencer une nouvelle partie en doublon, de zéro, pour avoir un nouveau regard ; croiser les sources ; un super
// schéma pour les oxydes de fer », puis « principalement les formes qui se trouvent dans le sol ». L'ancienne carte
// (oxydes-transformations.js, feFormationCard) reste en place sur #oxyde/fer : cette page est À CÔTÉ, route #oxyde/fer/chemins.
// Organisation (d'après Schwertmann 1985 fig. 10, Jolivet et al. 2006 fig. 1, Cudennec et Lecerf 2003) : deux « vallées » —
// à gauche le fer qui reste en partie réduit (sols engorgés : rouille verte → lépidocrocite), à droite le fer entièrement oxydé
// (sols aérés : ferrihydrite → goethite ou hématite) —, la goethite au centre (elle naît des deux), la réduction par les bactéries
// en tirets bleus, en bas deux chemins plus rares (oxydes magnétiques, feu) où des cases en pointillés renvoient aux cases du haut.
// Contenu : 1. carte cliquable + 9 milieux (chemin numéroté) ; 2. pas à pas à l'échelle des atomes (7 vignettes) ; 3. trois
// aiguillages chiffrés (demi-vie du Fe²⁺ selon le pH, CO₂ → goethite, facteurs goethite/hématite, pH discuté, Tasmanie) ;
// 4. pour aller plus loin ; 5. sources. Pas d'information au survol (sa règle) : tout se lit au clic.
// API : FerChemins.page() (rend #main), FerChemins.controle() → [] attendu, FerChemins.chevauchements() (dans la page) → [] attendu.
(function () {
  "use strict";
  const f1 = (x) => (Math.round(x * 10) / 10).toString();
  // MINERAUX est déclaré en const dans mineraux.js : il n'est pas une propriété de window
  const MIN = () => (typeof MINERAUX !== "undefined" ? MINERAUX : null);
  const nf = (x, d = 0) => x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  // espaces insécables entre un nombre et son unité, et dans « 200 000 » (seulement hors des balises)
  const UNITES = "YR|Y|R|°C|%|nm|mm|cm|km|m|mg|mmol|mol|mL|kJ|g|jours|jour|ans|heures|heure|minutes|minute|secondes|seconde|mois|h|s|Å";
  const typo = (t) => t.replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\wÀ-ÿ]))`, "g"), "$1\u00a0").replace(/(\d) (?=\d{3}(?!\d))/g, "$1\u00a0");
  const typoHTML = (h) => h.split(/(<[^>]*>)/).map((x) => (x.startsWith("<") ? x : typo(x))).join("");

  // ---------- 1. Sources ----------
  const SRC = {
    schw1985: "Schwertmann U. (1985). The effect of pedogenic environments on iron oxide minerals. <i>Advances in Soil Science</i> 1, 171–200.",
    sm1983: "Schwertmann U., Murad E. (1983). Effect of pH on the formation of goethite and hematite from ferrihydrite. <i>Clays and Clay Minerals</i> 31, 277–284.",
    chen2022: "Chen S. A., Heaney P. J., Post J. E., Eng P. J., Stubbs J. E. (2022). Hematite-goethite ratios at pH 2–13 and 25–170 °C: a time-resolved synchrotron X-ray diffraction study. <i>Chemical Geology</i> 606, 120995.",
    jol2006: "Jolivet J.-P., Tronc E., Chanéac C. (2006). Iron oxides: from molecular clusters to solid. A nice example of chemical versatility. <i>Comptes Rendus Géoscience</i> 338, 488–497.",
    cud2003: "Cudennec Y., Lecerf A. (2003). Étude des mécanismes de formation des oxy-hydroxydes de fer ; hypothèses de transformations topotactiques. <i>Comptes Rendus Chimie</i> 6, 437–444.",
    trolard2006: "Trolard F. (2006). Fougerite: from field experiment to the homologation of the mineral. <i>Comptes Rendus Géoscience</i> 338, 1158–1166.",
    hansel2003: "Hansel C. M., Benner S. G., Neiss J., Dohnalkova A., Kukkadapu R. K., Fendorf S. (2003). Secondary mineralization pathways induced by dissimilatory iron reduction of ferrihydrite under advective flow. <i>Geochimica et Cosmochimica Acta</i> 67, 2977–2992.",
    hansel2005: "Hansel C. M., Benner S. G., Fendorf S. (2005). Competing Fe(II)-induced mineralization pathways of ferrihydrite. <i>Environmental Science &amp; Technology</i> 39, 7147–7153.",
    singer1970: "Singer P. C., Stumm W. (1970). Acidic mine drainage: the rate-determining step. <i>Science</i> 167, 1121–1123 (loi de vitesse de l'oxydation du Fe²⁺ par l'oxygène).",
    scheinost1999: "Scheinost A. C., Schwertmann U. (1999). Color identification of iron oxides and hydroxysulfates: use and limitations. <i>Soil Science Society of America Journal</i> 63, 1463–1471 (couleurs Munsell médianes, tableau 3).",
    lamouroux1972: "Lamouroux M. (1972). État et comportement du fer dans les sols formés sur roches carbonatées au Liban. <i>Science du Sol</i> 1, 85–101 (ORSTOM).",
    larsen2001: "Larsen O., Postma D. (2001). Kinetics of reductive bulk dissolution of lepidocrocite, ferrihydrite, and goethite. <i>Geochimica et Cosmochimica Acta</i> 65, 1367–1379.",
    maher1988: "Maher B. A., Taylor R. M. (1988). Formation of ultrafine-grained magnetite in soils. <i>Nature</i> 336, 368–370.",
    liu2016: "Liu Q., Zhang C., Torrent J., Barrón V., Hu P., Jiang Z., Duan Z. (2016). Factors controlling magnetism of reddish brown soil profiles from calcarenites in southern Spain: dust input or in-situ pedogenesis? <i>Frontiers in Earth Science</i> 4, 51 (introduction : état des connaissances sur les oxydes magnétiques des sols, dont Le Borgne 1955 et Michel et al. 2010).",
    barron2002: "Barrón V., Torrent J. (2002). Evidence for a simple pathway to maghemite in Earth and Mars soils. <i>Geochimica et Cosmochimica Acta</i> 66, 2801–2806.",
    michel2007: "Michel F. M. et al. (2007). The structure of ferrihydrite, a nanocrystalline material. <i>Science</i> 316, 1726–1729.",
    ruan1995: "Ruan H. D., Gilkes R. J. (1995). Dehydroxylation of aluminous goethite: unit cell dimensions, crystal size and surface area. <i>Clays and Clay Minerals</i> 43, 196–211.",
    gehring1994: "Gehring A. U., Hofmeister A. M. (1994). The transformation of lepidocrocite during heating: a magnetic and spectroscopic study. <i>Clays and Clay Minerals</i> 42, 409–415.",
    pomies1998: "Pomiès M.-P., Morin G., Vignaud C. (1998). XRD study of the goethite-hematite transformation: application to the identification of heated prehistoric pigments. <i>European Journal of Solid State and Inorganic Chemistry</i> 35, 9–25.",
    bigham1996: "Bigham J. M., Schwertmann U., Traina S. J., Winland R. L., Wolf M. (1996). Schwertmannite and the chemical modeling of iron in acid sulfate waters. <i>Geochimica et Cosmochimica Acta</i> 60, 2111–2121.",
    wikifr: "Wikipédia en français, article « Ferrihydrite » (consulté le 12/10/2026) : dépôts dans les drains, rôle des bactéries du fer. Les articles « Goethite », « Hématite » et « Lépidocrocite » ne décrivent pas les chemins de formation.",
    cites: "Travaux cités d'après Schwertmann (1985) : Schwertmann (1959), oxydation d'une solution de Fe²⁺ avec du CO₂ ; Taylor et Graley (1967), Tasmanie ; Chen et al. (1980), rizières ; Kämpf et Schwertmann (1982), Brésil du Sud ; Schwertmann, Murad et Schulze (1982), Allemagne du Sud ; Torrent et al. (1982), humidité relative ; Curi (1983), Brésil central ; Torrent et al. (1984), rougeur et hématite.",
  };
  // ordre d'affichage de la liste des sources
  const ORDRE_SRC = ["schw1985", "sm1983", "chen2022", "jol2006", "cud2003", "trolard2006", "michel2007", "singer1970", "hansel2003", "hansel2005",
    "larsen2001", "lamouroux1972", "scheinost1999", "maher1988", "liu2016", "barron2002", "ruan1995", "gehring1994", "pomies1998", "bigham1996", "wikifr", "cites"];

  // ---------- 2. Les formes du fer (cases du schéma) ----------
  // x, y = centre ; w, h = taille ; type : "roche" | "dissous" | "min" (défaut) | "fantome" (renvoie à la case `de`)
  // ic = petit dessin de la forme des grains ; sw = couleur de repli si la fiche n'a pas de pastille
  const N = {
    roche: { x: 500, y: 38, w: 640, h: 52, type: "roche", nom: "Minéraux de la roche qui contiennent du fer",
      sous: "biotite · olivine · pyroxènes · amphiboles · chlorites · pyrite",
      liens: ["biotite", "olivine", "augite", "hornblende", "pyrite", "siderite", "magnetite"],
      texte: "Dans les roches, le fer est surtout à l'état réduit, Fe²⁺, au cœur des silicates sombres : biotite, olivine, pyroxènes, amphiboles, chlorites. On en trouve aussi dans la pyrite (sulfure) et la sidérite (carbonate) ; la magnétite contient Fe²⁺ et Fe³⁺. En s'altérant, ces minéraux libèrent leur fer, qui s'oxyde et forme les oxydes : la part du fer total passée en oxydes mesure l'avancement de l'altération d'un sol (Schwertmann 1985).",
      src: ["schw1985"] },
    fe2: { x: 500, y: 140, w: 250, h: 56, type: "dissous", nom: "Fe²⁺ dissous", sous: "fer réduit, mobile, incolore",
      texte: "Le fer réduit est soluble : entouré de six molécules d'eau, incolore, il voyage avec l'eau du sol. Il ne dure qu'en l'absence d'oxygène (sol engorgé, nappe) ou dans une eau acide, où il s'oxyde lentement : il faut environ un mois pour en oxyder la moitié à pH 5, quelques minutes à pH 7 (aiguillage 1). Le Fe³⁺, lui, est presque insoluble : il ne reste dissous que dans une eau très acide, ou tenu par les acides de l'humus en complexes organiques, sous lesquels il peut descendre dans le sol, comme dans les podzols (Schwertmann 1985).",
      src: ["singer1970", "schw1985"] },
    rv: { x: 215, y: 268, w: 230, h: 60, id: "fougerite", nom: "Rouille verte", sous: "fougérite : Fe²⁺ et Fe³⁺ en feuillets", ic: "feuillets", sw: "#5a7060",
      texte: "Un hydroxyde en feuillets où Fe²⁺ et Fe³⁺ (et, à Fougères, un peu de magnésium) se partagent les octaèdres ; l'excès de charge positive dû au Fe³⁺ est compensé par des anions et de l'eau entre les feuillets. Bleu-vert, elle donne leur couleur aux horizons engorgés des gleys ; à l'air, elle vire à l'ocre en devenant lépidocrocite. Découverte dans les sols de la forêt de Fougères (Ille-et-Vilaine) en 1996, homologuée par l'Association internationale de minéralogie en février 2004 sous le nom de fougérite (Trolard 2006).",
      forme: "plaquettes hexagonales faites de feuillets", couleur: "bleu-vert, fugace", src: ["trolard2006", "jol2006"] },
    frh: { x: 785, y: 268, w: 230, h: 60, id: "ferrihydrite", nom: "Ferrihydrite", sous: "grains de 2 à 5 nm, pleins d'eau", ic: "grains", sw: "#8a4a2a",
      texte: "Le premier solide du Fe³⁺ : des grains de 2 à 5 nanomètres, mal ordonnés, pleins d'eau ; environ un fer sur cinq y est entouré de quatre oxygènes au lieu de six (Michel et al. 2007). Elle se forme quand le Fe³⁺ apparaît plus vite qu'un cristal ne peut grandir, ou quand de la silice, de l'humus ou du phosphate gênent la croissance. Instable, elle devient goethite ou hématite en quelques mois à quelques années à 25 °C, sauf si la silice ou l'humus la protègent : des sols de Nouvelle-Zélande en gardent depuis 200 000 ans (Jolivet et al. 2006). C'est un indice de sols frais et humides, où le fer vient de précipiter (Schwertmann 1985).",
      forme: "grains de 2 à 5 nm, assemblés en agrégats", couleur: "médiane 6,6 YR (de 2,8 à 9,2 YR) : brun-rouille", src: ["michel2007", "jol2006", "schw1985", "scheinost1999"] },
    lep: { x: 130, y: 402, w: 210, h: 60, id: "lepidocrocite", nom: "Lépidocrocite", sous: "γ-FeO(OH) · lattes orange", ic: "lattes", sw: "#c96a2e",
      texte: "Même formule que la goethite, FeO(OH), mais une autre charpente : des feuillets ondulés d'octaèdres tenus entre eux par des liaisons hydrogène. Elle ne naît qu'en présence de Fe²⁺, quand celui-ci s'oxyde assez vite et sans carbonate (Schwertmann 1985 ; Jolivet et al. 2006). Un peu moins stable que la goethite, elle dure pourtant des temps pédologiques. On la trouve en taches, en gaines autour des racines et en bandes orange dans les sols argileux non calcaires, engorgés par intermittence, des climats tempérés (Schwertmann 1985).",
      forme: "lattes allongées", couleur: "médiane 6,8 YR (de 4,9 à 7,9 YR) : orange", src: ["schw1985", "jol2006", "scheinost1999"] },
    goe: { x: 500, y: 402, w: 240, h: 64, id: "goethite", nom: "Goethite", sous: "α-FeO(OH) · aiguilles jaune-brun", ic: "aiguilles", sw: "#b07830",
      texte: "Des doubles chaînes d'octaèdres qui laissent des tunnels, en aiguilles jaune-brun. C'est l'oxyde de fer le plus répandu des sols et le plus stable dans la plupart d'entre eux (Schwertmann 1985). Elle naît par les deux chemins : directement de l'eau, ion par ion, ou en recristallisant la ferrihydrite ; plus lentement, de la rouille verte et de la lépidocrocite. Dans les sols très altérés, jusqu'à un fer sur trois y est remplacé par de l'aluminium ; dans les sols engorgés et les sols peu acides, presque aucun (Schwertmann 1985).",
      forme: "aiguilles (au laboratoire, environ 200 nm de long et 15 nm de large : Chen et al. 2022)", couleur: "médiane 0,4 Y (de 7,3 YR à 1,6 Y) : jaune-brun", src: ["schw1985", "chen2022", "scheinost1999"] },
    hem: { x: 865, y: 402, w: 210, h: 64, id: "hematite", nom: "Hématite", sous: "α-Fe₂O₃ · plaquettes rouges", ic: "plaquette", sw: "#a04030",
      texte: "Un oxyde sans eau : des oxygènes serrés, deux sites sur trois occupés par du fer. C'est le pigment le plus puissant des sols : 0,5 à 1 % de ces produits rouges suffisent à rougir un sol pauvre en humus (Lamouroux 1972), et la rougeur d'un sol croît en ligne droite avec sa teneur en hématite (Torrent et al. 1984, d'après Schwertmann 1985). Dans un sol, elle ne vient pas de la goethite, qui ne se déshydrate pas à ces températures, mais de la ferrihydrite (Schwertmann 1985). Elle domine dans les sols chauds à saison sèche et bien drainés ; dans les sols frais et humides, elle manque.",
      forme: "plaquettes hexagonales (au laboratoire, environ 60 nm de diamètre : Chen et al. 2022)", couleur: "médiane 1,2 YR (de 3,5 R à 4,1 YR) : rouge", src: ["lamouroux1972", "schw1985", "chen2022", "scheinost1999"] },
    mag: { x: 110, y: 636, w: 180, h: 54, id: "magnetite", nom: "Magnétite", sous: "Fe₃O₄ · noire, magnétique", ic: "octaedre", sw: "#3a3a40",
      texte: "Fe²⁺ et Fe³⁺ dans une charpente de spinelle ; noire et magnétique. Dans les sols, elle est surtout héritée de la roche, mais des cristaux de moins de 100 nm s'y forment aussi, ce qui rend les horizons de surface plus magnétiques que la roche (Maher et Taylor 1988 ; Liu et al. 2016). Au laboratoire, il faut beaucoup de Fe²⁺ au contact de la ferrihydrite (Hansel et al. 2005).",
      forme: "octaèdres ; néoformée, grains de moins de 100 nm", couleur: "noire", src: ["maher1988", "liu2016", "hansel2005"] },
    mgh: { x: 500, y: 636, w: 190, h: 54, id: "maghemite", nom: "Maghémite", sous: "γ-Fe₂O₃ · brune, magnétique", ic: "lacunes", sw: "#7d4a38",
      texte: "La charpente de la magnétite, mais tout le fer oxydé et des sites laissés vides ; même formule que l'hématite, mais magnétique. Fréquente dans les sols tropicaux et subtropicaux, surtout les sols rouges ; en climat tempéré, seulement en surface, près de charbons de bois : le feu en est la principale origine (Schwertmann 1985). Elle peut aussi venir d'une magnétite oxydée à l'air (Liu et al. 2016).",
      forme: "grains fins, souvent pseudomorphes de l'oxyde chauffé", couleur: "médiane 8,3 YR, sombre (clarté 3,1) : brune", src: ["schw1985", "liu2016", "scheinost1999"] },
    gfrh: { x: 110, y: 540, w: 150, h: 34, type: "fantome", de: "frh" },
    glep: { x: 575, y: 540, w: 140, h: 34, type: "fantome", de: "lep" },
    ggoe: { x: 760, y: 540, w: 140, h: 34, type: "fantome", de: "goe" },
    ghem: { x: 900, y: 636, w: 140, h: 40, type: "fantome", de: "hem" },
  };

  // ---------- 3. Les passages (flèches) ----------
  // t : type (dis = passage dans l'eau, ox = oxydation, cri = cristallisation depuis l'eau, sol = réarrangement dans le solide,
  // red = réduction par des bactéries, feu = chauffage) ; d : tracé(s) ; lab : [x, y, ancre, lignes] (une par tracé pour red) ;
  // num : pastille d'étape ; vig : vignettes « à l'échelle des atomes » montrées dans le détail
  const TYPES = {
    dis: "le fer passe dans l'eau", ox: "oxydation", cri: "cristallisation dans l'eau, ion par ion",
    sol: "réarrangement sur place, dans le solide", red: "réduction par des bactéries", feu: "chauffage par un feu",
  };
  const F = {
    a1: { de: "roche", vers: "fe2", t: "dis", d: "M500 64 L500 110", lab: [516, 92, "start", ["le fer passe dans l'eau"]], num: [500, 87],
      titre: "Le fer quitte le minéral",
      texte: "L'eau de pluie, rendue un peu acide par le CO₂ du sol et les acides de l'humus, attaque les minéraux qui contiennent du fer. Le fer y est surtout réduit, Fe²⁺ : il passe dans l'eau, entouré de six molécules d'eau. Dans un sol aéré, il est oxydé presque aussitôt, au contact même du grain ; dans un sol engorgé, il reste dissous et voyage avec l'eau.",
      cond: ["Eau acide : CO₂ du sol, acides de l'humus.",
        "Plus la roche est riche en fer et s'altère vite, plus le fer arrive vite, ce qui favorise ensuite l'hématite : au Natal (Afrique du Sud), des sols rouges sur des filons de dolérite côtoient des sols jaunes sur schiste (Schwertmann 1985)."],
      duree: "Au rythme de l'altération du minéral (voir sa fiche, carte « Énergie de liaison et cinétique »).",
      src: ["schw1985", "jol2006"], vig: ["v1"] },
    a2: { de: "fe2", vers: "rv", t: "ox", d: "M405 168 L302 236", lab: [338, 187, "end", ["peu d'oxygène :", "oxydation partielle"]], num: [353, 202],
      titre: "Peu d'oxygène : la rouille verte",
      texte: "Quand l'oxygène manque, seule une partie du fer s'oxyde. Fe²⁺ et Fe³⁺ s'assemblent alors en feuillets d'hydroxyde ; l'excès de charge positive dû au Fe³⁺ est compensé par des anions (carbonate, sulfate, chlorure) et de l'eau logés entre les feuillets. C'est la rouille verte. Dans les sols, elle porte un nom de minéral : la fougérite, découverte dans les gleys de la forêt de Fougères et homologuée en 2004. Elle donne leur teinte bleu-vert aux horizons engorgés.",
      cond: ["Sol gorgé d'eau : peu d'oxygène, beaucoup de Fe²⁺.",
        "Au laboratoire, environ un fer sur trois oxydé (Jolivet et al. 2006) ; dans les gleys de Fougères, l'eau du sol est en équilibre avec une rouille verte dont 42 à 86 % du fer est oxydé (Trolard 2006)."],
      duree: "Pendant les périodes d'engorgement, au fil des saisons (Trolard 2006).",
      src: ["trolard2006", "jol2006"], vig: ["v7a"] },
    a3: { de: "fe2", vers: "frh", t: "ox", d: "M595 168 L698 236", lab: [662, 187, "start", ["oxygène abondant :", "oxydation complète"]], num: [647, 202],
      titre: "Assez d'oxygène : la ferrihydrite",
      texte: "Avec assez d'oxygène, tout le fer passe à l'état Fe³⁺. Plus chargé, cet ion arrache des H⁺ à ses molécules d'eau (hydrolyse) ; les ions se soudent aussitôt les uns aux autres par des ponts OH, puis O. En un instant naissent des grains de 2 à 5 nanomètres, mal ordonnés et pleins d'eau : la ferrihydrite, brun-rouille, premier solide du fer dans un sol aéré. Le Fe³⁺ relâché par l'humus suit le même chemin.",
      cond: ["Oxygène : à pH 7, la moitié du Fe²⁺ est oxydée en quelques minutes ; à pH 6, en quelques heures ; à pH 5, en un mois environ (calcul d'après Singer et Stumm 1970 : aiguillage 1).",
        "Le Fe³⁺ apparaît plus vite qu'un cristal ne peut grandir : oxydation rapide, fer abondant.",
        "Silice, humus ou phosphate gênent la croissance des cristaux et font de la ferrihydrite : une eau à 20 mg/L de Fe²⁺ oxydée vite donne de la lépidocrocite jusqu'à 4 mg/L de silicium, de la ferrihydrite de 5 à 12 mg/L (Schwertmann 1985)."],
      duree: "Quasi instantané une fois le Fe³⁺ formé (Jolivet et al. 2006).",
      src: ["singer1970", "jol2006", "schw1985", "michel2007"], vig: ["v2", "v3", "v4"] },
    a4: { de: "fe2", vers: "goe", t: "cri", d: "M500 168 L500 368", lab: [512, 258, "start", ["fer apporté peu à peu :", "goethite ion par ion"]], num: [500, 312],
      titre: "Fer apporté peu à peu : la goethite directe",
      texte: "Quand le fer arrive lentement — minéral qui s'altère peu à peu, fer retenu puis relâché par l'humus —, le Fe³⁺ dissous reste trop rare pour que la ferrihydrite précipite, mais assez abondant pour la goethite, bien moins soluble. Les ions se posent alors un à un sur des germes et construisent des aiguilles. C'est, selon Schwertmann (1985), la raison pour laquelle l'humus abondant des sols frais et humides fait de la goethite et empêche l'hématite, qui a besoin de ferrihydrite.",
      cond: ["Fer libéré lentement.",
        "Humus : il retient le Fe³⁺ en complexes et maintient sa concentration sous le seuil de la ferrihydrite (produit de solubilité 10⁻³⁷ à 10⁻³⁹) mais au-dessus de celui de la goethite (≈ 10⁻⁴²). C'est une hypothèse de Schwertmann (1985), pas encore démontrée par l'expérience.",
        "Frais et humide."],
      duree: "Lent : c'est le rythme d'arrivée du fer qui fixe celui de la croissance.",
      src: ["schw1985"], vig: ["v5b"] },
    a5: { de: "rv", vers: "lep", t: "sol", d: "M165 298 L146 368", lab: [140, 330, "end", ["l'air entre vite,", "sans carbonate"]], num: [156, 333],
      titre: "L'air entre vite : la lépidocrocite",
      texte: "Quand la nappe baisse et que l'air entre d'un coup dans les pores, la rouille verte s'oxyde sur place : ses feuillets perdent des électrons et des H⁺, se plissent et deviennent les feuillets ondulés de la lépidocrocite, sans repasser par l'eau (Cudennec et Lecerf 2003 ; Jolivet et al. 2006). La lépidocrocite ne se forme qu'en présence de Fe²⁺ : d'où ses taches et ses gaines orange le long des pores et des racines des sols engorgés par intermittence, presque jamais dans les sols calcaires (Schwertmann 1985).",
      cond: ["Oxydation rapide, beaucoup d'oxygène d'un coup ; trop lente, elle donne un mélange avec de la goethite, ou de la goethite seule (Cudennec et Lecerf 2003).",
        "pH entre 5 et 7 (Schwertmann 1985).",
        "Ni carbonate ni CO₂ abondant (aiguillage 2).",
        "Peu de silice (moins de 4 mg/L de silicium) et peu d'aluminium (moins de 10 % du fer) (Schwertmann 1985)."],
      duree: "Rapide : un gley mis à l'air vire du bleu-vert à l'ocre (Trolard 2006).",
      src: ["schw1985", "cud2003", "jol2006", "trolard2006"], vig: ["v7"] },
    a6: { de: "rv", vers: "goe", t: "cri", d: "M295 298 L405 366", lab: [362, 318, "start", ["oxydation lente", "ou carbonates"]], num: [350, 333],
      titre: "Oxydation lente ou carbonates : la goethite",
      texte: "Si l'oxygène arrive lentement, ou si l'eau contient des carbonates, la même rouille verte donne de la goethite au lieu de lépidocrocite. Le carbonate stabilise la rouille verte et ralentit son oxydation (Schwertmann 1985 ; Cudennec et Lecerf 2003). Au laboratoire, un peu de CO₂ ajouté à l'oxygène suffit à faire basculer le produit (aiguillage 2) ; dans un sol, le CO₂ rejeté par les racines peut favoriser la goethite à leur contact (Schwertmann 1985).",
      cond: ["Oxydation lente.", "Carbonates ou CO₂ : sols calcaires, voisinage des racines.",
        "Aluminium abondant (plus de 10 % du fer) : il supprime la lépidocrocite au laboratoire (Schwertmann 1985)."],
      duree: "Au rythme de l'oxygène qui entre.",
      src: ["schw1985", "cud2003"], vig: [] },
    a7: { de: "lep", vers: "goe", t: "cri", lent: true, d: "M235 410 L376 410", lab: [306, 435, "middle", ["très lent"]], num: [306, 410],
      titre: "Lépidocrocite → goethite : très lent",
      texte: "La lépidocrocite est un peu moins stable que la goethite, mais elle se transforme si lentement dans un sol qu'elle y dure des temps pédologiques. Les deux minéraux naissent le plus souvent côte à côte, par deux chemins concurrents, plutôt que l'un de l'autre (Schwertmann 1985). Du Fe²⁺ dissous accélère la transformation (Hansel et al. 2005).",
      cond: ["Temps.", "Fe²⁺ dissous au contact des grains."],
      duree: "Très lente dans un sol.",
      src: ["schw1985", "hansel2005"], vig: [] },
    a8: { de: "frh", vers: "goe", t: "cri", d: "M700 298 L600 366", lab: [634, 318, "end", ["frais, humide :", "se redissout"]], num: [650, 332],
      titre: "Frais et humide : la ferrihydrite se redissout en goethite",
      texte: "La ferrihydrite est instable. Entourée d'eau, elle se redissout très lentement ; les ions Fe³⁺ libérés vont se poser sur des germes de goethite, qui grandissent en aiguilles faites de doubles chaînes d'octaèdres (Jolivet et al. 2006). Ce passage par l'eau est favorisé quand la ferrihydrite est un peu plus soluble : vers pH 4, ou en milieu très basique, d'après Schwertmann et Murad (1983).",
      cond: ["Frais : la chaleur favorise l'hématite (aiguillage 3).", "Humide : beaucoup d'eau autour des grains.", "Humus abondant.",
        "pH vers 4, ou au-dessus de 10, quand il est maintenu constant (Schwertmann et Murad 1983) ; une autre expérience trouve un résultat différent quand le pH est laissé libre (Chen et al. 2022) : aiguillage 3."],
      duree: "De quelques mois à quelques années à 25 °C au laboratoire : jusqu'à trois ans chez Schwertmann et Murad (1983), 1 517 jours chez Chen et al. (2022).",
      src: ["sm1983", "schw1985", "jol2006", "chen2022"], vig: ["v5"] },
    a9: { de: "frh", vers: "hem", t: "sol", d: "M840 298 L860 366", lab: [870, 322, "start", ["chaud, sec :", "se déshydrate"]], num: [850, 332],
      titre: "Chaud et sec : la ferrihydrite se déshydrate en hématite",
      texte: "Dans un sol chaud qui se dessèche, les grains de ferrihydrite se collent, perdent l'eau qu'ils contiennent et leurs atomes se réarrangent sans repasser par l'eau : l'hématite naît en petites plaquettes (Schwertmann et Murad 1983 ; Jolivet et al. 2006). La goethite, elle, ne se change pas en hématite à la température d'un sol : la ferrihydrite est le passage obligé (Schwertmann 1985). Ce mécanisme « sur place » est aujourd'hui discuté : Chen et al. (2022) voient le pH de l'eau changer pendant la réaction et pensent que du fer dissous y participe. Barrón et Torrent (2002) proposent en outre un passage par une forme magnétique, une maghémite hydratée.",
      cond: ["Chaleur : toutes les expériences trouvent plus d'hématite quand la température monte (Schwertmann 1985 ; Chen et al. 2022).",
        "Saison sèche : moins d'eau autour des grains, plus d'hématite (Torrent et al. 1982, d'après Schwertmann 1985).",
        "Peu d'humus.", "Fer libéré vite (roches riches en fer qui s'altèrent vite).",
        "pH vers 7 à 8 quand il est maintenu (Schwertmann et Murad 1983) ; pH 3 à 5 ou 9 à 10 quand il est laissé libre (Chen et al. 2022)."],
      duree: "Lent à la température d'un sol : à 28 °C, la transformation est 50 fois plus lente qu'à 45 °C (Torrent et al. 1982, d'après Schwertmann 1985). Il suffit ensuite de 0,5 à 1 % de ces produits rouges pour rougir un sol pauvre en humus (Lamouroux 1972).",
      src: ["schw1985", "sm1983", "jol2006", "chen2022", "barron2002", "lamouroux1972"], vig: ["v6"] },
    red: { de: ["frh", "lep"], deNom: "Oxydes de fer du sol", vers: "fe2", t: "red",
      d: ["M902 256 C955 185 770 112 627 126", "M25 392 C-4 250 205 118 373 126"],
      lab: [[845, 112, "middle", ["réduction (bactéries)"]], [252, 118, "middle", ["réduction (bactéries)"]]], num: [834, 157],
      titre: "Réduction par les bactéries : le fer repart",
      texte: "Quand le sol est gorgé d'eau, l'oxygène vient à manquer. Des bactéries continuent à respirer en cédant aux oxydes de fer les électrons tirés de la matière organique : le Fe³⁺ redevient Fe²⁺ et se dissout (Schwertmann 1985). Les oxydes les moins ordonnés cèdent les premiers : réduite au laboratoire, la ferrihydrite se dissout plus vite que la lépidocrocite, elle-même plus vite que la goethite (Larsen et Postma 2001). Le fer remis en mouvement quitte certaines zones, qui se décolorent en gris, et précipite ailleurs en taches et en concrétions (Schwertmann 1985).",
      cond: ["Sol engorgé, sans oxygène.", "Matière organique, nourriture des bactéries.",
        "Température assez douce pour l'activité des micro-organismes (Trolard 2006)."],
      duree: "Au rythme des saisons d'engorgement (Trolard 2006).",
      src: ["schw1985", "larsen2001", "trolard2006"], vig: [] },
    b1: { de: "gfrh", vers: "mag", t: "sol", d: "M110 557 L110 607", lab: [126, 580, "start", ["beaucoup de Fe²⁺", "(bactéries)"]], num: [110, 582],
      titre: "Beaucoup de Fe²⁺ : la magnétite",
      texte: "Quand des bactéries réduisent une partie de la ferrihydrite, le Fe²⁺ produit se fixe sur les grains restants et les transforme : avec peu de Fe²⁺, en goethite et en lépidocrocite ; avec beaucoup, en magnétite, l'oxyde noir et magnétique où Fe²⁺ et Fe³⁺ cohabitent (Hansel et al. 2003, 2005). Dans les sols bien drainés, de très petits cristaux de magnétite, de moins de 100 nm, se forment aussi et rendent les horizons de surface plus magnétiques que la roche ; leur mode de formation est encore discuté (Maher et Taylor 1988 ; Liu et al. 2016).",
      cond: ["Au-delà d'environ 1 millimole de Fe²⁺ par gramme de ferrihydrite, sans bicarbonate (Hansel et al. 2005) ; dans une eau qui circule, au-delà de 0,3 mmol/L de Fe²⁺ (Hansel et al. 2003).",
        "pH 8 accélère la formation de magnétite, pH 6 la freine (Hansel et al. 2005)."],
      duree: "16 jours dans l'expérience en colonne de Hansel et al. (2003).",
      src: ["hansel2003", "hansel2005", "maher1988", "liu2016"], vig: [] },
    b2: { de: "mag", vers: "mgh", t: "sol", d: "M200 636 L403 636", lab: [318, 626, "middle", ["à l'air, lentement"]], num: [240, 636],
      titre: "À l'air : la magnétite devient maghémite",
      texte: "Exposée à l'oxygène, la magnétite s'oxyde dans le solide : ses Fe²⁺ deviennent Fe³⁺ et une partie du fer s'en va, laissant des sites vides, sans que la charpente change. C'est la maghémite : même formule que l'hématite, mais magnétique. Les grains de quelques nanomètres s'oxydent très facilement (Jolivet et al. 2006). C'est une des origines proposées pour la maghémite des sols, à côté du feu (Schwertmann 1985 ; Liu et al. 2016).",
      cond: ["Oxygène.", "Grains très fins."], duree: "",
      src: ["jol2006", "schw1985", "liu2016"], vig: [] },
    c1: { de: "glep", vers: "mgh", t: "feu", d: "M556 557 L532 607", lab: [522, 582, "end", ["200 à 300 °C"]], num: [544, 582],
      titre: "Feu : la lépidocrocite devient maghémite",
      texte: "Chauffée, la lépidocrocite perd son eau et se réorganise en maghémite : la transformation commence vers 175 °C, se fait vers 200 °C et s'achève vers 300 °C ; plus chaud, la maghémite finit en hématite (Gehring et Hofmeister 1994).",
      cond: ["De 200 à 300 °C."], duree: "",
      src: ["gehring1994"], vig: [] },
    c2: { de: "ggoe", vers: "mgh", t: "feu", d: "M728 557 L597 624", lab: [676, 616, "start", ["+ matière organique :", "300 à 500 °C"]], num: [663, 590],
      titre: "Feu et matière organique : la maghémite",
      texte: "Chauffées vers 300 à 500 °C au contact de matière organique, la goethite et les autres oxydes de fer du sol donnent de la maghémite, magnétique, au lieu d'hématite. Une goethite riche en aluminium chauffée deux heures à 450 °C avec du sucre devient une maghémite riche en aluminium ; or les maghémites des sols tropicaux sont riches en aluminium, ce qui désigne d'anciens feux. En climat tempéré, on n'en trouve qu'en surface, là où il y a du charbon de bois (Schwertmann 1985).",
      cond: ["De 300 à 500 °C.", "Matière organique : litière, racines, humus."], duree: "",
      src: ["schw1985"], vig: [] },
    c3: { de: "ggoe", vers: "ghem", t: "feu", d: "M792 557 L872 614", lab: [880, 556, "start", ["sans matière", "organique :", "dès 240 à 270 °C"]], num: [832, 585],
      titre: "Feu sans matière organique : la goethite rougit",
      texte: "Chauffée, la goethite perd l'eau de sa structure — 2 FeO(OH) → Fe₂O₃ + H₂O — et devient de l'hématite : l'ocre jaune devient rouge. La perte d'eau culmine vers 240 à 270 °C selon la teneur en aluminium (Ruan et Gilkes 1995). Au Paléolithique, on a utilisé de l'hématite naturelle et, parfois, de la goethite chauffée (Pomiès et al. 1998).",
      cond: ["Dès 240 à 270 °C.", "Peu de matière organique : milieu oxydant."], duree: "",
      src: ["ruan1995", "pomies1998", "schw1985"], vig: [] },
  };

  // ---------- 4. Les milieux : le chemin que suit le fer, étape par étape ----------
  const MIL = [
    { id: "brun", court: "Sol brun sur granite", nom: "Sol brun sur granite", lieu: "Massif armoricain, Massif central",
      cond: ["tempéré (8 à 15 °C)", "humide", "acide", "humus abondant", "bien drainé"],
      etapes: [["a1", "La biotite et les autres minéraux ferreux du granite s'altèrent lentement ; leur fer passe dans l'eau du sol."],
        ["a4", "L'humus abondant retient le fer et le relâche peu à peu : la ferrihydrite n'atteint pas son seuil, la goethite cristallise directement."],
        ["a3", "Là où le fer arrive plus vite, un peu de ferrihydrite se forme…"],
        ["a8", "… et, au frais et à l'humidité, elle vieillit elle aussi en goethite."]],
      res: { min: ["goe"], t: "Goethite seule : sol brun-jaune. Au frais et à l'humidité, les sols sont sans hématite (Schwertmann 1985)." },
      src: ["schw1985"] },
    { id: "rossa", court: "Terra rossa", nom: "Terra rossa sur calcaire", lieu: "Provence, Languedoc ; décrite aussi au Liban par Lamouroux (1972)",
      cond: ["étés chauds et secs", "pluie > 500 mm", "décarbonaté, bien drainé", "peu d'humus"],
      etapes: [["a1", "En se dissolvant, le calcaire libère les impuretés qu'il contenait : argiles et fer."],
        ["a3", "Le sol décarbonaté, bien drainé, s'aère : le fer précipite en ferrihydrite."],
        ["a9", "Étés chauds et secs, peu d'humus : la ferrihydrite se déshydrate en hématite ; 0,5 à 1 % suffit à rougir le sol."],
        ["a8", "Pendant les saisons humides, une partie devient goethite : les deux coexistent."]],
      res: { min: ["hem", "goe"], t: "Hématite et goethite : sol rouge. La rubéfaction ne se produit qu'en milieu bien drainé et décarbonaté, avec des saisons humides et sèches qui alternent ; elle demande plus de 500 mm de pluie (Lamouroux 1972)." },
      src: ["lamouroux1972", "schw1985"] },
    { id: "pseudogley", court: "Pseudogley", nom: "Sol à nappe perchée (pseudogley)", lieu: "sols limoneux posés sur une couche peu perméable",
      cond: ["engorgé l'hiver", "ressuyé au printemps", "non calcaire"],
      etapes: [["red", "Hiver : l'eau s'accumule au-dessus de la couche peu perméable. Privées d'oxygène, des bactéries réduisent les oxydes : le fer redevient Fe²⁺, se déplace, et la terre qu'il quitte se décolore en gris."],
        ["a2", "Le Fe²⁺ peu oxydé passe souvent par une rouille verte fugace (Schwertmann 1985)."],
        ["a5", "Printemps : la nappe baisse, l'air entre par les gros pores et les fissures ; oxydation rapide : taches et gaines orange de lépidocrocite."],
        ["a6", "Là où l'oxydation est plus lente, ou au contact des racines qui rejettent du CO₂ : goethite."]],
      res: { min: ["lep", "goe"], t: "Sol marbré : taches orange (lépidocrocite, goethite) sur fond gris. La lépidocrocite manque presque toujours dans les sols calcaires (Schwertmann 1985)." },
      src: ["schw1985", "trolard2006"] },
    { id: "gley", court: "Gley de Fougères", nom: "Gley de la forêt de Fougères", lieu: "Ille-et-Vilaine, sur granite",
      cond: ["engorgé presque toute l'année", "nappe qui monte et descend"],
      etapes: [["red", "Gorgé d'eau, le sol perd son oxygène ; les bactéries réduisent le fer, qui passe en solution."],
        ["a2", "Une partie seulement s'oxyde : la fougérite colore l'horizon en bleu-vert."],
        ["a5", "Quand la nappe baisse, ou quand on ouvre une fosse, l'air oxyde la fougérite : l'horizon vire à l'ocre, en lépidocrocite."]],
      res: { min: ["rv", "lep"], t: "Horizon bleu-vert à fougérite, qui vire à l'ocre au contact de l'air (Trolard 2006)." },
      src: ["trolard2006"] },
    { id: "ocre", court: "Source ferrugineuse", nom: "Source ferrugineuse, drain bouché par l'ocre", lieu: "eau souterraine qui sort à l'air libre",
      cond: ["eau souterraine sans oxygène", "riche en Fe²⁺", "silice, humus"],
      etapes: [["a3", "L'eau souterraine, sans oxygène, transporte du Fe²⁺ ; à l'air libre (source, fossé, drain), il s'oxyde d'un coup, aidé par des bactéries du fer. La silice et l'humus de l'eau empêchent les cristaux de grandir : boue ocre de ferrihydrite, qui peut boucher les drains."],
        ["a8", "Avec le temps, une partie devient goethite : les dépôts anciens de fer des marais mêlent les deux (Schwertmann 1985)."]],
      res: { min: ["frh", "goe"], t: "Ocre de ferrihydrite, puis mélange ferrihydrite et goethite (Schwertmann 1985 ; Wikipédia, « Ferrihydrite »)." },
      src: ["schw1985", "wikifr"] },
    { id: "podzol", court: "Podzol", nom: "Podzol des Landes", lieu: "sable acide sous pins et bruyères",
      cond: ["très acide", "humus brut", "sableux, drainant"],
      etapes: [["a1", "Les acides de l'humus brut attaquent les rares minéraux ferreux du sable."],
        ["a3", "Le fer descend avec l'eau, tenu par les acides organiques ; plus bas, il précipite avec eux en ferrihydrite, que l'humus empêche de cristalliser : horizon brun-rouille, parfois cimenté (l'alios des Landes)."],
        ["a8", "Lentement, une partie devient goethite ; jamais d'hématite sous tant d'humus."]],
      res: { min: ["frh", "goe"], t: "Ferrihydrite et goethite liées à l'humus : dans les horizons enrichis des podzols, une forte part du fer reste en ferrihydrite (Schwertmann 1985)." },
      src: ["schw1985"] },
    { id: "tropical", court: "Sol rouge tropical", nom: "Sol rouge tropical, haut de versant", lieu: "basalte, Brésil central (Curi 1983)",
      cond: ["chaud", "saison sèche", "bien drainé"],
      etapes: [["a1", "Le basalte, riche en fer, s'altère vite : le fer arrive en abondance."],
        ["a3", "Il précipite en ferrihydrite."],
        ["a9", "En haut de versant, le sol bien drainé sèche à la saison sèche : hématite (goethite / (goethite + hématite) = 0,19 ; teinte 2,5 YR)."],
        ["a8", "176 m plus loin et 2 m plus bas, dans le creux plus humide : goethite seule, sol jaune (10 YR)."]],
      res: { min: ["hem", "goe"], t: "Rouge en haut, jaune en bas, sur la même roche et sous le même climat : sur 176 m, seul le drainage change (Curi 1983, d'après Schwertmann 1985)." },
      src: ["schw1985"] },
    { id: "magnetique", court: "Surface magnétique", nom: "Horizon de surface magnétique", lieu: "sols bien drainés d'Angleterre étudiés par Maher et Taylor (1988)",
      cond: ["bien drainé", "épisodes humides"],
      etapes: [["a1", "Le fer quitte les minéraux de la roche."],
        ["a3", "Il précipite en ferrihydrite."],
        ["b1", "Une des explications proposées : lors des épisodes humides, un peu de Fe²⁺ produit par des bactéries réagit avec la ferrihydrite et donne de la magnétite en grains de moins de 100 nm."],
        ["b2", "À l'air, ces grains s'oxydent lentement en maghémite."]],
      res: { min: ["mag", "mgh"], t: "Un horizon de surface plus magnétique que la roche. D'autres explications sont proposées : bactéries, feux, passage de la ferrihydrite par une forme magnétique avant l'hématite (Liu et al. 2016)." },
      src: ["maher1988", "liu2016", "hansel2005"] },
    { id: "feu", court: "Après un feu", nom: "Surface d'un sol après un incendie", lieu: "les premiers centimètres chauffés par le feu",
      cond: ["300 à 500 °C en surface", "litière et humus"],
      etapes: [["c3", "Là où il y a peu de matière organique, la goethite perd son eau : le sol rougit (hématite)."],
        ["c2", "Au contact de l'humus et des débris brûlés, vers 300 à 500 °C : maghémite, magnétique."],
        ["c1", "La lépidocrocite des sols engorgés donne de la maghémite dès 200 °C environ."]],
      res: { min: ["mgh", "hem"], t: "Maghémite et hématite en surface : en climat tempéré, la maghémite se trouve près des charbons de bois (Schwertmann 1985)." },
      src: ["schw1985", "ruan1995", "gehring1994"] },
  ];

  // ---------- 5. Dessin de la carte ----------
  const swDe = (k) => {
    const n = N[k];
    const m = n.id && MIN() && MIN()[n.id];
    return (m && m.swatch) || n.sw || "#888";
  };
  function clair(hex) {   // luminance relative (texte foncé sur fond clair)
    const v = hex.replace("#", "");
    if (v.length !== 6) return false;
    const c = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255).map((u) => (u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.35;
  }
  // petits dessins de la forme des grains (centrés en 0,0, environ 30 × 30)
  const ICONES = {
    feuillets: () => [-7, 0, 7].map((dy) => `<path d="M-12 ${dy} L-7 ${dy - 3.5} L7 ${dy - 3.5} L12 ${dy} L7 ${dy + 3.5} L-7 ${dy + 3.5} Z" class="chf-ic"/>`).join(""),
    grains: () => [[0, 0], [-7, -4], [7, -4], [-7, 5], [7, 5], [0, -9], [0, 9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" class="chf-ic"/>`).join(""),
    lattes: () => [[-6, -2], [0, 2], [6, -1]].map(([x, y], i) => `<rect x="${x - 2.4}" y="${y - 11}" width="4.8" height="22" rx="1" transform="rotate(${[-18, 8, 26][i]} ${x} ${y})" class="chf-ic"/>`).join(""),
    aiguilles: () => [-30, -12, 6, 22].map((a, i) => `<rect x="-1.4" y="-13" width="2.8" height="26" rx="1.2" transform="rotate(${a}) translate(${[-2, 1, 0, 2][i]} 0)" class="chf-ic"/>`).join(""),
    plaquette: () => `<path d="M-12 0 L-6 -10.4 L6 -10.4 L12 0 L6 10.4 L-6 10.4 Z" class="chf-ic"/><path d="M-6 -10.4 L6 10.4 M6 -10.4 L-6 10.4 M-12 0 L12 0" class="chf-ic-l"/>`,
    octaedre: () => `<path d="M0 -13 L11 0 L0 13 L-11 0 Z" class="chf-ic"/><path d="M-11 0 L0 4 L11 0 M0 -13 L0 4 L0 13" class="chf-ic-l"/>`,
    lacunes: () => `<path d="M0 -13 L11 0 L0 13 L-11 0 Z" class="chf-ic"/><path d="M-11 0 L0 4 L11 0 M0 -13 L0 4 L0 13" class="chf-ic-l"/><circle cx="-4" cy="-3" r="1.6" class="chf-ic-trou"/><circle cx="4" cy="6" r="1.6" class="chf-ic-trou"/>`,
  };
  function boite(k) {
    const n = N[k], x0 = n.x - n.w / 2, y0 = n.y - n.h / 2;
    if (n.type === "fantome") {
      const m = N[n.de];
      return `<g class="chf-el chf-noeud chf-fantome" data-n="${k}" tabindex="0" role="button" aria-label="${m.nom} (renvoi)">`
        + `<rect x="${x0}" y="${y0}" width="${n.w}" height="${n.h}" rx="9" class="chf-boite"/>`
        + `<circle cx="${x0 + 16}" cy="${n.y}" r="6" fill="${swDe(n.de)}" class="chf-pastille"/>`
        + `<text x="${n.x + 8}" y="${n.y + 4.5}" class="chf-nom-f">${m.nom}</text></g>`;
    }
    const fond = n.type === "roche" || n.type === "dissous" ? "" : swDe(k);
    const sombre = fond && !clair(fond);
    const cl = `chf-el chf-noeud chf-${n.type || "min"}${sombre ? " chf-sombre" : ""}`;
    const decal = n.ic ? 18 : 0;   // place du petit dessin à gauche
    let s = `<g class="${cl}" data-n="${k}" tabindex="0" role="button" aria-label="${n.nom}">`
      + `<rect x="${x0}" y="${y0}" width="${n.w}" height="${n.h}" rx="11" class="chf-boite"${fond ? ` style="fill:${fond}"` : ""}/>`;
    if (n.ic) s += `<g transform="translate(${x0 + 26} ${n.y})" aria-hidden="true">${ICONES[n.ic]()}</g>`;
    s += `<text x="${n.x + decal}" y="${n.y - (n.h > 54 ? 4 : 3)}" class="chf-nom">${n.nom}</text>`
      + `<text x="${n.x + decal}" y="${n.y + (n.h > 54 ? 14 : 13)}" class="chf-sous">${n.sous}</text></g>`;
    return s;
  }
  function etiquette(lab) {
    const [x, y, a, lignes] = lab;
    return `<text x="${x}" y="${y}" text-anchor="${a}" class="chf-lab">${lignes.map((l, i) => `<tspan x="${x}" dy="${i ? 14 : 0}">${l}</tspan>`).join("")}</text>`;
  }
  function fleche(k) {
    const f = F[k], ds = [].concat(f.d), labs = Array.isArray(f.lab[0]) ? f.lab : [f.lab];
    let s = `<g class="chf-el chf-fleche chf-${f.t}${f.lent ? " chf-lent" : ""}" data-f="${k}" tabindex="0" role="button" aria-label="${f.titre}">`;
    ds.forEach((d) => { s += `<path d="${d}" class="chf-trait" marker-end="url(#chf-p-${f.t})"/><path d="${d}" class="chf-prise"/>`; });
    labs.forEach((l) => { s += etiquette(l); });
    return s + "</g>";
  }
  function carteSVG() {
    return `<svg class="chf-svg" viewBox="0 0 1000 680" role="group" aria-label="Carte des chemins de formation des oxydes de fer dans les sols">
      <rect class="chf-vallee chf-vallee-e" x="8" y="200" width="344" height="256" rx="14"/>
      <rect class="chf-vallee chf-vallee-a" x="648" y="200" width="344" height="256" rx="14"/>
      <text class="chf-vt" x="20" y="449">SOL ENGORGÉ : LE FER RESTE EN PARTIE RÉDUIT</text>
      <text class="chf-vt" x="980" y="449" text-anchor="end">SOL AÉRÉ : TOUT LE FER S'OXYDE</text>
      <line class="chf-sep" x1="8" y1="470" x2="992" y2="470"/>
      <text class="chf-vt" x="16" y="494">OXYDES MAGNÉTIQUES</text>
      <text class="chf-vt" x="984" y="494" text-anchor="end">APRÈS UN FEU</text>
      ${Object.keys(F).map(fleche).join("")}
      ${Object.keys(N).map(boite).join("")}
      <g class="chf-etapes" aria-hidden="true"></g>
    </svg>`;
  }
  // pointes de flèches, une par type (un seul jeu pour toute la page)
  const DEFS = `<svg class="chf-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>${["dis", "ox", "cri", "sol", "red", "feu", "v", "e"].map((t) =>
    `<marker id="chf-p-${t}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="chf-pt-${t}"/></marker>`).join("")}</defs></svg>`;

  // ---------- 6. Vignettes « à l'échelle des atomes » (case 200 × 140) ----------
  const RAD = Math.PI / 180;
  const vO = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="4.4" class="chf-v-o"/>`;
  const vH = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.5" class="chf-v-h"/>`;
  const vEau = (x, y, a) => vH(x + 6.6 * Math.cos((a - 52) * RAD), y + 6.6 * Math.sin((a - 52) * RAD)) + vH(x + 6.6 * Math.cos((a + 52) * RAD), y + 6.6 * Math.sin((a + 52) * RAD)) + vO(x, y);
  const vOH = (x, y, a) => vH(x + 6.6 * Math.cos(a * RAD), y + 6.6 * Math.sin(a * RAD)) + vO(x, y);
  const vFe = (x, y, c, r = 10.5) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" class="chf-v-fe${c}"/><text x="${f1(x)}" y="${f1(y + 2.8)}" class="chf-v-fet">Fe${c === 2 ? "²⁺" : "³⁺"}</text>`;
  const vIon = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="4.4" class="chf-v-fe3"/>`;
  const vLien = (x1, y1, x2, y2) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" class="chf-v-lien"/>`;
  const vFl = (x1, y1, x2, y2, c = "v") => `<path d="M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)}" class="chf-v-fl chf-v-fl-${c}" marker-end="url(#chf-p-${c})"/>`;
  const vCourbe = (d, c = "v") => `<path d="${d}" class="chf-v-fl chf-v-fl-${c}" marker-end="url(#chf-p-${c})"/>`;
  const vT = (x, y, t, a = "middle", c = "") => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" class="chf-v-t${c ? " " + c : ""}">${t}</text>`;
  const vOct = (x, y, s, c) => `<path d="M${f1(x)} ${f1(y - s)}L${f1(x + s)} ${f1(y)}L${f1(x)} ${f1(y + s)}L${f1(x - s)} ${f1(y)}Z" class="chf-v-oct chf-v-${c}"/>`;
  const vTet = (x, y, s, c) => `<path d="M${f1(x)} ${f1(y - s)}L${f1(x + s * 0.95)} ${f1(y + s * 0.7)}L${f1(x - s * 0.95)} ${f1(y + s * 0.7)}Z" class="chf-v-oct chf-v-${c}"/>`;
  const vE = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="4.6" class="chf-v-e"/><text x="${f1(x)}" y="${f1(y + 2)}" class="chf-v-et">e⁻</text>`;
  const vHp = (x, y, gauche) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.6" class="chf-v-hp"/><text x="${f1(x)}" y="${f1(y + 2.1)}" class="chf-v-hpt">+</text>` + (gauche ? vT(x - 6, y + 3, "H⁺", "end", "chf-v-pt") : vT(x + 6, y + 3, "H⁺", "start", "chf-v-pt"));
  // un ion entouré de six ligands à 27 unités (eau ou OH) ; les liaisons partent du bord de l'ion
  function vComplexe(x, y, c, ligs) {
    let s = "";
    ligs.forEach((L, i) => {
      const a = i * 60, co = Math.cos(a * RAD), si = Math.sin(a * RAD), ox = x + 27 * co, oy = y + 27 * si;
      s += vLien(x + 10.5 * co, y + 10.5 * si, ox - 4.4 * co, oy - 4.4 * si) + (L === "oh" ? vOH(ox, oy, a) : vEau(ox, oy, a));
    });
    return s + vFe(x, y, c);
  }
  // amas de ferrihydrite : losanges (octaèdres) et quelques triangles (fer en tétraèdre), eau dans les creux
  function vAmas(cx, cy, s, rangs, tet = []) {
    let r = "";
    rangs.forEach((ks, j) => ks.forEach((k, i) => {
      const x = cx + k * 2 * s, y = cy + (j - (rangs.length - 1) / 2) * 1.6 * s;
      r += tet.some(([a, b]) => a === j && b === i) ? vTet(x, y, s, "fe3") : vOct(x, y, s, "fe3");
    }));
    return r;
  }
  const RANGS_19 = [[-1, 0, 1], [-1.5, -0.5, 0.5, 1.5], [-2, -1, 0, 1, 2], [-1.5, -0.5, 0.5, 1.5], [-1, 0, 1]];
  const RANGS_7 = [[-0.5, 0.5], [-1, 0, 1], [-0.5, 0.5]];
  function vAiguille(x0, y, n, s, c) {   // double chaîne d'octaèdres vue de côté
    let r = "";
    for (let k = 0; k < n; k++) r += vOct(x0 + k * 2 * s, y, s, c);
    for (let k = 0; k < n - 1; k++) r += vOct(x0 + s + k * 2 * s, y + s, s, c);
    return r;
  }
  function vCouche(x0, y, n, s, cl, plisse) {   // couche d'octaèdres ; plissée = en zigzag
    let r = "";
    for (let k = 0; k < n; k++) r += vOct(x0 + k * 2 * s, y + (plisse && k % 2 ? s : 0), s, typeof cl === "function" ? cl(k) : cl);
    return r;
  }
  const VIG = {
    v1: { t: "Le fer quitte la roche", leg: "Libéré par un minéral qui s'altère, l'ion Fe²⁺ s'entoure de six molécules d'eau ; incolore, il voyage avec l'eau du sol.",
      d: () => `<path d="M4 136 L4 106 Q 18 98 38 103 L 58 110 L 62 136 Z" class="chf-v-grain"/>` + vT(32, 128, "biotite", "middle", "chf-v-pt")
        + vFl(52, 106, 76, 92, "dis") + vComplexe(120, 60, 2, ["eau", "eau", "eau", "eau", "eau", "eau"]) + vT(120, 112, "Fe²⁺ et ses six H₂O") },
    v2: { t: "L'oxygène lui prend un électron", leg: "Fe²⁺ devient Fe³⁺. Dans une eau aérée, la moitié du fer est oxydée en quelques minutes à pH 7, en un mois environ à pH 5.",
      d: () => vFe(46, 84, 2, 12) + vFl(62, 84, 128, 84, "ox") + vFe(146, 84, 3, 12)
        + vCourbe("M54 71 Q 70 30 112 26", "e") + vE(76, 39) + vO(122, 24) + vO(130.6, 24) + vT(126, 13, "O₂")
        + vT(100, 124, "un électron part vers l'oxygène") },
    v3: { t: "L'eau perd des H⁺", leg: "Plus chargé, le Fe³⁺ attire les électrons de ses molécules d'eau : certaines lâchent un H⁺ et deviennent des OH. L'eau devient plus acide.",
      d: () => vComplexe(96, 64, 3, ["eau", "oh", "eau", "eau", "oh", "eau"])
        + vFl(117, 97, 138, 110) + vHp(144, 113) + vFl(76, 31, 61, 22) + vHp(55, 18, true)
        + vT(100, 132, "Fe(OH)₂⁺") },
    v4: { t: "Les ions se soudent : ferrihydrite", leg: "Deux ions voisins partagent leurs OH (ponts OH), puis des O : en un instant naissent des grains de 2 à 5 nm, mal ordonnés et pleins d'eau.",
      d: () => {
        let s = vLien(40, 54, 53, 48) + vLien(40, 66, 53, 72) + vLien(74, 54, 61, 48) + vLien(74, 66, 61, 72);
        s += vOH(57, 46, -90) + vOH(57, 74, 90) + vFe(32, 60, 3, 10) + vFe(82, 60, 3, 10) + vT(57, 100, "ponts OH");
        s += vFl(100, 60, 121, 60);
        s += vAmas(160, 60, 5.6, RANGS_19, [[1, 1], [2, 3], [4, 0]]);
        s += [[154.4, 55.5], [171.6, 64.5], [148.8, 73.5], [165.6, 46.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" class="chf-v-eau"/>`).join("");
        s += `<path d="M138 98 L182 98 M138 95 L138 101 M182 95 L182 101" class="chf-v-ech"/>` + vT(160, 110, "≈ 3 nm", "middle", "chf-v-pt") + vT(160, 128, "ferrihydrite");
        return s;
      } },
    v5: { t: "Frais et humide : goethite", leg: "La ferrihydrite se redissout lentement ; les ions se reposent un à un au bout d'aiguilles de goethite, faites de doubles chaînes d'octaèdres.",
      d: () => vAmas(34, 66, 5, RANGS_7) + vFl(47, 58, 62, 49) + vIon(67, 46) + vFl(49, 68, 66, 73) + vIon(71, 75) + vFl(42, 79, 54, 92) + vIon(57, 96)
        + vT(34, 116, "se redissout") + vAiguille(100, 62, 9, 4.8, "goe") + vFl(188, 42, 184, 54) + vIon(190, 37)
        + vT(140, 92, "aiguille de goethite") + vT(140, 104, "longueur : ≈ 200 nm", "middle", "chf-v-pt") },
    v5b: { t: "Goethite, ion par ion", leg: "Quand le fer arrive peu à peu, les ions Fe³⁺ dissous se posent directement au bout d'aiguilles de goethite, sans passer par la ferrihydrite.",
      d: () => vIon(30, 40) + vIon(48, 78) + vIon(26, 96) + vFl(38, 44, 92, 58) + vFl(56, 76, 92, 66) + vFl(34, 94, 92, 70)
        + vT(36, 118, "Fe³⁺ dissous") + vAiguille(100, 62, 9, 4.8, "goe") + vT(140, 92, "aiguille de goethite") },
    v6: { t: "Chaud et sec : hématite", leg: "Les grains de ferrihydrite se collent, perdent leur eau, et leurs atomes se réarrangent sur place : plaquettes d'hématite.",
      d: () => {
        let s = vAmas(28, 54, 4.2, RANGS_7) + vAmas(50, 70, 4.2, RANGS_7) + vAmas(28, 86, 4.2, RANGS_7);
        s += vEau(50, 46, -90) + vFl(50, 38, 50, 24) + vEau(66, 56, -90) + vFl(66, 48, 70, 34) + vT(78, 30, "H₂O", "start", "chf-v-pt");
        s += vT(42, 116, "se collent, sèchent") + vFl(80, 70, 101, 70);
        s += `<path d="M184 68 L167 97.4 L133 97.4 L116 68 L133 38.6 L167 38.6 Z" class="chf-v-oct chf-v-hem"/>`
          + `<path d="M126 53 L174 53 M118 68 L182 68 M126 83 L174 83" class="chf-v-plan"/>`;
        return s + vT(150, 116, "plaquette d'hématite") + vT(150, 128, "au laboratoire : ≈ 60 nm", "middle", "chf-v-pt");
      } },
    v7a: { t: "Rouille verte", leg: "Peu oxydé, le fer forme des feuillets où Fe²⁺ (vert) et Fe³⁺ (rouille) se partagent les octaèdres ; anions et eau logent entre les feuillets.",
      d: () => vCouche(46, 36, 10, 5.5, (k) => (k % 3 === 1 ? "fe3" : "fe2")) + vCouche(46, 92, 10, 5.5, (k) => (k % 3 === 1 ? "fe3" : "fe2"))
        + [62, 108, 146].map((x) => `<path d="M${x} 59 L${x + 4.5} 67 L${x - 4.5} 67 Z" class="chf-v-anion"/>`).join("")
        + vEau(84, 64, -90) + vEau(128, 66, -90) + vT(100, 120, "rouille verte : feuillets, anions et eau") },
    v7: { t: "Sol engorgé : lépidocrocite", leg: "La rouille verte s'oxyde sur place quand l'air entre vite : ses feuillets deviennent les feuillets plissés de la lépidocrocite, tenus par des liaisons hydrogène.",
      d: () => vCouche(12, 36, 7, 5.5, (k) => (k % 3 === 1 ? "fe3" : "fe2")) + vCouche(12, 92, 7, 5.5, (k) => (k % 3 === 1 ? "fe3" : "fe2"))
        + [24, 56].map((x) => `<path d="M${x} 59 L${x + 4.5} 67 L${x - 4.5} 67 Z" class="chf-v-anion"/>`).join("") + vEau(40, 64, -90) + vEau(72, 62, -90)
        + vT(45, 118, "rouille verte") + vFl(92, 64, 113, 64, "ox") + vT(102, 55, "O₂", "middle", "chf-v-pt")
        + vCouche(124, 38, 9, 4.2, "lep", true) + vCouche(124, 84, 9, 4.2, "lep", true)
        + [128, 144.8, 161.6, 178.4].map((x) => `<path d="M${x} 47 L${x} 79" class="chf-v-hb"/>`).join("")
        + vT(158, 118, "lépidocrocite") },
  };
  function vignette(k, numero, fin) {
    const v = VIG[k];
    return `<figure class="chf-vig${fin ? " chf-vig-fin" : ""}"><svg viewBox="0 0 200 140" aria-hidden="true">${v.d()}</svg>`
      + `<figcaption>${numero ? `<b class="chf-vig-n">${numero}</b> ` : ""}<b>${v.t}.</b> ${v.leg}</figcaption></figure>`;
  }

  // ---------- 7. Graphiques des aiguillages ----------
  // 7a. Demi-vie du Fe²⁺ dans une eau aérée selon le pH (loi de Singer et Stumm 1970, valable au-dessus de pH 4,5) :
  //     −d[Fe²⁺]/dt = k [Fe²⁺] [OH⁻]² pO₂, k = 8,0 × 10¹³ L² mol⁻² atm⁻¹ min⁻¹ à 25 °C, pO₂ = 0,21 atm
  //     → t½ (s) = 60 ln2 / (k pO₂ 10^(2 pH − 28)), soit log10 t½ = 16,39 − 2 pH
  const demiVie = (ph) => (60 * Math.LN2) / (8.0e13 * 0.21 * Math.pow(10, 2 * ph - 28));   // en secondes
  function graphDemiVie() {
    const X0 = 70, X1 = 540, Y0 = 220, Y1 = 22, PH0 = 3.5, PH1 = 8, L0 = -1, L1 = 8;
    const px = (ph) => X0 + ((ph - PH0) / (PH1 - PH0)) * (X1 - X0), py = (L) => Y0 - ((L - L0) / (L1 - L0)) * (Y0 - Y1);
    const reperes = [[0, "1 seconde"], [Math.log10(60), "1 minute"], [Math.log10(3600), "1 heure"], [Math.log10(86400), "1 jour"], [Math.log10(30 * 86400), "1 mois"], [Math.log10(365.25 * 86400), "1 an"]];
    let s = `<svg class="chf-graph" viewBox="0 0 560 270" role="img" aria-label="Temps pour oxyder la moitié du Fe²⁺ selon le pH">`;
    s += `<rect x="${X0}" y="${Y1}" width="${f1(px(4.5) - X0)}" height="${Y0 - Y1}" class="chf-g-zone"/>`
      + `<text x="${f1((X0 + px(4.5)) / 2)}" y="${f1(py(Math.log10(3600)) + 15)}" text-anchor="middle" class="chf-g-pt">plus acide : des</text>`
      + `<text x="${f1((X0 + px(4.5)) / 2)}" y="${f1(py(Math.log10(3600)) + 28)}" text-anchor="middle" class="chf-g-pt">années sans bactéries</text>`;
    reperes.forEach(([L, t]) => { s += `<line x1="${X0}" y1="${f1(py(L))}" x2="${X1}" y2="${f1(py(L))}" class="chf-g-grille"/><text x="${X0 - 6}" y="${f1(py(L) + 4)}" text-anchor="end" class="chf-g-t">${t}</text>`; });
    for (let ph = 4; ph <= 8; ph++) s += `<line x1="${f1(px(ph))}" y1="${Y0}" x2="${f1(px(ph))}" y2="${Y0 + 5}" class="chf-g-axe"/><text x="${f1(px(ph))}" y="${Y0 + 18}" text-anchor="middle" class="chf-g-t">${ph}</text>`;
    s += `<line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}" class="chf-g-axe"/><text x="${(X0 + X1) / 2}" y="${Y0 + 38}" text-anchor="middle" class="chf-g-t">pH de l'eau</text>`;
    s += `<path d="M${f1(px(4.5))} ${f1(py(Math.log10(demiVie(4.5))))} L${f1(px(8))} ${f1(py(Math.log10(demiVie(8))))}" class="chf-g-courbe"/>`;
    const pts = [[5, "≈ 1 mois"], [6, "≈ 7 heures"], [7, "≈ 4 minutes"], [8, "≈ 2 secondes"]];
    pts.forEach(([ph, t]) => {
      const x = px(ph), y = py(Math.log10(demiVie(ph)));
      const gauche = ph >= 7.5;
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="4" class="chf-g-point"/><text x="${f1(gauche ? x - 8 : x + 8)}" y="${f1(gauche ? y + 17 : y - 7)}" text-anchor="${gauche ? "end" : "start"}" class="chf-g-val">${t}</text>`;
    });
    return s + `</svg>`;
  }
  // 7b. CO₂ et lépidocrocite (Schwertmann 1959, tableau 2 de Schwertmann 1985) : FeCl₂ 0,05 mol/L oxydé à pH 7, température ambiante
  const CO2 = [["0", 100], ["0,014", 100], ["1,74", 100], ["3,0", 35], ["4,7", 3], ["14,4", 0], ["30,8", 0], ["56,5", 0]];
  function graphCO2() {
    const X0 = 60, Y0 = 186, H = 140, L = 56;
    let s = `<svg class="chf-graph" viewBox="0 0 560 240" role="img" aria-label="Part de lépidocrocite et de goethite selon le CO₂ ajouté">`;
    s += `<rect x="${X0}" y="10" width="12" height="12" class="chf-g-lep"/><text x="${X0 + 18}" y="20" class="chf-g-t">lépidocrocite</text>`
      + `<rect x="${X0 + 120}" y="10" width="12" height="12" class="chf-g-goe"/><text x="${X0 + 138}" y="20" class="chf-g-t">goethite</text>`;
    [0, 50, 100].forEach((v) => { const y = Y0 - (v / 100) * H; s += `<line x1="${X0}" y1="${y}" x2="${X0 + CO2.length * L}" y2="${y}" class="chf-g-grille"/><text x="${X0 - 6}" y="${y + 4}" text-anchor="end" class="chf-g-t">${v} %</text>`; });
    CO2.forEach(([lab, lp], i) => {
      const x = X0 + i * L + 10, w = L - 20, hl = (lp / 100) * H;
      if (hl > 0) s += `<rect x="${x}" y="${f1(Y0 - hl)}" width="${w}" height="${f1(hl)}" class="chf-g-lep"/>`;
      if (lp < 100) s += `<rect x="${x}" y="${Y0 - H}" width="${w}" height="${f1(H - hl)}" class="chf-g-goe"/>`;
      if (lp > 10 && lp < 100) s += `<text x="${x + w / 2}" y="${f1(Y0 - hl / 2 + 4)}" text-anchor="middle" class="chf-g-in">${lp}</text>`;
      s += `<text x="${x + w / 2}" y="${Y0 + 16}" text-anchor="middle" class="chf-g-t">${lab}</text>`;
    });
    s += `<text x="${X0 + (CO2.length * L) / 2}" y="${Y0 + 36}" text-anchor="middle" class="chf-g-t">CO₂ ajouté à l'oxygène (mL par minute)</text>`;
    return s + `</svg>`;
  }
  // 7c. Deux expériences, deux réponses sur le pH (énoncés des auteurs, pas de lecture de figure)
  function graphPH() {
    const X0 = 190, X1 = 540, px = (ph) => X0 + ((ph - 2) / 10) * (X1 - X0);
    const bande = (a, b, y, c) => `<rect x="${f1(px(a) - 7)}" y="${y - 7}" width="${f1(px(b) - px(a) + 14)}" height="14" rx="7" class="chf-g-${c}"/>`;
    const point = (ph, y, c) => `<circle cx="${f1(px(ph))}" cy="${y}" r="7" class="chf-g-${c}"/>`;
    let s = `<svg class="chf-graph" viewBox="0 0 560 160" role="img" aria-label="Effet du pH selon deux expériences">`;
    s += `<text x="10" y="44" class="chf-g-t chf-g-gras">Schwertmann et Murad 1983</text><text x="10" y="58" class="chf-g-pt">pH maintenu, 24 °C, jusqu'à 3 ans</text>`
      + `<line x1="${X0 - 10}" y1="50" x2="${X1 + 10}" y2="50" class="chf-g-grille"/>`
      + point(4, 50, "goe") + bande(7, 8, 50, "hem") + point(12, 50, "goe");
    s += `<text x="10" y="99" class="chf-g-t chf-g-gras">Chen et al. 2022</text><text x="10" y="113" class="chf-g-pt">pH de départ, 25 °C, 1 517 jours</text>`
      + `<line x1="${X0 - 10}" y1="105" x2="${X1 + 10}" y2="105" class="chf-g-grille"/>`
      + point(2, 105, "goe") + bande(3, 5, 105, "hem") + bande(7, 8, 105, "goe") + bande(9, 10, 105, "hem") + point(11, 105, "goe");
    for (let ph = 2; ph <= 12; ph++) s += `<text x="${f1(px(ph))}" y="140" text-anchor="middle" class="chf-g-t">${ph}</text>`;
    s += `<text x="${(X0 + X1) / 2}" y="156" text-anchor="middle" class="chf-g-pt">pH</text>`;
    s += `<circle cx="200" cy="16" r="6" class="chf-g-hem"/><text x="211" y="20" class="chf-g-t">plus d'hématite</text>`
      + `<circle cx="330" cy="16" r="6" class="chf-g-goe"/><text x="341" y="20" class="chf-g-t">plus de goethite</text>`;
    return s + `</svg>`;
  }
  // 7d. Tasmanie, basaltes du nord-ouest (Taylor et Graley 1967, tableau 1 de Schwertmann 1985) : part d'hématite = 1 − Gt/(Gt + Hm)
  const TASMANIE = [["0–175 m", "12 °C", "1 020–1 140 mm", "3,75 YR", 0.58], ["150–275 m", "11 °C", "1 140–1 400 mm", "4,3 YR", 0.71],
    ["275–450 m", "10 °C", "1 400–1 780 mm", "6,0 YR", 0.75], ["400–575 m", "9 °C", "1 520 mm", "7,5 YR", 0.74]];
  function graphTasmanie() {
    const X0 = 70, Y0 = 150, H = 120, L = 118;
    let s = `<svg class="chf-graph" viewBox="0 0 560 222" role="img" aria-label="Part d'hématite selon l'altitude en Tasmanie">`;
    [0, 50, 100].forEach((v) => { const y = Y0 - (v / 100) * H; s += `<line x1="${X0}" y1="${y}" x2="${X0 + 4 * L}" y2="${y}" class="chf-g-grille"/><text x="${X0 - 6}" y="${y + 4}" text-anchor="end" class="chf-g-t">${v} %</text>`; });
    TASMANIE.forEach(([alt, t, pluie, teinte, gt], i) => {
      const x = X0 + i * L + 24, w = L - 48, hh = (1 - gt) * H;
      s += `<rect x="${x}" y="${f1(Y0 - hh)}" width="${w}" height="${f1(hh)}" class="chf-g-hem"/><rect x="${x}" y="${Y0 - H}" width="${w}" height="${f1(H - hh)}" class="chf-g-goe"/>`
        + `<text x="${x + w / 2}" y="${f1(Y0 - hh / 2 + 4)}" text-anchor="middle" class="chf-g-in">${nf((1 - gt) * 100)} %</text>`
        + [alt, t, pluie, "teinte " + teinte].map((l, j) => `<text x="${x + w / 2}" y="${Y0 + 16 + j * 13}" text-anchor="middle" class="chf-g-${j ? "pt" : "t"}">${l}</text>`).join("");
    });
    s += `<rect x="${X0}" y="8" width="12" height="12" class="chf-g-hem"/><text x="${X0 + 18}" y="18" class="chf-g-t">hématite</text>`
      + `<rect x="${X0 + 100}" y="8" width="12" height="12" class="chf-g-goe"/><text x="${X0 + 118}" y="18" class="chf-g-t">goethite</text>`;
    return s + `</svg>`;
  }

  // ---------- 8. Le panneau de lecture sous la carte ----------
  const cite = (ks) => ks.map((k) => ORDRE_SRC.indexOf(k) + 1).sort((a, b) => a - b).map((n) => `<button class="chf-renvoi-src" data-src-n="${n}">${n}</button>`).join(", ");
  const typeBadge = (t) => `<span class="chf-type chf-type-${t}">${TYPES[t]}</span>`;
  const nomCase = (k) => (N[k].type === "fantome" ? N[N[k].de].nom : N[k].nom);
  const lienFiche = (k) => {
    const n = N[k].type === "fantome" ? N[N[k].de] : N[k];
    return n.id && MIN() && MIN()[n.id] ? `<button class="min-chip" data-min="${n.id}"><span class="sw" style="background:${swDe(N[k].type === "fantome" ? N[k].de : k)}"></span>Fiche ${n.nom.toLowerCase()} →</button>` : "";
  };
  function detailFleche(k) {
    const f = F[k], de = [].concat(f.de);
    return `<h3>${f.titre}</h3><p class="chf-ligne">${typeBadge(f.t)} ${f.deNom || de.map(nomCase).join(", ")} → ${nomCase(f.vers)}</p>`
      + (f.vig && f.vig.length ? `<div class="chf-vigs">${f.vig.map((v) => vignette(v)).join("")}</div>` : "")
      + `<p>${f.texte}</p>`
      + `<p class="chf-sous-titre">Ce qui favorise ce passage</p><ul class="chf-cond">${f.cond.map((c) => `<li>${c}</li>`).join("")}</ul>`
      + (f.duree ? `<p class="chf-duree"><b>Durée :</b> ${f.duree}</p>` : "")
      + `<p class="chf-liens">${[...de, f.vers].map(lienFiche).filter(Boolean).join("")}<span class="chf-src-court">Sources : ${cite(f.src)}</span></p>`;
  }
  function detailNoeud(k) {
    const kk = N[k].type === "fantome" ? N[k].de : k, n = N[kk];
    const ici = new Set([kk, ...Object.keys(N).filter((j) => N[j].de === kk)]);
    const entrees = Object.keys(F).filter((j) => ici.has(F[j].vers)), sorties = Object.keys(F).filter((j) => [].concat(F[j].de).some((d) => ici.has(d)));
    const li = (L) => L.map((j) => `<li><button class="chf-lien" data-f="${j}">${F[j].titre}</button></li>`).join("");
    let s = `<h3>${n.nom}</h3><p>${n.texte}</p>`;
    if (n.forme || n.couleur) s += `<p class="chf-ligne">${n.forme ? `<b>Forme des grains :</b> ${n.forme}. ` : ""}${n.couleur ? `<b>Couleur :</b> ${n.couleur}${n.id && n.id !== "fougerite" && n.id !== "magnetite" ? " (Scheinost et Schwertmann 1999)" : ""}.` : ""}</p>`;
    if (entrees.length) s += `<p class="chf-sous-titre">Il naît de</p><ul class="chf-l">${li(entrees)}</ul>`;
    if (sorties.length) s += `<p class="chf-sous-titre">Il devient</p><ul class="chf-l">${li(sorties)}</ul>`;
    if (n.liens) s += `<p class="chf-liens">${n.liens.filter((id) => MIN() && MIN()[id]).map((id) => `<button class="min-chip" data-min="${id}"><span class="sw" style="background:${MINERAUX[id].swatch || "#888"}"></span>${MINERAUX[id].nom.split(" (")[0]}</button>`).join("")}</p>`;
    s += `<p class="chf-liens">${lienFiche(kk)}<span class="chf-src-court">Sources : ${cite(n.src || [])}</span></p>`;
    return s;
  }
  function detailMilieu(m) {
    const pas = m.etapes.map(([j, t], i) => `<li><button class="chf-pastille-n" data-f="${j}" aria-label="Étape ${i + 1} : ${F[j].titre}">${i + 1}</button><div><b>${F[j].titre}.</b> ${t}</div></li>`).join("");
    const res = m.res.min.map((k) => `<span class="chf-res-min"><span class="sw" style="background:${swDe(k)}"></span>${N[k].nom}</span>`).join("");
    return `<h3>${m.nom} <span class="chf-lieu">${m.lieu}</span></h3>`
      + `<p class="chf-ligne">${m.cond.map((c) => `<span class="chf-cond-puce">${c}</span>`).join("")}</p>`
      + `<ol class="chf-etapes-l">${pas}</ol>`
      + `<p class="chf-res">${res}<span>${m.res.t}</span></p>`
      + `<p class="chf-liens"><span class="chf-src-court">Sources : ${cite(m.src)}</span></p>`;
  }
  const LECTURE = `<h3>Comment lire la carte</h3>
    <p><b>Deux vallées et un point de rencontre.</b> À gauche, le chemin du fer qui reste en partie réduit, dans les sols engorgés : rouille verte, puis lépidocrocite. À droite, le chemin du fer entièrement oxydé, dans les sols aérés : ferrihydrite, puis goethite ou hématite. Au centre, la goethite, qui peut naître des deux. En tirets bleus, le retour en arrière : des bactéries redissolvent les oxydes quand le sol est gorgé d'eau. En bas, deux chemins plus rares : les oxydes magnétiques et le feu ; les cases en pointillés y renvoient aux cases du haut.</p>
    <p>Choisis un milieu au-dessus de la carte pour voir, numérotées, les étapes qu'y suit le fer ; clique sur une flèche ou une case pour lire le passage.</p>`;

  // ---------- 9. La page ----------
  const plusLoin = [
    "<b>Une couleur, un oxyde.</b> Couleurs médianes des oxydes purs : hématite 1,2 YR, ferrihydrite 6,6 YR, lépidocrocite 6,8 YR, goethite 0,4 Y. Toutes les hématites mesurées sont plus rouges que 4,1 YR, toutes les goethites plus jaunes que 7,3 YR : la teinte suffit à les distinguer, pas à reconnaître la ferrihydrite (Scheinost et Schwertmann 1999).",
    "<b>Un thermomètre du passé.</b> La part d'hématite dans un sol (hématite / (hématite + goethite)) sert à retrouver les températures et les pluies anciennes (Chen et al. 2022). Chen et al. préviennent qu'elle dépend aussi du pH et de la capacité du sol à le tenir.",
    "<b>Pas de seuil net de température.</b> Dans le sud de l'Allemagne, sur graviers calcaires du Würm, des sols formés entre 7,5 et 10,6 °C de moyenne annuelle contiennent un peu d'hématite, d'autant plus que le climat est doux (Schwertmann, Murad et Schulze 1982, d'après Schwertmann 1985).",
    "<b>Une ferrihydrite de 200 000 ans.</b> Dans de très vieux sols de Nouvelle-Zélande, la silice a empêché la ferrihydrite de cristalliser (Jolivet et al. 2006).",
    "<b>L'aluminium dans la goethite.</b> De 0 à 33 % du fer des goethites des sols est remplacé par de l'aluminium : peu dans les sols engorgés et les fers des marais, beaucoup dans les sols tropicaux très altérés (Schwertmann 1985, tableau 3).",
    "<b>En une saison.</b> Autour des racines du riz, lépidocrocite et goethite se forment ensemble en une seule saison de culture (Chen et al. 1980, d'après Schwertmann 1985).",
    "<b>Le sol superficiel est magnétique.</b> En 1955, le géophysicien E. Le Borgne décrit une susceptibilité magnétique anormalement forte dans le sol de surface. On y attribue aujourd'hui des magnétites et maghémites de moins de 100 nm nées sur place ; leur mode de formation reste discuté (Liu et al. 2016).",
    "<b>Un ocre rouge par le feu.</b> Chauffer de l'ocre jaune (goethite) donne de l'ocre rouge (hématite). Des pigments paléolithiques du sud de la France portent la marque d'un chauffage : on a utilisé à la fois de l'hématite naturelle et de la goethite chauffée (Pomiès et al. 1998).",
    "<b>Eaux très acides.</b> Là où de la pyrite s'oxyde (déblais de mines, vases de marais asséchées), l'eau devient très acide : le fer y précipite en schwertmannite entre pH 2,8 et 4,5, en jarosite vers pH 2,6, en ferrihydrite au-dessus de pH 6,5 ; au laboratoire, la schwertmannite s'est changée en goethite en 543 jours (Bigham et al. 1996, eaux de drainage minier).",
    "<b>Des cousins rares.</b> L'akaganéite, dont les tunnels ont besoin d'ions chlorure ; la feroxyhyte, née d'une oxydation brutale de l'hydroxyde ferreux (Jolivet et al. 2006) ; l'hydrohématite, une hématite pauvre en fer qui se forme vers pH 9 à 10 (Chen et al. 2022).",
  ];
  function html() {
    const chips = MIL.map((m) => `<button class="chip" data-mil="${m.id}">${m.court}</button>`).join("");
    const leg = Object.keys(TYPES).map((t) => `<span><i class="chf-l-${t}"></i>${TYPES[t]}</span>`).join("");
    return `<div class="chf-page">${DEFS}
    <div class="card rock-head">
      <h1><span class="sw-big chf-sw-titre"></span> Comment naissent les oxydes de fer</h1>
      <p class="sub crumb"><b data-chf-aller="oxydes" class="chf-fil">Oxydes</b> <span>→</span> <b data-chf-aller="oxyde/fer" class="chf-fil">Fer</b> <span>→</span> Chemins de formation
        <span class="badge outline">nouvelle partie, à valider</span></p>
      <p class="desc">Tout oxyde de fer d'un sol est passé par l'eau : le fer quitte un minéral de la roche, voyage dissous sous forme de Fe²⁺, puis précipite. Deux carrefours décident de sa couleur finale : la façon dont le fer s'oxyde, puis la façon dont le premier précipité vieillit. La lépidocrocite orange ne naît qu'en présence de fer encore réduit ; l'hématite rouge, dans un sol, vient d'un précipité qui s'est desséché ; la goethite jaune-brun peut naître des deux chemins.</p>
    </div>

    <div class="card chf-carte">
      <h2>La carte des chemins</h2>
      <p class="sub">Chaque case est une forme du fer, chaque flèche un passage. Choisis un milieu pour voir le chemin qu'y suit le fer ; clique sur une flèche ou une case pour lire le passage.</p>
      <div class="chips chf-milieux">${chips}<button class="chip chf-tout" data-mil="">Tout afficher</button></div>
      <div class="chf-cadre">${carteSVG()}</div>
      <div class="chf-leg">${leg}</div>
      <div class="chf-detail" aria-live="polite">${LECTURE}</div>
      <p class="note">Schéma construit d'après Schwertmann (1985, figure 10), Jolivet et al. (2006, figure 1) et Cudennec et Lecerf (2003). Les positions ne sont pas à l'échelle ; les flèches sont des passages observés dans les sols ou reproduits au laboratoire.</p>
    </div>

    <div class="card">
      <h2>Pas à pas, à l'échelle des atomes</h2>
      <p class="sub">Le chemin central — du Fe²⁺ dissous à la ferrihydrite, puis à la goethite ou à l'hématite — et celui des sols engorgés, vers la lépidocrocite.</p>
      <div class="chf-pas">
        ${vignette("v1", "1")}${vignette("v2", "2")}${vignette("v3", "3")}${vignette("v4", "4")}
        <p class="chf-pas-sep">Puis, selon le sol :</p>
        ${vignette("v5", "5a", true)}${vignette("v6", "5b", true)}${vignette("v7", "6", true)}
      </div>
      <p class="note">Dessins schématiques, tailles non à l'échelle. Cercle rouge : oxygène ; cercle blanc : hydrogène ; losange : un octaèdre vu de côté, le fer au centre et six O ou OH autour ; triangle : un fer entouré de quatre oxygènes. D'après Jolivet et al. (2006), Cudennec et Lecerf (2003), Michel et al. (2007) et Schwertmann (1985) ; tailles mesurées au laboratoire : Chen et al. (2022).</p>
    </div>

    <div class="card chf-aig">
      <h2>Les trois aiguillages</h2>
      <p class="sub">Ce qui décide du chemin, avec les mesures publiées.</p>

      <h3>1 · Le fer dissous s'oxyde-t-il ?</h3>
      <p>Sans oxygène, le fer reste Fe²⁺ et voyage avec l'eau : c'est ce qui permet aux sols engorgés de déplacer leur fer. Avec de l'oxygène, sa durée de vie dépend surtout du pH : la vitesse d'oxydation est multipliée par cent à chaque unité de pH (Singer et Stumm 1970). Dans un sol acide, le Fe²⁺ peut parcourir un bon chemin avant de précipiter ; dans un sol neutre, il précipite presque sur place.</p>
      <div class="chf-graph-cadre">${graphDemiVie()}</div>
      <p class="chf-legende">Temps au bout duquel la moitié du Fe²⁺ est oxydée, dans une eau à 25 °C en équilibre avec l'air, calculé avec la loi mesurée par Singer et Stumm (1970), valable au-dessus de pH 4,5. Plus acide, l'oxygène seul n'oxyde presque plus le fer ; des bactéries accélèrent alors la réaction plus d'un million de fois (Singer et Stumm 1970).</p>

      <h3>2 · Quel premier solide ?</h3>
      <p>Il dépend de la vitesse à laquelle le Fe³⁺ apparaît et de ce que contient l'eau.</p>
      <div class="chf-tab-cadre"><table class="chf-tab">
        <thead><tr><th>Quand…</th><th>Premier solide</th><th>Repère chiffré</th></tr></thead>
        <tbody>
          <tr><td>l'oxygène manque et le Fe²⁺ abonde (sol engorgé)</td><td>rouille verte (fougérite)</td><td>dans les gleys de Fougères, 42 à 86 % de son fer est oxydé (Trolard 2006)</td></tr>
          <tr><td>l'oxygène arrive vite, à pH 5 à 7, sans carbonate</td><td>lépidocrocite, souvent par une rouille verte fugace</td><td>au laboratoire, lépidocrocite pure seulement sans CO₂ (Schwertmann 1985 ; Cudennec et Lecerf 2003)</td></tr>
          <tr><td>l'oxydation est très rapide, ou l'eau contient silice, humus ou phosphate</td><td>ferrihydrite</td><td>eau à 20 mg/L de Fe²⁺ : lépidocrocite jusqu'à 4 mg/L de silicium, ferrihydrite de 5 à 12 mg/L (Schwertmann 1985)</td></tr>
          <tr><td>l'oxydation est lente, ou il y a des carbonates (CO₂)</td><td>goethite</td><td>voir le graphique ci-dessous (Schwertmann 1959)</td></tr>
          <tr><td>le Fe³⁺ est relâché peu à peu (humus, altération lente)</td><td>goethite directe</td><td>la goethite est bien moins soluble que la ferrihydrite : produit de solubilité ≈ 10⁻⁴² contre 10⁻³⁷ à 10⁻³⁹ (Schwertmann 1985)</td></tr>
        </tbody></table></div>
      <div class="chf-graph-cadre">${graphCO2()}</div>
      <p class="chf-legende">Oxydation à l'air d'une solution de chlorure ferreux (0,05 mol/L) à pH 7 et à température ambiante, avec de plus en plus de CO₂ ajouté à l'oxygène : dès 3 mL de CO₂ par minute, la goethite l'emporte (Schwertmann 1959, repris par Schwertmann 1985, tableau 2). Pourcentages de lépidocrocite indiqués dans les barres mixtes.</p>

      <h3>3 · La ferrihydrite vieillit : goethite ou hématite ?</h3>
      <p>Deux chemins concurrents (Schwertmann 1985) : la goethite naît d'ions repassés dans l'eau, l'hématite d'une ferrihydrite qui perd son eau sur place. Ce qui garde de l'eau autour des grains ou retient le fer dans l'eau pousse vers la goethite ; la chaleur et la sécheresse poussent vers l'hématite.</p>
      <div class="chf-tab-cadre"><table class="chf-tab">
        <thead><tr><th>Facteur</th><th>Pousse vers</th><th>Ce qu'on a mesuré</th></tr></thead>
        <tbody>
          <tr><td>température plus haute</td><td class="chf-vers-hem">hématite</td><td>Brésil du Sud : la part d'hématite croît de 14 à 20 °C de moyenne annuelle (Kämpf et Schwertmann 1982) ; au laboratoire, plus d'hématite à chaud à tous les pH (Chen et al. 2022)</td></tr>
          <tr><td>saison sèche, moins d'eau autour des grains</td><td class="chf-vers-hem">hématite</td><td>à 45 °C, quand l'humidité de l'air passe de 100 à 75 %, la transformation ralentit mais donne plus d'hématite (Torrent et al. 1982) ; plus de goethite dans une suspension plus diluée (Chen et al. 2022)</td></tr>
          <tr><td>humus abondant</td><td class="chf-vers-goe">goethite</td><td>Brésil du Sud : plus il y a de carbone, plus la goethite domine ; dans les sols rouges anciens, une gaine jaune sans hématite entoure les racines (Schwertmann 1985)</td></tr>
          <tr><td>fer libéré vite</td><td class="chf-vers-hem">hématite</td><td>Natal : sols rouges sur dolérite à côté de sols jaunes sur schiste (Schwertmann 1985)</td></tr>
          <tr><td>aluminium</td><td class="chf-vers-hem">hématite (laboratoire)</td><td>moins de 1 % d'aluminium suffit à supprimer la goethite à 70 °C, 2,5 % à 25 °C ; effet non démontré dans les sols (Schwertmann 1985)</td></tr>
          <tr><td>bon drainage, haut de versant</td><td class="chf-vers-hem">hématite</td><td>Brésil central : sur 176 m de versant et 2 m de dénivelé, le rapport goethite / (goethite + hématite) passe de 0,19 en haut à 1 en bas (Curi 1983)</td></tr>
          <tr><td>pH</td><td class="chf-vers-discute">discuté</td><td>les deux expériences ci-dessous ne s'accordent pas</td></tr>
        </tbody></table></div>
      <div class="chf-graph-cadre">${graphPH()}</div>
      <p class="chf-legende">Schwertmann et Murad (1983) trouvent le plus d'hématite entre pH 7 et 8, le plus de goethite à pH 4 et 12, en réajustant le pH pendant trois ans. Chen et al. (2022), qui fixent seulement le pH de départ, trouvent l'inverse vers la neutralité : goethite seule à pH 2 et 11, hématite favorisée de pH 3 à 5 et de 9 à 10. Pour eux, la différence vient de là : un sol riche en calcaire, en argile ou en humus tient son pH ; un sol pauvre en humus et en cations échangeables, beaucoup moins. Les deux s'accordent sur un point : à tout pH, la chaleur et le manque d'eau favorisent l'hématite.</p>
      <div class="chf-graph-cadre">${graphTasmanie()}</div>
      <p class="chf-legende">Sols sur basalte du nord-ouest de la Tasmanie, de la côte (0 m) aux plateaux (575 m) : plus haut, plus frais, plus humide et plus riche en humus (5,6 à 7,8 % de matière organique), le sol perd de l'hématite et passe du rouge (3,75 YR) au jaune-brun (7,5 YR). Moyennes de 11 profils (Taylor et Graley 1967, repris par Schwertmann 1985, tableau 1).</p>
    </div>

    <div class="card">
      <h2>Pour aller plus loin</h2>
      <ul class="chf-plus">${plusLoin.map((p) => `<li>${p}</li>`).join("")}</ul>
    </div>

    <div class="card chf-sources">
      <h2>Sources</h2>
      <ol>${ORDRE_SRC.map((k, i) => `<li id="chf-src-${i + 1}">${SRC[k]}</li>`).join("")}</ol>
      <p class="note">Sources croisées : la carte suit le schéma de Schwertmann (1985) pour la goethite et l'hématite et celui de Jolivet et al. (2006) pour le fer ferreux ; chaque passage cite ses propres mesures. Là où les sources divergent (rôle du pH, mécanisme de l'hématite, origine des oxydes magnétiques), les deux positions sont données.</p>
    </div>
  </div>`;
  }

  // ---------- 10. Interactions ----------
  function allumer(svg, sel) {   // sel = { n: Set, f: Set } ou null ; étapes = [[idFlèche, numéro]]
    svg.classList.toggle("chf-actif", !!sel);
    svg.querySelectorAll(".chf-el").forEach((el) => {
      const on = !!sel && (el.dataset.n ? sel.n.has(el.dataset.n) : sel.f.has(el.dataset.f));
      el.classList.toggle("chf-on", on);
    });
    const g = svg.querySelector(".chf-etapes");
    g.innerHTML = sel && sel.etapes ? sel.etapes.map(([j, n]) => `<g transform="translate(${F[j].num[0]} ${F[j].num[1]})"><circle r="10.5" class="chf-et"/><text y="4.2" class="chf-et-t">${n}</text></g>`).join("") : "";
  }
  const selFleche = (k) => ({ f: new Set([k]), n: new Set([...[].concat(F[k].de), F[k].vers]) });
  function selNoeud(k) {
    const kk = N[k].type === "fantome" ? N[k].de : k;
    const n = new Set([kk, ...Object.keys(N).filter((j) => N[j].de === kk)]);
    const f = new Set(Object.keys(F).filter((j) => n.has(F[j].vers) || [].concat(F[j].de).some((d) => n.has(d))));
    return { f, n };
  }
  function selMilieu(m) {
    const f = new Set(m.etapes.map(([j]) => j)), n = new Set();
    f.forEach((j) => { [].concat(F[j].de).forEach((d) => n.add(d)); n.add(F[j].vers); });
    return { f, n, etapes: m.etapes.map(([j], i) => [j, i + 1]) };
  }
  function monter(racine) {
    const carte = racine.querySelector(".chf-carte");
    if (!carte || carte._chf) return;
    carte._chf = true;
    const svg = carte.querySelector(".chf-svg"), det = carte.querySelector(".chf-detail");
    const chips = carte.querySelectorAll("[data-mil]");
    const marquerChip = (id) => chips.forEach((c) => c.classList.toggle("on", !!id && c.dataset.mil === id));
    const choisir = (t) => {
      const mil = t.closest("[data-mil]"), f = t.closest("[data-f]"), n = t.closest("[data-n]");
      if (mil) {
        const m = MIL.find((x) => x.id === mil.dataset.mil);
        marquerChip(m && m.id);
        svg.querySelectorAll(".chf-focus").forEach((x) => x.classList.remove("chf-focus"));
        if (m) { det.innerHTML = typoHTML(detailMilieu(m)); allumer(svg, selMilieu(m)); } else { det.innerHTML = LECTURE; allumer(svg, null); }
        return true;
      }
      if (f && F[f.dataset.f]) {
        const etape = f.classList.contains("chf-pastille-n");
        svg.querySelectorAll(".chf-focus").forEach((x) => x.classList.remove("chf-focus"));
        if (etape) {   // le milieu reste affiché sur la carte, son passage est souligné
          const g = svg.querySelector(`.chf-fleche[data-f="${f.dataset.f}"]`);
          if (g) g.classList.add("chf-focus");
          const actif = carte.querySelector(".chf-milieux .on");
          det.innerHTML = typoHTML(detailFleche(f.dataset.f)) + (actif ? `<p class="chf-retour"><button class="chip" data-mil="${actif.dataset.mil}">‹ Retour aux étapes du milieu</button></p>` : "");
        } else { marquerChip(null); allumer(svg, selFleche(f.dataset.f)); det.innerHTML = typoHTML(detailFleche(f.dataset.f)); }
        return true;
      }
      if (n && N[n.dataset.n]) { marquerChip(null); svg.querySelectorAll(".chf-focus").forEach((x) => x.classList.remove("chf-focus")); det.innerHTML = typoHTML(detailNoeud(n.dataset.n)); allumer(svg, selNoeud(n.dataset.n)); return true; }
      return false;
    };
    carte.addEventListener("click", (e) => { if (e.target.closest("[data-min]")) return; if (choisir(e.target)) e.stopPropagation(); });
    carte.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.closest(".chf-svg [data-f], .chf-svg [data-n]") && choisir(e.target)) e.preventDefault();
    });
    const pageEl = racine.querySelector(".chf-page");
    if (pageEl) pageEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-src-n]");
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const li = document.getElementById("chf-src-" + b.dataset.srcN);
      if (!li) return;
      li.scrollIntoView({ behavior: "smooth", block: "center" });
      li.classList.remove("chf-vu"); void li.offsetWidth; li.classList.add("chf-vu");
    });
    racine.querySelectorAll("[data-chf-aller]").forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.chfAller; }));
  }
  function page() {
    const main = document.getElementById("main");
    main.innerHTML = typoHTML(html());
    document.title = "Comment naissent les oxydes de fer — Atlas géologique";
    monter(main);
    window.scrollTo({ top: 0 });
  }

  // ---------- 11. Contrôles ----------
  function controle() {
    const R = [];
    for (const [k, f] of Object.entries(F)) {
      for (const n of [].concat(f.de, f.vers)) if (!N[n]) R.push(`flèche ${k} : case ${n} absente`);
      for (const s of f.src) if (!SRC[s]) R.push(`flèche ${k} : source ${s} absente`);
      for (const v of f.vig || []) if (!VIG[v]) R.push(`flèche ${k} : vignette ${v} absente`);
      if (!TYPES[f.t]) R.push(`flèche ${k} : type ${f.t}`);
      if (!f.num || f.num.length !== 2) R.push(`flèche ${k} : pastille d'étape sans position`);
    }
    for (const [k, n] of Object.entries(N)) {
      if (n.type === "fantome") { if (!N[n.de] || N[n.de].type === "fantome") R.push(`case ${k} : renvoi ${n.de} invalide`); continue; }
      for (const s of n.src || []) if (!SRC[s]) R.push(`case ${k} : source ${s} absente`);
      if (n.id && MIN() && !MIN()[n.id]) R.push(`case ${k} : fiche ${n.id} absente`);
      if (n.ic && !ICONES[n.ic]) R.push(`case ${k} : dessin ${n.ic} absent`);
    }
    for (const m of MIL) {
      for (const [j] of m.etapes) if (!F[j]) R.push(`milieu ${m.id} : flèche ${j} absente`);
      for (const s of m.src) if (!SRC[s]) R.push(`milieu ${m.id} : source ${s} absente`);
      for (const k of m.res.min) if (!N[k]) R.push(`milieu ${m.id} : case ${k} absente`);
    }
    for (const k of ORDRE_SRC) if (!SRC[k]) R.push(`source ${k} listée mais absente`);
    for (const k of Object.keys(SRC)) if (!ORDRE_SRC.includes(k)) R.push(`source ${k} absente de la liste`);
    return R;
  }
  // dans la page affichée : textes de la carte qui se chevauchent entre eux ou chevauchent une case, textes hors du cadre
  function chevauchements() {
    const svg = document.querySelector(".chf-svg");
    if (!svg) return ["carte absente"];
    const R = [], boites = [...svg.querySelectorAll(".chf-noeud .chf-boite")].map((r) => ({ b: r.getBBox(), n: r.parentNode.dataset.n }));
    const textes = [...svg.querySelectorAll("text")].filter((t) => !t.closest(".chf-etapes")).map((t) => ({ b: t.getBBox(), t: t.textContent.slice(0, 30), dans: t.closest(".chf-noeud") ? t.closest(".chf-noeud").dataset.n : null }));
    const inter = (a, b, m = 1) => a.x + m < b.x + b.width && b.x + m < a.x + a.width && a.y + m < b.y + b.height && b.y + m < a.y + a.height;
    textes.forEach((a, i) => {
      if (a.b.x < 0 || a.b.y < 0 || a.b.x + a.b.width > 1000 || a.b.y + a.b.height > 680) R.push(`hors cadre : ${a.t}`);
      textes.slice(i + 1).forEach((b) => { if (inter(a.b, b.b)) R.push(`textes : « ${a.t} » / « ${b.t} »`); });
      boites.forEach((c) => { if (c.n !== a.dans && inter(a.b, c.b)) R.push(`texte « ${a.t} » sur la case ${c.n}`); });
    });
    return R;
  }
  window.FerChemins = { page, monter, controle, chevauchements, N, F, MIL, SRC, demiVie };
})();
