// ============================================================
// CLASSE III — HALOGÉNURES (Strunz III)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  chlorargyrite: {
    nom: "Chlorargyrite (argent corné)", formule: "AgCl", famille: "Halogénure simple",
    systeme: "cubique", durete: 1.75, densite: 5.55,
    clivage: "aucun — se coupe au couteau comme de la cire", eclat: "résineux à adamantin",
    couleurs: "incolore fraîche → violet-brun à la lumière",
    contexte: "Zone d'oxydation des filons argentifères, surtout en climat aride, pluie < 20 % de l'ETP (Chili, Broken Hill).",
    stabilite: 3, swatch: "#b8a68f",
    devient: "Photosensible (noircit) ; très stable chimiquement en climat sec.",
    note: "L'« argent corné » : une cire minérale qui se taille au canif. C'est de l'argent photographique naturel — même sel AgCl que les pellicules, et même noircissement à la lumière. Dans les déserts miniers du Chili, des colonnes entières de filons oxydés étaient de la chlorargyrite massive : de l'argent à couper au couteau, littéralement.",
  },
  carnallite: {
    nom: "Carnallite", formule: "KMgCl₃·6H₂O", famille: "Halogénure double hydraté",
    systeme: "orthorhombique", durete: 2.5, densite: 1.6,
    clivage: "aucun (cassure conchoïdale)", eclat: "gras, souvent terne",
    couleurs: "incolore, blanc, rose à rouge (inclusions d'hématite)",
    contexte: "Tout dernier précipité des évaporites potassiques ; couches profondes des bassins salifères (Alsace, Stassfurt).",
    stabilite: 1, swatch: "#d99a94",
    devient: "Déliquescente : elle « fond » à l'air humide en saumure de potassium et magnésium.",
    note: "Le sel de la toute fin d'évaporation — quand il ne reste presque plus d'eau, précipitent ensemble potassium et magnésium. Si avide d'eau qu'elle se dissout dans l'humidité de l'air : les échantillons vivent en boîte étanche. Ses teintes rosées viennent de paillettes d'hématite piégées. Présente dans les couches potassiques d'Alsace, elle est ailleurs (Oural, Allemagne) un minerai majeur de potasse.",
  },
  cryolite: {
    nom: "Cryolite", formule: "Na₃AlF₆", famille: "Halogénure complexe (fluoroaluminate)",
    systeme: "monoclinique", durete: 2.5, densite: 2.97,
    clivage: "aucun (pseudo-clivages)", eclat: "vitreux à gras",
    couleurs: "blanc neigeux, incolore, grisâtre",
    contexte: "Un seul grand gisement au monde : la pegmatite d'Ivigtut, Groenland (épuisée en 1987).",
    stabilite: 3, swatch: "#e8ecf0",
    devient: "S'altère lentement en fluorures secondaires rares.",
    note: "La « pierre de glace » (kryos) a un indice de réfraction si proche de celui de l'eau qu'un fragment plongé dans un verre devient invisible. Un seul gisement au monde, Ivigtut au Groenland — épuisé : c'est lui qui a permis l'électrolyse de l'aluminium (procédé Héroult, un Français !), la cryolite fondue dissolvant l'alumine. Aujourd'hui on la synthétise.",
  },
  atacamite: {
    nom: "Atacamite", formule: "Cu₂Cl(OH)₃", famille: "Oxyhalogénure",
    systeme: "orthorhombique", durete: 3.25, densite: 3.76,
    clivage: "parfait {001} ({010} dans la notation Pnam des ouvrages)", eclat: "adamantin à vitreux",
    couleurs: "vert émeraude à vert noirâtre",
    contexte: "Oxydation des minerais de cuivre en climat hyper-aride (pluie < 5 % de l'ETP), où le chlore des embruns remplace le CO₂ (désert d'Atacama).",
    stabilite: 4, swatch: "#1f7a4d",
    devient: "Stable en désert ; en climat humide (pluie > 65 % de l'ETP), cède la place à la malachite.",
    note: "Le vert du désert : là où il ne pleut jamais, c'est le sel marin des brouillards côtiers qui altère le cuivre — au lieu de la malachite carbonatée, naît ce chlorure vert profond. On la trouve aussi… dans la patine des bronzes marins et sur les mâchoires d'un ver marin prédateur (Glycera), qui durcit ses crocs à l'atacamite !",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 3);
  c.groupes = [
    {
      nom: "Halogénures simples", code: "III.A", motif: "métal + halogène (NaCl, KCl, CaF₂, AgCl)",
      note: "Du sel de cuisine à la fluorine des filons : les sels « francs ». Solubilité extrême pour les chlorures alcalins — la fluorine, bien plus robuste, fait exception et bâtit de vrais filons (Morvan, Tarn, Chaillac).",
      mineraux: ["halite_m", "sylvite", "fluorine", "chlorargyrite"],
    },
    {
      nom: "Halogénures doubles & hydratés", code: "III.B-C", motif: "deux métaux et/ou de l'eau (KMgCl₃·6H₂O, Na₃AlF₆)",
      note: "Les sels de la toute fin d'évaporation (carnallite déliquescente) et les curiosités comme la cryolite du Groenland, la pierre qui disparaît dans l'eau.",
      mineraux: ["carnallite", "cryolite"],
    },
    {
      nom: "Oxyhalogénures", code: "III.D", motif: "halogène + OH/O (Cu₂Cl(OH)₃)",
      note: "Quand le chlore s'invite dans l'altération : les verts d'atacamite des déserts côtiers, où les embruns remplacent la pluie.",
      mineraux: ["atacamite"],
    },
  ];
})();
