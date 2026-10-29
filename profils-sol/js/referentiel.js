// Les horizons de référence, couches, matériaux et lettres suffixes du Référentiel pédologique 2008 (AFES),
// pour la fiche légende. Droit d'auteur : le Référentiel n'est pas recopié. Les codes et les noms sont ceux
// de sa liste (pp. 1-5) ; chaque définition est REFORMULÉE et condensée, avec la page où la lire en entier.

export const source = 'Définitions reformulées et condensées d’après : Baize D., Girard M.-C. (coord.), 2009. '
  + 'Référentiel pédologique 2008. Association française pour l’étude du sol (AFES), Éditions Quæ, Versailles, 435 p. '
  + 'Les pages citées renvoient à cet ouvrage, où lire les critères complets.';

/// Horizons, couches et matériaux : code → [nom, définition, page].
export const horizons = {
  // Horizons organiques (p. 7-9)
  O: ['Horizons organiques', 'Horizons de surface formés à l’air libre, faits surtout de débris végétaux morts (feuilles, aiguilles, bois, racines fines) plus ou moins transformés par la faune et les champignons. La matière organique n’y est pas liée aux minéraux. On les divise en OL, OF et OH selon l’état des débris.', 7],
  OL: ['Litière', 'Débris de feuilles et de bois pas ou peu transformés, dont la forme d’origine se reconnaît aisément ; moins de 10 % du volume en matières organiques fines.', 8],
  OF: ['Horizon O de fragmentation', 'Débris végétaux encore reconnaissables à l’œil nu, mêlés à 10 à 70 % (en volume) de matières organiques fines ; souvent parcouru de racines fines et de mycéliums.', 8],
  OH: ['Horizon O humifié', 'Plus de 70 % du volume en matières organiques fines (boulettes fécales, micro-débris), d’aspect assez homogène, brun rougeâtre à noir ; il se place sous l’OF.', 8],
  OHta: ['Horizon OH de tangel', 'Horizon OH gras qui tache les doigts, fait de déjections de vers, décrit surtout sur roches calcaires en altitude ; il passe très progressivement à un horizon A très humifère.', 9],

  // Horizons A (p. 9-13)
  A: ['Horizons A', 'Horizon où matières organiques et minérales sont mélangées, toujours par l’activité biologique (vers, faune, racines). Il se trouve en surface ou sous un horizon O ; seul un horizon A enfoui peut s’observer en profondeur. Carbone organique indicatif : 0,5 à 17 g pour 100 g de terre fine.', 9],
  Aca: ['Horizon A calcaire', 'Horizon A grumeleux qui fait effervescence à froid à l’acide (au moins 2 % de calcaire), saturé surtout par le calcium, de pH 7,0 à 8,7 ; il contient souvent des éléments grossiers calcaires.', 12],
  Ach: ['Horizon A chernique', 'Horizon A noir ou très sombre (value humide inférieure à 3,5), riche en matières organiques très évoluées dont la teneur décroît progressivement vers le bas ; structure fine, complexe saturé surtout par le calcium.', 12],
  Aci: ['Horizon A calcique', 'Horizon A sans calcaire dans la terre fine (ou seulement par places), au complexe adsorbant saturé ou presque, où le calcium domine largement.', 12],
  Ado: ['Horizon A dolomitique', 'Horizon A carbonaté où la dolomie domine : effervescence faible ou nulle à froid, généralisée seulement à chaud.', 12],
  Ae: ['Horizon A éluvial', 'Horizon de surface à la fois humifère (A) et appauvri en fer ou en argile (E), d’ordinaire sous un horizon O et au-dessus d’un horizon E, sous forêt ou végétation spontanée.', 11],
  AG: ['Horizon A à caractères réductiques', 'Horizon de surface qui réunit les caractères d’un horizon A et ceux d’un horizon réductique G (engorgement permanent).', 13],
  Alu: ['Horizon A aluandique', 'Horizon A d’andosol où l’aluminium est surtout lié aux matières organiques ; voir le chapitre Andosols.', 77],
  Amg: ['Horizon A magnésique', 'Horizon A non carbonaté, saturé ou presque, où le magnésium rivalise avec le calcium (rapport Ca/Mg inférieur à 2).', 12],
  An: ['Horizon A d’anmoor', 'Horizon noir et épais (jusqu’à 30 cm), très riche en matières organiques, plastique et massif quand il est engorgé ; il se forme sous une nappe permanente qui fluctue peu.', 13],
  And: ['Horizon A silandique', 'Horizon A d’andosol riche en composés amorphes de silice et d’aluminium (allophanes) ; voir le chapitre Andosols.', 77],
  Aso: ['Horizon A sombrique', 'Horizon A sombre ou noir, non calcaire, très riche en matières organiques évoluées formées sous prairie ; complexe nettement désaturé (S/CEC de 50 à 80 %), pH de 5,5 à 6,5.', 13],
  Avi: ['Horizon A vitrique', 'Horizon A d’andosol riche en verres volcaniques peu altérés ; voir le chapitre Andosols.', 77],
  Av: ['Horizon A à propriétés vertiques', 'Horizon de surface très argileux, à argiles gonflantes, très actif biologiquement sous végétation naturelle ; sous culture (LAv ou Lv), sa structure devient anguleuse et se fragmente en surface en séchant.', 23],

  // Horizons labourés (p. 14)
  L: ['Horizons labourés', 'Couche travaillée par la charrue ou par un autre outil d’ameublissement profond : sa structure est artificialisée et elle reçoit amendements, engrais et traitements. Ancienne notation : Ap. Un horizon L fimique, épais de plus de 30 cm, est enrichi par des épandages répétés de fumiers.', 14],
  LA: ['Horizon labouré qui garde les caractères d’un A', 'Horizon labouré où l’on reconnaît encore nettement l’horizon A d’origine.', 14],
  LE: ['Horizon labouré dans un horizon E', 'Horizon labouré où l’on reconnaît encore nettement l’horizon éluvial E.', 14],
  LS: ['Horizon labouré dans un horizon S', 'Horizon labouré où l’on reconnaît encore nettement l’horizon structural S.', 14],
  LO: ['Horizon labouré dans un horizon O', 'Horizon labouré où l’on reconnaît encore les caractères d’un horizon organique O.', 14],
  LH: ['Horizon histique labouré', 'Tourbe très décomposée, assainie et mise en culture, à structure grumeleuse souvent fragile.', 206],
  LBT: ['Horizon BT labouré', 'Horizon BT remis en surface par l’érosion d’un sol tronqué, puis travaillé par les cultures : plus de matières organiques, structure artificialisée.', 18],
  LBP: ['Horizon BP labouré', 'Horizon BP d’un sol tronqué, atteint par le labour.', 14],

  // Horizons éluviaux (p. 14-15)
  E: ['Horizons éluviaux', 'Horizon appauvri en fer, en argile ou en aluminium, partis vers un horizon BT ou BP ou hors du sol : il est plus clair, moins argileux et moins bien structuré que l’horizon de dessous, et moins humifère que celui de surface.', 14],
  Ea: ['Horizon E albique', 'Horizon E si appauvri que sa couleur, très claire, est celle des grains de sable et de limon eux-mêmes.', 15],
  Eh: ['Horizon E humifère', 'Horizon E grisé par des matières organiques venues des horizons supérieurs.', 15],

  // Horizons structuraux (p. 15-17)
  S: ['Horizons structuraux', 'Horizon d’altération : les minéraux s’y transforment, le fer est libéré, le calcaire peut disparaître ; il en résulte une structure pédologique d’ensemble et une couleur distincte de celle de la roche. Il ne reçoit pas d’apports d’argile venus d’en haut (différence avec BT et BP).', 15],
  Sal: ['Horizon S aluminique', 'Horizon S très acide (pH inférieur à 5), où l’aluminium échangeable domine le complexe adsorbant (taux de saturation inférieur à 30 %), à fine structure microgrumeleuse.', 16],
  Sca: ['Horizon S calcaire', 'Horizon S qui fait effervescence à froid (au moins 2 % de calcaire, moins que dans l’horizon de dessous), saturé surtout par le calcium ; il contient souvent des éléments grossiers calcaires.', 15],
  Sci: ['Horizon S calcique', 'Horizon S sans calcaire dans la terre fine (ou seulement par places), saturé ou presque, où le calcium domine largement ; pH supérieur à 6,5.', 16],
  Sdo: ['Horizon S dolomitique', 'Horizon S carbonaté où la dolomie domine : effervescence faible ou nulle à froid, généralisée seulement à chaud.', 16],
  Slu: ['Horizon S aluandique', 'Horizon S d’andosol ; voir le chapitre Andosols.', 78],
  Smg: ['Horizon S magnésique', 'Horizon S non carbonaté, saturé ou presque, où le magnésium rivalise avec le calcium (rapport Ca/Mg inférieur à 2).', 16],
  Sn: ['Horizon S nitique', 'Horizon S très argileux (50 à 80 % d’argile, surtout halloysite), à structure polyédrique très stable et faces luisantes ; surtout en milieu tropical.', 16],
  Snd: ['Horizon S silandique', 'Horizon S d’andosol riche en allophanes ; voir le chapitre Andosols.', 80],
  Sp: ['Horizon S pélosolique', 'Horizon S très argileux (plus de 45 % d’argile), jamais calcaire, à grosse structure prismatique ou polyédrique et fentes de retrait nettes en été.', 15],
  SV: ['Horizon structural vertique', 'Horizon de subsurface très argileux à argiles gonflantes, massif et pâteux en saison humide, découpé de fentes de retrait et de prismes quand il sèche ; il surmonte l’horizon V.', 23],

  // Horizons d'accumulation (p. 17-21)
  BT: ['Horizons argilluviaux', 'Horizon de profondeur enrichi en argile venue des horizons supérieurs : plus argileux que les horizons A, E, S ou C du même sol, épais d’au moins 15 cm, avec des revêtements d’argile sur les faces des agrégats et dans les pores.', 17],
  'BTß': ['Horizon BT bêta', 'Horizon plus sombre et plus argileux formé au contact d’une roche calcaire, sous un BT ordinaire ; très poreux, plus riche en matières organiques, à limites nettes mais irrégulières.', 18],
  BP: ['Horizons podzoliques', 'Horizon d’accumulation de composés amorphes associant matières organiques et aluminium, avec ou sans fer ; teinte 7,5 YR ou plus rouge, parfois cimenté (alios).', 19],
  BPh: ['Horizon BP humifère', 'Horizon BP riche en carbone, sombre, placé au-dessus du BPs quand les deux existent.', 19],
  BPs: ['Horizon BP sesquioxydique', 'Horizon BP où le fer et l’aluminium dominent, de teinte plus vive, sous le BPh.', 19],
  Fe: ['Horizons ferriques', 'Horizon où l’accumulation de fer domine, sous forme discontinue et non indurée.', 20],
  Fem: ['Horizon pétroferrique', 'Banc très dur de 10 à 50 cm, souvent discontinu, cimenté par des oxydes de fer et de manganèse (garluches, grepps).', 20],
  Femp: ['Horizon placique', 'Mince lit induré (1 à 10 mm) cimenté par le fer, le manganèse ou un complexe organo-ferrique.', 20],
  K: ['Horizons calcariques', 'Horizon d’accumulation de calcaire secondaire sous formes discontinues (revêtements, pseudo-mycéliums, amas, nodules) occupant plus de 15 % du volume ; les racines y pénètrent.', 20],
  Kc: ['Horizon calcarique continu', 'Accumulation de calcaire secondaire continue mais non indurée (encroûtement massif) ; les racines y pénètrent encore.', 20],
  Km: ['Horizon pétrocalcarique', 'Accumulation de calcaire secondaire continue et indurée (croûte, dalle) ; les racines ne la traversent que par les fissures.', 20],
  Si: ['Horizons siliciques', 'Horizon cimenté par de la silice, de façon discontinue ou faible ; les racines peuvent encore le coloniser.', 21],
  Sim: ['Horizon pétrosilicique', 'Horizon continu et induré par la silice (duripan), impénétrable aux racines.', 21],

  // Hydromorphie (p. 21-22)
  g: ['Horizons rédoxiques', 'Horizon engorgé temporairement : l’alternance des périodes saturées (le fer se réduit et migre) et non saturées (il s’oxyde et se fixe) juxtapose des plages grises appauvries en fer et des taches rouille enrichies en fer, de quelques pour cent de la surface à un aspect bariolé. Ces taches demeurent visibles quel que soit l’état d’humidité.', 21],
  G: ['Horizons réductiques', 'Horizon engorgé en permanence ou presque : le fer réduit y est réparti de façon assez homogène, d’où une couleur uniforme bleuâtre à verdâtre, ou grise (chroma au plus 2).', 22],
  Gr: ['Horizon réductique entièrement réduit', 'Horizon G toujours saturé : couleur uniformément bleuâtre à verdâtre sur plus de 95 % de la surface, ou grise à noire.', 22],
  Go: ['Horizon réductique temporairement réoxydé', 'Horizon G dont la saturation s’interrompt par périodes : des taches rouille pâles apparaissent alors le long des vides et des racines, puis disparaissent quand l’eau revient.', 22],
  Ga: ['Horizon réductique albique', 'Horizon G entièrement privé de son fer par le renouvellement de l’eau, donc blanchi.', 22],

  // Vertiques, histiques, peyriques, gypse, sels (p. 22-25 ; 197 ; 205-206)
  V: ['Horizon vertique sphénoïde', 'Horizon profond très argileux à argiles gonflantes, à structure en coins et nombreuses faces de glissement luisantes (slickensides) ; il reste un milieu confiné, dont l’humidité varie peu.', 23],
  H: ['Horizons histiques', 'Horizon holorganique (tourbe) formé dans l’eau pendant plus de six mois par an, à partir de débris de plantes des milieux humides ; moins de 50 % de cendres.', 205],
  Hf: ['Horizon histique fibrique', 'Tourbe peu décomposée : au moins 40 g de fibres pour 100 g, plantes reconnaissables (sphaignes, roseaux, laîches) ; l’eau pressée en sort claire.', 206],
  Hm: ['Horizon histique mésique', 'Tourbe moyennement décomposée : 10 à 40 g de fibres pour 100 g ; l’eau pressée en sort trouble et brune.', 206],
  Hs: ['Horizon histique saprique', 'Tourbe très décomposée, noire et grasse, qui passe presque toute entre les doigts : moins de 10 g de fibres pour 100 g.', 206],
  Ha: ['Horizon histique assaini', 'Tourbe très décomposée et foncée, devenue grumeleuse après l’abaissement de la nappe, sans mise en culture.', 206],
  X: ['Horizons peyriques', 'Horizon de plus de 10 cm contenant plus de 60 % d’éléments grossiers (en poids) : la terre fine y fait moins de 40 % de la terre totale.', 24],
  Xc: ['Horizon cailloutique', 'Horizon peyrique où cailloux, pierres et blocs dépassent 50 % et où les cailloux dominent.', 24],
  Xgr: ['Horizon gravelique', 'Horizon peyrique contenant plus de 50 % de graviers.', 24],
  Xp: ['Horizon pierrique', 'Horizon peyrique où cailloux, pierres et blocs dépassent 50 % et où pierres ou blocs dominent.', 24],
  Y: ['Horizons gypsiques', 'Horizon riche en gypse secondaire ; à préciser (Ys, Yp, Ym) d’après le chapitre Gypsosols.', 197],
  Ym: ['Horizon pétrogypsique', 'Accumulation de gypse continue et indurée ; voir le chapitre Gypsosols.', 197],
  Yp: ['Horizon gypsique de profondeur', 'Horizon gypsique situé en profondeur ; voir le chapitre Gypsosols.', 197],
  Ys: ['Horizon gypsique de surface', 'Horizon gypsique situé en surface ; voir le chapitre Gypsosols.', 197],
  Sa: ['Horizons saliques', 'Horizon enrichi en sels plus solubles que le gypse (chlorures, sulfates, carbonates de sodium surtout), dont l’extrait de pâte saturée atteint 15 dS/m (ou 8 dS/m en milieu alcalin) à un moment de l’année.', 24],
  Na: ['Horizons sodiques', 'Horizon où le sodium échangeable atteint au moins 15 % des cations, à structure dégradée, compacte ou en colonnes, peu poreux même en saison sèche.', 24],
  U: ['Horizons sulfatés', 'Horizon très acide (pH inférieur à 3,5), souvent taché de jarosite jaune, riche en sulfates ; il naît de l’oxydation d’un matériau sulfidique.', 25],

  // Horizons peu évolués, C, couches et matériaux (p. 25-28)
  J: ['Horizons jeunes', 'Horizon à peine différencié, faute de temps ou parce que l’évolution est bloquée : structure faible qui dépend de la granulométrie ; à préciser en Js ou Jp.', 25],
  Js: ['Horizon jeune de surface', 'Horizon J de surface, pauvre en matières organiques, jamais grumeleux (fluviosols, arénosols, cryosols…).', 25],
  Jp: ['Horizon jeune de profondeur', 'Horizon J peu profond, sous un Js ou un A, sans matières organiques ou presque.', 25],
  C: ['Horizons C', 'Horizon minéral de profondeur, fragmenté ou un peu altéré dans toute sa masse, mais sans structure pédologique d’ensemble ; il garde ou non la structure de la roche (isaltérite ou allotérite).', 25],
  Cca: ['Horizon C calcaire', 'Horizon C qui contient du calcaire.', 25],
  Ccra: ['Horizon C crayeux', 'Horizon C issu de la craie.', 25],
  R: ['Couches R', 'Roche dure et continue, peu fragmentée, que les outils de travail du sol n’entament pas ; seules ses fissures accueillent racines et matières venues d’en haut.', 26],
  Rca: ['Couche R calcaire', 'Roche dure calcaire.', 26],
  Rdo: ['Couche R dolomitique', 'Dolomie ou calcaire dolomitique durs.', 26],
  Rcri: ['Couche R cristalline', 'Roche cristalline ou cristallophyllienne dure (granite, gneiss).', 26],
  Rvo: ['Couche R volcanique', 'Roche volcanique dure (basalte, andésite, trachyte).', 26],
  Rsi: ['Couche R siliceuse', 'Roche siliceuse dure (quartzite, meulière, roche silicifiée).', 26],
  Rsch: ['Couche R de schistes durs', 'Schistes durs.', 26],
  M: ['Couches M', 'Roche continue mais meuble ou tendre, peu fragmentée, cohérente et facile à travailler avec des outils.', 26],
  Mcra: ['Couche M crayeuse', 'Craie ou calcaire crayeux tendre.', 26],
  Mca: ['Couche M calcaire', 'Matériau meuble calcaire.', 26],
  Mma: ['Couche M de marnes', 'Marnes, roches tendres mêlant argile et calcaire.', 26],
  Marg: ['Couche M argileuse', 'Roches argileuses (argilites, shales).', 26],
  Msi: ['Couche M siliceuse', 'Roches siliceuses meubles (gaize, arène).', 26],
  Mvo: ['Couche M volcanique', 'Roches volcaniques pyroclastiques.', 26],
  Msch: ['Couche M de schistes tendres', 'Schistes tendres.', 26],
  D: ['Couches D', 'Matériau dur fragmenté puis déplacé, non consolidé, où les éléments grossiers dominent (cailloutis de terrasse, éboulis, moraines, grèzes).', 26],
  Dca: ['Couche D calcaire', 'Fragments de roches calcaires dures.', 26],
  Dcra: ['Couche D crayeuse', 'Fragments de craies dures.', 26],
  Dsi: ['Couche D silicatée', 'Fragments de roches silicatées.', 26],
  Dx: ['Couche D mixte', 'Fragments de roches de natures mêlées.', 26],
  Dvo: ['Couche D volcanique', 'Fragments de roches volcaniques (scories…).', 26],
  P: ['Couches P', 'Pergélisol : couche restée sous 0 °C pendant au moins deux années de suite.', 27],
  Mli: ['Matériau limnique', 'Dans les histosols, matériau déposé dans l’eau (tourbe sédimentaire, terre à diatomées, marne lacustre).', 27],
  Mt: ['Matériau terrique', 'Dans les histosols, matériau minéral ou organo-minéral continu qui recouvre des horizons H ou s’y intercale.', 27],
  TH: ['Matériau sulfidique (thionique)', 'Matériau gorgé d’eau, souvent salée, contenant au moins 0,75 % de soufre sous forme de sulfures ; il s’acidifie fortement s’il s’assèche.', 27],
  Z: ['Matériaux anthropiques', 'Matériaux non pédologiques mis en place par l’homme (déblais, déchets, boues, scories, gravats, décombres), dans lesquels se développe l’anthroposol ; les horizons naturels qu’ils recouvrent se notent -b ou II.', 27],
  Ztr: ['Matériaux anthropiques terreux', 'Matériaux d’origine pédologique ou géologique, souvent mélangés, de texture fine (moins de 2 mm), parfois un peu caillouteux.', 27],
  Ztc: ['Matériaux anthropiques technologiques', 'Matériaux issus de l’extraction et de la transformation physique, chimique ou biologique de matières premières : sous-produits d’activités industrielles, artisanales ou minières (scories, cendres, laitiers, gravats…).', 27],
  ZO: ['Matériaux anthropiques holorganiques', 'Apports massifs de matières végétales pas ou peu transformées, ou de composts.', 27],
  Zar: ['Matériaux archéo-anthropiques', 'Matériaux très marqués par l’homme, lisibles par l’archéologie : phosphore abondant, charbons, plus de 20 % de débris (os, coquilles) ou d’artefacts (céramique, silex), ou structures (fossés, trous de poteau, fondations).', 28],

  // Domaines tropicaux et andosols (renvois)
  F: ['Horizons ferrallitiques', 'Horizons jaunes ou rouges des sols ferrallitiques tropicaux ; voir le chapitre Ferrallitisols.', 149],
  FE: ['Horizons ferrugineux', 'Horizons meubles des sols ferrugineux tropicaux ; voir le chapitre Ferruginosols.', 170],
  FS: ['Horizons fersiallitiques', 'Horizons rubéfiés des sols fersiallitiques (climats méditerranéens) ; voir le chapitre Fersialsols.', 179],
  OX: ['Horizons oxydiques', 'Horizons très riches en oxydes de fer et d’aluminium des domaines tropicaux ; voir le chapitre Ferrallitisols et oxydisols.', 150],
  OXc: ['Horizon duroxydique', 'Carapace : horizon oxydique durci.', 150],
  OXm: ['Horizon pétroxydique', 'Cuirasse : horizon oxydique très induré.', 150],
  RT: ['Horizons réticulés', 'Horizon à réseau de taches rouges et claires (rétichron, plinthite) ; voir le chapitre Ferrallitisols.', 152],
  ND: ['Horizons nodulaires', 'Horizon riche en nodules ferrugineux des domaines tropicaux.', 154],
};

/// Les notations anciennes qu'on rencontre encore sur le terrain.
export const anciennes = {
  B: ['Horizon B (notation traditionnelle)', 'Horizon de profondeur ; le Référentiel 2008 précise sa nature : S (altération sur place), BT (accumulation d’argile) ou BP (podzolique).', 9],
};

/// Lettres suffixes : code → [nom, définition, page].
export const suffixes = {
  b: ['enfoui', 'Horizon recouvert par plus de 50 cm d’apports naturels ou artificiels alors qu’il devrait se trouver en surface ou presque.', 3],
  cry: ['très cryoturbé', 'Horizon fortement brassé par le gel.', 3],
  g: ['à caractère rédoxique', 'Taches rouille et plages grises d’un engorgement temporaire, superposées aux caractères de l’horizon (Eg, BTg, Sg, Cg…).', 21],
  h: ['plus humifère que la normale', 'Horizon nettement plus riche en matières organiques que d’ordinaire (Ah, BTh, Ltph…).', 3],
  a: ['albique', 'Horizon blanchi, presque totalement privé de fer et d’argile (Ea, Ga, ga).', 3],
  c: ['induré', 'Horizon durci (Kc, OXc).', 3],
  ca: ['calcaire', 'Horizon C ou couche contenant du calcaire (Cca, Dca, Mca, Rca).', 3],
  cn: ['à concrétions', 'Nombreux films, concrétions ou nodules de fer et de manganèse (BTcn).', 3],
  cra: ['crayeux', 'Horizon C ou couche formés de craie (Ccra, Mcra).', 3],
  d: ['à dégradation morphologique', 'L’horizon E s’enfonce dans le BT (ou le S) par des langues ou des interdigitations le long des faces des agrégats (BTd, Sd).', 18],
  ho: ['hémiorganique', 'Horizon très riche en matières organiques liées aux minéraux : plus de 8 g de carbone organique pour 100 g de terre fine.', 10],
  j: ['à caractère xanthomorphe', 'Teintes jaunes liées à la nature des oxydes de fer ; voir le chapitre Fersialsols.', 180],
  k: ['à début d’accumulation de calcaire', 'Premières accumulations de calcite secondaire (Scak, Ck).', 3],
  m: ['fortement induré', 'Horizon très dur, cimenté (Fem, Km, OXm, Sim).', 4],
  nod: ['à nodules', 'Très grande abondance de nodules d’oxydes métalliques.', 4],
  noz: ['d’origine non zoogène', 'Horizon O formé sans intervention notable de la faune (OFnoz, OHnoz).', 4],
  s: ['à sesquioxydes', 'Accumulation de fer et d’aluminium, mais pas sous forme de nodules (BTs, BPs).', 4],
  t: ['à illuviation d’argile', 'Argile venue d’en haut, en début d’accumulation ou abondante (St, Ct, FSt).', 4],
  tc: ['sur matériau technologique', 'Horizon jeune formé dans des matériaux anthropiques technologiques, au tout début de leur évolution (Jtc).', 90],
  tp: ['transporté', 'Matériau pédologique ou géologique prélevé ailleurs et rapporté, comme la terre végétale des sols reconstitués (Ltp).', 90],
  v: ['à propriétés vertiques', 'Argiles gonflantes : fentes de retrait, faces de glissement (Av, Sv, Cv).', 4],
  x: ['à caractères fragiques', 'Partie très compacte et cassante, peu pénétrable aux racines (fragipan : BTx, Sx).', 4],
  y: ['à gypse', 'Horizon contenant du gypse (Cy, Sy, Vy).', 4],
  z: ['très anthropisé', 'Horizon pédologique mêlé d’apports anthropiques inertes qui restent sous 20 % de son volume (Az, Lz, Sz).', 90],
  zo: ['d’origine zoogène', 'Horizon O façonné par la faune (OFzo, OHzo).', 4],
  cri: ['de roches cristallines', 'Couche R ou D de roches cristallines ou cristallophylliennes dures (granites, gneiss).', 5],
  do: ['de roches dolomitiques', 'Couche R ou D de roches dolomitiques dures.', 5],
  sch: ['de schistes durs', 'Couche R ou D de schistes durs.', 5],
  si: ['de roches siliceuses', 'Couche R ou D de roches siliceuses dures (grès, meulières, roches silicifiées).', 5],
  vo: ['de roches volcaniques', 'Couche R ou D de roches volcaniques dures.', 5],
  p: ['labouré (ancienne notation)', 'Notation antérieure au Référentiel : « Ap » désignait l’horizon labouré, aujourd’hui noté L, ou LA s’il garde les caractères d’un horizon A.', 14],
};

/// Explications des symboles dessinés (fiche légende).
export const symboles = {
  EG: 'Fragments de roche de plus de 2 mm, dessinés en gris pour les roches non calcaires. Le nombre de cailloux suit l’abondance (part de la surface) et leur taille suit la classe : graviers 0,2 à 2 cm, cailloux 2 à 7,5 cm, pierres 7,5 à 20 cm, blocs au-delà (Référentiel, p. 249). Le dessin reste schématique : il ne suit pas l’échelle des profondeurs.',
  'EG-CALCAIRE': 'Éléments grossiers calcaires, dessinés en blanc cassé ; mêmes classes de taille et même lecture de l’abondance que les autres éléments grossiers.',
  'TACHES-ORANGE': 'Taches d’oxydation, couleur rouille : le fer s’y concentre quand l’horizon se ressuie après un engorgement temporaire (horizon rédoxique, Référentiel, p. 21). Marbrures : plages irrégulières et allongées ; tacheté : petites taches arrondies. L’abondance est la part de l’horizon occupée par l’ensemble des taches.',
  'TACHES-GRISES': 'Taches de réduction, grises : plages appauvries en fer pendant les périodes de saturation en eau (Référentiel, pp. 21-22). Le rapport gris / orange indique la part de chacune des deux couleurs dans les taches.',
  NOYE: 'Horizon gorgé d’eau ou presque lors de l’observation (petits traits d’eau verticaux).',
  NAPPE: 'Profondeur d’apparition de la nappe dans le sondage (trait bleu et triangle, chiffre bleu sur la règle), puis zone saturée en dessous (bulles).',
  'NON-OBSERVE': 'Profondeur qui n’a pas été décrite, sous l’arrêt du sondage par exemple (hachures).',
};

// MARK: - Décodage d'une désignation (« Btg », « II Cca », « LAci », « Ztc »…)

/// Codes en capitales qu'on écrit souvent à demi en minuscules (« Bt », « Bp », « La ») ; pas « AG » ni
/// « FE » : « Ag » se lit A + g (rédoxique), « Fe » est un horizon ferrique.
const codesSouples = ['LBT', 'LBP', 'BT', 'BP', 'LA', 'LE', 'LS', 'LO', 'LH', 'OL', 'OF', 'OH', 'OX', 'RT', 'FS', 'TH', 'SV'];
const lettres = Object.keys(suffixes).sort((a, b) => b.length - a.length);
const ROMAINS = { II: 2, III: 3, IV: 4, V: 5, VI: 6 };

const partie = (type, code, [nom, texte, page]) => ({ type, code, nom, texte, page });

/// Les lectures possibles du début de `t`, de la plus longue à la plus courte : [code, définition, écrit].
function candidats(t) {
  const out = [];
  for (const c of Object.keys(horizons)) if (t.startsWith(c)) out.push([c, horizons[c], c]);
  for (const c of codesSouples) {
    const ecrit = t.slice(0, c.length);
    if (ecrit !== c && ecrit.toUpperCase() === c) out.push([c, horizons[c], ecrit]);
  }
  for (const c of Object.keys(anciennes)) if (t.startsWith(c)) out.push([c, anciennes[c], c]);
  return out.sort((a, b) => b[2].length - a[2].length);
}

/// Lit `t` à partir d'un horizon de référence : lettres suffixes, chiffre de sous-horizon, second code
/// en capitales (JsZ). On garde la première lecture qui explique tous les caractères, sinon la plus longue.
function analyser(t) {
  let repli = null;
  for (const [code, def, ecrit] of candidats(t)) {
    const parties = [partie('horizon', code, def)];
    if (ecrit !== code) parties.push({ type: 'note', texte: `« ${ecrit} » s’écrit ${code} dans le Référentiel.` });
    let reste = t.slice(ecrit.length), complet = true;
    const chiffre = reste.match(/(\d+)$/);
    if (chiffre) reste = reste.slice(0, -chiffre[1].length);
    while (reste) {
      if (/^[A-Z]/.test(reste)) {
        const suite = analyser(reste);
        if (!suite) { complet = false; parties.push({ type: 'note', texte: `« ${reste} » : lettres non reconnues.` }); break; }
        parties.push(...suite.parties);
        complet = complet && suite.complet;
        break;
      }
      const l = lettres.find((x) => reste.startsWith(x));
      if (!l) { complet = false; parties.push({ type: 'note', texte: `« ${reste} » : lettres non reconnues.` }); break; }
      parties.push(partie('suffixe', `-${l}`, suffixes[l]));
      reste = reste.slice(l.length);
    }
    if (chiffre) parties.push({ type: 'note', texte: `${chiffre[1]} : numéro de sous-horizon, compté du haut vers le bas, sans autre sens (Référentiel, p. 4).` });
    if (complet) return { parties, complet };
    repli ??= { parties, complet };
  }
  return repli;
}

/// Décompose une désignation en ses parties : horizon de référence, lettres suffixes, notes (discontinuité,
/// subdivision, transition). `reconnu` dit si au moins un horizon de référence a été trouvé.
export function decoder(designation) {
  let t = String(designation ?? '').trim().replace(/\s+/g, ' ');
  const parties = [];
  if (!t) return { parties, reconnu: false };
  const libre = () => ({ parties: [...parties, { type: 'note', texte: 'Désignation libre : elle ne correspond à aucun horizon de référence du Référentiel pédologique 2008.' }], reconnu: false });

  // Chiffres romains : discontinuité lithologique (le premier matériau n'est pas numéroté). « V » seul est
  // l'horizon vertique : il ne compte comme chiffre romain que suivi d'une espace.
  const romain = t.match(/^(VI|IV|III|II) ?(?=[A-Zπ])/) || t.match(/^(V) (?=[A-Zπ])/);
  if (romain) {
    parties.push({ type: 'note', texte: `${romain[1]} : ${ROMAINS[romain[1]]}ᵉ matériau du profil, séparé du précédent par une discontinuité lithologique (Référentiel, p. 4).` });
    t = t.slice(romain[0].length);
  }
  // Horizon de transition (A-S, S-C) ou juxtaposition de deux volumes (E&BT).
  const double = t.match(/^([^\s&-]+)\s*([&-])\s*([^\s&-]+)$/);
  if (double) {
    const [, a, signe, b] = double;
    parties.push({ type: 'note', texte: signe === '&'
      ? `${a}&${b} : juxtaposition de volumes des deux horizons (Référentiel, p. 4).`
      : `${a}-${b} : horizon de transition entre ${a} et ${b} (Référentiel, p. 3).` });
    const da = decoder(a), db = decoder(b);
    return { parties: [...parties, ...da.parties, ...db.parties], reconnu: da.reconnu || db.reconnu };
  }
  // Une phrase (« Hz croissance », « remblai brun ») n'est pas une désignation codée.
  if (/\s/.test(t)) return libre();
  if (t.startsWith('π')) {
    parties.push({ type: 'note', texte: 'π : paléo-horizon, hérité de conditions anciennes (Référentiel, p. 4).' });
    t = t.slice(1);
  }
  const lu = analyser(t);
  if (!lu) return libre();
  return { parties: [...parties, ...lu.parties], reconnu: true };
}
