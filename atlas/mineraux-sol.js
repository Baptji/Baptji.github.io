// ============================================================
// MINÉRAUX PRINCIPAUX DES SOLS — vue « Rôle dans le sol » de la page des minéraux (11/10/2026)
// Sélection des minéraux de l'atlas réellement présents dans les sols de France et actifs dans la
// pédogenèse (l'or, les gemmes, les minerais, les organiques rares en sont exclus).
// Éléments d'une liste : "id" = MINERAUX, "esp:id" = ESPECES (argiles), "arg:id" = fiche ARGILES,
// { id, tag } = deuxième place d'un minéral, avec une pastille : « néoformée » = cristallisée dans le sol à partir
// des ions de la solution (≠ héritée de la roche, ≠ transformée en gardant sa structure — Millot, Duchaufour).
// `strunz` : fiches MINERAUX à garder dans la vue Strunz filtrée « Minéraux du sol » quand le groupe
// ne cite que des espèces d'argiles.
// ============================================================

const MIN_SOL = [
  {
    id: "alterables", court: "1", nom: "Minéraux primaires altérables", swatch: "#d9b98c",
    note: "Dans une arène granitique, la biotite disparaît bien avant l'orthose : ses paillettes, passées au doré, ne sont plus que de la vermiculite.",
    sous: [
      { nom: "Tectosilicates (feldspaths)", mineraux: ["orthose", "microcline", "sanidine", "plagioclases", "albite", "oligoclase", "andesine", "labradorite"] },
      { nom: "Phyllosilicates", mineraux: ["muscovite", "esp:sericite", "biotite", "clinochlore", "chamosite", "antigorite", "lizardite", "chrysotile", "talc", "glauconie"] },
      { nom: "Inosilicates", mineraux: ["hornblende", "actinote", "tremolite", "augite", "diopside", "enstatite"] },
      { nom: "Nésosilicates", mineraux: ["olivine", "forsterite"] },
      { nom: "Verre volcanique", mineraux: ["verre"] },
      { nom: "Phosphates", mineraux: ["apatite"] },
    ],
  },
  {
    id: "resistants", court: "2", nom: "Minéraux primaires résistants", swatch: "#e8d8a8",
    note: "Le zircon est si stable que les pédologues l'emploient comme repère immobile pour chiffrer les pertes subies par un sol.",
    sous: [
      { nom: "Silice", mineraux: ["quartz", "calcedoine"] },
      { nom: "Minéraux lourds", mineraux: ["zircon", "tourmaline", "rutile", "anatase", "ilmenite", "leucoxene", "magnetite", "titanite",
        "grenat", "staurotide", "disthene", "andalousite", "sillimanite", "epidote", "monazite"] },
    ],
  },
  {
    id: "argileux", court: "3", nom: "Minéraux argileux", swatch: "#b9a27a",
    note: "La montmorillonite présente une surface spécifique pouvant atteindre 800 m² par gramme, ce qui explique le gonflement puis la fissuration des sols argileux.",
    strunz: ["kaolinite_m", "illite_m", "smectites_m"],
    sous: [
      { nom: "Type 1:1", mineraux: ["esp:kaolinite_e", "esp:halloysite"] },
      { nom: "Type 2:1 : illites", mineraux: ["esp:illite_e"] },
      { nom: "Type 2:1 : vermiculites", mineraux: ["esp:vermiculite_e", "esp:hydrobiotite"] },
      { nom: "Type 2:1 : smectites", mineraux: ["esp:montmorillonite", "esp:beidellite", "esp:nontronite", "esp:saponite"] },
      { nom: "Interstratifiés", mineraux: ["arg:interstratifies"] },
      { nom: "Argiles fibreuses", mineraux: ["esp:palygorskite", "esp:sepiolite_e"] },
    ],
  },
  {
    id: "occd", court: "4", nom: "Constituants à ordre à courte distance", swatch: "#cdbfa4",
    note: "Grâce à l'allophane, les andosols du Massif central ont une texture onctueuse et retiennent une quantité d'eau supérieure à leur propre masse.",
    mineraux: ["esp:allophane_e", "esp:imogolite", "ferrihydrite", "opale"],
  },
  {
    id: "oxydes", court: "5", nom: "Oxyhydroxydes de fer, de manganèse et d'aluminium", swatch: "#b07830",
    note: "La couleur d'un sol s'explique par ses oxydes : ocre de la goethite, rouge de l'hématite, orange de la lépidocrocite dans les taches des sols engorgés.",
    sous: [
      { nom: "Fer", mineraux: ["goethite", "hematite", "lepidocrocite", "maghemite", { id: "magnetite", tag: "néoformée" }, "fougerite"] },
      { nom: "Manganèse", mineraux: ["vernadite", "birnessite", "lithiophorite", "todorokite"] },
      { nom: "Aluminium", mineraux: ["gibbsite", "boehmite"] },
    ],
  },
  {
    id: "carbonates", court: "6", nom: "Carbonates", swatch: "#e9e2cf",
    note: "Dans leurs glandes calcifères, les vers de terre élaborent de petits granules de calcite, que l'on retrouve dans les sols calcaires.",
    mineraux: ["calcite", "dolomite", "aragonite", "siderite"],
  },
  {
    id: "sels", court: "7", nom: "Sels solubles et gypse", swatch: "#f0ece4",
    note: "En Camargue, l'eau salée qui remonte pendant l'été laisse à la surface des sols des croûtes blanches de halite.",
    mineraux: ["gypse_m", "halite_m", "mirabilite", "thenardite", "epsomite"],
  },
  {
    id: "reducteurs", court: "8", nom: "Minéraux des milieux réducteurs et sulfatés acides", swatch: "#8a8a6a",
    note: "Asséchée, une vase pyriteuse peut descendre sous pH 3 : c'est ce qui a ruiné certains polders après leur drainage.",
    mineraux: ["mackinawite", "greigite", "pyrite", "marcassite", "vivianite", "jarosite", "schwertmannite"],
  },
  {
    id: "biomineraux", court: "9", nom: "Biominéraux et matière organique", swatch: "#6a5a42",
    note: "Des cristaux de whewellite et de weddellite recouvrent les filaments fongiques et fixent le calcium issu de la litière.",
    mineraux: ["whewellite", "weddellite", { id: "opale", tag: "phytolithes" }, "matorg"],
  },
  {
    id: "phosphates", court: "10", nom: "Phosphates d'aluminium et de fer", swatch: "#8fae9a",
    note: "En milieu acide, l'aluminium et le fer captent rapidement une fraction du phosphate apporté par les engrais ; c'est pourquoi l'on procède au chaulage avant la fertilisation.",
    mineraux: ["variscite", "strengite"],
  },
];

// éléments d'un groupe (à plat, sous-familles comprises)
function minSolElements(g) {
  return g.sous ? g.sous.flatMap((s) => s.mineraux) : g.mineraux;
}

// ensemble des fiches MINERAUX « du sol » (sert au filtre de la vue Strunz)
const MIN_SOL_IDS = new Set(MIN_SOL.flatMap((g) => minSolElements(g)
  .map((e) => (typeof e === "string" ? e : e.id))
  .filter((e) => !e.includes(":"))
  .concat(g.strunz || [])));
