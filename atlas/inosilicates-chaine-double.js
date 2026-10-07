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
    nom: "Anthophyllite", formule: "(Mg,Fe)₇Si₈O₂₂(OH)₂", famille: "Inosilicate — amphibole ferromagnésienne",
    systeme: "orthorhombique", durete: 5.75, densite: 3.0, stabilite: 4, swatch: "#9a8a6a",
    clivage: "parfait à ~54°/126°", eclat: "vitreux à soyeux (fibreux)",
    couleurs: "brun-gris, brun-vert, beige clair",
    contexte: "Roches métamorphiques magnésiennes (métapéridotites, cordiéritites).",
    devient: "→ talc + chlorite, puis argiles.",
    note: "La seule amphibole courante du système orthorhombique. Son nom vient du latin anthophyllum, « girofle », pour sa teinte brune. Ses variétés fibreuses figurent parmi les amiantes réglementés.",
  },
  cummingtonite: {
    nom: "Cummingtonite", formule: "(Mg,Fe)₇Si₈O₂₂(OH)₂", famille: "Inosilicate — amphibole ferromagnésienne",
    systeme: "monoclinique", durete: 5.5, densite: 3.3, stabilite: 4, swatch: "#8a7a5a",
    clivage: "parfait à ~55°/125°", eclat: "vitreux à soyeux",
    couleurs: "brun clair, beige, vert-gris",
    contexte: "Amphibolites et gneiss métamorphiques régionaux.",
    devient: "→ chlorite + argiles.",
    note: "L'équivalent monoclinique de l'anthophyllite, souvent en agrégats fibro-lamellaires. Elle forme une série continue avec la grunérite, son pôle ferreux. Nommée d'après Cummington, dans le Massachusetts.",
  },
  grunerite: {
    nom: "Grunérite", formule: "Fe₇Si₈O₂₂(OH)₂", famille: "Inosilicate — amphibole ferromagnésienne",
    systeme: "monoclinique", durete: 5.5, densite: 3.6, stabilite: 4, swatch: "#6a5240",
    clivage: "parfait à ~55°/125°", eclat: "vitreux à soyeux",
    couleurs: "brun, brun-vert foncé",
    contexte: "Formations de fer rubanées (BIF) métamorphisées.",
    devient: "→ oxydes de fer + argiles.",
    note: "Le pôle ferreux de la série. Sa variété fibreuse, l'amosite ou « amiante brun », a été exploitée dans les formations de fer d'Afrique du Sud — c'est l'un des amiantes réglementés. Le nom amosite vient d'ailleurs des initiales de la compagnie minière (Asbestos Mines of South Africa).",
  },

  // ---------- Amphiboles calciques (le cœur du groupe) ----------
  tremolite: {
    nom: "Trémolite", formule: "Ca₂Mg₅Si₈O₂₂(OH)₂", famille: "Inosilicate — amphibole calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.0, stabilite: 4, swatch: "#d8ddd0",
    clivage: "parfait à ~56°/124°", eclat: "vitreux à soyeux",
    couleurs: "blanc, gris, vert très pâle (si un peu de fer)",
    contexte: "Marbres dolomitiques et skarns : dolomies siliceuses métamorphisées.",
    devient: "→ talc + calcite, puis argiles.",
    note: "Le pôle magnésien de la série trémolite–actinote, blanc et fibreux. Deux visages opposés selon sa forme : fibreuse, c'est l'un des amiantes les plus dangereux ; compacte et enchevêtrée, c'est la NÉPHRITE, l'un des deux jades, travaillée depuis la préhistoire pour sa ténacité.",
  },
  hornblende: {
    nom: "Hornblende", formule: "(Ca,Na)₂(Mg,Fe,Al)₅(Si,Al)₈O₂₂(OH)₂", famille: "Inosilicate — amphibole calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.2, stabilite: 3, swatch: "#2f3a2f",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "vert sombre à noir, brun-noir",
    contexte: "Roches magmatiques et métamorphiques : granites, diorites, andésites, amphibolites.",
    devient: "→ chlorite + smectites + oxydes de fer.",
    note: "L'amphibole la plus commune, l'équivalent hydraté de l'augite : on la trouve dans une immense variété de roches. « Hornblende » n'est pas une espèce unique mais un nom de série. Ses longues sections losangiques à clivage à 120° la distinguent au premier coup d'œil des pyroxènes, clivés à 90°.",
  },
  pargasite: {
    nom: "Pargasite", formule: "NaCa₂(Mg₄Al)(Si₆Al₂)O₂₂(OH)₂", famille: "Inosilicate — amphibole calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.1, stabilite: 4, swatch: "#4a6a4a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "vert-brun, brun, bleu-vert",
    contexte: "Roches ultramafiques, marbres, xénolites du manteau.",
    devient: "→ chlorite + argiles.",
    note: "Une hornblende sodi-alumineuse magnésienne, nommée d'après Pargas, en Finlande. Elle compte parmi les rares minéraux hydratés stables dans le manteau supérieur : elle y stocke de l'eau et du potassium, et sa déshydratation contribue à déclencher la fusion partielle qui engendre les magmas.",
  },
  kaersutite: {
    nom: "Kaersutite", formule: "NaCa₂(Mg,Fe)₄Ti(Si₆Al₂)O₂₂(O,OH)₂", famille: "Inosilicate — amphibole calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.2, stabilite: 3, swatch: "#5a3a2a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "brun sombre, brun-rouge, noir",
    contexte: "Basaltes alcalins et enclaves du manteau (Kaersut, Groenland).",
    devient: "→ oxydes de fer et de titane + argiles.",
    note: "L'amphibole titanifère brune des magmas alcalins et des xénolites mantelliques. Sa présence dans ces enclaves signale un manteau « métasomatisé » — imprégné en profondeur de fluides riches en eau, titane et potassium.",
  },

  // ---------- Amphiboles sodi-calciques (charnière) ----------
  richterite: {
    nom: "Richtérite", formule: "Na(NaCa)Mg₅Si₈O₂₂(OH)₂", famille: "Inosilicate — amphibole sodi-calcique",
    systeme: "monoclinique", durete: 5.5, densite: 3.0, stabilite: 4, swatch: "#b06a5a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "brun, jaune, rose-brun, orangé",
    contexte: "Skarns et gisements à manganèse, roches alcalines, veines hydrothermales.",
    devient: "→ argiles + oxydes.",
    note: "L'amphibole de transition entre calciques et sodiques : sodium et calcium s'y partagent les grands sites. Sa variété potassique, la K-richtérite, est signalée dans des roches du manteau profond et jusque dans des inclusions de diamants — témoin de fluides potassiques à très grande profondeur.",
  },

  // ---------- Amphiboles sodiques (alcalines, souvent bleues) ----------
  riebeckite: {
    nom: "Riébeckite", formule: "Na₂Fe²⁺₃Fe³⁺₂Si₈O₂₂(OH)₂", famille: "Inosilicate — amphibole sodique",
    systeme: "monoclinique", durete: 5.5, densite: 3.4, stabilite: 3, swatch: "#2a3a5a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux à soyeux (fibreux)",
    couleurs: "bleu foncé à noir",
    contexte: "Granites et syénites alcalins ; formations de fer (crocidolite).",
    devient: "→ oxydes de fer + argiles.",
    note: "L'amphibole sodique bleu-noir des granites alcalins. Sa forme fibreuse est la CROCIDOLITE, l'« amiante bleu » — le plus dangereux de tous. Et quand cette crocidolite est silicifiée par le quartz, elle donne l'ŒIL-DE-TIGRE, la pierre aux reflets chatoyants.",
  },
  arfvedsonite: {
    nom: "Arfvedsonite", formule: "Na₃Fe²⁺₄Fe³⁺Si₈O₂₂(OH)₂", famille: "Inosilicate — amphibole sodique",
    systeme: "monoclinique", durete: 5.5, densite: 3.4, stabilite: 3, swatch: "#24302a",
    clivage: "parfait à ~56°/124°", eclat: "vitreux",
    couleurs: "vert-noir à noir, reflets bleutés",
    contexte: "Syénites néphéliniques et pegmatites alcalines (Groenland, Kola).",
    devient: "→ oxydes de fer + argiles.",
    note: "L'amphibole des magmas alcalins les plus évolués, presque noire, au fort pléochroïsme bleu-vert. Nommée d'après le chimiste suédois Arfwedson, le découvreur du lithium. Elle accompagne l'aegyrine et l'eudialyte dans le massif d'Ilímaussaq, au Groenland.",
  },
});

// ---------- Sous-familles des amphiboles (chaîne double) ----------
const INO2_SOUS_FAMILLES = [
  {
    nom: "Amphiboles ferromagnésiennes",
    formule: "(Mg,Fe)₇Si₈O₂₂(OH)₂",
    note: "Les amphiboles sans calcium ni sodium, bâties sur le fer et le magnésium. L'anthophyllite est orthorhombique, les autres monocliniques. Ce sont des minéraux métamorphiques ternes, et plusieurs de leurs formes fibreuses sont des amiantes réglementés (l'amosite, « amiante brun », est de la grunérite).",
    mineraux: ["anthophyllite", "cummingtonite", "grunerite"],
  },
  {
    nom: "Amphiboles calciques",
    formule: "Ca₂(Mg,Fe,Al)₅Si₈O₂₂(OH)₂ — monocliniques",
    note: "Le cœur des amphiboles, avec du calcium dans le grand site — l'équivalent hydraté des clinopyroxènes calciques. La série trémolite (Mg) → actinote (Fe), puis la hornblende, version « impure » ubiquiste des roches, et enfin les hornblendes sodi-alumineuses (pargasite) et titanifères (kaersutite) du manteau et des magmas profonds.",
    mineraux: ["tremolite", "actinote", "hornblende", "pargasite", "kaersutite"],
  },
  {
    nom: "Amphiboles sodi-calciques",
    formule: "Na(Ca,Na)Mg₅Si₈O₂₂(OH)₂ — monocliniques",
    note: "La charnière entre amphiboles calciques et sodiques : sodium ET calcium se partagent les grands sites. La richtérite en est le représentant courant, des skarns aux roches du manteau profond.",
    mineraux: ["richterite"],
  },
  {
    nom: "Amphiboles sodiques (alcalines)",
    formule: "Na₂(Mg,Fe,Al)₅Si₈O₂₂(OH)₂ — monocliniques",
    note: "Les amphiboles bleues et bleu-noir, où le sodium remplace le calcium. Deux mondes : la très haute pression des subductions (glaucophane, le bleu des schistes bleus) et les magmas alcalins (riébeckite, arfvedsonite). La forme fibreuse de la riébeckite est la crocidolite, l'amiante bleu.",
    mineraux: ["glaucophane", "riebeckite", "arfvedsonite"],
  },
];

// On AJOUTE ces sous-familles à la section « chaîne double » du même groupe Inosilicates
const INO2_SECTION = "Chaîne double — amphiboles";
INO2_SOUS_FAMILLES.forEach((sf) => { sf.section = INO2_SECTION; });

(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const ino = silicates.groupes.find((g) => g.nom.startsWith("Inosilicates"));
  ino.sousGroupes = (ino.sousGroupes || []).concat(INO2_SOUS_FAMILLES);
  ino.mineraux = (ino.mineraux || []).concat(INO2_SOUS_FAMILLES.flatMap((sf) => sf.mineraux));
})();
