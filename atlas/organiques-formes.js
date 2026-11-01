// ============================================================
// CLASSE X — formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.6
// Chargé après cristal.js. Seules les espèces dont les formes {hkl} sont publiées ET ferment un solide
// sont dessinées ; les distances au centre (d) sont réglées pour retrouver l'habitus décrit.
// Sources des formes : Handbook of Mineralogy (formes et habitus) ; V.M. Goldschmidt, Atlas der
// Krystallformen (1913-1923), relevés du site SMORF, pour la whewellite et la mellite.
// ============================================================

(function () {
  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ─────────── Whewellite ─────────── (Goldschmidt : cristal de Schmid 1871)
    whewellite: {
      nom: "Whewellite", couleur: "#e9e3d4", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "P",
      maille: [6.29, 14.583, 9.971, 90, 107.02, 90],
      macleNote: "Selon {101}, une macle très courante unit deux individus, dont le plan est à la fois plan de macle et plan d'accolement : elle donne des cristaux « en cœur » ou d'allure orthorhombique (Handbook of Mineralogy). Non dessinée, faute de pouvoir vérifier l'orientation de ce plan dans le repère de Goldschmidt.",
      facies: [
        { nom: "Cristal simple (Goldschmidt)",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "e", hkl: [0, 1, 1], nom: "prisme terminal", d: 1.05 },
            { sym: "x", hkl: [-1, 0, 1], nom: "pinacoïde oblique", d: 0.92 },
          ],
          note: "Les trois formes relevées par Goldschmidt sur un cristal décrit par Schmid en 1871 : prisme {110}, faces {011} et pinacoïde {1̄01}. Maille de la structure de Tazzoli et Domeneghetti (1980), exprimée dans le repère de Goldschmidt (axe c′ = a + c, angle β de 107°) pour que les indices des faces soient les siens.",
        },
      ],
      clivages: [],
    },

    // ─────────── Weddellite ───────────
    weddellite: {
      nom: "Weddellite", couleur: "#eeeae0", systeme: "quadratique", classe: "4/m",
      classeNom: "bipyramidale quadratique", reseau: "I",
      maille: [12.371, 12.371, 7.357, 90, 90, 90],
      facies: [
        { nom: "Bipyramide (« enveloppe »)", elevation: 22,
          formes: [{ sym: "e", hkl: [0, 1, 1], nom: "bipyramide", d: 1.0 }],
          note: "Quatre faces triangulaires en haut, quatre en bas : la bipyramide compte huit faces identiques. Selon l'axe c, elle forme un carré barré de ses deux diagonales, l'« enveloppe » des sédiments et des urines.",
        },
        { nom: "Bipyramide tronquée",
          formes: [
            { sym: "e", hkl: [0, 1, 1], nom: "bipyramide", d: 1.0 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.95 },
          ],
          note: "Forme signalée par le Handbook of Mineralogy : une bipyramide tronquée à ses deux pointes par le pinacoïde {001}.",
        },
      ],
      clivages: [],
    },

    // ─────────── Mellite ─────────── (Goldschmidt : cristaux d'Artern ; indices convertis dans la maille de la structure)
    mellite: {
      nom: "Mellite", couleur: "#d99a33", systeme: "quadratique", classe: "4/mmm",
      classeNom: "bipyramidale ditétragonale", reseau: "I",
      maille: [15.553, 15.553, 23.11, 90, 90, 90],
      facies: [
        { nom: "Bipyramide", elevation: 14,
          formes: [{ sym: "p", hkl: [1, 1, 2], nom: "bipyramide", d: 1.0 }],
          note: "À Artern (Thuringe), les cristaux prennent le plus souvent la forme d'une bipyramide carrée, presque aussi haute que large. Goldschmidt la note {101} dans une maille inclinée de 45° ; dans la maille de la structure (Robl et Kuhs 1991), elle se lit {112}.",
        },
        { nom: "Bipyramide, prisme et base",
          formes: [
            { sym: "p", hkl: [1, 1, 2], nom: "bipyramide", d: 1.0 },
            { sym: "m", hkl: [1, 0, 0], nom: "prisme", d: 1.5 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.2 },
          ],
          note: "Trois formes ressortent des cristaux d'Artern selon Goldschmidt ({101}, {110} et {001}) : le prisme biseaute les coins de la bipyramide, la base tronque ses pointes.",
        },
      ],
      clivages: [],
    },

    // ─────────── Humboldtine ───────────
    humboldtine: {
      nom: "Humboldtine", couleur: "#d8a640", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "I",
      maille: [9.707, 5.556, 9.921, 90, 104.5, 90],
      facies: [
        { nom: "Petit prisme (rare)",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.08 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.9 },
            { sym: "r", hkl: [1, 0, 1], nom: "pinacoïde oblique", d: 1.8 },
          ],
          note: "Les cristaux de humboldtine, rares, sont de petits prismes allongés selon c, avec {110}, {100}, {001} et {101} (Handbook of Mineralogy, maille du composé synthétique). En général, elle forme plutôt des croûtes fibreuses et mamelonnées, sans faces.",
        },
      ],
      clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "selon le prisme", pas: 0.22 }],
    },

    // ─────────── Falottaïte ───────────
    falottaite: {
      nom: "Falottaïte", couleur: "#ece8df", systeme: "orthorhombique", classe: "mmm",
      classeNom: "bipyramidale rhombique", reseau: "P",
      maille: [10.527, 6.626, 9.783, 90, 90, 90],
      facies: [
        { nom: "Cristal en barque",
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde (aplatissement)", d: 0.42 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "d", hkl: [1, 0, 1], nom: "prisme terminal", d: 1.9 },
          ],
          note: "Allongée selon c, aplatie sur {010} et biseautée à son extrémité par {101} : la « barque » décrite par le Handbook of Mineralogy (cristaux atteignant 1 mm).",
        },
      ],
      clivages: [],
    },

    // ─────────── Natroxalate ───────────
    natroxalate: {
      nom: "Natroxalate", couleur: "#ede1c0", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "P",
      maille: [10.426, 5.255, 3.479, 90, 93.14, 90],
      macleNote: "Macle selon {110} (Handbook of Mineralogy), non représentée.",
      facies: [
        { nom: "Prisme allongé",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.15 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.1 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.6 },
            { sym: "p", hkl: [2, 2, 1], nom: "prisme terminal", d: 2.0 },
          ],
          note: "En agrégats rayonnants, des cristaux allongés selon c atteignent 5 mm et portent {110}, {001}, {010}, {100} et {221} (Handbook of Mineralogy, qui emploie cette maille).",
        },
      ],
      clivages: [
        { hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.2 },
        { hkl: [0, 0, 1], qualite: "net", nom: "{001}", pas: 0.26 },
      ],
    },

    // ─────────── Phoxite ───────────
    phoxite: {
      nom: "Phoxite", couleur: "#e6dfcf", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "P",
      maille: [7.2962, 13.5993, 7.8334, 90, 108.271, 90],
      facies: [
        { nom: "Lame striée",
          formes: [
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde (aplatissement)", d: 0.6 },
            { sym: "l", hkl: [1, 2, 0], nom: "prisme", d: 1.0 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 0.9 },
            { sym: "e", hkl: [0, 1, 1], nom: "prisme terminal", d: 2.3 },
            { sym: "p", hkl: [1, 1, 1], nom: "prisme terminal", d: 1.5 },
          ],
          note: "Lames de 0,4 mm allongées et striées selon c, aplaties sur {100}, avec {120}, {110}, {011} et {111} (Handbook of Mineralogy, maille de Kampf et al. 2019).",
        },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "assez bon", nom: "{100}", pas: 0.24 }],
    },

    // ─────────── Natrosulfatourée ───────────
    natrosulfatourea: {
      nom: "Natrosulfatourée", couleur: "#ecece8", systeme: "orthorhombique", classe: "mmm",
      classeNom: "bipyramidale rhombique", reseau: "P",
      maille: [5.5918, 18.1814, 6.7179, 90, 90, 90],
      azimut: 62, elevation: 12,
      facies: [
        { nom: "Prisme allongé selon a",
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde (aplatissement)", d: 0.6 },
            { sym: "k", hkl: [0, 2, 1], nom: "prisme", d: 1.0 },
            { sym: "q", hkl: [0, 4, 1], nom: "prisme", d: 0.8 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme terminal", d: 2.3 },
            { sym: "s", hkl: [1, 3, 1], nom: "bipyramide", d: 2.0 },
          ],
          note: "Prismes de 0,3 mm allongés selon a, légèrement aplatis sur {010}, avec {021}, {041}, {110} et {131} (Handbook of Mineralogy). Dessin orienté de façon à montrer l'allongement selon a.",
        },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.2 }],
    },

    // ─────────── Paceïte ───────────
    paceite: {
      nom: "Paceïte", couleur: "#4a8fd0", systeme: "quadratique", classe: "4/m",
      classeNom: "bipyramidale quadratique", reseau: "I",
      maille: [11.152, 11.152, 16.24, 90, 90, 90],
      facies: [
        { nom: "Prisme court",
          formes: [
            { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.9 },
            { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.25 },
          ],
          note: "Au plus de 1 mm, les prismes courts portent {100}, {001} et {111} (Handbook of Mineralogy).",
        },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.22 }],
    },

    // ─────────── Minguzzite ───────────
    minguzzite: {
      nom: "Minguzzite", couleur: "#9fbe57", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "P",
      maille: [7.66, 19.87, 10.27, 90, 105.1, 90],
      facies: [
        { nom: "Cristal",
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.75 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "p", hkl: [1, 1, 1], nom: "prisme terminal", d: 1.3 },
            { sym: "o", hkl: [-1, 1, 1], nom: "prisme terminal", d: 1.3 },
          ],
          note: "Ne mesurant que 0,1 mm, ces cristaux portent {010}, {111}, {1̄11} et {110} (Handbook of Mineralogy ; maille du composé synthétique, Herpin 1958).",
        },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.22 }],
    },

    // ─────────── Zugshunstite-(Ce) ───────────
    zugshunstite_ce: {
      nom: "Zugshunstite-(Ce)", couleur: "#e7dde6", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "C",
      maille: [8.718, 18.313, 13.128, 90, 93.9, 90],
      azimut: 62, elevation: 12,
      facies: [
        { nom: "Cristal trapu",
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "e", hkl: [0, 1, 2], nom: "prisme", d: 0.95 },
            { sym: "p", hkl: [1, 1, 1], nom: "prisme terminal", d: 1.7 },
          ],
          note: "Trapus, légèrement étirés selon a, les cristaux portent {010}, {012} et de petites faces {111} (Handbook of Mineralogy).",
        },
      ],
      clivages: [],
    },

    // ─────────── Levinsonite-(Y) ───────────
    levinsonite_y: {
      nom: "Levinsonite-(Y)", couleur: "#ecece6", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "P",
      maille: [10.289, 9.234, 11.015, 90, 108.5, 90],
      facies: [
        { nom: "Prisme aplati",
          formes: [
            { sym: "r", hkl: [1, 0, 1], nom: "pinacoïde (aplatissement)", d: 0.5 },
            { sym: "s", hkl: [-1, 0, 1], nom: "pinacoïde", d: 1.15 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.4 },
          ],
          note: "Les prismes, aplatis selon {101}, sont bordés de {1̄01} et de {010} (Handbook of Mineralogy).",
        },
      ],
      clivages: [{ hkl: [1, 0, 1], qualite: "parfait", nom: "{101}", pas: 0.2 }],
    },

    // ─────────── Coskrénite-(Ce) ───────────
    coskrenite_ce: {
      nom: "Coskrénite-(Ce)", couleur: "#ebdfe6", systeme: "triclinique", classe: "-1",
      classeNom: "pinacoïdale", reseau: "P",
      maille: [6.007, 8.368, 9.189, 99.9, 105.55, 107.71],
      facies: [
        { nom: "Tablette",
          formes: [
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde (aplatissement)", d: 0.4 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.1 },
          ],
          note: "Une tablette oblique, aplatie sur {100}, est la seule forme possible dans la classe la moins symétrique : trois paires de faces parallèles (Handbook of Mineralogy). Les cristaux réels, en coin, ne sont pas reproduits.",
        },
      ],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.22 }],
    },
  });

  if (typeof MIN_F === "undefined") return;

  // ─────────────────────────── MODES DE FORMATION ───────────────────────────
  // cond: false = pas de diagramme (sansDiagramme dit pourquoi) ; les diagrammes sont ceux de formation-conditions.js.
  const LICHEN = "Pas de diagramme : ce n'est pas la température ni la profondeur qui tranchent, mais un organisme fournissant l'acide.";
  const GUANO = "Pas de diagramme : c'est la sécheresse du lieu qui décide, en empêchant ces sels solubles d'être emportés.";
  const HYDRO = "Pas de diagramme : on ne connaît pas de températures ni de pressions de dépôt pour ces filons.";
  Object.assign(MIN_F, {
    whewellite: {
      forme: `Monoclinique, ce cristal n'a qu'un seul axe privilégié (b) et un seul miroir ; son prisme est donc dissymétrique, et ses faces {1̄01} ne se répètent pas d'un côté à l'autre. Très souvent maclés, ces cristaux font naître deux individus soudés selon {101}, les cristaux « en cœur ». Le clivage {101} est bon.`,
      intro: `Le calcium est fourni par une roche ou une eau calcaire, tandis que l'oxalate provient presque toujours de la matière organique. La whewellite apparaît partout où ces deux apports se rencontrent, de la profondeur d'un bassin sédimentaire à la surface d'une pierre de cathédrale.`,
      scenarios: [
        { nom: "Dans les septarias",
          texte: `Des nodules calcaires, les septarias, se forment dans une boue marine riche en matière organique ; fendus de l'intérieur, ils ont donné leur nom. Des fluides circulèrent ensuite dans leurs fentes, lors de l'enfouissement des marnes callovo-oxfordiennes de la Drôme et des Hautes-Alpes : y précipitèrent calcite, quartz, dolomite, célestine, hydrocarbures… et, à Condorcet, des cristaux de whewellite d'environ 1 cm, dont l'oxalate sort des marnes elles-mêmes.`,
          cond: false, sansDiagramme: "Pas de diagramme : on n'a pas publié où se place la whewellite dans la succession de cristallisation des septarias.",
          src: [] },
        { nom: "Dans les filons et les houillères",
          texte: `Des eaux chaudes et peu profondes traversent des terrains chargés de matière organique (charbons, schistes noirs) : elles déposent alors de la whewellite dans des filons à carbonates et sulfures. Cristaux de Burgk près de Dresde, de Kladno en Bohême, de Cavnic en Roumanie. Certains gisements d'uranium en portent aussi.`,
          cond: false, sansDiagramme: HYDRO, src: [] },
        { nom: "Sous les lichens et dans les sols",
          texte: `Acide oxalique sécrété par les lichens et de nombreuses plantes : sur un calcaire ou un marbre, il attaque la calcite, puis le calcium précipite à nouveau, cette fois en oxalate. Ainsi naissent des patines de whewellite et de weddellite sur les roches et les monuments. Dans les sols, des bactéries transforment ensuite cet oxalate en calcite, selon la voie oxalate-carbonate, qui piège sous forme de calcaire le carbone de l'air.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    weddellite: {
      forme: `Chaque face se répète quatre fois autour de l'axe c dans la symétrie quadratique : une face {011} en entraîne trois autres en haut et quatre en bas. Quant à la bipyramide, elle reste aplatie, car la maille est courte selon c (7,36 Å) et large selon a (12,37 Å) : ses faces ne plongent que d'une trentaine de degrés.`,
      intro: `Plus hydratée que la whewellite, la weddellite naît dans les vases, les tourbières, le guano et sous les lichens, avant de se transformer en whewellite, plus stable.`,
      scenarios: [
        { nom: "Dans la vase des mers froides",
          texte: `Au fond de la mer de Weddell, des cristaux millimétriques se forment dans la vase : l'oxalate tire son origine de la matière organique en décomposition, et le calcium de l'eau de mer. Une fois remontés à l'air, ils perdent leur eau et deviennent de la whewellite.`,
          cond: false, sansDiagramme: "Pas de diagramme : aucune donnée publiée sur la température ni sur la teneur en oxalate dans ces vases.", src: [] },
        { nom: "Sous les lichens",
          texte: `À la surface de la pierre et sous le lichen, l'oxalate de calcium se reprécipite en weddellite et en whewellite, après que l'acide oxalique des lichens a dissous la calcite des calcaires et des marbres.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    glushinskite: {
      intro: `Sous des lichens, l'oxalate de magnésium n'apparaît qu'à la surface des roches riches en magnésium.`,
      scenarios: [
        { nom: "Sous un lichen, sur une serpentinite",
          texte: `Sur une serpentinite de Mill of Johnston (Écosse), le lichen <i>Lecanora atra</i> sécrète un acide oxalique qui dissout les minéraux magnésiens. Entre roche et lichen, le magnésium libéré se fixe sur place : grains de glushinskite de quelques micromètres, auxquels s'ajoute un peu de whewellite.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    andreybulakhite: {
      intro: `À l'intérieur même d'un lichen, un minéral prend forme.`,
      scenarios: [
        { nom: "Dans un lichen, sur un minerai de nickel",
          texte: `Le lichen <i>Lecanora</i> cf. <i>polytropa</i>, posé sur le minerai oxydé de cuivre et de nickel de Montchegorsk (Kola), dissout le nickel grâce à son acide oxalique. Dans ses organes reproducteurs (apothécies) cristallise l'oxalate de nickel, en cristaux de 30 µm.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    evenkite: {
      intro: `Une paraffine issue de la matière organique des roches sédimentaires, portée à la chaleur pendant l'enfouissement.`,
      scenarios: [
        { nom: "Dans les septarias des Alpes du Sud",
          texte: `Dans le Bassin vocontien, les marnes oxfordiennes renferment de la matière organique marine, dont une partie demeure dans les nodules. Sous plusieurs kilomètres de sédiments, la chaleur la transforme en hydrocarbures (Spangenberg 1998), et les fluides les acheminent dans les fentes des septarias. Le quartz s'y est déposé à plus de 2 000 m, la dolomite associée indique 60 à 180 °C : c'est la fenêtre à pétrole. L'évenkite a cristallisé à une date inconnue ; l'érosion des Alpes a ensuite ramené les nodules au jour.`,
          cond: { type: "enfouissement", tmax: 170, zmax: 5, seuils: ["huile"],
            chemin: [
              { age: 160, z: 0, n: 1, t: "Des marnes chargées de matière organique se déposent, et les nodules (septarias) prennent naissance près de la surface." },
              { age: 100, z: 3.5, n: 2, t: "Quand les marnes, enfouies à plusieurs kilomètres, atteignent la fenêtre à pétrole, la matière organique se craque en hydrocarbures, qui rejoignent les fentes des nodules. C'est au cours de cette histoire que l'évenkite cristallise, à un moment non daté." },
              { age: 20, z: 1.5, n: 3, t: "Avec les Alpes, les marnes se trouvent soulevées, puis elles se refroidissent." },
              { age: 0, z: 0, n: 4, t: "L'érosion dégage les septarias." },
            ],
            note: "Profondeurs et dates ne sont ici que des ordres de grandeur ; elles se calent sur les indices publiés (quartz à plus de 2 000 m, dolomite en selle de 60 à 180 °C), et le chemin demeure schématique." },
          src: [] },
      ],
    },
    branchite: {
      intro: `Préservée dans les charbons et les bois fossiles, cette molécule provient de la résine des conifères.`,
      scenarios: [
        { nom: "Dans les lignites et les bois fossiles",
          texte: `Des diterpènes entrent dans la résine des conifères. Dans les tourbières, puis dans les lignites, certains se changent en hydrocarbures saturés, comme le phyllocladane. Quand le bois fossile se fend, la molécule cristallise en paillettes blanches dans les fissures : c'est la branchite de Bílina et d'Oberhart. Un lessivage du lignite aux solvants en fournit également.`,
          cond: false, sansDiagramme: "Pas de diagramme : ces dépôts se forment à faible profondeur, et aucun seuil de température n'a été publié.", src: [] },
      ],
    },
    mellite: {
      intro: `Né du contact entre un lignite et une argile, ce sel dérive de l'acide mellitique.`,
      scenarios: [
        { nom: "Dans les lignites",
          texte: `La mellite se rencontre en masses et en bipyramides dans les fissures et les nodules du charbon brun d'Artern et de Bitterfeld (Allemagne), de Tatabánya (Hongrie) et de Toula (Russie). On suppose que son acide mellitique naît de la dégradation de la matière végétale du lignite, et son aluminium des argiles voisines.`,
          cond: false, sansDiagramme: "Pas de diagramme : ni la température de cristallisation ni le moment où elle s'est produite n'ont été publiés.", src: [] },
      ],
    },
    carpathite: {
      intro: `La nature purifie ici le coronène : matière organique chauffée, puis transportée et recristallisée.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `Il cristallise dans les filons à cinabre et quartz, après les autres minéraux, à moins de 250 °C (isotopes du carbone et forme du gisement de Picacho, Californie). Les hydrocarbures aromatiques issus de la matière organique marine chauffée en profondeur remontent avec des fluides chauds ; les molécules les moins stables se détruisent en chemin, et le coronène, très stable, se concentre.`,
          cond: false, sansDiagramme: HYDRO, src: [] },
      ],
    },
    freitalite: {
      intro: `Un minéral de terril en feu.`,
      scenarios: [
        { nom: "Autour d'un terril en combustion",
          texte: `Lentement oxydé, un terril de charbon peut couver pendant des années à l'abri de l'air. Le charbon s'y décompose sans flamme (pyrolyse) et dégage des hydrocarbures aromatiques : ceux-ci se déposent par sublimation en cristaux sur les parois plus froides des fissures (anthracène, ou freitalite ; phénanthrène, ou ravatite ; fluorène, ou kratochvílite).`,
          cond: false, sansDiagramme: "Pas de diagramme : on n'a pas publié les températures de dépôt de la freitalite ; la ravatite, elle, se dépose sous 50 à 60 °C.", src: [] },
      ],
    },
    urea: {
      intro: `Minéral qui ne se rencontre que là où il ne pleut presque jamais.`,
      scenarios: [
        { nom: "Dans le guano des grottes arides",
          texte: `De l'urée se trouve dans l'urine et le guano des chauves-souris. Très soluble, elle part à la première pluie ; seules les grottes et les abris des déserts d'Australie-Occidentale la laissent cristalliser, en croûtes et en petites stalagmites.`,
          cond: false, sansDiagramme: GUANO, src: [] },
      ],
    },
    phoxite: {
      intro: `Dans une mine abandonnée, un minéral naît du guano des chauves-souris.`,
      scenarios: [
        { nom: "Dans le guano d'une mine chaude et humide",
          texte: `Des chauves-souris occupent les galeries abandonnées de la mine Rowley (Arizona), chaudes et humides. Leurs excréments frais libèrent ammonium, phosphate et oxalate : ces produits réagissent avec les minéraux de la roche et du minerai, et la phoxite croît en masses circulaires de guano récent, à 38 m de profondeur.`,
          cond: false, sansDiagramme: "Pas de diagramme : ce n'est ni la température ni la pression, mais la chimie du guano, qui décide.", src: [] },
      ],
    },
  });

  // ─────────────────────────── MODES DE FORMATION DES AUTRES ESPÈCES (texte seul) ───────────────────────────
  // Un paragraphe par milieu, repris du Handbook of Mineralogy et des articles de description, complété d'une
  // phrase propre à l'espèce. Aucun diagramme : les conditions (température, concentrations) ne sont pas publiées.
  const ENV = {
    rowley: "Depuis 2019, des dizaines d'espèces nouvelles ont été décrites dans la mine Rowley (Arizona), où des chauves-souris habitent des galeries chaudes et humides. Leur guano libère ammonium, phosphate, urée et oxalate, qui réagissent avec la roche et le minerai.",
    pica: "Au désert d'Atacama (Chili), à Pabellón de Pica, du guano d'oiseaux marins repose sur un gabbro renfermant de la chalcopyrite. Sous un climat hyperaride, les solutions azotées du guano et le cuivre de la roche se rejoignent dans les fissures, à l'abri de la pluie qui les emporterait.",
    catalina: "Des eaux chargées d'acide glycolique, produit par la décomposition des plantes ou par l'activité bactérienne, ont réagi avec les métaux libérés par l'altération des minéraux, à Pusch Ridge (Santa Catalina Mountains, Arizona).",
    terril: "Là où un terril ou une couche de charbon brûle lentement à l'abri de l'air, la pyrolyse décompose le charbon ; les gaz organiques libérés cristallisent sur les parois plus froides des fissures.",
    lignite: "La matière végétale des lignites et des bois fossiles évolue lentement ; certaines de ses molécules, ou les acides qu'elle libère, cristallisent dans les fissures du charbon ou du bois.",
    alum: "Sous un surplomb rocheux d'Alum Cave Bluff (Great Smoky Mountains, Tennessee), des eaux acides et sulfatées s'évaporent, produites par l'oxydation de la pyrite d'un phyllade. Les terres rares viennent de la monazite et du xénotime de la roche.",
    guano: "Quand le lieu est assez sec pour que l'eau ne les entraîne pas, les déchets azotés du guano (urée, acide urique et leurs dérivés) cristallisent : îles du Pérou, grottes d'Australie-Occidentale.",
    chapeau: "Près de la surface, dans la zone oxydée d'un gisement métallifère, des acides organiques issus des plantes (litière, racines) ou des bois de mine rencontrent les métaux libérés par l'altération des sulfures.",
    uranium: "Le minerai d'uranium des grès du plateau du Colorado est intimement lié au bois fossile. Après l'exploitation, des efflorescences se forment sur les parois, au gré de l'eau qui suinte : l'oxalate du bois y rencontre l'uranium et les autres métaux.",
  };
  const SEC = "Pas de diagramme : ce sont la chimie du lieu et sa sécheresse qui comptent, et non la température ni la profondeur.";
  const TXT = "Pas de diagramme : aucune condition de cristallisation n'a été publiée.";
  const sc = (nom, env, propre, pourquoi) => ({ scenarios: [{ nom, texte: (env ? ENV[env] + " " : "") + propre, cond: false, sansDiagramme: pourquoi || TXT }] });
  const AUTRES = {
    humboldtine: sc("Dans les lignites", "lignite", "La humboldtine se présente en croûtes jaunes dans les fissures des lignites altérés de Bohême ; son oxalate provient de la décomposition des végétaux."),
    lindbergite: sc("Dans les pegmatites", null, "Dans les pegmatites granitiques, minéral secondaire qui succède souvent à la falottaïte en perdant de l'eau. Une origine due à des lichens, sur des roches manganésifères, a aussi été décrite."),
    katsarosite: sc("Au Laurion", null, "Grains de 30 µm dans les minerais de zinc oxydés de la mine Esperanza (Laurion, Grèce). Les sources consultées ne précisent pas l'origine de l'oxalate."),
    caoxite: sc("Dans des radiolarites", null, "Des eaux circulant dans la roche fracturée ont déposé des veinules, qui recoupent des radiolarites à manganèse et baryum d'une ophiolite ligure (mine de Cerchiara)."),
    moolooite: sc("Guano, racines et cuivre", "chapeau", "À Mooloo Station (Australie), la moolooïte naît du guano d'oiseaux au contact de minéraux de cuivre secondaires ; à Sainte-Marie-aux-Mines, elle se forme près de racines d'arbres dans un puits de mine."),
    natroxalate: sc("Dans une pegmatite alcaline", null, "À Lovozero (Kola), dans une pegmatite très alcaline attaquée par des fluides chauds, l'oxalate s'est formé sans intervention du vivant, à haute température, comme celui de la kyanoxalite.", "Pas de diagramme : la température de formation reste non publiée."),
    oxammite: sc("Dans le guano", "guano", "Sur des œufs et des restes d'oiseaux subfossiles, ainsi que dans le guano d'oiseaux et de chauves-souris, se forme l'oxammite, un oxalate d'ammonium.", SEC),
    falottaite: sc("Dans les mines de manganèse", null, "Des acides humiques et oxaliques issus des plantes ont attaqué les minéraux de manganèse des lentilles de radiolarites des Grisons (Suisse). Le trihydrate cristallise, puis perd son eau pour devenir lindbergite."),
    middlebackite: sc("Dans un minerai de fer altéré", "chapeau", "Dans un minerai de fer manganésifère précambrien, à la carrière Iron Monarch (Australie-Méridionale), l'oxalate vient probablement de matière organique en décomposition, et le cuivre de sulfures altérés."),
    fiemmeite: sc("Dans des troncs houillifiés", null, "Enfermés dans un grès continental du Val di Fiemme, des troncs d'arbres houillifiés ont été traversés par des solutions chargées de cuivre et d'uranium. L'oxalate vient de la diagenèse des restes végétaux du grès."),
    edwindavisite: sc("Dans le guano de chauves-souris", "rowley", "L'edwindavisite, oxalate de cuivre portant une molécule d'ammoniac, se forme dans ce milieu, avec l'ammineïte et l'ebnérite.", SEC),
    stepanovite: sc("Dans un lignite de Iakoutie", "lignite", "Dans le lignite de Tyllakh, dans le delta de la Léna, la stépanovite comble de minces veinules.", SEC),
    zhemchuzhnikovite: sc("Dans un lignite gelé", "lignite", "Prise dans un lignite imprégné naturellement d'acide acétique, la zhemchuzhnikovite apparaît dans une carotte prélevée à 230 m de profondeur, dans le pergélisol de Iakoutie."),
    minguzzite: sc("Dans un chapeau de fer", null, "Rare : on la rencontre dans un chapeau de fer formé sur une dolomie calcaire (Capo Calamita, île d'Elbe). Les sources consultées ne précisent pas l'origine de l'oxalate."),
    wheatleyite: sc("Sur une halde", null, "Un seul spécimen est connu, issu des haldes d'un filon plomb-zinc (mine Wheatley, Pennsylvanie) ; le cuivre a été pris dans le minerai altéré du déblai."),
    antipinite: sc("Sous le guano, au désert", "pica", "On retrouve l'antipinite à la mine Rowley, où elle réunit l'oxalate du guano et le cuivre de la chalcopyrite.", SEC),
    novgorodovaite: sc("Dans un dôme de sel", null, "Elle a été trouvée dans une carotte de forage des évaporites du dôme de sel de Chelkar (Kazakhstan). Les sources consultées ne précisent pas l'origine de l'oxalate."),
    coskrenite_ce: sc("Sous un surplomb rocheux", "alum", "Sous ce surplomb, la coskrénite-(Ce) précipite par évaporation, dans le sol et les croûtes.", SEC),
    levinsonite_y: sc("Sous un surplomb rocheux", "alum", "La levinsonite-(Y) précipite aussi par évaporation, en compagnie de la coskrénite et de la zugshunstite.", SEC),
    zugshunstite_ce: sc("Sous un surplomb rocheux", "alum", "La zugshunstite-(Ce) précipite par évaporation, en compagnie de la coskrénite et de la levinsonite.", SEC),
    deveroite_ce: sc("Dans une fissure alpine", null, "Au mont Cervandone, des lichens crustacés sécrètent de l'acide oxalique ; l'eau de pluie le charrie jusque dans une pegmatite, dissout le cérium de la cervandonite-(Ce), puis redépose cet élément en oxalate dans les fissures.", "Pas de diagramme : ici, c'est un organisme qui apporte l'acide, et la température n'intervient pas."),
    alterite: sc("Dans un bois pétrifié", null, "Près d'un indice d'uranium des Vermilion Cliffs (Arizona), un bois pétrifié riche en carbone sert de support à l'altérite : elle cristallise avec des sulfates (gypse, alunogène, natrojarosite)."),
    magnesioalterite: sc("Dans un bois pétrifié", null, "Il provient du même gisement que l'altérite ; le zinc y est remplacé par du magnésium."),
    uroxite: sc("Sur les parois d'une mine d'uranium", "uranium", "L'uroxite compte parmi ses produits, sous forme de lames jaunes fluorescentes.", SEC),
    metauroxite: sc("Sur les parois d'une mine d'uranium", "uranium", "Moins hydratée que l'uroxite, la métauroxite n'a été observée qu'à la mine Burro (Colorado).", SEC),
    thebaite_nh4: sc("Dans le guano de chauves-souris", "rowley", "L'aluminium de la roche, le phosphate et l'oxalate du guano se rassemblent dans la thébaïte-(NH₄).", SEC),
    dendoraite_nh4: sc("Dans le guano de chauves-souris", "rowley", "Aluminium, sodium, phosphate et oxalate se réunissent ici dans la dendoraïte-(NH₄).", SEC),
    davidbrownite_nh4: sc("Dans le guano de chauves-souris", "rowley", "Dans la zone chaude et humide, à 38 m de profondeur, la davidbrownite-(NH₄) cristallise ; le gisement compte en outre des vanadates (vanadinite, mottramite).", SEC),
    relianceite_k: sc("Dans le guano de chauves-souris", "rowley", "La reliancéite-(K) se forme en compagnie de la vanadinite, de la mottramite et de la wulfénite.", SEC),
    ferriphoxite: sc("Dans le guano de chauves-souris", "rowley", "La ferriphoxite se forme en compagnie de l'antipinite, de la barytine et de la fluorine.", SEC),
    carboferriphoxite: sc("Dans le guano de chauves-souris", "rowley", "Retenant une molécule d'acide carbonique, la carboferriphoxite apparaît avec la ferriphoxite.", SEC),
    formicaite: sc("Dans des veinules hydrothermales", null, "Des veinules hydrothermales recoupent un minerai de bore (Solongo, Bouriatie) et un marbre de skarn (Oural du Nord) : c'est là qu'on rencontre cette espèce, rare."),
    dashkovaite: sc("Dans des veinules hydrothermales", null, "Elle est rare. Des veinules hydrothermales la portent, recoupant la serpentine d'un marbre dolomitique du skarn à fer et bore de Korshunovskoïe (Sibérie)."),
    acetamide: sc("Dans un terril en feu", "terril", "L'acétamide précipite dans ce milieu entre 50 et 150 °C (bassin de Lviv-Volhynie, Ukraine).", "Aucun diagramme n'est établi, la seule donnée publiée étant la fourchette de 50 à 150 °C."),
    calclacite: sc("Dans un tiroir de musée", null, "Dans les vitrines en chêne, l'acide acétique émis par le bois attaque les roches calcaires, les fossiles et les tessons conservés ; la calclacite se développe alors en efflorescences.", "Pas de diagramme : il s'agit d'une réaction accidentelle de laboratoire, survenue à température ambiante."),
    hoganite: sc("Dans un chapeau de fer", "chapeau", "À Broken Hill, l'acide acétique nécessaire à la formation de la hoganite proviendrait de la litière de feuilles et, peut-être, des bois de mine ; il a réagi avec le cuivre.", SEC),
    paceite: sc("Dans un chapeau de fer", "chapeau", "À Broken Hill, la paceïte cristallise en même temps que la hoganite, avec en plus du calcium.", SEC),
    ernstburkeite: sc("Dans la glace de l'Antarctique", null, "L'acide méthanesulfonique résulte, dans l'air, de l'oxydation du sulfure de diméthyle émis par le plancton marin ; fixé sur des poussières alcalines durant un long transport, il a cristallisé en grains de 5 µm après son enfouissement dans la glace de Dôme Fuji.", "Aucun diagramme n'est établi : cette espèce se forme dans l'atmosphère puis dans la glace, hors du champ des diagrammes de l'atlas."),
    lazaraskeite: sc("Sur une crête d'Arizona", "catalina", "Dans cette roche altérée, la lazaraskéite emprunte son cuivre aux minéraux oxydés.", SEC),
    stanevansite: sc("Sur une crête d'Arizona", "catalina", "Le magnésium de la stanevansite provient des minéraux altérés de la roche.", SEC),
    domitrovicite: sc("Sur une crête d'Arizona", "catalina", "La domitrovicite cristallise à partir du zinc libéré par l'altération de la roche.", SEC),
    puschridgeite: sc("Sur une crête d'Arizona", "catalina", "La puschridgeïte cristallise à partir du manganèse libéré par l'altération de la roche.", SEC),
    jimkrieghite: sc("Sur une crête d'Arizona", "catalina", "La jimkrieghite cristallise en présence de calcium, aux côtés de la calcite, de la malachite et de la wulfénite.", SEC),
    rasmussenite: sc("Sur une crête d'Arizona", "catalina", "La rasmussénite forme des gerbes d'aiguilles, associée à la stanevansite et à la lazaraskéite.", SEC),
    glecklerite: sc("Sur une crête d'Arizona", "catalina", "La glecklérite cristallise en présence de sodium, associée à la barytine, à la fluorine et à la jarosite.", SEC),
    henrysunite: sc("Sur une crête d'Arizona", "catalina", "La henrysunite cristallise en présence de sodium, avec une molécule d'eau de constitution.", SEC),
    lianbinite: sc("Sur une crête d'Arizona", "catalina", "La lianbinite y associe l'ammonium à l'acide glycolique.", SEC),
    fuchunite: sc("Sur une crête d'Arizona", "catalina", "Le baryum et l'acide glycolique s'y combinent pour former la fuchunite.", SEC),
    earlandite: sc("Dans la vase antarctique", null, "Nodules verruqueux formés dans les sédiments du fond de la mer de Weddell, à 2 580 m de profondeur, en même temps que la weddellite. Les sources consultées ne précisent pas l'origine du citrate."),
    julienite: sc("Au Katanga", null, "Encroûtement très rare, déposé sur un talcschiste du district cuprifère de Kambove (Katanga). Les sources consultées ne précisent pas l'origine du thiocyanate."),
    joanneumite: sc("Sous le guano, au désert", "pica", "La joanneumite a cristallisé dans les fissures du gabbro, au point de rencontre des solutions issues du cuivre oxydé et de l'azote provenant du guano.", SEC),
    chanabayaite: sc("Sous le guano, au désert", "pica", "La chanabayaïte forme des agrégats rayonnants, puis la bojarite la remplace sur place.", SEC),
    triazolite: sc("Sous le guano, au désert", "pica", "Des cavités, au contact du guano et de la roche, sont tapissées de triazolite.", SEC),
    bojarite: sc("Sous le guano, au désert", "pica", "Avec le salmiac, la halite et la nitratine, la bojarite prend la place de la chanabayaïte tout en gardant la forme de ses agrégats.", SEC),
    pabellondepicaite: sc("Sous le guano, au désert", "pica", "Le triazolate et le nitrate du guano se retrouvent ensemble dans la pabellóndepicaïte.", SEC),
    fichtelite: sc("Dans les pins des tourbières", "lignite", "Dans les tourbières du Fichtelgebirge, la fichtélite forme des paillettes au sein du bois de pins enfouis ; elle se rencontre aussi dans des sédiments marins actuels riches en matière organique."),
    dinite: sc("Dans un bois fossile", "lignite", "La dinite a été découverte dans un bois fossile bitumineux piégé au sein de sédiments fluviatiles (Garfagnana, Toscane)."),
    simonellite: sc("Dans un lignite", "lignite", "La simonellite provient de la résine de conifères conservée dans le lignite de Fognano (Toscane)."),
    wampenite: sc("Dans un bois fossile", "lignite", "Un bois de conifère fossile, provenant de Wampen (Fichtelgebirge), a livré la wampénite."),
    kratochvilite: sc("Dans des schistes en feu", "terril", "Lors de la combustion de schistes pyriteux du bassin de Kladno, la kratochvílite (fluorène) s'est déposée.", SEC),
    ravatite: sc("Elle se dépose dans une couche de charbon en combustion.", "terril", "Dans les couches de charbon en combustion de Ravat (Tadjikistan), la ravatite (phénanthrène) se dépose en deçà de 50 à 60 °C.", "Aucun diagramme n'est établi : une seule température de dépôt est publiée, en deçà de 50 à 60 °C."),
    idrialite: sc("Dans les gisements de mercure", null, "Chauffée au voisinage de sources chaudes ou de fluides hydrothermaux, la matière organique se décompose par pyrolyse ; les hydrocarbures aromatiques migrent puis se déposent avec le cinabre (Idrija, Californie).", "Aucun diagramme n'est établi, les températures de dépôt n'ayant pas été publiées."),
    hokkaidoite: sc("Dans l'opale d'anciennes sources chaudes", null, "Dans l'opale que déposaient d'anciennes sources chaudes du Hokkaidō, le benzo[ghi]pérylène forme des lits ; il se trouve aussi en plaquettes dans des filons de quartz.", "Aucun diagramme n'est établi, les conditions de dépôt n'ayant pas été publiées."),
    refikite: sc("Elle se rencontre dans les lignites et les racines fossilisées.", "lignite", "Un lignite des Abruzzes et des racines d'épicéas fossiles, issues d'un marécage de Bavière, ont fourni la réfikite, acide résinique."),
    flagstaffite: sc("Elle se forme dans des troncs de pins en cours de décomposition.", null, "Au pied des San Francisco Peaks (Arizona), la flagstaffite garnit les fissures de troncs de pins enfouis et en décomposition ; l'hydrate de terpine, lui, vient des terpènes de la résine."),
    hoelite: sc("Autour d'un charbon en feu", "terril", "Autour des évents d'un charbon en combustion du Spitzberg, la hoelite (anthraquinone) forme des croûtes.", SEC),
    kladnoite: sc("Dans un terril en feu", "terril", "La kladnoïte (phtalimide) a été produite par des incendies de terrils, dans le bassin de Kladno.", SEC),
    abelsonite: sc("Dans un schiste bitumineux", null, "Dans les schistes bitumineux de la formation de Green River (Éocène, Utah et Colorado), la chlorophylle des algues a été transformée au cours de la diagenèse : le nickel s'est substitué au magnésium au centre du cycle. Transportée en solution, la molécule a cristallisé dans les fractures et le long des plans de stratification.", "Aucun diagramme n'est établi : les sources consultées ne chiffrent pas les conditions de la diagenèse de l'abelsonite."),
    guanine: sc("Dans le guano", "guano", "La guanine constitue des croûtes granuleuses au sein des encroûtements phosphatés du guano d'oiseaux marins et de chauves-souris.", SEC),
    uricite: sc("Dans le guano", "guano", "Composant azoté majeur des fientes d'oiseaux, l'acide urique cristallisé donne l'uricite.", SEC),
    tinnunculite: sc("Elle se forme sous les fientes, par temps froid, ou sur un terril.", null, "La tinnunculite se forme à partir de l'acide urique des fientes : en climat arctique froid et humide (Kola), ou au contact de gaz chauds d'un terril en combustion (Kopeïsk, Oural), où des faucons crécerelles avaient déposé leurs fientes.", SEC),
    allantoin: sc("Dans le guano de chauves-souris", "rowley", "Dans la grotte des Émirats arabes unis, sous une colonie active, l'allantoïne se dépose par évaporation sur les parois. C'est un produit de dégradation de l'acide urique, présent chez la plupart des mammifères.", SEC),
    marchettiite: sc("Dans une fissure alpine", null, "Dans une fissure du mont Cervandone, l'urate d'ammonium a précipité à partir d'eaux de pluie froides, chargées de matière biologique altérée.", SEC),
    natrosulfatourea: sc("Dans le guano de chauves-souris", "rowley", "La natrosulfatourée s'y dépose par évaporation sur les parois, associée à l'aphthitalite et à l'urée.", SEC),
  };
  for (const [id, f] of Object.entries(AUTRES)) if (!MIN_F[id]) MIN_F[id] = f;
})();
