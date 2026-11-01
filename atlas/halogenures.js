// ============================================================
// CLASSE III — HALOGÉNURES (Strunz III)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  chlorargyrite: {
    nom: "Chlorargyrite (argent corné)", formule: "AgCl", famille: "Halogénure simple",
    systeme: "cubique", durete: 1.75, densite: 5.55,
    clivage: "aucun : se coupe au couteau comme de la cire", eclat: "résineux à adamantin",
    couleurs: "incolore fraîche → violet-brun à la lumière",
    contexte: "Elle se rencontre surtout dans la zone oxydée des filons argentifères, en climat aride, lorsque la pluie demeure sous 20 % de l'ETP (Chili, Broken Hill).",
    stabilite: 3, swatch: "#b8a68f",
    devient: "Photosensible, elle noircit sous l'effet de la lumière ; très stable chimiquement en climat sec.",
    note: "L'« argent corné » se taille au canif comme une cire minérale. Il s'agit d'argent photographique naturel : même sel AgCl que les pellicules, même noircissement à la lumière. Dans les déserts miniers du Chili, des colonnes entières de filons oxydés étaient constituées de chlorargyrite massive, c'est-à-dire d'argent que l'on pouvait couper au couteau.",
  },
  carnallite: {
    nom: "Carnallite", formule: "KMgCl₃·6H₂O", famille: "Halogénure double hydraté",
    systeme: "orthorhombique", durete: 2.5, densite: 1.6,
    clivage: "aucun (cassure conchoïdale)", eclat: "gras, souvent terne",
    couleurs: "incolore, blanc, rose à rouge (inclusions d'hématite)",
    contexte: "Il est le tout dernier précipité des évaporites potassiques et s'observe dans les couches profondes des bassins salifères (Alsace, Stassfurt).",
    stabilite: 1, swatch: "#d99a94",
    devient: "Déliquescente, elle se dissout à l'air humide dans une saumure de potassium et de magnésium.",
    note: "Précipité à la toute fin de l'évaporation, quand l'eau presque disparue laisse potassium et magnésium cristalliser de concert, ce sel attire tant l'humidité qu'il se dissout à l'air libre et ne se conserve qu'en récipient hermétique. Sa teinte rosée tient aux paillettes d'hématite qu'il emprisonne. Présent dans les couches potassiques d'Alsace, il forme ailleurs (Oural, Allemagne) un minerai majeur de potasse.",
  },
  cryolite: {
    nom: "Cryolite", formule: "Na₃AlF₆", famille: "Halogénure complexe (fluoroaluminate)",
    systeme: "monoclinique", durete: 2.5, densite: 2.97,
    clivage: "aucun (pseudo-clivages)", eclat: "vitreux à gras",
    couleurs: "blanc neigeux, incolore, grisâtre",
    contexte: "Le seul gisement d'importance mondiale est la pegmatite d'Ivigtut, au Groenland, épuisée en 1987.",
    stabilite: 3, swatch: "#e8ecf0",
    devient: "S'altère lentement en donnant des fluorures secondaires rares.",
    note: "Surnommée « pierre de glace » (kryos), la cryolite possède un indice de réfraction si voisin de celui de l'eau qu'un fragment immergé dans du verre disparaît à l'œil. Son gisement unique, Ivigtut au Groenland, est aujourd'hui épuisé. Elle a néanmoins rendu possible l'électrolyse de l'aluminium : dans le procédé Héroult, qui porte le nom de son inventeur français, la cryolite fondue dissout l'alumine. On la fabrique désormais par synthèse.",
  },
  atacamite: {
    nom: "Atacamite", formule: "Cu₂Cl(OH)₃", famille: "Oxyhalogénure",
    systeme: "orthorhombique", durete: 3.25, densite: 3.76,
    clivage: "parfait {001} ({010} dans la notation Pnam des ouvrages)", eclat: "adamantin à vitreux",
    couleurs: "vert émeraude à vert noirâtre",
    contexte: "Sous un climat hyper-aride, où la pluie reste sous 5 % de l'ETP, les minerais de cuivre s'oxydent en présence du chlore des embruns, qui prend la place du CO₂ (désert d'Atacama).",
    stabilite: 4, swatch: "#1f7a4d",
    devient: "Elle demeure stable en milieu désertique ; dès que la pluie dépasse 65 % de l'ETP, la malachite la supplante.",
    note: "Surnommé « vert du désert », ce minéral naît là où la pluie fait défaut : c'est le sel marin des brouillards côtiers qui attaque le cuivre, en remplacement de la malachite carbonatée. On le retrouve également dans la patine des bronzes marins, et sur les mâchoires d'un ver marin prédateur (Glycera), dont les crocs se durcissent à l'atacamite.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 3);
  c.groupes = [
    {
      nom: "Halogénures simples", code: "III.A", motif: "Association d'un métal et d'un halogène (NaCl, KCl, CaF₂, AgCl).",
      note: "Du sel de table à la fluorine, on parle de sels « francs ». Les chlorures alcalins se dissolvent avec une grande facilité, mais la fluorine, beaucoup plus résistante, s'écarte de cette règle et forme des filons réels (Morvan, Tarn, Chaillac).",
      mineraux: ["halite_m", "sylvite", "fluorine", "chlorargyrite"],
    },
    {
      nom: "Halogénures doubles & hydratés", code: "III.B-C", motif: "Présence simultanée de deux métaux et/ou d'eau dans la formule (KMgCl₃·6H₂O, Na₃AlF₆).",
      note: "Cette famille regroupe les sels de la fin de l'évaporation, comme la carnallite déliquescente, ainsi que des raretés à l'image de la cryolite du Groenland, « pierre » qui semble disparaître dans l'eau.",
      mineraux: ["carnallite", "cryolite"],
    },
    {
      nom: "Oxyhalogénures", code: "III.D", motif: "halogène + OH/O (Cu₂Cl(OH)₃)",
      note: "Quand le chlore prend part à l'altération, il produit les teintes vertes de l'atacamite dans les déserts côtiers, où les embruns tiennent lieu de pluie.",
      mineraux: ["atacamite"],
    },
  ];
})();
