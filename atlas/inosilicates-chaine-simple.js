// ============================================================
// INOSILICATES À CHAÎNE SIMPLE (Strunz 9.D) — pyroxènes & pyroxénoïdes
// Les tétraèdres se relient en CHAÎNES INFINIES, chacun partageant
// deux sommets avec ses voisins : rapport Si:O = 1:3 (SiO₃).
//
// Deux mondes structuraux dans cette même chaîne simple :
//   • PYROXÈNES        → la chaîne se répète tous les 2 tétraèdres.
//                        Strunz 9.DA–9.DF. Formule type XY(Si₂O₆).
//   • PYROXÉNOÏDES     → la chaîne, tordue, se répète tous les 3, 5
//                        ou 7 tétraèdres. Strunz les range À PART
//                        (9.DG / 9.DK) : wollastonite, rhodonite…
//
// On classe les pyroxènes par chimie du site cationique :
//   orthopyroxènes (Mg-Fe) · clinopyroxènes calciques (le quadri-
//   latère Ca-Mg-Fe) · clinopyroxènes sodiques · spodumène (Li).
//
// Chargé après cyclosilicates.js, avant app.js.
// ============================================================

Object.assign(MINERAUX, {
  // ---------- Orthopyroxènes — série enstatite–ferrosilite ----------
  enstatite: {
    nom: "Enstatite", formule: "Mg₂Si₂O₆", famille: "Inosilicate : orthopyroxène",
    systeme: "orthorhombique", durete: 5.5, densite: 3.2, stabilite: 3, swatch: "#7a8a6a",
    clivage: "bon selon deux directions à ~88°/92° (prismatique)", eclat: "vitreux à nacré",
    couleurs: "gris-vert, brun-vert, incolore ; variété bronzite brun bronze",
    contexte: "On la rencontre dans les péridotites et pyroxénites du manteau, ainsi que dans les gabbros ; elle est abondante dans les météorites.",
    devient: "→ se transforme en smectites et en oxydes de fer ; libère Mg²⁺.",
    note: "Pôle magnésien des orthopyroxènes, figurant parmi les grands minéraux du manteau supérieur aux côtés de l'olivine. Ses variétés portent d'anciens noms : bronzite (un peu de fer, éclat de bronze) et hypersthène (nom aujourd'hui abandonné par l'IMA). Comprimée dans le manteau inférieur, sa formule MgSiO₃ se transforme en bridgmanite, le minéral le plus abondant de toute la Terre.",
  },
  ferrosilite: {
    nom: "Ferrosilite", formule: "Fe₂Si₂O₆", famille: "Inosilicate : orthopyroxène",
    systeme: "orthorhombique", durete: 5.5, densite: 3.95, stabilite: 3, swatch: "#5a4a3a",
    clivage: "prismatique ~88°/92°", eclat: "vitreux",
    couleurs: "brun sombre, brun-vert, noir",
    contexte: "Rarement pure, elle se rencontre dans les granulites et les roches métamorphiques riches en fer, ainsi que dans quelques rhyolites.",
    devient: "→ se transforme en smectites et en oxydes de fer (goethite, hématite).",
    note: "Pôle ferreux de la série, guère présent à l'état pur : la plupart des orthopyroxènes naturels se situent entre enstatite et ferrosilite. Peu stable à basse pression, elle se dissocie volontiers en fayalite (olivine) et quartz.",
  },

  // ---------- Clinopyroxènes calciques — le quadrilatère Ca-Mg-Fe ----------
  diopside: {
    nom: "Diopside", formule: "CaMgSi₂O₆", famille: "Inosilicate : clinopyroxène calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.3, stabilite: 3, swatch: "#6a9a6a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert clair à vert bouteille, blanc, gris ; vert vif si chromifère",
    contexte: "Skarns, marbres, roches ultramafiques et kimberlites.",
    devient: "→ se transforme en smectites, calcite et oxydes ; libère Ca²⁺ et Mg²⁺.",
    note: "Le pôle magnésien de la série formée par le diopside et l'hédenbergite comprend une variété chromifère, vert émeraude, qui signale la présence de kimberlite, donc de diamant : les prospecteurs la traquent dans les alluvions. Une variété noire présentant un astérisme, le diopside étoilé, est taillée en cabochon.",
  },
  hedenbergite: {
    nom: "Hédenbergite", formule: "CaFe²⁺Si₂O₆", famille: "Inosilicate : clinopyroxène calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.55, stabilite: 3, swatch: "#3a4a3a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert sombre, brun-noir, noir",
    contexte: "On la trouve dans les skarns ferrifères au contact des granites, ainsi que dans les gisements métallifères associés.",
    devient: "→ smectites + oxydes de fer.",
    note: "Pôle ferreux du diopside, il partage les mêmes chaînes avec, en lieu et place du magnésium, du fer ; les deux termes constituent une série continue. Il caractérise les skarns, ces auréoles où une intrusion granitique chauffe un calcaire et concentre souvent des minerais.",
  },
  augite: {
    nom: "Augite", formule: "(Ca,Na)(Mg,Fe,Al,Ti)(Si,Al)₂O₆", famille: "Inosilicate : clinopyroxène calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.4, stabilite: 2, swatch: "#3a3a2f",
    clivage: "bon prismatique ~87°/93°, macles fréquentes", eclat: "vitreux à résineux",
    couleurs: "noir, brun-noir, vert très sombre",
    contexte: "L'augite caractérise les basaltes, les gabbros et les andésites ; elle est répandue dans les roches mafiques.",
    devient: "→ smectites + oxydes de fer + Ca²⁺/Mg²⁺ dissous.",
    note: "L'augite est le pyroxène le plus commun et le minéral sombre typique des roches basaltiques. Sa composition varie beaucoup : elle intègre aluminium, titane et sodium, en sus du trio Ca-Mg-Fe. Ses cristaux noirs et trapus présentent une section octogonale, et on la retrouve même dans les basaltes lunaires et les météorites.",
  },
  pigeonite: {
    nom: "Pigeonite", formule: "(Mg,Fe,Ca)(Mg,Fe)Si₂O₆", famille: "Inosilicate : clinopyroxène calcique",
    systeme: "monoclinique", durete: 6, densite: 3.4, stabilite: 2, swatch: "#4a4438",
    clivage: "prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "brun-vert, brun, noir",
    contexte: "On la trouve dans les laves refroidies rapidement (basaltes, andésites), ainsi que dans les basaltes lunaires et les météorites.",
    devient: "→ smectites + oxydes de fer.",
    note: "Clinopyroxène peu calcique, qui ne se maintient qu'à température élevée : il ne subsiste que dans les laves figées vite. Un refroidissement lent le dédouble en lamelles d'augite et d'orthopyroxène. Son nom provient de Pigeon Point (Minnesota), et il abonde dans les roches lunaires.",
  },
  johannsenite: {
    nom: "Johannsénite", formule: "CaMn²⁺Si₂O₆", famille: "Inosilicate : clinopyroxène calcique",
    systeme: "monoclinique", durete: 6, densite: 3.55, stabilite: 3, swatch: "#8a6a4a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "brun clair, gris-vert, brun sombre",
    contexte: "On la rencontre dans les skarns et les gisements métasomatiques de manganèse.",
    devient: "→ oxydes de manganèse + argiles.",
    note: "Le manganèse complète le triangle des clinopyroxènes calciques, après le magnésium (diopside) et le fer (hédenbergite). Ce minéral naît dans les skarns à manganèse et se transforme volontiers en rhodonite ou en oxydes noirs de manganèse.",
  },

  // ---------- Clinopyroxènes sodiques et sodi-calciques ----------
  jadeite: {
    nom: "Jadéite", formule: "NaAlSi₂O₆", famille: "Inosilicate : clinopyroxène sodique",
    systeme: "monoclinique", durete: 6.75, densite: 3.34, stabilite: 5, swatch: "#3a8a5a",
    clivage: "bon prismatique, mais ténacité exceptionnelle (microcristaux enchevêtrés)", eclat: "vitreux à gras",
    couleurs: "vert (émeraude à pomme), blanc, lavande, noir",
    contexte: "Il se forme lors d'un métamorphisme de haute pression et de basse température (subduction) : Birmanie, Guatemala.",
    devient: "→ se transforme en albite et argiles lors de la décompression (la jadéite se déstabilise à basse pression).",
    note: "Le premier des deux jades, l'autre étant la néphrite, qui est une amphibole. Son enchevêtrement de microcristaux lui confère une ténacité exceptionnelle : dès le néolithique, on en fit haches et parures, en Mésoamérique comme en Chine. Elle ne cristallise qu'à haute pression, ce qui en fait un marqueur des zones de subduction. Le « jade impérial », vert, est une jadéite chromifère birmane.",
  },
  aegyrine: {
    nom: "Aegyrine (acmite)", formule: "NaFe³⁺Si₂O₆", famille: "Inosilicate : clinopyroxène sodique",
    systeme: "monoclinique", durete: 6, densite: 3.55, stabilite: 3, swatch: "#2f3a2a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert sombre à noir, brun-vert",
    contexte: "On la trouve dans les roches magmatiques alcalines : syénites néphéliniques, phonolites et pegmatites (Groenland, Kola).",
    devient: "→ argiles + oxydes de fer.",
    note: "Dans les magmas alcalins, pauvres en silice mais riches en sodium, se développe ce pyroxène en longues aiguilles vert noir. Autrefois désigné acmite (du grec akmê, « la pointe ») pour ses cristaux effilés, il a reçu le nom d'aegyrine, tiré d'Ægir, le dieu nordique de la mer. Il accompagne fidèlement eudialyte et néphéline.",
  },
  omphacite: {
    nom: "Omphacite", formule: "(Ca,Na)(Mg,Fe²⁺,Al)Si₂O₆", famille: "Inosilicate : clinopyroxène sodique",
    systeme: "monoclinique", durete: 6, densite: 3.3, stabilite: 4, swatch: "#5a8a4a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert herbe à vert sombre",
    contexte: "Il s'observe dans les éclogites, roches de très haute pression, en compagnie du grenat rouge.",
    devient: "→ se transforme en symplectites d'amphibole puis en argiles, au cours de la remontée vers la surface.",
    note: "À mi-chemin entre jadéite et diopside, ce minéral colore en vert les éclogites, nées des subductions profondes. Son vert d'herbe contraste avec le grenat rouge voisin, ce qui fait de la roche l'une des plus belles du métamorphisme, et un indice direct de la descente de la croûte océanique en profondeur.",
  },
  kosmochlor: {
    nom: "Kosmochlor", formule: "NaCrSi₂O₆", famille: "Inosilicate : clinopyroxène sodique",
    systeme: "monoclinique", durete: 6, densite: 3.6, stabilite: 4, swatch: "#2f9a5a",
    clivage: "prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert émeraude vif (chrome)",
    contexte: "Il fut signalé en premier dans des météorites ferreuses, puis dans les jades de Birmanie riches en chrome.",
    devient: "Résiduel : rare et stable.",
    note: "Membre chromifère de la série jadéite : le chrome occupe la place de l'aluminium, ce qui donne cette teinte verte intense. Première description dans une météorite de fer, d'où le nom de « vert cosmique » ; l'ancien nom uréyite honorait Harold Urey. On le rencontre aussi parmi les jades verts.",
  },

  // ---------- Pyroxène lithinifère ----------
  spodumene: {
    nom: "Spodumène", formule: "LiAlSi₂O₆", famille: "Inosilicate : pyroxène lithinifère",
    systeme: "monoclinique", durete: 6.75, densite: 3.15, stabilite: 4, swatch: "#b0a8b8",
    clivage: "parfait prismatique ~87°/93°", eclat: "vitreux, nacré sur les clivages",
    couleurs: "gris-blanc, vert-jaune ; gemmes rose lilas (kunzite) et verte (hiddénite)",
    contexte: "Les pegmatites granitiques lithinifères (Dakota du Sud, Australie, Brésil, Afghanistan) renferment ce minéral.",
    devient: "→ kaolinite + micas ; libère le lithium.",
    note: "Cousin lithinifère de la jadéite, il constitue la première source de lithium, employée pour les batteries, les verres et les céramiques. Dans les pegmatites, il grandit en cristaux géants : la mine Etta (Dakota du Sud) en a fourni un de quatorze mètres. Ses variétés gemmes, la kunzite rose et l'hiddénite verte, perdent souvent leur couleur sous l'effet de la lumière.",
  },

  // ---------- Pyroxénoïdes (chaîne simple, période 3/5/7 — Strunz à part) ----------
  rhodonite: {
    nom: "Rhodonite", formule: "(Mn²⁺,Fe²⁺,Mg,Ca)SiO₃", famille: "Inosilicate : pyroxénoïde",
    systeme: "triclinique", durete: 5.75, densite: 3.6, stabilite: 3, swatch: "#c85a7a",
    clivage: "parfait prismatique à ~92,5°", eclat: "vitreux à nacré",
    couleurs: "rose à rouge framboise, souvent veiné de noir",
    contexte: "On la rencontre dans les gisements métamorphiques de manganèse et les skarns (Oural, Långban, Broken Hill).",
    devient: "→ se transforme en oxydes de manganèse noirs (les veines), puis en argiles.",
    note: "Pierre ornementale très recherchée, la rhodonite rose de l'Oural a décoré des objets de Fabergé et des colonnes du métro de Moscou. Ses veines noires résultent de l'altération en oxydes de manganèse. On la distingue de la rhodochrosite, carbonate de même teinte mais bien plus tendre.",
  },
  pectolite: {
    nom: "Pectolite", formule: "NaCa₂Si₃O₈(OH)", famille: "Inosilicate : pyroxénoïde",
    systeme: "triclinique", durete: 5, densite: 2.85, stabilite: 3, swatch: "#a8c8d0",
    clivage: "parfait selon deux directions → fines aiguilles fibro-radiées", eclat: "vitreux à soyeux",
    couleurs: "blanc, gris ; variété bleu ciel = larimar",
    contexte: "Elle se rencontre dans les cavités des basaltes, avec les zéolites ; le larimar provient de la République dominicaine.",
    devient: "→ argiles + calcite.",
    note: "Dans les géodes basaltiques, parmi les zéolites, on observe des aiguilles blanches rayonnantes dont les esquilles très fines s'enfoncent dans la peau. Sa variété bleu ciel, colorée par le cuivre, porte le nom de larimar : seule la République dominicaine la produit, ce qui en fait un emblème local.",
  },
  bustamite: {
    nom: "Bustamite", formule: "CaMnSi₂O₆", famille: "Inosilicate : pyroxénoïde",
    systeme: "triclinique", durete: 5.75, densite: 3.4, stabilite: 3, swatch: "#b07a6a",
    clivage: "parfait prismatique", eclat: "vitreux",
    couleurs: "rose-brun, brun-rouge, rose pâle",
    contexte: "On la trouve dans les skarns et les gisements métamorphiques de manganèse (Franklin, Broken Hill).",
    devient: "→ oxydes de manganèse + argiles.",
    note: "Pyroxénoïde calco-manganésifère, intermédiaire entre la wollastonite (calcium) et la rhodonite (manganèse), d'un rose-brun plus terne que cette dernière. À Franklin (New Jersey), il figure parmi les minéraux fluorescents qui ont fait la renommée du gisement.",
  },
});

// ---------- Sous-familles des inosilicates à chaîne simple ----------
const INO1_SOUS_FAMILLES = [
  {
    nom: "Orthopyroxènes : série enstatite-ferrosilite",
    formule: "(Mg,Fe)₂Si₂O₆ : orthorhombiques",
    note: "Les pyroxènes orthorhombiques, dépourvus de calcium, forment une série continue entre enstatite (pôle magnésien) et ferrosilite (pôle ferreux). Présents surtout dans le manteau et les roches magmatiques profondes, ils voient l'enstatite devenir, sous forte compression, le minéral le plus abondant de la planète.",
    mineraux: ["enstatite", "ferrosilite"],
  },
  {
    nom: "Clinopyroxènes calciques : le quadrilatère Ca-Mg-Fe",
    formule: "Ca(Mg,Fe,Mn)Si₂O₆ : monocliniques",
    note: "Les pyroxènes les plus fournis en calcium occupent le grand site cationique. Trois pôles dépendent du cation accompagnateur : Mg (diopside), Fe (hédenbergite), Mn (johannsénite). S'ajoutent l'augite, forme « impure » typique des basaltes, et la pigeonite, pauvre en Ca, qui caractérise les laves refroidies rapidement.",
    mineraux: ["diopside", "hedenbergite", "augite", "pigeonite", "johannsenite"],
  },
  {
    nom: "Clinopyroxènes sodiques et sodi-calciques",
    formule: "Na(Al,Fe³⁺,Cr)Si₂O₆ : monocliniques",
    note: "Lorsque le sodium prend la place du calcium, il s'associe à un cation trivalent : aluminium (jadéite), fer (aegyrine), chrome (kosmochlor), ou encore un mélange sodo-calcique (omphacite). Ces pyroxènes marquent les extrêmes, soit les très hautes pressions des subductions (jadéite, omphacite), soit les magmas alcalins (aegyrine).",
    mineraux: ["jadeite", "aegyrine", "omphacite", "kosmochlor"],
  },
  {
    nom: "Pyroxène lithinifère",
    formule: "LiAlSi₂O₆ : monoclinique",
    note: "Le spodumène, seul pyroxène courant à site lithinifère, est l'analogue de la jadéite, le lithium remplaçant le sodium. Il se rencontre presque exclusivement dans les pegmatites, où il forme des cristaux géants, et constitue aujourd'hui l'un des grands minerais de lithium.",
    mineraux: ["spodumene"],
  },
  {
    nom: "Pyroxénoïdes",
    formule: "(Ca,Mn,Na)SiO₃ : tricliniques, chaîne à période 3/5/7",
    note: "Architecture de chaîne simple semblable à celle des pyroxènes, mais la chaîne se tord et se répète tous les 3, 5 ou 7 tétraèdres, au lieu de 2 (3 pour la wollastonite, 5 pour la rhodonite). Cette particularité justifie une classe propre dans la classification de Strunz ; ils sont ici regroupés pour leur parenté. Ce sont surtout des minéraux de calcium et de manganèse.",
    mineraux: ["wollastonite", "rhodonite", "pectolite", "bustamite"],
  },
];

// On accroche les sous-familles au groupe « Inosilicates » de la classe IX.
// Ce fichier pose la SECTION « chaîne simple » ; inosilicates-chaine-double.js
// ajoute ensuite la section « chaîne double » (amphiboles) au même groupe.
const INO1_SECTION = "Chaîne simple : pyroxènes et pyroxénoïdes";
INO1_SOUS_FAMILLES.forEach((sf) => { sf.section = INO1_SECTION; });

(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const ino = silicates.groupes.find((g) => g.nom.startsWith("Inosilicates"));
  ino.sousGroupes = INO1_SOUS_FAMILLES.slice();
  ino.mineraux = INO1_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
})();
