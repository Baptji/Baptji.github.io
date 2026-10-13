// ============ « Même phénomène, autres roches » pour les météorites (B.5, 08/10/2026) ============
// Chargé après pourquoi-phenomenes.js. Un seul phénomène pour les 10 fiches : jusqu'où le corps parent a chauffé. Diagramme
// schématique (scène générique « diagramme » de pourquoi.js) : température maximale atteinte × part de métal de la roche.
(function () {
  "use strict";
  if (!window.Pourquoi || !Pourquoi.ajouter) return;
  const lab = (g, x, y, s, o = {}) => g.texte(x, y, s, Object.assign({ cls: "pq-dom" }, o));
  const nb = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  Pourquoi.ajouter("meteorite", {
    scene: "diagramme",
    titre: "Un astéroïde chauffe : plusieurs météorites possibles",
    intro: "Ce qui distingue les météorites, c'est surtout la chaleur qu'a connue leur corps parent. Un astéroïde formé tôt, riche en aluminium 26 radioactif, a fondu et s'est séparé en noyau de métal et en croûte de basalte ; un astéroïde formé plus tard n'a fait que tiédir. Les planètes, plus grosses, ont fondu elles aussi.",
    mesure: "Diagramme schématique : températures maximales arrondies d'après les types pétrologiques des chondrites (Huss et al. 2006) et les températures de fusion du fer-sulfure (988 °C) et des silicates chondritiques (≈ 1 100–1 200 °C) ; part de métal typique de chaque roche.",
    legende: `<span class="pq-sym">●</span> météorite d'un corps resté entier · en pointillé : une roche venue d'un mélange ou d'une planète.`,
    axes: {
      x: { min: 0, max: 1600, ticks: [0, 400, 800, 1200, [1600, "1 600 °C"]], titre: "température maximale atteinte par la roche (°C)" },
      y: { min: 0, max: 100, ticks: [0, 25, 50, 75, [100, "100 %"]], titre: "part de fer-nickel métal (%)" },
    },
    v: { de: 0, a: 1 },
    duree: 10,
    fond: (g) => {
      let s = g.rect(0, 150, 0, 100, "#e1e6ec") + g.rect(150, 980, 0, 100, "#e4ebe3") + g.rect(980, 1200, 0, 100, "#f0e2dc") + g.rect(1200, 1600, 0, 100, "#ece4d9");
      s += lab(g, 75, 96, "eau", { a: "middle" }) + lab(g, 560, 96, "recuit sans fondre", { a: "middle" })
        + lab(g, 1090, 96, "début de", { a: "middle" }) + lab(g, 1090, 90, "fusion", { a: "middle" }) + lab(g, 1400, 96, "fusion complète", { a: "middle" });
      s += g.tirets([[988, 0], [988, 100]], "#9c927f");
      return s;
    },
    chemins: {
      chondre: { pts: [[60, 2, 0], [150, 2, 0.12], [850, 8, 0.55], [1150, 12, 0.75]], nom: "corps parent qui chauffe", nomPos: [300, 3], nomDx: 0, nomDy: -6 },
      silicate: { pts: [[1150, 12, 0.75], [1520, 1, 1]], nom: "croûte et manteau", nomPos: [1520, 1], nomDx: -4, nomDy: -6, nomA: "end" },
      metal: { pts: [[1150, 12, 0.75], [1500, 86, 1]], nom: "noyau", nomPos: [1440, 73], nomDx: 8, nomDy: 3 },
    },
    lire: (v, d) => d ? [`≈ ${nb(d[0])} °C`, `${nb(d[1])} % de métal`] : "",
    lecturePos: [66, 60, "start"],
    roches: [
      { id: "chondrite_carbonee", chemin: "chondre", at: 0.12, court: "chondrite carbonée", lab: [0, -10, "middle"],
        texte: "Formé loin du Soleil avec de la glace, son astéroïde n'a guère dépassé 150 °C : la glace a fondu et l'eau a changé les minéraux en argiles. Presque pas de métal : le fer est dans les argiles et la magnétite." },
      { id: "chondrite_ordinaire", chemin: "chondre", at: 0.55, court: "chondrite ordinaire", lab: [0, 15, "middle"],
        texte: "Recuite sans fondre, de 400 à 950 °C selon sa profondeur dans l'astéroïde (types 3 à 6) : les chondres s'estompent, le métal reste en grains (2 à 19 % selon le groupe)." },
      { id: "chondrite_enstatite", chemin: "chondre", at: 0.5, p: [750, 20], variante: true, sansTrait: true, court: "chondrite à enstatite", lab: [0, -10, "middle"],
        texte: "Même histoire de recuit, mais dans un astéroïde né près du Soleil, sans oxygène : le fer y est resté en métal et en sulfure, d'où près de 20 % de métal." },
      { id: "achondrite_primitive", chemin: "chondre", at: 0.75, court: "achondrite primitive", lab: [-8, -8, "end"],
        texte: "Chauffée jusqu'au début de la fusion (au-delà de 988 °C, le fer et son sulfure fondent) : une partie du métal et du premier liquide est partie, la roche a recristallisé en mosaïque." },
      { id: "achondrite_asteroidale", chemin: "silicate", at: 1, court: "achondrite astéroïdale", lab: [-8, 3, "end"],
        texte: "Fondu en entier, l'astéroïde s'est séparé : le métal est descendu au centre, les silicates ont formé un manteau et une croûte de basalte presque sans métal. Les eucrites viennent de la croûte de Vesta." },
      { id: "achondrite_martienne", chemin: "silicate", at: 1, p: [1420, 8], variante: true, sansTrait: true, court: "martienne", lab: [0, -9, "middle"],
        texte: "Mars, bien plus grosse, a fondu et s'est séparée comme Vesta, mais son volcanisme a duré des milliards d'années : ses météorites sont des basaltes et des cumulats bien plus jeunes." },
      { id: "achondrite_lunaire", chemin: "silicate", at: 1, p: [1290, 22], variante: true, sansTrait: true, court: "lunaire", lab: [0, -9, "middle"],
        texte: "La Lune est née d'un impact géant et a été couverte d'un océan de magma ; sa croûte d'anorthosite, sans métal, en est issue." },
      { id: "meteorite_fer", chemin: "metal", at: 1, court: "météorite de fer", lab: [-8, 3, "end"],
        texte: "Le métal fondu, plus dense, s'est rassemblé au centre de l'astéroïde : le noyau. Brisé par une collision, il donne les météorites de fer." },
      { id: "pallasite", chemin: "metal", at: 1, p: [1320, 38], variante: true, sansTrait: true, court: "pallasite", lab: [8, 3, "start"],
        texte: "Une collision a mêlé le métal d'un noyau à l'olivine d'un manteau : environ 35 % de métal." },
      { id: "mesosiderite", chemin: "metal", at: 1, p: [1250, 52], variante: true, sansTrait: true, court: "mésosidérite", lab: [8, 3, "start"],
        texte: "Une collision a mêlé le métal fondu d'un astéroïde à la croûte basaltique d'un autre : moitié métal, moitié silicates." },
    ],
    sources: `Huss G. R. et al. (2006), dans <i>Meteorites and the Early Solar System II</i>, University of Arizona Press, p. 567 ; Weisberg M. K., McCoy T. J. et Krot A. N. (2006), « Systematics and evaluation of meteorite classification », même ouvrage, p. 19.`,
  });
})();
