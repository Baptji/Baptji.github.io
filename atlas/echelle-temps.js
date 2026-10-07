// ============================================================================
// Échelle des temps géologiques au niveau des ÉTAGES (chantier C.5, 16/09/2026)
// ----------------------------------------------------------------------------
// Âges : Charte chronostratigraphique internationale de l'ICS, version 2026/06
//   (Cohen, K.M., Harper, D.A.T., Gibbard, P.L. & Car, N. (2025, mise à jour) —
//   « The ICS international chronostratigraphic chart this decade », Episodes 48 : 105-115 ;
//   https://stratigraphy.org/ICSchart/ChronostratChart2026-06.pdf).
//   Changements de la v2026/06 : base de l'Anisien 247,0 Ma (était 246,7), base de l'Olénékien
//   250,8 Ma (était 249,9), base du Wuchiapingien 259,857 ± 0,084 Ma (était 259,51 ± 0,21).
// Couleurs : codes RGB de la Commission de la carte géologique du monde (CCGM/CGMW, Paris),
//   composition J.M. Pellé (BRGM) — tableau « RGB Color Code according to the CGMW ».
// Découpage en colonnes du modèle fourni : échelle des temps en français (âges G.S. Odin,
//   couleurs CCGM, mai 2002) — seuls la structure et les noms français en sont repris.
//
// Format. Un nœud = { n: nom français, en: nom ICS, c: couleur, k: [enfants] }.
// Une FEUILLE (unité la plus fine de sa branche) porte en plus `b` = l'âge de sa BASE tel qu'imprimé
// sur la charte (« 72.2 ±0.2 », « ~ 205.7 », « 66.00 ») et `l` = nature de cette limite :
// "gssp" (point stratotypique mondial, « clou d'or »), "gssa" (âge stratigraphique fixé, Précambrien)
// ou "" (pas encore définie). Le sommet d'une unité = la base de l'unité plus jeune qui la précède ;
// l'âge d'un nœud parent se déduit de ses feuilles. `i: 1` = unité informelle (en italique sur la charte).
// Ordre : du plus jeune au plus ancien, comme sur la charte.
// ============================================================================

const ECHELLE_TEMPS = {
  version: "v2026/06",
  source: "Charte chronostratigraphique internationale, ICS v2026/06",
  arbre: [
    { n: "Phanérozoïque", en: "Phanerozoic", c: "#9AD9DD", k: [
      { n: "Cénozoïque", en: "Cenozoic", c: "#F2F91D", k: [
        { n: "Quaternaire", en: "Quaternary", c: "#F9F97F", k: [
          { n: "Holocène", en: "Holocene", c: "#FEEBD2", k: [
            { n: "Méghalayen", en: "Meghalayan", c: "#FDEDEC", b: "0.0042", l: "gssp" },
            { n: "Northgrippien", en: "Northgrippian", c: "#FDECE4", b: "0.0082", l: "gssp" },
            { n: "Groenlandien", en: "Greenlandian", c: "#FEECDB", b: "0.0117", l: "gssp" },
          ] },
          { n: "Pléistocène", en: "Pleistocene", c: "#FFEFAF", k: [
            { n: "Supérieur", en: "Upper", c: "#FFF2D3", b: "0.129", l: "", i: 1 },
            { n: "Chibanien", en: "Chibanian", c: "#FFF2C7", b: "0.774", l: "gssp" },
            { n: "Calabrien", en: "Calabrian", c: "#FFF2BA", b: "1.80", l: "gssp" },
            { n: "Gélasien", en: "Gelasian", c: "#FFEDB3", b: "2.58", l: "gssp" },
          ] },
        ] },
        { n: "Néogène", en: "Neogene", c: "#FFE619", k: [
          { n: "Pliocène", en: "Pliocene", c: "#FFFF99", k: [
            { n: "Plaisancien", en: "Piacenzian", c: "#FFFFBF", b: "3.600", l: "gssp" },
            { n: "Zancléen", en: "Zanclean", c: "#FFFFB3", b: "5.333", l: "gssp" },
          ] },
          { n: "Miocène", en: "Miocene", c: "#FFFF00", k: [
            { n: "Messinien", en: "Messinian", c: "#FFFF73", b: "7.246", l: "gssp" },
            { n: "Tortonien", en: "Tortonian", c: "#FFFF66", b: "11.63", l: "gssp" },
            { n: "Serravallien", en: "Serravallian", c: "#FFFF59", b: "13.82", l: "gssp" },
            { n: "Langhien", en: "Langhian", c: "#FFFF4D", b: "15.98", l: "gssp" },
            { n: "Burdigalien", en: "Burdigalian", c: "#FFFF41", b: "20.45", l: "" },
            { n: "Aquitanien", en: "Aquitanian", c: "#FFFF33", b: "23.04", l: "gssp" },
          ] },
        ] },
        { n: "Paléogène", en: "Paleogene", c: "#FD9A52", k: [
          { n: "Oligocène", en: "Oligocene", c: "#FDC07A", k: [
            { n: "Chattien", en: "Chattian", c: "#FEE6AA", b: "27.30", l: "gssp" },
            { n: "Rupélien", en: "Rupelian", c: "#FED99A", b: "33.9", l: "gssp" },
          ] },
          { n: "Éocène", en: "Eocene", c: "#FDB46C", k: [
            { n: "Priabonien", en: "Priabonian", c: "#FDCDA1", b: "37.71", l: "gssp" },
            { n: "Bartonien", en: "Bartonian", c: "#FDC091", b: "41.03", l: "" },
            { n: "Lutétien", en: "Lutetian", c: "#FCB482", b: "48.07", l: "gssp" },
            { n: "Yprésien", en: "Ypresian", c: "#FCA773", b: "56.00", l: "gssp" },
          ] },
          { n: "Paléocène", en: "Paleocene", c: "#FDA75F", k: [
            { n: "Thanétien", en: "Thanetian", c: "#FDBF6F", b: "59.24", l: "gssp" },
            { n: "Sélandien", en: "Selandian", c: "#FEBF65", b: "61.66", l: "gssp" },
            { n: "Danien", en: "Danian", c: "#FDB462", b: "66.00", l: "gssp" },
          ] },
        ] },
      ] },
      { n: "Mésozoïque", en: "Mesozoic", c: "#67C5CA", k: [
        { n: "Crétacé", en: "Cretaceous", c: "#7FC64E", k: [
          { n: "Supérieur", en: "Upper", c: "#A6D84A", k: [
            { n: "Maastrichtien", en: "Maastrichtian", c: "#F2FA8C", b: "72.2 ±0.2", l: "gssp" },
            { n: "Campanien", en: "Campanian", c: "#E6F47F", b: "83.6 ±0.2", l: "gssp" },
            { n: "Santonien", en: "Santonian", c: "#D9EF74", b: "85.7 ±0.2", l: "gssp" },
            { n: "Coniacien", en: "Coniacian", c: "#CCE968", b: "89.8 ±0.3", l: "gssp" },
            { n: "Turonien", en: "Turonian", c: "#BFE35D", b: "93.9 ±0.2", l: "gssp" },
            { n: "Cénomanien", en: "Cenomanian", c: "#B3DE53", b: "100.5 ±0.1", l: "gssp" },
          ] },
          { n: "Inférieur", en: "Lower", c: "#8CCD57", k: [
            { n: "Albien", en: "Albian", c: "#CCEA97", b: "113.2 ±0.3", l: "gssp" },
            { n: "Aptien", en: "Aptian", c: "#BFE48A", b: "121.4 ±0.6", l: "" },
            { n: "Barrémien", en: "Barremian", c: "#B3DF7F", b: "125.77", l: "gssp" },
            { n: "Hauterivien", en: "Hauterivian", c: "#A6D975", b: "132.6 ±0.6", l: "gssp" },
            { n: "Valanginien", en: "Valanginian", c: "#99D36A", b: "137.05 ±0.2", l: "gssp" },
            { n: "Berriasien", en: "Berriasian", c: "#8CCD60", b: "143.1 ±0.6", l: "" },
          ] },
        ] },
        { n: "Jurassique", en: "Jurassic", c: "#34B2C9", k: [
          { n: "Supérieur", en: "Upper", c: "#B3E3EE", k: [
            { n: "Tithonien", en: "Tithonian", c: "#D9F1F7", b: "149.2 ±0.7", l: "" },
            { n: "Kimméridgien", en: "Kimmeridgian", c: "#CCECF4", b: "154.8 ±0.8", l: "gssp" },
            { n: "Oxfordien", en: "Oxfordian", c: "#BFE7F1", b: "161.5 ±1.0", l: "" },
          ] },
          { n: "Moyen", en: "Middle", c: "#80CFD8", k: [
            { n: "Callovien", en: "Callovian", c: "#BFE7E5", b: "165.3 ±1.1", l: "" },
            { n: "Bathonien", en: "Bathonian", c: "#B3E2E3", b: "168.2 ±1.2", l: "gssp" },
            { n: "Bajocien", en: "Bajocian", c: "#A6DDE0", b: "170.9 ±0.8", l: "gssp" },
            { n: "Aalénien", en: "Aalenian", c: "#9AD9DD", b: "174.7 ±0.8", l: "gssp" },
          ] },
          { n: "Inférieur", en: "Lower", c: "#42AED0", k: [
            { n: "Toarcien", en: "Toarcian", c: "#99CEE3", b: "184.2 ±0.3", l: "gssp" },
            { n: "Pliensbachien", en: "Pliensbachian", c: "#80C5DD", b: "192.9 ±0.3", l: "gssp" },
            { n: "Sinémurien", en: "Sinemurian", c: "#67BCD8", b: "199.5 ±0.3", l: "gssp" },
            { n: "Hettangien", en: "Hettangian", c: "#4EB3D3", b: "201.4 ±0.2", l: "gssp" },
          ] },
        ] },
        { n: "Trias", en: "Triassic", c: "#812B92", k: [
          { n: "Supérieur", en: "Upper", c: "#BD8CC3", k: [
            { n: "Rhétien", en: "Rhaetian", c: "#E3B9DB", b: "~ 205.7", l: "" },
            { n: "Norien", en: "Norian", c: "#D6AAD3", b: "~ 227.3", l: "" },
            { n: "Carnien", en: "Carnian", c: "#C99BCB", b: "~ 237", l: "gssp" },
          ] },
          { n: "Moyen", en: "Middle", c: "#B168B1", k: [
            { n: "Ladinien", en: "Ladinian", c: "#C983BF", b: "241.464 ±0.28", l: "gssp" },
            { n: "Anisien", en: "Anisian", c: "#BC75B7", b: "247.0", l: "" },
          ] },
          { n: "Inférieur", en: "Lower", c: "#983999", k: [
            { n: "Olénékien", en: "Olenekian", c: "#B051A5", b: "250.8", l: "" },
            { n: "Indusien", en: "Induan", c: "#A4469F", b: "251.902 ±0.024", l: "gssp" },
          ] },
        ] },
      ] },
      { n: "Paléozoïque", en: "Paleozoic", c: "#99C08D", k: [
        { n: "Permien", en: "Permian", c: "#F04028", k: [
          { n: "Lopingien", en: "Lopingian", c: "#FBA794", k: [
            { n: "Changhsingien", en: "Changhsingian", c: "#FCC0B2", b: "254.14 ±0.07", l: "gssp" },
            { n: "Wuchiapingien", en: "Wuchiapingian", c: "#FCB4A2", b: "259.857 ±0.084", l: "gssp" },
          ] },
          { n: "Guadalupien", en: "Guadalupian", c: "#FB745C", k: [
            { n: "Capitanien", en: "Capitanian", c: "#FB9A85", b: "264.28 ±0.16", l: "gssp" },
            { n: "Wordien", en: "Wordian", c: "#FB8D76", b: "266.9 ±0.4", l: "gssp" },
            { n: "Roadien", en: "Roadian", c: "#FB8069", b: "274.4 ±0.4", l: "gssp" },
          ] },
          { n: "Cisuralien", en: "Cisuralian", c: "#EF5845", k: [
            { n: "Kungurien", en: "Kungurian", c: "#E38776", b: "283.3 ±0.4", l: "" },
            { n: "Artinskien", en: "Artinskian", c: "#E37B68", b: "290.1 ±0.26", l: "gssp" },
            { n: "Sakmarien", en: "Sakmarian", c: "#E36F5C", b: "293.52 ±0.17", l: "gssp" },
            { n: "Assélien", en: "Asselian", c: "#E36350", b: "298.9 ±0.15", l: "gssp" },
          ] },
        ] },
        { n: "Carbonifère", en: "Carboniferous", c: "#67A599", k: [
          { n: "Pennsylvanien", en: "Pennsylvanian", c: "#99C2B5", sous: 1, k: [
            { n: "Supérieur", en: "Upper", c: "#BFD0BA", k: [
              { n: "Gzhélien", en: "Gzhelian", c: "#CCD4C7", b: "303.7 ±0.1", l: "" },
              { n: "Kasimovien", en: "Kasimovian", c: "#BFD0C5", b: "307.0 ±0.1", l: "" },
            ] },
            { n: "Moyen", en: "Middle", c: "#A6C7B7", k: [
              { n: "Moscovien", en: "Moscovian", c: "#B3CBB9", b: "315.2 ±0.2", l: "" },
            ] },
            { n: "Inférieur", en: "Lower", c: "#8CBEB4", k: [
              { n: "Bashkirien", en: "Bashkirian", c: "#99C2B5", b: "323.4 ±0.4", l: "gssp" },
            ] },
          ] },
          { n: "Mississippien", en: "Mississippian", c: "#678F66", sous: 1, k: [
            { n: "Supérieur", en: "Upper", c: "#B3BE6C", k: [
              { n: "Serpukhovien", en: "Serpukhovian", c: "#BFC26B", b: "330.3 ±0.4", l: "" },
            ] },
            { n: "Moyen", en: "Middle", c: "#99B46C", k: [
              { n: "Viséen", en: "Visean", c: "#A6B96C", b: "346.7 ±0.4", l: "gssp" },
            ] },
            { n: "Inférieur", en: "Lower", c: "#80AB6C", k: [
              { n: "Tournaisien", en: "Tournaisian", c: "#8CB06C", b: "358.86 ±0.19", l: "gssp" },
            ] },
          ] },
        ] },
        { n: "Dévonien", en: "Devonian", c: "#CB8C37", k: [
          { n: "Supérieur", en: "Upper", c: "#F1E19D", k: [
            { n: "Famennien", en: "Famennian", c: "#F2EDC5", b: "372.15 ±0.46", l: "gssp" },
            { n: "Frasnien", en: "Frasnian", c: "#F2EDAD", b: "382.31 ±1.36", l: "gssp" },
          ] },
          { n: "Moyen", en: "Middle", c: "#F1C868", k: [
            { n: "Givétien", en: "Givetian", c: "#F1E185", b: "387.95 ±1.04", l: "gssp" },
            { n: "Eifélien", en: "Eifelian", c: "#F1D576", b: "393.47 ±0.99", l: "gssp" },
          ] },
          { n: "Inférieur", en: "Lower", c: "#E5AC4D", k: [
            { n: "Emsien", en: "Emsian", c: "#E5D075", b: "410.62 ±1.95", l: "gssp" },
            { n: "Praguien", en: "Pragian", c: "#E5C468", b: "413.02 ±1.91", l: "gssp" },
            { n: "Lochkovien", en: "Lochkovian", c: "#E5B75A", b: "419.62 ±1.36", l: "gssp" },
          ] },
        ] },
        { n: "Silurien", en: "Silurian", c: "#B3E1B6", k: [
          { n: "Pridoli", en: "Pridoli", c: "#E6F5E1", b: "422.7 ±1.6", l: "gssp" },
          { n: "Ludlow", en: "Ludlow", c: "#BFE6CF", k: [
            { n: "Ludfordien", en: "Ludfordian", c: "#D9F0DF", b: "425.0 ±1.5", l: "gssp" },
            { n: "Gorstien", en: "Gorstian", c: "#CCECDD", b: "426.7 ±1.5", l: "gssp" },
          ] },
          { n: "Wenlock", en: "Wenlock", c: "#B3E1C2", k: [
            { n: "Homérien", en: "Homerian", c: "#CCEBD1", b: "430.6 ±1.3", l: "gssp" },
            { n: "Sheinwoodien", en: "Sheinwoodian", c: "#BFE6C3", b: "432.9 ±1.2", l: "gssp" },
          ] },
          { n: "Llandovery", en: "Llandovery", c: "#99D7B3", k: [
            { n: "Télychien", en: "Telychian", c: "#BFE6CF", b: "438.6 ±1.0", l: "gssp" },
            { n: "Aéronien", en: "Aeronian", c: "#B3E1C2", b: "440.5 ±1.0", l: "gssp" },
            { n: "Rhuddanien", en: "Rhuddanian", c: "#A6DCB5", b: "443.1 ±0.9", l: "gssp" },
          ] },
        ] },
        { n: "Ordovicien", en: "Ordovician", c: "#009270", k: [
          { n: "Supérieur", en: "Upper", c: "#7FCA93", k: [
            { n: "Hirnantien", en: "Hirnantian", c: "#A6DBAB", b: "445.2 ±0.9", l: "gssp" },
            { n: "Katien", en: "Katian", c: "#99D69F", b: "452.8 ±0.7", l: "gssp" },
            { n: "Sandbien", en: "Sandbian", c: "#8CD094", b: "458.2 ±0.7", l: "gssp" },
          ] },
          { n: "Moyen", en: "Middle", c: "#4DB47E", k: [
            { n: "Darriwilien", en: "Darriwilian", c: "#74C69C", b: "469.4 ±0.9", l: "gssp" },
            { n: "Dapingien", en: "Dapingian", c: "#66C092", b: "471.3 ±1.4", l: "gssp" },
          ] },
          { n: "Inférieur", en: "Lower", c: "#1A9D6F", k: [
            { n: "Floien", en: "Floian", c: "#41B087", b: "477.1 ±1.2", l: "gssp" },
            { n: "Trémadocien", en: "Tremadocian", c: "#33A97E", b: "486.85 ±1.5", l: "gssp" },
          ] },
        ] },
        { n: "Cambrien", en: "Cambrian", c: "#7FA056", k: [
          { n: "Furongien", en: "Furongian", c: "#B3E095", k: [
            { n: "Étage 10", en: "Stage 10", c: "#E6F5C9", b: "~ 491.0", l: "", i: 1 },
            { n: "Jiangshanien", en: "Jiangshanian", c: "#D9F0BB", b: "~ 494.2", l: "gssp" },
            { n: "Paibien", en: "Paibian", c: "#CCEBAE", b: "~ 497.0", l: "gssp" },
          ] },
          { n: "Miaolingien", en: "Miaolingian", c: "#A6CF86", k: [
            { n: "Guzhangien", en: "Guzhangian", c: "#CCDFAA", b: "~ 500.5", l: "gssp" },
            { n: "Drumien", en: "Drumian", c: "#BFD99D", b: "~ 504.5", l: "gssp" },
            { n: "Wuliuen", en: "Wuliuan", c: "#B3D492", b: "~ 506.5", l: "gssp" },
          ] },
          { n: "Série 2", en: "Series 2", c: "#99C078", i: 1, k: [
            { n: "Étage 4", en: "Stage 4", c: "#B3CA8E", b: "~ 514.5", l: "", i: 1 },
            { n: "Étage 3", en: "Stage 3", c: "#A6C583", b: "~ 521.0", l: "", i: 1 },
          ] },
          { n: "Terreneuvien", en: "Terreneuvian", c: "#8CB06C", k: [
            { n: "Étage 2", en: "Stage 2", c: "#A6BA80", b: "~ 529.0", l: "", i: 1 },
            { n: "Fortunien", en: "Fortunian", c: "#99B575", b: "538.8 ±0.6", l: "gssp" },
          ] },
        ] },
      ] },
    ] },
    { n: "Protérozoïque", en: "Proterozoic", c: "#F73563", k: [
      { n: "Néoprotérozoïque", en: "Neoproterozoic", c: "#FEB342", k: [
        { n: "Édiacarien", en: "Ediacaran", c: "#FED96A", b: "~ 635", l: "gssp" },
        { n: "Cryogénien", en: "Cryogenian", c: "#FECC5C", b: "~ 720", l: "" },
        { n: "Tonien", en: "Tonian", c: "#FEBF4E", b: "1000", l: "gssa" },
      ] },
      { n: "Mésoprotérozoïque", en: "Mesoproterozoic", c: "#FDB462", k: [
        { n: "Sténien", en: "Stenian", c: "#FED99A", b: "1200", l: "gssa" },
        { n: "Ectasien", en: "Ectasian", c: "#FDCC8A", b: "1400", l: "gssa" },
        { n: "Calymmien", en: "Calymmian", c: "#FDC07A", b: "1600", l: "gssa" },
      ] },
      { n: "Paléoprotérozoïque", en: "Paleoproterozoic", c: "#F74370", k: [
        { n: "Stathérien", en: "Statherian", c: "#F875A7", b: "1800", l: "gssa" },
        { n: "Orosirien", en: "Orosirian", c: "#F76898", b: "2050", l: "gssa" },
        { n: "Rhyacien", en: "Rhyacian", c: "#F75B89", b: "2300", l: "gssa" },
        { n: "Sidérien", en: "Siderian", c: "#F74F7C", b: "2500", l: "gssa" },
      ] },
    ] },
    { n: "Archéen", en: "Archean", c: "#F0047F", k: [
      { n: "Néoarchéen", en: "Neoarchean", c: "#F99BC1", b: "2800", l: "gssa" },
      { n: "Mésoarchéen", en: "Mesoarchean", c: "#F768A9", b: "3200", l: "gssa" },
      { n: "Paléoarchéen", en: "Paleoarchean", c: "#F4449F", b: "3600", l: "gssa" },
      { n: "Éoarchéen", en: "Eoarchean", c: "#DA037F", b: "4031 ± 3", l: "gssa" },
    ] },
    { n: "Hadéen", en: "Hadean", c: "#AE027E", b: "4567", l: "" },
  ],
};

// ---- Préparation : sommets/bases numériques, profondeur, chemin, colonnes ----
// Colonnes de la charte : 0 Éon · 1 Ère · 2 Système · 3 Sous-système · 4 Série · 5 Étage.
(function preparerEchelle() {
  const E = ECHELLE_TEMPS;
  E.feuilles = []; E.noeuds = [];
  const lire = (s) => {
    const m = String(s).match(/^(~\s*)?([\d.]+)(?:\s*±\s*([\d.]+))?$/);
    if (!m) throw new Error("Âge illisible dans echelle-temps.js : " + s);
    return { v: parseFloat(m[2]), env: !!m[1], pm: m[3] || null, txt: m[2] };
  };
  // colonne : éon 0, ère 1, système 2, sous-système 3 (Carbonifère), série 4, étage 5
  function parcourir(noeud, parent, prof) {
    noeud.parent = parent; noeud.prof = prof;
    noeud.col = prof <= 2 ? prof : noeud.sous ? 3 : parent.col <= 3 ? 4 : 5;
    E.noeuds.push(noeud);
    if (noeud.k) noeud.k.forEach((f) => parcourir(f, noeud, prof + 1));
    else { noeud.base = lire(noeud.b); E.feuilles.push(noeud); }
  }
  E.arbre.forEach((n) => parcourir(n, null, 0));
  // sommet = base de la feuille précédente (0 = aujourd'hui)
  let haut = 0;
  E.feuilles.forEach((f) => { f.sommet = haut; haut = f.base.v; });
  const borner = (n) => {
    if (!n.k) return;
    n.k.forEach(borner);
    n.sommet = n.k[0].sommet;
    n.baseNoeud = n.k[n.k.length - 1];
    while (n.baseNoeud.k) n.baseNoeud = n.baseNoeud.k[n.baseNoeud.k.length - 1];
    n.base = n.baseNoeud.base; n.l = n.baseNoeud.l;
  };
  E.arbre.forEach(borner);
  // contrôle : âges strictement croissants
  E.feuilles.forEach((f, i) => {
    if (f.base.v <= f.sommet) console.error("Échelle des temps : âges non croissants à", f.n);
  });
})();
