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
    cec: { v: "2,0–3,3", s: ["cms"], n: "CEC de la kaolinite : les deux kaolinites de référence de la Clay Minerals Society donnent 2,0 (KGa-1b) et 3,3 (KGa-2) ; celle de St Austell (Cornouailles) 1,2. La fourchette de la fiche du groupe (3–15, Grim 1953) vaut pour les kaolinites des sols : la CEC monte quand les grains sont plus fins (2,8–5,0 pour des kaolinites bien cristallisées, 16–20 pour des kaolinites fines transportées) et atteint 23–24 quand des feuillets de smectite sont collés à leur surface (Ma et Eggleton 1999)." },
    surf: { v: "10–24 (azote)", s: ["cms", "m10"] },
    d001: { v: "7,16 Å", s: ["hom", "md"] },
    dens: { v: "2,61–2,68", s: ["hom", "md"] },
    dur: { v: "2–2,5", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "blanc à crème et jaune pâle, souvent taché de beige ou de brun", s: ["md", "hom"] },
    fr: { v: "kaolins de Bretagne (Ploemeur, Berrien), des Charentes (Clérac) et du Limousin (Saint-Yrieix) ; argiles plastiques de l'Éocène (Provins)", s: ["g8", "hom"] },
  },
  dickite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "2,8", s: ["t98", "s24"] },
    surf: { v: "3,7–4,7 (BET)", s: ["m10", "s24"], n: "Surface de la dickite : 3,7 et 4,7 m²/g sur l'échantillon de référence japonais JCSS-1301 (Shokozan) ; 13,0 m²/g sur une fraction fine séparée du même gisement (Tone et al. 1998)." },
    d001: { v: "7,15 Å", s: ["hom", "md"] },
    dens: { v: "2,60", s: ["hom", "md"] },
    dur: { v: "2–2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, teinté par ses inclusions ; éclat satiné", s: ["hom", "md"] },
    fr: { v: "Mas d'Alary, bassin de Lodève (Hérault) ; schistes de Steige (Bas-Rhin) ; aussi Condorcet (Drôme), Penestin (Morbihan), Cap Garonne (Var)", s: ["hom", "cl70", "md"] },
  },
  nacrite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,18 Å", s: ["hom", "md"] },
    dens: { v: "2,5–2,7", s: ["hom"] },
    dur: { v: "2–2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, gris, jaunâtre ou brunâtre ; éclat nacré", s: ["md", "hom"] },
    fr: { v: "cavités de dolomie sous le bassin de Lodève (Hérault), en cristaux millimétriques avec la barytine ; aussi Montebras (Creuse), La Villeder (Morbihan), Pech Migé (Aude)", s: ["b96", "md"], n: "Le Handbook of Mineralogy place Lodève en « Haute-Vienne » : Lodève est dans l'Hérault (Buatier et al. 1996)." },
  },
  halloysite: {
    ima: { v: "espèce reconnue, redéfinie en 2026 avec n molécules d'eau : sa forme hydratée (hydrohalloysite, endellite ou halloysite 10 Å) n'est plus une espèce à part", s: ["ima26", "md"] },
    cec: { v: "5–10 sèche (7 Å) ; ≈ 50 hydratée (10 Å), valeur discutée", s: ["b90", "r49"], n: "CEC de l'halloysite : Rivière (1949) mesure 50 méq/100 g sur la forme hydratée et 5 sur la forme sèche, mais un second laboratoire, avec une méthode plus courte, trouve la même valeur pour les deux formes ; les valeurs publiées vont de 2 à 60 (Bailey 1990, Joussein et al. 2005), 14–45 sur quatre halloysites australiennes (Ma et Eggleton 1999), et les plus fortes viennent souvent d'argiles 2:1 mêlées à l'échantillon (Joussein et al. 2005)." },
    surf: { v: "50–60 (forme sèche)", s: ["j05"] },
    eauInter: { v: "≈ 14 g pour 100 g (forme hydratée, 2 H₂O par Al₂Si₂O₅(OH)₄)", s: ["j05"] },
    d001: { v: "7,2–7,6 Å sèche ; 10,0–10,1 Å hydratée", s: ["j05", "bm62", "hom"] },
    dens: { v: "2,55–2,57 sèche ; ≈ 2,1 hydratée (calculée)", s: ["hom", "md"], n: "Densité de l'halloysite hydratée : calculée d'après la maille de la forme 10 Å donnée par Mindat (2 × 294,2 g/mol pour 457,9 Å³), c'est le « 2,14 calculé » de sa fiche Halloysite." },
    dur: { v: "2–2,5", s: ["hom"], n: "Dureté de l'halloysite : Mindat donne 1–2, sans source ; le Handbook of Mineralogy 2–2,5." },
    sys: { v: "monoclinique (structure mal ordonnée)", s: ["hom", "md"] },
    coul: { v: "blanc ; gris, vert, bleu, jaune ou rouge selon les impuretés", s: ["hom"] },
    fr: { v: "Échassières (Allier) ; forme hydratée au Trador, près de Laqueuille (Puy-de-Dôme) ; aussi Saint-Yrieix, Huelgoat, Chessy, Cap Garonne", s: ["n63", "bm62", "md"] },
  },
  odinite: {
    ima: { v: "espèce reconnue (1988)", s: ["md"] },
    d001: { v: "7,15 Å", s: ["hom", "md"] },
    dens: { v: "2,78 (calculée)", s: ["hom"] },
    dur: { v: "2,5", s: ["md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "vert soyeux à vert foncé", s: ["md"] },
    fr: { v: "lagon de Nouvelle-Calédonie, près de Nouméa ; pas signalée en métropole", s: ["md"] },
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
    d001: { v: "7,28–7,29 Å", s: ["hom", "md"] },
    dens: { v: "2,5–2,65", s: ["md", "hom"] },
    dur: { v: "2,5–4", s: ["hom", "md"], n: "Dureté de l'antigorite : 2,5–3,5 pour le Handbook of Mineralogy, 3,5–4 pour Mindat." },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert, vert-bleu, blanc, brun, noir", s: ["md"] },
    fr: { v: "serpentinites de Haute-Loire (Allevier, Champagnac-le-Vieux, Madriat)", s: ["md"] },
  },
  lizardite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,4 Å", s: ["hom", "md"] },
    dens: { v: "2,55", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["hom", "md"] },
    sys: { v: "hexagonal", s: ["hom"] },
    coul: { v: "vert, brun, jaune pâle à blanc", s: ["md", "hom"] },
    fr: { v: "serpentinites de Haute-Loire (Allevier, Vieille-Brioude) et du Puy-de-Dôme", s: ["md"] },
  },
  berthierine: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,04–7,1 Å", s: ["md", "hom"] },
    dens: { v: "3,06 (calculée)", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["md"] },
    sys: { v: "monoclinique, en partie hexagonale", s: ["hom"] },
    coul: { v: "vert olive foncé, vert jaunâtre ; brun rouge (variété titanifère)", s: ["md", "hom"] },
    fr: { v: "minerai de fer lorrain à Hayange (Moselle), localité type ; aussi Poullaouen (Finistère)", s: ["md", "hom"] },
  },
  greenalite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,12 Å", s: ["hom", "md"] },
    dens: { v: "2,85–3,15", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "vert, vert-jaune clair", s: ["md"] },
    fr: { v: "Salsigne (Aude) ; île de Groix (Morbihan)", s: ["hom", "md"] },
  },
  amesite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,0 Å", s: ["hom", "md"] },
    dens: { v: "2,77–2,78", s: ["md", "hom"] },
    dur: { v: "2,5–3", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom"] },
    coul: { v: "bleu-vert grisâtre pâle, blanc, vert pâle ; rose à lilas (variété chromifère)", s: ["md"] },
    fr: { v: "Costabonne (Pyrénées-Orientales), col du Chenaillet (Hautes-Alpes), Saint-Babel (Puy-de-Dôme)", s: ["md"] },
  },
  cronstedtite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,09 Å", s: ["hom", "md"] },
    dens: { v: "3,34–3,35", s: ["hom", "md"] },
    dur: { v: "3,5", s: ["hom", "md"] },
    sys: { v: "triclinique, monoclinique ou hexagonal (selon le polytype)", s: ["hom"] },
    coul: { v: "noir, brun-noir, vert-noir ; vert émeraude en lame mince", s: ["md", "hom"] },
    fr: { v: "Salsigne (Aude), Sainte-Marie-aux-Mines (Haut-Rhin) ; et dans la météorite de Paris", s: ["hom", "md"] },
  },
  nepouite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "7,31 Å", s: ["hom", "md"] },
    dens: { v: "3,24", s: ["hom", "md"] },
    dur: { v: "2–2,5", s: ["md", "hom"] },
    sys: { v: "orthorhombique", s: ["md"] },
    coul: { v: "vert foncé intense à vert terne", s: ["md"] },
    fr: { v: "Nouvelle-Calédonie : mine de Népoui (localité type), Poro, Kouaoua ; pas signalée en métropole", s: ["md"] },
  },
  // ---------- talc et pyrophyllite ----------
  pyrophyllite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    surf: { v: "4,6 (BET)", s: ["m10"] },
    d001: { v: "≈ 9,2 Å", s: ["st"] },
    dens: { v: "2,65–2,90", s: ["hom", "md"] },
    dur: { v: "1–2", s: ["hom", "md"] },
    sys: { v: "monoclinique ou triclinique (selon le polytype)", s: ["hom"] },
    coul: { v: "blanc, gris, bleu, vert ou jaune pâle, vert brunâtre", s: ["md", "hom"] },
    fr: { v: "Chizeuil (Saône-et-Loire), Crozon (Finistère), Vanoise, Villefranche-de-Conflent (Pyrénées-Orientales)", s: ["md"] },
  },
  ferripyrophyllite: {
    ima: { v: "espèce reconnue (1978)", s: ["md"] },
    d001: { v: "9,6 Å", s: ["hom", "md"] },
    dens: { v: "2,97–3,01", s: ["hom", "md"] },
    dur: { v: "1,5–2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "jaune brunâtre", s: ["md"] },
    fr: { v: "pas signalée en France ; localité type en Saxe (puits de Straßen, Eibenstock, Allemagne)", s: ["md"] },
  },
  talc_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,31–9,34 Å", s: ["hom", "md"] },
    dens: { v: "2,58–2,83", s: ["hom", "md"] },
    dur: { v: "1", s: ["hom", "md"] },
    sys: { v: "triclinique ou monoclinique (selon le polytype)", s: ["hom"] },
    coul: { v: "incolore, blanc, vert pâle à vert foncé, brun, gris", s: ["md", "hom"] },
    fr: { v: "Trimouns, au-dessus de Luzenac (Ariège)", s: ["hom"] },
  },
  willemseite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,40 Å", s: ["hom", "md"] },
    dens: { v: "3,31", s: ["hom", "md"] },
    dur: { v: "2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert clair", s: ["md"] },
    fr: { v: "Nouvelle-Calédonie (Poro, Népoui, Goro) ; pas signalée en métropole", s: ["md"] },
  },
  minnesotaite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,54 Å", s: ["hom", "md"] },
    dens: { v: "3,01", s: ["hom", "md"] },
    dur: { v: "1,5–2", s: ["md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "gris verdâtre à vert olive", s: ["md"] },
    fr: { v: "pas signalée en France ; en Europe : La Unión (Murcie, Espagne), presqu'île du Lizard (Cornouailles)", s: ["md"] },
  },
  // ---------- smectites ----------
  montmorillonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "76–120", s: ["cms"], n: "CEC de la montmorillonite : 76 (Wyoming, sodique), 84 (Texas) et 120 (Arizona) pour les argiles de référence de la Clay Minerals Society ; autres mesures : 94 (Wyoming, Tercé 1985), 101–102 (Morel 1958), 115 (Glaeser et al. 1967)." },
    surf: { v: "≈ 800 au total ; 32–97 à l'azote (faces externes)", s: ["s87", "cms"], n: "Surface de la montmorillonite : l'azote n'entre pas entre les feuillets, il ne mesure que les faces externes (32–97 m²/g selon l'argile de référence) ; la surface totale, feuillets compris, est d'environ 800 m²/g (montmorillonite du Wyoming, Tercé 1985)." },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,0 Å", s: ["md"] },
    dens: { v: "2–3", s: ["hom", "md"] },
    dur: { v: "1–2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, chamois, jaune, vert, rarement rose à rouge", s: ["md"] },
    fr: { v: "Montmorillon (Vienne), localité type ; Échassières (Allier), filons du Brivadois (Haute-Loire)", s: ["hom", "md"] },
  },
  beidellite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "≈ 150 (beidellite de Rupsroth, Allemagne)", s: ["g67"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 17,6 Å", s: ["hom", "md"] },
    dens: { v: "2–3", s: ["hom", "md"] },
    dur: { v: "1–2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "blanc, rougeâtre, gris brunâtre", s: ["md"] },
    fr: { v: "Sibert (Rhône) ; Le Mayet-de-Montagne (Allier) ; île de Groix (Morbihan)", s: ["hom", "md"] },
  },
  volkonskoite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,11–2,36", s: ["hom", "md"] },
    dur: { v: "1–2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "bleu-vert, vert foncé, vert herbe", s: ["md"] },
    fr: { v: "pas signalée en France ; en Europe : Toscane (Botro Massaccio, Rosignano Marittimo, Italie)", s: ["md"] },
  },
  nontronite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,4 Å", s: ["hom", "md"] },
    dens: { v: "2,2–2,3", s: ["hom", "md"] },
    dur: { v: "1,5–2", s: ["md", "hom"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert, vert olive, jaune-vert, jaune, orange, brun", s: ["md"] },
    fr: { v: "près de Saint-Pardoux (Dordogne), région de Nontron qui lui a donné son nom ; aussi Bellegarde-en-Forez (Loire), Alligny-en-Morvan (Nièvre)", s: ["hom", "md"] },
  },
  saponite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,4 Å", s: ["md"] },
    dens: { v: "2,24–2,30", s: ["hom", "md"] },
    dur: { v: "1,5–2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, jaune, gris, bleu, vert, rougeâtre, brun", s: ["md"] },
    fr: { v: "Le Baumier à Mirabel et Saint-Jean-le-Centenier (Ardèche) ; île de Groix (Morbihan)", s: ["md"] },
    nota: "CEC et surface de la saponite : les seules mesures trouvées portent sur une saponite de SYNTHÈSE (argile de référence japonaise JCSS-3501 : CEC 99,7 méq/100 g) ; elles ne sont pas reprises ici.",
  },
  hectorite: {
    ima: { v: "espèce reconnue, mais jugée douteuse par l'IMA", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,8 Å", s: ["hom", "md"] },
    dens: { v: "2,3", s: ["md"] },
    dur: { v: "1–2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, crème, brun pâle, marbré", s: ["md"] },
    fr: { v: "Puy Chalard (Puy-de-Dôme) ; île de Groix (Morbihan)", s: ["hom", "md"] },
    nota: "CEC de l'hectorite : l'argile de référence SHCa-1 donne 43,9 méq/100 g, mais elle ne contient qu'environ 50 % d'hectorite pour 43 % de calcite (Chipera et Bish 2001) ; cette valeur n'est donc pas celle de l'espèce.",
  },
  stevensite: {
    ima: { v: "espèce reconnue, mais jugée douteuse par l'IMA", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 12,5–15,5 Å", s: ["hom", "md"] },
    dens: { v: "2,15–2,57", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "blanc, jaune pâle, brun pâle, rose pâle", s: ["md"] },
    fr: { v: "pas signalée en France ; en Europe : Ligurie (mine de Cerchiara, Italie)", s: ["md"] },
  },
  sauconite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "variable avec l'eau ; pic mesuré à 15,4 Å", s: ["hom", "md"] },
    dur: { v: "1–2", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "brun rougeâtre, brun, jaune brunâtre, marbré", s: ["md"] },
    fr: { v: "La Poype (Isère), Can Pei à Montferrer (Pyrénées-Orientales), Cap Garonne (Var)", s: ["md"] },
  },
  swinefordite: {
    ima: { v: "espèce reconnue (1973)", s: ["md"] },
    d001: { v: "12,96 Å", s: ["md"] },
    dur: { v: "1", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, jaune verdâtre, gris olive foncé", s: ["md"] },
    fr: { v: "pas signalée en France ; en Europe : mine de Baumhalde à Todtnau (Forêt-Noire, Allemagne)", s: ["md"] },
  },
  // ---------- vermiculite ----------
  vermiculite_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,15 Å (magnésienne, à l'air)", s: ["hom", "md"] },
    dens: { v: "2,2–2,6", s: ["hom"] },
    dur: { v: "1,5–2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "brun, jaune bronze", s: ["md"] },
    fr: { v: "Le Mayet-de-Montagne (Allier) ; serpentinites de Haute-Loire (Allevier, La Barbate, Saint-Ilpize)", s: ["md"] },
    nota: "CEC de la vermiculite : la seule mesure trouvée (80 méq/100 g à 25 °C, 96 à 80 °C ; Wilhelm et Wey 1961) porte sur une vermiculite commerciale encore en partie micacée ; elle n'est pas reprise ici.",
  },
  // ---------- micas et illites ----------
  illite_e: {
    ima: { v: "nom de série (les illites), pas une espèce au sens de l'IMA", s: ["md"] },
    dens: { v: "2,79–2,80", s: ["md"] },
    dur: { v: "1–2", s: ["md"] },
    coul: { v: "blanc grisâtre à blanc argenté, gris verdâtre", s: ["md"] },
  },
  brammallite: {
    ima: { v: "douteuse : paragonite appauvrie en sodium, l'équivalent sodique de l'illite", s: ["md"] },
    fr: { v: "pas signalée en France ; décrite à Llandybie (pays de Galles)", s: ["md"] },
  },
  sericite: {
    ima: { v: "pas une espèce : muscovite (rarement paragonite) en grains très fins", s: ["md"] },
    surf: { v: "4,6 (BET) ; 10,2 après clivage", s: ["m10"] },
    nota: "Séricite : densité, dureté, couleurs et espacement sont ceux de la muscovite (voir sa fiche).",
  },
  glauconite_e: {
    ima: { v: "nom de série (les glauconites), pas une espèce au sens de l'IMA", s: ["md"] },
    d001: { v: "10,1 Å", s: ["hom"] },
    dens: { v: "2,4–2,95", s: ["hom"] },
    dur: { v: "2", s: ["hom"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "vert herbe, vert-jaune, bleu-vert", s: ["hom"] },
    fr: { v: "Villers-sur-Mer (Calvados) ; montagne de Crussol (Ardèche), Trept (Isère)", s: ["hom", "md"] },
  },
  celadonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,95–3,05", s: ["hom", "md"] },
    dur: { v: "2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "bleu-vert, vert olive, vert pomme", s: ["md"] },
    fr: { v: "carrière de Busséol (Puy-de-Dôme)", s: ["md"] },
  },
  muscovite_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "10,0 Å", s: ["hom", "md"] },
    dens: { v: "2,77–2,88", s: ["hom", "md"] },
    dur: { v: "2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "incolore à blanc argenté, teintée par les impuretés", s: ["md"] },
  },
  paragonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,7 Å", s: ["hom", "md"] },
    dens: { v: "2,85", s: ["hom", "md"] },
    dur: { v: "2,5–3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "incolore, jaune pâle, grisâtre, verdâtre, vert pomme clair", s: ["md"] },
    fr: { v: "île de Groix (Morbihan) ; Mont-Cenis et Vanoise (Savoie)", s: ["md"] },
  },
  margarite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,99–3,08", s: ["hom", "md"] },
    dur: { v: "3,5–4,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "grisâtre, rose pâle, jaune, vert", s: ["md"] },
    fr: { v: "Salau (Ariège), Costabonne (Pyrénées-Orientales)", s: ["md"] },
  },
  phlogopite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,94 Å", s: ["hom", "md"] },
    dens: { v: "2,78–2,85", s: ["hom", "md"] },
    dur: { v: "2–3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "brun, gris, vert, jaune ou brun rougeâtre", s: ["md"] },
  },
  biotite_e: {
    ima: { v: "nom de série entre la phlogopite et l'annite, redéfini par l'IMA", s: ["md"] },
    d001: { v: "9,94–10,26 Å (de la phlogopite à l'annite)", s: ["hom"] },
    dens: { v: "2,78–3,36 (de la phlogopite à l'annite)", s: ["hom"] },
    dur: { v: "2–3", s: ["hom"] },
    sys: { v: "monoclinique", s: ["hom"] },
  },
  annite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "10,26 Å", s: ["hom", "md"] },
    dens: { v: "3,3", s: ["hom", "md"] },
    dur: { v: "2,5–3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "noir, brun", s: ["md"] },
    fr: { v: "complexe de Cauro-Bastelica (Corse-du-Sud)", s: ["md"] },
  },
  lepidolite: {
    ima: { v: "nom de terrain pour les micas lithinifères (série polylithionite–trilithionite), pas une espèce", s: ["md"] },
    d001: { v: "10,0 Å", s: ["hom"] },
    dens: { v: "2,8–2,9", s: ["hom"] },
    dur: { v: "2,5–4", s: ["hom"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "rose, violet, rouge rosé, gris violacé, jaunâtre, blanc, incolore", s: ["hom"] },
    fr: { v: "Échassières (Allier) : carrière de Beauvoir, Les Colettes", s: ["md"] },
  },
  zinnwaldite: {
    ima: { v: "déclassée : série de micas lithinifères entre sidérophyllite et polylithionite", s: ["md"] },
    d001: { v: "9,82 Å", s: ["hom"] },
    dens: { v: "2,90–3,02", s: ["hom"] },
    dur: { v: "2,5–4", s: ["hom"] },
    sys: { v: "monoclinique, rarement hexagonal", s: ["hom"] },
    coul: { v: "gris-brun, jaune-brun, violet pâle, vert foncé, souvent zonée", s: ["hom"] },
    fr: { v: "mine de l'Éperon à Échassières (Allier) ; carrière de Chavence (Saône-et-Loire)", s: ["md"] },
  },
  clintonite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "9,68 Å", s: ["hom", "md"] },
    dens: { v: "3,0–3,1", s: ["hom", "md"] },
    dur: { v: "3,5–6", s: ["hom", "md"], n: "Dureté de la clintonite : 3,5 pour le Handbook of Mineralogy, 3,5–6 pour Mindat." },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "brun, brun doré, brun rouge, vert jaune, vert foncé", s: ["md"] },
    fr: { v: "Costabonne (Pyrénées-Orientales)", s: ["md"] },
  },
  // ---------- chlorites ----------
  donbassite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,13 Å", s: ["md"] },
    dens: { v: "2,63", s: ["hom", "md"] },
    dur: { v: "2–2,5", s: ["md", "hom"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, vert clair", s: ["md"] },
    fr: { v: "Échassières (Allier) ; Saint-Paul-de-Fenouillet (Pyrénées-Orientales)", s: ["md", "hom"] },
  },
  cookeite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,1 Å", s: ["hom", "md"] },
    dens: { v: "2,58–2,69", s: ["hom", "md"] },
    dur: { v: "2,5–3,5", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom"] },
    coul: { v: "blanc, vert jaunâtre, verdâtre, rose, brun, gris, rarement lilas", s: ["md"] },
    fr: { v: "La Mure (Isère), haute vallée de l'Arvan (Savoie), Chaillac (Indre)", s: ["md"] },
  },
  sudoite: {
    ima: { v: "espèce reconnue (1966)", s: ["md"] },
    d001: { v: "14,2 Å", s: ["hom", "md"] },
    dens: { v: "2,63–2,68", s: ["hom", "md"] },
    dur: { v: "2,5–3,5", s: ["md"] },
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
    fr: { v: "pas signalée en France ni en Europe : connue seulement à Franklin (New Jersey, États-Unis)", s: ["md"] },
  },
  clinochlore: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,0–14,1 Å", s: ["md", "hom"] },
    dens: { v: "2,60–3,02", s: ["hom", "md"] },
    dur: { v: "2–2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "vert, vert jaunâtre, vert olive, vert noirâtre, blanc, rose", s: ["md"] },
  },
  chamosite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,1 Å", s: ["hom", "md"] },
    dens: { v: "3,0–3,4", s: ["hom", "md"] },
    dur: { v: "2–3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom"] },
    coul: { v: "vert, gris-vert, brun-vert, vert foncé, noir", s: ["md"] },
    fr: { v: "filons du Brivadois (Haute-Loire : Le Gaud, Pouzols, Montgros)", s: ["md"] },
  },
  pennantite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,3 Å", s: ["hom", "md"] },
    dens: { v: "2,89–3,07", s: ["hom", "md"] },
    dur: { v: "2–2,5", s: ["hom", "md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "rouge orangé, brun rouge, brun, rouge foncé, vert foncé, noir", s: ["md"] },
    fr: { v: "pas signalée en France ; en Europe : vallée de la Lienne (province de Liège, Belgique)", s: ["md"] },
  },
  nimite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "14,2 Å", s: ["hom", "md"] },
    dens: { v: "3,12", s: ["hom", "md"] },
    dur: { v: "3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "vert jaunâtre", s: ["md"] },
    fr: { v: "pas signalée en France ; en Europe : Sohland an der Spree (Saxe, Allemagne)", s: ["md"] },
  },
  baileychlore: {
    ima: { v: "espèce reconnue (1986)", s: ["md"] },
    d001: { v: "14,3 Å", s: ["hom", "md"] },
    dens: { v: "3,18", s: ["hom", "md"] },
    dur: { v: "2,5–3", s: ["md"] },
    sys: { v: "triclinique", s: ["hom", "md"] },
    coul: { v: "vert, vert jaune, bleu clair", s: ["md"] },
    fr: { v: "carrières de Montredon-Labessonnié (Tarn)", s: ["md"] },
  },
  // ---------- interstratifiés ----------
  rectorite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "23,8 Å (période mica + smectite)", s: ["hom", "md"] },
    dens: { v: "2,34 (calculée)", s: ["hom", "md"] },
    dur: { v: "0,5–1", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc à brun clair", s: ["md"] },
    fr: { v: "Allevard (Isère), Sibert (Rhône)", s: ["hom", "md"] },
  },
  corrensite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "29,0 Å (période chlorite + smectite)", s: ["md"] },
    dur: { v: "1–2", s: ["md"] },
    coul: { v: "vert foncé, vert jaune, brun, blanc grisâtre", s: ["md", "hom"] },
    fr: { v: "Le Mayet-de-Montagne (Allier) ; filons du Brivadois (Haute-Loire)", s: ["md"] },
  },
  hydrobiotite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "12,23 Å", s: ["hom", "md"] },
    dens: { v: "2,49–2,64", s: ["hom", "md"] },
    dur: { v: "2,5–3", s: ["md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "noirâtre, brunâtre ; jaune doré, rosé", s: ["md"] },
    fr: { v: "serpentinites de Haute-Loire (La Barbate, Malepeyre, Lisoul)", s: ["md"] },
  },
  tosudite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "30,4 Å (période chlorite + smectite)", s: ["hom", "md"] },
    dens: { v: "2,83", s: ["hom", "md"] },
    dur: { v: "1–2", s: ["md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, jaune clair, vert clair, bleu profond à azur", s: ["md"] },
    fr: { v: "Échassières (Allier, variété lithinifère) ; Le Châtelet (Creuse)", s: ["md"] },
  },
  aliettite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    d001: { v: "24,8 Å (période talc + smectite)", s: ["hom", "md"] },
    dur: { v: "1–2", s: ["md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "incolore, jaune pâle ou vert", s: ["md"] },
    fr: { v: "pas signalée en France ; en Europe : Monte Chiaro, vallée du Taro (Émilie-Romagne, Italie)", s: ["hom", "md"] },
  },
  kaolinite_smectite: {},
  // ---------- fibreuses ----------
  sepiolite_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    surf: { v: "≈ 120 (faces externes des fibres)", s: ["bs90"] },
    d001: { v: "12,8 Å (pic principal ; pas d'espace entre feuillets, des canaux)", s: ["hom", "md"] },
    dens: { v: "2,0–2,2", s: ["md"] },
    dur: { v: "2–2,5", s: ["hom", "md"] },
    sys: { v: "orthorhombique", s: ["hom", "md"] },
    coul: { v: "blanc, gris clair ou jaune clair", s: ["md"] },
    fr: { v: "Vieille-Brioude (Haute-Loire), Chenevières (Marne), Montredon-Labessonnié (Tarn)", s: ["md"] },
  },
  palygorskite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    cec: { v: "19,5", s: ["cms"] },
    surf: { v: "136 (azote)", s: ["cms"] },
    d001: { v: "10,44 Å (pic principal ; structure à canaux)", s: ["hom", "md"] },
    dens: { v: "2,1–2,6", s: ["md"] },
    dur: { v: "2–2,5", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["hom", "md"] },
    coul: { v: "blanc, grisâtre, jaunâtre, gris-vert", s: ["md"] },
    fr: { v: "Trimouns (Ariège), Cormeilles-en-Parisis (Val-d'Oise), Batère (Pyrénées-Orientales)", s: ["md"] },
  },
  // ---------- para-cristallins ----------
  allophane_e: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,75", s: ["hom", "md"] },
    dur: { v: "3", s: ["hom", "md"] },
    sys: { v: "amorphe (pas de réseau ordonné à grande distance)", s: ["md"] },
    coul: { v: "blanc, bleu pâle à bleu ciel, vert, brun", s: ["md"] },
    fr: { v: "mines de cuivre de Chessy (Rhône) ; Grézolles (Loire)", s: ["hom", "md"] },
  },
  imogolite: {
    ima: { v: "espèce reconnue (refusée en 1962, approuvée en 1986)", s: ["md"] },
    d001: { v: "21,0 Å (pic large : distance entre tubes voisins)", s: ["hom"] },
    dens: { v: "2,70", s: ["hom", "md"] },
    dur: { v: "2–3", s: ["hom", "md"] },
    coul: { v: "blanc, bleu, vert, brun, noir", s: ["md", "hom"] },
    fr: { v: "pas signalée en France sur Mindat ; en Europe : sols d'Écosse", s: ["md"] },
  },
  hisingerite: {
    ima: { v: "espèce reconnue", s: ["md"] },
    dens: { v: "2,43–2,67", s: ["hom", "md"] },
    dur: { v: "2,5–3", s: ["hom", "md"] },
    sys: { v: "monoclinique", s: ["md"] },
    coul: { v: "noir, noir brunâtre, brun foncé, vert foncé", s: ["md"] },
    fr: { v: "filon du Cantonnier à Nontron (Dordogne) ; Canaveilles (Pyrénées-Orientales)", s: ["md"] },
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
      <p class="pan-note">« Non renseignée » : aucune mesure publiée sur cette espèce seule n'a été trouvée ;
      les valeurs du groupe, ci-dessous, servent de repère. Sources en bas de fiche.</p>`;
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
    const m = d[k].v.split(";")[0].replace(/(\d) (\d)/g, "$1$2").match(/(\d+(?:,\d+)?)(?:\s*[–-]\s*(\d+(?:,\d+)?))?/);
    if (!m) return null;
    const a = parseFloat(m[1].replace(",", ".")), b = m[2] ? parseFloat(m[2].replace(",", ".")) : a;
    return (a + b) / 2;
  }

  return { html, sources, controle, appel, nombre, LIGNES };
})();
