// ============ Météorites (B.5, 08/10/2026) : schémas « Texture de la roche » des 10 fiches et de leurs variétés ============
// Chargé après textures-varietes.js. Modes propres aux météorites (textures.js) : chondritique, widmanstatten, pallasitique ;
// les achondrites et la mésosidérite utilisent les modes existants (grenue, mosaïque, détritique) par les aides de
// textures-roches.js. Une entrée de variété par ligne de `varietes` (meteorites.js), dans le même ordre.
(function () {
  "use strict";
  if (!window.Textures || !Textures.aides) return;
  const A = Textures.aides, H = Textures.HABITUS;

  // minéraux des météorites dans les schémas (abréviations d'après Whitney et Evans 2010 ; Km = kamacite, d'usage courant)
  Object.assign(H, {
    fer_natif: { ab: "Fe", fond: "#d3d6d8", role: "fer-nickel (kamacite) : grains brillants, métalliques" },
    taenite: { ab: "Tae", fond: "#e3e2db", role: "fer-nickel riche en nickel" },
    troilite: { ab: "Tro", fond: "#b39a62", role: "sulfure de fer, bronze" },
    schreibersite: { ab: "Sch", fond: "#d2c897", role: "phosphure de fer et de nickel" },
    cohenite: { ab: "Coh", fond: "#cfc6a8", role: "carbure de fer" },
    merrillite: { ab: "Mer", fond: "#ece7da", role: "phosphate de calcium, incolore" },
    oldhamite: { ab: "Old", fond: "#c9a57c", role: "sulfure de calcium" },
    daubreelite: { ab: "Dbr", fond: "#2a292b", role: "sulfure de fer et de chrome, noir" },
    pigeonite: { ab: "Pgt", fond: "#8a8459", trait: "#c3bf98", marque: "croix", role: "pyroxène pauvre en calcium, brun-vert" },
    tridymite: { ab: "Trd", fond: "#e6e9ec", role: "silice de haute température, incolore" },
    cristobalite: { ab: "Crs", fond: "#e9ecee", role: "silice de haute température" },
    anorthite: { ab: "An", fond: "#f6f3ec", trait: "#bdb6a6", marque: "polysynthetique", role: "plagioclase calcique, blanc, maclé" },
    pyrrhotite: { ab: "Po", fond: "#8e7351", role: "sulfure de fer, bronze sombre" },
  });

  const R2 = ["Formés en premier : entiers, à faces nettes", "", "Puis : remplissent les vides entre eux"];
  const MAT_OC = { nom: "Matrice fine", fond: "#5f5a50", taches: ["#7a7466", "#4b4740", "#8d8676", "#c3cc6a"], role: "poussière de silicates, de métal et de sulfure", pas: 2 };
  const METAL_OC = (part, taille = [0.15, 0.6]) => [
    { min: "fer_natif", part: part * 0.8, taille, role: "kamacite : fer à 5–7 % de nickel" },
    { min: "taenite", part: part * 0.2, taille: taille.map((v) => v * 0.7), role: "taénite : fer à plus de 20 % de nickel" },
  ];

  Textures.definir({
    chondrite_ordinaire: {
      mode: "chondritique", nom: "chondritique (type 5-6)", champ: 10, vue: "Vue au microscope, lumière réfléchie et transmise", net: 0.45,
      grain: "chondres de 0,3 à 1,5 mm (moyenne ≈ 0,7 mm pour une chondrite L), grains de métal de 0,1 à 0,6 mm",
      intro: "Des gouttes de silicates fondues dans le disque autour du jeune Soleil, refroidies en quelques heures, puis agglomérées avec des grains de métal et de la poussière dans un astéroïde. Chauffée vers 750 °C sur l'astéroïde (type 6), la roche a recristallisé : les bords des chondres s'estompent.",
      chondres: { part: 0.6, taille: [0.3, 1.5], types: { po: 5, pop: 3, bo: 1.2, rp: 1.4 } },
      grains: [...METAL_OC(0.08), { min: "troilite", part: 0.06, taille: [0.15, 0.6], role: "sulfure de fer, bronze" }, { min: "chromite", part: 0.008, taille: [0.06, 0.15], role: "petits grains noirs" }],
      matrice: MAT_OC,
    },
    chondrite_carbonee: {
      mode: "chondritique", nom: "chondrite CI (sans chondres)", champ: 0.6, vue: "Vue au microscope électronique (schéma)", net: 1,
      grain: "framboïdes de magnétite de 5 à 30 µm, plaquettes de sulfure de 10 à 50 µm, dans une matrice de feuillets d'argile",
      intro: "La chondrite carbonée la plus primitive (type CI, Orgueil) n'a plus de chondres : l'eau qui a circulé dans son astéroïde, vers 50–150 °C, a tout changé en argiles (serpentine, saponite), en magnétite et en carbonates. Elle garde pourtant la composition chimique du Soleil.",
      chondres: null,
      grains: [
        { min: "magnetite", part: 0.1, taille: [0.006, 0.03], forme: "framboise", fond: "#e4e4e0", role: "framboïdes : amas de petites billes, formés par l'eau (clairs au microscope électronique)" },
        { min: "pyrrhotite", part: 0.05, taille: [0.012, 0.05], forme: "plaque", fond: "#c9b27a", role: "plaquettes de sulfure de fer et de nickel" },
        { min: "dolomite", part: 0.03, taille: [0.01, 0.04], forme: "rhombe", role: "carbonate déposé par l'eau dans les fissures" },
      ],
      titreGrains: "Formés par l'eau dans l'astéroïde",
      matrice: { nom: "Matrice de phyllosilicates", fond: "#4d4943", taches: ["#5d5952", "#3f3b36", "#67625a"], role: "serpentine et saponite en feuillets, matière organique", pas: 2 },
      titreMatrice: "Matrice noire : argiles nées de l'eau, matière organique",
    },
    chondrite_enstatite: {
      mode: "chondritique", nom: "chondritique (EH5)", champ: 4, vue: "Vue au microscope, lumière réfléchie et transmise", net: 0.6,
      grain: "petits chondres de 0,1 à 0,4 mm, grains de métal et de sulfure de 0,05 à 0,3 mm",
      intro: "Une chondrite née sans oxygène, près du Soleil : chondres d'enstatite presque pure, beaucoup de métal et de sulfures, dont des sulfures de calcium et de chrome qui n'existent qu'en l'absence d'oxygène.",
      chondres: { part: 0.45, taille: [0.1, 0.45], types: { rp: 4, pop: 1 } },
      couleursChondres: { pop: { fond: "#d9d5bb" } },
      grains: [
        { min: "fer_natif", part: 0.17, taille: [0.05, 0.3], role: "kamacite chargée de silicium" },
        { min: "troilite", part: 0.08, taille: [0.05, 0.25] },
        { min: "schreibersite", part: 0.012, taille: [0.03, 0.08] },
        { min: "oldhamite", part: 0.01, taille: [0.03, 0.08], role: "sulfure de calcium, brun pâle" },
        { min: "daubreelite", part: 0.01, taille: [0.02, 0.06] },
      ],
      matrice: { nom: "Matrice fine", fond: "#9a978d", taches: ["#b3b0a6", "#827f76", "#d3d6d8"], role: "enstatite, plagioclase et silice en grains fins", pas: 2 },
    },
    achondrite_primitive: A.mosa("achondrite_primitive", { nom: "granoblastique (recristallisée)", champ: 2.5, taille: 0.22,
      grain: "grains égaux de 0,1 à 0,3 mm, à jonctions triples",
      intro: "Une chondrite chauffée au-delà de 1 000 °C : les chondres ont disparu, les grains ont recristallisé en mosaïque (joints à 120°, comme un métamorphisme poussé), et une partie du métal et du premier liquide est partie." }),
    achondrite_asteroidale: A.grenue({ nom: "basaltique (ophitique)", champ: 6, e: 0.3, remplit: ["pigeonite", "augite", "tridymite"], espacement: 0.7, vue: "Vue au microscope",
      ordre: [["chromite", 1, { taille: [0.05, 0.15] }], ["ilmenite", 1, { taille: [0.1, 0.4], allong: [3, 6] }], ["troilite", 1, { taille: [0.05, 0.2], allong: [1, 1.4], sections: 8 }],
        ["plagioclases", 1, { taille: [0.5, 1.6], allong: [3, 5], frac: 0.98, chevauche: 0.12, role: "baguettes blanches maclées (plagioclase calcique)" }]],
      grain: "baguettes de plagioclase de 0,5 à 1,5 mm et pyroxènes de même taille", roleRemplit: "pyroxène brun-vert, avec de fines lamelles d'augite",
      temps: ["Formés en premier : baguettes nettes", "", "Ensuite : le pyroxène grandit autour d'elles"],
      intro: "Un basalte de la croûte de Vesta (eucrite) : baguettes de plagioclase très calcique englobées dans de la pigeonite, comme une dolérite terrestre, mais presque sans eau ni sodium." }),
    achondrite_martienne: A.grenue({ nom: "cumulat d'olivine", champ: 8, e: 0.7, remplit: ["augite", "enstatite", "plagioclases"], espacement: 1.2, vue: "Vue au microscope",
      ordre: [["chromite", 1, { taille: [0.1, 0.3] }], ["olivine", 1, { frac: 0.97, chevauche: 0.02, taille: [0.6, 2], role: "cristaux accumulés au fond de la chambre magmatique" }]],
      grain: "cristaux d'olivine de 0,5 à 2 mm, jointifs", roleRemplit: "pyroxènes et feldspath cristallisés entre les olivines",
      temps: ["Cumulus : tombés au fond de la chambre", "", "Intercumulus : le liquide resté entre eux"],
      intro: "Chassigny est une dunite martienne : des cristaux d'olivine accumulés au fond d'une chambre magmatique, il y a ≈ 1 340 millions d'années ; le peu de liquide resté entre eux a donné pyroxènes, feldspath et chromite." }),
    achondrite_lunaire: A.detritique({ nom: "brèche régolithique", champ: 10, taille: [0.3, 4], arrondi: false, jointif: [0.55, 0.85], serre: 0.9,
      grains: [["anorthite", 0.42, { role: "fragments d'anorthosite blanche" }], ["pigeonite", 0.08, { role: "fragments de pyroxène" }], ["olivine", 0.04],
        { cle: "verre", ab: "Vrr", nom: "Verre d'impact", fond: "#3a3633", part: 0.08, role: "éclats et billes fondus par les impacts" }],
      titreGrains: "Fragments arrachés par les impacts",
      liant: { titre: "Soudé par d'autres chocs", nom: "Matrice fine de régolithe", fond: "#a9a59b", taches: ["#c9c5bb", "#8c887f", "#5a5650"], role: "poussière du sol lunaire, compactée et frittée" },
      grain: "fragments de 0,1 à 5 mm dans une matrice fine",
      intro: "Le sol lunaire, pulvérisé et remué pendant des milliards d'années par les impacts de météorites, puis tassé et soudé par d'autres chocs : une brèche de fragments d'anorthosite (la croûte claire des hauts plateaux), de verre et de basalte." }),
    meteorite_fer: { mode: "widmanstatten", nom: "octaédrite moyenne (figures de Widmanstätten)", champ: 40, vue: "Tranche polie, attaquée à l'acide nitrique", structure: "octaedrite",
      largeur: 1, longueur: [12, 40], part: 0.8, nodules: [{ min: "troilite", n: 1, taille: [6, 9], liseré: "schreibersite", role: "nodule de sulfure de fer" }],
      aiguilles: { n: 10, taille: [1, 3] },
      grain: "lamelles de kamacite de ≈ 1 mm de large (octaédrite moyenne), nodule de troïlite de quelques millimètres",
      intro: "Le métal d'un noyau d'astéroïde. Au-dessus de 700 °C, il formait un seul grand cristal de taénite ; en refroidissant de quelques dizaines de degrés par million d'années, il a rejeté des lamelles de kamacite selon les faces d'un octaèdre. L'acide les révèle." },
    pallasite: { mode: "pallasitique", nom: "pallasitique", champ: 60, vue: "Tranche polie", taille: [6, 18], jointif: [0.74, 0.84], arrondi: true,
      grains: [{ min: "troilite", part: 0.02, taille: [1, 3] }, { min: "chromite", part: 0.005, taille: [0.5, 1.5] }, { min: "schreibersite", part: 0.01, taille: [1, 3], forme: "plaque" }],
      grain: "cristaux d'olivine de 0,5 à 2 cm",
      intro: "Des cristaux d'olivine du manteau d'un astéroïde, enchâssés dans du fer-nickel venu d'un noyau. Arrondis, ils ont longtemps baigné dans le métal chaud ; anguleux, ils ont été brisés juste avant d'être figés." },
    mesosiderite: A.detritique({ nom: "bréchique (métal et silicates)", champ: 30, taille: [1, 10], arrondi: false, jointif: [0.6, 0.86], serre: 0.9,
      grains: [{ cle: "basalte", ab: "Bas", nom: "Fragments de basalte et de gabbro", fond: "#7d7a6c", taches: "#e9e6dc", part: 0.2, role: "croûte d'astéroïde, comme les eucrites" },
        ["enstatite", 0.12, { role: "fragments d'orthopyroxène" }], ["plagioclases", 0.06],
        { min: "fer_natif", part: 0.24, fond: "#d3d6d8", role: "nodules de fer-nickel" }],
      titreGrains: "Fragments mélangés par une collision",
      liant: { titre: "Entre eux", nom: "Mélange fin de métal et de silicates", fond: "#8f9194", taches: ["#c4c7ca", "#6b6a64", "#d3d6d8"], role: "métal et silicates broyés, recristallisés" },
      grain: "fragments et nodules de 1 mm à 1 cm",
      intro: "Une brèche : fragments de croûte basaltique et nodules de métal, mélangés par une collision entre astéroïdes, puis refroidis extraordinairement lentement (moins d'un degré par million d'années)." }),
  });

  // ── variétés (une entrée par ligne de `varietes`, même ordre) ──
  const avec = (t, x) => ({ ...t, ...x });
  const grains = (t, r) => ({ ...t, grains: t.grains.map((g) => (r[g.min] === null ? null : r[g.min] ? { ...g, ...r[g.min] } : g)).filter(Boolean) });
  Textures.definirVarietes({
    chondrite_ordinaire: [
      { n: "chondrite H", t: {}, f: (t) => grains(t, { fer_natif: { part: 0.13 }, taenite: { part: 0.035 } }), ecart: "Deux fois plus de grains de métal ; chondres un peu plus petits." },
      { n: "chondrite L", t: {}, ecart: "Le schéma de la fiche : 4 à 10 % de métal." },
      { n: "chondrite LL", t: {}, f: (t) => avec(grains(t, { fer_natif: { part: 0.02 }, taenite: { part: 0.006 } }), { chondres: { ...t.chondres, taille: [0.4, 1.9] } }), ecart: "Très peu de métal ; chondres plus gros." },
      { n: "chondrite de type 3", t: { net: 1, matrice: { ...MAT_OC, fond: "#3f3b35", taches: ["#57524a", "#2f2c28", "#6b655a"] } }, f: (t) => avec(t, { chondres: { ...t.chondres, types: { po: 4, pop: 3, bo: 1.5, rp: 2 } } }), ecart: "Chondres nets, matrice sombre restée intacte." },
      { n: "chondrite de type 6", t: { net: 0.25, matrice: { ...MAT_OC, fond: "#8a8475", taches: ["#9d9686", "#77715f", "#c3cc6a", "#f5f2ea"] } }, ecart: "Chondres presque effacés, matrice recristallisée en grains plus gros et plus clairs." },
    ],
    chondrite_carbonee: [
      { n: "CI", t: {}, ecart: "Le schéma de la fiche : plus de chondres, tout a été changé par l'eau." },
      { n: "CM", t: { champ: 4, chondres: { part: 0.2, taille: [0.1, 0.5], types: { po: 4, pop: 1 } }, cai: { part: 0.02, taille: [0.05, 0.3] }, net: 0.9,
        grains: [{ min: "magnetite", part: 0.02, taille: [0.01, 0.04], forme: "framboise" }, { min: "pyrrhotite", part: 0.03, taille: [0.02, 0.08], forme: "plaque" }] },
        ecart: "Quelques chondres et inclusions blanches ont survécu dans une matrice argileuse noire." },
      { n: "CO", t: { champ: 3, net: 1, chondres: { part: 0.5, taille: [0.08, 0.3], types: { po: 5, pop: 2, bo: 1 } }, cai: { part: 0.03, taille: [0.05, 0.25] },
        grains: [{ min: "fer_natif", part: 0.02, taille: [0.02, 0.08] }, { min: "troilite", part: 0.02, taille: [0.02, 0.08] }],
        matrice: { nom: "Matrice fine", fond: "#3a3631", taches: ["#4d4840", "#2c2925", "#5c564c"], role: "poussière de silicates, peu altérée par l'eau", pas: 2 } },
        ecart: "Petits chondres serrés (≈ 0,15 mm), peu de matrice, presque pas d'argiles." },
      { n: "CV", t: { champ: 12, net: 1, chondres: { part: 0.45, taille: [0.5, 2], types: { po: 4, bo: 1, pop: 2 } }, cai: { part: 0.1, taille: [1, 5] },
        grains: [{ min: "magnetite", part: 0.02, taille: [0.1, 0.3] }, { min: "troilite", part: 0.015, taille: [0.1, 0.3] }],
        matrice: { nom: "Matrice fine", fond: "#4a463e", taches: ["#5d584e", "#3a3731", "#6b655a"], role: "poussière d'olivine riche en fer", pas: 2 } },
        ecart: "Gros chondres et grandes inclusions blanches réfractaires, les plus vieux solides datés." },
      { n: "CR", t: { champ: 6, net: 1, chondres: { part: 0.5, taille: [0.3, 1.4], types: { po: 5, pop: 2 }, bordMetal: 0.7 },
        grains: [{ min: "fer_natif", part: 0.06, taille: [0.05, 0.3] }],
        matrice: { nom: "Matrice argileuse", fond: "#34302b", taches: ["#46413a", "#28251f"], role: "matrice altérée par l'eau", pas: 2 } },
        ecart: "Chondres entourés d'un liseré de métal, matrice altérée par l'eau." },
    ],
    chondrite_enstatite: [
      { n: "EH", t: {}, ecart: "Le schéma de la fiche." },
      { n: "EL", t: {}, f: (t) => avec(grains(t, { fer_natif: { part: 0.1 }, troilite: { part: 0.05 } }), { chondres: { ...t.chondres, taille: [0.3, 0.9] } }), ecart: "Chondres plus gros, moins de métal et de sulfure." },
    ],
    achondrite_primitive: [
      { n: "acapulcoïte", t: {}, ecart: "Le schéma de la fiche : grain fin." },
      { n: "lodranite", comp: { plagioclases: 2, fer_natif: 16 }, t: { taille: 0.5, champ: 5 }, ecart: "Grains deux fois plus gros, presque plus de plagioclase : le premier liquide est parti." },
      { n: "winonaïte", comp: { enstatite: 55, olivine: 8 }, t: { taille: 0.15, champ: 2 }, ecart: "Plus d'enstatite et moins d'olivine, grain très fin." },
      { n: "uréilite", comp: { olivine: 70, pigeonite: 20, enstatite: 0, plagioclases: 0, diopside: 0, graphite: 5, fer_natif: 3, troilite: 1, merrillite: 0, chromite: 1 }, t: { taille: 0.6, champ: 6 },
        ecart: "Olivine et pigeonite en gros grains, graphite (et petits diamants) entre eux." },
    ],
    achondrite_asteroidale: [
      { n: "eucrite", t: {}, ecart: "Le schéma de la fiche." },
      { n: "diogénite", comp: { enstatite: 90, plagioclases: 3, olivine: 3, chromite: 2, troilite: 1, pigeonite: 0, augite: 0, tridymite: 0, ilmenite: 0 },
        f: (t) => ({ ...t, ordre: t.ordre.filter((o) => o.min !== "plagioclases" && o.min !== "ilmenite").map((o) => (o.espacement ? { ...o, min: "enstatite", remplit: ["enstatite", "olivine", "plagioclases"], espacement: 1.6, role: "orthopyroxène en gros grains jointifs" } : o)) }),
        ecart: "Presque uniquement de l'orthopyroxène en gros grains : un cumulat de la croûte profonde de Vesta." },
      { n: "howardite", copie: "achondrite_lunaire", comp: { pigeonite: 34, plagioclases: 28, enstatite: 26, anorthite: 0, verre: 4, augite: 3, olivine: 2, ilmenite: 1, fer_natif: 1, chromite: 1 }, t: {}, f: (t) => ({ ...t, grains: [{ cle: "eucrite", ab: "Euc", nom: "Fragments d'eucrite", fond: "#9c968a", taches: "#f5f2ea", part: 0.4, role: "basalte de la croûte" },
        { min: "enstatite", part: 0.16, role: "fragments de diogénite (orthopyroxène)" }, { cle: "verre", ab: "Vrr", nom: "Verre d'impact", fond: "#3a3633", part: 0.04 }],
        liant: { ...t.liant, nom: "Matrice fine de régolithe", fond: "#8f8a7e" } }),
        ecart: "Brèche : fragments d'eucrite et de diogénite soudés dans le sol de Vesta." },
      { n: "aubrite", comp: { enstatite: 90, plagioclases: 4, fer_natif: 1, troilite: 2, oldhamite: 1, pigeonite: 0, augite: 0, tridymite: 2, ilmenite: 0, chromite: 0 },
        f: (t) => ({ ...t, ordre: t.ordre.filter((o) => !["plagioclases", "ilmenite", "chromite"].includes(o.min)).map((o) => (o.espacement ? { ...o, min: "enstatite", remplit: ["enstatite", "plagioclases", "tridymite"], espacement: 2, role: "enstatite blanche en gros cristaux" } : o)) }),
        ecart: "Enstatite blanche presque pure en gros cristaux, quelques sulfures rares." },
      { n: "angrite", comp: { augite: 45, anorthite: 30, olivine: 20, troilite: 2, pigeonite: 0, plagioclases: 0, tridymite: 0, ilmenite: 0, chromite: 1, fer_natif: 0 },
        f: (t) => ({ ...t, ordre: t.ordre.filter((o) => o.min !== "ilmenite").map((o) => (o.min === "plagioclases" ? { ...o, min: "anorthite" } : o.espacement ? { ...o, min: "augite", remplit: ["augite", "olivine"], role: "pyroxène riche en calcium et olivine" } : o)) }),
        ecart: "Pyroxène très riche en calcium, anorthite et olivine : un basalte d'un autre astéroïde." },
    ],
    achondrite_martienne: [
      { n: "shergottite", copie: "achondrite_asteroidale", comp: { pigeonite: 45, augite: 20, plagioclases: 25, olivine: 5, ilmenite: 2, chromite: 1, troilite: 1, tridymite: 0, fer_natif: 0 },
        f: (t) => ({ ...t, ordre: t.ordre.map((o) => (o.espacement ? { ...o, remplit: ["pigeonite", "augite", "olivine"] } : o)) }),
        ecart: "Basalte à pyroxènes ; le plagioclase a été changé en verre (maskelynite) par le choc de l'éjection." },
      { n: "nakhlite", comp: { augite: 78, olivine: 15, plagioclases: 5, enstatite: 0, chromite: 1, apatite: 1 },
        f: (t) => ({ ...t, ordre: t.ordre.map((o) => (o.min === "olivine" ? { ...o, frac: 0.6 } : o.espacement ? { ...o, min: "augite", remplit: ["augite", "plagioclases"], role: "augite en prismes accumulés" } : o)) }),
        ecart: "Cumulat d'augite verte avec un peu d'olivine." },
      { n: "chassignite", t: {}, ecart: "Le schéma de la fiche (Chassigny)." },
      { n: "orthopyroxénite", comp: { enstatite: 96, chromite: 2, plagioclases: 1, olivine: 0, augite: 0, apatite: 0, calcite: 1 },
        f: (t) => ({ ...t, ordre: t.ordre.filter((o) => o.min !== "olivine").map((o) => (o.espacement ? { ...o, min: "enstatite", remplit: ["enstatite", "calcite"], espacement: 2.4, role: "orthopyroxène en gros grains" } : o)) }),
        ecart: "Presque uniquement de l'orthopyroxène ; petits globules de carbonate (≈ 1 %) dans les fissures." },
      { n: "brèche régolithique", copie: "achondrite_lunaire", comp: { plagioclases: 32, augite: 26, pigeonite: 14, anorthite: 0, olivine: 6, verre: 6, magnetite: 10, ilmenite: 2, fer_natif: 0, apatite: 1, chromite: 1 }, f: (t) => ({ ...t, grains: [{ cle: "basalte", ab: "Bas", nom: "Fragments de basalte martien", fond: "#4d4a42", taches: "#c9c4b6", part: 0.3, role: "roches de la croûte, certaines de 4,4 milliards d'années" },
        ["plagioclases", 0.1], ["augite", 0.08]].map((g) => (Array.isArray(g) ? { min: g[0], part: g[1] } : g)),
        liant: { ...t.liant, nom: "Matrice fine sombre", fond: "#3a3530", taches: ["#57504a", "#2c2824", "#8a4a32"], role: "sol martien soudé, riche en oxydes de fer et en eau" } }),
        ecart: "Fragments de basalte dans une matrice sombre d'ancien sol martien." },
    ],
    achondrite_lunaire: [
      { n: "brèche régolithique", t: {}, ecart: "Le schéma de la fiche." },
      { n: "basalte des mers", copie: "achondrite_asteroidale", comp: { pigeonite: 30, augite: 20, plagioclases: 30, ilmenite: 12, olivine: 6, troilite: 1, fer_natif: 1, tridymite: 0, chromite: 0 },
        f: (t) => ({ ...t, ordre: t.ordre.filter((o) => o.min !== "chromite").map((o) => (o.min === "ilmenite" ? { ...o, frac: 1, taille: [0.2, 0.8] } : o.espacement ? { ...o, remplit: ["pigeonite", "augite", "olivine"] } : o)) }),
        ecart: "Basalte sombre : pyroxènes, plagioclase et beaucoup d'ilménite noire." },
      { n: "brèche mixte", f: (t) => ({ ...t, grains: [...t.grains.map((g) => (g.min === "anorthite" ? { ...g, part: 0.25 } : g)),
        { cle: "basalte", ab: "Bas", nom: "Fragments de basalte des mers", fond: "#4d4a42", taches: "#f5f2ea", part: 0.18, role: "roche sombre des mers" }] }),
        ecart: "Fragments clairs des hauts plateaux ET fragments sombres de basalte des mers." },
    ],
    meteorite_fer: [
      { n: "octaédrite", t: {}, ecart: "Le schéma de la fiche." },
      { n: "hexaédrite", t: { structure: "hexaedrite", nom: "hexaédrite (lignes de Neumann)" }, ecart: "Pas de figures de Widmanstätten : un seul cristal de kamacite, rayé de lignes de Neumann." },
      { n: "ataxite", t: { structure: "ataxite", nom: "ataxite", nodules: [] , aiguilles: null }, ecart: "Aucune structure visible à l'œil : le mélange de kamacite et de taénite est microscopique." },
    ],
    pallasite: [
      { n: "pallasite du groupe principal", t: {}, ecart: "Le schéma de la fiche." },
      { n: "groupe d'Eagle Station", t: { arrondi: false, olivine: { tons: ["#9c8a2c", "#8f7f28", "#a69434"] } }, ecart: "Olivine plus riche en fer, plus sombre, cristaux anguleux." },
      { n: "pallasite à pyroxène", t: { extra: [{ min: "enstatite", part: 0.05, taille: [3, 8], role: "orthopyroxène (≈ 5 %)" }] }, ecart: "Quelques cristaux d'orthopyroxène avec l'olivine." },
    ],
    mesosiderite: [
      { n: "mésosidérite de classe A", t: {}, ecart: "Le schéma de la fiche : fragments de basalte et de gabbro." },
      { n: "mésosidérite de classe B", f: (t) => ({ ...t, grains: t.grains.map((g) => (g.cle === "basalte" ? { ...g, part: 0.06 } : g.min === "enstatite" ? { ...g, part: 0.26 } : g)) }),
        ecart: "Surtout des fragments d'orthopyroxène : une croûte plus profonde." },
    ],
  });
})();
