// ============================================================
// PHYLLOSILICATES (Strunz 9.E) — les FEUILLETS
// Les tétraèdres partagent TROIS de leurs quatre sommets et
// forment des feuillets continus (motif Si₂O₅). Empilés avec des
// feuillets d'octaèdres (O), ils donnent trois architectures :
//   1:1   (TO)   ~7 Å   → serpentines, kaolin
//   2:1   (TOT)  ~10 Å  → talc, micas, illite, smectites
//   2:1:1 (TOT+O) ~14 Å → chlorites
// D'où le clivage parfait en lamelles qui définit toute la classe.
//
// Le monde ARGILEUX (kaolin, illite, smectites, vermiculite…) a sa
// PARTIE DÉDIÉE dans l'atlas (#argiles). Ce fichier détaille les
// phyllosilicates NON argileux (micas, talc, serpentines, chlorites)
// et ne fait que RÉSUMER les argiles, en renvoyant à leurs fiches.
//
// Chargé après inosilicates-chaine-double.js, avant app.js.
// ============================================================

Object.assign(MINERAUX, {
  // ---------- Micas vrais dioctaédriques (2:1 + K) ----------
  paragonite: {
    nom: "Paragonite", formule: "NaAl₂(AlSi₃O₁₀)(OH)₂", famille: "Phyllosilicate : mica dioctaédrique",
    systeme: "monoclinique", durete: 2.5, densite: 2.85, stabilite: 7, swatch: "#d0cdc5",
    clivage: "parfait basal {001} : feuillets élastiques", eclat: "nacré",
    couleurs: "incolore, blanc, gris, jaunâtre",
    contexte: "On les observe dans les micaschistes et les phyllades issus d'un métamorphisme de degré bas à moyen.",
    devient: "→ illite puis argiles.",
    note: "Le jumeau sodique de la muscovite partage sa charpente, le sodium remplaçant le potassium. Il s'intercale si finement avec la muscovite qu'il ne se distingue qu'au laboratoire. C'est un bon indicateur des conditions du métamorphisme.",
  },

  // ---------- Micas vrais trioctaédriques (2:1 + K) ----------
  phlogopite: {
    nom: "Phlogopite", formule: "KMg₃(AlSi₃O₁₀)(F,OH)₂", famille: "Phyllosilicate : mica trioctaédrique",
    systeme: "monoclinique", durete: 2.75, densite: 2.85, stabilite: 5, swatch: "#b98a4a",
    clivage: "parfait basal {001} : feuillets élastiques", eclat: "nacré à submétallique",
    couleurs: "brun doré, jaune miel, brun-rouge",
    contexte: "Marbres dolomitiques, roches ultramafiques, kimberlites.",
    devient: "→ vermiculite (perte de K⁺) puis argiles.",
    note: "Pôle magnésien de la série de la biotite, de couleur brun doré. Stable jusqu'à près de 900 °C, il isole aussi bien la chaleur que l'électricité : c'est le « mica industriel » des résistances et des fours. Il accompagne le diamant dans les kimberlites.",
  },
  lepidolite: {
    nom: "Lépidolite", formule: "K(Li,Al)₃(AlSi₃O₁₀)(F,OH)₂", famille: "Phyllosilicate : mica trioctaédrique",
    systeme: "monoclinique", durete: 3, densite: 2.85, stabilite: 5, swatch: "#c9a8d0",
    clivage: "parfait basal {001}", eclat: "nacré",
    couleurs: "lilas, rose, violet pâle, gris",
    contexte: "Pegmatites granitiques riches en lithium, associées à la tourmaline rose et au spodumène.",
    devient: "→ argiles ; libère le lithium.",
    note: "Mica lithinifère rose à lilas (teinte due au manganèse), qui tapisse les pegmatites sous forme d'agrégats de paillettes. Outre le lithium, il livre rubidium et césium ; sa présence signale les pegmatites à spodumène et à tourmaline gemme.",
  },
  zinnwaldite: {
    nom: "Zinnwaldite", formule: "KLiFeAl(AlSi₃O₁₀)(F,OH)₂", famille: "Phyllosilicate : mica trioctaédrique",
    systeme: "monoclinique", durete: 3, densite: 2.9, stabilite: 5, swatch: "#a89a86",
    clivage: "parfait basal {001}", eclat: "nacré",
    couleurs: "brun-gris, brun pâle, argenté",
    contexte: "Des greisens et des pegmatites à étain se trouvent à Zinnwald (Cínovec) et dans les monts Métallifères.",
    devient: "→ argiles.",
    note: "Mica lithino-ferreux intermédiaire entre la biotite et la lépidolite. La zinnwaldite tient son nom de Zinnwald, à la frontière germano-tchèque, où elle accompagne la cassitérite, minerai d'étain, dans les greisens.",
  },

  // ---------- Micas cassants (2:1 + Ca) ----------
  margarite: {
    nom: "Margarite", formule: "CaAl₂(Al₂Si₂O₁₀)(OH)₂", famille: "Phyllosilicate : mica cassant",
    systeme: "monoclinique", durete: 3.75, densite: 3.0, stabilite: 5, swatch: "#d8c0c0",
    clivage: "parfait basal {001} : feuillets CASSANTS (non élastiques)", eclat: "nacré à vitreux",
    couleurs: "rose, gris, blanc jaunâtre",
    contexte: "On le rencontre dans les gisements d'émeri et les roches métamorphiques riches en aluminium.",
    devient: "→ argiles.",
    note: "Mica cassant : le calcium entre les feuillets double la charge de ceux-ci, de sorte que les lamelles se rompent au lieu de se courber. Présente dans l'émeri, cet abrasif naturel associé au corindon, elle tire son nom du grec margaritês, « perle », allusion à son éclat nacré.",
  },
  clintonite: {
    nom: "Clintonite", formule: "Ca(Mg,Al)₃(Al₃SiO₁₀)(OH)₂", famille: "Phyllosilicate : mica cassant",
    systeme: "monoclinique", durete: 3.5, densite: 3.1, stabilite: 5, swatch: "#b0a060",
    clivage: "parfait basal {001} : cassant", eclat: "nacré à submétallique",
    couleurs: "vert-jaune, brun-rouge, incolore",
    contexte: "Skarns et marbres dolomitiques métamorphisés.",
    devient: "→ argiles.",
    note: "Ce mica cassant trioctaédrique se distingue par sa faible teneur en silice : il compte parmi les rares silicates où les tétraèdres portent davantage d'aluminium que de silicium. On le rencontre dans les skarns, au contact des intrusions et des calcaires.",
  },

  // ---------- Groupe talc – pyrophyllite (2:1 neutre) ----------
  talc: {
    nom: "Talc", formule: "Mg₃Si₄O₁₀(OH)₂", famille: "Phyllosilicate : talc-pyrophyllite (2:1 neutre)",
    systeme: "monoclinique / triclinique", durete: 1, densite: 2.75, stabilite: 3, swatch: "#d8e0d5",
    clivage: "parfait basal {001}", eclat: "nacré, gras au toucher",
    couleurs: "blanc, vert pâle, gris",
    contexte: "Ce minéral apparaît lorsque roches ultramafiques et dolomies siliceuses subissent un métamorphisme.",
    devient: "→ argiles magnésiennes.",
    note: "Le plus tendre des minéraux de l'échelle de Mohs (dureté 1) : ses feuillets 2:1, électriquement neutres, glissent les uns sur les autres, ce qui lui donne un toucher gras. Près de Luzenac (Ariège), Trimouns constitue la plus vaste carrière de talc au monde. Massif, il prend le nom de stéatite (pierre à savon), sculptée depuis la préhistoire.",
  },
  pyrophyllite: {
    nom: "Pyrophyllite", formule: "Al₂Si₄O₁₀(OH)₂", famille: "Phyllosilicate : talc-pyrophyllite (2:1 neutre)",
    systeme: "monoclinique / triclinique", durete: 1.5, densite: 2.8, stabilite: 4, swatch: "#dcd8cc",
    clivage: "parfait basal {001}", eclat: "nacré à gras",
    couleurs: "blanc, gris, vert pâle, jaunâtre",
    contexte: "Il résulte du métamorphisme de bas degré des roches alumineuses, notamment des schistes séricitiques.",
    devient: "→ kaolinite + argiles.",
    note: "Analogue alumineux du talc, il possède le même feuillet 2:1 neutre, l'aluminium remplaçant le magnésium. Comme lui, il est tendre et gras. Chauffée, la pyrophyllite se délite en éventail, d'où son nom grec pyro-phyllon, « feuille de feu ». Sa variété massive et fine, l'agalmatolite, sert à la sculpture en Chine.",
  },

  // ---------- Groupe des serpentines (1:1 trioctaédrique) ----------
  chrysotile: {
    nom: "Chrysotile", formule: "Mg₃Si₂O₅(OH)₄", famille: "Phyllosilicate : serpentine (1:1)",
    systeme: "monoclinique", durete: 2.75, densite: 2.55, stabilite: 4, swatch: "#9ab088",
    clivage: "fibreux (feuillets enroulés en tubes)", eclat: "soyeux",
    couleurs: "vert clair, blanc, jaune",
    contexte: "Veines soyeuses recoupant les serpentinites.",
    devient: "→ smectites magnésiennes + oxydes de fer.",
    note: "Ses feuillets 1:1 se roulent en fibres creuses, microscopiques : il s'agit de l'amiante blanc, qui a fourni plus de 90 % de l'amiante consommé dans le monde, et dont la France a interdit l'usage en 1997. Dans ses veines vert clair et soyeuses, les fibres se dressent perpendiculairement à la paroi.",
  },
  antigorite: {
    nom: "Antigorite", formule: "(Mg,Fe)₃Si₂O₅(OH)₄", famille: "Phyllosilicate : serpentine (1:1)",
    systeme: "monoclinique", durete: 3.5, densite: 2.6, stabilite: 4, swatch: "#4f6a52",
    clivage: "bon dans un sens (structure ondulée)", eclat: "gras à cireux",
    couleurs: "vert sombre, vert-brun, vert-noir",
    contexte: "Présent dans les serpentinites de subduction et le métamorphisme alpin, notamment dans les schistes lustrés du Queyras.",
    devient: "→ smectites + oxydes de fer.",
    note: "Ses feuillets ondulent, ce qui donne à la roche une texture massive et lamellaire. Serpentine des hautes pressions, elle se montre la plus stable en profondeur : elle véhicule de l'eau dans les zones de subduction sur des dizaines de kilomètres, puis la libère, nourrissant ainsi le volcanisme.",
  },
  lizardite: {
    nom: "Lizardite", formule: "Mg₃Si₂O₅(OH)₄", famille: "Phyllosilicate : serpentine (1:1)",
    systeme: "trigonal / monoclinique", durete: 2.5, densite: 2.55, stabilite: 4, swatch: "#7a9a72",
    clivage: "parfait basal", eclat: "gras à mat",
    couleurs: "vert clair à vert sombre, blanc",
    contexte: "Serpentinites formées à basse température, par hydratation de l'olivine au contact de l'eau de mer.",
    devient: "→ smectites + oxydes de fer.",
    note: "Ses feuillets plans et ses cristaux minuscules en font la serpentine la plus abondante, celle qui colore en vert le fond des serpentinites. Elle tire son nom de la péninsule du Lizard, en Cornouailles, où affleure un fragment de plancher océanique fossile.",
  },

  // ---------- Groupe des chlorites (2:1:1) ----------
  clinochlore: {
    nom: "Clinochlore", formule: "(Mg,Fe)₅Al(AlSi₃O₁₀)(OH)₈", famille: "Phyllosilicate : chlorite (2:1:1)",
    systeme: "monoclinique", durete: 2.5, densite: 2.65, stabilite: 4, swatch: "#6f9a72",
    clivage: "parfait basal {001} : feuillets flexibles mais NON élastiques", eclat: "nacré à vitreux",
    couleurs: "vert (toutes nuances), blanc, rose (variété manganésifère)",
    contexte: "Présent dans les schistes verts et les roches métamorphiques de bas degré.",
    devient: "→ vermiculite puis smectites.",
    note: "Pôle magnésien des chlorites. À son feuillet 2:1 s'ajoute une couche d'hydroxydes (« brucitique »), qui porte l'empilement à 14 Å. Il colore en vert les schistes verts. Ses feuillets plient sans se briser mais ne rebondissent pas, ce qui le distingue des micas. Sa variété rose, riche en chrome et en manganèse, porte le nom de kämmererite.",
  },
  chamosite: {
    nom: "Chamosite", formule: "(Fe,Mg)₅Al(AlSi₃O₁₀)(OH)₈", famille: "Phyllosilicate : chlorite (2:1:1)",
    systeme: "monoclinique", durete: 3, densite: 3.1, stabilite: 3, swatch: "#4a5a48",
    clivage: "parfait basal {001}", eclat: "terne à nacré",
    couleurs: "vert-gris, vert sombre, noir",
    contexte: "Oolithes ferrifères sédimentaires.",
    devient: "→ oxydes de fer + argiles.",
    note: "Pôle ferreux des chlorites. Avec la berthiérine, elle forme les petites sphères (oolithes) du minerai de fer lorrain, la « minette », qui fut le socle de la sidérurgie française pendant plus d'un siècle. Son nom vient de Chamoson, dans le Valais suisse.",
  },

  // ---------- Autres phyllosilicates ----------
  apophyllite: {
    nom: "Apophyllite", formule: "KCa₄Si₈O₂₀(F,OH)·8H₂O", famille: "Phyllosilicate : divers",
    systeme: "quadratique", durete: 4.75, densite: 2.35, stabilite: 3, swatch: "#d8e4e0",
    clivage: "parfait basal {001}", eclat: "vitreux, nacré sur le clivage",
    couleurs: "incolore, blanc, vert, rose",
    contexte: "On la trouve dans les cavités des basaltes, en compagnie des zéolites (trapps du Deccan, Inde).",
    devient: "→ argiles.",
    note: "Il se situe à la limite des phyllosilicates : ses feuillets de silicium sont reliés entre eux par de l'eau et du calcium. Dans les géodes basaltiques, il cristallise en beaux cubes ou pyramides, limpides ou vert d'eau, aux côtés des zéolites. Son nom grec, « qui s'effeuille », rappelle son exfoliation lorsqu'on le chauffe.",
  },
  prehnite: {
    nom: "Prehnite", formule: "Ca₂Al(AlSi₃O₁₀)(OH)₂", famille: "Phyllosilicate : divers",
    systeme: "orthorhombique", durete: 6.25, densite: 2.9, stabilite: 4, swatch: "#a8c088",
    clivage: "bon basal {001}", eclat: "vitreux à gras",
    couleurs: "vert pomme, vert-jaune, blanc",
    contexte: "Présent dans les cavités et les veines des basaltes, ainsi que dans le métamorphisme de très bas degré (faciès prehnite-pumpellyite).",
    devient: "→ argiles.",
    note: "Agrégats botryoïdes vert pomme, translucides, parfois hérissés d'aiguilles noires d'épidote. Strunz hésite à le ranger : il occupe la charnière entre inosilicates et phyllosilicates. Il sert de nom à un faciès métamorphique de très basse température. Première espèce minérale nommée d'après une personne, il honore le colonel néerlandais von Prehn.",
  },
});

// ---------- Sous-familles des phyllosilicates ----------
// Section 1 : non argileux (fiches complètes).  Section 2 : argiles (résumé).
const SECT_PHYLLO = "Phyllosilicates non argileux";
const SECT_ARGILE = "Minéraux argileux, traités dans la partie Argiles";

const PHYLLO_SOUS_FAMILLES = [
  {
    nom: "Micas vrais dioctaédriques",
    formule: "X Al₂(AlSi₃O₁₀)(OH)₂ : feuillet 2:1 + cation interfoliaire",
    section: SECT_PHYLLO,
    note: "Micas « blancs » : feuillet 2:1 dont seuls deux sites octaédriques sur trois sont occupés, par l'aluminium. Un cation peu lié (K⁺ ou Na⁺) se loge entre les feuillets, rendant possible le clivage en lamelles élastiques. La muscovite en constitue le type, tandis que la glauconie, son équivalent marin, s'avère ferrifère et proche des argiles.",
    mineraux: ["muscovite", "paragonite", "glauconie"],
  },
  {
    nom: "Micas vrais trioctaédriques",
    formule: "X (Mg,Fe,Li)₃(AlSi₃O₁₀)(OH,F)₂",
    section: SECT_PHYLLO,
    note: "Chez les micas noirs ou colorés, tous les sites octaédriques sont pourvus (Mg, Fe, Li). Font partie de ce groupe la biotite et sa série (magnésium et fer), la phlogopite dorée, ainsi que les micas au lithium des pegmatites : lépidolite et zinnwaldite.",
    mineraux: ["biotite", "phlogopite", "lepidolite", "zinnwaldite"],
  },
  {
    nom: "Micas cassants",
    formule: "Ca (Al,Mg)₂₋₃(Al,Si)₄O₁₀(OH)₂",
    section: SECT_PHYLLO,
    note: "Le calcium entre les feuillets, deux fois plus chargé que le potassium, les resserre : les lamelles cassent au lieu de plier, et le minéral est plus dur d'un cran que les vrais micas. La margarite (aluminium) et la clintonite (magnésium) en sont les représentants.",
    mineraux: ["margarite", "clintonite"],
  },
  {
    nom: "Groupe talc-pyrophyllite",
    formule: "(Mg,Al)₃₋₂Si₄O₁₀(OH)₂ : feuillet 2:1 NEUTRE",
    section: SECT_PHYLLO,
    note: "Dans ce groupe, le feuillet 2:1 est électriquement neutre : aucun cation ne s'intercale, et les feuillets glissent librement. Il en résulte des minéraux très tendres et gras au toucher, comme le talc (magnésium, le plus tendre de tous) et la pyrophyllite (aluminium).",
    mineraux: ["talc", "pyrophyllite"],
  },
  {
    nom: "Groupe des serpentines",
    formule: "Mg₃Si₂O₅(OH)₄ : feuillet 1:1",
    section: SECT_PHYLLO,
    note: "Feuillet 1:1 magnésien, formé d'un plan de tétraèdres et d'un plan d'octaèdres. Le désaccord entre ces deux plans contraint le feuillet à s'enrouler (chrysotile, en fibres) ou à onduler (antigorite). Ces minéraux caractérisent les serpentinites, issues de l'hydratation du manteau.",
    mineraux: ["chrysotile", "antigorite", "lizardite"],
  },
  {
    nom: "Groupe des chlorites",
    formule: "(Mg,Fe)₅Al(AlSi₃O₁₀)(OH)₈ : feuillet 2:1:1",
    section: SECT_PHYLLO,
    note: "Architecture à 14 Å : une couche d'hydroxydes s'ajoute au feuillet 2:1. Verts et tendres, ces minéraux constituent les schistes verts (clinochlore, magnésium) et les minerais de fer sédimentaires (chamosite, fer).",
    mineraux: ["clinochlore", "chamosite"],
  },
  {
    nom: "Autres phyllosilicates",
    formule: "structures de transition",
    section: SECT_PHYLLO,
    note: "Aux frontières de la classe figurent l'apophyllite, dont l'eau relie les feuillets (elle accompagne les zéolites), et la prehnite vert pomme, à mi-chemin entre inosilicates et phyllosilicates.",
    mineraux: ["apophyllite", "prehnite"],
  },
  {
    nom: "Minéraux argileux (kaolin, illite, smectites, vermiculite…)",
    formule: "phyllosilicates de très petite taille : 1:1, 2:1 et 2:1:1",
    section: SECT_ARGILE,
    note: "Les phyllosilicates de l'ordre du micron, issus de l'altération, constituent l'ensemble des argiles. Ce monde est trop vaste pour tenir ici : il dispose de sa propre partie dans l'atlas, avec une classification calquée sur le tableau de Wikipédia. On trouvera ci-dessous quelques chefs de file ; un clic ouvre leur fiche résumée, qui renvoie à la fiche argile complète.",
    mineraux: ["kaolinite_m", "illite_m", "smectites_m"],
  },
];

// On accroche les sous-familles au groupe « Phyllosilicates » de la classe IX
(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const phyllo = silicates.groupes.find((g) => g.nom.startsWith("Phyllosilicates"));
  phyllo.sousGroupes = PHYLLO_SOUS_FAMILLES;
  phyllo.mineraux = PHYLLO_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
  phyllo.motif = "feuillets Si₂O₅ empilés : 1:1, 2:1 ou 2:1:1";
  phyllo.note = "Chaque tétraèdre partage trois de ses quatre sommets et forme des feuillets continus, empilés avec des feuillets d'octaèdres. Trois architectures existent : 1:1 (serpentines, kaolin), 2:1 (talc, micas, illite, smectites) et 2:1:1 (chlorites). D'où le clivage parfait en lamelles qui caractérise toute la classe. Ce sont les phyllosilicates non argileux (micas, talc, serpentines, chlorites) qui sont détaillés ici ; le monde argileux, immense, bénéficie d'une partie dédiée.";
})();
