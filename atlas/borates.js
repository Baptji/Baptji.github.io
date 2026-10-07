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
    contexte: "Recristallisation en profondeur des couches de borax (Boron, Californie — le gisement géant).",
    stabilite: 1, swatch: "#e9e7de",
    devient: "S'hydrate à l'air en tincalconite blanche pulvérulente ; soluble.",
    note: "Le borax « cuit » : enfouies et comprimées, les couches de borax perdent de l'eau et recristallisent en kernite. La mine à ciel ouvert de Boron (Californie) en extrait des blocs fibreux d'une pureté record — la moitié du bore mondial sort de ce trou du désert Mojave, héritier des convois « 20-Mule-Team » de la Death Valley.",
  },
  colemanite: {
    nom: "Colémanite", formule: "CaB₃O₄(OH)₃·H₂O", famille: "Borate hydraté",
    systeme: "monoclinique", durete: 4.5, densite: 2.42,
    clivage: "parfait {010}", eclat: "vitreux brillant",
    couleurs: "incolore, blanc laiteux",
    contexte: "Lits et géodes dans les argiles lacustres des bassins évaporitiques (Death Valley, Anatolie turque).",
    stabilite: 3, swatch: "#e4e6e2",
    devient: "Peu soluble pour un borate ; s'altère lentement en borates calciques secondaires.",
    note: "Le borate « solide » de la bande : assez dur et insoluble pour faire de vrais cristaux brillants dans les géodes — les plus beaux borates des collections. C'est le calcium qui le verrouille. La Turquie, assise sur les lacs boratés miocènes d'Anatolie, domine aujourd'hui le marché mondial du bore devant la Californie.",
  },
  ulexite: {
    nom: "Ulexite (« TV rock »)", formule: "NaCaB₅O₆(OH)₆·5H₂O", famille: "Borate hydraté",
    systeme: "triclinique", durete: 2.25, densite: 1.96,
    clivage: "parfait {010} — fibres parallèles", eclat: "soyeux à nacré",
    couleurs: "blanc pur, aspect de coton ou de soie",
    contexte: "Croûtes cotonneuses (« cotton balls ») à la surface des lacs salés boratés (Atacama, Californie, Turquie).",
    stabilite: 1, swatch: "#f2f1ea",
    devient: "Soluble : dissoute et reprécipitée au gré des crues du salar.",
    note: "La « pierre télévision » : ses fibres parallèles conduisent la lumière comme un faisceau de fibres optiques naturelles — posée sur un journal, l'image du texte « monte » à la surface du caillou. Un tour de magie minéralogique inventé par l'évaporation des lacs andins, bien avant nos câbles de verre.",
  },
  boracite: {
    nom: "Boracite", formule: "Mg₃B₇O₁₃Cl", famille: "Borate à chlore",
    systeme: "orthorhombique (pseudo-cubique)", durete: 7.25, densite: 2.95,
    clivage: "aucun", eclat: "vitreux à adamantin",
    couleurs: "incolore, vert pâle, gris bleuté",
    contexte: "Cristaux disséminés dans les évaporites à gypse et sel (Zechstein allemand : Stassfurt, Lunebourg) ; pas signalée dans les sels français.",
    stabilite: 3, swatch: "#cfe0d4",
    devient: "Résiste étonnamment bien ; libère son bore aux saumures profondes.",
    note: "L'anomalie de la famille : dureté 7 — celle du quartz ! — chez un minéral d'évaporite. Ses pseudo-cubes verts poussent DANS le gypse et le sel des évaporites allemandes du Zechstein, cousines germaniques de nos sels lorrains du Keuper (où elle n'a, elle, jamais été signalée). Piézoélectrique et ferroélectrique, une propriété physique remarquable pour un minéral d'évaporite.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 6);
  c.groupes = [
    {
      nom: "Borates des lacs salés", code: "VI.C-E", motif: "BO₃/BO₄ + eau (borax, kernite, ulexite, colémanite)",
      note: "La séquence d'un lac boraté qui s'assèche : borax en surface, kernite en profondeur, ulexite en « boules de coton », colémanite en géodes dans les argiles. Trois régions au monde : Californie, Anatolie, Andes.",
      mineraux: ["borax", "kernite", "ulexite", "colemanite"],
    },
    {
      nom: "Borates des évaporites marines", code: "VI.G", motif: "borates magnésiens à chlore",
      note: "Le bore des mers évaporées : la boracite pousse en pseudo-cubes durs comme le quartz dans le sel et le gypse — une curiosité des bassins allemands, jamais signalée dans nos sels lorrains.",
      mineraux: ["boracite"],
    },
  ];
})();
