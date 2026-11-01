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
    clivage: "imparfait", eclat: "vitreux à adamantin", couleurs: "bleu saphir intense, bleu vif en UV",
    contexte: "Localité unique au monde : le comté de San Benito, en Californie, où elle apparaît dans des schistes bleus à natrolite.",
    devient: "Résiduelle.",
    note: "Ce minéral compte parmi les plus rares. Il se distingue par son bleu saphir profond, une dispersion supérieure à celle du diamant et une fluorescence bleu vif sous ultraviolet. Il présente deux particularités : il est la pierre officielle de l'État de Californie, et il cristallise dans une classe de symétrie qu'aucun autre minéral connu ne partage.",
  },
  wadeite: {
    nom: "Wadéite", formule: "K₂Zr(Si₃O₉)", famille: "Cyclosilicate (anneau à 3)",
    systeme: "hexagonal", durete: 5.5, densite: 3.1, stabilite: 6, swatch: "#d4c8b8",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, rose pâle, gris",
    contexte: "Kimberlites et roches alcalines potassiques (Australie occidentale).",
    devient: "Se transforme en argiles et libère le zirconium, qui reprécipite aussitôt.",
    note: "Anneau de trois tétraèdres, retenu par du potassium et du zirconium. Les lamproïtes d'Australie la renferment, roches qui livrent aussi les diamants roses d'Argyle.",
  },
  catapleiite: {
    nom: "Catapléiite", formule: "Na₂Zr(Si₃O₉)·2H₂O", famille: "Cyclosilicate (anneau à 3)",
    systeme: "monoclinique (pseudo-hexagonal)", durete: 5.5, densite: 2.8, stabilite: 5, swatch: "#c8b89a",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "jaune-brun, incolore, bleuté",
    contexte: "Syénites néphéliniques d'origine alcaline et pegmatites de Norvège et de la presqu'île de Kola.",
    devient: "→ argiles + zircon secondaire.",
    note: "Le nom dérive du grec kata pleion, « en compagnie de », allusion à sa présence presque constante aux côtés de l'eudialyte dans les roches alcalines. Hydratée, elle cristallise en plaquettes hexagonales jaunes et caractérise les magmas pauvres en silice, riches en sodium.",
  },

  // ---------- Anneaux de 4 tétraèdres (Si₄O₁₂) ----------
  joaquinite: {
    nom: "Joaquinite-(Ce)", formule: "Ba₂NaCe₂FeTi₂(Si₄O₁₂)₂O₂(OH)·H₂O", famille: "Cyclosilicate (anneau à 4)",
    systeme: "monoclinique", durete: 5.5, densite: 3.9, stabilite: 5, swatch: "#c8a45a",
    clivage: "imparfait", eclat: "vitreux à résineux", couleurs: "jaune miel, brun-orangé",
    contexte: "Elle accompagne la bénitoïte à San Benito, en Californie.",
    devient: "Elle devient métamicte, sous l'effet de l'accumulation des terres rares, puis s'altère.",
    note: "Cas rare d'anneau à quatre tétraèdres. Elle se rencontre avec la bénitoïte dans le même gisement californien : de petits cristaux jaune miel sont disséminés dans la natrolite blanche, à côté des cristaux bleus.",
  },
  baotite: {
    nom: "Baotite", formule: "Ba₄(Ti,Nb)₈(Si₄O₁₂)O₁₆Cl", famille: "Cyclosilicate (anneau à 4)",
    systeme: "quadratique", durete: 6, densite: 4.2, stabilite: 6, swatch: "#6a5a4a",
    clivage: "net", eclat: "vitreux à submétallique", couleurs: "brun sombre, noir",
    contexte: "Le gisement de Bayan Obo, en Chine, est le plus important au monde pour les terres rares.",
    devient: "Résiduelle.",
    note: "Associé au baryum, au titane et au niobium, cet anneau à quatre tétraèdres se trouve à Bayan Obo, en Mongolie-Intérieure. Ce gisement assure à lui seul une bonne part de la production mondiale de terres rares.",
  },

  // ---------- Anneaux de 6 : groupe du béryl (Si₆O₁₈) ----------
  bazzite: {
    nom: "Bazzite", formule: "Be₃Sc₂(Si₆O₁₈)", famille: "Cyclosilicate (groupe du béryl)",
    systeme: "hexagonal", durete: 6.5, densite: 2.8, stabilite: 7, swatch: "#5a9ab8",
    clivage: "imparfait", eclat: "vitreux", couleurs: "bleu ciel à bleu foncé",
    contexte: "Fentes alpines et pegmatites (Val d'Aoste, Alpes).",
    devient: "Résiduelle.",
    note: "Béryl dans lequel le scandium remplace l'aluminium : il s'agit d'une aigue-marine au scandium. Minuscule et rare, elle compte parmi les minéraux du scandium, métal qui allège les alliages aéronautiques.",
  },

  // ---------- Anneaux de 6 : groupe de la cordiérite ----------
  sekaninaite: {
    nom: "Sékaninaïte", formule: "Fe₂Al₄Si₅O₁₈", famille: "Cyclosilicate (groupe de la cordiérite)",
    systeme: "orthorhombique", durete: 7, densite: 2.77, stabilite: 5, swatch: "#4a4a6a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "bleu-violet sombre, gris-bleu",
    contexte: "Cornéennes et granites contaminés de République tchèque.",
    devient: "→ « pinite » (muscovite fine + chlorite) puis argiles.",
    note: "Terme ferreux de la cordiérite : la structure demeure identique, mais le fer occupe la place du magnésium. Les deux pôles forment une série continue, le fer assombrissant nettement la teinte.",
  },
  indialite: {
    nom: "Indialite", formule: "Mg₂Al₄Si₅O₁₈ (hexagonal)", famille: "Cyclosilicate (groupe de la cordiérite)",
    systeme: "hexagonal", durete: 7, densite: 2.6, stabilite: 5, swatch: "#6a6a8a",
    clivage: "médiocre", eclat: "vitreux", couleurs: "gris-bleu, incolore",
    contexte: "Espèce rare, présente dans les charbons naturellement brûlés (Inde) et dans des roches portées à très haute température.",
    devient: "Il se réordonne en cordiérite lors d'un refroidissement lent.",
    note: "Polymorphe de haute température de la cordiérite : mêmes atomes, mais aluminium et silicium répartis au hasard dans les anneaux au lieu d'être ordonnés. Il se forme lorsqu'un filon de charbon s'enflamme spontanément et cuit la roche encaissante.",
  },

  // ---------- Anneaux de 6 : groupe de la tourmaline (Si₆O₁₈ + BO₃) ----------
  dravite: {
    nom: "Dravite", formule: "NaMg₃Al₆(Si₆O₁₈)(BO₃)₃(OH)₄", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.05, stabilite: 9, swatch: "#7a5a3a",
    clivage: "aucun", eclat: "vitreux", couleurs: "brun, jaune-brun, vert olive",
    contexte: "Il résulte du métamorphisme de sédiments où abondent magnésium et bore.",
    devient: "Résiduelle, quasi inaltérable.",
    note: "Tourmaline magnésienne de couleur brune, le membre le plus courant après le schorl, caractéristique des marbres et des métasédiments. Son nom dérive de la Drave, rivière d'Autriche.",
  },
  elbaite: {
    nom: "Elbaïte", formule: "Na(Li,Al)₃Al₆(Si₆O₁₈)(BO₃)₃(OH)₄", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.05, stabilite: 9, swatch: "#c85a7a",
    clivage: "aucun", eclat: "vitreux", couleurs: "toutes, rose (rubellite), bleu (indigolite), vert (verdélite), bicolore",
    contexte: "Pegmatites granitiques riches en lithium de l'île d'Elbe, du Brésil, de Californie et de Madagascar.",
    devient: "Résiduelle.",
    note: "La tourmaline lithinifère est très recherchée en joaillerie pour la variété de ses teintes. Ses cristaux présentent fréquemment une zonation concentrique, rose au cœur et verte en périphérie : ce sont les « tourmalines pastèque », que l'on débite en tranches pour en révéler le motif. Chaque zone témoigne d'une évolution de la composition du fluide au cours de la croissance.",
  },
  uvite: {
    nom: "Uvite", formule: "CaMg₃(Al₅Mg)(Si₆O₁₈)(BO₃)₃(OH)₄", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.1, stabilite: 9, swatch: "#5a6a3a",
    clivage: "aucun", eclat: "vitreux", couleurs: "brun, vert sombre, noir",
    contexte: "Marbres dolomitiques et skarns du Brésil et du Sri Lanka.",
    devient: "Résiduelle.",
    note: "Tourmaline calcique issue de carbonates métamorphisés, et non de pegmatites. La série compte quatre compositions pour une seule charpente : schorl (Fe), dravite (Mg), elbaïte (Li) et uvite (Ca).",
  },
  liddicoatite: {
    nom: "Liddicoatite", formule: "Ca(Li₂Al)Al₆(Si₆O₁₈)(BO₃)₃(OH)₃F", famille: "Cyclosilicate (groupe de la tourmaline)",
    systeme: "rhomboédrique", durete: 7.25, densite: 3.02, stabilite: 9, swatch: "#b06a8a",
    clivage: "aucun", eclat: "vitreux", couleurs: "rose, vert, brun : zonations concentriques spectaculaires",
    contexte: "Pegmatites de Madagascar, presque exclusivement.",
    devient: "Résiduelle.",
    note: "Tourmaline particulièrement remarquable en coupe : perpendiculairement à l'axe, ses sections montrent des motifs concentriques en étoile à trois branches, qui rappellent des vitraux. Chaque anneau coloré correspond à une strate de croissance : le cristal conserve la trace, couche après couche, de l'évolution chimique de la pegmatite.",
  },

  // ---------- Anneaux de 6 : dioptase ----------
  dioptase: {
    nom: "Dioptase", formule: "Cu₆(Si₆O₁₈)·6H₂O", famille: "Cyclosilicate (anneau à 6)",
    systeme: "rhomboédrique", durete: 5, densite: 3.3, stabilite: 4, swatch: "#0f8a6a",
    clivage: "parfait", eclat: "vitreux", couleurs: "vert émeraude intense",
    contexte: "Zone d'oxydation des gisements de cuivre sous climat aride, où la pluie reste inférieure à 20 % de l'ETP (Namibie, Kazakhstan, Congo).",
    devient: "→ malachite (carbonatation).",
    note: "D'un vert émeraude si pur qu'on l'a longtemps prise pour de l'émeraude, jusqu'à ce qu'un test de dureté la distingue. Son nom vient du grec dia-optazein, « voir à travers », car ses clivages internes se distinguent par transparence. Trop tendre et trop clivable pour être taillée, elle demeure une pièce de collection.",
  },

  // ---------- Anneaux DOUBLES de 6 (Si₁₂O₃₀) ----------
  milarite: {
    nom: "Milarite", formule: "K₂Ca₄Al₂Be₄(Si₁₂O₃₀)₂·H₂O", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 6, densite: 2.5, stabilite: 6, swatch: "#c8d4c0",
    clivage: "imparfait", eclat: "vitreux", couleurs: "incolore, vert pâle, jaune pâle",
    contexte: "Fentes alpines (Val Giuv, Suisse) et pegmatites.",
    devient: "→ argiles.",
    note: "Deux anneaux à six tétraèdres s'associent en un tonneau Si₁₂O₃₀ dont le canal central héberge eau et potassium. Ses prismes hexagonaux vert d'eau intéressent les cristalliers alpins.",
  },
  osumilite: {
    nom: "Osumilite", formule: "(K,Na)(Fe,Mg)₂(Al,Fe)₃(Si,Al)₁₂O₃₀", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 7, densite: 2.64, stabilite: 6, swatch: "#3a4a5a",
    clivage: "aucun", eclat: "vitreux", couleurs: "bleu-noir, gris-bleu",
    contexte: "Elle occupe les cavités des rhyolites et se rencontre dans les granulites de très haute température.",
    devient: "→ argiles.",
    note: "Ce minéral connaît deux milieux très différents : de petits cristaux bleu-noir tapissent les bulles des laves rhyolitiques, et il sert également d'indicateur dans les granulites, roches portées à plus de 900 °C dans la croûte profonde. Sa présence signale alors des conditions extrêmes.",
  },
  sugilite: {
    nom: "Sugilite", formule: "KNa₂(Fe,Mn,Al)₂Li₃(Si₁₂O₃₀)", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 6, densite: 2.75, stabilite: 6, swatch: "#7a3a8a",
    clivage: "imparfait", eclat: "vitreux à cireux", couleurs: "violet intense à magenta",
    contexte: "Gisements de manganèse (mine de Wessels, Afrique du Sud) et syénites (Japon).",
    devient: "→ argiles + oxydes de manganèse.",
    note: "Violet profond, presque irréel, coloré par le manganèse. Découvert au Japon en 1944, il resta une curiosité jusqu'à la découverte, en 1979, de masses gemmes dans les mines de manganèse du Kalahari. Il compte aujourd'hui parmi les gemmes opaques les plus recherchées.",
  },
  roedderite: {
    nom: "Rœddérite", formule: "Na₂Mg₅(Si₁₂O₃₀)", famille: "Cyclosilicate (anneau double)",
    systeme: "hexagonal", durete: 6, densite: 2.63, stabilite: 5, swatch: "#b0b8a8",
    clivage: "aucun", eclat: "vitreux", couleurs: "incolore, jaune pâle",
    contexte: "Il se rencontre presque exclusivement dans les météorites (chondrites à enstatite) et, plus rarement, dans certaines laves.",
    devient: "S'altère en argiles à l'air humide.",
    note: "Ce minéral a été identifié pour la première fois dans une météorite. Ses chondrites à enstatite se sont constituées dans la région la plus chaude et la plus réductrice du disque protosolaire, où l'oxygène manquait au point que le silicium s'alliait au métal.",
  },

  // ---------- Anneaux de 9 tétraèdres (Si₉O₂₇) ----------
  eudialyte: {
    nom: "Eudialyte", formule: "Na₁₅Ca₆(Fe,Mn)₃Zr₃(Si₉O₂₇)₂(Si₃O₉)(OH,Cl)₄", famille: "Cyclosilicate (anneau à 9)",
    systeme: "rhomboédrique", durete: 5.5, densite: 2.9, stabilite: 4, swatch: "#a83a4a",
    clivage: "imparfait", eclat: "vitreux", couleurs: "rouge framboise, rose, brun-rouge",
    contexte: "Syénites néphéliniques d'Ilímaussaq (Groenland), de la presqu'île de Kola et du mont Saint-Hilaire.",
    devient: "Se transforme en argiles et en zircon, et libère les terres rares.",
    note: "Structure hors du commun, mêlant anneaux à neuf tétraèdres et anneaux à trois. Son nom, « facile à dissoudre » en grec, traduit sa solubilité dans l'acide, qui la sépare des zirconosilicates voisins. Les Lapons attribuaient à ses taches rouges le sang de leurs ancêtres. Minerai potentiel de zirconium et de terres rares, elle suscite aujourd'hui l'intérêt.",
  },
});

// ---------- Sous-familles des cyclosilicates (par taille d'anneau) ----------
const CYCLO_SOUS_FAMILLES = [
  {
    nom: "Anneaux de 3 tétraèdres",
    formule: "[Si₃O₉]⁶⁻",
    note: "L'anneau le plus simple possible, formé d'un triangle de tétraèdres. Rare, il n'est réservé qu'à des chimies exotiques : baryum et titane (bénitoïte), zirconium et sodium (catapléiite). Ce sont des minéraux de roches alcalines, issues de magmas pauvres en silice et riches en sodium.",
    mineraux: ["benitoite", "wadeite", "catapleiite"],
  },
  {
    nom: "Anneaux de 4 tétraèdres",
    formule: "[Si₄O₁₂]⁸⁻",
    note: "Anneau formé d'un carré de tétraèdres, très rare. L'axinite, longtemps classée ici, a été reversée parmi les sorosilicates par Strunz. Il ne subsiste que quelques espèces, issues de gisements exceptionnels.",
    mineraux: ["joaquinite", "baotite"],
  },
  {
    nom: "Groupe du béryl",
    formule: "Be₃Al₂(Si₆O₁₈) : anneau à 6",
    note: "Six tétraèdres disposés en hexagone et empilés en colonnes, ce qui crée des canaux verticaux traversant tout le cristal. Ces canaux peuvent retenir de l'eau, du césium ou du gaz. Ce sont les traces de chrome ou de vanadium dans la charpente qui donnent l'émeraude, celles de fer l'aigue-marine et celles de manganèse la morganite.",
    mineraux: ["beryl", "bazzite"],
  },
  {
    nom: "Groupe de la cordiérite",
    formule: "(Mg,Fe)₂Al₄Si₅O₁₈ : anneau à 6",
    note: "Elle présente la même architecture d'anneaux et de canaux que le béryl, avec du magnésium et de l'aluminium. Minéral indicateur des roches alumineuses cuites à basse pression, elle possède un fort pléochroïsme : sa couleur varie selon l'angle d'observation, ce qui en fait un objet d'étude ancien.",
    mineraux: ["cordierite", "sekaninaite", "indialite"],
  },
  {
    nom: "Groupe de la tourmaline",
    formule: "XY₃Z₆(Si₆O₁₈)(BO₃)₃(OH)₄ : anneau à 6 + borates",
    note: "Famille la plus souple du point de vue chimique : sa formule accepte presque tous les éléments. Sa palette s'en déduit, du noir (schorl, Fe) au brun (dravite, Mg) jusqu'à toutes les couleurs (elbaïte, Li). Dépourvue de centre de symétrie, elle est piézoélectrique et pyroélectrique, et quasiment inaltérable.",
    mineraux: ["tourmaline", "dravite", "elbaite", "uvite", "liddicoatite"],
  },
  {
    nom: "Dioptase",
    formule: "Cu₆(Si₆O₁₈)·6H₂O : anneau à 6",
    note: "Anneau à six tétraèdres lié par du cuivre, dont la structure contient de l'eau. C'est le vert le plus intense du règne minéral ; il se forme dans les chapeaux d'oxydation des gisements de cuivre situés en zone désertique.",
    mineraux: ["dioptase"],
  },
  {
    nom: "Anneaux doubles de 6",
    formule: "[Si₁₂O₃₀]¹²⁻",
    note: "Deux anneaux hexagonaux se superposent et se soudent en un « tonneau » percé d'un canal central qui accueille l'eau et les gros cations. Cette architecture préfigure celle des zéolites. La rœddérite, quant à elle, provient directement des météorites.",
    mineraux: ["milarite", "osumilite", "sugilite", "roedderite"],
  },
  {
    nom: "Anneaux de 9 tétraèdres",
    formule: "[Si₉O₂₇]¹⁸⁻",
    note: "Le plus grand anneau connu. Une seule espèce importante le présente, l'eudialyte, qui associe même dans sa structure des anneaux à neuf et à trois tétraèdres. Minéral emblématique des massifs alcalins.",
    mineraux: ["eudialyte"],
  },
];

// On accroche les sous-familles au groupe « Cyclosilicates » de la classe IX
(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const cyclo = silicates.groupes.find((g) => g.nom.startsWith("Cyclosilicates"));
  cyclo.sousGroupes = CYCLO_SOUS_FAMILLES;
  cyclo.mineraux = CYCLO_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
  cyclo.motif = "anneaux fermés, Si:O = 1:3";
  cyclo.note = "Chaque tétraèdre partage deux sommets avec ses voisins, si bien que l'anneau se referme sur 3, 4, 6 ou 9 unités. Superposés, ces anneaux dessinent des canaux verticaux traversant le cristal, où s'installent eau, gaz et gros cations. Durs et souvent gemmes, les cyclosilicates résistent fortement à l'altération.";
})();
