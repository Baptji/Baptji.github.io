// ============================================================
// CLASSE IV — oxydes et hydroxydes : formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026
// Chargé après phosphates-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js).
// Les fiches détaillées (conditions, Pourbaix) restent dans la partie Oxydes ; ici : la carte « Structure » et « Comment se
// forme-t-il ? » de la page minéral. Diagrammes Eh–pH : ceux de la partie Oxydes (POURBAIX, un par élément).
// Sans structure 3D : vernadite, limonite, leucoxène (nanophases ou mélanges, sans maille propre).
// ============================================================

(function () {
  const CUBIQUE = (a) => [a, a, a, 90, 90, 90];
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  const cub = (nom, couleur, classe, classeNom, reseau, a, cod, facies, plus) => Object.assign({
    nom, couleur, systeme: "cubique", classe, classeNom, reseau, maille: CUBIQUE(a), mailleSource: cod, facies, clivages: [] }, plus || {});
  const OCTA = (note, d) => ({ nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: d || 1.0 }], note });
  const MACLE_SP = (note) => ({ nom: "Macle du spinelle", azimut: 30, elevation: 14, macle: { plan: [1, 1, 1], compo: [1, 1, 1] },
    formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }], note });

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ═══════════ fer ═══════════
    goethite: {
      nom: "Goethite", couleur: "#8a5a2a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.625, 9.99, 3.037, 90, 90, 90], mailleSource: "cod9003076", azimut: 22, elevation: 14,
      facies: [{ nom: "Prisme strié", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.1 },
        { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 3.2 }],
        note: "Prismes et aiguilles striés le long de c, noirs et brillants dans les géodes ; dans les sols, la goethite n'est qu'en cristaux de quelques dizaines de nanomètres." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },
    lepidocrocite: {
      nom: "Lépidocrocite", couleur: "#c4652a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "C",
      maille: [3.072, 12.516, 3.873, 90, 90, 90], mailleSource: "cod9017417", azimut: 24, elevation: 20,
      facies: [{ nom: "Écaille", formes: [
        { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.22 }, { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.3 }],
        note: "Écailles minces aplaties selon b, rouge orangé : son nom grec veut dire « fibre d'écaille »." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.15 }],
    },
    hematite: {
      nom: "Hématite", couleur: "#6e3a34", systeme: "trigonal (rhomboédrique)", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "R",
      maille: HEX(5.038, 13.772), mailleSource: "cod9000139", azimut: 22, elevation: 20,
      facies: [
        { nom: "Tablette (spécularite)", formes: [
          { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.28 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
          note: "Tablettes minces, noires et miroitantes (« fer spéculaire ») ; groupées en rosaces, ce sont les « roses de fer » des fentes alpines." },
        { nom: "Rhomboèdre", formes: [
          { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.4 }],
          note: "Cristaux épais de l'île d'Elbe et des volcans (fumerolles du Vésuve, du Stromboli)." },
      ],
      clivages: [],
    },
    magnetite: cub("Magnétite", "#2e2e33", "m-3m", "hexakisoctaédrique", "F", 8.3941, "cod9007644", [
      OCTA("Octaèdres noirs, souvent nets et parfois de plusieurs centimètres dans les chloritoschistes (Zermatt, Binn)."),
      { nom: "Dodécaèdre", formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.1 }],
        note: "Dodécaèdres striés, fréquents dans les skarns." },
      MACLE_SP("La macle qui porte le nom du spinelle, dont la magnétite a la structure.")],
      { macleNote: "Macle du spinelle sur {111}." }),

    // ═══════════ manganèse ═══════════
    hausmannite: {
      nom: "Hausmannite", couleur: "#3d2f2c", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I",
      maille: [5.7691, 5.7691, 9.4605, 90, 90, 90], mailleSource: "cod9001963", azimut: 22, elevation: 14,
      macleNote: "Macles sur {112}, souvent répétées (groupements de cinq individus).",
      facies: [{ nom: "Bipyramide", formes: [{ sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }],
        note: "Bipyramides presque octaédriques : un spinelle étiré le long de c, dont l'octaèdre est devenu une bipyramide quadratique." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "basal", pas: 0.22 }],
    },
    braunite: {
      nom: "Braunite", couleur: "#2f2b2b", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I",
      maille: [9.4264, 9.4264, 18.6962, 90, 90, 90], mailleSource: "cod9006541", azimut: 22, elevation: 14,
      facies: [{ nom: "Bipyramide", formes: [{ sym: "p", hkl: [1, 1, 2], nom: "bipyramide", d: 1.0 }],
        note: "Petites bipyramides pseudo-octaédriques (c ≈ 2 a), noir brunâtre, à l'éclat submétallique." }],
      clivages: [{ hkl: [1, 1, 2], qualite: "parfait", nom: "{112}", pas: 0.24 }],
    },
    bixbyite: cub("Bixbyite", "#262426", "m-3", "diploïdale", "I", 9.4126, "cod9007522", [
      { nom: "Cube et trapézoèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "n", hkl: [2, 1, 1], nom: "trapézoèdre", d: 1.12 }],
        note: "Petits cubes noirs, brillants, dont les sommets sont coupés par trois facettes {211} : la forme des cristaux des cavités des rhyolites de Thomas Range (Utah)." }],
      { clivages: [] }),
    manganosite: cub("Manganosite", "#3f7a52", "m-3m", "hexakisoctaédrique", "F", 4.4459, "cod9006658", [
      OCTA("Petits octaèdres vert émeraude, qui noircissent à la lumière en s'oxydant ; rares (Långban, Franklin).")],
      { clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "cubique", pas: 0.25 }] }),

    // ═══════════ aluminium ═══════════
    diaspore: {
      nom: "Diaspore", couleur: "#e6dccb", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.4007, 9.4253, 2.8452, 90, 90, 90], mailleSource: "cod9005758", azimut: 22, elevation: 14,
      facies: [{ nom: "Lame", formes: [
        { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 2.6 }],
        note: "Lames allongées selon c, aplaties selon b ; sa variété gemme de Turquie (« zultanite ») change de couleur selon l'éclairage." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },
    corindon: {
      nom: "Corindon", couleur: "#5b78b5", systeme: "trigonal (rhomboédrique)", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "R",
      maille: HEX(4.757, 12.9877), mailleSource: "cod9007498", azimut: 20, elevation: 14,
      facies: [
        { nom: "Prisme hexagonal (rubis)", formes: [
          { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.1 }],
          note: "Prismes courts, coupés net par la base : la forme des rubis des marbres (Birmanie)." },
        { nom: "Bipyramide (saphir)", formes: [
          { sym: "n", hkl: [2, 2, -4, 3], nom: "bipyramide hexagonale", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.9 }],
          note: "Bipyramides allongées en tonnelet, la forme des saphirs des basaltes et des placers (Sri Lanka)." },
      ],
      clivages: [],
    },

    // ═══════════ titane ═══════════
    rutile: {
      nom: "Rutile", couleur: "#8a3a22", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [4.5941, 4.5941, 2.9589, 90, 90, 90], mailleSource: "cod9007531", azimut: 22, elevation: 14,
      macleNote: "Macle en genou sur {011}, souvent répétée en roues (« sagénite » en réseau dans le quartz).",
      facies: [{ nom: "Prisme et bipyramide", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.05 },
        { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 2.0 }],
        note: "Prismes striés terminés en pointe basse, rouge sang à noir ; en aiguilles d'or dans le quartz « cheveux de Vénus »." },
        { nom: "Macle en genou", azimut: 26, elevation: 10, macle: { plan: [0, 1, 1], compo: [0, 1, 1] }, formes: [
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 2.0 }],
          note: "Deux prismes soudés sur un plan {011}, coudés à ≈ 115°." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "net", nom: "{110}", pas: 0.24 }],
    },
    anatase: {
      nom: "Anatase", couleur: "#3a4a6a", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I",
      maille: [3.7845, 3.7845, 9.5143, 90, 90, 90], mailleSource: "cod9015929", azimut: 22, elevation: 12,
      facies: [{ nom: "Bipyramide aiguë", formes: [
        { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.2 }],
        note: "Bipyramides très pointues, bleu-noir à miel, dans les fentes alpines (Oisans, Binn) : de là son nom grec, « allongée »." }],
      clivages: [{ hkl: [1, 0, 1], qualite: "parfait", nom: "{011}", pas: 0.24 }, { hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.3 }],
    },
    brookite: {
      nom: "Brookite", couleur: "#7a4a2a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [9.174, 5.449, 5.138, 90, 90, 90], mailleSource: "cod9004137", azimut: 24, elevation: 16,
      facies: [{ nom: "Tablette", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.35 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "e", hkl: [1, 2, 2], nom: "bipyramide", d: 1.1 }],
        note: "Tablettes minces, brun-rouge, souvent avec une bande sombre en sablier au centre : les cristaux des fentes alpines du Dauphiné (Bourg-d'Oisans)." }],
      clivages: [],
    },
    ilmenite: {
      nom: "Ilménite", couleur: "#2e2a2a", systeme: "trigonal (rhomboédrique)", classe: "-3", classeNom: "rhomboédrique", reseau: "R",
      maille: HEX(5.0884, 14.0855), mailleSource: "cod9000906", azimut: 22, elevation: 18,
      facies: [{ nom: "Tablette épaisse", formes: [
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.45 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
        note: "Tablettes noires épaisses, à l'éclat métallique ; le plus souvent en grains dans les gabbros et les sables noirs." }],
      clivages: [],
    },
    perovskite: {
      nom: "Pérovskite", couleur: "#4a3a30", systeme: "orthorhombique (pseudo-cubique)", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [5.4043, 5.4224, 7.651, 90, 90, 90], mailleSource: "cod9002801", azimut: 30, elevation: 18,
      facies: [{ nom: "Pseudo-cube", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.0 }],
        note: "Faux cubes striés : la maille est presque cubique (a ≈ b ≈ c/√2), si bien que le prisme {110} et la base forment un cube. Décrite dans l'Oural en 1839 et nommée d'après le minéralogiste russe Lev Perovski." }],
      clivages: [],
    },

    // ═══════════ cuivre, zinc, chrome, magnésium ═══════════
    cuprite: cub("Cuprite", "#9b1f1f", "m-3m", "hexakisoctaédrique", "P", 4.2685, "cod9007497", [
      OCTA("Octaèdres rouge sombre à reflets de rubis ; la variété en fils capillaires s'appelle chalcotrichite."),
      { nom: "Cube et octaèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.2 }],
        note: "Cubes aux sommets coupés, souvent couverts d'une pellicule de malachite verte." }]),
    gahnite: cub("Gahnite", "#24413a", "m-3m", "hexakisoctaédrique", "F", 8.1123, "cod9017028", [
      OCTA("Octaèdres vert foncé à bleu-noir, nets, dans les pegmatites et les gneiss."), MACLE_SP("Macle du spinelle, fréquente.")],
      { macleNote: "Macle du spinelle sur {111}." }),
    franklinite: cub("Franklinite", "#1f1d1d", "m-3m", "hexakisoctaédrique", "F", 8.4418, "cod9002487", [
      { nom: "Octaèdre et dodécaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.08 }],
        note: "Octaèdres noirs aux arêtes biseautées, dans le marbre de Franklin, avec la zincite rouge et la willémite." }]),
    chromite: cub("Chromite", "#2a2a2a", "m-3m", "hexakisoctaédrique", "F", 8.3765, "cod9007325", [
      OCTA("Les octaèdres de chromite sont petits et rares ; elle se trouve surtout en grains et en lits massifs dans les péridotites.")]),
    periclase: cub("Périclase", "#e8ecd8", "m-3m", "hexakisoctaédrique", "F", 4.2122, "cod9007058", [
      { nom: "Cubo-octaèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.2 }],
        note: "Petits grains cubiques ou octaédriques dans les marbres de contact (Monte Somma, Predazzo), presque toujours entourés de brucite." }],
      { clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "cubique", pas: 0.25 }] }),
    brucite: {
      nom: "Brucite", couleur: "#e6ece4", systeme: "trigonal", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "P",
      maille: HEX(3.14979, 4.7702), mailleSource: "cod9006330", azimut: 20, elevation: 22,
      facies: [{ nom: "Tablette", formes: [
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.32 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
        note: "Tablettes à contour hexagonal, nacrées, qui se débitent en lamelles souples (non élastiques, à la différence du mica)." }],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal", pas: 0.18 }],
    },
    spinelle: cub("Spinelle", "#a8324a", "m-3m", "hexakisoctaédrique", "F", 8.08435, "cod9001364", [
      OCTA("Octaèdres nets, rouges, roses, bleus ou noirs selon le chrome, le fer ou le cobalt qu'ils contiennent : le « rubis du Prince Noir » de la couronne d'Angleterre est un spinelle."),
      MACLE_SP("Deux octaèdres accolés sur une face {111}, l'un tourné de 180° : la macle à laquelle le spinelle a donné son nom.")],
      { macleNote: "Macle du spinelle sur {111}." }),

    // ═══════════ étain, zirconium, uranium, niobium ═══════════
    cassiterite: {
      nom: "Cassitérite", couleur: "#3a2a22", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [4.738, 4.738, 3.1865, 90, 90, 90], mailleSource: "cod9007533", azimut: 22, elevation: 14,
      macleNote: "Macle en genou sur {011}, très fréquente : le « bec d'étain » des mineurs de Cornouailles.",
      facies: [
        { nom: "Prisme et bipyramide", formes: [
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 1.25 }],
          note: "Prismes courts, brun noir, coiffés d'une bipyramide : dense (7), à l'éclat adamantin." },
        { nom: "Macle en genou", azimut: 26, elevation: 10, macle: { plan: [0, 1, 1], compo: [0, 1, 1] }, formes: [
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 1.25 }],
          note: "Deux cristaux soudés sur {011} : le « bec d'étain »." }],
      clivages: [{ hkl: [1, 0, 0], qualite: "imparfait", nom: "{100}", pas: 0.3 }],
    },
    baddeleyite: {
      nom: "Baddeleyite", couleur: "#5a4a3a", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [5.1505, 5.2116, 5.3173, 90, 99.23, 90], mailleSource: "cod9016714", azimut: 24, elevation: 16,
      facies: [{ nom: "Tablette", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.4 }],
        note: "Petites tablettes brunes, aplaties selon a, souvent maclées ; dans les gabbros et les carbonatites, en grains de quelques dixièmes de millimètre que l'on date à l'uranium–plomb." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.24 }],
    },
    uraninite: cub("Uraninite", "#1f2422", "m-3m", "hexakisoctaédrique", "F", 5.4682, "cod9009049", [
      { nom: "Cube et octaèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.15 }],
        note: "Cubes et octaèdres noirs, seulement dans les pegmatites ; dans les filons, l'uraninite forme des masses mamelonnées sans faces, la pechblende." }]),
    thorianite: cub("Thorianite", "#3a3a36", "m-3m", "hexakisoctaédrique", "F", 5.5997, "cod9009046", [
      { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
        note: "Petits cubes noirs, souvent maclés par interpénétration (non dessinés), roulés dans les graviers à gemmes du Sri Lanka." }]),
    columbite: {
      nom: "Columbite", couleur: "#2a2624", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [14.221, 5.727, 5.102, 90, 90, 90], mailleSource: "cod9001398", azimut: 24, elevation: 16,
      facies: [{ nom: "Tablette", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.5 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.3 }],
        note: "Tablettes noires épaisses, aplaties selon a, dans les pegmatites ; souvent maclées en cœur." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "net", nom: "{010}", pas: 0.24 }],
    },
    pyrochlore: cub("Pyrochlore", "#6a3a22", "m-3m", "hexakisoctaédrique", "F", 10.42, "cod9004020", [
      OCTA("Petits octaèdres brun-rouge dans les carbonatites ; son nom grec, « vert au feu », vient de la couleur qu'il prend au chalumeau.")]),
  });
  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const E = (pH, Eh, n, t) => Object.assign({ pH, Eh }, n ? { n } : {}, t ? { t } : {});
  const SRC = {
    cornell: "Cornell R. M. et Schwertmann U. (2003). <i>The Iron Oxides</i>, 2ᵉ éd. Wiley-VCH.",
    post: "Post J. E. (1999). « Manganese oxide minerals: crystal structures and economic and environmental significance ». <i>PNAS</i> 96, p. 3447–3454.",
    bardossy: "Bárdossy G. et Aleva G. J. J. (1990). <i>Lateritic Bauxites</i>. Elsevier.",
    simonet: "Simonet C., Fritsch E. et Lasnier B. (2008). « A classification of gem corundum deposits aimed towards gem exploration ». <i>Ore Geology Reviews</i> 34, p. 127–133.",
    lehmann: "Lehmann B. (2021). « Formation of tin ore deposits: a reassessment ». <i>Lithos</i> 402–403, 105756.",
    cuney: "Cuney M. (2009). « The extreme diversity of uranium deposits ». <i>Mineralium Deposita</i> 44, p. 3–9.",
    vernon: "Pour l'oxydation et la précipitation des oxydes : diagrammes Eh–pH de la partie Oxydes de l'atlas (activité 10⁻⁶).",
  };
  const PAS = (txt) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + txt });
  const SOL = "Pas de diagramme : ce sont le climat du sol, la matière organique et l'alternance humide–sec qui décident ; voir l'onglet de l'élément dans la partie Oxydes.";
  const sc = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || { cond: false, sansDiagramme: SOL }), src ? { src } : {});
  const ehph = (systeme, chemin, note) => ({ type: "ehph", systeme, chemin, note });
  const clim = (domaines, lab, chemin, note) => ({ type: "climat", domaines, etiquettes: lab ? [lab] : [], villes: ["Brest", "Paris", "Marseille"], chemin, note });

  Object.assign(MIN_F, {

    // ═══════════ fer ═══════════
    ferrihydrite: {
      sansForme: "Forme non dessinée : la ferrihydrite est faite de nanocristaux de 2 à 6 nm, sans faces visibles.",
      forme: `La ferrihydrite est le premier solide qui se forme quand le fer dissous rencontre l'oxygène : des cristaux de quelques
        nanomètres, si petits qu'une bonne partie de leurs atomes sont en surface (200 à 600 m² par gramme). La structure 3D
        est un modèle : une maille ne décrit qu'imparfaitement des cristaux de quelques mailles de large.`,
      intro: `La ferrihydrite précipite en quelques heures là où une eau chargée de fer réduit arrive à l'air.`,
      scenarios: [sc("Au contact de l'oxygène",
        `Une eau de nappe, sans oxygène, porte du fer dissous (Fe²⁺). Quand elle sort à l'air — source, drain, fossé, racine
          d'une plante dans un sol engorgé — le fer s'oxyde et précipite aussitôt en ferrihydrite, un dépôt orange vif. Elle mûrit
          ensuite en goethite ou en hématite, en quelques mois à quelques années.`,
        ehph("fer", [E(6.5, -0.1, 1, "Dans la nappe, sans oxygène, le fer est dissous (Fe²⁺)."), E(6.8, 0.5, 2, "À l'air, l'eau devient oxydante : le fer précipite aussitôt en ferrihydrite.")],
          "La ligne orange tiretée du diagramme marque la précipitation de la ferrihydrite."), [SRC.cornell])],
    },
    goethite: {
      forme: `La goethite est faite de doubles chaînes d'octaèdres Fe(O,OH)₆ allongées selon c : d'où les aiguilles et les prismes
        striés. Clivage parfait {010}. C'est elle qui colore en brun-jaune la plupart des sols de France.`,
      intro: `La goethite est l'oxyde de fer des sols tempérés et humides, et des chapeaux de fer des gisements.`,
      scenarios: [
        sc("Dans un sol tempéré",
          `Dans les sols frais et humides (8–15 °C, pluie > 65 % de l'ETP), riches en matière organique, la ferrihydrite mûrit
            lentement en goethite, en se dissolvant et en recristallisant. C'est la teinte brun-ocre des sols bruns et des limons.`,
          clim([[8, 15, 0.65, 2.5]], ["goethite", 11.5, 2.2], [
            { T: 12.0, ai: 0.96, n: 1, t: "Rennes : 12 °C, pluie ≈ ETP : la goethite domine dans les sols." },
            { n: 2, t: "La ferrihydrite des sols se change lentement en goethite, d'autant mieux que le sol est frais, humide et riche en humus." }],
            "Domaine schématique. Plus chaud et plus sec, l'hématite l'emporte (voir la fiche de l'hématite)."), ["h5", SRC.cornell]),
        sc("Dans un chapeau de fer",
          `Au-dessus des gisements de sulfures, l'eau de pluie oxyde la pyrite ; le fer se redépose en goethite et forme une
            croûte rouillée et caverneuse, le chapeau de fer, que les prospecteurs suivent depuis l'Antiquité.`, null, [SRC.cornell]),
      ],
    },
    lepidocrocite: {
      forme: `La lépidocrocite a la même formule que la goethite, mais ses octaèdres forment des feuillets ondulés tenus par des
        liaisons hydrogène : d'où les écailles et le clivage {010}. Sa couleur orange vif la distingue de la goethite brune.`,
      intro: `La lépidocrocite naît dans les sols où la nappe monte et descend.`,
      scenarios: [sc("Dans un sol engorgé par moments",
        `Quand la nappe monte, le fer est réduit et dissous ; quand elle descend, l'air revient et le fer s'oxyde, vite et sans
          carbonate : la lépidocrocite se dépose en taches et en gaines orange autour des racines et des fissures (pseudogleys).`,
        ehph("fer", [E(6, -0.05, 1, "Nappe haute : le fer est réduit et dissous."), E(6, 0.55, 2, "Nappe basse : l'air revient, le fer s'oxyde vite et précipite en lépidocrocite."), E(6, -0.05, 3, "La nappe remonte : le cycle recommence chaque saison.")],
          "Le diagramme ne distingue pas les oxydes ferriques entre eux : c'est la vitesse d'oxydation et l'absence de carbonate qui font la lépidocrocite plutôt que la goethite."), [SRC.cornell])],
    },
    hematite: {
      forme: `L'hématite a la structure du corindon : oxygènes en empilement compact, fers dans deux vides octaédriques sur trois.
        Massive, elle est noire et brillante ; en poudre, rouge sang (son nom vient du grec <i>haima</i>, le sang). Son trait
        rouge la distingue de la magnétite et de l'ilménite.`,
      intro: `L'hématite rougit les sols des climats chauds à saison sèche, et forme les grands gisements de fer.`,
      scenarios: [
        sc("Dans un sol chaud à saison sèche",
          `Au-dessus de ≈ 15 °C de moyenne, avec un sol sec plusieurs semaines par an et peu d'humus, la ferrihydrite se déshydrate
            en hématite plutôt que de mûrir en goethite : les sols rouges méditerranéens (terra rossa) et tropicaux.`,
          clim([[15, 30, 0.3, 1.2]], ["hématite", 22.5, 1.35], [
            { T: 15.9, ai: 0.42, n: 1, t: "Marseille : 15,9 °C, étés secs : l'hématite rougit les sols." },
            { n: 2, t: "La ferrihydrite des sols se déshydrate en hématite pendant la saison sèche." }],
            "Domaine schématique. Plus frais et plus humide, la goethite l'emporte."), ["h5", SRC.cornell]),
        sc("Dans les fers rubanés",
          `Il y a 2,5 à 1,8 milliards d'années, l'oxygène apparu dans les océans a fait précipiter le fer dissous en lits alternés
            de fer et de silice : les fers rubanés, d'où vient l'essentiel du minerai de fer extrait aujourd'hui.`,
          PAS("voir la fiche de la roche à fer rubané."), [SRC.cornell]),
      ],
    },
    maghemite: {
      sansForme: "Forme non dessinée : la maghémite ne forme pas de cristaux propres ; elle se présente en grains fins ou en pseudomorphoses de magnétite.",
      forme: `La maghémite a la structure de la magnétite, mais tout son fer est ferrique : pour équilibrer les charges, un site
        octaédrique sur six reste vide. Elle est aussi magnétique que la magnétite.`,
      intro: `La maghémite naît surtout dans les sols chauffés par les feux, ou de l'oxydation lente de la magnétite.`,
      scenarios: [
        sc("Dans un sol brûlé",
          `Le feu chauffe le sol à plus de 300 °C en présence de matière organique : la goethite se transforme en maghémite.
            D'où les horizons de surface magnétiques des sols tropicaux et de certains sites archéologiques (foyers).`, PAS("c'est la chaleur d'un incendie, en surface, qui la fait."), [SRC.cornell]),
        sc("En oxydant la magnétite",
          `À basse température, la magnétite s'oxyde lentement sans changer de forme : le fer ferreux part, laissant des lacunes,
            et elle devient maghémite.`, PAS("transformation à l'état solide, à basse température."), [SRC.cornell]),
      ],
    },
    magnetite: {
      forme: `La magnétite est le modèle des spinelles : oxygènes en empilement cubique compact, Fe³⁺ dans des tétraèdres, Fe²⁺ et
        Fe³⁺ dans des octaèdres. Les électrons qui sautent entre Fe²⁺ et Fe³⁺ voisins la rendent noire, conductrice et fortement
        magnétique : c'est la pierre d'aimant.`,
      intro: `La magnétite cristallise dans les magmas et les roches métamorphiques ; elle n'apparaît presque jamais dans un sol.`,
      scenarios: [
        sc("Dans un magma basique",
          `Dans les gabbros et les basaltes, la magnétite cristallise en grains vers 1 000 °C ; dans certaines grandes chambres, elle
            se concentre en lits épais (Bushveld) ou en grands amas (Kiruna, Suède).`,
          { type: "magma", echelle: "croute", chemin: [
            pt(1200, 0.3, 1, "Un magma basaltique s'installe dans la croûte."),
            pt(1050, 0.3, 2, "Vers 1 100–1 000 °C, la magnétite cristallise avec le pyroxène et le plagioclase.", { bande: "cristallisation" }),
            pt(950, 0.3, 3, "Le gabbro achève de cristalliser ; la magnétite y reste en grains noirs.")], note: "Chemin schématique." }, ["hirschmann"]),
        sc("Fabriquée par des bactéries",
          `Certaines bactéries des eaux pauvres en oxygène fabriquent des chaînes de cristaux de magnétite de 50 nm, qui leur servent
            de boussole ; d'autres en déposent en réduisant les oxydes de fer.`, PAS("ce sont les bactéries qui décident."), [SRC.cornell]),
      ],
    },
    fougerite: {
      sansForme: "Forme non dessinée : la fougérite forme des plaquettes nanométriques qui s'oxydent en quelques minutes à l'air.",
      forme: `La fougérite (« rouille verte ») est faite de feuillets d'hydroxyde où fer ferreux, fer ferrique et magnésium se
        partagent les octaèdres, avec de l'eau et des anions entre les feuillets. Sa couleur bleu-vert vient du mélange de Fe²⁺
        et de Fe³⁺ ; à l'air, elle devient orange en quelques minutes.`,
      intro: `La fougérite colore en bleu-vert les horizons engorgés en permanence (gleys) ; elle a été décrite à Fougères (Ille-et-Vilaine).`,
      scenarios: [sc("Dans un sol engorgé",
        `Sous la nappe, le fer est surtout ferreux ; une partie s'oxyde au contact des racines et des bactéries et forme cette
          rouille mixte, à la limite entre fer dissous et oxydes. Décrite en 2007 dans les sols de la forêt de Fougères.`,
        ehph("fer", [E(7.2, 0.05, 1, "Sous la nappe, le fer est surtout dissous en Fe²⁺."), E(7.6, -0.05, 2, "Près de la limite avec les oxydes ferriques, une partie du fer s'oxyde : Fe²⁺ et Fe³⁺ forment ensemble la fougérite.")],
          "Domaine indicatif : la fougérite se forme près de la limite Fe²⁺ / oxydes ferriques, que le diagramme trace pour le seul fer.")) ],
    },
    akaganeite: {
      sansForme: "Forme non dessinée : l'akaganéite forme des aiguilles microscopiques.",
      forme: `L'akaganéite a des tunnels carrés délimités par des chaînes d'octaèdres de fer ; des ions chlorure y logent et sont
        nécessaires à la charpente. Sans chlore, elle ne se forme pas.`,
      intro: `L'akaganéite ne se forme qu'en présence de chlorure : rouille marine, sols salés, météorites.`,
      scenarios: [sc("Dans la rouille marine et les météorites",
        `Le fer qui s'oxyde dans l'eau salée donne de l'akaganéite : elle ronge les objets archéologiques en fer sortis de la mer, et
          les météorites de fer ramassées au sol. Décrite en 1962 dans la mine d'Akagane (Japon).`, PAS("c'est la présence de chlorure qui décide."))],
    },
    wustite: {
      sansForme: "Forme non dessinée : la wüstite naturelle se trouve en grains microscopiques.",
      forme: `La wüstite (FeO) a la structure du sel ; il lui manque toujours un peu de fer. Elle n'est stable que sans oxygène, ou
        au-dessus de 570 °C.`,
      intro: `La wüstite ne se forme que dans les milieux les plus réducteurs.`,
      scenarios: [sc("Dans les milieux sans oxygène",
        `Inclusions dans les diamants (elle vient du manteau profond), météorites, laitiers de haut-fourneau, et pellicule bleutée
          des aciers chauffés.`, PAS("ces conditions extrêmes ne figurent sur aucun diagramme de l'atlas."))],
    },
    limonite: {
      sansForme: "Pas de forme : la limonite n'est pas un minéral mais un mélange d'oxydes de fer mal cristallisés.",
      forme: `« Limonite » est un terme de terrain : un mélange de goethite, de ferrihydrite et d'autres oxydes de fer mal cristallisés,
        avec de l'eau. Il n'a donc pas de structure propre ; analysé, il se révèle surtout fait de goethite.`,
      intro: `La limonite désigne les croûtes et concrétions d'oxydes de fer de tous les milieux oxydés.`,
      scenarios: [sc("Croûtes, concrétions et chapeaux de fer",
        `Partout où le fer dissous s'oxyde : chapeaux de fer, minerais de fer des marais (fer des prairies), croûtes des sols. Les
          minerais de fer des marais ont alimenté les forges de l'Europe jusqu'au XIX<sup>e</sup> siècle.`,
        ehph("fer", [E(6, -0.1, 1, "L'eau sans oxygène porte du fer dissous (Fe²⁺)."), E(6.5, 0.6, 2, "À l'air, le fer s'oxyde et précipite en oxydes mal cristallisés : la limonite.")]), [SRC.cornell])],
    },

    // ═══════════ manganèse ═══════════
    vernadite: {
      sansForme: "Pas de forme : la vernadite est faite de feuillets nanométriques empilés au hasard, sans maille définie.",
      forme: `La vernadite est une birnessite désordonnée : des feuillets d'octaèdres MnO₆ de quelques nanomètres, empilés sans ordre.
        Elle n'a donc pas de structure 3D dans l'atlas (voir la birnessite pour le feuillet).`,
      intro: `La vernadite est le premier oxyde de manganèse que fabriquent les bactéries.`,
      scenarios: [sc("Là où le manganèse dissous rencontre l'oxygène",
        `Des bactéries et des champignons oxydent le manganèse dissous et le déposent en enduits noirs : films sur les galets des
          torrents, taches des sols, vernis du désert. Elle mûrit ensuite en birnessite ou en todorokite.`,
        ehph("manganese", [E(6.5, 0.1, 1, "Dans l'eau sans oxygène, le manganèse est dissous (Mn²⁺)."), E(9, 0.55, 2, "À l'air, les bactéries l'oxydent : il précipite en oxyde de Mn⁴⁺ nanométrique, la vernadite.")]), [SRC.post])],
    },
    birnessite: {
      sansForme: "Forme non dessinée : la birnessite forme des plaquettes microscopiques.",
      forme: `La birnessite est faite de feuillets d'octaèdres MnO₆, dont certains sites sont vides, séparés de 7 Å par un plan d'eau
        et de cations (sodium, potassium, calcium). Ces cations s'échangent facilement : la birnessite piège les métaux des sols.`,
      intro: `La birnessite est l'oxyde de manganèse le plus commun des sols.`,
      scenarios: [sc("Dans un sol",
        `Le manganèse libéré par l'altération des minéraux, dissous quand le sol est engorgé, s'oxyde quand il s'assèche : taches et
          nodules noirs, dendrites sur les fissures des roches (souvent prises pour des fossiles de plantes).`,
        ehph("manganese", [E(6.8, 0.15, 1, "Sol engorgé : le manganèse est dissous."), E(9, 0.55, 2, "Le sol s'assèche, l'air revient : le manganèse précipite en birnessite.")]), [SRC.post])],
    },
    lithiophorite: {
      sansForme: "Forme non dessinée : la lithiophorite forme des masses et des nodules microcristallins.",
      forme: `La lithiophorite alterne des feuillets d'octaèdres de manganèse et des feuillets d'octaèdres d'aluminium et de lithium,
        reliés par des liaisons hydrogène : un « sandwich » d'oxyde de manganèse et de gibbsite.`,
      intro: `La lithiophorite remplace la birnessite dans les sols acides et très altérés.`,
      scenarios: [sc("Dans un sol tropical acide",
        `Dans les sols ferrallitiques et les altérites sur granite, acides et riches en aluminium, le manganèse précipite en
          lithiophorite plutôt qu'en birnessite.`, null, [SRC.post])],
    },
    todorokite: {
      sansForme: "Forme non dessinée : la todorokite forme des fibres et des lamelles microscopiques.",
      forme: `La todorokite a une charpente d'octaèdres MnO₆ en tunnels de 3 × 3 octaèdres, assez larges pour loger de l'eau et des
        cations (magnésium, nickel, cuivre) : ce sont eux qui font la valeur des nodules polymétalliques.`,
      intro: `La todorokite est l'oxyde de manganèse des nodules des fonds océaniques.`,
      scenarios: [sc("Au fond de l'océan",
        `Sur les plaines abyssales, le manganèse dissous dans l'eau de mer et dans la vase précipite autour d'un débris, quelques
          millimètres par million d'années : les nodules polymétalliques, riches en nickel, cuivre et cobalt.`, PAS("croissance au fond de la mer, sur des millions d'années."), [SRC.post])],
    },
    cryptomelane: {
      sansForme: "Forme non dessinée : le cryptomélane forme des masses compactes et fibreuses, sans cristaux visibles.",
      forme: `Le cryptomélane a des tunnels de 2 × 2 octaèdres MnO₆ où loge le potassium (structure de la hollandite). Ce potassium
        permet de le dater (méthode potassium–argon), et donc de dater l'altération qui l'a formé.`,
      intro: `Le cryptomélane se forme dans les chapeaux d'oxydation des gisements de manganèse.`,
      scenarios: [sc("Dans un chapeau d'oxydation",
        `Les eaux de surface lessivent le manganèse des roches et le reprécipitent en masses compactes au-dessus des gisements ; dans
          les profils latéritiques, ses âges retracent des dizaines de millions d'années d'altération.`, null, [SRC.post])],
    },
    romanechite: {
      sansForme: "Forme non dessinée : la romanéchite forme des concrétions mamelonnées sans cristaux.",
      forme: `La romanéchite a des tunnels de 2 × 3 octaèdres MnO₆ occupés par le baryum et l'eau. C'est le principal constituant du
        « psilomélane » des anciens auteurs.`,
      intro: `La romanéchite précipite dans les zones d'oxydation riches en baryum ; elle a été décrite à Romanèche (Saône-et-Loire).`,
      scenarios: [sc("Dans un filon oxydé",
        `À Romanèche-Thorins, les filons de barytine et de manganèse ont été exploités du XVIII<sup>e</sup> au XX<sup>e</sup> siècle ;
          le manganèse y forme des concrétions noires mamelonnées.`, PAS("c'est l'oxydation près de la surface, en présence de baryum, qui la fait."), [SRC.post])],
    },
    pyrolusite: {
      sansForme: "Forme non dessinée : la pyrolusite forme surtout des masses, des pseudomorphoses de manganite et des dendrites ; ses rares cristaux (« polianite ») sont mal décrits.",
      forme: `La pyrolusite (β-MnO₂) a la structure du rutile : chaînes d'octaèdres MnO₆ partageant leurs arêtes, tunnels trop
        étroits pour un cation. C'est la forme la plus stable de l'oxyde de manganèse, celle vers laquelle mûrissent les autres.`,
      intro: `La pyrolusite est l'aboutissement de l'oxydation du manganèse.`,
      scenarios: [sc("En fin de maturation",
        `En milieu franchement oxydant et sec, les autres oxydes de manganèse recristallisent lentement en pyrolusite ; elle remplace
          souvent les cristaux de manganite en gardant leur forme. Les verriers s'en servaient pour décolorer le verre (« savon des
          verriers »).`,
        ehph("manganese", [E(7, 0.2, 1, "Le manganèse dissous (Mn²⁺)…"), E(9.5, 0.6, 2, "… s'oxyde complètement en milieu très oxydant : Mn⁴⁺, pyrolusite.")]), [SRC.post])],
    },
    manganite: {
      sansForme: "Forme non dessinée : ses prismes striés sont décrits dans une maille pseudo-orthorhombique différente de celle de la structure 3D ; la conversion des indices n'a pas pu être vérifiée.",
      forme: `La manganite (MnOOH) contient du manganèse trivalent, dont les octaèdres sont très déformés (effet Jahn-Teller) : deux
        liaisons nettement plus longues que les quatre autres. Elle s'oxyde facilement en pyrolusite en gardant sa forme.`,
      intro: `La manganite naît là où le manganèse ne s'oxyde qu'à moitié.`,
      scenarios: [sc("Oxydation incomplète",
        `Dans les filons de basse température et les concrétions des marais, en milieu modérément oxydant, le manganèse s'arrête au
          degré 3 : prismes noirs striés (Ilfeld, Harz).`,
        ehph("manganese", [E(7, 0.2, 1, "Le manganèse est dissous (Mn²⁺)."), E(10, 0.2, 2, "En milieu modérément oxydant et basique, il précipite au degré 3 : la manganite.")],
          "Domaine du Mn³⁺ (MnOOH) sur le diagramme du manganèse."), [SRC.post])],
    },
    hausmannite: {
      forme: `L'hausmannite est un spinelle de manganèse (Mn²⁺Mn³⁺₂O₄) ; les octaèdres de Mn³⁺, allongés par l'effet Jahn-Teller,
        étirent toute la maille le long de c. L'octaèdre du spinelle devient une bipyramide quadratique.`,
      intro: `L'hausmannite ne se forme que dans les gisements de manganèse chauffés.`,
      scenarios: [sc("Dans un gisement métamorphisé",
        `Le métamorphisme d'un sédiment riche en manganèse (ou les fluides chauds qui le traversent) le transforme en hausmannite et en
          braunite : gisements du Kalahari (Afrique du Sud), Långban (Suède).`,
        { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
          pt(15, 0, 1, "Des boues riches en manganèse se déposent au fond de la mer."),
          pt(450, 0.4, 2, "Enfouies et chauffées, elles recristallisent en hausmannite et en braunite.", { bande: "recristallisation" }),
          pt(15, 0, 3, "L'érosion les ramène en surface.")], note: "Chemin schématique." }, ["pattison"])],
    },
    braunite: {
      forme: `La braunite associe des octaèdres de Mn³⁺, des polyèdres de Mn²⁺ et un tétraèdre de silice pour huit manganèses : une
        bixbyite dans laquelle le silicium a trouvé sa place. Ses bipyramides imitent des octaèdres.`,
      intro: `La braunite est le principal minerai de manganèse des gisements métamorphiques.`,
      scenarios: [sc("Dans un gisement métamorphisé",
        `Dans les sédiments manganésifères métamorphisés de l'Inde, de l'Afrique du Sud ou du Brésil, la braunite est le minerai
          principal ; en Europe, on la trouve à Saint-Marcel (Val d'Aoste).`,
        { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
          pt(15, 0, 1, "Des boues riches en manganèse et en silice se déposent au fond de la mer."),
          pt(500, 0.5, 2, "Enfouies et chauffées, elles recristallisent : la braunite fixe ensemble manganèse et silice.", { bande: "recristallisation" }),
          pt(15, 0, 3, "L'érosion les ramène en surface.")], note: "Chemin schématique." }, ["pattison"])],
    },
    bixbyite: {
      forme: `La bixbyite a la structure de la fluorine à laquelle on a retiré un oxygène sur quatre : chaque métal est entouré de six
        oxygènes, au sommet d'un cube dont deux coins manquent. Fer et manganèse se partagent les sites.`,
      intro: `La bixbyite cristallise dans les cavités des laves acides, à partir des gaz.`,
      scenarios: [sc("Dans les cavités d'une rhyolite",
        `En refroidissant, les coulées de rhyolite de Thomas Range (Utah) ont laissé échapper des gaz chauds qui ont déposé, dans les
          bulles de la lave, de petits cubes noirs de bixbyite avec la topaze.`, PAS("dépôt à partir des gaz d'une lave qui refroidit."))],
    },
    manganosite: {
      forme: `La manganosite (MnO) a la structure du sel. Elle n'est stable que sans oxygène : à l'air, elle noircit en surface en
        s'oxydant.`,
      intro: `La manganosite ne se forme que dans des gisements de manganèse très réducteurs.`,
      scenarios: [sc("Dans un gisement métamorphique réducteur",
        `Långban (Suède) et Franklin (New Jersey) : dans des marbres métamorphisés, en l'absence presque totale d'oxygène.`,
        PAS("ces conditions très réductrices, à haute température, ne figurent sur aucun diagramme de l'atlas."))],
    },

    // ═══════════ aluminium ═══════════
    gibbsite: {
      sansForme: "Forme non dessinée : la gibbsite forme surtout des masses et des plaquettes pseudo-hexagonales microscopiques.",
      forme: `La gibbsite est faite de feuillets d'octaèdres Al(OH)₆ (deux sites sur trois occupés), tenus entre eux par des liaisons
        hydrogène : c'est la couche octaédrique des argiles, sans silice. D'où le clivage basal parfait.`,
      intro: `La gibbsite est le minéral des bauxites : ce qui reste d'une roche quand la pluie tropicale en a enlevé toute la silice.`,
      scenarios: [
        sc("Dans un sol tropical très lessivé",
          `Sous un climat tropical (≥ 22 °C) où la pluie dépasse l'évaporation presque tous les mois, et dans un sol bien drainé,
            l'eau emporte la silice et les cations ; l'aluminium, insoluble, reste en gibbsite : les sols ferrallitiques et les
            bauxites latéritiques (Guinée, Australie).`,
          clim([[22, 30, 1, 2.5]], ["bauxites", 26, 2.2], [
            { T: 26, ai: 1.8, n: 1, t: "Climat équatorial : ≈ 26 °C, pluie bien supérieure à l'ETP." },
            { n: 2, t: "L'eau emporte la silice ; l'aluminium reste sur place en gibbsite, sur des millions d'années." }],
            "Domaine schématique."), ["h5", SRC.bardossy]),
        sc("Selon l'acidité de l'eau",
          `L'aluminium n'est soluble qu'en eau très acide ou très basique : entre pH ≈ 4,5 et 8,5, il précipite en gibbsite.`,
          ehph("aluminium", [E(3.5, 0.6, 1, "En eau très acide, l'aluminium est dissous (Al³⁺)."), E(6.5, 0.6, 2, "L'eau se neutralise : l'aluminium précipite en gibbsite.")]), [SRC.vernon]),
      ],
    },
    bayerite: {
      sansForme: "Forme non dessinée : la bayérite naturelle forme des grains microscopiques.",
      forme: `Même feuillet que la gibbsite, empilé autrement : les OH d'un feuillet se logent dans les creux du suivant.`,
      intro: `La bayérite est rare dans la nature ; elle se forme quand l'hydroxyde d'aluminium précipite vite.`,
      scenarios: [sc("En précipitation rapide",
        `Dans quelques basaltes altérés, et surtout dans les usines d'alumine ; la nature, qui prend son temps, fait de la gibbsite.`,
        PAS("c'est la vitesse de précipitation qui la choisit."))],
    },
    nordstrandite: {
      sansForme: "Forme non dessinée : la nordstrandite forme des grains et des agrégats microscopiques.",
      forme: `Troisième façon d'empiler le feuillet de la gibbsite, en alternant les empilements de la gibbsite et de la bayérite.`,
      intro: `La nordstrandite apparaît dans les milieux alcalins.`,
      scenarios: [sc("Dans un karst alcalin",
        `Dans les poches karstiques et les sols sur calcaire, où l'eau est basique, l'hydroxyde d'aluminium cristallise en nordstrandite.`,
        PAS("c'est la basicité de l'eau qui la choisit."))],
    },
    boehmite: {
      sansForme: "Forme non dessinée : la boehmite des bauxites est microcristalline.",
      forme: `La boehmite (AlOOH) a perdu la moitié de l'eau de la gibbsite : doubles couches d'octaèdres ondulées, tenues par des
        liaisons hydrogène.`,
      intro: `La boehmite domine les bauxites des climats chauds à saison sèche, et les bauxites enfouies.`,
      scenarios: [sc("Dans une bauxite karstique",
        `Les bauxites des Baux-de-Provence (qui ont donné leur nom au minerai) et du Var sont surtout faites de boehmite : altérations
          tropicales du Crétacé, piégées dans le karst, puis enfouies et un peu chauffées.`,
        clim([[22, 30, 0.5, 1.5]], ["bauxites à boehmite", 26, 1.65], [
          { T: 26, ai: 0.9, n: 1, t: "Climat tropical à saison sèche marquée." },
          { n: 2, t: "L'aluminium reste sur place ; la saison sèche, puis l'enfouissement, déshydratent la gibbsite en boehmite." }],
          "Domaine schématique."), ["h5", SRC.bardossy])],
    },
    diaspore: {
      forme: `Même formule que la boehmite (AlOOH), mais la structure plus dense de la goethite : doubles chaînes d'octaèdres le long
        de c. Plus dure (6,5 à 7) et plus dense que la boehmite, elle est la forme stable sous pression.`,
      intro: `Le diaspore naît des bauxites enfouies et métamorphisées.`,
      scenarios: [sc("Dans une bauxite métamorphisée",
        `Enfouies et chauffées au-delà de ≈ 200–300 °C, les bauxites à gibbsite et boehmite deviennent bauxites à diaspore ; plus
          chauffées encore, elles donnent l'émeri (corindon). Les bauxites de Grèce et de l'Oural sont à diaspore.`,
        { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
          pt(25, 0, 1, "Une bauxite se forme en surface, sous un climat tropical."),
          pt(280, 0.3, 2, "Enfouie à quelques kilomètres, chauffée vers 250–300 °C, sa boehmite devient diaspore.", { bande: "diaspore" }),
          pt(15, 0, 3, "Remontée par l'érosion, elle garde son diaspore.")], note: "Chemin schématique." }, ["pattison", SRC.bardossy])],
    },
    corindon: {
      forme: `Dans le corindon, les oxygènes sont empilés de façon compacte et les aluminiums occupent deux vides octaédriques sur
        trois : liaisons courtes et fortes, d'où une dureté de 9. Pur, il est incolore ; un peu de chrome le rend rouge (rubis),
        du fer et du titane le rendent bleu (saphir).`,
      intro: `Le corindon cristallise à haute température dans les roches riches en aluminium et pauvres en silice.`,
      scenarios: [
        sc("Dans un marbre ou un gneiss chauffé",
          `Quand une roche riche en aluminium mais pauvre en silice est fortement chauffée (marbres à impuretés argileuses, gneiss
            désilicifiés au contact des péridotites), l'aluminium cristallise en corindon : rubis des marbres de Birmanie, du Vietnam.`,
          { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Un calcaire impur, riche en argile, se dépose au fond de la mer."),
            pt(700, 0.7, 2, "Enfoui dans une collision et chauffé vers 600–750 °C, il recristallise en marbre ; l'aluminium, sans silice, cristallise en corindon (rubis).", { bande: "corindon" }),
            pt(15, 0, 3, "L'érosion de la chaîne ramène le marbre en surface ; les rubis libérés se concentrent dans les graviers.")], note: "Chemin schématique." }, ["pattison", SRC.simonet]),
        sc("Dans un basalte",
          `Certains basaltes ont remonté des saphirs cristallisés plus bas, dans la croûte : les saphirs du Massif central (Le Puy,
            Expailly) et de Thaïlande.`, PAS("les saphirs sont arrachés à la profondeur par le basalte, qui ne les a pas formés."), [SRC.simonet]),
      ],
    },

    // ═══════════ titane ═══════════
    rutile: {
      forme: `Le rutile (TiO₂) est fait de chaînes d'octaèdres TiO₆ partageant leurs arêtes le long de c : d'où les prismes et les
        aiguilles. Il est très réfractaire et presque insoluble : l'altération ne le touche pas.`,
      intro: `Le rutile cristallise dans les roches métamorphiques et magmatiques, puis se concentre dans les sables.`,
      scenarios: [
        sc("Dans une roche métamorphique",
          `En chauffant, les minéraux titanés des argiles (et la titanite) libèrent leur titane, qui recristallise en rutile dans les
            schistes, les gneiss et les éclogites ; dans le quartz des filons alpins, il pousse en aiguilles dorées.`,
          { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Une argile contenant un peu de titane se dépose au fond de la mer."),
            pt(600, 0.8, 2, "Enfouie et chauffée, elle devient schiste puis gneiss ; le titane recristallise en rutile.", { bande: "rutile" }),
            pt(15, 0, 3, "Remonté par l'érosion, le rutile traverse l'altération intact.")], note: "Chemin schématique." }, ["pattison"]),
        sc("Dans un sable de plage",
          `Dense (4,2) et inaltérable, il se concentre avec le zircon et l'ilménite dans les sables noirs (Australie, Sierra Leone).`,
          PAS("même tri par les vagues que les autres minéraux lourds.")),
      ],
    },
    anatase: {
      forme: `L'anatase est une autre façon d'assembler les octaèdres TiO₆ (quatre arêtes partagées au lieu de deux) : maille
        quadratique très allongée, d'où les bipyramides aiguës. Stable à basse température, elle se change en rutile au-delà de
        ≈ 600 °C.`,
      intro: `L'anatase se forme à basse température : dans les sols, et dans les fentes alpines.`,
      scenarios: [
        sc("Dans un sol",
          `Quand un minéral titané s'altère (biotite, ilménite, titanite), le titane, insoluble, reprécipite sur place en microcristaux
            d'anatase : elle est présente dans presque tous les sols.`, null),
        sc("Dans une fente alpine",
          `Dans les fissures ouvertes des Alpes, des eaux chaudes (200–400 °C) déposent l'anatase en bipyramides bleues avec le quartz
            et l'albite (Oisans, Binn).`, PAS("dépôt d'eau chaude dans une fissure ; le titane n'est pas tracé sur le diagramme de la silice.")),
      ],
    },
    brookite: {
      forme: `La brookite est la troisième façon d'assembler les octaèdres TiO₆ (trois arêtes partagées) : maille orthorhombique,
        tablettes minces. Comme l'anatase, elle se change en rutile quand on la chauffe.`,
      intro: `La brookite cristallise dans les fentes alpines, à basse température.`,
      scenarios: [sc("Dans une fente alpine",
        `Tablettes brun-rouge, souvent avec l'anatase et le quartz, dans les fissures du massif de l'Oisans (Bourg-d'Oisans) et des
          Alpes suisses.`, PAS("dépôt d'eau chaude dans une fissure."))],
    },
    ilmenite: {
      forme: `L'ilménite (FeTiO₃) a la structure du corindon, avec fer et titane rangés en plans alternés : le centre de symétrie de
        la maille disparaît en partie (classe 3̄). Faiblement magnétique, à trait noir.`,
      intro: `L'ilménite cristallise dans les roches basiques et se concentre dans les sables noirs.`,
      scenarios: [
        sc("Dans un gabbro",
          `Le titane des magmas basaltiques cristallise en ilménite, en grains, avec la magnétite ; dans certaines grandes intrusions
            d'anorthosite (Tellnes en Norvège, Lac Tio au Québec), elle forme des gisements exploités pour le titane.`,
          { type: "magma", echelle: "croute", chemin: [
            pt(1200, 0.3, 1, "Un magma basique s'installe dans la croûte."),
            pt(1050, 0.3, 2, "Vers 1 100–1 000 °C, l'ilménite cristallise avec la magnétite.", { bande: "cristallisation" }),
            pt(950, 0.3, 3, "La roche achève de cristalliser.")], note: "Chemin schématique." }, ["hirschmann"]),
        sc("Dans un sable de plage",
          `Lourde et résistante, elle forme l'essentiel des sables noirs des plages (Kerala, Australie, Madagascar), d'où l'on tire la
            majeure partie du titane.`, PAS("même tri par les vagues que les autres minéraux lourds.")),
      ],
    },
    leucoxene: {
      sansForme: "Pas de forme : le leucoxène est un mélange de grains fins d'anatase, de rutile et d'oxydes de fer.",
      forme: `« Leucoxène » désigne un produit d'altération, pas une espèce : l'ilménite ou la titanite perdent leur fer et se
        changent en un agrégat blanchâtre d'anatase et de rutile fins. Il n'a pas de structure propre.`,
      intro: `Le leucoxène est le dernier état du titane dans les sols et les sables altérés.`,
      scenarios: [sc("En altérant l'ilménite",
        `L'eau dissout lentement le fer de l'ilménite, qui garde sa forme mais blanchit et s'enrichit en titane : les sables lourds
          anciens sont plus riches en titane que les récents.`, null)],
    },
    perovskite: {
      forme: `La pérovskite (CaTiO₃) est faite d'octaèdres TiO₆ reliés par leurs sommets dans les trois directions, avec le calcium
        dans les grandes cavités ; les octaèdres basculent un peu, d'où une maille orthorhombique presque cubique. Ce schéma de
        structure est l'un des plus répandus : le minéral le plus abondant de la Terre, la bridgmanite du manteau inférieur, est
        une pérovskite.`,
      intro: `La pérovskite cristallise dans les magmas très pauvres en silice.`,
      scenarios: [sc("Dans un magma sous-saturé",
        `Dans les kimberlites, les carbonatites et les mélilitites, le calcium et le titane ne trouvent pas assez de silice pour
          faire de la titanite : ils cristallisent en pérovskite. Décrite dans l'Oural en 1839.`,
        { type: "magma", echelle: "manteau", chemin: [
          pt(1350, 3.0, 1, "Le manteau fond très peu, en profondeur : le liquide est pauvre en silice et riche en calcium et en titane."),
          pt(1100, 0.5, 2, "Le magma remonte et cristallise ; faute de silice, le titane forme de la pérovskite.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"])],
    },
    geikielite: {
      sansForme: "Forme non dessinée : la geikiélite se trouve en grains et en galets ; ses cristaux sont rares.",
      forme: `La geikiélite (MgTiO₃) a la structure de l'ilménite, le magnésium à la place du fer.`,
      intro: `La geikiélite se forme dans les marbres dolomitiques et les kimberlites.`,
      scenarios: [sc("Dans un marbre ou une kimberlite",
        `Dans les dolomies métamorphisées riches en titane, et en grains dans les kimberlites ; décrite dans les graviers à gemmes du
          Sri Lanka en 1892.`, PAS("minéral accessoire, concentré ensuite dans les graviers."))],
    },

    // ═══════════ cuivre ═══════════
    cuprite: {
      forme: `Dans la cuprite (Cu₂O), chaque cuivre est lié à deux oxygènes en ligne, chaque oxygène à quatre cuivres : deux réseaux
        identiques s'interpénètrent sans se toucher. Son rouge profond vient du cuivre monovalent.`,
      intro: `La cuprite naît de l'oxydation modérée des gisements de cuivre.`,
      scenarios: [sc("Dans la zone oxydée d'un gisement de cuivre",
        `Juste sous la zone la plus oxydée (malachite, azurite), là où l'eau est encore peu oxydante, le cuivre s'oxyde à moitié :
          la cuprite enrobe souvent le cuivre natif. Chessy (Rhône) en a donné de beaux octaèdres.`,
        ehph("cuivre", [E(8, -0.2, 1, "En milieu réducteur, le cuivre reste métallique (cuivre natif)."), E(8, 0.1, 2, "En milieu un peu oxydant, il s'oxyde à moitié : la cuprite."), E(8, 0.45, 3, "Plus oxydant encore, il devient ténorite (ou malachite s'il y a du gaz carbonique).")]), [SRC.vernon])],
    },
    tenorite: {
      sansForme: "Forme non dessinée : la ténorite forme des écailles et des masses noires terreuses.",
      forme: `Dans la ténorite (CuO), chaque cuivre est entouré de quatre oxygènes en carré presque plan, comme souvent le cuivre
        divalent. Elle est noire et terne.`,
      intro: `La ténorite naît de l'oxydation complète du cuivre.`,
      scenarios: [
        sc("Dans un chapeau oxydé",
          `En milieu très oxydant et sans gaz carbonique abondant, le cuivre s'oxyde en ténorite noire : la « mélaconite » des mineurs.`,
          ehph("cuivre", [E(8, 0.1, 1, "En milieu peu oxydant, le cuivre est en cuprite."), E(9, 0.6, 2, "En milieu très oxydant, il devient ténorite.")]), [SRC.vernon]),
        sc("Autour d'une fumerolle",
          `Elle se dépose aussi en écailles brillantes autour des fumerolles du Vésuve, où elle a été décrite en 1841.`,
          PAS("dépôt à la sortie des gaz volcaniques.")),
      ],
    },

    // ═══════════ zinc, chrome, magnésium ═══════════
    zincite: {
      sansForme: "Forme non dessinée : la zincite naturelle forme des grains et des masses ; ses cristaux sont rares (les grands cristaux rouges vendus viennent de fumées d'usines de zinc).",
      forme: `La zincite (ZnO) a la structure de la würtzite : chaque zinc dans un tétraèdre d'oxygènes, tous pointés dans le même
        sens le long de c. Le cristal est polaire, ses deux bouts sont différents. Le manganèse la colore en rouge.`,
      intro: `La zincite naturelle ne se trouve presque qu'à Franklin et Sterling Hill (New Jersey).`,
      scenarios: [sc("Dans le marbre de Franklin",
        `Un sédiment riche en zinc, en fer et en manganèse, métamorphisé il y a ≈ 1,1 milliard d'années, a donné l'assemblage unique
          de Franklin : zincite rouge, franklinite noire et willémite verte dans la calcite.`, PAS("métamorphisme d'un gisement de composition exceptionnelle."))],
    },
    gahnite: {
      forme: `La gahnite (ZnAl₂O₄) est un spinelle : zinc en tétraèdres, aluminium en octaèdres. Dure (7,5–8) et inaltérable.`,
      intro: `La gahnite cristallise dans les pegmatites et les gisements de zinc métamorphisés.`,
      scenarios: [sc("Dans une pegmatite ou un gneiss",
        `Dans les pegmatites granitiques et les gisements de zinc métamorphisés (Broken Hill), le zinc se fixe avec l'aluminium en
          gahnite verte.`, PAS("minéral de haute température, dans une roche de composition particulière."))],
    },
    franklinite: {
      forme: `La franklinite est un spinelle : zinc en tétraèdres, fer ferrique (et manganèse) en octaèdres. Noire, faiblement
        magnétique.`,
      intro: `La franklinite ne se trouve presque qu'à Franklin (New Jersey).`,
      scenarios: [sc("Dans le marbre de Franklin",
        `Avec la zincite et la willémite, dans les marbres métamorphisés de Franklin et Sterling Hill ; elle a donné son nom à la ville,
          elle-même nommée d'après Benjamin Franklin.`, PAS("métamorphisme d'un gisement de composition exceptionnelle."))],
    },
    chromite: {
      forme: `La chromite est un spinelle : fer ferreux en tétraèdres, chrome en octaèdres. Le chrome trivalent, très stable dans les
        octaèdres, la rend inaltérable : les rivières la roulent sans l'abîmer.`,
      intro: `La chromite cristallise dans le manteau et dans les magmas ultrabasiques.`,
      scenarios: [
        sc("Dans le manteau, sous une dorsale",
          `Sous les dorsales et les arcs, les liquides qui traversent le manteau y déposent la chromite en poches et en lentilles
            (chromitites « podiformes ») : ce sont les gisements des ophiolites (Turquie, Oman, Nouvelle-Calédonie).`,
          { type: "magma", echelle: "manteau", chemin: [
            pt(1400, 1.0, 1, "Un liquide basaltique traverse le manteau sous une dorsale."),
            pt(1250, 0.4, 2, "En réagissant avec la péridotite, il dépose la chromite en lentilles.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"]),
        sc("Dans une grande chambre magmatique",
          `Au fond des grandes intrusions (Bushveld), la chromite se dépose en lits d'un mètre d'épaisseur sur des dizaines de
            kilomètres : les plus grandes réserves de chrome du monde.`, PAS("voir la fiche du platine, qui se concentre dans les mêmes lits.")),
      ],
    },
    eskolaite: {
      sansForme: "Forme non dessinée : l'eskolaïte est rare, en petits grains et en prismes mal formés.",
      forme: `L'eskolaïte (Cr₂O₃) a la structure du corindon, le chrome à la place de l'aluminium.`,
      intro: `L'eskolaïte est un oxyde de chrome rare des roches métamorphiques chromifères.`,
      scenarios: [sc("Dans une roche métamorphique riche en chrome",
        `Décrite en 1958 à Outokumpu (Finlande) et nommée d'après le pétrographe finlandais Pentti Eskola ; trouvée aussi en inclusion
          dans des diamants.`, PAS("minéral rare de composition particulière."))],
    },
    periclase: {
      forme: `Le périclase (MgO) a la structure du sel. Au contact de l'humidité, il s'hydrate en brucite : on ne le trouve presque
        jamais seul.`,
      intro: `Le périclase naît quand une dolomie est fortement chauffée par un magma.`,
      scenarios: [sc("Au contact d'un magma",
        `Une dolomie chauffée au-delà de ≈ 700 °C, à faible pression, au contact d'une intrusion, perd son gaz carbonique : le magnésium
          reste en périclase, le calcium en calcite.`,
        { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(100, 0.05, 1, "Une dolomie repose à 1–2 km de profondeur."),
          pt(750, 0.05, 2, "Une intrusion toute proche la chauffe vers 700–800 °C : le gaz carbonique part, le magnésium cristallise en périclase.", { bande: "périclase" }),
          pt(15, 0, 3, "L'érosion met le marbre à périclase au jour ; au contact de l'eau, le périclase se change en brucite.")], note: "Chemin schématique." }, ["tuttle"])],
    },
    brucite: {
      forme: `La brucite (Mg(OH)₂) est faite de feuillets d'octaèdres Mg(OH)₆ tenus par des forces faibles : clivage basal parfait,
        lamelles souples. C'est la couche octaédrique des serpentines et du talc, seule.`,
      intro: `La brucite naît de l'hydratation des roches du manteau, en eau très basique.`,
      scenarios: [sc("Dans une serpentinite",
        `Quand l'eau s'infiltre dans une péridotite, l'olivine devient serpentine et brucite ; l'eau devient très basique (pH > 10). Les
          sources hyperalcalines des ophiolites (Oman, Ligurie) en déposent encore.`,
        ehph("magnesium", [E(8, 0.2, 1, "Dans une eau ordinaire, le magnésium reste dissous."), E(11, 0, 2, "Dans l'eau très basique d'une serpentinite, il précipite en brucite.")]), [SRC.vernon])],
    },
    spinelle: {
      forme: `Le spinelle (MgAl₂O₄) est le type de toute une famille : oxygènes en empilement cubique compact, magnésium dans des
        tétraèdres, aluminium dans des octaèdres. Il a donné son nom à la macle la plus courante des cristaux cubiques.`,
      intro: `Le spinelle cristallise dans les marbres et les roches magnésiennes chauffées, et dans le manteau.`,
      scenarios: [
        sc("Dans un marbre de contact",
          `Une dolomie impure chauffée par une intrusion cristallise en marbre à spinelle : les spinelles rouges de Birmanie et du
            Vietnam, avec les rubis.`,
          { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
            pt(100, 0.1, 1, "Une dolomie impure repose à quelques kilomètres de profondeur."),
            pt(650, 0.1, 2, "Chauffée par une intrusion, elle recristallise : magnésium et aluminium forment le spinelle.", { bande: "spinelle" }),
            pt(15, 0, 3, "L'érosion libère les spinelles, que les rivières concentrent.")], note: "Chemin schématique." }, ["tuttle"]),
        sc("Dans le manteau",
          `Entre ≈ 30 et 60 km de profondeur, le spinelle est le minéral alumineux de la péridotite (lherzolite à spinelle de Lherz).`,
          PAS("voir la fiche de la péridotite.")),
      ],
    },

    // ═══════════ étain, zirconium, uranium, niobium ═══════════
    cassiterite: {
      forme: `La cassitérite (SnO₂) a la structure du rutile : chaînes d'octaèdres SnO₆ le long de c. L'étain, lourd, la rend très
        dense (7) ; elle est inaltérable.`,
      intro: `La cassitérite cristallise au sommet des granites riches en étain, puis se concentre dans les rivières.`,
      scenarios: [
        sc("Autour d'un granite",
          `En fin de cristallisation, un granite très évolué libère des fluides chargés d'étain qui transforment sa coupole (greisen) et
            remplissent des filons de quartz : Cornouailles, Erzgebirge ; en France, Montebras et Échassières.`,
          { type: "magma", echelle: "croute", chemin: [
            pt(800, 0.2, 1, "Un magma granitique très évolué, riche en étain et en eau, s'installe vers 5–8 km."),
            pt(680, 0.15, 2, "En cristallisant, il libère des fluides chargés d'étain qui fracturent sa coupole.", { bande: "cristallisation" }),
            pt(400, 0.08, 3, "Vers 500–300 °C, la cassitérite se dépose dans les greisens et les filons de quartz.")], note: "Chemin schématique." }, ["hirschmann", SRC.lehmann]),
        sc("Dans une rivière (placer)",
          `Très dense, la cassitérite se concentre dans les graviers des rivières : les placers de Malaisie et d'Indonésie ont fourni
            l'essentiel de l'étain du XX<sup>e</sup> siècle.`, PAS("même mécanisme que l'or en rivière (voir la fiche de l'or).")),
      ],
    },
    baddeleyite: {
      forme: `Dans la baddeleyite (ZrO₂), chaque zirconium est entouré de sept oxygènes : une fluorine déformée, monoclinique. Très
        réfractaire ; elle contient de l'uranium mais pas de plomb au départ : on la date comme le zircon.`,
      intro: `La baddeleyite cristallise à la place du zircon quand le magma manque de silice.`,
      scenarios: [sc("Dans un magma pauvre en silice",
        `Dans les gabbros, les dolérites et les carbonatites, le zirconium ne trouve pas assez de silice pour faire du zircon : il
          cristallise en baddeleyite. Ces grains servent à dater les grands épanchements de basalte.`,
        { type: "magma", echelle: "croute", chemin: [
          pt(1200, 0.3, 1, "Un magma basique, pauvre en silice, s'installe dans la croûte."),
          pt(1000, 0.3, 2, "En fin de cristallisation, le zirconium sature : faute de silice, il cristallise en baddeleyite.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"])],
    },
    uraninite: {
      forme: `L'uraninite (UO₂) a la structure de la fluorine. L'uranium s'y désintègre en plomb au fil du temps, ce qui en fait un
        chronomètre ; la pechblende des filons est une uraninite mal cristallisée, en partie oxydée.`,
      intro: `L'uraninite précipite là où une eau qui porte de l'uranium oxydé devient réductrice.`,
      scenarios: [
        sc("Dans un filon autour d'un granite",
          `L'uranium des granites (dans la monazite, l'uraninite accessoire) est lessivé par des eaux oxydantes ; quand ces eaux
            rencontrent un milieu réducteur (matière organique, sulfures, fer ferreux), l'uranium redevient insoluble et précipite en
            pechblende : les gisements du Limousin (Bessines), du Forez, de Vendée.`,
          ehph("uranium", [E(5, 0.6, 1, "Dans l'eau oxydante, l'uranium est soluble (uranyle)."), E(6, -0.2, 2, "L'eau rencontre un milieu réducteur : l'uranium redevient tétravalent et précipite en pechblende.")],
            "Le front où l'eau oxydante devient réductrice concentre l'uranium."), [SRC.cuney]),
        sc("Dans une pegmatite",
          `Les pegmatites des granites riches en uranium contiennent des cubes d'uraninite bien formés.`, PAS("cristallisation d'un liquide de pegmatite.")),
      ],
    },
    thorianite: {
      forme: `La thorianite (ThO₂) a la structure de la fluorine, comme l'uraninite, avec laquelle elle forme une série. Plus
        stable que l'uraninite : le thorium ne s'oxyde pas davantage.`,
      intro: `La thorianite cristallise dans les pegmatites et les carbonatites, puis se concentre dans les graviers.`,
      scenarios: [sc("Dans une pegmatite, puis un placer",
        `Décrite en 1904 dans les graviers à gemmes du Sri Lanka ; aussi à Madagascar. Lourde et inaltérable, elle se concentre dans
          les placers.`, PAS("minéral accessoire, concentré ensuite dans les graviers."))],
    },
    columbite: {
      forme: `La columbite associe des octaèdres de niobium (ou de tantale) et de fer (ou de manganèse) en chaînes en zigzag. Le
        tantale, deux fois plus lourd, fait varier la densité de 5,3 à 8 : avec la tantalite, c'est le « coltan ».`,
      intro: `La columbite-tantalite cristallise dans les pegmatites riches en métaux rares.`,
      scenarios: [sc("Dans une pegmatite",
        `Dans les dernières pegmatites des granites riches en métaux rares, niobium et tantale cristallisent en tablettes noires ;
          Échassières (Allier) et Montebras en ont livré. Le coltan des téléphones vient surtout d'Afrique centrale.`,
        PAS("la pegmatite cristallise à partir d'un liquide très riche en eau et en éléments rares, que le diagramme du granite ne représente pas."))],
    },
    pyrochlore: {
      forme: `Le pyrochlore a une charpente d'octaèdres NbO₆ reliés par leurs sommets, calcium, sodium et fluor dans les cavités.
        L'uranium et le thorium qu'il accueille détruisent peu à peu son réseau (état métamicte).`,
      intro: `Le pyrochlore est le minerai du niobium ; il cristallise dans les carbonatites.`,
      scenarios: [sc("Dans une carbonatite",
        `Le niobium se concentre dans les magmas carbonatés et cristallise en petits octaèdres de pyrochlore. L'altération tropicale de
          la carbonatite d'Araxá (Brésil) l'a concentré en une latérite qui fournit l'essentiel du niobium du monde.`,
        PAS("voir la fiche de la carbonatite."))],
    },
  });
})();
