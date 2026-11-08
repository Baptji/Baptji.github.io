'use strict';
/* Le décor fixe du lieu, construit depuis les vraies données (donnees/lieux.js) : socle de terre, sol case par case,
   routes et chemins de la BD TOPO redessinés en lignes lissées (les escaliers de la grille deviennent des courbes),
   bois, haies et herbe, eau, maisons, et la ferme au carré de l'Artois posée sur son emprise réelle, porche tourné
   vers le chemin qui la dessert. Les couleurs de saison (herbe, feuillages) sont mises à jour chaque jour. */

const Decor = (() => {
  const K = K3, G = K.G;
  const wx = (pl, x) => x - pl.w / 2, wz = (pl, y) => y - pl.h / 2;

  // ---------- Textures ----------
  let TX = null;
  function textures() {
    if (TX) return TX;
    const h = K.hasard;
    TX = {
      brique: K.texture((g, S) => {
        g.fillStyle = '#cbbca3'; g.fillRect(0, 0, S, S);
        for (let r = 0; r < S / 8; r++) for (let i = -1; i <= S / 32; i++) { const v = h(r * 17 + i * 3 + 5), x = i * 32 + (r % 2 ? 16 : 0); g.fillStyle = `hsl(${10 + v * 10}, ${44 + v * 14}%, ${33 + v * 12}%)`; g.fillRect(x + 1, r * 8 + 1, 30, 6); }
      }),
      tuiles: K.texture((g, S) => {
        for (let r = 0; r < S / 16; r++) {
          const gr = g.createLinearGradient(0, r * 16, 0, r * 16 + 16); gr.addColorStop(0, '#c8673e'); gr.addColorStop(1, '#8c3e22');
          g.fillStyle = gr; g.fillRect(0, r * 16, S, 16);
          for (let x = 0; x < S; x += 16) { const o = (x + (r % 2) * 8) % S; g.fillStyle = 'rgba(30,5,0,.18)'; g.fillRect(o, r * 16, 3, 16); g.fillStyle = 'rgba(255,215,170,.13)'; g.fillRect((o + 7) % S, r * 16, 4, 16); }
          g.fillStyle = 'rgba(40,10,0,.4)'; g.fillRect(0, r * 16 + 14, S, 2);
        }
      }),
      ardoise: K.texture((g, S) => {
        for (let r = 0; r < S / 12; r++) { g.fillStyle = r % 2 ? '#5f5d66' : '#6a6872'; g.fillRect(0, r * 12, S, 12); for (let x = (r % 2) * 9; x < S; x += 18) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, r * 12, 2, 12); } g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, r * 12 + 11, S, 1); }
      }),
      paves: K.texture((g, S) => {
        g.fillStyle = '#8f8676'; g.fillRect(0, 0, S, S);
        for (let r = 0; r < S / 16; r++) for (let i = -1; i <= S / 16; i++) { const v = h(r * 31 + i * 7 + 1), x = i * 16 + (r % 2 ? 8 : 0); g.fillStyle = `hsl(38, ${10 + v * 8}%, ${50 + v * 14}%)`; g.fillRect(x + 1.5, r * 16 + 1.5, 13, 13); }
      }),
      grain: K.texture((g, S) => {
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S);
        for (let i = 0; i < 900; i++) { const v = h(i * 3.1); g.fillStyle = `rgba(${v < 0.5 ? '0,0,0' : '255,255,255'},${0.05 + h(i * 7.7) * 0.08})`; g.fillRect(h(i) * S, h(i + 0.5) * S, 1 + (i % 3), 1 + (i % 2)); }
      }, 128),
      rangs: K.texture((g, S) => {
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S);
        const gr = g.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, 'rgba(0,0,0,.16)'); gr.addColorStop(0.3, 'rgba(0,0,0,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.06)'); gr.addColorStop(1, 'rgba(0,0,0,.16)');
        g.fillStyle = gr; g.fillRect(0, 0, S, S);
        for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${h(i) < 0.5 ? '0,0,0' : '255,255,255'},${0.05 + h(i * 7.7) * 0.07})`; g.fillRect(h(i * 1.1) * S, h(i * 2.9) * S, 1 + (i % 3), 1); }
      }, 64),
      route: K.texture((g, S) => {
        g.fillStyle = '#77736c'; g.fillRect(0, 0, S, S);
        for (let i = 0; i < 500; i++) { g.fillStyle = h(i) < 0.5 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.08)'; g.fillRect(h(i * 1.3) * S, h(i * 2.7) * S, 2, 2); }
        g.fillStyle = '#5c5953'; g.fillRect(0, 0, S * 0.07, S); g.fillRect(S * 0.93, 0, S * 0.07, S);
        g.fillStyle = '#eee8d8'; g.fillRect(S * 0.475, 0, S * 0.05, S * 0.5);
      }, 64),
      chemin: K.texture((g, S) => {
        g.fillStyle = '#c4a878'; g.fillRect(0, 0, S, S);
        for (let i = 0; i < 400; i++) { g.fillStyle = h(i) < 0.5 ? 'rgba(90,60,30,.18)' : 'rgba(255,240,210,.18)'; g.fillRect(h(i * 1.9) * S, h(i * 3.3) * S, 2, 2); }
        g.fillStyle = '#a88a5c'; g.fillRect(S * 0.2, 0, S * 0.14, S); g.fillRect(S * 0.66, 0, S * 0.14, S);
        g.fillStyle = '#8fae5a'; g.fillRect(S * 0.43, 0, S * 0.14, S);
        g.fillStyle = 'rgba(70,110,40,.55)'; g.fillRect(0, 0, S * 0.06, S); g.fillRect(S * 0.94, 0, S * 0.06, S);
      }, 64),
    };
    return TX;
  }

  // ---------- Réseau routier : cases → lignes lissées ----------
  // Virages (07/11) : rayon de l'arc tangent des chemins et des routes, en cases (0,9 = 45 m)
  const VIRAGE = 0.9;
  // Coin arrondi d'une case de champ au virage d'un chemin (07/11, relecture : « faire le champ similaire au chemin ») :
  // même centre que l'arc du chemin, la bande d'herbe garde sa largeur. a = { sx, sz } : direction du coin depuis le
  // centre de la case ; centre de l'arc = centre de la case + (1 − VIRAGE)·(sx, sz). Points en repère de grille, du bord
  // x (normale sx) au bord z (normale sz), rentrés de ins.
  function arcCoin(x, y, a, ins, n = 8) {
    const R = VIRAGE - 0.5 - ins, ox = x + 0.5 + (1 - VIRAGE) * a.sx, oz = y + 0.5 + (1 - VIRAGE) * a.sz, t0 = a.sx > 0 ? 0 : Math.PI, d = Math.PI / 2 * a.sx * a.sz, pts = [];
    for (let k = 0; k <= n; k++) { const t = t0 + d * k / n; pts.push([ox + R * Math.cos(t), oz + R * Math.sin(t)]); }
    return pts;
  }
  function reseau(pl, type, extremites, arrondis) {
    const W = pl.w, H = pl.h, est = (x, y, t) => x >= 0 && y >= 0 && x < W && y < H && t.includes(pl.types[y][x]);
    const id = (x, y) => y * W + x, voisins = new Map();
    const lier = (a, b) => { if (!voisins.has(a)) voisins.set(a, new Set()); if (!voisins.has(b)) voisins.set(b, new Set()); voisins.get(a).add(b); voisins.get(b).add(a); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!est(x, y, type)) continue;
      if (!voisins.has(id(x, y))) voisins.set(id(x, y), new Set());
      for (const [dx, dy] of [[1, 0], [0, 1]]) if (est(x + dx, y + dy, type)) lier(id(x, y), id(x + dx, y + dy));
      for (const [dx, dy] of [[1, 1], [-1, 1]]) if (est(x + dx, y + dy, type) && !est(x + dx, y, type) && !est(x, y + dy, type)) lier(id(x, y), id(x + dx, y + dy));
      // un chemin aboutit à la route ou à la ferme voisine
      if (extremites) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (est(x + dx, y + dy, extremites)) lier(id(x, y), id(x + dx, y + dy));
    }
    const cle = (a, b) => a < b ? a + '-' + b : b + '-' + a, vus = new Set(), chaines = [];
    const noeud = i => voisins.get(i).size !== 2 || (extremites && !type.includes(pl.types[(i / W) | 0][i % W]));
    for (const [i, vs] of voisins) {
      if (!noeud(i)) continue;
      for (const j of vs) {
        if (vus.has(cle(i, j))) continue;
        const ch = [i]; let a = i, b = j;
        while (true) { vus.add(cle(a, b)); ch.push(b); if (noeud(b)) break; const n = [...voisins.get(b)].find(c => c !== a && !vus.has(cle(b, c))); if (n == null) break; a = b; b = n; }
        chaines.push(ch);
      }
    }
    for (const [i, vs] of voisins) for (const j of vs) if (!vus.has(cle(i, j))) {   // boucles sans carrefour
      const ch = [i]; let a = i, b = j;
      while (!vus.has(cle(a, b))) { vus.add(cle(a, b)); ch.push(b); const n = [...voisins.get(b)].find(c => c !== a && !vus.has(cle(b, c))); if (n == null) break; a = b; b = n; }
      chaines.push(ch);
    }
    const degre = i => voisins.get(i)?.size || 0;
    // Virages (07/11, relecture : « le chemin passe sous le champ », puis « pas naturel, un angle aussi droit ») : là où
    // un chemin tourne d'équerre après au moins deux cases droites de chaque côté, le lissage général rabotait le coin
    // en travers du champ ; on trace plutôt un arc de cercle tangent aux deux tronçons, de rayon VIRAGE (en cases),
    // qui reste dans la case du coin. Les escaliers d'une case (anciennes cartes RPG) restent lissés comme avant.
    const pas = (a, b) => [b % W - a % W, ((b / W) | 0) - ((a / W) | 0)];
    const coinsDe = c => {
      const coins = [];
      for (let k = 1; k + 1 < c.length; k++) { const u = pas(c[k - 1], c[k]), v = pas(c[k], c[k + 1]); if (u[0] !== v[0] || u[1] !== v[1]) coins.push(k); }
      return coins.filter((k, n) => k - (n ? coins[n - 1] : 0) >= 2 && (n + 1 < coins.length ? coins[n + 1] : c.length - 1) - k >= 2
        && (([u, v]) => u[0] * v[0] + u[1] * v[1] === 0 && !(u[0] && u[1]) && !(v[0] && v[1]))([pas(c[k - 1], c[k]), pas(c[k], c[k + 1])]));
    };
    const morceaux = chaines;
    return morceaux.filter(c => c.length > 1).map(c => {
      let pts = c.map(i => [wx(pl, i % W) + 0.5, wz(pl, (i / W) | 0) + 0.5]);
      // les bouts qui touchent le bord de la carte vont jusqu'au bord du plateau
      const bord = (p, i) => { const x = i % W, y = (i / W) | 0; if (degre(i) > 1) return p; return [x === 0 ? wx(pl, 0) : x === W - 1 ? wx(pl, W) : p[0], y === 0 ? wz(pl, 0) : y === H - 1 ? wz(pl, H) : p[1]]; };
      pts[0] = bord(pts[0], c[0]); pts[pts.length - 1] = bord(pts.at(-1), c.at(-1));
      const coins = coinsDe(c);
      if (coins.length) {
        // tronçons droits d'équerre reliés par des arcs tangents
        const out = [pts[0]];
        for (const k of coins) {
          const P = pts[k], u = pas(c[k - 1], c[k]), v = pas(c[k], c[k + 1]), r = VIRAGE;
          // le champ du dedans du virage arrondit son coin sur le même centre
          const ix = c[k] % W - u[0] + v[0], iy = ((c[k] / W) | 0) - u[1] + v[1], ii = iy * W + ix;
          if (arrondis && ix >= 0 && iy >= 0 && ix < W && iy < H && pl.types[iy][ix] === 'c' && pl.unite[ii] >= 0 && !arrondis.has(ii)) arrondis.set(ii, { sx: u[0] - v[0], sz: u[1] - v[1] });
          const O = [P[0] - u[0] * r + v[0] * r, P[1] - u[1] * r + v[1] * r];
          for (let s = 0; s <= 8; s++) { const a = s / 8 * Math.PI / 2; out.push([O[0] - v[0] * r * Math.cos(a) + u[0] * r * Math.sin(a), O[1] - v[1] * r * Math.cos(a) + u[1] * r * Math.sin(a)]); }
        }
        out.push(pts.at(-1)); pts = out;
      } else {
        pts = simplifier(pts, 0.75);
        for (let k = 0; k < 3; k++) pts = chaikin(pts);
      }
      return { pts, debut: c[0], fin: c.at(-1), bordD: pts[0], bordF: pts.at(-1), auBord: [c[0], c.at(-1)].map(i => degre(i) === 1 && (i % W === 0 || i % W === W - 1 || ((i / W) | 0) === 0 || ((i / W) | 0) === H - 1)) };
    });
  }
  // Douglas-Peucker : les escaliers de la grille deviennent des diagonales, les vrais virages restent
  function simplifier(p, eps) {
    if (p.length < 3) return p;
    const [a, b] = [p[0], p.at(-1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-9;
    let k = -1, dmax = 0;
    for (let i = 1; i < p.length - 1; i++) { const d = Math.abs((b[0] - a[0]) * (a[1] - p[i][1]) - (a[0] - p[i][0]) * (b[1] - a[1])) / L; if (d > dmax) { dmax = d; k = i; } }
    if (dmax <= eps) return [a, b];
    return [...simplifier(p.slice(0, k + 1), eps).slice(0, -1), ...simplifier(p.slice(k), eps)];
  }
  function chaikin(p) {
    if (p.length < 3) return p;
    const o = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const [a, b] = [p[i], p[i + 1]];
      if (i > 0) o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      if (i < p.length - 2) o.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    o.push(p.at(-1)); return o;
  }
  function ruban(pts, w, y) {
    const pos = [], uv = [], idx = []; let L = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      if (i) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      pos.push(pts[i][0] - dz * w / 2, y, pts[i][1] + dx * w / 2, pts[i][0] + dz * w / 2, y, pts[i][1] - dx * w / 2);
      uv.push(0, L / (w * 2.2), 1, L / (w * 2.2));
      if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); }
    }
    const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  // Longueur et point à la distance d d'une ligne brisée (pour les véhicules)
  function longueur(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  function surLigne(pts, d, voie = 0) {
    for (let i = 1; i < pts.length; i++) {
      const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], l = Math.hypot(x1 - x0, z1 - z0) || 1e-6;
      if (d <= l || i === pts.length - 1) { const a = Math.max(0, Math.min(1, d / l)), dx = (x1 - x0) / l, dz = (z1 - z0) / l; return { x: x0 + (x1 - x0) * a - dz * voie, z: z0 + (z1 - z0) * a + dx * voie, cap: Math.atan2(dz, dx), fini: d > l && i === pts.length - 1 }; }
      d -= l;
    }
    return { x: 0, z: 0, cap: 0, fini: true };
  }

  // ---------- Ferme au carré de l'Artois ----------
  // Construite dans un repère de 4 × 4 unités centré sur l'origine, porche au sud (+z) ; tournée et mise à l'échelle ensuite.
  // Quatre ailes jointives autour d'une cour : logis au nord, étables à l'ouest, grange à l'est, remises et pigeonnier-porche au sud.
  // Une seule toiture en couronne (croupes aux angles extérieurs, noues aux angles de la cour) : pas de pignons qui se croisent.
  function uvMonde(geo, k) {
    const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
      const u = ny > 0.9 ? p.getX(i) : nx > nz ? p.getZ(i) : p.getX(i), v = ny > 0.9 ? p.getZ(i) : p.getY(i);
      uv[2 * i] = u * k; uv[2 * i + 1] = v * k;
    }
    geo.setAttribute('uv', new T3.BufferAttribute(uv, 2)); return geo;
  }
  function toitCarre(x0, z0, x1, z1, D, H, O) {
    const hR = H + D / 2 + O, pos = [];
    const E = [[x0 - O, z0 - O], [x1 + O, z0 - O], [x1 + O, z1 + O], [x0 - O, z1 + O]];
    const R = [[x0 + D / 2, z0 + D / 2], [x1 - D / 2, z0 + D / 2], [x1 - D / 2, z1 - D / 2], [x0 + D / 2, z1 - D / 2]];
    const I = [[x0 + D + O, z0 + D + O], [x1 - D - O, z0 + D + O], [x1 - D - O, z1 - D - O], [x0 + D + O, z1 - D - O]];
    const V = (q, y) => new T3.Vector3(q[0], y, q[1]);
    const tri = (a, b, c) => { if (new T3.Vector3().subVectors(b, a).cross(new T3.Vector3().subVectors(c, a)).y < 0) [b, c] = [c, b]; pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); };
    for (let k = 0; k < 4; k++) {
      const n = (k + 1) % 4;
      tri(V(E[k], H), V(E[n], H), V(R[n], hR)); tri(V(E[k], H), V(R[n], hR), V(R[k], hR));
      tri(V(R[k], hR), V(R[n], hR), V(I[n], H)); tri(V(R[k], hR), V(I[n], H), V(I[k], H));
    }
    const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return { g, E, R, I, hR };
  }
  // Arc surbaissé : largeur w, montants h1, flèche f
  function surbaisse(w, h1, f) {
    const R = (w * w / 4 + f * f) / (2 * f), cy = h1 + f - R;
    return { R, cy, haut: u => cy + Math.sqrt(Math.max(0, R * R - u * u)),
      forme() { const sh = new T3.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(-w / 2, h1); sh.absarc(0, cy, R, Math.atan2(h1 - cy, -w / 2), Math.atan2(h1 - cy, w / 2), true); sh.lineTo(w / 2, 0); sh.closePath(); return sh; } };
  }
  function arche(w, h) { const s = new T3.Shape(); s.moveTo(-w / 2, 0); s.lineTo(-w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true); s.lineTo(w / 2, 0); s.closePath(); return s; }

  function ferme(parent) {
    const tx = textures(), hasard = K.hasard, A = {};
    const fx = v => v / 16 - 2, fz = v => v / 16 - 2;
    const mBri = K.matT(tx.brique), mTui = K.matT(tx.tuiles, { roughness: 0.8, side: T3.DoubleSide });
    const mPie = K.mat('#e6dcc4'), mGou = K.mat('#2a2522'), mVer = K.mat('#33495a', { roughness: 0.15, metalness: 0.25 }), mCad = K.mat('#f1ede2');
    const mVol = K.mat('#3f5e46'), mPor = K.mat('#4b5a3c'), mGra = K.mat('#6b3a24'), mNoir = K.mat('#1e1611'), mFai = K.mat('#7e3419');
    const mPL = K.mat('#4b3a2a');
    A.toits = [mTui];
    A.roles = new Map([[mTui, 'toiture'], [mBri, 'mur'], [mPie, 'encadrement'], [mGou, 'soubassement'], [mVer, 'fenêtre'], [mCad, 'fenêtre'], [mVol, 'volet'], [mPor, 'porte'], [mGra, 'porte'], [mPL, 'porte'], [mNoir, 'passage voûté'], [mFai, 'faîtage']]);
    const bloc = (x0, x1, y0, y1, z0, z1, m, k = 2.6, par = parent) => { const g = new T3.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); uvMonde(g, k); return K.mesh(par, g, m); };
    const X0 = fx(2), X1 = fx(62), Z0 = fz(2), Z1 = fz(62), D = 0.75, H = 0.46, O = 0.06, BH = 0.045, e = 0.004;
    bloc(X0 + D, X1 - D, 0, 0.012, Z0 + D, Z1 - D, K.matT(tx.paves, { roughness: 0.95 }), 7).castShadow = false;
    // murs jointifs (brique) et soubassement goudronné
    [[X0, X1, Z0, Z0 + D], [X0, X1, Z1 - D, Z1], [X0, X0 + D, Z0 + D, Z1 - D], [X1 - D, X1, Z0 + D, Z1 - D]].forEach(([a, b, c, d], i) => {
      bloc(a, b, 0, H, c, d, mBri);
      if (i < 2) bloc(a - e, b + e, 0, BH, c - e, d + e, mGou); else bloc(a - e, b + e, 0, BH, c + e, d - e, mGou);
    });
    const T = toitCarre(X0, Z0, X1, Z1, D, H, O); uvMonde(T.g, 4.2); K.mesh(parent, T.g, mTui);
    const ligne = (a, b, ep, h, m) => { const v = new T3.Vector3().subVectors(b, a), L = v.length(), g = new T3.BoxGeometry(ep, h, L);
      const ms = K.mesh(parent, g, m, [(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2]); ms.lookAt(new T3.Vector3().copy(b).applyMatrix4(parent.matrixWorld)); ms.castShadow = false; ms.userData.vise = b.clone(); return ms; };
    const P = (q, y) => new T3.Vector3(q[0], y, q[1]);
    A.lignes = [];
    for (let k = 0; k < 4; k++) {
      const n = (k + 1) % 4;
      A.lignes.push(ligne(P(T.R[k], T.hR + 0.01), P(T.R[n], T.hR + 0.01), 0.035, 0.025, mFai), ligne(P(T.E[k], H + 0.008), P(T.R[k], T.hR + 0.01), 0.03, 0.02, mFai),
        ligne(P(T.I[k], H - 0.012), P(T.I[n], H - 0.012), 0.012, 0.028, mFai));
      // rive extérieure, interrompue devant les avant-corps
      const a = P(T.E[k], H - 0.012), b = P(T.E[n], H - 0.012), trous = k === 1 ? [[fz(22.4) - 0.65 - 0.08, fz(22.4) + 0.65 + 0.08, 'z']] : k === 2 ? [[fx(25) - 0.07, fx(39) + 0.07, 'x']] : [];
      let morceaux = [[a, b]];
      for (const [c0, c1, ax] of trous) morceaux = morceaux.flatMap(([u, v]) => {
        const t0 = (c0 - u[ax]) / (v[ax] - u[ax]), t1 = (c1 - u[ax]) / (v[ax] - u[ax]), ta = Math.min(t0, t1), tb = Math.max(t0, t1);
        if (tb <= 0 || ta >= 1) return [[u, v]];
        const out = []; if (ta > 0.01) out.push([u, u.clone().lerp(v, ta)]); if (tb < 0.99) out.push([u.clone().lerp(v, tb), v]); return out;
      });
      for (const [u, v] of morceaux) A.lignes.push(ligne(u, v, 0.012, 0.028, mFai));
    }
    [18, 46].forEach(u => { bloc(fx(u) - 0.045, fx(u) + 0.045, H + 0.1, T.hR + 0.17, Z0 + D / 2 - 0.045, Z0 + D / 2 + 0.045, mBri); bloc(fx(u) - 0.055, fx(u) + 0.055, T.hR + 0.17, T.hR + 0.19, Z0 + D / 2 - 0.055, Z0 + D / 2 + 0.055, mPie); });
    A.cheminees = [18, 46].map(u => new T3.Vector3(fx(u), T.hR + 0.22, Z0 + D / 2));
    // ouvertures : F(axe, plan, sens) pose une pièce collée au mur
    const F = (axe, pos, sens) => (c, y, w, h, d, ep, m) => K.mesh(parent, G.boite(...(axe === 'z' ? [w, h, ep] : [ep, h, w])), m, axe === 'z' ? [c, y + h / 2, pos + sens * d] : [pos + sens * d, y + h / 2, c]);
    function fenetre(f, c, y, w, h, volets) {
      f(c, y - 0.016, w + 0.03, 0.016, 0.012, 0.022, mPie); f(c, y + h, w + 0.03, 0.022, 0.007, 0.014, mPie);
      f(c, y, w, h, 0.004, 0.008, mCad); f(c, y + 0.008, w - 0.016, h - 0.016, 0.007, 0.005, mVer);
      f(c, y, 0.008, h, 0.01, 0.004, mCad); f(c, y + h * 0.55, w, 0.008, 0.01, 0.004, mCad);
      if (volets) { f(c - w * 0.78, y, w * 0.5, h, 0.006, 0.008, mVol); f(c + w * 0.78, y, w * 0.5, h, 0.006, 0.008, mVol); }
    }
    function porte(f, c, w, h, m, cadre = true) { if (cadre) f(c, 0, w + 0.03, h + 0.02, 0.004, 0.008, mPie); f(c, 0, w, h, 0.007, 0.008, m); }
    const logisCour = F('z', Z0 + D, 1), logisDos = F('z', Z0, -1), etaCour = F('x', X0 + D, 1), etaDos = F('x', X0, -1);
    const graCour = F('x', X1 - D, -1), graDos = F('x', X1, 1), sudDos = F('z', Z1, 1), sudCour = F('z', Z1 - D, -1);
    [17.5, 22.5, 27.5, 36.5, 41.5, 46.5].forEach(u => { fenetre(logisCour, fx(u), 0.1, 0.09, 0.13, true); fenetre(logisCour, fx(u), 0.29, 0.09, 0.11, true); });
    porte(logisCour, fx(32), 0.12, 0.25, mPL); logisCour(fx(32), 0, 0.2, 0.02, 0.03, 0.06, mPie); logisCour(fx(32), 0, 0.16, 0.04, 0.02, 0.03, mPie);
    [10, 20, 44, 54].forEach(u => { fenetre(logisDos, fx(u), 0.1, 0.09, 0.13, false); fenetre(logisDos, fx(u), 0.29, 0.09, 0.11, false); });
    [22, 34, 46].forEach(u => porte(etaCour, fz(u), 0.13, 0.24, mPor)); [28, 40].forEach(u => fenetre(etaCour, fz(u), 0.2, 0.09, 0.07, false));
    [18, 30, 42].forEach(u => fenetre(etaDos, fz(u), 0.22, 0.08, 0.06, false));
    porte(graCour, fz(44), 0.13, 0.24, mGra); fenetre(graCour, fz(36), 0.2, 0.09, 0.07, false);
    porte(graDos, fz(44), 0.13, 0.24, mGra);
    [9, 17, 47, 55].forEach(u => fenetre(sudDos, fx(u), 0.2, 0.09, 0.07, false)); [17, 47].forEach(u => porte(sudCour, fx(u), 0.2, 0.26, mGra));
    // pigeonnier-porche au milieu de l'aile sud
    const TX0 = fx(25), TX1 = fx(39), TZ0 = Z1 - D - 0.05, TZ1 = Z1 + 0.05, HT = 0.98;
    bloc(TX0, TX1, 0, HT, TZ0, TZ1, mBri); bloc(TX0 - e, TX1 + e, 0, BH, TZ0 - e, TZ1 + e, mGou);
    bloc(TX0 - 0.012, TX1 + 0.012, 0.74, 0.765, TZ0 - 0.012, TZ1 + 0.012, mPie);
    const cg = new T3.ConeGeometry(((TX1 - TX0) / 2 + 0.06) * Math.SQRT2, 0.42, 4); cg.rotateY(Math.PI / 4); cg.translate(fx(32), HT + 0.21, (TZ0 + TZ1) / 2); uvMonde(cg, 4.2); K.mesh(parent, cg, mTui);
    K.mesh(parent, new T3.SphereGeometry(0.025, 8, 6), mFai, [fx(32), HT + 0.43, (TZ0 + TZ1) / 2]);
    A.pigeonnier = new T3.Vector3(fx(32), HT + 0.3, (TZ0 + TZ1) / 2);
    [[TZ1, 0], [TZ0, Math.PI]].forEach(([z, ry]) => {
      const s = Math.cos(ry);
      K.mesh(parent, new T3.ExtrudeGeometry(arche(0.36, 0.42), { depth: 0.01, bevelEnabled: false }), mPie, [fx(32), 0, z], [0, ry, 0]);
      K.mesh(parent, new T3.ExtrudeGeometry(arche(0.29, 0.37), { depth: 0.014, bevelEnabled: false }), mNoir, [fx(32), 0, z], [0, ry, 0]);
      const f = F('z', z, s); fenetre(f, fx(32), 0.52, 0.08, 0.1, false);
      f(fx(32), 0.79, 0.42, 0.014, 0.02, 0.035, mPie); for (let i = -2; i <= 2; i++) f(fx(32) + i * 0.075, 0.81, 0.035, 0.045, 0.004, 0.008, mNoir);
    });
    // Porte charretière de la grange, côté chemin : avant-corps à pignon sur toute l'épaisseur de l'aile est, plus saillant
    // que l'égout du toit, grande porte en arc surbaissé assez large et haute pour la moissonneuse, porte de cour en face.
    // Les vantaux à planches s'ouvrent vers l'extérieur au passage d'une machine.
    const PZ = fz(22.4), PL = 0.65, PX0 = X1 - D - 0.085, PX1 = X1 + 0.085, PH = 1.0, PR = 0.3, PXc = (PX0 + PX1) / 2;
    const gp = new T3.Group(); gp.userData.nom = { cle: 'batiment:grange/porte-charretiere', libelle: 'Grange · porte charretière' }; parent.add(gp);
    bloc(PX0, PX1, 0, PH, PZ - PL, PZ + PL, mBri, 2.6, gp); bloc(PX0 - e, PX1 + e, 0, BH, PZ - PL - e, PZ + PL + e, mGou, 2.6, gp);
    bloc(PX0 - 0.012, PX1 + 0.012, PH - 0.03, PH - 0.005, PZ - PL - 0.012, PZ + PL + 0.012, mPie, 2.6, gp);
    const pg = K.toit(2 * PL, PR, PX1 - PX0); pg.rotateY(Math.PI / 2); pg.translate(PXc, PH, PZ); uvMonde(pg, 2.6); K.mesh(gp, pg, mBri);
    const pb = PL + 0.07, pente = PR / PL;
    [-1, 1].forEach(sg => { const g = new T3.BoxGeometry(PX1 - PX0 + 0.14, 0.03, pb * Math.hypot(1, pente)); g.rotateX(sg * Math.atan(pente)); g.translate(PXc, PH + PR - pb / 2 * pente + 0.016, PZ + sg * pb / 2); uvMonde(g, 4.2); K.mesh(gp, g, mTui); });
    const faite = ligne(new T3.Vector3(PX0 - 0.07, PH + PR + 0.03, PZ), new T3.Vector3(PX1 + 0.07, PH + PR + 0.03, PZ), 0.035, 0.025, mFai); A.lignes.push(faite);
    [[PX1, PX1 + 0.008], [PX0 - 0.008, PX0]].forEach(([a, b]) => bloc(a, b, PH + 0.03, PH + 0.17, PZ - 0.06, PZ + 0.06, mGra, 2.6, gp));
    const ext = (sh, d) => new T3.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 16 });
    const AE = surbaisse(1.12, 0.58, 0.22), AC = surbaisse(1.24, 0.58, 0.27);
    K.mesh(gp, ext(AC.forme(), 0.012), mPie, [PX1, 0, PZ], [0, Math.PI / 2, 0]);
    K.mesh(gp, ext(AE.forme(), 0.016), mNoir, [PX1, 0, PZ], [0, Math.PI / 2, 0]);
    bloc(PX1, PX1 + 0.02, 0.79, 0.87, PZ - 0.045, PZ + 0.045, mPie, 2.6, gp);
    const CW = 0.46, CH = 0.42;
    bloc(PX0 - 0.006, PX0, 0, CH, PZ - CW / 2, PZ + CW / 2, mNoir, 2.6, gp);
    [[PZ - CW / 2 - 0.04, PZ - CW / 2], [PZ + CW / 2, PZ + CW / 2 + 0.04]].forEach(([a, b]) => bloc(PX0 - 0.012, PX0, 0, CH + 0.05, a, b, mPie, 2.6, gp));
    bloc(PX0 - 0.012, PX0, CH, CH + 0.05, PZ - CW / 2, PZ + CW / 2, mPie, 2.6, gp);
    // Terre battue devant la porte (08/11 : « trop carré ») : aire irrégulière qui s'évase contre le mur et se resserre sur le
    // chemin, bordée d'un voile de terre mêlée d'herbe (transparent : il prend la couleur de la saison)
    const aire = (marge, phase) => {
      const N = 26, bord = [], lg = 1.02 + marge, pli = (u, k) => (Math.sin(u * 11 + phase + k) + Math.sin(u * 23 + phase * 2 + k * 3) * 0.6 + (hasard(Math.round(u * N) * 3 + k + phase) - 0.5) * 1.1) * 0.032;
      const large = u => 0.13 + marge * 0.7 + (0.55 + marge * 0.4) * Math.pow(1 - u, 1.5);
      for (let i = 0; i <= N; i++) { const u = i / N; bord.push([PX1 + 0.004 + u * lg, PZ + large(u) + pli(u, 1)]); }
      for (let i = N; i >= 0; i--) { const u = i / N; bord.push([PX1 + 0.004 + u * lg, PZ - large(u) - pli(u, 5)]); }
      const sh = new T3.Shape(); bord.forEach(([x, z], i) => i ? sh.lineTo(x, z) : sh.moveTo(x, z)); sh.closePath();
      const geo = new T3.ShapeGeometry(sh); geo.rotateX(Math.PI / 2); return geo;
    };
    const voile = K.mesh(gp, aire(0.09, 2.3), K.mat('#c8ac74', { transparent: true, opacity: 0.5, depthWrite: false, side: T3.DoubleSide }), [0, 0.005, 0]); voile.castShadow = false; voile.receiveShadow = true;
    const battue = K.mesh(gp, aire(0, 0.7), K.mat('#d9bc84', { side: T3.DoubleSide }), [0, 0.007, 0]); battue.castShadow = false; battue.receiveShadow = true;
    const mVan = K.matV();
    function vantail(w, haut, ep, rot, dehors) {
      const sh = new T3.Shape(), N = 12; sh.moveTo(0, 0); sh.lineTo(0, haut(0));
      for (let i = 1; i <= N; i++) sh.lineTo(w * i / N, haut(w * i / N));
      sh.lineTo(w, 0); sh.closePath();
      const z = dehors > 0 ? ep + 0.003 : -0.003, pc = [K.piece(ext(sh, ep), '#6b3a24')];
      [0.1, Math.min(0.42, haut(w) - 0.08)].forEach(y => pc.push(K.piece(G.boite(w - 0.03, 0.024, 0.006), '#4a2716', [w / 2, y, z])));
      for (let i = 1; i < 4; i++) pc.push(K.piece(G.boite(0.004, haut(w * i / 4) - 0.03, 0.004), '#4f2a17', [w * i / 4, haut(w * i / 4) / 2, z]));
      const g = K.fusion(pc); g.rotateY(rot); return g;
    }
    const pivot = (x, z, geo) => { const g = new T3.Group(); g.position.set(x, 0, z); gp.add(g); K.mesh(g, geo, mVan); return g; };
    const hE = u => AE.haut(0.56 - u), hC = () => CH;
    const VAN = [
      [pivot(PX1 + 0.036, PZ - 0.56, vantail(0.556, hE, 0.018, -Math.PI / 2, -1)), 1], [pivot(PX1 + 0.018, PZ + 0.56, vantail(0.556, hE, 0.018, Math.PI / 2, 1)), -1],
      [pivot(PX0 - 0.004, PZ - CW / 2, vantail(CW / 2 - 0.002, hC, 0.016, -Math.PI / 2, 1)), -1], [pivot(PX0 - 0.02, PZ + CW / 2, vantail(CW / 2 - 0.002, hC, 0.016, Math.PI / 2, -1)), 1],
    ];
    A.portes = { u: 0, poser() { const k = this.u * this.u * (3 - 2 * this.u); VAN.forEach(([g, sg]) => { g.rotation.y = sg * k * 2.85; }); } };
    // Circulation dans la ferme (repère de la ferme) : on entre par la grange, on vide sur l'aire à cul dans la porte de cour,
    // on fait le tour de la cour et on sort par le porche (sens unique). Les machines se rangent dans la grange ; les tracteurs dans la cour.
    A.voies = {
      porte: [PX1 + 0.012, PZ], dehors: [PX1 + 1.35, PZ], seuil: [PX1 + 0.35, PZ], abri: [X1 - 0.45, PZ], cour: [PX0 - 0.25, PZ], vide: [0.12, PZ],
      tour: [[-0.55, PZ, 0.3], [-0.85, -0.25, 0.3], [-0.85, 0.55, 0.3], [-0.45, 0.88, 0.3], [0, 1.2, 0.25]], porche: [0, 1.62], sortie: [0, 2.35],
      places: [[0.86, -0.1], [0.52, -0.1], [0.18, -0.1]], rangee: 0.86,
    };
    // fumière (décalée vers l'ouest pour laisser passer les bennes), pompe, charrette de petites bottes
    bloc(fx(22.4), fx(32), 0, 0.05, fz(30.4), fz(36.8), mBri);
    K.mesh(parent, G.boule(8, 6), K.mat('#5e4128'), [fx(27.2), 0.05, fz(33.6)], 0, [0.27, 0.09, 0.16]);
    const paille = K.inst(parent, G.boite(0.03, 0.006, 0.008), K.mat('#c9a65a'), 30, false);
    for (let i = 0; i < 30; i++) K.poser(paille, i, [fx(27.2) + (hasard(i) - 0.5) * 0.42, 0.11 + hasard(i + 9) * 0.02, fz(33.6) + (hasard(i + 3) - 0.5) * 0.2], [0, hasard(i + 5) * 6, 0]);
    K.mesh(parent, G.cyl(0.018, 0.022, 0.14, 8), K.mat('#2f4a3a'), [fx(38), 0.07, Z0 + D + 0.08]);
    const ch = new T3.Group(); ch.position.set(-0.8, 0, -0.93); ch.rotation.y = 0; parent.add(ch);
    K.mesh(ch, G.boite(0.3, 0.025, 0.16), K.mat('#8a5a32'), [0, 0.09, 0]);
    [-0.1, 0.1].forEach(z => K.mesh(ch, G.cyl(0.055, 0.055, 0.014, 10), K.mat('#4a3424'), [0, 0.055, z * 0.9], [Math.PI / 2, 0, 0]));
    K.mesh(ch, G.cyl(0.006, 0.006, 0.22, 4), K.mat('#6a4a2a'), [-0.24, 0.07, 0], [0, 0, Math.PI / 2 - 0.25]);
    const bm = K.mat('#d9c271');
    [[-0.07, 0, -0.04], [0.03, 0, -0.04], [0.11, 0, -0.04], [-0.07, 0, 0.04], [0.03, 0, 0.04], [-0.02, 1, 0]].forEach(([x, l, z]) => K.mesh(ch, G.boite(0.09, 0.045, 0.06), bm, [x, 0.125 + l * 0.045, z]));
    A.cour = { x0: fx(16), x1: fx(46), z0: fz(22), z1: fz(46) };
    A.porche = new T3.Vector3(fx(32), 0, Z1 + 0.05);
    return A;
  }

  // Maison du village : brique, toit de tuiles ou d'ardoise, cheminée (une case)
  function maison(parent, x, z, ry, s, ardoise) {
    const tx = textures(), g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s); parent.add(g);
    const murs = new T3.BoxGeometry(0.62, 0.26, 0.36); murs.translate(0, 0.13, 0); uvMonde(murs, 2.6); K.mesh(g, murs, K.matT(tx.brique));
    const t = K.toit(0.44, 0.2, 0.66); t.rotateY(Math.PI / 2); t.translate(0, 0.26, 0); uvMonde(t, 4); const mt = K.matT(ardoise ? tx.ardoise : tx.tuiles, { side: T3.DoubleSide }); K.mesh(g, t, mt); g.userData.toit = mt;
    K.mesh(g, G.boite(0.05, 0.12, 0.05), K.matT(tx.brique), [0.18, 0.42, 0.06]);
    const mv = K.mat('#33495a', { roughness: 0.2, metalness: 0.2 }), mc = K.mat('#f1ede2');
    [-0.18, 0.18].forEach(u => { K.mesh(g, G.boite(0.09, 0.09, 0.01), mc, [u, 0.13, 0.181]); K.mesh(g, G.boite(0.07, 0.07, 0.012), mv, [u, 0.13, 0.183]); });
    K.mesh(g, G.boite(0.08, 0.16, 0.012), K.mat('#4b3a2a'), [0, 0.08, 0.183]);
    return g;
  }

  // Jardin d'une maison du hameau : clôture de bois (portillon côté route), allée de gravier, potager derrière la maison
  // ou dans la case du verger ; tout fusionné en une pièce par maison
  function jardin(parent, J) {
    const P = [], bois = '#8a6a48', poteau = (x, z) => P.push(K.piece(G.boite(0.014, 0.06, 0.014), bois, [x, 0.03, z]));
    const cloture = (x0, z0, x1, z1) => {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 0.09)), a = Math.atan2(x1 - x0, z1 - z0);
      for (let k = 0; k <= n; k++) poteau(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n);
      for (const yy of [0.022, 0.048]) P.push(K.piece(G.boite(0.006, 0.008, L), bois, [(x0 + x1) / 2, yy, (z0 + z1) / 2], [0, a, 0]));
    };
    const e = 0.465, porte = 0.07;
    cloture(-e, e, -porte, e); cloture(porte, e, e, e);                       // devant, portillon au milieu
    cloture(-e, e, -e, -e); cloture(e, e, e, -e);                             // côtés
    if (!J.arriere) cloture(-e, -e, e, -e);                                   // fond, sauf s'il s'ouvre sur le verger
    P.push(K.piece(G.boite(0.075, 0.004, 0.2), '#cdbb94', [0, 0.002, 0.37]));  // allée de gravier jusqu'au portillon
    // potager : planches de terre et rangs de légumes
    const potager = (x, z, w, d) => {
      P.push(K.piece(G.boite(w, 0.006, d), '#6b4a30', [x, 0.003, z]));
      const n = Math.max(2, Math.round(d / 0.07));
      for (let k = 0; k < n; k++) P.push(K.piece(G.boite(w * 0.9, 0.022, 0.022), k % 3 === 2 ? '#7fb85a' : '#5e9a3c', [x, 0.014, z - d / 2 + (k + 0.5) * d / n]));
    };
    if (J.arriere) potager(-0.12, -1.0, 0.5, 0.42); else potager(-0.14, -0.34, 0.42, 0.2);
    const geo = K.fusion(P), m = new T3.Mesh(geo, K.matV());
    m.position.set(J.cx, 0, J.cz); m.rotation.y = J.a; m.castShadow = m.receiveShadow = true;
    m.userData.nom = { cle: `batiment:jardin-${J.x}-${J.y}`, libelle: 'Jardin' }; parent.add(m);
    return m;
  }

  // Géométries des arbres et buissons (houppiers teintés selon la saison)
  let GA = null;
  function geoArbres() {
    if (GA) return GA;
    GA = {
      tronc: K.fusion([K.piece(G.cyl(0.05, 0.075, 0.44, 6), '#6b4426', [0, 0.22, 0]), K.piece(G.cyl(0.018, 0.026, 0.2, 4), '#6b4426', [0.07, 0.42, 0.02], [0, 0, -0.7]), K.piece(G.cyl(0.016, 0.024, 0.18, 4), '#6b4426', [-0.06, 0.44, -0.03], [0.3, 0, 0.7])]),
      houppier: K.fusion([K.piece(G.ico1(), '#ffffff', [0, 0.66, 0], null, 0.32), K.piece(G.ico1(), '#e8e8e8', [0.17, 0.54, 0.08], null, 0.24), K.piece(G.ico1(), '#d4d4d4', [-0.15, 0.56, -0.1], null, 0.22), K.piece(G.ico(), '#f0f0f0', [0.02, 0.86, 0.04], null, 0.17)]),
      buisson: K.fusion([K.piece(G.ico1(), '#ffffff', [0, 0.13, 0], null, [0.15, 0.16, 0.15]), K.piece(G.ico(), '#dcdcdc', [0.08, 0.1, 0.04], null, 0.1)]),
      touffe: K.fusion([0, 1, 2, 3, 4].map(i => K.piece(G.feuille(0.07, 0.009, 1.35, 0.9, 2), i % 2 ? '#ffffff' : '#e0e0e0', [0, 0, 0], [0, i * 1.25, 0]))),
      roseau: K.fusion([K.piece(G.cyl(0.006, 0.01, 0.26, 4), '#5f8f3a', [0, 0.13, 0]), K.piece(G.cyl(0.012, 0.012, 0.05, 5), '#6a4a2a', [0, 0.25, 0])]),
    };
    return GA;
  }

  // ---------- Construction du lieu ----------
  function construire(scene, pl, echelle) {
    const D = { pl, groupe: new T3.Group(), echelle }, W = pl.w, H = pl.h, tx = textures(), h = K.hasard;
    const g = D.groupe; scene.add(g);
    const planches = echelle === 'planches';
    // socle : terre en couches sous le plateau
    const nomSocle = { cle: 'socle', libelle: 'Socle de la maquette' };
    Object.assign(K.mesh(g, G.boite(W + 0.5, 1.1, H + 0.5), K.mat('#6e4c30'), [0, -0.62, 0]), { castShadow: false }).userData.nom = nomSocle;
    Object.assign(K.mesh(g, G.boite(W + 0.5, 0.16, H + 0.5), K.mat('#55392a'), [0, -0.16, 0]), { castShadow: false }).userData.nom = nomSocle;
    D.fond = K.mesh(g, G.boite(W + 0.2, 0.09, H + 0.2), K.mat('#6c9a44'), [0, -0.045, 0]); D.fond.castShadow = false;
    // routes et chemins lissés ; leurs virages arrondissent le coin du champ du dedans (D.arrondis : case → { sx, sz })
    D.arrondis = new Map();
    D.routes = reseau(pl, 'r', null, planches ? null : D.arrondis); D.chemins = reseau(pl, 'p', 'rm', planches ? null : D.arrondis);
    D.coinDe = i => { const a = D.arrondis.get(i); if (!a) return null; return { sx: a.sx, sz: a.sz, ox: i % W + 0.5 + (1 - VIRAGE) * a.sx, oz: ((i / W) | 0) + 0.5 + (1 - VIRAGE) * a.sz, r: VIRAGE - 0.5, t: 1 - VIRAGE }; };
    D.arcCoin = (i, ins, n) => arcCoin(i % W, (i / W) | 0, D.arrondis.get(i), ins, n);
    // sol case par case : quatre sommets par case, rétrécis aux bords d'un champ pour laisser voir la bordure d'herbe ;
    // une case au coin arrondi ajoute les sommets de son arc (éventail depuis le sommet opposé), et le coin coupé est
    // rempli d'herbe, teinté avec la case du virage (sinon le fond vert foncé se verrait)
    const n = W * H, ARC = 8, nv = n * 4 + D.arrondis.size * (ARC * 2 + 2), pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idxC = [], idxH = [], suite = new Map();
    const un = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? -9 : pl.unite[y * W + x];
    let libre = n * 4;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, ty = pl.types[y][x], u = pl.unite[i], champ = ty === 'c' && u >= 0;
      const b = champ && !planches ? 0.035 : 0, ins = s => (champ && un(x + s[0], y + s[1]) !== u ? b : 0);
      const x0 = wx(pl, x) + ins([-1, 0]), x1 = wx(pl, x + 1) - ins([1, 0]), z0 = wz(pl, y) + ins([0, -1]), z1 = wz(pl, y + 1) - ins([0, 1]);
      const yy = champ && !planches ? 0.004 : 0.001, ku = champ && !planches ? [1.7, 6] : [1.7, 1.7];
      const poser = (j, p) => { pos.set([p[0], yy, p[1]], j * 3); uv.set([p[0] * ku[0], -p[1] * ku[1]], j * 2); };
      const v = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], k = i * 4, cible = champ && !planches ? idxC : idxH, a = champ && D.arrondis.get(i);
      if (!a) { v.forEach((p, j) => poser(k + j, p)); cible.push(k, k + 3, k + 1, k + 1, k + 3, k + 2); continue; }
      const c = a.sx < 0 ? (a.sz < 0 ? 0 : 3) : (a.sz < 0 ? 1 : 2), arc = arcCoin(x, y, a, b, ARC).map(([px, pz]) => [wx(pl, px), wz(pl, pz)]);
      if (c % 2) arc.reverse();   // ordre du polygone : coin pair → bord x puis bord z ; impair → l'inverse
      const ids = [k + c]; for (let j = 0; j < ARC; j++) ids.push(libre++);
      v.forEach((p, j) => { if (j !== c) poser(k + j, p); }); arc.forEach((p, j) => poser(ids[j], p)); suite.set(i, ids.slice(1));
      const o = k + (c + 2) % 4, tour = [k + (c + 3) % 4, ...ids, k + (c + 1) % 4];
      for (let j = 0; j + 1 < tour.length; j++) cible.push(o, tour[j + 1], tour[j]);
      // herbe du coin coupé : de l'angle de la case à l'arc pris au bord de la case
      const P = (y + a.sz) * W + x + a.sx, herbe = [[wx(pl, x + 0.5 + 0.5 * a.sx), wz(pl, y + 0.5 + 0.5 * a.sz)], ...arcCoin(x, y, a, 0, ARC).map(([px, pz]) => [wx(pl, px), wz(pl, pz)])], hid = herbe.map(() => libre++);
      herbe.forEach((p, j) => { pos.set([p[0], 0.001, p[1]], hid[j] * 3); uv.set([p[0] * 1.7, -p[1] * 1.7], hid[j] * 2); });
      suite.set(P, [...(suite.get(P) || []), ...hid]);
      for (let j = 1; j + 1 < herbe.length; j++) { const [A, B, C] = [herbe[0], herbe[j], herbe[j + 1]]; idxH.push(...((B[1] - A[1]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[1] - A[1]) > 0 ? [hid[0], hid[j], hid[j + 1]] : [hid[0], hid[j + 1], hid[j]])); }
    }
    // deux maillages qui partagent sommets et couleurs : les champs (rangs le long de x) et le reste (grain de l'herbe)
    const aP = new T3.BufferAttribute(pos, 3), aC = new T3.BufferAttribute(col, 3), aU = new T3.BufferAttribute(uv, 2), nor = new Float32Array(nv * 3);
    for (let i = 0; i < nv; i++) nor[i * 3 + 1] = 1;
    const aN = new T3.BufferAttribute(nor, 3);
    D.sols = [[idxH, tx.grain], [idxC, tx.rangs]].map(([ix, map]) => {
      const sg = new T3.BufferGeometry(); sg.setAttribute('position', aP); sg.setAttribute('color', aC); sg.setAttribute('uv', aU); sg.setAttribute('normal', aN); sg.setIndex(ix);
      const m = new T3.Mesh(sg, K.patcher(new T3.MeshStandardMaterial({ vertexColors: true, map, roughness: 1, metalness: 0 }))); m.receiveShadow = true; g.add(m); return m;
    });
    D.colorer = (i, c) => { for (let k = 0; k < 4; k++) col.set([c.r, c.g, c.b], i * 12 + k * 3); for (const j of suite.get(i) || []) col.set([c.r, c.g, c.b], j * 3); };
    D.solFini = () => { aC.needsUpdate = true; };
    const larg = planches ? { r: 0.74, p: 0.36 } : { r: 0.44, p: 0.22 };
    const mR = K.matT(tx.route, { roughness: 0.95, flatShading: false }), mC = K.matT(tx.chemin, { roughness: 1, flatShading: false });
    D.routes.forEach((r, i) => { const m = new T3.Mesh(ruban(r.pts, larg.r, 0.012), mR); m.receiveShadow = true; m.userData.nom = { cle: 'route:' + (i + 1), libelle: 'Route ' + (i + 1) }; g.add(m); });
    D.chemins.forEach((c, i) => { const m = new T3.Mesh(ruban(c.pts, larg.p, 0.009), mC); m.receiveShadow = true; m.userData.nom = { cle: 'chemin:' + (i + 1), libelle: 'Chemin de terre ' + (i + 1) }; g.add(m); });
    // raccords des chemins : un disque aux carrefours, pas de bout qui dépasse
    const degC = new Map(); for (const c of D.chemins) for (const e of [c.debut, c.fin]) degC.set(e, (degC.get(e) || 0) + 1);
    for (const [i, d] of degC) if (d >= 2 && pl.types[(i / W) | 0][i % W] === 'p') { const m = new T3.Mesh(G.disque(larg.p / 2, 14), K.matT(tx.chemin, { roughness: 1, flatShading: false })); m.position.set(wx(pl, i % W) + 0.5, 0.0091, wz(pl, (i / W) | 0) + 0.5); m.receiveShadow = true; m.userData.nom = { cle: 'chemin:carrefour-' + i, libelle: 'Chemin de terre' }; g.add(m); }
    D.toitsMaisons = [mC];   // les chemins de terre blanchissent sous la neige comme les toits
    // carrefours : un disque bouche les angles
    const deg = new Map(); for (const r of D.routes) for (const e of [r.debut, r.fin]) deg.set(e, (deg.get(e) || 0) + 1);
    for (const [i, d] of deg) if (d >= 3) { const m = new T3.Mesh(G.disque(larg.r / 2, 14), K.mat('#77736c')); m.position.set(wx(pl, i % W) + 0.5, 0.0121, wz(pl, (i / W) | 0) + 0.5); m.receiveShadow = true; g.add(m); }
    D.larg = larg;
    // bois, haies, herbe, eau
    const GA = geoArbres(), arbres = [], buissons = [], touffes = [], roseaux = [];
    // Maisons du hameau (07/11, relecture : « normalement les maisons ont un petit jardin ») : la porte regarde la route,
    // un jardin clos autour (allée, potager, arbre fruitier) et, quand la case de derrière est en herbe, un verger potager
    // fermé de haies. Repère local de la maison : +z vers la route, la case fait 1 × 1.
    const typeCase = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? pl.types[y][x] : '#';
    const jardins = [];
    for (let y = 0; y < H && !planches; y++) for (let x = 0; x < W; x++) {
      if (pl.types[y][x] !== 'b') continue;
      const o = [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]].find(([dx, dy]) => 'rp'.includes(typeCase(x + dx, y + dy)));
      if (!o) continue;
      const [dx, dy, a] = o, arriere = typeCase(x - dx, y - dy) === 'h';
      const J = { x, y, a, arriere, cx: wx(pl, x) + 0.5, cz: wz(pl, y) + 0.5 };
      J.monde = (lx, lz) => [J.cx + lx * Math.cos(a) + lz * Math.sin(a), J.cz - lx * Math.sin(a) + lz * Math.cos(a)];
      jardins.push(J);
    }
    const jardinDe = new Map(jardins.map(J => [J.y * W + J.x, J]));
    for (const J of jardins) {
      const s = J.y * 31 + J.x * 17, arbre = (lx, lz, k) => { const [x, z] = J.monde(lx, lz); arbres.push({ x, z, s: 0.38 + h(s + k) * 0.1, r: h(s + k * 3) * 6, t: 'jardin' }); };
      arbre(0.31, -0.32, 1);
      if (J.arriere) {
        arbre(-0.28, -0.72, 2); arbre(0.26, -0.86, 3); arbre(-0.05, -1.25, 4);
        // haies basses sur les trois côtés extérieurs du verger
        const haie = (x0, z0, x1, z1) => { const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.14); for (let k = 0; k <= n; k++) { const [x, z] = J.monde(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n); buissons.push({ x, z, s: 0.5 + h(s + k * 7) * 0.15 }); } };
        haie(-0.46, -1.46, 0.46, -1.46); haie(-0.46, -0.56, -0.46, -1.4); haie(0.46, -0.56, 0.46, -1.4);
      }
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = pl.types[y][x], cx = wx(pl, x), cz = wz(pl, y), s = y * 97 + x * 13;
      if (t === 'f') for (let k = 0; k < 3; k++) arbres.push({ x: cx + 0.18 + h(s + k) * 0.64, z: cz + 0.18 + h(s + k + 0.5) * 0.64, s: (0.75 + h(s + k * 3) * 0.45) * (planches ? 0.8 : 1), r: h(s + k * 7) * 6, t: 'bois' });
      else if (t === 'a') {
        const vert = 'a'.includes(pl.types[y - 1]?.[x] || '') || 'a'.includes(pl.types[y + 1]?.[x] || '');
        for (let k = 0; k < 6; k++) { const a = (k + 0.5) / 6; buissons.push({ x: cx + (vert ? 0.5 + (h(s + k) - 0.5) * 0.12 : a), z: cz + (vert ? a : 0.5 + (h(s + k) - 0.5) * 0.12), s: 0.95 + h(s + k * 5) * 0.35 }); }
        // arbres de haut jet plantés dans la haie (frênes, chênes), un tous les 0,9 case environ, qui la dépassent nettement
        const along = vert ? y : x, n0 = Math.floor(along / 0.9), n1 = Math.floor((along + 1) / 0.9);
        for (let k = n0 + 1; k <= n1; k++) { const a = k * 0.9 - along + (h(s + k) - 0.5) * 0.25; if (a < 0.05 || a > 0.95) continue; arbres.push({ x: cx + (vert ? 0.5 + (h(s + k * 3) - 0.5) * 0.08 : a), z: cz + (vert ? a : 0.5 + (h(s + k * 3) - 0.5) * 0.08), s: 0.85 + h(s + k * 5) * 0.3, r: h(s + k * 7) * 6, t: 'haie' }); }
      } else if (t === 'h' || t === 'r' || t === 'p') {
        const nb = t === 'h' ? 5 : 2;
        for (let k = 0; k < nb; k++) { const px = h(s + k * 1.7), pz = h(s + k * 2.3); if (t !== 'h' && Math.abs(px - 0.5) < 0.3 && Math.abs(pz - 0.5) < 0.3) continue; touffes.push({ x: cx + px, z: cz + pz, s: 0.8 + h(s + k) * 0.7, r: k }); }
      } else if (t === 'e') for (let k = 0; k < 3; k++) roseaux.push({ x: cx + h(s + k), z: cz + h(s + k + 0.3), r: h(s + k * 2) });
    }
    // Haies entre les champs (08/11, film) : continues le long des rangs ; en bout de rang, simples bouquets aux angles de case
    // pour laisser passer les machines, qui tournent au-delà du champ. Un arbre de temps en temps. Ce qu'un engin rencontre
    // malgré tout sur son axe s'ouvre à son passage (D.degager).
    const haies = new Map(), noter = (e, x, z) => { const k = Math.floor(z + H / 2) * W + Math.floor(x + W / 2); if (!haies.has(k)) haies.set(k, []); haies.get(k).push(e); };
    const typeC = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? pl.types[y][x] : '#', uniteC = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? pl.unite[y * W + x] : -9;
    const presFerme = (x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (typeC(x + i, y + j) === 'm') return true; return false; };
    const limite = (x, y, x2, y2) => {   // la limite sépare deux champs, ou un champ d'un pré libre loin de la ferme
      const c1 = typeC(x, y) === 'c' && uniteC(x, y) >= 0, c2 = typeC(x2, y2) === 'c' && uniteC(x2, y2) >= 0;
      if (c1 && c2) return uniteC(x, y) !== uniteC(x2, y2);
      const [cx, cy] = c1 ? [x2, y2] : [x, y]; return (c1 || c2) && typeC(cx, cy) === 'h' && !presFerme(cx, cy);
    };
    const buissonHaie = (px, pz, enZ, s, n) => { const b = { x: px, z: pz, s: (1.05 + h(s + 1) * 0.4) * (0.85 + 0.25 * Math.sin(n * 0.7 + s)), rot: (enZ ? Math.PI / 2 : 0) + (h(s + 2) - 0.5) * 0.5, sl: 1.1 + h(s + 3) * 0.3 }; noter({ b: buissons.length }, px, pz); buissons.push(b); };
    if (!planches) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const s = y * 131 + x * 37, X = wx(pl, x), Z = wz(pl, y);
      if (y + 1 < H && limite(x, y, x, y + 1) && h(s + 0.1) > 0.04) for (let k = 0; k < 3; k++) { const a = (k + 0.25 + h(s + k * 3) * 0.5) / 3; buissonHaie(X + a, Z + 1 + (h(s + k * 5) - 0.5) * 0.05, false, s + k * 11, x * 3 + k); }
      if (x + 1 < W && limite(x, y, x + 1, y)) for (const a of [0.03, 0.2, 0.8, 0.97]) buissonHaie(X + 1 + (h(s + a * 9) - 0.5) * 0.05, Z + a + (h(s + a * 13) - 0.5) * 0.05, true, s + a * 17, y * 3);
      const hori = y + 1 < H && limite(x, y, x, y + 1), vert = x + 1 < W && limite(x, y, x + 1, y);
      if ((hori || vert) && h(s + 0.77) < 0.2) {
        const a = { x: hori ? X + 0.2 + h(s + 7) * 0.6 : X + 1, z: hori ? Z + 1 : Z + (h(s + 7) < 0.5 ? 0.04 : 0.96), s: 0.62 + h(s + 8) * 0.3, r: h(s + 9) * 6, t: 'limite' };
        noter({ a: arbres.length, tronc: true }, a.x, a.z); arbres.push(a);
      }
    }
    const mArbre = K.matV({}, 0.04), mH = K.matV({}, 0.05), mT = K.matV({ side: T3.DoubleSide }, 0.8);
    D.troncs = K.inst(g, GA.tronc, K.matV(), arbres.length); D.houppiers = K.inst(g, GA.houppier, mArbre, arbres.length);
    D.troncs.userData.arbres = D.houppiers.userData.arbres = arbres;
    arbres.forEach((a, i) => { K.poser(D.troncs, i, [a.x, 0, a.z], [0, a.r, 0], a.s); K.poser(D.houppiers, i, [a.x, 0, a.z], [0, a.r, 0], a.s, '#4f8f3f'); });
    D.buissons = K.inst(g, GA.buisson, mH, buissons.length); D.buissons.userData.buissons = buissons; D.buissonsPos = buissons;
    buissons.forEach((b, i) => K.poser(D.buissons, i, [b.x, 0, b.z], [0, b.rot ?? i, 0], [b.s * (b.sl || 1), b.s * (0.9 + h(i) * 0.3), b.s], '#3a7a36'));
    D.touffes = K.inst(g, GA.touffe, mT, touffes.length, false);
    touffes.forEach((t, i) => K.poser(D.touffes, i, [t.x, 0, t.z], [0, t.r, 0], t.s, '#6aa84a'));
    if (roseaux.length) { const ro = K.inst(g, GA.roseau, K.matV({}, 0.5), roseaux.length); roseaux.forEach((r, i) => K.poser(ro, i, [r.x, 0, r.z], [(r.r - 0.5) * 0.3, 0, 0])); }
    // Un engin qui roule ouvre la haie sur son axe, pour de bon : les buissons s'effacent, les arbres ne cèdent que si leur tronc est sur la trace
    const VIDE = new T3.Matrix4().makeScale(0, 0, 0), sur = (e, x, z, c, sn, l, lat) => { const dx = e.x - x, dz = e.z - z, lon = dx * c + dz * sn, la = -dx * sn + dz * c; return Math.abs(la) < lat && lon > -l && lon < l + 0.35; };
    D.nbHaies = [...haies.values()].reduce((a, l) => a + l.length, 0);
    D.degager = (x, z, cap, l) => {
      if (!haies.size) return;
      const c = Math.cos(cap), sn = Math.sin(cap), cx = Math.floor(x + W / 2), cy = Math.floor(z + H / 2);
      for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) for (const e of haies.get(j * W + i) || []) {
        if (e.ouvert) continue;
        if (e.b != null && sur(buissons[e.b], x, z, c, sn, l, 0.12)) { e.ouvert = true; D.buissons.setMatrixAt(e.b, VIDE); D.buissons.instanceMatrix.needsUpdate = true; }
        else if (e.a != null && sur(arbres[e.a], x, z, c, sn, l, 0.07)) { e.ouvert = true; for (const m of [D.troncs, D.houppiers]) { m.setMatrixAt(e.a, VIDE); m.instanceMatrix.needsUpdate = true; } }
      }
    };
    D.arbres = arbres; D.nbBuissons = buissons.length; D.nbTouffes = touffes.length;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (pl.types[y][x] === 'e') {
      const m = new T3.Mesh(G.boite(1, 0.02, 1), K.mat('#4f8fc4', { roughness: 0.15, metalness: 0.1, flatShading: false })); m.position.set(wx(pl, x) + 0.5, 0.0, wz(pl, y) + 0.5); m.receiveShadow = true; m.userData.nom = { cle: `eau:${x}-${y}`, libelle: 'Mare' }; g.add(m);
    }
    // bâtiments : la ferme au carré sur l'emprise réelle, des maisons ailleurs
    D.ferme = null; const bati = new Set();
    let emprise = null;
    if (!planches && pl.ferme) emprise = { x: pl.ferme[0], y: pl.ferme[1], w: 4, h: 4 };
    else if (planches && pl.ferme) {
      // bloc de bâti qui contient la ferme : sa boîte englobante, carrée
      const pile = [pl.ferme[1] * W + pl.ferme[0]], vu = new Set(pile);
      for (let q = 0; q < pile.length; q++) { const i = pile[q], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (nx >= 0 && ny >= 0 && nx < W && ny < H && !vu.has(j) && pl.types[ny][nx] === 'b') { vu.add(j); pile.push(j); } } }
      let x0 = W, y0 = H, x1 = 0, y1 = 0; for (const i of vu) { const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); bati.add(i); }
      const c = Math.max(x1 - x0 + 1, y1 - y0 + 1); emprise = { x: (x0 + x1 + 1) / 2 - c / 2, y: (y0 + y1 + 1) / 2 - c / 2, w: c, h: c };
    }
    // Allée d'une porte jusqu'au réseau (07/11, relecture : « les chemins ne sont pas logiques », « le chemin passe sous
    // le champ ») : avant, l'allée filait vers le SOMMET de ligne le plus proche — souvent le carrefour de la route —,
    // en travers de l'herbe, d'un chemin, parfois d'un coin de champ. Maintenant : droit devant jusqu'à la première ligne
    // de route ou de chemin coupée, si l'on ne traverse que l'herbe et la ferme ; sinon par les cases d'herbe autour de la
    // ferme jusqu'à la case qui touche un chemin ou une route, puis perpendiculairement sur sa ligne.
    const reseauLignes = [...D.chemins, ...D.routes];
    const typeEn = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? pl.types[y][x] : '#';
    const caseDe = p => [Math.floor(p[0] + W / 2), Math.floor(p[1] + H / 2)];
    const PASSANT = planches ? 'hbmpr' : 'hmpr';
    const libreJusqua = (a, b) => { for (let k = 0; k <= 20; k++) { const [x, y] = caseDe([a[0] + (b[0] - a[0]) * k / 20, a[1] + (b[1] - a[1]) * k / 20]); if (!PASSANT.includes(typeEn(x, y))) return false; } return true; };
    function projeter(p) {
      let q = null, dm = 1e9;
      for (const c of reseauLignes) for (let i = 0; i + 1 < c.pts.length; i++) {
        const a = c.pts[i], b = c.pts[i + 1], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1e-9;
        const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)), x = a[0] + vx * u, z = a[1] + vz * u, d = Math.hypot(x - p[0], z - p[1]);
        if (d < dm) { dm = d; q = [x, z]; }
      }
      return q;
    }
    function versReseau(dep, dir) {
      let hit = null, tmin = 6;
      for (const c of reseauLignes) for (let i = 0; i + 1 < c.pts.length; i++) {
        const a = c.pts[i], b = c.pts[i + 1], ex = b[0] - a[0], ez = b[1] - a[1], den = dir.x * ez - dir.z * ex;
        if (Math.abs(den) < 1e-6) continue;
        const ax = a[0] - dep[0], az = a[1] - dep[1], t = (ax * ez - az * ex) / den, u = (ax * dir.z - az * dir.x) / den;
        if (t > 0.02 && t < tmin && u >= 0 && u <= 1) { tmin = t; hit = [dep[0] + dir.x * t, dep[1] + dir.z * t]; }
      }
      if (hit && libreJusqua(dep, hit)) return [hit];
      // par l'herbe : parcours en largeur, en essayant d'abord la direction de la porte
      const [x0, y0] = caseDe(dep), dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort((a, b) => (b[0] * dir.x + b[1] * dir.z) - (a[0] * dir.x + a[1] * dir.z));
      const touche = (x, y) => dirs.some(([dx, dy]) => 'pr'.includes(typeEn(x + dx, y + dy)));
      const prev = new Map([[y0 * W + x0, -1]]), file = [y0 * W + x0]; let but = -1;
      for (let q = 0; q < file.length && but < 0; q++) {
        const i = file[q], x = i % W, y = (i / W) | 0;
        if (typeEn(x, y) !== 'm' && touche(x, y)) { but = i; break; }
        for (const [dx, dy] of dirs) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (!prev.has(j) && PASSANT.replace('pr', '').includes(typeEn(nx, ny))) { prev.set(j, i); file.push(j); } }
      }
      if (but < 0) { const q = projeter(dep); return q && Math.hypot(q[0] - dep[0], q[1] - dep[1]) < 6 ? [q] : []; }
      const cs = []; for (let j = but; j !== -1; j = prev.get(j)) cs.push(j); cs.reverse();
      const centres = cs.slice(1).map(i => [wx(pl, i % W) + 0.5, wz(pl, (i / W) | 0) + 0.5]);
      const bout = centres.at(-1) || dep, q = projeter(bout);
      return [...centres, q || bout];
    }
    if (emprise) {
      const fg = new T3.Group(), cx = wx(pl, emprise.x + emprise.w / 2), cz = wz(pl, emprise.y + emprise.h / 2), s = emprise.w / 4;
      // le porche regarde le côté où passent les routes et les chemins les plus proches
      const cote = [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([dx, dy], k) => {
        let n = 0; for (let t = 0; t < 4 * emprise.w; t++) for (let r = 1; r <= 3; r++) {
          const u = t / 4, x = Math.floor(dx ? (dx > 0 ? emprise.x + emprise.w - 1 + r : emprise.x - r) : emprise.x + u), y = Math.floor(dy ? (dy > 0 ? emprise.y + emprise.h - 1 + r : emprise.y - r) : emprise.y + u);
          if (x >= 0 && y >= 0 && x < W && y < H && 'rp'.includes(pl.types[y][x])) n += 1 / r;
        }
        return n + (k === 0 ? 0.01 : 0);
      }).map((n, k, t) => ({ k, n: t[(k + 1) % 4] + 0.6 * n })).sort((a, b) => b.n - a.n)[0].k;   // la grange regarde le côté suivant celui du porche
      fg.position.set(cx, 0, cz); fg.rotation.y = [0, Math.PI / 2, Math.PI, -Math.PI / 2][cote]; fg.scale.setScalar(s); g.add(fg); fg.updateMatrixWorld(true);
      const A = ferme(fg);
      for (const l of A.lignes) { l.lookAt(fg.localToWorld(l.userData.vise.clone())); }
      D.ferme = Object.assign(A, { groupe: fg, emprise, s, cx, cz, cote }); fg.userData.ferme = true;
      // allée du porche jusqu'à la première route ou au premier chemin, droit devant (voir versReseau)
      const porche = fg.localToWorld(A.porche.clone()), dir = new T3.Vector3(0, 0, 1).applyAxisAngle(new T3.Vector3(0, 1, 0), fg.rotation.y);
      const sortie = [porche.x + dir.x * 0.3 * s, porche.z + dir.z * 0.3 * s];
      const pts = [[porche.x, porche.z], sortie, ...versReseau(sortie, dir)];
      const allee = new T3.Mesh(ruban(chaikin(pts), 0.22 * s, 0.01), K.matT(tx.chemin, { roughness: 1, flatShading: false })); allee.receiveShadow = true; allee.userData.nom = { cle: 'batiment:allee', libelle: 'Ferme · allée' }; g.add(allee);
      D.allee = pts;
      // chemin de terre devant la porte charretière, jusqu'à la route ou au chemin le plus proche
      const L = (q, y = 0) => fg.localToWorld(new T3.Vector3(q[0], y, q[1])), sw = L(A.voies.seuil), dw = L(A.voies.dehors), dg = new T3.Vector3().subVectors(dw, sw).normalize();
      const pg = [[sw.x, sw.z], [dw.x, dw.z], ...versReseau([dw.x, dw.z], dg)];
      const pa = L(A.voies.porte), ag = new T3.Mesh(ruban(chaikin([[pa.x, pa.z], ...pg]), 0.2 * s, 0.0095),   /* dessiné jusqu'à la porte ; les machines suivent pg */ K.matT(tx.chemin, { roughness: 1, flatShading: false })); ag.receiveShadow = true; ag.userData.nom = { cle: 'batiment:allee-grange', libelle: 'Ferme · chemin de la grange' }; g.add(ag);
      D.alleeGrange = pg;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (pl.types[y][x] !== 'b' || bati.has(y * W + x)) continue;
      const J = jardinDe.get(y * W + x);
      if (J) {
        const [mx, mz] = J.monde(0, 0.07);
        const ma = maison(g, mx, mz, J.a, 1, h(x + y * 3) < 0.4); ma.userData.nom = { cle: `batiment:maison-${x}-${y}`, libelle: 'Maison' }; D.toitsMaisons.push(ma.userData.toit);
        jardin(g, J);
        continue;
      }
      // sans route voisine (planches) : la porte regarde la route ou le chemin le plus proche, de face
      const vers = [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]].find(([dx, dy]) => 'rp'.includes(typeCase(x + dx, y + dy)));
      const rv = vers ? vers[2] : ('rp'.includes(pl.types[y + 1]?.[x] || '') || 'rp'.includes(pl.types[y - 1]?.[x] || '') ? 0 : Math.PI / 2);
      const ma = maison(g, wx(pl, x) + 0.5, wz(pl, y) + 0.5, rv, planches ? 1.25 : 1, h(x + y * 3) < 0.4); ma.userData.nom = { cle: `batiment:maison-${x}-${y}`, libelle: 'Maison' }; D.toitsMaisons.push(ma.userData.toit);
    }
    D.maj = (doy, sec, neige) => saison(D, doy, sec, neige);
    return D;
  }
  // Feuillages et herbe de la saison ; un peu de neige sur les houppiers et les toits
  function saison(D, doy, sec, neige) {
    const fe = couleursFeuillage(doy).map(K.col), s = couleursSaison(doy, sec), herbe = K.col(s.h), haute = K.col(s.c), blanc = K.col('#f2f6fa'), c = new T3.Color();
    D.arbres.forEach((a, i) => { c.copy(fe[i % 3 === 0 ? 1 : 0]).lerp(fe[2], (i % 5) / 9).lerp(blanc, neige * 0.45); D.houppiers.setColorAt(i, c); });
    if (D.arbres.length) D.houppiers.instanceColor.needsUpdate = true;
    for (let i = 0; i < D.nbBuissons; i++) { c.copy(fe[i % 2]).lerp(fe[2], 0.35).lerp(blanc, neige * 0.5); D.buissons.setColorAt(i, c); }
    if (D.nbBuissons) D.buissons.instanceColor.needsUpdate = true;
    for (let i = 0; i < D.nbTouffes; i++) { c.copy(i % 3 ? haute : herbe).lerp(blanc, neige * 0.8); D.touffes.setColorAt(i, c); }
    if (D.nbTouffes) D.touffes.instanceColor.needsUpdate = true;
    D.fond.material.color.copy(herbe).multiplyScalar(0.82).lerp(blanc, neige * 0.85);
    const toits = [...(D.ferme ? D.ferme.toits : []), ...(D.toitsMaisons || [])];
    for (const m of toits) { const k = Math.min(0.85, neige); m.color.setRGB(1 - 0.45 * k, 1 - 0.42 * k, 1 - 0.38 * k); m.emissive.setRGB(0.42 * k, 0.44 * k, 0.47 * k); }
    return { herbe, haute };
  }
  return { construire, surLigne, longueur, chaikin, simplifier, ruban, geoArbres, textures, wx, wz };
})();
