// ============ Devenir des argiles : d'où vient-elle, que devient-elle (G.7, 16/10/2026, PROTOTYPE argiles 1:1, à valider) ============
// Sa demande (update du 4/10 de G.7) : mettre les devenirs / cycles des argiles DANS LES GROUPES, en schéma ou en animation.
// Style « pixel art » (son exemple : une coupe pixelisée avec légende), un canevas de 300 × 110 pixels agrandi sans lissage.
// Carte repliable ajoutée au bas du panneau de chaque groupe concerné (argiles-vue.js) : groupes 0-0 (kaolin), 0-1 (halloysite), 0-2 (serpentines).
//   · une carte des passages (SVG, cases = minéraux, flèches cliquables, couleur = type de voie) ;
//   · avant / transformation animée / après, étape par étape (fondu en trame de Bayer + particules : H⁺, eau, K⁺, silice…) ;
//   · la réaction (reprise de alteration-reactions.js quand elle existe), les conditions chiffrées, les sources numérotées.
// Moteurs réutilisés : alteration-reactions.js (équations équilibrées), classification des groupes (argiles-vue.js).
// Les dessins de feuillets sont SCHÉMATIQUES (tétraèdres Si, octaèdres Al/Mg, OH, cations) : le texte le dit.
(function () {
  "use strict";
  const CW = 100, CH = 112, W = CW * 3, H = CH;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ── palette (indices ; 0 = vide) ─────────────────────────────────────────
  const PAL = ["", "#4f8cff", "#a9c8ff", "#9fd4ee", "#5aa0c8", "#f29b3c", "#b8661c", "#c07af0", "#ff6b6b", "#ffffff",
    "#43d0e0", "#f4d35e", "#9a5b34", "#8a86b8", "#6a67a0", "#e8e4ff"];
  const FOND = "#1c1a3a", CADRE = "#3b3768";
  const RGB = PAL.map((h) => (h ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : null));
  const F = RGB[0], FD = [28, 26, 58];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  // ── dessin dans un tampon d'indices ─────────────────────────────────────
  let WAVE = null;                                    // { amp, per } : onde des feuillets (antigorite, halloysite)
  const nouveau = () => new Uint8Array(W * H);
  function px(b, x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (WAVE) y += Math.round(WAVE.amp * Math.sin((2 * Math.PI * x) / WAVE.per));
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    b[y * W + x] = c;
  }
  function tri(b, x0, y0, w, h, haut, fill, bord) {
    for (let r = 0; r < h; r++) {
      const lg = haut ? 1 + Math.round(((w - 1) * r) / (h - 1)) : w - Math.round(((w - 1) * r) / (h - 1));
      const xs = x0 + Math.round((w - lg) / 2);
      for (let i = 0; i < lg; i++) px(b, xs + i, y0 + r, i === 0 || i === lg - 1 ? bord : fill);
    }
  }
  function dia(b, x0, y0, w, h, fill, bord) {
    for (let r = 0; r < h; r++) {
      const k = 1 - Math.abs((2 * r) / (h - 1) - 1);
      const lg = Math.max(2, Math.round(w * (0.35 + 0.65 * k)));
      const xs = x0 + Math.round((w - lg) / 2);
      for (let i = 0; i < lg; i++) px(b, xs + i, y0 + r, i === 0 || i === lg - 1 || r === 0 || r === h - 1 ? bord : fill);
    }
  }
  function diaVide(b, x0, y0, w, h, c) {              // site octaédrique vide : contour pointillé
    for (let r = 0; r < h; r++) {
      const k = 1 - Math.abs((2 * r) / (h - 1) - 1);
      const lg = Math.max(2, Math.round(w * (0.35 + 0.65 * k)));
      const xs = x0 + Math.round((w - lg) / 2);
      if ((r & 1) === 0) { px(b, xs, y0 + r, c); px(b, xs + lg - 1, y0 + r, c); }
    }
  }
  const pt = (b, x, y, c, g = 2) => { for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) px(b, x + i, y + j, c); };
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };

  // ── pièces d'une pile (hauteurs en pixels ; ≈ 2 px par Å) ────────────────
  // Chaque pièce reçoit (b, x0, y) où y = BAS de la pièce, et renvoie sa hauteur.
  const NC = 8, PAS = 10;                              // 8 cases de 10 px
  function rangeeOH(b, x0, y, c1, c2) {                // O (rouge) et H (blanc au-dessus) alternés
    for (let i = 0; i < NC; i++) { pt(b, x0 + i * PAS + 3, y - 2, c1, 2); if (c2) px(b, x0 + i * PAS + 3, y - 3, c2); }
    return 2;
  }
  function pieceTO(b, x0, y, o) {                      // feuillet 1:1 : T (apex en haut) + O + OH
    const mg = o.m === "mg", fill = mg ? 5 : 3, bord = mg ? 6 : 4;
    for (let i = 0; i < NC; i++) if (!(o.e && hash(i, 3) < o.e)) tri(b, x0 + i * PAS, y - 5, 9, 5, true, 1, 2);
    const yo = y - 5 - 4;
    for (let i = 0; i < NC; i++) {
      const vide = !mg && (i % 3 === (o.vac || 0));
      if (vide) diaVide(b, x0 + i * PAS, yo, 9, 4, 14); else dia(b, x0 + i * PAS, yo, 9, 4, fill, bord);
    }
    rangeeOH(b, x0, yo - 0, 8, 9);
    return 5 + 4 + 2;
  }
  function pieceTOT(b, x0, y, o) {                     // feuillet 2:1 : T (apex en haut) + O + T (apex en bas)
    const mg = o.m === "mg", fill = mg ? 5 : 3, bord = mg ? 6 : 4;
    for (let i = 0; i < NC; i++) tri(b, x0 + i * PAS, y - 5, 9, 5, true, 1, 2);
    for (let i = 0; i < NC; i++) {
      const vide = !mg && (i % 3 === (o.vac || 0));
      if (vide) diaVide(b, x0 + i * PAS, y - 9, 9, 4, 14); else dia(b, x0 + i * PAS, y - 9, 9, 4, fill, bord);
    }
    for (let i = 0; i < NC; i++) tri(b, x0 + i * PAS, y - 14, 9, 5, false, 1, 2);
    return 14;
  }
  function pieceO3(b, x0, y, o) {                      // feuillet de gibbsite : OH / Al / OH
    rangeeOH(b, x0, y, 8, 9);
    for (let i = 0; i < NC; i++) {
      if (i % 3 === (o.vac || 0)) diaVide(b, x0 + i * PAS, y - 6, 9, 4, 14); else dia(b, x0 + i * PAS, y - 6, 9, 4, 3, 4);
    }
    rangeeOH(b, x0, y - 8, 8, 9);
    return 10;
  }
  function espace(b, x0, y, o) {                       // espace entre deux feuillets
    const t = o.t;
    if (t === "H") {                                   // liaisons hydrogène : petits tirets
      for (let i = 0; i < NC; i++) { px(b, x0 + i * PAS + 4, y - 1, 13); px(b, x0 + i * PAS + 4, y - 2, 13); }
      return 3;
    }
    if (t === "K") { for (let i = 0; i < NC; i++) pt(b, x0 + i * PAS + 3, y - 4, 7, 3); return 5; }
    if (t === "W") {                                   // une couche d'eau (halloysite 10 Å, ≈ 2,8 Å)
      for (let i = 0; i < NC; i++) pt(b, x0 + i * PAS + 3, y - 5, 10, 3);
      return 7;
    }
    if (t === "MW") {                                  // Mg²⁺ hydraté (vermiculite, ≈ 4,5 Å) : cation jaune + eau
      for (let i = 0; i < NC; i += 2) {
        pt(b, x0 + i * PAS + 3, y - 6, 11, 3);
        pt(b, x0 + i * PAS + 1, y - 9, 10, 2); pt(b, x0 + i * PAS + 7, y - 9, 10, 2);
        pt(b, x0 + i * PAS + 1, y - 3, 10, 2); pt(b, x0 + i * PAS + 7, y - 3, 10, 2);
      }
      for (let i = 1; i < NC; i += 2) pt(b, x0 + i * PAS + 3, y - 6, 10, 2);
      return 12;
    }
    return o.h || 2;
  }
  function cadreFR(b, x0, y, o) {                      // charpente de feldspath : tétraèdres Si / Al en damier, K dans les creux
    const e = o.e || 0;
    for (let r = 0; r < 6; r++) for (let c = 0; c < NC; c++) {
      if (e && hash(c + 7 * (o.s || 0), r) < e) continue;
      const al = (c + r) % 4 === 0;
      tri(b, x0 + c * PAS + (r % 2 ? 5 : 0), y - 5 - r * 5, 9, 5, (r + c) % 2 === 0, al ? 3 : 1, al ? 4 : 2);
    }
    for (let r = 0; r < 6; r++) for (let c = 0; c < NC; c++) {
      if ((r * 3 + c) % 5 === 0 && !(e && hash(c, r) < e * 0.7)) pt(b, x0 + c * PAS + (r % 2 ? 0 : 5) + 3, y - 4 - r * 5, 7, 3);
    }
    return 30;
  }

  // pile = liste de pièces de bas en haut : "TO:al/0", "TO:mg", "TOT:mg", "O3/0", "g:H", "g:K", "g:W", "g:MW", "g:2", "FR", "FR~0.5"
  function hauteurs(items) {
    const tmp = nouveau(); let tot = 0;
    for (const it of items) tot += piece(tmp, 0, 0, it);
    return tot;
  }
  function piece(b, x0, y, it) {
    const m = it.match(/^(TOT|TO|O3|FR|g)(?::([A-Za-z0-9]+))?(?:\/(\d))?(?:~([0-9.]+))?$/);
    if (!m) return 0;
    const [, nom, type = "", vac = "0", eros = "0"] = m;
    switch (nom) {
      case "TO": return pieceTO(b, x0, y, { m: type === "mg" ? "mg" : "al", vac: Number(vac), e: Number(eros) });
      case "TOT": return pieceTOT(b, x0, y, { m: type === "al" ? "al" : "mg", vac: Number(vac), e: Number(eros) });
      case "O3": return pieceO3(b, x0, y, { vac: Number(vac) });
      case "g": return espace(b, x0, y, { t: type, h: Number(type) || 2 });
      case "FR": return cadreFR(b, x0, y, { e: Number(eros) });
      default: return 0;
    }
  }
  function pile(items, cx, o = {}) {
    const b = nouveau();
    WAVE = o.onde || null;
    const tot = hauteurs(items);
    const x0 = cx + 10;
    let y = Math.round((CH + tot) / 2) - 2;
    for (const it of items) { const h = piece(b, x0, y, it); y -= h; }
    WAVE = null;
    return b;
  }
  // un état = un tampon pour la cellule du milieu (x décalé de CW), copié aussi à gauche / à droite pour les cases fixes
  function etat(items, onde) {
    return { milieu: pile(items, CW, { onde }), gauche: pile(items, 0, { onde }), droite: pile(items, 2 * CW, { onde }) };
  }

  // ── passages ──────────────────────────────────────────────────────────────
  // particules : [sorte, x0, y0, x1, y1, début, fin] dans la cellule du milieu (0–100 × 0–112) ; début/fin = part de l'étape
  const TYPES = {
    heritage: { nom: "héritage", c: "#43d0e0" },
    transfo: { nom: "transformation", c: "#f29b3c" },
    neo: { nom: "néoformation", c: "#7bd88f" },
    secondaire: { nom: "formation secondaire", c: "#c07af0" },
  };
  const N = {            // cases de la carte (x, y dans 600 × 230), texte
    feld: { x: 6, y: 14, t: "Feldspath K", s: "KAlSi₃O₈" },
    biot: { x: 6, y: 100, t: "Biotite", s: "mica noir" },
    verm: { x: 6, y: 170, t: "Vermiculite", s: "K⁺ parti" },
    kaol: { x: 220, y: 56, t: "Kaolinite", s: "7,15 Å" },
    dick: { x: 440, y: 14, t: "Dickite", s: "enfouie, 110 à 130 °C" },
    gibb: { x: 440, y: 98, t: "Gibbsite", s: "Al(OH)₃" },
    h10: { x: 220, y: 150, t: "Halloysite 10 Å", s: "avec eau" },
    h72: { x: 440, y: 170, t: "Halloysite 7,2 Å", s: "séchée" },
    liz: { x: 6, y: 62, t: "Lizardite", s: "Mg₃Si₂O₅(OH)₄" },
    atg: { x: 280, y: 18, t: "Antigorite", s: "320 à 390 °C" },
    sap: { x: 280, y: 128, t: "Smectite", s: "saponite, Fe-montm." },
  };
  const P = {
    feld: {
      de: "feld", vers: "kaol", type: "neo", groupes: ["0-0"],
      titre: "Feldspath potassique → kaolinite",
      etats: [
        { nom: "Feldspath K : charpente de tétraèdres Si et Al, K⁺ dans les creux", items: ["FR"] },
        { nom: "La charpente se dissout : K⁺ et silice partent", items: ["FR~0.55"] },
        { nom: "Kaolinite : Al et Si dissous cristallisent en feuillets", items: ["TO:al/0", "g:H", "TO:al/0", "g:H", "TO:al/0"] },
      ],
      etapes: [
        { cap: "Sous l'effet de l'eau acide (H⁺), la charpente se défait : potassium et silice passent en solution.",
          p: [["H", 6, 6, 30, 40, 0, .5], ["H", 60, 4, 70, 44, .1, .6], ["W", 80, 6, 50, 30, .2, .7], ["K", 38, 56, 96, 18, .3, 1], ["K", 60, 70, 100, 40, .35, 1], ["Si", 22, 50, 4, 14, .4, 1], ["Si", 50, 40, 14, 4, .45, 1]] },
        { cap: "Subsistent l'aluminium et un peu de silice dissous, qui se réassemblent en feuillets de kaolinite (néoformation).",
          p: [["Al", 6, 20, 30, 70, 0, .8], ["Si", 94, 20, 64, 60, .1, .9], ["Al", 94, 40, 50, 78, .2, .95], ["Si", 6, 40, 40, 82, .3, 1]] },
      ],
      reaction: { min: "orthose", voie: 1, plus: "Lanson et al. 2002 [1], réaction (1) : 2 KAlSi₃O₈ + 2 H⁺ + 9 H₂O → Al₂Si₂O₅(OH)₄ + 4 H₄SiO₄ + 2 K⁺" },
      cond: ["La kaolinite se forme sur sol drainé, en climat chaud et humide (≥ 15 °C, pluie au-delà de 65 % de l'ETP ; Pedro 1968, voir la fiche du feldspath).",
        "Il faut un apport constant de protons et l'évacuation de K⁺ et de silice (Lanson et al. 2002 [1]).",
        "Aussi à l'enfouissement : kaolinite jusqu'à ≈ 2 000 m dans les grès (Lanson et al. 2002 [1])."],
      src: [1],
      note: "Schéma : la charpente (damier de tétraèdres) n'est pas dessinée à l'échelle de la maille réelle ; seul le bilan de la réaction est établi.",
    },
    biot: {
      de: "biot", vers: "kaol", type: "transfo", groupes: ["0-0"],
      titre: "Biotite → vermiculite → kaolinite",
      etats: [
        { nom: "Biotite : feuillets 2:1 de Mg et Fe, K⁺ entre les feuillets", items: ["TOT:mg", "g:K", "TOT:mg", "g:K", "TOT:mg"] },
        { nom: "Vermiculite : le potassium est parti, le magnésium hydraté le remplace", items: ["TOT:mg", "g:MW", "TOT:mg", "g:MW", "TOT:mg"] },
        { nom: "Kaolinite : le feuillet de silice du dessus est parti (le fer rouille)", items: ["TO:al/0", "g:H", "TO:al/0", "g:H", "TO:al/0"] },
      ],
      etapes: [
        { cap: "Le potassium s'échappe par les bords, tandis que le magnésium de l'eau du sol pénètre accompagné de ses molécules d'eau : les feuillets s'écartent (de 10 à 14 Å).",
          p: [["K", 30, 40, 100, 20, 0, .8], ["K", 60, 60, 100, 50, .1, .9], ["K", 40, 80, 100, 78, .2, 1], ["Mg", 100, 30, 56, 42, .3, 1], ["Mg", 100, 70, 40, 66, .4, 1]] },
        { cap: "En climat chaud et humide, la silice et le magnésium s'en vont à leur tour ; l'aluminium demeure, et le fer donne de la goethite.",
          p: [["Mg", 30, 36, 100, 14, 0, .8], ["Mg", 60, 60, 100, 40, .1, .9], ["Si", 40, 30, 100, 90, .2, 1], ["Si", 60, 80, 8, 100, .25, 1], ["Fe", 20, 56, 6, 96, .3, 1]] },
      ],
      reaction: { min: "biotite", voie: 1, plus: "Vermiculite : voie propre aux climats tempérés, à retrouver sur la fiche de la biotite." },
      cond: ["Vermiculite si le climat reste tempéré et humide (< 15 °C) ; kaolinite si le climat est chaud et humide (≥ 15 °C), d'après l'atlas et Pedro (1968).",
        "Sur un profil granitique, la biotite donne d'abord une biotite-vermiculite interstratifiée, qui gonfle le grain, avant de céder la place à la kaolinite (Jeong 2000 [7], résumé lu).",
        "L'altération de la biotite est un remplacement pseudomorphe, avec ou sans intermédiaire vermiculite (Jolicoeur et al. 2000 [6], résumé lu)."],
      src: [6, 7],
      note: "Schéma établi d'après les résumés [6] et [7] et d'après les indications disponibles (départ du potassium, puis de la silice) ; aucune source lue ne décrit le mécanisme feuillet par feuillet : à confirmer (D20).",
    },
    h10: {
      de: "h10", vers: "h72", type: "transfo", groupes: ["0-1"],
      titre: "Halloysite 10 Å → halloysite 7,2 Å (séchage)",
      etats: [
        { nom: "Halloysite 10 Å : une couche d'eau entre les feuillets, feuillets courbés", items: ["TO:al/0", "g:W", "TO:al/0", "g:W", "TO:al/0"], onde: { amp: 2, per: 56 } },
        { nom: "Halloysite 7,2 Å : l'eau est partie, les feuillets se touchent", items: ["TO:al/0", "g:H", "TO:al/0", "g:H", "TO:al/0"], onde: { amp: 2, per: 56 } },
      ],
      etapes: [
        { cap: "À l'air sec, l'eau s'échappe et l'espacement passe de 10 à 7,2 Å. Le processus ne se réversibilise pas : la déshydratation est irréversible.",
          p: [["W", 20, 50, 4, 20, 0, .8], ["W", 50, 60, 100, 18, .1, .9], ["W", 70, 46, 100, 62, .2, 1], ["W", 30, 70, 2, 80, .3, 1]] },
      ],
      reaction: null,
      cond: ["Espacement 10 Å avec une couche d'eau, 7,2 Å une fois séchée ; irréversible (Joussein et al. 2005 [10])."],
      src: [10],
      note: "Des feuillets ondulés évoquent la forme tubulaire de la halloysite (G.5 ; le tube complet figure dans la vue « Structure »).",
    },
    dick: {
      de: "kaol", vers: "dick", type: "secondaire", groupes: ["0-0"],
      titre: "Kaolinite → dickite (enfouissement)",
      etats: [
        { nom: "Kaolinite : le site vide est au même endroit dans chaque feuillet", items: ["TO:al/0", "g:H", "TO:al/0", "g:H", "TO:al/0", "g:H", "TO:al/0"] },
        { nom: "Les feuillets se dissolvent un à un", items: ["TO:al/0", "g:H", "TO:al/1", "g:H", "TO:al/0", "g:H", "TO:al/1"] },
        { nom: "Dickite : le site vide change de place d'un feuillet à l'autre", items: ["TO:al/0", "g:H", "TO:al/1", "g:H", "TO:al/0", "g:H", "TO:al/1"] },
      ],
      etapes: [
        { cap: "Entre 110 et 130 °C, la kaolinite passe en solution dans l'eau interstitielle de la roche...", p: [["Al", 20, 20, 90, 6, 0, 1], ["Si", 60, 30, 100, 50, .1, 1], ["Si", 30, 80, 4, 100, .2, 1]] },
        { cap: "... et la dickite, plus stable, cristallise à son tour en blocs nets (dissolution puis recristallisation, et non transformation à l'état solide).",
          p: [["Al", 90, 6, 30, 30, 0, 1], ["Si", 100, 50, 60, 60, .1, 1], ["Si", 4, 100, 40, 80, .2, 1]] },
      ],
      reaction: null,
      reactionTexte: "Al₂Si₂O₅(OH)₄ (kaolinite) → Al₂Si₂O₅(OH)₄ (dickite) : la formule ne change pas, seul l'empilement des feuillets diffère.",
      cond: ["Kaolinite seule au-dessus de ≈ 2 000 m ; dickite entre 2 500 et 5 000 m dans les grès de la mer du Nord et de Norvège (Lanson et al. 2002 [1]).",
        "Isograde vers 1,4–2,7 km pour la kaolinite et au-delà de 3,2 km pour la dickite (≈ 110 à 130 °C) dans la formation Garn (Ehrenberg et al. 1993 [3], résumé lu) ; Lanson juge cet « isograde » unique discutable.",
        "ΔG° kaolinite → dickite = −0,62 ± 0,15 kcal/mol à 150 °C, −0,22 ± 0,21 à 300 °C : la kaolinite reste métastable, c'est la cinétique qui décide (Zotov et al. 1998 [2])."],
      src: [1, 2, 3],
      note: "Tout repose sur le décalage du site octaédrique vide d'un feuillet à l'autre (1·1·1·1 pour la kaolinite, 1·2·1·2 pour la dickite ; Bailey 1963, comparaison 3D du groupe). La nacrite n'est pas traitée, aucune source n'ayant été trouvée.",
    },
    gibb: {
      de: "kaol", vers: "gibb", type: "transfo", groupes: ["0-0"],
      titre: "Kaolinite → gibbsite (désilicification)",
      etats: [
        { nom: "Kaolinite : un feuillet de silice (bleu) sous chaque feuillet d'aluminium", items: ["TO:al/0", "g:H", "TO:al/0", "g:H", "TO:al/0"] },
        { nom: "La silice est lessivée", items: ["TO:al/0", "g:H", "TO:al/0~0.5", "g:H", "TO:al/0"] },
        { nom: "Gibbsite : il ne reste que l'aluminium et ses OH", items: ["O3/0", "g:H", "O3/0", "g:H", "O3/0", "g:H", "O3/0"] },
      ],
      etapes: [
        { cap: "Sous climat équatorial très arrosé, l'eau entraîne peu à peu la silice des feuillets (désilicification).",
          p: [["W", 6, 6, 30, 40, 0, .6], ["W", 94, 6, 70, 40, .1, .7], ["Si", 30, 40, 4, 10, .3, 1], ["Si", 70, 50, 98, 20, .35, 1], ["Si", 50, 70, 98, 96, .4, 1]] },
        { cap: "Seul l'aluminium demeure : ses feuillets d'hydroxyde se superposent en gibbsite (bauxites, latérites).",
          p: [["Si", 40, 40, 4, 8, 0, .8], ["Si", 60, 60, 98, 100, .1, .9]] },
      ],
      reaction: { min: "kaolinite_m", voie: 1, plus: "" },
      cond: ["Sur sol drainé, climat tropical très humide (≥ 22 °C, pluie dépassant l'ETP toute l'année ; atlas, d'après Pedro 1968).",
        "En climat équatorial à 3 000 mm/an, la désilicification progressive donne d'abord des kaolins ; la gibbsite précipite en bas de versant quand le pH remonte, et reste absente d'un milieu confiné (Montes, Lucas et al. 2007 [9]).",
        "Le micro-milieu décide autant que le climat : kaolinite et gibbsite coexistent dans une même roche (Jolicoeur et al. 2000 [6], résumé lu)."],
      src: [9, 6],
      note: "Aucune des sources lues ne donne le seuil de silice dissoute qui fait basculer de la kaolinite vers la gibbsite.",
    },
    liz: {
      de: "liz", vers: "atg", type: "secondaire", groupes: ["0-2"],
      titre: "Lizardite → antigorite (subduction)",
      etats: [
        { nom: "Lizardite : feuillets plats de magnésium (orange) et de silice", items: ["TO:mg", "g:H", "TO:mg", "g:H", "TO:mg"] },
        { nom: "Les feuillets se dissolvent aux joints, de la silice arrive", items: ["TO:mg", "g:H", "TO:mg~0.3", "g:H", "TO:mg"], onde: { amp: 1, per: 60 } },
        { nom: "Antigorite : feuillets ondulés, le feuillet de silice change de côté à chaque onde", items: ["TO:mg", "g:H", "TO:mg", "g:H", "TO:mg"], onde: { amp: 4, per: 64 } },
      ],
      etapes: [
        { cap: "Entre 320 et 390 °C, un fluide riche en silice attaque la lizardite aux joints de grains comme au cœur des mailles.",
          p: [["Si", 100, 10, 60, 40, 0, 1], ["Si", 100, 60, 40, 70, .2, 1], ["W", 40, 40, 100, 90, .4, 1]] },
        { cap: "Il se forme de l'antigorite : feuillets ondulés (onde d'environ 3,6 nm), avec un apport de silice et une molécule d'eau libérée.",
          p: [["Si", 100, 30, 50, 56, 0, .8], ["W", 50, 60, 4, 100, .3, 1]] },
      ],
      reaction: null,
      reactionTexte: "16 lizardite (ou chrysotile) + 2 SiO₂(aq) → antigorite + H₂O  (réaction (3), observée dès 320 °C ; Schwartz et al. 2013 [4])",
      cond: ["Lizardite (et chrysotile) sous 300–320 °C ; antigorite de 320 à 390 °C, seule serpentine stable au-dessus de 390 °C jusqu'à ≈ 460 °C où apparaît l'olivine (Schwartz et al. 2013 [4]).",
        "Aucun domaine de stabilité pour le chrysotile : son écart d'énergie libre avec la lizardite ne dépasse pas ≈ 2 kJ (Evans 2004 [5], lu en partie).",
        "Les serpentines contiennent jusqu'à 13 % d'eau en masse (Schwartz et al. 2013 [4])."],
      src: [4, 5],
      note: "Schéma : l'amplitude de l'onde n'est pas représentée à l'échelle. Les Alpes occidentales servent d'exemple.",
    },
    sap: {
      de: "liz", vers: "sap", type: "transfo", groupes: ["0-2"],
      titre: "Serpentinite altérée → smectite",
      etats: [
        { nom: "Serpentine : feuillets 1:1 de magnésium", items: ["TO:mg", "g:H", "TO:mg", "g:H", "TO:mg"] },
        { nom: "Smectite : feuillets 2:1, magnésium hydraté entre eux", items: ["TOT:mg", "g:MW", "TOT:mg", "g:MW", "TOT:mg"] },
      ],
      etapes: [
        { cap: "Sur un sol sec ou mal drainé, une fraction de silice et de magnésium subsiste en place et façonne une argile gonflante.",
          p: [["Mg", 30, 40, 100, 14, 0, .8], ["W", 100, 70, 40, 60, .2, 1], ["Si", 100, 90, 60, 90, .3, 1]] },
      ],
      reaction: { min: "lizardite", voie: 1, plus: "" },
      cond: ["Smectite magnésienne sur sol sec ou engorgé (pluie inférieure à 65 % de l'ETP, ou eau stagnante ; atlas, d'après Pedro 1968).",
        "Dans une serpentinite altérée en système clos, la nature de l'argile suit la texture héritée : saponite peu alumineuse dans les lames, montmorillonites ferrifères dans les mailles et les veines (Caillaud, Proust et Righi 2006 [8], résumé lu)."],
      src: [8],
      note: "Schéma illustratif : aucune source lue ne décrit le passage feuillet par feuillet d'une serpentine 1:1 à une smectite 2:1.",
    },
  };
  const CARTES = { "0-0": ["feld", "biot", "gibb", "dick"], "0-1": ["h10"], "0-2": ["liz", "sap"] };
  const TITRES = { "0-0": "Le kaolin : son origine et son devenir", "0-1": "La halloysite : séchage", "0-2": "Les serpentines : formation et altération" };

  // ── références ────────────────────────────────────────────────────────────
  const SRC = {
    1: "Lanson B., Beaufort D., Berger G., Bauer A., Cassagnabère A., Meunier A. (2002), Authigenic kaolin and illitic minerals during burial diagenesis of sandstones: a review, Clay Minerals 37 : 1-22 (lu en entier).",
    2: "Zotov A., Mukhamet-Galeev A., Schott J. (1998), An experimental study of kaolinite and dickite relative stability at 150-300 °C…, American Mineralogist 83 : 516-524 (résumé et introduction lus).",
    3: "Ehrenberg S.N., Aagaard P., Wilson M.J., Fraser A.R., Duthie D.M.L. (1993), Depth-dependent transformation of kaolinite to dickite in sandstones of the Norwegian continental shelf, Clay Minerals 28 : 325-352 (résumé seulement).",
    4: "Schwartz S., Guillot S., Reynard B., Lafay R., Debret B., Nicollet C., Lanari P., Auzende A.L. (2013), Pressure–temperature estimates of the lizardite/antigorite transition in high pressure serpentinites, Lithos 178 : 197-210 (lu en entier).",
    5: "Evans B.W. (2004), The serpentinite multisystem revisited: chrysotile is metastable, International Geology Review 46 : 479-506 (lu en partie).",
    6: "Jolicoeur S., Ildefonse P., Bouchard M. (2000), Kaolinite and gibbsite weathering of biotite within saprolites and soils of central Virginia, Soil Science Society of America Journal 64 : 1118-1129 (résumé seulement).",
    7: "Jeong G.Y. (2000), Dependence of localized crystallization of halloysite and kaolinite on primary minerals in the weathering profile of granite, Clays and Clay Minerals 48 : 196-203 (résumé seulement).",
    8: "Caillaud J., Proust D., Righi D. (2006), Weathering sequences of rock-forming minerals in a serpentinite: influence of microsystems on clay mineralogy, Clays and Clay Minerals 54 : 87-100 (résumé seulement).",
    9: "Montes C.R., Lucas Y., Pereira O.J.R., Achard R., Grimaldi M., Melfi A.J. et al. (2007), Désilicification progressive… (ferralsols et podzols d'Amazonie), Comptes Rendus Géoscience 339 : 50 (lu en entier ; titre à vérifier).",
    10: "Joussein E., Petit S., Churchman J., Theng B., Righi D., Delvaux B. (2005), Halloysite clay minerals — a review, Clay Minerals 40 : 383-426.",
  };

  // ── équation reprise de alteration-reactions.js ─────────────────────────
  const nomEsp = (id) => {
    const E = window.ALT_ESPECES || {}, R = window.ALT_REACTIONS || {};
    return (E[id] && E[id].f) || (R[id] && R[id].formule) || id;
  };
  function equation(r) {
    const R = window.ALT_REACTIONS && ALT_REACTIONS[r.min];
    const v = R && R.voies[r.voie];
    if (!v || !v.reactifs) return "";
    const cote = (a) => a.map(([n, id]) => (n > 1 ? n + " " : "") + nomEsp(id)).join(" + ");
    return `${cote(v.reactifs)} → ${cote(v.produits)}`;
  }

  // ── carte (SVG) ──────────────────────────────────────────────────────────
  function carteSVG(cle, actif) {
    const ids = CARTES[cle];
    const noeuds = [...new Set(ids.flatMap((i) => [P[i].de, P[i].vers]))];
    const xs = noeuds.map((n) => N[n].x), ys = noeuds.map((n) => N[n].y);
    const x0 = Math.min(...xs) - 6, y0 = Math.min(...ys) - 8, x1 = Math.max(...xs) + 168, y1 = Math.max(...ys) + 66;
    const bw = 160, bh = 46;
    const cases = noeuds.map((n) => {
      const c = N[n];
      return `<g><rect x="${c.x}" y="${c.y}" width="${bw}" height="${bh}" fill="#26224d" stroke="#6a67a0" stroke-width="2"/>
        <text x="${c.x + 8}" y="${c.y + 20}" class="argd-nom">${esc(c.t)}</text><text x="${c.x + 8}" y="${c.y + 36}" class="argd-sous">${esc(c.s)}</text></g>`;
    }).join("");
    const fleches = ids.map((id) => {
      const p = P[id], a = N[p.de], b = N[p.vers];
      let ax = a.x + bw, ay = a.y + bh / 2, bx = b.x, by = b.y + bh / 2;
      if (b.x < a.x + bw) { ax = a.x + bw / 2; ay = a.y + bh; bx = b.x + bw / 2; by = b.y; }      // même colonne : vertical
      if (Math.abs(b.x - a.x) < 5 && b.y < a.y) { ay = a.y; by = b.y + bh; }
      const mx = (ax + bx) / 2, my = (ay + by) / 2, c = TYPES[p.type].c, sel = id === actif;
      const ang = Math.atan2(by - ay, bx - ax), tx = bx - 2, ty = by;
      const pointe = [[0, 0], [-10, -6], [-10, 6]].map(([u, v]) => `${(tx + u * Math.cos(ang) - v * Math.sin(ang)).toFixed(1)},${(ty + u * Math.sin(ang) + v * Math.cos(ang)).toFixed(1)}`).join(" ");
      return `<g class="argd-fl${sel ? " on" : ""}" data-passage="${id}" tabindex="0" role="button" aria-label="${esc(p.titre)}">
        <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="transparent" stroke-width="22"/>
        <line x1="${ax}" y1="${ay}" x2="${bx - 6 * Math.cos(ang)}" y2="${by - 6 * Math.sin(ang)}" stroke="${c}" stroke-width="${sel ? 5 : 3}" ${sel ? "" : 'stroke-dasharray="6 4"'}/>
        <polygon points="${pointe}" fill="${c}"/>
        <rect x="${mx - 4}" y="${my - 4}" width="8" height="8" fill="${c}"/></g>`;
    }).join("");
    return `<svg class="argd-carte" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" shape-rendering="crispEdges" role="group" aria-label="Carte des passages">${fleches}${cases}</svg>`;
  }

  // ── HTML d'un passage (sous la carte) ────────────────────────────────────
  function detailHTML(id) {
    const p = P[id], t = TYPES[p.type];
    const eq = p.reaction ? equation(p.reaction) : "";
    const sources = p.src.map((n) => `<li id="argd-src-${n}">[${n}] ${esc(SRC[n])}</li>`).join("");
    return `<div class="argd-tete"><span class="argd-pastille" style="background:${t.c}"></span><b>${esc(p.titre)}</b> <span class="argd-type">${t.nom}</span></div>
      <div class="argd-scene">
        <canvas class="argd-cv" width="${W}" height="${H}" aria-label="${esc(p.titre)} : avant, transformation, après"></canvas>
        <div class="argd-noms"><div>${esc(p.etats[0].nom)}</div><div class="argd-nom-mid">…</div><div>${esc(p.etats[p.etats.length - 1].nom)}</div></div>
        <div class="argd-barre">
          <button type="button" class="argd-play" aria-label="Pause">❚❚</button>
          ${p.etapes.map((e, i) => `<button type="button" class="argd-etape${i === 0 ? " on" : ""}" data-etape="${i}">${i + 1}</button>`).join("")}
          <span class="argd-cap"></span></div>
        <div class="argd-leg">${legende(p)}</div>
      </div>
      ${eq || p.reactionTexte ? `<p class="argd-eq"><b>Réaction.</b> ${eq ? esc(eq) : esc(p.reactionTexte)}${p.reaction && p.reaction.plus ? `<br><small>${esc(p.reaction.plus)}</small>` : ""}</p>` : ""}
      <ul class="argd-cond">${p.cond.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
      <p class="argd-note">${esc(p.note)}</p>
      <details class="argd-src"><summary>Sources de ce passage</summary><ul>${sources}</ul></details>`;
  }
  const SPRITES = { H: ["#ffffff", "H⁺ (acide)"], W: ["#43d0e0", "eau"], K: ["#c07af0", "K⁺"], Si: ["#4f8cff", "silice dissoute H₄SiO₄"],
    Al: ["#9fd4ee", "aluminium"], Mg: ["#f4d35e", "Mg²⁺"], Fe: ["#9a5b34", "fer"] };
  function legende(p) {
    const vu = new Set(p.etapes.flatMap((e) => e.p.map((q) => q[0])));
    const pieces = [["#4f8cff", "tétraèdre Si"], p.etats.some((e) => e.items.some((i) => /mg/.test(i))) ? ["#f29b3c", "octaèdre Mg"] : ["#9fd4ee", "octaèdre Al"], ["#ff6b6b", "O / OH"]];
    return [...pieces, ...[...vu].map((k) => SPRITES[k])].map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join("");
  }

  // ── lecteur (un par carte) ───────────────────────────────────────────────
  const lisse = (t) => t * t * (3 - 2 * t);
  function lecteur(racine, id) {
    const p = P[id];
    const cv = racine.querySelector(".argd-cv");
    if (!cv) return null;
    const ctx = cv.getContext("2d"), img = ctx.createImageData(W, H);
    const etats = p.etats.map((e) => etat(e.items, e.onde));
    const n = p.etapes.length, DUREE = 4200, FIN = 2600;
    const st = { t: 0, etape: 0, pause: false, id, actif: false };
    const capEl = racine.querySelector(".argd-cap"), midEl = racine.querySelector(".argd-nom-mid");
    const sortie = img.data;
    function image(i, prog, ta) {
      const A = etats[i].milieu, B = etats[Math.min(i + 1, etats.length - 1)].milieu;
      const seuil = prog * 16;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;
        let c = 0;
        if (x < CW) c = etats[0].gauche[y * W + x];
        else if (x >= 2 * CW) c = etats[etats.length - 1].droite[y * W + x];
        else c = BAYER[(y & 3) * 4 + (x & 3)] < seuil ? B[y * W + x] : A[y * W + x];
        let col = c ? RGB[c] : FD;
        if (!c) {                                         // fond : cadre des trois cases + trame discrète
          const lx = x % CW;
          if (lx === 0 || lx === CW - 1 || y === 0 || y === H - 1) col = [59, 55, 104];
          else if (((x >> 2) + (y >> 2)) % 7 === 0 && (x & 3) === 1 && (y & 3) === 1) col = [38, 35, 78];
        }
        sortie[o] = col[0]; sortie[o + 1] = col[1]; sortie[o + 2] = col[2]; sortie[o + 3] = 255;
      }
      // flèches entre les cases
      for (const fx of [CW, 2 * CW]) for (let k = 0; k < 6; k++) for (let j = -k; j <= k; j++) {
        const x = fx - 3 + (5 - k) , y = Math.round(H / 2) + j, o = (y * W + x) * 4;
        if (x > 0 && x < W) { sortie[o] = 244; sortie[o + 1] = 211; sortie[o + 2] = 94; }
      }
      // particules
      const et = p.etapes[i];
      for (const [k, x0, y0, x1, y1, a, b] of et.p) {
        let u = (prog - a) / (b - a);
        if (u < 0 || u > 1) continue;
        u = lisse(u);
        const x = CW + Math.round(x0 + (x1 - x0) * u), y = Math.round(y0 + (y1 - y0) * u + Math.sin(ta / 260 + x0) * 1.5);
        const col = RGB[{ H: 9, W: 10, K: 7, Si: 1, Al: 3, Mg: 11, Fe: 12 }[k]];
        const g = k === "H" ? 2 : 3;
        for (let dx = 0; dx < g; dx++) for (let dy = 0; dy < g; dy++) {
          if (g === 3 && dx !== 1 && dy !== 1 && k !== "W") continue;
          const xx = x + dx, yy = y + dy;
          if (xx < CW || xx >= 2 * CW || yy < 1 || yy >= H - 1) continue;
          const o = (yy * W + xx) * 4;
          sortie[o] = col[0]; sortie[o + 1] = col[1]; sortie[o + 2] = col[2];
        }
        if (k === "Si") { const o = (Math.min(H - 2, y + 1) * W + Math.min(W - 1, x + 1)) * 4; sortie[o] = sortie[o + 1] = sortie[o + 2] = 233; }
      }
      ctx.putImageData(img, 0, 0);
    }
    function montrer(i, prog, ta = 0) {
      st.etape = i;
      image(i, prog, ta);
      racine.querySelectorAll(".argd-etape").forEach((b, k) => b.classList.toggle("on", k === i));
      capEl.textContent = p.etapes[i].cap;
      midEl.textContent = p.etats[Math.min(i + 1, p.etats.length - 1)].nom;
    }
    let debut = 0, raf = 0, dernier = 0;
    function boucle(ts) {
      raf = 0;
      if (!st.actif || st.pause) return;
      if (ts - dernier >= 50) {
        dernier = ts;
        if (!debut) debut = ts - st.t;
        const dt = ts - debut;
        const cycle = n * DUREE + FIN;
        const m = dt % cycle;
        const i = Math.min(n - 1, Math.floor(m / DUREE));
        const prog = m >= n * DUREE ? 1 : lisse(Math.min(1, ((m - i * DUREE) / DUREE) * 1.35));
        montrer(i, prog, ts);
      }
      raf = requestAnimationFrame(boucle);
    }
    function relancer() { if (!raf && st.actif && !st.pause) raf = requestAnimationFrame(boucle); }
    const reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    montrer(0, reduit ? 1 : 0);
    racine.querySelector(".argd-play").addEventListener("click", (e) => {
      st.pause = !st.pause; e.currentTarget.textContent = st.pause ? "▶" : "❚❚";
      e.currentTarget.setAttribute("aria-label", st.pause ? "Lecture" : "Pause");
      if (!st.pause) { debut = 0; relancer(); }
    });
    racine.querySelectorAll(".argd-etape").forEach((b) => b.addEventListener("click", () => {
      const i = Number(b.dataset.etape);
      st.pause = true; racine.querySelector(".argd-play").textContent = "▶";
      montrer(i, 1);
    }));
    if (window.IntersectionObserver && !reduit) {
      const io = new IntersectionObserver((es) => { st.actif = es.some((e) => e.isIntersecting); if (st.actif) { debut = 0; relancer(); } }, { threshold: 0.2 });
      io.observe(cv);
      st.io = io;
    }
    st.montrer = montrer;
    return st;
  }

  // ── carte repliable d'un groupe ─────────────────────────────────────────
  function html(cle) {
    if (!CARTES[cle]) return "";
    const premier = CARTES[cle][0];
    return `<details class="cmp-puce argd" data-argd="${cle}"><summary>Son devenir : ${esc(TITRES[cle])} <span class="badge outline">prototype</span></summary>
      <div class="argd-corps">
        <p class="argd-intro">Ce que devient une argile suit l'une de ces voies : <span class="argd-v" style="--c:${TYPES.heritage.c}">héritage</span> (l'argile traverse l'érosion sans changer),
        <span class="argd-v" style="--c:${TYPES.transfo.c}">transformation</span> (un minéral se modifie),
        <span class="argd-v" style="--c:${TYPES.neo.c}">néoformation</span> (cristallisation à partir d'ions dissous), et
        <span class="argd-v" style="--c:${TYPES.secondaire.c}">formation secondaire</span> (enfouissement, chaleur). Un clic sur une flèche en affiche le détail.</p>
        <div class="argd-carte-bloc" data-carte>${carteSVG(cle, premier)}</div>
        <div class="argd-detail" data-detail>${detailHTML(premier)}</div>
      </div></details>`;
  }
  function monter(racine) {
    (racine || document).querySelectorAll(".argd").forEach((d) => {
      if (d._argd) return;
      d._argd = { l: null, id: null };
      const cle = d.dataset.argd, bloc = d.querySelector("[data-detail]"), carte = d.querySelector("[data-carte]");
      function choisir(id) {
        if (d._argd.l && d._argd.l.io) d._argd.l.io.disconnect();
        if (d._argd.l) d._argd.l.actif = false;
        carte.innerHTML = carteSVG(cle, id);
        bloc.innerHTML = detailHTML(id);
        d._argd.id = id;
        d._argd.l = lecteur(bloc, id);
        if (d._argd.l) d._argd.l.actif = d.open;
      }
      const aller = (e) => { const g = e.target.closest("[data-passage]"); if (g && (e.type === "click" || e.key === "Enter" || e.key === " ")) { e.preventDefault(); choisir(g.dataset.passage); } };
      carte.addEventListener("click", aller);
      carte.addEventListener("keydown", aller);
      d.addEventListener("toggle", () => { if (d.open && !d._argd.l) choisir(CARTES[cle][0]); });
    });
  }
  // contrôle : chaque passage a ses états, ses étapes (n − 1), ses sources ; attendu []
  function controle() {
    const pb = [];
    Object.keys(P).forEach((id) => {
      const p = P[id];
      if (p.etapes.length !== p.etats.length - 1) pb.push(id + " : étapes ≠ états − 1");
      if (!N[p.de] || !N[p.vers]) pb.push(id + " : case inconnue");
      p.src.forEach((n) => { if (!SRC[n]) pb.push(id + " : source " + n); });
      p.etats.forEach((e, i) => { if (!(hauteurs(e.items) > 0 && hauteurs(e.items) < H - 4)) pb.push(id + " : hauteur état " + i); });
      if (p.reaction && !equation(p.reaction)) pb.push(id + " : réaction introuvable");
    });
    Object.keys(CARTES).forEach((c) => CARTES[c].forEach((id) => { if (!P[id]) pb.push(c + " : " + id); }));
    return pb;
  }
  window.ArgilesDevenir = { html, monter, controle, PASSAGES: P, SRC };
})();
