// ============================================================
// CLASSE VI — borates : formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026
// Chargé après carbonates-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js), sauf la boracite :
// ses cristaux gardent la forme de la boracite cubique de haute température (maille COD 9015802), dite en note.
// Non dessinés : kernite (masses de clivage), ulexite (fibres).
// ============================================================

(function () {
  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ─────────── Borax ───────────
    borax: {
      nom: "Borax", couleur: "#eef0ee", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "C",
      maille: [11.885, 10.654, 12.206, 90, 106.623, 90], mailleSource: "cod1008812", azimut: 24, elevation: 14,
      facies: [
        { nom: "Prisme court",
          formes: [
            { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.05 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.6 },
          ],
          note: "Prismes courts et incolores ; à l'air sec, ils perdent leur eau, blanchissent et deviennent friables, en se transformant en tincalconite." },
      ],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.24 }],
    },

    // ─────────── Colémanite ───────────
    colemanite: {
      nom: "Colémanite", couleur: "#f1efe8", systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P",
      maille: [8.712, 11.247, 6.091, 90, 110.12, 90], mailleSource: "cod9004262", azimut: 24, elevation: 16,
      facies: [
        { nom: "Prisme trapu",
          formes: [
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.1 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.95 },
          ],
          note: "Au cœur de nodules argileux (Death Valley, Anatolie), des géodes abritent souvent des cristaux trapus et brillants." },
      ],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.24 }],
    },

    // ─────────── Boracite ───────────
    boracite: {
      nom: "Boracite", couleur: "#dfe9e4", systeme: "orthorhombique (pseudo-cubique)", classe: "-43m", classeNom: "hexakistétraédrique (forme héritée)", reseau: "F",
      maille: [12.1, 12.1, 12.1, 90, 90, 90], mailleSource: "cod9015802",
      facies: [
        { nom: "Cube et tétraèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.3 }],
          note: "De petits cubes dont un sommet sur deux est tronqué : c'est la forme de la boracite cubique, stable au-dessus de 265 °C. En dessous, la maille devient orthorhombique (celle de la 3D), mais le cristal conserve sa forme cubique en se divisant en domaines maclés." },
        { nom: "Dodécaèdre et tétraèdre",
          formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }],
          note: "Cette forme est aussi courante dans les sels de Stassfurt." },
      ],
      clivages: [],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const SRC = {
    smith: "Smith G. I. (1979). « Subsurface stratigraphy and geochemistry of late Quaternary evaporites, Searles Lake, California ». <i>U.S. Geological Survey Professional Paper</i> 1043.",
    helvaci: "Helvacı C. (2005). « Borate deposits: an overview and future forecast with regard to mineral deposits ». <i>Journal of Boron</i> 2, p. 59–70.",
    christ: "Christ C. L. et Garrels R. M. (1959). « Relations among sodium borate hydrates at the Kramer deposit, Boron, California ». <i>American Journal of Science</i> 257, p. 516–528.",
  };
  const LAC = "Aucun diagramme ici : ceux de l'évaporation dans l'atlas suivent l'eau de mer (gypse, sel, potassium), et non les lacs boratés.";

  Object.assign(MIN_F, {

    // ─────────── Borax ───────────
    borax: {
      forme: `Le borax associe des ions borate (deux triangles BO₃ et deux tétraèdres BO₄ réunis en anneau double) à
        des chaînes d'octaèdres Na(H₂O)₆, visibles sur la structure 3D. Chaque formule porte dix molécules d'eau, retenues par
        des liaisons hydrogène : à l'air sec, elles s'échappent et le cristal se réduit en poudre blanche.`,
      intro: `Dans les régions volcaniques arides, le bore apporté par des sources chaudes fait précipiter le borax au fond des lacs salés.`,
      scenarios: [
        { nom: "Dans un lac salé boraté",
          texte: `Des sources chaudes amènent du bore dans des bassins fermés de régions volcaniques (Californie, Tibet, Anatolie, Andes). En s'évaporant, l'eau devient fortement alcaline : le borax se dépose au fond et sur les rives, en
            croûtes. Searles Lake et Boron (Californie) en sont les grands gisements ; au Tibet, on le transportait à dos de
            mouton jusqu'en Inde, d'où le nom de « tincal ».`,
          cond: false, sansDiagramme: LAC, src: [SRC.smith, SRC.helvaci] },
      ],
    },

    // ─────────── Kernite ───────────
    kernite: {
      sansForme: "Pas de forme dessinée : la kernite forme de grandes masses de clivage, parfois longues de plus d'un mètre, et rarement des cristaux à faces.",
      forme: `Avec moins d'eau que le borax (4 molécules au lieu de 10), la kernite garde la même formule ; ses borates s'enchaînent
        en longues files, ce qui la fait cliver en fibres et en baguettes.`,
      intro: `La kernite résulte d'un borax enfoui qui a perdu une partie de son eau.`,
      scenarios: [
        { nom: "Dans une couche de borax enfouie",
          texte: `Dans le lac de Boron (Californie), voici environ 19 millions d'années, du borax s'est déposé en couches. Ces dernières ont été ensevelies sous des sédiments et des laves ; réchauffées à 60 à 100 °C en profondeur, elles ont perdu de l'eau et recristallisé en grands cristaux de kernite. La mine a ouvert en 1927.`,
          cond: false, sansDiagramme: "Aucun diagramme : l'atlas ne porte pas de seuil de déshydratation du borax sur son diagramme d'enfouissement.",
          src: [SRC.christ] },
      ],
    },

    // ─────────── Ulexite ───────────
    ulexite: {
      sansForme: "Aucune forme n'est dessinée ; elle se présente en fibres ténues, en boules cotonneuses ou en lits de fibres.",
      forme: `Des anneaux de borate et des chaînes d'octaèdres de sodium et de calcium composent l'ulexite, tous allongés selon une même direction : elle croît en fibres. Taillée perpendiculairement aux fibres, une plaque ainsi formée guide la
        lumière comme des fibres optiques et laisse apparaître en surface l'image d'un texte posé dessous : d'où le nom de « pierre télévision ».`,
      intro: `Elle se forme en surface des lacs salés boratés.`,
      scenarios: [
        { nom: "À la surface d'un lac salé",
          texte: `Dans les vases des lacs salés andins, nevadiens ou californiens, elle se dépose en « boules de coton »
            blanches, juste sous la surface où l'eau s'évapore.`,
          cond: false, sansDiagramme: LAC, src: [SRC.helvaci] },
      ],
    },

    // ─────────── Colémanite ───────────
    colemanite: {
      forme: `Borate de calcium, la colémanite associe des chaînes de triangles BO₃ et de tétraèdres BO₄ reliées par des
        ions calcium. Moins soluble que le borax, elle persiste dans les roches anciennes et donne des cristaux trapus et
        brillants.`,
      intro: `Dans les argiles d'anciens lacs, la colémanite se substitue aux autres borates.`,
      scenarios: [
        { nom: "Dans les argiles d'un ancien lac",
          texte: `Une fois enfouies, les argiles des lacs boratés s'enrichissent en calcium : le borax et l'ulexite se transforment alors en colémanite, sous forme de lits et de nodules. La Turquie (Emet, Bigadiç) produit à elle seule la majeure partie du bore mondial.`,
          cond: false, sansDiagramme: LAC, src: [SRC.helvaci] },
      ],
    },

    // ─────────── Boracite ───────────
    boracite: {
      forme: `La boracite repose sur une charpente de borates qui délimite des cages, occupées par du magnésium et du chlore. Cette charpente est cubique au-dessus de 265 °C ; plus bas, elle se déforme en orthorhombique, mais les cristaux gardent l'aspect du cube et se fragmentent en domaines maclés. Sa dureté (7 à 7,5) surprend pour un borate.`,
      intro: `La boracite se forme dans les sels d'origine marine riches en magnésium.`,
      scenarios: [
        { nom: "Dans les sels de potassium et de magnésium",
          texte: `Dans les couches salines de fin d'évaporation, le bore, rare dans l'eau de mer, se concentre et cristallise en
            petits cubes de boracite disséminés dans la carnallite et la kiesérite : Stassfurt et Lunebourg (Zechstein,
            Allemagne). La boracite n'a jamais été signalée dans les sels français.`,
          cond: false, sansDiagramme: "Aucun diagramme : le bore, présent en traces dans l'eau de mer, ne figure pas sur le diagramme d'évaporation." },
      ],
    },
  });
})();
