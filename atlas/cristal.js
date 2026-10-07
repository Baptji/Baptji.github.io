// ============ Forme du cristal (F.3) — schéma d'habitus calculé ============
// Chargé après structures/index.js et avant app.js.
// Le dessin n'est pas tracé à la main : il est CALCULÉ à partir de trois données par minéral —
//   • la maille (a, b, c, α, β, γ) et le réseau (P, C, I, A, R…),
//   • la classe de symétrie (groupe ponctuel), qui engendre toutes les faces d'une forme {hkl},
//   • la liste des formes présentes et leur distance au centre (habitus).
// Le solide est l'intersection des demi-espaces { x : n̂·x ≤ p } ; il est projeté en clinographie
// (la projection des atlas de cristallographie : axe c vertical, rotation de 18°26′, inclinaison de 9°28′).
// On en tire aussi les traces de clivage sur chaque face et, si la loi est donnée, la macle.
// API : Cristal.existe(id) ; Cristal.panneau(id) → HTML ; Cristal.brancher(racine) ; Cristal.calcul(id, i).
(function () {
  "use strict";

  // ─────────────────────────────── algèbre ───────────────────────────────
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const ech = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cro = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const lon = (a) => Math.sqrt(dot(a, a));
  const uni = (a) => { const l = lon(a); return l ? ech(a, 1 / l) : [0, 0, 0]; };
  const r2 = (x) => Math.round(x * 100) / 100;
  const nb = (v, d = 0) => v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

  // matrices 3×3 (tableaux de lignes)
  const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const mm = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  const neg = (A) => A.map((r) => r.map((v) => -v));
  const cle = (A) => A.map((r) => r.join(",")).join("|");
  const vecMat = (v, M) => [0, 1, 2].map((j) => v[0] * M[0][j] + v[1] * M[1][j] + v[2] * M[2][j]);

  // ─────────────────────────────── groupes ponctuels ───────────────────────────────
  // Matrices W agissant sur les coordonnées fractionnaires (x' = W x).
  // Les indices de Miller se transforment en h' = h·W⁻¹ ; le groupe étant clos par inversion,
  // l'ensemble { h·W } sur tout le groupe donne les mêmes faces — on utilise donc h·W directement.
  const R2a = [[1, 0, 0], [0, -1, 0], [0, 0, -1]];               // axe 2 selon a (ortho., tétra., cubique)
  const R2b = [[-1, 0, 0], [0, 1, 0], [0, 0, -1]];               // axe 2 selon b (monoclinique, axe unique b)
  const R2c = [[-1, 0, 0], [0, -1, 0], [0, 0, 1]];               // axe 2 selon c
  const R3c = [[0, -1, 0], [1, -1, 0], [0, 0, 1]];               // axe 3 selon c, axes hexagonaux
  const R4c = [[0, -1, 0], [1, 0, 0], [0, 0, 1]];                // axe 4 selon c
  const R6c = [[1, -1, 0], [1, 0, 0], [0, 0, 1]];                // axe 6 selon c
  const R2ah = [[1, -1, 0], [0, -1, 0], [0, 0, -1]];             // axe 2 selon a, axes hexagonaux
  const R3d = [[0, 0, 1], [1, 0, 0], [0, 1, 0]];                 // axe 3 selon [111], cubique
  const INV = neg(I3);
  const M = (R) => mm(INV, R);                                   // miroir ⊥ à l'axe 2 donné

  const CLASSES = {
    "1": [], "-1": [INV],
    "2": [R2b], "m": [M(R2b)], "2/m": [R2b, INV],
    "222": [R2c, R2a], "mm2": [R2c, M(R2a)], "mmm": [R2c, R2a, INV],
    "4": [R4c], "-4": [M(R4c)], "4/m": [R4c, INV], "422": [R4c, R2a],
    "4mm": [R4c, M(R2a)], "-42m": [M(R4c), R2a], "4/mmm": [R4c, R2a, INV],
    "3": [R3c], "-3": [R3c, INV], "32": [R3c, R2ah], "3m": [R3c, M(R2ah)], "-3m": [R3c, R2ah, INV],
    "6": [R6c], "-6": [M(R6c)], "6/m": [R6c, INV], "622": [R6c, R2ah],
    "6mm": [R6c, M(R2ah)], "-6m2": [M(R6c), R2ah], "6/mmm": [R6c, R2ah, INV],
    "23": [R2c, R2a, R3d], "m-3": [R2c, R2a, R3d, INV], "432": [R4c, R3d],
    "-43m": [M(R4c), R3d], "m-3m": [R4c, R3d, INV],
  };
  const cacheGr = {};
  function groupe(classe) {
    if (cacheGr[classe]) return cacheGr[classe];
    const gen = CLASSES[classe];
    if (!gen) throw new Error("classe de symétrie inconnue : " + classe);
    const vus = { [cle(I3)]: I3 };
    let pile = [I3];
    while (pile.length) {
      const suivants = [];
      for (const A of pile) for (const g of gen) {
        const P = mm(g, A), k = cle(P);
        if (!vus[k]) { vus[k] = P; suivants.push(P); }
      }
      pile = suivants;
      if (Object.keys(vus).length > 200) break;               // garde-fou
    }
    return (cacheGr[classe] = Object.values(vus));
  }

  // ─────────────────────────────── maille et réseau réciproque ───────────────────────────────
  // Repère cartésien des dessins de cristallographie : c selon z (vertical), a dans le plan xz.
  function repere(maille) {
    const [a, b, c, al, be, ga] = maille;
    const d = Math.PI / 180, ca = Math.cos(al * d), cb = Math.cos(be * d), cg = Math.cos(ga * d), sb = Math.sin(be * d);
    const C = [0, 0, c];
    const A = [a * sb, 0, a * cb];
    const bz = b * ca, bx = b * (cg - ca * cb) / sb;
    const by2 = b * b - bx * bx - bz * bz;
    const B = [bx, Math.sqrt(Math.max(0, by2)), bz];
    const vol = dot(A, cro(B, C));
    return { A, B, C, As: ech(cro(B, C), 1 / vol), Bs: ech(cro(C, A), 1 / vol), Cs: ech(cro(A, B), 1 / vol) };
  }
  const normale = (R, h) => add(add(ech(R.As, h[0]), ech(R.Bs, h[1])), ech(R.Cs, h[2]));

  // Facteur de centrage : plus petit entier n tel que (nh, nk, nl) soit une réflexion permise.
  // (loi de Bravais–Friedel : c'est l'espacement RÉEL des plans du réseau qui compte, pas celui de la maille)
  const PERMIS = {
    P: () => true,
    C: ([h, k]) => (h + k) % 2 === 0,
    A: ([, k, l]) => (k + l) % 2 === 0,
    B: ([h, , l]) => (h + l) % 2 === 0,
    I: ([h, k, l]) => (h + k + l) % 2 === 0,
    F: ([h, k, l]) => (h + k) % 2 === 0 && (k + l) % 2 === 0 && (h + l) % 2 === 0,
    R: ([h, k, l]) => (((-h + k + l) % 3) + 3) % 3 === 0,
  };
  function centrage(reseau, h) {
    const ok = PERMIS[reseau] || PERMIS.P;
    for (let n = 1; n <= 4; n++) if (ok(h.map((v) => v * n))) return n;
    return 1;
  }

  // ─────────────────────────────── polyèdre = intersection de demi-espaces ───────────────────────────────
  // plans : [{ n (unitaire), p, forme }] ; renvoie les faces exprimées avec leurs sommets ordonnés
  function polyedre(plans) {
    const ech0 = plans.reduce((s, f) => s + f.p, 0) / plans.length || 1;
    const epsIn = 1e-7 * ech0, epsFace = 1e-6 * ech0;
    const som = [];
    for (let i = 0; i < plans.length; i++) for (let j = i + 1; j < plans.length; j++) for (let k = j + 1; k < plans.length; k++) {
      const [A, B, C] = [plans[i].n, plans[j].n, plans[k].n];
      const bc = cro(B, C), det = dot(A, bc);
      if (Math.abs(det) < 1e-9) continue;
      const x = ech(add(add(ech(bc, plans[i].p), ech(cro(C, A), plans[j].p)), ech(cro(A, B), plans[k].p)), 1 / det);
      let dedans = true;
      for (const f of plans) if (dot(f.n, x) - f.p > epsIn) { dedans = false; break; }
      if (!dedans) continue;
      if (!som.some((s) => lon(sub(s, x)) < epsFace)) som.push(x);
    }
    const faces = [];
    for (const f of plans) {
      const pts = som.filter((s) => Math.abs(dot(f.n, s) - f.p) < epsFace);
      if (pts.length < 3) continue;                                   // forme non exprimée
      const c = ech(pts.reduce(add, [0, 0, 0]), 1 / pts.length);
      let u = uni(sub(pts[0], c));
      if (!lon(u)) continue;
      const v = cro(f.n, u);
      pts.sort((P, Q) => Math.atan2(dot(sub(P, c), v), dot(sub(P, c), u)) - Math.atan2(dot(sub(Q, c), v), dot(sub(Q, c), u)));
      // aire (pour choisir où poser l'étiquette)
      let aire = 0;
      for (let i = 1; i < pts.length - 1; i++) aire += lon(cro(sub(pts[i], pts[0]), sub(pts[i + 1], pts[0]))) / 2;
      faces.push({ n: f.n, p: f.p, forme: f.forme, hkl: f.hkl, pts, centre: c, aire });
    }
    return faces;
  }

  // ─────────────────────────────── construction d'un faciès ───────────────────────────────
  const trois = (h) => (h.length === 4 ? [h[0], h[1], h[3]] : h.slice());
  // Espacement réel des plans du réseau (centrage compris) : sert à la distance par défaut (loi de Bravais–Friedel).
  const bravais = (cr, h) => lon(normale(cr._R, h)) * centrage(cr.reseau || "P", h);

  function planesDe(cr, fac, transfo) {
    const R = cr._R, G = groupe(cr.classe), plans = [];
    const ref = bravais(cr, trois(fac.formes[0].hkl));
    fac.formes.forEach((f, iF) => {
      const h = trois(f.hkl);
      // d = distance de la face au centre, dans une unité commune à toutes les formes (1 = la première forme).
      // Sans d : loi de Bravais–Friedel (la face la plus espacée du réseau est la plus développée).
      const p = f.d != null ? f.d : bravais(cr, h) / ref;
      const vus = {};
      for (const W of G) {
        const hp = vecMat(h, W);
        let n = uni(normale(R, hp));
        if (transfo) n = uni(transfo(n));
        const k = n.map((v) => Math.round(v * 1e6)).join(",");
        if (vus[k]) continue;
        vus[k] = 1;
        plans.push({ n, p, forme: iF, hkl: hp });
      }
    });
    return plans;
  }

  // rotation de 180° autour d'une direction (macle par axe) / réflexion dans un plan (macle par plan)
  function operationMacle(cr, macle) {
    const R = cr._R;
    if (macle.plan) {
      const n = uni(normale(R, trois(macle.plan)));
      return (v) => sub(v, ech(n, 2 * dot(v, n)));
    }
    const u = macle.axe;
    const d = uni(add(add(ech(R.A, u[0]), ech(R.B, u[1])), ech(R.C, u[2])));
    return (v) => sub(ech(d, 2 * dot(v, d)), v);                      // rotation de π autour de d
  }

  function construire(cr, fac) {
    if (!fac.macle) return [{ faces: polyedre(planesDe(cr, fac)), indiv: 0 }];
    const op = operationMacle(cr, fac.macle);
    const nc = uni(normale(cr._R, trois(fac.macle.compo)));
    const dec = fac.macle.decalage || 0;
    const a = polyedre(planesDe(cr, fac).concat([{ n: nc, p: dec, forme: -1, hkl: fac.macle.compo }]));
    const b = polyedre(planesDe(cr, fac, op).concat([{ n: ech(nc, -1), p: -dec, forme: -1, hkl: fac.macle.compo }]));
    return [{ faces: a, indiv: 0 }, { faces: b, indiv: 1 }];
  }

  // ─────────────────────────────── projection clinographique ───────────────────────────────
  // Convention des atlas de cristallographie : c vertical, le cristal tourné de arctan(1/3) ≈ 18°26′
  // autour de la verticale puis basculé de arcsin(1/6) ≈ 9°28′ vers l'observateur.
  function vue(cr, fac) {
    const az = ((fac.azimut != null ? fac.azimut : cr.azimut != null ? cr.azimut : 18.435) * Math.PI) / 180;
    const el = ((fac.elevation != null ? fac.elevation : cr.elevation != null ? cr.elevation : 9.594) * Math.PI) / 180;
    const oeil = [Math.cos(el) * Math.sin(az), -Math.cos(el) * Math.cos(az), Math.sin(el)];
    const droite = uni(cro([0, 0, 1], oeil));
    const haut = cro(oeil, droite);
    return { oeil, droite, haut };
  }

  // ─────────────────────────────── traces de clivage ───────────────────────────────
  // Sur chaque face visible, les traces des plans de clivage : segments de la famille n̂·x = t.
  function traces(face, ncl, pas, etendue) {
    const seg = [];
    if (lon(cro(face.n, ncl)) < 0.08) return seg;                     // face parallèle au clivage
    const vals = face.pts.map((P) => dot(P, ncl));
    const t0 = Math.min.apply(null, vals), t1 = Math.max.apply(null, vals);
    const k0 = Math.ceil(t0 / pas), k1 = Math.floor(t1 / pas);
    for (let k = k0; k <= k1; k++) {
      const t = k * pas;
      if (t - t0 < etendue * 0.02 || t1 - t < etendue * 0.02) continue;
      const inter = [];
      for (let i = 0; i < face.pts.length; i++) {
        const P = face.pts[i], Q = face.pts[(i + 1) % face.pts.length];
        const dP = dot(P, ncl) - t, dQ = dot(Q, ncl) - t;
        if (dP === 0) inter.push(P);
        else if (dP * dQ < 0) inter.push(add(P, ech(sub(Q, P), dP / (dP - dQ))));
      }
      if (inter.length >= 2) seg.push([inter[0], inter[inter.length - 1]]);
    }
    return seg;
  }

  // ─────────────────────────────── calcul complet d'un faciès ───────────────────────────────
  const cache = {};
  function calcul(id, iFac) {
    const k = id + "#" + iFac;
    if (cache[k]) return cache[k];
    const cr = CRISTAUX[id];
    if (!cr) return null;
    if (!cr._R) cr._R = repere(cr.maille);
    const fac = cr.facies[iFac];
    const corps = construire(cr, fac);
    // mise à l'échelle : la plus grande dimension vaut 1
    let rmax = 0;
    for (const c of corps) for (const f of c.faces) for (const P of f.pts) rmax = Math.max(rmax, lon(P));
    const s = rmax ? 1 / rmax : 1;
    for (const c of corps) for (const f of c.faces) {
      f.pts = f.pts.map((P) => ech(P, s));
      f.centre = ech(f.centre, s);
      f.aire *= s * s;
    }
    const res = { cr, fac, corps, vue: vue(cr, fac), echelle: s };
    cache[k] = res;
    return res;
  }

  // ─────────────────────────────── dessin SVG ───────────────────────────────
  const W = 400, H = 360;

  function teinte(hex, f) {                                           // f ∈ [0,1] : 0 sombre, 1 clair
    const h = (hex || "#cfc8ba").replace("#", "");
    const v = h.length === 3 ? h.split("").map((c) => parseInt(c + c, 16)) : [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const m = (c) => Math.round(Math.max(0, Math.min(255, c * (0.42 + 0.78 * f) + 46 * f)));
    return "#" + v.map(m).map((c) => c.toString(16).padStart(2, "0")).join("");
  }

  // v (facultatif) : orientation choisie à la souris { oeil, droite, haut } ; sinon la vue clinographique du faciès
  function svgFacies(id, iFac, v) {
    const C = calcul(id, iFac);
    if (!C) return "";
    const { cr, fac, corps } = C, { oeil, droite, haut } = v || C.vue;
    // lumière liée à l'observateur (en haut, à gauche, devant) : l'éclairage ne bascule pas quand on tourne le cristal
    const lumiere = uni(add(add(ech(droite, -0.45), ech(oeil, 0.75)), ech(haut, 0.55)));
    const visibles = [];
    for (const c of corps) for (const f of c.faces) if (dot(f.n, oeil) > 1e-6) visibles.push(Object.assign({ indiv: c.indiv }, f));
    if (!visibles.length) return "";
    // écran
    const px = (P) => [dot(P, droite), -dot(P, haut)];
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const c of corps) for (const f of c.faces) for (const P of f.pts) {
      const [x, y] = px(P); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    // centré sur le centre du cristal et à une échelle qui tient dans toutes les orientations (la plus grande dimension
    // vaut 1) : rien ne saute ni ne sort du cadre quand on le fait tourner (01/10/2026)
    const marge = 52, k = Math.min((W - 2 * marge) / (x1 - x0 || 1), (H - 2 * marge) / (y1 - y0 || 1), H / 2 - 10);
    const cx = 0, cy = 0;
    const ec = (P) => { const [x, y] = px(P); return [W / 2 + (x - cx) * k, H / 2 + (y - cy) * k]; };
    const pt = (P) => ec(P).map((v) => Math.round(v * 10) / 10).join(",");

    visibles.sort((a, b) => dot(a.centre, oeil) - dot(b.centre, oeil));
    let g = "";
    for (const f of visibles) {
      const lum = Math.max(0, dot(f.n, lumiere));
      const fill = teinte(cr.couleur, 0.3 + 0.7 * lum);
      g += `<polygon points="${f.pts.map(pt).join(" ")}" style="fill:${fill}" class="cx-face${f.indiv ? " cx-macle" : ""}"/>`;
    }
    // traces de clivage
    let gc = "";
    (cr.clivages || []).forEach((cl, i) => {
      if (cl.trace === false) return;
      const h = trois(cl.hkl);
      const dirs = {};
      for (const Wm of groupe(cr.classe)) {
        const n = uni(normale(cr._R, vecMat(h, Wm)));
        const k1 = n.map((v) => Math.round(v * 1e4)).join(",");
        const k2 = n.map((v) => Math.round(-v * 1e4)).join(",");
        if (dirs[k1] || dirs[k2]) continue;
        dirs[k1] = n;
      }
      for (const key in dirs) {
        const n = dirs[key];
        for (const f of visibles) {
          if (f.indiv) continue;
          for (const [P, Q] of traces(f, n, (cl.pas || 0.17), 2)) {
            gc += `<line x1="${ec(P)[0].toFixed(1)}" y1="${ec(P)[1].toFixed(1)}" x2="${ec(Q)[0].toFixed(1)}" y2="${ec(Q)[1].toFixed(1)}" class="cx-cliv cx-cliv${i % 3}"/>`;
          }
        }
      }
    });
    // stries de croissance (quartz : faces du prisme)
    let gs = "";
    const st = (cr.facies[iFac] || {}).stries !== undefined ? cr.facies[iFac].stries : cr.stries;   // un faciès peut avoir ses stries (ou false)
    if (st) {
      const n0 = st.normale ? uni(normale(cr._R, st.normale)) : null;
      for (const f of visibles) {
        if (st.forme != null && f.forme !== st.forme) continue;
        // stries « cycliques » (pyrite) : sur la face ⊥ à l'axe i, traces des plans ⊥ à l'axe i + 1 — stries perpendiculaires d'une face à l'autre
        let n = n0;
        if (st.cyclique) {
          const a = f.n.map(Math.abs), i = a.indexOf(Math.max.apply(null, a)), e = [0, 0, 0];
          e[(i + 1) % 3] = 1; n = uni(normale(cr._R, e));
        }
        for (const [P, Q] of traces(f, n, st.pas || 0.09, 2)) {
          gs += `<line x1="${ec(P)[0].toFixed(1)}" y1="${ec(P)[1].toFixed(1)}" x2="${ec(Q)[0].toFixed(1)}" y2="${ec(Q)[1].toFixed(1)}" class="cx-strie"/>`;
        }
      }
    }
    // axes cristallographiques
    let ga = "";
    {
      const R = cr._R, hex = /^(3|-3|32|3m|-3m|6|-6|6\/m|622|6mm|-6m2|6\/mmm)$/.test(cr.classe);
      const L = 1.34;
      const axes = hex
        ? [[R.A, "a₁"], [R.B, "a₂"], [ech(add(R.A, R.B), -1), "a₃"], [R.C, "c"]]
        : [[R.A, "a"], [R.B, "b"], [R.C, "c"]];
      for (const [v, nom] of axes) {
        const u = ech(uni(v), L);
        const [ax, ay] = ec(ech(u, -1)), [bx, by] = ec(u);
        ga += `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" class="cx-axe"/>`
          + `<text x="${bx.toFixed(1)}" y="${(by - 5).toFixed(1)}" text-anchor="middle" class="cx-axe-lab">${nom}</text>`;
      }
    }
    // étiquettes : la plus grande face visible de chaque forme (et de chaque individu de la macle)
    let gl = "";
    const meilleure = {};
    for (const f of visibles) {
      if (f.forme < 0) continue;
      const sym = fac.formes[f.forme].sym;
      if (!sym) continue;
      const cle2 = sym + "/" + f.indiv;
      const aireVue = f.aire * dot(f.n, oeil);
      if (!meilleure[cle2] || meilleure[cle2].a < aireVue) meilleure[cle2] = { a: aireVue, f };
    }
    const poses = [];
    Object.keys(meilleure).sort((a, b) => meilleure[b].a - meilleure[a].a).forEach((c) => {
      const f = meilleure[c].f;
      if (meilleure[c].a < 0.012) return;
      const [x, y] = ec(f.centre);
      if (poses.some(([a, b]) => Math.hypot(a - x, b - y) < 20)) return;   // deux étiquettes ne se chevauchent jamais
      poses.push([x, y]);
      gl += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" class="cx-lab">${fac.formes[f.forme].sym}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" class="cx-svg" role="img" aria-label="Forme du cristal : ${cr.nom || id} — ${fac.nom}">
      <g class="cx-axes">${ga}</g>${g}<g class="cx-clivages">${gc}</g>${gs}${gl}</svg>`;
  }

  // ─────────────────────────────── indices de Miller lisibles ───────────────────────────────
  const barre = (v) => (v < 0 ? `<span class="cx-barre">${-v}</span>` : String(v));
  function indices(hkl, acc = "{") {
    const f = acc === "{" ? ["{", "}"] : acc === "(" ? ["(", ")"] : ["[", "]"];
    return `<span class="cx-hkl">${f[0]}${hkl.map(barre).join("")}${f[1]}</span>`;
  }

  // ─────────────────────────────── panneau de la fiche ───────────────────────────────
  const existe = (id) => !!CRISTAUX[id];

  function panneau(id) {
    const cr = CRISTAUX[id];
    if (!cr) return "";
    if (!cr._R) cr._R = repere(cr.maille);
    const onglets = cr.facies.map((f, i) =>
      `<button type="button" class="min-chip${i === 0 ? " on" : ""}" data-cx-fac="${i}">${f.nom}</button>`).join("");
    const vues = cr.facies.map((f, i) => {
      const C = calcul(id, i);
      const nFaces = C.corps.reduce((s, c) => s + c.faces.filter((x) => x.forme >= 0).length, 0);
      const legende = f.formes.map((fo, iF) => {
        const exprimee = C.corps.some((c) => c.faces.some((x) => x.forme === iF));
        return `<li${exprimee ? "" : ' class="cx-absente"'}><b>${fo.sym || "—"}</b> ${indices(fo.hkl)}
          <span>${fo.nom}</span></li>`;
      }).join("");
      return `<div class="cx-vue" data-cx-vue="${i}"${i === 0 ? "" : " hidden"}>
        <div class="cx-dessin">${svgFacies(id, i)}</div>
        <ul class="cx-legende">${legende}</ul>
        ${f.note ? `<p class="cx-note">${f.note}</p>` : ""}
        <p class="cx-compte">${nb(nFaces)} faces${f.macle ? ` · deux individus maclés` : ""}.</p>
      </div>`;
    }).join("");
    const cl = (cr.clivages || []).map((c, i) =>
      `<li><i class="cx-pastille cx-cliv${i % 3}"></i>${c.qualite ? c.qualite.charAt(0).toUpperCase() + c.qualite.slice(1) + " " : ""}${indices(c.hkl)}${c.nom ? ` — ${c.nom}` : ""}</li>`).join("");
    const m = cr.maille;
    const angles = [["α", m[3]], ["β", m[4]], ["γ", m[5]]].filter(([, v]) => Math.abs(v - 90) > 0.01)
      .map(([s, v]) => `${s} = ${nb(v, 2)}°`).join(", ");
    return `<div class="cx cx-tourne" data-cx="${id}">
      <div class="cx-outils">
        <div class="min-chips cx-onglets">${onglets}</div>
        <div class="cx-bascules">
          ${cl ? `<button type="button" class="min-chip cx-bascule" data-cx-toggle="clivages">Clivages</button>` : ""}
          <button type="button" class="min-chip cx-bascule" data-cx-toggle="axes">Axes</button>
          <button type="button" class="min-chip cx-bascule on" data-cx-toggle="tourne">Rotation</button>
        </div>
      </div>
      ${vues}
      <table class="data cx-fiche">
        <tr><td>Système</td><td>${cr.systeme} — classe ${cr.classe.replace(/-(\d)/g, (s, d) => `<span class="cx-barre">${d}</span>`)}${cr.classeNom ? ` (${cr.classeNom})` : ""}</td></tr>
        <tr><td>Maille</td><td>a = ${nb(m[0], 3)} Å, b = ${nb(m[1], 3)} Å, c = ${nb(m[2], 3)} Å${angles ? ", " + angles : ""}${cr.reseau && cr.reseau !== "P" ? ` — réseau ${cr.reseau}` : ""}</td></tr>
        ${cl ? `<tr><td>Clivages</td><td><ul class="cx-liste">${cl}</ul></td></tr>` : ""}
        ${cr.macleNote ? `<tr><td>Macles</td><td>${cr.macleNote}</td></tr>` : ""}
      </table>
    </div>`;
  }

  // rotation à la souris (01/10/2026, comme les structures 3D) : glisser = tourner autour de la verticale et de
  // l'horizontale de l'écran, double-clic = vue de départ ; le dessin est recalculé (faces cachées, éclairage, étiquettes)
  const tourne = (u, axe, a) => {                                     // rotation de Rodrigues de u autour de axe (unitaire)
    const c = Math.cos(a), s = Math.sin(a);
    return add(add(ech(u, c), ech(cro(axe, u), s)), ech(axe, dot(axe, u) * (1 - c)));
  };
  function rendreOrientable(boite, id, i) {
    if (boite.dataset.cxRot) return;
    boite.dataset.cxRot = "1";
    let v = null, dernier = null, attente = 0;
    const redessiner = () => {
      if (attente) return;
      attente = requestAnimationFrame(() => { attente = 0; boite.innerHTML = svgFacies(id, i, v); });
    };
    boite.addEventListener("pointerdown", (e) => {
      if (!v) { const v0 = calcul(id, i).vue; v = { oeil: v0.oeil, droite: v0.droite, haut: v0.haut }; }
      dernier = [e.clientX, e.clientY];
      boite.setPointerCapture(e.pointerId);
    });
    boite.addEventListener("pointermove", (e) => {
      if (!dernier || (!e.buttons && e.pointerType === "mouse")) { dernier = null; return; }
      const dx = e.clientX - dernier[0], dy = e.clientY - dernier[1];
      dernier = [e.clientX, e.clientY];
      // glisser vers la droite : le cristal tourne autour de la verticale de l'écran ; vers le bas : autour de l'horizontale
      const a1 = -dx * 0.012, a2 = -dy * 0.012;
      let { oeil, droite, haut } = v;
      oeil = tourne(oeil, haut, a1); droite = tourne(droite, haut, a1);
      oeil = tourne(oeil, droite, a2); haut = tourne(haut, droite, a2);
      v = { oeil: uni(oeil), droite: uni(droite), haut: uni(cro(oeil, droite)) };
      redessiner();
    });
    const fin = () => { dernier = null; };
    boite.addEventListener("pointerup", fin);
    boite.addEventListener("pointercancel", fin);
    boite.addEventListener("lostpointercapture", fin);
    boite.addEventListener("dblclick", () => { v = null; boite.innerHTML = svgFacies(id, i); });
    // rotation automatique (01/10/2026) : lente (6° par seconde) autour de l'axe vertical du cristal (axe z = c),
    // seulement à l'écran, jamais pendant un glisser ; bouton « Rotation » (classe cx-tourne) ; rien si l'on préfère moins d'animation
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const cx = boite.closest(".cx");
      if (cx) { cx.classList.remove("cx-tourne"); const b = cx.querySelector('[data-cx-toggle="tourne"]'); if (b) b.classList.remove("on"); }
      return;
    }
    let visible = false, tPrec = 0, tDessin = 0;
    if (window.IntersectionObserver) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(boite);
    else visible = true;
    const Z = [0, 0, 1];
    const tic = (t) => {
      if (!boite.isConnected) return;
      const cx = boite.closest(".cx");
      if (visible && !document.hidden && !dernier && cx && cx.classList.contains("cx-tourne") && tPrec) {
        if (!v) { const v0 = calcul(id, i).vue; v = { oeil: v0.oeil, droite: v0.droite, haut: v0.haut }; }
        const a = -6 * Math.PI / 180 * Math.min(0.1, (t - tPrec) / 1000);
        v = { oeil: tourne(v.oeil, Z, a), droite: tourne(v.droite, Z, a), haut: tourne(v.haut, Z, a) };
        if (t - tDessin > 50) { tDessin = t; boite.innerHTML = svgFacies(id, i, v); }
      }
      tPrec = t;
      requestAnimationFrame(tic);
    };
    requestAnimationFrame(tic);
  }

  function brancher(racine) {
    (racine || document).querySelectorAll(".cx").forEach((el) => {
      el.querySelectorAll("[data-cx-vue]").forEach((vu) => {
        const boite = vu.querySelector(".cx-dessin");
        if (boite) rendreOrientable(boite, el.dataset.cx, +vu.dataset.cxVue);
      });
      if (el.dataset.cxPret) return;
      el.dataset.cxPret = "1";
      el.addEventListener("click", (e) => {
        const ong = e.target.closest("[data-cx-fac]");
        if (ong) {
          el.querySelectorAll("[data-cx-fac]").forEach((b) => b.classList.toggle("on", b === ong));
          el.querySelectorAll("[data-cx-vue]").forEach((v) => { v.hidden = v.dataset.cxVue !== ong.dataset.cxFac; });
          return;
        }
        const bas = e.target.closest("[data-cx-toggle]");
        if (bas) {
          const on = el.classList.toggle("cx-" + bas.dataset.cxToggle);
          bas.classList.toggle("on", on);
        }
      });
    });
  }

  // ═══════════════════════════════ données ═══════════════════════════════
  // Sources des formes et des habitus : voir CRISTAUX_SOURCES en bas de fichier.
  const CRISTAUX = {

    // ─────────── Quartz ───────────
    quartz: {
      nom: "Quartz", couleur: "#ded3c0", systeme: "trigonal (rhomboédrique)", classe: "32",
      classeNom: "trapézoédrique trigonale", reseau: "P",
      maille: [4.9160, 4.9160, 5.4054, 90, 90, 120],
      mailleSource: "cod9000775",
      stries: { forme: 0, normale: [0, 0, 1], pas: 0.075 },
      macleNote: "Macle du Japon : plan de macle {11<span class=\"cx-barre\">2</span>2}, les deux prismes font un angle de 84°33′. Les macles du Dauphiné et du Brésil ne changent pas la forme extérieure — elles s'accolent sans créer d'angle rentrant.",
      facies: [
        { nom: "Prisme (cristal de roche)",
          formes: [
            { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
            { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre positif (face majeure)", d: 1.36 },
            { sym: "z", hkl: [0, 1, -1, 1], nom: "rhomboèdre négatif (face mineure)", d: 1.44 },
          ],
          note: "Le prisme porte des stries horizontales : elles marquent les arrêts de croissance, et c'est à elles qu'on reconnaît le quartz sur le terrain. Les deux rhomboèdres r et z alternent autour du sommet — r est presque toujours plus développé que z, ce qui donne des « faces » de tailles inégales.",
        },
        { nom: "Prisme à faces s et x",
          formes: [
            { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
            { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre positif", d: 1.36 },
            { sym: "z", hkl: [0, 1, -1, 1], nom: "rhomboèdre négatif", d: 1.44 },
            { sym: "s", hkl: [1, 1, -2, 1], nom: "bipyramide trigonale", d: 1.36 },
            { sym: "x", hkl: [5, 1, -6, 1], nom: "trapézoèdre trigonal", d: 1.15 },
          ],
          note: "Les petites faces x n'apparaissent que d'un seul côté de chaque arête : c'est la signature de la classe 32, qui n'a ni centre ni miroir. Selon le côté où elles se placent, le cristal est dit droit ou gauche — la même dissymétrie fait tourner le plan de polarisation de la lumière et sert à tailler les lames de montre.",
        },
        { nom: "Macle du Japon", azimut: 60, elevation: 8,
          macle: { plan: [1, 1, -2, 2], compo: [1, 1, -2, 2] },
          formes: [
            { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
            { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre positif", d: 2.10 },
            { sym: "z", hkl: [0, 1, -1, 1], nom: "rhomboèdre négatif", d: 2.20 },
          ],
          note: "Deux prismes soudés sur un plan {11<span class=\"cx-barre\">2</span>2}, en V aplati. C'est la seule macle du quartz qui se voie à l'œil nu.",
        },
      ],
      clivages: [], // aucun : cassure conchoïdale
    },

    // ─────────── Calcite ───────────
    calcite: {
      nom: "Calcite", couleur: "#e3dccb", systeme: "trigonal (rhomboédrique)", classe: "-3m",
      classeNom: "scalénoédrique hexagonale", reseau: "R",
      maille: [4.9880, 4.9880, 17.0610, 90, 90, 120],
      mailleSource: "cod9000965",
      macleNote: "Macle la plus fréquente sur {01<span class=\"cx-barre\">1</span>2} ; la macle sur {0001} donne les « cœurs » aplatis.",
      facies: [
        { nom: "Rhomboèdre de clivage", azimut: 42, elevation: 17,
          formes: [{ sym: "r", hkl: [1, 0, -1, 4], nom: "rhomboèdre", d: 1.0 }],
          note: "Forme fermée à six faces : c'est exactement le bloc qu'on obtient en cassant n'importe quel morceau de calcite, parce que les trois clivages suivent ces mêmes plans. Chaque face est un losange dont les angles valent 78°05′ et 101°55′, et deux faces voisines font entre elles 74°55′ : jamais 90°, d'où le bloc toujours penché. (Le calcul de l'atlas redonne 78°07′, 101°53′ et 74°58′.)",
        },
        { nom: "Scalénoèdre (dent de chien)",
          formes: [
            { sym: "v", hkl: [2, 1, -3, 1], nom: "scalénoèdre", d: 1.0 },
            { sym: "r", hkl: [1, 0, -1, 4], nom: "rhomboèdre de clivage", d: 1.9 },
          ],
          note: "Douze faces en triangles scalènes, terminées en pointe : c'est la calcite des géodes et des filons, la « dent de chien ». Les traces de clivage, qui gardent l'orientation du rhomboèdre, traversent les faces en biais — d'où l'intérêt de les afficher : elles montrent que la forme extérieure a changé, pas la structure.",
        },
        { nom: "Prisme à tête de clou",
          formes: [
            { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 },
            { sym: "e", hkl: [0, 1, -1, 2], nom: "rhomboèdre obtus", d: 0.86 },
          ],
          note: "Prisme court coiffé d'un rhomboèdre très obtus, presque plat : la calcite « tête de clou » des filons de plomb et des cavités des calcaires.",
        },
      ],
      clivages: [{ hkl: [1, 0, -1, 4], qualite: "parfait", nom: "trois directions, rhomboèdre", pas: 0.24 }],
    },

    // ─────────── Orthose ───────────
    orthose: {
      nom: "Orthose", couleur: "#dcb5a4", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "C",
      maille: [8.5632, 12.9630, 7.2099, 90, 116.073, 90],
      mailleSource: "cod9000311",
      macleNote: "Macle de Carlsbad (axe de macle [001], plan d'accolement {010}), la plus courante dans les granites ; macles de Baveno {021} et de Manebach {001} dans les cavités et les laves.",
      facies: [
        { nom: "Prisme de granite",
          formes: [
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 1.02 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 },
            { sym: "x", hkl: [-2, 0, 1], nom: "face oblique", d: 1.80 },
          ],
          note: "Cristal trapu, allongé selon a : c'est la forme des phénocristaux roses qui ponctuent les granites porphyroïdes. La face c {001} et la face b {010} se coupent exactement à angle droit — c'est ce 90° qui vaut à l'orthose son nom (grec orthós, « droit ») et que suivent ses deux clivages.",
        },
        { nom: "Macle de Carlsbad", azimut: 78, elevation: 12,
          macle: { axe: [0, 0, 1], compo: [0, 1, 0] },
          formes: [
            { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.0 },
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde latéral", d: 1.02 },
            { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 2.05 },
            { sym: "x", hkl: [-2, 0, 1], nom: "face oblique", d: 1.80 },
          ],
          note: "Deux individus tournés de 180° l'un par rapport à l'autre autour de l'axe c, soudés sur le plan {010} : l'angle rentrant qui en résulte se voit à l'œil nu sur les cristaux des granites. Au soleil, les deux moitiés d'un même cristal ne s'éteignent pas ensemble — c'est la façon la plus simple de reconnaître un feldspath potassique.",
        },
      ],
      clivages: [
        { hkl: [0, 0, 1], qualite: "parfait", nom: "base", pas: 0.2 },
        { hkl: [0, 1, 0], qualite: "bon", nom: "latéral, à 90° du premier", pas: 0.24 },
      ],
    },

    // ─────────── Gypse ───────────
    gypse_m: {
      nom: "Gypse", couleur: "#e6e0d3", systeme: "monoclinique", classe: "2/m",
      classeNom: "prismatique", reseau: "I",
      maille: [5.6790, 15.2020, 6.5220, 90, 118.43, 90],
      mailleSource: "cod9017313",
      macleNote: "Macle en fer de lance (ou queue d'aronde) sur {100} : deux individus accolés sur ce plan, avec un angle rentrant très net.",
      facies: [
        { nom: "Cristal tabulaire", azimut: 32, elevation: 16,
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde — la lame", d: 1.0 },
            { sym: "m", hkl: [1, 2, 0], nom: "prisme", d: 1.30 },
            { sym: "l", hkl: [-1, 1, 1], nom: "face terminale", d: 1.10 },
          ],
          note: "Une lame plate, en losange allongé : la face b {010} est le plan de clivage parfait, celui qui se détache en feuillets souples et transparents (le « miroir d'âne » ou sélénite). Le gypse pousse en remplissant l'eau de la lagune ou en cristallisant dans une marne, d'où ces cristaux isolés bien formés.",
        },
        { nom: "Macle en fer de lance", azimut: 16, elevation: 12,
          macle: { plan: [1, 0, 0], compo: [1, 0, 0] },
          formes: [
            { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde — la lame", d: 1.0 },
            { sym: "m", hkl: [1, 2, 0], nom: "prisme", d: 1.30 },
            { sym: "l", hkl: [-1, 1, 1], nom: "face terminale", d: 1.10 },
          ],
          note: "Deux lames accolées sur {100}, symétriques l'une de l'autre : l'entaille en V au sommet est l'angle rentrant, impossible sur un cristal simple. C'est la forme des « fers de lance » du gypse de Montmartre, décrits dès le XVIII<sup>e</sup> siècle.",
        },
      ],
      clivages: [
        { hkl: [0, 1, 0], qualite: "parfait", nom: "lamelles flexibles", pas: 0.2 },
        { hkl: [1, 0, 0], qualite: "bon", nom: "", pas: 0.26 },
      ],
    },
  };

  // Sources des formes cristallines et des habitus (affichées en bas de fiche)
  const SOURCES = {
    formes: "Formes cristallines et habitus : C. Klein et B. Dutrow, <i>Manual of Mineral Science</i>, 23<sup>e</sup> éd., 2007 ; C. Palache, H. Berman et C. Frondel, <i>Dana's System of Mineralogy</i>, 7<sup>e</sup> éd. ; V. Goldschmidt, <i>Atlas der Krystallformen</i>, 1913-1923.",
    projection: "Dessin calculé : le solide est l'intersection des demi-espaces définis par les faces, en projection clinographique (rotation de 18°26′, inclinaison de 9°28′). Les distances au centre sont réglées pour retrouver l'habitus décrit dans la littérature : ce sont des cristaux idéaux, pas des mesures d'échantillons.",
  };

  window.Cristal = { existe, panneau, brancher, calcul, indices, CRISTAUX, SOURCES,
    _outils: { repere, normale, groupe, polyedre, centrage } };
})();
