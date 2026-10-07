// ═══════════════════════════════════════════════════════════════════════════════
// identite.js — la carte « Identité » des fiches minéraux en images (01/10/2026)
// Chaque propriété montre TOUTES les possibilités, celle(s) du minéral en couleur :
//   système cristallin : les 7 mailles dessinées (cubique… triclinique) ;
//   éclat : les 10 éclats usuels ; famille : les 10 classes de Strunz ;
//   couleurs : une pastille par couleur citée dans la fiche (le texte reste dessous).
// Tout est déduit du texte des fiches (aucune donnée nouvelle) ; ce qui n'est pas reconnu n'est pas allumé.
// Usage : Identite.html(id) → HTML (rangées) ; aucune mesure de largeur, rien à rebrancher.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const sansAccent = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // ─────────── systèmes cristallins ───────────
  // vecteurs de maille typiques (a, b, c, α, β, γ) choisis pour que la différence se VOIE ; « regle » = ce qui définit le système
  const SYSTEMES = [
    { k: "cubique", nom: "Cubique", m: [1, 1, 1, 90, 90, 90], regle: "a = b = c, trois angles droits" },
    { k: "quadratique", nom: "Quadra\u00adtique", m: [1, 1, 1.45, 90, 90, 90], regle: "a = b ≠ c, trois angles droits" },
    { k: "orthorhombique", nom: "Ortho\u00adrhom\u00adbique", m: [1.25, 0.8, 1.45, 90, 90, 90], regle: "a ≠ b ≠ c, trois angles droits" },
    { k: "hexagonal", nom: "Hexagonal", hex: true, regle: "prisme à six côtés : a = b, angle de 120°, axe c d'ordre 6" },
    { k: "trigonal", nom: "Trigonal", m: [1, 1, 1, 72, 72, 72], regle: "axe de symétrie d'ordre 3 ; maille hexagonale (comme le quartz) ou en rhomboèdre, a = b = c et trois angles égaux non droits (comme la calcite)" },
    { k: "monoclinique", nom: "Mono\u00adclinique", m: [1.2, 0.85, 1.4, 90, 112, 90], regle: "a ≠ b ≠ c, un seul angle non droit" },
    { k: "triclinique", nom: "Tri\u00adclinique", m: [1.15, 0.9, 1.35, 78, 106, 84], regle: "a ≠ b ≠ c, aucun angle droit" },
  ];
  const MOTS_SYS = [["cubique", /cubique/], ["quadratique", /quadratique|tetragonal/], ["orthorhombique", /orthorhombique/],
    ["trigonal", /trigonal|rhomboedrique/], ["hexagonal", /hexagonal/], ["monoclinique", /monoclinique/], ["triclinique", /triclinique/]];
  function systemesDe(texte) {
    const t = sansAccent(texte || "");
    const res = MOTS_SYS.map(([k, re]) => [k, t.search(re)]).filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1]).map(([k]) => k);
    // « monoclinique (pseudo-cubique) », « monoclinique (cubique > 173 °C) » : seul le premier système cité est le vrai ;
    // « monoclinique / triclinique » : les deux
    return /pseudo-|>|basse t/.test(t) ? res.slice(0, 1) : res;
  }
  // petite maille en perspective cavalière (40 × 40)
  function iconeMaille(S) {
    const r = (d) => d * Math.PI / 180;
    let P, aretes;
    if (S.hex) {
      P = [];
      for (let z = 0; z < 2; z++) for (let i = 0; i < 6; i++) {
        const a = r(60 * i + 15);
        P.push([Math.cos(a) * 0.75, Math.sin(a) * 0.75, z * 1.4]);
      }
      aretes = [];
      for (let i = 0; i < 6; i++) aretes.push([i, (i + 1) % 6], [6 + i, 6 + (i + 1) % 6], [i, 6 + i]);
    } else {
      const [a, b, c, al, be, ga] = S.m;
      const A = [a, 0, 0], B = [b * Math.cos(r(ga)), b * Math.sin(r(ga)), 0];
      const cx = c * Math.cos(r(be)), cy = c * (Math.cos(r(al)) - Math.cos(r(be)) * Math.cos(r(ga))) / Math.sin(r(ga));
      const C = [cx, cy, Math.sqrt(Math.max(0, c * c - cx * cx - cy * cy))];
      P = [];
      for (const i of [0, 1]) for (const j of [0, 1]) for (const k of [0, 1])
        P.push([0, 1, 2].map((q) => i * A[q] + j * B[q] + k * C[q]));
      // sommets (i, j, k) → index 4i + 2j + k
      aretes = [[0, 4], [2, 6], [1, 5], [3, 7], [0, 2], [4, 6], [1, 3], [5, 7], [0, 1], [4, 5], [2, 3], [6, 7]];
    }
    // projection : x vers la droite, y en profondeur (oblique), z vers le haut
    const pr = (p) => [p[0] + p[1] * 0.45, -p[2] - p[1] * 0.3];
    const Q = P.map(pr);
    const xs = Q.map((q) => q[0]), ys = Q.map((q) => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const k = 30 / Math.max(x1 - x0, y1 - y0);
    const ox = 20 - (x0 + x1) / 2 * k, oy = 20 - (y0 + y1) / 2 * k;
    const lignes = aretes.map(([i, j]) => `<line x1="${(Q[i][0] * k + ox).toFixed(1)}" y1="${(Q[i][1] * k + oy).toFixed(1)}" x2="${(Q[j][0] * k + ox).toFixed(1)}" y2="${(Q[j][1] * k + oy).toFixed(1)}"/>`).join("");
    return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">${lignes}</svg>`;
  }
  function systemeHTML(texte) {
    const on = systemesDe(texte);
    const t = sansAccent(texte || "");
    const sansReseau = !on.length && /amorphe|liquide|melange|non disponible|sans reseau|nanocristallin/.test(t);
    const cases = SYSTEMES.map((S) => `<div class="id-sys${on.includes(S.k) ? " on" : ""}">${iconeMaille(S)}<span>${S.nom}</span></div>`).join("");
    const regle = on.length ? on.map((k) => SYSTEMES.find((S) => S.k === k)).map((S) => `<b>${S.nom.replace(/\u00ad/g, "")}</b> : ${S.regle}.`).join(" ")
      : sansReseau ? "Pas de réseau cristallin : aucune des sept mailles." : "";
    return `<div class="id-systemes">${cases}</div>${regle ? `<p class="id-note">${regle}</p>` : ""}`;
  }

  // ─────────── éclat ───────────
  // pastille : un petit disque dont le rendu évoque l'éclat (reflet net, nacre, fibres, mat…)
  const ECLATS = [
    { k: "metallique", nom: "métallique", re: /metallique/ },
    { k: "submetallique", nom: "sub-métallique", re: /sub-?metallique|semi-metallique/ },
    { k: "adamantin", nom: "adamantin", re: /adamantin/ },
    { k: "vitreux", nom: "vitreux", re: /vitreux/ },
    { k: "resineux", nom: "résineux", re: /resineux|poisseux/ },
    { k: "gras", nom: "gras", re: /gras/ },
    { k: "cireux", nom: "cireux", re: /cireux/ },
    { k: "nacre", nom: "nacré", re: /nacre/ },
    { k: "soyeux", nom: "soyeux", re: /soyeux/ },
    { k: "mat", nom: "mat ou terreux", re: /\bmat\b|terne|terreux|crayeux/ },
  ];
  function eclatHTML(texte) {
    const t = sansAccent(texte || "");
    const sansSub = t.replace(/sub-?metallique|semi-metallique/g, " ");
    const chips = ECLATS.map((E) => {
      const on = E.k === "metallique" ? /metallique/.test(sansSub) : E.re.test(t);
      return `<span class="id-chip${on ? " on" : ""}"><i class="id-ecl id-ecl-${E.k}"></i>${E.nom}</span>`;
    }).join("");
    return `<div class="id-rang id-eclats">${chips}</div>`;
  }

  // ─────────── couleurs ───────────
  // mots de couleur repérés dans le texte, dans leur ordre d'apparition (un nom de variété entre parenthèses n'est pas une couleur)
  const COULEURS = [
    ["incolore", "incolore", null], ["blanc", "blanc|blanche|laiteux|creme|crayeux", "#f3f0e7"], ["gris", "gris|grise", "#9b9a95"],
    ["noir", "noir|noire", "#1d1d1d"], ["rouge", "rouge|sang", "#b5302b"], ["rose", "rose|saumon", "#e7a2ad"],
    ["orange", "orange|orangé", "#e3893b"], ["jaune", "jaune|citrine|paille", "#e8c74a"], ["miel", "miel|ambre", "#c98d36"],
    ["vert", "vert|verte|olive|pistache|emeraude", "#4c8a4b"], ["bleu", "bleu|bleue|azur", "#3a6db4"],
    ["violet", "violet|violette|pourpre|lilas", "#7c4f9f"], ["brun", "brun|brune|ocre|marron|bronze", "#7a5232"],
    ["laiton", "laiton|dore|doree|or\\b(?! natif)", "#d2b34e"], ["argent", "argente|argentee|argent\\b|etain", "#c8cacd"],
    ["cuivre", "cuivre|cuivree", "#b8714a"], ["acier", "acier|plomb", "#6f7c88"],
  ];
  function couleursHTML(texte) {
    const t = sansAccent((texte || "").replace(/\([^)]*\)/g, " "));
    const vus = [];
    for (const [nom, motif, hex] of COULEURS) {
      const m = new RegExp("(^|[^a-z])(" + motif + ")", "g").exec(t);
      if (m) vus.push({ nom, hex, pos: m.index });
    }
    vus.sort((a, b) => a.pos - b.pos);
    if (!vus.length) return "";
    return `<div class="id-couleurs">${vus.map((c) => `<span class="id-coul"><i${c.hex ? ` style="background:${c.hex}"` : ' class="id-incolore"'}></i>${c.nom}</span>`).join("")}</div>`;
  }

  // ─────────── famille : les 10 classes de Strunz ───────────
  function familleHTML(id) {
    if (typeof MIN_CLASSIF === "undefined") return "";
    const ici = MIN_CLASSIF.find((c) => c.groupes.some((g) => (g.mineraux || []).includes(id)));
    const classes = MIN_CLASSIF.slice().sort((a, b) => a.n - b.n);
    // une seule ligne : numéro de la classe et nom court (« Sulfures & sulfosels » → « Sulfures »), le nom complet en titre
    const court = (c) => c.classe.split(/\s*[&,]\s*|\s+et\s+/)[0].replace(/^Éléments natifs$/, "Natifs").replace(/^Composés organiques$/, "Organiques");
    return `<div class="id-rang id-strunz">${classes.map((c) => `<a href="#mincls/${c.n}" class="id-chip${ici && ici.n === c.n ? " on" : ""}" aria-label="${esc(c.classe)}"><b>${c.num}</b><span>${esc(court(c))}</span></a>`).join("")}</div>`;
  }

  function ligne(lib, valeur, visuel) {
    if (!valeur && !visuel) return "";
    return `<div class="id-ligne"><div class="id-tete"><span>${lib}</span><b>${valeur ? esc(valeur) : ""}</b></div>${visuel || ""}</div>`;
  }
  function html(id) {
    const m = MINERAUX[id];
    if (!m) return "";
    return `<div class="id-grille">
      ${ligne("Système cristallin", m.systeme, systemeHTML(m.systeme))}
      ${ligne("Éclat", m.eclat, eclatHTML(m.eclat))}
      ${m.couleurs ? ligne("Couleurs", "", couleursHTML(m.couleurs) + `<p class="id-note">${esc(m.couleurs)}</p>`) : ""}
      ${ligne("Famille (classes de Strunz)", m.famille, familleHTML(id))}
      ${m.ima ? ligne("Statut IMA", m.ima, "") : ""}
    </div>`;
  }

  // systemeHTML, couleursHTML, ligne : aussi employés par les fiches d'espèces d'argiles (argiles-especes-page.js)
  window.Identite = { html, systemesDe, SYSTEMES, systemeHTML, couleursHTML, ligne };
})();
