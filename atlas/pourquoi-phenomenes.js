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
    intro: "La fusion du manteau ne résulte pas d'un chauffage : elle survient lorsque la roche remonte et que la pression diminue. Plus elle s'élève, davantage elle fond. Mais sa remontée s'interrompt sous la plaque qui la recouvre : sous un continent ancien et épais, elle ne fond que très peu, en profondeur ; sous une plaque mince, comme celle d'une dorsale, elle fond abondamment. La quantité fondue et la profondeur déterminent le magma, donc la roche.",
    mesure: "Chemins schématiques : profondeur où la fusion commence et part du manteau fondue à la fin de la remontée, ordres de grandeur publiés pour chaque contexte (McKenzie et Bickle 1988 ; Frey et al. 1978 ; Dasgupta et Hirschmann 2006 ; Arndt et al. 2008).",
    legende: `<span class="pq-sym">●</span> magma formé · <span class="pq-sym">■</span> reliquat du manteau · en tirets : variante, détaillée dans le texte de la roche.`,
    axes: {
      x: { min: 0.1, max: 60, type: "log", ticks: [[0.1, "0,1"], [0.3, "0,3"], [1, "1"], [3, "3"], [10, "10"], [30, "30"], [60, "60"]], titre: "part du manteau qui a fondu (%, échelle logarithmique)" },
      y: { min: 0, max: 260, inverse: true, ticks: [0, 50, 100, 150, 200, 250], titre: "profondeur (km)" },
    },
    v: { de: 260, a: 0 },
    duree: 11,
    fond: (g) => {
      let s = g.rect(0.1, 60, 150, 260, COUL.g);
      s += g.tirets([[0.1, 150], [60, 150]], DOM);
      s += lab(g, 60, 258, "Sous un continent froid, à environ 150 km de profondeur, le diamant demeure stable.", { a: "end", dx: -4, dy: -3 });
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
        texte: "Lors des premiers instants de la fusion d'un manteau renfermant du CO₂, les toutes premières gouttes, moins de 1 % de la roche, sont formées de carbonates fondus plutôt que de silicates (Dasgupta et Hirschmann 2006). Une carbonatite peut aussi se détacher plus tard d'un magma pauvre en silice, à la manière de l'huile qui se sépare de l'eau : tel est le cas de l'Ol Doinyo Lengai, dans le rift est-africain." },
      { id: "foidolite", chemin: "rift", at: 100, court: "foïdolite", lab: "g",
        texte: "Dans un rift, le manteau monte, mais la plaque l'arrête entre 80 et 100 km de profondeur : la fusion n'atteint alors que 2 à 5 %. Très pauvre en silice et riche en sodium, ce liquide constitue une néphélinite. Figé en profondeur, il engendre une foïdolite dans laquelle la néphéline supplée aux feldspaths, la silice faisant défaut." },
      { id: "basanite", chemin: "rift", at: 85, court: "basanite", lab: "b",
        texte: "Le même manteau, un peu plus haut, fond de 5 à 7 % : le liquide est un peu moins pauvre en silice. C'est une basanite, avec olivine, pyroxène et un peu de néphéline (Frey et al. 1978), comme les coulées du Devès." },
      { id: "lamprophyre", chemin: "litho", at: 66, court: "lamprophyre", lab: "g",
        texte: "Une ancienne subduction a enrichi en eau et en potassium la base de la plaque située sous une chaîne en fin de vie. Lorsque celle-ci s'effondre, cette part du manteau fond un peu : des magmas humides s'élèvent alors en fins filons de lamprophyre, à biotite et amphibole, à l'image du kersanton de la rade de Brest." },
      { id: "picrite", chemin: "panache", at: 70, court: "picrite", lab: "h",
        texte: "Un panache rend le manteau plus chaud de 100 à 300 °C : la fusion débute plus bas et s'intensifie, atteignant 20 à 25 %. Riche en magnésium, le liquide fait cristalliser beaucoup d'olivine ; les océanites du Piton de la Fournaise sont des basaltes chargés de ces cristaux, accumulés dans le réservoir." },
      { id: "basalte", chemin: "dorsale", at: 35, court: "basalte", lab: "g", ailleurs: true,
        texte: "Lorsque la plaque s'amincit au niveau d'une dorsale, le manteau atteint presque le fond marin et fond à hauteur de 10 à 20 % (McKenzie et Bickle 1988) : ainsi se forme le basalte des dorsales. Celui de la chaîne des Puys, présenté dans sa fiche, dérive au contraire d'un manteau ayant moins fondu." },
      { id: "peridotite", chemin: "dorsale", at: 15, court: "péridotite (le reste)", forme: "carre", lab: "g",
        texte: "Ce qui subsiste du manteau après extraction du magma. La lherzolite de Lherz a peu fondu et renferme encore olivine et deux pyroxènes. Au-delà de 15 à 25 % de fusion, comme sous une dorsale, le clinopyroxène disparaît : il ne reste que olivine et orthopyroxène, soit une harzburgite." },
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
    intro: "Un magma provenant d'un manteau peu fondu se révèle riche en sodium et en potassium, sous le Massif central. Pendant son refroidissement crustal, l'olivine et le pyroxène cristallisent les premiers et captent magnésium et fer ; le liquide restant gagne alors en silice et, surtout, en alcalins. La nature de la roche dépend de l'avancement du processus et du destin du liquide : une lave s'il jaillit, une roche grenue s'il demeure en profondeur.",
    mesure: "Diagramme silice–alcalins (TAS : Le Bas et al. 1986), en % de la masse de la roche. Chemins : tendance des laves de la chaîne des Puys, du basalte au trachyte du puy de Dôme (Boivin et al. 2017), et suite plus pauvre en silice du Velay et du Mont-Dore jusqu'aux phonolites (tendance indicative). Les roches grenues sont placées au même endroit que la lave de même composition.",
    legende: `<span class="pq-sym">▲</span> évacué en éruption, donc une lave · <span class="pq-sym">■</span> figé en profondeur, donc une roche grenue · en tirets : une variante, précisée dans le texte de la roche.`,
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
        texte: "Le magma arrivant du manteau, contenant environ 46 % de silice, est évacué directement en éruption : il donne un basalte, à l'image des coulées de la chaîne des Puys." },
      { id: "trachybasalte", chemin: "puys", at: 48.8, forme: "tri", dp: [0, -9], court: "trachybasalte", lab: [0, -18, "middle"],
        texte: "Après un court passage dans la croûte, où olivine et pyroxène ont commencé leur cristallisation, le liquide se charge un peu plus en alcalins : une majorité des coulées de la chaîne des Puys se classe donc parmi les trachybasaltes." },
      { id: "monzodiorite", chemin: "puys", at: 53.5, forme: "carre", dp: [0, 10], court: "monzodiorite", lab: [7, 14, "start"],
        texte: "Quand une trachyandésite basaltique (≈ 53 % de silice) reste en profondeur et se cristallise lentement, elle devient une monzodiorite, dont le plagioclase et le feldspath potassique se partagent à peu près à égalité, avec amphibole et biotite en accompagnement." },
      { id: "trachyandesite", chemin: "puys", at: 57.3, forme: "tri", dp: [0, -9], court: "trachyandésite", lab: [0, -18, "middle"],
        texte: "Autour de 57 % de silice et de 8 à 9 % d'alcalins se place la trachyandésite. Le stratovolcan du Cantal en est formé pour l'essentiel ; ses laves ont transité par des chambres de la croûte avant d'atteindre la surface." },
      { id: "latite", chemin: "puys", at: 57.3, p: [61.5, 5.2], forme: "tri", variante: true, court: "latite", lab: [0, 14, "middle"],
        texte: "Variante : la trachyandésite occupe ce même domaine ; quand le potassium y est assez abondant (K₂O au-dessus de Na₂O − 2, en % pondéraux), la classification appelle cette roche une latite. Celles des Vosges du Sud naissent au Viséen d'un magma plus riche en potassium, sans rapport avec la chaîne des Puys." },
      { id: "monzonite", chemin: "puys", at: 57.3, forme: "carre", dp: [0, 10], court: "monzonite", lab: [7, 14, "start"],
        texte: "Restée en profondeur, la trachyandésite se transforme en monzonite : plagioclase et feldspath potassique s'y trouvent à parts égales, auxquels s'ajoutent un peu d'amphibole ou de biotite." },
      { id: "trachyte", chemin: "puys", at: 63.5, forme: "tri", dp: [0, -9], court: "trachyte", lab: [0, -18, "middle"],
        texte: "En bout de parcours, pour environ 63 % de silice et 10 à 11 % d'alcalins, le liquide ne contient guère plus que du feldspath alcalin fondu. Il s'agit d'un trachyte, très visqueux, qui se met en place sous forme de dôme, comme le puy de Dôme." },
      { id: "syenite", chemin: "puys", at: 63.5, forme: "carre", dp: [0, 10], court: "syénite", lab: [7, 14, "start"],
        texte: "Le liquide trachytique, cristallisé en profondeur, donne une syénite, faite presque entièrement de feldspath alcalin." },
      { id: "basanite", chemin: "velay", at: 43.5, forme: "tri", dp: [0, -9], court: "basanite", lab: [0, -18, "middle"], ailleurs: true,
        texte: "Venu d'un manteau moins fondu, un magma plus pauvre encore en silice engendre une basanite, origine des phonolites du Velay (voir « Le manteau fond »)." },
      { id: "essexite", chemin: "velay", at: 46, forme: "carre", dp: [0, 10], court: "essexite", lab: [7, 14, "start"],
        texte: "Lorsqu'un liquide basanitique ou téphritique stagne en profondeur, il cristallise un gabbro enrichi en feldspathoïdes : c'est l'essexite, présente dans les petites intrusions du cœur du Cantal." },
      { id: "phonolite", chemin: "velay", at: 57.2, forme: "tri", dp: [0, -9], court: "phonolite", lab: [0, -18, "middle"],
        texte: "Au bout de la série pauvre en silice, le liquide contient 13 à 15 % d'alcalins mais trop peu de silice pour ne former que des feldspaths : il cristallise aussi de la néphéline. Très visqueuse, c'est la phonolite, qui forme des sucs comme celui du Gerbier-de-Jonc." },
      { id: "syenite_nephelinique", chemin: "velay", at: 57.2, forme: "carre", dp: [0, 10], court: "syénite néphélinique", lab: [9, 1, "start"],
        texte: "Figée en profondeur, la phonolite devient une syénite néphélinique, composée de feldspath alcalin et de néphéline. Les Khibiny (Kola) forment le plus grand massif du monde qui en est constitué." },
    ],
    sources: `Diagramme silice–alcalins : Le Bas M. J., Le Maitre R. W., Streckeisen A. et Zanettin B. (1986), <i>Journal of Petrology</i> 27, 745. Laves de la chaîne des Puys : Boivin P. et al. (2017), <i>Volcanologie de la Chaîne des Puys</i>, 6ᵉ éd., Parc naturel régional des Volcans d'Auvergne.`,
  };

  // ═══════════════════════ 3. La croûte fond ═══════════════════════
  PHS.croute = {
    scene: "diagramme",
    titre: "La croûte fond : plusieurs roches possibles",
    intro: "Dans une chaîne épaissie, la base de la croûte se réchauffe jusqu'à une fusion partielle. Peu abondant, le liquide reste coincé entre les grains ; au-delà de quelques %, il forme un réseau et peut migrer. Suivant la température atteinte et la destinée du liquide, on aboutit à une roche semi-fondue, à un magma granitique, ou au résidu sec qu'il abandonne.",
    mesure: "Part de liquide d'une croûte argileuse (métapélite) chauffée vers 0,8 GPa (≈ 30 km) : ordres de grandeur des expériences de Vielzeuf et Holloway (1988) et des calculs de Clemens et Vielzeuf (1987). Au-delà d'environ 7 % de liquide, les gouttes se relient et le liquide peut migrer (Rosenberg et Handy 2005).",
    legende: `<span class="pq-sym">●</span> roche formée sur place · <span class="pq-sym">▲</span> liquide qui s'échappe : un magma · <span class="pq-sym">■</span> résidu · en tirets : une variante.`,
    axes: {
      x: { min: 600, max: 1000, ticks: [600, 700, 800, 900, [1000, "1 000 °C"]], titre: "température de la croûte (°C)" },
      y: { min: 0, max: 60, ticks: [0, 10, 20, 30, 40, 50, 60], titre: "liquide formé (% de la roche)" },
    },
    v: { de: 610, a: 960 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(600, 1000, 0, 7, COUL.b);
      s += lab(g, 1000, 3.5, "le liquide reste entre les grains", { a: "end", dx: -5, dy: 3 });
      s += lab(g, 1000, 9, "au-delà de ≈ 7 %, il se connecte en réseau et peut s'écouler", { a: "end", dx: -5, dy: 3 });
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
        texte: "Vers 650 à 750 °C, en présence d'un peu d'eau, la croûte commence à fondre : quelques % de liquide granitique se rassemblent en veines claires, entre des zones restées solides et sombres. Figée dans cet état, elle forme une migmatite, comme celle du dôme du Velay." },
      { id: "granite", chemin: "chauffe", at: 860, forme: "tri", dp: [0, -10], court: "granite", lab: [-6, -12, "end"],
        texte: "Lorsque micas, et surtout biotite, entrent en fusion vers 800 à 850 °C, le liquide dépasse 20 à 30 %. Il se sépare, s'élève et s'accumule en chambres où il cristallise en granite : telle est la genèse de la majorité des granites varisques français." },
      { id: "granulite_meta", chemin: "chauffe", at: 890, forme: "carre", dp: [0, 11], court: "granulite", lab: [8, 15, "start"],
        texte: "Le liquide, une fois parti, laisse une roche sèche, sans micas, composée de feldspath, de quartz, de grenat et parfois d'orthopyroxène. Cette granulite de la croûte profonde est ensuite remontée par la tectonique." },
      { id: "charnockite", chemin: "chauffe", at: 935, forme: "tri", variante: true, dp: [0, -10], court: "charnockite", lab: [0, -18, "middle"],
        texte: "Variante : au-delà de 900 °C, avec très peu d'eau, le liquide granitique fait apparaître de l'orthopyroxène en lieu et place de la biotite. Ce granite des croûtes très chaudes et sèches s'appelle charnockite (Inde du Sud)." },
    ],
    sources: `Fusion d'une métapélite : Vielzeuf D. et Holloway J. R. (1988), <i>Contributions to Mineralogy and Petrology</i> 98, 257 ; Clemens J. D. et Vielzeuf D. (1987), <i>Earth and Planetary Science Letters</i> 86, 287. Seuil de migration du liquide : Rosenberg C. L. et Handy M. R. (2005), <i>Journal of Metamorphic Geology</i> 23, 19.`,
  };

  // ═══════════════════════ 4. Même magma, refroidi plus ou moins vite ═══════════════════════
  // durée de refroidissement par conduction : t ≈ e² / (4 κ), κ = 10⁻⁶ m²/s
  const tRefroid = (e) => e * e / 4e-6 / 3.156e7; // années
  PHS.refroidissement = {
    scene: "diagramme",
    titre: "Même magma, refroidi plus ou moins vite",
    intro: "Selon la durée de son refroidissement, un même liquide peut donner des roches très dissemblables. Plus un corps magmatique est volumineux, plus son refroidissement dure, et plus les cristaux disposent de temps pour croître. Un filon étroit se fige en quelques jours, un pluton en plusieurs centaines de milliers d'années. Certaines roches font exception, pour des motifs propres au liquide lui-même.",
    mesure: "Durée de refroidissement par conduction seule, t ≈ e² / (4 κ), avec e l'épaisseur et κ = 10⁻⁶ m²/s (Turcotte et Schubert 2014) : c'est un ordre de grandeur, que la chaleur de cristallisation et la circulation d'eau peuvent multiplier ou diviser par quelques unités.",
    legende: `<span class="pq-sym">●</span> la durée fixe la taille des cristaux · en tirets : une roche où autre chose décide, expliquée dans son texte.`,
    axes: {
      x: { min: 0.1, max: 10000, type: "log", ticks: [[0.1, "10 cm"], [1, "1 m"], [10, "10 m"], [100, "100 m"], [1000, "1 km"], [10000, "10 km"]], titre: "épaisseur du filon, de la coulée ou du pluton" },
      y: { min: 1 / 8766, max: 2e6, type: "log", ticks: [[1 / 8766, "1 h"], [1 / 365.25, "1 j"], [1, "1 an"], [100, "100 ans"], [10000, "10 000 ans"], [1e6, "1 Ma"]], titre: "temps pour se figer" },
    },
    v: { de: 0.1, a: 10000, log: true },
    duree: 10,
    fond: (g) => {
      return lab(g, 9000, 0.003, "Plus le corps est épais, plus le figeage s'étire,", { a: "end" }) + lab(g, 9000, 0.003, "les cristaux disposent alors du temps nécessaire à leur croissance", { a: "end", dy: 10 });
    },
    cadre: { x0: 64 },
    chemins: { conduction: { pts: [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000, 3000, 10000].map((e) => [e, tRefroid(e), e]) } },
    lire: (v) => [`épaisseur ${v < 1 ? nb(v * 100) + " cm" : v < 1000 ? lisible(v) + " m" : lisible(v / 1000) + " km"}`, `se fige en ≈ ${duree(tRefroid(v))}`],
    roches: [
      { id: "aplite", chemin: "conduction", at: 0.4, court: "aplite", lab: [8, 3, "start"],
        texte: "Ces filons, de quelques centimètres à un mètre, se figent en quelques heures à quelques jours. Leurs grains, inférieurs à 1 mm, restent sans gros cristaux ; ils proviennent des tout derniers liquides d'un granite, pauvres en minéraux sombres, injectés dans les fissures." },
      { id: "microgranite", chemin: "conduction", at: 4, court: "microgranite", lab: [8, 3, "start"],
        texte: "Un filon de quelques mètres se fige en quelques semaines à quelques mois. Son liquide est celui d'un granite, mais ses cristaux atteignent le millimètre, et quelques grands cristaux, formés avant la montée, s'y trouvent parfois." },
      { id: "microdiorite", chemin: "conduction", at: 12, court: "microdiorite", lab: [8, 3, "start"],
        texte: "Le même principe vaut pour un liquide dioritique : un filon de 5 à 20 m se fige en moins d'un an à quelques années, en grains fins (pierre de Logonna)." },
      { id: "dolerite", chemin: "conduction", at: 60, court: "dolérite", lab: [8, 3, "start"],
        texte: "Un filon ou un sill large de plusieurs dizaines de mètres se fige en quelques décennies. Ses baguettes de plagioclase, longues de 0,5 à 2 mm, se trouvent piégées par de grands pyroxènes, d'où la texture dite ophitique. Le liquide est identique à celui d'un basalte ou d'un gabbro." },
      { id: "granite", chemin: "conduction", at: 3000, court: "granite", lab: [-8, -5, "end"], ailleurs: true,
        texte: "Un pluton de quelques kilomètres se solidifie sur des dizaines à des centaines de milliers d'années, pour fournir des cristaux de quelques millimètres à quelques centimètres. La fiche indique l'origine de son magma." },
      { id: "porphyre", chemin: "conduction", at: 25, dp: [0, -17], variante: true, court: "porphyre", lab: [0, -9, "middle"],
        texte: "Le processus s'effectue en deux temps : de grands cristaux ont d'abord poussé lentement dans une chambre profonde, puis le magma a gagné un filon ou un dôme, où le reste s'est rapidement figé en pâte fine. Un porphyre ne se place donc pas en un seul point de la courbe : grands cristaux en haut, pâte en bas." },
      { id: "pegmatite", chemin: "conduction", at: 2, dp: [0, 17], variante: true, court: "pegmatite", lab: [0, 14, "middle"],
        texte: "Il existe pourtant une exception : des filons de quelques mètres, figés en quelques mois, renferment des cristaux de plusieurs centimètres, voire de plusieurs mètres. Le facteur décisif n'est pas la lenteur : le liquide résiduel d'un granite, gorgé d'eau, de bore et de fluor, reste très fluide ; peu de germes apparaissent, qui grandissent très vite (London 2008)." },
      { id: "obsidienne", chemin: "conduction", at: 30, dp: [0, 17], variante: true, court: "obsidienne", lab: [0, 14, "middle"],
        texte: "Une coulée de rhyolite haute de quelques dizaines de mètres ne se fige qu'en plusieurs années, délai suffisant pour qu'un basalte cristallise. Mais ce liquide, très riche en silice, s'avère si visqueux que les atomes ne s'organisent presque pas : il se fige en verre, dépourvu de cristaux." },
    ],
    sources: `Refroidissement par conduction : Turcotte D. L. et Schubert G. (2014), <i>Geodynamics</i>, 3ᵉ éd., Cambridge University Press. Pegmatites : London D. (2008), <i>Pegmatites</i>, The Canadian Mineralogist, publication spéciale 10.`,
  };

  // ═══════════════════════ 5. Une éruption explosive ═══════════════════════
  PHS.explosion = {
    scene: "diagramme",
    titre: "Une éruption explosive : plusieurs roches possibles",
    intro: "Lorsque les gaz du magma se libèrent brutalement, la lave se fragmente. Deux facteurs déterminent la roche : la violence de l'explosion, qui fixe la distance de projection des débris, et la finesse des fragments, qui augmente nettement si le magma rencontre de l'eau.",
    mesure: "Diagramme de Walker (1973) : surface couverte par le dépôt (là où il fait au moins 1 % de son épaisseur maximale) et part de cendres fines (moins de 1 mm) près de son axe. Positions typiques de chaque type d'éruption (Walker 1973 ; Wright et al. 1980).",
    legende: `<span class="pq-sym">●</span> retombée de la colonne éruptive · en tirets : un dépôt formé autrement, précisé dans le texte de la roche.`,
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
      s += lab(g, 0.08, 95, "Au contact de l'eau, le magma est pulvérisé par la vapeur (types surtseyen et phréatoplinien).");
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
        texte: "Blocs anguleux de plus de 6 cm, qui ne voyagent guère : ils tombent autour d'une bouche explosive ou dans l'avalanche d'un flanc de volcan qui s'effondre, comme dans le Cantal. Un tel dépôt occupe peu d'espace et contient très peu de cendres fines." },
      { id: "pouzzolane", chemin: "sec", at: 0.3, court: "pouzzolane", lab: [0, 14, "middle"],
        texte: "Éruption strombolienne : des gerbes de lave, projetées à quelques centaines de mètres, reviennent en scories autour du cratère. Ce dépôt couvre au plus quelques km², contient peu de fines cendres et bâtit un cône semblable à ceux de la chaîne des Puys." },
      { id: "ignimbrite", chemin: "sec", at: 10000, variante: true, court: "ignimbrite", lab: [0, 14, "middle"],
        texte: "Éruption plinienne : la colonne atteint 20 à 40 km de hauteur, et ses retombées recouvrent des milliers de km². Trop lourde, elle finit par s'effondrer en un écoulement de ponces et de cendres brûlantes qui suit les vallées ; le dépôt, consolidé par la chaleur, prend le nom d'ignimbrite." },
      { id: "tuf_volcanique", chemin: "eau", at: 5, court: "tuf volcanique", lab: [0, -9, "middle"],
        texte: "Au contact d'une nappe, d'un lac ou de la mer, le magma est pulvérisé par la vapeur : la cendre devient alors beaucoup plus fine. Une cendre consolidée prend le nom de tuf ; les cendres fines d'une grande colonne, retombées loin du volcan, forment elles aussi des tufs." },
    ],
    sources: `Walker G. P. L. (1973), <i>Geologische Rundschau</i> 62, 431 ; Wright J. V., Smith A. L. et Self S. (1980), <i>Journal of Volcanology and Geothermal Research</i> 8, 315.`,
  };

  // ═══════════════════════ 6. Un courant d'eau trie les grains (Hjulström) ═══════════════════════
  // mêmes formules que « Conditions de formation » (formation-conditions.js, 5.2.11) : mise en mouvement pour 1 m d'eau
  // (Zhang 1961), dépôt sous la vitesse de chute (Ferguson et Church 2004) ; vitesses en cm/s
  const vErosion = (dmm) => { const d = dmm / 1000, h = 1; return 100 * Math.pow(h / d, 0.14) * Math.sqrt(17.6 * 1.65 * d + 6.05e-7 * (10 + h) / Math.pow(d, 0.72)); };
  const vChute = (dmm) => { const d = dmm / 1000, R = 1.65, g = 9.81, nu = 1e-6; return 100 * R * g * d * d / (18 * nu + Math.sqrt(0.75 * R * g * d * d * d)); };
  const vDepot = (d) => Math.min(vChute(d), vErosion(d) * 0.98);
  const grain = (d) => ({ d, pts: [[d, 1000, 1000], [d, vDepot(d), vDepot(d)]] });
  // pour la bulle de survol : taille du grain et vitesses en unités parlantes (sous 0,1 mm/s : par heure)
  const fr = (x) => Number(x.toPrecision(2)).toLocaleString("fr-FR");
  const taille = (d) => d >= 10 ? `${fr(d / 10)} cm` : d >= 0.1 ? `${fr(d)} mm` : `${fr(d * 1000)} µm`;
  const vitesse = (v) => v >= 100 ? `${fr(v / 100)} m/s` : v >= 1 ? `${fr(v)} cm/s` : v >= 0.01 ? `${fr(v * 10)} mm/s`
    : v * 36 >= 1 ? `${fr(v * 36)} m par heure` : `${fr(v * 3600)} cm par heure`;
  PHS.courant = {
    scene: "diagramme",
    titre: "Un courant d'eau trie les grains : plusieurs roches possibles",
    intro: "Une rivière en crue charrie des grains de toutes tailles. En ralentissant, elle laisse d'abord les plus gros, puis les sables ; les limons et les argiles ne se déposent qu'en eau presque dormante. Chaque secteur reçoit donc une granulométrie particulière, et engendre une roche distincte.",
    mesure: "Diagramme de Hjulström (1935), recalculé selon la méthode de « Conditions de formation » : la mise en mouvement d'un grain dans 1 m d'eau suit Zhang (1961), et le dépôt survient quand le courant descend sous la vitesse de chute (Ferguson et Church 2004).",
    legende: `<span class="pq-sym">●</span> dépôt du grain et roche qu'il forme · en tirets : variante, détaillée dans le texte de la roche.`,
    // le graphique se lit de haut en bas, pas de gauche à droite (12/10/2026 : « quand le courant diminue ça emporte les
    // conglomérats ? ») ; l'axe monte à 10 m/s pour que la courbe d'érosion, en U, ne soit plus coupée en haut
    commentLire: "On lit chaque grain selon une verticale, en partant du haut, où le courant est fort, pour descendre à mesure qu'il faiblit. Au-dessus de la courbe supérieure, dite d'érosion, le courant décroche le grain du fond ; entre les deux courbes, dite de transport, il ne le décroche plus mais le charrie encore ; sous la courbe inférieure, dite de dépôt, le grain tombe et se fixe. Le point rouge suit le grain de la roche présentée. La courbe supérieure n'a pas de sens chronologique de gauche à droite : elle traduit seulement le courant requis pour soulever chaque taille. Ce seuil est minimal pour un sable fin (environ 30 cm/s), plus élevé pour un galet, plus lourd (1,5 m/s pour 3 cm), et plus élevé encore pour une argile, dont les grains se collent (1,8 m/s).",
    axes: {
      x: { min: 0.001, max: 300, type: "log", ticks: [[0.001, "0,001"], [0.01, "0,01"], [0.1, "0,1"], [1, "1"], [10, "10"], [100, "100"]], titre: "taille du grain (mm, échelle logarithmique)" },
      y: { min: 0.0001, max: 1000, type: "log", ticks: [[0.001, "0,001"], [0.1, "0,1"], [10, "10"], [1000, "1 000"]], titre: "vitesse du courant (cm/s)" },
    },
    v: { de: 1000, a: 0.0002, log: true },
    duree: 11,
    fond: (g) => {
      const ds = g.serie((d) => d, 0.001, 300, 60, true);
      const Le = ds.map((d) => [d, vErosion(d)]), Ld = ds.map((d) => [d, vDepot(d)]);
      let s = g.zone([...Le, [300, 1e4], [0.001, 1e4]], COUL.f);
      s += g.zone([...Le, ...Ld.slice().reverse()], COUL.h);
      s += g.zone([...Ld, [300, 1e-6], [0.001, 1e-6]], COUL.b);
      s += g.courbe(Le, "#6f6a60", 1) + g.courbe(Ld, "#6f6a60", 1);
      for (const [a, n] of [[0.002, "argile"], [0.063, "limon"], [2, "sable"], [64, "gravier"]]) s += g.tirets([[a, 0.0001], [a, 300]], "#cfc6b5", 0.6);
      // chaque mot au milieu de sa zone, entre les verticales des grains (l'ancien « érosion » tombait sous la courbe)
      s += lab(g, 9.5, 400, "érosion", { a: "middle" }) + lab(g, 0.055, 1.5, "transport", { a: "middle" }) + lab(g, 30, 0.01, "dépôt", { a: "middle" });
      for (const [x, n] of [[0.012, "limon"], [0.36, "sable"], [12, "gravier"], [150, "galets"]]) s += lab(g, x, 0.0001, n, { a: "middle", dy: -4 });
      return s;
    },
    chemins: {
      galets: grain(30), alluv: grain(3), sableG: grain(0.8), sable: grain(0.3), gres: grain(0.15), silt: grain(0.02), vase: grain(0.008), argile: grain(0.002),
    },
    lire: (v) => [`courant : ${v >= 1 ? lisible(v) : nb(v, v >= 0.01 ? 2 : 4)} cm/s`, "il ralentit"],
    // survol d'une roche (12/10/2026, sa demande) : les deux seuils de son grain, marqués sur sa verticale
    survol: (rc) => {
      const d = PHS.courant.chemins[rc.chemin].d;
      return { lignes: [`${rc.court} · grains de ${taille(d)}`, `arraché au-dessus de ${vitesse(vErosion(d))}`, `déposé sous ${vitesse(vDepot(d))}`],
        marques: [[d, vErosion(d)], [d, vDepot(d)]] };
    },
    lecturePos: [300, 150, "start"],
    roches: [
      { id: "conglomerat", chemin: "galets", at: vDepot(30), court: "conglomérat", lab: [0, 12, "middle"],
        texte: "Les galets ne se fixent qu'où le courant reste soutenu, de l'ordre d'un mètre par seconde : pieds de montagne, torrents, cônes. Cimentés, ils forment un conglomérat, tel le poudingue de Valensole." },
      { id: "alluvions", chemin: "alluv", at: vDepot(3), court: "alluvions", lab: [7, 3, "start"],
        texte: "Au fond d'une rivière, graviers et sables grossiers sédimentent à la décrue, tandis que les limons se répandent plus loin, sur la plaine inondée. Demeurés meubles, ces dépôts forment des alluvions, comme celles de la Loire." },
      { id: "arkose", chemin: "sableG", at: vDepot(0.8), variante: true, court: "arkose", lab: [0, 12, "middle"],
        texte: "Variante : un sable grossier déposé au voisinage d'un massif de granite, sous un climat sec, garde ses feldspaths, qui ne s'altèrent pas en argile. Cimenté, il donne une arkose (Trias du Massif central)." },
      { id: "sable", chemin: "sable", at: vDepot(0.3), court: "sable", lab: [0, -8, "middle"],
        texte: "Quand le courant tombe sous quelques centimètres par seconde, les sables se déposent ; dans une mer peu profonde, les vagues les trient encore. Restés meubles, ils forment des sables comme ceux de Fontainebleau." },
      { id: "gres", chemin: "gres", at: vDepot(0.15), court: "grès", lab: [0, 12, "middle"],
        texte: "Enfoui sous d'autres couches, puis cimenté par du quartz vers 70 à 100 °C, ce même sable se mue en grès, à l'image du grès armoricain." },
      { id: "siltite", chemin: "silt", at: vDepot(0.02), court: "siltite", lab: [0, 12, "middle"],
        texte: "Les limons, dont les grains mesurent de 2 à 63 µm, se déposent seulement en eau calme, à moins d'un millimètre par seconde environ ; consolidés, ils forment une siltite." },
      { id: "vase_tangue", chemin: "vase", at: vDepot(0.008), variante: true, court: "vase", lab: [0, -8, "middle"],
        texte: "Variante : aux embouchures et dans les baies, au contact de l'eau salée, les particules fines s'agglomèrent en flocons. Ceux-ci chutent plus vite qu'un grain isolé et se déposent durant l'étale de marée : vases et tangue de la baie du Mont-Saint-Michel." },
      { id: "argile", chemin: "argile", at: vDepot(0.002), court: "argile", lab: [0, 12, "middle"],
        texte: "Les argiles, inférieures à 2 µm, sédimentent uniquement en eau presque calme : lac, lagune, fond marin au large. Une fois déposées, elles s'agglutinent, si bien qu'un courant doit être plus fort pour les remettre en mouvement que pour un sable." },
    ],
    sources: `Hjulström F. (1935), <i>Bulletin of the Geological Institution of the University of Upsala</i> 25, 221. Mise en mouvement : Zhang Ruijin (1961), <i>Sediment Transport</i>, Wuhan. Vitesse de chute : Ferguson R. I. et Church M. (2004), <i>Journal of Sedimentary Research</i> 74, 933.`,
  };

  // ═══════════════════════ 7. Pente, glace et vent ═══════════════════════
  PHS.agents = {
    scene: "diagramme",
    titre: "Pente, glace et vent : plusieurs roches possibles",
    intro: "Sans rivière qui les trie, les débris voyagent de façons variées. La glace transporte tout indistinctement, des argiles aux blocs, sans rien classer. Sur une pente, les éboulis ne parcourent pas de longues distances. Le vent, quant à lui, classe mieux que l'eau : il n'enlève que les grains fins, qu'il dépose d'autant mieux triés qu'il les a transportés loin.",
    mesure: "Le tri correspond à l'écart type des tailles de grains, exprimé en unités φ (Folk et Ward 1957 : sous 0,35, le tri est très bon ; au-delà de 4, il est extrêmement mauvais). Valeurs typiques de chaque dépôt (Boggs 2011 ; Pye 1995 pour le lœss) ; trajets schématiques.",
    legende: `<span class="pq-sym">●</span> dépôt meuble · en tirets : identique, mais cimenté ou très ancien.`,
    axes: {
      x: { min: 0.005, max: 500, type: "log", ticks: [[0.01, "0,01"], [0.1, "0,1"], [1, "1"], [10, "10"], [100, "100"]], titre: "taille moyenne des grains (mm, échelle logarithmique)" },
      y: { min: 0, max: 5, ticks: [[0.35, "0,35"], [1, "1"], [2, "2"], [4, "4"]], titre: "tri : dispersion des tailles (φ) : en haut, mal trié" },
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
        texte: "Lorsqu'elle fond, la glace libère en vrac tout ce qu'elle a arraché, de l'argile aux blocs de plusieurs mètres : c'est la moraine, dépôt au tri le plus médiocre, comme l'amphithéâtre morainique du Rhône." },
      { id: "tillite", chemin: "glace", at: 30, dp: [0, -18], variante: true, court: "tillite", lab: [7, 3, "start"],
        texte: "Enfouie puis consolidée en roche, la même moraine devient une tillite. Celle du Ghaub, en Namibie, date de 635 millions d'années ; elle affleure au niveau de la mer de l'époque, près de l'équateur, ce qui atteste une glaciation presque planétaire." },
      { id: "eboulis", chemin: "pente", at: 0.05, court: "éboulis", lab: [0, 14, "middle"],
        texte: "Souvent détachés d'une falaise par le gel, des blocs roulent sur quelques dizaines de mètres avant de se stabiliser sur un talus d'environ 35° : cela forme un éboulis, anguleux et mal trié. Les grèzes de Charente, plus fines, présentent un litage." },
      { id: "breche_sedimentaire", chemin: "pente", at: 0.05, dp: [0, -20], variante: true, court: "brèche", lab: [0, -9, "middle"],
        texte: "Le même éboulis, cimenté par de la calcite, constitue une brèche sédimentaire. Il lui faut au moins la moitié d'éléments anguleux dépassant 2 mm, ainsi qu'un ciment ; sinon, on reste dans l'éboulis. Exemple : la brèche du Tholonet, au pied de la Sainte-Victoire." },
      { id: "colluvions", chemin: "versant", at: 0.5, court: "colluvions", lab: [0, -9, "middle"],
        texte: "Sur un versant cultivé, la pluie décape la terre et l'entraîne vers le bas sur quelques centaines de mètres. Limons, sables et cailloux se mélangent alors et s'entassent au pied de la pente : ce sont les colluvions." },
      { id: "dunes", chemin: "sable", at: 10, court: "dunes", lab: [0, 14, "middle"],
        texte: "Le vent ne mobilise que les sables fins à moyens, de 0,1 à 0,5 mm, qu'il fait bondir au ras du sol ; les grains plus gros restent en place, les plus fins s'envolent. Les dunes sont donc faites de sables très bien triés, comme la dune du Pilat." },
      { id: "loess", chemin: "poussiere", at: 500, court: "lœss", lab: [8, 3, "start"],
        texte: "Les poussières de 20 à 50 µm demeurent en suspension et voyagent des centaines de kilomètres avant de retomber : durant les glaciations, le vent les arrachait aux plaines d'épandage des glaciers. Homogènes, leurs dépôts constituent le lœss d'Alsace et du Nord." },
    ],
    sources: `Tri des grains : Folk R. L. et Ward W. C. (1957), <i>Journal of Sedimentary Petrology</i> 27, 3 ; Boggs S. (2011), <i>Principles of Sedimentology and Stratigraphy</i>, 5ᵉ éd., Pearson. Lœss : Pye K. (1995), <i>Quaternary Science Reviews</i> 14, 653.`,
  };

  // ═══════════════════════ 8. Une chaîne de montagnes se forme ═══════════════════════
  PHS.chaine = {
    scene: "diagramme",
    titre: "Une chaîne de montagnes se forme : plusieurs roches possibles",
    intro: "Devant une chaîne en formation, la plaque qui plonge sous elle fléchit sous le poids et creuse un bassin, bientôt alimenté par les débris de la chaîne. Au début, la chaîne demeure basse et le bassin profond : les débris y parviennent sous forme d'avalanches sous-marines. Puis la chaîne émerge et s'érode rapidement : ses débris comblent le bassin jusqu'à le ramener à l'air libre.",
    mesure: "Profondeur du bassin situé devant les Alpes au fil de la collision : schéma d'après l'histoire du bassin d'avant-pays alpin (Sinclair 1997 ; Allen et al. 1991) ; les chiffres sont des ordres de grandeur.",
    legende: `<span class="pq-sym">●</span> roche déposée à ce moment · en tirets : même roche, née devant une autre chaîne.`,
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
        texte: "Variante : le sable de ces avalanches sous-marines, mal trié et chargé de fragments rocheux, se transforme en grauwacke. Les grauwackes du Massif armoricain ont vu le jour de cette façon, devant la chaîne hercynienne, 300 millions d'années auparavant." },
      { id: "flysch", chemin: "alpes", at: 50, court: "flysch", lab: [0, 14, "middle"],
        texte: "Tant que la chaîne naissante reste pour l'essentiel sous les flots, le bassin atteint plusieurs kilomètres de profondeur : les débris y dévalent sous forme de courants de turbidité et s'empilent en bancs alternés de grès et d'argile, le flysch (Crétacé supérieur à Éocène)." },
      { id: "molasse", chemin: "alpes", at: 25, court: "molasse", lab: [0, -9, "middle"],
        texte: "Lorsque la chaîne émerge et s'élève, son érosion s'accélère et comble le bassin : les débris s'accumulent en mer peu profonde, dans les lacs et les rivières. Il s'agit de la molasse de l'avant-pays alpin (34 à 5 millions d'années)." },
      { id: "conglomerat", chemin: "alpes", at: 5, court: "conglomérat", lab: [0, -9, "middle"], ailleurs: true,
        texte: "En fin d'histoire, des torrents étalent des galets à peine triés au pied de la chaîne : c'est le poudingue de Valensole, daté de 8 à 1,8 million d'années." },
    ],
    sources: `Bassin d'avant-pays alpin : Sinclair H. D. (1997), <i>Geological Society of America Bulletin</i> 109, 324 ; Allen P. A., Crampton S. L. et Sinclair H. D. (1991), <i>Basin Research</i> 3, 143.`,
  };

  // ═══════════════════════ 9. La mer dépose selon la profondeur et les apports ═══════════════════════
  PHS.mer = {
    scene: "diagramme",
    titre: "La mer dépose selon la profondeur : plusieurs roches possibles",
    intro: "En mer, le calcaire provient surtout d'organismes : coquilles près des côtes, plancton au large. Ce qui varie d'un lieu à l'autre, c'est ce qui vient s'y mêler, sable et argile apportés par les fleuves, et, à grande profondeur, la dissolution : au-delà de 4,5 à 5,5 km, une eau froide et sous forte pression dissout la calcite avant qu'elle n'atteigne le fond.",
    mesure: "Pour chaque profondeur d'eau, la part de carbonate dans le sédiment : valeurs courantes des plates-formes et des bassins (Flügel 2010). La calcite disparaît entièrement vers 4,5 à 5,5 km dans l'océan actuel (Broecker et Peng 1982).",
    legende: `<span class="pq-sym">●</span> roche déposée à cet emplacement · deux trajets : à l'écart de tout apport, ou près d'un littoral qui livre sable et argile.`,
    axes: {
      x: { min: 3, max: 6000, type: "log", ticks: [[3, "3"], [10, "10"], [100, "100"], [1000, "1 000"], [6000, "6 000 m"]], titre: "profondeur d'eau (m, échelle logarithmique)" },
      y: { min: 0, max: 100, ticks: [0, 25, 50, 75, 100], titre: "carbonate dans le sédiment (%)" },
    },
    v: { de: 3, a: 6000, log: true },
    duree: 10,
    fond: (g) => {
      let s = g.rect(3, 200, 0, 100, "rgba(240, 214, 120, 0.16)") + lab(g, 4, 5, "zone éclairée (0 à 200 m)");
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
        texte: "Sur une plate-forme chaude et peu profonde, loin des fleuves, les organismes calcaires (coquilles, coraux, algues) fournissent l'essentiel du sédiment, à plus de 90 % de carbonate. Ce matériau, une fois cimenté, prend la forme d'un calcaire comparable à ceux du Bathonien du Bassin parisien." },
      { id: "craie", chemin: "large", at: 250, court: "craie", lab: [0, 14, "middle"],
        texte: "Au large, sous 100 à 600 m d'eau, les coccolithes, plancton calcaire de quelques millièmes de millimètre, forment l'essentiel des dépôts. Il en résulte une boue presque pure, comptant plus de 95 % de carbonate, qui donne la craie (Étretat)." },
      { id: "falun", chemin: "cote", at: 20, court: "falun", lab: [0, -9, "middle"],
        texte: "Au voisinage d'un littoral, dans une mer large de quelques mètres à quelques dizaines de mètres, des fragments de coquilles se mêlent au sable pour former un falun, typique de la mer des faluns de Touraine (Miocène)." },
      { id: "tuffeau", chemin: "cote", at: 80, court: "tuffeau", lab: [0, 14, "middle"],
        texte: "Un peu plus profond, du plancton calcaire se mélange à du sable fin et à des paillettes de mica venues du continent : cela donne un tuffeau de Touraine, craie tendre et sableuse." },
      { id: "marne", chemin: "cote", at: 300, court: "marne", lab: [0, 14, "middle"],
        texte: "Là où l'argile charriée par les fleuves se dépose simultanément au plancton calcaire, le sédiment renferme entre 35 et 65 % de carbonate : c'est une marne, comme les Terres Noires de Digne." },
      { id: "radiolarite", chemin: "large", at: 5200, court: "radiolarite", lab: [-7, 3, "end"], ailleurs: true,
        texte: "Au-delà de 4,5 à 5,5 km, la calcite se dissout avant d'atteindre le fond : il ne subsiste que des squelettes siliceux de radiolaires. Leur accumulation fournit une radiolarite (voir « La silice se dépose et vieillit »)." },
    ],
    sources: `Faciès carbonatés : Flügel E. (2010), <i>Microfacies of Carbonate Rocks</i>, 2ᵉ éd., Springer. Dissolution de la calcite en profondeur : Broecker W. S. et Peng T.-H. (1982), <i>Tracers in the Sea</i>, Lamont-Doherty.`,
  };

  // ═══════════════════════ 10. L'eau de mer s'évapore ═══════════════════════
  const salinite = [[1, 35], [3.8, 133], [10.6, 371], [30, 385], [65, 398], [100, 405]];
  PHS.evaporation = {
    scene: "diagramme",
    titre: "L'eau de mer s'évapore : plusieurs roches possibles",
    intro: "Dans une lagune ou un bassin presque clos, l'eau de mer s'évapore plus vite qu'elle n'est renouvelée, et les sels s'enrichissent. Chacun cristallise dès que sa concentration excède la capacité de l'eau, toujours dans le même ordre : carbonates d'abord, puis gypse, puis sel et, en toute fin, sels de potassium.",
    mesure: "Sels dissous dans l'eau de mer qui s'évapore : le gypse cristallise quand l'eau est 3,8 fois plus concentrée, le sel à 10,6 fois, les sels de potassium vers 65 fois (McCaffrey et al. 1987 ; Warren 2016). Au-delà du sel, la saumure reste presque aussi chargée : ce qui s'ajoute cristallise.",
    legende: `<span class="pq-sym">●</span> ce qui cristallise à cette étape · en tirets : variante, expliquée dans le texte de la roche.`,
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
        texte: "Lorsque près des trois quarts de l'eau se sont évaporés (× 3,8), le sulfate de calcium excède la capacité de l'eau et le gypse cristallise. Celui de Montmartre s'est formé ainsi dans une lagune, il y a 37 à 34 millions d'années." },
      { id: "dolomie", chemin: "lagune", at: 6, court: "dolomie", lab: [0, -10, "middle"],
        texte: "En extrayant du calcium, le gypse laisse une saumure où le magnésium l'emporte sur le calcium (rapport 10 vers × 6). Infiltrée dans la boue calcitique voisine, elle la convertit en dolomie. Nombre de dolomies, comme celles des Causses, se sont formées bien plus tard, en profondeur, au contact d'eaux riches en magnésium." },
      { id: "anhydrite", chemin: "lagune", at: 4.6, dp: [0, 22], variante: true, court: "anhydrite", lab: [7, 12, "start"],
        texte: "Ce même sel, désormais sans eau, cristallise en anhydrite à la place du gypse. Le phénomène se produit au-dessus d'environ 58 °C en eau pure, dès 18 °C en saumure saturée (Hardie 1967), ou lorsque le gypse enfoui perd son eau. L'anhydrite du Trias de Lorraine accompagne le sel." },
      { id: "sel", chemin: "lagune", at: 10.6, court: "sel gemme", lab: [0, -10, "middle"],
        texte: "Lorsque 90 % de l'eau s'est évaporée (× 10,6), le chlorure de sodium cristallise ; c'est de loin la phase la plus abondante, à raison d'environ 28 g par kilogramme d'eau de mer. Le sel du Keuper de Lorraine s'est déposé de cette manière il y a environ 220 millions d'années." },
      { id: "sylvinite", chemin: "lagune", at: 65, court: "sylvinite", lab: [0, -10, "middle"],
        texte: "La cristallisation des sels de potassium exige l'évaporation d'environ 98,5 % de l'eau (× 65), ce qui suppose un bassin presque asséché, situation rare dans l'histoire géologique. Les sels d'Alsace se sont déposés à l'Oligocène, dans le fossé rhénan." },
      { id: "cargneule", chemin: "lagune", at: 1, p: [1.25, 70], variante: true, sansTrait: true, court: "cargneule", lab: [7, 3, "start"],
        texte: "Dans le cas inverse, une eau douce ne peut dissoudre que 2,4 g de gypse par litre, mais elle se renouvelle sans cesse. Dans une couche de gypse et de dolomie broyée entre deux nappes alpines, cette eau entraîne le gypse et laisse une roche criblée de cavités, la cargneule." },
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
    intro: "Les diatomées, les radiolaires et les éponges édifient leur squelette en opale, silice mal cristallisée. Lorsqu'elle est enfouie, cette silice évolue lentement : opale A, puis opale CT, puis quartz. La chaleur accélère la transformation, de même que la durée d'enfouissement : une silice ancienne atteint le quartz à une température plus basse qu'une silice récente.",
    mesure: "Limites indicatives entre opale A, opale CT et quartz, d'après Kastner 1981 et les forages océaniques ODP 127 et 128 : passage de l'opale A à l'opale CT vers 40 °C, puis de l'opale CT au quartz vers 45 à 55 °C. Ces limites s'abaissent à mesure que le dépôt vieillit. Les trajets d'enfouissement sont schématiques.",
    legende: `<span class="pq-sym">●</span> silice actuelle de la roche · en pointillé : silice précipitée par une autre voie.`,
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
        texte: "Déposée près de la surface sans jamais être chauffée, la boue de diatomées a conservé une opale inchangée : la roche obtenue reste légère, poreuse et tendre. Elle constitue les diatomites des anciens lacs volcaniques du Velay et du Cantal." },
      { id: "gaize", chemin: "gaize", at: 60, court: "gaize", lab: [0, -9, "middle"],
        texte: "Enfouie à faible profondeur, une boue chargée de spicules d'éponges a vu une partie de son opale se muer en opale CT et en quartz. Ces phases liantes forment la gaize de l'Argonne (Albien), roche légère et poreuse." },
      { id: "silex", chemin: "silex", at: 55, court: "silex", lab: [-7, 3, "end"],
        texte: "Peu après le dépôt, la silice issue des éponges se dissout dans la craie puis se regroupe en rognons, d'abord sous forme d'opale CT. Un enfouissement modéré suffit ensuite à la faire évoluer vers un quartz microcristallin : c'est le silex." },
      { id: "radiolarite", chemin: "radiolarite", at: 100, court: "radiolarite", lab: [0, -9, "middle"],
        texte: "Une boue de radiolaires, déposée au fond de l'océan alpin sous la profondeur où la calcite se dissout, puis enfouie sous les nappes, a vu la totalité de son opale transformée en quartz. Il en résulte un jaspe très dur, coloré en rouge par le fer." },
      { id: "meuliere", chemin: "diatomite", at: 1, p: [25, 12], variante: true, sansTrait: true, court: "meulière", lab: [0, 14, "middle"],
        texte: "Autre voie : dans les sols et les lacs continentaux, une eau pauvre en silice peut la précipiter directement sous forme de quartz et de calcédoine, sans passer par l'opale biologique. La meulière de Brie s'est ainsi silicifiée à l'Oligo-Miocène." },
    ],
    sources: `Kastner M. (1981), « Authigenic silicates in deep-sea sediments », dans <i>The Sea</i>, vol. 7, Wiley ; transformations de la silice des forages ODP 127/128 (mer du Japon), <i>Proceedings of the Ocean Drilling Program</i>.`,
  };

  // ═══════════════════════ 12. Le calcaire se dissout et se redépose ═══════════════════════
  // calcium à l'équilibre avec la calcite à 10 °C (mg/L) selon log pCO₂ : même calcul que « Conditions de formation »
  const CA10 = [[-3.5, 24.9], [-3.4, 26.9], [-3, 37.0], [-2.5, 55.4], [-2, 83.5], [-1.5, 126.7], [-1, 193.3], [-0.5, 297.0]];
  PHS.karst = {
    scene: "diagramme",
    titre: "Le calcaire se dissout et se redépose : plusieurs roches possibles",
    intro: "En traversant le sol, où l'air contient 10 à 100 fois plus de CO₂ que l'atmosphère, l'eau de pluie se charge de ce gaz et acquiert la capacité de dissoudre le calcaire. Le devenir des constituants dépend ensuite de deux facteurs : les insolubles demeurent sur place, tandis que le calcium dissous se redépose dès que l'eau perd son CO₂ ou s'évapore.",
    mesure: "À 10 °C, quantité de calcium qu'une eau en équilibre avec la calcite peut maintenir en solution, selon la pression de CO₂ de l'air en contact (calcul de l'atlas d'après Plummer et Busenberg 1982, de même que dans « Conditions de formation »).",
    legende: `<span class="pq-sym">▲</span> précipite depuis l'eau · <span class="pq-sym">■</span> subsiste sur place, sans dissolution · trait pointillé : voie différente, détaillée dans le texte.`,
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
        texte: "Chargée en CO₂ du sol, l'eau dissout le calcaire jusqu'à saturation. Les constituants insolubles subsistent : 100 m de calcaire renfermant 1 % d'argile ne laissent qu'environ 1 m de résidu, rougi par les oxydes de fer. Ce résidu constitue la terra rossa des Causses." },
      { id: "argile_silex", chemin: "eau", at: 0.5, dp: [11, 16], forme: "carre", court: "argile à silex", lab: [7, 4, "start"],
        texte: "Appliquée à la craie, cette dissolution ne laisse que l'argile et les silex, deux éléments insolubles qui se concentrent sur les plateaux du Pays de Caux." },
      { id: "phosphorite", chemin: "eau", at: 0.5, dp: [11, 32], forme: "carre", variante: true, court: "phosphorite", lab: [7, 4, "start"],
        texte: "Variante : les poches façonnées par la dissolution font office de pièges. Dans celles du Quercy, le phosphate libéré par le guano et les ossements a précipité, entre 42 et 27 millions d'années, sous forme de phosphate de calcium." },
      { id: "travertin", chemin: "eau", at: 1, forme: "tri", court: "travertin", lab: [7, 3, "start"],
        texte: "Au point d'émergence, l'eau dégaze son CO₂ au contact de l'air et ne peut plus retenir autant de calcium : la calcite se dépose alors sur les mousses et les cascades. Le produit s'appelle travertin, ou tuf calcaire." },
      { id: "calcrete", chemin: "eau", at: 0.5, p: [0.6, 190], forme: "tri", variante: true, sansTrait: true, court: "calcrète", lab: [7, 3, "start"],
        texte: "Sous un climat sec, l'eau du sol s'évapore avant de migrer loin : le calcium dissous se concentre au-delà de la quantité que l'eau peut retenir, et la calcite précipite dans le sol, d'abord en nodules, puis en croûte. Ce processus requiert des précipitations inférieures à 760 mm par an environ (Royer 1999)." },
    ],
    sources: `Équilibre de la calcite : Plummer L. N. et Busenberg E. (1982), <i>Geochimica et Cosmochimica Acta</i> 46, 1011 (calcul de l'atlas). Calcrètes et pluviométrie : Royer D. L. (1999), <i>Geology</i> 27, 1123.`,
  };

  // ═══════════════════════ 13. La matière organique s'enfouit ═══════════════════════
  PHS.charbon = {
    scene: "diagramme",
    titre: "La matière organique s'enfouit : plusieurs roches possibles",
    intro: "Des végétaux accumulés dans un marécage, à l'abri de l'oxygène, ne se décomposent pas entièrement et forment de la tourbe. Enfouie sous d'autres couches, celle-ci s'échauffe : elle perd d'abord son eau, puis ses gaz, et s'enrichit en carbone. Le charbon obtenu dépend de la température maximale qu'il a subie.",
    mesure: "Teneur en carbone de la matière sèche sans cendres, en fonction de la température maximale subie. Les seuils des rangs reposent sur la réflectance de la vitrinite (Burnham et Sweeney 1989, compilés par le Kentucky Geological Survey) ; fenêtre à pétrole : ≈ 60 à 120 °C.",
    legende: `<span class="pq-sym">●</span> rang atteint par le charbon · pointillé : matière organique diffuse dans une vase, qui ne forme pas un charbon.`,
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
        texte: "Point de départ : la tourbe d'un marécage, faite de mousses et de plantes gorgées d'eau à peine transformées, qui contient environ 55 % de carbone. Ce sont les tourbières du Jura et des monts d'Arrée." },
      { id: "lignite", chemin: "charbon", at: 40, court: "lignite", lab: [0, -9, "middle"],
        texte: "Enfouie à quelques centaines de mètres, sous une température voisine de 50 °C, la tourbe perd son eau et se tasse. Elle devient un charbon brun où le bois est encore reconnaissable, contenant 60 à 70 % de carbone : c'est le lignite de Gardanne." },
      { id: "houille", chemin: "charbon", at: 120, court: "houille", lab: [0, -9, "middle"],
        texte: "Entre 80 et 150 °C, soit 2 à 5 km d'enfouissement, le charbon dégage ses gaz, noircit et prend un éclat vif, avec 80 à 90 % de carbone. Il s'agit de la houille du Nord et de la Lorraine, issue des forêts du Carbonifère." },
      { id: "anthracite", chemin: "charbon", at: 220, court: "anthracite", lab: [0, -9, "middle"],
        texte: "Passé 170 à 200 °C, le carbone atteint plus de 91 % et le matériau devient anthracite : dur, brillant, il brûle sans fumée, comme celui de La Mure." },
      { id: "schiste_bitumineux", chemin: "charbon", at: 50, p: [50, 55], variante: true, sansTrait: true, court: "schiste bitumineux", lab: [7, 3, "start"],
        texte: "Variante : la matière d'origine algaire, diffuse dans une vase marine, n'est pas un amas de végétaux. Tant que la fenêtre à pétrole n'est pas atteinte, elle reste piégée dans la roche, qui prend le nom de schiste bitumineux, à l'image des « schistes carton » du Toarcien. Portée vers 60 à 120 °C, elle engendrerait du pétrole." },
    ],
    sources: `Rangs des charbons et fenêtre à pétrole : Burnham A. K. et Sweeney J. J. (1989), <i>Geochimica et Cosmochimica Acta</i> 53, 2649 ; tableaux de rangs du Kentucky Geological Survey.`,
  };

  // ═══════════════════════ 14. L'altération laisse ce qui ne se dissout pas ═══════════════════════
  PHS.alteration = {
    scene: "diagramme",
    titre: "L'altération laisse sur place ce qui ne se dissout pas",
    intro: "Légèrement acide, l'eau de pluie attaque progressivement les minéraux. Les éléments les plus solubles sont évacués les premiers, suivis de la silice ; le fer et l'aluminium, à peine solubles, demeurent. Plus l'altération se prolonge sous un climat chaud et humide, plus ces résidus s'imposent.",
    mesure: "Fraction de la silice de la roche évacuée par l'eau selon la durée de l'altération en climat tropical humide ; ordres de grandeur (Nahon 1991 ; Tardy 1993). Sous climat tempéré, l'altération progresse bien plus lentement et se limite le plus souvent à l'arène.",
    legende: `<span class="pq-sym">■</span> ce qui reste sur place.`,
    axes: {
      x: { min: 1000, max: 2e7, type: "log", ticks: [[1000, "1 000 ans"], [1e5, "100 000 ans"], [1e7, "10 Ma"]], titre: "durée de l'altération (échelle logarithmique)" },
      y: { min: 0, max: 100, ticks: [0, 25, 50, 75, 100], titre: "silice de la roche emportée par l'eau (%)" },
    },
    v: { de: 1000, a: 2e7, log: true },
    duree: 10,
    fond: (g) => {
      let s = g.rect(1000, 2e7, 85, 100, "rgba(190, 120, 60, 0.14)") + lab(g, 1200, 94, "seuls le fer et l'aluminium subsistent presque entièrement");
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
        texte: "Au bout de quelques dizaines à centaines de milliers d'années, une part des feldspaths et des micas est dissoute par l'eau. La roche garde son volume mais se désagrège et se charge en kaolinite ; le quartz, lui, traverse le processus sans dommage. Il en résulte les arènes et les altérites du Limousin et de la Bretagne." },
      { id: "laterite", chemin: "tropical", at: 1e6, forme: "carre", court: "cuirasse latéritique", lab: [-7, 3, "end"],
        texte: "Sous climat chaud et très humide, pendant des millions d'années, la quasi-totalité de la silice est évacuée : il ne subsiste alors que des oxydes de fer et d'aluminium, qui durcissent en cuirasse lorsque la nappe phréatique s'abaisse. Celles du Périgord se sont formées au Paléogène." },
      { id: "bauxite", chemin: "tropical", at: 1e7, forme: "carre", court: "bauxite", lab: [-7, 3, "end"],
        texte: "À l'issue du processus, le fer est également entraîné vers le bas : seul l'aluminium subsiste, sous forme de gibbsite et de boehmite. Les bauxites de Provence se sont formées de cette façon au Crétacé, sur des reliefs calcaires bien drainés." },
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
    intro: "Lors d'une collision, des sédiments argileux sont entraînés en profondeur. La température y augmente d'environ 25 à 30 °C par kilomètre : les argiles se transforment en micas, dont les cristaux grossissent à mesure que la roche s'échauffe. La roche obtenue dépend de la profondeur et de la température maximales atteintes avant son retour en surface.",
    mesure: "Domaines de pression et de température des faciès métamorphiques (limites indicatives, comme dans « Conditions de formation »). Chemin schématique d'une collision, dont le gradient atteint 25 à 30 °C par km.",
    legende: `<span class="pq-sym">●</span> roche obtenue si le chemin s'arrête à ce point · en pointillé : même chemin, roche de départ différente.`,
    axes: {
      x: { min: 0, max: 900, ticks: [0, 200, 400, 600, [800, "800 °C"]], titre: "température (°C)" },
      y: { min: 0, max: 1.4, ticks: [[0, "0"], [0.4, "0,4"], [0.8, "0,8"], [1.2, "1,2"]], titre: "pression (GPa) : 1 GPa ≈ 36 km" },
    },
    v: { de: 200, a: 735 },
    duree: 10,
    fond: fondFacies(["éclogites"]),
    chemins: { barrovien: { pts: [[200, 0.12, 200], [300, 0.28, 300], [400, 0.45, 400], [500, 0.6, 500], [600, 0.72, 600], [700, 0.8, 700], [735, 0.82, 735]] } },
    lire: (v, d) => d ? [`${nb(Math.round(v / 5) * 5)} °C`, `≈ ${nb(kmDeGPa(d[1]))} km`] : "",
    lecturePos: [66, 42, "start"],
    roches: [
      { id: "ardoise", chemin: "barrovien", at: 320, court: "ardoise", lab: [-7, 3, "end"],
        texte: "Vers 250 à 350 °C, à une dizaine de kilomètres de profondeur, les argiles se transforment en paillettes de micas minuscules, toutes disposées dans un même plan : la roche se débite alors en feuillets fins. Il s'agit de l'ardoise d'Angers." },
      { id: "micaschiste", chemin: "barrovien", at: 540, court: "micaschiste", lab: [-7, 3, "end"],
        texte: "Vers 500 à 600 °C et à 20 à 25 km de profondeur, les micas grossissent jusqu'à être visibles à l'œil nu et des grenats se développent : il se forme un micaschiste, comme dans les Cévennes." },
      { id: "gneiss", chemin: "barrovien", at: 660, court: "gneiss", lab: [-7, 3, "end"],
        texte: "Au-delà de 600 à 650 °C, les micas laissent place aux feldspaths et la roche se différencie en lits clairs (quartz, feldspaths) et en lits sombres (biotite) : il s'agit d'un gneiss." },
      { id: "leptynite", chemin: "barrovien", at: 660, dp: [0, 16], variante: true, court: "leptynite", lab: [7, 4, "start"],
        texte: "Pour une chaleur équivalente, mais à partir d'une roche de départ acide, lave ou sable pauvre en argile, on obtient un gneiss clair, à grain fin et presque dépourvu de micas : la leptynite (Limousin, Vendée)." },
      { id: "migmatite", chemin: "barrovien", at: 735, court: "migmatite", lab: [0, -9, "middle"], ailleurs: true,
        texte: "À une température plus élevée, vers 700 °C en présence d'eau, la roche commence à fondre : il se forme une migmatite (voir « La croûte fond »)." },
    ],
    sources: `Faciès métamorphiques : limites d'après Bucher K. et Grapes R. (2011), <i>Petrogenesis of Metamorphic Rocks</i>, 8ᵉ éd., Springer (tracé indicatif de l'atlas).`,
  };

  // ═══════════════════════ 16. Un basalte entraîné en profondeur : collision ou subduction ═══════════════════════
  PHS.basalteProfond = {
    scene: "diagramme",
    titre: "Un basalte entraîné en profondeur : plusieurs roches possibles",
    intro: "Un basalte de plancher océanique peut être entraîné en profondeur de deux façons. Lors d'une collision, il s'échauffe à peu près comme la croûte qui l'entoure. Lors d'une subduction, la plaque plonge si rapidement qu'elle demeure froide : la roche subit de fortes pressions à basse température et cristallise d'autres minéraux.",
    mesure: "Limites indicatives des faciès (comme dans « Conditions de formation »). Les trajets sont schématiques : la collision suit un gradient d'environ 25 °C par km, la subduction d'environ 8 à 10 °C par km.",
    legende: `<span class="pq-sym">●</span> roche obtenue si le chemin s'arrête à ce point.`,
    axes: {
      x: { min: 0, max: 900, ticks: [0, 200, 400, 600, [800, "800 °C"]], titre: "température (°C)" },
      y: { min: 0, max: 2.4, ticks: [[0, "0"], [0.5, "0,5"], [1, "1"], [1.5, "1,5"], [2, "2"]], titre: "pression (GPa) : 1 GPa ≈ 36 km" },
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
        texte: "Chauffé vers 300 à 500 °C lors d'une collision, un basalte voit croître des minéraux verts (chlorite, épidote, actinote) : la roche devient un schiste vert, à l'image des prasinites des Alpes internes." },
      { id: "amphibolite", chemin: "collision", at: 1, court: "amphibolite", lab: [7, 3, "start"],
        texte: "Vers 500 à 700 °C, la hornblende et le plagioclase prennent la place de ces minéraux verts ; la roche qui en résulte est une amphibolite, comme dans le Limousin." },
      { id: "schiste_bleu", chemin: "subduction", at: 0.5, court: "schiste bleu", lab: [7, 3, "start"],
        texte: "Lors d'une subduction, la plaque demeure froide, avec un gradient de 8 à 10 °C par km. Vers 30 à 40 km de profondeur et moins de 450 °C, le basalte cristallise du glaucophane, amphibole bleue : il en résulte un schiste bleu, comme à l'île de Groix." },
      { id: "eclogite", chemin: "subduction", at: 1, court: "éclogite", lab: [-7, 3, "end"],
        texte: "Au-delà de 1,2 à 1,5 GPa (45 à 60 km), le plagioclase cède la place à un duo de grenat rouge et d'omphacite, pyroxène vert. Plus dense que le manteau, cette éclogite facilite l'enfoncement de la plaque." },
    ],
    sources: `Faciès métamorphiques : Bucher K. et Grapes R. (2011), <i>Petrogenesis of Metamorphic Rocks</i>, 8ᵉ éd., Springer (tracé indicatif de l'atlas).`,
  };

  // ═══════════════════════ 17. Même chaleur, autre roche de départ (triangle) ═══════════════════════
  // triangle quartz (bas gauche) – argile (haut) – carbonate (bas droite) ; (q, a, c) → x = c + a/2, y = a
  const tri = (q, a, c) => [c + a / 2, a];
  PHS.depart = {
    scene: "diagramme",
    titre: "Même chaleur, autre roche de départ : plusieurs roches possibles",
    intro: "Portées à une même température, des roches différentes donnent des roches métamorphiques différentes, car le métamorphisme réorganise les atomes présents sans en apporter de nouveaux. La roche obtenue dépend donc avant tout de la composition de départ, notamment des proportions de quartz, d'argile et de calcaire.",
    mesure: "Diagramme triangulaire : proportions de quartz, d'argile et de carbonate des roches de départ (positions schématiques). Elles sont toutes amenées à une température commune, comprise entre 450 et 550 °C.",
    legende: `<span class="pq-sym">●</span> roche métamorphique issue de la roche de départ figurée en gris.`,
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
        texte: "Pour un sable quasi pur en quartz, aucun minéral nouveau n'est à former. Ses grains se soudent et recristallisent en une mosaïque compacte et très résistante : on parle de quartzite, comme au Roc'h Ruz dans les monts d'Arrée." },
      { id: "micaschiste", chemin: "depart", at: 0.4, court: "micaschiste", lab: [-8, 3, "end"], ailleurs: true,
        texte: "Lorsque les minéraux d'une argile se recomposent en micas et en grenats, la roche devient un micaschiste (voir « Une roche enfouie dans une collision chauffe »)." },
      { id: "calcschiste", chemin: "depart", at: 0.68, court: "calcschiste", lab: [8, 3, "start"],
        texte: "Une marne, mélange de calcaire et d'argile, voit sa calcite recristalliser et son argile donner des micas, en lits alternés : il s'agit d'un calcschiste, comme les schistes lustrés du Queyras." },
      { id: "marbre", chemin: "depart", at: 1, court: "marbre", lab: [0, -9, "middle"],
        texte: "Un calcaire pur voit sa calcite recristalliser en grains plus gros, et les fossiles disparaissent : il s'agit d'un marbre, comme celui de Saint-Béat." },
    ],
    sources: `Roches métamorphiques selon la roche de départ : Bucher K. et Grapes R. (2011), <i>Petrogenesis of Metamorphic Rocks</i>, 8ᵉ éd., Springer.`,
  };

  // ═══════════════════════ 18. Au contact d'un magma et de ses fluides ═══════════════════════
  const tContact = (x) => x <= 0 ? 560 + Math.min(1, -x / 300) * 140 : 150 + 410 * Math.exp(-x / 700);
  PHS.contact = {
    scene: "diagramme",
    titre: "Au contact d'un magma et de ses fluides : plusieurs roches possibles",
    intro: "Un magma mis en place dans la croûte chauffe les roches voisines sans les comprimer et, en se refroidissant, libère des fluides chauds chargés d'éléments dissous. Au contact, la chaleur recristallise la roche ; là où ces fluides circulent, ils modifient sa composition. Le résultat dépend de la distance au contact, de la nature de la roche traversée et de celle des fluides.",
    mesure: "Profil schématique des températures maximales autour d'un granite mis en place vers 6 km de profondeur (les roches atteignent ≈ 150 °C). Selon la taille du pluton, l'auréole mesure de quelques centaines de mètres à 2 km de large.",
    legende: `<span class="pq-sym">●</span> modifiée par la chaleur · <span class="pq-sym">◆</span> modifiée par les fluides · pointillé : autre magma.`,
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
        texte: "Sous le toit du granite, les derniers fluides, riches en fluor et en bore, altèrent le granite déjà cristallisé entre 300 et 500 °C : ses feldspaths se transforment en micas blancs et en quartz, parfois accompagnés d'étain. Il s'agit du greisen de Montebras." },
      { id: "skarn", chemin: "profil", at: 25, forme: "losange", court: "skarn", lab: [7, -4, "start"],
        texte: "Sur le contact lui-même, si l'encaissant est calcaire, les fluides venus du granite amènent silice, fer et métaux. Il en naît des silicates calciques, grenat et pyroxène, parfois associés à du tungstène comme à Salau : c'est un skarn." },
      { id: "corneenne", chemin: "profil", at: 350, court: "cornéenne", lab: [7, -4, "start"],
        texte: "À moins de quelques centaines de mètres du granite, une argile ou un schiste porté entre 400 et 550 °C, sans être comprimé, se recristallise en une roche dure, sans feuillets, parfois tachetée d'andalousite ou de cordiérite : une cornéenne, telles que celles du Sidobre." },
      { id: "fenite", chemin: "profil", at: 60, p: [300, 640], forme: "losange", variante: true, sansTrait: true, court: "fénite", lab: [7, 3, "start"],
        texte: "Variante : près d'une carbonatite ou d'un magma très alcalin, des fluides chargés de sodium et de potassium convertissent la roche voisine en un assemblage de feldspaths alcalins et de pyroxène sodique : la fénite (Fen, Norvège)." },
    ],
    sources: `Auréoles de contact : Kerrick D. M., dir. (1991), <i>Contact Metamorphism</i>, Reviews in Mineralogy 26, Mineralogical Society of America.`,
  };

  // ═══════════════════════ 19. L'eau de mer transforme le plancher océanique ═══════════════════════
  PHS.plancher = {
    scene: "diagramme",
    titre: "L'eau de mer transforme le plancher océanique : plusieurs roches possibles",
    intro: "Sous une dorsale, l'eau de mer s'infiltre dans les fissures du plancher océanique, descend jusqu'à 2 ou 3 km, se réchauffe au contact des roches chaudes, puis remonte et ressort sous forme de fumeurs noirs. Au cours de ce trajet, elle échange des éléments avec les roches, qui se transforment selon leur nature initiale et la température de l'eau.",
    mesure: "Sous une dorsale, l'eau de mer descend, se réchauffe jusqu'à 350 à 400 °C vers 2 à 3 km, puis remonte par les fumeurs noirs (Alt 1995 ; Mével 2003). Le chemin est schématique.",
    legende: `<span class="pq-sym">●</span> roche modifiée par l'eau à ce point · pointillé : variante.`,
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
        texte: "En pénétrant dans les coussins de basalte, l'eau se réchauffe à 200 à 350 °C : elle échange du sodium contre du calcium, et le plagioclase se transforme en albite, accompagnée de chlorite et d'épidote. Cette roche est une spilite, comme au Chenaillet." },
      { id: "serpentinite", chemin: "eau", at: 0.45, court: "serpentinite", lab: [-7, 3, "end"],
        texte: "Là où le manteau affleure près du fond, à une dorsale lente, l'eau atteint la péridotite à une température inférieure à 400 °C environ : l'olivine s'hydrate en serpentine, et la roche gonfle de 30 à 40 % (Mével 2003). La roche obtenue est une serpentinite, comme dans le Queyras." },
      { id: "rodingite", chemin: "eau", at: 0.45, dp: [0, 18], variante: true, court: "rodingite", lab: [-7, 3, "end"],
        texte: "Un filon de gabbro encaissé dans cette péridotite en cours de serpentinisation reçoit le calcium libéré par celle-ci : ses feldspaths se transforment en grenat calcique et en pyroxène, entre 200 et 400 °C. La roche obtenue est une rodingite." },
    ],
    sources: `Alt J. C. (1995), « Subseafloor processes in mid-ocean ridge hydrothermal systems », <i>Geophysical Monograph</i> 91, American Geophysical Union ; Mével C. (2003), <i>Comptes Rendus Geoscience</i> 335, 825.`,
  };

  // ═══════════════════════ 20. Une faille ou un impact broie la roche ═══════════════════════
  PHS.faille = {
    scene: "diagramme",
    titre: "Une faille broie la roche : plusieurs roches possibles",
    intro: "Une grande faille broie la roche lorsque ses deux blocs glissent. Froide près de la surface, la roche se fragmente ; plus chaude en profondeur, elle flue comme une pâte. Ce qui se forme dépend donc de la profondeur où la faille a fonctionné et de la vitesse du glissement.",
    mesure: "Selon le modèle de Sibson (1977), la roche se broie de façon cassante près de la surface et se déforme de façon ductile en profondeur, à partir de ≈ 300 °C, température où le quartz devient plastique. Géotherme de 25 °C par km.",
    legende: `<span class="pq-sym">●</span> roche de faille · pointillé : broyage d'origine différente.`,
    axes: {
      x: { min: 0, max: 600, ticks: [0, 100, 200, 300, 400, 500, [600, "600 °C"]], titre: "température (°C)" },
      y: { min: 0, max: 24, inverse: true, ticks: [0, 5, 10, 15, 20], titre: "profondeur (km)" },
    },
    v: { de: 0, a: 23 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(0, 300, 0, 24, COUL.f) + g.rect(300, 600, 0, 24, COUL.b);
      s += lab(g, 150, 1.6, "cassant", { a: "middle" }) + lab(g, 450, 22.6, "ductile", { a: "middle" });
      s += g.tirets([[0, 12], [600, 12]], "#9c927f") + lab(g, 595, 12, "limite inférieure de la zone sismogène (≈ 12 km)", { a: "end", dy: -4 });
      s += g.tirets([[300, 0], [300, 24]], "#9c927f");
      return s;
    },
    chemins: { faille: { pts: [[10, 0, 0], [585, 23, 23]] } },
    lire: (v) => [`${nb(v, v < 10 ? 1 : 0)} km`, `≈ ${nb(Math.round((10 + 25 * v) / 5) * 5)} °C`],
    lecturePos: [66, 150, "start"],
    roches: [
      { id: "cataclasite", chemin: "faille", at: 3, court: "cataclasite", lab: [7, 3, "start"],
        texte: "Proche de la surface, la roche se fracture à chaque glissement en fragments anguleux, que des fluides recimentent ensuite. Cette cataclasite se rencontre, par exemple, le long des grandes failles du Massif central." },
      { id: "pseudotachylite", chemin: "faille", at: 10, court: "pseudotachylite", lab: [7, 3, "start"],
        texte: "Vers la base de la zone sismogène, un glissement de quelques mètres en une seconde dégage, par frottement, assez de chaleur pour fondre la roche sur quelques millimètres ; ce liquide se fige en verre noir : il s'agit d'une pseudotachylite, trace fossile d'un séisme (Sibson 1975)." },
      { id: "mylonite", chemin: "faille", at: 17, court: "mylonite", lab: [7, 3, "start"],
        texte: "Au-delà d'environ 300 °C, en profondeur, le quartz flue sans se briser : la roche s'étire en rubans très fins tout en gardant sa cohésion. C'est une mylonite, comme dans le cisaillement sud-armoricain." },
      { id: "impactite", chemin: "faille", at: 1, p: [520, 5], variante: true, sansTrait: true, court: "impactite", lab: [0, 14, "middle"],
        texte: "Un impact broie également la roche, mais en un seul coup et avec une intensité bien supérieure : 10 à 100 GPa pendant une fraction de seconde, bien au-delà du domaine représenté ici. Le quartz subit un choc et la roche peut fondre. Il s'agit de l'impactite de Rochechouart." },
    ],
    sources: `Sibson R. H. (1977), <i>Journal of the Geological Society</i> 133, 191 ; Sibson R. H. (1975), <i>Geophysical Journal of the Royal Astronomical Society</i> 43, 775.`,
  };

  // ═══════════════════════ 21. Le fer dissous précipite (Eh–pH) ═══════════════════════
  PHS.fer = {
    scene: "diagramme",
    titre: "Le fer dissous précipite : là où l'eau rencontre l'oxygène",
    intro: "Dans une eau dépourvue d'oxygène, le fer demeure dissous sous forme de Fe²⁺ et peut migrer sur de grandes distances. Dès qu'il rencontre de l'oxygène, il s'oxyde en Fe³⁺, presque insoluble, et précipite sous forme d'oxydes. Lorsque cette rencontre se produit à grande échelle, au fond d'une mer ou dans un sol, le fer s'accumule.",
    mesure: "Potentiel d'oxydoréduction tracé en fonction du pH pour le fer (activité 10⁻⁶) ; calcul réalisé pour la partie Oxydes de l'atlas à partir de ThermoChimie v12a.",
    legende: `<span class="pq-sym">●</span> là où le fer précipite.`,
    axes: {
      x: { min: 0, max: 14, ticks: [0, 2, 4, 6, 8, 10, 12, 14], titre: "pH (acide à gauche, basique à droite)" },
      y: { min: -0.8, max: 1.0, ticks: [[-0.8, "−0,8"], [-0.4, "−0,4"], [0, "0"], [0.4, "0,4"], [0.8, "0,8"]], titre: "potentiel d'oxydation Eh (V) : en haut, oxygéné" },
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
        texte: "Entre 3,8 et 1,8 milliard d'années, l'océan profond manquait d'oxygène mais regorgeait de fer dissous. Au contact des eaux enrichies en oxygène par les premières algues, ce fer s'est précipité en lits d'oxydes intercalés de silice : les fers rubanés (Hamersley). Plus récente, la minette lorraine résulte d'un autre processus, celui de grains ferrugineux accumulés dans une mer peu profonde." },
      { id: "laterite", chemin: "ocean", at: 1, p: [5, 0.6], variante: true, sansTrait: true, court: "latérite", lab: [7, 3, "start"], ailleurs: true,
        texte: "Dans un sol tropical bien aéré, le fer mis en liberté par l'altération se fixe sur place en oxydes et forme peu à peu une cuirasse (voir « L'altération laisse sur place ce qui ne se dissout pas »)." },
    ],
    sources: `Diagramme du fer : partie Oxydes de l'atlas (ThermoChimie v12a, PHREEQC). Fers rubanés : Klein C. (2005), <i>American Mineralogist</i> 90, 1473.`,
  };

  for (const [cle, ph] of Object.entries(PHS)) Pourquoi.ajouter(cle, ph);
})();
