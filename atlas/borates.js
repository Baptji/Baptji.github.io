// ============================================================
// CLASSE VI — BORATES (Strunz VI)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  kernite: {
    nom: "Kernite", formule: "Na₂B₄O₇·4H₂O", famille: "Borate hydraté",
    systeme: "monoclinique", durete: 2.75, densite: 1.9,
    clivage: "parfait {100} et {001} (fibres)", eclat: "vitreux à soyeux",
    couleurs: "incolore → blanc crayeux en se déshydratant",
    contexte: "Les couches de borax se recristallisent en profondeur, comme à Boron (Californie), gisement géant.",
    stabilite: 1, swatch: "#e9e7de",
    devient: "À l'air, elle s'hydrate en une tincalconite blanche et pulvérulente ; elle est soluble.",
    note: "Le borax se « cuit » : enfoui et comprimé, il perd de l'eau et se recristallise en kernite. La mine à ciel ouvert de Boron (Californie) en tire des blocs fibreux d'une pureté exceptionnelle ; la moitié du bore mondial sort de ce site du désert des Mojave, héritier des convois « 20-Mule-Team » de la Death Valley.",
  },
  colemanite: {
    nom: "Colémanite", formule: "CaB₃O₄(OH)₃·H₂O", famille: "Borate hydraté",
    systeme: "monoclinique", durete: 4.5, densite: 2.42,
    clivage: "parfait {010}", eclat: "vitreux brillant",
    couleurs: "incolore, blanc laiteux",
    contexte: "Dans les argiles lacustres des bassins évaporitiques (Death Valley, Anatolie turque), il s'organise en lits et en géodes.",
    stabilite: 3, swatch: "#e4e6e2",
    devient: "Moins soluble qu'un borate courant, elle se transforme lentement en borates calciques secondaires.",
    note: "Borate « solide » de la série : résistant et peu soluble, il engendre de vrais cristaux brillants dans les géodes, parmi les plus beaux borates des collections. C'est le calcium qui le stabilise. La Turquie, bâtie sur les lacs boratés miocènes d'Anatolie, dépasse désormais la Californie dans la production mondiale de bore.",
  },
  ulexite: {
    nom: "Ulexite (« TV rock »)", formule: "NaCaB₅O₆(OH)₆·5H₂O", famille: "Borate hydraté",
    systeme: "triclinique", durete: 2.25, densite: 1.96,
    clivage: "parfait {010} : fibres parallèles", eclat: "soyeux à nacré",
    couleurs: "blanc pur, aspect de coton ou de soie",
    contexte: "À la surface des lacs salés boratés (Atacama, Californie, Turquie), se forment des croûtes cotonneuses, dites « cotton balls ».",
    stabilite: 1, swatch: "#f2f1ea",
    devient: "Elle se dissout et se redépose tour à tour, selon les crues du salar, car elle est soluble.",
    note: "Elle doit son nom à la « pierre télévision » : ses fibres parallèles guident la lumière comme des fibres optiques naturelles, si bien qu'un texte posé dessous semble remonter à la surface de la pierre. Ce tour optique, né de l'évaporation des lacs andins, précède nos câbles de verre de bien longtemps.",
  },
  boracite: {
    nom: "Boracite", formule: "Mg₃B₇O₁₃Cl", famille: "Borate à chlore",
    systeme: "orthorhombique (pseudo-cubique)", durete: 7.25, densite: 2.95,
    clivage: "aucun", eclat: "vitreux à adamantin",
    couleurs: "incolore, vert pâle, gris bleuté",
    contexte: "On la trouve disséminée dans les évaporites à gypse et sel du Zechstein allemand (Stassfurt, Lunebourg) ; elle n'est pas signalée dans les sels français.",
    stabilite: 3, swatch: "#cfe0d4",
    devient: "Elle résiste étonnamment bien et libère son bore dans les saumures profondes.",
    note: "Surprise : elle atteint une dureté de 7, celle du quartz, pour un minéral d'évaporite. Ses pseudo-cubes verts croissent dans le gypse et le sel du Zechstein allemand, proches de nos sels lorrains du Keuper (où elle n'a jamais été reconnue). Piézoélectrique et ferroélectrique, elle présente une propriété physique notable pour ce type de minéral.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 6);
  c.groupes = [
    {
      nom: "Borates des lacs salés", code: "VI.C-E", motif: "BO₃/BO₄ + eau (borax, kernite, ulexite, colémanite)",
      note: "Lorsqu'un lac boraté s'assèche, la séquence se met en place : borax en surface, kernite en profondeur, ulexite en « boules de coton », colémanite en géodes dans les argiles. Ces lacs ne se trouvent que dans trois régions du monde : Californie, Anatolie et Andes.",
      mineraux: ["borax", "kernite", "ulexite", "colemanite"],
    },
    {
      nom: "Borates des évaporites marines", code: "VI.G", motif: "borates magnésiens à chlore",
      note: "Dans le sel et le gypse, le bore des mers évaporées fait croître des pseudo-cubes de boracite, dont la dureté égale celle du quartz. Il s'agit d'une particularité des bassins allemands, jamais observée dans les sels lorrains.",
      mineraux: ["boracite"],
    },
  ];
})();
