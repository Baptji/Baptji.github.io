// ============ Formation des roches : étapes animées (C.2, 17/09/2026) ============
// Chargé après formation.js, avant app.js. Une scène animée par étape, 8 secondes chacune, enchaînées en fondu ;
// une barre par étape au-dessus de la scène ; lecture seulement quand le panneau est à l'écran.
// Données : ROCHES_F[id].anim = [{ court, titre, quand, duree, scene, p }] (formation.js), lues par Formation.animation.
// Scène : SCENES[nom](p, roche) → { fond, anim(t, ta) → SVG, devant? } ; fond et devant sont posés une fois, anim est
// redessiné : t = progression de l'étape (0 → 1, FIGÉE pendant les 4 dernières secondes), ta = secondes écoulées depuis
// le début de l'étape, qui continue de tourner pendant ces 4 secondes (pluie, courant, vagues…). La DERNIÈRE étape reste
// figée 10 s de plus avant de reboucler (demande du 18/09/2026). Scène de 480 × 240.
// API : FormationAnim.monter(el, roche, { lien: élément .fc du diagramme de conditions }) ; FormationAnim.SCENES.
(function () {
  "use strict";
  if (!window.Formation || !Formation._outils) return;
  const { alea, couleursMin } = Formation._outils;

  // 16 s par étape : 12 s d'animation puis 4 s figées sur l'image finale (demande du 17/09/2026)
  // la dernière étape reste figée 10 s de plus (FIGE_FIN) avant de revenir à la première (demande du 18/09/2026)
  const W = 480, H = 240, FENETRE = 16000, FIGE = 4000, ANIM = FENETRE - FIGE, FIGE_FIN = 10000, FONDU = 1000, PAS_IMAGE = 33;

  // ─────────────────────────────── utilitaires ───────────────────────────────
  const r1 = (x) => Math.round(x * 10) / 10;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lisse = (t) => t * t * (3 - 2 * t);
  const fen = (t, a, b) => lisse(clamp((t - a) / (b - a))); // 0 → 1 entre a et b
  const attrs = (o) => Object.entries(o || {}).map(([k, v]) => v == null ? "" : ` ${k}="${v}"`).join("");
  const P = (l) => l.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
  const rect = (x, y, w, h, f, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" fill="${f}"${attrs(o)}/>`;
  const poly = (l, f, o) => `<polygon points="${P(l)}" fill="${f}"${attrs(o)}/>`;
  const pline = (l, c, sw, o) => `<polyline points="${P(l)}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${attrs(o)}/>`;
  const circ = (x, y, r, f, o) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${f}"${attrs(o)}/>`;
  const ell = (x, y, rx, ry, f, o) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${f}"${attrs(o)}/>`;
  const line = (x1, y1, x2, y2, c, sw, o) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"${attrs(o)}/>`;
  const txt = (x, y, s, o = {}) => `<text x="${r1(x)}" y="${r1(y)}" class="fa-lab${o.petit ? " fa-petit" : ""}${o.clair ? " fa-clair" : ""}"${o.a ? ` text-anchor="${o.a}"` : ""}${o.op != null ? ` opacity="${r1(o.op * 100) / 100}"` : ""}>${s}</text>`;
  let uid = 0;
  const nid = (p) => `fa${p}${++uid}`;
  const op = (x) => Math.round(clamp(x) * 100) / 100;

  function melange(a, b, t) {
    const v = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = v(a), B = v(b);
    return "#" + A.map((x, i) => Math.round(x + (B[i] - x) * clamp(t)).toString(16).padStart(2, "0")).join("");
  }
  // hauteur d'un profil [[x, y]…] (x croissants) en x
  function hauteur(profil, x) {
    if (x <= profil[0][0]) return profil[0][1];
    for (let i = 1; i < profil.length; i++) {
      const [x2, y2] = profil[i];
      if (x <= x2) { const [x1, y1] = profil[i - 1]; return lerp(y1, y2, (x - x1) / (x2 - x1)); }
    }
    return profil[profil.length - 1][1];
  }
  // courbe lissée (Catmull-Rom) passant par les points
  function courbe(pts, n = 8) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // position et direction à la fraction u (0–1) de la longueur d'une polyligne
  function lePlong(pts, u) {
    if (!pts._L) { let L = 0; pts._c = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); pts._c.push(L); } pts._L = L; }
    const d = clamp(u) * pts._L;
    let i = 1;
    while (i < pts.length - 1 && pts._c[i] < d) i++;
    const seg = pts._c[i] - pts._c[i - 1] || 1, f = (d - pts._c[i - 1]) / seg;
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    return { x: lerp(x1, x2, f), y: lerp(y1, y2, f), a: Math.atan2(y2 - y1, x2 - x1) };
  }
  // bandeau de part et d'autre d'une ligne (largeur variable)
  function ruban(pts, largeur) {
    const g = [], d = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), w = typeof largeur === "function" ? largeur(i / (pts.length - 1)) : largeur;
      g.push([p[0] + Math.sin(ang) * w / 2, p[1] - Math.cos(ang) * w / 2]);
      d.push([p[0] - Math.sin(ang) * w / 2, p[1] + Math.cos(ang) * w / 2]);
    });
    return g.concat(d.reverse());
  }
  function decale(pts, dec) {
    return pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      return [p[0] + Math.sin(ang) * dec, p[1] - Math.cos(ang) * dec];
    });
  }
  // cellules de Voronoï dans un rectangle (découpe par demi-plans) : cristaux jointifs, ciment
  function voronoi(sites, x0, y0, x1, y1) {
    return sites.map(([sx, sy], i) => {
      let pg = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      sites.forEach(([tx, ty], j) => {
        if (j === i || Math.hypot(tx - sx, ty - sy) > 140) return;
        const nx = tx - sx, ny = ty - sy, c = (tx * tx + ty * ty - sx * sx - sy * sy) / 2;
        const out = [];
        for (let k = 0; k < pg.length; k++) {
          const A = pg[k], B = pg[(k + 1) % pg.length];
          const da = A[0] * nx + A[1] * ny - c, db = B[0] * nx + B[1] * ny - c;
          if (da <= 0) out.push(A);
          if (da * db < 0) { const f = da / (da - db); out.push([lerp(A[0], B[0], f), lerp(A[1], B[1], f)]); }
        }
        pg = out;
      });
      return pg;
    });
  }
  const centre = (pg) => pg.reduce((s, [x, y]) => [s[0] + x / pg.length, s[1] + y / pg.length], [0, 0]);
  const echelle = (pg, [cx, cy], k) => pg.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
  // grain : contour anguleux (k coins) qui s'arrondit quand `rond` va de 0 à 1
  function formeGrain(R, r, k = 6, allonge = 0.85) {
    const coins = [];
    for (let i = 0; i < k; i++) {
      const a = (i + (R() - 0.5) * 0.6) / k * Math.PI * 2, d = r * (0.82 + R() * 0.3);
      coins.push([Math.cos(a) * d, Math.sin(a) * d * allonge]);
    }
    const ang = [], rnd = [];
    for (let i = 0; i < k; i++) {
      const A = coins[i], B = coins[(i + 1) % k];
      for (let s = 0; s < 4; s++) {
        const x = lerp(A[0], B[0], s / 4), y = lerp(A[1], B[1], s / 4), a = Math.atan2(y / allonge, x);
        ang.push([x, y]);
        rnd.push([Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86 * allonge]);
      }
    }
    return (rond, x = 0, y = 0, rot = 0) => {
      const c = Math.cos(rot), s = Math.sin(rot);
      return ang.map(([ax, ay], i) => {
        const px = lerp(ax, rnd[i][0], rond), py = lerp(ay, rnd[i][1], rond);
        return [x + px * c - py * s, y + px * s + py * c];
      });
    };
  }
  // flèche droite (pointe dessinée)
  function fleche(x1, y1, x2, y2, o = {}) {
    const c = o.c || "#27302d", sw = o.sw || 1.8, t = o.pointe || 6;
    const a = Math.atan2(y2 - y1, x2 - x1), bx = x2 - Math.cos(a) * t, by = y2 - Math.sin(a) * t;
    const n = [Math.cos(a + Math.PI / 2) * t * 0.55, Math.sin(a + Math.PI / 2) * t * 0.55];
    return `<g${o.op != null ? ` opacity="${op(o.op)}"` : ""}>${line(x1, y1, bx, by, c, sw)}${poly([[x2, y2], [bx + n[0], by + n[1]], [bx - n[0], by - n[1]]], c)}</g>`;
  }

  // ─────────────────────────────── décors ───────────────────────────────
  function degrade(haut, bas, vertical = true) {
    const k = nid("g");
    return { def: `<linearGradient id="${k}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient>`, url: `url(#${k})` };
  }
  function ciel(h = H) {
    const g = degrade("#b9d6e8", "#edf4f7");
    return `<defs>${g.def}</defs>` + rect(0, 0, W, h, g.url);
  }
  function nuage(x, y, e = 1) {
    return `<g opacity=".97">${ell(x, y, 20 * e, 8 * e, "#fff")}${ell(x - 15 * e, y + 3 * e, 12 * e, 6 * e, "#fff")}${ell(x + 15 * e, y + 3 * e, 14 * e, 6 * e, "#fff")}${ell(x + 2 * e, y - 5 * e, 11 * e, 7 * e, "#fff")}</g>`;
  }
  function soleil(x, y, r = 11) {
    return circ(x, y, r + 7, "#f6d77a", { opacity: 0.35 }) + circ(x, y, r, "#f2b632");
  }
  // végétation posée SUR un profil (24/09/2026 : les arbres « flottaient » au-dessus du dôme, en paquets) : un liseré d'herbe
  // qui suit la surface, des arbres répartis régulièrement (écart tiré au hasard autour d'un pas), pied enfoncé dans le sol,
  // tailles variées, feuillus et conifères, et rien sur les pentes trop raides. surf(x) = y du sol ; x0, x1 = étendue.
  function vegetation(surf, x0, x1, R, o = {}) {
    const pas = o.pas || 16, pente = o.pente || 1.1, e = o.echelle || 1;
    let herbe = [];
    for (let x = x0; x <= x1; x += 3) herbe.push([x, surf(x) + 0.4]);
    let s = pline(herbe, "#5f8f45", 2.2);
    for (let x = x0 + pas * (0.3 + R() * 0.5); x < x1 - 3; x += pas * (0.65 + R() * 0.7)) {
      const y = surf(x), dy = (surf(x + 2) - surf(x - 2)) / 4;
      if (Math.abs(dy) > pente) continue;
      const h = (6 + R() * 4) * e, conif = R() < (o.coniferes ?? 0.3);
      s += rect(x - 0.7 * e, y - h * 0.45, 1.4 * e, h * 0.45 + 1.5, "#6b4f35");
      s += conif ? poly([[x, y - h - 1.5], [x - h * 0.34, y - h * 0.3], [x + h * 0.34, y - h * 0.3]], "#3f6b3a")
        : ell(x, y - h * 0.62, h * 0.36, h * 0.42, R() < 0.5 ? "#4f7d3c" : "#5d8a45");
    }
    return o.op != null ? `<g opacity="${op(o.op)}">${s}</g>` : s;
  }
  // pluie qui tombe (lignes courtes), t = temps de l'étape
  function pluie(x0, y0, w, h, ta, n, graine) {
    const R = alea(graine);
    let s = "";
    for (let i = 0; i < n; i++) {
      const px = x0 + R() * w, ph = R(), u = (ta * 0.63 + ph) % 1, y = y0 + u * h;
      s += line(px - u * 8, y, px - u * 8 - 2, y + 7, "#5b95c6", 1.1, { opacity: op(Math.min(u * 8, (1 - u) * 8, 1)) });
    }
    return s;
  }
  // loupe : cône vers le point observé, disque, contenu découpé ; bord à poser par-dessus le contenu animé
  function loupe(cx, cy, r, o = {}) {
    const k = nid("l");
    let fond = "";
    if (o.vers) {
      const [x, y] = o.vers, d = Math.hypot(x - cx, y - cy), phi = Math.atan2(y - cy, x - cx), b = Math.acos(Math.min(1, r / d));
      fond += poly([[x, y], [cx + Math.cos(phi + b) * r, cy + Math.sin(phi + b) * r], [cx + Math.cos(phi - b) * r, cy + Math.sin(phi - b) * r]], "rgba(255,255,255,.4)")
        + circ(x, y, 5, "none", { stroke: "#27302d", "stroke-width": 1.2 });
    }
    fond += `<clipPath id="${k}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` + circ(cx, cy, r + 3, "#fff") + circ(cx, cy, r, o.fond || "#f4f1ea");
    return {
      fond,
      dans: (contenu) => `<g clip-path="url(#${k})">${contenu}</g>`,
      bord: circ(cx, cy, r + 1.5, "none", { stroke: "#27302d", "stroke-width": 1.4 }),
    };
  }
  // cartouche de légende (fond blanc) : lignes [couleur | null, texte]
  function cartouche(x, y, w, lignes, o = {}) {
    const h = 12 + lignes.length * 13;
    let s = rect(x, y, w, h, "rgba(255,255,255,.88)", { rx: 6, stroke: "rgba(0,0,0,.12)" });
    lignes.forEach(([c, t, extra], i) => {
      const yy = y + 15 + i * 13;
      if (c) s += rect(x + 8, yy - 8, 10, 10, c, Object.assign({ rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }, extra || {}));
      s += `<text x="${x + (c ? 23 : 8)}" y="${yy}" class="fa-leg">${t}</text>`;
    });
    return o.op != null ? `<g opacity="${op(o.op)}">${s}</g>` : s;
  }

  // compteur d'âge : « il y a 452 millions d'années » (ou « aujourd'hui »)
  function compteur(x, y, age, o = {}) {
    const v = age < 10 ? String(Math.round(age * 10) / 10).replace(".", ",") : nombre(age);
    const txtAge = o.libelle || (age <= 0.05 ? "aujourd'hui" : `il y a ${v} million${age < 1.95 ? "" : "s"} d'années`);
    const w = txtAge.length * 4.15 + 16;
    const wl = Math.max(w, o.sous ? o.sous.length * 4.2 : 0);
    x = clamp(x, wl / 2 + 4, W - 4 - wl / 2);                      // le cartouche (et sa légende) reste dans le cadre
    return rect(x - w / 2, y - 10, w, 19, "rgba(255,255,255,.9)", { rx: 5, stroke: "rgba(0,0,0,.14)" })
      + `<text x="${r1(x)}" y="${r1(y + 3.5)}" text-anchor="middle" class="fa-lab" style="stroke:none">${txtAge}</text>`
      + (o.sous ? `<text x="${r1(x)}" y="${r1(y + 20)}" text-anchor="middle" class="fa-leg">${o.sous}</text>` : "");
  }
  const nombre = (v) => Math.round(v).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");

  const MIN = { quartz: "#ebe7de", feldspath: "#e6b39a", biotite: "#3f3229", argile: "#c9b08c", oxyde: "#b0703a",
    eau: "#cfe4ef", pore: "#8fc3e4", sable: "#e4cc92", sableFonce: "#d2b479" };

  // ─────────────────────────────── scènes détritiques (prototype : grès) ───────────────────────────────
  const SCENES = {};

  // 1 · un vieux massif s'altère (loupe : feldspaths et biotite → argiles, le quartz reste) et s'érode
  SCENES.erosionMassif = function (p) {
    const R = alea("em" + p.graine);
    const profil0 = [[0, 150], [26, 128], [54, 104], [76, 96], [98, 76], [122, 58], [140, 64], [156, 54], [178, 72], [206, 102], [236, 138], [262, 168], [282, 186], [300, 193], [480, 196]];
    const abaisse = (t) => profil0.map(([x, y]) => [x, y + Math.max(0, 190 - y) / 136 * 14 * t]);
    const L = loupe(394, 96, 68, { fond: MIN.eau });
    const sites = [];
    for (let gy = 26; gy < 180; gy += 29) for (let gx = 318; gx < 474; gx += 29) sites.push([gx + (R() - 0.5) * 16 + (Math.round(gy / 29) % 2 ? 14 : 0), gy + (R() - 0.5) * 14]);
    const cellules = voronoi(sites, 316, 24, 472, 170).map((pg) => {
      const x = R(), c = centre(pg);
      return { pg, c, min: x < 0.34 ? "quartz" : x < 0.84 ? "feldspath" : "biotite", ph: R() * 0.25,
        taches: Array.from({ length: 4 }, () => [(R() - 0.5) * 14, (R() - 0.5) * 12, 1.6 + R() * 2]), angle: R() * Math.PI };
    });
    const diaclases = Array.from({ length: 46 }, () => {
      const x = R() * 330, y = 70 + R() * 170, l = 8 + R() * 14, a = (R() < 0.5 ? 1.2 : 1.95) + (R() - 0.5) * 0.2;
      return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l];
    });
    const boules = [[62, 3.6], [84, 2.8], [132, 3.2], [198, 3.4], [222, 2.6]];
    const arbresX = Array.from({ length: 8 }, (_, i) => 214 + i * 8 + R() * 4);
    const grainsChute = Array.from({ length: 16 }, () => ({ ph: R(), r: 2 + R() * 1.8, c: [MIN.quartz, MIN.feldspath, "#8a7d70", MIN.quartz][Math.floor(R() * 4)], k: formeGrain(R, 1, 5) }));
    const roc = degrade("#c2b6a8", "#8f8378"), clip = nid("mc");
    const fond = ciel() + `<defs>${roc.def}</defs>` + poly([[0, 176], [60, 158], [140, 166], [230, 150], [330, 164], [420, 152], [480, 160], [480, 240], [0, 240]], "#c6d3d6")
      + rect(0, 192, W, 48, "#9fb77a") + L.fond;
    return {
      fond,
      anim(t, ta) {
        const pr = abaisse(t), contour = [...pr, [480, 240], [0, 240]];
        const pointe = [188, hauteur(pr, 188) + 16];
        let s = nuage(58 + 4.2 * ta, 30) + nuage(210 + 3 * ta, 20, 0.8);
        s += pluie(34 + 4.2 * ta, 40, 60, 70, ta, 16, "p1" + p.graine) + pluie(190 + 3 * ta, 30, 50, 60, ta, 12, "p2" + p.graine);
        s += `<clipPath id="${clip}"><polygon points="${P(contour)}"/></clipPath>` + poly(contour, roc.url);
        s += `<g clip-path="url(#${clip})" stroke="rgba(60,50,40,.22)" stroke-width="1">${diaclases.map(([a, b, c, d]) => line(a, b, c, d, "rgba(60,50,40,.28)", 0.9)).join("")}</g>`;
        s += pline(pr.filter(([x]) => x < 350), "#6f6358", 1.3);
        for (const [x, r] of boules) { const y = hauteur(pr, x); s += ell(x, y - r * 0.8, r * 1.5, r, "#b3a697", { stroke: "#6f6358", "stroke-width": 0.8 }); }
        // arène (sable d'altération) au pied, qui s'épaissit
        const rx = lerp(20, 42, t), ry = lerp(4, 10, t);
        s += `<path d="M${r1(278 - rx)} 194 Q278 ${r1(194 - ry * 2)} ${r1(278 + rx)} 194 Z" fill="#d9c294" stroke="#b79f72" stroke-width=".8"/>`;
        for (const x of arbresX) { const y = hauteur(pr, x) + 2; s += rect(x - 0.7, y - 5, 1.4, 5, "#6b4f35") + ell(x, y - 8, 3.6, 4.6, "#5d8a45"); }
        for (const g of grainsChute) {
          const u = (g.ph + ta * 0.175) % 1, x = lerp(160, 272, u), y = hauteur(pr, x) - g.r - Math.abs(Math.sin(u * Math.PI * 5)) * 3;
          s += poly(g.k(0, 0, 0, u * 12).map(([a, b]) => [x + a * g.r, y + b * g.r]), g.c, { stroke: "rgba(0,0,0,.45)", "stroke-width": 0.5, opacity: op(Math.min(u * 10, (1 - u) * 10, 1)) });
        }
        s += txt(16, 226, p.labMassif || "vieux massif (granites, gneiss)", { clair: true });
        // cône de la loupe vers la surface altérée
        const [px, py] = pointe, d = Math.hypot(px - 394, py - 96), phi = Math.atan2(py - 96, px - 394), b = Math.acos(68 / d);
        s += poly([[px, py], [394 + Math.cos(phi + b) * 68, 96 + Math.sin(phi + b) * 68], [394 + Math.cos(phi - b) * 68, 96 + Math.sin(phi - b) * 68]], "rgba(255,255,255,.45)")
          + circ(px, py, 5, "rgba(255,255,255,.35)", { stroke: "#27302d", "stroke-width": 1.3 });
        let dd = "";
        for (const c of cellules) {
          if (c.min === "quartz") { dd += poly(c.pg, MIN.quartz, { stroke: "#8f887c", "stroke-width": 0.8 }); continue; }
          const a = fen(t, 0.1 + c.ph, 0.85 + c.ph * 0.4);
          const pg = echelle(c.pg, c.c, lerp(1, c.min === "feldspath" ? 0.78 : 0.82, fen(t, 0.35 + c.ph, 1)));
          if (c.min === "feldspath") {
            dd += poly(pg, melange(MIN.feldspath, MIN.argile, a), { stroke: "#8f887c", "stroke-width": 0.8 });
            c.taches.forEach(([dx, dy, rr], i) => { dd += ell(c.c[0] + dx, c.c[1] + dy, rr * 1.4, rr, "#b39776", { opacity: op(fen(t, 0.15 + i * 0.12 + c.ph, 0.45 + i * 0.12 + c.ph)) }); });
          } else {
            dd += poly(pg, melange(MIN.biotite, MIN.oxyde, a), { stroke: "#5a4a3c", "stroke-width": 0.8 });
            for (let i = -2; i <= 2; i++) {
              const cx = c.c[0] + Math.cos(c.angle + Math.PI / 2) * i * 4, cy = c.c[1] + Math.sin(c.angle + Math.PI / 2) * i * 4;
              dd += line(cx - Math.cos(c.angle) * 9, cy - Math.sin(c.angle) * 9, cx + Math.cos(c.angle) * 9, cy + Math.sin(c.angle) * 9, "rgba(255,255,255,.28)", 0.8);
            }
          }
        }
        s += L.dans(dd) + L.bord;
        // légende : chaque pastille prend la couleur que le minéral a EN CE MOMENT dans la loupe
        const aMoy = fen(t, 0.22, 0.9);
        s += cartouche(312, 170, 164, [[MIN.quartz, "quartz : il résiste"],
          [melange(MIN.feldspath, MIN.argile, aMoy), "feldspath → argile"],
          [melange(MIN.biotite, MIN.oxyde, aMoy), "biotite → argile + oxydes"]]);
        return s;
      },
    };
  };

  // 2 · transport par une rivière : les grains s'arrondissent et se trient (les gros s'arrêtent en amont)
  SCENES.transportRiviere = function (p) {
    const R = alea("tr" + p.graine);
    const axe = courbe([[-12, 58], [50, 62], [104, 74], [140, 100], [152, 132], [182, 160], [246, 172], [326, 168], [396, 180], [492, 196]], 10);
    const largeur = (u) => lerp(14, 30, u);
    const n = axe.length - 1;
    const berges = ruban(axe, (u) => largeur(u) + 12), eau = ruban(axe, largeur);
    const courants = [-0.26, 0, 0.26].map((k) => axe.map((pt, i) => decale([axe[Math.max(0, i - 1)], pt, axe[Math.min(n, i + 1)]], k * largeur(i / n))[1]));
    const classes = [{ r: 5.6, v: 0.45, max: 0.36 }, { r: 3.8, v: 0.75, max: 0.72 }, { r: 2.6, v: 1.1, max: 1 }];
    const grains = Array.from({ length: 33 }, (_, i) => ({ ...classes[i % 3], ph: R(), dec: (R() - 0.5) * 0.55, feld: R() < 0.3, k: formeGrain(R, 1, 5) }));
    const galets = Array.from({ length: 16 }, () => {
      const q = lePlong(axe, 0.04 + R() * 0.3), cote = R() < 0.5 ? -1 : 1, w = largeur(0.2) / 2 + 3 + R() * 4;
      return [q.x + Math.sin(q.a) * w * cote, q.y - Math.cos(q.a) * w * cote, 2.5 + R() * 3, R() < 0.5 ? "#a39b8e" : "#c2b8a6"];
    });
    // deux zooms : ce qu'on trouve en amont, ce qui reste en aval
    const qAm = lePlong(axe, 0.1), qAv = lePlong(axe, 0.86);
    const Lam = loupe(214, 62, 46, { vers: [qAm.x, qAm.y], fond: "#a9cbdf" });
    const Lav = loupe(398, 78, 48, { vers: [qAv.x, qAv.y], fond: "#a9cbdf" });
    const amont = (() => {
      let d = "";
      for (let i = 0; i < 6; i++) { const f = formeGrain(R, 1, 6); const x = 180 + R() * 70, y = 30 + R() * 64, r = 8 + R() * 6;
        d += poly(f(0.65, 0, 0).map(([a, b]) => [x + a * r, y + b * r]), ["#a39b8e", "#b9ae9c", "#8e8578"][Math.floor(R() * 3)], { stroke: "rgba(0,0,0,.4)", "stroke-width": 0.7 }); }
      for (let i = 0; i < 26; i++) { const f = formeGrain(R, 1, 5); const x = 172 + R() * 86, y = 22 + R() * 80, r = 1.6 + R() * 4;
        d += poly(f(0.12, 0, 0).map(([a, b]) => [x + a * r, y + b * r]), [MIN.quartz, MIN.feldspath, "#8a7d70"][Math.floor(R() * 3)], { stroke: "rgba(0,0,0,.4)", "stroke-width": 0.5 }); }
      return d;
    })();
    const aval = (() => {
      let d = "";
      for (let gy = 34; gy < 126; gy += 10) for (let gx = 352; gx < 448; gx += 10) {
        const f = formeGrain(R, 1, 6), r = 3.4 + R() * 0.7, dx = (R() - 0.5) * 3, dy = (R() - 0.5) * 3;
        d += poly(f(0.95, 0, 0).map(([a, b]) => [gx + dx + a * r, gy + dy + b * r]), R() < 0.12 ? "#e2d3ae" : MIN.quartz, { stroke: "rgba(0,0,0,.35)", "stroke-width": 0.5 });
      }
      return d;
    })();
    const fond = ciel(44) + poly([[0, 44], [70, 34], [150, 40], [240, 30], [330, 40], [420, 32], [480, 38], [480, 60], [0, 60]], "#b9c9b8")
      + (() => { const g = degrade("#b8cf8c", "#8fb069"); return `<defs>${g.def}</defs>` + rect(0, 50, W, 190, g.url); })()
      + poly(berges, "#dccb9c") + poly(eau, "#79b3d6")
      + galets.map(([x, y, r, c]) => ell(x, y, r, r * 0.75, c, { stroke: "rgba(0,0,0,.3)", "stroke-width": 0.5 })).join("");
    // une loupe qui apparaît : elle grandit depuis son centre
    const apparait = (cx, cy, contenu, k) => k <= 0.01 ? "" : `<g opacity="${op(k)}" transform="translate(${r1(cx)} ${r1(cy)}) scale(${r1(lerp(0.75, 1, k))}) translate(${r1(-cx)} ${r1(-cy)})">${contenu}</g>`;
    return {
      fond,
      anim(t, ta) {
        let s = courants.map((c, k) => pline(c, "#ffffff", 1.2, { opacity: 0.55, "stroke-dasharray": "9 20", "stroke-dashoffset": r1(-(ta * 45 + k * 9)) })).join("");
        for (const g of grains) {
          const u = ((g.ph + ta * g.v * 0.125) % 1) * g.max, q = lePlong(axe, u), w = largeur(u);
          const x = q.x + Math.sin(q.a) * g.dec * w, y = q.y - Math.cos(q.a) * g.dec * w;
          const vis = Math.min(u / g.max * 12, (1 - u / g.max) * 12, 1) * (g.feld ? 1 - u : 1);
          if (vis <= 0.02) continue;
          const pts = g.k(clamp(u * 1.3), 0, 0, u * 40).map(([a, b]) => [x + a * g.r, y + b * g.r]);
          s += poly(pts, g.feld ? MIN.feldspath : MIN.quartz, { stroke: "rgba(0,0,0,.45)", "stroke-width": 0.5, opacity: op(vis) });
        }
        const kAm = fen(t, 0.12, 0.26), kAv = fen(t, 0.54, 0.68);
        s += apparait(214, 62, Lam.fond + Lam.dans(amont) + Lam.bord
          + txt(214, 120, "amont : galets et grains", { a: "middle", petit: true }) + txt(214, 131, "anguleux, de toutes tailles", { a: "middle", petit: true }), kAm);
        s += apparait(398, 78, Lav.fond + Lav.dans(aval) + Lav.bord
          + txt(398, 140, "aval : sable fin,", { a: "middle", petit: true }) + txt(398, 151, "trié et bien arrondi", { a: "middle", petit: true }), kAv);
        return s;
      },
    };
  };

  // 3 · dépôt du sable en lits sur une plateforme marine peu profonde (l'accumulation ne se fait que sous l'eau)
  SCENES.depotPlateforme = function (p) {
    const R = alea("dp" + p.graine);
    const MER = 66, RIVAGE = 96;
    // fond marin avant le dépôt : plage émergée, puis pente douce vers le large
    const fondMarin = courbe([[0, 50], [40, 54], [RIVAGE, MER], [150, 124], [200, 160], [300, 178], [400, 192], [480, 200]], 8);
    const base = (x) => hauteur(fondMarin, x);
    // épaisseur : nulle au rivage, maximale au large ; jamais au-dessus de l'eau
    const epaisseur = (x, t) => lerp(1, 38, t) * clamp((x - RIVAGE - 10) / 110);
    const dessus = (x, t, ta = 0) => base(x) - epaisseur(x, t) + (epaisseur(x, t) > 3 ? 1.4 * Math.sin(x * 0.34 - ta * 0.38) : 0);
    const chutes = Array.from({ length: 44 }, () => ({ x: 120 + R() * 350, ph: R(), r: 1.1 + R() * 0.9 }));
    const eauG = degrade("#8cc2de", "#3f7fac");
    const fond = ciel(MER) + soleil(438, 26) + `<defs>${eauG.def}</defs>` + rect(0, MER - 2, W, H - MER + 2, eauG.url)
      + poly([...fondMarin, [W, H], [0, H]], "#7b8074")
      + poly([[0, 44], [44, 47], [RIVAGE, MER], [0, MER]], "#e2cd98")
      + poly([[0, 40], [34, 42], [50, 47], [0, 47]], "#7fa35c")
      + txt(10, 36, "plage") + txt(W - 10, 232, "socle plus ancien", { a: "end", petit: true, clair: true });
    return {
      fond,
      anim(t, ta) {
        let s = "";
        let v = `M0 ${MER + 2}`;
        for (let x = 0; x <= W; x += 4) v += ` L${x} ${r1(MER + 1.8 * Math.sin(x / 36 * Math.PI * 2 - ta * 2.25))}`;
        s += `<path d="${v}" fill="none" stroke="#eef6fa" stroke-width="1.6" opacity=".9"/>`;
        for (const g of chutes) {
          const u = (g.ph + ta * 0.14) % 1, x = g.x + 6 * Math.sin(u * 6 + g.ph * 20), y = lerp(MER + 8, dessus(g.x, t, ta) - 2, u);
          s += circ(x, y, g.r, "#caa86a", { opacity: op(Math.min(u * 6, (1 - u) * 14, 0.95)) });
        }
        // lits de sable, seulement dans la partie immergée
        const nb = 8;
        for (let j = 0; j < nb; j++) {
          const f0 = j / nb, f1 = (j + 1) / nb, haut = [], bas = [];
          for (let x = RIVAGE; x <= W; x += 6) {
            const e = epaisseur(x, t);
            bas.push([x, base(x) - f0 * e + 0.4]);
            haut.push([x, j === nb - 1 ? dessus(x, t, ta) : base(x) - f1 * e]);
          }
          s += poly(haut.concat(bas.reverse()), j % 2 ? MIN.sableFonce : MIN.sable);
        }
        s += txt(W - 10, base(W - 10) - 5, "lits de sable", { a: "end", petit: true, op: fen(t, 0.35, 0.5) });
        s += compteur(240, 20, lerp(478, 470, t), { sous: "le sable s'accumule sur le fond, pas sur la plage" });
        // trilobite qui marche sur le sable : ses traces se fossilisent (bilobites du grès armoricain)
        const x0 = 200, xt = lerp(x0, 428, fen(t, 0.08, 0.96));
        for (let x = x0; x < xt - 8; x += 5) {
          const y = dessus(x, t, ta) - 0.8;
          s += line(x, y - 2, x + 3, y, "#8f7244", 1) + line(x, y + 2, x + 3, y, "#8f7244", 1);
        }
        const yt = dessus(xt, t, ta) - 4;
        s += `<g transform="translate(${r1(xt)} ${r1(yt)})">${ell(0, 0, 8, 4.4, "#6b5a48")}${ell(6, 0, 3.4, 4, "#5a4a3a")}${line(-7, 0, 7, 0, "#4a3b2e", 1)}`
          + [-4, -1, 2].map((x) => line(x, -4, x, 4, "rgba(255,255,255,.35)", 0.6)).join("") + `</g>`;
        const xl = clamp(xt, 96, 384);
        s += txt(xl, yt - 22, "trilobite : ses traces restent", { a: "middle", petit: true, clair: true })
          + txt(xl, yt - 11, "fossilisées dans le grès", { a: "middle", petit: true, clair: true });
        return s;
      },
    };
  };

  // 4 · enfouissement : le sable ne bouge pas, ce sont les couches qui s'empilent au-dessus (l'échelle monte avec le fond de l'eau)
  SCENES.enfouissement = function (p) {
    const R = alea("en" + p.graine);
    const X0 = 14, X1 = 236, BAS = 216;
    const AGE0 = p.age0 ?? 470, AGE1 = p.age1 ?? 400, ZMAX = p.zmax ?? 2.2, KM = 150 / ZMAX;  // 150 px = toute la profondeur
    const VIDES = p.vides || [40, 26];
    // ce qui s'est déposé au-dessus, dans l'ordre (âges des limites)
    const couches = p.couches || [[470, 444, "#9aa28f", "Ordovicien : schistes et grès"], [444, 419, "#63665f", "Silurien : schistes noirs"], [419, 400, "#c9bfa5", "Dévonien : schistes et calcaires"]];
    const points = Array.from({ length: 80 }, () => [X0 + R() * (X1 - X0), R(), R() < 0.2 ? (p.grainFonce || "#b8955a") : (p.grainClair || "#fbf6ea")]);
    const L = loupe(414, 116, 54, { fond: MIN.pore });
    const pos = [];
    for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) pos.push([360 + i * 14 + (j % 2) * 7 + (R() - 0.5) * 3, 58 + j * 14 + (R() - 0.5) * 3, 7.1 + R() * 1.2, formeGrain(R, 1, 6)]);
    const merG = degrade("#86bddb", "#5d9cc6");
    return {
      fond: rect(0, 0, W, H, "#f3f1ea") + `<defs>${merG.def}</defs>` + L.fond,
      anim(t) {
        const O = 150 * t, gH = lerp(30, 24, t), gY = BAS - gH, SF = gY - O, z = O / KM, T = 10 + (p.gradient || 30) * z;
        let s = "";
        // couches déposées, de la plus ancienne (en bas, contre le sable) à la plus jeune
        let y = gY;
        for (const [a0, a1, c, nom] of couches) {
          const ep = (a0 - a1) / (AGE0 - AGE1) * 150, e = clamp(gY - SF - (gY - y), 0, ep);
          if (e <= 0) break;
          s += rect(X0, y - e, X1 - X0, e, c);
          if (e > 15) s += txt(X0 + 8, y - e / 2 + 3.5, nom, { petit: true, clair: c === "#63665f" });
          y -= e;
        }
        // mer peu profonde, toujours au-dessus du dépôt
        s += rect(X0, SF - 14, X1 - X0, 14, p.surface ? p.surface[1] : merG.url) + txt(X0 + 8, SF - 4, p.surface ? p.surface[0] : "mer peu profonde", { petit: true, clair: true });
        // le sable, à sa place, qui se tasse
        s += rect(X0, gY, X1 - X0, gH, p.couleurRoche || MIN.sable);
        for (const [x, v, c] of points) s += circ(x, gY + 2 + v * (gH - 4), 1.1, c);
        s += txt(X0 + 8, gY + gH / 2 + 3.5, p.nomRoche || "le sable armoricain");
        s += rect(X0, BAS, X1 - X0, H - BAS, "#7b8074") + txt(X0 + 8, H - 9, p.socle || "schistes plus anciens (socle)", { petit: true, clair: true });
        s += rect(X0, SF - 14, X1 - X0, H - SF + 14, "none", { stroke: "#5f625a", "stroke-width": 1 });
        // règle : le 0 est au fond de l'eau et monte avec lui
        const RX = 250;
        s += line(RX, SF, RX, BAS + 4, "#27302d", 1);
        for (let k = 0; k * KM <= O + 1; k += 0.5) {
          const yy = SF + k * KM;
          s += line(RX - 4, yy, RX, yy, "#27302d", 1) + (k % 1 === 0 ? txt(RX + 5, yy + 3.5, k === 0 ? "0" : `${nombre(k)} km`, { petit: true }) : "");
        }
        s += poly([[RX - 1, gY], [RX - 8, gY - 4.5], [RX - 8, gY + 4.5]], "#c0392b");
        s += txt(RX + 34, gY + 3.5, `${z.toFixed(1).replace(".", ",")} km · ${Math.round(T)} °C`);
        // temps et rythme d'accumulation
        s += compteur(408, 18, lerp(AGE0, AGE1, t), { sous: p.rythme || "≈ 30 m de dépôts par million d'années" });
        if (p.rang) {
          const RG = p.rang === "petrole" ? [[0, "immature"], [60, "fenêtre à pétrole"], [120, "fenêtre à gaz"], [200, ""]] : [[0, "tourbe"], [40, "lignite"], [90, "houille"], [190, "anthracite"], [300, ""]];
          const tmax = RG[RG.length - 1][0], yv = (v) => 196 - v / tmax * 150;
          s += rect(344, 44, W - 344, H - 44, "#f3f1ea") + rect(390, yv(tmax), 12, 150, "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 3 });
          RG.forEach(([v, nom], i) => { if (!nom) return; const h2 = RG[i + 1][0]; s += rect(391, yv(h2), 10, yv(v) - yv(h2), i % 2 ? "#cdbfa8" : "#8a7358", { opacity: 0.6 }) + txt(408, (yv(v) + yv(h2)) / 2 + 3, nom, { petit: true }); });
          s += poly([[388, yv(Math.min(T, tmax))], [381, yv(Math.min(T, tmax)) - 4], [381, yv(Math.min(T, tmax)) + 4]], "#c0392b") + txt(378, yv(Math.min(T, tmax)) + 3, `${nombre(T)} °C`, { a: "end", petit: true });
          s += txt(396, 214, p.rang === "petrole" ? "la matière organique" : "rang du charbon", { a: "middle", petit: true });
          return s;
        }
        if (p.thermo) {
          s += rect(344, 44, W - 344, H - 44, "#f3f1ea") + thermometre(420, 50, 130, T, 0, p.thermo, [0.25, 0.5, 0.75].map((f) => Math.round(p.thermo * f / 10) * 10));
          s += txt(410, 70, `${nombre(T)} °C`, { a: "end" }) + txt(390, 212, p.texteThermo || "la croûte s'amincit : la chaleur monte", { a: "middle", petit: true })
            + txt(390, 224, `≈ ${p.gradient} °C par km`, { a: "middle", petit: true });
          return s;
        }
        // loupe : les grains se rapprochent sous le poids des couches
        const k = lerp(1, Math.sqrt((100 - VIDES[0]) / (100 - VIDES[1])), t);
        let d = "";
        for (const [x, yy, r, forme] of pos) {
          const px = 414 + (x - 414) * k, py = 116 + (yy - 116) * k;
          d += poly(forme(0.75, 0, 0).map(([a, b]) => [px + a * r, py + b * r * lerp(1, 0.96, t)]), p.grainLoupe || MIN.quartz, { stroke: "#7d766b", "stroke-width": 0.6 });
        }
        s += L.dans(d) + L.bord;
        const lt = p.loupeTexte || ["au microscope : le sable se tasse", "sous le poids des couches"];
        s += txt(414, 186, lt[0], { a: "middle", petit: true })
          + txt(414, 198, lt[1], { a: "middle", petit: true })
          + txt(414, 214, `vides entre les grains : ${Math.round(lerp(VIDES[0], VIDES[1], t))} %`, { a: "middle" });
        return s;
      },
    };
  };

  // 5 · cimentation : du quartz précipite autour des grains et comble les vides (vue au microscope, vides en bleu)
  SCENES.cimentationQuartz = function (p) {
    const R = alea("cq" + p.graine);
    const CX = 150, CY = 120, RA = 88, MM = 100;          // 100 unités = 1 mm
    const sites = [];
    for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) sites.push([CX - 115 + i * 29 + (j % 2) * 14.5 + (R() - 0.5) * 8, CY - 115 + j * 26 + (R() - 0.5) * 8]);
    const cells = voronoi(sites, CX - 120, CY - 120, CX + 120, CY + 120).map((pg, i) => {
      const [sx, sy] = sites[i];
      let dmin = Infinity, dmax = 0;
      for (let k = 0; k < pg.length; k++) {
        const [ax, ay] = pg[k], [bx, by] = pg[(k + 1) % pg.length];
        const L2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1, f = clamp(((sx - ax) * (bx - ax) + (sy - ay) * (by - ay)) / L2);
        dmin = Math.min(dmin, Math.hypot(sx - ax - f * (bx - ax), sy - ay - f * (by - ay)));
        dmax = Math.max(dmax, Math.hypot(ax - sx, ay - sy));
      }
      const r = dmin * 0.86, forme = formeGrain(R, r, 6, 0.9);
      return { pg, s: [sx, sy], grain: forme(0.8, sx, sy, R() * 6) };
    });
    const L = loupe(CX, CY, RA, { fond: MIN.pore });
    // barre d'échelle graduée (0 · 0,25 · 0,5 mm)
    let regle = line(CX - 50, 221, CX + 50, 221, "#27302d", 2);
    for (let k = 0; k <= 5; k++) { const x = CX - 50 + k * 20; regle += line(x, 221, x, k % 2 ? 225 : 228, "#27302d", k % 2 ? 1 : 1.6); }
    regle += txt(CX - 50, 236, "0", { a: "middle", petit: true }) + txt(CX, 236, "0,25", { a: "middle", petit: true }) + txt(CX + 50, 236, "0,5 mm", { a: "middle", petit: true });
    const fond = rect(0, 0, W, H, "#f3f1ea") + txt(CX, 22, "Vue au microscope", { a: "middle" }) + L.fond + regle;
    return {
      fond,
      anim(t) {
        const e = fen(t, 0.04, 0.96);
        let d = "";
        for (const c of cells) d += poly(echelle(c.pg, c.s, lerp(0.86, 0.975, e)), "#f6f4ee", { stroke: "#d9d4c8", "stroke-width": 0.6 });
        for (const c of cells) d += poly(c.grain, "#e6e0d2", { stroke: "#8c7f6a", "stroke-width": 1.1, "stroke-dasharray": "1.6 1.4" });
        let s = L.dans(d) + L.bord;
        s += compteur(376, 18, lerp(400, 320, t), { sous: "enfoui entre 2,2 et 3 km" });
        // thermomètre
        const TX = 290, T = lerp(76, 100, t), yT = (v) => 196 - (v - 50) * 2.1;
        s += rect(TX - 5, 48, 10, 150, "#ffffff", { rx: 5, stroke: "#27302d", "stroke-width": 1 }) + circ(TX, 206, 10, "#c0392b", { stroke: "#27302d", "stroke-width": 1 });
        s += rect(TX - 2.5, yT(T), 5, 206 - yT(T), "#c0392b");
        for (const v of [60, 80, 100]) s += line(TX + 5, yT(v), TX + 9, yT(v), "#27302d", 1) + txt(TX + 12, yT(v) + 3.5, `${v} °C`, { petit: true });
        s += cartouche(340, 52, 132, [["#e6e0d2", "grain de sable d'origine", { stroke: "#8c7f6a", "stroke-dasharray": "1.6 1.4" }], ["#f6f4ee", "quartz ajouté (ciment)"], [MIN.pore, "vides (colorés en bleu)"]]);
        s += txt(346, 132, "L'eau chargée de silice", { petit: true }) + txt(346, 145, "dissoute dépose du quartz", { petit: true }) + txt(346, 158, "sur chaque grain.", { petit: true });
        s += txt(346, 186, `vides : ${Math.round(lerp(26, 5, e))} %`);
        return s;
      },
    };
  };

  // 6 · plissement (collision hercynienne) puis érosion : le grès, plus dur, reste en crêtes
  // Une seule géométrie pour les deux dernières étapes (18/09/2026) ; T = temps « global » de 0 à 1 :
  //   0 → 0,5 : la collision RACCOURCIT la série (les grains repères se rapprochent), la plisse et l'épaissit ; épaissie, la
  //             croûte se soulève (isostasie) : le fond de la mer passe au-dessus du niveau de l'eau, qui ne bouge pas —
  //             la mer se retire, il reste des bras de mer dans les creux, puis plus rien ;
  //   0,5 → 1 : l'érosion rabote la chaîne, allégée la croûte remonte encore ; le grès, plus dur, reste en crêtes.
  function plisEtErosion(p, T0, T1) {
    const R = alea("pe" + p.graine);
    // plus de ciel (18/09/2026, « des nuages sur le sol ») : mer plus bas, collines moins hautes, nuages toujours au-dessus
    const MERY = 76, XC = 240;                                  // niveau de la mer (fixe), centre du raccourcissement
    const limites = [84, 114, 142, 168, 190, 216, 242, 266, 304]; // le grès entre les limites 4 et 5
    const cou = ["#b8b39c", "#a7ad97", "#cfc4a4", "#9aa28f", p.couleurCouche || MIN.sable, "#8b9183", "#a9a594", "#7b8074"];
    const pts = Array.from({ length: 70 }, () => [-60 + R() * (W + 120), R()]);
    const arbres = Array.from({ length: 12 }, () => R() * W);
    const clipId = nid("pc"), clipCiel = nid("pk");
    const pas = 6, xs = Array.from({ length: W / pas + 1 }, (_, i) => i * pas);
    return {
      fond: ciel(),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        const sh = 0.2 * fen(T, 0, 0.42);                       // raccourcissement horizontal (20 %)
        const x0 = (x) => XC + (x - XC) / (1 - sh), xm = (x) => XC + (x - XC) * (1 - sh);
        const A = lerp(0, 40, fen(T, 0.02, 0.42)), U = lerp(0, 54, fen(T, 0.1, 0.48));
        const yl = (k, x) => limites[k] - U + A * Math.sin((x0(x) + 40) / 330 * Math.PI * 2) * (1 - k * 0.03);
        // l'érosion attaque les sommets dès qu'ils sortent (sommets arrondis), puis rabote toute la chaîne
        const Lv0 = lerp(56, 148, fen(T, 0.5, 1)), kc = lerp(12, 3, fen(T, 0.5, 0.7)), rude = 1 - fen(T, 0.5, 0.75);
        let surf = xs.map((x) => {
          const top = yl(0, x), g1 = yl(4, x), g2 = yl(5, x);
          const Lv = Lv0 + rude * (4 * Math.sin(x / 29 + 0.7) + 2.5 * Math.sin(x / 11 + 2.1)); // crêtes irrégulières (≥ y 37)
          let y = top >= Lv ? top : Lv - kc * (1 - Math.exp(-(Lv - top) / kc));
          if (g1 < Lv && g2 > Lv - 20) y = Math.max(top, Math.max(g1, Lv - 20));
          return y;
        });
        for (let it = 0; it < 2; it++) surf = surf.map((y, i) => (surf[Math.max(0, i - 1)] + y * 2 + surf[Math.min(surf.length - 1, i + 1)]) / 4);
        const prof = xs.map((x, i) => [x, surf[i]]);
        let s = "";
        const erosion = fen(T, 0.5, 0.58);
        s += `<clipPath id="${clipId}"><polygon points="${P(prof.concat([[W, H], [0, H]]))}"/></clipPath><g clip-path="url(#${clipId})">`;
        for (let k = 0; k < cou.length; k++) {
          const haut = xs.map((x) => [x, yl(k, x)]), bas = xs.map((x) => [x, k + 1 < limites.length - 1 ? yl(k + 1, x) : H + 60]).reverse();
          s += poly(haut.concat(bas), cou[k]);
        }
        for (const [xa, v] of pts) { const x = xm(xa); s += circ(x, lerp(yl(4, x), yl(5, x), 0.15 + v * 0.7), 1.1, p.grains || "#b8955a"); }
        s += `</g>`;
        // la mer : son niveau ne bouge pas ; elle ne reste que là où le fond est encore plus bas que lui
        if (T < 0.5) {
          const eauG = degrade("#8cc2de", "#4d8fb5");
          s += `<defs>${eauG.def}</defs>`;
          let morceau = null;
          const bras = [];
          prof.forEach(([x, y], i) => {
            const sous = y > MERY;
            if (sous && !morceau) morceau = [];
            if (sous) morceau.push([x, y]);
            if ((!sous || i === prof.length - 1) && morceau) { bras.push(morceau); morceau = null; }
          });
          for (const m of bras) {
            const xa = m[0][0] - (m[0][0] > 0 ? pas / 2 : 0), xb = m[m.length - 1][0] + (m[m.length - 1][0] < W ? pas / 2 : 0);
            const haut = [];
            for (let x = xa; x <= xb + 0.1; x += 3) haut.push([x, MERY + 1.2 * Math.sin(x / 26 * Math.PI * 2 - ta * 1.8)]);
            s += poly(haut.concat(m.slice().reverse()), eauG.url);
            if (xb - xa > 24) s += pline(haut, "#eef6fa", 1.3, { opacity: 0.9 });
          }
        }
        s += pline(prof, erosion > 0.5 ? "#6f9d4f" : "#8a8575", 2.2);
        // pluie : elle arrive avec les reliefs et ne s'arrête plus (l'érosion continue aujourd'hui)
        const pl = fen(T, 0.36, 0.5) * (1 - 0.45 * fen(T, 0.9, 1));
        if (pl > 0) s += `<clipPath id="${clipCiel}"><polygon points="${P(prof.concat([[W, -5], [0, -5]]))}"/></clipPath>`
          + `<g opacity="${op(pl)}"><g clip-path="url(#${clipCiel})">${[[90 + 1.6 * ta, 32, 60, "pe1"], [254 + 1.2 * ta, 30, 56, "pe2"]]
            .map(([x, y, w, g]) => pluie(x, y, w, Math.max(8, hauteur(prof, x + w / 2) - y), ta, 14, g)).join("")}</g>`
          + `${nuage(114 + 1.6 * ta, 27) + nuage(278 + 1.2 * ta, 25, 0.9)}</g>`;
        const fin = fen(T, 0.9, 0.98);
        if (fin > 0) for (const x of arbres) { const y = hauteur(prof, x); s += `<g opacity="${op(fin)}">${rect(x - 0.8, y - 6, 1.6, 6, "#6b4f35")}${ell(x, y - 9, 4.5, 5.5, "#4f7d3c")}</g>`; }
        const [AG0, AG1] = p.ages || [320, 300];
        const age = T < 0.5 ? lerp(AG0, AG1, T / 0.5) : lerp(AG1, 0, (T - 0.5) / 0.5);
        s += compteur(402, 18, age);
        // le moteur : deux plaques se rapprochent (flèches au bord du cadre), la série se raccourcit et s'épaissit
        const comp = fen(T, 0, 0.04) * (1 - fen(T, 0.44, 0.5));
        s += fleche(4, 200, 40, 200, { sw: 3, pointe: 9, op: comp }) + fleche(476, 200, 440, 200, { sw: 3, pointe: 9, op: comp });
        s += txt(196, 13, T < 0.25 ? "la collision raccourcit et plisse les couches" : "épaissie, la croûte se soulève : la mer se retire",
          { a: "middle", op: fen(T, 0.01, 0.05) * (1 - fen(T, 0.46, 0.5)) });
        s += txt(196, 13, "l'érosion enlève le dessus ; allégée, la croûte remonte", { a: "middle", op: fen(T, 0.52, 0.58) * (1 - fen(T, 0.86, 0.9)) });
        // remontée isostatique (épaississement, puis érosion)
        const iso = fen(T, 0.14, 0.24) * (1 - fen(T, 0.9, 1));
        for (const x of [70, 240, 410]) s += fleche(x, H - 6, x, H - 30, { c: "#c0392b", sw: 2, pointe: 7, op: op(iso * 0.8) });
        let im = 0;
        surf.forEach((y, i) => { if (xs[i] > 40 && xs[i] < 440 && y < surf[im]) im = i; });
        s += txt(clamp(xs[im], 50, 430), surf[im] - 16, p.creteNom || "crête de grès", { a: "middle", op: fen(T, 0.93, 0.98) });
        const xg = 240, yg = (yl(4, xg) + yl(5, xg)) / 2;
        if (yg > hauteur(prof, xg) + 14) s += txt(xg, yg + 3.5, p.nomCouche || "grès", { a: "middle" });
        return s;
      },
    };
  }
  SCENES.plissementSoulevement = (p) => plisEtErosion(p, 0, 0.5);
  SCENES.erosionPlis = (p) => plisEtErosion(p, 0.5, 1);
  SCENES.plissementErosion = (p) => plisEtErosion(p, 0, 1);

  // ─────────────────────────────── scènes magmatiques (prototype : granite) ───────────────────────────────
  // coupe de croûte commune aux scènes de pluton : surface à y = 42, 5,4 px par km jusqu'à 35 km
  const SURF = 40, PXKM = 5, KM = (z) => SURF + z * PXKM;
  const CROUTE = ["#dccdae", "#cebd99", "#bfac86"], MANTEAU = "#a9ae76", MAGMA = "#e0532b", MAGMA_CLAIR = "#f3a13d";
  function coupeCroute(o = {}) {
    const relief = o.relief || RELIEF_CROUTE;
    let s = ciel(SURF + 2);
    s += poly([...relief, [480, KM(35)], [0, KM(35)]], CROUTE[0]);
    s += rect(0, KM(10), W, KM(20) - KM(10), CROUTE[1]) + rect(0, KM(20), W, KM(35) - KM(20), CROUTE[2]);
    s += rect(0, KM(35), W, H - KM(35), MANTEAU);
    s += line(0, KM(35), W, KM(35), "#8d7b5e", 1, { "stroke-dasharray": "5 3" });
    // règle de profondeur
    s += line(26, SURF, 26, KM(35), "#27302d", 1);
    for (let z = 0; z <= 35; z += 5) {
      s += line(22, KM(z), 26, KM(z), "#27302d", 1);
      if (z % 10 === 0) s += txt(30, KM(z) + 3.5, z === 0 ? "0" : `${z} km`, { petit: true });
    }
    return s;
  }
  // thermomètre vertical : v entre vmin et vmax, graduations
  function thermometre(x, yHaut, hauteur, v, vmin, vmax, ticks) {
    const yv = (u) => yHaut + hauteur - (u - vmin) / (vmax - vmin) * hauteur;
    let s = rect(x - 5, yHaut, 10, hauteur, "#ffffff", { rx: 5, stroke: "#27302d", "stroke-width": 1 })
      + circ(x, yHaut + hauteur + 10, 10, "#c0392b", { stroke: "#27302d", "stroke-width": 1 })
      + rect(x - 2.5, yv(clamp(v, vmin, vmax)), 5, yHaut + hauteur + 10 - yv(clamp(v, vmin, vmax)), "#c0392b");
    for (const u of ticks) s += line(x + 5, yv(u), x + 9, yv(u), "#27302d", 1) + txt(x + 12, yv(u) + 3.5, `${nombre(u)} °C`, { petit: true });
    return s;
  }
  // à quel moment un minéral cristallise dans un magma (1 = tôt, 3 = dans les derniers vides)
  function tempsCristal(id) {
    if (/quartz|calcedoine|opale/.test(id)) return 3;
    if (/orthose|sanidine|microcline|feldspath_k|muscovite|nephelin|leucite/.test(id)) return 2;
    return 1;
  }
  const couleurMin = (id) => (MINERAUX[id] || {}).swatch || "#9a9a9a";
  const nomMin = (id) => ((MINERAUX[id] || {}).nom || id).split(" (")[0].toLowerCase();

  // 1 · fusion partielle de la croûte épaissie
  SCENES.fusionCroute = function (p) {
    const R = alea("fc" + p.graine);
    const zHaut = p.zFusion ? p.zFusion[0] : 25, zBas = p.zFusion ? p.zFusion[1] : 35;
    const cy = (KM(zHaut) + KM(zBas)) / 2, ry = (KM(zBas) - KM(zHaut)) / 2;
    const gouttes = Array.from({ length: 70 }, () => {
      const a = R() * Math.PI * 2, d = Math.sqrt(R());
      return { x: 240 + Math.cos(a) * 150 * d, y: cy + Math.sin(a) * ry * d, r: 1.6 + R() * 2.2, ph: R() };
    });
    const fond = coupeCroute() + encaissant(null);   // repères de litage : ils s'infléchissent sous le massif aux étapes 2 et 3
    return {
      fond,
      anim(t, ta) {
        let s = "";
        // chaleur qui monte du manteau
        for (let i = 0; i < 5; i++) {
          const x = 80 + i * 80, u = (ta * 0.25 + i * 0.2) % 1;
          s += fleche(x, KM(35) + 6 - u * 10, x, KM(35) - 6 - u * 14, { c: "#d8452b", sw: 1.4, pointe: 5, op: 0.25 + 0.5 * Math.sin(u * Math.PI) });
        }
        // gouttes de liquide qui apparaissent puis se rassemblent en lentille
        const e = fen(t, 0.05, 0.85);
        s += ell(240, cy, 150 * e, ry * e, MAGMA, { opacity: op(0.22 * e) });
        for (const g of gouttes) {
          const a = fen(t, 0.05 + g.ph * 0.6, 0.35 + g.ph * 0.6);
          if (a <= 0.02) continue;
          s += circ(g.x, g.y + Math.sin(ta * 0.5 + g.ph * 6) * 0.8, g.r * a, MAGMA, { opacity: op(0.55 + 0.45 * a) });
        }
        s += txt(240, cy + ry + 13, `fusion partielle vers ${nombre(zHaut)}–${nombre(zBas)} km, entre ${p.tFusion || "750 et 850 °C"}`, { a: "middle" });
        s += txt(150, 58, p.labCroute || "croûte épaissie par la collision", { clair: false });
        s += compteur(396, 18, lerp(p.age0 ?? 345, p.age1 ?? 335, t), { sous: p.sousFusion || "", libelle: p.libelleAge });
        return s;
      },
    };
  };

  // ─── pluton : géométrie commune des étapes 2, 3 et 5 (refonte du 25/09/2026) ───
  // Sa demande : « plus juste une boule qui monte », coller aux schémas scientifiques. Modèle de Petford, Cruden, McCaffrey
  // et Vigneresse 2000 (Nature 408, 669 ; fig. 1 : fusion → ségrégation → montée → mise en place) : le liquide quitte les
  // grains et se rassemble dans des VEINES de la zone de fusion, monte par un FILON (dyke, quelques mètres de large) qu'il
  // ouvre lui-même, puis s'étale à l'horizontale en LAMES (sills) qui s'empilent en 1 000 à 100 000 ans. La place est faite
  // par l'ENFONCEMENT DU PLANCHER (Cruden et McCaffrey 2001) : toit plat, plancher creusé, couches de dessous infléchies.
  // Le diapir (grosse boule) est abandonné pour les granites : trop lent dans une croûte froide (Clemens et Mawer 1992).
  // Règle de continuité : l'image finale de l'étape 2 = l'image de départ de l'étape 3 ; l'étape 5 reprend le massif de la 3.
  const XP = 240, LARG_P = 125;
  const RELIEF_CROUTE = [[0, 42], [60, 34], [110, 22], [150, 14], [190, 20], [240, 10], [290, 20], [340, 16], [400, 26], [480, 34]];
  const STRATES = Array.from({ length: 17 }, (_, i) => 45 + i * 10);   // repères de litage de l'encaissant (y au repos)
  function geomPluton(p, roche) {
    const z0 = p.zPluton ? p.zPluton[0] : 5, z1 = p.zPluton ? p.zPluton[1] : 10;
    // la zone de fusion est celle de l'étape 1 de la même roche (mêmes gouttes, même lentille)
    const E = ((roche && Formation.animation(roche)) || { etapes: [] }).etapes;
    const kF = E.findIndex((e) => e.scene === "fusionCroute");
    const pF = kF >= 0 ? Object.assign({ graine: roche.id + kF }, E[kF].p) : null;
    const zF = (pF && pF.zFusion) || p.zFusion || [25, 35];
    const yT = KM(z0), Th = KM(z1) - KM(z0);
    const yS = (KM(zF[0]) + KM(zF[1])) / 2, ryS = (KM(zF[1]) - KM(zF[0])) / 2;
    const yCol = yS - ryS * 0.7;                                    // les veines se rejoignent ici : pied du filon
    // 5 lames : la 1ʳᵉ sous le toit, les suivantes glissées DESSOUS (le plancher descend), un peu moins larges
    const lames = [0.22, 0.2, 0.2, 0.19, 0.19].map((d, k) => ({ d: d * Th, w: LARG_P * (1 - 0.065 * k) }));
    const forme = (x, w) => { const u = Math.abs(x - XP) / w; return u >= 1 ? 0 : Math.pow(1 - u ** 4, 0.6); };
    // tracé du filon : léger zigzag FIXE (rien ne tremble)
    const xFilon = (y) => XP + 2.2 * Math.sin(y / 13) + 1.3 * Math.sin(y / 5.3 + 1);
    // la pile à un avancement donné : ek[k] = { h, w } entre 0 et 1 (épaisseur, largeur de la lame k)
    function pile(ek) {
      const L = lames.map((l, k) => ({ d: l.d * ek[k].h, w: l.w * ek[k].w }));
      const ep = (x) => L.reduce((s, l) => s + (l.w > 0.5 ? l.d * forme(x, l.w) : 0), 0);
      return { L, ep, centre: ep(XP) };
    }
    // descente d'un point (x, y) de l'encaissant : tout ce qui est sous le toit descend de l'épaisseur du massif à cet
    // endroit, de moins en moins vers le bas (la place revient à la zone de fusion qui se vide)
    const depl = (ep, x, y) => y <= yT + 0.5 ? 0 : ep(x) * lerp(1, 0.25, clamp((y - yT) / (yS - yT)));
    // veines de la zone de fusion : réseau qui converge vers le pied du filon
    const veines = [-122, -84, -44, 34, 78, 118].map((dx, i) => {
      const x0 = XP + dx, y0 = yS + (i % 2 ? 0.42 : -0.12) * ryS;
      return courbe([[x0, y0], [XP + dx * 0.5, lerp(y0, yCol, 0.5) + ryS * 0.12], [XP + dx * 0.1, yCol + 2.5], [XP, yCol]], 6);
    });
    return { z0, z1, yT, Th, yS, ryS, yCol, zF, pF, lames, forme, xFilon, pile, depl, veines };
  }
  // étapes 3 et 5 d'une roche SANS fusion de croûte (essexite, fénite… : magma venu du manteau) : pas de zone de fusion
  // dessinée, le filon arrive du bas de la coupe
  function sansSource(G) { if (!G.pF) G.yCol = KM(35) + 8; return G; }
  // avancement de la pile (étape 2 : la 1ʳᵉ lame s'amorce ; étape 3 : elle s'étale, puis 4 autres injections dessous)
  const AMORCE = { h: 0.3, w: 0.27 };
  const pileAmorce = (e) => [{ h: AMORCE.h * e, w: AMORCE.w * e }, ...[1, 2, 3, 4].map(() => ({ h: 0, w: 0 }))];
  function pileInjections(t) {
    return [0, 1, 2, 3, 4].map((k) => {
      if (k === 0) return { h: lerp(AMORCE.h, 1, fen(t, 0.02, 0.22)), w: lerp(AMORCE.w, 1, fen(t, 0, 0.14)) };
      const a = 0.12 + 0.16 * k;
      return { h: fen(t, a + 0.03, a + 0.2), w: fen(t, a, a + 0.12) };
    });
  }
  // encaissant : limites des niveaux de croûte et repères de litage, infléchis sous le massif (ep = épaisseur en x)
  function encaissant(G, ep) {
    let s = "";
    if (G && ep) [[KM(10), CROUTE[0]], [KM(20), CROUTE[1]]].forEach(([yb, c]) => {
      if (yb <= G.yT) return;
      const haut = [], bas = [];
      for (let x = XP - LARG_P - 4; x <= XP + LARG_P + 4; x += 4) { haut.push([x, yb]); bas.push([x, yb + G.depl(ep, x, yb)]); }
      s += poly(haut.concat(bas.reverse()), c);
    });
    for (const y0 of STRATES) {
      if (y0 > KM(35) - 3) continue;
      const pts = [];
      for (let x = 58; x <= W; x += 6) pts.push([x, y0 + (G && ep ? G.depl(ep, x, y0) : 0)]);
      s += pline(pts, "rgba(90,70,50,.2)", 0.7);
    }
    return s;
  }
  // contour du massif (toit plat, plancher creusé)
  function contourPile(G, P) {
    const haut = [], bas = [];
    for (let x = XP - LARG_P; x <= XP + LARG_P + 0.1; x += 3) { haut.push([x, G.yT]); bas.push([x, G.yT + P.ep(x)]); }
    return haut.concat(bas.reverse());
  }
  // les lames, de haut en bas, contacts marqués d'un trait fin ; couleur(k) = teinte de la lame k
  function dessinPile(G, P, couleur, contact = "rgba(0,0,0,.2)") {
    let s = "", dessus = () => 0;
    P.L.forEach((l, k) => {
      if (l.w < 0.5 || l.d < 0.05) return;
      const d0 = dessus, haut = [], bas = [];
      for (let x = XP - l.w; x <= XP + l.w + 0.1; x += Math.min(3, l.w / 4)) {
        const y = G.yT + d0(x);
        haut.push([x, y]); bas.push([x, y + l.d * G.forme(x, l.w)]);
      }
      s += poly(haut.concat(bas.slice().reverse()), couleur(k));
      if (k > 0) s += pline(haut, contact, 0.6);
      dessus = (x) => d0(x) + l.d * G.forme(x, l.w);
    });
    return s;
  }
  // la zone de fusion : lentille qui se vide et veines qui convergent (e = épaisseur des veines, 0 → 1)
  function zoneFusion(G, opLentille, e, couleur = MAGMA) {
    const [za, zb] = G.zF, cy = (KM(za) + KM(zb)) / 2, ry = (KM(zb) - KM(za)) / 2;
    let s = ell(XP, cy, 150, ry, couleur, { opacity: op(opLentille) });
    if (e > 0.02) for (const v of G.veines) s += pline(v, couleur, r1(0.4 + 1.8 * e));
    return s;
  }
  // le filon, du pied (zone de fusion) jusqu'à yHaut ; pointe effilée si `pointe`
  function dessinFilon(G, yHaut, couleur, o = {}) {
    if (yHaut >= G.yCol - 2) return "";
    const pts = [];
    for (let y = G.yCol; y > yHaut; y -= 3) pts.push([G.xFilon(y), y]);
    pts.push([G.xFilon(yHaut), yHaut]);
    return poly(ruban(pts, (u) => 4.2 * (o.pointe ? Math.min(1, (1 - u) * 7 + 0.1) : 1)), couleur, o.trait ? { stroke: o.trait, "stroke-width": 0.6 } : undefined);
  }

  // 2 · montée : ségrégation dans des veines, puis montée par un filon, puis première lame horizontale
  SCENES.monteeMagma = function (p, roche) {
    const G = geomPluton(p, roche);
    // les gouttes de l'étape 1, au même endroit (même tirage que fusionCroute)
    const pF = G.pF || p, RF = alea("fc" + pF.graine);
    const [za, zb] = G.zF, cyF = (KM(za) + KM(zb)) / 2, ryF = (KM(zb) - KM(za)) / 2;
    const tousPts = G.veines.flat();
    const gouttes = Array.from({ length: 70 }, () => {
      const a = RF() * Math.PI * 2, d = Math.sqrt(RF());
      const g = { x: 240 + Math.cos(a) * 150 * d, y: cyF + Math.sin(a) * ryF * d, r: 1.6 + RF() * 2.2, ph: RF() };
      let best = tousPts[0], dm = 1e9;
      for (const q of tousPts) { const dd = Math.hypot(q[0] - g.x, q[1] - g.y); if (dd < dm) { dm = dd; best = q; } }
      g.v = best;
      return g;
    });
    const fond = coupeCroute() + encaissant(null);
    return {
      fond,
      anim(t, ta) {
        const pl = G.pile(pileAmorce(fen(t, 0.76, 0.97)));
        let s = encaissant(G, pl.ep);
        // chaleur du manteau (étape 1) qui s'éteint
        const ch = 1 - fen(t, 0, 0.25);
        if (ch > 0.02) for (let i = 0; i < 5; i++) {
          const x = 80 + i * 80, u = (ta * 0.25 + i * 0.2) % 1;
          s += fleche(x, KM(35) + 6 - u * 10, x, KM(35) - 6 - u * 14, { c: "#d8452b", sw: 1.4, pointe: 5, op: ch * (0.25 + 0.5 * Math.sin(u * Math.PI)) });
        }
        // 1) ségrégation : les gouttes glissent vers les veines, qui s'épaississent ; la lentille se vide
        const eV = fen(t, 0.06, 0.3);
        s += zoneFusion(G, lerp(0.22, 0.1, fen(t, 0.05, 0.4)), eV);
        const eG = 1 - fen(t, 0.3, 0.45);
        if (eG > 0.02) for (const g of gouttes) {
          const k = fen(t, 0.04 + g.ph * 0.18, 0.2 + g.ph * 0.18);
          const x = lerp(g.x, g.v[0], k), y = lerp(g.y + Math.sin(ta * 0.5 + g.ph * 6) * 0.8 * (1 - k), g.v[1], k);
          s += circ(x, y, g.r * (1 - 0.65 * k), MAGMA, { opacity: op(eG) });
        }
        // 2) le filon s'ouvre vers le haut, pointe en avant (la fissure précède le magma)
        const eF = fen(t, 0.3, 0.78), yTip = lerp(G.yCol, G.yT, eF);
        s += dessinFilon(G, Math.max(yTip, G.yT + pl.centre), MAGMA, { pointe: eF < 1 });
        if (eF > 0 && eF < 1) s += line(G.xFilon(yTip), yTip, G.xFilon(yTip - 8), yTip - 8, "rgba(60,40,30,.6)", 0.8);
        // le magma circule dans le filon (pulsations, elles continuent pendant l'arrêt sur image)
        if (G.yCol - yTip > 12) for (let i = 0; i < 6; i++) {
          const u = (ta * 0.35 + i / 6) % 1, y = lerp(G.yCol, yTip + 4, u);
          s += circ(G.xFilon(y), y, 1.4, MAGMA_CLAIR, { opacity: op(0.9 * Math.sin(u * Math.PI)) });
        }
        // 3) arrivé, il s'étale à l'horizontale : la première lame (elle continue à l'étape 3)
        s += dessinPile(G, pl, () => MAGMA);
        // pourquoi il monte, et à quoi ressemble le filon
        const eD = fen(t, 0.32, 0.4) * (1 - fen(t, 0.8, 0.86));
        if (eD > 0.02) {
          const yl = clamp(yTip + 10, 58, 196);
          s += fleche(XP + 14, yTip + 30, XP + 14, yTip - 2, { c: "#27302d", sw: 1.6, op: 0.75 * eD })
            + txt(XP + 22, yl, "moins dense que la roche autour", { petit: true, op: eD })
            + txt(XP + 22, yl + 10, "(≈ 2,4 t/m³ contre 2,7), il remonte", { petit: true, op: eD });
          const ym = clamp(lerp(G.yCol, yTip, 0.5), 60, 196);
          s += txt(XP - 10, ym, "filon (dyke) : quelques mètres", { a: "end", petit: true, op: eD })
            + txt(XP - 10, ym + 10, "de large, élargi sur le schéma", { a: "end", petit: true, op: eD });
        }
        const lab = (a, b) => (a > 0 ? fen(t, a, a + 0.04) : 1) * (1 - fen(t, b - 0.04, b));
        s += txt(240, H - 9, "le liquide quitte les grains et se rassemble dans des veines", { a: "middle", op: lab(0, 0.32) });
        s += txt(240, H - 9, p.labMontee || "il monte par une fracture qu'il ouvre lui-même : un filon", { a: "middle", op: lab(0.3, 0.8) });
        s += txt(240, H - 9, `arrivé vers ${nombre(G.z0)}–${nombre(G.z1)} km, il s'étale à l'horizontale`, { a: "middle", op: fen(t, 0.78, 0.84) });
        s += compteur(396, 18, lerp(p.age1 ?? 335, p.age2 ?? 330, t), { sous: p.dureeMontee || "1 000 à 100 000 ans", libelle: p.libelleAge });
        return s;
      },
    };
  };

  // 3 · mise en place : injections successives en lames ; le plancher s'enfonce ; auréole de contact
  SCENES.misePlacePluton = function (p, roche) {
    const G = sansSource(geomPluton(p, roche));
    const TEINTES = [MAGMA, "#e8663a", MAGMA, "#e8663a", MAGMA];
    const fond = coupeCroute() + encaissant(null);
    return {
      fond,
      anim(t, ta) {
        const ek = pileInjections(t), pl = G.pile(ek), ep = pl.ep;
        let s = encaissant(G, ep);
        if (G.pF) s += zoneFusion(G, 0.1, 1);
        // auréole : bande autour du massif qui s'élargit avec la chaleur accumulée
        const au = fen(t, 0.25, 0.95);
        if (au > 0.02) s += `<polygon points="${P(contourPile(G, pl))}" fill="#c46a3a" stroke="#c46a3a" stroke-width="${r1(2 + 16 * au)}" stroke-linejoin="round" opacity="${op(0.3 * au)}"/>`;
        // le filon nourrit toujours la base de la pile, le magma y circule
        const yBas = G.yT + pl.centre;
        s += dessinFilon(G, yBas, MAGMA);
        for (let i = 0; i < 6; i++) {
          const u = (ta * 0.35 + i / 6) % 1, y = lerp(G.yCol, yBas + 3, u);
          s += circ(G.xFilon(y), y, 1.4, MAGMA_CLAIR, { opacity: op(0.9 * Math.sin(u * Math.PI)) });
        }
        s += dessinPile(G, pl, (k) => TEINTES[k]);
        // injection en cours : la lame qui s'étale
        let n = 1;
        ek.forEach((e, k) => { if (k > 0 && e.w > 0.02) n = k + 1; });
        const xD = XP + LARG_P + 6;
        s += txt(xD, G.yT + 4, `injection n° ${n}`, { petit: true, op: fen(t, 0.02, 0.08) });
        s += txt(xD, G.yT + 13, "sur 5 (schéma)", { petit: true, op: fen(t, 0.02, 0.08) });
        if (pl.centre > 11) s += txt(XP - 60, G.yT + pl.centre * 0.55 + 3.5, p.labPluton || "chambre magmatique", { a: "middle", clair: true, op: fen(t, 0.3, 0.4) });
        // le plancher s'enfonce : c'est lui qui fait la place
        const eP = fen(t, 0.28, 0.36);
        for (const dx of [-55, 55]) {
          const y = G.yT + ep(XP + dx) + 3;
          s += fleche(XP + dx, y, XP + dx, y + 10, { c: "#27302d", sw: 1.3, pointe: 4.5, op: 0.7 * eP });
        }
        const yF = G.yT + G.Th + 17;
        s += txt(XP + 14, yF, "le plancher s'enfonce :", { petit: true, op: eP })
          + txt(XP + 14, yF + 9, "il fait la place au magma", { petit: true, op: eP });
        // auréole de contact (demande du 23/09/2026 : plus de « l'encaissant cuit ») ; « cornéennes » seulement près de la surface
        const aur = p.labAureole || `les roches voisines recristallisent${G.z1 <= 15 ? " (cornéennes)" : ""}`;
        const dessous = G.yT - 30 < 58;
        const yA = dessous ? yF + 22 : G.yT - 24;
        s += txt(240, yA, "auréole de contact : chauffées sans fondre,", { a: "middle", op: fen(t, 0.5, 0.7) })
          + txt(240, yA + 10, aur, { a: "middle", petit: true, op: fen(t, 0.5, 0.7) });
        s += txt(70, yF, `mise en place vers ${nombre(G.z0)}–${nombre(G.z1)} km`, { petit: true });
        s += compteur(396, 18, lerp(p.age2 ?? 330, p.age3 ?? 325, t), { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // 4 · cristallisation lente : les minéraux se forment dans l'ordre, du plus chaud au plus froid
  SCENES.cristallisationLente = function (p, roche) {
    const R = alea("cl" + p.graine);
    const CX = 148, CY = 126, RA = 96;
    const parts = (p.mineraux || roche.mineraux || [["quartz", 100]]).slice().sort((a, b) => b[1] - a[1]);
    const total = parts.reduce((s, [, v]) => s + v, 0) || 1;
    // une cellule de Voronoï par « part » de minéral : elles sont jointives à la fin (texture grenue)
    const sites = [];
    for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) sites.push([CX - 110 + i * 24 + (j % 2) * 12 + (R() - 0.5) * 8, CY - 110 + j * 23 + (R() - 0.5) * 8]);
    const cells = voronoi(sites, CX - 115, CY - 115, CX + 115, CY + 115);
    const sac = [];
    parts.forEach(([id, v]) => { const n = Math.round(v / total * cells.length); for (let k = 0; k < n; k++) sac.push(id); });
    while (sac.length < cells.length) sac.push(parts[0][0]);
    for (let i = sac.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [sac[i], sac[j]] = [sac[j], sac[i]]; }
    const grains = cells.map((pg, i) => {
      const id = sac[i], tps = tempsCristal(id), c = centre(pg);
      return { pg, c, id, tps, couleur: couleurMin(id), ph: R() * 0.12 };
    });
    const FEN = { 1: [0.04, 0.4], 2: [0.34, 0.72], 3: [0.66, 0.98] };
    const L = loupe(CX, CY, RA, { fond: MAGMA });
    // température à laquelle chaque étape commence (demande du 23/09/2026 : « dès ≈ 860 °C, plagioclase et biotite ») :
    // ordres de grandeur de la famille de magma (FAMILLES_CRIST de formation.js : Bowen 1928, Naney 1983 ; granite riche en
    // eau à 0,2 GPa : 865 → 705 °C, Maaløe et Wyllie 1975), ramenés sur l'intervalle tDebut → tFin propre à la roche
    const T0 = p.tDebut ?? 880, T1 = p.tFin ?? 680;
    const Fc = Formation._outils.crist, F = Fc && Fc.FAMILLES_CRIST[Fc.familleCrist({ mineraux: parts })];
    const tApparition = (id) => {
      const g = F && Fc.groupeDe(id), pl = g && F.t[g];
      return pl ? T1 + (pl[0] - F.solidus) / (F.liquidus - F.solidus) * (T0 - T1) : null;
    };
    let Tprec = T0;
    const etapes = [1, 2, 3].map((n) => {
      const tous = [...new Set(grains.filter((g) => g.tps === n).map((g) => g.id))], ids = tous.slice(0, 3);
      if (!tous.length) return null;
      const Tt = tous.map(tApparition).filter((v) => v != null);
      let T = Tt.length ? Math.max(...Tt) : lerp(T0, T1, FEN[n][0]);
      T = Math.round(clamp(T, T1 + 10, Tprec) / 10) * 10;
      Tprec = T;
      return { n, ids, nom: ids.map(nomMin).join(", "), T };
    }).filter(Boolean);
    // le thermomètre passe par la température de chaque étape au moment où elle commence
    const noeuds = [[0, T0], ...etapes.map((e) => [FEN[e.n][0], e.T]), [0.98, T1], [1, T1]];
    const temperature = (t) => hauteur(noeuds, t);
    const fond = rect(0, 0, W, H, "#f3f1ea") + txt(CX, 22, "Dans le magma, au microscope", { a: "middle" }) + L.fond;
    return {
      fond,
      anim(t) {
        let d = "";
        for (const g of grains) {
          const [a, b] = FEN[g.tps];
          const k = fen(t, a + g.ph, b + g.ph);
          if (k <= 0.02) continue;
          d += poly(echelle(g.pg, g.c, k * 0.99), g.couleur, { stroke: "rgba(0,0,0,.35)", "stroke-width": 0.7 });
        }
        let s = L.dans(d) + L.bord;
        const T = temperature(t);
        const tmin = Math.min(600, Math.floor(((p.tFin ?? 680) - 60) / 100) * 100), tmax = Math.max(950, Math.ceil(((p.tDebut ?? 880) + 60) / 100) * 100);
        s += thermometre(286, 60, 140, T, tmin, tmax, tmax - tmin > 400 ? [tmin + 100, Math.round((tmin + tmax) / 200) * 100, tmax - 100] : [650, 750, 850]);
        s += txt(286, 46, `${nombre(T)} °C`, { a: "middle" });
        // ordre de cristallisation : l'étape en cours est mise en avant
        let y = 74;
        s += txt(348, 58, "Ordre de cristallisation");
        for (const e of etapes) {
          const actif = t >= FEN[e.n][0] && t < FEN[e.n][1] + 0.06;
          s += circ(354, y - 3, 6, actif ? "#c0392b" : "#b9b5ab") + `<text x="354" y="${y}" text-anchor="middle" class="fa-leg" style="fill:#fff">${e.n}</text>`;
          e.ids.forEach((id, i) => { s += rect(366 + i * 13, y - 10, 10, 10, couleurMin(id), { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }); });
          s += txt(366 + e.ids.length * 13 + 3, y - 1, `dès ≈ ${nombre(e.T)} °C`, { petit: !actif });
          const mx = actif ? 23 : 28;
          s += txt(366, y + 14, e.nom.length > mx ? e.nom.slice(0, mx - 1) + "…" : e.nom, { petit: !actif });
          y += 36;
        }
        s += txt(340, 208, p.dureeCristal || "100 000 ans à 1 million d'années", { petit: true });
        s += txt(340, 220, "refroidissement lent, en profondeur", { petit: true });
        return s;
      },
    };
  };

  // 5 · l'érosion dégage le pluton, puis l'altération le débite en boules et en arène (refonte du 25/09/2026)
  // Sa demande : cohérente avec l'étape 3 (même massif en lames, même auréole, même plancher enfoncé, même filon) et une
  // surface plus naturelle. À l'échelle de la coupe (5 px par km), une boule de granite ferait 1 km : la surface est donc
  // montrée dans une VUE RAPPROCHÉE (quelques centaines de mètres), selon le schéma classique en deux temps (Linton 1955) :
  // l'eau s'infiltre par les diaclases et pourrit le granite en arène autour de noyaux sains (boules), puis l'érosion
  // emporte l'arène et les boules, restées sur place, s'entassent en chaos.
  SCENES.erosionGranite = function (p, roche) {
    const R = alea("eg" + p.graine);
    const G = sansSource(geomPluton(p, roche));
    const pl = G.pile(G.lames.map(() => ({ h: 1, w: 1 }))), ep = pl.ep;
    const yE = G.yT + G.Th * 0.4;                                   // surface finale : 40 % dans l'épaisseur du massif
    const coul = couleursMin(roche, 4);
    const cPl = p.couleurPluton || "#e7ded2", cBo = p.couleurBoules || "#ded5c8", cAr = p.couleurArene || "#d9c294";
    const grains = Array.from({ length: 170 }, () => {
      const x = XP + (R() - 0.5) * 2 * LARG_P;
      return [x, G.yT + R() * ep(x), 0.8 + R() * 1, coul[Math.floor(R() * coul.length)]];
    });
    const diaV = Array.from({ length: 11 }, (_, i) => XP - 120 + i * 24 + (R() - 0.5) * 6);
    // relief : la chaîne (celle des étapes 1 à 3) usée en plateau ondulé, un vallon à droite dans l'encaissant
    const XR = 428;
    const plateau = (x) => yE - 2.5 * Math.exp(-(((x - XP) / 170) ** 2)) + 1.3 * Math.sin(x / 37 + 1) + 0.8 * Math.sin(x / 17 + 0.3);
    // ── vue rapprochée ──
    const bas = yE < 112;
    const PX0 = 64, PX1 = 416, PY0 = bas ? 124 : 32, PY1 = PY0 + 106;
    const xM = XP - 50;                                             // point de la coupe que montre la vue rapprochée
    const XT = PX0 + 128, XV = PX1 - 62;                            // chaos de boules, vallon du ruisseau
    const sol0 = (x) => PY0 + 42 + 2.2 * Math.sin(x / 23) + 1.4 * Math.sin(x / 9.5 + 2);
    // diaclases : plus espacées en profondeur, et là où elles sont espacées les blocs sont gros — c'est là que se forment
    // les chaos (Linton 1955) ; les joints horizontaux ne se suivent pas d'une colonne à l'autre
    const pres = (x) => Math.exp(-(((x - XT) / 46) ** 2));
    const joints = [PX0 - 8];
    while (joints[joints.length - 1] < PX1 + 8) { const x = joints[joints.length - 1]; joints.push(x + (21 + 30 * pres(x + 15)) * (0.85 + R() * 0.3)); }
    // décapage de l'arène : partout (plus dans le vallon) ; les gros blocs du chaos, eux, restent debout au-dessus
    const decape = (x) => 30 + 3 * Math.sin(x / 31) + 12 * Math.exp(-(((x - XV) / 15) ** 2));
    const solF = (x) => sol0(x) + decape(x);
    const DW = 58;                                                  // profondeur finale du front d'altération
    // altération d'un bloc selon la profondeur de son centre (au-delà de 1 : le noyau fond dans l'arène, sauf les gros blocs)
    const degre = (dW, prof) => Math.max(0, (dW - prof + 4) / 26);
    // noyaux (boules) : un par bloc entre diaclases ; posés à la fin sur le noyau du dessous ou sur le sol décapé
    // taille et position d'un noyau pour une altération a (0 = bloc à peine émoussé, 1 = boule) ; il touche le bas de son bloc
    const noyau = (bl, a) => {
      const k = lerp(0.97, 0.64, Math.min(1, a)) * (a > 1 ? clamp(1 - (a - 1) * 0.9 * (1 - pres(bl.cx))) : 1), hw = bl.demi * k, hh = bl.h / 2 * k * lerp(1, 1.12, Math.min(1, a));
      return { hw, hh, cy: bl.haut + bl.h - hh - 0.5 };
    };
    // contour : du rectangle arrondi (n grand) à l'ellipse (n = 2), un peu irrégulier une fois arrondi
    const contour = (bl, a, cx, cy, hw, hh) => {
      const n = lerp(7, 2.2, a);
      return bl.irr.map((q, m) => {
        const th = m / bl.irr.length * Math.PI * 2, c = Math.cos(th), si = Math.sin(th), f = 1 + q * a;
        return [cx + Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * hw * f, cy + Math.sign(si) * Math.pow(Math.abs(si), 2 / n) * hh * f];
      });
    };
    const blocs = [];
    for (let i = 0; i < joints.length - 1; i++) {
      const xa = joints[i], xb = joints[i + 1], cx = (xa + xb) / 2;
      let appui = solF(cx);                                         // en remontant la colonne, chaque boule repose sur la précédente
      const col = [];
      for (let y = 3, j = 0; y < 90; j++) {
        const h = (10 + 3.5 * j) * (1 + 0.7 * pres(cx)) * (0.85 + R() * 0.3);
        col.push({ cx, xa, xb, demi: (xb - xa) / 2, h, haut: sol0(cx) + y, prof: y + h / 2, irr: Array.from({ length: 28 }, () => (R() - 0.5) * 0.12) });
        y += h;
      }
      for (let j = col.length - 1; j >= 0; j--) {
        const bl = col[j];
        const f = noyau(bl, degre(DW, bl.prof));
        bl.chute = f.cy + f.hh < solF(cx) - 1 ? Math.max(0, Math.min(appui, solF(cx)) - (f.cy + f.hh)) : 0;
        appui = f.cy + bl.chute - f.hh;
        blocs.push(bl);
      }
    }
    const clipId = nid("eg"), clipV = nid("ev"), clipS = nid("es");
    const croute = () => rect(0, 0, W, KM(10), CROUTE[0]) + rect(0, KM(10), W, KM(20) - KM(10), CROUTE[1])
      + rect(0, KM(20), W, KM(35) - KM(20), CROUTE[2]) + rect(0, KM(35), W, H - KM(35), MANTEAU)
      + line(0, KM(35), W, KM(35), "#8d7b5e", 1, { "stroke-dasharray": "5 3" });
    const massif = croute() + encaissant(G, ep) + (G.pF ? zoneFusion(G, 0.18, 1, "#a99577") : "")
      + `<polygon points="${P(contourPile(G, pl))}" fill="#c46a3a" stroke="#c46a3a" stroke-width="18" stroke-linejoin="round" opacity=".3"/>`
      + dessinFilon(G, G.yT + pl.centre, cPl, { trait: "#8f8578" })
      + dessinPile(G, pl, () => cPl, "rgba(90,80,65,.28)")
      + grains.map(([x, y, r, c]) => circ(x, y, r, c, { opacity: 0.75 })).join("");
    return {
      fond: ciel(SURF + 2) + rect(0, SURF + 2, W, H - SURF - 2, "#edf4f7"),
      anim(t, ta) {
        // 1) le toit s'enlève : la chaîne est rabotée jusqu'au cœur du massif
        const e = fen(t, 0.03, 0.55), b = fen(t, 0.8, 0.96);
        const relief = [];
        for (let x = 0; x <= W; x += 5) relief.push([x, lerp(hauteur(RELIEF_CROUTE, x), plateau(x), e) + 4 * b * Math.exp(-(((x - XR) / 12) ** 2))]);
        let s = `<clipPath id="${clipId}"><polygon points="${P(relief.concat([[W, H], [0, H]]))}"/></clipPath><g clip-path="url(#${clipId})">${massif}`;
        // diaclases : le granite se fissure en se rapprochant de la surface (décompression)
        const jo = op(fen(t, 0.3, 0.55) * 0.4);
        if (jo > 0.02) {
          for (const x of diaV) if (ep(x) > 3) s += line(x, G.yT, x, G.yT + ep(x), "#6d5c48", 0.8, { opacity: jo });
          for (let k = 1; k < 4; k++) { const pts = []; for (let x = XP - LARG_P + 8; x <= XP + LARG_P - 8; x += 6) if (ep(x) > k * 5) pts.push([x, G.yT + k * 5]); if (pts.length > 1) s += pline(pts, "#6d5c48", 0.8, { opacity: jo }); }
        }
        s += `</g>` + pline(relief, b > 0.5 ? "#6f9d4f" : "#8f8578", 1.4);
        // règle de profondeur de l'étape 3, qui s'efface quand la surface descend
        const regle = 1 - fen(t, 0.03, 0.15);
        if (regle > 0.02) {
          let r = line(26, SURF, 26, KM(35), "#27302d", 1);
          for (let z = 0; z <= 35; z += 5) r += line(22, KM(z), 26, KM(z), "#27302d", 1) + (z % 10 === 0 ? txt(30, KM(z) + 3.5, z === 0 ? "0" : `${z} km`, { petit: true }) : "");
          s += `<g opacity="${op(regle)}">${r}</g>`;
        }
        // pluie pendant l'érosion
        const yNu = Math.min(hauteur(relief, 120), hauteur(relief, 336));
        s += `<g opacity="${op(fen(t, 0.08, 0.25) * (1 - fen(t, 0.5, 0.6)))}">${nuage(120 + 2 * ta, 12) + nuage(336 + 1.5 * ta, 10, 0.9)
          + pluie(96 + 2 * ta, 20, 60, Math.max(8, yNu - 22), ta, 12, "eg1") + pluie(312 + 1.5 * ta, 18, 56, Math.max(8, yNu - 20), ta, 12, "eg2")}</g>`;
        // 2) vue rapprochée : le front d'altération descend, puis l'arène part et les boules restent
        const z = fen(t, 0.52, 0.6);
        if (z > 0.02) {
          const dW = DW * fen(t, 0.6, 0.8), dec = b;
          const sol = (x) => sol0(x) + decape(x) * dec;
          const yM = hauteur(relief, xM), yBord = bas ? PY0 : PY1;
          let v = "";
          const cielV = degrade("#c3dcea", "#eef5f8");
          v += `<defs>${cielV.def}<clipPath id="${clipV}"><rect x="${PX0}" y="${PY0}" width="${PX1 - PX0}" height="${PY1 - PY0}" rx="4"/></clipPath></defs>`;
          v += `<g clip-path="url(#${clipV})">` + rect(PX0, PY0, PX1 - PX0, PY1 - PY0, cielV.url);
          const xs = []; for (let x = PX0; x <= PX1 + 0.1; x += 3) xs.push(x);
          // granite sain, découpé par les diaclases (verticales et parallèles à la surface)
          v += poly(xs.map((x) => [x, sol(x)]).concat([[PX1, PY1], [PX0, PY1]]), cPl);
          let jt = "";
          for (const x of joints) jt += line(x, sol0(x) + 3, x + 1.5, PY1, "#7d7466", 0.8);
          for (const bl of blocs) jt += line(bl.xa, bl.haut, bl.xb, sol0(bl.xb) - sol0(bl.xa) + bl.haut, "#7d7466", 0.8);
          v += `<clipPath id="${clipS}"><polygon points="${P(xs.map((x) => [x, sol(x)]).concat([[PX1, PY1 + 5], [PX0, PY1 + 5]]))}"/></clipPath><g clip-path="url(#${clipS})">${jt}</g>`;
          // arène : tout ce qui est au-dessus du front d'altération, sous le sol actuel
          if (dW > 0.5) v += poly(xs.map((x) => [x, sol(x)]).concat(xs.slice().reverse().map((x) => [x, Math.max(sol(x), sol0(x) + dW)])), cAr);
          // noyaux sains : d'abord des blocs à peine émoussés, puis des boules
          for (const bl of blocs) {
            const a = degre(dW, bl.prof);
            if (a <= 0.2 || bl.haut > PY1) continue;
            const { hw, hh, cy: cy0 } = noyau(bl, a), cy = cy0 + bl.chute * dec;
            if (hw < bl.demi * 0.22) continue;
            v += poly(contour(bl, Math.min(1, a), bl.cx, cy, hw, hh), cBo, { stroke: "#7d7466", "stroke-width": 0.8, opacity: op((a - 0.2) / 0.12) });
            if (a > 0.5 && cy - hh < sol(bl.cx) + 2) v += ell(bl.cx - hw * 0.35, cy - hh * 0.45, hw * 0.35, hh * 0.22, "#f4f1ea", { opacity: 0.6 });
          }
          // sol et végétation, là où l'arène reste (pas sur le chaos, pas dans le lit du ruisseau)
          const vg = fen(t, 0.86, 0.97);
          if (vg > 0.02) {
            const libre = (x) => Math.abs(x - XT) > 34 && Math.abs(x - XV) > 12;
            let sv = "";
            for (let i = 0; i < xs.length - 1; i++) if (libre(xs[i]) && libre(xs[i + 1])) sv += poly([[xs[i], sol(xs[i])], [xs[i + 1], sol(xs[i + 1])], [xs[i + 1], sol(xs[i + 1]) + 2.4], [xs[i], sol(xs[i]) + 2.4]], "#7a5a3c");
            [[PX0 + 2, XT - 36, 0.7], [XT + 36, XV - 14, 0.2], [XV + 14, PX1 - 2, 0.5]].forEach(([x0, x1, conif], k) => {
              sv += vegetation(sol, x0, x1, alea("egv" + k + p.graine), { pas: 17, echelle: 1.5, coniferes: conif });
            });
            // herbe rase et fougères entre les boules
            for (let x = XT - 40; x <= XT + 40; x += 4.5) { const y = sol(x); sv += line(x, y, x - 0.6, y - 2.2, "#6d8f4c", 0.6) + line(x + 1, y, x + 1.5, y - 1.8, "#6d8f4c", 0.6); }
            v += `<g opacity="${op(vg)}">${sv}</g>`;
          }
          // ruisseau au fond du vallon : l'arène y part en sable
          if (dec > 0.3) {
            const yEau = sol(XV) - 3.5 * dec, lit = [];
            for (let x = XV - 16; x <= XV + 16; x += 1) if (sol(x) > yEau) lit.push([x, sol(x)]);
            if (lit.length > 2) {
              v += poly([[lit[0][0], yEau], ...lit, [lit[lit.length - 1][0], yEau]], "#5d9cc9", { opacity: 0.9 });
              for (let k = 0; k < 2; k++) { const u = (ta * 0.5 + k * 0.5) % 1; v += line(XV - 4 + u * 5, yEau + 0.8, XV - 1 + u * 5, yEau + 0.8, "#d9ecf7", 0.7, { opacity: op(Math.sin(u * Math.PI)) }); }
            }
          }
          // oiseaux
          for (let k = 0; k < 3; k++) {
            const x = PX0 + ((ta * 9 + k * 130) % (PX1 - PX0 + 40)) - 20, y = PY0 + 14 + k * 6 + Math.sin(ta * 1.3 + k) * 2, a = Math.sin(ta * 6 + k * 2) * 1.2;
            v += `<path d="M${r1(x - 3)} ${r1(y - a)} Q${r1(x - 1.5)} ${r1(y - 1.8)} ${r1(x)} ${r1(y)} Q${r1(x + 1.5)} ${r1(y - 1.8)} ${r1(x + 3)} ${r1(y - a)}" fill="none" stroke="#3a3f46" stroke-width=".8"/>`;
          }
          v += `</g>`;
          v += rect(PX0, PY0, PX1 - PX0, PY1 - PY0, "none", { rx: 4, stroke: "#27302d", "stroke-width": 1.2 });
          // étiquettes de la vue rapprochée
          const eA = fen(t, 0.66, 0.72);
          v += txt(PX0 + 6, PY0 + 10, "vue rapprochée : quelques centaines de mètres", { petit: true });
          v += txt(PX0 + 6, PY1 - 5, "diaclases", { petit: true, op: z });
          v += txt(PX1 - 6, sol0(PX1 - 70) + 16, "arène (sable)", { a: "end", petit: true, op: eA * (1 - fen(t, 0.84, 0.9)) });
          const hautChaos = Math.min(...blocs.filter((bl) => Math.abs(bl.cx - XT) < 30).map((bl) => { const f = noyau(bl, degre(dW, bl.prof)); return f.cy + bl.chute * dec - f.hh; }));
          v += txt(XT, hautChaos - 5, "chaos de boules", { a: "middle", petit: true, op: fen(t, 0.9, 0.96) });
          // le cône relie la vue rapprochée à son point sur la coupe
          const cone = poly([[xM, yM], [PX0 + 30, yBord], [PX1 - 30, yBord]], "rgba(255,255,255,.35)") + circ(xM, yM, 4, "none", { stroke: "#27302d", "stroke-width": 1.2 });
          s += `<g opacity="${op(z)}">${cone}${v}</g>`;
        }
        // textes
        const y1 = bas ? Math.max(38, yE - 28) : PY1 + 16;
        const f1 = 1 - fen(t, 0.52, 0.57), f2 = fen(t, 0.58, 0.63) * (1 - fen(t, 0.8, 0.85)), f3 = fen(t, 0.86, 0.92);
        s += txt(240, y1, p.texteErosion || "l'érosion enlève les kilomètres de roches du dessus", { a: "middle", op: f1 });
        s += txt(240, y1, "l'eau s'infiltre par les diaclases :", { a: "middle", op: f2 })
          + txt(240, y1 + 11, "le granite pourrit en arène autour de noyaux sains", { a: "middle", petit: true, op: f2 });
        s += txt(240, y1, p.texteAffleure || "le granite affleure : il se débite en boules et donne de l'arène", { a: "middle", op: f3 })
          + txt(240, y1 + 11, p.texteArene || "l'arène part ensuite vers les rivières", { a: "middle", petit: true, op: f3 });
        s += compteur(396, 18, lerp(p.age3 ?? 325, 0, t));
        return s;
      },
    };
  };

  // ─────────────────────────────── scènes volcaniques (prototype : basalte) ───────────────────────────────
  const PXKM2 = 2, KM2 = (z) => SURF + z * PXKM2;          // coupe profonde : 0 à 100 km
  const PXKP = 0.74, KP = (z) => SURF + z * PXKP;         // coupe très profonde : 0 à 260 km (kimberlite, komatiite)
  function coupeManteau(o = {}) {
    if (o.profond) {
      const R = alea("mp" + (o.graine || ""));
      let s = ciel(SURF + 2) + rect(0, SURF, W, KP(15) - SURF, CROUTE[0]) + rect(0, KP(15), W, KP(o.moho || 40) - KP(15), CROUTE[2]) + rect(0, KP(o.moho || 40), W, H - KP(o.moho || 40), MANTEAU);
      if (o.lithos) s += rect(0, KP(o.lithos), W, H - KP(o.lithos), "#b3a26e", { opacity: 0.35 })
        + line(0, KP(o.lithos), W, KP(o.lithos), "#8d7b5e", 1, { "stroke-dasharray": "5 3" }) + txt(W - 8, KP(o.lithos) - 4, o.labLithos || "base de la lithosphère", { a: "end", petit: true });
      s += line(0, KP(o.moho || 40), W, KP(o.moho || 40), "#8d7b5e", 1, { "stroke-dasharray": "5 3" }) + txt(o.loupe ? 330 : W - 8, KP(o.moho || 40) - 4, "Moho", { a: "end", petit: true });
      for (let i = 0; i < 90; i++) s += ell(R() * W, KP(o.moho || 40) + 6 + R() * (H - KP(o.moho || 40) - 8), 3 + R() * 3, 2 + R() * 2, "#98a066", { opacity: 0.5 });
      s += line(26, SURF, 26, H - 4, "#27302d", 1);
      for (let z = 0; z <= 250; z += 50) s += line(22, KP(z), 26, KP(z), "#27302d", 1) + txt(30, KP(z) + 3.5, z === 0 ? "0" : `${z} km`, { petit: true });
      return s;
    }
    let s = ciel(SURF + 2);
    const moho = o.ocean ? 11 : 30;                                 // océan : 4 km d'eau puis 7 km de croûte océanique
    if (o.ocean) s += rect(0, SURF, W, KM2(4) - SURF, "#5f97bd") + rect(0, KM2(4), W, KM2(11) - KM2(4), "#4b5752")
      + rect(0, KM2(11), W, H - KM2(11), MANTEAU) + txt(64, KM2(4) - 1, "océan", { petit: true, clair: true })
      + txt(64, KM2(8.5) + 3, "croûte océanique (7 km)", { petit: true, clair: true });
    else s += rect(0, SURF, W, KM2(10) - SURF, CROUTE[0]) + rect(0, KM2(10), W, KM2(20) - KM2(10), CROUTE[1])
      + rect(0, KM2(20), W, KM2(30) - KM2(20), CROUTE[2]) + rect(0, KM2(30), W, H - KM2(30), MANTEAU);
    // ile : une île volcanique posée sur le fond de l'océan, à l'échelle vraie (La Réunion : ≈ 70 km de large au niveau de la
    // mer, 2 632 m au Piton de la Fournaise, 4 km d'eau autour) — c'est elle qu'on retrouve à l'étape de l'éruption
    if (o.ile) {
      const ile = []; for (let x = 0; x <= W; x += 4) ile.push([x, KM2(4) - 13.2 * Math.exp(-(((x - 240) / 110) ** 2))]);
      s += poly(ile.concat([[W, KM2(4) + 1], [0, KM2(4) + 1]]), "#5d564f") + pline(ile.filter(([, y]) => y < SURF), "#6d8a4a", 1.2)
        + txt(330, 30, o.ile === true ? "La Réunion, île volcanique" : o.ile, { petit: true });
    }
    s += line(0, KM2(moho), W, KM2(moho), "#8d7b5e", 1, { "stroke-dasharray": "5 3" }) + txt(o.loupe ? 300 : W - 8, KM2(moho) + (o.ocean ? 11 : -5), "Moho", { a: "end", petit: true });
    const R = alea("mt" + (o.graine || ""));
    for (let i = 0; i < 90; i++) s += ell(R() * W, KM2(moho) + 6 + R() * (H - KM2(moho) - 8), 3 + R() * 3, 2 + R() * 2, "#98a066", { opacity: 0.5 });
    s += line(26, SURF, 26, H - 4, "#27302d", 1);
    for (let z = 0; z <= 100; z += 10) {
      s += line(22, KM2(z), 26, KM2(z), "#27302d", 1);
      if (z % 20 === 0 && z < 100) s += txt(30, KM2(z) + 3.5, z === 0 ? "0" : `${z} km`, { petit: true });
    }
    return s;
  }

  // 1 · fusion partielle du manteau qui remonte
  SCENES.fusionManteau = function (p) {
    const R = alea("fm" + p.graine), K = p.profond ? KP : KM2;
    const zH = p.zFusion ? p.zFusion[0] : 60, zB = p.zFusion ? p.zFusion[1] : 100;
    const cy = (K(zH) + K(zB)) / 2, ry = (K(zB) - K(zH)) / 2;
    const gouttes = Array.from({ length: 60 }, () => {
      const a = R() * Math.PI * 2, d = Math.sqrt(R());
      return { x: 240 + Math.cos(a) * 140 * d, y: cy + Math.sin(a) * ry * d, r: 1.4 + R() * 2, ph: R() };
    });
    const L = loupe(400, 96, 52, { fond: "#98a066" });
    // dans la loupe : grains du manteau, le liquide apparaît entre eux
    const sites = [];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) sites.push([352 + i * 17 + (j % 2) * 8 + (R() - 0.5) * 6, 48 + j * 16 + (R() - 0.5) * 6]);
    const cells = voronoi(sites, 346, 42, 454, 150).map((pg) => ({ pg, c: centre(pg), col: R() < 0.6 ? "#a7b06e" : "#c3b98b" }));
    return {
      fond: coupeManteau({ graine: p.graine, ocean: p.ocean, ile: p.ile, loupe: true, profond: p.profond, lithos: p.lithos, labLithos: p.labLithos }) + L.fond,
      anim(t, ta) {
        let s = "";
        // le manteau remonte sous l'amincissement de la croûte
        for (let i = 0; i < 4; i++) {
          const x = 150 + i * 60, u = (ta * 0.2 + i * 0.25) % 1;
          const ya = p.profond ? K(zB) + 8 : K(90), yb = p.profond ? K(zB) - 12 : K(70);
          s += fleche(x, ya - u * 20, x, yb - u * 24, { c: "#c0392b", sw: 1.5, pointe: 6, op: 0.2 + 0.5 * Math.sin(u * Math.PI) });
        }
        const e = fen(t, 0.05, 0.85);
        s += ell(240, cy, 140 * e, ry * e, MAGMA, { opacity: op(0.18 * e) });
        for (const g of gouttes) {
          const a = fen(t, 0.05 + g.ph * 0.6, 0.35 + g.ph * 0.6);
          if (a > 0.02) s += circ(g.x, g.y + Math.sin(ta * 0.5 + g.ph * 6) * 0.8, g.r * a, MAGMA, { opacity: op(0.5 + 0.5 * a) });
        }
        const labF = `fusion partielle du manteau : ${p.tFusion || "1 250 à 1 350 °C"}`;
        s += txt(Math.min(240, 340 - labF.length * 2.8), K(zH) - 10, labF, { a: "middle" });
        if (!p.ocean) s += txt(150, SURF + 14, p.labSurface || "croûte étirée, amincie", { petit: true });
        // loupe : le liquide s'insinue entre les grains d'olivine et de pyroxène
        let d = "";
        const f = fen(t, 0.15, 0.9);
        for (const c of cells) d += poly(echelle(c.pg, c.c, lerp(1, 0.9, f)), c.col, { stroke: "#7d8455", "stroke-width": 0.7 });
        s += L.dans(rect(346, 42, 110, 110, MAGMA) + d) + L.bord;
        s += txt(400, 160, "entre les grains du manteau,", { a: "middle", petit: true })
          + txt(400, 171, `${nombre(lerp(0, p.pctFusion || 8, f))} % de liquide`, { a: "middle", petit: true });
        return s;
      },
    };
  };

  // 2 · montée rapide du magma basaltique
  SCENES.monteeBasalte = function (p) {
    const R = alea("mb" + p.graine), K = p.profond ? KP : KM2;
    const zDep = p.zFusion ? p.zFusion[0] : 60;
    const bulles = Array.from({ length: 22 }, () => ({ dx: (R() - 0.5) * 8, ph: R(), r: 1 + R() * 1.4 }));
    return {
      fond: coupeManteau({ graine: p.graine, ocean: p.ocean, ile: p.ile, profond: p.profond, lithos: p.lithos, labLithos: p.labLithos }),
      anim(t, ta) {
        // île : le magma traverse l'île et monte jusqu'au sommet (étape suivante : l'éruption sur son flanc)
        const e = fen(t, 0.03, 0.92), yTete = lerp(K(zDep), p.ile ? KM2(-2.2) : K(p.zArret || (p.ocean ? 4 : 1)), e);
        let s = ell(240, K(zDep) + 12, 120 * (1 - e * 0.6), 9, MAGMA, { opacity: 0.28 });
        // dyke : une fracture remplie de magma qui monte
        s += rect(236, yTete, 9, K(zDep) + 10 - yTete, MAGMA, { rx: 3 });
        const rT = p.ile ? lerp(11, 4, fen(e, 0.8, 1)) : 11;                // dans l'île, la tête s'amincit en filon
        s += circ(240, yTete + 1, rT, MAGMA) + ell(236, yTete - 3, rT * 0.4, rT * 0.27, MAGMA_CLAIR, { opacity: 0.6 });
        for (const b of bulles) {
          const u = (b.ph + ta * 0.5) % 1, y = lerp(K(zDep), yTete, u);
          if (y > yTete) s += circ(240 + b.dx, y, b.r, MAGMA_CLAIR, { opacity: 0.6 });
        }
        s += txt(262, clamp(yTete - 6, 56, 150), "le magma monte vite :", { petit: true })
          + txt(262, clamp(yTete + 5, 67, 161), p.vitesse || "quelques jours à quelques semaines", { petit: true });
        if (p.zArret) { const c = fen(t, 0.75, 1); s += ell(240, K(p.zArret), 12 + 50 * c, 6 + 6 * c, MAGMA); }
        if (p.ile) {
          const c = fen(e, 0.85, 1);
          s += ell(240, KM2(1), 18, 4, MAGMA, { opacity: 0.9 }) + [...Array(7)].map((_, k) => circ(228 + k * 4, KM2(1) + 1.5 - (k % 2), 1.1, "#b9cf6a")).join("");
          s += line(226, KM2(1) - 2, 206, 24, "#27302d", 0.7, { opacity: op(c) }) + txt(204, 21, "réservoir : le magma s'y charge", { a: "end", petit: true, op: c })
            + txt(204, 32, "de cristaux d'olivine accumulés", { a: "end", petit: true, op: c });
        }
        s += txt(240, Math.min(K(zDep) + 30, H - 8), p.texte || "il ouvre une fracture (dyke) et s'y engouffre", { a: "middle" });
        return s;
      },
    };
  };

  // 3 · éruption : fontaine de lave et coulée (refaite le 24/09/2026 : « il y a une incohérence visuelle » — la coulée était
  // un gros trait posé PAR-DESSUS le cône, de même épaisseur partout). Vue de profil : la coulée est une NAPPE posée sur le
  // relief (mince sur la pente raide, épaisse sur le plat), qui sort par une brèche au pied du cône (Chaîne des Puys :
  // cônes « égueulés »), avance de moins en moins vite en refroidissant, garde une croûte noire qui se fissure (lueurs) et un
  // front incandescent d'où roulent des blocs. p.mer : la pente descend jusqu'à la mer, la lave y entre en vapeur (Piton de la
  // Fournaise, avril 2007) ; p.fissure : rempart de scories bas le long d'une fissure (komatiite).
  SCENES.eruptionCoulee = function (p) {
    const MAGMA = (p.lave || [])[0] || "#e0532b", MAGMA_CLAIR = (p.lave || [])[1] || "#f3a13d";
    const noire = p.lave ? melange(MAGMA, "#1e1a17", 0.55) : "#3a332e";
    const R = alea("ec" + p.graine);
    const mer = !!p.mer, xC = mer ? 110 : 120, MERY = 196;
    // relief : plaine ondulée (ou pente jusqu'à la mer) + cône de scories
    const plaine = (x) => mer ? (x < 360 ? 118 + (Math.max(0, x) / 360) ** 1.3 * 70 + 2 * Math.sin(x / 23) : 188 + (x - 360) * 0.25) : 176 - 5 * Math.sin(x / 61 + 0.6) - 3 * Math.sin(x / 17) * 0.3;
    const HC = p.fissure ? 12 : 64, RC = p.fissure ? 40 : 62;
    // le cône est posé SUR le relief (sur une pente, il suit la pente)
    const cone = (x) => { const d = Math.abs(x - xC); if (d >= RC) return 999; const y = plaine(x) - HC * (1 - d / RC) ** 0.9; return d < 9 && !p.fissure ? y + 6 * (1 - d / 9) : y; };
    const sol = (x) => Math.min(plaine(x), cone(x));
    const topC = plaine(xC) - HC + 6;
    // chemin de la lave : sort du cratère (fissure) ou par la brèche au pied aval du cône, puis suit la pente
    const x0 = p.fissure ? xC + 4 : xC + RC * 0.84, x1 = mer ? 392 : 466;
    const epais = (x) => { const dx = 2; const pente = Math.abs(sol(x + dx) - sol(x - dx)) / (2 * dx); return clamp(7.5 - pente * 9, 2, 7.5); };
    const blocs = Array.from({ length: 10 }, () => ({ ph: R(), r: 1.2 + R() * 1.4 }));
    const fentes = Array.from({ length: 26 }, () => ({ u: R(), l: 3 + R() * 5, ph: R() * 6 }));
    const lapilli = Array.from({ length: 34 }, () => ({ ph: R(), vx: (R() - 0.5) * 3.4, r: 1.2 + R() * 1.6, h: 36 + R() * 34 }));
    let fond = ciel(H);
    const terre = []; for (let x = -2; x <= W + 2; x += 3) terre.push([x, plaine(x)]);
    fond += poly(terre.concat([[W + 2, H + 2], [-2, H + 2]]), mer ? "#6f6a5f" : "#8fa36a");
    if (mer) {                                                          // l'eau seulement là où le relief passe sous le niveau de la mer
      const eau = terre.filter(([x, y]) => y > MERY);
      if (eau.length) fond += poly(eau.map(([x]) => [x, MERY]).concat(eau.slice().reverse()), "#4f84ad", { opacity: 0.92 });
      fond += line(eau.length ? eau[0][0] : W, MERY, W, MERY, "#dbe9f1", 1) + txt(W - 8, H - 8, "l'océan Indien", { a: "end", petit: true, clair: true });
      fond += txt(16, 150, p.labRelief || "flanc du Piton de la Fournaise", { petit: true, clair: true });
    }
    const coneP = []; for (let x = xC - RC; x <= xC + RC; x += 2) coneP.push([x, Math.min(cone(x), plaine(x))]);
    for (let x = xC + RC; x >= xC - RC; x -= 2) coneP.push([x, plaine(x) + 1]);
    fond += poly(coneP, "#5a534d");
    return {
      fond,
      anim(t, ta) {
        let s = "";
        const act = 1 - fen(t, 0.86, 1);                                    // l'éruption faiblit à la fin
        for (let i = 0; i < 5; i++) { const u = (ta * 0.18 + i * 0.2) % 1; s += circ(xC + Math.sin(u * 4 + i) * 12, topC - 14 - u * 52, 8 + u * 12, "#8b8580", { opacity: op(0.45 * (1 - u) * (0.4 + 0.6 * act)) }); }
        for (const l of lapilli) {
          const u = (l.ph + ta * 0.55) % 1, y = topC - Math.sin(u * Math.PI) * l.h * (0.5 + 0.5 * act), x = xC + l.vx * u * 22 + (p.fissure ? (l.ph - 0.5) * 30 : 0);
          if (y < sol(x)) s += circ(x, y, l.r, u < 0.5 ? MAGMA_CLAIR : MAGMA, { opacity: op((1 - u * 0.5) * act) });
        }
        s += ell(xC, topC + 1, p.fissure ? 26 : 9, 3.5, MAGMA_CLAIR, { opacity: op(0.4 + 0.6 * act) });
        // avancée du front : vite au début, de plus en plus lente (la lave refroidit et s'épaissit)
        const u = fen(t, 0.08, 0.95), xf = lerp(x0, x1, 1 - (1 - u) ** 1.7);
        if (xf > x0 + 1) {
          const haut = [], bas = [];
          for (let x = x0; x <= xf; x += 2) { const q = clamp((xf - x) / 7) * clamp((x - x0) / 8 + 0.25), e = epais(x) * (0.35 + 0.65 * Math.sqrt(q)); haut.push([x, sol(x) - e]); bas.push([x, sol(x) + 0.6]); }
          haut.push([xf, sol(xf) - 1]);
          const corps = haut.concat(bas.reverse());
          s += poly(corps, noire, { stroke: "#1f1b18", "stroke-width": 0.6 });
          // lave encore rouge : chenal près de la source, front incandescent, lueurs dans les fentes de la croûte
          const chenal = []; for (let x = x0; x <= Math.min(xf, x0 + 70); x += 2) chenal.push([x, sol(x) - epais(x) * 0.55]);
          if (chenal.length > 1) s += pline(chenal, MAGMA, 1.6, { opacity: op(0.8 * act) });
          if (!p.fissure) s += ell(x0 + 1, sol(x0) - 2, 3, 2.4, MAGMA_CLAIR, { opacity: op(0.9 * act) });
          const nf = []; for (let x = Math.max(x0, xf - 16); x <= xf; x += 1.5) { const q = clamp((xf - x) / 7), e = epais(x) * (0.35 + 0.65 * Math.sqrt(q)); nf.push([x, sol(x) - e * 0.85]); }
          if (nf.length > 1) s += poly(nf.concat([[xf + 0.5, sol(xf) + 0.4], [Math.max(x0, xf - 16), sol(Math.max(x0, xf - 16)) + 0.4]]), MAGMA, { opacity: op(0.35 + 0.65 * (1 - u * 0.6)) });
          for (const f of fentes) {
            const x = lerp(x0, xf, f.u), e = epais(x);
            if (x > xf - 6) continue;
            s += line(x, sol(x) - e + 0.5, x + 0.8, sol(x) - e + f.l * 0.35, MAGMA_CLAIR, 0.9, { opacity: op((0.3 + 0.3 * Math.sin(ta * 2.2 + f.ph)) * (1 - (x - x0) / (x1 - x0) * 0.6)) });
          }
          // blocs de croûte qui roulent au front (coulée en « gratons »)
          for (const b of blocs) {
            const v = (b.ph + ta * 0.5) % 1, bx = xf - 4 + v * 7, by = sol(xf) - epais(xf) * (1 - v) - 1;
            s += rect(bx - b.r, by - b.r, 2 * b.r, 2 * b.r, v < 0.5 ? "#4a3a30" : noire, { opacity: op(Math.sin(v * Math.PI) * (1 - u * 0.5)) });
          }
          // entrée dans la mer : panache de vapeur blanche et petit delta de lave
          if (mer && xf > 360) {
            const v = fen(xf, 360, 380);
            for (let k = 0; k < 6; k++) { const w = (ta * 0.22 + k / 6) % 1; s += circ(xf + 4 + Math.sin(w * 5 + k) * 5, MERY - 6 - w * 46, 5 + w * 11, "#f4f4f2", { opacity: op(0.75 * v * (1 - w)) }); }
            s += txt(xf - 4, MERY - 60, "vapeur : la lave entre dans la mer", { a: "end", petit: true, op: v });
          }
        }
        s += txt(xC, p.fissure ? topC - 80 : topC - 64, p.fissure ? "lave jaillie d'une fissure" : "fontaine de lave", { a: "middle", op: 0.4 + 0.6 * act });
        if (!p.fissure) s += txt(x0 + 4, sol(x0) + 16, "la lave sort par une brèche au pied du cône", { petit: true, op: fen(t, 0.06, 0.14) * (1 - fen(t, 0.5, 0.6)) });
        s += txt(mer ? 300 : 470, mer ? 70 : 132, `la coulée avance, de plus en plus lentement · ${p.laveT || "1 100 à 1 200 °C"}`, { a: mer ? "middle" : "end", petit: true, op: fen(t, 0.2, 0.3) });
        s += txt(mer ? 300 : 470, mer ? 81 : 143, "croûte noire dessus, lave encore rouge dessous", { a: mer ? "middle" : "end", petit: true, op: fen(t, 0.35, 0.45) });
        s += compteur(396, 18, p.age ?? 0.0084, { sous: p.sousEruption || "", libelle: p.libelleAge });
        return s;
      },
    };
  };

  // 4 · refroidissement de la coulée : croûte, microlites, prismes
  SCENES.refroidissementCoulee = function (p) {
    const R = alea("rc" + p.graine);
    const y0 = 70, y1 = 170, xFin = 268;                     // la coulée en coupe
    const prismes = Array.from({ length: 14 }, (_, i) => 30 + i * 18 + (R() - 0.5) * 5);
    const cumulats = Array.from({ length: 90 }, () => ({ x: 6 + R() * (xFin - 12), h: R() * R(), ph: R() }));      // komatiite : olivine tassée au bas
    const L = loupe(400, 108, 52, { fond: "#2b2724" });
    const micro = Array.from({ length: 76 }, () => ({ x: 348 + R() * 104, y: 56 + R() * 104, a: R() * 180, l: 4 + R() * 6, ph: R() }));
    // phénocristaux déjà présents avant l'éruption (grandis dans le réservoir) : p.phenos = [["olivine" | "plagioclase" | "pyroxene", n]]
    const phenos = [];
    for (const [type, n] of p.phenos || []) for (let i = 0; i < n; i++) phenos.push({ type, x: 356 + R() * 88, y: 64 + R() * 88, a: R() * 180, r: 4 + R() * 4 });
    return {
      fond: ciel(y0) + rect(0, y1, W, H - y1, "#8a8071") + txt(10, H - 10, "sol brûlé sous la coulée", { petit: true }) + L.fond,
      anim(t, ta) {
        const e = fen(t, 0.05, 0.95);
        let s = rect(0, y0, xFin, y1 - y0, "#7a3a28");
        // croûtes noires qui épaississent par le haut et par le bas
        const ep = lerp(2, 26, e);
        s += rect(0, y0, xFin, ep, "#2f2b28") + rect(0, y1 - ep, xFin, ep, "#2f2b28");
        // prismes de retrait qui progressent vers le cœur
        if (p.spinifex) {
          const zs = (y0 + y1) / 2 + 6;
          for (let x = 8; x < xFin - 4; x += 7) { const a = Math.sin(x * 1.7) * 0.5, l = lerp(0, zs - y0 - ep, fen(t, 0.1, 0.9)); s += line(x, y0 + ep, x + Math.sin(a) * l, y0 + ep + Math.cos(a) * l, "#8fa36a", 1, { opacity: 0.85 }); }
          for (const c of cumulats) { const yy = y1 - ep - 2 - c.h * 30 * fen(t, 0.05, 0.9); s += circ(c.x, yy, 1.6, "#6f8a4a", { opacity: op(fen(t, 0.05 + c.ph * 0.4, 0.4 + c.ph * 0.4)) }); }
        }
        if (!p.spinifex) for (const x of prismes) {
          if (x > xFin - 4) continue;
          s += line(x, y0 + 1, x, y0 + lerp(2, (y1 - y0) / 2 - 2, e), "rgba(20,18,16,.75)", 1.1)
            + line(x, y1 - 1, x, y1 - lerp(2, (y1 - y0) / 2 - 2, e), "rgba(20,18,16,.75)", 1.1);
        }
        s += txt(10, y0 - 8, p.spinifex ? "la coulée fige : aiguilles d'olivine en haut, cristaux accumulés en bas" : "la coulée fige : croûte noire, puis prismes (orgues)", { petit: false });
        s += txt(xFin / 2, (y0 + y1) / 2 + 3, e < 0.6 ? "cœur encore rouge" : "cœur figé", { a: "middle", clair: true });
        // loupe : microlites de plagioclase dans le verre
        let d = rect(344, 52, 116, 116, e < 0.5 ? "#4a2b22" : "#2b2724");
        for (const m of micro) {
          const k = fen(t, 0.15 + m.ph * 0.5, 0.5 + m.ph * 0.5);
          if (k <= 0.02) continue;
          const dx = Math.cos(m.a * Math.PI / 180) * m.l * k, dy = Math.sin(m.a * Math.PI / 180) * m.l * k;
          d += line(m.x - dx, m.y - dy, m.x + dx, m.y + dy, "#e6e2d8", 1.5, { opacity: op(0.9 * k) });
        }
        if (p.spinifex) for (let g = 0; g < 5; g++) { const x0 = 356 + g * 22, a0 = -1.2 + g * 0.5; for (let k = 0; k < 7; k++) { const kk = fen(t, 0.1 + g * 0.08, 0.6 + g * 0.06); d += line(x0, 64 + k * 3, x0 + Math.cos(a0 + k * 0.08) * 70 * kk, 64 + k * 3 + Math.sin(a0 + k * 0.08 + 1.6) * 70 * kk, "#d2dcae", 1.6); } }
        for (const f of phenos) {
          const c = Math.cos(f.a * Math.PI / 180), sn = Math.sin(f.a * Math.PI / 180);
          const pts = f.type === "plagioclase" ? [[-1.6, -0.5], [1.6, -0.5], [1.6, 0.5], [-1.6, 0.5]] : f.type === "pyroxene" ? [[-1, -0.7], [0.4, -1], [1, -0.3], [0.9, 0.6], [-0.3, 1], [-1, 0.4]] : [[-1.1, 0], [-0.5, -0.8], [0.6, -0.8], [1.1, 0], [0.6, 0.8], [-0.5, 0.8]];
          const g = pts.map(([u, v]) => [f.x + (u * c - v * sn) * f.r, f.y + (u * sn + v * c) * f.r]);
          d += poly(g, f.type === "plagioclase" ? "#f4f1ea" : f.type === "pyroxene" ? "#c9b98a" : "#d2dcae", { stroke: "#4a463f", "stroke-width": 0.8 });
          if (f.type === "olivine") d += line(g[1][0], g[1][1], g[4][0], g[4][1], "rgba(60,55,45,.5)", 0.6);
          if (f.type === "plagioclase") d += line(g[0][0] * 0.5 + g[3][0] * 0.5, g[0][1] * 0.5 + g[3][1] * 0.5, g[1][0] * 0.5 + g[2][0] * 0.5, g[1][1] * 0.5 + g[2][1] * 0.5, "rgba(60,55,45,.35)", 0.6);
        }
        s += L.dans(d) + L.bord;
        const lg = p.legende || ["au microscope : baguettes", "de plagioclase dans le verre"];
        s += txt(400, 176, lg[0], { a: "middle", petit: true }) + txt(400, 187, lg[1], { a: "middle", petit: true });
        s += thermometre(296, 62, 112, lerp(1150, 100, e), 0, 1200, [200, 700, 1100]);
        s += compteur(396, 18, p.age ?? 0.0084, { sous: p.dureeRefroid || "de quelques jours à quelques années", libelle: p.libelleAge });
        return s;
      },
    };
  };

  // ─────────────────────────────── scènes carbonatées (prototype : calcaire) ───────────────────────────────
  // 1 · mer chaude et peu profonde : les organismes fabriquent leur calcaire
  SCENES.merCarbonatee = function (p) {
    const R = alea("mc" + p.graine);
    const MER = 54, FOND = 196;
    const coraux = Array.from({ length: 6 }, (_, i) => [52 + i * 60 + (R() - 0.5) * 14, 10 + R() * 8]);
    const coquilles = Array.from({ length: 14 }, () => [24 + R() * 330, FOND - 2 - R() * 8, 3 + R() * 3, R() * 180]);
    const algues = Array.from({ length: 9 }, () => [30 + R() * 330, R()]);
    const cristaux = Array.from({ length: 22 }, () => ({ ph: R(), dx: (R() - 0.5) * 40, r: 1.6 + R() * 1.6 }));
    // fines particules de calcite en suspension dans toute la tranche d'eau
    const suspension = Array.from({ length: 70 }, () => ({ x: R() * 372, y0: MER + 8 + R() * (FOND - MER - 20), ph: R(), r: 0.7 + R() * 1 }));
    const JX = 412, JY = 56, JH = 132, SEUIL = 0.26;      // jauge : hauteur du seuil de saturation
    const eauG = degrade("#7fc6df", "#3f95b8");
    return {
      fond: ciel(MER) + soleil(52, 22) + `<defs>${eauG.def}</defs>` + rect(0, MER - 2, W, H - MER + 2, eauG.url)
        + rect(0, FOND, W, H - FOND, "#e4dcc2")
        + rect(JX - 17, JY - 16, 34, JH + 32, "rgba(255,255,255,.82)", { rx: 8, stroke: "rgba(0,0,0,.12)" })
        + rect(JX - 11, JY, 22, JH, "#ffffff", { rx: 5, stroke: "#27302d", "stroke-width": 1 }),
      anim(t, ta) {
        let s = "";
        let v = `M0 ${MER}`;
        for (let x = 0; x <= W; x += 4) v += ` L${x} ${r1(MER + 1.6 * Math.sin(x / 34 * Math.PI * 2 - ta * 2.1))}`;
        s += `<path d="${v}" fill="none" stroke="#eef6fa" stroke-width="1.6" opacity=".9"/>`;
        const g = fen(t, 0.05, 0.9);
        for (const [x, h] of coraux) {
          const hh = h * (0.4 + 0.6 * g);
          s += `<g opacity=".95">${rect(x - 1.6, FOND - hh, 3.2, hh, "#d9b9a0")}${ell(x, FOND - hh, 6, 4, "#e6cbb4")}${ell(x - 6, FOND - hh * 0.7, 4, 3, "#e6cbb4")}${ell(x + 6, FOND - hh * 0.75, 4, 3, "#e6cbb4")}</g>`;
        }
        for (const [x, ph] of algues) {
          const o = Math.sin(ta * 0.8 + ph * 6) * 3;
          s += `<path d="M${r1(x)} ${FOND} q${r1(o)} -8 ${r1(o * 0.6)} -16" fill="none" stroke="#6f9d6a" stroke-width="2" stroke-linecap="round" opacity="${op(0.6 + 0.4 * g)}"/>`;
        }
        for (const [x, y, r, a] of coquilles) s += `<g transform="rotate(${r1(a)} ${r1(x)} ${r1(y)})">${ell(x, y, r, r * 0.55, "#efe6d0", { stroke: "#c6b79a", "stroke-width": 0.6 })}</g>`;
        s += txt(186, FOND - 34, "coquillages, coraux et algues bâtissent leur squelette en calcite", { a: "middle" });
        // jauge verticale : le calcium dissous monte, et au-dessus du seuil la calcite précipite
        const niv = lerp(0.06, 0.92, fen(t, 0.05, 0.75));
        const yDe = (u) => JY + JH - u * JH;
        s += rect(JX - 11, yDe(niv), 22, niv * JH, niv > SEUIL ? "#5ba7c9" : "#9dc6d8", { rx: 4 });
        s += line(JX - 15, yDe(SEUIL), JX + 15, yDe(SEUIL), "#c0392b", 1.8, { "stroke-dasharray": "5 3" });
        s += txt(JX, JY - 6, "calcium dissous", { a: "middle", petit: true });
        s += txt(JX + 18, yDe(SEUIL) + 3.5, "seuil", { petit: true });
        s += txt(JX, JY + JH + 14, niv > SEUIL ? `≈ ${nombre(lerp(1, 5, fen(t, 0.2, 0.8)))} fois le seuil` : "sous le seuil", { a: "middle", petit: true });
        s += txt(JX, JY + JH + 26, "la calcite précipite", { a: "middle", petit: true, op: fen(t, 0.25, 0.45) });
        // au-dessus du seuil, l'eau se trouble : des particules de calcite flottent partout
        if (niv > SEUIL) {
          const trouble = fen(t, 0.2, 0.6);
          for (const g of suspension) {
            const y = g.y0 + Math.sin(ta * 0.35 + g.ph * 7) * 4 + trouble * 6;
            s += circ(g.x + Math.sin(ta * 0.22 + g.ph * 9) * 5, y, g.r, "#ffffff", { opacity: op(0.75 * trouble) });
          }
          s += txt(186, MER + 24, "l'eau se charge de fines particules de calcite", { a: "middle", clair: true, op: fen(t, 0.3, 0.55) });
        }
        // les cristaux nés au-dessus du seuil tombent vers le fond
        if (niv > SEUIL) for (const c of cristaux) {
          const u = (c.ph + ta * 0.18) % 1, x = JX + c.dx * (0.4 + u), y = lerp(yDe(niv) + 6, FOND - 6, u);
          if (x > 360 && x < 470) s += poly(formeGrain(alea("cz" + c.ph), c.r, 6)(0.25, x, y, u * 6), "#f2ecdc", { stroke: "#c9bda0", "stroke-width": 0.6, opacity: op(Math.min(u * 5, (1 - u) * 5, 0.95)) });
        }
        s += compteur(186, 20, lerp(p.age0 ?? 168, p.age1 ?? 166, t), { sous: p.sousMer || "plate-forme de moins de 100 m de fond" });
        return s;
      },
    };
  };

  // 2 · la boue calcaire et les débris s'accumulent : un lit après l'autre, tous de la même épaisseur
  SCENES.accumulationCarbonatee = function (p) {
    const R = alea("ac" + p.graine);
    const MER = 40, BASE = 208, EP = 7, N = 8;
    const chutes = Array.from({ length: 48 }, () => ({ x: 20 + R() * 450, ph: R(), r: 1 + R() * 1.4, coq: R() < (p.coquilles ?? 0.25) }));
    const eauG = degrade(...(p.eau || ["#8cc2de", "#4d8fb5"]));
    const CL = p.couleurs || ["#e7dfc6", "#f0ead8"], CP = p.particules || "#f0ead8";
    return {
      fond: `<defs>${eauG.def}</defs>` + rect(0, 0, W, H, eauG.url) + rect(0, BASE, W, H - BASE, p.couleurFond || "#cfc6ab")
        + txt(10, H - 10, p.fond || "fond de la plate-forme", { petit: true })
        + (p.ccd ? line(0, 120, W, 120, "#ffffff", 1, { "stroke-dasharray": "5 4", opacity: 0.8 }) + txt(W - 8, 115, p.ccd, { a: "end", petit: true, clair: true }) : ""),
      anim(t, ta) {
        const pose = t * N, haut = BASE - Math.min(N, pose) * EP;
        let s = "";
        for (const g of chutes) {
          const u = (g.ph + ta * 0.12) % 1, x = g.x + 5 * Math.sin(u * 6 + g.ph * 20), y = lerp(MER, haut - 3, u);
          if (p.ccd && g.coq && y > 120) continue;                               // sous la profondeur de compensation, la calcite se dissout
          s += g.coq ? ell(x, y, g.r * 2, g.r, p.couleurCoq || "#efe6d0", { opacity: op(Math.min(u * 6, (1 - u) * 12, 0.95)) })
            : circ(x, y, g.r, CP, { opacity: op(Math.min(u * 6, (1 - u) * 12, 0.9)) });
        }
        // chaque lit apparaît à son tour et garde son épaisseur
        for (let i = 0; i < N; i++) {
          const k = clamp(pose - i);
          if (k <= 0.01) break;
          const y = BASE - (i + 1) * EP;
          s += rect(0, y, W, EP + 0.5, i % 2 ? CL[0] : CL[1], { opacity: op(Math.min(1, k * 2)) });
          const R2 = alea("lit" + i + p.graine);
          for (let c = 0; c < (p.coquilles ?? 0.25) * 24; c++) s += ell(R2() * W, y + EP / 2, 2.6, 1.3, p.couleurCoq || "#d8cdae", { opacity: op(Math.min(1, k * 2) * 0.9) });
        }
        s += txt(240, Math.max(52, haut - 12), p.texte || "la boue calcaire et les débris couvrent le fond", { a: "middle", clair: true });
        s += txt(10, 22, `${nombre(Math.min(N, Math.floor(pose)))} lits déposés · ${p.rythme || "≈ 25 m de boue par million d'années"}`, { petit: true, clair: true });
        s += compteur(396, 18, lerp(p.age0 ?? 166, p.age1 ?? 163, t));
        return s;
      },
    };
  };

  // 4 · le niveau de la mer baisse : le calcaire émerge, il ne reste que des flaques
  SCENES.emersion = function (p) {
    const R = alea("em2" + p.graine);
    const MER0 = 56;
    // le toit du calcaire n'est pas plat : bosses et creux, d'où les flaques
    const topCalc = (x) => 128 - 9 * Math.sin(x * 0.021) - 5 * Math.sin(x * 0.047 + 1.2) - 3 * Math.sin(x * 0.011 + 0.4);
    const coquilles = Array.from({ length: 16 }, () => [R() * W, 150 + R() * 76, 2 + R() * 2]);
    const arbres = Array.from({ length: 14 }, () => R() * W);
    return {
      fond: ciel(H),
      anim(t, ta) {
        const e = fen(t, 0.06, 0.88), niveau = lerp(MER0, 137, e);
        let s = "";
        // le calcaire, en bancs
        const relief = [];
        for (let x = 0; x <= W; x += 6) relief.push([x, topCalc(x)]);
        s += poly(relief.concat([[W, H], [0, H]]), "#e6dfc6");
        for (let y = 150; y < H; y += 24) s += line(0, y, W, y, "rgba(150,135,100,.4)", 1);
        for (const [x, y, r] of coquilles) s += ell(x, y, r * 1.8, r, "#cfc4a6", { opacity: 0.8 });
        s += txt(12, H - 10, "calcaire déjà cimenté", { petit: true });
        // l'eau ne reste que là où le rocher est sous le niveau : nappe, puis flaques
        const eauG = degrade("#8cc2de", "#4d8fb5");
        s += `<defs>${eauG.def}</defs>`;
        let dedans = false, morceau = [];
        const flaques = [];
        for (let x = 0; x <= W; x += 3) {
          const sous = topCalc(x) > niveau;
          if (sous && !dedans) { morceau = [[x, niveau]]; dedans = true; }
          if (sous) morceau.push([x, topCalc(x)]);
          if ((!sous || x >= W) && dedans) { morceau.push([x, niveau]); flaques.push(morceau); dedans = false; }
        }
        for (const f of flaques) {
          const xs = f.map(([x]) => x), x0 = Math.min(...xs), x1 = Math.max(...xs);
          const haut = [];
          for (let x = x0; x <= x1; x += 3) haut.push([x, niveau + 1.4 * Math.sin(x / 26 * Math.PI * 2 - ta * 1.8)]);
          const bas = f.filter((q, k) => k > 0 && k < f.length - 1).reverse();
          s += poly(haut.concat(bas), eauG.url);
          if (x1 - x0 > 26) s += pline(haut, "#eef6fa", 1.4, { opacity: 0.9 });
        }
        // sol et végétation sur ce qui est émergé
        const emerge = fen(t, 0.45, 0.95);
        if (emerge > 0.02) for (const x of arbres) {
          const y = topCalc(x);
          if (y < niveau - 2) s += `<g opacity="${op(emerge)}">${rect(x - 0.7, y - 5, 1.4, 5, "#6b4f35")}${ell(x, y - 8, 3.4, 4.4, "#5d8a45")}</g>`;
        }
        s += txt(240, 34, e < 0.75 ? "le niveau de la mer baisse et le continent se soulève" : "il ne reste que des flaques : le calcaire est à l'air libre", { a: "middle" });
        for (const x of [90, 240, 390]) s += fleche(x, H - 12, x, H - 34, { c: "#c0392b", sw: 1.8, pointe: 6, op: 0.45 });
        s += txt(240, H - 40, "soulèvement lent du continent", { a: "middle", petit: true });
        s += compteur(396, 18, lerp(p.age0 ?? 100, p.age1 ?? 40, t));
        return s;
      },
    };
  };

  // 5 · karst : sur un plateau entaillé d'une vallée — pertes, galerie, résurgence à flanc de vallée
  SCENES.karst = function (p) {
    const R = alea("ka" + p.graine);
    // relief : plateau à gauche, vallée creusée à droite ; la galerie ressort dans le versant
    const profil = courbe([[0, 76], [80, 72], [160, 74], [240, 78], [300, 88], [350, 120], [396, 158], [430, 176], [480, 180]], 8);
    const solY = (x) => hauteur(profil, x);
    const PERTE = 150, SORTIE = 416;
    const fissures = Array.from({ length: 7 }, (_, i) => ({ x: 30 + i * 42 + (R() - 0.5) * 10, ph: R() }));
    const galerie = courbe([[PERTE, 96], [186, 128], [232, 150], [290, 160], [344, 166], [SORTIE, solY(SORTIE) + 4]], 8);
    const lapiaz = Array.from({ length: 22 }, () => ({ x: R() * 300, l: 3 + R() * 5 }));
    return {
      fond: ciel(H),
      anim(t, ta) {
        const e = fen(t, 0.08, 0.95), solEp = lerp(0, 9, fen(t, 0.3, 0.9));
        let s = "";
        // le calcaire et ses bancs
        s += poly(profil.concat([[W, H], [0, H]]), "#e6dfc6");
        for (let y = 100; y < H; y += 26) s += line(0, y, W, y, "rgba(150,135,100,.35)", 1);
        s += pline(profil, "#c4b795", 1.4);
        // pluie
        s += `<g opacity=".92">${nuage(110 + 2 * ta, 26) + nuage(330 + 1.5 * ta, 20, 0.9)
          + pluie(86 + 2 * ta, 34, 60, 30, ta, 13, "ka1") + pluie(300 + 1.5 * ta, 28, 56, 60, ta, 13, "ka2")}</g>`;
        // fissures qui s'élargissent sous le plateau
        for (const f of fissures) {
          const w = lerp(0.6, 3.2, fen(t, 0.05 + f.ph * 0.3, 0.8)), y0 = solY(f.x);
          s += `<path d="M${r1(f.x)} ${r1(y0)} C${r1(f.x + 5)} ${r1(y0 + 34)} ${r1(f.x - 5)} ${r1(y0 + 70)} ${r1(f.x + 2)} ${r1(y0 + 104)}" fill="none" stroke="#9c8f74" stroke-width="${r1(w)}" stroke-linecap="round" opacity=".85"/>`;
          const u = (f.ph + ta * 0.35) % 1;
          s += circ(f.x + Math.sin(u * 6) * 3, y0 + u * 100, 1.5, "#4d8fb5", { opacity: op(0.8 * (1 - u)) });
        }
        // lapiaz du plateau, puis sol qui s'épaissit dessus
        for (const l of lapiaz) s += line(l.x, solY(l.x) - 1, l.x, solY(l.x) - 1 - l.l, "#b9ac8c", 1.6);
        if (solEp > 0.4) {
          const haut = profil.map(([x, y]) => [x, y - solEp]);
          s += poly(profil.slice().reverse().concat(haut), "#6b533a");
          s += pline(haut, "#5d8a45", Math.min(3, solEp * 0.5));
          for (let i = 0; i < 9; i++) { const x = 20 + i * 52, y = solY(x) - solEp; s += `<g opacity="${op(fen(t, 0.5, 0.9))}">${rect(x - 0.7, y - 5, 1.4, 5, "#6b4f35")}${ell(x, y - 8, 3.4, 4.4, "#5d8a45")}</g>`; }
          s += txt(470, 40, "un sol se forme sur le calcaire", { a: "end", petit: true, op: fen(t, 0.45, 0.7) });
        }
        // rivière de surface qui se perd dans le plateau
        const perte = fen(t, 0.25, 0.55);
        s += pline([[6, solY(6) - solEp - 3], [70, solY(70) - solEp - 4], [PERTE - 8, solY(PERTE) - solEp - 2]], "#4d8fb5", 3, { opacity: op(1 - perte * 0.15) });
        s += poly([[PERTE - 12, solY(PERTE) - solEp], [PERTE + 12, solY(PERTE) - solEp], [PERTE + 3, solY(PERTE) + 14 * perte]], "#cfc4a6", { opacity: op(perte) });
        s += txt(PERTE + 16, solY(PERTE) + 26, "la rivière se perd ici", { op: perte });
        // galerie et rivière souterraine, jusqu'à la résurgence dans le versant
        const g = fen(t, 0.35, 0.95), lg = 15 * g;
        if (g > 0.03) {
          s += pline(galerie, "#5f5a4d", lg, { "stroke-linecap": "round" });
          s += pline(galerie, "#4d8fb5", Math.max(1, lg * 0.3), { "stroke-linecap": "round", opacity: 0.9 });
          for (let i = 0; i < 6; i++) {
            const u = ((i / 6) + (ta * 0.1) % 1) % 1, q = lePlong(galerie, u);
            s += circ(q.x, q.y, 1.4, "#bfe0f2", { opacity: op(0.7 * g) });
          }
          const st = fen(t, 0.65, 0.95);
          if (st > 0.03) {
            const q = lePlong(galerie, 0.42);
            s += ell(q.x, q.y, 30 * st, 13 * st, "#5f5a4d");
            for (let i = 0; i < 5; i++) {
              const x = q.x - 19 * st + i * 9.5 * st, h = (5 + (i % 2) * 4) * st;
              s += poly([[x - 1.8, q.y - 12 * st], [x + 1.8, q.y - 12 * st], [x, q.y - 12 * st + h]], "#ded3b8", { opacity: op(st) })
                + poly([[x - 1.6, q.y + 12 * st], [x + 1.6, q.y + 12 * st], [x, q.y + 12 * st - h * 0.7]], "#ded3b8", { opacity: op(st) });
            }
            s += txt(clamp(q.x, 70, 380), q.y - 24 * st - 8, "stalactites et stalagmites", { a: "middle", petit: true, op: st });
          }
          // la rivière souterraine ressort à l'air libre et coule dans la vallée
          const res = fen(t, 0.7, 0.95);
          if (res > 0.03) {
            const ruis = [];
            for (let x = SORTIE; x <= W; x += 8) ruis.push([x, Math.max(solY(x) - 2, solY(SORTIE) + 2)]);
            s += pline(ruis, "#4d8fb5", 3.4, { opacity: op(res) });
            s += circ(SORTIE, solY(SORTIE) + 2, 5 * res, "#4d8fb5", { opacity: op(res) });
            s += txt(SORTIE - 10, solY(SORTIE) - 22, "résurgence : l'eau ressort", { a: "end", op: res });
          }
          s += txt(196, 214, "galerie et rivière souterraine", { a: "middle", op: g });
        }
        s += txt(160, 46, "l'eau de pluie chargée de CO₂ dissout le calcaire", { a: "middle" });
        s += txt(240, H - 6, "CaCO₃ + CO₂ + H₂O → Ca²⁺ + 2 HCO₃⁻ : le calcaire part en solution", { a: "middle", petit: true });
        s += compteur(396, 18, lerp(p.age0 ?? 40, p.age1 ?? 0, t), { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // ─────────────────────────────── scènes métamorphiques (prototype : micaschiste) ───────────────────────────────
  // 1 · dépôt d'argiles et de limons : les lits s'empilent un à un, tous de la même épaisseur
  SCENES.depotPelites = function (p) {
    const R = alea("dp2" + p.graine);
    const MER = 34, BASE = 214, EP = 6, N = 13;           // 13 lits de 6 px, empilés du bas vers le haut
    const C1 = p.couleurs ? p.couleurs[0] : "#585f5c", C2 = p.couleurs ? p.couleurs[1] : "#6a716c", CP = p.particules || "#9aa3a0";
    const chutes = Array.from({ length: 50 }, () => ({ x: 15 + R() * 460, ph: R(), r: 0.8 + R() * 0.9 }));
    const eauG = degrade("#6ea9c9", "#2f6a91");
    return {
      fond: `<defs>${eauG.def}</defs>` + rect(0, 0, W, H, eauG.url) + rect(0, BASE, W, H - BASE, "#6d6a5f")
        + txt(10, H - 10, "socle du bassin", { petit: true, clair: true }),
      anim(t, ta) {
        const pose = t * N, haut = BASE - Math.min(N, pose) * EP;
        let s = "";
        for (const g of chutes) {
          const u = (g.ph + ta * 0.1) % 1, x = g.x + 4 * Math.sin(u * 5 + g.ph * 18), y = lerp(MER, haut - 3, u);
          s += circ(x, y, g.r, CP, { opacity: op(Math.min(u * 6, (1 - u) * 12, 0.85)) });
        }
        // chaque lit garde son épaisseur : il apparaît quand son tour vient
        for (let i = 0; i < N; i++) {
          const k = clamp(pose - i);
          if (k <= 0.01) break;
          const y = BASE - (i + 1) * EP;
          s += rect(0, y, W, EP + 0.5, i % 2 ? C1 : C2, { opacity: op(Math.min(1, k * 2)) });
          if (i % 3 === 0) for (let x = 18; x < W; x += 96) s += line(x, y + EP / 2, x + 22, y + EP / 2, "rgba(255,255,255,.14)", 1);
        }
        s += txt(240, Math.max(46, haut - 12), p.texte || "argiles et limons décantent en eau calme", { a: "middle", clair: true });
        s += txt(10, 22, `${nombre(Math.min(N, Math.floor(pose)))} lits déposés · ${p.rythme || "chacun quelques milliers d'années"}`, { petit: true, clair: true });
        s += compteur(396, 18, lerp(p.age0 ?? 540, p.age1 ?? 480, t), { sous: p.sousDepot || "" });
        return s;
      },
    };
  };

  // 2 · la plaque plonge sous l'autre, dessinée à l'ÉCHELLE VRAIE (1,6 px par km dans les deux sens, 18/09/2026) :
  // plaque = lithosphère ≈ 100 km, croûte continentale ≈ 30 km, croûte océanique ≈ 7 km. Tout ce qui appartient à la plaque
  // (argiles suivies, blocs basculés de la marge, fond océanique déjà engagé) est placé par UNE seule variable, le
  // déplacement D : les argiles avancent donc exactement à la vitesse de la plaque. Pas de flèche ni de repère posé devant.
  SCENES.enfouissementCollision = function (p) {
    const PX = 1.6, MER = 30, XH = 330, RB = 200, TH = 30 * Math.PI / 180; // charnière, rayon de courbure (km), pendage
    const zFin = p.zFin || 30, Y = (z) => MER + z * PX;
    // point de la plaque plongeante : s = abscisse le long du plan (km, 0 à la charnière, > 0 vers la droite),
    // n = profondeur sous le plan (km). Au-delà de la charnière le plan s'incurve (rayon RB) puis plonge à 30°.
    function pt(s, n) {
      let x, y, f;
      if (s >= 0) { f = 0; x = XH + s * PX; y = MER; }
      else if (s >= -RB * TH) { f = -s / RB; x = XH - RB * Math.sin(f) * PX; y = MER + RB * (1 - Math.cos(f)) * PX; }
      else {
        f = TH;
        const d = (-s - RB * TH) * PX;
        x = XH - RB * Math.sin(TH) * PX - d * Math.cos(TH); y = MER + RB * (1 - Math.cos(TH)) * PX + d * Math.sin(TH);
      }
      return [x + n * PX * Math.sin(f), y + n * PX * Math.cos(f)];
    }
    // coupe de la plaque inférieure selon m (km, 0 = pied de la marge ; m < 0 : océan ; m > 85 : continent)
    const sm = (a, b, m) => lisse(clamp((m - a) / (b - a)));
    const nTop = (m) => 5 * (1 - sm(0, 70, m));                                     // fond marin à 5 km, plateau au niveau 0
    const epSed = (m) => lerp(0.5, 0.8, sm(-5, 5, m)) + 5.2 * Math.pow(Math.sin(Math.PI * clamp((m - 2) / 80)), 1.2);
    const bascule = (m) => (m > 8 && m < 68) ? 1.8 * (((m - 8) % 20) / 20) : 0;     // blocs basculés, une faille tous les 20 km
    const nCroute = (m) => nTop(m) + epSed(m) + bascule(m);
    const nMoho = (m) => m < 0 ? nCroute(m) + 7 : lerp(12.5, 30, sm(0, 90, m));     // croûte océanique 7 km → continentale 30 km
    // ce qu'on suit : les argiles de la marge (défaut), l'intérieur de la croûte continentale, ou la croûte océanique
    const mode = p.suivi || "sediments";
    const M_SUIVI = mode === "ocean" ? -60 : mode === "croute" ? 62 : 40, M_ARG = [M_SUIVI - 12, M_SUIVI + 12];
    const BASE = 100, DECAL = M_SUIVI - 12;                                       // s = m − DECAL − D : au départ, à 12 km de la charnière
    const hautSuivi = (m) => mode === "ocean" ? nTop(m) + epSed(m) : mode === "croute" ? nCroute(m) + 1.5 : nTop(m);
    const basSuivi = (m) => mode === "ocean" ? nMoho(m) : mode === "croute" ? nCroute(m) + 8.5 : nTop(m) + epSed(m);
    const nSuivi = (hautSuivi(M_SUIVI) + basSuivi(M_SUIVI)) / 2, gradT = p.gradT || 15;
    const pression = (z) => z < 35 ? z * 0.0275 : 0.9625 + (z - 35) * 0.0324;
    const prof = (D) => (pt(M_SUIVI - DECAL - D, nSuivi)[1] - MER) / PX;
    let lo = 0, hi = 400;
    for (let k = 0; k < 40; k++) { const mi = (lo + hi) / 2; if (prof(mi) < zFin) lo = mi; else hi = mi; }
    const DMAX = lo;
    const S0 = -380, S1 = (W - XH) / PX + 8, PAS = 2;
    const trace = (fn, sa, sb, D) => {
      const out = [], n = Math.max(1, Math.ceil(Math.abs(sb - sa) / PAS));
      for (let k = 0; k <= n; k++) { const s = lerp(sa, sb, k / n); out.push(pt(s, fn(s + DECAL + D))); }
      return out;
    };
    const bande = (fh, fb, sa, sb, D, c, o) => sb - sa < 0.5 ? "" : poly(trace(fh, sa, sb, D).concat(trace(fb, sb, sa, D)), c, o);
    const eauG = degrade("#7fb3d1", "#3f7fa6"), clipH = nid("ph");
    const XT = XH - 22;                                                            // front de la plaque supérieure
    const sT = -((XH - XT) / PX);
    return {
      fond: ciel(MER) + `<defs>${eauG.def}</defs>` + rect(0, MER, W, H - MER, eauG.url),
      curseur: (t) => p.retour ? fen(t, 0.08, 0.92) : prof(clamp((t - 0.02) / 0.93) * DMAX) / zFin,   // P et T du chemin ∝ profondeur
      anim(t) {
        const e = p.retour ? 1 + 0.6 * t : clamp((t - 0.02) / 0.93);              // vitesse constante de la plaque
        const D = e * DMAX, mDe = (s) => s + DECAL + D, sDe = (m) => m - DECAL - D, sDe0Fin = M_SUIVI - DECAL - DMAX;
        let s = "";
        // asthénosphère sous la plaque inférieure
        s += poly(trace(() => BASE, S1, S0, D).concat([[-60, H + 400], [W + 20, H + 400], [W + 20, Y(BASE)]]), "#dcb584");
        // plaque supérieure : sa base épouse le dos de la plaque qui plonge
        const tip = pt(sT, nTop(mDe(sT)));
        const elev = 2.4 + 0.6 * e;
        const surf = [];
        for (let x = -2; x <= tip[0]; x += 6) surf.push([x, lerp(MER - elev * PX * (0.85 + 0.15 * Math.sin(x / 31)), tip[1], sm(tip[0] - 110, tip[0], x))]);
        surf.push(tip);
        const plaqueSup = surf.concat(trace(nTop, sT, S0, D)).concat([[-60, H + 400]]);
        s += `<clipPath id="${clipH}"><polygon points="${P(plaqueSup)}"/></clipPath><g clip-path="url(#${clipH})">`
          + rect(-2, 0, W + 4, Y(35), "#d9c9a6") + rect(-2, Y(35), W + 4, H, "#aab283")
          + line(0, Y(35), W, Y(35), "rgba(80,70,50,.35)", 1, { "stroke-dasharray": "4 3" }) + `</g>`;
        s += pline(surf, "#8f8471", 1.2);
        // plaque inférieure : manteau, croûte (océanique à gauche du pied de marge, continentale à droite), argiles
        const sOc = clamp(sDe(0), S0, S1);
        s += bande(nMoho, () => BASE, S0, S1, D, "#97a270");
        s += bande(nCroute, nMoho, S0, sOc, D, "#46534d");
        s += bande(nCroute, nMoho, sOc, S1, D, "#cdae8c");
        s += bande(nTop, nCroute, S0, S1, D, "#6a716c");
        // lits dans les argiles et failles des blocs basculés : ils avancent avec la plaque
        for (const f of [0.35, 0.7]) {
          const sa = clamp(sDe(6), S0, S1), sb = clamp(sDe(80), S0, S1);
          if (sb - sa > 1) s += pline(trace((m) => nTop(m) + epSed(m) * f, sa, sb, D), "rgba(255,255,255,.2)", 0.8);
        }
        for (const mf of [28, 48, 68]) {
          const sf = sDe(mf);
          if (sf < S0 || sf > S1) continue;
          const a = pt(sf, nTop(mf) + epSed(mf) - 0.3), b = pt(sf - 2.2, nTop(mf) + epSed(mf) + 7);
          s += line(a[0], a[1], b[0], b[1], "#5b4636", 1);
        }
        // les argiles suivies : une portion de la couche, un peu plus sombre, et leur point rouge
        const cSuivi = mode === "ocean" ? "#39463f" : mode === "croute" ? "#b8927a" : "#4c5451";
        const retour = p.retour ? fen(t, 0.08, 0.92) : 0;
        if (!p.retour) s += bande(hautSuivi, basSuivi, clamp(sDe(M_ARG[0]), S0, S1), clamp(sDe(M_ARG[1]), S0, S1), D, cSuivi,
          { stroke: "#c0392b", "stroke-width": 1.1, "stroke-linejoin": "round" });
        s += pline(trace(nTop, S0, S1, D), "#4f4638", 1.1) + pline(trace(() => BASE, S0, S1, D), "rgba(60,50,35,.45)", 1);
        // mode retour (roches de haute pression) : l'écaille suivie se détache et REMONTE le long du plan, dans le chenal,
        // pendant que la plaque continue de plonger (la roche ne prend pas l'ascenseur : elle est plus légère que le manteau)
        let q;
        if (p.retour) {
          const sHaut = -70, sBas = sDe0Fin, sP = lerp(sBas, sHaut, retour);              // jusque vers 12 km, puis l'érosion
          const ecaille = [];
          for (let k = 0; k <= 12; k++) ecaille.push(pt(sP - 9 + k * 1.5, -1.6 - 2.2 * Math.sin(k / 12 * Math.PI)));
          for (let k = 12; k >= 0; k--) ecaille.push(pt(sP - 9 + k * 1.5, -0.4));
          s += poly(ecaille, cSuivi, { stroke: "#c0392b", "stroke-width": 1.1 });
          q = pt(sP, -1.2);
        } else q = pt(sDe(M_SUIVI), nSuivi);
        s += circ(q[0], q[1], 4.2, "#c0392b", { stroke: "#fff", "stroke-width": 1.4 });
        // étiquettes : peu nombreuses, posées sur les couches
        s += txt(84, Y(17), "plaque supérieure", { a: "middle", petit: true });
        s += txt(W - 8, H - 7, "asthénosphère", { a: "end", petit: true });
        const oc = pt(sDe(-34), 9), oc2 = pt(sDe(-44), 9);
        if (mode !== "ocean" && oc[0] > 60 && oc[0] < 300 && oc[1] < H - 16) {
          const ang = Math.atan2(oc[1] - oc2[1], oc[0] - oc2[0]) * 180 / Math.PI;
          s += `<g transform="translate(${r1(oc[0])} ${r1(oc[1])}) rotate(${r1(ang)})">${txt(0, 3, "croûte océanique ≈ 7 km", { a: "middle", petit: true, clair: true })}</g>`;
        }
        // épaisseurs vraies, mesurées sur la plaque qui arrive (bord droit)
        const cote = (x, z0, z1, lab, yl) => line(x, Y(z0), x, Y(z1), "#27302d", 1) + line(x - 3, Y(z0), x + 3, Y(z0), "#27302d", 1)
          + line(x - 3, Y(z1), x + 3, Y(z1), "#27302d", 1) + txt(x - 6, yl, lab, { a: "end", petit: true });
        const mBord = (W - XH) / PX + DECAL + D;                                   // ce qui arrive au bord droit
        if (mBord > 85) s += cote(474, 0, 30, "croûte ≈ 30 km", Y(15) + 3) + cote(474, 30, BASE, "plaque (lithosphère) ≈ 100 km", Y(62) + 3);
        else if (mBord < 0) s += cote(474, 5.5, 12.5, "croûte océanique ≈ 7 km", Y(9) + 3) + cote(474, 12.5, BASE, "plaque (lithosphère) ≈ 100 km", Y(62) + 3);
        else s += cote(474, 5, BASE, "plaque (lithosphère) ≈ 100 km", Y(62) + 3);
        // règle de profondeur
        s += line(8, Y(0), 8, Y(100), "#27302d", 1);
        for (let z = 0; z <= 100; z += 20) s += line(5, Y(z), 8, Y(z), "#27302d", 1) + (z ? txt(11, Y(z) + 3, `${z} km`, { petit: true }) : "");
        // lecture : profondeur, température, pression des argiles suivies
        const z = (q[1] - MER) / PX, T = 20 + gradT * z, Pg = pression(z);
        const lib = `${nombre(z)} km · ${nombre(T)} °C · ${Pg.toFixed(2).replace(".", ",")} GPa`;
        const lw = lib.length * 4.2 + 26;
        s += rect(W - 8 - lw, 5, lw, 18, "rgba(255,255,255,.92)", { rx: 5, stroke: "rgba(0,0,0,.14)" })
          + circ(W - lw + 3, 14, 3.4, "#c0392b") + `<text x="${r1(W - lw + 11)}" y="17.5" class="fa-lab" style="stroke:none">${lib}</text>`;
        s += compteur(92, 14, lerp(p.age1 ?? 360, p.age2 ?? 340, t));
        return s;
      },
    };
  };

  // 3 · recristallisation, vue au microscope (couleurs du microscope). p.texture (18/09/2026, une scène pour tout le
  // métamorphisme régional) : "schistosite" (défaut, micaschiste), "ardoise", "gneiss", "migmatite", "amphibolite",
  // "schiste_vert", "schiste_bleu" (textures FOLIÉES : paillettes et aiguilles qui se couchent dans un même plan, ou minéraux
  // qui se trient en lits) ; "quartzite", "marbre", "eclogite", "granulite" (MOSAÏQUES : grains ronds → polygones jointifs).
  // p.lignes (texte à droite), p.legende [[couleur, nom]…], tDebut, tFin, dureeRecrist, sansCompression
  SCENES.recristallisationFoliation = function (p, roche) {
    const R = alea("rf" + p.graine);
    const CX = 160, CY = 122, RA = 96, tex = p.texture || "schistosite";
    const FOND = { peridotite: "#b8c98a", serpentinite: "#5f7a4a", rodingite: "#e0d4c0", corneenne: "#7a7064", skarn: "#d8cfc0", greisen: "#e8e4da", fenite: "#d8c0b0",
      schistosite: "#b9b3a2", ardoise: "#6a6f6b", gneiss: "#d9d0c2", migmatite: "#d9d0c2", amphibolite: "#dcd8cc", schiste_vert: "#dfe3d2",
      schiste_bleu: "#e6e6de", quartzite: MIN.pore, marbre: "#cfcac0", granulite: "#d8cdbd", eclogite: "#cfd6c0" }[tex] || "#b9b3a2";
    const L = loupe(CX, CY, RA, { fond: FOND });
    // paillettes / aiguilles : [nombre, longueur, variation, couleurs, épaisseur]
    const PAIL = { schistosite: [[120, 6, 10, ["#8a7f66", "#6f6552"], 1.6]], ardoise: [[300, 2.5, 3, ["#3f4441", "#4f5552"], 1.1]],
      amphibolite: [[70, 5, 6, ["#2f4a38", "#3d5a44"], 3.4]], schiste_vert: [[80, 4, 5, ["#4f8a4a", "#62994f"], 2.2], [50, 5, 5, ["#a9c98c"], 1.2]],
      schiste_bleu: [[85, 5, 6, ["#3d5fa8", "#5577bf"], 2.6]], granulite: [[55, 5, 7, ["#6b4f35"], 1.8]] }[tex] || [];
    const pail = [];
    PAIL.forEach(([n, l0, dl, cols, w]) => { for (let i = 0; i < n; i++) pail.push({ x: CX - 110 + R() * 220, y: CY - 110 + R() * 220, l: l0 + R() * dl, a0: R() * 180, ph: R() * 0.5, c: cols[i % cols.length], w }); });
    // mosaïques : grains ronds (sable, boue, basalte) → polygones jointifs à joints droits
    const MOS = { quartzite: [["#ebe7de", 0.4], ["#e0dbcf", 0.35], ["#d6d0c3", 0.25]], marbre: [["#f3f0ea", 0.5], ["#e7e2d8", 0.3], ["#ddd6c9", 0.2]],
      peridotite: [["#cfdca6", 0.6], ["#b8c98a", 0.15], ["#c9ae8a", 0.2], ["#2f2f2f", 0.05]], serpentinite: [["#6f8f5a", 0.45], ["#8aa66a", 0.35], ["#cfdca6", 0.12], ["#2f2f2f", 0.08]],
      rodingite: [["#efd4b4", 0.38], ["#cfdcb4", 0.3], ["#ece8de", 0.2], ["#b8c98a", 0.12]], corneenne: [["#8a7f70", 0.35], ["#e8e2d6", 0.35], ["#d8a8a0", 0.15], ["#9aa0a8", 0.15]],
      skarn: [["#c98a52", 0.35], ["#8fb07a", 0.3], ["#f2efe8", 0.2], ["#2f2f2f", 0.15]], greisen: [["#efece6", 0.5], ["#dcd8c4", 0.25], ["#f1e7a8", 0.15], ["#4a3a2e", 0.1]],
      fenite: [["#e2ad94", 0.5], ["#4f7d3a", 0.25], ["#3b4a6a", 0.15], ["#ece8de", 0.1]],
      eclogite: [["#7d9b66", 0.45], ["#6a8a57", 0.22], ["#9c4a3c", 0.31], ["#2f2f2f", 0.02]],
      granulite: [["#ebe7de", 0.25], ["#e3b8a4", 0.3], ["#d9d2c4", 0.2], ["#9c4a3c", 0.12], ["#7d6a45", 0.13]] }[tex];
    let cells = [];
    if (MOS) {
      const sites = [];
      for (let j = 0; j < 11; j++) for (let i = 0; i < 11; i++) sites.push([CX - 110 + i * 21 + (j % 2) * 10 + (R() - 0.5) * 8, CY - 110 + j * 20 + (R() - 0.5) * 8]);
      cells = voronoi(sites, CX - 115, CY - 115, CX + 115, CY + 115).map((pg) => {
        let u = R(), col = MOS[0][0];
        for (const [cc, f] of MOS) { if (u < f) { col = cc; break; } u -= f; }
        const tard = tex === "granulite" && (col === "#9c4a3c" || col === "#7d6a45");     // grenat et orthopyroxène remplacent les micas
        return { pg, c: centre(pg), col, r0: 6 + R() * 2.5, ph: R() * 0.25 + (tard ? 0.3 : 0), jum: R() < 0.35, tard };
      });
    }
    // gneiss, migmatite : les minéraux sombres et clairs se trient en lits
    const tri = [];
    if (tex === "gneiss" || tex === "migmatite") for (let i = 0; i < 280; i++) {
      const sombre = R() < (p.partSombre ?? 0.33), x = CX - 112 + R() * 224, y0 = CY - 112 + R() * 224, B = 26;
      const yb = sombre ? Math.round((y0 - CY) / B) * B + CY : Math.round((y0 - CY - B / 2) / B) * B + CY + B / 2;
      tri.push({ x, y0, y1: yb + (R() - 0.5) * (sombre ? 7 : 15), c: sombre ? "#3e342c" : (R() < 0.5 ? "#ece6da" : "#e2b9a6"), r: 2.6 + R() * 1.8, ph: R() * 0.3 });
    }
    const leuco = tex === "migmatite" ? Array.from({ length: 9 }, (_, i) => ({ x: CX - 90 + (i % 3) * 80 + (R() - 0.5) * 30, y: CY - 65 + Math.floor(i / 3) * 52 + 13, l: 16 + R() * 18, ph: R() * 0.2 })) : [];
    const nGr = p.grenats ?? { schistosite: 5, amphibolite: 3, schiste_bleu: 3 }[tex] ?? 0;
    const grenats = Array.from({ length: nGr }, () => ({ x: CX - 70 + R() * 140, y: CY - 70 + R() * 140, r: (tex === "schiste_bleu" ? 3 : 5) + R() * 4, ph: R() * 0.3 }));
    const extras = tex === "schiste_bleu" ? Array.from({ length: 6 }, () => ({ x: CX - 70 + R() * 140, y: CY - 70 + R() * 140, a: R() * 30 - 15, c: "#f7f6f1", l: 9, w: 4 }))
      : tex === "schiste_vert" ? Array.from({ length: 14 }, () => ({ x: CX - 80 + R() * 160, y: CY - 80 + R() * 160, a: R() * 180, c: "#c9c35a", l: 3.5, w: 3 })) : [];
    const lignes = p.lignes || ["les minéraux argileux", "(illite, chlorite)", "deviennent des micas,", "tous couchés dans le", "même plan : la schistosité"];
    const legende = p.legende || (tex === "schistosite" ? [["#9c4a3c", "grenat"]] : []);
    return {
      fond: rect(0, 0, W, H, "#f3f1ea") + txt(CX, 22, p.titreLoupe || "Dans la roche, au microscope", { a: "middle" }) + L.fond,
      anim(t) {
        const e = fen(t, 0.05, 0.9);
        let d = "";
        for (const c of cells) {
          const k = fen(t, 0.05 + c.ph, 0.7 + c.ph);
          if (c.tard && k <= 0.02) continue;
          const pts = c.pg.map(([x, y]) => { const a = Math.atan2(y - c.c[1], x - c.c[0]), rr = c.tard ? c.r0 * k : c.r0; return [lerp(c.c[0] + Math.cos(a) * rr, c.c[0] + (x - c.c[0]) * 0.985, k), lerp(c.c[1] + Math.sin(a) * rr, c.c[1] + (y - c.c[1]) * 0.985, k)]; });
          d += poly(pts, c.col, { stroke: "rgba(60,55,45,.45)", "stroke-width": 0.7 });
          if (tex === "marbre" && c.jum && k > 0.5) for (const o of [-3, 2]) d += line(c.c[0] - 5 + o, c.c[1] - 5, c.c[0] + 5 + o, c.c[1] + 5, "rgba(90,80,70,.35)", 0.6, { opacity: op((k - 0.5) * 2) });
        }
        for (const g of tri) {
          const k = fen(t, 0.05 + g.ph, 0.75 + g.ph), y = lerp(g.y0, g.y1, k);
          d += ell(g.x, y, g.r * (1 + 0.9 * k), g.r * (1 - 0.35 * k), g.c, { stroke: "rgba(0,0,0,.25)", "stroke-width": 0.4 });
        }
        for (const l of leuco) {
          const k = fen(t, 0.45 + l.ph, 0.95);
          if (k > 0.02) d += ell(l.x, l.y, l.l * k, 5 * k, "#fbf4ea", { stroke: "#2f2822", "stroke-width": 1.4 });
        }
        for (const m of pail) {
          const k = fen(t, 0.05 + m.ph, 0.6 + m.ph);
          if (tex === "granulite") { const f = 1 - fen(t, 0.35 + m.ph * 0.5, 0.75 + m.ph * 0.4); if (f > 0.02) d += line(m.x - m.l, m.y, m.x + m.l, m.y, m.c, m.w, { opacity: op(f) }); continue; }
          const a = lerp(m.a0, 0, e) * Math.PI / 180, l = m.l * (0.4 + 0.6 * k);
          d += line(m.x - Math.cos(a) * l, m.y - Math.sin(a) * l, m.x + Math.cos(a) * l, m.y + Math.sin(a) * l, m.c, m.w + (tex === "schistosite" ? k : 0), { opacity: op(0.4 + 0.6 * k) });
        }
        for (const x of extras) {
          const k = fen(t, 0.4, 0.9);
          if (k > 0.02) d += `<rect x="${r1(x.x - x.l / 2 * k)}" y="${r1(x.y - x.w / 2)}" width="${r1(x.l * k)}" height="${x.w}" fill="${x.c}" stroke="rgba(0,0,0,.35)" stroke-width=".5" transform="rotate(${r1(x.a)} ${r1(x.x)} ${r1(x.y)})"/>`;
        }
        for (const g of grenats) {
          const k = fen(t, 0.45 + g.ph, 0.95);
          if (k > 0.02) d += poly(Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return [g.x + Math.cos(a) * g.r * k, g.y + Math.sin(a) * g.r * k]; }), "#9c4a3c", { stroke: "#6d3227", "stroke-width": 1 });
        }
        let s = L.dans(d) + L.bord;
        if (!p.sansCompression) s += fleche(14, CY, 48, CY, { sw: 3, pointe: 9, op: 0.75 }) + fleche(306, CY, 272, CY, { sw: 3, pointe: 9, op: 0.75 });
        const T0 = p.tDebut ?? 480, T1 = p.tFin || 600, lo = Math.min(200, Math.floor((Math.min(T0, T1) - 50) / 100) * 100), hi = Math.max(700, Math.ceil((Math.max(T0, T1) + 50) / 100) * 100);
        s += thermometre(300, 60, 120, lerp(T0, T1, e), lo, hi, [lo + 100, Math.round((lo + hi) / 200) * 100, hi - 100]);
        s += txt(300, 46, `${nombre(lerp(T0, T1, e))} °C`, { a: "middle" });
        lignes.forEach((l, i) => { s += txt(356, 96 + i * 12, l, { petit: true }); });
        legende.forEach(([c, n], i) => { s += rect(356, 164 + i * 14, 10, 10, c, { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }) + `<text x="371" y="${173 + i * 14}" class="fa-leg">${n}</text>`; });
        s += txt(470, 214, p.dureeRecrist || "quelques millions d'années", { a: "end", petit: true });
        return s;
      },
    };
  };

  // 4 · exhumation (refaite le 18/09/2026 d'après les schémas de manuel « érosion + réajustement isostatique » et les dômes
  // extensifs à faille de détachement) : une coupe de croûte CONTINUE — plaque supérieure (nappes), couche de micaschistes,
  // socle, racine, manteau. La chaîne s'étire (étirement horizontal, blocs basculés sur des failles normales qui s'enracinent
  // dans le détachement, bassin houiller dans le creux), l'érosion rabote le relief et la racine remonte (isostasie) : la
  // couche de micaschistes se bombe en dôme et finit recoupée par la surface. Aucune texture qui glisse.
  SCENES.exhumation = function (p) {
    const R = alea("ex3" + p.graine);
    const PX = 3.6, MER = 38, XC = 232, Y = (z) => MER + z * PX;
    const dome = (x0) => Math.exp(-(((x0 - XC) / 95) ** 2)), racine = (x0) => Math.exp(-(((x0 - XC) / 125) ** 2));
    const chaine = (x) => Math.exp(-(((x - XC) / 140) ** 2));
    // profils en profondeur (km), selon la position d'origine x0 et l'avancement g
    const Z0 = p.zToit ?? 20.5, EPC = p.epaisseur ?? 6;
    const toit = (x0, g) => lerp(Z0 + 1.5 * racine(x0), -2.6 + 14 * (1 - dome(x0)), g);   // toit de la couche suivie = détachement
    const mur = (x0, g) => toit(x0, g) + lerp(EPC, EPC - 1, g);
    const moho = (x0, g) => lerp(Math.max(33, Z0 + EPC + 8) + 19 * racine(x0), 31, g);
    const surfZ = (x, f) => lerp(-0.3 - 3 * chaine(x), -0.25 - 0.3 * (0.5 + 0.5 * Math.sin(x / 23 + 1)), f);
    const ETIRE = 0.3, x0De = (x, g) => XC + (x - XC) / (1 + ETIRE * g), xDe = (x0, g) => XC + (x0 - XC) * (1 + ETIRE * g);
    // failles normales : 2 de chaque côté, pendage 60° vers l'extérieur ; rejet (km) des blocs extérieurs
    const FAILLES = [70, 140], REJET = { "1": [0, 1.6, 3.4], "-1": [0, 0.9, 1.8] }, COT = 1 / Math.tan(Math.PI / 3);
    // point suivi : dans la couche, placé pour arriver pile à la surface à la fin
    const XD = XC - 35, fD = clamp((surfZ(xDe(XD, 1), 1) - toit(XD, 1)) / (mur(XD, 1) - toit(XD, 1)), 0.1, 0.9);
    const arbres = Array.from({ length: 11 }, () => 14 + R() * 452);
    const clipR = nid("exr");
    const zSuivi = (t) => { const g = fen(t, 0.04, 0.9); return lerp(toit(XD, g), mur(XD, g), fD) - surfZ(xDe(XD, g), fen(t, 0.06, 0.92)); };
    const zDebut = zSuivi(0);
    return {
      fond: ciel(H),
      curseur: (t) => 1 - Math.max(0, zSuivi(t)) / zDebut,
      anim(t, ta) {
        const g = fen(t, 0.04, 0.9), fe = fen(t, 0.06, 0.92);
        const xs = [];
        for (let x = -4; x <= W + 4; x += 4) xs.push(x);
        const surf = xs.map((x) => [x, Y(surfZ(x, fe))]);
        const prof = (fn) => xs.map((x) => [x, Y(fn(x0De(x, g), g))]);
        const bord = (haut, bas) => haut.concat(bas.slice().reverse());
        // failles à l'écran : trace en surface, puis descente vers l'extérieur jusqu'au détachement
        const failles = [];
        for (const sg of [1, -1]) FAILLES.forEach((a, k) => {
          const xf = XC + sg * a * (1 + ETIRE * g), yf = Y(surfZ(xf, fe));
          const pts = [[xf, yf]];
          for (let d = 2; d < 200; d += 2) {
            const x = xf + sg * d * COT, y = yf + d;
            pts.push([x, y]);
            if (y >= Y(toit(x0De(x, g), g))) break;
          }
          failles.push({ sg, k: k + 1, xf, yf, pts });
        });
        // bloc d'un point : nombre de failles franchies depuis le centre ; décalage vers le bas (bloc basculé)
        const bloc = (x, y) => {
          const sg = x >= XC ? 1 : -1;
          let k = 0;
          for (const f of failles) if (f.sg === sg && sg * (x - (f.xf + sg * (y - f.yf) * COT)) > 0) k = Math.max(k, f.k);
          return { sg, k };
        };
        const rejet = (x, y) => {
          const { sg, k } = bloc(x, y);
          if (!k) return 0;
          const f = failles.find((q) => q.sg === sg && q.k === k), suiv = failles.find((q) => q.sg === sg && q.k === k + 1);
          const larg = suiv ? Math.abs(suiv.xf - f.xf) : 90, u = clamp(Math.abs(x - f.xf) / larg);
          return REJET[sg][k] * g * (1 - 0.55 * u);                                     // plus fort contre la faille : bloc basculé
        };
        let s = `<clipPath id="${clipR}"><polygon points="${P(surf.concat([[W + 4, H + 4], [-4, H + 4]]))}"/></clipPath><g clip-path="url(#${clipR})">`;
        s += rect(-4, 0, W + 8, H + 4, "#d8c9a8");                                         // plaque supérieure (nappes)
        const T0 = prof(toit), M0 = prof(mur), MO = prof(moho);
        s += poly(bord(T0, M0), p.couleurCouche || "#5f6866");
        s += poly(bord(M0, MO), "#c4a283");
        s += poly(bord(MO, xs.map((x) => [x, H + 4])), "#a3ab7a");
        // litage : feuillets des micaschistes, lits du socle, contacts de nappes (coupés par les failles)
        for (const f of [0.25, 0.5, 0.75]) s += pline(xs.map((x) => { const x0 = x0De(x, g); return [x, Y(lerp(toit(x0, g), mur(x0, g), f))]; }), "rgba(255,255,255,.26)", 0.8);
        for (const f of [0.3, 0.62]) s += pline(xs.map((x) => { const x0 = x0De(x, g); return [x, Y(lerp(mur(x0, g), moho(x0, g), f))]; }), "rgba(110,75,45,.22)", 1);
        for (const f of [0.34, 0.67]) {
          let tr = [], cle = null;
          for (const x of xs) {
            const x0 = x0De(x, g), y0 = Y(toit(x0, g) * f), y = y0 + rejet(x, y0) * PX, b = bloc(x, y0), c = b.sg * b.k;
            if (cle !== null && c !== cle && Math.abs(y - tr[tr.length - 1][1]) > 0.6) { if (tr.length > 1) s += pline(tr, "rgba(95,78,52,.5)", 1); tr = []; }
            cle = c; tr.push([x, y]);
          }
          if (tr.length > 1) s += pline(tr, "rgba(95,78,52,.5)", 1);
        }
        // bassins houillers : le creux laissé par les blocs qui s'affaissent se remplit de sables, d'argiles et de charbon
        for (const f of failles) {
          const suiv = failles.find((q) => q.sg === f.sg && q.k === f.k + 1), xb = suiv ? suiv.xf : f.sg > 0 ? W + 6 : -6;
          const haut = [], bas = [];
          for (let k = 0; k <= 16; k++) {
            const x = lerp(f.xf, xb, k / 16), y = Y(surfZ(x, fe)), r = rejet(x + f.sg * 0.5, y + 0.5) * PX;
            haut.push([x, y]); bas.push([x + (k === 0 ? f.sg * r * COT : 0), y + r]);
          }
          if (REJET[f.sg][f.k] * g < 0.15) continue;
          s += poly(bord(haut, bas), "#e4d29c");
          for (const q of [0.45, 0.8]) s += pline(haut.map(([x, y], k) => [lerp(x, bas[k][0], q), lerp(y, bas[k][1], q)]).slice(1), "#3d372c", 0.9, { opacity: 0.7 });
        }
        const vf = fen(t, 0.05, 0.16);                                                   // les failles naissent avec l'étirement
        if (vf > 0) for (const f of failles) s += pline(f.pts, "#4a4234", 1.4, { opacity: op(vf) });
        // le détachement : toit des micaschistes, là où il est encore sous la plaque supérieure
        s += pline(T0, "#34322b", 1.8);
        s += pline(MO, "#6d6a50", 1, { "stroke-dasharray": "5 3" });
        // le micaschiste suivi
        const xd = xDe(XD, g), yd = Y(lerp(toit(XD, g), mur(XD, g), fD));
        s += `</g>`;
        s += circ(xd, yd, 4.2, "#c0392b", { stroke: "#fff", "stroke-width": 1.4 });
        s += pline(surf, fe > 0.6 ? "#6f9d4f" : "#8a8575", 1.8);
        // arbres à la fin, pluie tant que le relief s'use (et après : l'érosion continue)
        const fin = fen(t, 0.85, 0.97);
        if (fin > 0) for (const x of arbres) { const y = Y(surfZ(x, fe)); s += `<g opacity="${op(fin)}">${rect(x - 0.7, y - 5, 1.4, 5, "#6b4f35")}${ell(x, y - 8, 3.2, 4.2, "#5d8a45")}</g>`; }
        const pl = fen(t, 0.08, 0.2) * (1 - 0.45 * fen(t, 0.85, 1));
        if (pl > 0) s += `<g opacity="${op(pl)}">${nuage(176 + 2 * ta, 12, 0.85) + nuage(286 + 1.5 * ta, 9, 0.75)
          + pluie(154 + 2 * ta, 18, 50, Math.max(6, Y(surfZ(176, fe)) - 20), ta, 10, "ex1") + pluie(268 + 1.5 * ta, 15, 46, Math.max(6, Y(surfZ(286, fe)) - 17), ta, 10, "ex2")}</g>`;
        // isostasie : sous les flancs, le manteau pousse la croûte allégée vers le haut
        const iso = fen(t, 0.15, 0.3) * (1 - fen(t, 0.8, 0.9));
        for (const x of [58, 410]) s += fleche(x, H - 5, x, H - 27, { c: "#c0392b", sw: 2, pointe: 7, op: op(iso * 0.85) });
        s += txt(420, H - 12, "isostasie", { petit: true, op: iso });
        // étiquettes, chacune à son moment
        const xm = xDe(XC + 150, g), ym = Y((toit(XC + 150, g) + mur(XC + 150, g)) / 2);
        s += txt(clamp(xm, 60, 440), ym + 3, p.nomCouche || "micaschistes", { a: "middle", clair: !p.nomClair, petit: true });
        s += txt(XC, Y(8) + 3, "plaque supérieure (nappes)", { a: "middle", petit: true, op: 1 - fen(t, 0.18, 0.3) });
        s += txt(XC, Y(47) + 3, "racine de la chaîne", { a: "middle", petit: true, op: 1 - fen(t, 0.2, 0.35) });
        s += txt(8, H - 6, "manteau", { petit: true, op: fen(t, 0.3, 0.45) });
        const f1 = failles.find((q) => q.sg === 1 && q.k === 1);
        s += txt(f1.xf + 36, f1.yf + 26, "failles normales", { a: "middle", petit: true, op: fen(t, 0.2, 0.3) * (1 - fen(t, 0.6, 0.7)) });
        s += txt(xDe(XC - 112, g), Y(toit(XC - 112, g)) - 5, "détachement", { a: "middle", petit: true, op: fen(t, 0.3, 0.42) * (1 - fen(t, 0.8, 0.88)) });
        const f2 = failles.find((q) => q.sg === 1 && q.k === 2);
        s += txt(Math.min(W - 36, f2.xf + 44), f2.yf + 16, "bassin houiller", { a: "middle", petit: true, op: fen(t, 0.55, 0.68) });
        // règle et lecture
        s += line(6, Y(0), 6, Y(50), "#27302d", 1);
        for (let z = 10; z <= 50; z += 10) s += line(3, Y(z), 6, Y(z), "#27302d", 1) + txt(9, Y(z) + 3, `${z} km`, { petit: true });
        const zd = Math.max(0, (yd - Y(surfZ(xd, fe))) / PX);
        const lib = zd < 0.3 ? "en surface" : `${nombre(zd)} km sous la surface`;
        const lw = lib.length * 4.2 + 26;
        s += rect(W - 8 - lw, 5, lw, 18, "rgba(255,255,255,.92)", { rx: 5, stroke: "rgba(0,0,0,.14)" })
          + circ(W - lw + 3, 14, 3.4, "#c0392b") + `<text x="${r1(W - lw + 11)}" y="17.5" class="fa-lab" style="stroke:none">${lib}</text>`;
        // Cévennes : l'essentiel de la remontée entre 340 et 310 Ma (extension, granites), à l'air libre vers 250 Ma
        const [A0, A1, A2] = p.ages || [p.age2 ?? 340, 310, 250];
        const age = t < 0.5 ? lerp(A0, A1, t / 0.5) : t < 0.9 ? lerp(A1, A2, (t - 0.5) / 0.4) : lerp(A2, 0, (t - 0.9) / 0.08);
        s += compteur(92, 14, Math.max(0, age));
        return s;
      },
    };
  };

  // ─────────────────────── volcans différenciés (18/09/2026 : prototypes trachyte → dômes, andésite → stratovolcans) ─────
  // aire d'une ellipse sous un niveau : table (y, fraction) pour placer le toit des cumulats
  function tableEllipse(CX, CY, RX, RY) {
    const n = 200, ys = [], fr = [];
    let tot = 0;
    const larg = (y) => Math.sqrt(Math.max(0, 1 - ((y - CY) / RY) ** 2));
    for (let i = 0; i <= n; i++) { const y = CY + RY - (2 * RY * i) / n; ys.push(y); if (i) tot += (larg(y) + larg(ys[i - 1])) / 2; fr.push(tot); }
    return (f) => { const cible = clamp(f) * tot; for (let i = 1; i <= n; i++) if (fr[i] >= cible) return ys[i]; return CY - RY; };
  }
  // réservoir de la croûte (vu en coupe) : les cristaux naissent dans le liquide, tombent et s'empilent en cumulats litées ;
  // le liquide qui reste s'enrichit en silice (jauge verticale graduée en noms de roches) pendant que la température baisse.
  // p : silice [début, fin] (%), tDebut, tFin (°C), liquideFin (%), zones [[silice, nom]…], couleurs [liquide début, fin],
  //     assimilation (blocs de croûte qui tombent et fondent), lieu (titre), profRes, zRes (km, milieu du réservoir)
  SCENES.reservoirDifferenciation = function (p) {
    const R = alea("rd" + p.graine);
    const CX = 166, CY = 130, RX = 118, RY = 66;
    const si0 = p.silice ? p.silice[0] : 47, si1 = p.silice ? p.silice[1] : 64;
    const T0 = p.tDebut ?? 1150, T1 = p.tFin ?? 800, liq1 = (p.liquideFin ?? 20) / 100;
    const cL0 = p.couleurs ? p.couleurs[0] : "#b5401f", cL1 = p.couleurs ? p.couleurs[1] : "#eaa65c";
    const PH = p.cristaux || [["olivine", "#86a04c", 0.0, 0.34], ["pyroxène", "#3b463f", 0.16, 0.6], ["plagioclase", "#efebe1", 0.4, 0.92], ["oxydes", "#2a2a2a", 0.62, 0.95]];
    const BANDES = p.bandes || [["#8ea459", 0.3], ["#4b554d", 0.56], ["#dcd6c8", 1]];      // cumulats : olivine, pyroxène, plagioclase
    const niveau = tableEllipse(CX, CY, RX, RY);
    const liq = (e) => lerp(1, liq1, e), yToit = (e) => niveau(1 - liq(e));
    const clipC = nid("rc"), clipK = nid("rk");
    const cristaux = [];
    // tous les cristaux ont fini de tomber vers t = 0,86 (avant, les derniers restaient figés en pleine chute à la fin de
    // l'étape : « elle semble stoppée avant la fin », 24/09/2026)
    PH.forEach(([, c, a, b], i) => { for (let k = 0; k < (i === 3 ? 10 : 34); k++) cristaux.push({ c, x: CX - RX * 0.78 + R() * RX * 1.56, y0: CY - RY * 0.8 + R() * RY * 0.5, t0: lerp(a, b, R()) * 0.77, r: i === 2 ? 2.6 + R() * 1.4 : 1.5 + R() * 1.3, rot: R() * 180, pl: i === 2 }); });
    const grains = Array.from({ length: 220 }, () => [CX - RX + R() * 2 * RX, CY + R() * RY, R() * 180]);
    const blocs = Array.from({ length: 9 }, () => ({ x: CX - RX * 0.6 + R() * RX * 1.2, t0: 0.12 + R() * 0.6, r: 4 + R() * 3 }));
    const zones = p.zones || [[45, "basalte"], [52, "trachybasalte"], [57, "trachyandésite"], [63, "trachyte"]];
    const zMid = p.zRes ?? 11, PXK = RY / 1.4, yZ = (z) => CY + (z - zMid) * PXK;
    const J0 = p.echelle ? p.echelle[0] : 44, J1 = p.echelle ? p.echelle[1] : 72;
    const SI = (v) => 206 - (v - J0) / (J1 - J0) * 156;                          // jauge de silice : 44 % en bas, 72 % en haut
    let fond = rect(0, 0, W, H, "#d4c6a6");
    for (let y = 28; y < H; y += 23) fond += line(0, y, 300, y + 4, "rgba(120,100,70,.18)", 1);
    fond += `<clipPath id="${clipC}"><ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}"/></clipPath>`;
    if (p.zRes != null) {
      const zs = [];
      for (let z = Math.ceil(zMid - 2.4); z <= zMid + 2.4; z++) if (yZ(z) > 26 && yZ(z) < 232) zs.push(z);
      fond += line(10, yZ(zs[0]), 10, yZ(zs[zs.length - 1]), "#27302d", 1);
      for (const z of zs) fond += line(7, yZ(z), 10, yZ(z), "#27302d", 1) + (z % 2 === Math.round(zMid) % 2 ? txt(13, yZ(z) + 3, `${z} km`, { petit: true }) : "");
    }
    fond += rect(300, 0, W - 300, H, "#f3f1ea");
    // jauge de silice, graduée en noms de roches
    fond += rect(388, SI(J1), 9, SI(J0) - SI(J1), "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 3 });
    zones.forEach(([v, nom], i) => {
      const haut = i + 1 < zones.length ? zones[i + 1][0] : J1;
      fond += rect(389, SI(haut), 7, SI(v) - SI(haut), i % 2 ? "#e6dccb" : "#f6f0e4") + line(384, SI(v), 401, SI(v), "#27302d", 0.8)
        + txt(404, (SI(v) + SI(haut)) / 2 + 3, nom, { petit: true });
    });
    fond += txt(396, 30, "silice du liquide", { a: "middle", petit: true });
    return {
      fond,
      anim(t, ta) {
        const e = fen(t, 0.05, 0.86), yT = yToit(e);
        let d = rect(CX - RX, CY - RY, 2 * RX, 2 * RY, melange(cL0, cL1, e));
        // cumulats : lits d'olivine, puis de pyroxène, puis de plagioclase
        let bas = CY + RY;
        for (const [c, tf] of BANDES) {
          const haut = Math.max(yT, yToit(Math.min(e, fen(tf, 0.05, 0.86))));
          if (haut < bas) d += rect(CX - RX, haut, 2 * RX, bas - haut, c);
          bas = haut;
          if (bas <= yT) break;
        }
        for (const [x, y, a] of grains) if (y > yT + 1.5) d += `<rect x="${r1(x - 1.4)}" y="${r1(y - 0.8)}" width="2.8" height="1.6" fill="rgba(0,0,0,.18)" transform="rotate(${r1(a)} ${r1(x)} ${r1(y)})"/>`;
        // cristaux qui naissent et tombent au fond
        for (const c of cristaux) {
          const u = (t - c.t0) / 0.13;
          if (u < 0 || u > 1) continue;
          const y = lerp(c.y0, yToit(Math.min(1, fen(c.t0 + 0.13, 0.05, 0.86))) - 2, u * u);
          if (y > yT) continue;
          d += c.pl ? `<rect x="${r1(c.x - c.r * 1.5)}" y="${r1(y - c.r * 0.5)}" width="${r1(c.r * 3)}" height="${r1(c.r)}" fill="${c.c}" stroke="rgba(0,0,0,.4)" stroke-width=".5" transform="rotate(${r1(c.rot)} ${r1(c.x)} ${r1(y)})"/>`
            : circ(c.x, y, c.r, c.c, { stroke: "rgba(0,0,0,.35)", "stroke-width": 0.5 });
        }
        // blocs de croûte qui se détachent du toit et fondent en tombant (assimilation)
        if (p.assimilation) for (const b of blocs) {
          const u = (t - b.t0) / 0.2;
          if (u < 0 || u > 1) continue;
          const y = lerp(CY - RY * 0.9, CY + RY * 0.2, u), r = b.r * (1 - u);
          if (y < yT) d += poly([[b.x - r, y - r * 0.6], [b.x + r * 0.8, y - r], [b.x + r, y + r * 0.7], [b.x - r * 0.7, y + r]], "#c9b891", { stroke: "#8d7b5e", "stroke-width": 0.6 });
        }
        let s = `<g clip-path="url(#${clipC})">${d}</g>` + `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="none" stroke="#5b4636" stroke-width="1.6"/>`;
        // le magma arrive par un filon au début
        const arr = 1 - fen(t, 0.12, 0.3);
        s += rect(CX - 4, CY + RY - 3, 8, H - CY - RY + 3, melange("#4a3b33", cL0, arr));
        s += txt(CX, 16, p.lieu || "réservoir à 10–12 km sous la chaîne des Puys", { a: "middle" });
        s += txt(CX, CY + RY + 14, `liquide restant : ${nombre(liq(e) * 100)} %`, { a: "middle", petit: true });
        if (e > 0.25) s += txt(CX, Math.min(CY + RY - 5, (yT + CY + RY) / 2 + 3), "cumulats", { a: "middle", petit: true, op: fen(e, 0.25, 0.4) });
        if (p.assimilation) s += txt(CX, CY - RY - 6, "des morceaux de croûte y tombent et fondent", { a: "middle", petit: true, op: fen(t, 0.15, 0.25) * (1 - fen(t, 0.8, 0.9)) });
        // jauges : silice du liquide, température
        const si = lerp(si0, si1, e), T = lerp(T0, T1, e);
        s += rect(389, SI(si), 7, SI(J0) - SI(si) - 1, "rgba(192,57,43,.55)") + poly([[386, SI(si)], [380, SI(si) - 4], [380, SI(si) + 4]], "#c0392b");
        s += txt(377, SI(si) + 3, `${nombre(si)} %`, { a: "end", petit: true });
        const lo = Math.floor((T1 - 60) / 100) * 100, hi = Math.ceil((T0 + 40) / 100) * 100;
        s += thermometre(312, 46, 140, T, lo, hi, [lo + 100, Math.round((lo + hi) / 200) * 100, hi - 100].filter((v, i, a) => a.indexOf(v) === i));
        s += txt(312, 36, `${nombre(T)} °C`, { a: "middle", petit: true });
        return s;
      },
    };
  };

  // arc volcanique (18/09/2026, prototype andésite, montagne Pelée) — ÉCHELLE VRAIE 1,3 px par km : la plaque océanique
  // (croûte 7 km, plaque 90 km) plonge sous l'arc ; vers 100 km elle perd son eau, qui fait fondre le coin de manteau au-dessus
  // (le manteau sec ne fondrait qu'à ≈ 1 450 °C, hydraté dès 800–860 °C : Grove et al. 2006) ; le magma s'accumule sous la
  // croûte de l'arc puis alimente le volcan. p : nomPlaque, nomArc, volcan, vitesse (texte)
  SCENES.fusionCoinManteau = function (p) {
    const R = alea("fcm" + p.graine);
    const PX = 1.3, MER = 32, Y = (z) => MER + z * PX;
    const XF = 404, RB = 150, TH = Math.PI / 4, EP = 90, Z0 = 5.5, XA = 172;
    function pt(s, n) {
      let x, y, f;
      if (s >= 0) { f = 0; x = XF + s * PX; y = Y(Z0); }
      else if (s >= -RB * TH) { f = -s / RB; x = XF - RB * Math.sin(f) * PX; y = Y(Z0) + RB * (1 - Math.cos(f)) * PX; }
      else { f = TH; const d = (-s - RB * TH) * PX; x = XF - RB * Math.sin(TH) * PX - d * Math.cos(TH); y = Y(Z0) + RB * (1 - Math.cos(TH)) * PX + d * Math.sin(TH); }
      return [x + n * PX * Math.sin(f), y + n * PX * Math.cos(f)];
    }
    const trace = (n, sa, sb) => { const o = []; for (let k = 0; k <= 80; k++) o.push(pt(lerp(sa, sb, k / 80), n)); return o; };
    const S0 = -300, S1 = (W - XF) / PX + 5;
    const dessus = trace(0, S1, S0);
    const surfaceArc = (x) => x < XF - 18 ? (Math.abs(x - XA) < 26 ? Y(2.5) - (Y(2.5) - MER + 2.5) * Math.cos((x - XA) / 26 * Math.PI / 2) ** 2 : Y(x < XA ? 2.5 : 3)) : Y(lerp(3, Z0 + 1, (x - (XF - 18)) / 18));
    const surf = []; for (let x = -2; x <= XF; x += 4) surf.push([x, surfaceArc(x)]);
    const moho = (x) => Y(22 + 8 * Math.exp(-(((x - XA) / 70) ** 2)));
    const clipU = nid("fu");
    const plaqueSup = surf.concat(trace(0, 0, S0)).concat([[-5, H + 300]]);
    // eau libérée par la plaque, puis gouttes de magma qui montent vers la base de l'arc
    const eau = Array.from({ length: 22 }, () => { const z = 80 + R() * 55; let s = -RB * TH - ((z - Z0 - RB * (1 - Math.cos(TH))) / Math.sin(TH)); return { q: pt(s, 0), ph: R() }; });
    const gouttes = Array.from({ length: 20 }, () => ({ x0: XA - 40 + R() * 95, y0: Y(88 + R() * 26), ph: R(), dx: (R() - 0.5) * 16 }));
    let fond = ciel(MER) + rect(0, MER, W, H - MER, "#5f97bd") + rect(0, Y(4), W, H - Y(4), "#e0b27c");
    fond += `<clipPath id="${clipU}"><polygon points="${P(plaqueSup)}"/></clipPath><g clip-path="url(#${clipU})">`
      + poly(surf.concat([[XF + 20, H], [-5, H]]), "#9ea675")
      + poly(surf.concat(Array.from({ length: 101 }, (_, i) => { const x = XF - i * 4.06; return [x, moho(x)]; })), "#d7c7a2")
      + rect(-5, Y(60), W + 10, H, "#e0b27c") + line(-5, Y(60), W, Y(60), "rgba(120,90,50,.35)", 1, { "stroke-dasharray": "4 3" }) + `</g>`;
    fond += poly(trace(EP, S1, S0).concat([[-60, H + 400], [W + 20, H + 400]]), "#e0b27c");
    fond += poly(trace(7, S1, S0).concat(trace(EP, S0, S1)), "#97a270") + poly(trace(0, S1, S0).concat(trace(7, S0, S1)), "#46534d");
    fond += pline(dessus, "#2f3a35", 1.1);
    fond += line(6, Y(0), 6, Y(150), "#27302d", 1);
    for (let z = 50; z <= 150; z += 50) fond += line(3, Y(z), 6, Y(z), "#27302d", 1) + txt(9, Y(z) + 3, `${z} km`, { petit: true });
    fond += txt(64, Y(13) + 3, p.nomArc || "plaque caraïbe", { a: "middle", petit: true });
    fond += txt(W - 8, Y(40), p.nomPlaque || "plaque atlantique", { a: "end", petit: true });
    fond += txt(W - 8, Y(8) + 1, "croûte océanique ≈ 7 km", { a: "end", petit: true, clair: true });
    fond += txt(W - 8, Y(100), "asthénosphère", { a: "end", petit: true });
    fond += txt(XF + 4, MER - 5, "fosse", { a: "middle", petit: true });
    // la plaque AVANCE et plonge (24/09/2026, sa demande : « bien animer la plaque plongeante ») : des repères tracés en
    // travers de la plaque (un tous les 25 km) défilent le long de son trajet, avec les sédiments posés sur son dos ; le
    // manteau du coin, entraîné par frottement, descend avec elle (écoulement en coin : il arrive par l'arrière de l'arc).
    // Vitesse d'animation fixe (7 km par seconde), indépendante de la vitesse réelle affichée (≈ 2 cm par an).
    const V = 7, PAS = 25;
    const sedPlaque = Array.from({ length: 14 }, () => ({ s: R() * (S1 - S0), dy: R() }));
    const flux = [[16, 72], [30, 92]].map(([d, z]) => {
      let s1 = -RB * TH;
      while (s1 > S0 && pt(s1, -d)[1] < Y(z)) s1 -= 2;
      const q = pt(s1, -d), l = [[-10, Y(z)], [q[0] - 60, Y(z) + 2], q];
      for (let k = 1; k <= 12; k++) l.push(pt(s1 - k * 12, -d));
      return courbe(l, 6);
    });
    const dirPlong = (sa) => { const a = pt(sa, 60), b = pt(sa - 22, 60); return [a, b]; };
    return {
      fond,
      anim(t, ta) {
        const e1 = fen(t, 0.04, 0.3), e2 = fen(t, 0.2, 0.55), e3 = fen(t, 0.45, 0.85), e4 = fen(t, 0.75, 0.92);
        let s = "";
        const D = ta * V;
        // repères en travers de la plaque, qui avancent vers la fosse puis plongent
        // un repère lié à la plaque a pour abscisse s0 − D : il va VERS la fosse puis plonge (24/09/2026 : ils reculaient)
        for (let sk = S1 - (D % PAS); sk > S0; sk -= PAS) {
          s += pline([pt(sk, 7.5), pt(sk, EP - 1)], "rgba(255,255,255,.28)", 1.2) + pline([pt(sk, 0.6), pt(sk, 6.5)], "#8d9892", 1.3);
        }
        // sédiments du fond de l'océan portés par la plaque (entraînés sous la fosse)
        for (const g of sedPlaque) {
          const sk = S1 - ((g.s + D) % (S1 - S0));
          if (sk < -RB * TH - 30) continue;
          const [x, y] = pt(sk, -0.8);
          s += ell(x, y, 3.2, 1.3, "#c7b489", { opacity: op(Math.min(1, (sk + RB * TH + 30) / 30)) });
        }
        // manteau du coin entraîné par la plaque
        flux.forEach((l, j) => {
          for (let k = 0; k < 9; k++) {
            const u = (k / 9 + ta * 0.045 + j * 0.05) % 1, q = lePlong(l, u);
            if (q.y < Y(62)) continue;
            s += poly([[q.x + Math.cos(q.a) * 3.2, q.y + Math.sin(q.a) * 3.2], [q.x - Math.cos(q.a) * 2 - Math.sin(q.a) * 2, q.y - Math.sin(q.a) * 2 + Math.cos(q.a) * 2], [q.x - Math.cos(q.a) * 2 + Math.sin(q.a) * 2, q.y - Math.sin(q.a) * 2 - Math.cos(q.a) * 2]], "#9a6a3a", { opacity: 0.55 * Math.min(1, u * 6, (1 - u) * 6) });
          }
        });
        s += txt(34, Y(66), "le manteau est entraîné par la plaque", { petit: true, op: 0.9 });
        // flèche le long du plongement
        const [a0, b0] = dirPlong(-RB * TH - 12);
        s += fleche(a0[0], a0[1], b0[0], b0[1], { c: "#f4f1ea", sw: 2, pointe: 7 });
        const ang = Math.atan2(b0[1] - a0[1], b0[0] - a0[0]) * 180 / Math.PI + 180;
        s += `<text x="${r1(a0[0] + 6)}" y="${r1(a0[1] - 2)}" class="fa-lab fa-petit fa-clair" transform="rotate(${r1(ang)} ${r1(a0[0] + 6)} ${r1(a0[1] - 2)})">la plaque plonge</text>`;
        for (const g of eau) {
          const u = (g.ph + ta * 0.3) % 1;
          s += circ(g.q[0] - 3 - u * 4, g.q[1] - 3 - u * 22, 1.7, "#3f8fd2", { opacity: op(e1 * Math.sin(u * Math.PI)) });
        }
        for (const g of gouttes) {
          const u = (g.ph + ta * 0.16) % 1, x = lerp(g.x0, XA + g.dx * 0.3, u), y = lerp(g.y0, moho(XA) + 4, u);
          s += circ(x, y, 1.9 + u, MAGMA, { opacity: op(e2 * Math.min(1, u * 5, (1 - u) * 6)) });
        }
        if (e3 > 0) s += ell(XA, moho(XA) + 1, 10 + 22 * e3, 3 + 3 * e3, MAGMA, { opacity: 0.85 });
        if (e4 > 0) s += line(XA, moho(XA), XA, lerp(moho(XA), MER - 4, e4), MAGMA, 2.4);
        // le volcan (symbole, hauteur exagérée) et son panache
        s += poly([[XA - 11, MER + 1], [XA - 2, MER - 12], [XA + 2, MER - 12], [XA + 11, MER + 1]], "#6b5a4d");
        if (e4 > 0.5) for (let k = 0; k < 5; k++) { const u = (ta * 0.3 + k / 5) % 1; s += circ(XA + Math.sin(u * 5 + k) * 3, MER - 16 - u * 16, 3 + u * 5, "#8b8580", { opacity: op((e4 - 0.5) * 2 * 0.55 * (1 - u)) }); }
        s += txt(XA + 14, MER - 8, p.volcan || "montagne Pelée", { petit: true });
        s += fleche(224, Y(117), 208, Y(112), { sw: 1, pointe: 4, op: e1 }) + txt(226, Y(119), "l'eau quitte la plaque", { petit: true, op: e1 }) + txt(XA - 8, Y(78), "le manteau hydraté fond", { a: "end", petit: true, op: e2 });
        s += fleche(468, 14, 426, 14, { sw: 2, pointe: 7, op: 0.8 }) + txt(420, 17, p.vitesse || "≈ 2 cm par an", { a: "end", petit: true });
        // la clé : l'eau abaisse la température de fusion du manteau (vers 100 km)
        const bx = 30, by = 150, X = (T) => bx + 8 + (T - 700) / 800 * 84, yb = by + 36;
        s += rect(bx, by, 100, 74, "rgba(255,255,255,.93)", { rx: 5, stroke: "rgba(0,0,0,.14)" });
        s += `<text x="${bx + 7}" y="${by + 12}" class="fa-leg">vers 100 km, le manteau</text><text x="${bx + 7}" y="${by + 22}" class="fa-leg">est à ≈ 1 300 °C <tspan style="fill:#c0392b">▼</tspan></text>`;
        s += rect(X(800), yb - 4, X(860) - X(800), 8, "#3f8fd2") + rect(X(1450), yb - 4, 2.5, 8, "#27302d") + line(X(700), yb, X(1500), yb, "#27302d", 0.8);
        s += poly([[X(1300), yb - 1], [X(1300) - 4, yb - 8], [X(1300) + 4, yb - 8]], "#c0392b");
        s += `<text x="${bx + 7}" y="${yb + 15}" class="fa-leg"><tspan style="fill:#2f7cc0">■</tspan> avec eau : fond dès 800 °C</text><text x="${bx + 7}" y="${yb + 26}" class="fa-leg">▮ à sec : vers 1 450 °C</text>`;
        return s;
      },
    };
  };

  // profil d'un dôme de lave (super-ellipse posée sur le sol) ; k < 1 = profil intérieur (bandes de fluidalité, cœur chaud)
  function profilDome(XV, SOL, h, w, k = 1) {
    const pts = [];
    for (let i = 0; i <= 44; i++) { const u = -1 + i / 22; pts.push([XV + u * w * k, SOL - h * k * Math.pow(Math.max(0, 1 - Math.abs(u) ** 2.4), 0.5)]); }
    return pts;
  }
  // aiguille de lave : large à la base, flancs striés, sommet déchiqueté (base en yb, hauteur ai, demi-largeur lb)
  function aiguilleLave(XV, yb, ai, lb, c) {
    const contour = [[XV - lb, yb], [XV - lb * 0.82, yb - ai * 0.45], [XV - lb * 0.6, yb - ai * 0.9], [XV - lb * 0.5, yb - ai],
      [XV - lb * 0.2, yb - ai - 4], [XV + lb * 0.05, yb - ai + 1], [XV + lb * 0.3, yb - ai - 6], [XV + lb * 0.5, yb - ai - 1],
      [XV + lb * 0.62, yb - ai * 0.8], [XV + lb * 0.78, yb - ai * 0.4], [XV + lb, yb]];
    let s = poly(contour, c, { stroke: "#5d554b", "stroke-width": 0.9 });
    for (const f of [-0.45, -0.1, 0.25, 0.55]) s += line(XV + lb * f * 1.2, yb - 1, XV + lb * f * 0.95, yb - ai * 0.85, "rgba(60,52,44,.45)", 0.8);
    return s;
  }
  // un dôme de lave visqueuse grandit au-dessus de sa bouche, à l'ÉCHELLE VRAIE (≈ 6 m par px) : blocs qui roulent, éboulis,
  // fissures incandescentes ; aiguille (phonolite, dacite) et dernière éruption explosive (puy de Dôme) en option.
  // p : nom, hauteur (px), demiLargeur (px), cote (texte), laveT, cones (cônes de scories voisins), aiguille (px),
  //     explosion, couleurLave, couleurMagma, libelleAge, texte
  SCENES.domeExtrusion = function (p) {
    const R = alea("dx" + p.graine);
    const SOL = 172, XV = 246, HM = p.hauteur || 76, WM = p.demiLargeur || 146;
    const cLave = p.couleurLave || "#c4baad", cMagma = p.couleurMagma || "#eaa45e";
    const blocs = Array.from({ length: 38 }, () => ({ tb: 0.1 + R() * 0.8, sg: R() < 0.5 ? -1 : 1, d: 4 + R() * 24, r: 1.2 + R() * 1.8, u0: 0.05 + R() * 0.4, rot: R() * 90 }));
    const fissures = Array.from({ length: 9 }, () => ({ u: -0.55 + R() * 1.1, l: 3 + R() * 4, ph: R() * 6 }));
    // cratere : le dôme pousse DANS le cratère sommital d'un volcan (montagne Pelée, 1902 : cratère de l'Étang Sec, ouvert
    // au sud-ouest par l'entaille de la Rivière Blanche, par où les nuées sont descendues vers Saint-Pierre)
    const CF = WM + 16;
    const flanc = p.cratere ? courbe([[-6, SOL + 44], [XV - CF - 60, SOL + 8], [XV - CF - 14, SOL - 22], [XV - CF - 2, SOL - 6], [XV - CF + 6, SOL],
      [XV + CF - 6, SOL], [XV + CF + 4, SOL - 5], [XV + CF + 14, SOL - 9], [XV + CF + 60, SOL + 16], [W + 6, SOL + 50]], 6) : null;
    let fond = ciel(p.cratere ? H : SOL);
    if (p.cratere) {
      fond += poly(flanc.concat([[W + 6, H + 2], [-6, H + 2]]), "#a4957c");
      for (const d of [9, 20, 31]) for (const cote of [(x) => x < XV - CF - 4, (x) => x > XV + CF + 4])
        fond += pline(flanc.filter(([x]) => cote(x)).map(([x, y]) => [x, y + d]), "rgba(80,65,45,.18)", 1);
      fond += txt(22, SOL + 30, "flanc du volcan", { petit: true }) + txt(XV - CF - 14, SOL - 28, "bord du cratère", { a: "middle", petit: true });
    } else {
      fond += rect(0, SOL, W, H - SOL, "#a4957c");
      for (let y = SOL + 14; y < H; y += 16) fond += line(0, y, W, y + 3, "rgba(80,65,45,.18)", 1);
    }
    if (p.cones) for (const [x, h, w] of [[36, 24, 40], [452, 20, 36]]) {
      fond += poly([[x - w, SOL], [x - 9, SOL - h], [x - 4, SOL - h + 3], [x + 4, SOL - h + 3], [x + 9, SOL - h], [x + w, SOL]], "#6e4b3b");
    }
    if (p.cones) fond += txt(W - 5, SOL - 28, "cône de scories", { a: "end", petit: true });
    fond += p.cratere ? pline(flanc, "#6d8a4a", 2) : line(0, SOL, W, SOL, "#6d8a4a", 2);
    return {
      fond,
      anim(t, ta) {
        // le dôme grandit COUCHE APRÈS COUCHE (24/09/2026, sa demande : « pas juste en augmentant la taille de 3 couches ») :
        // chaque poussée de lave monte par le conduit, sort au sommet et s'écoule sur les deux flancs en recouvrant le dôme
        // précédent ; une fois posée, elle refroidit (orange → gris) et la suivante la recouvre. NC poussées sur 0,03–0,86.
        const NC = p.couches || 6, D = 0.83 / NC;
        const hC = (i) => i <= 0 ? 0 : HM * Math.pow(i / NC, 0.65), wC = (i) => i <= 0 ? 0 : WM * Math.pow(i / NC, 0.5);
        const yC = (i, x) => { if (i <= 0) return SOL; const u = Math.abs(x - XV) / wC(i); return u >= 1 ? SOL : SOL - hC(i) * Math.pow(1 - u ** 2.4, 0.5); };
        const debut = (i) => 0.03 + (i - 1) * D, gC = (i) => fen(t, debut(i), debut(i) + D * 0.92);
        let cur = 1;
        while (cur < NC && gC(cur) >= 1) cur++;
        const g = gC(cur), e = clamp((cur - 1 + g) / NC);
        const h = Math.max(3, lerp(hC(cur - 1), hC(cur), g)), w = Math.max(12, lerp(wC(cur - 1), wC(cur), g));
        let s = rect(XV - 4, SOL - 2, 8, H - SOL + 2, cMagma);
        for (let k = 0; k < 5; k++) { const u = (ta * 0.35 + k / 5) % 1; s += ell(XV, lerp(H, SOL + 4, u), 2, 4, "#f6cf8f", { opacity: op(0.7 * (1 - fen(t, 0.9, 1))) }); }
        // éboulis au pied, qui grossissent
        const tal = fen(t, 0.15, 0.95);
        const pied = (d) => p.cratere ? Math.min(d, CF - 3) : d;
        for (const sg of [-1, 1]) if (tal > 0.02) s += poly([[XV + sg * w * 0.7, SOL], [XV + sg * Math.min(w * 0.86, pied(w * 0.86)), SOL - 9 * tal], [XV + sg * pied(w + 26 * tal), SOL]], "#9d9386");
        // couches déjà posées (de la plus grande à la plus petite) : chacune refroidit après sa mise en place
        for (let i = cur - 1; i >= 1; i--) {
          const froid = fen(t, debut(i) + D * 0.9, debut(i) + D * 2.6);
          const pr = []; for (let k = 0; k <= 60; k++) { const x = XV - wC(i) + k * wC(i) / 30; pr.push([x, yC(i, x)]); }
          s += poly(pr, melange(cMagma, cLave, froid), { stroke: "#7d7468", "stroke-width": 0.9 });
        }
        // la poussée en cours : le magma monte au travers du dôme, sort au sommet et coule sur les flancs (front arrondi)
        const yTop = yC(cur - 1, XV);
        if (g < 1 || cur === NC) {
          if (g < 1 && cur > 1) s += rect(XV - 2.5, yTop, 5, SOL - yTop, cMagma);
          const fr = g * wC(cur), haut = [], bas = [];
          for (let k = 0; k <= 40; k++) {
            const x = XV - fr + k * fr / 20, q = clamp((fr - Math.abs(x - XV)) / 7);
            haut.push([x, lerp(yC(cur - 1, x), yC(cur, x), Math.sqrt(q))]); bas.push([x, yC(cur - 1, x)]);
          }
          if (fr > 0.5) s += poly(haut.concat(bas.reverse()), melange(cMagma, cLave, cur === NC ? fen(t, 0.86, 1) : 0), { stroke: "#7d7468", "stroke-width": 0.9 });
          if (g > 0.03 && g < 0.97) {
            const xf = XV + fr, yf = lerp(yC(cur - 1, xf), yC(cur, xf), 0.6);
            s += fleche(xf + 16, yf - 12, xf + 3, yf - 2, { sw: 1.1, pointe: 5, op: fen(g, 0.03, 0.12) * (1 - fen(g, 0.9, 0.97)) })
              + txt(190, 30, cur === 1 ? "1re poussée de lave : elle sort par la bouche et s'étale" : `${cur}e poussée : la lave sort au sommet et recouvre les couches précédentes`, { a: "middle", petit: true, op: fen(g, 0.03, 0.12) * (1 - fen(g, 0.9, 0.97)) });
          }
        }
        const P0 = profilDome(XV, SOL, h, w);
        for (const f of fissures) {
          const i = Math.round((f.u + 1) * 22), q = P0[clamp(i, 1, 43)];
          s += line(q[0], q[1] + 1, q[0] + f.u * 2, q[1] + f.l, "#f08a3a", 1.4, { opacity: op((0.45 + 0.4 * Math.sin(ta * 3 + f.ph)) * fen(e, 0.1, 0.3)) });
        }
        // aiguille (phonolite, dacite, montagne Pelée) : un bouchon de lave déjà solide, poussé d'un bloc par le conduit.
        // Aussi large à la base qu'haute sur un tiers (Pelée : ≈ 100–150 m de large, ≈ 300 m de haut), flancs striés par
        // le frottement, sommet déchiqueté qui s'écroule en blocs au pied (24/09/2026 : l'ancienne lame fine « semble une épée »)
        if (p.aiguille) {
          const ai = fen(t, 0.78, 0.97) * p.aiguille, yb = SOL - h + 3, lb = Math.max(9, p.aiguille * 0.36);
          if (ai > 1) {
            s += aiguilleLave(XV, yb, ai, lb, melange(cLave, "#6f665b", 0.35));
            for (let k = 0; k < 7; k++) { const sg = k % 2 ? 1 : -1, x = XV + sg * (lb + 1 + (k * 5) % 11); s += poly([[x - 3, yC(NC, x) + 1], [x, yC(NC, x) - 3 * fen(t, 0.84, 0.98)], [x + 3, yC(NC, x) + 1]], "#8b8276"); }
            if (p.aiguilleTexte && ai > p.aiguille * 0.6) s += line(XV + lb * 0.6, yb - ai * 0.75, XV + lb + 16, yb - ai * 0.75 - 6, "#27302d", 0.7, { opacity: op(fen(t, 0.9, 0.96)) })
              + txt(XV + lb + 18, yb - ai * 0.75 - 7, p.aiguilleTexte, { petit: true, op: fen(t, 0.9, 0.96) });
          }
        }
        // blocs qui se détachent et roulent jusqu'au pied
        for (const b of blocs) {
          if (t < b.tb) continue;
          const u = clamp((t - b.tb) / 0.07), i = Math.round((b.sg * b.u0 + 1) * 22), q = P0[clamp(i, 0, 44)];
          const xf = XV + b.sg * pied(w * 0.8 + b.d * tal), yf = SOL - 2;
          const x = lerp(q[0], xf, u), y = lerp(q[1], yf, u) - Math.sin(u * Math.PI) * 4;
          s += `<rect x="${r1(x - b.r)}" y="${r1(y - b.r)}" width="${r1(2 * b.r)}" height="${r1(2 * b.r)}" fill="#8b8276" transform="rotate(${r1(b.rot + u * 200)} ${r1(x)} ${r1(y)})"/>`;
        }
        // dernière éruption : colonne et nuée qui descend un flanc, puis un voile de cendres
        if (p.explosion) {
          const [xa, xb] = p.explosionT || [0.86, 0.96];
          const ex = fen(t, xa, xb);
          if (ex > 0 && t < xb + 0.03) for (let k = 0; k < 6; k++) { const u = (ta * 0.25 + k / 6) % 1; s += circ(XV + Math.sin(u * 5 + k) * 6, SOL - h - 8 - u * 60, 6 + u * 12, "#8e8a86", { opacity: op(0.5 * (1 - u) * (1 - fen(t, xb, xb + 0.03))) }); }
          if (ex > 0) {
            const trajet = p.cratere ? P0.slice(22).concat(flanc.filter(([x]) => x > XV + CF - 4).map(([x, y]) => [x, y - 1]))
              : p.nueeLointaine ? P0.slice(22).concat([[W + 10, SOL - 1]]) : P0.slice(22);
            const q = lePlong(trajet, ex);
            if (ex < 1) s += circ(q.x + 4, q.y - 5, 8 + ex * 6, "#9a948c", { opacity: 0.8 }) + circ(q.x - 5, q.y - 8, 6 + ex * 4, "#b1aba2", { opacity: 0.8 });
            const dep = [];
            for (let k = 0; k <= 30; k++) { const r = lePlong(trajet, ex * k / 30); dep.push([r.x, r.y - 1.2]); }
            s += pline(dep, "#dcd6cc", 2.2);
            if (p.nueeLointaine) s += txt(W - 8, p.cratere ? SOL - 4 : SOL - 18, p.nueeLointaine, { a: "end", petit: true, op: fen(t, xa, xa + 0.04) * (1 - fen(t, xb + 0.06, xb + 0.14)) });
          }
        }
        // étiquettes
        s += txt(190, 14, p.texte || "trop visqueuse pour couler, la lave s'empile", { a: "middle", op: 1 - fen(t, 0.5, 0.6) });
        s += txt(XV, SOL - h - (p.aiguille ? p.aiguille + 12 : 10), p.nomDome || `dôme de ${p.nom || "trachyte"}`, { a: "middle", op: fen(e, 0.2, 0.35) });
        s += txt(XV + w + 10, SOL - 12, "éboulis", { petit: true, op: fen(t, 0.45, 0.55) * (p.cones ? 1 - fen(t, 0.7, 0.8) : 1) });
        s += txt(XV + 8, H - 8, `conduit : magma à ${p.laveT || "≈ 800 °C"}`, { petit: true });
        if (p.cote) {
          const c = fen(t, 0.86, 0.95), xc = XV - WM - 14;
          s += `<g opacity="${op(c)}">${line(xc, SOL, xc, SOL - HM, "#27302d", 1) + line(xc - 3, SOL - HM, xc + 3, SOL - HM, "#27302d", 1) + line(xc - 3, SOL, xc + 3, SOL, "#27302d", 1)}</g>`
            + txt(xc - 5, SOL - HM / 2 + 3, p.cote, { a: "end", petit: true, op: c });
        }
        s += compteur(412, 14, 0, { libelle: p.libelleExplosion && t > (p.explosionT || [0.86])[0] ? p.libelleExplosion : (p.libelleAge || "il y a ≈ 11 000 ans") });
        return s;
      },
    };
  };

  // le dôme refroidit de l'extérieur vers le cœur : débit en éventail (prismes perpendiculaires à la surface) ou en dalles
  // parallèles (phonolite) ; loupe : texture au microscope (trachytique, phonolitique, dacitique, verre). Arbres à la fin.
  // p : debit ("eventail" | "dalles"), texture, legende [l1, l2], tDebut, hauteur, demiLargeur, libelleAge, dureeRefroid
  SCENES.refroidissementDome = function (p0, roche) {
    // hérite de l'étape du dôme (aiguille, cratère, taille) et prend le sol de l'étape d'érosion (mêmes couches, même
    // conduit) : les trois diapos montrent le même objet (24/09/2026)
    const etapes = ((roche && Formation.animation(roche)) || {}).etapes || [];
    const pDome = (etapes.find((E) => E.scene === "domeExtrusion") || {}).p || {}, pErod = (etapes.find((E) => E.scene === "degagement") || {}).p;
    const p = Object.assign({ aiguille: pDome.aiguille, cratere: pDome.cratere, hauteur: pDome.hauteur, demiLargeur: pDome.demiLargeur }, p0);
    const solC = pErod && pErod.couches && !p.cratere ? pErod.couches : null;
    const R = alea("rfd" + p.graine);
    const SOL = 176, XV = 148, HM = (p.hauteur || 76) * 0.85, WM = (p.demiLargeur || 146) * 0.85;
    const P0 = profilDome(XV, SOL, HM, WM);
    const normales = P0.map((q, i) => { const a = P0[Math.max(0, i - 1)], b = P0[Math.min(P0.length - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]); return { x: q[0], y: q[1], nx: -Math.sin(ang), ny: Math.cos(ang) }; });
    const CXL = 416, CYL = 98, RL = 54;
    const L = loupe(CXL, CYL, RL, { fond: "#a89f90" });
    const tex = p.texture || "trachytique";
    const micro = Array.from({ length: 150 }, () => ({ x: CXL - 64 + R() * 128, y: CYL - 64 + R() * 128, a: (tex === "trachytique" ? 12 + (R() - 0.5) * 26 : R() * 180), l: 3 + R() * 4, ph: R() }));
    const pheno = Array.from({ length: tex === "verre" ? 0 : 6 }, () => ({ x: CXL - 40 + R() * 80, y: CYL - 40 + R() * 80, a: (R() - 0.5) * 60, l: 8 + R() * 7, w: 4 + R() * 3 }));
    const sombres = Array.from({ length: tex === "verre" ? 0 : 5 }, () => ({ x: CXL - 42 + R() * 84, y: CYL - 42 + R() * 84, a: R() * 180, r: 3 + R() * 2 }));
    const clipD = nid("dm");
    const fondL = { trachytique: "#b3aa9a", phonolitique: "#aeb09a", dacitique: "#b9ad9c", andesitique: "#a9a397", rhyolitique: "#c6a79b", verre: "#d9ccb5" }[tex] || "#b3aa9a";
    // cratere : même cadre qu'à l'étape du dôme (montagne Pelée) — le dôme remplit le cratère sommital
    const CF = WM + 14;
    const flanc = p.cratere ? courbe([[-6, SOL + 40], [XV - CF - 50, SOL + 6], [XV - CF - 12, SOL - 19], [XV - CF - 2, SOL - 5], [XV - CF + 5, SOL],
      [XV + CF - 5, SOL], [XV + CF + 3, SOL - 4], [XV + CF + 12, SOL - 8], [XV + CF + 50, SOL + 14], [W + 6, SOL + 46]], 6) : null;
    const sol = p.cratere ? (x) => hauteur(flanc, x) : () => SOL;
    return {
      fond: (p.cratere ? ciel(H) + poly(flanc.concat([[W + 6, H + 2], [-6, H + 2]]), "#a4957c") + pline(flanc, "#6d8a4a", 2)
          : solC ? ciel(SOL) + rect(0, SOL, W, 40, solC[0][0]) + rect(0, SOL + 40, W, H, solC[1][0]) + [...Array(6)].map((_, k) => line(0, SOL + 8 + k * 11, W, SOL + 10 + k * 11, "rgba(60,45,30,.16)", 1)).join("")
            + rect(XV - 12, SOL, 24, H - SOL, "#a9a094") + txt(300, SOL + 20, solC[0][1], { petit: true, clair: true }) + line(0, SOL, W, SOL, "#6d8a4a", 2)
          : ciel(SOL) + rect(0, SOL, W, H - SOL, "#a4957c") + line(0, SOL, W, SOL, "#6d8a4a", 2)) + L.fond
        + `<clipPath id="${clipD}"><polygon points="${P(P0)}"/></clipPath>`,
      anim(t, ta) {
        const e = fen(t, 0.04, 0.9);
        let s = nuage(40 + 2 * ta, 26, 0.8) + nuage(300 + 1.4 * ta, 20, 0.7);
        // le dôme : cœur chaud qui rétrécit, carapace froide qui s'épaissit
        s += poly(P0, "#a9a094", { stroke: "#7d7468", "stroke-width": 1 });
        const k = 1 - e * 0.94;
        if (k > 0.08) s += poly(profilDome(XV, SOL, HM, WM, k), MAGMA_CLAIR, { opacity: op(0.3 + 0.5 * k) });
        // les fissures de refroidissement ne vont QUE dans la roche déjà froide : chaque prisme part de la surface et s'arrête
        // au front de refroidissement (profil du cœur chaud, même abscisse relative), dans le dôme (découpe) ; le cœur, qui
        // refroidit en dernier, garde un débit irrégulier (24/09/2026 : « les barres se prolongent trop »)
        const kf = Math.max(k, 0.3);
        const Pk = profilDome(XV, SOL, HM, WM, kf);
        let j = "";
        if ((p.debit || "eventail") === "eventail") {
          P0.forEach((q, i) => { if (i % 2 || i < 4 || i > 40) return; j += line(q[0], q[1], Pk[i][0], Pk[i][1], "rgba(45,40,34,.55)", 1); });
        } else {
          for (let n = 1; n <= 9; n++) { const kk = 1 - n * 0.075; if (kk < kf) break; j += pline(profilDome(XV, SOL, HM, WM, kk), "rgba(45,40,34,.5)", 0.9); }
        }
        s += `<g clip-path="url(#${clipD})">${j}</g>`;
        // l'aiguille de l'étape précédente s'écroule en quelques mois (montagne Pelée : 1903) ; ses blocs s'amassent au sommet
        if (p.aiguille) {
          const ec = fen(t, 0.12, 0.45), ai = p.aiguille * 0.85 * (1 - ec), lb = Math.max(8, p.aiguille * 0.85 * 0.36);
          const yb = SOL - HM + 3;
          if (ai > 2) s += aiguilleLave(XV, yb, ai, lb * (1 - 0.3 * ec), "#8f877c");
          for (let k = 0; k < 9; k++) { const x = XV + (k - 4) * lb * 0.42, yk = hauteur(P0, x); s += poly([[x - 4, yk + 1], [x - 1, yk - 4 * ec], [x + 4, yk + 1]], "#8b8276", { opacity: op(fen(t, 0.14, 0.4)) }); }
          s += txt(XV + lb + 8, yb - ai * 0.6, "l'aiguille s'écroule en quelques mois", { petit: true, op: fen(t, 0.08, 0.14) * (1 - fen(t, 0.5, 0.58)) });
        }
        // la végétation revient à la fin, posée sur le dôme et le sol autour
        const v = fen(t, 0.86, 0.97);
        if (v > 0) s += vegetation((x) => Math.abs(x - XV) < WM ? Math.min(sol(x), hauteur(P0, x)) : sol(x), 6, 290, alea("veg" + p.graine), { op: v, pas: 17 });
        // loupe : la texture au microscope ; les microlites apparaissent pendant le refroidissement
        let d = rect(CXL - 70, CYL - 70, 140, 140, fondL);
        if (tex === "verre") {
          for (let j = 0; j < 9; j++) { const cx = CXL - 40 + (j % 3) * 40 + (j * 7 % 11), cy = CYL - 40 + Math.floor(j / 3) * 40; d += circ(cx, cy, 7 + (j % 3) * 2, "none", { stroke: "rgba(90,70,50,.45)", "stroke-width": 0.8 }) + circ(cx, cy, 3.5, "none", { stroke: "rgba(90,70,50,.35)", "stroke-width": 0.7 }); }
          for (let j = 0; j < 6; j++) d += line(CXL - 70, CYL - 50 + j * 20, CXL + 70, CYL - 46 + j * 20, "rgba(120,95,70,.25)", 1.2);
        }
        for (const m of micro) {
          if (tex === "verre" && m.ph > 0.18) continue;
          const kk = fen(t, 0.08 + m.ph * 0.6, 0.3 + m.ph * 0.6);
          if (kk <= 0.02) continue;
          const dx = Math.cos(m.a * Math.PI / 180) * m.l * kk, dy = Math.sin(m.a * Math.PI / 180) * m.l * kk;
          d += line(m.x - dx, m.y - dy, m.x + dx, m.y + dy, tex === "phonolitique" && m.ph > 0.7 ? "#4f7d3a" : "#efebe2", 1.3, { opacity: op(0.9 * kk) });
        }
        for (const f of pheno) {
          if (tex === "rhyolitique" && f.w < 5.5) { d += circ(f.x, f.y, f.w * 1.1, "#f6f4ef", { stroke: "#8a847a", "stroke-width": 0.7 }); continue; }
          if (tex === "phonolitique") d += poly(Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + f.a; return [f.x + Math.cos(a) * f.w * 1.3, f.y + Math.sin(a) * f.w * 1.3]; }), "#f1eee6", { stroke: "#7c776c", "stroke-width": 0.7 });
          else d += `<rect x="${r1(f.x - f.l / 2)}" y="${r1(f.y - f.w / 2)}" width="${r1(f.l)}" height="${r1(f.w)}" fill="#f4f1ea" stroke="#7c776c" stroke-width=".7" transform="rotate(${r1(f.a)} ${r1(f.x)} ${r1(f.y)})"/>`
            + (tex === "dacitique" || tex === "andesitique" ? `<rect x="${r1(f.x - f.l / 4)}" y="${r1(f.y - f.w / 4)}" width="${r1(f.l / 2)}" height="${r1(f.w / 2)}" fill="none" stroke="#a9a294" stroke-width=".6" transform="rotate(${r1(f.a)} ${r1(f.x)} ${r1(f.y)})"/>` : "");
        }
        // biotite : baguettes brunes ; amphibole : prismes allongés vert-brun ; pyroxène : sections trapues pâles
        for (const b of sombres) {
          const c = Math.cos(b.a * Math.PI / 180), sn = Math.sin(b.a * Math.PI / 180);
          const forme = tex === "andesitique" ? [[-1, -0.55], [-0.45, -1], [0.45, -1], [1, -0.55], [1, 0.55], [0.45, 1], [-0.45, 1], [-1, 0.55]]
            : tex === "dacitique" ? [[-1.8, 0], [-1.2, -0.6], [1.2, -0.6], [1.8, 0], [1.2, 0.6], [-1.2, 0.6]] : [[-1.9, -0.45], [1.9, -0.45], [1.9, 0.45], [-1.9, 0.45]];
          d += poly(forme.map(([u, v]) => [b.x + (u * c - v * sn) * b.r, b.y + (u * sn + v * c) * b.r]), tex === "dacitique" ? "#6b6a3e" : tex === "andesitique" ? "#cfc9a2" : "#6b4a2b", { stroke: "#4a453b", "stroke-width": 0.6 });
        }
        s += L.dans(d) + L.bord;
        const lg = p.legende || ["au microscope : baguettes de feldspath", "alignées par l'écoulement"];
        s += txt(CXL - 16, CYL + RL + 18, lg[0], { a: "middle", petit: true }) + txt(CXL - 16, CYL + RL + 29, lg[1], { a: "middle", petit: true });
        const T = lerp(p.tDebut ?? 800, 40, e);
        s += thermometre(310, 64, 92, T, 0, 1000, [200, 500, 800]);
        s += txt(310, 54, `${nombre(T)} °C`, { a: "middle", petit: true });
        s += txt(XV, SOL + 18, p.debit === "dalles" ? "en refroidissant, la lave se débite en dalles" : "des prismes poussent de la surface vers le cœur", { a: "middle", petit: true });
        s += compteur(160, 14, 0, { libelle: t > 0.88 ? "aujourd'hui" : (p.libelleAge || "il y a ≈ 11 000 ans") });
        return s;
      },
    };
  };

  // stratovolcan à l'ÉCHELLE VRAIE (15 px par km en largeur, hauteurs × 2) : construction COULÉE PAR COULÉE, puis
  // effondrement d'un flanc (avalanche de débris), puis érosion en vallées. T global 0 → 1 : 0–⅓ construction,
  // ⅓–⅔ effondrement, ⅔–1 érosion (Cantal : Nehlig et al. 2001).
  // 24/09/2026 (ses retours) : « mettre une coulée de lave à chaque fois qu'on rajoute une couche » → chaque lit naît d'une
  // coulée qui sort du cratère et descend les flancs, incandescente, puis refroidit à la couleur du lit ; « refaire
  // l'animation de l'effondrement » → le flanc se fissure le long d'une surface courbe, glisse d'un bloc (ses lits visibles)
  // en accélérant, se disloque en paquets qui s'étalent en buttes, et laisse une cicatrice en fer à cheval.
  function stratovolcan(p, T0, T1) {
    const R = alea("sv" + p.graine);
    const BASE = 196, XC = 196, PXKM = 15, VEX = 2;
    const HM = (p.hauteurKm || 3) * PXKM * VEX, RM = (p.rayonKm || 12.5) * PXKM, N = 12;
    const prof = (g, x) => { if (g <= 0) return BASE; const h = HM * g, r = Math.max(10, RM * Math.pow(g, 0.8)), u = Math.abs(x - XC) / r; return u >= 1 ? BASE : BASE - h * Math.pow(1 - u, 1.55); };
    const rayon = (g) => Math.max(10, RM * Math.pow(g, 0.8));
    const xs = Array.from({ length: 121 }, (_, i) => i * 4);
    const cLit = (i) => (i % 3 === 1 ? "#b9a98e" : i % 3 === 2 ? "#7b7470" : "#625c58");
    // construction : lit i (1…N) = coulée entre T = debut(i) et debut(i) + DC
    const DC = 0.29 / N, debut = (i) => 0.01 + (i - 1) * DC;
    // surface de glissement : part juste à gauche du sommet (le sommet s'en va), courbe, ressort au pied droit
    const XS = XC - 22, XE = XC + RM * 0.97, HS = BASE - prof(1, XS);
    const glisse = (x) => x <= XS ? prof(1, x) : x >= XE ? BASE : Math.max(prof(1, x), BASE - HS * Math.pow(1 - (x - XS) / (XE - XS), 3.2));
    // effondrement refait (24/09/2026, brèche volcanique : « on voit les débris partir comme sur un tapis glissant ») : le
    // flanc ne glisse d'un bloc que sur quelques dizaines de mètres, se fissure puis se disloque ; la masse devient une
    // AVALANCHE — une nappe turbulente qui dévale, s'étale, s'amincit derrière son front — où chaque bloc a sa propre
    // trajectoire (vitesse, rebonds, roulement) ; les plus gros finissent en buttes (hummocks).
    const flanc = []; for (let x = XS; x <= XE; x += 3) flanc.push([x, prof(1, x)]);
    for (let x = XE; x >= XS; x -= 3) flanc.push([x, glisse(x)]);
    const idFlanc = nid("svf");
    const debris = Array.from({ length: 90 }, () => {
      let x0, y0;
      do { x0 = XS + R() * (XE - XS); y0 = prof(1, x0) + R() * (glisse(x0) - prof(1, x0)); } while (glisse(x0) - prof(1, x0) < 2);
      const loin = Math.pow(R(), 0.7), xf = XE - 10 + loin * (W + 20 - XE) + (x0 - XS) * 0.15;
      return { x0, y0, xf, r: 1.4 + R() * (loin < 0.5 ? 4.2 : 2.6), d: R() * 0.14 + (1 - (x0 - XS) / (XE - XS)) * 0.08, rot: R() * 180,
        ph: R() * 6, c: cLit(Math.floor(R() * 3)), k: 4 + Math.floor(R() * 3), f: R() };
    });
    const buttes = debris.filter((m) => m.r > 3.4).map((m) => m.xf).sort((a, b) => a - b);
    const depot = (x, k) => { if (x < XE - 22) return 0; let h = 2.2 * clamp((x - XE + 22) / 22) * clamp((W + 40 - x) / 60 + 0.4); for (const xb of buttes) h += 2.4 * Math.max(0, 1 - Math.abs(x - xb) / 6); return Math.min(h, 7) * k; };
    const solAv = (x, k) => x < XE ? glisse(x) : BASE - depot(x, k);          // sol sous l'avalanche
    const clipE = nid("se"), clipC = nid("sc");
    // l'édifice complet, lit par lit (pour les tranches qui glissent)
    let couches = "";
    for (let i = N; i >= 1; i--) couches += poly(xs.map((x) => [x, prof(i / N, x)]).concat([[W, BASE + 1], [0, BASE + 1]]), cLit(i));
    const defs = `<clipPath id="${idFlanc}"><polygon points="${P(flanc)}"/></clipPath>`;
    return {
      fond: ciel(BASE) + rect(0, BASE, W, H - BASE, "#c8b894") + line(0, BASE, W, BASE, "#8d7b5e", 1.2)
        + txt(W - 8, H - 8, p.socle || "socle", { a: "end", petit: true }) + `<defs>${defs}</defs>`,
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        const f = clamp((T - 0.34) / 0.33);                             // avancement de l'effondrement (0–1)
        const fis = fen(f, 0.02, 0.18), a = Math.pow(clamp((f - 0.2) / 0.36), 1.6), dis = fen(f, 0.46, 0.62), pose = fen(f, 0.55, 0.92);
        const er = fen(T, 0.7, 0.98), glisseOn = f > 0.2 || T > 0.67;
        // ── construction : lits achevés + coulée en cours ──
        let cur = N + 1;
        if (T < 0.33) { cur = 1; while (cur <= N && T >= debut(cur) + DC) cur++; }
        const g = cur > N ? 1 : (cur - 1 + fen(T, debut(cur), debut(cur) + DC * 0.85)) / N;
        const surf = (x) => {
          let y = cur > N ? (glisseOn ? glisse(x) : prof(1, x)) : prof((cur - 1) / N, x);
          if (er > 0) {
            const bas = BASE - (BASE - y) * lerp(1, 0.6, er);
            let v = 0;
            for (const [xv, pr] of [[XC - 80, 1], [XC - 10, 0.75], [XC + 70, 0.7]]) v = Math.max(v, pr * HM * 0.5 * er * Math.max(0, 1 - Math.abs(x - xv) / 26) ** 1.2);
            y = Math.max(y, Math.min(BASE, bas + v));
          }
          return y;
        };
        const S = xs.map((x) => [x, surf(x)]);
        let s = `<clipPath id="${clipE}"><polygon points="${P(S.concat([[W, BASE + 1], [0, BASE + 1]]))}"/></clipPath><g clip-path="url(#${clipE})">`;
        for (let i = Math.min(N, cur - 1); i >= 1; i--) {
          const froid = cur > N ? 1 : fen(T, debut(i) + DC * 0.8, debut(i) + DC * 2.2);
          s += poly(xs.map((x) => [x, prof(i / N, x)]).concat([[W, BASE + 1], [0, BASE + 1]]), melange(MAGMA, cLit(i), froid));
        }
        s += `</g>`;
        if (cur <= N) {
          // la coulée en cours : elle sort du cratère et descend les deux flancs, front arrondi, incandescente
          const gi = fen(T, debut(cur), debut(cur) + DC * 0.85), r = rayon(cur / N), fr = gi * r;
          const lo = (cur - 1) / N, hi = cur / N, haut = [], bas = [];
          for (let k = 0; k <= 60; k++) { const x = XC - fr + k * fr / 30, q = clamp((fr - Math.abs(x - XC)) / 9); haut.push([x, lerp(prof(lo, x), prof(hi, x), Math.sqrt(q))]); bas.push([x, prof(lo, x)]); }
          if (fr > 1) s += poly(haut.concat(bas.reverse()), MAGMA, { stroke: "#9b2d14", "stroke-width": 0.6 });
          const top = prof(lo, XC);
          if (gi < 0.35) s += ell(XC, top - 2, 3.5, 4 + 3 * Math.sin(ta * 9) ** 2, "#f7b04a", { opacity: 0.85 });
          if (cur % 3 === 2 && gi < 0.5) for (let k = 0; k < 6; k++) { const u = (ta * 0.4 + k / 6) % 1; s += circ(XC + Math.sin(u * 4 + k) * 8, top - 8 - u * 60, 5 + u * 12, "#8b8580", { opacity: op(0.45 * (1 - u) * (1 - gi * 2)) }); }
          s += txt(XC, 30, `coulée n° ${cur} : elle sort du cratère et recouvre le volcan d'un nouveau lit`, { a: "middle", petit: true, op: fen(gi, 0, 0.1) * (1 - fen(gi, 0.92, 1)) });
        }
        s += pline(S, er > 0.5 ? "#6f9d4f" : "#5a4e45", 1.3);
        // ── effondrement ──
        if (T > 0.34 && T <= 0.67 + 1e-9 || (T > 0.67 && pose > 0)) {
          // fissure qui s'ouvre le long de la future surface de glissement
          if (fis > 0 && a <= 0) { const l = []; for (let x = XS; x <= XE; x += 4) l.push([x, glisse(x)]); s += pline(l, "#3b2a20", 1.3, { "stroke-dasharray": "4 3", opacity: op(fis) }); }
          // 1) le flanc glisse d'un bloc sur une courte distance et se fissure (0,18–0,36)
          const gl = fen(f, 0.18, 0.36), casse = fen(f, 0.35, 0.4);
          if (gl > 0 && casse < 1) {
            const dx = 16 * gl * gl, dy = 3 * gl * gl;
            let fis2 = "";
            for (let k = 1; k < 6; k++) { const x = lerp(XS, XE, k / 6); fis2 += line(x + 3, prof(1, x) + 1, x - 4, glisse(x) - 1, "#2a1f19", 0.9, { opacity: op(fen(gl, 0.3 + k * 0.08, 0.6 + k * 0.08)) }); }
            s += `<g opacity="${op(1 - casse)}" transform="translate(${r1(dx)} ${r1(dy)}) rotate(${r1(-2 * gl)} ${r1(XE)} ${BASE})"><g clip-path="url(#${idFlanc})">${couches}${fis2}</g>`
              + `<polygon points="${P(flanc)}" fill="none" stroke="#3b2a20" stroke-width=".8"/></g>`;
          }
          if (gl > 0 && T <= 0.67) { const l = []; for (let x = XS; x <= XE; x += 4) l.push([x, glisse(x)]); s += pline(l, "#3b2a20", 1.1); }
          // 2) dépôt d'avalanche : il s'épaissit derrière le front
          const front = lerp(XE - 20, W + 40, 1 - Math.pow(1 - fen(f, 0.32, 0.86), 2.2));
          if (pose > 0 || (f > 0.4 && T <= 0.67)) {
            const k = Math.max(pose, 0.25 * fen(f, 0.4, 0.55)) * (T > 0.67 ? lerp(1, 0.55, er) : 1), l = [];
            for (let x = XE - 24; x <= Math.min(W + 4, T > 0.67 ? W + 4 : front); x += 3) l.push([x, BASE - depot(x, k)]);
            if (l.length > 1) s += poly(l.concat([[l[l.length - 1][0], BASE + 1], [XE - 24, BASE + 1]]), "#8f806c") + pline(l, "#5a4e45", 0.8);
          }
          // 3) l'avalanche : nappe turbulente (tête épaisse, queue mince) + blocs, chacun sa trajectoire
          if (T <= 0.67 && f > 0.3 && f < 0.97) {
            const ep = 13 * fen(f, 0.3, 0.42) * (1 - fen(f, 0.78, 0.95)), arr = lerp(XS + 10, XE - 10, fen(f, 0.34, 0.8));
            if (ep > 0.3 && front > arr) {
              const haut = [], bas = [];
              for (let x = arr; x <= front; x += 3) { const u = (x - arr) / Math.max(1, front - arr), e = ep * (0.25 + 0.75 * Math.pow(u, 0.6)) * Math.min(1, (front - x) / 10 + 0.15) + 1.2 * Math.sin(x / 5 + ta * 4); haut.push([x, solAv(x, pose) - Math.max(0, e)]); bas.push([x, solAv(x, pose) + 0.5]); }
              s += poly(haut.concat(bas.reverse()), "#7d6f5f", { opacity: 0.85 });
            }
            for (const m of debris) {
              const u = fen(f, 0.33 + m.d, 0.8 + m.d * 0.6);
              if (u <= 0 || u >= 1) continue;
              const v = 1 - Math.pow(1 - u, 2.2), x = lerp(m.x0, Math.min(m.xf, front), v);
              const sol = solAv(x, pose), hop = Math.abs(Math.sin(u * Math.PI * (3 + m.k) + m.ph)) * m.r * 1.6 * (1 - u);
              const y = Math.min(lerp(m.y0, sol - m.r, fen(u, 0, 0.18)), sol - m.r) - hop;
              const ang = m.rot + (x - m.x0) / m.r * 45;
              const pts = Array.from({ length: m.k }, (_, i) => { const a = (i / m.k) * 6.283 + ang * 0.0175, rr = m.r * (0.75 + 0.35 * ((i * 7 + m.k) % 3) / 2); return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]; });
              s += poly(pts, m.c, { stroke: "rgba(30,25,20,.5)", "stroke-width": 0.5 });
            }
          }
          // 4) nuage de poussière qui roule au-dessus de l'avalanche
          const nu = fen(f, 0.32, 0.46) * (1 - fen(f, 0.8, 0.97));
          if (nu > 0 && T <= 0.67) for (let k = 0; k < 11; k++) {
            const x = lerp(XC + 20, front, k / 10), w = (ta * 0.4 + k * 0.37) % 1;
            s += circ(x + Math.sin(ta + k) * 3, solAv(x, pose) - 12 - w * 18 - (k % 3) * 4, 7 + w * 9 + (k % 3) * 2, "#b7ab98", { opacity: op(0.38 * nu * (1 - w * 0.7)) });
          }
        }
        // ── érosion : pluie, végétation (la pluie continue à la fin : l'érosion n'est pas finie) ──
        if (er > 0) {
          s += `<g opacity="${op(fen(T, 0.7, 0.76) * (1 - 0.4 * fen(T, 0.95, 1)))}">${nuage(120 + 1.6 * ta, 30, 0.9) + nuage(330 + 1.2 * ta, 24, 0.8) + pluie(98 + 1.6 * ta, 38, 48, 80, ta, 10, "sv1") + pluie(310 + 1.2 * ta, 32, 44, 80, ta, 10, "sv2")}</g>`;
          const v = fen(T, 0.9, 0.98);
          if (v > 0) for (let x = 12; x < W; x += 23) s += `<g opacity="${op(v)}">${rect(x - 0.6, surf(x) - 4, 1.2, 4, "#6b4f35")}${ell(x, surf(x) - 6.5, 2.6, 3.4, "#4f7d3c")}</g>`;
        }
        // ── étiquettes et cotes ──
        if (T <= 0.34) {
          const c = fen(T, 0.3, 0.335);
          s += `<g opacity="${op(c)}">${line(XC - RM, BASE + 12, XC + RM, BASE + 12, "#27302d", 1) + line(XC - RM, BASE + 9, XC - RM, BASE + 15, "#27302d", 1) + line(XC + RM, BASE + 9, XC + RM, BASE + 15, "#27302d", 1)}</g>`
            + txt(XC, BASE + 25, `${nombre(2 * (p.rayonKm || 12.5))} km`, { a: "middle", petit: true, op: c })
            + txt(XC + 14, BASE - HM * g - 4, `${nombre((p.hauteurKm || 3) * 1000)} m (hauteurs × 2)`, { petit: true, op: c })
            + txt(XC + RM * 0.55, BASE - HM * 0.5, "12 coulées = 12 lits", { petit: true, op: c });
        }
        if (T > 0.34 && T <= 0.67) {
          s += txt(XC + 40, 30, "trop haut et trop raide, le flanc se fissure…", { a: "middle", petit: true, op: fen(f, 0.02, 0.08) * (1 - fen(f, 0.16, 0.2)) });
          s += txt(XC + 40, 30, "… glisse, se brise et dévale en avalanche de débris", { a: "middle", petit: true, op: fen(f, 0.21, 0.27) * (1 - fen(f, 0.6, 0.66)) });
          s += txt(W - 8, BASE - 26, "avalanche de débris : des buttes", { a: "end", petit: true, op: fen(f, 0.7, 0.8) });
          s += fleche(W - 60, BASE + 14, W - 8, BASE + 14, { sw: 1.4, pointe: 6, op: fen(f, 0.75, 0.85) }) + txt(W - 64, BASE + 17, "et plus loin encore : des dizaines de km", { a: "end", petit: true, op: fen(f, 0.75, 0.85) });
          s += txt(XS - 6, BASE - HS - 6, "cicatrice en fer à cheval", { a: "end", petit: true, op: fen(f, 0.62, 0.72) });
        }
        if (T > 0.67) {
          s += txt(XC, 14, "rivières puis glaciers creusent des vallées en étoile", { a: "middle", op: fen(T, 0.72, 0.78) * (1 - fen(T, 0.92, 0.96)) });
          s += txt(XC - 80, surf(XC - 80) - 16, "vallée", { a: "middle", petit: true, op: fen(T, 0.85, 0.92) });
          let im = 0; S.forEach(([x, y], i) => { if (x > 40 && x < 360 && y < S[im][1]) im = i; });
          s += txt(S[im][0], S[im][1] - 14, p.creteNom || "crête (puy Mary)", { a: "middle", petit: true, op: fen(T, 0.9, 0.97) });
        }
        const age = p.ages ? (T < 0.33 ? lerp(p.ages[0], p.ages[1], T / 0.33) : T <= 0.67 ? p.ages[1] : lerp(p.ages[1], 0, (T - 0.67) / 0.31)) : 0;
        s += compteur(404, 14, Math.max(0, age));
        return s;
      },
    };
  }
  SCENES.stratovolcanConstruction = (p) => stratovolcan(p, 0, 0.34);
  SCENES.stratovolcanEffondrement = (p) => stratovolcan(p, 0.34, 0.67);
  SCENES.stratovolcanErosion = (p) => stratovolcan(p, 0.67, 1);

  // ── dégagement d'une COULÉE (24/09/2026, « faire plus de lien entre la diapo 4 et 5 ») : on repart de la coulée posée sur
  // son sol (la coupe de l'étape d'avant, vue de plus loin), d'autres couches l'ENFOUISSENT lit par lit, puis l'érosion
  // enlève les roches tendres ; la coulée, dure, protège ce qu'il y a dessous : elle finit en table (relief inversé).
  const CO = { G0: 128, XA: 36, XB: 444, EP: 20 };
  const coTop = (x) => CO.G0 - CO.EP * clamp(Math.min((x - CO.XA) / 12, (CO.XB - x) / 16) + 0.25);
  function couleeCoupe(x0, x1, top, bas, o = {}) {        // la coulée dessinée comme à l'étape du refroidissement
    const pts = []; for (let x = x0; x <= x1; x += 3) pts.push([x, top(x)]);
    pts.push([x1, top(x1)]);
    const corps = pts.concat([[x1, bas], [x0, bas]]);
    let s = poly(corps, o.coeur || "#6d3a2b");
    const ep = (x) => (bas - top(x)) * 0.26;
    s += poly(pts.concat(pts.slice().reverse().map(([x, y]) => [x, y + ep(x)])), "#2f2b28");
    s += poly(pts.map(([x]) => [x, bas]).concat(pts.slice().reverse().map(([x]) => [x, bas - ep(x)])), "#2f2b28");
    for (let x = x0 + 6; x < x1 - 4; x += o.pas || 7) s += line(x, top(x) + 0.6, x, bas - 0.6, "rgba(15,13,12,.55)", 0.8);
    return s;
  }
  function degagementCoulee(p) {
    const C = p.couches || [["#c79a82", "grès rouges permiens"], ["#a97a64", "grès et pélites"], ["#8c6a58", ""]];
    const clipS = nid("dcs"), A = p.ages || [285, 0], A1 = p.ageEnfoui ?? A[0] - 35;
    return {
      fond: ciel(H),
      anim(t, ta) {
        const b = fen(t, 0.03, 0.3), e = fen(t, 0.34, 0.95);
        const NL = 5, EPL = 9, haut = CO.G0 - NL * EPL;                 // 5 lits de 9 px par-dessus la coulée
        const Ls = lerp(haut, 188, e), fa = CO.XA + 34 * e, fb = CO.XB - 52 * e;
        const surf = (x) => {
          if (e <= 0) { let n = 0; for (let k = 0; k < NL; k++) n += fen(b, k / NL, (k + 1) / NL); const Lb = CO.G0 - n * EPL; return x > CO.XA && x < CO.XB ? Math.min(Lb, coTop(x)) : Lb; }
          if (x >= fa && x <= fb) return Math.min(Ls, coTop(x));
          const d = x < fa ? fa - x : x - fb;
          return Math.min(Ls, CO.G0 + 2 + d * 1.15 + 3 * Math.sin(x / 19));
        };
        const S = []; for (let x = 0; x <= W; x += 3) S.push([x, surf(x)]);
        let s = `<clipPath id="${clipS}"><polygon points="${P(S.concat([[W, H + 5], [0, H + 5]]))}"/></clipPath><g clip-path="url(#${clipS})">`;
        s += rect(0, CO.G0, W, 50, C[1][0]) + rect(0, CO.G0 + 50, W, H, C[2][0]);
        for (let y = CO.G0 + 9; y < H; y += 12) s += line(0, y, W, y + 2, "rgba(60,45,30,.14)", 1);
        for (let k = 0; k < NL; k++) { const q = fen(b, k / NL, (k + 1) / NL); if (q > 0) s += rect(0, CO.G0 - (k + q) * EPL, W, q * EPL + 0.5, k % 2 ? melange(C[0][0], "#ffffff", 0.12) : C[0][0]); }
        s += couleeCoupe(fa, fb, coTop, CO.G0);
        s += `</g>` + pline(S, e > 0.6 ? "#6f9d4f" : "#7d7466", 1.4);
        // ambiance : pluie pendant l'érosion, végétation à la fin
        const pl = fen(t, 0.36, 0.44) * (1 - 0.45 * fen(t, 0.9, 1));
        if (pl > 0) s += `<g opacity="${op(pl)}">${pluie(88 + 1.6 * ta, 30, 50, 50, ta, 10, "dc1") + pluie(328 + 1.2 * ta, 26, 46, 50, ta, 10, "dc2")}${nuage(110 + 1.6 * ta, 22, 0.9) + nuage(350 + 1.2 * ta, 18, 0.8)}</g>`;
        const v = fen(t, 0.86, 0.97);
        if (v > 0) s += vegetation(surf, 4, W - 4, alea("dcv" + p.graine), { op: v, pas: 21 });
        // textes
        s += txt(240, 14, t < 0.3 ? "d'autres couches recouvrent la coulée, lit par lit" : t < 0.7 ? "l'érosion enlève d'abord les roches tendres" : "la coulée, dure, protège les grès dessous : elle reste en table", { a: "middle" });
        if (t < 0.3) s += txt(CO.XA + 6, CO.G0 + 16, "la coulée (même coupe qu'avant), sur les grès", { petit: true, clair: true, op: 1 - fen(t, 0.2, 0.3) });
        if (b > 0.3 && e < 0.5) s += txt(12, Math.min(CO.G0 - 4, Ls + 16), C[0][1], { petit: true, clair: true, op: fen(b, 0.3, 0.5) });
        if (e > 0.5) s += txt(240, coTop(240) - 10, p.nom || "la coulée reste en relief", { a: "middle", op: fen(t, 0.6, 0.7) });
        const age = t < 0.3 ? lerp(A[0], A1, t / 0.3) : lerp(A1, A[1], (t - 0.3) / 0.7);
        s += compteur(412, 30, age, { libelle: t > 0.95 && p.libelleFin ? p.libelleFin : undefined });
        return s;
      },
    };
  }

  // ── dégagement d'un DÔME (24/09/2026, phonolite : « on n'a pas la même forme entre la diapo 4 et 5 ») : on repart EXACTEMENT
  // du dôme de l'étape du refroidissement (même place, même taille, mêmes dalles ou prismes), posé sur des scories et des
  // tufs, avec son conduit figé dessous. Les roches tendres autour s'en vont ; le dôme, attaqué par les flancs, s'effile en
  // « pain de sucre » (suc) et laisse un tablier d'éboulis ; le conduit (neck) apparaît sous lui.
  function degagementDome(p, roche) {
    const et = (Formation.animation(roche) || {}).etapes || [];
    const ref = et.find((E) => E.scene === "refroidissementDome"), pD = (et.find((E) => E.scene === "domeExtrusion") || {}).p || {};
    const q = Object.assign({ hauteur: pD.hauteur, demiLargeur: pD.demiLargeur }, (ref && ref.p) || {});
    const SOL = 176, XV = 148, HM = (q.hauteur || 76) * 0.85, WM = (q.demiLargeur || 146) * 0.85, dalles = q.debit === "dalles";
    const C = p.couches || [["#8a6a58", "scories et tufs"], ["#9c8a70", "vieux socle"], ["#8a7c66", ""]];
    const pointu = p.pointu ?? (p.forme === "suc" ? 1 : 0.35), roche0 = p.couleur || "#a9a094";
    const clipS = nid("dds"), clipD = nid("ddd");
    const LN = 12;                                                      // demi-largeur du conduit (neck)
    return {
      fond: ciel(H),
      anim(t, ta) {
        const e = fen(t, 0.05, 0.92), Ls = lerp(SOL, SOL + 34, e);          // les roches tendres s'abaissent de 34 px
        // le dôme s'use par les flancs : plus étroit, de moins en moins arrondi (suc), un peu moins haut
        const h = HM * lerp(1, 0.9, e) + (Ls - SOL), w = WM * lerp(1, 0.5 + 0.25 * (1 - pointu), e);
        const forme = (u) => lerp(Math.pow(Math.max(0, 1 - Math.abs(u) ** 2.4), 0.5), Math.pow(Math.max(0, 1 - Math.abs(u)), 1.15), e * pointu);
        const dome = (x) => { const u = (x - XV) / w; return Math.abs(u) >= 1 ? 999 : Ls - h * forme(u); };
        const eboulis = (x) => { const d = Math.abs(x - XV) - w * 0.55; return d < 0 ? 999 : Ls - 14 * e * Math.max(0, 1 - d / (40 + 30 * e)); };
        const surf = (x) => Math.min(Ls + 2.5 * Math.sin(x / 31) * e, dome(x), eboulis(x));
        const S = []; for (let x = 0; x <= W; x += 3) S.push([x, surf(x)]);
        const D = []; for (let x = XV - w; x <= XV + w; x += 2) D.push([x, Math.min(dome(x), Ls)]);
        let s = `<clipPath id="${clipS}"><polygon points="${P(S.concat([[W, H + 5], [0, H + 5]]))}"/></clipPath><g clip-path="url(#${clipS})">`;
        s += rect(0, 0, W, SOL + 40, C[0][0]) + rect(0, SOL + 40, W, H, C[1][0]);
        for (let y = SOL + 8; y < H; y += 11) s += line(0, y, W, y + 2, "rgba(60,45,30,.16)", 1);
        s += rect(XV - LN, SOL - 5, 2 * LN, H, roche0) + line(XV - LN, SOL, XV - LN, H, "#5f574c", 1) + line(XV + LN, SOL, XV + LN, H, "#5f574c", 1);
        // éboulis de dalles (tablier) au pied
        if (e > 0.05) { const Eb = []; for (let x = XV - w - 70; x <= XV + w + 70; x += 3) Eb.push([x, Math.min(eboulis(x), Ls + 1)]); s += poly(Eb.concat([[XV + w + 70, Ls + 2], [XV - w - 70, Ls + 2]]), melange(roche0, "#7d7466", 0.25)); }
        s += poly(D.concat([[XV + w, Ls + 1], [XV - w, Ls + 1]]), roche0, { stroke: "#5f574c", "stroke-width": 1 });
        s += `<clipPath id="${clipD}"><polygon points="${P(D.concat([[XV + w, Ls + 1], [XV - w, Ls + 1]]))}"/></clipPath><g clip-path="url(#${clipD})">`;
        if (dalles) for (let k = 1; k <= 9; k++) { const kk = 1 - k * 0.075; const l = []; for (let x = XV - WM * kk; x <= XV + WM * kk; x += 3) { const u = (x - XV) / (WM * kk); l.push([x, SOL - HM * kk * Math.pow(Math.max(0, 1 - Math.abs(u) ** 2.4), 0.5) + (Ls - SOL)]); } s += pline(l, "rgba(45,40,34,.45)", 0.9); }
        else { const P0 = profilDome(XV, Ls, HM, WM), Pk = profilDome(XV, Ls, HM, WM, 0.3); P0.forEach((a, i) => { if (i % 2 || i < 4 || i > 40) return; s += line(a[0], a[1], Pk[i][0], Pk[i][1], "rgba(45,40,34,.5)", 1); }); }
        s += `</g></g>`;
        s += pline(S, e > 0.6 ? "#6f9d4f" : "#7d7466", 1.4);
        const pl = fen(t, 0.08, 0.2) * (1 - 0.45 * fen(t, 0.9, 1));
        s += `<g opacity="${op(pl)}">${pluie(250 + 1.6 * ta, 30, 50, 60, ta, 10, "dd1") + pluie(360 + 1.2 * ta, 26, 46, 70, ta, 10, "dd2")}${nuage(270 + 1.6 * ta, 22, 0.9) + nuage(380 + 1.2 * ta, 18, 0.8)}</g>`;
        const v = fen(t, 0.85, 0.97);
        if (v > 0) s += vegetation(surf, 4, W - 4, alea("ddv" + p.graine), { op: v, pas: 20, pente: 0.9 });
        s += txt(250, 14, e < 0.55 ? (p.texte || "l'érosion enlève d'abord les roches tendres autour") : (p.texteFin || "plus dur, le dôme reste en relief"), { a: "middle" });
        if (e < 0.4) s += txt(300, SOL + 20, C[0][1], { petit: true, clair: true, op: 1 - fen(e, 0.3, 0.4) });
        if (t < 0.2) s += txt(XV + WM * 0.6 + 6, SOL - HM * 0.55, "le dôme de l'étape précédente", { petit: true, op: 1 - fen(t, 0.12, 0.2) });
        if (e > 0.3) s += txt(XV + LN + 4, Math.min(H - 8, Ls + 30), "son conduit, figé", { petit: true, clair: true, op: fen(e, 0.3, 0.45) });
        if (e > 0.5) s += txt(XV + w * 0.55 + 30, Ls - 18, "éboulis", { petit: true, op: fen(e, 0.5, 0.65) });
        s += txt(XV, Ls - h - 10, p.nom || "", { a: "middle", op: fen(t, 0.6, 0.7) });
        s += compteur(412, 30, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: t > 0.95 && p.libelleFin ? p.libelleFin : undefined });
        return s;
      },
    };
  }

  // l'érosion DÉGAGE une roche dure au milieu de roches tendres (18/09/2026) : suc de phonolite, dôme ou coulée ancienne,
  // cheminée volcanique, filon, intrusion. Les couches tendres s'abaissent, la roche dure reste en relief.
  // p : forme ("dome" | "cheminee" | "coulee" | "filon"), nom, couleur, couches [[couleur, nom]…], ages [début, fin],
  //     libelleFin, texte, texteFin
  SCENES.degagement = function (p, roche) {
    const R = alea("dg" + p.graine);
    const forme = p.forme || "dome", XC = 240, BAS = H + 10;
    if (forme === "coulee") return degagementCoulee(p);
    if (forme === "filon" && roche && ((Formation.animation(roche) || {}).etapes || []).some((E) => E.scene === "injectionFilon")) return degagementFilon(p, roche);
    if ((forme === "dome" || forme === "suc") && roche && ((Formation.animation(roche) || {}).etapes || []).some((E) => E.scene === "refroidissementDome")) return degagementDome(p, roche);
    const couleur = p.couleur || "#bdb2a2", couches = p.couches || [["#b49a78", "cendres et scories"], ["#9c8a70", "roches tendres"], ["#8a7c66", ""]];
    const S0 = 58, S1 = 150;                                   // surface avant / après érosion
    // le corps dur : contour (en coupe) posé dans les couches
    const corps = forme === "cheminee" ? [[XC - 22, BAS], [XC - 20, 120], [XC - 30, 70], [XC - 18, 52], [XC + 18, 52], [XC + 30, 70], [XC + 20, 120], [XC + 22, BAS]]
      : forme === "filon" ? [[XC - 9, BAS], [XC - 9, 52], [XC + 9, 52], [XC + 9, BAS]]
      : forme === "coulee" ? [[40, 96], [440, 92], [440, 112], [40, 116]]
      : forme === "suc" ? [[XC - 30, BAS], [XC - 34, 150], [XC - 88, 150], [XC - 44, 96], [XC - 14, 62], [XC, 56], [XC + 16, 64], [XC + 46, 98], [XC + 86, 150], [XC + 34, 150], [XC + 30, BAS]]
      : profilDome(XC, 150, 92, 120).concat([[XC + 16, BAS], [XC - 16, BAS]]);
    const dur = forme === "coulee" ? 0.8 : forme === "suc" ? 0.12 : 1;
    const arbres = Array.from({ length: 12 }, () => 12 + R() * 456);
    const clipS = nid("dgs"), clipC = nid("dgc");
    return {
      fond: ciel(H),
      anim(t, ta) {
        const e = fen(t, 0.05, 0.9);
        const Lv = lerp(S0, S1, e);
        // surface : tendre partout, sauf là où la roche dure dépasse (elle s'use moins vite)
        const dansCorps = (x, y) => { let c = false; for (let i = 0, j = corps.length - 1; i < corps.length; j = i++) { const [xi, yi] = corps[i], [xj, yj] = corps[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
        const surf = [];
        for (let x = 0; x <= W; x += 4) {
          let y = Lv + 3 * Math.sin(x / 37 + 1);
          let yt = S0; while (yt < H && !dansCorps(x, yt)) yt += 2;
          if (yt < H) y = Math.min(y, Math.max(yt, lerp(S0, S0 + (S1 - S0) * 0.25 * dur, e)));
          surf.push([x, y]);
        }
        for (let it = 0; it < 2; it++) surf.forEach((q, i) => { if (i && i < surf.length - 1) q[1] = (surf[i - 1][1] + q[1] * 2 + surf[i + 1][1]) / 4; });
        let s = `<clipPath id="${clipS}"><polygon points="${P(surf.concat([[W, H], [0, H]]))}"/></clipPath><g clip-path="url(#${clipS})">`;
        couches.forEach(([c], i) => { s += rect(0, S0 + i * 42, W, i === couches.length - 1 ? H : 42, c); });
        for (let y = S0 + 10; y < H; y += 14) s += line(0, y, W, y + 2, "rgba(60,45,30,.14)", 1);
        s += poly(corps, couleur, { stroke: "#5f574c", "stroke-width": 1.2 });
        s += `<clipPath id="${clipC}"><polygon points="${P(corps)}"/></clipPath><g clip-path="url(#${clipC})">`;
        if (p.dalles) for (let k = 1; k < 9; k++) s += pline(profilDome(XC, 150, 92 * (1 - k * 0.1), 120 * (1 - k * 0.1)), "rgba(60,55,45,.4)", 0.9);
        else for (let x = XC - 130; x < XC + 130; x += 9) s += line(x, 40, x + (x - XC) * 0.08, BAS, "rgba(60,55,45,.3)", 0.9);
        s += `</g></g>`;
        s += pline(surf, e > 0.6 ? "#6f9d4f" : "#7d7466", 1.6);
        const pl = fen(t, 0.08, 0.2) * (1 - 0.45 * fen(t, 0.9, 1));
        const clipK = nid("dgk");
        s += `<clipPath id="${clipK}"><polygon points="${P(surf.concat([[W, -5], [0, -5]]))}"/></clipPath>`
          + `<g opacity="${op(pl)}"><g clip-path="url(#${clipK})">${pluie(88 + 1.6 * ta, 30, 50, Math.max(8, Lv - 36), ta, 10, "dg1") + pluie(328 + 1.2 * ta, 26, 46, Math.max(8, Lv - 32), ta, 10, "dg2")}</g>${nuage(110 + 1.6 * ta, 22, 0.9) + nuage(350 + 1.2 * ta, 18, 0.8)}</g>`;
        const v = fen(t, 0.85, 0.97);
        if (v > 0) for (const x of arbres) { const y = hauteur(surf, x); s += `<g opacity="${op(v)}">${rect(x - 0.7, y - 5, 1.4, 5, "#6b4f35")}${ell(x, y - 8, 3.2, 4.2, "#4f7d3c")}</g>`; }
        let im = 0; surf.forEach((q, i) => { if (q[1] < surf[im][1]) im = i; });
        s += txt(clamp(surf[im][0], 60, 420), surf[im][1] - 14, p.nom || "la roche dure reste en relief", { a: "middle", op: fen(t, 0.5, 0.65) });
        if (couches[0][1]) s += txt(12, Math.min(H - 8, Math.max(Lv + 16, S0 + 16)), couches[Math.min(couches.length - 1, Math.floor((Lv - S0 + 16) / 42))][1] || "", { petit: true, clair: true });
        s += txt(200, 14, e < 0.6 ? (p.texte || "l'érosion enlève d'abord les roches tendres") : (p.texteFin || "la roche dure reste en relief"), { a: "middle" });
        const age = p.ages ? lerp(p.ages[0], p.ages[1], t) : 0;
        s += compteur(412, 14, age, { libelle: t > 0.95 && p.libelleFin ? p.libelleFin : undefined });
        return s;
      },
    };
  };

  // dorsale océanique (18/09/2026) — ÉCHELLE VRAIE 6 px par km, 80 km de large : le manteau remonte et fond, une chambre
  // magmatique fine sous l'axe, la croûte océanique naît (gabbros, filons, basaltes en coussins) et S'ÉCARTE des deux
  // côtés (les filons verticaux avancent avec elle) ; fumeurs noirs à l'axe ; boues qui s'épaississent loin de l'axe.
  // p : suivi ("basalte" | "filons" | "gabbro" | "sediments" | "manteau"), vitesse (texte), ages, libelleAge, nom (océan)
  SCENES.dorsale = function (p) {
    if (p.lente) return dorsaleLente(p);                                              // dorsale lente : vue d'ensemble refaite le 23/09/2026
    const R = alea("do" + p.graine);
    const PX = 6, MER = 26, XA = 240, Y = (z) => MER + z * PX;
    const fond = (x) => 2.6 + 1.1 * Math.sqrt(Math.abs(x - XA) / 240);             // profondeur du plancher (km), plus bas loin de l'axe
    const EC = 60;                                                                 // écartement pendant l'étape (px de chaque côté)
    // gouttes de liquide nées dans la zone de fusion (triangle sous l'axe) : elles grossissent en se rejoignant, convergent
    // vers l'axe puis montent par un chenal jusqu'à la chambre (demande du 23/09/2026 : « mieux représenter les bulles »)
    const zSommet = p.lente ? 20 : 14;
    const gouttes = Array.from({ length: 34 }, () => { const v = Math.sqrt(R()), u = R() - 0.5; return { x0: XA + u * 2 * 140 * v, y0: lerp(Y(zSommet) + 6, H + 6, v), ph: R(), r: 1.3 + R() * 0.6 }; });
    const dykes = Array.from({ length: 40 }, (_, i) => ({ x: (i + 0.5) * 6, j: R() }));
    const cous = Array.from({ length: 50 }, (_, i) => ({ x: (i + 0.5) * 5, r: 1.6 + R() }));
    const suivi = p.suivi || "basalte";
    const lente = !!p.lente;                                                        // dorsale lente (océan alpin) : manteau presque à nu
    const nSuivi = (lente ? { basalte: 0.25, gabbro: 2.2, sediments: -0.15, manteau: 1.4 } : { basalte: 0.4, filons: 1.5, gabbro: 4.5, sediments: -0.15, manteau: 9 })[suivi];
    const lentilles = Array.from({ length: 7 }, (_, i) => ({ x: 20 + i * 34 + R() * 10, z: 1.6 + R() * 1.4, rx: 10 + R() * 8 }));
    const fractures = Array.from({ length: 6 }, (_, i) => ({ dx: -46 + i * 18 + R() * 6, l: 3.5 + R() * 3, j: R() * 6 - 3 }));
    const clipS = nid("dos");
    return {
      fond: ciel(MER) + rect(0, MER, W, H - MER, "#4f84ad") + txt(12, MER + 10, p.nom || "océan", { petit: true, clair: true }),
      anim(t, ta) {
        // l'écartement suit le temps écoulé (ta), pas la progression : il continue pendant l'arrêt sur image (demande du
        // 23/09/2026 : « laisser tourner l'animation de la dorsale qui part à droite et à gauche »)
        const e = clamp((t - 0.02) / 0.93), dx = EC * Math.max(0, ta - 0.24) / 11.16;
        const surf = []; for (let x = 0; x <= W; x += 4) surf.push([x, Y(fond(x))]);
        const Y7 = (x) => Y(fond(x) + 7);
        let s = rect(0, 0, 0, 0, "none");
        // manteau, zone de fusion sous l'axe
        s += poly(surf.map(([x]) => [x, Y7(x)]).concat([[W, H], [0, H]]), "#9aa36f");
        // le manteau monte sous l'axe puis s'écarte sous les plaques (lignes d'écoulement qui défilent)
        for (const sg of [-1, 1]) {
          const lig = courbe([[XA + sg * 70, H + 4], [XA + sg * 48, Y(24)], [XA + sg * 80, Y(15)], [XA + sg * 200, Y(11)]], 6);
          s += pline(lig, "rgba(60,50,30,.35)", 1, { "stroke-dasharray": "5 4", "stroke-dashoffset": r1(-ta * 10) });
          const b = lig[lig.length - 1], a = lig[lig.length - 3];
          s += fleche(a[0], a[1], b[0], b[1], { c: "rgba(60,50,30,.5)", sw: 1, pointe: 5 });
        }
        // zone de fusion partielle : triangle sous l'axe, où le liquide naît entre les grains
        s += poly([[XA - 150, H + 8], [XA + 150, H + 8], [XA, Y(zSommet)]], MAGMA, { opacity: 0.14, stroke: MAGMA, "stroke-width": 0.8, "stroke-dasharray": "4 3" });
        s += txt(XA + 96, H - 8, "zone où le manteau fond", { a: "middle", petit: true });
        const yCh = Y(fond(XA) + (lente ? 3.2 : 2.6));
        s += line(XA, Y(zSommet), XA, yCh + 2, MAGMA, 1.4, { opacity: 0.5 });
        for (const g of gouttes) {
          const u = (g.ph + ta * 0.13) % 1;
          const [x, y] = u < 0.72 ? [lerp(g.x0, XA, lisse(u / 0.72)), lerp(g.y0, Y(zSommet), u / 0.72)] : [XA, lerp(Y(zSommet), yCh + 2, (u - 0.72) / 0.28)];
          const r = g.r * (1 + 0.7 * u), o = op(Math.min(1, u * 8, (1 - u) * 12));
          s += ell(x, y, r * 0.85, r * 1.15, MAGMA, { opacity: o }) + circ(x - r * 0.3, y - r * 0.35, r * 0.35, "#ffd08a", { opacity: op(o * 0.8) });
        }
        // croûte : gabbros (5 km), filons (1,5 km), coussins (0,5 km)
        const couche = (z0, z1, c) => poly(surf.map(([x]) => [x, Y(fond(x) + z0)]).concat(surf.slice().reverse().map(([x]) => [x, Y(fond(x) + z1)])), c);
        if (lente) {
          // le manteau (péridotite, serpentinisée près du fond) monte jusqu'au plancher ; le gabbro n'y forme que des lentilles
          s += couche(0, 7, "#9aa36f") + couche(0, 3, "rgba(95,130,80," + r1(p.eau ? 0.25 + 0.55 * fen(t, 0.25, 0.9) : 0.25) + ")");
          for (const l of lentilles) for (const sg of [-1, 1]) { const x = XA + sg * ((l.x + dx) % (W / 2 + 12)); if (Math.abs(x - XA) > 12) s += ell(x, Y(fond(x) + l.z), l.rx, 5, "#6f7a66"); }
          for (const c of cous) for (const sg of [-1, 1]) { const x = XA + sg * ((c.x + dx) % (W / 2 + 12)); if (Math.abs(x - XA) > 3 && Math.floor(c.x / 36) % 2 === 0) s += circ(x, Y(fond(x) + 0.25), c.r, "#2f3632", { stroke: "#56605a", "stroke-width": 0.5 }); }
        } else s += couche(0, 0.5, "#3e4743") + couche(0.5, 2, "#56605a") + couche(2, 7, "#6f7a66");
        // les filons avancent avec la plaque : de chaque côté, ils s'éloignent de l'axe
        if (!lente) s += `<clipPath id="${clipS}"><polygon points="${P(surf.map(([x]) => [x, Y(fond(x) + 0.5)]).concat(surf.slice().reverse().map(([x]) => [x, Y(fond(x) + 2)])))}"/></clipPath><g clip-path="url(#${clipS})">`;
        for (const k of dykes) for (const sg of [-1, 1]) { const x = XA + sg * ((k.x + dx) % (W / 2 + 12)); s += line(x, Y(fond(x) + 0.5), x, Y(fond(x) + 2), "rgba(30,35,32,.55)", 1); }
        if (!lente) s += `</g>`;
        if (!lente) for (const c of cous) for (const sg of [-1, 1]) { const x = XA + sg * ((c.x + dx) % (W / 2 + 12)); if (Math.abs(x - XA) > 3) s += circ(x, Y(fond(x) + 0.25), c.r, "#2f3632", { stroke: "#56605a", "stroke-width": 0.5 }); }
        if (!lente) for (let x = 8; x < W; x += 16) for (const sg of [-1, 1]) { const xx = XA + sg * ((Math.abs(x - XA) + dx) % (W / 2 + 12)); s += line(xx - 4, Y(fond(xx) + 4.5), xx + 4, Y(fond(xx) + 4.5), "rgba(40,50,35,.25)", 0.8); }
        // boues pélagiques : plus épaisses sur la croûte plus vieille (loin de l'axe)
        const sed = (x) => Math.min(0.9, Math.abs(x - XA) / 240 * (0.5 + e * 0.6));
        s += poly(surf.map(([x, y]) => [x, y - sed(x) * PX]).concat(surf.slice().reverse()), suivi === "sediments" ? "#cfc6ae" : "#b9b09a");
        for (let k = 0; k < 18; k++) { const u = (k / 18 + ta * 0.07) % 1, x = 20 + (k * 53) % 440; if (Math.abs(x - XA) > 30) s += circ(x, lerp(MER + 4, Y(fond(x)) - sed(x) * PX, u), 0.9, "#e8e2d2", { opacity: op(Math.sin(u * Math.PI) * 0.8) }); }
        // chambre magmatique sous l'axe, lave qui sort, fumeurs noirs
        // la chambre gonfle un peu à chaque arrivée ; un filon, à côté de l'axe, nourrit des coussins sur le fond
        const pouls = 1 + 0.08 * Math.sin(ta * 2.2);
        s += lente ? ell(XA, Y(fond(XA) + 3.2), 10 * pouls, 2.6 * pouls, MAGMA) + line(XA - 7, Y(fond(XA) + 3), XA - 7, Y(fond(XA - 7)), MAGMA, 1.4)
          : ell(XA, Y(fond(XA) + 2.6), 16 * pouls, 3.2 * pouls, MAGMA) + line(XA - 9, Y(fond(XA) + 2.3), XA - 9, Y(fond(XA - 9)), MAGMA, 2);
        // fumeur noir PILE sur l'axe, au-dessus de la chambre qui chauffe l'eau de mer (son retour du 23/09/2026 : il était
        // un peu à côté) ; ce n'est pas un volcan : l'eau descend par les fissures, chauffe et ressort chargée de sulfures noirs
        const yF = Y(fond(XA));
        s += poly([[XA - 2, yF + 0.5], [XA + 2, yF + 0.5], [XA + 1.2, yF - 7], [XA - 1.2, yF - 7]], "#3a3330");
        for (let k = 0; k < 5; k++) { const u = (ta * 0.4 + k / 5) % 1; s += circ(XA + Math.sin(u * 6) * 2, yF - 8 - u * 12, 1.4 + u * 2.6, "#2a2624", { opacity: op(0.7 * (1 - u)) }); }
        s += txt(XA + 8, MER + 8, "fumeur noir", { petit: true, clair: true });
        // la roche suivie : elle naît à l'axe et s'en éloigne à la vitesse de la plaque
        const xs = XA + 14 + dx, ys = Y(fond(xs) + nSuivi) - (suivi === "sediments" ? sed(xs) * PX * 0.5 : 0);
        // l'eau de mer s'infiltre par les fractures autour de la roche suivie, se réchauffe et ressort
        if (p.eau) for (const f of fractures) {
          const x0 = xs + f.dx, y0 = Y(fond(x0)), x1 = x0 + f.j, y1 = Y(fond(x0) + f.l);
          s += line(x0, y0, x1, y1, "rgba(20,30,40,.75)", 1.2);
          for (let k = 0; k < 4; k++) { const u = (ta * 0.22 + k / 4 + f.dx * 0.01) % 1; s += circ(lerp(x0, x1, u), lerp(y0, y1, u), 1.8, u < 0.6 ? "#7fc0e8" : "#e8a86a", { opacity: op(Math.sin(u * Math.PI) * fen(t, 0.04, 0.2)) }); }
        }
        if (lente && suivi === "gabbro") s += ell(xs, ys, 16, 5, "#6f7a66");
        s += circ(xs, ys, 4.2, "#c0392b", { stroke: "#fff", "stroke-width": 1.4 });
        // étiquettes
        s += txt(XA, MER - 6, "dorsale", { a: "middle", petit: true });
        if (lente) s += txt(W - 8, Y(fond(W)) - 5, "coussins de basalte, par endroits", { a: "end", petit: true, clair: true }) + txt(W - 8, Y(fond(W) + 5) + 3, "lentilles de gabbro", { a: "end", petit: true })
          + txt(W - 8, Y(fond(W) + 11) + 3, "manteau (péridotite)", { a: "end", petit: true });
        else s += txt(W - 8, Y(fond(W)) - 5, "basaltes en coussins", { a: "end", petit: true, clair: true }) + txt(W - 8, Y(fond(W) + 1.7) + 3, "filons", { a: "end", petit: true, clair: true })
          + txt(W - 8, Y(fond(W) + 4.5) + 3, "gabbros", { a: "end", petit: true, clair: true }) + txt(W - 8, Y(fond(W) + 14) + 3, "manteau", { a: "end", petit: true });
        s += txt(XA, Y(fond(XA) + (lente ? 16 : 11)), p.texte || (lente ? "le manteau remonte presque jusqu'au fond de l'océan" : "le manteau remonte et fond"), { a: "middle", petit: true });
        s += fleche(XA - 30, 12, XA - 70, 12, { sw: 2, pointe: 7 }) + fleche(XA + 30, 12, XA + 70, 12, { sw: 2, pointe: 7 }) + txt(XA + 76, 15, p.vitesse || (lente ? "≈ 1 cm par an de chaque côté" : "≈ 2 cm par an de chaque côté"), { petit: true });
        s += line(6, Y(0), 6, Y(30), "#27302d", 1); for (const z of [10, 20, 30]) s += line(3, Y(z), 6, Y(z), "#27302d", 1) + txt(9, Y(z) + 3, `${z} km`, { petit: true });
        s += compteur(70, 12, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // ───────────── filons (refaits le 24/09/2026) : UNE géométrie par roche, partagée par l'injection, le refroidissement
  // et l'érosion. Ses retours : l'injection doit « bien suivre les fissures » ; le filon érodé « on dirait un pilier » ;
  // « la diapo 4 à mettre en cohérence avec la diapo 2 ». La roche est déjà parcourue de fissures (deux familles
  // d'orientation) : le magma en choisit, les écarte et s'y engouffre, en marches d'escalier ; le filon réel fait 1 à 50 m,
  // il est dessiné plus large (écrit à l'écran). L'érosion enlève ensuite des kilomètres : le filon affleure en muraille
  // basse (quelques mètres), visible dans une loupe à l'échelle du paysage.
  function filonGeom(roche, p0) {
    const et = ((roche && Formation.animation(roche)) || {}).etapes || [];
    const p = Object.assign({}, (et.find((E) => E.scene === "injectionFilon") || {}).p || {}, p0 && p0.forme !== "filon" ? {} : {});
    const forme = p.forme || "dyke", enc = p.encaissant || "schistes", z = p.z || [1, 3];
    const Z0 = 40, zb = z[1] + 2, PXK = (H - Z0) / zb, Y = (z) => Z0 + z * PXK, XC = 230, SRC = H - 20;
    const R = alea("fil" + ((roche && roche.id) || p0.graine || ""));
    const pente = () => 3 / 480;                                        // litage des schistes : légère pente
    // fissures de la roche : deux familles (≈ +20° et ≈ −15° de la verticale), courtes, partout
    const fissures = [];
    for (let i = 0; i < 46; i++) { const x = R() * W, y = Z0 + 10 + R() * (H - Z0 - 14), a = (R() < 0.5 ? 0.35 : -0.26) + (R() - 0.5) * 0.12, l = 10 + R() * 22; fissures.push([[x, y], [x + Math.sin(a) * l, y - Math.cos(a) * l]]); }
    // chemin d'un filon : marches d'escalier le long des deux familles de fissures
    function chemin(x0, y0, y1, dx0 = 0) {
      const pts = [[x0, y0]];
      let x = x0, y = y0, k = R() < 0.5 ? 0 : 1;
      while (y > y1 + 1) { const l = Math.min(y - y1, 7 + R() * 20), a = (k ? 0.35 : -0.26) + dx0 + (R() - 0.5) * 0.1; x += Math.sin(a) * l; y -= Math.cos(a) * l; pts.push([x, y]); if (R() < 0.7) k = 1 - k; }
      return pts;
    }
    const veines = [];
    if (forme === "reseau") {
      for (let i = 0; i < 7; i++) {
        const x0 = 80 + i * 52 + (R() - 0.5) * 18, top = Y(z[0]) + R() * (Y(z[1]) - Y(z[0])) * 0.45;
        const v = { pts: chemin(x0, SRC - 6, top, (x0 - XC) / 900), debut: 0.06 + R() * 0.3, w: 2.2 };
        veines.push(v);
        if (R() < 0.7) { const j = 1 + Math.floor(R() * (v.pts.length - 2)), [bx, by] = v.pts[j]; veines.push({ pts: chemin(bx, by, by - 20 - R() * 30, R() < 0.5 ? 0.4 : -0.4), debut: v.debut + 0.25, w: 1.6 }); }
      }
    } else {
      veines.push({ pts: chemin(XC, SRC - 6, Y(z[0])), debut: 0.04, w: 2.8, principal: true });
      if (forme === "sill") {
        const ys = Math.round((Y(z[0]) - Z0 - 8) / 9) * 9 + Z0 + 8, xm = veines[0].pts[veines[0].pts.length - 1][0];
        veines[0].pts[veines[0].pts.length - 1][1] = ys + xm * pente();
        for (const sg of [-1, 1]) { const l = []; for (let x = xm; sg < 0 ? x >= 36 : x <= 444; x += sg * 6) l.push([x, ys + x * pente()]); veines.push({ pts: l, debut: 0.5, w: 4, sill: true }); }
      }
    }
    const principal = veines[0];
    // point de la veine principale suivi par le zoom (refroidissement) : aux deux tiers de la hauteur
    const zoom = lePlong(principal.pts, forme === "sill" ? 0.98 : 0.6);
    return { p, forme, enc, z, Z0, zb, PXK, Y, XC, SRC, fissures, veines, zoom,
      encC: enc === "granite" ? "#e2d6c8" : enc === "socle" ? "#b7aa92" : "#8d9187", cM: p.couleurMagma || MAGMA };
  }
  function filonEncaissant(G, R) {
    let s = rect(0, G.Z0, W, H - G.Z0, G.encC);
    if (G.enc === "granite") for (let i = 0; i < 160; i++) { const v = R(); s += circ(R() * W, G.Z0 + R() * (H - G.Z0), 1.1, v < 0.3 ? "#3e342c" : v < 0.6 ? "#e2b39a" : "#f4f1ea", { opacity: 0.8 }); }
    else for (let k = 0; G.Z0 + 8 + k * 9 < H; k++) s += line(0, G.Z0 + 8 + k * 9, W, G.Z0 + 8 + k * 9 + 3, "rgba(40,45,40,.25)", 1);
    for (const f of G.fissures) s += pline(f, "rgba(35,30,26,.45)", 0.7);
    return s;
  }
  function filonRegle(G) {
    let s = line(8, G.Z0, 8, G.Y(G.zb), "#27302d", 1);
    for (let z = 1; z < G.zb; z++) s += line(5, G.Y(z), 8, G.Y(z), "#27302d", 1) + (z % (G.zb > 8 ? 2 : 1) === 0 && G.Y(z) < H - 8 ? txt(11, G.Y(z) + 3, `${z} km`, { petit: true }) : "");
    return s;
  }
  SCENES.injectionFilon = function (p, roche) {
    const G = filonGeom(roche, p), R = alea("ifd" + p.graine), cM = G.cM;
    const L = loupe(412, 92, 46, { vers: [G.zoom.x, G.zoom.y], fond: G.encC });
    const fond = ciel(G.Z0) + filonEncaissant(G, R) + line(0, G.Z0, W, G.Z0, "#6d8a4a", 2) + filonRegle(G) + L.fond;
    const debris = Array.from({ length: 6 }, (_, i) => ({ y: 70 + i * 13 + R() * 6, dx: (R() - 0.5) * 6, r: 1.5 + R() * 1.5 }));
    return {
      fond,
      anim(t, ta) {
        let s = ell(G.XC, H + 16, 150, 40, cM, { opacity: 0.9 });
        // les fissures que le magma va suivre existent AVANT lui (même dessin que les autres fissures, un peu plus marqué)
        for (const v of G.veines) s += pline(v.pts, "rgba(35,30,26,.6)", 0.8);
        for (const v of G.veines) {
          const u = fen(t, v.debut, Math.min(0.92, v.debut + (v.sill ? 0.4 : 0.5)));
          if (u <= 0) continue;
          const part = partiel(v.pts, u);
          // la fissure s'ouvre juste devant le magma (pointe sombre), puis le magma la remplit
          if (u < 1) { const q = lePlong(v.pts, Math.min(1, u + 0.05)); s += pline(partiel(v.pts, Math.min(1, u + 0.05)).slice(part.length - 1), "#231d19", 1.4); }
          s += pline(part, cM, v.w);
        }
        // loupe : la pointe du filon, à l'échelle du mètre — le magma écarte les bords d'une fissure et arrache des morceaux
        const u = fen(t, 0.12, 0.8);
        let d = rect(360, 40, 110, 110, G.encC);
        if (G.enc === "granite") for (let k = 0; k < 40; k++) d += circ(366 + (k * 37) % 100, 46 + (k * 53) % 100, 1.6, k % 3 ? "#e2b39a" : "#3e342c", { opacity: 0.7 });
        else for (let k = 0; k < 12; k++) d += line(360, 44 + k * 9, 470, 47 + k * 9, "rgba(40,45,40,.3)", 1);
        const pointe = lerp(142, 52, u), ouv = 7;
        d += line(412, 40, 412, 150, "#231d19", 1.1);
        d += poly([[412 - ouv, 150], [412 - ouv * 0.7, pointe + 14], [412, pointe], [412 + ouv * 0.7, pointe + 14], [412 + ouv, 150]], cM);
        for (const b of debris) if (b.y > pointe + 6) d += poly([[412 + b.dx - b.r, b.y], [412 + b.dx, b.y - b.r * 1.3], [412 + b.dx + b.r, b.y + 0.5]], G.encC, { stroke: "rgba(40,35,30,.6)", "stroke-width": 0.5 });
        for (const sg of [-1, 1]) d += fleche(412 + sg * 9, pointe + 26, 412 + sg * 19, pointe + 26, { sw: 1.1, pointe: 4, c: "#27302d" });
        s += L.dans(d) + L.bord;
        s += txt(412, 152, "au bout du filon :", { a: "middle", petit: true }) + txt(412, 163, "le magma écarte la fissure", { a: "middle", petit: true });
        s += txt(170, 14, p.texte || (G.forme === "sill" ? "le magma monte par une fissure, puis s'étale entre deux couches (sill)" : G.forme === "reseau" ? "le dernier liquide s'engouffre dans les fissures du massif" : "le magma suit et écarte des fissures de la roche (dyke)"), { a: "middle", op: 1 - fen(t, 0.9, 0.97) });
        s += txt(W - 8, H - 8, (G.enc === "granite" ? "granite encaissant" : G.enc === "socle" ? "socle" : "schistes encaissants") + " · fissures en traits fins", { a: "end", petit: true });
        s += txt(G.forme === "reseau" ? 200 : G.XC + 14, G.forme === "reseau" ? H - 22 : Math.min(H - 22, G.Y((G.z[0] + G.z[1]) / 2)), p.largeur ? `${p.largeur} (dessiné plus large)` : "filons dessinés plus larges qu'en vrai", { petit: true, op: fen(t, 0.6, 0.75) });
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };
  // vignette : la coupe de l'étape de l'injection en tout petit, avec le cadre du zoom (lien entre les diapos)
  function filonVignette(G, x, y, w, figé, cR) {
    const k = w / W, h = H * k, id = nid("fv");
    let s = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${r1(w)}" height="${r1(h)}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${x} ${y}) scale(${r1(k * 1000) / 1000})">`
      + rect(0, 0, W, G.Z0, "#cfe3ee") + rect(0, G.Z0, W, H, G.encC) + ell(G.XC, H + 16, 150, 40, figé ? melange(G.cM, "#8f8378", 0.6) : G.cM);
    for (const v of G.veines) s += pline(v.pts, figé ? cR : G.cM, v.w * 2);
    s += rect(G.zoom.x - 22, G.zoom.y - 16, 44, 32, "none", { stroke: "#c0392b", "stroke-width": 5 }) + `</g></g>`;
    return s + rect(x, y, w, h, "none", { stroke: "#27302d", "stroke-width": 0.8 });
  }

  // le filon refroidit : bordures figées (grain très fin) contre l'encaissant froid, grain plus gros vers le cœur ;
  // loupe : "microgrenue" | "ophitique" | "lamprophyrique" | "aplitique" | "pegmatitique". Un sill est dessiné couché.
  SCENES.refroidissementFilon = function (p, roche) {
    const R = alea("rfi" + p.graine);
    const G = filonGeom(roche, p), hor = G.forme === "sill", tex = p.texture || "microgrenue";
    // axe « a » : en travers du filon (paroi → paroi) ; axe « b » : le long du filon
    const A0 = hor ? 70 : 60, A1 = hor ? 160 : 210, B0 = hor ? 10 : 30, B1 = hor ? 262 : 186, AM = (A0 + A1) / 2;
    const XY = (a, b) => hor ? [b, a] : [a, b];
    const R2 = (a0, a1, b0, b1, c) => { const [x0, y0] = XY(a0, b0), [x1, y1] = XY(a1, b1); return rect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0), c); };
    const cM = p.couleurMagma || G.cM, cR = p.couleurRoche || "#b9a79a";
    const pts = Array.from({ length: 260 }, () => [A0 + R() * (A1 - A0), B0 + R() * (B1 - B0), R()]);
    const CXL = 402, CYL = 106, RL = 62;
    const L = loupe(CXL, CYL, RL, { fond: { microgrenue: "#c9b2a4", ophitique: "#a9a38e", lamprophyrique: "#8c8274", aplitique: "#e8e2d6", pegmatitique: "#efe9dd" }[tex] });
    const petits = Array.from({ length: 170 }, () => ({ x: CXL - 64 + R() * 128, y: CYL - 64 + R() * 128, a: R() * 180, l: 1.5 + R() * 2.5, c: R() }));
    const gros = Array.from({ length: tex === "pegmatitique" ? 6 : tex === "aplitique" ? 0 : 8 }, () => ({ x: CXL - 42 + R() * 84, y: CYL - 42 + R() * 84, a: (R() - 0.5) * 70, l: tex === "pegmatitique" ? 30 + R() * 22 : 7 + R() * 7, w: tex === "pegmatitique" ? 14 + R() * 10 : 3 + R() * 3, c: R() }));
    const COUL = { microgrenue: ["#efe9dd", "#e2b39a", "#3e342c"], ophitique: ["#f2efe8", "#8a7d52", "#8a7d52"], lamprophyrique: ["#5b3b24", "#3d5a44", "#5b3b24"],
      aplitique: ["#f1ece2", "#e8c9b5", "#dcd6ca"], pegmatitique: ["#f0dccd", "#e8e3da", "#2c2c2c"] }[tex];
    const legende = p.legende || [];
    const nomE = p.nomEncaissant || "encaissant";
    let fond = rect(0, 0, W, H, "#f3f1ea") + R2(A0 - (hor ? 34 : 50), A0, B0, B1, cR) + R2(A1, A1 + (hor ? 30 : 50), B0, B1, cR) + L.fond
      + txt(hor ? 136 : (A0 + A1) / 2, hor ? 28 : 22, hor ? "le sill, en coupe" : "le filon, en coupe", { a: "middle" });
    fond += hor ? txt(14, A0 - 8, nomE, { petit: true }) + txt(14, A1 + 20, nomE, { petit: true })
      : txt(A0 - 25, 198, nomE, { a: "middle", petit: true }) + txt(A1 + 25, 198, nomE, { a: "middle", petit: true });
    fond += filonVignette(G, 90, 200, 76, true, p.couleurFige || "#8f8378") + txt(170, 212, "où l'on regarde :", { petit: true }) + txt(170, 223, "le cadre rouge", { petit: true });
    return {
      fond,
      anim(t) {
        const e = fen(t, 0.04, 0.9), ep = e * (A1 - A0) / 2;
        let s = R2(A0, A1, B0, B1, melange(cM, "#d6c6b6", 0.1));
        s += R2(A0, A0 + ep, B0, B1, p.couleurFige || "#8f8378") + R2(A1 - ep, A1, B0, B1, p.couleurFige || "#8f8378");
        for (const [a, b, v] of pts) { const d = Math.min(a - A0, A1 - a); if (d < ep) { const [x, y] = XY(a, b); s += circ(x, y, 0.5 + 1.8 * (d / ((A1 - A0) / 2)), v < 0.3 ? "#3e342c" : "#efe9dd", { opacity: 0.8 }); } }
        const [gx, gy] = XY(A0 + 4, B0 + 14);
        s += txt(gx, gy, "grain fin", { petit: true, op: fen(t, 0.15, 0.25) });
        const [cx, cy] = XY(AM, (B0 + B1) / 2);
        s += txt(cx, cy + 3, e < 0.95 ? "cœur encore liquide" : "cœur, grain plus gros", { a: "middle", petit: true, clair: e < 0.95 });
        let d = "";
        for (const g of gros) {
          const k = tex === "pegmatitique" ? fen(t, 0.1 + g.c * 0.3, 0.8) : 1;
          const c = COUL[g.c < 0.5 ? 0 : g.c < 0.8 ? 1 : 2];
          d += `<rect x="${r1(g.x - g.l * k / 2)}" y="${r1(g.y - g.w * k / 2)}" width="${r1(g.l * k)}" height="${r1(g.w * k)}" fill="${c}" stroke="rgba(40,35,30,.55)" stroke-width=".8" transform="rotate(${r1(g.a)} ${r1(g.x)} ${r1(g.y)})"/>`;
          if (tex === "ophitique") d += `<rect x="${r1(g.x - g.l * 0.35)}" y="${r1(g.y - 0.9)}" width="${r1(g.l * 0.7)}" height="1.8" fill="#f2efe8" transform="rotate(${r1(g.a + 40)} ${r1(g.x)} ${r1(g.y)})"/>`;
        }
        if (tex !== "pegmatitique") for (const m of petits) {
          const k = fen(t, 0.1 + m.c * 0.5, 0.4 + m.c * 0.5); if (k <= 0.02) continue;
          const c = COUL[m.c < 0.55 ? 0 : m.c < 0.85 ? 1 : 2], L2 = tex === "aplitique" ? m.l * 0.9 : m.l;
          d += tex === "aplitique" ? poly([[m.x - L2, m.y - L2 * 0.5], [m.x + L2 * 0.4, m.y - L2], [m.x + L2, m.y + L2 * 0.4], [m.x - L2 * 0.3, m.y + L2]], c, { stroke: "rgba(60,55,45,.3)", "stroke-width": 0.4, opacity: op(k) })
            : line(m.x - Math.cos(m.a) * L2, m.y - Math.sin(m.a) * L2, m.x + Math.cos(m.a) * L2, m.y + Math.sin(m.a) * L2, c, 1.2, { opacity: op(k) });
        }
        s += L.dans(d) + L.bord;
        const lg = p.lignes || ["au microscope", ""];
        lg.forEach((l, i) => { s += txt(CXL, CYL + RL + 16 + i * 11, l, { a: "middle", petit: true }); });
        legende.forEach(([c, n], i) => { s += rect(272, 50 + i * 14, 10, 10, c, { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }) + `<text x="286" y="${59 + i * 14}" class="fa-leg">${n}</text>`; });
        const T = lerp(p.tDebut ?? 900, 40, e);
        s += thermometre(300, 118, 50, T, 0, Math.max(1000, Math.ceil(((p.tDebut ?? 900) + 50) / 100) * 100), []);
        s += txt(300, 110, `${nombre(T)} °C`, { a: "middle", petit: true });
        s += txt(470, 230, p.duree || "", { a: "end", petit: true });
        return s;
      },
    };
  };

  // l'érosion met au jour les filons : MÊME coupe qu'à l'injection ; la surface descend de plusieurs kilomètres jusqu'à
  // recouper les filons ; loupe à l'échelle du paysage : le filon forme une muraille basse (ou une corniche pour un sill)
  function degagementFilon(p, roche) {
    const G = filonGeom(roche, p), cR = p.couleur || "#d8b9a8";
    const zE = G.forme === "reseau" ? G.z[0] + 0.45 * (G.z[1] - G.z[0]) : G.forme === "sill" ? G.z[0] + 0.25 : G.z[0] + 0.35 * (G.z[1] - G.z[0]);
    // sill : la surface finale est légèrement inclinée : à gauche le sill est encore couvert, à droite il est enlevé ;
    // entre les deux, il affleure en corniche (vers x = 220)
    const sill = G.forme === "sill", ys = sill ? G.veines[1].pts[0][1] : 0, pente = sill ? 0.05 : 0;
    const YE = sill ? ys : G.Y(zE), clipS = nid("dfs"), vx = sill ? 220 : (() => { let b = null; for (const v of G.veines) for (let i = 1; i < v.pts.length; i++) { const [x1, y1] = v.pts[i - 1], [x2, y2] = v.pts[i]; if ((y1 - YE) * (y2 - YE) <= 0 && !b) b = x1 + (x2 - x1) * (YE - y1) / (y2 - y1 || 1); } return b ?? G.XC; })();
    const L = loupe(400, 74, 50, { vers: [vx, YE] });
    const R = alea("dfv" + p.graine);
    return {
      fond: ciel(H),
      anim(t, ta) {
        const e = fen(t, 0.04, 0.8), Ls = lerp(G.Z0, YE, e);
        const bosse = (x) => { let b = 0; for (const v of G.veines) for (let i = 1; i < v.pts.length; i++) { const [x1, y1] = v.pts[i - 1], [x2, y2] = v.pts[i]; if ((y1 - Ls) * (y2 - Ls) <= 0) { const xi = x1 + (x2 - x1) * (Ls - y1) / (y2 - y1 || 1); b = Math.max(b, 2.2 * Math.max(0, 1 - Math.abs(x - xi) / 6)); } } return b; };
        const surf = (x) => Ls + (x - 220) * pente * e + 2 * Math.sin(x / 41 + 1) * e * (sill ? 0 : 1) - bosse(x) - (sill && e > 0.9 ? 3 * Math.max(0, 1 - Math.abs(x - 214) / 8) * fen(e, 0.9, 1) : 0);
        const S = []; for (let x = 0; x <= W; x += 2) S.push([x, surf(x)]);
        let s = `<clipPath id="${clipS}"><polygon points="${P(S.concat([[W, H + 5], [0, H + 5]]))}"/></clipPath><g clip-path="url(#${clipS})">`;
        s += filonEncaissant(G, alea("ifd" + p.graine)) + ell(G.XC, H + 16, 150, 40, melange(G.cM, cR, 0.7));
        for (const v of G.veines) s += pline(v.pts, cR, v.w + 0.4) + pline(v.pts, "rgba(60,50,40,.35)", 0.5);
        s += `</g>` + pline(S, e > 0.7 ? "#6f9d4f" : "#7d7466", 1.4);
        // l'ancienne surface, et ce qui a été enlevé
        s += line(0, G.Z0, W, G.Z0, "#8d7b5e", 1, { "stroke-dasharray": "4 3", opacity: op(fen(t, 0.1, 0.2)) }) + txt(16, G.Z0 - 4, `surface il y a ${nombre((p.ages || [300])[0])} millions d'années`, { petit: true, op: fen(t, 0.1, 0.2) });
        if (e > 0.3) s += txt(58, (G.Z0 + Ls) / 2 + 3, `≈ ${String(Math.round((YE - G.Z0) / G.PXK * e * 10) / 10).replace(".", ",")} km de roches enlevés`, { petit: true, op: fen(e, 0.3, 0.45) });
        const pl = fen(t, 0.06, 0.16) * (1 - 0.45 * fen(t, 0.9, 1));
        s += `<g opacity="${op(pl)}">${pluie(150 + 1.6 * ta, 26, 50, Math.max(10, Ls - 34), ta, 10, "df1")}${nuage(170 + 1.6 * ta, 20, 0.8)}</g>`;
        s += filonRegle(G);
        // loupe : le filon dans le paysage d'aujourd'hui (échelle du mètre)
        const lp = fen(t, 0.78, 0.9);
        if (lp > 0) {
          let d = rect(350, 24, 100, 100, "#cfe3ee");
          const sol = (x) => 96 + 3 * Math.sin(x / 11);
          const mur = G.forme === "sill" ? (x) => (x < 396 ? 72 + (x - 350) * 0.05 : sol(x)) : (x) => Math.abs(x - 400) < 7 ? 80 + Math.abs(x - 400) * 0.6 : sol(x) - 6 * Math.max(0, 1 - (Math.abs(x - 400) - 7) / 16);
          const T0 = []; for (let x = 350; x <= 450; x += 2) T0.push([x, Math.min(sol(x), mur(x))]);
          d += poly(T0.concat([[450, 130], [350, 130]]), G.encC === "#e2d6c8" ? "#d9ccb9" : "#9c8a70");
          if (G.forme === "sill") d += poly([[350, 72], [396, 74.3], [398, 84], [350, 82]], cR, { stroke: "#5f574c", "stroke-width": 0.8 });
          else d += poly([[393, 130], [393, 84], [396, 80], [404, 80], [407, 84], [407, 130]], cR, { stroke: "#5f574c", "stroke-width": 0.8 });
          d += pline(T0, "#6f9d4f", 1.4) + vegetation(sol, 352, 385, alea("dfl"), { pas: 12, echelle: 0.8 }) + vegetation(sol, 416, 448, alea("dfm"), { pas: 12, echelle: 0.8 });
          d += line(372, 44, 392, 44, "#27302d", 1.2) + `<text x="382" y="40" text-anchor="middle" class="fa-leg">10 m</text>`;
          s += `<g opacity="${op(lp)}">${L.fond}${L.dans(d)}${L.bord}</g>` + txt(400, 138, G.forme === "sill" ? "plus dur, le sill forme" : "plus dur, le filon forme", { a: "middle", petit: true, op: lp })
            + txt(400, 149, G.forme === "sill" ? "une corniche de quelques mètres" : "une muraille de quelques mètres", { a: "middle", petit: true, op: lp });
        }
        s += txt(250, 14, e < 0.7 ? (p.texte || "l'érosion enlève des kilomètres de roches") : (p.texteFin || "les filons affleurent"), { a: "middle" });
        s += compteur(404, 226, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0);
        return s;
      },
    };
  }

  // ───────────── éruptions explosives (18/09/2026) ─────────────
  // p.mode : "ignimbrite" (la colonne plinienne s'effondre en nuées qui comblent le paysage) | "retombees" (panache,
  // parapluie, cendres qui tombent sous le vent) ; p.hauteurColonne (texte), ages, libelleAge
  SCENES.eruptionExplosive = function (p) {
    if ((p.mode || "ignimbrite") === "ignimbrite") return eruptionIgnimbrite(p);
    const R = alea("ee" + p.graine);
    const SOL = 190, XV = 110, mode = p.mode || "ignimbrite";
    const relief = (x) => SOL - (x < XV ? 60 * Math.max(0, 1 - Math.abs(x - XV) / 70) : 60 * Math.max(0, 1 - (x - XV) / 80)) - 6 * Math.sin(x / 23) * (x > 200 ? 1 : 0) + (x > 250 && x < 330 ? 10 * Math.sin((x - 250) / 80 * Math.PI) : 0);
    const cendres = Array.from({ length: 90 }, () => ({ x: 160 + R() * 330, ph: R() }));
    return {
      fond: ciel(H) + poly(Array.from({ length: 121 }, (_, i) => [i * 4, relief(i * 4)]).concat([[W, H], [0, H]]), "#8c8272"),
      anim(t, ta) {
        let s = "";
        const col = mode === "ignimbrite" ? fen(t, 0.02, 0.2) * (1 - fen(t, 0.35, 0.55)) : fen(t, 0.02, 0.25);
        // colonne plinienne et nuage en parapluie
        for (let k = 0; k < 14; k++) {
          const u = (ta * 0.12 + k / 14) % 1, y = lerp(SOL - 60, 26, u), r = 10 + u * 22;
          s += circ(XV + Math.sin(u * 7 + k) * 6, y, r, "#8f8a85", { opacity: op(col * 0.55) });
        }
        if (col > 0) s += ell(XV + 60 + (mode === "retombees" ? 60 * fen(t, 0.1, 0.9) : 0), 28, 70 + 90 * col, 14, "#9a958f", { opacity: op(col * 0.8) });
        if (mode === "ignimbrite") {
          // la colonne s'effondre : nuées qui dévalent et comblent le relief
          const nu = fen(t, 0.35, 0.8);
          for (let k = 0; k < 12; k++) { const u = clamp(nu - k * 0.03), x = lerp(XV + 10, 470, u); if (u > 0 && u < 0.99) s += circ(x, relief(x) - 10 - (k % 3) * 6, 14 + (k % 4) * 3, "#a39d95", { opacity: op(0.6 * (1 - fen(t, 0.85, 0.95))) }); }
          const ep = 16 * fen(t, 0.45, 0.95), dep = [];
          for (let x = XV + 20; x <= W; x += 4) dep.push([x, Math.min(relief(x), SOL - 4 - ep + (x - XV) * 0.012)]);
          if (ep > 0.5) s += poly(dep.concat(dep.slice().reverse().map(([x]) => [x, relief(x)])), "#d9ccb5", { stroke: "#b8a98f", "stroke-width": 0.8 });
          s += txt(300, SOL - 30 - ep, "dépôt de nuées ardentes : l'ignimbrite", { a: "middle", petit: true, op: fen(t, 0.8, 0.9) });
          s += txt(190, 14, t < 0.35 ? "colonne plinienne : cendres et ponces montent à des dizaines de km" : "trop lourde, la colonne s'effondre : les nuées dévalent", { a: "middle" });
        } else {
          // retombées : cendres qui tombent sous le vent, couche de moins en moins épaisse en s'éloignant
          for (const c of cendres) { const u = (c.ph + ta * 0.25) % 1; if (c.x < 160 + 330 * fen(t, 0.1, 0.9)) s += circ(c.x + u * 8, lerp(40, relief(c.x), u), 0.9, "#6e6a66", { opacity: op(Math.sin(u * Math.PI) * 0.8) }); }
          const ep = fen(t, 0.2, 0.95), dep = [];
          for (let x = XV + 30; x <= W; x += 4) dep.push([x, relief(x) - ep * 12 * Math.exp(-(x - XV - 30) / 180)]);
          s += poly(dep.concat(dep.slice().reverse().map(([x]) => [x, relief(x)])), "#cfc4b0");
          s += txt(190, 14, "les gaz se détendent : le magma est pulvérisé en cendres", { a: "middle" });
          s += fleche(300, 52, 360, 52, { sw: 2, pointe: 7 }) + txt(366, 55, "vent", { petit: true });
          s += txt(330, relief(330) + 16, "couche de cendres, plus mince loin du volcan", { a: "middle", petit: true, clair: true, op: fen(t, 0.6, 0.7) });
        }
        s += txt(XV + 36, 60, p.hauteurColonne || "", { petit: true, op: col });
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // cône de scories (strombolien), refait le 24/09/2026 (pouzzolane : « il manque un conduit pour que ce soit similaire à la
  // diapo 2 », « la construction est à revoir », « des bugs d'animation » — des bombes tirées au hasard à chaque image).
  // UNE coupe pour les deux étapes : le sol en coupe et le filon de l'étape précédente qui arrive au cratère ; des bulles de
  // gaz montent dans le conduit, grossissent et éclatent ; les lambeaux de lave retombent et le cône s'élève LIT PAR LIT,
  // chaque lit parallèle aux flancs (pente d'éboulement ≈ 30°). Près de la bouche les scories retombent encore chaudes et
  // leur fer s'oxyde à l'air : elles restent rouges ; plus loin elles refroidissent en vol : noires.
  // Étape 2 (T 0,5–1) : le temps passe (végétation), puis une carrière entaille le flanc et montre la coupe (Lemptégy).
  function coneScories(p, T0, T1) {
    const R = alea("cs" + p.graine);
    const SOL = 176, XC = 214, HM = 88, K = 0.58, N = 10;           // K = pente des flancs (≈ 30°)
    const hL = (i) => HM * Math.sqrt(i / N);
    const prof = (h, x) => {
      if (h <= 0) return SOL;
      const d = Math.abs(x - XC), c = 10 + h * 0.12, y = SOL - Math.max(0, h - d * K);
      return d < c ? Math.min(SOL, SOL - (h - c * K) + 9 * (h / HM) * (1 - (d / c) ** 2)) : y;
    };
    const xs = Array.from({ length: 111 }, (_, i) => XC - 190 + i * 3.8);
    const gid = nid("csg"), clipC = nid("csc");
    const grad = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${XC - HM / K}" y1="0" x2="${XC + HM / K}" y2="0">`
      + [[0, "#241e1b"], [0.3, "#3a2c25"], [0.42, "#8e3b22"], [0.5, "#a9452a"], [0.58, "#8e3b22"], [0.7, "#3a2c25"], [1, "#241e1b"]].map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("") + `</linearGradient>`;
    const bombes = Array.from({ length: 40 }, () => ({ vx: (R() - 0.5) * 2.4, h: 40 + R() * 70, ph: R(), r: 1.5 + R() * 2 }));
    // bombes figées dans les lits (positions tirées UNE fois)
    const incl = Array.from({ length: 26 }, () => { const i = 1 + Math.floor(R() * N), x = XC + (R() - 0.5) * 2 * (hL(i) / K) * 0.85; return { i, x, f: R(), rx: 2.5 + R() * 2.5, ry: 1.6 + R() * 1.4 }; });
    const bulles = Array.from({ length: 9 }, () => ({ ph: R(), dx: (R() - 0.5) * 3 }));
    let fond = ciel(SOL) + `<defs>${grad}</defs>` + rect(0, SOL, W, H - SOL, "#8a7d68");
    for (let y = SOL + 9; y < H; y += 10) fond += line(0, y, W, y + 1.5, "rgba(50,40,30,.18)", 1);
    fond += line(0, SOL, W, SOL, "#6d8a4a", 2) + txt(8, H - 8, "sol et vieilles coulées, en coupe", { petit: true, clair: true });
    return {
      fond,
      anim(t, ta) {
        const T = lerp(T0, T1, t), g = fen(T, 0.03, 0.46), act = 1 - fen(T, 0.44, 0.5);
        const n = Math.min(N, g * N), done = Math.floor(n), h = hL(n) || 0.001;
        // carrière (étape 2) : à droite de la paroi xf, le cône est enlevé jusqu'à des gradins
        const q = T < 0.5 ? 0 : fen(T, 0.66, 0.95), xf = lerp(XC + HM / K + 10, XC + 16, q);
        const banc = (x) => Math.min(SOL - 1, SOL - HM * 0.95 + Math.floor((x - xf) / 14) * 20);
        const surfC = (x) => q > 0 && x >= xf ? Math.max(prof(h, x), banc(x)) : prof(h, x);
        const S = xs.map((x) => [x, surfC(x)]);
        let s = "";
        // conduit (le filon de l'étape précédente) : liquide pendant l'éruption, figé ensuite
        const topC = prof(h, XC) + 2;
        s += rect(XC - 3.5, topC, 7, H - topC, melange(MAGMA, "#5a2a1c", fen(T, 0.46, 0.56)));
        if (act > 0) for (const b of bulles) {                              // bulles de gaz qui montent, grossissent, éclatent
          const u = (b.ph + ta * 0.35) % 1, y = lerp(H, topC + 4, u), r = 0.8 + 2.4 * u * u;
          s += circ(XC + b.dx * (1 - u), y, r, "#fbe3b4", { opacity: op(act * (u < 0.92 ? 0.8 : (1 - u) * 10)) });
        }
        // le cône, lit par lit (le lit en cours grandit, encore incandescent)
        s += `<clipPath id="${clipC}"><polygon points="${P(S.concat([[xs[xs.length - 1], SOL + 1], [xs[0], SOL + 1]]))}"/></clipPath><g clip-path="url(#${clipC})">`;
        s += poly(S.concat([[xs[xs.length - 1], SOL + 1], [xs[0], SOL + 1]]), `url(#${gid})`);
        for (let i = 1; i <= done; i++) s += pline(xs.map((x) => [x, prof(hL(i), x)]), "rgba(15,12,10,.45)", 0.9);
        for (const b of incl) if (b.i <= done) { const y = lerp(prof(hL(b.i), b.x), prof(hL(b.i - 1), b.x), 0.5); if (y < SOL - 1) s += ell(b.x, y, b.rx, b.ry, "#1a1512"); }
        if (n < N && act > 0) { const lo = xs.map((x) => [x, prof(hL(done), x)]); s += poly(S.concat(lo.reverse()), MAGMA_CLAIR, { opacity: 0.55 }); }
        s += rect(XC - 3.5, topC, 7, SOL - topC + 2, melange(MAGMA, "#5a2a1c", fen(T, 0.46, 0.56)));
        s += `</g>`;
        s += pline(S, "#2a2320", 1);
        if (T < 0.5) {
          // fontaines : lambeaux projetés, orange à la sortie, rouges puis noirs en retombant
          for (const b of bombes) { const u = (b.ph + ta * 0.45) % 1, x = XC + b.vx * u * 40, y = topC - 4 - Math.sin(u * Math.PI) * b.h * (0.6 + 0.4 * act); if (y < prof(h, x)) s += circ(x, y, b.r, u < 0.4 ? MAGMA_CLAIR : u < 0.7 ? "#b5401f" : "#3b302b", { opacity: op(act) }); }
          s += ell(XC, topC, 6, 2.5, MAGMA_CLAIR, { opacity: op(act) });
          s += txt(200, 16, "les bulles de gaz éclatent : des lambeaux de lave sont projetés", { a: "middle", op: act });
          s += txt(XC + 12, SOL + 30, "le conduit (le filon de l'étape 2)", { petit: true, clair: true });
          s += txt(XC + hL(Math.max(1, n)) / K * 0.55 + 8, SOL - hL(Math.max(1, n)) * 0.42, `lit n° ${Math.min(N, done + 1)} : les scories retombent et s'empilent`, { petit: true, op: fen(T, 0.06, 0.1) * act });
          s += txt(12, 52, "scories rouges près de la bouche (fer oxydé à chaud),", { petit: true, op: fen(T, 0.3, 0.36) })
            + txt(12, 63, "noires plus loin (refroidies en vol)", { petit: true, op: fen(T, 0.3, 0.36) });
        } else {
          // le temps passe : végétation ; puis une carrière entaille le flanc droit, en gradins
          const v = fen(T, 0.52, 0.66);
          if (v > 0) { const rv = alea("csv" + p.graine); s += vegetation((x) => Math.min(SOL, prof(HM, x)), 4, q > 0 ? xf - 2 : W - 4, rv, { op: v, pas: 14, pente: 0.9 }); if (q > 0) s += vegetation(() => SOL, XC + HM / K + 40, W - 4, alea("csw"), { op: v, pas: 14 }); }
          if (q > 0) {
            s += rect(XC + HM / K + 22, SOL - 7, 12, 5, "#e2a93b", { rx: 1 }) + circ(XC + HM / K + 25, SOL - 1.5, 1.6, "#27302d") + circ(XC + HM / K + 32, SOL - 1.5, 1.6, "#27302d");
            s += txt(W - 8, 60, "carrière : la pouzzolane est exploitée,", { a: "end", petit: true, op: fen(T, 0.72, 0.78) })
              + txt(W - 8, 71, "la coupe montre les lits et le cœur rouge", { a: "end", petit: true, op: fen(T, 0.72, 0.78) });
          }
          s += txt(200, 16, T < 0.66 ? "l'éruption finie, le cône se couvre de végétation" : "une carrière entaille le cône et montre sa coupe", { a: "middle" });
          s += txt(XC - HM / K * 0.62, SOL - 20, "lits de scories inclinés", { a: "end", petit: true, clair: true, op: fen(T, 0.8, 0.9) });
        }
        s += compteur(412, 14, 0, { libelle: p.libelleAge || "" });
        return s;
      },
    };
  }
  SCENES.coneFontaines = (p) => coneScories(p, 0, 0.5);
  SCENES.coneCoupe = (p) => coneScories(p, 0.5, 1);

  // ───────────── « au microscope » générique (18/09/2026) : une texture qui évolue (soudure, altération, cimentation…) ─────────────
  // p.texture : "fiammes" | "cendres" | "breche" | "conglomerat" | "tillite" | "charbon" | "diatomees" | "radiolaires" |
  //   "silex" | "coccolithes" | "oolithes" | "evaporite" | "argile" | "loess" ; p.lignes, p.legende, p.jauge {nom, de, a, unite},
  //   p.thermo [T début, T fin], p.titre, p.duree
  SCENES.vueMicroscope = function (p, roche) {
    if (p.fiche) { const res = texFiche(roche); if (res) return microFiche(p, res); }
    const R = alea("vm" + p.graine);
    const CX = 150, CY = 122, RA = 98, tex = p.texture || "breche";
    const FOND = { fiammes: "#d8cbb8", cendres: "#e3dccd", breche: "#b6aa98", conglomerat: "#d8c8a6", tillite: "#a9a393", charbon: "#6b5236", diatomees: "#f1eee6",
      radiolaires: "#c9a58f", silex: "#d9d1c3", coccolithes: "#f4f1e9", oolithes: "#e6dcc3", evaporite: "#f1eee8", argile: "#b8a58a", loess: "#d9c69e", arkose: "#c9ab92", gres: "#8fc3e4", cargneule: "#d8b98a", coquilles: "#e8dcc0", spicules: "#b9b39a", dolomite: "#ece6da", rubane: "#9a9590", mylonite: "#cfc8bc", pseudotachylite: "#d8cdbf" }[tex] || "#d9d1c3";
    const L = loupe(CX, CY, RA, { fond: FOND });
    const N = { fiammes: 26, cendres: 60, breche: 18, conglomerat: 20, tillite: 24, charbon: 14, diatomees: 40, radiolaires: 34, silex: 30, coccolithes: 70, oolithes: 26, evaporite: 26, argile: 90, loess: 90, arkose: 46, gres: 52, cargneule: 34, coquilles: 30, spicules: 70, dolomite: 60, mylonite: 110, pseudotachylite: 40 }[tex] || 30;
    let obj = Array.from({ length: N }, () => ({ x: CX - 100 + R() * 200, y: CY - 100 + R() * 200, r: 4 + R() * 9, a: R() * Math.PI, c: R(), ph: R() * 0.4, k: 3 + Math.floor(R() * 4) }));
    // roches à grains jointifs (grès, arkose, conglomérat) : grains tassés sur une grille irrégulière, qui se touchent
    if (tex === "gres" || tex === "arkose" || tex === "conglomerat") {
      const pas = tex === "conglomerat" ? 30 : 17;
      obj = [];
      for (let y = CY - 100; y <= CY + 100; y += pas * 0.87) for (let x = CX - 100 + ((y / pas) % 2) * pas / 2; x <= CX + 100; x += pas)
        obj.push({ x: x + (R() - 0.5) * pas * 0.25, y: y + (R() - 0.5) * pas * 0.25, r: pas * (tex === "conglomerat" ? 0.5 + R() * 0.12 : 0.78 + R() * 0.1), a: R() * Math.PI, c: R(), ph: R() * 0.4, k: 4 + Math.floor(R() * 3) });
    }
    const COUL = ["#6f6a63", "#9a8f82", "#c9bba6", "#4d4a45", "#b0715a"];
    return {
      fond: rect(0, 0, W, H, "#f3f1ea") + txt(CX, 16, p.titre || "Au microscope", { a: "middle" }) + L.fond,
      anim(t, ta) {
        const e = fen(t, 0.05, 0.92);
        let d = "";
        if (tex === "argile" || tex === "loess") for (const o of obj) d += line(o.x - o.r * 0.5, o.y, o.x + o.r * 0.5, o.y + (tex === "argile" ? 0 : (o.c - 0.5) * 3), tex === "argile" ? "#8c7a60" : (o.c < 0.7 ? "#efe7d2" : "#a88c63"), tex === "argile" ? 1 : 2.2, { opacity: 0.8 });
        for (const o of obj) {
          const k = fen(t, o.ph, o.ph + 0.5);
          if (tex === "fiammes") {                                               // ponces qui s'aplatissent et se soudent
            const fl = lerp(1, 0.25, k), el = lerp(1, 2.4, k);
            d += ell(o.x, o.y, o.r * el, o.r * fl, o.c < 0.7 ? "#efe9df" : "#5d5750", { stroke: "rgba(60,55,50,.5)", "stroke-width": 0.6 });
            if (o.c < 0.7 && k < 0.7) for (let b = 0; b < 3; b++) d += circ(o.x + (b - 1) * o.r * 0.5 * el, o.y, o.r * 0.18 * fl, FOND, { opacity: op(1 - k) });
          } else if (tex === "cendres") {                                        // échardes de verre qui s'altèrent en argiles
            const c = melange("#f6f3ec", "#b99f7c", k * 0.8), rr = o.r * 0.7;
            d += `<path d="M${r1(o.x - rr)} ${r1(o.y - rr * 0.3)} Q${r1(o.x)} ${r1(o.y + rr * 0.5)} ${r1(o.x + rr)} ${r1(o.y - rr * 0.3)} L${r1(o.x + rr * 0.2)} ${r1(o.y + rr * 0.1)} L${r1(o.x)} ${r1(o.y + rr)} L${r1(o.x - rr * 0.2)} ${r1(o.y + rr * 0.1)} Z" fill="${c}" stroke="rgba(80,70,60,.45)" stroke-width=".6" transform="rotate(${r1(o.a * 57)} ${r1(o.x)} ${r1(o.y)})"/>`;
            if (k > 0.6 && o.c < 0.3) d += rect(o.x + 3, o.y - 3, 2, 5, "#ffffff", { opacity: op((k - 0.6) * 2.5) });
          } else if (tex === "breche" || tex === "tillite" || tex === "conglomerat") {
            const n = o.k + 2, rond = tex === "conglomerat" ? 1 : 0, tl = tex === "tillite" ? o.r * (0.3 + o.c * 1.3) : o.r;
            const pts = Array.from({ length: rond ? 16 : n }, (_, i) => { const a = o.a + i / (rond ? 16 : n) * Math.PI * 2, rr = tl * (rond ? 1 : 0.7 + ((i * 7 + o.k) % 5) / 10); return [o.x + Math.cos(a) * rr * 1.2, o.y + Math.sin(a) * rr]; });
            d += poly(pts, COUL[Math.floor(o.c * COUL.length)], { stroke: "rgba(30,28,25,.5)", "stroke-width": 0.8 });
            if (tex === "tillite" && o.c > 0.6) d += line(o.x - tl * 0.8, o.y - tl * 0.2, o.x + tl * 0.6, o.y + tl * 0.3, "rgba(255,255,255,.5)", 0.6);
          } else if (tex === "arkose" || tex === "gres") {                     // grains anguleux (arkose) ou arrondis (grès), ciment qui gagne
            const n = tex === "arkose" ? 5 : 12, rr = o.r * (tex === "arkose" ? 0.75 : 0.6 * (p.taille || 1));
            const pts = Array.from({ length: n }, (_, i) => { const a = o.a + i / n * Math.PI * 2; return [o.x + Math.cos(a) * rr * (tex === "arkose" ? 0.7 + ((i * 3 + o.k) % 4) / 8 : 1), o.y + Math.sin(a) * rr * (tex === "arkose" ? 0.7 + ((i * 5 + o.k) % 4) / 8 : 0.9)]; });
            const col = tex === "arkose" ? (o.c < 0.55 ? "#f1ede4" : o.c < 0.9 ? "#e2ad94" : "#6b5a4a") : (o.c < 0.9 ? "#ece8df" : "#d9b99b");
            d += poly(pts, col, { stroke: "rgba(60,55,45,.5)", "stroke-width": 0.6 });
          } else if (tex === "cargneule") {                                     // brèche : le gypse se dissout, il reste des vacuoles dans la dolomie
            const n = 6, rr = o.r * 0.9, pts = Array.from({ length: n }, (_, i) => { const a = o.a + i / n * Math.PI * 2; return [o.x + Math.cos(a) * rr * (0.7 + ((i * 3 + o.k) % 4) / 8), o.y + Math.sin(a) * rr * (0.7 + ((i * 5 + o.k) % 4) / 8)]; });
            if (o.c < 0.45) { const g = 1 - k; d += poly(pts.map(([x, y]) => [o.x + (x - o.x) * (0.3 + 0.7 * g), o.y + (y - o.y) * (0.3 + 0.7 * g)]), "#f6f4ef", { stroke: "#a9a293", "stroke-width": 0.6, opacity: op(g) }); d += poly(pts, "#3c3a36", { opacity: op(k * 0.9) }); }
            else d += poly(pts, o.c < 0.8 ? "#e3c795" : "#c9a36f", { stroke: "rgba(90,70,40,.5)", "stroke-width": 0.7 });
          } else if (tex === "coquilles") {                                     // coquilles entières qui se brisent en débris triés
            const n = 1 + Math.floor(k * 3), rr = o.r * 1.1 / Math.sqrt(n);
            for (let f = 0; f < n; f++) { const fx = o.x + (f - (n - 1) / 2) * rr * 1.6, a0 = o.a + f; d += `<path d="M${r1(fx - rr)} ${r1(o.y)} A${r1(rr)} ${r1(rr * 0.8)} 0 0 1 ${r1(fx + rr)} ${r1(o.y)} Z" fill="${o.c < 0.8 ? "#f5efe0" : "#8aa36a"}" stroke="#a89878" stroke-width=".7" transform="rotate(${r1(a0 * 57)} ${r1(fx)} ${r1(o.y)})"/>`; }
          } else if (tex === "spicules") {                                      // spicules d'éponges, soudées par de l'opale
            d += line(o.x - o.r * 0.7, o.y, o.x + o.r * 0.7, o.y + (o.c - 0.5) * 6, o.c < 0.85 ? "#f1eee6" : "#5f8a4a", o.c < 0.85 ? 1.4 : 3, { stroke: "#8f8872" });
          } else if (tex === "dolomite") {                                      // la calcite (grains ronds) est remplacée par des rhomboèdres
            if (k < 0.99) d += circ(o.x, o.y, o.r * 0.6 * (1 - k), "#f7f4ee", { stroke: "#b8b2a6", "stroke-width": 0.6 });
            if (k > 0.02) { const rr = o.r * 0.75 * k; d += poly([[o.x, o.y - rr], [o.x + rr * 0.8, o.y], [o.x, o.y + rr], [o.x - rr * 0.8, o.y]], "#dcc49a", { stroke: "#8a7148", "stroke-width": 0.7 }); }
          } else if (tex === "mylonite") {                                      // grains étirés en rubans autour d'« yeux » de feldspath
            const st = lerp(1, 3.2, k), sq = lerp(1, 0.35, k);
            d += o.c < 0.2 ? ell(o.x, o.y, o.r * 0.9 * lerp(1, 1.4, k), o.r * 0.7 * lerp(1, 0.8, k), "#e2ad94", { stroke: "rgba(60,50,40,.5)", "stroke-width": 0.7 })
              : ell(o.x, o.y, o.r * 0.5 * st, o.r * 0.5 * sq, o.c < 0.75 ? "#f1eee6" : "#8a7d66", { stroke: "rgba(60,50,40,.3)", "stroke-width": 0.4 });
          } else if (tex === "pseudotachylite") {
            if (o.c < 0.6) d += poly(Array.from({ length: 5 }, (_, i) => { const a = o.a + i / 5 * Math.PI * 2; return [o.x + Math.cos(a) * o.r * 0.8, o.y + Math.sin(a) * o.r * 0.8]; }), o.c < 0.3 ? "#efe9dd" : "#e2b39a", { stroke: "rgba(60,50,40,.5)", "stroke-width": 0.6 });
          } else if (tex === "charbon") {                                        // tissus végétaux écrasés, qui noircissent
            d += `<rect x="${r1(o.x - o.r * 2)}" y="${r1(o.y - o.r * 0.4 * (1 - 0.6 * e))}" width="${r1(o.r * 4)}" height="${r1(o.r * 0.8 * (1 - 0.6 * e))}" fill="${melange("#8a6a3f", "#1f1a17", e)}" transform="rotate(${r1((o.c - 0.5) * 20)} ${r1(o.x)} ${r1(o.y)})"/>`;
            for (let c2 = 0; c2 < 4; c2++) d += circ(o.x - o.r * 1.5 + c2 * o.r, o.y, o.r * 0.25 * (1 - 0.6 * e), melange("#b99468", "#2a2320", e), { opacity: op(1 - e) });
          } else if (tex === "diatomees") {
            d += ell(o.x, o.y, o.r, o.r * (o.c < 0.5 ? 1 : 0.35), "none", { stroke: melange("#9aa6a6", "#c9c3b4", e), "stroke-width": 1.2 }) + circ(o.x, o.y, o.r * 0.3, "none", { stroke: "#b8bfbf", "stroke-width": 0.6, opacity: op(1 - e * 0.7) });
          } else if (tex === "radiolaires") {
            const rr = o.r * 0.8;
            d += circ(o.x, o.y, rr, melange("#f1efe8", "#b8785f", e), { stroke: "rgba(90,60,50,.6)", "stroke-width": 0.8 });
            for (let sp = 0; sp < 6; sp++) { const a = sp / 6 * Math.PI * 2 + o.a; d += line(o.x + Math.cos(a) * rr, o.y + Math.sin(a) * rr, o.x + Math.cos(a) * rr * 1.6, o.y + Math.sin(a) * rr * 1.6, "rgba(90,60,50,.6)", 0.7, { opacity: op(1 - e * 0.8) }); }
          } else if (tex === "coccolithes") {
            const rr = o.r * 0.45;
            d += circ(o.x, o.y, rr, "#fbfaf6", { stroke: "#a9a293", "stroke-width": 0.6 });
            for (let sp = 0; sp < 8; sp++) { const a = sp / 8 * Math.PI * 2; d += line(o.x, o.y, o.x + Math.cos(a) * rr, o.y + Math.sin(a) * rr, "#cfc8b8", 0.4); }
          } else if (tex === "oolithes") {
            for (let c2 = 3; c2 >= 1; c2--) d += circ(o.x, o.y, o.r * 0.9 * c2 / 3 * (0.6 + 0.4 * k), c2 % 2 ? "#efe6cc" : "#dccfa9", { stroke: "rgba(120,100,70,.4)", "stroke-width": 0.5 });
          } else if (tex === "silex") {
            d += circ(o.x, o.y, o.r * 0.7, melange("#e9e6de", "#3b3a3d", e * (o.c < 0.8 ? 1 : 0.3)), { opacity: op(0.3 + 0.7 * k) });
          } else if (tex === "evaporite") {
            const rr = o.r * (0.3 + 0.9 * k);
            d += o.c < 0.5 ? `<rect x="${r1(o.x - rr * 0.35)}" y="${r1(o.y - rr)}" width="${r1(rr * 0.7)}" height="${r1(rr * 2)}" fill="#fbfaf6" stroke="#a9a293" stroke-width=".7" transform="rotate(${r1(o.a * 57)} ${r1(o.x)} ${r1(o.y)})"/>`
              : rect(o.x - rr * 0.8, o.y - rr * 0.8, rr * 1.6, rr * 1.6, o.c < 0.8 ? "#f6f3ee" : "#e9c9b8", { stroke: "#a9a293", "stroke-width": 0.7 });
          }
        }
        if (tex === "pseudotachylite") { const v = fen(t, 0.2, 0.5); d += `<path d="M${CX - RA} ${CY + 6} C${CX - 40} ${CY - 10} ${CX + 20} ${CY + 20} ${CX + RA} ${CY - 4}" fill="none" stroke="#1f1b18" stroke-width="${r1(1 + 7 * v)}"/>` + `<path d="M${CX - 10} ${CY + 8} L${CX + 6} ${CY + 50} L${CX + 2} ${CY + 70}" fill="none" stroke="#1f1b18" stroke-width="${r1(3 * v)}"/>`; }
        if (tex === "rubane") { const n = Math.floor(e * 16); for (let k = 0; k < n; k++) d += rect(CX - RA, CY + RA - (k + 1) * 12, 2 * RA, 12, k % 2 ? "#a8452a" : "#b9b4ad", { stroke: "rgba(0,0,0,.15)", "stroke-width": 0.5 }); }
        // ciment ou matrice qui durcit : voile de couleur qui gagne
        if (p.ciment) d += rect(CX - RA, CY - RA, 2 * RA, 2 * RA, p.ciment, { opacity: op(e * 0.35) });
        let s = L.dans(d) + L.bord;
        (p.lignes || []).forEach((l, i) => { s += txt(268, 58 + i * 12, l, { petit: true }); });
        (p.legende || []).forEach(([c, n], i) => { s += rect(268, 136 + i * 14, 10, 10, c, { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }) + `<text x="283" y="${145 + i * 14}" class="fa-leg">${n}</text>`; });
        if (p.jauge) {
          const v = lerp(p.jauge.de, p.jauge.a, e);
          s += rect(420, 60, 12, 130, "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 4 }) + rect(421, 60 + 130 * (1 - v / 100), 10, 130 * v / 100, p.jauge.couleur || "#c0392b", { opacity: 0.7 });
          s += txt(426, 52, `${nombre(v)} ${p.jauge.unite || "%"}`, { a: "middle", petit: true }) + txt(426, 204, p.jauge.nom, { a: "middle", petit: true });
        }
        if (p.thermo) { const T = lerp(p.thermo[0], p.thermo[1], e); s += thermometre(452, 60, 110, T, 0, Math.ceil((Math.max(...p.thermo) + 50) / 100) * 100, []) + txt(452, 50, `${nombre(T)} °C`, { a: "middle", petit: true }); }
        s += txt(470, 230, p.duree || "", { a: "end", petit: true });
        return s;
      },
    };
  };

  // ───────────── texture de la FICHE dans les animations (24/09/2026 : « la vue au microscope est différente de ce qui est
  // présenté sur le graphique plus bas ») : la loupe reprend le schéma de texture de la fiche (Textures.tirage, même
  // tirage, mêmes couleurs), posé une fois dans des <defs> et rappelé par <use> (redessiné sans coût).
  function texFiche(roche) { try { const T = roche && window.Textures && Textures.tirage(roche); return T ? T.res : null; } catch (e) { return null; } }
  function texDefs(res, id) { return `<defs><g id="${id}">${res.corps}</g></defs>`; }
  // la texture (420 × 252) centrée sur (cx, cy), à la hauteur 2r ; sy > 1 l'étire verticalement (ponces pas encore écrasées)
  function texUse(id, cx, cy, r, sy = 1) {
    const k = 2 * r / 252 * 1.02;
    return `<use href="#${id}" transform="translate(${r1(cx)} ${r1(cy)}) scale(${Math.round(k * 1000) / 1000} ${Math.round(k * sy * 1000) / 1000}) translate(-210 -126)"/>`;
  }
  const lignesFiche = (res) => res.legende.groupes.flatMap((g) => g.lignes.map((l) => [l.couleur, l.nom]));
  function legendeListe(lignes, x, y, pas = 12) {
    return lignes.map(([c, n], i) => rect(x, y + i * pas - 8, 9, 9, c, { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }) + `<text x="${x + 13}" y="${y + i * pas}" class="fa-leg">${n}</text>`).join("");
  }

  // vue au microscope = texture de la FICHE ; p.alteration : le verre se change peu à peu en argiles (voile brun) et des
  // zéolites poussent dans les vides (tuf)
  function microFiche(p, res) {
    const R = alea("mf" + p.graine), gid = nid("mf");
    const CX = 132, CY = 124, RA = 98, L = loupe(CX, CY, RA, { fond: "#d9d1c3" });
    const zeo = Array.from({ length: 40 }, () => ({ x: CX - 90 + R() * 180, y: CY - 90 + R() * 180, r: 1.5 + R() * 2, a: R() * 90, ph: R() * 0.5 }));
    const fond = rect(0, 0, W, H, "#f3f1ea") + texDefs(res, gid) + txt(CX, 16, p.titre || "Au microscope", { a: "middle" }) + L.fond;
    const lignes = lignesFiche(res).concat(p.legendePlus || []);
    return {
      fond,
      anim(t) {
        const e = fen(t, 0.05, 0.92);
        let d = texUse(gid, CX, CY, RA);
        if (p.alteration) {
          d += rect(CX - RA, CY - RA, 2 * RA, 2 * RA, "#a8865c", { opacity: op(e * 0.38) });
          for (const z of zeo) { const k = fen(t, 0.3 + z.ph, 0.6 + z.ph); if (k > 0.02) d += `<rect x="${r1(z.x - z.r * k)}" y="${r1(z.y - z.r * k * 0.5)}" width="${r1(2 * z.r * k)}" height="${r1(z.r * k)}" fill="#ffffff" stroke="#9c9486" stroke-width=".5" transform="rotate(${r1(z.a)} ${r1(z.x)} ${r1(z.y)})"/>`; }
        }
        let s = L.dans(d) + L.bord + txt(CX, CY + RA + 12, "même vue que le schéma de texture de la fiche", { a: "middle", petit: true });
        (p.lignes || []).forEach((l, i) => { s += txt(250, 40 + i * 12, l, { petit: true }); });
        s += legendeListe(lignes, 250, 110, 12);
        if (p.jauge) {
          const v = lerp(p.jauge.de, p.jauge.a, e);
          s += rect(448, 60, 12, 130, "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 4 }) + rect(449, 60 + 130 * (1 - v / 100), 10, 130 * v / 100, p.jauge.couleur || "#c0392b", { opacity: 0.7 });
          s += txt(454, 52, `${nombre(v)} ${p.jauge.unite || "%"}`, { a: "middle", petit: true }) + txt(454, 204, p.jauge.nom, { a: "middle", petit: true });
        }
        s += txt(470, 230, p.duree || "", { a: "end", petit: true });
        return s;
      },
    };
  }

  // kimberlite, dernière étape (24/09/2026 : « la diapo 4 manque un peu d'infos ») : la roche d'aujourd'hui (texture de la
  // fiche) et POURQUOI les diamants ont survécu — diagramme graphite / diamant (limite de Kennedy et Kennedy 1976 :
  // P (GPa) ≈ 1,94 + 0,0025 × T (°C), 1 GPa ≈ 30 km) : le magma naît dans le domaine du diamant ; en remontant il entre
  // dans celui du graphite, mais en quelques heures la transformation n'a pas le temps de se faire ; une remontée lente
  // et chaude (péridotites de Beni Bousera, Maroc) change les diamants en graphite.
  SCENES.kimberliteDiamants = function (p, roche) {
    const res = texFiche(roche), gid = nid("kt");
    const CX = 92, CY = 122, RA = 76, L = loupe(CX, CY, RA, { fond: "#5f6b5a" });
    const X0 = 318, X1 = 468, Y0 = 44, Y1 = 196;
    const X = (T) => X0 + T / 1500 * (X1 - X0), Y = (z) => Y0 + z / 250 * (Y1 - Y0);
    const zK = (T) => 30 * (1.94 + 0.0025 * T);
    const lim = []; for (let T = 0; T <= 1500; T += 50) lim.push([X(T), Y(zK(T))]);
    const vite = courbe([[X(1300), Y(200)], [X(1250), Y(150)], [X(1150), Y(80)], [X(1050), Y(20)], [X(1000), Y(0)]], 8);
    vite.push([X(15), Y(0)]);
    const lent = courbe([[X(1300), Y(200)], [X(1280), Y(140)], [X(1230), Y(100)], [X(1180), Y(78)]], 8);
    let fond = rect(0, 0, W, H, "#f3f1ea") + (res ? texDefs(res, gid) : "") + L.fond + L.dans(res ? `<use href="#${gid}" transform="translate(${CX} ${CY}) scale(${Math.round(2 * RA / 252 * 1.02 * 1000) / 1000}) translate(-210 -126)"/>` : "") + L.bord;
    fond += txt(CX, 22, "la kimberlite aujourd'hui, sciée", { a: "middle", petit: true }) + txt(CX, 33, "(même vue que le schéma de texture)", { a: "middle", petit: true });
    if (res) fond += legendeListe(lignesFiche(res), 176, 58);
    fond += txt(176, 118, "diamants : moins d'un gramme", { petit: true }) + txt(176, 129, "par tonne, invisibles ici", { petit: true });
    fond += txt(176, 152, "« Big Hole » de Kimberley :", { petit: true }) + txt(176, 163, "la cheminée, creusée", { petit: true }) + txt(176, 174, "à la main de 1871 à 1914", { petit: true });
    // diagramme
    fond += poly(lim.concat([[X1, Y1], [X0, Y1]]), "#dde9f2") + poly(lim.concat([[X1, Y0], [X0, Y0]]), "#e7e3db");
    fond += pline(lim, "#27302d", 1.2) + rect(X0, Y0, X1 - X0, Y1 - Y0, "none", { stroke: "#27302d", "stroke-width": 1 });
    for (const z of [0, 100, 200]) fond += line(X0 - 3, Y(z), X0, Y(z), "#27302d", 1) + txt(X0 - 5, Y(z) + 3, `${z} km`, { a: "end", petit: true });
    for (const T of [0, 500, 1000, 1500]) fond += line(X(T), Y1, X(T), Y1 + 3, "#27302d", 1) + txt(X(T), Y1 + 12, nombre(T), { a: "middle", petit: true });
    fond += txt((X0 + X1) / 2, Y1 + 23, "température (°C)", { a: "middle", petit: true });
    fond += txt(X0 + 5, Y0 + 12, "graphite stable", { petit: true }) + txt(X1 - 4, Y1 - 6, "diamant stable", { a: "end", petit: true });
    fond += txt((X0 + X1) / 2, Y0 - 8, "Diamant ou graphite ?", { a: "middle" });
    return {
      fond,
      anim(t) {
        let s = "";
        const u = fen(t, 0.05, 0.6), q = lePlong(vite, u);
        s += pline(partiel(vite, u), "#c0392b", 2);
        s += poly([[q.x, q.y - 5], [q.x + 4, q.y], [q.x, q.y + 5], [q.x - 4, q.y]], "#e9f4fb", { stroke: "#2b6ea3", "stroke-width": 1 });
        s += txt(X(1300) - 6, Y(200) + 4, "naissance", { a: "end", petit: true });
        if (u > 0.45) s += txt(X(600), Y(40), "remontée en quelques heures :", { a: "middle", petit: true, op: fen(t, 0.3, 0.36) })
          + txt(X(600), Y(40) + 11, "pas le temps de se transformer", { a: "middle", petit: true, op: fen(t, 0.3, 0.36) });
        const v = fen(t, 0.62, 0.85);
        if (v > 0) {
          const ql = lePlong(lent, v);
          s += pline(partiel(lent, v), "#6d6a66", 1.4, { "stroke-dasharray": "3 2" });
          s += poly(Array.from({ length: 6 }, (_, i) => [ql.x + Math.cos(i * 1.047) * 4, ql.y + Math.sin(i * 1.047) * 4]), v > 0.9 ? "#2a2a2a" : "#9fb2c2", { stroke: "#2a2a2a", "stroke-width": 0.8 });
          s += txt(X1 - 4, Y(120), "remontée lente et chaude :", { a: "end", petit: true, op: fen(t, 0.8, 0.88) }) + txt(X1 - 4, Y(120) + 11, "il redevient graphite", { a: "end", petit: true, op: fen(t, 0.8, 0.88) });
        }
        return s;
      },
    };
  };

  // ignimbrite, soudure (24/09/2026 : « pas assez détaillée ») : le dépôt de l'étape précédente, en coupe — il se tasse ;
  // son cœur, resté au-dessus d'environ 600 °C, se soude (les ponces s'écrasent en flammèches noires) ; le haut et la base,
  // refroidis plus vite, restent meubles ; en refroidissant, le cœur se débite en prismes. Loupe = texture de la fiche,
  // d'abord étirée verticalement (ponces encore rondes), puis écrasée à sa forme réelle.
  SCENES.soudureIgnimbrite = function (p, roche) {
    const R = alea("si" + p.graine), res = texFiche(roche), gid = nid("st");
    const BAS = 214, H0 = 120, XL = 16, XR = 222;
    const CX = 404, CY = 92, RA = 60, L = loupe(CX, CY, RA, { vers: [170, 168], fond: "#cdb7a3" });
    const ponces = Array.from({ length: 34 }, () => ({ x: XL + 6 + R() * (XR - XL - 12), f: 0.12 + R() * 0.8, r: 2 + R() * 3 }));
    const cristaux = Array.from({ length: 40 }, () => ({ x: XL + 4 + R() * (XR - XL - 8), f: R(), r: 0.8 + R() * 0.8 }));
    const fond = rect(0, 0, W, H, "#f3f1ea") + (res ? texDefs(res, gid) : "") + rect(XL - 6, BAS, XR - XL + 12, H - BAS, "#8c7a64")
      + txt(XL, H - 10, "ancien sol, cuit par le dépôt", { petit: true, clair: true }) + txt(XL, 18, "le dépôt de nuées ardentes, en coupe");
    return {
      fond,
      anim(t) {
        const e = fen(t, 0.05, 0.85), soude = fen(t, 0.1, 0.7), prisme = fen(t, 0.55, 0.95);
        const h = H0 * (1 - 0.3 * soude), top = BAS - h;
        const zone = (f) => BAS - f * h;                              // f = hauteur relative dans le dépôt
        const T = lerp(700, 40, e);
        let s = rect(XL, top, XR - XL, h, "#e3d6c1");
        // cœur soudé : de plus en plus sombre et dense
        s += rect(XL, zone(0.78), XR - XL, zone(0.15) - zone(0.78), melange("#e3d6c1", "#9c8f80", soude));
        for (const c of cristaux) s += rect(c.x, zone(c.f) - c.r, c.r * 2, c.r * 1.4, "#f4f1ea", { stroke: "rgba(60,50,40,.4)", "stroke-width": 0.4 });
        for (const q of ponces) {
          const coeur = q.f > 0.15 && q.f < 0.78, k = coeur ? soude : 0.12 * soude;
          s += ell(q.x, zone(q.f), q.r * lerp(1, 2.8, k), q.r * lerp(0.9, 0.22, k), coeur ? melange("#efe9df", "#3a332e", soude) : "#efe9df", { stroke: "rgba(60,55,50,.5)", "stroke-width": 0.5 });
        }
        // prismes de refroidissement dans le cœur soudé
        if (prisme > 0) for (let x = XL + 14; x < XR - 6; x += 17) s += line(x, zone(0.78), x + 1, lerp(zone(0.78), zone(0.15), prisme), "rgba(40,34,28,.6)", 1);
        s += rect(XL, top, XR - XL, h, "none", { stroke: "#6f6254", "stroke-width": 1 });
        // cotes et étiquettes
        s += txt(XR + 6, zone(0.9), "haut : refroidi vite,", { petit: true }) + txt(XR + 6, zone(0.9) + 11, "resté meuble", { petit: true });
        s += txt(XR + 6, zone(0.47), "cœur soudé :", { petit: true, op: fen(t, 0.2, 0.3) }) + txt(XR + 6, zone(0.47) + 11, "ponces écrasées", { petit: true, op: fen(t, 0.2, 0.3) })
          + txt(XR + 6, zone(0.47) + 22, "en flammèches", { petit: true, op: fen(t, 0.2, 0.3) });
        s += txt(XR + 6, zone(0.06) + 3, "base : meuble", { petit: true });
        s += line(XL - 8, BAS, XL - 8, top, "#27302d", 1) + txt(XL - 4, top - 5, soude < 0.2 ? "épaisseur au dépôt" : "le dépôt se tasse d'un tiers", { petit: true });
        if (prisme > 0.3) s += txt((XL + XR) / 2, zone(0.47) + 3, "prismes de refroidissement", { a: "middle", petit: true, clair: true, op: fen(t, 0.7, 0.8) });
        // loupe : texture de la fiche, écrasée peu à peu
        const sy = lerp(2.3, 1, soude);
        s += L.fond + L.dans(res ? `<use href="#${gid}" transform="translate(${CX} ${CY}) scale(${Math.round(2 * RA / 252 * 1.02 * 1000) / 1000} ${Math.round(2 * RA / 252 * 1.02 * sy * 1000) / 1000}) translate(-210 -126)"/>` : "") + L.bord;
        s += txt(CX, CY + RA + 14, "le cœur soudé, scié et poli", { a: "middle", petit: true }) + txt(CX, CY + RA + 25, "(même vue que la texture)", { a: "middle", petit: true });
        if (res) s += legendeListe([["#3a332e", "ponces écrasées : fiammes"], ["#e9e4da", "fragments de cristaux"], ["#cdb7a3", "échardes et cendre"]], CX - 60, CY + RA + 42, 11);
        s += thermometre(150, 30, 44, T, 0, 800, [600]) + txt(136, 50, `${nombre(T)} °C`, { a: "end", petit: true });
        s += txt(196, 38, "au-dessus de 600 °C,", { petit: true }) + txt(196, 49, "le verre est mou", { petit: true });
        s += txt(470, 232, p.duree || "", { a: "end", petit: true });
        return s;
      },
    };
  };

  // éruption à ignimbrite, refaite (24/09/2026 : « c'est un peu grossier ») : colonne plinienne (jet de gaz, colonne qui
  // monte en volutes, nuage en parapluie, ponces qui retombent) → la colonne devient trop lourde et s'effondre en fontaine →
  // nuées ardentes : une partie basale dense qui épouse le relief et comble les vallées, un nuage de cendres turbulent
  // par-dessus, des panaches qui s'élèvent du dépôt ; la chambre se vide et le sommet s'effondre (caldeira).
  function eruptionIgnimbrite(p) {
    const R = alea("ig" + p.graine);
    const SOL = 178, XV = 96, HV = 66, RV = 84;
    const relief0 = (x) => {
      const d = Math.abs(x - XV), v = d < RV ? HV * Math.pow(1 - d / RV, 1.2) : 0;
      return SOL - v - (x > XV + 40 ? 9 + 10 * Math.sin((x - 180) / 27) : 0) * clamp((x - XV - 40) / 60);
    };
    const NIV = SOL - 15;                                             // niveau atteint par le dépôt dans les vallées
    const volutes = Array.from({ length: 22 }, (_, i) => ({ ph: i / 22, dx: (R() - 0.5) * 10, r: 6 + R() * 5 }));
    const chute = Array.from({ length: 60 }, () => ({ x: 30 + R() * 440, ph: R() }));
    const fontaine = Array.from({ length: 18 }, () => ({ ph: R(), sg: R() < 0.35 ? -1 : 1, v: 0.6 + R() * 0.6 }));
    const ponces = Array.from({ length: 50 }, () => ({ x: XV + 30 + R() * 360, f: R() }));
    return {
      fond: ciel(H),
      anim(t, ta) {
        const pl = fen(t, 0.02, 0.1) * (1 - fen(t, 0.33, 0.45)), eff = fen(t, 0.3, 0.42) * (1 - fen(t, 0.78, 0.9));
        const nu = fen(t, 0.36, 0.8), cald = fen(t, 0.5, 0.85);
        const relief = (x) => { const d = Math.abs(x - XV); return relief0(x) + (d < 26 ? 22 * cald * Math.pow(1 - d / 26, 0.5) : 0); };
        const front = lerp(XV + 20, W + 30, 1 - Math.pow(1 - nu, 1.6));
        const ep = fen(t, 0.45, 0.95);
        const depot = (x) => x < XV + 36 || x > front ? relief(x) : Math.min(relief(x), lerp(relief(x), NIV, ep)) - (relief(x) < NIV ? 1.5 * ep : 0);
        const S = []; for (let x = 0; x <= W; x += 3) S.push([x, relief(x)]);
        let s = "";
        // sous-sol : chambre magmatique qui se vide, conduit
        s += poly(S.concat([[W, H + 2], [0, H + 2]]), "#8c8272");
        const rx = lerp(60, 34, fen(t, 0.1, 0.85));
        s += ell(XV, 232, rx, 18, MAGMA, { opacity: 0.9 }) + rect(XV - 3, relief(XV), 6, 222 - relief(XV), melange(MAGMA, "#5a4a40", fen(t, 0.85, 0.98)));
        if (cald > 0) for (const sg of [-1, 1]) s += line(XV + sg * 26, relief(XV + sg * 26), XV + sg * 30, 218, "#3f352e", 1, { opacity: op(cald), "stroke-dasharray": "3 2" });
        // dépôt : comble les vallées, voile mince sur les collines
        if (ep > 0) {
          const D = []; for (let x = XV + 30; x <= Math.min(W, front); x += 3) D.push([x, depot(x)]);
          const B = D.map(([x]) => [x, relief(x) + 0.5]).reverse();
          if (D.length > 1) s += poly(D.concat(B), melange("#eea062", "#e6d8bd", fen(t, 0.7, 1)), { stroke: "#a8987d", "stroke-width": 0.8 });
          for (const q of ponces) { const x = q.x; if (x < front && relief(x) - depot(x) > 3) s += circ(x, lerp(depot(x), relief(x), 0.3 + q.f * 0.5), 1, "#fbf7ee", { opacity: 0.8 }); }
        }
        // colonne plinienne : jet, volutes qui montent, parapluie, ponces qui retombent
        const top = relief(XV);
        if (pl > 0) {
          s += poly([[XV - 3, top], [XV - 9, top - 30], [XV + 9, top - 30], [XV + 3, top]], "#9c958e", { opacity: op(pl) });
          for (const v of volutes) { const u = (v.ph + ta * 0.09) % 1, y = lerp(top - 26, 30, u), r = v.r + u * 14; s += circ(XV + v.dx * (0.4 + u) + Math.sin(u * 9 + v.ph * 6) * 3, y, r, u < 0.5 ? "#8f8a85" : "#a09b96", { opacity: op(pl * 0.75) }); }
          s += ell(XV + 50 + 30 * fen(t, 0.05, 0.35), 28, 60 + 110 * fen(t, 0.04, 0.3), 12, "#9a958f", { opacity: op(pl * 0.9) });
          for (const c of chute) { const u = (c.ph + ta * 0.3) % 1; if (c.x < XV + 50 + 150 * fen(t, 0.05, 0.3)) s += circ(c.x, lerp(38, relief(c.x) - 1, u), 0.9, "#f1ece1", { opacity: op(pl * Math.sin(u * Math.PI)) }); }
          const lb = pl * (1 - fen(t, 0.26, 0.3));
          s += txt(XV + 24, 70, "colonne plinienne", { petit: true, op: lb }) + txt(XV + 24, 81, p.hauteurColonne ? `(${p.hauteurColonne})` : "", { petit: true, op: lb });
          s += txt(XV + 150, 60, "nuage en parapluie : les ponces retombent", { petit: true, op: lb });
        }
        // effondrement de la colonne : fontaine qui retombe autour de la bouche
        if (eff > 0) for (const f of fontaine) {
          const u = (f.ph + ta * 0.35) % 1, x = XV + f.sg * u * 46 * f.v, y = top - 10 - Math.sin(u * Math.PI) * 40 * f.v;
          s += circ(x, Math.min(y, relief(x) - 6), 7 + u * 6, "#a39d95", { opacity: op(eff * 0.7) });
        }
        // nuées ardentes : base dense + nuage turbulent + panaches qui s'élèvent du dépôt
        if (nu > 0 && nu < 1.2) {
          const vis = 1 - fen(t, 0.86, 0.96);
          const bas = []; for (let x = XV + 20; x <= Math.min(front, W + 10); x += 3) bas.push([x, relief(x)]);
          if (bas.length > 1) {
            const h = (x) => 4 + 7 * clamp((x - XV) / 80) * (0.6 + 0.4 * clamp((front - x) / 40));
            s += poly(bas.map(([x, y]) => [x, Math.min(y, depot(x)) - h(x)]).concat(bas.slice().reverse()), "#b7a992", { opacity: op(0.9 * vis) });
          }
          for (let k = 0; k < 14; k++) {
            const x = lerp(XV + 30, front, k / 13), w = (ta * 0.5 + k * 0.29) % 1, r = 8 + (k / 13) * 10 + w * 6;
            s += circ(x + Math.sin(ta * 1.3 + k) * 3, Math.min(relief(x), depot(x)) - 10 - r * 0.6 - w * 6, r, "#a8a39c", { opacity: op(0.55 * vis * (1 - w * 0.5)) });
          }
          for (let k = 0; k < 3; k++) { const x = XV + 120 + k * 100; if (x < front - 30) for (let j = 0; j < 4; j++) { const w = (ta * 0.12 + j / 4 + k * 0.2) % 1; s += circ(x + Math.sin(w * 5) * 4, NIV - 20 - w * 90, 8 + w * 12, "#b3aea8", { opacity: op(0.4 * (1 - w) * fen(t, 0.5, 0.6) * (1 - fen(t, 0.88, 0.97))) }); } }
          s += txt(Math.min(front - 10, 430), NIV - 34, "nuées ardentes", { a: "end", petit: true, op: fen(t, 0.4, 0.46) * vis });
          s += txt(Math.min(front - 10, 430), NIV - 23, "(plus de 100 km/h, 600 à 800 °C)", { a: "end", petit: true, op: fen(t, 0.4, 0.46) * vis });
        }
        if (cald > 0.3) s += txt(XV, 232, "la chambre se vide : le sommet s'effondre", { a: "middle", petit: true, clair: true, op: fen(t, 0.62, 0.7) });
        s += txt(330, 150, "l'ignimbrite comble les vallées", { a: "middle", petit: true, op: fen(t, 0.86, 0.94) });
        s += txt(240, 14, t < 0.32 ? "l'éruption explose : cendres et ponces montent en colonne" : t < 0.45 ? "trop lourde, la colonne s'effondre en fontaine" : "les nuées ardentes dévalent et comblent le relief", { a: "middle" });
        s += compteur(412, 42, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }

  // ───────────── détritiques (18/09/2026) ─────────────
  // torrent et cône de déjection : un relief s'érode sous l'orage, le torrent roule galets et graviers et les étale en cône
  // à son pied (T 0–0,5 : érosion et transport ; 0,5–1 : le cône grandit, lit après lit). p : relief ("montagne" | "granite"),
  // climat ("sec" | "humide"), soulevement, ages, labRelief
  function torrentCone(p, T0, T1) {
    const R = alea("tc" + p.graine);
    const SOL = 190, XA = 200, relief = p.relief || "montagne";
    const COUL = relief === "granite" ? ["#e8d9ca", "#e2b39a", "#f1ece2", "#cdbba6"] : ["#b5aa98", "#9c9384", "#d4c7ae", "#8a7f70"];
    const galets = Array.from({ length: 44 }, () => ({ ph: R(), r: 1.4 + R() * 2.4, c: COUL[Math.floor(R() * COUL.length)], dx: (R() - 0.5) * 60 }));
    const clipF = nid("tcf");
    return {
      fond: ciel(SOL),
      anim(t, ta) {
        const T = lerp(T0, T1, t), er = fen(T, 0.02, 0.5), co = fen(T, 0.45, 0.98);
        const hM = (relief === "granite" ? 110 : 150) * (1 - 0.12 * er) + (p.soulevement ? 10 * er : 0);
        const mont = (x) => SOL - hM * Math.pow(clamp((XA - x) / 180), 0.9) * (relief === "granite" ? 1 : 1 + 0.1 * Math.sin(x / 7)) * (x < XA ? 1 : 0);
        const M = []; for (let x = 0; x <= XA; x += 4) M.push([x, mont(x)]);
        let s = poly(M.concat([[XA, SOL], [0, SOL]]), relief === "granite" ? "#c9b8a3" : "#9a8e7c");
        if (relief === "granite") for (let k = 0; k < 7; k++) { const x = 20 + k * 25; s += ell(x, mont(x) + 4, 10, 7, "#d9ccbb", { stroke: "#8f8578", "stroke-width": 0.8 }); }
        s += rect(0, SOL, W, H - SOL, "#a89d88");
        // le cône, lit après lit, du sommet (apex) vers la plaine
        const ep = 40 * co;
        if (ep > 0.5) {
          const cone = []; for (let x = XA - 10; x <= W; x += 4) cone.push([x, SOL - ep * Math.max(0, 1 - (x - XA + 10) / 260)]);
          s += `<clipPath id="${clipF}"><polygon points="${P(cone.concat([[W, SOL], [XA - 10, SOL]]))}"/></clipPath>` + poly(cone.concat([[W, SOL], [XA - 10, SOL]]), "#c7b89c");
          s += `<g clip-path="url(#${clipF})">`;
          for (let k = 1; k < 8; k++) s += pline(cone.map(([x, y]) => [x, SOL - (SOL - y) * k / 8]), "rgba(90,75,55,.35)", 0.8);
          for (let k = 0; k < 60; k++) { const x = XA + (k * 37) % 260, y = SOL - ((k * 13) % 38); s += circ(x, y, 1 + (k % 3) * 0.6, COUL[k % 4]); }
          s += `</g>`;
        }
        // le torrent : lit, galets qui roulent vers l'aval
        const lit = []; for (let x = 60; x <= XA + 120; x += 6) lit.push([x, x < XA ? mont(x) + 2 : SOL - ep * Math.max(0, 1 - (x - XA + 10) / 260) - 1]);
        s += pline(lit, "#6d9fc4", 2.4, { opacity: 0.8 });
        for (const g of galets) { const u = (g.ph + ta * 0.22) % 1, q = lePlong(lit, u); s += circ(q.x + (u > 0.6 ? g.dx * (u - 0.6) : 0), q.y - 1.5, g.r, g.c, { stroke: "rgba(0,0,0,.3)", "stroke-width": 0.5 }); }
        // l'orage sur le relief (climat sec : soleil, orages rares et violents)
        if (p.climat === "sec") s += soleil(420, 36);
        s += `<g opacity="${op(p.climat === "sec" ? 0.7 * (0.5 + 0.5 * Math.sin(ta * 0.8)) : 0.9)}">${nuage(80 + 1.2 * ta, 28, 0.9) + pluie(56 + 1.2 * ta, 36, 56, 70, ta, 12, "tc1")}</g>`;
        if (p.soulevement) for (const x of [40, 110]) s += fleche(x, H - 8, x, H - 28, { c: "#c0392b", sw: 2, pointe: 7, op: 0.7 });
        s += txt(20, SOL + 20, p.labRelief || "relief qui se soulève", { petit: true, clair: true });
        s += txt(250, 62, T < 0.5 ? "les orages arrachent des blocs ; le torrent roule galets et graviers" : "au pied du relief, ils s'étalent en cône de déjection", { a: "middle" });
        s += txt(W - 8, SOL - 8, "cône", { a: "end", petit: true, op: co });
        s += compteur(404, 14, p.ages ? lerp(p.ages[0], p.ages[1], T) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.torrentErosion = (p) => torrentCone(p, 0, 0.5);
  SCENES.torrentCone = (p) => torrentCone(p, 0.5, 1);

  // turbidites : du sable s'accumule au rebord du plateau, puis s'effondre en avalanche sous-marine (courant de turbidité)
  // qui dévale la pente et dépose au fond un banc GRANOCLASSÉ (grossier en bas, fin en haut) ; puis des centaines de bancs.
  function turbidite(p, T0, T1) {
    const R = alea("tu" + p.graine);
    const MER = 30, fondY = (x) => x < 150 ? 86 : x < 270 ? lerp(86, 196, (x - 150) / 120) : 196;
    const eauG = degrade("#6ea9c9", "#2c5f86");
    return {
      fond: `<defs>${eauG.def}</defs>` + rect(0, 0, W, H, eauG.url) + poly(Array.from({ length: 121 }, (_, i) => [i * 4, fondY(i * 4)]).concat([[W, H], [0, H]]), "#7c7466")
        + txt(20, 80, "plateau", { petit: true, clair: true }) + txt(200, 150, "pente", { petit: true, clair: true }) + txt(300, 230, "fond du bassin, 2 à 4 km d'eau", { petit: true, clair: true }),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        let s = "";
        const nb = T < 0.5 ? (T > 0.35 ? 1 : 0) : 1 + Math.floor((T - 0.5) / 0.5 * 22);
        // bancs déjà déposés au fond : sable granoclassé (foncé en bas) puis boue
        let y = 196;
        for (let k = 0; k < nb; k++) {
          const e1 = 3.2, e2 = 1.6;
          const g = degrade("#e9dcc0", "#8f7c62");
          s += `<defs>${g.def}</defs>` + rect(270, y - e1, W - 270, e1, g.url) + rect(270, y - e1 - e2, W - 270, e2, "#6d6a5f");
          y -= e1 + e2;
        }
        // tas de sable au rebord du plateau, puis avalanche
        const cyc = T < 0.5 ? T / 0.5 : ((T - 0.5) / 0.5 * 22) % 1;
        const tas = 14 * clamp(cyc / 0.45);
        if (cyc < 0.5) s += poly([[110, 86], [150, 86 - tas], [158, 88]], "#d8c7a4");
        else {
          const u = clamp((cyc - 0.5) / 0.45), x = lerp(150, 470, u), yy = fondY(Math.min(x, 470)) - 8;
          for (let k = 0; k < 5; k++) s += circ(x - k * 16, yy - (k % 2) * 4 + (k > 2 ? 3 : 0), 12 - k * 1.5, "#b3a58c", { opacity: op(0.8 - k * 0.12) });
          s += txt(x, yy - 22, "courant de turbidité", { a: "middle", petit: true, op: T < 0.5 ? 1 : 0 });
        }
        // loupe d'un banc (étape 1) : grossier en bas, fin en haut
        if (T < 0.5 && T > 0.36) {
          const L = loupe(400, 110, 44, { fond: "#8f7c62" });
          let d = ""; for (let k = 0; k < 70; k++) { const yy = 70 + (k % 10) * 8, rr = lerp(3.4, 0.8, (k % 10) / 9); d += circ(362 + Math.floor(k / 10) * 12 + (k % 3), 150 - (k % 10) * 8, rr, "#efe6d2"); }
          s += `<g opacity="${op(fen(T, 0.36, 0.42))}">` + L.fond + L.dans(d) + L.bord + txt(400, 166, "grossier en bas, fin en haut :", { a: "middle", petit: true }) + txt(400, 177, "un banc granoclassé", { a: "middle", petit: true }) + `</g>`;
        }
        if (T >= 0.5) s += txt(W - 8, y - 8, `${nombre(nb)} bancs : grès et pélites alternent`, { a: "end", petit: true, clair: true });
        s += txt(200, 16, T < 0.5 ? "le sable s'accumule au rebord du plateau, puis dévale la pente" : "chaque avalanche dépose un banc ; la boue retombe entre deux", { a: "middle", clair: true });
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], T) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.turbiditeAvalanche = (p) => turbidite(p, 0, 0.5);
  SCENES.turbiditeBancs = (p) => turbidite(p, 0.5, 1);

  // bassin d'avant-pays : la chaîne avance et pèse sur la plaque, qui FLÉCHIT ; le creux se remplit des débris de la chaîne
  // (molasse), en coin plus épais contre la chaîne. p : nomChaine, ages
  SCENES.avantPays = function (p) {
    const R = alea("ap" + p.graine);
    const SOL = 110;
    return {
      fond: ciel(SOL),
      anim(t, ta) {
        const e = fen(t, 0.04, 0.92), XC = lerp(120, 170, e);
        const flex = (x) => x < XC ? 60 * e : 60 * e * Math.exp(-(x - XC) / 150) * Math.cos((x - XC) / 150);
        const base = (x) => SOL + 14 + flex(x);
        let s = "";
        // la plaque (socle) qui fléchit
        s += poly(Array.from({ length: 121 }, (_, i) => [i * 4, base(i * 4)]).concat([[W, H], [0, H]]), "#8a8272");
        for (let k = 1; k < 5; k++) s += pline(Array.from({ length: 121 }, (_, i) => [i * 4, base(i * 4) + k * 18]), "rgba(50,45,38,.25)", 1);
        // la molasse : remplissage lit par lit, jusqu'au niveau de la plaine
        const n = Math.floor(e * 9);
        for (let k = 0; k < n; k++) { const fk = (k + 1) / 9; s += poly(Array.from({ length: 81 }, (_, i) => { const x = XC + i * (W - XC) / 80; return [x, Math.max(SOL + 2, base(x) - (base(x) - SOL - 2) * fk)]; }).concat(Array.from({ length: 81 }, (_, i) => { const x = W - i * (W - XC) / 80; return [x, base(x)]; })), k % 2 ? "#d7c6a0" : "#c3ae86"); }
        // la chaîne : un coin de roches qui avance et s'épaissit
        s += poly([[0, SOL + 70 * e], [0, 40 - 20 * e], [XC - 60, 30 - 10 * e], [XC + 10, SOL + 4], [XC + 20, base(XC + 20)], [0, H]], "#9c8f7e");
        for (let k = 0; k < 4; k++) s += line(20 + k * 30, 60 + k * 12, XC - 10 + k * 5, SOL + 20 + k * 14, "rgba(60,50,40,.4)", 1);
        s += fleche(20, 200, 70, 200, { sw: 3, pointe: 9, op: 0.8 });
        for (const x of [XC + 40, XC + 120]) s += fleche(x, SOL + 30, x, SOL + 30 + 22 * e, { c: "#c0392b", sw: 2, pointe: 7, op: 0.8 });
        // rivières qui descendent de la chaîne
        for (let k = 0; k < 10; k++) { const u = (k / 10 + ta * 0.25) % 1; s += circ(lerp(XC - 30, XC + 180, u), lerp(60, SOL - 1, Math.min(1, u * 1.6)), 1.4, "#6d9fc4"); }
        s += `<g opacity=".8">${nuage(60 + ta, 18, 0.8) + pluie(40 + ta, 26, 44, 30, ta, 8, "ap1")}</g>`;
        s += txt(40, 22, p.nomChaine || "la chaîne", { petit: true });
        s += txt(XC + 140, SOL + 50, "la plaque fléchit sous le poids de la chaîne", { a: "middle", petit: true, clair: true });
        s += txt(XC + 150, SOL - 8, "le creux se remplit : la molasse", { a: "middle", petit: true, op: fen(t, 0.3, 0.45) });
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // ───────────── roches chimiques et biochimiques (18/09/2026) ─────────────
  // lagune qui s'évapore : l'eau de mer entre par un seuil, le soleil l'évapore ; une JAUGE VERTICALE (échelle logarithmique)
  // montre la concentration par rapport à l'eau de mer et les seuils (carbonates × 2, gypse × 3,8, sel × 10,6, potasse × 65) ;
  // chaque minéral qui sature se dépose en lit sur le fond. p.jusqua : "gypse" | "halite" | "potasse" ; p.dolomie (la saumure
  // dense s'infiltre dans les boues calcaires et les change en dolomite) ; ages, libelleAge, lieu
  SCENES.bassinEvaporation = function (p) {
    const R = alea("be" + p.graine);
    const MER = 70, FOND = 190, XS = 90;
    const SEUILS = [[2, "carbonates", "#e7dcc0"], [3.8, "gypse", "#f2efe8"], [10.6, "sel (halite)", "#fbf8f4"], [65, "sels de potassium", "#e3a58f"]];
    const cible = { gypse: 5, halite: 30, potasse: 90 }[p.jusqua || "gypse"];
    const LG = (v) => Math.log10(v), yJ = (v) => 206 - LG(v) / LG(100) * 156;
    const vapeur = Array.from({ length: 14 }, () => ({ x: 120 + R() * 220, ph: R() }));
    const cristaux = Array.from({ length: 40 }, () => ({ x: 110 + R() * 250, ph: R(), r: 1 + R() * 1.4 }));
    return {
      fond: ciel(MER) + soleil(60, 34, 13),
      anim(t, ta) {
        const e = fen(t, 0.03, 0.9), conc = Math.pow(10, LG(cible) * e);
        let s = "";
        // la mer à gauche, le seuil, la lagune
        s += rect(0, MER, XS - 10, H - MER, "#4f8cb8") + poly([[XS - 20, H], [XS - 12, MER + 12], [XS + 8, MER + 10], [XS + 16, H]], "#bfae8a");
        const eau = melange("#7fb6d6", "#d9e3dc", clamp(LG(conc) / LG(100)));
        s += rect(XS + 12, MER + 2, 380 - XS - 12, FOND - MER - 2, eau) + rect(380, MER - 8, W - 380, H - MER + 8, "#c9b58f");
        s += rect(XS + 12, FOND, 380 - XS - 12, H - FOND, "#b9ad92");
        // lits déposés : chaque minéral saturé ajoute sa couche
        let y = FOND;
        for (const [v, nom, c] of SEUILS) {
          if (conc < v) break;
          const ep = Math.min(14, 14 * (LG(conc) - LG(v)) / 0.5);
          if (p.dolomie && nom === "carbonates") { s += rect(XS + 12, y - 10, 380 - XS - 12, 10, melange("#e7dcc0", "#d6b98a", fen(t, 0.55, 0.95))); y -= 10; continue; }
          s += rect(XS + 12, y - ep, 380 - XS - 12, ep, c, { stroke: "rgba(0,0,0,.08)" });
          y -= ep;
        }
        if (p.dolomie && t > 0.5) for (let k = 0; k < 6; k++) { const u = (ta * 0.3 + k / 6) % 1; s += fleche(140 + k * 36, FOND - 30 + u * 10, 140 + k * 36, FOND - 12 + u * 10, { c: "#7a5a2a", sw: 1.4, pointe: 5, op: 0.7 * Math.sin(u * Math.PI) }); }
        // évaporation et cristaux qui tombent
        for (const v of vapeur) { const u = (v.ph + ta * 0.3) % 1; s += `<path d="M${r1(v.x)} ${r1(MER - u * 30)} q3 -4 0 -8 q-3 -4 0 -8" fill="none" stroke="#9fc4dc" stroke-width="1.2" opacity="${op(Math.sin(u * Math.PI) * 0.8)}"/>`; }
        if (conc > 3.8) for (const c of cristaux) { const u = (c.ph + ta * 0.2) % 1; s += rect(c.x, lerp(MER + 6, y - 2, u), c.r * 1.6, c.r * 1.6, "#ffffff", { opacity: op(Math.sin(u * Math.PI) * 0.9) }); }
        // entrée d'eau de mer par-dessus le seuil (le bassin est réalimenté)
        for (let k = 0; k < 4; k++) { const u = (ta * 0.5 + k / 4) % 1; s += circ(lerp(XS - 18, XS + 20, u), MER + 8 + Math.sin(u * Math.PI) * -3, 1.6, "#cfe6f2"); }
        // la jauge de concentration
        s += rect(420, yJ(100), 12, yJ(1) - yJ(100), "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 3 }) + rect(421, yJ(conc), 10, yJ(1) - yJ(conc), "rgba(192,57,43,.45)");
        for (const [v, nom] of SEUILS) s += line(416, yJ(v), 436, yJ(v), conc >= v ? "#c0392b" : "#27302d", 1.2) + txt(440, yJ(v) + 3, `× ${String(v).replace(".", ",")}`, { petit: true });
        s += txt(426, 38, "concentration", { a: "middle", petit: true }) + txt(426, 48, "(× eau de mer)", { a: "middle", petit: true });
        s += poly([[418, yJ(conc)], [411, yJ(conc) - 4], [411, yJ(conc) + 4]], "#c0392b") + txt(408, yJ(conc) + 3, `× ${nombre(conc)}`, { a: "end", petit: true });
        const dernier = SEUILS.filter(([v]) => conc >= v).pop();
        s += txt(235, 20, dernier ? `${dernier[1]} : il précipite et se dépose` : "le soleil évapore l'eau ; la mer la remplace par le seuil", { a: "middle" });
        if (p.dolomie && t > 0.5) s += txt(235, FOND - 36, "la saumure dense s'infiltre : la calcite devient dolomite", { a: "middle", petit: true });
        s += txt(XS - 50, H - 10, "mer", { a: "middle", petit: true, clair: true }) + txt(XS + 30, MER + 14, "seuil", { petit: true });
        s += compteur(160, 58, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // diapir : enfoui sous des kilomètres de sédiments, le sel, moins dense et plastique, flue et monte en dôme
  SCENES.diapir = function (p) {
    const R = alea("di" + p.graine);
    const SOL = 40, S0 = 196;
    return {
      fond: ciel(SOL),
      anim(t, ta) {
        const e = fen(t, 0.05, 0.9), h = 110 * e;
        const toitSel = (x) => S0 - 10 - h * Math.exp(-(((x - 240) / (60 + 40 * (1 - e))) ** 2));
        let s = rect(0, SOL, W, H - SOL, "#b9ad95");
        const couche = (k) => Array.from({ length: 121 }, (_, i) => { const x = i * 4, y0 = SOL + 20 + k * 30, dz = Math.max(0, (S0 - 10 - toitSel(x)) - (S0 - 10 - y0)); return [x, Math.min(y0 - dz * 0.6 * (1 - k * 0.15), y0)]; });
        for (let k = 0; k < 5; k++) s += pline(couche(k), "rgba(70,60,45,.45)", 1.2);
        s += poly(Array.from({ length: 121 }, (_, i) => [i * 4, toitSel(i * 4)]).concat([[W, H], [0, H]]), "#f1ede8", { stroke: "#b8b0a4", "stroke-width": 1 });
        for (let k = 0; k < 20; k++) { const x = 180 + (k * 37) % 120, y = S0 - (k * 11) % (h + 8); s += pline([[x - 6, y], [x, y - 3], [x + 6, y]], "rgba(150,140,130,.5)", 0.8); }
        for (const x of [120, 360]) s += fleche(x, S0 + 20, 240 + (x < 240 ? -40 : 40), S0 + 10, { c: "#7a6d5c", sw: 1.6, pointe: 6, op: 0.6 * (1 - fen(t, 0.8, 0.95)) });
        s += txt(240, S0 - h - 18, p.texte || "le sel, moins dense et plastique, flue et monte", { a: "middle", op: fen(t, 0.2, 0.3) });
        s += txt(W - 8, H - 8, "couche de sel", { a: "end", petit: true }) + txt(12, SOL + 14, "sédiments plus récents", { petit: true });
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // marécage : forêt (fougères arborescentes du Carbonifère, ou sphaignes d'une tourbière) sur un sol gorgé d'eau ; les
  // végétaux morts tombent dans l'eau sans oxygène et s'accumulent en tourbe (T 0–0,5), puis le bassin s'enfonce et des
  // sables recouvrent la tourbe, qu'une nouvelle forêt recouvre à son tour (0,5–1). p.mode : "houiller" | "tourbiere" | "cretace"
  function marecage(p, T0, T1) {
    const R = alea("ma" + p.graine);
    const EAU = 150, mode = p.mode || "houiller";
    const arbres = Array.from({ length: mode === "tourbiere" ? 0 : 9 }, () => ({ x: 20 + R() * 440, h: 50 + R() * 50, ph: R() }));
    const debris = Array.from({ length: 30 }, () => ({ x: 20 + R() * 440, ph: R(), r: 3 + R() * 5, a: R() * 180 }));
    return {
      fond: ciel(EAU),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        const tourbe = 20 * fen(T, 0.02, 0.5), sub = fen(T, 0.5, 0.95);
        let s = rect(0, EAU, W, H - EAU, "#4e6b62");
        // pile : tourbe (brun sombre), puis sables (clairs) qui la recouvrent, puis nouvelle tourbe
        let y = H;
        s += rect(0, H - 30, W, 30, "#8a8272");
        y = H - 30;
        if (sub > 0) { s += rect(0, y - 12, W, 12, "#2d231c"); y -= 12; const sa = 14 * fen(sub, 0.1, 0.6); s += rect(0, y - sa, W, sa, "#cdbb95"); y -= sa; const t2 = 8 * fen(sub, 0.6, 1); s += rect(0, y - t2, W, t2, "#3b2e24"); y -= t2; }
        else { s += rect(0, y - tourbe, W, tourbe, "#3b2e24"); y -= tourbe; }
        for (const d of debris) { const u = (d.ph + ta * 0.1) % 1; if (sub < 0.2) s += `<rect x="${r1(d.x)}" y="${r1(lerp(EAU + 4, y - 2, u))}" width="${r1(d.r * 2)}" height="1.6" fill="#5b4632" transform="rotate(${r1(d.a)} ${r1(d.x)} ${r1(lerp(EAU + 4, y - 2, u))})" opacity="${op(Math.sin(u * Math.PI))}"/>`; }
        // la végétation
        if (mode === "tourbiere") for (let x = 6; x < W; x += 9) s += ell(x, EAU - 3, 6, 4, "#8aa35a") + ell(x + 3, EAU - 6, 3, 3, "#a3ba6c");
        else for (const a of arbres) {
          const tronc = mode === "houiller" ? "#5b4a32" : "#6b5a3e";
          s += rect(a.x - 2, EAU - a.h, 4, a.h, tronc);
          if (mode === "houiller") for (let k = 0; k < 6; k++) { const an = -Math.PI / 2 + (k - 2.5) * 0.45; s += line(a.x, EAU - a.h, a.x + Math.cos(an) * 22, EAU - a.h + Math.sin(an) * 22 + 12, "#4f7d3c", 3); }
          else s += ell(a.x, EAU - a.h - 8, 16, 14, "#4f7d3c");
        }
        // pluie tropicale ou fraîche
        s += `<g opacity=".7">${nuage(140 + 1.2 * ta, 26, 0.9) + pluie(118 + 1.2 * ta, 34, 50, EAU - 40, ta, 10, "ma1") + nuage(360 + ta, 20, 0.8)}</g>`;
        if (sub > 0) for (const x of [80, 240, 400]) s += fleche(x, H - 28, x, H - 8, { c: "#c0392b", sw: 2, pointe: 7, op: 0.7 });
        s += txt(W - 8, y + 10, sub > 0.5 ? "tourbe, sables, nouvelle tourbe" : "tourbe", { a: "end", petit: true, clair: true });
        s += txt(200, 16, T < 0.5 ? (p.texte1 || "dans l'eau sans oxygène, les végétaux morts ne pourrissent pas : la tourbe s'accumule") : (p.texte2 || "le bassin s'enfonce : des sables recouvrent la tourbe, une nouvelle forêt repousse"), { a: "middle" });
        s += compteur(412, 36, p.ages ? lerp(p.ages[0], p.ages[1], T) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.marecageForet = (p) => marecage(p, 0, 0.5);
  SCENES.marecageEnfouissement = (p) => marecage(p, 0.5, 1);

  // source à travertin : l'eau, chargée de CO₂ dans le sol, a dissous du calcaire ; à l'air libre le CO₂ s'échappe (bulles),
  // l'eau devient sursaturée et la calcite se dépose sur les mousses : les vasques et les barrages grandissent.
  // Jauge verticale : calcium dissous / seuil de saturation.
  SCENES.sourceTravertin = function (p) {
    const R = alea("st" + p.graine);
    const bulles = Array.from({ length: 30 }, () => ({ x: 150 + R() * 230, ph: R() }));
    const marches = [[150, 118], [210, 142], [270, 164], [330, 184], [390, 200]];
    return {
      fond: ciel(H) + poly([[0, 60], [140, 70], [150, 118], [0, H], [0, 60]], "#d9ceb3") + poly([[0, H], [150, 118], [480, 214], [480, H]], "#b8a98a")
        + txt(12, 80, "plateau calcaire", { petit: true }),
      anim(t, ta) {
        const e = fen(t, 0.04, 0.92);
        let s = rect(0, 0, 0, 0, "none");
        // la résurgence et la cascade
        s += ell(150, 116, 8, 5, "#6aa6cf");
        const trajet = [[150, 118]].concat(marches.slice(1)).concat([[480, 212]]);
        s += pline(trajet, "#7fb6d6", 5, { opacity: 0.85 });
        for (let k = 0; k < 16; k++) { const u = (k / 16 + ta * 0.3) % 1, q = lePlong(trajet, u); s += circ(q.x, q.y - 1, 1.1, "#e6f2f8"); }
        // barrages de travertin qui grandissent, mousses
        marches.forEach(([x, y], i) => { const h = 4 + 10 * e; s += poly([[x - 16, y + 2], [x - 4, y - h * 0.6], [x + 4, y - h * 0.6], [x + 18, y + 4]], "#efe6cd", { stroke: "#b9aa86", "stroke-width": 0.8 }); s += ell(x - 8, y - 2, 6, 3, "#6e9a4a", { opacity: 0.9 }); });
        // le CO₂ s'échappe
        for (const b of bulles) { const u = (b.ph + ta * 0.5) % 1, q = lePlong(trajet, b.x / 480); s += circ(q.x, q.y - 3 - u * 16, 1.2 + u, "none", { stroke: "#6aa6cf", "stroke-width": 0.7, opacity: op((1 - u) * (1 - e * 0.5)) }); }
        // jauge : calcium dissous (mg/L), seuil de saturation à l'air
        const ca = lerp(p.caDebut ?? 125, p.caFin ?? 45, e), yC = (v) => 200 - v / 140 * 150;
        s += rect(430, yC(140), 12, yC(0) - yC(140), "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 3 }) + rect(431, yC(ca), 10, yC(0) - yC(ca), "rgba(52,120,170,.45)");
        s += line(424, yC(30), 448, yC(30), "#c0392b", 1.6) + txt(452, yC(30) + 3, "seuil", { petit: true });
        s += poly([[428, yC(ca)], [421, yC(ca) - 4], [421, yC(ca) + 4]], "#2f7cc0") + txt(418, yC(ca) + 3, `${nombre(ca)} mg/L`, { a: "end", petit: true });
        s += txt(436, 36, "calcium dissous", { a: "middle", petit: true });
        s += txt(220, 20, e < 0.4 ? "à l'air, le CO₂ s'échappe : l'eau porte trop de calcium" : "la calcite se dépose sur les mousses : le travertin grandit", { a: "middle" });
        s += compteur(90, 36, 0, { libelle: p.libelleAge || "aujourd'hui" });
        return s;
      },
    };
  };

  // poche karstique (phosphorites du Quercy) : des argiles et des os tombent dans les poches (T 0–0,5), puis le guano des
  // chauves-souris libère des eaux acides chargées de phosphate, qui attaquent le calcaire : l'apatite précipite (0,5–1)
  function pocheKarst(p, T0, T1) {
    const R = alea("pk" + p.graine);
    const os = Array.from({ length: 22 }, () => ({ x: 200 + R() * 80, y: 110 + R() * 100, a: R() * 180, l: 4 + R() * 6, ph: R() * 0.4 }));
    const poche = [[170, 60], [190, 110], [175, 170], [210, 222], [270, 224], [300, 170], [285, 110], [305, 60]];
    const clipP = nid("pkp");
    return {
      fond: ciel(60) + rect(0, 60, W, H - 60, "#e6dfc6") + (() => { let r = ""; for (let y = 76; y < H; y += 22) r += line(0, y, W, y, "rgba(150,135,100,.35)", 1); return r; })()
        + poly(poche, "#3a302a") + `<clipPath id="${clipP}"><polygon points="${P(poche)}"/></clipPath>` + txt(12, 90, "calcaire des causses", { petit: true }),
      anim(t, ta) {
        const T = lerp(T0, T1, t), rem = fen(T, 0.02, 0.5), ph = fen(T, 0.52, 0.95);
        let s = `<g clip-path="url(#${clipP})">` + rect(160, 224 - 150 * rem, 160, 150 * rem + 2, "#a65a3a");
        for (const o of os) if (o.y > 224 - 150 * rem) s += `<rect x="${r1(o.x - o.l / 2)}" y="${r1(o.y - 1)}" width="${r1(o.l)}" height="2" rx="1" fill="#efe6d2" transform="rotate(${r1(o.a)} ${r1(o.x)} ${r1(o.y)})"/>`;
        if (ph > 0) { s += rect(160, 60, 160, 10 * ph, "#2a2420"); for (let k = 0; k < 12; k++) { const u = (k / 12 + ta * 0.25) % 1; s += circ(200 + k * 7, lerp(70, 224 - 150 * rem, u), 1.4, "#f0d14a", { opacity: op(ph * Math.sin(u * Math.PI)) }); } }
        s += `</g>`;
        if (ph > 0) s += pline(poche.slice(1, 7), "#f1e7c8", 3 + 3 * ph, { opacity: op(ph) });
        if (ph > 0) for (let k = 0; k < 5; k++) { const u = (ta * 0.2 + k / 5) % 1; s += `<path d="M${r1(210 + k * 14)} ${r1(40 + u * 16)} l4 -4 l4 4" fill="none" stroke="#27302d" stroke-width="1.2" opacity="${op(ph * (1 - u))}"/>`; }
        s += txt(316, 120, T <= 0.5 ? "argiles rouges et os" : "le guano libère un", { petit: true }) + txt(316, 132, T <= 0.5 ? "tombent dans la poche" : "phosphate acide : l'apatite", { petit: true });
        if (T > 0.5) s += txt(316, 144, "tapisse les parois", { petit: true, op: ph });
        s += txt(190, 20, T <= 0.5 ? "les poches du karst se remplissent" : "le guano des chauves-souris phosphatise la poche", { a: "middle" });
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], T) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.pocheRemplissage = (p) => pocheKarst(p, 0, 0.5);
  SCENES.pochePhosphate = (p) => pocheKarst(p, 0.5, 1);

  // ───────────── formations superficielles et altérations (18/09/2026) ─────────────
  // glacier : il descend la vallée, arrache des blocs et broie la roche en farine, porte tout sans trier (T 0–0,5) ; il fond
  // et recule, laissant ses moraines (bourrelets de blocs et de farine mêlés) et une plaine d'eaux de fonte (0,5–1)
  function glacier(p, T0, T1) {
    const R = alea("gl" + p.graine);
    const vallee = (x) => 60 + (x / W) * 130 + 10 * Math.sin(x / 50);
    const blocs = Array.from({ length: 36 }, () => ({ u: R(), v: R(), r: 1.5 + R() * 3.5, c: ["#8f877a", "#b5ab9a", "#6f685e", "#cfc5b2"][Math.floor(R() * 4)] }));
    const clipG = nid("glc");
    return {
      fond: ciel(H) + poly(Array.from({ length: 121 }, (_, i) => [i * 4, vallee(i * 4)]).concat([[W, H], [0, H]]), "#8d8577")
        + poly([[0, 62], [26, 24], [52, 44], [84, 14], [120, 48], [150, 70], [150, 90], [0, 90]], "#b9c2c8", { opacity: 0.8 })
        + poly([[18, 34], [26, 24], [34, 32]], "#f4f8fa") + poly([[76, 24], [84, 14], [93, 24]], "#f4f8fa"),
      anim(t, ta) {
        const T = lerp(T0, T1, t), avance = T < 0.5 ? 1 : 1 - fen(T, 0.5, 0.95);
        const front = 90 + 290 * avance;
        const glace = []; for (let x = 0; x <= front; x += 4) glace.push([x, vallee(x) - 26 * Math.sqrt(Math.max(0, 1 - x / front))]);
        let s = "";
        // la glace, avec les débris qu'elle porte (en bas et dedans)
        if (front > 95) {
          s += `<clipPath id="${clipG}"><polygon points="${P(glace.concat(glace.slice().reverse().map(([x]) => [x, vallee(x)])))}"/></clipPath>`;
          s += poly(glace.concat(glace.slice().reverse().map(([x]) => [x, vallee(x)])), "#e4f0f5", { stroke: "#a9c3cf", "stroke-width": 1 });
          s += `<g clip-path="url(#${clipG})">`;
          for (const b of blocs) { const x = ((b.u + ta * 0.01) % 1) * front, y = vallee(x) - 4 - b.v * 14 * Math.sqrt(Math.max(0, 1 - x / front)); s += circ(x, y, b.r, b.c); }
          s += `</g>`;
        }
        // moraines laissées par le recul, plaine d'eaux de fonte en aval
        const dep = fen(T, 0.55, 1);
        if (dep > 0) {
          for (const [x, h] of [[380, 16], [300, 10], [230, 8]]) if (front < x) s += poly([[x - 26, vallee(x - 26)], [x, vallee(x) - h * dep], [x + 22, vallee(x + 22)]], "#a39884");
          for (const b of blocs.slice(0, 20)) { const x = 220 + b.u * 180; if (front < x) s += circ(x, vallee(x) - 2, b.r * 0.8, b.c, { opacity: op(dep) }); }
          s += pline(Array.from({ length: 21 }, (_, i) => { const x = 400 + i * 4; return [x, vallee(x) - 1 + Math.sin(i + ta) * 0.6]; }), "#7fb6d6", 2);
        }
        if (T < 0.5) for (let k = 0; k < 4; k++) s += fleche(40 + k * 80, vallee(40 + k * 80) - 30, 80 + k * 80, vallee(80 + k * 80) - 30, { c: "#5c7f93", sw: 1.6, pointe: 6, op: 0.6 });
        s += txt(220, 18, T < 0.5 ? "le glacier arrache des blocs et broie la roche en farine ; il porte tout sans trier" : "il fond et recule : blocs et farine restent pêle-mêle, en moraines", { a: "middle" });
        if (dep > 0.5) s += txt(330, vallee(330) + 16, "moraines", { a: "middle", petit: true, clair: true });
        s += compteur(412, 36, p.ages ? lerp(p.ages[0], p.ages[1], T) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.glacierAvance = (p) => glacier(p, 0, 0.5);
  SCENES.glacierFonte = (p) => glacier(p, 0.5, 1);

  // vent : "loess" (le vent soulève les limons des plaines nues au bord des glaciers et les dépose en placage sur la steppe)
  // ou "dunes" (le sable de la plage avance par bonds ; la dune migre sur la forêt, sa face sous le vent est raide)
  SCENES.vent = function (p) {
    const R = alea("ve" + p.graine), mode = p.mode || "dunes";
    const SOL = 180;
    const grains = Array.from({ length: 60 }, () => ({ ph: R(), y: R(), h: 6 + R() * 20 }));
    const arbres = Array.from({ length: 12 }, () => 260 + R() * 220);
    return {
      fond: ciel(SOL) + rect(0, SOL, W, H - SOL, mode === "dunes" ? "#d9c79c" : "#9b9076"),
      anim(t, ta) {
        const e = fen(t, 0.03, 0.95);
        let s = "";
        if (mode === "dunes") {
          s += rect(0, SOL - 2, 90, 4, "#6aa6cf") + txt(12, SOL + 16, "plage", { petit: true });
          const xd = 170 + 70 * e, hd = 70;                                   // la dune avance vers la droite (vers la forêt)
          for (const x of arbres) if (x > xd + 40) s += rect(x - 1, SOL - 16, 2, 16, "#6b4f35") + ell(x, SOL - 20, 7, 9, "#3f6b35");
          s += poly([[xd - 150, SOL], [xd, SOL - hd], [xd + 40, SOL]], "#e3d2a6", { stroke: "#c2ae82", "stroke-width": 1 });
          for (let k = 1; k < 5; k++) s += line(xd + k * 8, SOL - hd + k * 14, xd + 40 - (4 - k) * 2, SOL, "rgba(160,135,90,.35)", 0.8);
          for (const g of grains) { const u = (g.ph + ta * 0.6) % 1, x = lerp(20, xd, u) + (u * 900) % 12, y = SOL - (u * (hd + 6)) * (x / xd) - Math.abs(Math.sin(u * 30)) * 6; s += circ(x, y, 0.9, "#b89d64"); }
          s += txt(xd - 70, SOL - hd * 0.45, "face au vent : pente douce", { a: "middle", petit: true }) + txt(xd + 44, SOL - hd + 10, "face sous le vent : raide", { petit: true });
          s += txt(360, SOL - 40, "la forêt est ensevelie", { a: "middle", petit: true, op: fen(t, 0.5, 0.7) });
        } else {
          // lœss : plaine nue au bord du glacier (gauche), steppe (droite) où la poussière retombe en placage
          s += poly([[0, 60], [70, 40], [110, SOL - 10], [0, SOL]], "#e4f0f5", { stroke: "#a9c3cf", "stroke-width": 1 }) + txt(8, 80, "glacier", { petit: true });
          for (let k = 0; k < 5; k++) s += pline(Array.from({ length: 11 }, (_, i) => [110 + i * 6, SOL - 2 + Math.sin(i + k) * 1]), "#9fc4dc", 1.2);
          const ep = 16 * e;
          s += poly(Array.from({ length: 81 }, (_, i) => { const x = 180 + i * 3.75; return [x, SOL - ep * (1 - Math.abs(x - 330) / 180) ** 0.7]; }).concat([[480, SOL], [180, SOL]]), "#d9c69e");
          for (let x = 190; x < W; x += 14) s += line(x, SOL - 1, x - 2, SOL - 6, "#8a8d4a", 1);
          for (const g of grains) { const u = (g.ph + ta * 0.35) % 1, x = lerp(110, 470, u), y = SOL - 10 - g.h - Math.sin(u * Math.PI) * 50 * g.y; s += circ(x, y, 0.8, "#b9a57e", { opacity: op(Math.sin(u * Math.PI)) }); }
          s += txt(120, SOL + 16, "plaine nue, alluvions du glacier", { petit: true, clair: true }) + txt(330, SOL - ep - 8, "placage de lœss sur la steppe", { a: "middle", petit: true });
        }
        s += fleche(160, 30, 230, 30, { sw: 2.4, pointe: 8 }) + txt(236, 34, "vent", { petit: true });
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // versant : "eboulis" (l'eau gèle dans les fissures, gonfle de 9 % et détache des blocs qui roulent en talus) ou
  // "colluvions" (champ défriché : la pluie ruisselle et les labours déplacent le sol, qui s'accumule au pied du versant)
  SCENES.versant = function (p) {
    const R = alea("vs" + p.graine), mode = p.mode || "eboulis";
    const blocs = Array.from({ length: 40 }, () => ({ tb: R(), d: R(), r: 2 + R() * 4 }));
    const pente = mode === "eboulis" ? (x) => (x < 170 ? 40 + x * 0.05 : x < 190 ? 48 + (x - 170) * 6 : 170 + (x - 190) * 0.05) : (x) => 60 + x * 0.26;
    return {
      fond: ciel(H) + poly(Array.from({ length: 121 }, (_, i) => [i * 4, pente(i * 4)]).concat([[W, H], [0, H]]), mode === "eboulis" ? "#d8ccb0" : "#9a7d5c")
        + (mode === "eboulis" ? (() => { let r = ""; for (let y = 60; y < H; y += 18) r += line(0, y, 190, y, "rgba(120,105,80,.4)", 1); return r; })() : ""),
      anim(t, ta) {
        const e = fen(t, 0.03, 0.95);
        let s = "";
        if (mode === "eboulis") {
          const tal = 60 * e;
          s += poly([[190, 60], [190 + tal * 1.2, 170], [190, 170]], "#b3a58a");
          s += poly([[190, 58 + (1 - e) * 20], [190 + tal * 1.25, 172], [190 + tal * 1.25 + 30, 172], [190, 172]], "#c3b597", { opacity: 0.9 });
          for (const b of blocs) { if (b.tb > e + 0.02) continue; const u = clamp((e - b.tb) / 0.06), x = lerp(186, 196 + tal * 1.2 * (0.3 + 0.7 * b.d), u), y = lerp(70 + b.d * 60, 168 - b.r, u); s += `<rect x="${r1(x - b.r)}" y="${r1(y - b.r)}" width="${r1(2 * b.r)}" height="${r1(1.6 * b.r)}" fill="#a39880" transform="rotate(${r1(u * 300)} ${r1(x)} ${r1(y)})"/>`; }
          const gel = Math.sin(ta * 1.2) > 0;
          for (let k = 0; k < 4; k++) s += line(172 + k * 4, 70 + k * 22, 188, 74 + k * 22, gel ? "#9fd0ea" : "#6d5c48", 1.6);
          s += txt(120, 40, gel ? "la nuit, l'eau gèle dans les fissures et gonfle de 9 %" : "le jour, la glace fond : le bloc se détache", { a: "middle", petit: true });
          s += txt(300, 150, "talus d'éboulis : les gros blocs roulent le plus loin", { a: "middle", petit: true, op: fen(t, 0.3, 0.45) });
          s += `<g opacity="${op(Math.max(0, Math.sin(ta * 1.2)) * 0.8)}">${circ(420, 30, 8, "#eef3f5")}</g>`;
        } else {
          for (let x = 10; x < W; x += 12) s += line(x, pente(x) - 1, x + 6, pente(x + 6) - 1, "rgba(60,45,30,.35)", 1);
          s += `<g opacity=".85">${nuage(160 + ta, 20, 0.9) + pluie(138 + ta, 28, 60, 60, ta, 12, "vs1")}</g>`;
          for (let k = 0; k < 14; k++) { const u = (k / 14 + ta * 0.2) % 1, x = lerp(60, 430, u); s += circ(x, pente(x) - 1.5, 1.2, "#6d9fc4", { opacity: op(Math.sin(u * Math.PI)) }); }
          const ep = 22 * e;
          s += poly(Array.from({ length: 31 }, (_, i) => { const x = 330 + i * 5; return [x, pente(x) - ep * clamp((x - 330) / 120)]; }).concat([[480, pente(480)], [330, pente(330)]]), "#7d6246");
          s += txt(160, 16, "sol mis à nu par le défrichement : la pluie ruisselle et l'emporte", { a: "middle" });
          s += txt(410, pente(410) - ep - 8, "colluvions", { a: "middle", petit: true, op: fen(t, 0.3, 0.45) });
        }
        s += compteur(412, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // estran : la marée monte et descend (en continu) ; à l'étale, les flocons de vase se déposent ; slikke puis schorre
  SCENES.estran = function (p) {
    const R = alea("es" + p.graine);
    const fondE = (x) => 150 - x * 0.12;
    const flocons = Array.from({ length: 50 }, () => ({ x: R() * W, ph: R() }));
    return {
      fond: ciel(H),
      anim(t, ta) {
        const e = fen(t, 0.03, 0.95), maree = Math.sin(ta * 0.5), niv = 118 + 24 * maree;
        let s = poly(Array.from({ length: 121 }, (_, i) => [i * 4, fondE(i * 4) - 12 * e * clamp(i / 60)]).concat([[W, H], [0, H]]), "#8f8570");
        for (let k = 1; k <= 5; k++) s += pline(Array.from({ length: 121 }, (_, i) => [i * 4, fondE(i * 4) - 12 * e * clamp(i / 60) * k / 5]), "rgba(60,55,45,.25)", 0.8);
        s += poly(Array.from({ length: 121 }, (_, i) => [i * 4, Math.min(niv, fondE(i * 4) - 12 * e * clamp(i / 60))]).concat(Array.from({ length: 121 }, (_, i) => [480 - i * 4, niv])), "#7fb0cc", { opacity: 0.85 });
        for (const f of flocons) { const u = (f.ph + ta * 0.15) % 1; if (f.x < 470) s += circ(f.x, lerp(niv + 2, fondE(f.x) - 2, u), 1, "#6d6150", { opacity: op((1 - Math.abs(maree)) * Math.sin(u * Math.PI)) }); }
        for (let x = 360; x < W; x += 10) s += line(x, fondE(x) - 12 * e - 1, x - 1, fondE(x) - 12 * e - 7, "#6f8f4a", 1.2);
        s += txt(200, 20, Math.abs(maree) < 0.4 ? "à l'étale, le courant s'arrête : les flocons de vase se déposent" : maree > 0 ? "la marée monte" : "la marée descend", { a: "middle" });
        s += txt(W - 8, fondE(W) - 20, "schorre (prés salés)", { a: "end", petit: true }) + txt(120, fondE(120) + 20, "slikke (vasière)", { a: "middle", petit: true, clair: true });
        s += compteur(412, 36, 0, { libelle: p.libelleAge || "aujourd'hui" });
        return s;
      },
    };
  };

  // plaine alluviale : galets au fond du chenal, sables sur les bancs, limons de crue sur la plaine ; à chaque cycle
  // glaciaire, la rivière comble puis recreuse sa vallée : les terrasses s'étagent
  SCENES.plaineAlluviale = function (p) {
    const R = alea("pa" + p.graine);
    return {
      fond: ciel(H),
      anim(t, ta) {
        const e = fen(t, 0.03, 0.95), inc = 40 * e;
        let s = poly([[0, 70], [70, 72], [90, 110], [390, 110], [410, 72], [480, 70], [480, H], [0, H]], "#9a8e78");
        // terrasses anciennes (hautes), puis plaine actuelle creusée plus bas
        s += poly([[70, 72], [90, 110], [130, 110], [140, 110 + inc * 0.5], [340, 110 + inc * 0.5], [350, 110], [390, 110], [410, 72]], "#c9b891");
        s += poly([[140, 110 + inc * 0.5], [160, 110 + inc], [320, 110 + inc], [340, 110 + inc * 0.5]], "#b8a57a");
        const cr = Math.max(0, Math.sin(ta * 0.6));
        s += rect(200, 104 + inc - 6 * cr, 80, 8 + 6 * cr, "#6d9fc4", { opacity: 0.85 });
        for (let k = 0; k < 10; k++) s += circ(206 + k * 7, 110 + inc + 1, 2, "#8f877a");
        for (let k = 0; k < 8; k++) { const u = (k / 8 + ta * 0.2) % 1; s += circ(lerp(160, 320, u), 108 + inc - 2, 0.9, "#b9a57e", { opacity: op(cr) }); }
        s += txt(100, 64, "terrasse ancienne", { a: "middle", petit: true }) + txt(240, 100 + inc - 8, "chenal : galets", { a: "middle", petit: true });
        s += txt(300, 124 + inc, "limons de crue", { a: "middle", petit: true, clair: true, op: fen(t, 0.2, 0.3) });
        s += txt(220, 20, cr > 0.5 ? "en crue, la rivière déborde et dépose ses limons" : "le courant trie : galets au fond, sables sur les bancs", { a: "middle" });
        s += compteur(412, 36, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // profil d'altération : la roche mère pourrit en place sous la pluie ; le front d'altération descend ; ce qui part en
  // solution sort par le côté (flèches), ce qui reste forme les horizons. p.horizons [[nom, couleur, part]…] (du haut vers
  // le bas, au-dessus de la roche mère), rocheMere [nom, couleur], dissous [texte], climat (texte), residuel (la surface
  // s'abaisse : terra rossa, argile à silex), remontee (calcrète : l'eau remonte et s'évapore), ages
  function profilAlteration(p, T0, T1) {
    const R = alea("pr" + p.graine);
    const X0 = 60, X1 = 280, S0 = 60, BAS = 226;
    const H0 = p.horizons || [["sol", "#6b4a2f", 0.2], ["argiles", "#c9a27a", 0.4], ["roche altérée", "#d9c7aa", 0.4]];
    const RM = p.rocheMere || ["roche mère", "#b8b0a2"];
    const taches = Array.from({ length: 70 }, () => [X0 + R() * (X1 - X0), S0 + R() * (BAS - S0), R()]);
    return {
      fond: ciel(S0) + rect(X1, S0, W - X1, H - S0, "#f3f1ea"),
      anim(t, ta) {
        const T = lerp(T0, T1, t), e = fen(T, 0.03, 0.97);
        const surf = p.residuel ? S0 + 24 * e : S0;
        const front = surf + (BAS - 30 - surf) * e;
        let s = rect(X0, surf, X1 - X0, BAS - surf, RM[1]);
        for (const [x, y, v] of taches) if (y > front) s += circ(x, y, 1.3, v < 0.3 ? "#3e342c" : v < 0.6 ? "#e2b39a" : "#f4f1ea", { opacity: 0.7 });
        if (p.residuel) s += rect(X0, S0, X1 - X0, surf - S0, "#bfe0f0", { opacity: 0.25 }) + line(X0, S0, X1, S0, "#9ab", 1, { "stroke-dasharray": "3 3" });
        let y = surf;
        for (const [nom, c, part] of H0) {
          const h = (front - surf) * part;
          if (h > 0.5) { s += rect(X0, y, X1 - X0, h, c); if (h > 11) s += txt(X0 + 6, y + h / 2 + 3, nom, { petit: true, clair: /^#[0-7]/.test(c) }); }
          y += h;
        }
        if (p.nodules) for (const [x, yy, v] of taches) if (yy > surf + 4 && yy < front - 4 && v < 0.5) s += ell(x, yy, 4 + v * 5, 2.6 + v * 2, p.nodules, { stroke: "rgba(0,0,0,.4)", "stroke-width": 0.5 });
        s += line(X0, front, X1, front, "#7a5a3a", 1.2, { "stroke-dasharray": "4 3" }) + txt(X1 - 4, front + 11, "front d'altération", { a: "end", petit: true });
        s += rect(X0, surf, X1 - X0, BAS - surf, "none", { stroke: "#5f574c", "stroke-width": 1 }) + txt(X0 + 6, BAS - 8, RM[0], { petit: true, clair: true });
        // la pluie entre ; ce qui est dissous s'en va (ou remonte et s'évapore)
        if (!p.remontee) {
          s += pluie(X0 + 20, 6, X1 - X0 - 40, S0 - 10, ta, 16, "pr1");
          for (let k = 0; k < 6; k++) { const u = (ta * 0.3 + k / 6) % 1; s += circ(lerp(X0 + 30, X1 - 20, (k * 37 % 100) / 100), lerp(surf + 4, front, u), 1.4, "#6d9fc4", { opacity: op(Math.sin(u * Math.PI)) }); }
          s += fleche(X1 + 4, front - 20, X1 + 40, front - 20, { c: "#3f8fd2", sw: 2, pointe: 7 });
        } else {
          s += soleil(X1 - 30, 30);
          for (let k = 0; k < 8; k++) { const u = (ta * 0.25 + k / 8) % 1; s += circ(X0 + 20 + k * 26, lerp(BAS - 20, surf + 6, u), 1.3, "#6d9fc4", { opacity: op(Math.sin(u * Math.PI)) }); s += `<path d="M${X0 + 20 + k * 26} ${r1(surf - u * 20)} q2 -3 0 -6" fill="none" stroke="#9fc4dc" stroke-width="1" opacity="${op(1 - u)}"/>`; }
        }
        const yD = clamp(front - 24, 104, 210);
        (p.dissous || []).forEach((l, i) => { s += txt(X1 + 46, yD + i * 11, l, { petit: true }); });
        (p.lignes || []).forEach((l, i) => { s += txt(292, 48 + i * 12, l, { petit: true }); });
        const cl = (p.climat || "").split(/ : |, /);
        s += txt(292, 16, cl[0] || "", { petit: true }) + txt(292, 27, cl.slice(1).join(", "), { petit: true });
        s += compteur(160, 14, p.ages ? lerp(p.ages[0], p.ages[1], T) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.profilDebut = (p) => profilAlteration(p, 0, 0.5);
  SCENES.profilFin = (p) => profilAlteration(p, 0.5, 1);

  // fers rubanés : océan archéen sans oxygène, fer dissous (Fe²⁺) ; les courants le remontent vers les plateaux où les
  // cyanobactéries produisent de l'oxygène : les oxydes de fer précipitent ; lits de fer et de silice alternent
  SCENES.ferRubane = function (p) {
    const R = alea("fr" + p.graine);
    const fondY = (x) => x < 250 ? 120 : lerp(120, 210, (x - 250) / 120);
    const fe = Array.from({ length: 50 }, () => ({ x: 260 + R() * 220, y: 130 + R() * 90, ph: R() }));
    return {
      fond: rect(0, 0, W, H, "#5f8a84") + rect(0, 0, W, 26, "#f0d9b8") + poly(Array.from({ length: 121 }, (_, i) => [i * 4, fondY(i * 4)]).concat([[W, H], [0, H]]), "#6b6258")
        + txt(W - 8, H - 8, "eau profonde sans oxygène : fer dissous (Fe²⁺)", { a: "end", petit: true, clair: true }),
      anim(t, ta) {
        const e = fen(t, 0.03, 0.95);
        let s = "";
        for (const f of fe) { const u = (f.ph + ta * 0.12) % 1, x = lerp(f.x, 200, u), y = lerp(f.y, 60, u); s += circ(x, y, 1.3, u < 0.6 ? "#7ec2a0" : "#b5552e", { opacity: op(Math.sin(u * Math.PI)) }); }
        for (let x = 20; x < 240; x += 18) { s += circ(x, 34 + (x % 5), 3, "#3f8f4a"); const u = (ta * 0.5 + x / 50) % 1; s += circ(x + 2, 32 - u * 8, 1, "#e6f5ff", { opacity: op(1 - u) }); }
        const n = Math.floor(e * 14);
        for (let k = 0; k < n; k++) s += rect(0, 120 - (k + 1) * 3.4, 250, 3.4, k % 2 ? "#9a9590" : "#a8452a");
        s += txt(120, 16, "cyanobactéries : elles produisent de l'oxygène", { a: "middle", petit: true });
        s += txt(340, 60, "les courants remontent le fer", { a: "middle", petit: true, clair: true });
        s += txt(125, 132, "lits de fer et de silice alternent", { a: "middle", petit: true, clair: true, op: fen(t, 0.3, 0.45) });
        s += compteur(412, 44, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // ─────────── dorsale LENTE (refaite le 23/09/2026, 2ᵉ passe) : trondhjémite, gabbro, pyroxénite, serpentinite… ───────────
  // Coupe calquée sur le schéma de Escartín et al. (2008, Nature 455), repris dans Saga Information n° 347 (2015), et sur
  // la coupe de G. Manatschal pour le Chenaillet : à une dorsale lente (1 à 2 cm par an), les plaques s'écartent surtout
  // le long d'une grande faille courbe, la FAILLE DE DÉTACHEMENT, qui s'enracine sous l'axe ; le manteau qui remonte fond
  // en partie et le liquide monte à la racine de la faille, où il forme des chambres (futurs gabbros) juste sous elle ;
  // un filon part de la chambre et fait les coussins de basalte à l'axe ; l'eau de mer chauffée remonte le long de la faille
  // et ressort en fumeurs noirs là où la faille atteint le fond ; le compartiment sous la faille remonte le long d'elle et
  // forme un dôme (le « core complex » océanique). UNE géométrie en kilomètres (x : 0 à l'axe, + vers le dôme ; z :
  // profondeur sous le niveau de la mer), dessinée à deux échelles : vue d'ensemble (étape 1 et vignette de l'étape 2,
  // 6 px/km) et vue rapprochée centrée sur la chambre (étapes 2, 3, 4 ; 20 px/km). Demandes du 23/09 : chambre CENTRÉE,
  // tout aligné sur l'axe (gouttes → chambre → filon → coussins), mêmes objets dans les deux vues, pas de schéma inventé.
  const DK = (() => {
    const brut = [[-15, 60], [-13.4, 30], [-11.2, 20.5], [-9.6, 16.4], [-7.4, 12.6], [-5.2, 10.1], [-3.3, 8.75], [-1.6, 7.95], [0, 7.5], [1.6, 7.05],
      [3.1, 6.2], [4.5, 5.1], [5.6, 4.2], [6.4, 3.8], [7.8, 3.2], [9.6, 2.8], [12, 2.6], [15, 2.65], [19, 2.9], [24, 3.15], [32, 3.4], [48, 3.55], [80, 3.6]];
    const F = courbe(brut, 6);
    const cum = [0];
    for (let i = 1; i < F.length; i++) cum.push(cum[i - 1] + Math.hypot(F[i][0] - F[i - 1][0], F[i][1] - F[i - 1][1]));
    const L = cum[cum.length - 1];
    // point de la faille à l'abscisse curviligne s (km), décalé de n km sous elle (vers le compartiment du dessous)
    function pt(s, n = 0) {
      s = clamp(s, 0, L);
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
      const f = (s - cum[lo]) / ((cum[hi] - cum[lo]) || 1), [x1, z1] = F[lo], [x2, z2] = F[hi];
      const a = Math.atan2(z2 - z1, x2 - x1);
      return [lerp(x1, x2, f) - Math.sin(a) * n, lerp(z1, z2, f) + Math.cos(a) * n];
    }
    // coordonnées (s, n) d'un point : projection sur la faille la plus proche
    function versSN([x, z]) {
      let best = [1e9, 0, 0];
      for (let i = 1; i < F.length; i++) {
        const [x1, z1] = F[i - 1], [x2, z2] = F[i], dx = x2 - x1, dz = z2 - z1, l2 = dx * dx + dz * dz || 1;
        const u = clamp(((x - x1) * dx + (z - z1) * dz) / l2), px = x1 + u * dx, pz = z1 + u * dz, d = Math.hypot(x - px, z - pz);
        if (d < best[0]) { const sg = (dx * (z - z1) - dz * (x - x1)) >= 0 ? 1 : -1; best = [d, cum[i - 1] + u * Math.sqrt(l2), sg * d]; }
      }
      return [best[1], best[2]];
    }
    const zFaille = (x) => hauteur(F, x);
    const T = [6.4, 3.8];                                                            // la faille atteint le fond
    const sT = versSN(T)[0];
    const zFondHW = (x) => 3.45 + 0.4 * Math.exp(-((x / 2.2) ** 2));                   // fond du compartiment du dessus (vallée axiale)
    const zFond = (x) => x < T[0] ? zFondHW(x) : zFaille(x);
    const CH = { x: 0, z: 8.65, rx: 2.4, rz: 0.8 };                                  // la chambre, sous l'axe, juste sous la faille
    const sed = (x) => x < T[0] ? Math.min(0.32, Math.abs(x) * 0.011) : Math.min(0.32, (x - T[0]) * 0.012);
    return { F, L, pt, versSN, zFaille, zFond, zFondHW, T, sT, CH, sed, xTop: (s) => pt(s)[0] };
  })();
  const OPH = { peri: "#9aa36f", periH: "#8d9a66", serp: "#71905a", cous: "#2f3632", lave: "#46504a", sed: "#c9b995", trond: "#f7f2e6", gab: "#69735f",
    eau: "#4f84ad", bandes: [["#8ea459", 0.34], ["#4b554d", 0.62], ["#d8d2c3", 1]] };      // cumulats : olivine, pyroxène, plagioclase
  const V_PLAQUE = 0.55;                                                              // km par seconde d'animation (vue d'ensemble)
  // projections : vue d'ensemble et vue rapprochée
  const projDL = (x0, y0, k, zRef = 0) => ({ k, X: (x) => x0 + x * k, Y: (z) => y0 + (z - zRef) * k, x: (X) => (X - x0) / k, z: (Y) => zRef + (Y - y0) / k });
  const P_VUE = projDL(200, 26, 6), P_ZOOM = projDL(160, 41, 20, 3.85);
  const ZOOM = { x0: -8, x1: 8, z0: P_ZOOM.z(0), z1: P_ZOOM.z(H) };                  // ce que montre la vue rapprochée (km)
  const Pk = (pr, pts) => pts.map(([x, z]) => [pr.X(x), pr.Y(z)]);
  // fond de mer et compartiments, en km, pour une fenêtre [xa, xb]
  function dlRegions(xa, xb) {
    const pas = (xb - xa) / 160, fond = [], faille = [];
    for (let x = xa; x <= xb + 1e-6; x += pas) fond.push([x, DK.zFond(x)]);
    const dessus = [];
    for (let x = xa; x < DK.T[0]; x += pas) dessus.push([x, DK.zFondHW(x)]);
    dessus.push([DK.T[0], DK.zFondHW(DK.T[0])]);
    for (const q of DK.F) if (q[0] <= DK.T[0] + 0.01) faille.push(q);                 // de la racine jusqu'au fond
    const hw = dessus.concat(faille.slice().reverse(), [[xa - 3, 60]]);
    const fw = DK.F.filter(([x]) => x >= xa - 3 && x <= xb + 3).concat([[xb + 3, 60], [xa - 3, 60]]);
    return { fond, hw, fw, faille };
  }
  // repères qui voyagent avec les plaques : compartiment du dessous (s, n) le long de la faille ; du dessus, vers la gauche
  function dlRepères(R) {
    const S0 = DK.versSN([-9.6, 16.4])[0] - 4, SL = DK.L - S0;
    const lentFW = Array.from({ length: 12 }, (_, i) => ({ s: S0 + i * SL / 12 + R() * 3, n: 0.5 + R() * 1.4, a: 1 + R() * 0.8, b: 0.28 + R() * 0.2 }));
    const lentHW = Array.from({ length: 6 }, (_, i) => ({ x: -3 - i * 7 - R() * 3, z: 5.2 + R() * 2.5, a: 0.9 + R() * 0.7, b: 0.25 + R() * 0.15 }));
    const mailleFW = Array.from({ length: 200 }, () => ({ s: S0 + R() * SL, n: 0.15 + Math.pow(R(), 1.6) * 7, a: R() * Math.PI }));
    const mailleHW = Array.from({ length: 90 }, () => ({ x: -R() * 45, z: 3.8 + R() * 9, a: R() * Math.PI }));
    const cousHW = Array.from({ length: 7 }, (_, i) => ({ x: -1.5 - i * 5.6 - R() * 2, n: 3 + Math.floor(R() * 4) }));
    const cousFW = [{ s: DK.sT + 9, n: 4 }, { s: DK.sT + 20, n: 5 }, { s: DK.sT + 33, n: 3 }];
    return { lentFW, lentHW, mailleFW, mailleHW, cousHW, cousFW, S0, SL };
  }
  // lentille (ellipse) en coordonnées (s, n) → polygone en km
  const lentilleSN = (sc, nc, a, b) => Array.from({ length: 14 }, (_, k) => { const th = k / 14 * Math.PI * 2; return DK.pt(sc + a * Math.cos(th), nc + b * Math.sin(th)); });
  const lentilleXZ = (xc, zc, a, b) => Array.from({ length: 14 }, (_, k) => { const th = k / 14 * Math.PI * 2; return [xc + a * Math.cos(th), zc + b * Math.sin(th)]; });
  const enBoucle = (v, a, b) => a + ((((v - a) % (b - a)) + (b - a)) % (b - a));
  // coussins de basalte : un monticule posé sur le fond en x (km)
  function monticule(pr, x, n, r, frais) {
    let s = "";
    const lignes = [Math.ceil(n * 0.55), Math.floor(n * 0.35), n - Math.ceil(n * 0.55) - Math.floor(n * 0.35)];
    let k = 0;
    lignes.forEach((m, j) => { for (let i = 0; i < m; i++, k++) {
      const xx = x + (i - (m - 1) / 2) * r * 1.9 / pr.k, zz = DK.zFond(xx) - (r * 0.8 + j * r * 1.35) / pr.k;
      s += ell(pr.X(xx), pr.Y(zz), r, r * 0.78, OPH.cous, { stroke: frais && k === n - 1 ? "#e0532b" : "#56605a", "stroke-width": 0.5 });
    } });
    return s;
  }
  // fumeur noir là où la faille atteint le fond ; l'eau chaude remonte le long de la faille depuis la chambre
  function fumeur(pr, ta, force = 1, echelle = 1) {
    const x = pr.X(DK.T[0] + 0.25), y = pr.Y(DK.zFaille(DK.T[0] + 0.25));
    let s = poly([[x - 2 * echelle, y + 0.5], [x + 2 * echelle, y + 0.5], [x + 1.2 * echelle, y - 8 * echelle], [x - 1.2 * echelle, y - 8 * echelle]], "#3a3330");
    if (force > 0) for (let k = 0; k < 5; k++) { const u = (ta * 0.4 + k / 5) % 1; s += circ(x + Math.sin(u * 6) * 1.6 * echelle, y - 9 * echelle - u * 16 * echelle, (1.3 + u * 3) * echelle, "#2a2624", { opacity: op(0.75 * (1 - u) * force) }); }
    return s;
  }
  // circulation de l'eau de mer : elle descend par les fissures près de l'axe, chauffe près de la chambre, remonte le long de la faille
  function circulation(pr, ta, force = 1, nb = 16) {
    if (force <= 0) return "";
    const aller = [[-2.6, 3.9], [-2.2, 5.2], [-1.4, 6.6], [-0.6, 7.35]];
    const retour = []; for (let s = DK.versSN([0, 7.5])[0]; s <= DK.sT + 0.2; s += 0.4) retour.push(DK.pt(s, -0.12));
    const chemin = Pk(pr, aller.concat(retour));
    let s = "";
    for (let k = 0; k < nb; k++) { const u = (ta * 0.07 + k / nb) % 1, q = lePlong(chemin, u); s += circ(q.x, q.y, pr.k > 10 ? 1.6 : 1.1, u < 0.25 ? "#8cc8ec" : u < 0.35 ? "#c6b39a" : "#ee9d5c", { opacity: op(Math.sin(u * Math.PI) * force) }); }
    return s;
  }

  // ── la vue d'ensemble (étape 1 et vignette) : dessin complet à l'instant ta ──
  // o : { pr, xa, xb, clip (id), detail (étiquettes), dep (km déjà parcourus), gouttes, suivi, eau, zoom (0–1), R }
  function dlVue(o, t, ta) {
    const { pr } = o, reg = o.reg, rep = o.rep, dep = V_PLAQUE * ta;
    let s = "";
    // compartiment du dessous : péridotite, serpentinite le long de la faille, repères qui glissent le long de la faille
    const cFW = nid("vfw"), cHW = nid("vhw");
    s += `<clipPath id="${cFW}"><polygon points="${P(Pk(pr, reg.fw))}"/></clipPath><clipPath id="${cHW}"><polygon points="${P(Pk(pr, reg.hw))}"/></clipPath>`;
    let fw = rect(-10, -10, W + 20, H + 20, OPH.peri);
    const bande = []; for (let s0 = 0; s0 <= DK.L; s0 += 0.8) bande.push(DK.pt(s0, 0));
    const bande2 = []; for (let s0 = DK.L; s0 >= 0; s0 -= 0.8) bande2.push(DK.pt(s0, 1.2));
    fw += poly(Pk(pr, bande.concat(bande2)), OPH.serp, { opacity: 0.85 });
    for (const m of rep.mailleFW) { const sc = enBoucle(m.s + dep, rep.S0, DK.L), [x, z] = DK.pt(sc, m.n); fw += line(pr.X(x), pr.Y(z), pr.X(x) + Math.cos(m.a) * 3, pr.Y(z) + Math.sin(m.a) * 3, "rgba(40,55,30,.32)", 0.7); }
    for (const l of rep.lentFW) { const sc = enBoucle(l.s + dep, rep.S0, DK.L); fw += poly(Pk(pr, lentilleSN(sc, l.n, l.a, l.b)), OPH.gab, { opacity: op(Math.min(1, (sc - rep.S0) / 3)) }); }
    for (const c of rep.cousFW) {
      const sc = enBoucle(c.s + dep, DK.sT + 1, DK.sT + 60), x = DK.pt(sc)[0];
      fw += line(pr.X(x), pr.Y(DK.zFond(x)), pr.X(x + 0.15), pr.Y(DK.zFond(x) + 1.5), "rgba(28,34,30,.55)", 0.8) + monticule(pr, x, c.n, pr.k > 10 ? 3 : 2);
    }
    s += `<g clip-path="url(#${cFW})">${fw}</g>`;
    // compartiment du dessus : il s'éloigne vers la gauche avec ses coussins, ses lentilles de gabbro et ses sédiments
    let hw = rect(-10, -10, W + 20, H + 20, OPH.periH);
    const toit = reg.hw.filter(([x, z]) => z <= DK.zFondHW(x) + 0.01);
    hw += poly(Pk(pr, toit.concat(toit.slice().reverse().map(([x, z]) => [x, z + 1]))), OPH.serp, { opacity: 0.8 });
    const bf = []; for (const q of DK.F) if (q[0] <= DK.T[0] + 0.01) bf.push(q);
    hw += poly(Pk(pr, bf.concat(bf.slice().reverse().map(([x, z]) => [x - 0.35, z - 0.35]))), OPH.serp, { opacity: 0.6 });
    for (const m of rep.mailleHW) { const x = enBoucle(m.x - dep, -45, 0); hw += line(pr.X(x), pr.Y(m.z), pr.X(x) + Math.cos(m.a) * 3, pr.Y(m.z) + Math.sin(m.a) * 3, "rgba(40,55,30,.32)", 0.7); }
    for (const l of rep.lentHW) { const x = enBoucle(l.x - dep, -45, 0); hw += poly(Pk(pr, lentilleXZ(x, l.z, l.a, l.b)), OPH.gab, { opacity: op(Math.min(1, -x / 3)) }); }
    // filons : chacun se forme à l'axe (sous les coussins), puis la plaque l'emporte ; ils restent parallèles (sa demande :
    // « les traits parallèles qui défilaient », repris de l'ancienne vue)
    for (let k = 0; k < 46; k++) { const x = enBoucle(-0.5 - k - dep, -46, -0.5); hw += line(pr.X(x), pr.Y(DK.zFondHW(x) + 0.12), pr.X(x), pr.Y(DK.zFondHW(x) + 1.7), "rgba(28,34,30,.5)", pr.k > 10 ? 1.3 : 1); }
    s += `<g clip-path="url(#${cHW})">${hw}</g>`;
    for (const c of rep.cousHW) { const x = enBoucle(c.x - dep, -45, -1); s += `<g opacity="${op(Math.min(1, -x / 2))}">${monticule(pr, x, c.n, pr.k > 10 ? 3 : 2)}</g>`; }
    // sédiments : plus épais sur le fond plus ancien, loin de l'axe
    const sedP = []; for (const [x, z] of reg.fond) sedP.push([x, z - DK.sed(x)]);
    s += poly(Pk(pr, reg.fond.concat(sedP.reverse())), OPH.sed);
    s += pline(Pk(pr, reg.faille.filter(([, z]) => z < 16.5)), "#3b3026", 1.2);
    // sous la lithosphère : le manteau chaud (asthénosphère), la zone de fusion sous l'axe, les lignes d'écoulement
    s += poly(Pk(pr, [[-60, 17], [-20, 16.2], [0, 15.5], [20, 16.6], [80, 19], [80, 60], [-60, 60]]), "#b2b37c");
    s += poly(Pk(pr, [[-19, 38], [19, 38], [0, 20]]), MAGMA, { opacity: 0.16, stroke: MAGMA, "stroke-width": 0.8, "stroke-dasharray": "4 3" });
    for (const sg of [-1, 1]) {
      const q = courbe(Pk(pr, [[sg * 9, 40], [sg * 6.5, 30], [sg * 9, 22], [sg * 20, 18.8], [sg * 40, 18]]), 6);
      s += pline(q, "rgba(60,50,30,.4)", 1, { "stroke-dasharray": "5 4", "stroke-dashoffset": r1(-ta * 10) });
      s += fleche(q[q.length - 4][0], q[q.length - 4][1], q[q.length - 1][0], q[q.length - 1][1], { c: "rgba(60,50,30,.55)", sw: 1, pointe: 5 });
    }
    s += pline(Pk(pr, [[-9.6, 16.4], [-10.4, 18.4], [-10, 19.6], [-10.9, 21.2], [-10.5, 22.6]]), "#3b3026", 1, { "stroke-dasharray": "2 2" });
    // la chambre sous l'axe, le chenal qui l'alimente, le filon et les coussins de l'axe
    const g = o.gouttes ?? 1, puls = 1 + 0.06 * Math.sin(ta * 2.2);
    s += line(pr.X(0), pr.Y(20), pr.X(0), pr.Y(DK.CH.z + DK.CH.rz), MAGMA, 1.4, { opacity: 0.55 * g });
    s += ell(pr.X(0), pr.Y(DK.CH.z), DK.CH.rx * pr.k * puls, DK.CH.rz * pr.k * puls, MAGMA, { stroke: "#5b4636", "stroke-width": 0.8 });
    // chaque filon naît dans l'axe : le magma perce le toit de la chambre et monte jusqu'au fond (rouge), puis il refroidit
    // (sombre) et la plaque l'emporte : ce sont les traits parallèles du compartiment de gauche (demande du 23/09/2026)
    for (let k = 0; k < 46; k++) {
      const x = enBoucle(-0.5 - k - dep, -46, -0.5), a = -0.5 - x;
      if (a > 1.6) continue;
      const zT = DK.CH.z - DK.CH.rz * Math.sqrt(Math.max(0, 1 - (x / DK.CH.rx) ** 2)), zF = DK.zFondHW(x);
      s += line(pr.X(x), pr.Y(zT), pr.X(x), pr.Y(lerp(zT, zF, clamp(a / 0.2))), melange(MAGMA, "#1c221e", clamp(a / 1.6)), pr.k > 10 ? 1.8 : 1.3, { opacity: op(1 - 0.6 * clamp(a / 1.6)) });
    }
    s += monticule(pr, 0, 6, pr.k > 10 ? 3 : 2.1, true);
    for (const d of o.drops) {
      const u = (d.ph + ta * 0.12) % 1;
      const [x, z] = u < 0.7 ? [lerp(d.x0, 0, lisse(u / 0.7)), lerp(d.z0, 20, u / 0.7)] : [0, lerp(20, DK.CH.z + DK.CH.rz, (u - 0.7) / 0.3)];
      const r = d.r * (1 + 0.7 * u), a = op(Math.min(1, u * 8, (1 - u) * 12) * g);
      s += ell(pr.X(x), pr.Y(z), r * 0.85, r * 1.15, MAGMA, { opacity: a }) + circ(pr.X(x) - r * 0.3, pr.Y(z) - r * 0.35, r * 0.35, "#ffd08a", { opacity: op(a * 0.8) });
    }
    s += fumeur(pr, ta);
    return s;
  }

  // 1 · vue d'ensemble d'une dorsale lente : les deux plaques s'écartent (celle du dessous le long de la faille), le manteau
  // monte sous l'axe et fond en partie ; le liquide se rassemble et monte jusqu'à une chambre sous l'axe. Remplace l'ancien
  // mode `lente` de la scène « dorsale ». p : suivi ("manteau" | "gabbro" | "basalte"), eau, zoom (cadre de l'étape suivante),
  // texte, nom, libelleAge, ages
  function dorsaleLente(p) {
    const R = alea("dl" + p.graine), pr = P_VUE;
    const reg = dlRegions(pr.x(-4), pr.x(W + 4)), rep = dlRepères(alea("dlrep"));
    const drops = Array.from({ length: 30 }, () => { const v = Math.sqrt(R()), u = R() - 0.5; return { x0: u * 2 * 18 * v, z0: lerp(21, 37, v), ph: R(), r: 1.3 + R() * 0.6 }; });
    const suivi = p.suivi || "manteau";
    const fractures = Array.from({ length: 5 }, (_, i) => ({ dx: -1.6 + i * 0.8 + R() * 0.3, l: 0.8 + R() * 0.7 }));
    return {
      fond: ciel(pr.Y(0)) + rect(0, pr.Y(0), W, H, OPH.eau) + txt(8, pr.Y(0) + 10, p.nom || "océan", { petit: true, clair: true }),
      anim(t, ta) {
        let s = dlVue({ pr, reg, rep, drops }, t, ta);
        // la roche suivie : un morceau de manteau (ou de gabbro) qui remonte le long de la faille, ou les coussins de l'axe
        const dep = V_PLAQUE * ta;
        let q;
        if (suivi === "basalte") { const x = -dep * 0.9 - 0.3; q = [pr.X(x), pr.Y(DK.zFondHW(x) - 0.3)]; }
        else { const [x, z] = DK.pt(DK.versSN(p.suiviDepart || [-8.2, 13.6])[0] + dep, suivi === "gabbro" ? 1.2 : p.suiviDepart ? 0.7 : 2.6); q = [pr.X(x), pr.Y(z)]; }
        // le mouvement des deux plaques : celle de gauche s'éloigne, celle de droite remonte le long de la faille puis s'éloigne
        const ff = Pk(pr, Array.from({ length: 9 }, (_, k) => DK.pt(DK.versSN([-6.5, 11.8])[0] + k * 1.6, 3.4)));
        s += pline(ff, "rgba(30,35,30,.55)", 1.6) + fleche(ff[7][0], ff[7][1], ff[8][0], ff[8][1], { c: "rgba(30,35,30,.55)", sw: 1.6, pointe: 6 });
        s += fleche(pr.X(24), pr.Y(6.2), pr.X(34), pr.Y(6.2), { c: "rgba(30,35,30,.55)", sw: 1.6, pointe: 6 }) + fleche(pr.X(-16), pr.Y(8.3), pr.X(-26), pr.Y(8.3), { c: "rgba(30,35,30,.55)", sw: 1.6, pointe: 6 });
        // l'eau de mer descend par des fissures jusqu'à la roche suivie
        if (p.eau) for (const f of fractures) {
          const x0 = q[0] + f.dx * pr.k * 1.4, y0 = pr.Y(DK.zFond(pr.x(x0))) + 1, x1 = q[0] + f.dx * 2, y1 = q[1] - 2;
          s += line(x0, y0, x1, y1, "rgba(20,30,40,.6)", 1);
          for (let k = 0; k < 3; k++) { const u = (ta * 0.22 + k / 3 + f.dx) % 1; s += circ(lerp(x0, x1, u), lerp(y0, y1, u), 1.5, "#7fc0e8", { opacity: op(Math.sin(u * Math.PI) * fen(t, 0.04, 0.2)) }); }
        }
        s += circ(q[0], q[1], 4, "#c0392b", { stroke: "#fff", "stroke-width": 1.3 });
        // étiquettes
        const X0 = pr.X(0);
        s += txt(X0, pr.Y(0) - 5, "dorsale (axe)", { a: "middle", petit: true });
        s += fleche(X0 - 30, 12, X0 - 62, 12, { sw: 2, pointe: 7 }) + fleche(X0 + 30, 12, X0 + 62, 12, { sw: 2, pointe: 7 }) + txt(X0 + 68, 15, p.vitesse || "≈ 1 cm par an de chaque côté", { petit: true });
        s += txt(pr.X(DK.T[0]) + 6, pr.Y(0) + 9, "fumeur noir", { petit: true, clair: true });
        s += txt(12, pr.Y(6.0), "filons et coussins nés à l'axe,", { petit: true }) + txt(12, pr.Y(6.0) + 9, "puis emportés par la plaque", { petit: true });
        const fh = Pk(pr, Array.from({ length: 7 }, (_, k) => DK.pt(DK.versSN([-3.4, 8.6])[0] - k * 1.4, -1.1)));
        s += pline(fh, "rgba(30,35,30,.55)", 1.6) + fleche(fh[5][0], fh[5][1], fh[6][0], fh[6][1], { c: "rgba(30,35,30,.55)", sw: 1.6, pointe: 6 });
        s += cartouche(330, 156, 146, [[null, "Dorsale lente : peu de magma."], [null, "Les plaques s'écartent surtout"], [null, "en glissant le long d'une grande"], [null, "faille inclinée (détachement) :"], [null, "le bloc du dessous y remonte."]]);
        s += txt(W - 8, pr.Y(DK.zFond(pr.x(W - 8))) + 16, "le manteau remonte le long de la faille : un dôme", { a: "end", petit: true });
        s += txt(pr.X(-14), pr.Y(10.5), "faille de détachement", { a: "middle", petit: true });
        s += line(pr.X(-10.5), pr.Y(10.2), pr.X(-7), pr.Y(12.2), "#27302d", 0.7);
        s += txt(pr.X(2.5), pr.Y(DK.CH.z) + 3, "chambre", { petit: true });
        s += txt(pr.X(-18), pr.Y(13.5), "manteau : péridotite (gabbros en lentilles)", { a: "middle", petit: true });
        s += txt(X0, pr.Y(36) - 6, p.texte || "le manteau monte sous l'axe et fond en partie", { a: "middle", petit: true });
        s += line(6, pr.Y(0), 6, pr.Y(30), "#27302d", 1); for (const z of [10, 20, 30]) s += line(3, pr.Y(z), 6, pr.Y(z), "#27302d", 1) + txt(9, pr.Y(z) + 3, `${z} km`, { petit: true });
        // cadre de la vue rapprochée (étape suivante)
        if (p.zoom) {
          const zf = fen(t, 0.7, 0.85);
          if (zf > 0) s += `<g opacity="${op(zf)}">` + rect(pr.X(ZOOM.x0), pr.Y(ZOOM.z0), (ZOOM.x1 - ZOOM.x0) * pr.k, (ZOOM.z1 - ZOOM.z0) * pr.k, "none", { stroke: "#fff", "stroke-width": 1.4, "stroke-dasharray": "4 3" })
            + txt(pr.X(ZOOM.x1) + 5, pr.Y(ZOOM.z1) - 3, "vue rapprochée à l'étape 2", { petit: true }) + `</g>`;
        }
        s += compteur(68, 12, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }

  // ── la vue rapprochée (étapes 2, 3, 4) ──
  const ZL = 320;                                                                     // largeur de la coupe (le reste : panneau)
  function dlZoomFond(o = {}) {
    const pr = P_ZOOM, reg = dlRegions(pr.x(-4), pr.x((o.L || ZL) + 4));
    const Rm = alea("dlzm"), cHW = nid("zhw"), cS = nid("zs");
    let s = `<defs><clipPath id="${cS}"><rect x="0" y="0" width="${o.L || ZL}" height="${H}"/></clipPath><clipPath id="${cHW}"><polygon points="${P(Pk(pr, reg.hw))}"/></clipPath></defs>`;
    s += `<g clip-path="url(#${cS})">` + rect(0, 0, W, H, OPH.eau);
    let hw = rect(-10, -10, W + 20, H + 20, OPH.periH);
    const toit = reg.hw.filter(([x, z]) => z <= DK.zFondHW(x) + 0.01);
    hw += poly(Pk(pr, toit.concat(toit.slice().reverse().map(([x, z]) => [x, z + 1]))), OPH.serp, { opacity: 0.8 });
    const bf = reg.faille;
    hw += poly(Pk(pr, bf.concat(bf.slice().reverse().map(([x, z]) => [x - 0.3, z - 0.3]))), OPH.serp, { opacity: 0.6 });
    for (let k = 0; k < 90; k++) { const x = pr.x(Rm() * ZL), z = DK.zFondHW(x) + 0.2 + Rm() * 10; hw += line(pr.X(x), pr.Y(z), pr.X(x) + 3, pr.Y(z) + 2, "rgba(40,55,30,.32)", 0.7); }
    hw += poly(Pk(pr, lentilleXZ(-5.5, 5.6, 1.1, 0.3)), OPH.gab);                     // une ancienne lentille de gabbro, partie vers la gauche
    for (let k = 0; k < 9; k++) { const x = -1 - k; hw += line(pr.X(x), pr.Y(DK.zFondHW(x) + 0.12), pr.X(x), pr.Y(DK.zFondHW(x) + 1.7), "rgba(28,34,30,.5)", 1.3); }
    s += `<g clip-path="url(#${cHW})">${hw}</g>`;
    s += `</g>`;
    return { fond: s, reg, cS, pr };
  }
  function dlMurZoom(dep = 0, chambre = "") {
    // compartiment du dessous : dessiné en (s, n) pour pouvoir glisser le long de la faille (dep, km)
    const pr = P_ZOOM, Rm = alea("dlzf");
    let s = rect(-10, -10, W + 20, H + 20, OPH.peri);
    const b1 = [], b2 = []; for (let s0 = 0; s0 <= DK.L; s0 += 0.3) { b1.push(DK.pt(s0, 0)); b2.unshift(DK.pt(s0, 1)); }
    s += poly(Pk(pr, b1.concat(b2)), OPH.serp, { opacity: 0.85 });
    const sR = DK.versSN([-6.5, 11.6])[0];
    for (let k = 0; k < 190; k++) { const s0 = sR - 12 + Rm() * 34, n = 0.12 + Rm() * 9, a = Rm() * Math.PI; if (s0 + dep < 0) continue; const [x, z] = DK.pt(s0 + dep, n); s += line(pr.X(x), pr.Y(z), pr.X(x) + Math.cos(a) * 3, pr.Y(z) + Math.sin(a) * 3, "rgba(45,60,30,.33)", 0.7); }
    s += poly(Pk(pr, lentilleSN(DK.versSN([4.2, 6.4])[0] + dep, 1.6, 1.1, 0.3)), OPH.gab);   // une lentille plus ancienne, déjà en route
    return s + chambre;
  }
  // chenaux du liquide sous la chambre (vue rapprochée)
  const CHENAUX = [[-1.2, -0.4], [0, 0], [1.2, 0.5]].map(([dx, d2]) => [[dx * 1.6, 14.5], [dx * 1.4 + 0.3, 13.2], [dx * 1.2 - 0.2, 12], [dx + d2 * 0.3, 10.7], [dx * 0.8, DK.CH.z + DK.CH.rz * Math.sqrt(1 - (dx * 0.8 / DK.CH.rx) ** 2) - 0.05]]);
  function dlPanneau(x0 = ZL) { return rect(x0, 0, W - x0, H, "#f3f1ea") + line(x0, 0, x0, H, "rgba(0,0,0,.18)", 1); }
  function dlRegle() {
    const pr = P_ZOOM, y0 = pr.Y(DK.zFond(0));
    let s = line(4, y0, 4, y0 + 180, "#27302d", 1);
    for (let k = 0; k <= 9; k++) s += line(4, y0 + k * 20, 7, y0 + k * 20, "#27302d", 1) + (k % 2 === 0 && k ? txt(9, y0 + k * 20 + 3, `${k} km`, { petit: true }) : "");
    return s + txt(9, y0 + 3, "fond", { petit: true, clair: true });
  }
  function dlLabFaille(x, texte, pr = P_ZOOM) {
    const z = DK.zFaille(x), z2 = DK.zFaille(x + 0.2), a = Math.atan2(pr.Y(z2) - pr.Y(z), pr.X(x + 0.2) - pr.X(x)) * 180 / Math.PI;
    return `<text x="${r1(pr.X(x))}" y="${r1(pr.Y(z) - 3)}" text-anchor="middle" class="fa-lab fa-petit" transform="rotate(${r1(a)} ${r1(pr.X(x))} ${r1(pr.Y(z))})">${texte}</text>`;
  }
  // la chambre en coordonnées de la vue rapprochée
  const CHZ = { x: P_ZOOM.X(DK.CH.x), y: P_ZOOM.Y(DK.CH.z), rx: DK.CH.rx * 20, ry: DK.CH.rz * 20 };
  const dlToit = (X) => CHZ.y - CHZ.ry * Math.sqrt(Math.max(0, 1 - ((X - CHZ.x) / CHZ.rx) ** 2));
  function partiel(pts, u) {
    if (u >= 1) return pts;
    const q = lePlong(pts, u), out = [pts[0]];
    for (let i = 1; i < pts.length && pts._c[i] < u * pts._L; i++) out.push(pts[i]);
    out.push([q.x, q.y]);
    return out;
  }
  // la chambre qui cristallise (vue rapprochée) : liquide, cumulats, cristaux qui tombent, filons de trondhjémite
  function dlChambre(p) {
    const { x: CXc, y: CYc, rx: RXc, ry: RYc } = CHZ;
    const R = alea("dlch" + p.graine);
    const niveau = tableEllipse(CXc, CYc, RXc, RYc);
    const liq1 = (p.liquideFin ?? 6) / 100, liq = (e) => lerp(1, liq1, e), yToit = (e) => niveau(1 - liq(e));
    const cL0 = p.couleurs ? p.couleurs[0] : "#c2401f", cL1 = p.couleurs ? p.couleurs[1] : "#f1c79a";
    const BANDES = p.bandes || OPH.bandes;
    const PH = p.cristaux || [["olivine", "#8ea459", 0.0, 0.34], ["pyroxène", "#3b463f", 0.16, 0.62], ["plagioclase", "#efebe1", 0.4, 0.95]];
    const cristaux = [];
    PH.forEach(([, c, a, b]) => { for (let k = 0; k < 22; k++) cristaux.push({ c, x: CXc - RXc * 0.8 + R() * RXc * 1.6, y0: CYc - RYc * 0.75 + R() * RYc * 0.4, t0: lerp(a, b, R()), r: 0.9 + R() * 0.8, rot: R() * 180, pl: c === "#efebe1" }); });
    const grains = Array.from({ length: 150 }, () => [CXc - RXc + R() * 2 * RXc, CYc - RYc + R() * 2 * RYc, R() * 180]);
    const filons = p.filons ? [-28, -9, 12, 30].map((dx, i) => { const X = CXc + dx, y = dlToit(X); return [[X, y + 4], [X + (i % 2 ? 3 : -2), y - 5], [X + (i % 2 ? 1 : 2), y - 11 + (i === 1 ? -4 : 0)]]; })
      .concat([[[CXc - 4, CYc - 8], [CXc + 3, CYc - 3]], [[CXc + 20, CYc - 10], [CXc + 16, CYc - 4]]]) : [];
    const clip = nid("dlk");
    const couleurFinale = p.filons ? OPH.trond : BANDES[BANDES.length - 1][0];
    return {
      liq, yToit, filons, couleurFinale, BANDES,
      // intérieur à l'avancement e (0 : tout liquide, 1 : fin) ; solide : le dernier liquide cristallise à son tour
      dessin(e, t, filonsU = 0, solide = 0) {
        const yT = yToit(e);
        let d = rect(CXc - RXc, CYc - RYc, 2 * RXc, 2 * RYc, melange(melange(cL0, cL1, e), couleurFinale, solide));
        let bas = CYc + RYc;
        for (const [c, tf] of BANDES) {
          const haut = Math.max(yT, yToit(Math.min(e, tf)));
          if (haut < bas) d += rect(CXc - RXc, haut, 2 * RXc, bas - haut, c);
          bas = haut;
          if (bas <= yT) break;
        }
        for (const [x, y, a] of grains) if (y > yT + 1) d += `<rect x="${r1(x - 1)}" y="${r1(y - 0.5)}" width="2" height="1" fill="rgba(0,0,0,.2)" transform="rotate(${r1(a)} ${r1(x)} ${r1(y)})"/>`;
        if (t != null) for (const c of cristaux) {
          const u = (t - c.t0) / 0.12;
          if (u < 0 || u > 1) continue;
          const y = lerp(c.y0, yToit(Math.min(1, e + 0.05)), u * u);
          if (y > yT) continue;
          d += c.pl ? `<rect x="${r1(c.x - c.r * 1.6)}" y="${r1(y - c.r * 0.5)}" width="${r1(c.r * 3.2)}" height="${r1(c.r)}" fill="${c.c}" stroke="rgba(0,0,0,.4)" stroke-width=".4" transform="rotate(${r1(c.rot)} ${r1(c.x)} ${r1(y)})"/>`
            : circ(c.x, y, c.r, c.c, { stroke: "rgba(0,0,0,.35)", "stroke-width": 0.4 });
        }
        let s = `<clipPath id="${clip}"><ellipse cx="${CXc}" cy="${CYc}" rx="${RXc}" ry="${RYc}"/></clipPath><g clip-path="url(#${clip})">${d}</g>`
          + ell(CXc, CYc, RXc, RYc, "none", { stroke: "#5b4636", "stroke-width": 1.2 });
        if (filonsU > 0) for (const f of filons) s += pline(partiel(f, filonsU), "#6f675a", 2.4) + pline(partiel(f, filonsU), OPH.trond, 1.5);
        return s;
      },
    };
  }
  // décor commun des étapes 2 et 3 : coussins de l'axe, filon (actif ou figé), sédiments, faille
  function dlZoomHaut(o) {
    const pr = P_ZOOM;
    let s = "";
    const sedP = [], fondP = [];
    for (let x = pr.x(0); x <= pr.x(o.L || ZL); x += 0.1) { fondP.push([x, DK.zFond(x)]); sedP.push([x, DK.zFond(x) - DK.sed(x)]); }
    s += poly(Pk(pr, fondP.concat(sedP.reverse())), OPH.sed);
    s += pline(Pk(pr, DK.F.filter(([x]) => x <= DK.T[0] + 0.01)), "#3b3026", 1.3);
    s += dlLabFaille(-4.6, "faille de détachement");
    return s;
  }

  // 2 · la chambre se remplit (vue rapprochée, centrée sur elle) : le liquide arrive par des chenaux, gonfle la chambre
  // à chaque arrivée ; une partie monte par un filon, dans l'axe, et fait les coussins ; l'eau de mer chauffée remonte le
  // long de la faille jusqu'au fumeur noir. Panneau : la vue d'ensemble de l'étape 1, en petit, avec le cadre du zoom.
  SCENES.chambreRemplissage = function (p) {
    const R = alea("crp" + p.graine), base = dlZoomFond(), pr = P_ZOOM;
    const chenaux = CHENAUX.map((c) => Pk(pr, c));
    const gouttes = Array.from({ length: 21 }, (_, i) => ({ k: i % 3, ph: R() }));
    const INJ = [[0.04, 0.2], [0.17, 0.2], [0.3, 0.2], [0.6, 0.25], [0.74, 0.25]];
    // vignette : la vue d'ensemble de l'étape 1 réduite (mêmes objets), cadre du zoom
    const MP = projDL(400, 50, 2.3), mini = { pr: MP, reg: dlRegions(MP.x(ZL + 4), MP.x(W + 4)), rep: dlRepères(alea("dlrep")),
      drops: Array.from({ length: 10 }, () => { const v = Math.sqrt(R()), u = R() - 0.5; return { x0: u * 36 * v, z0: lerp(21, 34, v), ph: R(), r: 0.9 }; }) };
    const cM = nid("mini");
    return {
      fond: base.fond,
      anim(t, ta) {
        let s = `<g clip-path="url(#${base.cS})">`;
        // compartiment du dessous (la chambre y est, juste sous la faille)
        const g = 0.12 + 0.88 * (INJ.reduce((a, [t0, w]) => a + w * fen(t, t0, t0 + 0.1), 0) - 0.1 * fen(t, 0.45, 0.58));
        const rx = CHZ.rx * (0.3 + 0.7 * g), ry = CHZ.ry * (0.3 + 0.7 * g);
        let m = "";
        for (const c of chenaux) m += pline(c, MAGMA, 1.6, { opacity: 0.45 });
        for (const d of gouttes) {
          const u = (d.ph + ta * 0.16) % 1, q = lePlong(chenaux[d.k], u);
          m += `<ellipse cx="${r1(q.x)}" cy="${r1(q.y)}" rx="2.6" ry="1.6" fill="${MAGMA}" transform="rotate(${r1(q.a * 180 / Math.PI)} ${r1(q.x)} ${r1(q.y)})" opacity="${op(Math.min(1, u * 6, (1 - u) * 10))}"/>`;
        }
        m += ell(CHZ.x, CHZ.y, rx, ry, MAGMA, { stroke: "#5b4636", "stroke-width": 1.1 }) + ell(CHZ.x - rx * 0.15, CHZ.y - ry * 0.35, rx * 0.6, ry * 0.35, MAGMA_CLAIR, { opacity: 0.45 });
        for (let k = 0; k < 6; k++) { const a = ta * 0.8 + k; m += circ(CHZ.x + Math.cos(a) * rx * 0.6, CHZ.y + Math.sin(a) * ry * 0.5, 1, "#ffd08a", { opacity: 0.6 }); }
        const cFW = nid("zfw");
        s += `<clipPath id="${cFW}"><polygon points="${P(Pk(pr, base.reg.fw))}"/></clipPath><g clip-path="url(#${cFW})">${dlMurZoom(0, m)}</g>`;
        // filon dans l'axe, de la chambre jusqu'au fond, puis coussins
        // trop pleine, la chambre casse son toit : un filon monte en quelques jours et le magma sort en coussins
        const fil = fen(t, 0.43, 0.5), yH = pr.Y(DK.zFond(0)), yB = CHZ.y - ry;
        if (fil > 0) s += line(CHZ.x, yB, CHZ.x, lerp(yB, yH, fil), melange(MAGMA, "#3e4743", fen(t, 0.62, 0.95)), 1.8);
        s += dlZoomHaut({});
        const nc = Math.round(12 * fen(t, 0.49, 0.62));
        if (nc > 0) s += monticule(pr, 0, nc, 3, t < 0.64);
        if (fil > 0) s += txt(CHZ.x + 5, pr.Y(5.4), "filon", { petit: true, op: fen(t, 0.44, 0.5) });
        s += circulation(pr, ta) + fumeur(pr, ta);
        if (g > 0.5) s += txt(CHZ.x, CHZ.y + 3, "basalte liquide", { a: "middle", petit: true, clair: true, op: fen(g, 0.5, 0.65) });
        s += `</g>`;
        // étiquettes
        s += txt(6, 12, "océan alpin, ≈ 3,5 km d'eau", { petit: true, clair: true });
        s += txt(pr.X(DK.T[0]) - 6, 24, "fumeur noir :", { a: "end", petit: true, clair: true }) + txt(pr.X(DK.T[0]) - 6, 32, "l'eau chauffée remonte la faille", { a: "end", petit: true, clair: true });
        s += circ(pr.X(-5.6), pr.Y(4.9), 1.6, "#8cc8ec") + txt(pr.X(-5.6) + 4, pr.Y(4.9) + 3, "eau de mer froide", { petit: true, clair: true })
          + circ(pr.X(-5.6), pr.Y(5.5), 1.6, "#ee9d5c") + txt(pr.X(-5.6) + 4, pr.Y(5.5) + 3, "eau chauffée", { petit: true, clair: true });
        if (nc > 3) s += txt(CHZ.x - 34, pr.Y(DK.zFond(-1.7)) - 5, "coussins", { a: "end", petit: true, clair: true });
        s += txt(CHZ.x, CHZ.y + CHZ.ry + 13, "chambre, 4 à 5 km sous le fond", { a: "middle", petit: true });
        s += txt(ZL - 4, 206, "manteau : péridotite", { a: "end", petit: true });
        s += txt(ZL - 4, pr.Y(DK.zFaille(7.4)) + 22, "serpentinite", { a: "end", petit: true, clair: true });
        s += dlRegle();
        // panneau : la vue d'ensemble en petit
        s += dlPanneau() + `<clipPath id="${cM}"><rect x="${ZL + 8}" y="34" width="${W - ZL - 16}" height="108"/></clipPath>`
          + `<g clip-path="url(#${cM})">` + rect(ZL + 8, 34, W - ZL - 16, 108, "#dbe9f1") + rect(ZL + 8, MP.Y(0), W - ZL - 16, 142 - MP.Y(0), OPH.eau) + dlVue(mini, t, ta) + `</g>`
          + rect(ZL + 8, 34, W - ZL - 16, 108, "none", { stroke: "rgba(0,0,0,.25)" });
        s += rect(MP.X(ZOOM.x0), MP.Y(ZOOM.z0), (ZOOM.x1 - ZOOM.x0) * MP.k, (ZOOM.z1 - ZOOM.z0) * MP.k, "none", { stroke: "#fff", "stroke-width": 1.2, "stroke-dasharray": "3 2" });
        s += line(MP.X(ZOOM.x0), MP.Y(ZOOM.z0), ZL, 0, "rgba(0,0,0,.2)", 0.8) + line(MP.X(ZOOM.x0), MP.Y(ZOOM.z1), ZL, H, "rgba(0,0,0,.2)", 0.8);
        s += txt(400, 29, "la dorsale de l'étape 1", { a: "middle", petit: true });
        (t > 0.43 && t < 0.85 ? ["trop pleine, la chambre casse", "son toit : le magma monte par", "un filon (en quelques jours)", "et sort en coussins sur le", "fond ; puis elle se remplit"]
          : ["le liquide né dans le manteau", "monte sous l'axe et s'arrête", "juste sous la faille, 4 à 5 km", "sous le fond : la chambre", "gonfle à chaque arrivée"]).forEach((l, i) => { s += txt(ZL + 8, 160 + i * 10, l, { petit: true }); });
        s += compteur(400, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 160, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // 3 · la chambre refroidit sur place et cristallise : plus rien n'arrive par les chenaux (à une dorsale lente, le liquide
  // arrive par à-coups), la roche autour est froide et l'eau de mer emporte la chaleur par la faille (le fumeur noir, c'est
  // la chaleur de la chambre qui s'en va) ; en quelques milliers d'années la plaque n'a bougé que de quelques dizaines de
  // mètres. Cristaux qui tombent, cumulats (le gabbro), derniers liquides en filons de trondhjémite. Même vue qu'à l'étape 2.
  SCENES.chambreCristallisation = function (p) {
    const base = dlZoomFond(), pr = P_ZOOM, ch = dlChambre(p);
    const chenaux = CHENAUX.map((c) => Pk(pr, c));
    const si0 = p.silice ? p.silice[0] : 48, si1 = p.silice ? p.silice[1] : 70;
    const T0 = p.tDebut ?? 1200, T1 = p.tFin ?? 920;
    const zones = p.zones || [[45, "gabbro"], [52, "diorite"], [63, "tonalite"], [69, "trondhjémite"]];
    const XJ = 414, J0 = 44, J1 = 72, SI = (v) => 196 - (v - J0) / (J1 - J0) * 146;
    let panneau = dlPanneau() + rect(XJ, SI(J1), 9, SI(J0) - SI(J1), "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 3 });
    zones.forEach(([v, nom], i) => {
      const haut = i + 1 < zones.length ? zones[i + 1][0] : J1;
      panneau += rect(XJ + 1, SI(haut), 7, SI(v) - SI(haut), i % 2 ? "#e6dccb" : "#f6f0e4") + line(XJ - 4, SI(v), XJ + 13, SI(v), "#27302d", 0.8)
        + txt(XJ + 16, (SI(v) + SI(haut)) / 2 + 3, nom, { petit: true });
    });
    panneau += txt(XJ + 4, 40, "silice du liquide", { a: "middle", petit: true });
    const fleches = [[-0.45, -1], [0.45, -1], [1, -0.8], [-1.2, 0.1], [1.2, 0.1], [-0.8, 1], [0, 1.1], [0.8, 1]];
    return {
      fond: base.fond,
      anim(t, ta) {
        const e = fen(t, 0.04, 0.8), fu = fen(t, 0.8, 0.96), arret = fen(t, 0, 0.12);
        let s = `<g clip-path="url(#${base.cS})">`;
        let m = "";
        for (const c of chenaux) m += pline(c, melange(MAGMA, "#6f6f5a", arret), 1.6, { opacity: 0.45 * (1 - 0.6 * arret) });
        m += ch.dessin(e, t, fu, fu);
        const cFW = nid("zfw");
        s += `<clipPath id="${cFW}"><polygon points="${P(Pk(pr, base.reg.fw))}"/></clipPath><g clip-path="url(#${cFW})">${dlMurZoom(0, m)}</g>`;
        s += line(CHZ.x, CHZ.y - CHZ.ry, CHZ.x, pr.Y(DK.zFond(0)), "#3e4743", 1.8) + dlZoomHaut({}) + monticule(pr, 0, 12, 3, false);
        // la chaleur s'en va : dans la roche froide autour, et avec l'eau de mer qui remonte la faille
        const ch2 = 1 - 0.7 * fen(t, 0.7, 1);
        for (const [dx, dy] of fleches) {
          const u = (ta * 0.35 + (dx + dy) * 0.3) % 1, x0 = CHZ.x + dx * (CHZ.rx + 4), y0 = CHZ.y + dy * (CHZ.ry + 4);
          const nx = dx / Math.hypot(dx, dy), ny = dy / Math.hypot(dx, dy);
          s += fleche(x0 + nx * u * 8, y0 + ny * u * 8, x0 + nx * (u * 8 + 11), y0 + ny * (u * 8 + 11), { c: "#d8452b", sw: 1.8, pointe: 5, op: 0.85 * ch2 * Math.sin(u * Math.PI) });
        }
        s += circulation(pr, ta, ch2 + 0.2) + fumeur(pr, ta, ch2 + 0.1);
        s += `</g>`;
        s += txt(6, 12, "océan alpin, ≈ 3,5 km d'eau", { petit: true, clair: true });
        s += txt(pr.X(DK.T[0]) - 6, 24, "fumeur noir : la chaleur", { a: "end", petit: true, clair: true }) + txt(pr.X(DK.T[0]) - 6, 32, "part avec l'eau de mer", { a: "end", petit: true, clair: true });
        s += txt(CHZ.x, 196, "plus d'arrivée de liquide : les chenaux se figent", { a: "middle", petit: true, op: arret });
        if (e > 0.25) s += txt(CHZ.x, CHZ.y + CHZ.ry + 13, p.labCumulats || "cumulats : le futur gabbro", { a: "middle", petit: true, op: fen(e, 0.25, 0.4) });
        if (p.filons) s += txt(CHZ.x + CHZ.rx + 6, CHZ.y - CHZ.ry - 4, "filons clairs :", { petit: true, op: fen(t, 0.86, 0.96) }) + txt(CHZ.x + CHZ.rx + 6, CHZ.y - CHZ.ry + 5, "trondhjémite", { petit: true, op: fen(t, 0.86, 0.96) });
        s += dlRegle();
        // jauges : silice du liquide, température
        const si = lerp(si0, si1, e), T = lerp(T0, T1, e);
        s += panneau + rect(XJ + 1, SI(si), 7, SI(J0) - SI(si) - 1, "rgba(192,57,43,.55)") + poly([[XJ - 2, SI(si)], [XJ - 8, SI(si) - 4], [XJ - 8, SI(si) + 4]], "#c0392b");
        s += txt(XJ - 11, SI(si) + 3, `${nombre(si)} %`, { a: "end", petit: true });
        const lo = Math.floor((T1 - 60) / 100) * 100, hi = Math.ceil((T0 + 40) / 100) * 100;
        s += thermometre(ZL + 16, 50, 126, T, lo, hi, [lo + 100, Math.round((lo + hi) / 200) * 100, hi - 100].filter((v, i, a) => a.indexOf(v) === i));
        s += txt(ZL + 16, 40, `${nombre(T)} °C`, { a: "middle", petit: true });
        s += txt(400, 212, `liquide restant : ${nombre(ch.liq(e) * 100)} %`, { a: "middle", petit: true });
        s += txt(400, 224, "en quelques milliers d'années,", { a: "middle", petit: true }) + txt(400, 233, "la plaque n'a bougé que de ≈ 30 m", { a: "middle", petit: true });
        s += compteur(400, 14, p.ages ? lerp(p.ages[0], p.ages[1], t) : 160, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // 4 · la faille de détachement ramène la chambre au fond de l'océan : le compartiment du dessous GLISSE le long de la
  // faille (chaque point garde sa distance à la faille : coordonnées (s, n)), en ≈ 1 million d'années à ≈ 1 cm par an ; le
  // gabbro et sa trondhjémite arrivent juste sous le fond, des sédiments les couvrent, des coussins s'épanchent par endroits.
  // Coupe un peu plus large (360 px) pour voir le dôme ; panneau : les roches de ce fond d'océan (même légende qu'au charriage).
  SCENES.detachementDorsale = function (p) {
    const L4 = 360, base = dlZoomFond({ L: L4 }), pr = P_ZOOM, ch = dlChambre(Object.assign({}, p));
    const DEP = p.deplacement ?? 9.2;
    // la chambre figée à la fin de l'étape 3, découpée en polygones puis exprimée en (s, n)
    const { x: cx, y: cy, rx, ry } = CHZ;
    const niveau = tableEllipse(cx, cy, rx, ry), yToit = (e) => niveau(1 - lerp(1, (p.liquideFin ?? 6) / 100, e));
    const tranche = (yh, yb) => {                                                        // morceau d'ellipse entre deux hauteurs
      const pts = [], n = 18;
      for (let k = 0; k <= n; k++) { const y = lerp(yb, yh, k / n), w = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)); pts.push([cx + w, y]); }
      for (let k = 0; k <= n; k++) { const y = lerp(yh, yb, k / n), w = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)); pts.push([cx - w, y]); }
      return pts;
    };
    const couches = [];
    let bas = cy + ry;
    for (const [c, tf] of ch.BANDES) { const haut = yToit(tf); couches.push([c, tranche(haut, bas)]); bas = haut; }
    couches.push([ch.couleurFinale, tranche(cy - ry, bas)]);
    const enSN = (pts) => pts.map(([X, Y]) => DK.versSN([pr.x(X), pr.z(Y)]));
    const couchesSN = couches.map(([c, pg]) => [c, enSN(pg)]), contourSN = enSN(tranche(cy - ry, cy + ry));
    const filonsSN = ch.filons.map(enSN);
    const verse = (sn, d) => Pk(pr, sn.map(([s0, n]) => DK.pt(s0 + d, n)));
    const filonBas = [DK.versSN([0, DK.CH.z - DK.CH.rz]), DK.versSN([0, DK.zFaille(0) + 0.03])];   // la partie du filon sous la faille
    const suiviSN = DK.versSN(p.suivi === "gabbro" ? [0, 8.95] : p.suivi === "cumulats" ? [0.4, 9.2] : [-1.6, 8.25]);
    const legende = [[OPH.sed, "sédiments"], [OPH.cous, "coussins de basalte"], [null, "gabbro (cumulats)"], [OPH.trond, "trondhjémite"], [OPH.serp, "serpentinite"], [OPH.peri, "péridotite (manteau)"]];
    let panneau = dlPanneau(L4) + txt(420, 20, "le fond de", { a: "middle" }) + txt(420, 31, "l'océan alpin", { a: "middle" });
    legende.forEach(([c, nom], i) => {
      const y = 52 + i * 15;
      if (c) panneau += rect(L4 + 6, y - 8, 10, 10, c, { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 });
      else { OPH.bandes.forEach(([cb], j) => { panneau += rect(L4 + 6, y - 8 + j * 10 / 3, 10, 10 / 3 + 0.2, cb); }); panneau += rect(L4 + 6, y - 8, 10, 10, "none", { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }); }
      panneau += txt(L4 + 20, y, nom, { petit: true });
    });
    ["c'est ce fond d'océan,", "mince (moins de 600 m),", "que la fermeture de", "l'océan charriera sur", "le continent (étape 5)"].forEach((l, i) => { panneau += txt(L4 + 6, 164 + i * 10, l, { petit: true }); });
    return {
      fond: base.fond,
      anim(t, ta) {
        const d = DEP * fen(t, 0.05, 0.82);
        let s = `<g clip-path="url(#${base.cS})">`;
        let m = "";
        for (const [c, sn] of couchesSN) m += poly(verse(sn, d), c);
        m += poly(verse(contourSN, d), "none", { stroke: "#5b4636", "stroke-width": 1.2 });
        if (p.filons) for (const f of filonsSN) { const q = verse(f, d); m += pline(q, "#6f675a", 2.4) + pline(q, OPH.trond, 1.5); }
        m += pline(verse(filonBas, d), "#3e4743", 1.8);
        const cFW = nid("zfw");
        s += `<clipPath id="${cFW}"><polygon points="${P(Pk(pr, base.reg.fw))}"/></clipPath><g clip-path="url(#${cFW})">${dlMurZoom(d, m)}</g>`;
        // en haut : la partie du filon au-dessus de la faille et les coussins restent sur le compartiment du dessus
        s += line(CHZ.x, pr.Y(DK.zFaille(0)), CHZ.x, pr.Y(DK.zFond(0)), "#3e4743", 1.8) + dlZoomHaut({ L: L4 }) + monticule(pr, 0, 12, 3, false);
        const nv = fen(t, 0.8, 0.95);
        if (nv > 0) for (const [x, n] of [[7.6, 5], [9.4, 6]]) s += `<g opacity="${op(nv)}">${line(pr.X(x), pr.Y(DK.zFond(x) + 1.6), pr.X(x), pr.Y(DK.zFond(x)), "#3e4743", 1)}${monticule(pr, x, n, 2.6, false)}</g>`;
        s += fumeur(pr, ta, 1 - fen(t, 0.1, 0.4));
        s += `</g>`;
        const fl = Pk(pr, Array.from({ length: 9 }, (_, k) => DK.pt(DK.versSN([-4.8, 10.2])[0] + k * 0.7, 1.9)));
        s += pline(fl, "#27302d", 1.4, { opacity: 0.7 }) + fleche(fl[7][0], fl[7][1], fl[8][0], fl[8][1], { sw: 1.4, pointe: 6, op: 0.7 });
        const q = Pk(pr, [DK.pt(suiviSN[0] + d, suiviSN[1])])[0];
        s += circ(q[0], q[1], 3.6, "#c0392b", { stroke: "#fff", "stroke-width": 1.2 });
        s += dlRegle();
        s += txt(L4 / 2, 12, p.texte || "la faille fait remonter le gabbro jusqu'au fond de l'océan", { a: "middle", petit: true, clair: true });
        if (t > 0.8) s += txt(L4 - 6, 26, p.texteFin || "gabbro et trondhjémite au fond", { a: "end", petit: true, clair: true, op: fen(t, 0.82, 0.9) });
        s += panneau + compteur(W - 66, 228, p.ages ? lerp(p.ages[0], p.ages[1], t) : 160, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // charriage d'un morceau de fond d'océan — REFAIT le 23/09/2026 (son retour : « on voit les erreurs et ce n'est pas
  // représentatif »), puis 2ᵉ passe (« ne pas faire monter que notre morceau : les roches avant et après montent aussi ») :
  // le fond qui arrive à la fosse est RABOTÉ EN ÉCAILLES successives (deux avant la nôtre, la nôtre, une après) qui
  // s'empilent en tuiles dans le prisme, chaque nouvelle passant sous les précédentes (d'après Planet-Terre, P. Agard 2021 :
  // le Chenaillet est un « copeau » raboté en avant-arc, comme les Marin Headlands ; empilement Chenaillet / unité du
  // Lago Nero–Replatte / schistes lustrés / Briançonnais : geol-alp.com). ÉCHELLE VRAIE, 5 px par km (96 km de large). L'océan alpin finit de se fermer : son fond plonge sous la
  // plaque apulienne (Adria) ; au bord de la fosse, une mince écaille du fond (≈ 600 m : sédiments, coussins, gabbro et
  // trondhjémite, serpentinite) se décolle sur la serpentinite, tendre, et monte sur le prisme de schistes lustrés au lieu de
  // plonger (vers 50 Ma) ; la marge européenne arrive et passe dessous : l'empilement se soulève (45–35 Ma) ; l'érosion dégage
  // l'écaille, perchée au sommet (le Chenaillet, 2 650 m). UNE variable D (déplacement de la plaque européenne) place tout ce
  // que porte la plaque. Loupe : l'écaille de près, avec les couleurs de l'étape de la faille de détachement.
  // Sources : G. Manatschal, dans Saga Information n° 347 (2015) ; Wikipédia « Mont Chenaillet ».
  // p : ages [début, écaille montée, fin de la collision, fin] (ou [début, fin]), nomEcaille
  SCENES.obduction = function (p) {
    const PX = 5, MER = 46, XH = 300, zF = 4, RB = 40, TH = 30 * Math.PI / 180;
    const Y = (z) => MER + z * PX;
    // point de la plaque européenne : s = abscisse le long du plan (km, 0 à la charnière, > 0 : sous l'Adria), n = km sous le plan
    function pt(s, n) {
      let x, y, f;
      if (s <= 0) { f = 0; x = XH + s * PX; y = Y(zF); }
      else if (s <= RB * TH) { f = s / RB; x = XH + RB * Math.sin(f) * PX; y = Y(zF) + RB * (1 - Math.cos(f)) * PX; }
      else { f = TH; const d = (s - RB * TH) * PX; x = XH + RB * Math.sin(TH) * PX + d * Math.cos(TH); y = Y(zF) + RB * (1 - Math.cos(TH)) * PX + d * Math.sin(TH); }
      return [x - n * PX * Math.sin(f), y + n * PX * Math.cos(f)];
    }
    // coupe de la plaque selon m (km de matière) : m > −35 fond océanique ; de −35 à −70 la marge européenne s'épaissit
    const sm = (a, b, m) => lisse(clamp((m - a) / (b - a)));
    const nTop = (m) => -(zF + 0.4) * sm(-35, -60, m);                                   // dessus de la plaque (négatif : plus haut)
    const nOph = (m) => m > -35 ? 0.6 : nTop(m);                                          // ophiolite ≈ 600 m (Saga 347)
    const nMoho = (m) => m > -35 ? 0.6 : nTop(m) + lerp(2, 30, sm(-35, -80, m));
    const nBase = (m) => m > -35 ? 26 : lerp(26, 60, sm(-35, -80, m));
    const DMAX = 60, S0 = -72, S1 = 48, PAS = 1;
    // écailles successives (km de matière) et déplacement D auquel chacune arrive au bord de la fosse
    const ECS = [[-14.5, -7.5], [-22.5, -15.5], [-30.5, -23.5], [-38.5, -31.5]], NOTRE = 2, TR = 4, NP = 13;
    const D_ACC = ECS.map(([, f]) => -0.8 - f), DA = DMAX * 0.42 / 0.72;
    const trace = (fn, sa, sb, D) => { const out = [], n = Math.max(1, Math.ceil(Math.abs(sb - sa) / PAS)); for (let k = 0; k <= n; k++) { const s = lerp(sa, sb, k / n); out.push(pt(s, fn(s - D))); } return out; };
    const bande = (fh, fb, sa, sb, D, c, o) => sb - sa < 0.3 ? "" : poly(trace(fh, sa, sb, D).concat(trace(fb, sb, sa, D)), c, o);
    const XS = []; for (let x = -4; x <= W + 4; x += 4) XS.push(x);
    const interface_ = (D) => { const l = trace(nTop, S0, S1, D); return (x) => hauteur(l, x); };
    // plaque du dessus : sa surface de départ (fosse à 4 km, prisme, puis côte de l'Adria) et son épaisseur au-dessus du plan
    const I0 = interface_(0);
    const surf0 = (x) => Y(zF) - (zF - 0.8) * PX * sm(XH - 4, XH + 64, x) - 1.2 * PX * sm(XH + 90, XH + 160, x);
    const epais0 = (x) => Math.max(0, I0(x) - surf0(x));
    const bosse = (x) => Math.exp(-(((x - (XH + 40)) / 90) ** 2));
    // état de la coupe à l'instant t
    function etat(t) {
      const D = DMAX * clamp((t - 0.03) / 0.72), fB = fen(t, 0.45, 0.75), fC = fen(t, 0.76, 0.97);
      const I = interface_(D), sh = 26 * fB;
      // l'empilement repose sur la plaque qui plonge ; il avance de 5 km sur la marge et s'épaissit (seulement là où il existe)
      const brut = (x) => { const ep = epais0(x + sh); return I(x) - ep - 12 * fB * bosse(x) * sm(0, 8, ep); };
      return { D, fB, fC, I, brut, sh };
    }
    // les écailles : sur la plaque (bande de 0,6 km), puis dans l'empilement (« tuiles » qui plongent vers l'Adria : chaque
    // nouvelle écaille passe sous les précédentes, qui montent et reculent d'un cran) ; même nombre de points partout
    const IA = interface_(DA);
    const AU = 12;                                                                          // soulèvement de l'empilement (px)
    const surPlaque = ([ma, mb], D) => { const h = [], b = []; for (let k = 0; k < NP; k++) { const m = lerp(ma, mb, k / (NP - 1)); h.push(pt(m + D, nTop(m))); b.push(pt(m + D, nOph(m))); } return h.concat(b.reverse()); };
    const cran = (j) => { const xc = XH + 8 + j * 15, yc = Y(zF) - 2.5 - j * 5.2, h = [], b = [];
      for (let k = 0; k < NP; k++) { const u = k / (NP - 1) - 0.5, x = xc + u * 38, y = yc + u * 38 * 0.2; h.push([x, y]); b.push([x, y + 3]); } return h.concat(b.reverse()); };
    function ecailles(E) {
      return ECS.map((em, k) => {
        const f0 = fen(E.D, D_ACC[k], D_ACC[k] + TR);
        let pg;
        if (f0 <= 0) pg = surPlaque(em, E.D);
        else {
          const j = ECS.reduce((a, _, l) => l > k ? a + fen(E.D, D_ACC[l], D_ACC[l] + TR) : a, 0);
          const c0 = cran(Math.floor(j)), c1 = cran(Math.floor(j) + 1), fj = j - Math.floor(j), cible = c0.map((q, i) => [lerp(q[0], c1[i][0], fj), lerp(q[1], c1[i][1], fj)]);
          const depart = surPlaque(em, D_ACC[k]);
          pg = f0 < 1 ? depart.map((q, i) => [lerp(q[0], cible[i][0], f0), lerp(q[1], cible[i][1], f0)]) : cible;
          // collision : l'empilement avance sur la marge et se soulève avec la plaque qui passe dessous
          pg = pg.map(([x, y]) => { const x2 = x - 14 * E.fB; return [x2, y + (E.I(x2) - IA(x2)) * (E.D > DA ? 1 : 0) - AU * E.fB * bosse(x2)]; });
        }
        return { pg, k, detache: f0 > 0 };
      });
    }
    // érosion : tout s'abaisse, sauf sous l'écaille (dure : basalte, gabbro), qui reste perchée à ≈ 2 650 m
    // érosion (version rétablie à sa demande le 23/09/2026 : « on voyait 4 morceaux de plaque détachés en haut qui
    // s'érodaient, 4 c'était top ») : tout s'abaisse, un peu moins sous notre écaille, dont le haut finit à ≈ 2 650 m
    const fin = etat(1), finEc = ecailles(fin)[NOTRE].pg;
    const hautFin = Math.min(...finEc.slice(0, NP).map(([, y]) => y));
    const e0 = Math.max(0, Y(-2.65) - hautFin), EROS = 6;                                // EROS : les 4 écailles restent visibles
    const erosion = (x, xE, fC) => fC * (lerp(e0, EROS + 3 * Math.sin(x / 11), clamp((Math.abs(x - xE) - 10) / 26)));
    const LOUPE = [60, 190, 34];
    // loupe (devant) : l'écaille de près, de haut en bas
    const devant = (() => {
      const [cx, cy, r] = LOUPE, k = nid("obl"), Rl = alea("obl");
      let c = rect(cx - r, cy - r, 2 * r, 8, OPH.sed) + rect(cx - r, cy - r + 8, 2 * r, 12, OPH.lave);
      for (let x = cx - r + 2; x < cx + r; x += 6) c += circ(x, cy - r + 14 + (x % 12 ? 1.5 : -1.5), 3, OPH.cous, { stroke: "#56605a", "stroke-width": 0.5 });
      OPH.bandes.forEach(([cb], j) => { c += poly([[cx - r, cy - r + 20 + j * 9], [cx + r, cy - r + 16 + j * 9], [cx + r, cy - r + 25 + j * 9], [cx - r, cy - r + 29 + j * 9]], cb); });
      for (const f of [[[cx - 20, cy + 4], [cx - 17, cy - 6], [cx - 21, cy - 14]], [[cx + 4, cy + 6], [cx + 8, cy - 4], [cx + 5, cy - 13]], [[cx + 22, cy + 2], [cx + 25, cy - 9]]]) c += pline(f, "#6f675a", 3) + pline(f, OPH.trond, 2);
      c += rect(cx - r, cy - r + 47, 2 * r, 2 * r - 47, OPH.serp);
      for (let i = 0; i < 26; i++) { const x = cx - r + Rl() * 2 * r, y = cy - r + 49 + Rl() * 24, a = Rl() * Math.PI; c += line(x, y, x + Math.cos(a) * 4, y + Math.sin(a) * 4, "rgba(40,55,30,.4)", 0.7); }
      let s = `<clipPath id="${k}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` + circ(cx, cy, r + 3, "#fff") + `<g clip-path="url(#${k})">${c}</g>`
        + circ(cx, cy, r + 1.5, "none", { stroke: "#27302d", "stroke-width": 1.4 });
      s += txt(cx + r + 6, cy - r + 7, "sédiments", { petit: true }) + txt(cx + r + 6, cy - r + 18, "coussins de basalte", { petit: true })
        + txt(cx + r + 6, cy - r + 35, "gabbro et trondhjémite", { petit: true }) + txt(cx + r + 6, cy - r + 58, "serpentinite", { petit: true })
        + txt(cx, cy + r + 12, "l'écaille de près (≈ 600 m)", { a: "middle", petit: true });
      return s;
    })();
    return {
      fond: ciel(MER) + rect(0, MER, W, H - MER, OPH.eau),
      devant,
      anim(t, ta) {
        const E = etat(t), { D, fB, fC, I } = E, EC = ecailles(E);
        const nt = EC[NOTRE].pg, xE = (nt[0][0] + nt[NP - 1][0]) / 2;
        // le prisme englobe les écailles empilées (elles sont prises dans les schistes lustrés)
        const dessusEc = (x) => {
          let m = Infinity;
          for (const e of EC) if (e.detache) {
            const h = e.pg.slice(0, NP), a = h[0], b = h[NP - 1];
            m = Math.min(m, x < a[0] ? a[1] - 1.5 + (a[0] - x) * 0.45 : x > b[0] ? b[1] - 1.5 + (x - b[0]) * 0.45 : hauteur(h, x) - 1.5);
          }
          return m;
        };
        // l'érosion ne creuse pas sous le niveau de la mer (le pays reste émergé)
        const S = (x) => { const sb = Math.min(E.brut(x), dessusEc(x)); return Math.min(sb + erosion(x, xE, fC), Math.max(sb, MER - 2)); };
        let s = rect(0, MER + 26, W, H, "#dcb584");                                   // bouche les jours entre les polygones
        // plaque européenne : asthénosphère dessous, manteau, croûte continentale, ophiolite du fond océanique
        // (couleurs de la subduction du micaschiste : asthénosphère, manteau de la plaque, croûte continentale)
        s += poly(trace(nBase, S0, S1, D).concat([[W + 60, H + 60], [-60, H + 60]]), "#dcb584");
        s += bande(nMoho, nBase, S0, S1, D, "#97a270");
        const sMarge = clamp(-35 + D, S0, S1);
        s += bande(nTop, nMoho, S0, sMarge, D, "#cdae8c");
        for (const f of [0.3, 0.6]) s += pline(trace((m) => lerp(nTop(m), nMoho(m), f), S0, sMarge, D), "rgba(120,95,60,.25)", 0.8);
        // fond océanique encore sur la plaque ; là où une écaille est partie, il reste la serpentinite
        s += bande(nTop, nOph, sMarge, S1, D, OPH.lave);
        for (const e of EC) if (e.detache) { const [ma, mb] = ECS[e.k]; s += bande(nTop, nOph, clamp(ma + D, S0, S1), clamp(mb + D, S0, S1), D, OPH.serp); }
        // plaque du dessus (Adria) et prisme de schistes lustrés : ils reposent sur la plaque qui plonge
        const haut = [], bas = [];
        for (const x of XS) { const sx = S(x), ix = I(x); if (ix - sx > 0.4) { haut.push([x, sx]); bas.push([x, ix + 1.2]); } }
        if (haut.length > 1) {
          const k = nid("obp"), pg = haut.concat(bas.reverse());
          const XB = (y) => XH + 84 + (y - MER) * 0.45;                                     // limite prisme / Adria
          s += `<clipPath id="${k}"><polygon points="${P(pg)}"/></clipPath><g clip-path="url(#${k})">`
            + rect(0, 0, W, Y(30), "#d9c9a6") + rect(0, Y(30), W, H, "#aab283")
            + poly([[0, 0], [XB(0), 0], [XB(H), H], [0, H]], "#a4a9b0");
          for (let y = 40; y < H; y += 7) s += pline([[0, y], [XB(y) - 60, y + 2], [XB(y), y + 5]], "rgba(60,65,80,.22)", 0.8);
          // les écailles dans l'empilement (l'érosion coupe celles qui dépassent)
          for (const e of EC) if (e.detache) s += poly(e.pg, OPH.lave, { stroke: e.k === NOTRE ? "#c0392b" : "#27302d", "stroke-width": e.k === NOTRE ? 0.9 : 0.5, "stroke-linejoin": "round" })
            + pline(e.pg.slice(0, NP), OPH.sed, 0.9);
          s += `</g>` + pline(haut, "#6d6556", 1.1);
        }
        // écailles encore portées par la plaque
        for (const e of EC) if (!e.detache) s += poly(e.pg, OPH.lave, { stroke: e.k === NOTRE ? "#c0392b" : "rgba(0,0,0,.45)", "stroke-width": e.k === NOTRE ? 0.9 : 0.5 });
        const yE = (nt[Math.floor(NP / 2)][1] + nt[2 * NP - 1 - Math.floor(NP / 2)][1]) / 2;
        s += line(0, MER, W, MER, "rgba(40,90,130,.35)", 0.8, { "stroke-dasharray": "4 3" });
        // loupe : cône vers l'écaille
        const [lx, ly, lr] = LOUPE, phi = Math.atan2(yE - ly, xE - lx);
        s += line(lx + Math.cos(phi) * (lr + 2), ly + Math.sin(phi) * (lr + 2), xE, yE, "#27302d", 0.9, { "stroke-dasharray": "3 2", opacity: 0.7 });
        s += circ(xE, yE, 3.4, "#c0392b", { stroke: "#fff", "stroke-width": 1.1 });
        // étiquettes
        const titre = t < 0.1 ? (p.texte || "l'océan alpin se ferme : son fond plonge sous la plaque apulienne")
          : t < 0.45 ? "le haut du fond est raboté en écailles qui s'empilent"
          : t < 0.76 ? "la marge européenne passe dessous : tout l'empilement se soulève"
          : "l'érosion entame l'empilement des écailles";
        s += txt(286, 14, titre, { a: "middle" });
        if (t < 0.5) s += txt(160, 60, "océan alpin", { a: "middle", petit: true, clair: true, op: 1 - fen(t, 0.35, 0.5) });
        s += txt(8, 104, "marge européenne", { petit: true });
        s += txt(476, 86, "plaque", { a: "end", petit: true }) + txt(476, 95, "apulienne (Adria)", { a: "end", petit: true });
        const xp = XH + 64 - 14 * fB;
        s += txt(xp, (S(xp) + I(xp)) / 2 + 3, "prisme : schistes lustrés", { a: "middle", petit: true });
        const ps = pt(30, 5);
        s += `<text x="${r1(ps[0])}" y="${r1(ps[1])}" text-anchor="middle" class="fa-lab fa-petit" transform="rotate(30 ${r1(ps[0])} ${r1(ps[1])})">le reste du fond océanique plonge</text>`;
        s += fleche(12, 138, 50, 138, { sw: 2, pointe: 7, op: 0.8 }) + txt(56, 141, "la plaque européenne avance", { petit: true });
        if (fC > 0.4) {
          const yt = yE - 2;
          s += line(xE - 8, yt - 1, xE - 24, yt - 6, "#27302d", 0.8, { opacity: op(fen(fC, 0.4, 0.7)) })
            + txt(xE - 26, yt - 4, p.nomEcaille || "le Chenaillet, 2 650 m", { a: "end", petit: true, op: fen(fC, 0.4, 0.7) });
        }
        if (t > 0.12 && t < 0.76) s += txt(XH - 40, 88, "écailles du fond de l'océan", { a: "end", petit: true, op: fen(t, 0.12, 0.2) * (1 - fen(t, 0.7, 0.76)) });
        // âge : 50 → 45 Ma (écaille), 45 → 35 Ma (collision), puis jusqu'à aujourd'hui
        const A = p.ages || [50, 45, 35, 0];
        const age = A.length >= 4 ? (t < 0.45 ? lerp(A[0], A[1], t / 0.45) : t < 0.76 ? lerp(A[1], A[2], (t - 0.45) / 0.31) : lerp(A[2], A[3], (t - 0.76) / 0.24)) : lerp(A[0], A[1], t);
        s += compteur(62, 14, age, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // marge étirée puis refermée — la lherzolite de Lers (24/09/2026, refonte complète à sa demande : « qu'on voie mieux le
  // manteau qui remonte » et « montrer la liaison entre la diapo 3 et 4 »). UNE coupe à l'échelle vraie (3 px par km, 0–65 km)
  // sert aux trois étapes : margeGeom(T) décrit l'état à T (0 → 0,5 étirement, 0,5 → 1 manteau à nu), la collision déforme
  // l'état final (T = 1) au lieu de passer à un autre dessin.
  // D'après Lagabrielle et Bodinier 2008 et Lagabrielle et al. 2010 : au Crétacé moyen (≈ 110–100 Ma) la croûte des bassins
  // nord-pyrénéens s'amincit jusqu'à disparaître, le manteau sous-continental remonte jusqu'au fond de la mer, ses
  // fragments sont remaniés en brèches, puis recouverts de flysch ; la convergence pyrénéenne (≈ 85–20 Ma) referme ces
  // bassins et coince les lambeaux de manteau entre les calcaires mésozoïques (marbres) où on les trouve aujourd'hui.
  const MG = { MER: 40, Y0: 42, XC: 240, PX: 3, EP: 90, XM: 252 };
  function margeGeom(T) {
    const { Y0, XC, EP } = MG;
    const A = 0.62 * fen(T, 0.02, 0.5) + 0.5 * fen(T, 0.5, 0.75);                           // part de croûte enlevée au centre
    const w = 70 + 30 * fen(T, 0, 0.75), S = 14 * fen(T, 0.05, 0.75);
    const cloche = (x, l) => Math.exp(-(((x - XC) / l) ** 2));
    const ep = (x) => EP * Math.max(0, 1 - A * cloche(x, w));
    const top = (x) => Y0 + S * cloche(x, w * 1.15);
    const moho = (x) => top(x) + ep(x);
    const couv = (x) => top(x) + 6 * Math.max(0, 1 - A * cloche(x, w));                     // couverture (calcaires jurassiques)
    const X = []; for (let x = -130; x <= 610; x += 4) X.push(x);
    const it = [];                                                                             // éléments dessinés : { pts, fill, stroke, sw, op }
    it.push({ pts: X.map((x) => [x, moho(x)]).concat([[610, 420], [-130, 420]]), fill: "#9aa36f" });
    it.push({ pts: X.map((x) => [x, top(x)]).concat(X.slice().reverse().map((x) => [x, moho(x)])), fill: "#c9b48f" });
    it.push({ pts: X.map((x) => [x, top(x)]).concat(X.slice().reverse().map((x) => [x, couv(x)])), fill: "#aaa89c" });
    // failles normales : pendage vers l'axe, écartées vers l'extérieur
    for (const x0 of [-150, -105, -62, 62, 105, 150]) {
      const xf = XC + x0 * (1 + 0.35 * fen(T, 0, 0.75)), sg = Math.sign(x0), e = ep(xf);
      if (e < 6) continue;
      it.push({ ligne: [[xf, top(xf)], [xf - sg * e * 0.58, moho(xf - sg * e * 0.58)]], stroke: "#5b4636", sw: 1.1, op: fen(T, 0.04, 0.2) });
    }
    // brèches de manteau sur le manteau mis à nu (0,72 → 0,86) puis flysch lit par lit (0,82 → 1)
    const Rb = alea("mgb");
    const br = fen(T, 0.72, 0.86);
    if (br > 0) for (let k = 0; k < 26; k++) {
      const x = XC - 40 + Rb() * 80, y = top(x) - 0.5 - Rb() * 2.5 * br, r = 1.3 + Rb() * 1.8;
      if (ep(x) > 8) continue;
      it.push({ pts: [[x - r, y + r * 0.5], [x + r * 0.2 * Rb(), y - r], [x + r, y + r * 0.4]], fill: k % 3 ? "#6f8f4a" : "#aab3b8", op: br });
    }
    const fond0 = top(XC);
    for (let k = 1; k <= 4; k++) {
      const q = fen(T, 0.8 + (k - 1) * 0.045, 0.8 + k * 0.045);
      if (q <= 0) break;
      const bas = fond0 - (k - 1) * 3, haut = bas - 3 * q, pts = [];
      let xa = XC; while (xa > -130 && top(xa) > haut) xa -= 1;
      let xb = XC; while (xb < 610 && top(xb) > haut) xb += 1;
      for (let x = xa; x <= xb; x += 2) pts.push([x, haut]);
      for (let x = xb; x >= xa; x -= 2) pts.push([x, Math.min(Math.max(top(x), haut), bas)]);
      it.push({ pts, fill: k % 2 ? "#7c8187" : "#a2a6a7" });
    }
    // la lherzolite suivie : 45 km → 20 km (étirement) → fond de la mer (0,75)
    const yA = Y0 + 45 * MG.PX, yB = Y0 + 20 * MG.PX;
    const ym = T < 0.5 ? lerp(yA, yB, lisse(T / 0.5)) : lerp(yB, top(MG.XM) + 2, fen(T, 0.5, 0.75));
    return { it, top, moho, ep, marque: [MG.XM, Math.max(ym, moho(MG.XM) + 2)], A, w };
  }
  const mgDessin = (it, tr) => it.map((e) => {
    const pts = (e.pts || e.ligne).map(([x, y]) => tr ? tr(x, y) : [x, y]);
    const o = e.op != null ? { opacity: op(e.op) } : null;
    return e.ligne ? pline(pts, e.stroke, e.sw, o) : poly(pts, e.fill, o);
  }).join("");
  // température de la lherzolite suivie, d'après le chemin P–T de la fiche (45 km 950 °C, 20 km 700 °C, 0 km 150 °C)
  const mgTemp = (z) => z >= 20 ? lerp(700, 950, (z - 20) / 25) : lerp(150, 700, z / 20);
  function mgMarque(x, y, texte, o = {}) {
    return circ(x, y, 4.2, "#2f6f3a", { stroke: "#fff", "stroke-width": 1.3 }) + circ(x, y, 7.5, "none", { stroke: "#2f6f3a", "stroke-width": 1, opacity: 0.6 })
      + (texte ? txt(x + 11, y + 3, texte, { petit: true, op: o.op }) : "");
  }
  function mgRegle() {
    let s = line(10, MG.Y0, 10, MG.Y0 + 60 * MG.PX, "#27302d", 1);
    for (let z = 0; z <= 60; z += 10) s += line(7, MG.Y0 + z * MG.PX, 10, MG.Y0 + z * MG.PX, "#27302d", 1) + (z % 20 === 0 ? txt(13, MG.Y0 + z * MG.PX + 3, `${z} km`, { petit: true }) : "");
    return s;
  }
  function marge(p, T0, T1) {
    return {
      fond: ciel(MG.MER),
      curseur: (t) => {                                                   // le curseur du diagramme suit la profondeur réelle
        const G = margeGeom(lerp(T0, T1, t)), z = (G.marque[1] - G.top(G.marque[0])) / MG.PX;
        return T0 < 0.5 ? (45 - z) / 25 : (20 - z) / 20;
      },
      anim(t, ta) {
        const T = lerp(T0, T1, t), G = margeGeom(T), { XC } = MG;
        let s = rect(0, MG.MER, W, H - MG.MER, "#4f84ad") + mgDessin(G.it);
        // le manteau remonte : lignes d'écoulement qui montent sous l'axe puis s'écartent sous la croûte amincie
        const vig = 1 - 0.7 * fen(T, 0.75, 0.95);
        for (const c of [-46, -24, -9, 9, 24, 46]) {
          const l = [[XC + c * 0.7, 250], [XC + c * 0.9, lerp(250, G.moho(XC + c) + 28, 0.5)], [XC + c * 1.3, G.moho(XC + c * 1.3) + 22], [XC + c * 2.4 + Math.sign(c) * 30, G.moho(XC + c * 2.4 + Math.sign(c) * 30) + 14]];
          const cb = courbe(l, 8);
          for (let k = 0; k < 4; k++) {
            const u = (k / 4 + ta * 0.06 + Math.abs(c) * 0.013) % 1, q = lePlong(cb, u);
            const ca = Math.cos(q.a), sa = Math.sin(q.a);
            s += poly([[q.x + ca * 4, q.y + sa * 4], [q.x - ca * 2.5 - sa * 2.6, q.y - sa * 2.5 + ca * 2.6], [q.x - ca * 2.5 + sa * 2.6, q.y - sa * 2.5 - ca * 2.6]], "#5f6b3a", { opacity: op(0.7 * vig * Math.min(1, u * 5, (1 - u) * 5)) });
          }
        }
        s += fleche(62, 214, 18, 214, { sw: 2.4, pointe: 8, op: 0.85 }) + txt(22, 206, "Ibérie", { petit: true })
          + fleche(418, 214, 462, 214, { sw: 2.4, pointe: 8, op: 0.85 }) + txt(458, 206, "Europe", { a: "end", petit: true });
        s += mgRegle();
        s += txt(40, MG.Y0 + 16, "calcaires du Jurassique", { petit: true }) + txt(40, MG.Y0 + 44, "croûte continentale", { petit: true });
        s += txt(40, G.moho(40) + 12, "Moho : base de la croûte", { petit: true, clair: true });
        s += txt(300, 196, "manteau (péridotite)", { petit: true, clair: true });
        // la lherzolite suivie, avec sa profondeur et sa température
        const [xm, ym] = G.marque, z = Math.max(0, (ym - G.top(xm)) / MG.PX);             // profondeur SOUS le fond de la mer
        s += mgMarque(xm, ym, z > 1 ? `la future lherzolite de Lers : ${nombre(z)} km, ≈ ${nombre(Math.round(mgTemp(z) / 10) * 10)} °C` : "la lherzolite de Lers, au fond de la mer");
        if (T >= 0.5 && fen(T, 0.72, 0.86) > 0.4) s += txt(XC - 70, G.top(XC - 70) - 4, "brèches", { a: "end", petit: true, clair: true, op: fen(T, 0.74, 0.8) * (1 - fen(T, 0.84, 0.88)) });
        if (T > 0.82) s += txt(XC - 16, MG.MER - 4, "flysch : boues déposées lit par lit", { a: "end", petit: true, clair: true, op: fen(T, 0.83, 0.88) });
        s += txt(220, 16, T < 0.5 ? "l'Ibérie s'écarte de l'Europe : la croûte s'amincit, le manteau remonte" : T < 0.76 ? "la croûte se rompt : le manteau arrive au fond de la mer" : "le manteau à nu est cassé en brèches, puis recouvert de boues", { a: "middle" });
        s += compteur(412, 36, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.margeEtirement = (p) => marge(p, 0, 0.5);
  SCENES.margeManteau = (p) => marge(p, 0.5, 1);
  // la collision referme le bassin : le MÊME dessin que la fin de l'étape précédente, raccourci et épaissi (les deux bords se
  // rapprochent, le bassin et son manteau sont serrés et poussés vers le haut, les failles rejouent en failles inverses) ;
  // l'érosion, en même temps puis après, rabote la chaîne jusqu'à mettre la lherzolite au jour. p.ages [début, fin de la
  // compression, aujourd'hui]
  SCENES.margeCollision = function (p) {
    const G = margeGeom(1), { XC, MER } = MG;
    const cible = (x) => 35 + 2.5 * Math.sin(x / 37) + 1.5 * Math.sin(x / 13 + 1) + 5 * Math.exp(-(((x - (MG.XM + 26)) / 9) ** 2));
    const clipE = nid("mc");
    return {
      fond: ciel(MER),
      curseur: (t) => fen(t, 0.2, 0.95),
      anim(t, ta) {
        const c = fen(t, 0.04, 0.62), er = fen(t, 0.22, 0.95);
        const tr = (x, y) => {
          // raccourcissement fort sur le bassin aminci (les deux bords se rejoignent), épaississement autour de y = 60, et le
          // coin de manteau serré au milieu est poussé vers le haut (écaille), le tout un peu soulevé
          const f = 1 - 0.6 * c * Math.exp(-(((x - XC) / 110) ** 2));
          const y1 = 60 + (y - 60) / f - c * 22 * Math.exp(-(((x - XC) / 45) ** 2)) * clamp((150 - y) / 60) - 6 * c;
          return [XC + (x - XC) * f, y1];
        };
        const E = (x) => lerp(-30, cible(x), er);
        const bord = []; for (let x = -4; x <= W + 4; x += 4) bord.push([x, E(x)]);
        let s = rect(0, MER, W, H - MER, "#4f84ad");
        s += `<clipPath id="${clipE}"><polygon points="${P(bord.concat([[W + 4, H + 5], [-4, H + 5]]))}"/></clipPath>`;
        s += `<g clip-path="url(#${clipE})">${mgDessin(G.it, tr)}</g>`;
        // surface : trait de l'érosion là où elle a déjà mordu
        // l'étang de Lers, dans le creux à côté de la lherzolite
        const xl = MG.XM + 26, lac = fen(t, 0.9, 0.97);
        if (lac > 0) { const l = []; for (let x = xl - 9; x <= xl + 9; x += 1.5) l.push([x, Math.max(E(x), cible(xl) - 3.2)]); s += poly(l, "#5b95c6", { opacity: op(lac) }); }
        const v = fen(t, 0.9, 0.98);
        // tirage REFAIT à chaque image (sinon les arbres changent de place à chaque image : ils « bougeaient », 24/09/2026)
        if (v > 0) s += vegetation((x) => E(x), 4, W - 4, alea("mgc" + p.graine), { op: v, pas: 19, coniferes: 0.5 });
        s += mgRegle();
        // rapprochement des plaques
        s += fleche(18, 214, 58, 214, { sw: 2.4, pointe: 8, op: 0.85 * (1 - fen(t, 0.62, 0.7)) }) + txt(22, 206, "Ibérie", { petit: true })
          + fleche(462, 214, 422, 214, { sw: 2.4, pointe: 8, op: 0.85 * (1 - fen(t, 0.62, 0.7)) }) + txt(458, 206, "Europe", { a: "end", petit: true });
        // la lherzolite suivie
        const [xm, ym] = tr(G.marque[0], G.marque[1]);
        const dehors = ym <= E(xm) + 3;                                    // l'érosion a atteint la lherzolite
        s += mgMarque(xm, Math.max(ym, E(xm) + 1), "");
        s += txt(220, 16, t < 0.3 ? "l'Ibérie revient vers l'Europe : le bassin se referme et se soulève" : t < 0.7 ? "serrés, le bassin et son manteau montent dans la chaîne ; l'érosion la rabote" : "l'érosion met au jour la lherzolite, prise entre les calcaires", { a: "middle" });
        if (t > 0.1 && t < 0.62) s += txt(XC + 50, tr(XC + 50, 60)[1] + 22, "failles inverses", { petit: true, clair: true, op: fen(t, 0.14, 0.22) * (1 - fen(t, 0.52, 0.6)) });
        if (dehors) s += line(xm - 4, E(xm) + 5, xm - 12, E(xm) + 15, "#27302d", 0.8, { opacity: op(fen(t, 0.86, 0.92)) })
          + txt(xm - 14, E(xm) + 22, p.creteNom || "lherzolite de l'étang de Lers", { a: "end", petit: true, op: fen(t, 0.86, 0.92) });
        if (lac > 0.5) s += txt(xl + 12, cible(xl) + 11, "étang", { petit: true, op: lac });
        const A = p.ages || [85, 20, 0];
        const age = t < 0.62 ? lerp(A[0], A[1], t / 0.62) : lerp(A[1], A[2], (t - 0.62) / 0.38);
        s += compteur(412, 36, age);
        return s;
      },
    };
  };

  // diatrème (kimberlite) : le magma, chargé de gaz et de fragments du manteau (et de diamants), remonte en heures à
  // jours ; près de la surface le gaz explose : une cheminée en carotte se remplit de brèche
  SCENES.diatreme = function (p) {
    const R = alea("dt" + p.graine);
    const SOL = 70;
    const frag = Array.from({ length: 40 }, () => ({ x: (R() - 0.5), y: R(), r: 1.5 + R() * 3, d: R() < 0.12 }));
    return {
      fond: ciel(SOL) + rect(0, SOL, W, H - SOL, "#b9a987"),
      anim(t, ta) {
        const e = fen(t, 0.04, 0.9);
        const larg = (y) => 12 + 90 * Math.max(0, 1 - (y - SOL) / 150) ** 1.6;
        let s = "";
        const cheminee = []; for (let y = SOL; y <= H; y += 6) cheminee.push([240 - larg(y) * fen(e, 0.2, 0.7), y]);
        for (let y = H; y >= SOL; y -= 6) cheminee.push([240 + larg(y) * fen(e, 0.2, 0.7), y]);
        s += poly(cheminee, "#6e6f5c");
        s += rect(234, SOL + 20, 12, H - SOL - 20, "#5f604f");
        for (const f of frag) { const y = SOL + 4 + f.y * (H - SOL - 4), x = 240 + f.x * 2 * larg(y) * fen(e, 0.2, 0.7) * 0.9; s += f.d ? poly([[x, y - 3], [x + 3, y], [x, y + 3], [x - 3, y]], "#ffffff", { stroke: "#9ad", "stroke-width": 0.6 }) : circ(x, y, f.r, "#8fa37a"); }
        const ex = fen(t, 0.3, 0.55) * (1 - fen(t, 0.8, 0.95));
        for (let k = 0; k < 12; k++) { const u = (ta * 0.3 + k / 12) % 1; s += circ(240 + Math.sin(k * 3) * 30 * u, SOL - u * 60, 8 + u * 14, "#8f8a82", { opacity: op(ex * (1 - u)) }); }
        s += txt(250, H - 8, "le magma arrive de 150 à 250 km", { petit: true, clair: true });
        s += txt(330, SOL + 40, "cheminée remplie de brèche", { petit: true, op: fen(t, 0.6, 0.75) });
        s += txt(330, SOL + 52, "◆ diamants, ● morceaux de manteau", { petit: true, op: fen(t, 0.6, 0.75) });
        s += txt(220, 16, "près de la surface, le gaz explose : la cheminée se remplit de brèche", { a: "middle" });
        s += compteur(412, 36, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // auréole de contact : un granite chaud s'injecte dans des roches froides ; la chaleur gagne l'encaissant (isothermes qui
  // s'éloignent puis reviennent) ; en option, des fluides chauds sortent du granite (skarn, greisen, fénite)
  SCENES.aureole = function (p) {
    const R = alea("au" + p.graine);
    const CX = 200, CY = 170, enc = p.encaissant || "schistes";
    return {
      fond: ciel(40) + rect(0, 40, W, H - 40, enc === "calcaire" ? "#e6dfc6" : "#8d9187")
        + (() => { let r = ""; for (let y = 50; y < H; y += 10) r += line(0, y, W, y + 2, enc === "calcaire" ? "rgba(150,135,100,.35)" : "rgba(40,45,40,.3)", 1); return r; })(),
      anim(t, ta) {
        const e = fen(t, 0.03, 0.4), ch = fen(t, 0.1, 0.6) * (1 - 0.6 * fen(t, 0.7, 1));
        let s = "";
        for (const [k, c] of [[3, "#f4d9a0"], [2, "#eeb57a"], [1, "#e08a55"]]) s += ell(CX, CY, (70 + k * 36) * ch, (40 + k * 26) * ch, c, { opacity: 0.45 });
        s += `<path d="M${CX - 90 * e} ${H} C${CX - 80 * e} ${CY - 50 * e} ${CX + 80 * e} ${CY - 50 * e} ${CX + 90 * e} ${H} Z" fill="${p.couleurGranite || "#e2b39a"}"/>`;
        if (p.fluides) for (let k = 0; k < 14; k++) { const u = (ta * 0.3 + k / 14) % 1, a = -Math.PI / 2 + (k - 7) * 0.2; s += circ(CX + Math.cos(a) * (40 + u * 110), CY - 10 + Math.sin(a) * (30 + u * 80), 1.6, p.couleurFluide || "#4fa3d8", { opacity: op(fen(t, 0.35, 0.5) * Math.sin(u * Math.PI)) }); }
        s += txt(CX, H - 12, p.nomPluton || "granite", { a: "middle", petit: true, op: e });
        s += txt(CX + 140, 90, p.labAureole || "auréole : chauffée sans être comprimée, la roche recristallise", { a: "middle", petit: true, op: fen(t, 0.3, 0.45) });
        if (p.fluides) s += txt(CX + 140, 102, p.labFluides || "des fluides chauds entrent dans la roche", { a: "middle", petit: true, op: fen(t, 0.4, 0.55) });
        s += txt(W - 8, 56, enc === "calcaire" ? "calcaires" : "argiles et schistes", { a: "end", petit: true });
        const T = lerp(p.tDebut ?? 160, p.tMax ?? 560, fen(t, 0.1, 0.6)) - (p.tMax ?? 560 - 200) * 0 ;
        s += thermometre(440, 110, 90, t < 0.7 ? T : lerp(p.tMax ?? 560, 300, fen(t, 0.7, 1)), 0, 800, [200, 400, 600]);
        s += compteur(100, 16, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge, sous: p.duree || "10 000 à 100 000 ans" });
        return s;
      },
    };
  };

  // zone de faille : deux blocs glissent l'un contre l'autre ; en haut (< ≈ 10–15 km, sous 300 °C) la roche casse
  // (séismes, brèche broyée : cataclasite, parfois verre de friction : pseudotachylite) ; en bas elle flue (mylonite)
  SCENES.zoneFaille = function (p) {
    const R = alea("zf" + p.graine);
    const Z0 = 30, PX = 8, Y = (z) => Z0 + z * PX, XF = 240, focus = p.focus || "cataclasite";
    return {
      fond: ciel(Z0),
      anim(t, ta) {
        const repos = !!p.repos, e = repos ? 0 : fen(t, 0.04, 0.95), dec = (p.decalage ?? 40) * e;      // un seul séisme : ≈ 1 m, invisible à cette échelle
        let s = "";
        if (repos) {
          s += rect(0, Z0, W, H - Z0, "#c9b8a3");
          for (let k = 0; k < 260; k++) { const x = (k * 97.3) % W, y = Z0 + ((k * 53.7) % (H - Z0)); s += circ(x, y, 1.1, k % 5 === 0 ? "#3e342c" : k % 3 === 0 ? "#e2ad94" : "#f1ece2", { opacity: 0.8 }); }
          const zf = { mylonite: 15, cataclasite: 5, pseudotachylite: 9 }[focus];
          s += line(0, Y(12), W, Y(12), "#c0392b", 1, { "stroke-dasharray": "5 4" }) + txt(W - 8, Y(12) - 4, "≈ 300 °C, 10–15 km", { a: "end", petit: true });
          s += txt(XF + 16, Y(4), "au-dessus : la roche casse", { petit: true }) + txt(XF + 16, Y(17), "en dessous : elle flue", { petit: true });
          s += circ(XF, Y(zf), 4.2, "#c0392b", { stroke: "#fff", "stroke-width": 1.4 });
          s += line(6, Z0, 6, Y(24), "#27302d", 1); for (const z of [5, 10, 15, 20]) s += line(3, Y(z), 6, Y(z), "#27302d", 1) + txt(9, Y(z) + 3, `${z} km`, { petit: true });
          s += txt(160, 14, p.texte || "un granite en profondeur, avant la faille", { a: "middle" });
          s += compteur(412, 16, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
          return s;
        }
        for (const [sg, off] of [[-1, 0], [1, dec]]) for (let k = 0; k < 11; k++) {
          const y0 = Y(k * 3) + (sg > 0 ? -off : 0);
          s += rect(sg < 0 ? 0 : XF + 6, y0, XF - 6, 24, k % 2 ? "#c9b8a3" : "#b8a590");
        }
        s += rect(XF - 6, Z0, 12, H - Z0, "#8a7d6a");
        const yb = Y(12);
        s += rect(XF - 6, Z0, 12, yb - Z0, "#6f675c") + line(0, yb, W, yb, "#c0392b", 1, { "stroke-dasharray": "5 4" });
        for (let k = 0; k < 14; k++) s += circ(XF + (k % 3 - 1) * 3, Z0 + 8 + k * ((yb - Z0) / 14), 1.8, "#3e3830");
        for (let k = 0; k < 8; k++) s += ell(XF, yb + 10 + k * 8, 5, 1.6, "#e2ad94");
        const sei = (ta % 2.5) < 0.4 ? 1 : 0;
        if (sei && t < 0.98 || focus === "pseudotachylite") for (let k = 1; k < 4; k++) s += circ(XF, Y(8), k * 12 * ((ta % 2.5) / 0.4 || 1), "none", { stroke: "#c0392b", "stroke-width": 1, opacity: op(sei ? 1 - k * 0.25 : 0) });
        if (focus === "pseudotachylite") s += line(XF - 1, Y(7), XF + 1, Y(10), "#1f1b18", 3 * fen(t, 0.3, 0.6));
        s += txt(XF + 16, Y(4), "cassant : la roche est broyée", { petit: true, op: focus === "mylonite" ? 0.5 : 1 });
        s += txt(XF + 16, Y(15), "ductile : les grains s'étirent", { petit: true, op: focus === "mylonite" ? 1 : 0.5 });
        s += txt(W - 8, yb - 4, "≈ 300 °C, 10–15 km", { a: "end", petit: true });
        s += line(6, Z0, 6, Y(24), "#27302d", 1); for (const z of [5, 10, 15, 20]) s += line(3, Y(z), 6, Y(z), "#27302d", 1) + txt(9, Y(z) + 3, `${z} km`, { petit: true });
        s += fleche(XF - 40, 20, XF - 40, 34, { sw: 1.8, pointe: 6 }) + fleche(XF + 40, 34, XF + 40, 20, { sw: 1.8, pointe: 6 });
        s += txt(160, 14, p.texte || "les deux blocs glissent le long de la faille", { a: "middle" });
        s += compteur(412, 16, p.ages ? lerp(p.ages[0], p.ages[1], t) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  };

  // impact de météorite (Rochechouart) : l'astéroïde arrive, l'onde de choc, le cratère se creuse et se remplit de brèches
  // et de roche fondue (T 0–0,5) ; puis l'érosion efface le cratère et laisse les brèches (0,5–1)
  function impact(p, T0, T1) {
    const R = alea("im" + p.graine);
    const SOL = 110, XC = 240;
    const eclats = Array.from({ length: 40 }, () => ({ a: -Math.PI * R(), v: 60 + R() * 140, r: 1 + R() * 2 }));
    return {
      fond: ciel(SOL) + rect(0, SOL, W, H - SOL, "#b8a88e") + (() => { let r = ""; for (let y = SOL + 12; y < H; y += 14) r += line(0, y, W, y + 2, "rgba(80,65,45,.25)", 1); return r; })(),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        let s = "";
        const arr = fen(T, 0, 0.12), cr = fen(T, 0.12, 0.4), er = fen(T, 0.55, 0.98);
        if (T < 0.12) { const x = lerp(20, XC, arr), y = lerp(-10, SOL, arr); s += line(x - 40, y - 30, x, y, "#f3a13d", 3) + circ(x, y, 5, "#5f574c"); }
        if (T >= 0.12 && T < 0.3) for (let k = 1; k < 5; k++) s += circ(XC, SOL, 30 * k * fen(T, 0.12, 0.3), "none", { stroke: "#c0392b", "stroke-width": 1.5, opacity: op(1 - fen(T, 0.2, 0.3)) });
        const rc = 150 * cr, dc = 70 * cr;
        const surfE = SOL + 60 * er;                                           // l'érosion abaisse le paysage
        if (cr > 0) {
          s += `<path d="M${XC - rc} ${SOL} Q${XC} ${SOL + dc * 2} ${XC + rc} ${SOL} Z" fill="#8a7c68"/>`;
          s += `<path d="M${XC - rc * 0.8} ${SOL + 4} Q${XC} ${SOL + dc * 1.6} ${XC + rc * 0.8} ${SOL + 4} Z" fill="#6b5f52"/>`;
          s += ell(XC, SOL + dc * 0.55, rc * 0.4, dc * 0.25, "#3a3230", { opacity: op(cr) });
          if (T < 0.45) for (const c of eclats) { const u = fen(T, 0.12, 0.45), x = XC + Math.cos(c.a) * c.v * u, y = SOL + Math.sin(c.a) * c.v * u + 120 * u * u; if (y < SOL + 2) s += circ(x, y, c.r, "#8a7c68"); }
        }
        if (er > 0) s += rect(0, 0, W, surfE, "#cfe2ec") + rect(0, surfE - 1, W, 2, "#6f9d4f");
        s += txt(220, 16, T < 0.12 ? "un astéroïde de ≈ 1,5 km arrive à ≈ 20 km/s" : T < 0.3 ? "l'onde de choc traverse la roche : quartz choqué (10–15 GPa)"
          : T < 0.5 ? "au-delà de ≈ 60 GPa, la roche fond : cratère de ≈ 20 km" : "l'érosion efface le cratère ; ses brèches restent", { a: "middle" });
        if (cr > 0.5 && T < 0.5) s += txt(XC, SOL + dc * 0.55 + 3, "roche fondue et brèches", { a: "middle", petit: true, clair: true });
        s += compteur(412, 36, p.ages ? lerp(p.ages[0], p.ages[1], T) : 0, { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.impactCratere = (p) => impact(p, 0, 0.5);
  SCENES.impactErosion = (p) => impact(p, 0.5, 1);
  SCENES.impactArrivee = (p) => impact(p, 0, 0.16);
  SCENES.impactChoc = (p) => impact(p, 0.12, 0.32);
  SCENES.impactRemplissage = (p) => impact(p, 0.3, 0.5);

  // ─────────────────────────────── moteur ───────────────────────────────
  const ICONES = {
    pause: `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1"/><rect x="9.5" y="2.5" width="3" height="11" rx="1"/></svg>`,
    lecture: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L4.9 2.1a.6.6 0 0 0-.9.5z"/></svg>`,
  };

  // liaison avec le diagramme de conditions : pastille et ligne de légende de l'étape, curseur sur le chemin.
  // mode "depart" : pendant l'étape n, le curseur va de la pastille n à la suivante ; "arrivee" : de la précédente à la n.
  function lier(fc, mode) {
    const pl = fc && fc.querySelector(".fc-chemin[data-num]");
    if (!pl || !pl.dataset.num) return null;
    const pts = pl.getAttribute("points").trim().split(/\s+/).map((c) => c.split(",").map(Number));
    const idx = {};
    pl.dataset.num.split(",").forEach((c) => { const [i, n] = c.split(":").map(Number); idx[n] = i; });
    const curseur = fc.querySelector(".fc-curseur");
    fc.classList.add("fc-suivi");
    let actif = null;
    return {
      maj(k, t) {
        const n = k + 1;
        if (actif !== n) { actif = n; fc.querySelectorAll("[data-n]").forEach((e) => { e.classList.toggle("on", Number(e.dataset.n) === n); e.classList.toggle("vu", Number(e.dataset.n) <= n); }); }
        if (!curseur) return;
        let a = idx[n], b;
        if (a == null) { curseur.setAttribute("cx", -99); return; }
        if (mode === "arrivee") { b = a; a = 0; for (let m = 1; m < n; m++) if (idx[m] != null) a = idx[m]; }
        else b = idx[n + 1] != null ? idx[n + 1] : pts.length - 1;
        const q = b > a ? lePlong(pts.slice(a, b + 1), clamp(t)) : { x: pts[a][0], y: pts[a][1] };
        curseur.setAttribute("cx", r1(q.x)); curseur.setAttribute("cy", r1(q.y));
      },
      fin() { fc.classList.remove("fc-suivi"); if (curseur) curseur.setAttribute("cx", -99); },
    };
  }

  function monter(el, roche, o = {}) {
    const A = Formation.animation(roche);
    if (!el || !A) return;
    const E = A.etapes, n = E.length;
    // durée propre à la roche (animDuree, ex. 1,2 = 20 % plus lent) : même découpage, tout est allongé
    // + allongement propre à une étape (champ `allonge` de l'étape, demande du 24/09/2026 : « rallonge cette diapo pour
    // qu'elle ait le temps de se terminer ») : cette étape seule dure plus longtemps
    const K = A.duree || 1, FIGE_FINk = FIGE_FIN * K;
    const Kk = (k) => K * (E[k].allonge || 1), animMs = (k) => ANIM * Kk(k);
    const reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.classList.add("fa");
    el.innerHTML = `
      <div class="fa-barres" style="--n:${n}">${E.map((e, i) => `<button type="button" class="fa-barre" data-i="${i}" aria-label="Étape ${i + 1} : ${e.titre}"><span class="fa-jauge"><i></i></span><span class="fa-court"><b>${i + 1}</b>${e.court}</span></button>`).join("")}</div>
      <div class="fa-scene"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Formation : ${roche.nom}"><g class="fa-avant"></g><g class="fa-courant"></g></svg></div>
      <div class="fa-legende"><span class="fa-num">1</span><div><b class="fa-titre"></b><span class="fa-quand"></span></div>
        <button type="button" class="fa-lecture"></button></div>`;
    const $ = (s) => el.querySelector(s);
    const gAvant = $(".fa-avant"), gCourant = $(".fa-courant"), barres = [...el.querySelectorAll(".fa-barre")];
    const jauges = barres.map((b) => b.querySelector("i"));
    const bouton = $(".fa-lecture");
    const lien = lier(o.lien, A.curseur);
    const instances = [];
    const scene = (k) => instances[k] || (instances[k] = (SCENES[E[k].scene] || (() => ({ fond: "", anim: () => "" })))(Object.assign({ graine: roche.id + k }, E[k].p), roche));

    let i = 0, tms = 0, lecture = !reduit, visible = false, raf = 0, dernier = 0, dernierDessin = 0, dyn = null, fondu = false;
    const fenetre = (k) => FENETRE * Kk(k) + (k === n - 1 ? FIGE_FINk : 0);

    function poser(g, k, t) {
      const sc = scene(k);
      g.innerHTML = `<g>${sc.fond}</g><g></g>${sc.devant || ""}`;
      g.children[1].innerHTML = sc.anim(t, t * animMs(k) / 1000);
      return g.children[1];
    }
    function allerA(k, avecFondu) {
      if (avecFondu && k !== i) { poser(gAvant, i, 1); gAvant.style.opacity = 1; gCourant.style.opacity = 0; fondu = true; }
      else { gAvant.innerHTML = ""; gCourant.style.opacity = 1; fondu = false; }
      i = k;
      tms = lecture ? 0 : animMs(i);
      dyn = poser(gCourant, i, clamp(tms / animMs(i)));
      $(".fa-num").textContent = i + 1;
      $(".fa-titre").textContent = E[i].titre;
      $(".fa-quand").textContent = E[i].duree ? `${E[i].quand} · durée : ${E[i].duree}` : E[i].quand;
      barres.forEach((b, j) => { b.classList.toggle("on", j === i); jauges[j].style.width = j < i ? "100%" : "0%"; });
      dessiner();
    }
    function dessiner() {
      const t = clamp(tms / animMs(i)); // la fin de la fenêtre reste figée sur l'image finale (4 s, 14 s pour la dernière étape)
      dyn.innerHTML = scene(i).anim(t, tms / 1000);
      jauges[i].style.width = `${r1(clamp(tms / fenetre(i)) * 100)}%`;
      if (fondu) {
        const f = clamp(tms / FONDU);
        gCourant.style.opacity = f; gAvant.style.opacity = 1 - f;
        if (f >= 1) { fondu = false; gAvant.innerHTML = ""; }
      }
      // la scène peut dire où en est sa roche (profondeur réelle) ; sinon progression adoucie
      if (lien) { const sc = scene(i); lien.maj(i, sc.curseur ? clamp(sc.curseur(t)) : lisse(t)); }
    }
    function image(now) {
      raf = 0;
      if (!el.isConnected) return arreter();
      tms += Math.min(100, now - dernier);
      dernier = now;
      if (tms >= fenetre(i)) allerA((i + 1) % n, true);
      else if (now - dernierDessin >= PAS_IMAGE) { dernierDessin = now; dessiner(); }
      planifier();
    }
    function planifier() {
      if (lecture && visible && !document.hidden) { if (!raf) { dernier = performance.now(); raf = requestAnimationFrame(image); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function majBouton() {
      bouton.innerHTML = lecture ? ICONES.pause : ICONES.lecture;
      bouton.setAttribute("aria-label", lecture ? "Mettre en pause" : "Lancer l'animation");
      bouton.title = "";
    }
    const surVisibilite = () => planifier();
    const obs = "IntersectionObserver" in window ? new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; planifier(); }, { threshold: 0.2 }) : null;
    function arreter() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (obs) obs.disconnect();
      document.removeEventListener("visibilitychange", surVisibilite);
      if (lien) lien.fin();
    }

    barres.forEach((b, j) => b.addEventListener("click", () => { allerA(j, false); planifier(); }));
    bouton.addEventListener("click", () => {
      lecture = !lecture;
      if (lecture && tms >= fenetre(i)) tms = 0;
      majBouton(); planifier();
    });
    document.addEventListener("visibilitychange", surVisibilite);
    if (obs) obs.observe(el); else { visible = true; }
    majBouton();
    allerA(0, false);
    planifier();
    // contrôle (tests) : figer l'étape k à l'instant t
    const montrer = (k, t) => { lecture = false; majBouton(); planifier(); allerA(k, false); tms = t * animMs(k); dessiner(); };
    return (el._fa = { arreter, montrer, etat: () => ({ i, t: clamp(tms / animMs(i)), lecture, visible, anime: !!raf, duree: Kk(i) }) });
  }

  window.FormationAnim = { monter, SCENES, FENETRE, ANIM, FIGE, FIGE_FIN };
})();
