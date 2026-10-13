// ============ Comment un oxyde de fer ou de manganèse se change en un autre (11/10/2026, à valider) ============
// Sa demande : « un schéma d'explication pour le fer et le manganèse sur comment, moléculairement, on passe de la goethite à la
// ferrihydrite, etc. ». Un schéma par élément (fer, manganèse) : chaque minéral est dessiné par son ARRANGEMENT d'octaèdres (un losange =
// un octaèdre MO₆ vu de côté, le point = le métal ; deux losanges qui se touchent par un côté partagent une arête, par une pointe un
// sommet ; triangle = tétraèdre), les flèches numérotées sont les passages connus. Un clic sur une flèche ou un minéral ouvre, sous le
// schéma, le passage en trois vignettes « à l'échelle des atomes » (avant, pendant, après) avec ses conditions et ses sources.
// Dessins SCHÉMATIQUES (proportions et angles simplifiés) : c'est écrit sous le schéma.
// API : OxTransfo.carte(element, focus) → HTML (element "fer" | "manganese", focus = id de minéral à mettre en avant) ;
//       OxTransfo.carteMineral(id) → la carte de l'élément du minéral, ou "" ; OxTransfo.monter(racine).
(function () {
  "use strict";
  const f1 = (x) => (Math.round(x * 10) / 10).toString();

  // ---------- 1. Primitives (coordonnées dans une case de 160 × 100) ----------
  const oct = (x, y, s, c, o = "") => `<path d="M${f1(x)} ${f1(y - s)}L${f1(x + s)} ${f1(y)}L${f1(x)} ${f1(y + s)}L${f1(x - s)} ${f1(y)}Z" class="ot-oct ot-${c}"${o}/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(Math.max(1.4, s * 0.22))}" class="ot-cat"/>`;
  const octJT = (x, y, s, c) => `<path d="M${f1(x)} ${f1(y - s * 1.3)}L${f1(x + s * 0.85)} ${f1(y)}L${f1(x)} ${f1(y + s * 1.3)}L${f1(x - s * 0.85)} ${f1(y)}Z" class="ot-oct ot-${c}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.6" class="ot-cat"/>`;   // octaèdre allongé (Mn³⁺, effet Jahn-Teller)
  const vide = (x, y, s) => `<path d="M${f1(x)} ${f1(y - s)}L${f1(x + s)} ${f1(y)}L${f1(x)} ${f1(y + s)}L${f1(x - s)} ${f1(y)}Z" class="ot-vide"/>`;
  const tet = (x, y, s, c) => `<path d="M${f1(x)} ${f1(y - s)}L${f1(x + s * 0.9)} ${f1(y + s * 0.6)}L${f1(x - s * 0.9)} ${f1(y + s * 0.6)}Z" class="ot-oct ot-${c}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.4" class="ot-cat"/>`;
  const eau = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.6" class="ot-eau"/>`;
  const hh = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.5" class="ot-h"/>`;
  const ion = (x, y, t, c) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="5.2" class="ot-ion ot-${c}"/><text x="${f1(x)}" y="${f1(y + 2.2)}" class="ot-ion-t">${t}</text>`;
  const co3 = (x, y) => `<path d="M${f1(x)} ${f1(y - 3.6)}L${f1(x + 3.4)} ${f1(y + 2.2)}L${f1(x - 3.4)} ${f1(y + 2.2)}Z" class="ot-anion"/>`;
  const elec = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.6" class="ot-elec"/><text x="${f1(x)}" y="${f1(y + 1.6)}" class="ot-elec-t">−</text>`;
  const fleche = (x1, y1, x2, y2, c = "ot-fl") => `<path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" class="${c}" marker-end="url(#ot-pointe)"/>`;
  const txt = (x, y, t, c = "ot-pt") => `<text x="${f1(x)}" y="${f1(y)}" class="${c}">${t}</text>`;
  const hachage = (i) => ((((i + 7) * 2654435761) >>> 0) % 1000) / 1000;   // hasard reproductible

  // couche « brucite » vue de côté : octaèdres à arêtes communes, en zigzag (centres décalés de s en x et en y)
  function couche(x0, y0, n, s, c, o = {}) {
    let r = "";
    for (let k = 0; k < n; k++) {
      const x = x0 + k * s, y = y0 + (k % 2) * s;
      if (o.lacune && o.lacune(k)) { r += vide(x, y, s); if (o.coiffe) r += oct(x, y - 2.2 * s, s * 0.8, o.coiffe); continue; }
      r += (o.jt ? octJT : oct)(x, y, s, typeof c === "function" ? c(k) : c);
    }
    return r;
  }

  // ---------- 2. Les minéraux dessinés (case 160 × 100 ; légende sous la case) ----------
  const M = {
    fe2: { nom: "Fe²⁺ dissous", f: "Fe(H₂O)₆²⁺", d: () => aq("fe2") },
    frh: { nom: "Ferrihydrite", f: "≈ Fe₁₀O₁₄(OH)₂", id: "ferrihydrite", d: ferrihydrite },
    goe: { nom: "Goethite", f: "α-FeO(OH)", id: "goethite", d: goethite },
    lep: { nom: "Lépidocrocite", f: "γ-FeO(OH)", id: "lepidocrocite", d: lepidocrocite },
    hem: { nom: "Hématite", f: "α-Fe₂O₃", id: "hematite", d: hematite },
    mag: { nom: "Magnétite", f: "Fe²⁺Fe³⁺₂O₄", id: "magnetite", d: () => spinelle(false) },
    mgh: { nom: "Maghémite", f: "γ-Fe₂O₃", id: "maghemite", d: () => spinelle(true) },
    fou: { nom: "Fougérite", f: "rouille verte", id: "fougerite", d: fougerite },
    mn2: { nom: "Mn²⁺ dissous", f: "Mn(H₂O)₆²⁺", d: () => aq("mn2") },
    ver: { nom: "Vernadite", f: "δ-MnO₂", id: "vernadite", d: vernadite },
    bir: { nom: "Birnessite", f: "feuillets à ≈ 7 Å", id: "birnessite", d: birnessite },
    tod: { nom: "Todorokite", f: "tunnels 3 × 3", id: "todorokite", d: todorokite },
    lit: { nom: "Lithiophorite", f: "(Al,Li)MnO₂(OH)₂", id: "lithiophorite", d: lithiophorite },
    fei: { nom: "Feitknechtite, manganite", f: "MnO(OH)", id: "manganite", d: feitknechtite },
  };
  function aq(c) {
    let r = "";
    for (const [x, y, s] of [[80, 50, 17], [30, 26, 7], [132, 30, 7], [124, 78, 7]]) {
      r += oct(x, y, s, c);
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) r += eau(x + dx * (s + 2.6), y + dy * (s + 2.6));
    }
    return r;
  }
  function ferrihydrite() {   // amas de quelques nanomètres : octaèdres à arêtes et sommets communs, un fer sur cinq en tétraèdre (Michel 2007)
    const P = [[56, 40], [64, 48], [72, 40], [48, 48], [56, 56], [72, 56], [80, 48], [64, 32], [88, 40], [64, 64], [96, 56], [104, 48], [88, 64], [112, 40], [104, 64]];
    let r = "";
    P.forEach(([x, y], i) => { r += (i % 5 === 4 ? tet(x, y, 6.5, "fe3") : oct(x, y, 8, "fe3")); });
    for (const [x, y] of [[38, 46], [44, 64], [120, 34], [118, 58], [96, 74], [70, 76], [50, 30], [84, 26]]) r += hh(x, y);
    return r + txt(80, 94, "2 à 6 nm, sites en partie vides", "ot-pt ot-c");
  }
  function goethite() {   // doubles chaînes d'octaèdres (paires à arête commune), liées par des sommets ; tunnels 2 × 1 où pointent les H
    let r = "";
    const s = 7;
    for (let row = 0; row < 3; row++) for (let m = 0; m < 4; m++) {
      const x = 26 + m * 3 * s + (row % 2) * 1.5 * s, y = 20 + row * 3 * s, a = (m + row) % 2;
      r += a ? oct(x, y, s, "fe3") + oct(x + s, y + s, s, "fe3") : oct(x, y + s, s, "fe3") + oct(x + s, y, s, "fe3");
      if (row < 2) r += hh(x + 2 * s, y + 2.2 * s);
    }
    return r + txt(80, 94, "doubles chaînes, tunnels 2 × 1", "ot-pt ot-c");
  }
  function lepidocrocite() {   // feuillets doubles ondulés, tenus entre eux par des liaisons hydrogène (tirets)
    let r = "";
    const s = 6.5;
    for (const y0 of [18, 54]) {
      r += couche(24, y0, 16, s, "fe3") + couche(24 + s, y0 + 2 * s, 15, s, "fe3");
      if (y0 === 18) for (let k = 0; k < 6; k++) r += `<line x1="${f1(30 + k * 18)}" y1="${f1(y0 + 4 * s)}" x2="${f1(30 + k * 18)}" y2="${f1(54 - s + 1)}" class="ot-hb"/>`;
    }
    return r + txt(80, 96, "feuillets doubles + liaisons H", "ot-pt ot-c");
  }
  function hematite() {   // corindon : deux sites sur trois occupés ; octaèdres par paires à face commune (superposés) d'une couche à l'autre
    let r = "";
    const s = 7;
    for (let j = 0; j < 4; j++) for (let k = 0; k < 9; k++) {
      if ((k + j) % 3 === 0) continue;
      r += oct(24 + k * 2 * s * 0.8 + (j % 2) * s * 0.8, 18 + j * 1.55 * s * 1.6, s, "fe3");
    }
    return r + txt(80, 96, "2 sites sur 3, sans H, serré", "ot-pt ot-c");
  }
  function spinelle(lacunes) {   // rangées d'octaèdres + tétraèdres (magnétite : Fe²⁺ et Fe³⁺ ; maghémite : tout Fe³⁺, un site sur six vide)
    let r = "";
    const s = 7;
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 9; k++) {
        const x = 22 + k * 2 * s + (j % 2) * s, y = 18 + j * 3.2 * s, i = j * 9 + k;
        if (lacunes && i % 6 === 2) { r += vide(x, y, s); continue; }
        r += oct(x, y, s, !lacunes && (i % 2) ? "fe2" : "fe3");
      }
      if (j < 2) for (let k = 0; k < 4; k++) r += tet(30 + k * 4 * s + (j % 2) * 2 * s, 18 + j * 3.2 * s + 1.6 * s, 5.5, "fe3");
    }
    return r + txt(80, 96, lacunes ? "tout Fe³⁺, sites vides" : "Fe²⁺ + Fe³⁺, octaèdres et tétraèdres", "ot-pt ot-c");
  }
  function fougerite() {   // feuillets de type brucite, Fe²⁺ et Fe³⁺ mêlés ; eau et anions (carbonate) entre eux
    let r = couche(20, 16, 18, 6.5, (k) => (k % 3 === 1 ? "fe3" : "fe2")) + couche(20, 64, 18, 6.5, (k) => (k % 3 === 2 ? "fe3" : "fe2"));
    for (let k = 0; k < 6; k++) r += (k % 2 ? co3(28 + k * 20, 44) : eau(28 + k * 20, 44)) + eau(38 + k * 20, 40);
    return r + txt(80, 96, "Fe²⁺/Fe³⁺, eau et anions entre", "ot-pt ot-c");
  }
  function vernadite() {   // petits feuillets percés, empilés au hasard (sans ordre d'un feuillet à l'autre)
    let r = "";
    const s = 6.5;
    r += couche(18, 14, 9, s, "mn4", { lacune: (k) => k === 5 }) + couche(52, 44, 11, s, "mn4", { lacune: (k) => k === 2 || k === 8 }) + couche(26, 72, 8, s, "mn4", { lacune: (k) => k === 4 });
    return r + txt(80, 96, "nanofeuillets percés, au hasard", "ot-pt ot-c");
  }
  function birnessite() {   // feuillets MnO₂ réguliers, un site sur six vide coiffé d'un Mn³⁺ ; eau et cations à mi-chemin
    let r = "";
    const s = 6.5;
    for (const y0 of [16, 62]) r += couche(18, y0, 19, s, "mn4", { lacune: (k) => k % 6 === 3, coiffe: y0 === 62 ? "mn3" : null });
    for (let k = 0; k < 7; k++) r += k % 3 === 1 ? ion(26 + k * 18, 42, "+", "na") : eau(26 + k * 18, 42);
    return r + txt(80, 96, "feuillets réguliers, eau et cations", "ot-pt ot-c");
  }
  function todorokite() {   // murs de trois octaèdres → tunnels de 3 × 3 octaèdres, eau et Mg²⁺ dedans
    let r = "";
    const s = 5.2, P = 4 * 2 * s * 0.75;
    for (let gx = 0; gx < 4; gx++) for (let gy = 0; gy < 3; gy++) {
      const x0 = 26 + gx * P, y0 = 12 + gy * P;
      for (let k = 0; k < 4; k++) { if (gx < 3) r += oct(x0 + k * 1.5 * s, y0, s, "mn4"); if (gy < 2) r += oct(x0, y0 + k * 1.5 * s, s, k === 0 ? "mn4" : "mn3"); }
      if (gx < 3 && gy < 2) r += eau(x0 + P / 2 - 3, y0 + P / 2 - 3) + ion(x0 + P / 2 + 3, y0 + P / 2 + 3, "2+", "mg");
    }
    return r + txt(80, 97, "murs de 3 octaèdres, tunnels", "ot-pt ot-c");
  }
  function lithiophorite() {   // un feuillet MnO₂ sur deux ; l'autre en Al(OH)₃ + Li (gibbsite), tenu par les H de ses OH
    let r = "";
    const s = 6;
    r += couche(18, 12, 21, s, "mn4") + couche(18, 38, 21, s, (k) => (hachage(k) < 0.33 ? "li" : "al")) + couche(18, 64, 21, s, "mn4");
    for (let k = 0; k < 10; k++) r += hh(21 + k * 13, 31) + hh(27 + k * 13, 57);
    return r + txt(80, 94, "feuillets Mn et Al/Li alternés", "ot-pt ot-c");
  }
  function feitknechtite() {   // feuillets de Mn³⁺ à octaèdres allongés (Jahn-Teller), OH sur les faces
    let r = couche(18, 20, 18, 6.5, "mn3", { jt: true }) + couche(18, 62, 18, 6.5, "mn3", { jt: true });
    for (let k = 0; k < 9; k++) r += hh(22 + k * 14, 41) + hh(28 + k * 14, 50);
    return r + txt(80, 96, "Mn³⁺, octaèdres étirés", "ot-pt ot-c");
  }

  // ---------- 3. Les passages ----------
  // type : "ox" (oxydation : électrons qui partent), "red" (réduction), "dis" (dissolution puis reprécipitation), "sol" (dans le solide),
  // "bio" (fait par des êtres vivants). v = [titre de la vignette du milieu].
  const SRC = {
    cornell: "Cornell et Schwertmann 2003, <i>The Iron Oxides</i>, 2ᵉ éd., Wiley-VCH, chapitres 13 et 14",
    schwertmann83: "Schwertmann et Murad 1983, <i>Clays Clay Miner.</i> 31 : 277–284",
    cudennec: "Cudennec et Lecerf 2006, <i>J. Solid State Chem.</i> 179 : 716–722",
    michel: "Michel et al. 2007, <i>Science</i> 316 : 1726–1729",
    hansel: "Hansel, Benner et Fendorf 2005, <i>Environ. Sci. Technol.</i> 39 : 7147–7153",
    trolard: "Trolard et al. 2007, <i>Clays Clay Miner.</i> 55 : 323–334",
    larsen: "Larsen et Postma 2001, <i>Geochim. Cosmochim. Acta</i> 65 : 1367–1379",
    ketterings: "Ketterings et Bigham 2000, <i>Soil Sci. Soc. Am. J.</i> 64 : 1108–1117",
    gao: "Gao et al. 2015, <i>Geochem. Trans.</i> 16 : 16 (accès libre)",
    tebo: "Tebo et al. 2004, <i>Annu. Rev. Earth Planet. Sci.</i> 32 : 287–328",
    villalobos: "Villalobos, Toner, Bargar et Sposito 2003, <i>Geochim. Cosmochim. Acta</i> 67 : 2649–2662",
    drits: "Drits, Silvester, Gorshkov et Manceau 1997, <i>Am. Mineral.</i> 82 : 946–961",
    bodei: "Bodeï, Manceau, Geoffroy, Baronnet et Buatier 2007, <i>Geochim. Cosmochim. Acta</i> 71 : 5698–5716",
    atkins: "Atkins, Shaw et Peacock 2014, <i>Geochim. Cosmochim. Acta</i> 144 : 109–125",
    elzinga: "Elzinga 2011, <i>Environ. Sci. Technol.</i> 45 : 6366–6372 ; Lefkowitz, Rouff et Elzinga 2013, <i>ibid.</i> 47 : 10364–10371",
    post99: "Post 1999, <i>Proc. Natl. Acad. Sci. USA</i> 96 : 3447–3454",
    post94: "Post et Appleman 1994, <i>Am. Mineral.</i> 79 : 370–374",
    matocha: "Matocha, Sparks, Amonette et Kukkadapu 2001, <i>Soil Sci. Soc. Am. J.</i> 65 : 58–66",
    ponna: "Ponnamperuma 1972, <i>Adv. Agron.</i> 24 : 29–96",
  };
  const T = {
    fer: {
      titre: "Le fer : d'un oxyde à l'autre",
      intro: "Tous ces minéraux sont faits des mêmes briques : un fer au centre de six oxygènes (ou OH), en octaèdre. Ce qui change, c'est la façon dont les octaèdres se touchent — par une arête, par un sommet, par une face — et la place laissée vide. Passer de l'un à l'autre, c'est défaire ou réarranger ces contacts.",
      noeuds: { mag: [1, 0], mgh: [2, 0], fe2: [0, 1], frh: [1, 1], lep: [2, 1], fou: [0, 2], hem: [1, 2], goe: [2, 2] },
      fl: [
        { de: "fe2", vers: "frh", type: "ox", titre: "Le Fe²⁺ s'oxyde : naissance de la ferrihydrite", cond: "à l'air, dès que l'eau du sol se renouvelle ; quelques minutes à quelques heures vers pH 7", v: "Fe³⁺ : les OH font des ponts",
          texte: "L'oxygène prend un électron au Fe²⁺. Devenu Fe³⁺, le fer arrache des H⁺ à ses molécules d'eau, qui deviennent des OH ; un OH tenu par deux fers fait pont (deux octaèdres partagent une arête), puis le pont perd son H et devient un oxygène. Très vite, ces ponts assemblent des amas de quelques dizaines de fers : la ferrihydrite, si vite formée que ses atomes n'ont pas le temps de se ranger.", src: ["cornell", "michel"] },
        { de: "frh", vers: "goe", type: "dis", titre: "Ferrihydrite → goethite : se dissoudre pour se reconstruire", cond: "eau qui circule, pH acide (vers 4) ou très basique ; frais et humide ; des mois à des années à 25 °C", v: "Fe(OH)²⁺ dans l'eau, puis doubles chaînes",
          texte: "Instable, la ferrihydrite se redissout peu à peu : des fers repartent dans l'eau en Fe(OH)²⁺ (ou Fe(OH)₄⁻ en milieu très basique). Ailleurs, sur un germe, ils se reposent un à un en doubles chaînes d'octaèdres liées par leurs sommets : la goethite pousse en aiguilles. Plus il y a de fer dissous (pH acide ou très basique), plus ce chemin domine.", src: ["schwertmann83", "cudennec", "cornell"] },
        { de: "frh", vers: "hem", type: "sol", titre: "Ferrihydrite → hématite : se réarranger sans se dissoudre", cond: "pH proche de 7 à 8, chaleur, saisons sèches (sols rouges méditerranéens et tropicaux) ; ralenti par la matière organique et la silice", v: "les amas se collent, l'eau s'en va",
          texte: "Quand le fer dissous est rare (vers pH 7–8, où la ferrihydrite est la moins soluble), les nanoparticules se collent les unes aux autres. À l'intérieur, les OH se rapprochent deux à deux et partent en molécules d'eau ; les fers glissent dans les sites voisins jusqu'à l'arrangement serré du corindon, octaèdres par paires à face commune. Pas de passage par l'eau : c'est une réorganisation dans le solide, favorisée par la chaleur et le dessèchement.", src: ["schwertmann83", "cudennec", "cornell"] },
        { de: "frh", vers: "lep", type: "red", titre: "Ferrihydrite + un peu de Fe²⁺ → lépidocrocite ou goethite, très vite", cond: "sol qui se dessèche après avoir été engorgé : Fe²⁺ dissous au contact de ferrihydrite ; quelques heures à quelques jours", v: "le Fe²⁺ cède son électron au cristal",
          texte: "Un Fe²⁺ se fixe sur la ferrihydrite et lui cède un électron : il devient Fe³⁺ sur place, tandis qu'un fer de l'intérieur devient Fe²⁺, plus soluble, et s'en va. Ce va-et-vient d'électrons dissout la ferrihydrite et reconstruit à côté des minéraux mieux rangés : la lépidocrocite quand le Fe²⁺ est peu abondant, la goethite ensuite ; beaucoup de Fe²⁺ donne de la magnétite.", src: ["hansel", "cornell"] },
        { de: "frh", vers: "mag", type: "red", titre: "Beaucoup de Fe²⁺ : la ferrihydrite devient magnétite", cond: "sans air, Fe²⁺ abondant (eau de nappe, bactéries qui réduisent le fer) ; quelques jours au laboratoire", v: "Fe²⁺ et Fe³⁺ se partagent les sites",
          texte: "Avec beaucoup de Fe²⁺ adsorbé, les électrons passés au cristal y restent : un fer sur trois demeure Fe²⁺ et l'ensemble se reconstruit en spinelle, des octaèdres et des tétraèdres où Fe²⁺ et Fe³⁺ se partagent les sites. C'est l'une des sources de la magnétite fine des sols.", src: ["hansel", "cornell"] },
        { de: "fe2", vers: "fou", type: "ox", titre: "Sans air : la fougérite (rouille verte)", cond: "sol engorgé, nappe qui monte et descend ; Fe²⁺ abondant, juste un peu d'oxydant", v: "un fer sur trois devient Fe³⁺",
          texte: "Quand un peu seulement du Fe²⁺ s'oxyde, les fers s'assemblent en feuillets d'octaèdres à arêtes communes, comme ceux de la brucite, où Fe²⁺ et Fe³⁺ se mêlent ; les Fe³⁺ donnent au feuillet une charge positive, compensée par de l'eau et des anions (carbonate) logés entre les feuillets. Minéral décrit dans les sols hydromorphes de la forêt de Fougères (Ille-et-Vilaine), d'où son nom.", src: ["trolard", "cornell"] },
        { de: "fou", vers: "lep", type: "ox", titre: "L'air revient vite : fougérite → lépidocrocite", cond: "nappe qui baisse, air qui entre d'un coup ; minutes à heures", v: "les Fe²⁺ du feuillet s'oxydent",
          texte: "Les Fe²⁺ du feuillet perdent leur électron, l'eau et les anions s'en vont, et les octaèdres se réassemblent en feuillets doubles : la lépidocrocite, la rouille orange des taches et des racines des sols engorgés. Oxydée lentement, la fougérite peut aussi donner de la goethite, ou rester verte en devenant entièrement ferrique (des OH perdent leur H).", src: ["trolard", "cornell"] },
        { de: "lep", vers: "goe", type: "dis", titre: "Lépidocrocite → goethite, lentement", cond: "des mois à des années ; plus vite en présence de Fe²⁺", v: "dissolution, puis doubles chaînes",
          texte: "La lépidocrocite est moins stable que la goethite, qui a la même formule. Elle se redissout lentement et le fer se repose en doubles chaînes : la goethite remplace peu à peu les taches orange.", src: ["cornell", "gao"] },
        { de: "goe", vers: "hem", type: "sol", titre: "Le feu : goethite → hématite", cond: "250 à 350 °C, sous un feu de forêt ou de culture", v: "les OH partent en eau",
          texte: "Chauffée, la goethite perd ses H : deux OH voisins donnent une molécule d'eau et un oxygène. Les fers se décalent dans le réseau d'oxygènes déjà en place, sans tout reconstruire : l'hématite garde la forme des aiguilles (pseudomorphose), et le sol rougit.", src: ["ketterings", "cornell"] },
        { de: "lep", vers: "mgh", type: "sol", titre: "Le feu : lépidocrocite → maghémite", cond: "250 à 300 °C, avec de la matière organique qui brûle", v: "l'eau part, les fers se rangent en spinelle",
          texte: "En perdant son eau, la lépidocrocite se réarrange en spinelle à lacunes : la maghémite, brun-rouge et aimantée. C'est une des raisons pour lesquelles un sol brûlé attire l'aimant.", src: ["ketterings", "cornell"] },
        { de: "mag", vers: "mgh", type: "ox", titre: "Magnétite → maghémite : s'oxyder sans changer de forme", cond: "à l'air, lentement ; grains de sable ou poussières de feu", v: "les Fe²⁺ sortent, des sites se vident",
          texte: "Les Fe²⁺ de la magnétite migrent vers la surface et y perdent leur électron ; à l'intérieur, des sites se vident. Le réseau d'oxygènes ne bouge pas : le grain garde sa forme, mais tout son fer devient Fe³⁺.", src: ["cornell"] },
        { de: "frh", vers: "fe2", type: "red", titre: "L'eau stagne : tous les oxydes repartent en Fe²⁺", cond: "sol engorgé sans air, bactéries qui « respirent » le fer ; ferrihydrite en minutes, goethite en jours (par fer de surface, au laboratoire)", v: "un électron, puis le Fe²⁺ s'en va",
          texte: "Les bactéries cèdent au fer de surface l'électron qu'elles auraient donné à l'oxygène : Fe³⁺ devient Fe²⁺, tient moins ses oxygènes et part avec l'eau. Les oxydes les plus mal rangés partent les premiers (ferrihydrite, puis lépidocrocite, goethite, hématite). La scène « Au plus près du cristal » de chaque fiche le montre atome par atome.", src: ["larsen", "cornell"] },
      ],
    },
    manganese: {
      titre: "Le manganèse : d'un oxyde à l'autre",
      intro: "Presque tous les oxydes de manganèse des sols sont faits du même octaèdre MnO₆ : en feuillets (vernadite, birnessite, lithiophorite) ou en murs qui enferment des tunnels (todorokite). Le manganèse a trois charges possibles, Mn²⁺, Mn³⁺ et Mn⁴⁺ : ce sont ces changements de charge qui font naître, plier ou disparaître les feuillets.",
      noeuds: { tod: [1, 0], fei: [2, 0], mn2: [0, 1], ver: [1, 1], bir: [2, 1], lit: [2, 2] },
      fl: [
        { de: "mn2", vers: "ver", type: "bio", titre: "Des bactéries et des champignons fabriquent la vernadite", cond: "air présent, pH vers 6 à 8 ; quelques heures à quelques jours, cent mille fois plus vite que sans eux", v: "Mn²⁺ → Mn³⁺ → Mn⁴⁺ sur l'enzyme",
          texte: "Seul, le Mn²⁺ ne s'oxyde presque pas dans l'eau du sol. Des bactéries (Bacillus, Pseudomonas, Leptothrix) et des champignons le font pour lui : une enzyme à cuivre lui retire un électron, puis un second (Mn²⁺ → Mn³⁺ → Mn⁴⁺). Les Mn⁴⁺ s'assemblent aussitôt en nanofeuillets d'octaèdres, percés de sites vides et empilés au hasard : la vernadite, l'enduit noir des sols et des cailloux.", src: ["tebo", "villalobos"] },
        { de: "ver", vers: "bir", type: "sol", titre: "Vernadite → birnessite : les feuillets s'ordonnent", cond: "vieillissement, des mois à des années", v: "les feuillets s'alignent",
          texte: "Les nanofeuillets grandissent et s'empilent régulièrement, à 7 Å l'un de l'autre, avec un plan d'eau et de cations entre eux. Un site sur six reste vide, coiffé d'un Mn³⁺ ou d'un autre cation (zinc, plomb, cobalt) : ces lacunes font de la birnessite un piège à métaux.", src: ["drits", "villalobos"] },
        { de: "bir", vers: "fei", type: "red", titre: "Trop de Mn²⁺ : birnessite → feitknechtite, puis manganite", cond: "Mn²⁺ abondant (front où un sol engorgé se réoxyde), pH 7 à 8,5 ; quelques jours", v: "Mn²⁺ + Mn⁴⁺ → 2 Mn³⁺",
          texte: "Le Mn²⁺ dissous se fixe sur les sites vides et cède un électron à un Mn⁴⁺ voisin : les deux deviennent Mn³⁺. Le Mn³⁺ a des octaèdres étirés (effet Jahn-Teller), qui ne tiennent plus dans le feuillet de birnessite : il se reconstruit en feitknechtite, puis en manganite.", src: ["elzinga", "post99"] },
        { de: "bir", vers: "tod", type: "sol", titre: "Birnessite → todorokite : les feuillets se plient en murs", cond: "Mn³⁺ dans les feuillets et Mg²⁺ entre eux ; lent (il faut chauffer pour l'obtenir au laboratoire)", v: "10 Å, puis les feuillets se plient",
          texte: "Avec des Mg²⁺ entourés d'eau entre eux, les feuillets s'écartent à 10 Å (buserite). Là où des rangées de Mn³⁺ étirés fragilisent le feuillet, celui-ci se plie : des pans de trois octaèdres se redressent et deviennent des murs. Les tunnels de 3 × 3 octaèdres qu'ils enferment gardent l'eau et le Mg²⁺.", src: ["bodei", "atkins", "post99"] },
        { de: "bir", vers: "lit", type: "dis", titre: "Sols acides riches en aluminium : la lithiophorite", cond: "sols acides et lessivés, souvent tropicaux ; lent", v: "Al(OH)₃ entre les feuillets",
          texte: "Dans les sols acides, l'aluminium dissous abonde. Entre deux feuillets de MnO₂ se glisse un feuillet d'octaèdres Al(OH)₃ comme celui de la gibbsite, dont les sites restés vides prennent du lithium. Les H de ses OH tiennent le feuillet de manganèse : la lithiophorite, plus stable, résiste longtemps.", src: ["post94", "post99"] },
        { de: "ver", vers: "mn2", type: "red", titre: "L'eau stagne : le manganèse part avant le fer", cond: "sol engorgé ; polyphénols, bactéries ou Fe²⁺ comme réducteurs ; dès les premiers jours d'inondation", v: "deux électrons : Mn⁴⁺ → Mn²⁺",
          texte: "Un réducteur (polyphénol des feuilles mortes, bactérie, ou Fe²⁺) se fixe sur un Mn⁴⁺ du bord d'un feuillet (vernadite, birnessite) et lui cède deux électrons : devenu Mn²⁺, le manganèse ne tient plus ses oxygènes et part avec l'eau. Cela se fait bien plus vite que pour le fer : dans un sol inondé, le manganèse passe en solution avant lui. Le Fe²⁺ lui-même réduit la birnessite et se dépose en lépidocrocite et goethite : c'est ainsi que fer et manganèse se séparent en taches et en billes de couleurs différentes.", src: ["matocha", "ponna", "gao"] },
      ],
    },
  };
  const DE_MIN = {};
  for (const [el, E] of Object.entries(T)) for (const [k, n] of Object.entries(E.noeuds)) if (M[k].id) DE_MIN[M[k].id] = el;

  // ---------- 4. Dessin du schéma ----------
  const BW = 152, BH = 118, CX = [8, 290, 572], RY = [8, 172, 336];
  const centre = (k, E) => { const [c, r] = E.noeuds[k]; return [CX[c] + BW / 2, RY[r] + BH / 2]; };
  function bord(a, b) {   // point de sortie de la case a vers b
    const [ax, ay] = a, [bx, by] = b, dx = bx - ax, dy = by - ay;
    const t = Math.min(Math.abs((BW / 2 + 4) / (dx || 1e-9)), Math.abs((BH / 2 + 4) / (dy || 1e-9)));
    return [ax + dx * t, ay + dy * t];
  }
  function schema(el, focus) {
    const E = T[el];
    let s = `<svg viewBox="0 0 732 462" class="ot-svg" role="img" aria-label="${E.titre}"><defs><marker id="ot-pointe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" class="ot-pointe"/></marker></defs>`;
    for (const [k] of Object.entries(E.noeuds)) {
      const [c, r] = E.noeuds[k], x = CX[c], y = RY[r], m = M[k], ici = focus && m.id === focus;
      s += `<g class="ot-noeud${ici ? " ot-ici" : ""}" data-ot-n="${k}" tabindex="0" role="button" aria-label="${m.nom}"><rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="8" class="ot-case"/>`
        + `<g transform="translate(${x + 4} ${y + 2}) scale(0.9)">${m.d()}</g><text x="${x + BW / 2}" y="${y + BH - 6}" class="ot-nom">${m.nom}</text></g>`;
    }
    E.fl.forEach((f, i) => {
      const a = centre(f.de, E), b = centre(f.vers, E);
      let [x1, y1] = bord(a, b), [x2, y2] = bord(b, a);
      // flèches parallèles entre deux mêmes cases : décalées
      const jum = E.fl.findIndex((g, j) => j !== i && g.de === f.vers && g.vers === f.de);
      if (jum >= 0) { const n = Math.hypot(x2 - x1, y2 - y1), ox = (-(y2 - y1) / n) * 7, oy = ((x2 - x1) / n) * 7; x1 += ox; y1 += oy; x2 += ox; y2 += oy; }
      const tm = jum < 0 ? 0.5 : i < jum ? 0.36 : 0.64, mx = x1 + (x2 - x1) * tm, my = y1 + (y2 - y1) * tm;
      s += `<g class="ot-passage ot-${f.type}" data-ot-f="${i}" tabindex="0" role="button" aria-label="${i + 1}. ${f.titre}"><path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" class="ot-trait" marker-end="url(#ot-pointe)"/>`
        + `<path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}" class="ot-prise"/><circle cx="${f1(mx)}" cy="${f1(my)}" r="10" class="ot-num"/><text x="${f1(mx)}" y="${f1(my + 4)}" class="ot-num-t">${i + 1}</text></g>`;
    });
    return s + "</svg>";
  }

  // ---------- 5. Les trois vignettes d'un passage ----------
  const SANS_LEG = (svg) => svg.replace(/<text[^>]*class="ot-pt ot-c"[^>]*>[^<]*<\/text>/g, "");
  // vignettes du milieu dessinées à la main pour trois passages clés
  const MILIEUX = {
    "frh>hem": () => {   // deux amas collés ; les OH voisins partent en eau
      let r = "";
      for (const [x0, y0] of [[34, 34], [86, 40]]) for (const [dx, dy] of [[0, 0], [8, 8], [16, 0], [8, -8], [16, 16], [24, 8]]) r += oct(x0 + dx, y0 + dy, 7.5, "fe3");
      for (const [x, y] of [[78, 30], [80, 60], [112, 26]]) r += eau(x, y) + fleche(x, y - 5, x, y - 18, "ot-fl ot-fl-eau");
      return r + txt(80, 94, "amas collés, 2 OH → H₂O + O", "ot-pt ot-c");
    },
    "bir>tod": () => {   // feuillets écartés à 10 Å par Mg²⁺ entouré d'eau ; un pan de trois octaèdres se redresse en mur
      let r = couche(18, 14, 19, 6, "mn4") + couche(18, 74, 19, 6, "mn4");
      for (let k = 0; k < 3; k++) r += oct(78, 36 + k * 9, 6, k === 1 ? "mn3" : "mn4");
      for (const x of [36, 120]) r += ion(x, 46, "2+", "mg") + eau(x - 9, 40) + eau(x + 9, 52) + eau(x + 9, 40);
      return r + txt(80, 96, "10 Å : le feuillet se plie en mur", "ot-pt ot-c");
    },
    "bir>fei": () => {   // Mn²⁺ fixé sur un site vide cède un électron à un Mn⁴⁺ voisin
      let r = couche(18, 44, 19, 6.5, "mn4", { lacune: (k) => k === 9 }) + oct(76.5, 24, 7, "mn2") + elec(92, 30) + fleche(94, 34, 90, 42, "ot-fl ot-fl-e");
      r += oct(89.5, 50.5, 6.5, "mn3");
      return r + txt(80, 90, "Mn²⁺ + Mn⁴⁺ → 2 Mn³⁺", "ot-pt ot-c");
    },
  };
  function milieu(f) {   // vignette « pendant » : le minéral de départ en train de changer, selon le type de passage
    if (MILIEUX[`${f.de}>${f.vers}`]) return MILIEUX[`${f.de}>${f.vers}`]();
    const A = SANS_LEG(M[f.de].d()), B = SANS_LEG(M[f.vers].d());
    const demi = (svg, o, clip) => `<g opacity="${o}"${clip ? ` clip-path="url(#${clip})"` : ""}>${svg}</g>`;
    if (f.type === "dis") return `<clipPath id="ot-c1"><rect x="0" y="0" width="70" height="100"/></clipPath><clipPath id="ot-c2"><rect x="96" y="0" width="64" height="100"/></clipPath>`
      + demi(A, 0.9, "ot-c1") + demi(B, 0.95, "ot-c2") + [[78, 24], [86, 50], [76, 72], [90, 82]].map(([x, y]) => oct(x, y, 4.5, f.de.startsWith("m") || f.de === "ver" || f.de === "bir" ? "mn3" : "fe3") + eau(x + 7, y - 4)).join("") + fleche(70, 40, 80, 40) + fleche(88, 60, 98, 60) + txt(80, 96, "dissous, puis reposés", "ot-pt ot-c");
    if (f.type === "sol") return demi(A, 0.55) + demi(B, 0.45) + [[40, 30], [96, 50], [126, 26]].map(([x, y]) => eau(x, y) + hh(x - 2.6, y - 2.4) + hh(x + 2.6, y - 2.4) + fleche(x, y - 5, x, y - 16, "ot-fl ot-fl-eau")).join("") + txt(80, 96, "réarrangement sur place", "ot-pt ot-c");
    if (f.type === "ox") return demi(A, 0.75) + [[52, 44], [110, 40], [86, 70]].map(([x, y]) => elec(x, y) + fleche(x + 4, y - 4, x + 16, y - 16, "ot-fl ot-fl-e")).join("") + txt(80, 96, "électrons qui partent", "ot-pt ot-c");
    if (f.type === "red") return demi(A, 0.75) + [[52, 44], [110, 40], [86, 70]].map(([x, y]) => fleche(x + 16, y - 16, x + 5, y - 5, "ot-fl ot-fl-e") + elec(x + 18, y - 18)).join("") + txt(80, 96, "électrons qui arrivent", "ot-pt ot-c");
    if (f.type === "bio") return `<rect x="16" y="56" width="128" height="26" rx="13" class="ot-bact"/>` + [[44, 50], [80, 46], [116, 50]].map(([x, y], i) => oct(x, y - 14, 7, ["mn2", "mn3", "mn4"][i]) + (i < 2 ? fleche(x + 9, y - 14, x + 27, y - 14) : "")) .join("") + elec(62, 22) + elec(98, 22) + txt(80, 96, "Mn²⁺ → Mn³⁺ → Mn⁴⁺", "ot-pt ot-c");
    return A;
  }
  function vignettes(f) {
    const cadre = (svg, t) => `<figure class="ot-vig"><svg viewBox="0 0 160 100" aria-hidden="true"><defs><marker id="ot-pointe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" class="ot-pointe"/></marker></defs>${svg}</svg><figcaption>${t}</figcaption></figure>`;
    return `<div class="ot-vigs">${cadre(M[f.de].d(), `Avant · ${M[f.de].nom}`)}<span class="ot-vig-fl" aria-hidden="true">→</span>${cadre(milieu(f), `Pendant · ${f.v}`)}<span class="ot-vig-fl" aria-hidden="true">→</span>${cadre(M[f.vers].d(), `Après · ${M[f.vers].nom}`)}</div>`;
  }
  const NOM_TYPE = { ox: "oxydation", red: "réduction", dis: "dissolution puis recristallisation", sol: "réarrangement dans le solide", bio: "oxydation par des êtres vivants" };
  function detail(el, i) {
    const f = T[el].fl[i], lien = (k) => (M[k].id && window.MINERAUX && MINERAUX[M[k].id] ? `<button class="min-chip" data-min="${M[k].id}">${M[k].nom}</button>` : `<b>${M[k].nom}</b>`);
    return `<h3>${i + 1}. ${f.titre}</h3><p class="ot-cond"><span class="ot-type ot-${f.type}">${NOM_TYPE[f.type]}</span> ${f.cond}</p>${vignettes(f)}<p>${f.texte}</p><p class="ot-liens">${lien(f.de)} → ${lien(f.vers)}</p>`;
  }
  function detailNoeud(el, k) {
    const E = T[el], m = M[k], de = E.fl.map((f, i) => [f, i]).filter(([f]) => f.vers === k), va = E.fl.map((f, i) => [f, i]).filter(([f]) => f.de === k);
    const li = (L) => L.map(([f, i]) => `<li><button class="ot-lien" data-ot-f="${i}">${i + 1}. ${f.titre}</button></li>`).join("");
    return `<h3>${m.nom} <span class="ot-f">${m.f}</span></h3><div class="ot-vigs ot-vigs-1"><figure class="ot-vig ot-vig-g"><svg viewBox="0 0 160 100" aria-hidden="true">${m.d()}</svg></figure></div>`
      + (de.length ? `<p><b>Il naît de :</b></p><ul class="ot-l">${li(de)}</ul>` : "") + (va.length ? `<p><b>Il devient :</b></p><ul class="ot-l">${li(va)}</ul>` : "")
      + (m.id && window.MINERAUX && MINERAUX[m.id] ? `<p class="ot-liens"><button class="min-chip" data-min="${m.id}">Fiche ${m.nom.toLowerCase()} →</button></p>` : "");
  }

  // ---------- 6. Carte ----------
  function carte(el, focus) {
    const E = T[el];
    if (!E) return "";
    const sources = [...new Set(E.fl.flatMap((f) => f.src))].map((k) => `<li>${SRC[k]}</li>`).join("");
    const premier = focus ? E.fl.findIndex((f) => M[f.vers].id === focus || M[f.de].id === focus) : 0;
    return `<div class="card ot" data-ot="${el}" data-ot-focus="${focus || ""}">
      <h2>${E.titre}</h2>
      <p class="sub">${E.intro}</p>
      <div class="ot-cadre">${schema(el, focus)}</div>
      <div class="ot-leg"><span><i class="ot-l-ox"></i>oxydation</span><span><i class="ot-l-red"></i>réduction</span><span><i class="ot-l-dis"></i>dissolution puis recristallisation</span><span><i class="ot-l-sol"></i>réarrangement dans le solide</span>${el === "manganese" ? `<span><i class="ot-l-bio"></i>par des êtres vivants</span>` : ""}</div>
      <div class="ot-detail" aria-live="polite">${detail(el, Math.max(0, premier))}</div>
      <p class="note">Un losange = un octaèdre (le métal au centre, six oxygènes ou OH autour), vu de côté ; deux losanges qui se touchent par un côté partagent une arête, par une pointe un sommet ; triangle = tétraèdre. Dessins schématiques : proportions et angles simplifiés.</p>
      <details class="ot-sources"><summary>Sources</summary><ul>${sources}</ul></details>
    </div>`;
  }
  function monter(racine) {
    (racine || document).querySelectorAll(".ot[data-ot]").forEach((c) => {
      if (c._ot) return;
      c._ot = true;
      const el = c.dataset.ot, det = c.querySelector(".ot-detail");
      const allume = (sel) => { c.querySelectorAll(".ot-on").forEach((x) => x.classList.remove("ot-on")); const x = c.querySelector(sel); if (x) x.classList.add("ot-on"); };
      const choisir = (t) => {
        const f = t.closest("[data-ot-f]"), n = t.closest("[data-ot-n]");
        if (f) { det.innerHTML = detail(el, +f.dataset.otF); allume(`.ot-svg [data-ot-f="${f.dataset.otF}"]`); return true; }
        if (n) { det.innerHTML = detailNoeud(el, n.dataset.otN); allume(`.ot-svg [data-ot-n="${n.dataset.otN}"]`); return true; }
        return false;
      };
      c.addEventListener("click", (e) => { if (choisir(e.target)) e.stopPropagation(); });
      c.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && choisir(e.target)) e.preventDefault(); });
      const i0 = c.dataset.otFocus ? T[el].fl.findIndex((f) => M[f.vers].id === c.dataset.otFocus || M[f.de].id === c.dataset.otFocus) : 0;
      allume(`.ot-svg [data-ot-f="${Math.max(0, i0)}"]`);
    });
  }
  window.OxTransfo = { carte, monter, carteMineral: (id) => (DE_MIN[id] ? carte(DE_MIN[id], id) : ""), T, M,
    controle() {   // chaque passage relie deux minéraux dessinés ; chaque source citée existe
      const R = [];
      for (const [el, E] of Object.entries(T)) E.fl.forEach((f, i) => {
        if (!E.noeuds[f.de] || !E.noeuds[f.vers]) R.push(`${el} ${i + 1} : case absente`);
        for (const s of f.src) if (!SRC[s]) R.push(`${el} ${i + 1} : source ${s}`);
      });
      return R;
    } };
})();
