// ============ Météorites : 4ᵉ famille de roches (chantier B.5, 08/10/2026) ============
// Chargé juste après data.js (avant roches-arbre.js, qui contrôle que chaque fiche est dans l'arbre).
// Le lexique lithologique du BRGM range les « roches météoritiques » à côté des magmatiques, sédimentaires et
// métamorphiques (concept 556, 16 termes). Décision de l'utilisateur (08/10/2026) : une 4ᵉ famille de l'arbre des
// Roches, des fiches au même gabarit que les autres roches, avec la carte des chutes en France ; les minéraux propres
// aux météorites ont leur fiche minéral (meteorites-mineraux.js).
//  - 10 fiches = les termes « feuilles » du lexique (chondrite ordinaire, carbonée, à enstatite ; achondrite primitive,
//    astéroïdale, martienne, lunaire ; météorite de fer ; pallasite ; mésosidérite) ; les termes génériques
//    (roche météoritique, pierreuse, différenciée, non différenciée, chondrite, achondrite, sidérolithe) sont les nœuds
//    de l'arbre (roches-arbre.js).
//  - `CHUTES_FRANCE` : météorites tombées ou trouvées en France métropolitaine, d'après le catalogue de la Meteoritical
//    Society (export « Meteorite Landings » de la NASA, arrêté vers 2013) + la chute de Saint-Pierre-le-Viger (2023).
//    Champ `f` = fiche de l'atlas qui correspond à la classe (null = pierre non classée).
//  - Composition (`mineraux`) : proportions en volume d'une météorite type de la fiche (« exemple suivi »), arrondies.
//    Le fer-nickel pauvre en nickel (kamacite) est compté dans `fer_natif` : l'IMA ne fait pas de la kamacite une espèce.

CATEGORIES.meteoritique = { nom: "Météorite", light: "#a8641f", dark: "#d68a45" };

const CHUTES_FRANCE = [
  // [nom, année, chute (true) ou trouvaille (false), classe, masse en g, lat, lng, fiche]
  ["Ensisheim", 1492, true, "LL6", 127000, 47.867, 7.35, "chondrite_ordinaire"],
  ["Mont Vaisi", 1637, true, "pierre non classée", 17000, 44.083, 6.867, null],
  ["Nicorps", 1750, true, "pierre non classée", null, 49.033, -1.433, null],
  ["Luponnas", 1753, true, "H3-5", 14000, 46.217, 5.0, "chondrite_ordinaire"],
  ["Lucé", 1768, true, "L6", 3500, 47.85, 0.483, "chondrite_ordinaire"],
  ["Aire-sur-la-Lys", 1769, true, "inconnue", null, 50.667, 2.333, null],
  ["Barbotan", 1790, true, "H5", 6400, 43.95, -0.05, "chondrite_ordinaire"],
  ["Salles", 1798, true, "L5", 9000, 46.05, 4.633, "chondrite_ordinaire"],
  ["L'Aigle", 1803, true, "L6", 37000, 48.767, 0.633, "chondrite_ordinaire"],
  ["Apt", 1803, true, "L6", 3200, 43.867, 5.383, "chondrite_ordinaire"],
  ["Asco", 1805, true, "H6", 41, 42.45, 9.033, "chondrite_ordinaire"],
  ["Alais", 1806, true, "CI1", 6000, 44.117, 4.083, "chondrite_carbonee"],
  ["Charsonville", 1810, true, "H6", 27000, 47.933, 1.567, "chondrite_ordinaire"],
  ["Chantonnay", 1812, true, "L6", 31500, 46.683, -1.05, "chondrite_ordinaire"],
  ["Toulouse", 1812, true, "H6", 1030, 43.6, 1.4, "chondrite_ordinaire"],
  ["Agen", 1814, true, "H5", 30000, 44.217, 0.617, "chondrite_ordinaire"],
  ["Chassigny", 1815, true, "martienne (chassignite)", 4000, 47.717, 5.367, "achondrite_martienne"],
  ["Jonzac", 1819, true, "eucrite", 5000, 45.433, -0.45, "achondrite_asteroidale"],
  ["Juvinas", 1821, true, "eucrite", 91000, 44.717, 4.3, "achondrite_asteroidale"],
  ["Angers", 1822, true, "L6", null, 47.467, -0.55, "chondrite_ordinaire"],
  ["Épinal", 1822, true, "H5", 277, 48.183, 6.467, "chondrite_ordinaire"],
  ["Galapian", 1826, true, "H6", 133, 44.3, 0.4, "chondrite_ordinaire"],
  ["La Caille", 1828, false, "fer non groupé", 626000, 43.733, 6.783, "meteorite_fer"],
  ["Vouillé", 1831, true, "L6", 20000, 46.633, 0.167, "chondrite_ordinaire"],
  ["Aubres", 1836, true, "aubrite", 800, 44.383, 5.167, "achondrite_asteroidale"],
  ["Mascombes", 1836, true, "L6", 1000, 45.367, 1.867, "chondrite_ordinaire"],
  ["Esnandes", 1837, true, "L6", 1500, 46.25, -1.1, "chondrite_ordinaire"],
  ["Montlivault", 1838, true, "L6", 500, 47.633, 1.583, "chondrite_ordinaire"],
  ["Château-Renard", 1841, true, "L6", 30000, 47.933, 2.917, "chondrite_ordinaire"],
  ["Saint-Christophe-la-Chartreuse", 1841, true, "L6", 5500, 46.95, -1.5, "chondrite_ordinaire"],
  ["Aumières", 1842, true, "L6", 2000, 44.333, 3.233, "chondrite_ordinaire"],
  ["Favars", 1844, true, "H5", 1500, 44.383, 2.817, "chondrite_ordinaire"],
  ["Le Pressoir", 1845, true, "H5", 3000, 47.167, 0.433, "chondrite_ordinaire"],
  ["Le Teilleul", 1845, true, "howardite", 780, 48.533, -0.867, "achondrite_asteroidale"],
  ["Marmande", 1848, true, "L5", 3000, 44.5, 0.15, "chondrite_ordinaire"],
  ["Quinçay", 1851, true, "L6", 65, 46.6, 0.25, "chondrite_ordinaire"],
  ["Les Ormes", 1857, true, "L6", 125, 48.35, 3.25, "chondrite_ordinaire"],
  ["Ausson", 1858, true, "L5", 50000, 43.083, 0.583, "chondrite_ordinaire"],
  ["Beuste", 1859, true, "L5", 2000, 43.217, -0.233, "chondrite_ordinaire"],
  ["Sologne", 1860, true, "H5", 54, 47.367, 1.733, "chondrite_ordinaire"],
  ["Orgueil", 1864, true, "CI1", 14000, 43.883, 1.383, "chondrite_carbonee"],
  ["Saint-Mesmin", 1866, true, "LL6", 8300, 48.45, 3.933, "chondrite_ordinaire"],
  ["Ornans", 1868, true, "CO3.4", 6000, 47.117, 6.15, "chondrite_carbonee"],
  ["Sauguis", 1868, true, "L6", 4000, 43.15, -0.85, "chondrite_ordinaire"],
  ["Kernouvé", 1869, true, "H6", 80000, 48.117, -3.083, "chondrite_ordinaire"],
  ["Laborel", 1871, true, "H5", 3833, 44.283, 5.583, "chondrite_ordinaire"],
  ["Lancé", 1872, true, "CO3.5", 51700, 47.7, 1.067, "chondrite_carbonee"],
  ["Kerilis", 1874, true, "H5", 5000, 48.4, -3.3, "chondrite_ordinaire"],
  ["Mornans", 1875, true, "H5", 1300, 44.6, 5.133, "chondrite_ordinaire"],
  ["La Bécasse", 1879, true, "L6", 2800, 47.083, 1.75, "chondrite_ordinaire"],
  ["Saint-Caprais-de-Quinsac", 1883, true, "L6", 360, 44.75, 0.05, "chondrite_ordinaire"],
  ["Saint-Germain-du-Pinel", 1890, true, "H6", 4000, 48.017, -1.15, "chondrite_ordinaire"],
  ["Villedieu", 1890, false, "H4", 14000, 47.917, 4.35, "chondrite_ordinaire"],
  ["Lançon", 1897, true, "H6", 7000, 43.75, 5.117, "chondrite_ordinaire"],
  ["Kermichel", 1911, false, "L6", 3000, 47.65, -2.767, "chondrite_ordinaire"],
  ["Saint-Sauveur", 1914, true, "EH5", 14000, 43.733, 1.383, "chondrite_enstatite"],
  ["Montferré", 1923, true, "H5", 149000, 43.391, 1.963, "chondrite_ordinaire"],
  ["Mézel", 1949, true, "L6", 1300, 45.767, 3.25, "chondrite_ordinaire"],
  ["Saint-Chinian", 1959, true, "L6", 134, 43.433, 2.95, "chondrite_ordinaire"],
  ["Sainte-Marguerite", 1962, true, "H4", 4960, 50.767, 3.0, "chondrite_ordinaire"],
  ["Granès", 1964, true, "L6", 9000, 42.9, 2.25, "chondrite_ordinaire"],
  ["Saint-Séverin", 1966, true, "LL6", 271000, 45.3, 0.233, "chondrite_ordinaire"],
  ["Saint-Aubin", 1968, false, "fer IIIAB", 472000, 48.483, 3.583, "meteorite_fer"],
  ["Bouvante", 1978, false, "eucrite", 8300, 44.922, 5.268, "achondrite_asteroidale"],
  ["Chitenay", 1978, true, "L6", 4000, 47.471, 0.977, "chondrite_ordinaire"],
  ["Henvic", 1991, false, "L5", 19, 48.65, -3.917, "chondrite_ordinaire"],
  ["Mont-Dieu", 1994, false, "fer non groupé", 360000, 49.55, 4.867, "meteorite_fer"],
  ["Bacqueville", 1999, false, "H6", 395, 49.322, 1.366, "chondrite_ordinaire"],
  ["Contis-Plage", 2000, false, "H5", 44, 44.083, -1.317, "chondrite_ordinaire"],
  ["Alby-sur-Chéran", 2002, true, "eucrite", 252, 45.821, 6.015, "achondrite_asteroidale"],
  ["Plancy-l'Abbaye", 2003, false, "H4", 180, 48.567, 4.033, "chondrite_ordinaire"],
  ["Saint-Pierre-le-Viger", 2023, true, "L5-6", null, 49.83, 0.86, "chondrite_ordinaire"],
];

// régions (pastilles de la carte) d'une fiche : ses chutes en France ; `etranger` = site de référence hors de France
function chutesDe(id) {
  return CHUTES_FRANCE.filter((c) => c[7] === id).map(([nom, an, chute, cl, g, lat, lng]) =>
    ({ nom: `${nom} — ${chute ? "chute" : "trouvée"} en ${an}${g ? `, ${g >= 1000 ? (Math.round(g / 100) / 10).toLocaleString("fr-FR") + " kg" : g + " g"}` : ""} (${cl})`, lat, lng }));
}

ROCHES.push(
  // ───────────────────────────── chondrites ─────────────────────────────
  {
    id: "chondrite_ordinaire", nom: "Chondrite ordinaire", categorie: "meteoritique", sousType: "météorite pierreuse primitive",
    swatch: "#8a8172", densite: 3350,
    description: "La météorite la plus courante : environ huit chutes sur dix. Une roche grise, constellée de petites billes de 0,2 à 2 mm, les chondres, gouttes de silicates fondues et refigées dans le disque de gaz et de poussières qui entourait le jeune Soleil, il y a 4 567 millions d'années. Elle n'a jamais fondu depuis : c'est un échantillon de la matière dont sont faites les planètes. Celle de L'Aigle, en 1803, a convaincu l'Académie des sciences que des pierres tombent du ciel.",
    mineralogie: "Olivine et pyroxène pauvre en calcium (enstatite) dominent, en chondres et en grains fins entre eux ; un peu de plagioclase ; des grains de fer-nickel (kamacite et taénite, 2 à 19 % selon le groupe) et de sulfure de fer (troïlite) ; chromite et phosphates accessoires. Croûte de fusion noire de moins d'un millimètre.",
    mineraux: [["olivine", 44], ["enstatite", 24], ["plagioclases", 10], ["troilite", 6], ["fer_natif", 6], ["diopside", 5], ["taenite", 2], ["chromite", 1], ["merrillite", 1]],
    varietes: [
      { nom: "chondrite H", note: "« High iron » : la plus riche en fer métal (15 à 19 %). Un corps parent probable : l'astéroïde (6) Hébé. Montferré (Ariège, 1923, 149 kg), Kernouvé (Morbihan, 1869, 80 kg)." },
      { nom: "chondrite L", note: "« Low iron » : 4 à 10 % de fer métal, olivine plus riche en fer. L'Aigle (Orne, 1803), Chantonnay (Vendée, 1812), Saint-Pierre-le-Viger (Seine-Maritime, 2023)." },
      { nom: "chondrite LL", note: "« Low iron, low metal » : 1 à 3 % de fer métal seulement. Ensisheim (1492, 127 kg) et Saint-Séverin (Charente, 1966, 271 kg), la plus grosse chute observée en France." },
      { nom: "chondrite de type 3 (non équilibrée)", note: "Presque pas chauffée sur son astéroïde : chondres nets, matrice fine et sombre, minéraux de compositions variées (type 3,0 à 3,9). Luponnas (Ain, 1753) est classée H3-5." },
      { nom: "chondrite de type 6 (équilibrée)", note: "Chauffée vers 750–950 °C au cœur de l'astéroïde, sans fondre : les chondres s'estompent, la matrice a recristallisé et du plagioclase est apparu. L'Aigle (L6), Ensisheim (LL6)." },
    ],
    regions: chutesDe("chondrite_ordinaire"),
    ages: [
      { de: 4567.3, a: 4564.7, label: "Chondres : 4 567,3 à 4 564,7 Ma (âges plomb-plomb, Connelly et al. 2012)" },
      { de: 4563, a: 4500, label: "Refroidissement de l'astéroïde : Sainte-Marguerite (H4) vers 4 563 Ma, Kernouvé (H6) vers 4 522 Ma (Göpel et al. 1994)" },
    ],
    alteration: {
      facilite: 4,
      mecanisme: "Sur Terre, le fer métal et la troïlite rouillent les premiers : des auréoles brunes (goethite, akaganéite, riche en chlore) gagnent la pierre, puis l'olivine et le pyroxène s'argilisent. Les météoriticiens notent ce degré de W0 (intacte) à W6 (silicates remplacés par des argiles et des oxydes).",
      climat: "Une chondrite tombée en climat humide rouille en quelques années et ne survit que quelques siècles à quelques milliers d'années. Dans les déserts chauds, elle tient en général moins de 50 000 ans ; dans la glace de l'Antarctique, jusqu'à plusieurs centaines de milliers d'années (Bland et al. 1996).",
    },
    usages: "Objets de musée et de recherche : la datation des chondres et des inclusions réfractaires donne l'âge du Système solaire. La pierre d'Ensisheim est exposée depuis cinq siècles au musée de la Régence.",
    wikipedia: "https://fr.wikipedia.org/wiki/Chondrite_ordinaire",
  },
  {
    id: "chondrite_carbonee", nom: "Chondrite carbonée", categorie: "meteoritique", sousType: "météorite pierreuse primitive",
    swatch: "#2a2724", densite: 1600,
    description: "Une pierre noire et friable, qui tache les doigts : jusqu'à 3 % de carbone, sous forme de matière organique, et jusqu'à 20 % d'eau, prise dans des argiles. Les plus primitives, comme celle d'Orgueil (Tarn-et-Garonne, 1864), ont la composition chimique du Soleil, moins les gaz. On y a trouvé des acides aminés venus de l'espace et des grains de poussière plus vieux que le Soleil.",
    mineralogie: "Type CI (Orgueil) : une matrice noire de phyllosilicates (serpentine et saponite, formées par l'eau sur l'astéroïde), des amas de magnétite en framboises, des sulfures de fer et de nickel, des grains de carbonates et de la matière organique. Pas de chondres. Les autres groupes (CM, CO, CV…) gardent des chondres et des inclusions réfractaires blanches.",
    mineraux: [["serpentine", 57], ["smectites_m", 22], ["magnetite", 10], ["pyrrhotite", 5], ["matorg", 3], ["dolomite", 3]],
    varietes: [
      { nom: "CI (type Ivuna)", note: "Sans chondres, la plus riche en eau (jusqu'à 20 %) ; jamais chauffée au-delà de 50 à 150 °C. Cinq chutes connues dans le monde, dont deux en France : Alais (Gard, 1806, la première chondrite carbonée reconnue) et Orgueil (1864, 14 kg, la plus grosse)." },
      { nom: "CM (type Mighei)", note: "Chondres et inclusions réfractaires dans une matrice argileuse : altérée par l'eau, mais moins que les CI. Murchison (Australie, 1969) a livré plus de 70 acides aminés." },
      { nom: "CO (type Ornans)", note: "Petits chondres (≈ 0,15 mm) serrés dans une matrice qui fait environ 30 % de la roche, peu d'eau. Le groupe porte le nom d'Ornans (Doubs, 1868) ; Lancé (Loir-et-Cher, 1872, 52 kg) en fait partie." },
      { nom: "CV (type Vigarano)", note: "Gros chondres (≈ 1 mm) et grandes inclusions blanches riches en calcium et en aluminium, les plus vieux solides datés : 4 567,3 millions d'années. Allende (Mexique, 1969, plus de 2 tonnes)." },
      { nom: "CR (type Renazzo)", note: "Chondres entourés de fer métal, matrice altérée par l'eau. Renazzo (Italie, 1824)." },
    ],
    regions: chutesDe("chondrite_carbonee"),
    ages: [
      { de: 4567.3, a: 4567.3, label: "Inclusions réfractaires (CV) : 4 567,3 Ma, les plus vieux solides du Système solaire (Connelly et al. 2012)" },
      { de: 4564, a: 4560, label: "Altération par l'eau sur l'astéroïde : quelques millions d'années après (carbonates datés par le manganèse 53, Fujiya et al. 2012)" },
    ],
    alteration: {
      facilite: 5,
      mecanisme: "Friable et poreuse (≈ 35 % de vides), elle absorbe l'humidité de l'air : ses sulfures s'oxydent et des sulfates blancs (gypse, epsomite) cristallisent à la surface et dans les fissures. Les veines blanches d'Orgueil se sont formées ainsi, dans les tiroirs des musées, après sa chute (Gounelle et Zolensky 2001).",
      climat: "C'est la météorite la plus fragile : une CI laissée dehors se délite en quelques années. On n'en connaît que par des chutes observées et ramassées aussitôt, ou par la glace de l'Antarctique.",
    },
    usages: "Échantillons de référence de la composition du Système solaire (abondances « CI ») ; étude de l'eau et de la matière organique d'origine extraterrestre.",
    wikipedia: "https://fr.wikipedia.org/wiki/Chondrite_carbon%C3%A9e",
  },
  {
    id: "chondrite_enstatite", nom: "Chondrite à enstatite", categorie: "meteoritique", sousType: "météorite pierreuse primitive",
    swatch: "#6f6d68", densite: 3600,
    description: "La roche la plus pauvre en oxygène que l'on connaisse : presque tout son fer est en métal ou en sulfure, aucun dans les silicates. Elle s'est formée près du Soleil, dans la région de Mercure ou de la Terre ; ses atomes d'oxygène ont la même signature que ceux de la Terre et de la Lune. On la croyait sèche, mais elle contient assez d'hydrogène pour avoir apporté à la Terre au moins trois fois l'eau de ses océans (Piani et al. 2020, Nancy).",
    mineralogie: "Chondres et grains d'enstatite presque pure (MgSiO₃, sans fer), beaucoup de fer-nickel (kamacite chargée de silicium) et de troïlite ; des minéraux qui ne naissent que sans oxygène : oldhamite (sulfure de calcium), niningerite (sulfure de magnésium), daubréelite, schreibersite. Un peu de plagioclase et de silice.",
    mineraux: [["enstatite", 61], ["fer_natif", 19], ["troilite", 9], ["plagioclases", 6], ["schreibersite", 1.5], ["cristobalite", 1.5], ["oldhamite", 1], ["daubreelite", 1]],
    varietes: [
      { nom: "EH (« high iron »)", note: "Petits chondres (≈ 0,2 mm), plus de 10 % de métal, qui contient environ 3 % de silicium. Saint-Sauveur (Haute-Garonne, 1914, 14 kg) est une EH5." },
      { nom: "EL (« low iron »)", note: "Chondres plus gros (plus de 0,5 mm), moins de métal (≈ 1 % de silicium dedans). L'astéroïde (21) Lutétia, survolé par la sonde Rosetta en 2010, pourrait être de ce type." },
    ],
    regions: chutesDe("chondrite_enstatite"),
    ages: [{ de: 4567, a: 4562, label: "Chondres et accrétion de l'astéroïde : dans les premiers millions d'années du Système solaire" }],
    alteration: {
      facilite: 5,
      mecanisme: "Son métal riche en silicium, ses sulfures de calcium et de magnésium sont instables à l'air humide : l'oldhamite se dissout et sent l'œuf pourri (sulfure d'hydrogène), le métal rouille. Elle se ternit en quelques jours après la chute.",
      climat: "Elle survit mal hors des déserts froids : à peine 2 % des chondrites qui tombent, et une part encore plus faible des trouvailles.",
    },
    usages: "Recherche : c'est la météorite dont la composition isotopique ressemble le plus à celle de la Terre, ce qui en fait une candidate pour les matériaux qui ont bâti notre planète.",
    wikipedia: "https://fr.wikipedia.org/wiki/Chondrite_%C3%A0_enstatite",
  },
  {
    id: "achondrite_primitive", nom: "Achondrite primitive", categorie: "meteoritique", sousType: "météorite pierreuse, fusion partielle",
    swatch: "#7d735e", densite: 3500,
    description: "Une chondrite qui a commencé à fondre. Chauffée au-delà de 1 000 °C sur son astéroïde, elle a perdu une partie de son métal et de ses premiers liquides, mais garde la composition d'ensemble d'une chondrite et parfois des fantômes de chondres. Elle fait le lien entre les météorites restées intactes et celles des astéroïdes entièrement fondus. Aucune n'est connue en France : la référence est la pierre d'Acapulco (Mexique), ramassée encore tiède en 1976.",
    mineralogie: "Grains d'olivine et de pyroxènes (enstatite, diopside) de taille égale, à jonctions triples à 120° (roche recristallisée, pas cristallisée d'un magma), plagioclase, 10 à 25 % de fer-nickel et de troïlite. Les lodranites, plus chauffées, ont des grains plus gros et moins de plagioclase.",
    mineraux: [["enstatite", 37], ["olivine", 28], ["fer_natif", 12], ["plagioclases", 11], ["troilite", 5], ["diopside", 5], ["chromite", 1], ["merrillite", 1]],
    varietes: [
      { nom: "acapulcoïte", note: "Grain fin (≈ 0,2 mm), un peu de liquide parti : Acapulco (Mexique, chute du 11 août 1976, 1,9 kg). Une centaine de pierres connues." },
      { nom: "lodranite", note: "Grain grossier (0,5 à 1 mm) : le résidu après le départ du liquide de fer-sulfure (vers 980 °C) et d'une partie du liquide silicaté. Lodran (Pakistan, 1868). Même astéroïde que les acapulcoïtes, mais plus profond." },
      { nom: "winonaïte", note: "Proche des chondrites à enstatite, liée aux fers du groupe IAB qui contiennent des inclusions de même nature. Winona (Arizona), trouvée en 1928 dans une sépulture amérindienne." },
      { nom: "uréilite", note: "Olivine et pigeonite avec du graphite et de petits diamants entre les grains ; rangée tantôt parmi les achondrites primitives, tantôt à part. Novo-Urei (Russie, 1886)." },
    ],
    regions: [{ nom: "Acapulco (Mexique) — chute du 11 août 1976, 1,9 kg (acapulcoïte de référence)", lat: 16.883, lng: -99.9, etranger: true }],
    ages: [{ de: 4563.1, a: 4562.6, label: "Refroidissement sous ≈ 1 000 °C : 4 563,1 à 4 562,6 Ma (hafnium-tungstène, astéroïde des acapulcoïtes)" }],
    alteration: {
      facilite: 4,
      mecanisme: "Comme une chondrite riche en métal : le fer-nickel et la troïlite rouillent d'abord, les silicates s'argilisent ensuite.",
      climat: "Presque toutes ont été trouvées dans les déserts chauds et en Antarctique, où l'altération est lente.",
    },
    usages: "Recherche sur les premiers pas de la fusion des astéroïdes : comment le métal et les liquides se séparent des silicates.",
    wikipedia: "https://fr.wikipedia.org/wiki/Classification_des_m%C3%A9t%C3%A9orites",
  },
  // ───────────────────────────── achondrites ─────────────────────────────
  {
    id: "achondrite_asteroidale", nom: "Achondrite astéroïdale", categorie: "meteoritique", sousType: "météorite pierreuse différenciée",
    swatch: "#9c968a", densite: 3100,
    description: "Un basalte venu d'un astéroïde. Ces roches se sont formées comme celles des volcans terrestres, dans la croûte d'astéroïdes assez gros pour avoir fondu dans les premiers millions d'années du Système solaire. La plupart, les eucrites, diogénites et howardites, viennent de (4) Vesta, le deuxième plus gros astéroïde, cartographié par la sonde Dawn en 2011-2012. La France en a vu tomber plusieurs : Juvinas (Ardèche, 1821, 91 kg), Jonzac, Le Teilleul, Alby-sur-Chéran, et Aubres, qui a donné son nom aux aubrites.",
    mineralogie: "Eucrite (Juvinas) : pigeonite (pyroxène pauvre en calcium, avec de fines lamelles d'augite) et plagioclase très calcique (anorthite) à parts presque égales, un peu de silice (tridymite), d'ilménite, de chromite, de troïlite et de fer métal. Texture de basalte (lattes de plagioclase) ou de cumulat, souvent bréchifiée par les chocs.",
    mineraux: [["pigeonite", 47], ["plagioclases", 40], ["tridymite", 5], ["augite", 3], ["ilmenite", 1.5], ["chromite", 1.5], ["troilite", 1.5], ["fer_natif", 0.5]],
    varietes: [
      { nom: "eucrite", note: "Le basalte de la croûte de Vesta : pigeonite et plagioclase. Juvinas (1821), Jonzac (Charente-Maritime, 1819), Bouvante (Drôme, trouvée en 1978), Alby-sur-Chéran (Haute-Savoie, 2002)." },
      { nom: "diogénite", note: "Presque uniquement de l'orthopyroxène en gros grains : un cumulat des profondeurs de la croûte de Vesta, excavé par le cratère Rheasilvia. Tatahouine (Tunisie, 1931)." },
      { nom: "howardite", note: "Brèche de fragments d'eucrite et de diogénite soudés : un ancien sol (régolithe) de Vesta. Le Teilleul (Manche, 1845, 780 g)." },
      { nom: "aubrite", note: "Presque uniquement de l'enstatite blanche, pauvre en fer, et des sulfures rares : la cousine fondue des chondrites à enstatite, d'un autre astéroïde. Le nom vient d'Aubres (Drôme), où une pierre de 800 g est tombée le 14 septembre 1836." },
      { nom: "angrite", note: "Basalte très riche en calcium, l'un des plus anciens connus (≈ 4 564 Ma) : Angra dos Reis (Brésil, 1869)." },
    ],
    regions: chutesDe("achondrite_asteroidale"),
    ages: [
      { de: 4565, a: 4552, label: "Fusion de Vesta et cristallisation de sa croûte : dans les quinze premiers millions d'années (4 565 à 4 552 Ma)" },
      { de: 1100, a: 900, label: "Cratère Rheasilvia, qui a arraché les fragments de Vesta : ≈ 1 milliard d'années (mission Dawn)" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Peu de métal, donc peu de rouille : elle s'altère comme un basalte terrestre, le plagioclase et le pyroxène passant lentement aux argiles.",
      climat: "Plus résistante que les chondrites riches en métal ; sa croûte de fusion, brillante, reste longtemps visible.",
    },
    usages: "Seuls échantillons d'un astéroïde que l'on sait relier à un corps précis observé par une sonde : Vesta.",
    wikipedia: "https://fr.wikipedia.org/wiki/M%C3%A9t%C3%A9orite_HED",
  },
  {
    id: "achondrite_martienne", nom: "Achondrite martienne", categorie: "meteoritique", sousType: "météorite pierreuse différenciée",
    swatch: "#7c8a4a", densite: 3500,
    description: "Une roche de Mars, arrachée à la planète par l'impact d'un astéroïde et tombée sur Terre. On le sait parce que les bulles de gaz piégées dans certaines contiennent l'atmosphère martienne, mesurée par les sondes Viking en 1976. Moins de trois cents sont connues. Celle de Chassigny (Haute-Marne), tombée le 3 octobre 1815, est l'une des rares chutes observées et a donné le « C » du groupe SNC.",
    mineralogie: "Chassignite (Chassigny) : un cumulat d'olivine, c'est-à-dire des cristaux d'olivine accumulés au fond d'une chambre magmatique, avec un peu d'augite, de pyroxène pauvre en calcium, de feldspath et de chromite entre eux. Les shergottites, les plus nombreuses, sont des basaltes à pyroxènes et plagioclase changé en verre par le choc (maskelynite).",
    mineraux: [["olivine", 91], ["augite", 3], ["enstatite", 2], ["plagioclases", 2], ["chromite", 1.5], ["apatite", 0.5]],
    varietes: [
      { nom: "shergottite", note: "Basalte ou roche à olivine et pyroxènes, plagioclase vitrifié par le choc ; les trois quarts des météorites martiennes. Âges de cristallisation surtout entre 150 et 575 millions d'années. Shergotty (Inde, 1865)." },
      { nom: "nakhlite", note: "Roche à augite et olivine, cristallisée vers 1 300 à 1 400 millions d'années dans d'épaisses coulées ; des argiles et carbonates formés par l'eau martienne il y a ≈ 620 millions d'années. Nakhla (Égypte, 1911)." },
      { nom: "chassignite", note: "Cumulat d'olivine (dunite) cristallisé vers 1 340 millions d'années. Chassigny (Haute-Marne, 1815, 4 kg) en est le modèle ; une seule autre est connue (NWA 2737, Sahara, 2000)." },
      { nom: "orthopyroxénite (ALH 84001)", note: "Presque uniquement de l'orthopyroxène, cristallisée il y a 4,1 milliards d'années ; ses carbonates ont fait débattre en 1996 de traces de vie martienne, aujourd'hui expliquées sans vie." },
      { nom: "brèche régolithique (NWA 7034)", note: "« Black Beauty » : fragments d'un ancien sol martien soudés, dix fois plus riches en eau que les autres météorites martiennes ; certains morceaux ont 4,4 milliards d'années." },
    ],
    regions: chutesDe("achondrite_martienne"),
    ages: [
      { de: 1360, a: 1320, label: "Cristallisation de la chassignite de Chassigny dans une chambre magmatique martienne : ≈ 1 340 Ma" },
      { de: 11.5, a: 10.5, label: "Arrachée à Mars par un impact : ≈ 11 Ma (âge d'exposition au rayonnement cosmique, commun aux nakhlites)" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Une roche à olivine : elle s'altère sur Terre comme une péridotite, l'olivine passant aux argiles et aux oxydes de fer. Certaines portaient déjà des argiles et des carbonates formés par l'eau sur Mars, qu'il faut distinguer de l'altération terrestre.",
      climat: "Presque toutes sont des trouvailles du Sahara, d'Oman et de l'Antarctique, où l'altération est lente.",
    },
    usages: "Seuls échantillons de Mars disponibles sur Terre, en attendant le retour d'échantillons prélevés par le rover Perseverance.",
    wikipedia: "https://fr.wikipedia.org/wiki/M%C3%A9t%C3%A9orite_martienne",
  },
  {
    id: "achondrite_lunaire", nom: "Achondrite lunaire", categorie: "meteoritique", sousType: "météorite pierreuse différenciée",
    swatch: "#b9b5ab", densite: 2800,
    description: "Un fragment de la Lune, éjecté par la chute d'un astéroïde sur sa surface. La première a été reconnue en 1982, ramassée sur la glace des Allan Hills, en Antarctique : une brèche claire semblable aux roches des hauts plateaux rapportées par Apollo. Environ une sur mille des météorites trouvées vient de la Lune ; aucune n'est connue en France. Tombées au hasard, elles échantillonnent aussi la face cachée, que les missions Apollo n'ont pas visitée.",
    mineralogie: "Brèche du régolithe des hauts plateaux (ALH 81005) : fragments d'anorthosite (plagioclase très calcique), de basalte et de verre d'impact, soudés par d'autres impacts ; un peu de pyroxène, d'olivine, d'ilménite et de fer métal venu des micrométéorites. Les basaltes des mers lunaires sont plus sombres, riches en pyroxène et en ilménite.",
    mineraux: [["anorthite", 70], ["verre", 10], ["pigeonite", 8], ["augite", 5], ["olivine", 5], ["ilmenite", 1], ["fer_natif", 1]],
    varietes: [
      { nom: "brèche régolithique des hauts plateaux", note: "Fragments clairs d'anorthosite et billes de verre dans une matrice fine : l'ancien sol lunaire, tassé et soudé par les chocs. ALH 81005 (Antarctique, 1982, 31 g)." },
      { nom: "basalte des mers", note: "Roche sombre à pyroxène, plagioclase et ilménite, issue des grandes coulées qui ont rempli les bassins entre 3,9 et 3,1 milliards d'années." },
      { nom: "brèche mixte", note: "Mélange de fragments des hauts plateaux et des mers : elle vient d'une zone de contact entre les deux." },
    ],
    regions: [{ nom: "Allan Hills (Antarctique) — ALH 81005, trouvée le 18 janvier 1982, 31 g (première météorite lunaire reconnue)", lat: -76.75, lng: 159.67, etranger: true }],
    ages: [
      { de: 4460, a: 4360, label: "Croûte d'anorthosite des hauts plateaux, cristallisée dans l'océan de magma lunaire : ≈ 4,46 à 4,36 milliards d'années" },
      { de: 20, a: 0, label: "Éjection de la Lune : toutes les météorites lunaires connues sont parties il y a moins de 20 millions d'années, la plupart il y a moins de 100 000 ans" },
    ],
    alteration: {
      facilite: 2,
      mecanisme: "Faite surtout de plagioclase, avec très peu de métal : elle s'altère lentement, d'abord par son verre et son olivine.",
      climat: "Toutes ont été trouvées dans les déserts (Sahara, Oman) et en Antarctique.",
    },
    usages: "Les seules roches lunaires qu'un particulier puisse posséder : celles d'Apollo et des sondes Luna restent propriété des États.",
    wikipedia: "https://fr.wikipedia.org/wiki/M%C3%A9t%C3%A9orite_lunaire",
  },
  // ───────────────────────────── fers et sidérolithes ─────────────────────────────
  {
    id: "meteorite_fer", nom: "Météorite de fer", categorie: "meteoritique", sousType: "météorite métallique différenciée",
    swatch: "#6b6a6a", densite: 7900,
    description: "Un morceau du noyau d'un astéroïde : un alliage de fer et de nickel qui s'est séparé des silicates quand l'astéroïde a fondu, puis a refroidi de quelques dizaines à quelques centaines de degrés par million d'années. Sciée, polie et attaquée à l'acide, elle montre un réseau de lamelles entrecroisées, les figures de Widmanstätten, qu'aucune forge ne sait reproduire. La plus grosse de France, La Caille (Alpes-Maritimes, 626 kg), est au Muséum de Paris depuis 1828.",
    mineralogie: "Deux alliages de fer et de nickel : la kamacite (5 à 7 % de nickel), en larges lamelles, et la taénite (plus de 25 % de nickel), en fines bordures ; entre eux, la plessite, mélange des deux. Nodules de troïlite, aiguilles et plaques de schreibersite (phosphure), parfois du graphite et de la cohénite (carbure).",
    mineraux: [["fer_natif", 81], ["taenite", 13], ["troilite", 3], ["schreibersite", 2], ["chromite", 0.5], ["cohenite", 0.5]],
    varietes: [
      { nom: "octaédrite", note: "La plus courante (6 à 13 % de nickel) : lamelles de kamacite rangées selon les faces d'un octaèdre, de moins de 0,2 mm (octaédrite très fine) à plus de 3,3 mm (très grossière). Saint-Aubin (Aube, trouvée en 1968, 472 kg en plusieurs masses), du groupe IIIAB." },
      { nom: "hexaédrite", note: "Moins de 6 % de nickel : un seul cristal de kamacite, sans figures de Widmanstätten, mais rayé de fines lignes de Neumann, des macles nées des chocs. Groupe IIAB." },
      { nom: "ataxite", note: "Plus de 16 % de nickel : un mélange trop fin pour être vu à l'œil. La plus grosse météorite connue, Hoba (Namibie, ≈ 60 tonnes), en est une." },
    ],
    regions: chutesDe("meteorite_fer"),
    ages: [
      { de: 4566, a: 4565, label: "Séparation du noyau : 1 à 1,5 million d'années après les premiers solides (hafnium-tungstène, Kruijer et al. 2014)" },
      { de: 4560, a: 4400, label: "Refroidissement du noyau entre 700 et 450 °C, figures de Widmanstätten : quelques millions à quelques dizaines de millions d'années" },
    ],
    alteration: {
      facilite: 2,
      mecanisme: "Le fer rouille, surtout là où le chlore du sol ou de la mer pénètre : il se forme de l'akaganéite, un oxyhydroxyde de fer chargé de chlore qui gonfle et fait éclater le métal par plaques. Les musées doivent conserver certaines pièces au sec.",
      climat: "Le métal résiste longtemps : des fers ont été retrouvés après des centaines de milliers d'années dans les déserts. Ils sont surreprésentés dans les collections (5,7 % des chutes, mais près de 90 % de la masse des météorites connues).",
    },
    usages: "Premier fer travaillé par l'homme, avant la métallurgie : perles égyptiennes de 3 200 av. J.-C., poignard de Toutânkhamon, outils des Inuits taillés dans la météorite du cap York.",
    wikipedia: "https://fr.wikipedia.org/wiki/M%C3%A9t%C3%A9orite_de_fer",
  },
  {
    id: "pallasite", nom: "Pallasite", categorie: "meteoritique", sousType: "sidérolithe (météorite mixte)",
    swatch: "#a68c3a", densite: 4800,
    description: "Des cristaux d'olivine jaune-vert, gros comme des noisettes, enchâssés dans une éponge de fer-nickel : sciée en tranche fine, la lumière passe à travers comme dans un vitrail. On l'a longtemps crue née à la limite entre le noyau et le manteau d'un astéroïde ; on pense aujourd'hui qu'une collision a injecté le métal d'un noyau dans le manteau d'olivine. Une seule chute observée en Europe occidentale récente ; aucune en France. Le nom vient du naturaliste Peter Pallas, qui décrivit en 1772 la masse de Krasnoïarsk (Sibérie).",
    mineralogie: "Olivine (forstérite, 55 à 65 % du volume) en cristaux arrondis ou anguleux de 0,5 à 2 cm, dans du fer-nickel (kamacite et taénite, figures de Widmanstätten dans les plages larges) ; troïlite, schreibersite, chromite et phosphates (merrillite, stanfieldite) accessoires.",
    mineraux: [["olivine", 60], ["fer_natif", 30], ["taenite", 5], ["troilite", 2], ["schreibersite", 1.5], ["merrillite", 1], ["chromite", 0.5]],
    varietes: [
      { nom: "pallasite du groupe principal", note: "Presque toutes les pallasites : un même groupe de corps parents, au métal proche des fers IIIAB. Krasnoïarsk (Sibérie, ≈ 700 kg, décrite par Pallas), Brenham (Kansas), Esquel (Argentine), Marburg (Allemagne, trouvée en 1906, 3 kg)." },
      { nom: "groupe d'Eagle Station", note: "Cinq pierres, olivine plus riche en fer et en calcium, oxygène d'une autre signature : un autre astéroïde." },
      { nom: "pallasite à pyroxène", note: "Environ 5 % d'orthopyroxène avec l'olivine : Vermillion (Kansas) et Yamato 8451 (Antarctique)." },
    ],
    regions: [{ nom: "Marburg (Allemagne) — trouvée en 1906, 3 kg : la pallasite la plus proche de la France", lat: 50.817, lng: 8.767, etranger: true }],
    ages: [
      { de: 4565, a: 4560, label: "Mélange du métal et de l'olivine dans l'astéroïde : dans les premiers millions d'années" },
      { de: 4560, a: 4400, label: "Refroidissement lent (≈ 2,5 à 18 °C par million d'années entre 700 et 400 °C, Yang et al. 2010)" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Le métal rouille et l'olivine se fissure : les tranches de pallasite se conservent dans l'huile ou sous vernis, sinon l'olivine se détache de son métal.",
      climat: "Comme les fers, le métal résiste longtemps dans les déserts ; les plus grosses masses (Brenham, Fukang, Huckitta) dépassent la tonne.",
    },
    usages: "Pièces de collection recherchées pour leurs tranches translucides ; l'olivine gemme des pallasites est l'une des rares pierres précieuses d'origine extraterrestre.",
    wikipedia: "https://fr.wikipedia.org/wiki/Pallasite",
  },
  {
    id: "mesosiderite", nom: "Mésosidérite", categorie: "meteoritique", sousType: "sidérolithe (météorite mixte)",
    swatch: "#7a7468", densite: 4800,
    description: "Une brèche faite à parts égales de fer-nickel et de fragments de basalte et de cumulats de croûte d'astéroïde. Une collision a mélangé le métal fondu d'un noyau et la croûte froide d'un autre corps ; le mélange a ensuite refroidi plus lentement que toute autre météorite, moins d'un degré par million d'années. Aucune en France ; la plus proche est tombée à Barea (Espagne) en 1842. Au Chili, les fragments de Vaca Muerta, brillants de métal, ont d'abord été pris pour un filon d'argent.",
    mineralogie: "Fer-nickel (kamacite et taénite) en grains et en nodules, et fragments de silicates de la même nature que les eucrites et les diogénites : pyroxènes (pigeonite, orthopyroxène), plagioclase calcique, un peu d'olivine et de tridymite ; troïlite, schreibersite et phosphates (merrillite).",
    mineraux: [["fer_natif", 40], ["enstatite", 15], ["pigeonite", 12], ["plagioclases", 15], ["taenite", 8], ["troilite", 3], ["tridymite", 2.5], ["olivine", 2], ["schreibersite", 1], ["merrillite", 1], ["chromite", 0.5]],
    varietes: [
      { nom: "mésosidérite de classe A", note: "Les fragments de silicates sont surtout des basaltes et gabbros (pyroxène et plagioclase), comme les eucrites." },
      { nom: "mésosidérite de classe B", note: "Les fragments sont surtout de l'orthopyroxène, comme les diogénites : une croûte plus profonde. Vaca Muerta (Chili, 3,8 tonnes en de nombreux fragments)." },
    ],
    regions: [{ nom: "Barea (Espagne) — chute de 1842, 3,2 kg : la mésosidérite la plus proche de la France", lat: 42.383, lng: -2.5, etranger: true }],
    ages: [
      { de: 4525, a: 4520, label: "Collision et mélange du métal et de la croûte : ≈ 4 525 Ma (Haba et al. 2019)" },
      { de: 4500, a: 3900, label: "Refroidissement extrêmement lent, moins d'un degré par million d'années vers 400 °C" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Le métal rouille et gonfle entre les fragments de silicates, qui finissent par se détacher.",
      climat: "Rares (environ 200 connues, dont 7 chutes) ; beaucoup viennent des déserts et de l'Antarctique.",
    },
    usages: "Recherche sur les collisions entre astéroïdes différenciés au début du Système solaire.",
    wikipedia: "https://fr.wikipedia.org/wiki/M%C3%A9sosid%C3%A9rite",
  },
);

// ───────────────────────────── carte des chutes en France (fiche roche, carte « Où la trouver ») ─────────────────────────────
// Toutes les météorites de France sur la même carte : celles de la fiche en couleur (disque d'aire croissante avec la masse),
// les autres en gris ; un site de référence à l'étranger (pallasite, mésosidérite…) en losange. Pas de fond géologique :
// le lieu d'une chute ne dit rien du sous-sol. Appelé par renderMap (app.js), qui garde l'objet carte rendu.
window.CartesChutes = (function () {
  const NOM_FICHE = (id) => { const r = ROCHES.find((x) => x.id === id); return r ? r.nom : id; };
  const masse = (g) => g == null ? "masse non connue" : g >= 1000 ? `${(Math.round(g / 100) / 10).toLocaleString("fr-FR")} kg` : `${g.toLocaleString("fr-FR")} g`;
  const rayon = (g) => g == null ? 5 : Math.max(4, Math.min(16, 3 + 2.6 * Math.log10(g / 10)));
  function entete(rock) {
    const miennes = CHUTES_FRANCE.filter((c) => c[7] === rock.id);
    const chutes = miennes.filter((c) => c[2]).length;
    const ref = (rock.regions || []).find((r) => r.etranger);
    return `<h2>Où sont-elles tombées en France ?</h2>
      <p class="sub">${miennes.length
        ? `<b>${miennes.length} météorite${miennes.length > 1 ? "s" : ""} de ce type en France</b> (${chutes} chute${chutes > 1 ? "s" : ""} observée${chutes > 1 ? "s" : ""}, ${miennes.length - chutes} trouvaille${miennes.length - chutes > 1 ? "s" : ""}), en couleur ; la taille du disque croît avec la masse recueillie.`
        : `<b>Aucune météorite de ce type n'est connue en France.</b>${ref ? ` Le losange marque la référence la plus proche ou la plus connue : ${ref.nom.split(" — ")[0]}.` : ""}`}
        En gris, les ${CHUTES_FRANCE.length - miennes.length} autres météorites de France. Le lieu d'une chute ne dépend pas du sous-sol :
        il n'y a pas de fond géologique sur cette carte. Cliquer sur un point pour sa date, sa classe et sa masse.</p>`;
  }
  function rendre(div, rock, couleur) {
    const carte = L.map(div, { scrollWheelZoom: false, preferCanvas: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(carte);
    const autres = [], miennes = [];
    CHUTES_FRANCE.forEach(([nom, an, chute, cl, g, lat, lng, f]) => {
      const moi = f === rock.id;
      const pop = `<b>${nom}</b><br>${chute ? "chute observée" : "trouvée"} en ${an}<br>classe : ${cl}<br>${masse(g)}`
        + (f && !moi ? `<br><a href="#roche/${f}">${NOM_FICHE(f)} →</a>` : "");
      const m = L.circleMarker([lat, lng], moi
        ? { radius: rayon(g), color: "#ffffff", weight: 2, fillColor: couleur, fillOpacity: 0.95 }
        : { radius: 3.5, color: "#ffffff", weight: 1, fillColor: "#8d8f93", fillOpacity: 0.85 }).bindPopup(pop);
      (moi ? miennes : autres).push(m);
    });
    L.featureGroup(autres).addTo(carte);
    const groupe = L.featureGroup(miennes).addTo(carte);
    const ref = (rock.regions || []).filter((r) => r.etranger);
    ref.forEach((r) => {
      const losange = L.marker([r.lat, r.lng], { icon: L.divIcon({ className: "chute-ref",
        html: `<span style="background:${couleur}"></span>`, iconSize: [18, 18], iconAnchor: [9, 9] }) }).bindPopup(`<b>${r.nom}</b>`);
      losange.addTo(carte); groupe.addLayer(losange);
    });
    const france = L.latLngBounds([[42.2, -5.2], [51.2, 8.4]]);
    if (ref.length) {
      const b = L.latLngBounds(france.getSouthWest(), france.getNorthEast()); ref.forEach((r) => b.extend([r.lat, r.lng]));
      carte.fitBounds(b.pad(0.08), { maxZoom: 6 });
    } else carte.fitBounds(france, { maxZoom: 6 });
    return carte;
  }
  return { entete, rendre };
})();
