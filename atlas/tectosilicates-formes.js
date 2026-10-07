// ============================================================
// CLASSES IX.F (tectosilicates) et IX.G (zéolithes) : formes cristallines (cristal.js) et modes de formation (MIN_F)
// — chantier F.4, 01/10/2026. Chargé après ino-phyllosilicates-formes.js. Quartz et orthose : faits en F.3 (cristal.js,
// mineraux-formation.js) ; eucryptite : nesosilicates-formes.js.
// Mailles = celles des structures 3D (COD). Feldspaths : formes de l'orthose (c, b, m, x) ; tricliniques : m{110} et M{1-10}
// sont deux formes distinctes. Anorthite, bytownite et celsiane ont une maille c doublée : x{-201} des ouvrages = {-101}.
// Chabazite et lévyne : maille hexagonale équivalente à la maille rhomboédrique du CIF. Classes polaires simplifiées
// (néphéline et davyne 6 → 6/m, natrolite mm2 → mmm, tridymite m → 2/m) : c'est dit dans la note du faciès.
// ============================================================

(function () {
  const CUB = (a) => [a, a, a, 90, 90, 90];
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  const CLIV_FELD = [
    { hkl: [0, 0, 1], qualite: "parfait", nom: "base", pas: 0.2 },
    { hkl: [0, 1, 0], qualite: "bon", nom: "latéral", pas: 0.24 },
  ];
  // feldspath monoclinique (C2/m) : formes de l'orthose
  const FMONO = (nom, couleur, maille, cod, note, o) => Object.assign({
    nom, couleur, systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C", maille, mailleSource: cod,
    facies: [{ nom: "Prisme", formes: [
      { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 1.02 },
      { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "x", hkl: [-2, 0, 1], nom: "face oblique", d: 1.8 }], note }],
    clivages: CLIV_FELD,
  }, o || {});
  // feldspath triclinique : m et M distincts ; xh = indices de la face oblique dans la maille du CIF
  const FTRI = (nom, couleur, maille, reseau, cod, xh, note, macle) => {
    const formes = (dB) => [
      { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: dB }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 },
      { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "M", hkl: [1, -1, 0], nom: "prisme", d: 2.05 },
      { sym: "x", hkl: xh, nom: "face oblique", d: 1.8 }];
    const facies = [{ nom: "Tablette", formes: formes(macle ? 0.75 : 1.02), note }];
    if (macle) facies.push({ nom: "Macle de l'albite", azimut: 70, elevation: 12, macle: { plan: [0, 1, 0], compo: [0, 1, 0] }, formes: formes(0.75), note: macle });
    return { nom, couleur, systeme: "triclinique", classe: "-1", classeNom: "pinacoïdale", reseau, maille, mailleSource: cod,
      facies, clivages: CLIV_FELD };
  };
  const MACLE_AB = "Deux individus symétriques l'un de l'autre par rapport au plan {010}, soudés sur ce plan : l'angle rentrant se voit sur la face c. Répétée des dizaines de fois, cette macle strie les faces de fines lignes parallèles — le moyen de reconnaître un plagioclase à la loupe.";
  const DODECA = (nom, couleur, a, classe, classeNom, cod, note) => ({
    nom, couleur, systeme: "cubique", classe, classeNom, reseau: "P", maille: CUB(a), mailleSource: cod,
    facies: [{ nom: "Dodécaèdre", formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }], note }], clivages: [],
  });
  const SCAPO = (nom, couleur, a, c, cod, note) => ({
    nom, couleur, systeme: "quadratique", classe: "4/m", classeNom: "dipyramidale quadratique", reseau: "I", maille: [a, a, c, 90, 90, 90],
    mailleSource: cod, azimut: 22, elevation: 14,
    facies: [{ nom: "Prisme", formes: [
      { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
      { sym: "r", hkl: [1, 1, 1], nom: "dipyramide", d: 2.2 }], note }],
    clivages: [{ hkl: [1, 0, 0], qualite: "bon", nom: "{100}", pas: 0.26 }, { hkl: [1, 1, 0], qualite: "bon", nom: "{110}", pas: 0.26 }],
  });

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {
    // ── silice ──
    tridymite: {
      nom: "Tridymite", couleur: "#f3f3f1", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C",
      maille: [5.007, 8.6004, 8.2169, 90, 91.512, 90], mailleSource: "cod9005270", azimut: 20, elevation: 30,
      facies: [{ nom: "Plaquette hexagonale", formes: [
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde — la plaquette", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 4.0 },
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 4.0 }],
        note: "Fines plaquettes hexagonales, souvent groupées par trois (d'où le nom, grec <i>tridymos</i>, « triple »). La maille est monoclinique mais presque hexagonale (b ≈ a√3) : la plaquette garde la forme héritée de la tridymite de haute température. Classe m simplifiée en 2/m." }],
      clivages: [],
    },
    melanophlogite: {
      nom: "Mélanophlogite", couleur: "#eeeee6", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "P",
      maille: CUB(13.399), mailleSource: "cod9010371",
      facies: [{ nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
        note: "Petits cubes incolores, parfois groupés en sphérules, sur le soufre des gisements de Sicile. Chauffée, la matière organique enfermée dans ses cages noircit — d'où le nom (grec « qui noircit au feu »)." }],
      clivages: [],
    },

    // ── feldspaths alcalins ──
    microcline: (() => { const f = FTRI("Microcline", "#9fd2c4", [8.5714, 12.9646, 7.2217, 90.6, 115.9, 87.7], "C", "cod9004191", [-2, 0, 1],
      "Même forme que l'orthose : prismes trapus des pegmatites, parfois longs de plusieurs mètres. L'amazonite, verte, en est une variété (plomb et eau). Le quadrillage des macles n'apparaît qu'au microscope."); return f; })(),
    sanidine: FMONO("Sanidine", "#f1ece2", [8.539, 13.015, 7.179, 90, 115.99, 90], "cod9000303",
      "Tablettes aplaties sur {010} (grec <i>sanis</i>, « planche »), limpides : les phénocristaux des trachytes et des rhyolites, souvent maclés Carlsbad.",
      { facies: [
        { nom: "Tablette", formes: [
          { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 0.7 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "x", hkl: [-2, 0, 1], nom: "face oblique", d: 1.8 }],
          note: "Tablettes aplaties sur {010} (grec <i>sanis</i>, « planche »), limpides : les phénocristaux des trachytes et des rhyolites." },
        { nom: "Macle de Carlsbad", azimut: 78, elevation: 12, macle: { axe: [0, 0, 1], compo: [0, 1, 0] }, formes: [
          { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 0.7 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "x", hkl: [-2, 0, 1], nom: "face oblique", d: 1.8 }],
          note: "Deux individus tournés de 180° autour de c, soudés sur {010} : la macle la plus fréquente des sanidines des trachytes d'Auvergne." }] }),
    anorthose: FTRI("Anorthose", "#e4ddd0", [8.29, 12.966, 7.151, 91.18, 116.31, 90.14], "C", "cod9000855", [-2, 0, 1],
      "Prismes trapus, en losange en coupe : les phénocristaux des « porphyres en losanges » d'Oslo et des trachytes sodiques."),
    celsiane: FMONO("Celsiane", "#f0efe9", [8.622, 13.078, 14.411, 90, 115.1, 90], "cod9000508",
      "Prismes courts comme ceux de l'orthose. La maille c est doublée : la face oblique x{-201} des ouvrages s'écrit ici {-101}.",
      { reseau: "I", facies: [{ nom: "Prisme", formes: [
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 1.02 },
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "x", hkl: [-1, 0, 1], nom: "face oblique", d: 1.8 }],
        note: "Prismes courts comme ceux de l'orthose. La maille c est doublée : la face oblique x{-201} des ouvrages s'écrit ici {-101}." }] }),
    hyalophane: FMONO("Hyalophane", "#eceae0", [8.544, 13.03, 7.195, 90, 115.68, 90], "cod9000868",
      "Prismes limpides comme du verre (grec <i>hyalos</i>), de la forme de l'orthose : dolomies de Binn (Valais)."),

    // ── plagioclases ──
    albite: FTRI("Albite", "#f4f4f0", [8.142, 12.785, 7.159, 94.19, 116.61, 87.68], "C", "cod9000783", [-2, 0, 1],
      "Tablettes aplaties sur {010}, blanches (latin <i>albus</i>) ; la cleavelandite des pegmatites en est une variété en lames.", MACLE_AB),
    oligoclase: FTRI("Oligoclase", "#ece6d8", [8.154, 12.823, 7.139, 94.06, 116.5, 88.59], "C", "cod9011422", [-2, 0, 1],
      "Cristaux rares, de la forme de l'albite ; la « pierre de soleil » de Tvedestrand (Norvège) est un oligoclase à paillettes d'hématite.", MACLE_AB),
    plagioclases: FTRI("Plagioclase", "#e3e0d8", [8.179, 12.88, 7.112, 93.44, 116.21, 90.23], "C", "cod9001030", [-2, 0, 1],
      "Tablettes aplaties sur {010}, rarement nettes : dans les roches, les plagioclases sont surtout des lattes et des grains (maille d'un plagioclase An48).", MACLE_AB),
    andesine: FTRI("Andésine", "#ddd8cc", [8.179, 12.88, 7.112, 93.44, 116.21, 90.23], "C", "cod9001030", [-2, 0, 1],
      "Tablettes des andésites et des diorites, zonées (cœur plus calcique que la bordure).", MACLE_AB),
    labradorite: FTRI("Labradorite", "#7d8a92", [8.1736, 12.8736, 7.1022, 93.462, 116.054, 90.475], "C", "cod9000744", [-2, 0, 1],
      "Cristaux rares ; on la connaît surtout en masses clivables qui renvoient des reflets bleus et verts (labradorescence).", MACLE_AB),
    bytownite: FTRI("Bytownite", "#d8d2c4", [8.188, 12.822, 14.196, 93.37, 116.04, 90.87], "P", "cod9017364", [-1, 0, 1],
      "Tablettes des gabbros et des anorthosites. Maille c doublée : la face oblique x{-201} des ouvrages s'écrit ici {-101}.", MACLE_AB),
    anorthite: FTRI("Anorthite", "#ecebe6", [8.175, 12.873, 14.17, 93.11, 115.89, 91.28], "P", "cod9001258", [-1, 0, 1],
      "Prismes trapus, blancs, dans les blocs rejetés par le Vésuve et les basaltes du Japon (Miyake-jima). Maille c doublée : x{-201} des ouvrages = {-101}.", MACLE_AB),

    // ── feldspathoïdes ──
    nepheline: {
      nom: "Néphéline", couleur: "#d9d2c3", systeme: "hexagonal", classe: "6/m", classeNom: "dipyramidale hexagonale", reseau: "P",
      maille: HEX(9.9995, 8.384), mailleSource: "cod9004729", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme court", formes: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.0 }],
        note: "Prismes hexagonaux courts, gras, dans les phonolites et les syénites néphéliniques ; en lame mince, des sections hexagonales et rectangulaires. Classe polaire 6 simplifiée en 6/m." }],
      clivages: [{ hkl: [1, 0, -1, 0], qualite: "médiocre", nom: "prismatique", pas: 0.3 }],
    },
    leucite: {
      nom: "Leucite", couleur: "#f1efe8", systeme: "quadratique", classe: "4/m", classeNom: "dipyramidale quadratique", reseau: "I",
      maille: [13.09, 13.09, 13.75, 90, 90, 90], mailleSource: "cod9000485",
      facies: [{ nom: "Trapézoèdre", formes: [
        { sym: "n", hkl: [2, 1, 1], nom: "dipyramide", d: 1.0 }, { sym: "n", hkl: [1, 2, 1], nom: "dipyramide", d: 1.0 },
        { sym: "n", hkl: [1, 1, 2], nom: "dipyramide", d: 1.0 }],
        note: "Le « trapézoèdre » blanc des laves du Vésuve et du Latium : 24 faces, la forme cubique de la leucite de haute température. En refroidissant (vers 600 °C), la maille devient quadratique sans que la forme change : trois dipyramides {211}, {121}, {112} remplacent la forme cubique unique." }],
      clivages: [],
    },
    sodalite: DODECA("Sodalite", "#3d5fa6", 8.887, "-43m", "hexakistétraédrique", "cod9003318",
      "Dodécaèdres rares (Vésuve) ; d'ordinaire en masses bleues. La hackmanite, variété du Groenland, rosit à la lumière puis pâlit dans le noir."),
    hauyne: DODECA("Haüyne", "#2c64c8", 9.116, "-43m", "hexakistétraédrique", "cod9004232",
      "Petits dodécaèdres bleu vif dans les laves alcalines (Eifel, Vésuve, Latium) ; dédiée à René Just Haüy, fondateur de la cristallographie."),
    noseane: DODECA("Noséane", "#9a9488", 9.084, "-43m", "hexakistétraédrique", "cod9004198",
      "Dodécaèdres gris à brun, souvent à bord sombre, dans les phonolites de l'Eifel (lac de Laach)."),
    lazurite: DODECA("Lazurite", "#1f3fa0", 9.077, "23", "tétartoïdale", "cod9012653",
      "Dodécaèdres rares, jusqu'à quelques centimètres, à Sar-e-Sang (Afghanistan) ; d'ordinaire en grains dans le lapis-lazuli."),
    davyne: {
      nom: "Davyne", couleur: "#e9e6dc", systeme: "hexagonal", classe: "6/m", classeNom: "dipyramidale hexagonale", reseau: "P",
      maille: HEX(12.854, 5.357), mailleSource: "cod9004215", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 2.5 }],
        note: "Prismes hexagonaux limpides dans les blocs rejetés par la Somma (Vésuve). Classe polaire 6 simplifiée en 6/m." }],
      clivages: [{ hkl: [1, 0, -1, 0], qualite: "bon", nom: "prismatique", pas: 0.3 }],
    },

    // ── scapolites ──
    marialite: SCAPO("Marialite", "#ece4cc", 12.0396, 7.5427, "cod9004437",
      "Prismes carrés coiffés d'une dipyramide, à faces souvent ternes ; les deux clivages prismatiques se croisent à 45° et 90°."),
    meionite: SCAPO("Méionite", "#e6dcc0", 12.16711, 7.57547, "cod9010507",
      "Prismes trapus des marbres et des blocs du Vésuve ; la dipyramide est très plate (grec <i>meion</i>, « moindre »)."),

    // ── autres ──
    danburite: {
      nom: "Danburite", couleur: "#f2efe2", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [8.038, 8.752, 7.73, 90, 90, 90], mailleSource: "cod9000386", azimut: 24, elevation: 14,
      facies: [{ nom: "Prisme en biseau", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "l", hkl: [1, 2, 0], nom: "prisme", d: 1.05 },
        { sym: "d", hkl: [1, 0, 1], nom: "prisme terminal (biseau)", d: 2.4 }],
        note: "Prismes en losange terminés en biseau, comme la topaze, dont elle a l'éclat : Charcas (Mexique), Birmanie. Nommée d'après Danbury (Connecticut)." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "imparfait", nom: "{001}", pas: 0.3 }],
    },

    // ── zéolithes ──
    natrolite: {
      nom: "Natrolite", couleur: "#f4f3ee", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "F",
      maille: [18.221, 18.331, 6.536, 90, 90, 90], mailleSource: "cod9009401", azimut: 24, elevation: 14,
      facies: [{ nom: "Aiguille", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "pyramide", d: 4.0 }],
        note: "Aiguilles à section presque carrée, terminées par une pyramide basse, en houppes rayonnantes dans les bulles des basaltes. Classe polaire mm2 simplifiée en mmm (les deux bouts sont dessinés pareils)." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "prismatique", pas: 0.26 }],
    },
    chabazite: {
      nom: "Chabazite", couleur: "#f1e5d6", systeme: "trigonal", classe: "-3m", classeNom: "ditrigonale scalénoédrique", reseau: "R",
      maille: HEX(13.78, 14.98), mailleSource: "cod9015939 (maille rhomboédrique a 9,39 Å, α 94,4° convertie en maille hexagonale)",
      azimut: 22, elevation: 16,
      facies: [{ nom: "Rhomboèdre", formes: [{ sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
        note: "Rhomboèdres presque cubiques (angle de 94°), qu'on prend pour des cubes : les géodes des basaltes en sont tapissées. Souvent maclés par pénétration." }],
      clivages: [{ hkl: [1, 0, -1, 1], qualite: "médiocre", nom: "rhomboédrique", pas: 0.3 }],
    },
    levyne: {
      nom: "Lévyne", couleur: "#f2ede2", systeme: "trigonal", classe: "-3m", classeNom: "ditrigonale scalénoédrique", reseau: "R",
      maille: HEX(13.43259, 22.67725), mailleSource: "cod9017609", azimut: 22, elevation: 22,
      facies: [{ nom: "Tablette", formes: [
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.8 }],
        note: "Tablettes hexagonales minces à bords biseautés par le rhomboèdre, souvent maclées ; dédiée au minéralogiste Armand Lévy." }],
      clivages: [],
    },
    faujasite: {
      nom: "Faujasite", couleur: "#f6f5f0", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUB(24.74), mailleSource: "cod9000124",
      facies: [{ nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
        note: "Petits octaèdres incolores, dans les bulles des basaltes du Kaiserstuhl (Allemagne). Dédiée au géologue Barthélemy Faujas de Saint-Fond, qui décrivit les volcans du Vivarais." }],
      clivages: [{ hkl: [1, 1, 1], qualite: "bon", nom: "octaédrique", pas: 0.3 }],
    },
    analcime: {
      nom: "Analcime", couleur: "#f2efe8", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "I",
      maille: CUB(13.7065), mailleSource: "cod9004009",
      facies: [{ nom: "Trapézoèdre", formes: [{ sym: "n", hkl: [2, 1, 1], nom: "trapézoèdre", d: 1.0 }],
        note: "Trapézoèdres à 24 faces, limpides ou blancs, dans les cavités des basaltes (îles Cyclopes, Sicile) : la forme de la leucite, dont elle a la charpente." }],
      clivages: [],
    },
    laumontite: {
      nom: "Laumontite", couleur: "#efe9df", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C",
      maille: [14.70542, 13.07118, 7.45156, 90, 112.121, 90], mailleSource: "cod9002889", azimut: 24, elevation: 14,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "e", hkl: [-2, 0, 1], nom: "face terminale oblique", d: 1.8 }],
        note: "Prismes à section en losange terminés par une face oblique ; décrite en 1785 dans la mine de plomb de Huelgoat (Finistère) et dédiée à Gillet de Laumont. À l'air sec, elle perd de l'eau, blanchit et s'effrite." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.24 }, { hkl: [1, 1, 0], qualite: "parfait", nom: "prismatique", pas: 0.3 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    deer: "Deer W. A., Howie R. A., Wise W. S., Zussman J. (2004). <i>Rock-forming minerals, vol. 4B : Framework silicates — silica minerals, feldspathoids and the zeolites</i>. Geological Society, Londres.",
    gottardi: "Gottardi G., Galli E. (1985). <i>Natural zeolites</i>. Springer, Berlin.",
    iijima: "Iijima A. (1980). « Geology of natural zeolites and zeolitic rocks ». <i>Pure and Applied Chemistry</i> 52, p. 2115–2130.",
    kristmann: "Kristmannsdóttir H., Tómasson J. (1978). « Zeolite zones in geothermal areas in Iceland ». Dans Sand L. B., Mumpton F. A. (dir.), <i>Natural zeolites</i>, Pergamon, p. 277–284.",
    chopin: "Chopin C. (1984). « Coesite and pure pyrope in high-grade blueschists of the Western Alps ». <i>Contributions to Mineralogy and Petrology</i> 86, p. 107–118.",
    chao: "Chao E. C. T., Fahey J. J., Littler J., Milton D. J. (1962). « Stishovite, SiO₂, a very high pressure new mineral from Meteor Crater, Arizona ». <i>Journal of Geophysical Research</i> 67, p. 419–421.",
    elgoresy: "El Goresy A. et al. (2008). « Seifertite, a dense orthorhombic polymorph of silica from the Martian meteorites Shergotty and Zagami ». <i>European Journal of Mineralogy</i> 20, p. 523–528.",
    heaney: "Heaney P. J., Post J. E. (1992). « The widespread distribution of a novel silica polymorph in microcrystalline quartz varieties ». <i>Science</i> 255, p. 441–443.",
    london: "London D. (2008). <i>Pegmatites</i>. Canadian Mineralogist, Special Publication 10.",
    smith: "Smith J. V., Brown W. L. (1988). <i>Feldspar minerals, vol. 1</i>. Springer, Berlin.",
    carmichael: "Carmichael I. S. E. (1967). « The mineralogy and petrology of the volcanic rocks from the Leucite Hills, Wyoming ». <i>Contributions to Mineralogy and Petrology</i> 15, p. 24–66.",
  };
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + (t || "minéral rare, formé dans des conditions particulières.") });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE()), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin) => ({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." });
  const magma = (echelle, chemin, o) => Object.assign({ type: "magma", echelle, chemin, note: "Chemin schématique." }, o || {});
  const SF = (t) => "Forme non dessinée : " + t;
  const PEG = "Pas de diagramme : la pegmatite cristallise à partir d'un liquide très riche en eau et en éléments rares, que le diagramme du granite ne représente pas.";
  const BULLE = "Pas de diagramme : l'eau chaude qui circule dans une lave refroidie dépose les zéolithes dans ses bulles, à des températures (≈ 30–250 °C) et des pressions que les diagrammes de l'atlas ne représentent pas.";
  const FELD = `Les feldspaths sont une charpente de tétraèdres (Si,Al)O₄ reliés par tous leurs sommets ; les chaînes en « vilebrequin »
        parallèles à a laissent des cavités où logent K, Na, Ca ou Ba. Deux directions de liaisons plus faibles, {001} et {010}, donnent
        les deux clivages.`;
  const PLAG = FELD + ` Dans les plagioclases, Na⁺ + Si⁴⁺ s'échangent avec Ca²⁺ + Al³⁺ : de l'albite à l'anorthite, une seule série. La maille
        est triclinique et les clivages se coupent à ≈ 94°.`;
  const ZEO = `Les zéolithes sont des charpentes de tétraèdres (Si,Al)O₄ percées de canaux et de cages assez larges pour des molécules
        d'eau, qui y circulent librement : chauffées, elles perdent leur eau sans s'effondrer et la reprennent ensuite (grec <i>zein</i>,
        « bouillir », car elles semblent bouillir au chalumeau). Les cations des canaux s'échangent avec ceux de l'eau qui passe.`;
  const SODA = `Les feldspathoïdes de ce groupe sont faits de cages de 24 tétraèdres (Si,Al)O₄, les « cages de sodalite », empilées en cube ;
        chaque cage contient un ion (Cl⁻, SO₄²⁻, S₃⁻…) entouré de sodium ou de calcium.`;
  const CANC = `Le groupe de la cancrinite empile des anneaux de six tétraèdres (Si,Al)O₄ de façon à laisser de larges canaux le long de c,
        garnis d'ions et de cations.`;
  const SCAP = `Les scapolites sont des colonnes d'anneaux de quatre tétraèdres le long de c, reliées en charpente ; chaque grande cavité
        contient un anion (Cl⁻ dans la marialite, CO₃²⁻ dans la méionite, SO₄²⁻ dans la silvialite) entouré de Na ou de Ca.`;
  // magma basaltique / granitique : chemins communs
  const BASALTE = (min, T) => magma("croute", [pt(1250, 0.6, 1, "Un magma basaltique monte du manteau."),
    pt(T, 0.2, 2, min + " cristallise dans la chambre, parmi les premiers minéraux.", { bande: "cristallisation" }), pt(1100, 0, 3, "La lave s'épanche ou le magma fige en gabbro.")]);
  const GRANITE = (min, T, P) => magma("croute", [pt(830, 0.8, 1, "La croûte profonde fond en partie : le liquide emporte silice, aluminium et alcalins."),
    pt(800, P || 0.25, 2, "Le magma monte et s'installe."), pt(T, P || 0.2, 3, min + " cristallise lentement.", { bande: "cristallisation" })], { courbes: ["graniteEau"] });
  const LAVE = (min, T0, T, quoi) => magma("croute", [pt(T0, 0.25, 1, quoi || "Un magma riche en alcalins s'accumule dans une chambre peu profonde."),
    pt(T, 0.1, 2, min + " cristallise dans le magma qui remonte.", { bande: "cristallisation" }), pt(T - 60, 0, 3, "L'éruption fige la lave : les cristaux restent en phénocristaux.")]);

  Object.assign(MIN_F, {
    // ═══════════ silice ═══════════
    calcedoine: {
      sansForme: SF("la calcédoine est faite de fibres de quartz microscopiques, sans faces visibles."),
      forme: `Des fibres de quartz larges de moins d'un micromètre, entremêlées de moganite, poussent côte à côte depuis la paroi : en masse
        elles forment des couches mamelonnées, sans faces.`,
      intro: `La calcédoine (silex, agate, cornaline) est la silice des roches sédimentaires et des cavités : elle naît d'une eau froide
        ou tiède sursaturée en silice.`,
      scenarios: [s("Le silex de la craie", `Les squelettes d'éponges et de diatomées sont en opale, qui se dissout plus facilement que le
        quartz. Dans la craie enfouie, l'eau des pores se charge de cette silice puis la redépose, d'abord en opale CT, puis en calcédoine
        autour d'un débris : le rognon de silex grossit couche par couche.`, { type: "silice", tmax: 120, chemin: [
          { T: 10, C: 60, n: 1, t: "Sous le fond de la mer, les spicules d'éponges se dissolvent : l'eau des pores porte ≈ 60 mg de silice par litre." },
          { T: 40, C: 60, n: 2, t: "Enfouie, la boue se réchauffe : l'opale reprécipite en opale CT autour des débris." },
          { T: 55, C: 15, n: 3, t: "Vers 50 °C, l'opale CT devient calcédoine et quartz : le rognon de silex est fait." }],
        note: "Teneurs schématiques ; courbes de solubilité de l'opale et du quartz." })],
    },
    opale: {
      sansForme: SF("l'opale est amorphe : pas de maille, donc pas de faces."),
      forme: `L'opale n'a pas de structure régulière : ce sont des sphères de silice hydratée de 150 à 300 nm. Dans l'opale noble, elles
        sont de même taille et rangées comme des oranges sur un étal : ce réseau diffracte la lumière et fait les jeux de couleurs.`,
      intro: `L'opale se dépose d'une eau très chargée en silice, chaude (sources) ou froide (eaux des sols arides), ou dans les squelettes
        des organismes siliceux.`,
      scenarios: [s("Dans une source chaude (geysérite)", `L'eau d'un champ géothermique, à l'équilibre avec le quartz en profondeur, remonte
        et se refroidit trop vite pour que le quartz cristallise : l'excès de silice se dépose en opale autour des sources (geysérite
        de Yellowstone, d'Islande).`, { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)", chemin: [
          { T: 250, C: 434, n: 1, t: "À 250 °C, en profondeur, l'eau est à l'équilibre avec le quartz : ≈ 430 mg de silice par litre." },
          { T: 100, C: 434, n: 2, t: "Elle jaillit à 100 °C en gardant sa silice : elle est sursaturée même pour l'opale." },
          { T: 30, C: 120, n: 3, t: "En se refroidissant à l'air, elle dépose l'excès en opale autour de la source." }],
        note: "Solubilités de l'opale (Fournier et Rowe) et du quartz (Rimstidt) ; chemin schématique." })],
    },
    tridymite: {
      forme: `Mêmes tétraèdres SiO₄ que le quartz, mais en feuillets d'anneaux de six empilés à deux couches : une charpente plus ouverte
        (densité 2,26 contre 2,65), stable seulement entre 870 et 1 470 °C à la pression ordinaire.`,
      intro: `La tridymite cristallise à haute température et basse pression : dans les cavités des laves siliceuses, à partir des gaz.`,
      scenarios: [s("Dans les vacuoles d'une lave", `Dans une rhyolite ou une andésite qui refroidit près de la surface, les gaz chauds
        déposent de fines plaquettes de tridymite dans les vacuoles ; elle reste ensuite métastable. Décrite en 1868 au Cerro San Cristóbal
        (Mexique) ; on la trouve aussi dans les météorites et sur la Lune.`, RARE("dépôt à partir des gaz d'une lave, à la pression ordinaire."), [SRC.deer])],
    },
    cristobalite: {
      sansForme: SF("la cristobalite forme des sphérules et de petits octaèdres hérités de sa forme cubique de haute température."),
      forme: `Tétraèdres SiO₄ en anneaux de six empilés à trois couches, comme les atomes du diamant : cubique au-dessus de ≈ 250 °C, elle
        se plisse un peu en refroidissant et devient quadratique.`,
      intro: `La cristobalite est la silice de très haute température (stable au-dessus de 1 470 °C à la pression ordinaire), que l'on trouve
        pourtant à froid, figée.`,
      scenarios: [s("Dans une lave siliceuse", `Sphérules blanches des obsidiennes et des rhyolites (« flocons de neige ») : la cristobalite y
        cristallise vite, dans le verre encore chaud, bien au-dessous de son domaine de stabilité. Elle est aussi l'une des formes de l'opale
        (opale CT : cristobalite et tridymite mal ordonnées).`, RARE("cristallisation hors équilibre, dans un verre chaud."), [SRC.deer])],
    },
    moganite: {
      sansForme: SF("la moganite forme des fibres microscopiques mêlées à la calcédoine."),
      forme: `Des tranches de quartz droit et de quartz gauche alternent maille après maille : comme un quartz maclé à l'échelle des atomes.`,
      intro: `La moganite n'a été reconnue qu'en 1984, à Mogán (Grande Canarie) ; on sait depuis qu'elle forme jusqu'à 20 % de nombreuses
        calcédoines et silex.`,
      scenarios: [s("Mêlée à la calcédoine", `Elle abonde dans les silicifications des milieux évaporitiques et arides, et disparaît avec
        le temps : les silex de plus de 100 millions d'années n'en contiennent presque plus (Heaney et Post 1992).`, RARE("voir la fiche de la calcédoine."), [SRC.heaney])],
    },
    coesite: {
      sansForme: SF("la coésite forme des grains microscopiques, inclus dans le grenat ou le zircon."),
      forme: `Des anneaux de quatre tétraèdres SiO₄ reliés en charpente dense (densité 2,92) : le quartz serré par la pression.`,
      intro: `La coésite n'est stable qu'au-delà de ≈ 2,5–3 GPa, soit plus de 80 km de profondeur. La trouver dans une roche de surface prouve
        que celle-ci est descendue jusque-là — et remontée.`,
      scenarios: [
        s("Dans une croûte entraînée en subduction", `Christian Chopin l'a découverte en 1984 dans les quartzites à pyrope du massif de
          Dora-Maira (Alpes italiennes) : une croûte continentale descendue à plus de 90 km, puis remontée assez vite pour que le grenat
          garde la coésite enfermée.`, meta([pt(15, 0, 1, "Une croûte continentale est entraînée dans la subduction alpine."),
          pt(600, 2.7), pt(700, 3.1, 2, "Au-delà de ≈ 3 GPa, son quartz devient coésite, enfermée dans des grenats.", { bande: "coésite" }),
          pt(500, 1.0, 3, "Elle remonte vite ; hors du grenat, la coésite redevient quartz."), pt(15, 0, 4, "L'érosion la met à jour.")],
          { echelle: "hp", courbes: ["coesite"], gradients: [10, 30] }), ["bose", SRC.chopin]),
        s("Dans un cratère d'impact", `L'onde de choc d'une météorite comprime le quartz pendant une fraction de seconde : coésite et
          stishovite naissent dans les grès choqués (Meteor Crater, Ries).`, RARE("voir la fiche de la stishovite."), [SRC.chao]),
      ],
    },
    stishovite: {
      sansForme: SF("la stishovite forme des cristaux de quelques micromètres."),
      forme: `Le silicium est entouré de SIX oxygènes, en octaèdres, comme le titane du rutile : c'est la silice la plus dense (4,3).`,
      intro: `La stishovite, fabriquée en 1961 par Sergueï Stichov, a été trouvée l'année suivante dans les grès de Meteor Crater (Arizona) :
        elle est devenue la signature des impacts de météorites.`,
      scenarios: [s("Dans un cratère d'impact", `Il faut plus de ≈ 10 GPa : aucune roche de la croûte n'y parvient sans un impact.`, { type: "choc", chemin: [
          { P: 0.1, T: 15, n: 1, t: "Un grès à quartz repose à la surface." },
          { P: 20, T: 170, n: 2, t: "L'onde de choc le comprime pendant une fraction de seconde : une partie du quartz devient stishovite." },
          { P: 20, T: 15, n: 3, t: "La pression retombe aussitôt : la stishovite, figée, survit en grains microscopiques." }],
        note: "Courbe : température qui reste dans la roche après le passage de l'onde (French 1998). Chemin schématique." }, [SRC.chao])],
    },
    seifertite: {
      sansForme: SF("la seifertite forme des lamelles microscopiques."),
      forme: `Octaèdres SiO₆ en chaînes en zigzag, encore plus compacts que ceux de la stishovite.`,
      intro: `La seifertite n'existe qu'au-delà de ≈ 40 GPa ; on l'a trouvée dans des météorites martiennes et lunaires très choquées.`,
      scenarios: [s("Dans une météorite martienne", `Décrite en 2008 dans les météorites de Shergotty et de Zagami, éjectées de Mars par un impact :
        le choc a transformé la silice de ces roches en lamelles de seifertite.`, RARE("pression de choc au-delà de l'échelle des diagrammes de l'atlas."), [SRC.elgoresy])],
    },
    melanophlogite: {
      forme: `Un clathrate : la charpente de tétraèdres SiO₄ forme des cages fermées, comme la glace des hydrates de méthane, et chaque cage
        retient une molécule de méthane, de CO₂ ou d'azote. Le moule de la croissance est ce gaz : sans lui, la charpente ne tient pas.`,
      intro: `La mélanophlogite cristallise à basse température dans les sédiments riches en matière organique, où le méthane abonde.`,
      scenarios: [s("Avec le soufre de Sicile", `En petits cubes sur le soufre des gisements de Racalmuto et de Giona (Sicile), et dans les
        boues froides des suintements de méthane : la silice cristallise autour des molécules de gaz.`, RARE(), [SRC.deer])],
    },

    // ═══════════ feldspaths alcalins ═══════════
    microcline: {
      forme: FELD + ` Le microcline est la forme ORDONNÉE du feldspath potassique : l'aluminium a choisi un seul des quatre sites, ce qui
        incline un peu la maille (triclinique, grec « petite inclinaison »). Ce passage crée les macles en quadrillage.`,
      intro: `Le microcline est le feldspath potassique des roches refroidies très lentement : granites profonds, pegmatites, gneiss.`,
      scenarios: [
        s("Dans un granite qui refroidit lentement", `L'orthose cristallise d'abord ; s'il reste longtemps chaud, ses atomes d'aluminium se
          rangent et le cristal devient microcline, en gardant sa forme.`, GRANITE("Le feldspath potassique", 700), ["tuttle", SRC.smith]),
        s("Dans une pegmatite", `Les cristaux géants (plusieurs mètres) et l'amazonite verte (Pikes Peak, Colorado).`, { cond: false, sansDiagramme: PEG }, [SRC.london]),
      ],
    },
    sanidine: {
      forme: FELD + ` La sanidine est la forme DÉSORDONNÉE : l'aluminium est réparti au hasard sur les quatre sites, la maille reste
        monoclinique. Elle naît chaude et refroidit trop vite pour s'ordonner.`,
      intro: `La sanidine est le feldspath potassique des laves : trachytes, rhyolites, phonolites.`,
      scenarios: [s("Dans une lave trachytique", `Elle cristallise dans la chambre peu profonde, puis la lave remonte et fige : les tablettes
        limpides restent en phénocristaux (trachytes du puy de Dôme, sanidines de Drachenfels).`, LAVE("La sanidine", 950, 880), [SRC.smith])],
    },
    anorthose: {
      forme: FELD + ` L'anorthose contient à la fois du sodium et du potassium, mêlés sur un seul site : un feldspath de haute température,
        triclinique.`,
      intro: `L'anorthose cristallise dans les laves riches en sodium ; refroidie lentement, elle se dédouble en lamelles d'albite et de
        feldspath potassique (perthite).`,
      scenarios: [s("Dans une lave sodique", `Phénocristaux en losange des « porphyres en losanges » d'Oslo, trachytes et phonolites sodiques.`,
        LAVE("L'anorthose", 1000, 930), [SRC.smith])],
    },
    celsiane: {
      forme: FELD + ` Dans la celsiane, le baryum (Ba²⁺) remplace le potassium : il faut deux aluminiums pour deux siliciums, qui alternent
        strictement (maille c doublée).`,
      intro: `La celsiane est le feldspath du baryum ; dédiée à Anders Celsius.`,
      scenarios: [s("Dans un gisement de manganèse métamorphisé", `Les sédiments riches en baryum et en manganèse, chauffés : Jakobsberg
        (Suède), Rush Creek (Californie).`, meta([pt(15, 0, 1, "Des sédiments riches en baryum et en manganèse se déposent."),
          pt(550, 0.4, 2, "Enfouis et chauffés, ils recristallisent : la celsiane apparaît.", { bande: "celsiane" }), pt(15, 0, 3, "L'érosion les ramène en surface.")]), ["pattison"])],
    },
    hyalophane: {
      forme: FELD + ` La hyalophane est intermédiaire entre l'orthose et la celsiane : baryum et potassium se partagent les cavités.`,
      intro: `La hyalophane cristallise dans les dolomies et les gisements de manganèse riches en baryum, métamorphisés.`,
      scenarios: [s("Dans une dolomie métamorphique", `Prismes limpides de Binn (Valais) et de Busovača (Bosnie).`, RARE("composition rare, plusieurs voies de formation."), [SRC.deer])],
    },
    buddingtonite: {
      sansForme: SF("la buddingtonite forme des grains microscopiques."),
      forme: FELD + ` L'ammonium (NH₄⁺), de la taille du potassium, occupe ses cavités.`,
      intro: `La buddingtonite est un feldspath à ammonium : l'azote vient de la matière organique.`,
      scenarios: [s("Altération hydrothermale", `Décrite en 1964 à la mine de mercure de Sulphur Bank (Californie) : des eaux chaudes chargées
        d'ammonium, venu de sédiments organiques, remplacent les feldspaths des roches volcaniques. Repérée par satellite dans les champs
        géothermaux (son spectre infrarouge est caractéristique).`, RARE("altération par des eaux chaudes chargées d'ammonium."), [SRC.deer])],
    },

    // ═══════════ plagioclases ═══════════
    plagioclases: {
      forme: PLAG,
      intro: `Les plagioclases sont les minéraux les plus abondants de la croûte. Les premiers formés dans un magma sont calciques ; à mesure
        qu'il refroidit, ils s'enrichissent en sodium : un même cristal est souvent zoné.`,
      scenarios: [
        s("Dans un magma basaltique", `Le plagioclase calcique (labradorite, bytownite) cristallise avec le pyroxène, vers 1 150–1 250 °C.`, BASALTE("Le plagioclase", 1200), ["hirschmann", SRC.smith]),
        s("Dans un magma granitique", `L'oligoclase et l'andésine cristallisent avant le quartz.`, GRANITE("Le plagioclase sodique", 760), ["tuttle"]),
      ],
    },
    albite: {
      forme: PLAG + ` L'albite est le pôle sodique : NaAlSi₃O₈.`,
      intro: `L'albite est le plagioclase des granites, des pegmatites et surtout du métamorphisme de basse température : c'est le feldspath
        des schistes verts.`,
      scenarios: [
        s("Dans un basalte chauffé avec de l'eau de mer", `Au fond de l'océan, l'eau de mer apporte du sodium aux basaltes : leur plagioclase
          calcique devient albite (spilites).`, meta([pt(10, 0, 1, "Un basalte se forme au fond de l'océan."),
          pt(350, 0.3, 2, "Chauffé avec l'eau de mer, son plagioclase devient albite.", { bande: "albitisation" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"]),
        s("Dans une pegmatite", `La cleavelandite, albite en lames blanches, avec la tourmaline et le lépidolite.`, { cond: false, sansDiagramme: PEG }, [SRC.london]),
      ],
    },
    oligoclase: {
      forme: PLAG + ` L'oligoclase contient 10 à 30 % d'anorthite.`,
      intro: `L'oligoclase est le plagioclase des granites et des gneiss.`,
      scenarios: [s("Dans un granite", `Il cristallise avant le feldspath potassique et le quartz.`, GRANITE("L'oligoclase", 760), ["tuttle", SRC.smith])],
    },
    andesine: {
      forme: PLAG + ` L'andésine contient 30 à 50 % d'anorthite.`,
      intro: `L'andésine est le plagioclase des andésites (dont elle tient son nom, les Andes) et des diorites.`,
      scenarios: [s("Dans un magma d'andésite", `Phénocristaux zonés des laves des volcans de subduction.`, LAVE("L'andésine", 1050, 980, "Un magma d'andésite, né au-dessus d'une subduction, s'accumule sous le volcan."), [SRC.smith])],
    },
    labradorite: {
      forme: PLAG + ` La labradorite contient 50 à 70 % d'anorthite. Refroidie lentement, elle se dédouble en lamelles de compositions
        voisines, épaisses de 100 à 300 nm : elles renvoient la lumière en reflets bleus et verts (labradorescence).`,
      intro: `La labradorite est le plagioclase des basaltes, des gabbros et des anorthosites (Labrador, Finlande, Madagascar).`,
      scenarios: [s("Dans un magma basaltique", `Elle cristallise tôt, avec l'olivine et le pyroxène.`, BASALTE("La labradorite", 1200), ["hirschmann", SRC.smith])],
    },
    bytownite: {
      forme: PLAG + ` La bytownite contient 70 à 90 % d'anorthite.`,
      intro: `La bytownite est le plagioclase des gabbros et des anorthosites ; nommée d'après Bytown, l'ancien nom d'Ottawa.`,
      scenarios: [s("Dans un gabbro", `Cristallisée tôt dans le magma basaltique, elle s'accumule au fond de la chambre.`, BASALTE("La bytownite", 1230), ["hirschmann", SRC.smith])],
    },
    anorthite: {
      forme: PLAG + ` L'anorthite est le pôle calcique : CaAl₂Si₂O₈, Al et Si strictement alternés (maille c doublée).`,
      intro: `L'anorthite pure est rare sur Terre (skarns, blocs du Vésuve) ; elle forme en revanche les hautes terres blanches de la Lune.`,
      scenarios: [
        s("Dans un magma basaltique très calcique", `Les premiers plagioclases d'un basalte d'arc riche en eau (Miyake-jima, Japon).`, BASALTE("L'anorthite", 1250), ["hirschmann"]),
        s("Sur la Lune", `L'océan de magma lunaire a cristallisé il y a ≈ 4,4 milliards d'années ; l'anorthite, plus légère, a flotté et formé
          les anorthosites des hautes terres.`, RARE("cristallisation d'un océan de magma, hors de l'échelle de la croûte terrestre.")),
      ],
    },

    // ═══════════ feldspathoïdes ═══════════
    nepheline: {
      forme: `La charpente de la tridymite, où l'aluminium remplace la moitié du silicium ; Na⁺ et K⁺ logent dans les cavités. Pauvre en
        silice, la néphéline ne peut pas coexister avec le quartz : elle réagirait avec lui pour donner de l'albite.`,
      intro: `La néphéline cristallise dans les magmas pauvres en silice et riches en sodium (phonolites, syénites néphéliniques) ; dans
        l'acide, elle se trouble, d'où son nom (grec <i>nephele</i>, « nuage »).`,
      scenarios: [s("Dans un magma alcalin", `Un manteau qui fond très peu donne un liquide pauvre en silice et riche en alcalins ; la néphéline
        y cristallise avec le feldspath alcalin (phonolites du Velay et du Mézenc).`, magma("manteau", [pt(1300, 2.5, 1, "Le manteau fond à moins de 5 % : le liquide est pauvre en silice et riche en alcalins."),
          pt(1100, 0.3, 2, "Dans une chambre peu profonde, le liquide évolue ; la néphéline cristallise.", { bande: "cristallisation" }), pt(950, 0, 3, "Il s'épanche en phonolite ou fige en syénite.")]), ["hirschmann", SRC.deer])],
    },
    leucite: {
      forme: `Une charpente de tétraèdres percée de canaux où loge le potassium, comme dans l'analcime. Cubique au-dessus de ≈ 600 °C, elle se
        déforme en refroidissant : la forme cubique reste, la maille devient quadratique et le cristal se remplit de macles fines.`,
      intro: `La leucite cristallise dans les laves riches en potassium et pauvres en silice ; elle n'existe que dans les laves (à haute
        pression ou lentement refroidie, elle n'est pas stable).`,
      scenarios: [s("Dans une lave potassique", `Les « grenats blancs » du Vésuve et du Latium. Dans les roches anciennes, elle est souvent
        remplacée par un mélange de feldspath potassique et de néphéline (pseudoleucite).`, magma("manteau", [pt(1300, 2.5, 1, "Un manteau enrichi en potassium fond très peu."),
          pt(1150, 0.1, 2, "Le magma remonte vite ; près de la surface, la leucite cristallise.", { bande: "cristallisation" }), pt(1050, 0, 3, "La lave se fige avec ses trapézoèdres blancs.")]), ["hirschmann", SRC.carmichael])],
    },
    kalsilite: {
      sansForme: SF("la kalsilite forme des grains et des intercroissances avec la néphéline."),
      forme: `La charpente de la tridymite, Al et Si alternés, potassium dans les canaux : le minéral le plus pauvre en silice des laves
        potassiques.`,
      intro: `La kalsilite cristallise dans des laves rares, très riches en potassium et très pauvres en silice.`,
      scenarios: [s("Dans une lave ultrapotassique", `Décrite dans les laves de Mafuru (Ouganda), avec les kamafugites du rift africain ; aussi
        au Latium (San Venanzo).`, RARE("laves rarissimes.")),
      ],
    },
    sodalite: {
      forme: SODA + ` Dans la sodalite, chaque cage contient un ion chlorure entouré de quatre sodiums.`,
      intro: `La sodalite cristallise dans les magmas sodiques riches en chlore et pauvres en silice.`,
      scenarios: [s("Dans une syénite néphélinique", `Masses bleues des syénites de Bancroft (Ontario) et d'Ilímaussaq (Groenland).`,
        magma("manteau", [pt(1300, 2.5, 1, "Le manteau fond très peu : le liquide est pauvre en silice, riche en sodium et en chlore."),
          pt(950, 0.2, 2, "Dans la chambre, il évolue lentement ; la sodalite cristallise avec la néphéline.", { bande: "cristallisation" })]), ["hirschmann", SRC.deer])],
    },
    hauyne: {
      forme: SODA + ` Dans l'haüyne, la cage contient un sulfate SO₄²⁻, avec du sodium et du calcium.`,
      intro: `L'haüyne cristallise dans les laves alcalines riches en soufre ; elle est dédiée à René Just Haüy.`,
      scenarios: [s("Dans une lave alcaline", `Phonolites et téphrites de l'Eifel, du Vésuve et du Latium.`, LAVE("L'haüyne", 1050, 980), [SRC.deer])],
    },
    noseane: {
      forme: SODA + ` Dans la noséane, la cage contient un sulfate et de l'eau, avec du sodium seul.`,
      intro: `La noséane cristallise dans les phonolites riches en soufre.`,
      scenarios: [s("Dans une phonolite", `Phonolites du lac de Laach (Eifel) ; dédiée au minéralogiste allemand Karl Wilhelm Nose.`, LAVE("La noséane", 1000, 930), [SRC.deer])],
    },
    lazurite: {
      forme: SODA + ` La lazurite contient des sulfates et des ions S₃⁻, trois atomes de soufre portant une charge : ils absorbent le jaune
        et l'orange, d'où le bleu intense.`,
      intro: `La lazurite est le minéral bleu du lapis-lazuli, broyé pendant des siècles pour l'outremer des peintres.`,
      scenarios: [s("Dans un marbre au contact d'un granite", `À Sar-e-Sang (Badakhshan, Afghanistan), exploité depuis plus de 6 000 ans,
        des fluides venus d'un granite ont apporté sodium et silice à un marbre riche en soufre.`, { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(150, 0.15, 1, "Un calcaire riche en soufre (évaporites) repose près d'un granite."),
          pt(600, 0.3, 2, "Chauffé et traversé par les fluides du granite, il devient marbre ; la lazurite y cristallise.", { bande: "lapis" }),
          pt(15, 0, 3, "L'érosion met le gisement à jour.")], note: "Chemin schématique." }, ["tuttle", SRC.deer])],
    },
    cancrinite: {
      sansForme: SF("la cancrinite forme surtout des masses et des grains."),
      forme: CANC + ` Dans la cancrinite, les canaux contiennent des carbonates, du sodium et du calcium.`,
      intro: `La cancrinite cristallise dans les syénites néphéliniques, souvent aux dépens de la néphéline ; dédiée au ministre russe Georg
        Cancrin.`,
      scenarios: [s("Dans une syénite néphélinique", `Kola, Oural, Ontario : en fin de cristallisation, les fluides riches en CO₂ transforment
        la néphéline en cancrinite.`, RARE("transformation tardive par les fluides du magma."), [SRC.deer])],
    },
    davyne: {
      forme: CANC + ` Dans la davyne, les canaux contiennent des chaînes calcium–chlore.`,
      intro: `La davyne a été décrite dans les blocs rejetés par la Somma (Vésuve) ; dédiée au chimiste Humphry Davy.`,
      scenarios: [s("Dans un bloc rejeté par un volcan", `Calcaires arrachés aux parois de la chambre magmatique et transformés par la chaleur et
        les gaz avant d'être projetés.`, RARE("métamorphisme de très haute température dans les parois d'une chambre magmatique."), [SRC.deer])],
    },
    vishnevite: {
      sansForme: SF("la vishnévite forme des masses et des grains."),
      forme: CANC + ` Dans la vishnévite, les canaux contiennent des sulfates et de l'eau.`,
      intro: `La vishnévite a été décrite dans les syénites néphéliniques des monts Vishnevye (Oural).`,
      scenarios: [s("Dans une syénite néphélinique", `Comme la cancrinite, en fin de cristallisation, quand les fluides sont riches en soufre.`, RARE(), [SRC.deer])],
    },
    afghanite: {
      sansForme: SF("l'afghanite forme des grains dans le lapis-lazuli."),
      forme: CANC + ` L'afghanite empile ses anneaux sur huit couches : cages de sodalite et de cancrinite alternées.`,
      intro: `L'afghanite a été décrite en 1968 dans le lapis-lazuli de Sar-e-Sang (Afghanistan).`,
      scenarios: [s("Dans le lapis-lazuli", `Avec la lazurite, dans les marbres de contact.`, RARE("voir la fiche de la lazurite."), [SRC.deer])],
    },
    tugtupite: {
      sansForme: SF("la tugtupite forme des masses."),
      forme: SODA + ` Dans la tugtupite, le béryllium et l'aluminium remplacent une partie du silicium, de façon ordonnée.`,
      intro: `La tugtupite, rose à rouge, vient d'Ilímaussaq (Groenland) : son nom groenlandais signifie « sang de renne ». Elle rougit au
        soleil et pâlit dans le noir.`,
      scenarios: [s("Dans une pegmatite alcaline", `Veines hydrothermales tardives des syénites d'Ilímaussaq et du mont Saint-Hilaire (Québec).`, { cond: false, sansDiagramme: PEG }, [SRC.deer])],
    },

    // ═══════════ scapolites ═══════════
    marialite: {
      forme: SCAP + ` La marialite est le pôle sodique et chloré.`,
      intro: `La marialite naît quand des fluides salés traversent des roches chaudes : elle remplace souvent le plagioclase.`,
      scenarios: [s("Métasomatose par des saumures", `Dans les marbres et les roches basiques au contact d'évaporites, ou traversées par des fluides
        salés (Pyrénées, Ariège).`, meta([pt(15, 0, 1, "Une roche à plagioclase côtoie des évaporites."), pt(500, 0.4, 2, "Chauffée, elle est traversée par des saumures : le plagioclase devient scapolite.", { bande: "scapolite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.deer])],
    },
    meionite: {
      forme: SCAP + ` La méionite est le pôle calcique et carbonaté.`,
      intro: `La méionite cristallise dans les marbres et les granulites, et dans les blocs rejetés par le Vésuve.`,
      scenarios: [s("Dans un marbre de contact", `Un calcaire impur chauffé par un magma.`, { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(150, 0.15, 1, "Un calcaire impur repose près d'un magma."), pt(700, 0.2, 2, "Chauffé, il recristallise : la méionite apparaît.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion le met à jour.")], note: "Chemin schématique." }, ["tuttle", SRC.deer])],
    },
    silvialite: {
      sansForme: SF("la silvialite forme des grains dans les granulites."),
      forme: SCAP + ` La silvialite est la scapolite à sulfate.`,
      intro: `La silvialite, reconnue en 1999, se trouve dans les granulites et les enclaves arrachées à la base de la croûte.`,
      scenarios: [s("Dans une granulite profonde", `Enclaves de la croûte inférieure remontées par des laves (Queensland, Australie).`, RARE("enclaves de la base de la croûte."), [SRC.deer])],
    },

    // ═══════════ autres tectosilicates ═══════════
    danburite: {
      forme: `Paires de tétraèdres Si₂O₇ et B₂O₇ reliées en charpente, le calcium dans les cavités : la charpente de l'anorthite, où le bore
        remplace l'aluminium.`,
      intro: `La danburite cristallise là où les fluides apportent du bore à des roches calcaires.`,
      scenarios: [s("Dans un skarn ou un filon", `Charcas (Mexique), Birmanie, Madagascar : des fluides chargés de bore, venus d'un granite,
        traversent une dolomie ou un calcaire.`, { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(150, 0.12, 1, "Un calcaire repose près d'un granite."), pt(450, 0.12, 2, "Les fluides du granite apportent du bore : la danburite cristallise dans les fissures.", { bande: "skarn" }),
          pt(15, 0, 3, "L'érosion met le gisement à jour.")], note: "Chemin schématique." }, ["tuttle", SRC.deer])],
    },
    petalite: {
      sansForme: SF("la pétalite forme surtout des masses clivables ; les cristaux sont rares."),
      forme: `Des feuillets plissés de tétraèdres SiO₄ reliés par des tétraèdres de lithium et d'aluminium : une charpente qui se clive selon
        les feuillets (grec <i>petalon</i>, « feuille »).`,
      intro: `C'est dans la pétalite d'Utö (Suède) que Johan August Arfwedson découvrit le lithium en 1817.`,
      scenarios: [s("Dans une pegmatite à lithium", `Elle cristallise à pression assez basse ; plus profond, le même lithium donne du spodumène.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    leifite: {
      sansForme: SF("la leifite forme des aiguilles fines, mal décrites."),
      forme: `Une charpente de tétraèdres de silicium, d'aluminium et de béryllium, percée de canaux où logent le sodium et l'eau.`,
      intro: `La leifite, dédiée à Leif Erikson, a été décrite à Narsarsuk (Groenland).`,
      scenarios: [s("Dans une pegmatite alcaline", `Groenland, Kola, mont Saint-Hilaire.`, { cond: false, sansDiagramme: PEG }, [SRC.deer])],
    },

    // ═══════════ zéolithes fibreuses ═══════════
    natrolite: {
      forme: ZEO + ` La natrolite enchaîne des groupes de cinq tétraèdres le long de c : la charpente est plus solide dans cette direction,
        d'où les aiguilles.`,
      intro: `La natrolite tapisse de houppes d'aiguilles les bulles des basaltes et les cavités des syénites néphéliniques.`,
      scenarios: [s("Dans une bulle de basalte", `L'eau chaude qui circule dans la lave refroidie dissout le verre et dépose les zéolithes dans
        les bulles ; en Islande, elles se rangent par zones de température (chabazite et thomsonite au-dessous de ≈ 70 °C, mésolite et
        scolécite au-dessus, puis stilbite et heulandite, puis laumontite).`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann, SRC.gottardi])],
    },
    mesolite: {
      sansForme: SF("la mésolite forme des fibres capillaires en touffes."),
      forme: ZEO + ` La mésolite a la charpente de la natrolite, avec alternativement du sodium et du calcium dans les canaux : elle est
        « au milieu » (grec <i>mesos</i>) entre natrolite et scolécite.`,
      intro: `La mésolite forme des touffes de fibres blanches dans les bulles des basaltes (Deccan, Islande, Féroé).`,
      scenarios: [s("Dans une bulle de basalte", `Zone de la mésolite et de la scolécite des basaltes d'Islande.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    scolecite: {
      sansForme: SF("la scolécite forme des aiguilles rayonnantes, maclées."),
      forme: ZEO + ` La scolécite a la charpente de la natrolite, avec du calcium.`,
      intro: `La scolécite forme des gerbes d'aiguilles dans les basaltes du Deccan ; chauffée, elle se tortille comme un ver (grec
        <i>skolex</i>).`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes du Deccan (Inde) et d'Islande.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    thomsonite: {
      sansForme: SF("la thomsonite forme des sphérules rayonnantes."),
      forme: ZEO + ` La thomsonite relie autrement les chaînes de la natrolite ; aluminium et silicium y alternent strictement.`,
      intro: `La thomsonite, dédiée au chimiste écossais Thomas Thomson, forme des sphérules rayonnantes dans les basaltes.`,
      scenarios: [s("Dans une bulle de basalte", `Zone de la chabazite et de la thomsonite, la plus froide (au-dessous de ≈ 70 °C).`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    gonnardite: {
      sansForme: SF("la gonnardite forme des sphérules fibreuses."),
      forme: ZEO + ` La gonnardite a la charpente de la natrolite, avec aluminium et silicium désordonnés.`,
      intro: `La gonnardite a été décrite en 1896 à la Chaux de Bergonne (Puy-de-Dôme) et dédiée au minéralogiste lyonnais Ferdinand Gonnard.`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes d'Auvergne, du Kaiserstuhl, de Bohême.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    edingtonite: {
      sansForme: SF("l'édingtonite forme de petits cristaux pyramidaux, rares."),
      forme: ZEO + ` L'édingtonite relie les chaînes de la natrolite en charpente quadratique, avec du baryum.`,
      intro: `L'édingtonite, zéolithe à baryum, a été décrite près de Glasgow (Écosse).`,
      scenarios: [s("Dans une veine hydrothermale", `Avec la barytine et l'harmotome, dans des filons riches en baryum.`, RARE(), [SRC.gottardi])],
    },

    // ═══════════ groupe de la chabazite ═══════════
    chabazite: {
      forme: ZEO + ` La chabazite empile des doubles anneaux de six tétraèdres : de grandes cages (≈ 10 Å) que relient des fenêtres de huit
        tétraèdres. La maille rhomboédrique est presque cubique, d'où des cristaux qu'on prend pour des cubes.`,
      intro: `La chabazite est l'une des zéolithes les plus communes des basaltes ; on la trouve aussi dans les tufs altérés.`,
      scenarios: [s("Dans une bulle de basalte", `Elle se dépose à froid, au-dessous de ≈ 70 °C : c'est la zéolithe des laves peu enfouies.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann, SRC.gottardi])],
    },
    levyne: {
      forme: ZEO + ` La lévyne empile ses anneaux de six autrement que la chabazite : cages aplaties, d'où les tablettes.`,
      intro: `La lévyne forme des tablettes minces dans les basaltes, souvent accompagnée d'offrétite.`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes d'Islande, d'Irlande du Nord, d'Écosse.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    erionite: {
      sansForme: SF("l'érionite forme des fibres fines comme de la laine."),
      forme: ZEO + ` L'érionite empile des cages de cancrinite et des doubles anneaux de six le long de c : d'où des fibres.`,
      intro: `L'érionite (grec « laine ») forme des fibres dans les tufs volcaniques altérés. Inhalées, elles provoquent le mésothéliome,
        comme l'amiante, mais plus souvent : en Cappadoce, les villages bâtis en tuf à érionite en ont été décimés.`,
      scenarios: [s("Dans un tuf altéré", `Le verre volcanique d'un tuf réagit avec l'eau d'un lac salé et alcalin, ou avec l'eau souterraine,
        et se transforme en zéolithes (Cappadoce, Nevada, Oregon).`, RARE("transformation du verre à basse température, dans un lac alcalin."), [SRC.iijima])],
    },
    faujasite: {
      forme: ZEO + ` La faujasite relie des cages de sodalite par des doubles anneaux de six, comme les atomes du diamant : les « supercages »
        de 13 Å sont les plus grandes des zéolithes naturelles. Sa version de synthèse (zéolithe Y) sert au raffinage du pétrole.`,
      intro: `La faujasite, rare dans la nature, forme de petits octaèdres dans les basaltes du Kaiserstuhl.`,
      scenarios: [s("Dans une bulle de basalte", `Kaiserstuhl (Allemagne), Sasbach.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },

    // ═══════════ groupe heulandite–stilbite ═══════════
    heulandite: {
      sansForme: SF("les cristaux en « cercueil » de la heulandite sont décrits dans une autre maille que celle de la structure."),
      forme: ZEO + ` La heulandite a des couches denses de tétraèdres parallèles à (010), reliées par peu de liaisons : le clivage {010} est
        parfait et nacré.`,
      intro: `La heulandite, dédiée au collectionneur John Henry Heuland, forme des tablettes nacrées dans les basaltes.`,
      scenarios: [s("Dans une bulle de basalte", `Zone de la stilbite et de la heulandite des basaltes d'Islande, plus chaude que celle de la
        chabazite ; basaltes du Deccan, des Féroé.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    clinoptilolite: {
      sansForme: SF("la clinoptilolite forme des cristaux microscopiques dans les tufs."),
      forme: ZEO + ` La clinoptilolite a la charpente de la heulandite, plus riche en silicium : elle supporte mieux la chaleur.`,
      intro: `La clinoptilolite est la zéolithe la plus abondante de la Terre : elle remplace le verre de tufs volcaniques entiers, exploités
        pour la litière des chats, le traitement des eaux et l'agriculture.`,
      scenarios: [s("Dans un tuf enfoui", `En s'enfouissant, un tuf se transforme par zones : vers 40–55 °C, son verre devient clinoptilolite ;
        vers 85–90 °C, la clinoptilolite devient analcime ; vers 120 °C, l'analcime devient albite (Iijima 1980).`, meta([
          pt(15, 0, 1, "Des cendres volcaniques se déposent dans un bassin."), pt(50, 0.04, 2, "Enfouies à ≈ 1,5 km, leur verre devient clinoptilolite.", { bande: "clinoptilolite" }),
          pt(15, 0, 3, "Le bassin se soulève et l'érosion ramène le tuf en surface.")], { echelle: "fond" }), [SRC.iijima])],
    },
    stilbite: {
      sansForme: SF("la stilbite forme des gerbes de tablettes, rarement des cristaux isolés."),
      forme: ZEO + ` La stilbite a des couches de tétraèdres parallèles à (010) : clivage {010} parfait, éclat nacré (grec <i>stilbein</i>,
        « briller »).`,
      intro: `La stilbite forme des gerbes caractéristiques dans les basaltes du Deccan, souvent posées sur l'apophyllite.`,
      scenarios: [s("Dans une bulle de basalte", `Zone de la stilbite et de la heulandite, au-dessus de ≈ 100 °C.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    stellerite: {
      sansForme: SF("la stellérite forme des gerbes et des tablettes."),
      forme: ZEO + ` La stellérite a la charpente de la stilbite, sans sodium.`,
      intro: `La stellérite, dédiée au naturaliste Georg Steller, a été décrite aux îles du Commandeur (Russie).`,
      scenarios: [s("Dans une bulle de lave", `Basaltes et andésites altérés.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    barrerite: {
      sansForme: SF("la barrérite forme des tablettes, rares."),
      forme: ZEO + ` La barrérite a la charpente de la stilbite, sodique.`,
      intro: `La barrérite, dédiée au chimiste des zéolithes Richard Barrer, a été décrite au cap Pula (Sardaigne).`,
      scenarios: [s("Dans une lave altérée", `Andésites altérées de Sardaigne.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    brewsterite: {
      sansForme: SF("la brewstérite forme des prismes à secteurs de symétries différentes."),
      forme: ZEO + ` Dans la brewstérite, chaque strontium est entouré d'oxygènes de la charpente et de cinq molécules d'eau.`,
      intro: `La brewstérite, zéolithe au strontium, a été décrite à Strontian (Écosse), le village qui a donné son nom au strontium.`,
      scenarios: [s("Dans un filon", `Filons de plomb de Strontian, avec la barytine et la calcite.`, RARE(), [SRC.gottardi])],
    },
    epistilbite: {
      sansForme: SF("l'épistilbite forme de petits prismes maclés."),
      forme: ZEO + ` L'épistilbite a des canaux de dix et huit tétraèdres, avec du calcium.`,
      intro: `L'épistilbite forme de petits prismes dans les basaltes (Islande, Féroé).`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes d'Islande (Teigarhorn).`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },

    // ═══════════ autres zéolithes ═══════════
    analcime: {
      forme: ZEO + ` L'analcime a la charpente de la leucite : un sodium et une molécule d'eau par canal. Frottée, elle ne se charge presque pas
        d'électricité (grec <i>analkis</i>, « sans force »).`,
      intro: `L'analcime naît dans les bulles des basaltes, dans les tufs enfouis et dans les sédiments des lacs salés.`,
      scenarios: [
        s("Dans un tuf enfoui", `Vers 85–90 °C, la clinoptilolite d'un tuf enfoui devient analcime (Iijima 1980).`, meta([
          pt(15, 0, 1, "Des cendres volcaniques se déposent dans un bassin."), pt(90, 0.08, 2, "Enfouies à ≈ 3 km, leur clinoptilolite devient analcime.", { bande: "analcime" }),
          pt(15, 0, 3, "L'érosion ramène le tuf en surface.")], { echelle: "fond" }), [SRC.iijima]),
        s("Dans une bulle de basalte", `Trapézoèdres limpides des îles Cyclopes (Sicile).`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi]),
      ],
    },
    laumontite: {
      forme: ZEO + ` La laumontite a des canaux de dix tétraèdres le long de c. Elle perd de l'eau dès que l'air est sec : on la conserve
        humide pour qu'elle ne s'effrite pas.`,
      intro: `La laumontite marque le métamorphisme le plus faible des roches volcaniques et des grès riches en feldspath : le « faciès des
        zéolithes ».`,
      scenarios: [s("Enfouissement d'un grès ou d'une lave", `Vers 150–250 °C, le plagioclase des grès volcaniques réagit avec l'eau et donne
        de la laumontite (Nouvelle-Zélande, Southland : Coombs 1954).`, meta([
          pt(15, 0, 1, "Des grès riches en débris volcaniques se déposent."), pt(200, 0.2, 2, "Enfouis à 6–8 km, ils recristallisent : la laumontite apparaît.", { bande: "zéolithes" }),
          pt(15, 0, 3, "L'érosion les ramène en surface.")]), ["pattison", SRC.gottardi])],
    },
    phillipsite: {
      sansForme: SF("la phillipsite forme des macles en croix, à plusieurs individus."),
      forme: ZEO + ` La phillipsite a des doubles chaînes de tétraèdres reliées en charpente, avec des canaux qui se croisent.`,
      intro: `La phillipsite est la zéolithe la plus courante des sédiments des grands fonds océaniques, où elle remplace la cendre volcanique.`,
      scenarios: [
        s("Au fond de l'océan", `Sur les fonds du Pacifique, loin des continents, les cendres s'altèrent lentement au contact de l'eau de mer
          froide (≈ 2 °C) et donnent de la phillipsite.`, RARE("altération lente, à la température du fond de l'océan."), [SRC.iijima]),
        s("Dans une bulle de basalte", `Basaltes du Vésuve, de Sicile, d'Auvergne.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi]),
      ],
    },
    harmotome: {
      sansForme: SF("l'harmotome forme des macles en croix."),
      forme: ZEO + ` L'harmotome a la charpente de la phillipsite, avec du baryum.`,
      intro: `L'harmotome cristallise dans les filons à barytine et galène.`,
      scenarios: [s("Dans un filon de plomb", `Strontian (Écosse), Andreasberg (Harz).`, RARE(), [SRC.gottardi])],
    },
    amicite: {
      sansForme: SF("l'amicite forme de petits cristaux pseudo-quadratiques."),
      forme: ZEO + ` L'amicite a la charpente de la gismondine, aluminium et silicium strictement alternés.`,
      intro: `L'amicite, dédiée au physicien Giovanni Battista Amici, a été décrite à Höwenegg (Allemagne).`,
      scenarios: [s("Dans une lave altérée", `Néphélinites du Hegau.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    pollucite: {
      sansForme: SF("la pollucite forme surtout des masses."),
      forme: ZEO + ` La pollucite a la charpente de l'analcime ; le césium, très gros, prend la place de la molécule d'eau.`,
      intro: `La pollucite est le minerai du césium (Bernic Lake, Canada) ; dédiée à Pollux, comme la castorite (pétalite) l'était à Castor
        — les deux ont été trouvées ensemble à l'île d'Elbe.`,
      scenarios: [s("Dans une pegmatite à lithium et césium", `Le césium, trop gros pour les autres minéraux, se concentre dans le dernier
        liquide de la pegmatite.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    hsianghualite: {
      sansForme: SF("la hsianghualite forme des grains."),
      forme: `Une charpente cubique de tétraèdres de silicium, de béryllium et de lithium, à la manière de l'analcime ; calcium et fluor dans
        les cavités.`,
      intro: `La hsianghualite a été décrite en 1958 à Xianghualing (Hunan, Chine), dans des skarns à béryllium.`,
      scenarios: [s("Dans un skarn à béryllium", `Calcaires transformés par les fluides d'un granite riche en lithium, béryllium et fluor.`, RARE("skarn à éléments rares."), [SRC.deer])],
    },
  });
})();
