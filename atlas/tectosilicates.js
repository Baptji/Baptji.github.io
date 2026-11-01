// ============================================================
// TECTOSILICATES (Strunz 9.F) & ZÉOLITHES (Strunz 9.G)
// La charpente 3D complète : chaque tétraèdre partage ses QUATRE
// sommets → réseau tridimensionnel, rapport Si:O = 1:2 (SiO₂).
// C'est la connectivité maximale : les deux tiers de la croûte.
//
//   9.F  sans eau     → silice, feldspaths, feldspathoïdes, scapolites
//   9.G  AVEC eau     → zéolithes : charpente ouverte, canaux gorgés
//                       d'eau et de cations mobiles et échangeables.
//
// On classe SIO₂ (quartz…), CALCÉDOINE et OPALE dans la silice ; les
// feldspaths en alcalins (K,Ba) et plagioclases (série Na→Ca) ; les
// feldspathoïdes (feldspaths « sans assez de silice ») ; les scapolites.
//
// N.B. : la catégorie Wikipédia « Tectosilicate » range à tort des
// néso/sorosilicates (phénacite, willémite, hémimorphite, groupe
// helvite). Ils restent dans leurs classes respectives.
//
// Chargé après phyllosilicates.js, avant app.js.
// ============================================================

Object.assign(MINERAUX, {
  // ================= 9.F — SANS eau zéolitique =================

  // ---------- Silice : polymorphes de SiO₂ ----------
  tridymite: {
    nom: "Tridymite", formule: "SiO₂", famille: "Tectosilicate : silice", durete: 7, densite: 2.27, stabilite: 9, swatch: "#e4e0d5",
    systeme: "orthorhombique (basse T)", clivage: "médiocre", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "On la trouve dans les cavités des laves felsiques (rhyolites, obsidiennes) et dans certaines météorites.",
    devient: "Se réorganise en quartz ; à défaut, elle demeure de la silice.",
    note: "Polymorphe de haute température de la silice, stable entre 870 et 1 470 °C, qui forme de fines plaquettes hexagonales souvent maclées en triplets (son nom vient du grec « trois »). Elle se rencontre dans les cavités des laves acides et dans certaines météorites.",
  },
  cristobalite: {
    nom: "Cristobalite", formule: "SiO₂", famille: "Tectosilicate : silice", durete: 6.5, densite: 2.33, stabilite: 9, swatch: "#e6e2d8",
    systeme: "quadratique (basse T)", clivage: "aucun", eclat: "vitreux",
    couleurs: "blanc, incolore, laiteux",
    contexte: "Sphérules blanches des rhyolites et des obsidiennes ; produit de la calcination des terres de diatomées.",
    devient: "Se réordonne en quartz.",
    note: "Polymorphe de silice le plus chaud stable à pression ordinaire (au-delà de 1 470 °C). Ses petites sphérules blanches forment les « flocons » de l'obsidienne floconneuse. Sa poussière est un risque reconnu de silicose.",
  },
  moganite: {
    nom: "Moganite", formule: "SiO₂", famille: "Tectosilicate : silice", durete: 6, densite: 2.5, stabilite: 9, swatch: "#cfc7b5",
    systeme: "monoclinique", clivage: "aucun", eclat: "vitreux à cireux",
    couleurs: "gris, blanc",
    contexte: "Dans les silicifications, elle s'associe à la calcédoine, principalement en milieu aride, où la pluie reste inférieure à 20 % de l'ETP.",
    devient: "→ silice.",
    note: "Polymorphe monoclinique de la silice, longtemps confondu avec la calcédoine, dont il s'entremêle intimement à l'échelle du micron. Il n'a été reconnu comme espèce distincte qu'en 1999. Il est fréquent dans les évaporites silicifiées des déserts.",
  },
  coesite: {
    nom: "Coésite", formule: "SiO₂", famille: "Tectosilicate : silice", durete: 7.5, densite: 2.92, stabilite: 9, swatch: "#d8d0c0",
    systeme: "monoclinique", clivage: "aucun", eclat: "vitreux",
    couleurs: "incolore",
    contexte: "On la trouve dans les roches de très haute pression, telles les éclogites à coésite, et dans les cratères d'impact.",
    devient: "Se transforme en quartz à basse pression, par rétromorphose.",
    note: "Plus dense que le quartz, cette silice de haute pression signale, par sa présence, l'une de deux causes extrêmes : une subduction ultra-profonde (plus de 90 km) ou un impact météoritique. Synthétisée en 1953, elle a ensuite été découverte au Meteor Crater. C'est un marqueur des impacts et des roches de très haute pression (UHP).",
  },
  stishovite: {
    nom: "Stishovite", formule: "SiO₂", famille: "Tectosilicate : silice", durete: 9.5, densite: 4.29, stabilite: 9, swatch: "#cfc8bc",
    systeme: "quadratique (type rutile)", clivage: "imparfait", eclat: "vitreux",
    couleurs: "incolore",
    contexte: "Cratères d'impact de météorites, où le choc dépasse 10 GPa.",
    devient: "Se rétromorphose en quartz.",
    note: "Silice formée lors d'un choc extrême : sous une compression telle que le silicium s'y entoure de six oxygènes au lieu de quatre, elle atteint une densité de 4,3 et une dureté voisine de celle du corindon. Elle ne se forme qu'au-delà de 10 gigapascals ; sa présence dans une roche constitue donc une preuve presque certaine d'impact météoritique (Meteor Crater, Ries).",
  },
  seifertite: {
    nom: "Seifertite", formule: "SiO₂", famille: "Tectosilicate : silice", durete: 8, densite: 4.1, stabilite: 9, swatch: "#cdc6ba",
    systeme: "orthorhombique", clivage: "indéterminé", eclat: "vitreux",
    couleurs: "incolore",
    contexte: "Météorites martiennes et lunaires très choquées.",
    devient: "→ silice.",
    note: "Décrite en 2008 dans des météorites choquées, cette silice de très haute pression est plus dense encore. Sa présence atteste des pressions de choc supérieures à celles qui produisent la stishovite.",
  },
  melanophlogite: {
    nom: "Mélanophlogite", formule: "SiO₂ (clathrate)", famille: "Tectosilicate : silice", durete: 6.5, densite: 2.0, stabilite: 8, swatch: "#e0dccb",
    systeme: "cubique", clivage: "aucun", eclat: "vitreux",
    couleurs: "incolore, jaunâtre, brun",
    contexte: "On la rencontre avec le soufre dans des gisements sédimentaires de Sicile et de Toscane.",
    devient: "→ silice.",
    note: "Silice de type « clathrate » : sa charpente délimite des cages qui emprisonnent des molécules de gaz (méthane, CO₂, azote), à la manière des hydrates de gaz. Rare, elle se forme à basse température, en association avec le soufre et la matière organique.",
  },

  // ---------- Feldspaths alcalins (K, Ba) ----------
  anorthose: {
    nom: "Anorthose (anorthoclase)", formule: "(Na,K)AlSi₃O₈", famille: "Tectosilicate : feldspath alcalin", durete: 6, densite: 2.58, stabilite: 6, swatch: "#ddd8cd",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "incolore, blanc, gris ; irisations (pierre de lune)",
    contexte: "Laves sodiques : trachytes, phonolites, larvikite.",
    devient: "Hydrolyse → argiles + Na⁺/K⁺.",
    note: "Entre la sanidine et l'albite se situe ce feldspath alcalin sodique. Ses grands cristaux irisés forment la « pierre de lune » de certaines laves, et le volcan Erebus, en Antarctique, en projette d'excellents exemplaires dans ses bombes.",
  },
  celsiane: {
    nom: "Celsiane", formule: "BaAl₂Si₂O₈", famille: "Tectosilicate : feldspath alcalin", durete: 6.25, densite: 3.4, stabilite: 6, swatch: "#dcd6c8",
    systeme: "monoclinique", clivage: "bon {001} et {010}", eclat: "vitreux",
    couleurs: "incolore, blanc, jaune",
    contexte: "Gisements métamorphiques riches en manganèse et en baryum.",
    devient: "→ argiles.",
    note: "Feldspath du baryum, le plus dense de la famille. Rare, il se forme dans les roches métamorphiques riches en Ba et en Mn et constitue, par l'intermédiaire de l'hyalophane, une série avec l'orthose. Il rend hommage à l'astronome Anders Celsius.",
  },
  hyalophane: {
    nom: "Hyalophane", formule: "(K,Ba)Al(Si,Al)₃O₈", famille: "Tectosilicate : feldspath alcalin", durete: 6.25, densite: 2.8, stabilite: 6, swatch: "#ddd7c9",
    systeme: "monoclinique", clivage: "bon {001} et {010}", eclat: "vitreux",
    couleurs: "incolore, blanc, jaune pâle, rose",
    contexte: "Les gisements de manganèse et les dolomies métamorphisées de Suède et de Bosnie l'abritent.",
    devient: "→ argiles.",
    note: "Situé entre l'orthose (potassium) et la celsiane (baryum), ce feldspath doit son nom, tiré du grec « qui paraît vitreux », à sa limpidité. Il se rencontre dans les gisements métamorphiques de manganèse.",
  },
  buddingtonite: {
    nom: "Buddingtonite", formule: "(NH₄)AlSi₃O₈·½H₂O", famille: "Tectosilicate : feldspath alcalin", durete: 5.5, densite: 2.38, stabilite: 5, swatch: "#ddd8cc",
    systeme: "monoclinique", clivage: "bon {001}", eclat: "vitreux",
    couleurs: "blanc, incolore",
    contexte: "Produit de l'altération hydrothermale en milieu riche en matière organique (systèmes géothermaux, gisements d'or).",
    devient: "→ argiles.",
    note: "Dans ce feldspath singulier, l'ion ammonium (NH₄⁺) prend la place du potassium : il s'agit d'un « feldspath organique ». Formé là où des fluides chargés de matière organique altèrent la roche, il sert d'indicateur pour la prospection de l'or au Nevada.",
  },

  // ---------- Feldspaths plagioclases (série Na → Ca) ----------
  albite: {
    nom: "Albite", formule: "NaAlSi₃O₈", famille: "Tectosilicate : feldspath plagioclase", durete: 6.25, densite: 2.62, stabilite: 6, swatch: "#e0dcd0",
    systeme: "triclinique", clivage: "parfait {001} et {010} à ~94°", eclat: "vitreux à nacré",
    couleurs: "blanc, incolore, bleuté (péristérite)",
    contexte: "On le rencontre dans les granites, les pegmatites, les albitites et les roches métamorphiques de bas degré.",
    devient: "Hydrolyse → kaolinite/smectite + Na⁺.",
    note: "Pôle sodique des plagioclases (Ab₁₀₀), l'albite est aussi un feldspath alcalin de basse température. Sa variété claire et lamellaire des pegmatites porte le nom de cléavelandite, et sa variété nacrée et irisée celui de péristérite. Ses macles fines et parallèles la trahissent au microscope.",
  },
  oligoclase: {
    nom: "Oligoclase", formule: "(Na,Ca)(Al,Si)₄O₈ : Ab₉₀₋₇₀", famille: "Tectosilicate : feldspath plagioclase", durete: 6.25, densite: 2.65, stabilite: 5, swatch: "#dcd8cc",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, verdâtre ; scintillements (pierre de soleil)",
    contexte: "Granites, syénites, gneiss.",
    devient: "→ argiles.",
    note: "Avec 10 à 30 % d'anorthite, ce plagioclase sodique intermédiaire comprend une variété criblée d'inclusions d'hématite qui réfléchissent la lumière : la pierre de soleil (héliolite).",
  },
  andesine: {
    nom: "Andésine", formule: "(Na,Ca)(Al,Si)₄O₈ : Ab₇₀₋₅₀", famille: "Tectosilicate : feldspath plagioclase", durete: 6.25, densite: 2.67, stabilite: 5, swatch: "#d8d2c4",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, rosé",
    contexte: "On trouve ce minéral dans les andésites et les diorites, deux roches intermédiaires typiques des zones de subduction.",
    devient: "→ argiles.",
    note: "Plagioclase intermédiaire (30 à 50 % d'anorthite), auquel les andésites, laves de la cordillère des Andes typiques des volcans de subduction, doivent leur nom.",
  },
  labradorite: {
    nom: "Labradorite", formule: "(Ca,Na)(Al,Si)₄O₈ : Ab₅₀₋₃₀", famille: "Tectosilicate : feldspath plagioclase", durete: 6.25, densite: 2.69, stabilite: 4, swatch: "#4a5a6a",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "gris à noir, avec des éclairs bleus, verts, dorés (labradorescence)",
    contexte: "Gabbros, basaltes, anorthosites (Labrador, Finlande).",
    devient: "→ argiles.",
    note: "Riche de 50 à 70 % d'anorthite, ce plagioclase calcique intermédiaire doit sa labradorescence à des reflets bleus et verts produits par des lamelles d'exsolution. Gemme et pierre ornementale recherchée, il fournit notamment la spectrolite finlandaise.",
  },
  bytownite: {
    nom: "Bytownite", formule: "(Ca,Na)(Al,Si)₄O₈ : Ab₃₀₋₁₀", famille: "Tectosilicate : feldspath plagioclase", durete: 6.25, densite: 2.72, stabilite: 4, swatch: "#d6d0c0",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, jaunâtre",
    contexte: "Gabbros et roches basiques.",
    devient: "→ argiles rapidement.",
    note: "Plagioclase très calcique (70 à 90 % d'anorthite), parfois taillé en gemme jaune paille. Son nom vient de Bytown, ancien nom d'Ottawa.",
  },
  anorthite: {
    nom: "Anorthite", formule: "CaAl₂Si₂O₈", famille: "Tectosilicate : feldspath plagioclase", durete: 6.25, densite: 2.76, stabilite: 3, swatch: "#d4cec0",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, incolore",
    contexte: "Roches basiques et ultrabasiques, skarns, basaltes lunaires.",
    devient: "→ smectites et kaolinite, très rapidement (haut de la série de Goldich).",
    note: "Le pôle calcique (An₁₀₀) est le feldspath le plus vulnérable à l'altération. Sur la Lune, il forme les hautes terres claires d'anorthosite, première croûte qui flottait sur l'océan de magma primitif.",
  },

  // ---------- Feldspathoïdes (« feldspaths sans assez de silice ») ----------
  kalsilite: {
    nom: "Kalsilite", formule: "KAlSiO₄", famille: "Tectosilicate : feldspathoïde", durete: 6, densite: 2.6, stabilite: 2, swatch: "#d6d0c2",
    systeme: "hexagonal", clivage: "imparfait", eclat: "vitreux",
    couleurs: "incolore, gris, blanc",
    contexte: "Laves ultrapotassiques (kamafugites d'Ouganda, Latium).",
    devient: "→ argiles + K⁺.",
    note: "Pôle potassique de la néphéline, ce minéral se rencontre dans les kamafugites du rift est-africain, des laves très pauvres en silice et riches en potassium, où il s'intercroît fréquemment avec la néphéline.",
  },
  sodalite: {
    nom: "Sodalite", formule: "Na₈(AlSiO₄)₆Cl₂", famille: "Tectosilicate : feldspathoïde", durete: 5.75, densite: 2.3, stabilite: 3, swatch: "#2f4a9a",
    systeme: "cubique", clivage: "médiocre", eclat: "vitreux à gras",
    couleurs: "bleu royal, gris, blanc, rose (hackmanite)",
    contexte: "Syénites néphéliniques et phonolites du Groenland et du Canada.",
    devient: "→ zéolithes + argiles.",
    note: "Taillé en pierre ornementale, ce feldspathoïde chloruré présente un bleu roi. Sa variété hackmanite, ténébrescente, rosit sous UV puis pâlit à la lumière, de façon réversible et bien marquée. Il compte parmi les minéraux du lapis-lazuli.",
  },
  hauyne: {
    nom: "Haüyne", formule: "Na₃Ca(Al₃Si₃O₁₂)(SO₄)", famille: "Tectosilicate : feldspathoïde", durete: 5.75, densite: 2.5, stabilite: 3, swatch: "#2f6ac0",
    systeme: "cubique", clivage: "médiocre", eclat: "vitreux à gras",
    couleurs: "bleu vif, bleu-vert",
    contexte: "Phonolites et laves alcalines de l'Eifel, du Vésuve et de l'Auvergne.",
    devient: "→ zéolithes + argiles.",
    note: "Feldspathoïde sulfaté d'un bleu intense, qui colore les phonolites et les « laves bleues » d'Auvergne. Elle porte le nom de René Just Haüy, fondateur de la cristallographie. Elle entre dans la composition du lapis-lazuli.",
  },
  noseane: {
    nom: "Noséane", formule: "Na₈(Al₆Si₆O₂₄)(SO₄)·H₂O", famille: "Tectosilicate : feldspathoïde", durete: 5.75, densite: 2.35, stabilite: 3, swatch: "#6a7a9a",
    systeme: "cubique", clivage: "médiocre", eclat: "vitreux à gras",
    couleurs: "gris, bleuté, brun",
    contexte: "Phonolites et laves alcalines très pauvres en silice de l'Eifel.",
    devient: "→ zéolithes + argiles.",
    note: "Voisine de la haüyne, mais dépourvue de calcium et d'aspect plus terne, grise à bleutée. Membre du groupe de la sodalite, issu des laves alcalines, elle rend hommage au minéralogiste K. W. Nose.",
  },
  lazurite: {
    nom: "Lazurite", formule: "Na₇Ca(Al₆Si₆O₂₄)(SO₄)(S₃)", famille: "Tectosilicate : feldspathoïde", durete: 5.25, densite: 2.4, stabilite: 3, swatch: "#26409a",
    systeme: "cubique", clivage: "imparfait", eclat: "vitreux à gras",
    couleurs: "bleu outremer intense",
    contexte: "On la trouve dans des marbres métamorphisés au contact (Badakhshan, Afghanistan ; lac Baïkal ; Chili).",
    devient: "→ argiles.",
    note: "Constituant majeur du lapis-lazuli, ce minéral a fourni le bleu outremer des sarcophages égyptiens et des Vierges de la Renaissance ; broyé, il valait plus cher que l'or. Sa couleur provient d'ions soufre (S₃⁻) piégés dans la charpente. Les mines de Sar-e-Sang, en Afghanistan, sont exploitées depuis 7 000 ans.",
  },
  cancrinite: {
    nom: "Cancrinite", formule: "Na₆Ca₂(Al₆Si₆O₂₄)(CO₃)₂·2H₂O", famille: "Tectosilicate : feldspathoïde", durete: 5.25, densite: 2.45, stabilite: 3, swatch: "#d8a84a",
    systeme: "hexagonal", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "jaune vif, orange, blanc, bleu",
    contexte: "Syénites néphéliniques (Kola, Canada, Oural).",
    devient: "→ zéolithes + argiles.",
    note: "Espèce de tête d'un groupe, avec la davyne, la vishnévite et l'afghanite, ce feldspathoïde carbonaté, souvent jaune vif ou orangé, provient des roches alcalines. Les membres du groupe se distinguent par l'anion piégé dans leurs canaux : carbonate, sulfate ou chlorure.",
  },
  davyne: {
    nom: "Davyne", formule: "(Na,K)₆Ca₂(Al₆Si₆O₂₄)Cl₂(SO₄)", famille: "Tectosilicate : feldspathoïde", durete: 5.5, densite: 2.5, stabilite: 3, swatch: "#d4cdbb",
    systeme: "hexagonal", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, gris",
    contexte: "Blocs volcaniques éjectés du Vésuve et du Monte Somma.",
    devient: "→ argiles.",
    note: "Décrit dans les blocs rejetés par le Vésuve, ce membre chloruré et sulfaté du groupe de la cancrinite porte le nom du chimiste Humphry Davy.",
  },
  vishnevite: {
    nom: "Vishnévite", formule: "Na₈(Al₆Si₆O₂₄)(SO₄)·2H₂O", famille: "Tectosilicate : feldspathoïde", durete: 5.5, densite: 2.35, stabilite: 3, swatch: "#7a8aaa",
    systeme: "hexagonal", clivage: "bon", eclat: "vitreux",
    couleurs: "bleu, gris, blanc",
    contexte: "Syénites néphéliniques (monts Vishnevye, Oural).",
    devient: "→ argiles.",
    note: "Souvent bleuté, ce membre sulfaté et hydraté du groupe de la cancrinite tire son nom des monts Vishnevye, dans l'Oural, où se trouve sa localité type.",
  },
  afghanite: {
    nom: "Afghanite", formule: "(Na,K)₂₂Ca₁₀(Si₂₄Al₂₄O₉₆)(SO₄)₆Cl₆", famille: "Tectosilicate : feldspathoïde", durete: 5.75, densite: 2.55, stabilite: 3, swatch: "#4a7ac0",
    systeme: "hexagonal", clivage: "parfait", eclat: "vitreux",
    couleurs: "bleu ciel",
    contexte: "Marbres à lapis-lazuli (Sar-e-Sang, Afghanistan).",
    devient: "→ argiles.",
    note: "Ce feldspathoïde bleu ciel, appartenant au groupe de la cancrinite, a été décrit dans le lapis-lazuli d'Afghanistan, qui lui a donné son nom ; on le retrouve avec la lazurite dans les marbres bleus.",
  },
  tugtupite: {
    nom: "Tugtupite", formule: "Na₄BeAlSi₄O₁₂Cl", famille: "Tectosilicate : feldspathoïde", durete: 6.25, densite: 2.4, stabilite: 3, swatch: "#d06a8a",
    systeme: "quadratique", clivage: "bon", eclat: "vitreux",
    couleurs: "rose à rouge cramoisi (ténébrescent)",
    contexte: "Pegmatites alcalines d'Ilímaussaq (Groenland).",
    devient: "→ argiles.",
    note: "Riche en béryllium, ce feldspathoïde, rose à rouge, pâlit dans le noir et rougit sous le soleil ou les UV, comme la hackmanite. Son gisement quasi exclusif est Tugtup, au Groenland, et son nom inuit signifie « roche du renne ».",
  },

  // ---------- Scapolites (série) ----------
  marialite: {
    nom: "Marialite", formule: "Na₄(Al₃Si₉O₂₄)Cl", famille: "Tectosilicate : scapolite", durete: 6, densite: 2.55, stabilite: 4, swatch: "#ddd6c6",
    systeme: "quadratique", clivage: "bon {100} et {110}", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, rose, jaune",
    contexte: "Marbres et skarns métasomatiques.",
    devient: "→ argiles.",
    note: "Pôle sodique et chloruré des scapolites : charpente proche de celle des feldspaths, dont les canaux accueillent Cl, CO₃ ou SO₄. Elle se trouve dans les marbres et les skarns ; parfois taillée en gemme jaune, elle est fortement fluorescente.",
  },
  meionite: {
    nom: "Méionite", formule: "Ca₄(Al₆Si₆O₂₄)(CO₃)", famille: "Tectosilicate : scapolite", durete: 6, densite: 2.7, stabilite: 4, swatch: "#d8d1c1",
    systeme: "quadratique", clivage: "bon {100} et {110}", eclat: "vitreux",
    couleurs: "blanc, gris, incolore",
    contexte: "Marbres métamorphiques, skarns et éjectas du Vésuve.",
    devient: "→ argiles + calcite.",
    note: "Son nom, issu du grec meíon, « moindre », renvoie à ses cristaux à pyramides basses : c'est le pôle calcique et carbonaté des scapolites, qui se forme dans des roches calciques métamorphisées.",
  },
  silvialite: {
    nom: "Silvialite", formule: "Ca₃Na(Al₅Si₇O₂₄)(SO₄)", famille: "Tectosilicate : scapolite", durete: 6, densite: 2.6, stabilite: 4, swatch: "#d4cdbd",
    systeme: "quadratique", clivage: "bon", eclat: "vitreux",
    couleurs: "gris, blanc",
    contexte: "Xénolites granulitiques du manteau profond.",
    devient: "→ argiles.",
    note: "Décrit dans des enclaves granulitiques remontées du manteau, ce membre sulfaté et rare des scapolites complète la série avec l'anion SO₄.",
  },

  // ---------- Autres charpentes ----------
  danburite: {
    nom: "Danburite", formule: "CaB₂Si₂O₈", famille: "Tectosilicate : borosilicate", durete: 7.25, densite: 3.0, stabilite: 6, swatch: "#e0dccb",
    systeme: "orthorhombique", clivage: "imparfait", eclat: "vitreux à gras",
    couleurs: "incolore, jaune paille, rose",
    contexte: "Charcas (Mexique) et la Birmanie fournissent des skarns, des dolomies métamorphiques et des pegmatites qui la renferment.",
    devient: "→ argiles + bore en solution.",
    note: "Danbury, dans le Connecticut, a donné son nom à ce borosilicate. Il associe le bore au silicium dans une charpente 3D proche de celle des feldspaths ; sa gemme, taillée, est incolore ou jaunâtre.",
  },
  petalite: {
    nom: "Pétalite", formule: "LiAlSi₄O₁₀", famille: "Tectosilicate : divers", durete: 6.25, densite: 2.4, stabilite: 5, swatch: "#ddd8cc",
    systeme: "monoclinique", clivage: "parfait {001}", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, gris, rose",
    contexte: "Pegmatites granitiques à lithium.",
    devient: "→ argiles + lithium.",
    note: "C'est en analysant ce tectosilicate de lithium des pegmatites, en 1817, que l'on découvrit le lithium. Minerai de Li, il présente une gemme incolore qui rappelle le quartz ; chauffé, il se transforme en spodumène et quartz.",
  },
  eucryptite: {
    nom: "Eucryptite", formule: "LiAlSiO₄", famille: "Tectosilicate : divers", durete: 6.5, densite: 2.67, stabilite: 5, swatch: "#dcd6c8",
    systeme: "rhomboédrique", clivage: "imparfait", eclat: "vitreux",
    couleurs: "incolore, blanc, rose",
    contexte: "Pegmatites à lithium, où elle remplace souvent le spodumène.",
    devient: "→ argiles + lithium.",
    note: "Issu le plus souvent de l'altération du spodumène, ce tectosilicate de lithium à charpente « farcie », dérivée du quartz, a une dilatation thermique quasi nulle : il entre dans la fabrication des vitrocéramiques, comme les plaques de cuisson. Elle est fluorescente en rose sous UV.",
  },
  leifite: {
    nom: "Leifite", formule: "Na₂(Si,Al,Be)₇O₁₄(OH)·H₂O", famille: "Tectosilicate : divers", durete: 6, densite: 2.57, stabilite: 4, swatch: "#dcd7c9",
    systeme: "rhomboédrique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, rose",
    contexte: "On la rencontre dans les pegmatites et les syénites alcalines du Groenland, de Kola et du mont Saint-Hilaire.",
    devient: "→ argiles.",
    note: "Rare tectosilicate sodi-bérylifère des roches alcalines, cette espèce forme de fines aiguilles. Elle rend hommage à Leif Erikson, l'explorateur viking qui atteignit l'Amérique cinq siècles avant Colomb.",
  },

  // ================= 9.G — ZÉOLITHES (avec eau) =================

  // ---------- Zéolithes fibreuses ----------
  natrolite: {
    nom: "Natrolite", formule: "Na₂Al₂Si₃O₁₀·2H₂O", famille: "Zéolithe fibreuse", durete: 5.25, densite: 2.25, stabilite: 3, swatch: "#ddd7c8",
    systeme: "orthorhombique", clivage: "parfait", eclat: "vitreux à soyeux",
    couleurs: "incolore, blanc, rose",
    contexte: "Géodes des basaltes, syénites néphéliniques.",
    devient: "→ argiles.",
    note: "Zéolithe fibreuse la plus courante, la natrolite forme des aiguilles rayonnantes en gerbes dans les cavités des basaltes ; riche en sodium (natr-), elle perd son eau à la chaleur puis la reprend à l'air humide, comme toutes les zéolithes.",
  },
  mesolite: {
    nom: "Mésolite", formule: "Na₂Ca₂Al₆Si₉O₃₀·8H₂O", famille: "Zéolithe fibreuse", durete: 5, densite: 2.25, stabilite: 3, swatch: "#dcd6c7",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à soyeux",
    couleurs: "blanc, incolore",
    contexte: "Cavités des basaltes (Deccan, Islande).",
    devient: "→ argiles.",
    note: "Située entre la natrolite (sodium) et la scolécite (calcium), la mésolite forme des aiguilles extrêmement fines, presque cotonneuses. Son nom, du grec mésos, « au milieu », traduit cette position dans la série.",
  },
  scolecite: {
    nom: "Scolécite", formule: "CaAl₂Si₃O₁₀·3H₂O", famille: "Zéolithe fibreuse", durete: 5.25, densite: 2.27, stabilite: 3, swatch: "#ddd7c9",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à soyeux",
    couleurs: "incolore, blanc",
    contexte: "Cavités et amygdales des basaltes.",
    devient: "→ argiles.",
    note: "Zéolithe fibreuse calcique, la scolécite forme de beaux prismes rayonnants. Son nom vient du grec skṓlēx (« ver ») : sous le chalumeau, ses fibres se tordent en s'effritant. On en trouve d'excellents cristaux en Inde.",
  },
  thomsonite: {
    nom: "Thomsonite", formule: "NaCa₂Al₅Si₅O₂₀·6H₂O", famille: "Zéolithe fibreuse", durete: 5.25, densite: 2.35, stabilite: 3, swatch: "#d8d2c2",
    systeme: "orthorhombique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "blanc, rose, vert, rouge",
    contexte: "Cavités des basaltes.",
    devient: "→ argiles.",
    note: "Ses sphérules rayonnantes concentriques, parfois zonées de couleurs, forment les « yeux de thomsonite » qu'on polit sur les rives du lac Supérieur. La thomsonite rend hommage au chimiste Thomas Thomson.",
  },
  gonnardite: {
    nom: "Gonnardite", formule: "(Na,Ca)₂(Si,Al)₅O₁₀·3H₂O", famille: "Zéolithe fibreuse", durete: 4.75, densite: 2.3, stabilite: 3, swatch: "#dcd7c8",
    systeme: "orthorhombique", clivage: "indistinct", eclat: "vitreux à soyeux",
    couleurs: "incolore, blanc",
    contexte: "Cavités des basaltes (Auvergne).",
    devient: "→ argiles.",
    note: "Voisine de la natrolite, la gonnardite forme de petites sphérules soyeuses. Décrite en Auvergne, elle rend hommage au minéralogiste Ferdinand Gonnard.",
  },
  edingtonite: {
    nom: "Édingtonite", formule: "BaAl₂Si₃O₁₀·4H₂O", famille: "Zéolithe fibreuse", durete: 4.25, densite: 2.75, stabilite: 3, swatch: "#dcd6c6",
    systeme: "orthorhombique / quadratique", clivage: "parfait", eclat: "vitreux",
    couleurs: "incolore, blanc, rose, gris",
    contexte: "Veines hydrothermales (Écosse).",
    devient: "→ argiles.",
    note: "La plus dense des zéolithes fibreuses, l'édingtonite est une zéolithe rare au baryum, en petits cristaux roses ou gris. Sa localité type est écossaise.",
  },

  // ---------- Groupe de la chabazite ----------
  chabazite: {
    nom: "Chabazite", formule: "(Ca,Na₂,K₂)Al₂Si₄O₁₂·6H₂O", famille: "Zéolithe (groupe chabazite)", durete: 4.25, densite: 2.1, stabilite: 3, swatch: "#ddd6c6",
    systeme: "rhomboédrique", clivage: "médiocre", eclat: "vitreux",
    couleurs: "incolore, blanc, rose, orangé",
    contexte: "Cavités des basaltes et andésites.",
    devient: "→ argiles.",
    note: "Ses rhomboèdres pseudo-cubiques, souvent maclés, en font l'espèce de tête d'un groupe. Depuis 1997, les membres de ce groupe, classés selon le cation dominant (Ca, Na ou K), sont traités comme des espèces à part entière, et la chabazite sert de tamis moléculaire industriel.",
  },
  levyne: {
    nom: "Lévyne", formule: "(Ca,Na₂,K₂)Al₂Si₄O₁₂·6H₂O", famille: "Zéolithe (groupe chabazite)", durete: 4.25, densite: 2.1, stabilite: 3, swatch: "#dcd6c7",
    systeme: "rhomboédrique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, jaune, rouge",
    contexte: "Cavités des basaltes, où elle est souvent associée à l'offrétite.",
    devient: "→ argiles.",
    note: "Zéolithe en fines plaquettes hexagonales, généralement en agrégats. Elle rend hommage au minéralogiste français Armand Lévy.",
  },
  erionite: {
    nom: "Érionite", formule: "(Na₂,K₂,Ca)₂Al₄Si₁₄O₃₆·15H₂O", famille: "Zéolithe (groupe chabazite)", durete: 3.75, densite: 2.1, stabilite: 3, swatch: "#dcd7c9",
    systeme: "hexagonal", clivage: "indistinct", eclat: "soyeux à vitreux",
    couleurs: "blanc",
    contexte: "Tufs volcaniques altérés, sédiments.",
    devient: "→ argiles.",
    note: "Cette zéolithe fibreuse est redoutable : plus cancérigène que l'amiante, elle a déclenché des épidémies de mésothéliome en Cappadoce, où des villages entiers sont construits dans le tuf à érionite. Un cas d'école en géologie médicale.",
  },
  faujasite: {
    nom: "Faujasite", formule: "(Na₂,Ca)Al₂Si₄O₁₂·8H₂O", famille: "Zéolithe (groupe chabazite)", durete: 5, densite: 1.9, stabilite: 3, swatch: "#dbd5c5",
    systeme: "cubique", clivage: "bon (octaédrique)", eclat: "vitreux",
    couleurs: "incolore, blanc, brun",
    contexte: "Cavités des basaltes (Kaiserstuhl, Allemagne).",
    devient: "→ argiles.",
    note: "Rare dans la nature, la faujasite cubique et très poreuse a pour équivalent synthétique les zéolithes X et Y, catalyseurs du craquage pétrolier dans les raffineries du globe. Son nom honore le géologue Faujas de Saint-Fond.",
  },

  // ---------- Groupe heulandite – stilbite (lamellaires) ----------
  heulandite: {
    nom: "Heulandite", formule: "(Ca,Na)₂₋₃Al₃(Al,Si)₂Si₁₃O₃₆·12H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.2, stabilite: 3, swatch: "#d8c8b0",
    systeme: "monoclinique", clivage: "parfait {010}", eclat: "nacré sur le clivage, vitreux",
    couleurs: "incolore, blanc, rouge brique",
    contexte: "On la trouve dans les cavités des basaltes du Deccan, d'Islande et des Féroé.",
    devient: "→ argiles.",
    note: "Très répandue dans les trapps basaltiques, cette zéolithe forme des cristaux tabulaires « en cercueil » au clivage nacré. Elle constitue avec la clinoptilolite, plus siliceuse, une série continue.",
  },
  clinoptilolite: {
    nom: "Clinoptilolite", formule: "(Na,K,Ca)₆(Si,Al)₃₆O₇₂·20H₂O", famille: "Zéolithe (groupe heulandite)", durete: 3.75, densite: 2.15, stabilite: 3, swatch: "#d8d2c2",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "blanc, verdâtre, rougeâtre",
    contexte: "Tufs volcaniques altérés, sédiments marins.",
    devient: "→ argiles.",
    note: "Issue de l'altération des cendres volcaniques dans l'eau, c'est la zéolithe sédimentaire la plus abondante. Très employée dans l'industrie (litières, épuration de l'eau, agriculture), elle sert aussi à décontaminer le césium radioactif après Tchernobyl et Fukushima.",
  },
  stilbite: {
    nom: "Stilbite", formule: "NaCa₄Al₉Si₂₇O₇₂·28H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.15, stabilite: 3, swatch: "#dcc9b0",
    systeme: "monoclinique", clivage: "parfait {010}", eclat: "nacré à vitreux",
    couleurs: "blanc, jaune, rose saumon",
    contexte: "Cavités des basaltes (Deccan).",
    devient: "→ argiles.",
    note: "Caractérisée par ses gerbes ou ses « nœuds papillon », faisceaux de lamelles étranglés au milieu, cette zéolithe est souvent d'un rose saumon. Elle figure parmi les plus recherchées des collectionneurs.",
  },
  stellerite: {
    nom: "Stellérite", formule: "Ca₄Al₈Si₂₈O₇₂·28H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.15, stabilite: 3, swatch: "#dcd5c3",
    systeme: "orthorhombique", clivage: "parfait", eclat: "nacré à vitreux",
    couleurs: "incolore, blanc, orangé",
    contexte: "Cavités des basaltes.",
    devient: "→ argiles.",
    note: "Pôle calcique pur de la série de la stilbite, en éventails ou en sphérules, la stellérite rend hommage au naturaliste Georg Steller.",
  },
  barrerite: {
    nom: "Barrérite", formule: "Na₂Ca₂Al₆Si₃₀O₇₂·26H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.1, stabilite: 3, swatch: "#dcd6c6",
    systeme: "orthorhombique", clivage: "parfait", eclat: "nacré",
    couleurs: "blanc, rosé",
    contexte: "Cavités des basaltes (Sardaigne).",
    devient: "→ argiles.",
    note: "Décrite en Sardaigne, cette zéolithe sodique rare appartient au groupe de la stilbite. Son nom rend hommage à Richard Barrer, pionnier de la science des zéolithes synthétiques.",
  },
  brewsterite: {
    nom: "Brewstérite", formule: "(Sr,Ba)Al₂Si₆O₁₆·5H₂O", famille: "Zéolithe (groupe heulandite)", durete: 5, densite: 2.4, stabilite: 3, swatch: "#dcd6c7",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, jaune",
    contexte: "Veines et cavités hydrothermales.",
    devient: "→ argiles.",
    note: "Rare zéolithe au strontium et au baryum, en petits cristaux prismatiques. Elle rend hommage au physicien David Brewster, inventeur du kaléidoscope.",
  },
  epistilbite: {
    nom: "Épistilbite", formule: "CaAl₂Si₆O₁₆·5H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.25, stabilite: 3, swatch: "#dcd5c5",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, rose",
    contexte: "On la rencontre dans les cavités des basaltes et de certains granites.",
    devient: "→ argiles.",
    note: "Zéolithe calcique formant des agrégats de petits prismes maclés, dont le nom, « sur la stilbite », rappelle la parenté avec cette espèce.",
  },

  // ---------- Autres zéolithes ----------
  laumontite: {
    nom: "Laumontite", formule: "CaAl₂Si₄O₁₂·4H₂O", famille: "Zéolithe", durete: 3.75, densite: 2.3, stabilite: 3, swatch: "#dccec0",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "blanc, rose, rouge",
    contexte: "On les observe dans les veines et les cavités issues du métamorphisme de très bas degré, dans le faciès zéolithe.",
    devient: "→ argiles ; s'effrite en séchant.",
    note: "Zéolithe en prismes obliques, blanche à rose. À l'air libre, elle perd son eau et se réduit en poudre (la « leonhardite »), ce qui complique la conservation des spécimens. Elle définit le faciès zéolithe, premier stade du métamorphisme.",
  },
  phillipsite: {
    nom: "Phillipsite", formule: "(K,Na,Ca)₁₋₂(Si,Al)₈O₁₆·6H₂O", famille: "Zéolithe", durete: 4.25, densite: 2.2, stabilite: 3, swatch: "#dcd6c6",
    systeme: "monoclinique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, rougeâtre",
    contexte: "Cavités des basaltes et sédiments marins profonds.",
    devient: "→ argiles.",
    note: "Cristaux maclés en croix ou en pavés, cette zéolithe tapisse de vastes étendues des fonds océaniques. Elle précipite lentement à partir des cendres volcaniques : à l'échelle des sédiments abyssaux, c'est l'une des plus abondantes de la planète.",
  },
  harmotome: {
    nom: "Harmotome", formule: "(Ba,K)₁₋₂(Si,Al)₈O₁₆·6H₂O", famille: "Zéolithe", durete: 4.25, densite: 2.45, stabilite: 3, swatch: "#dcd6c7",
    systeme: "monoclinique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, gris, rouge",
    contexte: "Veines hydrothermales métallifères, avec la galène et la barytine.",
    devient: "→ argiles.",
    note: "Au contraire de la plupart des zéolithes, issues des laves, cette espèce au baryum se forme dans les filons métallifères hydrothermaux, où elle développe des cristaux maclés en croix caractéristiques.",
  },
  amicite: {
    nom: "Amicite", formule: "K₄Na₄Al₈Si₈O₃₂·10H₂O", famille: "Zéolithe", durete: 4, densite: 2.2, stabilite: 3, swatch: "#dcd7c9",
    systeme: "monoclinique", clivage: "indistinct", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "Veines des roches alcalines d'Écosse et d'Allemagne.",
    devient: "→ argiles.",
    note: "Rare zéolithe sodi-potassique du groupe de la gismondine. Elle rend hommage au physicien italien Giovanni Amici, qui perfectionna le microscope.",
  },
  pollucite: {
    nom: "Pollucite", formule: "(Cs,Na)₂Al₂Si₄O₁₂·2H₂O", famille: "Zéolithe", durete: 6.75, densite: 2.9, stabilite: 4, swatch: "#dcd6c6",
    systeme: "cubique", clivage: "aucun", eclat: "vitreux à gras",
    couleurs: "incolore, blanc, rose, gris",
    contexte: "On la rencontre dans les pegmatites à lithium et à césium de Bernic Lake (Canada) et de l'île d'Elbe.",
    devient: "→ argiles + césium.",
    note: "Dure et compacte, cette zéolithe du césium ne ressemble en rien à ses cousines fibreuses. Principal minerai de cet élément rare, elle sert notamment dans les fluides de forage et les horloges atomiques ; le gisement de Bernic Lake, au Manitoba, en concentre l'essentiel des réserves mondiales.",
  },
  hsianghualite: {
    nom: "Hsianghualite", formule: "Ca₃Li₂Be₃(SiO₄)₃F₂", famille: "Zéolithe", durete: 6.5, densite: 2.95, stabilite: 4, swatch: "#dcd7c9",
    systeme: "cubique", clivage: "indistinct", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "Skarns à lithium et à béryllium du Hunan, en Chine.",
    devient: "→ argiles.",
    note: "Rare zéolithe (de structure analcime) au lithium et au béryllium, décrite en Chine, à Hsiang-hua-ling, qui lui a donné son nom. Par sa charpente ouverte, elle se situe à la frontière des zéolithes.",
  },
});

// ================= Sous-familles =================

const TECTO_F_SOUS_FAMILLES = [
  {
    nom: "Silice : polymorphes de SiO₂",
    formule: "SiO₂",
    note: "Le quartz, charpente 3D sans cation étranger, domine en surface. Ses polymorphes de haute température, tridymite et cristobalite, apparaissent dans les laves ; ses formes de haute pression, coésite et stishovite, trahissent les impacts et les subductions ultra-profondes. La calcédoine et l'opale, à faible cristallinité, complètent la famille.",
    mineraux: ["quartz", "calcedoine", "opale", "tridymite", "cristobalite", "moganite", "coesite", "stishovite", "seifertite", "melanophlogite"],
  },
  {
    nom: "Feldspaths alcalins (K, Ba)",
    formule: "(K,Na,Ba)AlSi₃O₈",
    note: "Trois visages du feldspath potassique (sanidine, orthose, microcline) selon la température, le pôle sodique (anorthose) et les feldspaths du baryum (celsiane, hyalophane) appartiennent à ces feldspaths à gros cation faiblement lié. Avec le quartz, ils forment l'essentiel de la croûte.",
    mineraux: ["orthose", "microcline", "sanidine", "anorthose", "celsiane", "hyalophane", "buddingtonite"],
  },
  {
    nom: "Feldspaths plagioclases (série Na → Ca)",
    formule: "NaAlSi₃O₈ ⇄ CaAl₂Si₂O₈",
    note: "La série continue, de l'albite à l'anorthite, compte six jalons nommés d'après leur proportion d'anorthite. Plus ils sont calciques, plus ils s'altèrent vite (série de Goldich). La labradorite y ajoute ses reflets bleus ; la fiche « Plagioclases » en donne la vue d'ensemble, et voici les pôles.",
    mineraux: ["plagioclases", "albite", "oligoclase", "andesine", "labradorite", "bytownite", "anorthite"],
  },
  {
    nom: "Feldspathoïdes",
    formule: "charpente pauvre en silice + Cl, SO₄, CO₃…",
    note: "Ces feldspathoïdes, trop pauvres en silice pour coexister avec le quartz, naissent des magmas alcalins. Leurs cages accueillent des anions variés, à l'origine des bleus intenses de la sodalite, de l'haüyne et de la lazurite (le lapis-lazuli), ainsi que du groupe carbonaté de la cancrinite.",
    mineraux: ["nepheline", "leucite", "kalsilite", "sodalite", "hauyne", "noseane", "lazurite", "cancrinite", "davyne", "vishnevite", "afghanite", "tugtupite"],
  },
  {
    nom: "Scapolites (série)",
    formule: "(Na,Ca)₄(Al,Si)₁₂O₂₄(Cl,CO₃,SO₄)",
    note: "Série voisine des feldspaths, allant du pôle sodique et chloruré (marialite) au pôle calcique et carbonaté (méionite), auxquels s'ajoute un membre sulfaté (silvialite). Leurs canaux piègent Cl, CO₃ ou SO₄. Elle se rencontre dans les marbres et les skarns.",
    mineraux: ["marialite", "meionite", "silvialite"],
  },
  {
    nom: "Autres charpentes",
    formule: "borosilicates, silicates de lithium…",
    note: "Quelques charpentes 3D à chimie inhabituelle méritent d'être citées : le borosilicate danburite, prisé en gemmologie, et les tectosilicates de lithium des pegmatites, la pétalite, où fut découvert le lithium, et l'eucryptite des vitrocéramiques.",
    mineraux: ["danburite", "petalite", "eucryptite", "leifite"],
  },
];

const TECTO_G_SOUS_FAMILLES = [
  {
    nom: "Zéolithes fibreuses",
    formule: "charpente + canaux ; habitus en aiguilles",
    note: "Ces zéolithes ont une charpente organisée en chaînes, d'où leur habitus en aiguilles rayonnantes. La série natrolite (Na), mésolite, scolécite (Ca) constitue la plus classique des géodes de basalte.",
    mineraux: ["natrolite", "mesolite", "scolecite", "thomsonite", "gonnardite", "edingtonite"],
  },
  {
    nom: "Groupe de la chabazite",
    formule: "charpente à larges cages",
    note: "Ces charpentes à grandes cages forment d'excellents tamis moléculaires, dont la faujasite, mère des catalyseurs de raffinerie. L'érionite fibreuse, plus cancérigène que l'amiante, en fait partie aussi.",
    mineraux: ["chabazite", "levyne", "erionite", "faujasite"],
  },
  {
    nom: "Groupe heulandite-stilbite",
    formule: "charpente lamellaire",
    note: "Au clivage nacré, les zéolithes en feuillets prennent la forme de tablettes ou de gerbes, dites « nœuds papillon » pour la stilbite. La clinoptilolite, sa cousine sédimentaire, est la zéolithe la plus exploitée au monde.",
    mineraux: ["heulandite", "clinoptilolite", "stilbite", "stellerite", "barrerite", "brewsterite", "epistilbite"],
  },
  {
    nom: "Autres zéolithes",
    formule: "charpentes diverses",
    note: "Dans ce lot figurent l'analcime, à la frontière des feldspathoïdes, la laumontite, repère du métamorphisme le plus faible, la phillipsite des abysses et la pollucite, minerai du césium des pegmatites.",
    mineraux: ["analcime", "laumontite", "phillipsite", "harmotome", "amicite", "pollucite", "hsianghualite"],
  },
];

// On accroche les sous-familles aux DEUX groupes (IX.F et IX.G)
(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const tecto = silicates.groupes.find((g) => g.nom.startsWith("Tectosilicates"));
  tecto.sousGroupes = TECTO_F_SOUS_FAMILLES;
  tecto.mineraux = TECTO_F_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);

  const zeo = silicates.groupes.find((g) => g.nom.startsWith("Zéolithes"));
  zeo.sousGroupes = TECTO_G_SOUS_FAMILLES;
  zeo.mineraux = TECTO_G_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
})();
