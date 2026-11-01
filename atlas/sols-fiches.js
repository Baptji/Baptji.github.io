// ============ Les types de sols du Référentiel pédologique 2008 (25/10/2026, PROTOTYPE à valider) — routes #sols et #sol/<id> ============
// Sa demande (25/10, maquette C retenue) : une fiche par type de sol avec « toutes les infos qu'on retrouve dans le Référentiel
// pédologique », rattachée à une référence de la WRB internationale. Les 110 références du Référentiel 2008 sont listées
// (p. 402-403), avec leur équivalent WRB 2006 donné par le Référentiel (annexe 5). PROTOTYPE : seul le grand ensemble des
// LUVISOLS a ses fiches complètes ; les autres références s'affichent dans la liste, grisées, « fiche à venir ».
// Droit d'auteur : le Référentiel (AFES, Quæ) n'est pas recopié. Chaque fiche en reprend TOUTES les rubriques (conditions de
// formation, facteurs, horizons de référence, séquences d'horizons, critères chiffrés, qualificatifs, exemples, différences avec
// les autres références, relations avec la WRB), reformulées et condensées, page citée.
// WRB 2022 (4ᵉ édition, IUSS) : rattachement établi par l'atlas d'après la clé et les définitions de 2022 (horizon argique,
// propriétés rétiques, qualificatifs), avec la raison écrite ; l'équivalent 2006 du Référentiel reste affiché à côté.
// API : SolsFiches.index() (rend #main), SolsFiches.page(id), SolsFiches.existe(id), SolsFiches.controle() → [] attendu, REFS, GER.
(function () {
  "use strict";
  // ---------- 1. Les 110 références (id | nom | grand ensemble | WRB 2006 d'après l'annexe 5 | page) ----------
  const LISTE = `alocrisol-typique|Alocrisol typique|alocrisols|Cambisols (Hyperdystric)|70
alocrisol-humique|Alocrisol humique|alocrisols|Cambic Umbrisols (Hyperdystric)|70
vitrandosol|Vitrandosol|andosols|Vitric Andosols|80
silandosol-eutrique|Silandosol eutrique|andosols|Silandic Andosols (Eutric)|80
silandosol-dystrique|Silandosol dystrique|andosols|Silandic Andosols (Dystric)|80
silandosol-perhydrique|Silandosol perhydrique|andosols|Hydric Silandic Andosols|80
aluandosol-haplique|Aluandosol haplique|andosols|Aluandic Andosols|81
aluandosol-perhydrique|Aluandosol perhydrique|andosols|Hydric Aluandic Andosols|81
anthroposol-transforme|Anthroposol transformé|anthroposols|Anthrosols|91
anthroposol-artificiel|Anthroposol artificiel|anthroposols|Technosols|91
anthroposol-reconstitue|Anthroposol reconstitué|anthroposols|non pris en compte|92
anthroposol-construit|Anthroposol construit|anthroposols|Technosols (Transportic)|94
anthroposol-archeologique|Anthroposol archéologique|anthroposols|non pris en compte|94
arenosol|Arénosol|arenosols|Arenosols|99
brunisol-eutrique|Brunisol eutrique|brunisols|Cambisols (Hypereutric ou Eutric)|104
brunisol-dystrique|Brunisol dystrique|brunisols|Cambisols (Dystric)|104
rendosol|Rendosol|calciques|Rendzic Leptosols|111
calcosol|Calcosol|calciques|Cambisols (Calcaric)|111
dolomitosol|Dolomitosol|calciques|Cambisols (Dolomitic)|112
rendisol|Rendisol|calciques|Rendzic Leptosols|112
calcisol|Calcisol|calciques|Cambisols (Hypereutric)|112
magnesisol|Magnésisol|calciques|Cambisols (Hypereutric, Magnesic)|113
calcarisol|Calcarisol|calciques|Epipetric Calcisols|113
chernosol-haplique|Chernosol haplique|chernosols|Calcic Chernozems|127
chernosol-typique|Chernosol typique|chernosols|Voronic Chernozems|127
chernosol-melanoluvique|Chernosol mélanoluvique|chernosols|Luvic Chernozems|127
colluviosol|Colluviosol|colluviosols|Colluvic Regosols|130
cryosol-histique|Cryosol histique|cryosols|Histic Cryosols ou Cryic Histosols|140
cryosol-mineral|Cryosol minéral|cryosols|Haplic, Umbric ou Spodic Cryosols|140
ferrallitisol-meuble|Ferrallitisol meuble|ferrallitisols|Ferralsols, Lixisols|157
ferrallitisol-nodulaire|Ferrallitisol nodulaire|ferrallitisols|Ferralic Hyperferric Plinthosols|158
ferrallitisol-petroxydique|Ferrallitisol pétroxydique|ferrallitisols|Plinthosols (Petric)|159
ferrallitisol-duroxydique|Ferrallitisol duroxydique|ferrallitisols|Plinthosols|159
oxydisol-meuble|Oxydisol meuble|ferrallitisols|Ferric Ferralsols (Geric)|160
oxydisol-nodulaire|Oxydisol nodulaire|ferrallitisols|Hyperferric Plinthosols|160
oxydisol-petroxydique|Oxydisol pétroxydique|ferrallitisols|Ferric Plinthosols (Petric)|161
ferruginosol-meuble|Ferruginosol meuble|ferruginosols|Lixisols ou Acrisols|173
ferruginosol-semiluvique|Ferruginosol semiluvique|ferruginosols|Lixisols ou Acrisols|174
ferruginosol-luvique|Ferruginosol luvique|ferruginosols|Lixisols ou Acrisols|174
ferruginosol-petroxydique|Ferruginosol pétroxydique|ferruginosols|Plinthosols (Petric)|175
fersialsol-carbonate|Fersialsol carbonaté|fersialsols|Haplic Cambisols (Calcaric, Chromic)|181
fersialsol-calcique|Fersialsol calcique|fersialsols|Haplic Cambisols (Eutric, Chromic)|181
fersialsol-insature|Fersialsol insaturé|fersialsols|Haplic Cambisols (Eutric ou Dystric, Chromic)|181
fersialsol-eluvique|Fersialsol éluvique|fersialsols|Haplic Luvisols (Chromic)|181
fluviosol-brut|Fluviosol brut|fluviosols|Fluvisols|185
fluviosol-juvenile|Fluviosol juvénile|fluviosols|Fluvisols|185
fluviosol-typique|Fluviosol typique|fluviosols|Fluvisols|185
fluviosol-brunifie|Fluviosol brunifié|fluviosols|Fluvic Cambisols|186
grisol-eluvique|Grisol éluvique|grisols|Greyic Phaeozems (Albic)|193
grisol-degrade|Grisol dégradé|grisols|Greyic Phaeozems (Glossalbic)|194
grisol-haplique|Grisol haplique|grisols|Greyic Phaeozems|194
gypsosol-haplique|Gypsosol haplique|gypsosols|Gypsisols|198
gypsosol-petrogypsique|Gypsosol pétrogypsique|gypsosols|Epipetric Gypsisols|198
histosol-fibrique|Histosol fibrique|histosols|Fibric Histosols|207
histosol-mesique|Histosol mésique|histosols|Hemic Histosols|207
histosol-saprique|Histosol saprique|histosols|Sapric Histosols|207
histosol-composite|Histosol composite|histosols|Histosols|208
histosol-leptique|Histosol leptique|histosols|Epileptic Histosols|208
leptismectisol|Leptismectisol|leptismectisols|Epileptic Vertisols|217
lithosol|Lithosol|lithosols|Lithic Leptosols|219
neoluvisol|Néoluvisol|luvisols|Luvic Cambisols|225
luvisol-typique|Luvisol typique|luvisols|Haplic Luvisols|225
luvisol-degrade|Luvisol dégradé|luvisols|Haplic Albeluvisols|226
luvisol-dernique|Luvisol dernique|luvisols|Albeluvisols|226
luvisol-tronque|Luvisol tronqué|luvisols|Luvisols (tronqués)|227
quasi-luvisol|Quasi-luvisol|luvisols|Ruptic Luvisols|227
nitosol|Nitosol|nitosols|Nitisols|233
organosol-holorganique|Organosol holorganique|organosols|Folic Histosols|239
organosol-calcaire|Organosol calcaire|organosols|Folic Umbrisols (Hyperhumic, Calcaric)|239
organosol-sature|Organosol saturé|organosols|Folic ou Mollic Umbrisols (Hypereutric)|239
organosol-insature|Organosol insaturé|organosols|Folic Umbrisols (Hyperhumic)|240
pelosol-typique|Pélosol typique|pelosols|Epistagnic Regosols (Clayic)|244
pelosol-brunifie|Pélosol brunifié|pelosols|Vertic Cambisols (Clayic)|245
pelosol-differencie|Pélosol différencié|pelosols|Epistagnic Vertic Cambisols ou Planosols|246
peyrosol|Peyrosol|peyrosols|Hyperskeletic Leptosols|249
phaeosol-haplique|Phæosol haplique|phaeosols|Haplic Phaeozems|256
phaeosol-melanoluvique|Phæosol mélanoluvique|phaeosols|Luvic Phaeozems|257
planosol-typique|Planosol typique|planosols|Planosols|261
planosol-distal|Planosol distal|planosols|Planosols|261
planosol-structural|Planosol structural|planosols|non classé en Planosols|261
podzosol-ocrique|Podzosol ocrique|podzosols|Entic Podzols|268
podzosol-meuble|Podzosol meuble|podzosols|Haplic ou Albic Podzols|268
podzosol-durique|Podzosol durique|podzosols|Ortsteinic Albic Podzols|269
podzosol-humique|Podzosol humique|podzosols|Umbric ou Entic Podzols|270
podzosol-humo-durique|Podzosol humo-durique|podzosols|Umbric-Ortsteinic Podzols|270
podzosol-eluvique|Podzosol éluvique|podzosols|Albic Arenosols|270
podzosol-placique|Podzosol placique|podzosols|Placic Albic Podzols|270
post-podzosol|Post-podzosol|podzosols|Aric Podzols|271
rankosol|Rankosol|rankosols|Umbric Leptosols, ou Leptosols (Dystric)|276
reductisol-typique|Réductisol typique|redoxisols|Gleysols|282
reductisol-stagnique|Réductisol stagnique|redoxisols|Gleysols|282
redoxisol|Rédoxisol|redoxisols|Stagnosols|282
regosol|Régosol|regosols|Leptosols (non Lithic)|291
salisol-chloruro-sulfate|Salisol chloruro-sulfaté|salisols|Solonchaks (Chloridic ou Sulphatic)|296
salisol-carbonate|Salisol carbonaté|salisols|Solonchaks (Carbonatic)|296
sodisol-indifferencie|Sodisol indifférencié|salisols|Solonetz|297
sodisol-solonetzique|Sodisol solonetzique|salisols|Haplic Solonetz|297
sodisol-solodise|Sodisol solodisé|salisols|Solonetz (Albic)|297
sodisalisol|Sodisalisol|salisols|Endosalic Solonetz|297
salisodisol|Salisodisol|salisols|Episalic Solonetz|298
thalassosol-brut|Thalassosol brut|thalassosols|Tidalic Fluvisols|304
thalassosol-juvenile|Thalassosol juvénile|thalassosols|Tidalic Fluvisols|304
thalassosol-polderise|Thalassosol poldérisé|thalassosols|Fluvisols|304
thiosol|Thiosol|thiosols|Fluvisols ou Gleysols (Protothionic)|309
sulfatosol|Sulfatosol|thiosols|Fluvisols ou Gleysols (Hyperthionic ou Orthothionic)|309
veracrisol|Veracrisol|veracrisols|Vermic Umbrisols|313
lithovertisol|Lithovertisol|vertisols|Vertisols|322
topovertisol|Topovertisol|vertisols|Vertisols|322
paravertisol-haplique|Paravertisol haplique|vertisols|Vertisols|323
paravertisol-planosolique|Paravertisol planosolique|vertisols|Vertisols (Albic)|323`;
  const REFS = {};
  LISTE.split("\n").forEach((l) => { const [id, nom, ger, wrb2006, p] = l.split("|"); REFS[id] = { id, nom, ger, wrb2006, page: +p }; });

  // grands ensembles de références (34 chapitres), rangés dans les 14 catégories de l'annexe 8 du Référentiel (p. 399)
  const GER_NOMS = {
    alocrisols: "Alocrisols", andosols: "Andosols", anthroposols: "Anthroposols", arenosols: "Arénosols", brunisols: "Brunisols",
    calciques: "Sols calcaires et calciques", chernosols: "Chernosols", colluviosols: "Colluviosols", cryosols: "Cryosols",
    ferrallitisols: "Ferrallitisols et oxydisols", ferruginosols: "Ferruginosols", fersialsols: "Fersialsols", fluviosols: "Fluviosols",
    grisols: "Grisols", gypsosols: "Gypsosols", histosols: "Histosols", leptismectisols: "Leptismectisols", lithosols: "Lithosols",
    luvisols: "Luvisols", nitosols: "Nitosols", organosols: "Organosols", pelosols: "Pélosols", peyrosols: "Peyrosols",
    phaeosols: "Phæosols", planosols: "Planosols", podzosols: "Podzosols", rankosols: "Rankosols", redoxisols: "Réductisols et rédoxisols",
    regosols: "Régosols", salisols: "Salisols et sodisols", thalassosols: "Thalassosols", thiosols: "Thiosols et sulfatosols",
    veracrisols: "Veracrisols", vertisols: "Vertisols",
  };
  const CATEGORIES = [
    ["les actions de l'homme", ["anthroposols"]],
    ["les alternances de gel et de dégel", ["cryosols"]],
    ["un faible développement", ["lithosols", "regosols", "rankosols"]],
    ["des excès d'eau permanents ou temporaires", ["redoxisols", "histosols"]],
    ["une forte teneur en matières organiques ou des horizons organo-minéraux noirs", ["chernosols", "phaeosols", "grisols", "organosols", "veracrisols"]],
    ["une altération spécifique, souvent liée au climat", ["brunisols", "podzosols", "alocrisols", "fersialsols", "ferruginosols", "ferrallitisols", "nitosols"]],
    ["leur position dans le paysage", ["fluviosols", "thalassosols", "colluviosols", "thiosols"]],
    ["une forte différenciation texturale", ["luvisols", "planosols"]],
    ["un matériau carbonaté ou la présence de carbonates", ["calciques"]],
    ["l'abondance des sulfates ou des chlorures", ["gypsosols", "salisols"]],
    ["une argile lourde", ["leptismectisols", "vertisols", "pelosols"]],
    ["la dominance des sables ou des éléments grossiers", ["arenosols", "peyrosols"]],
    ["un matériau volcanique", ["andosols"]],
  ];

  // ---------- 2. Contenu des fiches (PROTOTYPE : Luvisols) ----------
  // GER[x] : rubriques communes au grand ensemble ; FICHES[id] : rubriques propres à la référence. Textes reformulés.
  // Profils : mêmes motifs que les fosses de « Le sol au fil du temps » (SolsTemps.MOTIFS), épaisseurs indicatives.
  const GER = {
    luvisols: {
      pages: "221-231",
      formation: [
        "Le processus dominant est l'argilluviation : dans un matériau unique, sans discontinuité, l'argile fine se détache dans les horizons supérieurs, descend avec l'eau qui s'infiltre et se dépose plus bas. Il en résulte deux étages : des horizons E appauvris en argile et en fer, pâles, peu structurés et perméables, au-dessus d'horizons BT enrichis, plus colorés, à structure polyédrique ou prismatique et moins perméables.",
        "Le départ des cations (lixiviation) et le comportement du fer et de l'aluminium conditionnent l'évolution. Tant que l'oxydo-réduction reste faible, le fer migre avec l'argile.",
        "L'évolution se fait en phases : altération initiale, illuviation des argiles fines puis des plus grossières, puis « dégradation » des BT, qui associe la séparation du fer et de l'argile, l'enrichissement relatif en limons et sables dans E et dans des langues (glosses), et la transformation des minéraux argileux 2:1 (vermiculitisation). Elle prend une forme glossique dans les matériaux qui se structurent bien, planosolique dans ceux qui se structurent mal, ou diffuse.",
      ],
      facteurs: [
        ["Matériau", "Facteur le plus décisif : matériaux meubles, profonds, assez filtrants, peu ou pas calcaires, surtout les limons éoliens (lœss) de tous âges ; aussi des alluvions et des arènes très fines. Constituants dits siallitiques dans le BT : argiles 2:1 dominantes, CEC de l'argile supérieure à 24 cmol+/kg, peu de fer facilement extractible."],
        ["Relief", "Surtout des surfaces planes ou presque (plateaux, terrasses, replats), où l'eau circule verticalement."],
        ["Climat", "Le climat atlantique tempéré humide est le plus favorable ; plus continental ou méditerranéen, la différenciation est moins intense ou prend d'autres formes."],
        ["Végétation", "Type d'enracinement, qualité des litières et activité biologique modulent l'intensité du lessivage."],
        ["En France", "Limons du nord-ouest (séquence de Jamagne), boulbènes du sud-ouest à hydromorphie précoce, limons anciens de l'est souvent polygénétiques, luvisols rubéfiés des plaines atlantiques sur calcaire, sols des hautes terrasses en bordure des massifs anciens."],
      ],
      horizons: [
        ["E", "Horizon éluvial, appauvri en argile et en fer ; Eg s'il montre des traits d'oxydo-réduction, Ea s'il est fortement blanchi (albique)."],
        ["BT", "Horizon argilluvial : plus argileux que les horizons A, E, S ou C du même solum ; au moins 15 cm d'épaisseur (ou bandes d'au moins 0,5 cm totalisant plus de 15 cm) ; revêtements argileux orientés sur les faces des agrégats, dans les pores, ou ponts d'argile entre les grains de sable. L'argile est souvent accompagnée de limons très fins (2 à 10 µm)."],
        ["BTd", "BT « dégradé » : pénétré d'interdigitations ou de langues d'horizon E (langues plus profondes que larges, d'au moins 0,5 cm en milieu argileux à 1,5 cm en milieu limoneux ou sableux, occupant plus de 15 % du volume concerné), ou dégradé de façon diffuse."],
        ["LBT", "BT remonté en surface après une érosion partielle, labouré : plus riche en matière organique, structure travaillée."],
        ["Autres", "Souvent aussi OF, OH, A, Ae, LA, LE, BTd, BTgd ou C ; parfois Ea, BTcn (BT riche en nodules ferrugineux)."],
      ],
      qualificatifs: [
        ["eutrique / dystrique", "Taux de saturation (S/CEC à pH 7) du BT supérieur ou inférieur à 50 % ; oligosaturé 20 à 50 %, mésosaturé 50 à 80 %, subsaturé 80 à 95 %, resaturé plus de 80 % sur tout le solum après amendements."],
        ["sodisé", "Sodium échangeable entre 6 et 15 % de la CEC dans le BT."],
        ["rédoxique", "Caractère rédoxique (-g) apparaissant entre 50 et 80 cm."],
        ["agrique", "Revêtements argileux associés à de la matière organique dans le BT, dus à la culture."],
        ["vertique, bathyfragique, ferronodulaire", "Caractères vertiques à la base du BT ; fragipan en profondeur ; BTcn riche en nodules ou enduits ferrugineux."],
        ["pachique, cumulique", "BT débutant à plus de 1 m ; horizons E anormalement épais (passage aux sols colluviaux)."],
        ["lamellique, mélanoluvique, rubéfié", "BT en bandes argileuses de plus de 15 cm cumulés ; revêtements argileux humifères noirs ou gris ; ferri-argilanes rouges qui colorent le BT."],
        ["albique, glossique, planosolique, à dégradation diffuse", "Propres aux luvisols dégradés et derniques : E albique ; dégradation en langues ; limite E/BT aplanie ; dégradation en taches et interdigitations."],
        ["à micro-podzol, podzolisé, paléorédoxique", "Épisolum podzolique de moins de 20 cm en surface ; podzolisation débutante dans E ; traits rédoxiques hérités de conditions anciennes."],
        ["assaini, drainé, amendé, chaulé…", "Qualificatifs des luvisols intensément cultivés."],
      ],
      differences: [
        ["Brunisols", "Les luvisols ont le couple E/BT et un indice de différenciation texturale (IDT) supérieur à 1,3 ; les revêtements argileux de certains horizons S de brunisols restent trop faibles pour former un BT."],
        ["Planosols", "Les luvisols dégradés planosoliques sont des intergrades : le planosol exige un changement textural brutal, un matériau plus argileux et une circulation d'eau surtout latérale."],
        ["Podzosols", "Une micropodzolisation de Ae et E dans un luvisol dégradé annonce, à long terme, une évolution vers les podzosols."],
        ["Rédoxisols", "Le colmatage du BT par l'argile fine provoque des engorgements temporaires ; si l'hydromorphie apparaît à moins de 50 cm, rattachement double obligatoire (luvisol typique-rédoxisol, luvisol dégradé-rédoxisol)."],
        ["Fersialsols", "Transition progressive vers les fersialsols éluviques ; le luvisol a peu de fer facilement extractible (moins de 0,20 du fer total), une couleur moins rouge que 5 YR et un BT non micropolyédrique."],
      ],
    },
  };
  const FICHES = {
    "neoluvisol": {
      seq: { foret: "A / E / BT", culture: "LA / E / BT ou LA / BT" },
      h: [["A", 0, 18, "hum"], ["E", 18, 35, "e"], ["BT", 35, 85, "st"], ["BC", 85, 110, "stc"], ["C", 110, 140, "c"]],
      description: "Premier stade des luvisols : l'horizon E est seulement modérément appauvri, encore coloré, assez bien structuré et aéré ; la transition vers le BT est progressive.",
      criteres: ["Argile de E inférieure à 10 % : le BT en contient au moins 3 points de plus.", "Argile de E entre 10 et 30 % : IDT (argile du BT ÷ argile de E) compris entre 1,3 et 1,8.", "Argile de E supérieure à 30 % : le BT en contient au moins 9 points de plus."],
      exemples: ["Néoluvisol resaturé, cumulique, agrique, issu de lœss."],
      vient: ["brunisol-eutrique"], va: ["luvisol-typique"],
      wrb2022: { nom: "Luvisols (Cutanic)", raison: "Les revêtements argileux du BT suffisent à en faire un horizon argique en 2022 (plus de 15 % des faces d'agrégats revêtues), ce qui mène aux Luvisols ; si le BT ne remplit pas ces critères, le solum reste un Cambisol. Le qualificatif Luvic des Cambisols de 2006 n'existe plus." },
    },
    "luvisol-typique": {
      seq: { foret: "Ae / E / BT", culture: "LA ou LE / E / BT ou LA ou LE / BT" },
      h: [["Ae", 0, 15, "ae"], ["E", 15, 40, "e"], ["BT", 40, 95, "btg"], ["BCg", 95, 115, "stc"], ["C", 115, 150, "c"]],
      description: "L'horizon E est nettement appauvri en argile et en fer, un peu décoloré, à structure faible ou instable ; le BT est typique, plus riche en argile fine que celui du néoluvisol ; la transition E/BT est nette. Des traits d'oxydo-réduction au contact E/BT sont fréquents (Eg, BTg).",
      criteres: ["Argile de E inférieure à 10 % : le BT en contient au moins 8 points de plus.", "Argile de E entre 10 et 30 % : IDT supérieur à 1,8.", "Argile de E supérieure à 30 % : le BT en contient au moins 24 points de plus."],
      exemples: ["Luvisol typique eutrique, rédoxique, agrique, issu de limon récent.", "Luvisol typique mésosaturé, sableux en surface, lamellique, issu d'une formation calcaire redistribuée au Quaternaire.", "Luvisol typique polygénétique, rubéfié, dans l'argile de décarbonatation des calcaires jurassiques (terres d'Aubues de Bourgogne)."],
      vient: ["neoluvisol"], va: ["luvisol-degrade", "luvisol-tronque"],
      wrb2022: { nom: "Luvisols (Haplic, ou Albic, Stagnic selon le cas)", raison: "Le BT est un horizon argique débutant à moins de 100 cm, sans propriétés rétiques à son sommet : groupe des Luvisols, inchangé depuis 2006." },
    },
    "luvisol-degrade": {
      seq: { foret: "Ae / E / Eg / BTgd", culture: "LE / Eg / BTgd ou LE / BTgd" },
      h: [["Ae", 0, 10, "ae"], ["Eg", 10, 50, "eg"], ["BTgd", 50, 85, "glosses"], ["BTg", 85, 112, "btg"], ["Cg", 112, 150, "cg"]],
      description: "E fortement décoloré, en partie albique, surtout au contact du BT et dans les langues qui le pénètrent ; à sa base, des concentrations et indurations de fer et de manganèse fossilisent souvent des restes de BT. Le BTgd porte des langues ou des interdigitations de matériau appauvri, de texture proche de celle de E.",
      criteres: ["IDT généralement supérieur à 1,8.", "La présence d'horizons -g fait partie de la définition.", "Horizon -g fonctionnel à moins de 50 cm : rattachement double luvisol dégradé-rédoxisol."],
      exemples: ["Luvisol dégradé glossique, drainé, resaturé, limono-sableux en surface.", "Luvisol dégradé planosolique, dystrique, albique, d'alluvions anciennes."],
      vient: ["luvisol-typique"], va: ["planosol-typique"],
      wrb2022: { nom: "Retisols", raison: "Langues de matériau appauvri pénétrant le sommet de l'horizon argique : propriétés rétiques. Les Albeluvisols de 2006 sont devenus les Retisols en 2014 ; qualificatifs fréquents Glossic, Albic, Stagnic." },
    },
    "luvisol-dernique": {
      seq: { foret: "Ae / E / Ea / BTd", culture: "" },
      h: [["Ae", 0, 8, "ae"], ["E", 8, 25, "e"], ["Ea", 25, 38, "egris"], ["BTd", 38, 80, "glosses"], ["C", 80, 115, "c"]],
      description: "Luvisol de climat continental : un liseré très délavé marque le contact E/BTd, plus net que dans les luvisols dégradés atlantiques, avec une tendance à la planosolisation. Les processus (séparation du fer et de l'argile, du squelette et du plasma, altération, dégradation des minéraux) sont plus intenses dans un volume plus mince, près de la surface ; la désaturation est forte en surface, faible en profondeur.",
      criteres: ["IDT supérieur à 1,8, souvent bien davantage.", "E souvent divisé en une partie supérieure ordinaire et une partie inférieure blanchie (albique).", "Horizon Eg fonctionnel à moins de 50 cm : rattachement double luvisol dernique-rédoxisol."],
      exemples: ["Luvisol dernique dystrique, rédoxique."],
      vient: ["luvisol-typique"], va: [],
      wrb2022: { nom: "Retisols (Albic)", raison: "Liseré blanchi et pénétrations au sommet de l'horizon argique : propriétés rétiques, E albique. Ce sont les « sols derno-podzoliques » des auteurs russes." },
    },
    "luvisol-tronque": {
      seq: { foret: "A / BT (pas d'horizon E de plus de 10 cm)", culture: "LBT / BT" },
      h: [["LBT", 0, 25, "btg"], ["BT", 25, 75, "bt"], ["C", 75, 110, "c"]],
      description: "L'érosion a enlevé les horizons éluviaux : le contraste E/BT caractéristique des luvisols a disparu. Sous culture, l'horizon labouré a la texture et la structure d'un BT plutôt que d'un E.",
      criteres: ["Sous forêt, aucun horizon E de plus de 10 cm.", "Sous culture, horizon labouré aux propriétés d'un BT."],
      exemples: ["Luvisol tronqué eutrique, de rebord de plateau, issu de lœss."],
      vient: ["luvisol-typique"], va: ["quasi-luvisol"],
      wrb2022: { nom: "Luvisols", raison: "L'horizon argique peut affleurer après érosion ; la WRB n'a pas de qualificatif « tronqué »." },
    },
    "quasi-luvisol": {
      seq: { foret: "E / II BT", culture: "" },
      h: [["LE", 0, 30, "e"], ["II BT", 30, 85, "btg"], ["C", 85, 120, "c"]],
      description: "Référence d'apparentement : après la troncature d'un luvisol typique ou dégradé, qui a emporté les horizons éluviaux et une bonne part du BT, des matériaux limoneux de type LE venus de quelques centaines de mètres ou plus se sont déposés par-dessus. Le BT résiduel garde la morphologie d'un BT profond (revêtements, structure polyédrique grossière). Exemples en Alsace et en Brie.",
      criteres: ["Trois phases : formation d'un luvisol, troncature jusque dans le BT, dépôt de matériaux de type LE.", "Discontinuité (notée II) entre l'apport et le BT."],
      exemples: [],
      vient: ["luvisol-tronque"], va: [],
      wrb2022: { nom: "Luvisols (Cutanic)", raison: "Les revêtements argileux du BT en font un horizon argique malgré la discontinuité qui le sépare de l'apport. Le qualificatif Ruptic de 2006 n'existe plus en 2022." },
    },
  };
  const existe = (id) => !!FICHES[id];

  // ---------- 3. Pages ----------
  const typo = (h) => (window.SolsTemps && SolsTemps.typoHTML) ? SolsTemps.typoHTML(h) : h;
  const lien = (id) => REFS[id] ? (existe(id) ? `<a href="#sol/${id}">${REFS[id].nom}</a>` : `<span class="sf-gris">${REFS[id].nom}</span>`) : id;
  function index() {
    const nFaites = Object.keys(FICHES).length;
    const cats = CATEGORIES.map(([titre, gers]) => `<section class="sf-cat"><h3>Sols dominés par ${titre}</h3>
      ${gers.map((g) => `<div class="sf-ger"><b>${GER_NOMS[g]}</b><div class="sf-refs">${Object.values(REFS).filter((r) => r.ger === g).map((r) =>
        existe(r.id) ? `<a class="chip" href="#sol/${r.id}">${r.nom}</a>` : `<span class="chip sf-chip-gris">${r.nom}</span>`).join("")}</div></div>`).join("")}</section>`).join("");
    document.getElementById("main").innerHTML = typo(`<div class="sf-page">
      ${window.SolsTemps ? SolsTemps.defsHTML() : ""}
      <div class="card hero">
        ${typeof icone === "function" ? icone("sol", 96, "hero-icone") : ""}
        <p class="hub-surtitre">Pédologie · Les sols</p>
        <h1>Les types de sols</h1>
        <p class="sub" style="font-size:15px;max-width:75ch">Le Référentiel pédologique de l'Association française pour l'étude du sol décrit 110 références de sols,
        réunies en 34 grands ensembles. Chacune a son équivalent dans la classification internationale, la World Reference Base.</p>
      </div>
      <div class="card"><p class="sf-avance">${nFaites} fiches sur ${Object.keys(REFS).length} ; les autres sont à venir.</p>${cats}</div>
      <details class="card sources-roche"><summary><h2 style="display:inline">Sources</h2></summary>
        <p class="page-source">Liste des 110 références et regroupement des grands ensembles en catégories : Baize D., Girard M.-C. (coord.) (2009), <i>Référentiel pédologique 2008</i>, AFES, Quæ, p. 399 et 402-403.</p>
      </details>
    </div>`);
    document.title = "Les types de sols, Atlas Sol";
    window.scrollTo({ top: 0 });
  }
  function page(id) {
    const r = REFS[id], f = FICHES[id];
    if (!r) return index();
    const g = GER[r.ger];
    if (!f || !g) { index(); return; }
    const profil = window.SolsTemps ? SolsTemps.fossesSVG([{ rp: r.nom, wrb: null, sansWrb: true, h: f.h }], { echelle: { max: Math.max(...f.h.map((x) => x[2])) + 5 } }) : "";
    const freres = Object.values(REFS).filter((x) => x.ger === r.ger);
    const html = `<div class="sf-page">
      ${window.SolsTemps ? SolsTemps.defsHTML() : ""}
      <p class="sub sf-fil"><a href="#sols">Les types de sols</a> → ${GER_NOMS[r.ger]} → <b>${r.nom}</b></p>
      <div class="card sf-tete">
        <div class="sf-profil">${profil}</div>
        <div class="sf-id">
          <h1>${r.nom}</h1>
          <div class="sf-wrb"><span class="sf-wrb-l">WRB 2022</span><b>${f.wrb2022.nom}</b></div>
          <div class="sf-wrb sf-wrb-2006"><span class="sf-wrb-l">WRB 2006</span>${r.wrb2006}<span class="sf-wrb-n">(Référentiel, annexe 5)</span></div>
          <p class="sf-desc">${f.description}</p>
          <table class="sf-seq"><tr><th>Sous forêt</th><td>${f.seq.foret}</td></tr>${f.seq.culture ? `<tr><th>Sous culture</th><td>${f.seq.culture}</td></tr>` : ""}</table>
          <div class="sf-evol">${f.vient.length ? `<span>Vient de : ${f.vient.map(lien).join(", ")}</span>` : ""}${f.va.length ? `<span>Évolue vers : ${f.va.map(lien).join(", ")}</span>` : ""}</div>
        </div>
      </div>
      <div class="card"><h2>Pour s'y rattacher</h2><ul class="sf-liste">${f.criteres.map((c) => `<li>${c}</li>`).join("")}</ul>
        <p class="sf-sous">Rattachement à la WRB 2022 : ${f.wrb2022.raison}</p></div>
      <div class="card"><h2>Comment se forment les ${GER_NOMS[r.ger].toLowerCase()}</h2>${g.formation.map((p) => `<p>${p}</p>`).join("")}</div>
      <div class="card"><h2>Où et à partir de quoi</h2><table class="sf-tab">${g.facteurs.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table></div>
      <div class="card"><h2>Horizons de référence</h2><table class="sf-tab">${g.horizons.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table></div>
      <details class="card"><summary><h2 style="display:inline">Qualificatifs</h2></summary><table class="sf-tab">${g.qualificatifs.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table></details>
      ${f.exemples.length ? `<div class="card"><h2>Exemples de types</h2><ul class="sf-liste">${f.exemples.map((c) => `<li>${c}</li>`).join("")}</ul></div>` : ""}
      <div class="card"><h2>À ne pas confondre avec</h2><table class="sf-tab">${g.differences.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table></div>
      <div class="card"><h2>Les autres ${GER_NOMS[r.ger].toLowerCase()}</h2><div class="sf-refs">${freres.map((x) => x.id === id ? `<span class="chip on">${x.nom}</span>` : existe(x.id) ? `<a class="chip" href="#sol/${x.id}">${x.nom}</a>` : `<span class="chip sf-chip-gris">${x.nom}</span>`).join("")}</div></div>
      <details class="card sources-roche"><summary><h2 style="display:inline">Sources</h2></summary>
        <p class="page-source"><b>Référentiel pédologique</b> : Baize D., Girard M.-C. (coord.) (2009), <i>Référentiel pédologique 2008</i>, AFES, Versailles, Éditions Quæ, chapitre ${GER_NOMS[r.ger]}, p. ${g.pages} (référence p. ${r.page}) ; équivalence WRB 2006, annexe 5. Textes reformulés et condensés par l'atlas.</p>
        <p class="page-source"><b>WRB 2022</b> : IUSS Working Group WRB (2022), <i>World Reference Base for Soil Resources</i>, 4ᵉ édition, Vienne (clé des groupes de référence, horizon argique, propriétés rétiques) ; rattachement fait par l'atlas.</p>
        <p class="page-source"><b>Profil</b> : séquence d'horizons du Référentiel ; épaisseurs indicatives ; mêmes motifs que la chronoséquence de Jamagne (Baize 2024, fig. 16).</p>
      </details>
    </div>`;
    document.getElementById("main").innerHTML = typo(html);
    document.title = r.nom + " : les types de sols, Atlas Sol";
    window.scrollTo({ top: 0 });
  }

  // ---------- 4. Contrôles ----------
  function controle() {
    const E = [];
    if (Object.keys(REFS).length !== 110) E.push(`${Object.keys(REFS).length} références au lieu de 110`);
    for (const r of Object.values(REFS)) if (!GER_NOMS[r.ger]) E.push(`${r.id} : grand ensemble ${r.ger} inconnu`);
    const dansCat = new Set(CATEGORIES.flatMap((c) => c[1]));
    for (const g of Object.keys(GER_NOMS)) if (!dansCat.has(g)) E.push(`grand ensemble ${g} hors catégories`);
    for (const [id, f] of Object.entries(FICHES)) {
      if (!REFS[id]) E.push(`fiche ${id} sans référence`);
      if (!GER[REFS[id] && REFS[id].ger]) E.push(`fiche ${id} sans rubriques de grand ensemble`);
      for (const x of f.vient.concat(f.va)) if (!REFS[x]) E.push(`${id} : lien ${x} inconnu`);
      for (const h of f.h) if (window.SolsTemps && !SolsTemps.MOTIFS[h[3]]) E.push(`${id} : motif ${h[3]} inconnu`);
    }
    if (/[—–]| - /.test(JSON.stringify([GER, FICHES]))) E.push("tiret de ponctuation");
    return E;
  }

  window.SolsFiches = { index, page, existe, controle, REFS, GER, FICHES, GER_NOMS, CATEGORIES };
})();
