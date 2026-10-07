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
          note: "Prismes courts, incolores, qui blanchissent et deviennent friables à l'air sec en perdant leur eau (ils passent à la tincalconite)." },
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
          note: "Cristaux trapus, brillants, souvent dans des géodes au cœur de nodules d'argile (Death Valley, Anatolie)." },
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
          note: "Petits cubes dont un sommet sur deux est coupé : la forme de la boracite cubique, stable au-dessus de 265 °C. En dessous, la structure devient orthorhombique (maille de la 3D) mais garde la forme du cube, en se divisant en domaines maclés." },
        { nom: "Dodécaèdre et tétraèdre",
          formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "tétraèdre", d: 1.0 }],
          note: "Autre forme fréquente dans les sels de Stassfurt." },
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
  const LAC = "Pas de diagramme : les diagrammes d'évaporation de l'atlas suivent l'eau de mer (gypse, sel, potassium), pas les lacs boratés.";

  Object.assign(MIN_F, {

    // ─────────── Borax ───────────
    borax: {
      forme: `Le borax est fait d'ions borate (deux triangles BO₃ et deux tétraèdres BO₄ réunis en un anneau double) et
        de chaînes d'octaèdres Na(H₂O)₆, que l'on voit sur la structure 3D. Dix molécules d'eau par formule, tenues par
        des liaisons hydrogène : à l'air sec, elles partent et le cristal devient une poudre blanche.`,
      intro: `Le borax précipite dans les lacs salés des régions volcaniques sèches, où des sources chaudes apportent le bore.`,
      scenarios: [
        { nom: "Dans un lac salé boraté",
          texte: `Dans des bassins fermés de régions volcaniques (Californie, Tibet, Anatolie, Andes), des sources chaudes
            apportent du bore. L'eau s'évapore, devient très alcaline et le borax cristallise au fond et sur les bords, en
            croûtes. Searles Lake et Boron (Californie) en sont les grands gisements ; au Tibet, on le transportait à dos de
            mouton vers l'Inde, d'où le nom de « tincal ».`,
          cond: false, sansDiagramme: LAC, src: [SRC.smith, SRC.helvaci] },
      ],
    },

    // ─────────── Kernite ───────────
    kernite: {
      sansForme: "Forme non dessinée : la kernite se trouve en grandes masses de clivage, parfois de plus d'un mètre, rarement en cristaux à faces.",
      forme: `La kernite a la même formule que le borax avec moins d'eau (4 molécules au lieu de 10) : ses borates sont reliés
        en longues chaînes, ce qui la fait cliver en fibres et en baguettes.`,
      intro: `La kernite est un borax enfoui qui a perdu une partie de son eau.`,
      scenarios: [
        { nom: "Dans une couche de borax enfouie",
          texte: `À Boron (Californie), les couches de borax déposées dans un lac il y a environ 19 millions d'années ont été
            recouvertes de sédiments et de laves ; chauffées en profondeur vers 60–100 °C, elles ont perdu une partie de leur
            eau et recristallisé en kernite, en grands cristaux. La mine a été ouverte en 1927.`,
          cond: false, sansDiagramme: "Pas de diagramme : la déshydratation du borax n'a pas de seuil tracé sur le diagramme d'enfouissement de l'atlas.",
          src: [SRC.christ] },
      ],
    },

    // ─────────── Ulexite ───────────
    ulexite: {
      sansForme: "Forme non dessinée : l'ulexite pousse en fibres très fines, en boules cotonneuses ou en lits fibreux.",
      forme: `L'ulexite est faite d'anneaux de borate et de chaînes d'octaèdres de sodium et de calcium, tous allongés dans la
        même direction : elle pousse en fibres. Taillée perpendiculairement, une plaque de ces fibres parallèles conduit la
        lumière comme des fibres optiques et fait apparaître l'image d'un texte posé dessous : la « pierre télévision ».`,
      intro: `L'ulexite naît à la surface des lacs salés boratés.`,
      scenarios: [
        { nom: "À la surface d'un lac salé",
          texte: `Dans les vases des lacs salés des Andes, du Nevada ou de Californie, elle cristallise en « boules de coton »
            blanches juste sous la surface, là où l'eau s'évapore.`,
          cond: false, sansDiagramme: LAC, src: [SRC.helvaci] },
      ],
    },

    // ─────────── Colémanite ───────────
    colemanite: {
      forme: `La colémanite est un borate de calcium : chaînes de triangles BO₃ et de tétraèdres BO₄, reliées par des
        calciums. Moins soluble que le borax, elle se conserve dans les roches anciennes et forme des cristaux trapus et
        brillants.`,
      intro: `La colémanite remplace les autres borates dans les argiles des anciens lacs.`,
      scenarios: [
        { nom: "Dans les argiles d'un ancien lac",
          texte: `Enfouies, les argiles des lacs boratés se chargent en calcium ; les borates de sodium (borax, ulexite) se
            transforment alors en colémanite, en lits et en nodules. La Turquie (Emet, Bigadiç) en tire la plus grande part de
            la production mondiale de bore.`,
          cond: false, sansDiagramme: LAC, src: [SRC.helvaci] },
      ],
    },

    // ─────────── Boracite ───────────
    boracite: {
      forme: `La boracite est une charpente de borates qui ménage des cages ; magnésium et chlore occupent ces cages. Au-dessus
        de 265 °C, la charpente est cubique ; en dessous, elle se déforme en orthorhombique, mais les cristaux gardent la forme
        du cube et se divisent en domaines maclés. Elle est très dure (7 à 7,5) pour un borate.`,
      intro: `La boracite se forme dans les sels d'origine marine riches en magnésium.`,
      scenarios: [
        { nom: "Dans les sels de potassium et de magnésium",
          texte: `Dans les couches de sels de fin d'évaporation, le peu de bore de l'eau de mer se concentre et cristallise en
            petits cubes de boracite, disséminés dans la carnallite et la kiesérite : Stassfurt et Lunebourg (Zechstein,
            Allemagne). Elle n'a pas été signalée dans les sels français.`,
          cond: false, sansDiagramme: "Pas de diagramme : le bore, en traces dans l'eau de mer, n'est pas tracé sur le diagramme d'évaporation." },
      ],
    },
  });
})();
