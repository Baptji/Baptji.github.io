// ============================================================
// INOSILICATES À CHAÎNE DOUBLE (Strunz 9.D) — les AMPHIBOLES
// Deux chaînes simples soudées en ruban : le motif Si₄O₁₁, et
// surtout des groupes OH — les amphiboles sont HYDRATÉES, à la
// différence des pyroxènes. D'où leurs clivages caractéristiques
// à ~120° (contre ~90° pour les pyroxènes) et une résistance un
// cran meilleure à l'altération.
//
// Même classe que les pyroxènes chez Strunz (9.D) : on les réunit
// donc dans le MÊME groupe de l'atlas, séparés seulement par une
// SECTION interne « chaîne simple / chaîne double ».
//
// Classées par chimie du grand site cationique :
//   ferromagnésiennes (Fe-Mg) · calciques (le gros groupe) ·
//   sodi-calciques · sodiques (alcalines, souvent bleues).
//
// Chargé après inosilicates-chaine-simple.js, avant app.js.
// ============================================================

Object.assign(MINERAUX, {
  // ---------- Amphiboles ferromagnésiennes (Fe-Mg, sans Ca) ----------
  anthophyllite: {
    nom: "Anthophyllite", formule: "(Mg,Fe)₇Si₈O₂₂(OH)₂", famille: "Inosilicate : amphibole ferromagnésienne",
    systeme: "orthorhombique", durete: 5.75, densite: 3.0, stabilite: 4, swatch: "#9a8a6a",
    clivage: "parfait à ~54°/126°", eclat: "vitreux à soyeux (fibreux)",
    couleurs: "brun-gris, brun-vert, beige clair",
    contexte: "Roches métamorphiques magnésiennes (métapéridotites, cordiéritites).",
    devient: "→ talc + chlorite, puis argiles.",
    note: "L'unique amphibole courante du système orthorhombique. Son nom dérive du latin anthophyllum, « girofle », en raison de sa teinte brune. Ses variétés fibreuses comptent parmi les amiantes réglementés.",
  },
  cummingtonite: {
    nom: "Cummingtonite", formule: "(Mg,Fe)₇Si₈O₂₂(OH)₂", famille: "Inosilicate : amphibole ferromagnésienne",
    systeme: "monoclinique", durete: 5.5, densite: 3.3, stabilite: 4, swatch: "#8a7a5a",
    clivage: "parfait à ~55°/125°", eclat: "vitreux à soyeux",
    couleurs: "brun clair, beige, vert-gris",
    contexte: "Amphibolites et gneiss métamorphiques régionaux.",
    devient: "→ chlorite + argiles.",
    note: "Équivalent monoclinique de l'anthophyllite, qui se présente souvent en agrégats fibro-lamellaires. Elle constitue une série continue avec la grunérite, son pôle ferreux. Son nom vient de Cummington, dans le Massachusetts.",
  },
  grunerite: {
    nom: "Grunérite", formule: "Fe₇Si₈O₂₂(OH)₂", famille: "Inosilicate : amphibole ferromagnésienne",
    systeme: "monoclinique", durete: 5.5, densite: 3.6, stabilite: 4, swatch: "#6a5240",
    clivage: "parfait à ~55°/125°", eclat: "vitreux à soyeux",
    couleurs: "brun, brun-vert foncé",
    contexte: "On la rencontre dans les formations de fer rubanées (BIF) métamorphisées.",
    devient: "→ oxydes de fer + argiles.",
    note: "Pôle ferreux de la série. Sous forme fibreuse, l'amosite, dite « amiante brun », fut extraite des formations de fer sud-africaines : elle compte parmi les amiantes réglementés. Son nom provient des initiales de la société minière Asbestos Mines of South Africa.",
  },

  // ---------- Amphiboles calciques (le cœur du groupe) ----------
  tremolite: {
    nom: "Trémolite", formule: "Ca₂Mg₅Si₈O₂₂(OH)₂", famille: "Inosilicate : amphibole calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.0, stabilite: 4, swatch: "#d8ddd0",
    clivage: "parfait à ~56°/124°", eclat: "vitreux à soyeux",
    couleurs: "blanc, gris, vert très pâle (si un peu de fer)",
    contexte: "Elle se rencontre dans les marbres dolomitiques et les skarns, issus de dolomies siliceuses métamorphisées.",
    devient: "→ talc + calcite, puis argiles.",
    note: "Pôle magnésien de la série trémolite-actinote, blanc et fibreux. Il présente deux visages opposés selon sa forme : à l'état fibreux, il compte parmi les amiantes les plus dangereux ; compact et enchevêtré, il forme la néphrite, l'un des deux jades, travaillée depuis la préhistoire pour sa ténacité.",
  },
  hornblende: {
    nom: "Hornblende", formule: "(Ca,Na)₂(Mg,Fe,Al)₅(Si,Al)₈O₂₂(OH)₂", famille: "Inosilicate : amphibole calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.2, stabilite: 3, swatch: "#2f3a2f",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "vert sombre à noir, brun-noir",
    contexte: "On la trouve dans les roches magmatiques et métamorphiques : granites, diorites, andésites et amphibolites.",
    devient: "→ chlorite + smectites + oxydes de fer.",
    note: "L'amphibole la plus répandue, équivalent hydraté de l'augite, se rencontre dans une grande diversité de roches. Le terme « hornblende » désigne une série plutôt qu'une espèce unique. Ses longues sections losangiques, à clivage de 120°, permettent de la distinguer à première vue des pyroxènes, qui se clivent à 90°.",
  },
  pargasite: {
    nom: "Pargasite", formule: "NaCa₂(Mg₄Al)(Si₆Al₂)O₂₂(OH)₂", famille: "Inosilicate : amphibole calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.1, stabilite: 4, swatch: "#4a6a4a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "vert-brun, brun, bleu-vert",
    contexte: "Elle se rencontre dans les roches ultramafiques, les marbres et les xénolites du manteau.",
    devient: "→ chlorite + argiles.",
    note: "Hornblende magnésienne, sodique et alumineuse, nommée d'après Pargas, en Finlande. Elle figure parmi les rares minéraux hydratés stables dans le manteau supérieur : elle y stocke eau et potassium, et sa déshydratation contribue à déclencher la fusion partielle à l'origine des magmas.",
  },
  kaersutite: {
    nom: "Kaersutite", formule: "NaCa₂(Mg,Fe)₄Ti(Si₆Al₂)O₂₂(O,OH)₂", famille: "Inosilicate : amphibole calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.2, stabilite: 3, swatch: "#5a3a2a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "brun sombre, brun-rouge, noir",
    contexte: "On la trouve dans les basaltes alcalins et dans les enclaves du manteau (Kaersut, Groenland).",
    devient: "→ se décompose en oxydes de fer et de titane, puis en argiles.",
    note: "Brune et titanifère, cette amphibole caractérise les magmas alcalins et les xénolites du manteau. Quand elle figure dans ces enclaves, elle révèle un manteau « métasomatisé », c'est-à-dire infiltré en profondeur par des fluides chargés d'eau, de titane et de potassium.",
  },

  // ---------- Amphiboles sodi-calciques (charnière) ----------
  richterite: {
    nom: "Richtérite", formule: "Na(NaCa)Mg₅Si₈O₂₂(OH)₂", famille: "Inosilicate : amphibole sodi-calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.0, stabilite: 4, swatch: "#b06a5a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "brun, jaune, rose-brun, orangé",
    contexte: "On la rencontre dans les skarns, les gisements de manganèse, les roches alcalines et les veines hydrothermales.",
    devient: "→ argiles + oxydes.",
    note: "Située entre les types calciques et sodiques, cette amphibole partage ses grands sites entre sodium et calcium. Sa variété potassique, la K-richtérite, a été décelée dans des roches du manteau profond, voire dans des inclusions de diamant, ce qui atteste de fluides potassiques à très grande profondeur.",
  },

  // ---------- Amphiboles sodiques (alcalines, souvent bleues) ----------
  riebeckite: {
    nom: "Riébeckite", formule: "Na₂Fe²⁺₃Fe³⁺₂Si₈O₂₂(OH)₂", famille: "Inosilicate : amphibole sodique",
    systeme: "monoclinique", durete: 5.5, densite: 3.4, stabilite: 3, swatch: "#2a3a5a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux à soyeux (fibreux)",
    couleurs: "bleu foncé à noir",
    contexte: "On la rencontre dans les granites et les syénites alcalins, ainsi que dans les formations de fer (crocidolite).",
    devient: "→ oxydes de fer + argiles.",
    note: "Dans les granites alcalins, cette amphibole sodique affiche un bleu noir. Fibreuse, elle forme la crocidolite, ou « amiante bleu », réputée la plus dangereuse. Silicifiée par le quartz, la crocidolite devient l'œil-de-tigre, pierre chatoyante.",
  },
  arfvedsonite: {
    nom: "Arfvedsonite", formule: "Na₃Fe²⁺₄Fe³⁺Si₈O₂₂(OH)₂", famille: "Inosilicate : amphibole sodique",
    systeme: "monoclinique", durete: 5.5, densite: 3.4, stabilite: 3, swatch: "#24302a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "vert-noir à noir, reflets bleutés",
    contexte: "On la trouve dans les syénites néphéliniques et les pegmatites alcalines (Groenland, Kola).",
    devient: "→ oxydes de fer + argiles.",
    note: "Issue des magmas alcalins les plus différenciés, cette amphibole frôle le noir et montre un pléochroïsme bleu-vert prononcé. Elle doit son nom au chimiste suédois Arfwedson, qui découvrit le lithium. Elle côtoie l'aegyrine et l'eudialyte dans le massif d'Ilímaussaq, au Groenland.",
  },
});

// ---------- Sous-familles des amphiboles (chaîne double) ----------
const INO2_SOUS_FAMILLES = [
  {
    nom: "Amphiboles ferromagnésiennes",
    formule: "(Mg,Fe)₇Si₈O₂₂(OH)₂",
    note: "Les amphiboles dépourvues de calcium et de sodium reposent sur le fer et le magnésium. L'anthophyllite est orthorhombique, les autres sont monocliniques. Ce sont des minéraux métamorphiques ternes, dont plusieurs formes fibreuses comptent parmi les amiantes réglementés (l'amosite, « amiante brun », est de la grunérite).",
    mineraux: ["anthophyllite", "cummingtonite", "grunerite"],
  },
  {
    nom: "Amphiboles calciques",
    formule: "Ca₂(Mg,Fe,Al)₅Si₈O₂₂(OH)₂ : monocliniques",
    note: "Au cœur de la famille des amphiboles, le calcium occupe le grand site : ces minéraux sont l'équivalent hydraté des clinopyroxènes calciques. La filiation court de la trémolite (Mg) à l'actinote (Fe), puis à la hornblende, forme « impure » et très répandue, jusqu'aux hornblendes sodi-alumineuses (pargasite) et titanifères (kaersutite) du manteau et des magmas profonds.",
    mineraux: ["tremolite", "actinote", "hornblende", "pargasite", "kaersutite"],
  },
  {
    nom: "Amphiboles sodi-calciques",
    formule: "Na(Ca,Na)Mg₅Si₈O₂₂(OH)₂ : monocliniques",
    note: "Située entre les amphiboles calciques et sodiques, la richtérite partage les grands sites entre sodium et calcium ; elle est fréquente, des skarns aux roches du manteau profond.",
    mineraux: ["richterite"],
  },
  {
    nom: "Amphiboles sodiques (alcalines)",
    formule: "Na₂(Mg,Fe,Al)₅Si₈O₂₂(OH)₂ : monocliniques",
    note: "Amphiboles bleues et bleu noir, dans lesquelles le sodium remplace le calcium. Elles appartiennent à deux univers : la très haute pression des subductions (glaucophane, qui colore les schistes bleus) et les magmas alcalins (riébeckite, arfvedsonite). Sous forme fibreuse, la riébeckite forme la crocidolite, ou amiante bleu.",
    mineraux: ["glaucophane", "riebeckite", "arfvedsonite"],
  },
];

// On AJOUTE ces sous-familles à la section « chaîne double » du même groupe Inosilicates
const INO2_SECTION = "Chaîne double : amphiboles";
INO2_SOUS_FAMILLES.forEach((sf) => { sf.section = INO2_SECTION; });

(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const ino = silicates.groupes.find((g) => g.nom.startsWith("Inosilicates"));
  ino.sousGroupes = (ino.sousGroupes || []).concat(INO2_SOUS_FAMILLES);
  ino.mineraux = (ino.mineraux || []).concat(INO2_SOUS_FAMILLES.flatMap((sf) => sf.mineraux));
})();
