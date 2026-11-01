// ============ Minéraux des météorites (chantier B.5, 08/10/2026) ============
// Chargé après organiques.js (toutes les classes de Strunz sont posées) et avant app.js.
// Huit espèces reconnues par l'IMA, présentes surtout (ou seulement) dans les météorites, ajoutées à leur classe :
//   I  éléments natifs : taénite (I.A, alliages fer-nickel), cohénite et schreibersite (I.B, carbures et phosphures
//      métalliques), moissanite (I.D, carbures non métalliques) ;
//   II sulfures : troïlite (II.C, groupe de la nickéline), oldhamite (II.C, groupe de la galène), daubréelite (II.D,
//      groupe de la linnéite, spinelles soufrés) ;
//   VIII phosphates : merrillite (VIII.A, groupe de la whitlockite).
// La kamacite (fer pauvre en nickel) n'est pas une espèce pour l'IMA : c'est le fer natif (fiche fer_natif).
// Sources : Handbook of Mineralogy (Anthony et al.), Mindat, Wikipédia FR/EN ; structures COD (structures/index.js).

Object.assign(MINERAUX, {
  taenite: {
    nom: "Taénite", formule: "γ-(Ni,Fe)", famille: "Élément natif : alliage fer-nickel",
    systeme: "cubique", durete: 5.25, densite: 8.0,
    clivage: "aucun (malléable)", eclat: "métallique",
    couleurs: "blanc grisâtre à blanc d'argent",
    contexte: "On la trouve dans les météorites de fer, les pallasites, les mésosidérites et les grains métalliques des chondrites : sous forme de fines bandes bordant les lamelles de kamacite, ainsi que dans la plessite.",
    stabilite: 4, swatch: "#b9b8b1",
    devient: "La taénite s'oxyde plus lentement que la kamacite, moins riche en nickel : elle forme des oxyhydroxydes de fer (goethite, akaganéite) et relâche le nickel dans l'eau. Lorsqu'une météorite de fer est attaquée par les intempéries, ses bandes de taénite ressortent en relief.",
    note: "Alliage fer-nickel riche en nickel (de 20 à plus de 50 %), son nom vient du grec <i>tainia</i>, « ruban », car on la voit sous forme de minces rubans brillants sur les tranches polies des météorites. En se refroidissant de quelques degrés par million d'années, elle expulse les lamelles de kamacite des figures de Widmanstätten. Plus lentement encore, sous 320 °C, fer et nickel s'ordonnent en plans alternés : c'est la tétrataénite, aujourd'hui étudiée pour la fabrication d'aimants sans terres rares.",
    ima: "espèce reconnue avant l'IMA (G), 1861",
  },
  cohenite: {
    nom: "Cohénite", formule: "(Fe,Ni,Co)₃C", famille: "Élément natif : carbure métallique",
    systeme: "orthorhombique", durete: 5.75, densite: 7.4,
    clivage: "bon selon {100}, {010} et {001}", eclat: "métallique",
    couleurs: "blanc d'étain, se ternissant en jaune bronze ou doré",
    contexte: "Elle se rencontre dans les fers du groupe IAB, les uréilites et certaines chondrites à enstatite. Sur Terre, elle apparaît dans le fer natif des basaltes de Disko (Groenland), où une coulée a traversé des couches de charbon.",
    stabilite: 3, swatch: "#b6ad94",
    devient: "Elle n'est pas stable à basse pression et se décompose très lentement en fer et en graphite. Humide, l'air fait rouiller son fer.",
    note: "Cristaux de plusieurs millimètres formés au refroidissement du noyau riche en carbone d'un astéroïde, la cohénite est la cémentite des métallurgistes (Fe₃C), carbure qui durcit aciers et fontes. Elle doit son nom à Emil Cohen (1842 à 1905), minéralogiste allemand ayant consacré la fin de sa vie aux météorites. Elle est attirée par l'aimant.",
    ima: "espèce reconnue avant l'IMA (G), 1889",
  },
  schreibersite: {
    nom: "Schreibersite", formule: "(Fe,Ni)₃P", famille: "Élément natif : phosphure métallique",
    systeme: "quadratique", durete: 6.75, densite: 7.1,
    clivage: "parfait selon {001}", eclat: "métallique",
    couleurs: "blanc d'argent à blanc d'étain, se ternissant en jaune laiton ou brun",
    contexte: "Elle se rencontre dans les météorites de fer (plaques de plusieurs centimètres, fines aiguilles dites rhabdites), les pallasites, les mésosidérites et les chondrites à enstatite ; sur Terre, dans le fer natif de Disko.",
    stabilite: 2, swatch: "#c3bd9e",
    devient: "Son contact avec l'eau provoque une oxydation en oxydes de fer, et il s'en dégage du phosphore sous des formes très réactives, phosphites puis phosphates.",
    note: "C'est là que se concentre presque tout le phosphore des météorites de fer. Depuis les travaux de Matthew Pasek et Dante Lauretta (2005), les chimistes s'y intéressent : en se corrodant dans l'eau, elle libère des composés phosphorés capables de se lier aux molécules organiques, si bien que les météorites tombées sur la jeune Terre auraient pu fournir le phosphore de l'ADN et de l'ATP. Son nom rend hommage à Carl von Schreibers (1775 à 1852), directeur du cabinet d'histoire naturelle de Vienne, qui étudia les météorites.",
    ima: "espèce reconnue avant l'IMA (G), 1847",
  },
  moissanite: {
    nom: "Moissanite", formule: "SiC", famille: "Élément natif : carbure non métallique",
    systeme: "hexagonal (polytype 6H, le plus courant)", durete: 9.5, densite: 3.22,
    clivage: "indistinct selon {0001}", eclat: "adamantin à métallique",
    couleurs: "vert, bleu, noir ; incolore quand elle est très pure",
    contexte: "On la trouve sous forme de grains microscopiques dans les chondrites, plus anciens que le Soleil, dans les résidus de la météorite de Canyon Diablo (Arizona), et dans de très rares grains des kimberlites et de quelques roches du manteau.",
    stabilite: 10, swatch: "#5e8f86",
    devient: "Aucune altération : inaltérable à la surface de la Terre, elle subsiste intacte dans les résidus obtenus en attaquant les météorites à l'acide.",
    note: "En 1893, Henri Moissan, chimiste français et futur prix Nobel (1906), dissout un fragment de la météorite de Canyon Diablo et y découvre de minuscules cristaux qu'il prend d'abord pour du diamant. Il s'agissait en fait de carbure de silicium, déjà fabriqué comme abrasif sous le nom de carborundum. Le minéral porte ce nom depuis 1905. Une partie des grains des chondrites s'est formée dans l'atmosphère d'étoiles géantes riches en carbone, avant la naissance du Soleil, et en conserve la signature isotopique. La moissanite des bijoux est de synthèse.",
    ima: "espèce reconnue avant l'IMA (G), 1905",
  },
  troilite: {
    nom: "Troïlite", formule: "FeS", famille: "Sulfure 1:1 (groupe de la nickéline)",
    systeme: "hexagonal", durete: 3.75, densite: 4.7,
    clivage: "aucun (séparation selon {0001})", eclat: "métallique",
    couleurs: "brun bronze pâle à gris, se ternissant vite",
    contexte: "On la rencontre dans presque toutes les météorites (nodules des fers, grains des chondrites) ainsi que dans les roches lunaires. Sur Terre, elle est très rare (serpentinites, fer natif de Disko).",
    stabilite: 1, swatch: "#9d8358",
    devient: "À l'air humide, elle s'oxyde rapidement en oxydes et hydroxydes de fer, tandis que le soufre passe à l'état de sulfate (gypse en présence de calcium).",
    note: "Il s'agit du sulfure de fer « exact », FeS, dépourvu du fer manquant de la pyrrhotite terrestre : il se forme là où l'oxygène fait défaut, comme dans les météorites et sur la Lune. Son nom rend hommage à Domenico Troili, jésuite qui décrivit en 1766 une pierre tombée à Albareto, près de Modène, et y remarqua ce sulfure, à une époque où les savants refusaient encore d'admettre l'existence des pierres tombées du ciel. Les lames de troïlite des météorites de fer sont appelées lamelles de Reichenbach.",
    ima: "espèce reconnue avant l'IMA (G), 1863",
  },
  oldhamite: {
    nom: "Oldhamite", formule: "CaS", famille: "Sulfure 1:1 (groupe de la galène)",
    systeme: "cubique", durete: 4, densite: 2.58,
    clivage: "parfait selon {001} (cubique)", eclat: "vitreux à gras",
    couleurs: "brun marron pâle ; incolore quand il est pur",
    contexte: "Elle se trouve dans les chondrites à enstatite et les aubrites ; sur Terre, dans les terrils de charbon en combustion et les roches cuites par ces feux.",
    stabilite: 1, swatch: "#b8946a",
    devient: "Au contact de l'eau, il libère du sulfure d'hydrogène (odeur d'œuf pourri) et laisse derrière lui du gypse ou de la calcite.",
    note: "Il s'agit d'un sulfure de calcium, qui ne peut naître qu'en l'absence d'oxygène et d'eau, le calcium s'unissant d'ordinaire à l'oxygène (calcite, gypse, plagioclase). Sa présence indique que les chondrites à enstatite et les aubrites se sont formées dans un milieu extrêmement réducteur, près du Soleil. Décrit dans la météorite de Bustee (Inde, 1852), il rend hommage à Thomas Oldham (1816 à 1878), premier directeur du Service géologique de l'Inde.",
    ima: "espèce reconnue avant l'IMA (G), 1870",
  },
  daubreelite: {
    nom: "Daubréelite", formule: "Fe²⁺Cr₂S₄", famille: "Sulfure (groupe de la linnéite, spinelle soufré)",
    systeme: "cubique", durete: 4.75, densite: 3.8,
    clivage: "distinct selon {001}", eclat: "métallique",
    couleurs: "noir",
    contexte: "Elle se rencontre dans les météorites de fer (lames dans la troïlite) et les chondrites à enstatite ; elle est presque inconnue sur Terre.",
    stabilite: 2, swatch: "#2f2e30",
    devient: "Elle s'oxyde : le fer rouille, tandis que le chrome demeure sur place sous forme d'oxyde.",
    note: "Il s'agit d'un spinelle dans lequel le soufre remplace l'oxygène : le chrome, qui forme la chromite (un oxyde) dans les roches terrestres, se combine ici au soufre faute d'oxygène. Elle rend hommage à Gabriel Auguste Daubrée (1814 à 1896), géologue français, professeur au Muséum d'histoire naturelle de Paris, qui fit fondre et recristalliser des roches afin de reproduire les météorites, et proposa en 1867 l'une de leurs premières classifications, fondée sur la part de fer.",
    ima: "espèce reconnue avant l'IMA (G), 1876",
  },
  merrillite: {
    nom: "Merrillite", formule: "Ca₉NaMg(PO₄)₇", famille: "Phosphate anhydre (groupe de la whitlockite)",
    systeme: "trigonal", durete: 5, densite: 3.1,
    clivage: "aucun", eclat: "vitreux",
    couleurs: "incolore à blanc",
    contexte: "On la trouve dans presque toutes les classes de météorites (chondrites, eucrites, météorites martiennes, pallasites) ainsi que dans les roches lunaires.",
    stabilite: 5, swatch: "#e9e4d8",
    devient: "Elle se dissout lentement en milieu acide, et le phosphate se réorganise en apatite ou en phosphates secondaires.",
    note: "Principal phosphate des météorites, il s'agit du cousin anhydre de la whitlockite terrestre, dépourvu d'hydrogène, élément que les astéroïdes ne contenaient pas. Il retient les terres rares et une bonne part de l'uranium et du thorium des roches lunaires et martiennes, ce qui le rend précieux pour leur datation. Son nom rend hommage à George Perkins Merrill (1854 à 1929), conservateur au Smithsonian, qui le décrivit en 1915 dans des météorites.",
    ima: "espèce reconnue avant l'IMA (G), 1917",
  },
});

(function () {
  const classe = (n) => MIN_CLASSIF.find((x) => x.n === n);
  // classe I : la taénite rejoint les métaux natifs ; deux groupes pour les carbures et le phosphure
  const I = classe(1);
  const metaux = I.groupes.find((g) => g.code === "I.A");
  if (metaux && !metaux.mineraux.includes("taenite")) metaux.mineraux.splice(metaux.mineraux.indexOf("fer_natif") + 1, 0, "taenite");
  I.groupes.splice(1, 0, {
    nom: "Carbures et phosphures métalliques", code: "I.B", motif: "Des combinaisons de métal avec du carbone ou du phosphore : (Fe,Ni)₃C, (Fe,Ni)₃P",
    note: "Ces composés unissent des métaux à un non-métal et ne se forment qu'en l'absence d'oxygène : la plupart proviennent des noyaux d'astéroïdes, donc des météorites de fer. La cohénite correspond à la cémentite des aciers ; la schreibersite renferme presque tout le phosphore des fers météoritiques.",
    mineraux: ["cohenite", "schreibersite"],
  });
  I.groupes.push({
    nom: "Carbures non métalliques", code: "I.D", motif: "carbure de silicium SiC",
    note: "Mise au jour par Henri Moissan dans la météorite de Canyon Diablo, la moissanite reste presque aussi dure que le diamant et ne s'altère pas.",
    mineraux: ["moissanite"],
  });
  // classe II : troïlite et oldhamite avec les sulfures 1:1, daubréelite avec les sulfures pauvres en métal
  const II = classe(2);
  const un = II.groupes.find((g) => g.code === "II.C");
  if (un) ["troilite", "oldhamite"].forEach((id) => { if (!un.mineraux.includes(id)) un.mineraux.push(id); });
  const pauvres = II.groupes.find((g) => /^II\.D/.test(g.code));
  if (pauvres && !pauvres.mineraux.includes("daubreelite")) pauvres.mineraux.push("daubreelite");
  // classe VIII : la merrillite avec les phosphates anhydres
  const VIII = classe(8);
  const anh = VIII.groupes.find((g) => /^VIII\.A/.test(g.code));
  if (anh && !anh.mineraux.includes("merrillite")) anh.mineraux.push("merrillite");
})();
