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
    nom: "Paragonite", formule: "NaAl₂(AlSi₃O₁₀)(OH)₂", famille: "Phyllosilicate — mica dioctaédrique",
    systeme: "monoclinique", durete: 2.5, densite: 2.85, stabilite: 7, swatch: "#d0cdc5",
    clivage: "parfait basal {001} — feuillets élastiques", eclat: "nacré",
    couleurs: "incolore, blanc, gris, jaunâtre",
    contexte: "Micaschistes et phyllades du métamorphisme de bas à moyen degré.",
    devient: "→ illite puis argiles.",
    note: "Le jumeau sodique de la muscovite : même charpente, du sodium à la place du potassium. Souvent en intercroissance si fine avec la muscovite qu'on ne les distingue qu'au laboratoire. Bon indicateur des conditions du métamorphisme.",
  },

  // ---------- Micas vrais trioctaédriques (2:1 + K) ----------
  phlogopite: {
    nom: "Phlogopite", formule: "KMg₃(AlSi₃O₁₀)(F,OH)₂", famille: "Phyllosilicate — mica trioctaédrique",
    systeme: "monoclinique", durete: 2.75, densite: 2.85, stabilite: 5, swatch: "#b98a4a",
    clivage: "parfait basal {001} — feuillets élastiques", eclat: "nacré à submétallique",
    couleurs: "brun doré, jaune miel, brun-rouge",
    contexte: "Marbres dolomitiques, roches ultramafiques, kimberlites.",
    devient: "→ vermiculite (perte de K⁺) puis argiles.",
    note: "Le pôle magnésien de la série biotite, brun doré. Stable jusqu'à près de 900 °C, isolante à la chaleur et à l'électricité — c'est le « mica industriel » des résistances et des fours. Compagne du diamant dans les kimberlites.",
  },
  lepidolite: {
    nom: "Lépidolite", formule: "K(Li,Al)₃(AlSi₃O₁₀)(F,OH)₂", famille: "Phyllosilicate — mica trioctaédrique",
    systeme: "monoclinique", durete: 3, densite: 2.85, stabilite: 5, swatch: "#c9a8d0",
    clivage: "parfait basal {001}", eclat: "nacré",
    couleurs: "lilas, rose, violet pâle, gris",
    contexte: "Pegmatites granitiques à lithium (avec tourmaline rose et spodumène).",
    devient: "→ argiles ; libère le lithium.",
    note: "Le mica au lithium, rose à lilas (une teinte due au manganèse). Elle tapisse les pegmatites en agrégats de paillettes ; c'est un minerai de lithium, mais aussi de rubidium et de césium. Elle signale les mêmes pegmatites que le spodumène et la tourmaline gemme.",
  },
  zinnwaldite: {
    nom: "Zinnwaldite", formule: "KLiFeAl(AlSi₃O₁₀)(F,OH)₂", famille: "Phyllosilicate — mica trioctaédrique",
    systeme: "monoclinique", durete: 3, densite: 2.9, stabilite: 5, swatch: "#a89a86",
    clivage: "parfait basal {001}", eclat: "nacré",
    couleurs: "brun-gris, brun pâle, argenté",
    contexte: "Greisens et pegmatites à étain (Zinnwald/Cínovec, monts Métallifères).",
    devient: "→ argiles.",
    note: "Un mica lithino-ferreux, intermédiaire entre la biotite et la lépidolite. Nommée d'après Zinnwald, à la frontière germano-tchèque, où elle accompagne la cassitérite — le minerai d'étain — dans les greisens.",
  },

  // ---------- Micas cassants (2:1 + Ca) ----------
  margarite: {
    nom: "Margarite", formule: "CaAl₂(Al₂Si₂O₁₀)(OH)₂", famille: "Phyllosilicate — mica cassant",
    systeme: "monoclinique", durete: 3.75, densite: 3.0, stabilite: 5, swatch: "#d8c0c0",
    clivage: "parfait basal {001} — feuillets CASSANTS (non élastiques)", eclat: "nacré à vitreux",
    couleurs: "rose, gris, blanc jaunâtre",
    contexte: "Gisements d'émeri et roches métamorphiques alumineuses.",
    devient: "→ argiles.",
    note: "Un « mica cassant » : le calcium interfoliaire double la charge du feuillet, si bien que les lamelles se brisent au lieu de plier comme celles des vrais micas. Associée au corindon dans l'émeri, l'abrasif naturel. Son nom vient du grec margaritês, « perle », pour son éclat nacré.",
  },
  clintonite: {
    nom: "Clintonite", formule: "Ca(Mg,Al)₃(Al₃SiO₁₀)(OH)₂", famille: "Phyllosilicate — mica cassant",
    systeme: "monoclinique", durete: 3.5, densite: 3.1, stabilite: 5, swatch: "#b0a060",
    clivage: "parfait basal {001} — cassant", eclat: "nacré à submétallique",
    couleurs: "vert-jaune, brun-rouge, incolore",
    contexte: "Skarns et marbres dolomitiques métamorphisés.",
    devient: "→ argiles.",
    note: "Un mica cassant trioctaédrique remarquable par sa pauvreté en silice : l'un des rares silicates où l'aluminium l'emporte sur le silicium dans les tétraèdres. On la trouve dans les skarns, au contact des intrusions et des calcaires.",
  },

  // ---------- Groupe talc – pyrophyllite (2:1 neutre) ----------
  talc: {
    nom: "Talc", formule: "Mg₃Si₄O₁₀(OH)₂", famille: "Phyllosilicate — talc-pyrophyllite (2:1 neutre)",
    systeme: "monoclinique / triclinique", durete: 1, densite: 2.75, stabilite: 3, swatch: "#d8e0d5",
    clivage: "parfait basal {001}", eclat: "nacré, gras au toucher",
    couleurs: "blanc, vert pâle, gris",
    contexte: "Métamorphisme des roches ultramafiques et des dolomies siliceuses.",
    devient: "→ argiles magnésiennes.",
    note: "Le minéral le plus tendre de l'échelle de Mohs (dureté 1) : ses feuillets 2:1 sont électriquement neutres et glissent librement les uns sur les autres, d'où le toucher gras. Trimouns, au-dessus de Luzenac (Ariège), est la plus grande carrière de talc du monde. Sa forme massive est la stéatite (pierre à savon), sculptée depuis la préhistoire.",
  },
  pyrophyllite: {
    nom: "Pyrophyllite", formule: "Al₂Si₄O₁₀(OH)₂", famille: "Phyllosilicate — talc-pyrophyllite (2:1 neutre)",
    systeme: "monoclinique / triclinique", durete: 1.5, densite: 2.8, stabilite: 4, swatch: "#dcd8cc",
    clivage: "parfait basal {001}", eclat: "nacré à gras",
    couleurs: "blanc, gris, vert pâle, jaunâtre",
    contexte: "Métamorphisme de bas degré des roches alumineuses, schistes séricitiques.",
    devient: "→ kaolinite + argiles.",
    note: "L'analogue alumineux du talc : même feuillet 2:1 neutre, avec de l'aluminium à la place du magnésium. Tendre et grasse comme lui. Chauffée, elle se délite en éventail — d'où son nom (grec pyro-phyllon, « feuille de feu »). Sa variété massive fine, l'agalmatolite, sert à la sculpture en Chine.",
  },

  // ---------- Groupe des serpentines (1:1 trioctaédrique) ----------
  chrysotile: {
    nom: "Chrysotile", formule: "Mg₃Si₂O₅(OH)₄", famille: "Phyllosilicate — serpentine (1:1)",
    systeme: "monoclinique", durete: 2.75, densite: 2.55, stabilite: 4, swatch: "#9ab088",
    clivage: "fibreux (feuillets enroulés en tubes)", eclat: "soyeux",
    couleurs: "vert clair, blanc, jaune",
    contexte: "Veines soyeuses recoupant les serpentinites.",
    devient: "→ smectites magnésiennes + oxydes de fer.",
    note: "Ses feuillets 1:1 s'enroulent en fibres creuses microscopiques : c'est l'AMIANTE BLANC, qui a représenté plus de 90 % de tout l'amiante utilisé dans le monde — interdit en France depuis 1997. Veines vert clair soyeuses, aux fibres perpendiculaires à la paroi.",
  },
  antigorite: {
    nom: "Antigorite", formule: "(Mg,Fe)₃Si₂O₅(OH)₄", famille: "Phyllosilicate — serpentine (1:1)",
    systeme: "monoclinique", durete: 3.5, densite: 2.6, stabilite: 4, swatch: "#4f6a52",
    clivage: "bon dans un sens (structure ondulée)", eclat: "gras à cireux",
    couleurs: "vert sombre, vert-brun, vert-noir",
    contexte: "Serpentinites de subduction et métamorphisme alpin (schistes lustrés du Queyras).",
    devient: "→ smectites + oxydes de fer.",
    note: "Ses feuillets ondulent en vagues, ce qui lui donne une structure massive lamellaire. C'est la serpentine des hautes pressions et la plus stable en profondeur : elle transporte de l'eau dans les zones de subduction, jusqu'à des dizaines de kilomètres, avant de la relâcher et de nourrir le volcanisme.",
  },
  lizardite: {
    nom: "Lizardite", formule: "Mg₃Si₂O₅(OH)₄", famille: "Phyllosilicate — serpentine (1:1)",
    systeme: "trigonal / monoclinique", durete: 2.5, densite: 2.55, stabilite: 4, swatch: "#7a9a72",
    clivage: "parfait basal", eclat: "gras à mat",
    couleurs: "vert clair à vert sombre, blanc",
    contexte: "Serpentinites de basse température (hydratation de l'olivine par l'eau de mer).",
    devient: "→ smectites + oxydes de fer.",
    note: "Feuillets plans, cristaux minuscules : c'est la plus abondante des serpentines, celle qui donne leur fond vert aux serpentinites. Nommée d'après la péninsule du Lizard, en Cornouailles, où affleure un fragment de plancher océanique fossile.",
  },

  // ---------- Groupe des chlorites (2:1:1) ----------
  clinochlore: {
    nom: "Clinochlore", formule: "(Mg,Fe)₅Al(AlSi₃O₁₀)(OH)₈", famille: "Phyllosilicate — chlorite (2:1:1)",
    systeme: "monoclinique", durete: 2.5, densite: 2.65, stabilite: 4, swatch: "#6f9a72",
    clivage: "parfait basal {001} — feuillets flexibles mais NON élastiques", eclat: "nacré à vitreux",
    couleurs: "vert (toutes nuances), blanc, rose (variété manganésifère)",
    contexte: "Schistes verts et roches métamorphiques de bas degré.",
    devient: "→ vermiculite puis smectites.",
    note: "Le pôle magnésien des chlorites. À son feuillet 2:1 s'ajoute une couche d'hydroxydes (« brucitique »), ce qui porte l'empilement à 14 Å. Il donne leur teinte verte aux schistes verts. Ses feuillets plient sans casser mais ne rebondissent pas — ce qui le distingue des micas. Sa variété rose au chrome-manganèse est la kämmererite.",
  },
  chamosite: {
    nom: "Chamosite", formule: "(Fe,Mg)₅Al(AlSi₃O₁₀)(OH)₈", famille: "Phyllosilicate — chlorite (2:1:1)",
    systeme: "monoclinique", durete: 3, densite: 3.1, stabilite: 3, swatch: "#4a5a48",
    clivage: "parfait basal {001}", eclat: "terne à nacré",
    couleurs: "vert-gris, vert sombre, noir",
    contexte: "Oolithes ferrifères sédimentaires.",
    devient: "→ oxydes de fer + argiles.",
    note: "Le pôle ferreux des chlorites. C'est elle, avec la berthiérine, qui compose les petites sphères (oolithes) du minerai de fer lorrain, la « minette » — le socle de la sidérurgie française pendant plus d'un siècle. Nommée d'après Chamoson, dans le Valais suisse.",
  },

  // ---------- Autres phyllosilicates ----------
  apophyllite: {
    nom: "Apophyllite", formule: "KCa₄Si₈O₂₀(F,OH)·8H₂O", famille: "Phyllosilicate — divers",
    systeme: "quadratique", durete: 4.75, densite: 2.35, stabilite: 3, swatch: "#d8e4e0",
    clivage: "parfait basal {001}", eclat: "vitreux, nacré sur le clivage",
    couleurs: "incolore, blanc, vert, rose",
    contexte: "Cavités des basaltes, avec les zéolites (trapps du Deccan, Inde).",
    devient: "→ argiles.",
    note: "Aux confins des phyllosilicates : ses feuillets de silicium sont reliés par de l'eau et du calcium. De beaux cristaux cubiques ou pyramidaux, limpides ou vert d'eau, dans les géodes basaltiques, aux côtés des zéolites. Son nom (grec « qui s'effeuille ») décrit son exfoliation quand on la chauffe.",
  },
  prehnite: {
    nom: "Prehnite", formule: "Ca₂Al(AlSi₃O₁₀)(OH)₂", famille: "Phyllosilicate — divers",
    systeme: "orthorhombique", durete: 6.25, densite: 2.9, stabilite: 4, swatch: "#a8c088",
    clivage: "bon basal {001}", eclat: "vitreux à gras",
    couleurs: "vert pomme, vert-jaune, blanc",
    contexte: "Cavités et veines des basaltes ; métamorphisme de très bas degré (faciès prehnite-pumpellyite).",
    devient: "→ argiles.",
    note: "En agrégats botryoïdes vert pomme translucides, souvent hérissés d'aiguilles noires d'épidote. Sa classification hésite — Strunz la place à la charnière entre ino- et phyllosilicates. Elle donne son nom à un faciès métamorphique de très basse température. Ce fut la première espèce minérale nommée d'après une personne, le colonel néerlandais von Prehn.",
  },
});

// ---------- Sous-familles des phyllosilicates ----------
// Section 1 : non argileux (fiches complètes).  Section 2 : argiles (résumé).
const SECT_PHYLLO = "Phyllosilicates non argileux";
const SECT_ARGILE = "Minéraux argileux — détaillés dans la partie Argiles";

const PHYLLO_SOUS_FAMILLES = [
  {
    nom: "Micas vrais dioctaédriques",
    formule: "X Al₂(AlSi₃O₁₀)(OH)₂ — feuillet 2:1 + cation interfoliaire",
    section: SECT_PHYLLO,
    note: "Les micas « blancs » : feuillet 2:1 dont seuls deux sites octaédriques sur trois sont occupés (par Al). Un cation faiblement lié (K, Na) entre les feuillets permet le clivage en lamelles élastiques. La muscovite en est le type ; la glauconie en est la cousine marine, ferrifère et à la frontière des argiles.",
    mineraux: ["muscovite", "paragonite", "glauconie"],
  },
  {
    nom: "Micas vrais trioctaédriques",
    formule: "X (Mg,Fe,Li)₃(AlSi₃O₁₀)(OH,F)₂",
    section: SECT_PHYLLO,
    note: "Les micas « noirs » et colorés : les trois sites octaédriques sont occupés (Mg, Fe, Li). La série de la biotite (magnésium ↔ fer), la phlogopite dorée, et les micas au lithium des pegmatites (lépidolite, zinnwaldite).",
    mineraux: ["biotite", "phlogopite", "lepidolite", "zinnwaldite"],
  },
  {
    nom: "Micas cassants",
    formule: "Ca (Al,Mg)₂₋₃(Al,Si)₄O₁₀(OH)₂",
    section: SECT_PHYLLO,
    note: "Le calcium interfoliaire, deux fois plus chargé que le potassium, serre les feuillets : les lamelles se cassent au lieu de plier. Un cran plus durs que les vrais micas. Margarite (Al) et clintonite (Mg) en sont les deux représentants.",
    mineraux: ["margarite", "clintonite"],
  },
  {
    nom: "Groupe talc – pyrophyllite",
    formule: "(Mg,Al)₃₋₂Si₄O₁₀(OH)₂ — feuillet 2:1 NEUTRE",
    section: SECT_PHYLLO,
    note: "Ici, le feuillet 2:1 est électriquement neutre : rien entre les feuillets, qui glissent librement. D'où des minéraux extrêmement tendres et gras au toucher — le talc (Mg, le plus tendre de tous) et la pyrophyllite (Al).",
    mineraux: ["talc", "pyrophyllite"],
  },
  {
    nom: "Groupe des serpentines",
    formule: "Mg₃Si₂O₅(OH)₄ — feuillet 1:1",
    section: SECT_PHYLLO,
    note: "Feuillet 1:1 magnésien (un plan de tétraèdres, un plan d'octaèdres). Le léger désaccord entre les deux plans force le feuillet à s'enrouler (chrysotile, en fibres) ou à onduler (antigorite). Ce sont les minéraux des serpentinites, nées de l'hydratation du manteau.",
    mineraux: ["chrysotile", "antigorite", "lizardite"],
  },
  {
    nom: "Groupe des chlorites",
    formule: "(Mg,Fe)₅Al(AlSi₃O₁₀)(OH)₈ — feuillet 2:1:1",
    section: SECT_PHYLLO,
    note: "Une architecture à 14 Å : au feuillet 2:1 s'ajoute une couche d'hydroxydes. Verts et tendres, ce sont les minéraux des schistes verts (clinochlore, Mg) et des minerais de fer sédimentaires (chamosite, Fe).",
    mineraux: ["clinochlore", "chamosite"],
  },
  {
    nom: "Autres phyllosilicates",
    formule: "structures de transition",
    section: SECT_PHYLLO,
    note: "Aux marges de la classe : l'apophyllite, dont les feuillets sont liés par de l'eau (compagne des zéolites), et la prehnite vert pomme, à la charnière entre ino- et phyllosilicates.",
    mineraux: ["apophyllite", "prehnite"],
  },
  {
    nom: "Minéraux argileux (kaolin, illite, smectites, vermiculite…)",
    formule: "phyllosilicates de très petite taille — 1:1, 2:1 et 2:1:1",
    section: SECT_ARGILE,
    note: "Les phyllosilicates de la taille du micron, nés de l'altération : ils forment tout le monde des argiles. Trop vaste pour tenir ici — il a sa PARTIE DÉDIÉE dans l'atlas, avec sa classification calquée sur le tableau de Wikipédia. Ci-dessous quelques chefs de file ; cliquer ouvre leur fiche résumée, qui renvoie à la fiche argile complète.",
    mineraux: ["kaolinite_m", "illite_m", "smectites_m"],
  },
];

// On accroche les sous-familles au groupe « Phyllosilicates » de la classe IX
(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const phyllo = silicates.groupes.find((g) => g.nom.startsWith("Phyllosilicates"));
  phyllo.sousGroupes = PHYLLO_SOUS_FAMILLES;
  phyllo.mineraux = PHYLLO_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
  phyllo.motif = "feuillets Si₂O₅ empilés — 1:1, 2:1 ou 2:1:1";
  phyllo.note = "Les tétraèdres partagent trois de leurs quatre sommets et forment des feuillets continus, empilés avec des feuillets d'octaèdres. Trois architectures : 1:1 (serpentines, kaolin), 2:1 (talc, micas, illite, smectites) et 2:1:1 (chlorites). De là le clivage parfait en lamelles qui définit toute la classe. On détaille ici les phyllosilicates NON argileux (micas, talc, serpentines, chlorites) ; le monde ARGILEUX, immense, a sa partie dédiée.";
})();
