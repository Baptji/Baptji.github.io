// ============================================================
// CLASSE V — CARBONATES & NITRATES (Strunz V)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  smithsonite: {
    nom: "Smithsonite", formule: "ZnCO₃", famille: "Carbonate : groupe de la calcite",
    systeme: "rhomboédrique", durete: 4.25, densite: 4.4,
    clivage: "parfait rhomboédrique", eclat: "vitreux à nacré, souvent en croûtes « peau d'orange »",
    couleurs: "gris, vert d'eau, bleu turquoise, jaune, rose",
    contexte: "Croûtes mamelonnées de la zone d'oxydation des gisements de zinc, la « calamine » se rencontre aux Malines (Gard) et à Moresnet.",
    stabilite: 4, swatch: "#9fc4b5",
    devient: "Il se dissout comme les carbonates ; le zinc gagne alors l'hydrozincite.",
    note: "Les fondeurs de laiton de l'Antiquité employaient la « calamine » : broyée avec du cuivre et du charbon, elle produisait l'alliage doré avant qu'on sache isoler le zinc. James Smithson, qui la distingua, a laissé un legs à l'origine de la Smithsonian Institution ; les croûtes bleu-vert des Malines (Gard) rappellent le passé zincifère du Languedoc.",
  },
  cerusite: {
    nom: "Cérusite", formule: "PbCO₃", famille: "Carbonate : groupe de l'aragonite",
    systeme: "orthorhombique", durete: 3.25, densite: 6.55,
    clivage: "net {110}", eclat: "adamantin, l'un des plus vifs des minéraux blancs",
    couleurs: "incolore, blanc, gris fumé",
    contexte: "Elle se forme dans la zone oxydée des filons de galène ; ses macles en étoiles et en réseaux la distinguent.",
    stabilite: 4, swatch: "#e6e2da",
    devient: "Très lente à se dissoudre, elle persiste dans les chapeaux oxydés.",
    note: "Le plomb blanc, reconnaissable à son éclat adamantin et à sa densité de 6,5, se cache sous une robe blanche. C'est la « céruse » des peintres, un blanc de plomb qui a empoisonné des générations d'artistes et d'ouvriers ; elle ne fut interdite en France qu'en 1909. Ses macles en étoiles à six branches comptent parmi les plus belles du règne minéral.",
  },
  strontianite: {
    nom: "Strontianite", formule: "SrCO₃", famille: "Carbonate : groupe de l'aragonite",
    systeme: "orthorhombique", durete: 3.5, densite: 3.75,
    clivage: "net {110}", eclat: "vitreux",
    couleurs: "blanc, gris, verdâtre pâle, jaunâtre",
    contexte: "On la rencontre dans les filons de basse température et dans les géodes des calcaires, à Strontian (Écosse) et en Westphalie.",
    stabilite: 3, swatch: "#d5d8cc",
    devient: "Sa dissolution suit celle de la calcite, le strontium accompagnant le calcium.",
    note: "C'est au village écossais de Strontian que le minéral doit son nom, et l'élément chimique le sien : le strontium est le seul à porter le nom d'un lieu du Royaume-Uni. Son métal brûle d'un rouge carmin, d'où les feux d'artifice rouges. Chimiquement proche du calcium, il s'incorpore aux os ; le strontium-90 des essais nucléaires en a fait un traceur redouté.",
  },
  witherite: {
    nom: "Withérite", formule: "BaCO₃", famille: "Carbonate : groupe de l'aragonite",
    systeme: "orthorhombique", durete: 3.25, densite: 4.3,
    clivage: "net {010}", eclat: "vitreux à résineux",
    couleurs: "blanc, gris, jaunâtre",
    contexte: "Elle forme des filons de basse température associés à la galène et à la barytine (Alston Moor, Angleterre) ; elle reste rare ailleurs.",
    stabilite: 3, swatch: "#dcd9ce",
    devient: "Elle se dissout lentement ; le baryum se reprécipite volontiers sous forme de barytine.",
    note: "Cousine carbonatée de la barytine, elle fut décrite par William Withering, le médecin qui découvrit aussi les vertus cardiaques de la digitale. Soluble, donc toxique, contrairement à la barytine inerte, elle servit aux fermiers anglais de mort-aux-rats. Presque tous les échantillons proviennent d'un seul district minier, Alston Moor.",
  },
  ankerite: {
    nom: "Ankérite", formule: "Ca(Fe,Mg)(CO₃)₂", famille: "Carbonate : groupe de la dolomite",
    systeme: "rhomboédrique", durete: 3.75, densite: 3.05,
    clivage: "parfait rhomboédrique", eclat: "vitreux à nacré",
    couleurs: "blanc jaunâtre → brun rouille en s'altérant",
    contexte: "On la trouve dans les filons hydrothermaux, où elle accompagne l'or, dans les carbonates de fer sédimentaires et dans les épontes carbonatées.",
    stabilite: 2, swatch: "#c2a276",
    devient: "Dès l'affleurement, l'oxydation du fer transforme ce minéral en goethite, qui le fait brunir.",
    note: "Il s'agit d'une dolomite dont le fer occupe la place du magnésium. Elle forme la gangue préférée des filons d'or : les quartz aurifères « rouillés » lui doivent leur couleur. Elle sert aussi de ciment aux minerais de fer. Son signe distinctif est un brunissement en surface, alors que la dolomite voisine demeure claire.",
  },
  nitratine: {
    nom: "Nitratine (salpêtre du Chili)", formule: "NaNO₃", famille: "Nitrate",
    systeme: "rhomboédrique", durete: 1.75, densite: 2.26,
    clivage: "parfait rhomboédrique", eclat: "vitreux",
    couleurs: "incolore, blanc, grisâtre",
    contexte: "Ces croûtes se forment dans les déserts hyperarides (pluie < 5 % de l'ETP) ; un seul gisement mondial est connu : le désert d'Atacama.",
    stabilite: 1, swatch: "#efe9dd",
    devient: "Hygroscopique et extrêmement soluble, elle disparaît au moindre épisode pluvieux.",
    note: "Le « salpêtre du Chili » forme des croûtes de nitrates accumulées pendant des millions d'années dans le seul endroit du globe où la pluie ne suffit jamais à les dissoudre. Les engrais et explosifs du XIXe siècle en dépendaient si fortement que la guerre du Pacifique (1879) s'y joua ; la synthèse de l'ammoniac (Haber-Bosch, 1913) a fini par ruiner ce monopole.",
  },
  nitre: {
    nom: "Nitre (salpêtre)", formule: "KNO₃", famille: "Nitrate",
    systeme: "orthorhombique", durete: 2, densite: 2.1,
    clivage: "parfait {011}", eclat: "vitreux",
    couleurs: "blanc, incolore, en efflorescences aciculaires",
    contexte: "On la trouve dans les efflorescences des murs humides, dans les grottes sèches et les sols riches en matière organique azotée.",
    stabilite: 1, swatch: "#eceadf",
    devient: "Ultra-soluble, elle se dissout puis se reprécipite au gré de l'humidité.",
    note: "Le salpêtre, qui fleurit sur les murs (sal petrae, sel de pierre), provient de l'oxydation bactérienne de l'azote organique : le nitrate remonte, puis cristallise en barbes blanches sur les parois des caves et des étables. Composant majeur de la poudre noire, il conduisit les « salpêtriers » de l'An II à gratter officiellement caves et écuries pour armer la République.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 5);
  c.groupes = [
    {
      nom: "Groupe de la calcite", code: "V.A", motif: "carbonates rhomboédriques (cations petits : Ca, Mg, Fe, Mn, Zn)",
      note: "Les minéraux de ce groupe rhomboédrique partagent la même structure, et leurs cations peuvent s'échanger : du calcium de la calcite au zinc de la smithsonite, en passant par le fer de la sidérite, qui brunit tout ce qu'il touche.",
      mineraux: ["calcite", "magnesite", "siderite", "rhodochrosite", "smithsonite"],
    },
    {
      nom: "Groupe de l'aragonite", code: "V.A", motif: "carbonates orthorhombiques (cations gros : Ca, Sr, Ba, Pb)",
      note: "Quand le cation dépasse la taille admissible par la calcite, le carbonate adopte une maille orthorhombique : c'est l'aragonite des coquillages, la cérusite du plomb ou la strontianite des feux d'artifice rouges.",
      mineraux: ["aragonite", "cerusite", "strontianite", "witherite"],
    },
    {
      nom: "Groupe de la dolomite", code: "V.A", motif: "carbonates doubles ordonnés CaMg(CO₃)₂",
      note: "Une famille à part se dessine avec un étage calcium et un étage magnésium (ou fer, pour l'ankérite) : cet ordre alterné a bâti des montagnes entières, les Dolomites.",
      mineraux: ["dolomite", "ankerite"],
    },
    {
      nom: "Carbonates de cuivre (à OH)", code: "V.B", motif: "carbonates hydroxylés Cu₂/Cu₃",
      note: "Les teintes des chapeaux de cuivre : la malachite verte et l'azurite bleue, duo qui a guidé les prospecteurs et coloré la palette des peintres depuis l'Antiquité.",
      mineraux: ["malachite", "azurite"],
    },
    {
      nom: "Nitrates", code: "V.N", motif: "NO₃⁻",
      note: "Trop solubles pour survivre ailleurs, les sels de l'azote ne subsistent qu'au désert d'Atacama, ou brièvement sur un mur de cave à l'occasion d'une efflorescence. Ils ont nourri engrais, explosifs et conflits.",
      mineraux: ["nitratine", "nitre"],
    },
  ];
})();
