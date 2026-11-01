// ============================================================
// ATLAS SOL — base de données des roches
// ------------------------------------------------------------
// AVERTISSEMENT : les vitesses d'altération et les bilans de
// masse sont des ORDRES DE GRANDEUR tirés de la littérature
// (climat tempéré type France). Ils varient fortement avec le
// climat, la fracturation, la végétation et la composition
// exacte de la roche. Voir la section « À propos des données ».
// ============================================================

// --- Catégories de produits d'altération (pour 1 kg de roche) ---
const PRODUITS_META = [
  { id: "sable",  nom: "Sable (> 63 µm)",        light: "#eda100", dark: "#c98500" },
  { id: "limon",  nom: "Limons (2 à 63 µm)",        light: "#eb6834", dark: "#d95926" },
  { id: "argile", nom: "Argiles (< 2 µm)",        light: "#e87ba4", dark: "#d55181" },
  { id: "oxydes", nom: "Oxydes / hydroxydes Fe-Al", light: "#e34948", dark: "#e66767" },
  { id: "dissous", nom: "Dissous (ions emportés par l'eau)", light: "#2a78d6", dark: "#3987e5" },
  { id: "autre",  nom: "Autre (CO₂, matière organique)", light: "#1baf7a", dark: "#199e70" },
];

// Échelle des temps géologiques : voir echelle-temps.js (charte ICS au niveau des étages).

const CATEGORIES = {
  sedimentaire:  { nom: "Sédimentaire",  light: "#2a78d6", dark: "#3987e5" },
  magmatique:    { nom: "Magmatique",    light: "#1baf7a", dark: "#199e70" },
  metamorphique: { nom: "Métamorphique", light: "#4a3aa7", dark: "#9085e9" },
};

// facilite : 1 = extrêmement résistante … 5 = très facilement altérable
const FACILITE_LABELS = {
  1: "Extrêmement résistante",
  2: "Résistante",
  3: "Moyennement altérable",
  4: "Facilement altérable",
  5: "Très facilement altérable",
};

// vitesses en mm/an (recul du front d'altération ou dissolution surfacique)
// produits en grammes pour 1 kg de roche entièrement altérée
const ROCHES = [
  // ================= SÉDIMENTAIRES =================
  {
    id: "calcaire", nom: "Calcaire", categorie: "sedimentaire", sousType: "carbonatée",
    swatch: "#d8cfb8", densite: 2600,
    description: "Roche sédimentaire formée presque entièrement de calcite (CaCO₃). Elle se dépose surtout en mer peu profonde, par accumulation de coquilles, de boues carbonatées ou de récifs. Elle constitue le substrat des karsts français, dont les gorges, les causses, les falaises, les grottes et les gouffres résultent de sa dissolution par des eaux faiblement acides.",
    mineralogie: "Calcite (CaCO₃) à hauteur de 90 à 99 %, accompagnée éventuellement de quartz détritique, d'argiles et d'oxydes de fer, responsables des teintes ocre.",
    varietes: [
      { nom: "calcaire oolithique (oolithe)", note: "Cette roche est formée d'ooïdes sphériques à croissance concentrique : c'est le cas de l'oolithe blanche du Bathonien de Bourgogne. La pierre de Paris, elle, n'est pas oolithique : c'est un calcaire à débris de coquilles et à milioles." },
      { nom: "calcaire récifal (urgonien)", note: "Roche bâtie par des récifs : c'est le cas du Vercors, des Calanques et des grandes falaises." },
      { nom: "calcaire coquillier / lumachelle", note: "Très riche en coquilles, à l'image des faluns de Touraine et des calcaires à gryphées." },
      { nom: "calcaire bioclastique / à entroques", note: "Constitué de débris d'organismes, tels que crinoïdes et algues calcaires." },
      { nom: "calcaire lacustre", note: "déposé en lac : Limagne, Beauce." },
      { nom: "stromatolithe", note: "Calcaire d'origine microbienne, à lits très fins, figurant parmi les plus anciennes traces de vie." },
      { nom: "calcirudite / calcarénite / calcisiltite / calcilutite", note: "Dans la classification de Grabau, ces calcaires se distinguent par la taille de leurs grains : débris supérieurs à 2 mm, sable calcaire (0,063 à 2 mm), silt ou boue fine." },
      { nom: "microbialites : thrombolite, dendrolite, léiolite", note: "Calcaires édifiés par des films de bactéries, qui forment des lamines (stromatolithe, figuré ci-dessus), des grumeaux (thrombolite), des buissons (dendrolite) ou une texture sans structure visible (léiolite)." },
      { nom: "encroûtement algaire", note: "Des croûtes d'algues rouges calcaires (corallinacées) recouvrent le fond ou entourent des galets, qui deviennent alors des rhodolithes ; le maërl en représente la forme non fixée." }
    ],
    regions: [
      { nom: "Jura (lapiaz, reculées)", lat: 46.7, lng: 5.9 },
      { nom: "Grands Causses (gorges du Tarn)", lat: 44.3, lng: 3.3 },
      { nom: "Côte des vins de Bourgogne", lat: 47.2, lng: 4.9 },
      { nom: "Calanques de Marseille (Urgonien)", lat: 43.21, lng: 5.45 },
      { nom: "Bassin parisien (Lutétien, pierre de Paris)", lat: 48.85, lng: 2.35 },
      { nom: "Vercors (Urgonien)", lat: 45.0, lng: 5.4 },
    ],
    ages: [
      { de: 201.4, a: 143.1, label: "Jurassique : Jura, Causses, Bourgogne" },
      { de: 127, a: 120, label: "Urgonien (Hauterivien terminal à Aptien inférieur) : Vercors, Calanques" },
      { de: 48.07, a: 41.03, label: "Lutétien : pierre de Paris" },
    ],
    alteration: {
      vmin: 0.01, vmax: 0.1, facilite: 3,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.018, cas: "Karst de Trieste, roche à nu (dissolution superficielle)", src: "Furlani et Cucchi 2009, micro-érosimètre" },
        { v: 0.03, cas: "Provence, plateau du Luberon, sous climat méditerranéen", src: "Thomas et al. 2017, chlore 36", ref: true },
        { v: 0.115, cas: "Jura fortement arrosé : bassins versants, dissolution sous le sol incluse", src: "Wittmann et al. 2024, béryllium 10 : 300 t/km²/an ÷ 2,6 t/m³" }
      ],
      sources: [
        "Thomas F., Godard V., Bellier O. et al. (2017), « Morphological controls on the dynamics of carbonate landscapes under a mediterranean climate », Terra Nova 29 : 173–182 (chlore 36)",
        "Thomas F., Godard V., Bellier O. et al. (2018), « Limited influence of climatic gradients on the denudation of a Mediterranean carbonate landscape », Geomorphology 316 : 44–58",
        "Furlani S., Cucchi F., Forti F. et Rossi A. (2009), « Comparison between coastal and inland Karst limestone lowering rates in the northeastern Adriatic Region (Italy and Croatia) », Geomorphology 104 : 73–81 (micro-érosimètre, jusqu'à 26 ans de mesures)",
        "Wittmann H., Bouchez J., Calmels D., Gaillardet J. et al. (2024), « Denudation and weathering rates of carbonate landscapes from meteoric ¹⁰Be/⁹Be ratios », J. Geophys. Res. Earth Surface 129, doi 10.1029/2024JF007638 (Jura, béryllium 10 météorique)",
        "Ryb U., Matmon A., Erel Y. et al. (2014), « Styles and rates of long-term denudation in carbonate terrains under a Mediterranean to hyper-arid climatic gradient », Earth Planet. Sci. Lett. 406 : 142–152 (chlore 36)"
      ],
      mecanisme: "Dissolution sous l'action de l'eau chargée en CO₂ (acide carbonique) : CaCO₃ + H₂O + CO₂ → Ca²⁺ + 2 HCO₃⁻. Elle ne se désagrège pas sur place : la roche se dissout dans l'eau et ne laisse qu'un résidu insoluble, en faible quantité.",
      climat: "Le débit d'eau qui traverse la roche gouverne la vitesse. Au Karst de Trieste, une roche nue perd 1,8 mm en 100 ans selon le micro-érosimètre. Le chlore 36 indique 3 mm en 100 ans sur le plateau du Luberon, et 3 à 6 mm dans dix massifs provençaux, sans lien avec les précipitations. Dans le Jura, très arrosé, la dissolution sous-sol comprise atteint environ 11 mm en 100 ans. Dans le désert de Judée, avec moins de 100 mm de pluie, la perte se réduit à 0,1 à 0,3 mm en 100 ans.",
    },
    produits: { sable: 5, limon: 15, argile: 25, oxydes: 5, dissous: 950 },
    produitsNote: "Environ 95 % de la masse passe en solution sous forme d'ions Ca²⁺ et HCO₃⁻, exportés vers les rivières et l'océan. Le résidu insoluble (~2 à 5 %) s'accumule au fil de millions d'années pour former les argiles rouges de décalcification (« terra rossa ») des plateaux karstiques.",
    usages: "Pierre de taille, ciment, chaux, granulats, amendement agricole.",
    wikipedia: "https://fr.wikipedia.org/wiki/Calcaire",
  },
  {
    id: "travertin", nom: "Travertin et tuf calcaire", categorie: "sedimentaire", sousType: "chimique (concrétion carbonatée)",
    swatch: "#e0d6bc", densite: 2300,
    codes: [
      { code: "U", sens: " : tufs calcaires et travertins quaternaires (notés U suivi du nombre de feuilles ; parfois réunis avec Fz)" },
    ],
    description: "Calcaire de source : lorsqu'une eau chargée en calcaire libère son CO₂ (à une résurgence, au pied d'une cascade ou d'un barrage de tuf), la calcite précipite et encroûte mousses, feuilles et brindilles. Le tuf, léger et poreux, naît des sources froides des massifs calcaires (Jura), dont l'eau doit son CO₂ au sol ; le travertin, plus dense et zoné, entoure des sources chaudes ou gazeuses dont le CO₂ vient des profondeurs (Auvergne, Tivoli).",
    mineralogie: "Calcite, parfois associée à de l'aragonite, qui conserve des empreintes de végétaux et de mousses ; la roche est souvent très poreuse.",
    mineraux: [["calcite", 92], ["aragonite", 3], ["quartz", 2], ["goethite", 2], ["matorg", 1]],
    argiles: ["illite"],
    argilesNote: "Les argiles sont presque absentes : le tuf encroûte des végétaux, dont il conserve des empreintes et non des minéraux. La faible quantité d'illite provient des eaux de la source.",
    varietes: [
      { nom: "tuf calcaire (travertin poreux)", note: "De texture spongieuse et incrustante, il se rencontre au pied des cascades et sur les pentes des sources." },
      { nom: "travertin massif (onyx calcaire)", note: "De texture dense et zonée, il est poli pour servir de pierre ornementale." },
      { nom: "geysérite", note: "Équivalent siliceux du travertin : l'opale se dépose dans les sources chaudes et les geysers d'Islande ou de Yellowstone. Il n'existe aucun dépôt actif en France." }
    ],
    regions: [
      { nom: "Travertins de Sézanne (Marne)", lat: 48.72, lng: 3.72 },
      { nom: "Cascades pétrifiantes (Auvergne, Jura)", lat: 45.60, lng: 2.90 },
      { nom: "Sud-Est (barrages de tuf)", lat: 43.90, lng: 6.20 },
    ],
    ages: [{ de: 59.24, a: 56.0, label: "Thanétien : travertin de Sézanne" }, { de: 2.58, a: 0, label: "Surtout quaternaire à actuel (encore en formation)" }],
    alteration: {
      vmin: 0.02, vmax: 0.3, facilite: 3,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.012, cas: "Sous climat méditerranéen, Montpellier recueille 667 mm de précipitations, dont 125 mm gagnent le sous-sol.", src: "dissolution à saturation, masse volumique 2,3", calcul: "carbonate" },
        { v: 0.0199, cas: "Auvergne : Clermont-Ferrand reçoit 700 mm de pluie, dont 208 mm pénètrent le sol.", src: "dissolution à saturation, masse volumique 2,3", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Comme pour le calcaire, la dissolution est assurée par les eaux chargées en CO₂ (CaCO₃ + H₂O + CO₂ ⇌ Ca²⁺ + 2 HCO₃⁻). Elle se forme et se dissout selon les variations du CO₂.",
      climat: "Aucune donnée publiée ne porte sur un travertin français. Le calcul aboutit à 1,2 mm en 100 ans sous le climat de Montpellier et à 2 mm sous celui de Clermont-Ferrand. Sa porosité accélère la perte de volume, plus forte que pour un calcaire massif soumis à la même eau. Ailleurs, la roche se régénère : à l'Holocène, le bilan des barrages de tuf penche souvent vers le gain.",
    },
    produits: { sable: 10, limon: 20, argile: 30, oxydes: 10, dissous: 930 },
    produitsNote: "Comme pour le calcaire, près de 93 % de la masse repart en solution sous forme de Ca²⁺ et de HCO₃⁻. Le faible résidu, formé d'argiles et d'oxydes qui colorent la roche ainsi que de débris végétaux encroûtés, se mêle aux sols des fonds de vallon.",
    usages: "Pierre de construction et d'ornement (le Colisée est bâti en travertin), employée aussi en dallage.",
    wikipedia: "https://fr.wikipedia.org/wiki/Travertin",
  },
  {
    id: "craie", nom: "Craie", categorie: "sedimentaire", sousType: "carbonatée",
    swatch: "#efeee6", densite: 1800,
    description: "Calcaire crayeux, très pur et poreux, déposé au Crétacé supérieur à partir de coccolithes, squelettes d'algues microscopiques, dans une mer chaude qui couvrait le nord de la France. Il renferme souvent des rognons de silex.",
    mineralogie: "Calcite (coccolithes) 95 à 99 %, silex (SiO₂) en rognons, traces d'argiles.",
    varietes: [
      { nom: "craie à silex", note: "Variété la plus répandue : les rognons de silex, noirs et disposés en lits, dominent sur les plateaux de Champagne et de Picardie." },
      { nom: "craie glauconieuse", note: "Située au pied de la série (Cénomanien), cette couche est plus argileuse et tire vers le vert." },
      { nom: "craie marneuse (chalk marl des Anglais)", note: "Plus tendre et grise, elle renferme davantage d'argile et possède une pureté moindre." },
    ],
    regions: [
      { nom: "Falaises d'Étretat (Pays de Caux)", lat: 49.71, lng: 0.20 },
      { nom: "Champagne (caves de Reims et d'Épernay)", lat: 49.05, lng: 4.0 },
      { nom: "Picardie : Somme", lat: 49.9, lng: 2.3 },
      { nom: "Cap Blanc-Nez (Côte d'Opale)", lat: 50.92, lng: 1.71 },
    ],
    ages: [{ de: 100.5, a: 72.2, label: "Crétacé supérieur (Cénomanien → Campanien)" }],
    alteration: {
      vmin: 0.02, vmax: 0.15, facilite: 4,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0199, cas: "Bassin parisien : Paris enregistre 668 mm de pluie, dont 165 mm s'infiltrent.", src: "dissolution à saturation, masse volumique 1,8", calcul: "carbonate", ref: true },
        { v: 0.0644, cas: "Ouest très arrosé : Brest reçoit 1 118 mm de pluie, dont 534 mm pénètrent le sol.", src: "dissolution à saturation, masse volumique 1,8", calcul: "carbonate" }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "La dissolution est la même que pour le calcaire, mais elle est accélérée par une porosité pouvant atteindre 40 %, qui multiplie les surfaces de contact avec l'eau. Le gel la fait aussi éclater aisément (gélifraction).",
      climat: "Aucune mesure publiée n'établit l'abaissement d'une surface de craie en France. Le calcul donne 2 mm en 100 ans sous la pluie de Paris et 6,4 mm sous celle de Brest. Pour une même eau, la craie perd 1,5 fois plus d'épaisseur qu'un calcaire massif (masses volumiques de 1,8 contre 2,6). Les falaises normandes reculent de 10 à 30 cm par an, mais ce sont les vagues, et non l'altération chimique, qui dominent sur ce littoral.",
    },
    produits: { sable: 3, limon: 7, argile: 12, oxydes: 3, dissous: 975 },
    produitsNote: "La quasi-totalité se dissout. Le résidu s'accumule au sommet des plateaux crayeux pour former l'« argile à silex », une terre brun-rouge parsemée de fragments de silex, très visible en Normandie et en Picardie.",
    usages: "Sert à l'amendement (chaulage), au blanc de Meudon, aux anciennes craies à tableau et aux caves champenoises.",
    wikipedia: "https://fr.wikipedia.org/wiki/Craie",
  },
  {
    id: "tuffeau", nom: "Tuffeau", categorie: "sedimentaire", sousType: "carbonatée",
    swatch: "#e8e0c4", densite: 1450,
    description: "Craie sableuse et micacée, légère et poreuse (vides pouvant atteindre 50 %), formée au Turonien dans la mer du Bassin parisien. Elle fournit la pierre blonde des châteaux ligériens et des habitations troglodytiques de Touraine et d'Anjou.",
    mineralogie: "Calcite à environ 50 %, opale CT pour environ 30 %, quartz pour environ 10 %, micas et argiles (glauconie, smectite) pour environ 10 %.",
    varietes: [
      { nom: "tuffeau blanc", note: "Variété la plus claire, employée en pierre de taille pour les châteaux de la Loire, comme Chambord et Chenonceau." },
      { nom: "tuffeau jaune", note: "Plus riche en oxydes de fer, elle prend une teinte ocre, comme dans le Saumurois et l'Anjou." },
    ],
    regions: [
      { nom: "Saumurois (caves, troglodytes)", lat: 47.26, lng: -0.08 },
      { nom: "Touraine (Vouvray, Bourré)", lat: 47.34, lng: 1.15 },
    ],
    ages: [{ de: 93.9, a: 89.8, label: "Turonien (Crétacé supérieur)" }],
    alteration: {
      vmin: 0.02, vmax: 0.2, facilite: 4,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0473, cas: "Val de Loire, sous la pluie du bassin parisien, avec 165 mm infiltrés à Paris", src: "dissolution à saturation, masse volumique 1,45, moitié de calcite", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "La calcite se dissout, tandis que les sels et le gel dégradent la roche dans sa porosité considérable. En façade de bâtiment, la pierre s'écaille par plaques (desquamation), ce qui pose un problème délicat aux Monuments historiques.",
      climat: "Aucune mesure publiée ne concerne un affleurement. Le calcul donne 4,7 mm en 100 ans sous la pluie du bassin parisien, soit deux fois plus qu'une craie. Très poreuse (masse volumique de 1,45) et composée pour moitié seulement de calcite, la roche perd beaucoup de volume pour peu de calcaire dissous. En façade, le gel, les sels et les cycles d'humidité et de sécheresse agissent bien plus vite que cette seule dissolution.",
    },
    produits: { sable: 100, limon: 250, argile: 80, oxydes: 20, dissous: 550 },
    produitsNote: "La calcite part en solution, tandis que le reste, silico-argileux, demeure : limons et sables fins, issus du squelette d'opale et de quartz, restent sur place.",
    usages: "Pierre de taille typique du Val de Loire, présente à Chambord, Chenonceau et ailleurs.",
    wikipedia: "https://fr.wikipedia.org/wiki/Tuffeau",
  },
  {
    id: "dolomie", nom: "Dolomie", categorie: "sedimentaire", sousType: "carbonatée",
    swatch: "#cfc3a5", densite: 2800,
    description: "Carbonate double de calcium et de magnésium, moins soluble que la calcite. Sa dissolution inégale modèle des ruines rocheuses : tours, arches et chaos, comme à Montpellier-le-Vieux ou dans le cirque de Mourèze.",
    mineralogie: "Dolomite CaMg(CO₃)₂ 80 à 95 %, ± calcite, argiles.",
    varietes: [
      { nom: "dolomie saccharoïde", note: "Sa structure grenue, proche du sucre, se désagrège en un sable dolomitique." },
      { nom: "dolomie cristalline compacte", note: "Roche dure et massive, qui forme les chaos ruiniformes de Montpellier-le-Vieux et de Mourèze." },
    ],
    regions: [
      { nom: "Montpellier-le-Vieux (Causse Noir)", lat: 44.12, lng: 3.19 },
      { nom: "Cirque de Mourèze (Hérault)", lat: 43.62, lng: 3.36 },
      { nom: "Trias du Briançonnais (dolomies du Trias moyen)", lat: 44.90, lng: 6.60 },
    ],
    ages: [
      { de: 242, a: 201, label: "Trias alpin" },
      { de: 170, a: 155, label: "Jurassique moyen-sup. : Causses" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 2,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00175, cas: "Espagne centrale, sous 50 cm de sol (climat méditerranéen continental)", src: "Krklec et al. 2016, plaquettes de roche enterrées un an", ref: true }
      ],
      sources: [
        "Krklec K., Domínguez-Villar D., Carrasco R. M. et Pedraza J. (2016), « Current denudation rates in dolostone karst from central Spain », Geomorphology 264 : 1–11",
        "Martinez M. I. et White W. B. (1999), Journal of Cave and Karst Studies 61 (1) (dissolution comparée calcite / dolomite au laboratoire)"
      ],
      mecanisme: "Sa dissolution suit le schéma du calcaire, mais elle est 3 à 10 fois plus lente, car la dolomite réagit moins vite que la calcite. Elle désagrège la roche grain après grain et livre un « sable dolomitique » caractéristique, accumulé au pied des reliefs ruiniformes.",
      climat: "L'unique mesure nette publiée indique 0,18 mm en 100 ans pour une plaquette enfouie sous 50 cm de sol en Espagne centrale ; à 5 ou 10 cm, elle atteint 0,25 mm. Les cristaux qui se détachent comptent davantage que la dissolution proprement dite. Au laboratoire, la dolomite placée dans une eau chargée de CO₂ se dissout 1,5 fois moins vite que la calcite au départ.",
    },
    produits: { sable: 60, limon: 15, argile: 20, oxydes: 5, dissous: 900 },
    produitsNote: "Environ 90 % se dissout (Ca²⁺, Mg²⁺, HCO₃⁻). À la différence du calcaire, il subsiste un sable résiduel, formé de grains de dolomite en train de se dissoudre.",
    usages: "Granulats, réfractaires, verre et source de magnésium.",
    wikipedia: "https://fr.wikipedia.org/wiki/Dolomie",
  },
  {
    id: "marne", nom: "Marne", categorie: "sedimentaire", sousType: "mixte argilo-carbonatée",
    swatch: "#b5b09a", densite: 2300,
    description: "Associant argile (35 à 65 %) et calcaire, cette roche est tendre, imperméable et gonflante. Elle façonne les combes et les vignobles, qui profitent de sa rétention d'eau, ainsi que les célèbres « Terres Noires » ravinées des Alpes du Sud, qui sont devenues des laboratoires de référence pour l'érosion.",
    mineralogie: "Calcite 35 à 65 %, argiles (illite, smectite) 35 à 65 %, ± quartz fin, pyrite.",
    varietes: [
      { nom: "Terres Noires", note: "Marnes noires chargées de pyrite, célèbres pour leurs badlands des Alpes du Sud." },
      { nom: "marne à foraminifères (globigérines)", note: "Faciès pélagique : le calcaire vient des coquilles de foraminifères planctoniques (globigérines) et des coccolithes ; l'argile, très fine, arrive en suspension, presque sans sable." },
      { nom: "marno-calcaire", note: "Transition vers le calcaire, dont la teneur en carbonate dépasse 65 %." },
      { nom: "concrétions (miches, septarias)", note: "Les nodules, durs, sont constitués de calcaire ou de pyrite et se forment dans la marne pendant l'enfouissement. Parmi eux, les septarias, fendus de retraits remplis de calcite, sont les plus connus." }
    ],
    regions: [
      { nom: "Terres Noires de Draix-Digne", lat: 44.14, lng: 6.36 },
      { nom: "Pays d'Auge (Normandie)", lat: 49.1, lng: 0.1 },
      { nom: "Vignoble de Chablis (Kimméridgien)", lat: 47.81, lng: 3.80 },
      { nom: "Woëvre (Lorraine)", lat: 49.0, lng: 5.6 },
    ],
    ages: [
      { de: 184.2, a: 174.7, label: "Toarcien : marnes du Lias" },
      { de: 166, a: 158, label: "Terres Noires (Bathonien supérieur à Oxfordien)" },
      { de: 154.8, a: 149.2, label: "Kimméridgien : Chablis" },
    ],
    alteration: {
      vmin: 0.1, vmax: 5, facilite: 4,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0298, cas: "Sous végétation, bassin parisien : seule la dissolution du carbonate agit (165 mm infiltrés à Paris)", src: "dissolution à saturation, masse volumique 2,3, moitié de calcite", calcul: "carbonate", ref: true },
        { v: 6.4, cas: "Draix : badlands dénudés du bassin du Laval, à 32 % de couverture végétale, avec une moyenne mesurée depuis 1985.", src: "Saez et al. 2011, pièges à sédiments" },
        { v: 13.4, cas: "Laval, en 2013 (l'une des années les plus érosives)", src: "Klotz et al. 2023" }
      ],
      sources: [
        "Saez J. L., Corona C., Stoffel M. et al. (2011), « Mapping of erosion rates in marly badlands based on a coupling of anatomical changes in exposed roots with slope maps derived from LiDAR data », Earth Surf. Process. Landforms 36 : 1162–1171 (Draix, pièges du Laval depuis 1985)",
        "Klotz S., Le Bouteiller C., Mathys N. et al. (2023), « A high-frequency, long-term data set of hydrology and sediment yield: the alpine badland catchments of Draix-Bléone Observatory », Earth Syst. Sci. Data 15 : 4371–4388",
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Deux processus se conjuguent : la dissolution du carbonate et la désagrégation physique des argiles, sous l'effet des cycles d'humectation et de dessiccation, puis de gel et de dégel. La surface se fragmente en une multitude de plaquettes, qui sont emportées dès la première pluie.",
      climat: "La végétation décide de tout. À Draix (Alpes-de-Haute-Provence), les badlands nus du Laval piègent l'équivalent de 640 mm de marne en 100 ans depuis 1985, soit 1 340 mm au rythme de 2013 : l'une des érosions les plus fortes de France. Couverte, la surface ne perd que sa fraction carbonatée, environ 3 mm en 100 ans par calcul.",
    },
    produits: { sable: 10, limon: 90, argile: 380, oxydes: 20, dissous: 500 },
    produitsNote: "La moitié carbonatée passe en solution, tandis que la moitié argileuse demeure : 1 kg de marne donne environ 400 g d'argiles et 100 g de limons, livrés directement aux rivières, ce qui explique leur turbidité en crue.",
    usages: "Cimenterie (mélange idéal de calcaire et d'argile), tuiles, amendement (marnage).",
    wikipedia: "https://fr.wikipedia.org/wiki/Marne_(g%C3%A9ologie)",
  },
  {
    id: "argile", nom: "Argilite / argiles", categorie: "sedimentaire", sousType: "détritique fine",
    swatch: "#b08968", densite: 2100,
    description: "Roche constituée de minéraux argileux, eux-mêmes issus de l'altération d'anciennes roches, déposés en mer calme ou en lagune. Imperméable, plastique et gonflante, elle retient les nappes, favorise le glissement des versants et fissure les bâtiments (retrait-gonflement).",
    mineralogie: "Illite, smectite et kaolinite, accompagnées éventuellement de quartz très fin, de matière organique et de pyrite.",
    varietes: [
      { nom: "argile plastique (Sparnacien)", note: "Pauvre en carbonate, très déformable et riche en kaolinite : elle a servi à fabriquer les poteries et les céramiques de Provins." },
      { nom: "bentonite", note: "Composée presque uniquement de smectite issue de l'altération de cendres volcaniques, elle présente un pouvoir de gonflement exceptionnel." },
      { nom: "argilite (argile indurée)", note: "Argile durcie par l'enfouissement : l'eau en est chassée et les smectites se changent en illite. Elle n'a pas le feuilletage d'un schiste." }
    ],
    regions: [
      { nom: "Argiles des Flandres (Ypresien)", lat: 50.8, lng: 2.4 },
      { nom: "Pays de Bray", lat: 49.5, lng: 1.6 },
      { nom: "Provins (argiles cérames)", lat: 48.56, lng: 3.30 },
      { nom: "Toarcien de Lorraine (schistes carton)", lat: 49.2, lng: 6.0 },
      { nom: "Bure (Meuse) : argilites du Callovo-Oxfordien", lat: 48.50, lng: 5.36 },
    ],
    ages: [
      { de: 184.2, a: 174.7, label: "Toarcien : schistes carton de Lorraine" },
      { de: 163, a: 158, label: "Callovien supérieur et Oxfordien inférieur (≈ 160 Ma) : argilites de Bure, roche hôte du projet de stockage Cigéo" },
      { de: 113.2, a: 100.5, label: "Albien : argiles du Gault" },
      { de: 56, a: 33.9, label: "Éocène : Flandres, Bassin parisien" },
    ],
    alteration: {
      vmin: 0.1, vmax: 10, facilite: 5,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00185, cas: "Sous couvert forestier, petits bassins français reposant sur argilites et schistes argileux (15 ruisseaux) : seule la dissolution intervient.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,1", calcul: "ruisseaux", ref: true },
        { v: 50, cas: "Argiles marines pliocènes laissées à nu, formant les badlands dits « calanchi » de Radicofani (Toscane), suivis de 1976 à 1994.", src: "Ciccacci et al. 2008, comparaison de modèles numériques de terrain" }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)",
        "Ciccacci S., Galiano M., Roma M. A. et Salvatore M. C. (2008), « Morphological analysis and erosion rate evaluation in badlands of Radicofani area (Southern Tuscany – Italy) », Catena 74 : 87–97"
      ],
      mecanisme: "Sur le plan chimique, l'argile est déjà un produit final de l'altération et évolue très peu. En revanche, elle s'érode physiquement très vite (ravinement, glissements, coulées boueuses) dès que la pente et l'eau interviennent.",
      climat: "Chimiquement, l'argile évolue peu : sous forêt, les ruisseaux français drainant des argilites n'entraînent que 0,18 mm en 100 ans. Mise à nu sur une pente, elle recule bien plus vite : des coulées boueuses ont abaissé les versants toscans de 5 m en 100 ans, de 1976 à 1994. Le gonflement-retrait des smectites, lors des sécheresses, constitue le 2ᵉ poste d'indemnisation des catastrophes naturelles en France.",
    },
    produits: { sable: 20, limon: 100, argile: 850, oxydes: 30, dissous: 0 },
    produitsNote: "Sur 1 kg d'argilite « altérée », l'argile reste presque entière (≈ 85 %) : stables en surface, les minéraux argileux sont recyclés quasi intégralement vers les sols et les sédiments.",
    usages: "On en tire tuiles, briques et poteries, mais aussi des barrières étanches destinées aux déchets, ainsi que des terres agricoles lourdes.",
    wikipedia: "https://fr.wikipedia.org/wiki/Argile",
  },
  {
    id: "sable", nom: "Sables (non consolidés)", categorie: "sedimentaire", sousType: "détritique meuble",
    swatch: "#e3c878", densite: 1600,
    description: "Dépôts meubles de grains de quartz, hérités de l'érosion d'anciens massifs et remaniés par les mers, les fleuves ou le vent. Les sables de Fontainebleau, purs à plus de 99 % en quartz, alimentent la fabrication du verre optique.",
    mineralogie: "Quartz 90 à 99 % dans les sables purs (Fontainebleau, Landes), ± feldspaths, micas, minéraux lourds, glauconie ; les sables de Sologne, issus des granites du Massif central, sont plus riches en feldspaths.",
    varietes: [
      { nom: "sable siliceux pur", note: "Plus de 99 % de quartz : Fontainebleau fournit la matière première du verre optique." },
      { nom: "sable glauconieux", note: "Teinté en vert par la glauconie, il provient de dépôts marins peu profonds (« sables verts » de l'Albien)." },
      { nom: "sablon", note: "Sable très fin (0,06 à 0,15 mm), comme celui des estrans abrités et des fonds de baie ; on s'en servait en maçonnerie." },
    ],
    regions: [
      { nom: "Massif de Fontainebleau", lat: 48.40, lng: 2.63 },
      { nom: "Landes de Gascogne", lat: 44.2, lng: -0.8 },
      { nom: "Sologne", lat: 47.6, lng: 1.9 },
    ],
    ages: [
      { de: 33.9, a: 27.3, label: "Rupélien : sables de Fontainebleau" },
      { de: 20.45, a: 3.6, label: "Miocène à Pliocène inférieur : sables et argiles de Sologne" },
      { de: 2.58, a: 0.0117, label: "Pléistocène : sable des Landes (éolien)" },
    ],
    alteration: {
      vmin: 0.5, vmax: 10, facilite: 5,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0023, cas: "Sous couvert forestier, les petits bassins français qui drainent sables et grès quartzeux (15 ruisseaux) ne subissent que la dissolution.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique apparente 1,6", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "Le matériau est déjà meuble : il ne s'altère pas à proprement parler, il est seulement transporté. Le vent et l'eau le remanient en dunes et en bancs. Le grain de quartz, quasi éternel, traverse plusieurs cycles d'érosion.",
      climat: "Quasi rien ne se dissout : sous forêt, les ruisseaux drainant des sables quartzeux n'emportent que l'équivalent de 0,2 mm en 100 ans, surtout de la silice. Le sable se déplace bien plus vite qu'il ne change de nature : la dune du Pilat progresse de 1 à 5 m par an.",
    },
    produits: { sable: 950, limon: 30, argile: 15, oxydes: 5, dissous: 0 },
    produitsNote: "La sortie égale l'entrée : le sable est le produit d'altération résistant par excellence. Des films d'oxydes de fer enrobant les grains donnent les teintes rousses observées en Sologne et dans les Landes.",
    usages: "Verre, fonderie, filtration, béton, silicium.",
    wikipedia: "https://fr.wikipedia.org/wiki/Sable",
  },
  {
    id: "gres", nom: "Grès", categorie: "sedimentaire", sousType: "détritique consolidée",
    swatch: "#c99e6a", densite: 2200,
    description: "Sable ancien cimenté par de la silice, du carbonate ou des oxydes de fer. Le grès rose des Vosges (cathédrale de Strasbourg), le grès armoricain des crêtes bretonnes et les blocs d'escalade de Fontainebleau en constituent les principaux exemples français.",
    mineralogie: "Grains de quartz à hauteur de 70 à 95 %, associés à un ciment (silice, calcite ou oxydes de fer) et éventuellement à des feldspaths et des micas.",
    varietes: [
      { nom: "quartzarénite", note: "Grès d'une pureté quasi totale, avec plus de 95 % de quartz : grès armoricain et grès de Fontainebleau." },
      { nom: "litharénite (grès lithique)", note: "Moins de 75 % de quartz ; parmi les autres grains, les fragments de roches (schistes, silex, laves) l'emportent sur les feldspaths. Proche de la grauwacke, il renferme toutefois moins de matrice." },
      { nom: "grès ferrugineux", note: "Grains soudés par des oxydes de fer (goethite, hématite), brun rouille : la garluche des Landes. Le grès rose des Vosges, lui, doit sa couleur à une fine pellicule d'hématite autour des grains ; son ciment est siliceux." },
      { nom: "sublitharénite / litharénite feldspathique", note: "Intermédiaire entre la quartzarénite et la litharénite : elle compte 5 à 25 % de fragments de roches (sublitharénite). La litharénite feldspathique contient aussi des feldspaths, en quantité inférieure aux fragments de roches." },
      { nom: "psammite", note: "Autrefois désignés ainsi, ces grès fins et micacés se débitent en dalles suivant leurs lits de mica. Le mot s'applique aussi à un grès métamorphisé." }
    ],
    regions: [
      { nom: "Vosges du Nord (grès rose)", lat: 48.9, lng: 7.3 },
      { nom: "Fontainebleau (platières, blocs)", lat: 48.41, lng: 2.60 },
      { nom: "Presqu'île de Crozon (grès armoricain)", lat: 48.26, lng: -4.55 },
    ],
    ages: [
      { de: 478, a: 470, label: "Ordovicien : grès armoricain" },
      { de: 251.9, a: 247.0, label: "Trias inférieur : grès vosgien" },
      { de: 33.9, a: 27.3, label: "Rupélien : sables de Fontainebleau, soudés en grès bien plus tard, au Plio-Pléistocène" },
    ],
    alteration: {
      vmin: 0.002, vmax: 0.05, facilite: 2,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00168, cas: "Sous couvert forestier, les petits bassins français (15 ruisseaux) qui drainent du grès quartzeux ne subissent que la dissolution.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,2", calcul: "ruisseaux" },
        { v: 0.00181, cas: "Grès argileux sous couvert forestier : pour les petits bassins français (19 ruisseaux), la dissolution seule opère.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,2", calcul: "ruisseaux" },
        { v: 0.012, cas: "Exposé à l'air libre et subissant 5 gels par an, ce grès a un ciment d'argile et de limonite.", src: "Wells, Hancock et Fryer, gel-dégel au laboratoire", ref: true },
        { v: 0.018, cas: "Ciment formé d'oxydes de fer, qui devient soluble en sol engorgé ; 400 mm d'eau par an.", src: "dissolution du ciment (3 % de la roche), page « son ciment »", calcul: "gresCiment" },
        { v: 0.0443, cas: "Grès à ciment calcaire, exposé en façade ou sur un rocher, sous 400 mm d'eau par an.", src: "dissolution du ciment (20 % de la roche), page « son ciment »", calcul: "gresCiment" },
        { v: 2.77, cas: "Ciment de gypse ou de sels, pour un grès en façade à l'air libre, avec 400 mm d'eau annuelle.", src: "dissolution du ciment (15 % de la roche), page « son ciment »", calcul: "gresCiment" }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)",
        "Wells T., Hancock G. et Fryer J., « Using laboratory simulations and gravestone measurements to estimate rates of sandstone weathering in the Hunter Valley, New South Wales, Australia » (université de Newcastle, Australie)",
        "Calcul de la page « Ce qui tient un grès : son ciment » de l'atlas, d'après Palandri J. L. et Kharaka Y. K. (2004), USGS Open-File Report 2004-1068 (vitesses de réaction)"
      ],
      mecanisme: "Tout dépend du ciment : un ciment carbonaté se dissout, et le grès redevient du sable en quelques milliers d'années, tandis qu'un ciment siliceux résiste presque comme un quartzite. La désagrégation se fait grain à grain et forme des alvéoles, appelées taffonis, en bord de mer.",
      climat: "Tout dépend du ciment et de l'exposition. Sous forêt, les ruisseaux qui drainent des grès quartzeux ou argileux n'emportent en solution que l'équivalent de 0,17 à 0,18 mm en 100 ans. À l'air, le gel agit davantage : 1,2 mm en 100 ans au laboratoire pour 5 gels par an. Un ciment calcaire se dissout (≈ 4,4 mm en 100 ans, d'après le calcul, pour une façade), un ciment de gypse ou de sels beaucoup plus vite (≈ 280 mm) ; dans un sol engorgé, la pellicule d'oxydes de fer devient soluble (≈ 1,8 mm). Le gel exploite la porosité : les corniches de grès vosgien s'écaillent surtout en hiver.",
      // 12/10/2026 (sa question : « pourquoi un écart si grand ? ») — détail et calculs : gres-ciment.js, page #roche/gres/ciment
      ecart: "Ce constat s'explique par la diversité des ciments que recouvre le mot « grès ». Un ciment calcaire se dissout dans l'eau de pluie (≈ 4 mm en 100 ans par calcul), tandis qu'un ciment siliceux, ferrugineux ou argileux se dissout à peine : le gel et les sels grignotent alors la pierre (0,3 à 1,8 mm en 100 ans sur des pierres tombales). Pour un même ciment, l'exposition introduit un facteur 2 à 3 : une face d'un édifice s'use jusqu'à trois fois plus vite qu'une autre.",
    },
    produits: { sable: 850, limon: 50, argile: 50, oxydes: 15, dissous: 35 },
    produitsNote: "Environ 850 g de sable sont rendus à la nature pour 1 kg de grès : la boucle sable, grès, sable figure parmi les grands recyclages sédimentaires.",
    usages: "Employé en pierre de taille, notamment pour la cathédrale de Strasbourg, ainsi qu'en pavés et, jadis, en meules.",
    wikipedia: "https://fr.wikipedia.org/wiki/Gr%C3%A8s_(g%C3%A9ologie)",
  },
  {
    id: "conglomerat", nom: "Conglomérat / poudingue", categorie: "sedimentaire", sousType: "détritique grossière",
    swatch: "#b59a7b", densite: 2400,
    description: "Galets et graviers liés par un ciment, vestiges d'anciens torrents, de deltas et de cônes alluviaux installés au pied de massifs en surrection. Au pied de la Sainte-Victoire, les poudingues rouges conservent la trace de l'érosion des reliefs pyrénéo-provençaux naissants ; les argiles rouges qui les accompagnent livrent des œufs de dinosaures (Roques-Hautes).",
    mineralogie: "Galets hétérogènes (quartz, calcaire, granite) disposés dans une matrice sablo-argileuse et un ciment.",
    varietes: [
      { nom: "conglomérat polygénique", note: "Hérités de roches sources multiples, ces galets présentent une composition très variée : poudingues de la Sainte-Victoire." },
      { nom: "conglomérat oligomictique (monogénique)", note: "Roche unique à l'origine de ces galets, le plus souvent du quartz ou du calcaire." },
      { nom: "microconglomérat (granule)", note: "Éléments de taille réduite, de 2 à 4 mm, proches de la limite avec le grès grossier." },
      { nom: "métaconglomérat", note: "Conglomérat transformé par le métamorphisme : les galets, aplatis et allongés par la déformation, ont été recristallisés." }
    ],
    regions: [
      { nom: "Sainte-Victoire (poudingues rouges)", lat: 43.53, lng: 5.65 },
      { nom: "Poudingues de Palassou (Ariège)", lat: 43.05, lng: 1.85 },
      { nom: "Plateau de Valensole et Pénitents des Mées", lat: 44.03, lng: 5.97 },
    ],
    ages: [
      { de: 72, a: 34, label: "Crétacé terminal à Paléogène (érosion des chaînes naissantes)" },
      { de: 8, a: 1.8, label: "Miocène supérieur à Pliocène : poudingue de Valensole (débris des Alpes)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.019, cas: "Poudingue à ciment calcaire sous climat méditerranéen : Marseille reçoit 528 mm de pluie, dont 55 mm s'infiltrent.", src: "dissolution du ciment à saturation, masse volumique 2,4, 25 % de calcite", calcul: "carbonate", ref: true },
        { v: 0.0897, cas: "Poudingue à ciment calcaire, sous le climat lyonnais (812 mm de pluie et 259 mm infiltrés)", src: "dissolution du ciment à saturation, masse volumique 2,4, 25 % de calcite", calcul: "carbonate" }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Le ciment, souvent carbonaté, se dissout en premier : le conglomérat libère alors ses galets intacts, qui repartent pour un nouveau parcours dans les rivières. La vitesse dépend du ciment, et non des galets.",
      climat: "Aucun chiffre publié ne concerne un conglomérat français. Le ciment, dissous en premier, libère des galets restés intacts. Pour un ciment calcaire qui occupe un quart de la roche, le calcul donne 1,9 mm en 100 ans à Marseille et 9 mm à Lyon. D'où les champs de galets issus des poudingues ; à Valensole, à l'inverse, les colonnes des Pénitents des Mées tiennent encore debout.",
    },
    produits: { sable: 600, limon: 30, argile: 200, oxydes: 20, dissous: 150 },
    produitsNote: "Il libère surtout du matériel grossier (galets, graviers et sables, que l'on range ici sous « sable »). La matrice cède les argiles, pendant que le ciment carbonaté se dissout.",
    usages: "Granulats ; pierre locale (mas provençaux).",
    wikipedia: "https://fr.wikipedia.org/wiki/Conglom%C3%A9rat_(g%C3%A9ologie)",
  },
  {
    id: "arkose", nom: "Arkose", categorie: "sedimentaire", sousType: "détritique (grès feldspathique)",
    swatch: "#d8b89a", densite: 2620,
    codes: [
      { code: "t1", sens: " : arkoses appartenant au Buntsandstein vosgien ; cette lithologie se lit dans le libellé du code stratigraphique" },
      { code: "h5", sens: " : arkoses et grès feldspathiques du Stéphanien, dans les bassins houillers" },
    ],
    description: "Grès riche en feldspath, né de l'érosion rapide de granites enfouis trop vite pour que leurs feldspaths s'altèrent en argile. Fréquemment rose ou rougeâtre, il signale un relief granitique voisin, une érosion rapide et une altération chimique faible : climat sec ou froid, ou relief très vigoureux.",
    mineralogie: "Plus de 25 % de feldspath, un peu de micas et du quartz, pris dans un ciment siliceux ou argileux. Les grains anguleux dominent.",
    mineraux: [["quartz", 55], ["orthose", 25], ["plagioclases", 8], ["muscovite", 5], ["illite_m", 4], ["goethite", 3]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Pendant l'altération, les feldspaths encore frais deviennent de la kaolinite : les arkoses fortement altérées forment ainsi de petits gisements de kaolin. L'illite, elle, provient des micas et du ciment.",
    regions: [
      { nom: "Arkose du Trias (plateau d'Antully, près d'Autun)", lat: 46.89, lng: 4.40 },
      { nom: "Grès permo-triasiques des Vosges", lat: 48.30, lng: 7.10 },
    ],
    ages: [{ de: 300, a: 200, label: "Permo-Trias (démantèlement de la chaîne hercynienne)" }],
    alteration: {
      vmin: 0.002, vmax: 0.03, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00165, cas: "Sous couvert forestier, petits bassins français reposant sur arkoses et grauwackes (10 ruisseaux) : seule la dissolution se manifeste.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,62", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "En surface, les feldspaths restés frais finissent par s'hydrolyser : il en résulte kaolinite et ions, tandis que le quartz retourne au stade du sable. La roche résiste moins qu'un grès quartzeux pur.",
      climat: "Les ruisseaux français drainant arkoses et grauwackes, sous forêt, emportent 0,17 mm en 100 ans, presque autant qu'un grès quartzeux : l'hydrolyse des feldspaths avance, mais lentement. Sur les affleurements, le gel et la désagrégation des faciès mal cimentés vont plus vite ; aucune mesure française n'existe à ce sujet.",
    },
    produits: { sable: 700, limon: 50, argile: 180, oxydes: 20, dissous: 50 },
    produitsNote: "Environ 700 g de sable (quartz et feldspaths frais), 180 g d'argiles (kaolinite issue des feldspaths ; les arkoses très altérées servent de kaolin) et 50 g d'ions.",
    usages: "Pierre de construction (arkose de Montpeyroux, églises romanes d'Auvergne ; abbaye de Cluny) ; pavés (arkose du Trias du plateau d'Antully, près d'Autun).",
    wikipedia: "https://fr.wikipedia.org/wiki/Arkose",
    varietes: [{ nom: "Subarkose", note: "Grès dont 5 à 25 % des grains sont des feldspaths ; au-delà de 25 %, on parle d'arkose." }, { nom: "Arkose lithique", note: "Arkose qui contient aussi de nombreux fragments de roches." }, { nom: "Méta-arkose", note: "Arkose recristallisée par le métamorphisme, qui ressemble à un gneiss clair." }],
  },
  {
    id: "grauwacke", nom: "Grauwacke", categorie: "sedimentaire", sousType: "détritique (grès à matrice)",
    swatch: "#5a5c54", densite: 2700,
    codes: [
      { code: "b", sens: " : grauwackes briovériennes (Bretagne, rattachées au Briovérien)" },
      { code: "h1-h2", sens: " : grauwackes du Culm dinantien (Massif central, Vosges)" },
    ],
    description: "Grès sombre, « sale » : des grains anguleux et mal triés (quartz, feldspaths, fragments de roche) baignent dans une matrice argileuse abondante. On le rencontre dans les turbidites, coulées sous-marines qui déposent le sable en eaux profondes.",
    mineralogie: "Quartz, feldspath et fragments lithiques dans une matrice fine (plus de 15 %) de chlorite et d'argile ; tri médiocre.",
    mineraux: [["quartz", 40], ["plagioclases", 15], ["chlorite_m", 15], ["illite_m", 15], ["muscovite", 8], ["magnetite", 5], ["pyrite", 2]],
    argiles: ["illite", "chlorite", "vermiculite"],
    argilesNote: "C'est la matrice qui domine : l'illite et la chlorite héritées sont libérées sans transformation, la chlorite évoluant en vermiculite dans les sols.",
    regions: [
      { nom: "Grauwackes du Massif armoricain", lat: 48.20, lng: -2.90 },
      { nom: "Séries paléozoïques des Vosges", lat: 48.00, lng: 6.95 },
    ],
    ages: [
      { de: 570, a: 538.8, label: "Briovérien (fin du Néoprotérozoïque) : grauwackes du Massif armoricain" },
      { de: 500, a: 300, label: "Paléozoïque (turbidites hercyniennes, Culm)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00161, cas: "Sous couvert forestier, petits bassins français reposant sur arkoses et grauwackes (10 ruisseaux) : seule la dissolution se manifeste.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,7", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "L'hydrolyse des feldspaths et de la matrice chloritique donne argiles et oxydes de fer, le quartz demeurant intact. La matrice rend la roche plus altérable qu'un grès pur.",
      climat: "Les ruisseaux français drainant arkoses et grauwackes, sous forêt, transportent 0,16 mm en 100 ans. Côté matrice, l'argilo-chlorite se dégrade avant les grains, et la roche se délite en plaquettes, puis en limons (Massif armoricain : 12 °C, 740 à 1 100 mm de pluie par an).",
    },
    produits: { sable: 450, limon: 250, argile: 220, oxydes: 30, dissous: 50 },
    produitsNote: "Mélange brut : 450 g de sable impur, 250 g de limons issus de la matrice broyée, 220 g d'argiles (illite, chlorite transformée en vermiculite), et quelques oxydes et ions.",
    usages: "Granulats, empierrement.",
    wikipedia: "https://fr.wikipedia.org/wiki/Grauwacke",
    varietes: [{ nom: "Wacke", note: "Terme général : grès dont la matrice argileuse fine représente plus de 15 % du volume." }, { nom: "Wacke quartzeux, arkosique ou lithique", note: "Classement : le grain dominant, qu'il s'agisse de quartz, de feldspaths ou de fragments de roches, détermine le nom." }, { nom: "Métagrauwacke", note: "grauwacke recristallisée par le métamorphisme." }],
  },
  {
    id: "siltite", nom: "Siltite", categorie: "sedimentaire", sousType: "détritique fine",
    swatch: "#b8a890", densite: 2550,
    codes: [
      { code: "selon l'âge", sens: " : désignée par l'étage qui la porte (ex. b2 pour les siltites briovériennes, o pour les silstones ordoviciens) ; le terme « siltites » figure dans le libellé de la légende" },
    ],
    description: "Le silt désigne une roche formée de grains plus fins que le sable mais plus grossiers que l'argile (2 à 63 µm). Située entre grès et argilite, elle se débite fréquemment en plaquettes et garde parfois des rides ou des terriers fossiles.",
    mineralogie: "Quartz fin dominant, accompagné de micas, de feldspath et d'argiles ; le grain se situe à la limite du visible.",
    mineraux: [["quartz", 55], ["illite_m", 20], ["muscovite", 10], ["chlorite_m", 8], ["orthose", 4], ["goethite", 3]],
    argiles: ["illite", "interstratifies"],
    argilesNote: "Elle restitue les argiles héritées, dont l'illite est majoritaire ; le lessivage les fait évoluer vers des interstratifiés.",
    varietes: [
      { nom: "pélite", note: "Terme général désignant les roches détritiques fines (silt et argile)." },
    ],
    regions: [
      { nom: "Séries détritiques du Massif armoricain", lat: 48.10, lng: -2.50 },
    ],
    ages: [
      { de: 570, a: 538.8, label: "Briovérien : siltites de Normandie et de Bretagne" },
      { de: 500, a: 250, label: "Paléozoïque (bassins détritiques)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00152, cas: "Sous couvert forestier, petits bassins français reposant sur schistes argileux et silteux (15 ruisseaux) : seule la dissolution agit.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,55", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "La désagrégation puis l'hydrolyse des micas et des feldspaths donnent des silts et des argiles, et libèrent peu de sable.",
      climat: "Presque rien ne passe en solution : sous forêt, les ruisseaux qui drainent ces roches fines n'emportent que 0,15 mm en 100 ans. Indurée, la roche se débite au gel en plaquettes, puis l'hydrolyse des micas et des feldspaths la change en limons argileux, à un rythme comparable à celui de la grauwacke. Les silts peu enfouis, restés tendres, s'érodent bien plus vite (combes marno-silteuses), sans qu'aucune mesure française ne le chiffre.",
    },
    produits: { sable: 100, limon: 600, argile: 250, oxydes: 30, dissous: 20 },
    produitsNote: "Sur 1 kg, la siltite restitue surtout ses limons d'origine (600 g) : elle rend le silt qui la constituait, auquel s'ajoutent 250 g d'argiles héritées.",
    usages: "Peu exploitée.",
    wikipedia: "https://fr.wikipedia.org/wiki/Siltite",
  },
  {
    id: "breche_sedimentaire", nom: "Brèche sédimentaire", categorie: "sedimentaire", sousType: "détritique grossière",
    swatch: "#a88c78", densite: 2600,
    codes: [
      { code: "selon l'âge", sens: " : étage porteur qui permet de la repérer (brèches de talus jurassiques dans les j alpins, brèches de base cénozoïques dans les e-g)" },
    ],
    description: "Version anguleuse du conglomérat : des débris non arrondis, qui n'ont pas voyagé, sont liés entre eux. La brèche se forme au pied des reliefs et des escarpements de faille (éboulis cimentés) ou dans les grottes. Les brèches de faille, broyées sur place, sont des roches tectoniques (voir cataclasite).",
    mineralogie: "Fragments anguleux de toute nature (calcaire, silex, roches locales) + ciment (calcaire, siliceux, ferrugineux).",
    mineraux: [["calcite", 60], ["illite_m", 12], ["quartz", 10], ["dolomite", 10], ["goethite", 8]],
    argiles: ["illite", "kaolinite"],
    argilesNote: "Comme le conglomérat, elle doit ses argiles aux éléments et au ciment, l'illite héritée venant en tête.",
    varietes: [
      { nom: "brèche de pente", note: "Éboulis cimentés au pied des falaises." },
      { nom: "brèche d'effondrement / karstique", note: "Dans les grottes et les cavités dissoutes." },
      { nom: "microbrèche", note: "Brèche à éléments de moins de 2 à 4 mm." },
      { nom: "mégabrèche", note: "Dépôt de blocs métriques, glissés en masse au pied d'une pente sous-marine (olistostromes des Alpes)." }
    ],
    regions: [
      { nom: "Brèches de pente des Alpes / Provence", lat: 44.10, lng: 6.30 },
      { nom: "Le Tholonet, au pied de la Sainte-Victoire (brèche du Tholonet)", lat: 43.52, lng: 5.51 },
    ],
    ages: [
      { de: 72, a: 56, label: "Fin du Crétacé à Paléocène : brèche du Tholonet" },
      { de: 66, a: 0, label: "Surtout cénozoïque à quaternaire (éboulis)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00627, cas: "Brèche calcaire sous le climat marseillais : 528 mm de pluie, dont 55 mm s'infiltrent.", src: "dissolution à saturation, masse volumique 2,6, 70 % de carbonate", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Le ciment s'altère (dissolution s'il est calcaire, hydrolyse s'il est argileux) et libère les fragments.",
      climat: "Aucune mesure publiée. Le résultat dépend des éléments : une brèche calcaire, à l'image de celle du Tholonet, se dissout comme du calcaire, ce qui donne ≈ 0,6 mm en 100 ans par calcul sous le climat marseillais ; une brèche de socle, elle, s'arénise. Le ciment cède en premier et laisse les blocs intacts.",
    },
    produits: { sable: 400, limon: 100, argile: 250, oxydes: 30, dissous: 220 },
    produitsNote: "Bilan variable selon les clastes : pour une brèche polygénique à ciment carbonaté, on obtient environ 400 g d'éléments résistants, 250 g d'argiles et 220 g dissous (le ciment).",
    usages: "Pierre ornementale (« brèche » polie), granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Br%C3%A8che_(g%C3%A9ologie)",
  },
  {
    id: "molasse", nom: "Molasse", categorie: "sedimentaire", sousType: "détritique de bassin",
    swatch: "#cbb694", densite: 2400,
    codes: [
      { code: "m", sens: " : molasses miocènes des bassins péri-alpins, avec m1 et m2 pour le Bas-Dauphiné et la Savoie" },
      { code: "g", sens: " : molasses oligocènes locales (ex. molasse d'Agen, g selon feuilles aquitaines)" },
    ],
    description: "Sable et marne arrachés à une chaîne en cours de soulèvement, puis déposés dans le bassin d'avant-pays voisin. Des alternances épaisses de grès tendres, de marnes et de conglomérats forment la molasse, qui remplit l'avant-pays alpin et le bassin d'Aquitaine.",
    mineralogie: "Grès plus ou moins argileux, marnes et lentilles de conglomérat ; on y trouve des grains de quartz, de feldspath et des débris calcaires.",
    mineraux: [["quartz", 45], ["calcite", 30], ["plagioclases", 8], ["illite_m", 10], ["muscovite", 4], ["glauconie", 3]],
    argiles: ["illite", "smectites", "interstratifies"],
    argilesNote: "Sédiment mal trié : la dissolution du ciment carbonaté libère l'illite et les smectites héritées des bassins d'alimentation alpins.",
    varietes: [
      { nom: "molasse marine", note: "Déposée en mer peu profonde (grès coquilliers)." },
      { nom: "molasse continentale (d'eau douce)", note: "fluviatile et lacustre." },
    ],
    regions: [
      { nom: "Molasse de l'avant-pays alpin (Savoie, Bas-Dauphiné)", lat: 45.60, lng: 5.30 },
      { nom: "Bassin d'Aquitaine (Gers, Armagnac)", lat: 43.65, lng: 0.58 },
    ],
    ages: [{ de: 34, a: 5, label: "Oligo-Miocène (surrection des Alpes et Pyrénées)" }],
    alteration: {
      vmin: 0.05, vmax: 1, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0352, cas: "Pour la molasse d'Aquitaine, Toulouse présente 626 mm de pluie et 122 mm infiltrés.", src: "dissolution du ciment à saturation, masse volumique 2,4, 30 % de calcite", calcul: "carbonate" },
        { v: 0.0748, cas: "Molasse du Bas-Dauphiné : Lyon reçoit 812 mm de pluie, dont 259 mm gagnent le sol.", src: "dissolution du ciment à saturation, masse volumique 2,4, 30 % de calcite", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Les grès tendres et les marnes, peu cimentés, se désagrègent rapidement en sables et en argiles. Il en résulte des collines douces et des terres à vigne, comme dans le Gers.",
      climat: "Pour une molasse française, aucun chiffre n'a été publié. Sous la pluie de Toulouse, le calcaire qui lie ses grains recule de 3,5 mm en 100 ans ; sous celle de Lyon, de 7,5 mm. Sur les falaises, ce sont surtout le gel et le ruissellement qui agissent. Ainsi se creusent des « balmes », ces abris sous roche que les habitats troglodytiques du Bas-Dauphiné ont utilisés.",
    },
    produits: { sable: 500, limon: 200, argile: 150, oxydes: 20, dissous: 130 },
    produitsNote: "En quelques siècles, la molasse retrouve son état de sédiment mal trié : on compte environ 500 g de sable, 200 g de limons, 150 g d'argiles et 130 g dissous (le ciment calcaire).",
    usages: "Pierre tendre de construction (molasse), terroirs agricoles.",
    wikipedia: "https://fr.wikipedia.org/wiki/Molasse",
  },
  {
    id: "flysch", nom: "Flysch", categorie: "sedimentaire", sousType: "détritique de bassin profond (turbidite)",
    swatch: "#8a8272", densite: 2650,
    codes: [
      { code: "c", sens: " : flyschs du Crétacé, parmi lesquels le flysch à Helminthoïdes des Alpes et les flyschs nord-pyrénéens" },
      { code: "e", sens: " : flyschs éocènes, dont le grès d'Annot et le flysch basque, rattachés à l'Éocène" },
    ],
    description: "Archive des fosses océaniques vouées à se refermer : des centaines d'alternances rythmiques, grès et pélites, s'y déposent une à une par avalanches sous-marines (turbidites), juste avant la collision qui édifiera la chaîne. Le flysch précède ainsi le chaos montagneux.",
    mineralogie: "Grès (quartz, calcaire) alternant avec des pélites argileuses ; les figures de courant et les empreintes fossiles, appelées « Helminthoïdes », apparaissent sous les bancs.",
    mineraux: [["quartz", 45], ["illite_m", 20], ["calcite", 15], ["plagioclases", 8], ["chlorite_m", 7], ["muscovite", 3], ["pyrite", 2]],
    argiles: ["illite", "chlorite", "interstratifies"],
    argilesNote: "Dans les interlits pélitiques, illite et chlorite proviennent de la chaîne en cours de démantèlement ; le flysch réutilise ainsi les argiles de la montagne dont il est issu.",
    regions: [
      { nom: "Flysch à Helminthoïdes (Alpes-Maritimes, Embrunais)", lat: 44.55, lng: 6.50 },
      { nom: "Flysch pyrénéen (Béarn, Pays basque)", lat: 43.35, lng: -1.50 },
    ],
    ages: [{ de: 100, a: 34, label: "Crétacé sup. à Éocène (avant les collisions alpine et pyrénéenne)" }],
    alteration: {
      vmin: 0.02, vmax: 0.5, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.011, cas: "Sous couvert forestier, petits bassins français drainant du flysch (6 ruisseaux) : seule la dissolution agit.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, calcium et magnésium comptés en carbonates, masse volumique 2,65", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "Les bancs pélitiques, argileux, se délitent rapidement, tandis que les bancs gréseux résistent. Il en résulte l'aspect « côtelé » du relief et les glissements de terrain fréquents sur le flysch.",
      climat: "Les bancs calcaires du flysch se dissolvent : sous forêt, les ruisseaux qui le drainent emportent 1,1 mm en 100 ans, soit sept fois plus qu'un grès. Les bancs gréseux saillent, tandis que les interlits pélitiques tournent en boue : ces « badlands » et glissements caractérisent les pays de flysch (Pays basque, Alpes du Sud), dont l'érosion n'est pas comptabilisée ici.",
    },
    produits: { sable: 350, limon: 300, argile: 250, oxydes: 30, dissous: 70 },
    produitsNote: "Moitié grès, moitié pélites : 350 g de sable, 300 g de limons et 250 g d'argiles, surtout de l'illite, d'où des sols lourds et instables.",
    usages: "Granulats (bancs gréseux) ; terrains instables à surveiller.",
    wikipedia: "https://fr.wikipedia.org/wiki/Flysch",
    varietes: [{ nom: "Flysch à Helminthoïdes", note: "Calcaire de flysch du Crétacé supérieur, dans les Alpes-Maritimes ; il porte des traces sinueuses de vers fossiles (Helminthoidea)." }, { nom: "Grès d'Annot", note: "Grès turbiditiques en bancs épais, de l'Éocène à l'Oligocène, dans les Alpes du Sud." }, { nom: "Wildflysch", note: "Flysch chaotique : des blocs de toutes dimensions ont été emballés pendant la progression des nappes." }],
  },
  {
    id: "tillite", nom: "Tillite", categorie: "sedimentaire", sousType: "détritique glaciaire",
    swatch: "#8a8a84", densite: 2650,
    codes: [
      { code: "o6", sens: " : pélites à fragments, dues à la glaciation fini-ordovicienne (Hirnantien) ; en Armorique, elles sont rattachées à l'Ordovicien supérieur" },
    ],
    description: "Roche glaciaire fossilisée : un mélange désordonné et non trié de blocs, de sable et d'argile, abandonné par un glacier puis cimenté. Des tillites précambriennes gardent la trace des glaciations globales, dites « Terre boule de neige ». En France, elle est rare et ancienne.",
    mineralogie: "Blocs et galets striés, de toutes natures, répartis sans ordre dans une matrice argilo-sableuse : il s'agit d'une moraine durcie.",
    mineraux: [["quartz", 40], ["illite_m", 20], ["plagioclases", 10], ["chlorite_m", 10], ["calcite", 10], ["orthose", 5], ["goethite", 5]],
    argiles: ["illite", "chlorite", "smectites"],
    argilesNote: "Cimentée, la farine glaciaire conserve ses argiles de broyage : illite et chlorite mécaniques, à peine transformées chimiquement.",
    varietes: [
      { nom: "diamictite", note: "Mot générique qualifiant une roche à blocs enrobés dans une matrice fine, glaciaire ou non." },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Ce sont l'altération de la matrice argilo-sableuse et la résistance des blocs, variable selon leur nature, qui gouvernent le processus.",
    },
    produits: { sable: 350, limon: 300, argile: 280, oxydes: 40, dissous: 30 },
    produitsNote: "Le tout-venant glaciaire garde sa composition brute : 350 g de sable, 300 g de limons (farine glaciaire cimentée) et 280 g d'argiles.",
    usages: "Sans usage notable.",
    wikipedia: "https://fr.wikipedia.org/wiki/Tillite",
    regions: [
      { nom: "Formation du Ghaub, plate-forme d'Otavi (Namibie)", lat: -19.9, lng: 15.5, etranger: true },
      { nom: "Tillite de Feuguerolles (Calvados)", lat: 49.10, lng: -0.42 },
    ],
    ages: [
      { de: 636, a: 634, label: "Tillite du Ghaub (Namibie) : glaciation marinoenne, ≈ 635 Ma" },
      { de: 445.2, a: 443.1, label: "Hirnantien : glaciation de la fin de l'Ordovicien (tillite de Feuguerolles, pélites à fragments d'Armorique)" },
    ],
  },
  {
    id: "loess", nom: "Lœss", categorie: "sedimentaire", sousType: "formation superficielle (éolienne)",
    swatch: "#d9c49a", densite: 1500,
    description: "Des vents glaciaires ont arraché cette poussière limoneuse aux plaines dénudées de la dernière glaciation ; elle s'est déposée en placages souvent épais de plusieurs mètres. Elle nourrit les grandes terres à betteraves et à blé du Nord, ainsi que les collines viticoles d'Alsace.",
    mineralogie: "Quartz limoneux 60 à 80 %, calcite 5 à 20 %, argiles 10 à 25 %, ± feldspaths.",
    pedologie: "Les limons éoliens forment le substrat idéal : leurs sols, LUVISOLS et NÉOLUVISOLS (sols bruns lessivés), couvrent les grandes terres à blé et à betterave du Bassin parisien et des plaines septentrionales.",
    varietes: [
      { nom: "lœss typique (calcaire)", note: "Frais et riche en calcite, il forme des corniches verticales." },
      { nom: "lehm (lœss décarbonaté)", note: "Sol brun, débarrassé de son calcaire par lessivage, qui couvre l'essentiel des terres limoneuses du Bassin parisien." },
      { nom: "limon à poupées", note: "Nodules calcaires (« poupées de lœss ») précipités lors de la décarbonatation, apparentés aux croûtes de calcrète." },
    ],
    regions: [
      { nom: "Collines d'Alsace (Kochersberg)", lat: 48.66, lng: 7.55 },
      { nom: "Cambrésis, Santerre (Nord)", lat: 50.0, lng: 3.2 },
      { nom: "Limons des plateaux normands", lat: 49.4, lng: 0.9 },
    ],
    ages: [{ de: 0.115, a: 0.0117, label: "Dernière glaciation (Weichsélien)" }],
    alteration: {
      vmin: 0.5, vmax: 10, facilite: 5,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.19, cas: "Front de décarbonatation du bassin parisien, avec 165 mm infiltrés à Paris, sous végétation", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,5, 12 % de calcaire", calcul: "decarbonatation", ref: true },
        { v: 0.215, cas: "Front de décarbonatation des lœss d'Alsace, avec 186 mm infiltrés à Strasbourg", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,5, 12 % de calcaire", calcul: "decarbonatation" },
        { v: 0.24, cas: "Parcelles labourées : moyenne des mesures d'érosion relevées sur les terres arables d'Europe.", src: "Cerdan et al. 2010 : 3,6 t par hectare et par an ÷ 1,5 t/m³" }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020",
        "Vanwalleghem T., Poesen J. et Deckers J. (2008), résumé, Geological Society of America, Southeastern Section, Abstracts with Programs (forêt de Meerdaal, Belgique : 399 sondages, front de décarbonatation du lœss entre 1,14 et 5,10 m)",
        "Cerdan O., Govers G., Le Bissonnais Y. et al. (2010), « Rates and spatial variations of soil erosion in Europe: a study based on erosion plot data », Geomorphology 122 : 167–177"
      ],
      mecanisme: "Déjà meuble et fin, ce matériau se décarbonate (la calcite passe en solution) puis devient un limon brun (« lehm »). Extrêmement sensible au ravinement dès que le sol est nu, il représente l'enjeu n° 1 de l'érosion des terres agricoles françaises.",
      climat: "Les deux processus vont à peu près à la même vitesse. Le calcaire disparaît d'abord : le front de décarbonatation recule de 19 mm en 100 ans sous la pluie de Paris, et de 21,5 mm en Alsace, soit un mètre en environ 5 000 ans. En forêt de Meerdaal (Belgique), il se situe aujourd'hui entre 1,1 et 5,1 m sous la surface. Sur les terres labourées, l'érosion emporte en moyenne 3,6 t par hectare et par an en Europe, soit 24 mm en 100 ans, davantage sur les collines de lœss. Un orage tombant sur un champ nu peut entraîner plusieurs millimètres en une heure.",
    },
    produits: { sable: 30, limon: 750, argile: 150, oxydes: 10, dissous: 60 },
    produitsNote: "Constitué à 75 % de limon, le lœss fournit la matière première des meilleures terres agricoles. Sa décarbonatation libère un peu de calcium en solution.",
    usages: "Terres agricoles de premier ordre ; briques crues (historique).",
    wikipedia: "https://fr.wikipedia.org/wiki/L%C5%93ss",
  },
  {
    id: "alluvions", nom: "Alluvions", categorie: "sedimentaire", sousType: "formation superficielle (fluviatile)",
    swatch: "#c9b895", densite: 1900,
    codes: [
      { code: "Fz", sens: " : alluvions déposées par les rivières à l'Holocène, dans le lit majeur ; la lettre « z » marque le plus récent." },
      { code: "Fy", sens: " : alluvions plus anciennes, formant les basses terrasses (Pléistocène récent)." },
      { code: "Fx", sens: " : alluvions anciennes des moyennes terrasses (Pléistocène moyen, selon les feuilles)." },
      { code: "Fv", sens: " : alluvions des très hautes terrasses, parmi les plus anciennes (Pléistocène inférieur) ; l'indice recule dans l'alphabet quand l'âge augmente." },
    ],
    description: "Ces dépôts fluviatiles, graviers, sables et limons, sont triés et arrondis par le courant. Ils recouvrent les fonds de vallée (Fz) et forment des terrasses (Fy, Fx) qui conservent la mémoire des cycles glaciaires. Longtemps première ressource française en granulats (68 % en 1970), ils n'en fournissent plus qu'un tiers environ depuis les années 2010, derrière les roches massives concassées ; la nappe alluviale qu'ils renferment fournit une grande part de l'eau potable.",
    mineralogie: "Le quartz domine, car il survit aux transports ; s'y ajoutent des galets de roches locales, des feldspaths et micas résiduels, ainsi que limons et argiles dans les fractions fines.",
    mineraux: [["quartz", 60], ["calcite", 10], ["plagioclases", 8], ["orthose", 7], ["illite_m", 8], ["muscovite", 4], ["goethite", 3]],
    argiles: ["illite", "smectites", "interstratifies"],
    argilesNote: "Les argiles des alluvions viennent du bassin versant, où elles sont en transit : illite et smectites héritées se déposent dans les limons de crue.",
    pedologie: "Plus qu'une roche, c'est une formation superficielle meuble : selon le Référentiel pédologique, un matériau parental, « une roche, dure ou meuble, dans laquelle s'est développé le solum » (Baize). Les alluvions récentes portent des FLUVIOSOLS, rajeunis à chaque crue, et leur sol dépend avant tout de la nappe voisine.",
    varietes: [
      { nom: "alluvions récentes (Fz)", note: "Sables et limons de crue, dans le lit majeur encore inondable." },
      { nom: "terrasses alluviales (Fy, Fx)", note: "Ces anciens lits perchés, au-dessus du cours actuel, conservent les archives des glaciations." },
      { nom: "cône de déjection", note: "Éventail de dépôt formé à l'endroit où un torrent débouche dans une vallée." },
      { nom: "cailloutis et graviers", note: "Dépôts grossiers, faits principalement de galets (cailloutis) ou de grains de 2 à 20 mm (graviers), qui forment les terrasses des grandes vallées." }
    ],
    regions: [
      { nom: "Val de Loire (sables et graviers)", lat: 47.40, lng: 0.70 },
      { nom: "Plaine d'Alsace (nappe du Rhin)", lat: 48.30, lng: 7.70 },
      { nom: "Vallée du Rhône", lat: 44.90, lng: 4.85 },
      { nom: "Terrasses de la Garonne", lat: 43.90, lng: 1.30 },
    ],
    ages: [{ de: 2.58, a: 0, label: "Quaternaire (terrasses étagées) à actuel" }],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 2,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.133, cas: "Front de décarbonatation sur les terrasses de la Garonne : à Toulouse, 122 mm s'infiltrent.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,9, 10 % de calcaire", calcul: "decarbonatation" },
        { v: 0.283, cas: "Front de décarbonatation sur les terrasses du Rhône : à Lyon, 259 mm s'infiltrent.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,9, 10 % de calcaire", calcul: "decarbonatation", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Le triage fluviatile écarte d'abord la plupart des minéraux fragiles, si bien que le quartz résiduel est inaltérable. Restent les feldspaths et micas des galets, transformés en argiles, et les galets calcaires, dissous. Les alluvions vieillissent en se décarbonatant et en rougissant ; les plus altérées sont les hautes terrasses.",
      climat: "Le calcaire des galets et des sables cède le premier : le calcul donne une décarbonatation de 13 mm en 100 ans sous la pluie de Toulouse et de 28 mm sous celle de Lyon, soit un mètre en 3 500 à 7 500 ans. L'altération permet de dater : grises et calcaires, les alluvions récentes (Fz) contrastent avec les hautes terrasses (Fw, Fv), rouges, décarbonatées et argilisées sur plusieurs mètres. Aucune mesure n'est publiée.",
    },
    produits: { sable: 620, limon: 140, argile: 140, oxydes: 30, dissous: 70 },
    produitsNote: "Pour 1 kg d'alluvions : 620 g de sable et de graviers quartzeux, déjà résiduels qui ne font que se libérer ; 140 g de limons ; 140 g d'argiles issues des feldspaths restants ; 30 g d'oxydes de fer, responsables du rouge des vieilles terrasses ; et seulement 70 g d'ions, provenant surtout du calcaire des galets.",
    usages: "Granulats (béton, routes), longtemps la première ressource française, aujourd'hui dépassée par les roches massives ; les nappes alluviales fournissent l'eau potable et les sols de plaine sont fertiles.",
    wikipedia: "https://fr.wikipedia.org/wiki/Alluvion",
  },
  {
    id: "colluvions", nom: "Colluvions", categorie: "sedimentaire", sousType: "formation superficielle (de versant)",
    swatch: "#b8a888", densite: 1800,
    codes: [
      { code: "C", sens: " : colluvions indifférenciées (dépôts de versant)." },
      { code: "Cz", sens: " : colluvions récentes (Holocène), souvent liées aux défrichements." },
      { code: "CF", sens: " : colluvions et alluvions mêlées, dans les fonds de vallon." },
    ],
    description: "Ce n'est pas une rivière qui transporte cette terre le long des pentes, mais la gravité, le ruissellement et le labour. Elle s'accumule en bas de versant et dans les vallons secs. Une bonne part des colluvions françaises est récente : elles proviennent de l'érosion des sols depuis les défrichements agricoles.",
    mineralogie: "Ce mélange provient du versant situé en amont : il comprend limons, argiles et fragments de la roche du coteau, mais ne présente ni tri ni stratification nette.",
    mineraux: [["quartz", 45], ["illite_m", 20], ["smectites_m", 10], ["calcite", 10], ["goethite", 8], ["muscovite", 7]],
    argiles: ["illite", "smectites", "vermiculite"],
    argilesNote: "Le colluvion recycle les sols amont : ses argiles viennent des horizons décapés, déjà évoluées, vermiculite incluse.",
    pedologie: "Formation superficielle de versant plutôt que roche : selon le Référentiel pédologique, elle résulte d'un apport progressif de matériaux pédologiques, d'altérites ou de roches meubles arrachés plus haut dans le paysage. Elle porte les COLLUVIOSOLS, sols épais, souvent enterrés sous leurs propres apports.",
    varietes: [
      { nom: "colluvions de bas de pente", note: "Épaisses, elles constituent souvent les meilleures terres agricoles." },
      { nom: "dépôt de vallon sec", note: "Remplissage limoneux des thalwegs sans écoulement permanent." },
    ],
    regions: [
      { nom: "Bas de versants du Bassin parisien", lat: 49.10, lng: 2.40 },
      { nom: "Coteaux viticoles de Bourgogne", lat: 47.05, lng: 4.85 },
      { nom: "Vallons du Sud-Ouest", lat: 44.20, lng: 0.80 },
    ],
    ages: [{ de: 0.0117, a: 0, label: "Holocène : surtout depuis les défrichements néolithiques et historiques" }],
    alteration: {
      vmin: 0.01, vmax: 0.06, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.19, cas: "Front de décarbonatation en bas de versant du bassin parisien : 165 mm infiltrés à Paris.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,8, 10 % de calcaire", calcul: "decarbonatation", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Ce matériau, déjà altéré, remanié et meuble, laisse l'eau circuler librement : l'hydrolyse des minéraux restants et la décarbonatation s'y poursuivent. Sur calcaire, la décarbonatation procède par le haut, et les argiles de décalcification s'accumulent.",
      climat: "Sans mesure publiée, le calcul donne 19 mm en 100 ans de décarbonatation sous la pluie parisienne. L'épaisseur ne dépend pourtant pas de cela : elle reflète avant tout l'érosion amont, plusieurs mètres au pied des coteaux labourés et quelques centimètres sous couvert forestier.",
    },
    produits: { sable: 280, limon: 260, argile: 300, oxydes: 50, dissous: 110 },
    produitsNote: "Pour 1 kg de colluvions : 300 g d'argiles, 260 g de limons (matériau déjà fin), 280 g de sable, 50 g d'oxydes de fer et 110 g d'ions issus du calcaire dissous. Le bilan varie beaucoup selon le versant d'origine.",
    usages: "Terres agricoles de bas de pente, souvent les plus fertiles et les plus épaisses, mais aussi enjeu majeur pour l'érosion des sols.",
    wikipedia: "https://fr.wikipedia.org/wiki/Colluvion",
  },
  {
    id: "eboulis", nom: "Éboulis & grèzes", categorie: "sedimentaire", sousType: "formation superficielle (gravitaire)",
    swatch: "#b0a89c", densite: 1700,
    codes: [
      { code: "E", sens: " : éboulis (dépôts de gravité, fragments anguleux)." },
      { code: "Ez", sens: " : éboulis récents / vifs, encore alimentés." },
      { code: "GZ", sens: " : grèzes litées (éboulis périglaciaires stratifiés)." },
    ],
    description: "Des débris, détachés d'une falaise par le gel, dévalent la pente en fragments anguleux qui n'ont pas voyagé, et se classent par taille du sommet vers le pied du talus. Les « grèzes litées » de Charente en sont l'équivalent fossile, finement stratifié par les cycles gel-dégel des glaciations.",
    mineralogie: "Fragments anguleux arrachés à la roche supérieure (du calcaire dans la plupart des cas en France), presque sans matrice. Les grèzes, en revanche, présentent une matrice fine et litée.",
    mineraux: [["calcite", 75], ["quartz", 10], ["illite_m", 8], ["goethite", 5], ["dolomite", 2]],
    argiles: ["illite"],
    argilesNote: "Composition identique à celle de la falaise nourricière (ici un cas calcaire typique) ; la terre fine interstitielle concentre le résidu insoluble, dont l'illite est le minéral principal.",
    pedologie: "Formation gravitaire caillouteuse, matériau parental : sur éboulis vifs, les sols restent squelettiques : PEYROSOLS (au moins 60 % d'éléments grossiers), LITHOSOLS sur les gros blocs ; sur grèzes fixées, des CALCOSOLS apparaissent dès que la terre fine se loge entre les cailloux.",
    varietes: [
      { nom: "éboulis vif", note: "Toujours nourri par la falaise, mobile, dépourvu de végétation." },
      { nom: "éboulis fixé", note: "Fixé, il est aujourd'hui recouvert par la végétation." },
      { nom: "grèze litée", note: "Éboulis du périglaciaire, à strates fines : Charente et Périgord." },
    ],
    regions: [
      { nom: "Talus d'éboulis des Alpes", lat: 45.00, lng: 6.50 },
      { nom: "Corniches des Causses", lat: 44.30, lng: 3.25 },
      { nom: "Grèzes litées de Charente", lat: 45.65, lng: 0.15 },
    ],
    ages: [{ de: 0.115, a: 0, label: "Würm (grèzes périglaciaires) à actuel" }],
    alteration: {
      vmin: 0.01, vmax: 0.08, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0913, cas: "Éboulis calcaire du mont Aigoual, en moyenne montagne : 1 041 mm de pluie, dont 575 mm s'infiltrent.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,7, 77 % de carbonate", calcul: "decarbonatation" },
        { v: 0.191, cas: "Éboulis calcaire de haute montagne très arrosée : Chamonix, avec 1 626 mm de pluie, dont 1 203 mm s'infiltrent.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,7, 77 % de carbonate", calcul: "decarbonatation", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "La surface offerte à l'eau est immense, grâce aux fragments anguleux et aux vides. Sur calcaire, cas le plus répandu en France, l'éboulis se dissout vite et se colmate peu à peu d'argiles de décalcification, ce qui le stabilise.",
      climat: "Aucun chiffre publié. Pour un éboulis calcaire, le calcul donne 9 mm en 100 ans de matériau dissous en moyenne montagne et 19 mm en haute montagne arrosée. Les argiles de décalcification comblent peu à peu les vides. C'est le gel qui les produit, surtout durant les périodes froides (grèzes würmiennes) et, aujourd'hui, en haute montagne.",
    },
    produits: { sable: 30, limon: 40, argile: 90, oxydes: 20, dissous: 820 },
    produitsNote: "Pour les éboulis calcaires, cas dominant en France, environ 820 g repartent en solution et ne laissent qu'un résidu rouge argileux (~90 g) qui colmate le talus. Sur un éboulis granitique ou schisteux, c'est le sable et l'argile qui dominent le bilan.",
    usages: "Ils sont peu exploités, mais représentent un risque naturel, avec chutes de blocs et coulées.",
    wikipedia: "https://fr.wikipedia.org/wiki/%C3%89boulis",
  },
  {
    id: "moraine", nom: "Moraine (till)", categorie: "sedimentaire", sousType: "formation superficielle (glaciaire)",
    swatch: "#9a9488", densite: 2000,
    codes: [
      { code: "G", sens: " : formations glaciaires indifférenciées (moraines)." },
      { code: "Gy", sens: " : moraines würmiennes (dernière glaciation)." },
      { code: "Gx", sens: " : moraines du Riss, plus anciennes et plus altérées" },
      { code: "FG", sens: " : dépôts fluvio-glaciaires (FGy würmiens, FGx rissiens), moraines remaniées et triées par les torrents de fonte" },
    ],
    description: "Lorsqu'il fond, un glacier abandonne un mélange chaotique et non trié : blocs erratiques et « farine glaciaire », sans aucun classement, puisque le glacier ne trie pas, contrairement à une rivière. Les moraines des Alpes, des Vosges et du Jura tracent encore les anciennes langues glaciaires du Quaternaire.",
    mineralogie: "Blocs et galets striés, de toutes natures, parfois surtout cristallins dans les Alpes, noyés sans tri dans une farine de roche limono-argileuse.",
    mineraux: [["quartz", 40], ["calcite", 20], ["plagioclases", 10], ["illite_m", 15], ["chlorite_m", 8], ["orthose", 4], ["goethite", 3]],
    argiles: ["illite", "chlorite", "smectites"],
    argilesNote: "Le till est un tout-venant broyé : l'illite et la chlorite « mécaniques », encore fraîches, n'évolueront qu'après stabilisation et végétalisation de la moraine.",
    pedologie: "Ce dépôt meuble hétérométrique, appelé diamicton, relève du matériau parental plutôt que de la roche. Son calcaire conditionne le type de sol : CALCOSOLS ou BRUNISOLS. Le Référentiel pédologique classe les moraines, comme les « alluvions et colluvions de toutes textures », parmi les matériaux carbonatés typiques.",
    varietes: [
      { nom: "moraine de fond (till)", note: "Compactée sous le glacier, elle est très dense." },
      { nom: "moraine frontale / latérale", note: "Bourrelets marquant les positions du front glaciaire." },
      { nom: "bloc erratique", note: "Bloc isolé, arraché à sa roche d'origine et transporté au loin, témoin des glaciations." },
      { nom: "diamicton", note: "Mot descriptif : dépôt meuble, non trié, dans lequel des blocs baignent une matrice fine, quelle qu'en soit la cause (glacier, coulée de boue). Une fois consolidé, il prend le nom de diamictite." }
    ],
    regions: [
      { nom: "Amphithéâtre morainique du Rhône (Lyonnais, Bugey)", lat: 45.80, lng: 5.30 },
      { nom: "Moraines des Vosges", lat: 47.95, lng: 6.95 },
      { nom: "Vallées glaciaires alpines (Tarentaise)", lat: 45.55, lng: 6.60 },
    ],
    ages: [
      { de: 0.115, a: 0.0117, label: "Würm : moraines fraîches (Gy)" },
      { de: 0.30, a: 0.13, label: "Riss : moraines anciennes, altérées (Gx)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 3,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.135, cas: "Front de décarbonatation dans les moraines würmiennes du Rhône : 259 mm infiltrés à Lyon.", src: "eau infiltrée saturée en calcite, masse volumique apparente 2,0, 20 % de calcaire", calcul: "decarbonatation", ref: true },
        { v: 0.625, cas: "Front de décarbonatation dans les moraines récentes des Alpes, à Chamonix (1 203 mm infiltrés).", src: "eau infiltrée saturée en calcite, masse volumique apparente 2,0, 20 % de calcaire", calcul: "decarbonatation" }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "La « farine glaciaire » est faite de minéraux broyés mais chimiquement frais : le glacier casse sans altérer. Abandonnés, ces minéraux s'hydrolysent vivement. Les moraines jouent ainsi le rôle de réacteurs d'altération, et les rivières de fonte charrient beaucoup d'ions.",
      climat: "Aucune donnée publiée n'existe pour une moraine française. Le calcul donne 13,5 mm en 100 ans de décarbonatation sous la pluie de Lyon, et 62 mm dans les Alpes arrosées ; parallèlement, la farine glaciaire, faite de minéraux frais, s'hydrolyse. L'altération sert à dater les moraines : les moraines würmiennes, plus récentes, sont moins altérées que celles du Riss, rouges, décarbonatées et argilisées sur plusieurs mètres.",
    },
    produits: { sable: 350, limon: 250, argile: 250, oxydes: 50, dissous: 100 },
    produitsNote: "Dans 1 kg de moraine, on dénombre 350 g de sable, 250 g de limons (farine glaciaire), 250 g d'argiles néoformées, 50 g d'oxydes de fer et 100 g d'ions. La surface de minéraux frais créée par le broyage glaciaire accélère l'altération, bien plus qu'au sein d'un sédiment mûr.",
    usages: "Exploités comme granulats, surtout d'origine fluvio-glaciaire, ils forment des sols de piémont ; les blocs erratiques font partie du patrimoine géologique.",
    wikipedia: "https://fr.wikipedia.org/wiki/Moraine",
  },
  {
    id: "alterite", nom: "Altérite & arène", categorie: "sedimentaire", sousType: "formation superficielle (altération en place)",
    swatch: "#c4a882", densite: 1700,
    codes: [
      { code: "A", sens: " : altérites (formations d'altération in situ)." },
      { code: "Aγ", sens: " : arène granitique, c'est-à-dire altérite formée sur du granite" },
      { code: "S", sens: " : saprolite, roche pourrie qui garde la structure du substratum" },
    ],
    description: "Le granite s'altère sur place sans avoir bougé : il devient une « arène » sableuse où la bêche s'enfonce, tandis que subsistent, plus bas, des boules de roche saine. Ce produit direct de l'hydrolyse se trouve au cœur du sujet de cet atlas : des profils parfois épais de 30 m, en Limousin ou en Bretagne.",
    mineralogie: "Le quartz, intact, côtoie des argiles néoformées (kaolinite, illite), des feldspaths reliques plus ou moins « pourris » et des oxydes de fer. La structure de la roche mère demeure souvent lisible.",
    mineraux: [["quartz", 45], ["kaolinite_m", 20], ["illite_m", 10], ["orthose", 10], ["muscovite", 7], ["goethite", 8]],
    argiles: ["kaolinite", "vermiculite", "illite"],
    argilesNote: "L'altérite est une usine à argiles : la kaolinite provient des feldspaths, la vermiculite des biotites. L'arène renferme donc déjà le sol de demain.",
    pedologie: "L'altérite marque la transition entre roche et sol : le Référentiel pédologique la classe en horizon C (matériau parental peu transformé) à la base des solums. Sur les arènes granitiques se développent des ALOCRISOLS et des BRUNISOLS acides.",
    varietes: [
      { nom: "arène granitique", note: "altérite sableuse du granite, qui fournit le sable à bâtir des campagnes du Massif central." },
      { nom: "saprolite", note: "Totalement altérée, elle reste pourtant structurée comme la roche d'origine (« roche pourrie »)." },
      { nom: "argile d'altération", note: "Altérite argileuse brun-rouge des roches tendres. Le lehm, lui, est un lœss décarbonaté (voir la fiche lœss)." },
      { nom: "boule de granite (chaos)", note: "Un noyau de roche saine demeure au centre de l'arène, comme dans les chaos de Ploumanac'h, du Sidobre ou de Huelgoat." },
    ],
    regions: [
      { nom: "Arènes du Limousin (Millevaches)", lat: 45.72, lng: 1.90 },
      { nom: "Arènes bretonnes (Huelgoat)", lat: 48.36, lng: -3.75 },
      { nom: "Sidobre (chaos de boules)", lat: 43.62, lng: 2.38 },
      { nom: "Altérites du Morvan", lat: 47.15, lng: 4.05 },
    ],
    ages: [{ de: 66, a: 0, label: "Surtout paléogène (altération tropicale) puis quaternaire : profils souvent hérités" }],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 2,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.012, cas: "Sous 1 400 mm de pluie et à 6 °C, dans les Vosges, le front d'altération du granite du Strengbach progresse en profondeur.", src: "Ackerer et al. 2016, uranium-thorium-radium", ref: true },
        { v: 0.022, cas: "Même profil, dont la surface s'abaisse au fil du temps.", src: "Ackerer et al. 2016, béryllium 10" }
      ],
      sources: [
        "Ackerer J., Chabaux F., Van der Woerd J. et al. (2016), « Regolith evolution on the millennial timescale from combined U–Th–Ra isotopes and in situ cosmogenic ¹⁰Be analysis in a weathering profile (Strengbach catchment, France) », Earth Planet. Sci. Lett. 453 : 33–43"
      ],
      mecanisme: "Ce produit d'altération n'est pas une fin en soi : les feldspaths relictuels finissent leur hydrolyse en kaolinite, la biotite devient vermiculite puis oxydes de fer, et le quartz demeure en sable. Beaucoup de profils français, hérités du Paléogène sous des climats tropicaux (≥ 22 °C), ne se reformeraient plus aujourd'hui.",
      climat: "Au sommet du bassin du Strengbach (Vosges), la mesure indique : l'arène gagne 1,2 mm en 100 ans sur le granite, pendant que sa surface descend de 2,2 mm ; le profil de 2 m reste à peu près à l'équilibre. Nombre de profils plus épais, hérités des climats paléogènes tropicaux, ne se reformeraient pas de nos jours.",
    },
    produits: { sable: 400, limon: 60, argile: 400, oxydes: 40, dissous: 100 },
    produitsNote: "Pour 1 kg d'arène, on compte 400 g de sable quartzeux (le « sable de carrière »), 400 g d'argiles dont la kaolinite fournit le kaolin de Limoges, 40 g d'oxydes de fer et 100 g d'ions résiduels. Comparés à ceux d'un granite frais, les ions restants sont peu nombreux : l'essentiel a déjà été exporté.",
    usages: "Matériau de remblai et sable issus des arènes, kaolin destiné à la porcelaine de Limoges ; il porte les sols acides du Massif central et de Bretagne.",
    wikipedia: "https://fr.wikipedia.org/wiki/Alt%C3%A9rite",
  },
  {
    id: "dunes", nom: "Dunes & sables éoliens", categorie: "sedimentaire", sousType: "formation superficielle (éolienne)",
    swatch: "#e2d3ac", densite: 1600,
    codes: [
      { code: "Dz", sens: " : dunes récentes ou vives (littorales ou continentales)." },
      { code: "Dy", sens: " : dunes anciennes, fixées et souvent podzolisées." },
    ],
    description: "Le vent trie le sable plus sévèrement qu'une rivière : il ne conserve que des grains de quartz de même calibre, arrondis et dépolis (« ronds-mats »), d'où la grande pureté de ce sable. La dune du Pilat, haute d'environ 102 m et la plus élevée d'Europe, avance encore de 1 à 5 m par an sur la forêt.",
    mineralogie: "Quartz de 85 à 95 %, grains bien calibrés, arrondis et mats ; jusqu'à 10 à 15 % de débris coquilliers dans les dunes littorales, un peu de feldspath et de minéraux lourds.",
    mineraux: [["quartz", 90], ["calcite", 5], ["orthose", 2], ["goethite", 2], ["magnetite", 1]],
    argiles: [],
    argilesNote: "Un sable quartzeux lavé à plusieurs reprises ne produit presque rien, faute de matière à hydrolyser. Quant aux coquilles broyées des dunes littorales, elles se dissolvent.",
    pedologie: "Matériau meuble et parental : sur les dunes récentes, des ARÉNOSOLS (sols sableux peu différenciés) ; sur les sables landais, la podzolisation crée des PODZOSOLS à alios, horizon induré qu'il a fallu défoncer avant de planter la forêt des Landes.",
    varietes: [
      { nom: "dune littorale vive", note: "Dune mobile, nourrie par la plage : c'est le cas de la dune du Pilat." },
      { nom: "dune fixée / grise", note: "Stabilisée par la végétation, souvent podzolisée (Landes)." },
      { nom: "sable éolien continental", note: "Ces nappes ont été soufflées lors d'une période froide et sèche." },
    ],
    regions: [
      { nom: "Dune du Pilat (Gironde)", lat: 44.59, lng: -1.21 },
      { nom: "Sables des Landes de Gascogne", lat: 44.20, lng: -0.90 },
      { nom: "Dunes du Nord (Flandre maritime)", lat: 51.02, lng: 2.37 },
    ],
    ages: [{ de: 0.115, a: 0.0117, label: "Dernière glaciation : sables éoliens de couverture (Sable des Landes)" }, { de: 0.0117, a: 0, label: "Holocène à actuel (dunes encore mobiles)" }],
    alteration: {
      vmin: 0.0005, vmax: 0.005, facilite: 1,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.78, cas: "Front de décarbonatation d'une dune littorale riche de 5 % de coquilles, en Aquitaine : 300 mm s'infiltrent à Bordeaux.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,6", calcul: "decarbonatation", ref: true },
        { v: 1.39, cas: "Front de décarbonatation d'une dune littorale riche de 5 % de coquilles, en Bretagne : 534 mm s'infiltrent à Brest.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,6", calcul: "decarbonatation" }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Presque aucun minéral ne s'altère, le quartz étant déjà le survivant final. Seule la fraction coquillière se dissout, et la dune se décalcifie. L'eau traversant ce sable acide et pauvre podzolise en revanche fortement les dunes fixées, à l'origine de l'alios des Landes, sable cimenté sous le sol par l'humus et les oxydes de fer et d'aluminium.",
      climat: "Seules les coquilles se dissolvent, le quartz ne s'altérant pas. Le calcul donne 78 mm en 100 ans de décarbonatation sous la pluie de Bordeaux et 139 mm sous celle de Brest : une dune fixée perd ses coquilles en surface en quelques siècles, avant de se podzoliser. Ce qui la fait vivre reste le vent, qui la déplace de 1 à 5 m par an au Pilat.",
    },
    produits: { sable: 950, limon: 15, argile: 15, oxydes: 5, dissous: 15 },
    produitsNote: "Sur 1 kg de sable dunaire, environ 950 g demeurent du sable : le quartz ne fournit plus rien, c'est le bout de la chaîne. Les 15 g d'ions viennent des débris coquilliers, alors que les oxydes de fer s'accumulent en profondeur, dans l'alios.",
    usages: "Usages : sable industriel et de construction ; protection du littoral, la dune jouant le rôle de digue naturelle ; forêt des Landes replantée pour la fixer.",
    wikipedia: "https://fr.wikipedia.org/wiki/Dune",
  },
  {
    id: "terra_rossa", nom: "Terra rossa (argile de décalcification)", categorie: "sedimentaire", sousType: "formation superficielle (résiduelle)",
    swatch: "#a34a32", densite: 1700,
    codes: [
      { code: "RC", sens: " : résiduel de décalcification (argiles rouges sur calcaire)." },
      { code: "Rk", sens: " : remplissage karstique (poches, dolines)." },
    ],
    description: "Le fantôme rouge des calcaires disparus. Quand la roche se dissout, son résidu insoluble, de 2 à 5 %, reste sur place et s'accumule lentement, formant une argile rouge vif. Un mètre de cette argile exige la dissolution de dizaines de mètres de calcaire. Une partie vient aussi de poussières apportées par le vent (lœss, poussières sahariennes) : la terra rossa est souvent un mélange. On la trouve dans les poches des causses, les dolines et les terres à vigne méditerranéennes.",
    mineralogie: "Argiles (kaolinite, illite, smectites), oxydes de fer, responsables de la couleur rouge par l'hématite, et silex ou quartz résiduels.",
    mineraux: [["kaolinite_m", 35], ["illite_m", 30], ["smectites_m", 10], ["quartz", 12], ["hematite", 5], ["goethite", 5], ["calcite", 3]],
    argiles: ["kaolinite", "illite", "smectites"],
    argilesNote: "Cette roche est déjà un concentré d'argiles, résidu insoluble de dizaines de mètres de calcaire dissous (davantage pour les calcaires les plus purs), que l'hématite a rubéfié.",
    pedologie: "Il s'agit davantage d'un résidu pédologique que d'une roche : c'est le matériau des FERSIALSOLS (sols rouges fersiallitiques méditerranéens) selon le Référentiel pédologique.",
    varietes: [
      { nom: "terra rossa méditerranéenne", note: "rouge vif, hématitique : Provence, Languedoc, causses." },
      { nom: "terra fusca", note: "Variante brune, en climat tempéré humide (8 à 15 °C)." },
      { nom: "remplissage de doline / poche karstique", note: "Elle piège fossiles et minéraux, à l'image des phosphorites du Quercy." },
    ],
    regions: [
      { nom: "Grands Causses (poches et dolines)", lat: 44.20, lng: 3.15 },
      { nom: "Garrigues du Languedoc", lat: 43.75, lng: 3.85 },
      { nom: "Plateaux de Provence", lat: 43.70, lng: 5.60 },
    ],
    ages: [{ de: 23.04, a: 0, label: "Néogène-Quaternaire (accumulation très lente, souvent héritée)" }],
    alteration: {
      vmin: 0.001, vmax: 0.01, facilite: 1,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.03, cas: "Front de dissolution du calcaire nourricier, sur le plateau du Luberon, sous climat méditerranéen.", src: "Thomas et al. 2017, chlore 36", ref: true }
      ],
      sources: [
        "Thomas F., Godard V., Bellier O. et al. (2017), « Morphological controls on the dynamics of carbonate landscapes under a mediterranean climate », Terra Nova 29 : 173–182 (chlore 36)"
      ],
      mecanisme: "Il s'agit déjà du résidu ultime : ce qui pouvait partir s'en est allé avec le calcaire. Elle n'évolue plus que sur place, les argiles mûrissent et l'hématite se déshydrate encore, ce qui accentue la rougeur. Très stable chimiquement, elle est en revanche très érodable mécaniquement une fois mise à nu.",
      climat: "Le résidu n'évolue presque plus : c'est le calcaire sous-jacent qui avance, en se dissolvant et en abandonnant ses restes. Sur le plateau du Luberon, le chlore 36 indique 3 mm de calcaire perdu en 100 ans. La couleur vive exige chaleur et étés secs (hématite : plus de 15 °C, sol sec 45 jours d'affilée au moins). Sous climat tempéré humide (8 à 15 °C, pluie au-delà de 65 % de l'ETP), le même résidu reste brun, à goethite (terra fusca).",
    },
    produits: { sable: 80, limon: 60, argile: 750, oxydes: 100, dissous: 10 },
    produitsNote: "Une terra rossa de 1 kg contient environ 750 g d'argiles et 100 g d'hématite et de goethite (quelques pour cent d'hématite suffisent à la rougir) : elle est déjà un produit final. Presque rien ne passe en solution (10 g), tout le calcaire ayant disparu bien avant. Les 80 g de « sable » sont des silex et du quartz résiduels.",
    usages: "Sols de vignes et de truffières méditerranéennes ; argile employée localement pour la poterie.",
    wikipedia: "https://fr.wikipedia.org/wiki/Terra_rossa",
  },
  {
    id: "argile_silex", nom: "Argile à silex", categorie: "sedimentaire", sousType: "formation superficielle (résiduelle)",
    swatch: "#8a7458", densite: 1800,
    codes: [
      { code: "RS", sens: " : résiduel riche en silex, qui forme l'argile à silex sur craie" },
      { code: "Rc", sens: " : formations résiduelles de la craie." },
    ],
    description: "La craie se dissout, mais ses rognons de silex, indestructibles, restent mêlés à l'argile insoluble. Ce manteau recouvre les plateaux de Normandie et du Bassin parisien : d'où ces champs couverts de silex, alors que la craie porteuse a disparu depuis longtemps.",
    mineralogie: "Argiles (kaolinite et smectites, un peu d'illite), rognons et éclats de silex, un peu de sable quartzeux ; teinte brun-roux, texture collante, très forte charge en cailloux.",
    mineraux: [["calcedoine", 35], ["kaolinite_m", 25], ["smectites_m", 15], ["illite_m", 10], ["goethite", 10], ["quartz", 5]],
    argiles: ["smectites", "kaolinite"],
    argilesNote: "Issues de la mer crétacée, les smectites ont été kaolinisées en surface par des millions d'années de lessivage, résidu de la craie.",
    pedologie: "Formation résiduelle, matériau parental des plateaux crayeux : les sols, de type NÉOLUVISOL, sont chargés en silex et acides en surface, bien que la craie repose dessous. C'est le paradoxe des « terres froides » normandes.",
    varietes: [
      { nom: "argile à silex de plateau", note: "Il forme un manteau épais sur les plateaux crayeux du Pays de Caux et du Perche." },
      { nom: "biefs à silex", note: "Forme remaniée par solifluxion le long des versants." },
    ],
    regions: [
      { nom: "Pays de Caux (Normandie)", lat: 49.65, lng: 0.75 },
      { nom: "Le Perche", lat: 48.50, lng: 0.75 },
      { nom: "Plateaux picards", lat: 49.85, lng: 2.20 },
    ],
    ages: [{ de: 66, a: 0, label: "Paléogène à Quaternaire : altération commencée dès l'émersion de la craie, poursuivie jusqu'à aujourd'hui" }],
    alteration: {
      vmin: 0.001, vmax: 0.01, facilite: 1,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0199, cas: "Front de dissolution de la craie sous-jacente, dans le bassin parisien, avec 165 mm infiltrés à Paris", src: "dissolution de la craie à saturation, masse volumique 1,8", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Résidu ultime, comme la terra rossa : le calcaire a disparu et ne restent que l'inaltérable (silex) et l'insoluble (argile). Chimiquement, l'évolution est très lente ; en revanche, cette terre est lourde, imperméable et glisse volontiers le long des versants.",
      climat: "Presque plus d'évolution : c'est la craie sous-jacente qui progresse, à 2 mm en 100 ans sous la pluie de Paris selon le calcul. Pour laisser 1 m d'argile à silex, il faut dissoudre 30 à 50 m de craie, d'où plusieurs millions d'années.",
    },
    produits: { sable: 300, limon: 60, argile: 600, oxydes: 30, dissous: 10 },
    produitsNote: "Pour 1 kg d'argile à silex : environ 600 g d'argiles et 300 g de « sable » (en réalité les éclats de silex), ainsi que presque rien en solution (10 g). Elle constitue le déchet incompressible de la craie, c'est-à-dire ce qui subsiste après que 97 % de la roche mère a été emportée par l'eau.",
    usages: "Usages : silex pour l'empierrement et, jadis, la construction en damier ; terres lourdes où poussent blé et herbages ; cailloux, source de contraintes agricoles.",
    wikipedia: "https://fr.wikipedia.org/wiki/Argile_%C3%A0_silex",
  },
  {
    id: "gypse", nom: "Gypse", categorie: "sedimentaire", sousType: "évaporitique",
    swatch: "#e8e2d5", densite: 2300,
    description: "Ce sulfate de calcium hydraté se précipite par évaporation de lagunes très salées. Le Bassin parisien en renferme les plus grands gisements européens exploités, à l'origine du plâtre de Paris, tandis que sa dissolution très rapide provoque fontis et effondrements en Île-de-France.",
    mineralogie: "Gypse CaSO₄·2H₂O 80 à 98 %, ± anhydrite, argiles, marnes.",
    varietes: [
      { nom: "gypse saccharoïde", note: "Grain fin et sucré, de couleur blanche : il forme l'essentiel des « masses » du gypse parisien." },
      { nom: "sélénite", note: "Cristaux transparents, de grande taille et lamellaires, disséminés dans les marnes voisines." },
      { nom: "albâtre gypseux", note: "Forme massive à grain très fin, travaillée depuis l'Antiquité en vases et en statuettes." },
    ],
    regions: [
      { nom: "Buttes de Montmartre, Cormeilles", lat: 48.97, lng: 2.20 },
      { nom: "Trias provençal et alpin", lat: 44.19, lng: 5.94 },
      { nom: "Keuper lorrain", lat: 48.8, lng: 6.4 },
    ],
    ages: [
      { de: 237, a: 201, label: "Trias (Keuper) : Lorraine, Provence, Alpes" },
      { de: 37.71, a: 33.9, label: "Priabonien : « masses » du gypse parisien" },
    ],
    alteration: {
      vmin: 0.3, vmax: 2, facilite: 5,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.25, cas: "Sicile, gypse microcristallin", src: "Madonia et al. 2016 (EGU), micro-érosimètre depuis 1993" },
        { v: 0.7, cas: "Moyenne de 26 sites en Italie (climat méditerranéen)", src: "Cucchi et al. 1998, micro-érosimètre", ref: true },
        { v: 1.48, cas: "Alpes très arrosées (Chamonix : 1 626 mm de pluie)", src: "0,91 mm pour 1 000 mm de pluie", calcul: "gypse" }
      ],
      sources: [
        "Cucchi F., Forti P. et Finocchiaro F. (1998), « Gypsum degradation in Italy with respect to climatic, textural and erosional conditions », Supplementi di Geografia Fisica e Dinamica Quaternaria 3 (4) : 41–49 (micro-érosimètre, 26 sites, 9 ans)",
        "Madonia P., Vattano M., Di Maggio C. et De Waele J. (2016), EGU General Assembly, EGU2016-14004 (Sicile : 0,25 à 0,74 mm/an selon le faciès)"
      ],
      mecanisme: "Dissolution congruente et rapide : sa solubilité atteint environ 2,5 g/L, soit 100 fois celle de la calcite. L'acidité n'est pas nécessaire, l'eau pure suffit. Cavités, dolines et fontis se forment à l'échelle de la décennie.",
      climat: "En Italie, la perte mesurée atteint 0,91 mm par 1 000 mm de pluie : cela fait 70 mm en 100 ans en moyenne méditerranéenne (25 mm pour un gypse microcristallin de Sicile, 74 mm pour une sélénite à grands cristaux). Sous les 1 600 mm des Alpes, la même loi donne environ 150 mm en 100 ans. C'est quinze à vingt-cinq fois la vitesse du calcaire (3 mm en 100 ans dans le Luberon, 11 mm dans le Jura) : en climat humide, un affleurement ne tient que s'il est caché sous des marnes.",
    },
    produits: { sable: 0, limon: 0, argile: 20, oxydes: 0, dissous: 980 },
    produitsNote: "Presque tout passe en solution (Ca²⁺ et SO₄²⁻, qui donnent des eaux séléniteuses et dures). Il ne subsiste presque aucun sol, seulement les impuretés argileuses.",
    usages: "Plâtre, ciment (retardateur de prise), amendement.",
    wikipedia: "https://fr.wikipedia.org/wiki/Gypse",
  },
  {
    id: "sel", nom: "Sel gemme (halite)", categorie: "sedimentaire", sousType: "évaporitique",
    swatch: "#eef0f4", densite: 2160,
    description: "Cristallisé par évaporation extrême de mers fermées, le chlorure de sodium n'apparaît pas en surface sous nos climats : il se dissout aussitôt. Exploité depuis l'Antiquité en Lorraine et dans le Jura, où il est resté en couches peu déformées ; ailleurs, enfoui sous des kilomètres de couches, il flue à la manière d'un glacier et monte en dômes.",
    mineralogie: "Halite NaCl 90 à 99 %, ± sylvite KCl (potasse d'Alsace), argiles, anhydrite.",
    varietes: [
      { nom: "sel gemme massif", note: "Cristaux volumineux, limpides à translucides : il s'agit de la halite pure des bancs profonds." },
      { nom: "sel fibreux (chevelu)", note: "Aiguilles capillaires fines, formées dans les fissures des argiles salifères." },
      { nom: "roche saline rythmée", note: "Fins lits de halite alternant avec de l'argile : chaque couplet marque un cycle d'évaporation annuel." },
    ],
    regions: [
      { nom: "Varangéville (dernière mine active)", lat: 48.64, lng: 6.32 },
      { nom: "Salins-les-Bains / Lons (Jura)", lat: 46.94, lng: 5.88 },
      { nom: "Bassin potassique d'Alsace", lat: 47.82, lng: 7.25 },
      { nom: "Salies-de-Béarn", lat: 43.47, lng: -0.92 },
    ],
    ages: [
      { de: 237, a: 201, label: "Trias (Keuper) : Lorraine, Jura, Béarn" },
      { de: 33.9, a: 31, label: "Rupélien inférieur : bassin potassique de Mulhouse (potasse)" },
    ],
    alteration: {
      vmin: 0.5, vmax: 130, facilite: 5,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.8, cas: "Atacama, sur une surface plane, là où il tombe au plus 20 mm de pluie", src: "De Waele et al., cité par Pérez-Villar et al. 2026" },
        { v: 51, cas: "Cardona, Catalogne (508 mm de pluie), sel nu", src: "≈ 10 mm de sel pour 100 mm de pluie", calcul: "sel", ref: true }
      ],
      sources: [
        "Pérez-Villar G., Gutiérrez F., Benito-Calvo A. et Roqué C. (2026), « Erosion rates in rock salt exposures with diverse karren… », Geomorphology 500 : 110228 (Cardona, piquets, photogrammétrie, laser)",
        "De Waele J. et al. (2009, 2020), micro-érosimètre sur le sel de l'Atacama (cités par Pérez-Villar et al. 2026)"
      ],
      mecanisme: "Avec 360 g/L, la solubilité est extrême : dès qu'une eau non saturée arrive, le sel se dissout. Il n'affleure donc jamais en France, son toit étant toujours une surface de dissolution enfouie.",
      climat: "Mesuré à Cardona (Catalogne), seul grand affleurement de sel proche de la France : environ 10 mm de sel perdu pour 100 mm de pluie, soit environ 5 m en 100 ans sous 508 mm, le diapir s'élevant pour sa part encore plus vite. Dans l'Atacama, sans pluie, il ne disparaît que 8 cm en 100 ans. En France, le sel reste enfoui : son toit se situe toujours au niveau d'une surface de dissolution.",
    },
    produits: { sable: 0, limon: 0, argile: 10, oxydes: 0, dissous: 990 },
    produitsNote: "Dissolution complète : Na⁺ et Cl⁻ rejoignent d'abord les rivières (dont témoignent les sources salées de Lorraine), puis l'océan, qu'ils contribuent à saler.",
    usages: "Il sert à l'alimentation, au déneigement et à la chimie du chlore et de la soude.",
    wikipedia: "https://fr.wikipedia.org/wiki/Halite",
  },
  {
    id: "houille", nom: "Houille", categorie: "sedimentaire", sousType: "organique",
    swatch: "#3a3a3a", densite: 1350,
    description: "Ce sont les végétaux des grandes forêts équatoriales du Carbonifère, enfouis puis transformés en roche combustible. Les gisements du Nord, de Lorraine et de Saint-Étienne ont bâti l'industrie française, et leurs terrils dressent des montagnes artificielles.",
    mineralogie: "Carbone organique 70 à 90 %, matières volatiles, cendres (argiles, quartz), pyrite.",
    varietes: [
      { nom: "houille grasse", note: "Riche en matières volatiles et cokéfiable, c'est le charbon le plus recherché pour la sidérurgie." },
      { nom: "houille maigre", note: "Pauvre en matières volatiles, il se rapproche de l'anthracite par son pouvoir calorifique." },
      { nom: "tonstein", note: "Fin niveau d'argile kaolinique, issu de cendres volcaniques altérées, intercalé dans les veines : les mineurs l'utilisaient comme repère pour corréler les couches." },
      { nom: "boghead", note: "Né de l'accumulation d'algues (Botryococcus) dans un lac, ce charbon est très riche en huile : celui d'Autun a servi à en distiller." },
      { nom: "cannel-coal", note: "Compact et mat, ce charbon résulte de spores et de fins débris tombés dans les mares de la forêt houillère. Sa flamme, claire, rappelle celle d'une chandelle (candle)." }
    ],
    regions: [
      { nom: "Bassin minier du Nord (Lens, terrils)", lat: 50.43, lng: 2.83 },
      { nom: "Bassin houiller lorrain (Forbach)", lat: 49.19, lng: 6.90 },
      { nom: "Saint-Étienne", lat: 45.44, lng: 4.39 },
      { nom: "Cévennes (Alès)", lat: 44.12, lng: 4.08 },
    ],
    ages: [{ de: 323.4, a: 298.9, label: "Carbonifère supérieur (forêts houillères)" }],
    alteration: {
      facilite: 3,
      mecanisme: "D'une part, la matière organique s'oxyde lentement, « brûlant » à froid en CO₂ ; d'autre part, la pyrite oxydée acidifie les eaux (drainage minier acide). Certains terrils atteignent la combustion interne.",
    },
    produits: { sable: 0, limon: 100, argile: 150, oxydes: 30, dissous: 20, autre: 700 },
    produitsNote: "Le charbon altéré ne donne pas de sol : près de 70 % de sa masse repart en CO₂, et seules demeurent des cendres argileuses et des oxydes de fer tirés de la pyrite.",
    usages: "Historiquement utilisé comme combustible en France (mines fermées en 2004), il sert aussi de coke à la sidérurgie.",
    wikipedia: "https://fr.wikipedia.org/wiki/Houille",
  },
  {
    id: "tourbe", nom: "Tourbe", categorie: "sedimentaire", sousType: "organique",
    swatch: "#5d4a36", densite: 300,
    description: "Ce sont des végétaux mal décomposés, accumulés dans un milieu gorgé d'eau : sphaignes dans les tourbières acides (Jura, monts d'Arrée), laîches, roseaux et mousses brunes dans les tourbières alcalines des vallées et des marais littoraux (Somme, Cotentin). Depuis 10 000 ans, ces archives du climat conservent du carbone, qu'elles libèrent massivement une fois drainées.",
    mineralogie: "Matière organique entre 80 et 95 %, eau pouvant atteindre 90 % du volume, poussières minérales.",
    pedologie: "Elle relève à la fois du sol et de la roche : le Référentiel pédologique la range parmi les HISTOSOLS (sols organiques), qu'ils soient fibriques, mésiques ou sapriques selon leur degré de décomposition.",
    varietes: [
      { nom: "tourbe blonde (fibrique)", note: "Sphaignes peu décomposées, aux fibres bien visibles : il s'agit du stade le plus jeune." },
      { nom: "tourbe brune (mésique)", note: "mi-décomposée, brun sombre." },
      { nom: "tourbe noire (saprique)", note: "Entièrement décomposée, elle est pâteuse et compacte, et constituait le combustible historique." },
    ],
    regions: [
      { nom: "Tourbières du Jura (Frasne)", lat: 46.85, lng: 6.16 },
      { nom: "Yeun Elez, Monts d'Arrée", lat: 48.38, lng: -3.92 },
      { nom: "Aubrac, Margeride", lat: 44.7, lng: 3.1 },
    ],
    ages: [{ de: 0.0117, a: 0, label: "Holocène (depuis la fin de la dernière glaciation)" }],
    alteration: {
      vmin: 1, vmax: 20, facilite: 5,
      // D.8.3 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 5.8, cas: "Drainée depuis 1851 à Holme Fen (Angleterre), la tourbe a vu le sol s'abaisser de 1979 à 2022, alors qu'il n'en reste qu'une couche mince.", src: "Waltham 2022, poteau de Holme Post (un peu plus de 250 mm en 43 ans)" },
        { v: 10, cas: "Floride : tourbe drainée à Belle Glade, sous climat chaud, dont le sol s'est abaissé ces dernières années", src: "Waltham 2022, poteau de Belle Glade" },
        { v: 12, cas: "Aux Pays-Bas, les prairies laitières sur tourbe drainée voient le sol s'abaisser, surtout à cause de l'oxydation de la tourbe.", src: "Van den Akker, Hendriks et Pleijter 2012", ref: true }
      ],
      sources: [
        "Waltham T. (2022), « Ground subsidence on peat », Mercian Geologist 20 (3) : 214–215 (poteaux de Holme Post, Angleterre, et de Belle Glade, Floride ; d'après Hutchinson J. N. (1980), Journal of Ecology 68 : 229–249)",
        "Van den Akker J. J. H., Hendriks R. F. A. et Pleijter M. (2012), « CO₂ emissions of peat soils in agricultural use: calculation and prevention », Agrociencia Uruguay 16 (3) : 43–50"
      ],
      mecanisme: "Noyée, la tourbe demeure stable, faute d'oxygène. Drainée, elle se minéralise : les microbes la transforment en CO₂ et la surface baisse de 6 à 12 mm par an, selon les mesures citées plus bas.",
      climat: "Pour la tourbe, la vitesse désigne l'abaissement du sol après drainage : la tourbe se tasse et, surtout, se transforme en CO₂. Dans les prairies néerlandaises drainées, le sol perd 1 200 mm en 100 ans, contre 1 000 mm en Floride, sous climat chaud. À Holme Fen, drainé depuis 1851 et ne conservant plus qu'une tourbe mince, la baisse atteint encore 580 mm. Le poteau dépasse désormais le sol de plus de 4 m. Noyée, la tourbe ne baisse pas et s'accumule. Chaque millimètre perdu aux Pays-Bas libère environ 2,3 tonnes de CO₂ par hectare (Van den Akker et al. 2012).",
    },
    produits: { sable: 0, limon: 40, argile: 60, oxydes: 0, dissous: 20, autre: 880 },
    produitsNote: "Près de 88 % de la masse sèche repart sous forme de CO₂ (et d'un peu de méthane). Le résidu minéral est infime : la tourbe est une roche « évanescente ».",
    usages: "Terreau horticole (en recul : réduction volontaire en France, interdiction de la vente aux jardiniers amateurs annoncée au Royaume-Uni), jadis combustible, et tourbage du whisky.",
    wikipedia: "https://fr.wikipedia.org/wiki/Tourbe",
  },
  {
    id: "lignite", nom: "Lignite", categorie: "sedimentaire", sousType: "organique (charbon)",
    swatch: "#5a4436", densite: 1300,
    codes: [
      { code: "selon l'âge", sens: " : désigné par l'étage qui le porte (e3 pour les lignites du Soissonnais, faciès fuvélien du Crétacé provençal, c8 à 9F selon les cartes)" },
    ],
    description: "Jeune et tendre, ce charbon brun marque le passage de la tourbe à la houille. Le bois y est parfois encore reconnaissable. Il alimentait les centrales de Provence (Gardanne) et affleure dans les Landes et dans le Gard.",
    mineralogie: "Des débris ligneux bien visibles (« lignite xyloïde ») accompagnent la matière organique (60 à 75 % de carbone), l'eau et les argiles.",
    mineraux: [["matorg", 70], ["illite_m", 12], ["quartz", 8], ["pyrite", 6], ["calcite", 4]],
    argiles: ["illite", "smectites"],
    argilesNote: "Des marécages proviennent les smectites et l'illite héritées, que restituent les cendres du lignite ; la pyrite oxydée, elle, acidifie le profil entier.",
    varietes: [
      { nom: "jais", note: "lignite noir compact, poli en bijou (deuil)." },
    ],
    regions: [
      { nom: "Bassin de Fuveau-Gardanne (Provence)", lat: 43.45, lng: 5.48 },
      { nom: "Arjuzanx (Landes)", lat: 44.02, lng: -0.85 },
      { nom: "Lignites du Cénomanien (Saint-Paulet-de-Caisson, Gard)", lat: 44.26, lng: 4.60 },
    ],
    ages: [
      { de: 100.5, a: 93.9, label: "Cénomanien : lignites du Gard (Saint-Paulet-de-Caisson)" },
      { de: 80, a: 74, label: "Campanien (Fuvélien, ≈ 75 Ma) : lignite de Gardanne et Fuveau" },
      { de: 56, a: 54, label: "Yprésien inférieur (Sparnacien) : lignites du Soissonnais" },
      { de: 5.333, a: 3.6, label: "Pliocène inférieur : lignite d'Arjuzanx (Landes)" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Exposé à l'air, il s'oxyde et se fragmente, et peut s'échauffer jusqu'à prendre feu dans les terrils. En surface, sa matière organique se minéralise doucement en CO₂.",
    },
    produits: { sable: 0, limon: 80, argile: 150, oxydes: 20, dissous: 30, autre: 720 },
    produitsNote: "Environ 720 g partent en CO₂ et en matière organique dissoute. Il reste les cendres, soit 150 g d'argiles et 80 g de limons, auxquelles s'ajoute la pyrite qui rouille (drainage acide).",
    usages: "Combustible (centrales thermiques, en voie d'abandon).",
    wikipedia: "https://fr.wikipedia.org/wiki/Lignite",
  },
  {
    id: "anthracite", nom: "Anthracite", categorie: "sedimentaire", sousType: "organique (charbon)",
    swatch: "#242428", densite: 1500,
    codes: [
      { code: "h", sens: " : houiller du Briançonnais (zone houillère alpine) ; faciès de la houille, l'anthracite porte le code Carbonifère" },
    ],
    description: "Le plus « cuit » des charbons : noir, dur, à l'éclat quasi métallique, il a perdu presque toute sa matière volatile sous l'effet de la chaleur (plus de ≈ 200 °C) subie lors d'un enfouissement profond ; la pression n'y joue qu'un rôle secondaire. Sa combustion ne produit pas de fumée et son pouvoir calorifique est élevé. Côté français, La Mure (Isère) fut un grand site d'extraction.",
    mineralogie: "Carbone supérieur à 90 %, matières volatiles très rares ; la tectonique alpine l'a parfois déformé.",
    mineraux: [["matorg", 88], ["quartz", 5], ["illite_m", 4], ["pyrite", 3]],
    argiles: ["illite"],
    argilesNote: "Carbone presque exclusif ; les cendres, peu abondantes, apportent un peu d'illite héritée.",
    regions: [
      { nom: "Bassin de La Mure (Isère)", lat: 44.90, lng: 5.79 },
      { nom: "Cévennes / Ardèche", lat: 44.30, lng: 4.05 },
    ],
    ages: [{ de: 320, a: 300, label: "Carbonifère (houiller), parfois remobilisé aux Alpes" }],
    alteration: {
      facilite: 2,
      mecanisme: "Très inerte, car presque pur en carbone : il s'altère peu, mais s'oxyde lentement au contact de l'air.",
    },
    produits: { sable: 0, limon: 60, argile: 100, oxydes: 40, dissous: 20, autre: 780 },
    produitsNote: "En CO₂, environ 780 g de carbone finissent par partir, très lentement ; le reste, résidu minéral (argiles, quartz des cendres), complète le bilan.",
    usages: "Combustible de haute qualité, pour usages domestiques comme industriels ; sert aussi à la filtration.",
    wikipedia: "https://fr.wikipedia.org/wiki/Anthracite",
    varietes: [{ nom: "Semi-anthracite", note: "Le carbone fixe atteint 86 à 92 % : c'est une étape intermédiaire entre la houille et l'anthracite." }, { nom: "Méta-anthracite", note: "Carbone fixe supérieur à 98 % : il s'agit du dernier palier avant le graphite." }],
  },
  {
    id: "schiste_bitumineux", nom: "Schiste bitumineux (roche mère)", categorie: "sedimentaire", sousType: "organique (pélite bitumineuse)",
    swatch: "#3a3830", densite: 2100,
    codes: [
      { code: "selon la feuille", sens: " : schistes carton du Toarcien inférieur, notés par l'indice du Toarcien, dont le numéro varie d'une feuille lorraine à l'autre (l1 y désigne l'Hettangien)" },
      { code: "r1", sens: " : schistes bitumineux autuniens (bassin d'Autun, Permien inférieur)" },
    ],
    description: "Argile saturée de kérogène, matière organique non transformée : c'est la roche mère des pétroles, qui livre de l'huile sous l'effet de la chaleur. Exemples français : les schistes carton du Toarcien et les schistes bitumineux permiens d'Autun, distillés jadis en huile de schiste.",
    mineralogie: "Argiles, silt fin et kérogène (de 5 à 25 %). La roche est feuilletée, brune à noire, et dégage une odeur bitumineuse à la cassure.",
    mineraux: [["illite_m", 35], ["matorg", 25], ["quartz", 20], ["calcite", 10], ["pyrite", 10]],
    argiles: ["illite", "smectites", "interstratifies"],
    argilesNote: "Avant tout une pélite : après oxydation de la matière organique, le résidu est dominé par l'illite et les interstratifiés hérités.",
    varietes: [
      { nom: "ampélite", note: "schiste noir carboné et pyriteux du Paléozoïque." },
      { nom: "schistes carton (Toarcien)", note: "Feuillets bruns et fins, très chargés en matière organique." },
      { nom: "sapropèle", note: "boue organique actuelle, précurseur non consolidé." },
      { nom: "black shales", note: "Ces argiles noires, gorgées de matière organique, se sont déposées dans une eau privée d'oxygène. Les grands épisodes d'anoxie océanique, au Toarcien comme du Cénomanien au Turonien, en ont disséminé un peu partout." },
      { nom: "sapropélite", note: "Roche durcie issue de boues organiques de lacs et de mers stagnantes : une sapropèle consolidée." },
      { nom: "asphalte et bitume", note: "Le pétrole migré, dépourvu de ses fractions légères, imprègne un calcaire ou un sable. Les calcaires asphaltiques de Seyssel (Ain, Haute-Savoie) ont servi à paver les trottoirs parisiens." }
    ],
    regions: [
      { nom: "Bassin d'Autun (Permien)", lat: 46.95, lng: 4.30 },
      { nom: "Schistes carton du Toarcien (Causses)", lat: 44.30, lng: 3.20 },
      { nom: "Schistes carton du Toarcien (Lorraine, côtes de Moselle)", lat: 49.2, lng: 6.0 },
    ],
    ages: [
      { de: 300, a: 290, label: "Autunien : schistes bitumineux d'Autun" },
      { de: 184.2, a: 181, label: "Toarcien inférieur : schistes carton" },
    ],
    alteration: {
      vmin: 0.1, vmax: 2, facilite: 4,
      // D.8.3 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0116, cas: "Schistes noirs à matière organique et pyrite, sous forêt : les petits bassins français (3 ruisseaux) ne subissent que la dissolution.", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,1", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "Exposé à l'air, le kérogène s'oxyde, et la pyrite qui l'accompagne fabrique de l'acide sulfurique, source d'efflorescences et d'acidification ; la roche se débite alors en plaquettes.",
      climat: "Les ruisseaux drainant des schistes noirs riches en matière organique comptent parmi les plus chargés des roches silicatées, soit dix fois plus qu'un ruisseau sur shale ordinaire, car l'acide sulfurique né de la pyrite ronge les argiles. Ils transportent l'équivalent de 1,2 mm de roche en 100 ans, sans compter le carbone rejeté en CO₂ ni le soufre. Affleurant, les schistes cartons s'effeuillent en quelques années (retrait-gonflement).",
    },
    produits: { sable: 0, limon: 150, argile: 500, oxydes: 50, dissous: 50, autre: 250 },
    produitsNote: "Le drainage des haldes bitumineuses, très acide et sulfaté, pose un problème minier majeur. Il s'accompagne de la libération d'environ 500 g d'argiles et de la perte de 250 g de matière organique oxydée en CO₂.",
    usages: "Autrefois distillés, à Autun pour l'huile de schiste, ces schistes sont aussi les roches mères de gisements d'hydrocarbures.",
    wikipedia: "https://fr.wikipedia.org/wiki/Schiste_bitumineux",
  },
  {
    id: "meuliere", nom: "Meulière", categorie: "sedimentaire", sousType: "siliceuse",
    swatch: "#a98f5f", densite: 2400,
    description: "Caverneuse, cette silice résulte de la silicification de calcaires lacustres. On la rencontre sur les plateaux d'Île-de-France. Résistant presque parfaitement à l'altération, elle a fourni des meules de moulin, puis les pavillons « en meulière » de la banlieue parisienne.",
    mineralogie: "Plus de 90 % de calcédoine et d'opale (SiO₂), avec des vacuoles et des argiles ferrugineuses logées dans les cavités.",
    varietes: [
      { nom: "meulière de Brie", note: "Variété de premier rang, aux grosses cavités reliées entre elles : ses meules ont circulé dans toute l'Europe." },
      { nom: "meulière de Montmorency", note: "variété plus fine, du nord parisien." },
      { nom: "meulière massive (moellon)", note: "Peu caverneuse, elle sert à la construction (pavillons de banlieue) plutôt qu'à la fabrication de meules." },
      { nom: "silcrète", note: "Le grès de Fontainebleau est une silcrète de nappe : au toit d'une nappe, du quartz a prolongé chaque grain de sable (auréoles de croissance) et les a soudés ; la calcédoine et l'opale dominent plutôt dans les silcrètes de sol." }
    ],
    regions: [
      { nom: "Hurepoix, plateau de Saclay", lat: 48.66, lng: 2.10 },
      { nom: "Brie (La Ferté-sous-Jouarre, capitale mondiale des meules)", lat: 48.95, lng: 3.13 },
    ],
    ages: [{ de: 34, a: 15, label: "Oligo-Miocène (silicification des calcaires de Beauce et de Brie)" }],
    alteration: {
      facilite: 1,
      mecanisme: "Aux pH naturels, la silice reste presque insoluble. La meulière est elle-même un résidu : le calcaire qui l'enfermait ayant été dissous, elle s'est retrouvée concentrée et ne se déplace plus guère.",
    },
    produits: { sable: 850, limon: 50, argile: 60, oxydes: 30, dissous: 10 },
    produitsNote: "Elle se découpe très lentement en blocs et graviers siliceux. Les argiles rousses présentes à ses côtés se sont formées dans les poches de dissolution, et non dans la meulière elle-même.",
    usages: "Meules (d'où son nom) et moellons des pavillons franciliens construits de 1880 à 1930.",
    wikipedia: "https://fr.wikipedia.org/wiki/Meuli%C3%A8re",
  },
  {
    id: "silex", nom: "Silex (chert)", categorie: "sedimentaire", sousType: "siliceuse (chimique)",
    swatch: "#6a6258", densite: 2600,
    codes: [
      { code: "—", sens: " : pas de code propre : le silex apparaît dans le libellé de la roche qui le porte (ex. c3, « craie à silex ») ou dans les formations résiduelles (Rs, argiles à silex)" },
    ],
    description: "Silice concentrée en rognons durs et tranchants au sein de la craie et des calcaires, issue de la dissolution puis de la reprécipitation de silice biogénique (spicules d'éponges, radiolaires). Sa grande résistance en a fait le principal matériau de l'outillage préhistorique ; il jonche les champs lorsque la craie qui le portait a disparu.",
    mineralogie: "Calcédoine et quartz microcristallins, auxquels s'ajoutent de l'opale (SiO₂ au-delà de 95 %) ; cortex blanchâtre et cassure conchoïdale.",
    mineraux: [["calcedoine", 90], ["opale", 5], ["quartz", 3], ["goethite", 2]],
    argiles: [],
    argilesNote: "Presque aucune argile : la silice n'en produit pas, et il n'existe rien d'autre à altérer.",
    varietes: [
      { nom: "chert", note: "Bancs continus de silex : la roche ne se limite pas à des rognons isolés." },
      { nom: "jaspe", note: "Chert teinté de rouge ou de vert par des oxydes de fer." },
      { nom: "phtanite", note: "Roche siliceuse noire à matière organique." },
      { nom: "lydienne", note: "Chert noir à grain très fin, appelé « pierre de touche » par les orfèvres, qui frottaient l'or dessus pour en vérifier le titre ; ancien synonyme de phtanite." }
    ],
    regions: [
      { nom: "Craie du Bassin parisien / Normandie", lat: 49.30, lng: 0.60 },
      { nom: "Grand-Pressigny (Touraine, silex taillé)", lat: 46.90, lng: 0.80 },
    ],
    ages: [{ de: 100.5, a: 66, label: "Silex de la craie (Crétacé sup.)" }],
    alteration: {
      vmin: 0.0001, vmax: 0.002, facilite: 1,
      // D.8.3 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0019, cas: "Nodule de silex éocène resté sur place, sur le plateau calcaire du centre de la Jordanie, dans le désert.", src: "Ben-Israel et al. 2020, néon 21 (le béryllium 10 donne 0,17 mm)", ref: true },
        { v: 0.0027, cas: "autre nodule du même plateau", src: "Ben-Israel et al. 2020, néon 21" }
      ],
      sources: [
        "Ben-Israel M., Matmon A., Hidy A. J., Avni Y. et Balco G. (2020), « Early-to-mid Miocene erosion rates inferred from pre-Dead Sea rift Hazeva River fluvial chert pebbles using cosmogenic ²¹Ne », Earth Surface Dynamics 8 : 289–301 (tableau 2 : nodules EJC3 et EJC5)"
      ],
      mecanisme: "La silice est presque insoluble aux pH naturels : le silex constitue un résidu ultime, qui se fragmente sans se dissoudre (argiles à silex des plateaux).",
      climat: "Quasi inaltérables, les nodules de silex restés en place sur un plateau désertique de Jordanie perdent 0,19 et 0,27 mm en 100 ans (mesure au néon 21). En France, aucune mesure n'a été publiée : le silex survit d'abord à la craie qui l'enfermait (argiles à silex), puis aux sols qui l'enveloppent. Le gel (gélifracts) et une patine blanche lente, le cacholong, sont les seuls à l'entamer.",
    },
    produits: { sable: 900, limon: 50, argile: 30, oxydes: 10, dissous: 10 },
    produitsNote: "Pour 1 kg de silex, on obtient 900 g de fragments et de graviers siliceux. C'est pourquoi les plateaux crayeux en sont jonchés, alors que la craie a disparu.",
    usages: "Outils préhistoriques ; historiquement pierres à fusil ; empierrement.",
    wikipedia: "https://fr.wikipedia.org/wiki/Silex",
  },
  {
    id: "radiolarite", nom: "Radiolarite", categorie: "sedimentaire", sousType: "siliceuse (biochimique)",
    swatch: "#9a4a3a", densite: 2550,
    codes: [
      { code: "j", sens: " : radiolarites jurassiques des ophiolites (Corse alpine, Queyras), associées aux « schistes lustrés » ; lydiennes des codes carbonifères (h)" },
    ],
    description: "Roche rouge finement litée, dont la matière provient des tests de radiolaires déposés au fond des océans profonds, sous le niveau de dissolution du calcaire. Les « jaspes » rouges accompagnent les ophiolites alpines.",
    mineralogie: "Silice (calcédoine, opale) et tests de radiolaires, souvent colorés en rouge par l'hématite.",
    mineraux: [["calcedoine", 80], ["quartz", 10], ["hematite", 5], ["illite_m", 5]],
    argiles: ["illite"],
    argilesNote: "Le faible résidu argileux provient de l'illite des boues abyssales, prise entre les squelettes de radiolaires.",
    varietes: [
      { nom: "jaspe rouge des ophiolites", note: "radiolarite associée aux basaltes en coussins alpins." },
    ],
    regions: [
      { nom: "Queyras / Chenaillet (jaspes des ophiolites)", lat: 44.75, lng: 6.85 },
    ],
    ages: [{ de: 165, a: 145, label: "Jurassique moyen et supérieur (fonds de l'océan alpin)" }],
    alteration: {
      facilite: 1,
      mecanisme: "Silice presque insoluble : le résidu se fragmente sans jamais se dissoudre.",
    },
    produits: { sable: 850, limon: 80, argile: 50, oxydes: 15, dissous: 5 },
    produitsNote: "On obtient environ 850 g de débris siliceux anguleux ; les 15 g d'oxydes de fer sont de l'hématite, qui leur donnait leur couleur sang.",
    usages: "Pierre ornementale (jaspe), autrefois pierre à aiguiser.",
    wikipedia: "https://fr.wikipedia.org/wiki/Radiolarite",
  },
  {
    id: "diatomite", nom: "Diatomite", categorie: "sedimentaire", sousType: "siliceuse (biochimique)",
    swatch: "#e6e2d4", densite: 900,
    codes: [
      { code: "m-p", sens: " : diatomites du Cantal et du Velay, miocènes à pliocènes, formées dans des maars ; l'étage et les précisions figurent dans le libellé" },
    ],
    description: "Cette roche blanche, parfois assez légère pour flotter, résulte de l'accumulation, dans des lacs ou des mers, de frustules siliceux de diatomées, ces algues microscopiques. Poreuse et absorbante, elle a permis de stabiliser la nitroglycérine : c'est la « terre » de la dynamite de Nobel.",
    mineralogie: "Opale d'origine biologique, en frustules de diatomées, mêlée d'un peu d'argile ; l'ensemble est extrêmement poreux.",
    mineraux: [["opale", 75], ["illite_m", 10], ["smectites_m", 8], ["quartz", 5], ["matorg", 2]],
    argiles: ["smectites"],
    argilesNote: "Dans les diatomites de maar, les cendres volcaniques intercalées s'altèrent en smectites, tandis que l'opale se dissout sans rien laisser.",
    varietes: [
      { nom: "randanite", note: "Nom ancien de la diatomite de Randan (Puy-de-Dôme) ; on dit aussi ceyssatite (Ceyssat)." },
      { nom: "tripoli / kieselguhr", note: "diatomite pulvérulente, abrasif et filtre." },
    ],
    regions: [
      { nom: "Ardèche (Saint-Bauzile, Coirons)", lat: 44.67, lng: 4.66 },
      { nom: "Cantal (Foufouilloux, Virargues)", lat: 45.12, lng: 2.89 },
    ],
    ages: [{ de: 15, a: 2, label: "Miocène-Pliocène (lacs volcaniques du Massif central)" }],
    alteration: {
      vmin: 0.1, vmax: 1, facilite: 2,
      // D.8.3 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0268, cas: "Auvergne : Clermont-Ferrand reçoit 700 mm de pluie, dont 208 mm pénètrent le sol.", src: "dissolution de l'opale à saturation, masse volumique apparente 0,9, 75 % d'opale", calcul: "silice", ref: true },
        { v: 0.0739, cas: "Massif central pluvieux : au mont Aigoual, 1 041 mm de précipitations, dont 575 mm pénètrent le sol.", src: "dissolution de l'opale à saturation, masse volumique apparente 0,9, 75 % d'opale", calcul: "silice" }
      ],
      sources: [
        "Fournier R. O. et Rowe J. J. (1977), « The solubility of amorphous silica in water at high temperatures and high pressures », American Mineralogist 62 : 1052–1056 (log C = −731/T + 4,52)",
        "Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "L'opale, une dizaine de fois plus soluble que le quartz, se dissout lentement ; la roche s'effrite en poudre siliceuse.",
      climat: "La forme de silice la plus soluble est l'opale des diatomées, et la roche agit comme une éponge : l'eau qui la traverse ressort saturée. Le calcul indique 2,7 mm de roche dissoute en 100 ans sous la pluie de Clermont-Ferrand, 7,4 mm sous celle du mont Aigoual. Seule la dissolution est comptée : les fronts des carrières du Cantal reculent bien plus vite, en quelques hivers, sous l'effet conjoint de la pluie et du gel.",
    },
    produits: { sable: 100, limon: 550, argile: 200, oxydes: 30, dissous: 120 },
    produitsNote: "On trouve environ 120 g de silice dissoute, 200 g d'argiles (cendres volcaniques altérées, interstratifiées) et 550 g de poudre limoneuse issue de tests d'opale désolidarisés.",
    usages: "Filtration (vin, bière, piscines), abrasif doux, absorbant, charge industrielle, dynamite (historique).",
    wikipedia: "https://fr.wikipedia.org/wiki/Diatomite",
  },
  {
    id: "gaize", nom: "Gaize", categorie: "sedimentaire", sousType: "siliceuse (argilo-opaline)",
    swatch: "#b8b09a", densite: 2000,
    codes: [
      { code: "n7-c1", sens: " : gaize de l'Argonne, datant de l'Albien terminal au Cénomanien basal selon les feuilles" },
    ],
    description: "Roche siliceuse tendre et légère, intermédiaire entre marne et grès : opale et spicules d'éponges, liés par de l'argile. La pierre de l'Argonne, qui a servi à bâtir ses églises, relève de ce type.",
    mineralogie: "Opale + quartz fin + spicules d'éponges siliceuses + argile ; poreuse, sonne clair.",
    mineraux: [["opale", 40], ["quartz", 30], ["glauconie", 12], ["illite_m", 8], ["calcite", 5], ["smectites_m", 5]],
    argiles: ["glauconite", "smectites"],
    argilesNote: "Des smectites et de la glauconie marine d'origine héritée accompagnent les spicules d'éponges dans l'opale : c'est un parent siliceux du tuffeau.",
    regions: [
      { nom: "Argonne (Meuse, Marne)", lat: 49.20, lng: 5.05 },
    ],
    ages: [{ de: 103, a: 99.5, label: "Albien supérieur à Cénomanien basal : Argonne" }, { de: 161.5, a: 159, label: "Oxfordien inférieur : gaizes jurassiques" }],
    alteration: {
      vmin: 0.01, vmax: 0.1, facilite: 2,
      // D.8.3 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0179, cas: "Bassin parisien : Paris enregistre 668 mm de pluie, dont 165 mm s'infiltrent. L'opale de la gaize, aussi soluble que l'opale amorphe, donne ici un maximum.", src: "dissolution de l'opale à saturation, masse volumique 2,0, 40 % d'opale", calcul: "silice", ref: true }
      ],
      sources: [
        "Fournier R. O. et Rowe J. J. (1977), « The solubility of amorphous silica in water at high temperatures and high pressures », American Mineralogist 62 : 1052–1056 (log C = −731/T + 4,52)",
        "Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "L'argile s'hydrolyse et l'opale se dissout lentement ; sensible au gel, la roche se désagrège lors des cycles gel-dégel.",
      climat: "L'opale qui cimente se dissout lentement : d'abord pulvérulente, la roche devient ensuite sableuse. Selon le calcul, 1,8 mm au plus de roche se dissolvent en 100 ans sous la pluie du Bassin parisien, valeur maximale, puisque l'opale CT de la gaize se dissout moins que celle des diatomées. Le gel complète l'action. Pourtant, les buttes de gaize de l'Argonne se maintiennent en relief, le quartz formant l'armature.",
    },
    produits: { sable: 500, limon: 200, argile: 200, oxydes: 30, dissous: 70 },
    produitsNote: "Sable fin quartzeux (environ 500 g), limons (200 g), argiles de glauconie et de smectites héritées (200 g), auxquels s'ajoutent 70 g de silice et d'ions dissous.",
    usages: "Pierre de construction légère (patrimoine de l'Argonne).",
    wikipedia: "https://fr.wikipedia.org/wiki/Gaize",
    varietes: [{ nom: "Spongolite", note: "Surtout composée de spicules siliceux d'éponges cimentés par l'opale, la roche donne la gaize, variété argileuse et glauconieuse." }],
  },
  {
    id: "phosphorite", nom: "Phosphorite", categorie: "sedimentaire", sousType: "chimique (phosphatée)",
    swatch: "#9a8a5a", densite: 2700,
    codes: [
      { code: "e-g", sens: " : phosphorites du Quercy, remplissages karstiques de l'Éocène à l'Oligocène, notation locale des feuilles quercynoises" },
    ],
    description: "Ce sont des roches riches en phosphate de chaux : il précipite là où remontent des courants marins profonds, porteurs de nutriments (upwelling), ou se concentre dans des remplissages karstiques. Les phosphorites du Quercy sont célèbres pour les fossiles qu'elles ont piégés.",
    mineralogie: "Phosphate de chaux (francolite) accompagné d'apatite, de calcite et d'argiles, souvent sous forme de nodules ou de remplissages de poches.",
    mineraux: [["apatite", 60], ["calcite", 20], ["quartz", 8], ["illite_m", 6], ["goethite", 6]],
    argiles: ["illite", "smectites"],
    argilesNote: "Dans les karsts phosphatés, le phosphore se concentre dans les argiles de remplissage, où dominent l'illite et les smectites issues de la décalcification.",
    regions: [
      { nom: "Phosphorites du Quercy (Lot)", lat: 44.40, lng: 1.70 },
    ],
    ages: [{ de: 42, a: 23, label: "Éocène moyen à Oligocène (remplissages karstiques)" }],
    alteration: {
      facilite: 3,
      mecanisme: "La calcite part d'abord, et le résidu s'enrichit en apatite ; en sol acide, l'apatite se dissout ensuite, lentement, et libère des phosphates assimilables par les plantes.",
    },
    produits: { sable: 50, limon: 100, argile: 300, oxydes: 100, dissous: 450 },
    produitsNote: "Environ 450 g passent en solution (phosphate et calcium, soit l'engrais), tandis que subsistent 300 g d'argiles de décalcification et 100 g d'oxydes ; les ossements fossiles se dégagent entiers.",
    usages: "Engrais phosphatés, exploités dans d'anciennes mines, et intérêt paléontologique considérable.",
    wikipedia: "https://fr.wikipedia.org/wiki/Phosphorite",
    varietes: [{ nom: "Bone bed", note: "Niveau mince, particulièrement riche en restes de vertébrés fossiles (os, dents, écailles)." }, { nom: "Guano", note: "Accumulation de déjections d'oiseaux ou de chauves-souris, à l'origine de nombreux gisements de phosphates." }, { nom: "Phosphatite", note: "roche phosphatée massive, faite surtout d'apatite." }],
  },
  {
    id: "anhydrite", nom: "Anhydrite", categorie: "sedimentaire", sousType: "évaporitique",
    swatch: "#d0d0c4", densite: 2960,
    codes: [
      { code: "t", sens: " : évaporites du Keuper et du Muschelkalk. L'anhydrite, qui s'hydrate en gypse au contact de l'eau, ne se montre pas à l'affleurement : on la connaît seulement par sondages et par mines" },
    ],
    description: "Forme anhydre du sulfate de calcium (CaSO₄). Elle précipite dans les lagunes chaudes et très salées, ou résulte de la déshydratation du gypse sous l'effet de l'enfouissement. Mise en contact avec l'eau, elle se réhydrate et gonfle, ce qui complique la construction des tunnels.",
    mineralogie: "Minéral : anhydrite (CaSO₄), qui accompagne couramment le gypse, la halite et la dolomie.",
    mineraux: [["anhydrite", 90], ["gypse_m", 5], ["dolomite", 3], ["illite_m", 2]],
    argiles: ["illite"],
    argilesNote: "Comme pour le gypse, la dissolution est presque totale ; il ne reste que les impuretés marneuses, libérées sous forme d'argiles.",
    regions: [
      { nom: "Trias des Alpes et de Lorraine", lat: 45.20, lng: 6.40 },
    ],
    ages: [{ de: 250, a: 200, label: "Trias (lagunes évaporitiques)" }],
    alteration: {
      vmin: 0.3, vmax: 2, facilite: 4,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.126, cas: "Sous couverture, en Lorraine et en Alsace : à Strasbourg, l'eau infiltrée atteint 186 mm.", src: "eau infiltrée saturée en gypse, masse volumique 2,96", calcul: "sulfate", ref: true },
        { v: 0.813, cas: "Alpes très arrosées : à Chamonix, 1 203 mm s'infiltrent.", src: "eau infiltrée saturée en gypse, masse volumique 2,96", calcul: "sulfate" }
      ],
      sources: [
        "Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Au contact de l'eau, elle se transforme en gypse en augmentant de volume d'environ 60 % (d'où les gonflements), puis se dissout comme lui.",
      climat: "Elle n'affleure jamais durablement, si bien qu'aucune mesure directe n'existe. Au contact de l'eau, elle s'hydrate en gypse en gonflant de près de 60 %, ce qui soulève les tunnels lorrains et alpins, puis elle se dissout comme le gypse. Pour une eau infiltrée qui se sature, le calcul donne 13 mm en 100 ans sous le climat de Strasbourg et environ 80 mm dans les Alpes.",
    },
    produits: { sable: 0, limon: 0, argile: 20, oxydes: 0, dissous: 980 },
    produitsNote: "Comme pour le gypse, environ 98 % de la masse passe en solution (Ca²⁺, SO₄²⁻) après l'hydratation ; il ne subsiste que les impuretés argileuses.",
    usages: "Ciment, plâtre, charge industrielle.",
    wikipedia: "https://fr.wikipedia.org/wiki/Anhydrite",
    varietes: [{ nom: "Anhydrite nodulaire", note: "Nodules blancs jointifs au sein d'une trame argileuse, formant un réseau qui rappelle un grillage de poulailler. Cette structure est typique des sebkhas." }, { nom: "Anhydrite litée", note: "Lits réguliers qui se sont déposés au fond d'un bassin d'évaporation." }, { nom: "Vulpinite", note: "Anhydrite grenue et claire, dont le poli permet un usage de pierre ornementale (Vulpino, Italie)." }],
  },
  {
    id: "sylvinite", nom: "Sylvinite (sels potassiques)", categorie: "sedimentaire", sousType: "évaporitique",
    swatch: "#d8a48a", densite: 2000,
    codes: [
      { code: "g1", sens: " : couches de potasse du bassin de Mulhouse, à la base du Rupélien. Elles n'affleurent jamais et ne sont connues que grâce aux mines et aux sondages." },
    ],
    description: "Sel potassique des évaporites, mélange de sel gemme (halite) et de sylvite (KCl), de teinte rouge-orangé ; il précipite en toute fin d'évaporation d'une saumure. Le bassin potassique d'Alsace a fait vivre une région entière grâce à la potasse qu'il renferme.",
    mineralogie: "Halite (NaCl) et sylvite (KCl), accompagnées parfois de carnallite ; la teinte rouge provient d'oxydes de fer.",
    mineraux: [["halite_m", 60], ["sylvite", 30], ["illite_m", 5], ["gypse_m", 5]],
    argiles: ["illite"],
    argilesNote: "Toute la matière se dissout ; l'illite résiduelle provient des lits marneux qui s'intercalent entre les couches de potasse.",
    varietes: [
      { nom: "carnallite", note: "Sel double KMgCl₃·6H₂O, extrêmement soluble, qui absorbe l'humidité de l'air (déliquescence)." },
      { nom: "kaïnite", note: "sel potassique sulfaté." },
      { nom: "roche à polyhalite", note: "Sel sulfaté de potassium, de magnésium et de calcium, disposé en lits dans les évaporites. Il a été exploité comme engrais dans le Yorkshire, en Angleterre." }
    ],
    regions: [
      { nom: "Bassin potassique d'Alsace (Wittelsheim)", lat: 47.80, lng: 7.25 },
    ],
    ages: [{ de: 33.9, a: 31, label: "Rupélien inférieur : bassin potassique de Mulhouse" }],
    alteration: {
      vmin: 1, vmax: 150, facilite: 5,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 70, cas: " : si elle affleurait en Alsace (à Strasbourg, les pluies atteignent 670 mm)", src: "loi du sel de Cardona × 1,05", calcul: "sel", ref: true }
      ],
      sources: [
        "Pérez-Villar G., Gutiérrez F., Benito-Calvo A. et Roqué C. (2026), « Erosion rates in rock salt exposures with diverse karren… », Geomorphology 500 : 110228 (Cardona, piquets, photogrammétrie, laser)"
      ],
      mecanisme: "Très soluble, autant que le sel gemme (sylvite : environ 340 g/L contre 360 g/L pour la halite, à 20 °C), elle ne se conserve qu'en profondeur ; la carnallite qui l'accompagne se délite même à l'air humide.",
      climat: "Hors de tout affleurement, sous notre climat, la sylvite ne subsiste pas. Le calcul donne, à l'air libre sous la pluie de Strasbourg, environ 7 m en 100 ans, guère plus que le sel gemme (sylvite : 340 g/L). Les terrils potassiques alsaciens ont été lessivés en quelques décennies, et leur sel a durablement salé la nappe rhénane.",
    },
    produits: { sable: 0, limon: 0, argile: 15, oxydes: 0, dissous: 985 },
    produitsNote: "Environ 985 g gagnent la saumure sous forme de K⁺, Na⁺ et Cl⁻. Tout tient à la protection : si les marnes de couverture ne retiennent pas la roche, le potassium rejoint la mer.",
    usages: "Potasse (engrais), chlorure de potassium ; mines historiques (MDPA).",
    wikipedia: "https://fr.wikipedia.org/wiki/Sylvinite",
  },
  {
    id: "laterite", nom: "Cuirasse latéritique", categorie: "sedimentaire", sousType: "résiduelle (ferrallitique)",
    swatch: "#a85a3a", densite: 2400,
    codes: [
      { code: "e-Si", sens: " : Sidérolithique éocène du Massif central et du Quercy (e selon feuilles) ; sur les cartes d'outre-mer, les cuirasses reçoivent une notation propre" },
    ],
    description: "Résidu ultime de l'altération tropicale (température supérieure ou égale à 22 °C, pluie supérieure à l'ETP) : une fois les cations puis la silice lessivés, il ne subsiste qu'un sol rouge d'oxydes de fer et d'aluminium, qui durcit à l'air en cuirasse pierreuse. En France, des cuirasses fossiles témoignent d'un passé tropical (Périgord, Sud-Ouest).",
    mineralogie: "Goethite et hématite (teinte rouge), accompagnées de kaolinite et de gibbsite ; le matériau est pauvre en silice et en cations solubles.",
    mineraux: [["goethite", 35], ["kaolinite_m", 25], ["hematite", 20], ["gibbsite", 10], ["quartz", 10]],
    argiles: ["kaolinite"],
    argilesNote: "La cuirasse représente un produit final : seule la kaolinite la plus résistante subsiste, le reste ayant déjà été transformé en oxydes.",
    varietes: [
      { nom: "cuirasse ferrugineuse (ferricrète)", note: "croûte durcie d'oxydes de fer." },
      { nom: "carapace", note: "Niveau induré, moins compact, reconnu comme fossile en France." },
      { nom: "alios et garluche", note: "Il ne s'agit pas de latérites, mais de grès tendres cimentés par de la matière organique et des oxydes de fer, formés dans l'horizon d'accumulation des podzols landais. Plus riche en fer, la garluche servait de pierre à bâtir." }
    ],
    regions: [
      { nom: "Cuirasses fossiles du Périgord / Sud-Ouest", lat: 44.90, lng: 0.80 },
    ],
    ages: [{ de: 145, a: 100.5, label: "Crétacé inférieur : sidérolithique ferrugineux de la bordure sud du Bassin parisien" }, { de: 66, a: 33.9, label: "Paléocène et Éocène : cuirasses du Périgord et de la Brenne (paléoclimats tropicaux)" }],
    alteration: {
      vmin: 0.001, vmax: 0.01, facilite: 1,
      // D.8.3 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.002, cas: "Cuirasse latéritique de Larafella (Burkina Faso, en savane) : elle participe à l'abaissement de la surface.", src: "Braucher et al. 1998, béryllium 10", ref: true },
        { v: 0.002, cas: "Sous forêt dense (Nsimi, Cameroun), une couverture latéritique coiffée d'une cuirasse en démantèlement : le front d'altération s'enfonce dans le granite.", src: "Braun et al. 2012, bilan du sodium des sources" },
        { v: 0.012, cas: "Sol latéritique dépourvu de cuirasse, sous forêt dense (Malemba, Congo) : la surface recule.", src: "Braucher et al. 1998, béryllium 10" }
      ],
      sources: [
        "Braucher R., Colin F., Brown E. T., Bourlès D. L., Bamba O., Raisbeck G. M., Yiou F. et Koud J. M. (1998), « African laterite dynamics using in situ-produced ¹⁰Be », Geochimica et Cosmochimica Acta 62 (9) : 1501–1507",
        "Braun J.-J., Maréchal J.-C., Riotte J. et al. (2012), « Elemental weathering fluxes and saprolite production rate in a Central African lateritic terrain (Nsimi, South Cameroon) », Geochimica et Cosmochimica Acta 99 : 243–270"
      ],
      mecanisme: "Produit ultime de l'altération, la cuirasse est presque inaltérable en surface. Elle protège le relief qu'elle coiffe, si bien que celui-ci se retrouve en position haute.",
      climat: "Une cuirasse n'a plus rien à hydrolyser. Sa surface recule de 0,2 mm en 100 ans au Burkina Faso, et le front sous la couverture ne progresse pas plus vite à Nsimi (0,2 mm en 100 ans). En forêt dense, un sol latéritique sans cuirasse perd six fois plus vite, soit 1,2 mm en 100 ans au Congo. Les cuirasses fossiles du Sud-Ouest français ne reculent plus que par érosion mécanique, sapement des bords et désagrégation en gravillons ferrugineux.",
    },
    produits: { sable: 100, limon: 50, argile: 300, oxydes: 520, dissous: 30 },
    produitsNote: "Sa destruction libère surtout des gravillons et des pisolites de fer (520 g d'oxydes), accompagnés de 300 g de kaolinite. Il alimente les « bowals » africains et les sols rouges du Sidérolithique.",
    usages: "Minerai de fer : jadis le minerai « sidérolithique » en grains des forges du Périgord et du Berry, aujourd'hui des latérites exploitées sous les tropiques. Pierre à bâtir, sous le nom de « latérite » taillée.",
    wikipedia: "https://fr.wikipedia.org/wiki/Lat%C3%A9rite",
  },
  {
    id: "bauxite", nom: "Bauxite", categorie: "sedimentaire", sousType: "résiduelle (latéritique)",
    swatch: "#b3543a", densite: 2500,
    description: "Découverte aux Baux-de-Provence, qui lui a donné son nom, elle résulte de l'altération ultime de roches sous climat tropical au Crétacé : il n'en reste que les hydroxydes d'aluminium et de fer. Minerai d'aluminium, elle a été exploitée en Provence jusqu'en 1991.",
    mineralogie: "Boehmite (gibbsite rare dans les bauxites françaises) 40 à 60 %, hématite et goethite 15 à 30 %, kaolinite, un peu d'anatase. Enfouie sous les couches du Crétacé supérieur, la gibbsite d'origine s'est changée en boehmite.",
    varietes: [
      { nom: "bauxite pisolithique", note: "Aux Baux-de-Provence, la texture la plus répandue se présente sous forme de billes concentriques, de quelques millimètres chacune." },
      { nom: "bauxite terreuse", note: "Masse fine sans pisolithes visibles, plus argileuse." },
      { nom: "alcrète", note: "Croûte latéritique durcie par des hydroxydes d'aluminium : elle est la cousine alumineuse de la calcrète." },
    ],
    regions: [
      { nom: "Les Baux-de-Provence", lat: 43.74, lng: 4.80 },
      { nom: "Brignoles : Var", lat: 43.40, lng: 6.06 },
      { nom: "Villeveyrac (Hérault)", lat: 43.50, lng: 3.60 },
    ],
    ages: [{ de: 125, a: 90, label: "Crétacé « moyen » : altération tropicale des terres émergées" }],
    alteration: {
      facilite: 1,
      mecanisme: "Elle marque le terme de la chaîne d'altération : les oxydes et hydroxydes d'aluminium et de fer sont les phases les plus stables en surface. La bauxite ne s'altère plus et ne peut plus qu'être érodée mécaniquement.",
    },
    produits: { sable: 0, limon: 50, argile: 400, oxydes: 500, dissous: 50 },
    produitsNote: "Elle se réorganise elle-même : environ 50 % d'oxydes-hydroxydes (Al, Fe) et 40 % de kaolinite. Elle colore souvent en rouge les sols méditerranéens.",
    usages: "Minerai d'aluminium, ciments alumineux, abrasifs.",
    wikipedia: "https://fr.wikipedia.org/wiki/Bauxite",
  },

  {
    id: "cargneule", nom: "Cargneule", categorie: "sedimentaire", sousType: "carbonatée (bréchique cellulaire)",
    swatch: "#c9a35f", densite: 2300,
    description: "Roche jaune-rousse et criblée de vacuoles, du Trias alpin : il s'agit d'une brèche de dolomie et de gypse dont les fragments ont disparu, le gypse dissous et la dolomie changée en calcite ou évidée par des eaux chargées de sulfate, en laissant un réseau de cloisons de calcite. Elle jalonne les grands chevauchements : elle naît des gypses du Trias, sur lesquels les nappes alpines ont glissé comme sur du savon.",
    mineralogie: "Dolomite et calcite, vacuoles de dissolution, résidus argileux ocre. Le gypse, lorsqu'il est présent, se dissout en profondeur.",
    mineraux: [["dolomite", 70], ["calcite", 15], ["illite_m", 8], ["goethite", 5], ["gypse_m", 2]],
    argiles: ["illite"],
    argilesNote: "Les fragments de dolomie s'égrènent en farine rousse, tandis que l'illite ocre des enduits vacuolaires forme la fraction insoluble, concentrée.",
    codes: [
      { code: "t", sens: " : Trias alpin, cargneules précisées au libellé, presque toujours associées aux gypses (tG) et dolomies" },
    ],
    varietes: [
      { nom: "cargneule bréchique", note: "Des éléments dolomitiques anguleux flottent dans un ciment dissous : on reconnaît encore la trame de la roche d'origine." },
      { nom: "cargneule cellulaire", note: "Une éponge minérale aux vacuoles reliées entre elles : la roche est étonnamment légère." },
    ],
    regions: [
      { nom: "Briançonnais (cols du Galibier, du Lautaret)", lat: 45.06, lng: 6.40 },
      { nom: "Vanoise (Pralognan)", lat: 45.38, lng: 6.72 },
      { nom: "Haute Maurienne", lat: 45.28, lng: 6.90 },
      { nom: "Dévoluy, Baronnies (Trias provençal)", lat: 44.55, lng: 5.90 },
    ],
    ages: [{ de: 251.9, a: 201.4, label: "Matériel du Trias (Keuper surtout) : la cargneulisation, elle, est souvent bien plus récente" }],
    alteration: {
      facilite: 4,
      mecanisme: "La dissolution différentielle élimine d'abord le gypse ; l'eau, chargée de sulfate, dissout la dolomite et dépose de la calcite (dédolomitisation) : les fragments dolomitiques s'évident ou tombent en farine, les cloisons de calcite demeurent. C'est cette altération qui produit la cargneule. Le processus se poursuit à l'affleurement : la roche se creuse, prend une forme ruiniforme et s'effondre en tourelles.",
    },
    produits: { sable: 150, limon: 80, argile: 100, oxydes: 40, dissous: 630 },
    produitsNote: "Près de 630 g passent en solution (calcite, gypse, un peu de dolomite). Il reste un sable dolomitique roux et des argiles ocre, et les sols qui en dérivent sont maigres, caillouteux et dorés.",
    usages: "Matériau de construction local (chalets, fours à chaux d'alpage), et repère stratigraphique des géologues alpins pour suivre les chevauchements.",
    wikipedia: "https://fr.wikipedia.org/wiki/Cargneule",
  },
  {
    id: "falun", nom: "Falun", categorie: "sedimentaire", sousType: "biodétritique coquillière",
    swatch: "#e3d3ae", densite: 1900,
    description: "Le sable coquillier de la « mer des faluns », qui couvrait la Touraine et l'Anjou au Miocène, rassemble coquilles brisées, bryozoaires et dents de requins, dont celles du mégalodon, le plus grand requin de tous les temps. On l'épandait sur les champs, pratique dite du « falunage ».",
    mineralogie: "Débris coquilliers (calcite, aragonite) à hauteur de 60 à 90 %, sable quartzeux, glauconie ; on y trouve aussi des dents et des os de siréniens et de cétacés.",
    mineraux: [["calcite", 55], ["aragonite", 15], ["quartz", 20], ["glauconie", 7], ["goethite", 3]],
    argiles: ["glauconite", "smectites"],
    argilesNote: "Décarbonaté, le falun laisse place à un sable glauconieux : la glauconie verte et quelques smectites en constituent l'essentiel.",
    codes: [
      { code: "m2", sens: " : faluns miocènes (ex. feuilles de Touraine et d'Anjou, faluns de Savigné, de Doué-la-Fontaine)" },
    ],
    varietes: [
      { nom: "falun savignéen", note: "Faciès à bryozoaires, souvent consolidé en grès calcaire : Savigné-sur-Lathan, Doué-la-Fontaine." },
      { nom: "falun pontilévien", note: "Sable fait de débris de coquilles de mollusques : Pontlevoy (Loir-et-Cher)." },
      { nom: "coquina (lumachelle meuble)", note: "coquilles entières à peine cimentées." },
    ],
    regions: [
      { nom: "Touraine (Savigné-sur-Lathan, musée du Savignéen)", lat: 47.44, lng: 0.32 },
      { nom: "Anjou (Doué-la-Fontaine, caves en falun)", lat: 47.19, lng: -0.27 },
      { nom: "Blésois (Pontlevoy)", lat: 47.39, lng: 1.25 },
      { nom: "Bretagne (Le Quiou, Tréfumel)", lat: 48.35, lng: -2.01 },
    ],
    ages: [{ de: 20, a: 10, label: "Miocène : la « mer des faluns » entre Bretagne et Bassin parisien" }],
    alteration: {
      vmin: 0.05, vmax: 0.5, facilite: 4,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0258, cas: "Touraine, sous les pluies du bassin parisien (à Paris, 165 mm s'infiltrent).", src: "dissolution à saturation, masse volumique 1,9, 70 % de carbonate", calcul: "carbonate", ref: true },
        { v: 0.0471, cas: "faluns d'Aquitaine (Bordeaux : 898 mm de pluie, 300 mm infiltrés)", src: "dissolution à saturation, masse volumique 1,9, 70 % de carbonate", calcul: "carbonate" }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Décarbonatation : l'eau de pluie dissout les coquilles calcaires, tandis que le sable quartzeux et la glauconie subsistent. Roche poreuse et meuble, le falun s'altère vite, mais les caves creusées dans sa masse tiennent depuis des siècles, à condition d'être en profondeur.",
      climat: "Pas de mesure publiée. Par le calcul, la décarbonatation avance de 2,6 mm en 100 ans en Touraine et de 4,7 mm sous la pluie bordelaise. Elle engendre des sols bruns calcaires, légers, chauds et précoces, sur lesquels prospèrent les vignes et les asperges du Val de Loire.",
    },
    produits: { sable: 400, limon: 50, argile: 80, oxydes: 20, dissous: 450 },
    produitsNote: "Environ 450 g de carbonate sont dissous puis recyclés par les racines et les vers de terre, tandis que 400 g de sable quartzeux et coquillier demeurent. Le falun se transforme ainsi en sable calcaire fertile.",
    usages: "Amendement calcaire historique (épandage du falun), pierre coquillière locale et sablières ; il s'agit de gisements fossilifères majeurs, notamment de requins et de siréniens.",
    wikipedia: "https://fr.wikipedia.org/wiki/Falun_(g%C3%A9ologie)",
  },
  {
    id: "vase_tangue", nom: "Vases, tangues & maërl", categorie: "sedimentaire", sousType: "formation superficielle (littorale actuelle)",
    swatch: "#9aa08a", densite: 1600,
    description: "Les sédiments que la mer dépose aujourd'hui : vases des estuaires, tangue calcaire de la baie du Mont-Saint-Michel, maërl des fonds bretons (un gravier d'algues calcaires, vivantes en surface seulement, dont l'extraction industrielle a cessé aux Glénan en 2011). Ce ne sont pas des roches : ce sont des roches en devenir, première page de la diagenèse.",
    mineralogie: "Silts quartzeux, argiles (illite, smectites), débris coquilliers (la tangue contient entre 30 et 60 % de CaCO₃) et matière organique. Le maërl se compose de thalles de Lithothamnium.",
    mineraux: [["quartz", 35], ["illite_m", 20], ["calcite", 20], ["smectites_m", 12], ["matorg", 8], ["pyrite", 5]],
    argiles: ["illite", "smectites"],
    argilesNote: "Les vases SONT des argiles en dépôt : illite et smectites héritées des bassins versants, floculées au contact de l'eau salée.",
    pedologie: "Matériaux parentaux, pas des roches : une fois exondés ou poldérisés, ils portent les THALASSOSOLS du Référentiel pédologique : « limono-sableux, calcaire, issu de tangue » en baie du Mont-Saint-Michel, argileux sur les mattes de Gironde. Drainés, ce sont parmi les terres les plus fertiles de France (polders, marais desséchés).",
    codes: [
      { code: "Mz", sens: " : dépôts marins et estuariens holocènes (vases, tangues, sables coquilliers), selon feuilles littorales" },
    ],
    varietes: [
      { nom: "tangue", note: "Silt calcaire coquillier des baies à forte amplitude de marée (Mont-Saint-Michel), suffisamment portant pour qu'on y marche et suffisamment mou pour engluer." },
      { nom: "vase estuarienne (slikke et schorre)", note: "Vase nue découverte à chaque marée (slikke), puis pré salé qui la retient (schorre)." },
      { nom: "maërl", note: "Gravier d'algues calcaires libres, qui vit à la surface et s'accumule sur des millénaires ; son extraction industrielle a cessé aux Glénan en 2011." },
      { nom: "sablon", note: "Sable très fin (0,06 à 0,15 mm), déposé sur les estrans abrités et dans les fonds de baie." },
    ],
    regions: [
      { nom: "Baie du Mont-Saint-Michel (tangue)", lat: 48.65, lng: -1.60 },
      { nom: "Rade de Brest (bancs de maërl)", lat: 48.33, lng: -4.42 },
      { nom: "Archipel des Glénan (bancs de maërl)", lat: 47.72, lng: -3.99 },
      { nom: "Estuaire de la Loire (vasières)", lat: 47.28, lng: -2.05 },
      { nom: "Marais poitevin (bri argileux)", lat: 46.32, lng: -0.90 },
    ],
    ages: [{ de: 0.0117, a: 0, label: "Holocène à actuel : en cours de dépôt à chaque marée" }],
    alteration: {
      vmin: 0.5, vmax: 10, facilite: 5,
      // D.8.2 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.144, cas: "Polder endigué de la baie du Mont-Saint-Michel (à Rennes, 222 mm d'eau pénètrent) : un front de décarbonatation y progresse.", src: "eau infiltrée saturée en calcite, masse volumique apparente 1,6, 20 % de calcaire", calcul: "decarbonatation", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Aucune altération au sens des roches dures : le sédiment évolue par « maturation ». Il se tasse, la matière organique et les sulfures s'oxydent (la vase noire dégage de l'H₂S, la vase mûre brunit), puis la surface se décarbonate après l'endiguement.",
      climat: "Tant qu'elle n'est pas fixée, la vase est remaniée par les marées et les tempêtes. Une fois endiguée, elle mûrit : elle se tasse, ses sulfures s'oxydent, et son calcaire part. Le calcul donne un front de décarbonatation qui descend de 14 mm en 100 ans sous la pluie de Rennes. En quelques décennies, la vase devient un sol structuré.",
    },
    produits: { sable: 200, limon: 450, argile: 250, oxydes: 20, dissous: 80 },
    produitsNote: "Le dépôt rend ce qu'il est : ≈ 450 g de limons, 250 g d'argiles, 200 g de sable fin ; la fraction carbonatée (coquilles) se dissout lentement dans les sols drainés.",
    usages: "Amendement d'autrefois (la tangue et le maërl ont « chaulé » les terres bretonnes), polders cultivés, conchyliculture ; les vasières forment des maillons écologiques majeurs pour les limicoles.",
    wikipedia: "https://fr.wikipedia.org/wiki/Tangue",
  },
  {
    id: "calcrete", nom: "Calcrète (croûte calcaire)", categorie: "sedimentaire", sousType: "formation superficielle (encroûtement pédogénique)",
    swatch: "#ddd0b0", densite: 2200,
    description: "Calcaire façonné par le sol : sous un climat à saison sèche (moins de 760 mm de pluie par an), la pluie dissout le calcaire près de la surface ; plus bas, l'eau perd son CO₂ et les racines la pompent : le carbonate précipite en nodules, puis en dalle continue. Près d'une nappe, l'eau qui remonte par capillarité en dépose aussi. Les « taparas » et les croûtes du Languedoc-Roussillon recouvrent des terrasses entières : le labour y résiste, et la vigne s'y enracine.",
    mineralogie: "Calcite micritique (nodules, pellicules laminaires), quartz et galets hérités du support ; parfois dolomite (dolocrète) ou gypse (gypcrète).",
    mineraux: [["calcite", 80], ["quartz", 10], ["illite_m", 5], ["goethite", 3], ["dolomite", 2]],
    argiles: ["illite"],
    argilesNote: "Comme pour un calcaire, la dissolution laisse sur place le résidu insoluble, composé d'illite, de quartz et d'oxydes hérités du sol encroûté.",
    pedologie: "Horizon de sol devenu roche : l'accumulation calcaire des CALCOSOLS, poussée jusqu'à l'induration, forme des horizons pétrocalciques. Elle témoigne d'un paléoclimat semi-aride (pluie comprise entre 20 et 50 % de l'ETP) : les croûtes languedociennes rappellent les steppes froides et sèches du Quaternaire.",
    codes: [
      { code: "—", sens: " pas de code propre : figurée avec la formation porteuse (ex. terrasses Fx-Fw encroûtées des feuilles languedociennes, croûtes précisées en notice)" },
    ],
    varietes: [
      { nom: "encroûtement nodulaire (« poupées »)", note: "Stade jeune : nodules épars dans le sol, comparables aux poupées du lœss." },
      { nom: "croûte zonaire / dalle compacte", note: "Stade final : une dalle laminée, continue et imperméable, de 0,3 à 2 m d'épaisseur." },
      { nom: "caliche", note: "Nom de cette même croûte au Mexique et dans le sud-ouest des États-Unis. Au Chili, le même mot désigne autre chose : le minerai de nitrates du désert d'Atacama." },
      { nom: "dolocrète / gypcrète", note: "Variantes dolomitiques et gypseuses, propres aux climats plus arides où la pluie reste inférieure à 20 % de l'ETP." },
    ],
    regions: [
      { nom: "Costières de Nîmes (terrasses encroûtées)", lat: 43.75, lng: 4.35 },
      { nom: "Plaine du Roussillon", lat: 42.65, lng: 2.90 },
      { nom: "Terrasses de la Crau", lat: 43.55, lng: 4.85 },
    ],
    ages: [{ de: 2.58, a: 0.0117, label: "Pléistocène : pédogenèses des interglaciaires et steppes sèches" }],
    alteration: {
      vmin: 0.01, vmax: 0.1, facilite: 2,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0063, cas: "Provence sèche (Marseille : 528 mm de pluie, 55 mm infiltrés)", src: "dissolution à saturation, masse volumique 2,2, 82 % de carbonate", calcul: "carbonate" },
        { v: 0.0145, cas: "Languedoc (à Montpellier, 667 mm de pluie, dont 125 mm s'infiltrent).", src: "dissolution à saturation, masse volumique 2,2, 82 % de carbonate", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Au contact de l'eau, la croûte redevient du calcaire ordinaire et se dissout sous l'action des eaux acidulées : CaCO₃ + CO₂ + H₂O → Ca²⁺ + 2 HCO₃⁻. Le climat actuel, un peu trop humide (Montpellier : 670 mm par an, mais 55 % de l'ETP), la dissout lentement : héritée, elle n'est plus à l'équilibre avec son milieu.",
      climat: "Aucune mesure publiée sur les croûtes françaises. Calcul : 0,6 mm en 100 ans sous le climat de Marseille, 1,5 mm sous celui de Montpellier ; la dalle protège pourtant les terrasses qu'elle coiffe, en une inversion de relief locale comparable à celle d'une meulière du Midi.",
    },
    produits: { sable: 60, limon: 100, argile: 120, oxydes: 20, dissous: 700 },
    produitsNote: "Environ 700 g de carbonate repartent en solution, soit vers la nappe, soit vers une croûte qui se forme plus bas. Le squelette, galets, sables et argiles rouges, rejoint le sol sus-jacent.",
    usages: "Granulat local et pierre sèche des capitelles ; contrainte agricole majeure, car il faut défoncer profondément avant de planter la vigne.",
    wikipedia: "https://fr.wikipedia.org/wiki/Calcr%C3%A8te",
  },
  {
    id: "roche_ferrifere", nom: "Roches ferrifères (fer rubané, minette)", categorie: "sedimentaire", sousType: "chimique (ferrifère)",
    swatch: "#8f4a3a", densite: 3400,
    description: "On extrait le fer de ces roches. Les fers rubanés (BIF) précambriens fournissent 90 % du minerai mondial : ils sont nés d'océans pauvres en oxygène et riches en fer dissous, où le fer a précipité par vagues pendant près de deux milliards d'années (de 3 800 à 1 800 millions d'années), surtout autour de la Grande Oxydation (vers 2 400 millions d'années). La France a eu sa grande industrie du fer : la minette de Lorraine, calcaire à oolithes ferrugineuses, a fait vivre un siècle de sidérurgie.",
    mineralogie: "BIF : hématite et magnétite en rubans alternés avec du chert. Minette : oolithes de goethite et de berthiérine dans un ciment calcaire ; son nom signale sa teneur modeste, de l'ordre de 30 % de Fe.",
    mineraux: [["goethite", 35], ["hematite", 20], ["calcite", 12], ["magnetite", 10], ["quartz", 10], ["siderite", 8], ["apatite", 5]],
    argiles: ["illite", "chlorite"],
    argilesNote: "La berthiérine des oolithes lorraines est une argile verte ferrifère du groupe des serpentines (feuillets 1:1 à 7 Å), longtemps confondue avec la chamosite, qui est une chlorite. Elle s'oxyde en goethite dans les chapeaux de « fer fort ».",
    codes: [
      { code: "l-j", sens: " : minette de Lorraine, « formation ferrifère » de l'Aalénien, notée avec le sommet du Lias/base du Dogger selon feuilles lorraines" },
      { code: "o", sens: " : fer oolithique armoricain et normand, ordovicien (par exemple les mines de Soumont ou de May-sur-Orne)" },
    ],
    varietes: [
      { nom: "fer rubané (BIF, itabirite, jaspilite)", note: "Hors de France, les rubans rouges et noirs d'Australie, du Brésil et d'Ukraine conservent la mémoire de l'oxygène terrestre." },
      { nom: "minette de Lorraine", note: "Oolithique, calcaire et phosphoreux : elle était fondue au haut fourneau, mais il a fallu le procédé Thomas (1877 à 1879) pour changer en acier la fonte phosphoreuse qu'elle donne." },
      { nom: "fer fort", note: "Riche en goethite, le chapeau résiduel des plateaux lorrains a été exploité dès l'âge du fer." },
      { nom: "collobriérite", note: "Fer métamorphisé des Maures (grenat et magnétite), curiosité française qui doit son nom à Collobrières." },
      { nom: "exhalite", note: "roche chimique déposée sur le fond marin par des sources hydrothermales (silice, oxydes de fer ou de manganèse, sulfures), souvent près des amas sulfurés." }
    ],
    regions: [
      { nom: "Bassin ferrifère lorrain (Briey, Longwy)", lat: 49.30, lng: 5.90 },
      { nom: "Normandie (Soumont, May-sur-Orne)", lat: 49.05, lng: -0.30 },
      { nom: "Maures (Collobrières)", lat: 43.24, lng: 6.31 },
      { nom: "Anjou-Bretagne (Segré, fer ordovicien)", lat: 47.69, lng: -0.87 },
    ],
    ages: [
      { de: 3800, a: 1800, label: "BIF : Archéen et Paléoprotérozoïque (Grande Oxydation vers 2 400 Ma)" },
      { de: 717, a: 660, label: "Fers rubanés néoprotérozoïques (type Rapitan, glaciation sturtienne)" },
      { de: 466, a: 458, label: "Fer oolithique armoricain (Ordovicien)" },
      { de: 174.7, a: 170.9, label: "Minette de Lorraine (Aalénien)" },
    ],
    alteration: {
      facilite: 2,
      // D.9.2 : vitesses nettes (mm/an), une par situation
      valeurs: [
        { v: 0.0127, cas: "Escarpement d'itabirite (fer rubané métamorphisé), près d'Itabirito, dans le Quadrilátero Ferrífero (Minas Gerais, Brésil ; climat tropical à hiver sec) : le recul de la paroi s'accompagne d'érosion.", src: "Salgado et al. 2007, béryllium 10 du quartz de l'itabirite, 12,71 ± 1,53 m par million d'années", ref: true }
      ],
      sources: [
        "Salgado A. A. R., Varajão C. A. C., Colin F., Braucher R., Varajão A. F. D. C., Nalini Jr H. A., Cherem L. F. S., Marent B. R., Brindusa C. B. (2007), « Estimativa das taxas de erosão das terras altas da alta bacia do rio das Velhas no Quadrilátero Ferrífero : implicações para a evolução do relevo », Revista Brasileira de Geomorfologia 8 (2) : 3 à 10 (tableau 1, point 3 : itabirite, masse volumique 3,02)",
        "Vasconcelos P. M., Farley K. A., Stone J., Piacentini T., Fifield L. K. (2019), « Stranded landscapes in the humid tropics : Earth's oldest land surfaces », Earth and Planetary Science Letters 519 : 152–164 (résumé)"
      ],
      mecanisme: "Le fer y est déjà oxydé : il ne « rouille » plus guère. La berthiérine et la sidérite de la minette s'oxydent en goethite (le « fer fort » des plateaux), le ciment calcaire se dissout ; les BIF, eux, comptent parmi les roches les plus inertes qui soient.",
      climat: "Aucune mesure n'est publiée sur la minette de Lorraine. Au Brésil, un escarpement d'itabirite (fer rubané) recule de 1,3 mm en 100 ans, moyenne établie sur des centaines de milliers d'années (béryllium 10), soit cinq à neuf fois plus vite que les plateaux de quartzite voisins. Les auteurs attribuent probablement ce contraste à la base de la paroi, minée par des schistes plus tendres. Sur les plateaux de fer rubané d'Urucum, coiffés d'hématite, la surface ne baisse que de 0,007 à 0,010 mm en 100 ans depuis des dizaines de millions d'années (Vasconcelos et al. 2019) : l'une des surfaces les plus stables du globe.",
    },
    produits: { sable: 150, limon: 100, argile: 200, oxydes: 450, dissous: 100 },
    produitsNote: "Environ 450 g d'oxydes de fer (goethite, hématite) : la roche s'enrichit en minerai en s'altérant. On trouve aussi 200 g d'argiles ocre et 100 g de carbonate dissous. Les sols issus de la minette sont lourds, rouges et fertiles.",
    usages: "Minerai de fer (la Lorraine a produit jusqu'à 60 Mt/an), pigments (ocres, sanguines) ; les BIF portent l'essentiel de la sidérurgie mondiale.",
    wikipedia: "https://fr.wikipedia.org/wiki/Minette_lorraine",
  },
  // ================= MAGMATIQUES =================
  {
    id: "granite", nom: "Granite", categorie: "magmatique", sousType: "plutonique",
    swatch: "#d4a0a0", densite: 2650,
    description: "Magma refroidi lentement en profondeur, remonté à la surface par l'érosion. Ossature des massifs anciens français (Bretagne, Massif central, Vosges, Corse), il se débite en boules et en chaos (Ploumanac'h, Sidobre) au fil de son arénisation.",
    mineralogie: "Quartz 25 à 35 %, feldspaths (orthose + plagioclases) 50 à 65 %, micas (biotite, muscovite) 5 à 10 %.",
    varietes: [
      { nom: "granite porphyroïde", note: "grands cristaux de feldspath potassique (2 à 10 cm) dans un fond grenu plus fin : les granites de la Margeride, du mont Lozère et de Guéret. Le granite rose de Ploumanac'h est, lui, à gros grain régulier." },
      { nom: "leucogranite (granite à deux micas)", note: "Pauvres en biotite et riches en muscovite, ces leucogranites du Limousin ont fourni le kaolin de Saint-Yrieix." },
      { nom: "granite alcalin", note: "Feldspath alcalin sodique abondant, et parfois amphibole sodique (riebeckite) : ce sont les granites alcalins permiens de Corse (Évisa, Porto, Monte Cinto, Bavella)." },
      { nom: "monzogranite / syénogranite", note: "La classification IUGS distingue deux moitiés dans le champ des granites. Le monzogranite compte autant de plagioclase que de feldspath potassique ; le syénogranite en renferme surtout ce dernier (le plagioclase reste sous 35 % des feldspaths). Les granites du Massif central et de Bretagne sont majoritairement des monzogranites." },
      { nom: "métagranite / métamonzogranite", note: "Granite déformé et recristallisé par le métamorphisme, mais de composition inchangée. Quand la foliation devient nette, on le nomme orthogneiss." }
    ],
    regions: [
      { nom: "Côte de granit rose (Ploumanac'h)", lat: 48.83, lng: -3.47 },
      { nom: "Plateau de Millevaches (Limousin)", lat: 45.75, lng: 1.85 },
      { nom: "Mont Lozère", lat: 44.44, lng: 3.75 },
      { nom: "Sidobre (Tarn)", lat: 43.62, lng: 2.38 },
      { nom: "Calanques de Piana (Corse)", lat: 42.25, lng: 8.63 },
      { nom: "Ballons des Vosges", lat: 47.90, lng: 6.85 },
    ],
    ages: [
      { de: 360, a: 290, label: "Granites varisques (chaîne hercynienne)" },
      { de: 620, a: 540, label: "Granites cadomiens : Bretagne nord" },
    ],
    alteration: {
      vmin: 0.001, vmax: 0.02, facilite: 2,
      // D.8.4 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00114, cas: "sous forêt, petits bassins français sur granites et gneiss à eaux sodiques (20 types de roches) : dissolution seule", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,65", calcul: "ruisseaux" },
        { v: 0.004, cas: "front d'altération sous l'arène, Davis Run (Virginie), climat plus froid et plus sec qu'à Panola", src: "White et al. 2001, âges cosmogéniques du régolithe" },
        { v: 0.007, cas: "front d'altération sous l'arène, granite de Panola (Géorgie, climat chaud et humide)", src: "White et al. 2001, âges cosmogéniques du régolithe" },
        { v: 0.012, cas: "Au bas d'un profil de 2 m, la roche saine se change en arène : c'est le cas au sommet du bassin du Strengbach (Vosges, 1 400 mm de pluie, 6 °C, forêt).", src: "Ackerer et al. 2016, uranium, thorium et radium", ref: true },
        { v: 0.022, cas: "Au même sommet du Strengbach, la surface du sol s'abaisse, érosion comprise, moyenne calculée sur les 20 000 dernières années.", src: "Ackerer et al. 2016, béryllium 10" }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)",
        "Ackerer J., Chabaux F., Van der Woerd J., Viville D., Pelt E., Kali E., Lerouge C., Ackerer P., di Chiara Roupert R., Négrel P. (2016), « Regolith evolution on the millennial timescale from combined U–Th–Ra isotopes and in situ cosmogenic ¹⁰Be analysis in a weathering profile (Strengbach catchment, France) », Earth and Planetary Science Letters 453 : 33–43",
        "White A. F., Bullen T. D., Schulz M. S., Blum A. E., Huntington T. G., Peters N. E. (2001), « Differential rates of feldspar weathering in granitic regoliths », Geochimica et Cosmochimica Acta 65 (6) : 847–869"
      ],
      mecanisme: "Les feldspaths s'hydrolysent en kaolinite et en ions, la biotite en vermiculite et oxydes de fer, tandis que le quartz reste intact. Sur place naît une « arène granitique », un sable grossier et friable, où subsistent des boules de roche saine.",
      climat: "Au sommet du bassin du Strengbach (Vosges, 1 400 mm de pluie, 6 °C), la roche saine se change en arène à 1,2 mm en 100 ans, et la surface du sol s'abaisse de 2,2 mm en 100 ans, érosion comprise. Ce que les ruisseaux emportent en solution ne vaut que 0,11 mm en 100 ans : l'arène garde son quartz et ses argiles, et seule une petite part de la roche part dissoute (13 à 30 % de ce que perd le sommet du Strengbach). En Géorgie et en Virginie, plus chaudes, le front d'altération descend de 0,4 à 0,7 mm en 100 ans.",
    },
    produits: { sable: 320, limon: 60, argile: 380, oxydes: 30, dissous: 210 },
    produitsNote: "1 kg de granite ≈ 320 g de sable quartzeux (le futur sable des plages), 380 g d'argiles (kaolinite : la porcelaine de Limoges vient d'arènes du Limousin), 30 g d'oxydes de fer, et 210 g d'ions (K⁺, Na⁺, Ca²⁺, silice) qui nourrissent rivières et océans.",
    usages: "Granulats, pierre de taille, monuments ; ses arènes kaoliniques → porcelaine.",
    wikipedia: "https://fr.wikipedia.org/wiki/Granite",
  },
  {
    id: "granodiorite", nom: "Granodiorite", categorie: "magmatique", sousType: "plutonique acide",
    swatch: "#c8a6a0", densite: 2720,
    codes: [
      { code: "γ", sens: " : avec les granites (par exemple γ3 et γ4, granodiorites varisques)" },
      { code: "ηγ", sens: " : lorsqu'elle tend vers la diorite quartzique, selon les feuilles" },
    ],
    description: "Le trait d'union entre le granite et la diorite : un granitoïde clair moucheté de noir, plus riche en plagioclase et en minéraux sombres que le granite. C'est l'une des roches plutoniques les plus répandues, dans les Pyrénées (Quérigut) et le batholite mancellien (Normandie, Maine) comme dans le socle hercynien du Massif central (Piégut-Pluviers).",
    mineralogie: "Quartz 20 à 30 %, plagioclase (oligoclase-andésine) dominant sur le feldspath potassique, biotite et amphibole (hornblende) 15 à 25 %.",
    mineraux: [["plagioclases", 45], ["quartz", 25], ["biotite", 12], ["orthose", 10], ["hornblende", 6], ["magnetite", 2]],
    argiles: ["kaolinite", "illite", "vermiculite"],
    argilesNote: "Comme le granite : en climat tempéré, vermiculite (de la biotite et de la hornblende), illite et interstratifiés, avec un peu de smectite et de kaolinite issues du plagioclase ; la kaolinite ne domine que sous climat chaud et humide.",
    varietes: [
      { nom: "à biotite", note: "Faciès courant, sombre et bien grenu." },
      { nom: "à biotite et cordiérite", note: "faciès anatectique (né de la fusion de roches alumineuses), typique du batholite mancellien (Normandie, Maine) ; il se trouve aussi dans le Massif central." },
      { nom: "à amphibole", note: "Faciès de transition vers la tonalite et la diorite." },
      { nom: "métagranodiorite", note: "granodiorite recristallisée par le métamorphisme, à biotite et amphibole alignées." }
    ],
    regions: [
      { nom: "Quérigut (Ariège)", lat: 42.70, lng: 2.08 },
      { nom: "Piégut-Pluviers (Dordogne)", lat: 45.62, lng: 0.69 },
      { nom: "Batholite mancellien (Vire, Calvados)", lat: 48.84, lng: -0.89 },
      { nom: "Batholite corse", lat: 42.15, lng: 9.10 },
    ],
    ages: [
      { de: 345, a: 295, label: "Granodiorites varisques (Hercynien)" },
      { de: 550, a: 530, label: "Granodiorites cadomiennes à cordiérite du batholite mancellien, vers 540 Ma" },
    ],
    alteration: {
      vmin: 0.002, vmax: 0.025, facilite: 2,
      // D.8.4 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00116, cas: "sous forêt, petits bassins français sur granites et gneiss calco-alcalins, à eaux calciques (10 types de roches) : dissolution seule", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,72", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "Hydrolyse des feldspaths (→ kaolinite/illite + ions) et des minéraux sombres (biotite, amphibole → vermiculite/chlorite + oxydes de fer) ; le quartz reste intact. Elle s'arénise comme le granite, un peu plus vite car plus riche en plagioclase et en ferro-magnésiens (série de Goldich).",
      climat: "Sous forêt, les ruisseaux français qui drainent les granitoïdes calco-alcalins, dont les granodiorites, emportent en solution l'équivalent de 0,12 mm de roche en 100 ans, autant que sur les granites à eaux sodiques. Comme pour le granite, la roche se change en arène bien plus vite qu'elle ne se dissout : au Strengbach (granite des Vosges), le front d'altération descend de 1,2 mm en 100 ans ; aucune mesure n'en est publiée sur une granodiorite française.",
    },
    produits: { sable: 280, limon: 70, argile: 400, oxydes: 40, dissous: 210 },
    produitsNote: "≈ 280 g de sable quartzo-feldspathique, 400 g d'argiles (kaolinite, vermiculite des biotites), 40 g d'oxydes de fer ; l'arène granodioritique est un peu plus « grasse » que celle d'un granite.",
    usages: "Granulats, pierre de construction, enrochement.",
    wikipedia: "https://fr.wikipedia.org/wiki/Granodiorite",
  },
  {
    id: "tonalite", nom: "Tonalite", categorie: "magmatique", sousType: "plutonique acide",
    swatch: "#b6b0a2", densite: 2750,
    codes: [
      { code: "ηγ", sens: " : diorites quartziques et tonalites (feuilles varisques)" },
    ],
    description: "Un granitoïde à quartz et plagioclase mais quasiment sans feldspath potassique, riche en biotite et amphibole, donc plus sombre que le granite. Son nom vient du col du Tonale, dans les Alpes.",
    mineralogie: "Quartz 20 à 30 %, plagioclase largement dominant, amphibole + biotite abondantes, feldspath K < 10 %.",
    mineraux: [["plagioclases", 50], ["quartz", 25], ["biotite", 12], ["hornblende", 10], ["magnetite", 3]],
    argiles: ["kaolinite", "vermiculite", "smectites"],
    argilesNote: "Le plagioclase dominant alimente soit la kaolinite (en climat bien drainé), soit les smectites (en sol mal drainé) ; la hornblende ajoute sa vermiculite.",
    varietes: [
      { nom: "trondhjémite", note: "tonalite très claire à plagioclase sodique (voir sa fiche)." },
      { nom: "quartz-diorite", note: "Pôle plus sombre, en direction de la diorite." },
      { nom: "microtonalite", note: "tonalite à grain fin, en filons ou en enclaves." },
      { nom: "métatonalite", note: "tonalite recristallisée par le métamorphisme." }
    ],
    regions: [
      { nom: "Maures (Var)", lat: 43.27, lng: 6.38 },
      { nom: "Batholite corse", lat: 42.10, lng: 9.05 },
      { nom: "Ligne tonalitique de Vendée-Limousin (massif du Tallud, Deux-Sèvres)", lat: 46.63, lng: -0.30 },
    ],
    ages: [
      { de: 380, a: 350, label: "Ligne tonalitique de Vendée-Limousin (Dévonien supérieur à Carbonifère inférieur)" },
      { de: 345, a: 300, label: "Tonalites des Maures (vers 334 Ma) et de Corse" },
    ],
    alteration: {
      facilite: 3,
      // D.9.1 : vitesses nettes (mm/an), une par situation
      valeurs: [
        { v: 0.024, cas: "Sur la tonalite de Fall River (Sierra Nevada, Californie), sous chaparral et chênes (1 450 mm de pluie, 11,9 °C), des petits bassins voient leur surface s'abaisser, érosion comprise.", src: "Riebe et al. 2001, béryllium 10 et aluminium 26 des sables des ruisseaux, 24 ± 5 mm par millénaire" },
        { v: 0.029, cas: "Antelope Lake (Sierra Nevada) : des petits bassins sur tonalite, couverts de conifères (830 mm de pluie, 7,8 °C), présentent un abaissement de surface qui intègre l'érosion.", src: "Riebe et al. 2001, béryllium 10 et aluminium 26, 29 ± 3 mm par millénaire", ref: true },
        { v: 0.035, cas: "Fort Sage (Sierra Nevada) : sous steppe à armoise (250 mm de pluie, 12,2 °C), les petits bassins sur tonalite s'abaissent, érosion comprise.", src: "Riebe et al. 2001, béryllium 10 et aluminium 26, 35 ± 4 mm par millénaire" },
        { v: 0.043, cas: "Adams Peak (Sierra Nevada, vers 2 000 m), petits bassins sur tonalite sous forêt de conifères (580 mm de pluie, 4,2 °C) : abaissement de la surface, érosion comprise", src: "Riebe et al. 2001, béryllium 10 et aluminium 26, 43 ± 3 mm par millénaire" }
      ],
      sources: [
        "Riebe C. S., Kirchner J. W., Granger D. E., Finkel R. C. (2001), « Minimal climatic control on erosion rates in the Sierra Nevada, California », Geology 29 (5) : 447–450 (tableau 1 : sites sur tonalite d'après la carte géologique, bassins de moins de 112 ha, non glaciés)"
      ],
      mecanisme: "L'hydrolyse des plagioclases et des minéraux ferromagnésiens (amphibole, biotite) est un peu plus rapide que pour le granite ; le quartz subsiste sous forme de sable.",
      climat: "Dans la Sierra Nevada (Californie), les petits bassins sur tonalite s'abaissent de 2,4 à 4,3 mm en 100 ans, érosion comprise, moyenne de plusieurs milliers d'années : 2,9 mm sous la forêt de conifères d'Antelope Lake (830 mm de pluie, 7,8 °C). Le climat n'y change presque rien : 4,3 mm au froid d'Adams Peak (4,2 °C), 3,5 mm dans la steppe sèche de Fort Sage (250 mm de pluie), 2,4 mm sous les 1 450 mm de pluie de Fall River. Les auteurs n'y trouvent aucun lien avec la pluie ni la température ; la pente et l'incision des rivières comptent davantage. Aucune mesure n'est publiée sur une tonalite française.",
    },
    produits: { sable: 250, limon: 70, argile: 420, oxydes: 50, dissous: 210 },
    produitsNote: "≈ 250 g de sable (quartz surtout), 420 g d'argiles issues du plagioclase et de la hornblende, 50 g d'oxydes, 210 g d'ions exportés.",
    usages: "Granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Tonalite",
  },
  {
    id: "trondhjemite", nom: "Trondhjémite", categorie: "magmatique", sousType: "plutonique acide",
    swatch: "#d2ccc0", densite: 2700,
    codes: [
      { code: "ηγ", sens: " : avec les tonalites ; plagiogranites des ophiolites notés localement (Corse, Chenaillet)" },
    ],
    description: "Une tonalite très claire, presque blanche : plagioclase sodique et quartz, avec très peu de minéraux noirs. Membre des séries TTG (tonalite-trondhjémite-granodiorite) qui composent une grande part de la croûte continentale archéenne.",
    mineralogie: "Plagioclase sodique (oligoclase) dominant, quartz (20 à 30 %), biotite (moins de 10 %), feldspath potassique peu ou pas présent.",
    mineraux: [["plagioclases", 55], ["quartz", 30], ["biotite", 8], ["muscovite", 5], ["magnetite", 2]],
    argiles: ["kaolinite"],
    argilesNote: "Presque un seul fournisseur : l'oligoclase, qui se kaolinise en argiles blanches, d'où des profils d'altération très pâles.",
    varietes: [
      { nom: "plagiogranite", note: "Équivalent des croûtes océaniques (dans les ophiolites)." },
      { nom: "microtrondhjémite", note: "trondhjémite à grain fin, en filons." },
      { nom: "métatrondhjémite / métaplagiogranite", note: "trondhjémite ou plagiogranite d'ophiolite recristallisé : l'albite remplace le plagioclase, la chlorite et l'épidote les minéraux sombres (ophiolites métamorphiques de Corse alpine)." }
    ],
    regions: [
      { nom: "Ophiolite du Chenaillet (albitites, dites plagiogranites)", lat: 44.90, lng: 6.76 },
      { nom: "Douarnenez et cap Sizun (Finistère)", lat: 48.08, lng: -4.40 },
      { nom: "Coutances (Manche)", lat: 49.05, lng: -1.44 },
    ],
    ages: [
      { de: 165, a: 150, label: "Plagiogranites de l'océan alpin (ophiolites)" },
      { de: 495, a: 450, label: "Trondhjémite de Douarnenez (Ordovicien, 472 ± 24 Ma)" },
      { de: 600, a: 540, label: "Trondhjémite de Coutances (Néoprotérozoïque, cadomien)" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "L'hydrolyse des plagioclases sodiques produit des argiles et libère Na⁺ et silice ; le quartz demeure. Peu de minéraux sombres, donc peu d'oxydes de fer.",
    },
    produits: { sable: 300, limon: 60, argile: 400, oxydes: 20, dissous: 220 },
    produitsNote: "≈ 300 g de sable quartzeux, 400 g d'argiles claires (kaolinite des plagioclases sodiques), très peu d'oxydes de fer (20 g) : le profil d'altération reste blanc.",
    usages: "Peu exploitée en tant que telle.",
    wikipedia: "https://fr.wikipedia.org/wiki/Trondhj%C3%A9mite",
  },
  {
    id: "diorite", nom: "Diorite", categorie: "magmatique", sousType: "plutonique intermédiaire",
    swatch: "#7a7c74", densite: 2850,
    codes: [
      { code: "η", sens: " : diorites (ηγ pour les faciès quartziques)" },
    ],
    description: "La roche plutonique intermédiaire par excellence, sombre et « poivre et sel » : surtout du plagioclase et de l'amphibole, très peu de quartz. Équivalent profond de l'andésite.",
    mineralogie: "Plagioclase (andésine) de 55 à 70 %, amphibole (hornblende) avec biotite et parfois pyroxène pour 25 à 40 %, quartz inférieur à 5 %, feldspath potassique peu notable.",
    mineraux: [["plagioclases", 56], ["hornblende", 25], ["biotite", 10], ["pyroxenes", 5], ["quartz", 2], ["magnetite", 2]],
    argiles: ["smectites", "vermiculite", "chlorite"],
    argilesNote: "Les plagioclases calciques et la hornblende donnent surtout des smectites ; la biotite se transforme en vermiculite. Le bilan se situe à mi-chemin entre le granite et le gabbro.",
    varietes: [
      { nom: "quartz-diorite", note: "Contenant de 5 à 20 % de quartz, elle fait transition vers la tonalite. Son nom dans le lexique du BRGM est diorite quartzifère." },
      { nom: "diorite orbiculaire (corsite / napoléonite)", note: "célèbre roche à sphères concentriques de Sainte-Lucie-de-Tallano, en Corse." },
      { nom: "diorite foïdifère / foïdique", note: "diorite à néphéline, sans quartz : moins de 10 % de foïdes (diorite foïdifère) ou 10 à 60 % (diorite foïdique)." },
      { nom: "métadiorite / métaquartzdiorite", note: "diorite (ou quartz-diorite) recristallisée par le métamorphisme." }
    ],
    regions: [
      { nom: "Sainte-Lucie-de-Tallano (corsite, Corse)", lat: 41.68, lng: 9.06 },
      { nom: "Champ du Feu (Vosges du Nord)", lat: 48.40, lng: 7.27 },
      { nom: "Ligne tonalitique du Limousin (Confolentais)", lat: 46.01, lng: 0.67 },
    ],
    ages: [
      { de: 375, a: 350, label: "Diorites quartzifères de la ligne tonalitique du Limousin" },
      { de: 345, a: 300, label: "Hercynien" },
    ],
    alteration: {
      vmin: 0.003, vmax: 0.03, facilite: 3,
      // D.8.4 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.058, cas: "front d'altération : la roche saine devient saprolite, diorite quartzique du Rio Blanco, bassin du Rio Icacos (Porto Rico, forêt tropicale, 4 300 mm de pluie, 23 °C) : l'altération la plus rapide mesurée sur une roche silicatée", src: "White et al. 1998, bilan de masse du saprolite ; climat d'après Turner, Stallard et Brantley 2003", ref: true }
      ],
      sources: [
        "White A. F., Blum A. E., Schulz M. S., Vivit D. V., Stonestrom D. A., Larsen M., Murphy S. F., Eberl D. (1998), « Chemical weathering in a tropical watershed, Luquillo Mountains, Puerto Rico: I. Long-term versus short-term weathering fluxes », Geochimica et Cosmochimica Acta 62 (2) : 209–226",
        "Turner B. F., Stallard R. F., Brantley S. L. (2003), « Investigation of in situ weathering of quartz diorite bedrock in the Rio Icacos basin, Luquillo Experimental Forest, Puerto Rico », Chemical Geology 202 : 313–341 (pluie et température du bassin)"
      ],
      mecanisme: "L'hydrolyse des plagioclases, des amphiboles et des pyroxènes donne des smectites et des oxydes de fer ; sans quartz, elle ne produit pas de sable durable. Elle agit un peu plus vite que sur le granite.",
      climat: "Sous la forêt tropicale du Rio Icacos (Porto Rico, 4 300 mm de pluie, 23 °C), la diorite quartzique du Rio Blanco se change en saprolite à 5,8 mm en 100 ans, le record publié pour une roche silicatée : plagioclase et hornblende y réagissent dès le contact avec la roche saine. Aucune mesure n'est publiée sur une diorite de France, où le climat, plus froid et plus sec, ralentit fortement l'altération.",
    },
    produits: { sable: 120, limon: 80, argile: 440, oxydes: 80, dissous: 280 },
    produitsNote: "≈ 440 g d'argiles (smectites et vermiculites des amphiboles et plagioclases), 120 g de sable, 80 g d'oxydes de fer qui brunissent le profil, 280 g d'ions.",
    usages: "Granulats, dallage, pierre ornementale (corsite).",
    wikipedia: "https://fr.wikipedia.org/wiki/Diorite",
  },
  {
    id: "monzonite", nom: "Monzonite", categorie: "magmatique", sousType: "plutonique intermédiaire",
    swatch: "#9a8a80", densite: 2760,
    codes: [
      { code: "γ-η", sens: " : notation intermédiaire selon feuilles ; les monzogranites restent dans les γ" },
    ],
    description: "Roche plutonique dans laquelle feldspath potassique et plagioclase occupent des volumes presque égaux, avec très peu de quartz. Elle tire son nom du Monzoni, dans les Dolomites.",
    mineralogie: "Feldspath K ≈ plagioclase (ensemble 70 à 90 %), pyroxène + amphibole + biotite, quartz < 5 %.",
    mineraux: [["plagioclases", 35], ["orthose", 35], ["hornblende", 15], ["biotite", 8], ["pyroxenes", 4], ["quartz", 3]],
    argiles: ["illite", "kaolinite", "smectites"],
    argilesNote: "Deux feldspaths, deux devenirs : l'orthose évolue vers l'illite et la kaolinite, le plagioclase vers les smectites.",
    varietes: [
      { nom: "monzonite quartzifère (quartz-monzonite)", note: "Plus riche en quartz, elle fait transition vers le granite. Son nom dans le lexique du BRGM est monzonite quartzifère." },
      { nom: "monzodiorite", note: "Plus riche en plagioclase (voir sa fiche)." },
      { nom: "monzonite foïdifère", note: "jusqu'à 10 % de néphéline, sans quartz." },
      { nom: "micromonzonite", note: "Monzonite à grain fin, présente en filons ; elle existe aussi sous forme de micromonzonite quartzifère ou foïdifère." },
      { nom: "métamonzonite", note: "monzonite recristallisée par le métamorphisme." }
    ],
    regions: [
      { nom: "Bordure nord du massif des Ballons (Vosges du Sud)", lat: 47.88, lng: 6.85 },
      { nom: "Salice et Letia (Corse-du-Sud)", lat: 42.12, lng: 8.88 },
    ],
    ages: [{ de: 345, a: 330, label: "Monzonites magnésio-potassiques du Viséen : Corse occidentale (U1), Vosges (Ballons)" }],
    alteration: {
      facilite: 3,
      mecanisme: "L'hydrolyse des feldspaths (potassiques, puis calco-sodiques) et des minéraux sombres produit des argiles, des oxydes de fer et des ions ; le quartz étant rare, le sable résiduel l'est aussi.",
    },
    produits: { sable: 180, limon: 80, argile: 420, oxydes: 60, dissous: 260 },
    produitsNote: "Environ 420 g d'argiles (kaolinite et illite issues de l'orthose, smectites issues du plagioclase), 180 g de sable feldspathique et 260 g d'ions : le bilan se situe à mi-chemin entre celui du granite et celui de la diorite.",
    usages: "Granulats, pierre.",
    wikipedia: "https://fr.wikipedia.org/wiki/Monzonite",
  },
  {
    id: "monzodiorite", nom: "Monzodiorite", categorie: "magmatique", sousType: "plutonique intermédiaire",
    swatch: "#85786c", densite: 2800,
    codes: [
      { code: "η", sens: " : avec les diorites ; la distinction se lit dans le libellé de la légende" },
    ],
    description: "Le terme intermédiaire entre la monzonite et la diorite : dominée par le plagioclase, avec un peu de feldspath potassique et beaucoup de minéraux sombres.",
    mineralogie: "Plagioclase dominant + feldspath K subordonné, amphibole/pyroxène/biotite abondants, quartz < 5 %.",
    mineraux: [["plagioclases", 45], ["orthose", 20], ["hornblende", 18], ["biotite", 10], ["pyroxenes", 5], ["magnetite", 2]],
    argiles: ["smectites", "illite", "vermiculite"],
    argilesNote: "Bilan de diorite tempéré par l'orthose : smectites dominantes, illite du feldspath potassique.",
    regions: [
      { nom: "Batholite corse", lat: 42.00, lng: 9.05 },
      { nom: "Oradour-Fanais (Charente), ligne tonalitique du Limousin", lat: 46.12, lng: 0.78 },
    ],
    ages: [
      { de: 375, a: 350, label: "Monzodiorites quartzifères de la ligne tonalitique du Limousin" },
      { de: 345, a: 290, label: "Hercynien" },
    ],
    alteration: {
      facilite: 3,
      // D.9.1 : vitesses nettes (mm/an), une par situation
      valeurs: [
        { v: 0.0035, cas: "altération chimique sur les 80 m d'un forage dans une monzodiorite quartzique, Santa Gracia (cordillère côtière du Chili, semi-aride : 87 mm de pluie, 16 °C) : matière perdue en solution", src: "Krone et al. 2021, 9,9 t/km² par an (béryllium 10 × part de masse perdue), masse volumique 2,8", calcul: "flux" },
        { v: 0.011, cas: "Au même forage de Santa Gracia, la surface du sol s'abaisse, érosion comprise, en moyenne sur les 56 000 dernières années.", src: "Krone et al. 2021, béryllium 10 (4 échantillons) : 29,6 t/km² par an, environ 11 m par million d'années", ref: true }
      ],
      sources: [
        "Krone L. V., Hampl F. J., Schwerdhelm C., Bryce C., Ganzert L., Kitte A., Übernickel K., Dielforder A., Aldaz S., Oses-Pedraza R., Perez J. P. H., Sanchez-Alfaro P., Wagner D., Weckmann U., von Blanckenburg F. (2021), « Deep weathering in the semi-arid Coastal Cordillera, Chile », Scientific Reports 11 : 13057 (roche du forage classée monzodiorite quartzique d'après sa minéralogie)"
      ],
      mecanisme: "L'hydrolyse des plagioclases et des minéraux ferromagnésiens produit des smectites et des oxydes de fer ; le comportement est proche de celui de la diorite.",
      climat: "Dans la cordillère côtière du Chili, sous un climat semi-aride (87 mm de pluie, 16 °C), la surface d'une monzodiorite quartzique s'abaisse de 1,1 mm en 100 ans, érosion comprise ; l'eau n'en emporte en solution que l'équivalent de 0,35 mm, mais elle l'altère jusqu'à 76 m de profondeur en suivant les fractures. Aucune mesure n'est publiée sur une monzodiorite française.",
    },
    produits: { sable: 130, limon: 80, argile: 440, oxydes: 70, dissous: 280 },
    produitsNote: "≈ 440 g d'argiles, 130 g de sable, 70 g d'oxydes, 280 g d'ions : le plagioclase et les ferromagnésiens font l'essentiel du travail.",
    usages: "Granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Monzodiorite",
    varietes: [{ nom: "Monzodiorite quartzifère", note: "5 à 20 % de quartz." }, { nom: "Micromonzodiorite", note: "même composition à grain fin, en filons. Existe aussi quartzifère ou foïdifère." }, { nom: "Métamonzodiorite", note: "monzodiorite transformée par le métamorphisme." }, { nom: "Monzodiorite foïdifère", note: "jusqu'à 10 % de néphéline, sans quartz ; son équivalent filonien est la micromonzodiorite foïdifère (micromonzodiorite quartzifère quand c'est le quartz qui apparaît)." } ],
  },
  {
    id: "syenite", nom: "Syénite", categorie: "magmatique", sousType: "plutonique intermédiaire",
    swatch: "#c2a890", densite: 2700,
    codes: [
      { code: "σ / notation locale", sens: " : roche rare sur les cartes françaises ; les syénites corses sont souvent regroupées avec les granites alcalins de leur complexe (γ), le libellé tranche" },
    ],
    description: "Une roche plutonique claire dominée par le feldspath potassique, mais presque sans quartz (< 5 %) : un « granite sans quartz ». Elle naît de magmas potassiques ou alcalins. Son nom vient de Syène (Assouan, Égypte).",
    mineralogie: "Feldspath alcalin 60 à 80 %, amphibole/pyroxène (parfois aegyrine) + biotite, quartz < 5 %.",
    mineraux: [["orthose", 60], ["plagioclases", 15], ["hornblende", 10], ["biotite", 8], ["aegyrine", 4], ["quartz", 3]],
    argiles: ["illite", "kaolinite"],
    argilesNote: "L'orthose massive s'hydrolyse d'abord en illite, puis en kaolinite ; le quartz étant presque absent, elle ne fournit pas de sable résiduel.",
    varietes: [
      { nom: "syénite alcaline", note: "à amphibole/pyroxène sodiques (aegyrine, riébeckite)." },
      { nom: "syénite néphélinique", note: "Sous-saturée, à néphéline (voir sa fiche)." },
      { nom: "syénite quartzifère", note: "De 5 à 20 % de quartz : vers le syénogranite ; le terme s'applique aussi aux syénites alcalines (syénite alcaline quartzifère)." },
      { nom: "syénite foïdifère", note: "jusqu'à 10 % de néphéline, sans quartz (de même la syénite alcaline foïdifère) ; au-delà, c'est une syénite foïdique (voir la fiche syénite néphélinique)." },
      { nom: "microsyénite", note: "syénite à grain fin, en filons ; elle se décline comme la syénite : microsyénite alcaline (et alcaline quartzifère ou foïdifère), quartzifère, foïdifère ou foïdique." },
      { nom: "métasyénite", note: "syénite recristallisée par le métamorphisme." }
    ],
    regions: [
      { nom: "Bordure nord du massif des Ballons (Vosges du Sud)", lat: 47.88, lng: 6.85 },
      { nom: "Batholite corse", lat: 42.20, lng: 9.15 },
    ],
    ages: [{ de: 345, a: 275, label: "Du Viséen (Vosges) au Permien (complexes alcalins de Corse)" }],
    alteration: {
      facilite: 3,
      mecanisme: "L'hydrolyse du feldspath potassique produit de l'illite ou de la kaolinite et libère K⁺ ; sans quartz, aucun sable durable ne subsiste.",
    },
    produits: { sable: 150, limon: 90, argile: 430, oxydes: 50, dissous: 280 },
    produitsNote: "≈ 430 g d'argiles (kaolinite et illite du feldspath potassique), 150 g de sable feldspathique, presque sans quartz, 280 g d'ions dont beaucoup de potassium.",
    usages: "Pierre ornementale, granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Sy%C3%A9nite",
  },
  {
    id: "pyroxenite", nom: "Pyroxénolite (pyroxénite)", categorie: "magmatique", sousType: "plutonique ultrabasique",
    swatch: "#43413a", densite: 3300,
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Pyroxenite_%28Stillwater_Complex%2C_Neoarchean%2C_2.71_Ga%3B_Beartooth_Mountains%2C_Montana%2C_USA%29_%2816762707716%29.jpg/500px-Pyroxenite_%28Stillwater_Complex%2C_Neoarchean%2C_2.71_Ga%3B_Beartooth_Mountains%2C_Montana%2C_USA%29_%2816762707716%29.jpg",
    codes: [
      { code: "Σ, π", sens: " : rattachée aux ultramafites (serpentinites Σ, péridotites π) ou classée en surcharge dans les complexes basiques" },
    ],
    description: "Une roche ultramafique faite presque entièrement de pyroxènes. C'est un cumulat : des cristaux séparés du magma qui les portait, déposés au fond d'une chambre magmatique basique ou sur les parois d'un conduit qui traverse le manteau. Dans les lherzolites de l'Ariège, elle dessine des lits sombres qu'Alfred Lacroix nomma ariégites.",
    mineralogie: "Pyroxènes (clinopyroxène, orthopyroxène ou les deux) à plus de 90 %, avec un peu de spinelle vert sombre ; parfois du grenat, de la hornblende brune ou de l'olivine. Ni quartz ni feldspath.",
    mineraux: [["pyroxenes", 90], ["spinelle", 6], ["hornblende", 2], ["olivine", 2]],
    argiles: ["smectites", "chlorite"],
    argilesNote: "Les pyroxènes donnent surtout des smectites magnésiennes ; la chlorite est héritée des parties de la roche déjà altérées en profondeur.",
    varietes: [
      { nom: "webstérite", note: "orthopyroxène et clinopyroxène en proportions voisines." },
      { nom: "orthopyroxénite / clinopyroxénite", note: "dominées par l'un ou l'autre pyroxène. Noms du lexique BRGM : orthopyroxénolite, clinopyroxénolite." },
      { nom: "hornblendite", note: "l'amphibole y remplace le pyroxène ; dans les lits de l'Ariège, la hornblende brune fait parfois disparaître tout le pyroxène (voir sa fiche)." },
      { nom: "métapyroxénite / métapyroxénolite", note: "pyroxénite recristallisée par le métamorphisme ; une partie du pyroxène devient amphibole." },
      { nom: "ariégite", note: "nom donné en 1901 par Alfred Lacroix, d'après l'Ariège, aux lits de pyroxénite à spinelle vert sombre des lherzolites de Lherz, de la vallée de Suc et de Prades ; certains portent du grenat. Nom local ancien, absent du lexique BRGM." }
    ],
    regions: [
      { nom: "Étang de Lers (Ariège)", lat: 42.807, lng: 1.378 },
      { nom: "Freychinède (Ariège)", lat: 42.801, lng: 1.431 },
      { nom: "Prades (Ariège)", lat: 42.786, lng: 1.878 },
    ],
    ages: [{ de: 115, a: 103, label: "Remontée du manteau au fond d'un bassin pyrénéen ; les lits, plus anciens, ne sont pas datés" }],
    alteration: {
      facilite: 4,
      mecanisme: "Les pyroxènes s'hydrolysent assez vite (ils viennent juste après l'olivine dans la série de Goldich) et donnent des smectites et des oxydes de fer. La roche est massive, mais chimiquement peu résistante.",
    },
    produits: { sable: 0, limon: 60, argile: 350, oxydes: 180, dissous: 410 },
    produitsNote: "Sans quartz, donc sans sable : environ 350 g de smectites magnésiennes, 180 g d'oxydes de fer et 410 g d'ions (Mg, Ca, Si) qui gagnent les eaux.",
    usages: "Peu exploitée ; intérêt scientifique pour l'étude du manteau et des cumulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Pyrox%C3%A9nite",
  },
  {
    id: "hornblendite", nom: "Hornblendite", categorie: "magmatique", sousType: "plutonique ultrabasique",
    swatch: "#35352f", densite: 3150,
    codes: [
      { code: "—", sens: " pas de notation dédiée : figurée dans les complexes basiques (θ) avec mention au libellé" },
    ],
    description: "Une roche ultramafique noire faite presque uniquement de hornblende (amphibole) : un cumulat hydraté, cousin de la pyroxénite mais formé en présence d'eau dans le magma.",
    mineralogie: "Amphibole (hornblende) de 85 à 95 % ; ± pyroxène, plagioclase, oxydes.",
    mineraux: [["hornblende", 85], ["pyroxenes", 6], ["biotite", 5], ["magnetite", 4]],
    argiles: ["smectites", "chlorite", "vermiculite"],
    argilesNote: "La hornblende se transforme en smectites et en chlorite dégradée (vermiculite) ; le fer libéré colore tout le profil en brun.",
    ages: [{ de: 345, a: 290, label: "Hercynien (rare)" }],
    alteration: {
      facilite: 3,
      mecanisme: "L'hydrolyse des amphiboles donne chlorite ou smectites et oxydes de fer. Elle résiste un peu mieux que la pyroxénite, car les amphiboles, hydratées, sont un cran plus stables.",
    },
    produits: { sable: 0, limon: 70, argile: 380, oxydes: 160, dissous: 390 },
    produitsNote: "≈ 380 g d'argiles (smectites, chlorite dégradée), 160 g d'oxydes de fer, 390 g d'ions : la roche fond sur place en un sol brun-rouille.",
    usages: "Sans usage notable.",
    wikipedia: "https://fr.wikipedia.org/wiki/Hornblendite",
    varietes: [{ nom: "Amphibololite", note: "terme général du lexique BRGM pour une roche faite presque entièrement d'amphibole ; la hornblendite en est le cas où cette amphibole est la hornblende." }, { nom: "Hornblendite à pyroxène", note: "le pyroxène, qui a cristallisé avant l'amphibole, en subsiste au cœur de ses cristaux." }],
  },
  {
    id: "syenite_nephelinique", nom: "Syénite foïdique (néphélinique)", categorie: "magmatique", sousType: "plutonique alcalin",
    swatch: "#c8bca0", densite: 2650,
    codes: [
      { code: "—", sens: " très rare en France : quelques pointements portés sur les cartes au 1/50 000 ; notation locale" },
    ],
    description: "Une syénite sous-saturée en silice : le quartz y est remplacé par de la néphéline (un feldspathoïde). Roche des complexes alcalins, souvent riche en minéraux rares (zirconium, terres rares). Rare en France.",
    mineralogie: "Feldspath alcalin et néphéline (feldspathoïde), aegyrine ou amphibole sodique, biotite ; le quartz est toujours absent.",
    mineraux: [["orthose", 45], ["nepheline", 30], ["aegyrine", 10], ["biotite", 8], ["titanite", 4], ["apatite", 3]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "La néphéline constitue le maillon faible : la kaolinite apparaît tôt et en grande quantité. Sous climat tropical (≥ 22 °C), ces roches donnent des bauxites et des kaolins renommés.",
    varietes: [
      { nom: "foyaïte", note: "Faciès à texture caractéristique, à feldspath alcalin en lattes." },
      { nom: "litchfieldite", note: "à néphéline et albite." },
      { nom: "miaskite", note: "syénite néphélinique moins riche en alcalins (sodium et potassium), par rapport à l'aluminium, que les syénites agpaïtiques (dite miaskitique) : zircon et titanite plutôt qu'eudialyte, biotite plutôt qu'aegyrine ; nommée d'après Miass, dans l'Oural." },
      { nom: "monzosyénite foïdique", note: "le plagioclase rejoint le feldspath alcalin (10 à 50 % des feldspaths), avec 10 à 60 % de foïdes ; à grain fin et en filon : micromonzosyénite foïdique." }
    ],
    alteration: {
      facilite: 3,
      // D.9.1 : vitesses nettes (mm/an), une par situation
      valeurs: [
        { v: 0.00183, cas: "bassin de l'Ariranha, massif alcalin de Poços de Caldas (Brésil : syénites néphéliniques, tinguaïtes et phonolites sur 70 % du bassin, 17 °C, saison sèche en hiver) : dissolution seule", src: "Mello 2019, cations et silice des eaux de 2016 corrigés de la pluie ÷ masse volumique de la roche, 1,83 m par million d'années" },
        { v: 0.00236, cas: "bassin de l'Amoras, même massif (1 760 mm de pluie en 2016) : dissolution seule", src: "Mello 2019, même méthode, 2,36 m par million d'années" },
        { v: 0.004, cas: "bassin de l'Amoras : front d'altération, la roche saine devient saprolite (épaisseur de roche convertie chaque année)", src: "Conceição et al. 2024, silice exportée par les eaux de 2016 ÷ silice perdue entre roche et saprolite, 4 ± 0,8 m par million d'années", ref: true }
      ],
      sources: [
        "Conceição F. T. da, Mello R. C. A. de, Fernandes A. M., Sardinha D. de S. (2024), « Chemical and Physical Denudation Rates in the Poços de Caldas Alkaline Massif, Minas Gerais State, Brazil », Minerals 14 (7) : 700",
        "Mello R. C. A. de (2019), « Balanço de denudação no planalto alcalino de Poços de Caldas (MG) », thèse de doctorat, Universidade Estadual Paulista, Rio Claro (section 6.7)"
      ],
      mecanisme: "La néphéline, sous-saturée en silice, s'hydrolyse vite et donne des zéolites puis des argiles ; les feldspaths alcalins suivent. La libération d'alcalins est importante.",
      climat: "Sur le massif alcalin de Poços de Caldas (Brésil, 17 °C, 1 900 mm de pluie, hiver sec), la syénite néphélinique et ses équivalents volcaniques se changent en saprolite à 0,4 mm en 100 ans ; les ruisseaux n'emportent en solution que l'équivalent de 0,2 mm de roche en 100 ans, et le sol est décapé à 0,3 mm en 100 ans : le profil d'altération reste à peu près de même épaisseur. Aucune mesure n'est publiée sur une syénite néphélinique d'Europe.",
    },
    produits: { sable: 80, limon: 90, argile: 470, oxydes: 60, dissous: 300 },
    produitsNote: "≈ 470 g d'argiles : la néphéline altérée a nourri les grands gisements de kaolin et de bauxite sur syénites néphéliniques (Arkansas, Los Islands), 300 g d'ions riches en sodium.",
    usages: "Source d'alumine et de minéraux rares (à l'étranger).",
    wikipedia: "https://fr.wikipedia.org/wiki/Sy%C3%A9nite_n%C3%A9ph%C3%A9linique",
    regions: [{ nom: "Massif des Khibiny (presqu'île de Kola, Russie)", lat: 67.7, lng: 33.7, etranger: true }],
    ages: [{ de: 385, a: 360, label: "Massif des Khibiny (Kola) : Dévonien, ≈ 380 à 360 Ma" }],
  },
  {
    id: "foidolite", nom: "Foïdolite", categorie: "magmatique", sousType: "plutonique alcalin",
    swatch: "#6a6a56", densite: 2950,
    codes: [
      { code: "—", sens: " absente des cartes métropolitaines ; notation locale (ex. ijolites des complexes alcalins africains et scandinaves)" },
    ],
    description: "Une roche plutonique très pauvre en silice, faite majoritairement de feldspathoïdes (surtout néphéline) au lieu de feldspaths. L'ijolite en est le type, associée aux carbonatites des complexes alcalins. Absente ou très rare en France.",
    mineralogie: "Feldspathoïdes (surtout néphéline) : plus de 60 % des minéraux clairs, sans feldspath ou presque ; clinopyroxène (aegyrine-augite) de 30 à 70 % dans l'ijolite ; parfois calcite, apatite et minéraux à terres rares. Pas de quartz.",
    mineraux: [["nepheline", 60], ["aegyrine", 15], ["pyroxenes", 10], ["biotite", 8], ["apatite", 4], ["titanite", 3]],
    argiles: ["kaolinite", "smectites"],
    argilesNote: "Les foïdes dominants s'effondrent en kaolinite ; l'aegyrine et les pyroxènes ajoutent des smectites sodiques.",
    varietes: [
      { nom: "urtite / melteigite", note: "pôles plus riches en néphéline ou en pyroxène." },
      { nom: "microfoïdolite", note: "foïdolite à grain fin, en filons." }
    ],
    alteration: {
      facilite: 4,
      mecanisme: "Très altérable : pauvres en silice, les feldspathoïdes s'hydrolysent rapidement en zéolites et argiles. Sur carbonatite, l'altération concentre le niobium et les terres rares dans des latérites.",
    },
    produits: { sable: 30, limon: 80, argile: 500, oxydes: 70, dissous: 320 },
    produitsNote: "≈ 500 g d'argiles : sous climat tropical (≥ 22 °C), les foïdolites s'altèrent en bauxites, la moitié de la roche finissant en gibbsite et kaolinite.",
    usages: "Minerai potentiel de niobium/terres rares (carbonatites associées).",
    wikipedia: "https://fr.wikipedia.org/wiki/Ijolite",
    regions: [{ nom: "Iivaara (Kuusamo, Finlande), localité type de l'ijolite", lat: 65.77, lng: 29.4, etranger: true }],
    ages: [{ de: 380, a: 360, label: "Province alcaline de Kola : Dévonien, ≈ 370 Ma" }],
  },
  {
    id: "charnockite", nom: "Charnockite", categorie: "magmatique", sousType: "plutonique (faciès granulite)",
    swatch: "#7a6a64", densite: 2750,
    codes: [
      { code: "—", sens: " pas de notation dédiée en métropole ; décrite au libellé dans les socles granulitiques" },
    ],
    description: "Un granite particulier, à orthopyroxène : il cristallise (ou recristallise) dans les conditions sèches et très chaudes du faciès granulite, en profondeur dans la croûte. Aspect sombre et graisseux. Rare en France (socle profond).",
    mineralogie: "Quartz + feldspath alcalin + plagioclase, avec orthopyroxène (hypersthène) caractéristique ± grenat.",
    mineraux: [["orthose", 35], ["quartz", 25], ["plagioclases", 20], ["enstatite", 12], ["grenat", 5], ["magnetite", 3]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Bilan granitique (kaolinite, illite) ; l'hypersthène, un orthopyroxène représenté ici par l'enstatite, rouille en fauve.",
    varietes: [
      { nom: "enderbite", note: "pôle à plagioclase presque seul : tonalite à orthopyroxène (charnockite « tonalitique »)." },
      { nom: "mangérite", note: "l'équivalent de la monzonite dans la série des charnockites : feldspaths potassique et plagioclase en parts voisines, orthopyroxène, presque pas de quartz." }
    ],
    alteration: {
      vmin: 0.001, vmax: 0.015, facilite: 2,
      // D.8.4 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.008, cas: "matière emportée en solution, profil de 10 m de saprolite sous forêt de montagne, hautes terres du Sri Lanka (2 013 mm de pluie, 16 °C)", src: "Hewawasam et al. 2013, 22 t/km² par an, masse volumique 2,75", calcul: "flux", ref: true },
        { v: 0.0153, cas: "même profil : abaissement de la surface, érosion comprise", src: "Hewawasam et al. 2013, béryllium 10, 42 t/km² par an, masse volumique 2,75", calcul: "flux" }
      ],
      sources: [
        "Hewawasam T., von Blanckenburg F., Bouchez J., Dixon J. L., Schuessler J. A., Maekeler R. (2013), « Slow advance of the weathering front during deep, supply-limited saprolite formation in the tropical Highlands of Sri Lanka », Geochimica et Cosmochimica Acta 118 : 202–230 (chiffres relus dans la thèse de R. Behrens, université de Potsdam, 2018, chapitre 1)"
      ],
      mecanisme: "Se comporte comme un granite (hydrolyse des feldspaths, quartz résiduel), l'orthopyroxène s'altérant en argiles + oxydes de fer.",
      climat: "Sous la forêt humide des hautes terres du Sri Lanka (2 013 mm de pluie, 16 °C), la charnockite ne perd en solution que l'équivalent de 0,8 mm de roche en 100 ans, et la surface s'abaisse de 1,5 mm en 100 ans, érosion comprise : un des rythmes les plus lents mesurés sous les tropiques. L'eau ne l'attaque qu'au bas de 10 m de saprolite argileux, où l'orthopyroxène s'oxyde le premier.",
    },
    produits: { sable: 300, limon: 60, argile: 380, oxydes: 50, dissous: 210 },
    produitsNote: "Bilan granitique : environ 300 g de sable quartzo-feldspathique et 380 g d'argiles ; l'hypersthène rouille et donne les teintes fauves caractéristiques des vieilles surfaces charnockitiques.",
    usages: "Pierre ornementale (« granit » sombre) à l'étranger.",
    wikipedia: "https://fr.wikipedia.org/wiki/Charnockite",
    regions: [{ nom: "Mont Saint-Thomas et Pallavaram, Chennai (Inde)", lat: 13.0, lng: 80.19, etranger: true }],
    ages: [{ de: 2560, a: 2500, label: "Charnockites de Chennai (Inde du Sud) : ≈ 2,5 milliards d'années" }],
  },
  {
    id: "gabbro", nom: "Gabbro", categorie: "magmatique", sousType: "plutonique basique",
    swatch: "#4a5258", densite: 2950,
    description: "Équivalent profond du basalte : magma basique refroidi lentement. Le gabbro du Chenaillet, près de Montgenèvre, est un morceau de plancher océanique alpin (ophiolite) posé sur les Alpes : on y marche sur un fond d'océan jurassique.",
    mineralogie: "Plagioclases calciques (45 à 60 %), pyroxènes (30 à 50 %), accompagnés parfois d'olivine, de magnétite et d'ilménite. Pas de quartz.",
    varietes: [
      { nom: "norite", note: "plagioclase et orthopyroxène : l'orthopyroxène y domine le clinopyroxène (classification IUGS)." },
      { nom: "anorthosite", note: "Presque uniquement constituée de plagioclase (plus de 90 %) : roche claire, plus légère que le gabbro faute de pyroxène." },
      { nom: "troctolite", note: "Riche en olivine, roche mouchetée de vert et de blanc (« pierre truite », d'après son aspect)." },
      { nom: "gabbronorite", note: "clinopyroxène et orthopyroxène en parts voisines : le gabbro des grands massifs lités." },
      { nom: "gabbro quartzifère / foïdifère / foïdique", note: "un peu de quartz (5 à 20 %, gabbro quartzifère) ou, à l'inverse, de néphéline (moins de 10 %, gabbro foïdifère ; 10 à 60 %, gabbro foïdique) ; jamais les deux ensemble." },
      { nom: "monzogabbro", note: "un peu de feldspath potassique (10 à 35 % des feldspaths) ; existe aussi en monzogabbro quartzifère, monzogabbro foïdifère ou monzogabbro foïdique (voir aussi la fiche essexite)." },
      { nom: "microgabbro, micronorite, microtroctolite, microanorthosite", note: "équivalents à grain fin (0,5 à 2 mm) du gabbro et de ses variétés (microgabbro quartzifère ou foïdifère, micromonzogabbro, micromonzogabbro quartzifère ou foïdifère), en filons ou en bordures refroidies ; le microgabbro est très proche de la dolérite (voir sa fiche)." },
      { nom: "métagabbro / métamonzogabbro", note: "gabbro recristallisé : selon la température et la pression, il devient amphibolite, schiste vert, schiste bleu ou éclogite ; dans les ophiolites alpines (Queyras, Corse), les métagabbros gardent souvent la forme des anciens pyroxènes, changés en amphibole verte." }
    ],
    regions: [
      { nom: "Massif du Chenaillet (Montgenèvre)", lat: 44.90, lng: 6.75 },
      { nom: "Saint-Quay-Portrieux (Côtes-d'Armor)", lat: 48.65, lng: -2.83 },
      { nom: "Gorges et Le Pallet (vignoble nantais)", lat: 47.10, lng: -1.30 },
    ],
    ages: [
      { de: 165, a: 161, label: "Chenaillet : troctolite vers 165 Ma, gabbro 161 Ma (zircon)" },
      { de: 590, a: 580, label: "Cadomien : intrusion de Saint-Quay-Portrieux" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.03, facilite: 3,
      // D.8.4 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00166, cas: "sous forêt, petits bassins français sur péridotites et gabbros (composition retenue par Meybeck pour ces roches) : dissolution seule", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,95", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "Hydrolyse des plagioclases et pyroxènes, plus rapide que celle du granite (minéraux formés à plus haute température = plus instables en surface, série de Goldich). Sans quartz, il ne produit pas de sable durable.",
      climat: "Sous forêt, les ruisseaux français qui drainent péridotites et gabbros emportent en solution l'équivalent de 0,17 mm de roche en 100 ans, à peine plus que sur un granite (0,11 mm) : l'eau y est surtout chargée de magnésium et de silice. Meybeck ne sépare pas le gabbro de la péridotite. Comme pour le granite, la roche se défait en arène argileuse plus vite qu'elle ne se dissout ; aucune mesure de ce front n'est publiée en France.",
    },
    produits: { sable: 10, limon: 60, argile: 440, oxydes: 120, dissous: 370 },
    produitsNote: "Beaucoup d'argiles et d'oxydes de fer, pas de sable quartzeux : les sols sur gabbro sont bruns-rouges, argileux et fertiles.",
    usages: "Granulats très résistants (ballast), pierres ornementales (« granit noir »).",
    wikipedia: "https://fr.wikipedia.org/wiki/Gabbro",
  },
  {
    id: "basalte", nom: "Basalte", categorie: "magmatique", sousType: "volcanique basique",
    swatch: "#45484f", densite: 2900,
    description: "Lave fluide des volcans du Massif central, figée en coulées, plateaux (planèzes, Aubrac) et orgues prismées. Son volcanisme court de l'Oligocène jusqu'à il y a 6 900 ans seulement (lac Pavin) : la chaîne des Puys n'est qu'endormie.",
    mineralogie: "Plagioclases, pyroxènes, olivine, magnétite ; verre volcanique. Pas de quartz.",
    varietes: [
      { nom: "basalte en orgues (prismé)", note: "refroidissement lent : la coulée se débite en colonnes, le plus souvent à cinq ou six pans (orgues d'Espaly, au Puy-en-Velay)." },
      { nom: "basalte à olivine", note: "la variété la plus courante du Massif central, riche en olivine visible à l'œil nu." },
      { nom: "hyaloclastite", note: "basalte fragmenté au contact de l'eau ou de la glace, en brèches vitreuses. Nom du lexique BRGM : roche hyaloclastique." },
      { nom: "métabasalte", note: "basalte recristallisé : sur le fond océanique, l'eau de mer chaude en fait une spilite ; enfoui et réchauffé, il devient schiste vert (chlorite, albite, épidote) puis amphibolite ; enfoui vite et à froid dans une subduction, schiste bleu (voir ces fiches)." }
    ],
    regions: [
      { nom: "Chaîne des Puys", lat: 45.79, lng: 2.96 },
      { nom: "Plateau de l'Aubrac", lat: 44.65, lng: 3.00 },
      { nom: "Coirons (Ardèche)", lat: 44.62, lng: 4.55 },
      { nom: "Escandorgue (Hérault)", lat: 43.72, lng: 3.30 },
      { nom: "Orgues d'Espaly (Le Puy-en-Velay)", lat: 45.05, lng: 3.86 },
    ],
    ages: [{ de: 25, a: 0.007, label: "Volcanisme cénozoïque du Massif central (dernière éruption : Pavin, ~6 900 ans)" }],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 3,
      // D.8.5 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00194, cas: "sous forêt, petits ruisseaux français sur basalte (26 analyses, Massif central surtout) : dissolution seule", src: "Meybeck 1986, tableau 11 : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,9", calcul: "ruisseaux" },
        { v: 0.00438, cas: "petit bassin basaltique du Massif central, 406 mm d'écoulement par an, 8,7 °C : dissolution seule", src: "Dessert et al. 2003, tableau 1 (d'après Négrel et Deschamps 1996) : 12,7 t/km² par an ÷ 2,9", calcul: "flux", ref: true },
        { v: 0.0199, cas: "basaltes du sud-ouest de l'Islande, 2 432 mm d'écoulement par an, 2 °C : dissolution seule", src: "Dessert et al. 2003, tableau 1 (d'après Gislason et al. 1996) : 57,6 t/km² par an ÷ 2,9", calcul: "flux" },
        { v: 0.0366, cas: "La Réunion, 2 433 mm d'écoulement par an, 17 °C : dissolution seule", src: "Dessert et al. 2003, tableau 1 (d'après Louvat 1997) : 106 t/km² par an ÷ 2,9", calcul: "flux" },
        { v: 0.118, cas: "Java, 4 052 mm d'écoulement par an, 25 °C : dissolution seule.", src: "Dessert et al. 2003, tableau 1 : 342 t/km² par an ÷ 2,9", calcul: "flux" }
      ],
      sources: [
        "Dessert C., Dupré B., Gaillardet J., François L. M. et Allègre C. J. (2003), « Basalt weathering laws and the impact of basalt weathering on the global carbon cycle », Chemical Geology 202 : 257–273 (tableau 1 : flux d'altération chimique des bassins basaltiques, d'après Négrel et Deschamps 1996 pour le Massif central, Gislason et al. 1996 pour l'Islande, Louvat 1997 pour La Réunion)",
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "L'olivine et le verre volcanique cèdent les premiers (hydrolyse), puis pyroxènes et plagioclases se transforment en smectites et en oxydes de fer. La roche s'altère chimiquement plus vite que le granite, ce qui fait de l'altération des basaltes un puits de CO₂ notable à l'échelle géologique.",
      climat: "Sur basalte, la vitesse suit d'abord l'eau qui passe, puis la chaleur. Dans un petit bassin du Massif central (406 mm d'écoulement par an, 8,7 °C), l'eau emporte en solution l'équivalent de 0,44 mm de roche en 100 ans ; dans les ruisseaux forestiers français, calculé au même écoulement que pour le granite, 0,19 mm, contre 0,11 mm sur granite. Avec six fois plus d'eau, en Islande (2 °C), on passe à 2 mm ; à La Réunion (17 °C, même écoulement), à 3,7 mm ; à Java (25 °C, 4 000 mm d'eau), à 12 mm. Les sols sur basalte (andosols puis sols bruns) comptent parmi les plus fertiles de France : l'herbe de l'Aubrac et les lentilles du Puy en profitent.",
    },
    produits: { sable: 0, limon: 40, argile: 450, oxydes: 130, dissous: 380 },
    produitsNote: "Aucun sable quartzeux, faute de quartz : 1 kg de basalte donne environ 450 g d'argiles (smectites), 130 g d'oxydes de fer (terres rouges) et 380 g d'ions, dont le calcium et le magnésium, qui consomment du CO₂ atmosphérique.",
    usages: "Granulats, ballast, laine de roche, pierre du bâti auvergnat (Saint-Flour).",
    wikipedia: "https://fr.wikipedia.org/wiki/Basalte",
  },
  {
    id: "trachyandesite", nom: "Trachyandésite", categorie: "magmatique", sousType: "volcanique intermédiaire",
    swatch: "#6f6a70", densite: 2700,
    description: "Lave intermédiaire des grands stratovolcans du Cantal (le plus vaste volcan d'Europe) et du Mont-Dore. Débitée en brèches et coulées, elle arme les crêtes du puy Mary. La pierre de Volvic, qui a bâti Clermont-Ferrand et sa cathédrale, est une trachyandésite de la chaîne des Puys.",
    mineralogie: "Plagioclases, sanidine, amphiboles, pyroxènes, ± biotite. Peu ou pas de quartz.",
    varietes: [
      { nom: "trachyandésite à hornblende", note: "la variété la plus riche en amphibole, typique du Cantal." },
      { nom: "benmoréite", note: "variété sodique riche en anorthose, terme du lexique BRGM peu utilisé sur le terrain." },
    ],
    regions: [
      { nom: "Puy Mary : Cantal", lat: 45.11, lng: 2.68 },
      { nom: "Massif du Sancy (Mont-Dore)", lat: 45.53, lng: 2.81 },
      { nom: "Volvic (coulée du puy de la Nugère)", lat: 45.87, lng: 3.03 },
    ],
    ages: [
      { de: 13, a: 0.25, label: "Stratovolcans du Cantal (13 à 2 Ma) et du Mont-Dore (3 à 0,25 Ma)" },
      { de: 0.095, a: 0.01, label: "Chaîne des Puys : mugéarites et benmoréites (puy de la Nugère, pierre de Volvic)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.03, facilite: 3,
      // D.8.5 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00158, cas: "sous forêt, petits ruisseaux français sur trachyandésites et andésites (Cantal, Mont-Dore, Morvan ; 16 analyses) : dissolution seule", src: "Meybeck 1986, tableau 11 : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,7", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "Hydrolyse des feldspaths et minéraux ferromagnésiens ; les brèches volcaniques, poreuses et hétérogènes, s'altèrent plus vite que les coulées massives et nourrissent de grands glissements de terrain (vallées du Cantal).",
      climat: "Dans les ruisseaux forestiers du Cantal, du Mont-Dore et du Morvan, l'eau emporte en solution l'équivalent de 0,16 mm de roche en 100 ans : à peine plus que sur granite (0,11 mm), moins que sur basalte (0,19 mm). Leur eau est moins chargée que celle des basaltes, riche en sodium et en potassium venus des feldspaths (Meybeck 1986). Les coulées s'emboulent et brunissent ; sur les projections associées, des andosols se forment en quelques siècles. Aucune mesure du front d'altération n'est publiée.",
    },
    produits: { sable: 50, limon: 100, argile: 430, oxydes: 90, dissous: 330 },
    produitsNote: "Profil proche du basalte ; donne des sols bruns andiques réputés pour les estives.",
    usages: "Pierre de taille : la pierre de Volvic (coulées du puy de la Nugère), qui a bâti Clermont-Ferrand et sa cathédrale ; granulats, lauzes.",
    wikipedia: "https://fr.wikipedia.org/wiki/Trachyand%C3%A9site",
  },
  {
    id: "trachyte", nom: "Trachyte", categorie: "magmatique", sousType: "volcanique différenciée",
    swatch: "#b9b3ab", densite: 2550,
    description: "Lave visqueuse, claire et riche en feldspaths, qui forme des dômes : le puy de Dôme (11 000 ans) en est l'archétype mondial.",
    mineralogie: "Sanidine dominante, plagioclases, ± amphiboles, biotite ; peu de quartz.",
    varietes: [
      { nom: "trachyte phonolitique", note: "transition vers la phonolite, plus riche en feldspathoïdes (rare en France)." },
      { nom: "trachydacite", note: "variété plus siliceuse, à la limite de la dacite." },
      { nom: "métatrachyte", note: "trachyte recristallisé par le métamorphisme." }
    ],
    regions: [
      { nom: "Puy de Dôme", lat: 45.772, lng: 2.965 },
      { nom: "Roche Tuilière (Monts-Dore)", lat: 45.62, lng: 2.75 },
    ],
    ages: [{ de: 3, a: 0.011, label: "Mont-Dore, puis chaîne des Puys (puy de Dôme ≈ 11 000 ans)" }],
    alteration: {
      facilite: 2,
      mecanisme: "L'hydrolyse de la sanidine donne des argiles et libère K⁺ ; la roche, souvent poreuse (associée aux ponces), est pauvre en minéraux fragiles (peu d'olivine et de pyroxène) et s'altère donc plus lentement que le basalte.",
    },
    produits: { sable: 150, limon: 100, argile: 400, oxydes: 50, dissous: 300 },
    produitsNote: "Les feldspaths finissent en kaolinite et en illite.",
    usages: "Pierre légère et facile à tailler : sarcophages mérovingiens taillés dans les trachytes du Massif central ; dalles et lauzes (roche Tuilière).",
    wikipedia: "https://fr.wikipedia.org/wiki/Trachyte",
  },
  {
    id: "rhyolite", nom: "Rhyolite", categorie: "magmatique", sousType: "volcanique acide",
    swatch: "#c56d5a", densite: 2500,
    description: "Équivalent volcanique du granite : lave très visqueuse, souvent expulsée en ignimbrites incandescentes. Les rhyolites rouges permiennes font le massif de l'Estérel et les orgues de la réserve de Scandola en Corse.",
    mineralogie: "Quartz, feldspaths alcalins, ± biotite ; matrice vitreuse ou microcristalline.",
    varietes: [
      { nom: "rhyolite fluidale (rubanée)", note: "rubans d'écoulement figés dans la lave visqueuse, bien visibles dans les rhyolites rouges de l'Estérel." },
      { nom: "porphyre rhyolitique", note: "phénocristaux de quartz et feldspath dans une pâte fine : les « porphyres » rouges de l'Estérel." },
      { nom: "métarhyolite", note: "rhyolite recristallisée, souvent schisteuse ; les « porphyroïdes » des Ardennes et du Massif armoricain en sont." }
    ],
    regions: [
      { nom: "Massif de l'Estérel", lat: 43.47, lng: 6.87 },
      { nom: "Scandola (Corse)", lat: 42.37, lng: 8.55 },
    ],
    ages: [{ de: 295, a: 250, label: "Permien : volcanisme fini-hercynien (Estérel, Corse)" }],
    alteration: {
      vmin: 0.001, vmax: 0.01, facilite: 2,
      // D.8.5 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00234, cas: "sous forêt, petits ruisseaux sur rhyolite (Corse, Beaujolais ; 4 analyses seulement) : dissolution seule", src: "Meybeck 1986, tableau 11 : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,5", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "Comme le granite : l'eau hydrolyse les feldspaths et laisse le quartz intact. La matrice microcristalline offre peu de chemins à l'eau : plus dure que les grès qui l'entourent, la rhyolite est dégagée par l'érosion en reliefs.",
      climat: "Dans quatre ruisseaux forestiers de Corse et du Beaujolais, l'eau emporte en solution l'équivalent de 0,23 mm de rhyolite en 100 ans, deux fois plus que sur granite (0,11 mm) : leur eau est riche en calcium. Meybeck (1986) prévient que les rhyolites sont mal représentées (trop près de la mer en Corse et dans l'Estérel, eaux polluées dans les Vosges du Nord) : c'est un ordre de grandeur. La patine rousse des porphyres de l'Estérel protège un cœur sain : plus dure que les grès voisins, la rhyolite forme les reliefs ruiniformes rouges.",
    },
    produits: { sable: 250, limon: 60, argile: 400, oxydes: 30, dissous: 260 },
    produitsNote: "Bilan granitique : sable quartzeux + kaolinite. La couleur rouge vient d'hématite déjà présente dans la roche (oxydation permienne), pas de son altération actuelle.",
    usages: "Granulats, pierre locale.",
    wikipedia: "https://fr.wikipedia.org/wiki/Rhyolite",
  },
  {
    id: "andesite", nom: "Andésite", categorie: "magmatique", sousType: "volcanique intermédiaire",
    swatch: "#7a6a5a", densite: 2650,
    codes: [
      { code: "α", sens: " : andésites (ex. α des stratovolcans du Cantal et du Mont-Dore)" },
    ],
    description: "La lave grise des stratovolcans, intermédiaire entre le basalte et la rhyolite. Nommée d'après les Andes, c'est la lave des volcans de subduction : en France, la montagne Pelée (Martinique) et la Soufrière de Guadeloupe. Les « andésites » des anciennes cartes du Cantal (13 à 2 Ma) et du Mont-Dore (3 à 0,25 Ma) sont surtout des trachyandésites.",
    mineralogie: "Plagioclase (andésine) en phénocristaux, pyroxène et/ou amphibole, ± biotite, dans une pâte microlitique. Peu ou pas de quartz.",
    mineraux: [["plagioclases", 55], ["pyroxenes", 20], ["hornblende", 12], ["verre", 8], ["magnetite", 5]],
    argiles: ["smectites", "interstratifies"],
    argilesNote: "Plagioclases calciques, pyroxènes et verre : smectites dominantes, halloysite et allophanes dans les andosols jeunes.",
    regions: [
      { nom: "Stratovolcan du Cantal", lat: 45.05, lng: 2.74 },
      { nom: "Massif du Mont-Dore", lat: 45.57, lng: 2.81 },
    ],
    ages: [
      { de: 13, a: 2, label: "Cantal : « andésites » des anciennes cartes (Miocène à Pliocène)" },
      { de: 3, a: 0.25, label: "Mont-Dore (Pliocène à Pléistocène)" },
      { de: 0.3, a: 0, label: "Montagne Pelée (Martinique), active depuis ≈ 300 000 ans : éruptions de 1902 et de 1929" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.04, facilite: 3,
      // D.8.5 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00161, cas: "sous forêt, petits ruisseaux français sur trachyandésites et andésites (Cantal, Mont-Dore, Morvan ; 16 analyses) : dissolution seule", src: "Meybeck 1986, tableau 11 : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,65", calcul: "ruisseaux" },
        { v: 0.0151, cas: "nord de la Basse-Terre (Guadeloupe), relief bas et rivières les moins arrosées : dissolution seule", src: "Gaillardet et al. 2011 : 40 t/km² par an (silice et cations) ÷ 2,65", calcul: "flux" },
        { v: 0.0358, cas: "grandes rivières de Guadeloupe et de Martinique, climat tropical humide : dissolution seule (médiane)", src: "Gaillardet et al. 2011 : 95 t/km² par an (silice et cations) ÷ 2,65", calcul: "flux", ref: true },
        { v: 0.1, cas: "Guadeloupe : avancée du front d'altération dans la roche saine, sous des sols et altérites épais", src: "Gaillardet et al. 2011, 100 mm par millénaire en moyenne (déduit des cations des rivières)" },
        { v: 0.162, cas: "rivières qui drainent le volcan actif de la Soufrière (Guadeloupe), jusqu'à 5 000 mm d'eau par an : dissolution seule", src: "Gaillardet et al. 2011 : 430 t/km² par an (silice et cations, apports hydrothermaux non comptés) ÷ 2,65", calcul: "flux" }
      ],
      sources: [
        "Gaillardet J., Rad S., Rivé K., Louvat P., Gorge C., Allègre C. J. et Lajeunesse E. (2011), « Orography-driven chemical denudation in the Lesser Antilles: evidence for a new feed-back mechanism stabilizing atmospheric CO₂ », American Journal of Science 311 : 851–894, doi 10.2475/10.2011.02",
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "L'hydrolyse des plagioclases et des ferromagnésiens, ainsi que la dévitrification de la pâte, produisent des smectites et des oxydes de fer ; la roche s'altère un peu plus vite que le granite.",
      climat: "Tout dépend de l'eau. Dans les ruisseaux forestiers du Cantal, du Mont-Dore et du Morvan, l'eau emporte en solution l'équivalent de 0,16 mm de roche en 100 ans. Aux Antilles françaises, sous climat tropical et sur des volcans qui arrêtent les nuages, les grandes rivières en emportent 3,6 mm (médiane), de 1,5 mm au nord de la Basse-Terre à 16 mm sur les flancs de la Soufrière ; le front d'altération y descend dans la roche saine d'environ 10 mm en 100 ans. Sur les jeunes édifices, les projections associées donnent des andosols en quelques siècles.",
    },
    produits: { sable: 60, limon: 100, argile: 440, oxydes: 90, dissous: 310 },
    produitsNote: "≈ 440 g d'argiles (smectites, halloysite dans les faciès jeunes), 90 g d'oxydes de fer, 310 g d'ions : le bilan type d'une lave intermédiaire.",
    usages: "Granulats, empierrement.",
    wikipedia: "https://fr.wikipedia.org/wiki/And%C3%A9site",
    varietes: [{ nom: "Andésite basaltique", note: "Roche contenant de 52 à 57 % de silice, située entre le basalte et l'andésite." }, { nom: "Boninite", note: "andésite très riche en magnésium, émise aux tout débuts d'une subduction (îles Bonin, Japon)." }, { nom: "Métaandésite", note: "andésite transformée par le métamorphisme." }],
  },
  {
    id: "dacite", nom: "Dacite", categorie: "magmatique", sousType: "volcanique acide",
    swatch: "#a89888", densite: 2550,
    codes: [
      { code: "Td", sens: " : notation variable selon les feuilles volcaniques (par exemple « Td » pour les dacites, feuille Vic-sur-Cère)" },
    ],
    description: "Une lave claire et visqueuse, entre l'andésite et la rhyolite : elle bâtit des dômes et des aiguilles, comme celui du mont Saint Helens (États-Unis) après l'éruption de 1980. En France, les dacites sont surtout anciennes : volcanisme de la fin de la chaîne varisque en Corse et dans des complexes du Stéphanien et du Permien ; quelques laves du Cantal sont notées « Td ».",
    mineralogie: "Plagioclase + quartz, amphibole et/ou biotite, dans une pâte vitreuse à microlitique.",
    mineraux: [["plagioclases", 45], ["quartz", 20], ["verre", 15], ["hornblende", 10], ["biotite", 7], ["magnetite", 3]],
    argiles: ["smectites", "kaolinite", "illite"],
    argilesNote: "Entre andésite et rhyolite : smectites du verre et des plagioclases, kaolinite-illite des faciès les plus acides.",
    regions: [
      { nom: "Mont Saint Helens (Washington, États-Unis)", lat: 46.20, lng: -122.19, etranger: true },
    ],
    ages: [
      { de: 305, a: 270, label: "France : volcanisme de la fin de la chaîne varisque (Stéphanien et Permien, Corse)" },
      { de: 0.275, a: 0, label: "Mont Saint Helens, actif depuis ≈ 275 000 ans ; dôme de 1980 à 1986" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Comme l'andésite, mais plus lente, car plus siliceuse et plus riche en verre : dévitrification et hydrolyse donnent argiles et oxydes.",
    },
    produits: { sable: 180, limon: 90, argile: 400, oxydes: 60, dissous: 270 },
    produitsNote: "≈ 400 g d'argiles, 180 g de sable (quartz et feldspaths frais), 270 g d'ions : un bilan entre celui de la rhyolite et celui de l'andésite, comme sa chimie.",
    usages: "Granulats, pierre.",
    wikipedia: "https://fr.wikipedia.org/wiki/Dacite",
    varietes: [{ nom: "Rhyodacite", note: "terme ancien pour les laves entre dacite et rhyolite." }, { nom: "Métadacite", note: "dacite transformée par le métamorphisme." }],
  },
  {
    id: "phonolite", nom: "Phonolite", categorie: "magmatique", sousType: "volcanique alcalin différencié",
    swatch: "#8a9088", densite: 2550,
    codes: [
      { code: "φ", sens: " : phonolites (Velay, Cantal ; notation selon feuilles, parfois regroupée avec les trachytes τ)" },
    ],
    description: "La « pierre qui sonne » : une lave alcaline claire, litée, qui résonne d'un son clair quand on la frappe. Elle forme les aiguilles et les sucs emblématiques du Velay et du Massif central : le mont Gerbier-de-Jonc, les sucs du Meygal, la roche Sanadoire et les orgues de Bort en sont faits.",
    mineralogie: "Feldspath alcalin (sanidine) + néphéline (feldspathoïde), aegyrine/amphibole sodique. Pauvre en silice, jamais de quartz.",
    mineraux: [["sanidine", 55], ["nepheline", 20], ["aegyrine", 12], ["hauyne", 5], ["titanite", 4], ["verre", 4]],
    argiles: ["kaolinite", "illite", "smectites"],
    argilesNote: "Néphéline et haüyne cèdent d'abord (kaolinite), la sanidine suit (illite) : c'est la patine ocre des orgues phonolitiques.",
    varietes: [
      { nom: "téphriphonolite", note: "phonolite plus basique, vers la téphrite. Nom du lexique BRGM : phonolite téphritique." },
    ],
    regions: [
      { nom: "Orgues de Bort-les-Orgues (Corrèze)", lat: 45.40, lng: 2.49 },
      { nom: "Mont Gerbier-de-Jonc (Ardèche)", lat: 44.84, lng: 4.22 },
      { nom: "Puy Griou (Cantal)", lat: 45.080, lng: 2.706 },
      { nom: "Roche Sanadoire (Monts-Dore)", lat: 45.61, lng: 2.76 },
    ],
    ages: [{ de: 13, a: 2, label: "Volcanisme alcalin du Velay et du Cantal (Miocène-Pliocène)" }],
    alteration: {
      facilite: 3,
      // D.9.2 : vitesses nettes (mm/an), une par situation
      valeurs: [
        { v: 0.00183, cas: "bassin de l'Ariranha, massif alcalin de Poços de Caldas (Brésil : phonolites, tinguaïtes et syénites néphéliniques, de même composition, sur 70 % du bassin, 17 °C, saison sèche en hiver) : dissolution seule", src: "Mello 2019, cations et silice des eaux de 2016 corrigés de la pluie ÷ masse volumique de la roche, 1,83 m par million d'années" },
        { v: 0.00236, cas: "bassin de l'Amoras, même massif (1 760 mm de pluie en 2016) : dissolution seule", src: "Mello 2019, même méthode, 2,36 m par million d'années" },
        { v: 0.004, cas: "bassin de l'Amoras : front d'altération, la roche saine devient saprolite (épaisseur de roche convertie chaque année)", src: "Conceição et al. 2024, silice exportée par les eaux de 2016 ÷ silice perdue entre roche et saprolite, 4 ± 0,8 m par million d'années", ref: true }
      ],
      sources: [
        "Conceição F. T. da, Mello R. C. A. de, Fernandes A. M., Sardinha D. de S. (2024), « Chemical and Physical Denudation Rates in the Poços de Caldas Alkaline Massif, Minas Gerais State, Brazil », Minerals 14 (7) : 700",
        "Mello R. C. A. de (2019), « Balanço de denudação no planalto alcalino de Poços de Caldas (MG) », thèse de doctorat, Universidade Estadual Paulista, Rio Claro (section 6.7)"
      ],
      mecanisme: "La néphéline s'hydrolyse vite (roche sous-saturée) en zéolites puis en argiles ; la roche se débite en dalles (lauzes) exploitées en toiture.",
      climat: "Sur le massif alcalin de Poços de Caldas (Brésil, 17 °C, 1 900 mm de pluie, hiver sec), les ruisseaux drainent ensemble des phonolites et des syénites néphéliniques de même composition : la roche s'y change en saprolite à 0,4 mm en 100 ans, et les eaux n'emportent en solution que l'équivalent de 0,2 mm de roche en 100 ans. La mesure ne distingue pas la lave de son équivalent profond : ce sont les mêmes chiffres que pour la syénite néphélinique. Aucune mesure n'est publiée sur les phonolites du Velay ou du Cantal.",
    },
    produits: { sable: 90, limon: 100, argile: 450, oxydes: 60, dissous: 300 },
    produitsNote: "≈ 450 g d'argiles (la néphéline et les zéolites cèdent les premières), 300 g d'ions sodiques et potassiques : l'eau des sources phonolitiques est douce et alcaline.",
    usages: "Lauzes de toiture (dalles), granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Phonolite",
  },
  {
    id: "basanite", nom: "Basanite & téphrite", categorie: "magmatique", sousType: "volcanique alcalin sous-saturé",
    swatch: "#3a3a34", densite: 2900,
    codes: [
      { code: "β", sens: " : avec les basaltes ; « labradorites basanitiques » précisées au libellé (ex. feuille Vic-sur-Cère)" },
    ],
    description: "Les laves alcalines sombres et sous-saturées en silice de l'Auvergne : des basaltes à feldspathoïdes, encore plus pauvres en silice que le basalte ordinaire. Le plateau du Devès et les planèzes du Cantal en sont pavés ; on en trouve aussi dans la chaîne des Puys, à côté des basaltes et des trachybasaltes.",
    mineralogie: "Plagioclase + pyroxène + olivine, avec un feldspathoïde (néphéline, leucite). La basanite garde de l'olivine, la téphrite non.",
    mineraux: [["plagioclases", 35], ["pyroxenes", 25], ["olivine", 15], ["nepheline", 12], ["magnetite", 8], ["verre", 5]],
    argiles: ["smectites"],
    argilesNote: "La machine à smectites basaltique, dopée à la néphéline : des sols bruns andiques très fertiles.",
    varietes: [
      { nom: "téphrite", note: "sans olivine essentielle." },
      { nom: "néphélinite", note: "à néphéline dominante, sans feldspath." },
      { nom: "leucitite", note: "à leucite, laves ultra-potassiques." },
      { nom: "mélilitite", note: "très sous-saturée, à mélilite (rare en France)." },
      { nom: "téphrite phonolitique", note: "téphrite riche en feldspath alcalin et en foïdes, vers la phonolite (appelée phonotéphrite dans le diagramme TAS)." },
      { nom: "ougandite", note: "lave ultrapotassique du rift ougandais (Toro-Ankole), très riche en olivine et en pyroxène, à leucite dans la pâte ; ses voisines à kalsilite, un feldspathoïde potassique, sont les mafurites." }
    ],
    regions: [
      { nom: "Plateau du Devès (Velay)", lat: 45.00, lng: 3.72 },
      { nom: "Planèze de Saint-Flour (Cantal)", lat: 45.05, lng: 2.95 },
      { nom: "Chaîne des Puys", lat: 45.79, lng: 2.96 },
    ],
    ages: [{ de: 15, a: 0.007, label: "Volcanisme alcalin du Massif central (jusqu'au Pavin)" }],
    alteration: {
      facilite: 4,
      // D.9.2 : vitesses nettes (mm/an), une par situation
      valeurs: [
        { v: 0.05, cas: "coulées historiques du mont Cameroun (surtout des basanites, avec des hawaiites), sources et rivières tout autour du volcan, forêt tropicale, 1,8 à 12 m de pluie par an : altération chimique seule", src: "Benedetti et al. 2003, rapport eau–roche tiré des isotopes du strontium des eaux, moyenne de 5 × 10⁻⁵ m par an", ref: true }
      ],
      sources: [
        "Benedetti M. F., Dia A., Riotte J., Chabaux F., Gérard M., Boulègue J., Fritz B., Chauvel C., Bulourde M., Déruelle B., Ildefonse P. (2003), « Chemical weathering of basaltic lava flows undergoing extreme climatic conditions : the water geochemistry record », Chemical Geology 201 (1–2) : 1–17 (résumé lu ; texte intégral de HAL non accessible)",
        "Wikipédia (en), « Mount Cameroon » : laves surtout basanitiques et hawaiitiques"
      ],
      mecanisme: "L'olivine et les feldspathoïdes cèdent les premiers (haut de la série de Goldich) et donnent des smectites et des oxydes de fer ; ces sols basaltiques bruns sont fertiles.",
      climat: "Sur le mont Cameroun (forêt tropicale, 1,8 à 12 m de pluie par an), les coulées récentes, surtout des basanites, perdent en moyenne 5 mm de roche en 100 ans par altération chimique ; d'une source à l'autre, de 0,1 à 2 mm en 100 ans en altitude et de 0,1 à 10 mm au bas des pentes, où la forêt et la pluie accélèrent l'attaque. Aucune mesure n'est publiée sur les basanites du Massif central, sous un climat bien plus sec et plus froid.",
    },
    produits: { sable: 0, limon: 40, argile: 460, oxydes: 130, dissous: 370 },
    produitsNote: "Environ 460 g de smectites, 130 g d'oxydes de fer et 370 g d'ions : la production de smectites du basalte, avec un supplément de sodium apporté par la néphéline.",
    usages: "Granulats, pouzzolane associée.",
    wikipedia: "https://fr.wikipedia.org/wiki/Basanite",
  },
  {
    id: "latite", nom: "Latite", categorie: "magmatique", sousType: "volcanique intermédiaire alcalin",
    swatch: "#8a7a68", densite: 2600,
    codes: [
      { code: "τα", sens: " : avec les trachyandésites ; la distinction géochimique se fait en notice" },
    ],
    description: "Équivalent volcanique de la monzonite : une lave intermédiaire où feldspath potassique et plagioclase sont en proportions voisines, avec peu de quartz. C'est la variété potassique de la trachyandésite (séries riches en potassium, dites shoshonitiques).",
    mineralogie: "Feldspath alcalin en quantité voisine de celle du plagioclase, pyroxène, amphibole ou biotite, quartz rare, dans une pâte fine.",
    mineraux: [["plagioclases", 40], ["sanidine", 25], ["pyroxenes", 15], ["biotite", 10], ["verre", 6], ["magnetite", 4]],
    argiles: ["smectites", "illite"],
    argilesNote: "Smectites des plagioclases et pyroxènes, illite de la sanidine potassique.",
    regions: [
      { nom: "Vosges du Sud (série de Thann-Giromagny)", lat: 47.80, lng: 6.98 },
      { nom: "Stratovolcan du Cantal", lat: 45.10, lng: 2.72 },
    ],
    ages: [
      { de: 340, a: 331, label: "Vosges du Sud : latites du Viséen supérieur (série de Thann-Giromagny)" },
      { de: 13, a: 2, label: "Stratovolcan du Cantal" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "L'hydrolyse des feldspaths et la dévitrification donnent des argiles, des oxydes de fer et des alcalins.",
    },
    produits: { sable: 70, limon: 100, argile: 430, oxydes: 80, dissous: 320 },
    produitsNote: "Environ 430 g d'argiles (smectites et illite issue de la sanidine), 80 g d'oxydes et 320 g d'ions : bilan d'une lave intermédiaire potassique.",
    usages: "Granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Latite",
    varietes: [{ nom: "Trachyandésite potassique", note: "nom donné par le diagramme TAS : une trachyandésite est une latite quand K₂O dépasse Na₂O − 2 (en % pondéraux) ; sinon, c'est une benmoréite." }, { nom: "Quartz-latite", note: "ancien nom de laves proches de la dacite, riches en potassium." }],
  },
  {
    id: "picrite", nom: "Picrite", categorie: "magmatique", sousType: "volcanique ultrabasique",
    swatch: "#3a3a30", densite: 3000,
    codes: [
      { code: "β", sens: " : ankaramites et picrites notées avec les basaltes, précisées au libellé (ex. Cantal)" },
    ],
    description: "Un basalte exceptionnellement riche en olivine (un « basalte magnésien », à plus de 12 % de magnésie) : une lave très chaude et fluide, soit un liquide « primitif », peu changé depuis sa sortie du manteau, soit un basalte chargé de cristaux d'olivine accumulés (océanites). Rare en France.",
    mineralogie: "Olivine abondante (> 15 %) + pyroxène, dans une pâte basaltique. Très pauvre en silice.",
    mineraux: [["olivine", 45], ["pyroxenes", 35], ["plagioclases", 10], ["magnetite", 7], ["verre", 3]],
    argiles: ["smectites", "chlorite"],
    argilesNote: "L'olivine massive part en smectites magnésiennes et en goethite, et le profil brunit très vite.",
    alteration: {
      facilite: 4,
      mecanisme: "L'olivine, tout en haut de la série de Goldich, s'altère très vite → smectites magnésiennes + oxydes de fer ; consomme du CO₂.",
    },
    produits: { sable: 0, limon: 50, argile: 320, oxydes: 190, dissous: 440 },
    produitsNote: "≈ 440 g d'ions (Mg, Fe, Si), soit près de la moitié de la roche qui part en solution, 320 g de smectites magnésiennes, 190 g d'oxydes de fer.",
    usages: "Sans usage notable.",
    wikipedia: "https://fr.wikipedia.org/wiki/Picrite",
    regions: [{ nom: "Piton de la Fournaise (La Réunion) : océanites", lat: -21.24, lng: 55.71 }],
    varietes: [{ nom: "Picrobasalte", note: "nom du diagramme TAS : 41 à 45 % de silice, moins de 3 % d'alcalins." }, { nom: "Océanite", note: "basalte chargé de plus de 20 % de cristaux d'olivine (Piton de la Fournaise)." }, { nom: "Meimechite", note: "picrite extrêmement riche en magnésium et en titane (Sibérie)." }],
    ages: [{ de: 0.53, a: 0, label: "Piton de la Fournaise, actif depuis ≈ 530 000 ans (dont l'éruption d'avril 2007)" }],
  },
  {
    id: "spilite", nom: "Spilite", categorie: "metamorphique", sousType: "métasomatique (basalte spilitisé)",
    swatch: "#5a6a5a", densite: 2850,
    codes: [
      { code: "β", sens: " : spilites notées avec les roches vertes (ex. spilites permo-triasiques du Pelvoux, βs selon feuilles)" },
    ],
    description: "Un basalte sous-marin transformé par l'eau de mer chaude : ses plagioclases calciques sont devenus de l'albite sodique, et il a verdi (chlorite, épidote). Fréquent dans les vieilles séries volcaniques françaises (Bretagne, Vosges, Massif central), souvent en coussins (pillow-lavas).",
    mineralogie: "Albite (ex-plagioclase) + chlorite + épidote + calcite + oxydes ; texture basaltique en coussins.",
    mineraux: [["albite", 45], ["chlorite_m", 25], ["pyroxenes", 10], ["calcite", 10], ["epidote", 7], ["magnetite", 3]],
    argiles: ["chlorite", "smectites"],
    argilesNote: "La chlorite est déjà là (hydrothermalisme océanique) : l'altération météorique n'a plus qu'à la dégrader en smectites et vermiculite.",
    regions: [
      { nom: "Presqu'île de Crozon (Bretagne)", lat: 48.25, lng: -4.50 },
      { nom: "Série de la Brévenne (Rhône)", lat: 45.78, lng: 4.55 },
    ],
    ages: [
      { de: 615, a: 600, label: "Édiacarien : spilites de Paimpol (arc cadomien, ≈ 610 Ma)" },
      { de: 480, a: 350, label: "Volcanisme paléozoïque (Ordovicien-Carbonifère)" },
      { de: 252, a: 201, label: "Trias : spilites des Alpes externes (Pelvoux)" },
      { de: 165, a: 155, label: "Jurassique : ophiolite du Chenaillet" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Déjà partiellement préaltérée par la spilitisation ; en surface, chlorite et albite se transforment en smectites et en oxydes de fer.",
    },
    produits: { sable: 30, limon: 80, argile: 480, oxydes: 110, dissous: 300 },
    produitsNote: "≈ 480 g d'argiles (chlorite héritée dégradée en smectites et vermiculite), 110 g d'oxydes : les pillow-lavas spilitiques fondent en sols vert-brun.",
    usages: "Granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Spilite",
    varietes: [{ nom: "Kératophyre", note: "lave sodique claire, équivalent riche en silice de la spilite." }, { nom: "Albitophyre", note: "roche porphyrique à grands cristaux d'albite." }],
  },
  {
    id: "ignimbrite", nom: "Ignimbrite", categorie: "magmatique", sousType: "volcanique pyroclastique (souvent soudé)",
    swatch: "#b06a5a", densite: 2300,
    codes: [
      { code: "ρ", sens: " : avec les rhyolites (ex. ρ1, ρ2 de l'Estérel) ; « ignimbrites » précisé au libellé" },
    ],
    description: "Le dépôt d'une nuée ardente : un nuage de cendres et de ponces incandescentes qui, s'il s'immobilise encore très chaud (au-dessus de 600 °C environ), se soude sur lui-même. Les ignimbrites rhyolitiques rouges font le massif de l'Estérel et de nombreux reliefs corses.",
    mineralogie: "Fragments de ponce aplaties (fiammes) + cristaux (quartz, feldspath) dans une matrice vitreuse soudée.",
    mineraux: [["verre", 40], ["sanidine", 20], ["quartz", 20], ["plagioclases", 10], ["biotite", 6], ["magnetite", 4]],
    argiles: ["kaolinite", "smectites", "illite"],
    argilesNote: "Le verre soudé passe par les smectites ; sanidine et plagioclases finissent en kaolinite-illite, dans un bilan rhyolitique.",
    regions: [
      { nom: "Massif de l'Estérel", lat: 43.47, lng: 6.87 },
      { nom: "Monte Cinto (Corse du Nord-Ouest)", lat: 42.38, lng: 8.95 },
    ],
    ages: [{ de: 300, a: 270, label: "Volcanisme permien (Estérel, Corse)" }],
    alteration: {
      vmin: 0.002, vmax: 0.02, facilite: 4,
      // D.8.5 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0058, cas: "plateau d'ignimbrite encore intact, Cappadoce (Turquie centrale, climat sec) : abaissement de la surface", src: "Sarıkaya et al. 2015, chlore 36 (plateau le plus lent ; le plus rapide : 0,93 cm par millénaire)", ref: true },
        { v: 0.0321, cas: "couche dure qui coiffe les cheminées de fées, Cappadoce", src: "Sarıkaya et al. 2015, chlore 36" },
        { v: 0.045, cas: "plateau qui commence à se découper en cheminées, Cappadoce", src: "Sarıkaya et al. 2015, chlore 36" }
      ],
      sources: [
        "Sarıkaya M. A., Çiner A. et Zreda M. (2015), « Fairy chimney erosion rates on Cappadocia ignimbrites, Turkey: insights from cosmogenic nuclides », Geomorphology 234 : 182–191, doi 10.1016/j.geomorph.2014.12.039 (chlore 36)"
      ],
      mecanisme: "La matrice vitreuse se dévitrifie et s'hydrolyse (→ argiles, zéolites) plus vite que la lave massive ; les fiammes résistent mieux.",
      climat: "En Cappadoce, le chlore 36 montre que tout dépend du stade du relief : un plateau d'ignimbrite intact ne s'abaisse que de 0,58 mm en 100 ans ; dès qu'il se découpe, de 4,5 mm ; les couches dures qui coiffent les cheminées de fées perdent 3,2 mm en 100 ans. Sous ces chapeaux, les couches peu soudées partent bien plus vite (28 mm en 100 ans, voir le tuf volcanique). Aucune mesure n'est publiée en France.",
    },
    produits: { sable: 250, limon: 80, argile: 380, oxydes: 40, dissous: 250 },
    produitsNote: "≈ 380 g d'argiles (le verre soudé passe par les smectites), 250 g de sable (cristaux libérés et fragments soudés), 250 g d'ions.",
    usages: "Pierre de construction locale, granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Ignimbrite",
    varietes: [{ nom: "Tuf soudé", note: "ignimbrite dont les ponces, écrasées tant qu'elles étaient chaudes, forment des flammes sombres (fiamme)." }, { nom: "Ignimbrite non soudée", note: "dépôt de ponces et de cendres resté meuble ou peu consolidé." }, { nom: "Rhyolite ignimbritique", note: "ignimbrite si soudée qu'elle ressemble à une coulée de rhyolite (Estérel)." }],
  },
  {
    id: "tuf_volcanique", nom: "Tuf volcanique", categorie: "magmatique", sousType: "volcanique pyroclastique",
    swatch: "#b8a890", densite: 1600,
    codes: [
      { code: "TV", sens: " : tufs et projections (ex. TV1 « nappes de ponces », feuille Vic-sur-Cère) ; cinérites notées avec l'étage en terrain sédimentaire" },
    ],
    description: "Les cendres volcaniques consolidées : une roche tendre, poreuse et légère, retombée d'un panache éruptif. Les cinérites du Cantal et de la Limagne en sont de bons exemples ; elles font des sols volcaniques très fertiles.",
    mineralogie: "Cendres vitreuses fines et microcristaux (feldspath, pyroxène, biotite), parfois débris de ponce, souvent transformés en zéolites.",
    mineraux: [["verre", 55], ["plagioclases", 15], ["pyroxenes", 10], ["sanidine", 8], ["smectites_m", 7], ["magnetite", 5]],
    argiles: ["smectites", "interstratifies"],
    argilesNote: "Le verre pyroclastique est LA matière première des smectites : les bentonites industrielles sont d'anciens tufs. Allophanes et halloysite précèdent dans les andosols.",
    varietes: [
      { nom: "cinérite", note: "tuf de cendres fines." },
      { nom: "lapilli / tuf à lapilli", note: "à fragments millimétriques à centimétriques." },
      { nom: "ponce", note: "verre volcanique si bulleux (60 à 90 % de vides) qu'il flotte ; en France, les ponces du Mont-Dore (Neschers) et du Cantal." },
      { nom: "tuffite", note: "tuf mêlé de sédiment ordinaire (25 à 75 % de débris volcaniques), déposé dans l'eau." },
      { nom: "volcanoclastite / épiclastite", note: "volcanoclastite : toute roche faite de débris volcaniques ; épiclastite : débris de roches volcaniques déjà solides, remaniés par l'eau ou le vent (grès et conglomérats volcaniques)." },
      { nom: "métatuf", note: "tuf transformé par le métamorphisme : le verre devient séricite, chlorite et quartz, et la roche se débite en feuillets." }
    ],
    regions: [
      { nom: "Cinérites de Limagne (Puy-de-Dôme)", lat: 45.80, lng: 3.20 },
      { nom: "Cantal", lat: 45.10, lng: 2.72 },
    ],
    ages: [{ de: 25, a: 0.01, label: "Volcanisme cénozoïque du Massif central" }],
    alteration: {
      vmin: 0.05, vmax: 1, facilite: 5,
      // D.8.5 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.28, cas: "cou des cheminées de fées de Cappadoce (couche pyroclastique peu soudée), une fois tombé le chapeau qui le protégeait", src: "Sarıkaya et al. 2015, chlore 36 (± 9,9 cm par millénaire)", ref: true }
      ],
      sources: [
        "Sarıkaya M. A., Çiner A. et Zreda M. (2015), « Fairy chimney erosion rates on Cappadocia ignimbrites, Turkey: insights from cosmogenic nuclides », Geomorphology 234 : 182–191, doi 10.1016/j.geomorph.2014.12.039 (chlore 36)"
      ],
      mecanisme: "Le verre volcanique, sans réseau ordonné, s'hydrolyse très vite → allophanes puis smectites/halloysite ; d'où la grande fertilité des andosols.",
      climat: "Meuble et vitreux, il fond en argiles (allophanes, halloysite). En Cappadoce, le chlore 36 mesure ce qu'il perd une fois découvert : le cou d'une cheminée de fées dont le chapeau est tombé recule de 28 mm en 100 ans, cinquante fois plus vite que le plateau d'ignimbrite soudée (0,58 mm). Les cheminées n'y survivent que coiffées d'un bloc protecteur, qui s'use lui-même de 3,2 mm en 100 ans. Aucune mesure n'est publiée en France.",
    },
    produits: { sable: 50, limon: 150, argile: 480, oxydes: 120, dissous: 200 },
    produitsNote: "≈ 480 g d'argiles : le verre pyroclastique est la matière première des andosols et des bentonites. 120 g d'oxydes teintent les tufs rouges des paléosols.",
    usages: "Pierre légère, amendement, pouzzolane.",
    wikipedia: "https://fr.wikipedia.org/wiki/Tuf_volcanique",
  },
  {
    id: "obsidienne", nom: "Obsidienne", categorie: "magmatique", sousType: "volcanique (verre)",
    swatch: "#1a1a1e", densite: 2400,
    codes: [
      { code: "—", sens: " pas de coulée obsidienne cartographiée en métropole ; les rétinites du Mont-Dore sont décrites au libellé des trachytes" },
    ],
    description: "Un verre volcanique massif, noir et translucide sur les bords, formé quand une lave rhyolitique pauvre en eau, si visqueuse que les cristaux ne peuvent ni naître ni grandir, se fige sans cristalliser. Sa cassure tranchante en a fait l'outil de la préhistoire. Quasi absente en France (mieux représentée en Italie, Islande, Anatolie).",
    mineralogie: "Verre (silicate amorphe) à > 70 % SiO₂, quelques microcristaux. Voir aussi la partie Amorphes (« verre naturel »).",
    mineraux: [["verre", 92], ["sanidine", 4], ["quartz", 2], ["magnetite", 2]],
    argiles: ["smectites"],
    argilesNote: "Le verre perlitisé finit en smectites, mais à l'échelle humaine l'obsidienne reste du verre.",
    varietes: [
      { nom: "rétinite / pechstein", note: "verre plus hydraté, d'éclat résineux." },
    ],
    alteration: {
      facilite: 4,
      mecanisme: "Dépourvu de réseau cristallin, le verre s'hydrate et se dévitrifie : c'est la « perlite », qui se transforme ensuite en argiles. Instable à l'échelle géologique.",
    },
    produits: { sable: 100, limon: 80, argile: 500, oxydes: 60, dissous: 260 },
    produitsNote: "≈ 500 g d'argiles à terme (perlite → smectites) ; mais à l'échelle humaine, l'obsidienne est quasi inaltérée, ce qui explique que les lames préhistoriques coupent encore.",
    usages: "Outils préhistoriques (lames) ; la perlite, verre voisin plus hydraté, gonfle à la chaleur (perlite expansée : isolation, horticulture).",
    wikipedia: "https://fr.wikipedia.org/wiki/Obsidienne",
    regions: [{ nom: "Coulée des Rocche Rosse, Lipari (Italie)", lat: 38.51, lng: 14.95, etranger: true }],
    ages: [{ de: 0.0012, a: 0.0007, label: "Rocche Rosse (Lipari) : coulée de ≈ 1230 apr. J.-C." }],
  },
  {
    id: "komatiite", nom: "Komatiite", categorie: "magmatique", sousType: "volcanique ultrabasique",
    swatch: "#4a5a48", densite: 2900,
    codes: [
      { code: "—", sens: " absente des cartes métropolitaines (roche essentiellement archéenne) ; notée sur les cartes des boucliers (Guyane : ceintures de roches vertes du Paramaca)" },
    ],
    description: "Une lave ultramafique presque disparue : surtout archéenne (plus de 2,5 milliards d'années), quand la Terre était bien plus chaude ; elle jaillissait à près de 1 600 °C. Exception tardive : l'île Gorgona (Colombie), il y a ≈ 90 millions d'années. Ses cristaux d'olivine en gerbes (« spinifex ») sont sa signature. Absente de France métropolitaine ; la Guyane en possède, vieilles d'environ 2,1 milliards d'années, qui portent des diamants (Dachine).",
    mineralogie: "Olivine (en spinifex) + clinopyroxène, très pauvre en silice et riche en magnésium. Souvent serpentinisée.",
    mineraux: [["olivine", 55], ["serpentine", 24], ["pyroxenes", 15], ["magnetite", 5], ["chromite", 1]],
    argiles: ["smectites", "chlorite"],
    argilesNote: "Bilan de péridotite : smectites magnésiennes, serpentine héritée ; nickel et chrome se concentrent dans les profils latéritiques.",
    alteration: {
      facilite: 4,
      mecanisme: "L'olivine et le pyroxène, très altérables, se transforment en serpentine puis en smectites et oxydes de fer ; la roche est presque toujours métamorphisée ou serpentinisée aujourd'hui.",
    },
    produits: { sable: 0, limon: 50, argile: 300, oxydes: 210, dissous: 440 },
    produitsNote: "≈ 440 g d'ions et 210 g d'oxydes : comme la péridotite, la roche se vide de son magnésium et concentre fer et nickel dans le profil.",
    usages: "Gisements de nickel associés (à l'étranger).",
    wikipedia: "https://fr.wikipedia.org/wiki/Komatiite",
    regions: [{ nom: "Rivière Komati, ceinture de Barberton (Afrique du Sud)", lat: -25.97, lng: 30.75, etranger: true }],
    varietes: [{ nom: "Komatiite à spinifex", note: "Partie supérieure de la coulée, où l'olivine a cristallisé en longues aiguilles entrecroisées, à la manière de l'herbe spinifex." }, { nom: "Basalte komatiitique", note: "lave de la même famille, mais avec moins de 18 % de magnésie." }],
    ages: [{ de: 3500, a: 3450, label: "Komatiites de Barberton : ≈ 3,5 milliards d'années" }],
  },
  {
    id: "kimberlite", nom: "Kimberlite & lamproïte", categorie: "magmatique", sousType: "volcanique ultrabasique (diatrème)",
    swatch: "#3a4a3a", densite: 2700,
    codes: [
      { code: "—", sens: " aucune kimberlite avérée en France ; notation locale des cartons diamantifères étrangers" },
    ],
    description: "Les laves qui remontent les diamants : des magmas ultrabasiques venus de plus de 150 km de profondeur, qui percent la croûte en cheminées explosives (diatrèmes). Absentes en France, mais célèbres (Afrique du Sud, Sibérie, Australie).",
    mineralogie: "Olivine + phlogopite + grenat pyrope + ilménite + diopside chromifère, dans une matrice serpentinisée/carbonatée ; xénolites du manteau.",
    mineraux: [["olivine", 40], ["serpentine", 25], ["phlogopite", 12], ["calcite", 10], ["pyroxenes", 8], ["magnetite", 5]],
    argiles: ["smectites", "vermiculite", "chlorite"],
    argilesNote: "Olivine serpentinisée et phlogopite : smectites et vermiculite en quelques années. C'est le fameux « yellow ground » friable des mines de diamants.",
    varietes: [
      { nom: "lamproïte", note: "cousine ultra-potassique (diamants d'Argyle, Australie)." },
    ],
    alteration: {
      facilite: 5,
      mecanisme: "Très altérable : l'olivine et la matrice se transforment vite en « yellow ground » (argiles jaunes) sur le « blue ground » frais ; c'est ce qui libère les diamants dans les placers.",
    },
    produits: { sable: 0, limon: 80, argile: 450, oxydes: 150, dissous: 320 },
    produitsNote: "≈ 450 g d'argiles (smectites, serpentine dégradée) et 150 g d'oxydes ; les diamants, eux, inaltérables, se concentrent dans le résidu, jusque dans les rivières et les plages en aval.",
    usages: "Minerai de diamant (à l'étranger).",
    wikipedia: "https://fr.wikipedia.org/wiki/Kimberlite",
    regions: [{ nom: "Kimberley, le « Big Hole » (Afrique du Sud)", lat: -28.74, lng: 24.76, etranger: true }],
    ages: [{ de: 95, a: 85, label: "Kimberlites de Kimberley : Crétacé, ≈ 90 Ma" }],
  },
  {
    id: "pouzzolane", nom: "Pouzzolane (scories)", categorie: "magmatique", sousType: "volcanique pyroclastique",
    swatch: "#8c4a3c", densite: 1000,
    description: "Scories basaltiques bulleuses projetées par les cônes stromboliens de la chaîne des Puys. Rouges (oxydées) ou noires, légères et drainantes, elles sont exploitées pour le paillage et la filtration, et le volcan de Lemptégy se visite de l'intérieur.",
    mineralogie: "Verre basaltique vésiculé, olivine, pyroxènes et magnétite.",
    varietes: [
      { nom: "scories rouges", note: "oxydées à chaud au cœur du cône, près de la bouche, où elles s'entassent encore brûlantes (fer ferrique) : cônes de Lemptégy et de la Vache." },
      { nom: "scories noires", note: "retombées plus loin, sur la base et les flancs du cône, déjà refroidies : le fer est resté ferreux." },
      { nom: "lapilli", note: "les mêmes projections mais plus petites (2 à 64 mm), qui pavent les flancs des cônes." },
    ],
    regions: [
      { nom: "Puy de la Vache / Lemptégy", lat: 45.79, lng: 2.94 },
    ],
    ages: [{ de: 0.095, a: 0.007, label: "Chaîne des Puys (95 000 → 6 900 ans)" }],
    alteration: {
      facilite: 4,
      mecanisme: "Le verre volcanique, thermodynamiquement instable, s'hydrate vite ; l'immense surface des vésicules accélère le processus. En quelques millénaires, il donne des andosols bruns exceptionnellement fertiles.",
    },
    produits: { sable: 0, limon: 80, argile: 420, oxydes: 150, dissous: 350 },
    produitsNote: "Comme le basalte, en accéléré : argiles + oxydes de fer + ions. Les jeunes sols de la chaîne des Puys (quelques milliers d'années) montrent l'altération « en direct ».",
    usages: "Paillage horticole, filtration de l'eau, béton léger.",
    wikipedia: "https://fr.wikipedia.org/wiki/Pouzzolane",
  },
  {
    id: "microgranite", nom: "Microgranite", categorie: "magmatique", sousType: "hypovolcanique (filonienne)",
    swatch: "#c8a8a8", densite: 2640,
    codes: [
      { code: "μγ", sens: " : filons de microgranite (ex. réseau filonien du Limousin)" },
    ],
    description: "Un granite à grain fin : même composition que le granite, mais cristallisé plus vite, à faible profondeur, en filons (dykes) et petits massifs qui recoupent les granites et leur encaissant. Quand il porte de gros cristaux dans une pâte fine, on parle de porphyre granitique.",
    mineralogie: "Quartz + feldspaths (K et plagioclase) + micas, en cristaux fins ; parfois quelques phénocristaux (texture microgrenue porphyrique).",
    mineraux: [["orthose", 35], ["quartz", 30], ["plagioclases", 22], ["biotite", 10], ["muscovite", 3]],
    argiles: ["kaolinite", "illite", "vermiculite"],
    argilesNote: "Bilan de granite : kaolinite et illite des feldspaths, vermiculite des biotites.",
    varietes: [
      { nom: "microgranite porphyrique", note: "à phénocristaux de quartz/feldspath dans une pâte fine." },
      { nom: "granophyre", note: "à intercroissance quartz-feldspath (texture granophyrique)." },
      { nom: "micromonzogranite / microsyénogranite", note: "équivalents à grain fin du monzogranite et du syénogranite, en filons ou en bordure des massifs." },
      { nom: "microgranodiorite", note: "granodiorite à grain fin, en filons : plus de plagioclase que de feldspath potassique, un peu d'amphibole." }
    ],
    regions: [
      { nom: "Filons du Massif central", lat: 45.60, lng: 2.60 },
      { nom: "Massif de l'Estérel (porphyres permiens)", lat: 43.47, lng: 6.87 },
    ],
    ages: [
      { de: 345, a: 325, label: "Microgranites viséens (Forez, Roannais, Morvan)" },
      { de: 300, a: 270, label: "Filons tardi-hercyniens et permiens" },
    ],
    alteration: {
      facilite: 2,
      mecanisme: "Comme le granite (hydrolyse des feldspaths, quartz résiduel), mais le grain fin ralentit un peu la pénétration de l'eau.",
    },
    produits: { sable: 310, limon: 60, argile: 390, oxydes: 30, dissous: 210 },
    produitsNote: "Bilan granitique : environ 310 g de sable, 390 g d'argiles et 210 g d'ions, mais la roche se débite en gravillons anguleux plutôt qu'en arène grossière.",
    usages: "Granulats, pavés et pierre de construction (porphyres).",
    wikipedia: "https://fr.wikipedia.org/wiki/Microgranite",
  },
  {
    id: "aplite", nom: "Aplite", categorie: "magmatique", sousType: "hypovolcanique (filonienne)",
    swatch: "#e0d8cc", densite: 2620,
    codes: [
      { code: "a", sens: " : « a. Aplites à tourmaline » (ex. feuille Bourganeuf) ; souvent regroupées avec les pegmatites (p)" },
    ],
    description: "Le « sucre » des granites : un filon clair à grain très fin et régulier, presque sans minéraux noirs, qui recoupe en réseaux blancs les massifs granitiques. Il représente les derniers jus, appauvris, d'un magma granitique.",
    mineralogie: "Quartz + feldspaths à grain fin saccharoïde, très peu de micas ; souvent associée aux pegmatites.",
    mineraux: [["orthose", 40], ["quartz", 35], ["plagioclases", 20], ["muscovite", 5]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Feldspaths + quartz presque purs : kaolinite blanche, sans le fer qui colorerait le profil.",
    regions: [
      { nom: "Filons du Sidobre (Tarn)", lat: 43.62, lng: 2.38 },
      { nom: "Granites du Limousin", lat: 45.75, lng: 1.60 },
    ],
    ages: [{ de: 340, a: 290, label: "Tardi-hercynien (derniers jus granitiques)" }],
    alteration: {
      facilite: 2,
      mecanisme: "Hydrolyse des feldspaths → kaolinite + ions ; le quartz reste. Très résistante (peu de micas, grain serré).",
    },
    produits: { sable: 350, limon: 60, argile: 360, oxydes: 20, dissous: 210 },
    produitsNote: "≈ 350 g de sable clair et 360 g d'argiles blanches (kaolinite) : l'aplite altérée reste pâle, presque sans fer.",
    usages: "Peu exploitée seule.",
    wikipedia: "https://fr.wikipedia.org/wiki/Aplite",
    varietes: [{ nom: "Aplo-pegmatite", note: "filon zoné où l'aplite fine alterne avec des bandes de pegmatite à grands cristaux." }, { nom: "Leucogranite aplitique", note: "granite très clair à grain fin, en petites masses plutôt qu'en filons." }],
  },
  {
    id: "pegmatite", nom: "Pegmatite", categorie: "magmatique", sousType: "hypovolcanique (filonienne)",
    swatch: "#ddc8c0", densite: 2650,
    codes: [
      { code: "p", sens: " : filons de pegmatite (p, pγ selon feuilles) ; les champs pegmatitiques sont détaillés en notice" },
    ],
    description: "Le granite à cristaux géants : les derniers fluides d'un magma, gorgés d'eau et d'éléments rares, cristallisent en filons, souvent en quelques jours à quelques années : très fluide, riche en eau et en fondants (bore, fluor, lithium), ce liquide fait naître peu de cristaux, qui deviennent géants ; quartz, feldspath et mica atteignent le décimètre, parfois le mètre. C'est la mine des minéraux rares : béryl, tourmaline, spodumène, colombo-tantalite…",
    mineralogie: "Quartz + feldspath alcalin + micas GÉANTS ; minéraux accessoires rares : béryl, tourmaline, grenat, spodumène, lépidolite, colombo-tantalite, uraninite.",
    mineraux: [["orthose", 42], ["quartz", 30], ["plagioclases", 15], ["muscovite", 8], ["tourmaline", 4], ["beryl", 1]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Les feldspaths géants se kaolinisent en masse : beaucoup de kaolins industriels sont des pegmatites pourries ; tourmaline et béryl survivent dans l'arène.",
    varietes: [
      { nom: "pegmatite à éléments rares (LCT)", note: "à lithium, césium et tantale (spodumène, lépidolite) : les gîtes de lithium." },
      { nom: "pegmatite à terres rares (NYF)", note: "à niobium-yttrium-fluor." },
      { nom: "quartzolite", note: "roche plutonique faite à plus de 90 % de quartz (IUGS) : les cœurs de quartz des pegmatites zonées et certains filons de quartz d'origine magmatique." }
    ],
    regions: [
      { nom: "Pegmatites d'Ambazac / Chanteloube (Haute-Vienne)", lat: 45.95, lng: 1.40 },
      { nom: "Vendée (Commequiers)", lat: 46.75, lng: -1.83 },
    ],
    ages: [{ de: 340, a: 290, label: "Tardi-hercynien (Massif central, Massif armoricain)" }],
    alteration: {
      facilite: 2,
      mecanisme: "Les feldspaths se transforment en kaolinite (le kaolin pegmatitique), les micas en vermiculite, et il reste du quartz ; les éléments rares sont libérés dans les placers (étain, tantale).",
    },
    produits: { sable: 380, limon: 50, argile: 350, oxydes: 20, dissous: 200 },
    produitsNote: "≈ 380 g de sable très grossier (fragments de cristaux), 350 g de kaolinite : les grandes carrières de kaolin exploitent souvent des pegmatites et leurs coiffes altérées.",
    usages: "Minéraux industriels (feldspath, mica, quartz), minerais de lithium, de tantale et de béryllium, gemmes ; kaolins.",
    wikipedia: "https://fr.wikipedia.org/wiki/Pegmatite",
  },
  {
    id: "dolerite", nom: "Dolérite (diabase)", categorie: "magmatique", sousType: "hypovolcanique (filonienne)",
    swatch: "#40474a", densite: 2950,
    codes: [
      { code: "δ", sens: " : filons doléritiques (Massif armoricain) ; attention, δ désigne aussi des amphibolites sur d'autres feuilles, et la légende doit toujours être vérifiée" },
    ],
    description: "Un basalte de filon : magma basique figé à faible profondeur dans des dykes et des sills, à grain moyen (entre le basalte et le gabbro). Sa texture « ophitique » (les plagioclases en lattes prises dans les pyroxènes) est caractéristique.",
    mineralogie: "Plagioclase calcique et pyroxène (texture ophitique), parfois olivine et oxydes de fer et de titane. Pas de quartz.",
    mineraux: [["plagioclases", 50], ["pyroxenes", 35], ["olivine", 8], ["magnetite", 7]],
    argiles: ["smectites", "chlorite"],
    argilesNote: "Bilan de gabbro : smectites calciques et magnésiennes, chlorite des faciès ouralitisés.",
    varietes: [
      { nom: "microgabbro", note: "Terme équivalent, à grain un peu plus grossier." },
    ],
    regions: [
      { nom: "Filons doléritiques du Massif armoricain", lat: 48.20, lng: -2.80 },
      { nom: "Filon de Kerforne (Le Conquet, Finistère)", lat: 48.36, lng: -4.77 },
    ],
    ages: [
      { de: 360, a: 250, label: "Filons hercyniens à permiens" },
      { de: 205, a: 190, label: "Filons jurassiques (filon de Kerforne, Bretagne : province magmatique centre-atlantique)" },
    ],
    alteration: {
      vmin: 0.004, vmax: 0.03, facilite: 3,
      // D.8.5 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00165, cas: "sill de dolérite du Karoo près de Williston (Afrique du Sud, moins de 100 mm de pluie par an), surface plane : érosion totale, au plus", src: "Kounov et al. 2007, néon 21 dans le pyroxène (1,65 m par million d'années)" },
        { v: 0.00245, cas: "dolérite du sommet de la montagne de Hantam (Afrique du Sud, 1 500 m, plateau semi-aride), surface plane : érosion totale, au plus", src: "Kounov et al. 2007, néon 21 dans le pyroxène (2,45 m par million d'années)", ref: true }
      ],
      sources: [
        "Kounov A., Niedermann S., de Wit M. J., Viola G., Andreoli M. et Erzinger J. (2007), « Present denudation rates at selected sections of the South African escarpment and the elevated continental interior based on cosmogenic ³He and ²¹Ne », South African Journal of Geology 110 : 235–248, doi 10.2113/gssajg.110.2/3.235 (tableau 5)"
      ],
      mecanisme: "Hydrolyse des plagioclases et pyroxènes → smectites + oxydes de fer ; sans quartz, pas de sable durable. Un peu plus vite que le gabbro (grain plus fin).",
      climat: "Les seules mesures publiées viennent des sills de dolérite du Karoo, en Afrique du Sud : le néon 21 accumulé dans leurs pyroxènes donne au plus 0,17 mm en 100 ans dans le désert de Williston (moins de 100 mm de pluie) et 0,25 mm au sommet de la montagne de Hantam, plus arrosé ; plus dure que les grès et les argiles qui l'entourent, la dolérite y tient les collines. Aucune mesure n'existe en France, où la desquamation en boules (« corestones ») est spectaculaire : les filons doléritiques armoricains s'égrènent en chapelets de boules brunes.",
    },
    produits: { sable: 20, limon: 60, argile: 450, oxydes: 120, dissous: 350 },
    produitsNote: "≈ 450 g de smectites, 120 g d'oxydes de fer, 350 g d'ions : la dolérite brunit de la croûte vers le cœur, pelure après pelure.",
    usages: "Granulats très résistants (ballast, empierrement).",
    wikipedia: "https://fr.wikipedia.org/wiki/Dol%C3%A9rite",
  },
  {
    id: "lamprophyre", nom: "Lamprophyre", categorie: "magmatique", sousType: "hypovolcanique (filonienne)",
    swatch: "#4a4038", densite: 2800,
    codes: [
      { code: "X", sens: " — « X. Lamprophyres (minettes) » (ex. feuille Bourganeuf) ; notation variable selon feuilles" },
    ],
    description: "Une roche de filon sombre et « brillante », riche en mica ou en amphibole, sans phénocristaux de quartz ni de feldspath (ceux-ci restent dans la pâte). Ses variétés portent des noms français : la minette (Vosges) et la kersantite (Kersanton, en Bretagne) en sont les types ; le nom de la famille vient du grec « lampros », « brillant », pour l'éclat de ses micas (Gümbel, 1874).",
    mineralogie: "Phénocristaux de biotite et/ou d'amphibole (± pyroxène, olivine), feldspaths cantonnés à la pâte. Riche en éléments volatils.",
    mineraux: [["biotite", 35], ["hornblende", 25], ["plagioclases", 15], ["orthose", 12], ["pyroxenes", 8], ["apatite", 5]],
    argiles: ["vermiculite", "smectites", "chlorite"],
    argilesNote: "La biotite, dominante, produit une grande quantité de vermiculite : c'est elle qui décompose le filon en premier.",
    varietes: [
      { nom: "minette", note: "biotite + feldspath potassique (localité type : Vosges)." },
      { nom: "kersantite", note: "biotite + plagioclase (localité type : Kersanton, Bretagne)." },
      { nom: "vogésite", note: "amphibole + feldspath potassique." },
      { nom: "spessartite", note: "amphibole + plagioclase." },
      { nom: "camptonite", note: "lamprophyre alcalin : amphibole riche en titane (kaersutite) et augite dans une pâte de plagioclase, souvent avec des ocelles de calcite ou d'analcime." },
      { nom: "monchiquite", note: "lamprophyre alcalin sans feldspath : olivine, augite et amphibole dans une pâte de verre ou d'analcime ; nommé d'après la Serra de Monchique (Portugal)." }
    ],
    regions: [
      { nom: "Kersanton (rade de Brest)", lat: 48.33, lng: -4.35 },
      { nom: "Vosges cristallines (minette)", lat: 48.05, lng: 7.00 },
    ],
    ages: [{ de: 340, a: 290, label: "Filons tardi-hercyniens" }],
    alteration: {
      facilite: 3,
      mecanisme: "Les micas et amphiboles s'hydrolysent → chlorite/vermiculite puis smectites + oxydes de fer ; roche souvent déjà altérée en profondeur (riche en volatils).",
    },
    produits: { sable: 40, limon: 90, argile: 450, oxydes: 130, dissous: 290 },
    produitsNote: "≈ 450 g d'argiles (vermiculite des biotites en tête), 130 g d'oxydes : sur le terrain, on repère souvent le lamprophyre à son absence (creux, sillon).",
    usages: "Kersanton : pierre de taille sculpturale de Bretagne (calvaires, Ankou).",
    wikipedia: "https://fr.wikipedia.org/wiki/Lamprophyre",
  },
  {
    id: "porphyre", nom: "Porphyre", categorie: "magmatique", sousType: "hypovolcanique (texture porphyrique)",
    swatch: "#a04848", densite: 2650,
    codes: [
      { code: "—", sens: " terme des anciennes éditions : leurs « porphyres » sont recodés en microgranites (μγ) ou rhyolites (ρ) sur les cartes modernes" },
    ],
    description: "Un terme de texture autant que de roche : une pâte fine parsemée de gros cristaux visibles (phénocristaux), figée à faible profondeur. Le « porphyre rouge » de l'Estérel (rhyolitique) est un classique de la pierre ornementale ; l'Antiquité prisait le porphyre pourpre impérial.",
    mineralogie: "Phénocristaux (quartz, feldspath, parfois amphibole) dans une pâte microcristalline ; composition acide (porphyre quartzifère) à intermédiaire (porphyrite).",
    mineraux: [["orthose", 40], ["quartz", 30], ["plagioclases", 20], ["biotite", 7], ["magnetite", 3]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Bilan rhyolitique : kaolinite et illite des feldspaths, la pâte fine suivant le même chemin.",
    varietes: [
      { nom: "porphyre quartzifère", note: " : acide, à phénocristaux de quartz (proche de la rhyolite ou du microgranite porphyrique)" },
      { nom: "porphyrite", note: " : intermédiaire, sans quartz (proche de l'andésite ou de la microdiorite porphyrique)" },
    ],
    regions: [
      { nom: "Massif de l'Estérel (porphyres permiens)", lat: 43.47, lng: 6.87 },
      { nom: "Vosges du Sud", lat: 47.85, lng: 6.90 },
    ],
    ages: [
      { de: 340, a: 330, label: "Vosges du Sud : volcanisme viséen (Thann-Giromagny)" },
      { de: 300, a: 270, label: "Volcanisme filonien permien" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Dévitrification de la pâte + hydrolyse des feldspaths → argiles + oxydes de fer ; les phénocristaux de quartz résistent.",
    },
    produits: { sable: 260, limon: 70, argile: 400, oxydes: 40, dissous: 230 },
    produitsNote: "Bilan du microgranite et de la rhyolite : environ 260 g de sable, 400 g d'argiles et 230 g d'ions.",
    usages: "Pierre ornementale et pavés (porphyre rouge), granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Porphyre_(roche)",
  },
  {
    id: "peridotite", nom: "Péridotite", categorie: "magmatique", sousType: "mantellique",
    swatch: "#6b7d46", densite: 3300,
    description: "Roche du manteau terrestre. La lherzolite de l'étang de Lers (Ariège), remontée lors de l'amincissement extrême de la croûte au Crétacé, est mondialement célèbre : elle a donné son nom à ce type de roche. Vert olive à cœur, croûte rousse en surface.",
    mineralogie: "Olivine 40 à 60 %, orthopyroxène, clinopyroxène, spinelle.",
    varietes: [
      { nom: "lherzolite", note: "le type le plus courant en France (olivine + deux pyroxènes), celui de l'étang de Lers, qui lui a donné son nom." },
      { nom: "harzburgite", note: "pauvre en clinopyroxène (olivine + orthopyroxène), résidu d'une fusion partielle poussée." },
      { nom: "dunite", note: "quasi mono-minérale (> 90 % olivine), verte, dense." },
      { nom: "wehrlite", note: "Olivine et clinopyroxène (augite), presque sans orthopyroxène." },
      { nom: "webstérite à olivine", note: "pyroxénite à deux pyroxènes avec 10 à 40 % d'olivine : la transition entre péridotite et pyroxénite." },
      { nom: "métapéridotite", note: "péridotite transformée par le métamorphisme : avec de l'eau, elle devient serpentinite (voir sa fiche) ; à sec, elle recristallise en grains aplatis d'olivine et de pyroxène." }
    ],
    regions: [
      { nom: "Étang de Lers (Ariège)", lat: 42.80, lng: 1.38 },
    ],
    ages: [{ de: 110, a: 95, label: "Exhumation du manteau au Crétacé (rifting pyrénéen)" }],
    alteration: {
      vmin: 0.01, vmax: 0.1, facilite: 4,
      // D.8.4 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00151, cas: "sous forêt, petits bassins français sur péridotites (2 ruisseaux, eau à 93 % de magnésium) : dissolution seule", src: "Meybeck 1987, export en solution des ruisseaux, 268 mm d'écoulement par an, masse volumique 3,3", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2 : ruisseaux français ne drainant qu'une roche, sous forêt, d'après Meybeck 1986, Sciences Géologiques Bulletin 39 : 3–77)"
      ],
      mecanisme: "L'olivine est le minéral le plus instable en surface (sommet de la série de Goldich) : hydrolyse et oxydation rapides, la roche brunit en quelques décennies (patine rousse) et se délite. L'altération des olivines consomme beaucoup de CO₂, d'où les projets d'« altération forcée » pour le climat.",
      climat: "Sous forêt, les deux ruisseaux français qui ne drainent que des péridotites emportent en solution l'équivalent de 0,15 mm de roche en 100 ans ; leur eau est la plus magnésienne de toutes (93 % des cations). À l'affleurement, l'olivine se change en goethite, iddingsite et smectites magnésiennes (la serpentine naît plus chaud, en profondeur), et la roche se délite plus vite qu'elle ne se dissout ; aucune mesure de ce recul n'est publiée en France.",
    },
    produits: { sable: 0, limon: 50, argile: 300, oxydes: 200, dissous: 450 },
    produitsNote: "Presque la moitié part en solution (Mg²⁺, silice) ; le fer des olivines précipite en oxydes (20 %). Les sols sur péridotite, riches en Mg et Ni mais pauvres en Ca, portent une flore spécialisée.",
    usages: "Objet géologique de référence ; source potentielle de séquestration du CO₂.",
    wikipedia: "https://fr.wikipedia.org/wiki/P%C3%A9ridotite",
  },

  {
    id: "trachybasalte", nom: "Trachybasalte", categorie: "magmatique", sousType: "volcanique basique alcalin",
    swatch: "#5f5a56", densite: 2800,
    description: "La lave ordinaire de la chaîne des Puys : un basalte enrichi en alcalins, premier pas de la série qui mène au trachyte. Dans la chaîne des Puys, beaucoup de coulées appelées « basaltes » sont en réalité des trachybasaltes (hawaiites, leur variété sodique) ou des laves un peu plus évoluées (mugéarites).",
    mineralogie: "Plagioclase (andésine-labrador), olivine, clinopyroxène et oxydes de fer et de titane ; un peu de feldspath alcalin interstitiel, qui donne son caractère « trachy ».",
    mineraux: [["plagioclases", 45], ["pyroxenes", 20], ["olivine", 15], ["sanidine", 8], ["magnetite", 8], ["verre", 4]],
    argiles: ["smectites", "interstratifies"],
    argilesNote: "Comme le basalte : smectites dominantes ; le feldspath alcalin ajoute une pincée d'illite au mélange.",
    codes: [
      { code: "βτ", sens: " : trachybasaltes et basaltes évolués, notation selon feuilles volcaniques (chaîne des Puys, Aubrac, Cantal)" },
    ],
    varietes: [
      { nom: "hawaiite", note: "le trachybasalte sodique, nommé d'après Hawaï, banal en Auvergne." },
      { nom: "mugéarite (trachyandésite basaltique)", note: "le cran au-dessus dans la série alcaline sodique." },
      { nom: "shoshonite", note: "la trachyandésite basaltique potassique, équivalent potassique de la mugéarite (le trachybasalte potassique, lui, n'a pas de nom propre) ; nommée d'après la rivière Shoshone (Wyoming, près de Yellowstone)." },
    ],
    regions: [
      { nom: "Chaîne des Puys (coulées de la Cheire d'Aydat)", lat: 45.72, lng: 2.98 },
      { nom: "Aubrac (plateaux basaltiques)", lat: 44.65, lng: 2.98 },
      { nom: "Cantal (planèzes)", lat: 45.05, lng: 2.70 },
      { nom: "Devès, Velay occidental", lat: 44.95, lng: 3.75 },
    ],
    ages: [
      { de: 9, a: 6, label: "Aubrac" },
      { de: 7, a: 2, label: "Cantal : coulées des planèzes (basaltes à trachybasaltes)" },
      { de: 0.095, a: 0.0069, label: "Chaîne des Puys (dernière éruption : ~ 6 900 ans)" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Comme le basalte : hydrolyse de l'olivine, des pyroxènes et du plagioclase en smectites, oxydation du fer en goethite. Le feldspath alcalin, plus résistant, retarde un peu le bilan.",
    },
    produits: { sable: 20, limon: 60, argile: 450, oxydes: 110, dissous: 360 },
    produitsNote: "≈ 450 g de smectites, 110 g d'oxydes de fer, 360 g d'ions : le bilan basaltique classique, à peine tempéré par le feldspath alcalin.",
    usages: "Granulats, pierre à bâtir (la « pierre de Volvic » est sa cousine trachyandésitique), pouzzolanes des cônes associés.",
    wikipedia: "https://fr.wikipedia.org/wiki/Trachybasalte",
  },
  {
    id: "breche_volcanique", nom: "Brèche volcanique & agglomérat", categorie: "magmatique", sousType: "volcanoclastique grossier",
    swatch: "#7a6a5c", densite: 2300,
    description: "Des blocs de lave pris dans une matrice cendreuse : explosions, effondrements de dômes, coulées de boue (lahars) et avalanches de débris. Le Cantal, plus grand stratovolcan d'Europe, est fait pour moitié de ces brèches, dont celles des avalanches de débris (au moins quatre, entre 7,4 et 6,8 millions d'années) qui ont décapité le sommet de l'édifice. Seuls l'agglomérat et la brèche d'explosion sont pyroclastiques au sens strict.",
    mineralogie: "Blocs de trachyandésite, de trachyte, de basalte, etc., dans une matrice de cendres, ponces et cristaux libres, souvent argilisée.",
    mineraux: [["verre", 30], ["plagioclases", 25], ["smectites_m", 15], ["pyroxenes", 15], ["hornblende", 8], ["magnetite", 7]],
    argiles: ["smectites", "interstratifies"],
    argilesNote: "La matrice cendreuse est déjà à moitié smectitique ; l'altération achève le travail, d'où les sols lourds et gras des planèzes bréchiques.",
    codes: [
      { code: "notation locale", sens: " : brèches et formations lahariques du Cantal et du Mont-Dore, précisées au libellé des feuilles volcaniques" },
    ],
    varietes: [
      { nom: "agglomérat", note: "accumulation de bombes (plus de 64 mm) près des bouches éruptives ; soudées encore molles, elles forment un agglutinat." },
      { nom: "brèche d'avalanche de débris", note: "l'effondrement de la totalité d'un flanc, qui transporte des blocs kilométriques sur plusieurs dizaines de kilomètres (Cantal, ~ 7 Ma)." },
      { nom: "lahar (brèche laharique)", note: "coulée de boue volcanique consolidée ; les « nappes » qui comblent les vallées du Cantal." },
      { nom: "brèche autoclastique", note: "la croûte fracturée que forme la coulée en progressant." },
      { nom: "pépérite", note: "roche pépéritique : brèche résultant de l'intrusion d'un magma dans un sédiment imprégné d'eau, la lave se fragmentant au contact et se mêlant au matériau. Le terme provient de la Limagne (puy de Crouël, Gergovie), où un basalte a traversé les marnes et calcaires lacustres de l'Oligocène." },
      { nom: "métabrèche", note: "brèche volcanique recristallisée sous l'effet du métamorphisme." }
    ],
    regions: [
      { nom: "Cantal (vallées de la Cère, de la Jordanne)", lat: 45.05, lng: 2.75 },
      { nom: "Mont-Dore, Sancy", lat: 45.53, lng: 2.81 },
      { nom: "Cézallier", lat: 45.38, lng: 2.98 },
    ],
    ages: [{ de: 13, a: 0.25, label: "Cantal (13 à 2 Ma, avalanches de débris de 7,4 à 6,8 Ma) puis Mont-Dore" }],
    alteration: {
      facilite: 4,
      mecanisme: "La matrice cendreuse, déjà à moitié argilisée, est la première à céder : les blocs se déchaussent et les versants se ravinent. C'est cette érosion différentielle qui a façonné le profil des vallées rayonnantes du Cantal.",
    },
    produits: { sable: 150, limon: 150, argile: 450, oxydes: 100, dissous: 150 },
    produitsNote: "Bilan : 450 g d'argiles issues de la matrice, 150 g de blocs et graviers de lave formant le squelette, 100 g d'oxydes. Profonds, lourds et fertiles, ces sols rappellent les prairies grasses à salers du Cantal.",
    usages: "Peu adaptée aux granulats ; terroirs d'élevage. Les blocs résistants servent de pierre locale.",
    wikipedia: "https://fr.wikipedia.org/wiki/Br%C3%A8che_(roche)",
  },
  {
    id: "microdiorite", nom: "Microdiorite", categorie: "magmatique", sousType: "hypovolcanique (filonienne)",
    swatch: "#8a8d84", densite: 2800,
    description: "La diorite en filons : mêmes minéraux, à grain fin, car la roche s'est refroidie près de la surface. Les carrières de la rade de Brest en ont extrait la « pierre jaune de Logonna », employée pour les calvaires et les enclos paroissiaux du Finistère.",
    mineralogie: "Plagioclase (andésine) + hornblende ± biotite, un peu de quartz (la microdiorite quartzique, à 5 à 20 % de quartz parmi les minéraux clairs, est la plus courante) ; texture microgrenue à microlitique porphyrique.",
    mineraux: [["plagioclases", 55], ["hornblende", 22], ["biotite", 12], ["quartz", 8], ["magnetite", 3]],
    argiles: ["smectites", "vermiculite", "illite"],
    argilesNote: "Smectites dérivées du plagioclase et de la hornblende ; vermiculite dérivée des biotites. Tel est le bilan de la diorite.",
    codes: [
      { code: "μη", sens: " : notée selon les feuilles, la microdiorite forme filons et petits massifs, fréquents sur les cartes armoricaines" },
    ],
    varietes: [
      { nom: "microdiorite quartzique", note: "la variété la plus répandue, celle de Logonna-Daoulas." },
      { nom: "porphyrite", note: "ancienne appellation des microdiorites porphyriques, encore relevée dans les anciennes notices." },
      { nom: "micromonzodiorite", note: "la déclinaison à deux feldspaths." },
      { nom: "microdiorite foïdifère", note: "une faible proportion de néphéline (moins de 10 %) remplace le quartz." },
      { nom: "estérellite (« porphyre bleu de l'Estérel »)", note: "microdiorite quartzique du cap Dramont (Var), en laccolites d'âge oligocène ; nommée « porphyre bleu » par Saussure en 1796, exploitée au Dramont de 1864 à 1959." }
    ],
    regions: [
      { nom: "Rade de Brest (Logonna-Daoulas)", lat: 48.33, lng: -4.30 },
      { nom: "Massif armoricain (filons varisques)", lat: 48.10, lng: -3.00 },
      { nom: "Vosges (filons dans les granites)", lat: 48.05, lng: 6.90 },
    ],
    ages: [{ de: 360, a: 290, label: "Filons tardi-varisques pour l'essentiel" }],
    alteration: {
      facilite: 3,
      mecanisme: "Le plagioclase et la hornblende s'hydrolysent en argiles. La pénétration de l'eau est freinée par le grain fin, mais la roche finit par s'effriter en boules dans une arène brune, comme sa variété grenue.",
    },
    produits: { sable: 130, limon: 80, argile: 430, oxydes: 80, dissous: 280 },
    produitsNote: "≈ 430 g d'argiles, 130 g de sable feldspathique et 80 g d'oxydes, soit le bilan d'une diorite, mais à vitesse moindre.",
    usages: "Employée autrefois comme pierre de taille (calvaires, églises du Finistère) ; sert aussi de granulat.",
    wikipedia: "https://fr.wikipedia.org/wiki/Microdiorite",
  },
  {
    id: "essexite", nom: "Essexite (monzogabbro à néphéline)", categorie: "magmatique", sousType: "plutonique alcalin basique",
    swatch: "#4e5250", densite: 2950,
    description: "Dans les provinces alcalines, le gabbro, accompagné de feldspath potassique, est assez pauvre en silice pour que la néphéline occupe une partie de la place des feldspaths. Socle plutonique des grands volcans alcalins, il se trouve sous le Cantal, figé sous les laves qu'il alimentait.",
    mineralogie: "Plagioclase, feldspath alcalin (orthose, anorthose), augite titanifère, néphéline (± analcime), biotite ou amphibole brune ; olivine en minéral accessoire. Le nom est emprunté au comté d'Essex (Massachusetts).",
    mineraux: [["plagioclases", 35], ["orthose", 12], ["augite", 22], ["nepheline", 12], ["biotite", 9], ["olivine", 5], ["magnetite", 5]],
    argiles: ["smectites", "kaolinite"],
    argilesNote: "Smectites issues des minéraux ferromagnésiens et kaolinite précoce issue de la néphéline : deux contraintes distinctes pour l'altération.",
    codes: [
      { code: "—", sens: " : peu fréquente à l'affleurement en France, cette roche est décrite dans les intrusions des complexes volcano-plutoniques alcalins (Cantal, Mont-Dore)" },
    ],
    varietes: [
      { nom: "théralite", note: "gabbro à néphéline sans feldspath alcalin (gabbro foïdique) ; il est décrit dans les intrusions du Cantal." },
      { nom: "teschénite", note: "variante à analcime, dont le nom dérive de Těšín (Silésie)." },
      { nom: "microessexite / microthéralite / microteschénite", note: "les faciès filoniens de bordure." },
    ],
    regions: [
      { nom: "Cantal (intrusions du cœur du stratovolcan)", lat: 45.08, lng: 2.72 },
      { nom: "Mont-Dore (pointements alcalins)", lat: 45.55, lng: 2.80 },
    ],
    ages: [{ de: 13, a: 2, label: "Intrusions du Miocène au début du Quaternaire (stratovolcan du Cantal, 13 à 2 Ma)" }],
    alteration: {
      facilite: 4,
      mecanisme: "L'altération attaque d'abord les ferromagnésiens, comme dans un gabbro ; la néphéline, minéral très fragile, se kaolinise et fait éclater la roche de l'intérieur.",
    },
    produits: { sable: 20, limon: 70, argile: 480, oxydes: 110, dissous: 320 },
    produitsNote: "Les argiles (smectites et kaolinite formée aux dépens de la néphéline) pèsent 480 g ; les oxydes de fer 110 g ; les ions sodiques et calciques 320 g.",
    usages: "Roche ornementale sombre appréciée à l'étranger (« black granite » dans certains catalogues) ; en France, son intérêt est surtout pétrologique.",
    wikipedia: "https://fr.wikipedia.org/wiki/Essexite",
  },
  {
    id: "carbonatite", nom: "Carbonatite", categorie: "magmatique", sousType: "magmatique carbonatée",
    swatch: "#cfc4b4", densite: 2900,
    description: "Un paradoxe magmatique : une lave constituée de carbonates et dépourvue de silicates. L'Ol Doinyo Lengai (Tanzanie) en émet aujourd'hui vers 540 °C ; noire et « froide », elle blanchit à l'air en quelques jours. Les carbonatites contiennent l'essentiel des réserves mondiales de niobium et de terres rares.",
    mineralogie: "Calcite et/ou dolomite d'origine magmatique (plus de 50 %), apatite, magnétite, pyrochlore (niobium), monazite et bastnäsite (terres rares).",
    mineraux: [["calcite", 68], ["dolomite", 10], ["apatite", 10], ["magnetite", 6], ["biotite", 5], ["pyrochlore", 1]],
    argiles: [],
    argilesNote: "Presque rien ne subsiste : les carbonates se dissolvent et le résidu, constitué d'apatite, d'oxydes et de pyrochlore, forme le concentré à niobium et terres rares.",
    codes: [
      { code: "—", sens: " : aucune carbonatite avérée en métropole ; ces roches figurent sur les cartes des grandes provinces alcalines (Afrique de l'Est, Scandinavie, Canada)" },
    ],
    varietes: [
      { nom: "calciocarbonatite (sövite)", note: "à calcite dominante : la plus commune." },
      { nom: "magnésiocarbonatite", note: "à dolomite." },
      { nom: "ferrocarbonatite", note: "Variété dont la gangue est faite d'ankérite et de sidérite ; c'est souvent la plus riche en terres rares." },
      { nom: "natrocarbonatite", note: "variété à carbonates sodiques, celle du Lengai, unique au monde, soluble dans la pluie." },
      { nom: "silicocarbonatite", note: "il marque la transition vers les roches silicatées alcalines." },
    ],
    ages: [{ de: 3000, a: 0, label: "De l'Archéen (Groenland) à l'actuel (Ol Doinyo Lengai)" }],
    alteration: {
      vmin: 0.01, vmax: 0.1, facilite: 3,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0178, cas: "Kaiserstuhl, avec les 186 mm infiltrés annuellement à Strasbourg.", src: "dissolution à saturation, masse volumique 2,9, 75 % de carbonate", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Cette roche se dissout à la manière d'un calcaire, dont elle a la chimie. Son résidu est toutefois singulier : apatite, pyrochlore et minéraux de terres rares s'accumulent dans le manteau d'altération.",
      climat: "Aucune mesure publiée. Un calcul pour le Kaiserstuhl, voisin de l'Alsace, donne 1,8 mm en 100 ans. Sous les tropiques, une altération avancée a produit les gisements de terres rares et de niobium les plus riches (Mount Weld en Australie, Araxá au Brésil), c'est-à-dire des carbonatites altérées.",
    },
    produits: { sable: 30, limon: 60, argile: 150, oxydes: 100, dissous: 660 },
    produitsNote: "≈ 660 g de carbonates passent en solution ; les 340 g qui restent constituent le concentré exploitable : apatite (phosphate), oxydes de fer et résidu enrichi en niobium et terres rares.",
    usages: "Source de niobium (pyrochlore d'Araxá), de terres rares (Bayan Obo, Mountain Pass) et d'apatite ; à plus petite échelle, chaux et amendements agricoles.",
    wikipedia: "https://fr.wikipedia.org/wiki/Carbonatite",
    regions: [{ nom: "Ol Doinyo Lengai (Tanzanie), seul volcan actif à carbonatite", lat: -2.76, lng: 35.91, etranger: true }, { nom: "Kaiserstuhl (Allemagne), carbonatite de Schelingen, à moins de 10 km de la France", lat: 48.08, lng: 7.68, etranger: true }],
  },
  // ================= MÉTAMORPHIQUES =================
  {
    id: "gneiss", nom: "Gneiss", categorie: "metamorphique", sousType: "haut grade, folié",
    swatch: "#9a8f86", densite: 2700,
    description: "Roche à rubans, formée en profondeur par transformation de granites ou de sédiments. Les gneiss icartiens de La Hague, âgés de 2 milliards d'années, figurent parmi les plus anciennes roches de la France métropolitaine ; le Massif central et les massifs cristallins alpins en sont largement constitués.",
    mineralogie: "Des lits clairs et sombres alternent : la roche associe quartz, feldspaths et micas, comme un granite.",
    varietes: [
      { nom: "orthogneiss", note: "dérivé d'un granite (protolithe magmatique)." },
      { nom: "paragneiss", note: "dérivé d'un sédiment (protolithe détritique)." },
      { nom: "gneiss œillé", note: "à gros « yeux » de feldspath étirés (anciens phénocristaux)." },
      { nom: "kinzigite", note: "paragneiss de haut grade à grenat et sillimanite." },
      { nom: "métaplutonite", note: "toute roche plutonique (granite, diorite, gabbro) transformée par le métamorphisme ; les orthogneiss en constituent la forme la plus répandue." }
    ],
    regions: [
      { nom: "La Hague (gneiss icartiens, ~2 Ga)", lat: 49.68, lng: -1.88 },
      { nom: "Haut-Allier (Massif central)", lat: 45.05, lng: 3.65 },
      { nom: "Belledonne / Pelvoux", lat: 45.10, lng: 6.05 },
      { nom: "Léon (Bretagne)", lat: 48.57, lng: -4.35 },
    ],
    ages: [
      { de: 2200, a: 1800, label: "Gneiss icartiens : La Hague" },
      { de: 450, a: 300, label: "Métamorphisme varisque (Massif central, massifs cristallins)" },
    ],
    alteration: {
      vmin: 0.001, vmax: 0.02, facilite: 2,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00118, cas: "dissolution seule : petits bassins français sur gneiss et micaschistes, sous forêt (Limousin, Montagne Noire, Rouergue, Margeride, Écrins)", src: "Meybeck 1987, tableau 2C, classe « gneiss » : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,7", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2C : ruisseaux français ne drainant qu'une roche, sous forêt ; la classe « gneiss » comprend les micaschistes, note 8 ; écoulement médian 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "Hydrolyse des feldspaths et des micas, avec quartz résiduel, comme dans le granite. La foliation, toutefois, ménage des plans de faiblesse : l'eau s'y glisse, la roche se fend en plaquettes, puis s'arénise.",
      climat: "Sous forêt, les ruisseaux français qui drainent gneiss et micaschistes transportent en solution 0,12 mm de roche par 100 ans, à peu près autant que sur granite (0,11 mm) ; l'eau y est surtout chargée de sodium et de silice. Le litage oriente toutefois la désagrégation : la roche se débite en plaquettes puis en arène micacée, plus vite qu'elle ne se dissout. Aucune mesure de ce front n'est publiée en France.",
    },
    produits: { sable: 300, limon: 70, argile: 380, oxydes: 30, dissous: 220 },
    produitsNote: "Bilan presque identique à celui du granite : sable quartzo-feldspathique, kaolinite et illite, ions en solution. Les arènes gneissiques du Massif central portent forêts et pâtures acides.",
    usages: "Moellons, lauzes (couvertures traditionnelles), granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Gneiss",
  },
  {
    id: "micaschiste", nom: "Micaschiste", categorie: "metamorphique", sousType: "grade moyen, folié",
    swatch: "#8f8a75", densite: 2750,
    description: "Roche brillante et riche en micas, fruit de la transformation d'anciennes argiles et boues marines : elle se débite en feuillets ondulés. Exemples : les schistes cévenols (faïsses et terrasses), ainsi que l'île de Groix, célèbre pour ses glaucophanites bleues.",
    mineralogie: "Micas (muscovite, biotite) 30 à 60 %, quartz, ± grenat, staurotide, chlorite.",
    varietes: [
      { nom: "micaschiste à grenat", note: "gros grenats rouges, nés pendant le métamorphisme : on les rencontre dans les Cévennes et les Alpes." },
      { nom: "micaschiste à staurotide", note: "cristaux bruns en croix (macles) : Coray (Finistère) et Baud (Morbihan), les « pierres de croix » bretonnes." },
      { nom: "séricitoschiste", note: "variété fine à séricite dominante, d'aspect presque satiné." },
      { nom: "métapélite", note: "Désigne toute roche métamorphique dérivée d'une argile (pélite), depuis l'ardoise jusqu'au gneiss alumineux ; le micaschiste en représente le type le plus répandu." }
    ],
    regions: [
      { nom: "Cévennes (vallées schisteuses)", lat: 44.20, lng: 3.90 },
      { nom: "Île de Groix", lat: 47.63, lng: -3.45 },
      { nom: "Cap Sizun", lat: 48.06, lng: -4.60 },
    ],
    ages: [{ de: 550, a: 300, label: "Sédiments néoprotérozoïques-paléozoïques métamorphisés au Varisque" }],
    alteration: {
      vmin: 0.005, vmax: 0.03, facilite: 3,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00116, cas: "dissolution seule : sous forêt, sur gneiss et micaschistes, dans quelques petits bassins français (Largentière, Limousin, Bourbonnais, Montagne Noire)", src: "Meybeck 1987, tableau 2C, classe « gneiss », qui comprend les micaschistes : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,75", calcul: "ruisseaux", ref: true },
        { v: 0.0012, cas: "altération chimique seule, à l'origine de l'abaissement : bassin sur schiste du Piedmont du Maryland (États-Unis), voisin de celui de Soldiers Delight", src: "Cleaves et al. 1974, bilan de masse du bassin : 1,2 m par million d'années" }
      ],
      sources: [
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (tableau 2C : ruisseaux français ne drainant qu'une roche, sous forêt ; la classe « gneiss » comprend les micaschistes, note 8 ; écoulement médian 8,5 L/s/km², soit 268 mm par an)",
        "Cleaves E. T., Fisher D. W. et Bricker O. P. (1974), « Chemical weathering of serpentinite in the eastern Piedmont of Maryland », Geological Society of America Bulletin 85 (3) : 437–444 (bilan de masse du bassin de Soldiers Delight, sur serpentinite, et d'un bassin voisin sur schiste ; résumé lu)"
      ],
      mecanisme: "Les micas s'hydrolysent en vermiculite, puis en argiles ; la schistosité accomplit le reste : la roche se délite en plaquettes, forme des éboulis et des sols minces et acides (ranker cévenol), propices au châtaignier.",
      climat: "Sur gneiss et micaschistes, les cours d'eau forestiers français transportent l'équivalent de 0,12 mm de roche en 100 ans. Leur eau, plus riche en potassium que celle du granite, doit ce surplus aux micas (Meybeck ne distingue pas ces familles). Sur un schiste du Piedmont, au Maryland, la dissolution atteint le même rythme, 0,12 mm en 100 ans, et l'arrachement des débris porte le total à 0,24 mm en 100 ans. Les micas s'effeuillent en paillettes, puis la roche se mue en limon micacé luisant.",
    },
    produits: { sable: 150, limon: 200, argile: 450, oxydes: 60, dissous: 140 },
    produitsNote: "Argiles et limons micacés en abondance (ce sont les paillettes qui brillent dans les rivières cévenoles), avec un peu de sable quartzeux provenant des exsudats de quartz.",
    usages: "Lauzes, murets des terrasses cévenoles.",
    wikipedia: "https://fr.wikipedia.org/wiki/Micaschiste",
  },
  {
    id: "ardoise", nom: "Ardoise", categorie: "metamorphique", sousType: "bas grade (anchizone)",
    swatch: "#4d5766", densite: 2780,
    description: "Argiles marines anciennes, cambriennes à ordoviciennes, comprimées au point de se débiter en feuillets parfaits. Angers-Trélazé (Ordovicien, toits bleus de l'Anjou), Fumay (Ardennes) et Travassac (Corrèze), toutes deux cambriennes, ont couvert une grande partie de la France.",
    mineralogie: "Quartz très fin, illite-séricite et chlorite, auxquels s'ajoutent des cubes accessoires de pyrite.",
    varietes: [
      { nom: "phyllade", note: "Terme ardennais désignant un schiste ardoisier au grain un peu plus grossier (Fumay)." },
      { nom: "quartzophyllade", note: "variété plus riche en quartz et moins fissile." },
    ],
    regions: [
      { nom: "Trélazé, Angers", lat: 47.45, lng: -0.49 },
      { nom: "Fumay (Ardennes)", lat: 49.99, lng: 4.70 },
      { nom: "Travassac (Corrèze)", lat: 45.22, lng: 1.55 },
      { nom: "Monts d'Arrée", lat: 48.41, lng: -3.90 },
    ],
    ages: [
      { de: 470, a: 458, label: "Ordovicien moyen : dépôt des schistes d'Angers" },
      { de: 520, a: 490, label: "Cambrien : ardoises de Fumay et de Travassac" },
      { de: 340, a: 325, label: "Schistosité varisque (ardoises d'Anjou)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.03, facilite: 3,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00507, cas: "Prélevée à Wolf Rocks (Catoctin Mountain, Maryland), une phyllite proche du phyllade ardennais ; la valeur est la moyenne de 2 échantillons, érosion incluse.", src: "Portenga et al. 2013, béryllium 10", ref: true }
      ],
      sources: [
        "Portenga E. W., Bierman P. R., Rizzo D. M. et Rood D. H. (2013), « Low rates of bedrock outcrop erosion in the central Appalachian Mountains inferred from in situ ¹⁰Be », Geological Society of America Bulletin 125 (1/2) : 201–215, doi 10.1130/B30559.1 (tableau 1 : affleurements de la province des Blue Ridge, Maryland, Virginie, Pennsylvanie)"
      ],
      mecanisme: "Le long des plans d'ardoise, la roche se délite sous l'action du gel et des racines ; la pyrite s'oxyde (taches de rouille) et les chlorites s'hydrolysent lentement.",
      climat: "Aucune mesure ne concerne les ardoisières françaises. Un affleurement de phyllite des Appalaches (Maryland), proche des phyllades ardennais, affiche 0,5 mm en 100 ans au béryllium 10, un chiffre identique à celui des quartzites voisins. Les crassiers ardoisiers, dont la surface s'étend avec le débit en feuillets, se couvrent d'efflorescences blanches en quelques années.",
    },
    produits: { sable: 50, limon: 350, argile: 500, oxydes: 50, dissous: 50 },
    produitsNote: "L'essentiel redevient argile et limon fin ; les débris plats (« clapiers » d'ardoisières) prennent des siècles à disparaître.",
    usages: "Ardoises de couverture, dallages et, autrefois, tableaux d'écoliers.",
    wikipedia: "https://fr.wikipedia.org/wiki/Ardoise",
  },
  {
    id: "quartzite", nom: "Quartzite", categorie: "metamorphique", sousType: "quartzeux massif",
    swatch: "#cfc9c2", densite: 2650,
    description: "Quartz recristallisé et soudé : c'est le grès le plus dur du pays, qui dresse les crêtes des Monts d'Arrée, les sommets blancs du Briançonnais et les échines du Massif armoricain.",
    mineralogie: "Quartz > 95 %, ± séricite, oxydes.",
    varietes: [
      { nom: "quartzite blanc (laiteux)", note: "quasi pur, dépourvu de mica comme d'oxyde : le plus résistant de la série." },
      { nom: "quartzite ferrugineux", note: "teinte rouge brun due à des oxydes de fer, hérités du grès d'origine." },
      { nom: "quartzite micacé (à séricite)", note: "subsistance de paillettes de mica le long des plans de schistosité." },
    ],
    regions: [
      { nom: "Roc'h Ruz, Monts d'Arrée", lat: 48.41, lng: -3.88 },
      { nom: "Quartzites du Briançonnais (Trias)", lat: 44.90, lng: 6.60 },
      { nom: "Crêtes de La Châtaigneraie (Vendée)", lat: 46.65, lng: -0.76 },
    ],
    ages: [
      { de: 478, a: 470, label: "Ordovicien : grès armoricain quartzitique" },
      { de: 251.9, a: 247.0, label: "Trias inférieur (Werfénien) : quartzites du Briançonnais" },
    ],
    alteration: {
      vmin: 0.0001, vmax: 0.002, facilite: 1,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.001, cas: "Raven Rock (South Mountain, Maryland) présente le quartzite le plus lent des 15 affleurements étudiés, sous climat tempéré humide.", src: "Portenga et al. 2013, béryllium 10, abaissement érosion comprise" },
        { v: 0.004, cas: "Pour les 15 affleurements de quartzite des Appalaches (Maryland, Virginie, Pennsylvanie), la valeur médiane d'abaissement, érosion comprise.", src: "Portenga et al. 2013, béryllium 10 ; médiane calculée par l'atlas sur leur tableau 1", ref: true },
        { v: 0.0153, cas: "quartzite le plus rapide des 15 : Pole Steeple, Michaux (Pennsylvanie), où des dalles entières se détachent.", src: "Portenga et al. 2013, béryllium 10, abaissement érosion comprise" }
      ],
      sources: [
        "Portenga E. W., Bierman P. R., Rizzo D. M. et Rood D. H. (2013), « Low rates of bedrock outcrop erosion in the central Appalachian Mountains inferred from in situ ¹⁰Be », Geological Society of America Bulletin 125 (1/2) : 201–215, doi 10.1130/B30559.1 (tableau 1 : affleurements de la province des Blue Ridge, Maryland, Virginie, Pennsylvanie)"
      ],
      mecanisme: "Le quartz est presque insoluble, et il n'existe rien d'autre à attaquer : seule la fracturation par le gel détache des blocs. Les pierriers des Monts d'Arrée datent des périodes glaciaires et ont peu bougé depuis.",
      climat: "Sur 15 affleurements de quartzite des Appalaches (Maryland, Virginie, Pennsylvanie), mesurés au béryllium 10, l'abaissement médian atteint 0,4 mm en 100 ans. Il varie de 0,1 mm (Raven Rock) à 1,5 mm (Pole Steeple, où des dalles entières se détachent). Les grès voisins s'usent plus vite. Le quartz se dissout à peine : c'est par blocs entiers que la roche recule.",
    },
    produits: { sable: 930, limon: 40, argile: 15, oxydes: 5, dissous: 10 },
    produitsNote: "Sable quartzeux à près de 100 %, mais dégradé si lentement que le quartzite forme des crêtes plutôt que des sols. Sur les affleurements, les sols restent squelettiques et la lande occupe la place de la forêt.",
    usages: "Ballast, enrochements, pavés (très durables).",
    wikipedia: "https://fr.wikipedia.org/wiki/Quartzite",
  },
  {
    id: "marbre", nom: "Marbre", categorie: "metamorphique", sousType: "carbonaté recristallisé",
    swatch: "#e6e3df", densite: 2700,
    description: "Calcaire recristallisé après cuisson, formé d'une mosaïque de calcite. Les Pyrénées en livrent de célèbres : le blanc de Saint-Béat, statuaire depuis Rome, et la griotte de Campan ; la Montagne Noire fournit le rouge de Caunes-Minervois, employé pour les colonnes de Versailles.",
    mineralogie: "Calcite > 95 %, ± dolomite ; veines colorées = oxydes, serpentines, graphite.",
    varietes: [
      { nom: "cipolin", note: "marbre rubané dont les lits verdâtres doivent leur couleur aux silicates (mica, chlorite)." },
      { nom: "ophicalcite", note: "marbre vert bréchique à serpentine, recherché pour la décoration." },
      { nom: "griotte", note: "marbre au sens commercial : calcaire noduleux rouge du Dévonien supérieur, à goniatites, à peine recristallisé (Caunes-Minervois, Campan)." },
    ],
    regions: [
      { nom: "Saint-Béat (Haute-Garonne)", lat: 42.91, lng: 0.69 },
      { nom: "Caunes-Minervois (marbre rouge)", lat: 43.32, lng: 2.53 },
      { nom: "Marbre rose de Guillestre (calcaire noduleux, marbre au sens commercial)", lat: 44.66, lng: 6.65 },
    ],
    ages: [
      { de: 110, a: 85, label: "Métamorphisme pyrénéen (Crétacé)" },
      { de: 360, a: 300, label: "Métamorphisme varisque" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.04, facilite: 3,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.013, cas: "plaine (Paris : 668 mm de pluie, dont 165 mm infiltrés)", src: "dissolution à saturation, masse volumique 2,7", calcul: "carbonate" },
        { v: 0.0453, cas: "montagne très arrosée : Aigoual, avec 1 041 mm de pluie dont 575 mm s'infiltrent", src: "dissolution à saturation, masse volumique 2,7", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020",
        "Roberts S. M. (2002), « Using marble tombstones to measure weathering rates: new data and new constraints », GSA Abstracts with Programs 34 (6) : 89"
      ],
      mecanisme: "La calcite se dissout comme dans un calcaire, mais plus lentement, la roche étant compacte et peu poreuse. Sous la pluie, une inscription gravée s'efface en quelques siècles.",
      climat: "Aucune mesure n'a été publiée sur un affleurement français. Le calcul fournit 1,3 mm en 100 ans en plaine et 4,5 mm en montagne arrosée, les marbres français étant surtout pyrénéens et alpins. Les pierres tombales du Montana et du Canada, plus de mille, montrent une perte nulle en campagne sèche et d'environ 5 mm en 110 ans en ville humide, où les pluies acides chargées de SO₂ industriel ont hâté l'usure.",
    },
    produits: { sable: 3, limon: 8, argile: 15, oxydes: 4, dissous: 970 },
    produitsNote: "Comme pour le calcaire, environ 97 % passent en solution ; un résidu infime colore les fissures en ocre.",
    usages: "Sculpture, placages, chaux de luxe.",
    wikipedia: "https://fr.wikipedia.org/wiki/Marbre",
  },
  {
    id: "serpentinite", nom: "Serpentinite", categorie: "metamorphique", sousType: "ultrabasique hydratée",
    swatch: "#5f7d64", densite: 2600,
    description: "Verte et luisante, la « roche serpent » est une péridotite océanique hydratée aux marbrures d'écailles de reptile. On la voit en surfaces polies dans les ophiolites du Queyras, du Cap Corse et de quelques massifs limousins.",
    mineralogie: "Serpentines (lizardite et chrysotile ; antigorite dans les serpentinites recristallisées en profondeur, comme au Queyras) 80 à 95 %, magnétite, ± reliques d'olivine.",
    varietes: [
      { nom: "listvénite", note: "serpentinite entièrement carbonatée par des fluides riches en CO₂ : quartz et carbonates (magnésite, dolomite), souvent avec un mica vert au chrome (fuchsite) ; le stade intermédiaire, à talc et carbonate, donne la pierre ollaire." },
      { nom: "talcschiste (stéatite)", note: "talc pur et tendre issu de la serpentinite : la pierre de savon." },
      { nom: "birbirite", note: "serpentinite altérée sous climat tropical en silice et oxydes de fer, pouvant contenir du platine ; son nom vient de la rivière Birbir (Éthiopie)." }
    ],
    regions: [
      { nom: "Queyras (Saint-Véran, col Agnel)", lat: 44.68, lng: 6.87 },
      { nom: "Cap Corse", lat: 42.85, lng: 9.40 },
      { nom: "Défilé de l'Inzecca (Fium'Orbu)", lat: 42.06, lng: 9.29 },
      { nom: "La Roche-l'Abeille (Limousin)", lat: 45.60, lng: 1.24 },
    ],
    ages: [
      { de: 165, a: 150, label: "Océan alpin (ophiolites du Queyras, de Corse)" },
      { de: 500, a: 340, label: "Ophiolites varisques (Limousin)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.05, facilite: 3,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0022, cas: "bassin de Soldiers Delight, Piedmont du Maryland (États-Unis) : c'est l'altération chimique qui assure presque tout l'abaissement.", src: "Cleaves et al. 1974, bilan de masse du bassin : 2,2 m par million d'années" },
        { v: 0.00401, cas: "dissolution seule : deux ruisseaux sous forêt sur serpentinite du Piémont alpin", src: "Meybeck 1986, tableau 11 : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,6", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)",
        "Cleaves E. T., Fisher D. W. et Bricker O. P. (1974), « Chemical weathering of serpentinite in the eastern Piedmont of Maryland », Geological Society of America Bulletin 85 (3) : 437–444 (bilan de masse du bassin de Soldiers Delight, sur serpentinite, et d'un bassin voisin sur schiste ; résumé lu)"
      ],
      mecanisme: "La serpentine s'hydrolyse en libérant beaucoup de magnésium et de silice ; la magnétite subsiste et donne des sols sombres. Ces sols sont toxiques pour de nombreuses plantes (nickel, chrome, déséquilibre entre calcium et magnésium) : ils abritent une flore « serpentinicole » unique.",
      climat: "L'eau des ruisseaux sur serpentinite est dix fois plus chargée qu'avec le granite, surtout en magnésium. Deux ruisseaux du Piémont alpin entraînent 0,40 mm de roche en 100 ans (calcul au même écoulement que pour les autres roches) ; le bassin de Soldiers Delight, dans le Maryland, indique 0,22 mm en 100 ans par altération chimique. La magnétite demeure et fonce la surface ; les sols, riches en nickel et chrome, pauvres en calcium, accueillent une flore endémique.",
    },
    produits: { sable: 0, limon: 70, argile: 350, oxydes: 180, dissous: 400 },
    produitsNote: "Des ions Mg²⁺ et de la silice en solution, des argiles magnésiennes (smectites, talc), des oxydes de fer : un sol rare, qui a donné naissance à des « déserts verts » botaniques.",
    usages: "Pierre ornementale (« marbre vert »), pierre ollaire (poêles).",
    wikipedia: "https://fr.wikipedia.org/wiki/Serpentinite",
  },
  {
    id: "amphibolite", nom: "Amphibolite", categorie: "metamorphique", sousType: "grade moyen à élevé (roche basique)",
    swatch: "#3a4a3a", densite: 3000,
    codes: [
      { code: "δ", sens: " amphibolites (feuilles du Massif central, complexes leptyno-amphiboliques λ-δ) ; à distinguer des dolérites δ d'autres feuilles" },
    ],
    description: "Roche sombre, vert-noir, composée d'amphibole et de plagioclase : elle résulte du recuit en profondeur d'un basalte ou d'un gabbro. C'est le stade « chaud » du métamorphisme des roches basiques (faciès amphibolite), fréquent dans le socle du Massif central et du Limousin.",
    mineralogie: "Hornblende (amphibole) et plagioclase, avec parfois grenat, épidote ou quartz ; souvent foliée.",
    mineraux: [["hornblende", 60], ["plagioclases", 25], ["grenat", 5], ["epidote", 4], ["quartz", 3], ["titanite", 3]],
    argiles: ["smectites", "vermiculite", "chlorite"],
    argilesNote: "Au cours de l'altération, la hornblende donne des smectites et de la vermiculite, comme dans le gabbro dont elle provient souvent.",
    regions: [
      { nom: "Complexe leptynite-amphibolite du Limousin", lat: 45.75, lng: 1.50 },
      { nom: "Haut-Allier (gorges de l'Allier, de Langeac à Prades)", lat: 45.07, lng: 3.54 },
    ],
    ages: [{ de: 450, a: 340, label: "Métamorphisme varisque (protolithe plus ancien)" }],
    alteration: {
      vmin: 0.005, vmax: 0.03, facilite: 3,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.0032, cas: "dissolution seule : ruisseaux sous forêt sur amphibolites et prasinites (Écrins, Piémont alpin ; 3 analyses)", src: "Meybeck 1986, tableau 11 : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 3,0", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "Amphiboles et plagioclases s'hydrolysent en chlorite et smectites, accompagnés d'oxydes de fer ; le quartz étant peu abondant, les sables sont rares.",
      climat: "Sur amphibolite, les ruisseaux portent dix fois plus de calcium que sur granite (85 % des cations) : 0,32 mm de roche sont dissous en 100 ans, soit trois fois le granite (0,11 mm). La hornblende se colore en brun (chlorite, goethite) et la roche engendre des sols bruns épais.",
    },
    produits: { sable: 30, limon: 80, argile: 440, oxydes: 110, dissous: 340 },
    produitsNote: "Argiles (smectites, vermiculites) : 440 g ; oxydes de fer : 110 g ; ions calciques et magnésiens : 340 g.",
    usages: "Granulats très résistants (ballast), pierre.",
    wikipedia: "https://fr.wikipedia.org/wiki/Amphibolite",
    varietes: [{ nom: "Ortho-amphibolite", note: "dont le protolithe est un basalte, une dolérite (métadolérite) ou un gabbro." }, { nom: "Para-amphibolite", note: "formée à partir d'une marne ou d'un sédiment calcaro-argileux." }, { nom: "Amphibolite à grenat", note: "de provenance plus profonde ; une éclogite remontée peut également lui donner naissance." }],
  },
  {
    id: "eclogite", nom: "Éclogite", categorie: "metamorphique", sousType: "haute pression (roche basique)",
    swatch: "#55604a", densite: 3500,
    codes: [
      { code: "ε", sens: " éclogites et roches apparentées (par exemple les massifs du Limousin et de la Vendée)" },
    ],
    description: "Né d'un basalte enfoui à plus de 50 km dans une subduction, sous très haute pression, l'éclogite est la roche métamorphique la plus frappante : omphacite verte et grenat rouge sang. Sa densité (3,5 contre 3,0 pour le basalte) alourdit la croûte qui plonge et renforce la traction de la plaque dans le manteau.",
    mineralogie: "Omphacite (clinopyroxène vert) et grenat pyrope-almandin, rouge ; on y ajoute parfois disthène, rutile et coésite, signe de l'ultra-haute pression.",
    mineraux: [["omphacite", 48.5], ["grenat", 35], ["rutile", 1.5], ["disthene", 5], ["quartz", 5], ["amphiboles", 5]],
    argiles: ["smectites"],
    argilesNote: "À l'air, l'omphacite s'argilise en smectites et oxydes de fer, tandis que le grenat, résistant, s'égrène en sables lourds rouges : le minéral-index survit à sa roche.",
    regions: [
      { nom: "Monts du Lyonnais / Massif central", lat: 45.65, lng: 4.45 },
      { nom: "Île de Groix", lat: 47.63, lng: -3.46 },
      { nom: "Les Essarts (Vendée)", lat: 46.77, lng: -1.23 },
    ],
    ages: [{ de: 390, a: 350, label: "Subduction varisque (Najac ≈ 383 Ma, Lévézou ≈ 358 Ma)" }],
    alteration: {
      facilite: 4,
      mecanisme: "Formée à très haute pression, elle est loin de l'équilibre en surface, mais elle s'altère directement : l'omphacite s'hydrolyse en smectites et oxydes de fer, le grenat résiste. Sa transformation en amphibolite s'est faite bien avant, en profondeur, pendant la remontée.",
    },
    produits: { sable: 60, limon: 80, argile: 400, oxydes: 140, dissous: 320 },
    produitsNote: "Un sable résiduel où brillent les grenats se forme aux dépens de 400 g d'argiles et de 140 g d'oxydes : le minéral-index survit à la roche qui l'a porté.",
    usages: "Intérêt scientifique majeur (subduction) ; parfois pierre ornementale.",
    wikipedia: "https://fr.wikipedia.org/wiki/%C3%89clogite",
    varietes: [{ nom: "Éclogite à disthène", note: "contient aussi du disthène : riche en aluminium." }, { nom: "Éclogite à coésite", note: "renferme de la coésite, silice qui ne se forme qu'au-delà de 2,5 GPa environ, c'est-à-dire à plus de 80 km de profondeur." }, { nom: "Éclogite rétromorphosée", note: "éclogite remontée à la surface, partiellement transformée en amphibolite à grenat." }],
  },
  {
    id: "migmatite", nom: "Migmatite", categorie: "metamorphique", sousType: "très haut grade (anatexie)",
    swatch: "#b09098", densite: 2700,
    codes: [
      { code: "ζγ", sens: " anatexites et migmatites : notation ζγ ou γζ selon la proportion de fusion" },
    ],
    description: "Roche située à la frontière entre métamorphisme et magmatisme : un gneiss chauffé à l'extrême commence à fondre en partie. Le liquide forme des lits clairs granitiques (leucosome), tandis que des lits sombres résiduels (mélanosome) se plissent souvent en volutes. Le Massif central en est tissé.",
    mineralogie: "Leucosome quartzo-feldspathique issu de la fusion recristallisée, mélanosome riche en biotite, sillimanite et grenat ; plis ptygmatiques.",
    mineraux: [["quartz", 30], ["orthose", 25], ["plagioclases", 20], ["biotite", 15], ["sillimanite", 5], ["cordierite", 5]],
    argiles: ["kaolinite", "illite", "vermiculite"],
    argilesNote: "Bilan granito-gneissique : les leucosomes donnent kaolinite et illite, les lits à biotite donnent de la vermiculite.",
    varietes: [
      { nom: "embréchite", note: "migmatite conservant la structure du gneiss d'origine." },
      { nom: "anatexite / diatexite", note: "fusion plus poussée, structure effacée : la roche tend vers le granite d'anatexie." },
    ],
    regions: [
      { nom: "Massif central (Velay, Lot)", lat: 45.00, lng: 3.80 },
      { nom: "Anatexie cadomienne (Saint-Malo)", lat: 48.60, lng: -2.00 },
    ],
    ages: [
      { de: 385, a: 300, label: "Anatexie varisque : dévonienne (Limousin, ≈ 380 Ma) puis carbonifère (Velay, ≈ 305 Ma)" },
      { de: 580, a: 540, label: "Anatexie cadomienne (Saint-Malo, fin du Néoprotérozoïque)" },
    ],
    alteration: {
      vmin: 0.001, vmax: 0.02, facilite: 2,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00112, cas: "dissolution seule : ruisseaux français à eaux sodiques, sous forêt, sur granites, gneiss et micaschistes (20 massifs, migmatites des Pyrénées comprises)", src: "Meybeck 1986, tableau 11, classe « granite, gneiss, micaschistes alcalins » : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,7", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "Comme dans un gneiss ou un granite, les feldspaths et les micas s'hydrolysent et le quartz subsiste ; la foliation dicte le sens du débitage.",
      climat: "Sous forêt, les ruisseaux qui drainent granites, gneiss et micaschistes à eaux sodiques (migmatites des Pyrénées comprises) entraînent 0,11 mm de roche par 100 ans. Leucosomes clairs et mélanosomes à biotite s'altèrent à des vitesses différentes : le rubanement ressort en relief sur les surfaces altérées.",
    },
    produits: { sable: 300, limon: 70, argile: 380, oxydes: 30, dissous: 220 },
    produitsNote: "300 g de sable et 380 g d'argiles, comme pour un granite ; les lits sombres, riches en biotite, ajoutent un surcroît de vermiculite.",
    usages: "Granulats, pierre.",
    wikipedia: "https://fr.wikipedia.org/wiki/Migmatite",
  },
  {
    id: "leptynite", nom: "Leptynite", categorie: "metamorphique", sousType: "grade élevé, leucocrate",
    swatch: "#d2ccc4", densite: 2650,
    codes: [
      { code: "λ", sens: " leptynites (ex. complexes leptyno-amphiboliques λ-δ du Massif central)" },
    ],
    description: "Gneiss clair et fin, presque sans minéraux sombres, constitué surtout de quartz et de feldspath. Associé aux amphibolites foncées, il forme les « complexes leptynite-amphibolite » du socle français (Vendée, Limousin).",
    mineralogie: "Grain fin et litage discret : le quartz et les feldspaths dominent, la biotite est très rare ; grenat, disthène ou sillimanite apparaissent parfois.",
    mineraux: [["quartz", 35], ["orthose", 30], ["plagioclases", 20], ["muscovite", 7], ["biotite", 5], ["grenat", 3]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Peu micacée, quartzo-feldspathique et pâle : elle donne kaolinite et illite claires, avec un profil d'aplite.",
    varietes: [
      { nom: "halleflinta", note: "leptynite à grain très fin, d'aspect corné." },
    ],
    regions: [
      { nom: "Complexe leptynite-amphibolite de Vendée", lat: 46.75, lng: -1.20 },
      { nom: "Limousin", lat: 45.80, lng: 1.55 },
    ],
    ages: [{ de: 480, a: 350, label: "Métamorphisme varisque (protolithe ordovicien)" }],
    alteration: {
      facilite: 2,
      mecanisme: "Lente hydrolyse des feldspaths (micas peu nombreux, grain serré) qui donne kaolinite et sable quartzo-feldspathique.",
    },
    produits: { sable: 350, limon: 60, argile: 360, oxydes: 20, dissous: 210 },
    produitsNote: "≈ 350 g de sable clair et 360 g d'argiles pâles : bilan d'une aplite, à l'image de la teinte de la roche.",
    usages: "Granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Leptynite",
  },
  {
    id: "granulite_meta", nom: "Granulite (faciès granulite)", categorie: "metamorphique", sousType: "très haut grade (sec)",
    swatch: "#a89890", densite: 2850,
    codes: [
      { code: "⚠ γ2 (anciennes cartes)", sens: " piège ancien : « granulite » (γ2) désignait sur les vieilles cartes françaises un leucogranite à deux micas ; les vraies granulites figurent au libellé des gneiss (ζ)" },
    ],
    description: "Métamorphisme le plus chaud et le plus sec de la croûte profonde (> 750 °C) : les micas hydratés cèdent la place à l'orthopyroxène et au grenat. En France, le terme a aussi longtemps désigné un leucogranite à muscovite, d'où une confusion fréquente.",
    mineralogie: "Grenat et orthopyroxène accompagnent quartz et feldspaths (± disthène, sillimanite) ; roche massive, à foliation peu marquée.",
    mineraux: [["orthose", 30], ["quartz", 25], ["plagioclases", 20], ["grenat", 10], ["enstatite", 10], ["sillimanite", 5]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Bilan granitique ralenti : la roche anhydre s'ouvre peu, mais feldspaths et hypersthène aboutissent à de la kaolinite et de l'illite teintées de fauve.",
    varietes: [
      { nom: "charnockite", note: "granite à orthopyroxène du faciès granulite (voir la fiche des roches magmatiques)." },
      { nom: "kinzigite / khondalite", note: "granulites alumineuses à grenat-sillimanite (métasédiments)." },
    ],
    ages: [{ de: 450, a: 340, label: "Métamorphisme varisque de la croûte profonde" }],
    alteration: {
      facilite: 2,
      mecanisme: "Comme un gneiss dense : hydrolyse des feldspaths, l'orthopyroxène donnant des argiles et des oxydes de fer.",
    },
    produits: { sable: 320, limon: 60, argile: 370, oxydes: 40, dissous: 210 },
    produitsNote: "L'hypersthène rouille en fauve, signe des anciennes surfaces granulitiques, pour 370 g d'argiles et 320 g de sable quartzo-feldspathique.",
    usages: "Granulats, pierre.",
    wikipedia: "https://fr.wikipedia.org/wiki/Granulite",
  },
  {
    id: "schiste_bleu", nom: "Schiste bleu", categorie: "metamorphique", sousType: "haute pression, basse température",
    swatch: "#4a5a8a", densite: 3100,
    codes: [
      { code: "notation locale", sens: " « schistes lustrés à glaucophane » de la Corse alpine et des Alpes occidentales ; chaque unité tectonique est notée à part, et le libellé donne le faciès" },
    ],
    description: "Roche bleue des subductions : basalte ou pélite métamorphisés sous haute pression, à basse température, lors d'une plongée rapide et froide. La couleur lavande vient du glaucophane, amphibole sodique. L'île de Groix en constitue le musée français en plein air.",
    mineralogie: "Glaucophane (amphibole bleue), épidote ou lawsonite, grenat, ± phengite ; foliation nette, aspect lustré.",
    mineraux: [["glaucophane", 40], ["epidote", 15], ["muscovite", 15], ["chlorite_m", 10], ["grenat", 8], ["lawsonite", 7], ["quartz", 5]],
    argiles: ["chlorite", "smectites"],
    argilesNote: "Le glaucophane s'altère en smectites et oxydes de fer et perd sa couleur bleue ; la chlorite héritée passe à la vermiculite, épidote et lawsonite aux smectites calciques.",
    regions: [
      { nom: "Île de Groix (Morbihan)", lat: 47.63, lng: -3.46 },
      { nom: "Queyras (schistes lustrés à glaucophane)", lat: 44.72, lng: 6.80 },
    ],
    ages: [
      { de: 370, a: 350, label: "Subduction varisque (Groix)" },
      { de: 62, a: 45, label: "Subduction alpine (Queyras)" },
    ],
    alteration: {
      facilite: 3,
      mecanisme: "Glaucophane, épidote et lawsonite s'hydrolysent en smectites et oxydes de fer. Beaucoup d'affleurements ont déjà viré en partie au schiste vert (chlorite, albite) pendant la remontée, en profondeur.",
    },
    produits: { sable: 60, limon: 150, argile: 430, oxydes: 110, dissous: 250 },
    produitsNote: "Argiles (chlorite, smectites) pour ≈ 430 g, oxydes pour 110 g : la couleur bleue, premier témoin de la subduction, disparaît en premier.",
    usages: "Intérêt scientifique (subduction) ; peu exploitée.",
    wikipedia: "https://fr.wikipedia.org/wiki/Schiste_bleu",
    varietes: [{ nom: "Glaucophanite", note: "roche faite surtout de glaucophane, l'amphibole bleue." }, { nom: "Schiste bleu à lawsonite", note: "variante plus froide, où la lawsonite remplace l'épidote." }, { nom: "Schiste bleu à épidote", note: "légèrement plus chaud, à la transition vers les faciès schiste vert ou éclogite." }],
  },
  {
    id: "schiste_vert", nom: "Schiste vert", categorie: "metamorphique", sousType: "bas grade (faciès schistes verts)",
    swatch: "#5a7a5a", densite: 2900,
    codes: [
      { code: "notation locale", sens: " classés unité par unité (schistes lustrés, « roches vertes » armoricaines ou alpines) : le faciès schiste vert figure dans le libellé" },
    ],
    description: "Premier stade bien visible du métamorphisme des roches basiques, après les faciès discrets à zéolites et à prehnite-pumpellyite : un basalte ou un tuf recuit à basse température verdit, la chlorite, l'actinote et l'épidote le colorant. Les zones internes des Alpes (schistes verts) et le socle hercynien en portent de vastes affleurements.",
    mineralogie: "Chlorite, actinote (amphibole verte), épidote et albite, ± quartz et calcite ; foliation et aspect satiné.",
    mineraux: [["chlorite_m", 30], ["actinote", 25], ["albite", 20], ["epidote", 15], ["quartz", 7], ["titanite", 3]],
    argiles: ["chlorite", "smectites", "vermiculite"],
    argilesNote: "La chlorite est là dès le départ : l'altération la convertit en vermiculite et en smectites, si bien que la roche verte devient un sol brun banal.",
    varietes: [
      { nom: "prasinite", note: "schiste vert massif dérivé d'une roche basique." },
      { nom: "chloritoschiste", note: "très riche en chlorite, tendre et onctueuse." },
      { nom: "ovardite", note: "prasinite albitique des Alpes." },
      { nom: "métavolcanite", note: "Toute roche volcanique (lave ou tuf) transformée par le métamorphisme ; au faciès schiste vert, basaltes et tufs prennent cette couleur." }
    ],
    regions: [
      { nom: "Zones internes des Alpes (Vanoise, Queyras)", lat: 45.40, lng: 6.80 },
      { nom: "Unité de Génis (Dordogne et Corrèze)", lat: 45.33, lng: 1.17 },
    ],
    ages: [
      { de: 360, a: 300, label: "Métamorphisme varisque" },
      { de: 45, a: 30, label: "Métamorphisme alpin (schistes verts des zones internes)" },
    ],
    alteration: {
      vmin: 0.005, vmax: 0.03, facilite: 3,
      // D.8.6 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.00331, cas: "Ruisseaux forestiers : 3 analyses, deux sur amphibolites des Écrins, une sur prasinites du Piémont alpin, schistes verts des ophiolites ; dissolution seule.", src: "Meybeck 1986, tableau 11 : silice et cations des ruisseaux, 268 mm d'écoulement par an, masse volumique 2,9", calcul: "ruisseaux", ref: true }
      ],
      sources: [
        "Meybeck M. (1986), « Composition chimique des ruisseaux non pollués en France », Sciences Géologiques, Bulletin 39 (1) : 3–77 (tableau 11 : médianes corrigées des apports de la pluie ; lu sur Persée)",
        "Meybeck M. (1987), « Global chemical weathering of surficial rocks estimated from river dissolved loads », American Journal of Science 287 : 401–428 (écoulement médian des petits bassins français : 8,5 L/s/km², soit 268 mm par an)"
      ],
      mecanisme: "La chlorite et l'albite se transforment en smectites et oxydes de fer ; l'épidote et l'actinote résistent un peu mieux.",
      climat: "Les prasinites (schistes verts des ophiolites alpines) et les amphibolites fournissent une eau dix fois plus chargée que celle du granite, surtout en calcium : 0,33 mm de roche passent en solution en 100 ans. Chlorite et actinote, déjà hydratées, glissent vers les smectites ; les « roches vertes » dessinent des croupes douces sous les prairies.",
    },
    produits: { sable: 40, limon: 150, argile: 450, oxydes: 100, dissous: 260 },
    produitsNote: "Environ 450 g d'argiles vertes puis brunes et 100 g d'oxydes : la prasinite aboutit à un sol brun ordinaire, à l'inverse de sa genèse.",
    usages: "Granulats, dallage (« pierre verte »).",
    wikipedia: "https://fr.wikipedia.org/wiki/Schiste_vert",
  },
  {
    id: "corneenne", nom: "Cornéenne (hornfels)", categorie: "metamorphique", sousType: "contact",
    swatch: "#5a5048", densite: 2750,
    codes: [
      { code: "surcharge", sens: " l'auréole de contact apparaît sous forme de trame superposée à l'encaissant autour du granite, sans code particulier" },
    ],
    description: "Roche « cuite » au contact d'un granite : une intrusion chaude traverse des roches, souvent argileuses, et les recristallise sur quelques centaines de mètres (auréole de contact). Dure, compacte, à grain fin, elle a une cassure esquilleuse d'aspect corné, d'où son nom de cornéenne (en allemand Hornfels, « roche de corne ») ; elle sonne clair sous le marteau.",
    mineralogie: "Recristallisation selon le matériau d'origine : cordiérite, andalousite, biotite, quartz (issus des argiles) ; texture serrée et non foliée, en mosaïque.",
    mineraux: [["quartz", 30], ["biotite", 20], ["andalousite", 15], ["cordierite", 15], ["plagioclases", 12], ["muscovite", 8]],
    argiles: ["illite", "kaolinite", "vermiculite"],
    argilesNote: "Très lente à s'ouvrir ; à long terme, la cordiérite donne des produits chloriteux (pinite), l'illite provient des micas, la kaolinite des feldspaths.",
    regions: [
      { nom: "Auréole du Sidobre (Tarn)", lat: 43.62, lng: 2.40 },
      { nom: "Auréoles des granites bretons", lat: 48.30, lng: -3.60 },
    ],
    ages: [{ de: 340, a: 290, label: "Contact des granites hercyniens" }],
    alteration: {
      facilite: 2,
      mecanisme: "Dense et peu poreuse, cette roche s'altère lentement ; les silicates néoformés (cordiérite, andalousite) se transforment en argiles.",
    },
    produits: { sable: 400, limon: 150, argile: 350, oxydes: 40, dissous: 60 },
    produitsNote: "Les gravillons anguleux, presque intacts (400 g), se détachent d'abord ; les argiles (350 g) n'apparaissent qu'après une fragmentation mécanique complète.",
    usages: "Granulats très résistants, empierrement.",
    wikipedia: "https://fr.wikipedia.org/wiki/Corn%C3%A9enne",
    varietes: [{ nom: "Schiste tacheté", note: "premier palier, loin du contact : taches de cordiérite ou d'andalousite au sein d'un schiste qui garde sa foliation." }, { nom: "Cornéenne à chiastolite", note: "andalousite en cristaux, dont une section révèle une croix sombre." }, { nom: "Sanidinite", note: "au contact de coulées ou de magmas basaltiques, une cornéenne atteint une température très élevée." }],
  },
  {
    id: "skarn", nom: "Skarn", categorie: "metamorphique", sousType: "métasomatique de contact",
    swatch: "#7a6a44", densite: 3100,
    codes: [
      { code: "—", sens: " indices ponctuels notés par des symboles miniers (par exemple les skarns à tungstène de Salau, en Ariège)" },
    ],
    description: "Un granite qui échange des fluides chauds avec un calcaire, au lieu de simplement le cuire, produit un cortège de silicates calciques (grenat, pyroxène, épidote) souvent minéralisé. Les skarns à scheelite des Pyrénées en sont l'exemple français : Salau (Ariège), mine de tungstène exploitée de 1971 à 1986, et Costabonne (Pyrénées-Orientales), gisement découvert en 1951 mais jamais exploité.",
    mineralogie: "Grossulaire-andradite, diopside-hédenbergite, wollastonite, épidote, vésuvianite ; scheelite, cassitérite, magnétite et sulfures y apparaissent localement.",
    mineraux: [["grossulaire", 20], ["diopside", 20], ["andradite", 15], ["calcite", 15], ["epidote", 10], ["wollastonite", 10], ["magnetite", 10]],
    argiles: ["smectites", "chlorite"],
    argilesNote: "Les calc-silicates engendrent des smectites calciques ; les sulfures voisins forment des chapeaux de fer plutôt que des argiles.",
    varietes: [
      { nom: "skarn à tungstène", note: "à scheelite : Costabonne, Salau (Pyrénées)." },
      { nom: "skarn à fer / à étain", note: "à magnétite ou cassitérite selon les fluides." },
      { nom: "endoskarn / exoskarn", note: "L'exoskarn se développe aux dépens du calcaire, l'endoskarn aux dépens de la roche magmatique du contact, plus riche en plagioclase et en pyroxène." },
      { nom: "grenatite", note: "Roche quasi monominérale en grenat (grossulaire, andradite), qui forme le cœur de certains skarns." }
    ],
    regions: [
      { nom: "Costabonne (Pyrénées-Orientales)", lat: 42.45, lng: 2.42 },
      { nom: "Salau (Ariège, ancienne mine de W)", lat: 42.80, lng: 1.20 },
    ],
    ages: [{ de: 320, a: 290, label: "Contact des granites hercyniens (Pyrénées)" }],
    alteration: {
      facilite: 3,
      mecanisme: "Les silicates calciques se défont en argiles et en oxydes, tandis que les sulfures s'oxydent et produisent des chapeaux de fer et des eaux acides localisées.",
    },
    produits: { sable: 100, limon: 80, argile: 300, oxydes: 170, dissous: 350 },
    produitsNote: "≈ 350 g mis en solution (calcium des calc-silicates), 170 g d'oxydes de fer (gossan) ; le résidu concentre grenat et wolframite en placers.",
    usages: "Minerais (tungstène, étain, fer, cuivre) et grenat industriel.",
    wikipedia: "https://fr.wikipedia.org/wiki/Skarn",
  },
  {
    id: "mylonite", nom: "Mylonite", categorie: "metamorphique", sousType: "dynamique (cisaillement ductile)",
    swatch: "#6a6058", densite: 2700,
    codes: [
      { code: "surcharge", sens: " trame ou trait de faille le long des grands cisaillements (par exemple le cisaillement sud-armoricain) ; le libellé porte la mention « mylonites »" },
    ],
    description: "Étirée à l'état solide dans les zones de cisaillement ductile des grandes failles profondes, la roche voit ses grains recristalliser en plus petits et s'aligner en rubans fins autour de « porphyroclastes » (yeux), dont la forme indique le sens du mouvement. Le cisaillement sud-armoricain en porte la trace sur des centaines de kilomètres.",
    mineralogie: "Quartz et micas recristallisés en rubans fins, porphyroclastes de feldspath ; foliation et linéation très marquées.",
    mineraux: [["quartz", 40], ["orthose", 20], ["plagioclases", 15], ["muscovite", 15], ["chlorite_m", 7], ["epidote", 3]],
    argiles: ["illite", "chlorite"],
    argilesNote: "La séricite des plans de cisaillement annonce déjà l'illite : la mylonite livre ses argiles presque sans effort.",
    varietes: [
      { nom: "protomylonite", note: "faiblement mylonitisée (porphyroclastes abondants)." },
      { nom: "ultramylonite", note: "grains presque tous réduits par recristallisation : plus de 90 % de matrice fine." },
      { nom: "blastomylonite", note: "mylonite dont les grains, recristallisés et grossis après la déformation, effacent la structure laminée." },
      { nom: "phyllonite", note: "Très micacée, au lustre soyeux de phyllade : la déformation a transformé les feldspaths en mica blanc." }
    ],
    regions: [
      { nom: "Cisaillement sud-armoricain (Bretagne)", lat: 47.90, lng: -3.00 },
      { nom: "Faille de la Marche (Massif central)", lat: 46.10, lng: 1.90 },
    ],
    ages: [{ de: 320, a: 290, label: "Cisaillements tardi-hercyniens" }],
    alteration: {
      facilite: 2,
      mecanisme: "Grain fin et serré : altération lente ; la foliation oriente l'eau et le débitage en plaquettes.",
    },
    produits: { sable: 250, limon: 150, argile: 380, oxydes: 40, dissous: 180 },
    produitsNote: "Bilan proche du gneiss d'origine : 380 g d'argiles, 250 g de sable fin ; la réduction du grain n'accélère que la fragmentation.",
    usages: "Pierre, granulats.",
    wikipedia: "https://fr.wikipedia.org/wiki/Mylonite",
  },
  {
    id: "cataclasite", nom: "Cataclasite", categorie: "metamorphique", sousType: "dynamique (broyage cassant)",
    swatch: "#7a726a", densite: 2650,
    codes: [
      { code: "surcharge", sens: " zones broyées dessinées le long des failles (trame, trait épais) ; la notice les appelle « cataclasites »" },
    ],
    description: "Équivalent « fragile » de la mylonite : sous les failles peu profondes, la roche se fracture et se broie sans recristalliser, ni prendre de foliation. Elle forme un assemblage anguleux de fragments dans une matrice pulvérisée, mais toujours cohérente.",
    mineralogie: "Fragments anguleux de la roche initiale, plongés dans une matrice broyée de même nature, l'ensemble restant cohésif.",
    mineraux: [["quartz", 35], ["orthose", 20], ["plagioclases", 15], ["illite_m", 15], ["chlorite_m", 10], ["calcite", 5]],
    argiles: ["illite", "smectites", "chlorite"],
    argilesNote: "Déjà argileuse (illite, smectites), la gouge de faille a préparé l'eau à son travail.",
    varietes: [
      { nom: "brèche de faille", note: "à gros fragments, moins broyée." },
      { nom: "gouge de faille", note: "farine de roche non cohésive (argileuse)." },
      { nom: "protocataclasite", note: "cataclasite faiblement broyée : moins de la moitié de la roche est constituée de matrice fine." },
      { nom: "ultracataclasite", note: "Cataclasite noire et compacte, réduite en poudre à plus de 90 % de matrice. Ne pas la confondre avec la pseudotachylite, qui a fondu." }
    ],
    ages: [{ de: 340, a: 0, label: "Le long des failles (de l'Hercynien à l'actuel)" }],
    alteration: {
      facilite: 3,
      mecanisme: "Une matrice broyée offre une grande surface à l'altération ; les zones de faille deviennent donc des drains altérés, souvent argilisés.",
    },
    produits: { sable: 300, limon: 200, argile: 350, oxydes: 60, dissous: 90 },
    produitsNote: "La zone broyée donne un sillon argileux imperméable : 300 g de fragments anguleux et 350 g d'argiles, la gouge fournissant déjà une partie de ces dernières ; d'où les sources alignées sur les failles.",
    usages: "Aucun usage ; zones de faiblesse à surveiller pour les tunnels et les versants.",
    wikipedia: "https://fr.wikipedia.org/wiki/Cataclasite",
    regions: [{ nom: "Sillon houiller du Massif central (grande faille décrochante)", lat: 45.62, lng: 2.53 }],
  },
  {
    id: "pseudotachylite", nom: "Pseudotachylite", categorie: "metamorphique", sousType: "dynamique (fusion-friction)",
    swatch: "#2a2a2e", densite: 2700,
    codes: [
      { code: "—", sens: " veines de quelques millimètres à décimètres, invisibles à 1/50 000 : la notice est seule à les signaler" },
    ],
    description: "Cicatrice d'un séisme fossile : pendant une rupture sismique, le frottement des lèvres de la faille échauffe localement la roche jusqu'à la fondre ; le verre noir qui en résulte se fige et s'injecte dans les fissures. Trace directe et rare de paléoséisme.",
    mineralogie: "Matrice sombre très fine, ancien verre de fusion rarement conservé, le plus souvent dévitrifié en microlites de biotite et de plagioclase, avec de petits fragments arrondis ; elle est injectée en veines et en filonnets nets dans la roche encaissante.",
    mineraux: [["verre", 30], ["quartz", 15], ["plagioclases", 25], ["biotite", 23], ["magnetite", 7]],
    argiles: ["smectites"],
    argilesNote: "Comme une obsidienne, le verre de friction se transforme en smectites, mais il lui faut pour cela les temps géologiques.",
    alteration: {
      facilite: 3,
      mecanisme: "Le verre, instable, se dévitrifie, mais la matrice très fine et peu poreuse résiste bien : les veines ressortent souvent en relief sur l'encaissant.",
    },
    produits: { sable: 100, limon: 100, argile: 500, oxydes: 80, dissous: 220 },
    produitsNote: "À terme, 500 g d'argiles (verre transformé en smectites) ; à l'échelle humaine, la veine vitreuse reste pratiquement inaltérable.",
    usages: "Intérêt scientifique (sismologie ancienne).",
    wikipedia: "https://fr.wikipedia.org/wiki/Pseudotachylite",
    regions: [{ nom: "Faille des Hébrides extérieures (Écosse)", lat: 57.8, lng: -7.0, etranger: true }],
    varietes: [{ nom: "Pseudotachylite de faille", note: "En veines de quelques millimètres, un verre de friction marque le tracé d'une faille sismique." }, { nom: "Pseudotachylite d'impact", note: "Veines de fusion produites par un choc, pouvant atteindre plusieurs mètres d'épaisseur (Vredefort, Afrique du Sud)." }, { nom: "Ultracataclasite", note: "Roche de faille voisine : noire, très fine, broyée mais non fondue." }],
  },
  {
    id: "greisen", nom: "Greisen", categorie: "metamorphique", sousType: "métasomatique (autométamorphisme)",
    swatch: "#c8c0a8", densite: 2650,
    codes: [
      { code: "—", sens: " faciès d'altération des coupoles granitiques, décrit dans le libellé (par exemple la coupole à Sn-W-Li d'Échassières, dans l'Allier)" },
    ],
    description: "Granite remanié par ses derniers fluides : au sommet des coupoles, des vapeurs chargées de fluor et de bore attaquent la roche, qui perd feldspaths et biotite au profit du quartz, du mica blanc et de la topaze, avec cassitérite et wolframite. C'est la roche des anciennes mines d'étain hercyniennes.",
    mineralogie: "Associe quartz, muscovite ou mica lithinifère (lépidolite, zinnwaldite), topaze et tourmaline, avec parfois cassitérite, wolframite et fluorine.",
    mineraux: [["quartz", 58], ["muscovite", 23], ["topaze", 6], ["zinnwaldite", 5], ["fluorine", 5], ["tourmaline", 2], ["cassiterite", 1]],
    argiles: ["kaolinite", "illite"],
    argilesNote: "Quartz et muscovite résistent presque à tout : peu d'argiles (illite issue des micas), et la cassitérite libérée se retrouve dans les placers.",
    regions: [
      { nom: "Montebras (Soumans, Creuse)", lat: 46.31, lng: 2.30 },
      { nom: "Échassières (Allier) : coupole de Beauvoir à étain, tungstène et lithium", lat: 46.18, lng: 2.94 },
    ],
    ages: [{ de: 330, a: 300, label: "Fluides tardi-granitiques hercyniens" }],
    alteration: {
      facilite: 2,
      mecanisme: "Riche en quartz et en mica blanc, donc assez résistante ; la cassitérite, inaltérable, s'accumule dans les placers d'étain situés en aval.",
    },
    produits: { sable: 500, limon: 80, argile: 300, oxydes: 40, dissous: 80 },
    produitsNote: "≈ 500 g de sable quartzo-micacé, presque inaltérable ; la cassitérite libérée se concentre en aval, là où l'étain armoricain a été extrait des placers.",
    usages: "Minerai d'étain et de tungstène ; la lépidolite fournit du lithium.",
    wikipedia: "https://fr.wikipedia.org/wiki/Greisen",
    varietes: [{ nom: "Endogreisen et exogreisen", note: "greisen formé aux dépens du granite ou de la roche qui l'entoure." }, { nom: "Tourmalinite", note: "Roche composée surtout de tourmaline et de quartz, produite par des fluides riches en bore." }, { nom: "Bérésite", note: "Greisen à séricite, quartz et pyrite, fréquemment chargé en or (Bérésovsk, Oural)." }],
  },
  {
    id: "fenite", nom: "Fénite", categorie: "metamorphique", sousType: "métasomatique (alcalin)",
    swatch: "#b09070", densite: 2700,
    codes: [
      { code: "—", sens: " auréoles métasomatiques des complexes alcalins et des carbonatites, hors de métropole ; la notice les décrit" },
    ],
    description: "Les fluides alcalins qui s'échappent d'une carbonatite ou d'une syénite néphélinique « fénitisent » les roches voisines, qui prennent un assemblage à feldspath alcalin et aegyrine. Absente en France, faute de carbonatite majeure.",
    mineralogie: "Feldspath alcalin (souvent rouge), aegyrine ou amphibole sodique, avec ou sans néphéline ; le quartz disparaît.",
    mineraux: [["orthose", 50], ["aegyrine", 20], ["albite", 10], ["arfvedsonite", 10], ["titanite", 5], ["apatite", 5]],
    argiles: ["illite", "kaolinite", "smectites"],
    argilesNote: "Les feldspaths alcalins donnent illite et kaolinite ; l'aegyrine et l'arfvedsonite sodiques donnent des smectites. L'altération concentre les terres rares héritées.",
    alteration: {
      facilite: 3,
      mecanisme: "Le feldspath alcalin et l'aegyrine s'hydrolysent en argiles, oxydes de fer et alcalins.",
    },
    produits: { sable: 150, limon: 80, argile: 450, oxydes: 60, dissous: 260 },
    produitsNote: "≈ 450 g d'argiles ; le niobium et les terres rares hérités de la carbonatite voisine se concentrent par altération : nombre de gisements « d'argiles ioniques » sont des fénites altérées.",
    usages: "Sans usage notable (marqueur d'exploration des carbonatites).",
    wikipedia: "https://fr.wikipedia.org/wiki/F%C3%A9nite",
    regions: [{ nom: "Complexe de Fen (Telemark, Norvège)", lat: 59.28, lng: 9.3, etranger: true }],
    varietes: [{ nom: "Albitite", note: "fénite sodique constituée presque entièrement d'albite." }, { nom: "Fénite potassique", note: "Plus proche de l'intrusion, elle contient davantage de feldspath potassique." }],
    ages: [{ de: 585, a: 575, label: "Complexe de Fen : ≈ 580 Ma" }],
  },
  {
    id: "rodingite", nom: "Rodingite", categorie: "metamorphique", sousType: "métasomatique (dans serpentinites)",
    swatch: "#a8a89a", densite: 2900,
    codes: [
      { code: "—", sens: " filonnets dans les serpentinites (Σ), signalés dans la notice (par exemple les ophiolites alpines du Queyras et du Viso)" },
    ],
    description: "Roche pâle et calcique née au sein des serpentinites : la péridotite, en s'hydratant, libère du calcium qui transforme les filons de gabbro voisins en grenat grossulaire et diopside, sans feldspath. Fréquente dans les ophiolites alpines.",
    mineralogie: "Grenat grossulaire, diopside, vésuvianite, chlorite ou prehnite ; pauvre en silice et dépourvue de feldspath.",
    mineraux: [["grossulaire", 35], ["diopside", 25], ["vesuvianite", 15], ["epidote", 10], ["calcite", 10], ["chlorite_m", 5]],
    argiles: ["chlorite", "smectites"],
    argilesNote: "Les calc-silicates se dissolvent davantage qu'ils ne s'argilisent. La chlorite, qui provient des épontes serpentineuses, complète cet ensemble.",
    regions: [
      { nom: "Ophiolite du Chenaillet / Queyras", lat: 44.85, lng: 6.80 },
      { nom: "Cap Corse", lat: 42.85, lng: 9.40 },
    ],
    ages: [
      { de: 165, a: 150, label: "Rodingitisation au fond de l'océan alpin" },
      { de: 60, a: 35, label: "Métamorphisme alpin (Queyras, Corse)" },
    ],
    alteration: {
      facilite: 2,
      mecanisme: "Les silicates calciques s'hydrolysent lentement en argiles et oxydes ; la roche massive résiste assez bien.",
    },
    produits: { sable: 50, limon: 80, argile: 350, oxydes: 120, dissous: 400 },
    produitsNote: "≈ 400 g dissous (le calcium repart par les fluides, comme il était venu) ; 350 g d'argiles et 120 g d'oxydes complètent le bilan.",
    usages: "Sans usage (intérêt scientifique : ophiolites)." ,
    wikipedia: "https://fr.wikipedia.org/wiki/Rodingite",
    varietes: [{ nom: "Épidotite", note: "roche constituée surtout d'épidote, qu'on trouve dans les mêmes contextes." }, { nom: "Rodingite à grenat", note: "riche en grenat calcique (hydrogrossulaire)." }],
  },
  {
    id: "calcschiste", nom: "Calcschiste (schistes lustrés)", categorie: "metamorphique", sousType: "carbonaté-pélitique (schistes lustrés)",
    swatch: "#9aa39b", densite: 2750,
    description: "Boues calcaires de l'océan alpin (Téthys ligure) métamorphisées en schistes satinés, qui forment des vallées entières dans le Queyras, la Haute-Maurienne et le Cap Corse. Mica et calcite recristallisés leur donnent un éclat soyeux, d'où le nom de « schistes lustrés ».",
    mineralogie: "Phengite et chlorite accompagnent calcite et quartz ; le graphite donne des teintes gris-plomb, l'ankérite les faciès bruns.",
    mineraux: [["calcite", 40], ["muscovite", 25], ["quartz", 20], ["chlorite_m", 10], ["graphite", 3], ["pyrite", 2]],
    argiles: ["illite", "chlorite"],
    argilesNote: "La phengite se dégrade en illite ; la chlorite est héritée : les sols, carbonatés et micacés, restent étonnamment profonds en montagne.",
    codes: [
      { code: "cs", sens: " calcschistes : les feuilles alpines et corses figurent à part l'unité des « Schistes lustrés », par nappe" },
    ],
    varietes: [
      { nom: "schiste lustré s.s.", note: "Faciès alpin type : satiné et plissé à toutes les échelles." },
      { nom: "calcschiste gréseux", note: "à lits détritiques : d'anciens turbidites de la marge." },
      { nom: "calcschiste graphiteux", note: "gris-noir, marqueur de boues confinées." },
    ],
    regions: [
      { nom: "Queyras (Saint-Véran, Château-Queyras)", lat: 44.65, lng: 6.85 },
      { nom: "Haute-Maurienne (Bessans, Bonneval)", lat: 45.32, lng: 7.00 },
      { nom: "Cap Corse et Castagniccia", lat: 42.75, lng: 9.38 },
      { nom: "Tarentaise (Val-d'Isère)", lat: 45.45, lng: 6.98 },
    ],
    ages: [
      { de: 165, a: 90, label: "Dépôt des boues téthysiennes (Jurassique-Crétacé)" },
      { de: 60, a: 35, label: "Métamorphisme alpin (HP puis schiste vert)" },
    ],
    alteration: {
      vmin: 0.01, vmax: 0.08, facilite: 4,
      // D.8.1 : vitesses nettes (mm/an), une par situation ; vmin/vmax gardés pour l'ancien affichage
      valeurs: [
        { v: 0.228, cas: "Chamonix (Alpes) : 1 626 mm de pluie, dont 1 203 mm s'infiltrent ; front de décarbonatation.", src: "dissolution à saturation, masse volumique 2,75, 40 % de calcite", calcul: "carbonate", ref: true }
      ],
      sources: [
        "Plummer et Busenberg (1982), GCA 46 : 1011–1040 (calcite) ; Turc (1961), Annales agronomiques 12 : 13–49 (évapotranspiration réelle) ; Météo-France, normales SAFRAN 1991–2020"
      ],
      mecanisme: "Deux processus concourent : la calcite se dissout comme dans un calcaire, et le débit schisteux accroît les surfaces exposées. La roche se désagrège en plaquettes, puis en fines écailles ; les versants en schistes lustrés s'effondrent en éboulis.",
      climat: "Pas de mesure publiée. Calcul : sous la pluie alpine, la calcite disparaît à raison de ≈ 23 mm en 100 ans, laissant micas et quartz qui se délitent ; gel et gravité emportent la suite, plus vite. D'où les « Alpes à vaches », aux formes douces, à la différence des Alpes calcaires à falaises.",
    },
    produits: { sable: 50, limon: 250, argile: 300, oxydes: 50, dissous: 350 },
    produitsNote: "Pour les sols sur schistes lustrés : ≈ 350 g de calcite dissoute, 300 g d'argiles (mica dégradé, chlorite) et 250 g de limons pailletés. Profonds pour la montagne, ils nourrissent les alpages gras du Queyras.",
    usages: "Lauzes de toiture et murets dans le Queyras et en Corse ; et le terroir des vins du Cap Corse.",
    wikipedia: "https://fr.wikipedia.org/wiki/Schistes_lustr%C3%A9s",
  },
  {
    id: "impactite", nom: "Impactite", categorie: "metamorphique", sousType: "métamorphisme d'impact (choc)",
    swatch: "#6e5f52", densite: 2500,
    description: "Roche née d'une collision cosmique il y a ≈ 207 millions d'années (206,9 Ma) : un astéroïde d'environ 1,5 km frappe le Limousin. Le cratère (≈ 25 km de diamètre, au moins 24 km) a disparu, mais ses brèches demeurent, et le château de Rochechouart a été bâti avec elles. Quartz choqué et verre de fusion : minéraux qu'un impact seul peut produire.",
    mineralogie: "Verre d'impact et fragments de socle (gneiss, granite) ; quartz choqué en lamelles PDF, coésite ; suévites contenant des bulles de verre.",
    mineraux: [["verre", 30], ["quartz", 25], ["orthose", 15], ["plagioclases", 12], ["illite_m", 10], ["biotite", 8]],
    argiles: ["smectites", "illite"],
    argilesNote: "Le verre d'impact tourne en smectites, les fragments de socle en illite et kaolinite ; le quartz choqué résiste et se retrouve dans les sables.",
    codes: [
      { code: "notation locale", sens: " brèches d'impact cartographiées à part autour de Rochechouart-Chassenon ; le libellé précise suévites et brèches lithiques" },
    ],
    varietes: [
      { nom: "suévite", note: "Aux thermes gallo-romains de Chassenon, la brèche riche en fragments de verre est taillée dans l'impactite." },
      { nom: "brèche lithique d'impact", note: "Pas de verre : le socle simplement concassé, puis ressoudé." },
      { nom: "roche de fusion (impact melt)", note: "la poche entièrement fondue par le choc." },
      { nom: "tectite", note: "Des gouttes de verre éjectées à des centaines de kilomètres : les moldavites tchèques, pas encore identifiées à Rochechouart." },
    ],
    regions: [
      { nom: "Astroblème de Rochechouart-Chassenon (Réserve naturelle nationale)", lat: 45.82, lng: 0.82 },
    ],
    ages: [{ de: 207.1, a: 206.7, label: "Impact : 206,9 ± 0,2 Ma (Norien, Trias supérieur ; Cohen et al. 2017)" }],
    alteration: {
      facilite: 3,
      // D.9.3 : vitesses nettes (mm/an), une par situation
      valeurs: [
        { v: 0.00024, cas: "Suévite altérée du fossé annulaire, sur terrain plat, au cratère de Bosumtwi (Ghana ; impact il y a 1 million d'années ; climat tropical humide) : érosion comprise, la surface s'abaisse.", src: "Niang et al. 2022, béryllium 10 du quartz, échantillon BO08 : 0,24 ± 0,02 m par million d'années (vitesse maximale)" },
        { v: 0.0277, cas: "Autre suévite altérée du même fossé : la surface s'abaisse, érosion comprise.", src: "Niang et al. 2022, béryllium 10 du quartz, échantillon BO09 : 27,7 ± 1,9 m par million d'années (vitesse maximale)", ref: true },
        { v: 0.196, cas: "Brèche lithique d'impact ; elle forme la crête des éjectas, au sud-ouest du même cratère, sur un relief. Surface abaissée, érosion comprise.", src: "Niang et al. 2022, béryllium 10 du quartz, échantillon BO31 : 196 ± 16 m par million d'années (vitesse maximale)" }
      ],
      sources: [
        "Niang C. A. B., Baratoux D., Rochette P., Braucher R., Reimold W. U., Lambert P., Diallo D. P., Regard V., Carretier S., Jessell M. W., Faye G., Koeberl C. (2022), « The origin of the potassium-rich annular zones at the Bosumtwi impact structure, Ghana, investigated by field study, radiometric analysis, and first cosmogenic nuclide data », Meteoritics & Planetary Science 57 (3) : 702 à 729 (tableau 2, échantillons de surface BO08, BO09, BO31 ; texte libre sur HAL, insu-03661016)",
        "Degeai J.-P., Peulvast J.-P. (2006), « Calcul de l'érosion à long terme en région de socle autour de grands astroblèmes du Québec et de France », Géographie physique et Quaternaire 60 (2) : 131–148"
      ],
      mecanisme: "Le verre d'impact, métastable, s'argilise à la manière d'un verre volcanique ; les fragments de socle suivent le sort de leur roche. Poreuse, la brèche se dégrade plus vite que le socle intact voisin.",
      climat: "Pas une seule mesure publiée pour Rochechouart. Sous climat tropical humide, à Bosumtwi (Ghana), cratère vieux d'un million d'années, le béryllium 10 de trois affleurements livre des vitesses très contrastées : 2,8 mm en 100 ans sur une suévite du fond plat, 20 mm en 100 ans sur la brèche lithique de la crête des éjectas, 0,02 mm en 100 ans sur une autre suévite du fossé, protégée par une cuirasse latéritique. Ces maxima, calculés à l'équilibre, reposent sur des résultats préliminaires. À Rochechouart, la forme de l'astroblème donne un abaissement moyen du socle de 710 ± 380 m depuis l'impact, soit 0,34 mm en 100 ans (Degeai et Peulvast 2006), les brèches ne subsistant que dans la cuvette centrale.",
    },
    produits: { sable: 250, limon: 150, argile: 400, oxydes: 60, dissous: 140 },
    produitsNote: "Bilan : ≈ 400 g d'argiles (verre altéré, feldspaths des fragments) et 250 g de sable de socle. Le quartz choqué traverse la fraction sableuse : un simple sol suffit à révéler l'impact.",
    usages: "Exploitée depuis l'époque gallo-romaine (Chassenon, Rochechouart), cette pierre de taille locale signe un site scientifique majeur, réserve naturelle nationale depuis 2008.",
    wikipedia: "https://fr.wikipedia.org/wiki/Astrobl%C3%A8me_de_Rochechouart-Chassenon",
  },
];
