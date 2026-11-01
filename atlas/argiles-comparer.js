// ============ Comparer les espèces d'un groupe d'argiles en 3D (chantier G.3, 07/10/2026) ============
// Vue d'ensemble des argiles (#argiles), dans le panneau de chaque groupe (08/10/2026 : les pages de groupe #argrp n'existent plus,
// argiles-vue.js ; avant : page du groupe seulement, ni fiche d'espèce ni fiche d'argile) : une petite fiche par espèce,
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
  const SCHEMA = "répartition selon la formule ; positions empruntées à la structure voisine";

  const GROUPES = {
    kaolinite_e: {
      intro: `Les trois espèces partagent un même feuillet, Al₂Si₂O₅(OH)₄ : une couche de tétraèdres de silicium accolée à une couche d'octaèdres d'aluminium dont un site sur trois demeure vide (la lacune). Seul l'empilement diffère : le décalage d'un feuillet à l'autre et la position de la lacune dans chaque feuillet (Bailey 1963).`,
      aspects: [A_TOUT,
        { id: "lacunes", nom: "Sites vides (lacunes)", lacunes: true, texte: `Estompé sauf les billes, qui signalent les sites octaédriques vides. Au sein d'un feuillet, la lacune peut se loger sur deux sites symétriques par rapport à un miroir : site n° 1 en jaune, site n° 2 en orange (numéros calculés sur la structure affichée). Kaolinite : même site dans tous les feuillets, donc tout en jaune. Dickite : site qui change à chaque feuillet (feuillet « droit » puis « gauche »). Nacrite : alternance également, mais décalage de chaque feuillet sur le précédent selon l'autre direction du plan (axe de 8,9 Å au lieu de 5,1 Å) ; visible à la maille inclinée quand on regarde les feuillets en tranche.` }],
      especes: {
        kaolinite_e: { dit: `Un seul feuillet par maille (triclinique). Chaque feuillet se décale d'environ un tiers de a (≈ 1,7 Å) par rapport au précédent, tout en gardant sa lacune au même site. C'est la forme des sols et des altérations de surface.` },
        dickite: { dit: `Deux feuillets par maille (monoclinique). Même décalage que la kaolinite, mais la lacune change de site d'un
          feuillet à l'autre. Elle se forme plus chaud : grès enfouis à plusieurs kilomètres, où la kaolinite se transforme en
          dickite (Beaufort et al. 1998), et filons hydrothermaux.` },
        nacrite: { dit: `Deux feuillets par maille (monoclinique) ; la lacune alterne comme dans la dickite, mais le décalage se fait le long de l'axe de 8,9 Å. C'est la moins fréquente des trois, surtout d'origine hydrothermale (Zheng et Bailey 1994).` },
      },
      sources: [`Bailey S. W. (1963). « Polymorphism of the kaolin minerals ». <i>American Mineralogist</i> 48, p. 1196–1209.`,
        `Beaufort D. et al. (1998). « Kaolinite-to-dickite reaction in sandstone reservoirs ». <i>Clay Minerals</i> 33, p. 297–316.`],
    },
    chrysotile: {
      vue: "objet",
      intro: `Feuillet 1:1 de magnésium, Mg₃Si₂O₅(OH)₄, commun aux trois espèces. Sa couche d'octaèdres magnésiens dépasse légèrement celle des tétraèdres de silicium (≈ 9,4 Å contre ≈ 9,1 Å, pour la même rangée de sites), et chaque espèce règle ce désaccord à sa manière. En vue « Structure », chacune apparaît comme un petit objet entier, atome par atome, à la façon des pages d'espèces.`,
      aspects: [A_TOUT,
        { id: "octa", nom: "Couche de magnésium", texte: `Les octaèdres magnésiens ressortent en couleur. Côté lizardite, le feuillet est plan et l'écart se compense par de légères rotations de tétraèdres, accompagnées de quelques substitutions. Côté chrysotile, la courbure rejette le magnésium vers l'extérieur, d'où le tube qui s'enroule. Côté antigorite, l'ondulation fait passer la couche de silicium d'un côté à l'autre à chaque demi-onde.` },
        { id: "tetra", nom: "Couche de silicium", texte: `Mis en évidence : les tétraèdres de silicium. Dans la spirale du chrysotile ils sont à l'intérieur ; dans l'onde de l'antigorite ils passent alternativement d'un côté puis de l'autre ; dans la lizardite ils n'occupent qu'une seule face.` }],
      especes: {
        chrysotile: { dit: `Ce sont des tubes d'environ 25 nm de diamètre, enroulés magnésium vers l'extérieur : il s'agit de l'amiante blanc. Le modèle de l'atlas reprend le feuillet de la lizardite, enroulé, aucune structure courbe n'ayant été affinée.` },
        antigorite: { dit: `Feuillet ondulé : une onde entière couvre 43,5 Å. La couche de silicium bascule d'un côté à l'autre à chaque demi-onde (Capitani et Mellini 2004). Il s'agit de la serpentine des températures les plus élevées.` },
        lizardite: { dit: `Empilement de feuillets plans. C'est la serpentine la plus répandue ; elle caractérise les serpentinites formées à basse température.` },
      },
      sources: [`Wicks F. J. et O'Hanley D. S. (1988). « Serpentine minerals: structures and petrology ». <i>Reviews in Mineralogy</i>
        19, p. 91–167.`, `Capitani G. et Mellini M. (2004). « The modulated crystal structure of antigorite: the m = 17 polysome ».
        <i>American Mineralogist</i> 89, p. 147–158.`, `Yada K. (1971). « Study of microstructure of chrysotile asbestos by high
        resolution electron microscopy ». <i>Acta Crystallographica</i> A27, p. 659–664.`],
    },
    cronstedtite: {
      intro: `Même charpente 1:1 que les serpentines, mais avec d'autres cations : fer, aluminium ou nickel occupent la place du magnésium dans les octaèdres, tandis qu'une partie du silicium cède la sienne à l'aluminium ou au fer ferrique dans les tétraèdres.`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les cations occupant les octaèdres : fer (brun), nickel (gris), magnésium (orange), aluminium (bleu pâle). Un site partagé se colore du mélange de ses occupants.`),
        A_TETRA_SUB(`En surbrillance, les tétraèdres où le silicium cède une partie de sa place : au Fe³⁺ dans la cronstedtite, à l'Al ailleurs. Rien ne s'éclaire pour la népouite ni pour la greenalite, dont les tétraèdres ne contiennent que du silicium.`,
          "Ce qui remplace Si")],
      especes: {
        cronstedtite: { dit: `Fer exclusivement : Fe²⁺ et Fe³⁺ occupent les octaèdres, et Fe³⁺ remplace une partie du silicium (27 % des sites tétraédriques de l'échantillon affiné).` },
        berthierine: { dit: `Serpentine des minerais de fer oolithiques (minette lorraine) : fer et aluminium occupent les octaèdres, et l'aluminium remplace une partie du silicium.`,
          modele: SCHEMA, occuper: { octa: { Fe: 0.75, Al: 0.25 }, tetra: { Si: 0.7, Al: 0.3 } } },
        amesite: { dit: `Magnésium et aluminium dans les octaèdres, aluminium dans la moitié des tétraèdres : c'est la serpentine la plus riche en aluminium.` },
        greenalite: { dit: `Dans les octaèdres, fer seul (surtout Fe²⁺) ; dans les tétraèdres, silicium seul. C'est l'équivalent ferreux de la lizardite, que l'on retrouve dans les formations de fer rubanées.`,
          modele: SCHEMA, occuper: { octa: { Fe: 1 }, tetra: { Si: 1 } } },
        nepouite: { dit: `Octaèdres à nickel, tétraèdres à silicium seul : c'est la serpentine des latérites nickélifères de Nouvelle-Calédonie (Népoui).` },
        odinite: { dit: `Les octaèdres renferment ensemble fer ferrique, magnésium et aluminium, et seulement 2,5 sites sur 3 sont occupés, à mi-chemin entre dioctaédrique et trioctaédrique ; un peu d'aluminium s'insère dans les tétraèdres. Argile verte des fonds marins tropicaux peu profonds (Bailey 1988).`,
          modele: SCHEMA, occuper: { octa: { Fe: 0.5, Mg: 0.25, Al: 0.25 }, tetra: { Si: 0.85, Al: 0.15 } } },
      },
      sources: [`Bailey S. W. (1988). « Odinite, a new dioctahedral-trioctahedral Fe³⁺-rich 1:1 clay mineral ». <i>Clay Minerals</i>
        23, p. 237–247.`],
    },
    pyrophyllite: {
      intro: `Feuillet 2:1 dépourvu de toute substitution, donc sans charge, et sans rien entre les feuillets. Seul le cation des octaèdres diffère.`,
      aspects: [A_TOUT, A_OCTA(`En surbrillance, les octaèdres : ils renferment l'aluminium dans la pyrophyllite, le fer ferrique dans la ferripyrophyllite. Dans les deux espèces, un site sur trois reste vacant.`)],
      especes: {
        pyrophyllite: { dit: `Deux sites octaédriques sur trois sont occupés par l'aluminium. Ce minéral tendre est caractéristique des altérations hydrothermales et des schistes alumineux.` },
        ferripyrophyllite: { dit: `Dans les mêmes sites que l'aluminium, c'est le fer ferrique qui s'installe. Espèce très rare.`,
          modele: SCHEMA, remplacer: { octa: { Al: "Fe" } } },
      },
    },
    montmorillonite: {
      intro: `Smectites dioctaédriques dont la charge prend naissance dans les octaèdres : un cation de valence 2 (Mg²⁺) prend la place d'un cation de valence 3. Des cations logés entre les feuillets compensent cette charge (l'eau qui les entoure n'est pas représentée ici).`,
      aspects: [A_TOUT,
        A_OCTA(`Les octaèdres, siège de la charge, sont en surbrillance : aluminium et magnésium mêlés dans la montmorillonite, chrome dans la volkonskoïte.`),
        A_INTER(`Les cations logés entre les feuillets (Ca²⁺ ici) sont en surbrillance : ils compensent la charge des feuillets.`)],
      especes: {
        montmorillonite: { dit: `Aluminium dans les octaèdres, avec du magnésium à la place d'environ un aluminium sur six : c'est là que la charge prend son origine. Cette smectite forme les bentonites et les sols.`,
          modele: "magnésium disposé selon la formule, alors que le modèle publié ne renferme que de l'aluminium", occuper: { octa: { Al: 0.85, Mg: 0.15 } } },
        volkonskoite: { dit: `Le chrome (Cr³⁺) prend la place de l'aluminium ; la charge provient du magnésium qui l'accompagne. Smectite verte, rare.`,
          modele: SCHEMA, occuper: { octa: { Cr: 0.75, Mg: 0.15, Fe: 0.1 } } },
      },
    },
    beidellite: {
      intro: `Smectites dioctaédriques dont la charge prend naissance dans les tétraèdres : de l'aluminium s'y substitue à une partie du silicium. La charge se situe alors plus près de la surface du feuillet qu'avec la montmorillonite.`,
      aspects: [A_TOUT,
        A_TETRA_SUB(`Les tétraèdres où l'aluminium remplace une part du silicium (environ un sur huit) sont en surbrillance : c'est là que la charge prend naissance.`, "Tétraèdres : la charge"),
        A_OCTA(`En surbrillance, les octaèdres : de l'aluminium pour la beidellite, du fer ferrique pour la nontronite.`),
        A_INTER(`Les cations entre les feuillets sont en surbrillance (l'eau qui les entoure n'est pas représentée).`)],
      especes: {
        beidellite: { dit: `Dans les octaèdres, de l'aluminium ; et de l'aluminium remplaçant environ un silicium sur huit.`,
          modele: SCHEMA, occuper: { octa: { Al: 1 }, tetra: { Si: 0.875, Al: 0.125 } } },
        nontronite: { dit: `Le fer ferrique occupe les octaèdres à la place de l'aluminium : c'est une smectite jaune-vert, formée lors de l'altération des basaltes et des roches ferrugineuses.` },
      },
    },
    illite_e: {
      intro: `Le feuillet porte une charge élevée, compensée par des cations déshydratés qui bloquent l'espace entre les feuillets vers 10 Å. D'une espèce à l'autre varient le cation logé entre les feuillets (K⁺, Na⁺ ou Ca²⁺), celui des octaèdres (Al, Fe³⁺, Mg) et la part d'aluminium dans les tétraèdres, qui fixe la charge.`,
      aspects: [A_TOUT,
        A_INTER(`Surbrillance des cations logés entre les feuillets : potassium (violet), sodium (jaune) et calcium (bleu). Un cation plus petit rapproche davantage les feuillets : 10,0 Å (muscovite), 9,6 Å (paragonite), 9,5 Å (margarite).`),
        A_OCTA(`Octaèdres en surbrillance, majoritairement occupés par l'aluminium ; le fer et le magnésium prennent le relais dans la glauconite et la céladonite.`),
        A_TETRA_SUB(`Les tétraèdres renfermant de l'aluminium sont en surbrillance ; la légende indique la part d'aluminium de chaque site (il est réparti au hasard, si bien que chaque site en contient une fraction moyenne). Muscovite et paragonite : 25 à 27 %, soit un aluminium pour trois silicium. Margarite : la moitié des tétraèdres sont occupés par l'aluminium. Illite : 17 %. Céladonite : 8 %.`)],
      especes: {
        illite_e: { dit: `Un mica où moins de K⁺ occupe l'espace inter-feuillets qu'une muscovite (0,65 par demi-maille, un site sur trois étant vide), avec un peu de magnésium à côté de l'aluminium. C'est le « mica » de nombreux argiles et sols.` },
        brammallite: { dit: `Variante sodique de l'illite : Na⁺ entre les feuillets.`, modele: "montrée telle quelle" },
        sericite: { dit: `Muscovite en paillettes microscopiques, de même structure.`, modele: "montrée telle quelle" },
        glauconite_e: { dit: `Grain vert des sables marins : K⁺ entre les feuillets, octaèdres où le fer ferrique côtoie un peu d'aluminium et de magnésium, et faible part d'aluminium en tétraèdres.`,
          modele: "sites occupés suivant la formule (le modèle publié désigne Al pour les octaèdres, Si pour les tétraèdres)",
          occuper: { octa: { Fe: 0.65, Al: 0.2, Mg: 0.15 }, tetra: { Si: 0.91, Al: 0.09 } } },
        celadonite: { dit: `La charge s'installe dans les octaèdres, riches en fer et en magnésium, les tétraèdres ne contenant presque pas d'aluminium. K⁺ occupe l'espace inter-feuillets.` },
        muscovite_e: { dit: `Des granites aux micaschistes, on rencontre ce mica blanc : entre les feuillets, K⁺ ; dans les octaèdres, aluminium ; dans les tétraèdres, un aluminium pour trois silicium.` },
        paragonite: { dit: `Na⁺ prend place entre les feuillets d'une muscovite à la place de K⁺ ; plus petit, il resserre l'espace à 9,6 Å contre 10,0 Å.` },
        margarite: { dit: `Mica « dur » et cassant, né de Ca²⁺ entre les feuillets et de deux aluminium pour deux silicium dans les tétraèdres : la charge est double.` },
      },
    },
    talc_e: {
      intro: `Pas de charge dans ce feuillet 2:1 trioctaédrique : rien ne sépare les feuillets, qui glissent aisément. Seul le cation des octaèdres diffère d'une espèce à l'autre.`,
      aspects: [A_TOUT, A_OCTA(`Octaèdres en surbrillance, avec du magnésium (orange), du fer (brun) ou du nickel (gris) ; les trois sites restent pleins dans les trois espèces.`)],
      especes: {
        talc_e: { dit: `Du magnésium occupe les trois sites octaédriques.` },
        minnesotaite: { dit: `Le magnésium est ici remplacé par du fer ferreux : c'est le talc des formations de fer rubanées, dont le feuillet tétraédrique s'organise en bandes que le dessin ne montre pas.`,
          modele: SCHEMA, remplacer: { octa: { Mg: "Fe" } } },
        willemseite: { dit: `Nickel en remplacement du magnésium (le nickel y est plus abondant que le magnésium).`,
          modele: SCHEMA, occuper: { octa: { Ni: 0.7, Mg: 0.3 } } },
      },
    },
    stevensite: {
      intro: `Smectites trioctaédriques dont la charge naît dans les octaèdres, mais selon deux mécanismes : un site vide dans la stevensite, du lithium dans l'hectorite. Entre les feuillets, des cations compensent cette charge (l'eau n'est pas dessinée).`,
      aspects: [A_TOUT,
        A_OCTA(`Octaèdres en surbrillance. La stevensite présente quelques sites vides (en jaune), chacun ouvrant deux charges négatives. Dans l'hectorite, le lithium (vert) partage les sites du magnésium, chaque Li⁺ créant une charge.`),
        A_INTER(`Les cations entre les feuillets sont en surbrillance.`)],
      especes: {
        stevensite: { dit: `Ne reste que le magnésium, avec environ un site octaédrique sur vingt libre. Cette smectite caractérise les lacs salés et les milieux très riches en magnésium ; une seule lacune est dessinée.`,
          modele: SCHEMA + " ; lithium retiré, une lacune ajoutée", occuper: { octa: { Mg: 1 } }, remplacer: { inter: { Cs: "Ca" } }, lacune: 1 },
        hectorite: { dit: `Une partie du magnésium cède sa place au lithium (environ un site sur cinq dans l'échantillon affiné). C'est une smectite des argiles à lithium (Hector, Californie).`,
          modele: "Na⁺ à la place du Cs⁺ d'origine, échange réalisé au laboratoire", remplacer: { inter: { Cs: "Na" } } },
      },
    },
    saponite: {
      intro: `Ces smectites trioctaédriques puisent leur charge dans les tétraèdres (Al en lieu et place de Si). Faute de structure affinée, les trois vues sont des modèles de l'atlas fondés sur celle de l'hectorite : elles précisent quels cations occupent quels sites, sans leurs positions exactes.`,
      aspects: [A_TOUT,
        A_TETRA_SUB(`Les tétraèdres où l'aluminium remplace une partie du silicium sont en surbrillance : c'est là que prend naissance la charge.`,
          "Tétraèdres : la charge"),
        A_OCTA(`Les octaèdres sont en surbrillance : magnésium, zinc, ou lithium et aluminium mêlés.`),
        A_INTER(`Les cations entre les feuillets sont en surbrillance (l'eau n'est pas représentée).`)],
      especes: {
        saponite: { dit: `Octaèdres à magnésium, accompagné de peu de fer : smectite des basaltes, des gabbros et des serpentinites altérés.`,
          modele: SCHEMA, occuper: { octa: { Mg: 0.9, Fe: 0.1 }, tetra: { Si: 0.9, Al: 0.1 } }, remplacer: { inter: { Cs: "Ca" } } },
        sauconite: { dit: `Le zinc remplace le magnésium dans cette smectite des zones oxydées des gisements de zinc.`,
          modele: SCHEMA, occuper: { octa: { Zn: 1 }, tetra: { Si: 0.85, Al: 0.15 } }, remplacer: { inter: { Cs: "Na" } } },
        swinefordite: { dit: `Octaèdres mêlant lithium, aluminium et magnésium, dans une position intermédiaire entre dioctaédrique et trioctaédrique : smectite des pegmatites à lithium altérées.`,
          modele: SCHEMA, occuper: { octa: { Li: 0.35, Al: 0.35, Mg: 0.3 }, tetra: { Si: 0.9, Al: 0.1 } }, remplacer: { inter: { Cs: "Ca" } } },
      },
    },
    phlogopite: {
      intro: `Dans ces micas trioctaédriques, les trois sites octaédriques sont pleins et le cation intercalaire est dépourvu d'eau. Ce qui change d'une espèce à l'autre : le cation des octaèdres (magnésium, fer, lithium ou aluminium), et, pour la clintonite, le cation intercalaire.`,
      aspects: [A_TOUT,
        A_OCTA(`Octaèdres en surbrillance : magnésium (orange), fer (brun), lithium (vert), aluminium (bleu pâle). Un site partagé adopte la teinte mélangée des atomes qui l'occupent.`),
        A_INTER(`Cations intercalaires en surbrillance : du potassium (violet) dans toutes les espèces, du calcium (bleu) dans la clintonite.`),
        A_TETRA_SUB(`Surbrillance des tétraèdres qui contiennent de l'aluminium ; la légende précise la proportion par site : de 25 à 30 % pour la phlogopite, la biotite et l'annite (un aluminium pour trois silicium), de 13 à 23 % pour les micas au lithium, et 59 % pour la clintonite.`)],
      especes: {
        phlogopite: { dit: `Mica brun clair des marbres et des péridotites, où le magnésium occupe les octaèdres.` },
        biotite_e: { dit: `Mica noir des granites et des gneiss : fer et magnésium se partagent les octaèdres.` },
        annite: { dit: `Pôle ferreux de la série : le fer ferreux occupe presque seul les octaèdres (81 % des sites de l'échantillon).` },
        lepidolite: { dit: `Mica rose-lilas des pegmatites : lithium et aluminium dans les octaèdres, fluor remplaçant une partie des OH.` },
        zinnwaldite: { dit: `Mica des greisens à étain (Zinnwald, Erzgebirge), avec lithium, fer et aluminium dans les octaèdres.` },
        clintonite: { dit: `Mica « dur » et cassant : Ca²⁺ entre les feuillets, et aluminium très abondant dans les tétraèdres (trois pour un silicium dans la formule idéale, 59 % des sites de l'échantillon affiné).` },
      },
    },
    cookeite: {
      intro: `Dans les chlorites, un feuillet d'hydroxyde comble tout l'espace entre deux T-O-T. Ici le T-O-T est dioctaédrique, et le feuillet d'hydroxyde est plein.`,
      aspects: [A_TOUT,
        A_INTER(`Surbrillance du feuillet d'hydroxyde intercalé entre les T-O-T : lithium et aluminium chez la cookéite, magnésium et aluminium chez la sudoïte.`, "Feuillet d'hydroxyde"),
        A_OCTA(`Les octaèdres du T-O-T sont en surbrillance, surtout avec de l'aluminium.`)],
      especes: {
        cookeite: { dit: `La chlorite des pegmatites à lithium porte lithium et aluminium dans son feuillet d'hydroxyde.` },
        sudoite: { dit: `Chlorite du métamorphisme de très bas degré et des altérations hydrothermales : magnésium et aluminium dans le feuillet d'hydroxyde.` },
      },
    },
    clinochlore: {
      intro: `Chlorites trioctaédriques : le T-O-T et le feuillet d'hydroxyde sont pleins, l'un comme l'autre. Seul le cation dominant des deux feuillets d'octaèdres diffère.`,
      aspects: [A_TOUT,
        { id: "octaTous", nom: "Octaèdres (les deux feuillets)", texte: `Octaèdres surlignés, dans le T-O-T et dans le feuillet d'hydroxyde : magnésium (orange), fer (brun), manganèse (violet), nickel (gris), zinc (gris-vert).` },
        A_INTER(`Seul le feuillet d'hydroxyde est en surbrillance.`, "Feuillet d'hydroxyde")],
      especes: {
        clinochlore: { dit: `Chlorite des schistes verts et des serpentinites, riche en magnésium.` },
        chamosite: { dit: `Chlorite des minerais de fer et des schistes, où fer ferreux et magnésium se partagent à parts égales dans l'échantillon.` },
        pennantite: { dit: `Chlorite des gisements de manganèse, où le manganèse prend la place du magnésium.`,
          modele: SCHEMA, remplacer: { octaTous: { Mg: "Mn", Fe: "Mn" } } },
        nimite: { dit: `Chlorite des gisements de nickel, le nickel remplaçant le magnésium.`,
          modele: SCHEMA, remplacer: { octaTous: { Mg: "Ni", Fe: "Ni" } } },
        baileychlore: { dit: `Chlorite très rare des gisements de zinc, où le zinc se substitue au magnésium.`,
          modele: SCHEMA, remplacer: { octaTous: { Mg: "Zn", Fe: "Zn" } } },
      },
    },
    rectorite: {
      intro: `Un même cristal alterne deux types de feuillets. Faute de structure affinée, chaque vue empile des feuillets empruntés à deux structures publiées (comme dans les pages d'espèces), avec une couche d'eau dans les espaces qui gonflent.`,
      aspects: [A_TOUT,
        A_INTER(`Le contenu situé entre les feuillets est en surbrillance : cations sans eau (mica), feuillet d'hydroxyde (chlorite), cations et eau (smectite, vermiculite), simples liaisons hydrogène (kaolinite). C'est ce contenu qui alterne.`)],
      especes: {
        rectorite: { dit: `Mica sodique et smectite se succédant régulièrement, un feuillet sur un.` },
        corrensite: { dit: `Chlorite et smectite trioctaédrique qui se succèdent régulièrement : on les trouve dans les évaporites et les basaltes altérés.` },
        hydrobiotite: { dit: `Biotite et vermiculite qui se succèdent : c'est une étape de l'altération de la biotite.` },
        aliettite: { dit: `Talc et smectite trioctaédrique se succédant régulièrement.` },
        tosudite: { dit: `Chlorite dioctaédrique et smectite se succédant régulièrement.` },
        kaolinite_smectite: { dit: `Kaolinite et smectite mêlées au hasard : sols où la smectite évolue vers la kaolinite.` },
      },
    },
    sepiolite_e: {
      partage: false,   // palygorskite monoclinique : chaque vue regarde le long de SES canaux (axe c), même échelle
      intro: `Des feuillets 2:1 se découpent en rubans, retournés alternativement, qui laissent entre eux des canaux pleins d'eau (vus ici par le bout, à même échelle). Varient la largeur des rubans, donc celle des canaux, et le cation des octaèdres.`,
      aspects: [A_TOUT,
        A_OCTA(`En surbrillance, les rubans d'octaèdres : trois chaînes de large chez la sépiolite (magnésium), deux chez la palygorskite (magnésium et aluminium).`),
        { id: "tetra", nom: "Tétraèdres", texte: `Les tétraèdres de silicium sont en surbrillance : ils s'inversent d'un ruban à l'autre et bordent les canaux.` }],
      especes: {
        sepiolite_e: { dit: `Trois chaînes par ruban, canaux d'environ 3,7 × 10,6 Å. Ce minéral naît dans les lacs et lagunes riches en magnésium.` },
        palygorskite: { dit: `Deux chaînes par ruban : des canaux plus étroits, d'environ 3,7 × 6,4 Å.` },
      },
      sources: [`Galán E. (1996). « Properties and applications of palygorskite-sepiolite clays ». <i>Clay Minerals</i> 31,
        p. 443–453.`],
    },
    allophane_e: {
      vue: "objet",
      intro: `Aucun empilement de feuillets : un feuillet unique, courbé, refermé en sphère ou roulé en tube. Ce sont des modèles construits par l'atlas, identiques à ceux des pages d'espèces.`,
      aspects: [A_TOUT,
        A_OCTA(`Octaèdres d'aluminium (de fer pour l'hisingérite), en surbrillance, côté extérieur de la courbure.`),
        { id: "tetra", nom: "Tétraèdres", texte: `Tétraèdres de silicium surlignés, du côté intérieur de la sphère et du tube.` }],
      especes: {
        allophane_e: { dit: `Sphère creuse d'environ 3,5 nm, avec de l'aluminium à l'extérieur, du silicium à l'intérieur et une paroi percée : c'est l'argile des andosols.` },
        imogolite: { dit: `Ce feuillet enroulé forme un tube de près de 2 nm de diamètre, ouvert aux deux bouts (vu de côté).`,
          publie: true, rep: [1, 1, 3] },
        hisingerite: { dit: `Courbé en sphères creuses (ici une calotte de deux feuillets), ce feuillet 1:1 de fer ferrique, une kaolinite où Fe³⁺ occupe la place d'Al, présente un sens de courbure encore incertain.` },
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
    if (!P) modele = "Cette espèce ne dispose pas de modèle 3D.";
    else if (P.objet && P.base.source && P.base.source.modele) modele = "Modèle construit par l'atlas.";
    else if (P.objet || EB.INTERSTRAT[eid]) modele = `Modèle construit par l'atlas à partir de la structure ${P.emprunt ? deLa(P.fichier) : "publiée"}, ${reference(P.base)}.`;
    else if (spec.modele === "montrée telle quelle") modele = `Structure ${deLa(P.fichier)}, ${reference(P.base)}, montrée telle quelle.`;
    else if (P.emprunt || spec.modele) modele = `${P.emprunt ? `Modèle de l'atlas : structure ${deLa(P.fichier)}, ${reference(P.base)}` : `Structure : ${reference(P.base)}`}${spec.modele ? ` ; ${spec.modele}` : ""}.`;
    else modele = `Structure affinée : ${reference(P.base)}.`;
    const seq = P && P.seq ? `<p class="cmp-seq">Site de la lacune, feuillet après feuillet : <b>${P.seq.join(" · ")}</b></p>` : "";
    return `<figure class="cmp-carte" data-cmp="${eid}">
      <div class="cmp-tete"><button type="button" class="min-chip" data-espece="${eid}"><b>${e.nom}</b></button></div>
      ${P ? `<canvas class="cmp-vue" role="img" aria-label="Structure de ${e.nom} : faire glisser pour tourner"></canvas>` : `<div class="cmp-vide">${modele}</div>`}
      <figcaption>
        <div class="cmp-legende s3d-legende"></div>
        ${seq}
        <details class="cmp-puce"><summary>${cfg.seul ? "Description" : "Ce qui la distingue"}</summary>
          <p class="cmp-dit">${spec.dit || e.note}</p>
          ${P ? `<p class="cmp-modele">${modele}</p>` : ""}
        </details>
      </figcaption>
    </figure>`;
  }

  // ── page du groupe ────────────────────────────────────────────────────────
  // groupes à une seule espèce (08/10/2026, vue d'ensemble) : une vue seule, sans boutons d'aspect
  const SEULS = { halloysite: { vue: "objet" } };
  function configCle(cle) {
    if (GROUPES[cle]) return GROUPES[cle];
    if (!ESPECES[cle]) return null;
    return Object.assign({ seul: true, intro: "", aspects: [A_TOUT], especes: {}, sources: [] }, SEULS[cle] || {});
  }
  function configDe(g) {
    if (!g || !g.especes || !g.especes.length) return null;
    return g.especes.length === 1 || GROUPES[g.especes[0]] ? configCle(g.especes[0]) : null;
  }
  function html(g) {
    const cfg = configDe(g);
    if (!cfg) return "";
    const n = g.especes.length;
    return `<div class="cmp cmp-n${Math.min(n, 3)}${cfg.seul ? " cmp-seul" : ""}" data-cmp-groupe="${g.especes[0]}">
      <div class="s3d-outils cmp-outils">
        ${cfg.aspects.length > 1 ? `<div class="s3d-seg" data-cmp-aspects>${cfg.aspects.map((x, i) => `<button type="button" data-aspect="${x.id}" aria-pressed="${i === 0}">${x.nom}</button>`).join("")}</div>` : ""}
        <div class="s3d-seg"><button type="button" data-mode="polyedres" aria-pressed="true">Polyèdres</button><button type="button" data-mode="billes" aria-pressed="false">Billes</button></div>
        <div class="s3d-seg"><button type="button" data-zoom="1.2" aria-label="Zoomer">+</button><button type="button" data-zoom="0.83" aria-label="Dézoomer">−</button></div>
        <div class="s3d-seg"><button type="button" data-tourne aria-pressed="true">Rotation</button></div>
      </div>
      <p class="cmp-aspect" aria-live="polite" hidden></p>
      <div class="cmp-grille" style="--cols:${Math.min(n, 3)}">${g.especes.map((eid) => `<figure class="cmp-carte cmp-attente" data-cmp="${eid}" data-espece-bloc="${eid}"><div class="cmp-tete"><b>${ESPECES[eid].nom}</b></div><div class="cmp-vide">Chargement…</div></figure>`).join("")}</div>
    </div>`;
  }
  // texte « ce qui change d'une espèce à l'autre » d'un groupe (repris dans la puce du panneau, argiles-vue.js)
  const introDe = (g) => { const c = configDe(g); return c && c.intro ? c.intro : ""; };
  // toutes les sources des modèles 3D de ces groupes (carte repliée en bas de la vue d'ensemble) : charge les structures
  async function sourcesDe(groupes) {
    const lit = new Set(), refs = new Set();
    for (const g of groupes) {
      const cfg = configDe(g);
      if (!cfg) continue;
      (cfg.sources || []).forEach((x) => lit.add(x));
      for (const eid of g.especes) {
        const ent = S.entree(eid), X = EB.ARGILES3D[eid];
        if (!ent || !X) continue;
        const f = ent.fichier || X[0];
        await Promise.race([charger(f), new Promise((ok) => setTimeout(ok, 4000))]);
        if (S.donnees[f]) refs.add(S.referenceHTML(S.donnees[f]));
      }
    }
    return [...lit, ...refs];
  }

  function monter(racine) {
    if (!racine) return;
    const blocs = [...racine.querySelectorAll("[data-cmp-groupe]")].filter((b) => !b.dataset.monte);
    if (!window.IntersectionObserver) { blocs.forEach(monterBloc); return; }
    const io = new IntersectionObserver((x) => x.forEach((it) => {
      if (it.isIntersecting) { io.unobserve(it.target); monterBloc(it.target); }
    }), { rootMargin: "400px 0px" });
    blocs.forEach((b) => io.observe(b));
  }
  async function monterBloc(bloc) {
    if (!bloc || bloc.dataset.monte) return;
    bloc.dataset.monte = "1";
    const cfg = configCle(bloc.dataset.cmpGroupe);
    const especes = [...bloc.querySelectorAll(".cmp-carte")].map((x) => x.dataset.cmp);
    const partage = cfg.vue !== "objet" && cfg.partage !== false;
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const etat = { aspect: cfg.aspects[0], mode: "polyedres", zoom: 1, tourne: !reduit, R: null };
    const P = await Promise.all(especes.map((eid) => preparer(eid, cfg, cfg.vue).catch(() => null)));
    if (!bloc.isConnected) return;
    // une fiche par espèce
    const grille = bloc.querySelector(".cmp-grille");
    grille.innerHTML = especes.map((eid, i) => carteHTML(eid, P[i], cfg)).join("");
    grille.querySelectorAll(".cmp-carte").forEach((f) => { f.dataset.especeBloc = f.dataset.cmp; });
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
    if (!vues.length) return;
    if (partage) etat.R = vues[0].R0;
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
    const ulSrc = bloc.querySelector(".cmp-sources ul");
    if (ulSrc) ulSrc.innerHTML = (cfg.sources || []).concat(refs).map((s) => `<li>${s}</li>`).join("");

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
        // toutes les vues tournent ensemble : orientation commune (feuillets), ou même rotation appliquée à chacune
        // (objets et fibres, qui gardent chacun leur orientation de départ ; demande du 09/10/2026)
        const Rd = rotation(dy * 0.01, dx * 0.01);
        if (partage) etat.R = mult(Rd, etat.R); else vues.forEach((w) => { w.R = mult(Rd, w.R); });
        dessiner();
      });
      const fin = () => { glisse = null; };
      c.addEventListener("pointerup", fin); c.addEventListener("pointercancel", fin); c.addEventListener("lostpointercapture", fin);
      c.addEventListener("dblclick", () => {
        etat.zoom = 1;
        if (partage) etat.R = vues[0].R0; else vues.forEach((w) => { w.R = w.R0; });
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

  window.ArgilesComparer = { html, monter, introDe, sourcesDe, GROUPES, _preparer: preparer, _lacunes: lacunes };
})();
