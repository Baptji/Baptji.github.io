// ============================================================
// CLASSE I — éléments natifs : formes cristallines (cristal.js) et modes de formation (MIN_F) — chantier F.4, 01/10/2026
// Chargé après organiques-formes.js. Mailles = celles des structures 3D (COD, voir structures/index.js).
// Formes et habitus : Klein et Dutrow (Manual of Mineral Science, 2007), Dana's System of Mineralogy ; distances au
// centre (d) réglées pour retrouver l'habitus décrit. Arsenic, antimoine et bismuth ne sont pas dessinés : leurs cristaux
// naturels sont rares et mal décrits (masses, lamelles) ; fer : pas de cristal à faces dans la nature ; mercure : liquide.
// MIN_F[id].sansForme = phrase affichée à la place du schéma (app.js, carte « Structure »).
// ============================================================

(function () {
  const CUBIQUE = (a) => [a, a, a, 90, 90, 90];
  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {

    // ─────────── Or ───────────
    or_natif: {
      nom: "Or", couleur: "#e8c34a", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(4.07825), mailleSource: "cod9008463",
      macleNote: "Un octaèdre accolé à un autre selon une face {111}, l'un tourné de 180°, constitue la macle du spinelle ; elle aplatit souvent les cristaux en triangles.",
      facies: [
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Les huit faces triangulaires correspondent aux plans les plus denses de l'empilement ; elles croissent le plus lentement et finissent par border le cristal. Les cristaux d'or nets restent rares et petits (quelques millimètres) : l'or se rencontre surtout sous forme de pépites, de paillettes, de feuilles et d'arborescences." },
        { nom: "Octaèdre et dodécaèdre",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.12 }],
          note: "De longues facettes {110} remplacent les arêtes de l'octaèdre ; cette forme caractérise souvent les cristaux de quartz des filons." },
        { nom: "Macle du spinelle", azimut: 30, elevation: 14, macle: { plan: [1, 1, 1], compo: [1, 1, 1] },
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Deux moitiés d'octaèdre se soudent selon une face {111}, l'une tournée de 180° par rapport à l'autre : un angle rentrant le long de la soudure révèle la macle." },
      ],
      clivages: [],
    },

    // ─────────── Argent ───────────
    argent_natif: {
      nom: "Argent", couleur: "#d6d6d2", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(4.0862), mailleSource: "cod9008459",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Rares et presque toujours déformés, les cristaux d'argent cèdent la place à l'argent natif en fils tordus et en arborescences." },
        { nom: "Cubo-octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.3 }],
          note: "Les faces de l'octaèdre tronquent les sommets du cube." },
      ],
      clivages: [],
    },

    // ─────────── Cuivre ───────────
    cuivre_natif: {
      nom: "Cuivre", couleur: "#c8784a", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(3.61496), mailleSource: "cod9008468",
      macleNote: "Fréquente, la macle du spinelle selon {111} fait croître les cristaux en branches.",
      facies: [
        { nom: "Dodécaèdre", formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }],
          note: "Les douze losanges de cette forme, courante pour le cuivre, forment souvent des arborescences de cristaux alignés." },
        { nom: "Cube et dodécaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.2 }],
          note: "Une forme de cube aux arêtes remplacées par les faces d'un dodécaèdre." },
      ],
      clivages: [],
    },

    // ─────────── Platine ───────────
    platine_natif: {
      nom: "Platine", couleur: "#c9c9c6", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(3.9231), mailleSource: "cod9008480",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Les cubes de platine restent exceptionnels (quelques gisements de l'Oural) ; le métal se présente surtout en grains et en pépites que les rivières ont roulés." },
      ],
      clivages: [],
    },

    // ─────────── Graphite ───────────
    graphite: {
      nom: "Graphite", couleur: "#5b5b5e", systeme: "hexagonal", classe: "6/mmm", classeNom: "dihexagonale dipyramidale", reseau: "P",
      maille: [2.464, 2.464, 6.711, 90, 90, 120], mailleSource: "cod9011577", azimut: 20, elevation: 22,
      facies: [
        { nom: "Tablette hexagonale",
          formes: [{ sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.28 }, { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }],
          note: "Une plaquette hexagonale très mince : le graphite croît rapidement dans le plan de ses feuillets, et à peine dans l'autre sens. C'est la forme des paillettes présentes dans les marbres et les gneiss." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal, entre les feuillets", pas: 0.2 }],
    },

    // ─────────── Diamant ───────────
    diamant: {
      nom: "Diamant", couleur: "#e4ecef", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(3.56679), mailleSource: "cod9011575",
      macleNote: "Macle du spinelle selon {111} : les diamantaires la désignent simplement par « macle » ; elle donne des cristaux plats et triangulaires.",
      facies: [
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Le diamant croît sous cette forme dans le manteau ; ses faces portent souvent de petits creux triangulaires (trigons), vestiges d'une dissolution durant la remontée." },
        { nom: "Macle (spinelle)", azimut: 30, elevation: 24, macle: { plan: [1, 1, 1], compo: [1, 1, 1] },
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Deux moitiés d'octaèdre accolées selon une face {111} donnent un cristal plat et triangulaire, marqué d'une encoche le long de la soudure." },
      ],
      clivages: [{ hkl: [1, 1, 1], qualite: "parfait", nom: "octaédrique, quatre directions", pas: 0.26 }],
    },

    // ─────────── Soufre ───────────
    soufre_natif: {
      nom: "Soufre", couleur: "#f0d53a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "F",
      maille: [10.4646, 12.866, 24.486, 90, 90, 90], mailleSource: "cod9011362", azimut: 24, elevation: 12,
      facies: [
        { nom: "Bipyramide", formes: [{ sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.0 }],
          note: "Les cristaux de soufre les plus courants prennent la forme de deux pyramides pointues à base losange." },
        { nom: "Bipyramide tronquée",
          formes: [
            { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.0 },
            { sym: "s", hkl: [1, 1, 3], nom: "bipyramide aplatie", d: 1.3 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.5 },
            { sym: "n", hkl: [0, 1, 1], nom: "prisme", d: 1.35 },
          ],
          note: "Une seconde bipyramide, plus plate {113}, et la base {001} tronquent les pointes : tel est l'aspect des cristaux de Sicile, posés sur le gypse ou la calcite." },
      ],
      clivages: [],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const q = (o, n, t, x) => Object.assign({}, o, n ? { n } : {}, t ? { t } : {}, x || {});
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    groves: "Groves D. I., Goldfarb R. J. et al. (1998). « Orogenic gold deposits: a proposed classification in the context of their crustal distribution and relationship to other gold deposit types ». <i>Ore Geology Reviews</i> 13, p. 7–27.",
    placer: "Équivalence hydraulique d'une paillette d'or : vitesse de chute calculée par l'atlas avec la formule de Ferguson et Church (2004), masse volumique 19,3 au lieu de 2,65.",
    cawthorn: "Cawthorn R. G. (1999). « The platinum and palladium resources of the Bushveld Complex ». <i>South African Journal of Science</i> 95, p. 481–489.",
    beyssac: "Beyssac O., Goffé B., Chopin C. et Rouzaud J.-N. (2002). « Raman spectra of carbonaceous material in metasediments: a new geothermometer ». <i>Journal of Metamorphic Geology</i> 20, p. 859–871.",
    stachel: "Stachel T. et Harris J. W. (2008). « The origin of cratonic diamonds — constraints from mineral inclusions ». <i>Ore Geology Reviews</i> 34, p. 5–32.",
  };
  const PAS_DIAG = "Pas de diagramme : ici, c'est la chimie de l'eau (oxydante ou réductrice, présence ou non de soufre) qui décide, et aucun diagramme de l'atlas ne la représente pour ce métal.";

  Object.assign(MIN_F, {

    // ─────────── Or ───────────
    or_natif: {
      forme: `Le lien métallique de l'or résulte d'électrons partagés, sans direction préférentielle : les atomes s'empilent donc comme des billes au plus serré (cubique à faces centrées, 12 voisins). Aucun plan n'est plus faible qu'un autre : <b>aucun clivage</b>.
Les plans les plus compacts {111} glissent les uns sur les autres sans se rompre : l'or est si malléable qu'un gramme s'étire en un fil de plus de 2 km. Ce sont aussi ces plans {111} qui forment les faces de l'octaèdre représenté.`,
      intro: `L'or se dépose dans les filons de quartz formés par des eaux chaudes. Libéré par l'érosion de ces filons, très dense, il gagne le fond des rivières.`,
      scenarios: [
        { nom: "Dans un filon de quartz",
          texte: `Une eau chaude chargée de soufre transporte en profondeur l'or sous forme de complexes dissous (Au(HS)₂⁻), à des teneurs infimes de quelques microgrammes par litre. Refroidie, en ébullition, ou au contact d'une roche riche en fer qui capte son soufre, elle laisse l'or précipiter en grains dans le quartz qui cristallise en même temps. Un gisement exige des millions de mètres cubes d'eau : Salsigne (Aude), dernière grande mine d'or de France, fermée en 2004, en offre l'exemple.`,
          cond: { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 300, C: 663, n: 1, t: "Vers 300 °C (jusqu'à 400 °C dans certains gisements), à plusieurs kilomètres de profondeur, l'eau transporte la silice et l'or (sous forme de complexes soufrés) puisés dans les roches traversées." },
              { T: 200, C: 663, n: 2, t: "Elle remonte par une faille et, en se refroidissant, devient sursaturée." },
              { T: 150, C: 137, n: 3, t: "Le quartz du filon cristallise, et l'or précipite avec lui en grains lorsque l'eau perd son soufre (au contact d'une roche riche en fer, ou lors d'une ébullition)." },
            ],
            note: "Le diagramme représente la silice, constitutive du quartz du filon. L'or, des millions de fois moins concentré dans l'eau, ne peut pas figurer à la même échelle : il s'agit d'un chemin schématique." },
          src: ["rimstidt", "fournier", SRC.groves] },
        { nom: "Dans une rivière (placer)",
          texte: `Dix-neuf fois plus dense que l'eau et sept fois plus que le quartz, l'or libéré par l'érosion tombe au fond dès que le courant faiblit, bien avant les sables. Une paillette de 0,3 mm se dépose ainsi comme un grain de quartz de 2 mm, et s'accumule derrière les gros blocs ou sur la roche en place ; ces placers ont été lavés à la batée pendant des siècles par les orpailleurs de l'Ariège, du Gardon ou du Rhin.`,
          cond: { type: "courant", autres: [{ pts: [[0.3, 180], [0.3, 3]], lab: "sable" }], chemin: [
            q({ d: 2, v: 220 }, 0, "", { lab: "crue" }),
            q({ d: 2, v: 150 }, 1, "Lors d'une crue, le courant entraîne graviers et galets, et les paillettes d'or libérées du filon voyagent avec eux."),
            q({ d: 2, v: 12 }, 2, "Une paillette d'or de 0,3 mm se dépose avec les graviers, au fond du chenal, dès que le courant passe sous ≈ 20 cm/s, alors que le sable est encore emporté. Elle tombe en effet comme un grain de quartz de ≈ 2 mm."),
            q({}, 3, "Les crues successives concentrent l'or dans les creux du lit et sur la roche en place, ce qui forme un placer."),
          ], note: "Diagramme établi pour des grains de quartz : l'or y est figuré à la taille qu'aurait un grain de quartz tombant à la même vitesse (équivalence hydraulique)." },
          src: [SRC.placer] },
      ],
    },

    // ─────────── Argent ───────────
    argent_natif: {
      forme: `Même empilement que l'or, pour la même raison (liaison métallique sans direction privilégiée) : ni clivage ni fragilité. Les deux métaux ont presque la même maille (4,08 et 4,09 Å) et se mélangent en toutes proportions, formant l'électrum.`,
      intro: `C'est surtout par réduction, ou par remise en solution, de l'argent d'un minerai sulfuré que naît l'argent natif.`,
      scenarios: [
        { nom: "Dans un filon à cobalt et nickel",
          texte: `Des filons de basse température déposent parfois l'argent à l'état natif, avec des arséniures de cobalt et de nickel, de l'arsenic natif et de la calcite. Dits « à cinq éléments » (Ag, Co, Ni, As, Bi), ils se rencontrent à Kongsberg (Norvège) et à Sainte-Marie-aux-Mines (Alsace) ; l'argent y croît en fils et en arborescences.`,
          cond: false, sansDiagramme: PAS_DIAG },
        { nom: "Sous la zone d'oxydation (cémentation)",
          texte: `Près de la surface, l'eau de pluie oxyde les sulfures et dissout leur argent ; plus bas, sous la nappe, le milieu réducteur le fait reprécipiter sous forme métallique. Ces zones enrichies ont assuré la fortune des premières mines d'argent.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Cuivre ───────────
    cuivre_natif: {
      forme: `Cubique à faces centrées comme l'or, il présente des atomes plus petits (2,56 Å entre voisins, contre 2,88 Å pour l'or). Sans clivage, le métal se plie et s'étire. Les cristaux croissent plus vite selon certaines directions, d'où les arborescences de petits cristaux alignés.`,
      intro: `Il se forme là où une eau riche en cuivre atteint un milieu réducteur.`,
      scenarios: [
        { nom: "Dans les basaltes",
          texte: `La presqu'île de Keweenaw (lac Supérieur, États-Unis) abrite le plus grand gisement de cuivre du monde. Il y a 1,1 milliard d'années, des eaux chaudes ont traversé une pile de coulées basaltiques et y ont laissé du cuivre métallique, dans les bulles des laves et entre les galets. Une seule masse, trouvée en 1857, pesait environ 500 tonnes.`,
          cond: false, sansDiagramme: PAS_DIAG },
        { nom: "Sous la zone d'oxydation (cémentation)",
          texte: `Comme l'argent, le cuivre des sulfures, dissous par l'eau de pluie près de la surface, est redéposé plus bas, sous la nappe, en cuivre natif ou en cuprite. Chessy-les-Mines, près de Lyon, renommée pour ses azurites, en a fourni.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Platine ───────────
    platine_natif: {
      forme: `Il est cubique à faces centrées, comme l'or et le cuivre, et dépourvu de clivage. Le platine constitue le plus dense des éléments natifs courants : 21,4 à l'état pur, 14 à 19 dans la nature selon sa teneur en fer. Il ne s'altère pas, si bien que les rivières le roulent sans l'abîmer.`,
      intro: `C'est dans les magmas les plus pauvres en silice qu'apparaît le platine ; les rivières le concentrent ensuite.`,
      scenarios: [
        { nom: "Dans un magma ultrabasique",
          texte: `Un magma issu du manteau, très riche en magnésium, se refroidit dans une vaste chambre. Dépourvu de place dans les silicates, le platine suit les gouttes de sulfure ou les cristaux de chromite qui sédimentent au fond, pour se concentrer dans quelques couches minces. Le récif de Merensky, au sein du complexe du Bushveld (Afrique du Sud, 2,06 milliards d'années), n'excède pas un mètre d'épaisseur, mais recèle la plus grande réserve mondiale de platine.`,
          cond: { type: "magma", echelle: "manteau", chemin: [
            pt(1450, 2.6, 1, "Une fusion partielle du manteau produit un liquide très riche en magnésium, qui emporte un peu de platine."),
            pt(1300, 0.25, 2, "Ce liquide emplit une immense chambre située à 5 à 10 km de profondeur (Bushveld, il y a 2,06 milliards d'années)."),
            pt(1150, 0.25, 3, "En refroidissant, il dépose en couches successives la chromite, le pyroxène et le plagioclase ; le platine se concentre dans quelques lits minces.", { bande: "cristallisation" }),
          ], labFondu: "manteau partiellement fondu", note: "Chemin schématique." },
          src: ["hirschmann", SRC.cawthorn] },
        { nom: "Dans une rivière (placer)",
          texte: `L'érosion des massifs ultrabasiques libère le platine, que les rivières concentrent comme l'or. Ce sont les sables aurifères du Chocó, en Colombie, qui le révélèrent aux Espagnols au XVIII<sup>e</sup> siècle : jugé gênant, le métal reçut le nom de <i>platina</i>, « petit argent ». Jusqu'aux années 1920, les placers de l'Oural ont fourni l'essentiel du platine mondial.`,
          cond: false, sansDiagramme: "Pas de diagramme : le mécanisme est celui de l'or en rivière (voir la fiche de l'or)." },
      ],
    },

    // ─────────── Fer ───────────
    fer_natif: {
      sansForme: "Le fer natif ne forme jamais de cristal à faces dans la nature : il se présente en grains et en masses.",
      forme: `Le fer adopte un empilement différent de celui de l'or : cubique centré (un atome au centre du cube), avec seulement 8 voisins. Au-delà de 912 °C, il adopte l'empilement de l'or (fer γ). Dans les météorites, les deux formes coexistent en lamelles (kamacite et taénite) : sciées puis attaquées à l'acide, elles dessinent les figures de Widmanstätten.`,
      intro: `À la surface de la Terre, le fer métal se rencontre rarement : à l'air et dans l'eau, il rouille. Sa formation exige des conditions très réductrices.`,
      scenarios: [
        { nom: "Dans un basalte qui a traversé du charbon",
          texte: `Vers 60 millions d'années, sur l'île de Disko (Groenland), des magmas basaltiques traversèrent des couches de charbon. Le carbone arracha l'oxygène aux oxydes de fer du magma, et le fer se retrouva à l'état métallique, en gouttes puis en masses : l'une d'elles pèse 22 tonnes.`,
          cond: false, sansDiagramme: "Pas de diagramme : ce n'est pas la température ni la pression, mais le contact avec le charbon, qui produit le fer métal." },
        { nom: "Dans les météorites",
          texte: `Ces météorites de fer proviennent du noyau de petits astres détruits par collisions. Leur alliage fer-nickel, en refroidissant de quelques degrés par million d'années, a permis à la kamacite et à la taénite de se séparer en lamelles de plusieurs millimètres.`,
          cond: false, sansDiagramme: "Pas de diagramme : ces conditions, propres au noyau d'un astéroïde, sortent des diagrammes terrestres de l'atlas." },
      ],
    },

    // ─────────── Mercure ───────────
    mercure_natif: {
      sansForme: "À température ambiante, il est liquide et ne forme pas de cristal : la vue montre une goutte, atome par atome.",
      forme: `Unique minéral liquide, il présente des atomes aussi serrés que ceux d'un solide (dix voisins vers 3 Å), mais ils ne s'ordonnent en réseau qu'à −38,8 °C. Au-delà, l'agitation thermique détruit tout ordre. La goutte du schéma ne possède ni maille ni faces : sa surface, arrondie par la tension superficielle, très forte pour le mercure, l'empêche de mouiller le verre.`,
      intro: `C'est par altération du cinabre (HgS) que se forme le mercure natif.`,
      scenarios: [
        { nom: "Dans un gisement de cinabre",
          texte: `En surface, le cinabre s'oxyde et abandonne son mercure, qui suinte en gouttelettes dans les fissures. À Almadén (Espagne), premier gisement mondial de mercure, exploité depuis l'Antiquité, on le recueillait directement dans les galeries.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Arsenic ───────────
    arsenic_natif: {
      sansForme: "Cette forme n'est pas représentée. L'arsenic natif se présente en général en masses mamelonnées à couches concentriques, et ses rares cristaux restent mal décrits.",
      forme: `L'arsenic n'a pas d'empilement compact : chaque atome ne compte que trois voisins, dans des couches plissées visibles sur la structure 3D. Aucune liaison forte ne relie ces couches entre elles, ce qui explique le clivage parfait {0001}. Frappé, il exhale une odeur d'ail.`,
      intro: `Il se dépose dans les filons de basse température, lorsque le soufre vient à manquer pour former des sulfures.`,
      scenarios: [
        { nom: "Dans un filon à cobalt, nickel et argent",
          texte: `À Sainte-Marie-aux-Mines (Alsace), les filons « à cinq éléments » ont livré de belles masses concentriques où l'argent natif se mêle à des arséniures de cobalt et de nickel.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Antimoine ───────────
    antimoine_natif: {
      sansForme: "Forme non représentée : l'antimoine natif forme des masses lamellaires, et ses rares cristaux sont mal décrits.",
      forme: `Structure en couches plissées identique à celle de l'arsenic (trois voisins par atome). Clivage parfait selon {0001}, entre les couches. Le minéral est cassant et se réduit facilement en poudre.`,
      intro: `L'antimoine natif accompagne la stibine (Sb₂S₃) lorsque le soufre fait défaut.`,
      scenarios: [
        { nom: "Dans un filon à stibine",
          texte: `On ne trouve ce métal qu'en quantités modestes, dans quelques filons à stibine. Vers 1900, la France dominait la production mondiale d'antimoine, extrait des districts de Brioude-Massiac et de La Lucette, mais en partant de la stibine.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Bismuth ───────────
    bismuth_natif: {
      sansForme: "Aucune forme représentée : le bismuth natif apparaît en lamelles et en grains. Les cristaux irisés en escaliers, très répandus dans le commerce, résultent d'un bismuth fondu puis refroidi, donc artificiels.",
      forme: `Les plis de ses couches rappellent ceux de l'arsenic et de l'antimoine, et le clivage est parfait selon {0001}. Ses reflets irisés naissent d'une pellicule d'oxyde de quelques dizaines de nanomètres, où la lumière interfère.`,
      intro: `On trouve le bismuth natif associé à l'étain et au tungstène, au sein des filons et des pegmatites issus de granites.`,
      scenarios: [
        { nom: "Dans un filon à étain et tungstène",
          texte: `Lorsque le granite achève sa cristallisation, les eaux chaudes qui s'en échappent laissent cassitérite et wolframite et, en petites quantités, du bismuth natif (Erzgebirge, Cornouailles ; minéral accessoire des filons français à étain et tungstène).`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Graphite ───────────
    graphite: {
      forme: `Le graphite est constitué de feuillets de carbone, chaque atome étant lié à trois voisins en hexagones (1,42 Å). D'un feuillet à l'autre (3,35 Å), seules de faibles forces de van der Waals agissent : les feuillets glissent et se détachent. Il en résulte un <b>clivage basal parfait</b>, une dureté de 1 à 2 et la trace noire du crayon. La croissance est rapide dans le plan des feuillets, ce qui produit des plaquettes hexagonales très minces.`,
      intro: `Presque toujours, le graphite naît de la matière organique d'anciens sédiments que le métamorphisme a cuite.`,
      scenarios: [
        { nom: "Dans une roche métamorphique",
          texte: `Enfouie dans une chaîne de montagnes, une boue riche en débris organiques s'échauffe. La matière perd alors son hydrogène et son oxygène ; à partir de ≈ 330 °C, ses atomes de carbone s'ordonnent peu à peu en feuillets, et vers 650 °C on obtient du graphite bien cristallisé. Ce processus est si régulier qu'il sert de thermomètre : le degré d'ordre du carbone donne la température maximale atteinte par la roche. On trouve souvent des paillettes de graphite dans les marbres et les gneiss.`,
          cond: { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Au fond de la mer, une boue chargée de matière organique s'accumule."),
            pt(330, 0.4, 2, "Enfouie lors d'une collision, elle s'échauffe : au-delà de ≈ 330 °C, le carbone commence à s'ordonner en feuillets."),
            pt(650, 0.7, 3, "Vers 650 °C, il s'agit de graphite bien cristallisé, en paillettes.", { bande: "graphitisation" }),
            pt(400, 0.3),
            pt(15, 0, 4, "Lorsque l'érosion ramène la roche à la surface, le graphite ne se modifie plus."),
          ], note: "Chemin schématique. Plage de graphitisation : géothermomètre Raman de Beyssac et al. (2002), 330–650 °C." },
          src: ["pattison", SRC.beyssac] },
      ],
    },

    // ─────────── Diamant ───────────
    diamant: {
      forme: `Le diamant charpente le carbone en tétraèdres : chaque atome y est relié à quatre voisins par des liaisons covalentes très fortes (1,54 Å), dans les trois directions de l'espace, ce qui en fait le minéral le plus dur. Des plans un peu moins liés, les {111} (faces de l'octaèdre), permettent pourtant de le cliver : c'est ainsi que les diamantaires fendent les pierres. Il s'agit du même carbone que dans le graphite ; seule change la façon de l'assembler, et c'est la pression qui en décide.`,
      intro: `Le diamant ne cristallise qu'à très haute pression, dans le manteau ; seule une éruption très rapide peut le ramener intact.`,
      scenarios: [
        { nom: "Dans le manteau, sous les vieux continents",
          texte: `Entre 150 et 250 km de profondeur, sous les plus vieux continents, la pression excède 5 GPa et fait du diamant la forme stable du carbone. Il y croît lentement à partir de fluides chargés de carbone, entre 900 et 1 400 °C ; la plupart des diamants ont de 1 à 3,5 milliards d'années. Une kimberlite les arrache au manteau et les porte jusqu'en surface en quelques heures, trop vite pour qu'ils se transforment en graphite dans un milieu devenu froid.`,
          cond: { type: "magma", echelle: "profond", chemin: [
            pt(1150, 5.8, 1, "Sous un vieux continent, à ≈ 180 km de profondeur, des fluides chargés de carbone font lentement croître le diamant, il y a 1 à 3,5 milliards d'années."),
            pt(1300, 6.0, 0, "", { lab: "kimberlite" }),
            pt(1050, 0.08, 2, "Bien plus tard, une kimberlite prend naissance en profondeur ; elle regagne la surface en quelques heures, charriant fragments du manteau et diamants."),
            pt(15, 0, 3, "À la surface, le diamant ne serait plus stable, mais à 15 °C sa transformation en graphite exigerait davantage que l'âge de l'Univers."),
          ], etiquettes: [["diamant stable", 700, 6.6], ["graphite stable", 700, 1.2]], note: "Chemin schématique." },
          src: ["hirschmann", "kennedy", SRC.stachel] },
      ],
    },

    // ─────────── Soufre ───────────
    soufre_natif: {
      forme: `Ce cristal est fait de molécules : chaque anneau de huit atomes de soufre (S₈), en forme de couronne, se voit sur la structure 3D. Les liaisons sont solides à l'intérieur d'un anneau, mais les anneaux ne se retiennent entre eux que par de faibles forces de van der Waals ; d'où un soufre tendre (dureté 2), cassant, qui fond dès 115 °C. Empilés selon un réseau orthorhombique, ces anneaux donnent les bipyramides à base losange.`,
      intro: `Le soufre natif se forme soit à partir des gaz volcaniques, soit sous l'action de bactéries qui attaquent le gypse.`,
      scenarios: [
        { nom: "Autour d'une fumerolle",
          texte: `Le sulfure d'hydrogène (H₂S) et le dioxyde de soufre (SO₂) composent les gaz volcaniques. Une fois à l'air libre, ces gaz réagissent entre eux et avec l'oxygène, et le soufre se dépose en croûtes et en aiguilles jaunes autour des bouches : Vulcano (Italie), Kawah Ijen (Indonésie), où des porteurs le descendent encore à dos d'homme.`,
          cond: false, sansDiagramme: "Pas de diagramme : le soufre se dépose dès la sortie du gaz, à la pression de l'air, en quelques heures." },
        { nom: "Dans le gypse, grâce à des bactéries",
          texte: `Au sein de couches de gypse imbibées de pétrole ou de matière organique, des bactéries réduisent les sulfates pour en tirer de l'énergie. Le sulfate du gypse devient alors sulfure d'hydrogène, lequel s'oxyde en soufre, tandis que le calcium demeure en calcite. Ce mécanisme explique les grands cristaux de Sicile et le soufre qui coiffe les dômes de sel (Texas, Louisiane).`,
          cond: false, sansDiagramme: "Pas de diagramme : bactéries et matière organique commandent le processus, et non la température ni la concentration." },
      ],
    },
  });
})();
