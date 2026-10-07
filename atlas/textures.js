// ============ Texture de la roche (C.3) : schéma d'une surface polie ou d'une vue au microscope ============
// Chargé après formation.js et avant app.js. API : Textures.panneau(roche) → HTML | null ;
// Textures.tirage(roche) → { mesure, … } (contrôles) ; Textures.MODES (liste des grandes textures).
//
// Parti pris (validé sur le granite le 17/09/2026) : planche de manuel en APLATS NETS. Un cristal ou un grain = un
// polygone simple, les éléments sont jointifs ou posés sur un fond uni (pâte, verre, ciment), rien ne se chevauche
// à l'œil ni ne dépasse du cadre. Chaque minéral se reconnaît à sa forme + UNE marque (`HABITUS`). Abréviations des
// minéraux : Whitney et Evans (2010). Tirage reproductible (graine = id de la roche).
//
// Une roche = `TEXTURES_ROCHE[id] = { mode, champ: largeur en mm, vue, …réglages du mode }` ; chaque mode
// (`MODES[nom]`) renvoie { corps (SVG en coordonnées du champ 420 × 252), reperes, legende, mesure }.
(function () {
  "use strict";

  const Wp = 420, Hp = 252, PAS = 2, BORD = "#3b3f3c";
  let uid = 0;
  const nid = (p) => `${p}${++uid}`;
  const r1 = (x) => Math.round(x * 10) / 10;
  const pts2 = (pts) => pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
  const poly = (pts, fill, o = "") => `<polygon points="${pts2(pts)}" fill="${fill}"${o}/>`;
  const trait = (x1, y1, x2, y2, c, w, o = "") => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${o}/>`;
  const contour = (w = 0.8) => ` stroke="${BORD}" stroke-width="${w}" stroke-linejoin="round"`;
  // élément identifié pour l'infobulle : `k` = clé de mesure (minéral, « pate », « liant »…), lue au survol
  const tg = (k, svg) => (k == null ? svg : `<g data-k="${k}">${svg}</g>`);
  const fondRect = (k, fill) => tg(k, `<rect x="-2" y="-2" width="${Wp + 4}" height="${Hp + 4}" fill="${fill}"/>`);

  function alea(graine) {
    let a = 0;
    for (const c of String(graine)) a = (a * 31 + c.charCodeAt(0)) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const entre = (R, [a, b]) => a + R() * (b - a);

  // ─────────────────────────────── géométrie ───────────────────────────────
  function rectOriente(cx, cy, L, l, ang, biseau = 0) {
    const c = Math.cos(ang), s = Math.sin(ang), b = biseau * Math.min(L, l), a = L / 2, e = l / 2;
    const loc = b > 0
      ? [[-a + b, -e], [a - b, -e], [a, -e + b], [a, e - b], [a - b, e], [-a + b, e], [-a, e - b], [-a, -e + b]]
      : [[-a, -e], [a, -e], [a, e], [-a, e]];
    return loc.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
  }
  // polygone régulier étiré (hexagone, octogone…) : rx le long de ang, ry en travers
  function polyRegulier(cx, cy, rx, ry, ang, k, dephase = 0) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return Array.from({ length: k }, (_, i) => {
      const t = dephase + i * 2 * Math.PI / k, x = Math.cos(t) * rx, y = Math.sin(t) * ry;
      return [cx + x * c - y * s, cy + x * s + y * c];
    });
  }
  // polygone convexe irrégulier inscrit dans une ellipse (grains, clastes)
  function polyIrregulier(cx, cy, rx, ry, ang, k, R, irreg = 0.35) {
    const pas = 2 * Math.PI / k, c = Math.cos(ang), s = Math.sin(ang), out = [];
    const t0 = R() * pas;
    for (let i = 0; i < k; i++) {
      const t = t0 + i * pas + (R() - 0.5) * pas * irreg, d = 1 - R() * irreg * 0.35;
      const x = Math.cos(t) * rx * d, y = Math.sin(t) * ry * d;
      out.push([cx + x * c - y * s, cy + x * s + y * c]);
    }
    return out;
  }
  // contour lissé (grains arrondis) : courbes quadratiques passant par les milieux des côtés
  function cheminLisse(pts) {
    const n = pts.length, mil = (i) => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
    let d = `M${r1(mil(n - 1)[0])},${r1(mil(n - 1)[1])}`;
    for (let i = 0; i < n; i++) { const m = mil(i); d += ` Q${r1(pts[i][0])},${r1(pts[i][1])} ${r1(m[0])},${r1(m[1])}`; }
    return d + "Z";
  }
  // même contour lissé, échantillonné en points (pour mesurer exactement la surface dessinée)
  function lissePoints(pts, n = 4) {
    const k = pts.length, mil = (i) => [(pts[i][0] + pts[(i + 1) % k][0]) / 2, (pts[i][1] + pts[(i + 1) % k][1]) / 2], out = [];
    for (let i = 0; i < k; i++) {
      const a = mil((i - 1 + k) % k), c = pts[i], b = mil(i);
      for (let j = 0; j < n; j++) { const u = j / n; out.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]); }
    }
    return out;
  }
  function dansPoly(x, y, pts) {
    let dedans = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
    }
    return dedans;
  }
  function demiPlan(pts, ax, ay, nx, ny) {
    const f = ([x, y]) => (x - ax) * nx + (y - ay) * ny, out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], fp = f(p), fq = f(q);
      if (fp <= 0) out.push(p);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    }
    return out;
  }
  const aire = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [u, v] = pts[(i + 1) % pts.length]; return s + x * v - u * y; }, 0)) / 2;
  const centre = (pts) => {
    let A = 0, cx = 0, cy = 0;
    pts.forEach(([x, y], i) => { const [u, v] = pts[(i + 1) % pts.length], k = x * v - u * y; A += k; cx += (x + u) * k; cy += (y + v) * k; });
    return Math.abs(A) < 1e-9 ? pts[0] : [cx / (3 * A), cy / (3 * A)];
  };
  // cellules de Voronoï dans le rectangle `cadre` ; sx > 1 étire les cellules selon x (grains aplatis par la foliation)
  function voronoi(germes, sx = 1, cadre = [[-1, -1], [Wp + 1, -1], [Wp + 1, Hp + 1], [-1, Hp + 1]]) {
    const G = germes.map((g) => [g.x / sx, g.y]), C = cadre.map(([x, y]) => [x / sx, y]);
    return G.map((g, i) => {
      // voisins du plus proche au plus lointain ; un germe plus loin que 2 × le rayon actuel de la cellule ne la coupe plus
      const voisins = G.map((o, j) => [(o[0] - g[0]) ** 2 + (o[1] - g[1]) ** 2, j]).filter(([, j]) => j !== i).sort((a, b) => a[0] - b[0]);
      let p = C;
      for (const [d2, j] of voisins) {
        if (p.length < 3) break;
        const r2 = Math.max(...p.map(([x, y]) => (x - g[0]) ** 2 + (y - g[1]) ** 2));
        if (d2 > 4 * r2) break;
        const o = G[j];
        p = demiPlan(p, (g[0] + o[0]) / 2, (g[1] + o[1]) / 2, o[0] - g[0], o[1] - g[1]);
      }
      return p.map(([x, y]) => [x * sx, y]);
    });
  }
  // germes espacés d'au moins d (tirage de Poisson) dans une zone acceptée par ok(x, y)
  function germesPoisson(R, d, ok = () => true, essais = 4000) {
    const out = [], d2 = d * d;
    for (let i = 0; i < essais; i++) {
      const x = R() * Wp, y = R() * Hp;
      if (ok(x, y) && out.every((g) => (g.x - x) ** 2 + (g.y - y) ** 2 >= d2)) out.push({ x, y });
    }
    return out;
  }
  // relaxation de Lloyd : grains équants, jonctions triples proches de 120° (texture en mosaïque)
  function lloyd(germes, n, sx = 1) {
    let g = germes;
    for (let k = 0; k < n; k++) g = voronoi(g, sx).map((c, i) => c.length > 2 ? { ...g[i], x: centre(c)[0], y: centre(c)[1] } : g[i]);
    return g;
  }

  // ─────────────────────── grille d'occupation (mesure des surfaces) ───────────────────────
  function Grille() {
    const nx = Math.ceil(Wp / PAS), ny = Math.ceil(Hp / PAS), N = nx * ny, g = new Int32Array(N).fill(-1);
    const cellules = (pts) => {
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), out = [];
      const i0 = Math.max(0, Math.floor(Math.min(...xs) / PAS)), i1 = Math.min(nx - 1, Math.floor(Math.max(...xs) / PAS));
      const j0 = Math.max(0, Math.floor(Math.min(...ys) / PAS)), j1 = Math.min(ny - 1, Math.floor(Math.max(...ys) / PAS));
      // remplissage par lignes (règle pair-impair, comme dansPoly) : croisements du polygone avec chaque ligne de centres
      const n = pts.length, xs2 = [];
      for (let j = j0; j <= j1; j++) {
        const y = (j + 0.5) * PAS;
        xs2.length = 0;
        for (let a = 0, b = n - 1; a < n; b = a++) {
          const [xa, ya] = pts[a], [xb, yb] = pts[b];
          if ((ya > y) !== (yb > y)) xs2.push(xa + (y - ya) * (xb - xa) / (yb - ya));
        }
        xs2.sort((u, v) => u - v);
        for (let k = 0; k + 1 < xs2.length; k += 2) {
          // centres (i + 0,5) × PAS strictement à l'intérieur de [xs2[k], xs2[k+1]]
          const ia = Math.max(i0, Math.ceil(xs2[k] / PAS - 0.5)), ib = Math.min(i1, Math.ceil(xs2[k + 1] / PAS - 0.5) - 1);
          for (let i = ia; i <= ib; i++) out.push(j * nx + i);
        }
      }
      return out;
    };
    const lire = (x, y) => (x < 0 || y < 0 || x >= Wp || y >= Hp) ? -2 : g[Math.floor(y / PAS) * nx + Math.floor(x / PAS)];
    const xy = (c) => [(c % nx + 0.5) * PAS, (Math.floor(c / nx) + 0.5) * PAS];
    return { nx, ny, N, g, cellules, lire, xy };
  }
  // cellules libres d'un élément si sa part déjà occupée ne dépasse pas `chevauche` (et s'il est surtout dans le
  // cadre), sinon null ; `poser` les marque en plus au numéro n
  function tester(G, pts, chevauche = 0, horsCadre = 0.5) {
    const cel = G.cellules(pts);
    if (cel.length === 0 || cel.length < horsCadre * aire(pts) / (PAS * PAS)) return null;
    const libres = cel.filter((c) => G.g[c] < 0);
    return cel.length - libres.length > chevauche * cel.length ? null : libres;
  }
  function poser(G, pts, n, chevauche = 0, horsCadre = 0.5) {
    const libres = tester(G, pts, chevauche, horsCadre);
    if (libres) libres.forEach((c) => { G.g[c] = n; });
    return libres;
  }

  // ─────────────────────────────── aspect des minéraux ───────────────────────────────
  // fond, marque (voir `marque`), rôle court pour la légende. Pour un minéral absent : couleur de MINERAUX, sans marque.
  const HABITUS = {
    quartz: { ab: "Qz", fond: "#c7cbc9", fonds: ["#c7cbc9", "#bfc4c2", "#cdd0cd"], role: "gris vitreux, sans forme propre" },
    orthose: { ab: "Or", fond: "#e8b8a0", ombre: "#dca58b", marque: "carlsbad", role: "grands cristaux roses, en deux moitiés" },
    sanidine: { ab: "Sa", fond: "#eceee6", ombre: "#dde0d6", marque: "carlsbad", role: "cristaux limpides, en deux moitiés" },
    plagioclases: { ab: "Pl", fond: "#f5f2ea", trait: "#b9b2a2", marque: "polysynthetique", role: "tablettes blanches striées" },
    albite: { ab: "Ab", fond: "#f5f2ea", trait: "#b9b2a2", marque: "polysynthetique", role: "tablettes blanches striées" },
    biotite: { ab: "Bt", fond: "#2f2a27", trait: "#8c7a6a", marque: "clivage", role: "paillettes noires" },
    muscovite: { ab: "Ms", fond: "#ddd6bb", trait: "#a79f84", marque: "clivage", role: "paillettes argentées" },
    hornblende: { ab: "Hbl", fond: "#3e5540", trait: "#8aa38b", marque: "clivage2", role: "prismes vert sombre, clivages en losange" },
    amphiboles: { ab: "Amp", fond: "#3e5540", trait: "#8aa38b", marque: "clivage2", role: "prismes vert sombre" },
    pyroxenes: { ab: "Px", fond: "#7d8f55", trait: "#c3cf9f", marque: "croix", role: "prismes verts trapus, clivages en croix" },
    augite: { ab: "Aug", fond: "#6f7f4a", trait: "#bcc79a", marque: "croix", role: "prismes verts trapus, clivages en croix" },
    olivine: { ab: "Ol", fond: "#c3cc6a", trait: "#8b9442", marque: "fractures", role: "grains vert-jaune craquelés" },
    magnetite: { ab: "Mag", fond: "#1d1d1f", role: "petits grains noirs opaques" },
    grenat: { ab: "Grt", fond: "#b4454f", trait: "#7e2a33", marque: "inclusions", role: "gros cristaux rouges arrondis" },
    calcite: { ab: "Cal", fond: "#f1ece0", trait: "#cbbfa6", marque: "macles", role: "grains blancs à macles obliques" },
    dolomite: { ab: "Dol", fond: "#e6d8bb", trait: "#c1ae88", marque: "macles", role: "grains beiges" },
    chlorite_m: { ab: "Chl", fond: "#86a77e", trait: "#5d7f57", marque: "clivage", role: "paillettes vertes" },
    illite_m: { ab: "Ill", fond: "#9c8f7b", role: "argile brun-gris, très fine" },
    goethite: { ab: "Gth", fond: "#b8742f", role: "enduit brun-rouille" },
    calcedoine: { ab: "Chc", fond: "#dcd6c4", role: "silice fibreuse" },
    verre: { ab: "Vrr", fond: "#3a3836", role: "verre" },
    // ajoutés pour l'étape 3 (abréviations Whitney et Evans 2010)
    nepheline: { ab: "Nph", fond: "#e3ddcf", role: "sections à six côtés, grises et grasses" },
    aegyrine: { ab: "Aeg", fond: "#3f5a33", trait: "#86a372", marque: "croix", role: "prismes vert foncé" },
    arfvedsonite: { ab: "Arf", fond: "#2f3a3a", trait: "#7f9494", marque: "clivage2", role: "prismes bleu-noir" },
    titanite: { ab: "Ttn", fond: "#b58a4a", role: "petits losanges bruns" },
    apatite: { ab: "Ap", fond: "#d9e2d6", role: "petits prismes clairs" },
    enstatite: { ab: "En", fond: "#8c8a5c", trait: "#c6c49b", marque: "croix", role: "prismes brun-vert" },
    diopside: { ab: "Di", fond: "#8fae6d", trait: "#c9dcb4", marque: "croix", role: "prismes vert clair" },
    omphacite: { ab: "Omp", fond: "#6f9a5a", trait: "#b3d19f", marque: "croix", role: "prismes vert franc" },
    actinote: { ab: "Act", fond: "#7fa36e", trait: "#bcd5ae", marque: "clivage2", role: "aiguilles vertes" },
    glaucophane: { ab: "Gln", fond: "#4f6f9e", trait: "#9db3d6", marque: "clivage2", role: "prismes bleus" },
    epidote: { ab: "Ep", fond: "#b8b64a", trait: "#8a8830", marque: "fractures", role: "grains vert pistache" },
    lawsonite: { ab: "Lws", fond: "#e9ecf0", role: "tablettes blanches" },
    serpentine: { ab: "Srp", fond: "#7e9b63", role: "fibres vert sombre" },
    phlogopite: { ab: "Phl", fond: "#a27b45", trait: "#d2b184", marque: "clivage", role: "paillettes brun doré" },
    zinnwaldite: { ab: "Znw", fond: "#b9a88a", trait: "#8c7c62", marque: "clivage", role: "paillettes gris-brun" },
    chromite: { ab: "Chr", fond: "#1d1d1f", role: "petits grains noirs" },
    rutile: { ab: "Rt", fond: "#8a3b1f", role: "petits prismes rouge-brun" },
    pyrite: { ab: "Py", fond: "#c9b04a", role: "petits cubes dorés" },
    hematite: { ab: "Hem", fond: "#8c3b2e", role: "grains rouge sombre" },
    siderite: { ab: "Sd", fond: "#b39463", role: "grains beige-brun" },
    disthene: { ab: "Ky", fond: "#9fb7d9", trait: "#6f88ad", marque: "clivage", role: "lattes bleutées" },
    sillimanite: { ab: "Sil", fond: "#e7e2d6", trait: "#b9b1a0", marque: "clivage", role: "fines aiguilles" },
    andalousite: { ab: "And", fond: "#d9b4a8", trait: "#3b2f2c", marque: "chiastolite", role: "prismes carrés rosés, croix sombre (chiastolite)" },
    cordierite: { ab: "Crd", fond: "#bcc3d6", role: "grains gris-bleu" },
    grossulaire: { ab: "Grs", fond: "#c9a95d", trait: "#96783a", marque: "inclusions", role: "cristaux jaune-brun" },
    andradite: { ab: "Adr", fond: "#8a5a32", trait: "#5f3c1f", marque: "inclusions", role: "cristaux brun-rouge" },
    vesuvianite: { ab: "Ves", fond: "#8a8a4a", role: "prismes brun-vert" },
    wollastonite: { ab: "Wo", fond: "#f0ede4", trait: "#c8c1b0", marque: "clivage", role: "lattes blanches" },
    topaze: { ab: "Tpz", fond: "#e6dcb8", role: "grains jaune pâle" },
    fluorine: { ab: "Fl", fond: "#a996c9", role: "grains violets" },
    cassiterite: { ab: "Cst", fond: "#4a3a2e", role: "grains brun-noir" },
    tourmaline: { ab: "Tur", fond: "#232326", trait: "#5b5b61", marque: "fractures", role: "prismes noirs striés" },
    beryl: { ab: "Brl", fond: "#b9d6c8", role: "prismes vert d'eau à six côtés" },
    pyrochlore: { ab: "Pcl", fond: "#6a4a2a", role: "petits octaèdres bruns" },
    hauyne: { ab: "Hyn", fond: "#5d7fb8", role: "grains bleus" },
    graphite: { ab: "Gr", fond: "#2a2a2c", role: "paillettes noires" },
    kaolinite_m: { ab: "Kln", fond: "#e9e2d2", role: "argile blanche" },
    smectites_m: { ab: "Sme", fond: "#a8a08a", role: "argile gonflante" },
    glauconie: { ab: "Glt", fond: "#5d8a4f", role: "grains verts arrondis" },
    opale: { ab: "Opl", fond: "#e6e1d6", role: "silice amorphe" },
    halite_m: { ab: "Hl", fond: "#f1f1ee", role: "cubes limpides" },
    sylvite: { ab: "Syl", fond: "#e8b8a8", role: "cubes rosés à rouges" },
    gypse_m: { ab: "Gp", fond: "#ece6d8", trait: "#c5bca8", marque: "clivage", role: "cristaux clairs" },
    anhydrite: { ab: "Anh", fond: "#e3e0ea", trait: "#b9b4c6", marque: "croix", role: "cristaux à clivages en croix" },
    aragonite: { ab: "Arg", fond: "#f6f1e6", role: "calcaire des coquilles" },
    gibbsite: { ab: "Gbs", fond: "#e6dcc8", role: "hydroxyde d'aluminium" },
    matorg: { ab: "MO", fond: "#2b2420", role: "matière organique" },
  };
  function hab(mid) {
    if (HABITUS[mid]) return HABITUS[mid];
    const m = (typeof MINERAUX !== "undefined" && MINERAUX[mid]) || {};
    return { ab: (m.nom || mid).slice(0, 3), fond: m.swatch || "#999", role: "" };
  }
  // nom affiché : celui de la fiche minéral ; `HABITUS[id].nom` pour une espèce sans fiche dans l'atlas (kaïnite, mélilite…)
  const nomMin = (mid) => ((HABITUS[mid] && HABITUS[mid].nom) || (typeof MINERAUX !== "undefined" && MINERAUX[mid] && MINERAUX[mid].nom) || mid).split(" (")[0];
  const partMin = (roche, mid) => {
    const l = roche.mineraux || [], tot = l.reduce((s, [, p]) => s + p, 0) || 1;
    return ((l.find(([m]) => m === mid) || [0, 0])[1]) / tot;
  };
  // ligne de légende : `cle` = clé de sa surface mesurée (le pourcentage affiché est calculé dans panneau())
  const ligne = (roche, mid, role, cle = mid) => { const h = hab(mid); return { ab: h.ab, nom: nomMin(mid), cle, role: role ?? h.role, couleur: h.fond }; };
  // clé de mesure → minéral de la fiche (pour détailler le contenu d'une pâte, d'un ciment, d'une matrice)
  const EQUIV = { ponces: "verre", coquille: "calcite", entroque: "calcite", foraminifere: "calcite", oolithe: "calcite", queues: null,
    radiolaire: "calcedoine", diatomee: "opale", spicule: "calcedoine", pisolithe: null, debris: "matorg", nodule: null,
    vacuoles: null, pores: null, pate: null, cendre: null, liant: null, fond: null, cristallites: null, fine: null };
  const minDe = (cle) => { const k = String(cle).split(":").pop(); return k in EQUIV ? EQUIV[k] : k; };

  // marque propre au minéral, dans le repère du cristal (centre cx, cy, angle ang, longueur L, largeur l), coupée au contour
  function marque(h, forme, cx, cy, ang, L, l, R, o = {}) {
    const LL = L + 6, ll = l + 6;
    let s = "";
    switch (o.basal ? "" : h.marque) {
      case "polysynthetique":
        for (let y = -ll / 2 + 1.6 + R() * 1.2; y < ll / 2; y += 2.2 + R() * 2.2) s += trait(-LL / 2, y, LL / 2, y, h.trait, 0.6);
        break;
      case "carlsbad": {
        const dy = (R() - 0.5) * l * 0.25;
        s += `<rect x="${r1(-LL / 2)}" y="${r1(dy)}" width="${r1(LL)}" height="${r1(ll)}" fill="${h.ombre}"/>` + trait(-LL / 2, dy, LL / 2, dy, "#8f8a80", 0.6, ' stroke-opacity=".6"');
        break;
      }
      case "clivage":
        for (let y = -l / 2 + 1.3; y < l / 2 - 0.8; y += 1.6) s += trait(-LL / 2, y, LL / 2, y, h.trait, 0.5);
        break;
      case "clivage2": // amphiboles : deux clivages à 124°, vus en travers comme un losange
      case "croix": {  // pyroxènes : deux clivages à 87°, presque en croix
        const a = h.marque === "clivage2" ? 28 : 45, e = Math.max(3, Math.min(L, l) / 3);
        for (const sg of [1, -1]) {
          const t = sg * a * Math.PI / 180, dx = Math.cos(t), dy = Math.sin(t);
          for (let k = -4; k <= 4; k++) {
            const ox = -dy * k * e, oy = dx * k * e;
            s += trait(ox - dx * LL, oy - dy * LL, ox + dx * LL, oy + dy * LL, h.trait, 0.5);
          }
        }
        break;
      }
      case "fractures":
        for (let k = 0; k < 2; k++) {
          const y0 = (R() - 0.5) * l * 0.8, x0 = -L / 2 - 2;
          s += `<path d="M${r1(x0)},${r1(y0)} Q${r1((R() - 0.5) * L * 0.4)},${r1(y0 + (R() - 0.5) * l)} ${r1(L / 2 + 2)},${r1((R() - 0.5) * l * 0.8)}" fill="none" stroke="${h.trait}" stroke-width="0.7"/>`;
        }
        break;
      case "macles": // calcite : lamelles de macle obliques, suivant le rhomboèdre
        for (let y = -ll - LL * 0.5; y < ll + LL * 0.5; y += 4 + R() * 5) s += trait(-LL, y - LL * 0.5, LL, y + LL * 0.5, h.trait, 0.6);
        break;
      case "chiastolite": // inclusions de carbone rangées en croix d'un coin à l'autre de la section carrée
        s += trait(-L * 0.5, 0, L * 0.5, 0, h.trait, Math.max(1, l * 0.1)) + trait(0, -l * 0.5, 0, l * 0.5, h.trait, Math.max(1, l * 0.1));
        break;
      case "inclusions":
        for (let k = 0; k < 4; k++) s += `<circle cx="${r1((R() - 0.5) * L * 0.6)}" cy="${r1((R() - 0.5) * l * 0.6)}" r="${r1(0.6 + R() * 0.7)}" fill="${h.trait}"/>`;
        break;
      default:
    }
    if (!s) return "";
    const k = nid("txm"), clip = forme.d ? `<path d="${forme.d}"/>` : `<polygon points="${pts2(forme.pts)}"/>`;
    return `<clipPath id="${k}">${clip}</clipPath><g clip-path="url(#${k})"><g transform="translate(${r1(cx)} ${r1(cy)}) rotate(${r1(ang * 180 / Math.PI)})">${s}</g></g>`;
  }
  // un cristal complet : aplat + marque + contour
  function cristalSVG(c, R, w = 0.9) {
    return tg(c.cle || c.min, poly(c.pts, c.h.fond) + marque(c.h, c, c.cx, c.cy, c.ang, c.L, c.l, R, c) + poly(c.pts, "none", contour(w)));
  }
  // repère : le plus gros élément bien visible d'une liste
  function repereSur(G, items, ab, marge = 30) {
    const visible = (c) => c.n == null || G.lire(c.cx, c.cy) === c.n;
    const tri = (l) => l.sort((a, b) => (b.cel || 0) - (a.cel || 0))[0];
    // de préférence loin des bords ; à défaut (gros cristaux), n'importe quel élément dont le centre est dans le cadre
    const ok = tri(items.filter((c) => c.cx > marge && c.cx < Wp - marge && c.cy > 24 && c.cy < Hp - 34 && visible(c)))
      || tri(items.filter((c) => c.cx > 12 && c.cx < Wp - 12 && c.cy > 12 && c.cy < Hp - 12 && visible(c)));
    return ok ? { ab, x: ok.cx, y: ok.cy, petit: Math.min(ok.L, ok.l) < 18 } : null;
  }

  // ─────────────────────────────── MODES ───────────────────────────────
  const MODES = {};

  // GRENUE (plutoniques) : cristaux posés dans l'ordre de cristallisation ; les plus tardifs passent sous les premiers
  // (jusqu'à `chevauche` de leur surface) et le dernier minéral remplit les vides en grains de Voronoï.
  MODES.grenue = function (roche, t, K, R) {
    const G = Grille(), cristaux = [];
    t.ordre.forEach((o, rang) => {
      if (o.espacement) return;
      // `frac` : part du minéral posée en cristaux automorphes, le reste va au remplissage final (`remplit`)
      const h = hab(o.min), cible = partMin(roche, o.min) * (o.frac ?? 1) * G.N;
      let acquis = 0, echecs = 0;
      for (let essai = 0; essai < 5000 && acquis < cible && echecs < 700; essai++, echecs++) {
        const L = entre(R, o.taille) * K, l = L / entre(R, o.allong);
        const freres = cristaux.filter((c) => c.min === o.min);
        let cx, cy;
        if (o.amas && freres.length && R() < o.amas) {
          const f = freres[Math.floor(R() * freres.length)];
          cx = f.cx + (R() - 0.5) * 3.5 * K * (o.taille[1] / 2.6); cy = f.cy + (R() - 0.5) * 3.5 * K * (o.taille[1] / 2.6);
        } else { cx = -0.05 * Wp + R() * 1.1 * Wp; cy = -0.05 * Hp + R() * 1.1 * Hp; }
        if ((o.chevauche ?? 0) < 0.1 && G.lire(cx, cy) >= 0) continue;       // centre déjà pris
        const ang = o.angle != null ? o.angle + (R() - 0.5) * (o.dispersion || 0) : R() * Math.PI;
        // un mica est TOUJOURS dessiné en paillette (l'hexagone du mica coupé à plat a été retiré le 06/10/2026 :
        // seul au milieu des paillettes, il ne se lisait pas comme un mica)
        const pts = o.sections ? polyRegulier(cx, cy, L / 2, l / 2, ang, o.sections, Math.PI / o.sections)
          : rectOriente(cx, cy, L, l, ang, o.biseau || 0);
        const libres = tester(G, pts, o.chevauche);
        if (!libres || (acquis > 0 && acquis + libres.length - cible > 0.5 * libres.length)) continue;   // ne pas trop dépasser
        libres.forEach((c) => { G.g[c] = cristaux.length; });
        cristaux.push({ min: o.min, h, rang, n: cristaux.length, pts, cx, cy, L, l, ang, cel: libres.length });
        acquis += libres.length; echecs = 0;
      }
    });
    const oq = t.ordre.find((o) => o.espacement);
    const vides = [];
    for (let c = 0; c < G.N; c++) if (G.g[c] < 0) vides.push(c);
    for (let i = vides.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [vides[i], vides[j]] = [vides[j], vides[i]]; }
    const d2 = (oq.espacement * K) ** 2, germes = [];
    vides.forEach((c) => { const [x, y] = G.xy(c); if (germes.every((g) => (g.x - x) ** 2 + (g.y - y) ** 2 >= d2)) germes.push({ x, y, cel: 0 }); });
    vides.forEach((c) => {
      const [x, y] = G.xy(c);
      let best = 0, bd = Infinity;
      germes.forEach((g, k) => { const dd = (g.x - x) ** 2 + (g.y - y) ** 2; if (dd < bd) { bd = dd; best = k; } });
      germes[best].cel++;
    });
    const cellules = voronoi(germes);
    // remplissage : un ou plusieurs minéraux (`remplit`), chacun à hauteur de ce qui lui manque par rapport à la fiche
    const remplis = oq.remplit || [oq.min];
    const pose = {};
    cristaux.forEach((c) => { pose[c.min] = (pose[c.min] || 0) + c.cel / G.N; });
    const besoin = remplis.map((m) => Math.max(0, partMin(roche, m) - (pose[m] || 0)));
    const sb = besoin.reduce((a, b) => a + b, 0) || 1;
    const reste = besoin.map((b) => b / sb * vides.length);
    const ordreCel = germes.map((g, k) => k).sort((a, b) => germes[b].cel - germes[a].cel);
    ordreCel.forEach((k) => {
      const j = reste.map((v, jj) => [v / (besoin[jj] || 1e-9) * (besoin[jj] > 0 ? 1 : -1e9), jj]).sort((a, b) => b[0] - a[0])[0][1];
      germes[k].min = remplis[j]; reste[j] -= germes[k].cel;
    });
    let corps = cellules.map((p, i) => {
      const g = germes[i], hq = hab(g.min), fonds = hq.fonds || [hq.fond];
      const c = { pts: p, cx: g.x, cy: g.y };
      return tg(g.min, poly(p, fonds[i % fonds.length], contour(0.7)) + (hq.marque === "polysynthetique" || hq.marque === "macles" ? marque(hq, c, g.x, g.y, R() * 3.14, 60, 30, R) : ""));
    }).join("");
    corps += cristaux.slice().sort((a, b) => b.rang - a.rang || b.n - a.n).map((c) => cristalSVG(c, R)).join("");

    const mesure = {};
    germes.forEach((g) => { mesure[g.min] = (mesure[g.min] || 0) + g.cel / G.N; });
    cristaux.forEach((c) => { mesure[c.min] = (mesure[c.min] || 0) + c.cel / G.N; });
    const vus = new Set();
    const reperes = t.ordre.flatMap((o) => o.espacement
      ? remplis.filter((m) => !t.ordre.some((x) => !x.espacement && x.min === m)).map((m) =>
        repereSur(G, germes.filter((g) => g.min === m).map((g) => ({ cx: g.x, cy: g.y, L: 40, l: 40, cel: g.cel, n: -1 })), hab(m).ab))
      : [repereSur(G, cristaux.filter((c) => c.min === o.min), hab(o.min).ab)]);
    const groupes = t.temps.map((titre, i) => ({ titre, lignes: t.ordre.filter((o) => o.temps === i + 1)
      .flatMap((o) => (o.espacement ? remplis.map((m) => ({ min: m, role: m === oq.min ? o.role : null })) : [o]))
      .filter((o) => !vus.has(o.min) && vus.add(o.min))
      .map((o) => ligne(roche, o.min, o.role || undefined)) })).filter((g) => g.lignes.length);
    return { corps, reperes, legende: { titre: t.titreLegende || "Ordre de cristallisation", groupes }, mesure };
  };

  // (les autres modes sont ajoutés plus bas)
  // ── outils communs aux modes « objets posés sur un fond » ──
  // fond moucheté (pâte microgrenue, cendre, ciment) : motif répété de petites taches aux couleurs données
  function fondMouchete(fond, taches, pas, R, rayon = [0.5, 1.1]) {
    // tuile de 12 × 12 cases, taches tirées au hasard (pas de quadrillage visible)
    const k = nid("txp"), T = pas * 12;
    let s = `<pattern id="${k}" patternUnits="userSpaceOnUse" width="${T}" height="${T}"><rect width="${T}" height="${T}" fill="${fond}"/>`;
    for (let i = 0; i < 12 * 12 * 0.55; i++) {
      const x = R() * T, y = R() * T, r = entre(R, rayon), c = taches[Math.floor(R() * taches.length)];
      for (const [dx, dy] of [[0, 0], [T, 0], [0, T], [T, T], [-T, 0], [0, -T], [-T, -T], [T, -T], [-T, T]]) {
        const u = x + dx, v = y + dy;
        if (u > -r && u < T + r && v > -r && v < T + r) s += `<circle cx="${r1(u)}" cy="${r1(v)}" r="${r1(r)}" fill="${c}"/>`;
      }
    }
    return { defs: s + "</pattern>", fill: `url(#${k})` };
  }
  // cristal cassé (fragments pyroclastiques, clastes) : coupé par 1 à 2 plans passant près du centre
  function casser(pts, cx, cy, R, n = 2) {
    let p = pts;
    for (let k = 0; k < n; k++) {
      const a = R() * 2 * Math.PI, d = (0.05 + R() * 0.3) * Math.sqrt(aire(pts));
      const q = demiPlan(p, cx + Math.cos(a) * d, cy + Math.sin(a) * d, Math.cos(a), Math.sin(a));
      if (q.length > 2 && aire(q) > 0.35 * aire(pts)) p = q;
    }
    return p;
  }
  // forme d'un cristal selon son habitus de pose : tablette (rectangle abattu), section (polygone régulier), prisme
  function formeCristal(o, R, K, cx, cy, ang) {
    const L = entre(R, o.taille) * K, l = L / entre(R, o.allong || [1, 1]);
    const pts = o.sections ? polyRegulier(cx, cy, L / 2, l / 2, ang, o.sections, o.sections === 4 ? Math.PI / 4 : Math.PI / o.sections)
      : rectOriente(cx, cy, L, l, ang, o.biseau || 0);
    return { pts, L, l };
  }
  // pose des objets d'une espèce jusqu'à couvrir `part` du champ ; `angle(x, y)` impose l'orientation (fluidalité)
  function semer(G, R, K, liste, o, part, extra = {}) {
    const h = hab(o.min), cible = part * G.N;
    let acquis = 0, echecs = 0;
    for (let essai = 0; essai < (o.essais || 6000) && acquis < cible && echecs < (o.echecs || 900); essai++, echecs++) {
      const cx = -0.04 * Wp + R() * 1.08 * Wp, cy = -0.04 * Hp + R() * 1.08 * Hp;
      if (!o.chevauche && G.lire(cx, cy) >= 0) continue;                      // centre déjà pris : inutile d'essayer
      const ang = extra.angle ? extra.angle(cx, cy, R) : R() * Math.PI;
      const f = formeCristal(o, R, K, cx, cy, ang);
      if (o.casse) f.pts = casser(f.pts, cx, cy, R, o.casse);
      const libres = tester(G, f.pts, o.chevauche || 0, o.horsCadre ?? 0.5);
      if (!libres || (acquis > 0 && acquis + libres.length - cible > 0.5 * libres.length)) continue;
      libres.forEach((c) => { G.g[c] = liste.length; });
      liste.push({ min: o.min, cle: o.cle, h, n: liste.length, pts: f.pts, cx, cy, L: f.L, l: f.l, ang, cel: libres.length, role: o.role, groupe: o.groupe, basal: !!o.sansMarque });
      acquis += libres.length; echecs = 0;
    }
    return acquis / G.N;
  }
  const mesurer = (liste, G) => liste.reduce((m, c) => { m[c.cle || c.min] = (m[c.cle || c.min] || 0) + c.cel / G.N; return m; }, {});

  // PORPHYRIQUE (microgrenue) : gros cristaux automorphes (phénocristaux, formés lentement en profondeur) posés dans
  // une pâte de grains trop fins pour être dessinés un à un (cristallisée vite, lors de la montée en filon).
  MODES.porphyrique = function (roche, t, K, R) {
    const G = Grille(), phenos = [];
    t.phenos.forEach((o) => semer(G, R, K, phenos, { ...o, chevauche: 0 }, o.part));
    const p = fondMouchete(t.pate.fond, t.pate.taches, t.pate.pas || 4, R);
    let corps = p.defs + fondRect("pate", p.fill);
    if (t.pate.lits) {       // lits d'écoulement : un second moucheté, un lit sur deux
      const p2 = fondMouchete(t.pate.lits, t.pate.taches, t.pate.pas || 4, R), ph = R() * 6, bords = [];
      for (let y = -20; y < Hp + 30; y += entre(R, [6, 18])) bords.push(bordOndule(y, R, 6, 60, ph, 0.4));
      corps += p2.defs + tg("pate", bandes(bords).filter((b) => b.i % 2).map((b) => poly(b.pts, p2.fill)).join(""));
    }
    corps += phenos.map((c) => cristalSVG(c, R)).join("");
    const mesure = mesurer(phenos, G);
    mesure.pate = 1 - Object.values(mesure).reduce((a, b) => a + b, 0);
    const reperes = t.phenos.map((o) => repereSur(G, phenos.filter((c) => c.min === o.min), hab(o.min).ab));
    const phen = Math.round((1 - mesure.pate) * 100);
    return {
      corps, reperes, mesure,
      legende: { titre: "Deux temps de cristallisation", groupes: [
        { titre: `Phénocristaux (≈ ${phen} %) : formés lentement, en profondeur`, lignes: t.phenos.map((o) => ligne(roche, o.min, o.role)) },
        { titre: "Pâte : cristallisée vite, pendant la mise en place", lignes: [{ nom: t.pate.nom, role: t.pate.role, couleur: t.pate.fond, cle: "pate", fond: true }] },
      ] },
    };
  };

  // MICROLITIQUE (laves) : phénocristaux, puis une pâte de microlites (baguettes de plagioclase dessinées une à une,
  // grains de pyroxène et d'oxydes en moucheté) figée dans un peu de verre ; `fluidalite` (0–1) aligne les baguettes.
  MODES.microlitique = function (roche, t, K, R) {
    const G = Grille(), objets = [];
    const flux = (x, y) => (t.flux || 0) + 0.35 * Math.sin(x / 70 + y / 160);
    const doms = t.domaines ? Array.from({ length: t.domaines }, () => ({ x: R() * Wp, y: R() * Hp, a: R() * Math.PI })) : null;
    const angle = (x, y, R) => doms ? doms.reduce((m, d) => ((d.x - x) ** 2 + (d.y - y) ** 2 < (m.x - x) ** 2 + (m.y - y) ** 2 ? d : m)).a + (R() - 0.5) * 0.12
      : R() < (t.fluidalite || 0) ? flux(x, y) + (R() - 0.5) * 0.5 : R() * Math.PI;
    (t.vacuoles || []).forEach((o) => {
      const cible = o.part * G.N;
      for (let e = 0, acq = 0; e < 800 && acq < cible; e++) {
        const cx = R() * Wp, cy = R() * Hp, rx = entre(R, o.taille) * K / 2, ry = rx * entre(R, o.aplat || [0.7, 1]);
        const pts = polyRegulier(cx, cy, rx, ry, t.flux || 0, 16);
        const libres = poser(G, pts, objets.length, 0);
        if (!libres) continue;
        objets.push({ cle: o.cle || "vacuoles", vac: true, fond: o.fond, n: objets.length, pts, cx, cy, L: 2 * rx, l: 2 * ry, cel: libres.length }); acq += libres.length;
      }
    });
    t.phenos.forEach((o) => semer(G, R, K, objets, { ...o, groupe: 1, cle: "ph:" + o.min }, o.part));
    t.microlites.forEach((o) => semer(G, R, K, objets, { ...o, groupe: 2, cle: "mi:" + o.min, chevauche: o.chevauche ?? 0.05, horsCadre: 0.3, essais: 8000 }, o.part, { angle }));
    const p = fondMouchete(t.pate.fond, t.pate.taches, t.pate.pas || 3, R, t.pate.rayon || [0.7, 1.5]);
    let corps = p.defs + fondRect("pate", p.fill);
    corps += objets.map((c) => c.vac ? tg(c.cle, `<path d="${cheminLisse(c.pts)}" fill="${c.fond || "#fbfaf6"}"${contour(0.9)}/>`)
      : c.groupe === 2 ? tg(c.cle, poly(c.pts, c.h.fond, contour(0.45))) : cristalSVG(c, R)).join("");
    const mesure = mesurer(objets, G);
    mesure.pate = 1 - Object.values(mesure).reduce((a, b) => a + b, 0);
    const reperes = [
      ...t.phenos.map((o) => repereSur(G, objets.filter((c) => c.groupe === 1 && c.min === o.min), hab(o.min).ab)),
      repereSur(G, objets.filter((c) => c.groupe === 2), "μ", 40),
      ...(t.vacuoles || []).map((v) => repereSur(G, objets.filter((c) => c.vac && c.cle === (v.cle || "vacuoles")), v.ab || "V")),
    ];
    const groupes = [
      { titre: "Phénocristaux : formés dans la chambre magmatique", lignes: t.phenos.map((o) => ligne(roche, o.min, o.role, "ph:" + o.min)) },
      { titre: "Microlites (μ) : cristallisés pendant la remontée et l'épanchement", lignes: t.microlites.map((o) => ({ ...ligne(roche, o.min, o.role, "mi:" + o.min), ab: "μ" })) },
      { titre: "Figé en dernier", lignes: [{ nom: t.pate.nom, role: t.pate.role, couleur: t.pate.fond, cle: "pate", fond: true }] },
    ];
    (t.vacuoles || []).forEach((v) => groupes[2].lignes.push({ ab: v.ab || "V", nom: v.nom || "Vacuoles", role: v.role || "bulles de gaz piégées", couleur: v.fond || "#fbfaf6", cle: v.cle || "vacuoles" }));
    return { corps, reperes, mesure, legende: { titre: "Ordre de cristallisation", groupes } };
  };

  // lit ondulé : bord y(x) = base + ondulation commune (plis d'écoulement ou de lits) + petite irrégularité propre
  function bordOndule(base, R, amp, lambda, phase, bruit = 0.25) {
    const p2 = R() * 6.28, l2 = lambda * (0.3 + R() * 0.2);
    return (x) => base + amp * Math.sin(x / lambda + phase) + amp * bruit * Math.sin(x / l2 + p2);
  }
  // bandes entre des bords successifs ; renvoie [{pts, i}] (polygones fermés échantillonnés tous les 6 px)
  function bandes(bords) {
    // chaque bord est gardé sous le précédent (des bords déformés ne se croisent jamais)
    const xs = [];
    for (let x = -6; x <= Wp + 6; x += 6) xs.push(x);
    const Y = [];
    bords.forEach((f, i) => { Y.push(xs.map((x, k) => (i ? Math.max(f(x), Y[i - 1][k]) : f(x)))); });
    const out = [];
    for (let i = 0; i < bords.length - 1; i++) {
      out.push({ pts: xs.map((x, k) => [x, Y[i][k]]).concat(xs.map((x, k) => [x, Y[i + 1][k]]).reverse()), i, haut: Y[i], bas: Y[i + 1], xs });
    }
    return out;
  }

  // VITREUSE (obsidienne) : verre en lits d'écoulement plus ou moins sombres, cristallites en aiguilles alignées sur
  // l'écoulement, rares petits cristaux ; `vacuoles` pour les verres bulleux (ponce).
  MODES.vitreuse = function (roche, t, K, R) {
    const G = Grille(), objets = [], amp = t.plis || 10, lam = 55, ph = R() * 6.28;
    const bords = [];
    for (let y = -30, i = 0; y < Hp + 40; y += entre(R, t.lits || [12, 34]), i++) bords.push(bordOndule(y, R, amp, lam, ph));
    let corps = tg("verre", bandes(bords).map((b) => poly(b.pts, t.teintes[Math.floor(R() * t.teintes.length)])).join(""));
    const pente = (x) => Math.atan(amp / lam * Math.cos(x / lam + ph));
    (t.vacuoles || []).forEach((o) => {
      for (let e = 0, acq = 0; e < 800 && acq < o.part * G.N; e++) {
        const cx = R() * Wp, cy = R() * Hp, rx = entre(R, o.taille) * K / 2, ry = rx * entre(R, o.aplat || [0.3, 0.6]);
        const pts = polyRegulier(cx, cy, rx, ry, pente(cx), 14), libres = poser(G, pts, objets.length, 0);
        if (libres) { objets.push({ vac: true, cle: "vacuoles", pts, cx, cy, L: 2 * rx, l: 2 * ry, cel: libres.length, n: objets.length }); acq += libres.length; }
      }
    });
    t.cristaux.forEach((o) => semer(G, R, K, objets, { ...o, chevauche: 0 }, o.part, { angle: (x) => pente(x) + (R() - 0.5) * 0.3 }));
    // cristallites : aiguilles de quelques centièmes de mm, plus nombreuses dans certains lits
    let aig = "", surfAig = 0;
    for (let k = 0; k < (t.cristallites || 0); k++) {
      const x = R() * Wp, y = R() * Hp;
      if (G.lire(x, y) >= 0) continue;
      const a = pente(x) + (R() - 0.5) * 0.25, L = entre(R, [3, 9]);
      surfAig += L * 0.8;
      aig += trait(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2, x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2, t.couleurCristallites || "#3a332e", 0.8);
    }
    corps += aig + objets.map((c) => c.vac ? tg("vacuoles", `<path d="${cheminLisse(c.pts)}" fill="#fbfaf6"${contour(0.8)}/>`) : cristalSVG(c, R, 0.7)).join("");
    const mesure = mesurer(objets, G);
    if (t.cristallites) mesure.cristallites = surfAig / (Wp * Hp);
    mesure.verre = 1 - Object.values(mesure).reduce((a, b) => a + b, 0);
    const reperes = [{ ab: "Vrr", x: Wp * 0.62, y: Hp * 0.3, petit: false }, ...t.cristaux.map((o) => repereSur(G, objets.filter((c) => c.min === o.min), hab(o.min).ab, 20))];
    const groupes = [
      { titre: "Verre : le liquide figé avant de cristalliser", lignes: [
        { ab: "Vrr", nom: nomMin("verre"), cle: "verre", role: t.roleVerre || "limpide au microscope, en lits d'écoulement de teinte un peu différente", couleur: t.teintes[0] },
        ...(t.cristallites ? [{ nom: "Cristallites", cle: "cristallites", role: t.roleCristallites || "aiguilles sombres (oxydes de fer, pyroxène) alignées sur l'écoulement ; par milliards, elles rendent la roche noire à l'œil nu", couleur: t.couleurCristallites || "#3a332e" }] : []),
        ...(t.vacuoles ? [{ nom: "Vacuoles", role: "bulles de gaz étirées", couleur: "#fbfaf6", cle: "vacuoles" }] : []),
      ] },
      { titre: t.titreCristaux || "Rares cristaux formés avant l'éruption", lignes: t.cristaux.map((o) => ligne(roche, o.min, o.role)) },
    ];
    return { corps, reperes, mesure, legende: { titre: "Constituants", groupes } };
  };

  // PYROCLASTIQUE (tufs, ignimbrites) : fragments de cristaux cassés par l'explosion, ponces (écrasées en « fiamme »
  // si la nuée était assez chaude pour se souder : `soude`), échardes de verre et cendre fine entre les deux.
  MODES.pyroclastique = function (roche, t, K, R) {
    const G = Grille(), objets = [];
    // ponces : lentilles aplaties à bouts effilés (soudées) ou blocs arrondis bulleux
    const ponce = t.ponces;
    for (let e = 0, acq = 0; e < 3000 && acq < ponce.part * G.N; e++) {
      const cx = R() * Wp, cy = R() * Hp, L = entre(R, ponce.taille) * K, a = (R() - 0.5) * (t.soude ? 0.15 : 3.14);
      let pts;
      if (t.soude) {
        const ep = L / entre(R, [5, 10]), c = Math.cos(a), sn = Math.sin(a), haut = [], bas = [];
        for (let i = 0; i <= 16; i++) {
          const u = -L / 2 + i * L / 16, f = Math.pow(Math.max(0, 1 - (2 * u / L) ** 2), 0.7) * ep / 2 * (0.8 + 0.4 * R());
          haut.push([cx + u * c + f * sn, cy + u * sn - f * c]); bas.push([cx + u * c - f * sn * 0.8, cy + u * sn + f * c * 0.8]);
        }
        pts = haut.concat(bas.reverse());
      } else pts = polyIrregulier(cx, cy, L / 2, L / 2 * entre(R, [0.6, 0.9]), a, 9, R, 0.3);
      const libres = poser(G, pts, objets.length, 0);
      if (libres) { objets.push({ ponce: true, cle: "ponces", pts, cx, cy, L, l: L / 6, cel: libres.length, n: objets.length }); acq += libres.length; }
    }
    t.cristaux.forEach((o) => semer(G, R, K, objets, { ...o, chevauche: 0, casse: o.casse ?? 2 }, o.part));
    const p = fondMouchete(t.cendre.fond, t.cendre.taches, 3, R, [0.5, 1]);
    let corps = p.defs + fondRect("cendre", p.fill);
    // échardes : parois de bulles éclatées, en croissants ou en Y (aplaties si soudées)
    for (let k = 0; k < (t.echardes || 0); k++) {
      const x = R() * Wp, y = R() * Hp, r = entre(R, [3, 7]);
      if (G.lire(x, y) >= 0) continue;
      const sy = t.soude ? 0.4 : 1, a0 = R() * 6.28;
      const arc = (a1, a2) => `M${r1(x + Math.cos(a1) * r)},${r1(y + Math.sin(a1) * r * sy)} Q${r1(x)},${r1(y)} ${r1(x + Math.cos(a2) * r)},${r1(y + Math.sin(a2) * r * sy)}`;
      corps += `<path d="${arc(a0, a0 + 2.1)} ${R() < 0.5 ? `M${r1(x)},${r1(y)} L${r1(x + Math.cos(a0 + 4.2) * r)},${r1(y + Math.sin(a0 + 4.2) * r * sy)}` : ""}" fill="none" stroke="${t.cendre.echarde}" stroke-width="1.1" stroke-linecap="round"/>`;
    }
    corps += objets.map((c) => c.ponce
      ? tg("ponces", poly(c.pts, ponce.fond, contour(0.8)) + (t.soude ? "" : Array.from({ length: 5 }, () => `<circle cx="${r1(c.cx + (R() - 0.5) * c.L * 0.5)}" cy="${r1(c.cy + (R() - 0.5) * c.L * 0.4)}" r="${r1(1 + R() * 1.5)}" fill="#fbfaf6"/>`).join("")))
      : cristalSVG(c, R, 0.7)).join("");
    const mesure = mesurer(objets, G);
    mesure.cendre = 1 - Object.values(mesure).reduce((a, b) => a + b, 0);
    const reperes = [...t.cristaux.map((o) => repereSur(G, objets.filter((c) => c.min === o.min), hab(o.min).ab, 24)), repereSur(G, objets.filter((c) => c.ponce), t.soude ? "F" : "P", 30)];
    const groupes = [
      { titre: "Fragments de cristaux : brisés par l'explosion", lignes: t.cristaux.map((o) => ligne(roche, o.min, o.role)) },
      { titre: "Verre : le magma pulvérisé", lignes: [
        { ab: t.soude ? "F" : "P", nom: t.soude ? "Fiamme" : "Ponces", role: t.soude ? "ponces écrasées et soudées, en flammèches" : "fragments de lave bulleuse", couleur: ponce.fond, cle: "ponces" },
        { nom: "Échardes et cendre", role: "parois de bulles éclatées, en croissants, et poussière de cristaux", couleur: t.cendre.fond, cle: "cendre", fond: true },
      ] },
    ];
    return { corps, reperes, mesure, legende: { titre: "Constituants", groupes } };
  };

  // germes de rayons variables (grains mal ou bien triés) : deux germes ne se touchent pas plus près que r1 + r2
  function germesTries(R, K, taille, serre = 0.95, essais = 6000) {
    const out = [];
    for (let i = 0; i < essais; i++) {
      const x = -10 + R() * (Wp + 20), y = -10 + R() * (Hp + 20), r = entre(R, taille) * K / 2;
      if (out.every((g) => Math.hypot(g.x - x, g.y - y) >= (g.r + r) * serre)) out.push({ x, y, r });
    }
    return out;
  }

  // DÉTRITIQUE / BRÉCHIQUE : grains ou clastes apportés (issus de cellules de Voronoï rétrécies autour de leur germe,
  // donc jointifs ou presque), arrondis (`arrondi` 1) ou anguleux (0), puis ciment ou matrice entre eux.
  // `jointif` (0–1) : 1 = grains qui se touchent (grès), 0,6 = clastes flottant dans la matrice (brèche à matrice).
  MODES.detritique = function (roche, t, K, R) {
    const G = Grille(), grains = [];
    const germes = germesTries(R, K, t.taille, t.serre ?? 0.95);
    const cellules = voronoi(germes);
    const cibles = t.grains.map((o) => ({ ...o, reste: o.part * G.N }));
    germes.forEach((g, i) => {
      const cell = cellules[i];
      if (cell.length < 3) return;
      const f = entre(R, t.jointif || [0.82, 0.92]);
      let pts = cell.map(([x, y]) => [g.x + (x - g.x) * f, g.y + (y - g.y) * f]);
      pts = t.arrondi ? lissePoints(pts) : casser(pts, g.x, g.y, R, 1);
      const cel = G.cellules(pts);
      if (!cel.length) return;
      // espèce : celle à qui il manque la plus grande PART de sa cible (sinon les espèces rares ne sortent jamais)
      const o = cibles.slice().sort((a, b) => b.reste / b.part - a.reste / a.part)[0];
      if (o.reste <= 0) return;
      o.reste -= cel.length;
      cel.forEach((c) => { G.g[c] = grains.length; });
      const [cx, cy] = centre(pts);
      grains.push({ o, cle: o.cle || o.min, pts, cx, cy, L: 2 * g.r, l: 2 * g.r, cel: cel.length, n: grains.length });
    });
    // pores : vides restés ouverts entre les grains
    const pores = [];
    if (t.pores) for (let e = 0, acq = 0; e < 4000 && acq < t.pores.part * G.N; e++) {
      const cx = R() * Wp, cy = R() * Hp, r = entre(R, t.pores.taille) * K / 2;
      const pts = polyIrregulier(cx, cy, r, r * entre(R, [0.5, 0.9]), R() * 3.14, 7, R, 0.4), libres = poser(G, pts, -3, 0, 0.3);
      if (libres) { pores.push(pts); acq += libres.length; }
    }
    const p = fondMouchete(t.liant.fond, t.liant.taches, 3, R, [0.5, 1.1]);
    let corps = p.defs + fondRect("liant", p.fill);
    corps += tg("pores", pores.map((q) => `<path d="${cheminLisse(q)}" fill="#fbfaf6"/>`).join(""));
    corps += grains.map((c) => {
      const fond = c.o.fond || hab(c.o.min).fond, liseré = c.o.enduit && R() < c.o.enduit;
      const forme = poly(c.pts, fond, contour(0.85));
      const tache = c.o.taches ? Array.from({ length: Math.round(c.cel / 40) }, () => `<circle cx="${r1(c.cx + (R() - 0.5) * c.L * 0.6)}" cy="${r1(c.cy + (R() - 0.5) * c.L * 0.6)}" r="${r1(0.6 + R() * 0.8)}" fill="${c.o.taches}"/>`).join("") : "";
      const marq = c.o.min && !c.o.sansMarque ? marque(hab(c.o.min), c, c.cx, c.cy, R() * 3.14, c.L, c.l * 0.6, R) : "";
      return tg(c.cle, forme + tache + marq + (liseré ? poly(c.pts, "none", ' stroke="#b8742f" stroke-width="1.3" stroke-linejoin="round"') : ""));
    }).join("");
    const mesure = mesurer(grains, G);
    if (pores.length) mesure.pores = G.g.reduce((n, v) => n + (v === -3), 0) / G.N;
    mesure.liant = 1 - Object.values(mesure).reduce((a, b) => a + b, 0);
    const reperes = t.grains.map((o) => repereSur(G, grains.filter((c) => c.cle === (o.cle || o.min)), o.ab || hab(o.min).ab, 26));
    const lig = (o) => o.min ? ligne(roche, o.min, o.role, o.cle || o.min) : { ab: o.ab, nom: o.nom, role: o.role, couleur: o.fond, cle: o.cle };
    const groupes = [
      { titre: t.titreGrains || "Grains apportés par l'eau ou le vent", lignes: t.grains.map(lig) },
      { titre: t.liant.titre, lignes: [{ nom: t.liant.nom, role: t.liant.role, couleur: t.liant.fond, cle: "liant", fond: t.liant.detail !== false },
        ...(pores.length ? [{ nom: "Pores", role: "vides restés ouverts", couleur: "#fbfaf6", cle: "pores" }] : [])] },
    ];
    return { corps, reperes, mesure, legende: { titre: t.titreLegende || "Ordre de formation", groupes } };
  };

  // LITÉE : lits parallèles de quelques dixièmes de mm, alternant fins (argileux, sombres) et plus grossiers (silts,
  // clairs), légèrement ondulés ; paillettes de mica couchées dans les lits.
  MODES.litee = function (roche, t, K, R) {
    const G = Grille(), amp = t.ondulation || 2, lam = 90, ph = R() * 6.28;
    const bords = [], types = [];
    const reste = t.lits.map((l) => l.part * (Hp + 60));
    for (let y = -30; y < Hp + 30;) {
      // type de lit : celui à qui il manque la plus grande part de sa cible
      // (jamais deux lits du même type à la suite : ils se confondraient)
      const k = reste.map((v, i) => [i === types[types.length - 1] && t.lits.length > 1 ? -Infinity : v / t.lits[i].part + R() * 20, i]).sort((a, b) => b[0] - a[0])[0][1], lit = t.lits[k];
      const e = entre(R, lit.epaisseur) * K;
      bords.push(bordOndule(y, R, amp, lam, ph, 0.6)); types.push(k); reste[k] -= e; y += e;
    }
    bords.push(bordOndule(Hp + 40, R, amp, lam, ph));
    const motifs = t.lits.map((l) => fondMouchete(l.fond, l.taches, 3, R, l.rayon || [0.4, 0.9]));
    let corps = motifs.map((m) => m.defs).join("");
    const mesure = {};
    bandes(bords).forEach((b) => {
      const lit = t.lits[types[b.i]];
      corps += tg(lit.cle, poly(b.pts, motifs[types[b.i]].fill));
      const cel = G.cellules(b.pts).filter((c) => G.g[c] < 0);
      cel.forEach((c) => { G.g[c] = types[b.i]; });
      mesure[lit.cle] = (mesure[lit.cle] || 0) + cel.length / G.N;
      // paillettes couchées dans le lit
      for (let k = 0; k < (lit.micas || 0) * (b.pts.length / 2) / 4; k++) {
        const x = R() * Wp, y0 = bords[b.i](x), y1 = bords[b.i + 1](x), y = y0 + R() * (y1 - y0), L = entre(R, [4, 10]);
        const a = Math.atan(amp / lam * Math.cos(x / lam + ph)) + (R() - 0.5) * 0.15;
        corps += trait(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2, x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2, lit.mica || "#e8e1c8", 1.1);
      }
    });
    corps += bords.slice(1, -1).map((f) => `<polyline points="${pts2(Array.from({ length: 73 }, (_, i) => [i * 6 - 6, f(i * 6 - 6)]))}" fill="none" stroke="${BORD}" stroke-width="0.35" stroke-opacity=".5"/>`).join("");
    // vides allongés dans les lits (moules de végétaux du travertin) : retirés de la surface du lit qu'ils percent
    if (t.vides) for (let e = 0, acq = 0; e < 3000 && acq < t.vides.part * G.N; e++) {
      const cx = R() * Wp, cy = R() * Hp, L = entre(R, t.vides.taille) * K;
      const pts = lissePoints(polyIrregulier(cx, cy, L / 2, L / 2 * entre(R, t.vides.aplat || [0.3, 0.6]), (R() - 0.5) * 0.4, 8, R, 0.35));
      const cel = G.cellules(pts).filter((c) => G.g[c] >= 0);
      if (cel.length < 0.6 * aire(pts) / (PAS * PAS)) continue;
      cel.forEach((c) => { mesure[t.lits[G.g[c]].cle] -= 1 / G.N; G.g[c] = -9; });
      mesure.pores = (mesure.pores || 0) + cel.length / G.N; acq += cel.length;
      corps += tg("pores", poly(pts, "#fbfaf6", contour(0.7)));
    }
    const reperes = t.lits.map((l, i) => {
      // lit le plus épais de ce type, cherché sur toute la largeur (d'abord à une abscisse propre à chaque type)
      const x0 = Wp * (0.28 + 0.44 * i / Math.max(1, t.lits.length - 1));
      const xs = [x0, ...Array.from({ length: 15 }, (_, k) => Wp * (0.12 + k * 0.055))];
      for (const x of xs) {
        const b = bandes(bords).filter((b) => types[b.i] === i).map((b) => ({ y: (bords[b.i](x) + bords[b.i + 1](x)) / 2, e: bords[b.i + 1](x) - bords[b.i](x) }))
          .filter((c) => c.y > 12 && c.y < Hp - 26 && c.e > 1).sort((a, c) => c.e - a.e)[0];
        if (b) return { ab: l.ab, x, y: b.y, petit: b.e < 16 };
      }
      return null;
    });
    const groupes = [{ titre: "", lignes: [...t.lits.map((l) => ({ ab: l.ab, nom: l.nom, cle: l.cle, role: l.role, couleur: l.fond })),
      ...(t.vides ? [{ nom: t.vides.nom || "Vides", cle: "pores", role: t.vides.role, couleur: "#fbfaf6" }] : [])] }];
    return { corps, reperes, mesure, legende: { titre: t.titreLegende || "Lits (surface de la vue)", groupes } };
  };

  // BIOCLASTIQUE (calcaires) : débris d'êtres vivants et grains carbonatés posés dans une boue calcaire (micrite) ou
  // soudés par un ciment de calcite limpide (sparite). Types : coquille, foraminifere, entroque, oolithe, grain.
  const BIO = {
    // fragment de coquille : secteur d'anneau épais, lamelles parallèles à la courbure
    coquille(cx, cy, L, R) {
      const r = L / 2, ep = Math.max(2.5, L * entre(R, [0.06, 0.12])), a0 = R() * 6.28, da = entre(R, [1, 2.4]);
      const ext = [], int = [];
      for (let i = 0; i <= 14; i++) { const a = a0 + da * i / 14; ext.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); int.push([cx + Math.cos(a) * (r - ep), cy + Math.sin(a) * (r - ep)]); }
      const pts = ext.concat(int.reverse());
      const mil = Array.from({ length: 15 }, (_, i) => { const a = a0 + da * i / 14; return [cx + Math.cos(a) * (r - ep / 2), cy + Math.sin(a) * (r - ep / 2)]; });
      // repère posé au milieu de la coquille (le centre du cercle tombe en dehors)
      return { pts, repere: mil[7], epaisseur: ep, svg: poly(pts, "#f6f1e6", contour(0.8)) + `<polyline points="${pts2(mil)}" fill="none" stroke="#cbbfa6" stroke-width="0.6"/>` };
    },
    // foraminifère : loges de taille croissante enroulées en spirale, paroi sombre, loges remplies de calcite claire
    foraminifere(cx, cy, L, R) {
      const n = 7, a0 = R() * 6.28, sens = R() < 0.5 ? 1 : -1, loges = [];
      for (let i = 0; i < n; i++) {
        const k = (i + 2) / (n + 1), a = a0 + sens * i * 0.95, d = L * 0.3 * k;
        loges.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, L * 0.11 * (0.6 + k)]);
      }
      const pts = polyRegulier(cx, cy, L / 2, L / 2, 0, 12);
      return { pts, svg: loges.map(([x, y, r]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="#fbf8f0" stroke="#5c5043" stroke-width="1.1"/>`).join("") };
    },
    // entroque : article de tige de crinoïde, un seul cristal de calcite percé d'un canal central
    entroque(cx, cy, L, R) {
      const pts = polyRegulier(cx, cy, L / 2, L / 2 * entre(R, [0.8, 1]), R() * 3.14, 10);
      return { pts, svg: `<path d="${cheminLisse(pts)}" fill="#eee6d6"${contour(0.8)}/>` + marque(HABITUS.calcite, { d: cheminLisse(pts) }, cx, cy, R() * 3.14, L, L, R)
        + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(L * 0.09)}" fill="#8a7c68"/>` };
    },
    // oolithe : grain à enveloppes concentriques autour d'un petit noyau
    oolithe(cx, cy, L, R) {
      const rx = L / 2, ry = rx * entre(R, [0.8, 1]), a = R() * 3.14, pts = polyRegulier(cx, cy, rx, ry, a, 16);
      let svg = `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" transform="rotate(${r1(a * 57.3)} ${r1(cx)} ${r1(cy)})" fill="#efe4c9"${contour(0.8)}/>`;
      for (const k of [0.72, 0.46]) svg += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx * k)}" ry="${r1(ry * k)}" transform="rotate(${r1(a * 57.3)} ${r1(cx)} ${r1(cy)})" fill="none" stroke="#bfae8a" stroke-width="0.7"/>`;
      return { pts, svg: svg + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rx * 0.18)}" fill="#c7cbc9" stroke="${BORD}" stroke-width="0.5"/>` };
    },
    // radiolaire : coque siliceuse sphérique percée de pores, épines rayonnantes
    radiolaire(cx, cy, L, R) {
      const r = L / 2 * 0.72, pts = polyRegulier(cx, cy, L / 2, L / 2, 0, 12);
      let svg = `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="#f1ebdd" stroke="#6b5f4e" stroke-width="0.9"/>`;
      for (let i = 0; i < 10; i++) { const a = i * 0.628 + R() * 0.2; svg += `<circle cx="${r1(cx + Math.cos(a) * r * 0.62)}" cy="${r1(cy + Math.sin(a) * r * 0.62)}" r="${r1(r * 0.12)}" fill="#cfc4ae"/>`; }
      for (let i = 0; i < 6; i++) { const a = i * 1.047 + R() * 0.3; svg += trait(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * L / 2, cy + Math.sin(a) * L / 2, "#6b5f4e", 0.8); }
      return { pts, svg };
    },
    // diatomée : frustule centrique (disque strié en rayons) ou pennée (navette striée en travers)
    diatomee(cx, cy, L, R) {
      if (R() < 0.5) {
        const r = L / 3, pts = polyRegulier(cx, cy, r, r, 0, 14);
        let svg = `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="#f5f1e8" stroke="#6b6352" stroke-width="0.8"/>`;
        for (let i = 0; i < 16; i++) { const a = i * 0.3927; svg += trait(cx + Math.cos(a) * r * 0.25, cy + Math.sin(a) * r * 0.25, cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9, "#b9ae98", 0.5); }
        return { pts, svg };
      }
      const a = R() * 3.14, pts = polyRegulier(cx, cy, L / 2, L / 9, a, 16), c = Math.cos(a), sn = Math.sin(a);
      let svg = poly(pts, "#f5f1e8", contour(0.7));
      for (let u = -L * 0.42; u <= L * 0.42; u += 2.2) svg += trait(cx + u * c + sn * L / 12, cy + u * sn - c * L / 12, cx + u * c - sn * L / 12, cy + u * sn + c * L / 12, "#b9ae98", 0.5);
      return { pts, svg };
    },
    // spicule d'éponge : baguette à canal axial
    spicule(cx, cy, L, R) {
      const a = R() * 3.14, pts = rectOriente(cx, cy, L, Math.max(2.5, L / 10), a, 0.45);
      return { pts, svg: poly(pts, "#eee8da", contour(0.6)) + trait(cx - Math.cos(a) * L * 0.4, cy - Math.sin(a) * L * 0.4, cx + Math.cos(a) * L * 0.4, cy + Math.sin(a) * L * 0.4, "#9c8f7b", 0.6) };
    },
    // pisolithe : grosse concrétion à enveloppes concentriques (latérites, bauxites, minerais de fer oolithiques)
    pisolithe(cx, cy, L, R, o) {
      const rx = L / 2, ry = rx * entre(R, [0.8, 1]), a = R() * 3.14, pts = polyRegulier(cx, cy, rx, ry, a, 16), rot = `transform="rotate(${r1(a * 57.3)} ${r1(cx)} ${r1(cy)})"`;
      let svg = `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" ${rot} fill="${o.couleur}"${contour(0.8)}/>`;
      for (const k of [0.78, 0.56, 0.34]) svg += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx * k)}" ry="${r1(ry * k)}" ${rot} fill="none" stroke="${o.trait || "#5a2a1a"}" stroke-width="0.8"/>`;
      return { pts, svg };
    },
    // débris végétal : lambeau allongé à cellules alignées
    debris(cx, cy, L, R, o) {
      const a = (o.angle ?? R() * 3.14) + (R() - 0.5) * 0.3, l = L * entre(R, [0.12, 0.25]), pts = polyIrregulier(cx, cy, L / 2, l / 2, a, 10, R, 0.25), c = Math.cos(a), sn = Math.sin(a);
      let svg = poly(pts, o.couleur || "#4a3a2a", contour(0.6));
      for (let u = -L * 0.4; u <= L * 0.4; u += 3) svg += trait(cx + u * c - sn * l * 0.3, cy + u * sn + c * l * 0.3, cx + u * c + sn * l * 0.3, cy + u * sn - c * l * 0.3, o.trait || "#6f5a42", 0.5);
      return { pts, svg };
    },
    // nodule : concrétion arrondie irrégulière (silex, calcrète, nodules ferrugineux)
    nodule(cx, cy, L, R, o) {
      const pts = lissePoints(polyIrregulier(cx, cy, L / 2, L / 2 * entre(R, [0.55, 0.9]), R() * 3.14, 8, R, 0.45));
      return { pts, svg: poly(pts, o.couleur, contour(0.8)) + (o.trait ? poly(pts.map(([x, y]) => [cx + (x - cx) * 0.7, cy + (y - cy) * 0.7]), "none", ` stroke="${o.trait}" stroke-width="0.7"`) : "") };
    },
    // grain apporté (quartz…) : petit polygone anguleux
    grain(cx, cy, L, R, o) {
      const pts = polyIrregulier(cx, cy, L / 2, L / 2 * entre(R, [0.6, 0.9]), R() * 3.14, 6, R, 0.4);
      return { pts, svg: poly(pts, hab(o.min).fond, contour(0.7)) };
    },
  };
  MODES.bioclastique = function (roche, t, K, R) {
    const G = Grille(), objets = [];
    t.elements.forEach((o) => {
      for (let e = 0, acq = 0, echecs = 0; e < 5000 && acq < o.part * G.N && echecs < 900; e++, echecs++) {
        const cx = -0.03 * Wp + R() * 1.06 * Wp, cy = -0.03 * Hp + R() * 1.06 * Hp;
        if (G.lire(cx, cy) >= 0) continue;
        const L = entre(R, o.taille) * K, f = BIO[o.type](cx, cy, L, R, o), libres = poser(G, f.pts, objets.length, 0, 0.4);
        if (!libres) continue;
        const [rx, ry] = f.repere || [cx, cy];
        objets.push({ o, cle: o.cle || (o.type === "grain" ? o.min : o.type), cx: rx, cy: ry, L, l: f.epaisseur || L, cel: libres.length, n: objets.length, svg: f.svg }); acq += libres.length; echecs = 0;
      }
    });
    const p = fondMouchete(t.fond.fond, t.fond.taches, 3, R, [0.4, 0.9]);
    const corps = p.defs + fondRect("fond", p.fill) + objets.map((c) => tg(c.cle, c.svg)).join("");
    const mesure = mesurer(objets, G);
    mesure.fond = 1 - Object.values(mesure).reduce((a, b) => a + b, 0);
    const reperes = t.elements.map((o) => repereSur(G, objets.filter((c) => c.o === o), o.ab, 24));
    const lig = (o) => ({ ab: o.ab, nom: o.nom, role: o.role, couleur: o.couleur || (o.min ? hab(o.min).fond : "#f6f1e6"), cle: o.cle || o.type });
    const groupes = [
      { titre: t.titreElements || "Débris d'êtres vivants et grains carbonatés", lignes: t.elements.filter((o) => o.type !== "grain").map(lig) },
      ...(t.elements.some((o) => o.type === "grain") ? [{ titre: "Grains apportés", lignes: t.elements.filter((o) => o.type === "grain").map((o) => ({ ...ligne(roche, o.min, o.role), ab: o.ab })) }] : []),
      { titre: t.fond.titre, lignes: [{ nom: t.fond.nom, role: t.fond.role, couleur: t.fond.fond, cle: "fond", fond: true }] },
    ].filter((g) => g.lignes.length);
    return { corps, reperes, mesure, legende: { titre: "Constituants", groupes } };
  };

  // champ de foliation : direction du feuilletage en (x, y), légèrement ondulée et qui contourne les gros cristaux
  function foliation(obstacles, amp = 0.12, lam = 90) {
    return (x, y) => {
      let vx = Math.cos(2 * amp * Math.sin(x / lam)), vy = Math.sin(2 * amp * Math.sin(x / lam));   // angles doublés
      obstacles.forEach((o) => {
        const dx = x - o.cx, dy = y - o.cy, d = Math.hypot(dx, dy), r = o.L / 2;
        if (d > 3 * r || d < 1) return;
        const w = Math.exp(-Math.max(0, d - r) / (0.7 * r)), t = 2 * (Math.atan2(dy, dx) + Math.PI / 2);
        vx = vx * (1 - w) + Math.cos(t) * w; vy = vy * (1 - w) + Math.sin(t) * w;
      });
      return Math.atan2(vy, vx) / 2;
    };
  }
  // grains d'un fond en mosaïque (Voronoï relaxé), espèce tirée selon les parts ; `ok(x, y)` exclut des germes
  function mosaique(G, R, K, taille, especes, sx = 1, relax = 2, ok = () => true) {
    let germes = germesPoisson(R, taille * K, (x, y) => ok(x, y), 9000);
    germes = lloyd(germes, relax, sx);
    // parts ramenées à la place encore libre (les autres constituants sont déjà posés)
    const libre = G.g.reduce((n, v) => n + (v < 0), 0), somme = especes.reduce((a, o) => a + o.part, 0);
    const cellules = voronoi(germes, sx), reste = especes.map((o) => o.part / somme * libre), grains = [];
    cellules.forEach((pts, i) => {
      if (pts.length < 3) return;
      const cel = G.cellules(pts).filter((c) => G.g[c] < 0);
      // espèce à qui il manque la plus grande part de sa cible (les rares ont aussi leurs grains), un peu brassée
      const k = reste.map((v, j) => [v / (especes[j].part / somme * libre || 1) + R() * 0.15, j]).sort((a, b) => b[0] - a[0])[0][1];
      reste[k] -= cel.length;
      const [cx, cy] = centre(pts);
      grains.push({ min: especes[k].min, h: hab(especes[k].min), o: especes[k], pts, cx, cy, L: taille * K * sx, l: taille * K, ang: R() * 3.14, cel: cel.length, cels: cel });
    });
    return grains;
  }
  const grainSVG = (c, R, i) => tg(c.min, poly(c.pts, c.h.fonds ? c.h.fonds[i % c.h.fonds.length] : c.h.fond, contour(0.6)) + (c.o.sansMarque ? "" : marque(c.h, c, c.cx, c.cy, c.ang, c.L, c.l, R)));

  // MOSAÏQUE (granoblastique : quartzites, marbres, cornéennes) : grains équants recristallisés, joints droits qui se
  // rejoignent par trois vers 120° ; `porphyro` pour les gros cristaux nés dans la roche (grenat, andalousite…) ;
  // `fantomes` : part des grains qui gardent le contour poussiéreux du grain de sable d'origine (quartzites).
  MODES.mosaique = function (roche, t, K, R) {
    const G = Grille(), gros = [];
    (t.porphyro || []).forEach((o) => semer(G, R, K, gros, { ...o, chevauche: 0 }, o.part));
    // micas : paillettes (lamelles) et non grains polygonaux
    const paillettes = [];
    t.grains.filter((o) => o.lamelle).forEach((o) => semer(G, R, K, paillettes, { ...o, chevauche: 0 }, o.part));
    const grains = mosaique(G, R, K, t.taille, t.grains.filter((o) => !o.lamelle), t.aplatissement || 1, 2);
    grains.forEach((c) => c.cels.forEach((x) => { if (G.g[x] < 0) G.g[x] = 1e6; }));
    let corps = grains.map((c, i) => grainSVG(c, R, i)).join("");
    const mesure0 = {}, reliques = [];
    // maille de la serpentinite : bande fibreuse le long des joints, reliques d'olivine au cœur de certaines mailles
    if (t.maille) grains.filter((c) => c.min === t.maille.bord).forEach((c) => {
      const q = c.pts.map(([x, y]) => [c.cx + (x - c.cx) * 0.72, c.cy + (y - c.cy) * 0.72]);
      corps += poly(q, "none", ` stroke="${t.maille.fibres}" stroke-width="0.6" stroke-dasharray="1.2 1.2"`);
      if (R() < t.maille.reliques) {
        const r = c.pts.map(([x, y]) => [c.cx + (x - c.cx) * 0.4, c.cy + (y - c.cy) * 0.4]), cel = G.cellules(r).length / G.N;
        corps += tg(t.maille.coeur, poly(r, hab(t.maille.coeur).fond, contour(0.5)));
        reliques.push({ cx: c.cx, cy: c.cy, L: 12, l: 12, cel: cel * G.N });
        mesure0[t.maille.coeur] = (mesure0[t.maille.coeur] || 0) + cel; mesure0[t.maille.bord] = (mesure0[t.maille.bord] || 0) - cel;
      }
    });
    corps += grains.filter(() => R() < (t.fantomes || 0)).map((c) => {
      const f = 0.55, q = c.pts.map(([x, y]) => [c.cx + (x - c.cx) * f, c.cy + (y - c.cy) * f]);
      return `<path d="${cheminLisse(q)}" fill="none" stroke="#8c8574" stroke-width="0.9" stroke-dasharray="0.6 1.8" stroke-linecap="round"/>`;
    }).join("");
    corps += paillettes.map((c) => cristalSVG(c, R, 0.6)).join("") + gros.map((c) => cristalSVG(c, R)).join("");
    const mesure = mesurer(gros.concat(paillettes), G);
    Object.entries(mesure0).forEach(([k, v]) => { mesure[k] = (mesure[k] || 0) + v; });
    grains.forEach((c) => { mesure[c.min] = (mesure[c.min] || 0) + c.cel / G.N; });
    const reperes = [...(t.porphyro || []).map((o) => repereSur(G, gros.filter((c) => c.min === o.min), hab(o.min).ab)),
      ...t.grains.map((o) => o.lamelle ? repereSur(G, paillettes.filter((c) => c.min === o.min), hab(o.min).ab, 24) : repereSur({ lire: () => -1 }, grains.filter((c) => c.min === o.min), hab(o.min).ab)),
      ...(t.maille ? [repereSur({ lire: () => -1 }, reliques, hab(t.maille.coeur).ab)] : [])];
    const groupes = [
      ...(t.porphyro ? [{ titre: "Gros cristaux nés pendant le métamorphisme", lignes: t.porphyro.map((o) => ligne(roche, o.min, o.role)) }] : []),
      { titre: (t.titreGrains || "Grains recristallisés, soudés en mosaïque") + (t.fantomes ? " ; en pointillé, le contour du grain de sable d'origine" : ""), lignes: [...t.grains.map((o) => ligne(roche, o.min, o.role)), ...(t.maille ? [ligne(roche, t.maille.coeur, "reste de l'olivine d'origine, au cœur de certaines mailles")] : [])] },
    ];
    return { corps, reperes, mesure, legende: { titre: "Constituants", groupes } };
  };

  // FOLIÉE (schistes, micaschistes) : micas en lamelles couchées dans le plan de foliation, regroupés en films qui
  // alternent avec des lentilles de quartz aplati ; les porphyroblastes (grenat) font dévier la foliation autour d'eux.
  MODES.foliee = function (roche, t, K, R) {
    const G = Grille(), gros = [], micas = [];
    (t.porphyro || []).forEach((o) => semer(G, R, K, gros, { ...o, chevauche: 0, sections: o.sections || 8 }, o.part));
    const angle = foliation(gros, t.ondulation ?? 0.12);
    // films de micas : bandes où la pose est favorisée (quartz dans les intervalles)
    const film = (x, y) => 0.5 + 0.5 * Math.sin((y - 8 * Math.sin(x / 90)) / (t.films || 1) / K * 2.2);
    t.micas.forEach((o) => {
      const h = hab(o.min), cible = o.part * G.N;
      for (let e = 0, acq = 0, echecs = 0; e < 14000 && acq < cible && echecs < 2500; e++, echecs++) {
        const cx = -0.04 * Wp + R() * 1.08 * Wp, cy = -0.04 * Hp + R() * 1.08 * Hp;
        if (G.lire(cx, cy) >= 0 || R() > 0.25 + 0.75 * film(cx, cy)) continue;
        const L = entre(R, o.taille) * K, l = L / entre(R, o.allong), ang = angle(cx, cy) + (R() - 0.5) * 0.12;
        const pts = rectOriente(cx, cy, L, l, ang), libres = tester(G, pts, 0, 0.4);
        if (!libres || (acq > 0 && acq + libres.length - cible > 0.5 * libres.length)) continue;
        libres.forEach((c) => { G.g[c] = 5e5 + micas.length; });
        micas.push({ min: o.min, h, pts, cx, cy, L, l, ang, cel: libres.length, n: 5e5 + micas.length }); acq += libres.length; echecs = 0;
      }
    });
    const poses = mesurer(micas, G);
    const manque = t.micas.map((o) => ({ min: o.min, part: Math.max(0, o.part - (poses[o.min] || 0)), sansMarque: true })).filter((o) => o.part > 0.005);
    const grains = mosaique(G, R, K, t.taille, [...t.grains, ...manque], t.aplatissement || 2.2, 1);
    let corps = grains.map((c, i) => grainSVG(c, R, i)).join("") + micas.map((c) => cristalSVG(c, R, 0.6)).join("") + gros.map((c) => cristalSVG(c, R)).join("");
    const mesure = mesurer(gros.concat(micas), G);
    grains.forEach((c) => { mesure[c.min] = (mesure[c.min] || 0) + c.cel / G.N; });
    const reperes = [...(t.porphyro || []).map((o) => repereSur(G, gros.filter((c) => c.min === o.min), hab(o.min).ab)),
      ...t.micas.map((o) => repereSur(G, micas.filter((c) => c.min === o.min), hab(o.min).ab, 24)),
      ...t.grains.map((o) => repereSur({ lire: () => -1 }, grains.filter((c) => c.min === o.min), hab(o.min).ab))];
    const groupes = [
      ...(t.porphyro ? [{ titre: "Porphyroblastes : ont grandi dans la roche solide", lignes: t.porphyro.map((o) => ligne(roche, o.min, o.role)) }] : []),
      { titre: "Micas couchés dans la foliation", lignes: t.micas.map((o) => ligne(roche, o.min, o.role)) },
      { titre: "Grains aplatis entre les films de micas", lignes: t.grains.map((o) => ligne(roche, o.min, o.role)) },
    ];
    return { corps, reperes, mesure, legende: { titre: "Constituants", groupes } };
  };

  // RUBANÉE (gneiss, migmatites) : rubans clairs (quartz et feldspaths en mosaïque) et rubans sombres (biotite
  // alignée, grenats), séparés par la ségrégation des minéraux pendant la déformation à haute température.
  MODES.rubanee = function (roche, t, K, R) {
    const G = Grille(), amp = t.plis || 6, lam = t.longueurPli || 70, ph = R() * 6.28;
    const bords = [], types = [], reste = [t.clair.part, t.sombre.part].map((p) => p * (Hp + 60));
    for (let y = -30, k = R() < 0.5 ? 0 : 1; y < Hp + 30; k = 1 - k) {
      if (reste[k] < -10 && reste[1 - k] > 0) k = 1 - k;
      const e = entre(R, k === 0 ? t.clair.epaisseur : t.sombre.epaisseur) * K;
      bords.push(bordOndule(y, R, amp, lam, ph, 0.35)); types.push(k); reste[k] -= e; y += e;
    }
    bords.push(bordOndule(Hp + 40, R, amp, lam, ph));
    const bs = bandes(bords);
    const typeEn = (x, y) => { for (let i = 0; i < bords.length - 1; i++) if (y < bords[i + 1](x)) return types[i]; return types[types.length - 1]; };
    const pente = (x) => Math.atan(amp / lam * Math.cos(x / lam + ph));
    // grenats dans les rubans sombres, puis biotite alignée dans ces mêmes rubans
    const gros = [], micas = [];
    (t.sombre.porphyro || []).forEach((o) => {
      for (let e = 0, acq = 0; e < 3000 && acq < o.part * G.N; e++) {
        const cx = R() * Wp, cy = R() * Hp;
        if (typeEn(cx, cy) !== 1) continue;
        const L = entre(R, o.taille) * K, pts = polyRegulier(cx, cy, L / 2, L / 2, R(), 8), libres = poser(G, pts, 1e6, 0);
        if (libres) { gros.push({ min: o.min, h: hab(o.min), pts, cx, cy, L, l: L, ang: 0, cel: libres.length, n: 1e6 }); acq += libres.length; }
      }
    });
    t.sombre.micas.forEach((o) => {
      const h = hab(o.min);
      for (let e = 0, acq = 0; e < 12000 && acq < o.part * G.N; e++) {
        const cx = R() * Wp, cy = R() * Hp;
        if (G.lire(cx, cy) >= 0 || typeEn(cx, cy) !== (o.dansClair ? 0 : 1)) continue;
        const L = entre(R, o.taille) * K, l = L / entre(R, o.allong), ang = pente(cx) + (R() - 0.5) * 0.15;
        const pts = rectOriente(cx, cy, L, l, ang), libres = tester(G, pts, 0, 0.4);
        if (!libres) continue;
        libres.forEach((c) => { G.g[c] = 5e5; });
        micas.push({ min: o.min, h, pts, cx, cy, L, l, ang, cel: libres.length, n: 5e5 }); acq += libres.length;
      }
    });
    // mosaïque de quartz et feldspaths aplatie, dont l'espèce dépend du ruban où tombe le grain
    let germes = lloyd(germesPoisson(R, t.taille * K, () => true, 9000), 1, t.aplatissement || 1.6);
    const cellules = voronoi(germes, t.aplatissement || 1.6);
    const libres = [0, 0];
    for (let c = 0; c < G.N; c++) if (G.g[c] < 0) { const [x, y] = G.xy(c); libres[typeEn(x, y)]++; }
    const quotas = [t.clair.grains, t.sombre.grains].map((l, k) => { const s = l.reduce((a, o) => a + o.part, 0); return l.map((o) => o.part / s * libres[k]); });
    const grains = [];
    cellules.forEach((pts, i) => {
      if (pts.length < 3) return;
      const k = typeEn(germes[i].x, germes[i].y), liste = k === 0 ? t.clair.grains : t.sombre.grains;
      const j = quotas[k].map((v, jj) => [v + R() * 30, jj]).sort((a, b) => b[0] - a[0])[0][1];
      const cel = G.cellules(pts).filter((c) => G.g[c] < 0);
      quotas[k][j] -= cel.length;
      const [cx, cy] = centre(pts);
      grains.push({ min: liste[j].min, h: hab(liste[j].min), o: liste[j], pts, cx, cy, L: 20, l: 12, ang: pente(cx), cel: cel.length, k });
    });
    let corps = grains.map((c, i) => grainSVG(c, R, i)).join("") + micas.map((c) => cristalSVG(c, R, 0.6)).join("") + gros.map((c) => cristalSVG(c, R)).join("");
    const mesure = mesurer(gros.concat(micas), G);
    grains.forEach((c) => { mesure[c.min] = (mesure[c.min] || 0) + c.cel / G.N; });
    const tous = [...(t.sombre.porphyro || []), ...t.sombre.micas, ...t.clair.grains, ...t.sombre.grains];
    const reperes = [...(t.sombre.porphyro || []).map((o) => repereSur(G, gros, hab(o.min).ab)),
      ...t.sombre.micas.map((o) => repereSur(G, micas.filter((c) => c.min === o.min), hab(o.min).ab, 24)),
      ...t.clair.grains.map((o) => repereSur({ lire: () => -1 }, grains.filter((c) => c.min === o.min && c.k === 0 && c.cel > 40), hab(o.min).ab))];
    const vus = new Set();
    const lignesDe = (l) => l.filter((o) => !vus.has(o.min) && vus.add(o.min)).map((o) => ligne(roche, o.min, o.role));
    const nClair = Array.from({ length: G.N }, (_, c) => G.xy(c)).filter(([x, y]) => typeEn(x, y) === 0).length / G.N;
    const groupes = [
      { titre: `${t.clair.titre} (≈ ${Math.round(nClair * 100)} % de la surface)`, lignes: lignesDe(t.clair.grains) },
      { titre: `${t.sombre.titre} (≈ ${Math.round((1 - nClair) * 100)} %)`, lignes: lignesDe([...t.sombre.micas, ...(t.sombre.porphyro || []), ...t.sombre.grains]) },
    ];
    return { corps, reperes, mesure, legende: { titre: "Rubans", groupes } };
  };

  // MYLONITIQUE (roches broyées en profondeur) : porphyroclastes de feldspath arrondis, prolongés de queues de grains
  // recristallisés qui indiquent le sens du cisaillement, dans une matrice très fine de rubans de quartz et de micas.
  MODES.mylonitique = function (roche, t, K, R) {
    const G = Grille(), clastes = [];
    t.clastes.forEach((o) => {
      const h = hab(o.min);
      for (let e = 0, acq = 0; e < 3000 && acq < o.part * G.N; e++) {
        const cx = R() * Wp, cy = 20 + R() * (Hp - 40);
        if (G.lire(cx, cy) >= 0) continue;
        const L = entre(R, o.taille) * K, l = L * entre(R, [0.55, 0.8]), ang = (R() - 0.5) * 0.5;
        const pts = polyRegulier(cx, cy, L / 2, l / 2, ang, 12);
        // zone de garde élargie (queues comprises) pour que les clastes ne se touchent pas
        const garde = polyRegulier(cx, cy, L * 1.3, l * 0.9, 0, 12);
        if (!tester(G, garde, 0, 0)) continue;
        const libres = poser(G, pts, clastes.length, 0);
        if (!libres) continue;
        clastes.push({ min: o.min, h, pts, cx, cy, L, l, ang, cel: libres.length, n: clastes.length }); acq += libres.length;
      }
    });
    // matrice : bandes horizontales (rubans de quartz, matrice fine, films de micas) écartées autour des clastes,
    // comme un feuilletage qui s'ouvre pour laisser passer un objet rigide
    const ecart = (x, y) => clastes.reduce((d, c) => {
      const u = (x - c.cx) / (c.L * 1.1), v = y - c.cy;
      if (Math.abs(u) >= 1) return d;
      const w = (1 - u * u) ** 2 * Math.exp(-Math.abs(v) / (c.l * 0.9));
      return d + Math.tanh(v / (0.2 * c.l)) * (c.l * 0.52) * w;   // l'ouverture ≈ la taille du claste, qui la recouvre
    }, 0);
    const bords = [], types = [], TL = t.matrice.lignes, reste = TL.map((l) => l.part * (Hp + 28));
    for (let y = -14; y < Hp + 14;) {
      // type de bande : celui à qui il manque la plus grande part de sa cible, un peu brassé
      const k = TL.map((l, i) => [reste[i] / l.part + R() * 25, i]).sort((a, b) => b[0] - a[0])[0][1], e = entre(R, TL[k].largeur);
      reste[k] -= e;
      const base = bordOndule(y, R, 1.2, 60, R() * 6, 0.5);
      bords.push((x) => { const y0 = base(x); return y0 + ecart(x, y0); }); types.push(k); y += e;
    }
    bords.push(() => Hp + 20);
    let fond = fondRect("bande:fine", t.matrice.fond);
    const bs = bandes(bords);
    fond += bs.map((b) => tg("bande:" + (TL[types[b.i]].min || "fine"), poly(b.pts, t.matrice.lignes[types[b.i]].couleur))).join("");
    // queues de recristallisation : minces coins étirés dans le sens du cisaillement (dextre : en haut à droite, en bas à gauche)
    const quad = (a, c, b, n = 8) => Array.from({ length: n }, (_, j) => { const u = j / n; return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]; });
    const mesure = mesurer(clastes, G);
    const queues = clastes.map((c) => [1, -1].map((sg) => {
      const P0 = [c.cx + sg * c.L * 0.3, c.cy - sg * c.l * 0.42], P1 = [c.cx + sg * c.L * 0.95, c.cy - sg * c.l * 0.05], P2 = [c.cx + sg * c.L * 0.45, c.cy + sg * c.l * 0.1];
      const pts = quad(P0, [c.cx + sg * c.L * 0.7, c.cy - sg * c.l * 0.5], P1).concat(quad(P1, [c.cx + sg * c.L * 0.65, c.cy - sg * c.l * 0.12], P2));
      const libres = poser(G, pts, 7e5, 1, 0);       // les queues passent sous le claste
      if (libres) mesure["queues:" + c.min] = (mesure["queues:" + c.min] || 0) + libres.length / G.N;
      return tg("queues:" + c.min, poly(pts, c.h.queue || t.queue, contour(0.5)));
    }).join("")).join("");
    const corps = fond + queues + clastes.map((c) => cristalSVG(c, R)).join("");
    bs.forEach((b) => {
      const cle = "bande:" + (TL[types[b.i]].min || "fine");
      mesure[cle] = (mesure[cle] || 0) + G.cellules(b.pts).filter((c) => G.g[c] < 0).length / G.N;
    });
    const reperes = [...t.clastes.map((o) => repereSur(G, clastes.filter((c) => c.min === o.min), hab(o.min).ab, 20)),
      // « Qz » sur le ruban de quartz le plus épais, là où aucun claste ne le recouvre
      (() => {
        let best = null;
        bs.forEach((b) => {
          if (!t.matrice.lignes[types[b.i]].role || t.matrice.lignes[types[b.i]].min !== "quartz") return;
          b.xs.forEach((x, k) => {
            const e = b.bas[k] - b.haut[k], y = (b.haut[k] + b.bas[k]) / 2;
            if (x > 40 && x < Wp - 40 && y > 20 && y < Hp - 30 && G.lire(x, y) < 0 && clastes.every((c) => Math.hypot((x - c.cx) / (c.L * 1.2), (y - c.cy) / c.l) > 1) && (!best || e > best.e)) best = { e, x, y };
          });
        });
        return best ? { ab: "Qz", x: best.x, y: best.y, petit: best.e < 14 } : null;
      })(),
      ...TL.filter((l) => l.role && l.min && l.min !== "quartz").map((l) => {
        let best = null;
        bs.forEach((b) => {
          if (TL[types[b.i]] !== l) return;
          b.xs.forEach((x, k) => {
            const e = b.bas[k] - b.haut[k], y = (b.haut[k] + b.bas[k]) / 2;
            if (x > 40 && x < Wp - 40 && y > 20 && y < Hp - 30 && G.lire(x, y) < 0 && (!best || e > best.e)) best = { e, x, y };
          });
        });
        return best ? { ab: hab(l.min).ab, x: best.x, y: best.y, petit: true } : null;
      })];
    const groupes = [
      { titre: "Porphyroclastes : restes de gros cristaux, arrondis par le frottement", lignes: [
        ...t.clastes.map((o) => ligne(roche, o.min, o.role)),
        { nom: "Queues de recristallisation", cle: t.clastes.map((o) => "queues:" + o.min), role: "feldspath réduit en grains fins, traîné derrière les clastes ; en marches d'escalier montant vers la droite : le haut du schéma a glissé vers la droite", couleur: t.queue },
      ] },
      { titre: "Matrice broyée et recristallisée, étirée en rubans", lignes:
        TL.filter((l) => l.role).map((l) => (l.min ? { ...ligne(roche, l.min, l.role, "bande:" + l.min), couleur: l.couleur } : { nom: l.nom, role: l.role, couleur: l.couleur, cle: "bande:fine" })) },
    ];
    return { corps, reperes, mesure, legende: { titre: "Constituants", groupes } };
  };

  //@@MODES@@

  // ─────────────────────────────── réglages par roche ───────────────────────────────
  const TEXTURES_ROCHE = {
    granite: {
      mode: "grenue", nom: "grenue", champ: 30, vue: "Surface sciée et polie",
      grain: "cristaux jointifs de 2 à 8 mm, tous visibles à l'œil nu",
      intro: "Le magma a refroidi lentement, à plusieurs kilomètres de profondeur : les cristaux ont eu le temps de grandir et se touchent tous, sans verre ni pâte fine entre eux.",
      ordre: [
        { min: "biotite", temps: 1, taille: [1.3, 2.6], allong: [2, 3.4], chevauche: 0.02, amas: 0.45 },
        { min: "plagioclases", temps: 1, taille: [2.6, 5], allong: [1.5, 2.3], chevauche: 0, biseau: 0.18 },
        { min: "orthose", temps: 2, taille: [4.5, 8.5], allong: [1.4, 1.9], chevauche: 0.3, biseau: 0.1 },
        { min: "muscovite", temps: 2, taille: [1.4, 2.4], allong: [2, 3], chevauche: 0.25 },
        { min: "quartz", temps: 3, espacement: 3 },
      ],
      temps: ["Formés en premier : entiers, à faces nettes", "Puis : s'arrêtent contre les premiers (moulés sur eux)", "En dernier : remplit les vides"],
    },
    microgranite: {
      mode: "porphyrique", nom: "microgrenue porphyrique", champ: 30, vue: "Surface sciée et polie",
      grain: "phénocristaux de 2 à 10 mm dans une pâte aux grains invisibles à l'œil nu",
      intro: "Le magma a commencé à cristalliser lentement en profondeur, puis il est monté en filon où il a refroidi vite : les cristaux déjà formés sont restés gros, le reste a donné une pâte fine.",
      phenos: [
        { min: "orthose", part: 0.12, taille: [4, 10], allong: [1.4, 2], biseau: 0.1 },
        { min: "quartz", part: 0.08, taille: [2, 4.5], allong: [1, 1.15], sections: 6, role: "grains gris à six côtés (bipyramides)" },
        { min: "plagioclases", part: 0.07, taille: [2, 4.5], allong: [1.5, 2.3], biseau: 0.18 },
        { min: "biotite", part: 0.03, taille: [1.2, 2.5], allong: [1.6, 2.6] },
      ],
      pate: { nom: "Pâte microgrenue", fond: "#dcc6b8", taches: ["#b9bebc", "#f5f2ea", "#e3ae94", "#2f2a27"], pas: 4, role: "quartz, feldspaths et micas en grains de moins de 0,5 mm" },
    },
    basalte: {
      mode: "microlitique", nom: "microlitique", champ: 5, vue: "Vue au microscope", fluidalite: 0.3, flux: 0.2,
      grain: "phénocristaux de 0,5 à 1,5 mm dans une pâte de microlites de quelques dixièmes de millimètre",
      intro: "Les phénocristaux ont grandi dans la chambre magmatique ; pendant la remontée et l'épanchement, la lave a refroidi en quelques jours à quelques années selon l'épaisseur de la coulée : les microlites n'ont pas eu le temps de grandir, et un peu de liquide s'est figé en verre.",
      vacuoles: [{ part: 0.04, taille: [0.3, 0.8], aplat: [0.65, 0.95] }],
      phenos: [
        { min: "olivine", part: 0.08, taille: [0.5, 1.3], allong: [1.2, 1.6], sections: 6, role: "grains vert-jaune craquelés, à six côtés" },
        { min: "pyroxenes", part: 0.07, taille: [0.4, 1.1], allong: [1, 1.4], sections: 8, role: "sections vertes à huit côtés, clivages en croix" },
        { min: "plagioclases", part: 0.05, taille: [0.6, 1.5], allong: [3, 5], biseau: 0.15, role: "longues tablettes striées" },
      ],
      microlites: [
        { min: "plagioclases", part: 0.26, taille: [0.2, 0.5], allong: [5, 8], chevauche: 0, role: "baguettes blanches" },
      ],
      pate: { nom: "Verre et petits grains", fond: "#4b423c", taches: ["#7d8f55", "#7d8f55", "#c3cc6a", "#141414", "#141414"], pas: 3, rayon: [0.8, 1.7],
        role: "pyroxène (vert), olivine (vert-jaune) et magnétite (noir) dans le liquide figé" },
    },
    obsidienne: {
      mode: "vitreuse", nom: "vitreuse", champ: 4, vue: "Vue au microscope", plis: 9, lits: [10, 30],
      teintes: ["#dcd6ca", "#d1c9ba", "#c6bcaa"], cristallites: 900, couleurCristallites: "#3a332e",
      grain: "presque tout est du verre ; les rares cristaux font quelques dixièmes de millimètre",
      intro: "La lave, très riche en silice et pauvre en eau, était si visqueuse que les atomes n'ont pas pu s'assembler en cristaux avant qu'elle ne se fige : elle est devenue un verre, qui garde la trace de son écoulement.",
      cristaux: [
        { min: "sanidine", part: 0.035, taille: [0.2, 0.45], allong: [1.6, 2.4], biseau: 0.1, role: "petits cristaux limpides" },
        { min: "quartz", part: 0.02, taille: [0.12, 0.25], allong: [1, 1.2], sections: 6, role: "petits grains à six côtés" },
        { min: "magnetite", part: 0.02, taille: [0.03, 0.08], allong: [1, 1], sections: 4 },
      ],
    },
    ignimbrite: {
      mode: "pyroclastique", nom: "pyroclastique soudée (ignimbrite)", champ: 15, vue: "Surface sciée et polie", soude: true, echardes: 260,
      grain: "fragments de cristaux de 0,2 à 2 mm et flammèches de verre de quelques millimètres",
      intro: "Un écoulement pyroclastique, mélange de gaz, de cendre et de ponces à plusieurs centaines de degrés, s'est déposé d'un coup ; encore assez chaud (au-dessus d'environ 600 °C) pour que le verre soit mou, il s'est tassé et soudé : les ponces écrasées forment des flammèches alignées.",
      ponces: { part: 0.14, taille: [2.5, 7], fond: "#3d3531" },
      cristaux: [
        { min: "sanidine", part: 0.15, taille: [0.9, 2.6], allong: [1.3, 2], biseau: 0.1, essais: 3000, role: "éclats limpides" },
        { min: "quartz", part: 0.15, taille: [0.7, 2], allong: [1, 1.3], sections: 6, essais: 4000, role: "éclats gris" },
        { min: "plagioclases", part: 0.075, taille: [0.8, 2.2], allong: [1.5, 2.4], biseau: 0.15, essais: 3000, role: "éclats blancs striés" },
        { min: "biotite", part: 0.045, taille: [0.6, 1.5], allong: [2, 3.5], casse: 0, essais: 3000, role: "paillettes noires" },
        { min: "magnetite", part: 0.03, taille: [0.15, 0.35], allong: [1, 1], sections: 4, casse: 0, essais: 3000 },
      ],
      cendre: { fond: "#cdb7a3", taches: ["#b9a391", "#ddd0c2", "#a89383"], echarde: "#efe7dc" },
    },
    gres: {
      mode: "detritique", nom: "détritique (arénacée)", champ: 3, vue: "Vue au microscope", taille: [0.1, 0.5], arrondi: 1, jointif: [0.97, 1.03],
      grain: "grains de sable de 0,1 à 0,5 mm, assez bien triés et arrondis, qui se touchent",
      intro: "Des grains de sable usés par un long transport se sont déposés, puis ont été enfouis : l'eau qui circulait entre eux a précipité un ciment qui les a soudés.",
      grains: [
        { min: "quartz", part: 0.85, enduit: 0.15, sansMarque: true, role: "grains gris arrondis" },
        { min: "orthose", part: 0.05, role: "grains roses, plus rares" },
      ],
      liant: { titre: "Ensuite, entre les grains", nom: "Ciment", fond: "#e4dccb", taches: ["#d6ccb6", "#efe9dc", "#b8742f"],
        role: "silice qui soude les grains, oxyde de fer en liseré brun, paillettes de mica" },
    },
    breche_sedimentaire: {
      mode: "detritique", nom: "bréchique", champ: 30, vue: "Surface sciée et polie", taille: [2, 9], arrondi: 0, jointif: [0.88, 0.97], serre: 0.95,
      titreGrains: "Clastes : morceaux de roche anguleux, peu transportés",
      grain: "fragments anguleux de 2 à 10 mm, de tailles très variées, dans une matrice fine",
      intro: "Des fragments arrachés à une falaise ou à un escarpement de faille se sont accumulés au pied, sans être roulés ni triés ; une boue rougeâtre a rempli les vides puis s'est cimentée.",
      grains: [
        { cle: "calcite", ab: "Cal", nom: "Calcaire", fond: "#ece4d2", taches: "#cfc2a6", part: 0.45, role: "clastes clairs (calcite)" },
        { cle: "quartz", ab: "Qz", nom: "Quartz", fond: "#c7cbc9", part: 0.3, role: "éclats gris" },
        { cle: "dolomite", ab: "Dol", nom: "Dolomie", fond: "#dcc6a0", taches: "#c2a97e", part: 0.05, role: "clastes beiges" },
      ],
      liant: { titre: "Matrice : boue durcie entre les clastes", nom: "Matrice", fond: "#b57a58", taches: ["#9e6446", "#c79070", "#c7cbc9"],
        role: "argile rougie par l'oxyde de fer" },
    },
    siltite: {
      mode: "litee", nom: "litée", champ: 6, vue: "Vue au microscope", ondulation: 2.5,
      grain: "lits de 0,1 à 1 mm, grains de silt de quelques centièmes de millimètre",
      intro: "Au fond d'un lac ou d'une mer calme, des apports un peu plus grossiers (crues, tempêtes) ont alterné avec la lente décantation des argiles : chaque lit enregistre un épisode de dépôt.",
      lits: [
        { cle: "silt", ab: "S", nom: "Lits silteux", part: 0.6, epaisseur: [0.25, 1], fond: "#cfc6b4", taches: ["#b9bebc", "#b9bebc", "#e8e2d4", "#a0927b"], micas: 1.2, role: "grains de quartz et paillettes de mica couchées" },
        { cle: "argile", ab: "A", nom: "Lits argileux", part: 0.4, epaisseur: [0.08, 0.5], fond: "#8f8373", taches: ["#7d7263", "#9f937f", "#86a77e"], micas: 0.3, mica: "#bdb49c", role: "illite et chlorite, très fines" },
      ],
    },
    calcaire: {
      mode: "bioclastique", nom: "bioclastique", champ: 8, vue: "Vue au microscope",
      grain: "débris de 0,2 à 3 mm dans une boue calcaire aux grains invisibles (quelques millièmes de millimètre)",
      intro: "Sur le fond d'une mer chaude, peu profonde et assez calme pour que la boue se dépose, les coquilles et squelettes calcaires des êtres vivants se sont accumulés dans une boue de calcite, qui a durci en s'enfouissant.",
      elements: [
        { type: "coquille", ab: "Co", nom: "Coquilles", part: 0.17, taille: [1.2, 3.2], role: "fragments courbes de bivalves et de brachiopodes" },
        { type: "entroque", ab: "En", nom: "Entroques", part: 0.11, taille: [0.6, 1.3], couleur: "#eee6d6", role: "articles de crinoïdes, percés d'un canal" },
        { type: "foraminifere", ab: "Fo", nom: "Foraminifères", part: 0.09, taille: [0.5, 1], couleur: "#fbf8f0", role: "loges enroulées d'organismes unicellulaires" },
        { type: "grain", ab: "Qz", min: "quartz", part: 0.02, taille: [0.1, 0.3], role: "rares grains de sable" },
      ],
      fond: { titre: "Liant", nom: "Micrite", fond: "#d8cdb8", taches: ["#c9bda5", "#e3dac8", "#9c8f7b", "#b8742f"], role: "boue de calcite très fine, avec un peu d'argile et d'oxyde de fer" },
    },
    quartzite: {
      mode: "mosaique", nom: "granoblastique (en mosaïque)", champ: 4, vue: "Vue au microscope", taille: 0.32, fantomes: 0.35,
      grain: "grains de quartz de 0,2 à 0,5 mm, soudés par des joints droits",
      intro: "Un grès enfoui et chauffé a recristallisé : les grains de sable et leur ciment se sont soudés en une mosaïque de quartz sans vides ; la roche casse à travers les grains, et non plus entre eux.",
      grains: [
        { min: "quartz", part: 0.95, sansMarque: true, role: "grains polygonaux, jointifs" },
        { min: "muscovite", part: 0.03, lamelle: true, taille: [0.2, 0.45], allong: [3, 5], role: "rares paillettes" },
        { min: "goethite", part: 0.02, sansMarque: true, role: "grains d'oxyde de fer" },
      ],
    },
    marbre: {
      mode: "mosaique", nom: "granoblastique (en mosaïque)", champ: 8, vue: "Vue au microscope", taille: 0.7,
      grain: "cristaux de calcite de 0,3 à 1 mm, jointifs",
      intro: "Un calcaire chauffé en profondeur a recristallisé sans fondre : la boue et les coquilles ont disparu, remplacées par des cristaux de calcite plus gros, soudés en mosaïque, marqués de lamelles de macle.",
      grains: [
        { min: "calcite", part: 0.96, role: "cristaux clairs à lamelles de macle obliques" },
        { min: "dolomite", part: 0.02, role: "quelques grains beiges" },
        { min: "muscovite", part: 0.01, lamelle: true, taille: [0.4, 0.9], allong: [3, 5], role: "rares paillettes" },
      ],
    },
    micaschiste: {
      mode: "foliee", nom: "foliée (schisteuse)", champ: 10, vue: "Vue au microscope", taille: 0.5, aplatissement: 2.4, films: 0.9,
      grain: "micas de 0,5 à 2 mm couchés dans un même plan, grenats de 1 à 3 mm",
      intro: "Une roche argileuse enfouie à 15–25 km dans une chaîne de montagnes a recristallisé sous pression : les micas ont grandi à plat, perpendiculairement à la compression, ce qui feuillette la roche ; les grenats, plus rigides, ont grandi dans la roche et le feuilletage s'est moulé autour d'eux en s'aplatissant.",
      porphyro: [{ min: "grenat", part: 0.08, taille: [1.2, 2.8], allong: [1, 1.1], sections: 8, role: "gros cristaux rouges contournés par la foliation" }],
      micas: [
        { min: "chlorite_m", part: 0.07, taille: [0.7, 1.6], allong: [4, 7], role: "lamelles vertes" },
        { min: "biotite", part: 0.15, taille: [0.7, 1.8], allong: [4, 7], role: "lamelles noires" },
        { min: "muscovite", part: 0.34, taille: [0.8, 2.4], allong: [5, 8], role: "lamelles argentées" },
      ],
      grains: [
        { min: "quartz", part: 0.31, sansMarque: true, role: "lentilles de grains aplatis" },
        { min: "plagioclases", part: 0.05, sansMarque: true, role: "grains blancs" },
      ],
    },
    gneiss: {
      mode: "rubanee", nom: "rubanée (gneissique)", champ: 20, vue: "Surface sciée et polie", taille: 0.9, aplatissement: 1.7, plis: 7,
      grain: "rubans clairs et sombres de 1 à 5 mm, grains de 0,5 à 2 mm",
      intro: "À 20–30 km de profondeur et vers 600–700 °C, la roche s'est déformée sans fondre : ses minéraux se sont séparés en rubans, clairs (quartz et feldspaths) ou sombres (biotite et grenat), étirés dans le sens de la déformation.",
      clair: { titre: "Rubans clairs", part: 0.62, epaisseur: [1.5, 4.5], grains: [
        { min: "quartz", part: 0.27, sansMarque: true, role: "grains gris" },
        { min: "orthose", part: 0.33, role: "grains roses" },
        { min: "plagioclases", part: 0.17, role: "grains blancs striés" },
      ] },
      sombre: { titre: "Rubans sombres", part: 0.38, epaisseur: [1.2, 2.8],
        micas: [{ min: "biotite", part: 0.12, taille: [0.9, 2.2], allong: [3, 5], role: "paillettes noires alignées" },
          { min: "muscovite", part: 0.05, taille: [0.8, 1.8], allong: [3, 5], role: "paillettes argentées" }],
        porphyro: [{ min: "grenat", part: 0.03, taille: [0.8, 1.6], role: "petits cristaux rouges" }],
        grains: [{ min: "plagioclases", part: 0.5, role: "grains blancs entre les micas" }, { min: "quartz", part: 0.5, sansMarque: true, role: "grains gris" }] },
    },
    mylonite: {
      mode: "mylonitique", nom: "mylonitique (œillée)", champ: 10, vue: "Vue au microscope", queue: "#efd9cb",
      grain: "porphyroclastes de 0,5 à 3 mm dans une matrice aux grains de quelques centièmes de millimètre",
      intro: "Dans une zone de cisaillement, à plus de 10 km de profondeur (au-delà d'environ 300 °C, là où le quartz se déforme sans casser), la roche a été laminée à l'état solide : les grains se sont réduits et étirés en rubans, seuls les feldspaths, plus résistants, ont survécu en « yeux » arrondis.",
      clastes: [
        { min: "orthose", part: 0.16, taille: [1.2, 3], role: "yeux roses, en deux moitiés" },
        { min: "plagioclases", part: 0.12, taille: [0.8, 2], role: "yeux blancs striés" },
      ],
      matrice: { fond: "#bfc3be", lignes: [
        { min: "quartz", part: 0.4, couleur: "#dcdedb", largeur: [2, 5], role: "rubans de quartz recristallisé" },
        { min: "muscovite", part: 0.15, couleur: "#cdbf93", largeur: [1, 2], role: "films de micas blancs" },
        { min: "chlorite_m", part: 0.07, couleur: "#6f9468", largeur: [0.8, 1.6], role: "films de chlorite" },
        { nom: "Matrice fine", part: 0.05, couleur: "#b3b8b2", largeur: [1, 2.5], role: "grains broyés d'épidote et de feldspath" },
      ] },
    },
    //@@ROCHES@@
  };

  // ─────────────────────────────── cadre, repères, échelle, légende ───────────────────────────────
  function dessiner(roche, t, res, K) {
    const M = 12, cadre = nid("txc");
    let s = `<svg class="tex-svg" viewBox="${-M} ${-M} ${Wp + 2 * M} ${Hp + 2 * M}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schéma de la texture ${t.nom} : ${roche.nom.toLowerCase()}">`;
    s += `<clipPath id="${cadre}"><rect x="0" y="0" width="${Wp}" height="${Hp}" rx="6"/></clipPath><g clip-path="url(#${cadre})">${res.corps}</g>`;
    s += `<rect x="0" y="0" width="${Wp}" height="${Hp}" rx="6" fill="none" stroke="${BORD}" stroke-width="1.4"/>`;

    const poses = [[40, Hp - 16, 70]];   // la réglette d'échelle occupe le coin bas-gauche
    const libre = (x, y) => x > 14 && x < Wp - 14 && y > 10 && y < Hp - 12 && poses.every(([u, v, w = 26]) => Math.abs(u - x) > w || Math.abs(v - y) > 17);
    const etiquette = (ab, x, y, px, py) => {
      poses.push([x, y]);
      const w = 8 + ab.length * 7;
      let e = px != null ? trait(px, py, x, y, "#ffffff", 2.4) + trait(px, py, x, y, BORD, 0.9) + `<circle cx="${r1(px)}" cy="${r1(py)}" r="1.6" fill="${BORD}"/>` : "";
      return `<g class="tex-etq">` + e + `<rect x="${r1(x - w / 2)}" y="${r1(y - 7)}" width="${w}" height="14" rx="3" fill="#ffffff" fill-opacity=".92" stroke="${BORD}" stroke-width=".7"/>`
        + `<text x="${r1(x)}" y="${r1(y + 3.4)}" text-anchor="middle" class="tex-ab">${ab}</text></g>`;
    };
    res.reperes.filter(Boolean).forEach((r) => {
      if (!r.petit && libre(r.x, r.y)) { s += etiquette(r.ab, r.x, r.y); return; }
      for (const [dx, dy] of [[22, -18], [-22, -18], [22, 18], [-22, 18], [32, 0], [-32, 0], [0, -24], [0, 24]]) {
        if (libre(r.x + dx, r.y + dy)) { s += etiquette(r.ab, r.x + dx, r.y + dy, r.x, r.y); return; }
      }
    });

    const mm = [10, 5, 2, 1, 0.5, 0.2, 0.1].find((v) => v * K <= 90) || 0.1, el = mm * K, ex = 10, ey = Hp - 10;
    s += `<g class="tex-etq"><rect x="${ex - 4}" y="${ey - 15}" width="${r1(el + 8)}" height="20" rx="3" fill="#ffffff" fill-opacity=".92"/>`;
    s += trait(ex, ey, ex + el, ey, BORD, 1.6) + trait(ex, ey - 3, ex, ey + 3, BORD, 1.2) + trait(ex + el, ey - 3, ex + el, ey + 3, BORD, 1.2);
    s += `<text x="${r1(ex + el / 2)}" y="${r1(ey - 5)}" text-anchor="middle" class="tex-ech">${String(mm).replace(".", ",")} mm</text></g>`;
    return s + "</svg>";
  }

  // ─────────────────────────────── variétés et faciès (C.8, 06/10/2026) ───────────────────────────────
  // Chaque variété du panneau « Variétés & faciès » = le schéma de la roche, légèrement modifié. Réglages dans
  // textures-varietes.js : `VARIETES[id de la roche][rang de la variété dans la fiche] = { comp, t, f, copie, ecart }`
  //   comp  : { minéral: % } — teneurs imposées (0 = retiré), les autres minéraux de la fiche gardent leurs rapports ;
  //   t     : réglages de texture remplacés (un objet simple, ex. `pate`, est fusionné clé par clé) ;
  //   f     : (t, roche) → t, pour retoucher une liste (`ordre`, `phenos`, `grains`…) ;
  //   copie : id d'une autre fiche dont on reprend la composition et le schéma (« voir sa fiche ») ;
  //   ecart : ce qui change sur le schéma, en une phrase.
  const VARIETES = {};
  const cache = {};
  const r10 = (x) => Math.round(x * 10) / 10;
  // composition d'une variété : teneurs imposées, les autres ramenées au reste en gardant leurs rapports
  function composer(base, comp) {
    const fixes = Object.entries(comp).filter(([, p]) => p > 0), sf = fixes.reduce((a, [, p]) => a + p, 0);
    const autres = (base || []).filter(([m]) => !(m in comp)), sa = autres.reduce((a, [, p]) => a + p, 0) || 1;
    const k = Math.max(0, 100 - sf) / sa;
    const l = [...fixes, ...autres.map(([m, p]) => [m, p * k])].filter(([, p]) => p > 0);
    const tot = l.reduce((a, [, p]) => a + p, 0) || 1;            // toujours ramené à 100 %
    return l.map(([m, p]) => [m, r10(p * 100 / tot)]).sort((a, b) => b[1] - a[1]);
  }
  function variante(roche, i) {
    const v = (VARIETES[roche.id] || [])[i];
    if (!v) return null;
    const src = v.copie ? (typeof ROCHES !== "undefined" && ROCHES.find((r) => r.id === v.copie)) || roche : roche;
    const mineraux = v.comp ? composer(src.mineraux, v.comp) : src.mineraux;
    return { v, src, rv: { ...src, id: roche.id + "~" + i, base: src.id, nom: ((roche.varietes || [])[i] || {}).nom || src.nom, mineraux } };
  }
  // fusion d'un réglage : les objets simples (pâte, liant, fond…) sont complétés clé par clé, le reste est remplacé
  function fusion(t, p) {
    const o = { ...t };
    Object.entries(p).forEach(([k, v]) => {
      const objet = (x) => x && typeof x === "object" && !Array.isArray(x);
      o[k] = objet(v) && objet(t[k]) ? { ...t[k], ...v } : v;
    });
    return o;
  }
  // `i` (facultatif) : rang de la variété dans la fiche
  function tirage(roche, i) {
    let r = roche, t0 = TEXTURES_ROCHE[roche.id], v = null;
    if (i != null) {
      const x = variante(roche, i);
      if (!x) return null;
      ({ rv: r, v } = x);
      t0 = TEXTURES_ROCHE[x.src.id] && (v.t ? fusion(TEXTURES_ROCHE[x.src.id], v.t) : TEXTURES_ROCHE[x.src.id]);
    }
    if (!t0 || !MODES[t0.mode]) return null;
    if (!cache[r.id]) {
      // un réglage peut être une fonction de la roche (composition lue au moment du dessin : les fiches historiques
      // ne reçoivent leurs minéraux qu'au chargement d'app.js)
      let t = Object.fromEntries(Object.entries(t0).map(([k, w]) => [k, typeof w === "function" ? w(r) : w]));
      if (v && v.f) t = v.f(t, r) || t;
      if (!MODES[t.mode]) return null;
      const K = Wp / t.champ;
      const res = MODES[t.mode](r, t, K, alea("texture-" + r.id));
      completerLegende(r, res.legende, res.mesure);
      cache[r.id] = { t, K, res, mesure: res.mesure, roche: r, variete: v };
    }
    return cache[r.id];
  }
  const fmt = (x) => String(x).replace(".", ",");
  // pourcentage d'une ligne : surface mesurée ; une ligne de fond (pâte, verre, ciment, matrice) détaille aussi ce qu'elle
  // contient = composition de la fiche moins ce qui est déjà dessiné en cristaux ou en grains, ramenée à sa surface
  function completerLegende(roche, L, mesure) {
    const dessine = {};
    Object.entries(mesure).forEach(([k, v]) => { const m = minDe(k); if (m) dessine[m] = (dessine[m] || 0) + v; });
    L.groupes.forEach((g) => g.lignes.forEach((m) => {
      if (m.pct == null && m.cle != null) m.pct = [].concat(m.cle).reduce((a, k) => a + (mesure[k] || 0), 0) * 100;
      if (!m.fond) return;
      const reste = (roche.mineraux || []).map(([mid]) => [mid, Math.max(0, partMin(roche, mid) - (dessine[mid] || 0))]).filter(([, x]) => x > 0);
      const somme = reste.reduce((a, [, x]) => a + x, 0);
      if (!somme) return;
      m.contenu = reste.map(([mid, x]) => [nomMin(mid).toLowerCase(), x / somme * m.pct]).filter(([, x]) => x >= 0.5)
        .sort((a, b) => b[1] - a[1]).map(([n, x]) => `${n} ${x < 1 ? "< 1 %" : "≈ " + fmtPct(x)}`).join(", ");
    }));
  }
  const fmtPct = (x) => (x < 1 ? "< 1 %" : `${Math.round(x)} %`);

  // ─────────────────────────────── infobulle : ce qu'il y a sous la souris ───────────────────────────────
  // chaque élément du dessin porte `data-k` (clé de mesure) ; la figure porte la table clé → ligne de légende
  // `m` = fiche minéral à ouvrir au clic, seulement si l'élément EST ce minéral (pas « Galets de granite » rangés sous l'orthose)
  const aFiche = (mid) => !!(mid && typeof MINERAUX !== "undefined" && MINERAUX[mid]);
  function infos(res) {
    const L = res.legende, plusieurs = L.groupes.length > 1, out = {};
    L.groupes.forEach((g, i) => g.lignes.forEach((m) => [].concat(m.cle ?? []).forEach((k) => {
      const mid = minDe(k);
      out[k] = { n: m.nom, p: m.pct, r: m.role || "", d: m.contenu || "", g: g.titre ? (plusieurs ? `${i + 1} · ` : "") + g.titre : "", c: m.couleur,
        m: aFiche(mid) && m.nom === nomMin(mid) ? mid : "" };
    })));
    Object.entries(res.mesure).forEach(([k, x]) => {
      if (out[k]) return;
      const m = minDe(k);
      if (m) out[k] = { n: nomMin(m), p: x * 100, r: hab(m).role || "", d: "", g: "", c: hab(m).fond, m: aFiche(m) ? m : "" };
    });
    return out;
  }
  const attrJSON = (o) => JSON.stringify(o).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/</g, "&lt;");
  let bulle = null, bulleCle = "";
  const cacherBulle = () => { if (bulle && !bulle.hidden) { bulle.hidden = true; bulleCle = ""; } };
  function suivre(e) {
    const el = e.target && e.target.closest ? e.target.closest("[data-k]") : null;
    const fig = el && el.closest("[data-tx]");
    if (!fig) return cacherBulle();
    const I = fig._tx || (fig._tx = JSON.parse(fig.dataset.tx)), k = el.dataset.k, x = I[k];
    if (!x) return cacherBulle();
    // clic = fiche du minéral dans le panneau latéral : app.js ouvre tout élément `data-min` (posé ici, au premier survol ou appui)
    if (x.m && !el.dataset.min) el.dataset.min = x.m;
    if (!bulle) {
      bulle = document.createElement("div");
      bulle.className = "tex-bulle"; bulle.setAttribute("role", "tooltip"); bulle.hidden = true;
      document.body.appendChild(bulle);
    }
    if (!fig._txId) fig._txId = nid("txf");
    if (bulleCle !== fig._txId + k) {
      bulleCle = fig._txId + k;
      bulle.innerHTML = `<b><i style="background:${x.c || "#999"}"></i>${x.n}${x.p != null ? ` <small>≈ ${fmtPct(x.p).replace("< 1 %", "1 %")} du schéma</small>` : ""}</b>`
        + (x.r ? `<span>${x.r}</span>` : "") + (x.d ? `<span>dont ${x.d}</span>` : "") + (x.g ? `<em>${x.g}</em>` : "")
        + (x.m ? `<em class="tex-bulle-clic">Cliquer pour ouvrir sa fiche</em>` : "");
    }
    bulle.hidden = false;
    const w = bulle.offsetWidth, h = bulle.offsetHeight;
    let X = e.clientX + 16, Y = e.clientY + 18;
    if (X + w > innerWidth - 8) X = Math.max(8, e.clientX - w - 12);
    if (Y + h > innerHeight - 8) Y = Math.max(8, e.clientY - h - 12);
    bulle.style.left = X + "px"; bulle.style.top = Y + "px";
  }
  if (typeof document !== "undefined") {
    document.addEventListener("pointermove", suivre, { passive: true });
    document.addEventListener("pointerdown", suivre, { passive: true });     // au doigt : un appui montre la bulle
    document.addEventListener("scroll", cacherBulle, { passive: true, capture: true });
    document.addEventListener("pointerleave", cacherBulle);
  }

  function panneau(roche) {
    const tir = tirage(roche);
    if (!tir) return null;
    const { t, K, res } = tir;
    const L = res.legende, plusieurs = L.groupes.length > 1;
    completerLegende(roche, L, res.mesure);
    const groupes = L.groupes.map((g, i) => {
      const lignes = g.lignes.map((m) => `<li><span class="tex-sw" style="background:${m.couleur}"></span><b class="tex-abr">${m.ab || ""}</b>`
        + `<span class="tex-nom">${m.nom}${m.pct != null ? ` <small>≈ ${fmtPct(m.pct).replace("< 1 %", "1 %")}</small>` : ""}${m.role ? `<span>${m.role}</span>` : ""}`
        + `${m.contenu ? `<span>dont ${m.contenu}</span>` : ""}</span></li>`).join("");
      return `<li class="tex-temps${plusieurs ? "" : " tex-seul"}">${plusieurs ? `<span class="tex-num">${i + 1}</span>` : "<span></span>"}<div>${g.titre ? `<p>${g.titre}</p>` : ""}<ul>${lignes}</ul></div></li>`;
    }).join("");
    return `<div class="tex">
      <figure class="tex-fig" data-tx='${attrJSON(infos(res))}'>${dessiner(roche, t, res, K)}
</figure>
      <div class="tex-cote"><ol class="tex-ordre">${groupes}</ol></div>
    </div>
`;
  }

  // ce qui change d'une variété à l'autre, quand la fiche n'a pas d'`ecart` écrit : les teneurs qui bougent d'au moins 2 points
  // proportions qui changent d'une variété à l'autre (teneurs de la fiche ramenées à 100 %, arrondies) : « Quartz 30 → 20 % »
  function proportions(base, rv) {
    const cent = (l) => { const t = (l || []).reduce((s, [, p]) => s + p, 0) || 1; return Object.fromEntries((l || []).map(([m, p]) => [m, Math.round(p / t * 100)])); };
    const a = cent(base.mineraux), b = cent(rv.mineraux);
    return [...new Set([...Object.keys(b), ...Object.keys(a)])].filter((m) => (a[m] || 0) !== (b[m] || 0))
      .sort((m, n) => Math.abs((b[n] || 0) - (a[n] || 0)) - Math.abs((b[m] || 0) - (a[m] || 0)))
      .map((m) => ({ nom: majuscule(nomMin(m)), de: a[m] || 0, a: b[m] || 0 }));
  }
  const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const pc = (x) => (x === 0 ? "0" : x < 1 ? "< 1" : String(x));
  // panneau « Variétés & faciès » : une carte par variété ; les schémas sont dessinés ensuite, un par un (`remplir`)
  // Le bouton en bas à droite du schéma l'agrandit sur toute la largeur du panneau : les autres cartes passent dessous.
  function varietes(roche) {
    const l = roche.varietes || [];
    if (!l.length) return "";
    return `<div class="tex-vars">${l.map((v, i) => {
      const x = variante(roche, i), ecart = x ? x.v.ecart || "" : "";
      const props = x ? proportions(roche, x.rv) : [];
      const compo = !x ? "" : props.length
        ? `<ul class="tex-compo" aria-label="Proportions par rapport à la roche type">${props.map((p) => `<li><span>${p.nom}</span> <b>${pc(p.de)} → ${pc(p.a)} %</b></li>`).join("")}</ul>`
        : `<p class="tex-compo-meme">Mêmes proportions que la roche type.</p>`;
      return `<figure class="tex-var">
        <div class="tex-var-boite"><div class="tex-var-fig"${x ? ` data-tx-roche="${roche.id}" data-tx-i="${i}"` : ""}>${x ? "" : `<p class="tex-var-vide">Schéma à venir</p>`}</div>
          ${x ? `<button type="button" class="tex-var-agr" aria-expanded="false" aria-label="Agrandir le schéma" title="Agrandir">⤢</button>` : ""}</div>
        <figcaption><b>${majuscule(v.nom)}</b>${v.note ? `<span>${v.note}</span>` : ""}${ecart ? `<span class="tex-ecart">${ecart}</span>` : ""}${compo}</figcaption>
      </figure>`;
    }).join("")}</div>`;
  }
  // agrandir / réduire un schéma de variété (la carte prend toute la largeur de la grille, les autres descendent)
  if (typeof document !== "undefined") document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".tex-var-agr");
    if (!b) return;
    const f = b.closest(".tex-var"), grand = !f.classList.contains("tex-var-grand");
    f.classList.toggle("tex-var-grand", grand);
    b.setAttribute("aria-expanded", String(grand));
    b.setAttribute("aria-label", grand ? "Réduire le schéma" : "Agrandir le schéma");
    b.title = grand ? "Réduire" : "Agrandir";
    b.textContent = grand ? "⤡" : "⤢";
    f.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  // dessine les schémas des variétés d'une page, un par image (≈ 0,1 à 0,6 s chacun : la page s'affiche d'abord)
  function remplirUn(el) {
    const roche = (typeof ROCHES !== "undefined" ? ROCHES : []).find((r) => r.id === el.dataset.txRoche);
    const tir = roche && tirage(roche, +el.dataset.txI);
    if (!tir) return false;
    el.innerHTML = dessiner(tir.roche, tir.t, tir.res, tir.K);
    el.setAttribute("data-tx", JSON.stringify(infos(tir.res)));
    return true;
  }
  function remplir(racine) {
    const file = [...(racine || document).querySelectorAll(".tex-var-fig[data-tx-roche]:not([data-tx])")];
    const suite = () => {
      const el = file.shift();
      if (!el) return;
      if (el.isConnected) remplirUn(el);
      setTimeout(suite, 0);
    };
    setTimeout(suite, 30);
  }

  // les réglages des autres roches sont ajoutés par textures-roches.js, ceux des variétés par textures-varietes.js
  const definir = (liste) => Object.assign(TEXTURES_ROCHE, liste);
  const definirVarietes = (liste) => Object.assign(VARIETES, liste);
  window.Textures = { panneau, tirage, definir, definirVarietes, varietes, remplir, remplirUn, composer, variante, infos, MODES, HABITUS,
    _ROCHES: TEXTURES_ROCHE, _VARIETES: VARIETES };
})();
