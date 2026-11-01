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
        note: "Dans les géodes, la goethite forme des prismes et des aiguilles striés, parallèles à c, noirs et brillants. Dans les sols, elle ne cristallise qu'en grains de quelques dizaines de nanomètres." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },
    lepidocrocite: {
      nom: "Lépidocrocite", couleur: "#c4652a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "C",
      maille: [3.072, 12.516, 3.873, 90, 90, 90], mailleSource: "cod9017417", azimut: 24, elevation: 20,
      facies: [{ nom: "Écaille", formes: [
        { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.22 }, { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.3 }],
        note: "Lamelles minces aplaties selon b, d'un rouge orangé ; son nom grec signifie « fibre d'écaille »." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.15 }],
    },
    hematite: {
      nom: "Hématite", couleur: "#6e3a34", systeme: "trigonal (rhomboédrique)", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "R",
      maille: HEX(5.038, 13.772), mailleSource: "cod9000139", azimut: 22, elevation: 20,
      facies: [
        { nom: "Tablette (spécularite)", formes: [
          { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.28 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
          note: "Les « roses de fer » des fentes alpines se composent de tablettes minces, noires et miroitantes, nommées « fer spéculaire », disposées en rosaces." },
        { nom: "Rhomboèdre", formes: [
          { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.4 }],
          note: "Cristaux trapus de l'île d'Elbe et des volcans, où ils se déposent dans les fumerolles du Vésuve et du Stromboli." },
      ],
      clivages: [],
    },
    magnetite: cub("Magnétite", "#2e2e33", "m-3m", "hexakisoctaédrique", "F", 8.3941, "cod9007644", [
      OCTA("Les chloritoschistes de Zermatt et de Binn renferment des octaèdres noirs, souvent bien nets, qui peuvent mesurer plusieurs centimètres."),
      { nom: "Dodécaèdre", formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.1 }],
        note: "Dodécaèdres striés, fréquemment observés dans les skarns." },
      MACLE_SP("La macle qui a donné son nom au spinelle, structure que possède la magnétite.")],
      { macleNote: "Macle du spinelle sur {111}." }),

    // ═══════════ manganèse ═══════════
    hausmannite: {
      nom: "Hausmannite", couleur: "#3d2f2c", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I",
      maille: [5.7691, 5.7691, 9.4605, 90, 90, 90], mailleSource: "cod9001963", azimut: 22, elevation: 14,
      macleNote: "Macles selon {112}, fréquemment répétées en groupements de cinq individus.",
      facies: [{ nom: "Bipyramide", formes: [{ sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }],
        note: "Bipyramides presque octaédriques : un spinelle allongé selon c, dont l'octaèdre s'est transformé en bipyramide quadratique." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "basal", pas: 0.22 }],
    },
    braunite: {
      nom: "Braunite", couleur: "#2f2b2b", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I",
      maille: [9.4264, 9.4264, 18.6962, 90, 90, 90], mailleSource: "cod9006541", azimut: 22, elevation: 14,
      facies: [{ nom: "Bipyramide", formes: [{ sym: "p", hkl: [1, 1, 2], nom: "bipyramide", d: 1.0 }],
        note: "Bipyramides pseudo-octaédriques de petite taille (c ≈ 2 a) ; leur couleur est un noir brunâtre et leur éclat submétallique." }],
      clivages: [{ hkl: [1, 1, 2], qualite: "parfait", nom: "{112}", pas: 0.24 }],
    },
    bixbyite: cub("Bixbyite", "#262426", "m-3", "diploïdale", "I", 9.4126, "cod9007522", [
      { nom: "Cube et trapézoèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "n", hkl: [2, 1, 1], nom: "trapézoèdre", d: 1.12 }],
        note: "Cubes noirs et brillants, de petite taille, aux sommets tronqués par trois facettes {211}. Ce faciès caractérise les cavités des rhyolites de Thomas Range (Utah)." }],
      { clivages: [] }),
    manganosite: cub("Manganosite", "#3f7a52", "m-3m", "hexakisoctaédrique", "F", 4.4459, "cod9006658", [
      OCTA("Petits octaèdres vert émeraude, qui noircissent à la lumière par oxydation ; espèce rare (Långban, Franklin).")],
      { clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "cubique", pas: 0.25 }] }),

    // ═══════════ aluminium ═══════════
    diaspore: {
      nom: "Diaspore", couleur: "#e6dccb", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [4.4007, 9.4253, 2.8452, 90, 90, 90], mailleSource: "cod9005758", azimut: 22, elevation: 14,
      facies: [{ nom: "Lame", formes: [
        { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 2.6 }],
        note: "Des lames aplaties selon b et allongées selon c composent ce minéral ; sa variété gemme originaire de Turquie, la « zultanite », varie de couleur selon la lumière." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },
    corindon: {
      nom: "Corindon", couleur: "#5b78b5", systeme: "trigonal (rhomboédrique)", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "R",
      maille: HEX(4.757, 12.9877), mailleSource: "cod9007498", azimut: 20, elevation: 14,
      facies: [
        { nom: "Prisme hexagonal (rubis)", formes: [
          { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.1 }],
          note: "Prismes courts, tronqués net à la base : c'est la forme des rubis des marbres birmans." },
        { nom: "Bipyramide (saphir)", formes: [
          { sym: "n", hkl: [2, 2, -4, 3], nom: "bipyramide hexagonale", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.9 }],
          note: "Bipyramides allongées en tonnelet : c'est le faciès des saphirs issus des basaltes et des placers du Sri Lanka." },
      ],
      clivages: [],
    },

    // ═══════════ titane ═══════════
    rutile: {
      nom: "Rutile", couleur: "#8a3a22", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [4.5941, 4.5941, 2.9589, 90, 90, 90], mailleSource: "cod9007531", azimut: 22, elevation: 14,
      macleNote: "Macle en genou selon {011}, souvent répétée en roues ; en réseau dans le quartz, elle forme la « sagénite ».",
      facies: [{ nom: "Prisme et bipyramide", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.05 },
        { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 2.0 }],
        note: "Prismes striés terminés par une pointe basse, d'un rouge sang à noir ; en aiguilles dorées dans le quartz, ce sont les « cheveux de Vénus »." },
        { nom: "Macle en genou", azimut: 26, elevation: 10, macle: { plan: [0, 1, 1], compo: [0, 1, 1] }, formes: [
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 2.0 }],
          note: "Deux prismes accolés selon un plan {011}, formant un coude d'environ 115°." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "net", nom: "{110}", pas: 0.24 }],
    },
    anatase: {
      nom: "Anatase", couleur: "#3a4a6a", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "I",
      maille: [3.7845, 3.7845, 9.5143, 90, 90, 90], mailleSource: "cod9015929", azimut: 22, elevation: 12,
      facies: [{ nom: "Bipyramide aiguë", formes: [
        { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.2 }],
        note: "Bipyramides très pointues, allant du bleu-noir au miel, qu'on rencontre dans les fentes alpines (Oisans, Binn). Son nom grec signifie « allongée »." }],
      clivages: [{ hkl: [1, 0, 1], qualite: "parfait", nom: "{011}", pas: 0.24 }, { hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.3 }],
    },
    brookite: {
      nom: "Brookite", couleur: "#7a4a2a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [9.174, 5.449, 5.138, 90, 90, 90], mailleSource: "cod9004137", azimut: 24, elevation: 16,
      facies: [{ nom: "Tablette", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.35 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "e", hkl: [1, 2, 2], nom: "bipyramide", d: 1.1 }],
        note: "Dans les fentes alpines du Dauphiné, à Bourg-d'Oisans, on trouve des tablettes minces d'un brun-rouge, souvent traversées par une bande sombre en sablier." }],
      clivages: [],
    },
    ilmenite: {
      nom: "Ilménite", couleur: "#2e2a2a", systeme: "trigonal (rhomboédrique)", classe: "-3", classeNom: "rhomboédrique", reseau: "R",
      maille: HEX(5.0884, 14.0855), mailleSource: "cod9000906", azimut: 22, elevation: 18,
      facies: [{ nom: "Tablette épaisse", formes: [
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.45 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
        note: "Tablettes noires et épaisses, à l'éclat métallique ; elles se rencontrent le plus souvent sous forme de grains dans les gabbros et les sables noirs." }],
      clivages: [],
    },
    perovskite: {
      nom: "Pérovskite", couleur: "#4a3a30", systeme: "orthorhombique (pseudo-cubique)", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [5.4043, 5.4224, 7.651, 90, 90, 90], mailleSource: "cod9002801", azimut: 30, elevation: 18,
      facies: [{ nom: "Pseudo-cube", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.0 }],
        note: "Faux cubes striés, la maille étant presque cubique (a ≈ b ≈ c/√2) : le prisme {110} et la base dessinent alors un cube. Décrite dans l'Oural en 1839, l'espèce doit son nom au minéralogiste russe Lev Perovski." }],
      clivages: [],
    },

    // ═══════════ cuivre, zinc, chrome, magnésium ═══════════
    cuprite: cub("Cuprite", "#9b1f1f", "m-3m", "hexakisoctaédrique", "P", 4.2685, "cod9007497", [
      OCTA("Octaèdres rouge sombre aux reflets de rubis ; sa variété en fils capillaires porte le nom de chalcotrichite."),
      { nom: "Cube et octaèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.2 }],
        note: "Cubes à sommets tronqués, fréquemment recouverts d'une fine pellicule de malachite verte." }]),
    gahnite: cub("Gahnite", "#24413a", "m-3m", "hexakisoctaédrique", "F", 8.1123, "cod9017028", [
      OCTA("Présents dans les pegmatites et les gneiss, des octaèdres nets virent du vert foncé au bleu-noir."), MACLE_SP("Macle du spinelle, fréquente.")],
      { macleNote: "Macle du spinelle sur {111}." }),
    franklinite: cub("Franklinite", "#1f1d1d", "m-3m", "hexakisoctaédrique", "F", 8.4418, "cod9002487", [
      { nom: "Octaèdre et dodécaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.08 }],
        note: "Dans le marbre de Franklin, des octaèdres noirs à arêtes biseautées côtoient la zincite rouge et la willémite." }]),
    chromite: cub("Chromite", "#2a2a2a", "m-3m", "hexakisoctaédrique", "F", 8.3765, "cod9007325", [
      OCTA("La chromite forme des octaèdres rares et de petite taille ; on la rencontre surtout sous forme de grains et de lits massifs au sein des péridotites.")]),
    periclase: cub("Périclase", "#e8ecd8", "m-3m", "hexakisoctaédrique", "F", 4.2122, "cod9007058", [
      { nom: "Cubo-octaèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.2 }],
        note: "Au contact des marbres (Monte Somma, Predazzo), on observe de petits grains cubiques ou octaédriques, presque toujours enveloppés de brucite." }],
      { clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "cubique", pas: 0.25 }] }),
    brucite: {
      nom: "Brucite", couleur: "#e6ece4", systeme: "trigonal", classe: "-3m", classeNom: "scalénoédrique hexagonale", reseau: "P",
      maille: HEX(3.14979, 4.7702), mailleSource: "cod9006330", azimut: 20, elevation: 22,
      facies: [{ nom: "Tablette", formes: [
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.32 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
        note: "Tablettes à contour hexagonal et à reflets nacrés, qui se débitent en lamelles souples mais non élastiques, contrairement au mica." }],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal", pas: 0.18 }],
    },
    spinelle: cub("Spinelle", "#a8324a", "m-3m", "hexakisoctaédrique", "F", 8.08435, "cod9001364", [
      OCTA("Les octaèdres prennent du rouge, du rose, du bleu ou du noir selon le chrome, le fer ou le cobalt qu'ils renferment. Le « rubis du Prince Noir », joyau de la couronne d'Angleterre, est en fait un spinelle."),
      MACLE_SP("Deux octaèdres accolés selon une face {111}, l'un pivoté de 180° : c'est la macle qui a donné son nom au spinelle.")],
      { macleNote: "Macle du spinelle sur {111}." }),

    // ═══════════ étain, zirconium, uranium, niobium ═══════════
    cassiterite: {
      nom: "Cassitérite", couleur: "#3a2a22", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [4.738, 4.738, 3.1865, 90, 90, 90], mailleSource: "cod9007533", azimut: 22, elevation: 14,
      macleNote: "Macle en genou selon {011}, très fréquente ; les mineurs de Cornouailles l'appelaient le « bec d'étain ».",
      facies: [
        { nom: "Prisme et bipyramide", formes: [
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 1.25 }],
          note: "Très dense (7), ce minéral à l'éclat adamantin forme des prismes courts d'un brun presque noir, surmontés d'une bipyramide." },
        { nom: "Macle en genou", azimut: 26, elevation: 10, macle: { plan: [0, 1, 1], compo: [0, 1, 1] }, formes: [
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "s", hkl: [1, 1, 1], nom: "bipyramide", d: 1.25 }],
          note: "Deux cristaux accolés selon {011} : c'est le « bec d'étain »." }],
      clivages: [{ hkl: [1, 0, 0], qualite: "imparfait", nom: "{100}", pas: 0.3 }],
    },
    baddeleyite: {
      nom: "Baddeleyite", couleur: "#5a4a3a", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [5.1505, 5.2116, 5.3173, 90, 99.23, 90], mailleSource: "cod9016714", azimut: 24, elevation: 16,
      facies: [{ nom: "Tablette", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.4 }],
        note: "Petites tablettes brunes, aplaties selon a, souvent maclées. Dans les gabbros et les carbonatites, elles se présentent en grains de quelques dixièmes de millimètre, datés par la méthode uranium-plomb." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.24 }],
    },
    uraninite: cub("Uraninite", "#1f2422", "m-3m", "hexakisoctaédrique", "F", 5.4682, "cod9009049", [
      { nom: "Cube et octaèdre", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.15 }],
        note: "Les pegmatites renferment des cubes et des octaèdres noirs. Dans les filons, en revanche, l'uraninite prend la forme de masses mamelonnées sans faces, la pechblende." }]),
    thorianite: cub("Thorianite", "#3a3a36", "m-3m", "hexakisoctaédrique", "F", 5.5997, "cod9009046", [
      { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
        note: "Parmi les graviers à gemmes du Sri Lanka, on trouve de petits cubes noirs, souvent maclés par interpénétration (non représentés), dont les arêtes ont été émoussées par le roulage." }]),
    columbite: {
      nom: "Columbite", couleur: "#2a2624", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [14.221, 5.727, 5.102, 90, 90, 90], mailleSource: "cod9001398", azimut: 24, elevation: 16,
      facies: [{ nom: "Tablette", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 0.5 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.3 }],
        note: "Dans les pegmatites, des tablettes noires et épaisses, aplaties selon a, portent fréquemment un macle en leur cœur." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "net", nom: "{010}", pas: 0.24 }],
    },
    pyrochlore: cub("Pyrochlore", "#6a3a22", "m-3m", "hexakisoctaédrique", "F", 10.42, "cod9004020", [
      OCTA("Dans les carbonatites apparaissent de petits octaèdres brun-rouge. Leur nom grec, « vert au feu », évoque la teinte qu'ils prennent au chalumeau.")]),
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
    vernon: "Les diagrammes Eh-pH de la partie Oxydes de l'atlas (activité 10⁻⁶) fournissent les conditions d'oxydation et de précipitation de ces oxydes.",
  };
  const PAS = (txt) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + txt });
  const SOL = "Aucun diagramme n'est proposé : ce sont le climat du sol, la matière organique et l'alternance des périodes humides et sèches qui décident. Voir l'onglet de l'élément dans la partie Oxydes.";
  const sc = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || { cond: false, sansDiagramme: SOL }), src ? { src } : {});
  const ehph = (systeme, chemin, note) => ({ type: "ehph", systeme, chemin, note });
  const clim = (domaines, lab, chemin, note) => ({ type: "climat", domaines, etiquettes: lab ? [lab] : [], villes: ["Brest", "Paris", "Marseille"], chemin, note });

  Object.assign(MIN_F, {

    // ═══════════ fer ═══════════
    ferrihydrite: {
      sansForme: "Forme non représentée : la ferrihydrite se compose de nanocristaux de 2 à 6 nm, sans faces visibles.",
      forme: `La ferrihydrite apparaît en premier dès que le fer dissous rencontre l'oxygène. Ses cristaux, larges de quelques nanomètres seulement, sont si petits qu'une part notable de leurs atomes se trouve en surface (200 à 600 m² par gramme). Le modèle de structure 3D n'est qu'approximatif : une maille ne décrit qu'imparfaitement des cristaux larges de quelques mailles.`,
      intro: `Quelques heures suffisent à la ferrihydrite pour précipiter lorsqu'une eau riche en fer réduit atteint l'air libre.`,
      scenarios: [sc("Au contact de l'oxygène",
        `Une eau de nappe, dépourvue d'oxygène, transporte du fer dissous (Fe²⁺). Au contact de l'air (source, drain, fossé, racine d'une plante dans un sol engorgé), ce fer s'oxyde et précipite aussitôt en un dépôt orange vif : la ferrihydrite. Elle évolue ensuite, en quelques mois à quelques années, vers la goethite ou l'hématite.`,
        ehph("fer", [E(6.5, -0.1, 1, "Dans la nappe, le fer se trouve à l'état dissous sous forme de Fe²⁺, faute d'oxygène."), E(6.8, 0.5, 2, "L'eau, une fois aérée, devient oxydante et le fer précipite immédiatement en ferrihydrite.")],
          "Le trait orange en pointillés du diagramme matérialise la précipitation de la ferrihydrite."), [SRC.cornell])],
    },
    goethite: {
      forme: `Doubles chaînes d'octaèdres Fe(O,OH)₆ allongées selon c : elles expliquent les aiguilles et les prismes striés de la goethite. Son clivage est parfait selon {010}. Ce minéral colore en brun jaune la plupart des sols de France.`,
      intro: `La goethite caractérise les sols tempérés et humides ; elle forme aussi les chapeaux de fer des gisements.`,
      scenarios: [
        sc("Dans un sol tempéré",
          `Dans les sols frais et humides (8 à 15 °C, pluie > 65 % de l'ETP), la ferrihydrite, riche en matière organique, évolue lentement en goethite par dissolution puis recristallisation. La teinte brun ocre des sols bruns et des limons en découle.`,
          clim([[8, 15, 0.65, 2.5]], ["goethite", 11.5, 2.2], [
            { T: 12.0, ai: 0.96, n: 1, t: "À Rennes, avec 12 °C et une pluie voisine de l'ETP, la goethite l'emporte dans les sols." },
            { n: 2, t: "Dans les sols frais, humides et riches en humus, la ferrihydrite se change lentement en goethite." }],
            "Domaine schématique. Dans un climat plus chaud et plus sec, c'est l'hématite qui prend le dessus (voir la fiche de l'hématite)."), ["h5", SRC.cornell]),
        sc("Dans un chapeau de fer",
          `Les eaux de pluie attaquent la pyrite des gisements de sulfures, et le fer se redépose en goethite. Il en résulte une croûte rouillée et caverneuse, le chapeau de fer, que les prospecteurs suivent depuis l'Antiquité.`, null, [SRC.cornell]),
      ],
    },
    lepidocrocite: {
      forme: `La lépidocrocite partage la formule de la goethite, mais ses octaèdres s'organisent en feuillets ondulés retenus par des liaisons hydrogène. D'où son habitus en écailles et son clivage selon {010}. Son orange vif la distingue de la goethite brune.`,
      intro: `La lépidocrocite prend naissance dans les sols où la nappe phréatique monte puis redescend à intervalles réguliers.`,
      scenarios: [sc("Dans un sol engorgé par intermittence",
        `Quand la nappe s'élève, le fer se réduit et se dissout ; quand elle redescend, l'air rentre et le fer s'oxyde rapidement, sans carbonate pour le freiner. La lépidocrocite se dépose alors en taches et en gaines orangées autour des racines et dans les fissures (pseudogleys).`,
        ehph("fer", [E(6, -0.05, 1, "Nappe haute : le fer se réduit et passe en solution."), E(6, 0.55, 2, "Nappe basse : l'air réapparaît et le fer s'oxyde vite pour former de la lépidocrocite."), E(6, -0.05, 3, "Le cycle se répète chaque saison, à chaque remontée de la nappe.")],
          "Le diagramme ne sépare pas les oxydes ferriques entre eux. Ce sont la rapidité de l'oxydation et l'absence de carbonate qui orientent vers la lépidocrocite plutôt que vers la goethite."), [SRC.cornell])],
    },
    hematite: {
      forme: `Structure du corindon : les oxygènes forment un empilement compact, et les fers occupent deux vides octaédriques sur trois. Massive, l'hématite est noire et brillante ; réduite en poudre, elle devient rouge sang, d'où son nom grec <i>haima</i> (le sang). Son trait rouge permet de la distinguer de la magnétite et de l'ilménite.`,
      intro: `Dans les climats chauds à saison sèche, l'hématite colore les sols en rouge ; elle compose aussi les grands gisements de fer.`,
      scenarios: [
        sc("Dans un sol chaud et à saison sèche",
          `Lorsque la moyenne annuelle dépasse environ 15 °C, qu'un sol reste sec plusieurs semaines et que l'humus fait défaut, la ferrihydrite passe à l'hématite sans mûrir en goethite. Les terra rossa et les sols tropicaux en témoignent.`,
          clim([[15, 30, 0.3, 1.2]], ["hématite", 22.5, 1.35], [
            { T: 15.9, ai: 0.42, n: 1, t: "Marseille, avec 15,9 °C et des étés secs : c'est là que l'hématite rougit les sols." },
            { n: 2, t: "Pendant la saison sèche, la ferrihydrite des sols se déshydrate en hématite." }],
            "Domaine schématique. Dans un climat plus frais et plus humide, la goethite prend le dessus."), ["h5", SRC.cornell]),
        sc("Dans les fers rubanés",
          `Entre 2,5 et 1,8 milliard d'années, l'oxygène accumulé dans les océans a provoqué la précipitation du fer dissous en lits alternés de fer et de silice. Ces fers rubanés fournissent aujourd'hui l'essentiel du minerai de fer extrait.`,
          PAS("Voir la notice de la roche à fer rubané, à laquelle il faut se référer."), [SRC.cornell]),
      ],
    },
    maghemite: {
      sansForme: "Aucun cristal propre n'est représenté pour la maghémite : elle apparaît en grains fins ou en pseudomorphoses de magnétite.",
      forme: `La maghémite possède la structure de la magnétite, mais tout son fer est ferrique : pour équilibrer les charges, un site octaédrique sur six reste inoccupé. Elle est aussi magnétique que la magnétite.`,
      intro: `Ce sont surtout les sols brûlés par les feux, ou l'oxydation lente de la magnétite, qui donnent naissance à la maghémite.`,
      scenarios: [
        sc("Dans un sol brûlé",
          `Au-dessus de 300 °C, en présence de matière organique, le feu transforme la goethite en maghémite. Les horizons de surface magnétiques des sols tropicaux et certains sites archéologiques (foyers) doivent à ce processus leur signature.`, PAS("En surface, la chaleur d'un incendie suffit à la produire."), [SRC.cornell]),
        sc("En oxydant la magnétite",
          `Lorsqu'elle s'oxyde lentement à basse température, la magnétite garde sa forme : le fer ferreux s'éloigne et laisse des lacunes, puis elle devient maghémite.`, PAS("transformation à l'état solide, à basse température."), [SRC.cornell]),
      ],
    },
    magnetite: {
      forme: `La magnétite est le modèle des spinelles : oxygènes en empilement cubique compact, Fe³⁺ en tétraèdres, Fe²⁺ et Fe³⁺ en octaèdres. Le transfert d'électrons entre Fe²⁺ et Fe³⁺ voisins la rend noire, conductrice et fortement magnétique : c'est la pierre d'aimant.`,
      intro: `Les magmas et les roches métamorphiques voient cristalliser la magnétite, qui ne se développe presque jamais dans un sol.`,
      scenarios: [
        sc("Dans un magma basique",
          `Dans les gabbros et les basaltes, la magnétite se présente en grains vers 1 000 °C. Au sein de certaines grandes chambres magmatiques, elle se rassemble en épaisses couches (Bushveld) ou en vastes gisements (Kiruna, Suède).`,
          { type: "magma", echelle: "croute", chemin: [
            pt(1200, 0.3, 1, "Un magma basaltique se met en place dans la croûte."),
            pt(1050, 0.3, 2, "Entre 1 000 et 1 100 °C, la magnétite cristallise en même temps que le pyroxène et le plagioclase.", { bande: "cristallisation" }),
            pt(950, 0.3, 3, "Le gabbro achève sa cristallisation ; la magnétite y subsiste sous forme de grains noirs.")], note: "Chemin schématique." }, ["hirschmann"]),
        sc("Fabriquée par des bactéries",
          `Certaines bactéries vivant dans des eaux pauvres en oxygène construisent des chaînes de magnétite longues de 50 nm, qui leur servent de boussole. D'autres produisent cet oxyde en réduisant le fer.`, PAS("Ce sont les bactéries qui en décident."), [SRC.cornell]),
      ],
    },
    fougerite: {
      sansForme: "La fougérite se présente en plaquettes nanométriques qui s'oxydent en quelques minutes au contact de l'air.",
      forme: `La fougérite, surnommée « rouille verte », présente des feuillets d'hydroxyde où le fer ferreux et le fer ferrique se mêlent au magnésium dans les octaèdres ; de l'eau et des anions occupent l'espace entre les feuillets. Sa teinte bleu-vert tient au mélange de Fe²⁺ et de Fe³⁺ ; à l'air, elle devient orange en quelques minutes.`,
      intro: `Dans les horizons engorgés en permanence (gleys), la fougérite donne une teinte bleu-vert ; elle a été décrite à Fougères (Ille-et-Vilaine).`,
      scenarios: [sc("Dans un sol engorgé",
        `Lorsque la nappe s'installe, le fer reste majoritairement ferreux. Une fraction s'oxyde au contact des racines et des bactéries, pour former une rouille mixte située à la frontière entre fer dissous et oxydes. Ce minéral a été décrit en 2007 dans les sols de la forêt de Fougères.`,
        ehph("fer", [E(7.2, 0.05, 1, "Sous la nappe, le fer se trouve surtout dissous sous forme de Fe²⁺."), E(7.6, -0.05, 2, "Près de la frontière avec les oxydes ferriques, le fer s'oxyde en partie : Fe²⁺ et Fe³⁺ s'associent alors pour donner la fougérite.")],
          "Le diagramme, qui ne trace la limite que pour le fer, indique que la fougérite apparaît au voisinage de la frontière entre Fe²⁺ et oxydes ferriques.")) ],
    },
    akaganeite: {
      sansForme: "Les aiguilles microscopiques d'akaganéite ne sont pas représentées.",
      forme: `Les tunnels carrés de l'akaganéite sont bordés de chaînes d'octaèdres de fer ; des ions chlorure y logent et soutiennent la charpente. Sans chlore, elle ne peut pas se former.`,
      intro: `La formation de l'akaganéite exige la présence de chlorure : rouille marine, sols salés, météorites.`,
      scenarios: [sc("Dans la rouille marine et dans les météorites",
        `Le fer qui s'oxyde en eau salée produit de l'akaganéite : elle ronge les objets archéologiques en fer tirés de la mer, ainsi que les météorites ferreuses ramassées au sol. Elle a été décrite en 1962 dans la mine d'Akagane (Japon).`, PAS("c'est la présence de chlorure qui détermine sa formation."))],
    },
    wustite: {
      sansForme: "La wüstite naturelle n'existe que sous forme de grains microscopiques.",
      forme: `La wüstite (FeO) adopte la structure du sel et manque toujours d'un peu de fer. Elle ne tient qu'à l'abri de l'oxygène ou au-delà de 570 °C.`,
      intro: `Seuls les milieux les plus réducteurs produisent de la wüstite.`,
      scenarios: [sc("Dans les milieux sans oxygène",
        `On la trouve en inclusion dans les diamants (issue du manteau profond), dans les météorites, dans les laitiers de haut-fourneau et sous forme de pellicule bleutée sur les aciers chauffés.`, PAS("aucun diagramme de l'atlas ne représente ces conditions extrêmes."))],
    },
    limonite: {
      sansForme: "La limonite n'a pas de forme propre : ce n'est pas un minéral, mais un assemblage d'oxydes de fer mal cristallisés.",
      forme: `Le terme « limonite » relève du vocabulaire de terrain : il désigne un mélange de goethite, de ferrihydrite et d'autres oxydes de fer peu cristallisés, associés à de l'eau. Il ne possède donc aucune structure propre ; analysé, il se révèle surtout composé de goethite.`,
      intro: `Dans tous les milieux oxydés, on parle de limonite pour désigner les croûtes et concrétions d'oxydes de fer.`,
      scenarios: [sc("Croûtes, concrétions et chapeaux ferrugineux",
        `Là où le fer dissous s'oxyde se forment les chapeaux de fer, les minerais des marais (dits fer des prairies) et les croûtes des sols. Ces minerais des marais ont approvisionné les forges européennes jusqu'au XIX<sup>e</sup> siècle.`,
        ehph("fer", [E(6, -0.1, 1, "Une eau privée d'oxygène transporte du fer dissous (Fe²⁺)."), E(6.5, 0.6, 2, "Au contact de l'air, le fer s'oxyde et précipite sous forme d'oxydes mal cristallisés : la limonite.")]), [SRC.cornell])],
    },

    // ═══════════ manganèse ═══════════
    vernadite: {
      sansForme: "Aucune forme propre : la vernadite se compose de feuillets nanométriques empilés au hasard, sans maille définie.",
      forme: `Une vernadite désordonnée ressemble à une birnessite : des feuillets d'octaèdres MnO₆ de quelques nanomètres, empilés sans régularité. L'atlas n'attribue à cette espèce aucune structure 3D ; le feuillet est décrit dans la fiche de la birnessite.`,
      intro: `C'est la vernadite qui apparaît en premier parmi les oxydes de manganèse produits par les bactéries.`,
      scenarios: [sc("Lorsque le manganèse dissous rencontre l'oxygène",
        `Bactéries et champignons oxydent le manganèse dissous et le déposent en enduits noirs, sur les galets des torrents, en taches dans les sols ou en vernis du désert. Ce dépôt évolue ensuite vers la birnessite ou la todorokite.`,
        ehph("manganese", [E(6.5, 0.1, 1, "En l'absence d'oxygène, le manganèse se trouve dissous sous forme de Mn²⁺."), E(9, 0.55, 2, "Au contact de l'air, les bactéries l'oxydent : il précipite sous forme d'oxyde de Mn⁴⁺ nanométrique, la vernadite.")]), [SRC.post])],
    },
    birnessite: {
      sansForme: "Forme non représentée : la birnessite se présente en plaquettes microscopiques.",
      forme: `Feuillets d'octaèdres MnO₆ dont certains sites sont vacants, séparés de 7 Å par une couche d'eau et de cations (sodium, potassium, calcium). Ces cations s'échangent sans peine, si bien que la birnessite fixe les métaux des sols.`,
      intro: `Dans les sols, la birnessite est l'oxyde de manganèse le plus répandu.`,
      scenarios: [sc("Dans un sol",
        `Dans un sol engorgé, le manganèse libéré par l'altération se dissout ; en séchant, il s'oxyde et forme taches, nodules noirs et dendrites sur les fissures des roches, souvent prises pour des fossiles de végétaux.`,
        ehph("manganese", [E(6.8, 0.15, 1, "Sol engorgé : le manganèse est mis en solution."), E(9, 0.55, 2, "Le sol se dessèche et l'air revient : le manganèse précipite sous forme de birnessite.")]), [SRC.post])],
    },
    lithiophorite: {
      sansForme: "Forme non représentée : la lithiophorite se présente en masses et en nodules microcristallins.",
      forme: `Feuillets alternés d'octaèdres de manganèse et d'octaèdres d'aluminium et de lithium, reliés par des liaisons hydrogène : l'ensemble forme un « sandwich » entre oxyde de manganèse et gibbsite.`,
      intro: `Dans les sols acides et très altérés, la lithiophorite se substitue à la birnessite.`,
      scenarios: [sc("Dans un sol tropical acide",
        `Dans les sols ferrallitiques et les altérites granitiques, acides et très riches en aluminium, le manganèse se dépose plutôt sous forme de lithiophorite que de birnessite.`, null, [SRC.post])],
    },
    todorokite: {
      sansForme: "Forme non représentée : la todorokite se présente en fibres et en lamelles microscopiques.",
      forme: `Charpente d'octaèdres MnO₆ délimitant des tunnels de 3 × 3 octaèdres, assez grands pour loger eau et cations (magnésium, nickel, cuivre) : ces ions déterminent la valeur économique des nodules polymétalliques.`,
      intro: `La todorokite est l'oxyde de manganèse des nodules des fonds océaniques.`,
      scenarios: [sc("Au fond de l'océan",
        `Dans les abysses, les nodules polymétalliques naissent : le manganèse de l'eau de mer et de la vase se fixe autour d'un débris, à raison de quelques millimètres par million d'années. Nickel, cuivre et cobalt s'y accumulent.`, PAS("concrétion au fond de la mer, qui se développe pendant des millions d'années."), [SRC.post])],
    },
    cryptomelane: {
      sansForme: "Forme non représentée : le cryptomélane se présente en masses compactes et fibreuses, sans cristaux visibles.",
      forme: `Le cryptomélane possède des tunnels de 2 × 2 octaèdres MnO₆ où loge le potassium (structure de la hollandite). Ce potassium autorise une datation par la méthode potassium-argon, donc celle de l'altération qui l'a formé.`,
      intro: `Dans les chapeaux d'oxydation des gisements de manganèse se développe le cryptomélane.`,
      scenarios: [sc("Dans un chapeau d'oxydation",
        `Les eaux superficielles prélèvent le manganèse des roches et le redéposent, sous forme de masses compactes, au-dessus des gisements. Dans les profils latéritiques, ces dépôts donnent des âges qui couvrent des dizaines de millions d'années.`, null, [SRC.post])],
    },
    romanechite: {
      sansForme: "Forme non représentée : la romanéchite se présente en concrétions mamelonnées, sans cristaux.",
      forme: `La romanéchite possède des tunnels de 2 × 3 octaèdres MnO₆ occupés par le baryum et l'eau. Elle constitue l'essentiel du « psilomélane » décrit par les anciens auteurs.`,
      intro: `Dans les zones d'oxydation riches en baryum, la romanéchite précipite ; sa description initiale date de Romanèche (Saône-et-Loire).`,
      scenarios: [sc("Dans un filon oxydé",
        `Entre le XVIII<sup>e</sup> et le XX<sup>e</sup> siècle, les filons de barytine et de manganèse de Romanèche-Thorins furent exploités ; le manganèse y forme des concrétions noires mamelonnées.`, PAS("Cette espèce naît de l'oxydation proche de la surface, lorsque du baryum est présent."), [SRC.post])],
    },
    pyrolusite: {
      sansForme: "Forme non représentée : la pyrolusite se présente surtout en masses, en pseudomorphoses de manganite et en dendrites ; ses rares cristaux (« polianite ») sont mal décrits.",
      forme: `Structure du rutile pour la pyrolusite (β-MnO₂) : des chaînes d'octaèdres MnO₆ partageant leurs arêtes, avec des tunnels trop étroits pour un cation. Elle représente la forme la plus stable de l'oxyde de manganèse, vers laquelle évoluent les autres.`,
      intro: `La pyrolusite marque le terme de l'oxydation du manganèse.`,
      scenarios: [sc("En fin de maturation",
        `Dans un milieu fortement oxydant et sec, les autres oxydes de manganèse recristallisent lentement en pyrolusite, souvent à la place de la manganite, avec sa forme. Les verriers l'utilisaient pour décolorer le verre (« savon des verriers »).`,
        ehph("manganese", [E(7, 0.2, 1, "Le manganèse dissous (Mn²⁺)…"), E(9.5, 0.6, 2, "… s'oxyde entièrement dans un milieu très oxydant : on obtient Mn⁴⁺ et pyrolusite.")]), [SRC.post])],
    },
    manganite: {
      sansForme: "Aucun dessin de forme : ses prismes striés se décrivent dans une maille pseudo-orthorhombique différente de la structure 3D ; la conversion des indices reste à vérifier.",
      forme: `Le manganèse trivalent de la manganite forme des octaèdres très déformés (effet Jahn-Teller) : deux liaisons sont nettement plus longues que les quatre autres. Elle se transforme facilement en pyrolusite en gardant sa forme.`,
      intro: `Là où le manganèse ne s'oxyde qu'à moitié, il se forme de la manganite.`,
      scenarios: [sc("Oxydation incomplète",
        `Dans les filons à basse température et les concrétions palustres, le manganèse, en milieu modérément oxydant, se stabilise au degré 3 : prismes noirs et striés d'Ilfeld (Harz).`,
        ehph("manganese", [E(7, 0.2, 1, "Le manganèse est dissous (Mn²⁺)."), E(10, 0.2, 2, "Quand le milieu est modérément oxydant et basique, le manganèse précipite au degré 3 : il s'agit alors de manganite.")],
          "Domaine occupé par le Mn³⁺ (MnOOH) sur le diagramme du manganèse."), [SRC.post])],
    },
    hausmannite: {
      forme: `Spinelle du manganèse (Mn²⁺Mn³⁺₂O₄), l'hausmannite étire toute sa maille selon c, car ses octaèdres de Mn³⁺ sont allongés par l'effet Jahn-Teller. L'octaèdre du spinelle y devient une bipyramide quadratique.`,
      intro: `L'hausmannite n'apparaît que dans les gisements de manganèse chauffés.`,
      scenarios: [sc("Dans un gisement métamorphisé",
        `Un sédiment riche en manganèse, soumis au métamorphisme ou traversé de fluides chauds, donne hausmannite et braunite : c'est le cas des gisements du Kalahari (Afrique du Sud) et de Långban (Suède).`,
        { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
          pt(15, 0, 1, "Au fond de la mer se déposent des boues riches en manganèse."),
          pt(450, 0.4, 2, "Enfouies, puis portées à haute température, ces boues recristallisent en hausmannite et braunite.", { bande: "recristallisation" }),
          pt(15, 0, 3, "L'érosion les ramène en surface.")], note: "Chemin schématique." }, ["pattison"])],
    },
    braunite: {
      forme: `Braunite : des octaèdres de Mn³⁺, des polyèdres de Mn²⁺ et un tétraèdre de silice pour huit atomes de manganèse. Il s'agit en somme d'une bixbyite où le silicium a trouvé sa place ; ses bipyramides imitent des octaèdres.`,
      intro: `Dans les gisements métamorphiques, la braunite constitue le principal minerai de manganèse.`,
      scenarios: [sc("Dans un gisement métamorphisé",
        `Dans les sédiments manganésifères métamorphisés d'Inde, d'Afrique du Sud ou du Brésil, la braunite constitue le minerai dominant. En Europe, elle est signalée à Saint-Marcel (Val d'Aoste).`,
        { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
          pt(15, 0, 1, "Au fond de la mer se déposent des boues riches en manganèse et en silice."),
          pt(500, 0.5, 2, "Enfouies puis chauffées, elles recristallisent : la braunite fixe conjointement le manganèse et la silice.", { bande: "recristallisation" }),
          pt(15, 0, 3, "L'érosion les ramène en surface.")], note: "Chemin schématique." }, ["pattison"])],
    },
    bixbyite: {
      forme: `La bixbyite reprend la structure de la fluorine privée d'un oxygène sur quatre : chaque métal occupe le centre d'un octaèdre d'oxygènes, au sommet d'un cube qui a perdu deux coins. Le fer et le manganèse y partagent les sites.`,
      intro: `La bixbyite cristallise à partir de gaz dans les cavités des laves acides.`,
      scenarios: [sc("Dans les cavités d'une rhyolite",
        `Lors du refroidissement des coulées de rhyolite de Thomas Range (Utah), des gaz chauds se sont échappés et ont déposé, dans les bulles de lave, de petits cubes noirs de bixbyite accompagnés de topaze.`, PAS("dépôt issu des gaz d'une lave en cours de refroidissement."))],
    },
    manganosite: {
      forme: `La manganosite (MnO) adopte la structure du sel. Stable seulement en l'absence d'oxygène, elle noircit à l'air dès que sa surface s'oxyde.`,
      intro: `La manganosite n'apparaît que dans les gisements de manganèse très réducteurs.`,
      scenarios: [sc("Dans un gisement métamorphique réducteur",
        `À Långban (Suède) et à Franklin (New Jersey), dans des marbres métamorphiques, le manque presque total d'oxygène l'a fait naître.`,
        PAS("aucun diagramme de l'atlas ne représente ces conditions très réductrices, atteintes à haute température."))],
    },

    // ═══════════ aluminium ═══════════
    gibbsite: {
      sansForme: "Forme non représentée : la gibbsite se présente surtout en masses et en plaquettes pseudo-hexagonales microscopiques.",
      forme: `Gibbsite : feuillets d'octaèdres Al(OH)₆, deux sites sur trois occupés, liés entre eux par liaisons hydrogène. Il s'agit de la couche octaédrique des argiles, mais sans silice ; d'où son clivage basal parfait.`,
      intro: `La gibbsite est le minéral des bauxites : c'est ce qui subsiste d'une roche lorsque les pluies tropicales en ont emporté toute la silice.`,
      scenarios: [
        sc("Dans un sol tropical fortement lessivé",
          `Dans un climat tropical (≥ 22 °C) où la pluie excède l'évaporation presque chaque mois, sur un sol bien drainé, l'eau évacue la silice et les cations. L'aluminium, insoluble, reste en gibbsite : c'est le cas des sols ferrallitiques et des bauxites latéritiques (Guinée, Australie).`,
          clim([[22, 30, 1, 2.5]], ["bauxites", 26, 2.2], [
            { T: 26, ai: 1.8, n: 1, t: "Climat équatorial, avec ≈ 26 °C et une pluie nettement supérieure à l'ETP." },
            { n: 2, t: "L'eau entraîne la silice ; l'aluminium demeure sur place sous forme de gibbsite, pendant des millions d'années." }],
            "Domaine schématique."), ["h5", SRC.bardossy]),
        sc("Selon l'acidité de l'eau",
          `L'aluminium ne se dissout qu'en eau très acide ou très basique : entre pH ≈ 4,5 et 8,5, il précipite sous forme de gibbsite.`,
          ehph("aluminium", [E(3.5, 0.6, 1, "En eau très acide, l'aluminium se trouve dissous sous forme d'Al³⁺."), E(6.5, 0.6, 2, "L'eau se neutralise et l'aluminium précipite sous forme de gibbsite.")]), [SRC.vernon]),
      ],
    },
    bayerite: {
      sansForme: "Forme non représentée : la bayérite naturelle se présente en grains microscopiques.",
      forme: `Le feuillet de la gibbsite se retrouve, empilé autrement : les OH d'un feuillet se glissent dans les creux du suivant.`,
      intro: `La bayérite est rare dans la nature ; elle se forme lorsque l'hydroxyde d'aluminium précipite rapidement.`,
      scenarios: [sc("En précipitation rapide",
        `On la signale dans quelques basaltes altérés et dans les usines d'alumine ; dans la nature, la gibbsite reste la forme la plus fréquente.`,
        PAS("c'est la vitesse de précipitation qui détermine sa formation."))],
    },
    nordstrandite: {
      sansForme: "Forme non représentée : la nordstrandite se présente en grains et en agrégats microscopiques.",
      forme: `Troisième mode d'empilement du feuillet de la gibbsite, qui combine ceux de la gibbsite et de la bayérite.`,
      intro: `La nordstrandite se forme dans les milieux alcalins.`,
      scenarios: [sc("Dans un karst alcalin",
        `Dans les poches karstiques et sur les sols calcaires, une eau basique fait cristalliser l'hydroxyde d'aluminium en nordstrandite.`,
        PAS("c'est la basicité de l'eau qui détermine son apparition."))],
    },
    boehmite: {
      sansForme: "La boehmite des bauxites ne forme que des cristaux microscopiques, sans forme dessinée.",
      forme: `Ayant perdu la moitié de l'eau de la gibbsite, la boehmite (AlOOH) se présente en doubles couches d'octaèdres ondulées, reliées par liaisons hydrogène.`,
      intro: `La boehmite prédomine dans les bauxites des climats chauds à saison sèche ainsi que dans les bauxites enfouies.`,
      scenarios: [sc("Dans une bauxite karstique",
        `Ce sont des altérations tropicales du Crétacé, piégées dans le karst puis enfouies et un peu chauffées, qui forment les bauxites des Baux-de-Provence (ayant donné leur nom au minerai) et du Var : elles contiennent surtout de la boehmite.`,
        clim([[22, 30, 0.5, 1.5]], ["bauxites à boehmite", 26, 1.65], [
          { T: 26, ai: 0.9, n: 1, t: "Climat tropical à saison sèche marquée." },
          { n: 2, t: "La saison sèche, puis l'enfouissement, déshydratent la gibbsite en boehmite, tandis que l'aluminium demeure sur place." }],
          "Domaine schématique."), ["h5", SRC.bardossy])],
    },
    diaspore: {
      forme: `Formule de la boehmite (AlOOH), mais structure plus dense, celle de la goethite : doubles chaînes d'octaèdres allongées selon c. Plus dure (6,5 à 7) et plus lourde que la boehmite, elle s'impose sous haute pression.`,
      intro: `Le diaspore se forme dans les bauxites enfouies et métamorphisées.`,
      scenarios: [sc("Dans une bauxite métamorphisée",
        `Enfouies et chauffées au-delà de 200 à 300 °C environ, les bauxites à gibbsite et boehmite se muent en bauxites à diaspore ; chauffées davantage, elles livrent de l'émeri (corindon). Les bauxites de Grèce et de l'Oural relèvent de ce type.`,
        { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
          pt(25, 0, 1, "Une bauxite prend naissance en surface, sous climat tropical."),
          pt(280, 0.3, 2, "Enfouie à quelques kilomètres et chauffée vers 250 à 300 °C, sa boehmite se transforme en diaspore.", { bande: "diaspore" }),
          pt(15, 0, 3, "Remise au jour par l'érosion, elle conserve son diaspore.")], note: "Chemin schématique." }, ["pattison", SRC.bardossy])],
    },
    corindon: {
      forme: `Dans le corindon, l'empilement compact des oxygènes laisse à l'aluminium deux vides octaédriques sur trois. Liaisons courtes et solides, d'où une dureté de 9. Pur, il est incolore ; le chrome le teinte en rouge (rubis), le fer et le titane en bleu (saphir).`,
      intro: `À haute température, le corindon se forme dans les roches riches en aluminium et pauvres en silice.`,
      scenarios: [
        sc("Dans un marbre ou un gneiss porté à haute température",
          `Lorsqu'une roche riche en aluminium et pauvre en silice subit une forte chaleur (marbres à impuretés argileuses, gneiss désilicifiés au contact de péridotites), l'aluminium cristallise en corindon : on y trouve les rubis des marbres de Birmanie et du Vietnam.`,
          { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Au fond de la mer se dépose un calcaire impur, riche en argile."),
            pt(700, 0.7, 2, "Pris dans une collision et porté de 600 à 750 °C, un calcaire argileux recristallise en marbre, tandis que l'aluminium, privé de silice, forme du corindon (rubis).", { bande: "corindon" }),
            pt(15, 0, 3, "Quand l'érosion dégage le marbre, les rubis libérés s'accumulent dans les graviers.")], note: "Chemin schématique." }, ["pattison", SRC.simonet]),
        sc("Dans un basalte",
          `Depuis la croûte profonde, certains basaltes ont remonté des saphirs cristallisés plus bas : ceux du Massif central (Le Puy, Expailly) et de Thaïlande.`, PAS("le basalte arrache les saphirs à la profondeur sans les avoir formés."), [SRC.simonet]),
      ],
    },

    // ═══════════ titane ═══════════
    rutile: {
      forme: `Le rutile (TiO₂) se compose de chaînes d'octaèdres TiO₆ partageant leurs arêtes le long de c, d'où ses prismes et ses aiguilles. Très réfractaire et presque insoluble, il échappe à l'altération.`,
      intro: `Formé dans les roches métamorphiques et magmatiques, le rutile finit par se concentrer dans les sables.`,
      scenarios: [
        sc("Dans une roche métamorphique",
          `Sous l'action de la chaleur, les minéraux titanés des argiles (et la titanite) relâchent leur titane, qui recristallise en rutile dans les schistes, gneiss et éclogites. Dans le quartz des filons alpins, il dessine des aiguilles dorées.`,
          { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Au fond de la mer se dépose une argile renfermant un peu de titane."),
            pt(600, 0.8, 2, "Enfouie puis chauffée, cette argile devient schiste, puis gneiss ; le titane s'y recristallise en rutile.", { bande: "rutile" }),
            pt(15, 0, 3, "Remis au jour par l'érosion, le rutile traverse l'altération sans dommage.")], note: "Chemin schématique." }, ["pattison"]),
        sc("Dans un sable de plage",
          `Presque inaltérable et dense (4,2), il s'accumule dans les sables noirs (Australie, Sierra Leone), en compagnie du zircon et de l'ilménite.`,
          PAS("Les vagues le trient comme les autres minéraux lourds.")),
      ],
    },
    anatase: {
      forme: `L'anatase résulte d'un autre mode d'assemblage des octaèdres TiO₆ (quatre arêtes partagées au lieu de deux) : maille quadratique très allongée, d'où ses bipyramides aiguës. Stable à basse température, elle se transforme en rutile au-delà de ≈ 600 °C.`,
      intro: `Dans les sols comme dans les fentes alpines, l'anatase se développe à basse température.`,
      scenarios: [
        sc("Dans un sol",
          `Lorsqu'un minéral titané s'altère (biotite, ilménite, titanite), le titane, insoluble, se redépose sur place sous forme de microcristaux d'anatase, présents dans presque tous les sols.`, null),
        sc("Dans une fente alpine",
          `Au sein des fissures ouvertes des Alpes, de l'eau chaude (200 à 400 °C) laisse des bipyramides bleues d'anatase, accompagnées de quartz et d'albite (Oisans, Binn).`, PAS("Dépôt d'eau chaude au sein d'une fissure : le titane n'apparaît pas sur le diagramme de la silice.")),
      ],
    },
    brookite: {
      forme: `La brookite représente un troisième mode d'assemblage des octaèdres TiO₆ (trois arêtes partagées) : maille orthorhombique et tablettes minces. Comme l'anatase, elle se transforme en rutile sous l'effet de la chaleur.`,
      intro: `La brookite cristallise à basse température dans les fentes alpines.`,
      scenarios: [sc("Dans une fente alpine",
        `Dans les fissures du massif de l'Oisans (Bourg-d'Oisans) et des Alpes suisses, on observe des tablettes brun-rouge, souvent accompagnées d'anatase et de quartz.`, PAS("dépôt issu d'eau chaude circulant dans une fissure."))],
    },
    ilmenite: {
      forme: `Dans l'ilménite (FeTiO₃), fer et titane occupent des plans alternés au sein d'une structure du corindon ; le centre de symétrie de la maille disparaît en partie (classe 3̄). Faiblement magnétique, elle laisse un trait noir.`,
      intro: `Cristallisant dans les roches basiques, l'ilménite s'accumule ensuite dans les sables noirs.`,
      scenarios: [
        sc("Dans un gabbro",
          `Dans les magmas basaltiques, le titane cristallise en grains d'ilménite, accompagnés de magnétite ; dans de grandes intrusions d'anorthosite (Tellnes en Norvège, Lac Tio au Québec), elle forme des gisements exploités pour le titane.`,
          { type: "magma", echelle: "croute", chemin: [
            pt(1200, 0.3, 1, "Un magma basique se met en place dans la croûte."),
            pt(1050, 0.3, 2, "Entre 1 000 et 1 100 °C, l'ilménite cristallise en même temps que la magnétite.", { bande: "cristallisation" }),
            pt(950, 0.3, 3, "La roche achève de cristalliser.")], note: "Chemin schématique." }, ["hirschmann"]),
        sc("Dans un sable de plage",
          `Lourde et résistante, elle constitue l'essentiel des sables noirs des plages (Kerala, Australie, Madagascar), à partir desquels on extrait la majeure partie du titane.`, PAS("Les vagues le trient comme les autres minéraux lourds.")),
      ],
    },
    leucoxene: {
      sansForme: "Le leucoxène n'a pas de forme : c'est un mélange fin d'anatase, de rutile et d'oxydes de fer.",
      forme: `« Leucoxène » ne désigne pas une espèce mais un produit d'altération : l'ilménite ou la titanite perdent leur fer et deviennent un agrégat blanchâtre d'anatase et de rutile fins, dépourvu de structure propre.`,
      intro: `Dans les sols et les sables altérés, le leucoxène représente l'état final du titane.`,
      scenarios: [sc("En altérant l'ilménite",
        `Lentement dissous en son fer, l'ilménite garde sa forme, blanchit et s'enrichit en titane : les anciens sables lourds en contiennent davantage que les récents.`, null)],
    },
    perovskite: {
      forme: `La pérovskite (CaTiO₃) résulte d'octaèdres TiO₆ reliés par leurs sommets dans les trois directions, le calcium logé dans les grandes cavités. Légèrement basculés, les octaèdres donnent une maille presque cubique et orthorhombique. Ce motif, l'un des plus répandus, caractérise la bridgmanite du manteau inférieur, minéral le plus abondant de la Terre.`,
      intro: `Les magmas très pauvres en silice donnent naissance à la pérovskite.`,
      scenarios: [sc("Dans un magma sous-saturé",
        `Dans les kimberlites, carbonatites et mélilitites, la silice manque pour que calcium et titane forment de la titanite : ils cristallisent alors en pérovskite, décrite dans l'Oural en 1839.`,
        { type: "magma", echelle: "manteau", chemin: [
          pt(1350, 3.0, 1, "En profondeur, le manteau ne fond que très peu : le liquide produit est pauvre en silice et riche en calcium et en titane."),
          pt(1100, 0.5, 2, "Le magma s'élève puis cristallise ; faute de silice, le titane se fixe dans la pérovskite.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"])],
    },
    geikielite: {
      sansForme: "Forme non dessinée : la geikiélite se présente en grains et en galets ; ses cristaux sont rares.",
      forme: `Dans la geikiélite (MgTiO₃), le magnésium remplace le fer au sein de la structure de l'ilménite.`,
      intro: `Des marbres dolomitiques et des kimberlites abritent la geikiélite.`,
      scenarios: [sc("Dans un marbre dolomitique ou une kimberlite",
        `Métamorphisme des dolomies riches en titane, grains dans les kimberlites ; décrite en 1892 dans les graviers à gemmes du Sri Lanka.`, PAS("minéral accessoire, ensuite concentré dans les graviers."))],
    },

    // ═══════════ cuivre ═══════════
    cuprite: {
      forme: `Chaque cuivre de la cuprite (Cu₂O) est lié à deux oxygènes alignés, et chaque oxygène à quatre cuivres : deux réseaux identiques se pénètrent sans contact. Le rouge profond vient du cuivre monovalent.`,
      intro: `La cuprite se forme par oxydation modérée des gisements de cuivre.`,
      scenarios: [sc("Dans la zone oxydée d'un gisement cuprifère",
        `Juste sous la zone la plus oxydée (malachite, azurite), où l'eau n'oxyde guère, le cuivre ne se transforme qu'à moitié : la cuprite enrobe souvent le cuivre natif. Des octaèdres de belle taille proviennent de Chessy (Rhône).`,
        ehph("cuivre", [E(8, -0.2, 1, "En milieu réducteur, le cuivre demeure métallique : c'est le cuivre natif."), E(8, 0.1, 2, "En milieu légèrement oxydant, il ne s'oxyde qu'à moitié : c'est la cuprite."), E(8, 0.45, 3, "Dans un milieu plus oxydant encore, il devient ténorite (ou malachite en présence de dioxyde de carbone).")]), [SRC.vernon])],
    },
    tenorite: {
      sansForme: "Forme non représentée : la ténorite se présente en écailles et en masses noires terreuses.",
      forme: `Dans la ténorite (CuO), chaque cuivre a quatre oxygènes en carré presque plan, disposition habituelle du cuivre divalent. Noire et terne, elle se distingue ainsi.`,
      intro: `La ténorite se forme par oxydation complète du cuivre.`,
      scenarios: [
        sc("Dans un chapeau oxydé",
          `En milieu très oxydant et pauvre en dioxyde de carbone, le cuivre s'oxyde en ténorite noire, appelée « mélaconite » par les mineurs.`,
          ehph("cuivre", [E(8, 0.1, 1, "En milieu peu oxydant, le cuivre se présente sous forme de cuprite."), E(9, 0.6, 2, "En milieu très oxydant, il se transforme en ténorite.")]), [SRC.vernon]),
        sc("Autour d'une fumerolle",
          `Autour des fumerolles du Vésuve, elle forme aussi des écailles brillantes, décrites en 1841.`,
          PAS("dépôt formé à la sortie des gaz volcaniques.")),
      ],
    },

    // ═══════════ zinc, chrome, magnésium ═══════════
    zincite: {
      sansForme: "Forme non représentée : la zincite naturelle se présente en grains et en masses ; ses cristaux sont rares (les grands cristaux rouges vendus proviennent de fumées d'usines de zinc).",
      forme: `La zincite (ZnO) cristallise comme la würtzite : chaque zinc occupe un tétraèdre d'oxygènes, et tous ces tétraèdres pointent dans le même sens selon c. Le cristal est polaire, ses extrémités diffèrent. Le manganèse le colore en rouge.`,
      intro: `Presque toute la zincite naturelle provient de Franklin et de Sterling Hill (New Jersey).`,
      scenarios: [sc("Dans le marbre de Franklin",
        `Métamorphisé il y a ≈ 1,1 milliard d'années, un sédiment chargé de zinc, de fer et de manganèse a donné, à Franklin, un assemblage sans équivalent : la calcite renferme zincite rouge, franklinite noire et willémite verte.`, PAS("métamorphisme d'un gisement de composition exceptionnelle."))],
    },
    gahnite: {
      forme: `La gahnite (ZnAl₂O₄), spinelle à zinc en tétraèdres et aluminium en octaèdres, est très dure (7,5 à 8) et résiste à l'altération.`,
      intro: `Les pegmatites et les gisements de zinc métamorphisés abritent la gahnite.`,
      scenarios: [sc("Dans une pegmatite ou dans un gneiss",
        `Lorsque le zinc rencontre l'aluminium dans les pegmatites granitiques ou dans les gisements métamorphisés de Broken Hill, il donne une gahnite verte.`, PAS("Cette espèce de haute température se trouve dans une roche de composition particulière."))],
    },
    franklinite: {
      forme: `Spinelle : zinc en tétraèdres, fer ferrique (et manganèse) en octaèdres. Noire et faiblement magnétique, la franklinite se reconnaît à ces traits.`,
      intro: `La franklinite n'est presque connue qu'à Franklin (New Jersey).`,
      scenarios: [sc("Dans le marbre de Franklin",
        `Présente avec la zincite et la willémite dans les marbres métamorphisés de Franklin et de Sterling Hill, elle est à l'origine du nom de cette ville, laquelle honore Benjamin Franklin.`, PAS("métamorphisme d'un gisement de composition exceptionnelle."))],
    },
    chromite: {
      forme: `La chromite est un spinelle : fer ferreux en tétraèdres, chrome en octaèdres. Le chrome trivalent, très stable dans les octaèdres, la rend inaltérable : les cours d'eau la charrient sans l'user.`,
      intro: `Le manteau et les magmas ultrabasiques sont le siège de la cristallisation de la chromite.`,
      scenarios: [
        sc("Au sein du manteau, sous une dorsale",
          `Sous les dorsales et les arcs, des liquides percolant dans le manteau laissent la chromite en poches et en lentilles (chromitites dites « podiformes ») : ces gisements caractérisent les ophiolites (Turquie, Oman, Nouvelle-Calédonie).`,
          { type: "magma", echelle: "manteau", chemin: [
            pt(1400, 1.0, 1, "Sous une dorsale, un liquide basaltique traverse le manteau."),
            pt(1250, 0.4, 2, "En réagissant avec la péridotite, il laisse la chromite sous forme de lentilles.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"]),
        sc("Dans une grande chambre magmatique",
          `Dans les grandes intrusions (Bushveld), la chromite s'étale en lits d'un mètre d'épaisseur sur des dizaines de kilomètres : ce sont les plus grandes réserves mondiales de chrome.`, PAS("se reporter à la fiche du platine, qui se concentre dans ces mêmes lits.")),
      ],
    },
    eskolaite: {
      sansForme: "L'eskolaïte, rare, se présente en petits grains et en prismes mal formés.",
      forme: `L'eskolaïte (Cr₂O₃) reprend la structure du corindon, le chrome remplaçant l'aluminium.`,
      intro: `Oxyde de chrome rare, l'eskolaïte se rencontre dans les roches métamorphiques chromifères.`,
      scenarios: [sc("Dans une roche métamorphique enrichie en chrome",
        `Décrite en 1958 à Outokumpu (Finlande), elle porte le nom du pétrographe finlandais Pentti Eskola ; on la trouve aussi en inclusion dans des diamants.`, PAS("minéral rare de composition particulière."))],
    },
    periclase: {
      forme: `Le périclase (MgO) adopte la structure du sel. Au contact de l'humidité, il s'hydrate en brucite : on le rencontre rarement isolé.`,
      intro: `Le périclase se forme lorsqu'une dolomie est fortement chauffée par un magma.`,
      scenarios: [sc("Au contact d'un magma",
        `Une dolomie chauffée au-delà de ≈ 700 °C, à faible pression, au contact d'une intrusion, perd son gaz carbonique : le magnésium demeure en périclase, tandis que le calcium reste en calcite.`,
        { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(100, 0.05, 1, "À une profondeur de 1 à 2 km, la dolomie se trouve enfouie."),
          pt(750, 0.05, 2, "Une intrusion voisine la porte vers 700 à 800 °C : le gaz carbonique s'échappe et le magnésium cristallise en périclase.", { bande: "périclase" }),
          pt(15, 0, 3, "L'érosion expose le marbre à périclase ; au contact de l'eau, ce dernier se transforme en brucite.")], note: "Chemin schématique." }, ["tuttle"])],
    },
    brucite: {
      forme: `La brucite (Mg(OH)₂) se compose de feuillets d'octaèdres Mg(OH)₆ retenus par des forces faibles : clivage basal parfait et lamelles souples. Elle représente à elle seule la couche octaédrique des serpentines et du talc.`,
      intro: `La brucite se forme par hydratation des roches du manteau, dans une eau très basique.`,
      scenarios: [sc("Dans une serpentinite",
        `L'olivine d'une péridotite se transforme en serpentine et en brucite lorsque l'eau s'y infiltre, et celle-ci devient très basique (pH > 10). Les sources hyperalcalines des ophiolites (Oman, Ligurie) en déposent toujours.`,
        ehph("magnesium", [E(8, 0.2, 1, "Dans une eau ordinaire, le magnésium demeure en solution."), E(11, 0, 2, "Dans l'eau très basique d'une serpentinite, le magnésium se fixe sous forme de brucite.")]), [SRC.vernon])],
    },
    spinelle: {
      forme: `Spinelle (MgAl₂O₄), premier représentant d'une famille entière : oxygènes en empilement cubique compact, magnésium en tétraèdres, aluminium en octaèdres. Le spinelle a donné son nom à la macle la plus courante chez les cristaux cubiques.`,
      intro: `Le spinelle se forme dans les marbres et roches magnésiennes chauffés, ainsi que dans le manteau.`,
      scenarios: [
        sc("Dans un marbre de contact",
          `Chauffée par une intrusion, une dolomie impure donne un marbre à spinelle : les spinelles rouges de Birmanie et du Vietnam accompagnent les rubis.`,
          { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
            pt(100, 0.1, 1, "À quelques kilomètres de profondeur gît une dolomie impure."),
            pt(650, 0.1, 2, "Sous l'effet d'une intrusion, la roche recristallise : magnésium et aluminium s'unissent en spinelle.", { bande: "spinelle" }),
            pt(15, 0, 3, "Une fois l'érosion faite, les rivières concentrent les spinelles libérés.")], note: "Chemin schématique." }, ["tuttle"]),
        sc("Dans le manteau",
          `Dans la péridotite, le spinelle est le minéral alumineux présent entre 30 et 60 km de profondeur (lherzolite à spinelle de Lherz).`,
          PAS("se reporter à la fiche de la péridotite.")),
      ],
    },

    // ═══════════ étain, zirconium, uranium, niobium ═══════════
    cassiterite: {
      forme: `Structure du rutile pour la cassitérite (SnO₂) : chaînes d'octaèdres SnO₆ selon c. Son étain, élément lourd, la rend très dense (7) et inaltérable.`,
      intro: `La cassitérite cristallise au sommet des granites riches en étain, avant de se concentrer dans les cours d'eau.`,
      scenarios: [
        sc("Autour d'un granite",
          `Lorsqu'un granite très différencié se termine, il libère des fluides chargés d'étain : sa coupole se transforme en greisen, et des filons de quartz se remplissent. Exemples : Cornouailles, Erzgebirge ; en France, Montebras et Échassières.`,
          { type: "magma", echelle: "croute", chemin: [
            pt(800, 0.2, 1, "Un magma granitique très différencié, riche en étain et en eau, se met en place vers 5 à 8 km de profondeur."),
            pt(680, 0.15, 2, "Ce granite, en cristallisant, libère des fluides riches en étain qui fracturent sa coupole.", { bande: "cristallisation" }),
            pt(400, 0.08, 3, "Dans les greisens et les filons de quartz, la cassitérite se dépose entre 300 et 500 °C.")], note: "Chemin schématique." }, ["hirschmann", SRC.lehmann]),
        sc("Dans une rivière (placer)",
          `Dense, la cassitérite s'accumule dans les graviers des cours d'eau : les placers de Malaisie et d'Indonésie ont fourni l'essentiel de l'étain produit au XX<sup>e</sup> siècle.`, PAS("Le mécanisme est le même que pour l'or des rivières (voir la fiche de l'or).")),
      ],
    },
    baddeleyite: {
      forme: `Enfermant sept oxygènes autour de chaque zirconium, la baddeleyite (ZrO₂) adopte une forme de fluorine déformée et monoclinique. Très réfractaire, elle contient de l'uranium mais, à l'origine, pas de plomb : elle se date comme le zircon.`,
      intro: `La baddeleyite remplace le zircon lorsque le magma manque de silice.`,
      scenarios: [sc("Au sein d'un magma pauvre en silice",
        `Dans gabbros, dolérites et carbonatites, le zirconium manque de silice pour former du zircon et cristallise en baddeleyite. Ces grains permettent de dater les grandes coulées basaltiques.`,
        { type: "magma", echelle: "croute", chemin: [
          pt(1200, 0.3, 1, "Un magma basique et pauvre en silice se met en place dans la croûte."),
          pt(1000, 0.3, 2, "Arrivé à saturation en fin de cristallisation, le zirconium, faute de silice, donne de la baddeleyite.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"])],
    },
    uraninite: {
      forme: `Structure de la fluorine pour l'uraninite (UO₂). Au fil du temps, l'uranium se désintègre en plomb : elle sert ainsi d'horloge géologique. La pechblende des filons est une uraninite mal cristallisée, en partie oxydée.`,
      intro: `L'uraninite précipite à l'endroit où une eau transportant de l'uranium oxydé devient réductrice.`,
      scenarios: [
        sc("Dans un filon au voisinage d'un granite",
          `Les eaux oxydantes lessivent l'uranium contenu dans la monazite et l'uraninite accessoire des granites. Au contact d'un milieu réducteur (matière organique, sulfures, fer ferreux), l'uranium redevient insoluble et précipite en pechblende : tel est le cas des gisements du Limousin (Bessines), du Forez et de Vendée.`,
          ehph("uranium", [E(5, 0.6, 1, "Dans l'eau oxydante, l'uranium est soluble sous forme d'uranyle."), E(6, -0.2, 2, "L'eau rencontre un milieu réducteur : l'uranium repasse à l'état tétravalent et précipite sous forme de pechblende.")],
            "Au front où l'eau oxydante devient réductrice, l'uranium se concentre."), [SRC.cuney]),
        sc("Dans une pegmatite",
          `Les pegmatites des granites riches en uranium renferment de beaux cubes d'uraninite.`, PAS("cristallisation d'un liquide de pegmatite.")),
      ],
    },
    thorianite: {
      forme: `La thorianite (ThO₂) reprend la structure de la fluorine, comme l'uraninite avec laquelle elle forme une série continue. Plus stable qu'elle, elle ne s'oxyde pas davantage, le thorium gardant son état tétravalent.`,
      intro: `Dans les pegmatites et les carbonatites, la thorianite se forme, avant de s'accumuler ensuite dans les graviers.`,
      scenarios: [sc("Dans une pegmatite, puis dans un placer",
        `Lourde et inaltérable, la thorianite se concentre dans les placers. Décrite en 1904 dans les graviers à gemmes du Sri Lanka, on la trouve aussi à Madagascar.`, PAS("minéral accessoire, ensuite concentré dans les graviers."))],
    },
    columbite: {
      forme: `Des octaèdres de niobium (ou de tantale) et de fer (ou de manganèse) forment des chaînes en zigzag dans la columbite. Le tantale, deux fois plus lourd, fait passer la densité de 5,3 à 8 ; associée à la tantalite, elle compose le « coltan ».`,
      intro: `Dans les pegmatites enrichies en métaux rares, la série columbite-tantalite cristallise.`,
      scenarios: [sc("Dans une pegmatite",
        `Au sein des dernières pegmatites des granites riches en métaux rares, niobium et tantale forment des tablettes noires. Échassières (Allier) et Montebras en ont fourni ; le coltan des téléphones provient surtout d'Afrique centrale.`,
        PAS("Une pegmatite naît d'un liquide très riche en eau et en éléments rares : le diagramme du granite n'en rend pas compte."))],
    },
    pyrochlore: {
      forme: `Charpente d'octaèdres NbO₆ liés par leurs sommets dans le pyrochlore ; calcium, sodium et fluor occupent les cavités. L'uranium et le thorium accueillis détruisent peu à peu le réseau (état métamicte).`,
      intro: `Minerai du niobium, le pyrochlore cristallise dans les carbonatites.`,
      scenarios: [sc("Dans une carbonatite",
        `Dans les magmas carbonatés, le niobium se concentre et cristallise en petits octaèdres de pyrochlore. L'altération tropicale de la carbonatite d'Araxá (Brésil) l'a regroupé dans une latérite, qui fournit l'essentiel du niobium mondial.`,
        PAS("se reporter à la fiche de la carbonatite."))],
    },
  });
})();
