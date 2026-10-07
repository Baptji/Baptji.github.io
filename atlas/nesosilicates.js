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
    contexte: "Pegmatites granitiques et fentes alpines, associée au béryl.",
    devient: "Résiduelle — très résistante.",
    note: "Son nom vient du grec phenax, « trompeur » : incolore et dure, on la confondait avec le quartz. C'est pourtant un minéral de béryllium, rare et recherché des collectionneurs.",
  },
  willemite: {
    nom: "Willémite", formule: "Zn₂SiO₄", famille: "Nésosilicate (groupe de la phénacite)",
    systeme: "rhomboédrique", durete: 5.5, densite: 4.05, stabilite: 5, swatch: "#8fae6a",
    clivage: "bon", eclat: "vitreux à résineux", couleurs: "vert, jaune, brun — vert vif en UV",
    contexte: "Gisements de zinc métamorphisés, surtout Franklin (New Jersey).",
    devient: "→ smithsonite et hémimorphite (zone d'oxydation).",
    note: "Un des minéraux fluorescents les plus connus : sous lampe UV, elle s'embrase d'un vert éclatant (à cause de traces de manganèse). Nommée en l'honneur du roi Guillaume Iᵉʳ des Pays-Bas.",
  },
  eucryptite: {
    nom: "Eucryptite", formule: "LiAlSiO₄", famille: "Nésosilicate (groupe de la phénacite)",
    systeme: "rhomboédrique", durete: 6.5, densite: 2.67, stabilite: 5, swatch: "#ded6cc",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, blanc, rosé",
    contexte: "Pegmatites à lithium, où elle remplace le spodumène.",
    devient: "→ argiles + Li⁺ en solution.",
    note: "Minerai secondaire de lithium. Sa curiosité : chauffée, elle se contracte au lieu de se dilater — cette « dilatation négative » sert à fabriquer des céramiques qui ne bougent pas avec la température (plaques de cuisson vitrocéramiques).",
  },

  // ---------- Groupe de l'olivine (A₂SiO₄, cations en coordination 6) ----------
  forsterite: {
    nom: "Forstérite", formule: "Mg₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 7, densite: 3.27, stabilite: 2, swatch: "#9fb85f",
    clivage: "imparfait", eclat: "vitreux", couleurs: "vert olive, jaune-vert",
    contexte: "Pôle magnésien de l'olivine : péridotites du manteau, marbres dolomitiques.",
    devient: "→ serpentine (hydratation) ou smectites + oxydes de fer (altération).",
    note: "Le pôle pur en magnésium de la série de l'olivine. C'est le minéral le plus abondant du manteau terrestre supérieur — donc, en volume, l'un des plus abondants de la planète, même si on ne le voit presque jamais en surface.",
  },
  fayalite: {
    nom: "Fayalite", formule: "Fe₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 6.5, densite: 4.39, stabilite: 1, swatch: "#6b5a3a",
    clivage: "imparfait", eclat: "vitreux à résineux", couleurs: "brun-vert, brun-noir",
    contexte: "Pôle ferreux : roches volcaniques riches en fer, granites alcalins, scories.",
    devient: "→ oxydes de fer (goethite, hématite) + silice, très vite.",
    note: "Le pôle pur en fer. Beaucoup plus dense et bien plus fragile que la forstérite : le fer s'oxyde à l'air, et la fayalite rouille littéralement. Elle abonde dans les scories métallurgiques anciennes — les archéologues s'en servent pour repérer les sites de forge.",
  },
  tephroite: {
    nom: "Téphroïte", formule: "Mn₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 6, densite: 4.1, stabilite: 2, swatch: "#8a6a68",
    clivage: "bon", eclat: "vitreux à résineux", couleurs: "gris cendré, rouge-brun",
    contexte: "Gisements de manganèse métamorphisés (Franklin, Långban).",
    devient: "→ oxydes noirs de manganèse.",
    note: "L'olivine du manganèse — son nom vient du grec tephra, « cendre », pour sa couleur grise. Elle noircit en surface en se couvrant d'oxydes de Mn.",
  },
  monticellite: {
    nom: "Monticellite", formule: "CaMgSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 5.5, densite: 3.05, stabilite: 2, swatch: "#c8c2b0",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, gris, vert pâle",
    contexte: "Marbres et skarns : contact entre un magma et une dolomie.",
    devient: "→ serpentine + calcite.",
    note: "L'olivine calcique, née de la cuisson d'une dolomie au contact d'une intrusion. Sa présence signe une température élevée et une roche de départ magnésienne et carbonatée.",
  },
  ringwoodite: {
    nom: "Ringwoodite", formule: "Mg₂SiO₄ (structure spinelle)", famille: "Nésosilicate (polymorphe de l'olivine)",
    systeme: "cubique", durete: 7.5, densite: 3.9, stabilite: 8, swatch: "#4a6fa0",
    clivage: "aucun", eclat: "vitreux", couleurs: "bleu profond, violet",
    contexte: "Manteau profond (525–660 km) ; météorites choquées ; une inclusion dans un diamant brésilien.",
    devient: "Se retransforme en olivine en remontant (elle n'existe pas en surface).",
    note: "L'olivine comprimée : sous très haute pression, elle se réorganise en structure spinelle, plus compacte. Découverte majeure de 2014 : une ringwoodite piégée dans un diamant brésilien contenait 1,5 % d'eau — preuve qu'il existe, à 500 km sous nos pieds, un réservoir d'eau potentiellement plus vaste que tous les océans réunis.",
  },
  wadsleyite: {
    nom: "Wadsleyite", formule: "β-Mg₂SiO₄", famille: "Nésosilicate (polymorphe de l'olivine)",
    systeme: "orthorhombique", durete: 7, densite: 3.84, stabilite: 8, swatch: "#5a7a9a",
    clivage: "—", eclat: "vitreux", couleurs: "bleu-vert (en laboratoire)",
    contexte: "Zone de transition du manteau (410–525 km) ; météorites.",
    devient: "Instable en surface : redevient olivine.",
    note: "La forme intermédiaire entre l'olivine et la ringwoodite. Le passage olivine → wadsleyite, à 410 km de profondeur, provoque un saut brutal de densité que les ondes sismiques détectent : c'est la « discontinuité des 410 km », une frontière invisible mais bien réelle sous nos pieds.",
  },

  // ---------- Groupe du grenat (A₃B₂(SiO₄)₃, cubique) ----------
  pyrope: {
    nom: "Pyrope", formule: "Mg₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat — pyralspite)",
    systeme: "cubique", durete: 7.25, densite: 3.58, stabilite: 7, swatch: "#9c2b32",
    clivage: "aucun (cassure conchoïdale)", eclat: "vitreux", couleurs: "rouge sang à rouge violacé",
    contexte: "Péridotites et kimberlites (compagnon du diamant), éclogites.",
    devient: "Résiduel (sables), puis lentement argiles + oxydes.",
    note: "Du grec pyropos, « à l'aspect de feu ». Le grenat des grandes profondeurs : les prospecteurs de diamants suivent les pyropes dans les rivières, car ils viennent des mêmes kimberlites — c'est un « minéral indicateur ».",
  },
  almandin: {
    nom: "Almandin", formule: "Fe₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat — pyralspite)",
    systeme: "cubique", durete: 7.5, densite: 4.32, stabilite: 7, swatch: "#7d3040",
    clivage: "aucun", eclat: "vitreux", couleurs: "rouge sombre, brun-rouge",
    contexte: "Micaschistes et gneiss : LE grenat du métamorphisme régional.",
    devient: "Résiduel — sables à grenats ; puis oxydes de fer + argiles.",
    note: "Le grenat le plus commun, celui qu'on voit en cristaux rouge sombre dans les micaschistes. Assez dur et dense pour former des placers : certaines plages bretonnes ont un sable rose grenat. Il sert d'abrasif (papier de verre, découpe au jet d'eau).",
  },
  spessartine: {
    nom: "Spessartine", formule: "Mn₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat — pyralspite)",
    systeme: "cubique", durete: 7.25, densite: 4.19, stabilite: 7, swatch: "#d4682a",
    clivage: "aucun", eclat: "vitreux", couleurs: "orange à rouge-orangé (« grenat mandarine »)",
    contexte: "Pegmatites granitiques et gisements de manganèse métamorphisés.",
    devient: "Résiduelle ; libère lentement du manganèse.",
    note: "Le grenat au manganèse, d'un orange spectaculaire quand il est limpide — les gemmologues l'appellent « grenat mandarine ». Nommée d'après le Spessart, en Bavière.",
  },
  grossulaire: {
    nom: "Grossulaire", formule: "Ca₃Al₂(SiO₄)₃", famille: "Nésosilicate (grenat — ugrandite)",
    systeme: "cubique", durete: 7, densite: 3.59, stabilite: 6, swatch: "#a8a05a",
    clivage: "aucun", eclat: "vitreux", couleurs: "miel, vert (tsavorite), rose, incolore",
    contexte: "Skarns et marbres : métamorphisme de calcaires impurs.",
    devient: "→ argiles + calcite ; libère du calcium.",
    note: "Son nom vient de grossularia, la groseille à maquereau, pour sa variété vert pâle. Sa version vert émeraude, la tsavorite (Kenya, 1967), est l'une des gemmes vertes les plus prisées — plus rare que l'émeraude.",
  },
  andradite: {
    nom: "Andradite", formule: "Ca₃Fe₂(SiO₄)₃", famille: "Nésosilicate (grenat — ugrandite)",
    systeme: "cubique", durete: 6.75, densite: 3.86, stabilite: 6, swatch: "#3f5a3a",
    clivage: "aucun", eclat: "vitreux à adamantin", couleurs: "vert (démantoïde), jaune, brun, noir (mélanite)",
    contexte: "Skarns, serpentinites, roches alcalines.",
    devient: "→ argiles + oxydes de fer.",
    note: "Le grenat le plus « dispersif » : sa variété verte, le démantoïde, jette plus de feu qu'un diamant — les joailliers russes en raffolaient sous les tsars. Sa variété noire, la mélanite, orne les roches volcaniques alcalines.",
  },
  uvarovite: {
    nom: "Uvarovite", formule: "Ca₃Cr₂(SiO₄)₃", famille: "Nésosilicate (grenat — ugrandite)",
    systeme: "cubique", durete: 7.5, densite: 3.85, stabilite: 8, swatch: "#1f7a52",
    clivage: "aucun", eclat: "vitreux", couleurs: "vert émeraude intense",
    contexte: "Serpentinites et gisements de chromite (Oural, Finlande).",
    devient: "Très résistante — quasi résiduelle.",
    note: "Le seul grenat toujours vert, et d'un vert émeraude franc dû au chrome. Il ne forme presque jamais de gros cristaux : on le trouve en croûtes de minuscules cristaux étincelants sur la chromite.",
  },
  hydrogrossulaire: {
    nom: "Hydrogrossulaire", formule: "Ca₃Al₂(SiO₄)₃₋ₓ(OH)₄ₓ", famille: "Nésosilicate (grenat hydraté)",
    systeme: "cubique", durete: 6.5, densite: 3.4, stabilite: 5, swatch: "#8fa88a",
    clivage: "aucun", eclat: "vitreux à mat", couleurs: "vert, rose, blanc",
    contexte: "Skarns hydratés, rodingites (serpentinites altérées).",
    devient: "→ argiles + calcite.",
    note: "Un grenat où des groupements (OH)₄ remplacent une partie des tétraèdres SiO₄ : c'est un grenat qui a bu. Sa variété verte compacte, le « jade du Transvaal », a longtemps été vendue comme du jade.",
  },
  goldmanite: {
    nom: "Goldmanite", formule: "Ca₃V₂(SiO₄)₃", famille: "Nésosilicate (grenat — ugrandite)",
    systeme: "cubique", durete: 7, densite: 3.74, stabilite: 7, swatch: "#5f7a3a",
    clivage: "aucun", eclat: "vitreux", couleurs: "vert olive à brun-vert",
    contexte: "Rare : schistes vanadifères et gisements d'uranium-vanadium.",
    devient: "Résiduelle.",
    note: "Le grenat au vanadium, très rare. Il complète la série des ugrandites : là où le grossulaire a de l'aluminium, l'andradite du fer et l'uvarovite du chrome, la goldmanite a du vanadium.",
  },
  majorite: {
    nom: "Majorite", formule: "Mg₃(MgSi)(SiO₄)₃", famille: "Nésosilicate (grenat de haute pression)",
    systeme: "cubique", durete: 7.5, densite: 3.98, stabilite: 8, swatch: "#6a4a6a",
    clivage: "aucun", eclat: "vitreux", couleurs: "violet, incolore",
    contexte: "Manteau profond (> 250 km) ; météorites choquées ; inclusions dans les diamants.",
    devient: "Instable en surface.",
    note: "Un grenat des très grandes profondeurs, où même le silicium se retrouve en coordination 6 (au lieu de 4). On ne le connaît que par les météorites choquées et les inclusions piégées dans les diamants — des messagers du manteau profond.",
  },

  // ---------- Groupe du zircon (ASiO₄, cation en coordination 8) ----------
  hafnon: {
    nom: "Hafnon", formule: "HfSiO₄", famille: "Nésosilicate (groupe du zircon)",
    systeme: "quadratique", durete: 7.5, densite: 6.97, stabilite: 10, swatch: "#b0a48c",
    clivage: "imparfait", eclat: "adamantin", couleurs: "incolore, brun",
    contexte: "Pegmatites rares ; le hafnium accompagne toujours le zirconium.",
    devient: "Rien — inaltérable.",
    note: "Le jumeau du zircon où le hafnium remplace le zirconium. Ces deux éléments sont chimiquement si semblables qu'ils sont presque impossibles à séparer — un casse-tête industriel, car le zirconium est transparent aux neutrons (gaines de combustible nucléaire) alors que le hafnium les absorbe (barres de contrôle).",
  },
  thorite: {
    nom: "Thorite", formule: "(Th,U)SiO₄", famille: "Nésosilicate (groupe du zircon)",
    systeme: "quadratique", durete: 4.75, densite: 6.7, stabilite: 6, swatch: "#4a3a2e",
    clivage: "net", eclat: "résineux à mat", couleurs: "noir, brun-orange",
    contexte: "Pegmatites, granites alcalins, sables lourds.",
    devient: "Se métamictise (son réseau est détruit par sa propre radioactivité).",
    note: "Radioactive : le thorium qu'elle contient détruit peu à peu son propre réseau cristallin de l'intérieur — on dit qu'elle devient « métamicte », amorphe et vitreuse. Le thorium est étudié comme combustible nucléaire alternatif.",
  },
  coffinite: {
    nom: "Coffinite", formule: "U(SiO₄)₁₋ₓ(OH)₄ₓ", famille: "Nésosilicate (groupe du zircon)",
    systeme: "quadratique", durete: 5.5, densite: 5.1, stabilite: 3, swatch: "#33302a",
    clivage: "—", eclat: "adamantin à mat", couleurs: "noir, brun foncé",
    contexte: "Gisements d'uranium en milieu réducteur (grès, lignites).",
    devient: "S'oxyde en minéraux d'uranium jaunes et verts (autunite…).",
    note: "L'un des deux grands minerais d'uranium (avec l'uraninite). Elle se forme là où une eau chargée d'uranium rencontre un milieu réducteur — de la matière organique dans un grès, typiquement. Le Limousin en a livré.",
  },

  // ================= NÉSOSUBSILICATES (SiO₄ + anions supplémentaires) =================

  // ---------- Silicates d'alumine : les polymorphes Al₂SiO₅ ----------
  mullite: {
    nom: "Mullite", formule: "Al₆Si₂O₁₃", famille: "Nésosubsilicate (silicate d'alumine)",
    systeme: "orthorhombique", durete: 6.5, densite: 3.05, stabilite: 8, swatch: "#d0c4b0",
    clivage: "net", eclat: "vitreux", couleurs: "incolore, blanc, rosé",
    contexte: "Très rare dans la nature (île de Mull, Écosse) — mais omniprésente en céramique.",
    devient: "Stable.",
    note: "Rarissime dans la nature, et pourtant l'un des minéraux les plus fabriqués au monde : c'est la phase qui donne leur solidité à la porcelaine, aux briques réfractaires et aux bougies d'allumage. Elle naît quand on cuit de la kaolinite au-delà de 1 100 °C.",
  },

  // ---------- Groupe de la topaze / euclase ----------
  euclase: {
    nom: "Euclase", formule: "BeAlSiO₄(OH)", famille: "Nésosubsilicate (groupe de la topaze)",
    systeme: "monoclinique", durete: 7.5, densite: 3.1, stabilite: 8, swatch: "#8fc4d4",
    clivage: "parfait — et fatal", eclat: "vitreux", couleurs: "bleu ciel, vert, incolore",
    contexte: "Pegmatites et fentes alpines, associée au béryl et à la topaze.",
    devient: "Résiduelle.",
    note: "Son nom dit tout : du grec eu-klasis, « qui se brise bien ». Son clivage est si parfait qu'elle se fend au moindre choc — cauchemar des lapidaires, qui la taillent rarement malgré sa magnifique couleur bleue.",
  },

  // ---------- Groupe de la humite (série Mg, nésosubsilicates) ----------
  chondrodite: {
    nom: "Chondrodite", formule: "Mg₅(SiO₄)₂(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "monoclinique", durete: 6.25, densite: 3.15, stabilite: 3, swatch: "#c98a3a",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "jaune miel, orange, brun-rouge",
    contexte: "Marbres dolomitiques métamorphisés, skarns riches en fluor.",
    devient: "→ serpentine + brucite.",
    note: "Grains jaune-orangé semés dans les marbres blancs — du grec chondros, « grain ». Elle appartient à une série (norbergite, chondrodite, humite, clinohumite) où les mêmes briques s'empilent en proportions variables : de la minéralogie en LEGO.",
  },
  clinohumite: {
    nom: "Clinohumite", formule: "Mg₉(SiO₄)₄(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "monoclinique", durete: 6, densite: 3.2, stabilite: 3, swatch: "#c07a3a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "jaune-orangé à brun",
    contexte: "Marbres dolomitiques, serpentinites ; rare en gemme (Pamir, Tanzanie).",
    devient: "→ serpentine.",
    note: "Le terme le plus riche en silice de la série de la humite. Elle intéresse beaucoup les géophysiciens : elle peut transporter de l'eau (sous forme d'OH) dans le manteau, et pourrait être l'un des « réservoirs cachés » de l'eau terrestre profonde.",
  },
  norbergite: {
    nom: "Norbergite", formule: "Mg₃(SiO₄)(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "orthorhombique", durete: 6.25, densite: 3.18, stabilite: 3, swatch: "#d8a45a",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "jaune, orangé, rose",
    contexte: "Marbres dolomitiques au contact d'intrusions (Norberg, Suède).",
    devient: "→ serpentine + brucite.",
    note: "Le terme le plus pauvre en silice de la série. Comme ses sœurs, elle exige du fluor : sa présence dans un marbre signale le passage de fluides fluorés venus du magma voisin.",
  },

  // ---------- Groupe de la titanite ----------
  malayaite: {
    nom: "Malayaïte", formule: "CaSnSiO₅", famille: "Nésosubsilicate (groupe de la titanite)",
    systeme: "monoclinique", durete: 5.5, densite: 4.55, stabilite: 7, swatch: "#c8bda8",
    clivage: "net", eclat: "vitreux à adamantin", couleurs: "incolore, jaune, brun",
    contexte: "Skarns à étain (Malaisie, Cornouailles).",
    devient: "→ cassitérite résiduelle.",
    note: "La titanite où l'étain remplace le titane. C'est un minéral-guide des gisements d'étain : là où elle apparaît dans un skarn, la cassitérite n'est pas loin.",
  },

  // ---------- Groupe du chloritoïde ----------
  chloritoide: {
    nom: "Chloritoïde", formule: "(Fe,Mg,Mn)₂Al₄Si₂O₁₀(OH)₄", famille: "Nésosubsilicate",
    systeme: "monoclinique", durete: 6.5, densite: 3.6, stabilite: 5, swatch: "#4a5a52",
    clivage: "parfait (en lames cassantes)", eclat: "nacré à vitreux", couleurs: "vert sombre, gris-noir",
    contexte: "Schistes et micaschistes alumineux de bas à moyen degré.",
    devient: "→ chlorite puis argiles.",
    note: "Il ressemble à s'y méprendre à la chlorite (d'où son nom), mais il est bien plus dur et cassant : ses lames se brisent au lieu de plier. C'est un minéral-index précieux — il marque un métamorphisme précis, ni trop faible ni trop fort.",
  },
  ottrelite: {
    nom: "Ottrélite", formule: "(Mn,Fe,Mg)₂Al₄Si₂O₁₀(OH)₄", famille: "Nésosubsilicate",
    systeme: "monoclinique", durete: 6.5, densite: 3.55, stabilite: 5, swatch: "#5a5048",
    clivage: "parfait", eclat: "nacré", couleurs: "gris-vert à noir",
    contexte: "Schistes ardoisiers (Ottré, Ardennes belges — d'où son nom).",
    devient: "→ chlorite + oxydes de manganèse.",
    note: "Le chloritoïde au manganèse. Ses petites lames noires criblent certaines ardoises ardennaises, où elles forment des taches sombres appelées « phyllades ottrélitiques ».",
  },

  // ---------- Borosilicates isolés ----------
  datolite: {
    nom: "Datolite", formule: "CaBSiO₄(OH)", famille: "Nésosubsilicate (borosilicate)",
    systeme: "monoclinique", durete: 5.25, densite: 2.96, stabilite: 4, swatch: "#d8dcc8",
    clivage: "aucun", eclat: "vitreux", couleurs: "incolore, vert pâle, jaune",
    contexte: "Cavités des basaltes altérés, avec les zéolites ; fentes alpines.",
    devient: "→ argiles + bore en solution.",
    note: "Cristaux vitreux vert pâle tapissant les bulles des basaltes. C'est l'un des rares minéraux de bore qu'on rencontre hors des déserts salés — le bore y a été apporté par les fluides hydrothermaux.",
  },
  gadolinite: {
    nom: "Gadolinite", formule: "(Ce,La,Nd,Y)₂FeBe₂Si₂O₁₀", famille: "Nésosubsilicate (terres rares)",
    systeme: "monoclinique", durete: 6.75, densite: 4.4, stabilite: 6, swatch: "#3a3630",
    clivage: "aucun", eclat: "vitreux à gras", couleurs: "noir, brun-vert",
    contexte: "Pegmatites granitiques (Ytterby, Suède).",
    devient: "Se métamictise (radioactivité) ; libère les terres rares.",
    note: "Minéral historique : c'est en l'étudiant, à Ytterby près de Stockholm, qu'on a découvert une pluie d'éléments nouveaux. Quatre d'entre eux portent le nom de ce village — yttrium, ytterbium, terbium, erbium. Aucun autre lieu n'a donné son nom à autant d'éléments.",
  },
  dumortierite: {
    nom: "Dumortiérite", formule: "Al₇(BO₃)(SiO₄)₃O₃", famille: "Nésosubsilicate (borosilicate)",
    systeme: "orthorhombique", durete: 7.5, densite: 3.3, stabilite: 8, swatch: "#3f5a9a",
    clivage: "bon", eclat: "vitreux", couleurs: "bleu profond, violet, brun-rose",
    contexte: "Gneiss et pegmatites alumineuses métamorphisées.",
    devient: "Résiduelle — très résistante.",
    note: "Un bleu intense qui la fait confondre avec le lapis-lazuli quand elle est massive. Nommée d'après le paléontologue français Eugène Dumortier. Très dure, elle survit à l'érosion et se retrouve dans les sables.",
  },

  // ---------- Compléments : olivines rares ----------
  liebenbergite: {
    nom: "Liebenbergite", formule: "Ni₂SiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 6.25, densite: 4.6, stabilite: 3, swatch: "#5a8a6a",
    clivage: "imparfait", eclat: "vitreux", couleurs: "vert-jaune à vert olive",
    contexte: "Rare : gisements de nickel dans les roches ultrabasiques (Afrique du Sud).",
    devient: "→ garniérite (silicates nickélifères) en s'altérant.",
    note: "L'olivine du nickel. Elle complète la série : forstérite (Mg), fayalite (Fe), téphroïte (Mn), liebenbergite (Ni) — même charpente, quatre métaux différents.",
  },
  kirschsteinite: {
    nom: "Kirschsteinite", formule: "CaFeSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 5.5, densite: 3.43, stabilite: 2, swatch: "#7a6a52",
    clivage: "imparfait", eclat: "vitreux", couleurs: "brun-vert, gris",
    contexte: "Laves alcalines (Nyiragongo, Congo) et scories.",
    devient: "→ oxydes de fer + calcite.",
    note: "Le pendant ferreux de la monticellite (CaMgSiO₄). Décrite dans les laves du volcan Nyiragongo, l'un des rares volcans au monde à abriter un lac de lave permanent.",
  },
  glaucochroite: {
    nom: "Glaucochroïte", formule: "CaMnSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 5.5, densite: 3.4, stabilite: 2, swatch: "#8aa89a",
    clivage: "bon", eclat: "vitreux", couleurs: "bleu-vert pâle",
    contexte: "Gisement de Franklin (New Jersey), dans les marbres à zinc-manganèse.",
    devient: "→ oxydes de manganèse.",
    note: "Du grec glaukos (bleu-vert) et chroa (couleur). Complète le trio des olivines calciques : monticellite (Mg), kirschsteinite (Fe), glaucochroïte (Mn).",
  },
  larsenite: {
    nom: "Larsénite", formule: "PbZnSiO₄", famille: "Nésosilicate (groupe de l'olivine)",
    systeme: "orthorhombique", durete: 3, densite: 5.9, stabilite: 3, swatch: "#c8c0b0",
    clivage: "bon", eclat: "adamantin", couleurs: "blanc, incolore",
    contexte: "Uniquement Franklin (New Jersey) — une des mines les plus riches du monde en espèces.",
    devient: "→ carbonates de plomb et de zinc.",
    note: "Une olivine au plomb : très dense (5,9) et très tendre (3). Le gisement de Franklin, à lui seul, a livré plus de 350 espèces minérales dont une trentaine n'existent nulle part ailleurs.",
  },

  // ---------- Compléments : la humite manquante + humites au manganèse ----------
  humite: {
    nom: "Humite", formule: "Mg₇(SiO₄)₃(F,OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "orthorhombique", durete: 6.25, densite: 3.2, stabilite: 3, swatch: "#cc9040",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "jaune miel, orange, brun",
    contexte: "Marbres dolomitiques métamorphisés, skarns (Vésuve, Suède).",
    devient: "→ serpentine + brucite.",
    note: "L'espèce qui donne son nom au groupe — nommée d'après Abraham Hume, collectionneur anglais. C'est le troisième terme de la série (n = 3) : norbergite (1), chondrodite (2), humite (3), clinohumite (4). Chaque terme ajoute une couche d'olivine à l'empilement.",
  },
  alleghanyite: {
    nom: "Alléghanyite", formule: "Mn₅(SiO₄)₂(OH)₂", famille: "Nésosubsilicate (groupe de la humite)",
    systeme: "monoclinique", durete: 5.5, densite: 4.0, stabilite: 3, swatch: "#a86a5a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "rose, rouge-brun",
    contexte: "Gisements de manganèse métamorphisés.",
    devient: "→ oxydes noirs de manganèse.",
    note: "La chondrodite du manganèse : même architecture, mais le magnésium est remplacé par du manganèse, qui la teinte de rose. Elle noircit en surface sous une croûte d'oxydes.",
  },

  // ---------- Compléments : grenats rares ----------
  knorringite: {
    nom: "Knorringite", formule: "Mg₃Cr₂(SiO₄)₃", famille: "Nésosilicate (grenat — pyralspite)",
    systeme: "cubique", durete: 7.5, densite: 3.76, stabilite: 8, swatch: "#2f6a4a",
    clivage: "aucun", eclat: "vitreux", couleurs: "vert bleuté",
    contexte: "Kimberlites et péridotites du manteau — compagnon du diamant.",
    devient: "Résiduelle.",
    note: "Le grenat chromifère du manteau profond. C'est l'un des meilleurs « minéraux indicateurs » de la prospection diamantifère : sa composition en chrome trahit qu'il vient du domaine de stabilité du diamant.",
  },
  schorlomite: {
    nom: "Schorlomite", formule: "Ca₃(Ti,Fe)₂(Si,Fe)₃O₁₂", famille: "Nésosilicate (grenat — ugrandite)",
    systeme: "cubique", durete: 7.25, densite: 3.81, stabilite: 6, swatch: "#2e2c2a",
    clivage: "aucun", eclat: "vitreux à résineux", couleurs: "noir profond",
    contexte: "Roches magmatiques alcalines (syénites néphéliniques, carbonatites).",
    devient: "→ argiles + oxydes de fer et de titane.",
    note: "Le grenat titanifère, d'un noir intense. Il n'apparaît que dans les magmas alcalins pauvres en silice — sa présence dans une roche est un diagnostic à elle seule.",
  },

  // ---------- Compléments : zircon (polymorphe) & terres rares ----------
  huttonite: {
    nom: "Huttonite", formule: "ThSiO₄ (monoclinique)", famille: "Nésosilicate (groupe du zircon)",
    systeme: "monoclinique", durete: 4.5, densite: 7.1, stabilite: 6, swatch: "#5a4a3a",
    clivage: "net", eclat: "adamantin", couleurs: "incolore, crème",
    contexte: "Sables de plage néo-zélandais, pegmatites.",
    devient: "Se métamictise (radioactivité).",
    note: "Le polymorphe monoclinique de la thorite : même formule ThSiO₄, empilement différent. Elle adopte la structure de la monazite, alors que la thorite adopte celle du zircon — un bel exemple de la façon dont la chimie seule ne suffit pas à définir un minéral.",
  },
  cerite: {
    nom: "Cérite", formule: "(Ce,La,Ca)₉(Mg,Fe)(SiO₄)₆(SiO₃OH)(OH)₃", famille: "Nésosilicate (terres rares)",
    systeme: "rhomboédrique", durete: 5.5, densite: 4.8, stabilite: 4, swatch: "#8a5a4a",
    clivage: "aucun", eclat: "gras à vitreux", couleurs: "brun-rouge, gris-rose",
    contexte: "Skarns et pegmatites à terres rares (Bastnäs, Suède).",
    devient: "→ argiles + terres rares en solution.",
    note: "Minéral historique : c'est en l'analysant, en 1803, que Berzelius et Hisinger ont découvert le cérium — l'élément le plus abondant des terres rares, aujourd'hui présent dans les pots catalytiques et les pierres à briquet.",
  },
  britholite: {
    nom: "Britholite", formule: "(Ce,Ca)₅(SiO₄,PO₄)₃(OH,F)", famille: "Nésosilicate (terres rares)",
    systeme: "hexagonal", durete: 5.5, densite: 4.4, stabilite: 4, swatch: "#7a6a4a",
    clivage: "imparfait", eclat: "gras", couleurs: "brun, jaune-brun",
    contexte: "Roches alcalines et carbonatites (Groenland, Kola).",
    devient: "Se métamictise ; libère les terres rares.",
    note: "Une apatite dont les phosphates sont remplacés par des silicates et le calcium par des terres rares. Étudiée comme matrice possible pour le stockage des déchets nucléaires : sa structure encaisse bien la radioactivité.",
  },

  // ---------- Compléments : borosilicates métamorphiques ----------
  kornerupine: {
    nom: "Kornérupine", formule: "Mg₃Al₆(Si,Al,B)₅O₂₁(OH)", famille: "Nésosubsilicate (borosilicate)",
    systeme: "orthorhombique", durete: 6.75, densite: 3.32, stabilite: 7, swatch: "#5a7a5a",
    clivage: "bon", eclat: "vitreux", couleurs: "vert, brun, incolore — fort pléochroïsme",
    contexte: "Gneiss et granulites alumineuses de haute température (Madagascar, Sri Lanka).",
    devient: "Résiduelle.",
    note: "Gemme rare et déroutante : selon l'angle sous lequel on la regarde, elle passe du vert au brun-rouge (fort pléochroïsme). Elle signale un métamorphisme de très haute température dans des roches riches en bore et en magnésium.",
  },
  grandidierite: {
    nom: "Grandidiérite", formule: "(Mg,Fe)Al₃(BO₃)(SiO₄)O", famille: "Nésosubsilicate (borosilicate)",
    systeme: "orthorhombique", durete: 7.5, densite: 2.99, stabilite: 8, swatch: "#5a9ab0",
    clivage: "parfait", eclat: "vitreux", couleurs: "bleu-vert turquoise",
    contexte: "Pegmatites et granulites boriques (Madagascar surtout).",
    devient: "Résiduelle.",
    note: "L'une des gemmes les plus rares au monde, d'un bleu-vert turquoise inimitable. Découverte à Madagascar en 1902 et nommée d'après l'explorateur français Alfred Grandidier. Les pierres taillées de qualité se comptent en centaines.",
  },

  // ---------- Silicates de manganèse ----------
  braunite: {
    nom: "Braunite", formule: "Mn²⁺Mn³⁺₆SiO₁₂", famille: "Nésosubsilicate (manganèse)",
    systeme: "quadratique", durete: 6.25, densite: 4.8, stabilite: 6, swatch: "#3a3438",
    clivage: "parfait", eclat: "submétallique", couleurs: "noir, gris-noir",
    contexte: "Gisements de manganèse métamorphisés.",
    devient: "→ oxydes de Mn (pyrolusite) en surface.",
    note: "À mi-chemin entre l'oxyde et le silicate : sa formule contient un seul silicium pour sept manganèses. C'est un minerai de manganèse important, et l'un des rares silicates à éclat métallique.",
  },
});

// ---------- Sous-familles des nésosilicates (arbre affiché sur la page du groupe) ----------
const NESO_SOUS_FAMILLES = [
  {
    nom: "Groupe de la phénacite",
    formule: "A₂SiO₄ — cations en coordination 4",
    note: "Les petits cations (Be²⁺, Zn²⁺, Li⁺) se logent dans des tétraèdres, comme le silicium : la structure entière n'est faite que de tétraèdres. Minéraux rares, souvent fluorescents.",
    mineraux: ["phenacite", "willemite", "eucryptite"],
  },
  {
    nom: "Groupe de l'olivine",
    formule: "A₂SiO₄ — cations en coordination 6",
    note: "Le groupe le plus abondant de la Terre — il constitue l'essentiel du manteau supérieur. Les tétraèdres isolés sont reliés par Mg²⁺ ou Fe²⁺ en octaèdres. Série continue entre la forstérite (Mg) et la fayalite (Fe) : plus il y a de fer, plus l'altération est rapide.",
    mineraux: ["olivine", "forsterite", "fayalite", "tephroite", "liebenbergite",
               "monticellite", "kirschsteinite", "glaucochroite", "larsenite",
               "wadsleyite", "ringwoodite"],
  },
  {
    nom: "Groupe du grenat",
    formule: "A₃B₂(SiO₄)₃ — cubique",
    note: "Deux séries selon le cation A : les pyralspites (Mg, Fe, Mn + Al) et les ugrandites (Ca + Al, Fe, Cr, V, Ti). Tous cubiques, tous durs, tous sans clivage — ils se cassent en éclats. Minéraux-index majeurs du métamorphisme.",
    mineraux: ["grenat", "pyrope", "almandin", "spessartine", "knorringite",
               "grossulaire", "andradite", "uvarovite", "goldmanite", "schorlomite",
               "hydrogrossulaire", "majorite"],
  },
  {
    nom: "Groupe du zircon",
    formule: "ASiO₄ — cation en coordination 8",
    note: "Un gros cation tétravalent (Zr, Hf, Th, U) entouré de huit oxygènes. Des minéraux extrêmement denses et durables — ou au contraire détruits de l'intérieur par leur propre radioactivité (thorite, coffinite).",
    mineraux: ["zircon", "hafnon", "thorite", "huttonite", "coffinite"],
  },
  {
    nom: "Silicates d'alumine — les polymorphes Al₂SiO₅",
    formule: "Al₂SiO₅ — nésosubsilicates",
    note: "Trois minéraux, une seule formule : andalousite (basse pression), disthène (haute pression), sillimanite (haute température). Selon lequel se forme, on lit directement la pression et la température subies par la roche — c'est le baromètre-thermomètre favori des métamorphistes.",
    mineraux: ["andalousite", "disthene", "sillimanite", "mullite"],
  },
  {
    nom: "Groupe de la topaze",
    formule: "A₂SiO₄(F,OH)₂ — nésosubsilicates",
    note: "Des tétraèdres isolés liés par de l'aluminium, avec du fluor et des OH en plus. Le fluor vient des vapeurs magmatiques tardives : ces minéraux marquent les greisens, ces granites « cuits » par leurs propres fluides.",
    mineraux: ["topaze", "euclase"],
  },
  {
    nom: "Groupe de la staurotide",
    formule: "(Fe,Mg)₄Al₁₈Si₈O₄₆(OH)₂",
    note: "Un seul minéral majeur, mais célèbre : ses macles en croix, les « croisettes de Bretagne », ont servi d'amulettes. Minéral-index du métamorphisme moyen.",
    mineraux: ["staurotide"],
  },
  {
    nom: "Groupe de la humite",
    formule: "nMg₂SiO₄ · Mg(F,OH)₂ — série",
    note: "Une série remarquable : les mêmes briques (couches d'olivine + couches de brucite fluorée) s'empilent en proportions croissantes — norbergite (n=1), chondrodite (n=2), humite (n=3), clinohumite (n=4). De la minéralogie en LEGO. Elles exigent du fluor et des marbres dolomitiques ; l'alléghanyite en est la version manganésifère.",
    mineraux: ["norbergite", "chondrodite", "humite", "clinohumite", "alleghanyite"],
  },
  {
    nom: "Groupe de la titanite",
    formule: "CaTiSiO₅ — nésosubsilicates",
    note: "Un tétraèdre SiO₄ isolé, du calcium, et un métal tétravalent (Ti, Sn) en octaèdre, plus un oxygène libre. Accessoire quasi universel des granites et gneiss — c'est la principale source du titane des sols.",
    mineraux: ["titanite", "malayaite"],
  },
  {
    nom: "Groupe du chloritoïde",
    formule: "(Fe,Mg,Mn)₂Al₄Si₂O₁₀(OH)₄",
    note: "Faux airs de chlorite, mais dur et cassant. Minéraux-index des schistes alumineux de bas degré.",
    mineraux: ["chloritoide", "ottrelite"],
  },
  {
    nom: "Borosilicates",
    formule: "SiO₄ + groupements BO₃",
    note: "Des tétraèdres SiO₄ isolés accompagnés de groupements borate. Le bore, élément léger et incompatible, se concentre dans les fluides tardifs : ces minéraux marquent les pegmatites et les métamorphismes de haute température.",
    mineraux: ["datolite", "dumortierite", "kornerupine", "grandidierite"],
  },
  {
    nom: "Silicates de terres rares",
    formule: "SiO₄ + Ce, La, Y, Th…",
    note: "Des tétraèdres isolés liés par des terres rares. Rares mais scientifiquement décisifs : c'est en les analysant qu'on a découvert la moitié des lanthanides. Souvent métamictes, détruits de l'intérieur par leur radioactivité.",
    mineraux: ["gadolinite", "cerite", "britholite"],
  },
  {
    nom: "Silicates de manganèse",
    formule: "SiO₄ + Mn",
    note: "À la frontière de l'oxyde et du silicate : la braunite ne contient qu'un silicium pour sept manganèses.",
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
  neso.note = "Le tétraèdre SiO₄ reste isolé : il ne partage aucun oxygène avec ses voisins, et ce sont les cations (Mg, Fe, Ca, Al, Zr…) qui assurent la cohésion. Résultat : des minéraux compacts et denses, mais dont la solidité dépend entièrement du cation — l'olivine cède la première à l'altération, le zircon est immortel. Environ 120 espèces, réparties en une douzaine de sous-familles.";
})();
