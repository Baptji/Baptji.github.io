// ============================================================
// G.12 — VALEURS PROPRES À CHAQUE ESPÈCE D'ARGILE (01/10/2026)
// Chargé après classification.js. Chaque valeur porte ses sources (clés de SRC_ESP).
// Une valeur absente = « non renseignée » : la fiche du groupe reste affichée en repère,
// on n'invente jamais un chiffre. Tableaux de travail et choix : references/valeurs-especes-argiles.md
// ============================================================

const SRC_ESP = {
  hom: "J.W. Anthony, R.A. Bideaux, K.W. Bladh, M.C. Nichols, <i>Handbook of Mineralogy</i>, Mineralogical Society of America (fiche de l'espèce).",
  md: "Mindat.org, fiche de l'espèce (statut IMA, propriétés, gisements), consultée le 1<sup>er</sup> octobre 2026.",
  ima26: "B. Lanson et al. (2026), « IMA Commission on New Minerals, Nomenclature and Classification – Newsletter 89 », <i>European Journal of Mineralogy</i> 38, 117–122 (proposition 25-E : l'hydrohalloysite est déclassée, l'halloysite redéfinie en Al₂Si₂O₅(OH)₄·nH₂O).",
  cms: "Clay Minerals Society, <i>Source Clays – Physical and Chemical Data</i> (clays.org), d'après H. van Olphen et J.J. Fripiat (1979), <i>Data Handbook for Clay Materials and Other Non-metallic Minerals</i>, Pergamon. CEC et surface à l'azote des argiles de référence.",
  me99: "C. Ma et R.A. Eggleton (1999), « Cation exchange capacity of kaolinite », <i>Clays and Clay Minerals</i> 47, 174–180.",
  s87: "H. Suquet, C. Malard, J. Fournier et H. Pézerat (1987), « Capacité d'échange cationique et charge de surface du chrysotile », <i>Bulletin de Minéralogie</i> 110, 711–715 (chrysotile UICC ; tableau II : kaolinite de St Austell et montmorillonite du Wyoming d'après Tercé 1985).",
  t98: "K. Tone, M. Kamori, Y. Shibasaki, Y. Takeda et O. Yamamoto (1998), « Effect of the surface potential on the cation exchange capacity of kaolin minerals », <i>Clay Science</i> 10, 327–335 (dickite de Shokozan, Hiroshima).",
  m10: "R. Miyawaki et al. (2010), analyse des argiles de référence de la Société japonaise des argiles, <i>Nendo Kagaku</i> 48, 158 (surfaces BET : dickite JCSS-1301, pyrophyllite JCSS-2101, séricite JCSS-5101 et 5102).",
  s24: "H. Sugahara (2024), <i>Analytical Sciences</i> 40, 781–789 (dickite JCSS-1301 : surface BET et CEC).",
  j05: "E. Joussein, S. Petit, J. Churchman, B. Theng, D. Righi et B. Delvaux (2005), « Halloysite clay minerals — a review », <i>Clay Minerals</i> 40, 383–426.",
  b90: "S.W. Bailey (1990), « Halloysite — a critical assessment », <i>Sciences Géologiques, Mémoires</i> 86, 89–98 (reprend les CEC de Grim 1953).",
  r49: "A. Rivière (1949), « Sur la capacité d'échange de base des halloysites », <i>Groupe français des argiles, comptes rendus</i> 1, 1–2.",
  bm62: "R. Brousse et P. Maurel (1962), « Un nouveau gisement d'halloysite hydratée », <i>Bulletin de la Société française de Minéralogie et de Cristallographie</i> 85, 128–130 (le Trador, Laqueuille).",
  b96: "M.D. Buatier, J.-L. Potdevin, M. Lopez et S. Petit (1996), « Occurrence of nacrite in the Lodève Permian basin (France) », <i>European Journal of Mineralogy</i> 8, 847–852.",
  n63: "J. Nicolas et A. de Rosen (1963), « Le massif granitique des Colettes (Allier) et ses minéralisations », <i>Bulletin de la Société française de Minéralogie et de Cristallographie</i> 86, 126–128.",
  cl70: "N. Clauer et J. Lucas (1970), « Minéralogie de la fraction fine des schistes de Steige (Vosges septentrionales) », <i>Bulletin du Groupe français des argiles</i> 22, 223–235.",
  g67: "R. Glaeser, I. Mantine et J. Mering (1967), « Observations sur la beidellite », <i>Bulletin du Groupe français des argiles</i> 19 (beidellite de Rupsroth, Allemagne : 1,50 méq/g ; montmorillonite : 1,15 méq/g).",
  mo58: "R. Morel (1958), « Observations sur la capacité d'échange et les phénomènes d'échange dans les argiles », <i>Bulletin du Groupe français des argiles</i> 10 (montmorillonite calcique : 101–102 méq/100 g).",
  bs90: "J.-P. Bellat et M.-H. Simonot-Grange (1990), « Adsorption-desorption of water by sepiolite », <i>Sciences Géologiques, Mémoires</i> 87, 15–23 (surface externe des fibres ≈ 120 m²/g, comme Grillet et al. 1988).",
  ww61: "E. Wilhelm et R. Wey (1961), « Étude de l'échange d'ions d'une vermiculite », <i>Bulletin du Service de la Carte géologique d'Alsace et de Lorraine</i> 14, 149–158.",
  g8: "Contexte de la fiche Kaolinite de l'atlas (revu en septembre 2026).",
  st: "Espacement calculé par l'atlas sur la structure publiée (COD 9000809, Lee et Guggenheim 1981) affichée plus haut."
};

// v = valeur affichée ; s = sources ; n = explication, rendue avec les sources en bas de fiche
const VAL_ESP = {
  // ---------- kaolin et halloysite ----------
  kaolinite_e: {
    ima: { v: "espèce reconnue ; échantillon de référence fixé en 2025 à Gaoling (Chine), le village qui a donné son nom au kaolin", s: ["md"] },
    cec: { v: "2,0 à 3,3", s: ["cms"], n: "CEC de la kaolinite : les deux kaolinites de référence de la Clay Minerals Society donnent 2,0 (KGa-1b) et 3,3 (KGa-2) ; celle de St Austell (Cornouailles) 1,2. La fourchette de la fiche du groupe (3 à 15, Grim 1953) vaut pour les kaolinites des sols : la CEC monte quand les grains sont plus fins (2,8 à 5,0 pour des kaolinites bien cristallisées, 16 à 20 pour des kaolinites fines transportées) et atteint 23 à 24 quand des feuillets de smectite sont collés à leur surface (Ma et Eggleton 1999)." },
    surf: { v: "10 à 24 (azote)", s: ["cms", "m10"] },
    d001: { v: "7,16 Å", s: ["hom", "md"] },
    dens: { v: "2,61 à 2,68", s: ["hom", "md"] },
    dur: { v: "2 à 2,5", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "d'un blanc crème virant au jaune pâle, il porte souvent des taches beiges ou brunes", s: ["md", "hom"] },
    fr: { v: "Des exploitations de kaolin existent en Bretagne (Ploemeur, Berrien), dans les Charentes (Clérac) et le Limousin (Saint-Yrieix) ; les argiles plastiques de l'Éocène de Provins en fournissent aussi.", s: ["g8", "hom"] },
  },
  dickite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "2,8", s: ["t98", "s24"] },
    surf: { v: "3,7 à 4,7 (BET)", s: ["m10", "s24"], n: "Surface de la dickite : 3,7 et 4,7 m²/g sur l'échantillon de référence japonais JCSS-1301 (Shokozan) ; 13,0 m²/g sur une fraction fine séparée du même gisement (Tone et al. 1998)." },
    d001: { v: "7,15 Å", s: ["hom", "md"] },
    dens: { v: "2,60", s: ["hom", "md"] },
    dur: { v: "2 à 2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, nuancé par ses inclusions ; éclat satiné", s: ["hom", "md"] },
    fr: { v: "Condorcet (Drôme), Penestin (Morbihan) et Cap Garonne (Var) forment la liste secondaire ; les gisements principaux sont dans les schistes de Steige (Bas-Rhin) et au Mas d'Alary, bassin de Lodève (Hérault).", s: ["hom", "cl70", "md"] },
  },
  nacrite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,18 Å", s: ["hom", "md"] },
    dens: { v: "2,5 à 2,7", s: ["hom"] },
    dur: { v: "2 à 2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "de couleur blanche, grise, jaunâtre ou brunâtre, à éclat nacré", s: ["md", "hom"] },
    fr: { v: "dans les cavités de la dolomie sous le bassin de Lodève (Hérault), en cristaux millimétriques associés à la barytine ; on la trouve aussi à Montebras (Creuse), La Villeder (Morbihan) et Pech Migé (Aude)", s: ["b96", "md"], n: "Le Handbook of Mineralogy place Lodève en « Haute-Vienne » : Lodève est dans l'Hérault (Buatier et al. 1996)." },
  },
  halloysite: {
    ima: { v: "espèce reconnue, redéfinie en 2026 avec n molécules d'eau : sa forme hydratée (hydrohalloysite, endellite ou halloysite 10 Å) n'est plus une espèce à part", s: ["ima26", "md"] },
    cec: { v: "5 à 10 sèche (7 Å) ; ≈ 50 hydratée (10 Å), valeur discutée", s: ["b90", "r49"], n: "CEC de l'halloysite : Rivière (1949) mesure 50 méq/100 g sur la forme hydratée et 5 sur la forme sèche, mais un second laboratoire, avec une méthode plus courte, trouve la même valeur pour les deux formes ; les valeurs publiées vont de 2 à 60 (Bailey 1990, Joussein et al. 2005), 14 à 45 sur quatre halloysites australiennes (Ma et Eggleton 1999), et les plus fortes viennent souvent d'argiles 2:1 mêlées à l'échantillon (Joussein et al. 2005)." },
    surf: { v: "50 à 60 (forme sèche)", s: ["j05"] },
    eauInter: { v: "≈ 14 g pour 100 g sous sa forme hydratée, à 2 H₂O par Al₂Si₂O₅(OH)₄", s: ["j05"] },
    d001: { v: "7,2 à 7,6 Å sèche ; 10,0 à 10,1 Å hydratée", s: ["j05", "bm62", "hom"] },
    dens: { v: "2,55 à 2,57 sèche ; ≈ 2,1 hydratée (calculée)", s: ["hom", "md"], n: "Densité de l'halloysite hydratée : calculée d'après la maille de la forme 10 Å donnée par Mindat (2 × 294,2 g/mol pour 457,9 Å³), c'est le « 2,14 calculé » de sa fiche Halloysite." },
    dur: { v: "2 à 2,5", s: ["hom"], n: "Dureté de l'halloysite : Mindat donne 1 à 2, sans source ; le Handbook of Mineralogy 2 à 2,5." },
    sys: { v: "monoclinique (structure mal ordonnée)", s: ["hom", "md"] },
    coul: { v: "teinte blanche dans le cas le plus pur, mais elle vire au gris, au vert, au bleu, au jaune ou au rouge avec les impuretés présentes", s: ["hom"] },
    fr: { v: "On rencontre la forme hydratée au Trador, près de Laqueuille (Puy-de-Dôme), tandis que la variété est connue à Échassières (Allier) ; Saint-Yrieix, Huelgoat, Chessy et Cap Garonne la citent également.", s: ["n63", "bm62", "md"] },
  },
  odinite: {
    ima: { v: "espèce reconnue (1988)", s: ["md"] },
    d001: { v: "7,15 Å", s: ["hom", "md"] },
    dens: { v: "2,78 (calculée)", s: ["hom"] },
    dur: { v: "2,5", s: ["md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "vert soyeux à vert foncé", s: ["md"] },
    fr: { v: "Le lagon de Nouméa, en Nouvelle-Calédonie, la fournit ; rien de tel n'a été signalé en métropole.", s: ["md"] },
  },
  // ---------- serpentines ----------
  chrysotile: {
    ima: { v: "espèce reconnue, redéfinie en 2007", s: ["md"] },
    cec: { v: "0,5", s: ["s87"] },
    surf: { v: "17,8 (BET)", s: ["s87"] },
    d001: { v: "7,31 Å", s: ["hom"] },
    dens: { v: "2,53", s: ["hom"] },
    dur: { v: "2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique ou triclinique", s: ["hom"] },
    coul: { v: "blanc, vert pâle à vert foncé", s: ["hom"] },
    fr: { v: "serpentinites du Haut-Allier (Haute-Loire : Allevier, Lisoul, Lubilhac)", s: ["md"] },
  },
  antigorite: {
    ima: { v: "espèce reconnue, redéfinie en 1998", s: ["md"] },
    d001: { v: "7,28 à 7,29 Å", s: ["hom", "md"] },
    dens: { v: "2,5 à 2,65", s: ["md", "hom"] },
    dur: { v: "2,5 à 4", s: ["hom", "md"], n: "Dureté de l'antigorite : 2,5 à 3,5 pour le Handbook of Mineralogy, 3,5 à 4 pour Mindat." },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert, vert-bleu, blanc, brun, noir", s: ["md"] },
    fr: { v: "On la trouve dans les serpentinites d'Allevier, de Champagnac-le-Vieux et de Madriat (Haute-Loire).", s: ["md"] },
  },
  lizardite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,4 Å", s: ["hom", "md"] },
    dens: { v: "2,55", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["hom", "md"] },
    sys: { v: "hexagonal", s: ["hom"] },
    coul: { v: "vert, brun, jaune pâle à blanc", s: ["md", "hom"] },
    fr: { v: "Les serpentinites d'Allevier et de Vieille-Brioude (Haute-Loire), ainsi que celles du Puy-de-Dôme, la renferment.", s: ["md"] },
  },
  berthierine: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,04 à 7,1 Å", s: ["md", "hom"] },
    dens: { v: "3,06 (calculée)", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["md"] },
    sys: { v: "monoclinique, en partie hexagonale", s: ["hom"] },
    coul: { v: "vert olive foncé ou vert jaunâtre ; la variété titanifère est brun rouge.", s: ["md", "hom"] },
    fr: { v: "minerai de fer lorrain d'Hayange (Moselle), localité type de l'espèce ; on la rencontre aussi à Poullaouen (Finistère)", s: ["md", "hom"] },
  },
  greenalite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,12 Å", s: ["hom", "md"] },
    dens: { v: "2,85 à 3,15", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "vert, vert-jaune clair", s: ["md"] },
    fr: { v: "gisements de Salsigne (Aude) et de l'île de Groix (Morbihan)", s: ["hom", "md"] },
  },
  amesite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,0 Å", s: ["hom", "md"] },
    dens: { v: "2,77 à 2,78", s: ["md", "hom"] },
    dur: { v: "2,5 à 3", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom"] },
    coul: { v: "la variété chromifère prend une teinte rose à lilas ; sinon, elle est bleu-vert grisâtre pâle, blanche ou vert pâle.", s: ["md"] },
    fr: { v: "Saint-Babel (Puy-de-Dôme) ; le col du Chenaillet (Hautes-Alpes) ; Costabonne (Pyrénées-Orientales) : tels sont les gisements connus.", s: ["md"] },
  },
  cronstedtite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,09 Å", s: ["hom", "md"] },
    dens: { v: "3,34 à 3,35", s: ["hom", "md"] },
    dur: { v: "3,5", s: ["hom", "md"] },
    sys: { v: "de système triclinique, monoclinique ou hexagonal, selon le polytype", s: ["hom"] },
    coul: { v: "Noir franc, brun-noir ou vert-noir ; en lame mince, il paraît vert émeraude.", s: ["md", "hom"] },
    fr: { v: "on la trouve à Salsigne (Aude) et à Sainte-Marie-aux-Mines (Haut-Rhin), ainsi que dans la météorite de Paris", s: ["hom", "md"] },
  },
  nepouite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,31 Å", s: ["hom", "md"] },
    dens: { v: "3,24", s: ["hom", "md"] },
    dur: { v: "2 à 2,5", s: ["md", "hom"] },
    sys: { v: "orthorhombique", s: ["md"] },
    coul: { v: "vert foncé intense à vert terne", s: ["md"] },
    fr: { v: "Connue en Nouvelle-Calédonie, à la mine de Népoui (localité type), à Poro et à Kouaoua ; absente des signalements métropolitains.", s: ["md"] },
  },
  // ---------- talc et pyrophyllite ----------
  pyrophyllite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    surf: { v: "4,6 (BET)", s: ["m10"] },
    d001: { v: "≈ 9,2 Å", s: ["st"] },
    dens: { v: "2,65 à 2,90", s: ["hom", "md"] },
    dur: { v: "1 à 2", s: ["hom", "md"] },
    sys: { v: "de système monoclinique ou triclinique, selon le polytype", s: ["hom"] },
    coul: { v: "teintes blanches, grises, bleutées, vertes ou jaune pâle, ainsi que vert brunâtre", s: ["md", "hom"] },
    fr: { v: "gisements de Chizeuil (Saône-et-Loire), de Crozon (Finistère), de la Vanoise et de Villefranche-de-Conflent (Pyrénées-Orientales)", s: ["md"] },
  },
  ferripyrophyllite: {
    ima: { v: "espèce reconnue (1978)", s: ["md"] },
    d001: { v: "9,6 Å", s: ["hom", "md"] },
    dens: { v: "2,97 à 3,01", s: ["hom", "md"] },
    dur: { v: "1,5 à 2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "jaune brunâtre", s: ["md"] },
    fr: { v: "On ne la signale pas en France. Sa localité type est saxonne : puits de Straßen, à Eibenstock (Allemagne).", s: ["md"] },
  },
  talc_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,31 à 9,34 Å", s: ["hom", "md"] },
    dens: { v: "2,58 à 2,83", s: ["hom", "md"] },
    dur: { v: "1", s: ["hom", "md"] },
    sys: { v: "de système triclinique ou monoclinique, selon le polytype", s: ["hom"] },
    coul: { v: "de couleur incolore, blanche, verte (du vert pâle au vert foncé), brune ou grise", s: ["md", "hom"] },
    fr: { v: "gisement de Trimouns, au-dessus de Luzenac (Ariège)", s: ["hom"] },
  },
  willemseite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,40 Å", s: ["hom", "md"] },
    dens: { v: "3,31", s: ["hom", "md"] },
    dur: { v: "2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert clair", s: ["md"] },
    fr: { v: "Poro, Népoui et Goro, en Nouvelle-Calédonie ; rien de tel en métropole.", s: ["md"] },
  },
  minnesotaite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,54 Å", s: ["hom", "md"] },
    dens: { v: "3,01", s: ["hom", "md"] },
    dur: { v: "1,5 à 2", s: ["md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "gris verdâtre à vert olive", s: ["md"] },
    fr: { v: "elle n'est pas signalée en France ; en Europe, elle se rencontre à La Unión (Murcie, Espagne) et sur la presqu'île du Lizard (Cornouailles)", s: ["md"] },
  },
  // ---------- smectites ----------
  montmorillonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "76 à 120", s: ["cms"], n: "CEC de la montmorillonite : 76 (Wyoming, sodique), 84 (Texas) et 120 (Arizona) pour les argiles de référence de la Clay Minerals Society ; autres mesures : 94 (Wyoming, Tercé 1985), 101–102 (Morel 1958), 115 (Glaeser et al. 1967)." },
    surf: { v: "≈ 800 au total ; 32 à 97 à l'azote (faces externes)", s: ["s87", "cms"], n: "Surface de la montmorillonite : l'azote n'entre pas entre les feuillets, il ne mesure que les faces externes (32 à 97 m²/g selon l'argile de référence) ; la surface totale, feuillets compris, est d'environ 800 m²/g (montmorillonite du Wyoming, Tercé 1985)." },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,0 Å", s: ["md"] },
    dens: { v: "2 à 3", s: ["hom", "md"] },
    dur: { v: "1 à 2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, chamois, jaune, vert, rarement rose à rouge", s: ["md"] },
    fr: { v: "localité type à Montmorillon (Vienne) ; on la trouve aussi à Échassières (Allier) et dans les filons du Brivadois (Haute-Loire)", s: ["hom", "md"] },
  },
  beidellite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "≈ 150 (beidellite de Rupsroth, Allemagne)", s: ["g67"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 17,6 Å", s: ["hom", "md"] },
    dens: { v: "2 à 3", s: ["hom", "md"] },
    dur: { v: "1 à 2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "blanc, rougeâtre, gris brunâtre", s: ["md"] },
    fr: { v: "gisements de Sibert (Rhône), du Mayet-de-Montagne (Allier) et de l'île de Groix (Morbihan)", s: ["hom", "md"] },
  },
  volkonskoite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,11 à 2,36", s: ["hom", "md"] },
    dur: { v: "1 à 2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "bleu-vert, vert foncé, vert herbe", s: ["md"] },
    fr: { v: "elle n'est pas signalée en France ; en Europe, elle se rencontre en Toscane (Botro Massaccio, Rosignano Marittimo, Italie)", s: ["md"] },
  },
  nontronite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,4 Å", s: ["hom", "md"] },
    dens: { v: "2,2 à 2,3", s: ["hom", "md"] },
    dur: { v: "1,5 à 2", s: ["md", "hom"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert, vert olive, jaune-vert, jaune, orange, brun", s: ["md"] },
    fr: { v: "Le nom vient de la région de Nontron, où se trouve Saint-Pardoux (Dordogne) ; Bellegarde-en-Forez (Loire) et Alligny-en-Morvan (Nièvre) sont aussi cités.", s: ["hom", "md"] },
  },
  saponite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,4 Å", s: ["md"] },
    dens: { v: "2,24 à 2,30", s: ["hom", "md"] },
    dur: { v: "1,5 à 2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, jaune, gris, bleu, vert, rougeâtre, brun", s: ["md"] },
    fr: { v: "gisements du Baumier, à Mirabel et Saint-Jean-le-Centenier (Ardèche), et de l'île de Groix (Morbihan)", s: ["md"] },
    nota: "Les mesures trouvées de CEC et de surface concernent une saponite de synthèse (argile japonaise de référence JCSS-3501 : CEC 99,7 méq/100 g) ; elles ne sont pas reprises ici.",
  },
  hectorite: {
    ima: { v: "espèce reconnue, mais jugée douteuse par l'IMA", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,8 Å", s: ["hom", "md"] },
    dens: { v: "2,3", s: ["md"] },
    dur: { v: "1 à 2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, crème, brun pâle, marbré", s: ["md"] },
    fr: { v: "gisements du Puy Chalard (Puy-de-Dôme) et de l'île de Groix (Morbihan)", s: ["hom", "md"] },
    nota: "La CEC de l'hectorite, mesurée sur l'argile de référence SHCa-1, atteint 43,9 méq/100 g ; mais cette argile ne contient qu'environ 50 % d'hectorite, pour 43 % de calcite (Chipera et Bish 2001), et la valeur ne représente donc pas l'espèce.",
  },
  stevensite: {
    ima: { v: "espèce reconnue, mais jugée douteuse par l'IMA", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 12,5 à 15,5 Å", s: ["hom", "md"] },
    dens: { v: "2,15 à 2,57", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "blanc, jaune pâle, brun pâle ou rose pâle", s: ["md"] },
    fr: { v: "elle n'est pas signalée en France ; en Europe, elle se rencontre en Ligurie (mine de Cerchiara, Italie)", s: ["md"] },
  },
  sauconite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,4 Å", s: ["hom", "md"] },
    dur: { v: "1 à 2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "brun rougeâtre, brun ou jaune brunâtre, parfois marbré", s: ["md"] },
    fr: { v: "Isère (La Poype), Pyrénées-Orientales (Can Pei, Montferrer) et Var (Cap Garonne) : trois régions la fournissent.", s: ["md"] },
  },
  swinefordite: {
    ima: { v: "espèce reconnue (1973)", s: ["md"] },
    d001: { v: "12,96 Å", s: ["md"] },
    dur: { v: "1", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, jaune verdâtre ou gris olive foncé", s: ["md"] },
    fr: { v: "Absente de France, elle se rencontre en Europe à la mine de Baumhalde (Todtnau, Forêt-Noire, Allemagne).", s: ["md"] },
  },
  // ---------- vermiculite ----------
  vermiculite_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,15 Å (magnésienne, à l'air)", s: ["hom", "md"] },
    dens: { v: "2,2 à 2,6", s: ["hom"] },
    dur: { v: "1,5 à 2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "brun, jaune bronze", s: ["md"] },
    fr: { v: "Les serpentinites de Haute-Loire en livrent à Allevier, La Barbate et Saint-Ilpize ; le Mayet-de-Montagne (Allier) en fournit aussi.", s: ["md"] },
    nota: "Wilhelm et Wey (1961) donnent 80 méq/100 g à 25 °C et 96 à 80 °C, mais sur une vermiculite du commerce encore en partie micacée : ce chiffre n'est pas repris.",
  },
  // ---------- micas et illites ----------
  illite_e: {
    ima: { v: "nom de série (les illites), pas une espèce au sens de l'IMA", s: ["md"] },
    dens: { v: "2,79 à 2,80", s: ["md"] },
    dur: { v: "1 à 2", s: ["md"] },
    coul: { v: "blanc grisâtre à blanc argenté, ou gris verdâtre", s: ["md"] },
  },
  brammallite: {
    ima: { v: "douteuse : paragonite appauvrie en sodium, l'équivalent sodique de l'illite", s: ["md"] },
    fr: { v: "elle n'est pas signalée en France ; sa description provient de Llandybie (pays de Galles)", s: ["md"] },
  },
  sericite: {
    ima: { v: "pas une espèce : muscovite (rarement paragonite) en grains très fins", s: ["md"] },
    surf: { v: "4,6 (BET) ; 10,2 après clivage", s: ["m10"] },
    nota: "Pour la séricite, la densité, la dureté, les couleurs et l'espacement sont ceux de la muscovite (voir sa fiche).",
  },
  glauconite_e: {
    ima: { v: "nom de série (les glauconites), pas une espèce au sens de l'IMA", s: ["md"] },
    d001: { v: "10,1 Å", s: ["hom"] },
    dens: { v: "2,4 à 2,95", s: ["hom"] },
    dur: { v: "2", s: ["hom"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "vert herbe, vert-jaune, bleu-vert", s: ["hom"] },
    fr: { v: "gisements de Villers-sur-Mer (Calvados), de la montagne de Crussol (Ardèche) et de Trept (Isère)", s: ["hom", "md"] },
  },
  celadonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,95 à 3,05", s: ["hom", "md"] },
    dur: { v: "2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "bleu-vert, vert olive, vert pomme", s: ["md"] },
    fr: { v: "elle est connue dans la carrière de Busséol (Puy-de-Dôme)", s: ["md"] },
  },
  muscovite_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "10,0 Å", s: ["hom", "md"] },
    dens: { v: "2,77 à 2,88", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "incolore à blanc argenté, nuancée par les impuretés", s: ["md"] },
  },
  paragonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,7 Å", s: ["hom", "md"] },
    dens: { v: "2,85", s: ["hom", "md"] },
    dur: { v: "2,5 à 3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "sans couleur, ou jaune pâle, grisâtre, verdâtre, voire vert pomme clair.", s: ["md"] },
    fr: { v: "gisements de l'île de Groix (Morbihan), du Mont-Cenis et de la Vanoise (Savoie)", s: ["md"] },
  },
  margarite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,99 à 3,08", s: ["hom", "md"] },
    dur: { v: "3,5 à 4,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "grisâtre, rose pâle, jaune, vert", s: ["md"] },
    fr: { v: "Salau (Ariège), Costabonne (Pyrénées-Orientales)", s: ["md"] },
  },
  phlogopite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,94 Å", s: ["hom", "md"] },
    dens: { v: "2,78 à 2,85", s: ["hom", "md"] },
    dur: { v: "2 à 3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "teintes brunes, grises, vertes, jaunes ou brun rougeâtre", s: ["md"] },
  },
  biotite_e: {
    ima: { v: "nom de série entre la phlogopite et l'annite, redéfini par l'IMA", s: ["md"] },
    d001: { v: "9,94 à 10,26 Å (de la phlogopite à l'annite)", s: ["hom"] },
    dens: { v: "2,78 à 3,36 (de la phlogopite à l'annite)", s: ["hom"] },
    dur: { v: "2 à 3", s: ["hom"] },
    sys: { v: "monoclinique", s: ["hom"] },
  },
  annite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "10,26 Å", s: ["hom", "md"] },
    dens: { v: "3,3", s: ["hom", "md"] },
    dur: { v: "2,5 à 3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "noir, brun", s: ["md"] },
    fr: { v: "elle se rencontre dans le complexe de Cauro-Bastelica (Corse-du-Sud)", s: ["md"] },
  },
  lepidolite: {
    ima: { v: "nom de terrain pour les micas lithinifères (série polylithionite-trilithionite), pas une espèce", s: ["md"] },
    d001: { v: "10,0 Å", s: ["hom"] },
    dens: { v: "2,8 à 2,9", s: ["hom"] },
    dur: { v: "2,5 à 4", s: ["hom"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "le rose domine, avec des teintes violettes, rouge rosé, gris violacé, jaunâtres, ou bien blanches et incolores.", s: ["hom"] },
    fr: { v: "gisements d'Échassières (Allier) : carrière de Beauvoir et site des Colettes", s: ["md"] },
  },
  zinnwaldite: {
    ima: { v: "déclassée : série de micas lithinifères entre sidérophyllite et polylithionite", s: ["md"] },
    d001: { v: "9,82 Å", s: ["hom"] },
    dens: { v: "2,90 à 3,02", s: ["hom"] },
    dur: { v: "2,5 à 4", s: ["hom"] },
    sys: { v: "monoclinique, rarement hexagonal", s: ["hom"] },
    coul: { v: "couleurs gris-brun ou jaune-brun, violet pâle, vert foncé ; les cristaux présentent fréquemment une zonation.", s: ["hom"] },
    fr: { v: "gisements de la mine de l'Éperon, à Échassières (Allier), et de la carrière de Chavence (Saône-et-Loire)", s: ["md"] },
  },
  clintonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,68 Å", s: ["hom", "md"] },
    dens: { v: "3,0 à 3,1", s: ["hom", "md"] },
    dur: { v: "3,5 à 6", s: ["hom", "md"], n: "Dureté de la clintonite : 3,5 pour le Handbook of Mineralogy, 3,5 à 6 pour Mindat." },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "brun, brun doré, brun rougeâtre, vert jaunâtre ou vert foncé", s: ["md"] },
    fr: { v: "Costabonne (Pyrénées-Orientales)", s: ["md"] },
  },
  // ---------- chlorites ----------
  donbassite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,13 Å", s: ["md"] },
    dens: { v: "2,63", s: ["hom", "md"] },
    dur: { v: "2 à 2,5", s: ["md", "hom"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, vert clair", s: ["md"] },
    fr: { v: "gisements d'Échassières (Allier) et de Saint-Paul-de-Fenouillet (Pyrénées-Orientales)", s: ["md", "hom"] },
  },
  cookeite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,1 Å", s: ["hom", "md"] },
    dens: { v: "2,58 à 2,69", s: ["hom", "md"] },
    dur: { v: "2,5 à 3,5", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom"] },
    coul: { v: "on observe surtout du blanc, du vert jaunâtre, du rose, du brun ou du gris ; le lilas est rare.", s: ["md"] },
    fr: { v: "gisements de La Mure (Isère), de la haute vallée de l'Arvan (Savoie) et de Chaillac (Indre)", s: ["md"] },
  },
  sudoite: {
    ima: { v: "espèce reconnue (1966)", s: ["md"] },
    d001: { v: "14,2 Å", s: ["hom", "md"] },
    dens: { v: "2,63 à 2,68", s: ["hom", "md"] },
    dur: { v: "2,5 à 3,5", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc à vert clair", s: ["md"] },
    fr: { v: "Fontrieu (Tarn)", s: ["md"] },
  },
  franklinfurnaceite: {
    ima: { v: "espèce reconnue (1986)", s: ["md"] },
    d001: { v: "14,4 Å", s: ["hom", "md"] },
    dens: { v: "3,66", s: ["hom", "md"] },
    dur: { v: "3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "brun rouge foncé à noir brunâtre", s: ["md"] },
    fr: { v: "elle n'est signalée ni en France ni en Europe : on ne la connaît qu'à Franklin (New Jersey, États-Unis)", s: ["md"] },
  },
  clinochlore: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,0 à 14,1 Å", s: ["md", "hom"] },
    dens: { v: "2,60 à 3,02", s: ["hom", "md"] },
    dur: { v: "2 à 2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "principalement vert : vert jaunâtre, vert olive ou vert noirâtre, mais aussi blanc ou rose.", s: ["md"] },
  },
  chamosite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,1 Å", s: ["hom", "md"] },
    dens: { v: "3,0 à 3,4", s: ["hom", "md"] },
    dur: { v: "2 à 3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "vert, gris-vert, brun-vert, vert foncé, noir", s: ["md"] },
    fr: { v: "Haute-Loire : on la trouve dans les filons du Brivadois, au Gaud, à Pouzols et à Montgros.", s: ["md"] },
  },
  pennantite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,3 Å", s: ["hom", "md"] },
    dens: { v: "2,89 à 3,07", s: ["hom", "md"] },
    dur: { v: "2 à 2,5", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "les teintes vont du rouge orangé au brun rouge, en passant par le brun, le rouge foncé, le vert foncé et le noir.", s: ["md"] },
    fr: { v: "elle n'est pas signalée en France ; en Europe, elle se rencontre dans la vallée de la Lienne (province de Liège, Belgique)", s: ["md"] },
  },
  nimite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,2 Å", s: ["hom", "md"] },
    dens: { v: "3,12", s: ["hom", "md"] },
    dur: { v: "3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert jaunâtre", s: ["md"] },
    fr: { v: "Absente de France, elle est citée en Europe à Sohland an der Spree (Saxe, Allemagne).", s: ["md"] },
  },
  baileychlore: {
    ima: { v: "espèce reconnue (1986)", s: ["md"] },
    d001: { v: "14,3 Å", s: ["hom", "md"] },
    dens: { v: "3,18", s: ["hom", "md"] },
    dur: { v: "2,5 à 3", s: ["md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "vert, vert jaune, bleu clair", s: ["md"] },
    fr: { v: "carrières de Montredon-Labessonnié (Tarn)", s: ["md"] },
  },
  // ---------- interstratifiés ----------
  rectorite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "23,8 Å (période mica + smectite)", s: ["hom", "md"] },
    dens: { v: "2,34 (calculée)", s: ["hom", "md"] },
    dur: { v: "0,5 à 1", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc à brun clair", s: ["md"] },
    fr: { v: "Allevard (Isère), Sibert (Rhône)", s: ["hom", "md"] },
  },
  corrensite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "29,0 Å (période chlorite + smectite)", s: ["md"] },
    dur: { v: "1 à 2", s: ["md"] },
    coul: { v: "vert foncé, vert jaunâtre, brun ou blanc grisâtre", s: ["md", "hom"] },
    fr: { v: "gisements du Mayet-de-Montagne (Allier) et des filons du Brivadois (Haute-Loire)", s: ["md"] },
  },
  hydrobiotite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "12,23 Å", s: ["hom", "md"] },
    dens: { v: "2,49 à 2,64", s: ["hom", "md"] },
    dur: { v: "2,5 à 3", s: ["md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "noirâtre, brunâtre ; jaune doré, rosé", s: ["md"] },
    fr: { v: "Les serpentinites de Haute-Loire fournissent les exemples de La Barbate, Malepeyre et Lisoul.", s: ["md"] },
  },
  tosudite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "30,4 Å (période chlorite + smectite)", s: ["hom", "md"] },
    dens: { v: "2,83", s: ["hom", "md"] },
    dur: { v: "1 à 2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, jaune clair, vert clair, bleu profond à azur", s: ["md"] },
    fr: { v: "gisements d'Échassières (Allier, variété lithinifère) et du Châtelet (Creuse)", s: ["md"] },
  },
  aliettite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "24,8 Å (période talc + smectite)", s: ["hom", "md"] },
    dur: { v: "1 à 2", s: ["md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "incolore, jaune pâle ou vert", s: ["md"] },
    fr: { v: "elle n'est pas signalée en France ; en Europe, elle se rencontre au Monte Chiaro, dans la vallée du Taro (Émilie-Romagne, Italie)", s: ["hom", "md"] },
  },
  kaolinite_smectite: {},
  // ---------- fibreuses ----------
  sepiolite_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    surf: { v: "≈ 120 (faces externes des fibres)", s: ["bs90"] },
    d001: { v: "pic principal à 12,8 Å ; il n'y a pas d'espace entre les feuillets, mais des canaux", s: ["hom", "md"] },
    dens: { v: "2,0 à 2,2", s: ["md"] },
    dur: { v: "2 à 2,5", s: ["hom", "md"] },
    sys: { v: "orthorhombique", s: ["hom", "md"] },
    coul: { v: "blanc, gris clair ou jaune clair", s: ["md"] },
    fr: { v: "gisements de Vieille-Brioude (Haute-Loire), de Chenevières (Marne) et de Montredon-Labessonnié (Tarn)", s: ["md"] },
  },
  palygorskite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "19,5", s: ["cms"] },
    surf: { v: "136 (azote)", s: ["cms"] },
    d001: { v: "10,44 Å (pic principal ; structure à canaux)", s: ["hom", "md"] },
    dens: { v: "2,1 à 2,6", s: ["md"] },
    dur: { v: "2 à 2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, grisâtre, jaunâtre, gris-vert", s: ["md"] },
    fr: { v: "gisements de Trimouns (Ariège), de Cormeilles-en-Parisis (Val-d'Oise) et de Batère (Pyrénées-Orientales)", s: ["md"] },
  },
  // ---------- para-cristallins ----------
  allophane_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,75", s: ["hom", "md"] },
    dur: { v: "3", s: ["hom", "md"] },
    sys: { v: "substance amorphe, sans réseau ordonné à grande distance", s: ["md"] },
    coul: { v: "blanc, bleu pâle à bleu ciel, vert, brun", s: ["md"] },
    fr: { v: "Chessy (Rhône), avec ses mines de cuivre, ou Grézolles (Loire) la donnent à voir.", s: ["hom", "md"] },
  },
  imogolite: {
    ima: { v: "espèce reconnue (refusée en 1962, approuvée en 1986)", s: ["md"] },
    d001: { v: "21,0 Å (pic large : distance entre tubes voisins)", s: ["hom"] },
    dens: { v: "2,70", s: ["hom", "md"] },
    dur: { v: "2 à 3", s: ["hom", "md"] },
    coul: { v: "blanc, bleu, vert, brun, noir", s: ["md", "hom"] },
    fr: { v: "elle n'est pas signalée en France selon Mindat ; en Europe, elle se rencontre dans les sols d'Écosse", s: ["md"] },
  },
  hisingerite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,43 à 2,67", s: ["hom", "md"] },
    dur: { v: "2,5 à 3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "noir, noir brunâtre, brun foncé ou vert foncé", s: ["md"] },
    fr: { v: "On la voit dans le filon du Cantonnier, près de Nontron (Dordogne), ainsi qu'à Canaveilles (Pyrénées-Orientales).", s: ["md"] },
  },
};

// Anciennes adresses d'espèces fusionnées (#espece/endellite → #espece/halloysite)
const ESPECES_ALIAS = { endellite: "halloysite" };

const ValeursEspeces = (function () {
  const LIGNES = [
    ["ima", "Statut IMA"],
    ["cec", "CEC (cmol⁺/kg)"],
    ["surf", "Surface spécifique (m²/g)"],
    ["eau", "Rétention d'eau (g/100 g)"],
    ["eauInter", "Eau entre les feuillets"],
    ["d001", "Espacement basal mesuré"],
    ["dens", "Densité (g/cm³)"],
    ["dur", "Dureté (Mohs)"],
    ["sys", "Système cristallin"],
    ["coul", "Couleurs"],
    ["fr", "En France"],
  ];
  // champs toujours affichés, « non renseignée » s'ils manquent (les autres sont omis)
  const TOUJOURS = { cec: 1, surf: 1, eau: 1, d001: 1, dens: 1, dur: 1, sys: 1, coul: 1, fr: 1 };

  function ordreSources(d) {
    const ordre = [];
    LIGNES.forEach(([k]) => { if (d[k]) d[k].s.forEach((s) => { if (!ordre.includes(s)) ordre.push(s); }); });
    return ordre;
  }

  function html(eid) {
    const d = VAL_ESP[eid];
    if (!d) return "";
    const lignes = LIGNES.map(([k, lib]) => {
      const x = d[k];
      if (!x) return TOUJOURS[k] ? `<tr><td>${lib}</td><td class="esp-nr">non renseignée</td></tr>` : "";
      return `<tr><td>${lib}</td><td>${x.v}</td></tr>`;
    }).join("");
    return `<h4>Propriétés de cette espèce</h4>
      <table class="data esp-valeurs">${lignes}</table>
      <p class="pan-note">« Non renseignée » : pour cette espèce seule, aucune mesure publiée n'a été trouvée ;
      le groupe ci-dessous fournit des repères. Les sources sont en bas de fiche.</p>`;
  }

  // Sources de la fiche + explications, ajoutées à la section Sources (plus d'appels numérotés : demande du 01/10/2026)
  function sources(eid, sectionHTML) {
    const d = VAL_ESP[eid];
    if (!d) return sectionHTML;
    const items = ordreSources(d).map((s) => `<li>${SRC_ESP[s]}</li>`);
    LIGNES.forEach(([k]) => { if (d[k] && d[k].n) items.push(`<li>${d[k].n}</li>`); });
    if (d.nota) items.push(`<li>${d.nota}</li>`);
    const li = items.join("");
    if (sectionHTML && sectionHTML.includes("</ul>")) return sectionHTML.replace("</ul>", li + "</ul>");
    return `<section class="min-sources"><h4>Sources</h4><ul>${li}</ul></section>`;
  }

  // contrôle : chaque espèce a ses valeurs, chaque source citée existe
  function controle() {
    const pb = [];
    Object.keys(ESPECES).forEach((id) => { if (!VAL_ESP[id]) pb.push("sans valeurs : " + id); });
    Object.entries(VAL_ESP).forEach(([id, d]) => {
      if (!ESPECES[id]) pb.push("espèce inconnue : " + id);
      LIGNES.forEach(([k]) => { if (d[k]) {
        if (!d[k].s || !d[k].s.length) pb.push(`${id}.${k} sans source`);
        d[k].s.forEach((s) => { if (!SRC_ESP[s]) pb.push(`${id}.${k} : source inconnue ${s}`); });
      } });
    });
    return pb;
  }

  // appels de note près des valeurs : retirés à sa demande (01/10/2026) ; les sources restent listées en bas de fiche
  function appel() { return ""; }
  // nombre tiré du texte (premier nombre ou milieu de la première fourchette), pour les visuels de nombres.js
  function nombre(eid, k) {
    const d = VAL_ESP[eid];
    if (!d || !d[k]) return null;
    if (typeof d[k].x === "number") return d[k].x;
    const m = d[k].v.split(";")[0].replace(/(\d) (\d)/g, "$1$2").match(/(\d+(?:,\d+)?)(?:\s*(?:[–-]|à)\s*(\d+(?:,\d+)?))?/);
    if (!m) return null;
    const a = parseFloat(m[1].replace(",", ".")), b = m[2] ? parseFloat(m[2].replace(",", ".")) : a;
    return (a + b) / 2;
  }

  return { html, sources, controle, appel, nombre, LIGNES };
})();
