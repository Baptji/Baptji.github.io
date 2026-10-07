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
      macleNote: "Macle très fréquente sur {101}, à la fois plan de macle et plan d'accolement : deux individus accolés donnent les cristaux « en cœur » ou d'allure orthorhombique (Handbook of Mineralogy). Elle n'est pas dessinée : l'orientation de ce plan dans le repère de Goldschmidt n'a pas pu être vérifiée.",
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
          note: "Huit faces triangulaires identiques, quatre en haut et quatre en bas. Vue selon l'axe c, la bipyramide dessine un carré barré de ses deux diagonales : l'« enveloppe » des sédiments et des urines.",
        },
        { nom: "Bipyramide tronquée",
          formes: [
            { sym: "e", hkl: [0, 1, 1], nom: "bipyramide", d: 1.0 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.95 },
          ],
          note: "La bipyramide dont les deux pointes sont coupées par le pinacoïde {001}, forme signalée par le Handbook of Mineralogy.",
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
          note: "La forme habituelle des cristaux d'Artern (Thuringe) : une bipyramide carrée presque aussi haute que large. Goldschmidt la note {101} dans une maille tournée de 45° ; dans la maille de la structure (Robl et Kuhs 1991), c'est {112}.",
        },
        { nom: "Bipyramide, prisme et base",
          formes: [
            { sym: "p", hkl: [1, 1, 2], nom: "bipyramide", d: 1.0 },
            { sym: "m", hkl: [1, 0, 0], nom: "prisme", d: 1.5 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.2 },
          ],
          note: "Les trois formes relevées par Goldschmidt sur les cristaux d'Artern ({101}, {110} et {001} dans sa notation) : le prisme coupe les coins de la bipyramide, la base en tronque les pointes.",
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
          note: "Les rares cristaux de humboldtine sont de petits prismes allongés selon c, portant {110}, {100}, {001} et {101} (Handbook of Mineralogy, maille du composé synthétique). Le plus souvent, elle forme des croûtes mamelonnées fibreuses, sans faces.",
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
          note: "Allongée selon c, aplatie sur {010}, terminée en biseau par {101} : la « barque » décrite par le Handbook of Mineralogy (cristaux jusqu'à 1 mm).",
        },
      ],
      clivages: [],
    },

    // ─────────── Natroxalate ───────────
    natroxalate: {
      nom: "Natroxalate", couleur: "#ede1c0", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "P",
      maille: [10.426, 5.255, 3.479, 90, 93.14, 90],
      macleNote: "Macle sur {110} (Handbook of Mineralogy), non dessinée.",
      facies: [
        { nom: "Prisme allongé",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.15 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.1 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 2.6 },
            { sym: "p", hkl: [2, 2, 1], nom: "prisme terminal", d: 2.0 },
          ],
          note: "Cristaux allongés selon c, jusqu'à 5 mm, portant {110}, {001}, {010}, {100} et {221}, en agrégats rayonnants (Handbook of Mineralogy, qui emploie cette maille).",
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
          note: "Prismes de 0,3 mm allongés selon a, un peu aplatis sur {010}, avec {021}, {041}, {110} et {131} (Handbook of Mineralogy). Dessin tourné pour montrer l'allongement selon a.",
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
          note: "Prismes courts de 1 mm au plus, avec {100}, {001} et {111} (Handbook of Mineralogy).",
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
          note: "Cristaux de 0,1 mm portant {010}, {111}, {1̄11} et {110} (Handbook of Mineralogy ; maille du composé synthétique, Herpin 1958).",
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
          note: "Cristaux trapus, un peu allongés selon a, avec {010} et {012} et de petites faces {111} (Handbook of Mineralogy).",
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
          note: "Prismes aplatis sur {101}, bordés par {1̄01} et {010} (Handbook of Mineralogy).",
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
          note: "Trois paires de faces parallèles, la seule forme possible dans la classe la moins symétrique : une tablette oblique aplatie sur {100} (Handbook of Mineralogy). Les cristaux réels, en coin, ne sont pas reproduits.",
        },
      ],
      clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.22 }],
    },
  });

  if (typeof MIN_F === "undefined") return;

  // ─────────────────────────── MODES DE FORMATION ───────────────────────────
  // cond: false = pas de diagramme (sansDiagramme dit pourquoi) ; les diagrammes sont ceux de formation-conditions.js.
  const LICHEN = "Pas de diagramme : ici, ce n'est ni la température ni la profondeur qui décident, mais la présence d'un organisme qui fournit l'acide.";
  const GUANO = "Pas de diagramme : ce qui décide ici, c'est la sécheresse du lieu, qui empêche ces sels solubles d'être emportés.";
  const HYDRO = "Pas de diagramme : les températures et pressions de dépôt de ces filons ne sont pas publiées.";
  Object.assign(MIN_F, {
    whewellite: {
      forme: `Un cristal monoclinique : une seule direction privilégiée (l'axe b) et un seul miroir. D'où ce prisme
        dissymétrique, dont les faces {1̄01} ne se répètent pas de l'autre côté. Dans la nature, ces cristaux sont très
        souvent maclés : deux individus soudés sur un plan {101} donnent des cristaux en cœur. Le clivage {101} est bon.`,
      intro: `Le calcium vient d'une roche ou d'une eau calcaire, l'oxalate presque toujours de la matière organique. La
        whewellite se forme partout où les deux se rencontrent, de la profondeur d'un bassin sédimentaire à la surface
        d'une pierre de cathédrale.`,
      scenarios: [
        { nom: "Dans les septarias",
          texte: `Les septarias sont des nodules calcaires nés dans une boue marine riche en matière organique, puis fendus
            de l'intérieur (d'où leur nom). Dans les marnes callovo-oxfordiennes de la Drôme et des Hautes-Alpes, des
            fluides ont circulé dans ces fentes pendant l'enfouissement et y ont déposé calcite, quartz, dolomite, célestine,
            hydrocarbures… et, à Condorcet, des cristaux de whewellite d'environ 1 cm. L'oxalate vient de la matière
            organique des marnes.`,
          cond: false, sansDiagramme: "Pas de diagramme : la place de la whewellite dans la séquence de cristallisation des septarias n'est pas publiée.",
          src: [] },
        { nom: "Dans les filons et les houillères",
          texte: `Des eaux chaudes de basse température qui ont traversé des terrains riches en matière organique,
            charbons ou schistes noirs, déposent de la whewellite dans des filons à carbonates et sulfures : cristaux de
            Burgk près de Dresde, de Kladno en Bohême, de Cavnic en Roumanie. On la trouve aussi dans certains gisements
            d'uranium.`,
          cond: false, sansDiagramme: HYDRO, src: [] },
        { nom: "Sous les lichens et dans les sols",
          texte: `Les lichens et de nombreuses plantes produisent de l'acide oxalique. Sur un calcaire ou un marbre, cet
            acide dissout la calcite et le calcium reprécipite aussitôt en oxalate : patines de whewellite et de weddellite
            sur les roches et les monuments. Dans les sols, des bactéries consomment ensuite cet oxalate et le
            transforment en calcite : c'est la voie oxalate-carbonate, qui fixe du carbone de l'air sous forme de calcaire.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    weddellite: {
      forme: `La symétrie quadratique répète chaque face quatre fois autour de l'axe c : une face {011} en appelle trois
        autres en haut et quatre en bas. La bipyramide est aplatie parce que la maille est courte selon c (7,36 Å) et
        large selon a (12,37 Å) : ses faces ne s'inclinent que d'une trentaine de degrés sur l'horizontale.`,
      intro: `Plus riche en eau que la whewellite, la weddellite se forme dans les vases, les tourbières, le guano et sous
        les lichens ; elle se transforme ensuite en whewellite, plus stable.`,
      scenarios: [
        { nom: "Dans la vase des mers froides",
          texte: `Dans les sédiments du fond de la mer de Weddell, des cristaux millimétriques poussent dans
            la vase : l'oxalate vient de la matière organique qui s'y décompose, le calcium de l'eau de mer. Remontés à
            l'air, ils perdent de l'eau et deviennent de la whewellite.`,
          cond: false, sansDiagramme: "Pas de diagramme : les conditions de croissance dans ces vases (température, teneur en oxalate) ne sont pas publiées.", src: [] },
        { nom: "Sous les lichens",
          texte: `Sur les calcaires et les marbres, l'acide oxalique des lichens dissout la calcite ; l'oxalate de calcium
            reprécipite en weddellite et en whewellite, à la surface de la pierre et sous le lichen.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    glushinskite: {
      intro: `L'oxalate de magnésium ne se forme qu'à la surface des roches riches en magnésium, sous des lichens.`,
      scenarios: [
        { nom: "Sous un lichen, sur une serpentinite",
          texte: `À Mill of Johnston (Écosse), le lichen <i>Lecanora atra</i> colonise une serpentinite. Il sécrète de l'acide
            oxalique, qui dissout les minéraux magnésiens de la roche ; le magnésium libéré cristallise sur place, entre la
            roche et le lichen, en grains de glushinskite de quelques micromètres, avec un peu de whewellite.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    andreybulakhite: {
      intro: `Un minéral qui cristallise à l'intérieur même d'un lichen.`,
      scenarios: [
        { nom: "Dans un lichen, sur un minerai de nickel",
          texte: `Sur le minerai oxydé de cuivre et de nickel de Montchegorsk (Kola), le lichen <i>Lecanora</i> cf.
            <i>polytropa</i> dissout le nickel avec son acide oxalique. L'oxalate de nickel cristallise dans ses organes
            reproducteurs (apothécies), en cristaux de 30 µm.`,
          cond: false, sansDiagramme: LICHEN, src: [] },
      ],
    },
    evenkite: {
      intro: `Une paraffine née de la matière organique des roches sédimentaires, chauffée pendant l'enfouissement.`,
      scenarios: [
        { nom: "Dans les septarias des Alpes du Sud",
          texte: `Les marnes oxfordiennes du Bassin vocontien contiennent de la matière organique marine, piégée aussi
            dans les nodules. Enfouie sous plusieurs kilomètres de sédiments, elle a été « craquée » par la chaleur en
            hydrocarbures (Spangenberg 1998), que les fluides ont fait circuler dans les fentes des septarias : le quartz
            de ces fentes s'est formé à plus de 2 000 m de profondeur, et la dolomite qui l'accompagne indique 60 à
            180 °C, les températures de la fenêtre à pétrole. L'évenkite y a cristallisé, à un moment qui n'est pas
            daté ; le soulèvement et l'érosion des Alpes ont ramené les nodules au jour.`,
          cond: { type: "enfouissement", tmax: 170, zmax: 5, seuils: ["huile"],
            chemin: [
              { age: 160, z: 0, n: 1, t: "Les marnes riches en matière organique se déposent ; les nodules (septarias) naissent près de la surface." },
              { age: 100, z: 3.5, n: 2, t: "Enfouies à plusieurs kilomètres, les marnes atteignent la fenêtre à pétrole : la matière organique est craquée en hydrocarbures, qui gagnent les fentes des nodules. L'évenkite cristallise pendant cette histoire (moment non daté)." },
              { age: 20, z: 1.5, n: 3, t: "Les marnes sont soulevées avec les Alpes et refroidissent." },
              { age: 0, z: 0, n: 4, t: "L'érosion dégage les septarias." },
            ],
            note: "Chemin schématique : les profondeurs et les dates sont des ordres de grandeur, calés sur les indices publiés (quartz à plus de 2 000 m, dolomite en selle de 60 à 180 °C)." },
          src: [] },
      ],
    },
    branchite: {
      intro: `Une molécule de la résine des conifères, conservée dans les charbons et les bois fossiles.`,
      scenarios: [
        { nom: "Dans les lignites et les bois fossiles",
          texte: `La résine des conifères contient des diterpènes. Dans les tourbières puis les lignites, certains se
            transforment en hydrocarbures saturés comme le phyllocladane. Là où le bois fossile est fendu,
            la molécule cristallise en paillettes blanches dans les fissures : c'est la branchite de Bílina et d'Oberhart.
            On l'obtient aussi en lessivant le lignite avec des solvants.`,
          cond: false, sansDiagramme: "Pas de diagramme : ces dépôts se font à faible profondeur, sans seuil de température publié.", src: [] },
      ],
    },
    mellite: {
      intro: `Un sel d'acide mellitique, né de la rencontre d'un lignite et d'une argile.`,
      scenarios: [
        { nom: "Dans les lignites",
          texte: `On pense que l'acide mellitique vient de la dégradation de la matière végétale du lignite, et
            l'aluminium des argiles qui l'entourent. La mellite cristallise en masses et en bipyramides dans les fissures et les nodules du charbon
            brun : Artern et Bitterfeld (Allemagne), Tatabánya (Hongrie), Toula (Russie).`,
          cond: false, sansDiagramme: "Pas de diagramme : la température et le moment de sa cristallisation ne sont pas publiés.", src: [] },
      ],
    },
    carpathite: {
      intro: `Du coronène purifié par la nature : matière organique chauffée, transportée, recristallisée.`,
      scenarios: [
        { nom: "Dans un filon hydrothermal",
          texte: `La matière organique de sédiments marins, chauffée en profondeur, se décompose en hydrocarbures
            aromatiques. Des fluides chauds les emportent vers le haut ; en chemin, les molécules les moins stables se
            détruisent et le coronène, très stable, se concentre. Il cristallise dans les filons à cinabre et quartz, après
            les autres minéraux, à moins de 250 °C (isotopes du carbone et forme du gisement de Picacho, Californie).`,
          cond: false, sansDiagramme: HYDRO, src: [] },
      ],
    },
    freitalite: {
      intro: `Un minéral de terril en feu.`,
      scenarios: [
        { nom: "Autour d'un terril en combustion",
          texte: `Un terril de charbon peut s'échauffer seul, par oxydation lente, et brûler pendant des années à l'abri
            de l'air. Le charbon s'y décompose sans flamme (pyrolyse) et libère des hydrocarbures aromatiques gazeux, qui se déposent en cristaux
            (sublimation) sur les parois plus froides des fissures : anthracène (freitalite), phénanthrène (ravatite),
            fluorène (kratochvílite).`,
          cond: false, sansDiagramme: "Pas de diagramme : les températures de dépôt de la freitalite ne sont pas publiées (la ravatite se dépose sous 50-60 °C).", src: [] },
      ],
    },
    urea: {
      intro: `Un minéral qui n'existe que là où il ne pleut presque jamais.`,
      scenarios: [
        { nom: "Dans le guano des grottes arides",
          texte: `L'urine et le guano des chauves-souris contiennent de l'urée. Très soluble, elle est emportée à la première
            pluie ; elle ne cristallise que dans les grottes et abris des déserts d'Australie-Occidentale, en croûtes et en
            petites stalagmites.`,
          cond: false, sansDiagramme: GUANO, src: [] },
      ],
    },
    phoxite: {
      intro: `Un minéral né du guano des chauves-souris dans une mine abandonnée.`,
      scenarios: [
        { nom: "Dans le guano d'une mine chaude et humide",
          texte: `À la mine Rowley (Arizona), des chauves-souris occupent les galeries abandonnées, où il fait chaud et
            humide. Leurs excréments frais libèrent ammonium, phosphate et oxalate, qui réagissent avec les minéraux de la
            roche et du minerai : la phoxite pousse dans des masses circulaires de guano récent, à 38 m de profondeur.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est la chimie du guano, non la température ou la pression, qui gouverne.", src: [] },
      ],
    },
  });

  // ─────────────────────────── MODES DE FORMATION DES AUTRES ESPÈCES (texte seul) ───────────────────────────
  // Un paragraphe par milieu, repris du Handbook of Mineralogy et des articles de description, complété d'une
  // phrase propre à l'espèce. Aucun diagramme : les conditions (température, concentrations) ne sont pas publiées.
  const ENV = {
    rowley: "À la mine Rowley (Arizona), des chauves-souris occupent les galeries abandonnées, chaudes et humides. Leurs excréments libèrent ammonium, phosphate, urée et oxalate, qui réagissent avec la roche et le minerai ; des dizaines d'espèces nouvelles y ont été décrites depuis 2019.",
    pica: "À Pabellón de Pica (désert d'Atacama, Chili), un gisement de guano d'oiseaux marins repose sur un gabbro qui contient de la chalcopyrite. Sous un climat hyperaride, les solutions azotées du guano et le cuivre de la roche se rencontrent dans les fissures, sans que la pluie les emporte.",
    catalina: "À Pusch Ridge (Santa Catalina Mountains, Arizona), des eaux chargées d'acide glycolique, issu de la décomposition de plantes ou de l'activité de bactéries, ont réagi avec les métaux libérés par l'altération des minéraux de la roche.",
    terril: "Dans un terril ou une couche de charbon qui brûle lentement, à l'abri de l'air, le charbon se décompose (pyrolyse) et libère des gaz organiques, qui se déposent en cristaux sur les parois plus froides des fissures.",
    lignite: "Dans les lignites et les bois fossiles, la matière végétale se transforme lentement ; certaines de ses molécules, ou les acides qu'elle libère, cristallisent dans les fissures du charbon ou du bois.",
    alum: "À Alum Cave Bluff (Great Smoky Mountains, Tennessee), l'oxydation de la pyrite d'un phyllade donne des eaux acides et sulfatées, qui s'évaporent sous un surplomb rocheux ; les terres rares viennent de la monazite et du xénotime de la roche.",
    guano: "Dans le guano des oiseaux et des chauves-souris, les déchets azotés (urée, acide urique et leurs dérivés) cristallisent quand le lieu est assez sec pour que l'eau ne les emporte pas : îles du Pérou, grottes d'Australie-Occidentale.",
    chapeau: "Dans la partie oxydée d'un gisement métallifère, près de la surface, les métaux libérés par l'altération des sulfures rencontrent des acides organiques venus des plantes (litière, racines) ou des bois de mine.",
    uranium: "Dans les gisements d'uranium des grès du plateau du Colorado, le minerai est intimement associé à du bois fossile ; après l'exploitation, l'eau qui suinte des parois dépose des efflorescences où l'uranium et les métaux rencontrent l'oxalate issu de ce bois.",
  };
  const SEC = "Pas de diagramme : ce qui décide ici, c'est la chimie du lieu et sa sécheresse, pas la température ni la profondeur.";
  const TXT = "Pas de diagramme : les conditions de cristallisation ne sont pas publiées.";
  const sc = (nom, env, propre, pourquoi) => ({ scenarios: [{ nom, texte: (env ? ENV[env] + " " : "") + propre, cond: false, sansDiagramme: pourquoi || TXT }] });
  const AUTRES = {
    humboldtine: sc("Dans les lignites", "lignite", "La humboldtine forme des croûtes jaunes dans les fissures des lignites altérés de Bohême ; l'oxalate vient de la décomposition des végétaux."),
    lindbergite: sc("Dans les pegmatites", null, "Minéral secondaire des pegmatites granitiques, où il remplace souvent la falottaïte en perdant de l'eau ; une origine liée à des lichens sur des roches manganésifères a aussi été décrite."),
    katsarosite: sc("Au Laurion", null, "Grains de 30 µm dans les minerais de zinc oxydés de la mine Esperanza (Laurion, Grèce). L'origine de l'oxalate n'est pas précisée dans les sources consultées."),
    caoxite: sc("Dans des radiolarites", null, "Veinules recoupant des radiolarites à manganèse et baryum d'une ophiolite ligure (mine de Cerchiara), déposées par des eaux circulant dans la roche fracturée."),
    moolooite: sc("Guano, racines et cuivre", "chapeau", "La moolooïte s'est formée par réaction du guano d'oiseaux avec des minéraux de cuivre secondaires (Mooloo Station, Australie) et, à Sainte-Marie-aux-Mines, près de racines d'arbres dans un puits de mine."),
    natroxalate: sc("Dans une pegmatite alcaline", null, "Dans une pegmatite très alcaline du massif de Lovozero (Kola), altérée par des fluides chauds : l'oxalate s'y est formé sans intervention du vivant, à haute température, comme celui de la kyanoxalite.", "Pas de diagramme : la température de formation n'est pas publiée."),
    oxammite: sc("Dans le guano", "guano", "L'oxammite, oxalate d'ammonium, se forme dans le guano d'oiseaux et de chauves-souris et sur des œufs et restes d'oiseaux subfossiles.", SEC),
    falottaite: sc("Dans les mines de manganèse", null, "Dans les lentilles de manganèse des radiolarites des Grisons (Suisse), les acides humiques et oxaliques des plantes ont attaqué les minéraux de manganèse ; le trihydrate cristallise, puis perd de l'eau et devient lindbergite."),
    middlebackite: sc("Dans un minerai de fer altéré", "chapeau", "À la carrière Iron Monarch (Australie-Méridionale), l'oxalate vient probablement de matière organique en décomposition, le cuivre de sulfures altérés, dans un minerai de fer manganésifère précambrien."),
    fiemmeite: sc("Dans des troncs houillifiés", null, "Des troncs d'arbres houillifiés, pris dans un grès continental du Val di Fiemme, ont été traversés par des solutions riches en cuivre et en uranium ; l'oxalate provient de la diagenèse des restes végétaux du grès."),
    edwindavisite: sc("Dans le guano de chauves-souris", "rowley", "L'edwindavisite, oxalate de cuivre qui porte une molécule d'ammoniac, s'y forme avec l'ammineïte et l'ebnérite.", SEC),
    stepanovite: sc("Dans un lignite de Iakoutie", "lignite", "La stépanovite remplit de minces veinules dans le lignite de Tyllakh, dans le delta de la Léna.", SEC),
    zhemchuzhnikovite: sc("Dans un lignite gelé", "lignite", "La zhemchuzhnikovite a été trouvée dans une carotte, à 230 m de profondeur dans le pergélisol de Iakoutie, dans un lignite naturellement imprégné d'acide acétique."),
    minguzzite: sc("Dans un chapeau de fer", null, "Rare, dans un chapeau de fer formé sur une dolomie calcaire (Capo Calamita, île d'Elbe). L'origine de l'oxalate n'est pas précisée dans les sources consultées."),
    wheatleyite: sc("Sur une halde", null, "Connue d'un seul spécimen des haldes d'un filon plomb-zinc (mine Wheatley, Pennsylvanie) : le cuivre vient du minerai altéré sur le déblai."),
    antipinite: sc("Sous le guano, au désert", "pica", "L'antipinite y associe l'oxalate du guano au cuivre de la chalcopyrite. On la retrouve à la mine Rowley.", SEC),
    novgorodovaite: sc("Dans un dôme de sel", null, "Trouvée dans une carotte de forage des évaporites du dôme de sel de Chelkar (Kazakhstan). L'origine de l'oxalate n'est pas précisée dans les sources consultées."),
    coskrenite_ce: sc("Sous un surplomb rocheux", "alum", "La coskrénite-(Ce) se dépose par évaporation dans le sol et les croûtes de ce surplomb.", SEC),
    levinsonite_y: sc("Sous un surplomb rocheux", "alum", "La levinsonite-(Y) s'y dépose par évaporation, avec la coskrénite et la zugshunstite.", SEC),
    zugshunstite_ce: sc("Sous un surplomb rocheux", "alum", "La zugshunstite-(Ce) s'y dépose par évaporation, avec la coskrénite et la levinsonite.", SEC),
    deveroite_ce: sc("Dans une fissure alpine", null, "Au mont Cervandone, l'eau de pluie, chargée de l'acide oxalique de lichens crustacés, a dissous le cérium de la cervandonite-(Ce) d'une pegmatite et l'a redéposé en oxalate dans les fissures.", "Pas de diagramme : ici, c'est un organisme qui fournit l'acide ; la température ne joue pas."),
    alterite: sc("Dans un bois pétrifié", null, "Dans un bois pétrifié riche en carbone d'un indice d'uranium des Vermilion Cliffs (Arizona), l'altérite cristallise avec des sulfates : gypse, alunogène, natrojarosite."),
    magnesioalterite: sc("Dans un bois pétrifié", null, "Même gisement que l'altérite, avec du magnésium à la place du zinc."),
    uroxite: sc("Sur les parois d'une mine d'uranium", "uranium", "L'uroxite en est l'un des produits, en lames jaunes fluorescentes.", SEC),
    metauroxite: sc("Sur les parois d'une mine d'uranium", "uranium", "La métauroxite, moins hydratée que l'uroxite, n'est connue qu'à la mine Burro (Colorado).", SEC),
    thebaite_nh4: sc("Dans le guano de chauves-souris", "rowley", "La thébaïte-(NH₄) y associe l'aluminium de la roche, le phosphate et l'oxalate du guano.", SEC),
    dendoraite_nh4: sc("Dans le guano de chauves-souris", "rowley", "La dendoraïte-(NH₄) y associe aluminium, sodium, phosphate et oxalate.", SEC),
    davidbrownite_nh4: sc("Dans le guano de chauves-souris", "rowley", "La davidbrownite-(NH₄) y cristallise dans la zone chaude et humide, à 38 m de profondeur ; le gisement contient des vanadates (vanadinite, mottramite).", SEC),
    relianceite_k: sc("Dans le guano de chauves-souris", "rowley", "La reliancéite-(K) y cristallise avec la vanadinite, la mottramite et la wulfénite.", SEC),
    ferriphoxite: sc("Dans le guano de chauves-souris", "rowley", "La ferriphoxite y cristallise avec l'antipinite, la barytine et la fluorine.", SEC),
    carboferriphoxite: sc("Dans le guano de chauves-souris", "rowley", "La carboferriphoxite, qui retient une molécule d'acide carbonique, s'y forme avec la ferriphoxite.", SEC),
    formicaite: sc("Dans des veinules hydrothermales", null, "Rare, dans des veinules hydrothermales qui recoupent un minerai de bore (Solongo, Bouriatie) et un marbre de skarn (Oural du Nord)."),
    dashkovaite: sc("Dans des veinules hydrothermales", null, "Rare, dans des veinules hydrothermales qui traversent la serpentine d'un marbre dolomitique (skarn à fer et bore de Korshunovskoïe, Sibérie)."),
    acetamide: sc("Dans un terril en feu", "terril", "L'acétamide s'y dépose entre 50 et 150 °C (bassin de Lviv-Volhynie, Ukraine).", "Pas de diagramme : un seul chiffre est publié, la fourchette de 50 à 150 °C."),
    calclacite: sc("Dans un tiroir de musée", null, "L'acide acétique dégagé par le bois de chêne des meubles de collection attaque les roches calcaires, les fossiles et les tessons qu'on y conserve ; la calclacite y pousse en efflorescences.", "Pas de diagramme : c'est une réaction de laboratoire accidentelle, à température ambiante."),
    hoganite: sc("Dans un chapeau de fer", "chapeau", "À Broken Hill, la litière de feuilles et peut-être les bois de mine ont fourni l'acide acétique qui, avec le cuivre, a donné la hoganite.", SEC),
    paceite: sc("Dans un chapeau de fer", "chapeau", "À Broken Hill, la paceïte s'est formée avec la hoganite, le calcium en plus.", SEC),
    ernstburkeite: sc("Dans la glace de l'Antarctique", null, "L'acide méthanesulfonique, formé dans l'air par oxydation du sulfure de diméthyle émis par le plancton marin, s'est fixé sur des poussières alcalines pendant son long transport ; enfoui dans la glace de Dôme Fuji, il a cristallisé en grains de 5 µm.", "Pas de diagramme : ce minéral se forme dans l'atmosphère puis dans la glace, hors des cadres des diagrammes de l'atlas."),
    lazaraskeite: sc("Sur une crête d'Arizona", "catalina", "La lazaraskéite y prend son cuivre aux minéraux oxydés de la roche.", SEC),
    stanevansite: sc("Sur une crête d'Arizona", "catalina", "La stanevansite y prend son magnésium aux minéraux altérés de la roche.", SEC),
    domitrovicite: sc("Sur une crête d'Arizona", "catalina", "La domitrovicite y cristallise avec le zinc de la roche altérée.", SEC),
    puschridgeite: sc("Sur une crête d'Arizona", "catalina", "La puschridgeïte y cristallise avec le manganèse de la roche altérée.", SEC),
    jimkrieghite: sc("Sur une crête d'Arizona", "catalina", "La jimkrieghite y cristallise avec le calcium, parmi la calcite, la malachite et la wulfénite.", SEC),
    rasmussenite: sc("Sur une crête d'Arizona", "catalina", "La rasmussénite y cristallise en gerbes d'aiguilles avec la stanevansite et la lazaraskéite.", SEC),
    glecklerite: sc("Sur une crête d'Arizona", "catalina", "La glecklérite y cristallise avec le sodium, parmi la barytine, la fluorine et la jarosite.", SEC),
    henrysunite: sc("Sur une crête d'Arizona", "catalina", "La henrysunite y cristallise avec le sodium et une molécule d'eau.", SEC),
    lianbinite: sc("Sur une crête d'Arizona", "catalina", "La lianbinite y associe l'ammonium à l'acide glycolique.", SEC),
    fuchunite: sc("Sur une crête d'Arizona", "catalina", "La fuchunite y associe le baryum à l'acide glycolique.", SEC),
    earlandite: sc("Dans la vase antarctique", null, "Nodules verruqueux formés dans les sédiments du fond de la mer de Weddell, à 2 580 m de profondeur, avec la weddellite. L'origine du citrate n'est pas précisée dans les sources consultées."),
    julienite: sc("Au Katanga", null, "Encroûtement très rare sur un talcschiste du district cuprifère de Kambove (Katanga). L'origine du thiocyanate n'est pas précisée dans les sources consultées."),
    joanneumite: sc("Sous le guano, au désert", "pica", "La joanneumite a cristallisé dans les fissures du gabbro, là où convergent les solutions du cuivre oxydé et l'azote du guano.", SEC),
    chanabayaite: sc("Sous le guano, au désert", "pica", "La chanabayaïte y cristallise en agrégats rayonnants ; elle est ensuite remplacée en place par la bojarite.", SEC),
    triazolite: sc("Sous le guano, au désert", "pica", "La triazolite tapisse des cavités au contact du guano et de la roche.", SEC),
    bojarite: sc("Sous le guano, au désert", "pica", "La bojarite remplace la chanabayaïte en conservant la forme de ses agrégats, avec le salmiac, la halite et la nitratine.", SEC),
    pabellondepicaite: sc("Sous le guano, au désert", "pica", "La pabellóndepicaïte y associe le triazolate et le nitrate du guano.", SEC),
    fichtelite: sc("Dans les pins des tourbières", "lignite", "La fichtélite cristallise en paillettes dans le bois de pins enfouis dans les tourbières du Fichtelgebirge ; on la connaît aussi dans des sédiments marins actuels riches en matière organique."),
    dinite: sc("Dans un bois fossile", "lignite", "La dinite a été trouvée dans un bois fossile bitumineux pris dans des sédiments de rivière (Garfagnana, Toscane)."),
    simonellite: sc("Dans un lignite", "lignite", "La simonellite vient de la résine des conifères du lignite de Fognano (Toscane)."),
    wampenite: sc("Dans un bois fossile", "lignite", "La wampénite a été trouvée sur un bois de conifère fossile de Wampen (Fichtelgebirge)."),
    kratochvilite: sc("Dans des schistes en feu", "terril", "La kratochvílite (fluorène) s'est déposée lors de la combustion de schistes pyriteux du bassin de Kladno.", SEC),
    ravatite: sc("Dans une couche de charbon en feu", "terril", "La ravatite (phénanthrène) se dépose à moins de 50-60 °C dans les couches de charbon en combustion de Ravat (Tadjikistan).", "Pas de diagramme : un seul chiffre est publié, une température de dépôt inférieure à 50-60 °C."),
    idrialite: sc("Dans les gisements de mercure", null, "La matière organique chauffée près de sources chaudes ou par des fluides hydrothermaux se décompose (pyrolyse) ; les hydrocarbures aromatiques sont transportés et déposés avec le cinabre (Idrija, Californie).", "Pas de diagramme : les températures de dépôt ne sont pas publiées."),
    hokkaidoite: sc("Dans l'opale d'anciennes sources chaudes", null, "Au Hokkaidō, le benzo[ghi]pérylène a été piégé en lits dans l'opale déposée par d'anciennes sources chaudes, et en plaquettes dans des filons de quartz.", "Pas de diagramme : les conditions de dépôt ne sont pas publiées."),
    refikite: sc("Dans les lignites et les racines fossiles", "lignite", "La réfikite, acide résinique, a été trouvée dans un lignite des Abruzzes et dans des racines d'épicéas fossiles d'un marécage de Bavière."),
    flagstaffite: sc("Dans des troncs de pins en décomposition", null, "La flagstaffite tapisse les fissures de troncs de pins enfouis qui se décomposent, au pied des San Francisco Peaks (Arizona) ; l'hydrate de terpine dérive des terpènes de la résine."),
    hoelite: sc("Autour d'un charbon en feu", "terril", "La hoelite (anthraquinone) forme des croûtes autour des évents d'un gisement de charbon en feu du Spitzberg.", SEC),
    kladnoite: sc("Dans un terril en feu", "terril", "La kladnoïte (phtalimide) s'est déposée lors d'incendies de terrils du bassin de Kladno.", SEC),
    abelsonite: sc("Dans un schiste bitumineux", null, "Dans les schistes bitumineux de la formation de Green River (Éocène, Utah et Colorado), la chlorophylle des algues s'est transformée pendant la diagenèse : le nickel a remplacé le magnésium au centre du cycle. La molécule, transportée en solution, a cristallisé dans les fractures et sur les plans de stratification.", "Pas de diagramme : les conditions de la diagenèse de l'abelsonite ne sont pas chiffrées dans les sources consultées."),
    guanine: sc("Dans le guano", "guano", "La guanine forme des croûtes granuleuses dans les croûtes phosphatées du guano d'oiseaux marins et de chauves-souris.", SEC),
    uricite: sc("Dans le guano", "guano", "L'uricite est l'acide urique cristallisé, principal composant azoté des fientes d'oiseaux.", SEC),
    tinnunculite: sc("Sous les fientes, au froid ou sur un terril", null, "L'acide urique des fientes d'oiseaux cristallise en tinnunculite en climat arctique froid et humide (Kola), ou au contact des gaz chauds d'un terril de charbon en feu (Kopeïsk, Oural), où des faucons crécerelles avaient déposé leurs fientes.", SEC),
    allantoin: sc("Dans le guano de chauves-souris", "rowley", "L'allantoïne, produit de dégradation de l'acide urique chez la plupart des mammifères, s'y dépose par évaporation sur les parois ; on la trouve aussi sous une colonie active d'une grotte des Émirats arabes unis.", SEC),
    marchettiite: sc("Dans une fissure alpine", null, "Au mont Cervandone, des eaux de pluie froides, chargées de matière biologique altérée, ont circulé dans une fissure et y ont déposé l'urate d'ammonium.", SEC),
    natrosulfatourea: sc("Dans le guano de chauves-souris", "rowley", "La natrosulfatourée s'y dépose par évaporation sur les parois, avec l'aphthitalite et l'urée.", SEC),
  };
  for (const [id, f] of Object.entries(AUTRES)) if (!MIN_F[id]) MIN_F[id] = f;
})();
