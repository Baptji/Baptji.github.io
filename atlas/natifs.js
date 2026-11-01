// ============================================================
// CLASSE I — ÉLÉMENTS NATIFS (Strunz I)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  argent_natif: {
    nom: "Argent natif", formule: "Ag", famille: "Élément natif : métal",
    systeme: "cubique", durete: 2.75, densite: 10.5,
    clivage: "aucun (parfaitement malléable et sécable)", eclat: "métallique",
    couleurs: "blanc d'argent, ternissant vite en gris puis noir",
    contexte: "On le rencontre dans la zone de cémentation des filons argentifères, ainsi qu'en fils et en arborescences au sein de la calcite (Kongsberg, Sainte-Marie-aux-Mines).",
    stabilite: 5, swatch: "#c9cbd0",
    devient: "En surface, il se combine au soufre : le noircissement résulte d'une pellicule d'acanthite (Ag₂S).",
    note: "Les cristaux d'argent se développent en fils, en lames et en fougères ramifiées. Dès le Moyen Âge, Sainte-Marie-aux-Mines (Alsace) en tire profit : le duc de Lorraine y battait monnaie. Le fameux « filon des trois rois », comme les mines norvégiennes de Kongsberg, a livré des fils d'argent de plusieurs kilos.",
  },
  cuivre_natif: {
    nom: "Cuivre natif", formule: "Cu", famille: "Élément natif : métal",
    systeme: "cubique", durete: 2.75, densite: 8.9,
    clivage: "aucun (malléable)", eclat: "métallique",
    couleurs: "rouge cuivre frais, brunissant puis verdissant (vert-de-gris)",
    contexte: "Il apparaît dans les basaltes altérés et dans la zone de cémentation des gisements de cuivre (lac Supérieur, Chessy-les-Mines).",
    stabilite: 4, swatch: "#b87333",
    devient: "Il vire d'abord à la cuprite rouge, puis se transforme en malachite et en azurite par carbonatation.",
    note: "Dès 7 000 ans avant notre ère, les Amérindiens frappaient à froid les masses de cuivre du lac Supérieur, dont certaines pèsent plusieurs centaines de tonnes : la plus ancienne métallurgie du continent. En France, Chessy-les-Mines (Rhône) a fourni du cuivre natif accompagné de sa fameuse azurite, la « chessylite ».",
  },
  platine_natif: {
    nom: "Platine natif", formule: "Pt (± Fe, Ir, Os)", famille: "Élément natif : métal",
    systeme: "cubique", durete: 4.25, densite: 21.5,
    clivage: "aucun (malléable)", eclat: "métallique",
    couleurs: "gris acier clair, ne ternit jamais",
    contexte: "On le trouve dans les intrusions ultrabasiques litées (Bushveld, Norilsk), ainsi que dans les placers qui les drainent (Oural, Colombie).",
    stabilite: 10, swatch: "#a3a8ad",
    devient: "Il ne se transforme pas : inerte et insoluble, il s'accumule en pépites dans les placers.",
    note: "Avec 21,5, il compte parmi les minéraux les plus denses, soit le double du plomb. Les conquistadors le lançaient sous le nom de « petit argent » (platina), jugé impossible à fondre. Les pépites de l'Oural ont fait la fortune des tsars ; l'essentiel vient aujourd'hui du Bushveld sud-africain, et un tiers sert à dépolluer les pots d'échappement.",
  },
  fer_natif: {
    nom: "Fer natif", formule: "Fe (± Ni)", famille: "Élément natif : métal",
    systeme: "cubique", durete: 4, densite: 7.9,
    clivage: "aucun net", eclat: "métallique",
    couleurs: "gris acier, rouillant très vite",
    contexte: "Rarissime sur Terre (basaltes de l'île de Disko, Groenland), il est en revanche fréquent dans les météorites de fer (kamacite, taénite).",
    stabilite: 1, swatch: "#8a8683",
    devient: "Rouille immédiatement : goethite et lépidocrocite.",
    note: "Hors de Disko, où une coulée a réduit des couches de charbon, le fer pur ne survit guère à l'air humide. Le fer natif qu'on rencontre provient presque toujours des météorites : allié au nickel, le fer des météorites dessine en refroidissant les figures de Widmanstätten, impossibles à reproduire en forge. Inuits et Égyptiens façonnaient couteaux et perles bien avant la sidérurgie.",
  },
  mercure_natif: {
    nom: "Mercure natif", formule: "Hg", famille: "Élément natif : métal",
    systeme: "liquide (cristallise sous −39 °C)", durete: 0, densite: 13.6,
    clivage: "— (liquide)", eclat: "métallique",
    couleurs: "gouttelettes gris argent, mobiles",
    contexte: "On le trouve en globules dans le cinabre altéré d'Almadén (Espagne) et d'Idrija (Slovénie).",
    stabilite: 2, swatch: "#b8bcc0",
    devient: "Il s'évapore lentement (vapeurs toxiques) ou se recombine au soufre pour former du cinabre.",
    note: "Liquide dans les conditions de surface, il est le seul minéral à l'être selon la classification. Dans les cavités du cinabre, ses gouttelettes perlent : la mine d'Almadén (Espagne), exploitée depuis l'époque romaine, a fourni un tiers de tout le mercure de l'histoire, surtout pour amalgamer l'or et l'argent des Amériques.",
  },
  arsenic_natif: {
    nom: "Arsenic natif", formule: "As", famille: "Élément natif : semi-métal",
    systeme: "rhomboédrique", durete: 3.5, densite: 5.7,
    clivage: "parfait {0001}", eclat: "semi-métallique, ternissant vite",
    couleurs: "gris d'étain frais → gris sombre mat",
    contexte: "En masses mamelonnées concentriques, il se forme dans des filons hydrothermaux riches en cobalt, nickel et argent (Sainte-Marie-aux-Mines).",
    stabilite: 2, swatch: "#6f6f73",
    devient: "Son oxydation donne l'arsénolite (As₂O₃), une poudre blanche et très toxique.",
    note: "Ses masses mamelonnées concentriques ressemblent à des choux-fleurs gris. Les vieux filons des Vosges et d'Alsace en ont livré de belles pièces, avec l'argent. Rien de surprenant à cela : l'arsenic accompagne presque toujours le cobalt, le nickel et l'argent, et il servit longtemps de signal aux prospecteurs.",
  },
  antimoine_natif: {
    nom: "Antimoine natif", formule: "Sb", famille: "Élément natif : semi-métal",
    systeme: "rhomboédrique", durete: 3.25, densite: 6.7,
    clivage: "parfait {0001}", eclat: "métallique",
    couleurs: "blanc d'étain, légèrement bleuté",
    contexte: "Peu fréquent, il accompagne la stibine dans les filons, à l'état réduit (districts antimonifères du Massif central et armoricain).",
    stabilite: 2, swatch: "#9a9aa0",
    devient: "S'oxyde en ocres blancs d'antimoine (valentinite, sénarmontite).",
    note: "Le métal pur demeure rare : ce sont les gisements de stibine, sa forme sulfurée, qui comptent. Vers 1900, la France prit la tête de la production mondiale d'antimoine, entre le district de Brioude-Massiac (Haute-Loire/Cantal) et la mine de La Lucette (Mayenne) : une gloire minière aujourd'hui oubliée.",
  },
  bismuth_natif: {
    nom: "Bismuth natif", formule: "Bi", famille: "Élément natif : semi-métal",
    systeme: "rhomboédrique", durete: 2.25, densite: 9.8,
    clivage: "parfait {0001}", eclat: "métallique, souvent irisé",
    couleurs: "blanc rosé caractéristique, ternissant en irisations",
    contexte: "On le rencontre dans les pegmatites et les filons à étain-tungstène (Erzgebirge, Cornouailles), où il reste accessoire, comme dans les filons français à Sn-W.",
    stabilite: 3, swatch: "#c9a8b0",
    devient: "S'oxyde lentement en bismite et bismutite jaunâtres.",
    note: "À l'œil, c'est sa teinte rosée qui le signale. Vendus dans le commerce, les cristaux « en trémie » aux couleurs d'arc-en-ciel sont fabriqués : le bismuth naturel forme plutôt des masses lamellaires discrètes, dans les filons à étain et tungstène. Comme la glace, il se dilate en se solidifiant.",
  },
  diamant: {
    nom: "Diamant", formule: "C", famille: "Élément natif : non-métal (carbone)",
    systeme: "cubique", durete: 10, densite: 3.52,
    clivage: "parfait {111} (octaédrique)", eclat: "adamantin : c'est lui l'étalon",
    couleurs: "incolore, jaune, brun ; plus rarement bleu, rose, vert",
    contexte: "On le trouve dans les kimberlites et les lamproïtes (diatrèmes), ainsi que dans les placers issus de leur démantèlement. Aucun gisement n'existe en France.",
    stabilite: 10, swatch: "#eef2f6",
    devient: "Sans effet à l'échelle géologique : il reste métastable en surface, et sa transformation en graphite prendrait des milliards d'années.",
    note: "Façonné à plus de 150 km de profondeur, il remonte en quelques heures avec les éruptions kimberlitiques : un passager clandestin venu du manteau. Sa dureté atteint 10 sur l'échelle de Mohs, et il conduit la chaleur cinq fois mieux que le cuivre ; les joailliers le reconnaissent au toucher, à une fraîcheur qu'aucun verre n'égale. En surface, pourtant, c'est le graphite qui reste la forme stable du carbone : tout diamant n'est qu'un sursis.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 1);
  c.groupes = [
    {
      nom: "Métaux natifs", code: "I.A", motif: "un élément à l'état natif (Au, Ag, Cu, Pt, Fe, Hg)",
      note: "L'altération épargne seulement les métaux nobles, or et platine ; les autres se ternissent, verdissent ou rouillent, et le mercure, unique minéral liquide, s'évapore.",
      mineraux: ["or_natif", "argent_natif", "cuivre_natif", "platine_natif", "fer_natif", "mercure_natif"],
    },
    {
      nom: "Semi-métaux natifs", code: "I.C", motif: "groupe de l'arsenic (As, Sb, Bi)",
      note: "Arsenic, antimoine et bismuth, trois cousins rhomboédriques, naissent dans les filons hydrothermaux avec les minerais d'argent, de cobalt et d'étain. Rarement purs, ils forment surtout des gisements par leurs sulfures (stibine, orpiment…).",
      mineraux: ["arsenic_natif", "antimoine_natif", "bismuth_natif"],
    },
    {
      nom: "Non-métaux natifs : carbone & soufre", code: "I.C", motif: "C (graphite, diamant) et S",
      note: "Pour un même élément, le carbone prend deux visages extrêmes sur l'échelle de Mohs : des feuillets glissants pour le graphite (dureté 1), une charpente pour le diamant (dureté 10). Le soufre, lui, se dépose autour des fumerolles et dans les chapeaux des dômes de sel.",
      mineraux: ["graphite", "diamant", "soufre_natif"],
    },
  ];
})();
