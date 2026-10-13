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
    nom: "Taénite", formule: "γ-(Ni,Fe)", famille: "Élément natif — alliage fer-nickel",
    systeme: "cubique", durete: 5.25, densite: 8.0,
    clivage: "aucun (malléable)", eclat: "métallique",
    couleurs: "blanc grisâtre à blanc d'argent",
    contexte: "Météorites de fer, pallasites, mésosidérites et grains de métal des chondrites : en fines bandes qui bordent les lamelles de kamacite, et dans la plessite.",
    stabilite: 4, swatch: "#b9b8b1",
    devient: "Rouille plus lentement que la kamacite, plus pauvre en nickel : oxyhydroxydes de fer (goethite, akaganéite), le nickel part avec l'eau. Sur une météorite de fer attaquée par les intempéries, les bandes de taénite restent en relief.",
    note: "L'alliage fer-nickel riche en nickel (de 20 à plus de 50 %) : son nom vient du grec <i>tainia</i>, « ruban », parce qu'on la voit en minces rubans brillants sur les tranches polies des météorites. C'est elle qui, en refroidissant de quelques degrés par million d'années, rejette les lamelles de kamacite des figures de Widmanstätten. Refroidie plus lentement encore, sous 320 °C, elle range ses atomes de fer et de nickel en plans alternés : la tétrataénite, que l'on étudie aujourd'hui pour fabriquer des aimants sans terres rares.",
    ima: "espèce reconnue avant l'IMA (G), 1861",
  },
  cohenite: {
    nom: "Cohénite", formule: "(Fe,Ni,Co)₃C", famille: "Élément natif — carbure métallique",
    systeme: "orthorhombique", durete: 5.75, densite: 7.4,
    clivage: "bon selon {100}, {010} et {001}", eclat: "métallique",
    couleurs: "blanc d'étain, se ternissant en jaune bronze ou doré",
    contexte: "Météorites de fer du groupe IAB, uréilites et quelques chondrites à enstatite ; sur Terre, dans le fer natif des basaltes de l'île de Disko (Groenland), où une lave a traversé des couches de charbon.",
    stabilite: 3, swatch: "#b6ad94",
    devient: "Instable à basse pression : elle se décompose très lentement en fer et en graphite. À l'air humide, son fer rouille.",
    note: "La cohénite est la cémentite des métallurgistes : le carbure de fer Fe₃C qui durcit les aciers et la fonte. Les météorites en contiennent des cristaux de plusieurs millimètres, nés quand le noyau d'un astéroïde, riche en carbone, a refroidi. Elle porte le nom d'Emil Cohen (1842–1905), minéralogiste allemand qui consacra la fin de sa vie aux météorites. Elle est attirée par l'aimant.",
    ima: "espèce reconnue avant l'IMA (G), 1889",
  },
  schreibersite: {
    nom: "Schreibersite", formule: "(Fe,Ni)₃P", famille: "Élément natif — phosphure métallique",
    systeme: "quadratique", durete: 6.75, densite: 7.1,
    clivage: "parfait selon {001}", eclat: "métallique",
    couleurs: "blanc d'argent à blanc d'étain, se ternissant en jaune laiton ou brun",
    contexte: "Météorites de fer (plaques de plusieurs centimètres, fines aiguilles appelées rhabdites), pallasites, mésosidérites, chondrites à enstatite ; sur Terre, dans le fer natif de Disko.",
    stabilite: 2, swatch: "#c3bd9e",
    devient: "Au contact de l'eau, elle s'oxyde en oxydes de fer et libère du phosphore sous des formes très réactives (phosphites, puis phosphates).",
    note: "Presque tout le phosphore des météorites de fer est là. Les chimistes s'y intéressent depuis que Matthew Pasek et Dante Lauretta (2005) ont montré qu'en se corrodant dans l'eau, elle livre des composés du phosphore capables de se lier aux molécules organiques : les météorites tombées sur la jeune Terre auraient pu fournir le phosphore de l'ADN et de l'ATP. Elle honore Carl von Schreibers (1775–1852), directeur du cabinet d'histoire naturelle de Vienne, qui étudia les météorites.",
    ima: "espèce reconnue avant l'IMA (G), 1847",
  },
  moissanite: {
    nom: "Moissanite", formule: "SiC", famille: "Élément natif — carbure non métallique",
    systeme: "hexagonal (polytype 6H, le plus courant)", durete: 9.5, densite: 3.22,
    clivage: "indistinct selon {0001}", eclat: "adamantin à métallique",
    couleurs: "vert, bleu, noir ; incolore quand elle est très pure",
    contexte: "Grains microscopiques dans les chondrites, plus vieux que le Soleil ; résidus de la météorite de Canyon Diablo (Arizona) ; très rares grains dans les kimberlites et quelques roches du manteau.",
    stabilite: 10, swatch: "#5e8f86",
    devient: "Rien : inaltérable à la surface de la Terre, elle se retrouve intacte dans les résidus d'attaque des météorites à l'acide.",
    note: "En 1893, le chimiste français Henri Moissan, futur prix Nobel (1906), dissout un fragment de la météorite de Canyon Diablo et trouve de minuscules cristaux qu'il prend d'abord pour du diamant : c'était du carbure de silicium, que l'on fabriquait déjà comme abrasif (carborundum). Le minéral prend son nom en 1905. Une partie des grains des chondrites s'est formée dans l'atmosphère d'étoiles géantes riches en carbone, avant la naissance du Soleil : leurs atomes portent la signature de ces étoiles. La moissanite des bijoux est synthétique.",
    ima: "espèce reconnue avant l'IMA (G), 1905",
  },
  troilite: {
    nom: "Troïlite", formule: "FeS", famille: "Sulfure 1:1 (groupe de la nickéline)",
    systeme: "hexagonal", durete: 3.75, densite: 4.7,
    clivage: "aucun (séparation selon {0001})", eclat: "métallique",
    couleurs: "brun bronze pâle à gris, se ternissant vite",
    contexte: "Presque toutes les météorites (nodules dans les fers, grains dans les chondrites), les roches lunaires ; très rare sur Terre (serpentinites, fer natif de Disko).",
    stabilite: 1, swatch: "#9d8358",
    devient: "S'oxyde vite à l'air humide : oxydes et hydroxydes de fer, et le soufre part en sulfate (gypse s'il y a du calcium).",
    note: "Le sulfure de fer « exact », FeS, sans le fer manquant de la pyrrhotite terrestre : il se forme là où l'oxygène manque, ce qui est le cas des météorites et de la Lune. Il porte le nom de Domenico Troili, jésuite qui décrivit en 1766 une pierre tombée à Albareto, près de Modène, et y remarqua ce sulfure — à une époque où les savants refusaient encore de croire aux pierres tombées du ciel. Les lames de troïlite des météorites de fer sont appelées lamelles de Reichenbach.",
    ima: "espèce reconnue avant l'IMA (G), 1863",
  },
  oldhamite: {
    nom: "Oldhamite", formule: "CaS", famille: "Sulfure 1:1 (groupe de la galène)",
    systeme: "cubique", durete: 4, densite: 2.58,
    clivage: "parfait selon {001} (cubique)", eclat: "vitreux à gras",
    couleurs: "brun marron pâle ; incolore quand il est pur",
    contexte: "Chondrites à enstatite et aubrites ; sur Terre, terrils de charbon en combustion et roches cuites par des feux de charbon.",
    stabilite: 1, swatch: "#b8946a",
    devient: "Se dissout dans l'eau en dégageant du sulfure d'hydrogène (odeur d'œuf pourri) ; il reste du gypse ou de la calcite.",
    note: "Un sulfure de calcium : il ne peut naître que sans oxygène et sans eau, car le calcium préfère d'ordinaire s'unir à l'oxygène (calcite, gypse, plagioclase). Sa présence dit que les chondrites à enstatite et les aubrites se sont formées dans un milieu extraordinairement réduit, près du Soleil. Décrit dans la météorite de Bustee (Inde, 1852), il honore Thomas Oldham (1816–1878), premier directeur du Service géologique de l'Inde.",
    ima: "espèce reconnue avant l'IMA (G), 1870",
  },
  daubreelite: {
    nom: "Daubréelite", formule: "Fe²⁺Cr₂S₄", famille: "Sulfure (groupe de la linnéite, spinelle soufré)",
    systeme: "cubique", durete: 4.75, densite: 3.8,
    clivage: "distinct selon {001}", eclat: "métallique",
    couleurs: "noir",
    contexte: "Météorites de fer (lames dans la troïlite) et chondrites à enstatite ; presque inconnue sur Terre.",
    stabilite: 2, swatch: "#2f2e30",
    devient: "S'oxyde : le fer rouille et le chrome reste sur place sous forme d'oxyde.",
    note: "Un spinelle où le soufre remplace l'oxygène : le chrome, qui dans les roches terrestres forme la chromite (un oxyde), se lie ici au soufre faute d'oxygène. Elle porte le nom de Gabriel Auguste Daubrée (1814–1896), géologue français, professeur au Muséum d'histoire naturelle de Paris, qui fit fondre et recristalliser des roches pour reproduire les météorites et proposa en 1867 l'une de leurs premières classifications, selon la part de fer.",
    ima: "espèce reconnue avant l'IMA (G), 1876",
  },
  merrillite: {
    nom: "Merrillite", formule: "Ca₉NaMg(PO₄)₇", famille: "Phosphate anhydre (groupe de la whitlockite)",
    systeme: "trigonal", durete: 5, densite: 3.1,
    clivage: "aucun", eclat: "vitreux",
    couleurs: "incolore à blanc",
    contexte: "Presque toutes les classes de météorites (chondrites, eucrites, météorites martiennes, pallasites) et les roches lunaires.",
    stabilite: 5, swatch: "#e9e4d8",
    devient: "Se dissout lentement dans l'eau acide ; le phosphate repart en apatite ou en phosphates secondaires.",
    note: "Le principal phosphate des météorites, cousin sec de la whitlockite terrestre : il lui manque l'hydrogène, que les astéroïdes n'avaient pas. Dans les roches lunaires et martiennes, il concentre les terres rares et une grande partie de l'uranium et du thorium, ce qui en fait un minéral clé pour dater ces roches. Il honore George Perkins Merrill (1854–1929), conservateur au Smithsonian, qui le décrivit dans des météorites en 1915.",
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
    nom: "Carbures et phosphures métalliques", code: "I.B", motif: "métal + carbone ou phosphore ((Fe,Ni)₃C, (Fe,Ni)₃P)",
    note: "Des composés de métaux et d'un non-métal qui ne se forment que sans oxygène : presque tous viennent des noyaux d'astéroïdes, c'est-à-dire des météorites de fer. La cohénite est la cémentite des aciers ; la schreibersite contient presque tout le phosphore des fers météoritiques.",
    mineraux: ["cohenite", "schreibersite"],
  });
  I.groupes.push({
    nom: "Carbures non métalliques", code: "I.D", motif: "carbure de silicium SiC",
    note: "La moissanite, découverte par Henri Moissan dans la météorite de Canyon Diablo : presque aussi dure que le diamant, et inaltérable.",
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
