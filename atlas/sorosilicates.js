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
    contexte: "Schistes verts, marbres, fentes alpines — partout où l'épidote apparaît, mais sans fer.",
    devient: "→ argiles + calcite ; libère du calcium.",
    note: "Le pôle sans fer de l'épidote : là où l'épidote est vert pistache à cause du fer ferrique, la clinozoïsite reste pâle. Les deux forment une série continue — plus il y a de fer, plus le vert est franc.",
  },
  zoisite: {
    nom: "Zoïsite", formule: "Ca₂Al₃(SiO₄)(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'épidote)",
    systeme: "orthorhombique", durete: 6.5, densite: 3.3, stabilite: 6, swatch: "#8fa0c4",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "gris, vert, bleu violacé (tanzanite), rose (thulite)",
    contexte: "Roches métamorphiques calciques, éclogites, gneiss.",
    devient: "→ argiles + calcite.",
    note: "Même formule que la clinozoïsite, mais un empilement orthorhombique : ce sont des polymorphes. Sa variété bleu-violet, la tanzanite, découverte en 1967 au pied du Kilimandjaro, ne se trouve que là — sur une bande de quelques kilomètres carrés. Chauffée, elle passe du brun terne au bleu profond. Sa variété rose au manganèse est la thulite.",
  },
  piemontite: {
    nom: "Piémontite", formule: "Ca₂(Mn³⁺,Al,Fe³⁺)₃(SiO₄)(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'épidote)",
    systeme: "monoclinique", durete: 6.5, densite: 3.5, stabilite: 6, swatch: "#a04a5c",
    clivage: "parfait", eclat: "vitreux", couleurs: "rouge-violet à rouge sombre — très pléochroïque",
    contexte: "Schistes manganésifères métamorphisés, quartzites roses (Piémont, Italie).",
    devient: "→ oxydes de manganèse + argiles.",
    note: "L'épidote au manganèse, d'un rouge-violet spectaculaire. C'est elle qui rosit certains quartzites et schistes du Piémont italien, d'où son nom. Son pléochroïsme est si fort qu'au microscope elle change du jaune au rouge sang selon l'orientation.",
  },
  allanite: {
    nom: "Allanite (orthite)", formule: "(Ca,Ce,La,Y)₂(Al,Fe)₃(SiO₄)(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'épidote)",
    systeme: "monoclinique", durete: 6, densite: 3.9, stabilite: 5, swatch: "#3a3028",
    clivage: "imparfait", eclat: "submétallique à poisseux", couleurs: "brun-noir, noir",
    contexte: "Accessoire des granites, pegmatites et gneiss.",
    devient: "Se métamictise (radioactivité) puis s'altère en argiles + terres rares.",
    note: "L'épidote des terres rares : le calcium y est remplacé par du cérium, du lanthane, de l'yttrium — souvent accompagnés de thorium radioactif. Ce thorium détruit peu à peu son réseau de l'intérieur : les vieux cristaux sont « métamictes », devenus amorphes et vitreux. Souvent entourée d'un halo sombre dans les micas voisins, brûlés par sa radioactivité.",
  },

  // ---------- Groupe de la vésuvianite ----------
  vesuvianite: {
    nom: "Vésuvianite (idocrase)", formule: "Ca₁₀(Mg,Fe)₂Al₄(SiO₄)₅(Si₂O₇)₂(OH)₄", famille: "Sorosilicate (groupe de la vésuvianite)",
    systeme: "quadratique", durete: 6.5, densite: 3.4, stabilite: 6, swatch: "#6a8a4a",
    clivage: "médiocre", eclat: "vitreux à résineux", couleurs: "vert olive, brun, jaune, bleu (cyprine)",
    contexte: "Skarns : contact entre un magma et un calcaire. Découverte sur le Vésuve.",
    devient: "→ argiles + calcite ; libère Ca et Mg.",
    note: "Une structure hybride remarquable : elle mélange des tétraèdres isolés (SiO₄) ET des paires (Si₂O₇) dans le même cristal. Son autre nom, idocrase, vient du grec « forme mêlée », car ses cristaux semblent emprunter leurs faces à d'autres minéraux. Prismes verts trapus, typiques des skarns.",
  },

  // ---------- Groupe de la pumpellyite ----------
  pumpellyite: {
    nom: "Pumpellyite", formule: "Ca₂MgAl₂(SiO₄)(Si₂O₇)(OH)₂·H₂O", famille: "Sorosilicate (groupe de la pumpellyite)",
    systeme: "monoclinique", durete: 5.5, densite: 3.2, stabilite: 4, swatch: "#4a7a6a",
    clivage: "bon", eclat: "vitreux", couleurs: "vert bleuté, vert olive",
    contexte: "Basaltes et gabbros très faiblement métamorphisés ; amygdales des laves.",
    devient: "→ chlorite puis argiles.",
    note: "Minéral-index d'un métamorphisme presque imperceptible : le faciès « préhnite-pumpellyite », juste au-dessus de la diagenèse et juste en dessous des schistes verts. Trouver de la pumpellyite dans un basalte, c'est savoir qu'il a été enfoui à 5-10 km — pas plus.",
  },

  // ================= SOROSILICATES PURS (Si₂O₇ seuls) =================

  // ---------- Groupe de la lawsonite ----------
  lawsonite: {
    nom: "Lawsonite", formule: "CaAl₂(Si₂O₇)(OH)₂·H₂O", famille: "Sorosilicate (groupe de la lawsonite)",
    systeme: "orthorhombique", durete: 8, densite: 3.1, stabilite: 5, swatch: "#a8c4d4",
    clivage: "parfait", eclat: "vitreux", couleurs: "incolore, bleu pâle, gris",
    contexte: "Schistes bleus des zones de SUBDUCTION : haute pression, basse température.",
    devient: "Se déshydrate en remontant → zoïsite + argiles.",
    note: "Le marqueur des subductions. Elle ne se forme que sous très haute pression et basse température — exactement les conditions d'une plaque océanique qui plonge. Sa présence dans une roche (île de Groix, Nouvelle-Calédonie) prouve qu'elle a été enfouie à 30-70 km puis remontée. Elle transporte aussi de l'eau en profondeur, alimentant le volcanisme d'arc.",
  },

  // ---------- Groupe de la mélilite ----------
  akermanite: {
    nom: "Åkermanite", formule: "Ca₂MgSi₂O₇", famille: "Sorosilicate (groupe de la mélilite)",
    systeme: "quadratique", durete: 5.5, densite: 2.94, stabilite: 3, swatch: "#c8c8b8",
    clivage: "net", eclat: "vitreux à résineux", couleurs: "incolore, gris, jaune-brun",
    contexte: "Marbres de contact, laves alcalines, laitiers métallurgiques — et météorites.",
    devient: "→ argiles + calcite (s'altère assez vite).",
    note: "Pôle magnésien de la mélilite. Son intérêt dépasse la Terre : la mélilite est le principal constituant des « CAI », ces inclusions blanches des météorites carbonées qui sont les plus vieux solides du système solaire — 4,567 milliards d'années. Elles ont condensé avant même la formation des planètes.",
  },
  gehlenite: {
    nom: "Gehlénite", formule: "Ca₂Al(AlSi)O₇", famille: "Sorosilicate (groupe de la mélilite)",
    systeme: "quadratique", durete: 5.5, densite: 3.04, stabilite: 3, swatch: "#b8bca0",
    clivage: "net", eclat: "vitreux à résineux", couleurs: "gris-vert, jaune, brun",
    contexte: "Skarns et marbres de contact à haute température ; clinker de ciment.",
    devient: "→ argiles + calcite.",
    note: "Pôle alumineux de la mélilite, en série continue avec l'åkermanite. Elle apparaît quand un calcaire argileux est cuit très fort au contact d'un magma — ou dans un four à ciment, car c'est exactement la même chimie.",
  },
  hardystonite: {
    nom: "Hardystonite", formule: "Ca₂ZnSi₂O₇", famille: "Sorosilicate (groupe de la mélilite)",
    systeme: "quadratique", durete: 3.5, densite: 3.4, stabilite: 3, swatch: "#d8d0c8",
    clivage: "net", eclat: "vitreux", couleurs: "blanc, gris — violet intense en UV",
    contexte: "Franklin (New Jersey), dans les marbres à zinc.",
    devient: "→ carbonates de zinc.",
    note: "La mélilite au zinc, connue quasiment d'un seul gisement. Sous lampe UV, elle s'illumine d'un violet-bleu profond — Franklin est célèbre pour ces roches qui s'embrasent de couleurs sous ultraviolet.",
  },

  // ---------- Zinc & béryllium ----------
  hemimorphite: {
    nom: "Hémimorphite", formule: "Zn₄Si₂O₇(OH)₂·H₂O", famille: "Sorosilicate (groupe de l'hémimorphite)",
    systeme: "orthorhombique", durete: 5, densite: 3.45, stabilite: 4, swatch: "#a8cdd4",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "incolore, blanc, bleu ciel, vert",
    contexte: "Zone d'oxydation des gisements de zinc (chapeaux de la blende).",
    devient: "Stable en surface ; se dissout en milieu acide.",
    note: "Son nom vient de sa curiosité cristalline : ses cristaux sont hémimorphes, c'est-à-dire que leurs deux extrémités n'ont pas la même forme. Résultat, elle est pyroélectrique — chauffée, elle se charge d'électricité, un pôle positif et l'autre négatif. Avec la smithsonite, elle formait les « calamines », minerai de zinc historique de la Vieille Montagne (Belgique).",
  },
  bertrandite: {
    nom: "Bertrandite", formule: "Be₄Si₂O₇(OH)₂", famille: "Sorosilicate (groupe de la bertrandite)",
    systeme: "orthorhombique", durete: 6.5, densite: 2.6, stabilite: 5, swatch: "#e0dcd0",
    clivage: "parfait", eclat: "vitreux à nacré", couleurs: "incolore, blanc, jaune pâle",
    contexte: "Pegmatites et tufs volcaniques altérés (Spor Mountain, Utah).",
    devient: "→ argiles ; libère le béryllium.",
    note: "Le principal minerai de béryllium du monde — devant le béryl lui-même. Le gisement de Spor Mountain (Utah) fournit l'essentiel de la production mondiale. Nommée d'après le minéralogiste français Émile Bertrand.",
  },

  // ---------- Fer & scandium ----------
  ilvaite: {
    nom: "Ilvaïte", formule: "CaFe²⁺₂Fe³⁺(Si₂O₇)O(OH)", famille: "Sorosilicate (groupe de l'ilvaïte)",
    systeme: "monoclinique", durete: 5.75, densite: 4.0, stabilite: 3, swatch: "#2e2c30",
    clivage: "net", eclat: "submétallique", couleurs: "noir de jais, gris-noir",
    contexte: "Skarns à fer — gisement type : l'île d'Elbe (Ilva en latin, d'où son nom).",
    devient: "→ oxydes de fer (goethite) + argiles ; s'altère assez vite.",
    note: "Prismes noirs striés, à éclat presque métallique. C'est l'un des rares silicates à contenir à la fois du fer ferreux (Fe²⁺) et du fer ferrique (Fe³⁺) dans le même cristal. L'île d'Elbe, où Napoléon fut exilé, est aussi un haut lieu de la minéralogie.",
  },
  thortveitite: {
    nom: "Thortveitite", formule: "(Sc,Y)₂Si₂O₇", famille: "Sorosilicate (groupe de la thortveitite)",
    systeme: "monoclinique", durete: 6.5, densite: 3.6, stabilite: 6, swatch: "#7a8a7a",
    clivage: "parfait", eclat: "vitreux", couleurs: "gris-vert, brun-vert",
    contexte: "Pegmatites granitiques rares (Iveland, Norvège ; Madagascar).",
    devient: "Résiduelle.",
    note: "Le principal minerai de scandium, et l'un des minéraux les plus chers au monde au gramme. Le scandium, ajouté à l'aluminium, donne des alliages exceptionnellement légers et résistants — utilisés dans l'aéronautique et les cadres de vélo haut de gamme. Il est si rare qu'il se compte en dizaines de tonnes par an.",
  },

  // ---------- Silicates de calcium (skarns & ciment) ----------
  cuspidine: {
    nom: "Cuspidine", formule: "Ca₄(Si₂O₇)F₂", famille: "Sorosilicate (silicate de calcium)",
    systeme: "monoclinique", durete: 5.5, densite: 2.98, stabilite: 2, swatch: "#e0c8c8",
    clivage: "net", eclat: "vitreux", couleurs: "rose pâle, incolore, blanc",
    contexte: "Marbres de contact riches en fluor ; laitiers sidérurgiques.",
    devient: "→ calcite + fluorine + argiles.",
    note: "Aiguilles roses dans les marbres cuits par un magma. Son nom vient du latin cuspis, la pointe, pour ses cristaux effilés. On la retrouve dans les laitiers d'aciérie — un minéral naturel que l'industrie refabrique sans le vouloir.",
  },
  tilleyite: {
    nom: "Tilleyite", formule: "Ca₅(Si₂O₇)(CO₃)₂", famille: "Sorosilicate (silicate de calcium)",
    systeme: "monoclinique", durete: 5.5, densite: 2.84, stabilite: 2, swatch: "#e4e0d4",
    clivage: "parfait", eclat: "vitreux", couleurs: "blanc, incolore, gris",
    contexte: "Marbres de contact (Crestmore, Californie).",
    devient: "→ calcite (se décarbonate facilement).",
    note: "Une curiosité chimique : elle contient à la fois des groupements silicatés ET carbonatés. Elle se forme dans la zone la plus chaude du contact entre un granite et un calcaire, là où le CO₂ n'a pas encore eu le temps de s'échapper.",
  },
  rankinite: {
    nom: "Rankinite", formule: "Ca₃Si₂O₇", famille: "Sorosilicate (silicate de calcium)",
    systeme: "monoclinique", durete: 5.5, densite: 2.96, stabilite: 2, swatch: "#dcd8cc",
    clivage: "aucun", eclat: "vitreux", couleurs: "incolore, blanc, gris",
    contexte: "Marbres de contact très chauds ; phase du clinker de ciment.",
    devient: "S'hydrate facilement.",
    note: "Rarissime dans la nature, mais familière des cimentiers : elle apparaît dans le clinker, ce mâchefer que produit le four à ciment à 1 450 °C. Le ciment Portland est, littéralement, une roche métamorphique artificielle.",
  },

  // ---------- Borosilicate ----------
  axinite: {
    nom: "Axinite", formule: "Ca₂(Fe²⁺,Mg,Mn)Al₂(BO₃)(Si₄O₁₂)(OH)", famille: "Sorosilicate (borosilicate)",
    systeme: "triclinique", durete: 6.75, densite: 3.3, stabilite: 6, swatch: "#8a5a4a",
    clivage: "bon", eclat: "vitreux, très brillant", couleurs: "brun-violet, brun clou de girofle, lilas",
    contexte: "Skarns, veines alpines, contacts granite-calcaire (Oisans, Pyrénées).",
    devient: "→ argiles + bore en solution.",
    note: "Ses cristaux sont si aplatis et si tranchants qu'ils évoquent une lame de hache — du grec axine, la hache. Les fentes alpines de l'Oisans en livrent de superbes cristaux violets. Sa classification a longtemps hésité : Strunz la range en sorosilicate (9.BD), mais sa structure en anneaux borosilicatés l'a longtemps fait classer parmi les cyclosilicates.",
  },
});

// ---------- Sous-familles des sorosilicates ----------
const SORO_SOUS_FAMILLES = [
  {
    nom: "Groupe de l'épidote",
    formule: "Ca₂(Al,Fe)₃(SiO₄)(Si₂O₇)O(OH) — unités MIXTES",
    note: "De loin le groupe le plus important de la classe — et une structure hybride : des tétraèdres isolés (SiO₄) coexistent avec des paires (Si₂O₇) dans le même cristal. Minéraux-index du faciès « schistes verts », ils verdissent les roches métamorphiques de bas degré. Selon le cation, la couleur change du tout au tout : fer → vert pistache, manganèse → rouge-violet, terres rares → noir.",
    mineraux: ["epidote", "clinozoisite", "zoisite", "piemontite", "allanite"],
  },
  {
    nom: "Groupe de la vésuvianite",
    formule: "Ca₁₀(Mg,Fe)₂Al₄(SiO₄)₅(Si₂O₇)₂(OH)₄",
    note: "Même hybridation SiO₄ + Si₂O₇, mais une charpente quadratique bien à elle. Minéral emblématique des skarns — là où un magma cuit un calcaire.",
    mineraux: ["vesuvianite"],
  },
  {
    nom: "Groupe de la pumpellyite",
    formule: "Ca₂MgAl₂(SiO₄)(Si₂O₇)(OH)₂·H₂O",
    note: "Le témoin d'un métamorphisme minuscule : le faciès « préhnite-pumpellyite », entre la simple diagenèse et les schistes verts. Trouver de la pumpellyite, c'est dater un enfouissement de 5 à 10 km.",
    mineraux: ["pumpellyite"],
  },
  {
    nom: "Groupe de la lawsonite",
    formule: "CaAl₂(Si₂O₇)(OH)₂·H₂O",
    note: "Le marqueur des zones de SUBDUCTION : haute pression, basse température. Elle ne se forme que dans une plaque qui plonge — et elle emporte de l'eau avec elle vers le manteau.",
    mineraux: ["lawsonite"],
  },
  {
    nom: "Groupe de la mélilite",
    formule: "Ca₂(Mg,Al,Zn)Si₂O₇ — Si₂O₇ purs",
    note: "Série continue entre l'åkermanite (Mg) et la gehlénite (Al). Née des calcaires cuits à très haute température — et des fours à ciment. Mais surtout : la mélilite constitue les inclusions blanches des météorites carbonées, les plus vieux solides du système solaire (4,567 milliards d'années).",
    mineraux: ["akermanite", "gehlenite", "hardystonite"],
  },
  {
    nom: "Zinc & béryllium",
    formule: "Zn₄Si₂O₇(OH)₂·H₂O · Be₄Si₂O₇(OH)₂",
    note: "Deux minerais majeurs bâtis sur le même motif Si₂O₇ : l'hémimorphite pour le zinc (les « calamines »), la bertrandite pour le béryllium (premier minerai mondial).",
    mineraux: ["hemimorphite", "bertrandite"],
  },
  {
    nom: "Groupe de l'ilvaïte",
    formule: "CaFe²⁺₂Fe³⁺(Si₂O₇)O(OH)",
    note: "Un silicate presque métallique, noir de jais, qui héberge à la fois du fer ferreux et du fer ferrique. Gisement type : l'île d'Elbe.",
    mineraux: ["ilvaite"],
  },
  {
    nom: "Groupe de la thortveitite",
    formule: "(Sc,Y)₂Si₂O₇",
    note: "Le motif Si₂O₇ le plus dépouillé — et le principal minerai de scandium, l'un des métaux les plus chers au monde.",
    mineraux: ["thortveitite"],
  },
  {
    nom: "Silicates de calcium (skarns & ciment)",
    formule: "Ca₄Si₂O₇F₂ · Ca₅Si₂O₇(CO₃)₂ · Ca₃Si₂O₇",
    note: "Les minéraux des calcaires cuits au contact d'un magma. Ils réapparaissent, à l'identique, dans le clinker des cimenteries : le ciment Portland est une roche métamorphique fabriquée par l'homme.",
    mineraux: ["cuspidine", "tilleyite", "rankinite"],
  },
  {
    nom: "Borosilicate — groupe de l'axinite",
    formule: "Ca₂(Fe,Mg,Mn)Al₂(BO₃)(Si₄O₁₂)(OH)",
    note: "Cristaux en lame de hache, brun-violet. Sa classification a longtemps hésité entre sorosilicate et cyclosilicate — Strunz la range ici (9.BD).",
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
  soro.note = "Deux tétraèdres SiO₄ se soudent par un sommet — un oxygène devient commun — et forment le radical [Si₂O₇]⁶⁻, en nœud papillon. Beaucoup de sorosilicates trichent toutefois : ils mélangent des paires Si₂O₇ ET des tétraèdres isolés SiO₄ dans la même structure. C'est le cas du groupe de l'épidote, de la vésuvianite et de la pumpellyite — soit l'essentiel de la classe. Ce sont des minéraux typiques du métamorphisme : ils datent les enfouissements et signent les subductions.";
})();
