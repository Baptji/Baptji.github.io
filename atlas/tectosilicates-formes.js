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
  const MACLE_AB = "Soudés sur le plan {010}, deux individus symétriques l'un de l'autre laissent voir un angle rentrant sur la face c. Répétée des dizaines de fois, la macle strie les faces de fines lignes parallèles : c'est ainsi qu'on reconnaît un plagioclase à la loupe.";
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
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde, la plaquette", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 4.0 },
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 4.0 }],
        note: "La tridymite forme de fines plaquettes hexagonales, souvent groupées par trois (du grec <i>tridymos</i>, « triple »). Sa maille, monoclinique, est presque hexagonale (b ≈ a√3) ; la plaquette conserve la forme héritée de la tridymite de haute température. Classe m simplifiée en 2/m." }],
      clivages: [],
    },
    melanophlogite: {
      nom: "Mélanophlogite", couleur: "#eeeee6", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "P",
      maille: CUB(13.399), mailleSource: "cod9010371",
      facies: [{ nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
        note: "Sur le soufre des gisements de Sicile, on trouve de petits cubes incolores, parfois groupés en sphérules. Chauffée, la matière organique enfermée dans leurs cages noircit, d'où le nom (grec « qui noircit au feu »)." }],
      clivages: [],
    },

    // ── feldspaths alcalins ──
    microcline: (() => { const f = FTRI("Microcline", "#9fd2c4", [8.5714, 12.9646, 7.2217, 90.6, 115.9, 87.7], "C", "cod9004191", [-2, 0, 1],
      "Dans les pegmatites, ses prismes trapus atteignent parfois plusieurs mètres de long et reproduisent la forme de l'orthose. L'amazonite, de teinte verte, en est une variété (plomb et eau). Ses macles en quadrillage ne se voient qu'au microscope."); return f; })(),
    sanidine: FMONO("Sanidine", "#f1ece2", [8.539, 13.015, 7.179, 90, 115.99, 90], "cod9000303",
      "Ces tablettes aplaties sur {010} (du grec <i>sanis</i>, « planche ») sont limpides ; elles forment les phénocristaux des trachytes et des rhyolites, où elles sont souvent maclées selon Carlsbad.",
      { facies: [
        { nom: "Tablette", formes: [
          { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 0.7 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "x", hkl: [-2, 0, 1], nom: "face oblique", d: 1.8 }],
          note: "Limpides, des tablettes aplaties sur {010} (du grec <i>sanis</i>, « planche ») : ce sont les phénocristaux typiques des trachytes et des rhyolites." },
        { nom: "Macle de Carlsbad", azimut: 78, elevation: 12, macle: { axe: [0, 0, 1], compo: [0, 1, 0] }, formes: [
          { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 0.7 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 },
          { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "x", hkl: [-2, 0, 1], nom: "face oblique", d: 1.8 }],
          note: "Deux individus, tournés de 180° autour de c, se soudent sur {010} : c'est la macle la plus courante chez les sanidines des trachytes d'Auvergne." }] }),
    anorthose: FTRI("Anorthose", "#e4ddd0", [8.29, 12.966, 7.151, 91.18, 116.31, 90.14], "C", "cod9000855", [-2, 0, 1],
      "Prismes trapus, à section losangique : ils forment les phénocristaux des « porphyres en losanges » d'Oslo et des trachytes sodiques."),
    celsiane: FMONO("Celsiane", "#f0efe9", [8.622, 13.078, 14.411, 90, 115.1, 90], "cod9000508",
      "La maille c, doublée, impose d'écrire {-101} la face oblique que les ouvrages notent x{-201} ; les prismes restent courts, comme ceux de l'orthose.",
      { reseau: "I", facies: [{ nom: "Prisme", formes: [
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 1.02 },
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 }, { sym: "x", hkl: [-1, 0, 1], nom: "face oblique", d: 1.8 }],
        note: "La maille c, doublée, impose d'écrire {-101} la face oblique que les ouvrages notent x{-201} ; les prismes restent courts, comme ceux de l'orthose." }] }),
    hyalophane: FMONO("Hyalophane", "#eceae0", [8.544, 13.03, 7.195, 90, 115.68, 90], "cod9000868",
      "Limpides comme du verre (du grec <i>hyalos</i>), ces prismes ont la forme de l'orthose : on les trouve dans les dolomies de Binn (Valais)."),

    // ── plagioclases ──
    albite: FTRI("Albite", "#f4f4f0", [8.142, 12.785, 7.159, 94.19, 116.61, 87.68], "C", "cod9000783", [-2, 0, 1],
      "Tablettes aplaties sur {010}, de couleur blanche (du latin <i>albus</i>) ; la cleavelandite des pegmatites en constitue une variété en lames.", MACLE_AB),
    oligoclase: FTRI("Oligoclase", "#ece6d8", [8.154, 12.823, 7.139, 94.06, 116.5, 88.59], "C", "cod9011422", [-2, 0, 1],
      "Rares, les cristaux rappellent l'albite : la « pierre de soleil » de Tvedestrand (Norvège) est un oligoclase qui renferme des paillettes d'hématite.", MACLE_AB),
    plagioclases: FTRI("Plagioclase", "#e3e0d8", [8.179, 12.88, 7.112, 93.44, 116.21, 90.23], "C", "cod9001030", [-2, 0, 1],
      "Tablettes aplaties sur {010}, rarement nettes : dans les roches, les plagioclases se présentent surtout sous forme de lattes et de grains (maille d'un plagioclase An48).", MACLE_AB),
    andesine: FTRI("Andésine", "#ddd8cc", [8.179, 12.88, 7.112, 93.44, 116.21, 90.23], "C", "cod9001030", [-2, 0, 1],
      "Dans les andésites et les diorites, les tablettes présentent une zonation : le cœur est plus calcique que la bordure.", MACLE_AB),
    labradorite: FTRI("Labradorite", "#7d8a92", [8.1736, 12.8736, 7.1022, 93.462, 116.054, 90.475], "C", "cod9000744", [-2, 0, 1],
      "Les cristaux sont rares ; c'est surtout sous forme de masses clivables qu'on la connaît, renvoyant des reflets bleus et verts (labradorescence).", MACLE_AB),
    bytownite: FTRI("Bytownite", "#d8d2c4", [8.188, 12.822, 14.196, 93.37, 116.04, 90.87], "P", "cod9017364", [-1, 0, 1],
      "Les gabbros et les anorthosites contiennent ces tablettes. La maille c étant doublée, la face oblique x{-201} des ouvrages s'écrit ici {-101}.", MACLE_AB),
    anorthite: FTRI("Anorthite", "#ecebe6", [8.175, 12.873, 14.17, 93.11, 115.89, 91.28], "P", "cod9001258", [-1, 0, 1],
      "Blancs et trapus, ces prismes se trouvent dans les blocs rejetés par le Vésuve et dans les basaltes du Japon (Miyake-jima). La maille c étant doublée, x{-201} des ouvrages devient {-101}.", MACLE_AB),

    // ── feldspathoïdes ──
    nepheline: {
      nom: "Néphéline", couleur: "#d9d2c3", systeme: "hexagonal", classe: "6/m", classeNom: "dipyramidale hexagonale", reseau: "P",
      maille: HEX(9.9995, 8.384), mailleSource: "cod9004729", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme court", formes: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.0 }],
        note: "Courts et gras, en prismes hexagonaux, ils se rencontrent dans les phonolites et les syénites néphéliniques ; en lame mince, leurs sections sont hexagonales ou rectangulaires. Classe polaire 6, simplifiée en 6/m." }],
      clivages: [{ hkl: [1, 0, -1, 0], qualite: "médiocre", nom: "prismatique", pas: 0.3 }],
    },
    leucite: {
      nom: "Leucite", couleur: "#f1efe8", systeme: "quadratique", classe: "4/m", classeNom: "dipyramidale quadratique", reseau: "I",
      maille: [13.09, 13.09, 13.75, 90, 90, 90], mailleSource: "cod9000485",
      facies: [{ nom: "Trapézoèdre", formes: [
        { sym: "n", hkl: [2, 1, 1], nom: "dipyramide", d: 1.0 }, { sym: "n", hkl: [1, 2, 1], nom: "dipyramide", d: 1.0 },
        { sym: "n", hkl: [1, 1, 2], nom: "dipyramide", d: 1.0 }],
        note: "Les laves du Vésuve et du Latium renferment ce « trapézoèdre » blanc à 24 faces, qui reprend la forme cubique de la leucite à haute température. En refroidissant vers 600 °C, la maille passe au système quadratique sans que la forme s'altère : trois dipyramides {211}, {121} et {112} se substituent alors à la forme cubique unique." }],
      clivages: [],
    },
    sodalite: DODECA("Sodalite", "#3d5fa6", 8.887, "-43m", "hexakistétraédrique", "cod9003318",
      "Les dodécaèdres sont rares (Vésuve) ; le plus souvent, on la voit en masses bleues. La hackmanite, variété du Groenland, rosit à la lumière puis pâlit dans l'obscurité."),
    hauyne: DODECA("Haüyne", "#2c64c8", 9.116, "-43m", "hexakistétraédrique", "cod9004232",
      "Dans les laves alcalines (Eifel, Vésuve, Latium), on trouve de petits dodécaèdres bleu vif. Elle rend hommage à René Just Haüy, fondateur de la cristallographie."),
    noseane: DODECA("Noséane", "#9a9488", 9.084, "-43m", "hexakistétraédrique", "cod9004198",
      "Dans les phonolites de l'Eifel (lac de Laach), on observe des dodécaèdres gris à brun, souvent bordés de sombre."),
    lazurite: DODECA("Lazurite", "#1f3fa0", 9.077, "23", "tétartoïdale", "cod9012653",
      "Dodécaèdres rares, pouvant atteindre quelques centimètres, à Sar-e-Sang (Afghanistan) ; le plus souvent, elle se présente en grains dans le lapis-lazuli."),
    davyne: {
      nom: "Davyne", couleur: "#e9e6dc", systeme: "hexagonal", classe: "6/m", classeNom: "dipyramidale hexagonale", reseau: "P",
      maille: HEX(12.854, 5.357), mailleSource: "cod9004215", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 2.5 }],
        note: "Dans les blocs rejetés par la Somma (Vésuve), on observe des prismes hexagonaux limpides. Leur classe polaire 6 est simplifiée en 6/m." }],
      clivages: [{ hkl: [1, 0, -1, 0], qualite: "bon", nom: "prismatique", pas: 0.3 }],
    },

    // ── scapolites ──
    marialite: SCAPO("Marialite", "#ece4cc", 12.0396, 7.5427, "cod9004437",
      "Une dipyramide coiffe des prismes carrés ; leurs faces sont souvent ternes, et les deux clivages prismatiques se croisent à 45° et 90°."),
    meionite: SCAPO("Méionite", "#e6dcc0", 12.16711, 7.57547, "cod9010507",
      "Prismes trapus, présents dans les marbres et les blocs du Vésuve ; la dipyramide est très aplatie (du grec <i>meion</i>, « moindre »)."),

    // ── autres ──
    danburite: {
      nom: "Danburite", couleur: "#f2efe2", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [8.038, 8.752, 7.73, 90, 90, 90], mailleSource: "cod9000386", azimut: 24, elevation: 14,
      facies: [{ nom: "Prisme en biseau", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "l", hkl: [1, 2, 0], nom: "prisme", d: 1.05 },
        { sym: "d", hkl: [1, 0, 1], nom: "prisme terminal (biseau)", d: 2.4 }],
        note: "Des prismes losangiques, terminés en biseau comme la topaze dont elle a l'éclat, se rencontrent à Charcas (Mexique) et en Birmanie. Son nom vient de Danbury (Connecticut)." }],
      clivages: [{ hkl: [0, 0, 1], qualite: "imparfait", nom: "{001}", pas: 0.3 }],
    },

    // ── zéolithes ──
    natrolite: {
      nom: "Natrolite", couleur: "#f4f3ee", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "F",
      maille: [18.221, 18.331, 6.536, 90, 90, 90], mailleSource: "cod9009401", azimut: 24, elevation: 14,
      facies: [{ nom: "Aiguille", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "pyramide", d: 4.0 }],
        note: "Dans les bulles des basaltes, elle forme des aiguilles à section presque carrée, terminées par une pyramide basse, disposées en houppes rayonnantes. Classe polaire mm2, simplifiée en mmm : les deux extrémités sont dessinées de manière identique." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "prismatique", pas: 0.26 }],
    },
    chabazite: {
      nom: "Chabazite", couleur: "#f1e5d6", systeme: "trigonal", classe: "-3m", classeNom: "ditrigonale scalénoédrique", reseau: "R",
      maille: HEX(13.78, 14.98), mailleSource: "cod9015939 (maille rhomboédrique a 9,39 Å, α 94,4° convertie en maille hexagonale)",
      azimut: 22, elevation: 16,
      facies: [{ nom: "Rhomboèdre", formes: [{ sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.0 }],
        note: "Rhomboèdres presque cubiques (angle de 94°), souvent confondus avec des cubes : les géodes des basaltes en sont tapissées. Ils sont fréquemment maclés par pénétration." }],
      clivages: [{ hkl: [1, 0, -1, 1], qualite: "médiocre", nom: "rhomboédrique", pas: 0.3 }],
    },
    levyne: {
      nom: "Lévyne", couleur: "#f2ede2", systeme: "trigonal", classe: "-3m", classeNom: "ditrigonale scalénoédrique", reseau: "R",
      maille: HEX(13.43259, 22.67725), mailleSource: "cod9017609", azimut: 22, elevation: 22,
      facies: [{ nom: "Tablette", formes: [
        { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.8 }],
        note: "Minces, hexagonales, ces tablettes sont biseautées par le rhomboèdre et souvent maclées ; elle rend hommage au minéralogiste Armand Lévy." }],
      clivages: [],
    },
    faujasite: {
      nom: "Faujasite", couleur: "#f6f5f0", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUB(24.74), mailleSource: "cod9000124",
      facies: [{ nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
        note: "Dans les bulles des basaltes du Kaiserstuhl (Allemagne), on trouve de petits octaèdres incolores. Elle rend hommage au géologue Barthélemy Faujas de Saint-Fond, qui décrivit les volcans du Vivarais." }],
      clivages: [{ hkl: [1, 1, 1], qualite: "bon", nom: "octaédrique", pas: 0.3 }],
    },
    analcime: {
      nom: "Analcime", couleur: "#f2efe8", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "I",
      maille: CUB(13.7065), mailleSource: "cod9004009",
      facies: [{ nom: "Trapézoèdre", formes: [{ sym: "n", hkl: [2, 1, 1], nom: "trapézoèdre", d: 1.0 }],
        note: "Des trapézoèdres à 24 faces, limpides ou blancs, tapissent les cavités des basaltes (îles Cyclopes, Sicile). Leur charpente est celle de la leucite, et leur forme aussi." }],
      clivages: [],
    },
    laumontite: {
      nom: "Laumontite", couleur: "#efe9df", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C",
      maille: [14.70542, 13.07118, 7.45156, 90, 112.121, 90], mailleSource: "cod9002889", azimut: 24, elevation: 14,
      facies: [{ nom: "Prisme", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "e", hkl: [-2, 0, 1], nom: "face terminale oblique", d: 1.8 }],
        note: "Décrite en 1785 dans la mine de plomb de Huelgoat (Finistère), cette espèce prend la forme de prismes losangiques terminés par une face oblique ; elle rend hommage à Gillet de Laumont. À l'air sec, elle perd de l'eau, blanchit et s'effrite." }],
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
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + (t || "minéral rare, qui se forme dans des conditions particulières.") });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE()), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin) => ({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." });
  const magma = (echelle, chemin, o) => Object.assign({ type: "magma", echelle, chemin, note: "Chemin schématique." }, o || {});
  const SF = (t) => "Forme non dessinée : " + t;
  const PEG = "L'atlas n'offre pas de diagramme ici : la pegmatite se forme à partir d'un liquide saturé d'eau et d'éléments rares, cas qu'une représentation du granite ne saurait traduire.";
  const BULLE = "Pour les bulles des laves refroidies, c'est l'eau chaude qui circule et dépose les zéolithes, entre ≈ 30 et 250 °C, à des pressions qu'aucun diagramme de l'atlas ne représente.";
  const FELD = `Des cavités, ménagées entre des chaînes en « vilebrequin » parallèles à a, accueillent K, Na, Ca ou Ba au sein d'une charpente de tétraèdres (Si,Al)O₄ partageant tous leurs sommets. Le clivage se produit selon deux directions de liaisons plus faibles, {001} et {010}.`;
  const PLAG = FELD + `Au sein des plagioclases, la substitution couplée Na⁺ + Si⁴⁺ ⇄ Ca²⁺ + Al³⁺ relie l'albite à l'anorthite par une succession continue de compositions. Leur maille, triclinique, présente des clivages qui se recoupent à ≈ 94°.`;
  const ZEO = `Charpentes de tétraèdres (Si,Al)O₄ traversées de canaux et de cages où l'eau circule sans entrave. Sous l'effet de la chaleur, elles restituent cette eau sans s'effondrer, avant de la reprendre à froid. Le nom grec, <i>zein</i>, « bouillir », rappelle l'effet observé au chalumeau. Les cations logés dans les canaux échangent leur place avec ceux de l'eau qui les traverse.`;
  const SODA = `Ce groupe est édifié par l'empilement cubique de cages de 24 tétraèdres (Si,Al)O₄, appelées « cages de sodalite ». Chacune loge un anion (Cl⁻, SO₄²⁻, S₃⁻…) retenu par du sodium ou du calcium.`;
  const CANC = `Le groupe de la cancrinite assemble des anneaux de six tétraèdres (Si,Al)O₄ qui délimitent de larges canaux parallèles à c, où se logent des anions et des cations.`;
  const SCAP = `Les scapolites s'organisent en colonnes d'anneaux de quatre tétraèdres parallèles à c, que d'autres liaisons rattachent en un réseau. Dans chaque vaste cavité s'insère un anion : Cl⁻ pour la marialite, CO₃²⁻ pour la méionite, SO₄²⁻ pour la silvialite, avec du Na ou du Ca pour compenser la charge.`;
  // magma basaltique / granitique : chemins communs
  const BASALTE = (min, T) => magma("croute", [pt(1250, 0.6, 1, "Un magma basaltique remonte depuis le manteau."),
    pt(T, 0.2, 2, min + "figure parmi les premiers minéraux à cristalliser dans la chambre.", { bande: "cristallisation" }), pt(1100, 0, 3, "La lave s'épanche en surface, tandis que le magma se consolide en gabbro en profondeur.")]);
  const GRANITE = (min, T, P) => magma("croute", [pt(830, 0.8, 1, "La croûte profonde entre en fusion partielle : le liquide ainsi formé est enrichi en silice, en aluminium et en alcalins."),
    pt(800, P || 0.25, 2, "Le magma monte et s'installe."), pt(T, P || 0.2, 3, min + " cristallise lentement.", { bande: "cristallisation" })], { courbes: ["graniteEau"] });
  const LAVE = (min, T0, T, quoi) => magma("croute", [pt(T0, 0.25, 1, quoi || "Une chambre magmatique superficielle recueille un magma enrichi en alcalins."),
    pt(T, 0.1, 2, min + "cristallise dans le magma en cours d'ascension.", { bande: "cristallisation" }), pt(T - 60, 0, 3, "L'éruption solidifie brutalement la lave : les cristaux formés antérieurement subsistent sous forme de phénocristaux.")]);

  Object.assign(MIN_F, {
    // ═══════════ silice ═══════════
    calcedoine: {
      sansForme: SF("la calcédoine est constituée de fibres de quartz microscopiques, dépourvues de faces cristallines visibles."),
      forme: `Des fibres de quartz de moins d'un micromètre de large, entremêlées de moganite, croissent côte à côte depuis la paroi ; leur accumulation forme des couches mamelonnées, sans faces.`,
      intro: `Silex, agate et cornaline appartiennent à la calcédoine, silice présente dans les roches sédimentaires et dans les cavités. Elle précipite à partir d'eaux froides ou tièdes saturées au-delà de l'équilibre en silice.`,
      scenarios: [s("Le silex de la craie", `Les squelettes d'éponges et de diatomées sont constitués d'opale, qui se dissout plus aisément que le quartz. Dans la craie enfouie, l'eau interstitielle se charge de cette silice puis la redépose, d'abord sous forme d'opale CT, puis de calcédoine autour d'un débris : le rognon de silex croît ainsi par couches successives.`, { type: "silice", tmax: 120, chemin: [
          { T: 10, C: 60, n: 1, t: "Sous le fond marin, les spicules d'éponges se dissolvent : l'eau interstitielle contient alors ≈ 60 mg de silice par litre." },
          { T: 40, C: 60, n: 2, t: "Sous l'effet de l'enfouissement, la température s'élève ; autour des débris, l'opale se redépose sous forme d'opale CT." },
          { T: 55, C: 15, n: 3, t: "Vers 50 °C, l'opale CT se transforme en calcédoine et en quartz : le rognon de silex est alors constitué." }],
        note: "Concentrations schématiques ; solubilités comparées de l'opale et du quartz." })],
    },
    opale: {
      sansForme: SF("l'opale est amorphe : elle ne présente ni maille ni faces cristallines."),
      forme: `L'opale n'a pas de structure régulière : elle est constituée de sphères de silice hydratée de 150 à 300 nm. Dans l'opale noble, ces sphères sont de taille uniforme et disposées en réseau compact, à la manière d'oranges empilées sur un étal ; ce réseau diffracte la lumière et produit les jeux de couleurs.`,
      intro: `L'opale se dépose à partir d'une eau très chargée en silice, qu'elle soit chaude (sources thermales) ou froide (eaux des sols arides), ou bien au sein des squelettes des organismes siliceux et des cellules végétales (phytolithes).`,
      scenarios: [s("Dans une source chaude (geysérite)", `Remontant d'un champ géothermique où elle a atteint l'équilibre avec le quartz, l'eau se refroidit trop rapidement pour que ce minéral puisse cristalliser ; la silice en excès se fixe alors sous forme d'opale autour des sources (geysérite de Yellowstone et d'Islande).`, { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)", chemin: [
          { T: 250, C: 434, n: 1, t: "Vers 250 °C, en profondeur, de l'eau en équilibre avec le quartz contient ≈ 430 mg de silice par litre." },
          { T: 100, C: 434, n: 2, t: "Elle jaillit à 100 °C en conservant sa silice : elle reste sursaturée, même vis-à-vis de l'opale." },
          { T: 30, C: 120, n: 3, t: "En se refroidissant à l'air libre, elle dépose l'excès de silice sous forme d'opale autour de la source." }],
        note: "Solubilités comparées de l'opale (Fournier et Rowe) et du quartz (Rimstidt) ; trajet indicatif." }),
        s("Dans les plantes : les phytolithes", `Les racines prélèvent l'acide silicique dissous dans l'eau du sol (H₄SiO₄) et la plante l'immobilise sous forme d'opale, dans et entre ses cellules : ces grains de quelques micromètres, les phytolithes, en gardent le moule. Graminées, prêles et palmiers en sont particulièrement riches. Une fois la plante morte, ils retombent au sol avec la litière. Dans une forêt équatoriale du Congo, la végétation fait ainsi circuler 58 à 76 kg de silicium par hectare et par an ; environ 92 % des phytolithes se redissolvent rapidement, tandis que les 8 % restants forment une réserve stable dans le sol (Alexandre et al. 1997). Leur morphologie permet de remonter à la plante d'origine : ils servent à reconstituer la végétation passée, et des phytolithes de graminées, trouvés dans des excréments de dinosaures de l'Inde vieux de 65 millions d'années, ont fait remonter l'histoire des herbes (Prasad et al. 2005).`,
        { cond: false, sansDiagramme: "Aucun diagramme n'est proposé : la concentration de la silice dans les cellules relève de la plante, et non de la température ou de la chimie de l'eau." },
        ["Alexandre A., Meunier J.-D., Colin F. et Koud J.-M. (1997). « Plant impact on the biogeochemical cycle of silicon and related weathering processes ». <i>Geochimica et Cosmochimica Acta</i> 61, p. 677–682.",
         "Prasad V., Strömberg C. A. E., Alimohammadian H. et Sahni A. (2005). « Dinosaur coprolites and the early evolution of grasses and grazers ». <i>Science</i> 310, p. 1177–1180."])],
    },
    tridymite: {
      forme: `Tétraèdres SiO₄ identiques à ceux du quartz, mais disposés en feuillets d'anneaux de six, empilés en deux couches : la charpente est plus ouverte (densité 2,26 contre 2,65) et n'est stable qu'entre 870 et 1 470 °C à la pression ordinaire.`,
      intro: `À haute température et sous basse pression, la tridymite se forme à partir de phases gazeuses dans les cavités des laves siliceuses.`,
      scenarios: [s("Dans les vacuoles d'une lave", `Lorsqu'une rhyolite ou une andésite se refroidit près de la surface, des gaz chauds déposent dans les vacuoles de fines plaquettes de tridymite, qui persistent ensuite à l'état métastable. Décrite en 1868 au Cerro San Cristóbal (Mexique), elle se rencontre également dans les météorites et sur la Lune.`, RARE("précipitée à partir des gaz d'une coulée, à pression atmosphérique."), [SRC.deer])],
    },
    cristobalite: {
      sansForme: SF("la cristobalite forme des sphérules et de petits octaèdres qui reflètent sa structure cubique, stable à haute température."),
      forme: `Tétraèdres SiO₄ disposés en anneaux de six et empilés en trois couches, à la manière des atomes du diamant : cubique au-dessus de ≈ 250 °C, la maille se plisse légèrement en refroidissant et devient quadratique.`,
      intro: `La cristobalite est la silice des très hautes températures, stable au-delà de 1 470 °C à la pression ordinaire, mais qu'on rencontre pourtant à froid, figée.`,
      scenarios: [s("Dans une lave siliceuse", `Les sphérules blanches des obsidiennes et des rhyolites (« flocons de neige ») résultent d'une cristallisation rapide de la cristobalite dans le verre encore chaud, bien en deçà de son domaine de stabilité. Elle entre aussi dans la composition de l'opale (opale CT, qui associe cristobalite et tridymite mal ordonnées).`, RARE("cristallisation hors équilibre, au sein d'un verre encore chaud."), [SRC.deer])],
    },
    moganite: {
      sansForme: SF("la moganite se présente sous forme de fibres microscopiques intimement mêlées à la calcédoine."),
      forme: `Des tranches de quartz droit et de quartz gauche alternent maille après maille : il s'agit d'un maclage à l'échelle atomique, à la manière d'un quartz maclé.`,
      intro: `Identifiée seulement en 1984 à Mogán (Grande Canarie), la moganite peut représenter jusqu'à 20 % de la composition de nombreuses calcédoines et de silex.`,
      scenarios: [s("Mêlée à la calcédoine", `Très présente dans les silicifications des milieux évaporitiques et arides, elle s'éteint peu à peu : les silex vieux de plus de 100 millions d'années en contiennent presque plus (Heaney et Post 1992).`, RARE("se reporter à la fiche consacrée à la calcédoine."), [SRC.heaney])],
    },
    coesite: {
      sansForme: SF("la coésite se présente en grains microscopiques, piégés dans le grenat ou le zircon."),
      forme: `Anneaux de quatre tétraèdres SiO₄ reliés en une charpente dense (densité 2,92) : il s'agit du quartz comprimé par la pression.`,
      intro: `Stable seulement au-delà de ≈ 2,5 à 3 GPa, soit à plus de 80 km de profondeur, la coésite signale qu'une roche de surface a plongé jusqu'à ce niveau avant de remonter.`,
      scenarios: [
        s("Au sein d'une croûte entraînée en subduction", `C'est en 1984 que Christian Chopin l'a identifiée dans les quartzites à pyrope du massif de Dora-Maira (Alpes italiennes). Une croûte continentale y avait plongé à plus de 90 km avant de remonter assez vite pour que le grenat emprisonne la coésite.`, meta([pt(15, 0, 1, "Dans la chaîne alpine, une croûte continentale est entraînée vers le bas par la subduction."),
          pt(600, 2.7), pt(700, 3.1, 2, "Au-delà de ≈ 3 GPa, son quartz se transforme en coésite, enfermée dans les grenats.", { bande: "coésite" }),
          pt(500, 1.0, 3, "Lors de la remontée rapide, la coésite repasse à l'état de quartz une fois hors du grenat."), pt(15, 0, 4, "L'érosion la met à jour.")],
          { echelle: "hp", courbes: ["coesite"], gradients: [10, 30] }), ["bose", SRC.chopin]),
        s("Dans un cratère d'impact", `Pendant une fraction de seconde, l'onde de choc d'un impact météoritique comprime le quartz : la coésite et la stishovite se forment alors dans les grès choqués de Meteor Crater et du Ries.`, RARE("se reporter à la fiche de la stishovite."), [SRC.chao]),
      ],
    },
    stishovite: {
      sansForme: SF("la stishovite se présente en cristaux de quelques micromètres."),
      forme: `Six oxygènes encadrent chaque silicium, disposés en octaèdres comme le titane du rutile ; il s'agit de la silice la plus dense, avec une masse volumique de 4,3.`,
      intro: `Synthétisée en 1961 par Sergueï Stichov, la stishovite a été identifiée l'année suivante dans les grès de Meteor Crater (Arizona). Elle est depuis associée à la signature des impacts météoritiques.`,
      scenarios: [s("Dans un cratère d'impact", `Sa formation exige plus de ≈ 10 GPa, pression qu'aucune roche de la croûte n'atteint sans impact.`, { type: "choc", chemin: [
          { P: 0.1, T: 15, n: 1, t: "Un grès quartzeux repose à la surface." },
          { P: 20, T: 170, n: 2, t: "Une partie du quartz passe en stishovite sous l'effet de l'onde de choc, qui le comprime durant une fraction de seconde." },
          { P: 20, T: 15, n: 3, t: "Aussitôt, la pression chute : la stishovite reste piégée et persiste sous forme de grains microscopiques." }],
        note: "Courbe : température conservée par la roche après le passage de l'onde (French 1998) ; trajet schématique." }, [SRC.chao])],
    },
    seifertite: {
      sansForme: SF("la seifertite se présente en lamelles microscopiques."),
      forme: `Des octaèdres SiO₆ forment des chaînes en zigzag, d'une compacité supérieure à celle des octaèdres de la stishovite.`,
      intro: `La seifertite n'apparaît qu'au-delà de ≈ 40 GPa ; elle a été identifiée dans des météorites martiennes et lunaires très choquées.`,
      scenarios: [s("Dans une météorite martienne", `C'est en 2008 que la seifertite a été décrite dans les météorites de Shergotty et de Zagami, expulsées de Mars par un impact. Le choc y a converti la silice en lamelles.`, RARE("Au-delà de l'échelle des diagrammes de l'atlas, la pression de choc atteint des valeurs extrêmes."), [SRC.elgoresy])],
    },
    melanophlogite: {
      forme: `Clathrate : la charpente de tétraèdres SiO₄ délimite des cages fermées, semblables à celles de la glace des hydrates de méthane, et chacune retient une molécule de méthane, de CO₂ ou d'azote. Le gaz sert de moule à la croissance : privée de lui, la charpente ne se constitue pas.`,
      intro: `Basse température et sédiments chargés de matière organique : c'est là que la mélanophlogite se développe, dans des milieux où le méthane est abondant.`,
      scenarios: [s("Avec le soufre de Sicile", `Elle prend la forme de petits cubes sur le soufre des gisements de Racalmuto et de Giona (Sicile), ainsi que dans les boues froides où suintent des émanations de méthane ; la silice s'organise autour des molécules gazeuses.`, RARE(), [SRC.deer])],
    },

    // ═══════════ feldspaths alcalins ═══════════
    microcline: {
      forme: FELD + `Dans le microcline, l'aluminium s'installe sur un seul des quatre sites, ordre qui incline légèrement la maille, d'où le nom grec de « petite inclinaison » pour cette symétrie triclinique. Cette mise en ordre fait apparaître des macles en quadrillage.`,
      intro: `On rencontre le microcline dans les roches qui se sont refroidies très lentement, comme les granites profonds, les pegmatites et les gneiss.`,
      scenarios: [
        s("Dans un granite à refroidissement lent", `L'orthose cristallise d'abord ; s'il reste longtemps chaud, ses atomes d'aluminium se réorganisent et le cristal devient du microcline, sans changer de forme.`, GRANITE("Le feldspath potassique", 700), ["tuttle", SRC.smith]),
        s("Dans une pegmatite", `Pikes Peak, dans le Colorado, fournit à la fois des cristaux géants, atteignant plusieurs mètres, et de l'amazonite verte.`, { cond: false, sansDiagramme: PEG }, [SRC.london]),
      ],
    },
    sanidine: {
      forme: FELD + `Dans la sanidine, l'aluminium se distribue au hasard entre les quatre sites, et la maille demeure monoclinique. Le cristal naît à chaud et se refroidit trop vite pour que cet arrangement se mette en ordre.`,
      intro: `Feldspath potassique des laves, la sanidine se trouve dans les trachytes, les rhyolites et les phonolites.`,
      scenarios: [s("Dans une lave trachytique", `Formée dans une chambre peu profonde, elle reste en phénocristaux lorsque la lave remonte puis se fige ; ses tablettes limpides se retrouvent dans les trachytes du puy de Dôme et les sanidines de Drachenfels.`, LAVE("La sanidine", 950, 880), [SRC.smith])],
    },
    anorthose: {
      forme: FELD + `Le sodium et le potassium se côtoient sur un même site dans l'anorthose, feldspath triclinique de haute température.`,
      intro: `Les laves riches en sodium voient cristalliser l'anorthose ; un refroidissement lent provoque sa séparation en lamelles d'albite et de feldspath potassique, la perthite.`,
      scenarios: [s("Dans une lave sodique", `Les « porphyres en losanges » d'Oslo renferment des phénocristaux losangiques, présents dans les trachytes et les phonolites sodiques.`,
        LAVE("L'anorthose", 1000, 930), [SRC.smith])],
    },
    celsiane: {
      forme: FELD + `La celsiane présente un baryum (Ba²⁺) à la place du potassium. Pour chaque couple de silicium, on trouve deux aluminiums, qui alternent rigoureusement (maille c doublée).`,
      intro: `Feldspath du baryum, la celsiane doit son nom à l'astronome Anders Celsius.`,
      scenarios: [s("Dans un gisement de manganèse métamorphisé", `Chauffés, des sédiments riches en baryum et en manganèse donnent la celsiane, à Jakobsberg (Suède) ou à Rush Creek (Californie).`, meta([pt(15, 0, 1, "Des strates riches en baryum et en manganèse s'accumulent au fond d'un bassin."),
          pt(550, 0.4, 2, "Enfouies puis réchauffées, ces strates recristallisent, et la celsiane apparaît.", { bande: "celsiane" }), pt(15, 0, 3, "L'érosion les ramène en surface.")]), ["pattison"])],
    },
    hyalophane: {
      forme: FELD + `Dans la hyalophane, baryum et potassium se répartissent les cavités : elle occupe une position intermédiaire entre l'orthose et la celsiane.`,
      intro: `On trouve la hyalophane dans les dolomies et les gisements de manganèse riches en baryum, ayant subi un métamorphisme.`,
      scenarios: [s("Dans une dolomie métamorphique", `Des prismes transparents proviennent de Binn (Valais) et de Busovača (Bosnie).`, RARE("composition rare, plusieurs voies de formation."), [SRC.deer])],
    },
    buddingtonite: {
      sansForme: SF("la buddingtonite se présente en grains microscopiques."),
      forme: FELD + `Les cavités accueillent l'ammonium (NH₄⁺), dont la taille avoisine celle du potassium.`,
      intro: `La buddingtonite appartient aux feldspaths ammoniacaux ; son azote provient de la matière organique enfouie.`,
      scenarios: [s("Altération hydrothermale", `Décrite en 1964 à la mine de mercure de Sulphur Bank (Californie), la buddingtonite résulte du remplacement des feldspaths de roches volcaniques par des eaux chaudes chargées d'ammonium issu de sédiments organiques. Elle se repère par satellite dans les champs géothermiques grâce à son spectre infrarouge caractéristique.`, RARE("altération par des eaux chaudes chargées d'ammonium, qui remplacent les feldspaths."), [SRC.deer])],
    },

    // ═══════════ plagioclases ═══════════
    plagioclases: {
      forme: PLAG,
      intro: `Parmi les minéraux de la croûte, les plagioclases sont les plus répandus. Cristallisant en premier, ils sont d'abord calciques, puis s'enrichissent en sodium au fil du refroidissement, si bien qu'un même cristal présente fréquemment une zonation.`,
      scenarios: [
        s("Dans un magma basaltique", `Vers 1 150 à 1 250 °C, la labradorite et la bytownite se forment en même temps que le pyroxène.`, BASALTE("Le plagioclase", 1200), ["hirschmann", SRC.smith]),
        s("Dans un magma granitique", `L'oligoclase et l'andésine se forment avant le quartz, dès les premiers stades de la cristallisation.`, GRANITE("Le plagioclase sodique", 760), ["tuttle"]),
      ],
    },
    albite: {
      forme: PLAG + `L'albite est le pôle sodique, de formule NaAlSi₃O₈.`,
      intro: `On trouve l'albite dans les granites et les pegmatites, mais surtout dans les roches du métamorphisme de basse température, où elle caractérise les schistes verts.`,
      scenarios: [
        s("Un basalte porté à haute température au contact d'eau de mer", `Au fond des océans, l'eau de mer enrichit les basaltes en sodium, et leur plagioclase calcique se transforme en albite : ce sont les spilites.`, meta([pt(10, 0, 1, "Le basalte prend naissance au fond des océans."),
          pt(350, 0.3, 2, "Porté à haute température au contact de l'eau de mer, le plagioclase du basalte s'albitise.", { bande: "albitisation" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"]),
        s("Dans une pegmatite", `Sous forme de lames blanches, l'albite prend le nom de cleavelandite ; elle se rencontre aux côtés de la tourmaline et de la lépidolite.`, { cond: false, sansDiagramme: PEG }, [SRC.london]),
      ],
    },
    oligoclase: {
      forme: PLAG + ` L'oligoclase contient 10 à 30 % d'anorthite.`,
      intro: `Les granites et les gneiss renferment l'oligoclase.`,
      scenarios: [s("Dans un granite", `Sa cristallisation précède celle du feldspath potassique et du quartz.`, GRANITE("L'oligoclase", 760), ["tuttle", SRC.smith])],
    },
    andesine: {
      forme: PLAG + ` L'andésine contient 30 à 50 % d'anorthite.`,
      intro: `Le nom de l'andésine vient des andésites, laves des Andes, roches où ce plagioclase domine, tout comme dans les diorites.`,
      scenarios: [s("Dans un magma d'andésite", `Des phénocristaux zonés caractérisent les laves issues des volcans de subduction.`, LAVE("L'andésine", 1050, 980, "Sous le volcan, un magma andésitique formé au-dessus d'une subduction se rassemble."), [SRC.smith])],
    },
    labradorite: {
      forme: PLAG + `Contenant 50 à 70 % d'anorthite, la labradorite se dédouble, en se refroidissant lentement, en lamelles de compositions voisines de 100 à 300 nm d'épaisseur. Ces lamelles réfléchissent la lumière en bleu et en vert : c'est la labradorescence.`,
      intro: `On rencontre la labradorite dans les basaltes, les gabbros et les anorthosites, notamment au Labrador, en Finlande et à Madagascar.`,
      scenarios: [s("Dans un magma basaltique", `Sa cristallisation intervient précocement, aux côtés de l'olivine et du pyroxène.`, BASALTE("La labradorite", 1200), ["hirschmann", SRC.smith])],
    },
    bytownite: {
      forme: PLAG + ` La bytownite contient 70 à 90 % d'anorthite.`,
      intro: `La bytownite est le plagioclase des gabbros et des anorthosites ; elle tient son nom de Bytown, ancien nom d'Ottawa.`,
      scenarios: [s("Dans un gabbro", `Formée de bonne heure dans le magma basaltique, elle se concentre au fond de la chambre.`, BASALTE("La bytownite", 1230), ["hirschmann", SRC.smith])],
    },
    anorthite: {
      forme: PLAG + `Pôle calcique du groupe, l'anorthite répond à la formule CaAl₂Si₂O₈ : l'aluminium et le silicium s'y succèdent rigoureusement (maille c doublée).`,
      intro: `Sur Terre, l'anorthite pure reste exceptionnelle, présente dans les skarns et les blocs du Vésuve. Sur la Lune, en revanche, elle constitue les hautes terres claires.`,
      scenarios: [
        s("Dans un magma basaltique très calcique", `Dans un basalte d'arc riche en eau (Miyake-jima, Japon), ce sont les premiers plagioclases qui apparaissent.`, BASALTE("L'anorthite", 1250), ["hirschmann"]),
        s("Sur la Lune", `Il y a ≈ 4,4 milliards d'années, l'océan de magma lunaire s'est solidifié. Plus légère, l'anorthite est remontée à la surface et a donné les anorthosites des hautes terres.`, RARE("Il s'agit de la solidification d'un océan de magma, à une échelle sans commune mesure avec celle de la croûte terrestre.")),
      ],
    },

    // ═══════════ feldspathoïdes ═══════════
    nepheline: {
      forme: `Charpente de type tridymite, où l'aluminium occupe la moitié des sites du silicium, les cavités logeant Na⁺ et K⁺. Trop pauvre en silice pour coexister avec le quartz, la néphéline réagirait avec lui pour former de l'albite.`,
      intro: `Les magmas pauvres en silice et riches en sodium, comme ceux des phonolites et des syénites néphéliniques, font cristalliser la néphéline. Au contact des acides, elle devient trouble ; son nom vient du grec <i>nephele</i>, « nuage ».`,
      scenarios: [s("Dans un magma alcalin", `Une fusion très faible du manteau produit un liquide pauvre en silice et riche en alcalins, dans lequel la néphéline cristallise avec le feldspath alcalin (phonolites du Velay et du Mézenc).`, magma("manteau", [pt(1300, 2.5, 1, "Le taux de fusion du manteau reste inférieur à 5 % : le liquide qui en résulte est pauvre en silice et riche en alcalins."),
          pt(1100, 0.3, 2, "Dans une chambre magmatique peu profonde, le liquide se différencie et la néphéline cristallise.", { bande: "cristallisation" }), pt(950, 0, 3, "Il donne une phonolite en surface ou une syénite en profondeur.")]), ["hirschmann", SRC.deer])],
    },
    leucite: {
      forme: `Les canaux de cette charpente de tétraèdres, semblable à celle de l'analcime, abritent le potassium. Au-dessus de ≈ 600 °C, sa forme est cubique ; en refroidissant, elle se déforme sans perdre cette silhouette, la maille devient quadratique et le cristal se couvre de macles fines.`,
      intro: `La leucite cristallise dans les laves riches en potassium et pauvres en silice ; elle ne se rencontre que dans les laves, car elle n'est pas stable à haute pression ou lors d'un refroidissement lent.`,
      scenarios: [s("Dans une lave potassique", `Ces « grenats blancs » se rencontrent au Vésuve et dans le Latium. Dans les roches anciennes, elle est fréquemment remplacée par un mélange de feldspath potassique et de néphéline (pseudoleucite).`, magma("manteau", [pt(1300, 2.5, 1, "Un manteau riche en potassium n'entre que très peu en fusion."),
          pt(1150, 0.1, 2, "Un magma qui remonte rapidement voit la leucite cristalliser près de la surface.", { bande: "cristallisation" }), pt(1050, 0, 3, "La lave se solidifie en renfermant ses trapézoèdres blancs.")]), ["hirschmann", SRC.carmichael])],
    },
    kalsilite: {
      sansForme: SF("la kalsilite se présente en grains et en intercroissances avec la néphéline."),
      forme: `Dans les canaux de sa charpente, de type tridymite, logent des atomes de potassium ; avec des Al et Si alternés, elle est le minéral le plus pauvre en silice des laves potassiques.`,
      intro: `On trouve la kalsilite dans des laves rares, à très forte teneur en potassium et à silice très faible.`,
      scenarios: [s("Dans une lave ultrapotassique", `Elle a été décrite dans les laves de Mafuru (Ouganda), associée aux kamafugites du rift africain, et au Latium, à San Venanzo.`, RARE("laves rarissimes.")),
      ],
    },
    sodalite: {
      forme: SODA + `Dans la sodalite, chaque cage renferme un ion chlorure entouré de quatre atomes de sodium.`,
      intro: `Dans les magmas sodiques, chargés en chlore et appauvris en silice, la sodalite se forme.`,
      scenarios: [s("Dans une syénite néphélinique", `Des masses bleues apparaissent dans les syénites de Bancroft (Ontario) et d'Ilímaussaq (Groenland).`,
        magma("manteau", [pt(1300, 2.5, 1, "La fusion du manteau reste très faible : le liquide obtenu est pauvre en silice et riche en sodium et en chlore."),
          pt(950, 0.2, 2, "Dans la chambre magmatique, il se différencie lentement, et la sodalite cristallise en même temps que la néphéline.", { bande: "cristallisation" })]), ["hirschmann", SRC.deer])],
    },
    hauyne: {
      forme: SODA + `Dans l'haüyne, chaque cage renferme un sulfate SO₄²⁻, associé au sodium et au calcium.`,
      intro: `Les laves alcalines riches en soufre portent des cristaux d'haüyne ; ce nom honore René Just Haüy.`,
      scenarios: [s("Dans une lave alcaline", `On la trouve dans les phonolites et les téphrites de l'Eifel, du Vésuve et du Latium.`, LAVE("L'haüyne", 1050, 980), [SRC.deer])],
    },
    noseane: {
      forme: SODA + `Dans la noséane, chaque cage renferme un sulfate et une molécule d'eau, avec pour seul cation le sodium.`,
      intro: `C'est dans les phonolites riches en soufre que se forme la noséane.`,
      scenarios: [s("Dans une phonolite", `On la trouve dans les phonolites du lac de Laach (Eifel) ; elle rend hommage au minéralogiste allemand Karl Wilhelm Nose.`, LAVE("La noséane", 1000, 930), [SRC.deer])],
    },
    lazurite: {
      forme: SODA + `La lazurite renferme des sulfates et des ions S₃⁻, groupes de trois atomes de soufre porteurs d'une charge : ils absorbent le jaune et l'orange, ce qui explique le bleu intense du minéral.`,
      intro: `Minéral bleu du lapis-lazuli, la lazurite a longtemps été réduite en poudre pour fournir l'outremer des peintres.`,
      scenarios: [s("Au contact d'un granite, dans un marbre", `Des fluides issus d'un granite ont enrichi en sodium et en silice un marbre sulfureux à Sar-e-Sang (Badakhshan, Afghanistan), gisement exploité depuis plus de 6 000 ans.`, { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(150, 0.15, 1, "Un calcaire riche en soufre, d'origine évaporitique, se trouve au voisinage d'un granite."),
          pt(600, 0.3, 2, "Sous l'effet de la chaleur et des fluides du granite, il recristallise en marbre, et la lazurite s'y forme.", { bande: "lapis" }),
          pt(15, 0, 3, "L'érosion met le gisement à jour.")], note: "Chemin schématique." }, ["tuttle", SRC.deer])],
    },
    cancrinite: {
      sansForme: SF("la cancrinite se présente surtout en masses et en grains."),
      forme: CANC + `Les canaux de la cancrinite contiennent du carbonate, accompagné de sodium et de calcium.`,
      intro: `Dans les syénites néphéliniques, la cancrinite remplace souvent la néphéline. Elle porte le nom du ministre russe Georg Cancrin.`,
      scenarios: [s("Dans une syénite néphélinique", `À Kola, dans l'Oural et en Ontario, des fluides riches en CO₂ transforment la néphéline en cancrinite en fin de cristallisation.`, RARE("transformation tardive, due aux fluides du magma."), [SRC.deer])],
    },
    davyne: {
      forme: CANC + `La davyne possède, dans ses canaux, des chaînes alternant calcium et chlore.`,
      intro: `Décrite dans les blocs éjectés de la Somma (Vésuve), la davyne doit son nom au chimiste Humphry Davy.`,
      scenarios: [s("Dans un bloc éjecté par un volcan", `Éjectés par le volcan, ces calcaires avaient été arrachés aux parois de la chambre magmatique puis transformés par la chaleur et les gaz.`, RARE("Il s'agit d'un métamorphisme à très haute température qui affecte les parois d'une chambre magmatique."), [SRC.deer])],
    },
    vishnevite: {
      sansForme: SF("la vishnévite se présente en masses et en grains."),
      forme: CANC + `La vishnévite loge, dans ses canaux, des sulfates et de l'eau.`,
      intro: `C'est dans les syénites néphéliniques des monts Vishnevye (Oural) qu'a été décrite la vishnévite.`,
      scenarios: [s("Dans une syénite néphélinique", `À l'image de la cancrinite, elle apparaît en fin de cristallisation, quand les fluides s'enrichissent en soufre.`, RARE(), [SRC.deer])],
    },
    afghanite: {
      sansForme: SF("l'afghanite se présente en grains dans le lapis-lazuli."),
      forme: CANC + `L'afghanite superpose ses anneaux sur huit couches, avec alternance de cages de sodalite et de cages de cancrinite.`,
      intro: `C'est dans le lapis-lazuli de Sar-e-Sang (Afghanistan) que l'afghanite a été décrite, en 1968.`,
      scenarios: [s("Dans le lapis-lazuli", `Elle se rencontre aux côtés de la lazurite, dans les marbres de contact.`, RARE("se reporter à la fiche de la lazurite."), [SRC.deer])],
    },
    tugtupite: {
      sansForme: SF("la tugtupite forme des masses."),
      forme: SODA + `Dans la tugtupite, le béryllium et l'aluminium se substituent en partie au silicium, selon un ordre strict.`,
      intro: `La tugtupite, de teinte rose à rouge, provient d'Ilímaussaq (Groenland) ; son nom groenlandais signifie « sang de renne ». Elle rougit à la lumière du soleil et pâlit dans l'obscurité.`,
      scenarios: [s("Dans une pegmatite alcaline", `On observe la tugtupite dans des veines hydrothermales tardives, au sein des syénites d'Ilímaussaq et du mont Saint-Hilaire (Québec).`, { cond: false, sansDiagramme: PEG }, [SRC.deer])],
    },

    // ═══════════ scapolites ═══════════
    marialite: {
      forme: SCAP + `La marialite est le pôle sodique et chloré de la série des scapolites.`,
      intro: `La marialite se forme lorsque des fluides salés traversent des roches chaudes ; elle remplace fréquemment le plagioclase.`,
      scenarios: [s("Métasomatose par des saumures", `On la trouve dans des marbres et des roches basiques au voisinage d'évaporites ou sous l'action de fluides salés (Pyrénées, Ariège).`, meta([pt(15, 0, 1, "Une roche riche en plagioclase est en contact avec des évaporites."), pt(500, 0.4, 2, "Chauffée et traversée par des saumures, elle transforme son plagioclase en scapolite.", { bande: "scapolite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.deer])],
    },
    meionite: {
      forme: SCAP + `Dans la série, la méionite occupe le pôle calcique et carbonaté.`,
      intro: `Marbres, granulites et blocs éjectés par le Vésuve : c'est là que cristallise la méionite.`,
      scenarios: [s("Dans un marbre de contact", `Un calcaire impur porté à haute température par un magma.`, { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(150, 0.15, 1, "Un calcaire impur se trouve à proximité d'un magma."), pt(700, 0.2, 2, "Chauffé, il recristallise : la méionite apparaît.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion le met à jour.")], note: "Chemin schématique." }, ["tuttle", SRC.deer])],
    },
    silvialite: {
      sansForme: SF("Dans les granulites, la silvialite se présente en grains."),
      forme: SCAP + `La silvialite est la scapolite à sulfate.`,
      intro: `Reconnue en 1999, la silvialite apparaît dans les granulites et les enclaves prélevées à la base de la croûte.`,
      scenarios: [s("Dans une granulite profonde", `Des laves ont remonté des enclaves de la croûte inférieure, dans le Queensland (Australie).`, RARE("enclaves de la base de la croûte."), [SRC.deer])],
    },

    // ═══════════ autres tectosilicates ═══════════
    danburite: {
      forme: `La danburite associe des paires de tétraèdres Si₂O₇ et B₂O₇ en une charpente dont les cavités abritent le calcium ; c'est la charpente de l'anorthite, le bore y tenant la place de l'aluminium.`,
      intro: `Là où des fluides apportent du bore à des roches calcaires, la danburite se forme.`,
      scenarios: [s("Dans un skarn ou un filon", `À Charcas (Mexique), en Birmanie et à Madagascar, des fluides riches en bore, issus d'un granite, pénètrent une dolomie ou un calcaire.`, { type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin: [
          pt(150, 0.12, 1, "Un calcaire repose près d'un granite."), pt(450, 0.12, 2, "Du bore, véhiculé par les fluides du granite, parvient aux fissures où la danburite se forme.", { bande: "skarn" }),
          pt(15, 0, 3, "L'érosion met le gisement à jour.")], note: "Chemin schématique." }, ["tuttle", SRC.deer])],
    },
    petalite: {
      sansForme: SF("la pétalite se présente surtout en masses clivables ; les cristaux sont rares."),
      forme: `Charpente formée de feuillets plissés de tétraèdres SiO₄, unis par des tétraèdres de lithium et d'aluminium. Le minéral se clive selon ces feuillets, d'où le nom grec <i>petalon</i>, « feuille ».`,
      intro: `Johan August Arfwedson a découvert le lithium en 1817, dans la pétalite d'Utö (Suède).`,
      scenarios: [s("Dans une pegmatite à lithium", `Sous pression modérée, le lithium donne cette espèce ; à plus grande profondeur, il forme du spodumène.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    leifite: {
      sansForme: SF("la leifite se présente en aiguilles fines, mal décrites."),
      forme: `Des tétraèdres de silicium, d'aluminium et de béryllium forment une charpente percée de canaux qui accueillent sodium et eau.`,
      intro: `Décrite à Narsarsuk (Groenland), la leifite rend hommage à Leif Erikson.`,
      scenarios: [s("Dans une pegmatite alcaline", `Groenland, Kola, mont Saint-Hilaire.`, { cond: false, sansDiagramme: PEG }, [SRC.deer])],
    },

    // ═══════════ zéolithes fibreuses ═══════════
    natrolite: {
      forme: ZEO + `Le long de c, la natrolite relie des groupes de cinq tétraèdres ; la charpente y est plus résistante, ce qui explique ses aiguilles.`,
      intro: `Des houppes d'aiguilles de natrolite tapissent les bulles des basaltes et les cavités des syénites néphéliniques.`,
      scenarios: [s("Dans une bulle de basalte", `Dans la lave refroidie, l'eau chaude en circulation dissout le verre et dépose les zéolithes au fond des bulles. En Islande, celles-ci se répartissent par zones de température : chabazite et thomsonite sous ≈ 70 °C, mésolite et scolécite au-dessus, puis stilbite et heulandite, et enfin laumontite.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann, SRC.gottardi])],
    },
    mesolite: {
      sansForme: SF("la mésolite se présente en fibres capillaires, réunies en touffes."),
      forme: ZEO + `Charpente de natrolite, avec, dans les canaux, une alternance de sodium et de calcium : son nom grec, mesos, « au milieu », la place entre la natrolite et la scolécite.`,
      intro: `Les bulles des basaltes du Deccan, d'Islande et des Féroé renferment des touffes de fibres blanches de mésolite.`,
      scenarios: [s("Dans une bulle de basalte", `Dans les basaltes d'Islande, c'est la zone de la mésolite et de la scolécite.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    scolecite: {
      sansForme: SF("la scolécite forme des aiguilles rayonnantes, maclées."),
      forme: ZEO + `La scolécite a la charpente de la natrolite, avec du calcium.`,
      intro: `Dans les basaltes du Deccan, la scolécite se présente en gerbes d'aiguilles ; sous la chaleur, elle se tord comme un ver, d'où le nom grec skolex.`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes du Deccan (Inde) et d'Islande.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    thomsonite: {
      sansForme: SF("la thomsonite forme des sphérules rayonnantes."),
      forme: ZEO + `Les chaînes de la natrolite sont reliées autrement dans la thomsonite, où aluminium et silicium se succèdent rigoureusement.`,
      intro: `Dans les basaltes, la thomsonite se présente en sphérules rayonnantes ; son nom honore le chimiste écossais Thomas Thomson.`,
      scenarios: [s("Dans une bulle de basalte", `La zone la plus froide, sous ≈ 70 °C, est celle de la chabazite et de la thomsonite.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    gonnardite: {
      sansForme: SF("la gonnardite forme des sphérules fibreuses."),
      forme: ZEO + `La gonnardite reprend la charpente de la natrolite, mais l'aluminium et le silicium y sont désordonnés.`,
      intro: `Décrite en 1896 à la Chaux de Bergonne (Puy-de-Dôme), la gonnardite rend hommage au minéralogiste lyonnais Ferdinand Gonnard.`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes d'Auvergne, du Kaiserstuhl, de Bohême.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    edingtonite: {
      sansForme: SF("l'édingtonite forme de petits cristaux pyramidaux, rares."),
      forme: ZEO + `Des chaînes de natrolite, reliées en une charpente quadratique, forment l'édingtonite, qui contient du baryum.`,
      intro: `C'est près de Glasgow (Écosse) que l'on a décrit l'édingtonite, zéolithe au baryum.`,
      scenarios: [s("Dans une veine hydrothermale", `Elle accompagne la barytine et l'harmotome dans des filons enrichis en baryum.`, RARE(), [SRC.gottardi])],
    },

    // ═══════════ groupe de la chabazite ═══════════
    chabazite: {
      forme: ZEO + `Doubles anneaux de six tétraèdres empilés : la chabazite ménage de grandes cages (≈ 10 Å) reliées par des fenêtres de huit tétraèdres. Sa maille rhomboédrique est presque cubique, ce qui donne des cristaux qu'on prend souvent pour des cubes.`,
      intro: `Parmi les zéolithes, la chabazite compte parmi les plus répandues dans les basaltes, mais elle se rencontre aussi dans les tufs altérés.`,
      scenarios: [s("Dans une bulle de basalte", `Elle précipite à froid, sous ≈ 70 °C, ce qui en fait la zéolithe des laves peu enfouies.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann, SRC.gottardi])],
    },
    levyne: {
      forme: ZEO + `Contrairement à la chabazite, la lévyne superpose ses anneaux de six selon un autre agencement, avec des cages aplaties qui expliquent ses tablettes.`,
      intro: `Dans les basaltes, la lévyne se présente en tablettes minces, souvent associées à l'offrétite.`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes d'Islande, d'Irlande du Nord, d'Écosse.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    erionite: {
      sansForme: SF("L'érionite se présente en fibres fines, semblables à de la laine."),
      forme: ZEO + `Le long de c, l'érionite superpose des cages de cancrinite et des doubles anneaux de six, ce qui produit ses fibres.`,
      intro: `Le nom grec de l'érionite signifie « laine » : elle forme des fibres dans les tufs volcaniques altérés. Inhalées, ces fibres provoquent le mésothéliome, à l'instar de l'amiante, mais plus fréquemment : en Cappadoce, des villages bâtis dans le tuf à érionite ont été décimés.`,
      scenarios: [s("Dans un tuf altéré", `Au contact de l'eau d'un lac salé et alcalin ou de la nappe souterraine, le verre d'un tuf se transforme en zéolithes (Cappadoce, Nevada, Oregon).`, RARE("Dans un lac alcalin, le verre se transforme à basse température."), [SRC.iijima])],
    },
    faujasite: {
      forme: ZEO + `Des cages de sodalite, reliées par des doubles anneaux de six, forment la faujasite, dont la disposition rappelle celle des atomes du diamant. Ses « supercages » de 13 Å figurent parmi les plus grandes des zéolithes naturelles. Sa version synthétique, la zéolithe Y, sert au raffinage du pétrole.`,
      intro: `Peu fréquente dans la nature, la faujasite se présente sous forme de petits octaèdres dans les basaltes du Kaiserstuhl.`,
      scenarios: [s("Dans une bulle de basalte", `Kaiserstuhl (Allemagne), Sasbach.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },

    // ═══════════ groupe heulandite–stilbite ═══════════
    heulandite: {
      sansForme: SF("La heulandite présente des cristaux en forme de « cercueil », que l'on décrit dans une maille autre que celle de sa structure."),
      forme: ZEO + `Ses couches denses de tétraèdres, parallèles à (010), ne sont reliées que par peu de liaisons : c'est ce qui donne un clivage {010} parfait et nacré.`,
      intro: `Des tablettes nacrées de heulandite se forment dans les basaltes ; le minéral rend hommage au collectionneur John Henry Heuland.`,
      scenarios: [s("Dans une bulle de basalte", `La zone de la stilbite et de la heulandite, plus chaude que celle de la chabazite, caractérise les basaltes d'Islande ; on la retrouve dans ceux du Deccan et des Féroé.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    clinoptilolite: {
      sansForme: SF("Dans les tufs, la clinoptilolite cristallise sous forme de grains microscopiques."),
      forme: ZEO + `Sa charpente rappelle celle de la heulandite, mais, plus riche en silicium, la clinoptilolite tolère mieux la chaleur.`,
      intro: `À l'échelle de la planète, la clinoptilolite est la zéolithe la plus répandue : elle remplace le verre de tufs volcaniques entiers, ce qui sert à fabriquer des litières pour chats, à traiter l'eau et à amender les sols.`,
      scenarios: [s("Dans un tuf enfoui", `À mesure qu'un tuf s'enfouit, il se répartit en zones : le verre se change en clinoptilolite vers 40 à 55 °C, puis la clinoptilolite en analcime vers 85 à 90 °C, et l'analcime en albite vers 120 °C (Iijima 1980).`, meta([
          pt(15, 0, 1, "Des cendres volcaniques s'accumulent dans un bassin."), pt(50, 0.04, 2, "Enfouies à ≈ 1,5 km, leur verre devient clinoptilolite.", { bande: "clinoptilolite" }),
          pt(15, 0, 3, "Le bassin se soulève, et l'érosion remet le tuf au jour.")], { echelle: "fond" }), [SRC.iijima])],
    },
    stilbite: {
      sansForme: SF("Des gerbes de tablettes constituent la forme habituelle de la stilbite ; les cristaux isolés sont rares."),
      forme: ZEO + `Des couches de tétraèdres parallèles à (010) donnent à la stilbite un clivage {010} parfait et un éclat nacré ; son nom grec, stilbein, signifie « briller ».`,
      intro: `Dans les basaltes du Deccan, la stilbite se présente en gerbes typiques, fréquemment posées sur l'apophyllite.`,
      scenarios: [s("Dans une bulle de basalte", `Au-delà de ≈ 100 °C, on entre dans la zone de la stilbite et de la heulandite.`, { cond: false, sansDiagramme: BULLE }, [SRC.kristmann])],
    },
    stellerite: {
      sansForme: SF("La stellérite se présente en gerbes et en tablettes."),
      forme: ZEO + `La stellérite adopte la charpente de la stilbite, mais sans sodium.`,
      intro: `Décrite aux îles du Commandeur (Russie), la stellérite rend hommage au naturaliste Georg Steller.`,
      scenarios: [s("Dans une bulle de lave", `Basaltes et andésites altérés.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    barrerite: {
      sansForme: SF("la barrérite forme des tablettes, rares."),
      forme: ZEO + `La barrérite reprend la charpente de la stilbite, avec un caractère sodique.`,
      intro: `C'est au cap Pula (Sardaigne) qu'a été décrite la barrérite, en l'honneur du chimiste des zéolithes Richard Barrer.`,
      scenarios: [s("Dans une lave altérée", `Andésites altérées de Sardaigne.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    brewsterite: {
      sansForme: SF("Des prismes présentant des secteurs de symétries différentes forment la brewstérite."),
      forme: ZEO + `Chaque atome de strontium de la brewstérite se trouve entouré d'oxygènes appartenant à la charpente, ainsi que de cinq molécules d'eau.`,
      intro: `Décrite à Strontian (Écosse), village qui a donné son nom au strontium, la brewstérite est une zéolithe qui contient ce métal.`,
      scenarios: [s("Dans un filon", `Des filons de plomb de Strontian renferment cette espèce, associée à la barytine et à la calcite.`, RARE(), [SRC.gottardi])],
    },
    epistilbite: {
      sansForme: SF("l'épistilbite forme de petits prismes maclés."),
      forme: ZEO + `L'épistilbite présente des canaux formés de dix et de huit tétraèdres, où se loge le calcium.`,
      intro: `Dans les basaltes d'Islande et des Féroé, l'épistilbite se présente en petits prismes.`,
      scenarios: [s("Dans une bulle de basalte", `Basaltes d'Islande (Teigarhorn).`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },

    // ═══════════ autres zéolithes ═══════════
    analcime: {
      forme: ZEO + `Sa charpente reprend celle de la leucite, et chaque canal renferme un sodium accompagné d'une molécule d'eau. Frottée, l'analcime se charge à peine d'électricité, d'où son nom grec, analkis, « sans force ».`,
      intro: `On rencontre l'analcime dans les vacuoles des basaltes, les tufs ensevelis et les dépôts des lacs salés.`,
      scenarios: [
        s("Dans un tuf enfoui", `Vers 85 à 90 °C, la clinoptilolite d'un tuf enfoui devient analcime (Iijima 1980).`, meta([
          pt(15, 0, 1, "Des cendres volcaniques s'accumulent dans un bassin."), pt(90, 0.08, 2, "Enfouies à ≈ 3 km, leur clinoptilolite devient analcime.", { bande: "analcime" }),
          pt(15, 0, 3, "L'érosion ramène le tuf en surface.")], { echelle: "fond" }), [SRC.iijima]),
        s("Dans une bulle de basalte", `Trapézoèdres limpides des îles Cyclopes (Sicile).`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi]),
      ],
    },
    laumontite: {
      forme: ZEO + `Le long de c, la laumontite présente des canaux de dix tétraèdres. Dès que l'air devient sec, elle perd son eau : il faut la conserver humide pour éviter qu'elle ne s'effrite.`,
      intro: `Le faciès des zéolithes, premier palier du métamorphisme, se reconnaît à la laumontite, présente dans les roches volcaniques et les grès feldspathiques les moins transformés.`,
      scenarios: [s("Enfouissement d'un grès ou d'une lave", `Entre 150 et 250 °C, l'eau réagit avec le plagioclase des grès volcaniques pour former de la laumontite (Nouvelle-Zélande, Southland ; Coombs 1954).`, meta([
          pt(15, 0, 1, "Des grès chargés de débris volcaniques s'accumulent."), pt(200, 0.2, 2, "À 6 à 8 km de profondeur, ces grès recristallisent, et la laumontite apparaît.", { bande: "zéolithes" }),
          pt(15, 0, 3, "L'érosion les ramène en surface.")]), ["pattison", SRC.gottardi])],
    },
    phillipsite: {
      sansForme: SF("La phillipsite se présente en macles en croix, associant plusieurs individus."),
      forme: ZEO + `Des doubles chaînes de tétraèdres, reliées en charpente, délimitent les canaux qui se croisent dans la phillipsite.`,
      intro: `Dans les sédiments des grands fonds océaniques, la phillipsite est la zéolithe la plus fréquente ; elle s'y substitue à la cendre volcanique.`,
      scenarios: [
        s("Au fond de l'océan", `Loin des continents, sur le Pacifique, les cendres s'altèrent lentement au contact d'une eau de mer froide (≈ 2 °C) et se transforment en phillipsite.`, RARE("Son origine tient à une altération lente, menée à la température du fond océanique."), [SRC.iijima]),
        s("Dans une bulle de basalte", `Basaltes du Vésuve, de Sicile, d'Auvergne.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi]),
      ],
    },
    harmotome: {
      sansForme: SF("l'harmotome forme des macles en croix."),
      forme: ZEO + `L'harmotome reprend la charpente de la phillipsite et contient du baryum.`,
      intro: `Dans les filons à barytine et galène, c'est l'harmotome qui cristallise.`,
      scenarios: [s("Dans un filon de plomb", `Strontian (Écosse), Andreasberg (Harz).`, RARE(), [SRC.gottardi])],
    },
    amicite: {
      sansForme: SF("l'amicite forme de petits cristaux pseudo-quadratiques."),
      forme: ZEO + `La charpente de l'amicite est celle de la gismondine, où l'aluminium et le silicium alternent rigoureusement.`,
      intro: `Décrite à Höwenegg (Allemagne), l'amicite rend hommage au physicien Giovanni Battista Amici.`,
      scenarios: [s("Dans une lave altérée", `Néphélinites du Hegau.`, { cond: false, sansDiagramme: BULLE }, [SRC.gottardi])],
    },
    pollucite: {
      sansForme: SF("la pollucite se présente surtout en masses."),
      forme: ZEO + `Sa charpente est celle de l'analcime ; un césium volumineux remplace la molécule d'eau qui occupe ce site dans l'analcime.`,
      intro: `Minerai du césium à Bernic Lake (Canada), la pollucite tire son nom de Pollux, tandis que la castorite (pétalite) porte celui de Castor ; les deux espèces ont été trouvées ensemble à l'île d'Elbe.`,
      scenarios: [s("Dans une pegmatite à lithium et césium", `Ne s'accommodant pas des autres minéraux, trop volumineux pour eux, le césium s'accumule dans le dernier liquide de la pegmatite.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    hsianghualite: {
      sansForme: SF("la hsianghualite forme des grains."),
      forme: `Des tétraèdres de silicium, de béryllium et de lithium forment une charpente cubique, semblable à celle de l'analcime ; le calcium et le fluor occupent les cavités.`,
      intro: `Des skarns à béryllium de Xianghualing (Hunan, Chine) ont livré la hsianghualite, décrite en 1958.`,
      scenarios: [s("Dans un skarn à béryllium", `Des fluides venus d'un granite riche en lithium, en béryllium et en fluor ont transformé des calcaires.`, RARE("skarn à éléments rares."), [SRC.deer])],
    },
  });
})();
