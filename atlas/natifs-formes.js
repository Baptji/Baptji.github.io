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
      macleNote: "Macle du spinelle : deux octaèdres accolés sur une face {111}, l'un tourné de 180° — elle aplatit souvent les cristaux en triangles.",
      facies: [
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Huit faces triangulaires : ce sont les plans d'atomes les plus serrés de l'empilement, ceux qui poussent le plus lentement et finissent par border le cristal. Les cristaux d'or nets sont rares et petits (quelques millimètres) : l'or se trouve surtout en pépites, paillettes, feuilles et arborescences." },
        { nom: "Octaèdre et dodécaèdre",
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.12 }],
          note: "Les arêtes de l'octaèdre sont remplacées par de longues facettes {110} : forme fréquente des cristaux des filons de quartz." },
        { nom: "Macle du spinelle", azimut: 30, elevation: 14, macle: { plan: [1, 1, 1], compo: [1, 1, 1] },
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Deux moitiés d'octaèdre soudées sur une face {111}, l'une tournée de 180° par rapport à l'autre : l'angle rentrant le long de la soudure trahit la macle." },
      ],
      clivages: [],
    },

    // ─────────── Argent ───────────
    argent_natif: {
      nom: "Argent", couleur: "#d6d6d2", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(4.0862), mailleSource: "cod9008459",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Les cristaux d'argent sont rares et presque toujours déformés ; l'argent natif se trouve surtout en fils tordus et en arborescences." },
        { nom: "Cubo-octaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.3 }],
          note: "Les sommets du cube sont coupés par les faces de l'octaèdre." },
      ],
      clivages: [],
    },

    // ─────────── Cuivre ───────────
    cuivre_natif: {
      nom: "Cuivre", couleur: "#c8784a", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(3.61496), mailleSource: "cod9008468",
      macleNote: "Macle du spinelle sur {111}, fréquente : elle fait pousser les cristaux en branches.",
      facies: [
        { nom: "Dodécaèdre", formes: [{ sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.0 }],
          note: "Douze losanges : forme courante des cristaux de cuivre, souvent alignés les uns derrière les autres en arborescences." },
        { nom: "Cube et dodécaèdre",
          formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }, { sym: "d", hkl: [1, 1, 0], nom: "dodécaèdre rhombique", d: 1.2 }],
          note: "Cube dont les arêtes sont remplacées par les faces du dodécaèdre." },
      ],
      clivages: [],
    },

    // ─────────── Platine ───────────
    platine_natif: {
      nom: "Platine", couleur: "#c9c9c6", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(3.9231), mailleSource: "cod9008480",
      facies: [
        { nom: "Cube", formes: [{ sym: "a", hkl: [1, 0, 0], nom: "cube", d: 1.0 }],
          note: "Les cubes de platine sont exceptionnels (quelques gisements de l'Oural) : le platine se trouve presque toujours en grains et en pépites, roulés par les rivières." },
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
          note: "Une plaquette à six côtés, très mince : le graphite pousse vite dans le plan des feuillets d'atomes, à peine dans l'autre sens. Les paillettes des marbres et des gneiss ont cette forme." },
      ],
      clivages: [{ hkl: [0, 0, 0, 1], qualite: "parfait", nom: "basal, entre les feuillets", pas: 0.2 }],
    },

    // ─────────── Diamant ───────────
    diamant: {
      nom: "Diamant", couleur: "#e4ecef", systeme: "cubique", classe: "m-3m", classeNom: "hexakisoctaédrique", reseau: "F",
      maille: CUBIQUE(3.56679), mailleSource: "cod9011575",
      macleNote: "Macle du spinelle sur {111} : les diamantaires l'appellent « macle » tout court ; elle donne des cristaux plats et triangulaires.",
      facies: [
        { nom: "Octaèdre", formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "La forme de croissance du diamant dans le manteau. Les faces portent souvent de petits creux triangulaires (trigons), traces de dissolution pendant la remontée." },
        { nom: "Macle (spinelle)", azimut: 30, elevation: 24, macle: { plan: [1, 1, 1], compo: [1, 1, 1] },
          formes: [{ sym: "o", hkl: [1, 1, 1], nom: "octaèdre", d: 1.0 }],
          note: "Deux moitiés d'octaèdre accolées sur une face {111} : un cristal plat, triangulaire, avec une encoche le long de la soudure." },
      ],
      clivages: [{ hkl: [1, 1, 1], qualite: "parfait", nom: "octaédrique, quatre directions", pas: 0.26 }],
    },

    // ─────────── Soufre ───────────
    soufre_natif: {
      nom: "Soufre", couleur: "#f0d53a", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "F",
      maille: [10.4646, 12.866, 24.486, 90, 90, 90], mailleSource: "cod9011362", azimut: 24, elevation: 12,
      facies: [
        { nom: "Bipyramide", formes: [{ sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.0 }],
          note: "Deux pyramides à base losange, pointues : la forme la plus courante des cristaux de soufre." },
        { nom: "Bipyramide tronquée",
          formes: [
            { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 1.0 },
            { sym: "s", hkl: [1, 1, 3], nom: "bipyramide aplatie", d: 1.3 },
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.5 },
            { sym: "n", hkl: [0, 1, 1], nom: "prisme", d: 1.35 },
          ],
          note: "Les pointes sont coupées par une seconde bipyramide plus plate {113} et par la base {001} : c'est l'allure des cristaux de Sicile, posés sur le gypse ou la calcite." },
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
  const PAS_DIAG = "Pas de diagramme : ce qui décide ici, c'est la chimie de l'eau (oxydant ou réducteur, soufre présent ou non), qu'aucun des diagrammes de l'atlas ne représente pour ce métal.";

  Object.assign(MIN_F, {

    // ─────────── Or ───────────
    or_natif: {
      forme: `Dans l'or, les atomes sont tenus par la <b>liaison métallique</b> : un « gaz » d'électrons partagés, qui ne
        privilégie aucune direction. Les atomes s'empilent donc comme des billes, de la façon la plus serrée possible
        (cubique à faces centrées, 12 voisins chacun). Aucun plan n'est plus faible qu'un autre : <b>pas de clivage</b>.
        En revanche, les plans les plus denses {111} glissent facilement les uns sur les autres sans se séparer — c'est
        ce qui rend l'or si malléable qu'un gramme s'étire en un fil de plus de 2 km. Ces mêmes plans {111} sont les
        faces de l'octaèdre du schéma.`,
      intro: `L'or naît dans les filons de quartz, déposé par des eaux chaudes ; l'érosion de ces filons le libère ensuite,
        et, très lourd, il s'accumule au fond des rivières.`,
      scenarios: [
        { nom: "Dans un filon de quartz",
          texte: `En profondeur, une eau chaude chargée de soufre transporte l'or sous forme de complexes dissous (Au(HS)₂⁻),
            à des teneurs infimes — quelques microgrammes par litre. Quand elle se refroidit, qu'elle bout ou qu'elle
            rencontre une roche riche en fer qui lui prend son soufre, l'or se dépose en grains dans le quartz qui
            cristallise en même temps. Il faut des millions de mètres cubes d'eau pour faire un gisement : c'est le cas de
            Salsigne (Aude), la dernière grande mine d'or de France, fermée en 2004.`,
          cond: { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)",
            chemin: [
              { T: 300, C: 663, n: 1, t: "Vers 300 °C (jusqu'à 400 °C dans certains gisements), à plusieurs kilomètres de profondeur, l'eau porte la silice et l'or (en complexes soufrés) des roches traversées." },
              { T: 200, C: 663, n: 2, t: "Elle remonte le long d'une faille et se refroidit : elle est sursaturée." },
              { T: 150, C: 137, n: 3, t: "Le quartz du filon cristallise ; l'or se dépose avec lui, en grains, quand l'eau perd son soufre (roche riche en fer, ébullition)." },
            ],
            note: "Le diagramme montre la silice, qui forme le quartz du filon : l'or, des millions de fois moins abondant dans l'eau, ne peut pas être tracé à la même échelle. Chemin schématique." },
          src: ["rimstidt", "fournier", SRC.groves] },
        { nom: "Dans une rivière (placer)",
          texte: `L'érosion du filon libère l'or. Dix-neuf fois plus lourd que l'eau, sept fois plus que le quartz, il tombe
            au fond dès que le courant faiblit, bien avant les sables : une paillette de 0,3 mm se dépose comme un gravier
            de quartz de 2 mm. Il s'accumule dans les creux du lit, derrière les gros blocs et sur la roche en place : ce sont
            les placers, que les orpailleurs de l'Ariège, du Gardon ou du Rhin ont lavés à la batée pendant des siècles.`,
          cond: { type: "courant", autres: [{ pts: [[0.3, 180], [0.3, 3]], lab: "sable" }], chemin: [
            q({ d: 2, v: 220 }, 0, "", { lab: "crue" }),
            q({ d: 2, v: 150 }, 1, "En crue, le courant roule graviers et galets ; les paillettes d'or, libérées du filon par l'érosion, voyagent avec eux."),
            q({ d: 2, v: 12 }, 2, "Une paillette d'or de 0,3 mm tombe comme un grain de quartz de ≈ 2 mm : dès que le courant passe sous ≈ 20 cm/s, elle se dépose avec les graviers, au fond du chenal, quand le sable est encore emporté."),
            q({}, 3, "Crue après crue, l'or se concentre dans les creux du lit et sur la roche en place : un placer."),
          ], note: "Diagramme calculé pour des grains de quartz : l'or y est placé à la taille du grain de quartz qui tombe à la même vitesse (équivalence hydraulique)." },
          src: [SRC.placer] },
      ],
    },

    // ─────────── Argent ───────────
    argent_natif: {
      forme: `Même empilement que l'or, et pour la même raison (liaison métallique, sans direction privilégiée) : pas de
        clivage, et une grande malléabilité. Les deux métaux ont presque la même maille (4,08 et 4,09 Å) : ils se mêlent
        en toutes proportions, c'est l'électrum.`,
      intro: `L'argent natif se forme surtout là où l'argent d'un minerai sulfuré est réduit ou remis en solution.`,
      scenarios: [
        { nom: "Dans un filon à cobalt et nickel",
          texte: `Dans certains filons de basse température, l'argent se dépose directement à l'état natif, avec des
            arséniures de cobalt et de nickel, de l'arsenic natif et de la calcite : ce sont les filons « à cinq éléments »
            (Ag, Co, Ni, As, Bi) de Kongsberg en Norvège ou de Sainte-Marie-aux-Mines en Alsace. L'argent y pousse en
            fils et en arborescences.`,
          cond: false, sansDiagramme: PAS_DIAG },
        { nom: "Sous la zone d'oxydation (cémentation)",
          texte: `Près de la surface, l'eau de pluie oxyde les minerais sulfurés et dissout leur argent. En descendant, elle
            atteint la nappe, où le milieu redevient réducteur : l'argent s'y redépose à l'état métallique. Ces zones
            enrichies ont fait la fortune des premières mines d'argent.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Cuivre ───────────
    cuivre_natif: {
      forme: `Encore l'empilement le plus serré de sphères (cubique à faces centrées), avec des atomes plus petits que ceux
        de l'or : 2,56 Å entre voisins au lieu de 2,88. Pas de clivage ; le métal se plie et s'étire. Les cristaux poussent
        plus vite le long de certaines directions, d'où les arborescences de petits cristaux alignés.`,
      intro: `Le cuivre natif apparaît là où une eau chargée de cuivre rencontre un milieu réducteur.`,
      scenarios: [
        { nom: "Dans les basaltes",
          texte: `Le plus grand gisement du monde est sur la presqu'île de Keweenaw (lac Supérieur, États-Unis) : il y a
            1,1 milliard d'années, des eaux chaudes ont circulé dans un empilement de coulées de basalte et y ont déposé du
            cuivre métallique dans les bulles des laves et entre les galets. Une seule masse, trouvée en 1857, pesait
            environ 500 tonnes.`,
          cond: false, sansDiagramme: PAS_DIAG },
        { nom: "Sous la zone d'oxydation (cémentation)",
          texte: `Comme pour l'argent : l'eau de pluie dissout le cuivre des sulfures près de la surface, puis le redépose
            plus bas, sous la nappe, à l'état natif ou sous forme de cuprite. Chessy-les-Mines, près de Lyon, célèbre pour
            ses azurites, en a livré.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Platine ───────────
    platine_natif: {
      forme: `Cubique à faces centrées, comme l'or et le cuivre, et sans clivage. Le platine est le plus dense des éléments
        natifs courants (21,4 pur, 14 à 19 dans la nature, à cause du fer qu'il contient) et il ne s'altère pas :
        les rivières le roulent en grains sans l'abîmer.`,
      intro: `Le platine naît dans les magmas les plus pauvres en silice ; les rivières le concentrent ensuite.`,
      scenarios: [
        { nom: "Dans un magma ultrabasique",
          texte: `Un magma issu du manteau, très riche en magnésium, se refroidit dans une grande chambre. Le platine, qui
            ne trouve pas de place dans les minéraux silicatés, suit les gouttes de sulfure ou les cristaux de chromite qui
            tombent au fond : il se concentre dans quelques couches minces. Le récif de Merensky, dans le complexe du
            Bushveld (Afrique du Sud, 2,06 milliards d'années), ne fait qu'un mètre d'épaisseur mais renferme la plus
            grande réserve de platine du monde.`,
          cond: { type: "magma", echelle: "manteau", chemin: [
            pt(1450, 2.6, 1, "Le manteau fond en partie : le liquide, très riche en magnésium, emporte un peu de platine."),
            pt(1300, 0.25, 2, "Il remplit une immense chambre à 5–10 km de profondeur (Bushveld, il y a 2,06 milliards d'années)."),
            pt(1150, 0.25, 3, "En refroidissant, il dépose chromite, pyroxène, plagioclase en couches ; le platine se concentre dans quelques lits minces.", { bande: "cristallisation" }),
          ], labFondu: "manteau partiellement fondu", note: "Chemin schématique." },
          src: ["hirschmann", SRC.cawthorn] },
        { nom: "Dans une rivière (placer)",
          texte: `L'érosion des massifs ultrabasiques libère le platine, que les rivières concentrent comme l'or. C'est dans
            les sables aurifères du Chocó, en Colombie, que les Espagnols l'ont découvert au XVIII<sup>e</sup> siècle : ils le
            jugeaient gênant et l'appelaient <i>platina</i>, « petit argent ». Les placers de l'Oural ont ensuite fourni
            l'essentiel du platine mondial jusqu'aux années 1920.`,
          cond: false, sansDiagramme: "Pas de diagramme : même mécanisme que l'or en rivière (voir la fiche de l'or)." },
      ],
    },

    // ─────────── Fer ───────────
    fer_natif: {
      sansForme: "Pas de cristal à faces dans la nature : le fer natif se trouve en grains et en masses.",
      forme: `Le fer s'empile autrement que l'or : cubique CENTRÉ (un atome au milieu du cube), 8 voisins seulement. Au-dessus
        de 912 °C, il passe à l'empilement de l'or (fer γ). Dans les météorites, les deux formes coexistent en lamelles
        (kamacite et taénite) : sciées et attaquées à l'acide, elles dessinent les figures de Widmanstätten.`,
      intro: `Sur Terre, le fer métal est presque introuvable : à l'air et dans l'eau, il rouille. Il ne se forme que dans des
        conditions très réductrices.`,
      scenarios: [
        { nom: "Dans un basalte qui a traversé du charbon",
          texte: `Sur l'île de Disko (Groenland), il y a environ 60 millions d'années, des magmas basaltiques ont traversé des
            couches de charbon. Le carbone a pris l'oxygène des oxydes de fer du magma, et le fer s'est retrouvé à l'état
            métallique, en gouttes puis en masses : l'une d'elles pèse 22 tonnes.`,
          cond: false, sansDiagramme: "Pas de diagramme : c'est le contact avec le charbon, et non la température ou la pression, qui fait le fer métal." },
        { nom: "Dans les météorites",
          texte: `Les météorites de fer sont des morceaux du noyau de petits astres détruits par des collisions. Leur alliage
            de fer et de nickel s'est refroidi de quelques degrés par million d'années, assez lentement pour que kamacite et
            taénite se séparent en lamelles de plusieurs millimètres.`,
          cond: false, sansDiagramme: "Pas de diagramme : ces conditions (noyau d'astéroïde) sont hors des diagrammes terrestres de l'atlas." },
      ],
    },

    // ─────────── Mercure ───────────
    mercure_natif: {
      sansForme: "Liquide à la température ambiante : pas de cristal. La vue montre une goutte, atome par atome.",
      forme: `Seul minéral liquide. Ses atomes sont aussi serrés que dans un solide (dix voisins vers 3 Å), mais ils ne
        s'organisent en réseau qu'à −38,8 °C : au-dessus, l'agitation thermique suffit à défaire tout ordre. La goutte du
        schéma n'a ni maille ni faces ; sa surface est arrondie par la tension superficielle, très forte pour le mercure,
        qui l'empêche de mouiller le verre.`,
      intro: `Le mercure natif est un produit d'altération du cinabre (HgS).`,
      scenarios: [
        { nom: "Dans un gisement de cinabre",
          texte: `Près de la surface, le cinabre s'oxyde et libère son mercure, qui suinte en gouttelettes dans les fissures de
            la roche. À Almadén (Espagne), le plus grand gisement de mercure du monde, exploité depuis l'Antiquité, on en
            recueillait dans les galeries.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Arsenic ───────────
    arsenic_natif: {
      sansForme: "Forme non dessinée : l'arsenic natif se trouve presque toujours en masses mamelonnées à couches concentriques ; ses rares cristaux sont mal décrits.",
      forme: `L'arsenic n'est pas un métal à empilement compact : chaque atome est lié à trois voisins seulement, dans des
        couches plissées que l'on voit sur la structure 3D. Entre les couches, aucune vraie liaison : d'où le clivage
        parfait {0001}. Frappé, il dégage une odeur d'ail.`,
      intro: `L'arsenic natif se dépose dans des filons de basse température, quand il n'y a plus assez de soufre pour former
        des sulfures.`,
      scenarios: [
        { nom: "Dans un filon à cobalt, nickel et argent",
          texte: `Les filons « à cinq éléments » de Sainte-Marie-aux-Mines (Alsace) en ont livré de belles masses
            concentriques, avec l'argent natif et les arséniures de cobalt et de nickel.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Antimoine ───────────
    antimoine_natif: {
      sansForme: "Forme non dessinée : l'antimoine natif se trouve en masses lamellaires ; ses rares cristaux sont mal décrits.",
      forme: `Même structure en couches plissées que l'arsenic (trois voisins par atome) : clivage parfait {0001}, entre les
        couches. Cassant, il se réduit facilement en poudre.`,
      intro: `L'antimoine natif accompagne la stibine (Sb₂S₃) quand le soufre vient à manquer.`,
      scenarios: [
        { nom: "Dans un filon à stibine",
          texte: `Rare : quelques filons à stibine en livrent de petites masses. La France a été le premier producteur
            mondial d'antimoine vers 1900 (districts de Brioude-Massiac et de La Lucette), mais à partir de la stibine.`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Bismuth ───────────
    bismuth_natif: {
      sansForme: "Forme non dessinée : le bismuth natif se trouve en lamelles et en grains. Les cristaux en escaliers irisés vendus partout sont artificiels (bismuth fondu puis refroidi).",
      forme: `Couches plissées, comme l'arsenic et l'antimoine : clivage parfait {0001}. Les reflets irisés viennent d'une
        pellicule d'oxyde de quelques dizaines de nanomètres, qui fait interférer la lumière.`,
      intro: `Le bismuth natif se trouve avec l'étain et le tungstène, dans les filons et les pegmatites liés aux granites.`,
      scenarios: [
        { nom: "Dans un filon à étain et tungstène",
          texte: `En fin de cristallisation d'un granite, les eaux chaudes qui s'en échappent déposent cassitérite,
            wolframite et, en petites quantités, bismuth natif (Erzgebirge, Cornouailles ; accessoire dans les filons
            français à étain et tungstène).`,
          cond: false, sansDiagramme: PAS_DIAG },
      ],
    },

    // ─────────── Graphite ───────────
    graphite: {
      forme: `Le graphite est fait de feuillets de carbone, chaque atome lié à trois voisins en hexagones (1,42 Å). D'un
        feuillet à l'autre (3,35 Å), il n'y a que de faibles forces de van der Waals : les feuillets glissent et se
        détachent. D'où le <b>clivage basal parfait</b>, la dureté de 1 à 2 et le trait noir du crayon. Il pousse vite
        dans le plan des feuillets, d'où les plaquettes hexagonales très minces.`,
      intro: `Le graphite vient presque toujours de la matière organique d'anciens sédiments, cuite par le métamorphisme.`,
      scenarios: [
        { nom: "Dans une roche métamorphique",
          texte: `Une boue riche en débris organiques est enfouie dans une chaîne de montagnes. En chauffant, la matière
            organique perd son hydrogène et son oxygène ; à partir de ≈ 330 °C, ses atomes de carbone s'ordonnent
            progressivement en feuillets, et vers 650 °C c'est du graphite bien cristallisé. Ce passage est si régulier
            qu'il sert de thermomètre : le degré d'ordre du carbone donne la température maximale atteinte par la roche.
            Les marbres et les gneiss en contiennent souvent des paillettes.`,
          cond: { type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin: [
            pt(15, 0, 1, "Une boue riche en matière organique se dépose au fond de la mer."),
            pt(330, 0.4, 2, "Enfouie dans une collision, elle chauffe : au-delà de ≈ 330 °C, le carbone commence à s'ordonner en feuillets."),
            pt(650, 0.7, 3, "Vers 650 °C, c'est du graphite bien cristallisé, en paillettes.", { bande: "graphitisation" }),
            pt(400, 0.3),
            pt(15, 0, 4, "L'érosion de la chaîne ramène la roche en surface ; le graphite ne change plus."),
          ], note: "Chemin schématique. Plage de graphitisation : géothermomètre Raman de Beyssac et al. (2002), 330–650 °C." },
          src: ["pattison", SRC.beyssac] },
      ],
    },

    // ─────────── Diamant ───────────
    diamant: {
      forme: `Dans le diamant, chaque atome de carbone est lié à quatre voisins en tétraèdre, par des liaisons covalentes
        très fortes (1,54 Å) qui forment une charpente dans les trois directions : c'est le minéral le plus dur. La charpente
        a pourtant des plans un peu moins liés, les {111} — les faces de l'octaèdre — selon lesquels il se clive :
        les diamantaires s'en servent pour fendre les pierres. Même carbone que le graphite : seule la façon de
        l'assembler change, et c'est la pression qui décide.`,
      intro: `Le diamant ne cristallise qu'à très haute pression, dans le manteau, et seule une éruption très rapide peut le
        ramener intact.`,
      scenarios: [
        { nom: "Dans le manteau, sous les vieux continents",
          texte: `À 150–250 km de profondeur, sous les continents les plus anciens, la pression dépasse 5 GPa : le diamant
            y est la forme stable du carbone. Il y pousse lentement, à partir de fluides riches en carbone, entre 900 et
            1 400 °C ; la plupart des diamants ont de 1 à 3,5 milliards d'années. Une éruption de kimberlite les arrache et
            les ramène en surface en quelques heures : trop vite, et dans un milieu trop froid à l'arrivée, pour qu'ils aient
            le temps de se changer en graphite.`,
          cond: { type: "magma", echelle: "profond", chemin: [
            pt(1150, 5.8, 1, "À ≈ 180 km, sous un vieux continent, le diamant pousse lentement à partir de fluides riches en carbone (il y a 1 à 3,5 milliards d'années)."),
            pt(1300, 6.0, 0, "", { lab: "kimberlite" }),
            pt(1050, 0.08, 2, "Bien plus tard, une kimberlite naît plus bas et remonte en quelques heures, en emportant des fragments du manteau et leurs diamants."),
            pt(15, 0, 3, "En surface, le diamant n'est plus stable — mais à 15 °C, sa conversion en graphite prendrait plus que l'âge de l'Univers."),
          ], etiquettes: [["diamant stable", 700, 6.6], ["graphite stable", 700, 1.2]], note: "Chemin schématique." },
          src: ["hirschmann", "kennedy", SRC.stachel] },
      ],
    },

    // ─────────── Soufre ───────────
    soufre_natif: {
      forme: `Le soufre natif est un cristal de <b>molécules</b> : des anneaux de huit atomes (S₈), en couronne, que l'on voit
        sur la structure 3D. Les liaisons sont fortes à l'intérieur d'un anneau, mais les anneaux ne se tiennent entre eux
        que par de faibles forces de van der Waals : le soufre est tendre (dureté 2), cassant, et fond dès 115 °C. Ces
        anneaux s'empilent en un réseau orthorhombique, d'où les bipyramides à base losange.`,
      intro: `Le soufre natif naît soit des gaz des volcans, soit de bactéries qui s'attaquent au gypse.`,
      scenarios: [
        { nom: "Autour d'une fumerolle",
          texte: `Les gaz volcaniques contiennent du sulfure d'hydrogène (H₂S) et du dioxyde de soufre (SO₂). En sortant à l'air,
            ils réagissent entre eux et avec l'oxygène et déposent du soufre en croûtes et en aiguilles jaunes autour des
            bouches : Vulcano (Italie), Kawah Ijen (Indonésie), où des porteurs le descendent encore à dos d'homme.`,
          cond: false, sansDiagramme: "Pas de diagramme : le dépôt se fait à la sortie du gaz, à pression atmosphérique, en quelques heures." },
        { nom: "Dans le gypse, grâce à des bactéries",
          texte: `Dans des couches de gypse imprégnées de pétrole ou de matière organique, des bactéries tirent leur énergie de
            la réduction des sulfates : elles transforment le sulfate du gypse en sulfure d'hydrogène, qui s'oxyde à son
            tour en soufre, et le calcium reste en calcite. C'est l'origine des grands cristaux de Sicile et du soufre du
            chapeau des dômes de sel (Texas, Louisiane).`,
          cond: false, sansDiagramme: "Pas de diagramme : ce sont les bactéries et la matière organique qui décident, pas la température ni la concentration." },
      ],
    },
  });
})();
