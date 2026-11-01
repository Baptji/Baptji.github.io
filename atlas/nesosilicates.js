// ============================================================
// NÉSOSILICATES (Strunz 9.A) — tétraèdres SiO₄ isolés
// ~120 espèces existent ; on décrit ici les principales,
// regroupées en sous-familles (phénacite, olivine, grenats,
// zircon, silicates d'alumine, humite, topaze, titanite…).
//
// Deux grandes catégories (Wikipédia / Strunz) :
//   • nésosilicates AU SENS STRICT : SiO₄ + cations seulement
//   • NÉSOSUBSILICATES : SiO₄ + anions supplémentaires (O, OH, F)
//
// Propriétés : systeme (cristallin), durete (Mohs), densite (g/cm³),
// clivage, eclat, couleurs, contexte, devient (altération).
// Chargé après mineraux-suite.js, avant app.js.
// ============================================================

Object.assign(MINERAUX, {
  // ---------- Groupe de la phénacite (cations en coordination 4) ----------
  phenacite: {
    nom: "Phénacite", formule: "Be₂SiO₄", famille: "Nésosilicate (groupe de la phénacite)",
    systeme: "rhomboédrique", durete: 7.75, densite: 2.96, stabilite: 9, swatch: "#e6e2dc",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, blanc, jaune pâle",
    contexte: "Pegmatites granitiques et fentes alpines, où elle accompagne le béryl.",
    devient: "Résiduelle : très résistante.",
    note: "Le nom dérive du grec phenax, « trompeur » : incolore et dure, elle était prise pour du quartz. Pourtant, c'est un minéral de béryllium, rare et prisé des collectionneurs.",
  },
  willemite: {
    nom: "Willémite", formule: "Zn₂SiO₄", famille: "Nésosilicate (groupe de la phénacite)",
    systeme: "rhomboédrique", durete: 5.5, densite: 4.05, stabilite: 5, swatch: "#8fae6a",
    clivage: "bon", eclat: "vitreux à résineux", couleurs: "vert, jaune, brun : vert vif en UV",
    contexte: "Principalement dans les gisements de zinc métamorphisés, notamment à Franklin (New Jersey).",
    devient: "→ smithsonite et hémimorphite (zone d'oxydation).",
    note: "L'un des minéraux fluorescents les plus connus : sous lampe UV, elle devient d'un vert éclatant sous l'effet de traces de manganèse. Son nom honore le roi Guillaume Iᵉʳ des Pays-Bas.",
  },
  eucryptite: {
    nom: "Eucryptite", formule: "LiAlSiO₄", famille: "Nésosilicate (groupe de la phénacite)",
    systeme: "rhomboédrique", durete: 6.5, densite: 2.67, stabilite: 5, swatch: "#ded6cc",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, blanc, rosé",
    contexte: "On la rencontre dans les pegmatites à lithium, où elle se substitue au spodumène.",
    devient: "→ argiles + Li⁺ en solution.",
    note: "Minerai secondaire de lithium. Particularité remarquable : chauffée, elle se contracte au lieu de se dilater. Cette « dilatation négative » permet de fabriquer des céramiques stables en température (plaques de cuisson vitrocéramiques).",
  },

  // ---------- Groupe de l'olivine (A₂SiO₄, cations en coordination 6) ----------
  forsterite: {
    nom: "Forstérite", formule: "Mg₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 7, densite: 3.27, stabilite: 2, swatch: "#9fb85f",
    clivage: "imparfait", eclat: "vitreux", couleurs: "vert olive, jaune-vert",
    contexte: "Pôle magnésien de l'olivine ; on le trouve dans les péridotites du manteau et dans les marbres dolomitiques.",
    devient: "Il donne de la serpentine par hydratation, ou des smectites et des oxydes de fer par altération.",
    note: "Pôle pur en magnésium de la série de l'olivine. Il constitue le minéral le plus abondant du manteau terrestre supérieur et, en volume, l'un des plus répandus de la planète, bien qu'il affleure rarement en surface.",
  },
  fayalite: {
    nom: "Fayalite", formule: "Fe₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 6.5, densite: 4.39, stabilite: 1, swatch: "#6b5a3a",
    clivage: "imparfait", eclat: "vitreux à résineux", couleurs: "brun-vert, brun-noir",
    contexte: "Pôle ferreux, présent dans les roches volcaniques riches en fer, les granites alcalins et les scories.",
    devient: "Il se transforme très rapidement en oxydes de fer (goethite, hématite) et en silice.",
    note: "Le pôle pur en fer est nettement plus dense et bien plus fragile que la forstérite : la fayalite rouille à l'air. Abondante dans les scories métallurgiques anciennes, elle aide les archéologues à repérer les sites de forge.",
  },
  tephroite: {
    nom: "Téphroïte", formule: "Mn₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 6, densite: 4.1, stabilite: 2, swatch: "#8a6a68",
    clivage: "bon", eclat: "vitreux à résineux", couleurs: "gris cendré, rouge-brun",
    contexte: "Gisements de manganèse métamorphisés (Franklin, Långban).",
    devient: "→ oxydes noirs de manganèse.",
    note: "Olivine au manganèse, la téphroïte tire son nom du grec tephra, « cendre », en raison de sa couleur grise. Au contact de l'air, elle noircit en se couvrant d'oxydes de Mn.",
  },
  monticellite: {
    nom: "Monticellite", formule: "CaMgSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 5.5, densite: 3.05, stabilite: 2, swatch: "#c8c2b0",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, gris, vert pâle",
    contexte: "On la trouve dans les marbres et les skarns, au contact entre un magma et une dolomie.",
    devient: "→ serpentine + calcite.",
    note: "Une dolomie cuite au contact d'une intrusion donne l'olivine calcique. Sa présence signale une température élevée et une roche de départ magnésienne et carbonatée.",
  },
  ringwoodite: {
    nom: "Ringwoodite", formule: "Mg₂SiO₄ (structure spinelle)", famille: "Nésosilicate (polymorphe de l'olivine)",
    systeme: "cubique", durete: 7.5, densite: 3.9, stabilite: 8, swatch: "#4a6fa0",
    clivage: "aucun", eclat: "vitreux", couleurs: "bleu profond, violet",
    contexte: "On la trouve dans le manteau profond (525 à 660 km), dans les météorites choquées, et dans une inclusion d'un diamant brésilien.",
    devient: "En remontant, elle redevient olivine : elle n'existe pas en surface.",
    note: "Sous très haute pression, l'olivine se réorganise en structure spinelle, plus compacte. En 2014, une ringwoodite piégée dans un diamant brésilien s'est révélée contenir 1,5 % d'eau : à 500 km sous nos pieds, un réservoir d'eau pourrait dépasser en volume l'ensemble des océans.",
  },
  wadsleyite: {
    nom: "Wadsleyite", formule: "β-Mg₂SiO₄", famille: "Nésosilicate (polymorphe de l'olivine)",
    systeme: "orthorhombique", durete: 7, densite: 3.84, stabilite: 8, swatch: "#5a7a9a",
    clivage: "—", eclat: "vitreux", couleurs: "bleu-vert (en laboratoire)",
    contexte: "Dans la zone de transition du manteau (410 à 525 km), ainsi que dans les météorites.",
    devient: "Instable en surface : redevient olivine.",
    note: "Entre l'olivine et la ringwoodite se place la wadsleyite. Vers 410 km, le passage de l'olivine à la wadsleyite produit un brusque saut de densité que captent les ondes sismiques : la « discontinuité des 410 km », frontière invisible mais bien réelle.",
  },

  // ---------- Groupe du grenat (A₃B₂(SiO₄)₃, cubique) ----------
  pyrope: {
    nom: "Pyrope", formule: "Mg₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat : pyralspite)",
    systeme: "cubique", durete: 7.25, densite: 3.58, stabilite: 7, swatch: "#9c2b32",
    clivage: "aucun (cassure conchoïdale)", eclat: "vitreux", couleurs: "rouge sang à rouge violacé",
    contexte: "On le trouve dans les péridotites, les kimberlites (compagnon du diamant) et les éclogites.",
    devient: "Résiduel (sables), puis lentement argiles + oxydes.",
    note: "Le nom vient du grec pyropos, « à l'aspect de feu ». Grenat des grandes profondeurs, le pyrope intéresse les prospecteurs de diamants : ils suivent ses grains dans les rivières, car il vient des mêmes kimberlites. C'est donc un « minéral indicateur ».",
  },
  almandin: {
    nom: "Almandin", formule: "Fe₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat : pyralspite)",
    systeme: "cubique", durete: 7.5, densite: 4.32, stabilite: 7, swatch: "#7d3040",
    clivage: "aucun", eclat: "vitreux", couleurs: "rouge sombre, brun-rouge",
    contexte: "Dans les micaschistes et les gneiss, il caractérise le métamorphisme régional.",
    devient: "Il subsiste sous forme résiduelle dans les sables à grenats, puis se transforme en oxydes de fer et en argiles.",
    note: "Le grenat le plus courant forme les cristaux rouge sombre des micaschistes. Assez dur et dense, il s'accumule en placers : certaines plages bretonnes ont un sable rose grenat. Il sert aussi d'abrasif (papier de verre, découpe au jet d'eau).",
  },
  spessartine: {
    nom: "Spessartine", formule: "Mn₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat : pyralspite)",
    systeme: "cubique", durete: 7.25, densite: 4.19, stabilite: 7, swatch: "#d4682a",
    clivage: "aucun", eclat: "vitreux", couleurs: "orange à rouge-orangé (« grenat mandarine »)",
    contexte: "On la trouve dans les pegmatites granitiques et les gisements de manganèse métamorphisés.",
    devient: "Résiduelle ; libère lentement du manganèse.",
    note: "Grenat au manganèse, d'un orange vif lorsqu'il est limpide ; les gemmologues le désignent sous le nom de « grenat mandarine ». Il tient son nom du Spessart, en Bavière.",
  },
  grossulaire: {
    nom: "Grossulaire", formule: "Ca₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat : ugrandite)",
    systeme: "cubique", durete: 7, densite: 3.59, stabilite: 6, swatch: "#a8a05a",
    clivage: "aucun", eclat: "vitreux", couleurs: "miel, vert (tsavorite), rose, incolore",
    contexte: "Dans les skarns et les marbres, par métamorphisme de calcaires impurs.",
    devient: "→ argiles + calcite ; libère du calcium.",
    note: "Son nom vient du latin grossularia, la groseille à maquereau, en raison de sa variété vert pâle. Sa version vert émeraude, la tsavorite (Kenya, 1967), compte parmi les gemmes vertes les plus prisées, et elle est plus rare que l'émeraude.",
  },
  andradite: {
    nom: "Andradite", formule: "Ca₃Fe₂(SiO₄)₃", famille: "Nésosilicate (grenat : ugrandite)",
    systeme: "cubique", durete: 6.75, densite: 3.86, stabilite: 6, swatch: "#3f5a3a",
    clivage: "aucun", eclat: "vitreux à adamantin", couleurs: "vert (démantoïde), jaune, brun, noir (mélanite)",
    contexte: "Skarns, serpentinites, roches alcalines.",
    devient: "→ argiles + oxydes de fer.",
    note: "Le grenat le plus « dispersif » est le démantoïde, sa variété verte, qui renvoie plus de feu qu'un diamant ; les joailliers russes l'appréciaient sous les tsars. La mélanite, variété noire, orne les roches volcaniques alcalines.",
  },
  uvarovite: {
    nom: "Uvarovite", formule: "Ca₃Cr₂(SiO₄)₃", famille: "Nésosilicate (grenat : ugrandite)",
    systeme: "cubique", durete: 7.5, densite: 3.85, stabilite: 8, swatch: "#1f7a52",
    clivage: "aucun", eclat: "vitreux", couleurs: "vert émeraude intense",
    contexte: "On le rencontre dans les serpentinites et les gisements de chromite (Oural, Finlande).",
    devient: "Très résistante : quasi résiduelle.",
    note: "Toujours vert, d'un vert émeraude franc dû au chrome, c'est le seul grenat dans ce cas. Il forme rarement de gros cristaux : il tapisse la chromite de croûtes de minuscules cristaux étincelants.",
  },
  hydrogrossulaire: {
    nom: "Hydrogrossulaire", formule: "Ca₃Al₂(SiO₄)₃₋ₓ(OH)₄ₓ", famille: "Nésosilicate (grenat hydraté)",
    systeme: "cubique", durete: 6.5, densite: 3.4, stabilite: 5, swatch: "#8fa88a",
    clivage: "aucun", eclat: "vitreux à mat", couleurs: "vert, rose, blanc",
    contexte: "Skarns hydratés, rodingites (serpentinites altérées).",
    devient: "→ argiles + calcite.",
    note: "Des groupements (OH)₄ prennent la place d'une partie des tétraèdres SiO₄ : ce grenat a absorbé de l'eau. Sa variété verte compacte, le « jade du Transvaal », a longtemps été vendue comme du jade.",
  },
  goldmanite: {
    nom: "Goldmanite", formule: "Ca₃V₂(SiO₄)₃", famille: "Nésosilicate (grenat : ugrandite)",
    systeme: "cubique", durete: 7, densite: 3.74, stabilite: 7, swatch: "#5f7a3a",
    clivage: "aucun", eclat: "vitreux", couleurs: "vert olive à brun-vert",
    contexte: "Rare : on la trouve dans les schistes vanadifères et les gisements d'uranium-vanadium.",
    devient: "Résiduelle.",
    note: "La goldmanite, très rare, porte du vanadium là où le grossulaire a de l'aluminium, l'andradite du fer et l'uvarovite du chrome : elle complète ainsi la série des ugrandites.",
  },
  majorite: {
    nom: "Majorite", formule: "Mg₃(MgSi)(SiO₄)₃", famille: "Nésosilicate (grenat de haute pression)",
    systeme: "cubique", durete: 7.5, densite: 3.98, stabilite: 8, swatch: "#6a4a6a",
    clivage: "aucun", eclat: "vitreux", couleurs: "violet, incolore",
    contexte: "Dans les diamants, les météorites choquées et le manteau situé au-delà de 250 km : voilà où on la rencontre.",
    devient: "Instable en surface.",
    note: "Grenat des très grandes profondeurs : le silicium y prend une coordination 6 (au lieu de 4). Seules les météorites choquées et les inclusions piégées dans les diamants l'ont révélé, comme des messagers venus du manteau profond.",
  },

  // ---------- Groupe du zircon (ASiO₄, cation en coordination 8) ----------
  hafnon: {
    nom: "Hafnon", formule: "HfSiO₄", famille: "Nésosilicate (groupe du zircon)",
    systeme: "quadratique", durete: 7.5, densite: 6.97, stabilite: 10, swatch: "#b0a48c",
    clivage: "imparfait", eclat: "adamantin", couleurs: "incolore, brun",
    contexte: "Présent dans les pegmatites rares, où le hafnium accompagne toujours le zirconium.",
    devient: "Rien : inaltérable.",
    note: "Quasi jumeau du zircon, le hafnon voit le hafnium remplacer le zirconium. Ces deux éléments se ressemblent tant qu'il est presque impossible de les séparer, ce qui pose un casse-tête industriel : le zirconium laisse passer les neutrons (gaines de combustible), alors que le hafnium les absorbe (barres de contrôle).",
  },
  thorite: {
    nom: "Thorite", formule: "(Th,U)SiO₄", famille: "Nésosilicate (groupe du zircon)",
    systeme: "quadratique", durete: 4.75, densite: 6.7, stabilite: 6, swatch: "#4a3a2e",
    clivage: "net", eclat: "résineux à mat", couleurs: "noir, brun-orange",
    contexte: "Pegmatites, granites alcalins, sables lourds.",
    devient: "Il devient métamicte : sa propre radioactivité détruit son réseau cristallin.",
    note: "Sa radioactivité désorganise peu à peu le réseau cristallin de l'intérieur, si bien qu'elle devient « métamicte », amorphe et vitreuse. Le thorium qu'elle renferme est aussi étudié comme combustible nucléaire de remplacement.",
  },
  coffinite: {
    nom: "Coffinite", formule: "U(SiO₄)₁₋ₓ(OH)₄ₓ", famille: "Nésosilicate (groupe du zircon)",
    systeme: "quadratique", durete: 5.5, densite: 5.1, stabilite: 3, swatch: "#33302a",
    clivage: "—", eclat: "adamantin à mat", couleurs: "noir, brun foncé",
    contexte: "On la trouve dans les gisements d'uranium formés en milieu réducteur (grès, lignites).",
    devient: "Elle s'oxyde pour donner des minéraux d'uranium jaunes et verts (autunite…).",
    note: "Avec l'uraninite, elle constitue l'un des deux grands minerais d'uranium. Elle naît là où une eau chargée d'uranium rencontre un milieu réducteur, typiquement la matière organique d'un grès ; le Limousin en a fourni.",
  },

  // ================= NÉSOSUBSILICATES (SiO₄ + anions supplémentaires) =================

  // ---------- Silicates d'alumine : les polymorphes Al₂SiO₅ ----------
  mullite: {
    nom: "Mullite", formule: "Al₆Si₂O₁₃", famille: "Nésosubsilicate (silicate d'alumine)",
    systeme: "orthorhombique", durete: 6.5, densite: 3.05, stabilite: 8, swatch: "#d0c4b0",
    clivage: "net", eclat: "vitreux", couleurs: "incolore, blanc, rosé",
    contexte: "Rare dans la nature (île de Mull, Écosse), elle est en revanche omniprésente en céramique.",
    devient: "Stable.",
    note: "Presque absente de la nature, elle compte pourtant parmi les minéraux les plus fabriqués au monde : elle donne sa solidité à la porcelaine, aux briques réfractaires et aux bougies d'allumage. On l'obtient en cuisant la kaolinite au-delà de 1 100 °C.",
  },

  // ---------- Groupe de la topaze / euclase ----------
  euclase: {
    nom: "Euclase", formule: "BeAlSiO₄(OH)", famille: "Nésosubsilicate (groupe de la topaze)",
    systeme: "monoclinique", durete: 7.5, densite: 3.1, stabilite: 8, swatch: "#8fc4d4",
    clivage: "parfait, et fatal", eclat: "vitreux", couleurs: "bleu ciel, vert, incolore",
    contexte: "On la rencontre dans les pegmatites et les fentes alpines, aux côtés du béryl et de la topaze.",
    devient: "Résiduelle.",
    note: "Son clivage est si parfait qu'elle se fend au moindre choc, ce qui explique son nom grec, « qui se brise bien ». Les lapidaires la taillent rarement, bien que sa couleur bleue soit magnifique.",
  },

  // ---------- Groupe de la humite (série Mg, nésosubsilicates) ----------
  chondrodite: {
    nom: "Chondrodite", formule: "Mg₅(SiO₄)₂(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "monoclinique", durete: 6.25, densite: 3.15, stabilite: 3, swatch: "#c98a3a",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "jaune miel, orange, brun-rouge",
    contexte: "On la trouve dans les marbres dolomitiques métamorphisés et dans les skarns riches en fluor.",
    devient: "→ serpentine + brucite.",
    note: "Répartis dans les marbres blancs, ces grains jaune orangé tirent leur nom du grec chondros, « grain ». Ils appartiennent à une série (norbergite, chondrodite, humite, clinohumite) : les mêmes briques s'empilent en proportions variables, à la manière des pièces d'un LEGO.",
  },
  clinohumite: {
    nom: "Clinohumite", formule: "Mg₉(SiO₄)₄(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "monoclinique", durete: 6, densite: 3.2, stabilite: 3, swatch: "#c07a3a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "jaune-orangé à brun",
    contexte: "Marbres dolomitiques, serpentinites ; rare en gemme (Pamir, Tanzanie).",
    devient: "→ serpentine.",
    note: "Dans la série de la humite, c'est le terme le plus riche en silice. Il suscite un vif intérêt chez les géophysiciens : capable de transporter de l'eau (sous forme d'OH) dans le manteau, il pourrait constituer l'un des « réservoirs cachés » de l'eau terrestre profonde.",
  },
  norbergite: {
    nom: "Norbergite", formule: "Mg₃(SiO₄)(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "orthorhombique", durete: 6.25, densite: 3.18, stabilite: 3, swatch: "#d8a45a",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "jaune, orangé, rose",
    contexte: "On la trouve dans les marbres dolomitiques au contact d'intrusions (Norberg, Suède).",
    devient: "→ serpentine + brucite.",
    note: "Le terme le plus pauvre en silice de la série réclame lui aussi du fluor : sa présence dans un marbre trahit des fluides fluorés venus du magma voisin.",
  },

  // ---------- Groupe de la titanite ----------
  malayaite: {
    nom: "Malayaïte", formule: "CaSnSiO₅", famille: "Nésosubsilicate (groupe de la titanite)",
    systeme: "monoclinique", durete: 5.5, densite: 4.55, stabilite: 7, swatch: "#c8bda8",
    clivage: "net", eclat: "vitreux à adamantin", couleurs: "incolore, jaune, brun",
    contexte: "Skarns à étain (Malaisie, Cornouailles).",
    devient: "→ cassitérite résiduelle.",
    note: "Dans la titanite, l'étain prend la place du titane. Minéral-guide des gisements d'étain, il signale, lorsqu'il apparaît dans un skarn, qu'une cassitérite se trouve à proximité.",
  },

  // ---------- Groupe du chloritoïde ----------
  chloritoide: {
    nom: "Chloritoïde", formule: "(Fe,Mg,Mn)₂Al₄Si₂O₁₀(OH)₄", famille: "Nésosubsilicate",
    systeme: "monoclinique", durete: 6.5, densite: 3.6, stabilite: 5, swatch: "#4a5a52",
    clivage: "parfait (en lames cassantes)", eclat: "nacré à vitreux", couleurs: "vert sombre, gris-noir",
    contexte: "On le rencontre dans les schistes et les micaschistes alumineux, de degré de métamorphisme bas à moyen.",
    devient: "→ chlorite puis argiles.",
    note: "Son nom vient de sa ressemblance avec la chlorite, mais il est bien plus dur et cassant : ses lames se brisent sans plier. Minéral-index précieux, il marque un métamorphisme précis, ni trop faible ni trop fort.",
  },
  ottrelite: {
    nom: "Ottrélite", formule: "(Mn,Fe,Mg)₂Al₄Si₂O₁₀(OH)₄", famille: "Nésosubsilicate",
    systeme: "monoclinique", durete: 6.5, densite: 3.55, stabilite: 5, swatch: "#5a5048",
    clivage: "parfait", eclat: "nacré", couleurs: "gris-vert à noir",
    contexte: "On le trouve dans les schistes ardoisiers d'Ottré (Ardennes belges), dont il tire son nom.",
    devient: "→ chlorite + oxydes de manganèse.",
    note: "Ses petites lames noires criblent certaines ardoises ardennaises, où elles dessinent des taches sombres dites « phyllades ottrélitiques » : c'est le chloritoïde riche en manganèse.",
  },

  // ---------- Borosilicates isolés ----------
  datolite: {
    nom: "Datolite", formule: "CaBSiO₄(OH)", famille: "Nésosubsilicate (borosilicate)",
    systeme: "monoclinique", durete: 5.25, densite: 2.96, stabilite: 4, swatch: "#d8dcc8",
    clivage: "aucun", eclat: "vitreux", couleurs: "incolore, vert pâle, jaune",
    contexte: "On la rencontre dans les cavités des basaltes altérés, avec les zéolites, ainsi que dans les fentes alpines.",
    devient: "→ argiles + bore en solution.",
    note: "Des cristaux vitreux vert pâle tapissent les bulles des basaltes. Hors des déserts salés, on rencontre peu de minéraux de bore : ici, le bore a été apporté par les fluides hydrothermaux.",
  },
  gadolinite: {
    nom: "Gadolinite", formule: "(Ce,La,Nd,Y)₂FeBe₂Si₂O₁₀", famille: "Nésosubsilicate (terres rares)",
    systeme: "monoclinique", durete: 6.75, densite: 4.4, stabilite: 6, swatch: "#3a3630",
    clivage: "aucun", eclat: "vitreux à gras", couleurs: "noir, brun-vert",
    contexte: "Pegmatites granitiques (Ytterby, Suède).",
    devient: "Il devient métamicte sous l'effet de la radioactivité, et libère alors les terres rares.",
    note: "Minéral historique, il a livré une foule d'éléments nouveaux lorsqu'on l'a étudié à Ytterby, près de Stockholm. Quatre d'entre eux portent le nom de ce village : yttrium, ytterbium, terbium, erbium. Aucun autre lieu n'a donné son nom à autant d'éléments.",
  },
  dumortierite: {
    nom: "Dumortiérite", formule: "Al₇(BO₃)(SiO₄)₃O₃", famille: "Nésosubsilicate (borosilicate)",
    systeme: "orthorhombique", durete: 7.5, densite: 3.3, stabilite: 8, swatch: "#3f5a9a",
    clivage: "bon", eclat: "vitreux", couleurs: "bleu profond, violet, brun-rose",
    contexte: "Gneiss et pegmatites alumineuses métamorphisées.",
    devient: "Résiduelle : très résistante.",
    note: "Lorsqu'elle est massive, son bleu intense la fait prendre pour du lapis-lazuli. Elle porte le nom du paléontologue français Eugène Dumortier. Très dure, elle résiste à l'érosion et se retrouve dans les sables.",
  },

  // ---------- Compléments : olivines rares ----------
  liebenbergite: {
    nom: "Liebenbergite", formule: "Ni₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 6.25, densite: 4.6, stabilite: 3, swatch: "#5a8a6a",
    clivage: "imparfait", eclat: "vitreux", couleurs: "vert-jaune à vert olive",
    contexte: "Rare : on la trouve dans les gisements de nickel des roches ultrabasiques (Afrique du Sud).",
    devient: "→ garniérite (silicates nickélifères) en s'altérant.",
    note: "Elle complète une série où la forstérite porte le magnésium, la fayalite le fer, la téphroïte le manganèse et la liebenbergite le nickel : même charpente, quatre métaux différents.",
  },
  kirschsteinite: {
    nom: "Kirschsteinite", formule: "CaFeSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 5.5, densite: 3.43, stabilite: 2, swatch: "#7a6a52",
    clivage: "imparfait", eclat: "vitreux", couleurs: "brun-vert, gris",
    contexte: "Laves alcalines (Nyiragongo, Congo) et scories.",
    devient: "→ oxydes de fer + calcite.",
    note: "Elle a été décrite dans les laves du Nyiragongo, l'un des rares volcans au monde à abriter un lac de lave permanent : c'est le pendant ferreux de la monticellite (CaMgSiO₄).",
  },
  glaucochroite: {
    nom: "Glaucochroïte", formule: "CaMnSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 5.5, densite: 3.4, stabilite: 2, swatch: "#8aa89a",
    clivage: "bon", eclat: "vitreux", couleurs: "bleu-vert pâle",
    contexte: "On la trouve au gisement de Franklin (New Jersey), dans les marbres à zinc et manganèse.",
    devient: "→ oxydes de manganèse.",
    note: "Nom tiré du grec glaukos (bleu-vert) et chroa (couleur). Avec la monticellite (Mg) et la kirschsteinite (Fe), la glaucochroïte (Mn) complète le trio des olivines calciques.",
  },
  larsenite: {
    nom: "Larsénite", formule: "PbZnSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 3, densite: 5.9, stabilite: 3, swatch: "#c8c0b0",
    clivage: "bon", eclat: "adamantin", couleurs: "blanc, incolore",
    contexte: "C'est à Franklin (New Jersey) seulement qu'on la rencontre, dans l'une des mines les plus riches du monde en espèces.",
    devient: "Elle se transforme en carbonates de plomb et de zinc.",
    note: "Très dense (5,9) et très tendre (3), cette olivine au plomb provient du gisement de Franklin, qui a livré plus de 350 espèces minérales, dont une trentaine ne se trouvent nulle part ailleurs.",
  },

  // ---------- Compléments : la humite manquante + humites au manganèse ----------
  humite: {
    nom: "Humite", formule: "Mg₇(SiO₄)₃(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "orthorhombique", durete: 6.25, densite: 3.2, stabilite: 3, swatch: "#cc9040",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "jaune miel, orange, brun",
    contexte: "Marbres dolomitiques métamorphisés, skarns (Vésuve, Suède).",
    devient: "→ serpentine + brucite.",
    note: "Dédiée à Abraham Hume, collectionneur anglais, elle donne son nom au groupe. Troisième terme de la série (n = 3) : norbergite (1), chondrodite (2), humite (3), clinohumite (4). Chaque terme ajoute une couche d'olivine à l'empilement.",
  },
  alleghanyite: {
    nom: "Alléghanyite", formule: "Mn₅(SiO₄)₂(OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "monoclinique", durete: 5.5, densite: 4.0, stabilite: 3, swatch: "#a86a5a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "rose, rouge-brun",
    contexte: "Gisements de manganèse métamorphisés.",
    devient: "→ oxydes noirs de manganèse.",
    note: "La chondrodite du manganèse : même architecture, mais avec du manganèse à la place du magnésium, ce qui la teinte de rose. Elle noircit en surface sous une croûte d'oxydes.",
  },

  // ---------- Compléments : grenats rares ----------
  knorringite: {
    nom: "Knorringite", formule: "Mg₃Cr₂(SiO₄)₃", famille: "Nésosilicate (grenat : pyralspite)",
    systeme: "cubique", durete: 7.5, densite: 3.76, stabilite: 8, swatch: "#2f6a4a",
    clivage: "aucun", eclat: "vitreux", couleurs: "vert bleuté",
    contexte: "On la trouve dans les kimberlites et les péridotites du manteau, en compagnie du diamant.",
    devient: "Résiduelle.",
    note: "Dans le manteau profond, ce grenat chromifère sert d'excellent « minéral indicateur » : sa teneur en chrome révèle qu'il provient du domaine de stabilité du diamant.",
  },
  schorlomite: {
    nom: "Schorlomite", formule: "Ca₃(Ti,Fe)₂(Si,Fe)₃O₁₂", famille: "Nésosilicate (grenat : ugrandite)",
    systeme: "cubique", durete: 7.25, densite: 3.81, stabilite: 6, swatch: "#2e2c2a",
    clivage: "aucun", eclat: "vitreux à résineux", couleurs: "noir profond",
    contexte: "Roches magmatiques alcalines (syénites néphéliniques, carbonatites).",
    devient: "Il se transforme en argiles, ainsi qu'en oxydes de fer et de titane.",
    note: "Grenat titanifère d'un noir intense. Il n'apparaît que dans les magmas alcalins pauvres en silice : sa seule présence permet de diagnostiquer la roche.",
  },

  // ---------- Compléments : zircon (polymorphe) & terres rares ----------
  huttonite: {
    nom: "Huttonite", formule: "ThSiO₄ (monoclinique)", famille: "Nésosilicate (groupe du zircon)",
    systeme: "monoclinique", durete: 4.5, densite: 7.1, stabilite: 6, swatch: "#5a4a3a",
    clivage: "net", eclat: "adamantin", couleurs: "incolore, crème",
    contexte: "On la trouve dans les sables de plage néo-zélandais et dans les pegmatites.",
    devient: "Se métamictise (radioactivité).",
    note: "Monoclinique, ce polymorphe de la thorite partage la formule ThSiO₄ sans en partager l'empilement : il adopte la structure de la monazite, quand la thorite prend celle du zircon. La chimie seule ne suffit donc pas à définir un minéral.",
  },
  cerite: {
    nom: "Cérite", formule: "(Ce,La,Ca)₉(Mg,Fe)(SiO₄)₆(SiO₃OH)(OH)₃", famille: "Nésosilicate (terres rares)",
    systeme: "rhomboédrique", durete: 5.5, densite: 4.8, stabilite: 4, swatch: "#8a5a4a",
    clivage: "aucun", eclat: "gras à vitreux", couleurs: "brun-rouge, gris-rose",
    contexte: "On la rencontre dans les skarns et les pegmatites à terres rares (Bastnäs, Suède).",
    devient: "→ argiles + terres rares en solution.",
    note: "On découvrit le cérium en 1803, à Bastnäs (Suède), en analysant ce minéral : Berzelius et Hisinger en tirèrent l'élément le plus abondant des terres rares, présent aujourd'hui dans les pots catalytiques et les pierres à briquet.",
  },
  britholite: {
    nom: "Britholite", formule: "(Ce,Ca)₅(SiO₄,PO₄)₃(OH,F)", famille: "Nésosilicate (terres rares)",
    systeme: "hexagonal", durete: 5.5, densite: 4.4, stabilite: 4, swatch: "#7a6a4a",
    clivage: "imparfait", eclat: "gras", couleurs: "brun, jaune-brun",
    contexte: "Roches alcalines et carbonatites (Groenland, Kola).",
    devient: "Elle devient métamicte et libère les terres rares.",
    note: "Dans cette apatite, des silicates remplacent les phosphates et des terres rares le calcium. Sa structure supporte bien la radioactivité, ce qui en fait une matrice étudiée pour stocker les déchets nucléaires.",
  },

  // ---------- Compléments : borosilicates métamorphiques ----------
  kornerupine: {
    nom: "Kornérupine", formule: "Mg₃Al₆(Si,Al,B)₅O₂₁(OH)", famille: "Nésosubsilicate (borosilicate)",
    systeme: "orthorhombique", durete: 6.75, densite: 3.32, stabilite: 7, swatch: "#5a7a5a",
    clivage: "bon", eclat: "vitreux", couleurs: "vert, brun, incolore : fort pléochroïsme",
    contexte: "On la rencontre dans les gneiss et les granulites alumineuses formés à haute température (Madagascar, Sri Lanka).",
    devient: "Résiduelle.",
    note: "Déroutante, cette gemme rare vire du vert au brun-rouge selon l'angle d'observation (fort pléochroïsme). Elle signale un métamorphisme à très haute température dans des roches riches en bore et en magnésium.",
  },
  grandidierite: {
    nom: "Grandidiérite", formule: "(Mg,Fe)Al₃(BO₃)(SiO₄)O", famille: "Nésosubsilicate (borosilicate)",
    systeme: "orthorhombique", durete: 7.5, densite: 2.99, stabilite: 8, swatch: "#5a9ab0",
    clivage: "parfait", eclat: "vitreux", couleurs: "bleu-vert turquoise",
    contexte: "Pegmatites et granulites boriques (Madagascar surtout).",
    devient: "Résiduelle.",
    note: "Parmi les gemmes les plus rares au monde, elle affiche un bleu-vert turquoise difficile à imiter. Découverte à Madagascar en 1902, elle porte le nom de l'explorateur français Alfred Grandidier ; les pierres taillées de qualité se comptent par centaines.",
  },

  // ---------- Silicates de manganèse ----------
  braunite: {
    nom: "Braunite", formule: "Mn²⁺Mn³⁺₆SiO₁₂", famille: "Nésosubsilicate (manganèse)",
    systeme: "quadratique", durete: 6.25, densite: 4.8, stabilite: 6, swatch: "#3a3438",
    clivage: "parfait", eclat: "submétallique", couleurs: "noir, gris-noir",
    contexte: "Gisements de manganèse métamorphisés.",
    devient: "En surface, elle se transforme en oxydes de manganèse (pyrolusite).",
    note: "Entre l'oxyde et le silicate, la braunite ne compte qu'un silicium pour sept manganèses. Minerai de manganèse important, c'est aussi l'un des rares silicates à éclat métallique.",
  },
});

// ---------- Sous-familles des nésosilicates (arbre affiché sur la page du groupe) ----------
const NESO_SOUS_FAMILLES = [
  {
    nom: "Groupe de la phénacite",
    formule: "A₂SiO₄ : cations en coordination 4",
    note: "Les petits cations (Be²⁺, Zn²⁺, Li⁺) occupent des tétraèdres, comme le silicium : la structure entière ne repose que sur des tétraèdres. Ces minéraux sont rares et souvent fluorescents.",
    mineraux: ["phenacite", "willemite", "eucryptite"],
  },
  {
    nom: "Groupe de l'olivine",
    formule: "A₂SiO₄ : cations en coordination 6",
    note: "Il forme l'essentiel du manteau supérieur, ce qui en fait le groupe le plus abondant de la Terre. Des tétraèdres isolés sont reliés en octaèdres par Mg²⁺ ou Fe²⁺. La série est continue entre la forstérite (Mg) et la fayalite (Fe) : plus la teneur en fer grimpe, plus l'altération s'accélère.",
    mineraux: ["olivine", "forsterite", "fayalite", "tephroite", "liebenbergite",
               "monticellite", "kirschsteinite", "glaucochroite", "larsenite",
               "wadsleyite", "ringwoodite"],
  },
  {
    nom: "Groupe du grenat",
    formule: "A₃B₂(SiO₄)₃ : cubique",
    note: "Selon le cation A, on distingue deux séries : les pyralspites (Mg, Fe, Mn et Al) et les ugrandites (Ca et Al, Fe, Cr, V, Ti). Tous cristallisent dans le système cubique, sont durs et dépourvus de clivage, et se cassent en éclats. Ce sont des minéraux-index majeurs du métamorphisme.",
    mineraux: ["grenat", "pyrope", "almandin", "spessartine", "knorringite",
               "grossulaire", "andradite", "uvarovite", "goldmanite", "schorlomite",
               "hydrogrossulaire", "majorite"],
  },
  {
    nom: "Groupe du zircon",
    formule: "ASiO₄ : cation en coordination 8",
    note: "Entouré de huit oxygènes, un gros cation tétravalent (Zr, Hf, Th, U) fait de ces minéraux des structures extrêmement denses et durables. Mais la radioactivité peut aussi les détruire de l'intérieur (thorite, coffinite).",
    mineraux: ["zircon", "hafnon", "thorite", "huttonite", "coffinite"],
  },
  {
    nom: "Silicates d'alumine : les polymorphes Al₂SiO₅",
    formule: "Al₂SiO₅ : nésosubsilicates",
    note: "Une seule formule, trois minéraux : l'andalousite à basse pression, le disthène à haute pression, la sillimanite à haute température. Lequel se forme permet de lire la pression et la température subies par la roche, ce qui en fait le baromètre-thermomètre favori des métamorphistes.",
    mineraux: ["andalousite", "disthene", "sillimanite", "mullite"],
  },
  {
    nom: "Groupe de la topaze",
    formule: "A₂SiO₄(F,OH)₂ : nésosubsilicates",
    note: "Liés par l'aluminium, des tétraèdres isolés s'accompagnent de fluor et d'OH. Ce fluor vient des vapeurs magmatiques tardives : ces minéraux signalent les greisens, ces granites « cuits » par leurs propres fluides.",
    mineraux: ["topaze", "euclase"],
  },
  {
    nom: "Groupe de la staurotide",
    formule: "(Fe,Mg)₄Al₁₈Si₈O₄₆(OH)₂",
    note: "Ses macles en croix, les « croisettes de Bretagne », ont servi d'amulettes : ce minéral, unique dans son genre, reste célèbre. C'est un minéral-index du métamorphisme moyen.",
    mineraux: ["staurotide"],
  },
  {
    nom: "Groupe de la humite",
    formule: "nMg₂SiO₄ · Mg(F,OH)₂ : série",
    note: "La série des norbergite (n = 1), chondrodite (n = 2), humite (n = 3) et clinohumite (n = 4) est remarquable : les mêmes briques, couches d'olivine et couches de brucite fluorée, s'empilent en proportions croissantes. Toutes exigent du fluor et des marbres dolomitiques ; l'alléghanyite en est la variante manganésifère.",
    mineraux: ["norbergite", "chondrodite", "humite", "clinohumite", "alleghanyite"],
  },
  {
    nom: "Groupe de la titanite",
    formule: "CaTiSiO₅ : nésosubsilicates",
    note: "Dans la titanite, un tétraèdre SiO₄ isolé se combine au calcium, à un métal tétravalent (Ti, Sn) en octaèdre et à un oxygène libre. Presque universelle dans les granites et les gneiss, elle assure la principale source de titane des sols.",
    mineraux: ["titanite", "malayaite"],
  },
  {
    nom: "Groupe du chloritoïde",
    formule: "(Fe,Mg,Mn)₂Al₄Si₂O₁₀(OH)₄",
    note: "Il évoque la chlorite, mais il est dur et cassant. Minéral-index des schistes alumineux de bas degré.",
    mineraux: ["chloritoide", "ottrelite"],
  },
  {
    nom: "Borosilicates",
    formule: "SiO₄ + groupements BO₃",
    note: "Le bore, élément léger et incompatible, se concentre dans les fluides tardifs ; c'est pourquoi ces minéraux, formés de tétraèdres SiO₄ isolés et de groupements borate, marquent les pegmatites et les métamorphismes de haute température.",
    mineraux: ["datolite", "dumortierite", "kornerupine", "grandidierite"],
  },
  {
    nom: "Silicates de terres rares",
    formule: "SiO₄ + Ce, La, Y, Th…",
    note: "Des terres rares lient des tétraèdres isolés. Peu fréquents, ces minéraux sont pourtant décisifs : c'est en les analysant qu'on a découvert la moitié des lanthanides. Souvent métamictes, ils sont détruits de l'intérieur par leur radioactivité.",
    mineraux: ["gadolinite", "cerite", "britholite"],
  },
  {
    nom: "Silicates de manganèse",
    formule: "SiO₄ + Mn",
    note: "Entre l'oxyde et le silicate, la braunite ne compte qu'un silicium pour sept manganèses.",
    mineraux: ["braunite"],
  },
];

// On accroche les sous-familles au groupe « Nésosilicates » de la classe IX (Silicates)
(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const neso = silicates.groupes.find((g) => g.nom.startsWith("Nésosilicates"));
  neso.sousGroupes = NESO_SOUS_FAMILLES;
  // la liste plate sert aux compteurs et à la vue d'ensemble
  neso.mineraux = NESO_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
  neso.note = "Aucun oxygène n'est partagé entre les tétraèdres SiO₄, qui restent isolés : c'est la cohésion des cations (Mg, Fe, Ca, Al, Zr…) qui tient l'ensemble. Compacts et denses, ces minéraux doivent leur solidité au seul cation ; l'olivine cède en premier à l'altération, le zircon demeure presque inaltérable. Une centaine d'espèces, environ 120, se répartissent en une douzaine de sous-familles.";
})();
