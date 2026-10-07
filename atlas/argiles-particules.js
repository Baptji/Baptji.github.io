// ============ « Structure » des argiles en ATOMES (30/09/2026, 2ᵉ version) ============
// Demande : « ce que j'aurais voulu, c'est voir en détail les atomes s'arranger en structure […] en reprenant quelque chose de
// similaire à l'allophane : on voit bien la structure très particulière, et ça manque avec les autres argiles. » Donc : un petit
// objet ENTIER, atome par atome, qui montre l'organisation propre à chaque argile — l'halloysite qui s'enroule, la plaquette
// hexagonale de kaolinite, les feuillets de smectite tournés au hasard, l'onde de l'antigorite, la fibre à canaux de la sépiolite…
// La vue en surfaces à l'échelle du nm (argiles-structure.js) reste disponible sous « Vue d'ensemble ».
//
// Trois façons de construire, toutes à partir des structures publiées (structures/<f>.js) :
//   • cristal  : la maille publiée répétée puis TAILLÉE (hexagone, latte, fibre) — empilement réel conservé ;
//   • pile     : feuillets publiés empilés par l'atlas, avec l'espace entre eux construit selon l'état d'hydratation
//                (smectites tournées au hasard, vermiculite, illite, interstratifiés) — mêmes briques que espacement-basal.js ;
//   • courbe   : un feuillet publié enroulé en spirale (halloysite, chrysotile) ou posé sur une sphère (hisingérite).
// Taille : 2 000 à 3 600 atomes (le moteur canvas dessine ≈ 2 300 atomes en 16 ms) ; le rayon se règle tout seul.
// Taille : ce sont des objets plus PETITS que les vrais cristaux (la note le dit), mais courbures et épaisseurs sont vraies.
(function () {
  "use strict";
  if (!window.Structure3D || !window.EspacementBasal) return;
  const EB = window.EspacementBasal;
  const D = Structure3D.donnees;
  const rad = (x) => x * Math.PI / 180;
  const MAX = 3600;

  // ── outils ──
  function base3(m) {
    const [a, b, c, al, be, ga] = m;
    const cx = c * Math.cos(rad(be)), cy = c * (Math.cos(rad(al)) - Math.cos(rad(be)) * Math.cos(rad(ga))) / Math.sin(rad(ga));
    return [[a, 0, 0], [b * Math.cos(rad(ga)), b * Math.sin(rad(ga)), 0], [cx, cy, Math.sqrt(Math.max(c * c - cx * cx - cy * cy, 0))]];
  }
  const cart = (B, f) => [0, 1, 2].map((k) => f[0] * B[0][k] + f[1] * B[1][k] + f[2] * B[2][k]);
  function alea(g) { let s = g >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  // contours dans le plan : hexagone (arêtes parallèles à a), latte, disque
  const dansHexa = (x, y, R) => { const X = Math.abs(x), Y = Math.abs(y); return Y <= R * 0.866 && Y * 0.5 + X * 0.866 <= R * 0.866; };
  const CONTOUR = {
    hexa: (x, y, R) => dansHexa(x, y, R),
    latte: (x, y, R) => Math.abs(y) <= R * 0.45 && Math.abs(x) <= R * 1.5,
    disque: (x, y, R) => x * x + y * y <= R * R,
  };

  // ── garder des polyèdres entiers : on choisit les CATIONS, puis on reprend leurs anions et les H de ces anions ──
  const CATIONS = { Si: 1.85, Al: 2.1, Mg: 2.4, Fe: 2.45, Mn: 2.35, Ti: 2.1, Cr: 2.1, Zn: 2.2, Ni: 2.3, Li: 2.3, Be: 1.8, V: 2.2, Co: 2.3 };
  const GROS = { K: 1, Na: 1, Ca: 1, Cs: 1, Ow: 1, Oh: 1, Os: 1 };   // cations entre les feuillets, eau : gardés s'ils sont dans le contour
  function tailler(cands, dedans) {
    // cands : [{ el, p: [x, y, z], lab, occ, test: [x, y] (position pour le contour, souvent p) }]
    const grille = new Map(), cle = (p) => p.map((v) => Math.floor(v / 2.5)).join(",");
    cands.forEach((c, i) => { const k = cle(c.p); if (!grille.has(k)) grille.set(k, []); grille.get(k).push(i); });
    const autour = (p, r, f) => {
      const g = p.map((v) => Math.floor(v / 2.5));
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++)
        for (const j of grille.get([g[0] + dx, g[1] + dy, g[2] + dz].join(",")) || []) {
          const q = cands[j].p, d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
          if (d > 0.05 && d <= r) f(j, d);
        }
    };
    const garde = new Uint8Array(cands.length);
    const cat = (c) => CATIONS[c.occ ? Object.keys(c.occ)[0] : c.el];
    cands.forEach((c, i) => { if ((cat(c) || GROS[c.el]) && dedans(c)) garde[i] = 1; });
    cands.forEach((c, i) => { if (garde[i] && cat(c)) autour(c.p, cat(c), (j) => { if (cands[j].el === "O") garde[j] = 1; }); });
    cands.forEach((c, i) => { if (garde[i] && c.el === "O") autour(c.p, 1.15, (j) => { if (cands[j].el === "H") garde[j] = 1; }); });
    // anions orphelins (sur le bord, sans cation gardé) : déjà exclus ; doublons (images qui se recouvrent) : fusionnés
    const vus = new Set(), out = [];
    cands.forEach((c, i) => {
      if (!garde[i]) return;
      const k = c.el + c.p.map((v) => Math.round(v * 5)).join(",");
      if (vus.has(k)) return;
      vus.add(k); out.push(c);
    });
    return out;
  }
  // structure pour le moteur : boîte autour des atomes (la « maille » n'est qu'une boîte : particule)
  // boite : boîte imposée (animation : la même pour toutes les images, sinon l'objet glisse quand des molécules entrent)
  function emballer(atomes, o, boite) {
    const meta = atomes.meta;
    atomes = atomes.filter((a) => a.echelle === undefined || a.echelle > 0.02);
    const B = boite || boiteDe([atomes]);
    const mn = B.mn, L = B.L.slice();
    if (o.periode) L[2] = o.periode;   // tube infini le long de c (imogolite)
    const at = atomes.map((a) => {
      const x = [0, 1, 2].map((k) => (o.periode && k === 2 ? ((a.p[2] % o.periode) + o.periode) % o.periode / L[2] : (a.p[k] - mn[k] + 8) / L[k]));
      const r = [a.el, +x[0].toFixed(5), +x[1].toFixed(5), +x[2].toFixed(5), a.lab || a.el, a.occ || null];
      if (a.echelle) r.push({ echelle: a.echelle });
      return r;
    });
    return Object.assign({ groupe: "P 1", maille: [L[0], L[1], L[2], 90, 90, 90], atomes: at, repetition: [1, 1, 1], decalage: [0, 0, 0],
      particule: o.particule || "objet", brut: atomes, meta, emb: o }, o.donnees);
  }

  function boiteDe(listes, extra = []) {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    const voir = (p) => p.forEach((x, k) => { if (x < mn[k]) mn[k] = x; if (x > mx[k]) mx[k] = x; });
    listes.forEach((l) => l.forEach((a) => voir(a.p)));
    extra.forEach(voir);
    return { mn, L: [0, 1, 2].map((k) => mx[k] - mn[k] + 16) };
  }

  // ── 1. cristal taillé dans la maille publiée ──
  // n : nombre de feuillets (hauteurs des feuillets tirées de EB.COUCHES) ; contour dans le plan (a, b)
  function cristal(base, c, { n, forme, R }) {
    const B = base3(base.maille), dz = c ? c.decalage[2] : 0;
    const h0 = c ? c.feuillets[0][0] : 0, e = c ? c.e : 0, d = c ? c.d : B[2][2];
    const zMin = h0 - 1.2, zMax = h0 + (n - 1) * d + e + 1.2;
    const kMax = Math.ceil(zMax / B[2][2]) + 1;
    const ext = R * 1.6 + 12;
    const nI = Math.ceil(ext / base.maille[0]) + Math.ceil(kMax * Math.abs(B[2][0]) / base.maille[0]) + 2;
    const nJ = Math.ceil(ext / (base.maille[1] * Math.sin(rad(base.maille[5])))) + Math.ceil(kMax * Math.abs(B[2][1]) / base.maille[1]) + 2;
    const cands = [];
    const cz = (zMin + zMax) / 2, shift = [B[2][0] * cz / B[2][2], B[2][1] * cz / B[2][2]];   // centre du contour : milieu de la pile
    base.atomes.forEach((a) => {
      for (let k = -1; k <= kMax; k++) {
        const fz = ((a[3] + dz) % 1 + 1) % 1 + k;
        for (let i = -nI; i <= nI; i++) for (let j = -nJ; j <= nJ; j++) {
          const p = cart(B, [a[1] + i, a[2] + j, fz]);
          if (p[2] < zMin || p[2] > zMax) continue;
          const x = p[0] - shift[0], y = p[1] - shift[1];
          if (Math.abs(x) > ext || Math.abs(y) > ext) continue;
          cands.push({ el: a[0], p: [x, y, p[2]], lab: a[4], occ: a[5] || null });
        }
      }
    });
    const at = tailler(cands, (q) => CONTOUR[forme](q.p[0], q.p[1], R));
    at.meta = { type: "cristal", forme, R, zBas: h0, zHaut: h0 + (n - 1) * d + e };
    return at;
  }

  // ── 2. pile construite : feuillets publiés + espaces (publiés ou selon l'état) ──
  // niveaux : [{ P (feuillet préparé), rot (radians), esp: { autres: [...] } | { espace } }] ; d : espacement vers le suivant
  function pile(niveaux, { forme, R, liquide }) {
    const cands = [];
    const ext = R * 1.6 + 12;
    // chaque atome garde son rôle : feuillet k (hauteur h au-dessus du bas du feuillet) ou contenu de l'espace k (dz depuis son
    // milieu) — c'est ce qui permet d'animer le passage d'un état d'hydratation à un autre (transition, plus bas)
    const tuiler = (P, rot, z0, liste, supermaille, tag) => {   // liste : [{el, X, Y, h | dz, lab, occ}] en fractions de la maille (ou supermaille)
      const [a, b, , , , ga] = P.base.maille;
      const A = supermaille ? P.A : a, Bb = supermaille ? P.Bb : b;
      const ax = [A, 0], bx = [Bb * Math.cos(rad(ga)), Bb * Math.sin(rad(ga))];
      const nI = Math.ceil(ext / A) + 2, nJ = Math.ceil(ext / (Bb * Math.sin(rad(ga)))) + 2;
      liste.forEach((t) => {
        for (let i = -nI; i <= nI; i++) for (let j = -nJ; j <= nJ; j++) {
          const X = t.X + i, Y = t.Y + j;
          let x = X * ax[0] + Y * bx[0], y = X * ax[1] + Y * bx[1];
          if (Math.abs(x) > ext * 1.2 || Math.abs(y) > ext * 1.2) continue;
          [x, y] = rot2(x, y, rot);
          if (Math.abs(x) > ext || Math.abs(y) > ext) continue;
          cands.push(Object.assign({ el: t.el, p: [x, y, z0 + t.h], lab: t.lab, occ: t.occ || null }, tag, tag.gap !== undefined ? { dz: t.h } : { h: t.h }));
        }
      });
    };
    let z = 0;
    niveaux.forEach((nv, k) => {
      tuiler(nv.P, nv.rot, z, nv.P.feuil, false, { niv: k });
      if (k < niveaux.length - 1) {
        const mi = z + (nv.d + nv.P.e) / 2, g = { gap: k };
        if (nv.esp.autres) tuiler(nv.P, nv.rot, mi, nv.esp.autres.map((t) => Object.assign({}, t, { h: t.dz })), false, g);
        else {
          const E = nv.esp.espace;
          // toute l'eau, liquide comprise (« Dans l'eau ») : même densité que les vues « 1 maille » et « 2 × 2 » (retour du 30/09)
          const eaux = E.eaux;
          tuiler(nv.P, nv.rot, mi, E.cats.map((c) => ({ el: c.el, X: c.u, Y: c.v, h: c.dz, lab: c.el })), true, g);
          tuiler(nv.P, nv.rot, mi, eaux.map((w) => ({ el: w.coq ? "Oh" : "Ow", X: w.u, Y: w.v, h: w.dz, lab: "H2O" })), true, g);
        }
      }
      z += nv.d;
    });
    const at = tailler(cands, (q) => CONTOUR[forme](q.p[0], q.p[1], R));
    at.meta = { type: "pile", forme, R, e: niveaux.map((nv) => nv.P.e), d: niveaux.map((nv) => nv.d) };
    return at;
  }

  // ── 3. feuillet courbé : spirale (tube) ou calotte de sphère ──
  // P : feuillet préparé ; axeTube : "x" ou "y" du plan du feuillet ; sgn : +1 couche octaédrique dehors, −1 dedans
  // position d'un point du feuillet enroulé : s le long de la courbure (fibre neutre), u le long du tube, h hauteur dans le feuillet
  function placeSpirale(m, d, s, u, h) {
    const t = (-m.r0 + Math.sqrt(m.r0 * m.r0 + d * s / Math.PI)) / (d / (2 * Math.PI));
    const r = m.r0 + d * t / (2 * Math.PI) + m.sgn * (h - m.e2);
    return [u, r * Math.sin(t), r * Math.cos(t)];
  }
  const hEau = (m, d) => (m.sgn > 0 ? 2 * m.e2 + (d - 2 * m.e2) / 2 : -(d - 2 * m.e2) / 2);
  function spirale(P, { r0, tours, d, dRef, largeur, axeTube, sgn, eau }) {
    const [a, b, , , , ga] = P.base.maille;
    const ax = [a, 0], bx = [b * Math.cos(rad(ga)), b * Math.sin(rad(ga))];
    const dL = dRef || d;   // longueur du feuillet calculée pour dRef : le même feuillet dans tous les états
    const Ltot = r0 * 2 * Math.PI * tours + dL * Math.pow(2 * Math.PI * tours, 2) / (4 * Math.PI);
    const e2 = P.e / 2;
    const m = { type: "spirale", r0, sgn, e2, d, largeur, Ltot };
    const place = (s, u, h) => placeSpirale(m, d, s, u, h);
    const cands = [];
    const lx = axeTube === "x" ? largeur : Ltot, ly = axeTube === "x" ? Ltot : largeur;
    const nI = Math.ceil((lx + ly) / a) + 3, nJ = Math.ceil((lx + ly) / (b * Math.sin(rad(ga)))) + 3;
    P.feuil.forEach((t) => {
      for (let i = -nI; i <= nI; i++) for (let j = -nJ; j <= nJ; j++) {
        const X = t.X + i, Y = t.Y + j, x = X * ax[0] + Y * bx[0], y = X * ax[1] + Y * bx[1];
        if (x < -3 || x > lx + 3 || y < -3 || y > ly + 3) continue;
        const [s, u] = axeTube === "x" ? [y, x] : [x, y];
        cands.push({ el: t.el, p: place(s, u, t.h), lab: t.lab, occ: t.occ || null, s, u, h: t.h });
      }
    });
    // eau entre les tours (halloysite à 10 Å) : une couche, une molécule pour ≈ 10 Å², côté extérieur du feuillet, là où un tour suit
    if (eau) {
      const hE = hEau(m, d);
      const sMax = Ltot - (r0 * 2 * Math.PI + d * Math.PI);   // jusqu'où le tour suivant recouvre
      for (let s = 1.6; s < sMax; s += 3.2) for (let u = 1.6; u < largeur; u += 3.1) {
        const jit = ((Math.floor(s / 3.2) % 2) * 1.55);
        cands.push({ el: "Ow", p: place(s, (u + jit) % largeur, hE), lab: "H2O", s, u: (u + jit) % largeur, eau: true });
      }
    }
    const at = tailler(cands, (q) => q.s >= 0 && q.s <= Ltot && q.u >= 0 && q.u <= largeur);
    at.meta = m;
    return at;
  }
  function calotte(P, { R, rayon, n, d, sgn }) {
    const cands = [];
    const [a, b, , , , ga] = P.base.maille;
    const ax = [a, 0], bx = [b * Math.cos(rad(ga)), b * Math.sin(rad(ga))];
    const e2 = P.e / 2;
    for (let k = 0; k < n; k++) {
      const Rk = R + k * d, rot = 0.37 * k;
      const ext = rayon * (Rk / R) + 8;
      const nI = Math.ceil(ext / a) + 3, nJ = Math.ceil(ext / (b * Math.sin(rad(ga)))) + 3;
      P.feuil.forEach((t) => {
        for (let i = -nI; i <= nI; i++) for (let j = -nJ; j <= nJ; j++) {
          const X = t.X + i, Y = t.Y + j;
          let x = X * ax[0] + Y * bx[0], y = X * ax[1] + Y * bx[1];
          if (Math.abs(x) > ext || Math.abs(y) > ext) continue;
          [x, y] = rot2(x, y, rot);
          const rho = Math.hypot(x, y), phi = Math.atan2(y, x), tt = rho / Rk, r = Rk + sgn * (t.h - e2);
          cands.push({ el: t.el, p: [r * Math.sin(tt) * Math.cos(phi), r * Math.sin(tt) * Math.sin(phi), r * Math.cos(tt)], lab: t.lab, occ: t.occ || null, rho, Rk });
        }
      });
    }
    return tailler(cands, (q) => q.rho * R / q.Rk <= rayon);
  }

  // ─────────────────────────── par famille ───────────────────────────
  const etatsDe = (liste, i) => liste[Math.min(i, liste.length - 1)];
  const prep = (f) => EB.preparer(D[f], EB.COUCHES[f]);
  // rayon ajusté pour rester sous MAX atomes
  function ajuste(construire, R0) {
    let R = R0, at = construire(R);
    for (let k = 0; k < 8 && at.length > MAX; k++) { R *= Math.sqrt(MAX / at.length) * 0.97; at = construire(R); }
    return { at, R };
  }
  // rayon choisi UNE fois par argile, sur l'état le plus chargé (deux couches d'eau), puis gardé pour tous les états :
  // ce sont les mêmes feuillets d'un état à l'autre, ce qui permet d'animer le passage
  const RFIXE = {};
  function pileFixe(cle, faire, R0, etats, i) {
    if (!(cle in RFIXE)) RFIXE[cle] = ajuste((r) => faire(etats[2], r), R0).R;
    return { at: faire(etats[i], RFIXE[cle]), R: RFIXE[cle] };
  }
  const nm = (x) => (x / 10).toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  const VRAI = {
    kaolin: "Un vrai cristal de kaolinite mesure 0,1 à 2 µm de large, soit des centaines de fois plus.",
    serp: "Les vrais cristaux mesurent de 0,1 à quelques µm.",
    talc: "Les vraies plaquettes mesurent du µm au mm.",
    mica: "Un vrai cristal de mica mesure du mm au dm : des millions de fois plus de feuillets.",
    chlorite: "Les vrais cristaux mesurent du µm au mm.",
    smectite: "Les vrais feuillets mesurent 0,1 à 1 µm de large pour 1 nm d'épaisseur.",
    vermiculite: "Les vraies paillettes mesurent du mm au cm.",
    illite: "Les vraies particules mesurent 0,1 à 1 µm de large et 2 à 20 feuillets d'épaisseur.",
    inter: "Les vrais cristaux sont des plaquettes de 0,1 à 1 µm.",
  };

  function construire(cle, i) {
    const [f] = EB.ARGILES3D[cle];
    const s = cle.replace(/^fiche:/, "").replace(/_(e|m)$/, "");
    const fam = EB.FAMILLE[f], c = EB.COUCHES[f], X = EB.INTERSTRAT[cle];
    const E = EB.ETATS;
    const src = { source: D[f].source, nom: D[f].nom, formule: D[f].formule, id: f + "-particule" };

    // halloysite et endellite : feuillet de kaolinite enroulé, couche d'aluminium dedans
    if (s === "halloysite" || s === "endellite") {
      const et = etatsDe(E.halloysite, i), P = prep("kaolinite");
      const at = spirale(P, { r0: 50, tours: 1.5, d: et.d, dRef: 7.2, largeur: 8.94, axeTube: "y", sgn: -1, eau: et.eau === 1 });
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "a", inclinaison: [16, -22] },
        info: `Modèle construit : un tube d'halloysite de ${at.length} atomes`,
        note: `Le feuillet 1:1 de la kaolinite (Bish 1993) enroulé en spirale, une tranche d'une maille de long (8,9 Å) : un tour et demi à
          partir d'un canal de 10 nm, le plus étroit observé. Couche tétraédrique DEHORS, couche d'aluminium DEDANS : c'est l'inverse du
          chrysotile. Tours espacés de ${String(et.d).replace(".", ",")} Å${et.eau === 1 ? ", une couche d'eau entre eux (halloysite à 10 Å)" : " (halloysite séchée)"}.
          Enroulement calculé par l'atlas : aucune structure courbe n'a été affinée. Un vrai tube compte 15 à 20 tours et mesure 0,5 à plusieurs µm de long.` }) });
    }
    // chrysotile : feuillet de lizardite enroulé, couche de magnésium dehors, fibre le long de a
    if (s === "chrysotile") {
      const P = prep("lizardite");
      const at = spirale(P, { r0: 37, tours: 1.5, d: 7.3, largeur: 10.66, axeTube: "x", sgn: 1 });
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "a", inclinaison: [16, -22] },
        info: `Modèle construit : une fibrille de chrysotile de ${at.length} atomes`,
        note: `Le feuillet 1:1 de la lizardite (Mellini 1982) enroulé en spirale autour de l'axe a, sur deux mailles de long (10,7 Å) : un tour
          et demi à partir d'un canal de 7,5 nm (Yada 1971). Couche de magnésium DEHORS, plus large que la couche tétraédrique : c'est ce
          décalage de taille qui fait rouler le feuillet. Enroulement calculé par l'atlas. Une vraie fibrille compte ≈ 12 tours (25 nm de
          diamètre) et mesure des µm à des cm de long.` }) });
    }
    // hisingérite : feuillets de kaolinite ferrique posés sur des sphères emboîtées (morceau de paroi)
    if (f === "hisingerite") {
      const P = prep("hisingerite");
      const at = ajuste((r) => calotte(P, { R: 56, rayon: r, n: 2, d: 7.1, sgn: -1 }), 26).at;
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "a", inclinaison: [12, -20] },
        info: `Modèle construit : un morceau de paroi de ${at.length} atomes`,
        note: `Un morceau de la paroi d'une sphère d'hisingérite de 11 à 13 nm : deux feuillets 1:1 ferriques concentriques, espacés de 7,1 Å
          (Eggleton et Tilley 1998). Sens de courbure non établi : dessiné comme l'halloysite, couche tétraédrique dehors. Courbure
          calculée par l'atlas.` }) });
    }
    // antigorite : la vraie structure modulée, plusieurs ondes
    if (f === "antigorite") {
      const A = D.antigorite, B = base3(A.maille), cands = [];
      A.atomes.forEach((a) => {
        for (let i = -1; i <= 3; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 3; k++)
          cands.push({ el: a[0], p: cart(B, [a[1] + i, a[2] + j, a[3] + k]), lab: a[4], occ: a[5] || null });
      });
      // trois ondes le long de a, une maille le long de b, trois feuillets (les cations dans la boîte, puis leurs anions)
      const at = tailler(cands, (q) => q.p[0] >= 0 && q.p[0] < 3 * B[0][0] && q.p[1] >= 0 && q.p[1] < B[1][1] && q.p[2] >= 0.5 && q.p[2] < 3 * B[2][2] + 0.5);
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "b", inclinaison: [0, 0] }, rotationAxe: "normale",
        info: `Lamelle taillée dans la structure publiée : ${at.length} atomes`,
        note: `Trois ondes (13 nm) sur trois feuillets, dans la vraie structure modulée de l'antigorite (Capitani et Mellini 2004, polysome
          m = 17) : la couche de magnésium, continue, ondule ; la couche tétraédrique passe d'un côté à l'autre à chaque demi-onde, par
          des anneaux de 4 et 8 tétraèdres. Vue le long de b pour voir les ondes de profil. Les vrais cristaux sont des lamelles de
          quelques µm.` }) });
    }
    // imogolite : faisceau de 7 tubes (la vraie structure du tube, répétée)
    if (f === "imogolite") {
      const T = D.imogolite, [L, , cz] = T.maille, at = [];
      [[0, 0]].concat([0, 1, 2, 3, 4, 5].map((k) => [23 * Math.cos(rad(60 * k)), 23 * Math.sin(rad(60 * k))])).forEach(([ox, oy]) =>
        T.atomes.forEach((a) => at.push({ el: a[0], p: [(a[1] - 0.5) * L + ox, (a[2] - 0.5) * L + oy, a[3] * cz], lab: a[4] })));
      return emballer(at, { periode: cz, particule: "tube", donnees: Object.assign(src, { vue: { axe: "c", inclinaison: [-22, 0] }, rotationAxe: "b",
        info: `Modèle construit : 7 tubes, ${at.length} atomes par période de 8,4 Å`,
        note: "Un faisceau de 7 tubes d'imogolite, rangés en hexagone à 23 Å d'axe à axe (Cradwick et al. 1972). Les vrais faisceaux comptent des dizaines à des centaines de tubes." }) });
    }
    // fibres : un morceau de fibre taillé dans la maille publiée, vu le long des canaux
    if (fam === "fibre") {
      const sep = f === "sepiolite", B = base3(D[f].maille);
      const nc = 8, larg = sep ? 17 : 14, haut = sep ? 13.4 : 12.8;
      const cands = [];
      D[f].atomes.forEach((a) => {
        for (let i = -2; i <= 4; i++) for (let j = -2; j <= 3; j++) for (let k = -1; k <= nc; k++) {
          const p = cart(B, [a[1] + i, a[2] + j, a[3] + k]);
          cands.push({ el: a[0], p, lab: a[4], occ: a[5] || null });
        }
      });
      const cx = B[0][0] * 1 + B[1][0] * 0.5, cy = B[1][1] * 0.5;
      const at = tailler(cands, (q) => Math.abs(q.p[0] - cx - B[2][0] * nc / 2) <= haut && Math.abs(q.p[1] - cy) <= larg && q.p[2] >= 0.3 && q.p[2] <= nc * B[2][2] - 0.3);
      return emballer(at, { particule: "objet", donnees: Object.assign(src, { vue: { axe: "c", inclinaison: [-14, 22] }, rotationAxe: "b",
        info: `Morceau de fibre : ${at.length} atomes`,
        note: `Un bout de fibre de ${sep ? "sépiolite" : "palygorskite"} taillé dans la structure publiée, ${nm(2 * haut)} × ${nm(2 * larg)} nm de section, ${nm(nc * B[2][2])} nm de long,
          vu le long des canaux : les rubans de feuillets 2:1 en damier, et les canaux ouverts sur les bords de la fibre. Une vraie fibre
          mesure 10 à 30 nm de large et 1 à 10 µm de long.` }) });
    }
    // interstratifiés : pile des deux feuillets, dans l'ordre de l'espèce
    if (X) {
      const PA = prep(X.A), PB = prep(X.B);
      const liste = X.vermiculite ? E.vermiculite : E.is, et = liste[i];
      const seq = X.regulier ? "ABAB" : cle === "kaolinite_smectite" ? "ABBA" : "ABBA";
      const pub = { autres: PA.interfol };
      const faire = (ee, r) => {
        const sp = { espace: Object.assign(EB.espace(PB, ee), { P: PB }) };
        const niv = seq.split("").map((t) => (t === "A" ? { P: PA, rot: 0, d: PA.d, esp: pub } : { P: PB, rot: 0, d: ee.d, esp: sp }));
        return pile(niv, { forme: "hexa", R: r, liquide: ee.eau === "liquide" });
      };
      const { at, R } = pileFixe(cle, faire, 22, liste, i);
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "a", inclinaison: [18, -24] },
        info: `Modèle construit : une plaquette de ${at.length} atomes`,
        note: `Une plaquette de ${nm(2 * R)} nm, quatre feuillets : ${seq.split("").map((t) => X.noms[t === "A" ? 0 : 1]).join(", ")} (de bas en haut).
          ${X.regulier ? "Alternance stricte." : "Suite tirée au hasard."} Espaces de ${X.noms[1]} : ${String(et.d).replace(".", ",")} Å dans l'état choisi${et.eau === "liquide" ? " (eau liquide : molécules placées au hasard, à la densité de l'eau)" : ""}.
          ${VRAI.inter}` }) });
    }
    // smectites : trois feuillets tournés au hasard (empilement turbostratique), espace selon l'état
    if (["montmorillonite", "hectorite", "nontronite"].includes(f)) {
      const P = prep(f), et = E.smectite[i];
      const faire = (ee, rr) => {
        const r = alea(7), sp = { espace: Object.assign(EB.espace(P, ee), { P }) };
        const niv = [0, 1, 2].map((k) => ({ P, rot: k ? r() * Math.PI * 2 : 0, d: ee.d, esp: sp }));
        return pile(niv, { forme: "disque", R: rr, liquide: ee.eau === "liquide" });
      };
      const { at, R } = pileFixe(cle, faire, 20, E.smectite, i);
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "a", inclinaison: [22, -24] },
        info: `Modèle construit : trois feuillets, ${at.length} atomes`,
        note: `Trois feuillets de ${nm(2 * R)} nm, chacun tourné au hasard par rapport au suivant (empilement turbostratique : rien ne les
          tient en registre, seulement les cations et l'eau). ${String(et.d).replace(".", ",")} Å d'un feuillet au suivant dans l'état choisi${et.eau === "liquide" ? " ; eau liquide : molécules placées au hasard, à la densité de l'eau, Na⁺ entourés de six molécules" : ""}.
          ${VRAI.smectite}` }) });
    }
    // vermiculite, illite, glauconite : pile ordonnée, espace selon l'état
    if (f === "vermiculite" || f === "illite" || f === "glauconite") {
      const P = prep(f);
      const verm = f === "vermiculite";
      const liste = verm ? E.vermiculite : E.faible, et = liste[i];
      const K = { espace: Object.assign(EB.espace(P, { d: P.d, cation: "K", n: f === "illite" ? 8 : 10, eau: 0 }), { P }) };
      const faire = (ee, rr) => {
        const sp = { espace: Object.assign(EB.espace(P, ee), { P }) };
        const niv = verm ? [0, 1, 2].map(() => ({ P, rot: 0, d: ee.d, esp: sp }))
          : [{ P, rot: 0, d: P.d, esp: K }, { P, rot: 0, d: ee.d, esp: sp }, { P, rot: 0, d: P.d, esp: K }];
        return pile(niv, { forme: f === "illite" ? "latte" : "hexa", R: rr, liquide: ee.eau === "liquide" });
      };
      const { at, R } = pileFixe(cle, faire, 20, liste, i);
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "a", inclinaison: [18, -24] },
        info: `Modèle construit : trois feuillets, ${at.length} atomes`,
        note: verm ? `Trois feuillets de vermiculite (Shirozu et Bailey 1966) en plaquette de ${nm(2 * R)} nm : Mg²⁺ et eau entre eux, ${String(et.d).replace(".", ",")} Å dans l'état choisi. ${VRAI.vermiculite}`
          : `Trois feuillets ${f === "illite" ? "d'illite en latte" : "de glauconite"} de ${nm(2 * R)} nm : en bas et en haut, espaces verrouillés par K⁺ ; au milieu, un espace qui a perdu son
            potassium et prend l'eau (${String(et.d).replace(".", ",")} Å dans l'état choisi). ${VRAI.illite}` }) });
    }
    // cristaux ordinaires : la maille publiée taillée en plaquette
    const T = { kaolinite: ["kaolin", 3, "hexa"], dickite: ["kaolin", 4, "hexa"], nacrite: ["kaolin", 4, "hexa"], hisingerite: ["kaolin", 3, "hexa"],
      lizardite: ["serp", 3, "hexa"], amesite: ["serp", 4, "hexa"], cronstedtite: ["serp", 3, "hexa"], nepouite: ["serp", 3, "hexa"] };
    const fT = T[f] || (fam === "neutre" ? ["talc", 3, "hexa"] : fam === "mica" ? ["mica", 3, "hexa"] : fam === "chlorite" ? ["chlorite", 2, "hexa"] : null);
    if (fT && c) {
      const [vrai, n, forme] = fT;
      const { at, R } = ajuste((rr) => cristal(D[f], c, { n, forme, R: rr }), 22);
      const quoi = { kaolin: "feuillets 1:1", serp: "feuillets 1:1", talc: "feuillets 2:1 neutres", mica: "feuillets 2:1 et leurs cations", chlorite: "feuillets 2:1 et leur feuillet d'hydroxyde" }[vrai];
      return emballer(at, { donnees: Object.assign(src, { vue: { axe: "a", inclinaison: [22, -26] },
        info: `Cristal taillé dans la structure publiée : ${at.length} atomes`,
        note: `Une plaquette hexagonale de ${nm(2 * R)} nm, ${n} ${quoi}, taillée dans la structure publiée : l'empilement est le vrai (chaque
          feuillet décalé sur le précédent comme dans le cristal), les bords sont coupés entre les polyèdres. ${VRAI[vrai]}` }) });
    }
    return null;
  }

  // ── l'eau AUTOUR de la particule (G.4, 30/09/2026) ──
  // Demande : « voir les cations entourés d'eau et l'eau adsorbée en surface ». Deux ajouts, dans la vue « Structure » seulement :
  //   • un FILM : une couche de molécules d'eau (« 1 couche d'eau ») ou deux (« 2 couches », « Dans l'eau ») sur les faces et
  //     les bords, une molécule pour ≈ 10,6 Å² (grille hexagonale de 3,5 Å, un peu désordonnée), à 2,9 Å de la surface puis
  //     5,8 Å ; faces du talc et de la pyrophyllite laissées sèches (neutres, hydrophobes) : l'eau ne tient qu'aux bords ;
  //   • « Dans l'eau », la COUCHE DIFFUSE : les cations qui compensent la charge des faces, entourés de six molécules d'eau,
  //     nombreux contre la surface et de plus en plus rares en s'éloignant — profil de Gouy-Chapman n(x) ∝ 1/(x + ℓ)², avec
  //     ℓ = 1/(2π z ℓB σ) (longueur de Gouy-Chapman, ℓB = 7,1 Å), coupé à une longueur de Debye (eau douce à 10 mmol/L).
  //     Nombre de cations = aire de la face ÷ aire par charge (argiles-eau.js). L'eau libre autour n'est pas dessinée.
  // Chaque molécule ajoutée porte `ext` (une clé stable d'un état à l'autre) pour que le passage entre états l'anime.
  const PAS_FILM = 3.5, HAUT_FILM = 2.9, ECART = 2.4;
  function habiller(cle, i, S) {
    const EAU = window.ArgilesEau;
    if (!S || !S.meta || !EAU || !EAU.a(cle)) return S;
    const fam = EAU.famille(cle), F = EAU.FAMILLES[fam], nF = EAU.COUCHES_ETAT[i];
    const meta = S.meta, at = S.brut;
    if (!["pile", "cristal", "spirale"].includes(meta.type)) return S;
    const ajouts = [];
    // grille des atomes pour les chocs (H exclus)
    const G = new Map(), cleG = (x, y, z) => Math.floor(x / 3) + "," + Math.floor(y / 3) + "," + Math.floor(z / 3);
    const range = (p) => { const k = cleG(...p); if (!G.has(k)) G.set(k, []); G.get(k).push(p); };
    at.forEach((a) => { if (a.el !== "H") range(a.p); });
    const choc = (p, dmin) => {
      const gx = Math.floor(p[0] / 3), gy = Math.floor(p[1] / 3), gz = Math.floor(p[2] / 3);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++)
        for (const q of G.get((gx + dx) + "," + (gy + dy) + "," + (gz + dz)) || [])
          if (Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < dmin) return true;
      return false;
    };
    const R = alea(31);   // même tirage dans tous les états : les molécules gardent leur place d'un état à l'autre
    const jit = () => (R() - 0.5) * 0.9;
    const poser = (a) => { if (!choc(a.p, a.el === "Os" ? 2.5 : 2.3)) { ajouts.push(a); range(a.p); return true; } return false; };
    let aireFace = 0;
    if (meta.type === "pile" || meta.type === "cristal") {
      const ctr = CONTOUR[meta.forme], Rr = meta.R;
      // hauteurs des feuillets (pile : chaque molécule suit son feuillet pendant l'animation)
      const zNiv = [0];
      if (meta.type === "pile") meta.d.forEach((d, k) => zNiv.push(zNiv[k] + d));
      const K = meta.type === "pile" ? meta.d.length - 1 : 0;
      const zBas = meta.type === "pile" ? 0 : meta.zBas, zHaut = meta.type === "pile" ? zNiv[K] + meta.e[K] : meta.zHaut;
      const attache = (z) => {
        if (meta.type !== "pile") return {};
        let j = 0;
        while (j < K && z > zNiv[j + 1] - 0.5) j++;
        return { niv: j, h: z - zNiv[j] };
      };
      // faces : grille hexagonale, deuxième couche décalée d'une demi-maille
      const ny = Math.ceil(Rr * 1.7 / (PAS_FILM * 0.866));
      for (let k = 1; k <= 2; k++) for (const cote of [1, -1]) {
        for (let jy = -ny; jy <= ny; jy++) for (let jx = -ny; jx <= ny; jx++) {
          const x0 = (jx + (jy % 2 ? 0.5 : 0) + (k === 2 ? 0.5 : 0)) * PAS_FILM, y0 = (jy + (k === 2 ? 0.33 : 0)) * PAS_FILM * 0.866;
          const x = x0 + jit(), y = y0 + jit(), dz = jit() * 0.5;
          if (!ctr(x0, y0, Rr - 0.6)) continue;
          if (k === 1 && cote === 1) aireFace += PAS_FILM * PAS_FILM * 0.866;
          if (k > nF || F.bords) continue;
          const z = cote > 0 ? zHaut + HAUT_FILM * k + dz : zBas - HAUT_FILM * k + dz;
          poser(Object.assign({ el: "Os", p: [x, y, z], lab: "H2O", ext: `f${cote}${k}:${jx},${jy}`, couche: k, dir: [0, 0, 4 * cote] },
            meta.type === "pile" ? (cote > 0 ? { niv: K, h: z - zNiv[K] } : { niv: 0, h: z }) : {}));
        }
      }
      // bords : on suit le contour, une molécule tous les 3,5 Å, sur toute la hauteur des feuillets
      if (nF) {
        const bord = (th) => { let a = 0, b = Rr * 2.2; for (let n = 0; n < 30; n++) { const m = (a + b) / 2; if (ctr(m * Math.cos(th), m * Math.sin(th), Rr)) a = m; else b = m; } return a; };
        const pts = [];
        for (let n = 0; n < 1440; n++) { const th = n / 1440 * 2 * Math.PI, rb = bord(th); pts.push([th, rb]); }
        const bandes = meta.type === "pile" ? meta.e.map((e, j) => [zNiv[j] - 0.3, zNiv[j] + e + 0.3, j]) : [[zBas - 0.3, zHaut + 0.3, 0]];
        for (let k = 1; k <= nF; k++) {
          let acc = 0, idx = 0;
          for (let n = 0; n < pts.length; n++) {
            const [th, rb] = pts[n], [th2, rb2] = pts[(n + 1) % pts.length];
            const r1 = rb + 2.2 + HAUT_FILM * (k - 1), r2 = rb2 + 2.2 + HAUT_FILM * (k - 1);
            acc += Math.hypot(r2 * Math.cos(th2) - r1 * Math.cos(th), r2 * Math.sin(th2) - r1 * Math.sin(th));
            if (acc < PAS_FILM) continue;
            acc = 0; idx++;
            bandes.forEach(([z0, z1, j]) => {
              for (let lv = 0, z = z0 + (k === 2 ? 1.5 : 0); z <= z1; lv++, z += 3.0) {
                const dz = jit() * 0.4, dr = jit() * 0.5;
                for (let es = 0; es < 5; es++) {   // repoussée vers l'extérieur tant qu'elle touche un atome
                  const rr = r1 + dr + es * 0.6, p = [rr * Math.cos(th), rr * Math.sin(th), z + dz];
                  if (poser(Object.assign({ el: "Os", p, lab: "H2O", ext: `b${k}:${j}:${lv}:${idx}`, couche: k, dir: [4 * Math.cos(th), 4 * Math.sin(th), 0] }, attache(p[2])))) break;
                }
              }
            });
          }
        }
      }
      // couche diffuse : cations entourés de six molécules d'eau au-dessus et au-dessous des faces
      if (i === 3 && F.cation) {
        const z = F.cation === "Na" ? 1 : 2, L = EAU.DEBYE[F.cation], l = F.aire / (2 * Math.PI * z * 7.1);
        const dMO = { Na: 2.4, Ca: 2.4, Mg: 2.07 }[F.cation];
        const n = Math.max(1, Math.round(aireFace / (F.aire * z)));
        const Rc = alea(57);
        [1, -1].forEach((cote) => {
          const places = [];
          for (let c = 0, essais = 0; c < n && essais < 4000; essais++) {
            const x = (Rc() * 2 - 1) * Rr, y = (Rc() * 2 - 1) * Rr;
            if (!ctr(x, y, Rr * 0.92)) continue;
            const F0 = Rc(), dist = 1 / (1 / l - F0 * (1 / l - 1 / (L + l))) - l;   // Gouy-Chapman, coupé à L
            const zc = cote > 0 ? zHaut + 4.0 + dist : zBas - 4.0 - dist;
            if (places.some((q) => Math.hypot(q[0] - x, q[1] - y, q[2] - zc) < 6.2)) continue;
            places.push([x, y, zc]);
            const phi = Rc() * 2 * Math.PI, dv = dMO / Math.sqrt(3), rh = dMO * Math.sqrt(2 / 3);
            const coq = [0, 1, 2, 3, 4, 5].map((s) => { const an = phi + s * Math.PI / 3; return [x + rh * Math.cos(an), y + rh * Math.sin(an), zc + (s % 2 ? -dv : dv)]; });
            const tag = (p) => Object.assign({ p, ext: `d${cote}:${c}`, dir: [0, 0, 6 * cote] }, meta.type === "pile" ? (cote > 0 ? { niv: K, h: p[2] - zNiv[K] } : { niv: 0, h: p[2] }) : {});
            ajouts.push(Object.assign(tag([x, y, zc]), { el: F.cation, lab: F.cation, diff: cote, ext: `d${cote}:${c}:c` }));
            coq.forEach((p, s2) => ajouts.push(Object.assign(tag(p), { el: "Oh", lab: "H2O", diff: cote, ext: `d${cote}:${c}:${s2}` })));
            c++;
          }
        });
        // les couronnes prennent la place des molécules du film qu'elles touchent
        const diffs = ajouts.filter((a) => a.diff);
        for (let k = ajouts.length - 1; k >= 0; k--) {
          const a = ajouts[k];
          if (a.el === "Os" && diffs.some((q) => Math.hypot(q.p[0] - a.p[0], q.p[1] - a.p[1], q.p[2] - a.p[2]) < 2.6)) ajouts.splice(k, 1);
        }
      }
    } else if (meta.type === "spirale" && nF) {
      // tube : film sur la paroi extérieure du dernier tour et sur la paroi du canal (premier tour)
      const m = meta, d = m.d, tDe = (s) => (-m.r0 + Math.sqrt(m.r0 * m.r0 + d * s / Math.PI)) / (d / (2 * Math.PI));
      const tFin = tDe(m.Ltot);
      for (let k = 1; k <= nF; k++) for (const cote of [1, -1]) {
        const hF = m.e2 + cote * m.sgn * (m.e2 + HAUT_FILM * k);
        let s = 1.2 + (k - 1) * 1.7, idx = 0;
        while (s < m.Ltot) {
          const t = tDe(s), rN = m.r0 + d * t / (2 * Math.PI), rF = rN + cote * (m.e2 + HAUT_FILM * k);
          const expose = cote > 0 ? t > tFin - 2 * Math.PI : t < 2 * Math.PI;
          if (expose && rF > 3) for (let u = 1.5 + (k - 1) * 1.5, iu = 0; u < m.largeur - 0.5; u += 3.1, iu++) {
            const p = placeSpirale(m, d, s, u, hF), rr = Math.hypot(p[1], p[2]) || 1;
            poser({ el: "Os", p, lab: "H2O", s, u, h: hF, ext: `s${cote}${k}:${idx}:${iu}`, couche: k, dir: [0, 4 * cote * p[1] / rr, 4 * cote * p[2] / rr] });
          }
          s += PAS_FILM * rN / Math.max(rF, 3); idx++;
        }
      }
    }
    if (!ajouts.length) return S;
    const tout = at.concat(ajouts);
    tout.meta = meta;
    const quoi = meta.type === "spirale" ? "sur la paroi extérieure et dans le canal"
      : F.bords ? "sur les bords seulement (faces neutres, hydrophobes)" : "sur les faces et les bords";
    const plus = ` Autour : ${nF === 1 ? "une couche" : "deux couches"} de molécules d'eau fixées ${quoi}.`
      + (i === 3 && F.cation && meta.type !== "spirale" ? ` Couche diffuse : ${F.cation === "Na" ? "Na⁺" : F.cation === "Mg" ? "Mg²⁺" : "Ca²⁺"} entourés de six molécules d'eau, serrés contre les faces et de plus en plus rares en s'éloignant (profil de Gouy-Chapman, coupé à ${(EAU.DEBYE[F.cation] / 10).toFixed(1).replace(".", ",")} nm, longueur de Debye d'une eau douce à 10 mmol/L)${F.faible ? " ; charge des faces faible : peu de cations, nombre schématique" : ""} ; l'eau libre autour n'est pas dessinée.` : "");
    const emb = Object.assign({}, S.emb, { donnees: Object.assign({}, S.emb.donnees, { note: (S.emb.donnees.note || "") + plus }) });
    return emballer(tout, emb);
  }
  // passage d'un état à l'autre pour le film et la couche diffuse : les molécules présentes des deux côtés restent (elles
  // suivent leur feuillet), les autres apparaissent en venant de l'extérieur ou repartent en rapetissant
  function exterieur(A, B) {
    const cA = new Map(), cB = new Map();
    A.forEach((a) => { if (a.ext) cA.set(a.ext, a); });
    B.forEach((b) => { if (b.ext) cB.set(b.ext, b); });
    const part = [...cA.values()].filter((a) => !cB.has(a.ext)), vient = [...cB.values()].filter((b) => !cA.has(b.ext));
    const reste = [...cB.values()].filter((b) => cA.has(b.ext));
    const dehors = (a) => a.dir || [0, 0, 0];   // direction vers l'extérieur de la particule
    const f = (u, pos, out) => {
      reste.forEach((b) => out.push(Object.assign({}, b, { p: pos(b) })));
      part.forEach((a) => {   // s'en va : d'abord les couches du dessus
        const t0 = a.diff || a.couche === 2 ? 0.05 : 0.2, p = seg(u, t0, t0 + 0.35), q = pos(a), o = dehors(a);
        if (p < 1) out.push(Object.assign({}, a, { p: [q[0] + o[0] * p, q[1] + o[1] * p, q[2] + o[2] * p], echelle: 1 - seg(p, 0.5, 1) }));
      });
      vient.forEach((b) => {   // arrive de l'extérieur : la première couche, puis la deuxième, puis la couche diffuse
        const t0 = b.diff ? 0.6 : b.couche === 2 ? 0.45 : 0.3, p = seg(u, t0, t0 + 0.35), q = pos(b), o = dehors(b);
        if (p > 0) out.push(Object.assign({}, b, { p: [q[0] + o[0] * (1 - p), q[1] + o[1] * (1 - p), q[2] + o[2] * (1 - p)], echelle: seg(p, 0, 0.4) }));
      });
    };
    f.change = part.length > 0 || vient.length > 0;
    return f;
  }

  // ── passage animé d'un état d'hydratation à un autre (30/09/2026, « des transitions entre les états d'eau pour la structure ») ──
  // Même principe que la vue « 1 maille » : en gonflant, les feuillets s'écartent d'abord, puis l'eau entre ; en séchant, l'eau sort
  // d'abord, puis les feuillets se rapprochent. Chaque molécule d'arrivée reprend la plus proche du départ (≤ 3,5 Å) ; les autres
  // entrent ou sortent par le BORD DU CRISTAL le plus proche (par les bouts du tube pour l'halloysite), les plus proches du bord
  // d'abord, en grossissant ou en rapetissant. Plusieurs espaces qui changent : l'un après l'autre (décalage 0,15).
  const lisse = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const seg = (u, a, b) => lisse((u - a) / (b - a));
  function apparier(A, B) {
    const libres = new Set(A.map((x, i) => i)), paires = [], entre = [];
    B.forEach((b) => {
      let mi = -1, dm = 3.5;
      libres.forEach((i) => {
        const a = A[i], d = Math.hypot(a.p[0] - b.p[0], a.p[1] - b.p[1], a.dz - b.dz);
        if (d < dm) { dm = d; mi = i; }
      });
      if (mi >= 0) { paires.push([A[mi], b]); libres.delete(mi); } else entre.push(b);
    });
    return { paires, entre, sort: [...libres].map((i) => A[i]) };
  }
  function transPile(SA, SB) {
    const mA = SA.meta, mB = SB.meta, A = SA.brut, B = SB.brut;
    const nG = mA.d.length - 1, Rout = mA.R + 5;
    const couches = A.filter((a) => a.niv !== undefined && !a.ext);
    const ext = exterieur(A, B);
    const gaps = [];
    for (let k = 0; k < nG; k++) {
      const GA = A.filter((a) => a.gap === k), GB = B.filter((a) => a.gap === k);
      const solA = GA.filter((a) => a.el !== "Ow"), solB = GB.filter((a) => a.el !== "Ow");
      const memeSol = solA.length === solB.length && solA.every((a, i) => a.el === solB[i].el);
      const w = apparier(GA.filter((a) => a.el === "Ow"), GB.filter((a) => a.el === "Ow"));
      const bouge = (x, y) => Math.hypot(x.p[0] - y.p[0], x.p[1] - y.p[1], x.dz - y.dz) > 0.01;
      const change = Math.abs(mA.d[k] - mB.d[k]) > 0.01 || !memeSol || w.entre.length || w.sort.length
        || w.paires.some(([a, b]) => bouge(a, b)) || solA.some((a, i) => memeSol && bouge(a, solB[i]));
      gaps.push({ k, dA: mA.d[k], dB: mB.d[k], solA, solB, memeSol, w, change });
    }
    const changent = gaps.filter((g) => g.change);
    if (!changent.length && !ext.change) return null;
    const dec = 0.15, fen = 1 - dec * (changent.length - 1);
    const zs = A.concat(B).map((a) => a.p[2]), zmin = Math.min(...zs) - 6, zmax = Math.max(...zs) + 6;
    const boite = boiteDe([A, B], [[-Rout, -Rout, zmin], [Rout, Rout, zmax]]);
    return (U) => {
      const dNow = mA.d.slice();
      gaps.forEach((g) => {
        const r = changent.indexOf(g);
        g.u = r < 0 ? U : Math.min(1, Math.max(0, (U - r * dec) / fen));
        g.ouvre = g.dB > g.dA + 0.05;
        const ferme = g.dB < g.dA - 0.05;
        const uL = g.ouvre ? seg(g.u, 0, 0.5) : ferme ? seg(g.u, 0.45, 1) : seg(g.u, 0, 1);
        dNow[g.k] = g.dA + (g.dB - g.dA) * uL;
      });
      const z = [0];
      for (let k = 0; k < nG; k++) z.push(z[k] + dNow[k]);
      const out = couches.map((a) => Object.assign({}, a, { p: [a.p[0], a.p[1], z[a.niv] + a.h] }));
      ext(U, (a) => [a.p[0], a.p[1], z[a.niv] + a.h], out);
      const bord = (q) => { const r = Math.hypot(q.p[0], q.p[1]) || 1; return [q.p[0] * Rout / r, q.p[1] * Rout / r, r]; };
      gaps.forEach((g) => {
        const mi = z[g.k] + (dNow[g.k] + mA.e[g.k]) / 2, u = g.u;
        if (g.memeSol) g.solA.forEach((a, i) => {
          const b = g.solB[i], t = seg(u, 0, 1);
          out.push(Object.assign({}, a, { p: [a.p[0] + (b.p[0] - a.p[0]) * t, a.p[1] + (b.p[1] - a.p[1]) * t, mi + a.dz + (b.dz - a.dz) * t] }));
        });
        else {   // cations différents (Ca²⁺ → Na⁺ vers « Dans l'eau ») : fondu, c'est un échange de cations
          g.solA.forEach((a) => out.push(Object.assign({}, a, { p: [a.p[0], a.p[1], mi + a.dz], echelle: 1 - seg(u, 0.05, 0.4) })));
          g.solB.forEach((b) => out.push(Object.assign({}, b, { p: [b.p[0], b.p[1], mi + b.dz], echelle: seg(u, 0.55, 0.9) })));
        }
        const uW = seg(u, 0.1, 0.9);
        g.w.paires.forEach(([a, b]) => out.push(Object.assign({}, b, { p: [a.p[0] + (b.p[0] - a.p[0]) * uW, a.p[1] + (b.p[1] - a.p[1]) * uW, mi + a.dz + (b.dz - a.dz) * uW] })));
        g.w.sort.forEach((a) => {
          const [ex, ey, r] = bord(a), t0 = 0.45 * (Rout - r) / Rout, p = seg(u, t0, t0 + 0.3);
          out.push(Object.assign({}, a, { p: [a.p[0] + (ex - a.p[0]) * p, a.p[1] + (ey - a.p[1]) * p, mi + a.dz], echelle: 1 - seg(p, 0.6, 1) }));
        });
        g.w.entre.forEach((b) => {
          const [ex, ey, r] = bord(b), t0 = (g.ouvre ? 0.2 : 0.1) + 0.5 * (Rout - r) / Rout, p = seg(u, t0, t0 + 0.28);
          if (p > 0) out.push(Object.assign({}, b, { p: [ex + (b.p[0] - ex) * p, ey + (b.p[1] - ey) * p, mi + b.dz], echelle: seg(p, 0, 0.35) }));
        });
      });
      return emballer(out, SA.emb, boite);
    };
  }
  function transSpirale(SA, SB) {
    const m = SA.meta, dA = SA.meta.d, dB = SB.meta.d, W = m.largeur;
    const feuil = SA.brut.filter((a) => !a.eau && !a.ext), eA = SA.brut.filter((a) => a.eau), eB = SB.brut.filter((a) => a.eau);
    const ext = exterieur(SA.brut, SB.brut);
    if (Math.abs(dA - dB) < 0.01 && eA.length === eB.length && !ext.change) return null;
    const ouvre = dB > dA;
    const bout = (w) => (w.u < W / 2 ? -5 : W + 5), prox = (w) => Math.min(w.u, W - w.u) / (W / 2);
    const boite = boiteDe([SA.brut, SB.brut], [[-5, 0, 0], [W + 5, 0, 0]]);
    return (u) => {
      const d = dA + (dB - dA) * (ouvre ? seg(u, 0, 0.5) : seg(u, 0.45, 1)), hE = hEau(m, d);
      const out = feuil.map((a) => Object.assign({}, a, { p: placeSpirale(m, d, a.s, a.u, a.h) }));
      ext(u, (a) => placeSpirale(m, d, a.s, a.u, a.h), out);
      if (!eA.length) eB.forEach((w) => {   // l'eau entre par les deux bouts du tube
        const t0 = 0.35 + 0.35 * prox(w), p = seg(u, t0, t0 + 0.25), b = bout(w);
        if (p > 0) out.push(Object.assign({}, w, { p: placeSpirale(m, d, w.s, b + (w.u - b) * p, hE), echelle: seg(p, 0, 0.35) }));
      });
      else if (!eB.length) eA.forEach((w) => {   // elle sort par les bouts, puis les tours se resserrent
        const t0 = 0.3 * prox(w), p = seg(u, t0, t0 + 0.25), b = bout(w);
        out.push(Object.assign({}, w, { p: placeSpirale(m, d, w.s, w.u + (b - w.u) * p, hE), echelle: 1 - seg(p, 0.6, 1) }));
      });
      else eB.forEach((w) => out.push(Object.assign({}, w, { p: placeSpirale(m, d, w.s, w.u, hE) })));
      return emballer(out, SA.emb, boite);
    };
  }

  function transCristal(SA, SB) {
    const base = SA.brut.filter((a) => !a.ext), ext = exterieur(SA.brut, SB.brut);
    if (!ext.change) return null;
    const boite = boiteDe([SA.brut, SB.brut], [[0, 0, SA.meta.zBas - 40], [0, 0, SA.meta.zHaut + 40]]);
    return (u) => {
      const out = base.slice();
      ext(u, (a) => a.p, out);
      return emballer(out, SA.emb, boite);
    };
  }

  const CACHE = {};
  window.ArgilesParticules = {
    transition: (cle, i, j) => {
      const A = window.ArgilesParticules.construire(cle, i), B = window.ArgilesParticules.construire(cle, j);
      if (!A || !B || !A.meta || !B.meta || A.meta.type !== B.meta.type) return null;
      return A.meta.type === "pile" ? transPile(A, B) : A.meta.type === "spirale" ? transSpirale(A, B)
        : A.meta.type === "cristal" ? transCristal(A, B) : null;
    },
    a: (cle) => {
      if (!cle || !EB.ARGILES3D[cle]) return false;
      const f = EB.ARGILES3D[cle][0];
      return f !== "allophane";
    },
    construire: (cle, i) => {
      const k = cle + "|" + i;
      if (!(k in CACHE)) CACHE[k] = habiller(cle, i || 0, construire(cle, i || 0));
      return CACHE[k];
    },
  };
})();
