// ============ Le sol au fil du temps (I.2, 25/10/2026, à valider) — routes #soltemps et #soltemps/<frise> ============
// Sa demande (15/09) : « évolution d'un sol au fil des années selon la roche », avec ordres de grandeur de durée et références.
// Recherche et décisions : references/chronosequences-sols.md (21/10). Décisions qui fixent cette page :
// - dix frises, dont DEUX pour le calcaire : « lœss calcaire » et « calcaire dur » ;
// - SEULEMENT des chiffres mesurés en France métropolitaine ; pas d'axe des temps, durées en crochets sous les étapes ;
// - vue « Comparer » = tableau des durées tirées d'un livre ou d'un article (`cmp: false` sinon) ;
// - aucune référence ni texte d'appoint dans la page : tout va dans la carte « Sources » du bas (25/10, sa demande).
// 25/10/2026 (2), son choix parmi 5 maquettes : design A, « les fosses côte à côte », en reprenant au mieux les schémas publiés :
// la chronoséquence de Jamagne (2011, mise en couleur par Baize en 2017 : figure 16 de Baize 2024), les terres d'Aubues sur
// calcaire dur (Baize 2012, figure 1.4 de Baize 2021), les terrasses du Rhône (Bornand 1978, figure 3.6 de Baize 2021). Dessins
// refaits par l'atlas (aucune image copiée) : même grammaire (échelle de profondeur, horizons en motifs, phases sous les fosses).
// Horizons : séquences d'horizons de référence du Référentiel pédologique 2008 ; épaisseurs relevées sur les figures citées, sinon
// indicatives (`echelle.src` le dit, en bas de page).
// API : SolsTemps.page(cle), SolsTemps.lienRoche(roche), SolsTemps.menu(cle), SolsTemps.controle() → [] attendu,
//       SolsTemps.fossesSVG(etapes, opts) (réutilisable), SolsTemps.MOTIFS.
(function () {
  "use strict";
  const UNITES = "°C|%|mm|cm|km|m|g|kg|ans|an";
  const typo = (t) => t.replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\wÀ-ÿ]))`, "g"), "$1 ").replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ");
  const typoHTML = (h) => h.split(/(<[^>]*>)/).map((x) => (x.startsWith("<") ? x : typo(x))).join("");

  // ---------- 1. Sources ----------
  const SRC = {
    baize2021: "Baize D. (2021). <i>Naissance et évolution des sols. La pédogenèse expliquée simplement</i>. Versailles, Éditions Quæ.",
    rp2008: "Baize D., Girard M.-C. (coord.) (2009). <i>Référentiel pédologique 2008</i>. Association française pour l'étude du sol (AFES), Versailles, Éditions Quæ, 435 p. (séquences d'horizons de référence ; équivalences WRB 2006, annexe 5).",
    baize2024: "Baize D. (2024). Les luvisols. Devons-nous revoir nos conceptions ? Tentative de clarification. AFES, texte en ligne, 29 p. (figure 16 : chronoséquence de Jamagne 2011, mise en couleur par Baize en 2017 ; cite Jagercikova et al. 2017 et Montagne et al. 2013).",
    baize2012: "Baize D. (2012). Les « terres d'Aubues » de Basse Bourgogne : nouvelle synthèse et bilan de matières à très long terme. <i>Étude et Gestion des Sols</i> 19 (3-4), 139-161.",
    caner2010: "Caner L., Joussein E., Salvador-Blanes S., Hubert F., Schlicht J.-F., Duigou N. (2010). Short-time clay-mineral evolution in a soil chronosequence in Oléron Island (France). <i>Journal of Plant Nutrition and Soil Science</i> 173 (4), 591-600.",
    fechner2026: "Fechner K., Deschodt L., Broes F. et al. (2026). The « B sombre » or « B dark » horizon: a relict soil horizon on loess from the early Tardiglacial period (northern France, Belgium). <i>Archaeology, Society and Environment</i> 5 (1).",
    hassko1969: "Hassko B., Guillet B., Coppens R. (1969). Nancy natural radiocarbon measurements II. <i>Radiocarbon</i> 11 (2), 463-468 (âges carbone 14 des horizons Bh des podzols des Vosges et des Landes).",
    khedim2021: "Khedim N. et al. (2021). Topsoil organic matter build-up in glacier forelands around the world. <i>Global Change Biology</i> 27 (8), 1662-1677 (glaciers Noir et Blanc, Écrins).",
    gonnet2025: "Gonnet A., Riquier V. (2025). Les axes viaires et les thermokarsts comme témoins des évolutions pédo- et morphosédimentaires en Champagne crayeuse : l'exemple du site de Faux-Fresnay « Le Haut des Taupinières » (Marne, France). <i>Archéologie, société et environnement</i> 5 (1), 75-94.",
    rovera2005: "Rovéra G., Robert Y. (2005). Conditions climatiques hivernales et processus d'érosion périglaciaires dans les bad-lands marneux de Draix (800 m, Alpes du Sud, France). <i>Géographie physique et Quaternaire</i> 59 (1), 31-48 (résumé lu).",
    lloret2025: "Lloret E., Bafounga Y., Delattre M., Hofmann A., Bourdelle F. (2025). Pedogenesis under endemic vegetation on steep slope of a spoil tip: soil horizon differentiation in less than a decade. Goldschmidt 2025, résumé de congrès.",
    bafounga2025: "Bafounga Y. et al. (2025). First characterization of technosols developed on coal mining tailings in the North of France. Goldschmidt 2025, résumé de congrès.",
    wrb2022: "IUSS Working Group WRB (2022). <i>World Reference Base for Soil Resources</i>, 4ᵉ édition. Vienne, International Union of Soil Sciences (les Albeluvisols de 2006 sont devenus les Retisols en 2014).",
  };
  // une référence dans un texte : {{clé|lieu}} → [n, lieu] (numéro propre à la frise)
  const R = (cle, lieu) => `{{${cle}|${lieu || ""}}}`;

  // ---------- 2. Les frises ----------
  // etapes : { rp, wrb (WRB 2006 d'après l'annexe 5 du Référentiel ; null = non renseignée), h: [[code, de, a, motif]] en cm (ou en
  //            unités relatives si echelle.relative), mat: true pour un matériau, note (courte, sous le nom) }
  // phases : { nom, plein: [i, j] (trait plein sous les étapes i à j), tirets: [i, j] (prolongement en tirets), cond }
  // durees : { de, a, t, court, quoi, s: [[clé, lieu]], cmp } ; branches : { depuis, cond, etapes, phases, refs, durees }
  // echelle : { max (cm du bas de l'axe), relative (pas d'axe en cm), src (d'où viennent les épaisseurs, dit en bas de page) }
  const FRISES = [
    {
      id: "loess", nom: "Lœss calcaire", court: "lœss calcaire",
      roches: ["loess"],
      materiau: `Limon déposé par le vent pendant les périodes froides du Quaternaire, qui contient au départ 10 à 15 % de carbonate de calcium ${R("baize2021", "ch. 9")}. C'est la chronoséquence la mieux étudiée de France, établie par Jamagne sur les limons du Bassin parisien et du Nord ${R("baize2024", "fig. 16")}.`,
      echelle: { max: 165, src: `Fosses, épaisseurs et phases d'après la chronoséquence théorique de Jamagne (2011), mise en couleur par Baize en 2017 ${R("baize2024", "fig. 16")} ; aussi ${R("baize2021", "fig. 9.3")}. Dessin refait par l'atlas.` },
      etapes: [
        { rp: "Calcosol puis Calcisol", wrb: "Cambisols (Calcaric, puis Hypereutric)", h: [["Aci", 0, 28, "hum"], ["Sci", 28, 58, "s"], ["M", 58, 120, "m"]] },
        { rp: "Brunisol Eutrique", wrb: "Cambisols (Hypereutric ou Eutric)", h: [["A", 0, 28, "hum"], ["S", 28, 75, "s"], ["C", 75, 112, "c"], ["Ck", 112, 130, "ck"]] },
        { rp: "Brunisol luvique", wrb: null, h: [["A", 0, 18, "hum"], ["(E)", 18, 30, "epale"], ["St", 30, 75, "st"], ["C", 75, 140, "c"]] },
        { rp: "Néoluvisol", wrb: "Luvic Cambisols", h: [["Ae", 0, 18, "hum"], ["E", 18, 35, "e"], ["BT", 35, 85, "st"], ["BC", 85, 110, "stc"], ["C", 110, 145, "c"]] },
        { rp: "Luvisol Typique", wrb: "Haplic Luvisols", h: [["Ae", 0, 15, "ae"], ["E", 15, 40, "e"], ["BT", 40, 95, "btg"], ["BCg", 95, 115, "stc"], ["C", 115, 150, "c"]] },
        { rp: "Luvisol Dégradé", wrb: "Retisols (Albeluvisols en 2006)", h: [["Ae", 0, 10, "ae"], ["Eg", 10, 50, "eg"], ["BTgd", 50, 85, "glosses"], ["BTg", 85, 112, "btg"], ["C1g", 112, 135, "cg"], ["C2g", 135, 162, "cg"]] },
        { rp: "Luvisol Dégradé planosolique", wrb: null, h: [["Ae", 0, 10, "ae"], ["Eg", 10, 50, "eg"], ["BTgd", 50, 88, "glosses2"], ["BTg", 88, 132, "btg"]] },
        { rp: "Planosol secondaire", wrb: "Planosols", note: "étape éventuelle", h: [["Ae", 0, 10, "ae"], ["E", 10, 28, "e"], ["Eg", 28, 92, "egc"], ["BTgx", 92, 130, "btgx"]] },
      ],
      phases: [
        { nom: "phase 1 : décarbonatation et brunification", plein: [0, 1], tirets: [2, 2] },
        { nom: "phase 2 : argilluviation", plein: [3, 4], tirets: [2, 2] },
        { nom: "phase 3 : « dégradation »", plein: [5, 7], tirets: [4, 4], cond: "planosol : limon ancien, BT colmaté, souvent sur substrat imperméable" },
      ],
      durees: [
        { de: 0, a: 4, t: "au moins 15 000 ans", court: "luvisols du nord de la France", quoi: "pédogenèse des luvisols du nord de la France : le lœss s'y est déposé jusque vers 15 000 à 17 000 ans avant le présent (Jagercikova et al. 2017)", s: [["baize2024", "p. 18"]] },
        { de: 0, a: 4, t: "10 000 à 12 000 ans ?", court: "lœss récents", quoi: "lœss récents, dont les sols ne dépassent pas le stade Luvisol Typique (point d'interrogation de l'auteur)", s: [["baize2021", "ch. 9"]] },
        { de: 0, a: 5, t: "40 000 ans ?", court: "limons anciens", quoi: "limons anciens, qui portent des Luvisols Dégradés (point d'interrogation de l'auteur)", s: [["baize2021", "ch. 9"]] },
        { de: 1, a: 4, t: "une dizaine de milliers d'années", court: "du Brunisol Eutrique au Luvisol Typique", quoi: "du Brunisol Eutrique au Luvisol Typique, en passant par le Néoluvisol", s: [["baize2021", "ch. 5"]] },
        { de: 4, a: 5, t: "une dizaine de milliers d'années", court: "dégradation sous forêt", quoi: "dégradation sous forêt (Montagne et al. 2013)", s: [["baize2024", "p. 14"]] },
      ],
      notes: [
        `Les deux âges du lœss récent ne concordent pas : 10 000 à 12 000 ans pour l'un ${R("baize2021", "ch. 9")}, dépôt achevé vers 15 000 à 17 000 ans pour l'autre ${R("baize2024", "p. 18")}.`,
        `Former 60 cm de sol sur un limon faiblement calcaire demande quelques milliers d'années ${R("baize2021", "ch. 3")}.`,
        `Le planosol secondaire est une « manifestation éventuelle » de la dernière phase, non un passage obligé ${R("baize2021", "ch. 9")} ; le Référentiel parle de « certains planosols dits secondaires » ${R("rp2008", "p. 260")}.`,
        `Un horizon sombre, observé entre E et BT dans certains luvisols du nord de la France et de Belgique, serait le reste d'un sol de steppe de type chernozem, formé au début du Tardiglaciaire avant la première décarbonatation ${R("fechner2026", "")}. C'est une hypothèse récente de ses auteurs.`,
      ],
    },
    {
      id: "calcaire", nom: "Calcaire dur", court: "calcaire dur",
      roches: ["calcaire", "dolomie"],
      materiau: `Calcaires massifs des plateaux, qui ne contiennent que 2 à 10 % de fraction non calcaire ${R("baize2021", "ch. 8")}. Sans érosion, la roche se dissout peu à peu, son résidu s'accumule et le sol s'épaissit : c'est le cas des terres d'Aubues de Basse Bourgogne ${R("baize2021", "fig. 1.4")}.`,
      echelle: { max: 210, src: `Fosses d'après la figure des terres d'Aubues de Baize ${R("baize2012", "")} ${R("baize2021", "fig. 1.4")} : épaisseurs relevées sur la figure et ramenées aux 20 à 180 cm de ces sols. Dessin refait par l'atlas.` },
      etapes: [
        { rp: "Lithosol", wrb: "Lithic Leptosols", h: [["A", 0, 12, "hum"], ["R", 12, 40, "rca"]] },
        { rp: "Calcisol leptique", wrb: "Epileptic Cambisols (Hypereutric)", h: [["Aci", 0, 11, "hum"], ["Sci", 11, 32, "arg"], ["R", 32, 60, "rca"]] },
        { rp: "Calcisol", wrb: "Cambisols (Hypereutric)", h: [["Aci", 0, 13, "hum"], ["Sci", 13, 56, "arg"], ["R", 56, 84, "rca"]] },
        { rp: "Brunisol Eutrique saturé", wrb: "Cambisols (Hypereutric)", h: [["A", 0, 21, "hum"], ["S", 21, 77, "arg"], ["R", 77, 105, "rca"]] },
        { rp: "Brunisol Eutrique mésosaturé", wrb: "Cambisols (Eutric)", h: [["A", 0, 19, "humb"], ["S", 19, 94, "arg"], ["R", 94, 122, "rca"]] },
        { rp: "Néoluvisol", wrb: "Luvic Cambisols", h: [["A", 0, 9, "humb"], ["E", 9, 30, "epink"], ["BT", 30, 116, "arg"], ["R", 116, 144, "rca"]] },
        { rp: "Luvisol Typique", wrb: "Haplic Luvisols", h: [["Ae", 0, 9, "ae"], ["E", 9, 54, "epink"], ["BT", 54, 139, "arg"], ["R", 139, 167, "rca"]] },
        { rp: "Luvisol Typique désaturé", wrb: "Haplic Luvisols (Dystric)", h: [["Ae", 0, 9, "ae"], ["E", 9, 64, "epink"], ["BT", 64, 166, "arg"], ["R", 166, 194, "rca"]] },
        { rp: "Luvisol faiblement dégradé", wrb: null, h: [["Ae", 0, 9, "ae"], ["E", 9, 73, "epink"], ["Eg", 73, 105, "edeg"], ["BT", 105, 180, "arg"], ["R", 180, 208, "rca"]] },
      ],
      phases: [
        { nom: "dissolution de la roche, accumulation du résidu argileux", plein: [0, 2] },
        { nom: "brunification, désaturation", plein: [3, 4] },
        { nom: "argilluviation", plein: [5, 7] },
        { nom: "début de dégradation", plein: [8, 8] },
      ],
      durees: [
        { de: 0, a: 8, t: "au moins 1 à 2 millions d'années", court: "terres d'Aubues, argiles à chailles", quoi: "terres d'Aubues et argiles à chailles des plateaux", s: [["baize2021", "ch. 3"]] },
        { de: 0, a: 8, t: "1,7 à 2 millions d'années", court: "terres d'Aubues de Bourgogne", quoi: "terres d'Aubues de Basse Bourgogne (20 à 180 cm), pour une dissolution de 0,03 mm par an, vitesse retenue par l'auteur", s: [["baize2012", "tableau 6"]] },
      ],
      branches: [
        { depuis: null, cond: "matériau calcaire meuble et très perméable (coquilles, grèze)", refs: [["baize2021", "ch. 6"]],
          etapes: [{ rp: "Rendosol", wrb: "Rendzic Leptosols", h: [["Aca", 0, 40, "humca"], ["C", 40, 70, "coquilles"]] }],
          durees: [{ t: "six à neuf siècles", court: "rendzine de 40 cm sur coquilles d'huîtres (Saint-Michel-en-l'Herm)", quoi: "rendzine de 40 cm sur les buttes de coquilles d'huîtres de Saint-Michel-en-l'Herm (Vendée), plus rapide qu'un calcaire dur (Dupuis et al. 1965)", s: [["baize2021", "ch. 6"]] }] },
      ],
      notes: [
        `Vitesses de dissolution des calcaires durs mesurées en France : Bourgogne, 0,033 à 0,038 mm par an ; Jura, 0,070 à 0,090 ; haute montagne de Haute-Savoie, 0,015 ${R("baize2012", "tableau 5")}.`,
        `Dix centimètres d'un calcaire à 4 % d'insolubles ne laissent que 5 mm de résidu, en quelque 5 000 ans ${R("baize2021", "ch. 6")} ; former 60 cm de sol y prend « 50 ou 100 fois » plus de temps que sur un limon faiblement calcaire ${R("baize2021", "ch. 3")}.`,
        `Une érosion partielle ramène le sol à un stade antérieur ${R("baize2021", "fig. 1.5")}. Les argiles résiduelles des calcaires durs ne donnent pas de planosol ${R("baize2021", "ch. 10")}.`,
      ],
    },
    {
      id: "craie", nom: "Craie et calcaires tendres", court: "craie",
      roches: ["craie", "tuffeau", "argile_silex"],
      materiau: `Calcaires tendres et gélifs, désagrégés au Quaternaire en formations de pente très calcaires, qui sont les véritables matériaux parentaux ${R("baize2021", "ch. 8")}. Les sols crayeux, souvent à plus de 70 % de carbonate, ne sont « jamais totalement décarbonatés » ${R("baize2021", "ch. 8")}.`,
      echelle: { max: 100, src: `Séquences d'horizons du Référentiel ${R("rp2008", "p. 111")} (Rendosol : Aca de moins de 35 cm ; Calcosol : A et S de plus de 35 cm) ; rendosol de moins de 30 cm à Faux-Fresnay ${R("gonnet2025", "p. 77")}. Autres épaisseurs indicatives.` },
      etapes: [
        { rp: "Craie ou grèze crayeuse", mat: true, h: [["C", 0, 70, "craie"]] },
        { rp: "Rendosol", wrb: "Rendzic Leptosols", h: [["Aca", 0, 25, "humca"], ["C", 25, 75, "craie"]] },
        { rp: "Calcosol", wrb: "Cambisols (Calcaric)", h: [["Aca", 0, 22, "humca"], ["Sca", 22, 45, "sca"], ["C", 45, 85, "craie"]] },
        { rp: "Argile à silex", mat: true, note: "nouveau matériau parental", h: [["", 0, 95, "argsilex"]] },
      ],
      phases: [
        { nom: "accumulation de matière organique", plein: [0, 1] },
        { nom: "épaississement, décarbonatation en surface", plein: [1, 2], cond: "l'érosion ramène souvent au Rendosol" },
        { nom: "dissolution totale d'une craie à silex", plein: [3, 3], tirets: [2, 2] },
      ],
      durees: [
        { de: 0, a: 1, t: "tout l'Holocène (10 000 à 12 000 ans)", court: "rendosol de Champagne", quoi: "sur la craie de Champagne, le sol est encore un rendosol, qui « n'excède généralement pas 30 cm » (Faux-Fresnay, Marne) au bout de tout l'Holocène, depuis la fin de la dernière glaciation", s: [["gonnet2025", "p. 77"], ["baize2021", "ch. 3"]] },
        { de: 0, a: 1, t: "déjà au Bronze final", court: "rendosols du Bronze final", quoi: "des trous de poteaux du Bronze final (1 250 à 800 av. J.-C.) sont creusés dans des lambeaux de rendosols : le sol existait", s: [["gonnet2025", "p. 77"]] },
        { de: 0, a: 3, t: "plusieurs millions d'années", court: "argiles à silex", quoi: "argiles à silex, jusqu'à plusieurs dizaines de mètres, nées de la dissolution totale des craies (Quesnel 1997)", s: [["baize2021", "ch. 8"]] },
      ],
      notes: [`À Faux-Fresnay, l'érosion a enlevé le rendosol par endroits : le labour repose directement sur la craie ${R("gonnet2025", "p. 77")}.`],
    },
    {
      id: "marne", nom: "Marne et argiles calcaires", court: "marne",
      roches: ["marne"],
      materiau: `Roche à la fois argileuse et calcaire. Le résidu argileux étant abondant, la décarbonatation complète peut s'y opérer plus vite que sur un calcaire pur ${R("rp2008", "p. 114")} ; elle laisse un sol argileux, compact et peu perméable ${R("baize2021", "ch. 8")}.`,
      echelle: { max: 100, src: `Séquences d'horizons du Référentiel : sols calcaires ${R("rp2008", "p. 111")}, pélosols typiques A/Sp/C et différenciés Ae/E ou Eg/Sp/C ${R("rp2008", "p. 244-246")}, planosols ${R("rp2008", "p. 260")}. Épaisseurs indicatives.` },
      etapes: [
        { rp: "Marne", mat: true, h: [["C", 0, 70, "marne"]] },
        { rp: "Rendosol ou Calcosol argileux", wrb: "Rendzic Leptosols ou Cambisols (Calcaric)", h: [["Aca", 0, 25, "humca"], ["Sca", 25, 50, "sca"], ["C", 50, 85, "marne"]] },
        { rp: "Pélosol Typique", wrb: "Epistagnic Regosols (Clayic)", h: [["A", 0, 15, "hum"], ["Sp", 15, 60, "sp"], ["C", 60, 90, "marne"]] },
        { rp: "Pélosol Différencié", wrb: "Epistagnic Vertic Cambisols ou Planosols", h: [["Ae", 0, 8, "ae"], ["Eg", 8, 30, "eg"], ["Sp", 30, 70, "sp"], ["C", 70, 95, "marne"]] },
        { rp: "Planosol primaire", wrb: "Planosols", h: [["A", 0, 10, "hum"], ["Eg", 10, 35, "eg"], ["Sg", 35, 95, "spg"]] },
      ],
      phases: [
        { nom: "accumulation de matière organique", plein: [0, 1] },
        { nom: "décarbonatation", plein: [1, 2] },
        { nom: "appauvrissement de la surface par transfert latéral, sous forêt", plein: [3, 3] },
        { nom: "planosolisation", plein: [4, 4] },
      ],
      durees: [],
      branches: [
        { depuis: 1, cond: "marnes riches en smectites (marnes aquitaniennes du Loiret)", refs: [["baize2021", "ch. 8"]],
          etapes: [{ rp: "Vertisol", wrb: "Vertisols", h: [["A", 0, 15, "hum"], ["V", 15, 80, "vert"]] }] },
      ],
      notes: [
        `Aucune durée de formation mesurée en France n'a été trouvée pour la marne.`,
        `Sur les marnes noires nues de Draix (Alpes-de-Haute-Provence), le gel arrache chaque hiver 1 à 3 mm de régolite que l'eau emporte : sur une pente, l'érosion y empêche le sol de se former ${R("rovera2005", "résumé")}.`,
      ],
    },
    {
      id: "granite", nom: "Granite et gneiss", court: "granite",
      roches: ["granite", "granodiorite", "gneiss", "migmatite"],
      materiau: `Roches cristallines acides, riches en quartz. Le Rankosol y joue le rôle du Rendosol des calcaires ${R("rp2008", "p. 276")}. Sur un même versant des Hautes Vosges, la position choisit entre alocrisols, podzosols et brunisols colluviaux ${R("baize2021", "fig. 3.2")}.`,
      echelle: { max: 110, src: `Séquences d'horizons du Référentiel : rankosols A/R ${R("rp2008", "p. 276")}, brunisols A/S/C ${R("rp2008", "p. 104")}, alocrisols A/Sal/C ${R("rp2008", "p. 70")}, podzosols ocriques A/BP/C et meubles O/E/BP/C ${R("rp2008", "p. 268")}. Épaisseurs indicatives.` },
      etapes: [
        { rp: "Granite, gneiss", mat: true, h: [["R", 0, 60, "granite"]] },
        { rp: "Lithosol", wrb: "Lithic Leptosols", h: [["A", 0, 8, "hum"], ["R", 8, 60, "granite"]] },
        { rp: "Rankosol", wrb: "Umbric Leptosols", h: [["A", 0, 25, "humnoir"], ["R", 25, 70, "granite"]] },
        { rp: "Brunisol Dystrique", wrb: "Cambisols (Dystric)", h: [["A", 0, 15, "hum"], ["S", 15, 55, "s"], ["C", 55, 85, "arene"], ["R", 85, 105, "granite"]] },
        { rp: "Alocrisol Typique", wrb: "Cambisols (Hyperdystric)", h: [["A", 0, 12, "hum"], ["Sal", 12, 55, "sal"], ["C", 55, 85, "arene"], ["R", 85, 105, "granite"]] },
        { rp: "Podzosol Ocrique", wrb: "Entic Podzols", h: [["O", 0, 4, "o"], ["Ae", 4, 10, "ae"], ["BP", 10, 45, "bps"], ["C", 45, 80, "arene"], ["R", 80, 100, "granite"]] },
        { rp: "Podzosol Meuble", wrb: "Haplic ou Albic Podzols", h: [["O", 0, 5, "o"], ["E", 5, 25, "egris"], ["BPh", 25, 35, "bph"], ["BPs", 35, 60, "bps"], ["C", 60, 90, "arene"], ["R", 90, 110, "granite"]] },
      ],
      phases: [
        { nom: "colonisation, matière organique", plein: [0, 2] },
        { nom: "brunification", plein: [3, 3] },
        { nom: "acidification, aluminisation", plein: [4, 4] },
        { nom: "podzolisation", plein: [5, 6], cond: "végétation acidifiante, climat froid, roche plus quartzeuse" },
      ],
      durees: [
        { de: 0, a: 1, t: "25 ans environ", court: "premier humus (Écrins)", quoi: "le carbone organique reste très bas (en général moins de 2 g par kg) pendant les 25 premières années, puis augmente sans palier : glaciers Noir et Blanc, Écrins, granite, de 1 890 à 2 670 m", s: [["khedim2021", "tableau 1"]] },
        { de: 0, a: 6, t: "800 ± 170 ans (humus du Bh)", court: "podzol de Barembach (Vosges)", quoi: "podzol de Barembach (Bas-Rhin), sur le granite du Kagenfels, sous sapinière à hêtre : âge de l'humus du Bh", s: [["hassko1969", "p. 465"]] },
        { de: 0, a: 6, t: "2 260 ± 120 ans (humus du Bh)", court: "podzol de Gérardmer", quoi: "podzol de la route de Liaucourt, près de Gérardmer, sur sables granitiques grossiers : « le plus vieux Bh des Vosges »", s: [["hassko1969", "p. 466"]] },
      ],
      notes: [
        `Un âge au carbone 14 date la matière organique d'un horizon, sans cesse renouvelée : c'est un âge moyen, donc un minimum. D'après Guillet, ces podzols se sont formés en un temps deux ou trois fois plus long ${R("hassko1969", "p. 468")}.`,
        `Le luvisol est rare sur arène, et le planosol ne s'y forme pas ${R("rp2008", "p. 223 et 260")}. Une mise en culture fait passer un alocrisol à un brunisol dystrique « en quelques années » ${R("rp2008", "p. 72")}.`,
        `En plaine, le sol actuel est souvent jeune sur une arène très ancienne, du Miocène voire du Crétacé ${R("baize2021", "ch. 6")}.`,
      ],
    },
    {
      id: "sables", nom: "Sables et grès", court: "sables",
      roches: ["sable", "gres", "dunes"],
      materiau: `Sables quartzeux, ou grès tendres désagrégés. Sous une végétation acidifiante (landes, pins), la podzolisation y est rapide ; sinon, le sol peut rester un Arénosol sous mull acide ${R("baize2021", "ch. 8")}. Un sable de dune calcaire se décarbonate d'abord.`,
      echelle: { max: 100, src: `Séquences d'horizons du Référentiel : arénosols A/C ${R("rp2008", "p. 99")}, podzosols meubles O/E/BP/C ${R("rp2008", "p. 268")}. Épaisseurs indicatives ; à Oléron, le micropodzol n'occupe que 15 à 20 cm ${R("baize2021", "ch. 6")}.` },
      etapes: [
        { rp: "Sable quartzeux ou dune", mat: true, h: [["C", 0, 70, "sable"]] },
        { rp: "Arénosol", wrb: "Arenosols", h: [["A", 0, 15, "humsable"], ["C", 15, 80, "sable"]] },
        { rp: "Podzosol Meuble", wrb: "Haplic ou Albic Podzols", h: [["O", 0, 4, "o"], ["E", 4, 30, "egris"], ["BPh", 30, 40, "bph"], ["BPs", 40, 65, "bps"], ["C", 65, 95, "sable"]] },
      ],
      phases: [
        { nom: "matière organique (après décarbonatation si le sable est calcaire)", plein: [0, 1] },
        { nom: "podzolisation", plein: [2, 2], cond: "sous végétation acidifiante" },
      ],
      durees: [
        { de: 0, a: 2, t: "au plus 130 ans", court: "podzosols de Saint-Florentin", quoi: "podzosols le long d'une voie ferrée, à Saint-Florentin (Yonne) (Baize et Voilliot 1977)", s: [["baize2021", "ch. 6"]] },
        { de: 0, a: 2, t: "moins de 188 ans", court: "micropodzol d'Oléron", quoi: "micropodzol sur les 15 à 20 premiers centimètres des dunes d'Oléron, fixées par des palissades à partir de 1820 (sable à plus de 94 %, environ 8 % de calcite)", s: [["caner2010", ""], ["baize2021", "ch. 6"]] },
        { de: 1, a: 2, t: "quelques siècles", court: "arénosol de dune → podzosol", quoi: "un arénosol de dunes peut devenir podzosol", s: [["rp2008", "p. 273"]] },
        { de: 0, a: 2, t: "1 010 et 1 760 ans (humus du Bh)", court: "podzols des Vosges", quoi: "Vosges : alluvions sableuses de Saint-Gorgon (1 010 ± 125 ans), colluvions sableuses de Sainte-Hélène (1 760 ± 110 ans), âges de l'humus du Bh", s: [["hassko1969", "p. 465-466"]] },
        { de: 0, a: 2, t: "2 550 ± 180 ans (humus du Bh)", court: "podzol des Landes", quoi: "Landes, Le Temple : Bh du podzol actuel ; alios fossile enfoui : 4 520 ± 210 ans", s: [["hassko1969", "p. 467"]] },
      ],
      notes: [
        `À Oléron, les argiles changent surtout entre 132 et 188 ans, avec l'installation de la pinède ${R("caner2010", "")}.`,
        `Les âges des Bh sont des âges moyens de la matière organique, donc des minimums ${R("hassko1969", "p. 468")}.`,
      ],
    },
    {
      id: "schistes", nom: "Schistes", court: "schistes",
      roches: ["ardoise", "micaschiste", "calcschiste"],
      materiau: `Roches feuilletées, plus ou moins argileuses. La suite ressemble à celle du granite : Brunisol souvent dystrique « issu de schistes ardoisiers » ${R("rp2008", "p. 106")}, puis Alocrisol « issu de schistes pourpres » ${R("rp2008", "p. 72")}.`,
      echelle: { max: 100, src: `Séquences d'horizons du Référentiel (rankosols, brunisols, alocrisols) ${R("rp2008", "p. 70, 104 et 276")}. Épaisseurs indicatives.` },
      etapes: [
        { rp: "Schiste en place", mat: true, h: [["R", 0, 60, "schiste"]] },
        { rp: "Rankosol", wrb: "Umbric Leptosols", h: [["A", 0, 22, "humnoir"], ["R", 22, 70, "schiste"]] },
        { rp: "Brunisol Dystrique", wrb: "Cambisols (Dystric)", h: [["A", 0, 15, "hum"], ["S", 15, 50, "s"], ["C", 50, 80, "schalt"], ["R", 80, 100, "schiste"]] },
        { rp: "Alocrisol Typique", wrb: "Cambisols (Hyperdystric)", h: [["A", 0, 12, "hum"], ["Sal", 12, 50, "sal"], ["C", 50, 80, "schalt"], ["R", 80, 100, "schiste"]] },
      ],
      phases: [
        { nom: "matière organique", plein: [0, 1] },
        { nom: "brunification", plein: [2, 2] },
        { nom: "acidification, aluminisation", plein: [3, 3] },
      ],
      durees: [],
      branches: [
        { depuis: 3, cond: "en montagne, quand le pâturage cesse (calcschistes du Beaufortin)", refs: [["baize2021", "ch. 8"]],
          etapes: [{ rp: "Podzolisation superficielle", wrb: null, h: [["O", 0, 4, "o"], ["E", 4, 14, "egris"], ["BPs", 14, 30, "bps"], ["Sal", 30, 60, "sal"]] }] },
        { depuis: 0, cond: "schiste argileux", refs: [["rp2008", "p. 243 et 260"]],
          etapes: [{ rp: "Pélosol", wrb: "Epistagnic Regosols (Clayic)", h: [["A", 0, 15, "hum"], ["Sp", 15, 60, "sp"], ["C", 60, 85, "schiste"]] }, { rp: "Planosol, rarement", wrb: "Planosols", h: [["A", 0, 10, "hum"], ["Eg", 10, 35, "eg"], ["Sg", 35, 85, "spg"]] }] },
        { depuis: 0, cond: "schiste broyé et entassé par l'homme (terril de mine)", refs: [["rp2008", "p. 97"]],
          etapes: [{ rp: "Anthroposol Artificiel", wrb: "Technosols", h: [["A", 0, 10, "hum"], ["Z", 10, 70, "terril"]] }],
          durees: [
            { t: "moins de 10 ans", court: "terril d'Ostricourt", quoi: "terril d'Ostricourt (Nord), schistes houillers, versant sud nu jusqu'en 2016 : un sol apparaît en moins d'une décennie", s: [["lloret2025", ""]], cmp: false },
            { t: "30 ans", court: "terrils du bassin minier : 4 horizons, 30 cm", quoi: "trois terrils du bassin minier : jusqu'à quatre horizons et 30 cm d'épaisseur", s: [["bafounga2025", ""]], cmp: false },
          ] },
      ],
      notes: [`Aucune durée mesurée n'a été trouvée sur un schiste en place.`],
    },
    {
      id: "volcanique", nom: "Roches volcaniques", court: "roches volcaniques",
      roches: ["basalte", "andesite", "trachyte", "trachyandesite", "trachybasalte", "pouzzolane", "tuf_volcanique", "rhyolite"],
      materiau: `Cendres, ponces et scories récentes, sur basaltes, andésites et trachytes en climat tempéré ${R("rp2008", "p. 75")}. Leur verre s'altère vite en argiles mal cristallisées, qui donnent des andosols légers et riches en matière organique.`,
      echelle: { max: 100, src: `Séquences d'horizons du Référentiel : vitrandosols Avi/C, silandosols And/Snd/M, aluandosols Alu/Slu/C ${R("rp2008", "p. 80-81")}. Épaisseurs indicatives.` },
      etapes: [
        { rp: "Cendres et ponces récentes", mat: true, h: [["C", 0, 70, "cendre"]] },
        { rp: "Vitrandosol", wrb: "Vitric Andosols", note: "stade jeune", h: [["Avi", 0, 20, "andv"], ["C", 20, 80, "cendre"]] },
        { rp: "Silandosol", wrb: "Silandic Andosols", h: [["And", 0, 30, "andique"], ["Snd", 30, 60, "sand"], ["M", 60, 90, "cendre"]] },
        { rp: "Aluandosol", wrb: "Aluandic Andosols", h: [["Alu", 0, 35, "andique"], ["Slu", 35, 70, "sand"], ["C", 70, 95, "cendre"]] },
      ],
      phases: [
        { nom: "andosolisation", plein: [0, 2] },
        { nom: "aluminisation", plein: [3, 3], cond: "matériaux plus vieux ou plus compacts, climat froid et humide" },
      ],
      durees: [
        { de: 0, a: 2, t: "moins de 10 000 ans", court: "silandosols", quoi: "âge des pyroclastes qui portent des silandosols", s: [["rp2008", "p. 75"]] },
      ],
      branches: [
        { depuis: 2, cond: "pédoclimat plus sec", refs: [["baize2021", "ch. 11"]],
          etapes: [{ rp: "Brunisol andique", wrb: null, h: [["A", 0, 20, "andique"], ["S", 20, 60, "s"], ["C", 60, 85, "cendre"]] }, { rp: "Brunisol", wrb: "Cambisols", h: [["A", 0, 18, "hum"], ["S", 18, 60, "s"], ["C", 60, 85, "cendre"]] }] },
        { depuis: 0, cond: "sur rhyolite", refs: [["rp2008", "p. 75"]],
          etapes: [{ rp: "Podzosol", wrb: "Podzols", h: [["O", 0, 4, "o"], ["E", 4, 20, "egris"], ["BPh", 20, 28, "bph"], ["BPs", 28, 50, "bps"], ["C", 50, 75, "cendre"]] }] },
      ],
      notes: [`Aucune chronoséquence datée n'a été trouvée dans le Massif central.`],
    },
    {
      id: "alluvions", nom: "Alluvions et terrasses", court: "alluvions",
      roches: ["alluvions"],
      materiau: `Dépôts des cours d'eau. Tant que la crue revient, elle rajeunit le sol : « faute de temps, les altérations des minéraux primaires sont nulles ou faibles » ${R("rp2008", "p. 184")}. Une fois la terrasse hors d'atteinte, l'évolution reprend la voie des sols de plateau.`,
      echelle: { max: 130, src: `Séquences d'horizons du Référentiel : fluviosols juvéniles Js/M, typiques A/Jp/M/D, brunifiés A/S/D ${R("rp2008", "p. 185-186")}, fersialsols éluviques A/E/FSt/C ${R("rp2008", "p. 181")}. Épaisseurs indicatives.` },
      etapes: [
        { rp: "Alluvion récente", mat: true, h: [["D", 0, 70, "galets"]] },
        { rp: "Fluviosol Brut", wrb: "Fluvisols", h: [["J", 0, 40, "jall"], ["D", 40, 80, "galets"]] },
        { rp: "Fluviosol Juvénile", wrb: "Fluvisols", h: [["Js", 0, 25, "js"], ["M", 25, 60, "jall"], ["D", 60, 90, "galets"]] },
        { rp: "Fluviosol Typique", wrb: "Fluvisols", h: [["A", 0, 20, "hum"], ["Jp", 20, 60, "jp"], ["M", 60, 90, "jall"], ["D", 90, 110, "galets"]] },
        { rp: "Fluviosol Brunifié", wrb: "Fluvic Cambisols", h: [["A", 0, 20, "hum"], ["S", 20, 60, "s"], ["D", 60, 95, "galets"]] },
        { rp: "Néoluvisol ou Luvisol", wrb: "Luvic Cambisols ou Haplic Luvisols", note: "terrasse couverte de lœss", h: [["A", 0, 20, "hum"], ["E", 20, 40, "e"], ["BT", 40, 95, "bt"], ["C", 95, 120, "c"]] },
        { rp: "Fersialsol Éluvique", wrb: "Haplic Luvisols (Chromic)", note: "très vieille terrasse", h: [["A", 0, 15, "hum"], ["E", 15, 35, "e"], ["FSt", 35, 110, "fs"], ["C", 110, 130, "galets"]] },
      ],
      phases: [
        { nom: "dépôts successifs, début d'humification", plein: [0, 3] },
        { nom: "brunification", plein: [4, 4] },
        { nom: "argilluviation", plein: [5, 5] },
        { nom: "rubéfaction, kaolinisation", plein: [6, 6] },
      ],
      durees: [
        { de: 0, a: 2, t: "50 ans", court: "Fluviosol de la Loire", quoi: "Fluviosol Juvénile sableux de la Loire", s: [["baize2021", "ch. 6"]] },
        { de: 0, a: 6, t: "du Würm au Villafranchien", court: "terrasses de la Loire", quoi: "cinq terrasses de la Loire à Orléans, de 6 à 40 m au-dessus du fleuve : des galets de granite de plus en plus altérés ; dans la plus haute ne restent que quartz, silex et kaolinite (Horemans 1961)", s: [["baize2021", "ch. 6"]] },
        { de: 0, a: 6, t: "plusieurs millions d'années", court: "alluvions entre Yonne et Cure", quoi: "alluvions mio-pliocènes entre Yonne et Cure : feldspaths et micas changés en kaolinite (Baize 2019)", s: [["baize2021", "ch. 3"]] },
      ],
      notes: [`Les quatre fluviosols et les terrasses à lœss : ${R("rp2008", "p. 183-189")}, ${R("baize2021", "ch. 3 et 6")}.`],
    },
    {
      id: "fluvioglaciaire", nom: "Fluvio-glaciaire et moraines", court: "fluvio-glaciaire",
      roches: ["moraine", "tillite"],
      materiau: `Cailloutis calcaires et cristallins des terrasses du Rhône, étudiés par Bornand (1978). Ils portent les sols les plus épais de France : 15 à 20 m ${R("baize2021", "ch. 3")}. Processus d'ensemble, dans cet ordre : décarbonatation, argilification, rubéfaction, dérubéfaction ${R("baize2021", "fig. 3.6")}.`,
      echelle: { relative: true, max: 335, src: `Fosses d'après la reconstitution de Bornand (1978) ${R("baize2021", "fig. 3.6")}, sans échelle commune comme l'original (0,50 m pour le stade initial, 20 m pour le stade 5). Les stades portent les noms de Bornand ; les sources lues ne leur donnent pas de nom du Référentiel. Dessin refait par l'atlas.` },
      etapes: [
        { rp: "Stade initial", wrb: null, sansWrb: true, note: "0,50 m, Würm", h: [["A", 0, 6, "hum"], ["C", 6, 35, "galetsg"]] },
        { rp: "Stade 1", wrb: null, sansWrb: true, note: "Riss", h: [["A", 0, 6, "hum"], ["S", 6, 30, "rouge"], ["C", 30, 50, "galetsg"]] },
        { rp: "Stade 2", wrb: null, sansWrb: true, note: "Mindel", h: [["A", 0, 7, "hum"], ["S", 7, 55, "rouge"], ["C", 55, 75, "galetsg"]] },
        { rp: "Stade 3", wrb: null, sansWrb: true, note: "Günz", h: [["A", 0, 8, "hum"], ["E", 8, 18, "ejaune"], ["Bt", 18, 70, "btr"], ["S", 70, 95, "rouge"], ["C", 95, 125, "galetsg"]] },
        { rp: "Stade 4", wrb: null, sansWrb: true, h: [["A", 0, 8, "hum"], ["E", 8, 16, "ejaune"], ["Bt1", 16, 45, "btr"], ["Bt2", 45, 120, "btr"], ["S", 120, 145, "rouge"], ["C", 145, 170, "galetsg"]] },
        { rp: "Stade 5", wrb: null, sansWrb: true, note: "20 m, Villafranchien", h: [["A", 0, 8, "hum"], ["E", 8, 16, "ejaune"], ["Bt", 16, 300, "bto"], ["C", 300, 330, "galetsg"]] },
      ],
      phases: [{ nom: "décarbonatation, argilification, rubéfaction, dérubéfaction", plein: [0, 5] }],
      durees: [
        { de: 1, a: 4, t: "0,8 million d'années", court: "du stade 1 au stade 4", quoi: "du stade 1 au stade 4", s: [["baize2021", "fig. 3.6"]] },
        { de: 4, a: 5, t: "1,5 million d'années", court: "du stade 4 au stade 5", quoi: "du stade 4 au stade 5", s: [["baize2021", "fig. 3.6"]] },
        { de: 0, a: 5, t: "1,8 à 2,3 millions d'années", court: "durée totale, 15 à 20 m de sol", quoi: "durée totale, pour 15 à 20 m de sol (Bonnet et Bornand 1970)", s: [["baize2021", "ch. 3 et 6"]] },
      ],
      notes: [`Les moraines datées des Alpes ont été laissées de côté : elles sont toutes en Suisse.`],
    },
  ];
  const FRISE = {}; FRISES.forEach((f) => { FRISE[f.id] = f; });
  const DE_ROCHE = {}; FRISES.forEach((f) => f.roches.forEach((r) => { DE_ROCHE[r] = f.id; }));

  // ---------- 3. Motifs des horizons (grammaire graphique de Jamagne 2011 et Baize 2017) ----------
  // fond + petit dessin répété ; couleurs fixes (comme une planche imprimée), fond blanc de la figure dans les deux thèmes
  const P = (w, h, fond, svg) => ({ w, h, fond, svg });
  const ROUGE = "#b8241b";
  const MOTIFS = {
    hum: P(6, 8, "#5e2d26", `<path d="M3 1v4" stroke="#331511" stroke-width="1"/>`),
    humb: P(6, 8, "#9a6748", `<path d="M3 1v4" stroke="#6e452c" stroke-width="1"/>`),
    humca: P(10, 10, "#7a5236", `<path d="M3 1v4" stroke="#4d3020" stroke-width="1"/><path d="M7 6h3M8.5 4.5v3" stroke="#e8dcc0" stroke-width=".8"/>`),
    humnoir: P(6, 6, "#2f2622", `<circle cx="3" cy="3" r=".7" fill="#6e625b"/>`),
    humsable: P(6, 6, "#6f5a46", `<circle cx="2" cy="2" r=".7" fill="#d9c58e"/><circle cx="5" cy="5" r=".6" fill="#d9c58e"/>`),
    ae: P(4, 4, "#a9a9a6", `<circle cx="1" cy="1" r=".55" fill="#3c3c3a"/><circle cx="3" cy="3" r=".55" fill="#3c3c3a"/>`),
    o: P(8, 4, "#2b1d14", `<path d="M0 2h8" stroke="#5a4232" stroke-width="1"/>`),
    e: P(14, 8, "#fbf8f0", `<path d="M2 4h7" stroke="#8d8d88" stroke-width="1"/>`),
    egris: P(14, 8, "#d9d6cf", `<path d="M2 4h7" stroke="#8d8d88" stroke-width="1"/>`),
    eg: P(22, 14, "#fbf8f0", `<path d="M2 4h7M12 11h7" stroke="#8d8d88" stroke-width="1"/><rect x="16" y="2" width="2" height="6" fill="${ROUGE}"/>`),
    egc: P(22, 14, "#fbf8f0", `<path d="M2 4h7M12 11h7" stroke="#8d8d88" stroke-width="1"/><rect x="16" y="2" width="2" height="6" fill="${ROUGE}"/><circle cx="6" cy="10" r="1.6" fill="#1f1a17"/>`),
    epale: P(14, 8, "#ecd3b6", `<path d="M2 4h7" stroke="#b09679" stroke-width="1"/>`),
    epink: P(14, 8, "#e5a9cf", `<path d="M2 4h7" stroke="#c98ab2" stroke-width="1"/>`),
    edeg: P(14, 8, "#a77f93", `<path d="M2 4h7" stroke="#8c6679" stroke-width="1"/>`),
    ejaune: P(14, 8, "#f1dc8f", `<path d="M2 4h7" stroke="#cdb56a" stroke-width="1"/>`),
    s: P(8, 10, "#c99e6c", `<path d="M4 2v5" stroke="#8a6440" stroke-width="1"/>`),
    sal: P(8, 10, "#c8a061", `<path d="M4 2v5" stroke="#8a6a35" stroke-width="1"/><circle cx="1.5" cy="8" r=".6" fill="#8a6a35"/>`),
    sca: P(10, 10, "#dcc08c", `<path d="M3 2v5" stroke="#9a7a4a" stroke-width="1"/><path d="M6.5 7h3M8 5.5v3" stroke="#5d4a2c" stroke-width=".8"/>`),
    st: P(8, 20, "#c99e6c", `<path d="M4 0v20" stroke="#8a6440" stroke-width="1"/>`),
    stc: P(8, 12, "#cfa877", `<path d="M4 0v6" stroke="#8a6440" stroke-width="1"/><circle cx="2" cy="9" r=".7" fill="#8e6e48"/><circle cx="6" cy="10" r=".7" fill="#8e6e48"/>`),
    bt: P(8, 20, "#e3892f", `<path d="M4 0v20" stroke="#9b5216" stroke-width="1"/>`),
    btg: P(24, 30, "#e3892f", `<path d="M4 0v30M12 0v30M20 0v30" stroke="#9b5216" stroke-width="1"/><rect x="14.5" y="9" width="2.5" height="9" fill="${ROUGE}"/>`),
    btr: P(8, 20, "#d2402a", `<path d="M4 0v20" stroke="#8e2416" stroke-width="1"/>`),
    bto: P(8, 20, "#e0742a", `<path d="M4 0v20" stroke="#9b4a16" stroke-width=".8"/>`),
    btgx: P(16, 16, "#e3892f", `<path d="M0 8h16M8 0v16" stroke="#9b5216" stroke-width="1"/><rect x="3" y="2" width="2.2" height="7" fill="${ROUGE}"/>`),
    c: P(6, 6, "#d7b98e", `<circle cx="1.5" cy="1.5" r=".7" fill="#8e6e48"/><circle cx="4.5" cy="4.5" r=".7" fill="#8e6e48"/>`),
    cg: P(18, 18, "#d7b98e", `<circle cx="2" cy="2" r=".7" fill="#8e6e48"/><circle cx="8" cy="7" r=".7" fill="#8e6e48"/><circle cx="14" cy="13" r=".7" fill="#8e6e48"/><rect x="12" y="2" width="2" height="7" fill="${ROUGE}"/>`),
    m: P(10, 10, "#f3e35b", `<circle cx="2" cy="2" r=".7" fill="#7d6f10"/><circle cx="7" cy="6" r=".7" fill="#7d6f10"/><path d="M4 8h3" stroke="#7d6f10" stroke-width=".8"/>`),
    ck: P(16, 16, "#f3e35b", `<path d="M5 3v6M2 6h6" stroke="#1d1a10" stroke-width="1.3"/><circle cx="12" cy="12" r=".7" fill="#7d6f10"/>`),
    rca: P(24, 12, "#f2e7a0", `<path d="M0 .5h24M0 6.5h24M6 .5v6M18 6.5v6" stroke="#8c7a3a" stroke-width="1"/>`),
    arg: P(6, 6, "#b8262c", `<circle cx="2" cy="2" r=".5" fill="#8a161a"/>`),
    rouge: P(6, 6, "#c63a2c", `<circle cx="2" cy="3" r=".5" fill="#8a1f16"/>`),
    craie: P(16, 12, "#f6f2e4", `<path d="M0 .5h16M0 6.5h16M4 .5v6M12 6.5v6" stroke="#d8d1bb" stroke-width=".8"/>`),
    argsilex: P(20, 16, "#b45a33", `<ellipse cx="6" cy="5" rx="3.2" ry="2" fill="#2d2622"/><ellipse cx="15" cy="12" rx="2.6" ry="1.6" fill="#2d2622"/>`),
    marne: P(12, 6, "#c4c9b2", `<path d="M0 3h12" stroke="#9aa088" stroke-width=".8"/>`),
    sp: P(14, 14, "#a8977a", `<path d="M3 0v14M10 0v14M0 7h14" stroke="#6d5f47" stroke-width=".9"/>`),
    spg: P(14, 14, "#9d9a86", `<path d="M3 0v14M10 0v14M0 7h14" stroke="#6b6855" stroke-width=".9"/><rect x="5" y="2" width="2" height="4" fill="${ROUGE}"/>`),
    vert: P(16, 16, "#5c5649", `<path d="M0 16L16 0" stroke="#3a352c" stroke-width="1"/>`),
    granite: P(14, 14, "#c690be", `<path d="M4 2v4M2 4h4M11 9v4M9 11h4" stroke="#7b4d74" stroke-width="1"/>`),
    arene: P(14, 14, "#ecc6dc", `<path d="M3 6h4M5 6v-3M10 12h4M12 12v-3" stroke="#a6789a" stroke-width=".9"/>`),
    bph: P(6, 6, "#3b261b", `<circle cx="3" cy="3" r=".6" fill="#6b4a36"/>`),
    bps: P(6, 6, "#b5541e", `<circle cx="2" cy="2" r=".6" fill="#7a3510"/><circle cx="5" cy="5" r=".5" fill="#7a3510"/>`),
    sable: P(6, 6, "#efdfa6", `<circle cx="1.5" cy="1.5" r=".7" fill="#b39b55"/><circle cx="4.5" cy="4.5" r=".7" fill="#b39b55"/>`),
    schiste: P(10, 10, "#8e939e", `<path d="M0 10L10 0M-2 4L4 -2M6 12L12 6" stroke="#5c616c" stroke-width="1"/>`),
    schalt: P(10, 10, "#b9aa8f", `<path d="M0 10L10 0" stroke="#8a7d66" stroke-width=".8"/>`),
    terril: P(12, 10, "#3e3f44", `<path d="M1 3l3 -2l2 3zM7 8l3 -2l1 3z" fill="#676870"/>`),
    coquilles: P(14, 10, "#ede6d2", `<path d="M2 7q3 -6 6 0M8 4q2.5 -4 5 0" stroke="#9b917a" fill="none" stroke-width=".9"/>`),
    cendre: P(5, 5, "#9a948e", `<circle cx="1.5" cy="1.5" r=".6" fill="#5e5853"/><circle cx="4" cy="3.5" r=".5" fill="#5e5853"/>`),
    andv: P(6, 6, "#4e4744", `<circle cx="3" cy="3" r=".7" fill="#8a827d"/>`),
    andique: P(6, 6, "#2f2a28", `<circle cx="3" cy="3" r=".6" fill="#6b625d"/>`),
    sand: P(8, 10, "#7d6a55", `<path d="M4 2v5" stroke="#55473a" stroke-width="1"/>`),
    galets: P(16, 14, "#cdbf9f", `<circle cx="4" cy="4" r="3" fill="none" stroke="#7c6f55" stroke-width=".9"/><circle cx="12" cy="10" r="2.2" fill="none" stroke="#7c6f55" stroke-width=".9"/>`),
    galetsg: P(16, 14, "#e2ddd3", `<circle cx="4" cy="4" r="3" fill="none" stroke="#9c958a" stroke-width=".9"/><circle cx="12" cy="10" r="2.2" fill="none" stroke="#9c958a" stroke-width=".9"/>`),
    jall: P(12, 6, "#d9c69c", `<path d="M0 3h12" stroke="#a8946a" stroke-width=".8"/>`),
    js: P(12, 6, "#a8916c", `<path d="M0 3h12" stroke="#7d6a4a" stroke-width=".8"/>`),
    jp: P(8, 10, "#b8a07a", `<path d="M4 2v4" stroke="#7d6a4a" stroke-width=".9"/><path d="M0 8h8" stroke="#958160" stroke-width=".6"/>`),
    fs: P(6, 6, "#c0442c", `<circle cx="2" cy="2" r=".5" fill="#8a2a18"/>`),
    glosses: P(8, 20, "#e3892f", `<path d="M4 0v20" stroke="#9b5216" stroke-width="1"/>`),
    glosses2: P(8, 20, "#e3892f", `<path d="M4 0v20" stroke="#9b5216" stroke-width="1"/>`),
  };
  // couche de définitions, posée une fois dans la page (les motifs sont partagés par toutes les fosses)
  function defsHTML() {
    return `<svg class="st-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>${Object.entries(MOTIFS).map(([k, m]) =>
      `<pattern id="stm-${k}" width="${m.w}" height="${m.h}" patternUnits="userSpaceOnUse"><rect width="${m.w}" height="${m.h}" fill="${m.fond}"/>${m.svg}</pattern>`).join("")}</defs></svg>`;
  }
  // tirage fixe (les fosses sont les mêmes à chaque affichage)
  const alea = (g) => () => ((g = (g * 16807) % 2147483647) / 2147483647);
  // limite ondulée d'un horizon à l'autre
  const onde = (x, w, y, a, g) => { const r = alea(g); let d = ""; const n = 5; for (let k = 1; k <= n; k++) d += ` Q${x + w * (k - .5) / n} ${y + (r() - .5) * a * 2} ${x + w * k / n} ${y}`; return d; };

  // ---------- 4. Dessin des fosses côte à côte ----------
  // etapes : liste d'étapes ; opts : { echelle, phases, durees, couloirsMax }. Rend un SVG à la largeur des fosses.
  const L = { W: 72, G: 38, AXE: 46, HAUT: 74 };
  function fosseSVG(e, x, y0, k, i) {
    let s = "", haut = y0, dernier = -99;
    const H = e.h || [];
    H.forEach(([code, de, a, motif], j) => {
      const yA = y0 + de * k, yB = y0 + a * k;
      const ondeHaut = j ? onde(x, L.W, yA, 2.5, 97 + i * 13 + j) : ` H${x + L.W}`;
      const corps = `M${x} ${yA}${ondeHaut} V${yB} H${x} Z`;
      s += `<path d="${corps}" fill="url(#stm-${motif})"/>`;
      if (motif === "glosses" || motif === "glosses2") s += glossesSVG(x, yA, yB, motif === "glosses2", i);
      // les codes des horizons minces se poussent vers le bas pour ne pas se chevaucher
      if (code) { const ty = Math.max((yA + yB) / 2 + 3.5, dernier + 12.5); dernier = ty; s += `<text x="${x - 4}" y="${ty}" text-anchor="end" class="st-hz">${code}</text>`; }
    });
    const bas = y0 + (H.length ? H[H.length - 1][2] : 0) * k;
    s += `<path d="M${x} ${haut}V${bas}M${x + L.W} ${haut}V${bas}" class="st-f-bord"/>`;
    return { svg: s, bas };
  }
  // langues blanchies (glosses) qui pénètrent le BT, comme sur la figure de Jamagne ; variante planosolique : îlots d'argile dans le blanc
  function glossesSVG(x, yA, yB, ilots, i) {
    const r = alea(31 + i), h = yB - yA; let s = "";
    if (!ilots) {
      for (let g = 0; g < 4; g++) {
        const cx = x + 8 + g * (L.W - 16) / 3, l = 3 + r() * 3, p = h * (0.55 + r() * 0.4);
        s += `<path d="M${cx - l} ${yA} C${cx - l} ${yA + p * .5} ${cx - 1} ${yA + p * .8} ${cx} ${yA + p} C${cx + 1} ${yA + p * .8} ${cx + l} ${yA + p * .5} ${cx + l} ${yA} Z" fill="#fbf8f0" stroke="#9b5216" stroke-width=".6"/>`;
      }
    } else {
      s += `<rect x="${x}" y="${yA}" width="${L.W}" height="${h}" fill="#fbf8f0"/>`;
      for (let g = 0; g < 9; g++) {
        const cx = x + 6 + r() * (L.W - 12), cy = yA + 4 + r() * (h - 8), rx = 3 + r() * 5, ry = 3 + r() * 6;
        s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#e3892f" stroke="#9b5216" stroke-width=".6"/>`;
      }
      s += `<rect x="${x + L.W * .55}" y="${yA + h * .3}" width="2.2" height="7" fill="${ROUGE}"/>`;
    }
    return s;
  }
  function couloirs(durees) {
    const fin = [], pos = [];
    durees.map((d, i) => [d, i]).sort((x, y) => x[0].de - y[0].de || y[0].a - x[0].a).forEach(([d, i]) => {
      let k = fin.findIndex((f) => f < d.de);
      if (k < 0) { k = fin.length; fin.push(-1); }
      fin[k] = d.a; pos[i] = k;
    });
    return { pos, n: fin.length };
  }
  // nom de l'étape coupé en deux lignes au plus (≈ 13 caractères par ligne)
  function lignesNom(n, max = 13) {
    const mots = n.split(" "), l = [""];
    mots.forEach((m) => { const c = l[l.length - 1]; if (c && (c + " " + m).length > max && l.length < 3) l.push(m); else l[l.length - 1] = c ? c + " " + m : m; });
    return l;
  }
  function fossesSVG(etapes, o) {
    o = o || {};
    const ech = o.echelle || { max: 120 };
    const haut = 300, k = haut / ech.max;
    const n = etapes.length, x0 = ech.relative ? 30 : L.AXE + 22;
    const xs = etapes.map((_, i) => x0 + i * (L.W + L.G));
    const largeurFosses = xs[n - 1] + L.W + 30;
    let s = "", basMax = 0;
    // axe des profondeurs (cm)
    if (!ech.relative) {
      s += `<text x="${L.AXE - 6}" y="${L.HAUT - 8}" text-anchor="end" class="st-ax">cm</text><path d="M${L.AXE} ${L.HAUT}V${L.HAUT + haut}" class="st-axe"/>`;
      const pas = ech.max > 150 ? 40 : 20;
      for (let c = 0; c <= ech.max; c += pas) s += `<path d="M${L.AXE - 4} ${L.HAUT + c * k}h4" class="st-axe"/><text x="${L.AXE - 7}" y="${L.HAUT + c * k + 3.5}" text-anchor="end" class="st-ax">${c}</text>`;
    }
    etapes.forEach((e, i) => {
      const x = xs[i], noms = lignesNom(e.rp);
      noms.forEach((l, j) => { s += `<text x="${x + L.W / 2}" y="${10 + j * 13}" text-anchor="middle" class="st-nom">${l}</text>`; });
      const sous = e.mat ? "matériau parental" : e.sansWrb ? (e.note || "") : (e.wrb || "WRB : non renseignée");
      // nom WRB sur deux lignes au plus, pour ne pas mordre sur la fosse voisine
      if (sous) lignesNom(sous, 20).forEach((l, j) => { s += `<text x="${x + L.W / 2}" y="${12 + noms.length * 13 + j * 11}" text-anchor="middle" class="st-wrb${e.wrb || e.mat || e.sansWrb ? "" : " st-wrb-gris"}">${l}</text>`; });
      const f = fosseSVG(e, x, L.HAUT, k, i);
      s += f.svg; basMax = Math.max(basMax, f.bas);
      if (e.note && !e.sansWrb) s += `<text x="${x + L.W / 2}" y="${f.bas + 12}" text-anchor="middle" class="st-note-f">${e.note}</text>`;
    });
    let y = Math.max(basMax + 26, L.HAUT + haut * 0.5 + 26) + (etapes.some((e) => e.note && !e.sansWrb) ? 12 : 0);
    let droite = xs[n - 1] + L.W;   // bord droit de ce qui est écrit, pour la largeur du dessin
    // phases (traits pleins, prolongements en tirets), comme sous la figure de Jamagne
    const cx = (i) => xs[i] + L.W / 2;
    // phases côte à côte quand elles ne se recouvrent pas (même rangement que les crochets)
    const ph = o.phases || [];
    const { pos: rangP, n: nP } = couloirs(ph.map((p) => {
      const de = Math.min(p.plein[0], p.tirets ? p.tirets[0] : 99);
      // le nom de la phase peut déborder de son trait : on compte les fosses qu'il couvre (≈ 6,3 px par caractère)
      const texte = Math.max(p.nom.length, p.cond ? p.cond.length * 0.8 + 3 : 0) * 6.3;
      return { de, a: Math.max(p.plein[1], p.tirets ? p.tirets[1] : -1, p.plein[0] + Math.ceil((texte - L.W) / (L.W + L.G))) };
    }));
    ph.forEach((p, j) => {
      const yy = y + rangP[j] * 32;
      const [a, b] = p.plein;
      s += `<path d="M${xs[a] - 6} ${yy}H${xs[b] + L.W + 6}" class="st-phase"/>`;
      if (p.tirets) s += `<path d="M${xs[p.tirets[0]] - 6} ${yy}H${xs[p.tirets[1]] + L.W + 6}" class="st-phase st-phase-t"/>`;
      s += `<text x="${xs[a] - 6}" y="${yy - 5}" class="st-phase-n">${p.nom}</text>`;
      droite = Math.max(droite, xs[a] - 6 + p.nom.length * 6.3, p.cond ? xs[a] - 6 + (p.cond.length + 3) * 5 : 0);
      if (p.cond) s += `<text x="${xs[a] - 6}" y="${yy + 13}" class="st-phase-c">si ${p.cond}</text>`;
    });
    y += nP * 32 + 14;
    // durées en crochets
    const ds = o.durees || [];
    const { pos, n: nC } = couloirs(ds);
    ds.forEach((d, i) => {
      const yy = y + pos[i] * 36, x1 = xs[d.de] + 4, x2 = xs[d.a] + L.W - 4;
      droite = Math.max(droite, (x1 + x2) / 2 + Math.max(d.t.length * 6.4, d.court.length * 5.2) / 2);
      s += `<path d="M${x1} ${yy - 6}V${yy}H${x2}V${yy - 6}" class="st-crochet"/><text x="${(x1 + x2) / 2}" y="${yy + 13}" text-anchor="middle" class="st-d-t">${d.t}</text><text x="${(x1 + x2) / 2}" y="${yy + 25}" text-anchor="middle" class="st-d-q">${d.court}</text>`;
    });
    const hauteur = y + nC * 36 + (nC ? 6 : -10);
    const largeur = Math.ceil(Math.max(largeurFosses, droite + 10));
    return `<svg class="st-fosses" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}" role="img" aria-label="Fosses de sols côte à côte">${s}</svg>`;
  }

  // ---------- 5. Rendu d'une frise et de ses sources ----------
  function numeroteur() {
    const ordre = [];
    const n = (cle) => { if (!ordre.includes(cle)) ordre.push(cle); return ordre.indexOf(cle) + 1; };
    const ref = (cle, lieu) => `<span class="st-ref">[${n(cle)}${lieu ? ", " + lieu : ""}]</span>`;
    const texte = (t) => t.replace(/\{\{(\w+)\|([^}]*)\}\}/g, (_, c, l) => ref(c, l));
    return { ordre, ref, texte, refs: (s) => (s || []).map(([c, l]) => ref(c, l)).join(" ") };
  }
  function friseHTML(f) {
    const branches = (f.branches || []).map((b) => `<div class="st-branche">
      <p class="st-branche-tete">${b.depuis == null ? `Sur un ${b.cond}` : `Depuis « ${f.etapes[b.depuis].rp} », si ${b.cond}`}</p>
      <div class="st-defile">${(() => { const es = (b.depuis == null ? [] : [f.etapes[b.depuis]]).concat(b.etapes);
        return fossesSVG(es, { echelle: f.echelle.relative ? f.echelle : { max: Math.max(...es.map((e) => e.h[e.h.length - 1][2])) + 5 } }); })()}</div>
      ${b.durees ? `<ul class="st-durees-branche">${b.durees.map((d) => `<li><b>${d.t}</b> : ${d.court}</li>`).join("")}</ul>` : ""}
    </div>`).join("");
    const roches = f.roches.filter((id) => typeof ROCHES === "undefined" || ROCHES.some((r) => r.id === id))
      .map((id) => { const r = typeof ROCHES !== "undefined" && ROCHES.find((x) => x.id === id); return `<a class="chip" href="#roche/${id}">${r ? r.nom : id}</a>`; }).join("");
    return `<div class="card st-frise-carte">
      <h2>${f.nom}</h2>
      ${roches ? `<p class="st-roches">${roches}</p>` : ""}
      <div class="st-planche"><div class="st-defile">${fossesSVG(f.etapes, { echelle: f.echelle, phases: f.phases, durees: f.durees })}</div></div>
      ${branches ? `<h3 class="st-h3">Autres voies</h3>${branches}` : ""}
    </div>`;
  }
  function sourcesFriseHTML(f) {
    const N = numeroteur();
    const durees = f.durees.concat(...(f.branches || []).map((b) => b.durees || []));
    const blocs = [
      `<p class="page-source"><b>Matériau</b> : ${N.texte(f.materiau)}</p>`,
      `<p class="page-source"><b>Fosses</b> : ${N.texte(f.echelle.src)}</p>`,
      durees.length ? `<p class="page-source"><b>Durées</b> :</p><ol class="st-src-liste">${durees.map((d) =>
        `<li><b>${d.t}</b>, ${d.quoi} ${N.refs(d.s)}${d.cmp === false ? " (résumé de congrès : résultats préliminaires)" : ""}</li>`).join("")}</ol>`
        : `<p class="page-source"><b>Durées</b> : aucune mesure faite en France n'a été trouvée.</p>`,
      (f.branches || []).length ? `<p class="page-source"><b>Autres voies</b> : ${f.branches.map((b) => `${b.etapes.map((e) => e.rp).join(", ")} ${N.refs(b.refs)}`).join(" ; ")}.</p>` : "",
      (f.notes || []).length ? `<p class="page-source"><b>À noter</b> :</p><ul class="st-src-liste">${f.notes.map((t) => `<li>${N.texte(t)}</li>`).join("")}</ul>` : "",
      `<p class="page-source"><b>Noms</b> : noms du Référentiel pédologique 2008 ; sous chaque nom, l'équivalent WRB 2006 donné par le Référentiel ${N.ref("rp2008", "annexe 5")}, les Albeluvisols étant devenus Retisols ${N.ref("wrb2022", "")}.</p>`,
    ];
    return blocs.join("") + `<p class="page-source"><b>Références</b> :</p><ol class="st-src-liste">${N.ordre.map((c) => `<li>${SRC[c]}</li>`).join("")}</ol>`;
  }

  // ---------- 6. Comparer : tableau des durées ----------
  function lignesComparer() {
    return FRISES.map((f) => ({ f, ds: f.durees.filter((d) => d.cmp !== false) }));
  }
  function comparerHTML() {
    const lignes = lignesComparer().map(({ f, ds }) => {
      if (!ds.length) return `<tr><th scope="row"><a href="#soltemps/${f.id}">${f.nom}</a></th><td colspan="3" class="st-gris">non renseignée</td></tr>`;
      return ds.map((d, i) => `<tr>${i === 0 ? `<th scope="row" rowspan="${ds.length}"><a href="#soltemps/${f.id}">${f.nom}</a></th>` : ""}
        <td>${f.etapes[d.de].rp} → ${f.etapes[d.a].rp}</td><td><b>${d.t}</b></td><td>${d.court}</td></tr>`).join("");
    }).join("");
    return `<div class="card">
      <h2>Comparer les durées</h2>
      <div class="st-table-wrap"><table class="st-table">
        <thead><tr><th>Matériau</th><th>Étapes couvertes</th><th>Durée</th><th>Ce qui est daté</th></tr></thead>
        <tbody>${lignes}</tbody></table></div>
    </div>`;
  }
  function sourcesComparerHTML() {
    const N = numeroteur();
    const items = lignesComparer().flatMap(({ f, ds }) => ds.map((d) => `<li><b>${f.nom}, ${d.t}</b> : ${d.quoi} ${N.refs(d.s)}</li>`));
    return `<p class="page-source">Seules figurent au tableau les durées tirées d'un livre ou d'un article : les résumés de congrès (terrils) et les calculs en sont exclus.</p>
      <ol class="st-src-liste">${items.join("")}</ol>
      <p class="page-source"><b>Références</b> :</p><ol class="st-src-liste">${N.ordre.map((c) => `<li>${SRC[c]}</li>`).join("")}</ol>`;
  }

  // ---------- 7. Page ----------
  const PLUS_LOIN = `<div class="card">
    <h2>Pour aller plus loin</h2>
    <p><b>L'âge d'un sol n'est pas celui de sa roche.</b> Sur les socles du Massif central et du Massif armoricain, les arènes de granite atteignent 10 à plus de 30 m d'épaisseur et remonteraient au Miocène, voire au Crétacé ; le sol mince qui les coiffe est, lui, récent.</p>
    <p><b>Le matériau compte autant que le temps.</b> Soixante centimètres de sol se forment en quelques milliers d'années sur un limon faiblement calcaire, et en un temps 50 à 100 fois plus long sur un calcaire jurassique à 97 % de calcite, dont il faut d'abord dissoudre la roche pour en garder le résidu.</p>
    <p><b>Dater un horizon n'est pas dater un sol.</b> Le carbone 14 donne l'âge moyen d'une matière organique sans cesse renouvelée : pour les podzols des Vosges, Guillet estimait la durée réelle de formation deux à trois fois plus longue que l'âge mesuré.</p>
    <p><b>Les plus vieux sols de France</b> sont ceux des hautes terrasses du Rhône : 15 à 20 m d'épaisseur accumulés en 1,8 à 2,3 millions d'années. À l'inverse, l'érosion remet le compteur à zéro : sur les marnes nues de Draix, chaque hiver emporte 1 à 3 mm de régolite.</p>
    <p><b>Une étape n'est pas obligatoire.</b> Le planosol secondaire n'apparaît que sur un limon ancien dont l'horizon BT s'est colmaté ; sur calcaire, les sols « restent sains beaucoup plus longtemps ». La pente, la position sur le versant et la pluie décident souvent de la voie suivie.</p>
  </div>`;
  const SOURCES_PLUS_LOIN = `<p class="page-source"><b>Pour aller plus loin</b> : Baize 2021, ch. 3, 6 et 9 (âge des arènes, 60 cm de sol, terrasses du Rhône, planosol) ; Hassko, Guillet et Coppens 1969 (podzols des Vosges) ; Rovéra et Robert 2005 (Draix).</p>`;
  function choixHTML(cle) {
    return `<div class="st-choix" role="tablist">${FRISES.map((f) => `<a class="chip${cle === f.id ? " on" : ""}" href="#soltemps/${f.id}" role="tab" aria-selected="${cle === f.id}">${f.nom}</a>`).join("")}
      <a class="chip${cle === "comparer" ? " on" : ""}" href="#soltemps/comparer" role="tab" aria-selected="${cle === "comparer"}">Comparer les durées</a></div>`;
  }
  function page(cle) {
    if (cle !== "comparer" && !FRISE[cle]) cle = FRISES[0].id;
    const main = document.getElementById("main");
    main.innerHTML = typoHTML(`<div class="st-page">
      ${defsHTML()}
      <div class="card hero">
        ${typeof icone === "function" ? icone("sol", 96, "hero-icone") : ""}
        <p class="hub-surtitre">Pédologie · Quel sol ici ?</p>
        <h1>Le sol au fil du temps</h1>
        <p class="sub" style="font-size:15px;max-width:75ch">Sur un même matériau, le sol passe par une suite d'étapes que les pédologues nomment chronoséquence.
        Sur les dunes d'Oléron, fixées par des palissades à partir de 1820, un podzol s'est formé en moins de deux siècles ; sur les plateaux
        calcaires de Bourgogne, l'argile résiduelle a demandé au moins un à deux millions d'années.</p>
      </div>
      ${choixHTML(cle)}
      ${cle === "comparer" ? comparerHTML() : friseHTML(FRISE[cle])}
      ${PLUS_LOIN}
      <details class="card sources-roche st-sources"><summary><h2 style="display:inline">Sources</h2></summary>
        ${cle === "comparer" ? sourcesComparerHTML() : sourcesFriseHTML(FRISE[cle])}
        ${SOURCES_PLUS_LOIN}
      </details>
    </div>`);
    document.title = (cle === "comparer" ? "Comparer les durées" : FRISE[cle].nom) + " : le sol au fil du temps, Atlas Sol";
    window.scrollTo({ top: 0 });
  }
  function lienRoche(roche) {
    const f = FRISE[DE_ROCHE[roche.id]];
    return f ? `<p class="sub st-lien-roche"><b>Le sol au fil du temps :</b> <a href="#soltemps/${f.id}">frise « ${f.nom} » →</a></p>` : "";
  }
  function menu(cle) {
    return FRISES.map((f) => `<button class="rock-item sub-item ${cle === f.id ? "on" : ""}" data-page="soltemps/${f.id}">${f.nom}</button>`).join("")
      + `<button class="rock-item sub-item ${cle === "comparer" ? "on" : ""}" data-page="soltemps/comparer">Comparer les durées</button>`;
  }

  // ---------- 8. Contrôles ----------
  function controle() {
    const E = [];
    for (const f of FRISES) {
      const toutes = f.etapes.concat(...(f.branches || []).map((b) => b.etapes));
      for (const e of toutes) {
        if (!e.h || !e.h.length) E.push(`${f.id} : ${e.rp} sans horizons`);
        let avant = 0;
        for (const [code, de, a, m] of e.h || []) {
          if (!MOTIFS[m]) E.push(`${f.id} : ${e.rp}, motif ${m} inconnu`);
          if (de !== avant || !(a > de)) E.push(`${f.id} : ${e.rp}, horizon ${code} mal borné`);
          avant = a;
        }
        if (!f.echelle.relative && avant > f.echelle.max) E.push(`${f.id} : ${e.rp} plus profond que l'échelle`);
      }
      for (const p of f.phases) if (!(p.plein[0] <= p.plein[1] && p.plein[1] < f.etapes.length)) E.push(`${f.id} : phase « ${p.nom} » mal bornée`);
      for (const d of f.durees.concat(...(f.branches || []).map((b) => b.durees || []))) {
        if (!d.court) E.push(`${f.id} : durée « ${d.t} » sans libellé court`);
        if (!d.s || !d.s.length) E.push(`${f.id} : durée « ${d.t} » sans source`);
      }
      for (const d of f.durees) if (!(d.de >= 0 && d.a < f.etapes.length && d.de < d.a)) E.push(`${f.id} : durée « ${d.t} » mal bornée`);
      const cles = [...[f.materiau, f.echelle.src, ...(f.notes || [])].join(" ").matchAll(/\{\{(\w+)\|/g)].map((m) => m[1]);
      for (const d of f.durees.concat(...(f.branches || []).map((b) => b.durees || []))) for (const [c] of d.s) cles.push(c);
      for (const b of f.branches || []) { if (b.depuis != null && !f.etapes[b.depuis]) E.push(`${f.id} : branche depuis une étape absente`); for (const [c] of b.refs || []) cles.push(c); }
      for (const c of cles) if (!SRC[c]) E.push(`${f.id} : source ${c} absente`);
      if (typeof ROCHES !== "undefined") for (const r of f.roches) if (!ROCHES.some((x) => x.id === r)) E.push(`${f.id} : roche ${r} absente`);
      if (/[—–]| - /.test(JSON.stringify(f))) E.push(`${f.id} : tiret de ponctuation`);
    }
    if (/[—–]| - /.test(PLUS_LOIN + SOURCES_PLUS_LOIN)) E.push("Pour aller plus loin : tiret de ponctuation");
    return E;
  }

  window.SolsTemps = { page, lienRoche, menu, controle, fossesSVG, defsHTML, typoHTML, MOTIFS, FRISES, SRC, DE_ROCHE };
})();
