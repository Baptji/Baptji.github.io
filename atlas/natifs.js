// ============================================================
// CLASSE I — ÉLÉMENTS NATIFS (Strunz I)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  argent_natif: {
    nom: "Argent natif", formule: "Ag", famille: "Élément natif — métal",
    systeme: "cubique", durete: 2.75, densite: 10.5,
    clivage: "aucun (parfaitement malléable et sécable)", eclat: "métallique",
    couleurs: "blanc d'argent, ternissant vite en gris puis noir",
    contexte: "Zones de cémentation des filons argentifères ; fils et arborescences dans la calcite (Kongsberg, Sainte-marie-aux-Mines).",
    stabilite: 5, swatch: "#c9cbd0",
    devient: "Se sulfure en surface : le noircissement est une pellicule d'acanthite Ag₂S.",
    note: "L'argent pousse en fils, en tôles et en arborescences fougères. Sainte-Marie-aux-Mines (Alsace) l'exploite dès le Moyen Âge — le duc de Lorraine y frappait sa monnaie. Le célèbre « filon des trois rois » et les mines norvégiennes de Kongsberg ont produit des fils d'argent de plusieurs kilos.",
  },
  cuivre_natif: {
    nom: "Cuivre natif", formule: "Cu", famille: "Élément natif — métal",
    systeme: "cubique", durete: 2.75, densite: 8.9,
    clivage: "aucun (malléable)", eclat: "métallique",
    couleurs: "rouge cuivre frais, brunissant puis verdissant (vert-de-gris)",
    contexte: "Basaltes altérés et zones de cémentation des gisements de cuivre (lac Supérieur, Chessy-les-Mines).",
    stabilite: 4, swatch: "#b87333",
    devient: "S'oxyde en cuprite rouge puis se carbonate en malachite et azurite.",
    note: "Les masses du lac Supérieur (jusqu'à plusieurs centaines de tonnes !) furent martelées à froid par les Amérindiens dès 7 000 ans avant notre ère — la plus vieille métallurgie du continent. En France, Chessy-les-Mines (Rhône) a livré du cuivre natif avec sa célèbre azurite « chessylite ».",
  },
  platine_natif: {
    nom: "Platine natif", formule: "Pt (± Fe, Ir, Os)", famille: "Élément natif — métal",
    systeme: "cubique", durete: 4.25, densite: 21.5,
    clivage: "aucun (malléable)", eclat: "métallique",
    couleurs: "gris acier clair, ne ternit jamais",
    contexte: "Intrusions ultrabasiques litées (Bushveld, Norilsk) et placers qui les drainent (Oural, Colombie).",
    stabilite: 10, swatch: "#a3a8ad",
    devient: "Rien : inoxydable et insoluble, il se concentre en pépites dans les placers.",
    note: "L'un des minéraux les plus denses : 21,5 — deux fois le plomb. Les conquistadors le jetaient comme « petit argent » (platina) impossible à fondre. Les pépites de l'Oural firent la fortune des tsars ; aujourd'hui, l'essentiel sort du Bushveld sud-africain, et un tiers sert à dépolluer nos pots d'échappement.",
  },
  fer_natif: {
    nom: "Fer natif", formule: "Fe (± Ni)", famille: "Élément natif — métal",
    systeme: "cubique", durete: 4, densite: 7.9,
    clivage: "aucun net", eclat: "métallique",
    couleurs: "gris acier, rouillant très vite",
    contexte: "Exceptionnel sur Terre (basaltes de l'île de Disko, Groenland) ; commun dans les météorites de fer (kamacite, taénite).",
    stabilite: 1, swatch: "#8a8683",
    devient: "Rouille immédiatement : goethite et lépidocrocite.",
    note: "Le fer pur ne survit pas à l'atmosphère terrestre — sauf à Disko, où une lave a traversé des couches de charbon qui l'ont réduit. Presque tout le fer natif est extraterrestre : le fer des météorites, allié au nickel, dessine en se refroidissant les figures de Widmanstätten, impossibles à reproduire en forge — les Inuits et les Égyptiens en faisaient couteaux et perles bien avant la sidérurgie.",
  },
  mercure_natif: {
    nom: "Mercure natif", formule: "Hg", famille: "Élément natif — métal",
    systeme: "liquide (cristallise sous −39 °C)", durete: 0, densite: 13.6,
    clivage: "— (liquide)", eclat: "métallique",
    couleurs: "gouttelettes gris argent, mobiles",
    contexte: "Gouttelettes dans les minerais de cinabre altérés (Almadén en Espagne, Idrija en Slovénie).",
    stabilite: 2, swatch: "#b8bcc0",
    devient: "S'évapore lentement (vapeurs toxiques) ou se recombine au soufre en cinabre.",
    note: "Le seul minéral liquide aux conditions de surface reconnu par la classification. Les gouttelettes perlent dans les cavités du cinabre : la mine d'Almadén (Espagne), exploitée depuis les Romains, a fourni à elle seule un tiers de tout le mercure de l'histoire humaine — surtout pour amalgamer l'or et l'argent des Amériques.",
  },
  arsenic_natif: {
    nom: "Arsenic natif", formule: "As", famille: "Élément natif — semi-métal",
    systeme: "rhomboédrique", durete: 3.5, densite: 5.7,
    clivage: "parfait {0001}", eclat: "semi-métallique, ternissant vite",
    couleurs: "gris d'étain frais → gris sombre mat",
    contexte: "Filons hydrothermaux à cobalt-nickel-argent, en masses mamelonnées concentriques (Sainte-Marie-aux-Mines).",
    stabilite: 2, swatch: "#6f6f73",
    devient: "S'oxyde en arsénolite As₂O₃, poudre blanche très toxique.",
    note: "Il pousse en masses mamelonnées concentriques, comme des choux-fleurs gris. Les vieux filons vosgiens et alsaciens en ont livré de belles masses avec l'argent — un voisinage logique : l'arsenic accompagne presque toujours les minerais de cobalt, de nickel et d'argent, dont il fut longtemps le traceur pour les prospecteurs.",
  },
  antimoine_natif: {
    nom: "Antimoine natif", formule: "Sb", famille: "Élément natif — semi-métal",
    systeme: "rhomboédrique", durete: 3.25, densite: 6.7,
    clivage: "parfait {0001}", eclat: "métallique",
    couleurs: "blanc d'étain, légèrement bleuté",
    contexte: "Rare : filons à stibine, dont il est le compagnon réduit (districts antimonifères du Massif central et armoricain).",
    stabilite: 2, swatch: "#9a9aa0",
    devient: "S'oxyde en ocres blancs d'antimoine (valentinite, sénarmontite).",
    note: "Le métal pur est rare — c'est sa forme sulfurée, la stibine, qui fait les gisements. La France fut vers 1900 le premier producteur mondial d'antimoine, entre le district de Brioude-Massiac (Haute-Loire/Cantal) et la mine de La Lucette (Mayenne) : une gloire minière aujourd'hui oubliée.",
  },
  bismuth_natif: {
    nom: "Bismuth natif", formule: "Bi", famille: "Élément natif — semi-métal",
    systeme: "rhomboédrique", durete: 2.25, densite: 9.8,
    clivage: "parfait {0001}", eclat: "métallique, souvent irisé",
    couleurs: "blanc rosé caractéristique, ternissant en irisations",
    contexte: "Filons à étain-tungstène et pegmatites (Erzgebirge, Cornouailles ; accessoire dans les filons français à Sn-W).",
    stabilite: 3, swatch: "#c9a8b0",
    devient: "S'oxyde lentement en bismite et bismutite jaunâtres.",
    note: "Sa teinte rosée le trahit au premier coup d'œil. Les spectaculaires cristaux « en trémie » arc-en-ciel du commerce sont artificiels : le bismuth naturel forme des masses lamellaires discrètes dans les filons à étain et tungstène. Curiosité physique : comme la glace, il se dilate en se solidifiant.",
  },
  diamant: {
    nom: "Diamant", formule: "C", famille: "Élément natif — non-métal (carbone)",
    systeme: "cubique", durete: 10, densite: 3.52,
    clivage: "parfait {111} (octaédrique)", eclat: "adamantin — c'est lui l'étalon",
    couleurs: "incolore, jaune, brun ; plus rarement bleu, rose, vert",
    contexte: "Kimberlites et lamproïtes (diatrèmes), placers qui les démantèlent. Aucun gisement en France.",
    stabilite: 10, swatch: "#eef2f6",
    devient: "Rien à l'échelle géologique : métastable en surface, mais la conversion en graphite demanderait des milliards d'années.",
    note: "Forgé à plus de 150 km de profondeur et remonté en quelques heures par les éruptions kimberlitiques : un passager clandestin du manteau. Étalon du 10 sur l'échelle de Mohs, il conduit la chaleur cinq fois mieux que le cuivre — les joailliers le testaient au toucher, « froid » comme aucun verre. Le graphite est pourtant la forme stable du carbone en surface : tout diamant est un sursis.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 1);
  c.groupes = [
    {
      nom: "Métaux natifs", code: "I.A", motif: "un métal pur (Au, Ag, Cu, Pt, Fe, Hg)",
      note: "Seuls les métaux nobles (or, platine) traversent l'altération sans broncher ; les autres ternissent, verdissent ou rouillent — et le mercure, unique minéral liquide, s'évapore.",
      mineraux: ["or_natif", "argent_natif", "cuivre_natif", "platine_natif", "fer_natif", "mercure_natif"],
    },
    {
      nom: "Semi-métaux natifs", code: "I.C", motif: "groupe de l'arsenic (As, Sb, Bi)",
      note: "Trois cousins rhomboédriques des filons hydrothermaux, compagnons des minerais d'argent, de cobalt et d'étain. Rarement purs dans la nature : leurs sulfures (stibine, orpiment…) font les vrais gisements.",
      mineraux: ["arsenic_natif", "antimoine_natif", "bismuth_natif"],
    },
    {
      nom: "Non-métaux natifs — carbone & soufre", code: "I.C", motif: "C (graphite, diamant) et S",
      note: "Le carbone joue double jeu : feuillets glissants du graphite (dureté 1) ou charpente du diamant (dureté 10) — même élément, les deux extrêmes de l'échelle de Mohs. Le soufre, lui, pousse autour des fumerolles et dans les chapeaux des dômes de sel.",
      mineraux: ["graphite", "diamant", "soufre_natif"],
    },
  ];
})();
