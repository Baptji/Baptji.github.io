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
    contexte: "Accessoire des granites et gneiss, concentré avec le zircon et la monazite dans les sables lourds.",
    stabilite: 9, swatch: "#9a7a52",
    devient: "Quasi inaltérable : voyage intact jusqu'aux placers.",
    note: "Le coffre-fort de l'yttrium et des terres rares lourdes (dysprosium, erbium…), celles qui manquent le plus à l'industrie des aimants. Presque jumeau du zircon en plus tendre, il l'accompagne dans les sables lourds — les placers malaisiens en font un sous-produit de l'étain. Son nom vient d'une vieille querelle de chimistes : « honneur en vain » (kenos timè), l'yttrium qu'on y avait « découvert » l'ayant déjà été.",
  },
  amblygonite: {
    nom: "Amblygonite-montebrasite", formule: "LiAl(PO₄)(F,OH)", famille: "Phosphate anhydre",
    systeme: "triclinique", durete: 5.75, densite: 3.05,
    clivage: "parfait {100}", eclat: "vitreux à nacré",
    couleurs: "blanc crème, jaune très pâle, incolore",
    contexte: "Pegmatites à lithium ; la montebrasite est décrite à Montebras (Creuse) — localité-type française.",
    stabilite: 5, swatch: "#e7e2d2",
    devient: "S'altère lentement en phosphates secondaires et argiles ; libère son lithium.",
    note: "Un minerai de lithium avant l'heure, si discret qu'il passe pour du feldspath (le test : il fond à la bougie en colorant la flamme de rouge lithium). Sa variété à OH dominant, la montebrasite, porte le nom de Montebras (Creuse), sa localité-type : la petite pegmatite creusoise est entrée dans la nomenclature mondiale — et son lithium redevient stratégique aujourd'hui.",
  },
  turquoise: {
    nom: "Turquoise", formule: "CuAl₆(PO₄)₄(OH)₈·4H₂O", famille: "Phosphate hydraté",
    systeme: "triclinique (masses microcristallines)", durete: 5.5, densite: 2.7,
    clivage: "— (masses crypto-cristallines)", eclat: "cireux à mat",
    couleurs: "bleu ciel, bleu-vert, vert pomme",
    contexte: "Croûtes et veinules dans les roches alumineuses altérées des régions arides, pluie < 20 % de l'ETP (Iran, Sinaï, Arizona).",
    stabilite: 5, swatch: "#3aaebc",
    devient: "Verdit en perdant son eau ou en échangeant cuivre contre fer.",
    note: "La gemme la plus anciennement minée du monde : les pharaons l'arrachaient déjà au Sinaï il y a 5 000 ans. Son nom dit « pierre turque » — simple malentendu commercial, elle venait de Perse via la Turquie. Formation : cuivre (bleu), aluminium (trame), climat désertique (évaporation). Elle verdit en vieillissant, ce que les Persans lisaient comme un présage.",
  },
  wavellite: {
    nom: "Wavellite", formule: "Al₃(PO₄)₂(OH)₃·5H₂O", famille: "Phosphate hydraté",
    systeme: "orthorhombique", durete: 3.5, densite: 2.36,
    clivage: "parfait {110}", eclat: "vitreux à soyeux",
    couleurs: "vert pomme, jaune verdâtre, blanc",
    contexte: "Fentes des roches alumineuses (schistes, phosphorites), en rosettes radiées (Arkansas, Dévon).",
    stabilite: 4, swatch: "#9fbf6a",
    devient: "Se dissout lentement, nourrissant les sols en phosphore.",
    note: "Cassez la roche : des éventails verts parfaitement radiés s'ouvrent sur la fracture, comme des feux d'artifice figés. La wavellite ne fait presque jamais de cristaux libres — tout son art est dans ces rosettes. C'est du phosphore recyclé : l'aluminium des argiles a capturé le phosphate des eaux d'altération.",
  },
  pyromorphite: {
    nom: "Pyromorphite", formule: "Pb₅(PO₄)₃Cl", famille: "Phosphate de plomb (groupe apatite)",
    systeme: "hexagonal", durete: 3.75, densite: 7,
    clivage: "très indistinct", eclat: "résineux",
    couleurs: "vert pomme à vert olive, jaune, brun, orangé",
    contexte: "Zone d'oxydation des filons de galène ; Les Farges (Ussel, Corrèze) a produit les plus beaux spécimens du monde.",
    stabilite: 6, swatch: "#7fae3e",
    devient: "Très stable : verrouille durablement le plomb des chapeaux de filons.",
    note: "Le « plomb vert » : des barillets hexagonaux vert pomme, gras comme de la cire, poussés dans les chapeaux oxydés des mines de plomb. La mine des Farges, près d'Ussel (Corrèze), a fourni dans les années 1970-80 les pyromorphites les plus célèbres du monde — l'un des rares minéraux dont les « chefs-d'œuvre » sont français. Même structure que l'apatite de nos os : le plomb y a pris la place du calcium.",
  },
  autunite: {
    nom: "Autunite", formule: "Ca(UO₂)₂(PO₄)₂·10-12H₂O", famille: "Phosphate d'uranyle (mica uranifère)",
    systeme: "quadratique", durete: 2.25, densite: 3.15,
    clivage: "parfait {001} (lamelles micacées)", eclat: "vitreux à nacré",
    couleurs: "jaune citron à jaune verdâtre — fluorescence verte spectaculaire aux UV",
    contexte: "Altération des minéraux d'uranium des granites ; décrite près d'Autun (Saône-et-Loire), sa localité-type.",
    stabilite: 3, swatch: "#cadb3c",
    devient: "Perd son eau (méta-autunite) ; disperse lentement l'uranium dans les eaux.",
    note: "Le minéral d'Autun : décrit en 1852 sur les filons de Saint-Symphorien-de-Marmagne, près de la ville qui lui donne son nom. Ses lamelles jaune citron s'embrasent en vert électrique sous UV — la plus belle fluorescence du monde minéral. Elle a guidé la prospection de l'uranium français : du Limousin au Forez, chaque tache jaune sur un granite était une promesse de mine.",
  },
  torbernite: {
    nom: "Torbernite", formule: "Cu(UO₂)₂(PO₄)₂·8-12H₂O", famille: "Phosphate d'uranyle (mica uranifère)",
    systeme: "quadratique", durete: 2.25, densite: 3.2,
    clivage: "parfait {001} (lamelles micacées)", eclat: "vitreux à nacré",
    couleurs: "vert émeraude franc (non fluorescente, contrairement à l'autunite)",
    contexte: "Altération des filons uranifères cuprifères ; belles françaises des mines du Limousin et des Bois Noirs.",
    stabilite: 3, swatch: "#2e8b57",
    devient: "Se déshydrate en métatorbernite ; disperse uranium et cuivre.",
    note: "La jumelle verte de l'autunite : le cuivre y remplace le calcium et éteint la fluorescence — vert émeraude à la lumière, mais muette sous UV, c'est son test d'identité. Ses tablettes carrées empilées comme des micas tapissaient les fissures des mines d'uranium limousines. Radioactive, évidemment : les collectionneurs la vitrent et l'aèrent (le radon s'invite).",
  },
  erythrite: {
    nom: "Érythrite (fleurs de cobalt)", formule: "Co₃(AsO₄)₂·8H₂O", famille: "Arséniate hydraté",
    systeme: "monoclinique", durete: 2, densite: 3.06,
    clivage: "parfait {010}", eclat: "vitreux à nacré",
    couleurs: "rose pourpre à rose pâle",
    contexte: "Efflorescences roses sur les minerais de cobalt oxydés (Bou Azzer au Maroc ; Les Chalanches, Isère).",
    stabilite: 2, swatch: "#c76385",
    devient: "Se dissout et disperse cobalt et arsenic.",
    note: "Les « fleurs de cobalt » : un voile rose qui fleurit sur les vieux minerais et trahit le métal caché — les prospecteurs saxons suivaient le rose comme un fil d'Ariane. La mine des Chalanches (Allemont, Isère), exploitée dès 1767 pour l'argent et le cobalt, en a montré aux minéralogistes du XVIIIe siècle. Le bleu de nos batteries commence souvent par du rose.",
  },
  mimetite: {
    nom: "Mimétite", formule: "Pb₅(AsO₄)₃Cl", famille: "Arséniate de plomb (groupe apatite)",
    systeme: "hexagonal", durete: 3.75, densite: 7.1,
    clivage: "aucun net", eclat: "résineux",
    couleurs: "jaune miel, orangé, vert jaunâtre",
    contexte: "Chapeaux oxydés des filons plomb-arsenic (Tsumeb en Namibie, Johanngeorgenstadt en Saxe).",
    stabilite: 6, swatch: "#d9a733",
    devient: "Très stable : piège le plomb et l'arsenic ensemble.",
    note: "L'« imitatrice » (mimetes) : elle copie si bien la pyromorphite que seule la chimie les distingue — arsenic chez l'une, phosphore chez l'autre, même moule hexagonal du groupe apatite. Ses barillets jaune miel de Namibie sont des classiques. Un cas d'école de ce que les cristallographes appellent une série isomorphe.",
  },
  vanadinite: {
    nom: "Vanadinite", formule: "Pb₅(VO₄)₃Cl", famille: "Vanadate de plomb (groupe apatite)",
    systeme: "hexagonal", durete: 3, densite: 6.9,
    clivage: "aucun", eclat: "résineux à adamantin",
    couleurs: "rouge sang, rouge orangé, brun",
    contexte: "Chapeaux oxydés des filons de plomb en climat aride (pluie < 20 % de l'ETP) ; Mibladen (Maroc) fournit les icônes du minéral.",
    stabilite: 6, swatch: "#c22e1d",
    devient: "Très stable ; minerai accessoire de vanadium.",
    note: "Des hexagones rouge sang posés sur roche blonde : les vanadinites de Mibladen (Maroc) comptent parmi les minéraux les plus photogéniques du monde. Troisième sœur du groupe apatite-plomb (avec pyromorphite et mimétite), elle porte le vanadium — ce métal découvert deux fois et nommé d'après Vanadis, la Freyja scandinave, pour la beauté de ses couleurs.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 8);
  c.classe = "Phosphates, arséniates & vanadates";
  c.desc = "Le groupement PO₄³⁻ et ses cousins AsO₄³⁻ et VO₄³⁻. Discrets mais vitaux : l'apatite nourrit en phosphore toute la biosphère, la monazite stocke les terres rares — et les chapeaux oxydés des mines y ajoutent leurs couleurs.";
  c.groupes = [
    {
      nom: "Phosphates anhydres", code: "VIII.A-B", motif: "PO₄³⁻ sans eau (apatite, monazite, xénotime)",
      note: "Les coffres-forts : l'apatite du phosphore biologique, la monazite et le xénotime des terres rares — presque inaltérables, ils traversent l'érosion et se récoltent dans les sables lourds. Avec un Français discret : l'amblygonite-montebrasite du lithium, décrite à Montebras (Creuse).",
      mineraux: ["apatite", "monazite", "xenotime", "amblygonite"],
    },
    {
      nom: "Phosphates hydratés", code: "VIII.C-D", motif: "PO₄³⁻ + H₂O",
      note: "Le phosphore recyclé par l'altération : bleu des tourbières (vivianite), bleu des déserts (turquoise), éventails verts de la wavellite.",
      mineraux: ["vivianite", "turquoise", "wavellite"],
    },
    {
      nom: "Phosphates d'uranyle (micas uranifères)", code: "VIII.E", motif: "(UO₂)²⁺ + PO₄³⁻ en feuillets",
      note: "Les lamelles fluorescentes des chapeaux uranifères : jaune éclatant de l'autunite (décrite à Autun !) et vert émeraude — muet sous UV — de la torbernite. Elles ont guidé la prospection de l'uranium français.",
      mineraux: ["autunite", "torbernite"],
    },
    {
      nom: "Groupe apatite du plomb & arséniates", code: "VIII.B-C", motif: "Pb₅(XO₄)₃Cl (X = P, As, V) + arséniates hydratés",
      note: "Le moule de l'apatite décliné au plomb : pyromorphite des Farges (Corrèze) — des chefs-d'œuvre français —, mimétite l'imitatrice, vanadinite rouge sang. Et les fleurs roses de cobalt (érythrite) des vieux filons.",
      mineraux: ["pyromorphite", "mimetite", "vanadinite", "erythrite"],
    },
  ];
})();
