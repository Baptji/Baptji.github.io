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
    nom: "Tridymite", formule: "SiO₂", famille: "Tectosilicate — silice", durete: 7, densite: 2.27, stabilite: 9, swatch: "#e4e0d5",
    systeme: "orthorhombique (basse T)", clivage: "médiocre", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "Cavités des laves felsiques (rhyolites, obsidiennes) ; météorites.",
    devient: "Se réordonne en quartz ; sinon reste silice.",
    note: "Le polymorphe de haute température de la silice (stable de 870 à 1470 °C), en fines plaquettes hexagonales souvent maclées en triplets — d'où son nom (grec « trois »). On la trouve dans les cavités des laves acides et dans certaines météorites.",
  },
  cristobalite: {
    nom: "Cristobalite", formule: "SiO₂", famille: "Tectosilicate — silice", durete: 6.5, densite: 2.33, stabilite: 9, swatch: "#e6e2d8",
    systeme: "quadratique (basse T)", clivage: "aucun", eclat: "vitreux",
    couleurs: "blanc, incolore, laiteux",
    contexte: "Sphérules blanches des rhyolites et obsidiennes ; terres de diatomées grillées.",
    devient: "Se réordonne en quartz.",
    note: "Le polymorphe de plus haute température stable à pression ordinaire (au-delà de 1470 °C). De petites sphérules blanches — les « flocons » de l'obsidienne floconneuse. Sa poudre est un risque de silicose reconnu.",
  },
  moganite: {
    nom: "Moganite", formule: "SiO₂", famille: "Tectosilicate — silice", durete: 6, densite: 2.5, stabilite: 9, swatch: "#cfc7b5",
    systeme: "monoclinique", clivage: "aucun", eclat: "vitreux à cireux",
    couleurs: "gris, blanc",
    contexte: "Entremêlée à la calcédoine dans les silicifications, surtout en milieu aride (pluie < 20 % de l'ETP).",
    devient: "→ silice.",
    note: "Un polymorphe monoclinique de la silice, longtemps confondu avec la calcédoine avec laquelle il s'entrecroise intimement à l'échelle du micron. Reconnu espèce distincte seulement en 1999. Fréquent dans les évaporites silicifiées des déserts.",
  },
  coesite: {
    nom: "Coésite", formule: "SiO₂", famille: "Tectosilicate — silice", durete: 7.5, densite: 2.92, stabilite: 9, swatch: "#d8d0c0",
    systeme: "monoclinique", clivage: "aucun", eclat: "vitreux",
    couleurs: "incolore",
    contexte: "Roches de très haute pression (éclogites à coésite) et cratères d'impact.",
    devient: "Se rétromorphose en quartz à basse pression.",
    note: "La silice de haute pression, plus dense que le quartz. Sa présence dans une roche a deux causes possibles, toutes deux extrêmes : une subduction ultra-profonde (plus de 90 km) ou un impact météoritique. Synthétisée en 1953, puis découverte au Meteor Crater. Un marqueur-clé des chocs et de l'UHP.",
  },
  stishovite: {
    nom: "Stishovite", formule: "SiO₂", famille: "Tectosilicate — silice", durete: 9.5, densite: 4.29, stabilite: 9, swatch: "#cfc8bc",
    systeme: "quadratique (type rutile)", clivage: "imparfait", eclat: "vitreux",
    couleurs: "incolore",
    contexte: "Cratères d'impact météoritique (choc extrême > 10 GPa).",
    devient: "Se rétromorphose en quartz.",
    note: "La silice de choc extrême : si comprimée que le silicium y est entouré de SIX oxygènes au lieu de quatre — densité 4,3, dureté proche du corindon. Elle ne se forme qu'à plus de 10 gigapascals : la trouver dans une roche est une preuve quasi certaine d'impact météoritique (Meteor Crater, Ries).",
  },
  seifertite: {
    nom: "Seifertite", formule: "SiO₂", famille: "Tectosilicate — silice", durete: 8, densite: 4.1, stabilite: 9, swatch: "#cdc6ba",
    systeme: "orthorhombique", clivage: "indéterminé", eclat: "vitreux",
    couleurs: "incolore",
    contexte: "Météorites martiennes et lunaires fortement choquées.",
    devient: "→ silice.",
    note: "Une silice de très haute pression encore plus dense, décrite en 2008 dans des météorites choquées. Elle témoigne de pressions de choc colossales, au-delà même de celles de la stishovite.",
  },
  melanophlogite: {
    nom: "Mélanophlogite", formule: "SiO₂ (clathrate)", famille: "Tectosilicate — silice", durete: 6.5, densite: 2.0, stabilite: 8, swatch: "#e0dccb",
    systeme: "cubique", clivage: "aucun", eclat: "vitreux",
    couleurs: "incolore, jaunâtre, brun",
    contexte: "Associée au soufre dans les gisements sédimentaires (Sicile, Toscane).",
    devient: "→ silice.",
    note: "Une silice « clathrate » : sa charpente forme des cages qui emprisonnent des molécules de gaz (méthane, CO₂, azote) — l'analogue minéral des hydrates de gaz. Rare, elle se forme à basse température, associée au soufre et à la matière organique.",
  },

  // ---------- Feldspaths alcalins (K, Ba) ----------
  anorthose: {
    nom: "Anorthose (anorthoclase)", formule: "(Na,K)AlSi₃O₈", famille: "Tectosilicate — feldspath alcalin", durete: 6, densite: 2.58, stabilite: 6, swatch: "#ddd8cd",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "incolore, blanc, gris ; irisations (pierre de lune)",
    contexte: "Laves sodiques : trachytes, phonolites, larvikite.",
    devient: "Hydrolyse → argiles + Na⁺/K⁺.",
    note: "Feldspath alcalin riche en sodium, à mi-chemin entre sanidine et albite. Ses grands cristaux irisés font la « pierre de lune » de certaines laves ; le volcan Erebus, en Antarctique, en crache de superbes exemplaires dans ses bombes.",
  },
  celsiane: {
    nom: "Celsiane", formule: "BaAl₂Si₂O₈", famille: "Tectosilicate — feldspath alcalin", durete: 6.25, densite: 3.4, stabilite: 6, swatch: "#dcd6c8",
    systeme: "monoclinique", clivage: "bon {001} et {010}", eclat: "vitreux",
    couleurs: "incolore, blanc, jaune",
    contexte: "Gisements métamorphiques de manganèse et de baryum.",
    devient: "→ argiles.",
    note: "Le feldspath du baryum, le plus dense de la famille. Rare, il naît dans les roches métamorphiques riches en Ba et Mn et forme une série avec l'orthose, via l'hyalophane. Nommé d'après l'astronome Anders Celsius.",
  },
  hyalophane: {
    nom: "Hyalophane", formule: "(K,Ba)Al(Si,Al)₃O₈", famille: "Tectosilicate — feldspath alcalin", durete: 6.25, densite: 2.8, stabilite: 6, swatch: "#ddd7c9",
    systeme: "monoclinique", clivage: "bon {001} et {010}", eclat: "vitreux",
    couleurs: "incolore, blanc, jaune pâle, rose",
    contexte: "Gisements de manganèse et dolomies métamorphiques (Suède, Bosnie).",
    devient: "→ argiles.",
    note: "Le feldspath intermédiaire entre l'orthose (potassium) et la celsiane (baryum). Son nom, du grec « qui paraît vitreux », décrit sa limpidité. Des gisements métamorphiques de manganèse.",
  },
  buddingtonite: {
    nom: "Buddingtonite", formule: "(NH₄)AlSi₃O₈·½H₂O", famille: "Tectosilicate — feldspath alcalin", durete: 5.5, densite: 2.38, stabilite: 5, swatch: "#ddd8cc",
    systeme: "monoclinique", clivage: "bon {001}", eclat: "vitreux",
    couleurs: "blanc, incolore",
    contexte: "Altération hydrothermale de milieux riches en matière organique (systèmes géothermaux, gisements d'or).",
    devient: "→ argiles.",
    note: "Un feldspath étonnant : l'ion ammonium (NH₄⁺) y remplace le potassium — un « feldspath organique ». Il se forme là où des fluides chargés de matière organique altèrent la roche, et sert d'indice dans l'exploration de l'or au Nevada.",
  },

  // ---------- Feldspaths plagioclases (série Na → Ca) ----------
  albite: {
    nom: "Albite", formule: "NaAlSi₃O₈", famille: "Tectosilicate — feldspath plagioclase", durete: 6.25, densite: 2.62, stabilite: 6, swatch: "#e0dcd0",
    systeme: "triclinique", clivage: "parfait {001} et {010} à ~94°", eclat: "vitreux à nacré",
    couleurs: "blanc, incolore, bleuté (péristérite)",
    contexte: "Granites, pegmatites, albitites, roches métamorphiques de bas degré.",
    devient: "Hydrolyse → kaolinite/smectite + Na⁺.",
    note: "Le pôle sodique des plagioclases (Ab₁₀₀), aussi un feldspath alcalin de basse température. Sa variété claire et lamellaire des pegmatites est la cléavelandite ; sa variété nacrée irisée, la péristérite. Ses macles fines et parallèles trahissent le plagioclase au microscope.",
  },
  oligoclase: {
    nom: "Oligoclase", formule: "(Na,Ca)(Al,Si)₄O₈ — Ab₉₀₋₇₀", famille: "Tectosilicate — feldspath plagioclase", durete: 6.25, densite: 2.65, stabilite: 5, swatch: "#dcd8cc",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, verdâtre ; scintillements (pierre de soleil)",
    contexte: "Granites, syénites, gneiss.",
    devient: "→ argiles.",
    note: "Plagioclase sodique intermédiaire (10 à 30 % d'anorthite). Sa variété criblée d'inclusions d'hématite qui accrochent la lumière est la pierre de soleil (héliolite).",
  },
  andesine: {
    nom: "Andésine", formule: "(Na,Ca)(Al,Si)₄O₈ — Ab₇₀₋₅₀", famille: "Tectosilicate — feldspath plagioclase", durete: 6.25, densite: 2.67, stabilite: 5, swatch: "#d8d2c4",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, rosé",
    contexte: "Andésites et diorites (roches intermédiaires des zones de subduction).",
    devient: "→ argiles.",
    note: "Plagioclase intermédiaire (30 à 50 % d'anorthite), qui donne son nom aux andésites — les laves de la cordillère des Andes, typiques des volcans de subduction.",
  },
  labradorite: {
    nom: "Labradorite", formule: "(Ca,Na)(Al,Si)₄O₈ — Ab₅₀₋₃₀", famille: "Tectosilicate — feldspath plagioclase", durete: 6.25, densite: 2.69, stabilite: 4, swatch: "#4a5a6a",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "gris à noir, avec des éclairs bleus, verts, dorés (labradorescence)",
    contexte: "Gabbros, basaltes, anorthosites (Labrador, Finlande).",
    devient: "→ argiles.",
    note: "Plagioclase calcique intermédiaire (50 à 70 % d'anorthite). Sa labradorescence — des reflets bleus et verts métalliques nés de lamelles d'exsolution microscopiques — en fait une gemme et une pierre ornementale recherchées (la spectrolite finlandaise).",
  },
  bytownite: {
    nom: "Bytownite", formule: "(Ca,Na)(Al,Si)₄O₈ — Ab₃₀₋₁₀", famille: "Tectosilicate — feldspath plagioclase", durete: 6.25, densite: 2.72, stabilite: 4, swatch: "#d6d0c0",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, jaunâtre",
    contexte: "Gabbros et roches basiques.",
    devient: "→ argiles rapidement.",
    note: "Plagioclase très calcique (70 à 90 % d'anorthite), parfois taillé en gemme jaune paille. Nommé d'après Bytown, l'ancien nom d'Ottawa.",
  },
  anorthite: {
    nom: "Anorthite", formule: "CaAl₂Si₂O₈", famille: "Tectosilicate — feldspath plagioclase", durete: 6.25, densite: 2.76, stabilite: 3, swatch: "#d4cec0",
    systeme: "triclinique", clivage: "parfait {001} et {010}", eclat: "vitreux",
    couleurs: "blanc, gris, incolore",
    contexte: "Roches basiques et ultrabasiques, skarns, basaltes lunaires.",
    devient: "→ smectites/kaolinite très vite (haut dans la série de Goldich).",
    note: "Le pôle calcique (An₁₀₀), le plus vulnérable des feldspaths à l'altération. Elle domine les hautes terres claires de la Lune, faites d'anorthosite — la première croûte lunaire, flottant sur l'océan de magma primitif.",
  },

  // ---------- Feldspathoïdes (« feldspaths sans assez de silice ») ----------
  kalsilite: {
    nom: "Kalsilite", formule: "KAlSiO₄", famille: "Tectosilicate — feldspathoïde", durete: 6, densite: 2.6, stabilite: 2, swatch: "#d6d0c2",
    systeme: "hexagonal", clivage: "imparfait", eclat: "vitreux",
    couleurs: "incolore, gris, blanc",
    contexte: "Laves ultrapotassiques (kamafugites d'Ouganda, Latium).",
    devient: "→ argiles + K⁺.",
    note: "Le pôle potassique de la néphéline. On la trouve dans des laves extraordinairement pauvres en silice et riches en potassium, les kamafugites du rift est-africain, souvent en intercroissance avec la néphéline.",
  },
  sodalite: {
    nom: "Sodalite", formule: "Na₈(AlSiO₄)₆Cl₂", famille: "Tectosilicate — feldspathoïde", durete: 5.75, densite: 2.3, stabilite: 3, swatch: "#2f4a9a",
    systeme: "cubique", clivage: "médiocre", eclat: "vitreux à gras",
    couleurs: "bleu royal, gris, blanc, rose (hackmanite)",
    contexte: "Syénites néphéliniques et phonolites (Groenland, Canada).",
    devient: "→ zéolithes + argiles.",
    note: "Feldspathoïde bleu roi chloruré, taillé en pierre ornementale. Sa variété hackmanite est ténébrescente : elle rosit sous UV puis pâlit à la lumière, un changement réversible spectaculaire. C'est l'un des minéraux du lapis-lazuli.",
  },
  hauyne: {
    nom: "Haüyne", formule: "Na₃Ca(Al₃Si₃O₁₂)(SO₄)", famille: "Tectosilicate — feldspathoïde", durete: 5.75, densite: 2.5, stabilite: 3, swatch: "#2f6ac0",
    systeme: "cubique", clivage: "médiocre", eclat: "vitreux à gras",
    couleurs: "bleu vif, bleu-vert",
    contexte: "Phonolites et laves alcalines (Eifel, Vésuve, Auvergne).",
    devient: "→ zéolithes + argiles.",
    note: "Feldspathoïde sulfaté d'un bleu intense, qui teinte les phonolites et les « laves bleues » d'Auvergne. Nommée d'après René Just Haüy, le fondateur de la cristallographie. Composant du lapis-lazuli.",
  },
  noseane: {
    nom: "Noséane", formule: "Na₈(Al₆Si₆O₂₄)(SO₄)·H₂O", famille: "Tectosilicate — feldspathoïde", durete: 5.75, densite: 2.35, stabilite: 3, swatch: "#6a7a9a",
    systeme: "cubique", clivage: "médiocre", eclat: "vitreux à gras",
    couleurs: "gris, bleuté, brun",
    contexte: "Phonolites et laves alcalines pauvres en silice (Eifel).",
    devient: "→ zéolithes + argiles.",
    note: "Proche de la haüyne mais sans calcium, et plus terne — grise à bleutée. Membre du groupe de la sodalite, des laves alcalines. Nommée d'après le minéralogiste K. W. Nose.",
  },
  lazurite: {
    nom: "Lazurite", formule: "Na₇Ca(Al₆Si₆O₂₄)(SO₄)(S₃)", famille: "Tectosilicate — feldspathoïde", durete: 5.25, densite: 2.4, stabilite: 3, swatch: "#26409a",
    systeme: "cubique", clivage: "imparfait", eclat: "vitreux à gras",
    couleurs: "bleu outremer intense",
    contexte: "Marbres métamorphisés au contact (Badakhshan, Afghanistan ; lac Baïkal ; Chili).",
    devient: "→ argiles.",
    note: "LE minéral du lapis-lazuli, le bleu outremer des sarcophages égyptiens et des Vierges de la Renaissance : broyé, il donnait un pigment plus cher que l'or. Sa couleur vient d'ions soufre (S₃⁻) piégés dans la charpente. On l'extrait depuis 7 000 ans des mines de Sar-e-Sang, en Afghanistan.",
  },
  cancrinite: {
    nom: "Cancrinite", formule: "Na₆Ca₂(Al₆Si₆O₂₄)(CO₃)₂·2H₂O", famille: "Tectosilicate — feldspathoïde", durete: 5.25, densite: 2.45, stabilite: 3, swatch: "#d8a84a",
    systeme: "hexagonal", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "jaune vif, orange, blanc, bleu",
    contexte: "Syénites néphéliniques (Kola, Canada, Oural).",
    devient: "→ zéolithes + argiles.",
    note: "Feldspathoïde carbonaté, souvent jaune vif ou orangé, des roches alcalines. Chef de file d'un groupe (avec davyne, vishnévite, afghanite) dont les membres se distinguent par l'anion piégé dans les canaux — carbonate, sulfate ou chlorure.",
  },
  davyne: {
    nom: "Davyne", formule: "(Na,K)₆Ca₂(Al₆Si₆O₂₄)Cl₂(SO₄)", famille: "Tectosilicate — feldspathoïde", durete: 5.5, densite: 2.5, stabilite: 3, swatch: "#d4cdbb",
    systeme: "hexagonal", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, gris",
    contexte: "Blocs volcaniques éjectés (Vésuve, Monte Somma).",
    devient: "→ argiles.",
    note: "Membre chloruré et sulfaté du groupe de la cancrinite, décrit dans les blocs rejetés par le Vésuve. Nommée d'après le chimiste Humphry Davy.",
  },
  vishnevite: {
    nom: "Vishnévite", formule: "Na₈(Al₆Si₆O₂₄)(SO₄)·2H₂O", famille: "Tectosilicate — feldspathoïde", durete: 5.5, densite: 2.35, stabilite: 3, swatch: "#7a8aaa",
    systeme: "hexagonal", clivage: "bon", eclat: "vitreux",
    couleurs: "bleu, gris, blanc",
    contexte: "Syénites néphéliniques (monts Vishnevye, Oural).",
    devient: "→ argiles.",
    note: "Le membre sulfaté et hydraté du groupe de la cancrinite, souvent bleuté. Nommée d'après les monts Vishnevye, dans l'Oural, sa localité type.",
  },
  afghanite: {
    nom: "Afghanite", formule: "(Na,K)₂₂Ca₁₀(Si₂₄Al₂₄O₉₆)(SO₄)₆Cl₆", famille: "Tectosilicate — feldspathoïde", durete: 5.75, densite: 2.55, stabilite: 3, swatch: "#4a7ac0",
    systeme: "hexagonal", clivage: "parfait", eclat: "vitreux",
    couleurs: "bleu ciel",
    contexte: "Marbres à lapis-lazuli (Sar-e-Sang, Afghanistan).",
    devient: "→ argiles.",
    note: "Feldspathoïde bleu ciel du groupe de la cancrinite, décrit dans les gisements de lapis-lazuli d'Afghanistan — d'où son nom. Elle accompagne la lazurite dans les marbres bleus.",
  },
  tugtupite: {
    nom: "Tugtupite", formule: "Na₄BeAlSi₄O₁₂Cl", famille: "Tectosilicate — feldspathoïde", durete: 6.25, densite: 2.4, stabilite: 3, swatch: "#d06a8a",
    systeme: "quadratique", clivage: "bon", eclat: "vitreux",
    couleurs: "rose à rouge cramoisi (ténébrescent)",
    contexte: "Pegmatites alcalines d'Ilímaussaq (Groenland).",
    devient: "→ argiles.",
    note: "Un feldspathoïde au béryllium, rose à rouge et ténébrescent comme la hackmanite : il pâlit à l'obscurité et rougit au soleil ou sous UV. Trouvé presque exclusivement à Tugtup, au Groenland — son nom inuit signifie « roche du renne ».",
  },

  // ---------- Scapolites (série) ----------
  marialite: {
    nom: "Marialite", formule: "Na₄(Al₃Si₉O₂₄)Cl", famille: "Tectosilicate — scapolite", durete: 6, densite: 2.55, stabilite: 4, swatch: "#ddd6c6",
    systeme: "quadratique", clivage: "bon {100} et {110}", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, rose, jaune",
    contexte: "Marbres et skarns métasomatiques.",
    devient: "→ argiles.",
    note: "Le pôle sodique et chloruré des scapolites — une charpente proche des feldspaths, mais dont les canaux accueillent Cl, CO₃ ou SO₄. Des marbres et skarns ; parfois gemme jaune, fortement fluorescente.",
  },
  meionite: {
    nom: "Méionite", formule: "Ca₄(Al₆Si₆O₂₄)(CO₃)", famille: "Tectosilicate — scapolite", durete: 6, densite: 2.7, stabilite: 4, swatch: "#d8d1c1",
    systeme: "quadratique", clivage: "bon {100} et {110}", eclat: "vitreux",
    couleurs: "blanc, gris, incolore",
    contexte: "Marbres métamorphiques, skarns, éjecta du Vésuve.",
    devient: "→ argiles + calcite.",
    note: "Le pôle calcique et carbonaté des scapolites. Son nom vient du grec meíon (« moindre »), pour ses cristaux à pyramides basses. Des roches calciques métamorphisées.",
  },
  silvialite: {
    nom: "Silvialite", formule: "Ca₃Na(Al₅Si₇O₂₄)(SO₄)", famille: "Tectosilicate — scapolite", durete: 6, densite: 2.6, stabilite: 4, swatch: "#d4cdbd",
    systeme: "quadratique", clivage: "bon", eclat: "vitreux",
    couleurs: "gris, blanc",
    contexte: "Xénolites granulitiques du manteau profond.",
    devient: "→ argiles.",
    note: "Le membre sulfaté des scapolites, rare, décrit dans des enclaves granulitiques remontées du manteau. Il complète la série par l'anion SO₄.",
  },

  // ---------- Autres charpentes ----------
  danburite: {
    nom: "Danburite", formule: "CaB₂Si₂O₈", famille: "Tectosilicate — borosilicate", durete: 7.25, densite: 3.0, stabilite: 6, swatch: "#e0dccb",
    systeme: "orthorhombique", clivage: "imparfait", eclat: "vitreux à gras",
    couleurs: "incolore, jaune paille, rose",
    contexte: "Skarns, dolomies métamorphiques, pegmatites (Charcas au Mexique, Birmanie).",
    devient: "→ argiles + bore en solution.",
    note: "Un borosilicate à charpente 3D, structuralement proche des feldspaths mais où le bore accompagne le silicium. Souvent taillé en gemme incolore ou jaune. Nommé d'après Danbury, dans le Connecticut.",
  },
  petalite: {
    nom: "Pétalite", formule: "LiAlSi₄O₁₀", famille: "Tectosilicate — divers", durete: 6.25, densite: 2.4, stabilite: 5, swatch: "#ddd8cc",
    systeme: "monoclinique", clivage: "parfait {001}", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, gris, rose",
    contexte: "Pegmatites granitiques à lithium.",
    devient: "→ argiles + lithium.",
    note: "Un tectosilicate de lithium des pegmatites — et un jalon de l'histoire de la chimie : c'est en l'analysant, en 1817, qu'on découvrit le lithium. Minerai de Li ; sa gemme incolore rappelle le quartz. Chauffée, elle se change en spodumène + quartz.",
  },
  eucryptite: {
    nom: "Eucryptite", formule: "LiAlSiO₄", famille: "Tectosilicate — divers", durete: 6.5, densite: 2.67, stabilite: 5, swatch: "#dcd6c8",
    systeme: "rhomboédrique", clivage: "imparfait", eclat: "vitreux",
    couleurs: "incolore, blanc, rose",
    contexte: "Pegmatites à lithium, souvent en remplacement du spodumène.",
    devient: "→ argiles + lithium.",
    note: "Un tectosilicate de lithium (charpente « farcie » dérivée du quartz), généralement issu de l'altération du spodumène. Sa dilatation thermique quasi nulle en fait un matériau des vitrocéramiques — les plaques de cuisson. Fluorescente rose sous UV.",
  },
  leifite: {
    nom: "Leifite", formule: "Na₂(Si,Al,Be)₇O₁₄(OH)·H₂O", famille: "Tectosilicate — divers", durete: 6, densite: 2.57, stabilite: 4, swatch: "#dcd7c9",
    systeme: "rhomboédrique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, rose",
    contexte: "Pegmatites et syénites alcalines (Groenland, Kola, Mont-Saint-Hilaire).",
    devient: "→ argiles.",
    note: "Un rare tectosilicate sodi-bérylifère des roches alcalines, en fines aiguilles. Nommée d'après Leif Erikson, l'explorateur viking qui atteignit l'Amérique cinq siècles avant Colomb.",
  },

  // ================= 9.G — ZÉOLITHES (avec eau) =================

  // ---------- Zéolithes fibreuses ----------
  natrolite: {
    nom: "Natrolite", formule: "Na₂Al₂Si₃O₁₀·2H₂O", famille: "Zéolithe fibreuse", durete: 5.25, densite: 2.25, stabilite: 3, swatch: "#ddd7c8",
    systeme: "orthorhombique", clivage: "parfait", eclat: "vitreux à soyeux",
    couleurs: "incolore, blanc, rose",
    contexte: "Géodes des basaltes, syénites néphéliniques.",
    devient: "→ argiles.",
    note: "La zéolithe fibreuse la plus commune, en aiguilles rayonnantes formant des gerbes dans les cavités des basaltes. Riche en sodium (natr-). Comme toutes les zéolithes, elle perd son eau à la chaleur puis la reprend à l'air humide.",
  },
  mesolite: {
    nom: "Mésolite", formule: "Na₂Ca₂Al₆Si₉O₃₀·8H₂O", famille: "Zéolithe fibreuse", durete: 5, densite: 2.25, stabilite: 3, swatch: "#dcd6c7",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à soyeux",
    couleurs: "blanc, incolore",
    contexte: "Cavités des basaltes (Deccan, Islande).",
    devient: "→ argiles.",
    note: "Zéolithe fibreuse intermédiaire entre la natrolite (sodium) et la scolécite (calcium), en aiguilles extrêmement fines, presque cotonneuses. Le grec mésos, « au milieu », dit sa position dans la série.",
  },
  scolecite: {
    nom: "Scolécite", formule: "CaAl₂Si₃O₁₀·3H₂O", famille: "Zéolithe fibreuse", durete: 5.25, densite: 2.27, stabilite: 3, swatch: "#ddd7c9",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à soyeux",
    couleurs: "incolore, blanc",
    contexte: "Cavités et amygdales des basaltes.",
    devient: "→ argiles.",
    note: "Zéolithe fibreuse calcique, en beaux prismes rayonnants. Son nom vient du grec skṓlēx (« ver ») car ses fibres se tortillent en s'effritant sous le chalumeau. Superbes cristaux d'Inde.",
  },
  thomsonite: {
    nom: "Thomsonite", formule: "NaCa₂Al₅Si₅O₂₀·6H₂O", famille: "Zéolithe fibreuse", durete: 5.25, densite: 2.35, stabilite: 3, swatch: "#d8d2c2",
    systeme: "orthorhombique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "blanc, rose, vert, rouge",
    contexte: "Cavités des basaltes.",
    devient: "→ argiles.",
    note: "Zéolithe en sphérules rayonnantes concentriques, parfois zonées de couleurs — les « yeux de thomsonite » que l'on polit sur les rives du lac Supérieur. Nommée d'après le chimiste Thomas Thomson.",
  },
  gonnardite: {
    nom: "Gonnardite", formule: "(Na,Ca)₂(Si,Al)₅O₁₀·3H₂O", famille: "Zéolithe fibreuse", durete: 4.75, densite: 2.3, stabilite: 3, swatch: "#dcd7c8",
    systeme: "orthorhombique", clivage: "indistinct", eclat: "vitreux à soyeux",
    couleurs: "incolore, blanc",
    contexte: "Cavités des basaltes (Auvergne).",
    devient: "→ argiles.",
    note: "Zéolithe fibreuse proche de la natrolite, en petites sphérules soyeuses. Décrite en Auvergne, elle honore le minéralogiste Ferdinand Gonnard.",
  },
  edingtonite: {
    nom: "Édingtonite", formule: "BaAl₂Si₃O₁₀·4H₂O", famille: "Zéolithe fibreuse", durete: 4.25, densite: 2.75, stabilite: 3, swatch: "#dcd6c6",
    systeme: "orthorhombique / quadratique", clivage: "parfait", eclat: "vitreux",
    couleurs: "incolore, blanc, rose, gris",
    contexte: "Veines hydrothermales (Écosse).",
    devient: "→ argiles.",
    note: "Une rare zéolithe au baryum, la plus dense des fibreuses, en petits cristaux roses ou gris. Sa localité type est en Écosse.",
  },

  // ---------- Groupe de la chabazite ----------
  chabazite: {
    nom: "Chabazite", formule: "(Ca,Na₂,K₂)Al₂Si₄O₁₂·6H₂O", famille: "Zéolithe (groupe chabazite)", durete: 4.25, densite: 2.1, stabilite: 3, swatch: "#ddd6c6",
    systeme: "rhomboédrique", clivage: "médiocre", eclat: "vitreux",
    couleurs: "incolore, blanc, rose, orangé",
    contexte: "Cavités des basaltes et andésites.",
    devient: "→ argiles.",
    note: "Zéolithe en rhomboèdres pseudo-cubiques, souvent maclés. Chef de file d'un groupe dont les membres, distingués selon le cation dominant (chabazite-Ca, -Na, -K), sont des espèces à part depuis 1997. Un excellent tamis moléculaire industriel.",
  },
  levyne: {
    nom: "Lévyne", formule: "(Ca,Na₂,K₂)Al₂Si₄O₁₂·6H₂O", famille: "Zéolithe (groupe chabazite)", durete: 4.25, densite: 2.1, stabilite: 3, swatch: "#dcd6c7",
    systeme: "rhomboédrique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, jaune, rouge",
    contexte: "Cavités des basaltes, souvent avec l'offrétite.",
    devient: "→ argiles.",
    note: "Zéolithe en fines plaquettes hexagonales, généralement en agrégats. Nommée d'après le minéralogiste français Armand Lévy.",
  },
  erionite: {
    nom: "Érionite", formule: "(Na₂,K₂,Ca)₂Al₄Si₁₄O₃₆·15H₂O", famille: "Zéolithe (groupe chabazite)", durete: 3.75, densite: 2.1, stabilite: 3, swatch: "#dcd7c9",
    systeme: "hexagonal", clivage: "indistinct", eclat: "soyeux à vitreux",
    couleurs: "blanc",
    contexte: "Tufs volcaniques altérés, sédiments.",
    devient: "→ argiles.",
    note: "Zéolithe fibreuse — et redoutable : ses fibres, plus cancérigènes encore que l'amiante, provoquent des épidémies de mésothéliome en Cappadoce, où des villages entiers sont bâtis dans le tuf à érionite. Un cas d'école de géologie médicale.",
  },
  faujasite: {
    nom: "Faujasite", formule: "(Na₂,Ca)Al₂Si₄O₁₂·8H₂O", famille: "Zéolithe (groupe chabazite)", durete: 5, densite: 1.9, stabilite: 3, swatch: "#dbd5c5",
    systeme: "cubique", clivage: "bon (octaédrique)", eclat: "vitreux",
    couleurs: "incolore, blanc, brun",
    contexte: "Cavités des basaltes (Kaiserstuhl, Allemagne).",
    devient: "→ argiles.",
    note: "Zéolithe cubique très poreuse, rare à l'état naturel — mais son analogue synthétique (zéolithe X et Y) est le catalyseur roi du craquage du pétrole dans les raffineries du monde entier. Nommée d'après le géologue Faujas de Saint-Fond.",
  },

  // ---------- Groupe heulandite – stilbite (lamellaires) ----------
  heulandite: {
    nom: "Heulandite", formule: "(Ca,Na)₂₋₃Al₃(Al,Si)₂Si₁₃O₃₆·12H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.2, stabilite: 3, swatch: "#d8c8b0",
    systeme: "monoclinique", clivage: "parfait {010}", eclat: "nacré sur le clivage, vitreux",
    couleurs: "incolore, blanc, rouge brique",
    contexte: "Cavités des basaltes (Deccan, Islande, Féroé).",
    devient: "→ argiles.",
    note: "Zéolithe en cristaux tabulaires « en cercueil », au clivage nacré. Très commune dans les trapps basaltiques. Elle forme une série avec la clinoptilolite, plus siliceuse.",
  },
  clinoptilolite: {
    nom: "Clinoptilolite", formule: "(Na,K,Ca)₆(Si,Al)₃₆O₇₂·20H₂O", famille: "Zéolithe (groupe heulandite)", durete: 3.75, densite: 2.15, stabilite: 3, swatch: "#d8d2c2",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "blanc, verdâtre, rougeâtre",
    contexte: "Tufs volcaniques altérés, sédiments marins.",
    devient: "→ argiles.",
    note: "La zéolithe sédimentaire la plus abondante, née de l'altération des cendres volcaniques dans l'eau. Omniprésente dans l'industrie : litières, épuration de l'eau, agriculture — et décontamination du césium radioactif après Tchernobyl et Fukushima.",
  },
  stilbite: {
    nom: "Stilbite", formule: "NaCa₄Al₉Si₂₇O₇₂·28H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.15, stabilite: 3, swatch: "#dcc9b0",
    systeme: "monoclinique", clivage: "parfait {010}", eclat: "nacré à vitreux",
    couleurs: "blanc, jaune, rose saumon",
    contexte: "Cavités des basaltes (Deccan).",
    devient: "→ argiles.",
    note: "Zéolithe en gerbes ou en « nœuds papillon » caractéristiques — des faisceaux de lamelles étranglés au milieu — souvent d'un rose saumon. L'une des plus prisées des collectionneurs.",
  },
  stellerite: {
    nom: "Stellérite", formule: "Ca₄Al₈Si₂₈O₇₂·28H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.15, stabilite: 3, swatch: "#dcd5c3",
    systeme: "orthorhombique", clivage: "parfait", eclat: "nacré à vitreux",
    couleurs: "incolore, blanc, orangé",
    contexte: "Cavités des basaltes.",
    devient: "→ argiles.",
    note: "Le pôle calcique pur de la série de la stilbite, en éventails ou en sphérules. Nommée d'après le naturaliste Georg Steller.",
  },
  barrerite: {
    nom: "Barrérite", formule: "Na₂Ca₂Al₆Si₃₀O₇₂·26H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.1, stabilite: 3, swatch: "#dcd6c6",
    systeme: "orthorhombique", clivage: "parfait", eclat: "nacré",
    couleurs: "blanc, rosé",
    contexte: "Cavités des basaltes (Sardaigne).",
    devient: "→ argiles.",
    note: "Rare zéolithe sodique du groupe de la stilbite, décrite en Sardaigne. Nommée d'après Richard Barrer, pionnier de la science des zéolithes synthétiques.",
  },
  brewsterite: {
    nom: "Brewstérite", formule: "(Sr,Ba)Al₂Si₆O₁₆·5H₂O", famille: "Zéolithe (groupe heulandite)", durete: 5, densite: 2.4, stabilite: 3, swatch: "#dcd6c7",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, jaune",
    contexte: "Veines et cavités hydrothermales.",
    devient: "→ argiles.",
    note: "Rare zéolithe au strontium et baryum, en petits cristaux prismatiques. Nommée d'après le physicien David Brewster, l'inventeur du kaléidoscope.",
  },
  epistilbite: {
    nom: "Épistilbite", formule: "CaAl₂Si₆O₁₆·5H₂O", famille: "Zéolithe (groupe heulandite)", durete: 4, densite: 2.25, stabilite: 3, swatch: "#dcd5c5",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "incolore, blanc, rose",
    contexte: "Cavités des basaltes et de certains granites.",
    devient: "→ argiles.",
    note: "Zéolithe calcique en agrégats de petits prismes maclés. Son nom, « sur la stilbite », dit sa parenté avec cette dernière.",
  },

  // ---------- Autres zéolithes ----------
  laumontite: {
    nom: "Laumontite", formule: "CaAl₂Si₄O₁₂·4H₂O", famille: "Zéolithe", durete: 3.75, densite: 2.3, stabilite: 3, swatch: "#dccec0",
    systeme: "monoclinique", clivage: "parfait", eclat: "vitreux à nacré",
    couleurs: "blanc, rose, rouge",
    contexte: "Veines et cavités du métamorphisme de très bas degré (faciès zéolithe).",
    devient: "→ argiles ; s'effrite en séchant.",
    note: "Zéolithe en prismes obliques, blanche à rose. Elle perd son eau à l'air libre et s'effrite en poudre (la « leonhardite ») — un cauchemar de collectionneur. Elle définit le faciès zéolithe, le tout premier stade du métamorphisme.",
  },
  phillipsite: {
    nom: "Phillipsite", formule: "(K,Na,Ca)₁₋₂(Si,Al)₈O₁₆·6H₂O", famille: "Zéolithe", durete: 4.25, densite: 2.2, stabilite: 3, swatch: "#dcd6c6",
    systeme: "monoclinique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, rougeâtre",
    contexte: "Cavités des basaltes, ET sédiments marins profonds.",
    devient: "→ argiles.",
    note: "Zéolithe en cristaux maclés en croix ou en pavés. Fait remarquable : elle tapisse d'immenses étendues des fonds océaniques, précipitée lentement à partir des cendres volcaniques — c'est l'une des zéolithes les plus abondantes de la planète, à l'échelle des sédiments abyssaux.",
  },
  harmotome: {
    nom: "Harmotome", formule: "(Ba,K)₁₋₂(Si,Al)₈O₁₆·6H₂O", famille: "Zéolithe", durete: 4.25, densite: 2.45, stabilite: 3, swatch: "#dcd6c7",
    systeme: "monoclinique", clivage: "bon", eclat: "vitreux",
    couleurs: "incolore, blanc, gris, rouge",
    contexte: "Veines hydrothermales métallifères (avec galène, barytine).",
    devient: "→ argiles.",
    note: "Zéolithe au baryum, en cristaux maclés en croix caractéristiques. Contrairement à la plupart des zéolithes, nées dans les laves, elle se forme dans les filons métallifères hydrothermaux.",
  },
  amicite: {
    nom: "Amicite", formule: "K₄Na₄Al₈Si₈O₃₂·10H₂O", famille: "Zéolithe", durete: 4, densite: 2.2, stabilite: 3, swatch: "#dcd7c9",
    systeme: "monoclinique", clivage: "indistinct", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "Veines des roches alcalines (Écosse, Allemagne).",
    devient: "→ argiles.",
    note: "Rare zéolithe sodi-potassique du groupe de la gismondine. Nommée d'après le physicien italien Giovanni Amici, perfectionneur du microscope.",
  },
  pollucite: {
    nom: "Pollucite", formule: "(Cs,Na)₂Al₂Si₄O₁₂·2H₂O", famille: "Zéolithe", durete: 6.75, densite: 2.9, stabilite: 4, swatch: "#dcd6c6",
    systeme: "cubique", clivage: "aucun", eclat: "vitreux à gras",
    couleurs: "incolore, blanc, rose, gris",
    contexte: "Pegmatites à lithium et césium (Bernic Lake au Canada, île d'Elbe).",
    devient: "→ argiles + césium.",
    note: "La zéolithe du césium, et le principal minerai de cet élément rare (fluides de forage, horloges atomiques). Dure et compacte — rien à voir avec ses cousines fibreuses. Le gisement de Bernic Lake, au Manitoba, en concentre l'essentiel des réserves mondiales.",
  },
  hsianghualite: {
    nom: "Hsianghualite", formule: "Ca₃Li₂Be₃(SiO₄)₃F₂", famille: "Zéolithe", durete: 6.5, densite: 2.95, stabilite: 4, swatch: "#dcd7c9",
    systeme: "cubique", clivage: "indistinct", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "Skarns à lithium et béryllium (Hunan, Chine).",
    devient: "→ argiles.",
    note: "Une rare zéolithe (de structure analcime) au lithium et béryllium, décrite en Chine, à Hsiang-hua-ling — d'où son nom. À la frontière des zéolithes par sa charpente ouverte.",
  },
});

// ================= Sous-familles =================

const TECTO_F_SOUS_FAMILLES = [
  {
    nom: "Silice — polymorphes de SiO₂",
    formule: "SiO₂",
    note: "La charpente 3D à l'état pur, sans autre cation. Le quartz en surface ; ses polymorphes de haute température (tridymite, cristobalite) dans les laves ; et surtout ses formes de HAUTE PRESSION — coésite et stishovite — qui signent les impacts météoritiques et les subductions ultra-profondes. Plus la calcédoine et l'opale, formes de basse cristallinité.",
    mineraux: ["quartz", "calcedoine", "opale", "tridymite", "cristobalite", "moganite", "coesite", "stishovite", "seifertite", "melanophlogite"],
  },
  {
    nom: "Feldspaths alcalins (K, Ba)",
    formule: "(K,Na,Ba)AlSi₃O₈",
    note: "Les feldspaths à gros cation faiblement lié : les trois visages du feldspath potassique selon la température (sanidine, orthose, microcline), le pôle sodique (anorthose) et les feldspaths du baryum (celsiane, hyalophane). Avec le quartz, ce sont les minéraux les plus abondants de la croûte.",
    mineraux: ["orthose", "microcline", "sanidine", "anorthose", "celsiane", "hyalophane", "buddingtonite"],
  },
  {
    nom: "Feldspaths plagioclases (série Na → Ca)",
    formule: "NaAlSi₃O₈ ⇄ CaAl₂Si₂O₈",
    note: "Une série continue à six jalons, du pôle sodique (albite) au pôle calcique (anorthite), nommés selon la proportion des deux. Plus ils sont calciques, plus ils s'altèrent vite (série de Goldich). La labradorite y ajoute ses éclairs bleus. La fiche « Plagioclases » en donne la vue d'ensemble ; voici les pôles.",
    mineraux: ["plagioclases", "albite", "oligoclase", "andesine", "labradorite", "bytownite", "anorthite"],
  },
  {
    nom: "Feldspathoïdes",
    formule: "charpente pauvre en silice + Cl, SO₄, CO₃…",
    note: "Des « feldspaths sans assez de silice » : ils ne coexistent jamais avec le quartz. Nés des magmas alcalins, ils accueillent dans leurs cages des anions variés — d'où les bleus intenses (sodalite, haüyne, lazurite = le lapis-lazuli) et le groupe carbonaté de la cancrinite.",
    mineraux: ["nepheline", "leucite", "kalsilite", "sodalite", "hauyne", "noseane", "lazurite", "cancrinite", "davyne", "vishnevite", "afghanite", "tugtupite"],
  },
  {
    nom: "Scapolites (série)",
    formule: "(Na,Ca)₄(Al,Si)₁₂O₂₄(Cl,CO₃,SO₄)",
    note: "Une série proche des feldspaths, du pôle sodique-chloruré (marialite) au pôle calcique-carbonaté (méionite), plus un membre sulfaté (silvialite). Leurs canaux piègent Cl, CO₃ ou SO₄. Des marbres et des skarns.",
    mineraux: ["marialite", "meionite", "silvialite"],
  },
  {
    nom: "Autres charpentes",
    formule: "borosilicates, silicates de lithium…",
    note: "Des charpentes 3D à chimie particulière : le borosilicate danburite (gemme), et les tectosilicates de lithium des pegmatites (pétalite, sur lequel on découvrit le lithium ; eucryptite des vitrocéramiques).",
    mineraux: ["danburite", "petalite", "eucryptite", "leifite"],
  },
];

const TECTO_G_SOUS_FAMILLES = [
  {
    nom: "Zéolithes fibreuses",
    formule: "charpente + canaux ; habitus en aiguilles",
    note: "Les zéolithes dont la charpente s'organise en chaînes, d'où un habitus en aiguilles rayonnantes. La série natrolite (Na) – mésolite – scolécite (Ca) est la plus classique des géodes de basalte.",
    mineraux: ["natrolite", "mesolite", "scolecite", "thomsonite", "gonnardite", "edingtonite"],
  },
  {
    nom: "Groupe de la chabazite",
    formule: "charpente à larges cages",
    note: "Des charpentes à grandes cages, excellents tamis moléculaires — dont la faujasite, mère des catalyseurs de raffinerie. Mais aussi l'érionite fibreuse, plus cancérigène que l'amiante.",
    mineraux: ["chabazite", "levyne", "erionite", "faujasite"],
  },
  {
    nom: "Groupe heulandite – stilbite",
    formule: "charpente lamellaire",
    note: "Les zéolithes en feuillets, à clivage nacré, en cristaux tabulaires ou en gerbes (les « nœuds papillon » de la stilbite). La clinoptilolite, leur cousine sédimentaire, est la zéolithe la plus utilisée au monde.",
    mineraux: ["heulandite", "clinoptilolite", "stilbite", "stellerite", "barrerite", "brewsterite", "epistilbite"],
  },
  {
    nom: "Autres zéolithes",
    formule: "charpentes diverses",
    note: "L'analcime, à la charnière du feldspathoïde ; la laumontite qui définit le faciès métamorphique le plus faible ; la phillipsite des abysses ; et la pollucite, minerai de césium des pegmatites.",
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
