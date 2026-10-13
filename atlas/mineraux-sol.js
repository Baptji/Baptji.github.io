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
    note: "La biotite se défait bien avant l'orthose : dans une arène granitique, ses paillettes devenues dorées sont déjà de la vermiculite.",
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
    note: "Le zircon est si stable que les pédologues s'en servent de repère immobile pour chiffrer ce qu'un sol a perdu.",
    sous: [
      { nom: "Silice", mineraux: ["quartz", "calcedoine"] },
      { nom: "Minéraux lourds", mineraux: ["zircon", "tourmaline", "rutile", "anatase", "ilmenite", "leucoxene", "magnetite", "titanite",
        "grenat", "staurotide", "disthene", "andalousite", "sillimanite", "epidote", "monazite"] },
    ],
  },
  {
    id: "argileux", court: "3", nom: "Minéraux argileux", swatch: "#b9a27a",
    note: "Un gramme de montmorillonite offre jusqu'à 800 m² de surface : c'est elle qui fait gonfler puis fendre les terres argileuses.",
    strunz: ["kaolinite_m", "illite_m", "smectites_m"],
    sous: [
      { nom: "Type 1:1", mineraux: ["esp:kaolinite_e", "esp:halloysite"] },
      { nom: "Type 2:1 — illites", mineraux: ["esp:illite_e"] },
      { nom: "Type 2:1 — vermiculites", mineraux: ["esp:vermiculite_e", "esp:hydrobiotite"] },
      { nom: "Type 2:1 — smectites", mineraux: ["esp:montmorillonite", "esp:beidellite", "esp:nontronite", "esp:saponite"] },
      { nom: "Interstratifiés", mineraux: ["arg:interstratifies"] },
      { nom: "Argiles fibreuses", mineraux: ["esp:palygorskite", "esp:sepiolite_e"] },
    ],
  },
  {
    id: "occd", court: "4", nom: "Constituants à ordre à courte distance", swatch: "#cdbfa4",
    note: "Les andosols du Massif central doivent à l'allophane leur toucher onctueux et une eau retenue supérieure à leur propre poids.",
    mineraux: ["esp:allophane_e", "esp:imogolite", "ferrihydrite", "opale"],
  },
  {
    id: "oxydes", court: "5", nom: "Oxyhydroxydes de fer, de manganèse et d'aluminium", swatch: "#b07830",
    note: "La couleur d'un sol se lit en oxydes : ocre de goethite, rouge d'hématite, orange de lépidocrocite dans les taches des sols engorgés.",
    sous: [
      { nom: "Fer", mineraux: ["goethite", "hematite", "lepidocrocite", "maghemite", { id: "magnetite", tag: "néoformée" }, "fougerite"] },
      { nom: "Manganèse", mineraux: ["vernadite", "birnessite", "lithiophorite", "todorokite"] },
      { nom: "Aluminium", mineraux: ["gibbsite", "boehmite"] },
    ],
  },
  {
    id: "carbonates", court: "6", nom: "Carbonates", swatch: "#e9e2cf",
    note: "Les lombrics fabriquent dans leurs glandes calcifères de petits granules de calcite, qu'on retrouve dans les sols calcaires.",
    mineraux: ["calcite", "dolomite", "aragonite", "siderite"],
  },
  {
    id: "sels", court: "7", nom: "Sels solubles et gypse", swatch: "#f0ece4",
    note: "En Camargue, l'eau salée qui remonte l'été laisse des croûtes blanches de halite à la surface des sols.",
    mineraux: ["gypse_m", "halite_m", "mirabilite", "epsomite"],
  },
  {
    id: "reducteurs", court: "8", nom: "Minéraux des milieux réducteurs et sulfatés acides", swatch: "#8a8a6a",
    note: "Une vase à pyrite asséchée peut tomber sous pH 3 : c'est ce qui a ruiné certains polders après leur drainage.",
    mineraux: ["pyrite", "marcassite", "vivianite", "jarosite"],
  },
  {
    id: "biomineraux", court: "9", nom: "Biominéraux et matière organique", swatch: "#6a5a42",
    note: "Les filaments des champignons se couvrent de cristaux de whewellite et de weddellite, qui piègent le calcium de la litière.",
    mineraux: ["whewellite", "weddellite", "matorg"],
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
