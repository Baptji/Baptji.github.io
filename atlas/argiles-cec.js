// ============ La CEC en image (tâche G.2, 06/10/2026) ============
// Demande (feuille de chantiers, G.2) : rendre les grandeurs parlantes — ce que veut dire « 3 cmol⁺/kg », quels cations une
// argile retient (Ca²⁺, Mg²⁺, K⁺, Na⁺, H⁺, Al³⁺), l'équivalent en kg par hectare, et une vue microscopique d'un feuillet avec
// ses cations échangeables.
// Une carte « Ce que retient une argile : la CEC » sur les 11 fiches d'argiles (renderArgile) et les pages d'espèces
// (argiles-especes-page.js). Chargé avant app.js ; API : CecSchema.carte({ fiche, nom, cec, espece }) → HTML ;
// CecSchema.monter(racine) → lance l'animation et branche les réglages ; CecSchema.sourcesLi() → <li> des sources ;
// CecSchema.controle() → [] si chaque schéma est équilibré (charges des sites = charges des cations échangeables).
// Sources : Baize D. (2000), Guide des analyses en pédologie, 2ᵉ éd., INRA (chap. 11 à 13 : définition, 1 mé/100 g =
// 1 cmol⁺/kg, origines des charges, CEC des argiles d'après Dejou et al., matières organiques 150–300, allophanes 100–200,
// masses par milliéquivalent, garniture du planosol de Héry p. 116, seuil de pH 5 pour l'aluminium, conversions du potassium) ;
// ordre de rétention : UBC SoilWeb, « Adsorption of Ions ». Calcul de la CEC à partir de la charge du feuillet : CEC (cmol⁺/kg)
// = charge par O₁₀(OH)₂ ÷ masse molaire × 100 000 (masses molaires recalculées ici).
(function () {
  "use strict";
  const fr = (x, n = 1) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: n }).format(x);
  const fr2 = (x) => new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 2 }).format(x);
  const r1 = (x) => Math.round(x * 10) / 10;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lisse = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
  // dans le texte : pas de retour à la ligne dans « 1 170 », ni avant une unité
  const insec = (s) => String(s).replace(/(\d) (?=\d{3}\b)/g, "$1 ").replace(/ (cmol⁺|g|kg|t|%|nm|cm)(?=[\s,.;:)/]|$)/g, " $1");

  // ─────────── les cations : masse d'une mole de charges (g), d'après Baize 2000 (mé → g ×10 par kg) ───────────
  const ION = {
    Ca: { lab: "Ca²⁺", z: 2, c: "#3566b0", g: 20.04, nom: "calcium" },
    Mg: { lab: "Mg²⁺", z: 2, c: "#3f8a5c", g: 12.15, nom: "magnésium" },
    K: { lab: "K⁺", z: 1, c: "#7a5fb0", g: 39.10, nom: "potassium" },
    Na: { lab: "Na⁺", z: 1, c: "#6d7178", g: 22.99, nom: "sodium" },
    Al: { lab: "Al³⁺", z: 3, c: "#2f3b40", g: 8.99, nom: "aluminium" },
    H: { lab: "H⁺", z: 1, c: "#c0392b", g: 1.008, nom: "hydrogène" },
  };
  const ORDRE_IONS = ["Ca", "Mg", "K", "Na", "Al", "H"];

  // ─────────── dessin (même code couleur que « Sa structure en feuillets » de la fiche) ───────────
  const W = 640, X0 = 24, X1 = 400;          // particule de X0 à X1 (≈ 8 nm à 50 px par nanomètre)
  const COUL = { T: "#d9a441", O: "#b4552e", B: "#7f9f7a", eau: "#a9cbe8", trait: "#5b4a3c", papier: "#f6f4ee", sol: "#e7f0f7" };
  const SOL = { x: 436, y: 14, w: 192, h: 206 };   // l'eau du sol, à droite
  const sigleMoins = (x, y) => `<g class="cec-moins"><circle cx="${r1(x)}" cy="${r1(y)}" r="4.6" fill="#fff" stroke="#3a2a24" stroke-width=".8"/><path d="M${r1(x - 2.4)} ${r1(y)}h4.8" stroke="#3a2a24" stroke-width="1.3"/></g>`;
  const siglePlus = (x, y) => `<g><circle cx="${r1(x)}" cy="${r1(y)}" r="4.6" fill="#fff" stroke="#2f5a2f" stroke-width=".8"/><path d="M${r1(x - 2.4)} ${r1(y)}h4.8M${r1(x)} ${r1(y - 2.4)}v4.8" stroke="#2f5a2f" stroke-width="1.3"/></g>`;
  // feuillet tétraédrique (pointes vers le feuillet octaédrique : vers le bas si `bas`), octaédrique, brucitique
  function feuilletT(y, h, bas, x0 = X0, x1 = X1) {
    let s = `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" fill="${COUL.T}" opacity=".28"/>`;
    for (let x = x0; x + 20 <= x1 + 0.5; x += 22) {
      s += bas ? `<polygon points="${x + 1},${y + 1} ${x + 21},${y + 1} ${x + 11},${y + h - 1}" fill="${COUL.T}"/>`
        : `<polygon points="${x + 1},${y + h - 1} ${x + 21},${y + h - 1} ${x + 11},${y + 1}" fill="${COUL.T}"/>`;
    }
    return s;
  }
  function feuilletO(y, h, x0 = X0, x1 = X1) {
    let s = `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" fill="${COUL.O}" opacity=".25"/>`;
    for (let x = x0; x + 20 <= x1 + 0.5; x += 22) s += `<polygon points="${x + 11},${y + 1} ${x + 21},${y + h / 2} ${x + 11},${y + h - 1} ${x + 1},${y + h / 2}" fill="${COUL.O}"/>`;
    return s;
  }
  const feuilletB = (y, h) => `<rect x="${X0}" y="${y + 1}" width="${X1 - X0}" height="${h - 2}" rx="3" fill="${COUL.B}"/>`;
  // couche d'eau entre deux feuillets (molécules en quinconce, toujours au même endroit : rien ne tremble)
  function eau(y, h, x0 = X0, x1 = X1) {
    let s = "";
    const lignes = h >= 26 ? [y + h * 0.28, y + h * 0.72] : [y + h / 2];
    lignes.forEach((yy, i) => { for (let x = x0 + 8 + i * 9; x < x1 - 4; x += 18) s += `<circle cx="${x}" cy="${r1(yy)}" r="2.6" fill="${COUL.eau}"/>`; });
    return s;
  }
  // un cation (hydraté : entouré d'un anneau d'eau)
  function ionHTML(cle, x, y, o = {}) {
    const I = ION[cle], r = cle === "H" ? 5.5 : I.z === 1 ? 8 : 9;
    const halo = o.hydrate ? `<circle r="${r + 5}" fill="none" stroke="${COUL.eau}" stroke-width="3.2" stroke-dasharray="2.4 2.2"/>` : "";
    return `<g class="cec-ion"${o.id ? ` data-ion="${o.id}"` : ""} transform="translate(${r1(x)} ${r1(y)})">${halo}<circle r="${r}" fill="${I.c}"/>
      <text y="${cle === "H" ? 2.4 : 3}" text-anchor="middle" class="cec-ion-t${cle === "H" ? " cec-petit" : ""}">${I.lab}</text></g>`;
  }
  const etiquette = (x, y, s, a = "start") => `<text x="${r1(x)}" y="${r1(y)}" class="fa-lab fa-petit cec-etq" text-anchor="${a}">${s}</text>`;

  // ─────────── les schémas, famille par famille ───────────
  // Chaque modèle donne : svg (fond fixe), sites (nombre de charges − portant des cations échangeables), ions échangeables
  // fixes, et l'échange animé : deux K⁺ (k1, k2) qui partent, un Ca²⁺ qui prend leur place (milieu des deux sites), en
  // passant par `entree` quand l'échange se fait ENTRE les feuillets.
  function couchesTOT(y, o) {   // un feuillet 2:1 de 48 px (≈ 0,96 nm) ; o.charges : "O" ou "T"
    let s = feuilletT(y, 16, true) + feuilletO(y + 16, 16) + feuilletT(y + 32, 16, false);
    return s;
  }
  const MODELES = {
    // smectite : charges dans le feuillet octaédrique (montmorillonite), eau et cations entre les feuillets
    gonflante: () => {
      const yL1 = 50, yI = 98, hI = 30, yL2 = yI + hI;
      let s = couchesTOT(yL1) + eau(yI, hI) + couchesTOT(yL2);
      const xs = [57, 123, 189, 255, 321, 387].map((x) => x - 10);
      xs.forEach((x) => { s += sigleMoins(x, yL1 + 24) + sigleMoins(x, yL2 + 24); });
      const yIon = yI + hI / 2;
      return {
        svg: s, sites: 12, H: 252,
        fixes: [["Ca", 100, 34, true], ["K", 250, 34, true], ["Ca", 92, yIon, true], ["Mg", 196, yIon, true], ["Ca", 140, 192, true], ["Na", 300, 192, true]],
        k1: [318, yIon], k2: [366, yIon], entree: [X1 + 10, yIon], hydrate: true,
      };
    },
    // vermiculite : charges dans les feuillets tétraédriques, Mg²⁺ hydratés entre les feuillets
    vermiculite: () => {
      const yL1 = 52, yI = 100, hI = 24, yL2 = yI + hI;
      let s = couchesTOT(yL1) + eau(yI, hI) + couchesTOT(yL2);
      [40, 90, 140, 190, 240, 290, 340, 385].forEach((x, i) => {
        s += sigleMoins(x, i % 2 ? yL1 + 8 : yL1 + 40) + sigleMoins(x + 12, i % 2 ? yL2 + 40 : yL2 + 8);
      });
      const yIon = yI + hI / 2;
      return {
        svg: s, sites: 16, H: 252,
        fixes: [["Mg", 70, 36, true], ["K", 190, 36, true], ["Na", 300, 36, true], ["Mg", 60, yIon, true], ["Mg", 150, yIon, true], ["Ca", 235, yIon, true],
          ["Ca", 110, 190, true], ["Mg", 270, 190, true]],
        k1: [312, yIon], k2: [362, yIon], entree: [X1 + 10, yIon], hydrate: true,
      };
    },
    // interstratifié illite/smectite : un intervalle à K⁺ fixés, un intervalle hydraté
    interstratifie: () => {
      const L = (y) => feuilletT(y, 13, true) + feuilletO(y + 13, 14) + feuilletT(y + 27, 13, false);
      const y1 = 46, yK = 86, y2 = 96, yW = 136, hW = 28, y3 = yW + hW;
      let s = L(y1) + L(y2) + eau(yW, hW) + L(y3);
      [50, 116, 182, 248, 314, 380].forEach((x, i) => { s += sigleMoins(x - 8, y1 + 20) + sigleMoins(x - 8, y2 + 20) + sigleMoins(x - 8, y3 + 20); });
      for (let i = 0; i < 6; i++) s += ionHTML("K", 50 + i * 66 + 22, yK + 5, {});
      const yIon = yW + hW / 2;
      return {
        svg: s, sites: 12, H: 262, kFixes: 6,
        fixes: [["Ca", 110, 32, true], ["K", 270, 32, true], ["Ca", 92, yIon, true], ["Mg", 196, yIon, true], ["Ca", 150, 218, true], ["Na", 300, 218, true]],
        k1: [318, yIon], k2: [366, yIon], entree: [X1 + 10, yIon], hydrate: true,
      };
    },
    // illite : K⁺ logés entre les feuillets, sans eau, non échangeables ; seules les faces externes échangent
    kfixe: () => {
      const yL1 = 50, yK = 98, hK = 12, yL2 = yK + hK;
      let s = couchesTOT(yL1) + couchesTOT(yL2);
      [52, 108, 164, 220, 276, 332, 388].forEach((x, i) => {
        s += ionHTML("K", x - 6, yK + hK / 2, {});
        s += sigleMoins(x - 28, i % 2 ? yL1 + 40 : yL2 + 8);
      });
      [120, 300].forEach((x) => { s += sigleMoins(x, yL1 + 8); });
      [150, 330].forEach((x) => { s += sigleMoins(x, yL2 + 40); });
      return {
        svg: s, sites: 4, H: 236, kFixes: 7,
        fixes: [["Ca", 240, 176, true]],
        k1: [300, 34], k2: [356, 34], hydrate: true, dessus: true,
      };
    },
    // kaolinite, serpentine : feuillets T-O neutres tenus par des liaisons hydrogène ; charges aux bordures seulement
    tO: () => {
      let s = "";
      const ys = [44, 82, 120, 158];
      ys.forEach((y, i) => {
        s += feuilletT(y, 15, false) + feuilletO(y + 15, 17);
        if (i < ys.length - 1) for (let x = X0 + 6; x < X1; x += 12) s += `<line x1="${x}" y1="${y + 33}" x2="${x}" y2="${y + 37}" stroke="#8f897d" stroke-width="1" stroke-dasharray="1.2 1.6"/>`;
        s += sigleMoins(X1 + 2, y + 16);
      });
      return {
        svg: s, sites: 4, H: 236, bordure: true,
        fixes: [["Ca", X1 + 16, 155, true]],
        k1: [X1 + 16, 60], k2: [X1 + 16, 98], hydrate: true,
      };
    },
    // chlorite : feuillets chargés, compensés par le feuillet brucitique (positif) ; restent les bordures
    chlorite: () => {
      const yL1 = 50, yB = 98, hB = 22, yL2 = yB + hB;
      let s = couchesTOT(yL1) + feuilletB(yB, hB) + couchesTOT(yL2);
      [50, 100, 150, 200, 250, 300, 350, 390].forEach((x, i) => {
        s += sigleMoins(x - 14, i % 2 ? yL1 + 40 : yL2 + 8) + siglePlus(x - 14, yB + hB / 2);
      });
      s += sigleMoins(X1 + 2, yL1 + 24) + sigleMoins(X1 + 2, yL1 + 44) + sigleMoins(X1 + 2, yL2 + 30);
      return {
        svg: s, sites: 3, H: 236, bordure: true, brucite: 8,
        fixes: [["Na", X1 + 16, yL2 + 30, true]],
        k1: [X1 + 16, yL1 + 18], k2: [X1 + 16, yL1 + 46], hydrate: true,
      };
    },
    // talc, pyrophyllite : feuillets neutres, rien entre eux ; quelques charges de bordure
    neutre: () => {
      const yL1 = 60, yL2 = 116;
      let s = couchesTOT(yL1) + couchesTOT(yL2);
      s += `<text x="${(X0 + X1) / 2}" y="${yL1 + 55}" text-anchor="middle" class="fa-lab fa-petit cec-etq">rien entre les feuillets</text>`;
      s += sigleMoins(X1 + 2, yL1 + 20) + sigleMoins(X1 + 2, yL1 + 34);
      return { svg: s, sites: 2, H: 220, bordure: true, fixes: [], k1: [X1 + 16, yL1 + 12], k2: [X1 + 16, yL1 + 40], hydrate: true };
    },
    // sépiolite, palygorskite : rubans T-O-T en damier, canaux pleins d'eau ; charges en surface des fibres
    rubans: () => {
      let s = "";
      const ruban = (x, y, w) => feuilletT(y, 12, true, x, x + w) + feuilletO(y + 12, 14, x, x + w) + feuilletT(y + 26, 12, false, x, x + w);
      for (let i = 0; i < 4; i++) s += ruban(X0 + i * 96, 60, 80) + ruban(X0 + 48 + i * 96, 108, i < 3 ? 80 : 56);
      for (let i = 0; i < 4; i++) {
        s += `<rect x="${X0 + 80 + i * 96}" y="61" width="16" height="36" rx="3" fill="${COUL.eau}" opacity=".7"/>`;
        if (i < 3) s += `<rect x="${X0 + 128 + i * 96}" y="109" width="16" height="36" rx="3" fill="${COUL.eau}" opacity=".7"/>`;
      }
      s += `<rect x="${X0}" y="109" width="48" height="36" rx="3" fill="${COUL.eau}" opacity=".7"/>`;
      s += sigleMoins(300, 62) + sigleMoins(356, 62) + sigleMoins(150, 144) + sigleMoins(200, 144);
      return { svg: s, sites: 4, H: 220, fixes: [["Ca", 176, 162, true]], k1: [300, 44], k2: [356, 44], hydrate: true, canaux: true, dessus: true };
    },
    // allophane : sphérules creuses (≈ 3,5–5 nm), charges variables portées par des –OH de surface
    spheres: () => {
      let s = "";
      const sph = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COUL.O}" stroke-width="9"/>
        <circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="none" stroke="${COUL.T}" stroke-width="6"/>
        <circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="${COUL.eau}" opacity=".35"/>`;
      s += sph(120, 118, 82) + sph(298, 118, 82);
      const site = (cx, cy, r, a, f) => { const x = cx + (r + 4.5) * Math.cos(a), y = cy + (r + 4.5) * Math.sin(a); return f(x, y); };
      s += site(298, 118, 82, -0.42, sigleMoins) + site(298, 118, 82, 0.42, sigleMoins);
      s += site(120, 118, 82, -1.95, sigleMoins) + site(120, 118, 82, -1.45, sigleMoins);
      s += site(120, 118, 82, 2.2, siglePlus) + site(298, 118, 82, 1.9, siglePlus);
      const pos = (cx, cy, r, a) => [cx + (r + 18) * Math.cos(a), cy + (r + 18) * Math.sin(a)];
      return { svg: s, sites: 4, H: 232, fixes: [["Ca", ...pos(120, 118, 82, -1.7), true]], k1: pos(298, 118, 82, -0.42), k2: pos(298, 118, 82, 0.42), hydrate: true, plus: 2, att: [476, 118], v2: [424, 176] };
    },
  };
  const TYPE = {
    smectites: "gonflante", vermiculite: "vermiculite", interstratifies: "interstratifie", illite: "kfixe", glauconite: "kfixe",
    kaolinite: "tO", serpentines: "tO", chlorite: "chlorite", talc: "neutre", sepiolite: "rubans", allophane: "spheres",
  };

  // ─────────── textes, famille par famille ───────────
  // calc : { x (charge par O₁₀(OH)₂), formule, M (g/mol) } → CEC calculée, à comparer à la fourchette mesurée de la fiche
  const TXT = {
    gonflante: {
      legende: "Montmorillonite : dans le feuillet octaédrique, une partie des Al³⁺ cède sa place à des Mg²⁺, qui portent une charge de moins ; chaque substitution laisse une charge négative (−). L'eau pénètre entre les feuillets, où les cations restent entourés de molécules et peuvent s'échanger, aussi bien sur les faces internes que sur les faces externes. Dans la beidellite et la saponite, les substitutions touchent les feuillets tétraédriques, où Al³⁺ prend la place de Si⁴⁺.",
      calc: { x: 0.33, formule: "Na₀,₃₃(Al₁,₆₇Mg₀,₃₃)Si₄O₁₀(OH)₂", M: 367, nom: "montmorillonite" },
      verdict: "Ces charges sont toutes accessibles, y compris celles des faces internes : le calcul concorde avec les mesures.",
    },
    vermiculite: {
      legende: "Vermiculite : ses charges proviennent des feuillets tétraédriques, où Al³⁺ remplace Si⁴⁺, et sont plus nombreuses que dans une smectite. Entre les feuillets se logent des Mg²⁺ enveloppés de deux couches d'eau, qui s'échangent.",
      calc: { x: 0.6, formule: "Mg₀,₃(Mg₃)(Si₃,₄Al₀,₆)O₁₀(OH)₂", M: 386, nom: "vermiculite peu chargée", x2: 0.9, M2: 389 },
      verdict: "Le calcul excède les mesures, car, dans les sols acides, l'aluminium se loge entre les feuillets et obstrue une partie des sites (Baize 2000).",
    },
    interstratifie: {
      legende: "Interstratifié illite-smectite : des intervalles d'illite, où le K⁺ fixé ne s'échange pas, se succèdent à des intervalles de smectite, hydratés et échangeables. La CEC dépend donc de la proportion de feuillets gonflants.",
      verdict: "Située entre la smectite (≈ 90) et l'illite (10 à 40), elle affiche 30 à 90 selon la proportion des deux minéraux.",
    },
    kfixe: {
      legende: "Illite : les feuillets sont fortement chargés (Al³⁺ remplaçant Si⁴⁺), mais cette charge est compensée par des K⁺ dépourvus d'eau, logés dans les cavités des feuillets, qui ne s'échangent pas dans le sol (Baize 2000). Seules les faces externes et les bordures participent à l'échange. Une particule réelle empile bien davantage de feuillets que ce dessin, si bien que la part des faces externes y est encore plus réduite.",
      calc: { x: 0.75, formule: "K₀,₇₅(Al₁,₇₅Mg₀,₂₅)(Si₃,₅Al₀,₅)O₁₀(OH)₂", M: 388, nom: "illite" },
      verdict: "La mesure donne 10 à 40 : presque toute la charge est retenue par le potassium fixé, qui ne compte pas dans l'échange.",
    },
    tO: {
      legende: "Kaolinite : les feuillets ne comportent aucune substitution et restent neutres ; des liaisons hydrogène (pointillés) les unissent. Les charges se concentrent sur les bords rompus, où des OH perdent leur H⁺, et leur nombre varie avec le pH (Baize 2000).",
      calc: { x: 0, formule: "Al₂Si₂O₅(OH)₄", M: 258, nom: "kaolinite", zero: true },
      verdict: "Le modèle théorique aboutit à zéro ; or les 3 à 15 cmol⁺/kg mesurés viennent entièrement des bordures.",
    },
    chlorite: {
      legende: "Chlorite : les feuillets sont chargés, mais un feuillet brucitique, porteur de charges positives (+), s'intercale entre eux et compense ces charges. Seules les bordures et les faces externes retiennent encore des cations échangeables.",
      verdict: "Sa CEC est donc faible, à l'image de celle d'une illite.",
    },
    neutre: {
      legende: "Talc et pyrophyllite : leurs feuillets ne subissent aucune substitution, donc restent neutres, et rien ne les sépare. Quelques liaisons rompues en bordure retiennent seules des cations.",
      calc: { x: 0, formule: "Mg₃Si₄O₁₀(OH)₂", M: 379, nom: "talc", zero: true },
      verdict: "Le modèle théorique aboutit à zéro ; or les 1 à 5 cmol⁺/kg mesurés viennent des bordures.",
    },
    rubans: {
      legende: "Chez la sépiolite et la palygorskite, des rubans 2:1 disposés en damier délimitent des canaux pleins d'eau. Peu de substitutions affectent les rubans : les charges se trouvent avant tout en surface des fibres et sur leurs bords.",
      verdict: "",
    },
    spheres: {
      legende: "Allophane : aucun empilement de feuillets, mais de petites sphères creuses de 3,5 à 5 nm, dont la paroi est faite d'aluminium à l'extérieur et de silicium à l'intérieur. Des groupes OH en surface portent les charges : ils libèrent leur H⁺ lorsque le pH s'élève (−), et en fixent un lorsqu'il baisse (+). Les sites positifs captent des anions, tel le phosphate.",
      verdict: "Au pH du sol, sa valeur reste modeste ; mesurée à pH 7 ou au-delà, elle atteint 100 à 200 cmol⁺/kg (Baize 2000).",
    },
  };

  // ─────────── garniture d'un vrai sol : planosol de Champagne humide, profil de Héry (Baize 2000, p. 116) ───────────
  // milliéquivalents pour 100 g = cmol⁺/kg ; le « reste » = T − (Ca + Mg + K + Na + Al) : surtout des H⁺, non dosés
  const GARNITURES = [
    { id: "A1", nom: "En surface, sous l'herbe (A₁, 0 à 5 cm)", T: 18.1, Ca: 3.90, Mg: 1.47, K: 0.47, Na: 0.04, Al: 1.6 },
    { id: "B", nom: "Horizon acide et argileux ((B), 60 à 75 cm)", T: 23.0, Ca: 4.80, Mg: 1.99, K: 0.76, Na: 0.29, Al: 15.0 },
    { id: "C2", nom: "En profondeur (C₂, 180 à 190 cm)", T: 13.2, Ca: 7.50, Mg: 1.93, K: 0.36, Na: 0.39, Al: 1.7 },
  ];
  const partsDe = (g) => {
    const p = {}; ["Ca", "Mg", "K", "Na", "Al"].forEach((k) => { p[k] = g[k] / g.T; });
    p.H = Math.max(0, 1 - Object.values(p).reduce((s, v) => s + v, 0));
    return p;
  };

  // ─────────── la carte ───────────
  function carte(o) {
    const f = o.fiche;
    if (!f || f.cecMin == null) return "";
    const type = TYPE[f.id] || "gonflante";
    const cec = o.cec != null && o.cec > 0 ? o.cec : (f.cecMin + f.cecMax) / 2;
    const nom = o.nom || f.nom.split(" (")[0];
    const d = { type, cec, cmin: Math.min(f.cecMin, cec), cmax: Math.max(f.cecMax, cec), nom, surf: f.surfMin != null ? (f.surfMin + f.surfMax) / 2 : null };
    const m = MODELES[type]();
    const T = TXT[type];
    const lisible = cec < 10 ? fr(cec, 1) : fr(cec, 0);
    const legendeIons = ORDRE_IONS.filter((k) => k !== "Al").map((k) => `<span class="key"><i style="background:${ION[k].c};border-radius:50%"></i>${ION[k].lab}</span>`).join("")
      + `<span class="key"><i class="cec-cle-moins"></i>charge négative de l'argile</span>`
      + (m.plus || m.brucite ? `<span class="key"><i class="cec-cle-plus"></i>charge positive</span>` : "")
      + `<span class="key"><i style="background:${COUL.eau};border-radius:50%"></i>eau</span>`
      + `<span class="key"><i style="background:${COUL.T}"></i>tétraèdres (Si, Al)</span><span class="key"><i style="background:${COUL.O}"></i>octaèdres (Al, Mg, Fe)</span>`
      + (m.brucite ? `<span class="key"><i style="background:${COUL.B}"></i>feuillet brucitique</span>` : "");
    // repliée par défaut, un clic sur le titre la déplie (07/10/2026, sa demande) ; même présentation que les cartes
    // repliées des fiches roches (.replie-travaux)
    return `<details class="card cec-carte replie-travaux" data-cec='${JSON.stringify(d)}'>
      <summary><h2>Ce que retient une argile : la CEC</h2></summary>
      <p class="sub">Ces charges négatives attirent des cations de l'eau du sol (Ca²⁺, Mg²⁺, K⁺, Na⁺, H⁺, Al³⁺) sans les immobiliser : à charge égale, un autre cation peut les occuper. La CEC chiffre ces charges, soit environ ${lisible} centimoles par kilogramme de ${esc(nom.toLowerCase())}.</p>
      <h3>À l'échelle microscopique</h3>
      <div class="cec-scene"><svg viewBox="0 0 ${W} ${m.H}" role="img" aria-label="Schéma : cations échangeables autour des feuillets de ${esc(nom)}">${sceneSVG(m)}</svg></div>
      <div class="cec-info"><p class="cec-etape" aria-live="polite"></p><button type="button" class="fa-lecture cec-lecture"></button></div>
      <div class="struct-legend cec-legende">${legendeIons}</div>
      <p class="pl-note">${insec(T.legende)} Barre d'échelle : 1 nanomètre, soit un millionième de millimètre.</p>

      <h3>Que signifie « ${lisible} cmol⁺/kg » ?</h3>
      ${sensHTML(d, m, T)}

      <h3>Quels cations, et lesquels sont les mieux retenus ?</h3>
      ${cationsHTML()}
      ${autresHTML()}

      <h3>Floculer ou disperser</h3>
      ${floculationHTML(d)}

      <h3>Sur un champ : combien de kilos par hectare ?</h3>
      ${hectareHTML(d)}

      <details class="pl-pli cec-pli"><summary>Méthodes de mesure de la CEC</summary>
        <p>On mesure la CEC par échange : un lavage à l'aide d'une solution ne contenant qu'un seul cation, en large excès, déplace tous les cations présents. Le réactif le plus employé en France est l'ammonium (NH₄⁺) à pH 7 (méthode Metson, norme NF X 31‑130) ; la cobaltihexammine, elle, agit au pH du sol. On dose ensuite les cations expulsés, qui donnent la garniture du sol.</p>
        <p>Autrefois exprimés en milliéquivalents pour 100 g (mé/100 g), les résultats valent exactement 1 cmol⁺/kg pour 1 mé/100 g. Mesurée à pH 7, la CEC d'un sol acide est trop élevée : les charges liées au pH se révèlent pendant la mesure (Baize 2000).</p>
      </details>
    </details>`;
  }

  // ─────────── trajets de l'échange ───────────
  // L'eau du sol (à droite) est rangée en bandes pour que rien ne se croise : les deux K⁺ partent vers le haut (s1, s2),
  // le Ca²⁺ arrive par le bas, attend en `att` que les K⁺ soient sortis, puis gagne leur place (milieu des deux sites).
  // Entre les feuillets, tout passe par l'ouverture `entree` sur la bordure de la particule.
  function trajets(m) {
    const s1 = [560, 46], s2 = [604, 84], dep = [520, Math.min(150, m.H - 74)];
    const cible = [(m.k1[0] + m.k2[0]) / 2, (m.k1[1] + m.k2[1]) / 2];
    const E = m.entree;
    let att, k1, k2, ca;
    if (E) {
      att = [E[0] + 46, E[1] + 36];
      const v = [E[0] + 30, E[1] - 15];
      k1 = [m.k1, E, v, s1]; k2 = [m.k2, E, v, s2];
      ca = [att, [E[0] + 16, E[1]], E, cible];
    } else if (m.dessus) {              // échange sur la face du dessus
      att = [452, cible[1] + 62];
      k1 = [m.k1, [m.k1[0] + 28, m.k1[1] - 18], s1]; k2 = [m.k2, [m.k2[0] + 28, m.k2[1] - 18], s2];
      ca = [att, [cible[0] + 64, cible[1] - 14], cible];
    } else {                            // échange sur la bordure (paire verticale)
      att = m.att || [cible[0] + 56, Math.min(cible[1] + 50, m.H - 90)];
      k1 = [m.k1, m.v1 || [m.k1[0] + 24, m.k1[1] - 12], s1]; k2 = [m.k2, m.v2 || [m.k2[0] + 30, m.k2[1] - 8], s2];
      ca = [att, cible];
    }
    return { dep, att, cible, k1, k2, ca, s1, s2 };
  }

  function sceneSVG(m) {
    const tr = trajets(m);
    const bas = m.H - 28;
    let s = `<rect x="0" y="0" width="${W}" height="${m.H}" fill="${COUL.papier}"/>`;
    // l'eau du sol, à droite, avec quelques ions libres (toujours les mêmes, hors des trajets)
    s += `<rect x="${SOL.x}" y="${SOL.y}" width="${SOL.w}" height="${bas - SOL.y}" rx="10" fill="${COUL.sol}"/>`;
    s += `<text x="${SOL.x + 10}" y="${SOL.y + 15}" class="fa-lab cec-etq">eau du sol</text>`;
    s += ionHTML("H", 614, 30, {}) + ionHTML("Mg", 616, 128, { hydrate: true });
    // un anion : négatif comme l'argile, il n'est pas retenu
    const yn = bas - 36;
    s += `<g transform="translate(588 ${yn})"><circle r="10.5" fill="#fff" stroke="#3a2a24" stroke-width="1"/><text y="3" text-anchor="middle" class="cec-ion-t cec-anion">NO₃⁻</text></g>`;
    s += `<text x="588" y="${yn + 23}" text-anchor="middle" class="fa-lab fa-petit cec-etq">pas retenu</text>`;
    s += m.svg;
    // ions échangeables fixes, puis les trois qui bougent (dessinés en dernier, au-dessus)
    m.fixes.forEach(([k, x, y, h]) => { s += ionHTML(k, x, y, { hydrate: h }); });
    s += ionHTML("K", m.k1[0], m.k1[1], { id: "k1", hydrate: m.hydrate }) + ionHTML("K", m.k2[0], m.k2[1], { id: "k2", hydrate: m.hydrate });
    s += ionHTML("Ca", tr.dep[0], tr.dep[1], { id: "ca", hydrate: true });
    if (m.bordure) s += etiquette(X1 - 4, 30, "bordure rompue : c'est là que se trouvent les charges", "end");
    if (m.kFixes) s += etiquette(X0, m.H - 34, "K⁺ déshydraté entre les feuillets : il est retenu et ne s'échange pas");
    if (m.canaux) s += etiquette(X0, 188, "canaux pleins d'eau entre les rubans");
    // barre d'échelle : 1 nm = 50 px
    s += `<path d="M${X0} ${m.H - 14}h50" stroke="#3a2a24" stroke-width="1.6"/><path d="M${X0} ${m.H - 18}v8M${X0 + 50} ${m.H - 18}v8" stroke="#3a2a24" stroke-width="1"/>`;
    s += `<text x="${X0 + 58}" y="${m.H - 10}" class="fa-lab fa-petit cec-etq">1 nm</text>`;
    // bilan des charges échangeables
    const plus = m.fixes.reduce((t, [k]) => t + ION[k].z, 0) + 2;
    s += `<text x="${SOL.x + SOL.w}" y="${m.H - 10}" text-anchor="end" class="fa-lab fa-petit cec-etq cec-bilan">sites d'échange représentés : ${m.sites} charges − · cations échangeables : ${plus} charges +</text>`;
    return s;
  }

  // « que veut dire » : nombre de charges, grammes de chaque cation, calcul à partir de la charge du feuillet
  function sensHTML(d, m, T) {
    const c = d.cec, nom = esc(d.nom.toLowerCase());
    const charges = c / 100 * 6.022e23 / 1e18;   // en milliards de milliards
    const lignesG = ORDRE_IONS.map((k) => ({ k, g: c / 100 * ION[k].g }));
    const gmax = Math.max(...lignesG.map((l) => l.g));
    const grammes = lignesG.map(({ k, g }) => `<div class="nb-litre"><span><i class="cec-pastille" style="background:${ION[k].c}"></i>${ION[k].nom} (${ION[k].lab})</span>
        <i><b style="width:${(g / gmax * 100).toFixed(1)}%;background:${ION[k].c}"></b></i><span>${g < 1 ? fr(g, 2) : fr(g, 1)} g</span></div>`).join("");
    const parNm2 = d.surf && /gonflante|vermiculite|interstratifie/.test(d.type) ? (d.surf * 1e3 * 1e18) / (c / 100 * 6.022e23) : null;
    let calc = "";
    if (T.calc) {
      const k = T.calc;
      const v = k.x / k.M * 1e5;
      calc = k.zero
        ? `<p><b>D'où vient ce nombre ?</b> Dans une argile, la CEC « de base » se calcule à partir des remplacements dans les feuillets : charge par formule ÷ masse molaire × 100 000. Pour la ${k.nom}, ${k.formule}, il n'y a aucun remplacement : la charge vaut 0. ${insec(T.verdict)}</p>`
        : `<p><b>D'où vient ce nombre :</b> il se calcule à partir des substitutions dans les feuillets : CEC = charge par formule ÷ masse molaire × 100 000. Pour une ${k.nom}, ${k.formule} : ${fr(k.x, 2)} charge pour ${fr(k.M, 0)} g/mol, soit ${fr(k.x, 2)} ÷ ${fr(k.M, 0)} × 100 000 ≈ <b>${fr(v, 0)} cmol⁺/kg</b>${k.x2 ? ` (≈ ${fr(k.x2 / k.M2 * 1e5, 0)} avec ${fr(k.x2, 1)} charge, valeur haute de la fourchette)` : ""}. Valeur mesurée sur la fiche : ${fr(d.cmin, 0)} à ${fr(d.cmax, 0)}. ${insec(T.verdict)}</p>`;
    } else if (T.verdict) calc = `<p><b>D'où vient ce nombre ?</b> ${insec(T.verdict)}</p>`;
    return `<div class="tiles cec-tuiles">
        <div class="tile"><div class="lab">Nombre de charges négatives dans 1 kg de ${nom}</div><div class="val">${insec(fr2(charges))} <small>milliards de milliards</small></div></div>
        <div class="tile"><div class="lab">« cmol⁺ » : un centième de mole de charges positives</div><div class="val">${fr(c / 100, 3)} <small>mole de charges par kg</small></div></div>
        ${parNm2 ? `<div class="tile"><div class="lab">Une charge sur ses faces tous les</div><div class="val">≈ ${fr(parNm2, 1)} <small>nm² (soit un carré d'environ ${fr(Math.sqrt(parNm2), 1)} nm de côté)</small></div></div>` : ""}
      </div>
      <p class="nb-titre">Quantité retenue par 1 kg de ${nom} si chaque place accueillait le même cation</p>
      <div class="nb-litres cec-grammes">${grammes}</div>
      <p class="pl-note">Chaque place équivaut à une charge : un Ca²⁺, à deux charges, occupe deux places, un K⁺ n'en occupe qu'une. D'où le fait que la CEC compte des charges, et non des ions. 1 cmol⁺ de calcium pèse 0,20 g, de potassium 0,39 g, d'aluminium 0,09 g (Baize 2000).</p>
      ${calc}`;
  }

  // ordre de rétention : à charge égale, l'ion le moins entouré d'eau s'approche le plus près de la surface
  function cationsHTML() {
    const L = [
      ["Al", "L'aluminium, avec 3 charges, est le cation le plus solidement fixé. Il se libère de l'argile lorsque celle-ci s'acidifie. Dès qu'un sol descend sous pH 5 (mesuré dans l'eau), cet aluminium échangeable devient toxique pour le blé, l'orge, le maïs ou la luzerne (Baize 2000)."],
      ["Ca", "2 charges ; il domine dans les sols non acides et provient du calcaire, des plagioclases, des pyroxènes et du chaulage des champs (Baize 2000)."],
      ["Mg", "Porteur également de 2 charges, mais entouré de davantage d'eau que Ca²⁺ et donc un peu moins retenu : il provient de la dolomie, de l'olivine, des pyroxènes ou de la biotite, et peut rivaliser avec le calcium dans les roches riches en fer et en magnésium (serpentines, amphibolites) (Baize 2000)."],
      ["K", "1 charge. Nutriment majeur des plantes, il provient des feldspaths potassiques, des micas et des engrais. Il ne représente que quelques pour cent de la CEC (2 à 3 % dans le profil de Héry), mais c'est lui qui permet de juger le potassium « assimilable »."],
      ["Na", "C'est le cation le moins fermement retenu : 1 charge seulement, et une forte enveloppe d'eau. Il vient de l'albite, des embruns et du sel marin ; il ne prend le dessus que dans les sols salés (sols salsodiques)."],
      ["H", "L'hydrogène se distingue : fourni par la pluie chargée de CO₂, par les racines et par l'humus, il s'accroche directement aux oxygènes de l'argile et de la matière organique, qui le maintiennent avec fermeté (Baize 2000)."],
    ];
    return `<p class="cec-serie"><b>Al³⁺ &gt; Ca²⁺ &gt; Mg²⁺ &gt; K⁺ ≈ NH₄⁺ &gt; Na⁺</b> : un cation est d'autant mieux retenu qu'il est chargé ; à charge égale, celui qui s'entoure de moins d'eau approche davantage la surface et s'y maintient mieux.</p>
      <ul class="cec-ions">${L.map(([k, t]) => `<li><i class="cec-pastille" style="background:${ION[k].c}"></i><b>${ION[k].lab}</b> ${insec(t)}</li>`).join("")}</ul>
      <p class="pl-note">Les anions, tel le nitrate NO₃⁻, portent une charge négative comme l'argile : ils ne sont pas retenus et s'en vont avec l'eau d'infiltration. Cet ordre ne dit pas à lui seul qui l'emporte : un cation très concentré dans la solution du sol peut déloger un cation mieux retenu mais rare. C'est ce qu'obtient le chaulage (Ca²⁺) dans un sol acide.</p>`;
  }

  // les autres cations (07/10/2026, sa question : « y a-t-il d'autres ions que Ca²⁺ etc. ? »)
  function autresHTML() {
    const L = [
      ["NH₄⁺", "Il est retenu au même rang que K⁺. Il provient des engrais azotés et de la décomposition de la matière organique, jusqu'à ce que des bactéries le transforment en nitrate."],
      ["Mn²⁺, Fe²⁺", "Dans un sol engorgé, dépourvu d'oxygène, le manganèse et le fer réduits passent en solution et se fixent sur l'argile ; ils entrent alors dans la CEC effective (Baize 2000)."],
      ["Cu²⁺, Zn²⁺, Cd²⁺, Pb²⁺, Ni²⁺", "Des métaux à l'état de traces sont retenus en quantités infimes, d'autant plus fermement que le pH s'élève : au-delà de 6,5, la rétention du cadmium s'accentue fortement (Baize 2000)."],
      ["Cs⁺", "Le césium radioactif rejeté par Tchernobyl a été piégé dans les sols par les bords écartés des feuillets d'illite, où il se loge comme le potassium (Cremers et al. 1988)."],
    ];
    return `<p class="cec-serie" style="margin-top:12px"><b>D'autres cations aussi</b>, en quantités bien plus faibles :</p>
      <ul class="cec-ions cec-autres">${L.map(([k, t]) => `<li><b>${k}</b> ${insec(t)}</li>`).join("")}</ul>
      <p class="pl-note">Et quelques anions : là où la surface devient positive (oxydes de fer et d'aluminium, allophane, bords de la kaolinite en milieu acide), le phosphate est retenu à son tour. C'est la capacité d'échange anionique, rarement mesurée (Baize 2000).</p>`;
  }

  // ─────────── floculer ou disperser (07/10/2026, sa demande) ───────────
  // Le nuage de cations autour d'une particule (couche diffuse) : épais avec Na⁺ dans une eau peu salée → les particules se
  // repoussent (dispersées) ; mince avec Ca²⁺ ou dans l'eau de mer → elles se collent (floculées) ; en milieu acide, les bords
  // deviennent positifs et se collent aux faces (château de cartes : Tombácz et Szekeres 2006). Épaisseurs SCHÉMATIQUES.
  const AVEC_EAU_ENTRE = { gonflante: 1, interstratifie: 1 };
  function floculationHTML(d) {
    const kao = d.type === "tO";
    const choix = (cle, opts) => `<div class="cec-floc-ligne" role="group">${opts.map(([v, t], i) =>
      `<button type="button" class="chip${i === 0 ? " on" : ""}" data-floc-${cle}="${v}">${t}</button>`).join("")}</div>`;
    const kaoTexte = `<p>Elle peut donc se disperser : c'est la méthode même des laboratoires avant toute analyse granulométrique, avec de l'hexamétaphosphate de sodium, qui isole les cristaux de kaolinite, tandis que les illites, les vermiculites et surtout les smectites restent en petits paquets (Baize 2000). Les céramistes emploient le même principe pour fluidifier une barbotine de kaolin avec peu d'eau.</p>
        <p>Une argile n'a pas besoin d'écarter ses feuillets pour se disperser : ce sont les particules entières qui se repoussent ou se collent. Les feuillets d'une kaolinite restent unis par des liaisons hydrogène ; ce qui se sépare, ce sont ses cristaux.</p>
        <p>Elle le fait toutefois mal. Ses faces portent presque aucune charge ; ses bords, environ 20 % de sa surface, en portent, et leur signe change avec le pH (Jmal Ayadi et al. 2011). Sous pH 6 à 6,5 environ, les bords deviennent positifs et viennent se coller sur les faces des voisines, en château de cartes (Tombácz et Szekeres 2006). Son nuage d'ions étant si ténu, un peu de sel suffit à la floculer : une suspension de kaolin flocule dès 0,6 millimole de NaCl par litre (0,04 g par litre), et dès 0,04 millimole de CaCl₂, quinze fois moins. C'est souvent moins de sel qu'il n'en contient, l'eau du robinet comprise (Rommelfanger et al. 2022). Pour la maintenir dispersée, il faut un dispersant (phosphates, polyacrylates) qui se fixe sur ses bords (Jmal Ayadi et al. 2011). Dans la nature, une kaolinite est presque toujours floculée.</p>`;
    return `<p class="sub">Les cations ne demeurent pas tous collés à la surface d'une particule : attirés par ses charges négatives mais brassés par l'agitation thermique, ils constituent un nuage dont la densité décroît avec la distance (couche diffuse). Lorsque deux particules se rapprochent, leurs nuages se repoussent ; à très courte distance, l'attraction de van der Waals l'emporte et les réunit. Nuage épais, elles restent écartées et sont <b>dispersées</b> ; nuage mince, elles s'agglomèrent et <b>floculent</b>.</p>
      <div class="cec-floc-ctrl">
        <span>Cation qui garnit l'argile</span>${choix("c", [["Na", "Na⁺ (sodium)"], ["Ca", "Ca²⁺ (calcium)"]])}
        <span>Eau</span>${choix("e", [["douce", "eau de pluie, peu salée"], ["mer", "eau de mer"]])}
        <span>pH</span>${choix("p", [["neutre", "neutre à basique (7 à 8)"], ["acide", "acide (≈ 5)"]])}
      </div>
      <div class="cec-scene cec-floc-scene"><svg viewBox="0 0 640 214" role="img" aria-label="Deux particules d'argile et leur nuage de cations ; à droite, un bécher"></svg></div>
      <p class="cec-floc-verdict" aria-live="polite"></p>
      <p class="pl-note">Schéma : deux particules vues par la tranche, avec leur nuage de cations (épaisseurs exagérées : une plaquette réelle est des centaines de fois plus longue que son nuage). Une charge 1+ donne un nuage épais, une charge 2+ un nuage mince (UBC SoilWeb) ; le sel l'amincit davantage. Tous les réglages sont communs aux argiles, sauf pour la kaolinite, dont les chiffres figurent plus bas.</p>
      <p><b>En plein champ.</b> Une argile floculée crée des agrégats qui laissent circuler l'eau et l'air ; dispersée, elle colmate les pores, la surface durcit en croûte et l'eau ne pénètre plus. Le problème touche les sols sodiques : on parle d'horizon « sodique » quand le Na⁺ dépasse 15 % de la CEC, et d'horizon « à alcali » quand sa structure se dégrade et que le pH passe au-delà de 8,8 (Baize 2000). Ces sols se rencontrent en France dans les polders, les marais littoraux, les estuaires, mais aussi, loin de la mer, dans la vallée de la Seille près de Nancy et dans les « selins » de Limagne près de Clermont-Ferrand, où des eaux salées remontent (Baize 2000). Le remède est le gypse : chaque charge du Ca²⁺ chasse une charge de Na⁺, que la pluie entraîne ensuite (Dellavalle et Walworth 2020).</p>
      ${AVEC_EAU_ENTRE[d.type] ? `<p>Chez une smectite sodique, l'eau écarte les feuillets jusqu'à les isoler un à un (plus de 40 Å d'écart) ; une smectite calcique, elle, plafonne vers 19 Å et reste en paquets (Norrish 1954 ; voir l'état « Dans l'eau » de la structure 3D).</p>` : ""}
      ${kao ? `<h4 class="cec-kao-titre">Qu'en est-il d'une kaolinite, qui ne porte de cations que sur ses bords ?</h4>${kaoTexte}`
        : `<details class="pl-pli cec-pli"><summary>Qu'en est-il d'une kaolinite, qui ne porte de cations que sur ses bords ?</summary>${kaoTexte}</details>`}`;
  }

  // dessin : deux plaquettes (position, angle), leur nuage, du sel dans l'eau, un bécher
  // deux plaquettes face à face : seul leur écart change (dispersées → loin ; floculées → collées) ; en milieu acide, l'une
  // se dresse et pose son bord sur la face de l'autre
  const FLOC = {
    disperse: { a: [196, 48, 0], b: [214, 154, 0], L: 26, sel: 0, trouble: 1, plusBord: 0 },
    flocCa: { a: [196, 88, 0], b: [212, 106, 0], L: 11, sel: 0, trouble: 0, plusBord: 0 },
    flocMer: { a: [196, 90, 0], b: [208, 105, 0], L: 5, sel: 1, trouble: 0, plusBord: 0 },
    cartes: { a: [212, 170, 0], b: [196, 85, 90], L: 9, sel: 0, trouble: 0, plusBord: 1 },
  };
  const FRAC = [0.12, 0.55, 0.3, 0.82, 0.4, 0.68, 0.2, 0.9, 0.48, 0.74];
  // une plaquette en deux passes : d'abord les nuages des deux particules, puis les particules par-dessus (sinon les
  // cations d'un nuage passent sur l'autre particule quand elles se collent)
  function nuage(x, y, ang, k, o) {
    const cat = ION[o.cation], n = o.cation === "Ca" ? 5 : 10, L = o.L;
    let s = `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(ang)})">`;
    s += `<rect x="${r1(-75 - L)}" y="${r1(-6 - L)}" width="${r1(150 + 2 * L)}" height="${r1(12 + 2 * L)}" rx="${r1(L)}" fill="${cat.c}" opacity=".1"/>`;
    s += `<rect x="${r1(-75 - L / 2)}" y="${r1(-6 - L / 2)}" width="${r1(150 + L)}" height="${r1(12 + L)}" rx="${r1(L / 2)}" fill="${cat.c}" opacity=".12"/>`;
    // cations du nuage, plus serrés près de la surface (positions fixes : rien ne tremble)
    for (let i = 0; i < n; i++) {
      const xx = -70 + 140 * (i + 0.5) / n, f = FRAC[(i + k * 3) % FRAC.length], dz = 9 + (L - 2) * f * f;
      const ra = o.cation === "Ca" ? 3.4 : 2.8;
      s += `<circle cx="${r1(xx)}" cy="${r1(-dz)}" r="${ra}" fill="${cat.c}"/><circle cx="${r1(xx + 4)}" cy="${r1(dz)}" r="${ra}" fill="${cat.c}"/>`;
    }
    return s + `</g>`;
  }
  function plaquette(x, y, ang, k, o) {
    let s = `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(ang)})">`;
    s += o.tO ? `<rect x="-75" y="-6" width="150" height="6" fill="${COUL.T}"/><rect x="-75" y="0" width="150" height="6" fill="${COUL.O}"/>`
      : `<rect x="-75" y="-6" width="150" height="4" fill="${COUL.T}"/><rect x="-75" y="-2" width="150" height="4" fill="${COUL.O}"/><rect x="-75" y="2" width="150" height="4" fill="${COUL.T}"/>`;
    s += `<rect x="-75" y="-6" width="150" height="12" fill="none" stroke="#5b4a3c" stroke-width=".7"/>`;
    const bord = (bx) => o.plusBord > 0.5 ? `<g transform="translate(${bx} 0) rotate(${r1(-ang)})"><circle r="4.4" fill="#fff" stroke="#c0392b" stroke-width=".9"/><path d="M-2.3 0h4.6M0 -2.3v4.6" stroke="#c0392b" stroke-width="1.3"/></g>`
      : `<g transform="translate(${bx} 0)"><circle r="4.4" fill="#fff" stroke="#3a2a24" stroke-width=".8"/><path d="M-2.3 0h4.6" stroke="#3a2a24" stroke-width="1.3"/></g>`;
    s += bord(-79) + bord(79);
    return s + `</g>`;
  }
  function flocSVG(v, o) {
    let s = `<rect width="640" height="214" fill="${COUL.papier}"/>`;
    // sel de l'eau de mer : petits ions partout (Na⁺ gris, Cl⁻ vert)
    if (v.sel > 0.02) for (let i = 0; i < 70; i++) {
      const x = 14 + ((i * 97) % 410), y = 12 + ((i * 53) % 186);
      s += `<circle cx="${x}" cy="${y}" r="1.8" fill="${i % 2 ? "#6d7178" : "#4f9a6a"}" opacity="${r1(v.sel * 0.7 * 10) / 10}"/>`;
    }
    const oo = Object.assign({}, o, { L: v.L, plusBord: v.plusBord });
    s += nuage(v.a[0], v.a[1], v.a[2], 0, oo) + nuage(v.b[0], v.b[1], v.b[2], 1, oo);
    s += plaquette(v.a[0], v.a[1], v.a[2], 0, oo) + plaquette(v.b[0], v.b[1], v.b[2], 1, oo);
    // château de cartes : la face de la particule couchée, négative, sous le bord positif de l'autre
    if (v.plusBord > 0.5) [-16, 16].forEach((dx) => { s += sigleMoins(v.b[0] + dx, v.a[1] - 6); });
    // flèches de répulsion quand elles sont dispersées ; « se collent » quand elles sont floculées
    if (v.trouble > 0.6) {
      const op = r1((v.trouble - 0.6) / 0.4 * 10) / 10;
      s += `<g opacity="${op}" stroke="#3a2a24" stroke-width="1.3" fill="none"><path d="M150 97 V84 M144 90 L150 83 L156 90"/><path d="M150 107 V120 M144 114 L150 121 L156 114"/></g>`;
      s += `<text x="162" y="105" class="fa-lab fa-petit cec-etq" opacity="${op}">les nuages se repoussent</text>`;
    } else if (v.plusBord < 0.3) {
      s += `<text x="300" y="${r1(v.a[1] - 6 - v.L - 6)}" class="fa-lab fa-petit cec-etq" opacity="${r1((0.6 - v.trouble) / 0.6 * 10) / 10}">nuages minces : les particules s'agglomèrent</text>`;
    } else {
      s += `<text x="216" y="130" class="fa-lab fa-petit cec-etq" opacity="${r1(v.plusBord * 10) / 10}">bord + collé contre la face −</text>`;
    }
    // bécher : trouble si dispersé, clair avec un dépôt si floculé
    const bx = 476, by = 40, bw = 116, bh = 140, haut = by + 14;
    s += `<text x="${bx + bw / 2}" y="24" text-anchor="middle" class="fa-lab fa-petit cec-etq">quelque temps après</text>`;
    s += `<rect x="${bx}" y="${haut}" width="${bw}" height="${by + bh - haut}" fill="#cfe2f1"/>`;
    s += `<rect x="${bx}" y="${haut}" width="${bw}" height="${by + bh - haut}" fill="#9c7650" opacity="${r1((0.06 + 0.55 * v.trouble) * 100) / 100}"/>`;
    const dep = 3 + 15 * (1 - v.trouble);
    s += `<rect x="${bx}" y="${by + bh - dep}" width="${bw}" height="${dep}" fill="#8a6440"/>`;
    if (v.trouble < 0.9) for (let i = 0; i < 9; i++) {
      const x = bx + 12 + (i * 37) % (bw - 24), y = by + bh - dep - 8 - ((i * 23) % 40);
      s += `<g opacity="${r1((1 - v.trouble) * 8) / 10}" fill="#8a6440"><circle cx="${x}" cy="${y}" r="2.6"/><circle cx="${x + 3}" cy="${y + 2}" r="2"/><circle cx="${x - 2}" cy="${y + 2.5}" r="1.8"/></g>`;
    }
    s += `<path d="M${bx - 4} ${by} V${by + bh} H${bx + bw} V${by}" fill="none" stroke="#5b4a3c" stroke-width="1.6"/>`;
    s += `<text x="${bx + bw / 2}" y="${by + bh + 16}" text-anchor="middle" class="fa-lab fa-petit cec-etq">${v.trouble > 0.5 ? "reste trouble" : "s'éclaircit, dépôt au fond"}</text>`;
    s += `<text x="16" y="206" class="fa-lab fa-petit cec-etq">cations du nuage : ${ION[o.cation].lab}${v.sel > 0.5 ? " · ions de l'eau de mer, en petit nombre" : ""}</text>`;
    return s;
  }
  function brancherFloc(carteEl, d) {
    const svg = carteEl.querySelector(".cec-floc-scene svg"), verdict = carteEl.querySelector(".cec-floc-verdict");
    if (!svg) return;
    const kao = d.type === "tO";
    const st = { c: "Na", e: "douce", p: "neutre" };
    const etat = () => st.e === "mer" ? "flocMer" : st.p === "acide" ? "cartes" : st.c === "Ca" ? "flocCa" : "disperse";
    const TXT_FLOC = {
      disperse: `<b>Dispersées.</b> Les Na⁺, qui ne portent qu'une charge et s'entourent de beaucoup d'eau, s'éloignent de la surface : le nuage est épais. Deux particules qui s'approchent sont repoussées avant de pouvoir se coller ; elles restent en suspension et l'eau demeure trouble.${kao ? " Pour une kaolinite, seulement dans une eau presque pure : elle flocule dès 0,6 millimole de NaCl par litre (Rommelfanger et al. 2022)." : ""}`,
      flocCa: `<b>Floculées.</b> Les Ca²⁺, qui portent deux charges, demeurent près de la surface : le nuage est mince et les particules se rapprochent assez pour que l'attraction de van der Waals les réunisse ; un même Ca²⁺ peut même retenir deux faces à la fois. Les flocons tombent et l'eau s'éclaircit.${kao ? " Pour une kaolinite, 0,04 millimole de CaCl₂ par litre suffit, quinze fois moins qu'avec le sodium (Rommelfanger et al. 2022)." : ""}`,
      flocMer: `<b>Floculées.</b> Dans l'eau de mer, la quantité d'ions est telle que le nuage ne dépasse pas quelques dixièmes de nanomètre, même avec Na⁺ : toutes les argiles s'agglomèrent. Voilà pourquoi celles qu'apportent les fleuves se déposent en vases dans les estuaires.`,
      cartes: `<b>Floculées en château de cartes.</b> En milieu acide, les bords, là où le feuillet est rompu, se chargent de H⁺ et deviennent positifs, alors que les faces demeurent négatives : le bord d'une particule s'accroche à la face d'une autre${kao ? ", seuil d'environ pH 6 à 6,5 pour une kaolinite (Tombácz et Szekeres 2006)" : ""}. Dans un sol acide, l'Al³⁺ de l'argile, porteur de trois charges, contribue lui aussi à cette floculation.`,
    };
    let cur = Object.assign({}, FLOC[etat()]), raf = 0;
    const o = () => ({ cation: st.c, tO: kao });
    const lerp = (a, b, u) => a + (b - a) * u;
    const melange = (A, B, u) => ({
      a: A.a.map((x, i) => lerp(x, B.a[i], u)), b: A.b.map((x, i) => lerp(x, B.b[i], u)),
      L: lerp(A.L, B.L, u), sel: lerp(A.sel, B.sel, u), trouble: lerp(A.trouble, B.trouble, u), plusBord: lerp(A.plusBord, B.plusBord, u),
    });
    const dessiner = (v) => { svg.innerHTML = flocSVG(v, o()); };
    function aller() {
      const cible = FLOC[etat()], dep = cur, t0 = performance.now();
      verdict.innerHTML = insec(TXT_FLOC[etat()]);
      if (raf) cancelAnimationFrame(raf);
      const reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduit || document.hidden) { cur = Object.assign({}, cible); dessiner(cur); return; }
      const pas = (now) => {
        const u = lisse((now - t0) / 1400);
        cur = melange(dep, cible, u); dessiner(cur);
        raf = u < 1 ? requestAnimationFrame(pas) : 0;
      };
      raf = requestAnimationFrame(pas);
    }
    ["c", "e", "p"].forEach((k) => carteEl.querySelectorAll(`[data-floc-${k}]`).forEach((b) => b.addEventListener("click", () => {
      st[k] = b.dataset["floc" + k.toUpperCase()];
      carteEl.querySelectorAll(`[data-floc-${k}]`).forEach((x) => x.classList.toggle("on", x === b));
      aller();
    })));
    dessiner(cur);
    verdict.innerHTML = insec(TXT_FLOC[etat()]);
    carteEl._floc = { regler: (c, e, p) => { Object.assign(st, { c, e, p }); cur = Object.assign({}, FLOC[etat()]); dessiner(cur); verdict.innerHTML = insec(TXT_FLOC[etat()]); return etat(); } };
  }

  // un curseur sur toute la largeur, son échelle graduée DESSOUS (repères alignés sur la course du bouton, 16 px)
  function curseur(lib, k, min, max, pas, val, ticks, unite, bande) {
    const pos = (v) => `calc(8px + (100% - 16px) * ${((v - min) / (max - min)).toFixed(4)})`;
    return `<div class="cec-curseur">
        <div class="cec-c-tete"><span>${lib}</span><b data-cec-${k}t></b></div>
        <input type="range" min="${min}" max="${max}" step="${pas}" value="${val}" data-cec-${k} aria-label="${esc(lib)}">
        <div class="cec-regle">${bande ? `<i class="cec-bande" style="left:${pos(bande[0])};width:calc((100% - 16px) * ${((bande[1] - bande[0]) / (max - min)).toFixed(4)})" title="fourchette de la fiche"></i>` : ""}
          ${ticks.map((t) => `<span style="left:${pos(t)}">${fr(t, 0)}${unite}</span>`).join("")}</div>
        ${bande ? `<p class="cec-c-note">en couleur : la plage indiquée par la fiche (${fr(bande[0], bande[0] < 10 ? 1 : 0)} à ${fr(bande[1], 0)} cmol⁺/kg)</p>` : ""}
      </div>`;
  }
  // kg par hectare : terre fine = 10 000 m² × épaisseur × densité apparente (1,35 t/m³)
  function hectareHTML(d) {
    const boutons = GARNITURES.map((g, i) => `<button type="button" class="chip${i === 2 ? " on" : ""}" data-garn="${g.id}">${g.nom}</button>`).join("");
    return `<p class="sub">Sur 1 hectare (100 m × 100 m) labouré à 30 cm de profondeur, on dispose d'environ 4 000 tonnes de terre fine (densité apparente : 1,35 t/m³). La garniture est celle du planosol de Héry en Champagne humide (Baize 2000), transposée à cette argile.</p>
      <div class="cec-curseurs">
        ${curseur("CEC de l'argile", "v", 0, 200, 0.5, d.cec, [0, 50, 100, 150, 200], "", [d.cmin, d.cmax])}
        ${curseur("Argile dans la terre", "a", 0, 100, 1, 20, [0, 25, 50, 75, 100], " %")}
        ${curseur("Épaisseur comptée", "e", 0, 100, 5, 30, [0, 25, 50, 75, 100], " cm")}
      </div>
      <div class="cec-garn" role="group" aria-label="Garniture du complexe d'échange">${boutons}</div>
      <p class="pluie-eq" data-cec-eq></p>
      <div class="nb-litres cec-ha" data-cec-ha></div>
      <p class="pl-note" data-cec-note></p>`;
  }

  // ─────────── animation et réglages ───────────
  // chemin : liste de points, parcourue à vitesse constante
  function chemin(pts) {
    const c = [0];
    for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = c[c.length - 1] || 1;
    return (u) => {
      const dd = clamp(u) * L;
      let i = 1; while (i < pts.length - 1 && c[i] < dd) i++;
      const f = (dd - c[i - 1]) / ((c[i] - c[i - 1]) || 1);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    };
  }
  const ICONES = {
    pause: `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1"/><rect x="9.5" y="2.5" width="3" height="11" rx="1"/></svg>`,
    lecture: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L4.9 2.1a.6.6 0 0 0-.9.5z"/></svg>`,
  };
  // chronologie (ms) : approche, échange, état échangé, échange inverse (engrais potassique), retour
  const ETAPES = [
    [0, "Dans l'eau du sol, un Ca²⁺ arrive près de l'argile."],
    [2600, "Il prend la place de deux K⁺ : deux charges 1+ remplacées par une seule 2+. Les deux K⁺ libérés repartent dans la solution."],
    [4900, "L'équilibre des charges est préservé : le Ca²⁺ n'est pas fixé de façon définitive, il est seulement retenu et pourra à son tour être échangé."],
    [7000, "Après un apport d'engrais potassique, la solution du sol s'enrichit en K⁺ : deux K⁺ reprennent la place du Ca²⁺, qui repart dans l'eau."],
  ];
  const CYCLE = 11400;
  function monterUne(carteEl) {
    if (carteEl._cec) return carteEl._cec;
    const d = JSON.parse(carteEl.dataset.cec);
    const m = MODELES[d.type]();
    const svg = carteEl.querySelector(".cec-scene svg");
    const g = (id) => svg.querySelector(`[data-ion="${id}"]`);
    const ca = g("ca"), k1 = g("k1"), k2 = g("k2");
    const tr = trajets(m);
    const pK1 = chemin(tr.k1), pK2 = chemin(tr.k2), pA = chemin([tr.dep, tr.att]), pB = chemin(tr.ca);
    const place = (el, p) => el.setAttribute("transform", `translate(${r1(p[0])} ${r1(p[1])})`);
    const etape = carteEl.querySelector(".cec-etape"), bouton = carteEl.querySelector(".cec-lecture");
    const reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tms = 0, lecture = !reduit, visible = false, raf = 0, dernier = 0, texte = "";
    function dessiner() {
      const t = tms;
      // aller : 800–2600 le Ca²⁺ approche, 2600–4100 les deux K⁺ sortent, 3900–4800 le Ca²⁺ prend leur place ;
      // retour (engrais potassique) : 7000–7900 le Ca²⁺ ressort, 7900–8900 il s'éloigne, 8000–9800 les K⁺ reviennent
      let pCa, uK1, uK2;
      if (t < 7000) {
        pCa = t < 3900 ? pA(lisse((t - 800) / 1800)) : pB(lisse((t - 3900) / 900));
        uK2 = lisse((t - 2600) / 1200);
        uK1 = lisse((t - 2800) / 1300);
      } else {
        pCa = t < 7900 ? pB(1 - lisse((t - 7000) / 900)) : pA(1 - lisse((t - 7900) / 1000));
        uK2 = 1 - lisse((t - 8000) / 1400);
        uK1 = 1 - lisse((t - 8300) / 1500);
      }
      place(ca, pCa); place(k1, pK1(uK1)); place(k2, pK2(uK2));
      let s = ETAPES[0][1];
      for (const [a, txt] of ETAPES) if (t >= a) s = txt;
      if (s !== texte) { texte = s; etape.textContent = s; }
    }
    function image(now) {
      raf = 0;
      if (!carteEl.isConnected) return arreter();
      if (lecture) { tms += Math.min(100, now - dernier); if (tms >= CYCLE) tms = 0; }
      dernier = now;
      dessiner();
      planifier();
    }
    const actif = () => visible && carteEl.open !== false && !document.hidden && lecture;
    function planifier() {
      if (actif()) { if (!raf) { dernier = performance.now(); raf = requestAnimationFrame(image); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function majBouton() {
      bouton.innerHTML = lecture ? ICONES.pause : ICONES.lecture;
      bouton.setAttribute("aria-label", lecture ? "Mettre en pause" : "Lancer l'animation");
    }
    bouton.addEventListener("click", () => { lecture = !lecture; majBouton(); planifier(); });
    const surVisibilite = () => planifier();
    const obs = "IntersectionObserver" in window ? new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; planifier(); }, { threshold: 0.15 }) : null;
    function arreter() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (obs) obs.disconnect();
      document.removeEventListener("visibilitychange", surVisibilite);
    }
    document.addEventListener("visibilitychange", surVisibilite);
    carteEl.addEventListener("toggle", surVisibilite);   // repliée : l'animation s'arrête ; dépliée : elle reprend
    if (obs) obs.observe(carteEl); else visible = true;
    majBouton(); dessiner(); planifier();
    brancherHectare(carteEl, d);
    brancherFloc(carteEl, d);
    const montrer = (t) => { lecture = false; majBouton(); planifier(); tms = clamp(t, 0, CYCLE - 1); dessiner(); };
    return (carteEl._cec = { arreter, montrer, etat: () => ({ tms, lecture, visible, anime: !!raf, texte }) });
  }

  function brancherHectare(carteEl, d) {
    const q = (s) => carteEl.querySelector(s);
    const vC = q("input[data-cec-v]"), vA = q("input[data-cec-a]"), vE = q("input[data-cec-e]");
    if (!vC) return;
    let garn = GARNITURES[2];
    const masse = (x) => x >= 1000 ? `${fr2(x / 1000)} t` : `${fr(x, x < 10 ? 1 : 0)} kg`;
    function maj() {
      const cec = +vC.value, a = +vA.value / 100, e = +vE.value / 100;
      const terre = 10000 * e * 1.35;                 // tonnes de terre fine par hectare
      const argile = terre * a;                       // tonnes d'argile
      const charges = argile * 1000 * cec / 100;      // moles de charges
      q("[data-cec-vt]").textContent = `${fr(cec, cec < 10 ? 1 : 0)} cmol⁺/kg`;
      q("[data-cec-at]").textContent = `${fr(a * 100, 0)} %`;
      q("[data-cec-et]").textContent = `${fr(e * 100, 0)} cm`;
      const p = partsDe(garn);
      const L = ORDRE_IONS.map((k) => ({ k, mol: charges * p[k], kg: charges * p[k] * ION[k].g / 1000 }));
      const max = Math.max(...L.map((l) => l.kg)) || 1;
      q("[data-cec-eq]").innerHTML = insec(`Pour un hectare, la terre fine pèse 10 000 m² × ${fr(e, 2)} m × 1,35 t/m³, soit ${fr(terre, 0)} t ; sa fraction argileuse (${fr(a * 100, 0)} %) représente ${fr(argile, 0)} t ; ces ${fr(argile * 1000, 0)} kg portent ${fr(cec / 100, 3)} mol/kg de charges, ce qui fait <b>${fr2(charges / 1000)} milliers de moles de charges</b> par hectare`);
      q("[data-cec-ha]").innerHTML = L.map(({ k, kg }) => `<div class="nb-litre"><span><i class="cec-pastille" style="background:${ION[k].c}"></i>${ION[k].lab}${k === "H" ? " (reste)" : ""} · ${fr(p[k] * 100, 0)} %</span>
          <i><b style="width:${(kg / max * 100).toFixed(1)}%;background:${ION[k].c}"></b></i><span>${insec(masse(kg))}</span></div>`).join("");
      const kK = L.find((l) => l.k === "K").kg;
      q("[data-cec-note]").innerHTML = insec(`Le potassium représente ${masse(kK)} par hectare, soit ${masse(kK * 1.2046)} de K₂O, unité des analyses de terre (Baize 2000, tableau 10). Pour la garniture « ${esc(garn.nom)} » : T = ${fr(garn.T, 1)} cmol⁺/kg, dont Ca²⁺ ${fr(garn.Ca, 2)}, Mg²⁺ ${fr(garn.Mg, 2)}, K⁺ ${fr(garn.K, 2)}, Na⁺ ${fr(garn.Na, 2)} et Al³⁺ ${fr(garn.Al, 1)} ; la part non dosée est surtout constituée de H⁺. Le calcul ne porte que sur l'argile : l'humus retient bien davantage par kilogramme (150 à 300 cmol⁺/kg, Baize 2000).`);
    }
    carteEl.querySelectorAll("[data-garn]").forEach((b) => b.addEventListener("click", () => {
      garn = GARNITURES.find((x) => x.id === b.dataset.garn);
      carteEl.querySelectorAll("[data-garn]").forEach((x) => x.classList.toggle("on", x === b));
      maj();
    }));
    [vC, vA, vE].forEach((x) => x.addEventListener("input", maj));
    maj();
  }

  function monter(racine) {
    (racine || document).querySelectorAll(".cec-carte").forEach(monterUne);
  }
  function sourcesLi() {
    return `<li><b>Calcul de la CEC</b> : charge par O₁₀(OH)₂ ÷ masse molaire × 100 000 ; masses molaires recalculées pour les formules idéales (montmorillonite 367 g/mol, vermiculite 386 à 389, illite 388, kaolinite 258, talc 379). Kilos par hectare : 10 000 m² × épaisseur × 1,35 t/m³.</li>
      <li><b>Autres cations</b> : Baize D. (2000), chapitres 11 et 12 (Mn²⁺ et Fe²⁺ dans la CEC effective ; rétention du cadmium selon le pH ; CEC anionique) ; Cremers A. et al. (1988), « Quantitative analysis of radiocaesium retention in soils », <i>Nature</i> 335, 247.</li>
      <li><b>Floculation et dispersion</b> : Baize D. (2000), ouvr. cité, chapitre 7 (dispersion à l'hexamétaphosphate de sodium avant l'analyse granulométrique ; kaolinites isolées, illites, vermiculites et smectites en microdomaines, selon Tessier) et chapitre 22 (sodicité = Na⁺ ÷ T ; horizon sodique au-delà de 15 %, « à alcali » si la structure se dégrade et que le pH dépasse 8,8 ; Seille, selins de Limagne) ; Tombácz E. et Szekeres M. (2006), <i>Applied Clay Science</i> 34, 105 (bords de la kaolinite positifs sous pH 6 à 6,5, agrégats bord contre face) ; Rommelfanger N. et al. (2022), « A simple criterion and experiments for onset of flocculation in kaolin clay suspensions », arXiv 2203.15545 (floculation à partir de 0,6 mmol/L de NaCl et 0,04 mmol/L de CaCl₂) ; Jmal Ayadi A., Pagnoux C. et Baklouti S. (2011), <i>Comptes Rendus Chimie</i> 14, 456 (bords ≈ 20 % de la surface de la kaolinite, charges fonction du pH, dispersant fixé sur les bords) ; Dellavalle N. B. et Walworth J. (2020), « Determining the gypsum requirement for reclamation of sodic and sodium-impacted soils », <i>Crops &amp; Soils</i> 53 (une charge de Ca²⁺ remplace une charge de Na⁺) ; Norrish K. (1954), <i>Discussions of the Faraday Society</i> 18, 120 (gonflement des smectites sodiques et calciques).</li>
      <li><b>Hiérarchie de rétention</b> : University of British Columbia, <i>LFS:SoilWeb</i>, « Interactions Among Soil Components : Adsorption of Ions » ; la série Ca²⁺ &gt; Mg²⁺ &gt; K⁺ ≈ NH₄⁺ &gt; Na⁺ y est expliquée par la charge et par l'eau qui entoure chaque ion.</li>
      <li><b>Schéma de la CEC</b> : sources principales, Baize D. (2000), <i>Guide des analyses en pédologie</i>, 2ᵉ éd., INRA Éditions, chapitres 11 à 13 ; on y trouve la définition, les unités (1 mé/100 g = 1 cmol⁺/kg), l'origine des charges (substitutions dans les feuillets, charges de bordure liées au pH, potassium des micas non échangeable), la CEC des argiles d'après Dejou et al. (kaolinites 3 à 15, illites et chlorites 10 à 40, smectites 80 à 150, vermiculites 100 à 150), celle de l'humus (150 à 300) et des allophanes (100 à 200), la masse d'un milliéquivalent de chaque cation, la garniture du planosol de Héry (p. 116) et le seuil de pH 5 pour l'aluminium.</li>`;
  }
  // contrôle : sur chaque schéma, charges des sites = charges des cations échangeables
  function controle() {
    const pb = [];
    Object.entries(MODELES).forEach(([t, f]) => {
      const m = f(), plus = m.fixes.reduce((s, [k]) => s + ION[k].z, 0) + 2;
      if (plus !== m.sites) pb.push(`${t} : ${m.sites} sites, ${plus} charges +`);
    });
    GARNITURES.forEach((g) => { const p = partsDe(g); if (p.H < 0 || p.H > 0.7) pb.push("garniture " + g.id); });
    return pb;
  }
  window.CecSchema = { carte, monter, sourcesLi, controle, TYPE, MODELES, GARNITURES };
})();
