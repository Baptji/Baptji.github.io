// ============ Vue « Structure » des argiles (30/09/2026) ============
// Demande : dans la visionneuse 3D des argiles, trois échelles — 1 maille, 2 × 2, et « la structure » : ce que font les feuillets
// dans un cristal (l'halloysite qui s'enroule en tube, etc.). Ce fichier construit et dessine cette troisième échelle.
//
// Parti pris : dessin à l'échelle du NANOMÈTRE, chaque feuillet à son épaisseur vraie et découpé en ses couches (tétraédrique en
// bleu, octaédrique de la couleur de son cation, comme les polyèdres de la vue atomique) ; ce qui sépare les feuillets (K⁺, eau,
// feuillet d'hydroxyde) de même. Quand le vrai cristal est trop grand pour tenir dans la vue, il est dessiné plus petit, avec les
// mêmes proportions, et la note le dit. Formes et dimensions : voir les sources de chaque famille (note sous la vue).
//
// Rendu : faces planes (quadrilatères, polygones), algorithme du peintre, faces cachées retirées (normales sortantes), même canvas
// et mêmes gestes que structures3d.js (glisser, zoom, rotation lente, Agrandir). Unités : Å ; barre d'échelle en nm.
(function () {
  "use strict";
  if (!window.Structure3D || !window.EspacementBasal) return;
  const { mult, rotation, rad, unit, vect, scal, sous, norme, rgb, hexRgb, COULEURS } = Structure3D.outils;
  const EB = window.EspacementBasal;

  // ── couleurs : celles des éléments (palette VESTA de la vue atomique), éclaircies comme les faces des polyèdres ──
  const mel = (c, t) => c.map((x) => x + (255 - x) * t);
  const mix = (a, b, t = 0.5) => a.map((x, i) => x * (1 - t) + b[i] * t);
  const EL = (el, t = 0.3) => mel(hexRgb(COULEURS[el]), t);
  const C = {
    T: EL("Si", 0.22), Al: EL("Al", 0.38), Mg: EL("Mg", 0.28), Fe: EL("Fe", 0.28), Ni: EL("Ni", 0.1), Zn: EL("Zn", 0.2),
    Mn: EL("Mn", 0.35), Cr: EL("Cr", 0.5), K: EL("K", 0.15), Na: EL("Na", 0.1), Ca: EL("Ca", 0.15), eau: [70, 140, 210],
  };
  C.FeMg = mix(C.Fe, C.Mg); C.MgAl = mix(C.Mg, C.Al);
  const NOM_OCT = { Al: "Al", Mg: "Mg", Fe: "Fe", Ni: "Ni", Zn: "Zn", Mn: "Mn", Cr: "Cr", FeMg: "Fe, Mg", MgAl: "Mg, Al" };
  const EAU_A = 0.3;

  // ── géométrie : faces { p: [points], c, a, n (normale sortante), cull, trait } ──
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  function face(F, pts, c, n, o = {}) {
    F.push({ p: pts, c, n, a: o.a ?? 1, cull: o.cull !== false, trait: o.trait || null });
  }
  // prisme vertical : contour [[x, z], …] dans le plan horizontal, de y0 à y1 ; o.haut / o.bas : dessiner le dessus / dessous
  function prisme(F, contour, y0, y1, c, o = {}) {
    const g = contour.reduce((s, q) => [s[0] + q[0] / contour.length, s[1] + q[1] / contour.length], [0, 0]);
    const tr = o.trait === undefined ? rgb(c, 0.55, 0.55) : o.trait;
    if (o.haut !== false) face(F, contour.map(([x, z]) => [x, y1, z]), c, [0, 1, 0], { a: o.a, trait: tr });
    if (o.bas !== false) face(F, contour.map(([x, z]) => [x, y0, z]), c, [0, -1, 0], { a: o.a, trait: tr });
    contour.forEach((q, i) => {
      const r = contour[(i + 1) % contour.length];
      let n = [r[1] - q[1], 0, -(r[0] - q[0])];
      if (n[0] * ((q[0] + r[0]) / 2 - g[0]) + n[2] * ((q[1] + r[1]) / 2 - g[1]) < 0) n = mul(n, -1);
      face(F, [[q[0], y0, q[1]], [r[0], y0, r[1]], [r[0], y1, r[1]], [q[0], y1, q[1]]], c, unit(n), { a: o.a });
    });
  }
  // nappe : surface S(u, v) → { p, n } épaissie de h0 à h1 le long de n ; o.faces = { haut, bas, u0, u1, v0, v1 } ;
  // o.trou(i, j) : maille de la grille à ne pas dessiner (perforation)
  function nappe(F, S, [u0, u1, nu], [v0, v1, nv], h0, h1, c, o = {}) {
    const fa = Object.assign({ haut: true, bas: true, u0: true, u1: true, v0: true, v1: true }, o.faces || {});
    const G = [];
    for (let i = 0; i <= nu; i++) {
      G.push([]);
      for (let j = 0; j <= nv; j++) {
        const u = u0 + (u1 - u0) * i / nu, v = v0 + (v1 - v0) * j / nv;
        const s = S(u, v);
        G[i].push({ b: add(s.p, mul(s.n, h0)), h: add(s.p, mul(s.n, h1)), n: s.n });
      }
    }
    const trou = o.trou || (() => false);
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      if (trou(i, j)) continue;
      const q = [G[i][j], G[i + 1][j], G[i + 1][j + 1], G[i][j + 1]];
      const n = unit(add(add(q[0].n, q[1].n), add(q[2].n, q[3].n)));
      if (fa.haut) face(F, q.map((x) => x.h), c, n, { a: o.a });
      if (fa.bas) face(F, q.map((x) => x.b), c, mul(n, -1), { a: o.a });
    }
    const bord = (liste, sens) => {
      for (let k = 0; k + 1 < liste.length; k++) {
        const x = liste[k], y = liste[k + 1];
        const t = unit(vect(sous(y.b, x.b), x.n));
        face(F, [x.b, y.b, y.h, x.h], c, mul(t, sens), { a: o.a });
      }
    };
    // sens de la normale d'un bord : vers l'extérieur de la grille (vérifié sur la direction u ou v)
    const dirU = (j) => sous(G[nu][j].b, G[0][j].b), dirV = (i) => sous(G[i][nv].b, G[i][0].b);
    const sensBord = (liste, vers) => {
      const t = vect(sous(liste[1].b, liste[0].b), liste[0].n);
      return scal(t, vers) >= 0 ? 1 : -1;
    };
    if (fa.u0 && nv) { const L = G[0]; bord(L, sensBord(L, mul(sous(G[1][0].b, G[0][0].b), -1))); }
    if (fa.u1 && nv) { const L = G[nu]; bord(L, sensBord(L, sous(G[nu][0].b, G[nu - 1][0].b))); }
    if (fa.v0 && nu) { const L = G.map((c) => c[0]); bord(L, sensBord(L, mul(sous(G[0][1].b, G[0][0].b), -1))); }
    if (fa.v1 && nu) { const L = G.map((c) => c[nv]); bord(L, sensBord(L, sous(G[0][nv].b, G[0][nv - 1].b))); }
    void dirU; void dirV;
  }

  // ── contours de plaquettes ──
  function alea(g) { let s = g >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const hexagone = (R, rot = 0, etire = 1) => [0, 1, 2, 3, 4, 5].map((k) => {
    const a = rad(k * 60 + rot);
    return [R * Math.cos(a) * etire, R * Math.sin(a)];
  });
  function irregulier(R, graine, n = 13, ecart = 0.2, etire = 1, rot = 0) {
    const r = alea(graine);
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = (k + (r() - 0.5) * 0.5) / n * 2 * Math.PI;
      const rr = R * (1 - ecart / 2 + ecart * r());
      const x = rr * Math.cos(a) * etire, z = rr * Math.sin(a);
      pts.push([x * Math.cos(rad(rot)) - z * Math.sin(rad(rot)), x * Math.sin(rad(rot)) + z * Math.cos(rad(rot))]);
    }
    return pts;
  }

  // ── feuillets : couches de bas en haut [épaisseur, couleur, nom] ──
  const T = (c) => [2.2, C.T, "T"];
  const feuillet = (type, oct) => (type === "21" ? [T(), [2.2, C[oct], "O"], T()] : [T(), [2.1, C[oct], "O"]]);
  const epaisseur = (f) => f.reduce((s, x) => s + x[0], 0);
  // contenu de l'espace : { type: "K" | "Na" | "Ca" | "eau" | "hydroxyde" | "vide", oct }
  function pilePlaques(F, niveaux, contourDe, o = {}) {
    // niveaux : [{ f: feuillet, d (espacement de ce feuillet au suivant), esp: contenu }], du bas vers le haut
    let y = 0;
    niveaux.forEach((nv, k) => {
      const cont = contourDe(k);
      let h = y;
      nv.f.forEach(([e, c], i) => {
        prisme(F, cont, h, h + e, c, { haut: i === nv.f.length - 1, bas: i === 0 });
        h += e;
      });
      if (k < niveaux.length - 1) {
        const g0 = h, g1 = y + nv.d, mi = (g0 + g1) / 2, x = nv.esp || {};
        if (x.type === "eau") prisme(F, cont, g0, g1, C.eau, { a: EAU_A, trait: null });
        else if (x.type === "hydroxyde") prisme(F, cont, mi - 1.05, mi + 1.05, C[x.oct], { haut: false, bas: false });
        else if (C[x.type]) prisme(F, cont, mi - 0.6, mi + 0.6, C[x.type], { haut: false, bas: false });
      }
      y += nv.d;
    });
    return y;
  }

  // ── état d'hydratation : espacement (Å) de l'espace qui gonfle, interpolé pendant une transition ──
  const E = EB.ETATS;
  const dEtat = (liste, i, j, u) => (j === undefined ? liste[i].d : liste[i].d + (liste[j].d - liste[i].d) * u);

  // ─────────────────────────── les familles ───────────────────────────
  const OCT = {
    kaolinite: "Al", dickite: "Al", nacrite: "Al", halloysite: "Al", endellite: "Al",
    lizardite: "Mg", chrysotile: "Mg", antigorite: "Mg", amesite: "MgAl", cronstedtite: "Fe", odinite: "Fe", berthierine: "Fe",
    greenalite: "Fe", nepouite: "Ni", talc: "Mg", willemseite: "Ni", minnesotaite: "Fe", pyrophyllite: "Al", ferripyrophyllite: "Fe",
    montmorillonite: "Al", beidellite: "Al", nontronite: "Fe", saponite: "Mg", hectorite: "Mg", stevensite: "Mg", sauconite: "Zn",
    volkonskoite: "Cr", swinefordite: "Al", vermiculite: "Mg", illite: "Al", glauconite: "Fe", celadonite: "Fe", sericite: "Al",
    muscovite: "Al", biotite: "FeMg", phlogopite: "Mg", paragonite: "Al", lepidolite: "Al", margarite: "Al", brammallite: "Al",
    annite: "Fe", zinnwaldite: "Fe", clintonite: "Mg", clinochlore: "Mg", chamosite: "Fe", sudoite: "Al", cookeite: "Al",
    franklinfurnaceite: "Mn", pennantite: "Mn", nimite: "Ni", baileychlore: "Zn", donbassite: "Al", sepiolite: "Mg", palygorskite: "MgAl",
    hisingerite: "Fe", smectites: "Al", chlorite: "Mg",
  };
  const INTERCAT = { paragonite: "Na", brammallite: "Na", margarite: "Ca", clintonite: "Ca" };
  // clé de l'atlas → espèce (pour les couleurs)
  function espece(cle) {
    const f = EB.ARGILES3D[cle][0];
    const s = cle.replace(/^fiche:/, "").replace(/_(e|m)$/, "");
    return OCT[s] ? s : f;
  }

  // légende commune
  const puce = (c, txt, a = 1) => `<span class="s3d-el"><i style="background:${rgb(a < 1 ? mel(c, 1 - a) : c)}"></i>${txt}</span>`;
  const legendeFeuillet = (oct, type) => puce(C.T, "couche tétraédrique <small>Si, O</small>")
    + puce(C[oct], `couche octaédrique <small>${NOM_OCT[oct]}, O, OH</small>`);

  const NM = (x) => (x / 10).toLocaleString("fr-FR", { maximumFractionDigits: 1 });

  // ── plaquettes (kaolin, serpentines planes, talc, micas, chlorites, smectites, vermiculite, illite, interstratifiés) ──
  function plaquettes(def, i, j, u) {
    const F = [];
    const niveaux = def.niveaux(i, j, u);
    const contourDe = def.contour;
    let H = 0;
    if (def.ondule) H = pileOndulee(F, niveaux, def);
    else H = pilePlaques(F, niveaux, contourDe);
    return { F, H };
  }
  // feuillets souples des smectites : nappes ondulées, contours irréguliers tournés au hasard (empilement turbostratique)
  function pileOndulee(F, niveaux, def) {
    const onde = (x, z) => def.ondule * Math.sin(x / 70 + 0.7) * Math.cos(z / 90 - 0.3);
    const grad = (x, z) => [def.ondule / 70 * Math.cos(x / 70 + 0.7) * Math.cos(z / 90 - 0.3), -def.ondule / 90 * Math.sin(x / 70 + 0.7) * Math.sin(z / 90 - 0.3)];
    let y = 0;
    niveaux.forEach((nv, k) => {
      const r = alea(31 + k * 17), rot = r() * 360, R = def.R * (0.85 + 0.25 * r());
      const pts = irregulier(R, 90 + k * 7, 14, 0.28, def.etire || 1, rot);
      const rayonA = (a) => {   // rayon du contour dans la direction a (interpolation entre sommets)
        const angs = pts.map(([x, z]) => Math.atan2(z, x));
        let best = 0, dmin = 9;
        angs.forEach((b, i) => { const d = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); if (d < dmin) { dmin = d; best = i; } });
        const i2 = (best + 1) % pts.length, i0 = (best + pts.length - 1) % pts.length;
        const autre = Math.abs(Math.atan2(Math.sin(a - angs[i2]), Math.cos(a - angs[i2]))) < Math.abs(Math.atan2(Math.sin(a - angs[i0]), Math.cos(a - angs[i0]))) ? i2 : i0;
        const ra = Math.hypot(...pts[best]), rb = Math.hypot(...pts[autre]);
        const da = dmin, db = Math.abs(Math.atan2(Math.sin(a - angs[autre]), Math.cos(a - angs[autre])));
        return (ra * db + rb * da) / (da + db || 1);
      };
      const S0 = (y0) => (th, s) => {
        const rr = rayonA(th) * s, x = rr * Math.cos(th), z = rr * Math.sin(th);
        const [gx, gz] = grad(x, z);
        return { p: [x, y0 + onde(x, z), z], n: unit([-gx, 1, -gz]) };
      };
      const grille = [[0, 2 * Math.PI, 30], [0, 1, 4]];
      let h = 0;
      nv.f.forEach(([e, c], ii) => {
        nappe(F, S0(y), grille[0], grille[1], h, h + e, c,
          { faces: { haut: ii === nv.f.length - 1, bas: ii === 0, u0: false, u1: false, v0: false, v1: true } });
        h += e;
      });
      if (k < niveaux.length - 1 && nv.esp && nv.esp.type === "eau") {
        nappe(F, S0(y), grille[0], grille[1], h, nv.d, C.eau, { a: EAU_A, faces: { haut: false, bas: false, u0: false, u1: false, v0: false, v1: true } });
      }
      y += nv.d;
    });
    return y;
  }

  // ── tube enroulé en spirale (halloysite, chrysotile) ──
  // axe le long de x ; θ de 0 à 2π·tours ; rayon r0 + d·θ/2π ; couches du dedans vers le dehors
  function spirale(F, { r0, tours, d, couches, L, eau }) {
    const S = (th, x) => {
      const r = r0 + d * th / (2 * Math.PI);
      return { p: [x, r * Math.sin(th), r * Math.cos(th)], n: [0, Math.sin(th), Math.cos(th)] };
    };
    const nu = Math.round(tours * 44), tMax = tours * 2 * Math.PI;
    let h = 0;
    const tout = couches.concat(eau ? [[d - epaisseur(couches), C.eau, "eau"]] : []);
    tout.forEach(([e, c, nom], k) => {
      const a = nom === "eau" ? EAU_A : 1;
      // bouts du tube (x = 0 et L) sur toute la spirale ; dessus du dernier tour et dessous du premier seulement (le reste est caché)
      nappe(F, S, [0, tMax, nu], [0, L, 1], h, h + e, c, { a, faces: { haut: false, bas: false, u0: true, u1: true, v0: true, v1: true } });
      if (k === tout.length - 1 || (nom !== "eau" && k === couches.length - 1))
        nappe(F, S, [tMax - 2 * Math.PI, tMax, 44], [0, L, 3], h, h + e, c, { a, faces: { haut: true, bas: false, u0: false, u1: false, v0: false, v1: false } });
      if (k === 0) nappe(F, S, [0, 2 * Math.PI, 44], [0, L, 3], h, h + e, c, { faces: { haut: false, bas: true, u0: false, u1: false, v0: false, v1: false } });
      h += e;
    });
  }
  // cylindre à couches (imogolite) : rayons [r0, r1] par couche, centre (cy, cz), axe x
  function cylindre(F, cy, cz, couches, L) {
    couches.forEach(([r0, r1, c], k) => {
      const S = (th, x) => ({ p: [x, cy + r0 * Math.sin(th), cz + r0 * Math.cos(th)], n: [0, Math.sin(th), Math.cos(th)] });
      nappe(F, S, [0, 2 * Math.PI, 26], [0, L, 2], 0, r1 - r0, c,
        { faces: { haut: k === couches.length - 1, bas: k === 0, u0: false, u1: false, v0: true, v1: true } });
    });
  }
  // sphère à couches, entaillée d'un quart (coin) quand `coupe` ; perforations (directions) facultatives
  function sphere(F, centre, couches, { coupe = false, trous = [], n = 22 } = {}) {
    const u0 = coupe ? Math.PI / 2 : 0, u1 = 2 * Math.PI;
    const S = (lo, la) => {
      const nn = [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
      return { p: centre, n: nn };
    };
    const nu = Math.round(n * (u1 - u0) / Math.PI), nv = n;
    // perforations : la maille de la grille qui contient chaque direction
    const percees = new Set(trous.map(([lo, la]) => {
      const a = ((lo - u0) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      return Math.floor(a / (u1 - u0) * nu) + "," + Math.floor((la + Math.PI / 2) / Math.PI * nv);
    }));
    const trou = (i, j) => percees.has(i + "," + j);
    couches.forEach(([r0, r1, c], k) => {
      nappe(F, S, [u0, u1, nu], [-Math.PI / 2 + 1e-3, Math.PI / 2 - 1e-3, nv], r0, r1, c,
        { trou, faces: { haut: k === couches.length - 1, bas: k === 0 && (coupe || trous.length > 0), u0: coupe, u1: coupe, v0: false, v1: false } });
    });
  }

  // ─────────────────────────── définitions par clé ───────────────────────────
  const REF = {
    kaolin: "Formes : Brigatti, Galán et Theng (2013), <i>Handbook of Clay Science</i>, 2ᵉ éd., chap. 2.",
    halloysite: "Dimensions : Joussein E., Petit S., Churchman J., Theng B., Righi D. et Delvaux B. (2005), <i>Clay Minerals</i> 40, p. 383–426.",
    chrysotile: "Dimensions : Yada K. (1971), <i>Acta Crystallographica</i> A27, p. 659–664.",
    antigorite: "Ondulations : Capitani G. et Mellini M. (2004), <i>American Mineralogist</i> 89, p. 147–158.",
    fibres: "Canaux : Galán E. (1996), <i>Clay Minerals</i> 31, p. 443–453.",
    imogolite: "Tubes et faisceaux : Cradwick P. D. G. et al. (1972), <i>Nature Physical Science</i> 240, p. 187–189.",
    allophane: "Sphérules : Parfitt R. L. (2009), <i>Clay Minerals</i> 44, p. 135–155.",
    hisingerite: "Sphères : Eggleton R. A. et Tilley D. B. (1998), <i>Clays and Clay Minerals</i> 46, p. 400–413.",
  };
  const ech = (vrai) => `Dessin à l'échelle : chaque feuillet à son épaisseur vraie. ${vrai}`;

  function definition(cle) {
    const f = EB.ARGILES3D[cle][0], sp = espece(cle), oct = OCT[sp] || OCT[f] || "Al";
    const X = EB.INTERSTRAT[cle];
    const COU = EB.COUCHES;
    const fam = EB.FAMILLE[f];
    const s = cle.replace(/^fiche:/, "").replace(/_(e|m)$/, "");
    const cat = INTERCAT[sp] || INTERCAT[f] || "K";

    // — tubes enroulés —
    if (s === "halloysite" || s === "endellite") return {
      titre: "Halloysite enroulée en tube", change: true, vue: [18, -38], axe: [0, 1, 0],
      construire: (i, j, u) => {
        const d = dEtat(E.halloysite, i, j, u), F = [];
        spirale(F, { r0: 80, tours: 12, d, couches: [[2.1, C.Al, "O"], [2.2, C.T, "T"]], L: 420, eau: d > 7.3 });
        return { F, legende: legendeFeuillet("Al") + (d > 7.3 ? puce(C.eau, "eau entre les feuillets", EAU_A) : ""),
          note: `Le feuillet 1:1 de l'halloysite s'enroule sur lui-même en spirale : sa couche tétraédrique (bleue), plus large, reste
            à l'extérieur, sa couche d'aluminium à l'intérieur ; le canal central est bordé d'Al–OH, la surface extérieure de Si–O–Si.
            Tube dessiné : 12 tours, canal de 16 nm, ${NM(2 * (80 + 12 * d))} nm de diamètre, coupé à 42 nm de long. ${ech("Les vrais tubes mesurent 30 à 190 nm de diamètre extérieur (canal de 10 à 100 nm) et 0,5 à plusieurs µm de long ; certaines halloysites forment des sphères.")}
            ${d > 7.3 ? "État « 1 couche d'eau » : feuillets espacés de 10 Å." : "État « sèche » : feuillets espacés de 7,2 Å."} ${REF.halloysite}` };
      } };
    if (s === "chrysotile") return {
      titre: "Chrysotile enroulé en fibre", vue: [18, -38], axe: [0, 1, 0],
      construire: () => {
        const F = [];
        spirale(F, { r0: 37, tours: 12, d: 7.3, couches: [[2.2, C.T, "T"], [2.1, C.Mg, "O"]], L: 360 });
        return { F, legende: legendeFeuillet("Mg"),
          note: `Le feuillet 1:1 du chrysotile s'enroule en fibrille creuse, à l'inverse de l'halloysite : sa couche de magnésium,
            plus large que la couche tétraédrique, reste à l'extérieur. Fibrille dessinée : canal de 7,5 nm, 25 nm de diamètre
            (12 tours), coupée à 36 nm de long. ${ech("Les vraies fibrilles mesurent 25 nm de diamètre (canal de 7 à 8 nm) et des µm à des cm de long, groupées en faisceaux : c'est l'amiante blanc.")} ${REF.chrysotile}` };
      } };
    if (s === "antigorite") return {
      titre: "Antigorite, feuillets ondulés", vue: [22, -30], axe: [0, 1, 0],
      construire: () => {
        const F = [], lam = 43.5, Lx = 8 * lam, Lz = 140, d = 7.27;
        const onde = (x) => 0.8 * Math.sin(2 * Math.PI * x / lam), pente = (x) => 0.8 * 2 * Math.PI / lam * Math.cos(2 * Math.PI * x / lam);
        for (let k = 0; k < 6; k++) {
          const y0 = k * d;
          const S = (x, z) => ({ p: [x - Lx / 2, y0 + onde(x), z - Lz / 2], n: unit([-pente(x), 1, 0]) });
          nappe(F, S, [0, Lx, 96], [0, Lz, 1], 0, 2.1, C.Mg);
          for (let q = 0; q < 16; q++) {
            const bas = q % 2 === 0;   // bosse vers le haut : couche tétraédrique dessous (côté concave)
            nappe(F, S, [q * lam / 2, (q + 1) * lam / 2, 6], [0, Lz, 1], bas ? -2.2 : 2.1, bas ? 0 : 4.3, C.T);
          }
        }
        return { F, legende: legendeFeuillet("Mg"),
          note: `Dans l'antigorite, la couche de magnésium, continue, ondule ; la couche tétraédrique change de côté à chaque
            demi-onde (tous les 21 à 22 Å), toujours du côté creux. Rayon de courbure ≈ 75 Å, d'où des ondes très plates. Bloc
            dessiné : 8 ondes (35 nm) sur 6 feuillets. ${ech("Les vrais cristaux sont des lamelles de quelques µm.")} ${REF.antigorite}` };
      } };

    // — fibres : sépiolite, palygorskite —
    if (fam === "fibre") {
      const sep = f === "sepiolite", W = sep ? 13.4 : 8.95, hR = sep ? 6.7 : 6.4, nC = sep ? 8 : 11, nR = 6, L = 220;
      const octF = sep ? "Mg" : "MgAl";
      return {
        titre: sep ? "Sépiolite, fibre à canaux" : "Palygorskite, fibre à canaux", vue: [18, -58], axe: [0, 1, 0],
        construire: () => {
          const F = [], larg = nC * W;
          for (let r = 0; r < nR; r++) for (let c = 0; c < nC; c++) {
            const x0 = c * W - larg / 2, y0 = r * hR - nR * hR / 2;
            const cont = [[x0, -L / 2], [x0 + W, -L / 2], [x0 + W, L / 2], [x0, L / 2]];
            if ((r + c) % 2 === 0) {
              const o = hR - 4.4;
              prisme(F, cont, y0, y0 + 2.2, C.T, { haut: false });
              prisme(F, cont, y0 + 2.2, y0 + 2.2 + o, C[octF], { haut: false, bas: false });
              prisme(F, cont, y0 + 2.2 + o, y0 + hR, C.T, { bas: false });
            } else {   // canal : on n'en dessine que les deux bouts (eau translucide), pour ne pas voiler la fibre
              [-L / 2, L / 2].forEach((zc) => face(F, [[x0, y0, zc], [x0 + W, y0, zc], [x0 + W, y0 + hR, zc], [x0, y0 + hR, zc]], C.eau, [0, 0, Math.sign(zc)], { a: EAU_A }));
            }
          }
          // le prisme est dans le plan (x, z) ; la fibre s'allonge selon z : on la couche le long de x pour la vue
          F.forEach((fc) => { fc.p = fc.p.map(([x, y, z]) => [z, y, x]); fc.n = [fc.n[2], fc.n[1], fc.n[0]]; });
          return { F, legende: legendeFeuillet(octF) + puce(C.eau, "canal (eau « zéolitique »)", EAU_A),
            note: `Pas de feuillets plans : la couche tétraédrique, continue, pointe alternativement vers le haut et vers le bas tous
              les ${sep ? "trois" : "deux"} rubans de chaînes ; les couches octaédriques ne forment que des rubans, en damier, et laissent
              entre elles des canaux de ${sep ? "3,7 × 10,6" : "3,7 × 6,4"} Å où loge l'eau. La fibre s'allonge le long des canaux.
              Fibre dessinée : ${NM(larg)} × ${NM(nR * hR)} nm, coupée à ${NM(L)} nm. ${ech("Les vraies fibres mesurent 10 à 30 nm de large et 1 à 10 µm de long.")} ${REF.fibres}` };
        } };
    }

    // — para-cristallins —
    if (f === "imogolite") return {
      titre: "Imogolite, faisceau de tubes", vue: [14, -36], axe: [0, 1, 0],
      construire: () => {
        const F = [], D = 23, L = 260;
        const centres = [[0, 0]].concat([0, 1, 2, 3, 4, 5].map((k) => [D * Math.cos(rad(60 * k)), D * Math.sin(rad(60 * k))]));
        centres.forEach(([y, z]) => cylindre(F, y, z, [[5.9, 8.1, C.T], [8.1, 10.1, C.Al]], L));
        F.forEach((fc) => { fc.p = fc.p.map(([x, y, z]) => [x - L / 2, y, z]); });
        return { F, legende: puce(C.Al, "couche d'aluminium <small>Al, O, OH, à l'extérieur</small>") + puce(C.T, "tétraèdres SiO₃(OH) <small>à l'intérieur</small>"),
          note: `Chaque tube est un seul feuillet refermé : aluminium à l'extérieur, silicium à l'intérieur, 2 nm de diamètre (canal
            de 1 nm). Les tubes se rangent en faisceaux, à 2,2–2,3 nm d'axe à axe. Faisceau dessiné : 7 tubes coupés à 26 nm.
            ${ech("Les vrais faisceaux comptent des dizaines à des centaines de tubes, longs de quelques µm.")} ${REF.imogolite}` };
      } };
    if (f === "allophane") return {
      titre: "Allophane, sphères creuses", vue: [16, -30], axe: [0, 1, 0],
      construire: () => {
        const F = [];
        const boules = [[0, 0, 0, 1, true], [40, 6, -8, 1.15], [-38, -4, -14, 1.05], [6, 36, -20, 1.3], [-8, -37, -12, 1.1], [28, -30, -38, 1], [-30, 30, -40, 1.2]];
        const ico = [[0, 1.02], [0.63, 0.46], [1.88, 0.46], [3.14, 0.46], [4.4, 0.46], [5.65, 0.46], [0.63, -0.46], [1.88, -0.46], [3.14, -0.46], [4.4, -0.46], [5.65, -0.46], [0, -1.02]];
        boules.forEach(([x, y, z, k, coupe]) => sphere(F, [x, y, z], [[12.3 * k, 14.5 * k, C.T], [14.5 * k, 16.5 * k, C.Al]],
          { coupe: !!coupe, trous: ico.map(([lo, la]) => [lo + 0.3, la * 0.9]), n: coupe ? 14 : 11 }));
        return { F, legende: puce(C.Al, "couche d'aluminium <small>Al, O, OH, à l'extérieur</small>") + puce(C.T, "tétraèdres de silicium <small>à l'intérieur</small>"),
          note: `Des sphères creuses de 3,5 à 5 nm : une seule paroi, la même que celle de l'imogolite (aluminium dehors, silicium
            dedans), percée de perforations d'≈ 0,3 nm par où l'eau entre. La sphère du premier plan est entaillée pour montrer le
            vide intérieur. ${ech("Les sphères s'agrègent par milliers en grains de 0,1 à 1 µm.")} ${REF.allophane}` };
      } };
    if (f === "hisingerite") return {
      titre: "Hisingérite, sphères concentriques", vue: [16, -30], axe: [0, 1, 0],
      construire: () => {
        const F = [], d = 7.1;
        [[0, 0, 0, 5, true], [150, 26, -70, 3], [-150, -22, -90, 6]].forEach(([x, y, z, n, coupe]) => {
          const couches = [];
          for (let k = 0; k < n; k++) {
            const r = 70 - (n - k) * d;
            couches.push([r, r + 2.1, C.Fe], [r + 2.1, r + 4.3, C.T]);
          }
          sphere(F, [x, y, z], couches, { coupe: !!coupe, n: 22 });
        });
        return { F, legende: legendeFeuillet("Fe"),
          note: `L'hisingérite est une kaolinite ferrique dont les feuillets de 7 Å se referment en sphères creuses d'≈ 14 nm, emboîtées
            jusqu'à six feuillets d'épaisseur. Sens des couches dans la courbure non établi : dessiné comme celui de l'halloysite
            (couche tétraédrique dehors). La sphère du premier plan est entaillée. ${ech("Tailles vraies.")} ${REF.hisingerite}` };
      } };

    // — plaquettes —
    const plaque = (o) => Object.assign({ vue: [24, -28], axe: [0, 1, 0] }, o, {
      construire: (i, j, u) => {
        const r = plaquettes(o, i, j, u);
        return { F: r.F, legende: o.legende(i, j, u), note: o.note(i, j, u) };
      } });
    const ctr = (forme, R, graine = 3, etire = 1) => (k) => (forme === "hexa" ? hexagone(R, 0, etire)
      : forme === "latte" ? irregulier(R, graine, 12, 0.12, 2.4, 0) : irregulier(R, graine, 13, 0.22, etire, 0));

    if (X) {   // interstratifiés
      const fa = X.A, fb = X.B, cle2 = cle;
      const typeA = EB.FAMILLE[fa], octA = OCT[fa] || "Al", octB = OCT[fb] || "Al";
      const fA = feuillet(typeA === "11" ? "11" : "21", octA), fB = feuillet("21", octB);
      const espA = typeA === "mica" ? { type: INTERCAT[fa] || "K" } : typeA === "chlorite" ? { type: "hydroxyde", oct: fa === "sudoite" ? "Al" : "Mg" } : { type: "vide" };
      const verm = !!X.vermiculite, liste = verm ? E.vermiculite : E.is;
      const n = 9, r0 = alea(5), seq = [];
      for (let k = 0; k < n; k++) seq.push(X.regulier ? (k % 2 ? "B" : "A") : (r0() < 0.5 ? "A" : "B"));
      const nomA = X.noms[0], nomB = X.noms[1];
      return plaque({ titre: "Interstratifié", change: true, R: 170, contour: ctr("irr", 170, 11),
        niveaux: (i, j, u) => seq.map((t) => (t === "A" ? { f: fA, d: COU[fa].d, esp: espA } : { f: fB, d: dEtat(liste, i, j, u), esp: { type: "eau" } })),
        legende: () => puce(C.T, "couche tétraédrique <small>Si, O</small>") + puce(C[octA], `couche octaédrique <small>${NOM_OCT[octA]}</small>`)
          + (octB !== octA ? puce(C[octB], `couche octaédrique <small>${NOM_OCT[octB]}</small>`) : "")
          + (espA.type === "hydroxyde" ? puce(C[espA.oct], `feuillet d'hydroxyde de la ${nomA}`) : C[espA.type] ? puce(C[espA.type], `${espA.type}⁺ entre les feuillets de ${nomA}`) : "")
          + puce(C.eau, `eau entre les feuillets de ${nomB}`, EAU_A),
        note: (i, j, u) => `Un même cristal empile des feuillets de ${nomA} et de ${nomB} ${X.regulier ? "en alternance stricte" : "au hasard"} ;
          seuls les espaces de ${nomB} prennent l'eau (${NM(dEtat(liste, i, j, u))} nm d'un feuillet de ${nomB} au suivant dans l'état
          choisi). Cristal dessiné : 9 feuillets, 34 nm de large. ${ech("Les vrais cristaux sont des plaquettes de 0,1 à 1 µm.")}` });
    }

    if (["kaolinite", "dickite", "nacrite"].includes(f) && !(s === "halloysite" || s === "endellite")) {
      const R = f === "dickite" ? 190 : f === "nacrite" ? 180 : 170, n = f === "dickite" ? 16 : f === "nacrite" ? 14 : 12;
      return plaque({ titre: "Cristal de kaolin", R, contour: ctr("hexa", R, 1, f === "kaolinite" ? 1.08 : 1.3),
        niveaux: () => Array.from({ length: n }, () => ({ f: feuillet("11", "Al"), d: COU[f].d, esp: { type: "vide" } })),
        legende: () => legendeFeuillet("Al"),
        note: () => `Les feuillets 1:1 restent plans et s'empilent en plaquettes pseudo-hexagonales, elles-mêmes souvent empilées en
          « livrets ». ${f === "dickite" ? "La dickite forme des cristaux plus gros et plus épais que la kaolinite. " : f === "nacrite" ? "La nacrite forme des plaquettes plus allongées, souvent plus grosses que celles de la kaolinite. " : ""}Plaquette dessinée : ${n} feuillets,
          ${NM(2 * R)} nm de large. ${ech("Une vraie plaquette de kaolinite mesure 0,1 à 2 µm de large et compte des dizaines à des centaines de feuillets.")} ${REF.kaolin}` });
    }
    if (fam === "11") {   // serpentines planes et 1:1 riches en fer ou nickel
      const n = 10, R = 150;
      return plaque({ titre: "Plaquette de serpentine", R, contour: ctr("hexa", R),
        niveaux: () => Array.from({ length: n }, () => ({ f: feuillet("11", oct), d: COU[f].d, esp: { type: "vide" } })),
        legende: () => legendeFeuillet(oct),
        note: () => `Feuillets 1:1 plans, empilés en plaquettes, tenus par des liaisons hydrogène. Plaquette dessinée : ${n} feuillets,
          30 nm de large. ${ech("Les vrais cristaux mesurent de 0,1 à quelques µm.")}` });
    }
    if (fam === "neutre") {
      const n = 10, R = 180;
      return plaque({ titre: "Plaquette de talc", R, contour: ctr("irr", R, 7),
        niveaux: () => Array.from({ length: n }, () => ({ f: feuillet("21", oct), d: COU[f].d, esp: { type: "vide" } })),
        legende: () => legendeFeuillet(oct),
        note: () => `Feuillets 2:1 neutres, simplement posés les uns sur les autres (forces de van der Waals) : ils glissent, d'où
          la douceur du talc. Plaquette dessinée : ${n} feuillets, 36 nm de large. ${ech("Les vraies plaquettes mesurent du µm au mm.")}` });
    }
    if (fam === "mica") {
      const n = s === "sericite" ? 8 : 10, R = s === "sericite" ? 120 : 180;
      return plaque({ titre: "Plaquette de mica", R, contour: ctr("hexa", R),
        niveaux: () => Array.from({ length: n }, () => ({ f: feuillet("21", oct), d: COU[f].d, esp: { type: cat } })),
        legende: () => legendeFeuillet(oct) + puce(C[cat], `${cat === "Ca" ? "Ca²⁺" : cat + "⁺"} entre les feuillets`),
        note: () => `Feuillets 2:1 verrouillés par des ions ${cat === "Ca" ? "Ca²⁺" : cat + "⁺"} : ils restent plans et forment des plaquettes
          hexagonales qui se clivent en lames. Plaquette dessinée : ${n} feuillets, ${NM(2 * R)} nm de large. ${ech(s === "sericite"
            ? "La séricite est faite de paillettes de quelques µm." : "Un vrai cristal de mica mesure du mm au dm.")}` });
    }
    if (fam === "chlorite") {
      const n = 7, R = 170, oh = ["sudoite", "donbassite", "cookeite"].includes(sp) ? "Al" : oct;
      return plaque({ titre: "Plaquette de chlorite", R, contour: ctr("hexa", R),
        niveaux: () => Array.from({ length: n }, () => ({ f: feuillet("21", oct), d: COU[f].d, esp: { type: "hydroxyde", oct: oh } })),
        legende: () => legendeFeuillet(oct) + (oh !== oct ? puce(C[oh], "feuillet d'hydroxyde <small>Al, OH</small>") : puce(C[oh], `feuillet d'hydroxyde <small>${NOM_OCT[oh]}, OH</small>`)),
        note: () => `Chaque feuillet 2:1 est soudé au suivant par un feuillet d'hydroxyde : l'empilement est rigide et ne gonfle pas.
          Plaquette dessinée : ${n} feuillets, 34 nm de large. ${ech("Les vrais cristaux mesurent du µm au mm.")}` });
    }
    if (f === "vermiculite") {
      const n = 8, R = 200;
      return plaque({ titre: "Plaquette de vermiculite", R, change: true, contour: ctr("irr", R, 21, 1.05),
        niveaux: (i, j, u) => Array.from({ length: n }, () => ({ f: feuillet("21", "Mg"), d: dEtat(E.vermiculite, i, j, u), esp: { type: "eau" } })),
        legende: () => legendeFeuillet("Mg") + puce(C.eau, "Mg²⁺ et eau entre les feuillets", EAU_A),
        note: (i, j, u) => `Feuillets 2:1 fortement chargés, séparés par Mg²⁺ et au plus deux couches d'eau : l'ensemble gonfle peu
          (espacement ${NM(dEtat(E.vermiculite, i, j, u))} nm dans l'état choisi). Chauffée brutalement, l'eau se vaporise et écarte les
          paquets de feuillets en accordéon : c'est la vermiculite expansée. Plaquette dessinée : ${n} feuillets, 40 nm de large.
          ${ech("Les vraies paillettes de vermiculite mesurent du mm au cm.")}` });
    }
    if (f === "illite" || f === "glauconite" || f === "celadonite") {
      const n = 8, R = 150, gonfle = f !== "celadonite";
      return plaque({ titre: "Particule d'illite", R, change: gonfle, contour: ctr(f === "illite" ? "latte" : "irr", f === "illite" ? 90 : R, 13),
        niveaux: (i, j, u) => Array.from({ length: n }, (x, k) => (gonfle && k === 4 ? { f: feuillet("21", oct), d: dEtat(E.faible, i, j, u), esp: { type: "eau" } }
          : { f: feuillet("21", oct), d: COU[f].d, esp: { type: "K" } })),
        legende: () => legendeFeuillet(oct) + puce(C.K, "K⁺ entre les feuillets") + (gonfle ? puce(C.eau, "espace sans potassium, avec eau", EAU_A) : ""),
        note: (i, j, u) => `Des paquets de quelques feuillets 2:1 verrouillés par K⁺, en ${f === "illite" ? "lattes et plaquettes" : "plaquettes"}
          à bords irréguliers${gonfle ? " ; un espace a perdu son potassium et prend l'eau (" + NM(dEtat(E.faible, i, j, u)) + " nm dans l'état choisi), d'où le gonflement faible" : ""}.
          Particule dessinée : ${n} feuillets. ${ech(f === "glauconite" ? "Les cristaux de glauconite, de moins d'un µm, s'agrègent en grains verts arrondis de 0,1 à 1 mm." : "Les vraies particules mesurent 0,1 à 1 µm de large et 2 à 20 feuillets d'épaisseur.")}` });
    }
    if (fam === undefined && ["montmorillonite", "hectorite", "nontronite"].includes(f)) {   // smectites
      const latte = ["nontronite", "hectorite", "swinefordite"].includes(sp);
      const petite = ["saponite", "stevensite", "sauconite"].includes(sp);
      const n = 6, R = petite ? 140 : 210;
      return plaque({ titre: "Tactoïde de smectite", R, change: true, ondule: 7, etire: latte ? 2.2 : 1,
        niveaux: (i, j, u) => Array.from({ length: n }, () => ({ f: feuillet("21", oct), d: dEtat(E.smectite, i, j, u), esp: { type: "eau" } })),
        legende: () => legendeFeuillet(oct) + puce(C.eau, "cations et eau entre les feuillets", EAU_A),
        note: (i, j, u) => `Feuillets 2:1 très fins (1 nm) et souples, ${latte ? "en lattes" : "en flocons"} ondulés, empilés à quelques-uns
          en « tactoïdes », chacun tourné au hasard par rapport au suivant (empilement turbostratique). Entre eux, cations et eau :
          ${NM(dEtat(E.smectite, i, j, u))} nm d'un feuillet au suivant dans l'état choisi. Tactoïde dessiné : ${n} feuillets, ${NM(2 * R)} nm
          de large. ${ech("Les vrais feuillets mesurent 0,1 à 1 µm de large pour 1 nm d'épaisseur : 100 à 1 000 fois plus larges qu'épais.")}` });
    }
    return null;
  }

  // ─────────────────────────── API ───────────────────────────
  const DEFS = {};
  const def = (cle) => (cle in DEFS ? DEFS[cle] : (DEFS[cle] = EB.ARGILES3D[cle] ? definition(cle) : null));
  function scene(cle, i, j, u) {
    const D = def(cle);
    const r = D.construire(i || 0, j, u);
    // centre et rayon : boîte englobante des faces ; le rayon ne dépend pas de l'orientation (pas de saut pendant la rotation)
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    r.F.forEach((f) => f.p.forEach((p) => p.forEach((x, k) => { if (x < mn[k]) mn[k] = x; if (x > mx[k]) mx[k] = x; })));
    const centre = mn.map((x, k) => (x + mx[k]) / 2);
    let rayon = 0;
    r.F.forEach((f) => f.p.forEach((p) => { rayon = Math.max(rayon, norme(sous(p, centre))); }));
    return { titre: D.titre, faces: r.F, centre, rayon, vue: D.vue, axe: unit(D.axe), legende: r.legende, note: r.note };
  }
  function orientation(S) {
    const [ix, iy] = S.vue || [20, -30];
    return mult(rotation(rad(ix), rad(iy)), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  }

  const LUM = unit([-0.4, 0.55, 0.75]);
  function dessiner(v) {
    const { canvas, R } = v, S = v.morpho;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    const g = canvas.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#fff";
    g.fillRect(0, 0, w, h);
    const echelle = Math.min(w, h) * 0.47 / S.rayon * v.zoom;
    const D = S.rayon * 6;
    const proj = (p) => {
      const q = sous(p, S.centre);
      const x = scal(R[0], q), y = scal(R[1], q), z = scal(R[2], q);
      const f = D / (D - z);
      return [w / 2 + x * echelle * f, h / 2 - y * echelle * f, z];
    };
    const items = [];
    for (const F of S.faces) {
      const nz = scal(R[2], F.n);
      if (F.cull && nz < -1e-4) continue;
      const P = F.p.map(proj);
      let z = 0;
      P.forEach((q) => { z += q[2]; });
      items.push({ F, P, z: z / P.length, nz });
    }
    items.sort((a, b) => a.z - b.z);
    g.lineJoin = "round";
    for (const it of items) {
      const { F, P } = it;
      const ns = [scal(R[0], F.n), scal(R[1], F.n), it.nz];
      const ecl = 0.74 + 0.26 * Math.abs(scal(ns, LUM));
      g.beginPath();
      P.forEach((q, k) => (k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
      g.closePath();
      g.fillStyle = rgb(F.c, ecl, F.a);
      g.fill();
      if (F.a >= 1) { g.strokeStyle = rgb(F.c, ecl, 1); g.lineWidth = 0.7; g.stroke(); }
      if (F.trait) { g.strokeStyle = F.trait; g.lineWidth = 0.8; g.stroke(); }
    }
    // barre d'échelle (nm), en bas à gauche
    const pxNm = echelle * 10;
    const cible = Math.min(w * 0.22, 140) / pxNm;
    const pas = [0.5, 1, 2, 5, 10, 20, 50, 100].reduce((a, b) => (Math.abs(b - cible) < Math.abs(a - cible) ? b : a));
    const L = pas * pxNm, x0 = 18, y0 = h - 18;
    g.strokeStyle = "#222"; g.fillStyle = "#222"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + L, y0); g.stroke();
    g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x0, y0 - 5); g.lineTo(x0, y0 + 3); g.moveTo(x0 + L, y0 - 5); g.lineTo(x0 + L, y0 + 3); g.stroke();
    g.font = "600 12px system-ui, sans-serif"; g.textAlign = "left"; g.textBaseline = "bottom";
    g.fillText(pas.toLocaleString("fr-FR") + " nm", x0, y0 - 6);
  }

  window.ArgilesStructure = {
    a: (cle) => !!(cle && EB.ARGILES3D[cle] && def(cle)),
    change: (cle, i, j) => !!(def(cle) && def(cle).change),
    scene, orientation, dessiner,
  };
})();
