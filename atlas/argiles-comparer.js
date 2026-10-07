// ============ Comparer les espèces d'un groupe d'argiles en 3D (chantier G.3, 07/10/2026) ============
// Page d'un groupe d'argiles (#argrp/<famille>-<groupe>) SEULEMENT (demande de l'utilisateur) : une petite fiche par espèce,
// avec un modèle 3D simple. Les vues d'un même groupe ont la même orientation, la même échelle et tournent ensemble (glisser
// sur l'une fait tourner toutes les autres) ; des boutons allument ce qui change d'une espèce à l'autre (sites vides du kaolin,
// cation des octaèdres, aluminium à la place du silicium, ce qui est entre les feuillets…), le reste est estompé
// (option `surligner` du moteur). Rendu : Structure3D.construire + Structure3D.outils.dessiner, sans la barre d'outils.
//
// Modèles : la structure publiée de l'espèce quand elle existe (table ARGILES3D d'espacement-basal.js). Sinon, la structure
// voisine qu'affiche déjà sa page d'espèce, et ses sites remplis selon la formule de l'espèce (`remplacer`, `occuper`) :
// c'est écrit sous la vue (« Modèle de l'atlas »). Les sites partagés ont la couleur mêlée de leurs occupants, comme ailleurs.
// Rôle de chaque atome, calculé : tétraèdre (centre à 4 ligands), octaèdre (centre à 6 ligands dans le feuillet), entre les
// feuillets (hauteur hors des feuillets de COUCHES, ou gros cation K, Na, Ca, Cs, ou eau). Sites vides du kaolin : centres des
// hexagones d'aluminium entourés de 5 ou 6 oxygènes, calculés à l'affichage.
(function () {
  "use strict";
  if (!window.Structure3D || !window.EspacementBasal) return;
  const S = window.Structure3D, O = S.outils, EB = window.EspacementBasal;
  const fr = (x, n = 2) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: n });
  const JAUNE = [245, 196, 0];                 // site vide (lacune) ; kaolin : site n° 1
  const ORANGE = [232, 89, 12];                // kaolin : site vide n° 2 (l'autre site, image miroir du premier)
  const GROS = ["K", "Na", "Ca", "Cs", "Ba", "Sr"];
  const EAU = ["Ow", "Oh", "Os"];
  const CATIONS_OCTA = ["Mg", "Fe", "Al", "Ni", "Li", "Zn", "Mn", "Cr", "Ti", "Co", "V"];
  const POLY = ["Si", "Al", "Mg", "Fe", "Mn", "Ti", "Cr", "Zr", "Sn", "Be", "C", "S", "P", "B", "Zn", "Ni", "Li", "Co"];

  // ── ce qui change, groupe par groupe ───────────────────────────────────────
  // clé = première espèce du groupe (CLASSIF) ; vue : "feuillets" (vues alignées, même échelle), "objet" (vue « Structure »
  // de la page d'espèce : chaque objet garde son orientation) ; aspects : boutons ; especes[eid] : dit (ce qui la distingue),
  // remplacer / occuper (modèle de l'atlas), lacune (une lacune montrée), rep (répétition imposée).
  const A_TOUT = { id: "tout", nom: "Tout", texte: "" };
  const A_OCTA = (texte) => ({ id: "octa", nom: "Octaèdres", texte });
  const A_TETRA_SUB = (texte, nom = "Al à la place de Si") => ({ id: "tsub", nom, texte });
  const A_INTER = (texte, nom = "Entre les feuillets") => ({ id: "inter", nom, texte });
  const SCHEMA = "proportions de la formule, positions de la structure voisine";

  const GROUPES = {
    kaolinite_e: {
      intro: `Les trois espèces ont exactement le même feuillet, Al₂Si₂O₅(OH)₄ : un feuillet de tétraèdres de silicium soudé à un
        feuillet d'octaèdres d'aluminium où un site sur trois reste vide (la lacune). Ce qui change, c'est l'empilement : le décalage
        d'un feuillet au suivant et la place de la lacune dans chaque feuillet (Bailey 1963).`,
      aspects: [A_TOUT,
        { id: "lacunes", nom: "Sites vides (lacunes)", lacunes: true, texte: `Les billes montrent les sites octaédriques vides, le reste est
          estompé. Dans un feuillet, la lacune peut occuper deux sites, images l'un de l'autre dans un miroir : site n° 1 en jaune,
          site n° 2 en orange (numéros calculés sur la structure affichée). Kaolinite : la lacune est au même site dans tous les
          feuillets, tout est jaune. Dickite : elle change de site à chaque feuillet (un feuillet « droit », un feuillet « gauche »).
          Nacrite : elle alterne aussi, mais chaque feuillet est décalé sur le précédent le long de l'autre direction du plan (l'axe
          de 8,9 Å au lieu de celui de 5,1 Å) ; ce décalage se voit à la maille penchée quand on regarde les feuillets par la
          tranche.` }],
      especes: {
        kaolinite_e: { dit: `Un feuillet par maille (triclinique). Chaque feuillet est décalé d'environ un tiers de a (≈ 1,7 Å) sur le
          précédent et sa lacune est au même site. La forme des sols et des altérations de surface.` },
        dickite: { dit: `Deux feuillets par maille (monoclinique). Même décalage que la kaolinite, mais la lacune change de site d'un
          feuillet à l'autre. Elle se forme plus chaud : grès enfouis à plusieurs kilomètres, où la kaolinite se transforme en
          dickite (Beaufort et al. 1998), et filons hydrothermaux.` },
        nacrite: { dit: `Deux feuillets par maille (monoclinique), lacune alternée comme la dickite, mais décalage le long de l'axe de
          8,9 Å. La plus rare des trois, surtout hydrothermale (Zheng et Bailey 1994).` },
      },
      sources: [`Bailey S. W. (1963). « Polymorphism of the kaolin minerals ». <i>American Mineralogist</i> 48, p. 1196–1209.`,
        `Beaufort D. et al. (1998). « Kaolinite-to-dickite reaction in sandstone reservoirs ». <i>Clay Minerals</i> 33, p. 297–316.`],
    },
    chrysotile: {
      vue: "objet",
      intro: `Même feuillet 1:1 de magnésium, Mg₃Si₂O₅(OH)₄, pour les trois. Le feuillet d'octaèdres de magnésium est un peu plus
        large que celui des tétraèdres de silicium (≈ 9,4 Å contre ≈ 9,1 Å pour la même rangée de sites) : chaque espèce règle ce
        désaccord à sa manière. Vues « Structure » : un petit objet entier, atome par atome, comme sur les pages des espèces.`,
      aspects: [A_TOUT,
        { id: "octa", nom: "Couche de magnésium", texte: `En surbrillance, les octaèdres de magnésium. Lizardite : couche plane, le
          désaccord est rattrapé par de petites rotations des tétraèdres et quelques substitutions. Chrysotile : le magnésium reste à
          l'extérieur de la courbure et le feuillet s'enroule en tube. Antigorite : le feuillet ondule, et la couche de silicium
          change de côté à chaque demi-onde.` },
        { id: "tetra", nom: "Couche de silicium", texte: `En surbrillance, les tétraèdres de silicium : à l'intérieur de la spirale
          du chrysotile, d'un côté puis de l'autre dans l'onde de l'antigorite, sur une seule face dans la lizardite.` }],
      especes: {
        chrysotile: { dit: `Feuillets enroulés en tubes d'environ 25 nm de diamètre, magnésium à l'extérieur : l'amiante blanc. Modèle
          de l'atlas : le feuillet de la lizardite enroulé (aucune structure courbe n'est affinée).` },
        antigorite: { dit: `Feuillet ondulé, une onde complète tous les 43,5 Å ; la couche de silicium passe d'un côté à l'autre à chaque
          demi-onde (Capitani et Mellini 2004). La serpentine des températures les plus hautes.` },
        lizardite: { dit: `Feuillets plans, empilés : la serpentine la plus courante, celle des serpentinites formées à basse
          température.` },
      },
      sources: [`Wicks F. J. et O'Hanley D. S. (1988). « Serpentine minerals: structures and petrology ». <i>Reviews in Mineralogy</i>
        19, p. 91–167.`, `Capitani G. et Mellini M. (2004). « The modulated crystal structure of antigorite: the m = 17 polysome ».
        <i>American Mineralogist</i> 89, p. 147–158.`, `Yada K. (1971). « Study of microstructure of chrysotile asbestos by high
        resolution electron microscopy ». <i>Acta Crystallographica</i> A27, p. 659–664.`],
    },
    cronstedtite: {
      intro: `Même charpente 1:1 que les serpentines, avec d'autres cations : fer, aluminium ou nickel prennent la place du magnésium
        dans les octaèdres, et une partie du silicium est remplacée par de l'aluminium ou du fer ferrique dans les tétraèdres.`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les cations des octaèdres : fer (brun), nickel (gris), magnésium (orange), aluminium (bleu pâle) ; un
          site partagé prend la couleur mêlée de ses occupants.`),
        A_TETRA_SUB(`En surbrillance, les tétraèdres où le silicium est en partie remplacé (par Fe³⁺ dans la cronstedtite, par Al
          ailleurs). Rien ne s'allume dans la népouite et la greenalite : leurs tétraèdres ne contiennent que du silicium.`,
          "Ce qui remplace Si")],
      especes: {
        cronstedtite: { dit: `Tout fer : Fe²⁺ et Fe³⁺ dans les octaèdres, Fe³⁺ à la place d'une partie du silicium (27 % des sites
          tétraédriques dans l'échantillon affiné).` },
        berthierine: { dit: `La serpentine des minerais de fer oolithiques (minette lorraine) : fer et aluminium dans les octaèdres,
          aluminium à la place d'une partie du silicium.`,
          modele: SCHEMA, occuper: { octa: { Fe: 0.75, Al: 0.25 }, tetra: { Si: 0.7, Al: 0.3 } } },
        amesite: { dit: `Magnésium et aluminium dans les octaèdres, aluminium dans la moitié des tétraèdres : la plus alumineuse des
          serpentines.` },
        greenalite: { dit: `Fer seul dans les octaèdres (surtout Fe²⁺), silicium seul dans les tétraèdres : l'équivalent ferreux de la
          lizardite, dans les formations de fer rubanées.`,
          modele: SCHEMA, occuper: { octa: { Fe: 1 }, tetra: { Si: 1 } } },
        nepouite: { dit: `Nickel dans les octaèdres, silicium seul dans les tétraèdres : la serpentine des latérites à nickel de
          Nouvelle-Calédonie (Népoui).` },
        odinite: { dit: `Fer ferrique, magnésium et aluminium mêlés dans les octaèdres, dont 2,5 sites sur 3 seulement sont occupés
          (entre di- et trioctaédrique) ; un peu d'aluminium dans les tétraèdres. Argile verte des fonds marins tropicaux peu
          profonds (Bailey 1988).`,
          modele: SCHEMA, occuper: { octa: { Fe: 0.5, Mg: 0.25, Al: 0.25 }, tetra: { Si: 0.85, Al: 0.15 } } },
      },
      sources: [`Bailey S. W. (1988). « Odinite, a new dioctahedral-trioctahedral Fe³⁺-rich 1:1 clay mineral ». <i>Clay Minerals</i>
        23, p. 237–247.`],
    },
    pyrophyllite: {
      intro: `Feuillet 2:1 sans aucune substitution, donc sans charge : rien entre les feuillets. Seul change le cation des octaèdres.`,
      aspects: [A_TOUT, A_OCTA(`En surbrillance, les octaèdres : aluminium dans la pyrophyllite, fer ferrique dans la ferripyrophyllite.
        Dans les deux, un site sur trois reste vide.`)],
      especes: {
        pyrophyllite: { dit: `Aluminium dans deux sites octaédriques sur trois. Minéral tendre des altérations hydrothermales et des
          schistes alumineux.` },
        ferripyrophyllite: { dit: `Fer ferrique à la place de l'aluminium, dans les mêmes sites. Très rare.`,
          modele: SCHEMA, remplacer: { octa: { Al: "Fe" } } },
      },
    },
    montmorillonite: {
      intro: `Smectites dioctaédriques dont la charge naît dans les octaèdres : un cation de valence 2 (Mg²⁺) remplace un cation de
        valence 3. Entre les feuillets, des cations compensent cette charge (l'eau qui les entoure n'est pas dessinée ici).`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les octaèdres, là où naît la charge : aluminium et magnésium mêlés dans la montmorillonite, chrome dans
          la volkonskoïte.`),
        A_INTER(`En surbrillance, les cations entre les feuillets (Ca²⁺ ici), qui compensent la charge des feuillets.`)],
      especes: {
        montmorillonite: { dit: `Aluminium dans les octaèdres, magnésium à la place d'environ un aluminium sur six : c'est là que naît
          la charge. La smectite des bentonites et des sols.`,
          modele: "magnésium placé selon la formule (le modèle publié ne met que de l'aluminium)", occuper: { octa: { Al: 0.85, Mg: 0.15 } } },
        volkonskoite: { dit: `Le chrome (Cr³⁺) remplace l'aluminium ; la charge vient du magnésium qui l'accompagne. Smectite verte et
          rare.`,
          modele: SCHEMA, occuper: { octa: { Cr: 0.75, Mg: 0.15, Fe: 0.1 } } },
      },
    },
    beidellite: {
      intro: `Smectites dioctaédriques dont la charge naît dans les tétraèdres : de l'aluminium remplace un peu de silicium. La
        charge est alors plus près de la surface du feuillet qu'avec la montmorillonite.`,
      aspects: [A_TOUT,
        A_TETRA_SUB(`En surbrillance, les tétraèdres où l'aluminium remplace une partie du silicium (environ un sur huit) : c'est là
          que naît la charge.`, "Tétraèdres : la charge"),
        A_OCTA(`En surbrillance, les octaèdres : aluminium dans la beidellite, fer ferrique dans la nontronite.`),
        A_INTER(`En surbrillance, les cations entre les feuillets (l'eau qui les entoure n'est pas dessinée).`)],
      especes: {
        beidellite: { dit: `Aluminium dans les octaèdres et aluminium à la place d'environ un silicium sur huit.`,
          modele: SCHEMA, occuper: { octa: { Al: 1 }, tetra: { Si: 0.875, Al: 0.125 } } },
        nontronite: { dit: `Fer ferrique dans les octaèdres au lieu de l'aluminium : smectite jaune-vert de l'altération des basaltes et
          des roches riches en fer.` },
      },
    },
    illite_e: {
      intro: `Charge forte du feuillet, compensée par des cations qui ne gardent pas d'eau et verrouillent l'espace entre les feuillets
        vers 10 Å. D'une espèce à l'autre changent le cation entre les feuillets (K⁺, Na⁺ ou Ca²⁺), le cation des octaèdres (Al, Fe³⁺,
        Mg) et la part d'aluminium dans les tétraèdres, qui fixe la charge.`,
      aspects: [A_TOUT,
        A_INTER(`En surbrillance, les cations entre les feuillets : potassium (violet), sodium (jaune), calcium (bleu). Plus le cation
          est petit, plus les feuillets se rapprochent : 10,0 Å pour la muscovite, 9,6 Å pour la paragonite, 9,5 Å pour la margarite.`),
        A_OCTA(`En surbrillance, les octaèdres : aluminium dans la plupart, fer et magnésium dans la glauconite et la céladonite.`),
        A_TETRA_SUB(`En surbrillance, les tétraèdres qui contiennent de l'aluminium ; la légende donne la part d'aluminium dans chaque
          site (l'aluminium y est réparti au hasard, chaque site en contient en moyenne une fraction). Muscovite et paragonite : 25 à
          27 %, un aluminium pour trois silicium. Margarite : la moitié des tétraèdres sont des tétraèdres d'aluminium. Illite : 17 %.
          Céladonite : 8 %.`)],
      especes: {
        illite_e: { dit: `K⁺ entre les feuillets, mais moins que dans un mica (0,65 par demi-maille ici, un site sur trois vide) ; un
          peu de magnésium avec l'aluminium. Le « mica » des argiles et des sols.` },
        brammallite: { dit: `L'illite sodique : Na⁺ entre les feuillets.`, modele: "montrée telle quelle" },
        sericite: { dit: `De la muscovite en paillettes microscopiques : même structure.`, modele: "montrée telle quelle" },
        glauconite_e: { dit: `K⁺ entre les feuillets, fer ferrique avec un peu d'aluminium et de magnésium dans les octaèdres, un peu
          d'aluminium dans les tétraèdres : le grain vert des sables marins.`,
          modele: "sites remplis selon la formule (le modèle publié note Al les octaèdres et Si les tétraèdres)",
          occuper: { octa: { Fe: 0.65, Al: 0.2, Mg: 0.15 }, tetra: { Si: 0.91, Al: 0.09 } } },
        celadonite: { dit: `K⁺ entre les feuillets, fer et magnésium dans les octaèdres, presque pas d'aluminium dans les tétraèdres : la
          charge naît dans les octaèdres.` },
        muscovite_e: { dit: `K⁺ entre les feuillets, aluminium dans les octaèdres, un aluminium pour trois silicium dans les tétraèdres.
          Le mica blanc des granites et des micaschistes.` },
        paragonite: { dit: `Comme la muscovite, mais Na⁺ entre les feuillets : plus petit, il les rapproche (9,6 Å au lieu de 10,0 Å).` },
        margarite: { dit: `Ca²⁺ entre les feuillets et deux aluminium pour deux silicium dans les tétraèdres : charge double, mica
          « dur » et cassant.` },
      },
    },
    talc_e: {
      intro: `Feuillet 2:1 trioctaédrique sans charge : rien entre les feuillets, qui glissent les uns sur les autres. Seul change le
        cation des octaèdres.`,
      aspects: [A_TOUT, A_OCTA(`En surbrillance, les octaèdres : magnésium (orange), fer (brun) ou nickel (gris). Les trois sites sont
        occupés dans les trois espèces.`)],
      especes: {
        talc_e: { dit: `Magnésium dans les trois sites octaédriques.` },
        minnesotaite: { dit: `Fer ferreux à la place du magnésium : le talc des formations de fer rubanées. Dans la réalité, son feuillet
          tétraédrique est découpé en bandes ; cette modulation n'est pas montrée.`,
          modele: SCHEMA, remplacer: { octa: { Mg: "Fe" } } },
        willemseite: { dit: `Nickel à la place du magnésium (plus de nickel que de magnésium).`,
          modele: SCHEMA, occuper: { octa: { Ni: 0.7, Mg: 0.3 } } },
      },
    },
    stevensite: {
      intro: `Smectites trioctaédriques dont la charge naît dans les octaèdres, mais pas de la même façon : un site vide dans la
        stevensite, du lithium dans l'hectorite. Entre les feuillets, les cations qui compensent la charge (eau non dessinée).`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les octaèdres. Stevensite : quelques sites vides (en jaune), chacun laisse deux charges négatives.
          Hectorite : du lithium (vert) partage les sites du magnésium, chaque Li⁺ laisse une charge.`),
        A_INTER(`En surbrillance, les cations entre les feuillets.`)],
      especes: {
        stevensite: { dit: `Magnésium seul, mais environ un site octaédrique sur vingt reste vide. Smectite des lacs salés et des milieux
          très magnésiens. Une seule lacune est montrée.`,
          modele: SCHEMA + " ; lithium retiré, une lacune ajoutée", occuper: { octa: { Mg: 1 } }, remplacer: { inter: { Cs: "Ca" } }, lacune: 1 },
        hectorite: { dit: `Du lithium remplace une partie du magnésium (un site sur cinq environ dans l'échantillon affiné). Smectite
          des argiles à lithium (Hector, Californie).`,
          modele: "Cs⁺ de l'échantillon (échangé au laboratoire) remplacé par Na⁺", remplacer: { inter: { Cs: "Na" } } },
      },
    },
    saponite: {
      intro: `Smectites trioctaédriques dont la charge naît dans les tétraèdres (Al à la place de Si). Aucune n'a de structure
        affinée : les trois vues sont des modèles de l'atlas sur la structure de l'hectorite ; elles montrent quels cations occupent
        quels sites, pas leurs positions exactes.`,
      aspects: [A_TOUT,
        A_TETRA_SUB(`En surbrillance, les tétraèdres où l'aluminium remplace une partie du silicium : c'est là que naît la charge.`,
          "Tétraèdres : la charge"),
        A_OCTA(`En surbrillance, les octaèdres : magnésium, zinc, ou lithium et aluminium mêlés.`),
        A_INTER(`En surbrillance, les cations entre les feuillets (eau non dessinée).`)],
      especes: {
        saponite: { dit: `Magnésium, avec un peu de fer, dans les octaèdres. La smectite des basaltes, des gabbros et des serpentinites
          altérés.`,
          modele: SCHEMA, occuper: { octa: { Mg: 0.9, Fe: 0.1 }, tetra: { Si: 0.9, Al: 0.1 } }, remplacer: { inter: { Cs: "Ca" } } },
        sauconite: { dit: `Zinc à la place du magnésium : smectite des zones oxydées des gisements de zinc.`,
          modele: SCHEMA, occuper: { octa: { Zn: 1 }, tetra: { Si: 0.85, Al: 0.15 } }, remplacer: { inter: { Cs: "Na" } } },
        swinefordite: { dit: `Lithium, aluminium et magnésium mêlés dans les octaèdres, entre di- et trioctaédrique : pegmatites à
          lithium altérées.`,
          modele: SCHEMA, occuper: { octa: { Li: 0.35, Al: 0.35, Mg: 0.3 }, tetra: { Si: 0.9, Al: 0.1 } }, remplacer: { inter: { Cs: "Ca" } } },
      },
    },
    phlogopite: {
      intro: `Micas trioctaédriques : un cation sans eau entre les feuillets, trois sites octaédriques occupés. Ce qui change : le
        cation des octaèdres (magnésium, fer, lithium et aluminium) et, pour la clintonite, celui de l'espace entre les feuillets.`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les octaèdres : magnésium (orange), fer (brun), lithium (vert) et aluminium (bleu pâle) ; un site
          partagé prend la couleur mêlée de ses occupants.`),
        A_INTER(`En surbrillance, les cations entre les feuillets : potassium (violet) partout, calcium (bleu) dans la clintonite.`),
        A_TETRA_SUB(`En surbrillance, les tétraèdres qui contiennent de l'aluminium ; la légende donne sa part dans chaque site : 25 à
          30 % dans la phlogopite, la biotite et l'annite (un aluminium pour trois silicium), 13 à 23 % dans les micas au lithium,
          59 % dans la clintonite.`)],
      especes: {
        phlogopite: { dit: `Magnésium dans les octaèdres : le mica brun clair des marbres et des péridotites.` },
        biotite_e: { dit: `Fer et magnésium mêlés dans les octaèdres : le mica noir des granites et des gneiss.` },
        annite: { dit: `Fer ferreux presque seul dans les octaèdres (81 % des sites dans l'échantillon) : le pôle ferreux de la série.` },
        lepidolite: { dit: `Lithium et aluminium dans les octaèdres, fluor à la place d'une partie des OH : mica rose-lilas des
          pegmatites.` },
        zinnwaldite: { dit: `Lithium, fer et aluminium dans les octaèdres : mica des greisens à étain (Zinnwald, Erzgebirge).` },
        clintonite: { dit: `Ca²⁺ entre les feuillets et beaucoup d'aluminium dans les tétraèdres (trois pour un silicium dans la formule
          idéale, 59 % des sites dans l'échantillon affiné) : mica « dur » et cassant.` },
      },
    },
    cookeite: {
      intro: `Chlorites : entre deux feuillets T-O-T, un feuillet d'hydroxyde occupe tout l'espace. Ici, le T-O-T est dioctaédrique ;
        le feuillet d'hydroxyde est plein.`,
      aspects: [A_TOUT,
        A_INTER(`En surbrillance, le feuillet d'hydroxyde entre les T-O-T : lithium et aluminium dans la cookéite, magnésium et
          aluminium dans la sudoïte.`, "Feuillet d'hydroxyde"),
        A_OCTA(`En surbrillance, les octaèdres du T-O-T, surtout de l'aluminium.`)],
      especes: {
        cookeite: { dit: `Lithium et aluminium dans le feuillet d'hydroxyde : la chlorite des pegmatites à lithium.` },
        sudoite: { dit: `Magnésium et aluminium dans le feuillet d'hydroxyde : chlorite du métamorphisme de très bas degré et des
          altérations hydrothermales.` },
      },
    },
    clinochlore: {
      intro: `Chlorites trioctaédriques : T-O-T et feuillet d'hydroxyde tous deux pleins. Ce qui change, c'est le cation qui domine
        dans les deux feuillets d'octaèdres.`,
      aspects: [A_TOUT,
        { id: "octaTous", nom: "Octaèdres (les deux feuillets)", texte: `En surbrillance, les octaèdres du T-O-T et ceux du feuillet
          d'hydroxyde : magnésium (orange), fer (brun), manganèse (violet), nickel (gris), zinc (gris-vert).` },
        A_INTER(`En surbrillance, le feuillet d'hydroxyde seul.`, "Feuillet d'hydroxyde")],
      especes: {
        clinochlore: { dit: `Magnésium : la chlorite des schistes verts et des serpentinites.` },
        chamosite: { dit: `Fer ferreux à parts égales avec le magnésium dans l'échantillon : chlorite des minerais de fer et des schistes.` },
        pennantite: { dit: `Manganèse à la place du magnésium : chlorite des gisements de manganèse.`,
          modele: SCHEMA, remplacer: { octaTous: { Mg: "Mn", Fe: "Mn" } } },
        nimite: { dit: `Nickel à la place du magnésium : chlorite des gisements de nickel.`,
          modele: SCHEMA, remplacer: { octaTous: { Mg: "Ni", Fe: "Ni" } } },
        baileychlore: { dit: `Zinc à la place du magnésium : très rare, dans des gisements de zinc.`,
          modele: SCHEMA, remplacer: { octaTous: { Mg: "Zn", Fe: "Zn" } } },
      },
    },
    rectorite: {
      intro: `Deux sortes de feuillets alternent dans un même cristal. Aucune structure n'est affinée : chaque vue empile des feuillets
        pris dans deux structures publiées (comme sur les pages des espèces), avec une couche d'eau dans les espaces qui gonflent.`,
      aspects: [A_TOUT,
        A_INTER(`En surbrillance, ce qu'il y a entre les feuillets : cations sans eau (mica), feuillet d'hydroxyde (chlorite), cations
          et eau (smectite, vermiculite), liaisons hydrogène seulement (kaolinite). C'est ce contenu qui alterne.`)],
      especes: {
        rectorite: { dit: `Mica sodique et smectite en alternance régulière, un sur un.` },
        corrensite: { dit: `Chlorite et smectite trioctaédrique en alternance régulière : évaporites et basaltes altérés.` },
        hydrobiotite: { dit: `Biotite et vermiculite en alternance : une étape de l'altération de la biotite.` },
        aliettite: { dit: `Talc et smectite trioctaédrique en alternance régulière.` },
        tosudite: { dit: `Chlorite dioctaédrique et smectite en alternance régulière.` },
        kaolinite_smectite: { dit: `Kaolinite et smectite mêlées au hasard : sols où la smectite se transforme en kaolinite.` },
      },
    },
    sepiolite_e: {
      partage: false,   // palygorskite monoclinique : chaque vue regarde le long de SES canaux (axe c), même échelle
      intro: `Feuillets 2:1 découpés en rubans, retournés d'un ruban à l'autre, qui laissent des canaux remplis d'eau (vus ici en bout,
        à la même échelle). Ce qui change : la largeur des rubans, donc des canaux, et le cation des octaèdres.`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les rubans d'octaèdres : larges de trois chaînes dans la sépiolite (magnésium), de deux dans la
          palygorskite (magnésium et aluminium).`),
        { id: "tetra", nom: "Tétraèdres", texte: `En surbrillance, les tétraèdres de silicium, qui changent de côté d'un ruban à
          l'autre et bordent les canaux.` }],
      especes: {
        sepiolite_e: { dit: `Rubans de trois chaînes ; canaux d'environ 3,7 × 10,6 Å. Néoformée dans les lacs et lagunes riches en
          magnésium.` },
        palygorskite: { dit: `Rubans de deux chaînes ; canaux plus étroits, d'environ 3,7 × 6,4 Å.` },
      },
      sources: [`Galán E. (1996). « Properties and applications of palygorskite-sepiolite clays ». <i>Clay Minerals</i> 31,
        p. 443–453.`],
    },
    allophane_e: {
      vue: "objet",
      intro: `Pas de feuillets empilés : un seul feuillet courbé, refermé en sphère ou roulé en tube. Modèles construits par l'atlas,
        les mêmes que sur les pages des espèces.`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les octaèdres d'aluminium (de fer dans l'hisingérite), à l'extérieur de la courbure.`),
        { id: "tetra", nom: "Tétraèdres", texte: `En surbrillance, les tétraèdres de silicium, à l'intérieur de la sphère et du tube.` }],
      especes: {
        allophane_e: { dit: `Sphère creuse d'environ 3,5 nm, aluminium dehors, silicium dedans, paroi percée : l'argile des andosols.` },
        imogolite: { dit: `Le même feuillet roulé en tube d'environ 2 nm de diamètre, ouvert aux deux bouts (un tube, vu de côté).`,
          publie: true, rep: [1, 1, 3] },
        hisingerite: { dit: `Feuillet 1:1 de fer ferrique (une kaolinite où Fe³⁺ remplace Al) courbé en sphères creuses (ici une calotte de deux
          feuillets) ; le sens de la courbure n'est pas établi.` },
      },
    },
  };

  // ── outils géométriques ───────────────────────────────────────────────────
  const { mult, rotation, rad, unit, vect, scal, sous, orthonormer, hexRgb, COULEURS } = O;
  function vueSelon(B, axe) {   // copie de structures3d.js (pas exportée)
    const [a, , c] = B.map(unit), b = unit(B[1]);
    const perp = (v, n) => unit(sous(v, n.map((x) => x * scal(v, n))));
    let X, Y, Z;
    if (axe === "c") { Z = c; X = perp(a, Z); Y = vect(Z, X); }
    else if (axe === "a") { Z = a; Y = perp(c, Z); X = vect(Y, Z); }
    else { Z = b; Y = perp(c, Z); X = vect(Y, Z); }
    return [X, Y, Z];
  }
  const orientation = (B, vue) => mult(rotation(rad((vue.inclinaison || [0, 0])[0]), rad((vue.inclinaison || [0, 0])[1])), vueSelon(B, vue.axe || "a"));
  function rodrigues(u, a) {
    const [x, y, z] = u, c = Math.cos(a), si = Math.sin(a), t = 1 - c;
    return [[c + x * x * t, x * y * t - z * si, x * z * t + y * si], [y * x * t + z * si, c + y * y * t, y * z * t - x * si],
      [z * x * t - y * si, z * y * t + x * si, c + z * z * t]];
  }
  const couleur = (occ, el) => {
    if (!occ) return hexRgb(COULEURS[el] || "#ff1493");
    const tot = Object.values(occ).reduce((s, x) => s + x, 0) || 1;
    return Object.entries(occ).reduce((s, [e, x]) => { const c = hexRgb(COULEURS[e] || "#ff1493"); return s.map((v, i) => v + c[i] * x / tot); }, [0, 0, 0]).map(Math.round);
  };

  // pseudo-a (≈ 5,2 Å) le long de x pour toutes les structures d'un groupe : la nacrite a ses axes a et b échangés (a = 8,9 Å) ;
  // on la tourne d'un quart de tour autour de la normale (rotation propre : pas d'image miroir)
  function aligner(scene) {
    const la = Math.hypot(...scene.B[0]), lb = Math.hypot(...scene.B[1]);
    if (!(lb < la * 0.8)) return;
    const r = ([x, y, z]) => [y, -x, z];
    scene.atomes.forEach((a) => { a.p = r(a.p); });
    scene.B = scene.B.map(r); scene.coins = scene.coins.map(r); scene.centre = r(scene.centre);
  }

  // rôle de chaque atome : "tetra", "octa", "inter" (entre les feuillets), "eau", "anion"
  function roles(scene, couches) {
    const nLig = new Map(scene.polyedres.map((Q) => [Q.centre, Q.sommets.length]));
    let dansFeuillet = () => true;
    if (couches) {
      const dm = scene.B[2][2];   // hauteur d'une maille (normale aux feuillets = z)
      dansFeuillet = (h) => {
        for (let k = -2; k <= 8; k++) for (const [b, t] of couches) if (h >= b + k * dm - 0.35 && h <= t + k * dm + 0.35) return true;
        return false;
      };
    }
    scene.atomes.forEach((a, i) => {
      a.idx = i;
      if (EAU.includes(a.el)) a.role = "eau";
      else if (GROS.includes(a.el)) a.role = "inter";
      else if (["O", "H", "F", "Cl"].includes(a.el)) a.role = dansFeuillet(a.p[2]) ? "anion" : "inter";
      else if (!dansFeuillet(a.p[2])) a.role = "inter";
      else if (nLig.get(i) === 4 && !["Li", "Mg", "Mn", "Ni", "Cr", "Co", "Ca", "Na", "K"].includes(a.el)) a.role = "tetra";
      else if (nLig.get(i) >= 5 || CATIONS_OCTA.includes(a.el)) a.role = "octa";
      else a.role = "anion";
      a.cation = !["O", "H", "F", "Cl"].includes(a.el) && !EAU.includes(a.el);
    });
  }
  const dansRole = (a, r) => r === "octaTous" ? a.cation && (a.role === "octa" || (a.role === "inter" && a.estCentre)) : a.role === r && a.cation;

  // modèle de l'atlas : sites remplis selon la formule de l'espèce
  function remplir(scene, spec) {
    const fixe = (a, occ) => {
      const k = Object.keys(occ).filter((e) => occ[e] > 0);
      if (k.length === 1) { a.el = k[0]; a.occ = null; }
      else { a.el = k.sort((x, y) => occ[y] - occ[x])[0]; a.occ = occ; }
      a._rgb = null; delete a._rgb;
    };
    Object.entries(spec.remplacer || {}).forEach(([r, carte]) => scene.atomes.forEach((a) => {
      if (!dansRole(a, r)) return;
      const occ = a.occ ? Object.assign({}, a.occ) : { [a.el]: 1 };
      let change = false;
      Object.entries(carte).forEach(([de, vers]) => {
        if (!(de in occ)) return;
        occ[vers] = (occ[vers] || 0) + occ[de]; delete occ[de]; change = true;
      });
      if (change) fixe(a, occ);
    }));
    Object.entries(spec.occuper || {}).forEach(([r, occ]) => scene.atomes.forEach((a) => { if (dansRole(a, r)) fixe(a, Object.assign({}, occ)); }));
    if (spec.lacune) {   // une lacune montrée (stevensite) : l'octaèdre le plus proche du centre perd son cation
      const xmax = Math.max(...scene.atomes.filter((a) => a.role === "octa" && a.cation).map((a) => a.p[0]));
      const oc = scene.atomes.filter((a) => a.role === "octa" && a.cation && a.p[0] > xmax - 1.5)
        .sort((x, y) => Math.hypot(x.p[1] - scene.centre[1], x.p[2] - scene.centre[2]) - Math.hypot(y.p[1] - scene.centre[1], y.p[2] - scene.centre[2]));
      oc.slice(0, spec.lacune).forEach((a) => {
        scene.polyedres = scene.polyedres.filter((Q) => Q.centre !== a.idx);
        Object.assign(a, { el: "Vc", occ: null, estCentre: false, vide: true, echelle: 2.2, _rgb: JAUNE });
      });
    }
  }

  // sites octaédriques vides d'un feuillet dioctaédrique : centres des hexagones de cations (2 A − N pour chaque voisin N),
  // entourés de 5 ou 6 oxygènes, sans cation à moins de 1,5 Å
  function lacunes(scene) {
    const A = scene.atomes.filter((a) => a.role === "octa" && a.cation && a.estCentre);
    const out = [];
    for (const a of A) for (const q of A) {
      if (q === a || Math.abs(q.p[2] - a.p[2]) > 1.2 || Math.hypot(q.p[0] - a.p[0], q.p[1] - a.p[1]) > 3.4) continue;
      const c = [2 * a.p[0] - q.p[0], 2 * a.p[1] - q.p[1], (a.p[2] + q.p[2]) / 2];
      if (out.some((v) => Math.hypot(v[0] - c[0], v[1] - c[1], v[2] - c[2]) < 0.8)) continue;
      if (A.some((x) => Math.hypot(x.p[0] - c[0], x.p[1] - c[1], x.p[2] - c[2]) < 1.5)) continue;
      const nO = scene.atomes.filter((x) => x.el === "O" && Math.hypot(x.p[0] - c[0], x.p[1] - c[1], x.p[2] - c[2]) < 2.45).length;
      if (nO >= 5) out.push(c);
    }
    return out;
  }
  // numéro du site vide, feuillet par feuillet : la lacune la plus centrale de chaque feuillet est repérée par les directions de
  // ses trois silicium les plus proches (feuillet tétraédrique du même feuillet) ; même signature = même site (1), image miroir = 2
  function sequenceLacunes(scene, L) {
    const niveaux = [];
    L.forEach((v) => { let n = niveaux.find((x) => Math.abs(x.z - v[2]) < 1.5); if (!n) niveaux.push(n = { z: v[2], l: [] }); n.l.push(v); });
    niveaux.sort((x, y) => x.z - y.z);
    const c = scene.centre;
    const sig = niveaux.map((n) => {
      const v = n.l.sort((x, y) => Math.hypot(x[0] - c[0], x[1] - c[1]) - Math.hypot(y[0] - c[0], y[1] - c[1]))[0];
      const si = scene.atomes.filter((x) => x.el === "Si" && Math.abs(x.p[2] - v[2]) > 1 && Math.abs(x.p[2] - v[2]) < 4)
        .map((x) => [x.p[0] - v[0], x.p[1] - v[1]]).sort((x, y) => Math.hypot(...x) - Math.hypot(...y)).slice(0, 3);
      return si.map(([x, y]) => Math.atan2(y, x)).sort((x, y) => x - y);
    });
    if (sig.some((s) => s.length < 3)) return null;
    const meme = (s, t) => s.every((x, i) => Math.abs(Math.atan2(Math.sin(x - t[i]), Math.cos(x - t[i]))) < 0.2);
    const sites = [];
    sig.forEach((s) => {
      let k = sites.findIndex((t) => meme(s, t));
      if (k < 0) { sites.push(s); k = sites.length - 1; }
      s.site = k + 1;
    });
    return sig.map((s) => s.site);
  }

  // ── construction d'une vue ──────────────────────────────────────────────────
  const charger = (f) => new Promise((ok) => (S.donnees[f] ? ok(S.donnees[f]) : S.charger(f, ok)));
  async function preparer(eid, cfg, vue) {
    const cle = eid, ent = S.entree(cle), X = EB.ARGILES3D[cle];
    if (!ent || !X) return null;
    const fichier = X[0], spec = (cfg.especes || {})[eid] || {};
    for (const f of [ent.fichier || fichier].concat(ent.fichiers || [])) await charger(f);
    const base = S.donnees[ent.fichier || fichier];
    if (!base) return null;
    let d = base, opts = {}, couches = null, objet = false;
    const c = EB.COUCHES[fichier];
    if (vue === "objet" && !spec.publie && window.ArgilesParticules && ArgilesParticules.a(cle)) {
      d = ArgilesParticules.construire(cle, 0); objet = true;
      opts = { repetition: d.repetition || [1, 1, 1], decalage: d.decalage };
    } else if (EB.INTERSTRAT[cle] && ent.etats) {
      // interstratifiés : empilement construit (« plusieurs feuillets »), UNE couche d'eau dans les espaces qui gonflent et largeur
      // d'une maille : deux couches et la largeur doublée faisaient 20 000 atomes pour six vues
      d = ent.etats[1].construire(base, true);
      opts = { repetition: [d.repetition[0], Math.max(1, d.repetition[1] / 2), d.repetition[2]], decalage: d.decalage };
      couches = d.cote && d.cote.feuillets;
    } else if (c) {   // feuillets : ≈ 10 Å le long du pseudo-a, ≈ 18 Å le long du pseudo-b, 3 ou 4 feuillets
      const [la, lb] = base.maille;
      const nf = c.feuillets.length, cible = c.d < 8 ? 4 : c.d < 12 ? 3 : 2;
      const rep = la > lb ? [2, 1, Math.ceil(cible / nf)] : [1, 2, Math.ceil(cible / nf)];
      opts = { repetition: spec.rep || rep, decalage: c.decalage };
      couches = c.feuillets;
    } else {
      opts = { repetition: spec.rep || (base.particule ? [1, 1, 1] : [1, 1, 1]) };
      objet = !!base.particule;
    }
    opts.polyedres = POLY;
    // liaisons au fluor et Li–O un peu plus longues (micas au lithium) : sinon Fe et Li n'ont que 4 ligands et passent pour
    // des tétraèdres
    d = Object.assign({}, d, { liaisons: Object.assign({ "Fe-F": 2.4, "Li-F": 2.3, "Mg-F": 2.3, "Mn-F": 2.4, "Li-O": 2.4 }, d.liaisons || {}) });
    const scene = S.construire(d, opts);
    if (!objet) aligner(scene);
    roles(scene, couches);
    remplir(scene, spec);
    let seq = null;
    if ((cfg.aspects || []).some((x) => x.lacunes)) {
      const L = lacunes(scene);
      // numéro des sites : calculé sur un bloc plus large (3 × 3 mailles), pour que la lacune repérée ait tous ses voisins
      const grand = S.construire(d, Object.assign({}, opts, { repetition: [3, 3, opts.repetition[2]] }));
      roles(grand, couches);
      seq = sequenceLacunes(grand, lacunes(grand));
      // même découpage en feuillets que le grand bloc (mêmes hauteurs) : le n-ième feuillet reçoit le n-ième numéro
      const zs = [];
      L.forEach((p) => { if (!zs.some((z) => Math.abs(z - p[2]) < 1.5)) zs.push(p[2]); });
      zs.sort((x, y) => x - y);
      L.forEach((p) => {
        const site = seq ? seq[zs.findIndex((z) => Math.abs(z - p[2]) < 1.5)] || 1 : 1;
        scene.atomes.push({ el: "Vc", p, echelle: 0, f: [0, 0, 0], etiquette: "lacune", lacune: true, site, role: "vide", _rgb: site === 2 ? ORANGE : JAUNE });
      });
    }
    const fibre = EB.FAMILLE && EB.FAMILLE[fichier] === "fibre";
    const vueDep = objet && d !== base ? (d.vue || { axe: "a" }) : base.particule ? (ent.vue || { axe: "a" })
      : fibre ? { axe: "c" } : { axe: "a", inclinaison: [16, -24] };
    const axeRot = objet ? (d.rotationAxe === "b" ? unit(scene.B[1]) : unit(vect(scene.B[0], scene.B[1])))
      : base.particule || fibre ? unit(scene.B[1]) : [0, 0, 1];
    return { eid, d, base, scene, spec, seq, vueDep, axeRot, fichier, objet, emprunt: fichier !== cleDe(eid), X };
  }
  // la structure « propre » de l'espèce : celle dont le fichier porte son nom (kaolinite_e → kaolinite)
  const cleDe = (eid) => eid.replace(/_e$/, "");

  // ── rendu ───────────────────────────────────────────────────────────────
  function etendue(v) {
    const S0 = v.scene, xs = [], ys = [];
    S0.atomes.forEach((a) => { if (a.lacune) return; const q = sous(a.p, S0.centre); xs.push(scal(v.R[0], q)); ys.push(scal(v.R[1], q)); });
    if (!v.particule) S0.coins.forEach((c) => { const q = sous(c, S0.centre); xs.push(scal(v.R[0], q)); ys.push(scal(v.R[1], q)); });
    return { x: 2 * Math.max(...xs.map(Math.abs)) + 1.4, y: 2 * Math.max(...ys.map(Math.abs)) + 1.4 };
  }
  function predicat(aspect) {
    switch (aspect.id) {
      case "lacunes": return (a) => a.lacune;
      case "octa": return (a) => a.vide || (a.role === "octa" && a.cation);
      case "octaTous": return (a) => dansRole(a, "octaTous");
      case "tetra": return (a) => a.role === "tetra";
      case "tsub": return (a) => a.role === "tetra" && (a.el !== "Si" || (a.occ && Object.keys(a.occ).some((e) => e !== "Si" && a.occ[e] > 0)));
      case "inter": return (a) => a.role === "inter" || a.role === "eau";
      default: return null;
    }
  }

  // « Si 75 % / Al 25 % » : occupation d'un site partagé (trois éléments au plus, les autres en « … »)
  const partage = (occ) => {
    const l = Object.entries(occ).filter(([, x]) => x > 0).sort((x, y) => y[1] - x[1]);
    return l.slice(0, 3).map(([e, x]) => `${e} ${Math.round(x * 100)} %`).join(" / ") + (l.length > 3 ? " / …" : "");
  };
  function legende(P, aspect) {
    const vus = new Map();
    const f = predicat(aspect);
    P.scene.atomes.forEach((a) => {
      if (!a.cation && !EAU.includes(a.el) && !a.lacune && !a.vide) return;
      if ((a.lacune && !aspect.lacunes) || (f && !f(a))) return;
      const k = a.lacune ? "lacune" + (a.site || 1) : a.vide ? "lacune" : EAU.includes(a.el) ? "H₂O" : a.occ ? partage(a.occ) : a.el;
      const rang = { tetra: 0, octa: 1, vide: 2, inter: 3, eau: 4 }[a.vide ? "vide" : a.role] ?? 5;
      if (!vus.has(k)) vus.set(k, [a.lacune ? a._rgb : a.vide ? JAUNE : EAU.includes(a.el) ? hexRgb(COULEURS.Ow) : couleur(a.occ, a.el), rang + (a.site || 0) / 10]);
    });
    return [...vus].sort((x, y) => x[1][1] - y[1][1]).slice(0, 8).map(([k, [c]]) => `<span class="s3d-el"><i style="background:rgb(${c.join(",")})"></i>${k === "lacune" ? "site vide" : k.startsWith("lacune") ? "site vide n° " + k.slice(6) : k}</span>`).join("");
  }

  const reference = (d) => {
    const s = (d && d.source) || {};
    if (s.modele) return "modèle construit par l'atlas";
    const au = (s.auteurs || []).map((x) => x.split(",")[0].trim().replace(/(\s+[A-Z]\.?)+$/, ""));
    return au.length ? `${au.length > 2 ? au[0] + " et al." : au.join(" et ")} (${s.annee})` : "";
  };
  // « de la cronstedtite », « du talc » : nom de la structure montrée, avec son article
  const MASCULIN = ["talc", "clinochlore"];
  const NOMS = { sudoite: "sudoïte" };
  const deLa = (f) => (/^[aeiouyhé]/.test(f) ? "de l'" : MASCULIN.includes(f) ? "du " : "de la ") + (NOMS[f] || f);

  function carteHTML(eid, P, cfg) {
    const e = ESPECES[eid], spec = (cfg.especes || {})[eid] || {};
    let modele;
    if (!P) modele = "Pas de modèle 3D pour cette espèce.";
    else if (P.objet && P.base.source && P.base.source.modele) modele = "Modèle construit par l'atlas.";
    else if (P.objet || EB.INTERSTRAT[eid]) modele = `Modèle de l'atlas à partir de la structure ${P.emprunt ? deLa(P.fichier) : "publiée"}, ${reference(P.base)}.`;
    else if (spec.modele === "montrée telle quelle") modele = `Structure ${deLa(P.fichier)}, ${reference(P.base)}, montrée telle quelle.`;
    else if (P.emprunt || spec.modele) modele = `${P.emprunt ? `Modèle de l'atlas : structure ${deLa(P.fichier)}, ${reference(P.base)}` : `Structure : ${reference(P.base)}`}${spec.modele ? ` ; ${spec.modele}` : ""}.`;
    else modele = `Structure affinée : ${reference(P.base)}.`;
    const seq = P && P.seq ? `<p class="cmp-seq">Site de la lacune, feuillet après feuillet : <b>${P.seq.join(" · ")}</b></p>` : "";
    return `<figure class="cmp-carte" data-cmp="${eid}">
      ${P ? `<canvas class="cmp-vue" role="img" aria-label="Structure de ${e.nom} : faire glisser pour tourner"></canvas>` : `<div class="cmp-vide">${modele}</div>`}
      <figcaption>
        <div class="cmp-tete"><button type="button" class="min-chip" data-espece="${eid}"><b>${e.nom}</b></button>
          <span class="cmp-formule">${e.formule}</span></div>
        <div class="cmp-legende s3d-legende"></div>
        ${seq}
        <p class="cmp-dit">${spec.dit || e.note}</p>
        ${P ? `<p class="cmp-modele">${modele}</p>` : ""}
      </figcaption>
    </figure>`;
  }

  // ── page du groupe ────────────────────────────────────────────────────────
  function configDe(g) {
    if (!g || !g.especes || g.especes.length < 2) return null;
    return GROUPES[g.especes[0]] || null;
  }
  function html(g) {
    const cfg = configDe(g);
    if (!cfg) return "";
    return `<div class="card cmp" data-cmp-groupe="${g.especes[0]}">
      <h2>Comparer les espèces en 3D</h2>
      <p class="sub">${cfg.intro}</p>
      <div class="s3d-outils cmp-outils">
        <div class="s3d-seg" data-cmp-aspects>${cfg.aspects.map((x, i) => `<button type="button" data-aspect="${x.id}" aria-pressed="${i === 0}">${x.nom}</button>`).join("")}</div>
        <div class="s3d-seg"><button type="button" data-mode="polyedres" aria-pressed="true">Polyèdres</button><button type="button" data-mode="billes" aria-pressed="false">Billes</button></div>
        <div class="s3d-seg"><button type="button" data-zoom="1.2" aria-label="Zoomer">+</button><button type="button" data-zoom="0.83" aria-label="Dézoomer">−</button></div>
        <div class="s3d-seg"><button type="button" data-tourne aria-pressed="true">Rotation</button></div>
      </div>
      <p class="cmp-aspect" aria-live="polite"></p>
      <p class="cmp-aide">${cfg.vue === "objet" || cfg.partage === false ? "Chaque objet garde son orientation de départ ; faire glisser sur une vue pour la tourner, double-clic pour revenir au départ."
        : "Les vues ont la même orientation et la même échelle : faire glisser sur l'une fait tourner toutes les autres ; double-clic pour revenir au départ."}</p>
      <div class="cmp-grille">${g.especes.map((eid) => `<figure class="cmp-carte cmp-attente" data-cmp="${eid}"><div class="cmp-vide">Chargement…</div></figure>`).join("")}</div>
      <details class="cmp-sources"><summary>Sources</summary><ul></ul></details>
    </div>`;
  }

  async function monter(racine) {
    const bloc = racine && racine.querySelector("[data-cmp-groupe]");
    if (!bloc || bloc.dataset.monte) return;
    bloc.dataset.monte = "1";
    const cfg = GROUPES[bloc.dataset.cmpGroupe];
    const especes = [...bloc.querySelectorAll(".cmp-carte")].map((x) => x.dataset.cmp);
    const partage = cfg.vue !== "objet" && cfg.partage !== false;
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const etat = { aspect: cfg.aspects[0], mode: "polyedres", zoom: 1, tourne: !reduit, R: null };
    const P = await Promise.all(especes.map((eid) => preparer(eid, cfg, cfg.vue).catch(() => null)));
    if (!bloc.isConnected) return;
    // une fiche par espèce
    const grille = bloc.querySelector(".cmp-grille");
    grille.innerHTML = especes.map((eid, i) => carteHTML(eid, P[i], cfg)).join("");
    const vues = [];
    especes.forEach((eid, i) => {
      if (!P[i]) return;
      const fig = grille.querySelector(`[data-cmp="${eid}"]`);
      const v = { canvas: fig.querySelector("canvas"), scene: P[i].scene, particule: P[i].objet ? P[i].d.particule || "objet" : P[i].base.particule || null,
        mode: "polyedres", zoom: 1, hydrogene: false, cote: null, repetition: [1, 1, 1], P: P[i], fig };
      v.canvas.__v = v;   // pour les contrôles (planche hors écran)
      v.R0 = orientation(v.scene.B, P[i].vueDep);
      v.R = v.R0;
      vues.push(v);
    });
    if (partage && vues.length) etat.R = vues[0].R0;
    // même échelle pour tout le groupe : la plus grande étendue
    const recadrer = () => {
      vues.forEach((v) => { if (partage) v.R = etat.R; v.etendue = etendue(v); });
      const ex = Math.max(...vues.map((v) => v.etendue.x)), ey = Math.max(...vues.map((v) => v.etendue.y));
      vues.forEach((v) => { v.etendue = { x: ex, y: ey }; });
    };
    recadrer();
    let cout = 0;   // durée du dernier dessin de toutes les vues (ms)
    const dessiner = (liste = vues) => { const t0 = performance.now(); liste.forEach((v) => {
      v.mode = etat.mode; v.zoom = etat.zoom;
      if (partage) v.R = etat.R;
      v.surligner = predicat(etat.aspect);
      try { O.dessiner(v); } catch (err) { /* pas encore mis en page */ }
    }); if (liste === vues) cout = performance.now() - t0; };
    const appliquerAspect = () => {
      vues.forEach((v) => v.scene.atomes.forEach((a) => { if (a.lacune) a.echelle = etat.aspect.lacunes ? 2.2 : 0; }));
      bloc.querySelector(".cmp-aspect").innerHTML = etat.aspect.texte || "";
      bloc.querySelector(".cmp-aspect").hidden = !etat.aspect.texte;
      vues.forEach((v) => { v.fig.querySelector(".cmp-legende").innerHTML = legende(v.P, etat.aspect); });
      bloc.querySelectorAll(".cmp-seq").forEach((x) => { x.hidden = !etat.aspect.lacunes; });
      dessiner();
    };
    appliquerAspect();
    // sources : celles du groupe + les structures montrées
    const refs = [...new Set(P.filter(Boolean).map((p) => S.referenceHTML(p.base)))];
    bloc.querySelector(".cmp-sources ul").innerHTML = (cfg.sources || []).concat(refs).map((s) => `<li>${s}</li>`).join("");

    // boutons
    bloc.querySelector(".cmp-outils").addEventListener("click", (e) => {
      const bt = e.target.closest("button");
      if (!bt) return;
      const seg = bt.parentElement;
      if (bt.dataset.aspect) { etat.aspect = cfg.aspects.find((x) => x.id === bt.dataset.aspect); appliquerAspect(); }
      else if (bt.dataset.mode) { etat.mode = bt.dataset.mode; dessiner(); }
      else if (bt.dataset.zoom) { etat.zoom = Math.min(5, Math.max(0.4, etat.zoom * Number(bt.dataset.zoom))); dessiner(); return; }
      else if (bt.hasAttribute("data-tourne")) { etat.tourne = !etat.tourne; bt.setAttribute("aria-pressed", String(etat.tourne)); return; }
      seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
    });
    // glisser : toutes les vues tournent ensemble (groupes à feuillets), ou la seule vue touchée (objets)
    let glisse = null;
    vues.forEach((v) => {
      const c = v.canvas;
      c.addEventListener("pointerdown", (e) => { glisse = { v, x: e.clientX, y: e.clientY }; c.setPointerCapture(e.pointerId); });
      c.addEventListener("pointermove", (e) => {
        if (!glisse || glisse.v !== v || (!e.buttons && e.pointerType === "mouse")) { if (glisse && glisse.v === v) glisse = null; return; }
        const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
        glisse.x = e.clientX; glisse.y = e.clientY;
        const R = mult(rotation(dy * 0.01, dx * 0.01), partage ? etat.R : v.R);
        if (partage) { etat.R = R; dessiner(); } else { v.R = R; dessiner([v]); }
      });
      const fin = () => { glisse = null; };
      c.addEventListener("pointerup", fin); c.addEventListener("pointercancel", fin); c.addEventListener("lostpointercapture", fin);
      c.addEventListener("dblclick", () => {
        etat.zoom = 1;
        if (partage) etat.R = vues[0].R0; else v.R = v.R0;
        recadrer(); dessiner();
      });
    });
    // rotation lente (4° par seconde) autour de la normale aux feuillets, seulement à l'écran
    let visible = true, tPrec = 0, tDessin = 0;
    if (window.IntersectionObserver) new IntersectionObserver((x) => { visible = x[0].isIntersecting; }).observe(bloc);
    const tic = (t) => {
      if (!bloc.isConnected) return;
      if (etat.tourne && visible && !document.hidden && !glisse && tPrec) {
        const a = rad(4 * Math.min(0.1, (t - tPrec) / 1000));
        if (partage) etat.R = orthonormer(mult(etat.R, rodrigues(vues[0].P.axeRot, a)));
        else vues.forEach((v) => { v.R = orthonormer(mult(v.R, rodrigues(v.P.axeRot, a))); });
        if (t - tDessin > Math.max(50, 3 * cout)) { tDessin = t; dessiner(); }
      }
      tPrec = t;
      requestAnimationFrame(tic);
    };
    requestAnimationFrame(tic);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => { if (!bloc.isConnected) ro.disconnect(); else dessiner(); });
      vues.forEach((v) => ro.observe(v.canvas));
    }
  }

  window.ArgilesComparer = { html, monter, GROUPES, _preparer: preparer, _lacunes: lacunes };
})();
