// ============================================================
// SOROSILICATES (Strunz 9.B) — tétraèdres jumelés Si₂O₇
// Deux tétraèdres SiO₄ partagent UN sommet (un oxygène commun) :
// il naît le radical [Si₂O₇]⁶⁻, en forme de nœud papillon.
//
// Deux grandes catégories :
//   • sorosilicates PURS : uniquement des groupements Si₂O₇
//   • sorosilicates MIXTES : Si₂O₇ ET SiO₄ isolés dans la même
//     structure — c'est le cas du grand groupe de l'épidote,
//     de loin le plus important de la classe.
// Chargé après nesosilicates.js, avant app.js.
// ============================================================

Object.assign(MINERAUX, {
  // ================= SOROSILICATES MIXTES (SiO₄ + Si₂O₇) =================

  // ---------- Groupe de l'épidote ----------
  clinozoisite: {
    nom: "Clinozoïsite", formule: "Ca₂Al₃(SiO₄)(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'épidote)",
    systeme: "monoclinique", durete: 6.5, densite: 3.3, stabilite: 6, swatch: "#b8c4a8",
    clivage: "parfait", eclat: "vitreux", couleurs: "gris-vert pâle, incolore, jaunâtre",
    contexte: "Schistes verts, marbres, fentes alpines : partout où apparaît l'épidote, mais en l'absence de fer.",
    devient: "→ argiles + calcite ; libère du calcium.",
    note: "Pôle dépourvu de fer de l'épidote : la clinozoïsite, privée de fer ferrique, reste pâle là où l'épidote affiche un vert pistache. Une série continue relie les deux termes, et la teinte s'intensifie avec la teneur en fer.",
  },
  zoisite: {
    nom: "Zoïsite", formule: "Ca₂Al₃(SiO₄)(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'épidote)",
    systeme: "orthorhombique", durete: 6.5, densite: 3.3, stabilite: 6, swatch: "#8fa0c4",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "gris, vert, bleu violacé (tanzanite), rose (thulite)",
    contexte: "Roches métamorphiques calciques, éclogites, gneiss.",
    devient: "→ argiles + calcite.",
    note: "Polymorphe de la clinozoïsite, de même formule mais à empilement orthorhombique. C'est sa variété bleu violet, la tanzanite, qui a été découverte en 1967 au pied du Kilimandjaro, sur une bande de quelques kilomètres carrés seulement. Chauffée, elle passe du brun terne au bleu profond. La variété rose au manganèse porte le nom de thulite.",
  },
  piemontite: {
    nom: "Piémontite", formule: "Ca₂(Mn³⁺,Al,Fe³⁺)₃(SiO₄)(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'épidote)",
    systeme: "monoclinique", durete: 6.5, densite: 3.5, stabilite: 6, swatch: "#a04a5c",
    clivage: "parfait", eclat: "vitreux", couleurs: "rouge-violet à rouge sombre : très pléochroïque",
    contexte: "Schistes manganésifères soumis au métamorphisme, quartzites roses (Piémont, Italie).",
    devient: "→ oxydes de manganèse + argiles.",
    note: "Teinte rouge violet vif pour l'épidote riche en manganèse. Ce minéral donne aux quartzites et aux schistes du Piémont italien leur reflet rosé, d'où son nom. Au microscope, son pléochroïsme est si intense qu'elle passe du jaune au rouge sang selon l'orientation.",
  },
  allanite: {
    nom: "Allanite (orthite)", formule: "(Ca,Ce,La,Y)₂(Al,Fe)₃(SiO₄)(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'épidote)",
    systeme: "monoclinique", durete: 6, densite: 3.9, stabilite: 5, swatch: "#3a3028",
    clivage: "imparfait", eclat: "submétallique à poisseux", couleurs: "brun-noir, noir",
    contexte: "Minéral accessoire des granites, des pegmatites et des gneiss.",
    devient: "Elle se métamictise sous l'effet de la radioactivité, puis s'altère en argiles et libère des terres rares.",
    note: "Épidote des terres rares, où du cérium, du lanthane ou de l'yttrium remplacent le calcium, souvent accompagnés de thorium radioactif. Ce dernier détruit peu à peu le réseau de l'intérieur : les vieux cristaux deviennent « métamictes », amorphes et vitreux. Autour d'eux, les micas voisins portent souvent un halo sombre, marque de la radioactivité.",
  },

  // ---------- Groupe de la vésuvianite ----------
  vesuvianite: {
    nom: "Vésuvianite (idocrase)", formule: "Ca₁₀(Mg,Fe)₂Al₄(SiO₄)₅(Si₂O₇)₂(OH)₄", famille: "Sorosilicate (groupe de la vésuvianite)",
    systeme: "quadratique", durete: 6.5, densite: 3.4, stabilite: 6, swatch: "#6a8a4a",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "vert olive, brun, jaune, bleu (cyprine)",
    contexte: "Elle a été découverte sur le Vésuve ; elle se développe dans les skarns, au contact entre un magma et un calcaire.",
    devient: "Elle donne des argiles et de la calcite, et libère du calcium et du magnésium.",
    note: "Son autre nom, idocrase, vient du grec « forme mêlée » : ses cristaux semblent emprunter leurs faces à d'autres minéraux. Ce minéral hybride associe tétraèdres isolés (SiO₄) et paires (Si₂O₇) au sein d'un seul cristal ; ses prismes verts et trapus caractérisent les skarns.",
  },

  // ---------- Groupe de la pumpellyite ----------
  pumpellyite: {
    nom: "Pumpellyite", formule: "Ca₂MgAl₂(SiO₄)(Si₂O₇)(OH)₂·H₂O", famille: "Sorosilicate (groupe de la pumpellyite)",
    systeme: "monoclinique", durete: 5.5, densite: 3.2, stabilite: 4, swatch: "#4a7a6a",
    clivage: "bon", eclat: "vitreux", couleurs: "vert bleuté, vert olive",
    contexte: "Dans les basaltes et les gabbros au métamorphisme très faible, ainsi que dans les amygdales des laves.",
    devient: "→ chlorite puis argiles.",
    note: "Le faciès « préhnite-pumpellyite », qui occupe l'intervalle entre la diagenèse et les schistes verts, se signale par ce minéral repère d'un métamorphisme presque imperceptible. Une pumpellyite présente dans un basalte signifie que celui-ci n'a pas été enfoui au-delà de 5 à 10 km.",
  },

  // ================= SOROSILICATES PURS (Si₂O₇ seuls) =================

  // ---------- Groupe de la lawsonite ----------
  lawsonite: {
    nom: "Lawsonite", formule: "CaAl₂(Si₂O₇)(OH)₂·H₂O", famille: "Sorosilicate (groupe de la lawsonite)",
    systeme: "orthorhombique", durete: 8, densite: 3.1, stabilite: 5, swatch: "#a8c4d4",
    clivage: "parfait", eclat: "vitreux", couleurs: "incolore, bleu pâle, gris",
    contexte: "Dans les zones de subduction, on le trouve dans les schistes bleus, où la pression est élevée et la température basse.",
    devient: "En remontant, elle se déshydrate et donne de la zoïsite et des argiles.",
    note: "Marqueur des zones de subduction, la lawsonite n'apparaît que sous très haute pression et basse température, conditions propres à une plaque océanique qui plonge. Une roche qui la contient (île de Groix, Nouvelle-Calédonie) a donc été enfouie entre 30 et 70 km avant de remonter. Transportant de l'eau en profondeur, elle nourrit le volcanisme d'arc.",
  },

  // ---------- Groupe de la mélilite ----------
  akermanite: {
    nom: "Åkermanite", formule: "Ca₂MgSi₂O₇", famille: "Sorosilicate (groupe de la mélilite)",
    systeme: "quadratique", durete: 5.5, densite: 2.94, stabilite: 3, swatch: "#c8c8b8",
    clivage: "net", eclat: "vitreux à résineux", couleurs: "incolore, gris, jaune-brun",
    contexte: "On la trouve dans les marbres de contact, les laves alcalines, les laitiers métallurgiques et les météorites.",
    devient: "→ argiles + calcite (s'altère assez vite).",
    note: "Pôle magnésien de la mélilite, dont l'intérêt dépasse la Terre. Elle compose l'essentiel des « CAI », inclusions blanches des météorites carbonées, qui comptent parmi les plus anciens solides du Système solaire (4,567 milliards d'années). Elles se sont condensées avant même la formation des planètes.",
  },
  gehlenite: {
    nom: "Gehlénite", formule: "Ca₂Al(AlSi)O₇", famille: "Sorosilicate (groupe de la mélilite)",
    systeme: "quadratique", durete: 5.5, densite: 3.04, stabilite: 3, swatch: "#b8bca0",
    clivage: "net", eclat: "vitreux à résineux", couleurs: "gris-vert, jaune, brun",
    contexte: "Présente dans les skarns et les marbres de contact portés à haute température, ainsi que dans le clinker de ciment.",
    devient: "→ argiles + calcite.",
    note: "Pôle alumineux de la mélilite, en série continue avec l'åkermanite. On l'obtient en cuisant fortement un calcaire argileux au contact d'un magma, ou dans un four à ciment dont la chimie est identique.",
  },
  hardystonite: {
    nom: "Hardystonite", formule: "Ca₂ZnSi₂O₇", famille: "Sorosilicate (groupe de la mélilite)",
    systeme: "quadratique", durete: 3.5, densite: 3.4, stabilite: 3, swatch: "#d8d0c8",
    clivage: "net", eclat: "vitreux", couleurs: "blanc, gris : violet intense en UV",
    contexte: "Franklin (New Jersey), au sein de marbres riches en zinc.",
    devient: "→ carbonates de zinc.",
    note: "La mélilite au zinc n'est connue que dans un seul gisement. Sous lampe UV, elle prend une teinte violet bleu profond : Franklin est célèbre pour ces roches qui se parent de couleurs sous ultraviolet.",
  },

  // ---------- Zinc & béryllium ----------
  hemimorphite: {
    nom: "Hémimorphite", formule: "Zn₄Si₂O₇(OH)₂·H₂O", famille: "Sorosilicate (groupe de l'hémimorphite)",
    systeme: "orthorhombique", durete: 5, densite: 3.45, stabilite: 4, swatch: "#a8cdd4",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "incolore, blanc, bleu ciel, vert",
    contexte: "Présente dans la zone d'oxydation des gisements de zinc, au niveau des chapeaux de blende.",
    devient: "En surface, elle demeure stable, mais elle se dissout en milieu acide.",
    note: "Hémimorphite : ses cristaux présentent deux extrémités différentes, et elle devient pyroélectrique, un pôle positif et l'autre négatif apparaissant lorsqu'on la chauffe. Avec la smithsonite, elle constituait les « calamines », minerai de zinc de la Vieille Montagne (Belgique) ; son nom découle de cette hémimorphie.",
  },
  bertrandite: {
    nom: "Bertrandite", formule: "Be₄Si₂O₇(OH)₂", famille: "Sorosilicate (groupe de la bertrandite)",
    systeme: "orthorhombique", durete: 6.5, densite: 2.6, stabilite: 5, swatch: "#e0dcd0",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "incolore, blanc, jaune pâle",
    contexte: "On la rencontre dans les pegmatites et les tufs volcaniques altérés (Spor Mountain, Utah).",
    devient: "→ argiles ; libère le béryllium.",
    note: "Devant le béryl lui-même, elle constitue le premier minerai de béryllium du monde. Le gisement de Spor Mountain (Utah) fournit l'essentiel de la production mondiale. Son nom rend hommage au minéralogiste français Émile Bertrand.",
  },

  // ---------- Fer & scandium ----------
  ilvaite: {
    nom: "Ilvaïte", formule: "CaFe²⁺₂Fe³⁺(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'ilvaïte)",
    systeme: "monoclinique", durete: 5.75, densite: 4.0, stabilite: 3, swatch: "#2e2c30",
    clivage: "net", eclat: "submétallique", couleurs: "noir de jais, gris-noir",
    contexte: "Skarns ferrifères ; gisement type : l'île d'Elbe (Ilva en latin, origine de son nom).",
    devient: "Elle donne des oxydes de fer (goethite) et des argiles, et s'altère assez rapidement.",
    note: "Prismes noirs striés, à l'éclat presque métallique. Il s'agit d'un des rares silicates où fer ferreux (Fe²⁺) et fer ferrique (Fe³⁺) coexistent dans un même cristal. L'île d'Elbe, où Napoléon fut exilé, est aussi un haut lieu de la minéralogie.",
  },
  thortveitite: {
    nom: "Thortveitite", formule: "(Sc,Y)₂Si₂O₇", famille: "Sorosilicate (groupe de la thortveitite)",
    systeme: "monoclinique", durete: 6.5, densite: 3.6, stabilite: 6, swatch: "#7a8a7a",
    clivage: "parfait", eclat: "vitreux", couleurs: "gris-vert, brun-vert",
    contexte: "Pegmatites granitiques rares (Iveland, Norvège ; Madagascar).",
    devient: "Résiduelle.",
    note: "Premier minerai de scandium, il figure parmi les minéraux les plus chers au gramme. Le scandium, ajouté à l'aluminium, produit des alliages légers et résistants, employés dans l'aéronautique et pour les cadres de vélo haut de gamme. Sa production mondiale se chiffre en dizaines de tonnes par an.",
  },

  // ---------- Silicates de calcium (skarns & ciment) ----------
  cuspidine: {
    nom: "Cuspidine", formule: "Ca₄(Si₂O₇)F₂", famille: "Sorosilicate (silicate de calcium)",
    systeme: "monoclinique", durete: 5.5, densite: 2.98, stabilite: 2, swatch: "#e0c8c8",
    clivage: "net", eclat: "vitreux", couleurs: "rose pâle, incolore, blanc",
    contexte: "Présente dans les marbres de contact riches en fluor et dans les laitiers sidérurgiques.",
    devient: "→ calcite + fluorine + argiles.",
    note: "On trouve ces aiguilles roses dans les marbres cuits par un magma, qui doivent leur nom au latin cuspis, la pointe. Elles se retrouvent aussi, de manière inattendue, dans les laitiers d'aciérie : minéral naturel reproduit sans le vouloir par l'industrie.",
  },
  tilleyite: {
    nom: "Tilleyite", formule: "Ca₅(Si₂O₇)(CO₃)₂", famille: "Sorosilicate (silicate de calcium)",
    systeme: "monoclinique", durete: 5.5, densite: 2.84, stabilite: 2, swatch: "#e4e0d4",
    clivage: "parfait", eclat: "vitreux", couleurs: "blanc, incolore, gris",
    contexte: "Marbres de contact (Crestmore, Californie).",
    devient: "→ calcite (se décarbonate facilement).",
    note: "Elle réunit groupements silicatés et carbonatés, ce qui en fait un cas singulier. Son lieu de formation : la zone la plus chaude du contact entre granite et calcaire, là où le CO₂ n'a pas encore pu s'échapper.",
  },
  rankinite: {
    nom: "Rankinite", formule: "Ca₃Si₂O₇", famille: "Sorosilicate (silicate de calcium)",
    systeme: "monoclinique", durete: 5.5, densite: 2.96, stabilite: 2, swatch: "#dcd8cc",
    clivage: "aucun", eclat: "vitreux", couleurs: "incolore, blanc, gris",
    contexte: "On la trouve dans les marbres de contact très chauds et comme phase du clinker de ciment.",
    devient: "S'hydrate facilement.",
    note: "Bien que très rare dans la nature, elle est familière des cimentiers, qui la retrouvent dans le clinker, ce mâchefer produit par le four à ciment à 1 450 °C. En somme, le ciment Portland est une roche métamorphique artificielle.",
  },

  // ---------- Borosilicate ----------
  axinite: {
    nom: "Axinite", formule: "Ca₂(Fe²⁺,Mg,Mn)Al₂(BO₃)(Si₄O₁₂)(OH)", famille: "Sorosilicate (borosilicate)",
    systeme: "triclinique", durete: 6.75, densite: 3.3, stabilite: 6, swatch: "#8a5a4a",
    clivage: "bon", eclat: "vitreux, très brillant", couleurs: "brun-violet, brun clou de girofle, lilas",
    contexte: "Skarns, veines alpines, contacts granite-calcaire (Oisans, Pyrénées).",
    devient: "→ argiles + bore en solution.",
    note: "Aplatis et tranchants, ses cristaux évoquent une lame de hache (du grec axine, la hache). Les fentes alpines de l'Oisans en livrent de superbes exemplaires violets. Sa classification a longtemps hésité : Strunz la range parmi les sorosilicates (9.BD), alors que sa structure en anneaux borosilicatés l'a longtemps fait ranger parmi les cyclosilicates.",
  },
});

// ---------- Sous-familles des sorosilicates ----------
const SORO_SOUS_FAMILLES = [
  {
    nom: "Groupe de l'épidote",
    formule: "Ca₂(Al,Fe)₃(SiO₄)(Si₂O₇)O(OH) : unités MIXTES",
    note: "De loin, c'est le groupe le plus important de la classe. Ses cristaux présentent une structure hybride : tétraèdres isolés (SiO₄) et paires (Si₂O₇) coexistent dans un même cristal. Minéraux repères du faciès « schistes verts », ils colorent en vert les roches métamorphiques de bas degré. La couleur varie selon le cation : fer, vert pistache ; manganèse, rouge violet ; terres rares, noir.",
    mineraux: ["epidote", "clinozoisite", "zoisite", "piemontite", "allanite"],
  },
  {
    nom: "Groupe de la vésuvianite",
    formule: "Ca₁₀(Mg,Fe)₂Al₄(SiO₄)₅(Si₂O₇)₂(OH)₄",
    note: "Même hybridation SiO₄ et Si₂O₇ que dans l'espèce précédente, mais avec une charpente quadratique propre. Ce minéral est caractéristique des skarns, formés là où un magma chauffe un calcaire.",
    mineraux: ["vesuvianite"],
  },
  {
    nom: "Groupe de la pumpellyite",
    formule: "Ca₂MgAl₂(SiO₄)(Si₂O₇)(OH)₂·H₂O",
    note: "Il signe un métamorphisme de très faible intensité, celui du faciès à préhnite-pumpellyite, intermédiaire entre la diagenèse et les schistes verts. Sa présence permet de dater un enfouissement de 5 à 10 km.",
    mineraux: ["pumpellyite"],
  },
  {
    nom: "Groupe de la lawsonite",
    formule: "CaAl₂(Si₂O₇)(OH)₂·H₂O",
    note: "Il caractérise les zones de subduction, où règnent des pressions élevées pour une température basse. Il ne se forme que dans une plaque en cours de plongée et entraîne de l'eau vers le manteau.",
    mineraux: ["lawsonite"],
  },
  {
    nom: "Groupe de la mélilite",
    formule: "Ca₂(Mg,Al,Zn)Si₂O₇ : Si₂O₇ purs",
    note: "Série continue entre l'åkermanite (Mg) et la gehlénite (Al). Elle naît des calcaires portés à très haute température et des fours à ciment. Mais la mélilite constitue surtout les inclusions blanches des météorites carbonées, les plus anciens solides du système solaire (4,567 milliards d'années).",
    mineraux: ["akermanite", "gehlenite", "hardystonite"],
  },
  {
    nom: "Zinc & béryllium",
    formule: "Zn₄Si₂O₇(OH)₂·H₂O · Be₄Si₂O₇(OH)₂",
    note: "Ces deux minerais, fondés sur le même motif Si₂O₇, sont l'hémimorphite, source du zinc (dite « calamine »), et la bertrandite, premier minerai mondial du béryllium.",
    mineraux: ["hemimorphite", "bertrandite"],
  },
  {
    nom: "Groupe de l'ilvaïte",
    formule: "CaFe²⁺₂Fe³⁺(Si₂O₇)O(OH)",
    note: "Silicate d'aspect presque métallique, d'un noir profond, qui renferme à la fois du fer ferreux et du fer ferrique. Son gisement type se situe sur l'île d'Elbe.",
    mineraux: ["ilvaite"],
  },
  {
    nom: "Groupe de la thortveitite",
    formule: "(Sc,Y)₂Si₂O₇",
    note: "Motif Si₂O₇ réduit à sa forme la plus simple. Il constitue le principal minerai de scandium, l'un des métaux les plus coûteux au monde.",
    mineraux: ["thortveitite"],
  },
  {
    nom: "Silicates de calcium (skarns & ciment)",
    formule: "Ca₄Si₂O₇F₂ · Ca₅Si₂O₇(CO₃)₂ · Ca₃Si₂O₇",
    note: "Au contact d'un magma, des calcaires cuits donnent ces minéraux, que l'on retrouve à l'identique dans le clinker des cimenteries. Le ciment Portland constitue donc, en pratique, une roche métamorphique fabriquée par l'homme.",
    mineraux: ["cuspidine", "tilleyite", "rankinite"],
  },
  {
    nom: "Borosilicate : groupe de l'axinite",
    formule: "Ca₂(Fe,Mg,Mn)Al₂(BO₃)(Si₄O₁₂)(OH)",
    note: "Brun-violet, ce minéral forme des cristaux en lame de hache. Strunz le range ici (9.BD), alors que sa place a longtemps été disputée entre sorosilicates et cyclosilicates.",
    mineraux: ["axinite"],
  },
];

// On accroche les sous-familles au groupe « Sorosilicates » de la classe IX
(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const soro = silicates.groupes.find((g) => g.nom.startsWith("Sorosilicates"));
  soro.sousGroupes = SORO_SOUS_FAMILLES;
  soro.mineraux = SORO_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
  soro.motif = "paires Si₂O₇ (deux tétraèdres partageant un sommet)";
  soro.note = "Deux tétraèdres SiO₄ se lient par un sommet commun, ce qui forme le radical [Si₂O₇]⁶⁻ en nœud papillon. Beaucoup de sorosilicates associent toutefois des paires Si₂O₇ et des tétraèdres isolés SiO₄ au sein d'une même structure. C'est le cas du groupe de l'épidote, de la vésuvianite et de la pumpellyite, qui constituent l'essentiel de la classe. Ces minéraux sont typiques du métamorphisme : ils permettent de dater les enfouissements et signalent les subductions.";
})();
