// ============================================================
// CLASSE VII — SULFATES, CHROMATES, MOLYBDATES, TUNGSTATES (Strunz VII)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  celestine: {
    nom: "Célestine", formule: "SrSO₄", famille: "Sulfate anhydre",
    systeme: "orthorhombique", durete: 3.25, densite: 3.97,
    clivage: "parfait {001}", eclat: "vitreux à nacré",
    couleurs: "bleu ciel délicat, incolore, blanc",
    contexte: "On la trouve dans les géodes des calcaires et des marnes, ainsi que dans les évaporites ; les géodes les plus grandes proviennent de Sakoany (Madagascar).",
    stabilite: 5, swatch: "#a9c4de",
    devient: "Peu soluble, elle libère lentement son strontium dans les eaux.",
    note: "Son bleu céleste lui a donné son nom ; elle a aussi transmis le sien à l'élément strontium, avec la strontianite. Les géodes bleues de Madagascar, grosses comme des citrouilles, figurent dans toutes les collections muséales. Principal minerai du strontium, elle a servi autrefois aux écrans cathodiques, et sert aujourd'hui aux feux d'artifice carmin et aux aimants ferrites.",
  },
  anglesite: {
    nom: "Anglésite", formule: "PbSO₄", famille: "Sulfate anhydre",
    systeme: "orthorhombique", durete: 2.75, densite: 6.35,
    clivage: "bon {100} ({001} dans la notation Pnma des ouvrages)", eclat: "adamantin",
    couleurs: "incolore, blanc, jaune miel, gris",
    contexte: "Sur les filons de galène, c'est la première croûte d'oxydation, qui précède la cérusite (île d'Anglesey, Touissit au Maroc).",
    stabilite: 4, swatch: "#e3ddcf",
    devient: "Au contact des eaux bicarbonatées, elle devient cérusite.",
    note: "Premier produit de l'oxydation de la galène : le sulfure donne d'abord ce sulfate, souvent en auréole autour d'un cœur de galène grise encore intact, ce qui permet de lire l'altération en coupe. Son éclat adamantin et sa densité de 6,3 rendent le plomb aisé à repérer.",
  },
  epsomite: {
    nom: "Epsomite (sel d'Epsom)", formule: "MgSO₄·7H₂O", famille: "Sulfate hydraté",
    systeme: "orthorhombique", durete: 2.25, densite: 1.67,
    clivage: "parfait {010}", eclat: "vitreux à soyeux",
    couleurs: "blanc, incolore, en efflorescences fibreuses",
    contexte: "On la trouve en efflorescences sur les parois de mines, dans les grottes sèches et les lacs salés magnésiens ; son nom vient de la source d'Epsom (Angleterre).",
    stabilite: 1, swatch: "#eef0ec",
    devient: "Extrêmement soluble, elle se déshydrate à l'air sec : sa présence dépend donc de la météo.",
    note: "Le « sel d'Epsom » des pharmacies (purgatif et sels de bain) provient d'une source anglaise découverte en 1618, où des vaches refusaient de boire l'eau. À l'état naturel, il forme des efflorescences soyeuses sur les parois des vieilles galeries et disparaît à la première humidité. Les lacs amers magnésiens (sebkhas, lacs d'Epsom au Canada) en précipitent des quantités considérables.",
  },
  mirabilite: {
    nom: "Mirabilite (sel de Glauber)", formule: "Na₂SO₄·10H₂O", famille: "Sulfate hydraté",
    systeme: "monoclinique", durete: 1.75, densite: 1.46,
    clivage: "parfait {100}", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "On la trouve dans les lacs salés froids, où elle précipite au refroidissement hivernal, dans les efflorescences et dans les sources sulfatées.",
    stabilite: 1, swatch: "#e9edf0",
    devient: "À l'air sec, elle se réduit en poudre de thénardite en perdant ses 10 molécules d'eau.",
    note: "Nommé « sel admirable » (sal mirabilis) par Glauber, il fut un purgatif au XVIIe siècle. Sa stabilité est précaire : cristallisé en hiver dans les lacs salés, où sa solubilité chute avec le froid, il s'effrite en poudre blanche dès que l'air se dessèche. Un cristal limpide se réduit en poudre en quelques heures d'exposition en vitrine. Sa capacité à stocker la chaleur en fait un matériau à changement de phase étudié pour l'habitat.",
  },
  chalcanthite: {
    nom: "Chalcanthite (vitriol bleu)", formule: "CuSO₄·5H₂O", famille: "Sulfate hydraté",
    systeme: "triclinique", durete: 2.5, densite: 2.28,
    clivage: "imparfait", eclat: "vitreux",
    couleurs: "bleu azur intense",
    contexte: "On la trouve en efflorescences et en stalactites bleues dans les galeries des mines de cuivre, ainsi que dans les gisements des déserts hyperarides (Chuquicamata, pluie inférieure à 5 % de l'ETP).",
    stabilite: 1, swatch: "#2762c9",
    devient: "Extrêmement soluble, elle est dissoute dès la première pluie et reprécipite pendant la saison sèche.",
    note: "Présent aussi dans la nature, le sulfate de cuivre des cours de chimie forme des stalactites bleu électrique au plafond des vieilles galeries, par recristallisation des eaux de mine. Les gros cristaux du commerce sont cultivés en laboratoire, et la bouillie bordelaise utilisée par les vignerons en contient aussi. Soluble, donc toxique : les eaux bleues d'une mine de cuivre ne doivent pas être bues.",
  },
  crocoite: {
    nom: "Crocoïte", formule: "PbCrO₄", famille: "Chromate",
    systeme: "monoclinique", durete: 2.75, densite: 6,
    clivage: "net {110}", eclat: "adamantin",
    couleurs: "rouge orangé « safran » éclatant",
    contexte: "Oxydation de filons de plomb recoupant des roches riches en chrome : Tasmanie (Dundas), Oural (Berezovsk).",
    stabilite: 5, swatch: "#e0541e",
    devient: "Elle est très stable dans la zone oxydée qui la coiffe.",
    note: "C'est à partir des aiguilles safran de l'Oural que le chimiste français Nicolas-Louis Vauquelin isola en 1797 un métal nouveau, auquel il donna le nom de chrome, du grec « couleur », tous ses composés étant vifs. Le jaune de chrome des Tournesols de Van Gogh et des taxis new-yorkais est issu de ce minéral. Les gerbes rouges de Tasmanie sont l'emblème minéralogique de l'île.",
  },
  wulfenite: {
    nom: "Wulfénite", formule: "PbMoO₄", famille: "Molybdate",
    systeme: "quadratique", durete: 2.87, densite: 6.8,
    clivage: "net {011}", eclat: "adamantin à résineux",
    couleurs: "orange vif, jaune, rouge, brun",
    contexte: "Red Cloud (Arizona) et Mežica (Slovénie) : la zone d'oxydation des filons plombeux riches en molybdène les renferme.",
    stabilite: 5, swatch: "#e8871e",
    devient: "Stable ; source accessoire de molybdène.",
    note: "Des tablettes carrées, minces comme des feuillets, d'un orange de vitrail : la wulfénite est un molybdate très recherché des collectionneurs. La mine de Red Cloud (Arizona) a produit les spécimens rouges les plus réputés. Le molybdène qu'elle renferme sert à durcir les aciers.",
  },
  scheelite: {
    nom: "Scheelite", formule: "CaWO₄", famille: "Tungstate",
    systeme: "quadratique", durete: 4.75, densite: 6.1,
    clivage: "net {101}", eclat: "vitreux à adamantin",
    couleurs: "incolore, blanc, miel, orangé : fluorescence bleu-blanc éclatante aux UV",
    contexte: "Salau (Ariège) figura parmi les grandes mines européennes de tungstène ; le minéral se forme dans les skarns et les filons à haute température.",
    stabilite: 7, swatch: "#e4d9b8",
    devient: "Très résistante, elle se concentre dans les alluvions, où on la repère à la lampe UV.",
    note: "La scheelite fluoresce en bleu-blanc sous UV, un signal si net que, de nuit, les prospecteurs parcourent les torrents, lampe en main, et voient ses galets s'illuminer comme des lucioles. Fermée en 1986, la mine de Salau (Ariège) produisait l'essentiel du tungstène français ; l'Europe veut aujourd'hui relancer cette production, nécessaire aux outils de coupe et aux blindages.",
  },
  wolframite: {
    nom: "Wolframite", formule: "(Fe,Mn)WO₄", famille: "Tungstate",
    systeme: "monoclinique", durete: 4.25, densite: 7.3,
    clivage: "parfait {010}", eclat: "sub-métallique",
    couleurs: "noir brunâtre à noir",
    contexte: "Enguialès (Aveyron), Montredon (Tarn) et l'Erzgebirge illustrent les filons de quartz et les greisens nés des coupoles granitiques.",
    stabilite: 7, swatch: "#3a3a3e",
    devient: "Très résistante, elle s'accumule sous forme de galets noirs et denses dans les placers.",
    note: "Les mineurs saxons nommaient ce minéral noir le « loup » (Wolf) : il « dévorait » l'étain en encrassant les fontes de cassitérite, d'où le nom de wolfram et le symbole W du tungstène. Ses lames noires, très denses (densité 7,3), se rencontrent dans les filons de quartz des granites varisques ; Enguialès (Aveyron) et Montredon-Labessonnié (Tarn) furent des mines-écoles pour le tungstène.",
  },

  // ---------- F.12 (16/10/2026) : sulfates des sols sulfatés acides et des sols salés ----------
  schwertmannite: {
    nom: "Schwertmannite", formule: "Fe³⁺₁₆O₁₆(OH)₁₂(SO₄)₂·10 à 12 H₂O", famille: "Sulfate basique de fer",
    systeme: "quadratique (probable ; nanocristallin)", densite: 3.85,
    clivage: "aucun (aiguilles de quelques nanomètres)", eclat: "terreux",
    couleurs: "jaune brunâtre, ocre",
    contexte: "Dans les drainages miniers acides et les sols sulfatés acides (polders, marais drainés), des eaux de pH 3 à 4,5 riches en sulfate de fer produisent ces ocres jaunes. Localité type : mine de Pyhäsalmi (Finlande).",
    stabilite: 2, swatch: "#c08a3a",
    devient: "Dans l'eau à pH 3,9, cette phase se change en goethite en un an et demi ; sans oxygène, vers la neutralité, la même transformation demande deux à trois mois et libère de l'acide sulfurique.",
    note: "Située entre jarosite (pH inférieur à ≈ 3) et goethite, cette ocre des eaux acides précipite entre pH 3 et 4,5 dans les eaux de mines et les sols où la pyrite s'oxyde. Elle prend la forme de petites boules hérissées d'aiguilles (« pelotes d'épingles »). Instable, elle libère son sulfate et de l'acide en devenant goethite : c'est une réserve d'acidité des sols sulfatés acides. Décrite en 1994, elle porte le nom d'Udo Schwertmann, pédologue de Munich spécialiste des oxydes de fer.",
    sources: [
      `Anthony J. W., Bideaux R. A., Bladh K. W. et Nichols M. C. (2001-2005). <i>Handbook of Mineralogy</i>, fiche « Schwertmannite ». Mineral Data Publishing (données cristallines et physiques).`,
      "Bigham J. M., Carlson L. et Murad E. (1994). « Schwertmannite, a new iron oxyhydroxysulphate from Pyhäsalmi, Finland, and other localities ». <i>Mineralogical Magazine</i> 58, p. 641–648.",
      "Bigham J. M., Schwertmann U., Traina S. J., Winland R. L. et Wolf M. (1996). « Schwertmannite and the chemical modeling of iron in acid sulfate waters ». <i>Geochimica et Cosmochimica Acta</i> 60, p. 2111–2121 (passage complet en goethite en 543 jours à pH 3,9).",
      "Bush R. T., Burton E. D. et Sullivan L. A. (2007). « Catalytic action of aqueous Fe(II) and S(II) on the transformation of schwertmannite to goethite ». <i>Goldschmidt Conference Abstracts 2007</i>, A137 (un à deux ans en milieu acide oxygéné, deux à trois mois sans oxygène vers la neutralité).",
      "Fernandez-Martinez A. et al. (2010). « The structure of schwertmannite, a nanocrystalline iron oxyhydroxysulfate ». <i>American Mineralogist</i> 95, p. 1312–1322.",
    ],
  },
  thenardite: {
    nom: "Thénardite", formule: "Na₂SO₄", famille: "Sulfate anhydre",
    systeme: "orthorhombique", durete: 2.75, densite: 2.66,
    clivage: "parfait {010}, assez bon {101}", eclat: "vitreux à résineux",
    couleurs: "incolore, blanc grisâtre, jaune pâle",
    contexte: "On la rencontre dans les lacs salés et les sebkhas des régions sèches (Espartinas près d'Aranjuez, Searles Lake), dans les croûtes des sols salés, sur les efflorescences des murs et dans les fumerolles (Vésuve, Etna).",
    stabilite: 1, swatch: "#efece6",
    devient: "Elle se dissout sous la pluie ; à l'air humide, elle fixe dix molécules d'eau et se transforme en mirabilite.",
    note: "Ce sulfate de sodium anhydre porte le nom de Louis Jacques Thénard, chimiste français (on lui doit le bleu de Thénard et l'eau oxygénée). La mirabilite et la thénardite se transforment l'une en l'autre selon les conditions de l'air : la thénardite se forme au-dessus de 32,4 °C ou sous air sec (humidité inférieure à 76 % à 20 °C), la mirabilite au frais et à l'humidité. Ce va-et-vient fait cristalliser la mirabilite dans des solutions très sursaturées : c'est l'une des pires causes de désagrégation des pierres par les sels (Steiger et Asmussen 2008).",
    sources: [
      `Anthony J. W., Bideaux R. A., Bladh K. W. et Nichols M. C. (2001-2005). <i>Handbook of Mineralogy</i>, fiche « Thénardite ». Mineral Data Publishing (données cristallines et physiques).`,
      "Hawthorne F. C. et Ferguson R. B. (1975). « Anhydrous sulphates. I: Refinement of the crystal structure of celestite with an appendix on the structure of thenardite ». <i>The Canadian Mineralogist</i> 13, p. 181–187.",
      "Steiger M. et Asmussen S. (2008). « Crystallization of sodium sulfate phases in porous materials: the phase diagram Na₂SO₄–H₂O and the generation of stress ». <i>Geochimica et Cosmochimica Acta</i> 72, p. 4291–4306.",
    ],
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 7);
  c.classe = "Sulfates, chromates & tungstates";
  c.desc = "Le groupement SO₄²⁻ et ses homologues CrO₄²⁻, MoO₄²⁻ et WO₄²⁻ : on y trouve des minéraux d'évaporation (gypse), d'oxydation des sulfures (jarosite), ainsi que les sels métalliques colorés des zones oxydées des filons, jusqu'aux tungstates, minerais stratégiques.";
  c.groupes = [
    {
      nom: "Sulfates anhydres", code: "VII.A", motif: "SO₄²⁻ sans eau (Ba, Sr, Pb, Ca)",
      note: "Le sulfate devient d'autant moins soluble que le cation est gros : la barytine, ou « spath pesant », reste presque inerte, la célestine bleue l'est à peine moins, et l'anglésite scelle les galènes. Gonflant en gypse au contact de l'eau, l'anhydrite attend l'eau. À l'autre extrémité, la thénardite, sulfate de sodium, disparaît dès la première pluie.",
      mineraux: ["barytine", "celestine", "anglesite", "anhydrite", "thenardite"],
    },
    {
      nom: "Sulfates hydratés", code: "VII.C-D", motif: "SO₄²⁻ + H₂O (gypse, sels solubles)",
      note: "Le gypse domine ; autour de lui gravitent des sels éphémères, l'epsomite, la mirabilite et la chalcanthite, qui forment des efflorescences sur les parois des mines et se dissolvent à la première pluie.",
      mineraux: ["gypse_m", "epsomite", "mirabilite", "chalcanthite"],
    },
    {
      nom: "Sulfates d'altération (à OH)", code: "VII.B", motif: "SO₄²⁻ + OH (alunite, jarosite)",
      note: "Issus de l'oxydation des sulfures, ces ocres acides : sous pH 3, c'est la jarosite qui précipite ; sa détection sur Mars a établi qu'une eau acide y avait circulé. Entre pH 3 et 4,5, la schwertmannite prend le relais.",
      mineraux: ["alunite", "jarosite", "schwertmannite"],
    },
    {
      nom: "Chromates, molybdates & tungstates", code: "VII.F-G", motif: "CrO₄²⁻, MoO₄²⁻, WO₄²⁻",
      note: "Les homologues métalliques du sulfate : la crocoïte, qui permit à Vauquelin de découvrir le chrome, la wulfénite orangée des collections, et le couple scheelite-wolframite, qui fournit le tungstène stratégique, de Salau (Ariège) aux carbures d'outillage.",
      mineraux: ["crocoite", "wulfenite", "scheelite", "wolframite"],
    },
  ];
})();
