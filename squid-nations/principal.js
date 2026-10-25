// web/src/rendu/camera.ts
var Camera = class _Camera {
  emprise;
  boucle;
  cx;
  cy;
  echelle;
  /** taille de la vue en pixels CSS */
  largeur;
  hauteur;
  cible;
  ancreEcran;
  ancreMonde;
  /** échelle maximale : 1 km = 48 pixels */
  static ECHELLE_MAX = 48;
  /** `boucle` > 0 : la carte se répète en x tous les `boucle` km (monde, H.2) ; le centre reste
   *  dans [x_min, x_min + boucle) et la vue ne dépasse ni le haut ni le bas. */
  constructor(emprise, boucle = 0) {
    this.emprise = emprise;
    this.boucle = boucle;
    this.largeur = 1;
    this.hauteur = 1;
    this.ancreEcran = [
      0,
      0
    ];
    this.ancreMonde = [
      0,
      0
    ];
    this.cx = (emprise.x_min + emprise.x_max) / 2;
    this.cy = (emprise.y_min + emprise.y_max) / 2;
    this.echelle = this.cible = 1;
  }
  /** Échelle qui montre toute la carte. */
  echelleMin() {
    const e = this.emprise;
    if (this.boucle > 0) return Math.max(this.hauteur / (e.y_max - e.y_min), this.largeur / this.boucle);
    return Math.min(this.largeur / (e.x_max - e.x_min), this.hauteur / (e.y_max - e.y_min));
  }
  redimensionner(largeur, hauteur) {
    const premiere = this.largeur === 1 && this.hauteur === 1;
    this.largeur = Math.max(1, largeur);
    this.hauteur = Math.max(1, hauteur);
    if (premiere) this.vueEnsemble();
    this.echelle = this.cible = Math.max(this.echelleMin(), this.echelle);
    this.borner();
  }
  vueEnsemble() {
    const e = this.emprise;
    this.cx = (e.x_min + e.x_max) / 2;
    this.cy = (e.y_min + e.y_max) / 2;
    this.echelle = this.cible = this.echelleMin();
  }
  versMonde(px, py) {
    return [
      this.cx + (px - this.largeur / 2) / this.echelle,
      this.cy - (py - this.hauteur / 2) / this.echelle
    ];
  }
  versEcran(x, y) {
    return [
      (x - this.cx) * this.echelle + this.largeur / 2,
      (this.cy - y) * this.echelle + this.hauteur / 2
    ];
  }
  /** Décale la vue de (dx, dy) pixels (glisser). */
  deplacer(dx, dy) {
    this.cx -= dx / this.echelle;
    this.cy += dy / this.echelle;
    this.ancreMonde = [
      this.ancreMonde[0] - dx / this.echelle,
      this.ancreMonde[1] + dy / this.echelle
    ];
    this.borner();
  }
  /** Demande un zoom de `facteur` autour du point écran (px, py) ; appliqué par `animer`. */
  zoomer(facteur, px, py) {
    this.cible = borne(this.cible * facteur, this.echelleMin(), _Camera.ECHELLE_MAX);
    this.ancreEcran = [
      px,
      py
    ];
    this.ancreMonde = this.versMonde(px, py);
  }
  /** Zoom immédiat (sans animation). */
  zoomerTout(facteur, px, py) {
    this.zoomer(facteur, px, py);
    this.appliquer(this.cible);
  }
  /** Avance l'animation du zoom ; rend vrai si la vue a changé. */
  animer(dtMs) {
    if (Math.abs(Math.log(this.cible / this.echelle)) < 2e-3) {
      if (this.echelle !== this.cible) {
        this.appliquer(this.cible);
        return true;
      }
      return false;
    }
    const k = 1 - Math.exp(-dtMs / 65);
    this.appliquer(Math.exp(Math.log(this.echelle) + (Math.log(this.cible) - Math.log(this.echelle)) * k));
    return true;
  }
  enMouvement() {
    return this.echelle !== this.cible;
  }
  appliquer(echelle) {
    this.echelle = echelle;
    const [px, py] = this.ancreEcran;
    const [mx, my] = this.ancreMonde;
    this.cx = mx - (px - this.largeur / 2) / echelle;
    this.cy = my + (py - this.hauteur / 2) / echelle;
    this.borner();
  }
  /** Le centre reste sur la carte. */
  borner() {
    const e = this.emprise;
    if (this.boucle > 0) {
      const b = this.boucle;
      const dx = ((this.cx - e.x_min) % b + b) % b + e.x_min - this.cx;
      this.cx += dx;
      this.ancreMonde[0] += dx;
      const demi = this.hauteur / 2 / this.echelle;
      this.cy = 2 * demi >= e.y_max - e.y_min ? (e.y_min + e.y_max) / 2 : borne(this.cy, e.y_min + demi, e.y_max - demi);
      return;
    }
    this.cx = borne(this.cx, e.x_min, e.x_max);
    this.cy = borne(this.cy, e.y_min, e.y_max);
  }
};
function borne(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// web/src/carte/donnees.ts
var MER = 0;
var LAC = 250;
async function decompresser(octets) {
  const flux2 = new Blob([
    octets
  ]).stream().pipeThrough(new DecompressionStream("deflate"));
  return await new Response(flux2).arrayBuffer();
}
var RANG_NAVIGABLE = 6;

// web/src/rendu/couleurs.ts
var MER_RGB = [
  18,
  43,
  64
];
var LAC_RGB = [
  43,
  90,
  122
];
var HORS_JEU_RGB = [
  74,
  76,
  72
];
var PALETTE = [
  [
    201,
    169,
    110
  ],
  [
    150,
    170,
    95
  ],
  [
    205,
    125,
    90
  ],
  [
    130,
    160,
    185
  ],
  [
    175,
    135,
    175
  ],
  [
    110,
    170,
    145
  ],
  [
    225,
    210,
    160
  ],
  [
    150,
    115,
    95
  ]
];
function colorier(idsPays, v, nCouleurs = PALETTE.length) {
  const ordre = [
    ...idsPays
  ].sort((a, b) => v[b].size - v[a].size || a - b);
  const couleur = /* @__PURE__ */ new Map();
  for (const id of ordre) {
    const prises = new Set([
      ...v[id]
    ].map((w) => couleur.get(w)).filter((c2) => c2 !== void 0));
    let meilleure = -1;
    let usage = Infinity;
    for (let c2 = 0; c2 < nCouleurs; c2++) {
      if (prises.has(c2)) continue;
      const u = [
        ...couleur.values()
      ].filter((x) => x === c2).length;
      if (u < usage) {
        usage = u;
        meilleure = c2;
      }
    }
    couleur.set(id, meilleure >= 0 ? meilleure : id % nCouleurs);
  }
  return couleur;
}
function tablePalette(couleurParPays) {
  const t = new Uint8Array(256 * 4);
  const poser = (i, [r, g, b]) => t.set([
    r,
    g,
    b,
    255
  ], i * 4);
  for (let i = 0; i < 256; i++) poser(i, HORS_JEU_RGB);
  poser(MER, MER_RGB);
  poser(LAC, LAC_RGB);
  for (const [id, c2] of couleurParPays) poser(id, PALETTE[c2]);
  return t;
}

// web/src/rendu/dessins/outils.ts
var PALETTE2 = {
  k: "#1d1a17",
  w: "#f6eedb",
  s: "#d4c6a6",
  r: "#c8503d",
  R: "#93372b",
  q: "#e0745c",
  g: "#b3b8bd",
  G: "#7a8187",
  z: "#4b5157",
  a: "#d9dee2",
  b: "#9cc8e6",
  B: "#5e8fb5",
  e: "#3a3f46",
  i: "#f4d77a",
  d: "#6b4a2f",
  t: "#8f6a45",
  y: "#f2c14e",
  Y: "#b98a2a",
  x: "#d63a2f",
  v: "#6d9c4a",
  V: "#4c7535",
  f: "#ece8de",
  c: "#ffffff",
  n: "#2f6fa8",
  l: "#7fb2d8",
  L: "#4f86b8",
  m: "#6f7d3a",
  M: "#4f5a28",
  p: "#6a5a8c",
  o: "#d98a3a",
  u: "#3f6fb0",
  S: "#dcc58f",
  Q: "#b49c64",
  T: "#6e5236",
  U: "#94714a",
  h: "#5aa58f",
  H: "#3f7f6c",
  N: "#2a4f8f"
};
var Grille = class {
  w;
  h;
  p;
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.p = new Array(w * h).fill(".");
  }
  set(x, y, c2) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h && Number.isInteger(x) && Number.isInteger(y)) this.p[y * this.w + x] = c2;
  }
  get(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.p[y * this.w + x] : ".";
  }
};
function dessiner(w, h, sol, f) {
  const g = new Grille(w, h);
  f(g, sol);
  return rogner(g, sol);
}
function rogner(g, sol) {
  let x0 = g.w, y0 = g.h, x1 = -1, y1 = -1;
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; x++) {
      if (g.get(x, y) === ".") continue;
      x0 = Math.min(x0, x), y0 = Math.min(y0, y), x1 = Math.max(x1, x), y1 = Math.max(y1, y);
    }
  }
  const r = new Grille(x1 - x0 + 1, y1 - y0 + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) r.set(x - x0, y - y0, g.get(x, y));
  return {
    grille: r,
    sol: Math.min(sol - y0, r.h - 1)
  };
}
function texte(lignes) {
  const g = new Grille(lignes[0].length, lignes.length);
  lignes.forEach((l, y) => [
    ...l
  ].forEach((c2, x) => g.set(x, y, c2)));
  return g;
}
function rect(g, x, y, w, h, c2) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g.set(i, j, c2);
}
function boite(g, x, y, w, h, c2, ombre, nOmbre = 1) {
  rect(g, x, y, w, h, "k");
  rect(g, x + 1, y + 1, w - 2, h - 2, c2);
  if (ombre) rect(g, x + w - 1 - nOmbre, y + 1, nOmbre, h - 2, ombre);
}
function points(g, liste, c2) {
  for (const [x, y] of liste) g.set(x, y, c2);
}
function pignon(g, x, yAvant, w, clair = "r", sombre = "R") {
  for (let j = 0; ; j++) {
    const a = x + j, b = x + w - 1 - j, y = yAvant - j;
    if (b - a < 1) {
      g.set(a, y, "k");
      if (b === a + 1) g.set(b, y, "k");
      break;
    }
    for (let i = a; i <= b; i++) {
      g.set(i, y, i === a || i === b || j === 0 ? "k" : i <= (a + b) / 2 ? j % 2 && i === a + 1 ? "q" : clair : sombre);
    }
  }
}
function fenetre(g, x, y) {
  g.set(x, y, "b"), g.set(x + 1, y, "b"), g.set(x, y + 1, "B"), g.set(x + 1, y + 1, "B");
}

// web/src/rendu/dessins/petits.ts
function bat(g, x0, yb, w, hm, toit = "pignon", mur = "w") {
  const yt = yb - hm + 1;
  const ombre = mur === "w" ? "s" : "G";
  for (let y = yt; y <= yb; y++) for (let x = x0; x < x0 + w; x++) {
    const bord = x === x0 || x === x0 + w - 1 || y === yt || y === yb;
    let c2 = bord ? "k" : x === x0 + w - 2 && w > 3 ? ombre : mur;
    const ix = x - x0, iy = y - yt;
    if (!bord && mur !== "w" && ix % 2 === 1 && iy % 2 === 1 && iy < hm - 2) c2 = "b";
    if (!bord && mur === "w" && hm >= 5 && ix % 2 === 1 && iy % 2 === 1 && iy < hm - 2) c2 = "e";
    if (!bord && toit === "pignon" && w >= 5 && y === yb - 1 && ix === w - 1 >> 1) c2 = "e";
    g.set(x, y, c2);
  }
  if (toit === "pignon") {
    for (let j = 1; ; j++) {
      const a = x0 + j - 1, b = x0 + w - j;
      if (b - a < 1) {
        g.set(a, yt - j, "k");
        break;
      }
      for (let x = a; x <= b; x++) g.set(x, yt - j, x === a || x === b ? "k" : x <= (a + b) / 2 ? "r" : "R");
    }
  } else if (toit === "fleche") {
    const cx = x0 + (w >> 1);
    for (let j = 1; j <= 3; j++) {
      g.set(cx - 1, yt - j, "k");
      g.set(cx, yt - j, j === 1 ? "R" : "r");
      g.set(cx + 1, yt - j, "k");
    }
    g.set(cx, yt - 4, "k");
  } else if (toit === "dome") {
    for (let j = 1; ; j++) {
      const a = x0 + j, b = x0 + w - 1 - j;
      if (b - a < 2) {
        g.set(a, yt - j, "k");
        g.set(b, yt - j, "k");
        if (b > a) g.set(a + 1, yt - j, "k");
        break;
      }
      for (let x = a; x <= b; x++) g.set(x, yt - j, x === a || x === b ? "k" : x <= (a + b) / 2 ? "y" : "Y");
    }
    const cx = x0 + (w >> 1);
    let y = yt;
    while (g.get(cx, y - 1) !== ".") y--;
    for (let k = 1; k <= 4; k++) g.set(cx, y - k, "k");
    g.set(cx + 1, y - 4, "x");
    g.set(cx + 2, y - 4, "x");
    g.set(cx + 1, y - 3, "x");
    g.set(cx + 2, y - 3, "x");
  } else if (toit === "antenne") {
    g.set(x0 + (w >> 1), yt - 1, "k");
    g.set(x0 + (w >> 1), yt - 2, "k");
  }
}
var compo = (liste) => dessiner(40, 30, 28, (g, sol) => {
  for (const [x, w, h, t, m] of liste) bat(g, x + 5, sol, w, h, t, m);
});
var pose = (lignes, dessous = 0) => ({
  grille: texte(lignes),
  sol: lignes.length - 1 - dessous
});
var VILLES_LOIN = [
  [
    "village",
    compo([
      [
        0,
        5,
        3
      ]
    ])
  ],
  [
    "bourg",
    compo([
      [
        2,
        3,
        5,
        "fleche"
      ],
      [
        0,
        5,
        3
      ],
      [
        4,
        5,
        3
      ]
    ])
  ],
  [
    "petite ville",
    compo([
      [
        4,
        3,
        6,
        "fleche"
      ],
      [
        0,
        5,
        4
      ],
      [
        7,
        5,
        4
      ],
      [
        2,
        5,
        3
      ],
      [
        6,
        5,
        3
      ]
    ])
  ],
  [
    "ville",
    compo([
      [
        1,
        4,
        7,
        "plat",
        "g"
      ],
      [
        9,
        4,
        8,
        "antenne",
        "g"
      ],
      [
        6,
        3,
        8,
        "fleche"
      ],
      [
        0,
        5,
        4
      ],
      [
        4,
        5,
        3
      ],
      [
        8,
        5,
        4
      ],
      [
        11,
        4,
        3
      ]
    ])
  ],
  [
    "grande ville",
    compo([
      [
        2,
        5,
        10,
        "plat",
        "g"
      ],
      [
        6,
        5,
        14,
        "antenne",
        "g"
      ],
      [
        11,
        5,
        11,
        "plat",
        "g"
      ],
      [
        15,
        3,
        8,
        "plat",
        "g"
      ],
      [
        0,
        5,
        5
      ],
      [
        4,
        5,
        4
      ],
      [
        9,
        5,
        5
      ],
      [
        13,
        5,
        4
      ],
      [
        16,
        4,
        3
      ]
    ])
  ],
  [
    "capitale",
    compo([
      [
        1,
        5,
        9,
        "plat",
        "g"
      ],
      [
        14,
        5,
        11,
        "antenne",
        "g"
      ],
      [
        5,
        9,
        6,
        "dome"
      ],
      [
        0,
        5,
        4
      ],
      [
        3,
        5,
        3
      ],
      [
        12,
        5,
        4
      ],
      [
        16,
        4,
        3
      ]
    ])
  ]
];
var BATIMENTS_LOIN = [
  [
    "usine",
    pose([
      "..........kk.",
      "..........ff.",
      ".........kGGk",
      "k..k..k..kGGk",
      "kRkkRkkRkkGGk",
      "kRRkRRkRRkGGk",
      "kkkkkkkkkkkkk",
      "kgegegegegegk",
      "kgggggggggggk",
      "kkkkkkkkkkkkk"
    ])
  ],
  [
    "c. nucl\xE9aire",
    pose([
      "..ff...ff...",
      ".ffff.ffff..",
      ".kggk.kggk..",
      "..kgk..kgk..",
      "..kgk..kgk..",
      ".kgGgkkgGgk.",
      "kggGggggGggk",
      "kkkkkkkkkkkk"
    ])
  ],
  [
    "c. thermique",
    pose([
      ".ff.....ff...",
      "ff.....ff....",
      "kxk....kxk...",
      "kwk....kwk...",
      "kxk....kxk...",
      "kwkkkkkkwkkkk",
      "kgggggggggGGk",
      "kgegegegegGGk",
      "kkkkkkkkkkkkk"
    ])
  ],
  [
    "c. hydraulique",
    pose([
      "kkkkkkkkkkk",
      "lllkgggk...",
      "lllkgGgk...",
      "llkggGggk..",
      "llkggGggk..",
      "lkgggGgggkl",
      "kkkkkkkkkkk"
    ])
  ],
  [
    "\xE9olien",
    pose([
      "k.....k",
      ".k...k.",
      "..kwk..",
      "...k...",
      "...k...",
      "...k...",
      "...k...",
      "..kkk.."
    ])
  ],
  [
    "solaire",
    pose([
      "...kkkkkkkk",
      "..kbnbnbnk.",
      ".kbnbnbnk..",
      "kkkkkkkkk..",
      "..k....k..."
    ])
  ],
  [
    "port",
    pose([
      "kkkkkkk....",
      "..k...k....",
      "..k...y....",
      "..k...y....",
      "..k........",
      "..k..kkkk..",
      "..k..koxk..",
      "kkkkkkkkkkk",
      "lllllllllll"
    ], 1)
  ],
  [
    "a\xE9roport",
    pose([
      "...kkk.....",
      "...kbk.....",
      "..kkkkk....",
      "...kgk.....",
      "...kgk.....",
      "...kgk.k...",
      "...kgkkpk..",
      "kkkkkkkkkkk",
      "geggegggegg"
    ])
  ],
  [
    "base",
    pose([
      "......k....",
      ".....kmk...",
      ".....kmk...",
      "...kkmmmkk.",
      "..kmmmmmmmk",
      ".....kmk...",
      "....kmmmk..",
      "kkkkkkkkkkk",
      "geggegggegg"
    ])
  ]
];

// web/src/rendu/dessins/grands.ts
function maison(g, x, sol, w, hm, o = {}) {
  const yt = sol - hm + 1;
  if (o.chem) boite(g, x + w - 4, yt - Math.floor(w / 2) + 1, 3, 4, "r", "R");
  boite(g, x, yt, w, hm, o.mur ?? "w", o.ombre ?? "s", w >= 9 ? 2 : 1);
  if (hm >= 7) {
    for (let wx = x + 2; wx + 1 <= x + w - 3; wx += 3) fenetre(g, wx, yt + 2);
    rect(g, x + (w - 2 >> 1), sol - 2, 2, 2, "d");
  } else if (w >= 7) {
    rect(g, x + 2, sol - 3, 2, 2, "d");
    fenetre(g, x + w - 4, sol - 4);
  } else rect(g, x + 2, sol - 2, 1, 1, "d");
  pignon(g, x - 1, yt, w + 2, o.toit ?? "r", o.ombreToit ?? "R");
}
function immeuble(g, x, sol, w, h, o = {}) {
  const yt = sol - h + 1;
  boite(g, x, yt, w, h, o.mur ?? "g", o.ombre ?? "G", w >= 7 ? 2 : 1);
  for (let y = yt + 2; y < sol - 2; y += 2) for (let xx = x + 2; xx < x + w - 2; xx += 2) {
    g.set(xx, y, (xx * 7 + y * 13) % 11 === 0 ? "i" : xx >= x + w - 3 ? "B" : "b");
  }
  rect(g, x + (w >> 1) - 1, sol - 2, 2, 2, "e");
  if (o.antenne) for (let k = 1; k <= o.antenne; k++) g.set(x + (w >> 1), yt - k, "k");
  if (o.corniche) {
    rect(g, x - 1, yt, w + 2, 1, "k");
  }
}
function clocher(g, x, sol, h) {
  const w = 5, yt = sol - h + 1;
  boite(g, x, yt, w, h, "w", "s");
  g.set(x + 2, yt + 2, "y");
  rect(g, x + 2, yt + 4, 1, 2, "e");
  const larg = [
    5,
    5,
    3,
    3,
    3,
    3,
    1
  ];
  larg.forEach((l, j) => {
    const a = x + (w - l) / 2, y = yt - 1 - j;
    for (let i = a; i < a + l; i++) g.set(i, y, l === 1 || i === a || i === a + l - 1 ? "k" : i === x + 2 ? "R" : "r");
  });
  g.set(x + 2, yt - 9, "k");
  g.set(x + 1, yt - 10, "k");
  g.set(x + 2, yt - 10, "k");
  g.set(x + 3, yt - 10, "k");
  g.set(x + 2, yt - 11, "k");
}
function palais(g, x, sol, w) {
  const cx = x + (w >> 1);
  boite(g, cx - 6, sol - 19, 13, 6, "w", "s");
  for (let i = cx - 4; i <= cx + 4; i += 2) rect(g, i, sol - 18, 1, 3, "s");
  rect(g, cx - 7, sol - 19, 15, 1, "k");
  const dedans = (i, j) => {
    const u = (i - cx) / 6.6, v = j / 7.4;
    return j >= 0 && u * u + v * v <= 1;
  };
  for (let j = 0; j <= 8; j++) for (let i = cx - 7; i <= cx + 7; i++) {
    if (!dedans(i, j)) continue;
    const bord = !dedans(i - 1, j) || !dedans(i + 1, j) || !dedans(i, j + 1) || j === 0;
    const c2 = bord ? "k" : i === cx - 3 && j >= 2 && j <= 4 ? "c" : (i - cx) % 3 === 0 ? "Y" : i > cx + 1 ? "Y" : "y";
    g.set(i, sol - 20 - j, c2);
  }
  const haut = sol - 20 - 7;
  boite(g, cx - 1, haut - 3, 3, 4, "w");
  g.set(cx, haut - 2, "y");
  g.set(cx, haut - 4, "k");
  for (let k = 5; k <= 9; k++) g.set(cx, haut - k, "k");
  rect(g, cx + 1, haut - 9, 5, 2, "x");
  rect(g, cx + 1, haut - 7, 5, 1, "R");
  boite(g, x, sol - 9, w, 10, "w", "s", 2);
  rect(g, x - 1, sol - 9, w + 2, 1, "k");
  rect(g, x, sol - 11, w, 1, "k");
  for (let i = x; i < x + w; i++) g.set(i, sol - 10, (i - x) % 2 ? "w" : "k");
  for (const y of [
    sol - 7,
    sol - 4
  ]) for (let i = x + 2; i < x + w - 3; i += 3) {
    if (Math.abs(i - cx) <= 7) continue;
    g.set(i, y, "b");
    g.set(i, y + 1, "B");
  }
  boite(g, cx - 6, sol - 11, 13, 12, "w", "s");
  rect(g, cx - 6, sol - 10, 13, 1, "s");
  for (let i = cx - 5; i <= cx + 5; i++) rect(g, i, sol - 9, 1, 7, (i - cx) % 2 ? "e" : "w");
  rect(g, cx - 1, sol - 5, 3, 3, "d");
  rect(g, cx - 7, sol - 2, 15, 1, "k");
  rect(g, cx - 6, sol - 1, 13, 1, "a");
  for (let j = 0; ; j++) {
    const a = cx - 7 + 2 * j, b = cx + 7 - 2 * j, y = sol - 12 - j;
    if (b - a < 2) {
      rect(g, a, y, b - a + 1, 1, "k");
      break;
    }
    for (let i = a; i <= b; i++) g.set(i, y, j === 0 || i <= a + 1 || i >= b - 1 ? "k" : i > cx ? "s" : "w");
  }
  g.set(cx, sol - 14, "y");
}
function arbre(g, x, sol) {
  [
    ".kkk.",
    "kvvVk",
    "kvVVk",
    ".kkk.",
    "..d.."
  ].forEach((l, j) => [
    ...l
  ].forEach((c2, i) => c2 !== "." && g.set(x + i, sol - 4 + j, c2)));
}
var compo2 = (f) => dessiner(80, 70, 66, f);
var VILLES_PRES = [
  [
    "village",
    compo2((g, s) => {
      maison(g, 10, s, 9, 6, {
        chem: true
      });
      arbre(g, 19, s);
    })
  ],
  [
    "bourg",
    compo2((g, s) => {
      clocher(g, 15, s, 11);
      maison(g, 6, s, 9, 7, {
        chem: true
      });
      maison(g, 19, s, 9, 6);
      arbre(g, 2, s);
    })
  ],
  [
    "petite ville",
    compo2((g, s) => {
      clocher(g, 14, s, 13);
      maison(g, 4, s, 9, 8, {
        chem: true
      });
      maison(g, 21, s, 11, 8);
      maison(g, 10, s, 7, 5);
      maison(g, 18, s, 7, 5, {
        toit: "R",
        ombreToit: "r"
      });
      arbre(g, 0, s);
    })
  ],
  [
    "ville",
    compo2((g, s) => {
      immeuble(g, 4, s, 9, 15, {
        corniche: true
      });
      immeuble(g, 21, s, 9, 17, {
        antenne: 3
      });
      clocher(g, 14, s, 15);
      maison(g, 0, s, 9, 8, {
        chem: true
      });
      maison(g, 9, s, 9, 7);
      maison(g, 18, s, 9, 8, {
        chem: true
      });
      maison(g, 27, s, 7, 6);
    })
  ],
  [
    "grande ville",
    compo2((g, s) => {
      immeuble(g, 4, s, 9, 20, {
        corniche: true
      });
      immeuble(g, 12, s, 11, 28, {
        antenne: 4
      });
      immeuble(g, 22, s, 9, 22);
      immeuble(g, 30, s, 7, 16, {
        corniche: true
      });
      clocher(g, 36, s, 13);
      maison(g, 0, s, 9, 8, {
        chem: true
      });
      maison(g, 9, s, 9, 7);
      maison(g, 18, s, 11, 9, {
        chem: true
      });
      maison(g, 29, s, 9, 7);
      maison(g, 38, s, 7, 6);
    })
  ],
  [
    "capitale",
    compo2((g, s) => {
      immeuble(g, 3, s, 9, 20, {
        corniche: true
      });
      immeuble(g, 41, s, 9, 23, {
        antenne: 4
      });
      palais(g, 12, s, 27);
      maison(g, 0, s, 9, 8, {
        chem: true
      });
      maison(g, 40, s, 9, 7);
      maison(g, 48, s, 7, 6);
    })
  ]
];
var batiment = (f) => dessiner(60, 50, 40, f);
function fumee(g, x, y, liste = [
  [
    0,
    0,
    3
  ],
  [
    2,
    -2,
    3
  ],
  [
    5,
    -3,
    2
  ]
]) {
  for (const [dx, dy, r] of liste) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + 0.5) g.set(x + dx + i, y + dy + j, i + j < 0 ? "c" : "f");
}
function tourRefroidissement(g, x, sol, h, w) {
  for (let j = 0; j < h; j++) {
    const t = j / (h - 1), y = sol - h + 1 + j;
    const demi = w / 2 * (t < 0.65 ? 0.78 - 0.18 * Math.sin(Math.PI * t / 0.65 / 2) * 1 + 0.1 * (1 - t / 0.65) : 0.6 + 0.4 * (t - 0.65) / 0.35);
    const a = Math.round(x + w / 2 - demi), b = Math.round(x + w / 2 + demi) - 1;
    for (let i = a; i <= b; i++) g.set(i, y, i === a || i === b || j === 0 || j === h - 1 ? "k" : j === 1 ? "e" : i > b - (b - a) / 3 ? "G" : i === a + 1 ? "a" : "g");
  }
}
var BATIMENTS_PRES = [
  [
    "usine",
    batiment((g, s) => {
      boite(g, 20, s - 22, 4, 21, "r", "R");
      rect(g, 21, s - 19, 2, 1, "w");
      rect(g, 21, s - 16, 2, 1, "w");
      rect(g, 19, s - 22, 6, 1, "k");
      fumee(g, 22, s - 25, [
        [
          0,
          0,
          2
        ],
        [
          2,
          -2,
          2
        ],
        [
          5,
          -3,
          2
        ]
      ]);
      for (let d = 0; d < 3; d++) {
        const x0 = 1 + d * 6;
        for (let i = 0; i <= 6; i++) {
          const yh = s - 13 + Math.round(i * 4 / 6);
          for (let y = yh; y <= s - 9; y++) g.set(x0 + i, y, y === yh ? "k" : "G");
        }
        for (let y = s - 13; y <= s - 9; y++) {
          g.set(x0, y, "k");
          if (y > s - 13) g.set(x0 + 1, y, "b");
        }
      }
      boite(g, 0, s - 9, 21, 10, "g", "G", 2);
      rect(g, 0, s - 9, 21, 1, "k");
      for (let i = 2; i < 18; i += 3) rect(g, i, s - 7, 2, 2, "b");
      boite(g, 6, s - 4, 6, 5, "z");
      rect(g, 7, s - 3, 4, 1, "G");
      boite(g, 24, s - 6, 5, 7, "g", "G");
    })
  ],
  [
    "c. nucl\xE9aire",
    batiment((g, s) => {
      fumee(g, 6, s - 21, [
        [
          0,
          0,
          3
        ],
        [
          3,
          -2,
          3
        ],
        [
          7,
          -3,
          2
        ]
      ]);
      fumee(g, 17, s - 19, [
        [
          0,
          0,
          3
        ],
        [
          3,
          -2,
          3
        ],
        [
          7,
          -2,
          2
        ]
      ]);
      tourRefroidissement(g, 0, s, 17, 12);
      tourRefroidissement(g, 11, s, 15, 11);
      boite(g, 21, s - 7, 7, 8, "a", "g");
      for (let j = 0; j < 3; j++) rect(g, 22 + j, s - 8 - j, 5 - 2 * j, 1, "a");
      points(g, [
        [
          21,
          s - 8
        ],
        [
          22,
          s - 9
        ],
        [
          23,
          s - 10
        ],
        [
          24,
          s - 11
        ],
        [
          25,
          s - 10
        ],
        [
          26,
          s - 9
        ],
        [
          27,
          s - 8
        ]
      ], "k");
      rect(g, 24, s - 3, 1, 3, "e");
      rect(g, 0, s, 29, 1, "k");
    })
  ],
  [
    "c. thermique",
    batiment((g, s) => {
      for (const cx of [
        3,
        10
      ]) {
        boite(g, cx, s - 21, 4, 14, "w", "s");
        for (let y = s - 20; y < s - 8; y += 4) rect(g, cx + 1, y, 2, 2, "x");
        rect(g, cx - 1, s - 21, 6, 1, "k");
      }
      fumee(g, 5, s - 24, [
        [
          0,
          0,
          2
        ],
        [
          3,
          -1,
          2
        ],
        [
          6,
          -3,
          2
        ]
      ]);
      fumee(g, 12, s - 24, [
        [
          0,
          0,
          2
        ],
        [
          3,
          -2,
          2
        ],
        [
          7,
          -3,
          2
        ]
      ]);
      boite(g, 0, s - 8, 20, 9, "g", "G", 2);
      for (let i = 2; i < 17; i += 3) rect(g, i, s - 6, 2, 2, "b");
      boite(g, 5, s - 3, 4, 4, "z");
      for (let j = 0; j < 4; j++) rect(g, 21 + j, s - j, 9 - 2 * j, 1, j === 0 ? "z" : "e");
      points(g, [
        [
          20,
          s
        ],
        [
          21,
          s - 1
        ],
        [
          22,
          s - 2
        ],
        [
          23,
          s - 3
        ],
        [
          24,
          s - 4
        ],
        [
          25,
          s - 4
        ],
        [
          26,
          s - 3
        ],
        [
          27,
          s - 2
        ],
        [
          28,
          s - 1
        ],
        [
          29,
          s
        ]
      ], "k");
    })
  ],
  [
    "c. hydraulique",
    batiment((g, s) => {
      rect(g, 0, s - 14, 7, 13, "k");
      rect(g, 1, s - 13, 6, 12, "L");
      rect(g, 1, s - 13, 6, 1, "l");
      for (let j = 0; j < 14; j++) {
        g.set(26 + (j >> 2), s - 13 + j, "k");
        rect(g, 27 + (j >> 2), s - 13 + j, 4, 1, "G");
        g.set(31 + (j >> 2), s - 13 + j, "k");
      }
      rect(g, 26, s - 14, 6, 1, "k");
      for (let j = 0; j < 14; j++) {
        const y = s - 13 + j, a = 6 - (j >> 2), b = 26 + (j >> 2);
        for (let i = a; i <= b; i++) g.set(i, y, i === a || i === b || j === 0 ? "k" : j === 1 ? "a" : (i - a) % 5 === 0 ? "G" : "g");
      }
      rect(g, 14, s - 12, 4, 13, "l");
      for (let y = s - 12; y <= s; y += 2) {
        g.set(15, y, "c");
        g.set(16, y + 1, "c");
      }
      rect(g, 8, s, 18, 1, "L");
      rect(g, 13, s - 1, 6, 1, "f");
      boite(g, 19, s - 4, 6, 5, "w", "s");
      rect(g, 21, s - 2, 2, 1, "y");
    })
  ],
  [
    "\xE9olien",
    batiment((g, s) => {
      const eolienne = (x, h) => {
        rect(g, x - 1, s - h, 3, h + 1, "k");
        rect(g, x, s - h + 1, 1, h - 1, "w");
        rect(g, x - 2, s - h - 1, 4, 3, "k");
        g.set(x - 1, s - h, "a");
        g.set(x, s - h, "w");
        for (let k = 1; k <= 7; k++) {
          g.set(x, s - h - 1 - k, "w");
          g.set(x + 1, s - h - 1 - k, "k");
        }
        for (let k = 1; k <= 6; k++) {
          const y = s - h + Math.round(k * 0.6);
          g.set(x - 1 - k, y, "w");
          g.set(x - 1 - k, y + 1, "k");
        }
        for (let k = 1; k <= 6; k++) {
          const y = s - h + Math.round(k * 0.6);
          g.set(x + 1 + k, y, "w");
          g.set(x + 1 + k, y + 1, "k");
        }
      };
      eolienne(9, 14);
      eolienne(22, 11);
      rect(g, 0, s, 30, 1, "V");
      rect(g, 0, s - 1, 30, 1, "v");
    })
  ],
  [
    "solaire",
    batiment((g, s) => {
      const rangee = (x, y, n) => {
        for (let k = 0; k < n; k++) {
          const x0 = x + k * 6;
          for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {
            const px = x0 + i + (3 - j), py = y + j;
            g.set(px, py, j === 0 || j === 3 || i === 0 ? "k" : (i + j) % 2 ? "u" : "B");
          }
          g.set(x0 + 4, y + 4, "k");
          g.set(x0 + 4, y + 5, "k");
        }
        rect(g, x + n * 6 + 3 - 3, y, 1, 4, "k");
      };
      rangee(4, s - 13, 4);
      rangee(0, s - 6, 5);
      rect(g, 0, s, 32, 1, "v");
    })
  ],
  [
    "port",
    batiment((g, s) => {
      rect(g, 2, s - 18, 2, 15, "x");
      rect(g, 9, s - 18, 2, 15, "x");
      rect(g, 1, s - 19, 21, 2, "x");
      rect(g, 1, s - 20, 21, 1, "k");
      rect(g, 1, s - 17, 21, 1, "k");
      for (const xx of [
        1,
        4,
        8,
        11
      ]) rect(g, xx, s - 18, 1, 15, "k");
      rect(g, 5, s - 12, 3, 1, "x");
      rect(g, 5, s - 13, 3, 1, "k");
      rect(g, 15, s - 16, 1, 3, "k");
      boite(g, 13, s - 14, 5, 3, "o");
      const cont = (x, y, c2) => {
        boite(g, x, y, 6, 3, c2);
        g.set(x + 2, y + 1, "k");
        g.set(x + 4, y + 1, "k");
      };
      cont(12, s - 6, "u");
      cont(18, s - 6, "x");
      cont(15, s - 9, "o");
      cont(24, s - 6, "v");
      rect(g, 0, s - 3, 31, 3, "g");
      rect(g, 0, s - 3, 31, 1, "k");
      rect(g, 0, s - 1, 31, 1, "G");
      rect(g, 0, s, 31, 2, "L");
      for (let i = 1; i < 31; i += 5) rect(g, i, s + 1, 2, 1, "l");
    })
  ],
  [
    "a\xE9roport",
    batiment((g, s) => {
      boite(g, 3, s - 14, 4, 14, "w", "s");
      boite(g, 1, s - 19, 8, 5, "b", "B");
      rect(g, 2, s - 18, 6, 1, "e");
      rect(g, 0, s - 20, 10, 1, "k");
      rect(g, 4, s - 22, 1, 2, "k");
      boite(g, 8, s - 7, 13, 8, "a", "g");
      rect(g, 9, s - 5, 11, 2, "b");
      for (let i = 10; i < 20; i += 3) g.set(i, s - 5, "B");
      rect(g, 7, s - 7, 15, 1, "k");
      const av = [
        "..............kk",
        ".............kpk",
        "..kkkkkkkkkkkkpk",
        ".kbcbcbcbcbccppk",
        "kcccccccccccccck",
        ".kkkkkkkkkkkkkk.",
        "....kkMkk.......",
        "....k...k......."
      ];
      av.forEach((l, j) => [
        ...l
      ].forEach((c2, i) => c2 !== "." && g.set(20 + i, s - 7 + j, c2 === "M" ? "k" : c2)));
      rect(g, 0, s + 1, 37, 1, "G");
    })
  ],
  [
    "base",
    batiment((g, s) => {
      const w = 18;
      for (let j = 0; j < 8; j++) {
        const demi = Math.round(Math.sqrt(1 - (j / 8) ** 2) * (w / 2));
        for (let i = -demi; i < demi; i++) g.set(9 + i, s - j, i === -demi || i === demi - 1 || j === 7 ? "k" : i > demi / 3 ? "M" : "m");
      }
      rect(g, 3, s - 4, 12, 5, "e");
      rect(g, 2, s - 5, 14, 1, "k");
      for (let i = 4; i < 15; i += 3) rect(g, i, s - 4, 1, 5, "z");
      const ch2 = [
        "k............",
        "kk...........",
        "kmk......kk..",
        "kmmkkkkkkbbk.",
        "kmmmmmmmmmmmkk",
        ".kkMMMMMMMMkk.",
        "....kkkkkk...."
      ];
      ch2.forEach((l, j) => [
        ...l
      ].forEach((c2, i) => c2 !== "." && g.set(17 + i, s - 6 + j, c2)));
      rect(g, 0, s + 1, 32, 1, "G");
    })
  ]
];

// web/src/rendu/dessins/unites.ts
var TYPES_UNITE = [
  "infanterie",
  "char",
  "blinde",
  "artillerie",
  "helicoptere",
  "chasseur",
  "transport",
  "ravitailleur",
  "drone",
  "missile",
  "fregate",
  "porte-avions",
  "sous-marin",
  "ravitailleur-escadre",
  "cargo"
];
var TEINTE_PAYS = {
  P: {
    neutre: "#e4ddcb",
    alpha: 254,
    facteur: 1
  },
  O: {
    neutre: "#a39c8c",
    alpha: 253,
    facteur: 0.7
  }
};
function couleurLettre(c2) {
  return PALETTE2[c2] ?? TEINTE_PAYS[c2]?.neutre;
}
function cerner(lignes) {
  const w = Math.max(...lignes.map((l) => l.length)) + 2, h = lignes.length + 2;
  const g = new Grille(w, h);
  const fins = /* @__PURE__ */ new Set();
  lignes.forEach((l, y) => [
    ...l
  ].forEach((c2, x) => {
    if (c2 === ".") return;
    if (c2 === "|") fins.add((y + 1) * w + x + 1);
    g.set(x + 1, y + 1, c2 === "|" ? "G" : c2);
  }));
  const peint = (x, y) => {
    const c2 = g.get(x, y);
    return c2 !== "." && c2 !== "k" && !fins.has(y * w + x);
  };
  const bord = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g.get(x, y) === "." && (peint(x - 1, y) || peint(x + 1, y) || peint(x, y - 1) || peint(x, y + 1))) bord.push([
      x,
      y
    ]);
  }
  for (const [x, y] of bord) g.set(x, y, "k");
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g.get(x, y) === ".") continue;
    x0 = Math.min(x0, x), y0 = Math.min(y0, y), x1 = Math.max(x1, x), y1 = Math.max(y1, y);
  }
  const r = new Grille(x1 - x0 + 1, y1 - y0 + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) r.set(x - x0, y - y0, g.get(x, y));
  return {
    grille: r,
    sol: r.h - 1
  };
}
function dessus(haut, axe) {
  const ombre = {
    a: "g",
    g: "G",
    c: "a",
    P: "O"
  };
  return [
    ...haut,
    axe,
    ...[
      ...haut
    ].reverse().map((l) => [
      ...l
    ].map((c2) => ombre[c2] ?? c2).join(""))
  ];
}
var LOIN = {
  infanterie: [
    "PP|.MM.",
    "PO|MMMM",
    "..|.ss.",
    "..|mmmm",
    "..|.mM.",
    "..|m.M."
  ],
  char: [
    "...PPP....",
    "..mmmMkkkk",
    "mmmmmmmmMM",
    ".zGzGzGzz."
  ],
  blinde: [
    "..PPPP...",
    ".mmmmmmbM",
    "mmmmmmmMM",
    ".zz.zz.zz"
  ],
  artillerie: [
    "........k",
    "......kk.",
    "..PPkk...",
    ".mmmmM...",
    "mmmmmmmmMM",
    ".zGzGzGzz."
  ],
  helicoptere: [
    "||||||||||",
    "......|...",
    "k...mmmmb.",
    "POPmmmmmbb",
    "k...mmmmMM",
    "....k..k..",
    "...kkkkkkk"
  ],
  chasseur: dessus([
    "...a.....",
    "P..aa....",
    "a...aa...",
    ".aaaaaab."
  ], "zaaaaaaabaa"),
  transport: dessus([
    "......a......",
    "......aa.....",
    "......aaz....",
    "P.....aa.....",
    "Pa....aaz....",
    ".aaaaaaaaaab."
  ], ".aaaaaaaaaabba"),
  ravitailleur: dessus([
    "...x.........",
    "....aa.......",
    ".....aa......",
    "P.....aaz....",
    "Pa.....aa....",
    ".aaaaaaaaaab."
  ], "kaaaaaaaaaabba"),
  drone: dessus([
    "....a....",
    "....a....",
    "....a....",
    "P...a...."
  ], "|aaaaaaab"),
  missile: [
    "k.......",
    "ykaaPaaxx",
    "k......."
  ],
  fregate: [
    "......P..",
    "......|...",
    ".....gga..",
    "..k.ggggg.k",
    "gggggggggggg",
    ".GGGGGGGGGG"
  ],
  "porte-avions": [
    "............P..",
    "...........gg..",
    "...........gb..",
    "GGcGGcGGcGGcGGGG",
    ".gggggggggggggg",
    "..GGGGGGGGGGGG"
  ],
  "sous-marin": [
    "....P.....",
    "....zz....",
    ".zzzzzzzzz.",
    "zzzzzzzzzzzz"
  ],
  "ravitailleur-escadre": [
    "P............",
    "ggb..k...k...",
    "ggg.kk..kk...",
    "gggggggggggggg",
    ".GGGGGGGGGGGG"
  ],
  cargo: [
    "P............",
    "wwb.ouuoxo...",
    "wwwouuoxooux.",
    "xxxxxxxxxxxxxx",
    ".RRRRRRRRRRRR"
  ]
};
var PRES = {
  infanterie: [
    "PPPPP|..........",
    "POOOP|...MMM....",
    "PPPPP|..MMMMM...",
    ".....|...sss....",
    ".....|...ssM....",
    ".....|.mmmmmm...",
    ".....|mmmmmmMkkk",
    ".....|.mmmmmM...",
    ".....|.mmmmmM...",
    ".....|.MMMMMM...",
    ".....|..mm.mM...",
    ".....|..mm.mM...",
    ".....|..mm..mM..",
    ".....|.MMM..MMM."
  ],
  char: [
    "........PPPPPP..........",
    "......mmOOOOOOmM........",
    ".....mmmmmmmmmmMMkkkkkkkk",
    ".....mmmmmmmmmmMMkkkkkkkk",
    "..mmmmmmmmmmmmmmmmmmmMM.",
    ".mmmmmmmmmmmmmmmmmmmmMMM",
    "zzzzzzzzzzzzzzzzzzzzzzzz",
    "zGGzGGzGGzGGzGGzGGzGGzGz",
    ".zzzzzzzzzzzzzzzzzzzzzz."
  ],
  blinde: [
    ".......kk...........",
    "....PPPPPPPP........",
    "...mmmmmmmmmmmmM....",
    "..mmmmmmmmmmmmmMMbb.",
    ".mmmmmmmmmmmmmmmMbbb",
    "mmmmmmmmmmmmmmmmmMMM",
    "mmmmmmmmmmmmmmmmmMMM",
    ".MMMMMMMMMMMMMMMMMM.",
    ".zzz.zzz....zzz.zzz.",
    ".zGz.zGz....zGz.zGz.",
    ".zzz.zzz....zzz.zzz."
  ],
  artillerie: [
    "......................kk",
    "....................kk..",
    "..................kk....",
    "................kk......",
    "......PPPPPPPPkk........",
    "....mmOOOOOOOOM.........",
    "....mmmmmmmmmmMM........",
    "..mmmmmmmmmmmmmmmmmmMM..",
    ".mmmmmmmmmmmmmmmmmmmMMM.",
    "zzzzzzzzzzzzzzzzzzzzzzzz",
    "zGGzGGzGGzGGzGGzGGzGGzGz",
    ".zzzzzzzzzzzzzzzzzzzzzz."
  ],
  helicoptere: [
    "||||||||||||||||||||||||",
    "..............|.........",
    "...........mmmmmm.......",
    "|.........mmmmmmmmbb....",
    "|........mmmmmmmmmbbb...",
    "PPPPPPPPmmmmmmmmmmmbbb..",
    "OOOOOOOOmmmmmmmmmmmmmmm.",
    "|........mmmmmmmmmmmmMMM",
    "..........MMMMMMMMMMMMM.",
    "............k......k....",
    "..........kkkkkkkkkkkkkk"
  ],
  chasseur: dessus([
    "....aa...............",
    "....aPa..............",
    ".....aaa.............",
    ".....aaaa............",
    ".a....aaaa...........",
    ".aa...aaaaa..........",
    "zaaaaaaaaaaaaabb....."
  ], "zaaaaaaaaaaaaabbbaaaa"),
  transport: dessus([
    "............aa.............",
    "............aaa............",
    ".............aaa...........",
    ".............aaa...........",
    ".............aaazz.........",
    ".............aaa...........",
    "PPP..........aaa...........",
    "PPPa.........aaazz.........",
    ".aaa.........aaa...........",
    "..aaaaaaaaaaaaaaaaaaaaaab.."
  ], "..aaaaaaaaaaaaaaaaaaaaaabbba"),
  ravitailleur: dessus([
    "......xx...................",
    "......kaa..................",
    "........aa.................",
    ".........aaa...............",
    "..........aaa..............",
    "...........aaazz...........",
    "PPP..........aaa...........",
    "PPPa..........aaa..........",
    ".aaa..........aaa..........",
    "..aaaaaaaaaaaaaaaaaaaaaab.."
  ], "kkaaaaaaaaaaaaaaaaaaaaaabbba"),
  drone: dessus([
    "........aa......",
    "........aa......",
    "........aa......",
    "........aa......",
    "........aa......",
    "........aa......",
    "........Pa......",
    "a.......aa......",
    ".a......aa......"
  ], "|aaaaaaaaaaaaaab"),
  missile: [
    "..k................",
    "..kk...............",
    "yykaaaaaPPaaaaaaxx.",
    "yykaaaaaOOaaaaaaxxx",
    "..kk.......kk......",
    "..k................"
  ],
  fregate: [
    "...............PPP...........",
    "...............PO|...........",
    "...............|.|...........",
    "..............|||||..........",
    ".............ggggga..........",
    "............ggbbbgga.........",
    ".......gggggggggggggga...k...",
    "......gggggggggggggggggakkk..",
    "ggggggggggggggggggggggggggggg.",
    "gggggggggggggggggggggggggggggg",
    ".GGGGGGGGGGGGGGGGGGGGGGGGGGGG.",
    "..GGGGGGGGGGGGGGGGGGGGGGGGGG.."
  ],
  "porte-avions": [
    "..................................PP....",
    "..................................O|....",
    "..................................|.....",
    ".................................gggg...",
    "...........aa....aa..............gbbg...",
    "..........aaaa..aaaa.............gggg...",
    "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGcGGGcGGGcGGGcGGGcGGGcGGGcGGGcGGGcGGGGGGG",
    ".gggggggggggggggggggggggggggggggggggggggg.",
    "..gggggggggggggggggggggggggggggggggggggg..",
    "...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG..."
  ],
  "sous-marin": [
    "..........PP..................",
    "..........O|..................",
    ".........zzzz.................",
    "........zzzzzz................",
    "z.......zzzzzz................",
    "zz.zzzzzzzzzzzzzzzzzzzzzzzz...",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzz.",
    "zz.eeeeeeeeeeeeeeeeeeeeeeeeeee"
  ],
  "ravitailleur-escadre": [
    "PP..............................",
    "O|..............................",
    "|.......k.....k.....k...........",
    "gggb....kk....kk....kk..........",
    "gggb....k.k...k.k...k.k.........",
    "ggggg...k..k..k..k..k..k........",
    "gggggggggggggggggggggggggggggggg",
    "gggggggggggggggggggggggggggggggg",
    ".GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG.",
    "..GGGGGGGGGGGGGGGGGGGGGGGGGGGG.."
  ],
  cargo: [
    "PP..............................",
    "O|..............................",
    "|...............................",
    "wwwb..ooouuuxxxooouuu...........",
    "wwwb..ooouuuxxxooouuuoooxxx.....",
    "wwwww.uuuoooooouuuxxxuuuooo.....",
    "wwwwwwuuuoooooouuuxxxuuuoooww...",
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ".RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.",
    "..RRRRRRRRRRRRRRRRRRRRRRRRRRRR.."
  ]
};
var interp = (pts, x) => {
  if (x < pts[0][0] || x > pts[pts.length - 1][0]) return -1;
  for (let k = 1; k < pts.length; k++) {
    const [x0, w0] = pts[k - 1], [x1, w1] = pts[k];
    if (x <= x1) return w0 + (w1 - w0) * (x - x0) / Math.max(1e-9, x1 - x0);
  }
  return -1;
};
var dansPlan = ([y0, a0, f0, y1, a1, f1], x, y) => {
  if (y < y0 || y > y1) return false;
  const t = (y - y0) / (y1 - y0);
  return x <= a0 + (a1 - a0) * t && x >= f0 + (f1 - f0) * t;
};
function enPlan(p, e) {
  const c2 = p.couleur ?? "a";
  const env = Math.max(p.aile[3], ...(p.plans ?? []).map((q) => q[3]), ...(p.nacelles ?? []).map((n) => n[0]));
  const nX = Math.ceil(p.L / e) + (p.perche ? 2 : 0), dx = p.perche ? 2 : 0, nY = Math.ceil(env / e + 0.5);
  const lignes = [];
  for (let j = nY; j >= 0; j--) {
    let l = "";
    for (let i = 0; i < nX; i++) {
      const couvre = (f) => {
        let n = 0;
        for (const u of [
          0.17,
          0.5,
          0.83
        ]) for (const v of [
          -0.33,
          0,
          0.33
        ]) {
          const x2 = (i - dx + u) * e, y2 = Math.abs(j + v) * e;
          if (f(x2, y2)) n++;
        }
        return n >= 3;
      };
      const x = (i - dx + 0.5) * e, y = j * e;
      let ch2 = ".";
      if (couvre((x2, y2) => dansPlan(p.aile, x2, y2)) || (p.plans ?? []).some((q) => couvre((x2, y2) => dansPlan(q, x2, y2)))) ch2 = c2;
      if (couvre((x2, y2) => y2 <= interp(p.fuselage, x2))) ch2 = c2;
      for (const [ym, x0, x1, r] of p.moteurs ?? []) if (couvre((x2, y2) => x2 >= x0 && x2 <= x1 && Math.abs(y2 - ym) <= r)) ch2 = "z";
      for (const [yd, x0, x1] of p.derives ?? []) if (Math.abs(y - yd) < e / 2 && x >= x0 && x <= x1) ch2 = "G";
      for (const [yh, xh, r] of p.helices ?? []) if (Math.abs(x - xh) < e / 2 && Math.abs(y - yh) <= r) ch2 = "|";
      for (const [yn, xn] of p.nacelles ?? []) if (Math.abs(x - xn) <= e && Math.abs(y - yn) < e / 2) ch2 = "x";
      if (p.verriere && j === 0 && x >= p.verriere[0] && x <= p.verriere[1]) ch2 = "b";
      if (p.cocarde && Math.abs(y - p.cocarde[0]) <= e * 0.6 && Math.abs(x - p.cocarde[1]) <= e * 0.6 && ch2 !== ".") ch2 = "P";
      if (p.deriveCouleur && j <= 1 && x >= p.deriveCouleur[0] && x <= p.deriveCouleur[1] && ch2 !== ".") ch2 = "P";
      if (p.perche && j === 0 && i < dx + 1 && ch2 === ".") ch2 = "k";
      l += ch2;
    }
    lignes.push(l);
  }
  return lignes;
}
var vuDessus = (p, e) => {
  const l = enPlan(p, e);
  return dessus(l.slice(0, -1), l[l.length - 1]);
};
var CHASSEURS = {
  rafale: {
    L: 15.3,
    fuselage: [
      [
        0,
        0.6
      ],
      [
        1,
        0.9
      ],
      [
        9,
        1
      ],
      [
        12,
        0.8
      ],
      [
        14,
        0.4
      ],
      [
        15.3,
        0
      ]
    ],
    aile: [
      0.9,
      9.5,
      1.5,
      5.45,
      3,
      1.6
    ],
    plans: [
      [
        0.7,
        11.6,
        10.2,
        2.6,
        10.7,
        10
      ]
    ],
    verriere: [
      11.8,
      13.6
    ],
    cocarde: [
      3.8,
      4.2
    ]
  },
  "mirage-2000": {
    L: 14.4,
    fuselage: [
      [
        0,
        0.5
      ],
      [
        1,
        0.8
      ],
      [
        7,
        1.3
      ],
      [
        10,
        1.2
      ],
      [
        12.5,
        0.5
      ],
      [
        14.4,
        0
      ]
    ],
    aile: [
      0.9,
      9.5,
      1,
      4.55,
      1.8,
      1.2
    ],
    verriere: [
      10.8,
      12.8
    ],
    cocarde: [
      3,
      3.8
    ]
  },
  eurofighter: {
    L: 15.96,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        9,
        1
      ],
      [
        12,
        0.8
      ],
      [
        14.5,
        0.4
      ],
      [
        15.96,
        0
      ]
    ],
    aile: [
      0.9,
      9,
      1,
      5.47,
      2.8,
      2
    ],
    plans: [
      [
        0.6,
        13.2,
        12,
        2.3,
        12.5,
        11.9
      ]
    ],
    verriere: [
      12,
      14
    ],
    cocarde: [
      3.8,
      4.4
    ]
  },
  gripen: {
    L: 14.1,
    fuselage: [
      [
        0,
        0.5
      ],
      [
        8,
        0.9
      ],
      [
        11,
        0.7
      ],
      [
        14.1,
        0
      ]
    ],
    aile: [
      0.8,
      8,
      1,
      4.2,
      2.6,
      1.6
    ],
    plans: [
      [
        0.8,
        10,
        8.2,
        2.6,
        9,
        8
      ]
    ],
    verriere: [
      10.6,
      12.6
    ],
    cocarde: [
      3,
      3.6
    ]
  },
  "f-16": {
    L: 15.06,
    fuselage: [
      [
        0,
        0.5
      ],
      [
        3,
        0.9
      ],
      [
        9,
        1.1
      ],
      [
        11.5,
        0.6
      ],
      [
        15.06,
        0
      ]
    ],
    aile: [
      1,
      9,
      4,
      4.98,
      5,
      3.8
    ],
    plans: [
      [
        0.8,
        2.5,
        0,
        2.8,
        0.8,
        0.1
      ]
    ],
    verriere: [
      11,
      13.4
    ],
    cocarde: [
      3.6,
      4.8
    ]
  },
  "f-35": {
    L: 15.7,
    fuselage: [
      [
        0,
        0.6
      ],
      [
        2,
        1.3
      ],
      [
        10,
        1.4
      ],
      [
        12.5,
        0.8
      ],
      [
        15.7,
        0
      ]
    ],
    couleur: "g",
    aile: [
      1.3,
      10,
      4.5,
      5.35,
      5.8,
      4.2
    ],
    plans: [
      [
        1.1,
        3.5,
        0,
        3.2,
        1.4,
        0.3
      ]
    ],
    derives: [
      [
        1.2,
        1.5,
        4.5
      ]
    ],
    verriere: [
      11.2,
      13.5
    ],
    cocarde: [
      3.8,
      5.6
    ]
  },
  "f-18": {
    L: 17.1,
    fuselage: [
      [
        0,
        0.6
      ],
      [
        3,
        1.3
      ],
      [
        10,
        1.6
      ],
      [
        12.5,
        0.9
      ],
      [
        14,
        0.6
      ],
      [
        17.1,
        0
      ]
    ],
    aile: [
      1,
      9.5,
      5,
      6.15,
      6.4,
      5
    ],
    plans: [
      [
        0.8,
        3.5,
        0,
        3.3,
        1.5,
        0.3
      ]
    ],
    derives: [
      [
        1.4,
        3.5,
        6.5
      ]
    ],
    verriere: [
      12.8,
      14.8
    ],
    cocarde: [
      4.4,
      6.4
    ]
  },
  "f-15": {
    L: 19.4,
    fuselage: [
      [
        0,
        1
      ],
      [
        3,
        1.6
      ],
      [
        11,
        1.7
      ],
      [
        13,
        1.4
      ],
      [
        15,
        0.6
      ],
      [
        19.4,
        0
      ]
    ],
    aile: [
      1.6,
      11,
      5.5,
      6.5,
      6.5,
      5
    ],
    plans: [
      [
        1.3,
        3,
        0,
        4.3,
        1.2,
        0
      ]
    ],
    derives: [
      [
        1.4,
        0.5,
        3
      ]
    ],
    verriere: [
      14.5,
      17
    ],
    cocarde: [
      4.6,
      7
    ]
  },
  tornado: {
    L: 16.7,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        4,
        1.2
      ],
      [
        11,
        1.3
      ],
      [
        13,
        0.7
      ],
      [
        16.7,
        0
      ]
    ],
    aile: [
      1.4,
      10,
      6.5,
      6,
      6,
      4.5
    ],
    plans: [
      [
        1,
        3.8,
        0,
        3.5,
        1.4,
        0
      ]
    ],
    verriere: [
      11.5,
      14
    ],
    cocarde: [
      4.2,
      6
    ]
  },
  "mig-29": {
    L: 17.3,
    fuselage: [
      [
        0,
        1
      ],
      [
        4,
        1.8
      ],
      [
        9,
        1.9
      ],
      [
        11,
        1
      ],
      [
        13,
        0.6
      ],
      [
        17.3,
        0
      ]
    ],
    aile: [
      1.5,
      9.5,
      5,
      5.7,
      6,
      5
    ],
    plans: [
      [
        1.6,
        3.2,
        0,
        4,
        1,
        0.1
      ]
    ],
    derives: [
      [
        1.6,
        2,
        4.5
      ]
    ],
    verriere: [
      12.5,
      14.5
    ],
    cocarde: [
      4,
      6.2
    ]
  },
  "su-35": {
    L: 21.9,
    fuselage: [
      [
        0,
        1
      ],
      [
        4,
        2
      ],
      [
        11,
        2.1
      ],
      [
        13,
        1.1
      ],
      [
        16,
        0.7
      ],
      [
        21.9,
        0
      ]
    ],
    aile: [
      1.8,
      12,
      6,
      7.65,
      7.2,
      6.2
    ],
    plans: [
      [
        1.8,
        3.8,
        0,
        4.8,
        1.4,
        0.2
      ]
    ],
    derives: [
      [
        1.9,
        2.5,
        5.5
      ]
    ],
    verriere: [
      16,
      18.5
    ],
    cocarde: [
      5.4,
      7.6
    ]
  },
  "su-34": {
    L: 23.3,
    fuselage: [
      [
        0,
        1
      ],
      [
        4,
        2
      ],
      [
        11,
        2.1
      ],
      [
        13,
        1.4
      ],
      [
        19,
        1.1
      ],
      [
        23.3,
        0.3
      ]
    ],
    aile: [
      1.8,
      12,
      6,
      7.35,
      7.2,
      6.2
    ],
    plans: [
      [
        1.8,
        3.8,
        0,
        4.8,
        1.4,
        0.2
      ],
      [
        1.3,
        15,
        13.8,
        3,
        14.2,
        13.6
      ]
    ],
    derives: [
      [
        1.9,
        2.5,
        5.5
      ]
    ],
    verriere: [
      18,
      21
    ],
    cocarde: [
      5.2,
      7.6
    ]
  },
  "su-57": {
    L: 20.1,
    fuselage: [
      [
        0,
        1.5
      ],
      [
        3,
        2.2
      ],
      [
        11,
        2.2
      ],
      [
        14,
        1.1
      ],
      [
        20.1,
        0
      ]
    ],
    couleur: "g",
    aile: [
      2,
      11.5,
      5.5,
      7.05,
      6,
      5
    ],
    plans: [
      [
        2,
        4,
        0.5,
        5,
        1.4,
        0
      ]
    ],
    derives: [
      [
        2.2,
        2.5,
        5
      ]
    ],
    verriere: [
      15,
      17.5
    ],
    cocarde: [
      5,
      7
    ]
  },
  "su-25": {
    L: 15.5,
    fuselage: [
      [
        0,
        0.4
      ],
      [
        4,
        0.9
      ],
      [
        11,
        0.9
      ],
      [
        15.5,
        0
      ]
    ],
    aile: [
      1,
      9.5,
      6.5,
      7.2,
      8,
      6.8
    ],
    plans: [
      [
        0.6,
        2.5,
        0.3,
        2.5,
        1.6,
        0.5
      ]
    ],
    moteurs: [
      [
        1.3,
        4,
        10,
        0.6
      ]
    ],
    verriere: [
      11.5,
      13
    ],
    cocarde: [
      5.2,
      7.4
    ]
  },
  "mig-31": {
    L: 22.7,
    fuselage: [
      [
        0,
        1.3
      ],
      [
        10,
        1.8
      ],
      [
        14,
        1
      ],
      [
        22.7,
        0
      ]
    ],
    aile: [
      1.8,
      11,
      6,
      6.75,
      6.8,
      5.6
    ],
    plans: [
      [
        1.8,
        4,
        0,
        4.5,
        1.5,
        0.3
      ]
    ],
    derives: [
      [
        1.6,
        2,
        5
      ]
    ],
    verriere: [
      16,
      19
    ],
    cocarde: [
      4.8,
      7.6
    ]
  }
};
var LOURDS = {
  a400m: {
    L: 45.1,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        8,
        2.4
      ],
      [
        38,
        2.5
      ],
      [
        42,
        1.8
      ],
      [
        45.1,
        0
      ]
    ],
    aile: [
      2.4,
      27,
      21,
      21.2,
      22,
      19.5
    ],
    moteurs: [
      [
        7,
        24,
        29,
        0.8
      ],
      [
        13,
        23,
        28,
        0.8
      ]
    ],
    helices: [
      [
        7,
        29.8,
        2.6
      ],
      [
        13,
        28.8,
        2.6
      ]
    ],
    plans: [
      [
        0.5,
        6,
        1.5,
        9.5,
        2.5,
        0.6
      ]
    ],
    verriere: [
      42,
      44
    ],
    cocarde: [
      17,
      22
    ]
  },
  "c-130j": {
    L: 29.8,
    fuselage: [
      [
        0,
        0.6
      ],
      [
        6,
        2
      ],
      [
        25,
        2.2
      ],
      [
        28,
        1.5
      ],
      [
        29.8,
        0
      ]
    ],
    aile: [
      2.2,
      18,
      13.5,
      20.2,
      16,
      14
    ],
    moteurs: [
      [
        5.5,
        16,
        19.5,
        0.7
      ],
      [
        10.5,
        15.5,
        19,
        0.7
      ]
    ],
    helices: [
      [
        5.5,
        20.2,
        2
      ],
      [
        10.5,
        19.7,
        2
      ]
    ],
    plans: [
      [
        0.5,
        4.5,
        0.5,
        8.1,
        1.8,
        0.4
      ]
    ],
    verriere: [
      27,
      29
    ],
    cocarde: [
      15,
      15
    ]
  },
  "c-17": {
    L: 53,
    fuselage: [
      [
        0,
        1
      ],
      [
        8,
        3
      ],
      [
        44,
        3.3
      ],
      [
        50,
        2.2
      ],
      [
        53,
        0
      ]
    ],
    aile: [
      3,
      31,
      21,
      25.9,
      18,
      15
    ],
    moteurs: [
      [
        9,
        28,
        34,
        1
      ],
      [
        15.5,
        25,
        31,
        1
      ]
    ],
    plans: [
      [
        0.8,
        7,
        1.5,
        10,
        1.8,
        0
      ]
    ],
    verriere: [
      49,
      52
    ],
    cocarde: [
      20,
      18
    ]
  },
  "il-76": {
    L: 46.6,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        7,
        2.4
      ],
      [
        40,
        2.5
      ],
      [
        44,
        1.6
      ],
      [
        46.6,
        0.3
      ]
    ],
    aile: [
      2.4,
      26,
      18,
      25.25,
      16.5,
      13.5
    ],
    moteurs: [
      [
        8,
        23,
        28,
        0.9
      ],
      [
        14,
        21,
        26,
        0.9
      ]
    ],
    plans: [
      [
        0.6,
        6.5,
        1.2,
        8.5,
        2,
        0.3
      ]
    ],
    verriere: [
      44.5,
      46.6
    ],
    cocarde: [
      20,
      16
    ]
  },
  "a330-mrtt": {
    L: 58.8,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        8,
        2.8
      ],
      [
        52,
        2.8
      ],
      [
        56,
        1.8
      ],
      [
        58.8,
        0
      ]
    ],
    aile: [
      2.8,
      35,
      25,
      30.1,
      18.5,
      15.5
    ],
    moteurs: [
      [
        9.5,
        31,
        37,
        1.3
      ]
    ],
    plans: [
      [
        0.6,
        9,
        1.5,
        9.7,
        2.5,
        0.2
      ]
    ],
    nacelles: [
      [
        24,
        19
      ]
    ],
    perche: true,
    verriere: [
      55,
      57
    ],
    cocarde: [
      18,
      22
    ]
  },
  "kc-135": {
    L: 41.5,
    fuselage: [
      [
        0,
        0.6
      ],
      [
        6,
        1.9
      ],
      [
        36,
        1.9
      ],
      [
        39.5,
        1.2
      ],
      [
        41.5,
        0
      ]
    ],
    aile: [
      1.8,
      25,
      17.5,
      20,
      13,
      11
    ],
    moteurs: [
      [
        6.5,
        21,
        25,
        0.8
      ],
      [
        12,
        18,
        22,
        0.8
      ]
    ],
    plans: [
      [
        0.5,
        7,
        1,
        6.6,
        2.5,
        0
      ]
    ],
    perche: true,
    verriere: [
      38,
      40
    ],
    cocarde: [
      16,
      14
    ]
  },
  "kc-767": {
    L: 48.5,
    fuselage: [
      [
        0,
        0.7
      ],
      [
        7,
        2.5
      ],
      [
        43,
        2.5
      ],
      [
        46.5,
        1.6
      ],
      [
        48.5,
        0
      ]
    ],
    aile: [
      2.4,
      28,
      20,
      23.8,
      15,
      12.5
    ],
    moteurs: [
      [
        8,
        25,
        30,
        1.2
      ]
    ],
    plans: [
      [
        0.5,
        7,
        1.2,
        9.3,
        2.3,
        0.2
      ]
    ],
    nacelles: [
      [
        19,
        16
      ]
    ],
    perche: true,
    verriere: [
      45,
      47
    ],
    cocarde: [
      15,
      18
    ]
  },
  "il-78": {
    L: 46.6,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        7,
        2.4
      ],
      [
        40,
        2.5
      ],
      [
        44,
        1.6
      ],
      [
        46.6,
        0.3
      ]
    ],
    aile: [
      2.4,
      26,
      18,
      25.25,
      16.5,
      13.5
    ],
    moteurs: [
      [
        8,
        23,
        28,
        0.9
      ],
      [
        14,
        21,
        26,
        0.9
      ]
    ],
    plans: [
      [
        0.6,
        6.5,
        1.2,
        8.5,
        2,
        0.3
      ]
    ],
    nacelles: [
      [
        21,
        16
      ]
    ],
    verriere: [
      44.5,
      46.6
    ],
    cocarde: [
      18,
      17
    ]
  }
};
var LIGNE = (p) => ({
  ...p,
  couleur: "c"
});
var AVIONS_DE_LIGNE = {
  a320: LIGNE({
    L: 37.6,
    fuselage: [
      [
        0,
        0.5
      ],
      [
        6,
        2
      ],
      [
        33,
        2
      ],
      [
        36,
        1.2
      ],
      [
        37.6,
        0
      ]
    ],
    aile: [
      2,
      21.5,
      15,
      17.9,
      11.5,
      10
    ],
    moteurs: [
      [
        5.8,
        19,
        23.5,
        1
      ]
    ],
    plans: [
      [
        0.5,
        6,
        1,
        6.2,
        2.3,
        0.3
      ]
    ],
    verriere: [
      35,
      36.6
    ],
    deriveCouleur: [
      0,
      6
    ]
  }),
  "b737": LIGNE({
    L: 39.5,
    fuselage: [
      [
        0,
        0.5
      ],
      [
        6,
        1.9
      ],
      [
        35,
        1.9
      ],
      [
        38,
        1.1
      ],
      [
        39.5,
        0
      ]
    ],
    aile: [
      1.9,
      22,
      15.8,
      17.9,
      12.5,
      11
    ],
    moteurs: [
      [
        4.9,
        20,
        24.5,
        1
      ]
    ],
    plans: [
      [
        0.5,
        6.4,
        1.2,
        6.6,
        2.6,
        0.5
      ]
    ],
    verriere: [
      37,
      38.6
    ],
    deriveCouleur: [
      0,
      6.4
    ]
  }),
  a350: LIGNE({
    L: 66.8,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        10,
        3
      ],
      [
        60,
        3
      ],
      [
        64.5,
        1.8
      ],
      [
        66.8,
        0
      ]
    ],
    aile: [
      3,
      38,
      27,
      32.4,
      18,
      16
    ],
    moteurs: [
      [
        10.5,
        33,
        40,
        1.6
      ]
    ],
    plans: [
      [
        0.7,
        10,
        2,
        10.5,
        3,
        0.3
      ]
    ],
    verriere: [
      63,
      65.5
    ],
    deriveCouleur: [
      0,
      10
    ]
  }),
  b777: LIGNE({
    L: 73.9,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        10,
        3.1
      ],
      [
        67,
        3.1
      ],
      [
        71.5,
        1.8
      ],
      [
        73.9,
        0
      ]
    ],
    aile: [
      3.1,
      42,
      31,
      32.4,
      22,
      19.5
    ],
    moteurs: [
      [
        9.6,
        37,
        45,
        1.9
      ]
    ],
    plans: [
      [
        0.7,
        11,
        2.5,
        10.7,
        4,
        0.6
      ]
    ],
    verriere: [
      70,
      72.5
    ],
    deriveCouleur: [
      0,
      11
    ]
  }),
  a380: LIGNE({
    L: 72.7,
    fuselage: [
      [
        0,
        0.8
      ],
      [
        10,
        3.6
      ],
      [
        63,
        3.6
      ],
      [
        69,
        2.2
      ],
      [
        72.7,
        0
      ]
    ],
    aile: [
      3.6,
      44,
      26,
      39.9,
      18,
      15
    ],
    moteurs: [
      [
        13,
        36,
        42,
        1.5
      ],
      [
        25,
        28,
        33.5,
        1.5
      ]
    ],
    plans: [
      [
        0.7,
        12,
        2,
        15.3,
        4,
        0.2
      ]
    ],
    verriere: [
      68,
      71
    ],
    deriveCouleur: [
      0,
      12
    ]
  }),
  atr72: LIGNE({
    L: 27.2,
    fuselage: [
      [
        0,
        0.4
      ],
      [
        5,
        1.4
      ],
      [
        23,
        1.4
      ],
      [
        25.5,
        0.9
      ],
      [
        27.2,
        0
      ]
    ],
    aile: [
      1.4,
      16.5,
      13.8,
      13.5,
      15.8,
      14.6
    ],
    moteurs: [
      [
        4.1,
        14,
        18.5,
        0.6
      ]
    ],
    helices: [
      [
        4.1,
        19,
        2
      ]
    ],
    plans: [
      [
        0.3,
        3.3,
        0.7,
        3.8,
        1.6,
        0.5
      ]
    ],
    verriere: [
      25,
      26.4
    ],
    deriveCouleur: [
      0,
      3.5
    ]
  })
};
var SHAHED = {
  L: 3.5,
  fuselage: [
    [
      0,
      0.15
    ],
    [
      0.3,
      0.2
    ],
    [
      3,
      0.2
    ],
    [
      3.5,
      0
    ]
  ],
  couleur: "g",
  aile: [
    0.2,
    2.6,
    0.2,
    1.25,
    0.6,
    0.2
  ],
  derives: [
    [
      1.2,
      0.2,
      0.8
    ]
  ],
  helices: [
    [
      0,
      -0.1,
      0.4
    ]
  ],
  cocarde: [
    0.7,
    1
  ]
};
function reduire(lignes) {
  const w = Math.max(...lignes.map((l) => l.length)), h = lignes.length, r = [];
  const at = (x, y) => lignes[y]?.[x] ?? ".";
  for (let y = 0; y < h; y += 2) {
    let l = "";
    for (let x = 0; x < w; x += 2) {
      const b = [
        at(x, y),
        at(x + 1, y),
        at(x, y + 1),
        at(x + 1, y + 1)
      ].filter((c2) => c2 !== ".");
      const fins = b.filter((c2) => c2 === "|" || c2 === "k");
      if (b.length < 2) {
        l += fins[0] ?? ".";
        continue;
      }
      if (b.includes("P") || b.includes("O")) {
        l += b.includes("P") ? "P" : "O";
        continue;
      }
      const n = /* @__PURE__ */ new Map();
      for (const c2 of b) n.set(c2, (n.get(c2) ?? 0) + 1);
      l += [
        ...n
      ].sort((p, q) => q[1] - p[1])[0][0];
    }
    r.push(l);
  }
  return r;
}
var HELICOS = {
  tigre: [
    "||||||||||||||||||||||||",
    "............|...........",
    "|.........mmmmb.........",
    "|........mmmmbbb........",
    "PPPPPPPPmmmmmmmbbbb.....",
    "OOOOOOOOmmmmmmmmmmmmmm..",
    "|.......kkmmmmmmmmmmmmMk",
    "........kk.MMMMMMMMMMM..",
    "...........k.......k....",
    ".........kkkkkkkkkkkkkk."
  ],
  nh90: [
    "|||||||||||||||||||||||||",
    "..............|..........",
    "...........mmmmmmmmm.....",
    "|.........mmmmmmmmmmmb...",
    "|PPPPPPPPmmmmmmmmmmmmbb..",
    "|OOOOOOOOmmmbbmmbbmmmmmm.",
    "|........mmmmmmmmmmmmmmMM",
    ".........mmmmmmmmmmmmmMMM",
    "..........MMMMMMMMMMMMMM.",
    "...........kk.......kk..."
  ],
  ch47: [
    "||||||||||||||.......||||||||||||||",
    "......|.......................|....",
    ".....mmm......................m....",
    ".....mmmmmmmmmmmmmmmmmmmmmmmmmmm...",
    ".....mmmPPPPmmmmmmmmmmmmmmmmmmmmbb.",
    "....mmmmOOOOmbbmmbbmmbbmmbbmmmmmbbb",
    "....mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmM",
    "....mmmmmmmmmmmmmmmmmmmmmmmmmmmmMMM",
    ".....MMMMMMMMMMMMMMMMMMMMMMMMMMMMM.",
    "......kk.kk...............kk.kk...."
  ],
  apache: [
    "||||||||||||||||||||||||",
    "............|...........",
    "|.........mmmmmb........",
    "|........mmmmmbbb.......",
    "PPPPPPPPmmmmmmmmbbbb....",
    "OOOOOOOOmmmmmmmmmmmmmmz.",
    "|......kkkzzmmmmmmmmmMzz",
    "........kkzzMMMMMMMMMMkk",
    "..........k.........k...",
    ".........kk.........kk.."
  ],
  mi24: [
    "||||||||||||||||||||||||||",
    ".............|............",
    "|..........mmmmmmmm.......",
    "|.........mmmmmmmmmmbb....",
    "PPPPPPPPPmmmmmmmmmmmbbbb..",
    "OOOOOOOOOmmmbbmmmmmmmmbbb.",
    "|.......kkkmmmmmmmmmmmmmMM",
    "........kkkzzMMMMMMMMMMMM.",
    "..........k.........k.....",
    "..........k.........k....."
  ],
  mi8: [
    "||||||||||||||||||||||||||",
    ".............|............",
    "|..........mmmmmmmmm......",
    "|PPPPPPPPmmmmmmmmmmmmbb...",
    "|OOOOOOOOmmmbbmmbbmmmmbbb.",
    "|........mmmmmmmmmmmmmmmMM",
    ".........mmmmmmmmmmmmmmMMM",
    "..........MMMMMMMMMMMMMMM.",
    "..........k..........k...."
  ]
};
var MISSILES = {
  "missile-antinavire": [
    "..G..........",
    "..GG...GG....",
    "yygggPgggggcc.",
    "yygggOgggggccc",
    "..GG...GG....",
    "..G.........."
  ],
  "missile-sol-air": [
    "..G..............G...",
    "..G..............G...",
    "yyccccPcccccccccccxx",
    "..G..............G...",
    "..G..............G..."
  ],
  "missile-balistique": [
    "..x..",
    ".xxx.",
    ".ggg.",
    ".ggg.",
    ".PPP.",
    ".OOO.",
    ".ggg.",
    ".ggg.",
    ".ggg.",
    "kgggk",
    "k.y.k",
    "..y.."
  ],
  "missile-nucleaire": [
    "...c...",
    "..ccc..",
    "..ccc..",
    ".aaaaa.",
    ".akyka.",
    ".ayyya.",
    ".akyka.",
    ".aaaaa.",
    ".PPPPP.",
    ".OOOOO.",
    ".aaaaa.",
    ".GGGGG.",
    ".aaaaa.",
    ".aaaaa.",
    ".aaaaa.",
    "kaaaaak",
    "k.yyy.k",
    "...y..."
  ],
  "missile-mirv": [
    ".c.....c.....c.",
    "ccc...ccc...ccc",
    "ccc...ccc...ccc",
    "zzz...zzz...zzz",
    "...............",
    "....aaaaaaa....",
    "....akykykPa...",
    "....aaaaaaaO...",
    "......y.y......"
  ]
};
var SOL = {
  "drone-fpv": [
    "||.....||",
    "||.....||",
    "..z...z..",
    "...zbz...",
    "...zPz...",
    "..z...z..",
    "||.....||",
    "||.....||"
  ],
  "drone-naval": [
    "......|.......",
    "......|.......",
    ".....zzP......",
    "..zzzzzzzzzzz.",
    "zzzzzzzzzzzzzzz",
    ".eeeeeeeeeeeee"
  ],
  camion: [
    "..........PPP....",
    ".gggggggggg.uuu..",
    ".gggggggggg.uubb.",
    ".gggggggggg.uuuu.",
    "kkkkkkkkkkkkuuuuu",
    "..zz....zz....zz."
  ],
  "camion-citerne": [
    "..........PPP....",
    "..aaaaaaaa..xxx..",
    ".aaaaaaaaaa.xxbb.",
    ".aaaaaaaaaa.xxxx.",
    "kkkkkkkkkkkkxxxxx",
    "..zz....zz....zz."
  ],
  voiture: [
    "...uuuuu...",
    "..ubbbubb..",
    "uuuuuuuuuuu",
    "uuuuPuuuuuN",
    ".zz.....zz."
  ],
  "train-voyageurs": [
    "......................kkk.....",
    "wwwwwwwwwwwwww.xxxxxxxxxxxxx..",
    "wbbwbbwbbwbbww.xxbbxxxxxxxbbx.",
    "wwwwwwwwwwwwww.xxxxxxxxxxxxxxx",
    "uuuuuuuuuuuuuu.PPPPPPPPPPPPPPP",
    "wwwwwwwwwwwwwwkxxxxxxxxxxxxxxx",
    ".zz.zz....zz.zz..zz.zz...zz.zz"
  ],
  "train-marchandises": [
    "..........................aaaa.",
    ".oooooo.uuuuuu..ggggggg..aaaaab",
    ".oooooo.uuuuuu.ggggggggg.aaaaab",
    ".oooooo.uuuuuu.ggggggggg.PPPPPP",
    "kkkkkkkkkkkkkkkkkkkkkkkkkaaaaaa",
    ".z..z...z..z....z...z....zz.zz."
  ],
  "mine-antipersonnel": [
    "..k..",
    ".xxx.",
    "PxxxO",
    "ddddd"
  ],
  "mine-antichar": [
    "....kk....",
    "..mmmmmm..",
    ".mmmmmmmmM",
    "PMMMMMMMMO",
    "dddddddddd"
  ],
  "mine-marine-orin": [
    "...k.k.k...",
    "..kzzzzzk..",
    ".kzzzzzzzk.",
    "..zzzPzzz..",
    ".kzzzOzzzk.",
    "..kzzzzzk..",
    "....zzz....",
    ".....|.....",
    ".....|.....",
    ".....|.....",
    "....zzz....",
    "...QQQQQ..."
  ],
  "mine-de-fond": [
    "...kkk...",
    "..zzzzz..",
    ".zzzPzzz.",
    "zzzzOzzzz",
    "QQQQQQQQQ"
  ],
  "panneau-mines": [
    "....x....",
    "...xcx...",
    "..xckcx..",
    ".xckkkcx.",
    "xcccccccx",
    "xxxxxxxxx",
    "....t....",
    "....t....",
    "....P....",
    "....t...."
  ],
  "chasseur-de-mines": [
    "..........P.........",
    "..........|.........",
    ".........|||........",
    "........ggggg.......",
    ".......ggbbbgg..k...",
    "..k...gggggggggggk..",
    "ggggggggggggggggggggg",
    ".GGGGGGGGGGGGGGGGGGG",
    "..GGGGGGGGGGGGGGGGG."
  ]
};
var SOLDAT_PRES = [
  "PPPPP|..........",
  "POOOP|...111....",
  "PPPPP|..11111...",
  ".....|...sss....",
  ".....|...ssQ....",
  ".....|.222222...",
  ".....|2222223kkk",
  ".....|.222223...",
  ".....|.222223...",
  ".....|.555555...",
  ".....|..22.23...",
  ".....|..22.23...",
  ".....|..22..23..",
  ".....|.444..444."
];
var SOLDAT_LOIN = [
  "PP|.11.",
  "PO|1111",
  "..|.ss.",
  "..|2222",
  "..|.23.",
  "..|4.4."
];
var TENUES = {
  bois: [
    "M",
    "m",
    "M",
    "z",
    "M",
    "V",
    "d"
  ],
  flecktarn: [
    "V",
    "v",
    "V",
    "z",
    "M",
    "M",
    "d"
  ],
  multicam: [
    "Q",
    "S",
    "Q",
    "t",
    "t",
    "t",
    "m"
  ],
  desert: [
    "S",
    "S",
    "Q",
    "Q",
    "t",
    "Q",
    "S"
  ],
  numerique: [
    "V",
    "m",
    "M",
    "z",
    "z",
    "V",
    "v"
  ],
  hiver: [
    "a",
    "c",
    "a",
    "z",
    "g",
    "g",
    "c"
  ]
};
function soldat(gabarit, t) {
  const [casque, tenue, ombre, bottes, ceinture, t1, t2] = t;
  return gabarit.map((l, y) => [
    ...l
  ].map((c2, x) => {
    if (c2 === "1") return casque;
    if (c2 === "2") return (x * 3 + y * 5) % 7 === 0 ? t1 : (x * 5 + y * 3) % 11 === 0 ? t2 : tenue;
    return {
      "3": ombre,
      "4": bottes,
      "5": ceinture
    }[c2] ?? c2;
  }).join(""));
}
var dansPoly = (p, x, y) => {
  let dedans = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
};
var rectF = (x0, y0, x1, y1, c2) => ({
  poly: [
    [
      x0,
      y0
    ],
    [
      x1,
      y0
    ],
    [
      x1,
      y1
    ],
    [
      x0,
      y1
    ]
  ],
  c: c2
});
function profil2D(formes, e, ey = e) {
  let x0 = Infinity, x1 = -Infinity, y1 = 0;
  for (const f of formes) {
    const pts = "poly" in f ? f.poly : "rond" in f ? [
      [
        f.rond[0] - f.rond[2],
        f.rond[1] + f.rond[2]
      ],
      [
        f.rond[0] + f.rond[2],
        f.rond[1] - f.rond[2]
      ]
    ] : [
      [
        f.trait[0],
        f.trait[1]
      ],
      [
        f.trait[2],
        f.trait[3]
      ]
    ];
    for (const [x, y] of pts) x0 = Math.min(x0, x), x1 = Math.max(x1, x), y1 = Math.max(y1, y);
  }
  const W = Math.ceil((x1 - x0) / e), H = Math.ceil(y1 / ey);
  const g = Array.from({
    length: H
  }, () => new Array(W).fill("."));
  const couvre = (f, i, j) => {
    let n = 0;
    for (const u of [
      0.17,
      0.5,
      0.83
    ]) for (const v of [
      0.17,
      0.5,
      0.83
    ]) {
      const x = x0 + (i + u) * e, y = (H - 1 - j + v) * ey;
      if ("poly" in f ? dansPoly(f.poly, x, y) : "rond" in f && (x - f.rond[0]) ** 2 + (y - f.rond[1]) ** 2 <= f.rond[2] ** 2) n++;
    }
    return n >= 3;
  };
  for (const f of formes) {
    if ("trait" in f) continue;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (couvre(f, i, j)) g[j][i] = f.c;
  }
  for (const f of formes) {
    if (!("trait" in f)) continue;
    const [a, b, c2, d] = f.trait;
    const pi = (x) => Math.min(W - 1, Math.max(0, Math.floor((x - x0) / e)));
    const pj = (y) => Math.min(H - 1, Math.max(0, H - 1 - Math.floor(y / ey)));
    const [i0, j0, i1, j1] = [
      pi(a),
      pj(b),
      pi(c2),
      pj(d)
    ], n = Math.max(Math.abs(i1 - i0), Math.abs(j1 - j0), 1);
    for (let k = 0; k <= n; k++) g[Math.round(j0 + (j1 - j0) * k / n)][Math.round(i0 + (i1 - i0) * k / n)] = f.c;
  }
  if (!g.some((r) => r.includes("P"))) {
    for (const f of formes) {
      if (!("poly" in f) || f.c !== "P") continue;
      const cx = f.poly.reduce((s, q) => s + q[0], 0) / f.poly.length, cy = f.poly.reduce((s, q) => s + q[1], 0) / f.poly.length;
      g[Math.min(H - 1, Math.max(0, H - 1 - Math.floor(cy / ey)))][Math.min(W - 1, Math.max(0, Math.floor((cx - x0) / e)))] = "P";
    }
  }
  return g.map((r) => r.join(""));
}
function chenille(p) {
  const [c2, o] = p.sable ? [
    "S",
    "Q"
  ] : [
    "m",
    "M"
  ], L = p.L, h = p.h, gl = p.glacis ?? 1.2, rg = p.rGalet ?? 0.35;
  const f = [
    {
      poly: [
        [
          0.4,
          0
        ],
        [
          L - 0.5,
          0
        ],
        [
          L,
          0.5
        ],
        [
          L - 0.3,
          0.9
        ],
        [
          0.2,
          0.9
        ],
        [
          0,
          0.5
        ]
      ],
      c: "z"
    }
  ];
  for (let k = 0; k < p.galets; k++) f.push({
    rond: [
      0.7 + k * (L - 1.6) / Math.max(1, p.galets - 1),
      rg,
      rg * 0.8
    ],
    c: "G"
  });
  if (p.jupes) f.push(rectF(0.15, 0.5, L - 0.25, 0.95, o));
  f.push({
    poly: [
      [
        0.05,
        0.9
      ],
      [
        L - 0.05,
        0.9
      ],
      [
        L,
        1.15
      ],
      [
        L - gl,
        h
      ],
      [
        0.15,
        h
      ],
      [
        0,
        h - 0.4
      ]
    ],
    c: c2
  });
  if (p.tourelle) {
    const [a, b, th, forme2] = p.tourelle, t = h + th;
    const poly = forme2 === "coin" ? [
      [
        a,
        h
      ],
      [
        b,
        h
      ],
      [
        b + 0.9,
        h + th * 0.55
      ],
      [
        b - 0.3,
        t
      ],
      [
        a,
        t
      ]
    ] : forme2 === "rond" ? [
      [
        a,
        h
      ],
      [
        b + 0.2,
        h
      ],
      [
        b,
        h + th * 0.65
      ],
      [
        b - 0.5,
        t
      ],
      [
        a + 0.5,
        t
      ],
      [
        a,
        h + th * 0.55
      ]
    ] : [
      [
        a,
        h
      ],
      [
        b,
        h
      ],
      [
        b + 0.25,
        h + th * 0.45
      ],
      [
        b,
        t
      ],
      [
        a + 0.15,
        t
      ],
      [
        a,
        h + th * 0.6
      ]
    ];
    f.push({
      poly,
      c: c2
    });
    if (p.briques) for (let x = b - 0.9; x < b + 0.1; x += 0.45) f.push(rectF(x, h + th * 0.5, x + 0.3, t - 0.05, o));
    f.push(rectF(a + 0.25, h + th * 0.3, a + 0.25 + (b - a) * 0.35, h + th * 0.75, "P"));
    if (p.canon) {
      const y = h + th * 0.55, r = (p.hausse ?? 0) * Math.PI / 180;
      f.push({
        trait: [
          b + 0.1,
          y,
          b + 0.1 + p.canon * Math.cos(r),
          y + p.canon * Math.sin(r)
        ],
        c: "k"
      });
    }
  } else f.push(rectF(L * 0.3, h - 0.45, L * 0.5, h - 0.1, "P"));
  if (p.roquettes) {
    const [a, b, rh] = p.roquettes;
    f.push({
      poly: [
        [
          a,
          h
        ],
        [
          b,
          h + 0.3
        ],
        [
          b,
          h + 0.3 + rh
        ],
        [
          a,
          h + rh * 0.7
        ]
      ],
      c: o
    });
  }
  return f;
}
function roues(p) {
  const [c2, o] = p.sable ? [
    "S",
    "Q"
  ] : [
    "m",
    "M"
  ], r = p.r ?? 0.55, L = p.L, h = p.h;
  const f = [];
  if (p.cabine) {
    const [a, b, hc] = p.cabine;
    f.push(rectF(0, r * 1.1, L, r * 1.1 + 0.4, "z"));
    f.push({
      poly: [
        [
          a,
          r * 1.1
        ],
        [
          b,
          r * 1.1
        ],
        [
          b,
          hc - 0.7
        ],
        [
          b - 0.5,
          hc
        ],
        [
          a,
          hc
        ]
      ],
      c: c2
    });
    f.push(rectF(b - 0.75, hc - 0.75, b - 0.2, hc - 0.3, "b"));
    f.push(rectF(a + 0.2, r * 1.1 + 0.5, a + 0.2 + (b - a) * 0.4, r * 1.1 + 0.9, "P"));
    const yp = r * 1.1 + 0.4;
    if (p.charge === "canon") {
      f.push({
        poly: [
          [
            0.2,
            yp
          ],
          [
            a - 0.6,
            yp
          ],
          [
            a - 1.2,
            yp + 1
          ],
          [
            0.6,
            yp + 1
          ]
        ],
        c: o
      });
      f.push({
        trait: [
          1,
          yp + 0.8,
          b + 0.6,
          yp + 1.15
        ],
        c: "k"
      });
    } else if (p.charge === "tourelle-arriere") {
      f.push({
        poly: [
          [
            0.2,
            yp
          ],
          [
            a - 0.4,
            yp
          ],
          [
            a - 0.4,
            yp + 1.6
          ],
          [
            0.6,
            yp + 1.6
          ]
        ],
        c: c2
      });
      f.push({
        trait: [
          a - 0.4,
          yp + 1,
          b + 1.2,
          yp + 1
        ],
        c: "k"
      });
    } else if (p.charge === "roquettes" || p.charge === "grosses-roquettes") {
      const hr = p.charge === "roquettes" ? 0.9 : 1.5;
      f.push({
        poly: [
          [
            0.1,
            yp
          ],
          [
            a - 0.3,
            yp + 0.4
          ],
          [
            a - 0.3,
            yp + 0.4 + hr
          ],
          [
            0.1,
            yp + hr * 0.7
          ]
        ],
        c: o
      });
      for (let y = yp + 0.25; y < yp + hr * 0.65; y += 0.4) f.push(rectF(0.1, y, 0.35, y + 0.2, "e"));
    }
  } else {
    const av = p.avant ?? 1.2;
    f.push({
      poly: [
        [
          0,
          r * 0.9
        ],
        [
          L - 0.2,
          r * 0.9
        ],
        [
          L,
          r * 1.5
        ],
        [
          L - av,
          h
        ],
        [
          0.2,
          h
        ],
        [
          0,
          h - 0.3
        ]
      ],
      c: c2
    });
    f.push(rectF(L - av - 0.6, h - 0.55, L - av - 0.1, h - 0.25, "b"));
    f.push(rectF(L * 0.25, h - 0.7, L * 0.25 + 1.3, h - 0.25, "P"));
    if (p.tourelle) {
      const [a, b, th] = p.tourelle;
      f.push({
        poly: [
          [
            a,
            h
          ],
          [
            b + 0.2,
            h
          ],
          [
            b,
            h + th
          ],
          [
            a + 0.2,
            h + th
          ]
        ],
        c: o
      });
      if (p.canon) {
        const y = h + th * 0.55, ra = (p.hausse ?? 0) * Math.PI / 180;
        f.push({
          trait: [
            b + 0.1,
            y,
            b + 0.1 + p.canon * Math.cos(ra),
            y + p.canon * Math.sin(ra)
          ],
          c: "k"
        });
      }
    } else f.push({
      trait: [
        L * 0.45,
        h,
        L * 0.45,
        h + 0.4
      ],
      c: "k"
    });
  }
  for (const x of p.essieux) f.push({
    rond: [
      x,
      r,
      r
    ],
    c: "z"
  }, {
    rond: [
      x,
      r,
      r * 0.4
    ],
    c: "G"
  });
  return f;
}
function canonTracte(long, roue, trepied = false) {
  const f = [
    {
      poly: [
        [
          0,
          0
        ],
        [
          0.3,
          0
        ],
        [
          2.4,
          roue * 1.2
        ],
        [
          2,
          roue * 1.6
        ]
      ],
      c: "M"
    },
    rectF(1.8, roue * 1.1, 3.2, roue * 2.2, "m"),
    rectF(2.6, roue * 1.4, 3, roue * 3.2, "M"),
    rectF(2, roue * 1.7, 2.6, roue * 2.1, "P"),
    {
      trait: [
        2.2,
        roue * 2.3,
        2.2 + long,
        roue * 2.3 + long * 0.25
      ],
      c: "k"
    },
    {
      rond: [
        2.5,
        roue,
        roue
      ],
      c: "z"
    },
    {
      rond: [
        2.5,
        roue,
        roue * 0.4
      ],
      c: "G"
    }
  ];
  if (trepied) f.unshift({
    poly: [
      [
        1,
        0
      ],
      [
        1.3,
        0
      ],
      [
        2.6,
        roue * 1.4
      ],
      [
        2.3,
        roue * 1.4
      ]
    ],
    c: "M"
  });
  return f;
}
var CHARS = {
  leclerc: {
    L: 6.9,
    h: 1.55,
    galets: 6,
    jupes: true,
    tourelle: [
      2.2,
      5.3,
      0.95,
      "boite"
    ],
    canon: 3
  },
  "leopard-2a4": {
    L: 7.7,
    h: 1.65,
    galets: 7,
    jupes: true,
    tourelle: [
      2.5,
      5.6,
      0.85,
      "boite"
    ],
    canon: 2
  },
  "leopard-2a6": {
    L: 7.7,
    h: 1.65,
    galets: 7,
    jupes: true,
    tourelle: [
      2.5,
      5.4,
      0.85,
      "coin"
    ],
    canon: 2.6
  },
  "leopard-1": {
    L: 7.1,
    h: 1.5,
    galets: 7,
    jupes: true,
    tourelle: [
      2.6,
      5,
      0.95,
      "rond"
    ],
    canon: 2.4
  },
  challenger: {
    L: 8.3,
    h: 1.6,
    galets: 6,
    jupes: true,
    tourelle: [
      2.7,
      6,
      0.85,
      "boite"
    ],
    canon: 3
  },
  abrams: {
    L: 7.9,
    h: 1.5,
    galets: 7,
    jupes: true,
    tourelle: [
      2.4,
      6.3,
      0.9,
      "boite"
    ],
    canon: 2,
    sable: true
  },
  k2: {
    L: 7.5,
    h: 1.5,
    galets: 6,
    jupes: true,
    tourelle: [
      2.5,
      5.8,
      0.85,
      "coin"
    ],
    canon: 2.5
  },
  altay: {
    L: 7.3,
    h: 1.55,
    galets: 6,
    jupes: true,
    tourelle: [
      2.5,
      5.8,
      0.85,
      "boite"
    ],
    canon: 2.6
  },
  "t-72": {
    L: 6.95,
    h: 1.35,
    galets: 6,
    rGalet: 0.4,
    tourelle: [
      3,
      5,
      0.85,
      "rond"
    ],
    canon: 2.6
  },
  "t-72b3": {
    L: 6.95,
    h: 1.35,
    galets: 6,
    rGalet: 0.4,
    jupes: true,
    tourelle: [
      3,
      5,
      0.85,
      "rond"
    ],
    canon: 2.6,
    briques: true
  },
  "t-90": {
    L: 6.9,
    h: 1.35,
    galets: 6,
    rGalet: 0.4,
    jupes: true,
    tourelle: [
      2.9,
      5.1,
      0.85,
      "boite"
    ],
    canon: 2.6,
    briques: true
  },
  "t-80": {
    L: 7,
    h: 1.35,
    galets: 6,
    rGalet: 0.33,
    jupes: true,
    tourelle: [
      3,
      5,
      0.85,
      "rond"
    ],
    canon: 2.6
  },
  "t-64": {
    L: 6.5,
    h: 1.3,
    galets: 6,
    rGalet: 0.3,
    tourelle: [
      2.8,
      4.7,
      0.85,
      "rond"
    ],
    canon: 2.6
  },
  "t-62": {
    L: 6.6,
    h: 1.3,
    galets: 5,
    rGalet: 0.42,
    tourelle: [
      2.8,
      4.8,
      0.9,
      "rond"
    ],
    canon: 2.6
  },
  "t-55": {
    L: 6.2,
    h: 1.3,
    galets: 5,
    rGalet: 0.42,
    tourelle: [
      2.6,
      4.5,
      0.9,
      "rond"
    ],
    canon: 2.9
  },
  "m48": {
    L: 6.9,
    h: 1.5,
    galets: 6,
    rGalet: 0.33,
    glacis: 1.6,
    tourelle: [
      2.6,
      5,
      0.95,
      "rond"
    ],
    canon: 2
  },
  "m60": {
    L: 6.95,
    h: 1.55,
    galets: 6,
    rGalet: 0.33,
    tourelle: [
      2.6,
      5,
      0.95,
      "coin"
    ],
    canon: 2.4
  },
  "amx-30": {
    L: 6.6,
    h: 1.45,
    galets: 5,
    rGalet: 0.38,
    tourelle: [
      2.6,
      4.7,
      0.9,
      "rond"
    ],
    canon: 2.9
  }
};
var BLINDES_CHENILLES = {
  cv90: {
    L: 6.55,
    h: 1.9,
    galets: 7,
    rGalet: 0.3,
    tourelle: [
      2.5,
      4.5,
      0.7,
      "boite"
    ],
    canon: 1.8
  },
  "bmp-1": {
    L: 6.74,
    h: 1.4,
    glacis: 2.2,
    galets: 6,
    tourelle: [
      3.6,
      4.6,
      0.5,
      "rond"
    ],
    canon: 0.9
  },
  "bmp-2": {
    L: 6.74,
    h: 1.4,
    glacis: 2.2,
    galets: 6,
    tourelle: [
      3.3,
      4.8,
      0.55,
      "rond"
    ],
    canon: 1.8
  },
  "bmp-3": {
    L: 7.1,
    h: 1.6,
    glacis: 1.6,
    galets: 6,
    tourelle: [
      3,
      4.8,
      0.6,
      "rond"
    ],
    canon: 2
  },
  "mt-lb": {
    L: 6.45,
    h: 1.35,
    glacis: 0.8,
    galets: 6,
    tourelle: [
      4.6,
      5.2,
      0.3,
      "rond"
    ],
    canon: 0.7
  },
  m113: {
    L: 4.86,
    h: 2,
    glacis: 0.9,
    galets: 5,
    rGalet: 0.3
  },
  bradley: {
    L: 6.55,
    h: 2,
    galets: 6,
    jupes: true,
    tourelle: [
      2.6,
      4.6,
      0.6,
      "boite"
    ],
    canon: 1.6
  },
  warrior: {
    L: 6.34,
    h: 1.9,
    galets: 6,
    jupes: true,
    tourelle: [
      2.6,
      4.4,
      0.6,
      "boite"
    ],
    canon: 1.4
  },
  puma: {
    L: 7.6,
    h: 2,
    galets: 6,
    jupes: true,
    tourelle: [
      3,
      5,
      0.55,
      "boite"
    ],
    canon: 2
  },
  lynx: {
    L: 7.7,
    h: 2.1,
    galets: 6,
    jupes: true,
    tourelle: [
      3,
      5.2,
      0.7,
      "boite"
    ],
    canon: 2
  },
  ascod: {
    L: 6.83,
    h: 1.9,
    galets: 7,
    rGalet: 0.3,
    jupes: true,
    tourelle: [
      2.7,
      4.6,
      0.6,
      "boite"
    ],
    canon: 1.5
  },
  marder: {
    L: 6.8,
    h: 1.8,
    galets: 6,
    tourelle: [
      3.4,
      4.8,
      0.5,
      "boite"
    ],
    canon: 1.5
  },
  dardo: {
    L: 6.7,
    h: 1.8,
    galets: 6,
    jupes: true,
    tourelle: [
      3,
      4.6,
      0.6,
      "boite"
    ],
    canon: 1.4
  },
  bmd: {
    L: 5.4,
    h: 1.2,
    glacis: 1.4,
    galets: 5,
    rGalet: 0.3,
    tourelle: [
      2.5,
      3.4,
      0.45,
      "rond"
    ],
    canon: 0.8
  },
  "m-80": {
    L: 6.4,
    h: 1.6,
    glacis: 1.6,
    galets: 5,
    tourelle: [
      3.2,
      4.2,
      0.5,
      "rond"
    ],
    canon: 1
  },
  borsuk: {
    L: 7.6,
    h: 2,
    galets: 6,
    jupes: true,
    tourelle: [
      3,
      5,
      0.65,
      "boite"
    ],
    canon: 1.8
  },
  leonidas: {
    L: 5.4,
    h: 1.6,
    glacis: 1.4,
    galets: 5,
    rGalet: 0.3
  }
};
var BLINDES_ROUES = {
  boxer: {
    L: 7.9,
    h: 2.4,
    essieux: [
      1.2,
      2.6,
      5,
      6.4
    ],
    r: 0.6,
    avant: 1.2
  },
  piranha: {
    L: 7.5,
    h: 2.3,
    essieux: [
      1.2,
      2.5,
      4.8,
      6.1
    ],
    avant: 1.6,
    tourelle: [
      3.4,
      4.8,
      0.5
    ],
    canon: 1
  },
  "patria-amv": {
    L: 7.7,
    h: 2.3,
    essieux: [
      1.2,
      2.6,
      4.9,
      6.3
    ],
    avant: 1.8,
    tourelle: [
      3.4,
      5,
      0.55
    ],
    canon: 1.4
  },
  vbci: {
    L: 7.6,
    h: 2.3,
    essieux: [
      1.2,
      2.6,
      4.9,
      6.3
    ],
    avant: 1.4,
    tourelle: [
      3.2,
      4.8,
      0.55
    ],
    canon: 1.3
  },
  "btr-80": {
    L: 7.65,
    h: 2,
    essieux: [
      1.3,
      2.7,
      4.6,
      6
    ],
    avant: 2.2,
    tourelle: [
      4,
      4.9,
      0.4
    ],
    canon: 0.7
  },
  fuchs: {
    L: 6.8,
    h: 2.3,
    essieux: [
      1.2,
      2.6,
      5.2
    ],
    avant: 2
  },
  vab: {
    L: 6,
    h: 2.1,
    essieux: [
      1.3,
      4.6
    ],
    avant: 1.3
  },
  griffon: {
    L: 7.8,
    h: 2.6,
    essieux: [
      1.3,
      3,
      6.3
    ],
    avant: 1
  },
  pandur: {
    L: 6,
    h: 2,
    essieux: [
      1.1,
      2.4,
      4.8
    ],
    avant: 1.4,
    tourelle: [
      2.8,
      3.9,
      0.45
    ],
    canon: 0.9
  },
  "puma-6x6": {
    L: 5.5,
    h: 1.9,
    essieux: [
      1,
      2.2,
      4.4
    ],
    avant: 1.3
  },
  bmr: {
    L: 6.15,
    h: 2,
    essieux: [
      1.1,
      2.6,
      4.9
    ],
    avant: 1.2,
    tourelle: [
      2.6,
      3.6,
      0.4
    ],
    canon: 0.7
  },
  sisu: {
    L: 7.35,
    h: 2.3,
    essieux: [
      1.3,
      2.7,
      5.6
    ],
    avant: 2.2
  },
  m1117: {
    L: 6,
    h: 2.6,
    essieux: [
      1.3,
      4.6
    ],
    avant: 1,
    tourelle: [
      2.6,
      3.6,
      0.5
    ],
    canon: 0.8
  },
  cobra: {
    L: 5.2,
    h: 2.1,
    essieux: [
      1.1,
      4
    ],
    avant: 1.2
  },
  tatrapan: {
    L: 8.5,
    h: 2.9,
    essieux: [
      1.3,
      2.7,
      6.9
    ],
    avant: 0.5
  },
  lazar: {
    L: 7.9,
    h: 2.5,
    essieux: [
      1.2,
      2.6,
      5.1,
      6.5
    ],
    avant: 1
  }
};
var ARTILLERIE = {
  caesar: {
    L: 10,
    h: 2.9,
    essieux: [
      1.3,
      2.7,
      8.5
    ],
    cabine: [
      7.2,
      10,
      2.9
    ],
    charge: "canon"
  },
  archer: {
    L: 14,
    h: 3.3,
    essieux: [
      1.5,
      3,
      11.8
    ],
    r: 0.65,
    cabine: [
      10.5,
      14,
      3.3
    ],
    charge: "canon"
  },
  dana: {
    L: 11,
    h: 2.9,
    essieux: [
      1.4,
      2.8,
      7.6,
      9.2
    ],
    cabine: [
      7.2,
      11,
      2.9
    ],
    charge: "tourelle-arriere"
  },
  atmos: {
    L: 10.5,
    h: 2.9,
    essieux: [
      1.3,
      2.7,
      8.9
    ],
    cabine: [
      7.6,
      10.5,
      2.9
    ],
    charge: "canon"
  },
  "pzh-2000": {
    L: 7.9,
    h: 1.6,
    galets: 7,
    rGalet: 0.3,
    jupes: true,
    tourelle: [
      0.6,
      4.8,
      1.4,
      "boite"
    ],
    canon: 3,
    hausse: 8
  },
  m109: {
    L: 6.8,
    h: 1.6,
    galets: 7,
    rGalet: 0.3,
    tourelle: [
      0.4,
      4.5,
      1.3,
      "boite"
    ],
    canon: 2.5,
    hausse: 8
  },
  k9: {
    L: 7.4,
    h: 1.6,
    galets: 6,
    jupes: true,
    tourelle: [
      0.5,
      4.8,
      1.3,
      "boite"
    ],
    canon: 3,
    hausse: 8
  },
  "2s19": {
    L: 6.9,
    h: 1.7,
    galets: 6,
    rGalet: 0.33,
    tourelle: [
      1,
      5.4,
      1.5,
      "boite"
    ],
    canon: 3,
    hausse: 8
  },
  "2s3": {
    L: 7.8,
    h: 1.6,
    galets: 6,
    tourelle: [
      1.2,
      4.6,
      1.3,
      "rond"
    ],
    canon: 2,
    hausse: 8
  },
  "2s1": {
    L: 7.3,
    h: 1.3,
    glacis: 1.6,
    galets: 7,
    rGalet: 0.3,
    tourelle: [
      1,
      3,
      0.75,
      "rond"
    ],
    canon: 2,
    hausse: 8
  },
  m110: {
    L: 7.5,
    h: 1.4,
    galets: 5,
    rGalet: 0.38,
    tourelle: [
      0.5,
      2,
      0.6,
      "boite"
    ],
    canon: 5,
    hausse: 20
  },
  m270: {
    L: 6.8,
    h: 1.7,
    galets: 6,
    rGalet: 0.3,
    roquettes: [
      0.2,
      4.6,
      1.2
    ]
  },
  himars: {
    L: 7,
    h: 2.6,
    essieux: [
      1.2,
      2.5,
      5.8
    ],
    cabine: [
      4.8,
      7,
      2.6
    ],
    charge: "grosses-roquettes"
  },
  "bm-21": {
    L: 7.35,
    h: 2.6,
    essieux: [
      1.2,
      2.5,
      6.1
    ],
    cabine: [
      5,
      7.35,
      2.6
    ],
    charge: "roquettes"
  },
  "bm-30": {
    L: 12,
    h: 3,
    essieux: [
      1.4,
      2.8,
      8.4,
      9.8
    ],
    r: 0.65,
    cabine: [
      9,
      12,
      3
    ],
    charge: "grosses-roquettes"
  },
  "tracte-leger": "tracte-leger",
  "tracte-lourd": "tracte-lourd",
  "d-30": "d-30"
};
function navire(p) {
  const L = p.L, f = p.franc, g = p.genre ?? "guerre", f0 = [];
  if (g === "sous-marin") {
    const d = p.diametre ?? 10, [a, b, hk] = p.kiosque;
    f0.push({
      poly: [
        [
          0,
          d * 0.45
        ],
        [
          L * 0.08,
          d * 0.15
        ],
        [
          L * 0.85,
          0
        ],
        [
          L * 0.97,
          d * 0.2
        ],
        [
          L,
          d * 0.5
        ],
        [
          L * 0.95,
          d
        ],
        [
          L * 0.1,
          d
        ],
        [
          0,
          d * 0.6
        ]
      ],
      c: "z"
    });
    f0.push({
      poly: [
        [
          0,
          d * 0.5
        ],
        [
          L * 0.04,
          d * 0.5
        ],
        [
          L * 0.02,
          d * 1.3
        ]
      ],
      c: "z"
    });
    if (p.dos) f0.push(rectF(p.dos[0], d * 0.8, p.dos[1], d * 1.25, "z"));
    f0.push({
      poly: [
        [
          a,
          d * 0.9
        ],
        [
          b,
          d * 0.9
        ],
        [
          b - 1.5,
          d + hk
        ],
        [
          a + 1,
          d + hk
        ]
      ],
      c: "z"
    });
    f0.push(rectF(a + (b - a) * 0.3, d + hk * 0.4, a + (b - a) * 0.7, d + hk * 0.8, "P"));
    f0.push(rectF(0, 0, L, d * 0.35, "e"));
    return f0;
  }
  const civil = [
    "conteneurs",
    "petrolier",
    "vraquier",
    "methanier"
  ].includes(g);
  const [cq, cs] = civil ? [
    "x",
    "R"
  ] : [
    "g",
    "G"
  ];
  f0.push({
    poly: [
      [
        L * 0.03,
        0
      ],
      [
        L * 0.9,
        0
      ],
      [
        L,
        f * 1.35
      ],
      [
        0,
        f
      ]
    ],
    c: cq
  });
  f0.push({
    poly: [
      [
        L * 0.03,
        0
      ],
      [
        L * 0.9,
        0
      ],
      [
        L * 0.93,
        f * 0.35
      ],
      [
        L * 0.01,
        f * 0.35
      ]
    ],
    c: cs
  });
  if (g === "porte-avions") {
    f0.push({
      poly: [
        [
          -L * 0.02,
          f
        ],
        [
          L * 1.02,
          f * 1.35
        ],
        [
          L * 1.02,
          f * 1.6
        ],
        [
          -L * 0.02,
          f * 1.25
        ]
      ],
      c: "G"
    });
    if (p.tremplin) f0.push({
      poly: [
        [
          L * 0.88,
          f * 1.5
        ],
        [
          L * 1.02,
          f * 1.6
        ],
        [
          L * 1.02,
          f * 2.1
        ]
      ],
      c: "G"
    });
    for (let x = L * 0.1; x < L * 0.85; x += L * 0.18) f0.push(rectF(x, f * 1.45, x + L * 0.04, f * 1.65, "a"));
  }
  const pont = g === "porte-avions" ? f * 1.5 : f * 1.1;
  if (g === "conteneurs") {
    const couleurs = [
      "o",
      "u",
      "x",
      "v",
      "o",
      "u"
    ];
    let k = 0;
    for (let x = L * 0.08; x < L * 0.92; x += L * 0.07) {
      if (x > L * 0.66 && x < L * 0.74) continue;
      f0.push(rectF(x, pont, x + L * 0.065, pont + f * (k % 3 === 0 ? 1.5 : 1.8), couleurs[k++ % couleurs.length]));
    }
  }
  if (g === "petrolier") f0.push({
    trait: [
      L * 0.15,
      pont + 1,
      L * 0.9,
      pont + 1
    ],
    c: "G"
  }, rectF(L * 0.4, pont, L * 0.44, pont + 4, "G"));
  if (g === "methanier") f0.push(rectF(L * 0.15, pont, L * 0.88, pont + f * 0.6, "c"));
  if (g === "vraquier") for (let x = L * 0.18; x < L * 0.88; x += L * 0.11) f0.push(rectF(x, pont, x + L * 0.07, pont + f * 0.35, "R"));
  for (const [a, b, h] of p.blocs ?? []) f0.push(rectF(a, pont, b, pont + h, civil ? "w" : "g"));
  for (const [a, b, h] of p.cheminees ?? []) f0.push(rectF(a, pont, b, pont + h, civil ? "x" : "G"));
  for (const [x, h] of p.mats ?? []) f0.push({
    trait: [
      x,
      pont,
      x,
      pont + h
    ],
    c: "|"
  });
  const [xm, hm] = p.mats?.[0] ?? (p.blocs?.length ? [
    (p.blocs[0][0] + p.blocs[0][1]) / 2,
    p.blocs[0][2] + 4
  ] : [
    L * 0.5,
    f + 4
  ]);
  f0.push(rectF(xm, pont + hm - 0.1, xm + L * 0.06, pont + hm + L * 0.03, "P"));
  if (p.blocs?.length) {
    const [a, b, h] = p.blocs[p.blocs.length - 1];
    f0.push(rectF(b - (b - a) * 0.25, pont + h * 0.6, b - 1, pont + h * 0.85, "b"));
  }
  if (p.canon) f0.push(rectF(p.canon - 2, pont, p.canon + 2, pont + 2.5, "g"), {
    trait: [
      p.canon,
      pont + 1.8,
      p.canon + 8,
      pont + 2.5
    ],
    c: "k"
  });
  return f0;
}
var NAVIRES = {
  fremm: [
    {
      L: 142,
      franc: 7,
      blocs: [
        [
          40,
          95,
          9
        ],
        [
          55,
          85,
          15
        ]
      ],
      mats: [
        [
          72,
          26
        ]
      ],
      canon: 125,
      helipont: true
    },
    5
  ],
  fdi: [
    {
      L: 122,
      franc: 7,
      blocs: [
        [
          35,
          85,
          10
        ],
        [
          52,
          76,
          19
        ]
      ],
      mats: [
        [
          64,
          24
        ]
      ],
      canon: 108
    },
    5
  ],
  "type-45": [
    {
      L: 152,
      franc: 7,
      blocs: [
        [
          40,
          102,
          10
        ],
        [
          60,
          90,
          16
        ]
      ],
      mats: [
        [
          78,
          36
        ],
        [
          56,
          24
        ]
      ],
      canon: 135
    },
    5
  ],
  "arleigh-burke": [
    {
      L: 155,
      franc: 7,
      blocs: [
        [
          55,
          108,
          12
        ]
      ],
      mats: [
        [
          85,
          30
        ]
      ],
      cheminees: [
        [
          60,
          70,
          16
        ],
        [
          40,
          50,
          13
        ]
      ],
      canon: 140
    },
    5
  ],
  f125: [
    {
      L: 149,
      franc: 7,
      blocs: [
        [
          35,
          108,
          11
        ],
        [
          40,
          60,
          17
        ],
        [
          82,
          102,
          17
        ]
      ],
      mats: [
        [
          94,
          26
        ]
      ],
      canon: 135
    },
    5
  ],
  "admiral-gorshkov": [
    {
      L: 135,
      franc: 7,
      blocs: [
        [
          40,
          95,
          9
        ],
        [
          60,
          86,
          15
        ]
      ],
      mats: [
        [
          74,
          24
        ]
      ],
      cheminees: [
        [
          45,
          55,
          13
        ]
      ],
      canon: 120
    },
    5
  ],
  "admiral-grigorovich": [
    {
      L: 125,
      franc: 7,
      blocs: [
        [
          35,
          90,
          9
        ],
        [
          62,
          80,
          13
        ]
      ],
      mats: [
        [
          72,
          22
        ]
      ],
      cheminees: [
        [
          42,
          52,
          13
        ]
      ],
      canon: 112
    },
    5
  ],
  cassiopea: [
    {
      L: 80,
      franc: 5,
      blocs: [
        [
          28,
          56,
          8
        ]
      ],
      mats: [
        [
          45,
          16
        ]
      ],
      canon: 70
    },
    5
  ],
  "charles-de-gaulle": [
    {
      L: 261,
      franc: 14,
      genre: "porte-avions",
      blocs: [
        [
          150,
          180,
          22
        ]
      ],
      mats: [
        [
          165,
          32
        ]
      ]
    },
    8
  ],
  "queen-elizabeth": [
    {
      L: 284,
      franc: 15,
      genre: "porte-avions",
      blocs: [
        [
          100,
          125,
          24
        ],
        [
          175,
          200,
          28
        ]
      ],
      mats: [
        [
          112,
          34
        ],
        [
          188,
          36
        ]
      ],
      tremplin: true
    },
    8
  ],
  "gerald-r-ford": [
    {
      L: 333,
      franc: 16,
      genre: "porte-avions",
      blocs: [
        [
          205,
          230,
          24
        ]
      ],
      mats: [
        [
          218,
          34
        ]
      ]
    },
    8
  ],
  "admiral-kuznetsov": [
    {
      L: 305,
      franc: 15,
      genre: "porte-avions",
      blocs: [
        [
          170,
          215,
          28
        ]
      ],
      mats: [
        [
          192,
          40
        ]
      ],
      tremplin: true
    },
    8
  ],
  suffren: [
    {
      L: 99,
      franc: 0,
      genre: "sous-marin",
      diametre: 8.8,
      kiosque: [
        64,
        73,
        7
      ]
    },
    5
  ],
  astute: [
    {
      L: 97,
      franc: 0,
      genre: "sous-marin",
      diametre: 11.3,
      kiosque: [
        64,
        75,
        8
      ]
    },
    5
  ],
  virginia: [
    {
      L: 115,
      franc: 0,
      genre: "sous-marin",
      diametre: 10.4,
      kiosque: [
        80,
        89,
        8
      ]
    },
    5
  ],
  "type-212": [
    {
      L: 56,
      franc: 0,
      genre: "sous-marin",
      diametre: 7,
      kiosque: [
        32,
        40,
        6
      ]
    },
    5
  ],
  yasen: [
    {
      L: 130,
      franc: 0,
      genre: "sous-marin",
      diametre: 13,
      kiosque: [
        80,
        96,
        8
      ]
    },
    5
  ],
  kilo: [
    {
      L: 74,
      franc: 0,
      genre: "sous-marin",
      diametre: 9.9,
      kiosque: [
        42,
        53,
        7
      ]
    },
    5
  ],
  triomphant: [
    {
      L: 138,
      franc: 0,
      genre: "sous-marin",
      diametre: 12.5,
      kiosque: [
        94,
        104,
        8
      ],
      dos: [
        40,
        88
      ]
    },
    5
  ],
  vanguard: [
    {
      L: 150,
      franc: 0,
      genre: "sous-marin",
      diametre: 12.8,
      kiosque: [
        100,
        111,
        8
      ],
      dos: [
        30,
        95
      ]
    },
    5
  ],
  columbia: [
    {
      L: 171,
      franc: 0,
      genre: "sous-marin",
      diametre: 13.1,
      kiosque: [
        115,
        126,
        8
      ],
      dos: [
        40,
        105
      ]
    },
    5
  ],
  borei: [
    {
      L: 170,
      franc: 0,
      genre: "sous-marin",
      diametre: 13.5,
      kiosque: [
        118,
        134,
        8
      ],
      dos: [
        40,
        112
      ]
    },
    5
  ],
  "brf-jacques-chevallier": [
    {
      L: 194,
      franc: 10,
      genre: "ravitailleur",
      blocs: [
        [
          5,
          40,
          12
        ],
        [
          150,
          175,
          16
        ]
      ],
      mats: [
        [
          162,
          26
        ],
        [
          70,
          14
        ],
        [
          100,
          14
        ]
      ]
    },
    8
  ],
  tide: [
    {
      L: 201,
      franc: 10,
      genre: "ravitailleur",
      blocs: [
        [
          8,
          40,
          10
        ],
        [
          150,
          180,
          16
        ]
      ],
      mats: [
        [
          165,
          26
        ],
        [
          75,
          14
        ],
        [
          105,
          14
        ]
      ]
    },
    8
  ],
  "porte-conteneurs": [
    {
      L: 400,
      franc: 24,
      genre: "conteneurs",
      blocs: [
        [
          270,
          292,
          40
        ]
      ],
      cheminees: [
        [
          40,
          52,
          30
        ]
      ]
    },
    9
  ],
  petrolier: [
    {
      L: 330,
      franc: 22,
      genre: "petrolier",
      blocs: [
        [
          10,
          45,
          26
        ]
      ],
      cheminees: [
        [
          12,
          22,
          34
        ]
      ]
    },
    9
  ],
  vraquier: [
    {
      L: 225,
      franc: 16,
      genre: "vraquier",
      blocs: [
        [
          6,
          32,
          20
        ]
      ],
      cheminees: [
        [
          8,
          16,
          26
        ]
      ]
    },
    9
  ],
  methanier: [
    {
      L: 290,
      franc: 20,
      genre: "methanier",
      blocs: [
        [
          8,
          40,
          24
        ]
      ],
      cheminees: [
        [
          10,
          18,
          30
        ]
      ]
    },
    9
  ]
};
function profilsModeles() {
  const l = [];
  for (const [k, p] of Object.entries(CHARS)) l.push([
    `char-${k}`,
    chenille(p),
    0.33,
    1
  ]);
  for (const [k, p] of Object.entries(BLINDES_CHENILLES)) l.push([
    `blinde-${k}`,
    chenille(p),
    0.33,
    1
  ]);
  for (const [k, p] of Object.entries(BLINDES_ROUES)) l.push([
    `blinde-${k}`,
    roues(p),
    0.33,
    1
  ]);
  for (const [k, p] of Object.entries(ARTILLERIE)) {
    const f = p === "tracte-leger" ? canonTracte(3.2, 0.4) : p === "tracte-lourd" ? canonTracte(5, 0.55) : p === "d-30" ? canonTracte(4.3, 0.45, true) : "galets" in p ? chenille(p) : roues(p);
    l.push([
      `artillerie-${k}`,
      f,
      0.33,
      1
    ]);
  }
  for (const [k, [p, e]] of Object.entries(NAVIRES)) l.push([
    `navire-${k}`,
    navire(p),
    e,
    1.8
  ]);
  return l;
}
var DESSINS = /* @__PURE__ */ new Map();
for (const t of TYPES_UNITE) DESSINS.set(t, [
  LOIN[t],
  PRES[t]
]);
for (const [k, p] of Object.entries(CHASSEURS)) DESSINS.set(`avion-${k}`, [
  vuDessus(p, 1.5),
  vuDessus(p, 0.75)
]);
for (const [k, p] of Object.entries({
  ...LOURDS,
  ...AVIONS_DE_LIGNE
})) DESSINS.set(`avion-${k}`, [
  vuDessus(p, 4),
  vuDessus(p, 2)
]);
DESSINS.set("drone-longue-portee", [
  vuDessus(SHAHED, 0.5),
  vuDessus(SHAHED, 0.25)
]);
for (const [k, l] of Object.entries(HELICOS)) DESSINS.set(`helico-${k}`, [
  reduire(l),
  l
]);
for (const [k, l] of Object.entries({
  ...MISSILES,
  ...SOL
})) DESSINS.set(k, [
  reduire(l),
  l
]);
DESSINS.set("missile-croisiere", [
  LOIN.missile,
  PRES.missile
]);
for (const [k, t] of Object.entries(TENUES)) DESSINS.set(`soldat-${k}`, [
  soldat(SOLDAT_LOIN, t),
  soldat(SOLDAT_PRES, t)
]);
for (const [k, f, e, v] of profilsModeles()) DESSINS.set(k, [
  profil2D(f, 2 * e, 2 * e / v),
  profil2D(f, e, e / v)
]);
var CLES_UNITE = [
  ...DESSINS.keys()
];
var memo = /* @__PURE__ */ new Map();
var garder = (cle, lignes) => {
  let d = memo.get(cle);
  if (!d) memo.set(cle, d = cerner(lignes));
  return d;
};
function dessinUnite(cle, taille) {
  const d = DESSINS.get(cle);
  if (!d) throw new Error(`unit\xE9 sans dessin : ${cle}`);
  return garder(`${cle}-${taille}`, d[taille === "loin" ? 0 : 1]);
}

// web/src/rendu/atlas.ts
var TAILLE_CAPITALE = 2;
var CAPITALE_PREMIERE_VERSION = 1.4;
var PART_GRANDE_VILLE = 0.95;
var REDUCTION_GRANDE_VILLE = 0.7;
var aireDe = (d) => Math.sqrt(d.grille.w * d.grille.h);
function facteursVilles(villes) {
  const rang5 = villes[4][1], capitale2 = villes[5][1];
  const grande = REDUCTION_GRANDE_VILLE * PART_GRANDE_VILLE * CAPITALE_PREMIERE_VERSION * aireDe(capitale2) / aireDe(rang5);
  return [
    TAILLE_CAPITALE,
    1,
    1.2,
    1.2,
    1.2,
    grande
  ];
}
var FACTEURS_LOIN = facteursVilles(VILLES_LOIN);
var FACTEURS_PRES = facteursVilles(VILLES_PRES);

// web/src/protocole.ts
var PRODUIT_CARBURANT = 2;
var NOMS_GROUPES = [
  "soldats",
  "chars",
  "artillerie"
];
var TOUR_AVIONS = 0;
var TOUR_NAVIRES = 1;
var TOUR_DCA = 2;
var TOUR_IMPACT = 3;
var TOUR_BOMBE = 4;
var NOMS_TOURS = [
  "Avions",
  "Navires",
  "DCA",
  "Impact nucl\xE9aire",
  "Bombe en vol"
];
var CAMP_JOUEUR = 0;
var CAMP_ALLIE = 1;
var CAMP_NEUTRE = 2;
var CAMP_ENNEMI = 3;
var BATIMENTS = [
  "puits",
  "raffinerie",
  "munitions",
  "caserne",
  "usine-chars",
  "usine-artillerie",
  "usine-avions",
  "aeroport",
  "chantier-naval",
  "depot",
  "dca",
  "silo"
];

// web/src/rendu/apparition.ts
function paliers() {
  const p = [];
  for (let e = 0.08; e < 48; e *= 1.12) p.push(e);
  p.push(48);
  return p;
}
var PALIERS = paliers();
var PALIER_JAMAIS = PALIERS.length;

// web/src/rendu/carte-gl.ts
var c = (hex2, a = 1) => [
  parseInt(hex2.slice(1, 3), 16) / 255,
  parseInt(hex2.slice(3, 5), 16) / 255,
  parseInt(hex2.slice(5, 7), 16) / 255,
  a
];
var STYLE_FLEUVES = Array.from({
  length: 10
}, (_, t) => ({
  couleur: c("#3f7fb0"),
  largeur: t <= 3 ? 1.6 : t <= 6 ? 1.1 : 0.8
}));
var STYLE_ROUTES = [
  {
    couleur: c("#000000", 0),
    largeur: 0
  },
  {
    couleur: c("#f2c75c"),
    largeur: 1.8
  },
  {
    couleur: c("#efe2b0"),
    largeur: 1.3
  },
  {
    couleur: c("#e3d8b8"),
    largeur: 1
  },
  {
    couleur: c("#d2c8ad"),
    largeur: 0.8
  },
  {
    couleur: c("#000000", 0),
    largeur: 0
  },
  {
    couleur: c("#9cc3df", 0.8),
    largeur: 1
  },
  {
    couleur: c("#000000", 0),
    largeur: 0
  },
  {
    couleur: c("#000000", 0),
    largeur: 0
  },
  {
    couleur: c("#9cc3df", 0.8),
    largeur: 1
  }
];
var COULEURS_ROUTES_TRANSPORTS = (() => {
  const t = new Float32Array(40);
  STYLE_ROUTES.forEach((s, i) => t.set(s.couleur, 4 * i));
  t.set(c("#ffaf28"), 4);
  t.set(c("#fad25a"), 8);
  return t;
})();
var STYLE_HT = [
  {
    couleur: c("#000000", 0),
    largeur: 0
  },
  {
    couleur: c("#faf096", 0.75),
    largeur: 1
  },
  {
    couleur: c("#fac846", 0.95),
    largeur: 1.6
  },
  {
    couleur: c("#ff783c"),
    largeur: 2.2
  },
  {
    couleur: c("#ff783c"),
    largeur: 2.2
  }
];
var STYLE_RAILS = [
  {
    couleur: c("#000000", 0),
    largeur: 0
  },
  {
    couleur: c("#2b2420"),
    largeur: 1.6
  },
  {
    couleur: c("#4a3d36"),
    largeur: 1.1
  }
];
var ESSAIS_GRIS_VILLE = {
  A: [
    0.66,
    0.66,
    0.67,
    0.9
  ],
  B: [
    0.42,
    0.43,
    0.46,
    0.88
  ],
  C: [
    0.62,
    0.58,
    0.53,
    0.75
  ]
};
var GRIS_VILLE = ESSAIS_GRIS_VILLE[new URLSearchParams(globalThis.location?.search ?? "").get("ville") ?? ""] ?? ESSAIS_GRIS_VILLE.A;
var ENTETE = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uCentre;   // km
uniform float uEchelle; // pixels \xC9CRAN (physiques) par km
uniform vec2 uVue;      // taille de la vue en pixels \xE9cran
vec2 versEcran(vec2 km) { return (km - uCentre) * uEchelle; }            // pixels depuis le centre, y vers le haut
vec4 versClip(vec2 px) { return vec4(px / (uVue * 0.5), 0.0, 1.0); }
`;
var FS_TERRITOIRE = ENTETE + `
uniform highp usampler2D uPays;
uniform sampler2D uPaletteT;   // couleurs des pays du territoire (F.5 : recolor\xE9es par la vue Alliances ; les unit\xE9s gardent uPalette)
uniform float uPartTeinte;     // part de la couleur du pays dans celle du sol (0,2 ; 0,75 dans la vue Alliances)
uniform highp usampler2D uRelief;   // 2 km : 0-15 profondeur, 128-159 altitude (couleurs.ts)
uniform highp usampler2D uGlace;    // 2 km : premier mois << 4 | dernier mois de glace
uniform sampler2D uTableRelief;
uniform int uAvecRelief;
uniform highp usampler2D uRivieres; // 1 km : 0 ou rang Natural Earth 1-9 (preparer_rivieres.py)
uniform uint uRangRiviere;          // rang max montr\xE9 \xE0 cette \xE9chelle, 0 = pas de rivi\xE8res
uniform highp usampler2D uOccupe;   // C.10 : occupant de chaque case de 1 km (0 = aucun)
uniform highp usampler2D uVilles;   // F.4 : villes \xE9tal\xE9es, 1 bit par case de 1 km (preparer_villes_etalees.py)
uniform int uAvecVilles;
uniform vec4 uGrisVille;            // gris des villes (rgb) et part m\xEAl\xE9e au relief
uniform uint uMois;                 // 1-12
uniform vec3 uCouleurGlace;
uniform vec4 uEmprise;   // x_min, y_max, r\xE9solution km, -
uniform ivec2 uTaille;   // largeur, hauteur de la grille
out vec4 couleur;

uint lire(ivec2 cr) {
  if (cr.x < 0 || cr.y < 0 || cr.x >= uTaille.x || cr.y >= uTaille.y) return 0u;
  return texelFetch(uPays, cr, 0).r;
}
bool eau(uint v) { return v == 0u || v == 250u; }
// pays affich\xE9 : l'occupant s'il y en a un, sinon le pays officiel
uint affiche(ivec2 cr, uint v) {
  if (eau(v) || cr.x < 0 || cr.y < 0 || cr.x >= uTaille.x || cr.y >= uTaille.y) return v;
  uint o = texelFetch(uOccupe, cr, 0).r;
  return o != 0u ? o : v;
}

uint lireRelief(ivec2 cr) {
  ivec2 q = clamp(cr / 2, ivec2(0), uTaille / 2 - 1);
  return texelFetch(uRelief, q, 0).r;
}
bool gelee(ivec2 cr) {
  ivec2 q = clamp(cr / 2, ivec2(0), uTaille / 2 - 1);
  uint g = texelFetch(uGlace, q, 0).r;
  if (g == 0u) return false;
  uint a = g >> 4u, b = g & 15u;
  return a <= b ? (uMois >= a && uMois <= b) : (uMois >= a || uMois <= b);
}
// rivi\xE8re la plus importante dans le bloc de s \xD7 s cases (s \u2264 4) : reste continue d\xE9zoom\xE9
uint lireRiviere(ivec2 cr, int s) {
  uint m = 0u;
  int n = min(s, 4);
  for (int j = 0; j < n; j++) for (int i = 0; i < n; i++) {
    ivec2 q = cr + ivec2(i, j);
    if (q.x < 0 || q.y < 0 || q.x >= uTaille.x || q.y >= uTaille.y) continue;
    uint r = texelFetch(uRivieres, q, 0).r;
    if (r > 0u && r <= uRangRiviere && (m == 0u || r < m)) m = r;
  }
  return m;
}
bool villeCase(ivec2 q) {
  if (q.x < 0 || q.y < 0 || q.x >= uTaille.x || q.y >= uTaille.y) return false;
  return ((texelFetch(uVilles, ivec2(q.x >> 3, q.y), 0).r >> uint(q.x & 7)) & 1u) == 1u;
}
// ville dans le bloc de s \xD7 s cases (s \u2264 4) : une ville reste visible d\xE9zoom\xE9
bool ville(ivec2 cr, int s) {
  int n = min(s, 4);
  for (int j = 0; j < n; j++) for (int i = 0; i < n; i++) if (villeCase(cr + ivec2(i, j))) return true;
  return false;
}
vec3 couleurCode(uint v) { return texelFetch(uTableRelief, ivec2(int(v), 0), 0).rgb; }

void main() {
  vec2 km = uCentre + (gl_FragCoord.xy - uVue * 0.5) / uEchelle;
  vec2 cellule = vec2((km.x - uEmprise.x) / uEmprise.z, (uEmprise.y - km.y) / uEmprise.z);
  ivec2 cr = ivec2(floor(cellule));
  uint a = lire(cr);
  // pas de voisinage : 1 case quand on est zoom\xE9, plusieurs quand une case < 1 pixel,
  // pour garder des fronti\xE8res d'un pixel d'\xE9paisseur \xE0 toutes les \xE9chelles
  int s = max(1, int(floor(1.0 / (uEchelle * uEmprise.z))));
  uint d = lire(cr + ivec2(s, 0));
  uint b = lire(cr + ivec2(0, s));
  uint o = affiche(cr, a);  // gains (C.10) : couleur de l'occupant, fronti\xE8re officielle gard\xE9e
  vec3 rgb = texelFetch(uPaletteT, ivec2(int(o), 0), 0).rgb;
  vec3 teinte = rgb;  // couleur du pays : voile l\xE9ger sur le relief et fronti\xE8res color\xE9es

  if (!eau(a)) {
    if (uAvecRelief == 1) {
      uint r = lireRelief(cr);
      vec3 relief = couleurCode(r >= 128u ? r : 128u);  // c\xF4te GISCO sur une case de mer ETOPO : plaine
      rgb = a == 251u ? mix(relief, vec3(0.30), 0.55) : mix(relief, teinte, uPartTeinte);
      // F.4 : pixels de ville gris\xE9s (le gris garde un peu de la teinte du relief)
      if (uAvecVilles == 1 && a != 251u && ville(cr, s)) rgb = mix(rgb, uGrisVille.rgb, uGrisVille.a);
    }
    // pas de grain par case : chaque case est d'une seule couleur, nette \xE0 tous les zooms
    bool frontiere = (d != a && !eau(d)) || (b != a && !eau(b));
    bool cote = eau(d) || eau(b) || eau(lire(cr - ivec2(s, 0))) || eau(lire(cr - ivec2(0, s)));
    // ligne de front : le pays affich\xE9 change sans fronti\xE8re officielle
    bool front = !frontiere && ((affiche(cr + ivec2(s, 0), d) != o && !eau(d)) || (affiche(cr + ivec2(0, s), b) != o && !eau(b)));
    // gains pas encore int\xE9gr\xE9s : hachures claires, d\xE9limit\xE9s hors de la forme officielle
    if (o != a && (int(gl_FragCoord.x + gl_FragCoord.y) / 3) % 3 == 0) rgb = mix(rgb, vec3(1.0), 0.22);
    if (frontiere) rgb = uAvecRelief == 1 ? teinte * 0.55 : rgb * 0.45;
    else if (front) rgb = teinte * 0.7;
    else if (cote) rgb *= 0.85;  // trait de c\xF4te : la case de terre au bord de l'eau, un peu plus sombre
    // rivi\xE8re : case pleine bleu clair, plus soutenu si navigable (passe sur les fronti\xE8res)
    uint riv = uRangRiviere > 0u ? lireRiviere(cr, s) : 0u;
    if (riv > 0u) rgb = (riv <= ${RANG_NAVIGABLE}u ? vec3(0.36, 0.62, 0.86) : vec3(0.56, 0.76, 0.92));
  } else {
    if (uAvecRelief == 1) {
      uint r = lireRelief(cr);
      bool dehors = cr.x < 0 || cr.y < 0 || cr.x >= uTaille.x || cr.y >= uTaille.y;
      rgb = couleurCode(dehors ? 12u : a == 250u || r >= 128u ? 0u : r);  // lacs et c\xF4tes : eau peu profonde
      if (!dehors && gelee(cr)) rgb = uCouleurGlace;
    }
    // pas de liser\xE9 clair m\xE9lang\xE9 c\xF4t\xE9 mer : la limite terre / mer suit les cases, franche \xE0 tous les zooms
  }
  couleur = vec4(rgb, 1.0);
}`;
var VS_LIGNES = ENTETE + `
layout(location = 0) in vec4 aSegment;  // x0, y0, x1, y1 en km (une instance par segment)
layout(location = 1) in uint aType;
uniform uint uTypeMax;
uniform float uLargeurs[10];  // pixels \xE9cran
out float vDistance;          // pixels \xE9cran le long du segment
flat out uint vType;
void main() {
  vType = aType;
  if (aType > uTypeMax || uLargeurs[aType] <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec2 p0 = versEcran(aSegment.xy);
  vec2 p1 = versEcran(aSegment.zw);
  vec2 t = p1 - p0;
  float lg = length(t);
  vec2 dir = lg > 1e-6 ? t / lg : vec2(1.0, 0.0);
  vec2 n = vec2(-dir.y, dir.x);
  // quad : sommets 0..3 en bande ; on prolonge d'une demi-largeur pour souder les segments
  float w = uLargeurs[aType] * 0.5;
  float fin = float(gl_VertexID / 2);         // 0 au d\xE9but, 1 \xE0 la fin
  float cote = float(gl_VertexID % 2) * 2.0 - 1.0;
  vec2 p = mix(p0 - dir * w, p1 + dir * w, fin) + n * cote * w;
  vDistance = fin * (lg + 2.0 * w);
  gl_Position = versClip(p);
}`;
var VS_DESSINS = ENTETE + `
layout(location = 0) in vec2 aPos;
layout(location = 1) in uvec2 aLutins;     // dessin de loin, de pr\xE8s
layout(location = 2) in uvec2 aGenreRang;
layout(location = 3) in float aEMin;        // villes : \xE9chelle d'apparition (px CSS par km, F.5) ; ports et a\xE9roports : 0
uniform float uEchelleCss;                 // \xE9chelle de la cam\xE9ra en pixels CSS par km
uniform int uSeulesCapitales;              // F.5 : 1 = seules les capitales ont leur dessin (le calque de la vue met ses marques aux autres villes)
uniform uint uRangPorts;
uniform uint uRangAeroports;
uniform uint uClassePres;                  // villes : plus petite classe en grand dessin
uniform uint uPointsPres;
uniform float uPixel;                        // pixels \xE9cran par pixel du dessin
uniform highp usampler2D uTable;
out vec2 vTexel;
void main() {
  uint genre = aGenreRang.x, rang = aGenreRang.y;
  bool montre = genre == 0u ? uEchelleCss >= aEMin && (uSeulesCapitales == 0 || (rang & 8u) != 0u)
              : genre == 1u ? rang <= uRangPorts : rang <= uRangAeroports;
  if (!montre) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vTexel = vec2(0.0); return; }
  bool pres = genre == 0u ? ((rang & 8u) != 0u ? 5u : rang & 7u) >= uClassePres : uPointsPres == 1u;
  int id = int(pres ? aLutins.y : aLutins.x);
  uvec4 r = texelFetch(uTable, ivec2(id, 0), 0);
  float sol = float(texelFetch(uTable, ivec2(id, 1), 0).x);
  vec2 taille = vec2(r.zw);
  vec2 coin = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
  // pixel \xE9cran du point (origine en bas \xE0 gauche) : la rang\xE9e du sol le recouvre,
  // la colonne du milieu est dessus ; tout reste cal\xE9 sur la grille des pixels
  vec2 s = floor(versEcran(aPos) + uVue * 0.5);
  vec2 basGauche = s - vec2(floor(taille.x * 0.5), taille.y - 1.0 - sol) * uPixel;
  vTexel = vec2(r.xy) + vec2(coin.x * taille.x, (1.0 - coin.y) * taille.y);
  gl_Position = versClip(basGauche + coin * taille * uPixel - uVue * 0.5);
}`;
var VS_UNITES = ENTETE + `
layout(location = 0) in vec2 aPos;
layout(location = 1) in uvec2 aLutins;
layout(location = 2) in uint aPays;
layout(location = 3) in vec2 aDecal;
uniform uint uPres;
uniform float uPixel;
uniform highp usampler2D uTable;
uniform sampler2D uPalette;
out vec2 vTexel;
flat out vec3 vPays;
void main() {
  int id = int(uPres == 1u ? aLutins.y : aLutins.x);
  uvec4 r = texelFetch(uTable, ivec2(id, 0), 0);
  float sol = float(texelFetch(uTable, ivec2(id, 1), 0).x);
  vec2 taille = vec2(r.zw);
  vec2 coin = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
  vec2 s = floor(versEcran(aPos) + uVue * 0.5);
  vec2 basGauche = s + (aDecal - vec2(floor(taille.x * 0.5), taille.y - 1.0 - sol)) * uPixel;
  vTexel = vec2(r.xy) + vec2(coin.x * taille.x, (1.0 - coin.y) * taille.y);
  vPays = texelFetch(uPalette, ivec2(int(aPays), 0), 0).rgb;
  gl_Position = versClip(basGauche + coin * taille * uPixel - uVue * 0.5);
}`;
function compiler(gl, vs, fs) {
  const prog = gl.createProgram();
  for (const [type, src] of [
    [
      gl.VERTEX_SHADER,
      vs
    ],
    [
      gl.FRAGMENT_SHADER,
      fs
    ]
  ]) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(`shader : ${gl.getShaderInfoLog(sh)}`);
    }
    gl.attachShader(prog, sh);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(`programme : ${gl.getProgramInfoLog(prog)}`);
  return prog;
}

// web/src/rendu/monde-gl.ts
var PAQUET = 4;
var ENTETE2 = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uCentre;   // km
uniform float uEchelle; // pixels \xE9cran par km
uniform vec2 uVue;      // pixels \xE9cran
`;
var VS_PLEIN = `#version 300 es
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`;
var FS_TERRITOIRE2 = ENTETE2 + `
uniform highp usampler2DArray uCouches;
uniform highp usampler2D uIndex;
uniform sampler2D uPalette;
uniform vec3 uGeo;        // x_min, y_max, r\xE9solution km
uniform ivec3 uTaille;    // largeur, hauteur, tuile
out vec4 couleur;

uint lire(ivec2 cr) {
  if (cr.y < 0 || cr.y >= uTaille.y) return 0u;
  cr.x = ((cr.x % uTaille.x) + uTaille.x) % uTaille.x;   // la boucle : le Pacifique n'a pas de couture
  ivec2 t = cr / uTaille.z;
  uint i = texelFetch(uIndex, t, 0).r;
  if ((i & 0x8000u) != 0u) return i & 0xFFu;
  int k = int(i);
  ivec2 o = ivec2(k % ${PAQUET}, (k / ${PAQUET}) % ${PAQUET}) * uTaille.z;
  return texelFetch(uCouches, ivec3(o + cr - t * uTaille.z, k / ${PAQUET * PAQUET}), 0).r;
}
bool eau(uint v) { return v == 0u || v == 250u; }
float bruit(ivec2 cr) {
  uint h = uint(cr.x) * 374761393u + uint(cr.y) * 668265263u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  return float(h & 1023u) / 1023.0;
}

void main() {
  vec2 km = uCentre + (gl_FragCoord.xy - uVue * 0.5) / uEchelle;
  ivec2 cr = ivec2(floor(vec2((km.x - uGeo.x) / uGeo.z, (uGeo.y - km.y) / uGeo.z)));
  uint a = lire(cr);
  int s = max(1, int(floor(1.0 / (uEchelle * uGeo.z))));
  uint d = lire(cr + ivec2(s, 0));
  uint b = lire(cr + ivec2(0, s));
  uint g = lire(cr - ivec2(s, 0));
  uint h = lire(cr - ivec2(0, s));
  vec3 rgb = texelFetch(uPalette, ivec2(int(a), 0), 0).rgb;
  if (cr.y < 0 || cr.y >= uTaille.y) rgb *= 0.6;   // au-del\xE0 de 84\xB0 N ou de 61\xB0 S : hors carte
  float grain = smoothstep(3.0, 10.0, uEchelle * uGeo.z);
  if (!eau(a)) {
    rgb *= 1.0 + (bruit(cr) - 0.5) * 0.07 * grain;
    bool frontiere = (d != a && !eau(d)) || (b != a && !eau(b));
    bool cote = eau(d) || eau(b) || eau(g) || eau(h);
    if (frontiere) rgb *= 0.45;
    else if (cote) rgb *= 0.85;
  } else if (!eau(d) || !eau(b) || !eau(g) || !eau(h)) {
    rgb = mix(rgb, vec3(0.55, 0.72, 0.84), 0.3);
  }
  couleur = vec4(rgb, 1.0);
}`;
var VS_VILLES = ENTETE2 + `
layout(location = 0) in vec2 aPos;
layout(location = 1) in uint aClasse;   // classe 1-5, + 128 capitale
uniform float uDecal;     // km : copie de la carte \xE0 gauche ou \xE0 droite
uniform uint uClasseMin;
uniform float uPixel;
flat out uint vCapitale;
void main() {
  uint c = aClasse & 127u;
  vCapitale = aClasse >> 7u;
  if (c < uClasseMin && vCapitale == 0u) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return; }
  vec2 px = (aPos + vec2(uDecal, 0.0) - uCentre) * uEchelle;
  gl_Position = vec4(px / (uVue * 0.5), 0.0, 1.0);
  gl_PointSize = (vCapitale == 1u ? 5.0 : c >= 5u ? 4.0 : c == 4u ? 3.0 : 2.0) * uPixel;
}`;
var FS_VILLES = `#version 300 es
precision highp float;
flat in uint vCapitale;
out vec4 couleur;
void main() {
  bool bord = any(lessThan(gl_PointCoord, vec2(0.2))) || any(greaterThan(gl_PointCoord, vec2(0.8)));
  vec3 c = vCapitale == 1u ? vec3(0.80, 0.18, 0.15) : vec3(0.16, 0.13, 0.11);
  couleur = vec4(bord && vCapitale == 1u ? vec3(0.98, 0.94, 0.85) : c, 1.0);
}`;
function classeMinVilles(e) {
  return e < 0.08 ? 6 : e < 0.3 ? 5 : e < 1 ? 4 : e < 3 ? 3 : 1;
}
function copiesVisibles(cx, demiLargeurKm, xMin, c2) {
  const res = [];
  for (let k = Math.floor((cx - demiLargeurKm - xMin) / c2); k <= Math.floor((cx + demiLargeurKm - xMin) / c2); k++) res.push(k * c2);
  return res;
}
var RenduMonde = class {
  canevas;
  monde;
  gl;
  progT;
  progV;
  vaoVide;
  vaoVilles;
  uni;
  couleurParPays;
  /** octets envoyés à la carte graphique (textures et tampons) */
  octetsGPU;
  constructor(canevas2, monde2) {
    this.canevas = canevas2;
    this.monde = monde2;
    this.uni = /* @__PURE__ */ new Map();
    const gl = canevas2.getContext("webgl2", {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true
    });
    if (!gl) throw new Error("WebGL2 indisponible");
    this.gl = gl;
    this.progT = compiler(gl, VS_PLEIN, FS_TERRITOIRE2);
    this.progV = compiler(gl, VS_VILLES, FS_VILLES);
    this.vaoVide = gl.createVertexArray();
    const { info, tuiles, pays, villes } = monde2;
    const T = info.tuile;
    const v = Array.from({
      length: 256
    }, () => /* @__PURE__ */ new Set());
    for (const [a, b] of info.voisins) v[a].add(b), v[b].add(a);
    this.couleurParPays = colorier(pays.map((p) => p.id), v);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    const nCouches = Math.max(1, Math.ceil(info.couches / (PAQUET * PAQUET)));
    const max = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
    if (nCouches > max) throw new Error(`${nCouches} couches de tuiles, la carte graphique en accepte ${max}`);
    const filtre = (cible) => {
      for (const p of [
        gl.TEXTURE_MIN_FILTER,
        gl.TEXTURE_MAG_FILTER
      ]) gl.texParameteri(cible, p, gl.NEAREST);
    };
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, gl.createTexture());
    filtre(gl.TEXTURE_2D_ARRAY);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.R8UI, PAQUET * T, PAQUET * T, nCouches);
    for (let k = 0; k < info.couches; k++) {
      const o = [
        k % PAQUET * T,
        Math.floor(k / PAQUET) % PAQUET * T,
        Math.floor(k / (PAQUET * PAQUET))
      ];
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, o[0], o[1], o[2], T, T, 1, gl.RED_INTEGER, gl.UNSIGNED_BYTE, tuiles.couches.subarray(k * T * T, (k + 1) * T * T));
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    filtre(gl.TEXTURE_2D);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, info.tuiles_x, info.tuiles_y, 0, gl.RED_INTEGER, gl.UNSIGNED_SHORT, tuiles.index);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    filtre(gl.TEXTURE_2D);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, tablePalette(this.couleurParPays));
    gl.activeTexture(gl.TEXTURE0);
    const pos = new Float32Array(2 * villes.n), classe = new Uint8Array(villes.n);
    for (let i = 0, j = villes.n - 1; j >= 0; i++, j--) {
      pos[2 * i] = villes.x[j], pos[2 * i + 1] = villes.y[j];
      classe[i] = villes.classe[j] | villes.capitale[j] << 7;
    }
    this.vaoVilles = gl.createVertexArray();
    gl.bindVertexArray(this.vaoVilles);
    for (const [loc, donnees] of [
      [
        0,
        pos
      ],
      [
        1,
        classe
      ]
    ]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, donnees, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      if (loc === 0) gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      else gl.vertexAttribIPointer(1, 1, gl.UNSIGNED_BYTE, 0, 0);
    }
    gl.bindVertexArray(null);
    this.octetsGPU = nCouches * (PAQUET * T) ** 2 + 2 * tuiles.index.length + pos.byteLength + classe.byteLength;
  }
  u(prog, nom) {
    const cle = `${prog === this.progT ? 0 : 1}:${nom}`;
    if (!this.uni.has(cle)) this.uni.set(cle, this.gl.getUniformLocation(prog, nom));
    return this.uni.get(cle);
  }
  communs(prog, cam, ratio2) {
    const gl = this.gl;
    gl.useProgram(prog);
    gl.uniform2f(this.u(prog, "uCentre"), cam.cx, cam.cy);
    gl.uniform1f(this.u(prog, "uEchelle"), cam.echelle * ratio2);
    gl.uniform2f(this.u(prog, "uVue"), this.canevas.width, this.canevas.height);
  }
  dessiner(cam, ratio2) {
    const gl = this.gl;
    const { info } = this.monde;
    gl.viewport(0, 0, this.canevas.width, this.canevas.height);
    const pt = this.progT;
    this.communs(pt, cam, ratio2);
    gl.uniform1i(this.u(pt, "uCouches"), 0);
    gl.uniform1i(this.u(pt, "uIndex"), 1);
    gl.uniform1i(this.u(pt, "uPalette"), 2);
    gl.uniform3f(this.u(pt, "uGeo"), info.emprise.x_min, info.emprise.y_max, info.resolution_km);
    gl.uniform3i(this.u(pt, "uTaille"), info.largeur, info.hauteur, info.tuile);
    gl.bindVertexArray(this.vaoVide);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const pv = this.progV;
    this.communs(pv, cam, ratio2);
    gl.uniform1ui(this.u(pv, "uClasseMin"), classeMinVilles(cam.echelle));
    gl.uniform1f(this.u(pv, "uPixel"), Math.max(1, Math.round(ratio2)));
    gl.bindVertexArray(this.vaoVilles);
    for (const d of copiesVisibles(cam.cx, cam.largeur / 2 / cam.echelle, info.emprise.x_min, info.circonference_km)) {
      gl.uniform1f(this.u(pv, "uDecal"), d);
      gl.drawArrays(gl.POINTS, 0, this.monde.villes.n);
    }
    gl.bindVertexArray(null);
  }
};

// web/src/rendu/dessins/flux.ts
var TAILLES = [
  "loin",
  "pres"
];
var memo2 = /* @__PURE__ */ new Map();
var garder2 = (cle, f) => {
  let d = memo2.get(cle);
  if (!d) memo2.set(cle, d = f());
  return d;
};
function cote(...blocs) {
  const h = Math.max(...blocs.map((b) => b.length));
  const out = Array(h).fill("");
  for (const b of blocs) {
    const w = Math.max(...b.map((l) => l.length));
    for (let y = 0; y < h; y++) out[y] += (b[y - (h - b.length)] ?? "").padEnd(w, ".");
  }
  return out;
}
function carre(lignes) {
  const w = Math.max(...lignes.map((l) => l.length));
  return lignes.map((l) => l.padEnd(w, "."));
}
function versGrille(lignes) {
  const l = carre(lignes), g = new Grille(l[0].length, l.length);
  l.forEach((r, y) => [
    ...r
  ].forEach((c2, x) => g.set(x, y, c2)));
  return g;
}
function versLignes(g) {
  const l = [];
  for (let y = 0; y < g.h; y++) l.push(g.p.slice(y * g.w, (y + 1) * g.w).join(""));
  return l;
}
var CHARGE = [
  "bache",
  "citerne",
  "citerne",
  "caisses"
];
function chargement(c2, taille, w) {
  const P = "P".repeat(w), O = "O".repeat(w);
  if (taille === "loin") {
    if (c2 === "bache") return [
      P,
      [
        ...P
      ].map((_, i) => i % 2 ? "O" : "P").join("")
    ];
    if (c2 === "citerne") return [
      "." + "P".repeat(w - 2) + ".",
      "Pf" + "P".repeat(w - 2),
      "." + "O".repeat(w - 2) + "."
    ].slice(0, 3);
    return [
      "PPO" + "P".repeat(w - 3),
      O
    ];
  }
  if (c2 === "bache") {
    const nervure = [
      ...P
    ].map((_, i) => i % 4 === 1 ? "O" : "P").join("");
    return [
      "." + "P".repeat(w - 2) + ".",
      P,
      nervure,
      nervure,
      O
    ];
  }
  if (c2 === "citerne") {
    return [
      "...PP" + ".".repeat(w - 5),
      "." + "P".repeat(w - 2) + ".",
      "Pff" + "P".repeat(w - 3),
      P,
      "." + "O".repeat(w - 2) + "."
    ];
  }
  const caisse = (d) => [
    ...P
  ].map((_, i) => (i + d) % 5 === 4 ? "O" : "P").join("");
  return [
    caisse(0),
    caisse(0),
    O,
    caisse(2),
    caisse(2)
  ];
}
function camion(c2, taille) {
  if (taille === "loin") {
    return [
      ...cote(chargement(c2, "loin", 6), [
        "....",
        ".ab.",
        ".aai"
      ]),
      "zzzzzzzzzz",
      ".G....G.G."
    ];
  }
  const charge = chargement(c2, "pres", 12);
  const cabine = [
    ".......",
    "..aaa..",
    ".abbba.",
    ".abbbaa",
    ".aaaaaa",
    ".aaaaai"
  ];
  return [
    ...cote([
      "............",
      ...charge
    ], cabine),
    "zzzzzzzzzzzzzzzzzzz",
    ".GG.......GG...GG.."
  ];
}
function wagon(c2, taille) {
  if (taille === "loin") {
    const w2 = c2 === "bache" ? [
      "PPPPP",
      "PbPbP"
    ] : c2 === "citerne" ? [
      ".PPP.",
      "PfPPP",
      ".OOO."
    ] : [
      "PPOPP",
      "OOOOO"
    ];
    return [
      ...w2,
      "zzzzz",
      ".G.G."
    ];
  }
  const w = c2 === "bache" ? [
    ".PPPPPPPPPP.",
    "PPPPPPPPPPPP",
    "PbbPbbPbbPbP",
    "PbbPbbPbbPbP",
    "OOOOOOOOOOOO"
  ] : c2 === "citerne" ? chargement(c2, "pres", 12) : [
    "PPPPPPPPPPPP",
    "PPPPPOOPPPPP",
    "PPPPPOOPPPPP",
    "PPPPPOOPPPPP",
    "OOOOOOOOOOOO"
  ];
  return [
    ...w,
    "zzzzzzzzzzzz",
    ".GG......GG."
  ];
}
function train(c2, taille) {
  if (taille === "loin") {
    const loco2 = [
      "......",
      ".aaab.",
      "aaaabb",
      "xxxxxx",
      "zzzzzz",
      ".G..G."
    ];
    const w2 = wagon(c2, "loin");
    return cote(w2, [
      ".",
      "z",
      "."
    ], w2, [
      ".",
      "z",
      "."
    ], loco2);
  }
  const loco = [
    ".............",
    ".aaaaaaaaaa..",
    "aaaaaaaaaabb.",
    "abbabbabaabbb",
    "xxxxxxxxxxxxx",
    "aaaaaaaaaaaaa",
    "zzzzzzzzzzzzi",
    ".GG.......GG."
  ];
  const w = wagon(c2, "pres"), attelage = [
    ".",
    "z",
    "."
  ];
  return cote(w, attelage, w, attelage, loco);
}
var CARGO_PRES = [
  "...ww..................",
  "...wbw.................",
  "..wwwwPPOPPOPPOPPOPPO..",
  "..wbwwPPOPPOPPOPPOPPO..",
  "zzzzzzzzzzzzzzzzzzzzzzz",
  ".zzzzzzzzzzzzzzzzzzzzz.",
  "..xxxxxxxxxxxxxxxxxxx.."
];
var CARGO_LOIN = [
  ".w.........",
  "wwPOPOPOPO.",
  "zzzzzzzzzzz",
  ".xxxxxxxxx."
];
var PETROLIER_PRES = [
  "..ww....................",
  "..wbw...................",
  ".wwwww..PP...PP...PP....",
  ".wbwwgggggggggggggggggg.",
  "PPPPPPPPPPPPPPPPPPPPPPPP",
  ".OOOOOOOOOOOOOOOOOOOOOO.",
  "..xxxxxxxxxxxxxxxxxxxx.."
];
var PETROLIER_LOIN = [
  "w...........",
  "wwgPgPgPgPg.",
  "PPPPPPPPPPPP",
  ".xxxxxxxxxx."
];
function dessinBille(sorte, produit, taille) {
  return garder2(`bille-${sorte}-${produit}-${taille}`, () => {
    const c2 = CHARGE[produit] ?? "caisses";
    if (sorte === 0) return cerner(carre(camion(c2, taille)));
    if (sorte === 1) return cerner(carre(train(c2, taille)));
    if (sorte === 2) return cerner(taille === "loin" ? CARGO_LOIN : CARGO_PRES);
    return cerner(taille === "loin" ? PETROLIER_LOIN : PETROLIER_PRES);
  });
}
function dessinPointBille(sorte) {
  return garder2(`point-${sorte}`, () => {
    const l = sorte === 0 ? [
      "PP",
      "PP"
    ] : [
      "kPPk",
      "PPPP",
      "kPPk"
    ];
    return {
      grille: versGrille(l),
      sol: l.length - 1
    };
  });
}
var UNITE_DU_TYPE = [
  "infanterie",
  "char",
  "artillerie"
];
function dessinGroupe(type, taille) {
  return garder2(`groupe-${type}-${taille}`, () => {
    if (taille === "loin") {
      const L2 = 13, H2 = 11, g2 = new Grille(L2, H2);
      for (let r = 0; r < H2; r++) {
        for (let c2 = 0; c2 < L2; c2++) {
          const bord = r === 0 || r === H2 - 1 || c2 === 0 || c2 === L2 - 1;
          const i = r - 1, j = c2 - 1;
          let signe = false;
          if (type === 0) signe = Math.abs(j - i * 1.25) < 0.7 || Math.abs(j - (10 - i * 1.25)) < 0.7;
          else if (type === 1) {
            const dx = (j - 5) / 3.9, dy = (i - 4) / 2.6, q = dx * dx + dy * dy;
            signe = q > 0.45 && q < 1.15;
          } else signe = (j - 5) ** 2 + (i - 4) ** 2 <= 3.3;
          g2.set(c2, r, bord ? "k" : r === H2 - 2 ? "O" : signe ? "f" : "P");
        }
      }
      return {
        grille: g2,
        sol: H2 - 1
      };
    }
    const u = dessinUnite(UNITE_DU_TYPE[type] ?? "infanterie", "loin").grille;
    const L = 20, H = 16, g = new Grille(L, H);
    for (let r = 0; r < H; r++) {
      for (let c2 = 0; c2 < L; c2++) {
        const bord = r === 0 || r === H - 1 || c2 === 0 || c2 === L - 1;
        const fond = r >= 3 && r <= H - 4 && c2 >= 3 && c2 <= L - 4;
        g.set(c2, r, bord ? "k" : fond ? "f" : r >= H - 3 ? "O" : "P");
      }
    }
    const x0 = Math.floor((L - u.w) / 2), y0 = Math.floor((H - u.h) / 2);
    for (let y = 0; y < u.h; y++) for (let x = 0; x < u.w; x++) if (u.get(x, y) !== ".") g.set(x0 + x, y0 + y, u.get(x, y));
    return {
      grille: g,
      sol: H - 1
    };
  });
}
function dessinAvions(taille) {
  return dessinUnite("chasseur", taille);
}
function dessinNavires(taille) {
  return dessinUnite("fregate", taille);
}
var BOMBES_KT = [
  15,
  50,
  200,
  1e3,
  1e4
];
function rangBombe(kt) {
  let r = 0;
  for (let i = 1; i < BOMBES_KT.length; i++) if (kt >= Math.sqrt(BOMBES_KT[i - 1] * BOMBES_KT[i])) r = i;
  return r;
}
var FORMES_BOMBES = [
  [
    12,
    2,
    "m",
    "M"
  ],
  [
    10,
    3,
    "y",
    "Y"
  ],
  [
    14,
    2,
    "a",
    "g"
  ],
  [
    16,
    3,
    "g",
    "G"
  ],
  [
    20,
    4,
    "f",
    "s"
  ]
];
function dessinBombe(rang, taille) {
  return garder2(`bombe-${rang}-${taille}`, () => {
    const [L0, R0, corps, ombre] = FORMES_BOMBES[rang];
    const L = taille === "loin" ? Math.round(L0 / 2) + 1 : L0, R = taille === "loin" ? Math.max(1, Math.round(R0 / 2)) : R0;
    const ail = taille === "loin" ? 2 : 3, W = L + ail, H = 2 * R + 1 + (rang >= 3 ? 2 : 0);
    const g = new Grille(W, H), cy = (H - 1) / 2;
    const rayon = (x) => {
      if (x < 1) return R - 0.6;
      if (x > L - R - 1) return R * Math.sqrt(Math.max(0, 1 - ((x - (L - R - 1)) / (R + 0.6)) ** 2)) + 0.3;
      return R + 0.3;
    };
    const bande = Math.round(L * 0.45);
    for (let x = 0; x < L; x++) {
      for (let y = 0; y < H; y++) {
        const d = Math.abs(y - cy);
        if (d > rayon(x)) continue;
        let c2 = y < cy ? corps : y > cy ? ombre : corps;
        if (x === bande || taille === "pres" && x === bande + 1) c2 = y <= cy ? "P" : "O";
        if (rang === 4 && (x === bande - 3 || x === bande + 4)) c2 = "x";
        g.set(ail + x, y, c2);
      }
    }
    for (let i = 0; i < ail; i++) {
      for (let y = 0; y < H; y++) {
        const d = Math.abs(y - cy);
        if (d >= R - 1 + (rang >= 3 ? 1 : 0) && d <= R + (rang >= 3 ? 1 : 0)) g.set(i, y, "G");
      }
    }
    return cerner(versLignes(g));
  });
}
function dessinChampignon(rang, taille) {
  return garder2(`champignon-${rang}-${taille}`, () => {
    const w = (taille === "loin" ? [
      5,
      6,
      7,
      9,
      11
    ] : [
      9,
      11,
      13,
      17,
      21
    ])[rang];
    const capH = Math.max(3, Math.round(w * 0.42)), tige = Math.max(2, Math.round(w * 0.5)), base = 2;
    const H = capH + tige + base, g = new Grille(w + 2, H), cx = (w + 1) / 2;
    for (let y = 0; y < capH; y++) {
      for (let x = 0; x < w + 2; x++) {
        const u = (x - cx) / (w / 2), v = (y - capH + 0.5) / capH;
        if (u * u + v * v > 1) continue;
        g.set(x, y, y >= capH - 1 ? "x" : u < -0.25 && v < -0.35 ? "y" : u > 0.35 ? "R" : "o");
      }
    }
    const lt = Math.max(1, Math.round(w / 6));
    for (let y = capH; y < capH + tige; y++) {
      for (let x = Math.round(cx - lt / 2); x < Math.round(cx - lt / 2) + lt; x++) g.set(x, y, x > cx - 0.5 && lt > 1 ? "s" : "f");
    }
    for (let y = capH + tige; y < H; y++) {
      const l = Math.round(w * (y === H - 1 ? 0.95 : 0.6));
      for (let x = Math.round(cx - l / 2); x < Math.round(cx - l / 2) + l; x++) g.set(x, y, y === H - 1 ? "s" : "f");
    }
    return cerner(versLignes(g));
  });
}
var BATIMENTS_PRES2 = {
  // chevalet de pompage sur un champ, petit réservoir
  puits: [
    "..yy..............",
    ".yyyyyyyyyyyyy....",
    ".yyy.....G........",
    ".yyy....GGG.......",
    "..|....GG.GG...gg.",
    "..|...GG...GG.gggg",
    "..|..GG.....GGgGgg",
    "..zz.GG.....GGgggg",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // colonnes de distillation, sphère, torchère
  raffinerie: [
    "..y...............",
    ".yxy..g...........",
    "..x..ggg..........",
    "..|..gGg..g.......",
    "..|..gGg.ggg......",
    "..|..gGg.gGg..aaa.",
    "..|..gGgggGg.aaaga",
    "..|..gGg.gGg.aaagg",
    "..|..gGg.gGg..ggg.",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // poudrerie : hangar voûté kaki marqué d'un obus
  munitions: [
    "....mmmmmmmmmm....",
    "..mmmmmmmmmmmmmm..",
    ".mmmmmmmmmmmmmmMM.",
    "mmmmmmmyymmmmmmMMM",
    "mmmmmmyyyymmmmmMMM",
    "mmmmmmYYYYmmmmmMMM",
    "mmmmmmYYYYmmmmmMMM",
    "mmmmmmmmmmmmmmmMMM",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // caserne : long bâtiment à toit rouge, mât et drapeau du camp
  caserne: [
    ".|PPPP............",
    ".|PPPP............",
    ".|................",
    ".|..rrrrrrrrrrrrr.",
    ".|.rrrrrrrrrrrrrRR",
    ".|.wwwwwwwwwwwwwws",
    ".|.webwebwebwebws.",
    ".|.wwwwwwddwwwwws.",
    ".|.wwwwwwddwwwwws.",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // usine à sheds et un char devant
  "usine-chars": [
    "..............GG..",
    ".g..g..g..g...GG..",
    "gGggGggGggGg..GG..",
    "gGGgGGgGGgGGggGGg.",
    "ggggggggggggggggg.",
    "gebgebgebgebgebgg.",
    "ggggggggggggggggg.",
    "....mmmk..........",
    "..mmmmmmmmm.......",
    ".mmmmmmmmmmm......",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // usine à sheds et un canon devant
  "usine-artillerie": [
    "..............GG..",
    ".g..g..g..g...GG..",
    "gGggGggGggGg..GG..",
    "gGGgGGgGGgGGggGGg.",
    "ggggggggggggggggg.",
    "gebgebgebgebgebgg.",
    "ggggggggggggggggg.",
    "............kk....",
    "..mmmm...kkk......",
    ".mmmmmmkkk........",
    ".Gt.Gt............",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // hangar à porte cintrée, avion devant
  "usine-avions": [
    "....aaaaaaaaaa....",
    "..aaaaaaaaaaaaaa..",
    ".aaaaaaaaaaaaaaag.",
    ".aaaeeeeeeeeeeagg.",
    ".aaeeeeeeeeeeeegg.",
    ".aaeeeaeeeeeeeegg.",
    ".aaeeaaaaaeeeeegg.",
    ".aaeeeaeeeeeeeegg.",
    ".aaeeeeeeeeeeeegg.",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // tour de contrôle et piste
  aeroport: [
    "...bbbb...........",
    "..bbbbbb..........",
    "..zzzzzz..........",
    "...gggg...........",
    "...gGgg...........",
    "...gGgg...aaaaaa..",
    "...gGgg..aaaaaaaa.",
    "...gGgg..aeeeeeea.",
    "...gGgg..aeeeeeea.",
    "zzzzzzzzzzzzzzzzzz",
    "zfzzfzzfzzfzzfzzfz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // grue portique, coque en cale sèche, eau
  "chantier-naval": [
    "yyyyyyyyyyyyyyyy..",
    "y..........y...Y..",
    "y..........|...Y..",
    "y..........|...Y..",
    "y..zzzzzzzzzzzzY..",
    "y...zzzzzzzzzzzY..",
    "y....xxxxxxxxxxY..",
    "y..............Y..",
    "nnnnnnnnnnnnnnnnnn",
    "nlnnnlnnnlnnnlnnnl",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // entrepôt à portes du camp, citernes, caisses
  depot: [
    "...ggggggggggg....",
    "..ggggggggggggg...",
    ".ggggggggggggggG..",
    ".gPPPgPPPgPPPgG...",
    ".gPOPgPOPgPOPgG.aa",
    ".gPOPgPOPgPOPgGaag",
    ".gPOPgPOPgPOPgGaag",
    ".ggggggggggggggt.t",
    "...............ttt",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // canon antiaérien bitube sur sa plate-forme, sacs de sable
  dca: [
    "............kk....",
    "..........kk.kk...",
    "........kk.kk.....",
    "......kk.kk.......",
    ".....mmkk.........",
    "....mmmmm.........",
    "...mmmmmmmM.......",
    "..ssssssssssss....",
    ".sSsSsSsSsSsSss...",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ],
  // silo : trappe ouverte, ogive de la fusée, trèfle jaune
  silo: [
    "......aa..........",
    ".....aaaa.........",
    ".....aaxa.........",
    "..GGGaaaaGGG......",
    ".gggggggggggggg...",
    ".gggggggggggggg...",
    ".ggggggggyykyyg...",
    ".ggggggggykykyg...",
    ".ggggggggyykyyg...",
    "zzzzzzzzzzzzzzzzzz",
    "PPPPPPPPPPPPPPPPPP"
  ]
};
var ETATS_BATIMENT = [
  "chantier",
  "normal",
  "niveau2"
];
var PLUS_SOMBRE = {
  w: "s",
  s: "Q",
  g: "G",
  G: "z",
  a: "g",
  m: "M",
  y: "Y",
  r: "R",
  b: "B",
  P: "O",
  f: "s",
  t: "d",
  n: "N",
  l: "L",
  q: "r"
};
function niveau2(l) {
  const w = l[0].length, h = l.length, dx = Math.round(w * 0.35), dy = 3;
  const g = new Grille(w + dx, h + dy);
  const corps = l.slice(0, h - 1);
  corps.forEach((r, y) => [
    ...r
  ].forEach((c2, x) => c2 !== "." && g.set(x, y, PLUS_SOMBRE[c2] ?? c2)));
  corps.forEach((r, y) => [
    ...r
  ].forEach((c2, x) => c2 !== "." && g.set(x + dx, y + dy, c2)));
  for (let x = 0; x < w + dx; x++) g.set(x, h + dy - 1, "P");
  const cx = w + dx - 3;
  for (const [x, y] of [
    [
      0,
      0
    ],
    [
      2,
      0
    ],
    [
      0,
      1
    ],
    [
      2,
      1
    ],
    [
      0,
      2
    ],
    [
      2,
      2
    ]
  ]) g.set(cx + x, y, "y");
  return versLignes(g);
}
function chantier(l, pas) {
  const w = l[0].length, h = l.length, haut = Math.ceil((h - 1) * 0.55);
  const g = versGrille(l);
  for (let y = 0; y < haut; y++) for (let x = 0; x < w; x++) g.set(x, y, ".");
  for (let y = haut; y < h - 2; y++) for (let x = 0; x < w; x++) if (g.get(x, y) !== ".") g.set(x, y, (x + y) % 5 ? "g" : "G");
  let x0 = w, x1 = -1;
  for (let x = 0; x < w; x++) if (l[haut]?.[x] !== "." || l[haut + 1]?.[x] !== ".") x0 = Math.min(x0, x), x1 = Math.max(x1, x);
  const y0 = Math.max(1, haut - 2 * pas);
  for (let y = y0; y < haut; y++) {
    for (let x = x0; x <= x1; x++) {
      if ((x - x0) % (2 * pas) === 0 || x === x1) g.set(x, y, "|");
      if ((y - y0) % pas === 0) g.set(x, y, "t");
    }
  }
  const m = Math.min(w - 1, x1 + 1);
  for (let y = 0; y < h - 1; y++) g.set(m, y, "y");
  for (let x = Math.max(0, m - Math.round(w * 0.7)); x <= m; x++) g.set(x, 0, "y");
  const c2 = Math.max(0, m - Math.round(w * 0.5));
  for (let y = 1; y < y0 + 1; y++) g.set(c2, y, "|");
  return versLignes(g);
}
function dessinBatiment(nom, etat2, taille) {
  return garder2(`bat-${nom}-${etat2}-${taille}`, () => {
    const base = BATIMENTS_PRES2[nom];
    if (!base) throw new Error(`b\xE2timent sans dessin : ${nom}`);
    const pres2 = etat2 === "normal" ? base : etat2 === "niveau2" ? niveau2(carre(base)) : chantier(carre(base), 3);
    if (taille === "pres") return cerner(carre(pres2));
    const l = reduire(carre(etat2 === "chantier" ? chantier(carre(base), 4) : pres2));
    return cerner(l);
  });
}
var NOMS_BATIMENTS = Object.keys(BATIMENTS_PRES2);
function dessinDecor(quoi) {
  return garder2(`decor-${quoi}`, () => cerner(quoi === "port" ? [
    ".PPfPP.",
    "PPfffPP",
    "PPPfPPP",
    "PfPfPfP",
    "PPfffPP",
    ".PPPPP."
  ] : [
    "..PfP..",
    "PPPfPPP",
    "PffffP.",
    "PPPfPPP",
    ".PfffP.",
    "..PPP.."
  ].map((r) => r.padEnd(7, "."))));
}
function dessinAxe() {
  return garder2("axe", () => cerner([
    "d.d.d.d.d.",
    "GGGGGGGGGG",
    "d.d.d.d.d.",
    "GGGGGGGGGG",
    "d.d.d.d.d.",
    "PPPPPPPPPP"
  ]));
}
function dessinCombat() {
  return garder2("combat", () => cerner([
    "a.......a",
    ".a.....a.",
    "..a...a..",
    "...a.a...",
    "....a....",
    "...a.a...",
    "ydy...ydy",
    ".y.....y.",
    "y.......y"
  ]));
}
function svgDessin(d, teinte, z = 2) {
  const g = d.grille, t = [
    1,
    3,
    5
  ].map((i) => parseInt(teinte.slice(i, i + 2), 16));
  const sombre = "#" + t.map((v) => Math.round(v * 0.7).toString(16).padStart(2, "0")).join("");
  const couleur = (c2) => c2 === "P" ? teinte : c2 === "O" ? sombre : PALETTE2[c2];
  let r = "";
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; ) {
      const c2 = g.get(x, y);
      let n = 1;
      while (x + n < g.w && g.get(x + n, y) === c2) n++;
      if (c2 !== ".") r += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${couleur(c2)}"/>`;
      x += n;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${g.w * z}" height="${g.h * z}" viewBox="0 0 ${g.w} ${g.h}" shape-rendering="crispEdges">${r}</svg>`;
}

// web/src/rendu/lutins-flux.ts
var LUTINS = [];
var INDICE = /* @__PURE__ */ new Map();
var parDessin = /* @__PURE__ */ new Map();
function ajouter(cle, d) {
  let i = parDessin.get(d);
  if (i === void 0) parDessin.set(d, i = LUTINS.length), LUTINS.push([
    cle,
    d
  ]);
  INDICE.set(cle, i);
  return i;
}
var BILLES = [
  0,
  1,
  2,
  3
].map((s) => [
  0,
  1,
  2,
  3
].map((p) => [
  ajouter(`point-${s}`, dessinPointBille(s)),
  ...TAILLES.map((t) => ajouter(`bille-${s}-${p}-${t}`, dessinBille(s, p, t)))
]));
var GROUPES = [
  0,
  1,
  2
].map((g) => TAILLES.map((t) => ajouter(`groupe-${g}-${t}`, dessinGroupe(g, t))));
var BATS = BATIMENTS.map((nom) => ETATS_BATIMENT.map((e) => TAILLES.map((t) => ajouter(`b:${nom}-${e}-${t}`, dessinBatiment(nom, e, t)))));
var AVIONS = TAILLES.map((t) => ajouter(`avions-${t}`, dessinAvions(t)));
var NAVIRES2 = TAILLES.map((t) => ajouter(`navires-${t}`, dessinNavires(t)));
var BOMBES = [
  0,
  1,
  2,
  3,
  4
].map((r) => TAILLES.map((t) => ajouter(`bombe-${r}-${t}`, dessinBombe(r, t))));
var IMPACTS = [
  0,
  1,
  2,
  3,
  4
].map((r) => TAILLES.map((t) => ajouter(`impact-${r}-${t}`, dessinChampignon(r, t))));
var LUTIN_PORT = ajouter("port", dessinDecor("port"));
var LUTIN_AEROPORT = ajouter("aeroport-civil", dessinDecor("aeroport-civil"));
function lutinBille(sorte, produit, vue) {
  return BILLES[sorte & 3][produit & 3][vue];
}
function lutinGroupe(type, pres2) {
  return GROUPES[type]?.[pres2 ? 1 : 0] ?? GROUPES[0][0];
}
function lutinBatiment(genre, niveau, pres2) {
  return BATS[genre][Math.min(2, niveau)][pres2 ? 1 : 0];
}
function lutinTour(genre, nombre2, pres2) {
  const t = pres2 ? 1 : 0;
  if (genre === TOUR_AVIONS) return AVIONS[t];
  if (genre === TOUR_NAVIRES) return NAVIRES2[t];
  if (genre === TOUR_DCA) return BATS[BATIMENTS.indexOf("dca")][1][t];
  if (genre === TOUR_IMPACT) return IMPACTS[rangBombe(nombre2)][t];
  if (genre === TOUR_BOMBE) return BOMBES[rangBombe(nombre2)][t];
  return AVIONS[t];
}
var hex8 = (h) => [
  1,
  3,
  5
].map((i) => parseInt(h.slice(i, i + 2), 16));
function atlasCouleurs(largeur = 512) {
  const rects = new Uint16Array(4 * LUTINS.length);
  const ordre = LUTINS.map((_, i) => i).sort((a, b) => LUTINS[b][1].grille.h - LUTINS[a][1].grille.h || a - b);
  let x = 0, y = 0, hRang = 0;
  for (const i of ordre) {
    const g = LUTINS[i][1].grille;
    if (x + g.w > largeur) x = 0, y += hRang + 1, hRang = 0;
    rects.set([
      x,
      y,
      g.w,
      g.h
    ], 4 * i);
    x += g.w + 1;
    hRang = Math.max(hRang, g.h);
  }
  const hauteur = y + hRang;
  const rgba = new Uint8Array(4 * largeur * hauteur);
  LUTINS.forEach(([cle, d], i) => {
    const [x0, y0] = rects.subarray(4 * i, 4 * i + 2), g = d.grille;
    for (let r = 0; r < g.h; r++) {
      for (let c2 = 0; c2 < g.w; c2++) {
        const v = g.get(c2, r);
        if (v === ".") continue;
        const o = 4 * ((y0 + r) * largeur + x0 + c2), t = TEINTE_PAYS[v];
        const coul = couleurLettre(v);
        if (!coul) throw new Error(`lutin ${cle} : lettre \xAB ${v} \xBB`);
        rgba.set([
          ...hex8(coul),
          t ? t.alpha : 255
        ], o);
      }
    }
  });
  return {
    largeur,
    hauteur,
    rgba,
    rects
  };
}
var hex = (h) => [
  1,
  3,
  5
].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
var TEINTES = [
  hex("#7bd66a"),
  hex("#7a4e2a"),
  hex("#f6c437"),
  hex("#e8562e"),
  hex("#3a78d8"),
  hex("#24a88f"),
  hex("#9a958c"),
  hex("#cf2f2a"),
  hex("#c9a227"),
  hex("#2f6f9f"),
  hex("#5d6672")
];
var TEINTE_CAMP = 4;
var TEINTE_PORT = 9;
var TEINTE_AEROPORT = 10;

// web/src/carte/projection-monde.ts
var R_KM = 6371.0072;
var CIRCONFERENCE_KM = 2 * Math.PI * R_KM;
var RAD = Math.PI / 180;
function projeter(lon, lat) {
  const p = Math.max(-89, Math.min(89, lat)) * RAD;
  return [
    R_KM * lon * RAD,
    R_KM * Math.log(Math.tan(Math.PI / 4 + p / 2))
  ];
}
function inverser(x, y) {
  const lon = ((x / R_KM / RAD + 180) % 360 + 360) % 360 - 180;
  return [
    lon,
    (2 * Math.atan(Math.exp(y / R_KM)) - Math.PI / 2) / RAD
  ];
}
function boucler(x, xMin = -CIRCONFERENCE_KM / 2, c2 = CIRCONFERENCE_KM) {
  return ((x - xMin) % c2 + c2) % c2 + xMin;
}
function distanceKm(lon1, lat1, lon2, lat2) {
  const p1 = lat1 * RAD, p2 = lat2 * RAD;
  const a = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((lon2 - lon1) * RAD / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
function lireTuiles(octets, info) {
  const n = info.tuiles_x * info.tuiles_y;
  const attendu = 2 * n + info.couches * info.tuile * info.tuile;
  if (octets.byteLength !== attendu) throw new Error(`monde-pays.bin.z : ${octets.byteLength} octets au lieu de ${attendu}`);
  return {
    info,
    index: new Uint16Array(octets, 0, n),
    couches: new Uint8Array(octets, 2 * n)
  };
}
function valeurCase(t, c2, r) {
  const { largeur, hauteur, tuile, tuiles_x } = t.info;
  if (r < 0 || r >= hauteur) return 0;
  c2 = (c2 % largeur + largeur) % largeur;
  const tx2 = Math.floor(c2 / tuile), ty = Math.floor(r / tuile);
  const i = t.index[ty * tuiles_x + tx2];
  if (i & 32768) return i & 255;
  return t.couches[i * tuile * tuile + (r - ty * tuile) * tuile + (c2 - tx2 * tuile)];
}
function valeurSous(t, x, y) {
  const e = t.info.emprise;
  return valeurCase(t, Math.floor((x - e.x_min) / t.info.resolution_km), Math.floor((e.y_max - y) / t.info.resolution_km));
}
function lireVillesMonde(octets, noms) {
  const n = octets.byteLength / 14;
  if (n !== noms.length) throw new Error(`monde-villes : ${n} lieux pour ${noms.length} noms`);
  const d = new DataView(octets);
  const v = {
    n,
    noms,
    x: new Float32Array(n),
    y: new Float32Array(n),
    pop: new Uint32Array(n),
    pays: new Uint8Array(n),
    classe: new Uint8Array(n),
    capitale: new Uint8Array(n)
  };
  for (let i = 0; i < n; i++) {
    const o = 14 * i;
    v.x[i] = d.getFloat32(o, true);
    v.y[i] = d.getFloat32(o + 4, true);
    v.pop[i] = d.getUint32(o + 8, true);
    v.pays[i] = d.getUint8(o + 12);
    const k = d.getUint8(o + 13);
    v.classe[i] = k & 127;
    v.capitale[i] = k >> 7;
  }
  return v;
}
async function chargerMonde(lire2) {
  const texte2 = async (nom) => new TextDecoder().decode(await lire2(nom));
  const info = JSON.parse(await texte2("monde.json"));
  const [pays, grille, villes, noms] = await Promise.all([
    texte2("monde-pays.json").then((t) => JSON.parse(t)),
    lire2("monde-pays.bin.z").then(decompresser),
    lire2("monde-villes.bin.z").then(decompresser),
    texte2("monde-villes.json").then((t) => JSON.parse(t))
  ]);
  return {
    info,
    pays,
    tuiles: lireTuiles(grille, info),
    villes: lireVillesMonde(villes, noms)
  };
}

// web/src/carte/monde-reseau.ts
var R_TERRE_KM = 6371.0072;
function distanceGlobeKm(lon1, lat1, lon2, lat2) {
  const r = Math.PI / 180;
  const p1 = lat1 * r, p2 = lat2 * r, dp = p2 - p1, dl = (lon2 - lon1) * r;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R_TERRE_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
var Tas = class {
  cles = [];
  vals = [];
  get taille() {
    return this.cles.length;
  }
  pousser(cle, val) {
    const c2 = this.cles, v = this.vals;
    let i = c2.length;
    c2.push(cle);
    v.push(val);
    while (i > 0) {
      const p = i - 1 >> 1;
      if (c2[p] <= cle) break;
      c2[i] = c2[p];
      v[i] = v[p];
      i = p;
    }
    c2[i] = cle;
    v[i] = val;
  }
  /** retire le plus petit : [clé, valeur] */
  retirer() {
    const c2 = this.cles, v = this.vals;
    const cle0 = c2[0], val0 = v[0];
    const ck = c2.pop(), vk = v.pop();
    const n = c2.length;
    if (n > 0) {
      let i = 0;
      for (; ; ) {
        let f = 2 * i + 1;
        if (f >= n) break;
        if (f + 1 < n && c2[f + 1] < c2[f]) f++;
        if (c2[f] >= ck) break;
        c2[i] = c2[f];
        v[i] = v[f];
        i = f;
      }
      c2[i] = ck;
      v[i] = vk;
    }
    return [
      cle0,
      val0
    ];
  }
};
var LecteurVarint = class {
  o;
  p;
  constructor(o, p = 0) {
    this.o = o;
    this.p = p;
  }
  uv() {
    let r = 0, m = 1, b;
    do {
      b = this.o[this.p++];
      r += (b & 127) * m;
      m *= 128;
    } while (b & 128);
    return r;
  }
  zz() {
    const u = this.uv();
    return u % 2 ? -(u + 1) / 2 : u / 2;
  }
};
var UNITE_KM = 0.1;
function lireAxes(octets) {
  const o = new Uint8Array(octets);
  if (String.fromCharCode(o[0], o[1], o[2], o[3]) !== "AXE1") throw new Error("axes : format inattendu");
  const v = new DataView(octets);
  const nNoeuds = v.getUint32(4, true), nAretes = v.getUint32(8, true), nPts = v.getUint32(12, true);
  const r = new LecteurVarint(o, 16);
  const noeuds = new Float32Array(2 * nNoeuds);
  const qx = new Int32Array(nNoeuds), qy = new Int32Array(nNoeuds);
  for (let i = 0, x = 0, y = 0; i < nNoeuds; i++) {
    x += r.zz();
    y += r.zz();
    qx[i] = x;
    qy[i] = y;
    noeuds[2 * i] = x * UNITE_KM;
    noeuds[2 * i + 1] = y * UNITE_KM;
  }
  const g = {
    nNoeuds,
    nAretes,
    noeuds,
    a: new Uint32Array(nAretes),
    b: new Uint32Array(nAretes),
    type: new Uint8Array(nAretes),
    classe: new Uint8Array(nAretes),
    km: new Float32Array(nAretes),
    offsets: new Uint32Array(nAretes + 1),
    pts: new Float32Array(2 * nPts)
  };
  let a = 0, k = 0;
  for (let e = 0; e < nAretes; e++) {
    a += r.zz();
    g.a[e] = a;
    g.b[e] = a + r.zz();
    const t = r.uv();
    g.type[e] = t % 4;
    g.classe[e] = Math.floor(t / 4);
    g.km[e] = r.uv() / 10;
    let x = qx[a], y = qy[a];
    for (let n = r.uv(); n > 0; n--) {
      x += r.zz();
      y += r.zz();
      g.pts[2 * k] = x * UNITE_KM;
      g.pts[2 * k + 1] = y * UNITE_KM;
      k++;
    }
    g.offsets[e + 1] = k;
  }
  if (r.p !== o.length || k !== nPts) throw new Error("axes : taille inattendue");
  return g;
}
function adjacenceDe(nNoeuds, a, b) {
  const debut = new Uint32Array(nNoeuds + 1);
  for (let e = 0; e < a.length; e++) {
    debut[a[e] + 1]++;
    debut[b[e] + 1]++;
  }
  for (let i = 0; i < nNoeuds; i++) debut[i + 1] += debut[i];
  const rempli = debut.slice(0, nNoeuds);
  const arete = new Uint32Array(2 * a.length);
  for (let e = 0; e < a.length; e++) {
    arete[rempli[a[e]]++] = e;
    arete[rempli[b[e]]++] = e;
  }
  return {
    debut,
    arete
  };
}
function lireVivantes(octets) {
  const v = new DataView(octets);
  if (String.fromCharCode(...new Uint8Array(octets, 0, 4)) !== "VIV1") throw new Error("vivantes : format inattendu");
  const n = v.getUint32(4, true), seuil = v.getUint32(8, true);
  if (octets.byteLength !== 12 + n * (4 + 2 + 4 + 2)) throw new Error("vivantes : taille inattendue");
  let o = 12;
  const noeudRoute = new Uint32Array(octets.slice(o, o + 4 * n));
  o += 4 * n;
  const kmRoute = new Uint16Array(octets.slice(o, o + 2 * n));
  o += 2 * n;
  const noeudRail = new Int32Array(octets.slice(o, o + 4 * n));
  o += 4 * n;
  const kmRail = new Uint16Array(octets.slice(o, o + 2 * n));
  return {
    n,
    seuil,
    noeudRoute,
    kmRoute,
    noeudRail,
    kmRail
  };
}
function lirePortsMonde(j) {
  const d = j;
  return {
    n: d.n,
    noms: d.nom,
    x: Float32Array.from(d.x),
    y: Float32Array.from(d.y),
    rang: Uint8Array.from(d.rang),
    pays: Uint8Array.from(d.pays),
    noeudRoute: Int32Array.from(d.noeud_route),
    kmRoute: Uint16Array.from(d.km_route),
    noeudRail: Int32Array.from(d.noeud_rail),
    kmRail: Uint16Array.from(d.km_rail),
    mer: Int32Array.from(d.mer),
    kmMer: Uint16Array.from(d.km_mer)
  };
}
function lireAeroportsMonde(j) {
  const d = j;
  return {
    n: d.n,
    icao: d.icao,
    iata: d.iata,
    noms: d.nom,
    x: Float32Array.from(d.x),
    y: Float32Array.from(d.y),
    grand: Uint8Array.from(d.grand),
    civil: Uint8Array.from(d.civil),
    militaire: Uint8Array.from(d.militaire),
    pays: Uint8Array.from(d.pays),
    noeudRoute: Int32Array.from(d.noeud_route),
    kmRoute: Uint16Array.from(d.km_route)
  };
}
function lireContinents(j) {
  const d = j;
  return {
    noms: d.continents,
    dePays: Int8Array.from(d.continent_du_pays)
  };
}
var ReseauMer = class {
  n;
  nAretes;
  /** degrés */
  lon;
  lat;
  a;
  b;
  km;
  /** bits des passages que l'arête traverse (0 : arête libre) */
  masque;
  passages;
  adj;
  constructor(octets, passages) {
    const o = new Uint8Array(octets);
    if (String.fromCharCode(o[0], o[1], o[2], o[3]) !== "MER1") throw new Error("mer : format inattendu");
    const v = new DataView(octets);
    const n = v.getUint32(4, true), na = v.getUint32(8, true), np = v.getUint32(12, true);
    if (np !== passages.length) throw new Error(`mer : ${np} passages dans le fichier, ${passages.length} d\xE9crits`);
    const r = new LecteurVarint(o, 16);
    this.n = n;
    this.nAretes = na;
    this.lon = new Float32Array(n);
    this.lat = new Float32Array(n);
    for (let i = 0, x = 0, y = 0; i < n; i++) {
      x += r.zz();
      y += r.zz();
      this.lon[i] = x / 100;
      this.lat[i] = y / 100;
    }
    this.a = new Uint32Array(na);
    this.b = new Uint32Array(na);
    for (let a = 0, e = 0; a < n; a++) {
      let prev = a;
      for (let k = r.uv(); k > 0; k--) {
        prev += r.uv();
        this.a[e] = a;
        this.b[e] = prev;
        e++;
      }
    }
    this.masque = new Uint16Array(na);
    for (let k = r.uv(), e = 0; k > 0; k--) {
      e += r.uv();
      this.masque[e] = r.uv();
    }
    if (r.p !== o.length) throw new Error("mer : taille inattendue");
    this.km = new Float32Array(na);
    for (let e = 0; e < na; e++) {
      this.km[e] = distanceGlobeKm(this.lon[this.a[e]], this.lat[this.a[e]], this.lon[this.b[e]], this.lat[this.b[e]]);
    }
    this.adj = adjacenceDe(n, this.a, this.b);
    this.passages = passages.map((p, bit) => ({
      id: p.id,
      nom: p.nom,
      type: p.type,
      bit: 1 << bit
    }));
  }
  /** Masque de fermeture pour une liste d'identifiants de passages (« suez », « panama »…). */
  fermeture(ids) {
    let m = 0;
    for (const id of ids) {
      const p = this.passages.find((q) => q.id === id);
      if (!p) throw new Error(`passage inconnu : ${id}`);
      m |= p.bit;
    }
    return m;
  }
  /** Plus court chemin (Dijkstra) entre deux noeuds ; `fermes` = masque des passages fermés. */
  itineraire(depuis, vers, fermes = 0) {
    const { debut, arete } = this.adj;
    const dist = new Float64Array(this.n).fill(Infinity);
    const pere = new Int32Array(this.n).fill(-1);
    dist[depuis] = 0;
    const tas = new Tas();
    tas.pousser(0, depuis);
    while (tas.taille > 0) {
      const [d, u] = tas.retirer();
      if (d > dist[u]) continue;
      if (u === vers) break;
      for (let i = debut[u]; i < debut[u + 1]; i++) {
        const e = arete[i];
        if (this.masque[e] & fermes) continue;
        const w = this.a[e] === u ? this.b[e] : this.a[e];
        const nd = d + this.km[e];
        if (nd < dist[w]) {
          dist[w] = nd;
          pere[w] = u;
          tas.pousser(nd, w);
        }
      }
    }
    if (!isFinite(dist[vers])) return null;
    const noeuds = [
      vers
    ];
    while (noeuds[noeuds.length - 1] !== depuis) noeuds.push(pere[noeuds[noeuds.length - 1]]);
    return {
      km: dist[vers],
      noeuds: noeuds.reverse()
    };
  }
  /** Composante connexe de chaque noeud (en tenant compte des fermetures). */
  composantes(fermes = 0) {
    const pere = new Int32Array(this.n).map((_, i) => i);
    const trouver = (i) => {
      while (pere[i] !== i) {
        pere[i] = pere[pere[i]];
        i = pere[i];
      }
      return i;
    };
    for (let e = 0; e < this.nAretes; e++) if (!(this.masque[e] & fermes)) pere[trouver(this.a[e])] = trouver(this.b[e]);
    return pere.map((_, i) => trouver(i));
  }
};
async function chargerReseauMonde(lire2) {
  const texte2 = async (nom) => JSON.parse(new TextDecoder().decode(await lire2(nom)));
  const z = async (nom) => decompresser(await lire2(nom));
  const [axesOctets, vivOctets, merOctets, ports, aeroports, continents, merInfo] = await Promise.all([
    z("monde-axes.bin.z"),
    z("monde-vivantes.bin.z"),
    z("monde-mer.bin.z"),
    texte2("monde-ports.json"),
    texte2("monde-aeroports.json"),
    texte2("monde-continents.json"),
    texte2("monde-mer.json")
  ]);
  const axes = lireAxes(axesOctets);
  return {
    axes,
    adjacence: adjacenceDe(axes.nNoeuds, axes.a, axes.b),
    vivantes: lireVivantes(vivOctets),
    ports: lirePortsMonde(ports),
    aeroports: lireAeroportsMonde(aeroports),
    continents: lireContinents(continents),
    mer: new ReseauMer(merOctets, merInfo.passages)
  };
}

// web/src/carte/trajets.ts
function pres(x, ref, c2 = CIRCONFERENCE_KM) {
  return x - Math.round((x - ref) / c2) * c2;
}
function lignesMaritimes(mer, sources, kmMax = 7e3) {
  const adj = adjacenceDe(mer.n, mer.a, mer.b);
  const dist = new Float64Array(mer.n).fill(Infinity);
  const pere = new Int32Array(mer.n).fill(-1);
  const zone2 = new Int32Array(mer.n).fill(-1);
  const tas = [];
  const pousser = (d, v) => {
    let i = tas.length / 2;
    tas.push(d, v);
    while (i > 0) {
      const q = i - 1 >> 1;
      if (tas[2 * q] <= d) break;
      tas[2 * i] = tas[2 * q], tas[2 * i + 1] = tas[2 * q + 1];
      i = q;
    }
    tas[2 * i] = d, tas[2 * i + 1] = v;
  };
  const retirer = () => {
    const d0 = tas[0], v0 = tas[1];
    const v = tas.pop(), d = tas.pop();
    const n = tas.length / 2;
    if (n) {
      let i = 0;
      for (; ; ) {
        let f = 2 * i + 1;
        if (f >= n) break;
        if (f + 1 < n && tas[2 * f + 2] < tas[2 * f]) f++;
        if (tas[2 * f] >= d) break;
        tas[2 * i] = tas[2 * f], tas[2 * i + 1] = tas[2 * f + 1];
        i = f;
      }
      tas[2 * i] = d, tas[2 * i + 1] = v;
    }
    return [
      d0,
      v0
    ];
  };
  for (const s of sources) {
    if (s < 0 || dist[s] === 0) continue;
    dist[s] = 0, zone2[s] = s;
    pousser(0, s);
  }
  while (tas.length) {
    const [d, u] = retirer();
    if (d > dist[u]) continue;
    for (let i = adj.debut[u]; i < adj.debut[u + 1]; i++) {
      const e = adj.arete[i];
      const w = mer.a[e] === u ? mer.b[e] : mer.a[e];
      const nd = d + mer.km[e];
      if (nd < dist[w]) dist[w] = nd, pere[w] = e, zone2[w] = zone2[u], pousser(nd, w);
    }
  }
  const masque = new Uint8Array(mer.nAretes);
  const remonter = (v) => {
    while (pere[v] >= 0 && !masque[pere[v]]) {
      const e = pere[v];
      masque[e] = 1;
      v = mer.a[e] === v ? mer.b[e] : mer.a[e];
    }
  };
  const contact = /* @__PURE__ */ new Map();
  for (let e = 0; e < mer.nAretes; e++) {
    const za = zone2[mer.a[e]], zb = zone2[mer.b[e]];
    if (za < 0 || zb < 0 || za === zb) continue;
    const km = dist[mer.a[e]] + dist[mer.b[e]] + mer.km[e];
    if (km > kmMax) continue;
    const cle = Math.min(za, zb) * 65536 + Math.max(za, zb);
    const c2 = contact.get(cle);
    if (!c2 || km < c2[1]) contact.set(cle, [
      e,
      km
    ]);
  }
  for (const [e] of contact.values()) {
    masque[e] = 1;
    remonter(mer.a[e]);
    remonter(mer.b[e]);
  }
  return masque;
}
var PositionsTrajets = class {
  n = 0;
  /** premier point de chaque trajet dans `xy` et `cumul` (n + 1 valeurs) */
  debut = new Uint32Array(1);
  mode = new Uint8Array(0);
  xy = new Float32Array(0);
  cumul = new Float32Array(0);
  nPts = 0;
  /** Ajoute les trajets d'un message (`premier` = 0 : remplace tout). */
  recevoir(t) {
    if (t.premier === 0) this.n = 0, this.nPts = 0;
    if (t.premier !== this.n) throw new Error(`trajets : ${t.premier} re\xE7u, ${this.n} attendu`);
    const nPts = this.nPts + t.xy.length / 2, n = this.n + t.n;
    if (2 * nPts > this.xy.length) {
      const cap = Math.max(2 * nPts, 2 * this.xy.length);
      const xy = new Float32Array(cap), cu = new Float32Array(cap / 2);
      xy.set(this.xy.subarray(0, 2 * this.nPts)), cu.set(this.cumul.subarray(0, this.nPts));
      this.xy = xy, this.cumul = cu;
    }
    if (n + 1 > this.debut.length) {
      const d = new Uint32Array(Math.max(n + 1, 2 * this.debut.length)), m = new Uint8Array(d.length);
      d.set(this.debut.subarray(0, this.n + 1)), m.set(this.mode.subarray(0, this.n));
      this.debut = d, this.mode = m;
    }
    this.xy.set(t.xy, 2 * this.nPts);
    for (let i = 0; i < t.n; i++) {
      const d = this.nPts + t.offsets[i], f = this.nPts + t.offsets[i + 1];
      this.debut[this.n + i] = d;
      this.mode[this.n + i] = t.mode[i];
      let s = 0;
      for (let k = d; k < f; k++) {
        if (k > d) s += Math.hypot(this.xy[2 * k] - this.xy[2 * k - 2], this.xy[2 * k + 1] - this.xy[2 * k - 1]);
        this.cumul[k] = s;
      }
    }
    this.n = n, this.nPts = nPts;
    this.debut[n] = nPts;
  }
  /** Longueur du trajet (km de carte). */
  longueur(i) {
    const f = this.debut[i + 1] - 1;
    return f >= this.debut[i] ? this.cumul[f] : 0;
  }
  /** Position à l'abscisse t (bornée à [0, 1]) : écrit x, y et la direction en x (−1 ou 1) dans `sortie` à partir de `o`. */
  position(i, t, sortie, o) {
    const d = this.debut[i], f = this.debut[i + 1] - 1;
    if (f <= d) {
      sortie[o] = this.xy[2 * d], sortie[o + 1] = this.xy[2 * d + 1], sortie[o + 2] = 1;
      return;
    }
    const s = Math.min(1, Math.max(0, t)) * this.cumul[f];
    let a = d, b = f;
    while (b - a > 1) {
      const m = a + b >> 1;
      if (this.cumul[m] <= s) a = m;
      else b = m;
    }
    const l = this.cumul[b] - this.cumul[a];
    const u = l > 0 ? (s - this.cumul[a]) / l : 0;
    const x0 = this.xy[2 * a], y0 = this.xy[2 * a + 1], x1 = this.xy[2 * b], y1 = this.xy[2 * b + 1];
    sortie[o] = x0 + (x1 - x0) * u;
    sortie[o + 1] = y0 + (y1 - y0) * u;
    sortie[o + 2] = x1 >= x0 ? 1 : -1;
  }
};

// web/src/rendu/flux-gl.ts
var ENTETE3 = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uCentre;   // km
uniform float uEchelle; // pixels \xE9cran par km
uniform vec2 uVue;      // pixels \xE9cran
uniform float uDecal;   // km : copie de la carte
`;
var STYLE = {
  route3: 0,
  route2: 1,
  route1: 2,
  rail3: 3,
  rail2: 4,
  rail1: 5,
  mer: 6
};
var GENRE_ROUTE = 0;
var GENRE_RAIL = 1;
var GENRE_TIRETS = 2;
var VS_LIGNES2 = ENTETE3 + `
layout(location = 0) in vec4 aSeg;    // x0, y0, x1, y1 (km)
layout(location = 1) in float aCumul; // km de carte depuis le d\xE9but de la polyligne (motifs continus d'un segment \xE0 l'autre)
layout(location = 2) in uint aStyle;
uniform float uLargeur[7];            // pixels \xE9cran (0 = cach\xE9)
out float vLong;                      // pixels \xE9cran le long de la ligne
out float vTravers;                   // pixels \xE9cran \xE0 travers (\u2212demi \xE0 +demi)
flat out uint vStyle;
flat out float vDemi;
void main() {
  vStyle = aStyle;
  float w = uLargeur[aStyle] * 0.5;
  vDemi = w;
  if (w <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec2 p0 = (aSeg.xy + vec2(uDecal, 0.0) - uCentre) * uEchelle;
  vec2 p1 = (aSeg.zw + vec2(uDecal, 0.0) - uCentre) * uEchelle;
  vec2 t = p1 - p0;
  float lg = length(t);
  vec2 dir = lg > 1e-6 ? t / lg : vec2(1.0, 0.0);
  vec2 n = vec2(-dir.y, dir.x);
  float fin = float(gl_VertexID / 2);
  float cote = float(gl_VertexID % 2) * 2.0 - 1.0;
  // prolong\xE9 d'une demi-largeur aux deux bouts : les segments se soudent
  vec2 p = mix(p0 - dir * w, p1 + dir * w, fin) + n * cote * w;
  vLong = aCumul * uEchelle + mix(-w, lg + w, fin);
  vTravers = cote * w;
  gl_Position = vec4(p / (uVue * 0.5), 0.0, 1.0);
}`;
var FS_LIGNES = `#version 300 es
precision highp float;
precision highp int;
uniform vec4 uCouleur[7];
uniform vec4 uBord[7];      // route : bordure ; rail : traverses
uniform int uGenre[7];
uniform float uPx;          // pixels \xE9cran par pixel CSS
uniform int uTraverses[7];  // rails : 0 trait seul, 1 traverses, 2 deux files de rails et traverses
in float vLong;
in float vTravers;
flat in uint vStyle;
flat in float vDemi;
out vec4 couleur;
void main() {
  int g = uGenre[vStyle];
  float a = abs(vTravers);
  vec4 c;
  if (g == ${GENRE_ROUTE}) {
    c = vDemi >= 1.0 * uPx && a > vDemi - 0.8 * uPx ? uBord[vStyle] : uCouleur[vStyle];
  } else if (g == ${GENRE_RAIL}) {
    int tr = uTraverses[vStyle];
    bool voie = tr == 2 ? abs(a - vDemi * 0.42) < 0.55 * uPx : a < max(0.6 * uPx, tr == 0 ? vDemi : 0.0);
    bool traverse = tr > 0 && mod(vLong, (tr == 2 ? 6.0 : 5.0) * uPx) < 1.4 * uPx;
    if (voie) c = uCouleur[vStyle];
    else if (traverse) c = uBord[vStyle];
    else discard;
  } else {
    if (mod(vLong, 9.0 * uPx) > 4.5 * uPx) discard;
    c = uCouleur[vStyle];
  }
  couleur = c;
}`;
var c4 = (h, a = 1) => [
  ...[
    1,
    3,
    5
  ].map((i) => parseInt(h.slice(i, i + 2), 16) / 255),
  a
];
var COULEURS = [
  c4("#f6cf6e"),
  c4("#efe3c0"),
  c4("#e4dabd", 0.9),
  c4("#24201d"),
  c4("#2e2925"),
  c4("#3a332e", 0.9),
  c4("#cfe6f6", 0.5)
];
var BORDS = [
  c4("#80592a"),
  c4("#7f725e"),
  c4("#7f725e"),
  c4("#4e3c2e", 0.85),
  c4("#4e3c2e", 0.8),
  c4("#4e3c2e", 0.7),
  c4("#000000", 0)
];
var GENRES = [
  GENRE_ROUTE,
  GENRE_ROUTE,
  GENRE_ROUTE,
  GENRE_RAIL,
  GENRE_RAIL,
  GENRE_RAIL,
  GENRE_TIRETS
];
function largeursLignes(e) {
  const r3 = e < 0.08 ? 0.8 : e < 0.3 ? 1.3 : e < 1.5 ? 2.2 : e < 6 ? 3.2 : 4.2;
  const r2 = e < 0.12 ? 0 : e < 0.5 ? 0.8 : e < 1.5 ? 1.5 : e < 6 ? 2.4 : 3.2;
  const r1 = e < 0.3 ? 0 : e < 1 ? 0.7 : e < 6 ? 1.4 : 2.2;
  const rail = (base, classe) => {
    const t = traversesRails(e, classe);
    return t === 0 ? base : t === 1 ? 3.8 : 6.2;
  };
  const f3 = e < 0.08 ? 0.9 : 1.2, f2 = e < 0.12 ? 0 : 1, f1 = e < 0.3 ? 0 : 0.8;
  return [
    r3,
    r2,
    r1,
    rail(f3, 3),
    f2 ? rail(f2, 2) : 0,
    f1 ? rail(f1, 1) : 0,
    1.2
  ];
}
function traversesRails(e, classe = 3) {
  if (classe === 1) return e < 3 ? 0 : 2;
  return e < 0.6 ? 0 : e < 3 ? 1 : 2;
}
var N_LUTINS = LUTINS.length;
var VS_LUTINS = ENTETE3 + `
layout(location = 0) in vec2 aPos;     // km (ramen\xE9 dans la carte)
layout(location = 1) in uvec4 aInfo;   // lutin, teinte, drapeaux (1 = miroir), libre
uniform uvec4 uRects[${N_LUTINS}];
uniform float uPixel;                  // pixels \xE9cran par pixel du dessin
out vec2 vTexel;
flat out uint vTeinte;
void main() {
  uvec4 r = uRects[aInfo.x];
  vec2 taille = vec2(r.zw);
  vec2 coin = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
  // cal\xE9 sur la grille des pixels \xE9cran (origine en bas \xE0 gauche)
  vec2 s = floor((aPos + vec2(uDecal, 0.0) - uCentre) * uEchelle + uVue * 0.5);
  vec2 basGauche = s - floor(taille * 0.5) * uPixel;
  float cx = (aInfo.z & 1u) != 0u ? 1.0 - coin.x : coin.x;
  vTexel = vec2(r.xy) + vec2(cx * taille.x, (1.0 - coin.y) * taille.y);
  vTeinte = aInfo.y;
  vec2 p = basGauche + coin * taille * uPixel - uVue * 0.5;
  gl_Position = vec4(p / (uVue * 0.5), 0.0, 1.0);
}`;
var FS_LUTINS = `#version 300 es
precision highp float;
precision highp int;
uniform highp usampler2D uAtlas;
uniform vec3 uTeintes[${TEINTES.length}];
in vec2 vTexel;
flat in uint vTeinte;
out vec4 couleur;
// alpha 255 : couleur de la palette ; 254 : teinte de l'instance ; 253 : teinte sombre (\xD7 0,7) ; 0 : vide
void main() {
  uvec4 c = texelFetch(uAtlas, ivec2(floor(vTexel)), 0);
  if (c.a == 0u) discard;
  vec3 t = uTeintes[vTeinte];
  couleur = vec4(c.a == 254u ? t : c.a == 253u ? t * 0.7 : vec3(c.rgb) / 255.0, 1.0);
}`;
var Instances = class {
  gl;
  n;
  pos;
  info;
  vao;
  bPos;
  bInfo;
  capGPU;
  constructor(gl) {
    this.gl = gl;
    this.n = 0;
    this.pos = new Float32Array(0);
    this.info = new Uint8Array(0);
    this.capGPU = 0;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.bPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bPos);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 1);
    this.bInfo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bInfo);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribIPointer(1, 4, gl.UNSIGNED_BYTE, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindVertexArray(null);
  }
  reserver(n) {
    if (n > this.pos.length / 2) this.pos = new Float32Array(2 * n), this.info = new Uint8Array(4 * n);
    this.n = n;
  }
  /** Envoie les n premières instances à la carte graphique. */
  envoyer() {
    const gl = this.gl, n = this.n;
    if (n > this.capGPU) {
      this.capGPU = Math.max(n, 2 * this.capGPU, 64);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bPos);
      gl.bufferData(gl.ARRAY_BUFFER, 8 * this.capGPU, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bInfo);
      gl.bufferData(gl.ARRAY_BUFFER, 4 * this.capGPU, gl.DYNAMIC_DRAW);
    }
    if (!n) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bPos);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pos, 0, 2 * n);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bInfo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.info, 0, 4 * n);
  }
};
var RenduFlux = class {
  gl;
  monde;
  reseau;
  progL;
  progS;
  uni;
  routes;
  rails;
  mer;
  ports;
  nPortsRang;
  aeroports;
  nGrandsAeroports;
  billes;
  groupes;
  tours;
  batiments;
  atlasRects;
  trajets;
  /** dernier rendu reçu de la simulation */
  dernier;
  /** V2.E.1 : vue Jeu (tout) ou Flux (réseau et billes en points de couleur, sans groupes ni tours) */
  vue;
  /** dessins choisis à la dernière image : billes 0 (points), 1 (loin), 2 (près) ; forces et bâtiments de près */
  vueBilles;
  presTours;
  presBatiments;
  /** positions affichées des groupes (km de carte, dans la carte) : pour les étiquettes et le survol */
  posGroupes;
  /** octets envoyés à la carte graphique pour les lignes */
  octetsGPU;
  /** segments des axes, et des lignes maritimes */
  nSegments;
  nSegmentsMer;
  sortie;
  xMin;
  C;
  constructor(gl, monde2, reseau) {
    this.gl = gl;
    this.monde = monde2;
    this.reseau = reseau;
    this.uni = /* @__PURE__ */ new Map();
    this.nPortsRang = [];
    this.nGrandsAeroports = 0;
    this.trajets = new PositionsTrajets();
    this.dernier = null;
    this.vue = "jeu";
    this.vueBilles = 1;
    this.presTours = false;
    this.presBatiments = false;
    this.posGroupes = new Float32Array(0);
    this.sortie = new Float32Array(3);
    this.xMin = monde2.info.emprise.x_min;
    this.C = monde2.info.circonference_km;
    this.progL = compiler(gl, VS_LIGNES2, FS_LIGNES);
    this.progS = compiler(gl, VS_LUTINS, FS_LUTINS);
    const axes = reseau.axes;
    const couches = [];
    let octets = 0, nSeg = 0;
    for (const type of [
      0,
      1
    ]) {
      const seg3 = [], cumul2 = [], style2 = [], jusqua = [];
      for (const classe of [
        3,
        2,
        1
      ]) {
        const st = (type === 0 ? STYLE.route3 : STYLE.rail3) + (3 - classe);
        for (let e = 0; e < axes.nAretes; e++) {
          if (axes.type[e] !== type || axes.classe[e] !== classe) continue;
          let px = axes.noeuds[2 * axes.a[e]], py = axes.noeuds[2 * axes.a[e] + 1], s = 0;
          const pas = (x, y) => {
            x = pres(x, px, this.C);
            seg3.push(px, py, x, y), cumul2.push(s), style2.push(st);
            s += Math.hypot(x - px, y - py);
            px = x, py = y;
          };
          for (let k = axes.offsets[e]; k < axes.offsets[e + 1]; k++) pas(axes.pts[2 * k], axes.pts[2 * k + 1]);
          pas(axes.noeuds[2 * axes.b[e]], axes.noeuds[2 * axes.b[e] + 1]);
        }
        jusqua.push(style2.length);
      }
      couches.push(this.coucheLignes(seg3, cumul2, style2, jusqua));
      octets += style2.length * 21, nSeg += style2.length;
    }
    [this.routes, this.rails] = couches;
    this.nSegments = nSeg;
    const P = reseau.ports, m = reseau.mer;
    const sources = [];
    for (let i = 0; i < P.n; i++) if (P.rang[i] <= 4 && P.mer[i] >= 0) sources.push(P.mer[i]);
    const masque = lignesMaritimes(m, sources);
    const seg2 = [], cumul = [], style = [];
    for (let e = 0; e < m.nAretes; e++) {
      if (!masque[e]) continue;
      const [x0, y0] = projeter(m.lon[m.a[e]], m.lat[m.a[e]]);
      const [x1, y1] = projeter(m.lon[m.b[e]], m.lat[m.b[e]]);
      seg2.push(x0, y0, pres(x1, x0, this.C), y1), cumul.push(0), style.push(STYLE.mer);
    }
    this.mer = this.coucheLignes(seg2, cumul, style, [
      style.length
    ]);
    this.nSegmentsMer = style.length;
    this.octetsGPU = octets + style.length * 21;
    const at = atlasCouleurs();
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    for (const p of [
      gl.TEXTURE_MIN_FILTER,
      gl.TEXTURE_MAG_FILTER
    ]) gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8UI, at.largeur, at.hauteur, 0, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, at.rgba);
    gl.activeTexture(gl.TEXTURE0);
    this.atlasRects = Uint32Array.from(at.rects);
    this.ports = new Instances(gl);
    const ordreP = [
      ...Array(P.n).keys()
    ].sort((a, b) => P.rang[a] - P.rang[b]);
    this.ports.reserver(P.n);
    const lp = LUTIN_PORT, la = LUTIN_AEROPORT;
    ordreP.forEach((i, k) => {
      this.ports.pos[2 * k] = P.x[i], this.ports.pos[2 * k + 1] = P.y[i];
      this.ports.info.set([
        lp,
        TEINTE_PORT,
        0,
        0
      ], 4 * k);
    });
    for (const r of [
      3,
      5,
      8
    ]) this.nPortsRang.push(ordreP.filter((i) => P.rang[i] <= r).length);
    this.ports.envoyer();
    const A = reseau.aeroports;
    this.aeroports = new Instances(gl);
    const ordreA = [
      ...Array(A.n).keys()
    ].sort((a, b) => A.grand[b] - A.grand[a]);
    this.aeroports.reserver(A.n);
    ordreA.forEach((i, k) => {
      this.aeroports.pos[2 * k] = A.x[i], this.aeroports.pos[2 * k + 1] = A.y[i];
      this.aeroports.info.set([
        la,
        TEINTE_AEROPORT,
        0,
        0
      ], 4 * k);
    });
    this.nGrandsAeroports = ordreA.filter((i) => A.grand[i]).length;
    this.aeroports.envoyer();
    this.billes = new Instances(gl);
    this.groupes = new Instances(gl);
    this.tours = new Instances(gl);
    this.batiments = new Instances(gl);
  }
  coucheLignes(seg2, cumul, style, jusqua) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    for (const [loc, donnees, taille] of [
      [
        0,
        new Float32Array(seg2),
        4
      ],
      [
        1,
        new Float32Array(cumul),
        1
      ],
      [
        2,
        new Uint8Array(style),
        1
      ]
    ]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, donnees, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      if (loc === 2) gl.vertexAttribIPointer(loc, 1, gl.UNSIGNED_BYTE, 0, 0);
      else gl.vertexAttribPointer(loc, taille, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindVertexArray(null);
    return {
      vao,
      jusqua
    };
  }
  /** Un message de rendu de la simulation : trajets nouveaux, puis tout le reste remplacé. */
  recevoir(r) {
    if (r.trajets) this.trajets.recevoir(r.trajets);
    this.dernier = r;
    this.poserImmobiles();
  }
  /** Tours et bâtiments : immobiles jusqu'au prochain message ; refaits aussi quand on passe de loin à près. */
  poserImmobiles() {
    const r = this.dernier;
    if (!r) return;
    const o = r.tours, tp = this.presTours;
    this.tours.reserver(o.n);
    for (let i = 0; i < o.n; i++) {
      this.tours.pos[2 * i] = boucler(o.xy[2 * i], this.xMin, this.C), this.tours.pos[2 * i + 1] = o.xy[2 * i + 1];
      this.tours.info.set([
        lutinTour(o.genre[i], o.nombre[i], tp),
        TEINTE_CAMP + o.camp[i],
        0,
        0
      ], 4 * i);
    }
    this.tours.envoyer();
    const b = r.batiments, bp = this.presBatiments;
    this.batiments.reserver(b.n);
    for (let i = 0; i < b.n; i++) {
      this.batiments.pos[2 * i] = boucler(b.xy[2 * i], this.xMin, this.C), this.batiments.pos[2 * i + 1] = b.xy[2 * i + 1];
      this.batiments.info.set([
        lutinBatiment(b.genre[i], b.niveau?.[i] ?? 1, bp),
        TEINTE_CAMP + b.camp[i],
        0,
        0
      ], 4 * i);
    }
    this.batiments.envoyer();
  }
  /** Positions des billes placées à la dernière image (x, y en km de carte) : l'autotest vérifie l'interpolation. */
  get posBilles() {
    return this.billes.pos;
  }
  /** Quelque chose bouge (billes ou groupes en marche) : redessiner à chaque image tant que le temps passe. */
  anime() {
    const r = this.dernier;
    return !!r && (r.billes.n > 0 || r.groupes.dt.some((d) => d !== 0));
  }
  /** Place billes et groupes à l'heure affichée (fractionnaire) : t + dt × (heure − heure du rendu). */
  placer(heure) {
    const r = this.dernier;
    if (!r) return;
    const f = Math.min(1.5, Math.max(0, heure - r.heure));
    const s = this.sortie, T = this.trajets;
    const B = r.billes, bi = this.billes;
    bi.reserver(B.n);
    for (let i = 0; i < B.n; i++) {
      const dt = B.dt[i];
      T.position(B.trajet[i], B.t[i] + dt * f, s, 0);
      bi.pos[2 * i] = boucler(s[0], this.xMin, this.C), bi.pos[2 * i + 1] = s[1];
      const g = B.genre[i], o = 4 * i;
      bi.info[o] = lutinBille(g & 3, g >> 2, this.vueBilles), bi.info[o + 1] = g >> 2, bi.info[o + 2] = s[2] * dt < 0 ? 1 : 0;
    }
    bi.envoyer();
    const G = r.groupes, gr = this.groupes;
    gr.reserver(G.n);
    if (this.posGroupes.length < 2 * G.n) this.posGroupes = new Float32Array(2 * G.n);
    for (let i = 0; i < G.n; i++) {
      if (G.trajet[i] >= 0) T.position(G.trajet[i], G.t[i] + G.dt[i] * f, s, 0);
      else s[0] = G.xy[2 * i], s[1] = G.xy[2 * i + 1];
      const x = boucler(s[0], this.xMin, this.C);
      gr.pos[2 * i] = this.posGroupes[2 * i] = x, gr.pos[2 * i + 1] = this.posGroupes[2 * i + 1] = s[1];
      gr.info.set([
        lutinGroupe(G.type[i], this.presTours),
        TEINTE_CAMP + G.camp[i],
        0,
        0
      ], 4 * i);
    }
    gr.envoyer();
  }
  u(p, nom) {
    const cle = `${p === this.progL ? "L" : "S"}:${nom}`;
    if (!this.uni.has(cle)) this.uni.set(cle, this.gl.getUniformLocation(p, nom));
    return this.uni.get(cle);
  }
  communs(p, cam, ratio2, w, h) {
    const gl = this.gl;
    gl.useProgram(p);
    gl.uniform2f(this.u(p, "uCentre"), cam.cx, cam.cy);
    gl.uniform1f(this.u(p, "uEchelle"), cam.echelle * ratio2);
    gl.uniform2f(this.u(p, "uVue"), w, h);
  }
  /** Dessine tout, après la planète. `heure` = heure de jeu affichée (fractionnaire). Rend le nombre d'appels de dessin. */
  dessiner(cam, ratio2, w, h, heure) {
    const gl = this.gl;
    const e = cam.echelle;
    this.vueBilles = e < LOIN_BILLES || this.vue === "flux" ? 0 : e < PRES_BILLES ? 1 : 2;
    const tp = e >= PRES_FORCES, bp = e >= PRES_BATIMENTS;
    if (tp !== this.presTours || bp !== this.presBatiments) this.presTours = tp, this.presBatiments = bp, this.poserImmobiles();
    this.placer(heure);
    const copies = copiesVisibles(cam.cx, cam.largeur / 2 / e, this.xMin, this.C);
    let appels = 0;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const pl = this.progL;
    this.communs(pl, cam, ratio2, w, h);
    const px = Math.max(1, Math.round(ratio2));
    const largeurs = largeursLignes(e).map((l) => l * px);
    gl.uniform1fv(this.u(pl, "uLargeur"), largeurs);
    gl.uniform4fv(this.u(pl, "uCouleur"), COULEURS.flat());
    gl.uniform4fv(this.u(pl, "uBord"), BORDS.flat());
    gl.uniform1iv(this.u(pl, "uGenre"), GENRES);
    gl.uniform1f(this.u(pl, "uPx"), px);
    gl.uniform1iv(this.u(pl, "uTraverses"), [
      0,
      0,
      0,
      traversesRails(e, 3),
      traversesRails(e, 2),
      traversesRails(e, 1),
      0
    ]);
    const nClasses = (l) => l[2] > 0 ? 3 : l[1] > 0 ? 2 : l[0] > 0 ? 1 : 0;
    const nRoutes = nClasses(largeurs.slice(0, 3)), nRails = nClasses(largeurs.slice(3, 6));
    for (const d of copies) {
      gl.uniform1f(this.u(pl, "uDecal"), d);
      for (const [c2, n] of [
        [
          this.mer,
          1
        ],
        [
          this.routes,
          nRoutes
        ],
        [
          this.rails,
          nRails
        ]
      ]) {
        if (!n) continue;
        gl.bindVertexArray(c2.vao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, c2.jusqua[n - 1]);
        appels++;
      }
    }
    const ps = this.progS;
    this.communs(ps, cam, ratio2, w, h);
    gl.uniform4uiv(this.u(ps, "uRects"), this.atlasRects);
    gl.uniform1i(this.u(ps, "uAtlas"), 6);
    gl.uniform3fv(this.u(ps, "uTeintes"), TEINTES.flat());
    gl.uniform1f(this.u(ps, "uPixel"), px);
    const nPorts = e < 0.1 ? this.nPortsRang[0] : e < 0.4 ? this.nPortsRang[1] : this.nPortsRang[2];
    const nAero = e < 0.15 ? 0 : e < 0.6 ? this.nGrandsAeroports : this.aeroports.n;
    const flux2 = this.vue === "flux";
    const listes = [
      [
        this.ports,
        nPorts
      ],
      [
        this.aeroports,
        nAero
      ],
      [
        this.batiments,
        e < 0.15 ? 0 : this.batiments.n
      ],
      [
        this.billes,
        this.billes.n
      ],
      [
        this.groupes,
        flux2 ? 0 : this.groupes.n
      ],
      [
        this.tours,
        flux2 ? 0 : this.tours.n
      ]
    ];
    for (const d of copies) {
      gl.uniform1f(this.u(ps, "uDecal"), d);
      for (const [ins, n] of listes) {
        if (!n) continue;
        gl.bindVertexArray(ins.vao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
        appels++;
      }
    }
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    return appels;
  }
  /** Tour ou groupe sous le point écran (px, py en pixels CSS), à 10 pixels près. */
  sous(cam, px, py) {
    const r = this.dernier;
    let mieux = {
      genre: null,
      i: -1
    }, d2 = 10 * 10;
    if (!r || this.vue === "flux") return mieux;
    const essayer = (genre, i, x, y) => {
      for (const d of copiesVisibles(cam.cx, cam.largeur / 2 / cam.echelle, this.xMin, this.C)) {
        const [sx, sy] = cam.versEcran(x + d, y);
        const dd = (sx - px) ** 2 + (sy - py) ** 2;
        if (dd < d2) d2 = dd, mieux = {
          genre,
          i
        };
      }
    };
    for (let i = 0; i < r.tours.n; i++) essayer("tour", i, this.tours.pos[2 * i], this.tours.pos[2 * i + 1]);
    const g = this.posGroupes;
    for (let i = 0; i < r.groupes.n; i++) essayer("groupe", i, g[2 * i], g[2 * i + 1]);
    return mieux;
  }
  /** Texte du survol d'un groupe ou d'une tour. */
  texteSous(s) {
    const r = this.dernier;
    if (!r || s.genre === null) return "";
    if (s.genre === "tour") {
      const o = r.tours, i2 = s.i;
      const g = o.genre[i2], n = Math.round(o.nombre[i2]);
      const quoi = g === TOUR_DCA ? `${n} t de munitions` : g === TOUR_IMPACT || g > TOUR_IMPACT ? `${n >= 1e3 ? `${n / 1e3} Mt` : `${n} kt`}` : `${n}`;
      return `${NOMS_TOURS[g] ?? "?"} : ${quoi}${o.rayonKm[i2] > 0 ? ` \xB7 rayon ${Math.round(o.rayonKm[i2])} km` : ""}`;
    }
    const G = r.groupes, i = s.i;
    return `Groupe ${G.id[i]} : ${formatEffectif(G.effectif[i])} (${NOMS_GROUPES[G.type[i]]} en t\xEAte)`;
  }
  /** Calque 2D : effectifs à côté des groupes, cercle de rayon de la tour survolée. */
  calque(ctx, cam, survol2) {
    const r = this.dernier;
    if (!r) return;
    const copies = copiesVisibles(cam.cx, cam.largeur / 2 / cam.echelle, this.xMin, this.C);
    if (this.vue === "jeu") {
      for (let i = 0; i < r.tours.n; i++) {
        if (r.tours.genre[i] !== TOUR_IMPACT) continue;
        const x = this.tours.pos[2 * i], y = this.tours.pos[2 * i + 1];
        const parKm = cam.echelle / Math.cos(inverser(x, y)[1] * Math.PI / 180);
        for (const d of copies) {
          const [sx, sy] = cam.versEcran(x + d, y);
          CERCLES_IMPACT.forEach(([part, fond, trait], k) => {
            const rp = Math.max(2 + 2 * (2 - k), r.tours.rayonKm[i] * part * parKm);
            ctx.beginPath();
            ctx.arc(sx, sy, rp, 0, 2 * Math.PI);
            ctx.fillStyle = fond;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = trait;
            ctx.stroke();
          });
        }
      }
    }
    if (survol2.genre === "tour" && survol2.i < r.tours.n) {
      const i = survol2.i, x = this.tours.pos[2 * i], y = this.tours.pos[2 * i + 1];
      const lat = inverser(x, y)[1];
      const rayonPx = r.tours.rayonKm[i] / Math.cos(lat * Math.PI / 180) * cam.echelle;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(250, 240, 210, 0.9)";
      const g2 = r.tours.genre[i];
      ctx.fillStyle = g2 === TOUR_AVIONS ? "rgba(120, 170, 255, 0.10)" : g2 === TOUR_DCA ? "rgba(255, 150, 90, 0.14)" : g2 === TOUR_IMPACT ? "rgba(255, 220, 120, 0.18)" : "rgba(90, 200, 220, 0.10)";
      ctx.setLineDash([
        6,
        4
      ]);
      for (const d of copies) {
        const [sx, sy] = cam.versEcran(x + d, y);
        ctx.beginPath();
        ctx.arc(sx, sy, rayonPx, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (cam.echelle < 0.1 || this.vue === "flux") return;
    ctx.font = "600 10px ui-monospace, Menlo, monospace";
    ctx.textBaseline = "middle";
    const g = this.posGroupes;
    for (let i = 0; i < r.groupes.n; i++) {
      const texte2 = formatEffectif(r.groupes.effectif[i]);
      for (const d of copies) {
        const [sx, sy] = cam.versEcran(g[2 * i] + d, g[2 * i + 1]);
        if (sx < -40 || sy < -20 || sx > cam.largeur + 40 || sy > cam.hauteur + 20) continue;
        const l = ctx.measureText(texte2).width;
        ctx.fillStyle = "rgba(15, 20, 25, 0.75)";
        ctx.fillRect(sx + 9, sy - 6, l + 4, 12);
        ctx.fillStyle = "#f6efdc";
        ctx.fillText(texte2, sx + 11, sy);
      }
    }
  }
};
var CERCLES_IMPACT = [
  [
    1,
    "rgba(242, 193, 78, 0.16)",
    "rgba(242, 193, 78, 0.8)"
  ],
  [
    2.6 / 5,
    "rgba(217, 138, 58, 0.28)",
    "rgba(217, 138, 58, 0.9)"
  ],
  [
    1 / 5,
    "rgba(200, 50, 40, 0.45)",
    "rgba(200, 50, 40, 1)"
  ]
];
var LOIN_BILLES = 0.5;
var PRES_BILLES = 2;
var PRES_FORCES = 1;
var PRES_BATIMENTS = 0.6;
function formatEffectif(n) {
  if (n < 1e3) return String(Math.round(n));
  if (n < 1e5) return `${(Math.round(n / 100) / 10).toLocaleString("fr-FR")} k`;
  if (n < 1e6) return `${Math.round(n / 1e3)} k`;
  return `${(Math.round(n / 1e5) / 10).toLocaleString("fr-FR")} M`;
}

// web/src/sim/calendrier.ts
var DEPART_UTC = Date.UTC(2026, 9, 21, 6, 0);
var departUtc = DEPART_UTC;
function fixerDepart(utc) {
  departUtc = Number.isFinite(utc) ? utc : DEPART_UTC;
}
function departDe(date) {
  const d = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [a, m, j] = d.split("-").map(Number);
  const t = Date.UTC(a, m - 1, j, 6, 0);
  return Number.isFinite(t) ? t : DEPART_UTC;
}
function dateDuJeu(heure, depart = departUtc) {
  return new Date(depart + heure * 36e5);
}
var FORMAT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});
function jourEnLettres(heure) {
  return FORMAT.format(dateDuJeu(heure));
}
function heureEnLettres(heure) {
  return `${String(dateDuJeu(Math.floor(heure)).getUTCHours()).padStart(2, "0")} h`;
}

// web/src/sim/horloge.ts
var VITESSES = [
  1,
  2,
  4
];
var MS_PAR_JOUR = 1e4;
var MS_PAR_PAS = MS_PAR_JOUR / 24;

// web/src/interface/panneaux.ts
function echapper(t) {
  return t.replace(/[&<>"]/g, (c2) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[c2]);
}
function jauge(v, max) {
  const p = max > 0 ? Math.max(0, Math.min(1, v / max)) : 0;
  return `<span class="jauge${p < 0.2 ? " bas" : ""}"><i style="width:${(p * 100).toFixed(0)}%"></i></span>`;
}
function barreDeux(a, b) {
  const p = a + b > 0 ? a / (a + b) : 0.5;
  return `<span class="deux-p"><i style="width:${(p * 100).toFixed(0)}%"></i></span>`;
}

// web/src/interface/formats.ts
var ESPACE = "\u202F";
function groupes(entier) {
  return entier.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE);
}
function nombre(v) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  const r = Math.round(Math.abs(v));
  return (v < 0 && r > 0 ? "\u2212" : "") + groupes(String(r));
}
function decimal(v, decimales = 1) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  const [e, d] = Math.abs(v).toFixed(decimales).split(".");
  const signe = v < 0 && Number(`${e}.${d ?? 0}`) > 0 ? "\u2212" : "";
  return signe + groupes(e) + (d ? "," + d : "");
}
function pourcent(fraction, decimales = 1) {
  if (fraction === null || fraction === void 0 || !isFinite(fraction)) return "\u2014";
  return `${decimal(fraction * 100, decimales)}${ESPACE}%`;
}
function tonnes(v) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  if (Math.abs(v) >= 1e6) return `${decimal(v / 1e6, 1)}${ESPACE}millions${ESPACE}de${ESPACE}tonnes`;
  return `${nombre(v)}${ESPACE}t`;
}
function court(v) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  const a = Math.abs(v);
  if (a >= 1e9) return `${decimal(v / 1e9, a >= 1e10 ? 0 : 1)}${ESPACE}G`;
  if (a >= 1e6) return `${decimal(v / 1e6, a >= 1e7 ? 0 : 1)}${ESPACE}M`;
  return nombre(v);
}

// web/src/interface/lancement.ts
var NOMS_VICTOIRE = {
  "carte": "95 % de la carte",
  "continent": "continent conquis",
  "bac-a-sable": "bac \xE0 sable"
};
function choixParDefaut(pays) {
  return {
    pays,
    vitesse: VITESSES[0],
    difficulte: "normal",
    nucleaire: true,
    victoire: "bac-a-sable"
  };
}
function optionsDe(c2) {
  return {
    pays: c2.pays,
    vitesse: c2.vitesse,
    difficulte: c2.difficulte,
    nucleaire: c2.nucleaire,
    victoire: c2.victoire
  };
}
var seg = (nom, valeurs, actif) => `<span class="seg">${valeurs.map(([v, t]) => `<button data-reg="${nom}" data-val="${v}" class="${v === actif ? "actif" : ""}">${t}</button>`).join("")}</span>`;
var ch = (nom, corps) => `<div class="ch"><span class="n">${nom}</span>${corps}</div>`;
function htmlListePays(pays, choisi, filtre) {
  const f = filtre.trim().toLocaleLowerCase("fr");
  const vus = pays.filter((p) => !f || p.nom.toLocaleLowerCase("fr").includes(f));
  if (!vus.length) return `<div class="vide">Aucun pays.</div>`;
  return vus.map((p) => `<div data-pays="${p.id}" class="${p.id === choisi ? "sel" : ""}">${echapper(p.nom)}<span>${p.habitants ? court(p.habitants) : ""}</span></div>`).join("");
}
function htmlLancement(c2, pays, filtre = "") {
  const choisi = pays.find((p) => p.id === c2.pays);
  const resume = choisi ? `${echapper(choisi.nom)}${choisi.capitale ? ` : capitale ${echapper(choisi.capitale)}` : ""}` : "";
  return `<h3>SQUID NATIONS V2 \u2014 NOUVELLE PARTIE</h3><div class="deux"><div class="gauche"><input data-filtre-pays type="text" placeholder="Chercher un pays\u2026" value="${echapper(filtre)}"><div class="liste">${htmlListePays(pays, c2.pays, filtre)}</div><div class="note resume">${resume}</div></div><div class="droite">` + ch("Vitesse au d\xE9part", seg("vitesse", VITESSES.map((v) => [
    String(v),
    v === 1 ? "base" : `\xD7${v}`
  ]), String(c2.vitesse))) + ch("IA des autres pays", seg("difficulte", [
    [
      "facile",
      "facile"
    ],
    [
      "normal",
      "normal"
    ],
    [
      "difficile",
      "difficile"
    ]
  ], c2.difficulte)) + ch("Armes nucl\xE9aires", seg("nucleaire", [
    [
      "1",
      "oui"
    ],
    [
      "0",
      "non"
    ]
  ], c2.nucleaire ? "1" : "0")) + ch("Victoire", seg("victoire", Object.entries(NOMS_VICTOIRE), c2.victoire)) + `<div class="note">Un jour de jeu dure dix secondes \xE0 la vitesse de base ; une ann\xE9e, une heure.</div></div></div><div class="bas"><button data-act="charger">Charger une partie\u2026</button><button class="gros" data-act="jouer">Jouer avec ${echapper(choisi?.nom ?? "\u2026")}</button></div>`;
}
var Lancement = class {
  pays;
  surJouer;
  surCharger;
  choix;
  filtre;
  el;
  constructor(zone2, pays, paysDefaut, surJouer, surCharger) {
    this.pays = pays;
    this.surJouer = surJouer;
    this.surCharger = surCharger;
    this.filtre = "";
    this.choix = choixParDefaut(paysDefaut);
    this.el = document.createElement("div");
    this.el.id = "lancement";
    for (const type of [
      "pointerdown",
      "wheel",
      "dblclick",
      "contextmenu"
    ]) this.el.addEventListener(type, (e) => e.stopPropagation());
    this.el.addEventListener("click", (e) => this.clic(e.target));
    this.el.addEventListener("input", (e) => {
      const i = e.target;
      if (!i.matches("[data-filtre-pays]")) return;
      this.filtre = i.value;
      this.el.querySelector(".liste").innerHTML = htmlListePays(this.pays, this.choix.pays, this.filtre);
    });
    zone2.append(this.el);
    this.afficher();
  }
  afficher() {
    const liste = this.el.querySelector(".liste")?.scrollTop ?? 0;
    this.el.innerHTML = `<div class="fen">${htmlLancement(this.choix, this.pays, this.filtre)}</div>`;
    const l = this.el.querySelector(".liste");
    if (l) l.scrollTop = liste;
  }
  clic(el) {
    const p = el.closest("[data-pays]");
    if (p) {
      this.choix.pays = Number(p.dataset.pays);
      return this.afficher();
    }
    const b = el.closest("[data-reg][data-val]");
    if (b) {
      const c2 = this.choix, v = b.dataset.val;
      switch (b.dataset.reg) {
        case "vitesse":
          c2.vitesse = Number(v);
          break;
        case "difficulte":
          c2.difficulte = v;
          break;
        case "nucleaire":
          c2.nucleaire = v === "1";
          break;
        case "victoire":
          c2.victoire = v;
          break;
      }
      return this.afficher();
    }
    const act = el.closest("[data-act]")?.dataset.act;
    if (act === "jouer") {
      this.fermer();
      this.surJouer(optionsDe(this.choix));
    } else if (act === "charger") this.surCharger();
  }
  fermer() {
    this.el.remove();
  }
};

// web/src/interface/barre-bas.ts
var AXE = 12;
var TEINTES_CAMPS = [
  "#3a78d8",
  "#24a88f",
  "#9a958c",
  "#cf2f2a",
  "#c9a227"
];
function iconeSigne(genre, z = 2, camp = 0) {
  const d = genre === AXE || !BATIMENTS[genre] ? dessinAxe() : dessinBatiment(BATIMENTS[genre], "normal", "loin");
  const svg = svgDessin(d, TEINTES_CAMPS[camp] ?? TEINTES_CAMPS[0], z);
  return `<img class="px" width="${d.grille.w * z}" height="${d.grille.h * z}" alt="" src="data:image/svg+xml,${encodeURIComponent(svg)}">`;
}
var SIGNES = [
  ...BATIMENTS.map((_, g) => iconeSigne(g)),
  iconeSigne(AXE)
];
var RACCOURCIS_DEPART = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  9,
  10,
  11
];
var TOUCHES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0"
];
function articles(cat) {
  const l = cat.batiments.map((b) => ({
    genre: b.genre,
    nom: b.nom,
    argent: b.argent,
    carburant: b.carburant,
    jours: b.jours,
    parKm: false
  }));
  const route = cat.axes.find((a) => a.mode === "route");
  l.push({
    genre: AXE,
    nom: "Route ou rail",
    argent: route.argentKm,
    carburant: 0,
    jours: route.jours,
    parKm: true
  });
  return l;
}
function nomCourt(nom) {
  const m = nom.match(/^Usine d(?:e |')(.*)$/);
  const n = m ? m[1] : nom;
  return n[0].toUpperCase() + n.slice(1);
}
function htmlCases(cat, raccourcis, argent) {
  const a = cat ? articles(cat) : [];
  return raccourcis.map((g, i) => {
    const x = a.find((y) => y.genre === g);
    const touche = TOUCHES[i];
    if (!x) {
      return `<span class="case vide" data-raccourci="${i}" title="Case libre : glisse un b\xE2timent depuis Construire (B)"><span class="num">${touche}</span></span>`;
    }
    const cher = argent < x.argent;
    return `<span class="case${cher ? " cher" : ""}" data-raccourci="${i}" data-genre="${g}" title="${echapper(`${x.nom} : ${court(x.argent)}${x.parKm ? " par km" : ""}, ${x.jours} j (touche ${touche})`)}"><span class="num">${touche}</span><span class="signe">${SIGNES[g]}</span><span class="nom">${echapper(nomCourt(x.nom))}</span><span class="prix">${court(x.argent)}</span></span>`;
  }).join("");
}
var nomVitesse = (v) => v === 1 ? "base" : `\xD7${v}`;
function vitesseVoisine(v, sens) {
  const i = VITESSES.indexOf(v) + sens;
  return VITESSES[Math.max(0, Math.min(VITESSES.length - 1, i))];
}
function htmlDate(heure) {
  const part = dateDuJeu(heure).getTime() % 864e5 / 864e5;
  return `<span id="jour">${jourEnLettres(heure)}</span><span id="heure">${heureEnLettres(heure)}</span><span class="jour-barre"><i style="width:${(part * 100).toFixed(1)}%"></i></span>`;
}
function lireRaccourcis() {
  try {
    const l = JSON.parse(localStorage.getItem("squid-nations-v2.raccourcis") ?? "null");
    if (Array.isArray(l) && l.length === 10 && l.every((g) => Number.isInteger(g) && g >= -1 && g <= AXE)) return l;
  } catch {
  }
  return RACCOURCIS_DEPART.slice();
}
function garderRaccourcis(l) {
  try {
    localStorage.setItem("squid-nations-v2.raccourcis", JSON.stringify(l));
  } catch {
  }
}

// web/src/interface/barre-haut.ts
var NOMS_VUES = {
  jeu: "Jeu",
  flux: "Flux"
};
var SUIVIS = [
  "argent",
  "carburant",
  "munitions",
  "recrues"
];
var Tendances = class {
  parHeure = /* @__PURE__ */ new Map();
  noter(heure, r) {
    if (this.parHeure.has(heure)) return;
    this.parHeure.set(heure, SUIVIS.map((k) => r[k]));
    for (const h of this.parHeure.keys()) if (h < heure - 24 || h > heure) this.parHeure.delete(h);
  }
  /** −1, 0 ou 1 (à 0,5 % près). */
  sens(cle, maintenant) {
    let vieux, hv = Infinity;
    for (const [h, v] of this.parHeure) if (h < hv) hv = h, vieux = v;
    if (!vieux) return 0;
    const a = vieux[SUIVIS.indexOf(cle)];
    const ecart = maintenant - a;
    return Math.abs(ecart) <= Math.max(1, Math.abs(a) * 5e-3) ? 0 : Math.sign(ecart);
  }
  vider() {
    this.parHeure.clear();
  }
};
var FLECHE = [
  "\u2193",
  "\u2192",
  "\u2191"
];
function htmlVues(vue) {
  return Object.keys(NOMS_VUES).map((v) => `<button data-vue="${v}" class="${v === vue ? "actif" : ""}" title="Vue ${NOMS_VUES[v]} (V)">${NOMS_VUES[v]}</button>`).join("");
}
function htmlChiffresHaut(r, t) {
  const l = (cle, nom, valeur, sous = "", titre = "") => {
    const s = r && t ? t.sens(cle, r[cle]) : 0;
    return `<div class="hc" title="${echapper(titre || nom)}"><span class="n">${nom}</span><b>${echapper(valeur)}<i class="tend t${s + 1}">${r ? FLECHE[s + 1] : ""}</i></b>${sous ? `<small>${echapper(sous)}</small>` : ""}</div>`;
  };
  if (!r) return [
    "Argent",
    "Carburant",
    "Munitions",
    "Recrues"
  ].map((n) => `<div class="hc"><span class="n">${n}</span><b>\u2014</b></div>`).join("");
  return l("argent", "Argent", court(r.argent), `+${court(r.gainHeure)} / h`, "Argent au tr\xE9sor (les villes tenues rapportent chaque heure)") + l("carburant", "Carburant", tonnes(r.carburant), `${court(r.prixCarburant)} / t au march\xE9`, "Carburant dans tes d\xE9p\xF4ts") + l("munitions", "Munitions", tonnes(r.munitions), `${court(r.prixMunitions)} / t au march\xE9`, "Munitions dans tes d\xE9p\xF4ts") + l("recrues", "Recrues", nombre(r.recrues), "", "Recrues aux casernes et aux d\xE9p\xF4ts");
}

// web/src/interface/construire.ts
function htmlConstruire(cat, argent) {
  if (!cat) return `<div class="titre">Construire</div><div class="note">Pr\xE9paration de la partie\u2026</div>`;
  const ligne2 = (a) => {
    const cher = argent < a.argent, off = a.genre === 11 && !cat.nucleaire;
    const prix = a.parKm ? cat.axes.map((x) => `${x.nom} ${court(x.argentKm)}`).join(" \xB7 ") + " / km" : `${court(a.argent)}${a.carburant > 0 ? ` \xB7 ${tonnes(a.carburant)}` : ""}`;
    const lieu = a.parKm ? "double le d\xE9bit d'un axe" : cat.batiments[a.genre].lieu;
    return `<div class="art${cher ? " cher" : ""}${off ? " off" : ""}" draggable="${off ? "false" : "true"}" data-article="${a.genre}" title="${echapper(off ? "Nucl\xE9aire d\xE9sactiv\xE9 dans cette partie" : `Glisser vers la barre du bas pour un raccourci`)}"><span class="signe">${SIGNES[a.genre]}</span><span class="nm">${echapper(a.nom)}<small>${echapper(LIEUX[lieu] ?? lieu)}</small></span><span class="px">${prix}<small>${a.parKm ? `${a.jours} j par ${cat.axes[0].kmParDelai} km` : `${nombre(a.jours)} j`}</small></span></div>`;
  };
  return `<div class="titre">Construire <span class="note">B \xB7 glisser vers la barre pour un raccourci</span><button class="fermer" data-fermer-panneau title="Fermer (\xC9chap)">\xD7</button></div><div class="arts">${articles(cat).map(ligne2).join("")}</div>`;
}
var LIEUX = {
  champ: "sur un champ p\xE9trolier",
  reseau: "pr\xE8s d'un grand axe",
  ville: "dans une ville",
  terre: "sur ton territoire",
  port: "dans un port",
  axe: "sur une route",
  "ville-ou-depot": "ville ou pr\xE8s d'un d\xE9p\xF4t"
};
function htmlBullePose(cat, genre, f, argent, mode = "route", km = 0) {
  if (genre === AXE) {
    const a = cat.axes.find((x) => x.mode === mode);
    if (!km) return `<b>${a.nom}</b> : clique le d\xE9part, puis l'arriv\xE9e (${court(a.argentKm)} par km)`;
    const prix = a.argentKm * km;
    return `<b>${a.nom}</b> ${nombre(km)} km : ${court(prix)}, ${Math.max(1, Math.ceil(km / a.kmParDelai)) * a.jours} j` + (prix > argent ? ` <span class="non">\u2014 pas assez d'argent</span>` : "");
  }
  const b = cat.batiments[genre];
  if (!f) return `<b>${echapper(b.nom)}</b> : ${court(b.argent)}, ${nombre(b.jours)} j`;
  if (!f.ok) return `<b>${echapper(b.nom)}</b> <span class="non">${echapper(f.texte)}</span>`;
  return `<b>${echapper(b.nom)}</b>${f.nom && f.nom !== b.nom ? ` (${echapper(f.nom)})` : ""} : <span class="oui">${court(b.argent)}, ${nombre(b.jours)} j</span>` + (b.argent > argent ? ` <span class="non">\u2014 pas assez d'argent</span>` : " \xB7 clic : poser, \u21E7 clic : en poser plusieurs");
}

// web/src/interface/depot.ts
var MIX_VIDE = {
  soldats: 0,
  chars: 0,
  artillerie: 0,
  avions: 0,
  nom: ""
};
var TYPES = [
  [
    "soldats",
    "Soldats"
  ],
  [
    "chars",
    "Chars"
  ],
  [
    "artillerie",
    "Canons"
  ]
];
var PAS_MIX = {
  soldats: 1e3,
  chars: 1,
  artillerie: 1,
  avions: 1
};
function maxMix(f) {
  return {
    soldats: f.presents[0],
    chars: f.presents[1],
    artillerie: f.presents[2],
    avions: f.avions
  };
}
function bornerMix(m, f) {
  const x = maxMix(f), o = {
    ...m
  };
  for (const k of [
    "soldats",
    "chars",
    "artillerie",
    "avions"
  ]) {
    o[k] = Math.max(0, Math.min(x[k], Math.floor(o[k] / PAS_MIX[k]) * PAS_MIX[k]));
  }
  return o;
}
var mixVide = (m) => m.soldats + m.chars + m.artillerie <= 0;
function htmlTableDepot(f) {
  const lignes = TYPES.map(([, nom], t) => `<tr><td>${nom}</td><td>${nombre(f.presents[t])}</td><td>${f.enRoute[t] ? `+${nombre(f.enRoute[t])}` : "\u2014"}</td></tr>`).join("");
  const groupes2 = f.groupes.length ? f.groupes.map((g) => `<button class="lien" data-groupe="${g.id}">${echapper(g.nom)}</button> <span class="note">${echapper(g.ordre)}</span>`).join("<br>") : `<span class="note">aucun</span>`;
  return `<table class="tab"><tr><th></th><th>pr\xE9sents</th><th>en route</th></tr>${lignes}</table><div class="ligne"><span class="n">Carburant</span>${jauge(f.carburant, f.capCarburant)}<b>${tonnes(f.carburant)}</b></div><div class="ligne"><span class="n">Munitions</span>${jauge(f.munitions, f.capMunitions)}<b>${tonnes(f.munitions)}</b></div><div class="ligne"><span class="n">Avions \xE0 port\xE9e</span><b>${nombre(f.avions)}</b>${f.aeroport ? `<span class="note">${echapper(f.aeroport)}</span>` : ""}</div><div class="ligne haut"><span class="n">Groupes ici</span><span>${groupes2}</span></div>`;
}
function htmlMix(f, m) {
  const x = maxMix(f);
  const curseur = (k, nom) => `<div class="cur"><span class="n">${nom}</span><input type="range" data-mix="${k}" min="0" max="${x[k]}" step="${PAS_MIX[k]}" value="${m[k]}"${x[k] ? "" : " disabled"}><b data-val="${k}">${nombre(m[k])}</b><button class="mini" data-tout="${k}" title="Tout">\u21E5</button></div>`;
  return `<div class="sous-titre">Table de mixage</div>` + curseur("soldats", "Soldats") + curseur("chars", "Chars") + curseur("artillerie", "Canons") + curseur("avions", "Avions (couverture)") + `<div class="cur"><span class="n">Nom</span><input type="text" data-mix-nom maxlength="40" placeholder="nom du groupe (facultatif)" value="${echapper(m.nom)}"></div><div class="note">R\xE9serve de ${Math.round(f.reserveHeures / 24)} jours de marche et de combat prise au d\xE9p\xF4t.</div><div class="boutons"><button class="gros" data-act="mix-envoyer"${mixVide(m) ? " disabled" : ""}>\u279C Envoyer\u2026 <small>(clic sur l'objectif)</small></button><button data-act="mix-former"${mixVide(m) ? " disabled" : ""}>Former sur place</button></div>`;
}
function htmlDepot(f, m, nom) {
  return `<div class="titre"><span class="signe">\u25A3</span> ${echapper(nom)}<button class="fermer" data-fermer-panneau title="Fermer (\xC9chap)">\xD7</button></div>` + (f.actif ? "" : `<div class="non">D\xE9p\xF4t d\xE9truit.</div>`) + `<div class="dp-table">${htmlTableDepot(f)}</div><div class="dp-mix">${htmlMix(f, m)}</div>`;
}

// web/src/interface/objets.ts
var NOMS_CAMPS = [
  "toi",
  "alli\xE9",
  "neutre",
  "ennemi",
  "chantier"
];
var TYPES2 = [
  "Soldats",
  "Chars",
  "Canons"
];
var fermer = `<button class="fermer" data-fermer-panneau title="Fermer (\xC9chap)">\xD7</button>`;
function htmlGroupe(f, nomPays2) {
  const moi = f.camp === CAMP_JOUEUR;
  const compo3 = TYPES2.map((n, t) => f.n[t] ? `<tr><td>${n}</td><td>${nombre(f.n[t])}</td></tr>` : "").join("") + (f.avions ? `<tr><td>Avions (couverture)</td><td>${nombre(f.avions)}</td></tr>` : "");
  let etat2 = echapper(f.ordre);
  if (f.combat >= 0) etat2 += ` \xB7 <span class="non">au combat</span>`;
  if (f.aSec) etat2 += ` \xB7 <span class="non">\xE0 sec de ${f.aSec}</span>`;
  if (f.kmRestants > 1 && f.ordre === "en marche") etat2 += ` \xB7 ${nombre(f.kmRestants)} km \xE0 ${f.vitesse} km/h`;
  if (f.surPlace >= 24) etat2 += ` \xB7 retranch\xE9 depuis ${Math.floor(f.surPlace / 24)} j`;
  const ordres = moi ? `<div class="boutons"><button data-act="groupe-envoyer" title="Puis clic sur l'objectif">\u279C Envoyer\u2026</button><button data-ordre="arreter">\u25A0 S'arr\xEAter</button><button data-ordre="retirer">\u21A9 Se retirer</button></div>` + (f.voisins.length ? `<div class="boutons">${f.voisins.map((v) => `<button data-fusion="${v.id}">Fusionner avec ${echapper(v.nom)}</button>`).join("")}</div>` : "") + (f.port ? `<div class="boutons"><button data-act="groupe-debarquer" title="Puis clic pr\xE8s d'un port ennemi">\u2693 Embarquer et d\xE9barquer\u2026</button></div>` : "") : "";
  return `<div class="titre"><span class="signe camp${f.camp}">\u25C6</span> ${echapper(f.nom)} <span class="note">${echapper(nomPays2)} \xB7 ${NOMS_CAMPS[f.camp]}</span>${fermer}</div><div class="ligne">${etat2}</div><table class="tab">${compo3}</table>` + (moi ? `<div class="ligne"><span class="n">Carburant</span>${jauge(f.carburant, f.carburantMax)}<b>${tonnes(f.carburant)}</b></div><div class="ligne"><span class="n">Munitions</span>${jauge(f.munitions, f.munitionsMax)}<b>${tonnes(f.munitions)}</b></div>` : "") + ordres;
}
function htmlUsine(f, cat) {
  const u = f.usine, x = cat.unites[u.type];
  const unite = u.type === 0 ? "millier de soldats" : x.nom.replace(/s$/, "");
  const en = u.commande > 0 ? `${nombre(u.commande)} en commande \xB7 ${Math.round(u.avancement * 100)} %${u.attente ? ` \xB7 <span class="non">attend : ${echapper(u.attente)}</span>` : ""}` : `<span class="note">aucune commande</span>`;
  return `<div class="sous-titre">Production : ${x.nom}</div><div class="ligne">${en}</div><div class="note">${court(x.prix)}${x.carburant ? ` + ${tonnes(x.carburant)}` : ""}${x.recrues ? ` + ${nombre(x.recrues)} recrues` : ""} et ${nombre(u.joursUnite)} j par ${unite}</div><div class="boutons">${[
    1,
    5,
    10
  ].map((n) => `<button data-produire="${n}">+${n}</button>`).join("")}<button data-produire="0">Arr\xEAter</button></div>`;
}
function htmlSite(f, cat, nom, nomPays2) {
  const moi = f.camp === CAMP_JOUEUR;
  const b = cat?.batiments[f.genre];
  const stocks = [
    "Recrues",
    "Brut",
    "Carburant",
    "Munitions"
  ].map((n, p) => f.capacite[p] > 0 ? `<div class="ligne"><span class="n">${n}</span>${jauge(f.stock[p], f.capacite[p])}<b>${p ? tonnes(f.stock[p]) : nombre(f.stock[p])}</b></div>` : "").join("");
  let corps = (f.actif ? "" : `<div class="non">D\xE9truit ou en chantier.</div>`) + stocks;
  if (moi && cat && f.usine) corps += htmlUsine(f, cat);
  if (f.aeroport) {
    corps += `<div class="ligne"><span class="n">Avions</span><b>${nombre(f.aeroport.avions)}</b> \xB7 ${f.aeroport.patrouille ? `en patrouille (${cat?.rayons.avions ?? "?"} km)` : "au repos"}</div>` + (moi ? `<div class="boutons"><button data-aviation="patrouille"${f.aeroport.patrouille ? " disabled" : ""}>Patrouille</button><button data-aviation="repos"${f.aeroport.patrouille ? "" : " disabled"}>Repos</button></div>` : "");
  }
  if (f.silo && cat) {
    const bombe = f.silo.bombe >= 0 ? cat.bombes[f.silo.bombe] : null;
    corps += `<div class="ligne"><span class="n">Bombe</span><b>${bombe ? `${echapper(bombe.nom)}` : f.silo.enFabrication > 0 ? `en fabrication, ${Math.ceil(f.silo.enFabrication / 24)} j` : "aucune"}</b></div>`;
    if (moi && bombe) corps += `<div class="boutons"><button class="gros rouge" data-act="tirer" data-silo="${f.site}">\u2622 Tirer\u2026 <small>(clic sur la cible)</small></button></div>`;
    else if (moi && f.silo.enFabrication <= 0) {
      corps += `<div class="boutons">${cat.bombes.map((x, i) => `<button data-armer="${i}" title="${echapper(`${x.nom} : ${court(x.prix)}`)}">${x.kt >= 1e3 ? `${x.kt / 1e3} Mt` : `${x.kt} kt`}</button>`).join("")}</div>`;
    }
  }
  if (moi && b?.doublable && f.niveau === 1 && f.actif) {
    corps += `<div class="boutons"><button data-act="doubler">Doubler : ${court(b.argent)}, ${nombre(b.jours)} j</button></div>`;
  } else if (f.niveau === 2) corps += `<div class="note">Doubl\xE9.</div>`;
  return `<div class="titre"><span class="signe camp${f.camp}">${iconeSigne(f.genre, 2, f.camp)}</span> ${echapper(nom)} <span class="note">${echapper(nomPays2)} \xB7 ${NOMS_CAMPS[f.camp]}</span>${fermer}</div>${corps}`;
}
function etatPays(d, p) {
  if (!d) return "neutre";
  if (d.guerres.some((g) => g.pays === p)) return "en guerre";
  if (d.cessez.some((c2) => c2.pays === p)) return "cessez-le-feu";
  return d.allies.includes(p) ? "alli\xE9" : "neutre";
}
function htmlPays(p, nom, d, camp) {
  const e = etatPays(d, p), g = d?.guerres.find((x) => x.pays === p);
  const info = g ? `<div class="ligne">Villes prises : ${g.prises[0]} par toi, ${g.prises[1]} par eux \xB7 front fig\xE9 depuis ${g.figeJours} j${g.defense ? " \xB7 guerre de d\xE9fense" : ""}</div>` : "";
  const guerre = e !== "en guerre", cessez = e === "en guerre", paix = e === "en guerre" || e === "cessez-le-feu";
  return `<div class="titre"><span class="signe camp${camp}">\u2691</span> ${echapper(nom)} <span class="note">${e}</span>${fermer}</div>${info}<div class="boutons"><button class="rouge" data-decret="guerre" data-pays="${p}"${guerre ? "" : " disabled"}>\u2694 D\xE9clarer la guerre</button><button data-decret="cessez-le-feu" data-pays="${p}"${cessez ? "" : " disabled"}>Cessez-le-feu</button><button data-decret="paix" data-pays="${p}"${paix ? "" : " disabled"}>\u2605 Paix</button></div>` + (camp === CAMP_ALLIE && guerre ? `<div class="note">Attaquer un alli\xE9 : ses autres alli\xE9s te d\xE9clarent la guerre le jour m\xEAme.</div>` : "") + (camp === CAMP_ENNEMI ? `<div class="note">Envoie un groupe sur une de ses villes depuis un d\xE9p\xF4t.</div>` : "");
}

// web/src/interface/armee.ts
var fermer2 = `<button class="fermer" data-fermer-panneau title="Fermer (A ou \xC9chap)">\xD7</button>`;
var voir = (x, y) => `<button class="mini" data-voir="${x.toFixed(1)},${y.toFixed(1)}" title="Voir sur la carte">\u25CE</button>`;
var NOMS_TYPES = [
  "Soldats",
  "Chars",
  "Canons",
  "Avions",
  "Navires"
];
var ACHATS = [
  1e4,
  1e5
];
function htmlArmee(f, cat, r, nomLieu) {
  const totaux = f.totaux.map((n, t) => `<div class="hc"><span class="n">${NOMS_TYPES[t]}</span><b>${nombre(n)}</b></div>`).join("");
  const depots = f.depots.map((d) => `<tr><td>${voir(d.x, d.y)} <button class="lien" data-depot="${d.site}">${echapper(nomLieu(d.x, d.y, d.nom))}</button></td>` + d.presents.map((n, t) => `<td>${nombre(n)}${d.enRoute[t] ? ` <small>+${nombre(d.enRoute[t])}</small>` : ""}</td>`).join("") + `<td>${tonnes(d.carburant)}</td><td>${tonnes(d.munitions)}</td><td>${d.groupes || ""}</td></tr>`).join("");
  const groupes2 = f.groupes.length ? f.groupes.map((g) => `<tr><td>${voir(g.x, g.y)} <button class="lien" data-groupe="${g.id}">${echapper(g.nom)}</button></td>` + g.n.map((n) => `<td>${n ? nombre(n) : ""}</td>`).join("") + `<td>${g.avions || ""}</td><td>${echapper(g.ordre)}${g.combat ? ` \xB7 <span class="non">combat</span>` : ""}${g.aSec ? ` \xB7 <span class="non">\xE0 sec</span>` : ""}</td><td>${jauge(g.reserve, 1)}</td></tr>`).join("") : `<tr><td colspan="7" class="note">Aucun groupe : compose-en un dans un d\xE9p\xF4t (clic sur \u25A3).</td></tr>`;
  const aeroports = f.aeroports.map((a) => `<tr><td>${voir(a.x, a.y)} ${echapper(a.nom)}</td><td>${nombre(a.avions)}</td><td>${a.patrouille ? "patrouille" : "repos"}</td><td>${tonnes(a.carburant)}</td><td>${tonnes(a.munitions)}</td><td><button class="mini" data-aviation="${a.patrouille ? "repos" : "patrouille"}" data-site="${a.site}">${a.patrouille ? "Repos" : "Patrouille"}</button></td></tr>`).join("");
  const ports = f.ports.map((p) => `<tr><td>${voir(p.x, p.y)} ${echapper(p.nom)}</td><td>${nombre(p.navires)} navires au port</td><td><button class="mini" data-flotte="${p.port}" data-navires="${p.navires}" title="Puis clic sur la zone de mer \xE0 tenir">Prendre la mer\u2026</button></td></tr>`).join("") + f.flottes.map((x) => `<tr><td>${voir(x.x, x.y)} Flotte ${x.id}</td><td>${nombre(x.navires)} navires \xB7 ${echapper(x.ordre)}${x.groupe >= 0 ? " \xB7 groupe \xE0 bord" : ""}</td><td><button class="mini" data-ordre-flotte="zone" data-flotte-id="${x.id}">Zone\u2026</button><button class="mini" data-ordre-flotte="rentrer" data-flotte-id="${x.id}">Rentrer</button></td></tr>`).join("");
  const usines = f.usines.map((u) => `<tr><td>${voir(u.x, u.y)} ${echapper(nomLieu(u.x, u.y, u.nom))}${u.double ? " \xD72" : ""}</td><td>${NOMS_TYPES[u.type]}</td><td>${u.commande ? `${nombre(u.commande)} \xB7 ${Math.round(u.avancement * 100)} %` : ""}${u.attente && u.commande ? ` <span class="non">${echapper(u.attente)}</span>` : ""}</td><td>${[
    1,
    5
  ].map((n) => `<button class="mini" data-produire="${n}" data-site="${u.site}">+${n}</button>`).join("")}<button class="mini" data-produire="0" data-site="${u.site}">\u25A0</button></td></tr>`).join("");
  const production = cat ? cat.unites.map((u, t) => `<div class="ligne"><span class="n">${NOMS_TYPES[t]}</span><span class="note">${court(u.prix)} / ${t === 0 ? "millier" : "unit\xE9"}, ${nombre(u.jours)} j</span>${[
    1,
    10
  ].map((n) => `<button class="mini" data-produire-type="${u.id}" data-n="${n}">+${n}</button>`).join("")}</div>`).join("") : "";
  const marche = r ? [
    [
      "carburant",
      2,
      r.prixCarburant
    ],
    [
      "munitions",
      3,
      r.prixMunitions
    ]
  ].map(([nom, p, prix]) => `<div class="ligne"><span class="n">${nom}</span><span class="note">${court(prix)} / t</span>` + ACHATS.map((t) => `<button class="mini" data-acheter="${p}" data-tonnes="${t}" title="${court(prix * t)}, livr\xE9 par la mer au grand port">+${tonnes(t)}</button>`).join("") + `</div>`).join("") : "";
  return `<div class="titre">Arm\xE9e${fermer2}</div><div class="totaux">${totaux}</div><div class="colonnes"><div><div class="sous-titre">D\xE9p\xF4ts (${f.depots.length})</div><div class="defile"><table class="tab large"><tr><th></th><th>soldats</th><th>chars</th><th>canons</th><th>carburant</th><th>munitions</th><th>groupes</th></tr>${depots}</table></div><div class="sous-titre">Groupes (${f.groupes.length})</div><div class="defile"><table class="tab large"><tr><th></th><th>soldats</th><th>chars</th><th>canons</th><th>avions</th><th>ordre</th><th>r\xE9serve</th></tr>${groupes2}</table></div></div><div><div class="sous-titre">A\xE9roports (${f.aeroports.length})</div><div class="defile court"><table class="tab large"><tr><th></th><th>avions</th><th></th><th>carburant</th><th>munitions</th><th></th></tr>${aeroports}</table></div><div class="sous-titre">Ports et flottes</div><div class="defile court"><table class="tab large">${ports || `<tr><td class="note">Aucun navire.</td></tr>`}</table></div><div class="sous-titre">Usines (${f.usines.length})</div><div class="defile court"><table class="tab large">${usines}</table></div><div class="deux-col"><div><div class="sous-titre">Produire</div>${production}</div><div><div class="sous-titre">March\xE9 mondial</div>${marche}</div></div></div></div>`;
}

// web/src/interface/guerre.ts
var fermer3 = `<button class="fermer" data-fermer-panneau title="Fermer (\xC9chap)">\xD7</button>`;
var voir2 = (x, y) => `<button class="mini" data-voir="${x.toFixed(1)},${y.toFixed(1)}" title="Voir sur la carte">\u25CE</button>`;
function htmlCombat(c2, nomPays2) {
  const g = c2.joueur === 1 ? 1 : 0, d = 1 - g;
  const camp = (k) => c2.pays[k].map(nomPays2).join(", ");
  const eff = (k) => c2.effectifs[k].map((n, t) => n ? `${nombre(n)} ${[
    "sold.",
    "chars",
    "can."
  ][t]}` : "").filter(Boolean).join(" ") || "\u2014";
  const issue = c2.enCours ? "" : c2.issue === 2 ? "s\xE9par\xE9s" : c2.issue === c2.joueur ? "gagn\xE9" : c2.joueur >= 0 ? "perdu" : `${camp(c2.issue)} l'emporte`;
  return `<div class="combat${c2.joueur >= 0 ? " a-moi" : ""}"><div class="ct">${voir2(c2.x, c2.y)} <b>\u2694 ${echapper(c2.terrain)}</b> <span class="note">${echapper(c2.mode)}</span>${issue ? ` <span class="${issue === "gagn\xE9" ? "oui" : issue === "perdu" ? "non" : ""}">${issue}</span>` : ""}</div><div class="cc"><span class="cg">${echapper(camp(g))}</span>${barreDeux(c2.puissance[g], c2.puissance[d])}<span class="cd">${echapper(camp(d))}</span></div>` + (c2.enCours ? `<div class="note">${eff(g)} \xB7 rupture ${pourcent(c2.progres[g], 0)} | ${eff(d)} \xB7 rupture ${pourcent(c2.progres[d], 0)}</div>` : `<div class="note">pertes : ${nombre(c2.pertes[g].reduce((a, b) => a + b, 0))} | ${nombre(c2.pertes[d].reduce((a, b) => a + b, 0))}</div>`) + `</div>`;
}
function htmlCombats(g, nomPays2) {
  if (!g) return "";
  const enCours = g.enCours.slice(0, 8).map((c2) => htmlCombat(c2, nomPays2)).join("");
  return `<div class="titre">Combats en cours <span class="note">${g.enCours.filter((c2) => c2.joueur >= 0).length} \xE0 toi \xB7 ${g.total} dans le monde</span>${fermer3}</div>` + (enCours || `<div class="note">Aucun combat en cours.</div>`) + (g.termines.length ? `<div class="sous-titre">Termin\xE9s</div>${g.termines.slice(-3).reverse().map((c2) => htmlCombat(c2, nomPays2)).join("")}` : "");
}
var PARTIES = [
  [
    "situation",
    "Situation"
  ],
  [
    "decrets",
    "D\xE9crets"
  ],
  [
    "bombe",
    "Bombe"
  ],
  [
    "cibles",
    "Cibles"
  ]
];
function htmlGuerre(partie, d, g, cat, nomPays2, paysListe, paysDecret, pont) {
  const onglets = PARTIES.map(([k, n]) => `<button data-partie="${k}" class="${k === partie ? "actif" : ""}">${n}</button>`).join("");
  let corps = "";
  if (partie === "situation") {
    const vic = d ? `${NOMS_VICTOIRE[d.victoire] ?? d.victoire}${d.victoire === "bac-a-sable" ? "" : ` : ${pourcent(d.progres, 0)}${d.victoire === "continent" ? ` (${echapper(d.continent)})` : ""}`}` : "\u2014";
    const guerres = d?.guerres.length ? d.guerres.map((x) => `<div class="ligne"><b>${echapper(nomPays2(x.pays))}</b><span class="note">villes prises ${x.prises[0]}, perdues ${x.prises[1]} \xB7 fig\xE9 ${x.figeJours} j${x.defense ? " \xB7 d\xE9fense" : ""}</span><button class="mini" data-decret="cessez-le-feu" data-pays="${x.pays}">Cessez</button><button class="mini" data-decret="paix" data-pays="${x.pays}">Paix</button></div>`).join("") : `<div class="note">Tu n'es en guerre avec personne.</div>`;
    const cessez = d?.cessez.map((x) => `<div class="ligne">${echapper(nomPays2(x.pays))} <span class="note">cessez-le-feu</span><button class="mini" data-decret="paix" data-pays="${x.pays}">Paix</button></div>`).join("") ?? "";
    const tombes = g?.pays.filter((p) => p.tombe).map((p) => nomPays2(p.pays)) ?? [];
    corps = `<div class="ligne"><span class="n">Victoire</span><b>${vic}</b></div><div class="sous-titre">Tes guerres</div>${guerres}${cessez}<div class="sous-titre">Tes alli\xE9s (${d?.allies.length ?? 0})</div><div class="note">${echapper((d?.allies ?? []).map(nomPays2).join(", ") || "aucun")}</div><div class="sous-titre">Le monde</div><div class="ligne">${d?.nGuerres ?? 0} guerres \xB7 ${g?.total ?? 0} combats \xB7 ${nombre(g?.tues ?? 0)} tu\xE9s chez toi${g?.forces ? ` \xB7 ${nombre(g.forces.avionsPerdus)} avions et ${nombre(g.forces.naviresPerdus)} navires perdus` : ""}</div>` + (d?.monde.length ? `<div class="note">${d.monde.slice(0, 12).map(([a, b]) => `${echapper(nomPays2(a))} \u2013 ${echapper(nomPays2(b))}`).join(" \xB7 ")}</div>` : "") + (tombes.length ? `<div class="note">Tomb\xE9s : ${echapper(tombes.join(", "))}</div>` : "") + (g?.termines.length ? `<div class="sous-titre">Combats termin\xE9s</div>${g.termines.slice().reverse().slice(0, 6).map((c2) => htmlCombat(c2, nomPays2)).join("")}` : "");
  } else if (partie === "decrets") {
    const options = paysListe.map((p) => `<option value="${p.id}"${p.id === paysDecret ? " selected" : ""}>${echapper(p.nom)}</option>`).join("");
    corps = `<div class="note">Les m\xEAmes d\xE9crets que les autres pays. Une proposition de cessez-le-feu ou de paix est accept\xE9e ou refus\xE9e le jour m\xEAme.</div><div class="ligne"><select data-decret-pays>${options}</select></div><div class="boutons"><button class="rouge" data-decret="guerre" data-pays="${paysDecret}">\u2694 Guerre</button><button data-decret="cessez-le-feu" data-pays="${paysDecret}">Cessez-le-feu</button><button data-decret="paix" data-pays="${paysDecret}">\u2605 Paix</button></div>` + (d?.propositions.length ? `<div class="sous-titre">Propositions re\xE7ues</div>${d.propositions.map((p) => `<div class="ligne">${echapper(nomPays2(p.pays))} propose ${p.decret === "paix" ? "la paix" : "un cessez-le-feu"}<button class="mini oui" data-decret="${p.decret}" data-pays="${p.pays}">Accepter</button><button class="mini non" data-decret="refuser" data-pays="${p.pays}">Refuser</button></div>`).join("")}` : "");
  } else if (partie === "bombe") {
    const n = g?.forces?.nucleaire;
    if (!cat?.nucleaire || !n?.autorise) corps = `<div class="note">Le nucl\xE9aire est d\xE9sactiv\xE9 dans cette partie.</div>`;
    else {
      const silos = n.silos.length ? n.silos.map((s) => `<div class="ligne">${voir2(s.x, s.y)} Silo ${s.site} : <b>${s.bombe >= 0 ? echapper(cat.bombes[s.bombe].nom) : s.enFabrication > 0 ? `en fabrication, ${Math.ceil(s.enFabrication / 24)} j` : "vide"}</b>` + (s.bombe >= 0 ? `<button class="mini rouge" data-act="tirer" data-silo="${s.site}">\u2622 Tirer\u2026</button>` : "") + `</div>` + (s.bombe < 0 && s.enFabrication <= 0 ? `<div class="boutons">${cat.bombes.map((b, i) => `<button class="mini" data-armer="${i}" data-silo="${s.site}" title="${echapper(`${b.nom} : ${court(b.prix)}`)}">${b.kt >= 1e3 ? `${b.kt / 1e3} Mt` : `${b.kt} kt`}</button>`).join("")}</div>` : "")).join("") : `<div class="note">Aucun silo : construis-en un (\u2622 dans Construire).</div>`;
      const vols = n.vols.map((v) => `<div class="ligne non">${echapper(nomPays2(v.tireur))} \u2192 ${echapper(v.cible >= 0 ? nomPays2(v.cible) : "?")} : ${v.kt} kt, impact \xE0 l'heure ${v.arrivee}</div>`).join("");
      const impacts = n.impacts.slice().reverse().slice(0, 5).map((i) => `<div class="ligne">${voir2(i.x, i.y)} ${i.kt >= 1e3 ? `${i.kt / 1e3} Mt` : `${i.kt} kt`} sur ${echapper(i.cible >= 0 ? nomPays2(i.cible) : "?")} : ${nombre(i.tues)} tu\xE9s${i.riposte ? " (riposte)" : ""}</div>`).join("");
      corps = `<div class="note">Un tir sur un pays en guerre avec toi ; s'il a un silo arm\xE9, il riposte aussit\xF4t sur ta plus grande ville.</div><div class="sous-titre">Tes silos</div>${silos}` + (vols ? `<div class="sous-titre">En vol</div>${vols}` : "") + (impacts ? `<div class="sous-titre">Derniers impacts</div>${impacts}` : "") + `<div class="ligne">${nombre(n.tues)} tu\xE9s chez toi par le nucl\xE9aire</div>`;
    }
  } else {
    corps = `<div class="note">Un pont d\xE9truit coupe la route : les r\xE9serves de l'autre se vident. Il faut des canons \xE0 port\xE9e (artillerie) ou des avions en patrouille.</div><div class="boutons"><button data-act="choisir-pont">\u2316 Choisir un pont sur la carte\u2026</button></div>` + (pont ? `<div class="ligne"><b>${echapper(pont.nom)}</b> ${pont.detruit ? `<span class="non">d\xE9truit</span>` : ""}</div><div class="boutons"><button data-pont="detruire" data-i="${pont.i}"${pont.detruit ? " disabled" : ""}>D\xE9truire (canons)</button><button data-pont="bombarder" data-i="${pont.i}"${pont.detruit ? " disabled" : ""}>Bombarder (avions)</button><button data-pont="reparer" data-i="${pont.i}"${pont.detruit ? "" : " disabled"}>R\xE9parer</button></div>` : "");
  }
  return `<div class="titre">Guerre ${fermer3}</div><div class="onglets">${onglets}</div><div class="corps">${corps}</div>`;
}
function htmlFin(f) {
  return `<div class="fen ${f.issue}"><h3>${f.issue === "victoire" ? "VICTOIRE" : "D\xC9FAITE"}</h3><p>${echapper(f.texte)}</p><div class="bas"><button data-act="fin-regarder">Continuer \xE0 regarder</button><button class="gros" data-act="fin-nouvelle">Nouvelle partie</button></div></div>`;
}

// web/src/interface/notifications.ts
var VIE_NOTIF_MS = 6e4;
var OUVERTES = 2;
var LIGNES_MAX = 5;
var URGENCE = {
  attaque: 4,
  paix: 3,
  sec: 3,
  ville: 2,
  allie: 1,
  info: 0
};
var SIGNE = {
  attaque: "\u2694",
  paix: "\u2605",
  sec: "\u26A0",
  ville: "\u2691",
  allie: "\u2709",
  info: "\xB7"
};
function aMontrer(l, maintenant) {
  return l.filter((n) => n.attend || maintenant - (n.arrivee ?? maintenant) < VIE_NOTIF_MS).sort((a, b) => URGENCE[b.genre] - URGENCE[a.genre] || (b.arrivee ?? 0) - (a.arrivee ?? 0));
}
function htmlFil(l, ouverte) {
  const ouvertes = new Set(l.slice(0, OUVERTES).map((n) => n.id));
  if (ouverte) ouvertes.add(ouverte);
  return l.slice(0, OUVERTES + LIGNES_MAX).map((n) => {
    if (!ouvertes.has(n.id)) {
      return `<button class="notif-ligne ${n.genre}" data-ouvrir="${echapper(n.id)}"><span class="signe">${SIGNE[n.genre]}</span><span class="t">${echapper(n.titre)}</span></button>`;
    }
    const boutons = n.boutons.map((b) => `<button data-action="${echapper(b.action)}" data-notif="${echapper(n.id)}" class="${b.genre ?? ""}">${echapper(b.texte)}</button>`).join("");
    return `<div class="notif ${n.genre}"><div class="nt"><span class="signe">${SIGNE[n.genre]}</span><b>${echapper(n.titre)}</b><button class="fermer" data-fermer="${echapper(n.id)}" title="Fermer">\xD7</button></div>` + (n.texte ? `<div class="nx">${echapper(n.texte)}</div>` : "") + (boutons ? `<div class="boutons">${boutons}</div>` : "") + `</div>`;
  }).join("");
}
var Fil = class {
  el;
  surAction;
  notifs;
  ouverte;
  constructor(el, surAction) {
    this.el = el;
    this.surAction = surAction;
    this.notifs = [];
    this.ouverte = null;
    el.addEventListener("click", (e) => {
      const t = e.target;
      const o = t.closest("[data-ouvrir]"), f = t.closest("[data-fermer]");
      const a = t.closest("[data-action]");
      if (o) this.ouverte = o.dataset.ouvrir;
      else if (f) this.retirer(f.dataset.fermer);
      else if (a) {
        const n = this.notifs.find((x) => x.id === a.dataset.notif);
        if (n) this.surAction(n, a.dataset.action);
      }
      this.afficher();
    });
    for (const type of [
      "pointerdown",
      "wheel",
      "dblclick",
      "contextmenu"
    ]) el.addEventListener(type, (e) => e.stopPropagation());
  }
  ajouter(n) {
    const meme = n.attend ? void 0 : this.notifs.find((x) => !x.attend && x.base === n.titre && x.texte === n.texte && x.genre === n.genre);
    const fois = (meme?.fois ?? 0) + 1;
    this.notifs = this.notifs.filter((x) => x.id !== n.id && x !== meme);
    if (this.ouverte === meme?.id) this.ouverte = null;
    this.notifs.push({
      ...n,
      base: n.titre,
      fois,
      titre: fois > 1 ? `${n.titre} (\xD7${fois})` : n.titre,
      arrivee: performance.now()
    });
    this.afficher();
  }
  /** Identifiants des notifications présentes. */
  ids() {
    return this.notifs.map((n) => n.id);
  }
  retirer(id) {
    this.notifs = this.notifs.filter((x) => x.id !== id);
    if (this.ouverte === id) this.ouverte = null;
  }
  /** À appeler de temps en temps : efface les notifications périmées. */
  afficher() {
    this.notifs = aMontrer(this.notifs, performance.now());
    this.el.innerHTML = htmlFil(this.notifs, this.ouverte);
  }
};
function genreAlerte(a) {
  const t = a.texte;
  if (a.module === "groupes") return /à sec/.test(t) ? "sec" : "ville";
  if (a.module === "territoire") return "ville";
  if (a.module === "batiments") return "info";
  if (a.module === "diplomatie") return /paix|cessez/i.test(t) ? "paix" : /Victoire|Défaite|tombé/.test(t) ? "ville" : "allie";
  if (a.module === "combat") return /gagné|reconstruit/.test(t) ? "info" : "attaque";
  return "attaque";
}
function couper(texte2) {
  const i = texte2.search(/[.:;](\s|$)/);
  return i > 0 && i < 90 ? [
    texte2.slice(0, i + 1).replace(/[:;]$/, ""),
    texte2.slice(i + 1).trim()
  ] : [
    texte2,
    ""
  ];
}
var nAlertes = 0;
function notifDeAlerte(a) {
  const [titre, texte2] = couper(a.texte);
  const lieu = Number.isFinite(a.x);
  return {
    id: `a${++nAlertes}`,
    genre: genreAlerte(a),
    titre,
    texte: texte2,
    x: a.x,
    y: a.y,
    boutons: lieu ? [
      {
        texte: "Voir",
        action: "voir"
      }
    ] : [],
    attend: false
  };
}
function notifsPropositions(d, nomPays2) {
  return d.propositions.map((p) => ({
    id: `prop:${p.pays}:${p.decret}:${p.heure}`,
    genre: "paix",
    titre: `${nomPays2(p.pays)} propose ${p.decret === "paix" ? "la paix" : "un cessez-le-feu"}`,
    texte: "",
    x: NaN,
    y: NaN,
    attend: true,
    boutons: [
      {
        texte: "Accepter",
        action: `decret:${p.decret}:${p.pays}`,
        genre: "oui"
      },
      {
        texte: "Refuser",
        action: `decret:refuser:${p.pays}`,
        genre: "non"
      }
    ]
  }));
}

// web/src/interface/clic-droit.ts
function actionsClicDroit(l, c2) {
  const a = [];
  const envoi = c2.groupe ?? c2.mix;
  a.push({
    cle: "envoyer",
    signe: "\u279C",
    nom: envoi ? `Envoyer ici : ${envoi}` : "Envoyer ici",
    off: envoi ? null : "Choisis d'abord un groupe, ou ouvre un d\xE9p\xF4t"
  });
  const chezMoi = !!l && l.camp === CAMP_JOUEUR;
  a.push({
    cle: "construire",
    signe: "\u25A3",
    nom: "Construire ici",
    off: chezMoi ? null : "Pas sur ton territoire"
  });
  if (l && l.pays >= 0 && l.camp !== CAMP_JOUEUR) {
    if (l.camp === CAMP_ENNEMI || c2.enGuerre) a.push({
      cle: "paix",
      signe: "\u2605",
      nom: "Proposer la paix",
      off: null
    });
    else if (l.camp === CAMP_NEUTRE || l.camp === CAMP_ALLIE) a.push({
      cle: "guerre",
      signe: "\u2694",
      nom: "D\xE9clarer la guerre",
      off: null
    });
    if (c2.nucleaire) {
      a.push({
        cle: "bombe",
        signe: "\u2622",
        nom: "Bombe ici",
        off: l.bombe < 0 ? "Aucun silo arm\xE9" : c2.enGuerre ? null : "Pas en guerre avec ce pays"
      });
    }
  }
  if (l?.pont && !l.pont.detruit) a.push({
    cle: "pont",
    signe: "\u2317",
    nom: `Bombarder le ${l.pont.nom}`,
    off: null
  });
  return a;
}
function htmlRangee(titre, detail, actions) {
  return `<div class="rg-titre">${echapper(titre)} <span>${echapper(detail)}</span></div><div class="rg-boutons">` + actions.map((a) => `<button data-clic-droit="${a.cle}" class="${a.off ? "off" : ""}">${a.signe}<span class="bulle">${echapper(a.off ?? a.nom)}</span></button>`).join("") + `</div>`;
}
var ClicDroit = class {
  surAction;
  el;
  x;
  y;
  lieu;
  constructor(zone2, surAction) {
    this.surAction = surAction;
    this.x = 0;
    this.y = 0;
    this.lieu = null;
    this.el = document.createElement("div");
    this.el.id = "rangee";
    this.el.className = "panneau";
    this.el.hidden = true;
    for (const type of [
      "pointerdown",
      "wheel",
      "dblclick",
      "contextmenu"
    ]) this.el.addEventListener(type, (e) => e.stopPropagation());
    this.el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-clic-droit]");
      if (!b || b.classList.contains("off")) return;
      this.fermer();
      this.surAction(b.dataset.clicDroit, this.x, this.y, this.lieu);
    });
    zone2.append(this.el);
  }
  /** `px, py` : pixels dans la zone ; `x, y` : km de carte. */
  ouvrir(px, py, x, y, titre, detail, actions, l) {
    this.x = x, this.y = y, this.lieu = l;
    this.el.innerHTML = htmlRangee(titre, detail, actions);
    this.el.style.left = `${px + 6}px`;
    this.el.style.top = `${py + 6}px`;
    this.el.hidden = false;
  }
  fermer() {
    this.el.hidden = true;
  }
};

// web/src/interface/ecran.ts
var GENRE_DEPOT = 9;
var RAFRAICHIR_MS = 1e3;
var VillesProches = class {
  m;
  cases;
  constructor(m, n) {
    this.m = m;
    this.cases = /* @__PURE__ */ new Map();
    const V = m.villes;
    for (let i = 0; i < Math.min(n, V.n); i++) {
      const k = this.cle(V.x[i], V.y[i]);
      const l = this.cases.get(k);
      if (l) l.push(i);
      else this.cases.set(k, [
        i
      ]);
    }
  }
  cle(x, y) {
    return Math.floor(x / 50) * 1e5 + Math.floor(y / 50);
  }
  proche(x, y) {
    const V = this.m.villes;
    let best = -1, bd = Infinity;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const i of this.cases.get(this.cle(x + dx * 50, y + dy * 50)) ?? []) {
          const d = (V.x[i] - x) ** 2 + (V.y[i] - y) ** 2;
          if (d < bd) bd = d, best = i;
        }
      }
    }
    return best >= 0 ? V.noms[best] : "";
  }
};
var Ecran = class {
  zone;
  l;
  etat;
  cat;
  pays;
  vue;
  fil;
  raccourcis;
  tendances;
  gauche;
  droite;
  combatsFermes;
  partieGuerre;
  paysDecret;
  pontChoisi;
  armee;
  armeeOuverte;
  mode;
  mixes;
  selection;
  pose;
  emplacements;
  depots;
  souris;
  finVue;
  dernierRafraichi;
  dernierFlux;
  poseEnVol;
  villes;
  paysListe;
  el;
  clicDroit;
  constructor(zone2, l, paysJouables2) {
    this.zone = zone2;
    this.l = l;
    this.etat = null;
    this.cat = null;
    this.pays = -1;
    this.vue = "jeu";
    this.raccourcis = lireRaccourcis();
    this.tendances = new Tendances();
    this.gauche = null;
    this.droite = null;
    this.combatsFermes = false;
    this.partieGuerre = "situation";
    this.paysDecret = -1;
    this.pontChoisi = null;
    this.armee = null;
    this.armeeOuverte = false;
    this.mode = null;
    this.mixes = /* @__PURE__ */ new Map();
    this.selection = null;
    this.pose = null;
    this.emplacements = null;
    this.depots = null;
    this.souris = null;
    this.finVue = false;
    this.dernierRafraichi = 0;
    this.dernierFlux = 0;
    this.poseEnVol = false;
    this.poseIci = null;
    const $2 = (id) => document.getElementById(id);
    const creer = (id, classe, parent = zone2) => {
      const e = document.createElement("div");
      e.id = id, e.className = classe;
      parent.append(e);
      return e;
    };
    this.el = {
      haut: $2("barre-haut"),
      bas: $2("barre-bas"),
      gauche: $2("gauche"),
      objet: creer("objet", "panneau", $2("gauche")),
      droite: creer("droite", "panneau"),
      armee: creer("armee", "panneau"),
      mode: creer("mode", "panneau"),
      bulle: creer("bulle", ""),
      fin: creer("fin", "")
    };
    for (const k of [
      "objet",
      "droite",
      "armee",
      "mode",
      "bulle",
      "fin"
    ]) this.el[k].hidden = true;
    for (const e of Object.values(this.el)) {
      for (const type of [
        "pointerdown",
        "wheel",
        "dblclick",
        "contextmenu"
      ]) e.addEventListener(type, (ev) => ev.stopPropagation());
      e.addEventListener("click", (ev) => this.clic(ev.target, ev));
    }
    this.el.objet.addEventListener("input", (ev) => this.saisie(ev.target));
    this.el.droite.addEventListener("change", (ev) => {
      const s = ev.target;
      if (s.matches("[data-decret-pays]")) this.paysDecret = Number(s.value), this.afficherDroite();
    });
    this.brancherGlisser();
    this.fil = new Fil($2("fil"), (n, action) => {
      if (action === "voir" && Number.isFinite(n.x)) return this.l.voir(n.x, n.y);
      const m = action.match(/^decret:([a-z-]+):(\d+)$/);
      if (m) {
        this.l.envoyer({
          type: "decret",
          decret: m[1],
          pays: Number(m[2])
        });
        this.fil.retirer(n.id);
      }
    });
    this.clicDroit = new ClicDroit(zone2, (cle, x, y, lieu) => this.actionClicDroit(cle, x, y, lieu));
    this.villes = new VillesProches(l.monde, 7e4);
    this.paysListe = paysJouables2;
    this.afficherHaut();
    this.afficherBas();
  }
  // ------------------------------------------------------------------ état reçu
  recevoir(e) {
    const ancien = this.etat;
    this.etat = e;
    if (e.catalogue) this.cat = e.catalogue, this.afficherBas();
    if (e.partie && e.partie.pays !== this.pays) {
      this.pays = e.partie.pays, this.tendances.vider(), this.finVue = false;
      this.paysDecret = this.paysListe.find((p) => p.id !== this.pays)?.id ?? -1;
    }
    if (e.ressources) this.tendances.noter(e.heure, e.ressources);
    for (const a of e.alertes ?? []) this.fil.ajouter(notifDeAlerte(a));
    const d = e.diplomatie;
    if (d) {
      const voulues = notifsPropositions(d, this.l.nomPays);
      const ids = new Set(voulues.map((n) => n.id));
      for (const id of this.fil.ids()) if (id.startsWith("prop:") && !ids.has(id)) this.fil.retirer(id);
      const deja = new Set(this.fil.ids());
      for (const n of voulues) if (!deja.has(n.id)) this.fil.ajouter(n);
      if (d.fin && !this.finVue) this.montrerFin(d.fin);
    }
    const g = e.guerre;
    if (g && g.enCours.some((c2) => c2.joueur >= 0) && !this.droite && !this.combatsFermes) this.droite = "combats";
    if (this.droite && (e.heure !== ancien?.heure || !ancien?.guerre)) this.afficherDroite();
    if (e.ressources && (!ancien?.ressources || Math.floor(e.ressources.argent) !== Math.floor(ancien.ressources.argent))) this.afficherChiffres();
  }
  /** À chaque image : date, et de temps en temps les panneaux ouverts. */
  tick(t) {
    this.afficherTemps();
    if (!this.etat?.pret) return;
    if (t - this.dernierRafraichi >= RAFRAICHIR_MS) {
      this.dernierRafraichi = t;
      this.rafraichir();
    }
    if (this.vue === "flux" && t - this.dernierFlux >= 2e3) {
      this.dernierFlux = t;
      this.l.demander({
        sujet: "depots"
      }).then((f) => {
        if (f?.sujet === "depots") this.depots = f, this.l.redessiner();
      });
    }
  }
  rafraichir() {
    const g = this.gauche;
    if (g?.quoi === "depot") {
      this.l.demander({
        sujet: "depot",
        site: g.site
      }).then((f) => f?.sujet === "depot" && this.gauche === g && this.majDepot(g, f));
    } else if (g?.quoi === "groupe") {
      this.l.demander({
        sujet: "groupe",
        id: g.id
      }).then((f) => {
        if (this.gauche !== g) return;
        if (f?.sujet !== "groupe") return this.fermerGauche();
        g.fiche = f, this.selection = {
          genre: "groupe",
          id: g.id,
          x: f.x,
          y: f.y
        }, this.afficherGauche();
      });
    } else if (g?.quoi === "site") {
      this.l.demander({
        sujet: "site",
        site: g.site
      }).then((f) => f?.sujet === "site" && this.gauche === g && (g.fiche = f, this.afficherGauche()));
    } else if (g?.quoi === "construire") this.afficherGauche();
    if (this.armeeOuverte) this.chargerArmee();
  }
  // ------------------------------------------------------------------ barres
  afficherHaut() {
    this.el.haut.innerHTML = `<div class="vues">${htmlVues(this.vue)}</div><div class="chiffres"></div><div class="temps"><div id="date"></div><button id="pause" data-act="pause" title="Pause (Espace)">\u25B6</button><button id="vitesse" data-act="vitesse" title="Vitesse (+ et \u2212)">base</button></div><div class="menus"><button data-act="armee" title="Page Arm\xE9e (A)">Arm\xE9e</button><button data-act="guerre" title="Menu de guerre (G)">Guerre</button><button data-act="combats" title="Combats en cours (C)">Combats</button><button data-act="sauver" title="Sauvegarder la partie">\u2913</button><button data-act="charger" title="Charger une partie">\u2912</button></div>`;
    this.afficherChiffres();
  }
  afficherChiffres() {
    const r = this.etat?.ressources ?? null;
    this.el.haut.querySelector(".chiffres").innerHTML = htmlChiffresHaut(r, r ? this.tendances : null);
    this.afficherBas();
  }
  afficherTemps() {
    const e = this.etat;
    const b = this.el.haut.querySelector("#pause");
    const enPause = !e || e.enPause;
    b.textContent = enPause ? "\u25B6" : "\u275A\u275A";
    b.classList.toggle("actif", enPause);
    this.el.haut.querySelector("#vitesse").textContent = e ? nomVitesse(e.vitesse) : "base";
    this.el.haut.querySelector("#date").innerHTML = e?.pret ? htmlDate(this.l.heure()) : `<span id="jour">${echapper(e?.chargement || "\u2014")}</span>`;
  }
  afficherBas() {
    const argent = this.etat?.ressources?.argent ?? 0;
    const r = this.etat?.ressources;
    this.el.bas.innerHTML = `<button class="construire${this.gauche?.quoi === "construire" ? " actif" : ""}" data-act="construire" title="Construire (B)">\u25A3 Construire</button><div class="bb-cases">${htmlCases(this.cat, this.raccourcis, argent)}</div><div class="bb-info">${r ? `${r.groupes} groupes<br>${r.chantiers} chantiers<br>${r.convois} convois` : ""}</div>`;
  }
  // ------------------------------------------------------------------ panneau de gauche (objet, Construire)
  afficherGauche() {
    const g = this.gauche, e = this.el.objet;
    e.hidden = !g;
    e.classList.toggle("construire", g?.quoi === "construire");
    if (!g) return;
    const argent = this.etat?.ressources?.argent ?? 0;
    switch (g.quoi) {
      case "construire":
        e.innerHTML = htmlConstruire(this.cat, argent);
        break;
      case "depot":
        if (g.fiche) e.innerHTML = htmlDepot(g.fiche, this.mixDe(g.site), this.nomLieu(g.fiche.x, g.fiche.y, g.fiche.nom));
        else e.innerHTML = `<div class="note">\u2026</div>`;
        break;
      case "groupe":
        if (g.fiche) e.innerHTML = htmlGroupe(g.fiche, this.l.nomPays(g.fiche.pays));
        break;
      case "site":
        if (g.fiche) e.innerHTML = htmlSite(g.fiche, this.cat, this.nomLieu(g.fiche.x, g.fiche.y, g.fiche.nom), this.l.nomPays(g.fiche.pays));
        break;
      case "pays":
        e.innerHTML = htmlPays(g.pays, this.l.nomPays(g.pays), this.etat?.diplomatie ?? null, g.camp);
        break;
    }
  }
  /** Rafraîchit le tableau d'un dépôt sans toucher aux curseurs (sauf si leurs maxima changent). */
  majDepot(g, f) {
    const avant = g.fiche;
    g.fiche = f;
    this.selection = {
      genre: "site",
      id: g.site,
      x: f.x,
      y: f.y
    };
    if (!avant || this.el.objet.hidden) return this.afficherGauche();
    this.el.objet.querySelector(".dp-table").innerHTML = htmlTableDepot(f);
    const memes = avant.presents.every((n, t) => n === f.presents[t]) && avant.avions === f.avions;
    if (!memes && !this.el.objet.querySelector("input:focus, input:active")) {
      const m = bornerMix(this.mixDe(g.site), f);
      this.mixes.set(g.site, m);
      this.el.objet.querySelector(".dp-mix").innerHTML = htmlMix(f, m);
    }
  }
  /** Règle la table de mixage d'un dépôt (autotest, captures). */
  mixer(site, m) {
    this.mixes.set(site, {
      ...m
    });
    const g = this.gauche;
    if (g?.quoi === "depot" && g.site === site && g.fiche) this.el.objet.querySelector(".dp-mix").innerHTML = htmlMix(g.fiche, bornerMix(m, g.fiche));
  }
  mixDe(site) {
    let m = this.mixes.get(site);
    if (!m) this.mixes.set(site, m = {
      ...MIX_VIDE
    });
    return m;
  }
  fermerGauche() {
    this.gauche = null, this.selection = null;
    this.afficherGauche();
    this.afficherBas();
    this.l.redessiner();
  }
  ouvrirConstruire() {
    this.gauche = this.gauche?.quoi === "construire" ? null : {
      quoi: "construire"
    };
    this.afficherGauche();
    this.afficherBas();
  }
  ouvrirDepot(site) {
    const g = {
      quoi: "depot",
      site,
      fiche: null
    };
    this.gauche = g;
    this.l.demander({
      sujet: "depot",
      site
    }).then((f) => {
      if (f?.sujet !== "depot" || this.gauche !== g) return;
      g.fiche = f;
      this.mixes.set(site, bornerMix(this.mixDe(site), f));
      this.selection = {
        genre: "site",
        id: site,
        x: f.x,
        y: f.y
      };
      this.afficherGauche();
      this.l.redessiner();
    });
  }
  ouvrirGroupe(id) {
    const g = {
      quoi: "groupe",
      id,
      fiche: null
    };
    this.gauche = g;
    this.l.demander({
      sujet: "groupe",
      id
    }).then((f) => {
      if (f?.sujet !== "groupe" || this.gauche !== g) return;
      g.fiche = f, this.selection = {
        genre: "groupe",
        id,
        x: f.x,
        y: f.y
      };
      this.afficherGauche();
      this.l.redessiner();
    });
  }
  ouvrirSite(site) {
    const g = {
      quoi: "site",
      site,
      fiche: null
    };
    this.gauche = g;
    this.l.demander({
      sujet: "site",
      site
    }).then((f) => {
      if (f?.sujet !== "site" || this.gauche !== g) return;
      g.fiche = f, this.selection = {
        genre: "site",
        id: site,
        x: f.x,
        y: f.y
      };
      this.afficherGauche();
      this.l.redessiner();
    });
  }
  ouvrirPays(pays, camp) {
    this.gauche = {
      quoi: "pays",
      pays,
      camp
    };
    this.selection = null;
    this.afficherGauche();
  }
  /** Nom d'un bâtiment pour l'affichage : son nom, et la ville la plus proche quand le nom est celui du genre. */
  nomLieu(x, y, nom) {
    const generique = !nom || !!this.cat?.batiments.some((b) => b.nom === nom);
    if (!generique) return nom;
    const v = this.villes.proche(x, y);
    return v ? `${nom || "Site"} \xB7 ${v}` : nom;
  }
  // ------------------------------------------------------------------ colonne de droite, page Armée, fin
  afficherDroite() {
    const e = this.el.droite, d = this.etat?.diplomatie ?? null, g = this.etat?.guerre ?? null;
    e.hidden = !this.droite;
    if (this.droite === "combats") e.innerHTML = htmlCombats(g, this.l.nomPays);
    else if (this.droite === "guerre") {
      const sel = e.querySelector("select:focus");
      if (sel) return;
      e.innerHTML = htmlGuerre(this.partieGuerre, d, g, this.cat, this.l.nomPays, this.paysListe.filter((p) => p.id !== this.pays), this.paysDecret, this.pontChoisi);
    }
  }
  basculerGuerre(partie) {
    if (partie) this.partieGuerre = partie;
    this.droite = this.droite === "guerre" && !partie ? null : "guerre";
    this.afficherDroite();
  }
  basculerCombats() {
    this.droite = this.droite === "combats" ? null : "combats";
    this.combatsFermes = this.droite === null;
    this.afficherDroite();
  }
  basculerArmee() {
    this.armeeOuverte = !this.armeeOuverte;
    this.el.armee.hidden = !this.armeeOuverte;
    if (this.armeeOuverte) this.el.armee.innerHTML = `<div class="titre">Arm\xE9e</div><div class="note">\u2026</div>`, this.chargerArmee();
  }
  chargerArmee() {
    this.l.demander({
      sujet: "armee"
    }).then((f) => {
      if (f?.sujet !== "armee" || !this.armeeOuverte) return;
      this.armee = f;
      const defile = [
        ...this.el.armee.querySelectorAll(".defile")
      ].map((x) => x.scrollTop);
      this.el.armee.innerHTML = htmlArmee(f, this.cat, this.etat?.ressources ?? null, (x, y, n) => this.nomLieu(x, y, n));
      this.el.armee.querySelectorAll(".defile").forEach((x, i) => x.scrollTop = defile[i] ?? 0);
    });
  }
  montrerFin(f) {
    this.finVue = true;
    this.el.fin.innerHTML = htmlFin(f);
    this.el.fin.hidden = false;
    if (this.etat && !this.etat.enPause) this.l.envoyer({
      type: "pause"
    });
  }
  // ------------------------------------------------------------------ modes de la carte (cible, pose)
  choisirSurCarte(texte2, rappel) {
    this.mode = {
      quoi: "cible",
      texte: texte2,
      rappel
    };
    this.afficherMode();
  }
  afficherMode() {
    const m = this.mode, e = this.el.mode;
    e.hidden = !m;
    this.zone.classList.toggle("viser", !!m);
    if (!m) return void (this.el.bulle.hidden = true);
    if (m.quoi === "cible") e.innerHTML = `${echapper(m.texte)} <button data-act="annuler-mode">Annuler (\xC9chap)</button>`;
    else {
      const cat = this.cat;
      const silo = m.genre === 11 ? ` \xB7 bombe <select data-bombe>${cat.bombes.map((b, i) => `<option value="${i}"${i === m.bombe ? " selected" : ""}>${echapper(b.nom)} (${court(b.prix)})</option>`).join("")}</select>` : "";
      const axe = m.genre === AXE ? ` \xB7 <span class="seg">${cat.axes.map((a) => `<button data-axe="${a.mode}" class="${a.mode === m.axe ? "actif" : ""}">${a.nom}</button>`).join("")}</span>` : "";
      const nom = m.genre === AXE ? "Route ou rail" : cat.batiments[m.genre].nom;
      const regle = this.emplacements?.genre === m.genre ? this.emplacements.regle : "";
      e.innerHTML = `Poser : <b>${echapper(nom)}</b>${regle ? ` <span class="note">${echapper(regle)}</span>` : ""}${silo}${axe} <button data-act="annuler-mode">Annuler (\xC9chap)</button>`;
      const s = e.querySelector("[data-bombe]");
      if (s) s.onchange = () => m.bombe = Number(s.value);
    }
  }
  /** Pose d'un bâtiment (genre 0 à 11, ou AXE) : emplacements valides demandés à la simulation. */
  commencerPose(genre, x, y) {
    if (!this.cat) return;
    if (genre === 11 && !this.cat.nucleaire) return;
    this.mode = {
      quoi: "pose",
      genre,
      plusieurs: false,
      bombe: 0,
      axe: "route",
      depart: null
    };
    this.pose = null, this.emplacements = null;
    if (genre !== AXE) {
      this.l.demander({
        sujet: "emplacements",
        genre
      }).then((f) => {
        if (f?.sujet === "emplacements" && this.mode?.quoi === "pose" && this.mode.genre === genre) this.emplacements = f, this.afficherMode(), this.l.redessiner();
      });
    }
    this.afficherMode();
    if (x !== void 0 && y !== void 0) this.verifierPose(x, y);
  }
  verifierPose(x, y) {
    const m = this.mode;
    if (m?.quoi !== "pose" || m.genre === AXE || this.poseEnVol) return;
    this.poseEnVol = true;
    this.l.demander({
      sujet: "pose",
      genre: m.genre,
      x,
      y
    }).then((f) => {
      this.poseEnVol = false;
      if (f?.sujet === "pose" && this.mode === m) this.pose = f, this.afficherBulle();
    });
  }
  afficherBulle() {
    const m = this.mode, b = this.el.bulle;
    if (m?.quoi !== "pose" || !this.souris || !this.cat) return void (b.hidden = true);
    const [x, y, px, py] = this.souris;
    let km = 0;
    if (m.genre === AXE && m.depart) {
      const [lo1, la1] = inverser(...m.depart), [lo2, la2] = inverser(x, y);
      km = Math.round(distanceKm(lo1, la1, lo2, la2));
    }
    b.innerHTML = htmlBullePose(this.cat, m.genre, this.pose, this.etat?.ressources?.argent ?? 0, m.axe, km);
    b.style.left = `${px + 16}px`, b.style.top = `${py + 12}px`;
    b.hidden = false;
  }
  annulerMode() {
    this.mode = null, this.pose = null, this.emplacements = null;
    this.afficherMode();
    this.l.redessiner();
  }
  // ------------------------------------------------------------------ souris sur la carte (appelé par principal.ts)
  /** Survol de la carte (x, y en km de carte, px, py en pixels). */
  survol(x, y, px, py) {
    this.souris = [
      x,
      y,
      px,
      py
    ];
    if (this.mode?.quoi === "pose") this.verifierPose(x, y), this.afficherBulle(), this.l.redessiner();
  }
  /** Clic gauche (sans glisser) : un mode en cours, sinon l'objet sous le clic. */
  clicCarte(x, y, ev) {
    this.clicDroit.fermer();
    const m = this.mode;
    if (m?.quoi === "cible") {
      this.mode = null, this.afficherMode();
      return m.rappel(x, y);
    }
    if (m?.quoi === "pose") {
      if (m.genre === AXE) {
        if (!m.depart) return void (m.depart = [
          x,
          y
        ], this.afficherBulle());
        this.l.envoyer({
          type: "construire-axe",
          mode: m.axe,
          x1: m.depart[0],
          y1: m.depart[1],
          x2: x,
          y2: y
        });
        m.depart = ev.shiftKey ? [
          x,
          y
        ] : null;
      } else {
        this.l.envoyer({
          type: "construire",
          genre: m.genre,
          x,
          y,
          ...m.genre === 11 ? {
            bombe: m.bombe
          } : {}
        });
      }
      if (!ev.shiftKey) this.annulerMode();
      return;
    }
    this.l.demander({
      sujet: "lieu",
      x,
      y,
      km: 14 / this.l.camera().echelle
    }).then((f) => f?.sujet === "lieu" && this.ouvrirLieu(f));
  }
  ouvrirLieu(f) {
    if (f.groupe) return this.ouvrirGroupe(f.groupe.id);
    if (f.site) {
      if (f.site.genre === GENRE_DEPOT && f.site.camp === CAMP_JOUEUR) return this.ouvrirDepot(f.site.site);
      return this.ouvrirSite(f.site.site);
    }
    if (f.pays >= 0 && f.camp !== CAMP_JOUEUR) return this.ouvrirPays(f.pays, f.camp);
    if (this.gauche && this.gauche.quoi !== "construire") this.fermerGauche();
  }
  /** Clic droit : rangée de boutons selon ce qui est sous le clic. */
  clicDroitCarte(x, y, px, py) {
    if (this.mode) return this.annulerMode();
    this.l.demander({
      sujet: "lieu",
      x,
      y,
      km: 14 / this.l.camera().echelle
    }).then((f) => {
      const l = f?.sujet === "lieu" ? f : null;
      const g = this.gauche;
      const groupe = g?.quoi === "groupe" && g.fiche?.camp === CAMP_JOUEUR ? g.fiche.nom : null;
      const mix = g?.quoi === "depot" && !mixVide(this.mixDe(g.site)) ? "le groupe de la table de mixage" : null;
      const enGuerre = !!l && l.pays >= 0 && etatPays(this.etat?.diplomatie ?? null, l.pays) === "en guerre";
      const actions = actionsClicDroit(l, {
        groupe,
        mix,
        enGuerre,
        nucleaire: !!this.cat?.nucleaire
      });
      const [lon, lat] = inverser(x, y);
      const titre = l?.ville ? this.l.monde.villes.noms[l.ville.i] : l && l.pays >= 0 ? this.l.nomPays(l.pays) : "Mer";
      this.clicDroit.ouvrir(px, py, x, y, titre, `${lat.toFixed(2)}\xB0, ${lon.toFixed(2)}\xB0`, actions, l);
    });
  }
  actionClicDroit(cle, x, y, l) {
    const g = this.gauche;
    switch (cle) {
      case "envoyer":
        if (g?.quoi === "groupe") this.l.envoyer({
          type: "ordre-groupe",
          groupe: g.id,
          ordre: "envoyer",
          x,
          y
        });
        else if (g?.quoi === "depot") this.composer(g.site, x, y);
        break;
      case "construire":
        this.gauche = {
          quoi: "construire"
        }, this.afficherGauche(), this.afficherBas();
        this.poseIci = [
          x,
          y
        ];
        break;
      case "guerre":
      case "paix":
        if (l && l.pays >= 0) this.l.envoyer({
          type: "decret",
          decret: cle,
          pays: l.pays
        });
        break;
      case "bombe":
        this.l.envoyer({
          type: "nucleaire",
          ordre: "tirer",
          x,
          y
        });
        break;
      case "pont":
        if (l?.pont) this.l.envoyer({
          type: "pont",
          pont: l.pont.i,
          ordre: "bombarder"
        });
        break;
    }
    this.bientot();
  }
  poseIci;
  /** Compose au dépôt avec le mix courant ; (x, y) : envoyé aussitôt. */
  composer(site, x, y) {
    const m = this.mixDe(site);
    if (mixVide(m)) return;
    this.l.envoyer({
      type: "composer",
      depot: site,
      soldats: m.soldats,
      chars: m.chars,
      artillerie: m.artillerie,
      avions: m.avions,
      ...m.nom ? {
        nom: m.nom
      } : {},
      ...x !== void 0 ? {
        x,
        y
      } : {}
    });
    this.mixes.set(site, {
      ...MIX_VIDE
    });
    const g = this.gauche;
    if (g?.quoi === "depot") g.fiche = null;
    this.bientot();
  }
  /** Après un ordre : panneaux rafraîchis un peu plus tard. */
  bientot() {
    setTimeout(() => this.rafraichir(), 150);
  }
  // ------------------------------------------------------------------ clics dans les panneaux
  clic(t, ev) {
    const b = t.closest("button, [data-article], [data-raccourci], [data-vue]");
    if (!b || b.disabled) return;
    const d = b.dataset, envoyer2 = (m) => (this.l.envoyer(m), this.bientot());
    const g = this.gauche;
    if (d.fermerPanneau !== void 0) {
      const p = b.closest("#objet, #droite, #armee");
      if (p?.id === "objet") this.fermerGauche();
      else if (p?.id === "droite") this.droite === "combats" ? this.basculerCombats() : (this.droite = null, this.afficherDroite());
      else if (p?.id === "armee") this.basculerArmee();
      return;
    }
    if (d.vue) return this.changerVue(d.vue);
    if (d.voir) {
      const [x, y] = d.voir.split(",").map(Number);
      if (this.armeeOuverte) this.basculerArmee();
      return this.l.voir(x, y);
    }
    if (d.article !== void 0) return this.commencerPoseDepuisListe(Number(d.article));
    if (d.raccourci !== void 0) {
      if (d.genre !== void 0) this.commencerPoseDepuisListe(Number(d.genre));
      else this.ouvrirConstruire();
      return;
    }
    if (d.groupe) return this.ouvrirGroupe(Number(d.groupe));
    if (d.depot) {
      if (this.armeeOuverte) this.basculerArmee();
      return this.ouvrirDepot(Number(d.depot));
    }
    if (d.partie) return this.basculerGuerre(d.partie);
    if (d.decret) return envoyer2({
      type: "decret",
      decret: d.decret,
      pays: Number(d.pays)
    });
    if (d.ordre && g?.quoi === "groupe") return envoyer2({
      type: "ordre-groupe",
      groupe: g.id,
      ordre: d.ordre
    });
    if (d.fusion && g?.quoi === "groupe") return envoyer2({
      type: "fusionner",
      a: g.id,
      b: Number(d.fusion)
    });
    if (d.produire !== void 0) {
      const site = d.site !== void 0 ? Number(d.site) : g?.quoi === "site" ? g.site : -1;
      if (site >= 0) envoyer2({
        type: "produire",
        unite: "soldats",
        nombre: Number(d.produire),
        site
      });
      return;
    }
    if (d.produireType) return envoyer2({
      type: "produire",
      unite: d.produireType,
      nombre: Number(d.n)
    });
    if (d.aviation) {
      const site = d.site !== void 0 ? Number(d.site) : g?.quoi === "site" ? g.site : -1;
      if (site >= 0) envoyer2({
        type: "aviation",
        aeroport: site,
        ordre: d.aviation
      });
      return;
    }
    if (d.armer !== void 0) {
      const silo = d.silo !== void 0 ? Number(d.silo) : g?.quoi === "site" ? g.site : -1;
      if (silo >= 0) envoyer2({
        type: "nucleaire",
        ordre: "armer",
        silo,
        bombe: Number(d.armer)
      });
      return;
    }
    if (d.acheter) return envoyer2({
      type: "acheter",
      produit: Number(d.acheter) || PRODUIT_CARBURANT,
      tonnes: Number(d.tonnes)
    });
    if (d.flotte) {
      const port = Number(d.flotte), navires = Number(d.navires);
      if (this.armeeOuverte) this.basculerArmee();
      return this.choisirSurCarte(`Clique la zone de mer que la flotte doit tenir (${navires} navires)`, (x, y) => envoyer2({
        type: "flotte",
        port,
        navires,
        x,
        y
      }));
    }
    if (d.ordreFlotte) {
      const flotte = Number(d.flotteId);
      if (d.ordreFlotte === "rentrer") return envoyer2({
        type: "ordre-flotte",
        flotte,
        ordre: "rentrer"
      });
      if (this.armeeOuverte) this.basculerArmee();
      return this.choisirSurCarte("Clique la nouvelle zone de mer de la flotte", (x, y) => envoyer2({
        type: "ordre-flotte",
        flotte,
        ordre: "zone",
        x,
        y
      }));
    }
    if (d.pont) return envoyer2({
      type: "pont",
      pont: Number(d.i),
      ordre: d.pont
    });
    if (d.tout && g?.quoi === "depot" && g.fiche) {
      const m = this.mixDe(g.site), k = d.tout;
      m[k] = Number(b.parentElement.querySelector("input").max);
      this.el.objet.querySelector(".dp-mix").innerHTML = htmlMix(g.fiche, m);
      return;
    }
    if (d.axe && this.mode?.quoi === "pose") return void (this.mode.axe = d.axe, this.afficherMode(), this.afficherBulle());
    switch (d.act) {
      case "pause":
        return this.l.envoyer({
          type: "pause"
        });
      case "vitesse":
        if (this.etat) this.l.envoyer({
          type: "vitesse",
          vitesse: this.etat.vitesse === 4 ? 1 : vitesseVoisine(this.etat.vitesse, 1)
        });
        return;
      case "armee":
        return this.basculerArmee();
      case "guerre":
        return this.basculerGuerre();
      case "combats":
        return this.basculerCombats();
      case "construire":
        return this.ouvrirConstruire();
      case "sauver":
        return this.l.envoyer({
          type: "sauvegarder"
        });
      case "charger":
        return this.l.charger();
      case "annuler-mode":
        return this.annulerMode();
      case "mix-envoyer":
        if (g?.quoi === "depot") {
          const site = g.site;
          this.choisirSurCarte("Clique l'objectif du groupe (ville, d\xE9p\xF4t, point)", (x, y) => this.composer(site, x, y));
        }
        return;
      case "mix-former":
        if (g?.quoi === "depot") this.composer(g.site);
        return;
      case "groupe-envoyer":
        if (g?.quoi === "groupe") {
          const id = g.id;
          this.choisirSurCarte("Clique le nouvel objectif du groupe", (x, y) => envoyer2({
            type: "ordre-groupe",
            groupe: id,
            ordre: "envoyer",
            x,
            y
          }));
        }
        return;
      case "groupe-debarquer":
        if (g?.quoi === "groupe") {
          const id = g.id;
          this.choisirSurCarte("Clique pr\xE8s du port o\xF9 d\xE9barquer", (x, y) => envoyer2({
            type: "debarquer",
            groupe: id,
            x,
            y
          }));
        }
        return;
      case "doubler":
        if (g?.quoi === "site") envoyer2({
          type: "doubler",
          site: g.site
        });
        return;
      case "tirer": {
        const silo = Number(d.silo);
        return this.choisirSurCarte("\u2622 Clique la cible de la bombe (un pays en guerre avec toi)", (x, y) => envoyer2({
          type: "nucleaire",
          ordre: "tirer",
          x,
          y,
          silo
        }));
      }
      case "choisir-pont":
        return this.choisirSurCarte("Clique pr\xE8s d'un pont (l\xE0 o\xF9 un grand axe franchit un fleuve)", (x, y) => {
          this.l.demander({
            sujet: "lieu",
            x,
            y,
            km: 30 / this.l.camera().echelle
          }).then((f) => {
            this.pontChoisi = f?.sujet === "lieu" ? f.pont : null;
            this.basculerGuerre("cibles");
          });
        });
      case "fin-regarder":
        this.el.fin.hidden = true;
        return;
      case "fin-nouvelle":
        location.reload();
        return;
    }
    void ev;
  }
  commencerPoseDepuisListe(genre) {
    const ici = this.poseIci;
    this.poseIci = null;
    this.commencerPose(genre, ici?.[0], ici?.[1]);
  }
  /** Curseurs et nom de la table de mixage. */
  saisie(i) {
    const g = this.gauche;
    if (g?.quoi !== "depot" || !g.fiche) return;
    const m = this.mixDe(g.site);
    if (i.matches("[data-mix-nom]")) return void (m.nom = i.value);
    const k = i.dataset.mix;
    if (!k) return;
    m[k] = Number(i.value);
    this.el.objet.querySelector(`[data-val="${k}"]`).textContent = Number(i.value).toLocaleString("fr-FR");
    const vide = mixVide(m);
    for (const b of this.el.objet.querySelectorAll("[data-act=mix-envoyer], [data-act=mix-former]")) b.disabled = vide;
  }
  /** Glisser un bâtiment de la liste vers une case de la barre du bas ; clic droit sur une case : la vider (⇧ : tout remettre). */
  brancherGlisser() {
    this.el.objet.addEventListener("dragstart", (ev) => {
      const a = ev.target.closest("[data-article]");
      if (a) ev.dataTransfer?.setData("text/plain", `b:${a.dataset.article}`);
    });
    this.el.bas.addEventListener("dragover", (ev) => {
      if (ev.target.closest("[data-raccourci]")) ev.preventDefault();
    });
    this.el.bas.addEventListener("drop", (ev) => {
      const c2 = ev.target.closest("[data-raccourci]");
      const v = ev.dataTransfer?.getData("text/plain") ?? "";
      if (!c2 || !v.startsWith("b:")) return;
      ev.preventDefault();
      this.raccourcis[Number(c2.dataset.raccourci)] = Number(v.slice(2));
      garderRaccourcis(this.raccourcis);
      this.afficherBas();
    });
    this.el.bas.addEventListener("contextmenu", (ev) => {
      const c2 = ev.target.closest("[data-raccourci]");
      if (!c2) return;
      ev.preventDefault();
      if (ev.shiftKey) this.raccourcis = RACCOURCIS_DEPART.slice();
      else this.raccourcis[Number(c2.dataset.raccourci)] = -1;
      garderRaccourcis(this.raccourcis);
      this.afficherBas();
    });
  }
  changerVue(v) {
    this.vue = v;
    this.l.vue(v);
    this.dernierFlux = 0;
    this.el.haut.querySelector(".vues").innerHTML = htmlVues(v);
  }
  // ------------------------------------------------------------------ clavier
  /** Une touche (hors champs de saisie) : vrai si l'écran l'a prise. */
  touche(ev) {
    const k = ev.key.toLowerCase();
    if (ev.key === "Escape") {
      if (this.mode) this.annulerMode();
      else if (!this.clicDroit.el.hidden) this.clicDroit.fermer();
      else if (this.armeeOuverte) this.basculerArmee();
      else if (this.gauche) this.fermerGauche();
      else if (this.droite === "guerre") this.droite = null, this.afficherDroite();
      return true;
    }
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return false;
    const chiffre = /^Digit(\d)$/.exec(ev.code);
    if (chiffre) {
      const i = TOUCHES.indexOf(chiffre[1]), genre = this.raccourcis[i];
      if (genre >= 0) this.commencerPoseDepuisListe(genre);
      return true;
    }
    if (k === "b") return this.ouvrirConstruire(), true;
    if (k === "a") return this.basculerArmee(), true;
    if (k === "g") return this.basculerGuerre(), true;
    if (k === "c") return this.basculerCombats(), true;
    if (k === "v") return this.changerVue(this.vue === "jeu" ? "flux" : "jeu"), true;
    return false;
  }
  // ------------------------------------------------------------------ calque de la carte
  /** Par-dessus la carte : combats (icône et barre des puissances), choix en cours, emplacements de la pose, dépôts (vue Flux). */
  dessiner(ctx, cam) {
    const m = this.l.monde, copies = copiesVisibles(cam.cx, cam.largeur / 2 / cam.echelle, m.info.emprise.x_min, m.info.circonference_km);
    const chaque = (x, y, f) => {
      for (const d of copies) {
        const [sx, sy] = cam.versEcran(x + d, y);
        if (sx > -60 && sy > -60 && sx < cam.largeur + 60 && sy < cam.hauteur + 60) f(sx, sy);
      }
    };
    if (this.vue === "flux" && this.depots) {
      ctx.lineWidth = 1;
      for (const d of this.depots.depots) {
        const lat = inverser(d.x, d.y)[1], r = this.depots.porteeKm / Math.cos(lat * Math.PI / 180) * cam.echelle;
        const p = d.cap > 0 ? (d.carburant + d.munitions) / d.cap : 0;
        chaque(d.x, d.y, (sx, sy) => {
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(242, 201, 76, 0.05)";
          ctx.fill();
          ctx.strokeStyle = "rgba(242, 201, 76, 0.45)";
          ctx.stroke();
          ctx.fillStyle = "rgba(15,20,25,0.8)";
          ctx.fillRect(sx - 9, sy + 7, 18, 4);
          ctx.fillStyle = p < 0.2 ? "#e8684a" : "#f2c94c";
          ctx.fillRect(sx - 9, sy + 7, 18 * Math.min(1, p), 4);
        });
      }
    }
    const g = this.etat?.guerre;
    if (g && this.vue === "jeu") {
      const epees = dessinCombat().grille;
      for (const c2 of g.enCours) {
        const j = c2.joueur === 1 ? 1 : 0, p = c2.puissance[j] + c2.puissance[1 - j] > 0 ? c2.puissance[j] / (c2.puissance[j] + c2.puissance[1 - j]) : 0.5;
        chaque(c2.x, c2.y, (sx, sy) => {
          ctx.fillStyle = "rgba(15,20,25,0.85)";
          ctx.fillRect(sx - 12, sy - 22, 24, 16);
          const x0 = Math.round(sx - epees.w / 2), y0 = Math.round(sy - 14 - epees.h / 2);
          for (let v = 0; v < epees.h; v++) {
            for (let u = 0; u < epees.w; u++) {
              const k = epees.get(u, v);
              if (k === ".") continue;
              ctx.fillStyle = k === "a" ? c2.joueur >= 0 ? "#ffe9b0" : "#d8d2c4" : PALETTE2[k];
              ctx.fillRect(x0 + u, y0 + v, 1, 1);
            }
          }
          ctx.fillStyle = "#e8684a";
          ctx.fillRect(sx - 12, sy - 5, 24, 4);
          ctx.fillStyle = c2.joueur >= 0 ? "#6fb3ff" : "#cfc6b0";
          ctx.fillRect(sx - 12, sy - 5, 24 * p, 4);
        });
      }
      ctx.textAlign = "start";
    }
    const s = this.selection;
    if (s) {
      const pos = s.genre === "groupe" ? this.l.positionGroupe(s.id) ?? [
        s.x,
        s.y
      ] : [
        s.x,
        s.y
      ];
      ctx.strokeStyle = "#f2c94c";
      ctx.lineWidth = 2;
      chaque(pos[0], pos[1], (sx, sy) => ctx.strokeRect(sx - 11, sy - 11, 22, 22));
    }
    const mo = this.mode;
    if (mo?.quoi === "pose") {
      const e = this.emplacements;
      if (e && e.genre === mo.genre) {
        ctx.fillStyle = "rgba(110, 200, 110, 0.85)";
        for (let i = 0; i < e.xy.length; i += 2) chaque(e.xy[i], e.xy[i + 1], (sx, sy) => ctx.fillRect(sx - 3, sy - 3, 6, 6));
      }
      const p = this.pose;
      if (p && mo.genre !== AXE) {
        ctx.strokeStyle = p.ok ? "#6ec86e" : "#e8684a";
        ctx.lineWidth = 2;
        chaque(p.x, p.y, (sx, sy) => ctx.strokeRect(sx - 8, sy - 8, 16, 16));
      }
      if (mo.genre === AXE && mo.depart && this.souris) {
        const [a, b] = [
          cam.versEcran(...mo.depart),
          cam.versEcran(this.souris[0], this.souris[1])
        ];
        ctx.strokeStyle = mo.axe === "rail" ? "#3b3b3b" : "#f6efdc";
        ctx.setLineDash([
          6,
          4
        ]);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
};

// web/src/principal.ts
var $ = (id) => document.getElementById(id);
var canevas = $("carte");
var calque = $("etiquettes");
var zone = $("zone");
var survol = $("survol");
var perf = $("perf");
var elAvis = $("avis");
var parametres = new URLSearchParams(location.search);
var AUTOTEST = parametres.has("autotest");
var ESSAI = parametres.has("essai");
var APERCU = parametres.get("ecran");
var JOUABLES = /* @__PURE__ */ new Set([
  "UN Member State",
  "Non-member observer state",
  "The City of Vatican"
]);
var lire = async (nom) => {
  const r = await fetch(`donnees/${nom}`);
  if (!r.ok) throw new Error(`${nom} : ${r.status}`);
  return await r.arrayBuffer();
};
var monde;
var camera;
var rendu;
var flux = null;
var fluxEnAttente = [];
var survolFlux = {
  genre: null,
  i: -1
};
var dernierDessin = 0;
var appelsDessin = 0;
var aRedessiner = true;
var msRendu = 0;
var nomPays = /* @__PURE__ */ new Map();
var mesures = {
  chargementMs: 0,
  gpuMo: 0,
  msRendu: 0,
  images: 0
};
var travailleur = new Worker("travailleur.js", {
  type: "module"
});
var envoyer = (m, transfert = []) => travailleur.postMessage(m, transfert);
var etat = null;
var recuA = 0;
var partieLancee = false;
var attenteMesure = null;
var attenteSauvegarde = null;
var nFiche = 0;
var fiches = /* @__PURE__ */ new Map();
function demander(d) {
  return new Promise((r) => {
    fiches.set(++nFiche, r);
    envoyer({
      type: "fiche",
      n: nFiche,
      demande: d
    });
  });
}
var dernierAvis = "";
travailleur.onmessage = (e) => {
  const m = e.data;
  switch (m.type) {
    case "etat":
      etat = m, recuA = performance.now();
      if (m.avis) avis(m.avis.texte, m.avis.ok), dernierAvis = m.avis.texte;
      if (m.partie) paysJoue = m.partie.pays;
      ecran?.recevoir(m);
      break;
    case "fiche":
      fiches.get(m.n)?.(m.fiche), fiches.delete(m.n);
      break;
    case "sauvegarde":
      if (attenteSauvegarde) attenteSauvegarde(m.octets), attenteSauvegarde = null;
      else telecharger(m.octets, m.nom);
      break;
    case "mesure":
      attenteMesure?.(m), attenteMesure = null;
      break;
    case "rendu":
      if (flux) flux.recevoir(m), aRedessiner = true;
      else fluxEnAttente.push(m);
      break;
    case "retard":
      avis(`La simulation ne suit plus : vitesse ramen\xE9e \xE0 ${nomVitesse(m.vitesse)}.`, false);
      break;
  }
};
function heureAffichee() {
  if (!etat) return 0;
  const avance = etat.enPause || !etat.pret ? 0 : (performance.now() - recuA) * etat.vitesse / MS_PAR_PAS;
  return etat.heure + Math.min(0.999, etat.fraction + avance);
}
var delaiAvis = 0;
function avis(texte2, ok) {
  elAvis.textContent = texte2;
  elAvis.classList.toggle("ok", ok);
  elAvis.hidden = false;
  clearTimeout(delaiAvis);
  delaiAvis = setTimeout(() => elAvis.hidden = true, 4e3);
}
var paysJoue = 0;
function lancerPartie(o) {
  paysJoue = o.pays ?? 0;
  fixerDepart(departDe(o.dateDepart));
  envoyer({
    type: "demarrer",
    graine: Math.random() * 2 ** 31 >>> 0,
    options: {
      ...o,
      essai: o.essai ?? ESSAI
    }
  });
  partieLancee = true;
  if (o.vitesse) envoyer({
    type: "vitesse",
    vitesse: o.vitesse
  });
  const p = o.pays !== void 0 ? monde.pays.find((x) => x.id === o.pays) : void 0;
  if (p) {
    ecran?.fil.ajouter({
      id: "bienvenue",
      genre: "info",
      titre: `Tu joues ${p.nom}`,
      texte: "Espace : reprendre. Clique un d\xE9p\xF4t \u25A3 pour composer un groupe ; B : construire ; A : arm\xE9e ; G : guerre.",
      x: NaN,
      y: NaN,
      boutons: [],
      attend: false
    });
  }
}
function telecharger(octets, nom) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([
    octets
  ], {
    type: "application/octet-stream"
  }));
  a.download = `${nom.replace(/[\\/:*?"<>|]/g, "-")}.squid2`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1e4);
}
function choisirFichier() {
  const i = document.createElement("input");
  i.type = "file";
  i.accept = ".squid2";
  i.onchange = async () => {
    const f = i.files?.[0];
    if (!f) return;
    const octets = new Uint8Array(await f.arrayBuffer());
    lancement?.fermer();
    partieLancee = true;
    envoyer({
      type: "charger",
      octets
    }, [
      octets.buffer
    ]);
  };
  i.click();
}
var ecran = null;
var lancement = null;
var ratio = () => devicePixelRatio || 1;
function ajuster() {
  const l = zone.clientWidth, h = zone.clientHeight, r = ratio();
  for (const cv of [
    canevas,
    calque
  ]) {
    if (cv.width !== Math.floor(l * r) || cv.height !== Math.floor(h * r)) {
      cv.width = Math.floor(l * r);
      cv.height = Math.floor(h * r);
      aRedessiner = true;
    }
  }
  if (camera && (camera.largeur !== l || camera.hauteur !== h)) {
    camera.redimensionner(l, h);
    aRedessiner = true;
  }
}
function etiquettes() {
  const ctx = calque.getContext("2d");
  const r = ratio();
  ctx.setTransform(r, 0, 0, r, 0, 0);
  ctx.clearRect(0, 0, calque.width, calque.height);
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "middle";
  const v = monde.villes;
  const e = camera.echelle;
  const copies = copiesVisibles(camera.cx, camera.largeur / 2 / e, monde.info.emprise.x_min, monde.info.circonference_km);
  const pris = [];
  for (let i = 0; i < v.n && pris.length < 400; i++) {
    if (!(v.capitale[i] || e >= 0.3 && v.classe[i] >= 5 || e >= 1.5 && v.classe[i] >= 4)) continue;
    for (const d of copies) {
      const [px, py] = camera.versEcran(v.x[i] + d, v.y[i]);
      if (px < -50 || py < -10 || px > camera.largeur + 50 || py > camera.hauteur + 10) continue;
      const w = ctx.measureText(v.noms[i]).width;
      const boite2 = [
        px + 5,
        py - 7,
        px + 9 + w,
        py + 7
      ];
      if (pris.some((b) => b[0] < boite2[2] && boite2[0] < b[2] && b[1] < boite2[3] && boite2[1] < b[3])) continue;
      pris.push(boite2);
      ctx.fillStyle = "rgba(15,20,25,0.65)";
      ctx.fillRect(boite2[0], boite2[1], boite2[2] - boite2[0], boite2[3] - boite2[1]);
      ctx.fillStyle = v.capitale[i] ? "#f6e7c8" : "#d8d2c4";
      ctx.fillText(v.noms[i], px + 7, py);
    }
  }
}
function dessiner2() {
  const t0 = performance.now();
  rendu.dessiner(camera, ratio());
  if (flux) appelsDessin = flux.dessiner(camera, ratio(), canevas.width, canevas.height, heureAffichee());
  etiquettes();
  if (flux) flux.calque(calque.getContext("2d"), camera, survolFlux);
  ecran?.dessiner(calque.getContext("2d"), camera);
  dernierDessin = performance.now();
  msRendu = msRendu * 0.8 + (performance.now() - t0) * 0.2;
  mesures.msRendu = msRendu, mesures.images++;
}
var dernierePerf = 0;
function image() {
  ajuster();
  if (camera && rendu) {
    const anime = camera.animer(16);
    const roule = !!flux?.anime() && !!etat?.pret && !etat.enPause && performance.now() - dernierDessin >= 33;
    if (anime || aRedessiner || roule) {
      dessiner2();
      aRedessiner = false;
    }
  }
  const t = performance.now();
  ecran?.tick(t);
  if (etat && t - dernierePerf > 500) {
    dernierePerf = t;
    perf.textContent = `rendu ${msRendu.toFixed(2)} ms \xB7 ${camera?.echelle.toFixed(3)} px/km \xB7 ${etat.pasParSeconde.toFixed(1)} pas/s \xB7 ${etat.msParPas.toFixed(3)} ms/pas \xB7 rendu sim ${etat.msRendu.toFixed(2)} ms \xB7 ${flux?.dernier?.billes.n ?? 0} billes \xB7 ${appelsDessin} appels \xB7 heure ${etat.heure}`;
    ecran?.fil.afficher();
  }
  requestAnimationFrame(image);
}
function lieuSous(x, y) {
  const v = valeurSous(monde.tuiles, boucler(x, monde.info.emprise.x_min, monde.info.circonference_km), y);
  return v === 0 ? "mer" : v === 250 ? "lac" : nomPays.get(v) ?? `? ${v}`;
}
function brancherSouris() {
  let glisse = null;
  let pointA = null;
  let bouge = 0;
  zone.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    glisse = [
      ev.clientX,
      ev.clientY
    ];
    bouge = 0;
    zone.setPointerCapture(ev.pointerId);
    zone.classList.add("glisse");
  });
  zone.addEventListener("pointermove", (ev) => {
    const b = zone.getBoundingClientRect();
    if (glisse) {
      bouge += Math.abs(ev.clientX - glisse[0]) + Math.abs(ev.clientY - glisse[1]);
      camera.deplacer(ev.clientX - glisse[0], ev.clientY - glisse[1]);
      glisse = [
        ev.clientX,
        ev.clientY
      ];
      aRedessiner = true;
    }
    const [x, y] = camera.versMonde(ev.clientX - b.left, ev.clientY - b.top);
    const [lon, lat] = inverser(x, y);
    if (flux && !glisse) {
      const s = flux.sous(camera, ev.clientX - b.left, ev.clientY - b.top);
      if (s.genre !== survolFlux.genre || s.i !== survolFlux.i) survolFlux = s, aRedessiner = true;
    }
    let texte2 = `${lieuSous(x, y)} \xB7 ${lat.toFixed(2)}\xB0, ${lon.toFixed(2)}\xB0`;
    if (survolFlux.genre && flux) texte2 = `${flux.texteSous(survolFlux)} \xB7 ${texte2}`;
    if (pointA) texte2 += ` \xB7 ${Math.round(distanceKm(pointA[0], pointA[1], lon, lat))} km du point cliqu\xE9`;
    survol.textContent = texte2;
    survol.hidden = false;
    if (!glisse) ecran?.survol(x, y, ev.clientX - b.left, ev.clientY - b.top);
  });
  zone.addEventListener("pointerup", (ev) => {
    if (glisse && bouge < 4) {
      const b = zone.getBoundingClientRect();
      const [x, y] = camera.versMonde(ev.clientX - b.left, ev.clientY - b.top);
      pointA = inverser(x, y);
      if (etat?.pret) ecran?.clicCarte(x, y, ev);
    }
    glisse = null;
    zone.classList.remove("glisse");
  });
  zone.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const b = zone.getBoundingClientRect();
    camera.zoomer(Math.exp(-ev.deltaY * 2e-3), ev.clientX - b.left, ev.clientY - b.top);
  }, {
    passive: false
  });
  zone.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    const b = zone.getBoundingClientRect(), px = ev.clientX - b.left, py = ev.clientY - b.top;
    const [x, y] = camera.versMonde(px, py);
    if (etat?.pret) ecran?.clicDroitCarte(x, y, px, py);
  });
}
function brancherClavier() {
  addEventListener("keydown", (ev) => {
    if (ev.target.matches("input, textarea, select") || !partieLancee) return;
    if (ev.key === " ") envoyer({
      type: "pause"
    }), ev.preventDefault();
    else if (ecran?.touche(ev)) ev.preventDefault();
    else if ((ev.key === "+" || ev.key === "=") && etat) envoyer({
      type: "vitesse",
      vitesse: vitesseVoisine(etat.vitesse, 1)
    });
    else if (ev.key === "-" && etat) envoyer({
      type: "vitesse",
      vitesse: vitesseVoisine(etat.vitesse, -1)
    });
    else if (ev.key === "F3") perf.hidden = !perf.hidden, ev.preventDefault();
    else {
      const pas = {
        ArrowLeft: [
          200,
          0
        ],
        ArrowRight: [
          -200,
          0
        ],
        ArrowUp: [
          0,
          200
        ],
        ArrowDown: [
          0,
          -200
        ]
      }[ev.key];
      if (pas) camera.deplacer(pas[0], pas[1]), aRedessiner = true;
    }
  });
}
function paysJouables() {
  const hab = /* @__PURE__ */ new Map();
  const v = monde.villes;
  for (let i = 0; i < v.n; i++) hab.set(v.pays[i], (hab.get(v.pays[i]) ?? 0) + v.pop[i]);
  return monde.pays.filter((p) => JOUABLES.has(p.statut)).map((p) => ({
    id: p.id,
    nom: p.nom,
    capitale: p.capitale,
    habitants: hab.get(p.id)
  })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}
var debutChargement = performance.now();
async function demarrer() {
  try {
    monde = await chargerMonde(lire);
    for (const p of monde.pays) nomPays.set(p.id, p.nom);
    camera = new Camera(monde.info.emprise, monde.info.circonference_km);
    rendu = new RenduMonde(canevas, monde);
    mesures.chargementMs = performance.now() - debutChargement;
    mesures.gpuMo = rendu.octetsGPU / 1e6;
    $("chargement").hidden = true;
    chargerReseauMonde(lire).then((r) => {
      flux = new RenduFlux(rendu.gl, monde, r);
      for (const m of fluxEnAttente.splice(0)) flux.recevoir(m);
      mesures.gpuMo += flux.octetsGPU / 1e6;
      aRedessiner = true;
    }).catch((x) => avis(`R\xE9seau du monde non charg\xE9 : ${x}`, false));
    ecran = new Ecran(zone, {
      envoyer: (m) => envoyer(m),
      demander,
      camera: () => camera,
      redessiner: () => aRedessiner = true,
      heure: heureAffichee,
      voir: (x, y) => {
        camera.cx = x, camera.cy = y;
        if (camera.echelle < 0.6) camera.zoomerTout(0.8 / camera.echelle, camera.largeur / 2, camera.hauteur / 2);
        aRedessiner = true;
      },
      vue: (v) => {
        if (flux) flux.vue = v;
        aRedessiner = true;
      },
      positionGroupe: (id) => {
        const r = flux?.dernier;
        if (!r) return null;
        const i = r.groupes.id.indexOf(id);
        return i < 0 ? null : [
          flux.posGroupes[2 * i],
          flux.posGroupes[2 * i + 1]
        ];
      },
      charger: choisirFichier,
      monde,
      nomPays: (p) => nomPays.get(p) ?? `pays ${p}`
    }, paysJouables());
    brancherSouris();
    brancherClavier();
    requestAnimationFrame(image);
    const france = monde.pays.find((p) => p.iso3 === "FRA")?.id ?? monde.pays[0].id;
    if (AUTOTEST) {
      lancerPartie({
        pays: france
      });
      autotest().catch((x) => rapport({
        ok: false,
        erreur: String(x)
      }));
    } else if (APERCU && APERCU !== "lancement") {
      lancerPartie({
        pays: france,
        nucleaire: true
      });
      apercu(APERCU).catch((x) => (document.body.dataset.erreur = String(x), document.body.dataset.fini = "1"));
    } else {
      lancement = new Lancement(zone, paysJouables(), france, lancerPartie, choisirFichier);
      if (APERCU === "lancement") setTimeout(() => document.body.dataset.fini = "1", 800);
    }
  } catch (err) {
    $("chargement").textContent = `Impossible de charger le monde : ${err}`;
    if (AUTOTEST) rapport({
      ok: false,
      erreur: `monde : ${err}`
    });
  }
}
function rapport(r) {
  const texte2 = JSON.stringify(r);
  const pont = globalThis.webkit?.messageHandlers?.autotest;
  if (pont) pont.postMessage(texte2);
  else console.log("autotest", texte2);
  document.body.dataset.autotest = texte2;
}
var attendre = (ms) => new Promise((r) => setTimeout(r, ms));
async function attendreQue(f, maxMs, quoi) {
  const t0 = performance.now();
  while (!f()) {
    if (performance.now() - t0 > maxMs) throw new Error(`d\xE9lai d\xE9pass\xE9 : ${quoi}`);
    await attendre(20);
  }
}
var mesurer = (m) => new Promise((r) => (attenteMesure = r, envoyer(m)));
async function autotest() {
  const JOURS = 30;
  for (const f of [
    4,
    4,
    4
  ]) camera.zoomerTout(f, camera.largeur / 2, camera.hauteur / 2), dessiner2();
  camera.vueEnsemble(), aRedessiner = true;
  const t0 = performance.now();
  await attendreQue(() => !!etat?.pret, 2e4, "partie pr\xEAte");
  const msPartie = Math.round(performance.now() - t0);
  const course = await mesurer({
    type: "avancer",
    heures: JOURS * 24
  });
  dernierAvis = "";
  envoyer({
    type: "acheter",
    produit: PRODUIT_CARBURANT,
    tonnes: 15e4
  });
  await attendreQue(() => dernierAvis !== "", 5e3, "achat");
  const achat = dernierAvis;
  const V = monde.villes, francaises = [];
  for (let i = 0; i < V.n && francaises.length < 12; i++) if (V.pays[i] === paysJoue) francaises.push(i);
  dernierAvis = "";
  envoyer({
    type: "construire",
    genre: 0,
    x: V.x[francaises[0]],
    y: V.y[francaises[0]]
  });
  await attendreQue(() => dernierAvis !== "", 5e3, "refus de pose");
  const refusPose = dernierAvis;
  let pose2 = "";
  for (const i of francaises) {
    dernierAvis = "";
    envoyer({
      type: "construire",
      genre: 3,
      x: V.x[i],
      y: V.y[i]
    });
    await attendreQue(() => dernierAvis !== "", 5e3, "pose d'une caserne");
    pose2 = dernierAvis;
    if (pose2.startsWith("Chantier lanc\xE9")) break;
  }
  dernierAvis = "";
  envoyer({
    type: "composer",
    depot: -1,
    soldats: 5e3,
    chars: 20,
    artillerie: 0,
    nom: "Autotest",
    x: V.x[francaises[1]],
    y: V.y[francaises[1]]
  });
  await attendreQue(() => dernierAvis !== "", 5e3, "table de mixage");
  const groupe = dernierAvis;
  dernierAvis = "";
  envoyer({
    type: "produire",
    unite: "chars",
    nombre: 1
  });
  await attendreQue(() => dernierAvis !== "", 5e3, "commande d'un char");
  const commande = dernierAvis;
  dernierAvis = "";
  envoyer({
    type: "pont",
    pont: 0,
    ordre: "detruire"
  });
  await attendreQue(() => dernierAvis !== "", 5e3, "ordre sur un pont");
  const pont = dernierAvis;
  await attendreQue(() => !!etat?.guerre?.forces, 5e3, "forces du pays");
  const aero = etat.guerre.forces.aeroports[0];
  dernierAvis = "";
  if (aero) envoyer({
    type: "aviation",
    aeroport: aero.site,
    ordre: "repos"
  });
  await attendreQue(() => dernierAvis !== "" || !aero, 5e3, "aviation au repos");
  const aviation = dernierAvis;
  dernierAvis = "";
  envoyer({
    type: "nucleaire",
    ordre: "tirer",
    x: V.x[0],
    y: V.y[0]
  });
  await attendreQue(() => dernierAvis !== "", 5e3, "tir nucl\xE9aire refus\xE9");
  const nucleaire = dernierAvis;
  const voisin = monde.villes.pays.find((p) => p !== paysJoue) ?? 0;
  dernierAvis = "";
  envoyer({
    type: "decret",
    decret: "paix",
    pays: voisin
  });
  await attendreQue(() => dernierAvis !== "", 5e3, "d\xE9cret de paix refus\xE9");
  const decret = dernierAvis;
  await mesurer({
    type: "avancer",
    heures: 24
  });
  const interfaceE1 = await essaiInterface();
  const avant = await mesurer({
    type: "empreinte"
  });
  const octets = await new Promise((r) => (attenteSauvegarde = r, envoyer({
    type: "sauvegarder",
    nom: "autotest"
  })));
  const taille = octets.byteLength;
  dernierAvis = "";
  envoyer({
    type: "charger",
    octets
  }, [
    octets.buffer
  ]);
  await attendreQue(() => dernierAvis !== "" && !!etat?.pret, 2e4, "rechargement");
  if (dernierAvis !== "Partie charg\xE9e.") throw new Error(`rechargement : ${dernierAvis}`);
  const apres = await mesurer({
    type: "empreinte"
  });
  envoyer({
    type: "vitesse",
    vitesse: 4
  });
  if (etat?.enPause) envoyer({
    type: "pause"
  });
  await attendre(300);
  const h0 = etat.heure, r0 = performance.now();
  await attendre(2e3);
  const pasReels = (etat.heure - h0) * 1e3 / (performance.now() - r0);
  envoyer({
    type: "pause"
  });
  const rv = await mesurerRendu();
  const recharge = apres.empreinteEtat === avant.empreinteEtat && apres.empreinte === avant.empreinte && apres.heure === JOURS * 24 + 24;
  const res = etat?.ressources ?? null;
  const batimentsOk = refusPose.includes("champ p\xE9trolier") && pose2.startsWith("Chantier lanc\xE9") && (res?.chantiers ?? 0) === 1;
  const groupesOk = groupe.includes("form\xE9") && groupe.includes("en route") && commande.startsWith("Commande") && (res?.groupes ?? 0) >= 1 && rv.groupes >= 1;
  const g = etat?.guerre ?? null;
  const airMerOk = aviation.includes("au repos") && nucleaire.includes("silo") && (g?.forces?.aeroports.length ?? 0) >= 1 && rv.tours >= 1;
  const dip = etat?.diplomatie ?? null;
  const diplomatieOk = !!dip && dip.allies.length > 0 && Array.isArray(dip.guerres) && dip.fin === null && /pas en guerre|Paix|refuse/.test(decret);
  const guerreOk = diplomatieOk && !!g && Array.isArray(g.enCours) && Array.isArray(g.termines) && g.tues >= 0 && pont.includes("canons") && airMerOk;
  const ressourcesOk = !!res && res.argent > 0 && res.gainHeure > 0 && achat.includes("en route") && batimentsOk && groupesOk && guerreOk;
  const horlogeOk = pasReels > 9.6 * 0.7 && pasReels < 9.6 * 1.3;
  rapport({
    ok: course.heures === JOURS * 24 && course.heure === JOURS * 24 && recharge && horlogeOk && rv.ok && ressourcesOk && interfaceE1.ok,
    interface: interfaceE1,
    jours: JOURS,
    pas: course.heures,
    msTotal: +course.ms.toFixed(1),
    msParPas: +course.msParPas.toFixed(4),
    sauvegardeOctets: taille,
    rechargeIdentique: recharge,
    pasParSecondeX4: +pasReels.toFixed(2),
    horlogeOk,
    msChargementCarte: Math.round(mesures.chargementMs),
    msPartiePrete: msPartie,
    texturesMo: +mesures.gpuMo.toFixed(1),
    msRendu: +msRendu.toFixed(2),
    pays: monde.pays.length,
    villes: monde.villes.n,
    rendu: rv,
    achat,
    refusPose,
    pose: pose2,
    batimentsOk,
    groupe,
    commande,
    groupesOk,
    pont,
    guerreOk,
    aviation,
    nucleaire,
    airMerOk,
    decret,
    diplomatieOk,
    diplomatie: dip && {
      allies: dip.allies.length,
      guerres: dip.guerres.length,
      monde: dip.nGuerres,
      propositions: dip.propositions.length
    },
    guerre: g && {
      enCours: g.enCours.length,
      termines: g.termines.length,
      total: g.total,
      zones: g.zones
    },
    ressources: res,
    couts: etat?.couts.map((c2) => `${c2.nom} ${c2.ms.toFixed(3)}`)
  });
}
async function essaiInterface() {
  const e = ecran, V = monde.villes;
  await attendreQue(() => !!e.cat, 5e3, "catalogue");
  const cat = e.cat;
  const armee = await demander({
    sujet: "armee"
  });
  if (armee?.sujet !== "armee" || !armee.depots.length) throw new Error("fiche arm\xE9e sans d\xE9p\xF4t");
  const d0 = armee.depots[0];
  const lieu = await demander({
    sujet: "lieu",
    x: d0.x,
    y: d0.y,
    km: 5
  });
  const depot = await demander({
    sujet: "depot",
    site: d0.site
  });
  let paris = 0;
  while (paris < V.n && V.noms[paris] !== "Paris") paris++;
  const pose2 = await demander({
    sujet: "pose",
    genre: 4,
    x: V.x[paris],
    y: V.y[paris]
  });
  const champs = await demander({
    sujet: "emplacements",
    genre: 0
  });
  const villes = await demander({
    sujet: "emplacements",
    genre: 4
  });
  e.ouvrirDepot(d0.site);
  await attendreQue(() => !!document.querySelector("#objet .dp-mix input[data-mix=soldats]"), 5e3, "panneau du d\xE9p\xF4t");
  e.mixer(d0.site, {
    soldats: 3e3,
    chars: 0,
    artillerie: 0,
    avions: 0,
    nom: "Table"
  });
  dernierAvis = "";
  document.querySelector("#objet [data-act=mix-former]").click();
  await attendreQue(() => dernierAvis !== "", 5e3, "groupe de la table de mixage");
  const mix = dernierAvis;
  e.basculerArmee();
  await attendreQue(() => !!document.querySelector("#armee .totaux"), 5e3, "page Arm\xE9e");
  e.basculerArmee();
  e.basculerGuerre("situation");
  const guerre = document.querySelector("#droite .onglets")?.textContent ?? "";
  e.basculerGuerre();
  e.ouvrirConstruire();
  const lignes = document.querySelectorAll("#objet [data-article]").length;
  e.ouvrirConstruire();
  const cases = document.querySelectorAll("#barre-bas .case[data-genre]").length;
  const ok = cat.batiments.length === 12 && cat.axes.length === 2 && cat.unites.length === 5 && cat.bombes.length === 5 && lieu?.sujet === "lieu" && lieu.site?.genre === 9 && depot?.sujet === "depot" && depot.presents.length === 3 && pose2?.sujet === "pose" && pose2.ok && champs?.sujet === "emplacements" && villes?.sujet === "emplacements" && villes.xy.length > 0 && mix.includes("form\xE9") && guerre.includes("D\xE9crets") && lignes === 13 && cases === 10;
  return {
    ok,
    batiments: cat.batiments.length,
    prixUsineChars: cat.batiments[4].argent,
    depots: armee.depots.length,
    usines: armee.usines.length,
    aeroports: armee.aeroports.length,
    lieu: lieu?.sujet === "lieu" ? lieu.site?.nom : null,
    pose: pose2?.sujet === "pose" ? pose2.ok : null,
    champsLibres: champs?.sujet === "emplacements" ? champs.xy.length / 2 : -1,
    villes: villes?.sujet === "emplacements" ? villes.xy.length / 2 : -1,
    mix,
    lignesConstruire: lignes,
    raccourcis: cases
  };
}
async function apercu(quoi) {
  const e = ecran, V = monde.villes;
  await attendreQue(() => !!etat?.pret && !!e.cat, 6e4, "partie pr\xEAte");
  const ville = (nom) => {
    let i = 0;
    while (i < V.n && V.noms[i] !== nom) i++;
    return i;
  };
  const centrer = (nom, echelle) => {
    const i = ville(nom);
    camera.cx = V.x[i], camera.cy = V.y[i];
    camera.zoomerTout(echelle / camera.echelle, camera.largeur / 2, camera.hauteur / 2);
    aRedessiner = true;
  };
  await mesurer({
    type: "avancer",
    heures: 30
  });
  const armee = await demander({
    sujet: "armee"
  });
  const d0 = armee?.sujet === "armee" ? armee.depots[0] : null;
  if (quoi === "guerre" || quoi === "combats" || quoi === "groupe") {
    const che = monde.pays.find((p) => p.iso3 === "CHE").id, b = ville("Gen\xE8ve");
    envoyer({
      type: "decret",
      decret: "guerre",
      pays: che
    });
    if (d0) envoyer({
      type: "composer",
      depot: d0.site,
      soldats: 2e4,
      chars: 150,
      artillerie: 12,
      nom: "1re arm\xE9e",
      x: V.x[b],
      y: V.y[b]
    });
    await mesurer({
      type: "avancer",
      heures: quoi === "groupe" ? 4 : 30
    });
  }
  switch (quoi) {
    case "jeu": {
      centrer("Paris", 0.35);
      e.ouvrirConstruire();
      e.commencerPose(4);
      const i = ville("Lyon"), [px, py] = camera.versEcran(V.x[i], V.y[i]);
      await attendre(1500);
      e.survol(V.x[i], V.y[i], px, py);
      break;
    }
    case "depot":
      centrer("Paris", 0.6);
      if (d0) {
        e.ouvrirDepot(d0.site);
        await attendre(800);
        e.mixer(d0.site, {
          soldats: 2e4,
          chars: 120,
          artillerie: 24,
          avions: 12,
          nom: "1re arm\xE9e"
        });
        e.ouvrirDepot(d0.site);
      }
      break;
    case "armee":
      centrer("Paris", 0.3);
      e.basculerArmee();
      break;
    case "guerre":
      centrer("Gen\xE8ve", 0.5);
      e.basculerGuerre("situation");
      break;
    case "combats": {
      centrer("Gen\xE8ve", 0.6);
      e.basculerCombats();
      if (!document.querySelector("#droite:not([hidden])")) e.basculerCombats();
      break;
    }
    case "groupe": {
      centrer("Gen\xE8ve", 0.4);
      const a = await demander({
        sujet: "armee"
      });
      const g = a?.sujet === "armee" ? a.groupes[0] : null;
      if (g) e.ouvrirGroupe(g.id);
      await attendre(800);
      const i = ville("Lausanne"), [px, py] = camera.versEcran(V.x[i], V.y[i]);
      e.clicDroitCarte(V.x[i], V.y[i], px, py);
      break;
    }
    case "flux":
      centrer("Paris", 0.25);
      e.changerVue("flux");
      break;
  }
  await attendre(2500);
  aRedessiner = true;
  await attendre(300);
  document.body.dataset.fini = "1";
}
async function mesurerRendu() {
  await attendreQue(() => !!flux?.dernier && flux.dernier.heure === etat?.heure, 2e4, "rendu des flux");
  const f = flux, r = f.dernier;
  const gl = rendu.gl;
  const vues = [
    [
      "Monde",
      0
    ],
    [
      "Paris",
      0.3
    ],
    [
      "Paris",
      2
    ],
    [
      "Kharkiv",
      1
    ]
  ];
  const ms = {};
  for (const [nom, e] of vues) {
    if (nom === "Monde") camera.vueEnsemble();
    else {
      const i = monde.villes.noms.indexOf(nom);
      camera.cx = monde.villes.x[i], camera.cy = monde.villes.y[i];
      camera.zoomerTout(e / camera.echelle, camera.largeur / 2, camera.hauteur / 2);
    }
    dessiner2();
    gl.finish();
    const t0 = performance.now();
    for (let k = 0; k < 30; k++) dessiner2(), gl.finish();
    ms[`${nom}@${e}`] = +((performance.now() - t0) / 30).toFixed(2);
  }
  camera.vueEnsemble(), aRedessiner = true;
  f.dessiner(camera, ratio(), canevas.width, canevas.height, r.heure);
  const avant = Float32Array.from(f.posBilles.subarray(0, 2 * r.billes.n));
  f.dessiner(camera, ratio(), canevas.width, canevas.height, r.heure + 0.5);
  const bouge = avant.some((v, i) => v !== f.posBilles[i]);
  return {
    ok: r.billes.n >= (ESSAI ? 5e3 : 100) && bouge,
    billes: r.billes.n,
    groupes: r.groupes.n,
    tours: r.tours.n,
    batiments: r.batiments.n,
    trajets: f.trajets.n,
    segmentsAxes: f.nSegments,
    segmentsMer: f.nSegmentsMer,
    appels: appelsDessin,
    msImage: ms,
    msCollecteSim: +(etat?.msRendu ?? 0).toFixed(3),
    interpolation: bouge
  };
}
demarrer();
