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
    nom: "Enstatite", formule: "Mg₂Si₂O₆", famille: "Inosilicate — orthopyroxène",
    systeme: "orthorhombique", durete: 5.5, densite: 3.2, stabilite: 3, swatch: "#7a8a6a",
    clivage: "bon selon deux directions à ~88°/92° (prismatique)", eclat: "vitreux à nacré",
    couleurs: "gris-vert, brun-vert, incolore ; variété bronzite brun bronze",
    contexte: "Péridotites et pyroxénites du manteau, gabbros ; abondante dans les météorites.",
    devient: "→ smectites + oxydes de fer ; libère Mg²⁺.",
    note: "Le pôle magnésien des orthopyroxènes, et l'un des grands minéraux du manteau supérieur avec l'olivine. Ses variétés portent de vieux noms : bronzite (un peu de fer, éclat de bronze) et hypersthène (nom aujourd'hui abandonné par l'IMA). Sa formule MgSiO₃, comprimée dans le manteau inférieur, devient la bridgmanite — le minéral le plus abondant de toute la Terre.",
  },
  ferrosilite: {
    nom: "Ferrosilite", formule: "Fe₂Si₂O₆", famille: "Inosilicate — orthopyroxène",
    systeme: "orthorhombique", durete: 5.5, densite: 3.95, stabilite: 3, swatch: "#5a4a3a",
    clivage: "prismatique ~88°/92°", eclat: "vitreux",
    couleurs: "brun sombre, brun-vert, noir",
    contexte: "Rare pure : granulites et roches métamorphiques riches en fer, quelques rhyolites.",
    devient: "→ smectites + oxydes de fer (goethite, hématite).",
    note: "Le pôle ferreux de la série, rare à l'état pur : presque tous les orthopyroxènes naturels sont des intermédiaires enstatite–ferrosilite. Instable à basse pression, elle tend à se dissocier en fayalite (olivine) + quartz.",
  },

  // ---------- Clinopyroxènes calciques — le quadrilatère Ca-Mg-Fe ----------
  diopside: {
    nom: "Diopside", formule: "CaMgSi₂O₆", famille: "Inosilicate — clinopyroxène calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.3, stabilite: 3, swatch: "#6a9a6a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert clair à vert bouteille, blanc, gris ; vert vif si chromifère",
    contexte: "Skarns, marbres, roches ultramafiques et kimberlites.",
    devient: "→ smectites + calcite + oxydes ; libère Ca²⁺ et Mg²⁺.",
    note: "Le pôle magnésien de la série diopside–hédenbergite. Sa variété chromifère, d'un vert émeraude, est un minéral indicateur de kimberlite — donc de diamant : les prospecteurs la cherchent dans les alluvions. Il en existe aussi une variété noire à astérisme, le diopside étoilé, taillée en cabochon.",
  },
  hedenbergite: {
    nom: "Hédenbergite", formule: "CaFe²⁺Si₂O₆", famille: "Inosilicate — clinopyroxène calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.55, stabilite: 3, swatch: "#3a4a3a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert sombre, brun-noir, noir",
    contexte: "Skarns ferrifères au contact des granites, gisements métallifères associés.",
    devient: "→ smectites + oxydes de fer.",
    note: "Le pôle ferreux du diopside : mêmes chaînes, du fer à la place du magnésium, et les deux forment une série continue. Typique des skarns, ces auréoles métamorphiques où une intrusion granitique cuit un calcaire et y concentre souvent des minerais.",
  },
  augite: {
    nom: "Augite", formule: "(Ca,Na)(Mg,Fe,Al,Ti)(Si,Al)₂O₆", famille: "Inosilicate — clinopyroxène calcique",
    systeme: "monoclinique", durete: 5.75, densite: 3.4, stabilite: 2, swatch: "#3a3a2f",
    clivage: "bon prismatique ~87°/93°, macles fréquentes", eclat: "vitreux à résineux",
    couleurs: "noir, brun-noir, vert très sombre",
    contexte: "LE pyroxène des basaltes, gabbros et andésites — ubiquiste dans les roches mafiques.",
    devient: "→ smectites + oxydes de fer + Ca²⁺/Mg²⁺ dissous.",
    note: "Le pyroxène le plus répandu, et le minéral sombre qui définit les roches basaltiques. Sa chimie est un fourre-tout : elle accepte aluminium, titane et sodium en plus du couple Ca-Mg-Fe. Cristaux noirs trapus à section octogonale. On la retrouve jusque dans les basaltes lunaires et les météorites.",
  },
  pigeonite: {
    nom: "Pigeonite", formule: "(Mg,Fe,Ca)(Mg,Fe)Si₂O₆", famille: "Inosilicate — clinopyroxène calcique",
    systeme: "monoclinique", durete: 6, densite: 3.4, stabilite: 2, swatch: "#4a4438",
    clivage: "prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "brun-vert, brun, noir",
    contexte: "Laves refroidies vite (basaltes, andésites) ; basaltes lunaires et météorites.",
    devient: "→ smectites + oxydes de fer.",
    note: "Un clinopyroxène pauvre en calcium, stable seulement à haute température : on ne le trouve que dans les laves figées rapidement. Refroidi lentement, il se démixe en lamelles d'augite et d'orthopyroxène. Nommé d'après Pigeon Point, dans le Minnesota, il est très commun dans les roches lunaires.",
  },
  johannsenite: {
    nom: "Johannsénite", formule: "CaMn²⁺Si₂O₆", famille: "Inosilicate — clinopyroxène calcique",
    systeme: "monoclinique", durete: 6, densite: 3.55, stabilite: 3, swatch: "#8a6a4a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "brun clair, gris-vert, brun sombre",
    contexte: "Skarns et gisements métasomatiques de manganèse.",
    devient: "→ oxydes de manganèse + argiles.",
    note: "Le troisième sommet du triangle des clinopyroxènes calciques : après le magnésium (diopside) et le fer (hédenbergite), voici le manganèse. Elle vient des skarns à manganèse et s'altère volontiers en rhodonite ou en oxydes de manganèse noirs.",
  },

  // ---------- Clinopyroxènes sodiques et sodi-calciques ----------
  jadeite: {
    nom: "Jadéite", formule: "NaAlSi₂O₆", famille: "Inosilicate — clinopyroxène sodique",
    systeme: "monoclinique", durete: 6.75, densite: 3.34, stabilite: 5, swatch: "#3a8a5a",
    clivage: "bon prismatique, mais ténacité exceptionnelle (microcristaux enchevêtrés)", eclat: "vitreux à gras",
    couleurs: "vert (émeraude à pomme), blanc, lavande, noir",
    contexte: "Métamorphisme de haute pression / basse température (subduction) : Birmanie, Guatemala.",
    devient: "→ albite + argiles en décompression (la jadéite se déstabilise à basse pression).",
    note: "L'un des deux jades — l'autre, la néphrite, est une amphibole. Sa ténacité extrême, due à l'enchevêtrement de ses microcristaux, en a fait dès le néolithique une pierre à haches et à parures, en Mésoamérique comme en Chine. Elle ne cristallise qu'à haute pression : c'est un marqueur des zones de subduction. Le « jade impérial » vert est une jadéite chromifère de Birmanie.",
  },
  aegyrine: {
    nom: "Aegyrine (acmite)", formule: "NaFe³⁺Si₂O₆", famille: "Inosilicate — clinopyroxène sodique",
    systeme: "monoclinique", durete: 6, densite: 3.55, stabilite: 3, swatch: "#2f3a2a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert sombre à noir, brun-vert",
    contexte: "Roches magmatiques alcalines : syénites néphéliniques, phonolites, pegmatites (Groenland, Kola).",
    devient: "→ argiles + oxydes de fer.",
    note: "Le pyroxène des magmas alcalins, pauvres en silice et riches en sodium : de longues aiguilles vert-noir. Son ancien nom, acmite (du grec akmê, « la pointe »), décrivait ses cristaux effilés ; aegyrine, retenu, vient d'Ægir, le dieu nordique de la mer. Compagne fidèle de l'eudialyte et de la néphéline.",
  },
  omphacite: {
    nom: "Omphacite", formule: "(Ca,Na)(Mg,Fe²⁺,Al)Si₂O₆", famille: "Inosilicate — clinopyroxène sodique",
    systeme: "monoclinique", durete: 6, densite: 3.3, stabilite: 4, swatch: "#5a8a4a",
    clivage: "bon prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert herbe à vert sombre",
    contexte: "Éclogites — roches de très haute pression, aux côtés du grenat rouge.",
    devient: "→ symplectites d'amphibole puis argiles, en remontant vers la surface.",
    note: "Un intermédiaire entre jadéite et diopside. C'est le minéral vert des éclogites, ces roches nées dans les subductions profondes : le contraste de son vert herbe avec le grenat rouge qui l'accompagne en fait l'une des plus belles roches métamorphiques, et un témoin direct de la plongée de la croûte océanique à grande profondeur.",
  },
  kosmochlor: {
    nom: "Kosmochlor", formule: "NaCrSi₂O₆", famille: "Inosilicate — clinopyroxène sodique",
    systeme: "monoclinique", durete: 6, densite: 3.6, stabilite: 4, swatch: "#2f9a5a",
    clivage: "prismatique ~87°/93°", eclat: "vitreux",
    couleurs: "vert émeraude vif (chrome)",
    contexte: "D'abord décrit dans des météorites de fer ; aussi dans les jades chromifères de Birmanie.",
    devient: "Résiduel — rare et stable.",
    note: "Le pôle chromifère de la jadéite : le chrome remplace l'aluminium, d'où son vert intense. Décrit pour la première fois dans une météorite de fer — de là son nom, « vert cosmique » ; son ancien nom, uréyite, honorait le chimiste Harold Urey. On le trouve aussi mêlé aux jades verts.",
  },

  // ---------- Pyroxène lithinifère ----------
  spodumene: {
    nom: "Spodumène", formule: "LiAlSi₂O₆", famille: "Inosilicate — pyroxène lithinifère",
    systeme: "monoclinique", durete: 6.75, densite: 3.15, stabilite: 4, swatch: "#b0a8b8",
    clivage: "parfait prismatique ~87°/93°", eclat: "vitreux, nacré sur les clivages",
    couleurs: "gris-blanc, vert-jaune ; gemmes rose lilas (kunzite) et verte (hiddénite)",
    contexte: "Pegmatites granitiques à lithium (Dakota du Sud, Australie, Brésil, Afghanistan).",
    devient: "→ kaolinite + micas ; libère le lithium.",
    note: "L'analogue lithinifère de la jadéite, et le premier minerai de lithium — celui des batteries, des verres et des céramiques. Dans les pegmatites, il forme des cristaux géants : la mine Etta, dans le Dakota du Sud, en a livré un de quatorze mètres de long. Ses gemmes sont la kunzite rose et l'hiddénite verte, aux couleurs souvent instables à la lumière.",
  },

  // ---------- Pyroxénoïdes (chaîne simple, période 3/5/7 — Strunz à part) ----------
  rhodonite: {
    nom: "Rhodonite", formule: "(Mn²⁺,Fe²⁺,Mg,Ca)SiO₃", famille: "Inosilicate — pyroxénoïde",
    systeme: "triclinique", durete: 5.75, densite: 3.6, stabilite: 3, swatch: "#c85a7a",
    clivage: "parfait prismatique à ~92,5°", eclat: "vitreux à nacré",
    couleurs: "rose à rouge framboise, souvent veiné de noir",
    contexte: "Gisements métamorphiques de manganèse et skarns (Oural, Långban, Broken Hill).",
    devient: "→ oxydes de manganèse noirs (les veines) + argiles.",
    note: "Le pyroxénoïde rose du manganèse, pierre ornementale prisée : la rhodonite de l'Oural habille des objets de Fabergé et des colonnes du métro de Moscou. Ses veines noires sont des oxydes de manganèse nés de son altération. On la distingue de la rhodochrosite, un carbonate de même couleur mais bien plus tendre.",
  },
  pectolite: {
    nom: "Pectolite", formule: "NaCa₂Si₃O₈(OH)", famille: "Inosilicate — pyroxénoïde",
    systeme: "triclinique", durete: 5, densite: 2.85, stabilite: 3, swatch: "#a8c8d0",
    clivage: "parfait selon deux directions → fines aiguilles fibro-radiées", eclat: "vitreux à soyeux",
    couleurs: "blanc, gris ; variété bleu ciel = larimar",
    contexte: "Cavités des basaltes, avec les zéolites ; le larimar : République dominicaine.",
    devient: "→ argiles + calcite.",
    note: "Des aiguilles blanches rayonnantes dans les géodes de basalte, au milieu des zéolites — mais ses esquilles, très fines, se plantent dans la peau. Sa variété bleu ciel, colorée par le cuivre, est le larimar : une gemme qu'on ne trouve qu'en République dominicaine, devenue emblème local.",
  },
  bustamite: {
    nom: "Bustamite", formule: "CaMnSi₂O₆", famille: "Inosilicate — pyroxénoïde",
    systeme: "triclinique", durete: 5.75, densite: 3.4, stabilite: 3, swatch: "#b07a6a",
    clivage: "parfait prismatique", eclat: "vitreux",
    couleurs: "rose-brun, brun-rouge, rose pâle",
    contexte: "Skarns et gisements métamorphiques de manganèse (Franklin, Broken Hill).",
    devient: "→ oxydes de manganèse + argiles.",
    note: "Un pyroxénoïde calco-manganésifère, à mi-chemin entre la wollastonite (calcium) et la rhodonite (manganèse) — d'un rose-brun plus terne que cette dernière. À Franklin, dans le New Jersey, elle compte parmi les minéraux fluorescents qui ont rendu ce gisement célèbre.",
  },
});

// ---------- Sous-familles des inosilicates à chaîne simple ----------
const INO1_SOUS_FAMILLES = [
  {
    nom: "Orthopyroxènes — série enstatite–ferrosilite",
    formule: "(Mg,Fe)₂Si₂O₆ — orthorhombiques",
    note: "Les pyroxènes SANS calcium, cristallisés dans le système orthorhombique. Une série continue du pôle magnésien (enstatite) au pôle ferreux (ferrosilite). Ce sont des minéraux du manteau et des roches magmatiques profondes — et l'enstatite, comprimée, devient le minéral le plus abondant de la planète.",
    mineraux: ["enstatite", "ferrosilite"],
  },
  {
    nom: "Clinopyroxènes calciques — le quadrilatère Ca-Mg-Fe",
    formule: "Ca(Mg,Fe,Mn)Si₂O₆ — monocliniques",
    note: "Le cœur des pyroxènes : ceux qui logent du calcium dans leur grand site cationique. Trois pôles selon le cation qui l'accompagne — Mg (diopside), Fe (hédenbergite), Mn (johannsénite) — plus l'augite, la version « impure » ubiquiste des basaltes, et la pigeonite, pauvre en Ca, des laves rapides.",
    mineraux: ["diopside", "hedenbergite", "augite", "pigeonite", "johannsenite"],
  },
  {
    nom: "Clinopyroxènes sodiques et sodi-calciques",
    formule: "Na(Al,Fe³⁺,Cr)Si₂O₆ — monocliniques",
    note: "Ici, le sodium remplace le calcium et s'associe à un cation trivalent : aluminium (jadéite), fer (aegyrine), chrome (kosmochlor), ou un mélange sodi-calcique (omphacite). Ce sont les pyroxènes des extrêmes — soit la très haute pression des subductions (jadéite, omphacite), soit les magmas alcalins (aegyrine).",
    mineraux: ["jadeite", "aegyrine", "omphacite", "kosmochlor"],
  },
  {
    nom: "Pyroxène lithinifère",
    formule: "LiAlSi₂O₆ — monoclinique",
    note: "Le spodumène, seul pyroxène courant à site lithinifère : l'analogue de la jadéite avec du lithium à la place du sodium. Il n'existe pratiquement que dans les pegmatites, où il forme des cristaux géants — et il est aujourd'hui l'un des grands minerais de lithium.",
    mineraux: ["spodumene"],
  },
  {
    nom: "Pyroxénoïdes",
    formule: "(Ca,Mn,Na)SiO₃ — tricliniques, chaîne à période 3/5/7",
    note: "Même architecture de chaîne simple que les pyroxènes, mais la chaîne y est TORDUE et se répète tous les 3, 5 ou 7 tétraèdres au lieu de 2 (3 pour la wollastonite, 5 pour la rhodonite). Cette différence de structure leur vaut une classe à part dans la classification officielle de Strunz — on les regroupe ici pour leur parenté structurale. Ce sont surtout des minéraux du calcium et du manganèse.",
    mineraux: ["wollastonite", "rhodonite", "pectolite", "bustamite"],
  },
];

// On accroche les sous-familles au groupe « Inosilicates » de la classe IX.
// Ce fichier pose la SECTION « chaîne simple » ; inosilicates-chaine-double.js
// ajoute ensuite la section « chaîne double » (amphiboles) au même groupe.
const INO1_SECTION = "Chaîne simple — pyroxènes & pyroxénoïdes";
INO1_SOUS_FAMILLES.forEach((sf) => { sf.section = INO1_SECTION; });

(function () {
  const silicates = MIN_CLASSIF.find((c) => c.n === 9);
  const ino = silicates.groupes.find((g) => g.nom.startsWith("Inosilicates"));
  ino.sousGroupes = INO1_SOUS_FAMILLES.slice();
  ino.mineraux = INO1_SOUS_FAMILLES.flatMap((sf) => sf.mineraux);
})();
