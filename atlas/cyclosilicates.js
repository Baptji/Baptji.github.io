// ============================================================
// CYCLOSILICATES (Strunz 9.C) — anneaux de tétraèdres
// Les tétraèdres se referment en boucle, chacun partageant DEUX
// sommets avec ses voisins : rapport Si:O = 1:3.
// On les classe par TAILLE D'ANNEAU :
//   3 tétraèdres  → Si₃O₉    (bénitoïte)
//   4 tétraèdres  → Si₄O₁₂   (joaquinite)
//   6 tétraèdres  → Si₆O₁₈   (béryl, cordiérite, tourmaline, dioptase)
//   6 doubles     → Si₁₂O₃₀  (milarite, osumilite, sugilite)
//   9 tétraèdres  → Si₉O₂₇   (eudialyte)
// Les anneaux empilés ménagent des CANAUX : c'est ce qui donne
// à cette classe ses propriétés les plus étonnantes.
// Chargé après sorosilicates.js, avant app.js.
// ============================================================

Object.assign(MINERAUX, {
  // ---------- Anneaux de 3 tétraèdres (Si₃O₉) ----------
  benitoite: {
    nom: "Bénitoïte", formule: "BaTi(Si₃O₉)", famille: "Cyclosilicate (anneau à 3)",
    systeme: "hexagonal (classe unique au monde)", durete: 6.5, densite: 3.65, stabilite: 8, swatch: "#2f5aa8",
    clivage: "imparfait", eclat: "vitreux à adamantin", couleurs: "bleu saphir intense — bleu vif en UV",
    contexte: "Une seule localité au monde : San Benito County, Californie (schistes bleus à natrolite).",
    devient: "Résiduelle.",
    note: "L'un des minéraux les plus rares et les plus spectaculaires : un bleu saphir profond, une dispersion supérieure à celle du diamant, et une fluorescence bleu électrique sous UV. Elle a deux titres de gloire : c'est la pierre officielle de l'État de Californie, et surtout elle cristallise dans une classe de symétrie qu'aucun autre minéral connu ne possède.",
  },
  wadeite: {
    nom: "Wadéite", formule: "K₂Zr(Si₃O₉)", famille: "Cyclosilicate (anneau à 3)",
    systeme: "hexagonal", durete: 5.5, densite: 3.1, stabilite: 6, swatch: "#d4c8b8",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, rose pâle, gris",
    contexte: "Kimberlites et roches alcalines potassiques (Australie occidentale).",
    devient: "→ argiles ; libère le zirconium (qui reprécipite aussitôt).",
    note: "Un anneau à trois tétraèdres verrouillé par du potassium et du zirconium. On la trouve dans les lamproïtes d'Australie — les mêmes roches qui livrent les diamants roses d'Argyle.",
  },
  catapleiite: {
    nom: "Catapléiite", formule: "Na₂Zr(Si₃O₉)·2H₂O", famille: "Cyclosilicate (anneau à 3)",
    systeme: "monoclinique (pseudo-hexagonal)", durete: 5.5, densite: 2.8, stabilite: 5, swatch: "#c8b89a",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "jaune-brun, incolore, bleuté",
    contexte: "Syénites néphéliniques et pegmatites alcalines (Norvège, presqu'île de Kola).",
    devient: "→ argiles + zircon secondaire.",
    note: "Son nom vient du grec kata pleion, « en compagnie de » : elle accompagne presque toujours l'eudialyte dans les roches alcalines. Des plaquettes hexagonales jaunes, hydratées — un zirconosilicate d'un monde géologique très particulier, celui des magmas pauvres en silice et riches en sodium.",
  },

  // ---------- Anneaux de 4 tétraèdres (Si₄O₁₂) ----------
  joaquinite: {
    nom: "Joaquinite-(Ce)", formule: "Ba₂NaCe₂FeTi₂(Si₄O₁₂)₂O₂(OH)·H₂O", famille: "Cyclosilicate (anneau à 4)",
    systeme: "monoclinique", durete: 5.5, densite: 3.9, stabilite: 5, swatch: "#c8a45a",
    clivage: "imparfait", eclat: "vitreux à résineux", couleurs: "jaune miel, brun-orangé",
    contexte: "Compagne de la bénitoïte à San Benito (Californie).",
    devient: "Se métamictise (terres rares) puis s'altère.",
    note: "Le rare cas d'anneau à quatre tétraèdres. On la trouve associée à la bénitoïte, dans le même gisement californien — de petits cristaux jaune miel semés dans la natrolite blanche, aux côtés des cristaux bleus.",
  },
  baotite: {
    nom: "Baotite", formule: "Ba₄(Ti,Nb)₈(Si₄O₁₂)O₁₆Cl", famille: "Cyclosilicate (anneau à 4)",
    systeme: "quadratique", durete: 6, densite: 4.2, stabilite: 6, swatch: "#6a5a4a",
    clivage: "net", eclat: "vitreux à submétallique", couleurs: "brun sombre, noir",
    contexte: "Bayan Obo (Chine) — le plus grand gisement de terres rares du monde.",
    devient: "Résiduelle.",
    note: "Un anneau à quatre tétraèdres associé au baryum, au titane et au niobium. Elle vient de Bayan Obo, en Mongolie-Intérieure : ce gisement fournit à lui seul une grande part des terres rares de la planète.",
  },

  // ---------- Anneaux de 6 : groupe du béryl (Si₆O₁₈) ----------
  bazzite: {
    nom: "Bazzite", formule: "Be₃Sc₂(Si₆O₁₈)", famille: "Cyclosilicate (groupe du béryl)",
    systeme: "hexagonal", durete: 6.5, densite: 2.8, stabilite: 7, swatch: "#5a9ab8",
    clivage: "imparfait", eclat: "vitreux", couleurs: "bleu ciel à bleu foncé",
    contexte: "Fentes alpines et pegmatites (Val d'Aoste, Alpes).",
    devient: "Résiduelle.",
    note: "Le béryl où le scandium remplace l'aluminium — une aigue-marine au scandium, en somme. Minuscule et rare, elle est un des rares minéraux de scandium, ce métal qui allège les alliages d'aviation.",
  },

  // ---------- Anneaux de 6 : groupe de la cordiérite ----------
  sekaninaite: {
    nom: "Sékaninaïte", formule: "Fe₂Al₄Si₅O₁₈", famille: "Cyclosilicate (groupe de la cordiérite)",
    systeme: "orthorhombique", durete: 7, densite: 2.77, stabilite: 5, swatch: "#4a4a6a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "bleu-violet sombre, gris-bleu",
    contexte: "Cornéennes et granites contaminés (République tchèque).",
    devient: "→ « pinite » (muscovite fine + chlorite) puis argiles.",
    note: "Le pôle ferreux de la cordiérite : mêmes anneaux, mais du fer à la place du magnésium. Les deux forment une série continue, et le fer l'assombrit fortement.",
  },
  indialite: {
    nom: "Indialite", formule: "Mg₂Al₄Si₅O₁₈ (hexagonal)", famille: "Cyclosilicate (groupe de la cordiérite)",
    systeme: "hexagonal", durete: 7, densite: 2.6, stabilite: 5, swatch: "#6a6a8a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "gris-bleu, incolore",
    contexte: "Rare : charbons naturellement brûlés (Inde), roches de très haute température.",
    devient: "Se réordonne en cordiérite en refroidissant lentement.",
    note: "Le polymorphe de haute température de la cordiérite : mêmes atomes, mais l'aluminium et le silicium sont distribués au hasard dans les anneaux au lieu d'être rangés. Elle se forme quand un filon de charbon prend feu spontanément et cuit la roche encaissante.",
  },

  // ---------- Anneaux de 6 : groupe de la tourmaline (Si₆O₁₈ + BO₃) ----------
  dravite: {
    nom: "Dravite", formule: "NaMg₃Al₆(Si₆O₁₈)(BO₃)₃(OH)₄", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.05, stabilite: 9, swatch: "#7a5a3a",
    clivage: "aucun", eclat: "vitreux", couleurs: "brun, jaune-brun, vert olive",
    contexte: "Métamorphisme de roches sédimentaires riches en magnésium et en bore.",
    devient: "Résiduelle — quasi inaltérable.",
    note: "La tourmaline magnésienne, brune. C'est le membre le plus courant après le schorl, typique des marbres et des métasédiments. Nommée d'après la Drave, rivière d'Autriche.",
  },
  elbaite: {
    nom: "Elbaïte", formule: "Na(Li,Al)₃Al₆(Si₆O₁₈)(BO₃)₃(OH)₄", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.05, stabilite: 9, swatch: "#c85a7a",
    clivage: "aucun", eclat: "vitreux", couleurs: "toutes — rose (rubellite), bleu (indigolite), vert (verdélite), bicolore",
    contexte: "Pegmatites granitiques à lithium (île d'Elbe, Brésil, Californie, Madagascar).",
    devient: "Résiduelle.",
    note: "La tourmaline au lithium, très recherchée en joaillerie pour la diversité de ses couleurs. Ses cristaux sont souvent zonés : rose au cœur, vert en périphérie, ce sont les fameuses « tourmalines pastèque », qu'on tranche pour révéler le dessin. Chaque zone enregistre un changement de composition du fluide pendant la croissance.",
  },
  uvite: {
    nom: "Uvite", formule: "CaMg₃(Al₅Mg)(Si₆O₁₈)(BO₃)₃(OH)₄", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.1, stabilite: 9, swatch: "#5a6a3a",
    clivage: "aucun", eclat: "vitreux", couleurs: "brun, vert sombre, noir",
    contexte: "Marbres dolomitiques et skarns (Brésil, Sri Lanka).",
    devient: "Résiduelle.",
    note: "La tourmaline calcique, qui se forme dans les carbonates métamorphisés plutôt que dans les pegmatites. Elle complète le tableau : schorl (Fe), dravite (Mg), elbaïte (Li), uvite (Ca) — quatre chimies pour une même charpente.",
  },
  liddicoatite: {
    nom: "Liddicoatite", formule: "Ca(Li₂Al)Al₆(Si₆O₁₈)(BO₃)₃(OH)₃F", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.02, stabilite: 9, swatch: "#b06a8a",
    clivage: "aucun", eclat: "vitreux", couleurs: "rose, vert, brun — zonations concentriques spectaculaires",
    contexte: "Pegmatites de Madagascar, presque exclusivement.",
    devient: "Résiduelle.",
    note: "La tourmaline la plus spectaculaire à trancher : ses sections perpendiculaires révèlent des motifs concentriques en étoile à trois branches, comme des vitraux. Chaque anneau coloré est une strate de croissance — le cristal a enregistré, couche après couche, l'évolution chimique de la pegmatite.",
  },

  // ---------- Anneaux de 6 : dioptase ----------
  dioptase: {
    nom: "Dioptase", formule: "Cu₆(Si₆O₁₈)·6H₂O", famille: "Cyclosilicate (anneau à 6)",
    systeme: "rhomboédrique", durete: 5, densite: 3.3, stabilite: 4, swatch: "#0f8a6a",
    clivage: "parfait", eclat: "vitreux", couleurs: "vert émeraude intense",
    contexte: "Zone d'oxydation des gisements de cuivre en climat aride, pluie < 20 % de l'ETP (Namibie, Kazakhstan, Congo).",
    devient: "→ malachite (carbonatation).",
    note: "D'un vert émeraude si pur qu'elle a longtemps été prise pour de l'émeraude — jusqu'à ce qu'on la raye. Son nom vient du grec dia-optazein, « voir à travers » : on distingue ses clivages internes par transparence. Trop tendre et trop clivable pour être taillée, elle reste un joyau de collection.",
  },

  // ---------- Anneaux DOUBLES de 6 (Si₁₂O₃₀) ----------
  milarite: {
    nom: "Milarite", formule: "K₂Ca₄Al₂Be₄(Si₁₂O₃₀)₂·H₂O", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 6, densite: 2.5, stabilite: 6, swatch: "#c8d4c0",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, vert pâle, jaune pâle",
    contexte: "Fentes alpines (Val Giuv, Suisse) et pegmatites.",
    devient: "→ argiles.",
    note: "Deux anneaux à six tétraèdres se superposent et se soudent : il naît un « tonneau » Si₁₂O₃₀, percé d'un canal où logent l'eau et le potassium. Prismes hexagonaux vert d'eau des cristalliers alpins.",
  },
  osumilite: {
    nom: "Osumilite", formule: "(K,Na)(Fe,Mg)₂(Al,Fe)₃(Si,Al)₁₂O₃₀", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 7, densite: 2.64, stabilite: 6, swatch: "#3a4a5a",
    clivage: "aucun", eclat: "vitreux", couleurs: "bleu-noir, gris-bleu",
    contexte: "Cavités des rhyolites ; granulites de très haute température.",
    devient: "→ argiles.",
    note: "Deux vies très différentes : de petits cristaux bleu-noir dans les bulles des laves rhyolitiques — mais aussi un minéral-index des granulites, ces roches cuites à plus de 900 °C dans la croûte profonde. Sa présence y signale des conditions extrêmes.",
  },
  sugilite: {
    nom: "Sugilite", formule: "KNa₂(Fe,Mn,Al)₂Li₃(Si₁₂O₃₀)", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 6, densite: 2.75, stabilite: 6, swatch: "#7a3a8a",
    clivage: "imparfait", eclat: "vitreux à cireux", couleurs: "violet intense à magenta",
    contexte: "Gisements de manganèse (mine de Wessels, Afrique du Sud) ; syénites (Japon).",
    devient: "→ argiles + oxydes de manganèse.",
    note: "Un violet profond, presque irréel, dû au manganèse. Découverte au Japon en 1944 mais restée une curiosité jusqu'à ce qu'on en trouve, en 1979, des masses gemmes dans les mines de manganèse du Kalahari. C'est aujourd'hui l'une des gemmes opaques les plus recherchées.",
  },
  roedderite: {
    nom: "Rœddérite", formule: "Na₂Mg₅(Si₁₂O₃₀)", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 6, densite: 2.63, stabilite: 5, swatch: "#b0b8a8",
    clivage: "aucun", eclat: "vitreux", couleurs: "incolore, jaune pâle",
    contexte: "Presque uniquement dans les MÉTÉORITES (chondrites à enstatite) ; rares laves.",
    devient: "S'altère en argiles à l'air humide.",
    note: "Un minéral d'abord découvert dans une météorite. Les chondrites à enstatite, où on la trouve, se sont formées dans la zone la plus chaude et la plus réduite du disque protosolaire — un environnement si pauvre en oxygène que même le silicium s'y allie au métal.",
  },

  // ---------- Anneaux de 9 tétraèdres (Si₉O₂₇) ----------
  eudialyte: {
    nom: "Eudialyte", formule: "Na₁₅Ca₆(Fe,Mn)₃Zr₃(Si₉O₂₇)₂(Si₃O₉)(OH,Cl)₄", famille: "Cyclosilicate (anneau à 9)",
    systeme: "rhomboédrique", durete: 5.5, densite: 2.9, stabilite: 4, swatch: "#a83a4a",
    clivage: "imparfait", eclat: "vitreux", couleurs: "rouge framboise, rose, brun-rouge",
    contexte: "Syénites néphéliniques (Ilímaussaq au Groenland, presqu'île de Kola, Mont-Saint-Hilaire).",
    devient: "→ argiles + zircon ; libère les terres rares.",
    note: "Sa structure combine des anneaux à NEUF tétraèdres et des anneaux à trois — une architecture d'une complexité rare. Son nom vient du grec « facile à dissoudre » : elle fond dans l'acide, ce qui la distingue des zirconosilicates voisins. Les Lapons voyaient dans ses taches rouges le sang de leurs ancêtres. C'est aujourd'hui un minerai potentiel de zirconium et de terres rares.",
  },
});

// ---------- Sous-familles des cyclosilicates (par taille d'anneau) ----------
const CYCLO_SOUS_FAMILLES = [
  {
    nom: "Anneaux de 3 tétraèdres",
    formule: "[Si₃O₉]⁶⁻",
    note: "Le plus petit anneau possible — un triangle de tétraèdres. Rare, et réservé à des chimies exotiques : baryum-titane (bénitoïte), zirconium-sodium (catapléiite). Ce sont des minéraux de roches alcalines, ces magmas pauvres en silice et gorgés de sodium.",
    mineraux: ["benitoite", "wadeite", "catapleiite"],
  },
  {
    nom: "Anneaux de 4 tétraèdres",
    formule: "[Si₄O₁₂]⁸⁻",
    note: "Un carré de tétraèdres, très rare. L'axinite, longtemps rangée ici, a été reclassée en sorosilicate par Strunz. Restent quelques espèces de gisements exceptionnels.",
    mineraux: ["joaquinite", "baotite"],
  },
  {
    nom: "Groupe du béryl",
    formule: "Be₃Al₂(Si₆O₁₈) — anneau à 6",
    note: "Six tétraèdres en hexagone, empilés en colonnes : il en résulte des CANAUX verticaux qui traversent tout le cristal. Ces canaux peuvent piéger de l'eau, du césium, du gaz — et ce sont les traces de chrome ou de vanadium dans la charpente qui font l'émeraude, le fer l'aigue-marine, le manganèse la morganite.",
    mineraux: ["beryl", "bazzite"],
  },
  {
    nom: "Groupe de la cordiérite",
    formule: "(Mg,Fe)₂Al₄Si₅O₁₈ — anneau à 6",
    note: "Même architecture en anneaux et canaux que le béryl, mais avec du magnésium et de l'aluminium. Minéral-index des roches alumineuses cuites à basse pression. Son fort pléochroïsme — elle change de couleur selon l'angle — en fait un objet historique.",
    mineraux: ["cordierite", "sekaninaite", "indialite"],
  },
  {
    nom: "Groupe de la tourmaline",
    formule: "XY₃Z₆(Si₆O₁₈)(BO₃)₃(OH)₄ — anneau à 6 + borates",
    note: "La famille la plus chimiquement souple du règne minéral : sa formule accueille presque tous les éléments. D'où sa palette — noir (schorl, Fe), brun (dravite, Mg), toutes les couleurs (elbaïte, Li). Structure sans centre de symétrie : elle est piézoélectrique et pyroélectrique, et quasi inaltérable.",
    mineraux: ["tourmaline", "dravite", "elbaite", "uvite", "liddicoatite"],
  },
  {
    nom: "Dioptase",
    formule: "Cu₆(Si₆O₁₈)·6H₂O — anneau à 6",
    note: "Un anneau à six tétraèdres lié par du cuivre, avec de l'eau dans la structure. Le vert le plus intense du règne minéral, né dans les chapeaux d'oxydation des gisements de cuivre des déserts.",
    mineraux: ["dioptase"],
  },
  {
    nom: "Anneaux doubles de 6",
    formule: "[Si₁₂O₃₀]¹²⁻",
    note: "Deux anneaux hexagonaux se superposent et se soudent en un « tonneau » percé d'un canal central, où logent l'eau et les gros cations. Des architectures de zéolite avant l'heure — et la rœddérite, elle, vient tout droit des météorites.",
    mineraux: ["milarite", "osumilite", "sugilite", "roedderite"],
  },
  {
    nom: "Anneaux de 9 tétraèdres",
    formule: "[Si₉O₂₇]¹⁸⁻",
    note: "Le plus grand anneau connu. Une seule espèce importante le porte, l'eudialyte — et elle combine même des anneaux à neuf ET à trois dans la même structure. Minéral emblématique des massifs alcalins.",
    mineraux: ["eudialyte"],
  },
];

// On accroche les sous-familles au groupe « Cyclosilicates » de la classe IX
(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const cyclo = silicates.groupes.find((g) => g.nom.startsWith("Cyclosilicates"));
  cyclo.sousGroupes = CYCLO_SOUS_FAMILLES;
  cyclo.mineraux = CYCLO_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
  cyclo.motif = "anneaux fermés — Si:O = 1:3";
  cyclo.note = "Les tétraèdres se referment en boucle : chacun partage deux sommets avec ses voisins, et l'anneau se boucle sur lui-même (3, 4, 6 ou 9 tétraèdres). Empilés les uns sur les autres, ces anneaux ménagent des CANAUX verticaux qui traversent tout le cristal — et c'est là que se joue l'essentiel : ils piègent de l'eau, des gaz, de gros cations. Les cyclosilicates sont durs, souvent gemmes, et très résistants à l'altération.";
})();
