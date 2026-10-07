// ============ « Même phénomène, autres roches » : les 21 autres phénomènes (C.7, 25/09/2026) ============
// Chargé après pourquoi.js (qui porte le moteur et le prototype « chambre »). Chaque phénomène est un diagramme à deux axes
// (scène générique « diagramme » de pourquoi.js) : un fond (domaines, courbes), un ou plusieurs chemins parcourus en même
// temps, et les roches posées sur leur chemin. Liste des phénomènes = celle proposée dans la tâche C.7 de la feuille de
// chantiers ; l'utilisateur a demandé le 25/09/2026 de tout faire avant de valider. Quand un chemin est schématique (ordres de
// grandeur), la ligne « mesure » le dit ; les sources sont en bas de la page de chaque fiche.
(function () {
  "use strict";
  if (!window.Pourquoi || !Pourquoi.ajouter) return;

  // ─────────────────────────────── outils ───────────────────────────────
  const nb = (v, d = 0) => {
    const s = Number(v).toFixed(d);
    const [e, f] = s.split(".");
    return e.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (f ? "," + f : "");
  };
  // nombre « lisible » : 0,1 · 2,5 · 35 · 1 200
  const lisible = (v) => v < 1 ? nb(v, v < 0.1 ? 2 : 1) : v < 10 ? nb(v, Math.abs(v - Math.round(v)) < 0.05 ? 0 : 1) : nb(v, 0);
  const DOM = "#8f897d";              // texte des domaines (classe pq-dom)
  const COUL = {                       // aplats des domaines (fond papier #f3f1ea)
    a: "#e9e2d4", b: "#e4ebe3", c: "#ece4d9", d: "#e1e6ec", e: "#efe9dd", f: "#f0e2dc", g: "#e6e1ec", h: "#f6f2ea",
  };
  const lab = (g, x, y, s, o = {}) => g.texte(x, y, s, Object.assign({ cls: "pq-dom" }, o));
  const labAuPx = (x, y, s, a = "start") => `<text x="${x}" y="${y}" class="fa-lab fa-petit pq-dom" text-anchor="${a}">${s}</text>`;
  // durées en toutes lettres (règle de l'atlas : jamais de puissances de 10)
  function duree(ans) {
    const h = ans * 365.25 * 24;
    if (h < 1) return `${lisible(h * 60)} minutes`;
    if (h < 48) return `${lisible(h)} heure${h >= 2 ? "s" : ""}`;
    const j = h / 24;
    if (j < 60) return `${lisible(j)} jours`;
    if (ans < 2) return `${lisible(j / 30.4)} mois`;
    if (ans < 1e6) return `${nb(Math.round(ans / (ans < 100 ? 1 : ans < 10000 ? 10 : 1000)) * (ans < 100 ? 1 : ans < 10000 ? 10 : 1000))} ans`;
    return `${lisible(ans / 1e6)} million${ans >= 2e6 ? "s" : ""} d'années`;
  }
  const PHS = {};

  // ═══════════════════════ 1. Le manteau fond : combien, et à quelle profondeur ═══════════════════════
  PHS.manteau = {
    scene: "diagramme",
    titre: "Le manteau fond : combien, et à quelle profondeur",
    intro: "Le manteau ne fond pas parce qu'on le chauffe : il fond parce qu'il remonte et que la pression baisse. Plus il remonte haut, plus il fond. Or sa remontée s'arrête sous la plaque qui le couvre : une plaque épaisse (vieux continent) le laisse à peine fondre, très profond ; une plaque mince (dorsale) le laisse fondre beaucoup. La part fondue et la profondeur décident du magma, donc de la roche.",
    mesure: "Chemins schématiques : profondeur où la fusion commence et part du manteau fondue à la fin de la remontée, ordres de grandeur publiés pour chaque contexte (McKenzie et Bickle 1988 ; Frey et al. 1978 ; Dasgupta et Hirschmann 2006 ; Arndt et al. 2008).",
    legende: `<span class="pq-sym">●</span> un magma · <span class="pq-sym">■</span> ce qui reste du manteau · en pointillé : une variante, expliquée dans le texte de la roche.`,
    axes: {
      x: { min: 0.1, max: 60, type: "log", ticks: [[0.1, "0,1"], [0.3, "0,3"], [1, "1"], [3, "3"], [10, "10"], [30, "30"], [60, "60"]], titre: "part du manteau qui a fondu (%, échelle logarithmique)" },
      y: { min: 0, max: 260, inverse: true, ticks: [0, 50, 100, 150, 200, 250], titre: "profondeur (km)" },
    },
    v: { de: 260, a: 0 },
    duree: 11,
    fond: (g) => {
      let s = g.rect(0.1, 60, 150, 260, COUL.g);
      s += g.tirets([[0.1, 150], [60, 150]], DOM);
      s += lab(g, 60, 258, "sous ≈ 150 km, sous un continent froid : le diamant est stable", { a: "end", dx: -4, dy: -3 });
      return s;
    },
    chemins: {
      craton: { pts: [[0.1, 250, 250], [0.35, 200, 200], [0.7, 160, 160]], nom: "sous un vieux continent", nomPos: [0.35, 200], nomDx: 6, nomDy: 12 },
      rift: { pts: [[0.12, 135, 135], [0.5, 120, 120], [3, 100, 100], [6, 85, 85], [7, 80, 80]], nom: "sous un rift", nomPos: [0.2, 130], nomDx: 0, nomDy: -6 },
      litho: { pts: [[0.2, 95, 95], [0.6, 82, 82], [1.5, 66, 66]], nom: "manteau enrichi en eau", nomPos: [0.2, 95], nomA: "start", nomDx: -2, nomDy: -6 },
      panache: { pts: [[0.1, 150, 150], [5, 110, 110], [15, 85, 85], [25, 70, 70]], nom: "panache chaud", nomPos: [5, 110], nomDx: 6, nomDy: 11 },
      dorsale: { pts: [[0.1, 70, 70], [3, 55, 55], [10, 35, 35], [18, 15, 15]], nom: "sous une dorsale", nomPos: [0.3, 67], nomDx: 0, nomDy: -6 },
      archeen: { pts: [[0.1, 255, 255], [8, 200, 200], [30, 125, 125], [45, 80, 80]], nom: "il y a 3,5 milliards d'années", nomPos: [8, 200], nomDx: 6, nomDy: 12 },
    },
    lire: (v) => [`${nb(v)} km`, "le manteau remonte"],
    roches: [
      { id: "kimberlite", chemin: "craton", at: 160, court: "kimberlite", lab: "d",
        texte: "Sous un vieux continent, la plaque est épaisse de 150 à 250 km : le manteau ne peut pas remonter plus haut et fond à peine, moins de 1 %, grâce au CO₂ et à l'eau qu'il contient. Ce liquide très chargé en gaz traverse la plaque en quelques heures et arrache au passage des morceaux de manteau, et parfois des diamants, stables sous environ 150 km (Sparks et al. 2006)." },
      { id: "carbonatite", chemin: "rift", at: 135, court: "carbonatite", lab: "g",
        texte: "Au tout début de la fusion d'un manteau qui contient du CO₂, les premières gouttes, bien moins de 1 % du manteau, sont faites de carbonates fondus plutôt que de silicates (Dasgupta et Hirschmann 2006). Une carbonatite peut aussi se séparer plus tard d'un magma pauvre en silice, comme l'huile se sépare de l'eau : c'est le cas à l'Ol Doinyo Lengai, dans le rift est-africain." },
      { id: "foidolite", chemin: "rift", at: 100, court: "foïdolite", lab: "g",
        texte: "Sous un rift, le manteau remonte mais la plaque l'arrête vers 80–100 km : il ne fond que de 2 à 5 %. Ce liquide très pauvre en silice et riche en sodium est une néphélinite ; cristallisé en profondeur, il donne une foïdolite, où les feldspathoïdes (néphéline) remplacent les feldspaths, faute de silice." },
      { id: "basanite", chemin: "rift", at: 85, court: "basanite", lab: "b",
        texte: "Le même manteau, un peu plus haut, fond de 5 à 7 % : le liquide est un peu moins pauvre en silice. C'est une basanite, avec olivine, pyroxène et un peu de néphéline (Frey et al. 1978), comme les coulées du Devès." },
      { id: "lamprophyre", chemin: "litho", at: 66, court: "lamprophyre", lab: "g",
        texte: "Sous une chaîne de montagnes en fin de vie, la base de la plaque a été enrichie en eau et en potassium par une ancienne subduction. Quand la chaîne s'effondre, cette partie du manteau fond un peu : les magmas, riches en eau, montent en filons étroits de lamprophyre, à biotite et amphibole, comme le kersanton de la rade de Brest." },
      { id: "picrite", chemin: "panache", at: 70, court: "picrite", lab: "h",
        texte: "Dans un panache, le manteau est plus chaud de 100 à 300 °C : il commence à fondre plus bas et fond davantage, jusqu'à 20–25 %. Le liquide, riche en magnésium, cristallise beaucoup d'olivine ; les océanites du Piton de la Fournaise sont des basaltes encore enrichis en cristaux d'olivine accumulés dans le réservoir." },
      { id: "basalte", chemin: "dorsale", at: 35, court: "basalte", lab: "g", ailleurs: true,
        texte: "Sous une dorsale, la plaque est très mince : le manteau remonte presque jusqu'au fond de la mer et fond de 10 à 20 % (McKenzie et Bickle 1988) : c'est le basalte des dorsales. Le basalte de la chaîne des Puys, décrit dans sa fiche, vient d'un manteau qui a moins fondu." },
      { id: "peridotite", chemin: "dorsale", at: 15, court: "péridotite (le reste)", forme: "carre", lab: "g",
        texte: "Ce qui reste du manteau après la fusion. La lherzolite de Lherz a très peu fondu : elle garde olivine et deux pyroxènes. Quand 15 à 25 % en ont été extraits, comme sous une dorsale, le clinopyroxène a fondu et il ne reste qu'olivine et orthopyroxène : une harzburgite." },
      { id: "komatiite", chemin: "archeen", at: 80, court: "komatiite", lab: "b",
        texte: "Il y a 3,5 milliards d'années, le manteau était plus chaud de 200 à 300 °C qu'aujourd'hui : il commençait à fondre vers 200–250 km et fondait de 30 à 50 %. Ce liquide, émis vers 1 600 °C, donne une komatiite ; le manteau actuel, plus froid, n'en produit presque plus (Arndt et al. 2008)." },
    ],
    sources: `Fusion par décompression et part fondue : McKenzie D. et Bickle M. J. (1988), <i>Journal of Petrology</i> 29, 625. Basanites et néphélinites, faibles taux de fusion : Frey F. A., Green D. H. et Roy S. D. (1978), <i>Journal of Petrology</i> 19, 463. Premiers liquides carbonatés : Dasgupta R. et Hirschmann M. M. (2006), <i>Nature</i> 440, 659. Remontée des kimberlites : Sparks R. S. J. et al. (2006), <i>Journal of Volcanology and Geothermal Research</i> 155, 18. Komatiites : Arndt N., Lesher C. M. et Barnes S. J. (2008), <i>Komatiite</i>, Cambridge University Press.`,
  };

  // ═══════════════════════ 2. Une chambre de magma alcalin (diagramme TAS) ═══════════════════════
  // Champs du diagramme silice–alcalins de Le Bas et al. (1986), sommets usuels ; le haut du champ des phonolites et du
  // trachyte est coupé à 15 % d'alcalins.
  const TAS = [
    ["picrobasalte", [[41, 0], [41, 3], [45, 3], [45, 0]]],
    ["basalte", [[45, 0], [45, 5], [52, 5], [52, 0]], [48.5, 2]],
    ["andésite basaltique", [[52, 0], [52, 5], [57, 5.9], [57, 0]]],
    ["andésite", [[57, 0], [57, 5.9], [63, 7], [63, 0]], [60, 2]],
    ["dacite", [[63, 0], [63, 7], [69, 8], [72, 5.5], [72, 0]], [66.5, 2]],
    ["trachybasalte", [[45, 5], [49.4, 7.3], [52, 5]]],
    ["trachyandésite basaltique", [[52, 5], [49.4, 7.3], [53, 9.3], [57, 5.9]]],
    ["trachyandésite", [[57, 5.9], [53, 9.3], [57.6, 11.7], [63, 7]]],
    ["trachyte", [[63, 7], [57.6, 11.7], [61, 13.5], [63.8, 15], [72, 15], [72, 8.6], [69, 8]], [67.5, 11.5]],
    ["basanite, téphrite", [[41, 3], [41, 7], [45, 9.4], [49.4, 7.3], [45, 5], [45, 3]], [42.2, 4.4]],
    ["phonotéphrite", [[49.4, 7.3], [45, 9.4], [48.4, 11.5], [53, 9.3]]],
    ["téphriphonolite", [[53, 9.3], [48.4, 11.5], [52.5, 14], [57.6, 11.7]]],
    ["phonolite", [[57.6, 11.7], [52.5, 14], [52.5, 15], [63.8, 15], [61, 13.5]], [55.5, 14.3]],
    ["foïdite", [[41, 7], [41, 15], [52.5, 15], [52.5, 14], [48.4, 11.5], [45, 9.4]]],
  ];
  PHS.alcalin = {
    scene: "diagramme",
    titre: "Une chambre de magma alcalin : plusieurs roches possibles",
    intro: "Sous le Massif central, un magma venu d'un manteau qui a peu fondu est riche en sodium et en potassium. En refroidissant dans la croûte, il cristallise d'abord olivine et pyroxène, qui emportent magnésium et fer : le liquide qui reste s'enrichit en silice et surtout en alcalins. La roche dépend du stade atteint, et de ce qu'on fait du liquide : une lave s'il sort, une roche grenue s'il reste en profondeur.",
    mesure: "Diagramme silice–alcalins (TAS : Le Bas et al. 1986), en % de la masse de la roche. Chemins : tendance des laves de la chaîne des Puys, du basalte au trachyte du puy de Dôme (Boivin et al. 2017), et suite plus pauvre en silice du Velay et du Mont-Dore jusqu'aux phonolites (tendance indicative). Les roches grenues sont placées au même endroit que la lave de même composition.",
    legende: `<span class="pq-sym">▲</span> sorti en éruption : une lave · <span class="pq-sym">■</span> resté en profondeur : une roche grenue · en pointillé : une variante, expliquée dans le texte de la roche.`,
    axes: {
      x: { min: 40, max: 72, ticks: [40, 45, 50, 55, 60, 65, 70], titre: "silice (SiO₂, % de la masse)" },
      y: { min: 0, max: 15, ticks: [0, 5, 10, 15], titre: "sodium + potassium (Na₂O + K₂O, %)" },
    },
    v: { de: 43, a: 64 },
    duree: 10,
    fond: (g) => {
      let s = "";
      TAS.forEach(([n, L], i) => { s += g.zone(L, i % 2 ? COUL.h : COUL.e, { stroke: "#cfc6b5", "stroke-width": 0.6 }); });
      for (const [n, , p] of TAS) if (p) s += lab(g, p[0], p[1], n, { a: "middle" });
      return s;
    },
    lecturePos: [66, 42, "start"],
    chemins: {
      puys: { pts: [[45.5, 3.3, 45.5], [47.5, 4.6, 47.5], [48.8, 5.6, 48.8], [51.5, 6.6, 51.5], [53.5, 7.2, 53.5], [57.3, 8.6, 57.3], [61, 9.8, 61], [63.5, 10.6, 63.5]] },
      velay: { pts: [[43.5, 5.2, 43.5], [46, 7.5, 46], [50, 9.8, 50], [54, 12, 54], [57.2, 13.1, 57.2]] },
    },
    lire: (v, d) => d ? [`silice ${nb(d[0], 1)} %`, `alcalins ${nb(d[1], 1)} %`] : "",
    roches: [
      { id: "basalte", chemin: "puys", at: 45.5, forme: "tri", dp: [0, -9], court: "basalte", lab: [0, -18, "middle"],
        texte: "Le magma tel qu'il arrive du manteau, avec environ 46 % de silice, sorti directement en éruption : un basalte, comme les coulées de la chaîne des Puys." },
      { id: "trachybasalte", chemin: "puys", at: 48.8, forme: "tri", dp: [0, -9], court: "trachybasalte", lab: [0, -18, "middle"],
        texte: "Après un court séjour dans la croûte, où olivine et pyroxène ont commencé à cristalliser, le liquide est un peu plus riche en alcalins : la plupart des coulées de la chaîne des Puys sont des trachybasaltes." },
      { id: "monzodiorite", chemin: "puys", at: 53.5, forme: "carre", dp: [0, 10], court: "monzodiorite", lab: [7, 14, "start"],
        texte: "Le liquide d'une trachyandésite basaltique (≈ 53 % de silice), resté en profondeur et cristallisé lentement, donne une monzodiorite : plagioclase et feldspath potassique en proportions voisines, avec amphibole et biotite." },
      { id: "trachyandesite", chemin: "puys", at: 57.3, forme: "tri", dp: [0, -9], court: "trachyandésite", lab: [0, -18, "middle"],
        texte: "Vers 57 % de silice et 8–9 % d'alcalins : une trachyandésite. Le stratovolcan du Cantal en est fait pour l'essentiel ; ses laves sont passées par des chambres dans la croûte avant de sortir." },
      { id: "latite", chemin: "puys", at: 57.3, p: [61.5, 5.2], forme: "tri", variante: true, court: "latite", lab: [0, 14, "middle"],
        texte: "Variante : même domaine que la trachyandésite, mais le potassium y dépasse le sodium ; la classification appelle alors la roche latite. Celles de l'Estérel viennent d'un magma plus riche en potassium, au Permien, et non de la chaîne des Puys." },
      { id: "monzonite", chemin: "puys", at: 57.3, forme: "carre", dp: [0, 10], court: "monzonite", lab: [7, 14, "start"],
        texte: "Le liquide de la trachyandésite, resté en profondeur : une monzonite, faite de plagioclase et de feldspath potassique à parts égales, avec un peu d'amphibole ou de biotite." },
      { id: "trachyte", chemin: "puys", at: 63.5, forme: "tri", dp: [0, -9], court: "trachyte", lab: [0, -18, "middle"],
        texte: "Au bout du chemin, vers 63 % de silice et 10–11 % d'alcalins, le liquide n'est presque plus que du feldspath alcalin fondu : un trachyte, très visqueux, qui sort en dôme comme le puy de Dôme." },
      { id: "syenite", chemin: "puys", at: 63.5, forme: "carre", dp: [0, 10], court: "syénite", lab: [7, 14, "start"],
        texte: "Le liquide du trachyte, cristallisé en profondeur : une syénite, presque entièrement faite de feldspath alcalin." },
      { id: "basanite", chemin: "velay", at: 43.5, forme: "tri", dp: [0, -9], court: "basanite", lab: [0, -18, "middle"], ailleurs: true,
        texte: "Un magma encore plus pauvre en silice, venu d'un manteau qui a moins fondu (voir « Le manteau fond ») : une basanite, point de départ des phonolites du Velay." },
      { id: "essexite", chemin: "velay", at: 46, forme: "carre", dp: [0, 10], court: "essexite", lab: [7, 14, "start"],
        texte: "Un liquide de basanite ou de téphrite resté en profondeur : un gabbro qui contient des feldspathoïdes, l'essexite, comme dans les petites intrusions au cœur du Cantal." },
      { id: "phonolite", chemin: "velay", at: 57.2, forme: "tri", dp: [0, -9], court: "phonolite", lab: [0, -18, "middle"],
        texte: "Au bout de la suite pauvre en silice, le liquide a 13–15 % d'alcalins mais pas assez de silice pour ne faire que des feldspaths : il cristallise aussi de la néphéline. C'est une phonolite, très visqueuse, en sucs comme le Gerbier-de-Jonc." },
      { id: "syenite_nephelinique", chemin: "velay", at: 57.2, forme: "carre", dp: [0, 10], court: "syénite néphélinique", lab: [9, 1, "start"],
        texte: "Le liquide de la phonolite, cristallisé en profondeur : une syénite néphélinique, feldspath alcalin et néphéline. Le plus grand massif du monde, les Khibiny (Kola), en est fait." },
    ],
    sources: `Diagramme silice–alcalins : Le Bas M. J., Le Maitre R. W., Streckeisen A. et Zanettin B. (1986), <i>Journal of Petrology</i> 27, 745. Laves de la chaîne des Puys : Boivin P. et al. (2017), <i>Volcanologie de la Chaîne des Puys</i>, 6ᵉ éd., Parc naturel régional des Volcans d'Auvergne.`,
  };

  // ═══════════════════════ 3. La croûte fond ═══════════════════════
  PHS.croute = {
    scene: "diagramme",
    titre: "La croûte fond : plusieurs roches possibles",
    intro: "Dans une chaîne de montagnes épaissie, la base de la croûte chauffe jusqu'à fondre en partie. Tant qu'il y a peu de liquide, il reste entre les grains ; au-delà de quelques %, il se relie en réseau et peut partir. Selon la température atteinte et ce que devient le liquide, on obtient une roche à moitié fondue, un magma de granite, ou le résidu sec qu'il laisse derrière lui.",
    mesure: "Part de liquide d'une croûte argileuse (métapélite) chauffée vers 0,8 GPa (≈ 30 km) : ordres de grandeur des expériences de Vielzeuf et Holloway (1988) et des calculs de Clemens et Vielzeuf (1987). Au-delà d'environ 7 % de liquide, les gouttes se relient et le liquide peut migrer (Rosenberg et Handy 2005).",
    legende: `<span class="pq-sym">●</span> roche formée sur place · <span class="pq-sym">▲</span> le liquide part : un magma · <span class="pq-sym">■</span> ce qui reste · en pointillé : une variante.`,
    axes: {
      x: { min: 600, max: 1000, ticks: [600, 700, 800, 900, [1000, "1 000 °C"]], titre: "température de la croûte (°C)" },
      y: { min: 0, max: 60, ticks: [0, 10, 20, 30, 40, 50, 60], titre: "liquide formé (% de la roche)" },
    },
    v: { de: 610, a: 960 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(600, 1000, 0, 7, COUL.b);
      s += lab(g, 1000, 3.5, "le liquide reste entre les grains", { a: "end", dx: -5, dy: 3 });
      s += lab(g, 1000, 9, "au-delà de ≈ 7 % : il se relie et peut partir", { a: "end", dx: -5, dy: 3 });
      for (const [T, n, y] of [[650, "début de fusion avec eau", 40], [760, "fusion de la muscovite", 50], [850, "fusion de la biotite", 57]]) {
        s += g.tirets([[T, 0], [T, 60]], "#b9ae9a");
        s += lab(g, T, y, n, { dx: 4 });
      }
      return s;
    },
    chemins: { chauffe: { pts: [[610, 0, 610], [650, 0.5, 650], [700, 3, 700], [750, 6, 750], [775, 14, 775], [820, 20, 820], [860, 33, 860], [890, 44, 890], [960, 52, 960]] } },
    lire: (v, d) => d ? [`${nb(Math.round(v / 5) * 5)} °C`, `${nb(d[1])} % de liquide`] : "",
    roches: [
      { id: "migmatite", chemin: "chauffe", at: 720, court: "migmatite", lab: "h",
        texte: "Vers 650–750 °C, avec un peu d'eau, la croûte commence à fondre : quelques % de liquide granitique se rassemblent en veines claires, entre des parties restées solides et sombres. Figée ainsi, c'est une migmatite, comme dans le dôme du Velay." },
      { id: "granite", chemin: "chauffe", at: 860, forme: "tri", dp: [0, -10], court: "granite", lab: [-6, -12, "end"],
        texte: "Quand micas et surtout biotite fondent, vers 800–850 °C, le liquide dépasse 20 à 30 % : il se sépare, monte et se rassemble en chambres qui cristallisent en granite. La plupart des granites varisques de France sont nés ainsi." },
      { id: "granulite_meta", chemin: "chauffe", at: 890, forme: "carre", dp: [0, 11], court: "granulite", lab: [8, 15, "start"],
        texte: "Ce que le liquide laisse derrière lui : une roche sèche, sans micas, faite de feldspath, de quartz, de grenat et parfois d'orthopyroxène. C'est la granulite de la croûte profonde, remontée plus tard par la tectonique." },
      { id: "charnockite", chemin: "chauffe", at: 935, forme: "tri", variante: true, dp: [0, -10], court: "charnockite", lab: [0, -18, "middle"],
        texte: "Variante : à plus de 900 °C et avec très peu d'eau, le magma granitique cristallise de l'orthopyroxène à la place de la biotite : une charnockite, granite des croûtes très chaudes et sèches (Inde du Sud)." },
    ],
    sources: `Fusion d'une métapélite : Vielzeuf D. et Holloway J. R. (1988), <i>Contributions to Mineralogy and Petrology</i> 98, 257 ; Clemens J. D. et Vielzeuf D. (1987), <i>Earth and Planetary Science Letters</i> 86, 287. Seuil de migration du liquide : Rosenberg C. L. et Handy M. R. (2005), <i>Journal of Metamorphic Geology</i> 23, 19.`,
  };

  // ═══════════════════════ 4. Même magma, refroidi plus ou moins vite ═══════════════════════
  // durée de refroidissement par conduction : t ≈ e² / (4 κ), κ = 10⁻⁶ m²/s
  const tRefroid = (e) => e * e / 4e-6 / 3.156e7; // années
  PHS.refroidissement = {
    scene: "diagramme",
    titre: "Même magma, refroidi plus ou moins vite",
    intro: "Un même liquide peut donner des roches très différentes selon le temps qu'il met à se figer. Plus le corps de magma est épais, plus il refroidit lentement : les cristaux ont le temps de grandir. Un filon mince fige en quelques jours, un pluton en des centaines de milliers d'années. Quelques roches échappent à cette règle, pour des raisons propres au liquide.",
    mesure: "Durée de refroidissement par conduction seule, t ≈ e² / (4 κ), e = épaisseur, κ = 10⁻⁶ m²/s (Turcotte et Schubert 2014) : un ordre de grandeur, que la chaleur de cristallisation et l'eau qui circule peuvent multiplier ou diviser par quelques-uns.",
    legende: `<span class="pq-sym">●</span> le temps décide de la taille des cristaux · en pointillé : une roche où autre chose décide, expliquée dans son texte.`,
    axes: {
      x: { min: 0.1, max: 10000, type: "log", ticks: [[0.1, "10 cm"], [1, "1 m"], [10, "10 m"], [100, "100 m"], [1000, "1 km"], [10000, "10 km"]], titre: "épaisseur du filon, de la coulée ou du pluton" },
      y: { min: 1 / 8766, max: 2e6, type: "log", ticks: [[1 / 8766, "1 h"], [1 / 365.25, "1 j"], [1, "1 an"], [100, "100 ans"], [10000, "10 000 ans"], [1e6, "1 Ma"]], titre: "temps pour se figer" },
    },
    v: { de: 0.1, a: 10000, log: true },
    duree: 10,
    fond: (g) => {
      return lab(g, 9000, 0.003, "plus épais : il se fige plus lentement,", { a: "end" }) + lab(g, 9000, 0.003, "et ses cristaux ont le temps de grandir", { a: "end", dy: 10 });
    },
    cadre: { x0: 64 },
    chemins: { conduction: { pts: [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000, 3000, 10000].map((e) => [e, tRefroid(e), e]) } },
    lire: (v) => [`épaisseur ${v < 1 ? nb(v * 100) + " cm" : v < 1000 ? lisible(v) + " m" : lisible(v / 1000) + " km"}`, `se fige en ≈ ${duree(tRefroid(v))}`],
    roches: [
      { id: "aplite", chemin: "conduction", at: 0.4, court: "aplite", lab: [8, 3, "start"],
        texte: "Filons de quelques centimètres à un mètre, figés en quelques heures à quelques jours : grains fins, moins de 1 mm, sans grands cristaux. Ce sont les derniers liquides d'un granite, pauvres en minéraux sombres, injectés dans ses fissures." },
      { id: "microgranite", chemin: "conduction", at: 4, court: "microgranite", lab: [8, 3, "start"],
        texte: "Un filon de quelques mètres se fige en quelques semaines à quelques mois : même liquide qu'un granite, mais des cristaux de l'ordre du millimètre, souvent avec quelques grands cristaux formés avant la montée." },
      { id: "microdiorite", chemin: "conduction", at: 12, court: "microdiorite", lab: [8, 3, "start"],
        texte: "Même principe pour un liquide de diorite : un filon de 5 à 20 m se fige en moins d'un an à quelques années, en grains fins (pierre de Logonna)." },
      { id: "dolerite", chemin: "conduction", at: 60, court: "dolérite", lab: [8, 3, "start"],
        texte: "Un filon ou un sill de plusieurs dizaines de mètres se fige en quelques décennies : les baguettes de plagioclase, de 0,5 à 2 mm, ont le temps de se prendre dans de grands pyroxènes (texture ophitique). Même liquide qu'un basalte ou qu'un gabbro." },
      { id: "granite", chemin: "conduction", at: 3000, court: "granite", lab: [-8, -5, "end"], ailleurs: true,
        texte: "Un pluton de quelques kilomètres se fige en dizaines à centaines de milliers d'années : cristaux de quelques millimètres à quelques centimètres. Sa fiche montre d'où vient son magma." },
      { id: "porphyre", chemin: "conduction", at: 25, dp: [0, -17], variante: true, court: "porphyre", lab: [0, -9, "middle"],
        texte: "Deux temps : de grands cristaux ont poussé lentement dans une chambre profonde, puis le magma est monté dans un filon ou un dôme, où le reste a figé vite en pâte fine. Un porphyre n'a donc pas une place unique sur la courbe : grands cristaux en haut, pâte en bas." },
      { id: "pegmatite", chemin: "conduction", at: 2, dp: [0, 17], variante: true, court: "pegmatite", lab: [0, 14, "middle"],
        texte: "L'exception : des filons de quelques mètres, figés en quelques mois, mais des cristaux de plusieurs centimètres à plusieurs mètres. Ce n'est pas la lenteur : le dernier liquide du granite, chargé d'eau, de bore et de fluor, est très fluide ; peu de germes naissent et ils grandissent très vite (London 2008)." },
      { id: "obsidienne", chemin: "conduction", at: 30, dp: [0, 17], variante: true, court: "obsidienne", lab: [0, 14, "middle"],
        texte: "Une coulée de rhyolite de quelques dizaines de mètres met des années à se figer, assez pour qu'un basalte cristallise ; mais ce liquide très riche en silice est si visqueux que les atomes ne s'ordonnent presque pas : il fige en verre, sans cristaux." },
    ],
    sources: `Refroidissement par conduction : Turcotte D. L. et Schubert G. (2014), <i>Geodynamics</i>, 3ᵉ éd., Cambridge University Press. Pegmatites : London D. (2008), <i>Pegmatites</i>, The Canadian Mineralogist, publication spéciale 10.`,
  };

  // ═══════════════════════ 5. Une éruption explosive ═══════════════════════
  PHS.explosion = {
    scene: "diagramme",
    titre: "Une éruption explosive : plusieurs roches possibles",
    intro: "Quand les gaz du magma se libèrent brutalement, la lave est déchirée en morceaux. Deux choses décident de la roche : la force de l'explosion, qui fixe jusqu'où les débris sont projetés, et la finesse des morceaux, qui augmente beaucoup si le magma rencontre de l'eau.",
    mesure: "Diagramme de Walker (1973) : surface couverte par le dépôt (là où il fait au moins 1 % de son épaisseur maximale) et part de cendres fines (moins de 1 mm) près de son axe. Positions typiques de chaque type d'éruption (Walker 1973 ; Wright et al. 1980).",
    legende: `<span class="pq-sym">●</span> un dépôt retombé de la colonne · en pointillé : un dépôt formé autrement, expliqué dans le texte de la roche.`,
    axes: {
      x: { min: 0.005, max: 1e5, type: "log", ticks: [[0.01, "0,01"], [1, "1"], [100, "100"], [10000, "10 000"]], titre: "surface couverte par le dépôt (km², échelle logarithmique)" },
      y: { min: 0, max: 100, ticks: [0, 20, 40, 60, 80, 100], titre: "cendres fines, moins de 1 mm (%)" },
    },
    v: { de: 0.01, a: 30000, log: true },
    duree: 10,
    fond: (g) => {
      let s = "";
      const bandes = [[0.005, 0.05, "hawaïen", COUL.h], [0.05, 5, "strombolien", COUL.e], [5, 500, "subplinien", COUL.h], [500, 1e5, "plinien", COUL.e]];
      for (const [a, b, n, c] of bandes) { s += g.rect(a, b, 0, 100, c); s += lab(g, Math.sqrt(a * b), 56, n, { a: "middle" }); }
      s += g.rect(0.05, 1e5, 62, 100, "rgba(90, 140, 200, 0.13)");
      s += lab(g, 0.08, 95, "le magma rencontre l'eau : la vapeur le pulvérise (surtseyen, phréatoplinien)");
      return s;
    },
    chemins: {
      sec: { pts: [[0.01, 3, 0.01], [0.3, 7, 0.3], [5, 15, 5], [300, 30, 300], [30000, 45, 30000]], nom: "magma seul", nomPos: [300, 30], nomDx: 2, nomDy: 12 },
      eau: { pts: [[0.3, 70, 0.3], [5, 82, 5], [300, 90, 300], [30000, 93, 30000]], nom: "magma et eau", nomPos: [0.3, 70], nomA: "end", nomDx: -5, nomDy: 3 },
    },
    lire: (v) => [`le dépôt couvre ${v < 1 ? nb(v, 2) : nb(v)} km²`],
    lecturePos: [66, 58, "start"],
    roches: [
      { id: "breche_volcanique", chemin: "sec", at: 0.01, variante: true, court: "brèche volcanique", lab: [7, -6, "start"],
        texte: "Blocs de plus de 6 cm, anguleux, qui ne vont pas loin : autour d'une bouche qui explose, ou dans l'avalanche d'un flanc de volcan qui s'effondre, comme dans le Cantal. Un tel dépôt couvre peu de surface et ne contient presque pas de cendres fines." },
      { id: "pouzzolane", chemin: "sec", at: 0.3, court: "pouzzolane", lab: [0, 14, "middle"],
        texte: "Éruption strombolienne : des gerbes de lave projetées à quelques centaines de mètres retombent en scories autour de la bouche. Le dépôt couvre moins de quelques km², contient peu de cendres fines et construit un cône, comme ceux de la chaîne des Puys." },
      { id: "ignimbrite", chemin: "sec", at: 10000, variante: true, court: "ignimbrite", lab: [0, 14, "middle"],
        texte: "Éruption plinienne : la colonne monte à 20–40 km et ses retombées couvrent des milliers de km². Si elle devient trop lourde, elle s'effondre en un écoulement de ponces et de cendres brûlantes qui suit les vallées : son dépôt, soudé par la chaleur, est une ignimbrite." },
      { id: "tuf_volcanique", chemin: "eau", at: 5, court: "tuf volcanique", lab: [0, -9, "middle"],
        texte: "Quand le magma rencontre de l'eau (nappe, lac, mer), la vapeur le pulvérise : la cendre est beaucoup plus fine. Un dépôt de cendres consolidé est un tuf ; les cendres fines d'une grande colonne, retombées loin du volcan, en donnent aussi." },
    ],
    sources: `Walker G. P. L. (1973), <i>Geologische Rundschau</i> 62, 431 ; Wright J. V., Smith A. L. et Self S. (1980), <i>Journal of Volcanology and Geothermal Research</i> 8, 315.`,
  };

  // ═══════════════════════ 6. Un courant d'eau trie les grains (Hjulström) ═══════════════════════
  // mêmes formules que « Conditions de formation » (formation-conditions.js, 5.2.11) : mise en mouvement pour 1 m d'eau
  // (Zhang 1961), dépôt sous la vitesse de chute (Ferguson et Church 2004) ; vitesses en cm/s
  const vErosion = (dmm) => { const d = dmm / 1000, h = 1; return 100 * Math.pow(h / d, 0.14) * Math.sqrt(17.6 * 1.65 * d + 6.05e-7 * (10 + h) / Math.pow(d, 0.72)); };
  const vChute = (dmm) => { const d = dmm / 1000, R = 1.65, g = 9.81, nu = 1e-6; return 100 * R * g * d * d / (18 * nu + Math.sqrt(0.75 * R * g * d * d * d)); };
  const vDepot = (d) => Math.min(vChute(d), vErosion(d) * 0.98);
  const grain = (d) => ({ pts: [[d, 300, 300], [d, vDepot(d), vDepot(d)]] });
  PHS.courant = {
    scene: "diagramme",
    titre: "Un courant d'eau trie les grains : plusieurs roches possibles",
    intro: "Une rivière en crue emporte des grains de toutes tailles. Quand elle ralentit, elle lâche d'abord les plus gros, puis les sables, et ne dépose les limons et les argiles qu'en eau presque immobile. Chaque endroit reçoit donc des grains d'une taille, et donne une roche différente.",
    mesure: "Diagramme de Hjulström (1935) recalculé comme dans « Conditions de formation » : mise en mouvement d'un grain dans 1 m d'eau (Zhang 1961) ; il se dépose quand le courant tombe sous sa vitesse de chute (Ferguson et Church 2004).",
    legende: `<span class="pq-sym">●</span> le grain se dépose : la roche qu'il forme · en pointillé : une variante, expliquée dans le texte de la roche.`,
    axes: {
      x: { min: 0.001, max: 300, type: "log", ticks: [[0.001, "0,001"], [0.01, "0,01"], [0.1, "0,1"], [1, "1"], [10, "10"], [100, "100"]], titre: "taille du grain (mm, échelle logarithmique)" },
      y: { min: 0.0001, max: 300, type: "log", ticks: [[0.001, "0,001"], [0.1, "0,1"], [10, "10"], [300, "300"]], titre: "vitesse du courant (cm/s)" },
    },
    v: { de: 300, a: 0.0002, log: true },
    duree: 11,
    fond: (g) => {
      const ds = g.serie((d) => d, 0.001, 300, 60, true);
      const Le = ds.map((d) => [d, vErosion(d)]), Ld = ds.map((d) => [d, vDepot(d)]);
      let s = g.zone([...Le, [300, 1e4], [0.001, 1e4]], COUL.f);
      s += g.zone([...Le, ...Ld.slice().reverse()], COUL.h);
      s += g.zone([...Ld, [300, 1e-6], [0.001, 1e-6]], COUL.b);
      s += g.courbe(Le, "#6f6a60", 1) + g.courbe(Ld, "#6f6a60", 1);
      for (const [a, n] of [[0.002, "argile"], [0.063, "limon"], [2, "sable"], [64, "gravier"]]) s += g.tirets([[a, 0.0001], [a, 300]], "#cfc6b5", 0.6);
      s += lab(g, 0.0011, 150, "érosion") + lab(g, 0.0011, 0.3, "transport") + lab(g, 30, 0.01, "dépôt", { a: "middle" });
      for (const [x, n] of [[0.012, "limon"], [0.36, "sable"], [12, "gravier"], [150, "galets"]]) s += lab(g, x, 0.0001, n, { a: "middle", dy: -4 });
      return s;
    },
    chemins: {
      galets: grain(30), alluv: grain(3), sableG: grain(0.8), sable: grain(0.3), gres: grain(0.15), silt: grain(0.02), vase: grain(0.008), argile: grain(0.002),
    },
    lire: (v) => [`courant : ${v >= 1 ? lisible(v) : nb(v, v >= 0.01 ? 2 : 4)} cm/s`, "il ralentit"],
    lecturePos: [300, 150, "start"],
    roches: [
      { id: "conglomerat", chemin: "galets", at: vDepot(30), court: "conglomérat", lab: [0, 12, "middle"],
        texte: "Les galets ne se déposent que là où le courant est encore fort, plus d'un mètre par seconde : au pied des montagnes, dans les torrents et les cônes. Cimentés, ils donnent un conglomérat, comme le poudingue de Valensole." },
      { id: "alluvions", chemin: "alluv", at: vDepot(3), court: "alluvions", lab: [7, 3, "start"],
        texte: "Dans le lit d'une rivière, graviers et sables grossiers se déposent quand la crue retombe ; les limons se posent plus loin, dans la plaine inondée. Encore meubles, ce sont les alluvions, comme celles de la Loire." },
      { id: "arkose", chemin: "sableG", at: vDepot(0.8), variante: true, court: "arkose", lab: [0, 12, "middle"],
        texte: "Variante : un sable grossier déposé près d'un massif de granite, sous un climat sec, garde ses feldspaths au lieu de les voir s'altérer en argile : cimenté, c'est une arkose (Trias du Massif central)." },
      { id: "sable", chemin: "sable", at: vDepot(0.3), court: "sable", lab: [0, -8, "middle"],
        texte: "Les sables se déposent dès que le courant tombe sous quelques centimètres par seconde ; dans une mer peu profonde, les vagues les trient encore. Restés meubles, ce sont des sables, comme ceux de Fontainebleau." },
      { id: "gres", chemin: "gres", at: vDepot(0.15), court: "grès", lab: [0, 12, "middle"],
        texte: "Le même sable, enfoui sous d'autres couches puis cimenté par du quartz vers 70–100 °C : un grès, comme le grès armoricain." },
      { id: "siltite", chemin: "silt", at: vDepot(0.02), court: "siltite", lab: [0, 12, "middle"],
        texte: "Les limons, de 2 à 63 µm, ne se déposent qu'en eau calme, sous un millimètre par seconde environ ; consolidés, ils donnent une siltite." },
      { id: "vase_tangue", chemin: "vase", at: vDepot(0.008), variante: true, court: "vase", lab: [0, -8, "middle"],
        texte: "Variante : à l'embouchure et en baie, les particules fines se collent en flocons au contact de l'eau salée ; ces flocons tombent plus vite que chaque grain seul et se déposent à l'étale de la marée : vases et tangue de la baie du Mont-Saint-Michel." },
      { id: "argile", chemin: "argile", at: vDepot(0.002), court: "argile", lab: [0, 12, "middle"],
        texte: "Les argiles, plus petites que 2 µm, ne se déposent qu'en eau presque immobile : lac, lagune, fond de mer au large. Une fois posées, elles collent entre elles : il faut un courant plus fort pour les reprendre que pour un sable." },
    ],
    sources: `Hjulström F. (1935), <i>Bulletin of the Geological Institution of the University of Upsala</i> 25, 221. Mise en mouvement : Zhang Ruijin (1961), <i>Sediment Transport</i>, Wuhan. Vitesse de chute : Ferguson R. I. et Church M. (2004), <i>Journal of Sedimentary Research</i> 74, 933.`,
  };

  // ═══════════════════════ 7. Pente, glace et vent ═══════════════════════
  PHS.agents = {
    scene: "diagramme",
    titre: "Pente, glace et vent : plusieurs roches possibles",
    intro: "Sans rivière pour les trier, les débris ne voyagent pas de la même façon. La glace emporte tout, des argiles aux blocs, sans rien trier. Sur une pente, les éboulis ne vont pas loin. Le vent, lui, trie mieux que l'eau : il ne soulève que des grains fins, et les dépose d'autant mieux triés qu'il les a portés loin.",
    mesure: "Tri = écart type des tailles de grains, en unités φ (Folk et Ward 1957 : moins de 0,35 très bien trié, plus de 4 extrêmement mal trié). Valeurs typiques de chaque dépôt (Boggs 2011 ; Pye 1995 pour le lœss) ; trajets schématiques.",
    legende: `<span class="pq-sym">●</span> dépôt meuble · en pointillé : la même chose, cimentée ou très ancienne.`,
    axes: {
      x: { min: 0.005, max: 500, type: "log", ticks: [[0.01, "0,01"], [0.1, "0,1"], [1, "1"], [10, "10"], [100, "100"]], titre: "taille moyenne des grains (mm, échelle logarithmique)" },
      y: { min: 0, max: 5, ticks: [[0.35, "0,35"], [1, "1"], [2, "2"], [4, "4"]], titre: "tri : dispersion des tailles (φ) — en haut, mal trié" },
    },
    v: { de: 0.001, a: 1000, log: true },
    duree: 10,
    fond: (g) => {
      let s = g.rect(0.005, 500, 0, 0.5, COUL.b) + g.rect(0.005, 500, 2, 5, COUL.f);
      s += lab(g, 500, 0.2, "bien trié", { a: "end", dx: -4, dy: 3 }) + lab(g, 500, 4.75, "très mal trié", { a: "end", dx: -4, dy: 3 });
      return s;
    },
    chemins: {
      glace: { pts: [[30, 4.3, 0.1], [12, 4.2, 30]], nom: "glacier", nomPos: [30, 4.3], nomDx: 7, nomDy: -5 },
      pente: { pts: [[150, 2.8, 0.001], [80, 2.4, 0.05]], nom: "chute sur une pente", nomPos: [150, 2.8], nomA: "end", nomDx: -8, nomDy: 3 },
      versant: { pts: [[0.08, 3.2, 0.005], [0.04, 2.7, 0.5]], nom: "ruissellement", nomPos: [0.08, 3.2], nomDx: 6, nomDy: -5 },
      sable: { pts: [[0.8, 2.2, 0.01], [0.45, 1.1, 1], [0.3, 0.4, 10]], nom: "le vent, en bonds", nomPos: [0.8, 2.2], nomDx: 6, nomDy: -5 },
      poussiere: { pts: [[0.06, 2, 0.01], [0.035, 1.3, 50], [0.03, 1.0, 500]], nom: "le vent, en suspension", nomPos: [0.06, 2], nomA: "end", nomDx: -6, nomDy: -4 },
    },
    lire: (v) => [`trajet : ${v < 1 ? nb(v * 1000) + " m" : lisible(v) + " km"}`],
    lecturePos: [66, 42, "start"],
    roches: [
      { id: "moraine", chemin: "glace", at: 30, court: "moraine", lab: [0, 14, "middle"],
        texte: "La glace porte tout ce qu'elle arrache, de l'argile aux blocs de plusieurs mètres, et le lâche en vrac quand elle fond : une moraine, le dépôt le plus mal trié qui soit, comme l'amphithéâtre morainique du Rhône." },
      { id: "tillite", chemin: "glace", at: 30, dp: [0, -18], variante: true, court: "tillite", lab: [7, 3, "start"],
        texte: "La même moraine, enfouie et consolidée en roche : une tillite. Celle du Ghaub, en Namibie, a 635 millions d'années ; on la trouve au niveau de la mer d'alors, près de l'équateur, preuve d'une glaciation presque planétaire." },
      { id: "eboulis", chemin: "pente", at: 0.05, court: "éboulis", lab: [0, 14, "middle"],
        texte: "Les blocs détachés d'une falaise, souvent par le gel, roulent sur quelques dizaines de mètres et s'arrêtent sur un talus d'environ 35° : un éboulis, anguleux et mal trié. Les grèzes de Charente, plus fines, sont litées." },
      { id: "breche_sedimentaire", chemin: "pente", at: 0.05, dp: [0, -20], variante: true, court: "brèche", lab: [0, -9, "middle"],
        texte: "Le même éboulis, cimenté par de la calcite : une brèche sédimentaire. Il faut au moins la moitié d'éléments anguleux de plus de 2 mm, et un ciment : sinon c'est encore un éboulis. Exemple : la brèche du Tholonet, au pied de la Sainte-Victoire." },
      { id: "colluvions", chemin: "versant", at: 0.5, court: "colluvions", lab: [0, -9, "middle"],
        texte: "Sur un versant cultivé, la pluie décape le sol et le fait glisser vers le bas, sur quelques centaines de mètres : limons, sables et cailloux mêlés s'accumulent au pied de la pente. Ce sont les colluvions." },
      { id: "dunes", chemin: "sable", at: 10, court: "dunes", lab: [0, 14, "middle"],
        texte: "Le vent ne déplace que les sables fins à moyens, de 0,1 à 0,5 mm, par bonds au ras du sol ; tout ce qui est plus gros reste sur place, tout ce qui est plus fin s'envole. Les dunes sont donc des sables très bien triés, comme la dune du Pilat." },
      { id: "loess", chemin: "poussiere", at: 500, court: "lœss", lab: [8, 3, "start"],
        texte: "Les poussières de 20 à 50 µm restent en l'air et voyagent des centaines de kilomètres avant de retomber : pendant les glaciations, le vent les soufflait depuis les plaines d'épandage des glaciers. Leur dépôt, homogène, est le lœss d'Alsace et du Nord." },
    ],
    sources: `Tri des grains : Folk R. L. et Ward W. C. (1957), <i>Journal of Sedimentary Petrology</i> 27, 3 ; Boggs S. (2011), <i>Principles of Sedimentology and Stratigraphy</i>, 5ᵉ éd., Pearson. Lœss : Pye K. (1995), <i>Quaternary Science Reviews</i> 14, 653.`,
  };

  // ═══════════════════════ 8. Une chaîne de montagnes se forme ═══════════════════════
  PHS.chaine = {
    scene: "diagramme",
    titre: "Une chaîne de montagnes se forme : plusieurs roches possibles",
    intro: "Devant une chaîne qui se forme, la plaque qui passe dessous se courbe sous son poids et creuse un bassin, qui reçoit les débris de la chaîne. Au début, la chaîne est encore basse et le bassin profond : les débris y arrivent en avalanches sous-marines. Plus tard, la chaîne émerge et s'érode vite : ses débris comblent le bassin, jusqu'à ce qu'il soit à terre.",
    mesure: "Profondeur du bassin situé devant les Alpes au fil de la collision : schéma d'après l'histoire du bassin d'avant-pays alpin (Sinclair 1997 ; Allen et al. 1991) ; les chiffres sont des ordres de grandeur.",
    legende: `<span class="pq-sym">●</span> la roche qui se dépose à ce moment · en pointillé : même roche, née devant une autre chaîne.`,
    axes: {
      x: { min: 90, max: 0, ticks: [[90, "90"], [70, "70"], [50, "50"], [30, "30"], [10, "10"], [0, "0 Ma"]], titre: "temps (millions d'années avant aujourd'hui)" },
      y: { min: -4000, max: 1000, ticks: [[-4000, "−4 000"], [-3000, "−3 000"], [-2000, "−2 000"], [-1000, "−1 000"], [0, "0"], [1000, "+1 000"]], titre: "altitude du fond du bassin (m)" },
    },
    v: { de: 90, a: 2 },
    duree: 10,
    cadre: { x0: 66 },
    fond: (g) => {
      let s = g.rect(90, 0, -4000, 0, "rgba(90, 140, 200, 0.12)");
      s += g.courbe([[90, 0], [0, 0]], "#7c9bb5", 0.9);
      s += lab(g, 88, 0, "niveau de la mer", { dy: -4 });
      return s;
    },
    chemins: { alpes: { pts: [[90, -3500, 90], [70, -3100, 70], [55, -2800, 55], [45, -2300, 45], [38, -1200, 38], [34, -250, 34], [28, 80, 28], [20, -40, 20], [15, 120, 15], [8, 300, 8], [2, 350, 2]] } },
    lire: (v, d) => d ? [`il y a ${lisible(v)} millions d'années`, d[1] < 0 ? `fond à ${nb(-Math.round(d[1] / 50) * 50)} m sous la mer` : "bassin à terre"] : "",
    lecturePos: [290, 150, "start"],
    roches: [
      { id: "grauwacke", chemin: "alpes", at: 70, variante: true, court: "grauwacke", lab: [0, -9, "middle"],
        texte: "Variante : le sable de ces avalanches sous-marines, mal trié et riche en fragments de roches, donne une grauwacke. Celles du Massif armoricain sont nées ainsi, devant la chaîne hercynienne, 300 millions d'années plus tôt." },
      { id: "flysch", chemin: "alpes", at: 50, court: "flysch", lab: [0, 14, "middle"],
        texte: "Tant que la chaîne naissante est surtout sous la mer, le bassin est profond de plusieurs kilomètres : les débris y descendent en avalanches sous-marines (courants de turbidité) et s'empilent en bancs alternés de grès et d'argile : le flysch (Crétacé supérieur – Éocène)." },
      { id: "molasse", chemin: "alpes", at: 25, court: "molasse", lab: [0, -9, "middle"],
        texte: "Quand la chaîne émerge et s'élève, elle s'érode beaucoup plus vite et comble le bassin : les débris s'accumulent en mer peu profonde, dans des lacs et des rivières. C'est la molasse de l'avant-pays alpin (34–5 millions d'années)." },
      { id: "conglomerat", chemin: "alpes", at: 5, court: "conglomérat", lab: [0, -9, "middle"], ailleurs: true,
        texte: "À la fin, des torrents étalent au pied de la chaîne des galets à peine triés : le poudingue de Valensole, entre 8 et 1,8 million d'années." },
    ],
    sources: `Bassin d'avant-pays alpin : Sinclair H. D. (1997), <i>Geological Society of America Bulletin</i> 109, 324 ; Allen P. A., Crampton S. L. et Sinclair H. D. (1991), <i>Basin Research</i> 3, 143.`,
  };

  // ═══════════════════════ 9. La mer dépose selon la profondeur et les apports ═══════════════════════
  PHS.mer = {
    scene: "diagramme",
    titre: "La mer dépose selon la profondeur : plusieurs roches possibles",
    intro: "En mer, le calcaire vient surtout des organismes : coquilles près des côtes, plancton plus au large. Ce qui change d'un endroit à l'autre, c'est ce qui s'y mêle, le sable et l'argile apportés par les fleuves, et, très profond, la dissolution : sous 4,5 à 5,5 km, l'eau froide et sous pression dissout la calcite avant qu'elle n'atteigne le fond.",
    mesure: "Part de carbonate dans le sédiment selon la profondeur d'eau : valeurs typiques des plates-formes et des bassins (Flügel 2010) ; profondeur où la calcite se dissout entièrement, 4,5 à 5,5 km dans l'océan actuel (Broecker et Peng 1982).",
    legende: `<span class="pq-sym">●</span> la roche déposée à cet endroit · les deux chemins : loin de tout apport, ou près d'une côte qui apporte sable et argile.`,
    axes: {
      x: { min: 3, max: 6000, type: "log", ticks: [[3, "3"], [10, "10"], [100, "100"], [1000, "1 000"], [6000, "6 000 m"]], titre: "profondeur d'eau (m, échelle logarithmique)" },
      y: { min: 0, max: 100, ticks: [0, 25, 50, 75, 100], titre: "carbonate dans le sédiment (%)" },
    },
    v: { de: 3, a: 6000, log: true },
    duree: 10,
    fond: (g) => {
      let s = g.rect(3, 200, 0, 100, "rgba(240, 214, 120, 0.16)") + lab(g, 4, 5, "zone éclairée (0–200 m)");
      s += g.rect(4500, 6000, 0, 100, "rgba(90, 140, 200, 0.16)") + lab(g, 4400, 62, "plus bas, la calcite se dissout →", { a: "end" });
      return s;
    },
    chemins: {
      large: { pts: [[3, 88], [30, 95], [250, 97], [1500, 95], [3500, 88], [4500, 45], [5200, 8], [6000, 2]].map(([x, y]) => [x, y, x]), nom: "loin des apports", nomPos: [1500, 95], nomA: "middle", nomDy: -6 },
      cote: { pts: [[3, 30], [20, 60], [80, 55], [300, 40], [2000, 30]].map(([x, y]) => [x, y, x]), nom: "près d'une côte qui apporte sable et argile", nomPos: [3, 30], nomDx: 4, nomDy: -6 },
    },
    lire: (v) => [`${lisible(v)} m d'eau`],
    lecturePos: [180, 150, "start"],
    roches: [
      { id: "calcaire", chemin: "large", at: 30, court: "calcaire", lab: [0, 14, "middle"],
        texte: "Sur une plate-forme chaude et peu profonde, loin des fleuves, coquilles, coraux et algues fournissent presque tout le sédiment : plus de 90 % de carbonate. Cimenté, c'est un calcaire, comme ceux du Bathonien du Bassin parisien." },
      { id: "craie", chemin: "large", at: 250, court: "craie", lab: [0, 14, "middle"],
        texte: "Plus au large, sous 100 à 600 m d'eau, il ne tombe presque que le plancton calcaire, des coccolithes de quelques millièmes de millimètre : une boue presque pure, plus de 95 % de carbonate, qui donne la craie (Étretat)." },
      { id: "falun", chemin: "cote", at: 20, court: "falun", lab: [0, -9, "middle"],
        texte: "Près d'une côte, dans une mer de quelques mètres à quelques dizaines de mètres, les coquilles brisées se mêlent au sable : un sable coquillier, le falun (mer des faluns de Touraine, Miocène)." },
      { id: "tuffeau", chemin: "cote", at: 80, court: "tuffeau", lab: [0, 14, "middle"],
        texte: "Un peu plus profond, le plancton calcaire se mêle au sable fin et aux paillettes de mica apportés du continent : une craie tendre et sableuse, le tuffeau de Touraine." },
      { id: "marne", chemin: "cote", at: 300, court: "marne", lab: [0, 14, "middle"],
        texte: "Là où l'argile apportée par les fleuves se dépose en même temps que le plancton calcaire, le sédiment contient entre 35 et 65 % de carbonate : une marne, comme les Terres Noires de Digne." },
      { id: "radiolarite", chemin: "large", at: 5200, court: "radiolarite", lab: [-7, 3, "end"], ailleurs: true,
        texte: "Sous 4,5 à 5,5 km, la calcite se dissout avant d'atteindre le fond : il ne reste que les squelettes de silice des radiolaires. Leur boue donne une radiolarite (voir « La silice se dépose et vieillit »)." },
    ],
    sources: `Faciès carbonatés : Flügel E. (2010), <i>Microfacies of Carbonate Rocks</i>, 2ᵉ éd., Springer. Dissolution de la calcite en profondeur : Broecker W. S. et Peng T.-H. (1982), <i>Tracers in the Sea</i>, Lamont-Doherty.`,
  };

  // ═══════════════════════ 10. L'eau de mer s'évapore ═══════════════════════
  const salinite = [[1, 35], [3.8, 133], [10.6, 371], [30, 385], [65, 398], [100, 405]];
  PHS.evaporation = {
    scene: "diagramme",
    titre: "L'eau de mer s'évapore : plusieurs roches possibles",
    intro: "Dans une lagune ou un bassin presque fermé, l'eau de mer s'évapore plus vite qu'elle n'est renouvelée : les sels se concentrent. Chacun cristallise quand sa concentration dépasse ce que l'eau peut porter, toujours dans le même ordre : d'abord les carbonates, puis le gypse, puis le sel, et à la toute fin les sels de potassium.",
    mesure: "Sels dissous dans l'eau de mer qui s'évapore : le gypse cristallise quand l'eau est 3,8 fois plus concentrée, le sel à 10,6 fois, les sels de potassium vers 65 fois (McCaffrey et al. 1987 ; Warren 2016). Au-delà du sel, la saumure reste presque aussi chargée : ce qui s'ajoute cristallise.",
    legende: `<span class="pq-sym">●</span> ce qui cristallise à ce stade · en pointillé : une variante, expliquée dans le texte de la roche.`,
    axes: {
      x: { min: 1, max: 100, type: "log", ticks: [[1, "× 1"], [3.8, "× 3,8"], [10.6, "× 10,6"], [65, "× 65"]], titre: "concentration de l'eau de mer (échelle logarithmique)" },
      y: { min: 0, max: 450, ticks: [0, 100, 200, 300, 400], titre: "sels dissous (g par litre)" },
    },
    v: { de: 1, a: 100, log: true },
    duree: 10,
    fond: (g) => {
      let s = "";
      for (const [a, b, n, c] of [[1, 3.8, "carbonates", COUL.h], [3.8, 10.6, "gypse", COUL.e], [10.6, 65, "sel", COUL.h], [65, 100, "potassium", COUL.e]]) { s += g.rect(a, b, 0, 450, c); s += lab(g, Math.sqrt(a * b), 30, n, { a: "middle" }); }
      return s;
    },
    chemins: { lagune: { pts: salinite.map(([x, y]) => [x, y, x]) } },
    lire: (v) => [`eau de mer × ${lisible(v)}`, `${nb(100 - 100 / v)} % de l'eau évaporée`],
    lecturePos: [66, 58, "start"],
    roches: [
      { id: "gypse", chemin: "lagune", at: 3.8, court: "gypse", lab: [-7, 3, "end"],
        texte: "Quand près des trois quarts de l'eau se sont évaporés (× 3,8), le sulfate de calcium dépasse ce que l'eau peut porter : le gypse cristallise. Celui de Montmartre s'est déposé ainsi dans une lagune, il y a 37 à 34 millions d'années." },
      { id: "dolomie", chemin: "lagune", at: 6, court: "dolomie", lab: [0, -10, "middle"],
        texte: "En retirant du calcium, le gypse laisse une saumure plus riche en magnésium qu'en calcium (rapport 10 vers × 6). Infiltrée dans la boue de calcite voisine, elle la change en dolomie. Beaucoup de dolomies, comme celles des Causses, se sont formées plus tard, en profondeur, avec des eaux riches en magnésium." },
      { id: "anhydrite", chemin: "lagune", at: 4.6, dp: [0, 22], variante: true, court: "anhydrite", lab: [7, 12, "start"],
        texte: "Même sel, sans eau : l'anhydrite se forme à la place du gypse au-dessus d'environ 58 °C dans l'eau pure, 18 °C seulement dans une saumure saturée en sel (Hardie 1967), ou quand le gypse enfoui perd son eau. Celle du Trias de Lorraine accompagne le sel." },
      { id: "sel", chemin: "lagune", at: 10.6, court: "sel gemme", lab: [0, -10, "middle"],
        texte: "Quand 90 % de l'eau est partie (× 10,6), le chlorure de sodium cristallise : c'est de loin le plus gros volume, environ 28 g pour chaque kilogramme d'eau de mer. Le sel du Keuper de Lorraine s'est déposé ainsi il y a environ 220 millions d'années." },
      { id: "sylvinite", chemin: "lagune", at: 65, court: "sylvinite", lab: [0, -10, "middle"],
        texte: "Il faut évaporer environ 98,5 % de l'eau (× 65) pour que les sels de potassium cristallisent : un bassin presque asséché, rare dans l'histoire. Ceux d'Alsace se sont déposés à l'Oligocène, dans le fossé rhénan." },
      { id: "cargneule", chemin: "lagune", at: 1, p: [1.25, 70], variante: true, sansTrait: true, court: "cargneule", lab: [7, 3, "start"],
        texte: "L'inverse : une eau douce ne porte que 2,4 g de gypse par litre, mais elle se renouvelle sans cesse. Dans une couche de gypse et de dolomie broyée entre deux nappes alpines, elle emporte le gypse : il reste une roche creusée de cellules, la cargneule." },
    ],
    sources: `McCaffrey M. A., Lazar B. et Holland H. D. (1987), <i>Journal of Sedimentary Petrology</i> 57, 928 ; Warren J. K. (2016), <i>Evaporites: A Geological Compendium</i>, 2ᵉ éd., Springer ; Hardie L. A. (1967), <i>American Mineralogist</i> 52, 171.`,
  };

  // ═══════════════════════ 11. La silice se dépose et vieillit ═══════════════════════
  // limites indicatives : opale A → opale CT vers 40 °C, opale CT → quartz vers 50 °C pour un dépôt de 10 Ma ; plus basses si
  // le dépôt est plus ancien (Kastner 1981 ; ODP 127/128)
  const bA = (t) => 40 - 12 * Math.log10(t / 10), bQ = (t) => 52 - 16 * Math.log10(t / 10);
  PHS.silice = {
    scene: "diagramme",
    titre: "La silice se dépose et vieillit : plusieurs roches possibles",
    intro: "Diatomées, radiolaires et éponges fabriquent leur squelette en opale, une silice mal cristallisée. Enfouie, elle se transforme lentement : opale A, puis opale CT, puis quartz. La chaleur accélère la transformation, le temps aussi : une silice ancienne passe au quartz à plus basse température qu'une silice jeune.",
    mesure: "Limites indicatives entre opale A, opale CT et quartz (d'après Kastner 1981 et les forages océaniques ODP 127 et 128 : opale A → CT vers 40 °C, CT → quartz vers 45–55 °C) ; elles baissent quand le dépôt vieillit. Trajets d'enfouissement schématiques.",
    legende: `<span class="pq-sym">●</span> où la roche a pris sa silice actuelle · en pointillé : une silice précipitée autrement.`,
    axes: {
      x: { min: 0.01, max: 300, type: "log", ticks: [[0.01, "10 000 ans"], [1, "1 Ma"], [10, "10 Ma"], [100, "100 Ma"]], titre: "temps depuis le dépôt (échelle logarithmique)" },
      y: { min: 0, max: 130, ticks: [0, 20, 40, 60, 80, 100, 120], titre: "température de la couche (°C)" },
    },
    v: { de: 0.01, a: 200, log: true },
    duree: 10,
    fond: (g) => {
      const ts = g.serie((t) => t, 0.01, 300, 40, true);
      const A = ts.map((t) => [t, bA(t)]), Q = ts.map((t) => [t, bQ(t)]);
      let s = g.zone([...A, [300, 0], [0.01, 0]], COUL.d) + g.zone([...A, ...Q.slice().reverse()], COUL.e) + g.zone([...Q, [300, 200], [0.01, 200]], COUL.a);
      s += g.courbe(A, "#9c927f", 0.8) + g.courbe(Q, "#9c927f", 0.8);
      s += lab(g, 0.015, 50, "opale A") + lab(g, 0.015, 84, "opale CT") + lab(g, 0.015, 122, "quartz");
      return s;
    },
    chemins: {
      diatomite: { pts: [[0.01, 10, 0.01], [1, 12, 1], [8, 15, 8]] },
      gaize: { pts: [[0.01, 10, 0.01], [20, 28, 20], [60, 35, 60], [105, 18, 105]] },
      silex: { pts: [[0.01, 10, 0.01], [1, 14, 1], [30, 38, 30], [55, 48, 55], [85, 20, 85]] },
      radiolarite: { pts: [[0.01, 5, 0.01], [20, 25, 20], [100, 105, 100], [160, 15, 160]] },
    },
    lire: (v) => [`${v < 1 ? nb(Math.round(v * 1e6 / 1000) * 1000) + " ans" : lisible(v) + " Ma"} après le dépôt`],
    lecturePos: [290, 42, "start"],
    roches: [
      { id: "diatomite", chemin: "diatomite", at: 8, court: "diatomite", lab: [0, -9, "middle"],
        texte: "Une boue de diatomées restée près de la surface, jamais chauffée : son opale n'a pas changé, la roche est légère, poreuse et tendre. Ce sont les diatomites des anciens lacs volcaniques du Velay et du Cantal." },
      { id: "gaize", chemin: "gaize", at: 60, court: "gaize", lab: [0, -9, "middle"],
        texte: "Une boue riche en spicules d'éponges, enfouie modérément : son opale est passée en partie à l'opale CT et au quartz, qui cimentent une roche légère et poreuse, la gaize de l'Argonne (Albien)." },
      { id: "silex", chemin: "silex", at: 55, court: "silex", lab: [-7, 3, "end"],
        texte: "Dans la craie, la silice des éponges est redissoute peu après le dépôt et se redépose en rognons, d'abord en opale CT ; avec le temps et un enfouissement modeste, elle passe au quartz microcristallin : le silex." },
      { id: "radiolarite", chemin: "radiolarite", at: 100, court: "radiolarite", lab: [0, -9, "middle"],
        texte: "Une boue de radiolaires déposée au fond de l'océan alpin, sous la profondeur où la calcite se dissout, puis enfouie sous les nappes : toute son opale est passée au quartz. Il en sort un jaspe très dur, rouge de fer." },
      { id: "meuliere", chemin: "diatomite", at: 1, p: [25, 12], variante: true, sansTrait: true, court: "meulière", lab: [0, 14, "middle"],
        texte: "Variante : à terre, dans les sols et les lacs, une eau qui porte peu de silice peut la déposer directement en quartz et en calcédoine, lentement, sans passer par l'opale des organismes. Ainsi s'est silicifiée la meulière de Brie, à l'Oligo-Miocène." },
    ],
    sources: `Kastner M. (1981), « Authigenic silicates in deep-sea sediments », dans <i>The Sea</i>, vol. 7, Wiley ; transformations de la silice des forages ODP 127/128 (mer du Japon), <i>Proceedings of the Ocean Drilling Program</i>.`,
  };

  // ═══════════════════════ 12. Le calcaire se dissout et se redépose ═══════════════════════
  // calcium à l'équilibre avec la calcite à 10 °C (mg/L) selon log pCO₂ : même calcul que « Conditions de formation »
  const CA10 = [[-3.5, 24.9], [-3.4, 26.9], [-3, 37.0], [-2.5, 55.4], [-2, 83.5], [-1.5, 126.7], [-1, 193.3], [-0.5, 297.0]];
  PHS.karst = {
    scene: "diagramme",
    titre: "Le calcaire se dissout et se redépose : plusieurs roches possibles",
    intro: "L'eau de pluie se charge de CO₂ en traversant le sol, où l'air en contient 10 à 100 fois plus que l'atmosphère : elle devient capable de dissoudre le calcaire. Ce qui compte ensuite, c'est ce qui reste et ce que devient l'eau : les insolubles restent sur place, et le calcium dissous se redépose dès que l'eau perd son CO₂ ou s'évapore.",
    mesure: "Calcium que l'eau peut garder dissous, à l'équilibre avec la calcite, selon le CO₂ de l'air qu'elle touche, à 10 °C (calcul de l'atlas d'après Plummer et Busenberg 1982, comme dans « Conditions de formation »).",
    legende: `<span class="pq-sym">▲</span> se dépose à partir de l'eau · <span class="pq-sym">■</span> reste sur place, insoluble · en pointillé : autre voie, expliquée dans le texte.`,
    axes: {
      x: { min: 0.03, max: 30, type: "log", ticks: [[0.04, "0,04 (air)"], [0.1, "0,1"], [1, "1"], [10, "10"]], titre: "CO₂ de l'air au contact de l'eau (%, échelle logarithmique)" },
      y: { min: 0, max: 240, ticks: [0, 50, 100, 150, 200], titre: "calcium dissous (mg par litre)" },
    },
    v: { de: 0, a: 1 },
    duree: 10,
    fond: (g) => {
      const L = CA10.map(([lp, ca]) => [Math.pow(10, lp) * 100, ca]);
      let s = g.zone([...L, [30, 400], [0.03, 400]], COUL.f) + g.zone([...L, [30, 0], [0.03, 0]], COUL.d);
      s += g.courbe(L, "#6f6a60", 1);
      s += lab(g, 0.035, 200, "trop de calcium : la calcite précipite") + lab(g, 10, 45, "l'eau dissout le calcaire", { a: "middle" });
      return s;
    },
    chemins: {
      eau: { pts: [[0.04, 2, 0], [1, 2, 0.25], [1, 83, 0.5], [0.1, 83, 0.8], [0.1, 37, 1]] },
    },
    lire: (v, d) => d ? [`CO₂ ${lisible(d[0])} % · calcium ${nb(d[1])} mg/L`] : "",
    lecturePos: [300, 42, "start"],
    roches: [
      { id: "terra_rossa", chemin: "eau", at: 0.5, dp: [11, 0], forme: "carre", court: "terra rossa", lab: [7, 4, "start"],
        texte: "Chargée du CO₂ du sol, l'eau dissout le calcaire jusqu'à ce qu'elle en soit saturée. Ce qui ne se dissout pas reste : 100 m de calcaire contenant 1 % d'argile laissent environ 1 m de résidu, rougi par les oxydes de fer. C'est la terra rossa des Causses." },
      { id: "argile_silex", chemin: "eau", at: 0.5, dp: [11, 16], forme: "carre", court: "argile à silex", lab: [7, 4, "start"],
        texte: "La même dissolution, sur la craie : il reste son argile et ses silex, insolubles, qui s'accumulent sur les plateaux du Pays de Caux." },
      { id: "phosphorite", chemin: "eau", at: 0.5, dp: [11, 32], forme: "carre", variante: true, court: "phosphorite", lab: [7, 4, "start"],
        texte: "Variante : les poches creusées par la dissolution servent de pièges. Dans celles du Quercy, le guano et les os des animaux ont libéré du phosphate, qui a précipité en phosphate de calcium entre 42 et 27 millions d'années." },
      { id: "travertin", chemin: "eau", at: 1, forme: "tri", court: "travertin", lab: [7, 3, "start"],
        texte: "À la source, l'eau sort à l'air libre et perd son CO₂ : elle ne peut plus garder autant de calcium, et la calcite précipite sur les mousses et les cascades. C'est le travertin, ou tuf calcaire." },
      { id: "calcrete", chemin: "eau", at: 0.5, p: [0.6, 190], forme: "tri", variante: true, sansTrait: true, court: "calcrète", lab: [7, 3, "start"],
        texte: "Sous un climat sec, l'eau du sol s'évapore avant d'aller loin : le calcium dissous se concentre au-delà de ce qu'elle peut porter et la calcite précipite dans le sol, en nodules puis en croûte. Il faut moins de 760 mm de pluie par an environ (Royer 1999)." },
    ],
    sources: `Équilibre de la calcite : Plummer L. N. et Busenberg E. (1982), <i>Geochimica et Cosmochimica Acta</i> 46, 1011 (calcul de l'atlas). Calcrètes et pluviométrie : Royer D. L. (1999), <i>Geology</i> 27, 1123.`,
  };

  // ═══════════════════════ 13. La matière organique s'enfouit ═══════════════════════
  PHS.charbon = {
    scene: "diagramme",
    titre: "La matière organique s'enfouit : plusieurs roches possibles",
    intro: "Des plantes accumulées dans un marécage, à l'abri de l'oxygène, ne pourrissent pas entièrement : elles forment de la tourbe. Enfouie sous d'autres couches, elle chauffe ; elle perd son eau, puis ses gaz, et s'enrichit en carbone. Le charbon obtenu dépend de la température la plus forte qu'il a connue.",
    mesure: "Carbone du charbon (sur matière sèche et sans cendres) selon la température maximale atteinte ; seuils des rangs d'après la réflectance de la vitrinite (Burnham et Sweeney 1989, compilés par le Kentucky Geological Survey) ; fenêtre à pétrole ≈ 60–120 °C.",
    legende: `<span class="pq-sym">●</span> rang du charbon · en pointillé : matière organique dispersée dans une vase, pas un charbon.`,
    axes: {
      x: { min: 0, max: 260, ticks: [0, 50, 100, 150, 200, [250, "250 °C"]], titre: "température la plus forte atteinte en profondeur" },
      y: { min: 45, max: 100, ticks: [50, 60, 70, 80, 90, 100], titre: "carbone (% du charbon)" },
    },
    v: { de: 10, a: 250 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(60, 120, 45, 100, "rgba(200, 160, 60, 0.16)") + lab(g, 90, 97, "fenêtre à pétrole", { a: "middle" });
      s += g.rect(120, 200, 45, 100, "rgba(90, 140, 200, 0.10)") + lab(g, 160, 97, "gaz", { a: "middle" });
      return s;
    },
    chemins: { charbon: { pts: [[10, 55, 10], [40, 67, 40], [80, 78, 80], [120, 85, 120], [170, 90, 170], [220, 93.5, 220], [250, 95, 250]] } },
    lire: (v) => [`${nb(Math.round(v / 5) * 5)} °C`, `vers ${nb((v - 10) / 30, 1)} km`],
    lecturePos: [66, 42, "start"],
    roches: [
      { id: "tourbe", chemin: "charbon", at: 10, court: "tourbe", lab: [7, 3, "start"],
        texte: "Au départ, dans un marécage : de la mousse et des plantes gorgées d'eau, à peine transformées, environ 55 % de carbone. Ce sont les tourbières du Jura et des monts d'Arrée." },
      { id: "lignite", chemin: "charbon", at: 40, court: "lignite", lab: [0, -9, "middle"],
        texte: "Enfouie à quelques centaines de mètres, sous 50 °C environ, la tourbe perd son eau et se tasse : un charbon brun où l'on voit encore le bois, 60 à 70 % de carbone. C'est le lignite de Gardanne." },
      { id: "houille", chemin: "charbon", at: 120, court: "houille", lab: [0, -9, "middle"],
        texte: "Vers 80 à 150 °C, soit 2 à 5 km, le charbon perd ses gaz et devient noir et brillant : 80 à 90 % de carbone. C'est la houille du Nord et de Lorraine, forêts du Carbonifère." },
      { id: "anthracite", chemin: "charbon", at: 220, court: "anthracite", lab: [0, -9, "middle"],
        texte: "Au-delà de 170–200 °C, il ne reste presque que du carbone, plus de 91 % : l'anthracite, dur et brillant, qui brûle sans fumée, comme à La Mure." },
      { id: "schiste_bitumineux", chemin: "charbon", at: 50, p: [50, 55], variante: true, sansTrait: true, court: "schiste bitumineux", lab: [7, 3, "start"],
        texte: "Variante : de la matière d'algues dispersée dans une vase marine, et non des plantes accumulées. Tant qu'elle n'a pas atteint la fenêtre à pétrole, elle reste dans la roche : un schiste bitumineux, comme les « schistes carton » du Toarcien. Chauffée vers 60–120 °C, elle donnerait du pétrole." },
    ],
    sources: `Rangs des charbons et fenêtre à pétrole : Burnham A. K. et Sweeney J. J. (1989), <i>Geochimica et Cosmochimica Acta</i> 53, 2649 ; tableaux de rangs du Kentucky Geological Survey.`,
  };

  // ═══════════════════════ 14. L'altération laisse ce qui ne se dissout pas ═══════════════════════
  PHS.alteration = {
    scene: "diagramme",
    titre: "L'altération laisse sur place ce qui ne se dissout pas",
    intro: "L'eau de pluie, légèrement acide, dissout peu à peu les minéraux d'une roche. Elle emporte d'abord les éléments les plus solubles, puis la silice ; le fer et l'aluminium, presque insolubles, restent. Plus l'altération dure et plus le climat est chaud et humide, plus il ne reste que ces résidus.",
    mesure: "Part de la silice de la roche emportée par l'eau, selon la durée de l'altération sous un climat tropical humide : ordres de grandeur (Nahon 1991 ; Tardy 1993). En climat tempéré, l'altération est beaucoup plus lente et s'arrête en général au stade de l'arène.",
    legende: `<span class="pq-sym">■</span> ce qui reste sur place.`,
    axes: {
      x: { min: 1000, max: 2e7, type: "log", ticks: [[1000, "1 000 ans"], [1e5, "100 000 ans"], [1e7, "10 Ma"]], titre: "durée de l'altération (échelle logarithmique)" },
      y: { min: 0, max: 100, ticks: [0, 25, 50, 75, 100], titre: "silice de la roche emportée par l'eau (%)" },
    },
    v: { de: 1000, a: 2e7, log: true },
    duree: 10,
    fond: (g) => {
      let s = g.rect(1000, 2e7, 85, 100, "rgba(190, 120, 60, 0.14)") + lab(g, 1200, 94, "il ne reste presque que fer et aluminium");
      return s;
    },
    chemins: {
      tropical: { pts: [[1000, 2, 1000], [1e4, 12, 1e4], [1e5, 35, 1e5], [1e6, 75, 1e6], [1e7, 95, 1e7], [2e7, 97, 2e7]], nom: "climat tropical humide", nomPos: [1e4, 12], nomA: "end", nomDx: -4, nomDy: -8 },
      tempere: { pts: [[1000, 0.5, 1000], [1e4, 3, 1e4], [1e5, 10, 1e5], [1e6, 22, 1e6]], nom: "climat tempéré", nomPos: [1e6, 22], nomDx: 6, nomDy: 12 },
    },
    lire: (v) => [`${duree(v)} d'altération`],
    lecturePos: [66, 58, "start"],
    roches: [
      { id: "alterite", chemin: "tropical", at: 1e5, forme: "carre", court: "altérite, arène", lab: [0, -9, "middle"],
        texte: "En quelques dizaines à centaines de milliers d'années, l'eau dissout une partie des feldspaths et des micas : la roche garde sa forme mais devient friable, riche en argile (kaolinite), tandis que le quartz reste intact. Ce sont les arènes et altérites du Limousin et de Bretagne." },
      { id: "laterite", chemin: "tropical", at: 1e6, forme: "carre", court: "cuirasse latéritique", lab: [-7, 3, "end"],
        texte: "Sous un climat chaud et très humide, pendant des millions d'années, presque toute la silice part : il reste surtout des oxydes de fer et d'aluminium, qui durcissent en cuirasse quand la nappe baisse. Celles du Périgord sont nées au Paléogène." },
      { id: "bauxite", chemin: "tropical", at: 1e7, forme: "carre", court: "bauxite", lab: [-7, 3, "end"],
        texte: "Au bout du processus, le fer part aussi, entraîné vers le bas : il ne reste que l'aluminium, en gibbsite et boehmite. Les bauxites de Provence se sont formées ainsi au Crétacé, sur des reliefs calcaires bien drainés." },
    ],
    sources: `Nahon D. (1991), <i>Introduction to the Petrology of Soils and Chemical Weathering</i>, Wiley ; Tardy Y. (1993), <i>Pétrologie des latérites et des sols tropicaux</i>, Masson.`,
  };

  // ═══════════════════════ 15. Une roche enfouie dans une collision chauffe (faciès) ═══════════════════════
  // faciès métamorphiques : mêmes polygones que « Conditions de formation » (formation-conditions.js, FACIES)
  const L_B = [[0, 0.3], [100, 0.42], [200, 0.55], [300, 0.68], [400, 0.82], [500, 0.98]];
  const L_E = [[500, 1.25], [775, 1.39], [900, 1.45], [1100, 1.6], [1500, 1.8]];
  const FACIES = [
    ["diagenèse", [[0, 0], [200, 0], [200, 0.55], [100, 0.42], [0, 0.3]], "#f1ede4", [100, 0.12]],
    ["très faible degré", [[200, 0], [300, 0], [300, 0.68], [200, 0.55]], "#ece6d8", null],
    ["cornéennes", [[300, 0], [1500, 0], [1500, 0.2], [300, 0.2]], "#efe3d6", [650, 0.08]],
    ["schistes verts", [[300, 0.2], [500, 0.2], [500, 0.98], [400, 0.82], [300, 0.68]], "#dfe9d8", [400, 0.3]],
    ["amphibolites", [[500, 0.2], [700, 0.2], [740, 0.8], [775, 1.39], [500, 1.25]], "#d9e0d6", [600, 0.3]],
    ["granulites", [[700, 0.2], [1500, 0.2], [1500, 1.8], [1100, 1.6], [900, 1.45], [775, 1.39], [740, 0.8]], "#eadbd3", [820, 0.3]],
    ["schistes bleus", [...L_B, [500, 1.25], [500, 9], [0, 9]], "#d8e1ec", [150, 1.2]],
    ["éclogites", [...L_E, [1500, 9], [500, 9]], "#ebd9d9", [720, 2.0]],
  ];
  const fondFacies = (masquer = []) => (g) => {
    let s = "";
    for (const [, L, c] of FACIES) s += g.zone(L, c, { stroke: "#fbf9f4", "stroke-width": 0.8 });
    for (const [n, , , p] of FACIES) if (p && !masquer.includes(n)) s += lab(g, p[0], p[1], n, { a: "middle" });
    return s;
  };
  const kmDeGPa = (p) => p <= 0.9614 ? p / 0.027468 : 35 + (p - 0.9614) / 0.032373;
  PHS.collision = {
    scene: "diagramme",
    titre: "Une roche enfouie dans une collision chauffe : plusieurs roches possibles",
    intro: "Dans une collision, des sédiments argileux sont entraînés en profondeur. La température y monte d'environ 25 à 30 °C par kilomètre : les argiles se changent en micas, qui grandissent à mesure que la roche chauffe. La roche obtenue dépend de la profondeur et de la température atteintes avant qu'elle ne remonte.",
    mesure: "Pression et température des faciès métamorphiques (limites indicatives, comme dans « Conditions de formation ») ; chemin d'une collision au gradient de 25 à 30 °C par km (schématique).",
    legende: `<span class="pq-sym">●</span> la roche obtenue si elle s'arrête là · en pointillé : même chemin, autre roche de départ.`,
    axes: {
      x: { min: 0, max: 900, ticks: [0, 200, 400, 600, [800, "800 °C"]], titre: "température (°C)" },
      y: { min: 0, max: 1.4, ticks: [[0, "0"], [0.4, "0,4"], [0.8, "0,8"], [1.2, "1,2"]], titre: "pression (GPa) — 1 GPa ≈ 36 km" },
    },
    v: { de: 200, a: 735 },
    duree: 10,
    fond: fondFacies(["éclogites"]),
    chemins: { barrovien: { pts: [[200, 0.12, 200], [300, 0.28, 300], [400, 0.45, 400], [500, 0.6, 500], [600, 0.72, 600], [700, 0.8, 700], [735, 0.82, 735]] } },
    lire: (v, d) => d ? [`${nb(Math.round(v / 5) * 5)} °C`, `≈ ${nb(kmDeGPa(d[1]))} km`] : "",
    lecturePos: [66, 42, "start"],
    roches: [
      { id: "ardoise", chemin: "barrovien", at: 320, court: "ardoise", lab: [-7, 3, "end"],
        texte: "Vers 250–350 °C, à une dizaine de kilomètres, les argiles se changent en paillettes de micas minuscules, toutes couchées dans le même plan : la roche se débite en feuillets fins. C'est l'ardoise d'Angers." },
      { id: "micaschiste", chemin: "barrovien", at: 540, court: "micaschiste", lab: [-7, 3, "end"],
        texte: "Vers 500–600 °C et 20–25 km, les micas grandissent jusqu'à se voir à l'œil nu et des grenats poussent : un micaschiste, comme dans les Cévennes." },
      { id: "gneiss", chemin: "barrovien", at: 660, court: "gneiss", lab: [-7, 3, "end"],
        texte: "Au-delà de 600–650 °C, les micas cèdent la place aux feldspaths et la roche se sépare en lits clairs (quartz, feldspaths) et sombres (biotite) : un gneiss." },
      { id: "leptynite", chemin: "barrovien", at: 660, dp: [0, 16], variante: true, court: "leptynite", lab: [7, 4, "start"],
        texte: "Même chaleur, mais la roche de départ était une lave ou un sable acides, pauvres en argile : il en sort un gneiss clair, à grain fin et presque sans micas, la leptynite (Limousin, Vendée)." },
      { id: "migmatite", chemin: "barrovien", at: 735, court: "migmatite", lab: [0, -9, "middle"], ailleurs: true,
        texte: "Encore plus chaud, vers 700 °C avec de l'eau, la roche commence à fondre : une migmatite (voir « La croûte fond »)." },
    ],
    sources: `Faciès métamorphiques : limites d'après Bucher K. et Grapes R. (2011), <i>Petrogenesis of Metamorphic Rocks</i>, 8ᵉ éd., Springer (tracé indicatif de l'atlas).`,
  };

  // ═══════════════════════ 16. Un basalte entraîné en profondeur : collision ou subduction ═══════════════════════
  PHS.basalteProfond = {
    scene: "diagramme",
    titre: "Un basalte entraîné en profondeur : plusieurs roches possibles",
    intro: "Un basalte de fond d'océan peut être entraîné en profondeur de deux façons. Dans une collision, il chauffe à peu près comme la croûte autour de lui. Dans une subduction, la plaque plonge si vite qu'elle reste froide : la roche atteint de grandes pressions à basse température, et cristallise d'autres minéraux.",
    mesure: "Faciès métamorphiques (limites indicatives, comme dans « Conditions de formation ») ; chemins schématiques d'une collision (≈ 25 °C par km) et d'une subduction (≈ 8 à 10 °C par km).",
    legende: `<span class="pq-sym">●</span> la roche obtenue si elle s'arrête là.`,
    axes: {
      x: { min: 0, max: 900, ticks: [0, 200, 400, 600, [800, "800 °C"]], titre: "température (°C)" },
      y: { min: 0, max: 2.4, ticks: [[0, "0"], [0.5, "0,5"], [1, "1"], [1.5, "1,5"], [2, "2"]], titre: "pression (GPa) — 1 GPa ≈ 36 km" },
    },
    v: { de: 0, a: 1 },
    duree: 10,
    fond: fondFacies(["diagenèse", "cornéennes"]),
    chemins: {
      collision: { pts: [[150, 0.1], [300, 0.3], [430, 0.5], [620, 0.75]], nom: "collision", nomPos: [150, 0.1], nomDx: 4, nomDy: 11 },
      subduction: { pts: [[100, 0.35], [250, 0.85], [350, 1.1], [450, 1.55], [550, 2.05]], nom: "subduction", nomPos: [250, 0.85], nomA: "end", nomDx: -6, nomDy: -4 },
    },
    lire: () => "",
    roches: [
      { id: "schiste_vert", chemin: "collision", at: 0.62, court: "schiste vert", lab: [7, 3, "start"],
        texte: "Dans une collision, un basalte chauffé vers 300–500 °C se charge de minéraux verts, chlorite, épidote et actinote : un schiste vert, comme les prasinites des Alpes internes." },
      { id: "amphibolite", chemin: "collision", at: 1, court: "amphibolite", lab: [7, 3, "start"],
        texte: "Plus chaud, vers 500–700 °C, la hornblende et le plagioclase remplacent ces minéraux : une amphibolite, comme dans le Limousin." },
      { id: "schiste_bleu", chemin: "subduction", at: 0.5, court: "schiste bleu", lab: [7, 3, "start"],
        texte: "Dans une subduction, la plaque reste froide : 8 à 10 °C par km. Vers 30–40 km et moins de 450 °C, le basalte cristallise du glaucophane, une amphibole bleue : un schiste bleu, comme à l'île de Groix." },
      { id: "eclogite", chemin: "subduction", at: 1, court: "éclogite", lab: [-7, 3, "end"],
        texte: "Plus profond, au-delà de 1,2 à 1,5 GPa (45–60 km), le plagioclase disparaît : il ne reste que du grenat rouge et un pyroxène vert, l'omphacite. Cette roche, l'éclogite, est plus dense que le manteau : elle aide la plaque à plonger." },
    ],
    sources: `Faciès métamorphiques : Bucher K. et Grapes R. (2011), <i>Petrogenesis of Metamorphic Rocks</i>, 8ᵉ éd., Springer (tracé indicatif de l'atlas).`,
  };

  // ═══════════════════════ 17. Même chaleur, autre roche de départ (triangle) ═══════════════════════
  // triangle quartz (bas gauche) – argile (haut) – carbonate (bas droite) ; (q, a, c) → x = c + a/2, y = a
  const tri = (q, a, c) => [c + a / 2, a];
  PHS.depart = {
    scene: "diagramme",
    titre: "Même chaleur, autre roche de départ : plusieurs roches possibles",
    intro: "Portées à la même température, des roches différentes donnent des roches métamorphiques différentes : le métamorphisme réorganise les atomes présents, il n'en apporte presque pas. Tout dépend donc de ce qu'il y avait au départ, surtout la part de quartz, d'argile et de calcaire.",
    mesure: "Triangle des roches de départ : part de quartz, d'argile et de carbonate (positions schématiques). Toutes sont portées à la même température, vers 450–550 °C.",
    legende: `<span class="pq-sym">●</span> la roche métamorphique obtenue à partir de la roche de départ écrite en gris.`,
    axes: { cache: true, x: { min: -12, max: 112 }, y: { min: -12, max: 108 } },
    v: { de: 0, a: 1 },
    duree: 9,
    fond: (g) => {
      const Q = tri(100, 0, 0), A = tri(0, 100, 0), C = tri(0, 0, 100);
      let s = g.zone([Q, A, C], COUL.e, { stroke: "#b9ae9a", "stroke-width": 0.8 });
      s += lab(g, 75, 50, "marne", { a: "start", dx: 10, dy: 12 }) + lab(g, 40, 80, "argile", { a: "end", dx: -9, dy: -6 });
      s += lab(g, Q[0], Q[1], "quartz (sable)", { a: "start", dy: 12 }) + lab(g, C[0], C[1], "carbonate (calcaire)", { a: "end", dy: 12 }) ;
      return s;
    },
    chemins: { depart: { pts: [[...tri(98, 2, 0), 0], [...tri(20, 80, 0), 0.4], [...tri(0, 50, 50), 0.68], [...tri(2, 0, 98), 1]] } },
    lire: () => ["même chaleur : ≈ 500 °C", ""],
    lecturePos: [320, 42, "start"],
    roches: [
      { id: "quartzite", chemin: "depart", at: 0, court: "quartzite", lab: [0, -9, "middle"],
        texte: "Un sable presque pur en quartz : il n'y a pas de minéral nouveau à former. Les grains se soudent et grossissent en une mosaïque serrée, très dure : un quartzite, comme au Roc'h Ruz dans les monts d'Arrée." },
      { id: "micaschiste", chemin: "depart", at: 0.4, court: "micaschiste", lab: [-8, 3, "end"], ailleurs: true,
        texte: "Une argile : ses minéraux se changent en micas et en grenats, un micaschiste (voir « Une roche enfouie dans une collision chauffe »)." },
      { id: "calcschiste", chemin: "depart", at: 0.68, court: "calcschiste", lab: [8, 3, "start"],
        texte: "Une marne, mélange de calcaire et d'argile : la calcite recristallise, l'argile donne des micas, en lits alternés. C'est un calcschiste, comme les schistes lustrés du Queyras." },
      { id: "marbre", chemin: "depart", at: 1, court: "marbre", lab: [0, -9, "middle"],
        texte: "Un calcaire pur : la calcite recristallise en grains plus gros et les fossiles disparaissent. C'est un marbre, comme celui de Saint-Béat." },
    ],
    sources: `Roches métamorphiques selon la roche de départ : Bucher K. et Grapes R. (2011), <i>Petrogenesis of Metamorphic Rocks</i>, 8ᵉ éd., Springer.`,
  };

  // ═══════════════════════ 18. Au contact d'un magma et de ses fluides ═══════════════════════
  const tContact = (x) => x <= 0 ? 560 + Math.min(1, -x / 300) * 140 : 150 + 410 * Math.exp(-x / 700);
  PHS.contact = {
    scene: "diagramme",
    titre: "Au contact d'un magma et de ses fluides : plusieurs roches possibles",
    intro: "Un magma mis en place dans la croûte chauffe les roches voisines sans les comprimer, et libère en refroidissant des fluides chauds chargés d'éléments. Près du contact, la chaleur recristallise la roche ; là où les fluides circulent, ils en changent la composition. Le résultat dépend de la distance, de la roche traversée et de la nature des fluides.",
    mesure: "Température la plus forte atteinte autour d'un granite mis en place vers 6 km (roches à ≈ 150 °C) : profil schématique ; la largeur réelle de l'auréole dépend de la taille du pluton, de quelques centaines de mètres à 2 km.",
    legende: `<span class="pq-sym">●</span> transformée par la chaleur · <span class="pq-sym">◆</span> transformée par les fluides · en pointillé : autre magma.`,
    axes: {
      x: { min: -300, max: 2000, ticks: [[-300, "−300"], [0, "0"], [500, "500"], [1000, "1 000"], [1500, "1 500"], [2000, "2 000 m"]], titre: "distance au contact du granite (m)" },
      y: { min: 100, max: 750, ticks: [100, 300, 500, 700], titre: "température la plus forte atteinte (°C)" },
    },
    v: { de: -300, a: 2000 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(-300, 0, 100, 750, "rgba(222, 120, 110, 0.16)") + lab(g, -150, 130, "granite", { a: "middle" });
      s += g.rect(0, 800, 100, 750, COUL.e) + lab(g, 400, 730, "auréole de contact", { a: "middle" });
      return s;
    },
    chemins: { profil: { pts: [-300, -200, -100, 0, 100, 300, 500, 800, 1200, 1600, 2000].map((x) => [x, tContact(x), x]) } },
    lire: (v) => [`${v < 0 ? nb(-v) + " m dans le granite" : nb(v) + " m du contact"}`, `jusqu'à ≈ ${nb(Math.round(tContact(v) / 10) * 10)} °C`],
    lecturePos: [290, 42, "start"],
    roches: [
      { id: "greisen", chemin: "profil", at: -120, p: [-150, 400], sansTrait: true, forme: "losange", court: "greisen", lab: [0, 14, "middle"],
        texte: "Sous le toit du granite, les derniers fluides, riches en fluor et en bore, transforment le granite lui-même une fois cristallisé, vers 300–500 °C : ses feldspaths deviennent micas blancs et quartz, avec parfois de l'étain. C'est le greisen de Montebras." },
      { id: "skarn", chemin: "profil", at: 25, forme: "losange", court: "skarn", lab: [7, -4, "start"],
        texte: "Au contact même, quand la roche est un calcaire, les fluides du granite lui apportent silice, fer et métaux : il se forme des silicates de calcium, grenat et pyroxène, et parfois du tungstène, comme à Salau. C'est un skarn." },
      { id: "corneenne", chemin: "profil", at: 350, court: "cornéenne", lab: [7, -4, "start"],
        texte: "Jusqu'à quelques centaines de mètres du granite, une argile ou un schiste chauffés vers 400–550 °C, sans être comprimés, recristallisent en une roche dure, sans feuillets, souvent tachetée d'andalousite ou de cordiérite : une cornéenne, comme autour du Sidobre." },
      { id: "fenite", chemin: "profil", at: 60, p: [300, 640], forme: "losange", variante: true, sansTrait: true, court: "fénite", lab: [7, 3, "start"],
        texte: "Variante : autour d'une carbonatite ou d'un magma très alcalin, les fluides sont riches en sodium et en potassium ; ils changent la roche voisine en une roche à feldspaths alcalins et pyroxène sodique, la fénite (Fen, Norvège)." },
    ],
    sources: `Auréoles de contact : Kerrick D. M., dir. (1991), <i>Contact Metamorphism</i>, Reviews in Mineralogy 26, Mineralogical Society of America.`,
  };

  // ═══════════════════════ 19. L'eau de mer transforme le plancher océanique ═══════════════════════
  PHS.plancher = {
    scene: "diagramme",
    titre: "L'eau de mer transforme le plancher océanique : plusieurs roches possibles",
    intro: "Sous une dorsale, l'eau de mer s'infiltre dans les fissures du plancher, descend jusqu'à 2 ou 3 km, se réchauffe au contact des roches chaudes puis remonte et ressort en fumeurs noirs. Sur son passage, elle échange des éléments avec les roches : chacune se transforme selon ce qu'elle était et la température de l'eau.",
    mesure: "Circulation de l'eau de mer sous une dorsale : descente, réchauffement jusqu'à 350–400 °C vers 2–3 km, remontée par les fumeurs noirs (Alt 1995 ; Mével 2003). Chemin schématique.",
    legende: `<span class="pq-sym">●</span> la roche transformée par l'eau à cet endroit · en pointillé : une variante.`,
    axes: {
      x: { min: 0, max: 450, ticks: [0, 100, 200, 300, [400, "400 °C"]], titre: "température de l'eau (°C)" },
      y: { min: 0, max: 6, inverse: true, ticks: [0, 1, 2, 3, 4, 5, 6], titre: "profondeur sous le fond de la mer (km)" },
    },
    v: { de: 0, a: 1 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(0, 450, 0, 0.6, COUL.e) + lab(g, 445, 0.35, "laves en coussins", { a: "end" });
      s += g.rect(0, 450, 0.6, 2, COUL.h) + lab(g, 445, 1.35, "filons", { a: "end" });
      s += g.rect(0, 450, 2, 6, COUL.b) + lab(g, 445, 5.6, "gabbros, ou manteau (dorsale lente)", { a: "end" });
      return s;
    },
    chemins: { eau: { pts: [[3, 0, 0], [40, 0.4, 0.08], [150, 1.1, 0.2], [280, 2, 0.35], [370, 3, 0.5], [400, 4.2, 0.6], [390, 3.2, 0.7], [370, 1.8, 0.82], [355, 0.6, 0.93], [350, 0, 1]] } },
    lire: (v, d) => d ? [`eau à ${nb(Math.round(d[0] / 5) * 5)} °C`, `${nb(d[1], 1)} km sous le fond`] : "",
    lecturePos: [66, 150, "start"],
    roches: [
      { id: "spilite", chemin: "eau", at: 0.3, court: "spilite", lab: [-7, 3, "end"],
        texte: "En descendant dans les coussins de basalte, l'eau se réchauffe à 200–350 °C : elle échange du sodium contre du calcium, et le plagioclase devient de l'albite, avec chlorite et épidote. C'est une spilite, comme au Chenaillet." },
      { id: "serpentinite", chemin: "eau", at: 0.45, court: "serpentinite", lab: [-7, 3, "end"],
        texte: "Là où le manteau est proche du fond, à une dorsale lente, l'eau atteint la péridotite en dessous de 400 °C environ : l'olivine s'hydrate en serpentine et la roche gonfle de 30 à 40 % (Mével 2003). C'est une serpentinite, comme dans le Queyras." },
      { id: "rodingite", chemin: "eau", at: 0.45, dp: [0, 18], variante: true, court: "rodingite", lab: [-7, 3, "end"],
        texte: "Un filon de gabbro pris dans cette péridotite qui se serpentinise reçoit le calcium qu'elle libère : ses feldspaths deviennent grenat calcique et pyroxène, entre 200 et 400 °C. C'est une rodingite." },
    ],
    sources: `Alt J. C. (1995), « Subseafloor processes in mid-ocean ridge hydrothermal systems », <i>Geophysical Monograph</i> 91, American Geophysical Union ; Mével C. (2003), <i>Comptes Rendus Geoscience</i> 335, 825.`,
  };

  // ═══════════════════════ 20. Une faille ou un impact broie la roche ═══════════════════════
  PHS.faille = {
    scene: "diagramme",
    titre: "Une faille broie la roche : plusieurs roches possibles",
    intro: "Le long d'une grande faille, la roche est broyée par le glissement des deux blocs. Près de la surface, froide, elle casse ; en profondeur, plus chaude, elle se déforme comme de la pâte. La roche produite dépend donc de la profondeur à laquelle la faille a joué, et de la vitesse du glissement.",
    mesure: "Modèle de faille de Sibson (1977) : broyage cassant près de la surface, déformation ductile en profondeur, où le quartz devient ductile vers 300 °C ; géotherme de 25 °C par km.",
    legende: `<span class="pq-sym">●</span> roche de faille · en pointillé : un broyage d'une autre origine.`,
    axes: {
      x: { min: 0, max: 600, ticks: [0, 100, 200, 300, 400, 500, [600, "600 °C"]], titre: "température (°C)" },
      y: { min: 0, max: 24, inverse: true, ticks: [0, 5, 10, 15, 20], titre: "profondeur (km)" },
    },
    v: { de: 0, a: 23 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(0, 300, 0, 24, COUL.f) + g.rect(300, 600, 0, 24, COUL.b);
      s += lab(g, 150, 1.6, "cassant", { a: "middle" }) + lab(g, 450, 22.6, "ductile", { a: "middle" });
      s += g.tirets([[0, 12], [600, 12]], "#9c927f") + lab(g, 595, 12, "base de la zone des séismes (≈ 12 km)", { a: "end", dy: -4 });
      s += g.tirets([[300, 0], [300, 24]], "#9c927f");
      return s;
    },
    chemins: { faille: { pts: [[10, 0, 0], [585, 23, 23]] } },
    lire: (v) => [`${nb(v, v < 10 ? 1 : 0)} km`, `≈ ${nb(Math.round((10 + 25 * v) / 5) * 5)} °C`],
    lecturePos: [66, 150, "start"],
    roches: [
      { id: "cataclasite", chemin: "faille", at: 3, court: "cataclasite", lab: [7, 3, "start"],
        texte: "Près de la surface, la roche est cassante : à chaque glissement, elle se brise et se broie en fragments anguleux, recollés ensuite par les fluides. C'est une cataclasite, comme le long des grandes failles du Massif central." },
      { id: "pseudotachylite", chemin: "faille", at: 10, court: "pseudotachylite", lab: [7, 3, "start"],
        texte: "Vers le bas de la zone des séismes, un glissement de quelques mètres en une seconde dégage assez de chaleur par frottement pour fondre la roche sur quelques millimètres ; ce liquide fige en verre noir : une pseudotachylite, séisme fossile (Sibson 1975)." },
      { id: "mylonite", chemin: "faille", at: 17, court: "mylonite", lab: [7, 3, "start"],
        texte: "Plus profond, au-delà d'environ 300 °C, le quartz se déforme sans casser et la roche s'étire en rubans très fins, sans perdre sa cohésion : une mylonite, comme dans le cisaillement sud-armoricain." },
      { id: "impactite", chemin: "faille", at: 1, p: [520, 5], variante: true, sansTrait: true, court: "impactite", lab: [0, 14, "middle"],
        texte: "Un impact broie aussi la roche, mais d'un seul coup et bien plus fort : 10 à 100 GPa pendant une fraction de seconde, loin au-delà de ce diagramme ; le quartz est choqué et la roche peut fondre. C'est l'impactite de Rochechouart." },
    ],
    sources: `Sibson R. H. (1977), <i>Journal of the Geological Society</i> 133, 191 ; Sibson R. H. (1975), <i>Geophysical Journal of the Royal Astronomical Society</i> 43, 775.`,
  };

  // ═══════════════════════ 21. Le fer dissous précipite (Eh–pH) ═══════════════════════
  PHS.fer = {
    scene: "diagramme",
    titre: "Le fer dissous précipite : là où l'eau rencontre l'oxygène",
    intro: "Dans une eau sans oxygène, le fer reste dissous (Fe²⁺) et voyage loin. Dès qu'il rencontre de l'oxygène, il s'oxyde en Fe³⁺, presque insoluble, et précipite en oxydes. Là où cette rencontre se fait en grand, au fond d'une mer ou dans un sol, le fer s'accumule.",
    mesure: "Diagramme potentiel d'oxydo-réduction–pH du fer (activité 10⁻⁶), calculé pour la partie Oxydes de l'atlas (ThermoChimie v12a).",
    legende: `<span class="pq-sym">●</span> là où le fer précipite.`,
    axes: {
      x: { min: 0, max: 14, ticks: [0, 2, 4, 6, 8, 10, 12, 14], titre: "pH (acide à gauche, basique à droite)" },
      y: { min: -0.8, max: 1.0, ticks: [[-0.8, "−0,8"], [-0.4, "−0,4"], [0, "0"], [0.4, "0,4"], [0.8, "0,8"]], titre: "potentiel d'oxydation Eh (V) — en haut, oxygéné" },
    },
    v: { de: 0, a: 1 },
    duree: 9,
    fond: (g) => {
      let s = "";
      const F = typeof POURBAIX !== "undefined" && POURBAIX.fer;
      if (F) for (const d of F.domaines) s += g.zone(d.points, d.couleur.replace(/[\d.]+\)$/, (m) => Math.min(0.5, parseFloat(m) + 0.05) + ")"));
      s += lab(g, 2.5, -0.45, "fer dissous (Fe²⁺)") + lab(g, 11.5, 0.3, "oxydes de fer", { a: "middle" });
      s += g.tirets([[0, 1.23], [14, 0.4]], "#7c9bb5") + g.tirets([[0, 0], [14, -0.83]], "#7c9bb5");
      return s;
    },
    chemins: { ocean: { pts: [[7.2, -0.45, 0], [7.2, 0.45, 1]], nom: "océan sans oxygène, puis oxygéné", nomPos: [7.2, -0.45], nomDx: 7, nomDy: 3 } },
    lire: (v, d) => d ? [`Eh ${nb(d[1], 2)} V`, d[1] < -0.17 ? "le fer reste dissous" : "le fer précipite"] : "",
    lecturePos: [66, 110, "start"],
    roches: [
      { id: "roche_ferrifere", chemin: "ocean", at: 0.31, court: "fer rubané", lab: [7, 3, "start"],
        texte: "Il y a 3,8 à 1,8 milliards d'années, l'océan profond manquait d'oxygène et portait beaucoup de fer dissous. Là où il rencontrait des eaux oxygénées par les premières algues, le fer précipitait en couches d'oxydes, alternant avec de la silice : les fers rubanés (Hamersley). La minette lorraine, plus récente, est un autre cas : des grains de fer déposés dans une mer peu profonde." },
      { id: "laterite", chemin: "ocean", at: 1, p: [5, 0.6], variante: true, sansTrait: true, court: "latérite", lab: [7, 3, "start"], ailleurs: true,
        texte: "Dans un sol tropical aéré, le fer libéré par l'altération précipite sur place en oxydes : il s'accumule en cuirasse (voir « L'altération laisse sur place ce qui ne se dissout pas »)." },
    ],
    sources: `Diagramme du fer : partie Oxydes de l'atlas (ThermoChimie v12a, PHREEQC). Fers rubanés : Klein C. (2005), <i>American Mineralogist</i> 90, 1473.`,
  };

  for (const [cle, ph] of Object.entries(PHS)) Pourquoi.ajouter(cle, ph);
})();
