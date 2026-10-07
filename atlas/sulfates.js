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
    contexte: "Géodes des calcaires et marnes, évaporites ; les géodes géantes viennent de Madagascar (Sakoany).",
    stabilite: 5, swatch: "#a9c4de",
    devient: "Peu soluble ; le strontium passe lentement aux eaux.",
    note: "Son bleu céleste lui a donné son nom — et elle a donné le sien à l'élément strontium… avec la strontianite. Les géodes bleues de Madagascar, grosses comme des citrouilles, sont dans tous les musées. Principal minerai du strontium : écrans cathodiques hier, feux d'artifice carmin et aimants ferrites aujourd'hui.",
  },
  anglesite: {
    nom: "Anglésite", formule: "PbSO₄", famille: "Sulfate anhydre",
    systeme: "orthorhombique", durete: 2.75, densite: 6.35,
    clivage: "bon {100} ({001} dans la notation Pnma des ouvrages)", eclat: "adamantin",
    couleurs: "incolore, blanc, jaune miel, gris",
    contexte: "Première croûte d'oxydation des filons de galène, avant la cérusite (île d'Anglesey, Touissit au Maroc).",
    stabilite: 4, swatch: "#e3ddcf",
    devient: "Se carbonate en cérusite au contact des eaux bicarbonatées.",
    note: "Le premier pas de la galène vers la lumière : l'oxydation du sulfure donne d'abord ce sulfate, souvent en auréole autour d'un cœur de galène grise encore intact — une rocaille qui raconte l'altération en coupe. Éclat adamantin et densité 6,3 : le plomb ne se cache jamais vraiment.",
  },
  epsomite: {
    nom: "Epsomite (sel d'Epsom)", formule: "MgSO₄·7H₂O", famille: "Sulfate hydraté",
    systeme: "orthorhombique", durete: 2.25, densite: 1.67,
    clivage: "parfait {010}", eclat: "vitreux à soyeux",
    couleurs: "blanc, incolore, en efflorescences fibreuses",
    contexte: "Efflorescences des parois de mines, grottes sèches et lacs salés magnésiens ; source d'Epsom (Angleterre).",
    stabilite: 1, swatch: "#eef0ec",
    devient: "Ultra-soluble et se déshydrate à l'air sec : un minéral météo-dépendant.",
    note: "Le « sel d'Epsom » des pharmacies (purgatif et sels de bain) jaillit d'une source anglaise découverte en 1618 par… des vaches qui refusaient de boire. En minéral, il fleurit en barbes soyeuses sur les parois des vieilles galeries — et disparaît à la première humidité. Les lacs amers magnésiens (Sebkhas, Epsom lakes canadiens) en précipitent des tonnes.",
  },
  mirabilite: {
    nom: "Mirabilite (sel de Glauber)", formule: "Na₂SO₄·10H₂O", famille: "Sulfate hydraté",
    systeme: "monoclinique", durete: 1.75, densite: 1.46,
    clivage: "parfait {100}", eclat: "vitreux",
    couleurs: "incolore, blanc",
    contexte: "Lacs salés froids (elle précipite au refroidissement hivernal !), efflorescences, sources sulfatées.",
    stabilite: 1, swatch: "#e9edf0",
    devient: "À l'air sec, s'effondre en poudre de thénardite en perdant ses 10 eaux.",
    note: "Le « sel admirable » (sal mirabilis) de Glauber, purgatif du XVIIe siècle. Sa vie est un drame permanent : cristallisée l'hiver dans les lacs salés (sa solubilité chute avec le froid), elle s'effrite en poudre blanche dès que l'air sèche — un cristal limpide devient tas de farine en quelques heures de vitrine. Sa capacité à stocker la chaleur en fait un matériau à changement de phase étudié pour l'habitat.",
  },
  chalcanthite: {
    nom: "Chalcanthite (vitriol bleu)", formule: "CuSO₄·5H₂O", famille: "Sulfate hydraté",
    systeme: "triclinique", durete: 2.5, densite: 2.28,
    clivage: "imparfait", eclat: "vitreux",
    couleurs: "bleu azur intense",
    contexte: "Efflorescences et stalactites bleues des galeries de mines de cuivre ; gisements des déserts hyper-arides (Chuquicamata, pluie < 5 % de l'ETP).",
    stabilite: 1, swatch: "#2762c9",
    devient: "Ultra-soluble : dissoute à la première pluie, reprécipitée à la saison sèche.",
    note: "Le sulfate de cuivre des cours de chimie — dans la nature, il pousse en stalactites bleu électrique au plafond des vieilles galeries, recristallisé des eaux de mine. Les gros cristaux du commerce sont cultivés en laboratoire. C'est aussi la moitié de la bouillie bordelaise des vignerons. Attention : soluble, donc toxique — les eaux bleues d'une mine de cuivre ne se boivent pas.",
  },
  crocoite: {
    nom: "Crocoïte", formule: "PbCrO₄", famille: "Chromate",
    systeme: "monoclinique", durete: 2.75, densite: 6,
    clivage: "net {110}", eclat: "adamantin",
    couleurs: "rouge orangé « safran » éclatant",
    contexte: "Oxydation de filons de plomb traversant des roches chromifères — Tasmanie (Dundas), Oural (Berezovsk).",
    stabilite: 5, swatch: "#e0541e",
    devient: "Très stable dans son chapeau oxydé.",
    note: "C'est sur ses aiguilles safran de l'Oural que le Français Nicolas-Louis Vauquelin découvrit en 1797 un métal nouveau, qu'il nomma chrome — « couleur » en grec, car tous ses composés sont vifs. Le jaune de chrome des Tournesols de Van Gogh et des taxis new-yorkais descend de ce minéral. Les gerbes rouges de Tasmanie sont l'emblème minéralogique de l'île.",
  },
  wulfenite: {
    nom: "Wulfénite", formule: "PbMoO₄", famille: "Molybdate",
    systeme: "quadratique", durete: 2.87, densite: 6.8,
    clivage: "net {011}", eclat: "adamantin à résineux",
    couleurs: "orange vif, jaune, rouge, brun",
    contexte: "Zone d'oxydation des filons de plomb à molybdène (Red Cloud en Arizona, Mežica en Slovénie).",
    stabilite: 5, swatch: "#e8871e",
    devient: "Stable ; source accessoire de molybdène.",
    note: "Des tablettes carrées, minces comme des gaufrettes, d'un orange de vitrail : la wulfénite est le molybdate que tous les collectionneurs veulent. La mine Red Cloud (Arizona) a produit les rouges les plus célèbres. Le molybdène qu'elle contient discrètement durcit les aciers — chaque tablette orange est un alliage en devenir.",
  },
  scheelite: {
    nom: "Scheelite", formule: "CaWO₄", famille: "Tungstate",
    systeme: "quadratique", durete: 4.75, densite: 6.1,
    clivage: "net {101}", eclat: "vitreux à adamantin",
    couleurs: "incolore, blanc, miel, orangé — fluorescence bleu-blanc éclatante aux UV",
    contexte: "Skarns et filons de haute température ; Salau (Ariège) fut l'une des grandes mines de tungstène d'Europe.",
    stabilite: 7, swatch: "#e4d9b8",
    devient: "Très résistante ; se concentre dans les alluvions (prospection à la lampe UV).",
    note: "Sa fluorescence bleu-blanc sous UV est si fiable que les prospecteurs arpentent les torrents de nuit, lampe en main : les galets de scheelite s'allument comme des lucioles. La mine de Salau (Ariège), fermée en 1986, portait l'essentiel du tungstène français — le métal des outils de coupe et des blindages, dont l'Europe cherche à relancer la production.",
  },
  wolframite: {
    nom: "Wolframite", formule: "(Fe,Mn)WO₄", famille: "Tungstate",
    systeme: "monoclinique", durete: 4.25, densite: 7.3,
    clivage: "parfait {010}", eclat: "sub-métallique",
    couleurs: "noir brunâtre à noir",
    contexte: "Filons de quartz et greisens des coupoles granitiques (Erzgebirge ; Enguialès en Aveyron, Montredon dans le Tarn).",
    stabilite: 7, swatch: "#3a3a3e",
    devient: "Très résistante ; ses galets noirs et denses s'accumulent en placers.",
    note: "Le « loup » (Wolf) des mineurs saxons : ce minéral noir « dévorait » l'étain en encrassant les fontes de cassitérite — d'où wolfram, et le symbole W du tungstène. Ses lames noires ultra-denses (7,3 !) hantent les filons de quartz des granites varisques : Enguialès (Aveyron) et Montredon-Labessonnié (Tarn) furent nos mines-écoles du tungstène.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 7);
  c.classe = "Sulfates, chromates & tungstates";
  c.desc = "Le groupement SO₄²⁻ et ses cousins CrO₄²⁻, MoO₄²⁻, WO₄²⁻ : minéraux d'évaporation (gypse), d'oxydation des sulfures (jarosite), et les sels métalliques colorés des chapeaux de filons — jusqu'aux tungstates, minerais stratégiques.";
  c.groupes = [
    {
      nom: "Sulfates anhydres", code: "VII.A", motif: "SO₄²⁻ sans eau (Ba, Sr, Pb, Ca)",
      note: "Plus le cation est gros, plus le sulfate est insoluble : la barytine « spath pesant » est quasi inerte, la célestine bleue à peine moins, l'anglésite scelle les galènes — et l'anhydrite attend l'eau pour gonfler en gypse.",
      mineraux: ["barytine", "celestine", "anglesite", "anhydrite"],
    },
    {
      nom: "Sulfates hydratés", code: "VII.C-D", motif: "SO₄²⁻ + H₂O (gypse, sels solubles)",
      note: "Le gypse règne ; autour de lui gravitent les sels éphémères — epsomite, mirabilite, chalcanthite — qui fleurissent sur les parois des mines et fondent à la première pluie.",
      mineraux: ["gypse_m", "epsomite", "mirabilite", "chalcanthite"],
    },
    {
      nom: "Sulfates d'altération (à OH)", code: "VII.B", motif: "SO₄²⁻ + OH (alunite, jarosite)",
      note: "Les ocres acides nés de l'oxydation des sulfures : la jarosite ne précipite qu'en dessous de pH 3 — sa détection sur Mars a prouvé qu'une eau acide y avait coulé.",
      mineraux: ["alunite", "jarosite"],
    },
    {
      nom: "Chromates, molybdates & tungstates", code: "VII.F-G", motif: "CrO₄²⁻, MoO₄²⁻, WO₄²⁻",
      note: "Les cousins métalliques du sulfate : crocoïte qui a fait découvrir le chrome à Vauquelin, wulfénite orange des collections, et le duo scheelite-wolframite — le tungstène stratégique, de Salau (Ariège) aux carbures d'outillage.",
      mineraux: ["crocoite", "wulfenite", "scheelite", "wolframite"],
    },
  ];
})();
