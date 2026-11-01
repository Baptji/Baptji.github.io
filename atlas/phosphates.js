// ============================================================
// CLASSE VIII — PHOSPHATES, ARSÉNIATES, VANADATES (Strunz VIII)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  xenotime: {
    nom: "Xénotime", formule: "YPO₄", famille: "Phosphate anhydre",
    systeme: "quadratique", durete: 4.5, densite: 4.6,
    clivage: "parfait {100}", eclat: "vitreux à résineux",
    couleurs: "brun jaunâtre, brun rougeâtre",
    contexte: "On le trouve en faible quantité dans les granites et les gneiss ; dans les sables lourds, il s'associe au zircon et à la monazite.",
    stabilite: 9, swatch: "#9a7a52",
    devient: "Quasi inaltérable : voyage intact jusqu'aux placers.",
    note: "Il regroupe l'yttrium et les terres rares lourdes (dysprosium, erbium…), précisément celles dont manque le plus l'industrie des aimants. Son allure est proche de celle du zircon, quoiqu'il soit plus tendre, et il le suit dans les sables lourds ; sur les placers malaisiens, il est récupéré comme sous-produit de l'étain. Son nom découle d'une querelle de chimistes : « honneur en vain » en grec, car l'yttrium qu'on prétendait y avoir découvert l'avait déjà été.",
  },
  amblygonite: {
    nom: "Amblygonite-montebrasite", formule: "LiAl(PO₄)(F,OH)", famille: "Phosphate anhydre",
    systeme: "triclinique", durete: 5.75, densite: 3.05,
    clivage: "parfait {100}", eclat: "vitreux à nacré",
    couleurs: "blanc crème, jaune très pâle, incolore",
    contexte: "La montebrasite apparaît dans les pegmatites à lithium ; sa localité-type est Montebras (Creuse), en France.",
    stabilite: 5, swatch: "#e7e2d2",
    devient: "Au fil du temps, il se transforme lentement en phosphates secondaires et en argiles, tout en relâchant son lithium.",
    note: "Ce minerai de lithium avant l'heure reste si discret qu'on le prend souvent pour du feldspath ; le test consiste à le faire fondre à la bougie, la flamme se colorant en rouge. Sa variété à OH dominant, la montebrasite, tire son nom de Montebras (Creuse), sa localité-type : cette petite pegmatite creusoise est entrée dans la nomenclature mondiale, et son lithium redevient aujourd'hui stratégique.",
  },
  turquoise: {
    nom: "Turquoise", formule: "CuAl₆(PO₄)₄(OH)₈·4H₂O", famille: "Phosphate hydraté",
    systeme: "triclinique (masses microcristallines)", durete: 5.5, densite: 2.7,
    clivage: "— (masses crypto-cristallines)", eclat: "cireux à mat",
    couleurs: "bleu ciel, bleu-vert, vert pomme",
    contexte: "Dans les roches alumineuses altérées des régions arides (Iran, Sinaï, Arizona), il forme des croûtes et des veinules, la pluie restant inférieure à 20 % de l'ETP.",
    stabilite: 5, swatch: "#3aaebc",
    devient: "Il se transforme en verdit par perte d'eau ou par échange du cuivre contre le fer.",
    note: "Cette gemme compte parmi les plus anciennement exploitées au monde : les pharaons l'extrayaient déjà au Sinaï il y a 5 000 ans. Son nom de « pierre turque » résulte d'un malentendu commercial, car elle arrivait de Perse par la Turquie. Sa formation réunit le cuivre (bleu), l'aluminium (la trame) et un climat désertique (évaporation). Elle verdit avec le temps, ce que les Persans interprétaient comme un présage.",
  },
  wavellite: {
    nom: "Wavellite", formule: "Al₃(PO₄)₂(OH)₃·5H₂O", famille: "Phosphate hydraté",
    systeme: "orthorhombique", durete: 3.5, densite: 2.36,
    clivage: "parfait {110}", eclat: "vitreux à soyeux",
    couleurs: "vert pomme, jaune verdâtre, blanc",
    contexte: "On le rencontre dans les fentes des roches alumineuses (schistes, phosphorites), où il forme des rosettes rayonnantes (Arkansas, Dévon).",
    stabilite: 4, swatch: "#9fbf6a",
    devient: "Il se dissout lentement et enrichit les sols en phosphore.",
    note: "Cassée, la roche révèle des éventails verts parfaitement rayonnants, comme des feux d'artifice figés. La wavellite ne forme presque jamais de cristaux isolés : tout son intérêt réside dans ces rosettes. Il s'agit de phosphore recyclé : l'aluminium des argiles a capté le phosphate des eaux d'altération.",
  },
  pyromorphite: {
    nom: "Pyromorphite", formule: "Pb₅(PO₄)₃Cl", famille: "Phosphate de plomb (groupe apatite)",
    systeme: "hexagonal", durete: 3.75, densite: 7,
    clivage: "très indistinct", eclat: "résineux",
    couleurs: "vert pomme à vert olive, jaune, brun, orangé",
    contexte: "On le rencontre dans la zone d'oxydation des filons de galène, avec pour meilleurs spécimens mondiaux ceux des Farges (Ussel, Corrèze).",
    stabilite: 6, swatch: "#7fae3e",
    devient: "Il est très stable et maintient le plomb des chapeaux de filons à l'abri.",
    note: "Ce « plomb vert » prend la forme de barillets hexagonaux vert pomme, gras comme de la cire, poussés dans les chapeaux oxydés des mines de plomb. Dans les années 1970 et 80, la mine des Farges, près d'Ussel (Corrèze), a fourni les pyromorphites les plus réputées au monde ; c'est l'un des rares minéraux dont les plus beaux exemplaires soient français. Sa structure rappelle celle de l'apatite de nos os : le plomb y occupe la place du calcium.",
  },
  autunite: {
    nom: "Autunite", formule: "Ca(UO₂)₂(PO₄)₂·10-12H₂O", famille: "Phosphate d'uranyle (mica uranifère)",
    systeme: "quadratique", durete: 2.25, densite: 3.15,
    clivage: "parfait {001} (lamelles micacées)", eclat: "vitreux à nacré",
    couleurs: "jaune citron à jaune verdâtre, fluorescence verte spectaculaire aux UV",
    contexte: "Ce minéral résulte de l'altération des minéraux d'uranium des granites ; sa localité-type est Autun (Saône-et-Loire).",
    stabilite: 3, swatch: "#cadb3c",
    devient: "Il perd son eau pour devenir la méta-autunite, et libère lentement l'uranium dans les eaux.",
    note: "Décrit en 1852 dans les filons de Saint-Symphorien-de-Marmagne, près de la ville qui lui donne son nom, ce minéral jaune citron s'illumine d'un vert électrique sous ultraviolets : c'est l'une des plus belles fluorescences du monde minéral. Il a guidé la prospection française de l'uranium, du Limousin au Forez, où chaque tache jaune sur un granite annonçait peut-être une mine.",
  },
  torbernite: {
    nom: "Torbernite", formule: "Cu(UO₂)₂(PO₄)₂·8-12H₂O", famille: "Phosphate d'uranyle (mica uranifère)",
    systeme: "quadratique", durete: 2.25, densite: 3.2,
    clivage: "parfait {001} (lamelles micacées)", eclat: "vitreux à nacré",
    couleurs: "vert émeraude franc (non fluorescente, contrairement à l'autunite)",
    contexte: "Il résulte de l'altération des filons uranifères cuprifères ; des spécimens remarquables proviennent des mines du Limousin et des Bois Noirs.",
    stabilite: 3, swatch: "#2e8b57",
    devient: "Il se déshydrate en métatorbernite et disperse l'uranium et le cuivre.",
    note: "Elle est la jumelle verte de l'autunite : le cuivre prend la place du calcium et annule la fluorescence. Émeraude en lumière normale, elle demeure muette sous UV, ce qui permet de l'identifier. Ses tablettes carrées, superposées comme des micas, tapissaient les fissures des mines d'uranium du Limousin. Radioactive, elle l'est bien sûr : les collectionneurs la gardent sous verre et l'aèrent, car le radon peut s'y accumuler.",
  },
  erythrite: {
    nom: "Érythrite (fleurs de cobalt)", formule: "Co₃(AsO₄)₂·8H₂O", famille: "Arséniate hydraté",
    systeme: "monoclinique", durete: 2, densite: 3.06,
    clivage: "parfait {010}", eclat: "vitreux à nacré",
    couleurs: "rose pourpre à rose pâle",
    contexte: "Les minerais de cobalt oxydés se couvrent d'efflorescences roses, comme à Bou Azzer (Maroc) ou aux Chalanches (Isère).",
    stabilite: 2, swatch: "#c76385",
    devient: "Il se dissout et libère cobalt et arsenic dans l'environnement.",
    note: "Les « fleurs de cobalt » forment un voile rose sur les vieux minerais et signalent le métal enfoui ; les prospecteurs saxons se fiaient à cette couleur. Exploitée dès 1767 pour l'argent et le cobalt, la mine des Chalanches (Allemont, Isère) en a fourni aux minéralogistes du XVIIIe siècle. Le bleu de nos batteries commence fréquemment par ce rose.",
  },
  mimetite: {
    nom: "Mimétite", formule: "Pb₅(AsO₄)₃Cl", famille: "Arséniate de plomb (groupe apatite)",
    systeme: "hexagonal", durete: 3.75, densite: 7.1,
    clivage: "aucun net", eclat: "résineux",
    couleurs: "jaune miel, orangé, vert jaunâtre",
    contexte: "On les trouve dans les chapeaux oxydés des filons plomb-arsenic, à Tsumeb (Namibie) et à Johanngeorgenstadt (Saxe).",
    stabilite: 6, swatch: "#d9a733",
    devient: "Très stable, il immobilise à la fois le plomb et l'arsenic.",
    note: "Son nom signifie « l'imitatrice » (mimetes) : elle copie si fidèlement la pyromorphite que seule la chimie les différencie, l'arsenic chez l'une, le phosphore chez l'autre, sur le même moule hexagonal du groupe de l'apatite. Les barillets jaune miel de Namibie figurent parmi les classiques. C'est un exemple d'école de série isomorphe, selon le vocabulaire des cristallographes.",
  },
  vanadinite: {
    nom: "Vanadinite", formule: "Pb₅(VO₄)₃Cl", famille: "Vanadate de plomb (groupe apatite)",
    systeme: "hexagonal", durete: 3, densite: 6.9,
    clivage: "aucun", eclat: "résineux à adamantin",
    couleurs: "rouge sang, rouge orangé, brun",
    contexte: "Il se forme dans les chapeaux oxydés des filons de plomb, en climat aride (pluie < 20 % de l'ETP) ; Mibladen (Maroc) en fournit les images de référence.",
    stabilite: 6, swatch: "#c22e1d",
    devient: "Très stable, il constitue un minerai accessoire de vanadium.",
    note: "Les vanadinites de Mibladen (Maroc), hexagones rouge sang posés sur une roche blonde, comptent parmi les minéraux les plus photogéniques du monde. Membre du groupe apatite-plomb avec la pyromorphite et la mimétite, elle contient du vanadium, métal qui doit son nom à Vanadis, nom scandinave de Freyja, en hommage à la beauté de ses couleurs.",
  },

  // ---------- F.12 (16/10/2026) : phosphates d'aluminium et de fer ----------
  variscite: {
    nom: "Variscite", formule: "AlPO₄·2H₂O", famille: "Phosphate hydraté d'aluminium",
    systeme: "orthorhombique", durete: 4.5, densite: 2.59,
    clivage: "bon {001}, médiocre {010} ({010} et {001} dans la notation Pcab des ouvrages)", eclat: "vitreux à cireux",
    couleurs: "vert pâle, vert émeraude, vert bleuté, incolore",
    contexte: "Elle se présente en nodules et en veines là où une eau chargée de phosphate traverse une roche alumineuse, ainsi que dans les grottes et les îles à guano. Gisements cités : Palazuelo de las Arribas (Espagne), l'Utah, le Vogtland (Allemagne).",
    stabilite: 5, swatch: "#7cc29a",
    devient: "Il se dissout très lentement : l'aluminium demeure sous forme de gibbsite ou de kaolinite, tandis que le phosphate s'éloigne.",
    note: "Elle tient son nom du Vogtland (Variscia en latin), comme la chaîne varisque. Ses nodules verts ont fourni une partie des perles de « callaïs » des grands tumulus du Morbihan : plus de 800 perles et pendentifs, provenant de 33 sites de la région de Carnac et datés du Ve millénaire avant notre ère, ont été taillés dans une variscite venue de la péninsule Ibérique (Querré et al. 2014). Dans les sols acides, elle sert de référence : son diagramme de solubilité indique à quel pH le phosphate se lie à l'aluminium (Lindsay et Moreno 1960), bien qu'on ne l'ait presque jamais observée dans un sol.",
    sources: [
      `Anthony J. W., Bideaux R. A., Bladh K. W. et Nichols M. C. (2001-2005). <i>Handbook of Mineralogy</i>, fiche « Variscite ». Mineral Data Publishing (données cristallines et physiques).`,
      "Kniep R., Mootz D. et Vegas A. (1977). « Variscite ». <i>Acta Crystallographica B</i> 33, p. 263–265.",
      "Lindsay W. L. et Moreno E. C. (1960). « Phosphate phase equilibria in soils ». <i>Soil Science Society of America Proceedings</i> 24, p. 177–182.",
      "Querré G., Calligaro T., Domínguez-Bella S. et Cassen S. (2014). « PIXE analyses over a long period: the case of Neolithic variscite jewels from Western Europe (5th–3th millennium BC) ». <i>Nuclear Instruments and Methods in Physics Research B</i> 318, p. 149–156.",
    ],
  },
  strengite: {
    nom: "Strengite", formule: "Fe³⁺PO₄·2H₂O", famille: "Phosphate hydraté de fer",
    systeme: "orthorhombique", durete: 3.5, densite: 2.84,
    clivage: "bon {010}, médiocre {100} ({001} dans la notation Pcab des ouvrages)", eclat: "vitreux",
    couleurs: "violet, rose fleur de pêcher, carmin, blanc verdâtre",
    contexte: "On la rencontre dans les pegmatites à phosphates (Hagendorf, en Bavière), les « limonites » et les chapeaux de fer (mines de Giessen), ou encore les minerais de fer de Kiruna ; elle est rare dans les grottes.",
    stabilite: 5, swatch: "#b07ab8",
    devient: "Le phosphate s'éloigne lentement, tandis que le fer demeure sous forme de goethite.",
    note: "Sœur ferrique de la variscite : même structure, le fer remplaçant l'aluminium, et toutes les compositions intermédiaires possibles entre les deux. Violette ou rose, elle se forme tardivement dans les pegmatites, lorsque les phosphates de fer s'oxydent et s'hydratent. Comme la variscite, elle figure dans les diagrammes de solubilité du phosphore des sols acides (Lindsay et Moreno 1960), mais ses identifications dans les sols restent contestées : le phosphate y est retenu avant tout à la surface des oxydes de fer. Elle rend hommage à Johan August Streng, minéralogiste de l'université de Giessen.",
    sources: [
      `Anthony J. W., Bideaux R. A., Bladh K. W. et Nichols M. C. (2001-2005). <i>Handbook of Mineralogy</i>, fiche « Strengite ». Mineral Data Publishing (données cristallines et physiques).`,
      "Taxer K. et Bartl H. (2004). « On the dimorphy between the variscite and clinovariscite group: refined finestructural relationship of strengite and clinostrengite, Fe(PO₄)·2H₂O ». <i>Crystal Research and Technology</i> 39, p. 1080–1088.",
      "Lindsay W. L. et Moreno E. C. (1960). « Phosphate phase equilibria in soils ». <i>Soil Science Society of America Proceedings</i> 24, p. 177–182.",
    ],
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 8);
  c.classe = "Phosphates, arséniates & vanadates";
  c.desc = "Le groupement PO₄³⁻, ainsi que AsO₄³⁻ et VO₄³⁻, reste discret mais indispensable. Grâce à l'apatite, la biosphère reçoit son phosphore ; la monazite retient les terres rares, et les chapeaux oxydés des mines ajoutent leurs teintes.";
  c.groupes = [
    {
      nom: "Phosphates anhydres", code: "VIII.A-B", motif: "PO₄³⁻ sans eau (apatite, monazite, xénotime)",
      note: "Ce sont les coffres-forts du phosphore biologique et des terres rares : l'apatite, la monazite et le xénotime, presque inaltérables, traversent l'érosion et se récoltent dans les sables lourds. Une espèce française discrète complète la liste : l'amblygonite-montebrasite, source de lithium, décrite à Montebras (Creuse).",
      mineraux: ["apatite", "monazite", "xenotime", "amblygonite"],
    },
    {
      nom: "Phosphates hydratés", code: "VIII.C-D", motif: "PO₄³⁻ + H₂O",
      note: "Le phosphore recyclé par l'altération se retrouve dans des teintes variées : le bleu des tourbières (vivianite), le vert de la variscite, le violet de la strengite, sa sœur ferrique, le bleu des déserts (turquoise) et les rosettes vertes de la wavellite.",
      mineraux: ["vivianite", "variscite", "strengite", "turquoise", "wavellite"],
    },
    {
      nom: "Phosphates d'uranyle (micas uranifères)", code: "VIII.E", motif: "(UO₂)²⁺ + PO₄³⁻ en feuillets",
      note: "Dans les chapeaux uranifères, les lamelles fluorescentes sont le jaune éclatant de l'autunite (décrite à Autun) et le vert émeraude, muet sous UV, de la torbernite. Ces deux minéraux ont orienté la prospection française de l'uranium.",
      mineraux: ["autunite", "torbernite"],
    },
    {
      nom: "Groupe apatite du plomb & arséniates", code: "VIII.B-C", motif: "Pb₅(XO₄)₃Cl (X = P, As, V) + arséniates hydratés",
      note: "Appliqué au plomb, le moule de l'apatite donne la pyromorphite des Farges (Corrèze), la mimétite et la vanadinite rouge sang. S'y ajoutent, dans les vieux filons, les fleurs roses de cobalt, c'est-à-dire l'érythrite.",
      mineraux: ["pyromorphite", "mimetite", "vanadinite", "erythrite"],
    },
  ];
})();
