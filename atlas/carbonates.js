// ============================================================
// CLASSE V — CARBONATES & NITRATES (Strunz V)
// Sources : Wikipédia FR/EN, Mindat, Strunz 10e éd.
// ============================================================

Object.assign(MINERAUX, {
  smithsonite: {
    nom: "Smithsonite", formule: "ZnCO₃", famille: "Carbonate — groupe de la calcite",
    systeme: "rhomboédrique", durete: 4.25, densite: 4.4,
    clivage: "parfait rhomboédrique", eclat: "vitreux à nacré, souvent en croûtes « peau d'orange »",
    couleurs: "gris, vert d'eau, bleu turquoise, jaune, rose",
    contexte: "Zone d'oxydation des gisements de zinc, en croûtes mamelonnées (« calamine ») ; Les Malines (Gard), Moresnet.",
    stabilite: 4, swatch: "#9fc4b5",
    devient: "Se dissout comme les carbonates ; le zinc part vers l'hydrozincite.",
    note: "La « calamine » des anciens fondeurs de laiton : broyée avec du cuivre et du charbon, elle donnait l'alliage doré bien avant qu'on sache isoler le zinc. Elle honore James Smithson, le chimiste qui la distingua… et dont le legs fonda la Smithsonian Institution. Les croûtes bleu-vert des Malines (Gard) rappellent que le Languedoc fut un pays du zinc.",
  },
  cerusite: {
    nom: "Cérusite", formule: "PbCO₃", famille: "Carbonate — groupe de l'aragonite",
    systeme: "orthorhombique", durete: 3.25, densite: 6.55,
    clivage: "net {110}", eclat: "adamantin — l'un des plus vifs des minéraux blancs",
    couleurs: "incolore, blanc, gris fumé",
    contexte: "Zone d'oxydation des filons de galène ; macles en étoiles et réseaux caractéristiques.",
    stabilite: 4, swatch: "#e6e2da",
    devient: "Stable dans les chapeaux oxydés ; se dissout très lentement.",
    note: "Le plomb blanc : son éclat adamantin et sa densité de 6,5 trahissent le métal sous la robe blanche. C'est la « céruse » des peintres — le blanc de plomb qui a empoisonné des générations d'artistes et de fabricantes, interdit en France en 1909 seulement. Ses macles en étoiles à six branches sont parmi les plus belles du règne minéral.",
  },
  strontianite: {
    nom: "Strontianite", formule: "SrCO₃", famille: "Carbonate — groupe de l'aragonite",
    systeme: "orthorhombique", durete: 3.5, densite: 3.75,
    clivage: "net {110}", eclat: "vitreux",
    couleurs: "blanc, gris, verdâtre pâle, jaunâtre",
    contexte: "Filons de basse température et géodes des calcaires ; Strontian (Écosse), Westphalie.",
    stabilite: 3, swatch: "#d5d8cc",
    devient: "Se dissout comme la calcite ; le strontium suit le calcium.",
    note: "Le village écossais de Strontian lui a donné son nom — et elle a donné le sien au strontium, seul élément chimique baptisé d'après un lieu du Royaume-Uni. Son métal brûle en rouge carmin : les feux d'artifice rouges, c'est elle. Le strontium remplace si bien le calcium qu'il s'invite dans nos os — ce qui fit du strontium-90 des essais nucléaires un traceur sinistre.",
  },
  witherite: {
    nom: "Withérite", formule: "BaCO₃", famille: "Carbonate — groupe de l'aragonite",
    systeme: "orthorhombique", durete: 3.25, densite: 4.3,
    clivage: "net {010}", eclat: "vitreux à résineux",
    couleurs: "blanc, gris, jaunâtre",
    contexte: "Filons de basse température à galène et barytine (Alston Moor, Angleterre) ; rare ailleurs.",
    stabilite: 3, swatch: "#dcd9ce",
    devient: "Se dissout lentement ; le baryum reprécipite volontiers en barytine.",
    note: "La cousine carbonatée de la barytine, décrite par William Withering — le médecin qui découvrit aussi les vertus cardiaques de la digitale. Contrairement à la barytine inerte, elle est soluble donc toxique : les fermiers anglais l'utilisaient comme mort-aux-rats. Presque tout le monde vient d'un seul district minier, Alston Moor.",
  },
  ankerite: {
    nom: "Ankérite", formule: "Ca(Fe,Mg)(CO₃)₂", famille: "Carbonate — groupe de la dolomite",
    systeme: "rhomboédrique", durete: 3.75, densite: 3.05,
    clivage: "parfait rhomboédrique", eclat: "vitreux à nacré",
    couleurs: "blanc jaunâtre → brun rouille en s'altérant",
    contexte: "Filons hydrothermaux (gangue classique de l'or), carbonates de fer sédimentaires, épontes carbonatées.",
    stabilite: 2, swatch: "#c2a276",
    devient: "Le fer s'oxyde : elle brunit en goethite dès l'affleurement.",
    note: "Une dolomite où le fer a pris la place du magnésium. C'est la gangue favorite des filons d'or (les quartz aurifères « rouillés » lui doivent leur teinte) et l'un des ciments des minerais de fer. Son truc d'identification : elle brunit à l'affleurement quand la dolomite reste claire — le fer ne sait pas rester discret.",
  },
  nitratine: {
    nom: "Nitratine (salpêtre du Chili)", formule: "NaNO₃", famille: "Nitrate",
    systeme: "rhomboédrique", durete: 1.75, densite: 2.26,
    clivage: "parfait rhomboédrique", eclat: "vitreux",
    couleurs: "incolore, blanc, grisâtre",
    contexte: "Croûtes des déserts hyper-arides (pluie < 5 % de l'ETP) — pratiquement un seul gisement au monde : le désert d'Atacama.",
    stabilite: 1, swatch: "#efe9dd",
    devient: "Hygroscopique et ultra-soluble : la moindre pluie l'emporte.",
    note: "Le « salpêtre du Chili » : des croûtes nitratées accumulées sur des millions d'années dans le seul endroit du monde où il ne pleut jamais assez pour les dissoudre. Engrais et explosifs du XIXe siècle en dépendaient au point qu'une guerre (du Pacifique, 1879) s'est jouée pour ces déserts — avant que la synthèse de l'ammoniac (Haber-Bosch, 1913) ne ruine le monopole.",
  },
  nitre: {
    nom: "Nitre (salpêtre)", formule: "KNO₃", famille: "Nitrate",
    systeme: "orthorhombique", durete: 2, densite: 2.1,
    clivage: "parfait {011}", eclat: "vitreux",
    couleurs: "blanc, incolore, en efflorescences aciculaires",
    contexte: "Efflorescences des murs humides, grottes sèches et sols riches en matière organique azotée.",
    stabilite: 1, swatch: "#eceadf",
    devient: "Ultra-soluble : dissous et reprécipité au gré de l'humidité.",
    note: "Le salpêtre « qui fleurit sur les murs » (sal petrae, sel de pierre) : les bactéries transforment l'azote organique en nitrate, qui remonte et cristallise en barbes blanches sur les murs des caves et des étables. Ingrédient clé de la poudre noire : sous la Révolution, les « salpêtriers » de l'An II grattaient officiellement caves et écuries de France pour armer la République.",
  },
});

(function () {
  const c = MIN_CLASSIF.find((x) => x.n === 5);
  c.groupes = [
    {
      nom: "Groupe de la calcite", code: "V.A", motif: "carbonates rhomboédriques (cations petits : Ca, Mg, Fe, Mn, Zn)",
      note: "La grande famille rhomboédrique : même structure, cations interchangeables — du calcium de la calcite au zinc de la smithsonite, en passant par le fer de la sidérite qui brunit tout ce qu'il touche.",
      mineraux: ["calcite", "magnesite", "siderite", "rhodochrosite", "smithsonite"],
    },
    {
      nom: "Groupe de l'aragonite", code: "V.A", motif: "carbonates orthorhombiques (cations gros : Ca, Sr, Ba, Pb)",
      note: "Quand le cation est trop gros pour la structure calcite, le carbonate bascule en orthorhombique : aragonite des coquillages, cérusite du plomb, strontianite des feux d'artifice rouges.",
      mineraux: ["aragonite", "cerusite", "strontianite", "witherite"],
    },
    {
      nom: "Groupe de la dolomite", code: "V.A", motif: "carbonates doubles ordonnés CaMg(CO₃)₂",
      note: "Un étage calcium, un étage magnésium (ou fer pour l'ankérite) : l'ordre alterné fait une famille à part — et des montagnes entières (les Dolomites).",
      mineraux: ["dolomite", "ankerite"],
    },
    {
      nom: "Carbonates de cuivre (à OH)", code: "V.B", motif: "carbonates hydroxylés Cu₂/Cu₃",
      note: "Les couleurs des chapeaux de cuivre : malachite verte et azurite bleue, le duo qui a guidé les prospecteurs — et pigmenté les peintres — depuis l'Antiquité.",
      mineraux: ["malachite", "azurite"],
    },
    {
      nom: "Nitrates", code: "V.N", motif: "NO₃⁻",
      note: "Les sels de l'azote : si solubles qu'ils n'existent que là où il ne pleut pas (Atacama) ou le temps d'une efflorescence sur un mur de cave. Engrais, explosifs, et une guerre du Pacifique.",
      mineraux: ["nitratine", "nitre"],
    },
  ];
})();
