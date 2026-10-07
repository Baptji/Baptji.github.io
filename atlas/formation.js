// ============ Formation des roches : schémas étape par étape (C.2) et conditions de formation (C.4) ============
// Chargé après les données (data.js, roches-arbre.js, mineraux*.js, oxydes.js) et avant app.js.
//   • C.2 : un PROCESSUS par grand mode de formation (pluton, coulée de lave, dépôt détritique, évaporite…) ;
//     chaque étape est une petite scène SVG (coupe de terrain ou loupe), déclinée par roche (source du magma,
//     agent de transport, protolithe, couleurs des minéraux…) ;
//   • C.4 : un DIAGRAMME par type de conditions — pression–température (magmatiques, métamorphiques), seuils de
//     saturation (évaporites, silice, calcite et CO₂), Eh–pH (fer), enfouissement et température (diagenèse,
//     charbons), climat (roches d'altération), taille des grains (formations transportées), choc (impacts) —
//     avec le chemin suivi par la roche, numéroté comme les étapes, et les durées ou âges de chaque étape.
// API : Formation.etapes(roche) → [{ titre, svg }] | null ; Formation.conditions(roche) → HTML | null ;
//       Formation.sources(roche) → HTML (bas de page) | "".
(function () {
  "use strict";

  // ─────────────────────────────── utilitaires SVG ───────────────────────────────
  const W = 200, H = 150;
  let uid = 0;
  const id = (p) => `${p}${++uid}`;
  const r1 = (x) => Math.round(x * 10) / 10;
  const attrs = (o) => Object.entries(o || {}).map(([k, v]) => v == null ? "" : ` ${k}="${v}"`).join("");

  const rect = (x, y, w, h, fill, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${attrs(o)}/>`;
  const poly = (pts, fill, o) => `<polygon points="${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" fill="${fill}"${attrs(o)}/>`;
  const pline = (pts, stroke, sw, o) => `<polyline points="${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${attrs(o)}/>`;
  const path = (d, fill, o) => `<path d="${d}" fill="${fill}"${attrs(o)}/>`;
  const circ = (x, y, r, fill, o) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"${attrs(o)}/>`;
  const ell = (x, y, rx, ry, fill, o) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}"${attrs(o)}/>`;
  const line = (x1, y1, x2, y2, stroke, sw, o) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${attrs(o)}/>`;
  // étiquette lisible sur n'importe quel fond (liseré clair)
  const txt = (x, y, s, o = {}) => `<text x="${r1(x)}" y="${r1(y)}" class="fs-lab${o.petit ? " fs-petit" : ""}${o.clair ? " fs-clair" : ""}"${o.a ? ` text-anchor="${o.a}"` : ""}${o.rot ? ` transform="rotate(${o.rot} ${r1(x)} ${r1(y)})"` : ""}>${s}</text>`;

  // générateur pseudo-aléatoire reproductible (les cristaux d'une roche sont toujours dessinés pareil)
  function alea(graine) {
    let a = 0;
    for (const c of String(graine)) a = (a * 31 + c.charCodeAt(0)) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // flèche droite ou polyligne, pointe dessinée à la main (pas de <marker> : identifiants partagés entre SVG)
  function fleche(pts, o = {}) {
    const c = o.c || C.encre, sw = o.sw || 1.6, t = o.pointe || 5;
    const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
    const a = Math.atan2(y2 - y1, x2 - x1);
    const bx = x2 - Math.cos(a) * t, by = y2 - Math.sin(a) * t;
    const tete = [[x2, y2], [bx + Math.cos(a + Math.PI / 2) * t * 0.55, by + Math.sin(a + Math.PI / 2) * t * 0.55],
      [bx - Math.cos(a + Math.PI / 2) * t * 0.55, by - Math.sin(a + Math.PI / 2) * t * 0.55]];
    const corps = pts.slice(0, -1).concat([[bx, by]]);
    const halo = o.halo === false ? "" : pline(corps, "rgba(255,255,255,.7)", sw + 2);
    return halo + pline(corps, c, sw, o.tirets ? { "stroke-dasharray": o.tirets } : null) + poly(tete, c);
  }
  // flèche courbe (quadratique) : départ, point de contrôle, arrivée
  function flecheCourbe(x1, y1, cx, cy, x2, y2, o) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push([(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2]);
    }
    return fleche(pts, o);
  }

  // loupe : disque cerclé, contenu découpé dedans
  function loupe(cx, cy, r, contenu, fond = "#fbfaf6") {
    const k = id("fl");
    return `<clipPath id="${k}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
      <circle cx="${cx}" cy="${cy}" r="${r + 2.5}" fill="#fff" stroke="${C.encre}" stroke-width="1"/>
      <g clip-path="url(#${k})">${rect(cx - r, cy - r, 2 * r, 2 * r, fond)}${contenu}</g>`;
  }

  // ─────────────────────────────── palette des scènes ───────────────────────────────
  const C = {
    ciel: "#dbe9f2", encre: "#27302d", blanc: "#ffffff",
    croute: ["#dccaa8", "#cfbb96", "#c2ac86"], crouteOce: "#5f6a66", moho: "#8d7b5e",
    manteau: "#a9ae76", manteauProfond: "#98a066", astheno: "#b9ad6c",
    magma: "#e0532b", magmaClair: "#f39a3d", lave: "#3d3736", laveChaude: "#c2412a", verre: "#141414",
    mer: "#7db6d8", merProfond: "#4f8ab3", eauDouce: "#93cbe6", glace: "#eef6fb", glaceBord: "#9cc3dd",
    sable: "#e7cb86", argile: "#aea393", limon: "#cdb899", calcaire: "#e9e2cb", craie: "#f4f1e8", gres: "#d8a86b",
    galet: "#b3a894", vegetation: "#6f9d4f", foret: "#4f7d3c", tourbe: "#5a4632", charbon: "#262322",
    rouge: "#b5462f", ocre: "#c98a3a", sel: "#f7f7f4", gypse: "#ece5d6", dolomie: "#dcc9a4",
    soleil: "#f2b632", pluie: "#4d8fc6", chaleur: "#d8452b", fluide: "#3f8fd2",
  };

  // ─────────────────────────────── décors communs ───────────────────────────────
  // relief de surface : liste de points [x, y] de gauche à droite (le ciel au-dessus)
  const surface = (pts) => [[0, pts[0][1]], ...pts, [W, pts[pts.length - 1][1]]];
  function ciel(yMax = H) { return rect(0, 0, W, yMax, C.ciel); }
  // coupe de lithosphère : croûte (3 bandes) jusqu'au Moho, manteau dessous
  function lithosphere(o = {}) {
    const relief = o.relief || [[0, 14], [60, 12], [100, 8], [140, 12], [200, 14]];
    const moho = o.moho ?? 104;
    const bas = relief.map(([x, y]) => [x, y]);
    let s = ciel(40);
    s += poly([...surface(bas), [W, H], [0, H]], C.croute[0]);
    const e = (moho - 16) / 3;
    s += rect(0, 16 + e, W, e, C.croute[1]) + rect(0, 16 + 2 * e, W, moho - 16 - 2 * e, C.croute[2]);
    s += rect(0, moho, W, H - moho, o.manteau || C.manteau);
    s += line(0, moho, W, moho, C.moho, 1, { "stroke-dasharray": "4 3" });
    if (o.etiquettes !== false) {
      s += txt(4, 30, "croûte", { petit: true }) + txt(4, moho + 12, "manteau", { petit: true });
    }
    return s;
  }
  // gouttelettes de liquide (fusion partielle) dans une zone elliptique
  function gouttes(cx, cy, rx, ry, n, graine, taille = 2.2) {
    const R = alea(graine);
    let s = "";
    for (let i = 0; i < n; i++) {
      const t = R() * Math.PI * 2, d = Math.sqrt(R());
      const x = cx + Math.cos(t) * rx * d, y = cy + Math.sin(t) * ry * d;
      s += circ(x, y, taille * (0.6 + R() * 0.8), C.magma, { opacity: 0.85 });
    }
    return s;
  }
  function chaleur(x, y, n = 3, dx = 14) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x0 = x + (i - (n - 1) / 2) * dx;
      s += fleche([[x0, y + 12], [x0 - 2, y + 8], [x0 + 2, y + 4], [x0, y]], { c: C.chaleur, sw: 1.3, pointe: 4 });
    }
    return s;
  }
  // cristaux polygonaux dans une ellipse (couleurs = minéraux de la roche)
  function cristauxEllipse(cx, cy, rx, ry, couleurs, n, graine, taille = 5) {
    const R = alea(graine);
    let s = "";
    for (let i = 0; i < n; i++) {
      const t = R() * Math.PI * 2, d = Math.sqrt(R()) * 0.88;
      const x = cx + Math.cos(t) * rx * d, y = cy + Math.sin(t) * ry * d;
      s += cristal(x, y, taille * (0.55 + R() * 0.7), R() * 180, couleurs[Math.floor(R() * couleurs.length)], R);
    }
    return s;
  }
  function cristal(x, y, t, angle, couleur, R) {
    const k = 4 + Math.floor(R() * 3), pts = [];
    for (let i = 0; i < k; i++) {
      const a = (angle + i * 360 / k + R() * 25) * Math.PI / 180, d = t * (0.7 + R() * 0.45);
      pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8]);
    }
    return poly(pts, couleur, { stroke: "rgba(0,0,0,.35)", "stroke-width": 0.5 });
  }
  // remplissage d'un rectangle par des cristaux jointifs (texture de roche vue à la loupe)
  function texture(x0, y0, w, h, couleurs, taille, graine, o = {}) {
    const R = alea(graine);
    let s = rect(x0, y0, w, h, o.fond || couleurs[0]);
    const pas = taille * 1.1;
    for (let y = y0 + pas / 2; y < y0 + h + pas; y += pas) {
      for (let x = x0 + pas / 2; x < x0 + w + pas; x += pas) {
        const t = taille * (0.6 + R() * 0.6);
        s += cristal(x + (R() - 0.5) * pas * 0.6, y + (R() - 0.5) * pas * 0.6, t, R() * 180, couleurs[Math.floor(R() * couleurs.length)], R);
      }
    }
    return s;
  }
  function pluie(x, y, w, n = 6) {
    let s = "";
    for (let i = 0; i < n; i++) s += line(x + i * w / n, y + (i % 2) * 4, x + i * w / n - 3, y + (i % 2) * 4 + 7, C.pluie, 1.1);
    return s;
  }
  function nuage(x, y, e = 1) {
    return `<g fill="#ffffff" opacity=".95">${ell(x, y, 13 * e, 6 * e, "#fff")}${ell(x - 9 * e, y + 2 * e, 8 * e, 5 * e, "#fff")}${ell(x + 10 * e, y + 2 * e, 9 * e, 5 * e, "#fff")}</g>`;
  }
  function soleil(x, y, r = 8) {
    let s = circ(x, y, r, C.soleil);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      s += line(x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2), x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6), C.soleil, 1.4);
    }
    return s;
  }
  function arbre(x, y, e = 1, c = C.foret) {
    return rect(x - 0.8 * e, y - 6 * e, 1.6 * e, 6 * e, "#6b4f35") + ell(x, y - 9 * e, 4.5 * e, 5.5 * e, c);
  }
  // accolade verticale de profondeur (ex. « ≈ 8 km »)
  function cote(x, y1, y2, s) {
    return line(x, y1, x, y2, C.encre, 0.9) + line(x - 3, y1, x + 3, y1, C.encre, 0.9) + line(x - 3, y2, x + 3, y2, C.encre, 0.9)
      + txt(x + 4, (y1 + y2) / 2 + 3, s, { petit: true });
  }
  // couleurs des minéraux principaux (au moins 5 % de la roche)
  const couleursMin = (roche, n = 4) => {
    const l = (roche.mineraux || []).slice().sort((a, b) => b[1] - a[1]);
    const total = l.reduce((s, [, x]) => s + x, 0) || 1;
    return l.filter(([, x], i) => i === 0 || x / total >= 0.05).slice(0, n).map(([mid]) => (MINERAUX[mid] || {}).swatch || "#999");
  };

  // (suite : scènes par processus, diagrammes, données par roche)

  // ─────────────────────────────── C.2 · scènes magmatiques ───────────────────────────────
  const RELIEF_MONTAGNE = [[0, 18], [28, 10], [52, 4], [78, 10], [104, 3], [134, 11], [166, 6], [200, 15]];
  const RELIEF_PLAT = [[0, 16], [50, 14], [100, 15], [150, 13], [200, 15]];
  const RELIEF_COLLINES = [[0, 16], [40, 11], [80, 14], [120, 9], [160, 13], [200, 15]];

  // lieu de la fusion : croûte épaissie, manteau sous un continent, dorsale, manteau profond, panache archéen
  function sceneFusion(p) {
    const src = p.src || "manteau";
    let s = "";
    if (src === "croute") {
      s += lithosphere({ relief: RELIEF_MONTAGNE, moho: 122 });
      s += ell(100, 100, 46, 13, C.magma, { opacity: 0.13 }) + gouttes(100, 100, 42, 11, 30, p.graine + "f");
      s += chaleur(100, 134, 3, 22);
      s += txt(196, 84, p.profFusion || "≈ 25–35 km", { a: "end", petit: true });
    } else if (src === "dorsale") {
      s += rect(0, 0, W, H, C.manteau) + rect(0, 0, W, 34, C.mer) + poly([[0, 34], [80, 30], [100, 24], [120, 30], [200, 34], [200, 46], [120, 42], [100, 36], [80, 42], [0, 46]], C.crouteOce);
      s += poly([[62, 150], [100, 50], [138, 150]], C.astheno, { opacity: 0.55 });
      s += ell(100, 70, 22, 16, C.magma, { opacity: 0.14 }) + gouttes(100, 72, 20, 16, 24, p.graine + "f");
      s += fleche([[100, 146], [100, 118]], { c: C.encre }) + flecheCourbe(96, 58, 70, 52, 30, 60, { c: C.encre }) + flecheCourbe(104, 58, 130, 52, 170, 60, { c: C.encre });
      s += txt(4, 12, "océan", { petit: true }) + txt(4, 142, "manteau", { petit: true }) + txt(196, 142, p.profFusion || "≈ 20–60 km", { a: "end", petit: true });
    } else if (src === "profond") {
      s += lithosphere({ relief: RELIEF_PLAT, moho: 32, etiquettes: false });
      s += rect(0, 96, W, H - 96, C.astheno) + line(0, 96, W, 96, C.moho, 0.8, { "stroke-dasharray": "2 3" });
      s += txt(4, 28, "croûte", { petit: true }) + txt(4, 60, "lithosphère", { petit: true }) + txt(4, 108, "asthénosphère", { petit: true });
      s += ell(104, 132, 30, 9, C.magma, { opacity: 0.16 }) + gouttes(104, 132, 28, 8, 16, p.graine + "f", 1.8);
      for (const [x, y] of [[72, 124], [140, 128], [88, 142]]) s += poly([[x, y - 3], [x + 2.4, y], [x, y + 3], [x - 2.4, y]], "#ffffff", { stroke: C.encre, "stroke-width": 0.6 });
      s += txt(196, 120, p.profFusion || "> 150 km", { a: "end", petit: true });
    } else if (src === "panache") {
      s += rect(0, 0, W, H, C.manteauProfond) + rect(0, 0, W, 12, C.mer) + rect(0, 12, W, 8, C.crouteOce);
      s += path("M86 150 L86 96 C60 96 50 70 72 58 C84 50 116 50 128 58 C150 70 140 96 114 96 L114 150 Z", C.astheno);
      s += gouttes(100, 66, 26, 9, 22, p.graine + "f", 2);
      s += fleche([[100, 140], [100, 104]], { c: C.chaleur, sw: 2 });
      s += txt(4, 142, "manteau archéen", { petit: true }) + txt(196, 42, p.profFusion || "≈ 200 km et plus", { a: "end", petit: true });
    } else { // manteau sous un continent
      s += lithosphere({ relief: RELIEF_COLLINES, moho: 44 });
      s += rect(0, 100, W, H - 100, C.astheno) + line(0, 100, W, 100, C.moho, 0.8, { "stroke-dasharray": "2 3" });
      s += ell(100, 120, 44, 12, C.magma, p.co2 ? { opacity: 0.1 } : { opacity: 0.14 }) + gouttes(100, 120, 40, 10, 26, p.graine + "f");
      if (p.co2) for (let i = 0; i < 7; i++) s += circ(68 + i * 10, 112 + (i % 3) * 5, 1.6, "#ffffff", { stroke: C.encre, "stroke-width": 0.5 });
      s += fleche([[100, 148], [100, 136]], { c: C.encre, sw: 1.4 });
      s += txt(196, 94, p.profFusion || "≈ 60–100 km", { a: "end", petit: true });
    }
    return s;
  }

  // montée du magma : diapir dans la croûte, dyke depuis le manteau, remontée éclair d'une kimberlite
  function sceneMontee(p) {
    const src = p.src || "manteau";
    let s = "";
    if (src === "croute") {
      s += lithosphere({ relief: RELIEF_MONTAGNE, moho: 122 });
      s += ell(100, 104, 44, 10, C.magma, { opacity: 0.1 });
      s += path("M100 110 C92 96 80 84 84 70 C88 56 112 56 116 70 C120 84 108 96 100 110 Z", C.magma);
      s += path("M100 104 C96 94 90 86 92 76 C94 66 106 66 108 76 C110 86 104 94 100 104 Z", C.magmaClair, { opacity: 0.7 });
      s += fleche([[70, 92], [70, 64]]) + fleche([[130, 92], [130, 64]]);
    } else if (src === "dorsale") {
      s += rect(0, 0, W, H, C.manteau) + rect(0, 0, W, 34, C.mer) + poly([[0, 34], [80, 30], [100, 24], [120, 30], [200, 34], [200, 46], [120, 42], [100, 36], [80, 42], [0, 46]], C.crouteOce);
      s += path("M92 150 L96 60 L104 60 L108 150 Z", C.magma, { opacity: 0.8 });
      s += ell(100, 52, 24, 7, C.magma) + ell(100, 52, 14, 3.5, C.magmaClair);
      s += fleche([[80, 130], [80, 70]]) + fleche([[120, 130], [120, 70]]);
      s += txt(128, 56, "chambre", { petit: true });
    } else if (src === "profond" || src === "panache") {
      s += lithosphere({ relief: RELIEF_PLAT, moho: 32, etiquettes: false });
      s += rect(0, 96, W, H - 96, src === "panache" ? C.manteauProfond : C.astheno);
      s += path("M98 150 L97 100 L99 60 L98 16 L102 16 L103 60 L101 100 L102 150 Z", C.magma);
      const R = alea(p.graine + "m");
      for (let i = 0; i < 6; i++) s += cristal(100 + (R() - 0.5) * 4, 30 + i * 18, 2.4, R() * 180, i % 2 ? C.manteau : "#7c7f62", R);
      s += fleche([[118, 132], [118, 40]], { sw: 2 }) + txt(124, 90, p.vitesse || "quelques heures", { petit: true });
    } else {
      s += lithosphere({ relief: RELIEF_COLLINES, moho: 44 });
      s += rect(0, 100, W, H - 100, C.astheno);
      s += ell(100, 124, 40, 9, C.magma, { opacity: 0.1 });
      s += path("M97 124 L98 70 L99 40 L101 40 L102 70 L103 124 Z", C.magma);
      s += ell(100, 36, 26, 7, C.magma) + ell(100, 36, 15, 3.4, C.magmaClair);
      s += fleche([[74, 118], [74, 60]]) + fleche([[126, 118], [126, 60]]);
      if (p.reservoir !== false) s += txt(130, 32, p.reservoir || "réservoir", { petit: true });
    }
    return s;
  }

  // cristallisation lente en profondeur : chambre remplie de cristaux, profondeur cotée
  function scenePluton(p, roche) {
    let s = lithosphere({ relief: RELIEF_COLLINES, moho: 200, etiquettes: false });
    const cy = 92;
    s += ell(106, cy, 50, 24, C.magmaClair, { opacity: 0.35 });
    s += cristauxEllipse(106, cy, 50, 24, couleursMin(roche), 46, p.graine + "p", 4.2);
    s += ell(106, cy, 50, 24, "none", { stroke: C.magma, "stroke-width": 1.4 });
    s += cote(30, 14, cy - 24, p.prof || "≈ 5–10 km");
    for (const [x1, y1, x2, y2] of [[106, cy - 26, 106, cy - 38], [52, cy, 40, cy], [160, cy, 172, cy], [106, cy + 26, 106, cy + 38]])
      s += fleche([[x1, y1], [x2, y2]], { c: C.fluide, sw: 1.2, pointe: 4 });
    s += txt(196, 142, p.duree || "100 000 ans à 1 million d'années", { a: "end", petit: true });
    return s;
  }

  // mise à l'affleurement par l'érosion : ancien relief en tireté, massif dégagé
  function sceneErosion(p, roche) {
    let s = ciel(H);
    s += pline([[0, 40], [30, 22], [56, 12], [82, 24], [108, 8], [138, 22], [168, 14], [200, 30]], C.encre, 1, { "stroke-dasharray": "3 3", opacity: 0.6 });
    s += txt(196, 10, "relief disparu", { a: "end", petit: true });
    const sol = [[0, 92], [40, 88], [70, 80], [100, 76], [130, 80], [165, 88], [200, 92]];
    s += poly([...sol, [200, 150], [0, 150]], C.croute[1]);
    s += path("M52 150 C50 118 66 84 100 78 C134 84 150 118 148 150 Z", roche.swatch, { stroke: "rgba(0,0,0,.25)" });
    if (p.boules) for (const [x, y, r] of [[84, 72, 7], [96, 70, 9], [110, 71, 6.5], [118, 73, 5]]) s += ell(x, y, r, r * 0.8, roche.swatch, { stroke: "rgba(0,0,0,.35)" });
    for (let i = 0; i < 6; i++) s += fleche([[30 + i * 28, 40 + (i % 2) * 6], [30 + i * 28, 62 + (i % 2) * 6]], { c: "#6c7a89", sw: 1, pointe: 3.5, halo: false });
    s += txt(100, 120, roche.nom.split(" (")[0].split(" &")[0].toLowerCase(), { a: "middle", petit: true });
    s += txt(196, 142, p.dureeErosion || "10 millions d'années et plus", { a: "end", petit: true });
    return s;
  }

  // éruption : coulée fluide, dôme visqueux, strato-volcan à panache, fissure
  function sceneEruption(p, roche) {
    const style = p.eruption || "coulee";
    let s = ciel(H);
    const sol = C.croute[1];
    if (style === "dome") {
      s += poly([[0, 118], [200, 118], [200, 150], [0, 150]], sol);
      s += path("M98 150 L98 118", "none") + rect(97, 104, 6, 46, C.magma);
      s += path("M52 118 C54 80 78 58 100 58 C122 58 146 80 148 118 Z", roche.swatch, { stroke: C.encre, "stroke-width": 0.8 });
      s += pline([[84, 76], [90, 88], [86, 100]], C.magmaClair, 1.4) + pline([[112, 70], [108, 84], [116, 96]], C.magmaClair, 1.4);
      s += fleche([[100, 108], [100, 70]], { c: C.magma, sw: 1.8 });
      s += txt(196, 50, "lave visqueuse", { a: "end", petit: true });
    } else if (style === "strato") {
      s += poly([[0, 124], [60, 118], [100, 44], [112, 44], [150, 116], [200, 124], [200, 150], [0, 150]], C.croute[2]);
      s += rect(102, 50, 6, 100, C.magma);
      s += `<g fill="#b9b3ad" opacity=".95">${ell(106, 30, 20, 11, "#b9b3ad")}${ell(92, 18, 14, 9, "#c7c1bb")}${ell(122, 14, 16, 9, "#aaa39c")}</g>`;
      s += path("M112 48 C124 72 132 92 150 118 L144 120 C128 96 118 74 108 50 Z", C.laveChaude);
      s += txt(4, 12, "cendres et lave", { petit: true });
    } else if (style === "fissure") {
      s += rect(0, 110, W, 40, sol) + path("M40 110 L160 110", "none");
      for (let i = 0; i < 7; i++) s += path(`M${54 + i * 16} 110 C${50 + i * 16} 90 ${60 + i * 16} 80 ${56 + i * 16} ${70 + (i % 2) * 10} C${64 + i * 16} 84 ${62 + i * 16} 96 ${60 + i * 16} 110 Z`, i % 2 ? C.magmaClair : C.magma);
      s += rect(96, 110, 8, 40, C.magma) + poly([[40, 110], [170, 110], [196, 118], [30, 118]], C.laveChaude);
    } else { // coulée
      s += poly([[0, 122], [40, 116], [76, 96], [92, 88], [100, 88], [116, 96], [200, 124], [200, 150], [0, 150]], sol);
      s += rect(0, 132, W, 18, C.croute[2]);
      s += rect(94, 90, 5, 60, C.magma);
      for (let i = 0; i < 5; i++) s += path(`M${92 + i * 2} 88 C${86 + i * 4} ${74 - (i % 2) * 6} ${96 + i} 62 ${97 + i} 60 C${99 + i} 66 ${104 - i} 76 ${98 + i * 2} 88 Z`, i % 2 ? C.magmaClair : C.magma, { opacity: 0.9 });
      s += path("M100 90 C122 98 146 108 170 116 C182 120 192 124 200 126 L200 134 C186 131 170 126 152 120 C130 112 112 104 98 96 Z", C.laveChaude);
      s += path("M104 94 C126 102 150 112 176 120 C186 123 194 126 200 128", "none", { stroke: C.magmaClair, "stroke-width": 1.6 });
      s += txt(196, 146, p.laveT || "≈ 1 100–1 200 °C", { a: "end", petit: true, clair: true });
    }
    return s;
  }

  // refroidissement rapide : coupe de la coulée et loupe sur la pâte (microlites et verre)
  function sceneRefroidissement(p, roche) {
    let s = ciel(H);
    const mode = p.refroid || "orgues";
    if (mode === "verre") {
      s += poly([[0, 110], [200, 104], [200, 150], [0, 150]], C.croute[1]);
      s += path("M20 110 C40 70 90 60 120 72 C150 84 170 100 180 106 Z", C.verre);
      s += path("M60 86 C70 80 80 82 86 90 M96 76 C104 72 112 76 116 84", "none", { stroke: "#5a5a5a", "stroke-width": 1 });
    } else if (mode === "dome") {
      s += poly([[0, 118], [200, 118], [200, 150], [0, 150]], C.croute[1]);
      s += path("M30 118 C32 84 50 60 70 60 C90 60 108 84 110 118 Z", roche.swatch, { stroke: C.encre, "stroke-width": 0.8 });
      for (let i = 0; i < 4; i++) s += line(48 + i * 14, 70 + (i % 2) * 6, 46 + i * 14, 112, "rgba(0,0,0,.35)", 0.8);
    } else {
      s += rect(0, 60, W, 90, C.croute[1]);
      s += rect(0, 64, 118, 60, roche.swatch);
      for (let x = 6; x < 118; x += 12) s += line(x, 76, x + 1, 122, "rgba(255,255,255,.35)", 1);
      s += rect(0, 64, 118, 10, "#5a4a44");
      s += txt(4, 140, p.refroidTxt || "prismes de retrait (orgues)", { petit: true });
    }
    const coul = couleursMin(roche, 3);
    const R = alea(p.graine + "r");
    let pate = rect(0, 0, 200, 200, p.fondPate || "#3b3b3b");
    if (mode !== "verre") for (let i = 0; i < 70; i++) {
      const x = 118 + R() * 64, y = 36 + R() * 64, a = R() * Math.PI;
      pate += line(x, y, x + Math.cos(a) * 5, y + Math.sin(a) * 5, coul[i % coul.length], 1.6);
    }
    for (let i = 0; i < (mode === "verre" ? 2 : 3); i++) pate += cristal(132 + R() * 36, 50 + R() * 36, 6, R() * 180, coul[0], R);
    s += loupe(150, 68, 32, pate);
    s += txt(150, 114, mode === "verre" ? "verre sans cristaux" : "microlites + verre", { a: "middle", petit: true });
    s += txt(196, 142, p.dureeRefroid || "heures à années", { a: "end", petit: true });
    return s;
  }

  // éruption explosive : colonne plinienne, fontaines stromboliennes, avalanche de débris
  function sceneExplosion(p) {
    let s = ciel(H);
    const style = p.explosion || "plinienne";
    s += poly([[0, 128], [64, 120], [92, 72], [108, 72], [136, 120], [200, 128], [200, 150], [0, 150]], C.croute[2]);
    s += rect(97, 76, 6, 74, C.magma);
    if (style === "strombolienne") {
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.22;
        s += pline([[100, 72], [100 + Math.cos(a) * 34, 72 + Math.sin(a) * 50]], C.magmaClair, 1.2, { "stroke-dasharray": "2 3" });
        s += circ(100 + Math.cos(a) * 36, 72 + Math.sin(a) * 52, 2, C.laveChaude);
      }
      s += txt(4, 12, "scories projetées", { petit: true });
    } else if (style === "avalanche") {
      s = ciel(H) + poly([[0, 128], [64, 120], [92, 72], [100, 76], [120, 104], [200, 128], [200, 150], [0, 150]], C.croute[2]);
      const R = alea(p.graine + "a");
      for (let i = 0; i < 26; i++) s += cristal(116 + R() * 80, 104 + R() * 22, 3 + R() * 3, R() * 180, i % 3 ? "#8d8378" : "#6f665c", R);
      s += fleche([[112, 96], [176, 118]], { sw: 2 }) + txt(128, 90, "effondrement", { petit: true });
    } else {
      s += path("M94 72 C90 56 92 40 88 26 L112 26 C108 40 110 56 106 72 Z", "#a9a39c");
      s += `<g opacity=".95">${ell(100, 20, 46, 12, "#bdb7b0")}${ell(76, 16, 22, 9, "#c9c3bd")}${ell(128, 14, 26, 9, "#b3ada6")}</g>`;
      const R = alea(p.graine + "c");
      for (let i = 0; i < 40; i++) s += circ(40 + R() * 130, 30 + R() * 80, 0.9, "#6e6860");
      if (p.colonne !== "") s += txt(196, 142, p.colonne || "colonne de 10 à 40 km", { a: "end", petit: true });
    }
    return s;
  }

  // dépôts pyroclastiques
  function sceneDepotPyro(p, roche) {
    let s = ciel(H);
    const d = p.depot || "retombees";
    const R = alea(p.graine + "d");
    if (d === "ignimbrite") {
      s += poly([[0, 40], [40, 60], [70, 110], [130, 110], [160, 58], [200, 36], [200, 150], [0, 150]], C.croute[2]);
      s += poly([[42, 64], [70, 110], [130, 110], [158, 62]], roche.swatch);
      for (let i = 0; i < 14; i++) s += ell(62 + R() * 76, 70 + R() * 34, 5 + R() * 4, 1.1, "#3a302c");
      s += fleche([[20, 30], [60, 70]], { sw: 1.6 }) + txt(4, 22, "nuée ardente", { petit: true });
      s += txt(100, 124, "fiammes (ponces aplaties)", { a: "middle", petit: true });
    } else if (d === "breche") {
      s += rect(0, 50, W, 100, "#b8ab9a");
      for (let i = 0; i < 34; i++) s += cristal(R() * 200, 56 + R() * 90, 3 + R() * 9, R() * 180, i % 3 === 0 ? roche.swatch : i % 3 === 1 ? "#6f665c" : "#8e8173", R);
      s += txt(4, 44, "blocs dans une matrice de cendres", { petit: true });
    } else if (d === "scories") {
      s += poly([[0, 130], [50, 126], [84, 74], [96, 70], [104, 70], [116, 74], [150, 126], [200, 130], [200, 150], [0, 150]], "#6d3f2f");
      for (let i = 0; i < 60; i++) {
        const x = 50 + R() * 100, y = 76 + R() * 54;
        if (Math.abs(x - 100) < (y - 70) * 0.95) s += circ(x, y, 1.5 + R() * 2, i % 2 ? "#a4492f" : "#2e2624");
      }
      s += txt(196, 142, "cône de scories", { a: "end", petit: true });
    } else {
      s += rect(0, 40, W, 110, C.croute[2]);
      const couches = ["#e3ddd2", "#cfc8bb", "#ebe6dc", "#c3bbad", "#dfd8cb"];
      for (let i = 0; i < 5; i++) s += path(`M0 ${62 + i * 12} C50 ${54 + i * 12} 110 ${70 + i * 12} 200 ${60 + i * 12} L200 ${72 + i * 12} C110 ${82 + i * 12} 50 ${66 + i * 12} 0 ${74 + i * 12} Z`, couches[i]);
      for (let i = 0; i < 30; i++) s += circ(R() * 200, 4 + R() * 44, 0.9, "#6e6860");
      s += txt(4, 142, "couches de cendres", { petit: true });
    }
    s += txt(196, 12, p.dureeDepot || "minutes à jours", { a: "end", petit: true });
    return s;
  }



  // filon ou sill recoupant l'encaissant
  function sceneFilon(p, roche) {
    let s = ciel(14) + couches(14, 150, p.encaissant || ["#cdbd9b", "#b9a987", "#d3c3a1", "#bfae8b", "#c9b793", "#b4a384"]);
    s += path("M92 150 L96 40 L104 40 L108 150 Z", roche.swatch, { stroke: C.encre, "stroke-width": 0.6 });
    s += path("M100 80 L180 76 L180 84 L100 88 Z", roche.swatch, { stroke: C.encre, "stroke-width": 0.6 });
    s += fleche([[80, 140], [84, 60]], { c: C.magma, sw: 1.5 });
    s += txt(112, 58, "filon (dyke)", { petit: true }) + txt(130, 100, "sill", { petit: true });
    s += cote(20, 14, 40, p.profFilon || "≈ 1–5 km");
    return s;
  }
  // texture à la loupe : porphyrique, aplitique, pegmatitique, spinifex
  function sceneTexture(p, roche) {
    const mode = p.texture || "porphyrique";
    const coul = couleursMin(roche, 4);
    const R = alea("tx" + p.graine);
    let d = "";
    if (mode === "pegmatite") {
      d += rect(0, 0, 200, 200, "#e9dfd2");
      d += poly([[40, 20], [110, 30], [96, 90], [40, 80]], "#f1e6dc", { stroke: "#9a8e80" }) + poly([[110, 30], [170, 20], [170, 70], [96, 90]], "#d9d6d2", { stroke: "#9a8e80" });
      d += poly([[40, 80], [96, 90], [120, 130], [40, 130]], "#c8bfb4", { stroke: "#9a8e80" }) + poly([[96, 90], [170, 70], [170, 130], [120, 130]], "#efe7dc", { stroke: "#9a8e80" });
      d += rect(120, 40, 8, 40, "#2b2b2b") + poly([[60, 40], [72, 36], [74, 60], [62, 62]], "#8fbfa0");
    } else if (mode === "aplite") {
      d += texture(40, 20, 140, 110, coul.length ? coul : ["#eee"], 3.2, "ap" + p.graine);
    } else if (mode === "spinifex") {
      d += rect(0, 0, 200, 200, "#4d5a3f");
      for (let i = 0; i < 18; i++) { const x = 50 + R() * 100, y = 30 + R() * 80, a = -1.2 + (i % 3) * 0.3 + R() * 0.2; d += line(x, y, x + Math.cos(a) * 34, y + Math.sin(a) * 34, "#9fb36a", 2.2); }
    } else {
      d += texture(40, 20, 140, 110, ["#6f6a64", "#5f5a55", "#7d7770"], 3, "po" + p.graine);
      for (let i = 0; i < 6; i++) d += cristal(60 + R() * 90, 36 + R() * 76, 9, R() * 180, coul[i % coul.length], R);
    }
    let s = rect(0, 0, W, H, "#cfc5b0") + loupe(100, 70, 56, d);
    s += txt(100, 142, p.textureTxt || "gros cristaux dans une pâte fine", { a: "middle", petit: true });
    return s;
  }
  // fin de cristallisation d'un granite : liquide résiduel entre les cristaux
  function sceneLiquideResiduel(p, roche) {
    let d = texture(40, 20, 140, 110, couleursMin(roche, 3), 9, "lr" + p.graine);
    const R = alea("lq" + p.graine);
    for (let i = 0; i < 9; i++) { const x = 55 + R() * 90, y = 34 + R() * 70; d += ell(x, y, 7, 4, C.magmaClair, { stroke: C.magma, "stroke-width": 0.8 }); d += circ(x + 2, y, 1.3, "#ffffff"); }
    let s = rect(0, 0, W, H, "#cfc5b0") + loupe(100, 70, 56, d);
    s += txt(100, 142, p.residuelTxt || "liquide riche en eau et en silice", { a: "middle", petit: true });
    return s;
  }
  // amincissement de la croûte (rift) et remontée du manteau
  function sceneRift(p) {
    let s = ciel(20) + rect(0, 20, W, 130, C.manteau);
    s += poly([[0, 20], [70, 20], [90, 50], [110, 50], [130, 20], [200, 20], [200, 60], [140, 60], [110, 76], [90, 76], [60, 60], [0, 60]], C.croute[1]);
    s += poly([[90, 50], [110, 50], [110, 76], [90, 76]], C.mer);
    for (const x of [70, 130]) s += line(x, 20, x + (x < 100 ? 20 : -20), 58, C.encre, 1);
    s += fleche([[40, 40], [8, 40]], { sw: 1.6 }) + fleche([[160, 40], [192, 40]], { sw: 1.6 }) + fleche([[100, 140], [100, 90]], { sw: 1.6 });
    s += txt(4, 146, p.riftTxt || "la croûte s'étire et s'amincit", { petit: true });
    return s;
  }
  function sceneManteauFond(p, roche) {
    let s = ciel(16) + mer(16, C.merProfond) + poly([[0, 150], [0, 100], [60, 96], [80, 70], [120, 70], [140, 96], [200, 100], [200, 150]], C.croute[1]);
    s += path("M78 150 L82 72 L118 72 L122 150 Z", roche.swatch, { stroke: C.encre, "stroke-width": 0.6 });
    s += grains(40, 96, 40, 10, [roche.swatch, C.calcaire], 2, "mf", { n: 14, anguleux: true, trie: false }) + grains(120, 96, 40, 10, [roche.swatch, C.calcaire], 2, "mf2", { n: 14, anguleux: true, trie: false });
    s += txt(4, 146, p.fondTxt || "le manteau affleure au fond du bassin", { petit: true });
    return s;
  }
  // croûte océanique litée : laves en coussins, filons, gabbros, cumulats ; niveau de la roche encadré
  function sceneCrouteOceanique(p, roche) {
    const niv = [["laves en coussins", "#4d5552", 0], ["filons", "#66706b", 1], ["gabbros", "#6f7a62", 2], ["cumulats", "#5f6d45", 3], ["manteau", "#6f7f4a", 4]];
    let s = ciel(10) + mer(10, C.merProfond);
    niv.forEach(([nom, c, i]) => {
      const y = 36 + i * 22;
      s += rect(0, y, W, 22, c);
      if (i === 0) for (let k = 0; k < 10; k++) s += ell(10 + k * 20, y + 11, 9, 6, "#5d6763", { stroke: "#2f3533", "stroke-width": 0.8 });
      if (i === 1) for (let k = 0; k < 20; k++) s += line(k * 10 + 4, y, k * 10 + 4, y + 22, "#4a524e", 3);
      s += txt(196, y + 14, nom, { a: "end", petit: true, clair: true });
      if (nom === p.niveau) s += rect(1, y + 1, W - 2, 20, "none", { stroke: "#ffffff", "stroke-width": 2 });
    });
    return s;
  }
  function sceneObduction(p, roche) {
    let s = ciel(H);
    s += poly([[0, 150], [0, 112], [70, 108], [120, 92], [160, 70], [200, 62], [200, 150]], C.croute[1]);
    s += poly([[0, 150], [0, 126], [200, 116], [200, 150]], C.manteau);
    s += path("M20 104 C60 96 100 80 140 62 L176 50 L182 58 C150 74 110 94 70 110 L24 116 Z", "#4d5552");
    s += path("M92 88 C110 80 130 70 148 62 L152 68 C134 76 116 86 98 94 Z", roche.swatch, { stroke: C.encre, "stroke-width": 0.5 });
    s += fleche([[8, 100], [58, 92]], { sw: 1.6 });
    s += txt(4, 146, p.obdTxt || "océan charrié sur le continent", { petit: true });
    s += txt(196, 40, "continent", { a: "end", petit: true });
    return s;
  }
  function sceneCumulat(p, roche) {
    let s = lithosphere({ relief: RELIEF_COLLINES, moho: 200, etiquettes: false });
    s += ell(100, 86, 60, 30, C.magmaClair, { opacity: 0.4 }) + ell(100, 86, 60, 30, "none", { stroke: C.magma, "stroke-width": 1.4 });
    const coul = couleursMin(roche, 3), R = alea("cu" + p.graine);
    for (let i = 0; i < 40; i++) { const x = 50 + R() * 100, y = 100 + R() * 12; if (((x - 100) / 60) ** 2 + ((y - 86) / 30) ** 2 < 0.92) s += cristal(x, y, 3.5, R() * 180, coul[i % coul.length], R); }
    for (let i = 0; i < 8; i++) { const x = 60 + R() * 80, y = 66 + R() * 16; s += cristal(x, y, 3, R() * 180, coul[0], R); s += fleche([[x, y + 4], [x, y + 14]], { sw: 0.9, pointe: 3, halo: false }); }
    s += txt(4, 146, p.cumulatTxt || "les cristaux lourds tombent au fond", { petit: true });
    return s;
  }
  function sceneDiatreme(p, roche) {
    let s = ciel(20) + rect(0, 20, W, 130, C.croute[1]) + couches(20, 150, ["#cdbd9b", "#b9a987", "#d3c3a1", "#bfae8b", "#c9b793"]);
    s += path("M40 20 C60 60 86 110 96 150 L104 150 C114 110 140 60 160 20 Z", roche.swatch);
    s += grains(60, 24, 80, 100, ["#6f7f4a", "#8a7f70", "#3d3d3d"], 3, "di" + p.graine, { n: 36, anguleux: true, trie: false });
    for (const [x, y] of [[92, 60], [110, 84], [100, 110]]) s += poly([[x, y - 4], [x + 3, y], [x, y + 4], [x - 3, y]], "#ffffff", { stroke: C.encre, "stroke-width": 0.8 });
    s += txt(4, 146, p.diatremeTxt || "cheminée remplie de brèche (diatrème)", { petit: true });
    return s;
  }
  function sceneCarbonatite(p, roche) {
    let s = ciel(H) + poly([[0, 130], [70, 120], [96, 80], [104, 80], [130, 120], [200, 130], [200, 150], [0, 150]], "#8a8175");
    s += path("M98 82 C104 100 110 116 124 126 L118 128 C106 118 100 102 96 84 Z", "#1c1c1c") + path("M100 84 C94 100 86 116 72 124 L78 126 C90 118 98 102 102 86 Z", "#e9e6df");
    s += txt(4, 146, p.carboTxt || "lave noire qui blanchit à l'air", { petit: true });
    s += txt(196, 70, "≈ 500–600 °C", { a: "end", petit: true });
    return s;
  }

  // ─────────────────────────────── C.2 · scènes sédimentaires ───────────────────────────────
  // grains dans un rectangle : ronds (transportés) ou anguleux (sur place), triés ou non
  function grains(x0, y0, w, h, couleurs, taille, graine, o = {}) {
    const R = alea(graine);
    let s = "";
    const n = o.n || Math.round(w * h / (taille * taille * 2.2));
    for (let i = 0; i < n; i++) {
      const x = x0 + R() * w, y = y0 + R() * h;
      const t = o.trie === false ? taille * (0.3 + R() * 2.2) : taille * (0.75 + R() * 0.5);
      const c = couleurs[Math.floor(R() * couleurs.length)];
      s += o.anguleux ? cristal(x, y, t, R() * 180, c, R) : ell(x, y, t, t * (0.7 + R() * 0.3), c, { stroke: "rgba(0,0,0,.28)", "stroke-width": 0.5 });
    }
    return s;
  }
  // couches horizontales (légèrement ondulées) entre y0 et y1
  function couches(y0, y1, couleurs, o = {}) {
    const n = couleurs.length, e = (y1 - y0) / n;
    let s = "";
    couleurs.forEach((c, i) => {
      const a = y0 + i * e, b = a + e + 0.5, d = o.ondule || 0;
      s += path(`M0 ${r1(a)} C60 ${r1(a - d)} 140 ${r1(a + d)} 200 ${r1(a)} L200 ${r1(b)} C140 ${r1(b + d)} 60 ${r1(b - d)} 0 ${r1(b)} Z`, c);
    });
    return s;
  }
  const mer = (y, c = C.mer) => rect(0, y, W, H - y, c) + path(`M0 ${y} Q12 ${y - 2.5} 25 ${y} T50 ${y} T75 ${y} T100 ${y} T125 ${y} T150 ${y} T175 ${y} T200 ${y}`, "none", { stroke: "#ffffff", "stroke-width": 1, opacity: 0.8 });
  const nomCourt = (roche) => roche.nom.split(" (")[0].split(" /")[0].split(" &")[0];

  // 1 · altération et érosion d'un relief
  function sceneAlterationRelief(p) {
    let s = ciel(H);
    s += nuage(46, 20) + nuage(120, 14, 0.8) + pluie(30, 30, 30) + pluie(106, 24, 26, 5);
    const rel = p.relief === "granite" ? [[0, 150], [0, 96], [30, 78], [60, 52], [92, 44], [120, 60], [150, 72], [200, 90], [200, 150]]
      : [[0, 150], [0, 100], [34, 70], [62, 40], [84, 30], [110, 46], [140, 64], [200, 96], [200, 150]];
    s += poly(rel, p.couleurRelief || "#9d9585");
    for (let i = 0; i < 7; i++) s += line(52 + i * 11, 58 + (i % 3) * 8, 58 + i * 11, 70 + (i % 3) * 8, "rgba(40,30,20,.45)", 1);
    s += grains(110, 96, 70, 30, [C.sable, "#9d9585", C.argile], 2, "alt" + (p.graine || ""), { n: 40, anguleux: true, trie: false });
    s += flecheCourbe(100, 70, 130, 84, 160, 112, { sw: 1.4 });
    s += txt(4, 146, p.alterTxt || "pluie, gel, altération chimique", { petit: true });
    return s;
  }
  // 2 · transport : rivière, torrent, courant de turbidité, glacier, vent, mer
  function sceneTransport(p, roche) {
    const agent = p.agent || "riviere";
    const coul = [C.sable, C.galet, roche.swatch];
    let s = ciel(H);
    if (agent === "glacier") {
      s += poly([[0, 40], [60, 60], [120, 96], [200, 118], [200, 150], [0, 150]], "#8f8676");
      s += path("M0 34 C50 44 100 70 140 92 L200 110 L200 124 C150 112 100 96 60 76 C30 62 10 56 0 54 Z", C.glace, { stroke: C.glaceBord });
      s += grains(20, 44, 150, 40, [C.galet, "#6f675c", C.sable], 2.4, "gl" + p.graine, { n: 36, anguleux: true, trie: false });
      s += fleche([[40, 50], [150, 100]], { sw: 1.6 }) + txt(4, 146, "la glace transporte tout, sans trier", { petit: true });
    } else if (agent === "vent") {
      s += rect(0, 110, W, 40, C.sable) + path("M0 110 Q40 98 80 110 T160 110 T200 106 L200 150 L0 150 Z", C.sable);
      for (let i = 0; i < 26; i++) { const R = alea("v" + i + p.graine); s += circ(20 + R() * 170, 70 + R() * 36, p.grainVent || 1.2, C.ocre); }
      for (let i = 0; i < 3; i++) s += fleche([[10, 50 + i * 16], [70, 46 + i * 16], [130, 50 + i * 16]], { c: "#6c7a89", sw: 1.3, halo: false });
      s += txt(4, 146, p.ventTxt || "le vent trie les grains par taille", { petit: true });
    } else if (agent === "turbidite") {
      s += mer(0, C.merProfond) + poly([[0, 40], [60, 52], [120, 110], [200, 124], [200, 150], [0, 150]], "#8a8171");
      s += path("M40 46 C70 54 96 84 124 104 C150 112 176 116 200 118 L200 108 C170 104 146 98 128 88 C104 72 80 48 50 40 Z", "rgba(200,180,140,.8)");
      s += fleche([[60, 52], [118, 96], [190, 112]], { sw: 1.6 });
      s += txt(4, 12, "avalanche sous-marine", { petit: true, clair: true });
    } else if (agent === "mer") {
      s += mer(56) + poly([[0, 150], [0, 96], [80, 110], [200, 128], [200, 150]], C.sable);
      s += fleche([[20, 80], [80, 90], [150, 104]], { sw: 1.4 }) + fleche([[160, 70], [120, 70]], { sw: 1.2, c: "#fff" });
      s += grains(40, 96, 120, 20, coul, 1.8, "m" + p.graine, { n: 28 });
      s += txt(4, 146, "vagues et courants", { petit: true });
    } else { // rivière ou torrent
      const torrent = agent === "torrent";
      s += poly([[0, 150], [0, 40], [40, 60], [70, 96], [200, 116], [200, 150]], torrent ? "#8c8474" : C.vegetation);
      s += path("M0 70 C40 80 70 104 120 112 C150 116 180 120 200 122 L200 132 C170 130 140 126 110 122 C70 116 40 94 0 84 Z", C.eauDouce);
      s += grains(20, 84, 170, 40, coul, torrent ? 3.2 : 1.6, "r" + p.graine, { n: torrent ? 22 : 40, trie: !torrent });
      s += fleche([[20, 82], [90, 112], [180, 124]], { sw: 1.5 });
      s += txt(4, 146, torrent ? "courant fort : galets et blocs" : "le courant arrondit et trie les grains", { petit: true });
    }
    return s;
  }
  // 3 · dépôt en couches
  function sceneDepotCouches(p, roche) {
    const env = p.depot || "mer";
    let s = ciel(H);
    const g = p.grain || 1.6, cols = p.couleursDepot || [roche.swatch, C.sable, C.argile];
    if (env === "cone") {
      s += poly([[0, 150], [0, 30], [50, 56], [200, 110], [200, 150]], "#8c8474");
      s += path("M30 60 C80 70 140 96 200 116 L200 150 L0 150 L0 90 Z", roche.swatch);
      s += grains(20, 80, 170, 60, [C.galet, "#6f675c", C.sable], 3, "c" + p.graine, { n: 50, trie: false });
      s += txt(4, 146, "cône alluvial au pied du relief", { petit: true });
    } else if (env === "profond") {
      s += mer(0, C.merProfond) + couches(92, 150, ["#b9ab93", "#8b8479", "#c4b699", "#857e74", "#bcae95"]);
      for (let i = 0; i < 5; i++) s += grains(0, 92 + i * 11.6, 200, 5, [C.sable, C.galet], i % 2 ? 0.8 : 1.3, "t" + i + p.graine, { n: 60 });
      s += txt(4, 12, "alternances de grès et de pélites", { petit: true, clair: true });
    } else if (env === "calme") {
      s += mer(20) + couches(104, 150, cols.concat(cols).slice(0, 5));
      for (let i = 0; i < 30; i++) { const R = alea("cp" + i + p.graine); s += circ(R() * 200, 30 + R() * 66, 0.8, "#6e6860"); }
      s += txt(4, 146, p.depotTxt || "décantation en eau calme", { petit: true });
    } else if (env === "avant-pays") {
      s += poly([[0, 150], [0, 24], [30, 14], [60, 36], [80, 70], [200, 96], [200, 150]], "#8c8474");
      s += couches(96, 150, ["#d6c49d", "#b7ab92", "#cdb88c", "#a99f8f"]);
      s += txt(4, 146, "bassin au pied de la chaîne", { petit: true });
    } else {
      s += mer(28) + couches(98, 150, [C.sable, C.argile, C.sable, "#c9b890"]);
      s += grains(0, 98, 200, 50, [C.sable, C.galet], g, "d" + p.graine, { n: 50 });
      s += txt(4, 146, p.depotTxt || "dépôt en couches sur le fond", { petit: true });
    }
    return s;
  }
  // 4 · diagenèse : enfouissement, compaction, ciment (loupe) — ou grains restés meubles
  function sceneDiagenese(p, roche) {
    let s = couches(0, 150, ["#cdbd9b", "#b9a987", "#d3c3a1", "#bfae8b", "#c9b793", "#b4a384"]);
    s += fleche([[36, 16], [36, 60]], { sw: 1.8 }) + fleche([[62, 16], [62, 60]], { sw: 1.8 });
    s += txt(8, 80, p.profDia ?? "≈ 1–3 km", { petit: true }) + txt(8, 92, p.tDia ?? "≈ 40–100 °C", { petit: true });
    const ciment = { silice: "#e9eef2", calcite: "#f1ead9", oxydes: "#c77a3f", argile: "#a89c8a", aucun: "#8fc3df" }[p.ciment || "silice"];
    const coul = couleursMin(roche, 3);
    let dedans = rect(0, 0, 200, 200, ciment);
    const R = alea("dg" + p.graine);
    for (let y = 30; y < 120; y += (p.grainLoupe || 11)) for (let x = 105; x < 200; x += (p.grainLoupe || 11)) {
      const t = (p.grainLoupe || 11) * 0.48 * (p.ciment === "aucun" ? 0.8 : 1);
      dedans += p.anguleux ? cristal(x + R() * 3, y + R() * 3, t, R() * 180, coul[Math.floor(R() * coul.length)], R)
        : ell(x + R() * 3, y + R() * 3, t, t * 0.8, coul[Math.floor(R() * coul.length)], { stroke: "rgba(0,0,0,.3)", "stroke-width": 0.5 });
    }
    s += loupe(146, 74, 42, dedans);
    s += txt(146, 132, p.cimentTxt || (p.ciment === "aucun" ? "grains non cimentés" : "grains cimentés"), { a: "middle", petit: true });
    return s;
  }

  // mer chaude peu profonde et ses producteurs de carbonate
  function sceneMerCarbonatee(p) {
    let s = ciel(40) + soleil(176, 16, 7) + mer(40);
    s += rect(0, 118, W, 32, C.calcaire);
    const prod = p.producteurs || "coquilles";
    const R = alea("mc" + p.graine);
    if (prod === "recif") {
      for (let i = 0; i < 9; i++) { const x = 20 + i * 20, h = 16 + R() * 20; s += path(`M${x} 118 C${x - 6} ${118 - h} ${x + 2} ${118 - h - 6} ${x + 4} ${118 - h} C${x + 8} ${118 - h + 8} ${x + 10} 108 ${x + 8} 118 Z`, i % 2 ? "#e8a07c" : "#f0c9a0"); }
      s += txt(4, 146, "récif corallien", { petit: true });
    } else if (prod === "oolithes") {
      for (let i = 0; i < 40; i++) s += ell(R() * 200, 120 + R() * 26, 2.4, 2, "#f5ecd4", { stroke: "#b8a77f", "stroke-width": 0.6 });
      s += fleche([[40, 96], [90, 104]], { c: "#fff", sw: 1.2 }) + fleche([[140, 104], [96, 96]], { c: "#fff", sw: 1.2 });
      s += txt(4, 146, "oolithes roulées par les vagues", { petit: true });
    } else {
      for (let i = 0; i < 16; i++) { const x = R() * 190 + 5, y = 118 + R() * 24; s += path(`M${x} ${y} a5 4 0 0 1 10 0 Z`, i % 2 ? "#f3e4c8" : "#e7d3ae", { stroke: "#a38d66", "stroke-width": 0.6 }); }
      for (let i = 0; i < 4; i++) s += ell(20 + i * 50, 70 + (i % 2) * 20, 5, 2.4, "#6c8aa3");
      s += txt(4, 146, p.prodTxt || "coquilles et débris d'organismes", { petit: true });
    }
    return s;
  }
  // pluie de particules vers le fond (plancton, argile, silice), loupe facultative sur un organisme
  function scenePluieFond(p) {
    let s = ciel(20) + mer(20, p.profond ? C.merProfond : C.mer);
    s += rect(0, 124, W, 26, p.fond || C.craie);
    const R = alea("pf" + p.graine);
    for (let i = 0; i < 60; i++) s += circ(R() * 120, 30 + R() * 90, 0.9 + R() * 0.6, p.particule || "#ffffff");
    for (let i = 0; i < 4; i++) s += fleche([[20 + i * 28, 40], [20 + i * 28, 110]], { c: "#ffffff", sw: 1, pointe: 4, halo: false });
    if (p.organisme) s += loupe(162, 72, 30, dessinOrganisme(p.organisme));
    s += txt(4, 146, p.pluieTxt || "chute lente vers le fond", { petit: true });
    if (p.profTxt) s += txt(118, 80, p.profTxt, { petit: true, clair: true });
    return s;
  }
  // organismes vus au microscope, centrés en (x, y), taille e (1 = loupe de rayon 30)
  function dessinOrganisme(type, x = 162, y = 72, e = 1) {
    const X = (d) => r1(x + d * e), Y = (d) => r1(y + d * e);
    let s = "";
    if (type === "coccolithe") {
      s += circ(x, y, 17 * e, "#eef1ee", { stroke: "#8aa", "stroke-width": 0.8 });
      for (let i = 0; i < 14; i++) {
        const a = i * Math.PI / 7, cx = X(Math.cos(a) * 11), cy = Y(Math.sin(a) * 11);
        s += ell(cx, cy, 5 * e, 2.4 * e, "#ffffff", { stroke: "#789", "stroke-width": 0.6, transform: `rotate(${r1(i * 180 / 7)} ${cx} ${cy})` });
      }
    } else if (type === "radiolaire") {
      s += circ(x, y, 12 * e, "none", { stroke: "#7a6a52", "stroke-width": 1.2 });
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += line(X(Math.cos(a) * 12), Y(Math.sin(a) * 12), X(Math.cos(a) * 24), Y(Math.sin(a) * 24), "#7a6a52", 1); }
      for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; s += circ(X(Math.cos(a) * 6), Y(Math.sin(a) * 6), 1.4 * e, "none", { stroke: "#7a6a52", "stroke-width": 0.7 }); }
    } else if (type === "diatomee") {
      s += ell(x, y, 22 * e, 10 * e, "#f2f5f3", { stroke: "#5f7f6f", "stroke-width": 1.1 });
      for (let i = -18; i <= 18; i += 4) s += line(X(i), Y(-8), X(i), Y(8), "#8fa99b", 0.7);
    } else if (type === "spicule") {
      for (let i = 0; i < 6; i++) { const a = -0.9 + i * 0.35; s += line(X(-20 + i * 6), Y(-16 + (i % 2) * 6), X(-20 + i * 6 + Math.cos(a) * 26), Y(-16 + (i % 2) * 6 + Math.sin(a) * 26 + 14), "#9a8a70", 1.6); }
      s += line(X(-6), Y(-20), X(6), Y(20), "#9a8a70", 1.6) + line(X(-14), Y(0), X(14), Y(0), "#9a8a70", 1.6);
    }
    return s;
  }
  // accumulation lente sur le fond, rognons éventuels
  function sceneAccumulation(p, roche) {
    let s = mer(0, p.profond ? C.merProfond : C.mer);
    s += couches(62, 150, p.couleursCouches || [roche.swatch, "#e2dccb", roche.swatch, "#dcd5c2", roche.swatch]);
    if (p.nodules) for (let i = 0; i < 9; i++) { const R = alea("nd" + i); s += ell(20 + i * 21, 80 + (i % 3) * 22, 7, 4, "#3f3a36", { stroke: "#d8d2c6", "stroke-width": 1.2 }); }
    if (p.vitesse) s += txt(196, 56, p.vitesse, { a: "end", petit: true, clair: true });
    s += txt(4, 12, p.accTxt || "les couches s'empilent", { petit: true, clair: true });
    return s;
  }
  // enfouissement sous de nouvelles couches, loupe sur le ciment ou la roche restée tendre
  function sceneEnfouissement(p, roche) {
    let s = couches(0, 150, ["#d8cfb8", "#c9bfa6", "#ddd4bd", "#c4b99f", roche.swatch, roche.swatch]);
    s += fleche([[30, 10], [30, 96]], { sw: 1.8 });
    s += txt(38, 40, p.profEnf || "≈ 0,5–2 km", { petit: true }) + txt(38, 52, p.tEnf || "", { petit: true });
    let d = rect(0, 0, 200, 200, p.fondLoupe || "#efe8d6");
    const R = alea("en" + p.graine);
    for (let i = 0; i < 26; i++) d += p.loupe === "spath"
      ? cristal(110 + R() * 70, 40 + R() * 70, 8, R() * 180, i % 2 ? "#f6f1e3" : "#e3d9c1", R)
      : circ(110 + R() * 70, 40 + R() * 70, 2 + R() * 2.2, "#ffffff", { stroke: "#b8ac92", "stroke-width": 0.6 });
    s += loupe(146, 74, 40, d);
    s += txt(140, 132, p.loupeTxt || "calcite recristallisée", { a: "middle", petit: true });
    return s;
  }


  // ─── évaporites ───
  function sceneLagune(p) {
    let s = ciel(H) + soleil(24, 18, 7);
    s += poly([[0, 150], [0, 92], [60, 96], [96, 84], [112, 84], [140, 100], [200, 104], [200, 150]], "#c9b58e");
    s += rect(0, 70, 96, 30, C.mer) + path("M112 100 L200 100 L200 88 L112 88 Z", "#9fc9dc");
    s += poly([[0, 150], [0, 100], [60, 104], [96, 92], [112, 92], [140, 108], [200, 112], [200, 150]], "#c9b58e");
    s += fleche([[70, 80], [122, 82]], { sw: 1.4 });
    s += txt(4, 64, "mer ouverte", { petit: true }) + txt(196, 80, p.laguneTxt || "bassin presque fermé", { a: "end", petit: true });
    s += txt(4, 146, "l'eau de mer n'entre que par un seuil", { petit: true });
    return s;
  }
  function sceneEvaporation(p) {
    let s = ciel(H) + soleil(170, 20, 9);
    s += poly([[0, 150], [0, 80], [30, 84], [170, 84], [200, 80], [200, 150]], "#c9b58e");
    s += rect(30, 96, 140, 24, "#a9d0dd") + rect(30, 84, 140, 12, "rgba(169,208,221,.3)");
    s += line(30, 84, 170, 84, C.encre, 0.8, { "stroke-dasharray": "3 3" });
    for (let i = 0; i < 5; i++) s += fleche([[48 + i * 26, 94], [44 + i * 26, 82], [52 + i * 26, 70], [48 + i * 26, 58]], { c: "#6c7a89", sw: 1.1, pointe: 4, halo: false });
    s += txt(100, 136, p.facteurTxt || "l'eau se concentre en sels", { a: "middle", petit: true });
    return s;
  }
  function scenePrecipitation(p) {
    let s = ciel(40) + poly([[0, 150], [0, 40], [20, 44], [180, 44], [200, 40], [200, 150]], "#c9b58e");
    s += rect(20, 50, 160, 70, "#b7d9e2");
    const R = alea("pr" + p.graine), mineral = p.mineral || "gypse";
    for (let i = 0; i < 26; i++) {
      const x = 26 + R() * 148, y = 96 + R() * 22;
      if (mineral === "gypse") s += poly([[x, y], [x + 3, y - 12 - R() * 6], [x + 6, y]], "#f4efe2", { stroke: "#b3a78f", "stroke-width": 0.6 });
      else s += rect(x, y, 6, 6, mineral === "sylvite" ? "#e9b9a2" : "#fbfbf8", { stroke: "#a8a8a0", "stroke-width": 0.6 });
    }
    for (let i = 0; i < 18; i++) s += circ(26 + R() * 148, 56 + R() * 36, 0.9, "#6e8a96");
    s += txt(100, 138, p.precipTxt || "saturation : les cristaux se forment", { a: "middle", petit: true });
    return s;
  }
  function sceneSerieEvaporitique(p) {
    const series = p.series || [["carbonates", "#e5dcc6"], ["gypse", "#efe8da"], ["sel gemme", "#fbfbf8"], ["sels de potassium", "#e7b59c"]];
    let s = rect(0, 0, W, H, "#c9b58e");
    series.forEach(([nom, c], i) => {
      const y = 118 - i * 28;
      s += rect(30, y, 140, 28, c, { stroke: "rgba(0,0,0,.2)" });
      const actif = (p.couche || "gypse") === nom;
      s += txt(100, y + 17, nom, { a: "middle", petit: !actif });
      if (actif) s += rect(28, y - 2, 144, 32, "none", { stroke: C.chaleur, "stroke-width": 2 });
    });
    s += fleche([[16, 140], [16, 36]], { sw: 1.4 }) + txt(8, 30, "temps", { petit: true });
    if (p.enfouiTxt) s += txt(196, 12, p.enfouiTxt, { a: "end", petit: true });
    return s;
  }

  // roche caverneuse : vacuoles laissées par la dissolution
  function sceneVacuoles(p, roche) {
    let s = rect(0, 0, W, H, roche.swatch || C.dolomie);
    const R = alea("va" + p.graine);
    for (let i = 0; i < 60; i++) s += cristal(R() * 200, R() * 150, 2 + R() * 7, R() * 180, i % 4 ? "#3b2f26" : "#6e5a45", R);
    for (let i = 0; i < 20; i++) s += line(R() * 200, R() * 150, R() * 200, R() * 150, "rgba(120,90,50,.35)", 1);
    s += txt(4, 146, p.vacTxt || "vacuoles laissées par le gypse dissous", { petit: true, clair: true });
    return s;
  }
  // ─── silice, fer, phosphate, concrétions ───
  function sceneLoupeOrganismes(p) {
    let s = mer(0, p.lac ? C.eauDouce : C.mer);
    const R = alea("lo" + p.graine);
    for (let i = 0; i < 50; i++) s += circ(R() * 200, R() * 150, 0.9, "#ffffff");
    s += loupe(100, 72, 52, dessinOrganisme(p.organisme, 100, 72, 1.7), "#f7fbfc");
    s += txt(4, 146, p.orgTxt || "", { petit: true, clair: true });
    return s;
  }
  function sceneFondSousCCD(p) {
    let s = mer(0, C.merProfond) + rect(0, 118, W, 32, "#b35a43");
    s += line(0, 70, W, 70, "#ffffff", 1, { "stroke-dasharray": "5 4" }) + txt(196, 64, "limite de dissolution du calcaire", { a: "end", petit: true, clair: true });
    const R = alea("cc" + p.graine);
    for (let i = 0; i < 12; i++) { const x = 20 + R() * 160, y = 30 + R() * 30; s += circ(x, y, 3, "none", { stroke: "#ffffff", "stroke-width": 1 }); }
    for (let i = 0; i < 8; i++) { const x = 20 + R() * 160, y = 80 + R() * 30; s += circ(x, y, 3, "none", { stroke: "#ffffff", "stroke-width": 0.8, "stroke-dasharray": "1.5 2" }); }
    for (let i = 0; i < 16; i++) { const x = R() * 200, y = 76 + R() * 38; s += circ(x, y, 1.6, "#e9d9a8"); }
    s += txt(4, 146, "le calcaire se dissout, la silice reste", { petit: true, clair: true });
    return s;
  }
  function sceneNodules(p, roche) {
    let s = rect(0, 0, W, H, C.craie) + couches(0, 150, ["#f4f1e8", "#ece8dc", "#f4f1e8", "#ebe6d9", "#f4f1e8"]);
    for (let i = 0; i < 6; i++) {
      const x = 22 + i * 32, y = 50 + (i % 2) * 44;
      s += ell(x, y, 11, 6, p.couleurNodule || roche.swatch || "#3f3a36", { stroke: "#d6d0c3", "stroke-width": 1.4 });
      s += fleche([[x - 22, y - 16], [x - 11, y - 6]], { c: "#6c7a89", sw: 1, pointe: 3.5, halo: false });
    }
    s += txt(4, 146, p.noduleTxt || "la silice dissoute se regroupe en rognons", { petit: true });
    return s;
  }
  function sceneTransformationSilice(p) {
    const etapes = p.silice || [["opale-A", "#f3f0e4"], ["opale-CT", "#d9d4c2"], ["quartz", "#8f8577"]];
    let s = rect(0, 0, W, H, "#e7e1d3");
    etapes.forEach(([nom, c], i) => {
      const x = 36 + i * 64, R = alea("ts" + i);
      let d = rect(0, 0, 200, 200, c);
      for (let j = 0; j < 14; j++) d += i === 0 ? circ(x - 18 + R() * 36, 58 + R() * 36, 2.5, "none", { stroke: "#b5ab96", "stroke-width": 0.8 })
        : i === 1 ? circ(x - 18 + R() * 36, 58 + R() * 36, 3.2, "#c3bca8", { stroke: "#a39a85", "stroke-width": 0.5 })
        : cristal(x - 16 + R() * 32, 60 + R() * 32, 5, R() * 180, j % 2 ? "#9b917f" : "#7f7668", R);
      s += loupe(x, 76, 24, d);
      s += txt(x, 116, nom, { a: "middle", petit: true });
      if (i < etapes.length - 1) s += fleche([[x + 27, 76], [x + 37, 76]], { sw: 1.2, pointe: 4 });
    });
    s += txt(100, 138, p.siliceTxt || "l'enfouissement recristallise la silice", { a: "middle", petit: true });
    return s;
  }
  function sceneOceanAnoxique(p) {
    let s = ciel(18) + mer(18, "#5d8a78") + rect(0, 120, W, 30, "#6d6258");
    for (let i = 0; i < 12; i++) s += txt(18 + (i % 4) * 46 + (Math.floor(i / 4) % 2) * 20, 42 + Math.floor(i / 4) * 26, "Fe²⁺", { petit: true, clair: true });
    s += txt(4, 146, "océan sans oxygène : le fer reste dissous", { petit: true, clair: true });
    return s;
  }
  function sceneOxydationFer(p) {
    let s = ciel(18) + mer(18, "#6fa1b8") + poly([[0, 150], [0, 110], [200, 90], [200, 150]], "#6d6258");
    for (let i = 0; i < 8; i++) s += circ(20 + i * 22, 30 + (i % 2) * 10, 3, "#79b76b");
    s += txt(4, 12, p.oxyTxt || "cyanobactéries : O₂", { petit: true });
    const R = alea("of" + p.graine);
    for (let i = 0; i < 40; i++) s += circ(20 + R() * 170, 50 + R() * 50, 1.4, "#b5462f");
    for (let i = 0; i < 4; i++) s += fleche([[40 + i * 40, 56], [40 + i * 40, 92]], { c: "#b5462f", sw: 1.1, pointe: 4, halo: false });
    s += txt(4, 146, "Fe²⁺ + O₂ → oxydes de fer insolubles", { petit: true, clair: true });
    return s;
  }
  function sceneBandes(p, roche) {
    let s = "";
    for (let i = 0; i < 12; i++) s += rect(0, i * 12.5, W, 12.5, i % 2 ? "#8e3b2c" : "#4a4a4d");
    s += txt(196, 146, p.bandesTxt || "lits de fer et de silice alternés", { a: "end", petit: true, clair: true });
    return s;
  }
  function sceneKarst(p) {
    let s = ciel(20) + rect(0, 20, W, 130, C.calcaire) + couches(20, 150, ["#e9e2cb", "#dfd6bb", "#e9e2cb", "#dcd2b6"]);
    s += path("M70 20 C66 50 80 70 72 96 C66 116 86 136 100 150 L120 150 C110 132 96 116 104 94 C112 70 96 48 100 20 Z", p.remplissage ? "#a0652e" : "#6b5f4f");
    s += pluie(60, 2, 50, 6);
    if (p.remplissage) { const R = alea("ka"); for (let i = 0; i < 14; i++) s += cristal(82 + R() * 22, 40 + R() * 100, 2.4, R() * 180, i % 3 ? "#f1e6c8" : "#d8c9a4", R); }
    s += txt(4, 146, p.karstTxt || "l'eau creuse poches et conduits", { petit: true });
    return s;
  }
  function sceneSource(p) {
    let s = ciel(H) + poly([[0, 150], [0, 60], [80, 62], [120, 80], [200, 96], [200, 150]], C.calcaire);
    s += path("M84 70 C100 80 110 96 130 104 C150 112 176 118 200 122 L200 128 C176 124 150 118 128 112 C108 104 96 92 80 76 Z", C.eauDouce);
    for (let i = 0; i < 6; i++) s += circ(96 + i * 14, 80 + i * 7 - 8, 1.8, "#ffffff", { stroke: "#6c7a89", "stroke-width": 0.5 });
    for (let i = 0; i < 3; i++) s += fleche([[100 + i * 22, 78 + i * 8], [104 + i * 22, 62 + i * 8]], { c: "#6c7a89", sw: 1, pointe: 3.5, halo: false });
    s += txt(4, 50, "résurgence", { petit: true }) + txt(196, 146, "le CO₂ s'échappe de l'eau", { a: "end", petit: true });
    return s;
  }
  function sceneEncroutement(p, roche) {
    let s = ciel(H) + rect(0, 96, W, 54, roche.swatch);
    for (let i = 0; i < 9; i++) s += path(`M${10 + i * 21} 96 C${6 + i * 21} 80 ${16 + i * 21} 70 ${12 + i * 21} 58`, "none", { stroke: "#5b8f3e", "stroke-width": 2 });
    s += path("M0 70 C40 76 80 84 120 92 L200 106 L200 112 L120 98 C80 90 40 82 0 76 Z", C.eauDouce, { opacity: 0.8 });
    let d = rect(0, 0, 200, 200, "#e7dcc0");
    for (let i = 0; i < 5; i++) d += circ(150, 70, 8 + i * 5, "none", { stroke: i % 2 ? "#d2c39f" : "#f3ebd7", "stroke-width": 3 });
    d += circ(150, 70, 6, "#5b8f3e");
    s += loupe(150, 70, 32, d);
    s += txt(4, 146, "la calcite encroûte mousses et débris", { petit: true });
    return s;
  }

  // ─── roches organiques ───
  function sceneMarais(p) {
    let s = ciel(H) + rect(0, 96, W, 54, "#5a4a36") + rect(0, 88, W, 12, "#6f8d86");
    const foret = p.foret || "tourbiere";
    if (foret === "carbonifere") {
      for (let i = 0; i < 6; i++) { const x = 16 + i * 34; s += rect(x - 1.5, 30, 3, 62, "#6b5a3e"); for (let j = 0; j < 6; j++) s += path(`M${x} 30 q${-14 + j * 5} ${-6 + j} ${-18 + j * 7} ${8 + j * 2}`, "none", { stroke: "#4f7d3c", "stroke-width": 2 }); }
      s += txt(4, 12, "forêt marécageuse du Carbonifère", { petit: true });
    } else if (foret === "foret") {
      for (let i = 0; i < 8; i++) s += arbre(12 + i * 25, 92, 1.8, i % 2 ? C.foret : "#3f6b33");
      s += txt(4, 12, "forêt marécageuse", { petit: true });
    } else {
      for (let i = 0; i < 40; i++) { const R = alea("ma" + i); s += circ(R() * 200, 90 + R() * 6, 2 + R() * 2, i % 2 ? "#8fb35a" : "#b1c46b"); }
      s += txt(4, 12, "tourbière : sphaignes gorgées d'eau", { petit: true });
    }
    return s;
  }
  function sceneAnoxie(p) {
    let s = ciel(20) + rect(0, 20, W, 76, p.lac ? "#6f9aa6" : "#5f7f8c") + rect(0, 96, W, 54, "#3e342b");
    const R = alea("an" + p.graine);
    for (let i = 0; i < 30; i++) s += rect(R() * 196, 98 + R() * 48, 3 + R() * 5, 1.4, "#6b573f");
    for (let i = 0; i < 12; i++) s += circ(R() * 200, 30 + R() * 60, 1.2, "#8fb35a");
    s += txt(196, 92, p.anoxTxt || "sans oxygène, rien ne se décompose", { a: "end", petit: true, clair: true });
    s += txt(4, 146, p.accTxt || "la matière organique s'accumule", { petit: true, clair: true });
    return s;
  }
  function sceneHouillification(p, roche) {
    let s = couches(0, 150, ["#bfb49b", "#a99f88", "#c4b9a0", roche.swatch, "#b1a78f", "#9f957e"]);
    s += fleche([[30, 10], [30, 110]], { sw: 1.8 }) + txt(38, 60, p.profCharbon || "≈ 1–4 km", { petit: true }) + txt(38, 72, p.tCharbon || "", { petit: true });
    const rangs = [["tourbe", "#6b5536"], ["lignite", "#4d3b27"], ["houille", "#262322"], ["anthracite", "#101012"]];
    rangs.forEach(([nom, c], i) => {
      const x = 118, y = 26 + i * 28, actif = nom === p.rang;
      s += rect(x, y, 72, 22, c, actif ? { stroke: C.chaleur, "stroke-width": 2.4 } : { stroke: "rgba(255,255,255,.5)" });
      s += txt(x + 36, y + 14, nom, { a: "middle", petit: true, clair: true });
    });
    return s;
  }

  // roche mère : enfouissement et fenêtre à pétrole
  function sceneFenetrePetrole(p, roche) {
    let s = couches(0, 150, ["#bfb49b", "#a99f88", "#c4b9a0", "#b1a78f", "#9f957e", "#b8ad95"]);
    s += rect(0, 104, W, 26, "rgba(192,57,43,.25)") + txt(196, 120, "fenêtre à pétrole", { a: "end", petit: true });
    s += rect(0, 52, W, 12, roche.swatch) + txt(196, 48, "roche mère : kérogène", { a: "end", petit: true });
    s += fleche([[30, 8], [30, 60]], { sw: 1.8 }) + txt(38, 30, p.profCharbon || "< ≈ 2 km", { petit: true });
    s += txt(4, 146, "trop peu chauffée pour donner du pétrole", { petit: true });
    return s;
  }
  // ─── roches d'altération et formations superficielles ───
  function sceneClimatTropical(p) {
    let s = ciel(40) + nuage(40, 14) + nuage(140, 18, 0.9) + pluie(20, 22, 40) + pluie(120, 26, 40);
    s += rect(0, 40, W, 110, p.roche || "#7f7a6e");
    for (let i = 0; i < 9; i++) s += arbre(10 + i * 23, 42, 2.1, i % 2 ? C.foret : "#3f6b33");
    s += txt(4, 146, p.climatTxt || "chaud et très pluvieux", { petit: true, clair: true });
    return s;
  }
  function sceneProfil(p) {
    const h = p.horizons || [["sol", "#6b4a2f"], ["cuirasse", "#9e3b22"], ["argiles", "#caa27f"], ["saprolite", "#b8a58c"], ["roche saine", "#7f7a6e"]];
    let s = rect(0, 0, W, H, "#7f7a6e");
    const e = 150 / h.length;
    h.forEach(([nom, c], i) => { s += rect(0, i * e, 120, e + 0.5, c); s += txt(126, i * e + e / 2 + 3, nom, { petit: true }); if (p.actif === nom) s += rect(1, i * e + 1, 118, e - 2, "none", { stroke: "#ffffff", "stroke-width": 2 }); });
    if (p.lessivage) for (let i = 0; i < 4; i++) s += fleche([[20 + i * 30, 10], [20 + i * 30, 70]], { c: "#4d8fc6", sw: 1.3, pointe: 4 });
    if (p.remontee) for (let i = 0; i < 4; i++) s += fleche([[20 + i * 30, 120], [20 + i * 30, 70]], { c: "#4d8fc6", sw: 1.3, pointe: 4 });
    if (p.profilTxt) s += txt(4, 146, p.profilTxt, { petit: true, clair: true });
    return s;
  }
  function sceneVersant(p, roche) {
    const mode = p.versant || "colluvions";
    let s = ciel(H);
    if (mode === "eboulis") {
      s += poly([[0, 150], [0, 10], [60, 10], [70, 70], [200, 130], [200, 150]], "#b9b1a0");
      s += poly([[68, 60], [200, 128], [200, 150], [110, 150]], roche.swatch);
      s += grains(76, 70, 120, 70, ["#a79f8f", "#8f887a", "#c5bdac"], 2.6, "eb" + p.graine, { n: 60, anguleux: true, trie: false });
      if (p.gel) s += txt(8, 40, "gel–dégel", { petit: true });
      s += fleche([[64, 30], [80, 64]], { sw: 1.3 });
    } else if (mode === "gel") {
      s += poly([[0, 150], [0, 20], [120, 20], [130, 150]], "#b9b1a0");
      for (let i = 0; i < 6; i++) s += path(`M${60 + i * 10} 20 L${64 + i * 10} 60 L${58 + i * 10} 100`, "none", { stroke: "#51483d", "stroke-width": 1.2 });
      for (let i = 0; i < 6; i++) s += rect(62 + i * 10, 40 + (i % 3) * 14, 3, 6, "#eef6fb", { stroke: "#9cc3dd", "stroke-width": 0.6 });
      s += txt(128, 40, "l'eau gèle", { petit: true }) + txt(128, 52, "gonfle de 9 %", { petit: true });
    } else {
      s += poly([[0, 150], [0, 30], [80, 60], [150, 110], [200, 118], [200, 150]], C.vegetation);
      s += path("M0 34 C40 46 80 64 120 90 C150 108 180 114 200 118 L200 124 C160 122 130 116 110 104 C80 84 40 62 0 46 Z", "#8a6a45");
      s += poly([[120, 116], [200, 120], [200, 150], [100, 150]], roche.swatch);
      s += fleche([[30, 44], [90, 76], [140, 108]], { sw: 1.4 });
      s += txt(4, 146, p.versantTxt || "ruissellement, labours, gravité", { petit: true });
    }
    return s;
  }
  function sceneGlacier(p, roche) {
    let s = ciel(H) + poly([[0, 150], [0, 30], [70, 60], [140, 104], [200, 110], [200, 150]], "#8f8676");
    if (p.fonte) {
      s += path("M0 24 C30 30 60 44 90 62 L96 70 C70 60 40 44 0 40 Z", C.glace, { stroke: C.glaceBord });
      s += path("M100 108 C110 92 124 88 136 96 C148 104 156 106 160 110 Z", roche.swatch);
      s += grains(100, 92, 60, 16, [C.galet, "#6f675c", C.sable], 2.2, "mo" + p.graine, { n: 30, anguleux: true, trie: false });
      s += txt(196, 146, "dépôt sans tri : moraine", { a: "end", petit: true });
      s += txt(4, 12, "le glacier fond et recule", { petit: true });
    } else {
      s += path("M0 24 C50 32 100 60 140 90 L200 100 L200 112 C150 104 100 84 60 60 C30 44 10 40 0 40 Z", C.glace, { stroke: C.glaceBord });
      s += grains(50, 70, 60, 12, ["#6f675c", C.galet], 3, "ar" + p.graine, { n: 10, anguleux: true, trie: false });
      s += fleche([[20, 32], [120, 84]], { sw: 1.4 }) + txt(4, 146, "le glacier arrache et broie la roche", { petit: true });
    }
    return s;
  }
  function sceneDune(p, roche) {
    let s = ciel(H) + rect(0, 120, W, 30, C.sable);
    if (p.loess) {
      s += poly([[0, 150], [0, 104], [200, 98], [200, 150]], roche.swatch);
      for (let i = 0; i < 8; i++) s += path(`M${10 + i * 24} 104 l3 -10 l3 10`, "none", { stroke: "#a5a36a", "stroke-width": 1.2 });
      s += txt(4, 146, "placages de poussières (steppe)", { petit: true });
    } else {
      s += path("M0 120 C40 118 80 70 120 60 L150 120 Z", roche.swatch) + path("M120 60 L150 120 L126 120 Z", "#d9bd73");
      for (let i = 0; i < 3; i++) s += fleche([[10, 40 + i * 12], [90, 36 + i * 12]], { c: "#6c7a89", sw: 1.2, halo: false });
      s += fleche([[150, 132], [180, 132]], { sw: 1.4 }) + txt(4, 146, p.duneTxt || "la dune avance de 1 à 5 m par an", { petit: true });
    }
    return s;
  }
  function sceneEstuaire(p, roche) {
    let s = ciel(40) + mer(40, "#86b8c8") + poly([[0, 150], [0, 110], [80, 100], [200, 116], [200, 150]], roche.swatch);
    const R = alea("es" + p.graine);
    for (let i = 0; i < 50; i++) s += circ(R() * 200, 50 + R() * 50, 0.8, "#6e6860");
    s += fleche([[20, 60], [80, 64]], { sw: 1.2 }) + fleche([[190, 70], [130, 72]], { sw: 1.2 });
    s += txt(4, 32, "fleuve", { petit: true }) + txt(196, 32, "marée montante", { a: "end", petit: true });
    s += txt(4, 146, p.estTxt || "à l'étale, les particules fines se déposent", { petit: true });
    return s;
  }
  function sceneArene(p, roche) {
    let s = rect(0, 0, W, H, "#b6a58c") + poly([[0, 0], [200, 0], [200, 30], [0, 30]], "#7c5a3a");
    for (const [x, y, r] of [[40, 90, 18], [100, 110, 24], [160, 84, 16], [70, 136, 12]]) s += ell(x, y, r, r * 0.8, "#c9a0a0", { stroke: "rgba(0,0,0,.35)" });
    s += grains(0, 32, 200, 118, ["#d9c9a6", "#b39f82", "#e6dcc6"], 1.3, "ar" + p.graine, { n: 110, anguleux: true });
    for (let i = 0; i < 4; i++) s += fleche([[26 + i * 48, 8], [26 + i * 48, 40]], { c: "#4d8fc6", sw: 1.3, pointe: 4 });
    s += txt(4, 146, p.areneTxt || "arène et boules de roche saine", { petit: true, clair: true });
    return s;
  }
  function sceneResidu(p, roche) {
    let s = rect(0, 0, W, H, p.fond || C.calcaire) + couches(40, 150, [p.fond || C.calcaire, "#ddd5bd", p.fond || C.calcaire]);
    s += path("M40 40 C44 70 60 100 90 110 C120 100 140 70 150 40 Z", roche.swatch);
    s += rect(0, 0, W, 40, roche.swatch);
    if (p.silex) for (let i = 0; i < 16; i++) { const R = alea("si" + i); s += ell(R() * 200, 8 + R() * 26 + (i % 3 ? 0 : 20), 4, 2.4, "#3f3a36", { stroke: "#d6d0c3", "stroke-width": 0.8 }); }
    for (let i = 0; i < 4; i++) s += fleche([[20 + i * 50, 44], [20 + i * 50, 70]], { c: "#4d8fc6", sw: 1.2, pointe: 4 });
    s += txt(4, 146, p.residuTxt || "le résidu insoluble reste sur place", { petit: true });
    return s;
  }



  // manteau lithosphérique (péridotite en place)
  function sceneManteau(p, roche) {
    let s = lithosphere({ relief: RELIEF_COLLINES, moho: 50 });
    s += ell(110, 104, 34, 16, roche.swatch, { stroke: C.encre, "stroke-width": 0.8 });
    s += cristauxEllipse(110, 104, 34, 16, couleursMin(roche, 3), 22, "mt" + p.graine, 3.2);
    s += txt(196, 142, p.manteauTxt || "≈ 30–60 km", { a: "end", petit: true });
    return s;
  }
  // terrasses alluviales étagées
  function sceneTerrasses(p, roche) {
    let s = ciel(H) + poly([[0, 150], [0, 40], [40, 44], [50, 70], [80, 74], [90, 100], [110, 102], [120, 124], [200, 126], [200, 150]], "#9d9585");
    for (const [x1, y, x2, nom] of [[40, 44, 50, "Fx"], [80, 74, 90, "Fy"], [120, 124, 200, "Fz"]]) s += rect(x1 - 30, y - 4, x2 - x1 + 30, 6, roche.swatch) + txt(x1 - 26, y - 7, nom, { petit: true });
    s += path("M130 126 L200 126 L200 132 L130 132 Z", C.eauDouce);
    s += txt(4, 146, "une glaciation, une terrasse", { petit: true });
    return s;
  }
  // bas de versant : colluvions
  function sceneBasVersant(p, roche) {
    let s = ciel(H) + poly([[0, 150], [0, 30], [90, 80], [200, 100], [200, 150]], "#9d9585");
    s += path("M90 80 C120 86 160 94 200 98 L200 118 C150 116 110 106 80 92 Z", roche.swatch);
    for (let i = 0; i < 4; i++) s += line(96 + i * 24, 92 + i * 3, 196, 100 + i * 5, "rgba(0,0,0,.18)", 0.8);
    s += txt(4, 146, "accumulation au pied du versant", { petit: true });
    return s;
  }
  // grèzes litées : lits alternés fins et grossiers
  function sceneGrezes(p, roche) {
    let s = rect(0, 0, W, H, "#cfc5b0");
    for (let i = 0; i < 12; i++) {
      const y = 8 + i * 11.5;
      s += rect(0, y, W, 6, "#bfb39c");
      s += grains(0, y + 6, 200, 5, ["#a79f8f", "#8f887a"], i % 2 ? 1.4 : 2.2, "gz" + i, { n: 40, anguleux: true });
    }
    s += txt(4, 146, "grèzes : un lit par épisode de gel–dégel", { petit: true });
    return s;
  }

  // ─────────────────────────────── C.2 · scènes métamorphiques ───────────────────────────────
  // protolithe : argiles, sable, calcaire, basalte océanique, granite
  function sceneProtolithe(p) {
    const pro = p.protolithe || "argile";
    let s = ciel(20);
    if (pro === "basalte") {
      s += mer(20, C.merProfond) + rect(0, 96, W, 54, "#4d5552");
      for (let i = 0; i < 9; i++) s += ell(12 + i * 22, 100 + (i % 2) * 8, 11, 7, "#5d6763", { stroke: "#2f3533", "stroke-width": 1 });
      s += txt(4, 146, p.protoTxt || "basalte du plancher océanique", { petit: true, clair: true });
    } else if (pro === "granite") {
      s += rect(0, 20, W, 130, C.croute[1]) + path("M40 150 C40 90 70 60 110 60 C150 60 170 100 170 150 Z", "#d4a0a0", { stroke: "rgba(0,0,0,.25)" });
      s += cristauxEllipse(106, 110, 50, 34, ["#e8d8d0", "#d8c6c0", "#3a3a3a", "#f1ece3"], 36, "pg" + p.graine, 3.6);
      s += txt(4, 146, p.protoTxt || "granite", { petit: true });
    } else if (pro === "peridotite") {
      s += mer(20, C.merProfond) + rect(0, 60, W, 90, "#6f7f4a");
      s += cristauxEllipse(100, 105, 90, 40, ["#7f9a4a", "#5f7a3a", "#8a8f55"], 60, "pp" + p.graine, 4);
      s += txt(4, 146, "péridotite du manteau", { petit: true, clair: true });
    } else {
      const cols = { argile: ["#8f887c", "#a39b8d", "#7f786d"], sable: [C.sable, "#dcc083", "#e9d39a"], calcaire: [C.calcaire, "#ddd4bc", "#e9e2cb"],
        marne: ["#cfc6b2", "#a8a092", "#d9d0bb"], mixte: ["#8f887c", C.sable, "#a39b8d"] }[pro] || ["#8f887c", "#a39b8d"];
      s += mer(20) + couches(70, 150, [...cols, ...cols].slice(0, 6));
      s += txt(4, 146, p.protoTxt || { argile: "argiles et boues marines", sable: "sables", calcaire: "calcaires", marne: "boues calcaires et argileuses" }[pro] || "sédiments", { petit: true });
    }
    return s;
  }
  // enfouissement : collision continentale ou subduction ; losange = la future roche
  function sceneEnfouissementTecto(p) {
    const mode = p.tecto || "collision";
    let s = ciel(H);
    if (mode === "subduction") {
      s += mer(20, C.merProfond) + poly([[0, 20], [0, 150], [200, 150], [200, 20], [120, 26], [96, 40], [0, 40]], "#9c9272");
      s += poly([[0, 40], [96, 40], [200, 130], [200, 150], [170, 150], [80, 60], [0, 60]], "#4d5552");
      s += poly([[120, 26], [200, 20], [200, 90], [140, 60]], C.croute[1]);
      s += poly([[132, 92], [138, 86], [144, 92], [138, 98]], "#ffffff", { stroke: C.encre, "stroke-width": 1 });
      s += fleche([[40, 50], [120, 96]], { sw: 1.6 }) + txt(4, 146, p.tectoTxt || "plongée rapide et froide", { petit: true });
      s += txt(92, 120, p.profTecto || "40–80 km", { petit: true, clair: true });
    } else {
      s += poly([[0, 150], [0, 50], [40, 40], [80, 14], [100, 8], [120, 14], [160, 40], [200, 50], [200, 150]], C.croute[1]);
      s += path("M20 150 C50 110 80 90 100 90 C120 90 150 110 180 150 Z", C.croute[2]);
      s += fleche([[8, 100], [44, 100]], { sw: 1.8 }) + fleche([[192, 100], [156, 100]], { sw: 1.8 });
      s += poly([[94, 116], [100, 110], [106, 116], [100, 122]], "#ffffff", { stroke: C.encre, "stroke-width": 1 });
      s += fleche([[100, 60], [100, 104]], { sw: 1.2, tirets: "3 2" });
      s += txt(4, 146, p.tectoTxt || "collision : la croûte s'épaissit", { petit: true });
      s += txt(110, 120, p.profTecto || "15–35 km", { petit: true });
    }
    return s;
  }
  // recristallisation vue à la loupe (texture propre à chaque roche)
  function sceneRecristallisation(p, roche) {
    const tex = p.texture || "schistosite";
    const coul = couleursMin(roche, 5);
    const R = alea("rx" + p.graine);
    let d = rect(0, 0, 200, 200, coul[1] || "#aaa");
    if (tex === "ardoise") {
      d = rect(0, 0, 200, 200, "#59616b");
      for (let y = 20; y < 140; y += 3.2) d += line(40, y, 170, y - 8, "#6f7882", 1.2);
    } else if (tex === "schistosite" || tex === "gneiss") {
      for (let y = 26; y < 124; y += tex === "gneiss" ? 12 : 6) {
        const c = tex === "gneiss" ? (Math.round(y / 12) % 2 ? "#e8e2d6" : "#3b3b3b") : coul[Math.floor(R() * coul.length)];
        d += path(`M40 ${y} C80 ${y - 4} 120 ${y + 4} 170 ${y} L170 ${y + (tex === "gneiss" ? 12 : 4)} C120 ${y + 8} 80 ${y} 40 ${y + (tex === "gneiss" ? 12 : 4)} Z`, c);
      }
      if (p.grenat) for (let i = 0; i < 3; i++) d += cristal(80 + i * 26, 60 + (i % 2) * 20, 6, 0, "#9b2d3a", R);
    } else if (tex === "mosaique") {
      d += texture(40, 20, 140, 110, coul.length ? coul : ["#eee"], 10, "mo" + p.graine);
    } else if (tex === "aiguilles") {
      for (let i = 0; i < 60; i++) { const x = 50 + R() * 110, y = 30 + R() * 90, a = -0.2 + R() * 0.4; d += line(x, y, x + Math.cos(a) * 14, y + Math.sin(a) * 14, coul[i % Math.min(2, coul.length)], 2.6); }
    } else if (tex === "eclogite") {
      d = rect(0, 0, 200, 200, "#5f8a4a");
      for (let i = 0; i < 16; i++) d += cristal(50 + R() * 110, 30 + R() * 90, 7, R() * 180, "#a3303a", R);
    } else if (tex === "migmatite") {
      d = rect(0, 0, 200, 200, "#3f3d3b");
      for (let i = 0; i < 5; i++) d += path(`M40 ${34 + i * 20} C70 ${20 + i * 20} 90 ${52 + i * 20} 120 ${36 + i * 20} C140 ${26 + i * 20} 160 ${46 + i * 20} 170 ${34 + i * 20} L170 ${42 + i * 20} C160 ${54 + i * 20} 140 ${34 + i * 20} 120 ${44 + i * 20} C90 ${60 + i * 20} 70 ${28 + i * 20} 40 ${42 + i * 20} Z`, "#ebe3d5");
    } else if (tex === "maille") {
      d = rect(0, 0, 200, 200, "#4f6b45");
      for (let i = 0; i < 12; i++) d += cristal(50 + R() * 110, 30 + R() * 90, 7, R() * 180, "#7f9a4a", R);
      for (let i = 0; i < 20; i++) d += circ(50 + R() * 110, 30 + R() * 90, 1.2, "#1d1d1d");
    }
    let s = rect(0, 0, W, H, "#cfc5b0") + loupe(100, 70, 56, d);
    s += txt(100, 142, p.recristTxt || (tex === "mosaique" ? "les minéraux recristallisent en mosaïque" : "les minéraux recristallisent et s'orientent"), { a: "middle", petit: true });
    if (p.pt) s += txt(4, 12, p.pt, { petit: true });
    return s;
  }
  // remontée : chaîne érodée, roche métamorphique à l'affleurement
  function sceneRemontee(p, roche) {
    let s = ciel(H);
    s += pline([[0, 44], [40, 22], [80, 8], [100, 4], [120, 8], [160, 22], [200, 44]], C.encre, 1, { "stroke-dasharray": "3 3", opacity: 0.6 });
    s += poly([[0, 150], [0, 86], [60, 72], [100, 66], [140, 72], [200, 86], [200, 150]], C.croute[1]);
    s += path("M40 150 C50 110 70 72 100 68 C130 72 150 110 160 150 Z", roche.swatch, { stroke: "rgba(0,0,0,.25)" });
    for (let i = 0; i < 5; i++) s += fleche([[30 + i * 35, 30 + (i % 2) * 6], [30 + i * 35, 54 + (i % 2) * 6]], { c: "#6c7a89", sw: 1, pointe: 3.5, halo: false });
    s += fleche([[100, 132], [100, 90]], { sw: 1.6 });
    s += txt(196, 146, p.remonteeTxt || "érosion et remontée : ≈ 10 millions d'années", { a: "end", petit: true });
    return s;
  }
  // intrusion et auréole de contact
  function sceneIntrusion(p, roche) {
    const auréole = !!p.aureole;
    let s = ciel(14) + couches(14, 150, p.encaissant || ["#8f887c", "#a39b8d", "#7f786d", "#9a9284", "#857e72"]);
    if (auréole) {
      s += ell(100, 150, 96, 74, roche.swatch, { opacity: 0.95 }) + ell(100, 150, 76, 58, "#c9a37c", { opacity: 0.9 });
    }
    s += path("M60 150 C60 110 78 88 100 88 C122 88 140 110 140 150 Z", p.magmaCouleur || C.magma);
    if (!auréole) for (let i = 0; i < 5; i++) s += fleche([[100, 96], [100 + Math.cos(-Math.PI / 2 + (i - 2) * 0.55) * 46, 96 + Math.sin(-Math.PI / 2 + (i - 2) * 0.55) * 46]], { c: C.chaleur, sw: 1.3, pointe: 4 });
    if (p.fluides) for (let i = 0; i < 6; i++) s += circ(56 + i * 18, 80 - (i % 2) * 12, 2, C.fluide);
    s += txt(4, 146, p.intrusionTxt || (auréole ? "auréole : quelques centaines de m" : "un magma chaud s'injecte"), { petit: true });
    s += txt(100, 124, p.nomIntrusion || "granite", { a: "middle", petit: true, clair: true });
    return s;
  }
  // zone de faille : cisaillement ductile en profondeur ou cassant près de la surface
  function sceneFaille(p) {
    let s = ciel(14) + rect(0, 14, W, 136, C.croute[1]);
    s += path("M70 14 L96 150 L112 150 L86 14 Z", p.profonde ? "#b8a07c" : "#9f8e74");
    s += fleche([[56, 60], [60, 100]], { sw: 1.6 }) + fleche([[128, 100], [124, 60]], { sw: 1.6 });
    s += line(0, 70, W, 70, C.encre, 0.8, { "stroke-dasharray": "4 3" }) + txt(196, 66, "≈ 10–15 km, ≈ 300 °C", { a: "end", petit: true });
    s += txt(196, 38, "cassant", { a: "end", petit: true }) + txt(196, 96, "ductile", { a: "end", petit: true });
    if (p.seisme) s += `<g>${poly([[92, 110], [98, 98], [96, 106], [104, 96], [100, 112], [106, 104]], "#f2b632")}</g>`;
    s += txt(4, 146, p.failleTxt || "", { petit: true });
    return s;
  }
  function sceneBroyage(p, roche) {
    const mode = p.broyage || "mylonite";
    const R = alea("br" + p.graine);
    let d = rect(0, 0, 200, 200, mode === "pseudotachylite" ? "#6f675f" : "#9d9384");
    if (mode === "mylonite") {
      for (let y = 20; y < 130; y += 5) d += path(`M40 ${y} C90 ${y + 3} 120 ${y - 3} 170 ${y}`, "none", { stroke: y % 10 ? "#c9bfae" : "#6f675f", "stroke-width": 2 });
      for (let i = 0; i < 4; i++) { const x = 70 + i * 22, y = 50 + (i % 2) * 34; d += path(`M${x - 14} ${y + 4} C${x - 6} ${y - 6} ${x + 6} ${y - 6} ${x + 14} ${y - 4} C${x + 6} ${y + 6} ${x - 6} ${y + 6} Z`, "#e8d8c8", { stroke: "#5a524a", "stroke-width": 0.6 }); }
    } else if (mode === "cataclasite") {
      for (let i = 0; i < 40; i++) d += cristal(40 + R() * 130, 20 + R() * 110, 2 + R() * 8, R() * 180, i % 3 ? "#cfc3b0" : "#8a7f70", R);
    } else {
      d += path("M40 60 L170 76 L170 86 L110 82 L128 110 L118 112 L100 82 L40 72 Z", "#141414");
      for (let i = 0; i < 20; i++) d += cristal(40 + R() * 130, 20 + R() * 110, 3 + R() * 4, R() * 180, "#c9bfae", R);
    }
    let s = rect(0, 0, W, H, "#cfc5b0") + loupe(100, 70, 56, d);
    s += txt(100, 142, p.broyageTxt || "", { a: "middle", petit: true });
    return s;
  }
  // impact météoritique en trois temps
  function sceneImpact(p, roche) {
    const phase = p.phase || "approche";
    let s = rect(0, 0, W, 60, "#1e2233") + rect(0, 60, W, 90, C.croute[1]);
    if (phase === "approche") {
      s += circ(150, 24, 6, "#8a7f70") + fleche([[190, 4], [156, 20]], { c: "#f2b632", sw: 2 });
      s += txt(4, 146, "astéroïde de ≈ 1,5 km à ≈ 20 km/s", { petit: true });
    } else if (phase === "choc") {
      s += path("M60 60 C60 90 80 104 100 104 C120 104 140 90 140 60 Z", "#6b3a28");
      for (let i = 1; i < 4; i++) s += path(`M${100 - 22 * i} 60 A${22 * i} ${18 * i} 0 0 0 ${100 + 22 * i} 60`, "none", { stroke: "#f2b632", "stroke-width": 1.4, opacity: 1 - i * 0.22 });
      for (let i = 0; i < 10; i++) s += fleche([[100, 60], [100 + Math.cos(-Math.PI * (0.1 + i * 0.09)) * 60, 60 + Math.sin(-Math.PI * (0.1 + i * 0.09)) * 50]], { c: "#e0532b", sw: 1, pointe: 3.5, halo: false });
      s += txt(4, 146, "onde de choc : des dizaines de GPa", { petit: true });
    } else {
      s += path("M20 60 C30 100 60 120 100 120 C140 120 170 100 180 60 Z", roche.swatch);
      s += grains(40, 70, 120, 44, ["#8a7f70", "#cfc3b0", "#3a3a3a"], 2.6, "im" + p.graine, { n: 50, anguleux: true, trie: false });
      s += txt(4, 146, "brèches et verre d'impact", { petit: true });
    }
    return s;
  }
  // fluides : hydratation, échanges chimiques
  function sceneFluides(p, roche) {
    let s = rect(0, 0, W, H, p.fondFluides || C.croute[1]);
    if (p.fluidesFond === "mer") s = ciel(14) + mer(14, C.merProfond) + rect(0, 60, W, 90, p.fondFluides || "#5d6763");
    for (let i = 0; i < 7; i++) s += path(`M${14 + i * 28} ${p.fluidesFond === "mer" ? 60 : 10} C${4 + i * 28} 80 ${24 + i * 28} 110 ${14 + i * 28} 146`, "none", { stroke: C.fluide, "stroke-width": 1.4, "stroke-dasharray": "4 3" });
    if (p.echanges) s += txt(196, p.fluidesFond === "mer" ? 76 : 20, p.echanges, { a: "end", petit: true });
    s += txt(4, 146, p.fluidesTxt || "des fluides chauds circulent", { petit: true });
    return s;
  }

  // ─────────────────────────────── C.4 · outils des diagrammes ───────────────────────────────
  const nb = (x, d = 0) => x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  // cadre commun : viewBox 440 × 330, zone de tracé [X0, X1] × [Y0, Y1]
  const D = { W: 680, H: 330, X0: 54, X1: 628, Y0: 30, Y1: 290 };
  function cadre(o) {
    // o : { xmin, xmax, ymin, ymax, xlog, ylog, yBas (true = valeurs croissantes vers le bas) }
    const sx = (v) => {
      const a = o.xlog ? Math.log10(v) : v, a0 = o.xlog ? Math.log10(o.xmin) : o.xmin, a1 = o.xlog ? Math.log10(o.xmax) : o.xmax;
      return D.X0 + (a - a0) / (a1 - a0) * (D.X1 - D.X0);
    };
    const sy = (v) => {
      const a = o.ylog ? Math.log10(v) : v, a0 = o.ylog ? Math.log10(o.ymin) : o.ymin, a1 = o.ylog ? Math.log10(o.ymax) : o.ymax;
      const f = (a - a0) / (a1 - a0);
      return o.yBas ? D.Y0 + f * (D.Y1 - D.Y0) : D.Y1 - f * (D.Y1 - D.Y0);
    };
    return { sx, sy, o };
  }
  function axes(k, o) {
    const { sx, sy } = k;
    let s = `<rect x="${D.X0}" y="${D.Y0}" width="${D.X1 - D.X0}" height="${D.Y1 - D.Y0}" class="fc-cadre"/>`;
    for (const v of o.xticks) {
      const x = r1(sx(v));
      s += `<line x1="${x}" y1="${D.Y0}" x2="${x}" y2="${D.Y1}" class="fc-grille"/>`
        + `<text x="${x}" y="${D.Y1 + 13}" text-anchor="middle" class="fc-tick">${o.xfmt ? o.xfmt(v) : nb(v)}</text>`;
    }
    for (const v of o.yticks) {
      const y = r1(sy(v));
      s += `<line x1="${D.X0}" y1="${y}" x2="${D.X1}" y2="${y}" class="fc-grille"/>`
        + `<text x="${D.X0 - 5}" y="${y + 3.5}" text-anchor="end" class="fc-tick">${o.yfmt ? o.yfmt(v) : nb(v, o.ydec || 0)}</text>`;
    }
    s += `<text x="${(D.X0 + D.X1) / 2}" y="${D.H - 10}" text-anchor="middle" class="fc-axe">${o.xlab}</text>`
      + `<text x="14" y="${(D.Y0 + D.Y1) / 2}" text-anchor="middle" class="fc-axe" transform="rotate(-90 14 ${(D.Y0 + D.Y1) / 2})">${o.ylab}</text>`;
    if (o.y2) { // axe secondaire à droite : [valeur affichée, position dans l'unité de y]
      for (const [lab, v] of o.y2.ticks) {
        const y = r1(sy(v));
        s += `<line x1="${D.X1}" y1="${y}" x2="${D.X1 + 4}" y2="${y}" class="fc-grille-fort"/><text x="${D.X1 + 7}" y="${y + 3.5}" class="fc-tick">${lab}</text>`;
      }
      // 11 px du bord : à 8 px, le libellé pivoté dépassait de 3 px et se faisait rogner par le cadre du SVG
      s += `<text x="${D.W - 11}" y="${(D.Y0 + D.Y1) / 2}" text-anchor="middle" class="fc-axe" transform="rotate(90 ${D.W - 11} ${(D.Y0 + D.Y1) / 2})">${o.y2.lab}</text>`;
    }
    if (o.x2) {
      for (const [lab, v] of o.x2.ticks) {
        const x = r1(sx(v));
        s += `<line x1="${x}" y1="${D.Y0 - 4}" x2="${x}" y2="${D.Y0}" class="fc-grille-fort"/><text x="${x}" y="${D.Y0 - 7}" text-anchor="middle" class="fc-tick">${lab}</text>`;
      }
    }
    return s;
  }
  const clip = () => { const k = id("fc"); return { k, def: `<clipPath id="${k}"><rect x="${D.X0}" y="${D.Y0}" width="${D.X1 - D.X0}" height="${D.Y1 - D.Y0}"/></clipPath>` }; };
  const svgDiag = (contenu, titre) => `<svg viewBox="0 0 ${D.W} ${D.H}" class="fc-svg" role="img" aria-label="${titre}">${contenu}</svg>`;
  // étiquette de diagramme
  const dlab = (x, y, s, o = {}) => `<text x="${r1(x)}" y="${r1(y)}" class="fc-lab${o.cls ? " " + o.cls : ""}"${o.a ? ` text-anchor="${o.a}"` : ""}${o.rot != null ? ` transform="rotate(${r1(o.rot)} ${r1(x)} ${r1(y)})"` : ""}${o.c ? ` style="fill:${o.c}"` : ""}>${s}</text>`;
  // chemin numéroté : points { x, y, n } dans les unités du cadre ; flèches au milieu des segments
  function chemin(k, pts, couleur = "var(--fc-chemin)") {
    pts = pts.filter((p) => p.x != null && p.y != null && !Number.isNaN(p.y));
    const P = pts.map((p) => [k.sx(p.x), k.sy(p.y)]);
    // data-num : indice du point → numéro d'étape (curseur de l'animation des étapes, formation-anim.js)
    const num = pts.map((p, i) => p.n ? `${i}:${p.n}` : "").filter(Boolean).join(",");
    let s = `<polyline points="${P.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" class="fc-chemin" style="stroke:${couleur}" data-num="${num}"/>`;
    for (let i = 1; i < P.length; i++) {
      const [x1, y1] = P[i - 1], [x2, y2] = P[i];
      const L = Math.hypot(x2 - x1, y2 - y1);
      if (L < 18) continue;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, a = Math.atan2(y2 - y1, x2 - x1), t = 6;
      s += `<polygon points="${r1(mx + Math.cos(a) * t)},${r1(my + Math.sin(a) * t)} ${r1(mx + Math.cos(a + 2.5) * t)},${r1(my + Math.sin(a + 2.5) * t)} ${r1(mx + Math.cos(a - 2.5) * t)},${r1(my + Math.sin(a - 2.5) * t)}" style="fill:${couleur}"/>`;
    }
    // pastilles numérotées ; si une pastille recouvre une précédente, elle est décalée et reliée à son point
    const poses = [];
    pts.forEach((p, i) => {
      if (!p.n) return;
      const [x0, y0] = P[i];
      let x = x0, y = y0;
      const libre = (x, y) => !poses.some(([a, b]) => Math.hypot(a - x, b - y) < 16);
      const dedans = (x, y) => x >= D.X0 - 2 && x <= D.X1 + 2 && y >= D.Y0 - 2 && y <= D.Y1 + 2;
      if (!libre(x, y)) {
        // positions candidates autour du point, d'abord dans le cadre du graphique
        const cands = [];
        for (const r of [18, 34]) for (const f of [0.25, 0, 0.5, -0.25, 0.75, 1, -0.5, 1.25]) cands.push([x0 + Math.cos(f * Math.PI) * r, y0 + Math.sin(f * Math.PI) * r]);
        const c = cands.find(([a, b]) => libre(a, b) && dedans(a, b)) || cands.find(([a, b]) => libre(a, b));
        if (c) [x, y] = c;
      }
      s += `<g class="fc-pastille" data-n="${p.n}">`;
      if (x !== x0 || y !== y0) s += `<line x1="${r1(x0)}" y1="${r1(y0)}" x2="${r1(x)}" y2="${r1(y)}" style="stroke:${couleur}" stroke-width="1.2"/>`;
      poses.push([x, y]);
      s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="7.5" class="fc-num" style="fill:${couleur}"/><text x="${r1(x)}" y="${r1(y + 3.5)}" text-anchor="middle" class="fc-num-t">${p.n}</text></g>`;
    });
    // curseur (caché) : glisse le long du chemin pendant l'animation, PAR-DESSUS les pastilles
    s += `<circle r="6" class="fc-curseur" cx="-99" cy="-99"/>`;
    return s;
  }
  // légende du chemin (liste numérotée sous le diagramme)
  function legendeChemin(pts) {
    const items = pts.filter((p) => typeof p.t === "string" && p.t);
    return items.length ? `<ol class="fc-etapes">${items.map((p) => `<li${p.n ? ` data-n="${p.n}"` : ' class="fc-sans"'}><b>${p.n || ""}</b><span>${p.t}</span></li>`).join("")}</ol>` : "";
  }

  // ─────────────────────────────── C.4 · pression–température ───────────────────────────────
  // profondeur (km) ↔ pression (GPa) : croûte de masse volumique 2,8 sur 35 km, manteau à 3,3 dessous
  const kmDeGPa = (p) => p <= 0.9614 ? p / 0.027468 : 35 + (p - 0.9614) / 0.032373;
  const GPaDeKm = (d) => d <= 35 ? d * 0.027468 : 0.9614 + (d - 35) * 0.032373;
  const ECHELLES_PT = {
    croute: { T: 1400, P: 1.2, dT: 200, dP: 0.2, km: [0, 10, 20, 30, 40] },
    manteau: { T: 1800, P: 4, dT: 300, dP: 0.5, km: [0, 25, 50, 75, 100, 125] },
    profond: { T: 2000, P: 8, dT: 400, dP: 1, km: [0, 50, 100, 150, 200, 250] },
    reg: { T: 1000, P: 1.6, dT: 200, dP: 0.2, km: [0, 10, 20, 30, 40, 50] },
    hp: { T: 1000, P: 3.2, dT: 200, dP: 0.4, km: [0, 25, 50, 75, 100] },
    contact: { T: 1000, P: 0.6, dT: 200, dP: 0.1, km: [0, 5, 10, 15, 20] },
    faille: { T: 1400, P: 0.8, dT: 200, dP: 0.1, km: [0, 10, 20, 30] },
  };
  // courbes de référence : [T °C, P GPa]
  const echantillon = (f, a, b, n = 40) => Array.from({ length: n + 1 }, (_, i) => f(a + (b - a) * i / n));
  const COURBES_PT = {
    peridotite: { nom: "solidus du manteau sec", src: "hirschmann", pts: () => echantillon((p) => [1120.661 + 132.899 * p - 5.104 * p * p, p], 0, 8), cls: "fc-c-magma" },
    peridotiteEau: { nom: "solidus du manteau saturé en eau", src: "grove2006", pts: () => [[860, 2.0], [845, 2.3], [830, 2.6], [815, 2.9], [800, 3.2]], cls: "fc-c-magma" },
    graniteEau: { nom: "solidus du granite en présence d'eau", src: "tuttle", pts: () => [[770, 0.05], [720, 0.1], [685, 0.2], [665, 0.3], [655, 0.4], [645, 0.5], [625, 1.0]], cls: "fc-c-magma" },
    jadeite: { nom: "albite → jadéite + quartz", src: "holland", pts: () => echantillon((t) => [t, 0.035 + 0.00265 * t], 150, 1000), cls: "fc-c-min" },
    coesite: { nom: "quartz → coésite", src: "bose", pts: () => echantillon((t) => [t, 2.1945 + 0.0006901 * (t + 273.15)], 300, 1000), cls: "fc-c-min" },
    diamant: { nom: "graphite → diamant", src: "kennedy", pts: () => echantillon((t) => [t, 1.94 + 0.0025 * t], 600, 2000), cls: "fc-c-min" },
    kyAnd: { nom: "", src: "pattison", pts: () => [[550 - 0.45 / 0.00115, 0], [550, 0.45]], cls: "fc-c-min" },
    andSil: { nom: "", src: "pattison", pts: () => [[550, 0.45], [550 + 0.45 / 0.0016, 0]], cls: "fc-c-min" },
    kySil: { nom: "", src: "pattison", pts: () => [[550, 0.45], [1000, 0.45 + 0.00207 * 450]], cls: "fc-c-min" },
    quartzDuctile: { nom: "quartz ductile au-delà", src: "scholz", pts: () => [[300, 0], [300, 1]], cls: "fc-c-frag" },
    feldspathDuctile: { nom: "feldspaths ductiles au-delà", src: "scholz", pts: () => [[450, 0], [450, 1]], cls: "fc-c-frag" },
  };
  // faciès métamorphiques (limites progressives, positions indicatives)
  const B_BLEU = [[100, 0.42], [200, 0.55], [300, 0.68], [400, 0.82], [500, 0.98]];
  const E_ECLO = [[500, 1.25], [700, 1.30], [900, 1.45], [1100, 1.6]];
  const FACIES = [
    { nom: "diagenèse", c: "rgba(150,150,150,.13)", pts: [[0, 0], [200, 0], [200, 0.55], [100, 0.42], [0, 0.3]], lab: [95, 0.12] },
    { nom: "très faible degré", c: "rgba(160,180,110,.2)", pts: [[200, 0], [300, 0], [300, 0.68], [200, 0.55]], lab: [250, 0.36], rot: -90 },
    { nom: "schistes verts", c: "rgba(70,165,95,.22)", pts: [[300, 0.2], [500, 0.2], [500, 0.98], [400, 0.82], [300, 0.68]], lab: [400, 0.5] },
    { nom: "amphibolites", c: "rgba(60,125,150,.2)", pts: [[500, 0.2], [700, 0.2], [740, 0.8], [775, 1.28], [700, 1.3], [500, 1.25]], lab: [615, 0.72] },
    { nom: "granulites", c: "rgba(205,125,60,.2)", pts: [[700, 0.2], [1200, 0.2], [1200, 1.65], [900, 1.45], [775, 1.28], [740, 0.8]], lab: [890, 0.8] },
    { nom: "schistes bleus", c: "rgba(70,110,210,.22)", pts: [...B_BLEU, [500, 8], [100, 8]], lab: [300, 1.15] },
    { nom: "éclogites", c: "rgba(175,65,95,.2)", pts: [...E_ECLO, [1200, 1.65], [1200, 8], [500, 8]], lab: [760, 1.9] },
    { nom: "cornéennes", c: "rgba(215,170,50,.24)", pts: [[300, 0], [1200, 0], [1200, 0.2], [300, 0.2]], lab: [640, 0.1] },
  ];

  function diagrammePT(c, roche) {
    const E = ECHELLES_PT[c.echelle || "croute"];
    const k = cadre({ xmin: 0, xmax: E.T, ymin: 0, ymax: E.P, yBas: true });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    const ticks = (max, pas) => Array.from({ length: Math.floor(max / pas + 1e-9) + 1 }, (_, i) => Math.round(i * pas * 1000) / 1000);
    s += axes(k, {
      xticks: ticks(E.T, E.dT), yticks: ticks(E.P, E.dP), ydec: E.dP < 1 ? (E.dP < 0.2 ? 1 : 1) : 0,
      xlab: "Température (°C)", ylab: "Pression (GPa)",
      y2: { lab: "Profondeur (km)", ticks: E.km.map((d) => [nb(d), GPaDeKm(d)]).filter(([, p]) => p <= E.P) },
    });
    let g = "";
    const P2 = (pts) => pts.map(([t, p]) => `${r1(k.sx(t))},${r1(k.sy(p))}`).join(" ");
    // champs : faciès métamorphiques ou domaine partiellement fondu
    if (c.champs === "facies") {
      for (const f of FACIES) {
        g += `<polygon points="${P2(f.pts)}" style="fill:${f.c}"/>`;
      }
    }
    for (const nomC of c.fondu || []) { // domaine au-delà d'un solidus
      const cb = COURBES_PT[nomC], pts = cb.pts();
      g += `<polygon points="${P2([...pts, [3000, pts[pts.length - 1][1]], [3000, 0], [pts[0][0], 0]])}" class="fc-fondu"/>`;
    }
    // courbes
    for (const nomC of c.courbes || []) {
      const cb = COURBES_PT[nomC];
      g += `<polyline points="${P2(cb.pts())}" class="fc-courbe ${cb.cls}"/>`;
    }
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    // étiquettes des champs et des courbes (hors découpe pour rester lisibles, mais seulement si dans le cadre)
    const dans = (t, p) => t >= 0 && t <= E.T && p >= 0 && p <= E.P;
    if (c.champs === "facies") for (const f of FACIES) {
      const [t, p] = (c.labFacies && c.labFacies[f.nom]) || f.lab;
      if (dans(t, p) && !(c.masquer || []).includes(f.nom)) s += dlab(k.sx(t), k.sy(p), f.nom, { a: "middle", cls: "fc-lab-champ", rot: f.rot });
    }
    for (const [nomC, t, p, rot] of c.etiquettes || []) {
      const cb = COURBES_PT[nomC];
      const texte = cb ? cb.nom : nomC;
      const mineral = ["andalousite", "sillimanite", "disthène", "graphite stable", "diamant stable", "diamant", "graphite"].includes(nomC);
      if (dans(t, p)) s += dlab(k.sx(t), k.sy(p), texte, { a: "middle", rot, cls: cb || mineral ? "fc-lab-courbe" : "fc-lab-champ" });
    }
    if (c.bande) { // intervalle de cristallisation de la roche, à sa profondeur de mise en place
      const [t1, t2, p] = c.bande;
      s += `<rect x="${r1(k.sx(t1))}" y="${r1(k.sy(p) - 5)}" width="${r1(k.sx(t2) - k.sx(t1))}" height="10" rx="3" class="fc-bande"/>`
        + dlab(k.sx(t2) + 6, k.sy(p) + 4, "cristallisation", { cls: "fc-lab-bande" });
    }
    s += chemin(k, c.chemin.map((q) => ({ x: q.T, y: q.P, n: q.n })));
    return svgDiag(s, `Diagramme pression–température de formation : ${roche.nom}`) + legendeChemin(c.chemin);
  }


  // ─────────────────────────────── C.4 · évaporation de l'eau de mer ───────────────────────────────
  // concentration (× eau de mer) = 1 / (1 − f), f = part de l'eau évaporée ; exemple : 10 m d'eau, 2 m évaporés par an
  const SEUILS_EVAP = [
    { nom: "carbonates", de: 1, a: 3.8, c: "rgba(190,170,120,.22)" },
    { nom: "gypse", de: 3.8, a: 10.6, c: "rgba(150,150,170,.22)" },
    { nom: "sel gemme (halite)", de: 10.6, a: 65, c: "rgba(90,160,210,.18)" },
    { nom: "sels de potassium et de magnésium", de: 65, a: 250, c: "rgba(215,120,90,.2)" },
  ];
  function diagrammeEvaporation(c, roche) {
    const k = cadre({ xmin: 0, xmax: 5, ymin: 1, ymax: 250, ylog: true });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    let g = "";
    for (const z of SEUILS_EVAP) {
      const actif = z.nom.startsWith(c.couche || "gypse");
      g += `<rect x="${D.X0}" y="${r1(k.sy(z.a))}" width="${D.X1 - D.X0}" height="${r1(k.sy(z.de) - k.sy(z.a))}" style="fill:${z.c}${actif ? ";stroke:var(--fc-chemin);stroke-width:1.5" : ""}"/>`;
    }
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    s += axes(k, {
      xticks: [0, 1, 2, 3, 4, 5], yticks: [1, 2, 5, 10, 20, 50, 100, 200], xlab: "Temps (années) : lagune de 10 m, 2 m évaporés par an",
      ylab: "Concentration de la saumure (× eau de mer)", yfmt: (v) => `× ${nb(v)}`,
      x2: { ticks: [[`0 %`, 0], ["50 %", 2.5], ["74 %", 3.68], ["91 %", 4.53]] },
    });
    s += dlab(D.X0, D.Y0 - 18, "eau évaporée", { cls: "fc-lab-courbe" });
    for (const z of SEUILS_EVAP) s += dlab(D.X0 + 6, k.sy(Math.sqrt(z.de * Math.min(z.a, 250))) + 4, z.nom, { cls: "fc-lab-champ" });
    for (const [v, lab] of [[3.8, "× 3,8"], [10.6, "× 10,6"], [65, "≈ × 65"]]) s += dlab(D.X1 - 4, k.sy(v) - 4, lab, { a: "end", cls: "fc-lab-courbe" });
    const courbe = echantillon((tt) => [tt, 1 / (1 - tt / 5.03)], 0, 4.99, 80);
    s += `<polyline points="${courbe.map(([x, y]) => `${r1(k.sx(x))},${r1(k.sy(y))}`).join(" ")}" class="fc-courbe fc-c-eau" clip-path="url(#${cl.k})"/>`;
    s += chemin(k, c.chemin.map((q) => ({ x: q.an, y: q.an == null ? null : 1 / (1 - q.an / 5.03), n: q.n })));
    return svgDiag(s, `Évaporation de l'eau de mer et seuils de saturation : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.4 · silice dissoute ───────────────────────────────
  const siliceAmorphe = (tc) => Math.pow(10, -731 / (tc + 273.15) + 4.52);                  // mg/kg, Fournier et Rowe 1977
  const siliceQuartz = (tc) => Math.pow(10, -0.0254 - 1107.12 / (tc + 273.15)) * 60084;     // mg/kg, Rimstidt 1997
  function diagrammeSilice(c, roche) {
    // tmax : 120 °C (diagenèse) par défaut ; jusqu'à 300 °C pour les filons hydrothermaux (formules extrapolées, dit en source)
    const TM = c.tmax || 120;
    const k = cadre({ xmin: 0, xmax: TM, ymin: 0.1, ymax: 1000, ylog: true });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    let g = `<rect x="${D.X0}" y="${r1(k.sy(10))}" width="${D.X1 - D.X0}" height="${r1(k.sy(0.1) - k.sy(10))}" class="fc-eau"/>`;
    for (const [t1, t2, cls] of [[35, 50, "fc-transition"], [46, 80, "fc-transition2"]]) g += `<rect x="${r1(k.sx(t1))}" y="${D.Y0}" width="${r1(k.sx(t2) - k.sx(t1))}" height="${D.Y1 - D.Y0}" class="${cls}"/>`;
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    const pasT = TM > 200 ? 50 : 20;
    const xt = []; for (let v = 0; v <= TM + 1e-9; v += pasT) xt.push(v);
    s += axes(k, { xticks: xt, yticks: [0.1, 1, 10, 100, 1000], xlab: c.xlab || "Température (°C) — augmente avec l'enfouissement",
      ylab: "Silice dissoute (mg/L)", yfmt: (v) => nb(v, v < 1 ? 1 : 0) });
    s += `<polyline points="${echantillon((tc) => [tc, siliceAmorphe(tc)], 0, TM).map(([x, y]) => `${r1(k.sx(x))},${r1(k.sy(y))}`).join(" ")}" class="fc-courbe fc-c-magma"/>`;
    s += `<polyline points="${echantillon((tc) => [tc, siliceQuartz(tc)], 0, TM).map(([x, y]) => `${r1(k.sx(x))},${r1(k.sy(y))}`).join(" ")}" class="fc-courbe fc-c-quartz"/>`;
    s += dlab(k.sx(TM * 0.05), k.sy(siliceAmorphe(TM * 0.05)) - 7, "saturation de l'opale (silice amorphe)", { cls: "fc-lab-courbe" });
    s += dlab(k.sx(TM * 0.05), k.sy(siliceQuartz(TM * 0.05)) + 14, "saturation du quartz", { cls: "fc-lab-courbe" });
    s += dlab(k.sx(TM / 30), k.sy(0.35), "eau de mer (surface → fond)", { cls: "fc-lab-champ" });
    if (TM <= 150) s += dlab(k.sx(42.5), D.Y0 + 12, "opale-A → CT", { a: "middle", cls: "fc-lab-courbe" }) + dlab(k.sx(63), D.Y0 + 26, "opale-CT → quartz", { a: "middle", cls: "fc-lab-courbe" });
    s += chemin(k, c.chemin.map((q) => ({ x: q.T, y: q.C, n: q.n })));
    return svgDiag(s, `Silice dissoute, saturation et température : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.4 · calcite et CO₂ (concrétions) ───────────────────────────────
  // calcium à l'équilibre avec la calcite (mg/L) selon la pression partielle de CO₂ : calcul Plummer et Busenberg (1982), activités de Davies
  const CA_CALCITE = { 10: [[-3.5, 24.9], [-3.4, 26.9], [-3, 37.0], [-2.5, 55.4], [-2, 83.5], [-1.5, 126.7], [-1, 193.3], [-0.5, 297.0], [0, 459.4]],
    25: [[-3.5, 19.4], [-3.4, 21.0], [-3, 28.8], [-2.5, 43.0], [-2, 64.7], [-1.5, 97.8], [-1, 148.8], [-0.5, 227.8], [0, 351.5]] };
  function diagrammeCalcite(c, roche) {
    const k = cadre({ xmin: Math.pow(10, -3.5), xmax: 1, ymin: 0, ymax: 480, xlog: true });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    const pts10 = CA_CALCITE[10].map(([lp, ca]) => [Math.pow(10, lp), ca]);
    let g = `<polygon points="${[...pts10, [1, 480], [Math.pow(10, -3.5), 480]].map(([x, y]) => `${r1(k.sx(x))},${r1(k.sy(y))}`).join(" ")}" class="fc-sursat"/>`;
    g += `<line x1="${r1(k.sx(Math.pow(10, -3.4)))}" y1="${D.Y0}" x2="${r1(k.sx(Math.pow(10, -3.4)))}" y2="${D.Y1}" class="fc-c-frag fc-courbe"/>`;
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    s += axes(k, { xticks: [0.001, 0.01, 0.1, 1], yticks: [0, 100, 200, 300, 400], xlab: "CO₂ au contact de l'eau (pression partielle, atm)",
      ylab: "Calcium dissous (mg/L)", xfmt: (v) => nb(v, v < 0.01 ? 3 : v < 0.1 ? 2 : v < 1 ? 1 : 0) });
    for (const T of [10, 25]) s += `<polyline points="${CA_CALCITE[T].map(([lp, ca]) => `${r1(k.sx(Math.pow(10, lp)))},${r1(k.sy(ca))}`).join(" ")}" class="fc-courbe ${T === 10 ? "fc-c-magma" : "fc-c-min"}"/>`;
    s += dlab(k.sx(0.03), k.sy(118) , "équilibre à 10 °C", { cls: "fc-lab-courbe", rot: -24 }) + dlab(k.sx(0.16), k.sy(108), "à 25 °C", { cls: "fc-lab-courbe", rot: -22 });
    s += dlab(k.sx(0.0006), k.sy(300), "eau sursaturée :", { cls: "fc-lab-champ" }) + dlab(k.sx(0.0006), k.sy(280), "la calcite précipite", { cls: "fc-lab-champ" });
    s += dlab(k.sx(0.12), k.sy(30), "eau sous-saturée : le calcaire se dissout", { a: "middle", cls: "fc-lab-champ" });
    s += dlab(k.sx(Math.pow(10, -3.4)) + 4, D.Y0 + 12, "air", { cls: "fc-lab-courbe" });
    s += chemin(k, c.chemin.map((q) => ({ x: q.pco2, y: q.Ca, n: q.n })));
    return svgDiag(s, `Calcite, CO₂ et calcium dissous : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.4 · carbonates marins et profondeur ───────────────────────────────
  function diagrammeCarbonatesMarins(c, roche) {
    const k = cadre({ xmin: 0, xmax: 100, ymin: 1, ymax: 6000, ylog: true, yBas: true });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    let g = `<rect x="${D.X0}" y="${D.Y0}" width="${D.X1 - D.X0}" height="${r1(k.sy(200) - D.Y0)}" class="fc-photique"/>`;
    g += `<rect x="${D.X0}" y="${r1(k.sy(4500))}" width="${D.X1 - D.X0}" height="${r1(k.sy(5500) - k.sy(4500))}" class="fc-ccd"/>`;
    for (const [z1, z2, nom] of c.depots || []) g += `<rect x="${D.X0}" y="${r1(k.sy(z1))}" width="${D.X1 - D.X0}" height="${r1(k.sy(z2) - k.sy(z1))}" class="fc-bande-depot"/>`;
    const profil = [[92, 1], [92, 1000], [90, 3000], [80, 3800], [55, 4300], [20, 4800], [3, 5300], [0, 6000]];
    g += `<polyline points="${profil.map(([x, y]) => `${r1(k.sx(x))},${r1(k.sy(y))}`).join(" ")}" class="fc-courbe fc-c-magma"/>`;
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    s += axes(k, { xticks: [0, 20, 40, 60, 80, 100], yticks: [1, 10, 100, 1000, 6000], xlab: "Carbonate dans la boue du fond (% de la masse)", ylab: "Profondeur d'eau (m, échelle logarithmique)",
      yfmt: (v) => nb(v) });
    s += dlab(D.X0 + 6, k.sy(2.5), "zone éclairée (0–200 m) : le carbonate est fabriqué", { cls: "fc-lab-champ" });
    s += dlab(D.X0 + 6, k.sy(4950) + 4, "profondeur de compensation (4,5 à 5,5 km)", { cls: "fc-lab-champ" });
    s += dlab(k.sx(60), k.sy(2200), "eau sursaturée en calcite", { a: "middle", cls: "fc-lab-courbe" });
    for (const [z1, z2, nom] of c.depots || []) s += dlab(D.X0 + 6, k.sy(Math.sqrt(z1 * z2)) + 4, nom, { cls: "fc-lab-bande" });
    s += chemin(k, c.chemin.map((q) => ({ x: q.x, y: q.z, n: q.n })));
    return svgDiag(s, `Carbonates marins et profondeur : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.4 · Eh–pH du fer ───────────────────────────────
  function diagrammeEhPh(c, roche) {
    const sys = (typeof POURBAIX !== "undefined" ? POURBAIX : {})[c.systeme || "fer"];
    if (!sys) return "";
    const k = cadre({ xmin: 0, xmax: 14, ymin: -1, ymax: 1.5 });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    let g = "";
    for (const d of sys.domaines) g += `<polygon points="${d.points.map(([ph, eh]) => `${r1(k.sx(ph))},${r1(k.sy(eh))}`).join(" ")}" style="fill:${d.couleur};opacity:.55" stroke="var(--surface)" stroke-width="1"/>`;
    for (const [E0, cls] of [[1.229, "fc-c-eau"], [0, "fc-c-eau"]]) g += `<line x1="${r1(k.sx(0))}" y1="${r1(k.sy(E0))}" x2="${r1(k.sx(14))}" y2="${r1(k.sy(E0 - 0.0592 * 14))}" class="fc-courbe ${cls}" stroke-dasharray="5 3"/>`;
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    s += axes(k, { xticks: [0, 2, 4, 6, 8, 10, 12, 14], yticks: [-1, -0.5, 0, 0.5, 1, 1.5], xlab: "pH", ylab: "Eh (V) — réducteur ↓ oxydant ↑", yfmt: (v) => nb(v, 1) });
    for (const [lab, ph, eh] of c.etiquettes || []) s += dlab(k.sx(ph), k.sy(eh), lab, { a: "middle", cls: "fc-lab-champ" });
    s += chemin(k, c.chemin.map((q) => ({ x: q.pH, y: q.Eh, n: q.n })));
    return svgDiag(s, `Diagramme Eh–pH du fer : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.4 · enfouissement, température et temps ───────────────────────────────
  // T = 10 °C en surface + 30 °C/km
  const T_KM = (z) => 10 + 30 * z;
  const SEUILS_ENF = {
    quartz: { de: 70, a: 80, nom: "le quartz cimente les grès (≈ 70–80 °C)", src: "walderhaug" },
    huile: { de: 100, a: 170, nom: "fenêtre à pétrole (≈ 100–170 °C)", src: "burnham" },
    lignite: { de: 0, a: 50, nom: "tourbe, puis lignite", src: "burnham" },
    subbitumineux: { de: 50, a: 100, nom: "charbon sub-bitumineux", src: "burnham" },
    houille: { de: 100, a: 200, nom: "houille (charbon bitumineux)", src: "burnham" },
    anthracite: { de: 200, a: 280, nom: "anthracite", src: "burnham" },
    anchizone: { de: 200, a: 300, nom: "très faible métamorphisme (≈ 200–300 °C)", src: "anchizone" },
    gypse: { de: 42, a: 58, nom: "gypse → anhydrite (≈ 42–58 °C)", src: "hardie" },
    opale: { de: 35, a: 56, nom: "opale → quartz (≈ 35–56 °C)", src: "odp" },
  };
  function diagrammeEnfouissement(c, roche) {
    const tmax = c.tmax, zmax = c.zmax || 6;
    const k = cadre({ xmin: tmax, xmax: 0, ymin: 0, ymax: zmax, yBas: true });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    let g = "";
    const zDeT = (T) => (T - 10) / 30;
    (c.seuils || []).forEach((nomS, i) => {
      const z = SEUILS_ENF[nomS];
      g += `<rect x="${D.X0}" y="${r1(k.sy(Math.max(0, zDeT(z.de))))}" width="${D.X1 - D.X0}" height="${r1(k.sy(Math.min(zmax, zDeT(z.a))) - k.sy(Math.max(0, zDeT(z.de))))}" class="fc-seuil${i % 2}"/>`;
    });
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    const pasT = tmax > 200 ? 100 : tmax > 60 ? 20 : tmax > 12 ? 5 : 1;
    const xt = []; for (let v = 0; v <= tmax + 1e-9; v += pasT) xt.push(v);
    const yt = []; for (let v = 0; v <= zmax + 1e-9; v += zmax > 6 ? 2 : 1) yt.push(v);
    s += axes(k, { xticks: xt, yticks: yt, xlab: "Temps (millions d'années avant aujourd'hui)", ylab: "Profondeur d'enfouissement (km)",
      y2: { lab: "Température (°C)", ticks: yt.map((z) => [nb(T_KM(z)), z]) } });
    (c.seuils || []).forEach((nomS) => {
      const z = SEUILS_ENF[nomS], zm = (Math.max(0, zDeT(z.de)) + Math.min(zmax, zDeT(z.a))) / 2;
      if (zm < zmax) s += c.labDroite ? dlab(D.X1 - 6, k.sy(zm) + 4, z.nom, { cls: "fc-lab-champ", a: "end" }) : dlab(D.X0 + 6, k.sy(zm) + 4, z.nom, { cls: "fc-lab-champ" });
    });
    s += chemin(k, c.chemin.map((q) => ({ x: q.age, y: q.z, n: q.n })));
    return svgDiag(s, `Histoire d'enfouissement : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.4 · climat des roches d'altération ───────────────────────────────
  // échelle commune de l'atlas (H.5) ; points actuels = normales SAFRAN 1991–2020 (references/normales-safran-1991-2020.json)
  const NORMALES = { Brest: [11.7, 1.67], Rennes: [12.0, 0.96], Paris: [12.7, 0.77], Strasbourg: [11.5, 0.86], Bordeaux: [13.7, 0.98],
    Lyon: [12.8, 0.86], Toulouse: [13.9, 0.64], Marseille: [15.9, 0.42], Montpellier: [15.1, 0.55], Perpignan: [15.7, 0.47],
    "Clermont-Ferrand": [11.4, 0.84], Chamonix: [5.2, 2.24], "Mont Aigoual": [7.7, 1.27], Nice: [15.8, 0.60] };
  function diagrammeClimat(c, roche) {
    const k = cadre({ xmin: -5, xmax: 30, ymin: 0, ymax: 2.5 });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    let g = "";
    for (const [x1, x2, cls] of [[-5, 8, "fc-froid"], [8, 15, "fc-tempere"], [15, 22, "fc-chaud"], [22, 30, "fc-tropical"]])
      g += `<rect x="${r1(k.sx(x1))}" y="${D.Y0}" width="${r1(k.sx(x2) - k.sx(x1))}" height="${D.Y1 - D.Y0}" class="${cls}"/>`;
    for (const v of [0.2, 0.5, 0.65, 1]) g += `<line x1="${D.X0}" y1="${r1(k.sy(v))}" x2="${D.X1}" y2="${r1(k.sy(v))}" class="fc-c-frag fc-courbe"/>`;
    for (const [x1, x2, y1, y2] of c.domaines) g += `<rect x="${r1(k.sx(x1))}" y="${r1(k.sy(y2))}" width="${r1(k.sx(x2) - k.sx(x1))}" height="${r1(k.sy(y1) - k.sy(y2))}" class="fc-domaine"/>`;
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    s += axes(k, { xticks: [-5, 0, 8, 15, 22, 30], yticks: [0, 0.5, 1, 1.5, 2, 2.5], xlab: "Température moyenne annuelle (°C)", ylab: "Pluie ÷ évapotranspiration potentielle", yfmt: (v) => nb(v, 1) });
    for (const [lab, x] of [["froid", 1.5], ["tempéré", 11.5], ["chaud", 18.5], ["tropical", 26]]) s += dlab(k.sx(x), D.Y0 + 12, lab, { a: "middle", cls: "fc-lab-courbe" });
    for (const [lab, v] of [["semi-aride", 0.35], ["sec subhumide", 0.575], ["humide", 0.82]]) s += dlab(D.X1 - 4, k.sy(v) + 4, lab, { a: "end", cls: "fc-lab-courbe" });
    for (const [lab, x, y] of c.etiquettes || []) s += dlab(k.sx(x), k.sy(y), lab, { a: "middle", cls: "fc-lab-bande" });
    for (const v of c.villes || []) { const [T, ai] = NORMALES[v]; s += `<circle cx="${r1(k.sx(T))}" cy="${r1(k.sy(ai))}" r="3" class="fc-ville"/>` + dlab(k.sx(T) + 5, k.sy(ai) + 4, v, { cls: "fc-lab-courbe" }); }
    s += chemin(k, c.chemin.map((q) => ({ x: q.T, y: q.ai, n: q.n })));
    return svgDiag(s, `Climat de formation : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.4 · taille des grains, agent et temps de chute ───────────────────────────────
  // vitesse de chute dans l'eau à 20 °C : Ferguson et Church (2004), grains naturels (C1 = 18, C2 = 1)
  const chute = (dmm) => { const d = dmm / 1000, R = 1.65, g = 9.81, nu = 1.0e-6; return R * g * d * d / (18 * nu + Math.sqrt(0.75 * R * g * d * d * d)); };
  const AGENTS = [
    { nom: "vent", de: 0.002, a: 1 }, { nom: "rivière", de: 0.001, a: 300 }, { nom: "marée, estuaire", de: 0.001, a: 0.5 },
    { nom: "ruissellement", de: 0.001, a: 20 }, { nom: "gravité (éboulis)", de: 2, a: 2000 }, { nom: "glacier", de: 0.001, a: 5000 },
  ];
  function diagrammeGrains(c, roche) {
    const k = cadre({ xmin: 0.0005, xmax: 5000, ymin: 0, ymax: 7, xlog: true, yBas: true });
    const cl = clip();
    let s = `<defs>${cl.def}</defs>`;
    let g = "";
    for (const [d1, d2, nom] of [[0.0005, 0.002, "argile"], [0.002, 0.063, "limon"], [0.063, 2, "sable"], [2, 64, "gravier"], [64, 5000, "galets, blocs"]])
      g += `<rect x="${r1(k.sx(d1))}" y="${D.Y0}" width="${r1(k.sx(d2) - k.sx(d1))}" height="${D.Y1 - D.Y0}" class="${nom === "sable" || nom === "argile" || nom === "galets, blocs" ? "fc-classe1" : "fc-classe2"}"/>`;
    for (const [d1, d2] of c.grains) g += `<rect x="${r1(k.sx(d1))}" y="${D.Y0}" width="${r1(k.sx(d2) - k.sx(d1))}" height="${D.Y1 - D.Y0}" class="fc-domaine"/>`;
    AGENTS.forEach((a, i) => {
      const y = k.sy(i * 0.92 + 0.55), actif = (c.agents || []).includes(a.nom);
      g += `<rect x="${r1(k.sx(a.de))}" y="${r1(y - 6)}" width="${r1(k.sx(a.a) - k.sx(a.de))}" height="12" rx="6" class="${actif ? "fc-agent-actif" : "fc-agent"}"/>`;
    });
    s += `<g clip-path="url(#${cl.k})">${g}</g>`;
    s += axes(k, { xticks: [0.001, 0.01, 0.1, 1, 10, 100, 1000], yticks: [], xlab: "Taille des grains (mm, échelle logarithmique)", ylab: "",
      xfmt: (v) => nb(v, v < 0.01 ? 3 : v < 0.1 ? 2 : v < 1 ? 1 : 0),
      x2: { ticks: [["argile", 0.001], ["limon", 0.011], ["sable", 0.35], ["gravier", 12], ["blocs", 600]] } });
    AGENTS.forEach((a, i) => { s += dlab(k.sx(a.de) + 4, k.sy(i * 0.92 + 0.55) + 3.5, a.nom, { cls: (c.agents || []).includes(a.nom) ? "fc-lab-agent-actif" : "fc-lab-agent" }); });
    // temps de chute dans 1 m d'eau calme
    const tp = [0.001, 0.002, 0.004, 0.01, 0.02, 0.063, 0.2, 2, 64].map((d) => [d, 1 / chute(d)]);
    const lab = (t) => t > 86400 ? `${nb(t / 86400, 1)} j` : t > 3600 ? `${nb(t / 3600, 1)} h` : t > 60 ? `${nb(t / 60)} min` : `${nb(t, t < 10 ? 1 : 0)} s`;
    s += `<line x1="${D.X0}" y1="${r1(k.sy(5.95))}" x2="${D.X1}" y2="${r1(k.sy(5.95))}" class="fc-grille-fort"/>`;
    s += dlab(D.X0 + 4, k.sy(6.3), "temps de chute dans 1 m d'eau calme :", { cls: "fc-lab-champ" });
    for (const [d, tt] of [tp[1], tp[3], tp[5], tp[7]]) s += dlab(k.sx(d), k.sy(6.78), lab(tt), { a: "middle", cls: "fc-lab-courbe" });
    return svgDiag(s, `Taille des grains et agents de transport : ${roche.nom}`) + (c.legende ? `<ol class="fc-etapes">${c.legende.map((x, i) => `<li><b>${i + 1}</b><span>${x}</span></li>`).join("")}</ol>` : "");
  }

  // ─────────────────────────────── C.4 · métamorphisme de choc ───────────────────────────────
  const STADES_CHOC = [
    { de: 0.1, a: 10, nom: "fractures", c: "rgba(150,150,150,.18)" },
    { de: 10, a: 35, nom: "quartz choqué", c: "rgba(215,170,50,.25)" },
    { de: 35, a: 60, nom: "verre diaplectique", c: "rgba(215,120,60,.25)" },
    { de: 60, a: 100, nom: "fusion totale", c: "rgba(200,60,50,.25)" },
    { de: 100, a: 1000, nom: "vaporisation", c: "rgba(120,60,140,.22)" },
  ];
  function diagrammeChoc(c, roche) {
    const k = cadre({ xmin: 0.1, xmax: 1000, ymin: 0, ymax: 1, xlog: true });
    let s = "";
    for (const z of STADES_CHOC) s += `<rect x="${r1(k.sx(z.de))}" y="${D.Y0}" width="${r1(k.sx(z.a) - k.sx(z.de))}" height="${D.Y1 - D.Y0}" style="fill:${z.c}"/>`;
    s += `<rect x="${r1(k.sx(0.1))}" y="${r1(k.sy(0.2))}" width="${r1(k.sx(3) - k.sx(0.1))}" height="16" rx="4" class="fc-agent"/>`;
    s += axes(k, { xticks: [0.1, 1, 10, 100, 1000], yticks: [], xlab: "Pression (GPa, échelle logarithmique)", ylab: "", xfmt: (v) => nb(v, v < 1 ? 1 : 0) });
    STADES_CHOC.forEach((z, i) => { const x = k.sx(Math.sqrt(z.de * z.a)); s += dlab(x, D.Y0 + 16 + (i % 3) * 15, z.nom, { a: "middle", cls: "fc-lab-champ" }); });
    s += dlab(k.sx(0.12), k.sy(0.2) + 11, "métamorphisme ordinaire (< 3 GPa, millions d'années)", { cls: "fc-lab-agent" });
    s += `<line x1="${r1(k.sx(364))}" y1="${D.Y0}" x2="${r1(k.sx(364))}" y2="${D.Y1}" class="fc-c-frag fc-courbe"/>` + dlab(k.sx(364) - 4, D.Y1 - 8, "centre de la Terre", { a: "end", cls: "fc-lab-courbe" });
    s += chemin(k, c.chemin.map((q) => ({ x: q.P, y: q.y, n: q.n })));
    return svgDiag(s, `Métamorphisme de choc : ${roche.nom}`) + legendeChemin(c.chemin);
  }

  // ─────────────────────────────── C.2 · processus (magmatiques) ───────────────────────────────
  // chaque processus = liste d'étapes [titre par défaut, scène, réglages propres à l'étape]
  const PROCESSUS = {
    // ── magmatiques ──
    pluton: [["Fusion partielle en profondeur", sceneFusion], ["Montée du magma", sceneMontee],
      ["Cristallisation lente, à plusieurs kilomètres de profondeur", scenePluton], ["Mise à l'affleurement par l'érosion", sceneErosion]],
    volcan: [["Fusion partielle en profondeur", sceneFusion], ["Montée du magma et stockage dans un réservoir", sceneMontee],
      ["Éruption", sceneEruption], ["Refroidissement rapide en surface", sceneRefroidissement]],
    pyroclastique: [["Fusion partielle en profondeur", sceneFusion], ["Montée d'un magma chargé de gaz", sceneMontee],
      ["Éruption explosive", sceneExplosion], ["Dépôt et consolidation", sceneDepotPyro]],
    ophiolite: [["Fusion du manteau sous une dorsale océanique", sceneFusion, { src: "dorsale" }], ["Chambre magmatique sous la dorsale", sceneMontee, { src: "dorsale" }],
      ["Cristallisation dans la croûte océanique", sceneCrouteOceanique], ["Charriage sur le continent lors de la collision", sceneObduction]],
    cumulat: [["Fusion partielle en profondeur", sceneFusion], ["Montée du magma dans une chambre", sceneMontee],
      ["Accumulation des cristaux au fond de la chambre", sceneCumulat], ["Mise à l'affleurement", sceneErosion]],
    manteau: [["Roche du manteau, sous la croûte", sceneManteau], ["Étirement et amincissement de la croûte", sceneRift],
      ["Le manteau remonte au fond d'un bassin", sceneManteauFond], ["Collision, soulèvement et érosion", sceneRemontee]],
    filon: [["Fusion partielle en profondeur", sceneFusion], ["Montée du magma, premiers cristaux", sceneMontee],
      ["Mise en place en filon ou en sill", sceneFilon], ["Refroidissement en deux temps : gros cristaux, puis pâte fine", sceneTexture]],
    filonGranitique: [["Granite en fin de cristallisation", scenePluton], ["Derniers liquides, riches en eau et en silice", sceneLiquideResiduel],
      ["Injection en filons dans le granite et son encaissant", sceneFilon], ["Cristallisation du filon", sceneTexture]],
    carbonatite: [["Fusion faible d'un manteau riche en CO₂", sceneFusion, { co2: true }], ["Montée du magma", sceneMontee],
      ["Cristallisation ou éruption des carbonates", sceneCarbonatite], ["Mise à l'affleurement par l'érosion", sceneErosion]],
    kimberlite: [["Fusion très profonde, dans le domaine du diamant", sceneFusion, { src: "profond" }], ["Montée éclair, chargée de fragments du manteau", sceneMontee, { src: "profond" }],
      ["Éruption explosive", sceneExplosion], ["Cheminée remplie de brèche (diatrème)", sceneDiatreme]],
    komatiite: [["Fusion dans un panache très chaud (Archéen)", sceneFusion, { src: "panache" }], ["Montée rapide", sceneMontee, { src: "panache", vitesse: "rapide" }],
      ["Épanchement d'une lave très fluide", sceneEruption, { eruption: "fissure" }], ["Trempe : olivine en gerbes (spinifex)", sceneTexture, { texture: "spinifex", textureTxt: "aiguilles d'olivine trempées" }]],

    // ── sédimentaires ──
    detritique: [["Altération et érosion d'un relief", sceneAlterationRelief], ["Transport des grains", sceneTransport],
      ["Dépôt en couches", sceneDepotCouches], ["Diagenèse : compaction et cimentation", sceneDiagenese]],
    meuble: [["Altération et érosion des roches", sceneAlterationRelief], ["Transport et tri des grains", sceneTransport],
      ["Dépôt", sceneDepotCouches], ["Pas de cimentation : les grains restent meubles", sceneDiagenese, { ciment: "aucun", profDia: "moins de ≈ 0,5 km", tDia: "" }]],
    argileux: [["Altération chimique : les minéraux deviennent argiles", sceneAlterationRelief, { alterTxt: "hydrolyse : feldspaths et micas → argiles" }],
      ["Transport en suspension", sceneTransport], ["Décantation en eau calme", sceneDepotCouches, { depot: "calme" }],
      ["Compaction : l'eau est chassée", sceneDiagenese, { ciment: "argile", grainLoupe: 6, cimentTxt: "argile tassée" }]],
    glaciaire: [["Le glacier arrache et broie la roche", sceneGlacier], ["Transport dans la glace, sans tri", sceneTransport, { agent: "glacier" }],
      ["Fonte : dépôt de blocs dans une farine de roche", sceneGlacier, { fonte: true }], ["Enfouissement et cimentation", sceneDiagenese, { anguleux: true, ciment: "argile" }]],
    breche: [["Le gel fracture la falaise", sceneVersant, { versant: "gel" }], ["Chute des fragments : ils ne voyagent pas", sceneVersant, { versant: "eboulis", gel: true }],
      ["Cimentation des débris anguleux", sceneDiagenese, { anguleux: true, ciment: "calcite", profDia: "près de la surface", tDia: "" }]],
    plateforme: [["Production du carbonate en mer chaude et peu profonde", sceneMerCarbonatee], ["Accumulation sur le fond", sceneAccumulation],
      ["Enfouissement et cimentation", sceneEnfouissement, { loupe: "spath" }]],
    falun: [["Coquilles et organismes d'une mer peu profonde", sceneMerCarbonatee], ["Brisés et triés par les vagues et les courants", sceneTransport, { agent: "mer" }],
      ["Accumulation de sables coquilliers restés meubles", sceneAccumulation]],
    craie: [["Coccolithes produits dans les eaux de surface", scenePluieFond, { organisme: "coccolithe", pluieTxt: "les coccolithes tombent vers le fond" }],
      ["Accumulation d'une boue blanche, rognons de silex", sceneAccumulation, { nodules: true }],
      ["Peu enfouie, la craie reste tendre et poreuse", sceneEnfouissement, { loupeTxt: "à peine cimentée" }]],
    marne: [["Plancton calcaire et argiles apportées par les rivières", scenePluieFond, { particule: "#c9bfa6" }],
      ["Dépôt en eau calme, en couches alternées", sceneAccumulation], ["Enfouissement et compaction", sceneEnfouissement]],
    dolomie: [["Boue calcaire d'une lagune ou d'un littoral", sceneMerCarbonatee, { producteurs: "oolithes" }],
      ["Évaporation : saumure riche en magnésium", sceneEvaporation, { facteurTxt: "le gypse précipite, Mg/Ca augmente" }],
      ["Le magnésium remplace une partie du calcium", sceneEnfouissement, { loupe: "spath", loupeTxt: "cristaux de dolomite", fondLoupe: "#e8dcc0" }]],
    cargneule: [["Dolomies et gypse du Trias", sceneSerieEvaporitique, { couche: "gypse", series: [["dolomie", "#dcc9a4"], ["gypse", "#efe8da"], ["dolomie", "#d6c29a"], ["gypse", "#ece5d6"]] }],
      ["Les nappes glissent sur ces couches : bréchification", sceneBroyage, { broyage: "cataclasite", broyageTxt: "la roche est broyée en brèche" }],
      ["L'eau dissout le gypse", sceneFluides, { fluidesTxt: "l'eau souterraine emporte le gypse" }],
      ["Il reste un squelette de dolomie caverneux", sceneVacuoles]],
    evaporite: [["Un bassin presque fermé, alimenté par la mer", sceneLagune], ["Évaporation intense", sceneEvaporation],
      ["Saturation : les cristaux se forment", scenePrecipitation], ["Empilement des sels dans l'ordre de leur solubilité", sceneSerieEvaporitique]],
    radiolarite: [["Radiolaires dans les eaux de surface de l'océan", sceneLoupeOrganismes, { organisme: "radiolaire" }],
      ["Sous la profondeur de compensation, seule la silice reste", sceneFondSousCCD], ["Accumulation lente d'une boue siliceuse", sceneAccumulation, { profond: true }],
      ["Enfouissement : l'opale devient quartz", sceneTransformationSilice]],
    diatomite: [["Diatomées dans un lac", sceneLoupeOrganismes, { organisme: "diatomee", lac: true }],
      ["Les frustules tombent au fond", scenePluieFond, { fond: "#f3f1ea" }], ["Accumulation, sans enfouissement profond", sceneAccumulation]],
    gaize: [["Éponges siliceuses, argile et glauconie sur le fond", sceneLoupeOrganismes, { organisme: "spicule" }],
      ["Accumulation", sceneAccumulation], ["L'opale se dissout et recristallise en ciment léger", sceneTransformationSilice, { silice: [["opale-A", "#f3f0e4"], ["opale-CT", "#d9d4c2"]] }]],
    silex: [["Éponges et radiolaires : de la silice dans la boue crayeuse", sceneLoupeOrganismes, { organisme: "spicule" }],
      ["La silice dissoute se regroupe en rognons", sceneNodules, { couleurNodule: "#3f3a36" }], ["Recristallisation lente en calcédoine et quartz", sceneTransformationSilice, { silice: [["opale-A", "#f3f0e4"], ["opale-CT", "#d9d4c2"], ["calcédoine", "#5c554f"]] }]],
    phosphorite: [["L'eau creuse un karst dans les calcaires", sceneKarst], ["Remplissage : argiles, ossements, guano", sceneKarst, { remplissage: true, karstTxt: "argiles et os remplissent les poches" }],
      ["Le phosphate précipite en nodules et en croûtes", sceneNodules, { noduleTxt: "le phosphate se concentre en apatite" }]],
    fer: [["Océan sans oxygène : le fer reste dissous", sceneOceanAnoxique], ["L'oxygène oxyde le fer, qui précipite", sceneOxydationFer],
      ["Lits de fer et de silice alternés", sceneBandes]],
    travertin: [["L'eau chargée de CO₂ dissout le calcaire", sceneKarst], ["Résurgence : le CO₂ s'échappe", sceneSource], ["La calcite encroûte mousses et débris", sceneEncroutement]],
    tourbe: [["Tourbière : végétaux dans un milieu gorgé d'eau", sceneMarais], ["Eau acide et sans oxygène : la décomposition s'arrête", sceneAnoxie, { lac: true }],
      ["Accumulation de la tourbe", sceneAccumulation, { couleursCouches: ["#6b5536", "#5a4632", "#6b5536", "#4d3b27", "#5a4632"], accTxt: "les végétaux morts s'empilent" }]],
    charbon: [["Forêt marécageuse", sceneMarais, { foret: "foret" }], ["Tourbe enfouie sous les sédiments", sceneAnoxie, { accTxt: "la tourbe est recouverte" }],
      ["Enfouissement : la chaleur transforme la tourbe", sceneHouillification]],
    rocheMere: [["Algues et plancton dans une eau stratifiée", scenePluieFond, { particule: "#8fb35a", pluieTxt: "la matière organique tombe" }],
      ["Fond sans oxygène : la matière organique est conservée", sceneAnoxie], ["Enfouissement modéré : le kérogène reste intact", sceneFenetrePetrole]],
    lateritique: [["Climat tropical humide", sceneClimatTropical], ["Altération profonde : l'eau emporte cations et silice", sceneProfil, { lessivage: true }],
      ["Il reste les oxydes de fer et d'aluminium", sceneProfil]],
    meuliere: [["Calcaire déposé dans un lac", sceneProtolithe, { protolithe: "calcaire", protoTxt: "calcaire de lac" }],
      ["Le lac s'assèche : les argiles libèrent de la silice", sceneFluides, { fluidesTxt: "l'eau se charge en silice" }],
      ["La silice remplace le calcaire", sceneTransformationSilice, { silice: [["calcaire", "#e9e2cb"], ["opale", "#d9d4c2"], ["calcédoine", "#bda886"]], siliceTxt: "remplacement progressif" }],
      ["Le calcaire restant se dissout : cavités", sceneVacuoles, { vacTxt: "la meulière devient caverneuse" }]],
    calcrete: [["Saison sèche : l'eau du sol remonte et s'évapore", sceneProfil, { remontee: true }],
      ["La calcite précipite en nodules", sceneNodules, { noduleTxt: "nodules de calcite (« poupées »)" }], ["Les nodules se soudent en dalle", sceneProfil]],
    alluvions: [["Érosion des versants", sceneAlterationRelief], ["Transport et tri par la rivière", sceneTransport, { agent: "riviere" }],
      ["Dépôt selon la force du courant", sceneDepotCouches, { depot: "cone" }], ["Terrasses étagées au fil des cycles glaciaires", sceneTerrasses]],
    colluvions: [["Un sol se forme sur le versant", sceneAlterationRelief, { relief: "plateau", alterTxt: "sol sur un versant défriché" }],
      ["Ruissellement, labours et gravité l'entraînent", sceneVersant], ["Accumulation au pied du versant", sceneBasVersant]],
    eboulis: [["Le gel fracture la falaise", sceneVersant, { versant: "gel" }], ["Les fragments tombent et s'étalent en talus", sceneVersant, { versant: "eboulis", gel: true }],
      ["Grèzes : lits déposés au rythme du gel", sceneGrezes]],
    moraine: [["Le glacier arrache et broie la roche", sceneGlacier], ["Transport dans la glace, sans tri", sceneTransport, { agent: "glacier" }],
      ["Fonte : dépôt non trié", sceneGlacier, { fonte: true }]],
    dunes: [["Sables de plage ou d'alluvions", sceneTransport, { agent: "mer" }], ["Le vent trie et déplace le sable", sceneTransport, { agent: "vent" }], ["La dune se forme et avance", sceneDune]],
    loess: [["Plaines dénudées au bord des glaciers", sceneGlacier, { fonte: true }], ["Le vent soulève les poussières", sceneTransport, { agent: "vent", grainVent: 0.7, ventTxt: "les poussières voyagent en suspension" }],
      ["Dépôt en placages dans la steppe", sceneDune, { loess: true }]],
    vase: [["Le fleuve et la mer apportent des particules fines", sceneTransport, { agent: "riviere" }], ["À l'étale de la marée, elles se déposent", sceneEstuaire],
      ["Accumulation : slikke et schorre", sceneDepotCouches, { depot: "calme", depotTxt: "vase et tangue à chaque marée" }]],
    alterite: [["Roche saine et fissurée", sceneProtolithe, { protolithe: "granite", protoTxt: "granite fissuré" }],
      ["L'eau s'infiltre : hydrolyse des feldspaths et des micas", sceneFluides, { fluidesTxt: "l'eau de pluie s'infiltre" }], ["Arène et boules de roche saine", sceneArene]],
    terraRossa: [["Calcaire avec 2 à 5 % d'impuretés insolubles", sceneProtolithe, { protolithe: "calcaire", protoTxt: "calcaire" }],
      ["L'eau chargée de CO₂ dissout le calcaire", sceneResidu], ["Étés secs : l'argile résiduelle rougit", sceneProfil, { horizons: [["terra rossa", "#a8452d"], ["fissuré", "#ddd4bc"], ["calcaire", "#e9e2cb"]], actif: "terra rossa" }]],
    argileSilex: [["Craie à rognons de silex", sceneNodules, { noduleTxt: "craie à silex", couleurNodule: "#3f3a36" }], ["La craie se dissout", sceneResidu, { silex: true, fond: "#f4f1e8", residuTxt: "silex et argile restent sur place" }],
      ["Manteau d'argile à silex sur les plateaux", sceneProfil, { horizons: [["limons", "#b89a6a"], ["argile à silex", "#8a4a2e"], ["craie", "#f4f1e8"]], actif: "argile à silex" }]],

    // ── métamorphiques ──
    regional: [["Roche d'origine (protolithe)", sceneProtolithe], ["Enfouissement lors d'une collision", sceneEnfouissementTecto],
      ["Recristallisation sous pression et température", sceneRecristallisation], ["Remontée à la surface", sceneRemontee]],
    subduction: [["Roche d'origine (protolithe)", sceneProtolithe], ["Enfouissement rapide dans une subduction", sceneEnfouissementTecto, { tecto: "subduction" }],
      ["Recristallisation à haute pression et basse température", sceneRecristallisation], ["Remontée à la surface", sceneRemontee]],
    contact: [["Roche d'origine (protolithe)", sceneProtolithe], ["Intrusion d'un magma voisin", sceneIntrusion],
      ["Auréole de contact : recristallisation par la chaleur", sceneIntrusion, { aureole: true }], ["Nouvelle roche, dure et non foliée", sceneRecristallisation, { texture: "mosaique" }]],
    skarn: [["Calcaire ou dolomie", sceneProtolithe, { protolithe: "calcaire" }], ["Intrusion d'un granite", sceneIntrusion, { fluides: true, intrusionTxt: "le granite libère des fluides chauds" }],
      ["Échanges chimiques entre fluides et calcaire", sceneFluides], ["Silicates calciques et minerais", sceneRecristallisation, { texture: "mosaique" }]],
    mylonite: [["Roche d'origine", sceneProtolithe, { protolithe: "granite" }], ["Cisaillement en profondeur", sceneFaille, { profonde: true, failleTxt: "zone de cisaillement ductile" }],
      ["Les grains sont étirés et recristallisent", sceneBroyage, { broyage: "mylonite", broyageTxt: "rubans autour d'« yeux » de feldspath" }], ["Remontée à la surface", sceneRemontee]],
    cataclasite: [["Roche d'origine", sceneProtolithe, { protolithe: "granite" }], ["Faille près de la surface", sceneFaille, { failleTxt: "régime cassant, moins de ≈ 10 km" }],
      ["Broyage en fragments anguleux", sceneBroyage, { broyage: "cataclasite", broyageTxt: "fragments dans une matrice broyée" }]],
    pseudotachylite: [["Roche sèche en profondeur", sceneProtolithe, { protolithe: "granite" }], ["Séisme : glissement brutal sur la faille", sceneFaille, { seisme: true, failleTxt: "glissement d'environ 1 m/s" }],
      ["Frottement : la roche fond puis se fige en verre", sceneBroyage, { broyage: "pseudotachylite", broyageTxt: "veines de verre noir injectées" }]],
    impact: [["Un astéroïde arrive sur le socle", sceneImpact, { phase: "approche" }], ["Onde de choc", sceneImpact, { phase: "choc" }],
      ["Brèches et verre d'impact remplissent le cratère", sceneImpact, { phase: "cratere" }], ["L'érosion efface le cratère, les brèches restent", sceneRemontee, { remonteeTxt: "Rochechouart : cratère disparu" }]],
    serpentinisation: [["Péridotite du manteau sous une dorsale lente", sceneProtolithe, { protolithe: "peridotite" }],
      ["L'eau de mer descend par les failles", sceneFluides, { fluidesFond: "mer", fondFluides: "#6f7f4a", fluidesTxt: "l'eau de mer s'infiltre" }],
      ["Olivine + eau → serpentine + magnétite", sceneRecristallisation, { texture: "maille", recristTxt: "la serpentine envahit l'olivine en maille" }],
      ["Charriage dans les Alpes", sceneObduction, { obdTxt: "ophiolites charriées sur le continent" }]],
    greisen: [["Coupole d'un granite en fin de cristallisation", sceneIntrusion, { intrusionTxt: "sommet d'un massif granitique" }],
      ["Fluides riches en fluor et en bore", sceneFluides, { echanges: "F, B, Li, Sn, W" }],
      ["Feldspaths remplacés par quartz, mica blanc, topaze", sceneRecristallisation, { texture: "mosaique", recristTxt: "quartz, mica blanc, topaze" }], ["Filons à étain et tungstène", sceneFilon, { profFilon: "≈ 1–3 km" }]],
    fenite: [["Complexe de carbonatite ou de syénite", sceneIntrusion, { magmaCouleur: "#e9e6df", intrusionTxt: "intrusion alcaline", nomIntrusion: "carbonatite" }],
      ["Fluides riches en sodium et potassium", sceneFluides, { echanges: "Na⁺, K⁺ entrent ; la silice sort" }],
      ["L'encaissant est transformé en auréole", sceneIntrusion, { aureole: true, magmaCouleur: "#e9e6df", intrusionTxt: "auréole de fénite", nomIntrusion: "carbonatite" }],
      ["Feldspath alcalin et aegyrine", sceneRecristallisation, { texture: "mosaique", recristTxt: "feldspath alcalin et aegyrine" }]],
    rodingite: [["Filon de gabbro dans la péridotite", sceneFilon, { encaissant: ["#6f7f4a", "#5f7a3a", "#6f7f4a", "#7f9a4a", "#6f7f4a", "#5f7a3a"], profFilon: "fond océanique" }],
      ["La serpentinisation libère du calcium", sceneFluides, { fondFluides: "#6f7f4a", echanges: "Ca²⁺" }],
      ["Le gabbro devient grenat et diopside", sceneRecristallisation, { texture: "mosaique", recristTxt: "grenat et diopside" }], ["Charriage dans les Alpes", sceneObduction]],
    spilite: [["Éruption sous-marine : laves en coussins", sceneProtolithe, { protolithe: "basalte", protoTxt: "basalte en coussins" }],
      ["L'eau de mer chauffée circule dans la lave", sceneFluides, { fluidesFond: "mer", echanges: "Na⁺ entre, Ca²⁺ sort" }],
      ["Albite, chlorite et épidote remplacent les minéraux", sceneRecristallisation, { texture: "mosaique", recristTxt: "le basalte verdit" }], ["Remontée à la surface", sceneRemontee]],
  };


  // ─────────────────────────────── sources (affichées en bas de page) ───────────────────────────────
  const SOURCES = {
    hirschmann: "Solidus du manteau sec : Hirschmann M. M. (2000), <i>Geochemistry, Geophysics, Geosystems</i> 1, 2000GC000070 (T = 1 120,7 + 132,9 P − 5,1 P²).",
    tuttle: "Solidus du granite en présence d'eau : Tuttle O. F. et Bowen N. L. (1958), <i>GSA Memoir</i> 74 ; Luth W. C., Jahns R. H. et Tuttle O. F. (1964), <i>J. Geophys. Res.</i> 69, 759 (625 °C à 1 GPa).",
    holland: "Albite = jadéite + quartz : Holland T. J. B. (1980), <i>American Mineralogist</i> 65, 129 (pente 26,5 bar/°C).",
    bose: "Quartz = coésite : Bose K. et Ganguly J. (1995), <i>American Mineralogist</i> 80, 231 (P = 21,945 + 0,006901 T(K) kbar).",
    kennedy: "Graphite = diamant : Kennedy C. S. et Kennedy G. C. (1976), <i>J. Geophys. Res.</i> 81, 2467.",
    pattison: "Andalousite, disthène, sillimanite : Pattison D. R. M. (1992), <i>Journal of Geology</i> 100 (point triple 0,45 GPa et 550 °C).",
    martel2013: "Réservoir des trachytes de la chaîne des Puys : Martel C. et al. (2013), <i>Journal of Petrology</i> 54, 1071 (300–350 MPa, soit 10–12 km ; 700–825 °C ; jusqu'à 8 % d'eau).",
    miallier2010: "Dernière éruption du puy de Dôme : Miallier D. et al. (2010), <i>Comptes Rendus Géoscience</i> 342, 847 (≈ 10 700 ans).",
    pichavant2002: "Réservoir de la montagne Pelée : Pichavant M. et al. (2002), <i>J. Geophys. Res.</i> 107 (200 ± 50 MPa, 875–900 °C, 5,3–6,3 % d'eau).",
    nehlig2001: "Stratovolcan du Cantal : Nehlig P. et al. (2001), <i>Bulletin de la Société géologique de France</i> 172, 295 (volcans de 25 km et plus de 3 000 m, 8,5–6,5 Ma, avalanches de débris).",
    grove2006: "Fusion du manteau hydraté : Grove T. L. et al. (2006), <i>Earth and Planetary Science Letters</i> 249, 74 (solidus saturé en eau : 860 °C à 2 GPa, 800 °C à 3,2 GPa).",
    faure2001: "Micaschistes des Cévennes : Faure M., Charonnat X., Chauvet A. et al. (2001), <i>Bulletin de la Société géologique de France</i> 172 (6), 687–696 (empilement des nappes et métamorphisme vers 340 Ma, extension et granites vers 315 Ma).",
    white1992: "Épaisseur de la croûte océanique (≈ 7 km) : White R. S., McKenzie D. et O'Nions R. K. (1992), <i>J. Geophys. Res.</i> 97, 19 683. Plaque (lithosphère) ≈ 100 km ; animation dessinée à l'échelle vraie (1,6 px par km dans les deux directions).",
    scholz: "Transition cassant–ductile : Scholz C. H. (1988), <i>Geologische Rundschau</i> 77 (quartz vers 300 °C, feldspaths vers 450 °C).",
    facies: "Faciès métamorphiques : limites progressives, placées d'après les synthèses usuelles (Spear 1993 ; Bucher et Grapes 2011) ; positions indicatives.",
    profondeur: "Profondeur : pression lithostatique d'une croûte de masse volumique 2,8 sur 35 km et d'un manteau à 3,3.",
    diffusion: "Durées de refroidissement : ordre de grandeur t ≈ L²/κ (diffusivité thermique des roches κ ≈ 10⁻⁶ m²/s) ; 2 à 5 km donnent 100 000 ans à 1 million d'années, une coulée de 5 m environ un an.",
    lagabrielle: "Lherz : manteau exhumé au fond de bassins crétacés et remanié en brèches (Lagabrielle Y. et Bodinier J.-L. 2008, <i>Terra Nova</i> 20) ; mise en place vers 108–103 Ma (âges ⁴⁰Ar/³⁹Ar d'amphiboles).",
    arndt: "Komatiites : Arndt N. T., Lesher C. M. et Barnes S. J. (2008), <i>Komatiite</i>, Cambridge University Press.",
    sparks: "Remontée des kimberlites en quelques heures à jours : Sparks R. S. J. et al. (2006), <i>Journal of Volcanology and Geothermal Research</i> 155.",
    london: "Pegmatites : cristallisation d'un liquide riche en eau et en éléments fondants, sous le solidus habituel du granite (London D. 2008, <i>Pegmatites</i>, Canadian Mineralogist Special Publication 10).",
    dasgupta: "Le CO₂ abaisse fortement la température de fusion du manteau : Dasgupta R. et Hirschmann M. M. (2006), <i>Nature</i> 440, 659.",
    adams: "Dolomitisation par reflux de saumures : Adams J. E. et Rhodes M. L. (1960), <i>AAPG Bulletin</i> 44.",
    quercy: "Phosphorites du Quercy : karst creusé dès le Lutétien, remplissages de 42 à 27 Ma, phosphate issu du lessivage de guano (Musées d'Occitanie, « Phosphorites du Quercy » ; Billaud Y. 1982, thèse, Lyon).",
    charman: "Tourbières : Charman D. (2002), <i>Peatlands and Environmental Change</i>, Wiley.",
    bardossy: "Bauxites latéritiques : Bárdossy G. et Aleva G. J. J. (1990), <i>Lateritic Bauxites</i>, Elsevier.",
    royer: "Carbonates pédogénétiques sous moins de 760 mm de pluie par an : Royer D. L. (1999), <i>Geology</i> 27.",
    meuliere: "Meulière : silicification de calcaires lacustres lors de l'assèchement des lacs, la silice venant de l'altération des argiles (Wikipédia, « Meulière (géologie) »).",
    thiry: "Grès de Fontainebleau cimentés près de la surface : Thiry M. et Maréchal B. (2001), <i>Journal of Sedimentary Research</i> 71.",
    ducoux: "Métamorphisme pyrénéen de haute température et basse pression (Crétacé) : Ducoux M. et al. (2021), <i>BSGF – Earth Sciences Bulletin</i> 192.",
    agard: "Schistes lustrés : Agard P. et al. (2001), <i>Bulletin de la Société géologique de France</i> 172, 617 (faciès schistes bleus, degré croissant vers l'est).",
    bosse: "Île de Groix : 1,6–1,8 GPa et 450–500 °C (Bosse V. et al. 2002, <i>Journal of Metamorphic Geology</i> 20).",
    lotout: "Éclogites varisques du Massif central : Lotout C. et al. (2020), <i>BSGF – Earth Sciences Bulletin</i> 191 (Haut-Allier, ≈ 2 GPa et 650–850 °C).",
    barbey: "Dôme du Velay : 750–850 °C à 0,4–0,5 GPa (Barbey P. et al. 1999, <i>Journal of Petrology</i> 40, 1425).",
    sibson: "Pseudotachylites, fusion par friction lors des séismes : Sibson R. H. (1975), <i>Geophysical Journal of the Royal Astronomical Society</i> 43.",
    evans: "Serpentines : lizardite et chrysotile à basse température, antigorite au-delà de ≈ 300 °C (Evans B. W. 2004, <i>International Geology Review</i> 46).",
    pirajno: "Greisens et fluides tardi-magmatiques : Pirajno F. (2009), <i>Hydrothermal Processes and Mineral Systems</i>, Springer.",
    elliott: "Fénites : Elliott H. A. L. et al. (2018), « Fenites associated with carbonatite complexes: a review », <i>Ore Geology Reviews</i> 93.",
    bach: "Rodingites du plancher océanique : Bach W. et Klein F. (2009), <i>Lithos</i> 112.",
    alt: "Altération hydrothermale de la croûte océanique : Alt J. C. (1995), <i>AGU Geophysical Monograph</i> 91.",
    mccaffrey: "Seuils d'évaporation : gypse à 3,8 fois et halite à 10,6 fois la concentration de l'eau de mer (McCaffrey M. A., Lazar B. et Holland H. D. 1987, <i>Journal of Sedimentary Petrology</i> 57, 928).",
    warren: "Sels de potassium et de magnésium au-delà de ≈ 65 fois (epsomite–kaïnite 65–100, carnallite–kiesérite 100–170) : Warren J. K. (2021), « Evaporite deposits », <i>Encyclopedia of Geology</i>, 2ᵉ éd., tableau 2.",
    sofianos: "Exemple d'évaporation : ≈ 2 m d'eau par an sur la mer Rouge (Sofianos S. S. et al. 2002, <i>Deep-Sea Research II</i> 49) ; concentration = 1 ÷ (part d'eau restante).",
    fournier: "Solubilité de la silice amorphe : Fournier R. O. et Rowe J. J. (1977), <i>American Mineralogist</i> 62 (log C = −731/T + 4,52).",
    rimstidt: "Solubilité du quartz : Rimstidt J. D. (1997), <i>Geochimica et Cosmochimica Acta</i> 61, 2553 (11 mg/kg à 25 °C).",
    siliceChaud: "Au-delà de 100 °C, les deux courbes de solubilité sont EXTRAPOLÉES hors du domaine d'ajustement des auteurs : ordres de grandeur seulement (la solubilité réelle du quartz dépend aussi de la pression et de la salinité).",
    odp: "Opale-A → opale-CT vers 40 ± 3 °C, opale-CT → quartz vers 46–56 °C en mer du Japon (Nobes D. C. et al. 1992, <i>Proc. ODP Sci. Results</i> 127/128) ; 45–50 °C dans la formation de Monterey (Keller M. A. et Isaacs C. M. 1985).",
    treguer: "Silice dissoute de l'océan, appauvrie en surface par les diatomées et enrichie en profondeur : Tréguer P. J. et De La Rocha C. L. (2013), <i>Annual Review of Marine Science</i> 5, 477.",
    plummer: "Équilibre de la calcite : constantes de Plummer L. N. et Busenberg E. (1982), <i>Geochimica et Cosmochimica Acta</i> 46, 1011 ; coefficients d'activité de Davies, sans paires d'ions (calcul de l'atlas).",
    ccd: "Profondeur de compensation des carbonates : ≈ 4,5 km dans le Pacifique, ≈ 5,5 km dans l'Atlantique (océan actuel) ; teneur en carbonate du fond : profil schématique.",
    photique: "Craie : mer de 50 à 200–300 m de fond (Kennedy W. J. et Garrison R. E. 1975, <i>Sedimentology</i> 22).",
    pourbaix: "Domaines du fer : diagramme de Pourbaix calculé pour la partie Oxydes de l'atlas (ThermoChimie, activité 10⁻⁶, 25 °C).",
    gradient: "Température d'enfouissement : 10 °C en surface et 30 °C par kilomètre (gradient moyen) ; chemins schématiques, la profondeur maximale est estimée d'après l'état de la roche.",
    bowen: "Ordre de cristallisation des minéraux d'un magma : Bowen N.L. (1928), <i>The Evolution of the Igneous Rocks</i>, Princeton.",
    manatschal: "Dorsale lente de l'océan alpin (1 à 2 cm par an), gabbros mis en place dans le manteau serpentinisé puis ramenés au fond de l'océan par une faille de détachement (166–158 Ma), ophiolite du Chenaillet (moins de 600 m d'épaisseur, charriée vers 50 Ma) : travaux de G. Manatschal et al., présentés par D. Levert (2015), <i>Saga Information</i> 347, 12–18.",
    petford: "Montée des magmas granitiques par des filons (dykes) plutôt qu'en diapirs, massifs construits par lames successives en moins de 100 000 ans : Petford N., Cruden A.R., McCaffrey K.J.W. et Vigneresse J.-L. (2000), <i>Nature</i> 408, 669 ; Clemens J.D. et Mawer C.K. (1992), <i>Tectonophysics</i> 204, 339.",
    cruden: "Place faite au massif par l'enfoncement de son plancher (toit plat, plancher creusé) : Cruden A.R. et McCaffrey K.J.W. (2001), <i>Physics and Chemistry of the Earth (A)</i> 26, 303.",
    linton: "Boules et chaos de granite : altération en arène le long des diaclases autour de noyaux sains, puis déblaiement de l'arène (modèle en deux temps) : Linton D.L. (1955), <i>The Geographical Journal</i> 121, 470.",
    maaloe: "Intervalle de cristallisation d'un granite riche en eau sous 0,2 GPa (865 → 705 °C ; plagioclase au liquidus, biotite dès ≈ 845 °C) : Maaløe S. et Wyllie P.J. (1975), <i>Contributions to Mineralogy and Petrology</i> 52, 175.",
    naney: "Températures de cristallisation des magmas granitiques (plagioclase et biotite d'abord, feldspath potassique et quartz près du solidus) : Naney M.T. (1983), <i>American Journal of Science</i> 283, 993.",
    paxton: "Vides entre les grains d'un sable (≈ 40 % au dépôt, ≈ 26 % après tassement vers 2–3 km) : Paxton S.T. et al. (2002), <i>AAPG Bulletin</i> 86, 2047.",
    walderhaug: "Cimentation par le quartz au-delà de ≈ 70–80 °C : Walderhaug O. (1996), <i>AAPG Bulletin</i> 80, 731.",
    burnham: "Rang des charbons et fenêtre à pétrole : réflectance de la vitrinite convertie en température d'enfouissement (Burnham A. K. et Sweeney J. J. 1989, compilé par le Kentucky Geological Survey) ; plus la chauffe dure, plus la température nécessaire est basse.",
    anchizone: "Très faible métamorphisme (anchizone) vers 200–300 °C : Kübler B. (1967) ; Merriman R. J. et Frey M. (1999).",
    hardie: "Gypse → anhydrite : 58 °C dans l'eau pure (Hardie L. A. 1967, <i>American Mineralogist</i> 52, 171), 42 °C selon Posnjak (1940) ; moins dans une saumure salée.",
    h5: "Échelle climatique commune de l'atlas : températures des régimes des sols (Soil Taxonomy), pluie ÷ ETP (PNUE 1992).",
    safran: "Points des villes : normales 1991–2020 des mailles SAFRAN (Météo-France, via GeoSAS).",
    ferguson: "Vitesse de chute des grains : Ferguson R. I. et Church M. (2004), <i>Journal of Sedimentary Research</i> 74, 933 (eau à 20 °C).",
    wentworth: "Classes de taille : argile < 2 µm, limon 2–63 µm, sable 63 µm–2 mm (convention de l'atlas), gravier 2–64 mm ; gammes des agents : ordres de grandeur.",
    stoffler: "Stades du choc : Stöffler D. et Grieve R. A. F. (2007), IUGS ; quartz choqué dès ≈ 10 GPa, fusion totale au-delà de ≈ 60 GPa. Âge de Rochechouart : 206,9 Ma (Cohen B. E. et al. 2017, <i>Meteoritics & Planetary Science</i> 52, 1600).",
    eruption: "Températures d'éruption : USGS (California Volcano Observatory), « How hot is hot? » : basaltes 1 000–1 200 °C, rhyolites 800–1 000 °C.",
  };

  // ─────────────────────────────── données par roche ───────────────────────────────
  // proc : processus ; p : paramètres des scènes ; titres : titres propres à la roche (null = titre du processus) ;
  // cond : diagramme de conditions ; src : sources ajoutées à celles du diagramme
  // métamorphiques : champs des faciès, étiquettes des champs et des courbes selon l'échelle
  const LAB_FACIES = {
    reg: { "diagenèse": [95, 0.12], "très faible degré": [262, 0.2], "schistes verts": [400, 0.45], "amphibolites": [640, 1.05], "granulites": [880, 0.72], "schistes bleus": [290, 1.2], "éclogites": [860, 1.53], "cornéennes": [650, 0.1] },
    hp: { "diagenèse": [95, 0.2], "très faible degré": [262, 0.3], "schistes verts": [400, 0.5], "amphibolites": [620, 0.8], "granulites": [880, 0.9], "schistes bleus": [250, 2.5], "éclogites": [800, 2.6], "cornéennes": [650, 0.1] },
    contact: { "diagenèse": [95, 0.1], "très faible degré": [250, 0.36], "schistes verts": [385, 0.33], "amphibolites": [615, 0.5], "granulites": [880, 0.42], "cornéennes": [650, 0.1] },
  };
  const LAB_COURBES = {
    reg: { graniteEau: [695, 0.42, -87], jadeite: [330, 1.0, 22] },
    hp: { graniteEau: [604, 1.2, -88], jadeite: [700, 1.78, 33], coesite: [520, 2.66, 9.5] },
    contact: { graniteEau: [650, 0.42, -72] },
    faille: { graniteEau: [610, 0.62, -80] },
  };
  const LAB_AL = {
    reg: [["andalousite", 470, 0.2], ["sillimanite", 820, 0.45], ["disthène", 720, 1.15]],
    contact: [["andalousite", 520, 0.25], ["sillimanite", 850, 0.32], ["disthène", 380, 0.55]],
  };
  const PT_META = (o) => {
    const e = o.echelle || "reg";
    const c = Object.assign({ type: "pt", champs: "facies", fondu: [], courbes: [] }, o);
    c.labFacies = LAB_FACIES[e];
    const etq = [];
    for (const nomC of c.courbes) if (LAB_COURBES[e] && LAB_COURBES[e][nomC]) etq.push([nomC, ...LAB_COURBES[e][nomC]]);
    if (o.labAl && LAB_AL[e]) for (const [nom, T, P] of LAB_AL[e]) etq.push([nom, T, P]);
    c.etiquettes = etq.concat(o.etiquettes || []);
    return c;
  };

  // ── gabarits de conditions réutilisés ──
  const PT_CROUTE = (o) => Object.assign({ type: "pt", echelle: "croute", fondu: ["graniteEau"], courbes: ["graniteEau", "peridotite"],
    etiquettes: [["graniteEau", 560, 0.62, -84], ["peridotite", 1245, 0.62, -84], ["fusion partielle (avec eau)", 960, 1.08]] }, o);
  const PT_MANTEAU = (o) => Object.assign({ type: "pt", echelle: "manteau", fondu: ["peridotite"], courbes: ["peridotite"],
    etiquettes: [["peridotite", 1290, 1.2, -68], ["manteau partiellement fondu", 1630, 3.5]] }, o);
  const DUREE_PLUTON = "le massif refroidit en 100 000 ans à 1 million d'années";

  const ROCHES_F = {
    // ════════════════════════ M.1 plutoniques ════════════════════════
    granite: {
      proc: "pluton", p: { src: "croute", profFusion: "≈ 25–35 km", prof: "≈ 5–10 km", boules: true, dureeErosion: "des dizaines de Ma" },
      titres: ["Fusion partielle de la croûte continentale épaissie", null, "Cristallisation lente, vers 5 à 10 km de profondeur", null],
      // C.2 animé (17/09/2026) : prototype magmatique
      exemple: "Exemple suivi : un granite de la chaîne varisque (Massif armoricain, Massif central), mis en place entre 360 et 290 millions d'années.",
      anim: [
        { court: "Fusion", titre: "La croûte épaissie par la collision fond en partie, vers 25 à 35 km",
          quand: "Vers 345 à 335 millions d'années", duree: "quelques millions d'années",
          scene: "fusionCroute", p: { zFusion: [25, 35], tFusion: "750 à 850 °C", age0: 345, age1: 335 } },
        { court: "Montée", titre: "Moins dense que les roches qui l'entourent, le magma remonte en s'ouvrant un chemin dans les fractures",
          quand: "Vers 335 millions d'années", duree: "de 1 000 à 100 000 ans",
          scene: "monteeMagma", p: { zFusion: [25, 35], zPluton: [5, 10], age1: 335, age2: 330 } },
        { court: "Mise en place", titre: "Il s'arrête vers 5 à 10 km et s'étale en lames successives qui construisent le massif",
          quand: "Vers 330 millions d'années", duree: "de 10 000 à 1 million d'années, par injections successives",
          scene: "misePlacePluton", p: { zPluton: [5, 10], age2: 330, age3: 325 } },
        { court: "Cristallisation", titre: "Il cristallise lentement : plagioclase et biotite, puis feldspath potassique, puis quartz",
          quand: "Vers 325 millions d'années", duree: "de 100 000 ans à 1 million d'années",
          scene: "cristallisationLente", p: { tDebut: 880, tFin: 680, dureeCristal: "de 100 000 ans à 1 million d'années" } },
        { court: "Érosion", titre: "L'érosion enlève le toit : le granite affleure, se débite en boules et donne de l'arène",
          quand: "De 325 millions d'années à aujourd'hui", duree: "plus de 300 millions d'années",
          scene: "erosionGranite", p: { zPluton: [5, 10], age3: 325 } },
      ],
      cond: PT_CROUTE({ bande: [680, 850, 0.22], chemin: [
        { T: 800, P: 0.85, n: 1, t: "La croûte épaissie par la collision varisque fond en partie vers 750–850 °C, à 25–35 km : le liquide se sépare des minéraux restés solides." },
        { T: 770, P: 0.35, n: 2, t: "Moins dense que les roches qui l'entourent (≈ 2,4 contre 2,7 tonnes par m³), le liquide se rassemble dans des veines puis remonte par des filons (dykes) de quelques mètres de large qu'il ouvre lui-même ; le massif se remplit en 1 000 à 100 000 ans." },
        { T: 730, P: 0.2, n: 3, t: "Il s'arrête vers 5 à 10 km et gonfle une chambre magmatique, par injections successives." },
        { T: 690, P: 0.2, n: 4, t: `Il cristallise entre ≈ 850 °C et le solidus (≈ 680 °C), dans l'ordre plagioclase et biotite, feldspath potassique, quartz ; ${DUREE_PLUTON}.` },
        { T: 300, P: 0.2 },
        { T: 15, P: 0, n: 5, t: "L'érosion enlève les kilomètres de roches du dessus : les granites cristallisés entre 360 et 290 Ma affleurent aujourd'hui, débités en boules et transformés en arène." }] }),
      src: ["tuttle", "diffusion"],
    },
    granodiorite: {
      exemple: "Exemple suivi : les granodiorites varisques du Massif central et de Corse, mises en place entre 345 et 295 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Le bas de la croûte, chauffé par des magmas du manteau, fond en partie", "quand": "Vers 335 millions d'années", "scene": "fusionCroute", "p": {"zFusion": [30, 35], "tFusion": "850 et 950 °C", "age0": 335, "age1": 332, "labCroute": "bas de la croûte, chauffé par des magmas du manteau"}},
        {"court": "Montée", "titre": "Moins dense que les roches qui l'entourent, le magma se rassemble et remonte", "quand": "Vers 332 millions d'années", "duree": "de 1 000 à 100 000 ans", "scene": "monteeMagma", "p": {"zFusion": [30, 35], "zPluton": [7, 12], "age1": 332, "age2": 330}},
        {"court": "Mise en place", "titre": "Il s'arrête vers 7–12 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 330 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [7, 12], "age2": 330, "age3": 328}},
        {"court": "Cristallisation", "titre": "Plagioclase et amphibole cristallisent d'abord, le quartz et le feldspath potassique à la fin", "quand": "Vers 330 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 900, "tFin": 700, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les kilomètres de roches du dessus : la granodiorite affleure", "quand": "Depuis 330 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [7, 12], "age3": 328, "couleurPluton": "#d3cabd", "texteAffleure": "la granodiorite affleure : elle se débite en boules et donne une arène"}},
      ],
      proc: "pluton", p: { src: "croute", profFusion: "≈ 30–35 km", prof: "≈ 7–12 km" },
      titres: ["Fusion du bas de la croûte, réchauffée par des magmas du manteau", null, null, null],
      cond: PT_CROUTE({ bande: [700, 900, 0.28], chemin: [
        {"T": 900, "P": 0.92, "n": 1, "t": "Le bas de la croûte fond vers 850–950 °C ; des magmas basiques venus du manteau apportent chaleur et matière et se mêlent au liquide."},
        {"T": 850, "P": 0.3, "n": 2, "t": "Le magma, un peu moins riche en silice qu'un granite, monte en 1 000 à 100 000 ans."},
        {"T": 840, "P": 0.28, "n": 3, "t": "Il s'installe vers 7–12 km ; sa chaleur transforme les roches voisines (auréole de contact)."},
        {"T": 700, "P": 0.28, "n": 4, "t": "Il cristallise entre ≈ 900 et ≈ 700 °C : plagioclase et amphibole d'abord, quartz et feldspath potassique à la fin ; le massif refroidit en 100 000 ans à 1 million d'années."},
        {"T": 300, "P": 0.28},
        {"T": 15, "P": 0, "n": 5, "t": "Mis en place entre 345 et 295 Ma, le massif est dégagé par l'érosion (Margeride, Corse, Mont-Blanc)."}] }),
      src: ["tuttle", "diffusion"],
    },
    tonalite: {
      exemple: "Exemple suivi : les tonalites varisques des Maures (Var) et de Corse, mises en place entre 345 et 300 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Des amphibolites du bas de la croûte fondent en partie : un liquide riche en sodium se forme", "quand": "Vers 335 millions d'années", "scene": "fusionCroute", "p": {"zFusion": [30, 35], "tFusion": "900 et 1 000 °C", "age0": 335, "age1": 332, "labCroute": "bas de la croûte : amphibolites qui fondent"}},
        {"court": "Montée", "titre": "Moins dense que les roches qui l'entourent, le magma se rassemble et remonte", "quand": "Vers 332 millions d'années", "duree": "de 1 000 à 100 000 ans", "scene": "monteeMagma", "p": {"zFusion": [30, 35], "zPluton": [8, 15], "age1": 332, "age2": 330}},
        {"court": "Mise en place", "titre": "Il s'arrête vers 8–15 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 330 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [8, 15], "age2": 330, "age3": 328}},
        {"court": "Cristallisation", "titre": "Plagioclase, amphibole et biotite cristallisent ; presque pas de feldspath potassique", "quand": "Vers 330 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 950, "tFin": 720, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les kilomètres de roches du dessus : la tonalite affleure", "quand": "Depuis 330 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [8, 15], "age3": 328, "couleurPluton": "#c9c3b8", "texteAffleure": "la tonalite affleure : elle se débite en boules et donne une arène"}},
      ],
      proc: "pluton", p: { src: "croute", profFusion: "≈ 30–40 km", prof: "≈ 8–15 km" },
      titres: ["Fusion d'une croûte basique (amphibolites) en profondeur", null, null, null],
      cond: PT_CROUTE({ bande: [720, 950, 0.32], chemin: [
        {"T": 950, "P": 1.0, "n": 1, "t": "Des roches basiques du bas de la croûte (amphibolites) fondent en partie vers 900–1 000 °C : le liquide est riche en sodium, pauvre en potassium."},
        {"T": 880, "P": 0.45, "n": 2, "t": "Le magma monte en 1 000 à 100 000 ans."},
        {"T": 870, "P": 0.32, "n": 3, "t": "Il s'installe vers 8–15 km ; sa chaleur transforme les roches voisines (auréole de contact)."},
        {"T": 720, "P": 0.32, "n": 4, "t": "Il cristallise : beaucoup de plagioclase, d'amphibole et de biotite, presque pas de feldspath potassique ; le massif refroidit en 100 000 ans à 1 million d'années."},
        {"T": 300, "P": 0.32},
        {"T": 15, "P": 0, "n": 5, "t": "Tonalites varisques (345–300 Ma), dégagées par l'érosion."}] }),
      src: ["tuttle", "diffusion"],
    },
    trondhjemite: {
      exemple: "Exemple suivi : la trondhjémite (plagiogranite) de l'ophiolite du Chenaillet, près de Montgenèvre : derniers liquides d'une chambre magmatique de l'océan alpin, vers 160 millions d'années.",
      animDuree: 1.2,
      animCurseur: "arrivee",
      anim: [
        {"court": "Dorsale", "titre": "Sous la dorsale de l'océan alpin, le manteau qui remonte fond en partie à 20–60 km", "quand": "Vers 160 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "manteau", "lente": true, "zoom": true, "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "le manteau remonte et fond en partie"}},
        {"court": "Chambre", "titre": "Le liquide né dans le manteau monte par des chenaux et remplit une chambre, 4 à 5 km sous le fond de l'océan", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "chambreRemplissage", "p": {"libelleAge": "vers 160 millions d'années"}},
        {"court": "Derniers liquides", "titre": "Plus alimentée, la chambre refroidit sur place et cristallise : elle devient du gabbro ; les tout derniers liquides, riches en silice et en sodium, forment des filons clairs de trondhjémite", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "chambreCristallisation", "p": {"silice": [48, 70], "tDebut": 1200, "tFin": 920, "liquideFin": 6, "filons": true, "libelleAge": "vers 160 millions d'années", "zones": [[45, "gabbro"], [52, "diorite"], [63, "tonalite"], [69, "trondhjémite"]]}},
        {"court": "Remontée", "titre": "Une grande faille, la faille de détachement, fait remonter le gabbro et sa trondhjémite jusqu'au fond de l'océan", "quand": "Entre 160 et 159 millions d'années", "duree": "environ 1 million d'années (≈ 1 cm par an)", "scene": "detachementDorsale", "p": {"ages": [160, 159], "filons": true}},
        {"court": "Charriage", "titre": "À la fermeture de l'océan, une mince écaille de son fond monte sur le prisme au lieu de plonger ; la collision la soulève, l'érosion la dégage : c'est le Chenaillet", "quand": "De 50 millions d'années à aujourd'hui", "duree": "charriage en quelques millions d'années, puis érosion", "scene": "obduction", "p": {"ages": [50, 45, 35, 0]}},
      ],
      proc: "ophiolite", p: { niveau: "gabbros", profFusion: "≈ 20–60 km" },
      titres: [null, null, "Derniers liquides de la chambre : plagiogranite", "Charriage dans les Alpes (ophiolites)"],
      cond: PT_MANTEAU({ bande: [850, 1000, 0.08], chemin: [
        { T: 1400, P: 1.8, n: 1, t: "Sous la dorsale de l'océan alpin, le manteau qui remonte fond en partie à 20–60 km." },
        { T: 1200, P: 0.17, n: 2, t: "Le liquide monte et remplit une chambre 4 à 5 km sous le fond de l'océan, lui-même sous ≈ 3,5 km d'eau." },
        { T: 920, P: 0.17, n: 3, t: "En cristallisant, la chambre devient du gabbro ; les tout derniers liquides, riches en silice et en sodium, donnent des filons clairs de trondhjémite (vers 160 Ma)." },
        { T: 400, P: 0.08 },
        { T: 4, P: 0.035, n: 4, t: "La faille de détachement ramène le gabbro et sa trondhjémite au fond de l'océan, en ≈ 1 million d'années (vers 160 Ma)." },
        { T: 15, P: 0, n: 5, t: "À la fermeture de l'océan (vers 50 Ma), une écaille de ce fond est charriée sans plonger : le Chenaillet, à 2 650 m." }] }),
      src: ["hirschmann", "manatschal"],
    },
    charnockite: {
      exemple: "Exemple suivi : les charnockites de Chennai (Inde du Sud), vers 2,5 milliards d'années ; la pierre tombale de Job Charnock, fondateur de Calcutta, a donné son nom à la roche.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Au bas d'une croûte très chaude et pauvre en eau, la roche fond vers 950–1 000 °C", "quand": "Vers 2,5 milliards d'années", "scene": "fusionCroute", "p": {"zFusion": [33, 35], "tFusion": "950 et 1 000 °C", "age0": 2520, "age1": 2510, "labCroute": "croûte profonde, chaude et sèche"}},
        {"court": "Mise en place", "titre": "Le magma monte peu : il s'arrête dans la croûte profonde, vers 20–25 km", "quand": "Vers 2,5 milliards d'années", "scene": "misePlacePluton", "p": {"zPluton": [20, 25], "age2": 2510, "age3": 2500, "labPluton": "magma sec"}},
        {"court": "Cristallisation", "titre": "Sans eau, l'orthopyroxène remplace la biotite et l'amphibole", "quand": "Vers 2,5 milliards d'années", "duree": "des centaines de milliers d'années", "scene": "cristallisationLente", "p": {"tDebut": 980, "tFin": 800, "dureeCristal": "des centaines de milliers d'années"}},
        {"court": "Érosion", "titre": "Seule une érosion très longue, de 20 km de roches, l'amène au jour", "quand": "De 2,5 milliards d'années à aujourd'hui", "scene": "erosionGranite", "p": {"zPluton": [20, 25], "age3": 2500, "couleurPluton": "#b3a88c", "texteErosion": "l'érosion enlève 20 km de roches", "texteAffleure": "la charnockite affleure, sombre et verdâtre", "texteArene": "une croûte très ancienne, usée jusqu'à ses racines"}},
      ],
      proc: "pluton", p: { src: "croute", profFusion: "≈ 35–40 km", prof: "≈ 20–25 km" },
      titres: ["Fusion au bas d'une croûte chaude et sèche", null, "Cristallisation lente vers 20–25 km, dans le faciès granulite", null],
      cond: PT_CROUTE({ bande: [800, 950, 0.65], chemin: [
        {"T": 980, "P": 1.05, "n": 1, "t": "Au bas d'une croûte très chaude et pauvre en eau, la roche fond vers 950–1 000 °C."},
        {"T": 930, "P": 0.7, "n": 2, "t": "Le magma monte peu : il reste dans la croûte profonde, vers 20–25 km."},
        {"T": 800, "P": 0.65, "n": 3, "t": "Il cristallise sans eau, dans le faciès granulite : l'orthopyroxène remplace la biotite et l'amphibole."},
        {"T": 400, "P": 0.5},
        {"T": 15, "P": 0, "n": 4, "t": "Seule une érosion très profonde, ou une remontée tectonique, amène ces roches à la surface : rares en France, elles forment de vastes régions en Inde du Sud (≈ 2,5 Ga)."}] }),
      src: ["tuttle"],
    },
    diorite: {
      exemple: "Exemple suivi : la diorite orbiculaire de Sainte-Lucie-de-Tallano (la « corsite », Corse) et les diorites varisques (345–300 Ma).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Un magma basique naît dans le manteau, vers 50 à 70 km", "quand": "Sous la chaîne varisque, vers 320 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [50, 70], "tFusion": "1 250 à 1 350 °C", "pctFusion": 6}},
        {"court": "Réservoir", "titre": "Au bas de la croûte, le magma perd ses premiers cristaux et fond un peu de croûte : il devient intermédiaire", "quand": "Vers 320 millions d'années", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [48, 56], "tDebut": 1200, "tFin": 1050, "liquideFin": 60, "zRes": 30, "assimilation": true, "zones": [[45, "gabbro"], [52, "diorite"], [63, "granodiorite"], [69, "granite"]], "lieu": "réservoir au bas de la croûte, vers 30 km", "couleurs": ["#b5401f", "#cd6232"]}},
        {"court": "Mise en place", "titre": "Le magma s'installe vers 5–10 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 320 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [5, 10], "age2": 320, "age3": 318}},
        {"court": "Cristallisation", "titre": "Plagioclase et amphibole cristallisent lentement", "quand": "Vers 318 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 1050, "tFin": 850, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les roches du dessus : la diorite affleure", "quand": "Depuis 318 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [5, 10], "age3": 318, "couleurPluton": "#9d9990", "couleurBoules": "#9d9990", "texteAffleure": "la diorite affleure : elle se débite en boules et s'altère en argiles", "texteArene": "les produits d'altération partent vers les rivières"}},
      ],
      proc: "pluton", p: { src: "manteau", prof: "≈ 5–10 km", profFusion: "≈ 50–70 km" },
      titres: ["Fusion partielle du manteau, puis évolution au bas de la croûte", null, null, null],
      cond: PT_MANTEAU({ bande: [850, 1050, 0.25], chemin: [
        {"T": 1430, "P": 2.0, "n": 1, "t": "Un magma basique naît dans le manteau vers 50–70 km."},
        {"T": 1200, "P": 0.9500000000000001},
        {"T": 1080, "P": 0.9, "n": 2, "t": "Stocké au bas de la croûte, il perd ses premiers cristaux (olivine, pyroxène) et assimile un peu de croûte : il devient intermédiaire."},
        {"T": 1060, "P": 0.25, "n": 3, "t": "Il s'installe vers 5–10 km ; sa chaleur transforme les roches voisines (auréole de contact)."},
        {"T": 850, "P": 0.25, "n": 4, "t": "Il cristallise entre ≈ 1 050 et ≈ 850 °C : plagioclase et amphibole ; le massif refroidit en 100 000 ans à 1 million d'années."},
        {"T": 300, "P": 0.25},
        {"T": 15, "P": 0, "n": 5, "t": "Diorites varisques (345–300 Ma), dégagées par l'érosion ; la corsite montre des orbicules de plagioclase et d'amphibole."}] }),
      src: ["hirschmann", "diffusion"],
    },
    monzodiorite: {
      exemple: "Exemple suivi : les monzodiorites du batholite corse, mises en place entre 345 et 290 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Un manteau enrichi en potassium fond en partie, vers 50 à 70 km", "quand": "Vers 320 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [50, 70], "tFusion": "1 250 à 1 350 °C", "pctFusion": 6}},
        {"court": "Réservoir", "titre": "Au bas de la croûte, le magma perd ses premiers cristaux et se charge en potassium", "quand": "Vers 320 millions d'années", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [48, 55], "tDebut": 1200, "tFin": 1050, "liquideFin": 60, "zRes": 30, "zones": [[45, "gabbro"], [52, "monzodiorite"], [57, "monzonite"], [63, "syénite"]], "lieu": "réservoir au bas de la croûte, vers 30 km", "couleurs": ["#b5401f", "#cc5e30"]}},
        {"court": "Mise en place", "titre": "Le magma s'installe vers 5–10 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 320 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [5, 10], "age2": 320, "age3": 318}},
        {"court": "Cristallisation", "titre": "Plagioclase, feldspath potassique et amphibole cristallisent", "quand": "Vers 318 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 1050, "tFin": 850, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les roches du dessus : la monzodiorite affleure", "quand": "Depuis 318 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [5, 10], "age3": 318, "couleurPluton": "#aea598", "couleurBoules": "#aea598", "texteAffleure": "la monzodiorite affleure : elle se débite en boules et s'altère en argiles", "texteArene": "les produits d'altération partent vers les rivières"}},
      ],
      proc: "pluton", p: { src: "manteau", prof: "≈ 5–10 km", profFusion: "≈ 50–70 km" },
      cond: PT_MANTEAU({ bande: [800, 1000, 0.25], chemin: [
        {"T": 1440, "P": 2.1, "n": 1, "t": "Fusion d'un manteau enrichi en potassium vers 50–70 km."},
        {"T": 1200, "P": 0.9500000000000001},
        {"T": 1060, "P": 0.9, "n": 2, "t": "Le magma évolue au bas de la croûte, perd ses premiers cristaux et se charge en potassium."},
        {"T": 1040, "P": 0.25, "n": 3, "t": "Il s'installe vers 5–10 km."},
        {"T": 850, "P": 0.25, "n": 4, "t": "Il cristallise : plagioclase dominant, feldspath potassique, amphibole ; le massif refroidit en 100 000 ans à 1 million d'années."},
        {"T": 300, "P": 0.25},
        {"T": 15, "P": 0, "n": 5, "t": "Massifs varisques (345–290 Ma), dégagés par l'érosion."}] }),
      src: ["hirschmann", "diffusion"],
    },
    monzonite: {
      exemple: "Exemple suivi : les monzonites permiennes de l'Estérel et de Corse, entre 300 et 270 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "À la fin de la chaîne varisque, un manteau enrichi en potassium fond en partie", "quand": "Vers 285 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [50, 70], "tFusion": "1 250 à 1 350 °C", "pctFusion": 5}},
        {"court": "Réservoir", "titre": "Dans un réservoir profond, le magma perd ses premiers cristaux et s'enrichit en potassium", "quand": "Vers 285 millions d'années", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [48, 58], "tDebut": 1200, "tFin": 1000, "liquideFin": 45, "zRes": 30, "zones": [[45, "gabbro"], [52, "monzodiorite"], [57, "monzonite"], [63, "syénite"]], "lieu": "réservoir profond, au bas de la croûte", "couleurs": ["#b5401f", "#d4733a"]}},
        {"court": "Mise en place", "titre": "Le magma s'installe vers 3–8 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 285 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [3, 8], "age2": 285, "age3": 283}},
        {"court": "Cristallisation", "titre": "Feldspath potassique et plagioclase cristallisent à parts égales", "quand": "Vers 283 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 1000, "tFin": 800, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les roches du dessus : la monzonite affleure", "quand": "Depuis 283 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [3, 8], "age3": 283, "couleurPluton": "#c8b5a3", "couleurBoules": "#c8b5a3", "texteAffleure": "la monzonite affleure : elle se débite en boules et s'altère en argiles", "texteArene": "les produits d'altération partent vers les rivières"}},
      ],
      proc: "pluton", p: { src: "manteau", prof: "≈ 3–8 km", profFusion: "≈ 50–70 km" },
      cond: PT_MANTEAU({ bande: [780, 980, 0.2], chemin: [
        {"T": 1450, "P": 2.2, "n": 1, "t": "Fusion d'un manteau enrichi en potassium, à la fin de la chaîne varisque."},
        {"T": 1200, "P": 0.8500000000000001},
        {"T": 1000, "P": 0.8, "n": 2, "t": "Le magma évolue dans un réservoir profond et s'enrichit en potassium."},
        {"T": 980, "P": 0.2, "n": 3, "t": "Il s'installe vers 3–8 km."},
        {"T": 800, "P": 0.2, "n": 4, "t": "Il cristallise : feldspath potassique et plagioclase à parts égales ; le massif refroidit en 100 000 ans à 1 million d'années."},
        {"T": 300, "P": 0.2},
        {"T": 15, "P": 0, "n": 5, "t": "Monzonites permiennes (300–270 Ma) de l'Estérel et de Corse, dégagées par l'érosion."}] }),
      src: ["hirschmann", "diffusion"],
    },
    syenite: {
      exemple: "Exemple suivi : les syénites varisques des Vosges (Champ du Feu) et de Corse, entre 345 et 290 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Quelques pour cent seulement du manteau fondent : le liquide concentre sodium et potassium", "quand": "Vers 320 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [60, 90], "tFusion": "1 300 à 1 400 °C", "pctFusion": 3}},
        {"court": "Réservoir", "titre": "Le magma perd olivine, pyroxène et plagioclase : il s'enrichit encore en alcalins", "quand": "Vers 320 millions d'années", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [47, 61], "tDebut": 1200, "tFin": 850, "liquideFin": 25, "zRes": 30, "zones": [[45, "gabbro"], [52, "monzodiorite"], [57, "monzonite"], [63, "syénite"]], "lieu": "réservoir au bas de la croûte", "couleurs": ["#b5401f", "#e39b5a"]}},
        {"court": "Mise en place", "titre": "Le magma s'installe vers 3–8 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 320 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [3, 8], "age2": 320, "age3": 318}},
        {"court": "Cristallisation", "titre": "Le feldspath potassique domine ; presque pas de quartz", "quand": "Vers 318 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 900, "tFin": 750, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les roches du dessus : la syénite affleure", "quand": "Depuis 318 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [3, 8], "age3": 318, "couleurPluton": "#d6bfa8", "couleurBoules": "#d6bfa8", "texteAffleure": "la syénite affleure : elle se débite en boules et s'altère en argiles", "texteArene": "les produits d'altération partent vers les rivières"}},
      ],
      proc: "pluton", p: { src: "manteau", prof: "≈ 3–8 km", profFusion: "≈ 60–90 km" },
      titres: ["Fusion faible d'un manteau enrichi", null, null, null],
      cond: PT_MANTEAU({ bande: [750, 950, 0.2], chemin: [
        {"T": 1490, "P": 2.6, "n": 1, "t": "Quelques pour cent seulement du manteau fondent : le liquide concentre sodium et potassium."},
        {"T": 1200, "P": 0.8500000000000001},
        {"T": 870, "P": 0.8, "n": 2, "t": "En route, le magma perd olivine, pyroxène et plagioclase : il s'enrichit encore en alcalins."},
        {"T": 850, "P": 0.2, "n": 3, "t": "Il s'installe vers 3–8 km."},
        {"T": 750, "P": 0.2, "n": 4, "t": "Il cristallise : surtout du feldspath potassique, presque pas de quartz ; le massif refroidit en 100 000 ans à 1 million d'années."},
        {"T": 300, "P": 0.2},
        {"T": 15, "P": 0, "n": 5, "t": "Syénites varisques (345–290 Ma), dégagées par l'érosion."}] }),
      src: ["hirschmann", "diffusion"],
    },
    syenite_nephelinique: {
      exemple: "Exemple suivi : le massif des Khibiny (presqu'île de Kola, Russie), plus grand complexe de syénite néphélinique du monde, vers 380 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Très profond, le manteau fond à peine : le liquide est pauvre en silice et riche en sodium", "quand": "Vers 380 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [80, 100], "tFusion": "1 350 à 1 450 °C", "pctFusion": 2}},
        {"court": "Réservoir", "titre": "En évoluant, le liquide s'enrichit en alcalins sans jamais avoir assez de silice pour faire du quartz", "quand": "Vers 380 millions d'années", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [44, 56], "echelle": [38, 66], "tDebut": 1200, "tFin": 850, "liquideFin": 25, "zRes": 30, "zones": [[38, "néphélinite"], [44, "basanite"], [49, "téphrite"], [53, "phonolite"]], "lieu": "réservoir au bas de la croûte", "couleurs": ["#9e3a1c", "#d98c52"]}},
        {"court": "Mise en place", "titre": "Le magma s'installe vers 2–6 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 380 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [2, 6], "age2": 380, "age3": 378}},
        {"court": "Cristallisation", "titre": "La néphéline cristallise à la place du quartz", "quand": "Vers 378 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 900, "tFin": 750, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les roches du dessus : la syénite néphélinique affleure", "quand": "Depuis 378 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [2, 6], "age3": 378, "couleurPluton": "#c7c1ad", "couleurBoules": "#c7c1ad", "texteAffleure": "la syénite néphélinique affleure : elle se débite en boules et s'altère en argiles", "texteArene": "les produits d'altération partent vers les rivières"}},
      ],
      proc: "pluton", p: { src: "manteau", prof: "≈ 2–6 km", profFusion: "≈ 80–120 km" },
      titres: ["Fusion très faible d'un manteau enrichi, en profondeur", null, null, null],
      cond: PT_MANTEAU({ bande: [700, 950, 0.15], chemin: [
        {"T": 1530, "P": 3.0, "n": 1, "t": "Une très faible fusion, profonde, donne un liquide pauvre en silice et riche en sodium."},
        {"T": 1200, "P": 0.8500000000000001},
        {"T": 870, "P": 0.8, "n": 2, "t": "Le magma évolue sans jamais atteindre la saturation en silice : il devient phonolitique."},
        {"T": 850, "P": 0.15, "n": 3, "t": "Il s'installe à faible profondeur, vers 2–6 km."},
        {"T": 750, "P": 0.15, "n": 4, "t": "Il cristallise : la néphéline prend la place du quartz, qui ne peut pas apparaître faute de silice."},
        {"T": 300, "P": 0.15},
        {"T": 15, "P": 0, "n": 5, "t": "Complexes alcalins rares, presque absents de France ; les Khibiny (Kola) datent d'environ 380 Ma."}] }),
      src: ["hirschmann"],
    },
    gabbro: {
      exemple: "Exemple suivi : les gabbros du Chenaillet (Montgenèvre), croûte de l'océan alpin (165–150 millions d'années) charriée dans les Alpes.",
      animDuree: 1.2,
      animCurseur: "arrivee",
      anim: [
        {"court": "Dorsale", "titre": "Sous la dorsale de l'océan alpin, le manteau remonte et fond en partie à 20–60 km", "quand": "Vers 160 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "manteau", "lente": true, "zoom": true, "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "le manteau remonte et fond en partie"}},
        {"court": "Chambre", "titre": "Le liquide basaltique monte du manteau et remplit une chambre, 4 à 5 km sous le fond de l'océan", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "chambreRemplissage", "p": {"libelleAge": "vers 160 millions d'années"}},
        {"court": "Cristallisation", "titre": "Il cristallise lentement, 4 à 5 km sous le fond de l'océan, entre ≈ 1 200 et ≈ 1 000 °C", "quand": "De 165 à 150 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 1200, "tFin": 1000, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Remontée", "titre": "La faille de détachement fait remonter le gabbro jusqu'au fond de l'océan", "quand": "Entre 160 et 159 millions d'années", "duree": "environ 1 million d'années (≈ 1 cm par an)", "scene": "detachementDorsale", "p": {"ages": [160, 159], "suivi": "gabbro", "texte": "la faille fait remonter le gabbro jusqu'au fond de l'océan", "texteFin": "le gabbro arrive au fond"}},
        {"court": "Charriage", "titre": "À la fermeture de l'océan, une mince écaille de son fond monte sur le prisme au lieu de plonger ; la collision la soulève, l'érosion la dégage : c'est le Chenaillet", "quand": "De 50 millions d'années à aujourd'hui", "duree": "charriage en quelques millions d'années, puis érosion", "scene": "obduction", "p": {"ages": [50, 45, 35, 0]}},
      ],
      proc: "ophiolite", p: { niveau: "gabbros", profFusion: "≈ 20–60 km" },
      titres: [null, null, "Cristallisation lente au bas de la croûte océanique", null],
      cond: PT_MANTEAU({ bande: [1000, 1200, 0.17], chemin: [
        { T: 1410, P: 1.9, n: 1, t: "Sous la dorsale de l'océan alpin, le manteau remonte et fond en partie à 20–60 km." },
        { T: 1230, P: 0.17, n: 2, t: "Le liquide basaltique monte et remplit une chambre 4 à 5 km sous le fond de l'océan, lui-même sous ≈ 3,5 km d'eau." },
        { T: 1000, P: 0.17, n: 3, t: "Il cristallise lentement entre ≈ 1 200 et ≈ 1 000 °C (166–158 Ma)." },
        { T: 400, P: 0.08 },
        { T: 4, P: 0.035, n: 4, t: "La faille de détachement le ramène au fond de l'océan, en ≈ 1 million d'années (vers 160 Ma)." },
        { T: 15, P: 0, n: 5, t: "À la fermeture de l'océan, une écaille de ce fond est charriée sans plonger : au Chenaillet, on marche aujourd'hui sur un fond d'océan jurassique." }] }),
      src: ["hirschmann", "diffusion", "manatschal"],
    },
    essexite: {
      exemple: "Exemple suivi : les petites intrusions d'essexite au cœur du stratovolcan du Cantal (entre 13 et 2 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Sous le Massif central, une fusion faible du manteau, vers 70–100 km, donne un magma basique pauvre en silice", "quand": "Sous le Cantal, sans interruption", "scene": "fusionManteau", "p": {"zFusion": [70, 100], "tFusion": "1 300 à 1 400 °C", "pctFusion": 3}},
        {"court": "Montée", "titre": "Le magma monte et alimente le stratovolcan", "quand": "Il y a ≈ 8 millions d'années", "duree": "de quelques jours à quelques semaines", "scene": "monteeBasalte", "p": {"zFusion": [70, 100], "vitesse": "quelques jours à quelques semaines"}},
        {"court": "Mise en place", "titre": "Une partie se fige sous l'édifice, à 1–3 km de profondeur", "quand": "Il y a ≈ 8 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [1, 3], "age2": 8, "age3": 7.8, "labPluton": "intrusion"}},
        {"court": "Cristallisation", "titre": "Néphéline, augite et plagioclase cristallisent", "quand": "Il y a ≈ 8 millions d'années", "duree": "des milliers à des dizaines de milliers d'années", "scene": "cristallisationLente", "p": {"tDebut": 1150, "tFin": 950, "dureeCristal": "quelques milliers d'années"}},
        {"court": "Érosion", "titre": "Le volcan s'érode : l'intrusion affleure en quelques millions d'années", "quand": "Depuis ≈ 8 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [1, 3], "age3": 7.8, "couleurPluton": "#6f716a", "couleurBoules": "#77786f", "texteErosion": "le volcan s'use : ses laves et ses brèches s'en vont", "texteAffleure": "l'essexite affleure, sombre et grenue", "texteArene": "ses minéraux s'altèrent en argiles"}},
      ],
      proc: "pluton", p: { src: "manteau", prof: "≈ 1–3 km", profFusion: "≈ 70–100 km", dureeErosion: "quelques Ma" },
      titres: ["Fusion faible et profonde du manteau (magma alcalin)", null, "Cristallisation sous le volcan, à faible profondeur", "Le volcan s'érode, l'intrusion affleure"],
      cond: PT_MANTEAU({ bande: [1000, 1180, 0.05], chemin: [
        {"T": 1500, "P": 2.7, "n": 1, "t": "Sous le Massif central, une fusion faible du manteau vers 70–100 km donne un magma basique pauvre en silice."},
        {"T": 1260, "P": 0.6, "n": 2, "t": "Le magma monte et alimente le stratovolcan du Cantal."},
        {"T": 1150, "P": 0.06, "n": 3, "t": "Une partie se fige sous l'édifice, à 1–3 km (13–2 Ma)."},
        {"T": 950, "P": 0.06, "n": 4, "t": "Néphéline, augite et plagioclase cristallisent en quelques milliers d'années : la roche est grenue malgré sa faible profondeur."},
        {"T": 300, "P": 0.05},
        {"T": 15, "P": 0, "n": 5, "t": "L'érosion du volcan met ces intrusions au jour en quelques millions d'années."}] }),
      src: ["hirschmann"],
    },
    foidolite: {
      exemple: "Exemple suivi : les ijolites d'Iivaara (Finlande), localité type de cette foïdolite, dans la province alcaline dévonienne de Kola (≈ 370 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Très profond, un manteau riche en CO₂ et en alcalins fond à peine", "quand": "Vers 370 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [80, 100], "tFusion": "1 300 à 1 400 °C", "pctFusion": 1}},
        {"court": "Réservoir", "titre": "Le magma, très pauvre en silice, évolue peu", "quand": "Vers 370 millions d'années", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [41, 44], "echelle": [36, 64], "tDebut": 1250, "tFin": 1000, "liquideFin": 45, "zRes": 30, "zones": [[38, "néphélinite"], [44, "basanite"], [49, "téphrite"], [53, "phonolite"]], "lieu": "réservoir au bas de la croûte", "couleurs": ["#8f3418", "#b94a24"]}},
        {"court": "Mise en place", "titre": "Le magma s'installe vers 2–6 km ; sa chaleur transforme les roches voisines (auréole de contact)", "quand": "Vers 370 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [2, 6], "age2": 370, "age3": 368}},
        {"court": "Cristallisation", "titre": "La néphéline cristallise au lieu des feldspaths", "quand": "Vers 368 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 1050, "tFin": 900, "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Érosion", "titre": "L'érosion enlève les roches du dessus : la foïdolite affleure", "quand": "Depuis 368 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [2, 6], "age3": 368, "couleurPluton": "#8c8d7c", "couleurBoules": "#8c8d7c", "texteAffleure": "la foïdolite affleure : elle se débite en boules et s'altère en argiles", "texteArene": "les produits d'altération partent vers les rivières"}},
      ],
      proc: "pluton", p: { src: "manteau", prof: "≈ 2–6 km", profFusion: "≈ 80–120 km" },
      cond: PT_MANTEAU({ bande: [800, 1100, 0.15], chemin: [
        {"T": 1400, "P": 3.2, "n": 1, "t": "Fusion très faible d'un manteau riche en CO₂ et en alcalins, en profondeur."},
        {"T": 1200, "P": 0.8500000000000001},
        {"T": 1030, "P": 0.8, "n": 2, "t": "Le magma, très pauvre en silice, évolue peu."},
        {"T": 1010, "P": 0.15, "n": 3, "t": "Il monte vers un complexe alcalin, souvent avec des carbonatites."},
        {"T": 900, "P": 0.15, "n": 4, "t": "Il cristallise en feldspathoïdes (néphéline) au lieu de feldspaths."},
        {"T": 300, "P": 0.15},
        {"T": 15, "P": 0, "n": 5, "t": "Roche absente ou très rare en France."}] }),
      src: ["hirschmann"],
    },
    peridotite: {
      exemple: "Exemple suivi : la lherzolite de l'étang de Lers (Ariège), manteau mis à nu au fond d'un bassin pyrénéen au Crétacé (108–103 millions d'années). La lherzolite est la variété de péridotite la plus courante du manteau (olivine + deux pyroxènes) ; elle doit son nom à ce site, Lherz.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Manteau solide", "titre": "La péridotite fait partie du manteau solide, sous le continent, vers 30–60 km : elle n'a pas fondu", "quand": "Avant le Crétacé", "scene": "recristallisationFoliation", "p": {"texture": "peridotite", "sansCompression": true, "titreLoupe": "Le manteau, au microscope", "tDebut": 950, "tFin": 950, "dureeRecrist": "stable depuis très longtemps", "lignes": ["olivine (verte) et", "pyroxènes : le manteau", "solide, sous son point", "de fusion"], "legende": [["#cfdca6", "olivine"], ["#c9ae8a", "pyroxènes"], ["#2f2f2f", "spinelle"]]}},
        {"court": "Étirement", "titre": "Au Crétacé, l'Ibérie s'écarte de l'Europe : la croûte s'amincit et le manteau remonte", "quand": "De 115 à 108 millions d'années", "duree": "des millions d'années", "allonge": 1.2, "scene": "margeEtirement", "p": {"ages": [115, 108]}},
        {"court": "À nu", "titre": "Des lambeaux de manteau affleurent au fond de bassins marins, où ils sont érodés en brèches", "quand": "De 108 à 103 millions d'années", "duree": "des millions d'années", "scene": "margeManteau", "p": {"ages": [108, 103]}},
        {"court": "Collision", "titre": "L'Ibérie revient vers l'Europe : le bassin se referme, ses lambeaux de manteau sont coincés dans la chaîne ; l'érosion les dégage", "quand": "De 85 millions d'années à aujourd'hui", "duree": "des dizaines de millions d'années", "allonge": 1.3, "scene": "margeCollision", "p": {"ages": [85, 20, 0], "creteNom": "lherzolite de l'étang de Lers"}},
      ],
      proc: "manteau", p: { manteauTxt: "≈ 30–60 km" },
      titres: ["Péridotite du manteau, sous la croûte", "Crétacé : la croûte pyrénéenne s'étire", "Le manteau remonte jusqu'au fond d'un bassin", "Collision pyrénéenne et érosion"],
      cond: PT_MANTEAU({ etiquettes: [["peridotite", 1290, 1.2, -68], ["manteau partiellement fondu", 1630, 3.5], ["le manteau solide reste sous son solidus", 700, 2.4]], chemin: [
        { T: 950, P: 1.4, n: 1, t: "La péridotite fait partie du manteau solide, sous le continent, vers 30–60 km : elle n'a pas fondu, elle reste sous son solidus." },
        { T: 700, P: 0.6, n: 2, t: "Au Crétacé, l'Ibérie s'écarte de l'Europe : la croûte s'amincit et le manteau remonte." },
        { T: 150, P: 0.02, n: 3, t: "Vers 108–103 Ma, des lambeaux de manteau affleurent au fond de bassins marins, où ils sont érodés et remaniés en brèches." },
        { T: 15, P: 0, n: 4, t: "La collision pyrénéenne coince ces lambeaux dans la chaîne : la lherzolite de l'étang de Lers." }] }),
      src: ["hirschmann", "lagabrielle"],
    },
    pyroxenite: {
      exemple: "Exemple suivi : les pyroxénites de l'ophiolite du Chenaillet, cumulats du fond des chambres magmatiques de l'océan alpin.",
      animDuree: 1.2,
      animCurseur: "arrivee",
      anim: [
        {"court": "Dorsale", "titre": "Sous la dorsale de l'océan alpin, le manteau fond en partie", "quand": "Vers 160 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "manteau", "lente": true, "zoom": true, "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "le manteau remonte et fond en partie"}},
        {"court": "Chambre", "titre": "Le magma basique monte du manteau et remplit une chambre, 4 à 5 km sous le fond de l'océan", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "chambreRemplissage", "p": {"libelleAge": "vers 160 millions d'années"}},
        {"court": "Cumulats", "titre": "Les pyroxènes, denses, cristallisent parmi les premiers et s'accumulent en lits au fond de la chambre", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "chambreCristallisation", "p": {"silice": [48, 51], "tDebut": 1260, "tFin": 1200, "liquideFin": 55, "libelleAge": "vers 160 millions d'années", "labCumulats": "cumulats : la pyroxénite", "couleurs": ["#b5401f", "#c24f28"], "cristaux": [["pyroxène", "#3b463f", 0.0, 0.9], ["olivine", "#86a04c", 0.0, 0.4]], "bandes": [["#86a04c", 0.15], ["#4b554d", 1]], "zones": [[45, "gabbro"], [52, "diorite"], [63, "granodiorite"]]}},
        {"court": "Remontée", "titre": "La faille de détachement fait remonter la chambre, devenue solide, jusqu'au fond de l'océan", "quand": "Entre 160 et 159 millions d'années", "duree": "environ 1 million d'années (≈ 1 cm par an)", "scene": "detachementDorsale", "p": {"ages": [160, 159], "suivi": "cumulats", "liquideFin": 3, "bandes": [["#86a04c", 0.15], ["#4b554d", 0.55], ["#d8d2c3", 1]], "texteFin": "pyroxénite et gabbro au fond"}},
        {"court": "Charriage", "titre": "À la fermeture de l'océan, une mince écaille de son fond monte sur le prisme au lieu de plonger ; la collision la soulève, l'érosion la dégage : c'est le Chenaillet", "quand": "De 50 millions d'années à aujourd'hui", "duree": "charriage en quelques millions d'années, puis érosion", "scene": "obduction", "p": {"ages": [50, 45, 35, 0]}},
      ],
      proc: "cumulat", p: { src: "dorsale", profFusion: "≈ 20–60 km" },
      titres: ["Fusion du manteau sous une dorsale océanique", "Chambre magmatique sous la dorsale", null, "Charriage et érosion (ophiolites)"],
      pe: [{ src: "dorsale" }, { src: "dorsale" }, {}, {}],
      cond: PT_MANTEAU({ bande: [1150, 1280, 0.17], chemin: [
        { T: 1410, P: 1.9, n: 1, t: "Sous la dorsale de l'océan alpin, le manteau fond en partie." },
        { T: 1260, P: 0.17, n: 2, t: "Le magma basique remplit une chambre 4 à 5 km sous le fond de l'océan." },
        { T: 1200, P: 0.17, n: 3, t: "Les pyroxènes, denses, cristallisent parmi les premiers et s'accumulent en lits au fond de la chambre (vers 160 Ma)." },
        { T: 400, P: 0.08 },
        { T: 4, P: 0.035, n: 4, t: "La faille de détachement ramène la chambre, devenue solide, au fond de l'océan, en ≈ 1 million d'années (vers 160 Ma)." },
        { T: 15, P: 0, n: 5, t: "Charriés avec une écaille du fond de l'océan, ces lits affleurent dans les Alpes (Chenaillet)." }] }),
      src: ["hirschmann", "manatschal"],
    },
    hornblendite: {
      exemple: "Exemple suivi : les rares hornblendites du socle varisque, cumulats d'amphibole d'un magma riche en eau (345–290 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion hydratée", "titre": "L'eau abaisse le point de fusion du manteau : un magma basique riche en eau se forme", "quand": "Vers 320 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [50, 80], "tFusion": "≈ 1 250 °C (hydraté)", "pctFusion": 5, "labSurface": "croûte de la chaîne varisque"}},
        {"court": "Chambre", "titre": "Il monte dans une chambre au sein de la croûte", "quand": "Vers 320 millions d'années", "duree": "de quelques jours à quelques semaines", "scene": "monteeBasalte", "p": {"zFusion": [50, 80], "zArret": 25, "vitesse": "quelques jours à quelques semaines", "texte": "il monte et s'arrête dans une chambre de la croûte"}},
        {"court": "Cumulats d'amphibole", "titre": "En dessous d'environ 1 000 °C, l'amphibole cristallise à la place du pyroxène et s'accumule : c'est la présence d'eau qui le permet", "quand": "Vers 320 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "reservoirDifferenciation", "p": {"silice": [46, 49], "tDebut": 1120, "tFin": 980, "liquideFin": 50, "zRes": 25, "lieu": "chambre dans la croûte, vers 25 km", "couleurs": ["#b5401f", "#c24f28"], "cristaux": [["amphibole", "#2f4a38", 0.3, 0.95], ["pyroxène", "#3b463f", 0.0, 0.4]], "bandes": [["#4b554d", 0.3], ["#2f4a38", 1]], "zones": [[45, "gabbro"], [52, "diorite"], [63, "granodiorite"]]}},
        {"court": "Érosion", "titre": "Roche rare, dégagée par l'érosion du socle varisque", "quand": "Depuis 320 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [5, 10], "age3": 320, "couleurPluton": "#3f4a3e", "couleurBoules": "#4d574a", "texteAffleure": "la hornblendite affleure, sombre et grenue", "texteArene": "ses amphiboles s'altèrent en argiles"}},
      ],
      proc: "cumulat", p: { src: "manteau", profFusion: "≈ 50–80 km" },
      titres: ["Fusion d'un manteau hydraté", null, "L'amphibole cristallise et s'accumule", null],
      cond: PT_MANTEAU({ bande: [900, 1050, 0.4], chemin: [
        { T: 1250, P: 2.0, n: 1, t: "L'eau abaisse le point de fusion du manteau : un magma basique riche en eau se forme." },
        { T: 1120, P: 0.9, n: 2, t: "Il monte dans une chambre au sein de la croûte." },
        { T: 980, P: 0.4, n: 3, t: "En dessous d'environ 1 000 °C, l'amphibole cristallise à la place du pyroxène et s'accumule : c'est la présence d'eau qui le permet." },
        { T: 300, P: 0.4 }, { T: 15, P: 0, n: 4, t: "Roche rare, dans le socle varisque (345–290 Ma)." }] }),
      src: ["hirschmann"],
    },

    // ════════════════════════ M.2 volcaniques ════════════════════════
    rhyolite: {
      exemple: "Exemple suivi : les rhyolites rouges de l'Estérel (Var), à la fin de la chaîne varisque, vers 295–250 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "À la fin de la chaîne varisque, la croûte fond en partie vers 800–900 °C", "quand": "Vers 280 millions d'années", "scene": "fusionCroute", "p": {"zFusion": [25, 35], "tFusion": "800 et 900 °C", "age0": 282, "age1": 280, "labCroute": "croûte épaisse de la chaîne varisque"}},
        {"court": "Réservoir", "titre": "Très riche en silice et en gaz, le magma se stocke vers 5–8 km", "quand": "Vers 280 millions d'années", "duree": "de 1 000 à 100 000 ans", "scene": "monteeMagma", "p": {"zFusion": [25, 35], "zPluton": [5, 8], "age1": 280, "age2": 279, "labMontee": "le magma monte et se stocke vers 5–8 km"}},
        {"court": "Éruption", "titre": "Trop visqueuse pour couler loin, la lave s'empile en dômes, ou explose en nuées (ignimbrites)", "quand": "Vers 280 millions d'années", "duree": "des mois à des années", "scene": "domeExtrusion", "p": {"nom": "rhyolite", "nomDome": "dôme de rhyolite", "couleurLave": "#c98a78", "couleurMagma": "#ecac6c", "laveT": "≈ 800 °C", "explosion": true, "libelleAge": "il y a ≈ 280 millions d'années"}},
        {"court": "Refroidissement", "titre": "La lave fige : quartz et feldspath dans une pâte vitreuse ou très fine", "quand": "Vers 280 millions d'années", "duree": "de quelques jours à quelques années", "scene": "refroidissementDome", "p": {"debit": "eventail", "texture": "rhyolitique", "tDebut": 800, "libelleAge": "il y a ≈ 280 millions d'années", "legende": ["au microscope : quartz et sanidine", "dans une pâte très fine"]}},
        {"court": "Érosion", "titre": "Pendant 280 millions d'années, l'érosion dégage les rhyolites, plus dures : les reliefs rouges de l'Estérel", "quand": "De 280 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "dome", "nom": "rhyolite de l'Estérel", "couleur": "#b8604c", "couches": [["#c79a82", "tufs et grès permiens"], ["#a97a64", "grès rouges"], ["#8c6a58", ""]], "ages": [280, 0]}},
      ],
      proc: "volcan", p: { src: "croute", profFusion: "≈ 25–35 km", eruption: "dome", refroid: "dome", dureeRefroid: "jours à années" },
      titres: ["Fusion partielle de la croûte continentale", null, "Éruption d'une lave très visqueuse", null],
      cond: PT_CROUTE({ bande: [700, 900, 0.01], chemin: [
        {"T": 850, "P": 0.8, "n": 1, "t": "À la fin de la chaîne varisque, la croûte fond en partie vers 800–900 °C."},
        {"T": 820, "P": 0.2, "n": 2, "t": "Le magma, très riche en silice et en gaz, se stocke vers 5–8 km."},
        {"T": 820, "P": 0, "n": 3, "t": "Il sort vers 800–1 000 °C : trop visqueux pour couler loin, il forme des dômes ou explose en ignimbrites (Estérel, 295–250 Ma)."},
        {"T": 15, "P": 0, "n": 4, "t": "Figée en jours à années, la lave garde une pâte vitreuse ou microcristalline."},
        {"T": 15, "P": 0, "n": 5, "t": "L'érosion dégage les rhyolites, plus dures que les grès et les tufs voisins : elles forment les reliefs rouges de l'Estérel."}] }),
      src: ["tuttle", "eruption"],
    },
    dacite: {
      exemple: "Exemple suivi : les dômes de dacite du massif du Mont-Dore et du Sancy (Auvergne), entre 5 et 2 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Sous le Massif central, le manteau fond en partie : un basalte se forme", "quand": "Sous le Mont-Dore, sans interruption", "scene": "fusionManteau", "p": {"zFusion": [60, 90], "tFusion": "1 250 à 1 350 °C", "pctFusion": 5}},
        {"court": "Réservoir", "titre": "Sous le Mont-Dore, le magma perd ses cristaux et fond un peu de croûte : il devient dacite", "quand": "Avant l'éruption", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [49, 65], "tDebut": 1150, "tFin": 900, "liquideFin": 30, "assimilation": true, "zones": [[45, "basalte"], [52, "andésite basaltique"], [57, "andésite"], [63, "dacite"], [69, "rhyolite"]], "lieu": "réservoir dans la croûte, sous le Mont-Dore", "couleurs": ["#b5401f", "#e8a560"]}},
        {"court": "Dôme", "titre": "Visqueuse, la lave bâtit dômes et aiguilles", "quand": "Entre 5 et 2 millions d'années", "duree": "des mois à quelques années", "scene": "domeExtrusion", "p": {"nom": "dacite", "nomDome": "dôme de dacite", "aiguille": 40, "laveT": "≈ 900 °C", "couleurLave": "#c9c0b3", "libelleAge": "il y a ≈ 3 millions d'années"}},
        {"court": "Refroidissement", "titre": "La lave fige : plagioclases zonés et amphiboles dans une pâte vitreuse à microlitique", "quand": "Juste après la mise en place", "duree": "quelques années en surface, des siècles au cœur", "scene": "refroidissementDome", "p": {"debit": "eventail", "texture": "dacitique", "tDebut": 900, "libelleAge": "il y a ≈ 3 millions d'années", "legende": ["au microscope : plagioclases zonés", "et amphiboles, pâte fine"]}},
      ],
      proc: "volcan", p: { src: "croute", profFusion: "≈ 25–35 km", eruption: "dome", refroid: "dome" },
      titres: [null, null, "Éruption : dômes et aiguilles", null],
      cond: PT_MANTEAU({ bande: [850, 1000, 0.02], chemin: [
        {"T": 1460, "P": 2.3, "n": 1, "t": "Sous le Massif central, le manteau fond en partie : un basalte se forme."},
        {"T": 1150, "P": 0.3},
        {"T": 900, "P": 0.25, "n": 2, "t": "Dans un réservoir sous le Mont-Dore, le magma perd ses premiers cristaux et assimile de la croûte : il devient dacite."},
        {"T": 900, "P": 0, "n": 3, "t": "Visqueux, il sort à une température intermédiaire entre andésites et rhyolites et bâtit dômes et aiguilles (Mont-Dore, Sancy, 5–2 Ma)."},
        {"T": 15, "P": 0, "n": 4, "t": "Il se fige en une pâte vitreuse à microlitique."}] }),
      src: ["tuttle", "eruption", "hirschmann"],
    },
    trachyte: {
      proc: "volcan", p: { src: "manteau", eruption: "dome", refroid: "dome" },
      titres: [null, "Évolution dans un réservoir : le magma s'enrichit en feldspath", "Éruption : un dôme de lave visqueuse", null],
      // C.2 animé (18/09/2026) : prototype des DÔMES (puy de Dôme)
      exemple: "Exemple suivi : le puy de Dôme (chaîne des Puys, Auvergne), il y a environ 11 000 ans.",
      animCurseur: "arrivee",
      anim: [
        { court: "Fusion", titre: "Sous la chaîne des Puys, le manteau fond en partie : un basalte alcalin se forme",
          quand: "Sous le Massif central, sans interruption",
          scene: "fusionManteau", p: { zFusion: [60, 90], tFusion: "1 250 à 1 350 °C", pctFusion: 5 } },
        { court: "Réservoir", titre: "À 10–12 km, le basalte perd ses cristaux : le liquide qui reste devient trachyte",
          quand: "Avant l'éruption", duree: "des milliers à des dizaines de milliers d'années (ordre de grandeur)",
          scene: "reservoirDifferenciation", p: { silice: [47, 65], tDebut: 1150, tFin: 800, liquideFin: 20, zRes: 11,
            lieu: "réservoir à 10–12 km sous la chaîne des Puys" } },
        { court: "Dôme", titre: "Trop visqueuse pour couler, la lave s'empile en dôme au-dessus de sa bouche",
          quand: "Il y a environ 11 000 ans ; dernière éruption il y a ≈ 10 700 ans", duree: "des mois à quelques années pour chaque poussée",
          scene: "domeExtrusion", p: { nom: "trachyte", cote: "≈ 450 m", laveT: "≈ 800 °C", cones: true, explosion: true,
            libelleAge: "il y a ≈ 11 000 ans", libelleExplosion: "il y a ≈ 10 700 ans" } },
        { court: "Refroidissement", titre: "Le dôme refroidit de la surface vers le cœur ; ses baguettes de feldspath restent alignées par l'écoulement",
          quand: "Depuis sa mise en place", duree: "quelques années en surface, quelques milliers d'années au cœur",
          scene: "refroidissementDome", p: { debit: "eventail", texture: "trachytique", tDebut: 800, libelleAge: "il y a ≈ 10 700 ans",
            legende: ["au microscope : baguettes de feldspath", "alignées par l'écoulement"] } },
      ],
      cond: PT_MANTEAU({ bande: [700, 900, 0.02], chemin: [
        { T: 1480, P: 2.5, n: 1, t: "Sous la chaîne des Puys, le manteau fond en partie : un basalte alcalin se forme." },
        { T: 1150, P: 0.33 },
        { T: 800, P: 0.33, n: 2, t: "Stocké à 10–12 km (300–350 MPa), le basalte perd olivine, pyroxène et plagioclase : le liquide restant devient trachyte, vers 700–825 °C, avec jusqu'à 8 % d'eau (Martel et al. 2013)." },
        { T: 790, P: 0.0, n: 3, t: "Trop visqueux pour couler, il s'empile en dôme : le puy de Dôme, il y a ≈ 11 000 ans ; sa dernière éruption, explosive, date d'≈ 10 700 ans (Miallier et al. 2010)." },
        { T: 15, P: 0, n: 4, t: "Le dôme refroidit en quelques années en surface, en quelques milliers d'années au cœur (t ≈ L²/κ) ; ses baguettes de feldspath restent alignées par l'écoulement : c'est la texture « trachytique »." }] }),
      src: ["hirschmann", "martel2013", "miallier2010", "diffusion"],
    },
    obsidienne: {
      exemple: "Exemple suivi : la coulée d'obsidienne des Rocche Rosse, sur l'île de Lipari (Italie), vers 1230.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Sous l'arc des îles Éoliennes, la croûte fond en partie : un liquide très riche en silice se forme", "quand": "Sous Lipari, sans interruption", "scene": "fusionCroute", "p": {"zFusion": [20, 30], "tFusion": "800 et 900 °C", "age0": 0.01, "age1": 0.01, "labCroute": "croûte sous l'arc des îles Éoliennes", "libelleAge": "avant 1230"}},
        {"court": "Réservoir", "titre": "Stocké vers 5–8 km, le magma perd une partie de ses gaz", "quand": "Avant l'éruption", "duree": "des siècles à des milliers d'années", "scene": "monteeMagma", "p": {"zFusion": [20, 30], "zPluton": [5, 8], "age1": 0.01, "age2": 0.01, "labMontee": "le magma monte, se stocke et perd ses gaz", "libelleAge": "avant 1230", "dureeMontee": "des siècles"}},
        {"court": "Éruption", "titre": "La lave rhyolitique, très visqueuse, sort et s'empile en coulée épaisse", "quand": "Vers 1230", "duree": "des semaines à des mois", "scene": "domeExtrusion", "p": {"nom": "rhyolite", "nomDome": "coulée de rhyolite", "couleurLave": "#4a4642", "couleurMagma": "#e9a15a", "laveT": "≈ 800 °C", "libelleAge": "vers 1230"}},
        {"court": "Trempe", "titre": "Elle refroidit trop vite pour que les atomes s'ordonnent : un verre se forme au lieu de cristaux", "quand": "Juste après l'éruption", "duree": "des heures à des jours", "scene": "refroidissementDome", "p": {"debit": "dalles", "texture": "verre", "tDebut": 800, "libelleAge": "vers 1230", "legende": ["au microscope : du verre, presque", "sans cristaux ; fissures courbes"]}},
      ],
      proc: "volcan", p: { src: "croute", eruption: "dome", refroid: "verre", dureeRefroid: "heures à jours" },
      titres: ["Fusion partielle de la croûte continentale", null, "Éruption d'une lave rhyolitique", "Trempe : la lave se fige en verre"],
      cond: PT_CROUTE({ bande: [700, 900, 0.01], chemin: [
        {"T": 850, "P": 0.7, "n": 1, "t": "Sous l'arc des îles Éoliennes, la croûte fond en partie : un liquide très riche en silice se forme."},
        {"T": 820, "P": 0.2, "n": 2, "t": "Stocké vers 5–8 km, il perd une partie de ses gaz : il n'explosera pas, il s'épanchera."},
        {"T": 800, "P": 0, "n": 3, "t": "La lave rhyolitique sort vers 800 °C et forme la coulée épaisse des Rocche Rosse (Lipari), vers 1230."},
        {"T": 15, "P": 0, "n": 4, "t": "Elle refroidit trop vite pour que les atomes s'ordonnent : un verre se forme au lieu de cristaux. Quasi absente de France."}] }),
      src: ["tuttle", "eruption"],
    },
    andesite: {
      proc: "volcan", p: { src: "manteau", eruption: "strato", refroid: "dome" },
      titres: [null, "Évolution dans un réservoir de la croûte", "Éruption d'un stratovolcan", null],
      // C.2 animé (18/09/2026) : prototype des ARCS (subduction). Les « andésites » du Cantal et du Mont-Dore sont surtout des
      // trachyandésites (série alcaline) : l'exemple suivi est une vraie andésite de subduction, la montagne Pelée.
      exemple: "Exemple suivi : la montagne Pelée (Martinique), volcan d'arc au-dessus d'une plaque qui plonge ; éruption de 1902.",
      animCurseur: "arrivee",
      anim: [
        { court: "Fusion", titre: "La plaque atlantique plonge sous les Antilles : l'eau qu'elle libère fait fondre le manteau au-dessus d'elle",
          quand: "Sous la Martinique, sans interruption",
          scene: "fusionCoinManteau", p: {} },
        { court: "Réservoir", titre: "À 7–8 km sous le volcan, le basalte perd ses cristaux et fond un peu de croûte : il devient andésite",
          quand: "Avant chaque éruption", duree: "des milliers d'années (ordre de grandeur)", allonge: 1.3,
          scene: "reservoirDifferenciation", p: { silice: [50, 61], tDebut: 1150, tFin: 890, liquideFin: 50, zRes: 7.5, assimilation: true,
            lieu: "réservoir à 7–8 km sous la montagne Pelée", couleurs: ["#b5401f", "#df8a4c"],
            zones: [[45, "basalte"], [52, "andésite basaltique"], [57, "andésite"], [63, "dacite"], [69, "rhyolite"]] } },
        { court: "Dôme et nuée", titre: "1902 : une nuée ardente détruit Saint-Pierre, puis un dôme hérissé d'une aiguille pousse dans le cratère",
          quand: "De mai 1902 à 1903", duree: "plus d'un an",
          scene: "domeExtrusion", p: { nom: "andésite", nomDome: "dôme d'andésite", hauteur: 46, demiLargeur: 72, aiguille: 46, cratere: true,
            aiguilleTexte: "aiguille : lave déjà solide, poussée d'un bloc", explosion: true, explosionT: [0.08, 0.26],
            nueeLointaine: "nuée ardente vers Saint-Pierre", laveT: "≈ 880 °C", libelleAge: "1902–1903",
            texte: "une nuée ardente dévale la pente, puis la lave visqueuse s'empile" } },
        { court: "Refroidissement", titre: "L'andésite fige : grands cristaux de plagioclase zonés et de pyroxène dans une pâte de microlites",
          quand: "Depuis 1902–1903", duree: "quelques années en surface, des siècles au cœur",
          scene: "refroidissementDome", p: { debit: "eventail", texture: "andesitique", tDebut: 880, hauteur: 46, demiLargeur: 72, cratere: true, aiguille: 46,
            libelleAge: "1903", legende: ["au microscope : plagioclases zonés", "et pyroxènes, pâte de microlites"] } },
      ],
      cond: PT_MANTEAU({ courbes: ["peridotite", "peridotiteEau"], bande: [850, 1000, 0.02],
        etiquettes: [["peridotite", 1420, 2.4, -68], ["peridotiteEau", 770, 3.0, -84], ["manteau partiellement fondu", 1630, 3.5]], chemin: [
        { T: 1300, P: 3.0, n: 1, t: "La plaque atlantique plonge sous les Antilles. Vers 100 km, elle perd son eau, qui abaisse la température de fusion du manteau situé au-dessus : à ≈ 1 300 °C, sec il resterait solide (≈ 1 450 °C), hydraté il fond (dès 800–860 °C, Grove et al. 2006)." },
        { T: 1150, P: 0.25 },
        { T: 890, P: 0.2, n: 2, t: "Stocké à 7–8 km (200 MPa) sous la montagne Pelée, le magma perd ses cristaux et fond un peu de croûte : il devient andésite, à 875–900 °C avec 5 à 6 % d'eau (Pichavant et al. 2002)." },
        { T: 880, P: 0.0, n: 3, t: "Le 8 mai 1902, une nuée ardente détruit Saint-Pierre (≈ 28 000 morts) ; un dôme hérissé d'une aiguille pousse ensuite dans le cratère." },
        { T: 15, P: 0, n: 4, t: "Figée, la lave montre de grands plagioclases zonés et des pyroxènes dans une pâte de microlites. Les « andésites » du Cantal et du Mont-Dore sont surtout des trachyandésites." }] }),
      src: ["hirschmann", "grove2006", "pichavant2002", "eruption"],
    },
    trachyandesite: {
      proc: "volcan", p: { src: "manteau", eruption: "strato", refroid: "dome" },
      titres: [null, "Évolution dans un réservoir de la croûte", "Éruption : coulées et brèches du stratovolcan", null],
      // C.2 animé (18/09/2026) : prototype des STRATOVOLCANS (Cantal, Nehlig et al. 2001), à l'échelle vraie
      exemple: "Exemple suivi : le stratovolcan du Cantal, le plus vaste d'Europe, édifié surtout entre 8,5 et 7 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        { court: "Fusion", titre: "Sous le Massif central, le manteau fond en partie : un basalte alcalin se forme",
          quand: "Sous le Massif central, sans interruption",
          scene: "fusionManteau", p: { zFusion: [60, 90], tFusion: "1 250 à 1 350 °C", pctFusion: 5 } },
        { court: "Réservoir", titre: "Dans un réservoir de la croûte, le basalte perd ses cristaux : le liquide qui reste devient trachyandésite",
          quand: "Avant les éruptions", duree: "des milliers à des dizaines de milliers d'années (ordre de grandeur)", allonge: 1.3,
          scene: "reservoirDifferenciation", p: { silice: [47, 58], tDebut: 1150, tFin: 1000, liquideFin: 45, lieu: "réservoir dans la croûte, sous le Cantal",
            couleurs: ["#b5401f", "#d9793a"] } },
        { court: "Construction", titre: "Coulées, brèches et cendres bâtissent, lit par lit, un volcan de 25 km de diamètre et de plus de 3 000 m",
          quand: "De 8,5 à 7 millions d'années", duree: "quelques centaines de milliers d'années par phase de construction", allonge: 1.5,
          scene: "stratovolcanConstruction", p: { ages: [8.5, 7] } },
        { court: "Figement", titre: "La lave fige : grands cristaux de plagioclase dans une pâte de microlites",
          quand: "Après chaque coulée", duree: "de quelques jours à quelques années",
          scene: "refroidissementCoulee", p: { libelleAge: "il y a ≈ 7,5 millions d'années", dureeRefroid: "de quelques jours à quelques années",
            phenos: [["plagioclase", 7], ["pyroxene", 3]], legende: ["au microscope : grands plagioclases", "dans une pâte de microlites"] } },
        { court: "Effondrement", titre: "Trop haut et trop raide, le volcan perd un flanc : une avalanche de débris s'étale sur des dizaines de kilomètres",
          quand: "Vers 7 millions d'années", duree: "quelques minutes", allonge: 1.2,
          scene: "stratovolcanEffondrement", p: { ages: [8.5, 7] } },
        { court: "Érosion", titre: "Rivières puis glaciers creusent le volcan en étoile : il reste les crêtes du puy Mary et du plomb du Cantal",
          quand: "De 7 millions d'années à aujourd'hui", duree: "7 millions d'années",
          scene: "stratovolcanErosion", p: { ages: [8.5, 7] } },
      ],
      cond: PT_MANTEAU({ bande: [950, 1100, 0.02], chemin: [
        { T: 1480, P: 2.5, n: 1, t: "Sous le Massif central, le manteau fond en partie : un basalte alcalin se forme." },
        { T: 1150, P: 0.3 },
        { T: 1000, P: 0.25, n: 2, t: "Dans un réservoir de la croûte, le basalte perd olivine, pyroxène et plagioclase : le liquide restant devient trachyandésite." },
        { T: 1000, P: 0.0, n: 3, t: "Entre 8,5 et 7 Ma, coulées, brèches et cendres bâtissent un volcan de 25 km de diamètre et de plus de 3 000 m (Nehlig et al. 2001)." },
        { T: 15, P: 0, n: 4, t: "La lave fige en jours à années : grands cristaux de plagioclase dans une pâte de microlites." },
        { T: 15, P: 0, n: 5, t: "Trop haut et trop raide, le volcan perd un flanc : l'avalanche de débris s'étale sur des dizaines de kilomètres. Chaque phase de construction du Cantal s'est terminée ainsi." },
        { T: 15, P: 0, n: 6, t: "Rivières puis glaciers creusent le volcan en étoile : restent les crêtes du puy Mary et du plomb du Cantal. Le Mont-Dore (3–0,25 Ma) a la même histoire, plus jeune." }] }),
      src: ["hirschmann", "nehlig2001", "eruption"],
    },
    latite: {
      exemple: "Exemple suivi : les coulées de latite de l'Estérel (Var), au Permien, entre 300 et 270 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "À la fin de la chaîne varisque, un manteau enrichi en potassium fond en partie", "quand": "Vers 285 millions d'années", "scene": "fusionManteau", "p": {"zFusion": [60, 90], "tFusion": "1 250 à 1 350 °C", "pctFusion": 5}},
        {"court": "Réservoir", "titre": "Dans la croûte, le magma perd ses premiers cristaux et s'enrichit en potassium", "quand": "Avant l'éruption", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [48, 58], "tDebut": 1150, "tFin": 1000, "liquideFin": 45, "zones": [[45, "basalte"], [52, "trachybasalte"], [57, "trachyandésite"], [63, "trachyte"]], "lieu": "réservoir dans la croûte, sous l'Estérel", "couleurs": ["#b5401f", "#d4733a"]}},
        {"court": "Éruption", "titre": "La lave sort et s'étale en coulées dans le bassin permien", "quand": "Vers 285 millions d'années", "duree": "de quelques jours à quelques mois", "scene": "eruptionCoulee", "p": {"laveT": "≈ 1 000 °C", "libelleAge": "il y a ≈ 285 millions d'années"}},
        {"court": "Refroidissement", "titre": "La coulée fige : plagioclase et feldspath potassique à parts proches, dans une pâte fine", "quand": "Juste après l'éruption", "duree": "de quelques jours à quelques années", "scene": "refroidissementCoulee", "p": {"libelleAge": "il y a ≈ 285 millions d'années", "dureeRefroid": "de quelques jours à quelques années", "phenos": [["plagioclase", 5], ["pyroxene", 3]], "legende": ["au microscope : plagioclase, sanidine", "et pyroxène dans une pâte fine"]}},
        {"court": "Érosion", "titre": "Plus dure que les grès rouges qui l'entourent, la coulée reste en relief", "quand": "De 285 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "coulee", "nom": "coulée de latite", "couleur": "#7d6a62", "couches": [["#c79a82", "grès rouges permiens"], ["#a97a64", "grès et pélites"], ["#8c6a58", ""]], "ages": [285, 0]}},
      ],
      proc: "volcan", p: { src: "manteau", eruption: "strato", refroid: "dome" },
      cond: PT_MANTEAU({ bande: [900, 1100, 0.02], chemin: [
        {"T": 1470, "P": 2.4, "n": 1, "t": "Un manteau enrichi en potassium fond en partie, à la fin de la chaîne varisque."},
        {"T": 1150, "P": 0.3},
        {"T": 1000, "P": 0.25, "n": 2, "t": "Le magma évolue dans la croûte et s'enrichit en potassium."},
        {"T": 1000, "P": 0, "n": 3, "t": "Éruptions permiennes de l'Estérel (300–270 Ma)."},
        {"T": 15, "P": 0, "n": 4, "t": "Figée en une pâte fine : plagioclase et feldspath potassique à parts proches."},
        {"T": 15, "P": 0, "n": 5, "t": "L'érosion dégage les coulées, plus dures que les grès rouges voisins."}] }),
      src: ["hirschmann", "eruption"],
    },
    phonolite: {
      exemple: "Exemple suivi : le mont Gerbier-de-Jonc (Ardèche), suc de phonolite du massif du Mézenc, dans le volcanisme alcalin du Velay (entre 13 et 2 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Très profond, le manteau fond à peine : un basalte pauvre en silice se forme", "quand": "Sous le Velay, sans interruption", "scene": "fusionManteau", "p": {"zFusion": [80, 100], "tFusion": "1 350 à 1 450 °C", "pctFusion": 2}},
        {"court": "Réservoir", "titre": "En évoluant, le liquide devient riche en alcalins sans jamais pouvoir former de quartz : la néphéline apparaît", "quand": "Avant l'éruption", "duree": "des milliers à des dizaines de milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [44, 56], "echelle": [38, 66], "tDebut": 1150, "tFin": 900, "liquideFin": 20, "zones": [[38, "néphélinite"], [44, "basanite"], [49, "téphrite"], [53, "phonolite"]], "lieu": "réservoir dans la croûte, sous le Velay", "couleurs": ["#9e3a1c", "#dba16a"]}},
        {"court": "Extrusion", "titre": "Visqueuse, la lave s'extrude en dôme et en aiguille", "quand": "Il y a quelques millions d'années", "duree": "des mois à quelques années", "scene": "domeExtrusion", "p": {"nom": "phonolite", "nomDome": "dôme de phonolite", "aiguille": 30, "laveT": "≈ 900 °C", "couleurLave": "#b9bca8", "libelleAge": "il y a quelques millions d'années"}},
        {"court": "Refroidissement", "titre": "La lave se débite en dalles minces qui « sonnent » au marteau", "quand": "Juste après la mise en place", "duree": "quelques années en surface, des siècles au cœur", "scene": "refroidissementDome", "p": {"debit": "dalles", "texture": "phonolitique", "tDebut": 900, "libelleAge": "il y a quelques millions d'années", "legende": ["au microscope : néphéline, feldspath", "et aiguilles d'ægyrine"]}},
        {"court": "Érosion", "titre": "Les scories et les roches tendres autour s'en vont : il reste le suc, pointu", "quand": "Des millions d'années jusqu'à aujourd'hui", "scene": "degagement", "p": {"forme": "suc", "dalles": true, "nom": "le suc (Gerbier-de-Jonc)", "couleur": "#a6a894", "couches": [["#8a6a58", "scories et tufs"], ["#9c8a70", "vieux socle altéré"], ["#8a7c66", ""]], "ages": [7, 0], "texteFin": "plus dure, la phonolite reste en pain de sucre : un « suc »"}},
      ],
      proc: "volcan", p: { src: "manteau", eruption: "dome", refroid: "dome", profFusion: "≈ 80–100 km" },
      titres: ["Fusion faible et profonde du manteau", "Évolution dans un réservoir", "Éruption : aiguilles et dômes", null],
      cond: PT_MANTEAU({ bande: [850, 1050, 0.02], chemin: [
        {"T": 1520, "P": 2.9, "n": 1, "t": "Une fusion très faible du manteau donne un basalte pauvre en silice."},
        {"T": 1150, "P": 0.6},
        {"T": 900, "P": 0.6, "n": 2, "t": "En évoluant, le liquide devient riche en alcalins sans jamais pouvoir former de quartz : la néphéline apparaît."},
        {"T": 900, "P": 0, "n": 3, "t": "Visqueuse, la lave s'extrude en aiguilles et en sucs : Gerbier-de-Jonc, rocher d'Aiguilhe (13–2 Ma)."},
        {"T": 15, "P": 0, "n": 4, "t": "Elle se fige en dalles litées qui « sonnent » au marteau (d'où son nom)."},
        {"T": 15, "P": 0, "n": 5, "t": "Plus dure que les scories et les roches voisines, elle reste en relief quand elles s'érodent : les sucs du Velay et du Mézenc."}] }),
      src: ["hirschmann", "eruption"],
    },
    basalte: {
      proc: "volcan", p: { src: "manteau", profFusion: "≈ 60–100 km", eruption: "coulee", refroid: "orgues", laveT: "≈ 1 100–1 200 °C" },
      titres: ["Fusion partielle du manteau", null, "Éruption effusive : coulées fluides", "Refroidissement rapide : microlites, verre, orgues"],
      // C.2 animé (17/09/2026) : prototype volcanique
      exemple: "Exemple suivi : une coulée de la chaîne des Puys (Auvergne), il y a environ 8 400 ans.",
      anim: [
        { court: "Fusion", titre: "Le manteau qui remonte fond en partie, vers 60 à 100 km",
          quand: "Sous le Massif central, sans interruption",
          scene: "fusionManteau", p: { zFusion: [60, 100], tFusion: "1 250 à 1 350 °C", pctFusion: 8 } },
        { court: "Montée", titre: "Le magma ouvre une fracture et monte vite",
          quand: "Quelques semaines avant l'éruption", duree: "de quelques jours à quelques semaines",
          scene: "monteeBasalte", p: { zFusion: [60, 100], vitesse: "quelques jours à quelques semaines" } },
        { court: "Éruption", titre: "La lave jaillit en fontaine et s'étale en coulée",
          quand: "Il y a environ 8 400 ans", duree: "de quelques jours à quelques mois",
          scene: "eruptionCoulee", p: { age: 0.0084, laveT: "1 100 à 1 200 °C", libelleAge: "il y a ≈ 8 400 ans" } },
        { court: "Refroidissement", titre: "La coulée fige : croûte noire, microlites, puis prismes",
          quand: "Juste après l'éruption", duree: "de quelques jours à quelques années",
          scene: "refroidissementCoulee", p: { libelleAge: "il y a ≈ 8 400 ans", dureeRefroid: "de quelques jours à quelques années" } },
      ],
      cond: PT_MANTEAU({ bande: [1050, 1200, 0.02], chemin: [
        { T: 1470, P: 2.4, n: 1, t: "En remontant, le manteau franchit son solidus vers 60–100 km : quelques pour cent de liquide basaltique se forment entre les grains." },
        { T: 1300, P: 0.8, n: 2, t: "Le liquide monte et se stocke au bas de la croûte ou dans la croûte ; la montée finale prend des heures à des mois." },
        { T: 1150, P: 0.0, n: 3, t: "La lave sort vers 1 100–1 200 °C et s'étale en coulées ; le volcanisme du Massif central court jusqu'au Pavin, il y a ≈ 6 900 ans." },
        { T: 15, P: 0, n: 4, t: "Elle se fige en heures (croûte) à années (cœur d'une coulée de quelques mètres) : microlites, verre et prismes de retrait." }] }),
      src: ["hirschmann", "eruption", "diffusion"],
    },
    trachybasalte: {
      proc: "volcan", p: { src: "manteau", profFusion: "≈ 60–100 km", eruption: "coulee", refroid: "orgues" },
      titres: ["Fusion partielle du manteau", null, "Éruption : coulées de la chaîne des Puys", null],
      exemple: "Exemple suivi : les coulées de la chaîne des Puys, entre ≈ 15 000 et ≈ 8 500 ans : la plupart sont des trachybasaltes.",
      anim: [
        { court: "Fusion", titre: "Le manteau qui remonte fond en partie, vers 60 à 100 km",
          quand: "Sous le Massif central, sans interruption",
          scene: "fusionManteau", p: { zFusion: [60, 100], tFusion: "1 250 à 1 350 °C", pctFusion: 6 } },
        { court: "Réservoir", titre: "Arrêté un temps dans la croûte, le basalte perd un peu d'olivine et de pyroxène : il devient trachybasalte",
          quand: "Avant l'éruption", duree: "des centaines à des milliers d'années (ordre de grandeur)",
          scene: "reservoirDifferenciation", p: { silice: [46, 50], tDebut: 1200, tFin: 1130, liquideFin: 75, lieu: "réservoir dans la croûte, sous la chaîne des Puys",
            couleurs: ["#b5401f", "#c24f28"] } },
        { court: "Éruption", titre: "Fontaines de lave, cône de scories, puis la coulée s'étale",
          quand: "Entre ≈ 15 000 et ≈ 8 500 ans", duree: "de quelques jours à quelques mois",
          scene: "eruptionCoulee", p: { laveT: "1 100 à 1 150 °C", libelleAge: "il y a 15 000 à 8 500 ans" } },
        { court: "Refroidissement", titre: "La coulée fige : croûte, microlites, prismes",
          quand: "Juste après l'éruption", duree: "de quelques jours à quelques années",
          scene: "refroidissementCoulee", p: { libelleAge: "il y a 15 000 à 8 500 ans", dureeRefroid: "de quelques jours à quelques années",
            phenos: [["olivine", 3], ["plagioclase", 3]] } },
      ],
      cond: PT_MANTEAU({ bande: [1050, 1180, 0.02], chemin: [
        { T: 1490, P: 2.6, n: 1, t: "Le manteau fond en partie sous le Massif central." },
        { T: 1280, P: 0.8, n: 2, t: "Arrêté dans la croûte, le basalte perd un peu d'olivine et de pyroxène : il s'enrichit légèrement en silice et en alcalins." },
        { T: 1130, P: 0.0, n: 3, t: "Coulées de l'Aubrac (9–6 Ma), du Cantal et de la chaîne des Puys (95 000 à ≈ 6 900 ans ; la plupart entre 15 000 et 8 500 ans)." },
        { T: 15, P: 0, n: 4, t: "Refroidissement en heures à années." }] }),
      src: ["hirschmann", "eruption", "diffusion"],
    },
    basanite: {
      proc: "volcan", p: { src: "manteau", profFusion: "≈ 80–100 km", eruption: "coulee", refroid: "orgues" },
      titres: ["Fusion très faible et profonde du manteau", null, "Éruption : coulées et cônes", null],
      exemple: "Exemple suivi : les coulées du plateau du Devès (Haute-Loire), le plus vaste plateau basaltique du Massif central.",
      anim: [
        { court: "Fusion", titre: "Très profond, vers 80–100 km, le manteau fond à peine : un liquide pauvre en silice se forme",
          quand: "Sous le Velay, sans interruption",
          scene: "fusionManteau", p: { zFusion: [80, 100], tFusion: "1 350 à 1 450 °C", pctFusion: 3 } },
        { court: "Montée", titre: "Le magma monte vite, sans s'arrêter : il n'a presque pas le temps d'évoluer",
          quand: "Quelques semaines avant l'éruption", duree: "de quelques jours à quelques semaines",
          scene: "monteeBasalte", p: { zFusion: [80, 100], vitesse: "quelques jours à quelques semaines" } },
        { court: "Éruption", titre: "La lave jaillit et s'étale en coulées qui pavent le plateau",
          quand: "Entre 3,5 et 0,6 million d'années, surtout vers 2 et 1 million d'années", duree: "de quelques jours à quelques mois",
          scene: "eruptionCoulee", p: { age: 1.5, laveT: "1 150 à 1 200 °C" } },
        { court: "Refroidissement", titre: "La coulée fige : olivine et néphéline dans une pâte vitreuse, puis prismes",
          quand: "Juste après l'éruption", duree: "de quelques jours à quelques années",
          scene: "refroidissementCoulee", p: { age: 1.5, dureeRefroid: "de quelques jours à quelques années", phenos: [["olivine", 6]],
            legende: ["au microscope : olivine et néphéline", "dans une pâte vitreuse"] } },
      ],
      cond: PT_MANTEAU({ bande: [1050, 1200, 0.02], chemin: [
        { T: 1530, P: 3.0, n: 1, t: "Une fusion très faible (quelques pour cent), vers 80–100 km, donne un liquide pauvre en silice." },
        { T: 1280, P: 0.8, n: 2, t: "Le magma monte vite, sans beaucoup évoluer." },
        { T: 1150, P: 0.0, n: 3, t: "Il pave le plateau du Devès, actif surtout entre 3,5 et 0,6 Ma (paroxysmes vers 2 et 1 Ma), et une partie de la chaîne des Puys." },
        { T: 15, P: 0, n: 4, t: "Feldspathoïdes (néphéline) et olivine dans une pâte vitreuse." }] }),
      src: ["hirschmann", "eruption", "diffusion"],
    },
    picrite: {
      proc: "volcan", p: { src: "manteau", profFusion: "≈ 80–120 km", eruption: "coulee", refroid: "orgues", laveT: "≈ 1 150–1 200 °C" },
      titres: ["Fusion importante d'un manteau très chaud", null, "Éruption d'une lave chargée d'olivine", null],
      exemple: "Exemple suivi : les « océanites » du Piton de la Fournaise (La Réunion), éruption d'avril 2007.",
      anim: [
        { court: "Fusion", titre: "Sous La Réunion, un panache de manteau plus chaud que la moyenne fond largement",
          quand: "Sous le point chaud, sans interruption",
          scene: "fusionManteau", p: { ocean: true, ile: true, zFusion: [80, 100], tFusion: "≈ 1 450 à 1 550 °C", pctFusion: 12 } },
        { court: "Montée", titre: "Le magma monte ; en chemin, il se charge de cristaux d'olivine accumulés dans le réservoir",
          quand: "Avant l'éruption", duree: "de quelques jours à quelques semaines",
          scene: "monteeBasalte", p: { ocean: true, ile: true, zFusion: [80, 100], vitesse: "quelques jours à quelques semaines" } },
        { court: "Éruption", titre: "Avril 2007 : fontaines de lave et coulées chargées d'olivine, jusqu'à la mer",
          quand: "Avril 2007", duree: "un mois",
          scene: "eruptionCoulee", p: { laveT: "≈ 1 150 à 1 200 °C", libelleAge: "avril 2007", mer: true } },
        { court: "Refroidissement", titre: "La coulée fige : de gros cristaux d'olivine (plus de 20 %) dans le basalte",
          quand: "Juste après l'éruption", duree: "de quelques jours à quelques années",
          scene: "refroidissementCoulee", p: { libelleAge: "avril 2007", dureeRefroid: "de quelques jours à quelques années", phenos: [["olivine", 14]],
            legende: ["au microscope : gros cristaux d'olivine", "dans une pâte de microlites"] } },
      ],
      cond: PT_MANTEAU({ bande: [1100, 1300, 0.02], chemin: [
        { T: 1550, P: 3.2, n: 1, t: "Sous La Réunion, un panache de manteau plus chaud que la moyenne fond davantage : le liquide est riche en magnésium." },
        { T: 1300, P: 0.8, n: 2, t: "L'olivine cristallise tôt et s'accumule dans le réservoir ; le magma suivant l'emporte en montant." },
        { T: 1180, P: 0.0, n: 3, t: "En avril 2007, le Piton de la Fournaise émet des « océanites » : des basaltes chargés de plus de 20 % de cristaux d'olivine, souvent hérités du réservoir." },
        { T: 15, P: 0, n: 4, t: "Figée avec plus de 15 à 20 % d'olivine : c'est une picrite au sens large." }] }),
      src: ["hirschmann", "eruption"],
    },
    komatiite: {
      exemple: "Exemple suivi : les komatiites de la rivière Komati (Barberton, Afrique du Sud), il y a environ 3,5 milliards d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion profonde", "titre": "Dans la Terre archéenne, plus chaude, un panache du manteau fond largement, dès plus de 200 km", "quand": "Il y a ≈ 3,5 milliards d'années", "scene": "fusionManteau", "p": {"profond": true, "zFusion": [100, 230], "tFusion": "≈ 1 800 °C, dès plus de 200 km", "pctFusion": 40, "labSurface": "croûte archéenne"}},
        {"court": "Montée", "titre": "Le liquide, très riche en magnésium, monte rapidement", "quand": "Il y a ≈ 3,5 milliards d'années", "duree": "quelques jours", "scene": "monteeBasalte", "p": {"profond": true, "zFusion": [100, 230], "vitesse": "quelques jours"}},
        {"court": "Éruption", "titre": "Il sort à près de 1 600 °C, d'une fluidité exceptionnelle pour une lave", "quand": "Il y a ≈ 3,5 milliards d'années", "duree": "quelques jours", "scene": "eruptionCoulee", "p": {"laveT": "≈ 1 600 °C", "libelleAge": "il y a ≈ 3,5 milliards d'années", "lave": ["#f07a2a", "#fbd48a"], "fissure": true}},
        {"court": "Spinifex", "titre": "Trempée, la lave se fige en gerbes d'aiguilles d'olivine : la texture spinifex", "quand": "Juste après l'éruption", "duree": "quelques heures à quelques jours", "scene": "refroidissementCoulee", "p": {"libelleAge": "il y a ≈ 3,5 milliards d'années", "dureeRefroid": "quelques heures à quelques jours", "spinifex": true, "legende": ["au microscope : longues aiguilles", "d'olivine en gerbes (spinifex)"]}},
      ],
      proc: "komatiite", p: { profFusion: "≈ 200 km et plus" },
      cond: { type: "pt", echelle: "profond", fondu: ["peridotite"], courbes: ["peridotite", "diamant"],
        etiquettes: [["peridotite", 1560, 3.2, -52], ["diamant", 1200, 5.2, -12], ["graphite", 1500, 4.1, -12]], bande: [1250, 1600, 0.05], chemin: [
        { T: 1850, P: 7.0, n: 1, t: "Dans la Terre archéenne, plus chaude, un panache du manteau fond déjà à plus de 200 km." },
        { T: 1700, P: 2.0, n: 2, t: "Le liquide, très riche en magnésium, monte rapidement." },
        { T: 1600, P: 0.0, n: 3, t: "Il sort à près de 1 600 °C, d'une fluidité exceptionnelle pour une lave, il y a plus de 2,5 milliards d'années." },
        { T: 15, P: 0, n: 4, t: "Trempé, il se fige en gerbes d'aiguilles d'olivine (spinifex). Aucune komatiite en France." }] },
      src: ["hirschmann", "kennedy", "arndt"],
    },
    kimberlite: {
      exemple: "Exemple suivi : les kimberlites de Kimberley (Afrique du Sud), dont le « Big Hole », vers 90 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion très profonde", "titre": "Sous les vieux continents, à 150–250 km, un manteau riche en CO₂ et en eau fond très peu, là où le diamant est stable", "quand": "Vers 90 millions d'années", "scene": "fusionManteau", "p": {"profond": true, "zFusion": [150, 240], "lithos": 220, "labLithos": "base du vieux continent (craton)", "tFusion": "≈ 1 300 °C, vers 150–250 km", "pctFusion": 1, "labSurface": "vieux continent (craton)"}},
        {"court": "Remontée éclair", "titre": "Il remonte en quelques heures à jours, en arrachant des fragments du manteau et leurs diamants", "quand": "Vers 90 millions d'années", "duree": "quelques heures à quelques jours", "scene": "monteeBasalte", "p": {"profond": true, "zFusion": [150, 240], "lithos": 220, "labLithos": "base du vieux continent (craton)", "vitesse": "quelques heures à quelques jours"}},
        {"court": "Explosion", "titre": "Près de la surface, le gaz explose : la cheminée se remplit de brèche", "quand": "Vers 90 millions d'années", "duree": "quelques heures", "scene": "diatreme", "p": {"libelleAge": "il y a ≈ 90 millions d'années"}},
        {"court": "Brèche à diamants", "titre": "Les diamants, instables en surface, survivent parce que la remontée a été trop rapide pour qu'ils se changent en graphite", "quand": "Depuis 90 millions d'années", "scene": "kimberliteDiamants", "p": {}},
      ],
      proc: "kimberlite", p: { explosion: "plinienne", vitesse: "heures à jours", colonne: "" },
      cond: { type: "pt", echelle: "profond", fondu: ["peridotite"], courbes: ["peridotite", "diamant"],
        etiquettes: [["peridotite", 1560, 3.2, -52], ["diamant stable", 700, 6.2], ["graphite stable", 700, 2.0], ["graphite → diamant", 1300, 5.0, -12]], chemin: [
        { T: 1300, P: 6.0, n: 1, t: "Sous les vieux continents, à 150–250 km, un manteau riche en CO₂ et en eau fond très peu : le liquide naît dans le domaine où le diamant est stable." },
        { T: 1150, P: 2.5, n: 2, t: "Il remonte en quelques heures à jours, en arrachant des fragments du manteau et leurs diamants." },
        { T: 1000, P: 0.0, n: 3, t: "Le gaz explose près de la surface." },
        { T: 15, P: 0, n: 4, t: "La cheminée se remplit de brèche. Les diamants, instables en surface, survivent parce que la remontée a été trop rapide pour qu'ils se transforment en graphite." }] },
      src: ["hirschmann", "kennedy", "sparks"],
    },
    tuf_volcanique: {
      exemple: "Exemple suivi : les tufs de cendres (cinérites) du Cantal, vers 8 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Le manteau fond en partie sous le Massif central", "quand": "Sous le Cantal, sans interruption", "scene": "fusionManteau", "p": {"zFusion": [60, 90], "tFusion": "1 250 à 1 350 °C", "pctFusion": 5}},
        {"court": "Réservoir", "titre": "Le magma évolue et se charge en gaz dans un réservoir", "quand": "Avant l'éruption", "duree": "des milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [47, 62], "tDebut": 1150, "tFin": 950, "liquideFin": 30, "zones": [[45, "basalte"], [52, "trachybasalte"], [57, "trachyandésite"], [63, "trachyte"]], "lieu": "réservoir dans la croûte, sous le Cantal", "couleurs": ["#b5401f", "#e3995a"]}},
        {"court": "Éruption", "titre": "Les gaz se détendent brutalement : le magma est pulvérisé en cendres, que le vent emporte", "quand": "Vers 8 millions d'années", "duree": "quelques heures à quelques jours", "scene": "eruptionExplosive", "p": {"mode": "retombees", "hauteurColonne": "≈ 20 km", "libelleAge": "il y a ≈ 8 millions d'années"}},
        {"court": "Consolidation", "titre": "Les cendres retombent en couches puis se consolident ; le verre se change en argiles et en zéolites", "quand": "Des milliers à des millions d'années", "duree": "des milliers à des millions d'années", "scene": "vueMicroscope", "p": {"texture": "cendres", "fiche": true, "alteration": true, "legendePlus": [["#a8865c", "verre altéré en argiles"], ["#ffffff", "zéolites (dans les vides)"]], "titre": "Dans la couche de cendres, au microscope", "lignes": ["échardes de verre volcanique :", "tassées, elles se consolident ;", "l'eau les change peu à peu", "en argiles et en zéolites"], "legende": [["#f6f3ec", "verre frais"], ["#b99f7c", "verre altéré en argiles"], ["#ffffff", "zéolites"]], "jauge": {"nom": "verre altéré", "de": 0, "a": 60}, "duree": "des milliers à des millions d'années"}},
      ],
      proc: "pyroclastique", p: { src: "manteau", explosion: "plinienne", depot: "retombees" },
      titres: [null, null, "Éruption explosive : panache de cendres", "Retombées de cendres, consolidées"],
      cond: PT_MANTEAU({ bande: [900, 1100, 0.02], chemin: [
        { T: 1470, P: 2.4, n: 1, t: "Le manteau fond sous le Massif central." },
        { T: 1080, P: 0.5, n: 2, t: "Le magma évolue et se charge en gaz dans un réservoir." },
        { T: 1000, P: 0.0, n: 3, t: "Les gaz se détendent brutalement : le magma est pulvérisé en cendres." },
        { T: 15, P: 0, n: 4, t: "Les cendres retombent en couches puis se consolident, souvent transformées en argiles et zéolites (25 Ma à 10 000 ans)." }] }),
      src: ["hirschmann", "eruption"],
    },
    ignimbrite: {
      exemple: "Exemple suivi : les ignimbrites de l'Estérel et de Corse, nuées ardentes de la fin de la chaîne varisque (300–270 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "La croûte fond en partie à la fin de la chaîne varisque", "quand": "Vers 285 millions d'années", "scene": "fusionCroute", "p": {"zFusion": [25, 35], "tFusion": "800 et 900 °C", "age0": 286, "age1": 285, "labCroute": "croûte épaisse de la chaîne varisque"}},
        {"court": "Réservoir", "titre": "Un magma rhyolitique riche en gaz s'accumule vers 5–8 km", "quand": "Vers 285 millions d'années", "duree": "de 1 000 à 100 000 ans", "scene": "monteeMagma", "p": {"zFusion": [25, 35], "zPluton": [5, 8], "age1": 285, "age2": 284, "labMontee": "le magma riche en gaz se rassemble vers 5–8 km"}},
        {"court": "Éruption", "titre": "L'éruption explose ; la colonne s'effondre en nuées ardentes qui dévalent les pentes", "quand": "Vers 284 millions d'années", "duree": "quelques heures à quelques jours", "scene": "eruptionExplosive", "p": {"mode": "ignimbrite", "hauteurColonne": "des dizaines de km", "libelleAge": "il y a ≈ 284 millions d'années"}},
        {"court": "Soudure", "titre": "Encore à plusieurs centaines de degrés, les ponces s'aplatissent et se soudent (fiammes)", "quand": "Juste après l'éruption", "duree": "des mois à des années", "scene": "soudureIgnimbrite", "p": {"duree": "des mois à des années"}},
      ],
      proc: "pyroclastique", p: { src: "croute", explosion: "plinienne", depot: "ignimbrite" },
      titres: ["Fusion partielle de la croûte continentale", null, "Éruption explosive : effondrement de la colonne", "Nuée ardente : le dépôt se soude à chaud"],
      cond: PT_CROUTE({ bande: [700, 900, 0.01], chemin: [
        { T: 850, P: 0.8, n: 1, t: "La croûte fond en partie à la fin de la chaîne varisque." },
        { T: 820, P: 0.2, n: 2, t: "Un magma rhyolitique riche en gaz s'accumule vers 5–8 km." },
        { T: 820, P: 0.0, n: 3, t: "L'éruption explose ; la colonne s'effondre en nuées ardentes qui dévalent les pentes." },
        { T: 650, P: 0.0 },
        { T: 15, P: 0, n: 4, t: "Encore à plusieurs centaines de degrés en s'arrêtant, les ponces s'aplatissent et se soudent (fiammes) : Estérel, Corse (300–270 Ma)." }] }),
      src: ["tuttle", "eruption"],
    },
    breche_volcanique: {
      exemple: "Exemple suivi : les brèches du Cantal, laissées par l'avalanche de débris qui emporta un flanc du volcan vers 7 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Le manteau fond en partie sous le Cantal", "quand": "Sous le Cantal, sans interruption", "scene": "fusionManteau", "p": {"zFusion": [60, 90], "tFusion": "1 250 à 1 350 °C", "pctFusion": 5}},
        {"court": "Construction", "titre": "Les magmas évolués bâtissent le stratovolcan, coulée après coulée", "quand": "De 8,5 à 7 millions d'années", "duree": "quelques centaines de milliers d'années", "allonge": 1.5, "scene": "stratovolcanConstruction", "p": {"ages": [8.5, 7]}},
        {"court": "Effondrement", "titre": "Un flanc s'effondre : une avalanche de débris s'étale sur des dizaines de kilomètres", "quand": "Vers 7 millions d'années", "duree": "quelques minutes", "allonge": 1.2, "scene": "stratovolcanEffondrement", "p": {"ages": [8.5, 7]}},
        {"court": "Consolidation", "titre": "Les blocs s'immobilisent dans une matrice de cendres qui durcit et s'argilise", "quand": "Depuis 7 millions d'années", "duree": "des milliers à des millions d'années", "scene": "vueMicroscope", "p": {"texture": "breche", "titre": "Dans la brèche, à la loupe", "ciment": "#8c7358", "lignes": ["blocs anguleux de lave", "pris dans une matrice", "de cendres qui durcit", "et s'argilise"], "legende": [["#6f6a63", "blocs de lave"], ["#b6aa98", "matrice de cendres"]], "duree": "des milliers à des millions d'années"}},
      ],
      proc: "pyroclastique", p: { src: "manteau", explosion: "avalanche", depot: "breche" },
      titres: [null, null, "Explosion ou effondrement d'une partie du volcan", "Blocs pris dans une matrice de cendres"],
      cond: PT_MANTEAU({ bande: [950, 1150, 0.02], chemin: [
        { T: 1460, P: 2.3, n: 1, t: "Le manteau fond sous le Cantal." },
        { T: 1100, P: 0.6, n: 2, t: "Les magmas évoluent et alimentent le stratovolcan." },
        { T: 1000, P: 0.0, n: 3, t: "Explosions, effondrements de dômes et avalanches de débris, dont celle qui emporta la moitié du Cantal vers 7 Ma." },
        { T: 15, P: 0, n: 4, t: "Les blocs s'immobilisent dans une matrice de cendres qui durcit et s'argilise." }] }),
      src: ["hirschmann"],
    },
    pouzzolane: {
      exemple: "Exemple suivi : les cônes de scories de la chaîne des Puys (95 000 à 6 900 ans), exploités en carrière comme à Lemptégy.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Le manteau fond en partie sous la chaîne des Puys", "quand": "Sous le Massif central, sans interruption", "scene": "fusionManteau", "p": {"zFusion": [60, 90], "tFusion": "1 250 à 1 350 °C", "pctFusion": 6}},
        {"court": "Montée", "titre": "Le basalte monte, chargé de gaz", "quand": "Quelques jours à quelques semaines avant l'éruption", "duree": "de quelques jours à quelques semaines", "scene": "monteeBasalte", "p": {"zFusion": [60, 90], "vitesse": "quelques jours à quelques semaines"}},
        {"court": "Fontaines", "titre": "Les gaz forment des bulles qui éclatent : des lambeaux de lave sont projetés et se figent en l'air", "quand": "Il y a quelques dizaines de milliers d'années", "duree": "quelques jours à quelques mois", "scene": "coneFontaines", "p": {"libelleAge": "il y a 95 000 à 6 900 ans"}},
        {"court": "Cône", "titre": "Les scories s'empilent en cône ; près du conduit, le fer s'oxyde à chaud et les rougit", "quand": "Depuis l'éruption", "scene": "coneCoupe", "p": {"libelleAge": "aujourd'hui, en carrière"}},
      ],
      proc: "pyroclastique", p: { src: "manteau", explosion: "strombolienne", depot: "scories" },
      titres: [null, null, "Fontaines de lave : projection de scories", "Cône de scories bulleuses"],
      cond: PT_MANTEAU({ bande: [1050, 1180, 0.02], chemin: [
        { T: 1480, P: 2.5, n: 1, t: "Le manteau fond sous la chaîne des Puys." },
        { T: 1270, P: 0.7, n: 2, t: "Le basalte monte, chargé de gaz." },
        { T: 1130, P: 0.0, n: 3, t: "Les gaz forment des bulles : des lambeaux de lave sont projetés et se figent en l'air." },
        { T: 15, P: 0, n: 4, t: "Les scories s'empilent en cônes (95 000 à 6 900 ans) ; rouges si le fer s'est oxydé à chaud." }] }),
      src: ["hirschmann", "eruption"],
    },

    // ════════════════════════ M.3 hypovolcaniques ════════════════════════
    microgranite: {
      exemple: "Exemple suivi : les filons de microgranite tardi-hercyniens du Massif central (300–270 millions d'années).",
      anim: [
        {"court": "Fusion", "titre": "La croûte fond en partie, comme pour un granite ; quelques cristaux grandissent déjà", "quand": "Vers 285 millions d'années", "scene": "fusionCroute", "p": {"zFusion": [25, 32], "tFusion": "750 et 850 °C", "age0": 286, "age1": 285, "labCroute": "croûte de la fin de la chaîne varisque"}},
        {"court": "Injection", "titre": "Le magma, chargé de cristaux, s'injecte en filons vers 1–3 km", "quand": "Vers 285 millions d'années", "duree": "de quelques heures à quelques jours", "scene": "injectionFilon", "p": {"forme": "dyke", "encaissant": "socle", "z": [1, 3], "largeur": "filon de 1 à 50 m", "libelleAge": "il y a ≈ 285 millions d'années"}},
        {"court": "Refroidissement", "titre": "Près de la surface, le liquide se fige vite : grands cristaux dans une pâte fine", "quand": "Juste après l'injection", "duree": "de quelques semaines à un siècle", "scene": "refroidissementFilon", "p": {"texture": "microgrenue", "tDebut": 760, "nomEncaissant": "socle", "duree": "1 m : quelques semaines · 50 m : un siècle", "lignes": ["grands cristaux de quartz et de", "feldspath dans une pâte fine"], "legende": [["#efe9dd", "quartz"], ["#e2b39a", "feldspath"], ["#3e342c", "biotite"]]}},
        {"court": "Érosion", "titre": "Plus dur que le socle altéré, le filon ressort en muraille", "quand": "De 285 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "filon", "nom": "filon de microgranite", "couleur": "#d8b9a8", "couches": [["#9c8a70", "socle altéré"], ["#8a7c66", "socle"], ["#7d705c", ""]], "ages": [285, 0]}},
      ],
      proc: "filon", p: { src: "croute", profFilon: "≈ 1–3 km", textureTxt: "phénocristaux dans une pâte fine" },
      cond: PT_CROUTE({ bande: [700, 850, 0.06], chemin: [
        { T: 800, P: 0.8, n: 1, t: "La croûte fond en partie, comme pour un granite." },
        { T: 790, P: 0.35, n: 2, t: "Quelques cristaux (quartz, feldspath) grandissent déjà dans le magma." },
        { T: 760, P: 0.06, n: 3, t: "Le magma s'injecte en filons vers 1–3 km." },
        { T: 15, P: 0.0, n: 4, t: "Un filon de 1 m se fige en quelques semaines, un de 50 m en un siècle environ : la pâte reste fine (filons tardi-hercyniens et permiens, 300–270 Ma)." }] }),
      src: ["tuttle", "diffusion"],
    },
    microdiorite: {
      exemple: "Exemple suivi : la pierre de Logonna (rade de Brest), filons tardi-varisques de microdiorite (360–290 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Un magma basique naît dans le manteau", "quand": "Sous la chaîne varisque", "scene": "fusionManteau", "p": {"zFusion": [50, 70], "tFusion": "1 250 à 1 350 °C", "pctFusion": 6}},
        {"court": "Réservoir", "titre": "Au bas de la croûte, il évolue : plagioclase et amphibole apparaissent", "quand": "Avant l'injection", "duree": "des milliers d'années (ordre de grandeur)", "scene": "reservoirDifferenciation", "p": {"silice": [48, 57], "tDebut": 1200, "tFin": 1000, "liquideFin": 55, "zRes": 30, "zones": [[45, "gabbro"], [52, "diorite"], [63, "granodiorite"], [69, "granite"]], "lieu": "réservoir au bas de la croûte", "couleurs": ["#b5401f", "#cf6534"]}},
        {"court": "Injection", "titre": "Il s'injecte en filons à faible profondeur", "quand": "Vers 300 millions d'années", "duree": "de quelques heures à quelques jours", "scene": "injectionFilon", "p": {"forme": "dyke", "encaissant": "schistes", "z": [0.5, 3], "largeur": "filon de quelques mètres", "libelleAge": "il y a ≈ 300 millions d'années"}},
        {"court": "Refroidissement", "titre": "Figé vite, en grain fin : plagioclase et amphibole", "quand": "Juste après l'injection", "duree": "de quelques semaines à quelques années", "scene": "refroidissementFilon", "p": {"texture": "microgrenue", "tDebut": 950, "couleurRoche": "#8d9187", "nomEncaissant": "schistes", "duree": "de quelques semaines à quelques années", "lignes": ["petits cristaux de plagioclase et", "d'amphibole : la pierre de Logonna"], "legende": [["#efe9dd", "plagioclase"], ["#3e342c", "amphibole"]]}},
        {"court": "Érosion", "titre": "L'érosion enlève les schistes au-dessus : le filon affleure, exploité comme pierre de taille (Logonna)", "quand": "De 300 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "filon", "nom": "filon de microdiorite", "couleur": "#8f968a", "ages": [300, 0], "texteFin": "le filon affleure : la pierre de Logonna"}},
      ],
      proc: "filon", p: { src: "manteau", profFilon: "≈ 1–3 km", profFusion: "≈ 50–70 km" },
      cond: PT_MANTEAU({ bande: [850, 1050, 0.05], chemin: [
        { T: 1430, P: 2.0, n: 1, t: "Un magma basique naît dans le manteau." },
        { T: 1100, P: 0.8, n: 2, t: "Il évolue au bas de la croûte ; plagioclase et amphibole apparaissent." },
        { T: 950, P: 0.05, n: 3, t: "Il s'injecte en filons à faible profondeur." },
        { T: 15, P: 0.0, n: 4, t: "Figé vite, en grain fin : la pierre de Logonna (filons tardi-varisques, 360–290 Ma)." },
        { T: 15, P: 0.0, n: 5, t: "L'érosion enlève les roches au-dessus : le filon affleure au bord de la rade de Brest, exploité comme pierre de taille (pierre de Logonna)." }] }),
      src: ["hirschmann", "diffusion"],
    },
    dolerite: {
      exemple: "Exemple suivi : les filons de dolérite du Massif armoricain et les sills du Morvan (hercyniens à permiens).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Le manteau fond en partie : un basalte se forme", "quand": "Sous la chaîne hercynienne", "scene": "fusionManteau", "p": {"zFusion": [60, 90], "tFusion": "1 250 à 1 350 °C", "pctFusion": 6}},
        {"court": "Montée", "titre": "Le magma monte à travers la croûte", "quand": "Quelques jours à quelques semaines", "duree": "de quelques jours à quelques semaines", "scene": "monteeBasalte", "p": {"zFusion": [60, 90], "vitesse": "quelques jours à quelques semaines"}},
        {"court": "Injection", "titre": "Il s'arrête à faible profondeur en dykes et en sills", "quand": "Vers 300 millions d'années", "duree": "de quelques jours à quelques semaines", "scene": "injectionFilon", "p": {"forme": "sill", "encaissant": "schistes", "z": [1.5, 4], "largeur": "sill de quelques mètres à 100 m", "libelleAge": "il y a ≈ 300 millions d'années", "couleurMagma": "#d9582e"}},
        {"court": "Refroidissement", "titre": "Il refroidit plus lentement qu'une coulée, plus vite qu'un gabbro : grain moyen", "quand": "Juste après l'injection", "duree": "de quelques mois à quelques siècles", "scene": "refroidissementFilon", "p": {"texture": "ophitique", "tDebut": 1170, "couleurRoche": "#8d9187", "nomEncaissant": "schistes", "couleurFige": "#3f4441", "duree": "de quelques mois à quelques siècles", "lignes": ["baguettes de plagioclase prises", "dans de grands pyroxènes (ophitique)"], "legende": [["#f2efe8", "plagioclase"], ["#8a7d52", "pyroxène"]]}},
        {"court": "Érosion", "titre": "L'érosion met au jour dykes et sills : plus durs que les schistes, ils forment murailles et corniches", "quand": "De 300 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "filon", "nom": "sill de dolérite", "couleur": "#4f5550", "ages": [300, 0], "texteFin": "le sill affleure en corniche"}},
      ],
      proc: "filon", p: { src: "manteau", profFilon: "≈ 1–5 km", textureTxt: "texture ophitique" },
      cond: PT_MANTEAU({ bande: [1050, 1200, 0.08], chemin: [
        { T: 1460, P: 2.3, n: 1, t: "Le manteau fond en partie : un basalte se forme." },
        { T: 1280, P: 0.8, n: 2, t: "Le magma monte à travers la croûte." },
        { T: 1170, P: 0.08, n: 3, t: "Il s'arrête en dykes et en sills à faible profondeur." },
        { T: 15, P: 0.0, n: 4, t: "Il refroidit plus lentement qu'une coulée, plus vite qu'un gabbro : grain moyen (filons hercyniens à permiens)." },
        { T: 15, P: 0.0, n: 5, t: "L'érosion met au jour dykes et sills : plus durs que les schistes, ils forment murailles et corniches." }] }),
      src: ["hirschmann", "diffusion"],
    },
    aplite: {
      exemple: "Exemple suivi : les filons d'aplite du granite du Sidobre (Tarn), derniers liquides du granite, vers 300 millions d'années.",
      anim: [
        {"court": "Granite", "titre": "Le granite a presque fini de cristalliser : il reste un peu de liquide riche en eau et en silice", "quand": "Vers 300 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 850, "tFin": 690, "mineraux": [["quartz", 32], ["orthose", 30], ["plagioclases", 28], ["biotite", 7], ["muscovite", 3]], "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Injection", "titre": "Ce dernier liquide s'injecte dans les fractures du massif", "quand": "Vers 300 millions d'années", "duree": "quelques jours", "scene": "injectionFilon", "p": {"forme": "reseau", "encaissant": "granite", "z": [5, 8], "couleurMagma": "#f0c28a", "libelleAge": "il y a ≈ 300 millions d'années"}},
        {"court": "Cristallisation", "titre": "Il perd brusquement son eau et cristallise très vite, en grain fin et régulier", "quand": "Juste après l'injection", "duree": "de quelques jours à quelques années", "scene": "refroidissementFilon", "p": {"texture": "aplitique", "tDebut": 675, "couleurRoche": "#e2d6c8", "nomEncaissant": "granite", "couleurMagma": "#f0c28a", "couleurFige": "#e9dfd3", "duree": "quelques jours à quelques années", "lignes": ["grain fin et régulier, comme du sucre :", "quartz et feldspaths, peu de mica"], "legende": [["#f1ece2", "quartz"], ["#e8c9b5", "feldspath"]]}},
        {"court": "Érosion", "titre": "L'érosion met au jour le granite et ses filons clairs", "quand": "De 300 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "filon", "nom": "filon d'aplite", "couleur": "#f3ece2", "couches": [["#d9ccb9", "arène granitique"], ["#e2d6c8", "granite"], ["#d8cbbb", ""]], "ages": [300, 0]}},
      ],
      proc: "filonGranitique", p: { src: "croute", prof: "≈ 5–10 km", texture: "aplite", textureTxt: "grain très fin et régulier", profFilon: "≈ 5–8 km" },
      cond: PT_CROUTE({ bande: [650, 720, 0.18], chemin: [
        { T: 720, P: 0.22, n: 1, t: "Le granite a presque fini de cristalliser." },
        { T: 690, P: 0.2, n: 2, t: "Il reste un peu de liquide, riche en eau et en silice." },
        { T: 675, P: 0.18, n: 3, t: "Ce liquide s'injecte dans les fractures du massif." },
        { T: 15, P: 0.0, n: 4, t: "Il perd brusquement son eau et cristallise très vite en grain fin (340–290 Ma)." }] }),
      src: ["tuttle"],
    },
    pegmatite: {
      exemple: "Exemple suivi : les pegmatites de Chanteloube et d'Ambazac (Haute-Vienne), tardi-hercyniennes (340–290 millions d'années).",
      anim: [
        {"court": "Granite", "titre": "Le granite a presque fini de cristalliser : le dernier liquide concentre l'eau, le bore, le fluor, le lithium", "quand": "Vers 320 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 850, "tFin": 690, "mineraux": [["quartz", 32], ["orthose", 30], ["plagioclases", 28], ["biotite", 7], ["muscovite", 3]], "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Injection", "titre": "Il s'injecte en filons dans le granite et ses roches voisines", "quand": "Vers 320 millions d'années", "duree": "quelques jours", "scene": "injectionFilon", "p": {"forme": "reseau", "encaissant": "granite", "z": [3, 8], "couleurMagma": "#f0c28a", "libelleAge": "il y a ≈ 320 millions d'années"}},
        {"court": "Cristallisation", "titre": "Très fluide, riche en eau, il cristallise en cristaux géants", "quand": "Après l'injection", "duree": "de quelques années à quelques milliers d'années", "scene": "refroidissementFilon", "p": {"texture": "pegmatitique", "tDebut": 650, "couleurRoche": "#e2d6c8", "nomEncaissant": "granite", "couleurMagma": "#f0c28a", "couleurFige": "#efe7da", "duree": "de quelques années à quelques milliers d'années", "lignes": ["cristaux centimétriques à métriques :", "feldspath, quartz, mica, tourmaline"], "legende": [["#f0dccd", "feldspath"], ["#e8e3da", "quartz"], ["#2c2c2c", "tourmaline"]]}},
        {"court": "Érosion", "titre": "L'érosion met au jour les filons, exploités pour leurs grands cristaux", "quand": "De 320 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "filon", "nom": "filon de pegmatite", "couleur": "#f0dccd", "couches": [["#d9ccb9", "arène granitique"], ["#e2d6c8", "granite"], ["#d8cbbb", ""]], "ages": [320, 0]}},
      ],
      proc: "filonGranitique", p: { src: "croute", prof: "≈ 5–10 km", texture: "pegmatite", textureTxt: "cristaux centimétriques à métriques", profFilon: "≈ 3–8 km" },
      cond: PT_CROUTE({ bande: [550, 700, 0.18], chemin: [
        { T: 720, P: 0.22, n: 1, t: "Le granite a presque fini de cristalliser." },
        { T: 690, P: 0.2, n: 2, t: "Le dernier liquide concentre l'eau, le bore, le fluor, le lithium, le béryllium." },
        { T: 650, P: 0.18, n: 3, t: "Il s'injecte en filons dans le granite et son encaissant." },
        { T: 15, P: 0.0, n: 4, t: "Chargé d'eau et d'éléments qui le rendent très fluide, il cristallise nettement sous le solidus habituel du granite, en cristaux géants (340–290 Ma)." }] }),
      src: ["tuttle", "london"],
    },
    lamprophyre: {
      exemple: "Exemple suivi : le kersanton de la rade de Brest (Finistère), filons tardi-hercyniens (340–290 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion", "titre": "Un manteau riche en eau et en potassium fond en partie", "quand": "Sous la chaîne hercynienne", "scene": "fusionManteau", "p": {"zFusion": [60, 100], "tFusion": "1 200 à 1 300 °C", "pctFusion": 3}},
        {"court": "Montée", "titre": "Le magma, riche en éléments volatils, monte vite", "quand": "Quelques jours à quelques semaines", "duree": "de quelques jours à quelques semaines", "scene": "monteeBasalte", "p": {"zFusion": [60, 100], "vitesse": "quelques jours"}},
        {"court": "Injection", "titre": "Il s'injecte en filons dans les granites", "quand": "Vers 300 millions d'années", "duree": "de quelques heures à quelques jours", "scene": "injectionFilon", "p": {"forme": "dyke", "encaissant": "granite", "z": [1, 5], "largeur": "filon de quelques mètres", "libelleAge": "il y a ≈ 300 millions d'années", "couleurMagma": "#c9502b"}},
        {"court": "Refroidissement", "titre": "Biotite et amphibole cristallisent en grand ; les feldspaths restent dans la pâte", "quand": "Juste après l'injection", "duree": "de quelques semaines à quelques années", "scene": "refroidissementFilon", "p": {"texture": "lamprophyrique", "tDebut": 1080, "couleurRoche": "#e2d6c8", "nomEncaissant": "granite", "couleurFige": "#4d433a", "duree": "de quelques semaines à quelques années", "lignes": ["grands cristaux de biotite et", "d'amphibole ; feldspaths dans la pâte"], "legende": [["#5b3b24", "biotite"], ["#3d5a44", "amphibole"]]}},
        {"court": "Érosion", "titre": "L'érosion met au jour le granite et ses filons sombres : le kersanton, pierre des calvaires bretons", "quand": "De 300 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "filon", "nom": "filon de kersanton", "couleur": "#5a5048", "ages": [300, 0], "texteFin": "le filon affleure : le kersanton"}},
      ],
      proc: "filon", p: { src: "manteau", profFusion: "≈ 60–100 km", profFilon: "≈ 1–5 km", textureTxt: "grands cristaux de biotite et d'amphibole" },
      titres: ["Fusion d'un manteau enrichi en eau et en potassium", null, null, "Phénocristaux de mica ou d'amphibole, pâte fine"],
      cond: PT_MANTEAU({ bande: [950, 1150, 0.06], chemin: [
        { T: 1300, P: 2.6, n: 1, t: "Un manteau riche en eau et en potassium fond en partie." },
        { T: 1180, P: 0.6, n: 2, t: "Le magma, riche en éléments volatils, monte vite." },
        { T: 1080, P: 0.06, n: 3, t: "Il s'injecte en filons dans les granites." },
        { T: 15, P: 0.0, n: 4, t: "Biotite et amphibole cristallisent en grand ; les feldspaths restent dans la pâte (minette, kersantite, 340–290 Ma)." },
        { T: 15, P: 0.0, n: 5, t: "L'érosion met au jour le granite et ses filons sombres : le kersanton, sculpté pour les calvaires bretons." }] }),
      src: ["hirschmann"],
    },
    porphyre: {
      exemple: "Exemple suivi : le porphyre rouge de l'Estérel (Var), filons et dômes permiens (300–270 millions d'années).",
      anim: [
        {"court": "Fusion", "titre": "La croûte fond en partie ; en profondeur, de gros cristaux de quartz et de feldspath grandissent lentement", "quand": "Vers 285 millions d'années", "scene": "fusionCroute", "p": {"zFusion": [25, 32], "tFusion": "800 et 900 °C", "age0": 286, "age1": 285, "labCroute": "croûte de la fin de la chaîne varisque"}},
        {"court": "Montée", "titre": "Le magma et ses gros cristaux montent en filon près de la surface", "quand": "Vers 285 millions d'années", "duree": "de quelques heures à quelques jours", "scene": "injectionFilon", "p": {"forme": "dyke", "encaissant": "socle", "z": [0.5, 2], "largeur": "filon", "libelleAge": "il y a ≈ 285 millions d'années"}},
        {"court": "Figement", "titre": "Le liquide restant se fige vite autour des gros cristaux", "quand": "Juste après l'injection", "duree": "de quelques jours à un siècle", "scene": "refroidissementFilon", "p": {"texture": "microgrenue", "tDebut": 790, "couleurRoche": "#9c8a70", "nomEncaissant": "socle", "duree": "de quelques jours à un siècle", "lignes": ["gros cristaux de quartz et de", "feldspath dans une pâte rouge"], "legende": [["#efe9dd", "quartz"], ["#e2b39a", "feldspath"], ["#3e342c", "biotite"]]}},
        {"court": "Érosion", "titre": "Dur, le porphyre forme les reliefs rouges de l'Estérel", "quand": "De 285 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "filon", "nom": "porphyre de l'Estérel", "couleur": "#b8604c", "couches": [["#c79a82", "tufs et grès permiens"], ["#a97a64", "grès rouges"], ["#8c6a58", ""]], "ages": [285, 0]}},
      ],
      proc: "filon", p: { src: "croute", profFilon: "≈ 1–3 km" },
      cond: PT_CROUTE({ bande: [720, 900, 0.05], chemin: [
        { T: 850, P: 0.8, n: 1, t: "La croûte fond en partie." },
        { T: 820, P: 0.3, n: 2, t: "En profondeur, de gros cristaux de quartz et de feldspath grandissent lentement." },
        { T: 790, P: 0.05, n: 3, t: "Le magma monte en filon près de la surface." },
        { T: 15, P: 0.0, n: 4, t: "Le liquide restant se fige vite autour des gros cristaux : porphyre rouge de l'Estérel (300–270 Ma)." }] }),
      src: ["tuttle", "diffusion"],
    },

    // ════════════════════════ M.4 carbonatites ════════════════════════
    carbonatite: {
      exemple: "Exemple suivi : l'Ol Doinyo Lengai (Tanzanie), seul volcan actif à émettre une lave de carbonates, vers 540 °C.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Fusion carbonatée", "titre": "Un peu de CO₂ abaisse de plusieurs centaines de degrés le point de fusion du manteau : un liquide riche en carbonates apparaît", "quand": "Sous le rift est-africain", "scene": "fusionManteau", "p": {"zFusion": [70, 100], "tFusion": "≈ 1 050 °C grâce au CO₂", "pctFusion": 1}},
        {"court": "Montée", "titre": "Le magma monte ; dans la croûte, les carbonates se séparent des silicates", "quand": "Avant l'éruption", "duree": "de quelques jours à quelques semaines", "scene": "monteeBasalte", "p": {"zFusion": [70, 100], "vitesse": "quelques jours à quelques semaines"}},
        {"court": "Éruption", "titre": "L'Ol Doinyo Lengai émet une lave noire de carbonates, vers 540 °C, qui blanchit à l'air en quelques jours", "quand": "Aujourd'hui", "duree": "quelques jours", "scene": "eruptionCoulee", "p": {"laveT": "≈ 540 °C", "libelleAge": "aujourd'hui", "lave": ["#3a2f28", "#6b5a4a"]}},
        {"court": "Érosion", "titre": "La plupart des carbonatites cristallisent en profondeur : l'érosion les dégage", "quand": "De 3 000 millions d'années à aujourd'hui", "scene": "degagement", "p": {"forme": "cheminee", "nom": "carbonatite", "couleur": "#e9e2cb", "couches": [["#b8a98a", "roches voisines altérées"], ["#9c8a70", "socle"], ["#8a7c66", ""]], "ages": [100, 0]}},
      ],
      proc: "carbonatite", p: { src: "manteau", profFusion: "≈ 70–100 km" },
      cond: PT_MANTEAU({ etiquettes: [["peridotite", 1290, 1.2, -68], ["manteau sec partiellement fondu", 1630, 3.5]], chemin: [
        { T: 1050, P: 2.6, n: 1, t: "Un peu de CO₂ abaisse de plusieurs centaines de degrés le point de fusion du manteau : un liquide riche en carbonates apparaît bien sous le solidus du manteau sec." },
        { T: 900, P: 0.8, n: 2, t: "Le magma monte ; dans la croûte, les carbonates se séparent des silicates." },
        { T: 540, P: 0.0, n: 3, t: "L'Ol Doinyo Lengai (Tanzanie) émet aujourd'hui une lave de carbonates vers 540 °C." },
        { T: 15, P: 0.0, n: 4, t: "La plupart des carbonatites cristallisent en profondeur et affleurent grâce à l'érosion (de 3 000 Ma à l'actuel)." }] }),
      src: ["hirschmann", "dasgupta"],
    },
    // ════════════════════════ S.1 silicoclastiques ════════════════════════
    conglomerat: {
      exemple: "Exemple suivi : les poudingues rouges de la montagne Sainte-Victoire (Provence), entre 72 et 34 millions d'années.",
      anim: [
        {"court": "Érosion", "titre": "Les reliefs naissants de Provence se soulèvent et s'érodent vite", "quand": "Vers 70 millions d'années", "duree": "des millions d'années", "scene": "torrentErosion", "p": {"relief": "montagne", "soulevement": true, "ages": [70, 62], "labRelief": "reliefs naissants de Provence"}},
        {"court": "Cône", "titre": "Torrents et crues roulent galets et graviers et les étalent en cônes au pied du relief", "quand": "Vers 60 millions d'années", "duree": "des millions d'années", "scene": "torrentCone", "p": {"relief": "montagne", "soulevement": true, "ages": [62, 55], "labRelief": "reliefs naissants de Provence"}},
        {"court": "Enfouissement", "titre": "D'autres dépôts les recouvrent ; enfouis à 1–2 km, ils se tassent", "quand": "De 55 à 30 millions d'années", "duree": "25 millions d'années", "scene": "enfouissement", "p": {"couches": [[55, 45, "#c9a98a", "Paléogène : argiles et sables rouges"], [45, 30, "#d8cdb0", "calcaires de lac"]], "age0": 55, "age1": 30, "zmax": 1.5, "nomRoche": "les galets du cône", "couleurRoche": "#cbb89a", "grainFonce": "#8a7f70", "grainClair": "#e8dccb", "vides": [35, 22], "surface": ["plaine et lacs", "#8fb0a0"], "rythme": "≈ 60 m de dépôts par million d'années"}},
        {"court": "Cimentation", "titre": "Vers 40–70 °C, de la calcite soude galets et sable : le poudingue", "quand": "Depuis 30 millions d'années", "duree": "des millions d'années", "scene": "vueMicroscope", "p": {"texture": "conglomerat", "titre": "Dans la roche, à la loupe", "ciment": "#e8dcc0", "lignes": ["galets arrondis, graviers", "et sable, soudés par", "de la calcite qui précipite", "entre eux"], "legende": [["#b5aa98", "galets"], ["#d8c8a6", "sable et ciment de calcite"]], "jauge": {"nom": "vides", "de": 35, "a": 8, "couleur": "#8fc3e4"}, "duree": "des millions d'années"}},
      ],
      proc: "detritique", p: { relief: "montagne", agent: "torrent", depot: "cone", ciment: "calcite", grainLoupe: 16, profDia: "≈ 1–2 km", tDia: "≈ 40–70 °C" },
      titres: ["Érosion d'une chaîne en train de se soulever", "Torrents : galets et graviers", "Cônes alluviaux au pied du relief", null],
      cond: { type: "enfouissement", tmax: 80, zmax: 4, seuils: ["quartz"], chemin: [
        { age: 70, z: 0, n: 1, t: "Au Crétacé terminal et au Paléogène (72–34 Ma), les reliefs naissants de Provence s'érodent vite." },
        { age: 60, z: 0.1, n: 2, t: "Torrents et crues roulent galets et graviers sur quelques kilomètres." },
        { age: 55, z: 0.3, n: 3, t: "Ils s'étalent en cônes au pied du relief." },
        { age: 30, z: 1.5, n: 4, t: "Enfouis sous 1 à 2 km de sédiments (≈ 40–70 °C), ils sont tassés et soudés par de la calcite." },
        { age: 0, z: 0 }] },
      src: ["gradient"],
    },
    breche_sedimentaire: {
      exemple: "Exemple suivi : les brèches de pente de Provence et des Alpes, éboulis cimentés au pied des falaises calcaires.",
      anim: [
        {"court": "Éboulis", "titre": "Au pied des falaises, les fragments ne voyagent que de quelques mètres : ils restent anguleux et mal triés", "quand": "Au Quaternaire", "duree": "des milliers d'années", "scene": "versant", "p": {"mode": "eboulis", "libelleAge": "au Quaternaire"}},
        {"court": "Cimentation", "titre": "L'eau chargée de calcaire qui traverse l'éboulis dépose de la calcite entre les fragments", "quand": "Au Quaternaire, près de la surface", "duree": "des milliers d'années", "scene": "vueMicroscope", "p": {"texture": "breche", "titre": "Dans la brèche, à la loupe", "ciment": "#e8dcc0", "lignes": ["fragments anguleux, mal", "triés, soudés par de la", "calcite déposée par l'eau", "qui traverse l'éboulis"], "legende": [["#6f6a63", "fragments"], ["#e8dcc0", "ciment de calcite"]], "jauge": {"nom": "vides", "de": 35, "a": 10, "couleur": "#8fc3e4"}}},
      ],
      proc: "breche", p: {},
      cond: { type: "grains", agents: ["gravité (éboulis)", "ruissellement"], grains: [[2, 1000]], legende: [
        "Au pied des falaises, les fragments ne voyagent que de quelques mètres : ils restent anguleux et mal triés.",
        "Aucun courant ne les trie : blocs, graviers et fines se mélangent.",
        "L'eau chargée de calcaire qui traverse l'éboulis dépose de la calcite entre les fragments, souvent près de la surface (Cénozoïque à Quaternaire)."] },
    },
    tillite: {
      exemple: "Exemple suivi : les tillites de la glaciation globale de la fin du Précambrien, comme celles de Namibie (≈ 635 millions d'années).",
      anim: [
        {"court": "Glacier", "titre": "Le glacier arrache des blocs et broie la roche en une farine fine ; il transporte tout ensemble, sans trier", "quand": "Vers 640 millions d'années", "duree": "des milliers d'années", "scene": "glacierAvance", "p": {"ages": [640, 636]}},
        {"court": "Moraine", "titre": "À la fonte, blocs, sables et farine se déposent pêle-mêle : c'est une moraine", "quand": "Vers 635 millions d'années", "duree": "des milliers d'années", "scene": "glacierFonte", "p": {"ages": [636, 635]}},
        {"court": "Enfouissement", "titre": "Enfouie sous d'autres couches, la moraine se tasse", "quand": "Après 635 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[635, 600, "#d8cfb3", "calcaires de fin de glaciation"], [600, 540, "#9aa28f", "schistes et grès"]], "age0": 635, "age1": 540, "zmax": 3, "nomRoche": "la moraine", "couleurRoche": "#a9a393", "vides": [30, 8], "grainLoupe": "#b5ab9a", "loupeTexte": ["au microscope : blocs, sable", "et farine se tassent"]}},
        {"court": "Tillite", "titre": "Cimentée, elle devient tillite : des blocs striés dans une pâte fine", "quand": "Depuis 540 millions d'années", "duree": "des millions d'années", "scene": "vueMicroscope", "p": {"texture": "tillite", "titre": "Dans la tillite, à la loupe", "ciment": "#8c877a", "lignes": ["blocs de toutes tailles,", "certains striés par la glace,", "dans une pâte de farine", "glaciaire : aucun tri"], "legende": [["#6f6a63", "blocs"], ["#a9a393", "farine glaciaire"]]}},
      ],
      proc: "glaciaire", p: { profDia: "plusieurs km", tDia: "" },
      titres: [null, null, null, "Enfouissement et durcissement de la moraine"],
      cond: { type: "grains", agents: ["glacier"], grains: [[0.001, 3000]], legende: [
        "Le glacier arrache des blocs et broie la roche en une farine fine.",
        "La glace transporte tout ensemble, sans trier : les blocs gardent des stries.",
        "À la fonte, blocs, sables et farine se déposent pêle-mêle : c'est une moraine.",
        "Enfouie sous d'autres couches, la moraine se tasse et se cimente en tillite. Certaines datent des glaciations globales de la fin du Précambrien."] },
    },
    gres: {
      proc: "detritique", p: { agent: "riviere", depot: "mer", ciment: "silice", profDia: "≈ 2–3 km", tDia: "≈ 70–100 °C" },
      // C.2 animé (prototype du 17/09/2026) : exemple suivi = le grès armoricain (Bretagne, Normandie)
      exemple: "Exemple suivi : le grès armoricain de Bretagne et de Normandie.",
      anim: [
        { court: "Érosion", titre: "Un vieux massif s'altère et s'érode", quand: "Vers 480 millions d'années, sans interruption",
          scene: "erosionMassif" },
        { court: "Transport", titre: "Les rivières emportent les grains, qui s'arrondissent", quand: "Vers 480 millions d'années, sans interruption",
          scene: "transportRiviere" },
        { court: "Dépôt", titre: "Le sable se dépose sur une plateforme marine peu profonde", quand: "De 478 à 470 millions d'années", duree: "environ 8 millions d'années pour plusieurs centaines de mètres de sable",
          scene: "depotPlateforme" },
        { court: "Enfouissement", titre: "D'autres couches le recouvrent et il se tasse sous leur poids", quand: "De 470 à 400 millions d'années", duree: "environ 70 millions d'années, soit ≈ 30 m de dépôts par million d'années",
          scene: "enfouissement" },
        { court: "Cimentation", titre: "Vers 70–80 °C, du quartz précipite entre les grains et les soude", quand: "De 400 à 320 millions d'années", duree: "des dizaines de millions d'années",
          scene: "cimentationQuartz" },
        { court: "Plissement, émersion", titre: "La collision hercynienne raccourcit et plisse la série ; épaissie, la croûte se soulève et la mer se retire", quand: "De 320 à 300 millions d'années", duree: "une vingtaine de millions d'années",
          scene: "plissementSoulevement" },
        { court: "Érosion", titre: "L'érosion rabote la chaîne ; allégée, la croûte remonte et le grès, plus dur, reste en crêtes", quand: "De 300 millions d'années à aujourd'hui", duree: "300 millions d'années",
          scene: "erosionPlis" },
      ],
      cond: { type: "enfouissement", tmax: 500, zmax: 4, labDroite: true, seuils: ["quartz"], chemin: [
        { age: 482, z: 0, n: 1, t: "Un vieux massif s'érode ; l'altération détruit les feldspaths et les micas, le quartz résiste." },
        { age: 476, z: 0, n: 2, t: "Les rivières emportent les grains vers la mer : ils s'arrondissent et se trient en chemin." },
        { age: 470, z: 0, n: 3, t: "Le sable armoricain se dépose sur une plateforme marine, à l'Ordovicien (478–470 Ma)." },
        { age: 440, z: 1.0, n: 4, t: "D'autres couches le recouvrent ; enfoui, il se tasse et perd une partie de ses vides." },
        { age: 400, z: 2.2, n: 5, t: "Au-delà de ≈ 70–80 °C, du quartz précipite autour des grains et les soude, pendant des dizaines de millions d'années : le sable devient grès." },
        { age: 340, z: 3.0 },
        { age: 320, z: 3.0, n: 6, t: "Vers 320–300 Ma, la collision hercynienne raccourcit et plisse la série ; la croûte épaissie se soulève (isostasie) : le fond de la mer passe au-dessus du niveau de l'eau et la mer se retire. Le niveau de la mer, lui, ne varie que de quelques centaines de mètres." },
        { age: 300, z: 3.0, n: 7, t: "L'érosion attaque la chaîne ; allégée, la croûte remonte au fur et à mesure (isostasie). Plus dur que les roches voisines, le grès reste en crêtes (Crozon, monts d'Arrée)." },
        { age: 270, z: 0.2 }, { age: 0, z: 0 },
        { t: "Le grès de Fontainebleau, lui, a été cimenté près de la surface par des eaux chargées de silice." }] },
      src: ["gradient", "walderhaug", "thiry", "paxton"],
    },
    arkose: {
      exemple: "Exemple suivi : les arkoses du Trias du Massif central, débris des granites hercyniens usés sous un climat sec (300–200 millions d'années).",
      anim: [
        {"court": "Érosion", "titre": "Sous un climat sec, les granites s'érodent vite : leurs feldspaths n'ont pas le temps de s'altérer en argiles", "quand": "Vers 300 millions d'années", "duree": "des millions d'années", "scene": "torrentErosion", "p": {"relief": "granite", "climat": "sec", "ages": [300, 296], "labRelief": "granites de la chaîne hercynienne"}},
        {"court": "Transport court", "titre": "Le transport est court : les grains restent anguleux et remplissent les bassins au pied des reliefs", "quand": "Vers 295 millions d'années", "duree": "des millions d'années", "scene": "torrentCone", "p": {"relief": "granite", "climat": "sec", "ages": [296, 290], "labRelief": "granites de la chaîne hercynienne"}},
        {"court": "Enfouissement", "titre": "D'autres dépôts les recouvrent ; enfouis à 1–2 km, ils se tassent", "quand": "De 290 à 230 millions d'années", "duree": "60 millions d'années", "scene": "enfouissement", "p": {"couches": [[290, 260, "#b9876c", "Permien : grès rouges"], [260, 230, "#cfa98c", "Trias : grès et argiles"]], "age0": 290, "age1": 230, "zmax": 1.8, "nomRoche": "les sables à feldspaths", "couleurRoche": "#dcbfa6", "grainFonce": "#e2ad94", "grainClair": "#f1ede4", "vides": [38, 24], "surface": ["plaine sèche", "#d9c29a"], "rythme": "≈ 30 m de dépôts par million d'années"}},
        {"court": "Cimentation", "titre": "Argiles et silice cimentent les grains, restés anguleux et roses de feldspath", "quand": "Depuis 230 millions d'années", "duree": "des millions d'années", "scene": "vueMicroscope", "p": {"texture": "arkose", "titre": "Dans la roche, au microscope", "ciment": "#b8957a", "lignes": ["grains anguleux de quartz", "et de feldspath rose,", "peu usés, cimentés par des", "argiles et de la silice"], "legende": [["#f1ede4", "quartz"], ["#e2ad94", "feldspath"]], "jauge": {"nom": "vides", "de": 30, "a": 10, "couleur": "#8fc3e4"}, "duree": "des millions d'années"}},
      ],
      proc: "detritique", p: { relief: "granite", agent: "torrent", depot: "cone", ciment: "argile", profDia: "≈ 1–2 km", tDia: "≈ 40–70 °C" },
      titres: ["Érosion rapide de granites, sous climat sec", "Transport court par les torrents", "Dépôt dans des bassins au pied des reliefs", null],
      cond: { type: "enfouissement", tmax: 320, zmax: 4, seuils: ["quartz"], chemin: [
        { age: 300, z: 0, n: 1, t: "À la fin de la chaîne hercynienne (300–200 Ma), les granites s'érodent vite, sous un climat sec : les feldspaths n'ont pas le temps de s'altérer en argiles." },
        { age: 295, z: 0, n: 2, t: "Le transport est court : les grains restent anguleux." },
        { age: 290, z: 0.2, n: 3, t: "Les sables feldspathiques remplissent les bassins permiens." },
        { age: 230, z: 1.8, n: 4, t: "Enfouis à 1–2 km, ils sont tassés et cimentés par argiles et silice." },
        { age: 150, z: 1.8 }, { age: 0, z: 0 }] },
      src: ["gradient"],
    },
    grauwacke: {
      exemple: "Exemple suivi : les grauwackes du Massif armoricain, sables de turbidites paléozoïques pris dans la collision hercynienne.",
      anim: [
        {"court": "Érosion", "titre": "Au Paléozoïque, des reliefs s'érodent au bord de bassins marins profonds", "quand": "Vers 500 millions d'années", "scene": "erosionMassif", "p": {"labMassif": "reliefs au bord d'un bassin profond"}},
        {"court": "Avalanche", "titre": "Sables et boues dévalent la pente en avalanches sous-marines (courants de turbidité)", "quand": "Vers 480 millions d'années", "duree": "quelques heures pour une avalanche", "scene": "turbiditeAvalanche", "p": {"ages": [482, 478]}},
        {"court": "Bancs", "titre": "Ils se déposent en bancs granoclassés, avec beaucoup de matrice argileuse", "quand": "De 480 à 460 millions d'années", "duree": "des millions d'années", "scene": "turbiditeBancs", "p": {"ages": [478, 460]}},
        {"court": "Enfouissement", "titre": "Enfouis à plusieurs kilomètres puis pris dans la collision, ils atteignent le très faible métamorphisme", "quand": "De 460 à 350 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[460, 420, "#7e8278", "Ordovicien–Silurien : schistes"], [420, 360, "#9aa28f", "Dévonien : schistes et grès"]], "age0": 460, "age1": 350, "zmax": 6, "nomRoche": "les sables mal triés", "couleurRoche": "#8d8a7c", "grainFonce": "#6b6a5c", "grainClair": "#d9d3c4", "vides": [30, 5], "surface": ["mer profonde", "#3f6f95"], "rythme": "≈ 50 m de dépôts par million d'années"}},
      ],
      proc: "detritique", p: { agent: "turbidite", depot: "profond", ciment: "argile", anguleux: true, profDia: "≈ 4–7 km", tDia: "≈ 130–220 °C" },
      titres: ["Érosion d'un relief bordant un bassin marin profond", "Avalanches sous-marines (courants de turbidité)", "Dépôt de sables mal triés en eau profonde", "Enfouissement profond et début de métamorphisme"],
      cond: { type: "enfouissement", tmax: 520, zmax: 8, seuils: ["quartz", "anchizone"], chemin: [
        { age: 500, z: 0, n: 1, t: "Au Paléozoïque, des reliefs s'érodent au bord de bassins marins profonds." },
        { age: 480, z: 0, n: 2, t: "Sables et boues dévalent les pentes en avalanches sous-marines." },
        { age: 460, z: 0.5, n: 3, t: "Ils se déposent en bancs granoclassés, avec beaucoup de matrice argileuse." },
        { age: 350, z: 6.0, n: 4, t: "Enfouis à plusieurs kilomètres puis pris dans la collision hercynienne, ils atteignent le très faible métamorphisme : la matrice devient chlorite et mica." },
        { age: 300, z: 5.5 }, { age: 0, z: 0 }] },
      src: ["gradient", "walderhaug"],
    },
    sable: {
      exemple: "Exemple suivi : les sables de Fontainebleau, déposés dans une mer peu profonde au Rupélien (33,9–27,3 millions d'années).",
      anim: [
        {"court": "Altération", "titre": "L'altération libère les grains de quartz des roches qui en contiennent", "quand": "Vers 34 millions d'années", "scene": "erosionMassif", "p": {}},
        {"court": "Tri", "titre": "Rivières, vagues et vent les trient : un grain de 0,2 mm tombe d'un mètre d'eau calme en moins d'une minute", "quand": "Vers 32 millions d'années", "scene": "transportRiviere", "p": {}},
        {"court": "Dépôt", "titre": "Le sable s'accumule en bancs dans une mer peu profonde", "quand": "Au Rupélien (33,9–27,3 Ma)", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 32, "age1": 28, "coquilles": 0.05, "couleurs": ["#efe6cf", "#e6dcc0"], "particules": "#f7f1e0", "texte": "le sable trié s'accumule en bancs", "rythme": "des dizaines de mètres par million d'années"}},
        {"court": "Resté meuble", "titre": "Jamais assez enfouis pour être cimentés, ils sont restés meubles", "quand": "Depuis 28 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[28, 20, "#d8cdb0", "calcaires de Beauce"]], "age0": 28, "age1": 5, "zmax": 0.15, "nomRoche": "les sables", "couleurRoche": "#efe6cf", "vides": [40, 38], "surface": ["plateau", "#9dbb86"], "loupeTexte": ["des grains de quartz jamais", "soudés : le sable reste meuble"]}},
      ],
      proc: "meuble", p: { agent: "mer", depot: "mer" },
      cond: { type: "grains", agents: ["rivière", "vent", "marée, estuaire"], grains: [[0.063, 2]], legende: [
        "L'altération libère les grains de quartz des roches qui en contiennent.",
        "Rivières, vagues et vent les trient : un grain de 0,2 mm tombe d'un mètre d'eau calme en moins d'une minute, une argile met des jours.",
        "Les sables de Fontainebleau (Rupélien, 33,9–27,3 Ma) se sont déposés dans une mer peu profonde.",
        "Jamais assez enfouis pour être cimentés, ils sont restés meubles."] },
      src: ["ferguson"],
    },
    siltite: {
      exemple: "Exemple suivi : les siltites des séries paléozoïques du Massif armoricain.",
      anim: [
        {"court": "Érosion", "titre": "L'érosion d'un vieux massif produit des grains fins de quartz et de mica", "quand": "Vers 500 millions d'années", "scene": "erosionMassif", "p": {}},
        {"court": "Transport", "titre": "Ils voyagent en suspension : un grain de limon de 20 µm met ≈ 47 minutes à tomber d'un mètre d'eau calme", "quand": "Vers 490 millions d'années", "scene": "transportRiviere", "p": {}},
        {"court": "Dépôt", "titre": "Ils se déposent en eau calme, en plaquettes", "quand": "Vers 470 millions d'années", "duree": "des millions d'années", "scene": "depotPelites", "p": {"age0": 472, "age1": 466, "couleurs": ["#9a9585", "#8a8575"], "particules": "#c8c1ad", "texte": "les limons se déposent en eau calme"}},
        {"court": "Enfouissement", "titre": "Enfouis à plusieurs kilomètres, ils sont compactés et cimentés", "quand": "De 470 à 350 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[466, 420, "#7e8278", "Ordovicien–Silurien : schistes"], [420, 350, "#9aa28f", "Dévonien : schistes et grès"]], "age0": 466, "age1": 350, "zmax": 4, "nomRoche": "les limons", "couleurRoche": "#9a9585", "grainFonce": "#6b6a5c", "grainClair": "#d9d3c4", "vides": [45, 10], "rythme": "≈ 35 m de dépôts par million d'années"}},
      ],
      proc: "detritique", p: { agent: "riviere", depot: "calme", ciment: "argile", grainLoupe: 7, profDia: "≈ 3–5 km", tDia: "≈ 100–160 °C" },
      cond: { type: "enfouissement", tmax: 520, zmax: 6, seuils: ["quartz", "anchizone"], chemin: [
        { age: 500, z: 0, n: 1, t: "L'érosion produit des grains fins de quartz et de mica." },
        { age: 490, z: 0, n: 2, t: "Ils voyagent en suspension ; un grain de limon de 20 µm met environ 47 minutes à tomber d'un mètre d'eau calme." },
        { age: 470, z: 0.3, n: 3, t: "Ils se déposent en eau calme, en plaquettes." },
        { age: 350, z: 4.0, n: 4, t: "Enfouis à plusieurs kilomètres au Paléozoïque (500–250 Ma), ils sont compactés et cimentés." },
        { age: 280, z: 3.5 }, { age: 0, z: 0 }] },
      src: ["gradient", "ferguson"],
    },
    argile: {
      exemple: "Exemple suivi : les argiles des Flandres, déposées à l'Yprésien (≈ 56–48 millions d'années).",
      anim: [
        {"court": "Altération", "titre": "L'hydrolyse transforme feldspaths et micas en minéraux argileux, plus petits que 2 µm", "quand": "Vers 56 millions d'années", "scene": "erosionMassif", "p": {}},
        {"court": "Transport", "titre": "Si fins qu'ils voyagent en suspension : une particule de 2 µm met environ 3 jours à tomber d'un mètre d'eau calme", "quand": "Vers 55 millions d'années", "scene": "transportRiviere", "p": {}},
        {"court": "Dépôt", "titre": "Ils ne se déposent qu'en eau très calme : mer profonde, lagune, lac", "quand": "De 56 à 48 millions d'années", "duree": "des millions d'années", "scene": "depotPelites", "p": {"age0": 56, "age1": 50, "couleurs": ["#6f7780", "#7f8790"], "particules": "#b9bfc4", "texte": "les argiles décantent en eau très calme"}},
        {"court": "Enfouissement", "titre": "En s'enfouissant, la boue perd son eau et durcit en argilite", "quand": "Depuis 48 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[48, 34, "#d8cdb0", "Éocène : sables"], [34, 20, "#c9bfa5", "Oligocène"]], "age0": 48, "age1": 20, "zmax": 0.5, "nomRoche": "l'argile", "couleurRoche": "#7f8790", "vides": [70, 45], "grainLoupe": "#b9bfc4", "loupeTexte": ["au microscope : la boue perd", "son eau et se tasse"]}},
      ],
      proc: "argileux", p: { agent: "riviere" },
      cond: { type: "grains", agents: ["rivière", "marée, estuaire"], grains: [[0.0005, 0.002]], legende: [
        "L'hydrolyse transforme feldspaths et micas en minéraux argileux, plus petits que 2 µm.",
        "Si fins qu'ils voyagent en suspension : une particule de 2 µm met environ 3 jours à tomber d'un mètre d'eau calme.",
        "Ils ne se déposent donc qu'en eau très calme : mer profonde, lagune, lac (Toarcien, Albien, Éocène).",
        "En s'enfouissant, la boue perd son eau et durcit en argilite."] },
      src: ["ferguson"],
    },
    molasse: {
      exemple: "Exemple suivi : la molasse de l'avant-pays alpin (Savoie, Bas-Dauphiné), débris des Alpes naissantes à l'Oligo-Miocène (34–5 millions d'années).",
      anim: [
        {"court": "Érosion", "titre": "Les Alpes se soulèvent et s'érodent", "quand": "À partir de 34 millions d'années", "scene": "erosionMassif", "p": {"labMassif": "Alpes en train de se soulever"}},
        {"court": "Transport", "titre": "Les rivières emportent sables, galets et boues", "quand": "De 30 à 5 millions d'années", "scene": "transportRiviere", "p": {}},
        {"court": "Bassin d'avant-pays", "titre": "La chaîne pèse sur la plaque, qui fléchit : le bassin s'enfonce et se remplit de kilomètres de débris", "quand": "De 30 à 5 millions d'années", "duree": "25 millions d'années", "scene": "avantPays", "p": {"nomChaine": "les Alpes", "ages": [30, 8]}},
        {"court": "Cimentation partielle", "titre": "Enfouie à 0,5–2 km, la molasse n'est que partiellement cimentée : grès tendres et marnes", "quand": "Depuis 8 millions d'années", "duree": "des millions d'années", "scene": "vueMicroscope", "p": {"texture": "gres", "titre": "Dans la molasse, au microscope", "ciment": "#e8dcc0", "lignes": ["grains de sable arrondis,", "à peine soudés par un peu", "de calcite : la roche reste", "tendre, facile à tailler"], "legende": [["#ece8df", "quartz"], ["#d9b99b", "calcaire, feldspath"]], "jauge": {"nom": "vides", "de": 38, "a": 24, "couleur": "#8fc3e4"}, "duree": "des millions d'années"}},
      ],
      proc: "detritique", p: { relief: "montagne", agent: "riviere", depot: "avant-pays", ciment: "calcite", profDia: "≈ 0,5–2 km", tDia: "≈ 25–70 °C" },
      titres: ["Érosion d'une chaîne en surrection (Alpes, Pyrénées)", "Rivières descendant de la chaîne", "Dépôt dans le bassin d'avant-pays", "Enfouissement modéré, cimentation partielle"],
      cond: { type: "enfouissement", tmax: 40, zmax: 3, seuils: [], chemin: [
        { age: 34, z: 0, n: 1, t: "À l'Oligo-Miocène (34–5 Ma), les Alpes et les Pyrénées se soulèvent et s'érodent." },
        { age: 30, z: 0, n: 2, t: "Les rivières emportent sables, galets et boues." },
        { age: 25, z: 0.3, n: 3, t: "Ils s'empilent sur des kilomètres d'épaisseur dans les bassins voisins, qui s'enfoncent sous le poids de la chaîne." },
        { age: 8, z: 1.5, n: 4, t: "Enfouie à 0,5–2 km, la molasse n'est que partiellement cimentée : grès tendres et marnes." },
        { age: 0, z: 0.3 }] },
      src: ["gradient"],
    },
    flysch: {
      exemple: "Exemple suivi : le flysch à Helminthoïdes des Alpes-Maritimes et le flysch pyrénéen du Pays basque (Crétacé supérieur – Éocène).",
      anim: [
        {"court": "Avalanches", "titre": "Au bord d'un océan qui se ferme, le sable s'accumule puis dévale la pente en avalanches sous-marines", "quand": "Vers 90 millions d'années", "duree": "quelques heures pour une avalanche", "scene": "turbiditeAvalanche", "p": {"ages": [95, 90]}},
        {"court": "Alternances", "titre": "Chaque avalanche dépose un banc de sable puis de boue : des centaines de bancs se succèdent", "quand": "De 90 à 70 millions d'années", "duree": "des millions d'années", "scene": "turbiditeBancs", "p": {"ages": [90, 70]}},
        {"court": "Enfouissement", "titre": "Les alternances s'accumulent au fond du bassin et s'enfouissent à plusieurs kilomètres", "quand": "De 70 à 35 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[70, 50, "#9aa28f", "Paléocène : flysch"], [50, 35, "#8a8a7c", "Éocène : flysch"]], "age0": 70, "age1": 35, "zmax": 4, "nomRoche": "les bancs de flysch", "couleurRoche": "#b8b19c", "grainFonce": "#6b6a5c", "grainClair": "#d9d3c4", "vides": [35, 10], "surface": ["mer profonde", "#3f6f95"], "rythme": "≈ 100 m de dépôts par million d'années"}},
        {"court": "Plissement", "titre": "Prises dans la collision, les alternances sont plissées et soulevées", "quand": "De 35 millions d'années à aujourd'hui", "duree": "des millions d'années", "scene": "plissementSoulevement", "p": {"ages": [35, 20], "couleurCouche": "#c9c2ab", "grains": "#6b6a5c", "nomCouche": "flysch"}},
      ],
      proc: "detritique", p: { agent: "turbidite", depot: "profond", ciment: "calcite", profDia: "≈ 3–6 km", tDia: "≈ 100–190 °C" },
      titres: ["Érosion au bord d'un océan qui se ferme", "Avalanches sous-marines répétées", "Alternances de grès et de pélites au fond", "Enfouissement, puis plissement dans la collision"],
      cond: { type: "enfouissement", tmax: 110, zmax: 6, seuils: ["quartz"], chemin: [
        { age: 100, z: 0, n: 1, t: "Du Crétacé supérieur à l'Éocène (100–34 Ma), des reliefs bordent les fosses océaniques qui vont se refermer." },
        { age: 90, z: 0, n: 2, t: "Chaque avalanche sous-marine dépose un banc de sable puis de boue : des centaines de bancs se succèdent." },
        { age: 70, z: 1.0, n: 3, t: "Les alternances s'accumulent au fond du bassin." },
        { age: 35, z: 4.0, n: 4, t: "Enfouies à plusieurs kilomètres, elles sont prises dans la collision et plissées." },
        { age: 0, z: 0 }] },
      src: ["gradient", "walderhaug"],
    },

    // ════════════════════════ S.2 carbonatées ════════════════════════
    calcaire: {
      proc: "plateforme", p: { producteurs: "oolithes", profEnf: "≈ 0,5–2 km" },
      // C.2 animé (17/09/2026) : prototype carbonaté, 5 étapes
      exemple: "Exemple suivi : les calcaires du Jurassique moyen du Bassin parisien (Bathonien, ≈ 168 à 166 millions d'années).",
      anim: [
        { court: "Mer chaude", titre: "Dans une mer chaude et peu profonde, coquillages, coraux et algues bâtissent leur squelette de calcite",
          quand: "De 168 à 166 millions d'années", duree: "sans interruption tant que la mer reste chaude et claire",
          scene: "merCarbonatee", p: { age0: 168, age1: 166, omega: "4 à 6 fois le seuil de précipitation" } },
        { court: "Accumulation", titre: "À leur mort, leurs débris et la boue calcaire couvrent le fond",
          quand: "De 166 à 163 millions d'années", duree: "environ 3 millions d'années pour quelques dizaines de mètres",
          scene: "accumulationCarbonatee", p: { age0: 166, age1: 163, rythme: "≈ 25 m de boue par million d'années" } },
        { court: "Enfouissement", titre: "Enfouie puis cimentée par la calcite, la boue devient calcaire",
          quand: "De 163 à 100 millions d'années", duree: "des dizaines de millions d'années",
          scene: "enfouissement", p: { age0: 163, age1: 100, zmax: 1.5, nomRoche: "la boue calcaire", couleurRoche: "#efe7d0",
            grainFonce: "#c9bda0", grainClair: "#ffffff", socle: "couches plus anciennes", vides: [60, 15],
            rythme: "≈ 25 m de dépôts par million d'années",
            couches: [[163, 145, "#cfc6ab", "Jurassique supérieur : calcaires"], [145, 120, "#aab29d", "Crétacé inférieur : marnes"], [120, 100, "#e2ded0", "Crétacé : craie"]] } },
        { court: "La mer se retire", titre: "La mer se retire et le continent se soulève : le calcaire émerge",
          quand: "De 100 à 40 millions d'années", duree: "des dizaines de millions d'années",
          scene: "emersion", p: { age0: 100, age1: 40 } },
        { court: "Karst", titre: "L'eau de pluie chargée de CO₂ le dissout : lapiaz, pertes, galeries et grottes",
          quand: "Depuis 40 millions d'années environ", duree: "toujours en cours",
          scene: "karst", p: { age0: 40 } },
      ],
      cond: { type: "enfouissement", tmax: 180, zmax: 2, labDroite: true, chemin: [
        { age: 168, z: 0, n: 1, t: "Dans une mer chaude et claire, l'eau de surface est sursaturée en calcite : coquillages, coraux et algues bâtissent leur squelette, et la calcite précipite aussi seule." },
        { age: 163, z: 0.05, n: 2, t: "Débris et boues s'accumulent sur une plate-forme de moins d'une centaine de mètres de fond (Bathonien)." },
        { age: 120, z: 1.2, n: 3, t: "Enfouie sous d'autres couches, la boue se tasse et la calcite la cimente : elle devient calcaire." },
        { age: 100, z: 1.5 },
        { age: 40, z: 0.05, n: 4, t: "La mer se retire et le continent se soulève : le calcaire revient à l'air libre." },
        { age: 0, z: 0, n: 5, t: "L'eau de pluie chargée de CO₂ le dissout le long des fissures : lapiaz, pertes, galeries et grottes." }],
        note: "La calcite cimente la boue très tôt, dès les premières centaines de mètres ; l'enfouissement achève de la compacter." },
      src: ["gradient", "plummer"],
    },
    craie: {
      exemple: "Exemple suivi : la craie des falaises d'Étretat (Pays de Caux), boue de plancton du Crétacé supérieur (100,5–72,2 millions d'années).",
      anim: [
        {"court": "Plancton", "titre": "Des algues microscopiques fabriquent de minuscules plaques de calcite, qui tombent sur le fond, entre 50 et 300 m", "quand": "Du Cénomanien au Campanien (100,5–72,2 Ma)", "duree": "≈ 30 millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 90, "age1": 88, "coquilles": 0.05, "couleurs": ["#f4f1e9", "#fbf9f4"], "particules": "#ffffff", "texte": "les plaques de calcite du plancton tombent sur le fond", "rythme": "≈ 30 m par million d'années", "fond": "fond de la mer de la craie"}},
        {"court": "Au microscope", "titre": "La craie est faite de coccolithes, plaques de calcite de quelques millièmes de millimètre", "quand": "Pendant le dépôt", "scene": "vueMicroscope", "p": {"texture": "coccolithes", "titre": "Dans la craie, au microscope électronique", "lignes": ["coccolithes : plaques de", "calcite de quelques µm,", "fabriquées par des algues ;", "la silice des éponges se", "regroupe plus tard en silex"], "legende": [["#fbfaf6", "coccolithes"]], "duree": "des milliers d'années"}},
        {"court": "Enfouissement faible", "titre": "Restée peu enfouie, la craie n'est presque pas cimentée : elle garde jusqu'à 40 % de vides", "quand": "Depuis 72 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[72, 50, "#d8c7a0", "Paléogène : sables et argiles"]], "age0": 72, "age1": 50, "zmax": 0.4, "nomRoche": "la craie", "couleurRoche": "#f4f1e9", "grainFonce": "#e6dfd0", "grainClair": "#ffffff", "vides": [70, 40], "rythme": "peu enfouie", "grainLoupe": "#fbfaf6", "loupeTexte": ["au microscope : la boue de craie", "se tasse, presque sans ciment"]}},
      ],
      proc: "craie", p: { profEnf: "peu enfouie" },
      cond: { type: "carbonates", depots: [[50, 300, "mer de la craie : 50 à 300 m"]], chemin: [
        { x: 96, z: 20, n: 1, t: "Des algues microscopiques (coccolithophoridés) fabriquent de minuscules plaques de calcite dans l'eau de surface." },
        { x: 96, z: 150, n: 2, t: "Plaques et pelotes fécales tombent sur le fond, entre 50 et 200–300 m : bien au-dessus de la profondeur de compensation, rien ne se dissout (Cénomanien → Campanien, 100,5–72,2 Ma). La silice des éponges se regroupe en silex." },
        { n: 3, t: "Restée peu enfouie, la craie n'a presque pas été cimentée : elle garde jusqu'à 40 % de vides." }] },
      src: ["photique"],
    },
    tuffeau: {
      exemple: "Exemple suivi : le tuffeau de Touraine et du Saumurois (Turonien, 93,9–89,8 millions d'années), pierre des châteaux de la Loire.",
      anim: [
        {"court": "Dépôt", "titre": "Une mer peu profonde couvre la Touraine : calcite d'organismes, opale d'éponges, sable fin et micas", "quand": "Au Turonien (93,9–89,8 Ma)", "duree": "quelques millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 92, "age1": 90, "coquilles": 0.3, "couleurs": ["#ece2c4", "#e4d8b5"], "particules": "#f6efd9", "texte": "calcite, opale d'éponges, sable fin et micas se déposent", "rythme": "≈ 20 m par million d'années"}},
        {"court": "Mélange", "titre": "Le mélange ne contient qu'environ 50 % de calcite : le reste est opale, sable, micas et glauconie", "quand": "Pendant le dépôt", "scene": "vueMicroscope", "p": {"texture": "gres", "titre": "Dans le tuffeau, au microscope", "ciment": "#efe6cf", "lignes": ["calcite (≈ 50 %), opale", "d'éponges, sable fin,", "micas et glauconie verte,", "à peine soudés"], "legende": [["#ece8df", "quartz, calcite"], ["#d9b99b", "opale, glauconie"]], "jauge": {"nom": "vides", "de": 50, "a": 45, "couleur": "#8fc3e4"}}},
        {"court": "Enfouissement faible", "titre": "Peu enfoui et peu cimenté, il donne une pierre légère et tendre, facile à tailler", "quand": "Depuis 90 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[90, 66, "#e8e0c8", "Crétacé supérieur : craies"], [66, 40, "#d8c7a0", "Paléogène : sables et argiles"]], "age0": 90, "age1": 40, "zmax": 0.4, "nomRoche": "le tuffeau", "couleurRoche": "#ece2c4", "grainFonce": "#b8a57a", "grainClair": "#fbf6ea", "vides": [50, 45], "rythme": "peu enfoui", "grainLoupe": "#f1e8d0", "loupeTexte": ["au microscope : les grains", "se tassent à peine"]}},
      ],
      proc: "plateforme", p: { producteurs: "coquilles", prodTxt: "sable, micas et débris calcaires", profEnf: "peu enfoui" },
      titres: ["Mer peu profonde : calcite, sable fin, micas", null, "Enfouissement faible : roche légère et poreuse"],
      pe: [{}, {}, { loupe: "craie", loupeTxt: "50 % de vides" }],
      cond: { type: "carbonates", depots: [[10, 100, "plate-forme : quelques dizaines de mètres"]], chemin: [
        { x: 88, z: 10, n: 1, t: "Au Turonien (93,9–89,8 Ma), une mer peu profonde couvre la Touraine : calcite d'organismes, opale d'éponges, sable fin et micas." },
        { x: 50, z: 40, n: 2, t: "Ce mélange s'accumule sur la plate-forme ; il ne contient qu'environ 50 % de calcite." },
        { n: 3, t: "Peu enfoui et peu cimenté, il donne une pierre légère et tendre, facile à tailler." }] },
      src: ["plummer"],
    },
    falun: {
      exemple: "Exemple suivi : les faluns de Touraine et d'Anjou, sables coquilliers de la « mer des faluns » du Miocène (20–10 millions d'années).",
      anim: [
        {"court": "Mer des faluns", "titre": "Une mer chaude et peu profonde relie la Bretagne au Bassin parisien : coquilles, bryozoaires, requins", "quand": "Au Miocène (20–10 Ma)", "duree": "quelques millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 16, "age1": 14, "coquilles": 0.75, "couleurs": ["#e2d2a8", "#d8c592"], "particules": "#f0e6c8", "couleurCoq": "#f6efdc", "texte": "coquilles et débris s'accumulent sur le fond", "rythme": "des mètres par million d'années"}},
        {"court": "Vagues et courants", "titre": "Vagues et courants de marée brisent et trient les coquilles", "quand": "Pendant le dépôt", "scene": "vueMicroscope", "p": {"texture": "coquilles", "titre": "Dans le falun, à la loupe", "lignes": ["les vagues et les courants", "de marée brisent les", "coquilles et trient leurs", "débris"], "legende": [["#f5efe0", "coquilles"], ["#8aa36a", "bryozoaires"]], "duree": "des milliers d'années"}},
        {"court": "Jamais cimenté", "titre": "Les sables coquilliers s'accumulent et ne sont jamais cimentés : le falun reste meuble", "quand": "Depuis 10 millions d'années", "duree": "10 millions d'années", "scene": "enfouissement", "p": {"couches": [[10, 0, "#c9b891", "sables et limons plus récents"]], "age0": 10, "age1": 0.1, "zmax": 0.1, "nomRoche": "le falun", "couleurRoche": "#e2d2a8", "grainFonce": "#b8a57a", "grainClair": "#fbf6ea", "vides": [45, 43], "surface": ["plaine de la Loire", "#9dbb86"], "rythme": "jamais enfoui profondément", "grainLoupe": "#f5efe0", "loupeTexte": ["débris de coquilles", "jamais soudés : il reste meuble"]}},
      ],
      proc: "falun", p: { producteurs: "coquilles" },
      cond: { type: "carbonates", depots: [[3, 50, "mer des faluns : quelques mètres à dizaines de mètres"]], chemin: [
        { x: 80, z: 8, n: 1, t: "Au Miocène (20–10 Ma), une mer chaude et peu profonde relie la Bretagne au Bassin parisien : coquilles, bryozoaires, requins." },
        { x: 70, z: 15, n: 2, t: "Vagues et courants de marée brisent et trient les coquilles." },
        { n: 3, t: "Les sables coquilliers s'accumulent et ne sont jamais cimentés : le falun reste meuble." }] },
      src: ["plummer"],
    },
    dolomie: {
      exemple: "Exemple suivi : les dolomies des Causses (Montpellier-le-Vieux, Causse Noir), au Jurassique.",
      anim: [
        {"court": "Boues calcaires", "titre": "Des boues calcaires se déposent dans une lagune, sous climat chaud", "quand": "Au Jurassique (≈ 165 Ma)", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 168, "age1": 166, "coquilles": 0.15, "texte": "des boues calcaires couvrent le fond de la lagune"}},
        {"court": "Saumure", "titre": "L'évaporation concentre l'eau ; dès × 3,8, le gypse retire du calcium : le rapport magnésium / calcium augmente", "quand": "Au Jurassique", "duree": "des milliers d'années", "scene": "bassinEvaporation", "p": {"jusqua": "gypse", "dolomie": true, "libelleAge": "il y a ≈ 165 millions d'années"}},
        {"court": "Dolomitisation", "titre": "Plus dense, la saumure s'infiltre dans les boues ; le magnésium remplace une partie du calcium : la calcite devient dolomite", "quand": "Au Jurassique, puis en profondeur", "scene": "vueMicroscope", "p": {"texture": "dolomite", "titre": "Dans la boue calcaire, au microscope", "lignes": ["le magnésium de la saumure", "remplace une partie du", "calcium : la calcite devient", "dolomite, en rhomboèdres"], "legende": [["#f7f4ee", "calcite"], ["#dcc49a", "dolomite"]], "duree": "des milliers à des millions d'années"}},
        {"court": "Relief ruiniforme", "titre": "Dissoute inégalement, la dolomie donne des tours et des arches : Montpellier-le-Vieux", "quand": "Depuis quelques millions d'années", "scene": "degagement", "p": {"forme": "cheminee", "nom": "tours de dolomie", "couleur": "#d9c9a8", "couches": [["#b8a98a", "dolomie altérée en sable"], ["#a9a086", "marnes"], ["#8a7c66", ""]], "ages": [5, 0]}},
      ],
      proc: "dolomie", p: { profEnf: "sous la lagune" },
      cond: { type: "evaporation", couche: "gypse", chemin: [
        { an: 0, n: 1, t: "Boues calcaires d'une lagune ou d'un littoral, sous climat chaud (Trias alpin, Jurassique des Causses)." },
        { an: 3.68, n: 2, t: "L'évaporation concentre l'eau ; dès ≈ × 3,8, le gypse précipite et retire du calcium : le rapport magnésium/calcium de la saumure augmente." },
        { an: 4.2, n: 3, t: "Plus dense, cette saumure s'infiltre dans les boues calcaires, où le magnésium remplace une partie du calcium : la calcite devient dolomite. D'autres dolomies se forment plus tard, en profondeur." }] },
      src: ["adams"],
    },
    cargneule: {
      exemple: "Exemple suivi : les cargneules du Briançonnais (cols du Galibier et du Lautaret), faites de matériel du Trias broyé par les nappes alpines.",
      anim: [
        {"court": "Lagune", "titre": "Au Trias (Keuper), des lagunes déposent dolomies et gypse", "quand": "Au Keuper (≈ 220 Ma)", "duree": "des millions d'années", "scene": "bassinEvaporation", "p": {"jusqua": "gypse", "dolomie": true, "libelleAge": "il y a ≈ 220 millions d'années"}},
        {"court": "Broyage", "titre": "Bien plus tard, les nappes alpines glissent sur ces couches tendres et les broient en brèche", "quand": "Vers 40–30 millions d'années", "scene": "vueMicroscope", "p": {"texture": "breche", "titre": "Dans la couche broyée, à la loupe", "lignes": ["les nappes alpines glissent", "sur ces couches tendres :", "dolomie et gypse sont", "broyés en brèche"], "legende": [["#6f6a63", "fragments"]], "duree": "des millions d'années"}},
        {"court": "Dissolution", "titre": "L'eau souterraine dissout le gypse ; il reste un squelette de dolomie criblé de vacuoles", "quand": "Depuis quelques millions d'années", "scene": "vueMicroscope", "p": {"texture": "cargneule", "titre": "Dans la cargneule, à la loupe", "lignes": ["l'eau souterraine, sans cesse", "renouvelée, dissout le gypse", "(2,4 g/L dans l'eau pure) :", "il reste des vacuoles"], "legende": [["#e3c795", "dolomie"], ["#f6f4ef", "gypse (dissous)"], ["#3c3a36", "vacuoles"]], "duree": "des milliers à des millions d'années"}},
      ],
      proc: "cargneule", p: {},
      cond: { type: "evaporation", couche: "gypse", chemin: [
        { an: 0, n: 1, t: "Au Trias (Keuper), des lagunes déposent dolomies et gypse." },
        { an: 3.68, t: "Le gypse précipite au-delà de ≈ 3,8 fois la concentration de l'eau de mer." },
        { n: 2, t: "Bien plus tard, les nappes alpines glissent sur ces couches tendres et les broient en brèche." },
        { n: 3, t: "L'eau souterraine, sous-saturée, dissout le gypse : dans l'eau pure, il sature vers 2,4 g/L seulement, mais l'eau se renouvelle sans cesse." },
        { n: 4, t: "Il reste un squelette de dolomie criblé de vacuoles." }] },
    },
    marne: {
      exemple: "Exemple suivi : les marnes des « Terres Noires » de Digne (Jurassique) et du Kimméridgien de Chablis.",
      anim: [
        {"court": "Dépôt", "titre": "Le plancton fabrique de la calcite en surface ; les rivières apportent des argiles : les deux se déposent ensemble en eau calme", "quand": "Au Jurassique (≈ 160 Ma)", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 162, "age1": 160, "coquilles": 0.1, "couleurs": ["#8e918b", "#a6a79c"], "particules": "#e9e4d6", "texte": "calcite du plancton et argiles des rivières se déposent ensemble", "rythme": "≈ 50 m par million d'années", "eau": ["#86b0c4", "#4d7f9b"]}},
        {"court": "Au microscope", "titre": "35 à 65 % de calcite, le reste en argiles", "quand": "Pendant le dépôt", "scene": "vueMicroscope", "p": {"texture": "argile", "titre": "Dans la marne, au microscope", "lignes": ["paillettes d'argile mêlées", "à la calcite du plancton :", "35 à 65 % de calcite"], "legende": [["#8c7a60", "argiles"], ["#f4f1e9", "calcite"]], "jauge": {"nom": "calcite", "de": 50, "a": 50, "couleur": "#b8a57a"}}},
        {"court": "Enfouissement", "titre": "L'enfouissement tasse la boue et chasse l'eau", "quand": "De 160 à 100 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[160, 145, "#9aa28f", "Jurassique supérieur"], [145, 100, "#c9bfa5", "Crétacé inférieur"]], "age0": 160, "age1": 100, "zmax": 1.5, "nomRoche": "la boue marneuse", "couleurRoche": "#8e918b", "grainFonce": "#6b6a5c", "grainClair": "#d9d3c4", "vides": [70, 30], "rythme": "≈ 25 m par million d'années", "grainLoupe": "#b8b3a4", "loupeTexte": ["au microscope : la boue se tasse", "et perd son eau"]}},
      ],
      proc: "marne", p: {},
      cond: { type: "carbonates", depots: [[30, 500, "plate-forme externe et bassin"]], chemin: [
        { x: 92, z: 10, n: 1, t: "Le plancton fabrique de la calcite en surface ; les rivières apportent des argiles." },
        { x: 50, z: 150, n: 2, t: "Les deux se déposent ensemble en eau calme : 35 à 65 % de calcite, le reste en argiles (Lias, « Terres Noires », Kimméridgien)." },
        { n: 3, t: "L'enfouissement tasse la boue et chasse l'eau." }] },
      src: ["plummer"],
    },

    // ════════════════════════ S.3 chimiques et biochimiques ════════════════════════
    silex: {
      exemple: "Exemple suivi : les silex de la craie de Normandie et du Bassin parisien (Crétacé supérieur).",
      anim: [
        {"court": "Éponges", "titre": "Éponges et radiolaires fabriquent des squelettes d'opale dans une eau très pauvre en silice", "quand": "Au Crétacé supérieur", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 88, "age1": 86, "coquilles": 0.15, "couleurs": ["#f4f1e9", "#fbf9f4"], "particules": "#ffffff", "couleurCoq": "#c9d2cf", "texte": "boue de craie et squelettes d'opale des éponges", "rythme": "≈ 30 m par million d'années"}},
        {"court": "Rognons", "titre": "L'opale se dissout dans l'eau des pores, puis se redépose en rognons dans la craie peu enfouie", "quand": "Crétacé supérieur, craie peu enfouie", "scene": "vueMicroscope", "p": {"texture": "silex", "titre": "Dans la craie, à la loupe", "lignes": ["l'opale des éponges se", "dissout dans l'eau des pores,", "puis se redépose en rognons :", "le silex (plus tard", "calcédoine et quartz)"], "legende": [["#e9e6de", "craie"], ["#3b3a3d", "silex"]], "jauge": {"nom": "silice dissoute", "de": 90, "a": 25, "unite": "mg/L", "couleur": "#6f8f9f"}, "duree": "des millions d'années"}},
      ],
      proc: "silex", p: {},
      cond: { type: "silice", chemin: [
        { T: 12, C: 0.5, n: 1, t: "Éponges et radiolaires fabriquent des squelettes d'opale dans une eau de mer très pauvre en silice : c'est la vie qui la concentre." },
        { T: 12, C: 90, n: 2, t: "Après leur mort, l'opale se dissout dans l'eau des pores de la boue crayeuse, jusqu'à la saturation de l'opale." },
        { T: 16, C: 25, n: 3, t: "Sous-saturée pour l'opale mais sursaturée pour le quartz, cette eau dépose lentement de la silice en rognons dans la craie encore peu enfouie (Crétacé supérieur) : la silice dissoute diminue." },
        { T: 22, C: 10, t: "Au fil des millions d'années, même à basse température, l'opale recristallise en calcédoine et quartz." }] },
    },
    radiolarite: {
      exemple: "Exemple suivi : les radiolarites (jaspes) des ophiolites du Queyras et du Chenaillet, fonds de l'océan alpin (165–145 millions d'années).",
      anim: [
        {"court": "Plancton siliceux", "titre": "Les radiolaires bâtissent leur squelette d'opale ; leurs restes tombent sous la profondeur de compensation, où la calcite se dissout", "quand": "Au Jurassique supérieur (165–145 Ma)", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 160, "age1": 155, "coquilles": 0.4, "couleurs": ["#a4553c", "#b86a4e"], "particules": "#e9d3c4", "texte": "seule la silice des radiolaires atteint le fond", "ccd": "profondeur de compensation des carbonates", "eau": ["#3f6f95", "#1d3c5c"], "fond": "fond de l'océan alpin, vers 4 km", "rythme": "quelques mètres par million d'années", "couleurFond": "#7a4a38"}},
        {"court": "Au microscope", "titre": "L'opale des radiolaires recristallise : opale-CT vers 40 °C, quartz vers 50–60 °C", "quand": "Après l'enfouissement", "scene": "vueMicroscope", "p": {"texture": "radiolaires", "titre": "Dans la radiolarite, au microscope", "lignes": ["squelettes de radiolaires :", "l'opale-A devient opale-CT", "vers 40 °C, puis quartz vers", "50–60 °C ; l'hématite rougit", "la roche"], "legende": [["#f1efe8", "opale"], ["#b8785f", "quartz et hématite"]], "thermo": [20, 60]}},
        {"court": "Enfouissement", "titre": "La boue siliceuse s'accumule très lentement puis s'enfouit ; recristallisée, la radiolarite est dure", "quand": "De 145 à 100 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[150, 120, "#c9bfa5", "calcaires pélagiques"], [120, 100, "#9aa28f", "schistes"]], "age0": 150, "age1": 100, "zmax": 1.6, "gradient": 30, "thermo": 100, "texteThermo": "enfouie, elle chauffe : l'opale recristallise", "nomRoche": "la boue à radiolaires", "couleurRoche": "#a4553c", "surface": ["mer profonde", "#3f6f95"], "rythme": "très lent"}},
      ],
      proc: "radiolarite", p: {},
      cond: { type: "silice", chemin: [
        { T: 20, C: 0.3, n: 1, t: "Les radiolaires bâtissent leur squelette d'opale dans les eaux de surface de l'océan alpin." },
        { T: 2, C: 8, n: 2, t: "Leurs restes tombent sous la profondeur de compensation des carbonates : la calcite se dissout, la silice reste." },
        { T: 38, C: 150, n: 3, t: "La boue siliceuse s'accumule très lentement, puis s'enfouit ; vers 40 °C, l'opale-A devient opale-CT." },
        { T: 60, C: 27, n: 4, t: "Vers 50–60 °C, l'opale-CT recristallise en quartz : la radiolarite est dure (Jurassique supérieur, 165–145 Ma)." }] },
      src: ["ccd"],
    },
    diatomite: {
      exemple: "Exemple suivi : les diatomites des lacs volcaniques du Massif central (Velay, Cantal), entre 15 et 2 millions d'années.",
      anim: [
        {"court": "Diatomées", "titre": "Dans les lacs volcaniques, riches en silice, les diatomées fabriquent leurs frustules d'opale ; ils tombent au fond", "quand": "Entre 15 et 2 millions d'années", "duree": "des milliers d'années", "scene": "accumulationCarbonatee", "p": {"age0": 8, "age1": 7.9, "coquilles": 0.3, "couleurs": ["#ebe9e1", "#f5f3ee"], "particules": "#ffffff", "couleurCoq": "#dfe6e2", "texte": "les frustules d'opale des diatomées tombent au fond du lac", "eau": ["#8fb9a8", "#4d7f6f"], "fond": "fond du lac", "rythme": "des millimètres par an"}},
        {"court": "Au microscope", "titre": "Jamais chauffée au-delà d'une trentaine de degrés, l'opale n'a pas recristallisé : les frustules restent intacts", "quand": "Depuis le dépôt", "scene": "vueMicroscope", "p": {"texture": "diatomees", "titre": "Dans la diatomite, au microscope", "lignes": ["frustules de diatomées,", "en opale : jamais chauffée,", "la roche garde ses", "squelettes intacts, d'où", "sa légèreté"], "legende": [["#9aa6a6", "frustules d'opale"]], "thermo": [15, 30]}},
      ],
      proc: "diatomite", p: { lac: true },
      cond: { type: "silice", chemin: [
        { T: 15, C: 5, n: 1, t: "Dans les lacs volcaniques du Massif central, riches en silice, les diatomées fabriquent leurs frustules d'opale." },
        { T: 12, C: 90, n: 2, t: "Les frustules tombent au fond ; une partie se dissout jusqu'à la saturation de l'opale." },
        { T: 20, C: 105, n: 3, t: "Jamais chauffée au-delà d'une trentaine de degrés, l'opale-A n'a pas recristallisé : la diatomite garde ses frustules intacts, d'où sa légèreté (15–2 Ma)." }] },
    },
    gaize: {
      exemple: "Exemple suivi : la gaize de l'Argonne (Meuse, Marne), à l'Albien (113–100,5 millions d'années).",
      anim: [
        {"court": "Éponges", "titre": "Sur le fond de la mer albienne, les éponges fabriquent des spicules d'opale ; argile et glauconie s'y mêlent", "quand": "À l'Albien (113–100,5 Ma)", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 108, "age1": 105, "coquilles": 0.3, "couleurs": ["#b9b39a", "#aaa488"], "particules": "#e9e6d6", "couleurCoq": "#e5e8e3", "texte": "spicules d'éponges, argile et glauconie se déposent", "rythme": "≈ 20 m par million d'années"}},
        {"court": "Opale-CT", "titre": "Enfouie, l'opale recristallise en opale-CT qui soude la roche sans la remplir : la gaize reste légère et poreuse", "quand": "Après l'enfouissement", "scene": "vueMicroscope", "p": {"texture": "spicules", "titre": "Dans la gaize, au microscope", "ciment": "#dcd8c6", "lignes": ["spicules d'éponges soudés", "par de l'opale-CT, sans", "combler les vides : une", "roche légère et poreuse"], "legende": [["#f1eee6", "spicules d'opale"], ["#5f8a4a", "glauconie"]], "thermo": [16, 40]}},
      ],
      proc: "gaize", p: {},
      cond: { type: "silice", chemin: [
        { T: 14, C: 0.5, n: 1, t: "Sur le fond de la mer albienne, les éponges fabriquent des spicules d'opale ; argile et glauconie s'y mêlent." },
        { T: 16, C: 95, n: 2, t: "Les spicules se dissolvent en partie dans l'eau des pores." },
        { T: 40, C: 150, n: 3, t: "Enfouie, l'opale recristallise en opale-CT qui soude la roche sans la remplir : la gaize reste légère et poreuse (113–100,5 Ma)." }] },
    },
    gypse: {
      exemple: "Exemple suivi : le gypse de Montmartre et de Cormeilles (Bassin parisien), au Priabonien (≈ 37–34 millions d'années).",
      anim: [
        {"court": "Évaporation", "titre": "L'eau de mer entre dans un bassin presque fermé ; l'évaporation la concentre jusqu'à × 3,8 : le gypse précipite", "quand": "Au Priabonien (≈ 37–34 Ma)", "duree": "quelques années pour doubler la concentration", "scene": "bassinEvaporation", "p": {"jusqua": "gypse", "libelleAge": "il y a ≈ 36 millions d'années"}},
        {"court": "Bancs de gypse", "titre": "Tant que le bassin est réalimenté, le gypse s'empile, sur des milliers d'années", "quand": "Au Priabonien", "scene": "vueMicroscope", "p": {"texture": "evaporite", "titre": "Dans le gypse, à la loupe", "lignes": ["cristaux de gypse en fer", "de lance, qui grandissent", "dans la saumure entre", "× 3,8 et × 10,6"], "legende": [["#fbfaf6", "gypse"]], "duree": "des milliers d'années"}},
      ],
      proc: "evaporite", p: { mineral: "gypse", couche: "gypse", facteurTxt: "× 3,8 : le gypse sature" },
      cond: { type: "evaporation", couche: "gypse", chemin: [
        { an: 0, n: 1, t: "L'eau de mer (× 1) entre dans un bassin presque fermé, sous climat chaud et sec." },
        { an: 2.5, n: 2, t: "L'évaporation la concentre : dans l'exemple, elle a doublé en 2 ans et demi." },
        { an: 3.68, n: 3, t: "À × 3,8, le gypse précipite. Dans l'eau pure, il sature dès ≈ 2,4 g/L ; dans l'eau de mer, les autres ions retardent sa saturation." },
        { an: 4.3, n: 4, t: "Tant que le bassin est réalimenté et que la saumure reste entre × 3,8 et × 10,6, le gypse s'empile, sur des milliers d'années (Keuper, Priabonien)." }] },
    },
    anhydrite: {
      exemple: "Exemple suivi : l'anhydrite du Trias des Alpes et de Lorraine (250–200 millions d'années).",
      anim: [
        {"court": "Évaporation", "titre": "Dans une lagune presque fermée, l'eau de mer s'évapore jusqu'à × 3,8 : le sulfate de calcium précipite", "quand": "Au Trias (250–200 Ma)", "duree": "des milliers d'années", "scene": "bassinEvaporation", "p": {"jusqua": "gypse", "libelleAge": "il y a ≈ 230 millions d'années"}},
        {"court": "Gypse", "titre": "Du gypse se dépose, ou directement de l'anhydrite dans les saumures les plus chaudes et salées", "quand": "Au Trias", "scene": "vueMicroscope", "p": {"texture": "evaporite", "titre": "Dans la couche, à la loupe", "lignes": ["cristaux de gypse", "(ou d'anhydrite dans les", "saumures les plus chaudes)"], "legende": [["#fbfaf6", "gypse"]], "duree": "des milliers d'années"}},
        {"court": "Enfouissement", "titre": "Au-delà de ≈ 42–58 °C (≈ 1–1,5 km), le gypse perd son eau et devient anhydrite", "quand": "De 230 à 150 millions d'années", "duree": "des dizaines de millions d'années", "scene": "enfouissement", "p": {"couches": [[230, 200, "#c9bfa5", "Trias : argiles et dolomies"], [200, 150, "#9aa28f", "Jurassique : marnes et calcaires"]], "age0": 230, "age1": 150, "zmax": 1.8, "gradient": 30, "thermo": 100, "texteThermo": "vers 42–58 °C, le gypse devient anhydrite", "nomRoche": "le gypse", "couleurRoche": "#f2efe8"}},
      ],
      proc: "evaporite", p: { mineral: "gypse", couche: "gypse", enfouiTxt: "enfoui : gypse → anhydrite" },
      titres: [null, null, "Saturation : gypse, ou anhydrite dans les lagunes les plus chaudes", "Enfouissement : le gypse perd son eau"],
      cond: { type: "evaporation", couche: "gypse", chemin: [
        { an: 0, n: 1, t: "L'eau de mer entre dans une lagune presque fermée (Trias, 250–200 Ma)." },
        { an: 2.5, n: 2, t: "L'évaporation la concentre." },
        { an: 3.68, n: 3, t: "À × 3,8, le sulfate de calcium précipite : du gypse, ou directement de l'anhydrite dans les saumures les plus chaudes et salées." },
        { n: 4, t: "Enfoui au-delà de ≈ 42–58 °C (≈ 1–1,5 km), le gypse perd son eau et devient anhydrite ; ramené près de la surface, il se réhydrate en gonflant." }] },
      src: ["hardie", "gradient"],
    },
    sel: {
      exemple: "Exemple suivi : le sel gemme du Keuper de Lorraine (Varangéville, dernière mine active de France), vers 220 millions d'années.",
      anim: [
        {"court": "Évaporation", "titre": "L'eau de mer s'évapore : carbonates et gypse d'abord, puis, à × 10,6, le sel (halite)", "quand": "Au Keuper (≈ 220 Ma)", "duree": "des milliers d'années", "scene": "bassinEvaporation", "p": {"jusqua": "halite", "libelleAge": "il y a ≈ 220 millions d'années"}},
        {"court": "Bancs de sel", "titre": "Il ne reste que 9 % de l'eau : les cubes de halite s'empilent en bancs", "quand": "Au Keuper", "scene": "vueMicroscope", "p": {"texture": "evaporite", "titre": "Dans le sel gemme, à la loupe", "lignes": ["cubes de halite ; il ne reste", "que 9 % de l'eau de mer", "quand le sel sature"], "legende": [["#f6f3ee", "halite"], ["#fbfaf6", "gypse"]], "duree": "des milliers d'années"}},
        {"court": "Fluage", "titre": "Enfoui, le sel flue comme un glacier : moins dense et plastique, il peut monter en dômes", "quand": "Depuis 220 millions d'années", "duree": "des dizaines de millions d'années", "scene": "diapir", "p": {"ages": [200, 50]}},
      ],
      proc: "evaporite", p: { mineral: "halite", couche: "sel gemme", facteurTxt: "× 10,6 : le sel sature" },
      cond: { type: "evaporation", couche: "sel gemme", chemin: [
        { an: 0, n: 1, t: "L'eau de mer entre dans un bassin presque fermé (Keuper de Lorraine et du Jura ; Oligocène du fossé rhénan)." },
        { an: 3.68, n: 2, t: "Carbonates puis gypse précipitent en premier." },
        { an: 4.53, n: 3, t: "À × 10,6, il ne reste que 9 % de l'eau : la halite précipite." },
        { an: 4.7, n: 4, t: "Les bancs de sel s'accumulent tant que le bassin est réalimenté ; enfouis, ils fluent comme un glacier." }] },
    },
    sylvinite: {
      exemple: "Exemple suivi : les sels potassiques d'Alsace (Wittelsheim), dans le fossé rhénan à l'Oligocène (35–30 millions d'années).",
      anim: [
        {"court": "Évaporation extrême", "titre": "Après le gypse et le sel, au-delà de × 65, il ne reste que 1,5 % de l'eau : les sels de potassium précipitent", "quand": "À l'Oligocène (35–30 Ma)", "duree": "des milliers d'années", "scene": "bassinEvaporation", "p": {"jusqua": "potasse", "libelleAge": "il y a ≈ 33 millions d'années"}},
        {"court": "Sylvinite", "titre": "La sylvinite mêle halite et sylvite ; une partie de la sylvite provient de la transformation de la carnallite", "quand": "À l'Oligocène", "scene": "vueMicroscope", "p": {"texture": "evaporite", "titre": "Dans la sylvinite, à la loupe", "lignes": ["cubes de halite (blancs)", "et de sylvite (rosés) :", "le chlorure de potassium,", "extrait comme engrais"], "legende": [["#f6f3ee", "halite"], ["#e9c9b8", "sylvite"]], "duree": "des milliers d'années"}},
      ],
      proc: "evaporite", p: { mineral: "sylvite", couche: "sels de potassium", facteurTxt: "au-delà de × 65 : sels de potassium" },
      cond: { type: "evaporation", couche: "sels de potassium", chemin: [
        { an: 0, n: 1, t: "L'eau entre dans le bassin potassique d'Alsace (Oligocène, 35–30 Ma)." },
        { an: 4.53, n: 2, t: "Après le gypse, la halite précipite à × 10,6." },
        { an: 4.93, n: 3, t: "Au-delà de ≈ × 65, il ne reste que 1,5 % de l'eau : sels de magnésium et de potassium précipitent." },
        { n: 4, t: "La sylvinite mêle halite et sylvite ; une partie de la sylvite provient souvent de la transformation de la carnallite." }] },
    },
    phosphorite: {
      exemple: "Exemple suivi : les phosphorites du Quercy (Lot), poches karstiques remplies entre 42 et 27 millions d'années.",
      anim: [
        {"court": "Karst", "titre": "L'eau de pluie, enrichie en CO₂ dans le sol, dissout le calcaire et creuse poches et conduits", "quand": "Dès le Lutétien (≈ 45 Ma)", "duree": "des millions d'années", "scene": "karst", "p": {"age0": 45, "age1": 42}},
        {"court": "Remplissage", "titre": "Les poches se remplissent d'argiles et de restes de vertébrés", "quand": "De 42 à 27 millions d'années", "duree": "des millions d'années", "scene": "pocheRemplissage", "p": {"ages": [42, 32]}},
        {"court": "Phosphatisation", "titre": "Des eaux acides chargées de phosphate, issues du guano et des cadavres, attaquent le calcaire : l'apatite précipite", "quand": "De 42 à 27 millions d'années", "duree": "des millions d'années", "scene": "pochePhosphate", "p": {"ages": [32, 27]}},
      ],
      proc: "phosphorite", p: {},
      cond: { type: "calcite", chemin: [
        { pco2: 0.02, Ca: 8, n: 1, t: "L'eau de pluie, enrichie en CO₂ dans le sol, est sous-saturée : elle dissout le calcaire et creuse poches et conduits (karst, dès le Lutétien)." },
        { pco2: 0.02, Ca: 100, t: "Elle se charge en calcium jusqu'à l'équilibre." },
        { n: 2, t: "Les poches se remplissent d'argiles et de restes de vertébrés (42–27 Ma)." },
        { n: 3, t: "Des eaux acides chargées de phosphate, issues des dépôts de guano et de cadavres (surtout de chauves-souris), attaquent le calcaire : le phosphate précipite en apatite, en nodules et en croûtes." }] },
      src: ["quercy"],
    },
    roche_ferrifere: {
      exemple: "Exemple suivi : les fers rubanés de l'Archéen et du Paléoprotérozoïque (3 800–1 800 millions d'années), comme ceux d'Hamersley (Australie).",
      anim: [
        {"court": "Océan sans oxygène", "titre": "Le fer dissous (Fe²⁺) remonte vers les plateaux, où l'oxygène des cyanobactéries l'oxyde : les oxydes de fer précipitent", "quand": "Vers 2 500 millions d'années", "duree": "des millions d'années", "scene": "ferRubane", "p": {"ages": [2500, 2450]}},
        {"court": "Fer rubané", "titre": "Lits de fer et de silice alternent : les fers rubanés. La minette de Lorraine s'est formée autrement, en oolithes, dans une mer peu profonde", "quand": "De 3 800 à 1 800 millions d'années", "scene": "vueMicroscope", "p": {"texture": "rubane", "titre": "Dans le fer rubané, à la loupe", "lignes": ["lits rouges d'hématite et", "lits gris de silice", "alternent, par millions"], "legende": [["#a8452a", "hématite"], ["#b9b4ad", "silice (chert)"]]}},
      ],
      proc: "fer", p: {},
      cond: { type: "ehph", systeme: "fer", etiquettes: [["Fe²⁺ dissous", 3.5, 0.1], ["oxydes de fer solides", 10.5, 0.5]], chemin: [
        { pH: 7, Eh: -0.3, n: 1, t: "Dans l'océan sans oxygène de l'Archéen, le fer reste dissous sous forme de Fe²⁺." },
        { pH: 7.5, Eh: -0.25 },
        { pH: 8, Eh: 0.45, n: 2, t: "Les courants le remontent vers les plateaux, où l'oxygène produit par les cyanobactéries l'oxyde : les oxydes de fer, insolubles, précipitent." },
        { n: 3, t: "Lits de fer et de silice alternent : les fers rubanés (3 800–1 800 Ma). La minette de Lorraine (Aalénien) s'est formée autrement, en oolithes dans une mer peu profonde." }] },
    },
    travertin: {
      exemple: "Exemple suivi : les cascades pétrifiantes d'Auvergne et du Jura, travertins encore en formation aujourd'hui.",
      anim: [
        {"court": "Dissolution", "titre": "L'eau de pluie traverse le sol, s'enrichit en CO₂ et dissout le calcaire", "quand": "Aujourd'hui, sans interruption", "duree": "des années dans le massif", "scene": "karst", "p": {"age0": 0, "age1": 0}},
        {"court": "Dépôt", "titre": "À la source, le CO₂ s'échappe ; l'eau, sursaturée, dépose de la calcite sur les mousses", "quand": "Aujourd'hui", "duree": "quelques millimètres à centimètres par an", "scene": "sourceTravertin", "p": {"caDebut": 125, "caFin": 45, "libelleAge": "aujourd'hui"}},
      ],
      proc: "travertin", p: { karstTxt: "l'eau chargée de CO₂ dissout le calcaire" },
      cond: { type: "calcite", chemin: [
        { pco2: 0.03, Ca: 12, n: 1, t: "L'eau de pluie traverse le sol, où racines et microbes l'enrichissent en CO₂ (ici 3 %) : elle dissout le calcaire." },
        { pco2: 0.03, Ca: 125, t: "À 10 °C, elle peut porter ≈ 125 mg/L de calcium avant d'être saturée." },
        { pco2: 0.0004, Ca: 125, n: 2, t: "À la résurgence et dans les cascades, le CO₂ s'échappe vers l'air (0,04 %) : l'eau porte maintenant 4 à 5 fois plus de calcium que l'équilibre." },
        { pco2: 0.0004, Ca: 45, n: 3, t: "La calcite précipite sur les mousses et les débris jusqu'à ce que l'eau se rapproche de l'équilibre (Quaternaire à actuel)." }] },
    },

    // ════════════════════════ S.4 organiques ════════════════════════
    tourbe: {
      exemple: "Exemple suivi : les tourbières du Jura (Frasne) et des monts d'Arrée (Yeun Elez), depuis la fin de la dernière glaciation.",
      anim: [
        {"court": "Tourbière", "titre": "Là où il pleut plus que l'eau ne s'évapore, sous climat frais, le sol reste gorgé d'eau : les sphaignes prospèrent", "quand": "Depuis 11 700 ans", "duree": "de l'ordre d'un millimètre par an", "scene": "marecageForet", "p": {"mode": "tourbiere", "libelleAge": "depuis 11 700 ans", "texte1": "dans l'eau froide et acide, les sphaignes mortes ne pourrissent pas"}},
        {"court": "Décomposition bloquée", "titre": "L'eau stagnante, acide et pauvre en oxygène, bloque la décomposition : les végétaux s'accumulent", "quand": "Depuis 11 700 ans", "scene": "vueMicroscope", "p": {"texture": "charbon", "titre": "Dans la tourbe, au microscope", "lignes": ["tissus végétaux à peine", "décomposés : sans oxygène,", "les microbes ne les", "détruisent pas"], "legende": [["#8a6a3f", "tissus végétaux"]], "jauge": {"nom": "oxygène dans l'eau", "de": 100, "a": 5, "couleur": "#3f8fd2"}}},
      ],
      proc: "tourbe", p: {},
      cond: { type: "climat", domaines: [[-2, 13, 1, 2.5]], etiquettes: [["tourbières hautes", 5.5, 2.1]], villes: ["Brest", "Mont Aigoual", "Chamonix", "Paris"], chemin: [
        { T: 7, ai: 1.6, n: 1, t: "Là où il pleut plus que l'eau ne s'évapore, sous climat frais, le sol reste gorgé d'eau : les sphaignes y prospèrent." },
        { n: 2, t: "L'eau stagnante, acide et pauvre en oxygène, bloque la décomposition des végétaux morts." },
        { n: 3, t: "Ils s'accumulent depuis la fin de la dernière glaciation (11 700 ans). Les tourbières basses peuvent aussi exister sous climat plus sec, alimentées par une nappe." }] },
      src: ["charman"],
    },
    lignite: {
      exemple: "Exemple suivi : le lignite du bassin de Fuveau-Gardanne (Provence), forêts marécageuses du Crétacé supérieur.",
      anim: [
        {"court": "Forêt marécageuse", "titre": "Des forêts marécageuses couvrent des bassins continentaux ; la tourbe s'accumule", "quand": "Au Crétacé supérieur (≈ 72 Ma)", "duree": "des milliers d'années par couche", "scene": "marecageForet", "p": {"mode": "cretace", "ages": [72, 71]}},
        {"court": "Enfouissement", "titre": "La tourbe est recouverte de sédiments", "quand": "De 70 à 60 millions d'années", "duree": "des millions d'années", "scene": "marecageEnfouissement", "p": {"mode": "cretace", "ages": [71, 60]}},
        {"court": "Lignite", "titre": "Restée à moins de ≈ 50 °C, elle ne dépasse pas le stade du lignite : on y reconnaît encore le bois", "quand": "De 60 à 30 millions d'années", "duree": "30 millions d'années", "scene": "enfouissement", "p": {"couches": [[60, 45, "#c9a98a", "Paléogène : argiles"], [45, 30, "#d8cdb0", "calcaires de lac"]], "age0": 60, "age1": 30, "zmax": 1.2, "gradient": 30, "rang": "charbon", "nomRoche": "la tourbe", "couleurRoche": "#2d231c", "surface": ["plaine et lacs", "#8fb0a0"]}},
      ],
      proc: "charbon", p: { rang: "lignite", profCharbon: "< ≈ 1,5 km", tCharbon: "< ≈ 50 °C" },
      cond: { type: "enfouissement", tmax: 80, zmax: 8, seuils: ["lignite", "subbitumineux", "houille", "anthracite"], chemin: [
        { age: 72, z: 0, n: 1, t: "Au Crétacé supérieur et à l'Éocène (72–34 Ma), des forêts marécageuses couvrent des bassins continentaux." },
        { age: 60, z: 0.3, n: 2, t: "La tourbe est recouverte de sédiments." },
        { age: 30, z: 1.2, n: 3, t: "Restée à moins de ≈ 50 °C, elle ne dépasse pas le stade du lignite : on y reconnaît encore le bois." },
        { age: 0, z: 0.2 }] },
      src: ["gradient", "burnham"],
    },
    houille: {
      exemple: "Exemple suivi : la houille du bassin minier du Nord et de Lorraine, forêts du Carbonifère supérieur (323–299 millions d'années).",
      anim: [
        {"court": "Forêt marécageuse", "titre": "D'immenses forêts de fougères arborescentes poussent dans des marécages équatoriaux ; dans l'eau sans oxygène, la tourbe s'accumule", "quand": "Au Carbonifère supérieur (323–299 Ma)", "duree": "des milliers d'années par couche", "scene": "marecageForet", "p": {"mode": "houiller", "ages": [315, 313]}},
        {"court": "Enfouissement rapide", "titre": "Les bassins houillers s'enfoncent vite : la tourbe est recouverte, couche après couche", "quand": "Vers 310 millions d'années", "duree": "des millions d'années", "scene": "marecageEnfouissement", "p": {"mode": "houiller", "ages": [313, 305]}},
        {"court": "Houillification", "titre": "Portée à ≈ 100–200 °C, la tourbe perd eau et matières volatiles : houille", "quand": "De 305 à 295 millions d'années", "duree": "des millions d'années", "scene": "enfouissement", "p": {"couches": [[310, 300, "#6f6a60", "Carbonifère : grès et schistes"], [300, 290, "#9a8a70", "Stéphanien–Permien"]], "age0": 310, "age1": 290, "zmax": 4, "gradient": 40, "rang": "charbon", "nomRoche": "la tourbe", "couleurRoche": "#2d231c", "surface": ["plaine marécageuse", "#6f9a5a"]}},
      ],
      proc: "charbon", p: { foret: "carbonifere", rang: "houille", profCharbon: "≈ 3–6 km", tCharbon: "≈ 100–200 °C" },
      pe: [{ foret: "carbonifere" }, {}, {}],
      titres: ["Forêts marécageuses du Carbonifère", null, null],
      cond: { type: "enfouissement", tmax: 330, zmax: 8, seuils: ["lignite", "subbitumineux", "houille", "anthracite"], chemin: [
        { age: 323, z: 0, n: 1, t: "Au Carbonifère supérieur (323–299 Ma), d'immenses forêts de fougères arborescentes poussent dans des marécages équatoriaux." },
        { age: 310, z: 1.0, n: 2, t: "Les bassins houillers s'enfoncent vite : la tourbe est recouverte, couche après couche." },
        { age: 295, z: 4.0, n: 3, t: "Portée à ≈ 100–200 °C, elle perd eau et matières volatiles : houille (Nord, Lorraine, Saint-Étienne)." },
        { age: 250, z: 3.5 }, { age: 0, z: 0 }] },
      src: ["gradient", "burnham"],
    },
    anthracite: {
      exemple: "Exemple suivi : l'anthracite de La Mure (Isère), charbon du Carbonifère porté au-delà de 200 °C.",
      anim: [
        {"court": "Forêt marécageuse", "titre": "Forêts houillères du Carbonifère : la tourbe s'accumule", "quand": "Au Carbonifère (320–300 Ma)", "duree": "des milliers d'années par couche", "scene": "marecageForet", "p": {"mode": "houiller", "ages": [315, 313]}},
        {"court": "Enfouissement", "titre": "La tourbe est enfouie sous des kilomètres de sédiments", "quand": "Vers 305 millions d'années", "duree": "des millions d'années", "scene": "marecageEnfouissement", "p": {"mode": "houiller", "ages": [313, 305]}},
        {"court": "Anthracite", "titre": "Au-delà de ≈ 200 °C, presque toute la matière volatile est partie : il reste un carbone presque pur", "quand": "De 305 à 290 millions d'années", "duree": "des millions d'années", "scene": "enfouissement", "p": {"couches": [[310, 300, "#6f6a60", "Carbonifère : grès et schistes"], [300, 290, "#9a8a70", "Stéphanien–Permien"]], "age0": 305, "age1": 290, "zmax": 6.6, "gradient": 30, "rang": "charbon", "nomRoche": "la tourbe", "couleurRoche": "#1f1a17", "surface": ["plaine marécageuse", "#6f9a5a"]}},
      ],
      proc: "charbon", p: { foret: "carbonifere", rang: "anthracite", profCharbon: "≈ 6–8 km", tCharbon: "> ≈ 200 °C" },
      titres: ["Forêts marécageuses du Carbonifère", null, null],
      cond: { type: "enfouissement", tmax: 330, zmax: 8, seuils: ["lignite", "subbitumineux", "houille", "anthracite"], chemin: [
        { age: 320, z: 0, n: 1, t: "Forêts houillères du Carbonifère (320–300 Ma)." },
        { age: 305, z: 1.5, n: 2, t: "La tourbe est enfouie." },
        { age: 290, z: 6.6, n: 3, t: "Au-delà de ≈ 200 °C, presque toute la matière volatile est partie : il reste un carbone presque pur. À La Mure, la tectonique alpine a encore déformé le charbon." },
        { age: 250, z: 6 }, { age: 0, z: 0 }] },
      src: ["gradient", "burnham"],
    },
    schiste_bitumineux: {
      exemple: "Exemple suivi : les « schistes carton » du Toarcien (≈ 182 millions d'années), en Lorraine et dans les Causses.",
      anim: [
        {"court": "Mer sans oxygène", "titre": "Le plancton prolifère dans une mer dont le fond manque d'oxygène : la matière organique n'est pas détruite", "quand": "Au Toarcien (≈ 182 Ma)", "duree": "des millions d'années", "scene": "depotPelites", "p": {"age0": 182, "age1": 180, "couleurs": ["#2f2d29", "#403c35"], "particules": "#6f8f4a", "texte": "plancton mort et argiles tombent sur un fond sans oxygène", "rythme": "des milliers d'années chacun"}},
        {"court": "Boue noire", "titre": "La boue devient noire et feuilletée", "quand": "Pendant le dépôt", "scene": "vueMicroscope", "p": {"texture": "argile", "titre": "Dans la boue, au microscope", "ciment": "#2f2a24", "lignes": ["paillettes d'argile et", "lamelles de matière", "organique : sans oxygène,", "rien ne la détruit"], "legende": [["#8c7a60", "argiles"], ["#2f2a24", "matière organique"]]}},
        {"court": "Enfouissement", "titre": "Restée à moins de ≈ 2 km, la roche n'a pas atteint la fenêtre à pétrole : le kérogène est intact", "quand": "De 180 à 100 millions d'années", "duree": "80 millions d'années", "scene": "enfouissement", "p": {"couches": [[180, 150, "#9aa28f", "Jurassique : marnes et calcaires"], [150, 100, "#c9bfa5", "Crétacé inférieur"]], "age0": 180, "age1": 100, "zmax": 1.6, "gradient": 30, "rang": "petrole", "nomRoche": "la boue noire", "couleurRoche": "#2f2d29"}},
      ],
      proc: "rocheMere", p: { rang: "", profCharbon: "< ≈ 2 km", tCharbon: "< ≈ 70 °C" },
      cond: { type: "enfouissement", tmax: 190, zmax: 5, seuils: ["huile"], chemin: [
        { age: 182, z: 0, n: 1, t: "Au Toarcien (≈ 182 Ma), le plancton prolifère dans une mer dont le fond manque d'oxygène (à Autun, c'était un lac permien)." },
        { age: 175, z: 0.2, n: 2, t: "Sans oxygène, la matière organique n'est pas détruite : la boue devient noire et feuilletée." },
        { age: 100, z: 1.6, n: 3, t: "Là où elle est restée à moins de ≈ 2 km, la roche n'a pas atteint la fenêtre à pétrole : le kérogène est intact, d'où la distillation nécessaire pour en tirer de l'huile." },
        { age: 0, z: 0.5 }] },
      src: ["gradient", "burnham"],
    },

    // ════════════════════════ S.5 altération ════════════════════════
    bauxite: {
      exemple: "Exemple suivi : les bauxites des Baux-de-Provence et du Var, nées sous le climat tropical du Crétacé « moyen » (125–90 millions d'années).",
      anim: [
        {"court": "Lessivage", "titre": "Sous un climat tropical très pluvieux, l'eau traverse sans cesse le sol : elle emporte les cations, puis la silice des argiles", "quand": "Au Crétacé « moyen » (125–90 Ma)", "duree": "des millions d'années", "scene": "profilDebut", "p": {"rocheMere": ["calcaire", "#e9e2cb"], "horizons": [["sol", "#6b4a2f", 0.15], ["bauxite", "#b8553a", 0.5], ["kaolinite", "#d8c7b0", 0.35]], "dissous": ["cations, puis la silice", "des argiles"], "climat": "Crétacé : > 22 °C, pluie > évaporation", "ages": [120, 105]}},
        {"court": "Résidu d'aluminium", "titre": "Il reste les hydroxydes d'aluminium (gibbsite) et de fer : il faut des millions d'années pour faire une bauxite", "quand": "Au Crétacé « moyen »", "duree": "des millions d'années", "scene": "profilFin", "p": {"rocheMere": ["calcaire", "#e9e2cb"], "horizons": [["sol", "#6b4a2f", 0.15], ["bauxite", "#b8553a", 0.5], ["kaolinite", "#d8c7b0", 0.35]], "dissous": ["cations, puis la silice", "des argiles"], "climat": "Crétacé : > 22 °C, pluie > évaporation", "ages": [105, 90]}},
        {"court": "Bauxite", "titre": "Pisolithes rouges de gibbsite et d'hématite ; aujourd'hui (Marseille, pluie = 42 % de l'évaporation), elles sont héritées", "quand": "Depuis 90 millions d'années", "scene": "vueMicroscope", "p": {"texture": "oolithes", "titre": "Dans la bauxite, à la loupe", "ciment": "#b8553a", "lignes": ["pisolithes de gibbsite", "(aluminium) et d'hématite", "(fer) : le minerai", "d'aluminium"], "legende": [["#efe6cc", "gibbsite"], ["#b8553a", "hématite"]]}},
      ],
      proc: "lateritique", p: { horizons: [["sol", "#6b4a2f"], ["bauxite", "#b8553a"], ["kaolinite", "#d8c7b0"], ["calcaire", "#e9e2cb"]] },
      pe: [{}, { horizons: [["sol", "#6b4a2f"], ["argiles", "#caa27f"], ["calcaire", "#e9e2cb"]], lessivage: true }, { actif: "bauxite" }],
      cond: { type: "climat", domaines: [[22, 30, 1, 2.5]], etiquettes: [["bauxites", 26, 2.2]], villes: ["Marseille"], chemin: [
        { T: 26, ai: 1.7, n: 1, t: "Au Crétacé « moyen » (125–90 Ma), la Provence est tropicale et très pluvieuse : pluie supérieure à l'ETP, plus de 22 °C." },
        { n: 2, t: "L'eau traverse sans cesse le sol : elle emporte d'abord les cations, puis la silice des argiles." },
        { T: 26, ai: 1.4, n: 3, t: "Il reste les hydroxydes d'aluminium (gibbsite) et de fer : il faut des millions d'années pour en faire une bauxite." },
        { T: 15.9, ai: 0.42, t: "Aujourd'hui, Marseille : 15,9 °C et une pluie égale à 42 % de l'ETP. Les bauxites des Baux sont héritées d'un autre climat." }] },
      src: ["h5", "safran", "bardossy"],
    },
    laterite: {
      exemple: "Exemple suivi : les cuirasses latéritiques fossiles du Périgord et du Sud-Ouest, nées sous le climat tropical du Paléogène.",
      anim: [
        {"court": "Lessivage", "titre": "Sous un climat tropical à saison sèche, la pluie lessive cations et silice sur des dizaines de mètres", "quand": "Au Paléogène (66–34 Ma)", "duree": "des millions d'années", "scene": "profilDebut", "p": {"rocheMere": ["socle (granites, schistes)", "#b8b0a2"], "horizons": [["cuirasse de fer", "#8a3a22", 0.25], ["argiles tachetées", "#c98a5a", 0.3], ["kaolinite", "#e3d2b8", 0.45]], "dissous": ["cations (Na⁺, K⁺, Ca²⁺, Mg²⁺),", "puis silice (H₄SiO₄)"], "climat": "Paléogène : ≈ 25 °C, saison sèche", "ages": [60, 45]}},
        {"court": "Accumulation", "titre": "Oxydes de fer et d'aluminium s'accumulent", "quand": "Au Paléogène", "duree": "des millions d'années", "scene": "profilFin", "p": {"rocheMere": ["socle (granites, schistes)", "#b8b0a2"], "horizons": [["cuirasse de fer", "#8a3a22", 0.25], ["argiles tachetées", "#c98a5a", 0.3], ["kaolinite", "#e3d2b8", 0.45]], "dissous": ["cations (Na⁺, K⁺, Ca²⁺, Mg²⁺),", "puis silice (H₄SiO₄)"], "climat": "Paléogène : ≈ 25 °C, saison sèche", "ages": [45, 34]}},
        {"court": "Cuirasse", "titre": "Les saisons sèches durcissent les oxydes en cuirasse ; aujourd'hui (Bordeaux, 13,7 °C), elles sont fossiles", "quand": "Depuis 34 millions d'années", "scene": "vueMicroscope", "p": {"texture": "oolithes", "titre": "Dans la cuirasse, à la loupe", "ciment": "#8a3a22", "lignes": ["pisolithes d'oxydes de fer", "(goethite, hématite) soudés", "en cuirasse pendant les", "saisons sèches"], "legende": [["#efe6cc", "pisolithes"], ["#8a3a22", "oxydes de fer"]]}},
      ],
      proc: "lateritique", p: { actif: "cuirasse" },
      pe: [{}, { lessivage: true, actif: null }, {}],
      titres: [null, null, "Il reste fer et aluminium : la cuirasse durcit à l'air"],
      cond: { type: "climat", domaines: [[22, 30, 0.65, 1.8]], etiquettes: [["cuirasses latéritiques", 26, 1.95]], villes: ["Bordeaux", "Toulouse"], chemin: [
        { T: 25, ai: 1.1, n: 1, t: "Au Paléogène (66–34 Ma), le Sud-Ouest connaît un climat tropical à saison sèche." },
        { n: 2, t: "La pluie lessive cations et silice sur des dizaines de mètres." },
        { T: 25, ai: 0.9, n: 3, t: "Oxydes de fer et d'aluminium s'accumulent ; les saisons sèches les durcissent en cuirasse." },
        { T: 13.7, ai: 0.98, t: "Aujourd'hui, Bordeaux : 13,7 °C, pluie ≈ ETP : ces cuirasses sont fossiles." }] },
      src: ["h5", "safran"],
    },
    meuliere: {
      exemple: "Exemple suivi : la meulière de Brie (La Ferté-sous-Jouarre, capitale mondiale des meules), à l'Oligo-Miocène.",
      anim: [
        {"court": "Lacs", "titre": "Des lacs déposent les calcaires de Brie et de Beauce", "quand": "À l'Oligocène (≈ 30 Ma)", "duree": "quelques millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 32, "age1": 30, "coquilles": 0.1, "couleurs": ["#ece6d4", "#e2dac4"], "particules": "#f8f4ea", "texte": "de la boue calcaire se dépose au fond des lacs", "eau": ["#8fb9a8", "#4d7f6f"], "fond": "fond du lac", "rythme": "des mètres par million d'années"}},
        {"court": "Silicification", "titre": "Les lacs s'assèchent ; l'altération des argiles libère de la silice : opale puis calcédoine remplacent le calcaire", "quand": "De 34 à 15 millions d'années", "scene": "vueMicroscope", "p": {"texture": "silex", "titre": "Dans le calcaire, à la loupe", "lignes": ["la silice libérée par", "l'altération des argiles", "remplace peu à peu le calcaire :", "opale, puis calcédoine"], "legende": [["#e9e6de", "calcaire"], ["#3b3a3d", "calcédoine"]], "jauge": {"nom": "silice dissoute", "de": 120, "a": 20, "unite": "mg/L", "couleur": "#6f8f9f"}}},
        {"court": "Caverneuse", "titre": "Le calcaire restant se dissout : la meulière devient caverneuse", "quand": "Depuis 15 millions d'années", "scene": "vueMicroscope", "p": {"texture": "cargneule", "titre": "Dans la meulière, à la loupe", "lignes": ["le calcaire qui restait", "se dissout : la calcédoine", "reste, criblée de trous"], "legende": [["#e3c795", "calcédoine"], ["#3c3a36", "vides laissés par le calcaire"]]}},
      ],
      proc: "meuliere", p: {},
      cond: { type: "silice", chemin: [
        { T: 18, C: 5, n: 1, t: "À l'Oligo-Miocène, des lacs déposent les calcaires de Brie et de Beauce." },
        { T: 22, C: 120, n: 2, t: "Quand les lacs s'assèchent, l'altération des argiles libère de la silice : l'eau atteint la saturation de l'opale." },
        { T: 22, C: 20, n: 3, t: "Opale puis calcédoine remplacent peu à peu le calcaire (34–15 Ma)." },
        { n: 4, t: "Le calcaire restant se dissout : la meulière devient caverneuse." }] },
      src: ["meuliere"],
    },
    calcrete: {
      exemple: "Exemple suivi : les terrasses encroûtées des Costières de Nîmes et de la Crau, au Pléistocène.",
      anim: [
        {"court": "Remontée", "titre": "Sous un climat à saison sèche marquée, l'eau du sol remonte et s'évapore ; la calcite dissoute précipite en nodules", "quand": "Au Pléistocène (2,6 Ma – 11 700 ans)", "duree": "des milliers d'années", "scene": "profilDebut", "p": {"rocheMere": ["alluvions caillouteuses", "#a89b7c"], "remontee": true, "horizons": [["sol", "#8a6a45", 0.3], ["nodules de calcite", "#e2d6b8", 0.4], ["alluvions", "#b9a987", 0.3]], "lignes": ["l'eau du sol remonte", "et s'évapore : la calcite", "précipite en nodules"], "climat": "saison sèche marquée, moins de 760 mm de pluie", "libelleAge": "au Pléistocène"}},
        {"court": "Dalle", "titre": "Au fil des dizaines de milliers d'années, les nodules se soudent en dalle", "quand": "Au Pléistocène", "duree": "des dizaines de milliers d'années", "scene": "profilFin", "p": {"rocheMere": ["alluvions caillouteuses", "#a89b7c"], "remontee": true, "horizons": [["sol", "#8a6a45", 0.25], ["croûte calcaire (dalle)", "#efe6cf", 0.45], ["alluvions", "#b9a987", 0.3]], "lignes": ["les nodules se soudent", "en dalle : la calcrète"], "climat": "Perpignan aujourd'hui : 15,7 °C, pluie = 47 % de l'évaporation", "libelleAge": "au Pléistocène"}},
      ],
      proc: "calcrete", p: { horizons: [["sol", "#8a6a45"], ["croûte", "#efe6cf"], ["alluvions", "#b9a987"]], actif: "croûte" },
      pe: [{ actif: null, horizons: [["sol", "#8a6a45"], ["nodules", "#d9ccb0"], ["alluvions", "#b9a987"]] }, {}, {}],
      cond: { type: "climat", domaines: [[10, 25, 0.2, 0.65]], etiquettes: [["calcrètes", 17.5, 0.12]], villes: ["Montpellier", "Perpignan", "Marseille"], chemin: [
        { T: 14, ai: 0.4, n: 1, t: "Sous un climat à saison sèche marquée et à moins de 760 mm de pluie par an, l'eau du sol remonte et s'évapore." },
        { n: 2, t: "La calcite dissoute précipite en nodules, puis en lits." },
        { n: 3, t: "Au fil des dizaines de milliers d'années, les nodules se soudent en dalle (Pléistocène, 2,58 Ma – 11 700 ans)." },
        { T: 15.7, ai: 0.47, t: "Aujourd'hui, Perpignan : 15,7 °C, pluie = 47 % de l'ETP, encore dans le domaine des encroûtements." }] },
      src: ["h5", "safran", "royer"],
    },

    // ════════════════════════ S.6 formations superficielles ════════════════════════
    alluvions: {
      exemple: "Exemple suivi : les alluvions du Val de Loire et de la plaine d'Alsace, en terrasses étagées depuis le Quaternaire.",
      anim: [
        {"court": "Érosion", "titre": "Les versants s'érodent et livrent des débris de toutes tailles", "quand": "Au Quaternaire, sans interruption", "scene": "erosionMassif", "p": {}},
        {"court": "Tri", "titre": "Le courant trie : galets au fond du chenal, sables sur les bancs, limons à la décrue", "quand": "À chaque crue", "scene": "transportRiviere", "p": {}},
        {"court": "Terrasses", "titre": "À chaque cycle glaciaire, la rivière comble puis recreuse sa vallée : les terrasses s'étagent", "quand": "Depuis ≈ 2,6 millions d'années", "duree": "des centaines de milliers d'années par cycle", "scene": "plaineAlluviale", "p": {"ages": [2.6, 0]}},
      ],
      proc: "alluvions", p: {},
      cond: { type: "grains", agents: ["rivière"], grains: [[0.002, 200]], legende: [
        "Les versants s'érodent et livrent des débris de toutes tailles.",
        "Le courant trie : les galets restent au fond du chenal, les sables sur les bancs ; les limons ne se déposent qu'à la décrue (un limon de 20 µm met ≈ 47 min à tomber d'un mètre d'eau calme).",
        "Chaque grain se dépose quand le courant faiblit sous la vitesse qui peut le porter.",
        "À chaque cycle glaciaire, la rivière comble puis recreuse sa vallée : les terrasses s'étagent (Fx, Fy, Fz)."] },
      src: ["ferguson"],
    },
    colluvions: {
      exemple: "Exemple suivi : les colluvions des bas de versants du Bassin parisien et de Bourgogne, surtout depuis les défrichements du Néolithique.",
      anim: [
        {"court": "Ruissellement", "titre": "Le défrichement met le sol à nu ; ruissellement et labours le déplacent vers le bas du versant", "quand": "Depuis le Néolithique (≈ 7 000 ans)", "duree": "des milliers d'années", "scene": "versant", "p": {"mode": "colluvions", "libelleAge": "depuis ≈ 7 000 ans"}},
        {"court": "Accumulation", "titre": "Déplacé sur quelques dizaines à centaines de mètres, le sol n'est pas trié : il s'accumule au pied du versant", "quand": "Depuis le Néolithique", "scene": "vueMicroscope", "p": {"texture": "tillite", "titre": "Dans les colluvions, à la loupe", "ciment": "#7d6246", "lignes": ["sol déplacé sur de courtes", "distances : grains, cailloux", "et argiles mêlés, sans tri"], "legende": [["#6f6a63", "cailloux"], ["#7d6246", "terre fine"]]}},
      ],
      proc: "colluvions", p: {},
      cond: { type: "grains", agents: ["ruissellement"], grains: [[0.001, 20]], legende: [
        "Le défrichement met le sol à nu sur les pentes.",
        "Ruissellement et labours le déplacent sur quelques dizaines à centaines de mètres : pas assez pour trier les grains.",
        "Il s'accumule au pied du versant et dans les vallons secs, surtout depuis le Néolithique."] },
      src: ["ferguson"],
    },
    eboulis: {
      exemple: "Exemple suivi : les talus d'éboulis des Alpes et des corniches des Causses, et les grèzes litées de Charente (depuis 115 000 ans).",
      anim: [
        {"court": "Gel et dégel", "titre": "L'eau qui gèle dans les fissures gonfle d'environ 9 % et élargit les fractures ; les fragments tombent et roulent", "quand": "Depuis la dernière glaciation", "duree": "chaque hiver", "scene": "versant", "p": {"mode": "eboulis", "libelleAge": "depuis 115 000 ans"}},
        {"court": "Talus", "titre": "Les fragments restent anguleux et non cimentés : les plus gros roulent le plus loin", "quand": "Aujourd'hui", "scene": "vueMicroscope", "p": {"texture": "breche", "titre": "Dans l'éboulis, à la loupe", "lignes": ["fragments anguleux, qui", "n'ont roulé que de", "quelques mètres : ils ne", "sont pas soudés"], "legende": [["#6f6a63", "fragments de calcaire"]]}},
      ],
      proc: "eboulis", p: {},
      cond: { type: "grains", agents: ["gravité (éboulis)"], grains: [[2, 1000]], legende: [
        "L'eau qui gèle dans les fissures augmente de volume d'environ 9 % et élargit les fractures.",
        "Les fragments tombent : les plus gros roulent le plus loin, en bas du talus.",
        "Pendant les périodes glaciaires, gel et dégel répétés ont déposé les grèzes litées de Charente (Würm, depuis 115 000 ans)."] },
      src: ["ferguson"],
    },
    moraine: {
      exemple: "Exemple suivi : l'amphithéâtre morainique du Rhône (Lyonnais, Bugey), laissé par la glaciation du Würm (115 000–11 700 ans).",
      anim: [
        {"court": "Glacier", "titre": "Le glacier arrache des blocs et broie la roche en farine ; la glace porte tout ensemble, sans tri", "quand": "Pendant le Würm", "duree": "des milliers d'années", "scene": "glacierAvance", "p": {"libelleAge": "il y a ≈ 25 000 ans"}},
        {"court": "Fonte", "titre": "À la fonte, blocs erratiques et farine glaciaire se déposent pêle-mêle", "quand": "À la fin du Würm", "duree": "des milliers d'années", "scene": "glacierFonte", "p": {"libelleAge": "il y a ≈ 18 000 ans"}},
        {"court": "Moraine", "titre": "Blocs striés et farine, sans aucun tri : contrairement à l'eau ou au vent, la glace ne trie pas", "quand": "Depuis la fonte", "scene": "vueMicroscope", "p": {"texture": "tillite", "titre": "Dans la moraine, à la loupe", "lignes": ["blocs de toutes tailles,", "certains striés, dans une", "farine glaciaire : la", "glace ne trie pas"], "legende": [["#6f6a63", "blocs"], ["#a9a393", "farine glaciaire"]]}},
      ],
      proc: "moraine", p: {},
      cond: { type: "grains", agents: ["glacier"], grains: [[0.001, 3000]], legende: [
        "Le glacier arrache des blocs et broie la roche en farine.",
        "La glace porte tout ensemble : aucun tri, contrairement à l'eau ou au vent.",
        "À la fonte, blocs erratiques et farine glaciaire se déposent pêle-mêle (Würm, 115 000–11 700 ans ; Riss, 300 000–130 000 ans)."] },
    },
    dunes: {
      exemple: "Exemple suivi : la dune du Pilat (Gironde), qui avance encore de 1 à 5 m par an sur la forêt.",
      anim: [
        {"court": "Vent", "titre": "Le vent déplace par bonds les grains de 0,1 à 0,5 mm pris aux plages : la dune avance", "quand": "Holocène à aujourd'hui", "duree": "1 à 5 m par an", "scene": "vent", "p": {"mode": "dunes", "libelleAge": "aujourd'hui"}},
        {"court": "Tri", "titre": "Le vent laisse les graviers et emporte les poussières : le sable des dunes est très bien trié", "quand": "Aujourd'hui", "scene": "vueMicroscope", "p": {"texture": "gres", "titre": "Dans le sable de dune, au microscope", "lignes": ["grains de quartz arrondis", "et de même taille : le vent", "trie mieux que l'eau"], "legende": [["#ece8df", "quartz"]]}},
      ],
      proc: "dunes", p: {},
      cond: { type: "grains", agents: ["vent"], grains: [[0.1, 0.5]], legende: [
        "Plages et alluvions fournissent du sable.",
        "Le vent déplace par bonds les grains de 0,1 à 0,5 mm ; il laisse les graviers et emporte au loin les poussières : le sable des dunes est très bien trié.",
        "La dune avance : la dune du Pilat gagne encore 1 à 5 m par an sur la forêt (Holocène à actuel)."] },
    },
    loess: {
      exemple: "Exemple suivi : le lœss des collines d'Alsace (Kochersberg), déposé pendant la dernière glaciation (115 000–11 700 ans).",
      anim: [
        {"court": "Plaines nues", "titre": "Au bord des glaciers, les plaines d'alluvions sont nues et sèches", "quand": "Pendant la dernière glaciation", "duree": "des milliers d'années", "scene": "glacierFonte", "p": {"libelleAge": "il y a ≈ 20 000 ans"}},
        {"court": "Vent", "titre": "Le vent soulève les limons de 10 à 60 µm et les porte sur des centaines de kilomètres ; ils retombent en placage", "quand": "De 115 000 à 11 700 ans", "duree": "des dizaines de milliers d'années", "scene": "vent", "p": {"mode": "loess", "libelleAge": "il y a ≈ 20 000 ans"}},
        {"court": "Lœss", "titre": "Des placages de plusieurs mètres de limons très bien triés, un peu calcaires", "quand": "Depuis 11 700 ans", "scene": "vueMicroscope", "p": {"texture": "loess", "titre": "Dans le lœss, au microscope", "lignes": ["grains de limon (10 à 60 µm)", "très bien triés par le vent :", "quartz, un peu de calcite", "et d'argile"], "legende": [["#efe7d2", "quartz"], ["#a88c63", "calcite, argiles"]]}},
      ],
      proc: "loess", p: {},
      cond: { type: "grains", agents: ["vent"], grains: [[0.01, 0.063]], legende: [
        "Pendant la dernière glaciation, les plaines au bord des glaciers sont nues et sèches.",
        "Le vent soulève les limons de 10 à 60 µm et les porte en suspension sur des centaines de kilomètres.",
        "Ils retombent en placages de plusieurs mètres dans la steppe (Weichsélien, 115 000–11 700 ans)."] },
    },
    vase_tangue: {
      exemple: "Exemple suivi : la tangue et les vases de la baie du Mont-Saint-Michel, déposées à chaque marée.",
      anim: [
        {"court": "Apports", "titre": "Fleuves et courants de marée apportent limons, argiles et débris de coquilles", "quand": "À chaque marée", "scene": "transportRiviere", "p": {}},
        {"court": "Étale", "titre": "À l'étale, le courant s'arrête : les particules, agrégées en flocons, se déposent ; vasières puis prés salés", "quand": "Holocène à aujourd'hui", "duree": "deux marées par jour", "scene": "estran", "p": {"libelleAge": "aujourd'hui"}},
        {"court": "Flocons", "titre": "Une particule de 2 µm mettrait ≈ 3 jours à tomber d'un mètre d'eau calme : elle ne se dépose qu'en s'agrégeant en flocons", "quand": "À chaque étale", "scene": "vueMicroscope", "p": {"texture": "argile", "titre": "Dans la vase, au microscope", "lignes": ["argiles et limons fins,", "agrégés en flocons :", "seuls, ils ne tomberaient", "presque jamais"], "legende": [["#8c7a60", "argiles, limons"]]}},
      ],
      proc: "vase", p: {},
      cond: { type: "grains", agents: ["marée, estuaire", "rivière"], grains: [[0.001, 0.2]], legende: [
        "Fleuves et courants de marée apportent limons, argiles et débris de coquilles.",
        "À l'étale, le courant s'arrête : une particule de 2 µm met ≈ 3 jours à tomber d'un mètre d'eau calme, elle ne se dépose qu'en s'agrégeant en flocons.",
        "Vase et tangue s'empilent à chaque marée : slikke puis schorre (Holocène à actuel)."] },
      src: ["ferguson"],
    },
    alterite: {
      exemple: "Exemple suivi : les arènes du Limousin et de Bretagne, altérites épaisses nées sous le climat tropical du Paléogène.",
      anim: [
        {"court": "Climat tropical", "titre": "Au Paléogène tropical, l'altération creuse des profils épais dans les granites", "quand": "Au Paléogène (66–23 Ma)", "duree": "des millions d'années", "scene": "profilDebut", "p": {"rocheMere": ["granite", "#d8cdbf"], "horizons": [["sol", "#6b4a2f", 0.15], ["arène : sable et argiles", "#d9c294", 0.5], ["granite fissuré", "#cbbfae", 0.35]], "dissous": ["cations (Na⁺, K⁺, Ca²⁺)", "et silice dissoute partent"], "climat": "Paléogène : ≈ 24 °C, pluie > évaporation", "ages": [60, 40]}},
        {"court": "Hydrolyse", "titre": "L'eau infiltrée hydrolyse feldspaths et biotite ; le quartz reste intact", "quand": "Au Paléogène", "duree": "des millions d'années", "scene": "profilFin", "p": {"rocheMere": ["granite", "#d8cdbf"], "horizons": [["sol", "#6b4a2f", 0.15], ["arène : sable et argiles", "#d9c294", 0.5], ["granite fissuré", "#cbbfae", 0.35]], "dissous": ["cations (Na⁺, K⁺, Ca²⁺)", "et silice dissoute partent"], "climat": "Paléogène : ≈ 24 °C, pluie > évaporation", "ages": [40, 23]}},
        {"court": "Aujourd'hui", "titre": "À Rennes (12 °C, pluie ≈ évaporation), l'arénisation continue, plus lentement : feldspath → argile, quartz intact", "quand": "Aujourd'hui", "scene": "erosionMassif", "p": {"labMassif": "granite du Limousin"}},
      ],
      proc: "alterite", p: {},
      cond: { type: "climat", domaines: [[5, 30, 0.65, 2.5]], etiquettes: [["altération par hydrolyse", 17.5, 2.2]], villes: ["Rennes", "Brest", "Clermont-Ferrand"], chemin: [
        { T: 24, ai: 1.3, n: 1, t: "Au Paléogène tropical, l'altération creuse des profils épais dans les granites." },
        { n: 2, t: "L'eau infiltrée hydrolyse feldspaths et biotite ; le quartz reste intact." },
        { T: 12, ai: 0.96, n: 3, t: "Aujourd'hui encore, à Rennes (12 °C, pluie ≈ ETP), l'arénisation continue, plus lentement ; beaucoup de profils sont hérités." }] },
      src: ["h5", "safran"],
    },
    terra_rossa: {
      exemple: "Exemple suivi : la terra rossa des Grands Causses et des garrigues du Languedoc, résidu rouge de la dissolution du calcaire.",
      anim: [
        {"court": "Dissolution", "titre": "Sous climat méditerranéen, l'eau dissout le calcaire ; ses 2 à 5 % d'impuretés restent sur place", "quand": "Du Néogène à aujourd'hui", "duree": "des millions d'années", "scene": "profilDebut", "p": {"rocheMere": ["calcaire", "#e9e2cb"], "residuel": true, "horizons": [["sol", "#6b3a26", 0.3], ["argile rouge", "#b5552e", 0.7]], "dissous": ["Ca²⁺ + 2 HCO₃⁻ :", "le calcaire part en solution"], "climat": "Montpellier : 15,1 °C, pluie = 55 % de l'évaporation", "ages": [10, 5]}},
        {"court": "Résidu", "titre": "Il faut dissoudre des dizaines de mètres de calcaire pour un mètre d'argile ; les étés secs favorisent l'hématite, qui la rougit", "quand": "Du Néogène à aujourd'hui", "duree": "des millions d'années", "scene": "profilFin", "p": {"rocheMere": ["calcaire", "#e9e2cb"], "residuel": true, "horizons": [["sol", "#6b3a26", 0.3], ["argile rouge", "#b5552e", 0.7]], "dissous": ["Ca²⁺ + 2 HCO₃⁻ :", "le calcaire part en solution"], "lignes": ["des dizaines de mètres", "de calcaire dissous pour", "un mètre d'argile ; l'hématite", "des étés secs la rougit"], "climat": "Montpellier : 15,1 °C, pluie = 55 % de l'évaporation", "ages": [5, 0]}},
      ],
      proc: "terraRossa", p: { fond: "#e9e2cb" },
      cond: { type: "climat", domaines: [[13, 18, 0.45, 0.9]], etiquettes: [["terra rossa", 15.5, 1.02]], villes: ["Montpellier", "Marseille", "Nice"], chemin: [
        { T: 15.1, ai: 0.55, n: 1, t: "Climat méditerranéen, ici Montpellier : 15,1 °C, pluie = 55 % de l'ETP, étés secs." },
        { n: 2, t: "L'eau dissout le calcaire ; ses 2 à 5 % d'impuretés restent sur place : il faut dissoudre des dizaines de mètres de calcaire pour un mètre d'argile." },
        { n: 3, t: "Les étés secs favorisent l'hématite, qui colore l'argile en rouge (Néogène à actuel)." }] },
      src: ["h5", "safran"],
    },
    argile_silex: {
      exemple: "Exemple suivi : l'argile à silex des plateaux du Pays de Caux (Normandie), résidu de la dissolution de la craie.",
      anim: [
        {"court": "Dissolution", "titre": "Au Néogène, sous un climat plus chaud et humide, les eaux de pluie dissolvent la craie des plateaux", "quand": "Au Néogène (23–2,6 Ma)", "duree": "des millions d'années", "scene": "profilDebut", "p": {"rocheMere": ["craie", "#f4f1e9"], "residuel": true, "nodules": "#3b3a3d", "horizons": [["sol", "#6b4a2f", 0.2], ["argile à silex", "#b07d52", 0.8]], "dissous": ["la calcite part", "en solution"], "climat": "Néogène : plus chaud et humide qu'aujourd'hui", "ages": [15, 5]}},
        {"court": "Résidu", "titre": "La calcite part en solution ; silex et argiles, insolubles, restent et coiffent les plateaux", "quand": "Jusqu'à aujourd'hui", "duree": "des millions d'années", "scene": "profilFin", "p": {"rocheMere": ["craie", "#f4f1e9"], "residuel": true, "nodules": "#3b3a3d", "horizons": [["sol", "#6b4a2f", 0.2], ["argile à silex", "#b07d52", 0.8]], "dissous": ["la calcite part", "en solution"], "lignes": ["silex et argiles,", "insolubles, restent"], "climat": "Paris aujourd'hui : 12,7 °C, pluie = 77 % de l'évaporation", "ages": [5, 0]}},
      ],
      proc: "argileSilex", p: {},
      cond: { type: "climat", domaines: [[10, 22, 0.65, 2]], etiquettes: [["dissolution de la craie", 16, 2.12]], villes: ["Paris"], chemin: [
        { T: 17, ai: 1.1, n: 1, t: "Au Néogène, sous un climat plus chaud et humide qu'aujourd'hui, les eaux de pluie dissolvent la craie des plateaux." },
        { n: 2, t: "La calcite part en solution ; silex et argiles, insolubles, restent." },
        { T: 12.7, ai: 0.77, n: 3, t: "La dissolution continue sous le climat actuel (Paris : 12,7 °C, pluie = 77 % de l'ETP) ; le manteau d'argile à silex coiffe les plateaux." }] },
      src: ["h5", "safran"],
    },
    // ════════════════════════ R.1 métamorphisme régional ════════════════════════
    ardoise: {
      exemple: "Exemple suivi : les ardoises d'Angers-Trélazé (Anjou), argiles de la mer ordovicienne transformées par la collision varisque.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Dépôt", "titre": "Des argiles décantent au fond de la mer, lit après lit", "quand": "De 470 à 460 millions d'années", "duree": "des millions d'années", "scene": "depotPelites", "p": {"age0": 470, "age1": 460}},
        {"court": "Enfouissement", "titre": "Prises dans la collision varisque, elles descendent à une dizaine de kilomètres", "quand": "De 340 à 325 millions d'années", "duree": "une quinzaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "sediments", "zFin": 8, "gradT": 21, "age1": 340, "age2": 325}},
        {"court": "Recristallisation", "titre": "Vers 250–350 °C, les argiles deviennent des micas très fins, tous parallèles : la roche se fend en feuillets", "quand": "Vers 325 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "ardoise", "tDebut": 190, "tFin": 300, "dureeRecrist": "quelques millions d'années", "lignes": ["les argiles recristallisent", "en micas très fins,", "tous couchés dans le", "même plan : la roche", "se fend en feuillets"], "legende": []}},
        {"court": "Exhumation", "titre": "L'érosion de la chaîne ramène les ardoises à la surface", "quand": "De 320 millions d'années à aujourd'hui", "duree": "des dizaines de millions d'années", "scene": "exhumation", "p": {"zToit": 8, "epaisseur": 4, "couleurCouche": "#4d5451", "nomCouche": "ardoises", "ages": [320, 300, 250]}},
      ],
      proc: "regional", p: { protolithe: "argile", texture: "ardoise", profTecto: "≈ 10–15 km", recristTxt: "micas microscopiques, tous parallèles" },
      cond: PT_META({ echelle: "reg", chemin: [
        { T: 15, P: 0, n: 1, t: "À l'Ordovicien (480–440 Ma), des argiles se déposent dans la mer." },
        { T: 180, P: 0.2, n: 2, t: "Enfouies puis prises dans la collision varisque, elles descendent à une dizaine de kilomètres." },
        { T: 300, P: 0.35, n: 3, t: "Vers 250–350 °C, les argiles recristallisent en micas très fins, tous orientés par la compression : la roche se fend en feuillets parfaits." },
        { T: 200, P: 0.15 }, { T: 15, P: 0, n: 4, t: "L'érosion de la chaîne les ramène à la surface : ardoisières d'Angers-Trélazé." }] }),
    },
    micaschiste: {
      proc: "regional", p: { protolithe: "argile", texture: "schistosite", grenat: true, profTecto: "≈ 20–30 km" },
      // C.2 animé (17/09/2026) : prototype métamorphique
      exemple: "Exemple suivi : les micaschistes des Cévennes (Massif central), entraînés en profondeur par la collision varisque vers 340 millions d'années.",
      animCurseur: "arrivee", // pastilles du chemin P–T = fin de chaque étape (fin d'enfouissement, pic de chaleur…)
      anim: [
        { court: "Dépôt", titre: "Des argiles et des limons décantent au fond d'un bassin",
          quand: "De 540 à 480 millions d'années", duree: "des dizaines de millions d'années",
          scene: "depotPelites", p: { age0: 540, age1: 480 } },
        { court: "Enfouissement", titre: "La marge du continent plonge sous l'autre plaque et entraîne ses argiles à ≈ 30 km",
          quand: "De 360 à 340 millions d'années", duree: "une vingtaine de millions d'années, à quelques millimètres par an",
          scene: "enfouissementCollision", p: { zFin: 31, age1: 360, age2: 340 } },
        { court: "Recristallisation", titre: "Vers 500 à 650 °C, les minéraux argileux se changent en micas alignés ; les grenats poussent",
          quand: "Vers 340 millions d'années", duree: "quelques millions d'années",
          scene: "recristallisationFoliation", p: { tDebut: 480, tFin: 600, dureeRecrist: "quelques millions d'années" } },
        { court: "Exhumation", titre: "Trop épaisse, la chaîne s'étale sur des failles normales ; l'érosion l'allège, la racine remonte et le micaschiste avec elle",
          quand: "De 340 millions d'années à aujourd'hui", duree: "≈ 30 millions d'années pour l'essentiel de la remontée ; à l'air libre vers 250 millions d'années",
          scene: "exhumation", p: { age2: 340 } },
      ],
      cond: PT_META({ echelle: "reg", courbes: ["kyAnd", "andSil", "kySil", "graniteEau"], labAl: true, chemin: [
        { T: 15, P: 0, n: 1, t: "Des argiles et des boues marines se déposent (Néoprotérozoïque–Paléozoïque)." },
        { T: 480, P: 0.85, n: 2, t: "La collision varisque fait plonger la marge d'un continent sous l'autre plaque (360–340 Ma) : ses argiles sont entraînées à ≈ 30 km, et la pression monte plus vite que la température." },
        { T: 590, P: 0.65, n: 3, t: "La chaleur rattrape la roche : vers 500–650 °C, les minéraux argileux se changent en micas, et grenat, staurotide et disthène ou sillimanite cristallisent." },
        { T: 400, P: 0.3 }, { T: 15, P: 0, n: 4, t: "Trop épaisse, la chaîne s'étale sur des failles normales (extension vers 315 Ma, granites du mont Lozère et de l'Aigoual) ; l'érosion l'allège et la racine remonte (isostasie). Vers 250 Ma les micaschistes des Cévennes sont à l'air libre : les grès du Trias se déposent directement dessus." }] }),
      src: ["pattison", "faure2001", "white1992"],
    },
    quartzite: {
      exemple: "Exemple suivi : les quartzites des monts d'Arrée (Roc'h Ruz, Finistère), anciens sables armoricains de l'Ordovicien.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Dépôt", "titre": "Des sables quartzeux se déposent sur une plateforme marine", "quand": "De 478 à 470 millions d'années", "duree": "environ 8 millions d'années", "scene": "depotPelites", "p": {"age0": 478, "age1": 470, "couleurs": ["#e3d6b0", "#d6c599"], "particules": "#f1e6c6", "texte": "des sables quartzeux se déposent sur la plateforme", "rythme": "chacun quelques milliers d'années"}},
        {"court": "Enfouissement", "titre": "La collision varisque les enfouit à une dizaine de kilomètres", "quand": "De 340 à 325 millions d'années", "duree": "une quinzaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "sediments", "zFin": 11, "gradT": 21, "age1": 340, "age2": 325}},
        {"court": "Recristallisation", "titre": "Au-delà de ≈ 300 °C, le quartz recristallise : les grains se soudent en mosaïque", "quand": "Vers 325 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "quartzite", "tDebut": 250, "tFin": 420, "dureeRecrist": "quelques millions d'années", "lignes": ["au-delà de ≈ 300 °C,", "les grains de quartz", "se soudent en mosaïque :", "la roche casse à travers", "eux, pas entre eux"], "legende": [["#8fc3e4", "vides (au départ)"], ["#e0dbcf", "quartz"]]}},
        {"court": "Érosion", "titre": "Très résistante, la quartzite arme les crêtes quand l'érosion use la chaîne", "quand": "De 300 millions d'années à aujourd'hui", "duree": "300 millions d'années", "scene": "erosionPlis", "p": {"couleurCouche": "#ece6d8", "grains": "#c9c0ad", "nomCouche": "quartzite", "creteNom": "crête de quartzite (Roc'h Ruz)"}},
      ],
      proc: "regional", p: { protolithe: "sable", texture: "mosaique", recristTxt: "grains de quartz soudés en mosaïque" },
      cond: PT_META({ echelle: "reg", chemin: [
        { T: 15, P: 0, n: 1, t: "Des sables quartzeux se déposent (grès armoricain, 478–470 Ma ; Trias du Briançonnais)." },
        { T: 250, P: 0.3, n: 2, t: "La roche est enfouie lors d'une collision (varisque ou alpine)." },
        { T: 420, P: 0.45, n: 3, t: "Au-delà de ≈ 300 °C, le quartz recristallise : les grains se soudent au point que la roche casse à travers eux, et non plus entre eux." },
        { T: 15, P: 0, n: 4, t: "Très résistante, elle arme les crêtes une fois remontée." }] }),
    },
    marbre: {
      exemple: "Exemple suivi : le marbre de Saint-Béat (Haute-Garonne), un calcaire chauffé sous les bassins pyrénéens au Crétacé, entre 110 et 85 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Dépôt", "titre": "Des boues calcaires s'accumulent sur une plate-forme marine", "quand": "Vers 150 millions d'années (Jurassique)", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 150, "age1": 145}},
        {"court": "Enfouissement", "titre": "La croûte pyrénéenne s'amincit : sous les bassins qui s'ouvrent, la chaleur monte", "quand": "De 145 à 110 millions d'années", "duree": "une trentaine de millions d'années", "scene": "enfouissement", "p": {"couches": [[145, 125, "#d8cfb3", "Crétacé inférieur : calcaires et marnes"], [125, 110, "#77746a", "Albien : flysch noir"]], "age0": 145, "age1": 110, "zmax": 8.5, "gradient": 60, "thermo": 700, "nomRoche": "le calcaire", "couleurRoche": "#efe7d0", "socle": "socle paléozoïque", "rythme": "bassins du rift pyrénéen"}},
        {"court": "Recristallisation", "titre": "Chauffée à haute température mais à faible pression, la calcite recristallise en grains de sucre", "quand": "De 110 à 85 millions d'années", "duree": "des millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "marbre", "tDebut": 300, "tFin": 520, "sansCompression": true, "dureeRecrist": "110–85 Ma", "lignes": ["chauffée sans être", "beaucoup comprimée,", "la calcite recristallise", "en grains de sucre"], "legende": [["#f3f0ea", "calcite (macles en stries)"]]}},
        {"court": "Érosion", "titre": "La collision pyrénéenne soulève la série ; l'érosion met le marbre au jour", "quand": "De 40 millions d'années à aujourd'hui", "duree": "40 millions d'années", "scene": "erosionPlis", "p": {"couleurCouche": "#f2efe8", "grains": "#d9d2c4", "nomCouche": "marbre", "creteNom": "marbre de Saint-Béat", "ages": [60, 40]}},
      ],
      proc: "regional", p: { protolithe: "calcaire", texture: "mosaique", tectoTxt: "rifting puis collision pyrénéenne", profTecto: "≈ 5–10 km", recristTxt: "la calcite recristallise en grains visibles" },
      cond: PT_META({ echelle: "reg", courbes: ["kyAnd", "andSil", "kySil"], labAl: true, chemin: [
        { T: 15, P: 0, n: 1, t: "Des calcaires se déposent en mer (Jurassique, Crétacé)." },
        { T: 300, P: 0.2, n: 2, t: "Au Crétacé, l'amincissement de la croûte pyrénéenne fait monter la chaleur sous les bassins." },
        { T: 520, P: 0.25, n: 3, t: "Chauffée à haute température mais à faible pression, la calcite recristallise en grains de sucre : marbre de Saint-Béat (110–85 Ma)." },
        { T: 15, P: 0, n: 4, t: "La collision pyrénéenne et l'érosion l'amènent en surface." }] }),
      src: ["pattison", "ducoux"],
    },
    calcschiste: {
      exemple: "Exemple suivi : les schistes lustrés du Queyras (Hautes-Alpes), boues de l'océan alpin enfouies par la subduction entre 60 et 35 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Dépôt", "titre": "Des boues calcaires et argileuses se déposent au fond de l'océan alpin", "quand": "Entre 160 et 100 millions d'années", "duree": "des dizaines de millions d'années", "scene": "dorsale", "p": {"suivi": "sediments", "libelleAge": "entre 160 et 100 millions d'années", "nom": "océan alpin (Téthys)"}},
        {"court": "Subduction", "titre": "L'océan se ferme : la subduction entraîne ces boues à 30–50 km sans les chauffer beaucoup", "quand": "De 60 à 55 millions d'années", "duree": "quelques millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 33, "gradT": 7, "age1": 60, "age2": 55}},
        {"court": "Recristallisation", "titre": "Calcite, mica blanc et quartz recristallisent en feuillets luisants", "quand": "Vers 55–50 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "schistosite", "grenats": 0, "tDebut": 250, "tFin": 440, "dureeRecrist": "quelques millions d'années", "lignes": ["calcite, mica blanc", "et quartz recristallisent", "en feuillets luisants :", "les « schistes lustrés »"], "legende": []}},
        {"court": "Remontée", "titre": "Les roches remontent le long du plan de subduction et se rééquilibrent dans les schistes verts", "quand": "De 50 à 35 millions d'années", "duree": "une quinzaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 50, "gradT": 8.4, "retour": true, "age1": 50, "age2": 35}},
      ],
      proc: "subduction", p: { protolithe: "marne", texture: "schistosite", profTecto: "30–50 km", tectoTxt: "subduction alpine" },
      cond: PT_META({ echelle: "hp", courbes: ["jadeite"], chemin: [
        { T: 15, P: 0, n: 1, t: "Des boues calcaires et argileuses se déposent au fond de l'océan alpin (Jurassique–Crétacé)." },
        { T: 250, P: 0.9, n: 2, t: "L'océan se ferme : la subduction entraîne ces boues à 30–50 km sans les chauffer beaucoup." },
        { T: 440, P: 1.4, n: 3, t: "Vers 300–480 °C et 1 à 1,8 GPa selon les unités (plus chaud et plus profond vers l'est), calcite, mica blanc et quartz recristallisent dans le faciès des schistes bleus." },
        { T: 380, P: 0.6 }, { T: 15, P: 0, n: 4, t: "En remontant (60–35 Ma), les roches sont rééquilibrées dans le faciès des schistes verts." }] }),
      src: ["holland", "agard"],
    },
    schiste_vert: {
      exemple: "Exemple suivi : les schistes verts (prasinites) des Alpes internes, anciens basaltes de l'océan alpin.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Basalte", "titre": "Au fond de l'océan alpin, la dorsale produit des basaltes", "quand": "Vers 160 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "basalte", "libelleAge": "vers 160 millions d'années", "nom": "océan alpin"}},
        {"court": "Enfouissement", "titre": "La fermeture de l'océan et la collision enfouissent ces basaltes à une dizaine de kilomètres", "quand": "De 50 à 40 millions d'années", "duree": "une dizaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 11, "gradT": 21, "age1": 50, "age2": 40}},
        {"court": "Recristallisation", "titre": "Vers 300–500 °C, le basalte devient chlorite, actinote, épidote et albite", "quand": "Vers 40 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "schiste_vert", "tDebut": 250, "tFin": 400, "dureeRecrist": "quelques millions d'années", "lignes": ["vers 300–500 °C,", "le basalte devient", "chlorite, actinote,", "épidote et albite :", "une roche verte, feuilletée"], "legende": [["#4f8a4a", "chlorite"], ["#a9c98c", "actinote"], ["#c9c35a", "épidote"]]}},
        {"court": "Exhumation", "titre": "La chaîne s'étale, l'érosion l'allège : les schistes verts remontent", "quand": "De 35 millions d'années à aujourd'hui", "duree": "des millions d'années", "scene": "exhumation", "p": {"zToit": 9, "epaisseur": 4, "couleurCouche": "#5f7f55", "nomCouche": "schistes verts", "ages": [35, 25, 15]}},
      ],
      proc: "regional", p: { protolithe: "basalte", texture: "aiguilles", recristTxt: "chlorite, actinote, épidote" },
      cond: PT_META({ echelle: "reg", chemin: [
        { T: 15, P: 0, n: 1, t: "Un basalte ou un tuf basaltique." },
        { T: 250, P: 0.3, n: 2, t: "Enfoui lors d'une collision (varisque ou alpine)." },
        { T: 400, P: 0.5, n: 3, t: "Vers 300–500 °C, ses minéraux se transforment en chlorite, actinote, épidote et albite." },
        { T: 15, P: 0, n: 4, t: "Remonté par l'érosion (métamorphisme de 400 à 30 Ma selon les régions)." }] }),
    },
    amphibolite: {
      exemple: "Exemple suivi : les amphibolites du Limousin, anciens basaltes d'un océan ordovicien transformés par la collision varisque (450–340 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Basalte", "titre": "Au fond d'un océan, la dorsale produit des basaltes et des gabbros", "quand": "Vers 480 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "basalte", "libelleAge": "vers 480 millions d'années"}},
        {"court": "Enfouissement", "titre": "L'océan se ferme : sa croûte est entraînée à 20–35 km lors de la collision varisque", "quand": "De 380 à 360 millions d'années", "duree": "une vingtaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 29, "gradT": 15, "age1": 380, "age2": 360}},
        {"court": "Recristallisation", "titre": "Vers 500–750 °C, pyroxène et plagioclase deviennent hornblende et plagioclase, alignés", "quand": "Vers 360 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "amphibolite", "tDebut": 450, "tFin": 650, "dureeRecrist": "quelques millions d'années", "lignes": ["pyroxène et plagioclase", "du basalte deviennent", "hornblende (vert sombre)", "et plagioclase, alignés"], "legende": [["#2f4a38", "hornblende"], ["#eeebe3", "plagioclase"], ["#9c4a3c", "grenat"]]}},
        {"court": "Exhumation", "titre": "La chaîne s'étale, l'érosion l'allège : l'amphibolite remonte avec la croûte", "quand": "De 360 millions d'années à aujourd'hui", "duree": "des dizaines de millions d'années", "scene": "exhumation", "p": {"zToit": 22, "epaisseur": 5, "couleurCouche": "#3f5446", "nomCouche": "amphibolites", "ages": [360, 330, 280]}},
      ],
      proc: "regional", p: { protolithe: "basalte", texture: "aiguilles", profTecto: "≈ 20–35 km", recristTxt: "hornblende et plagioclase alignés" },
      cond: PT_META({ echelle: "reg", courbes: ["graniteEau"], chemin: [
        { T: 15, P: 0, n: 1, t: "Un basalte ou un gabbro, souvent d'âge paléozoïque ancien." },
        { T: 450, P: 0.8, n: 2, t: "Enfoui à 20–35 km lors de la collision varisque." },
        { T: 650, P: 0.8, n: 3, t: "Vers 500–750 °C, pyroxènes et plagioclase calcique se changent en hornblende et plagioclase (450–340 Ma)." },
        { T: 400, P: 0.3 }, { T: 15, P: 0, n: 4, t: "Remontée et érosion : Limousin, Massif central." }] }),
      src: ["tuttle"],
    },
    schiste_bleu: {
      exemple: "Exemple suivi : les schistes bleus de l'île de Groix (Morbihan), anciens basaltes et sédiments du plancher océanique, entre 370 et 350 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Plancher océanique", "titre": "Au fond d'un océan, la dorsale produit des basaltes, que des boues recouvrent", "quand": "Vers 480 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "basalte", "libelleAge": "vers 480 millions d'années"}},
        {"court": "Subduction", "titre": "La subduction les entraîne vite en profondeur : la roche, froide, ne se réchauffe presque pas", "quand": "De 370 à 365 millions d'années", "duree": "quelques millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 36, "gradT": 6.5, "age1": 370, "age2": 365}},
        {"court": "Recristallisation", "titre": "Vers 1,6–1,8 GPa et 450–500 °C, le glaucophane, amphibole bleue, cristallise", "quand": "Vers 360 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "schiste_bleu", "tDebut": 250, "tFin": 475, "dureeRecrist": "quelques millions d'années", "lignes": ["froide et profonde,", "la roche fabrique du", "glaucophane : une", "amphibole bleue"], "legende": [["#3d5fa8", "glaucophane"], ["#f7f6f1", "lawsonite"], ["#9c4a3c", "grenat"]]}},
        {"court": "Remontée", "titre": "Une remontée rapide, le long du plan de subduction, préserve en partie les minéraux bleus", "quand": "De 360 à 350 millions d'années", "duree": "une dizaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 58, "gradT": 7.9, "retour": true, "age1": 360, "age2": 350}},
      ],
      proc: "subduction", p: { protolithe: "basalte", texture: "aiguilles", profTecto: "≈ 50–60 km", recristTxt: "glaucophane : l'amphibole bleue" },
      cond: PT_META({ echelle: "hp", courbes: ["jadeite"], chemin: [
        { T: 15, P: 0, n: 1, t: "Basaltes et sédiments du plancher océanique." },
        { T: 250, P: 1.0, n: 2, t: "La subduction les entraîne vite en profondeur : la roche froide ne se réchauffe presque pas." },
        { T: 475, P: 1.7, n: 3, t: "Île de Groix : 1,6–1,8 GPa (≈ 55–60 km) et 450–500 °C ; le glaucophane cristallise (370–350 Ma)." },
        { T: 420, P: 0.7 }, { T: 15, P: 0, n: 4, t: "Remontée rapide, qui préserve en partie l'assemblage de haute pression." }] }),
      src: ["holland", "bosse"],
    },
    eclogite: {
      exemple: "Exemple suivi : les éclogites du Haut-Allier et du Lévézou (Massif central), anciens basaltes océaniques entraînés à plus de 60 km par la subduction varisque (420–360 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Basalte", "titre": "Au fond d'un océan, la dorsale produit des basaltes", "quand": "Vers 480 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "basalte", "libelleAge": "vers 480 millions d'années"}},
        {"court": "Subduction", "titre": "La subduction varisque entraîne la croûte océanique au-delà de 50 km", "quand": "De 420 à 410 millions d'années", "duree": "une dizaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 48, "gradT": 9, "age1": 420, "age2": 410}},
        {"court": "Recristallisation", "titre": "Vers 2 GPa, plagioclase et pyroxène laissent place à l'omphacite et au grenat : la roche devient très dense", "quand": "Vers 410 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "eclogite", "tDebut": 450, "tFin": 720, "sansCompression": true, "dureeRecrist": "quelques millions d'années", "lignes": ["vers 2 GPa, plagioclase", "et pyroxène laissent", "place à l'omphacite", "(verte) et au grenat", "(rouge) : roche très dense"], "legende": [["#7d9b66", "omphacite"], ["#9c4a3c", "grenat"], ["#2f2f2f", "rutile"]]}},
        {"court": "Remontée", "titre": "Une écaille se détache et remonte le long du plan de subduction ; en chemin, une partie devient amphibolite", "quand": "De 400 à 380 millions d'années", "duree": "une vingtaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "ocean", "zFin": 68, "gradT": 10.5, "retour": true, "age1": 400, "age2": 380}},
      ],
      proc: "subduction", p: { protolithe: "basalte", texture: "eclogite", profTecto: "≈ 60–80 km", recristTxt: "omphacite verte et grenat rouge" },
      cond: PT_META({ echelle: "hp", courbes: ["jadeite", "coesite", "graniteEau"], chemin: [
        { T: 15, P: 0, n: 1, t: "Un basalte océanique." },
        { T: 450, P: 1.4, n: 2, t: "La subduction varisque l'entraîne au-delà de 50 km." },
        { T: 720, P: 2.1, n: 3, t: "Vers 650–850 °C et ≈ 2 GPa (Haut-Allier, Lévézou), plagioclase et pyroxène laissent place à l'omphacite et au grenat : la roche devient très dense (420–360 Ma). Localement, la coésite signale plus de 2,8 GPa." },
        { T: 650, P: 0.9 }, { T: 15, P: 0, n: 4, t: "Remontée : une partie se transforme en amphibolite en chemin." }] }),
      src: ["holland", "bose", "lotout"],
    },
    gneiss: {
      exemple: "Exemple suivi : un orthogneiss du Massif central (Haut-Allier) — un granite de l'Ordovicien (≈ 480 Ma) transformé par la collision varisque vers 360–340 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Granite", "titre": "Un granite cristallise en profondeur : ce sera la roche de départ", "quand": "Vers 480 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 880, "tFin": 680, "mineraux": [["quartz", 30], ["orthose", 28], ["plagioclases", 27], ["biotite", 10], ["muscovite", 5]], "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Enfouissement", "titre": "La collision varisque enfouit le granite à 20–30 km avec la croûte qui le porte", "quand": "De 360 à 345 millions d'années", "duree": "une quinzaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "croute", "zFin": 29, "gradT": 17, "age1": 360, "age2": 345}},
        {"court": "Recristallisation", "titre": "Vers 650–750 °C, les minéraux recristallisent et se trient en lits clairs et sombres", "quand": "Vers 345 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "gneiss", "tDebut": 500, "tFin": 700, "dureeRecrist": "quelques millions d'années", "lignes": ["quartz et feldspaths", "d'un côté, micas de", "l'autre : les minéraux", "se trient en lits clairs", "et sombres"], "legende": [["#ece6da", "quartz, feldspaths"], ["#3e342c", "biotite"]]}},
        {"court": "Exhumation", "titre": "La chaîne s'étale sur ses failles, l'érosion l'allège : le gneiss remonte avec la croûte", "quand": "De 340 millions d'années à aujourd'hui", "duree": "≈ 30 millions d'années pour l'essentiel de la remontée", "scene": "exhumation", "p": {"zToit": 21, "epaisseur": 7, "couleurCouche": "#b39c8e", "nomCouche": "gneiss", "ages": [340, 310, 250]}},
      ],
      proc: "regional", p: { protolithe: "granite", texture: "gneiss", profTecto: "≈ 20–30 km", recristTxt: "lits clairs et sombres séparés" },
      cond: PT_META({ echelle: "reg", courbes: ["kyAnd", "andSil", "kySil", "graniteEau"], labAl: true, chemin: [
        { T: 15, P: 0, n: 1, t: "Un granite (orthogneiss) ou des sédiments (paragneiss)." },
        { T: 500, P: 0.8, n: 2, t: "La collision l'enfouit à 20–30 km." },
        { T: 700, P: 0.75, n: 3, t: "Vers 650–750 °C, les minéraux recristallisent et se rangent en lits : clairs (quartz, feldspaths), sombres (micas). Parfois il commence à fondre." },
        { T: 400, P: 0.3 }, { T: 15, P: 0, n: 4, t: "Remonté par l'érosion : gneiss icartiens (2 200–1 800 Ma), gneiss varisques (450–300 Ma)." }] }),
      src: ["pattison", "tuttle"],
    },
    leptynite: {
      exemple: "Exemple suivi : les leptynites du Limousin et de Vendée, anciennes laves acides de l'Ordovicien transformées par la collision varisque.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Lave acide", "titre": "Des laves claires, riches en silice, s'épanchent", "quand": "Vers 480 millions d'années", "duree": "des mois à des années", "scene": "domeExtrusion", "p": {"nom": "rhyolite", "nomDome": "dôme de rhyolite", "couleurLave": "#d9c9bd", "laveT": "≈ 800 °C", "libelleAge": "vers 480 millions d'années"}},
        {"court": "Enfouissement", "titre": "La collision varisque enfouit ces roches à 25–30 km", "quand": "De 380 à 360 millions d'années", "duree": "une vingtaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "croute", "zFin": 29, "gradT": 17, "age1": 380, "age2": 360}},
        {"court": "Recristallisation", "titre": "Vers 600–750 °C, la roche recristallise en quartz et feldspaths à grain fin, presque sans mica", "quand": "Vers 360 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "gneiss", "partSombre": 0.08, "tDebut": 500, "tFin": 680, "dureeRecrist": "quelques millions d'années", "lignes": ["la roche claire", "recristallise en quartz", "et feldspaths à grain", "fin, presque sans mica"], "legende": [["#ece6da", "quartz, feldspaths"], ["#3e342c", "un peu de biotite"]]}},
        {"court": "Exhumation", "titre": "Elle remonte avec les amphibolites voisines", "quand": "De 360 millions d'années à aujourd'hui", "duree": "des dizaines de millions d'années", "scene": "exhumation", "p": {"zToit": 22, "epaisseur": 5, "couleurCouche": "#d9ccc0", "nomCouche": "leptynites", "nomClair": true, "ages": [360, 330, 280]}},
      ],
      proc: "regional", p: { protolithe: "granite", texture: "gneiss", recristTxt: "quartz et feldspaths, peu de mica", protoTxt: "roche acide (volcanite ou granite)" },
      cond: PT_META({ echelle: "reg", courbes: ["kyAnd", "andSil", "kySil", "graniteEau"], labAl: true, chemin: [
        { T: 15, P: 0, n: 1, t: "Une roche acide pauvre en minéraux sombres, souvent volcanique (Ordovicien)." },
        { T: 500, P: 0.8, n: 2, t: "Enfouie lors de la collision varisque." },
        { T: 680, P: 0.8, n: 3, t: "Vers 600–750 °C, elle recristallise en une roche claire à grain fin (480–350 Ma)." },
        { T: 15, P: 0, n: 4, t: "Remontée avec les amphibolites voisines : Vendée, Limousin." }] }),
      src: ["pattison", "tuttle"],
    },
    granulite_meta: {
      exemple: "Exemple suivi : les granulites de la croûte profonde varisque du Massif central, remontées par la tectonique (entre 450 et 340 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Dépôt", "titre": "Des sédiments s'accumulent au fond d'un bassin", "quand": "De 540 à 480 millions d'années", "duree": "des dizaines de millions d'années", "scene": "depotPelites", "p": {"age0": 540, "age1": 480}},
        {"court": "Enfouissement", "titre": "Ils se retrouvent au bas d'une croûte épaissie, vers 35–40 km", "quand": "De 380 à 360 millions d'années", "duree": "une vingtaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "croute", "zFin": 40, "gradT": 16, "age1": 380, "age2": 360}},
        {"court": "Recristallisation", "titre": "Au-delà de 750 °C, les micas se décomposent : grenat et orthopyroxène les remplacent, l'eau s'en va", "quand": "Vers 360 millions d'années", "duree": "quelques millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "granulite", "tDebut": 650, "tFin": 850, "dureeRecrist": "quelques millions d'années", "lignes": ["au-delà de 750 °C,", "les micas (qui contiennent", "de l'eau) se décomposent :", "grenat et orthopyroxène", "les remplacent"], "legende": [["#9c4a3c", "grenat"], ["#7d6a45", "orthopyroxène"], ["#6b4f35", "micas (disparaissent)"]]}},
        {"court": "Exhumation", "titre": "Seule une remontée tectonique ou une érosion très profonde les amène en surface", "quand": "De 350 millions d'années à aujourd'hui", "duree": "des dizaines de millions d'années", "scene": "exhumation", "p": {"zToit": 30, "epaisseur": 6, "couleurCouche": "#8d7d6a", "nomCouche": "granulites", "ages": [350, 320, 280]}},
      ],
      proc: "regional", p: { protolithe: "argile", texture: "mosaique", profTecto: "≈ 30–40 km", recristTxt: "grenat et orthopyroxène, plus de micas" },
      cond: PT_META({ echelle: "reg", courbes: ["kyAnd", "andSil", "kySil", "graniteEau"], labAl: true, chemin: [
        { T: 15, P: 0, n: 1, t: "Sédiments ou roches magmatiques de la croûte." },
        { T: 650, P: 1.1, n: 2, t: "Ils se retrouvent au bas d'une croûte épaissie." },
        { T: 850, P: 1.0, n: 3, t: "Au-delà de 750 °C, les micas, qui contiennent de l'eau, se décomposent : grenat et orthopyroxène les remplacent ; l'eau part avec un peu de liquide (450–340 Ma)." },
        { T: 600, P: 0.4 }, { T: 15, P: 0, n: 4, t: "Seule une remontée tectonique ou une érosion très profonde les amène en surface." }] }),
      src: ["pattison", "tuttle"],
    },
    migmatite: {
      exemple: "Exemple suivi : les migmatites du dôme du Velay (Massif central), nées de la fusion partielle de la croûte entre 340 et 300 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Dépôt", "titre": "Des argiles et des limons s'accumulent au fond d'un bassin", "quand": "De 540 à 480 millions d'années", "duree": "des dizaines de millions d'années", "scene": "depotPelites", "p": {"age0": 540, "age1": 480}},
        {"court": "Enfouissement", "titre": "La collision varisque les enfouit à 25–30 km", "quand": "De 360 à 340 millions d'années", "duree": "une vingtaine de millions d'années", "scene": "enfouissementCollision", "p": {"suivi": "sediments", "zFin": 29, "gradT": 22, "age1": 360, "age2": 340}},
        {"court": "Fusion partielle", "titre": "Au-delà de ≈ 700 °C, la roche commence à fondre : le liquide clair se rassemble en lits", "quand": "De 340 à 300 millions d'années", "duree": "des millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "migmatite", "tDebut": 650, "tFin": 800, "dureeRecrist": "des millions d'années", "lignes": ["au-delà de ≈ 700 °C,", "la roche fond en partie :", "le liquide clair se", "rassemble en lits, le", "résidu sombre l'entoure"], "legende": [["#fbf4ea", "liquide (leucosome)"], ["#3e342c", "résidu (biotite)"]]}},
        {"court": "Remontée en dôme", "titre": "Plus légère, la croûte fondue remonte en dôme ; l'érosion le dégage", "quand": "De 300 millions d'années à aujourd'hui", "duree": "des dizaines de millions d'années", "scene": "exhumation", "p": {"zToit": 18, "epaisseur": 8, "couleurCouche": "#c9b3a6", "nomCouche": "migmatites", "nomClair": true, "ages": [305, 290, 250]}},
      ],
      proc: "regional", p: { protolithe: "argile", texture: "migmatite", profTecto: "≈ 15–25 km", recristTxt: "liquide clair, résidu sombre" },
      titres: [null, null, "Fusion partielle : la roche se sépare en lits clairs et sombres", "Remontée en dôme"],
      cond: PT_META({ echelle: "reg", courbes: ["kyAnd", "andSil", "kySil", "graniteEau"], labAl: true, chemin: [
        { T: 15, P: 0, n: 1, t: "Des sédiments et des gneiss de la croûte." },
        { T: 650, P: 0.8, n: 2, t: "Enfouis lors de la collision varisque." },
        { T: 800, P: 0.45, n: 3, t: "En remontant, ils chauffent au-delà du solidus du granite : 750–850 °C à 0,4–0,5 GPa dans le dôme du Velay. Le liquide se rassemble en lits clairs (340–300 Ma)." },
        { T: 500, P: 0.2 }, { T: 15, P: 0, n: 4, t: "Le dôme, plus léger, remonte ; l'érosion le dégage." }] }),
      src: ["pattison", "tuttle", "barbey"],
    },

    // ════════════════════════ R.2 contact ════════════════════════
    corneenne: {
      exemple: "Exemple suivi : l'auréole de cornéennes du granite du Sidobre (Tarn), vers 300 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Argiles enfouies", "titre": "Des argiles et des schistes reposent à 5–6 km de profondeur, vers 150–200 °C", "quand": "Vers 305 millions d'années", "duree": "des millions d'années", "scene": "depotPelites", "p": {"age0": 480, "age1": 470}},
        {"court": "Granite", "titre": "Un granite chaud (≈ 700–800 °C) s'y injecte ; la chaleur gagne la roche voisine", "quand": "Vers 300 millions d'années", "duree": "10 000 à 100 000 ans", "scene": "aureole", "p": {"encaissant": "schistes", "tDebut": 160, "tMax": 560, "libelleAge": "il y a ≈ 300 millions d'années", "duree": "10 000 à 100 000 ans"}},
        {"court": "Cuisson", "titre": "Chauffée à 450–650 °C sans être comprimée davantage, la roche fabrique andalousite et cordiérite, minéraux de basse pression", "quand": "Vers 300 millions d'années", "duree": "10 000 à 100 000 ans", "scene": "recristallisationFoliation", "p": {"texture": "corneenne", "sansCompression": true, "tDebut": 160, "tFin": 560, "dureeRecrist": "10 000 à 100 000 ans", "lignes": ["chauffée sans être", "comprimée : andalousite", "et cordiérite poussent,", "sans orientation"], "legende": [["#d8a8a0", "andalousite"], ["#9aa0a8", "cordiérite"], ["#8a7f70", "biotite"]]}},
        {"court": "Érosion", "titre": "Refroidie, l'auréole remonte avec son granite et l'érosion la dégage", "quand": "Depuis 300 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [5, 7], "age3": 300, "texteAffleure": "le granite et son auréole de cornéennes affleurent"}},
      ],
      proc: "contact", p: { protolithe: "argile", recristTxt: "cordiérite et andalousite, sans orientation" },
      cond: PT_META({ echelle: "contact", courbes: ["kyAnd", "andSil", "kySil", "graniteEau"], labAl: true, chemin: [
        { T: 160, P: 0.15, n: 1, t: "Des argiles et des schistes reposent à 5–6 km de profondeur, vers 150–200 °C." },
        { n: 2, t: "Un granite chaud (≈ 700–800 °C) s'y injecte." },
        { T: 560, P: 0.15, n: 3, t: "À son contact, la roche chauffe jusqu'à 450–650 °C sans être comprimée davantage : andalousite et cordiérite, minéraux de basse pression, cristallisent. L'auréole chauffe et refroidit en 10 000 à 100 000 ans." },
        { T: 300, P: 0.15 }, { T: 15, P: 0, n: 4, t: "Refroidie et remontée par l'érosion avec son granite (340–290 Ma)." }] }),
      src: ["pattison", "tuttle", "diffusion"],
    },
    skarn: {
      exemple: "Exemple suivi : le skarn à tungstène de Salau (Ariège) et de Costabonne (Pyrénées-Orientales), au contact de granites hercyniens (320–290 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Calcaires", "titre": "Des calcaires reposent à quelques kilomètres de profondeur", "quand": "Vers 300 millions d'années", "duree": "des millions d'années", "scene": "accumulationCarbonatee", "p": {"age0": 400, "age1": 395}},
        {"court": "Granite et fluides", "titre": "Un granite s'y injecte et libère en cristallisant des fluides chauds chargés de silice, de fer et de métaux", "quand": "Vers 300 millions d'années", "duree": "des milliers d'années", "scene": "aureole", "p": {"encaissant": "calcaire", "fluides": true, "tDebut": 150, "tMax": 550, "labFluides": "fluides chargés de silice, fer, tungstène", "libelleAge": "il y a ≈ 300 millions d'années", "duree": "des milliers d'années"}},
        {"court": "Échanges", "titre": "Vers 400–650 °C, fluides et calcaire échangent leurs éléments : le CO₂ part, silice et fer entrent", "quand": "Vers 300 millions d'années", "duree": "des milliers d'années", "scene": "recristallisationFoliation", "p": {"texture": "skarn", "sansCompression": true, "tDebut": 300, "tFin": 550, "dureeRecrist": "des milliers d'années", "lignes": ["le CO₂ du calcaire part,", "silice et fer entrent :", "grenat, pyroxène,", "wollastonite et minerais"], "legende": [["#c98a52", "grenat"], ["#8fb07a", "diopside"], ["#2f2f2f", "minerai"]]}},
        {"court": "Érosion", "titre": "L'érosion met au jour le skarn et son minerai de tungstène", "quand": "Depuis 300 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [3, 5], "age3": 300, "texteAffleure": "le skarn affleure au contact du granite : minerai de tungstène"}},
      ],
      proc: "skarn", p: { protolithe: "calcaire", echanges: "Si, Fe, Al, W ⇄ Ca, CO₂", recristTxt: "grenat, pyroxène, wollastonite, minerais" },
      cond: PT_META({ echelle: "contact", courbes: ["graniteEau"], chemin: [
        { T: 150, P: 0.12, n: 1, t: "Des calcaires reposent à quelques kilomètres de profondeur." },
        { T: 300, P: 0.12, n: 2, t: "Un granite s'y injecte et libère en cristallisant des fluides chauds chargés de silice, de fer et de métaux." },
        { T: 550, P: 0.12, n: 3, t: "Vers 400–650 °C, fluides et calcaire échangent leurs éléments : le CO₂ part, silice et fer entrent." },
        { T: 300, P: 0.1 }, { T: 15, P: 0, n: 4, t: "Il en reste des silicates calciques riches en minerais : Costabonne, tungstène (320–290 Ma)." }] }),
      src: ["tuttle"],
    },

    // ════════════════════════ R.3 dynamique ════════════════════════
    mylonite: {
      exemple: "Exemple suivi : les mylonites du cisaillement sud-armoricain (Bretagne), entre 320 et 290 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Granite", "titre": "Un granite déjà formé, en profondeur", "quand": "Vers 330 millions d'années", "scene": "zoneFaille", "p": {"repos": true, "focus": "mylonite", "texte": "un granite déjà formé, vers 15 km", "libelleAge": "vers 330 millions d'années"}},
        {"court": "Cisaillement", "titre": "Une grande zone de cisaillement le déforme vers 10–20 km, au-delà de ≈ 300 °C : le quartz ne casse plus, il s'étire", "quand": "De 320 à 290 millions d'années", "duree": "des millions d'années", "scene": "zoneFaille", "p": {"focus": "mylonite", "ages": [320, 300], "texte": "les deux blocs glissent : en profondeur, la roche flue"}},
        {"court": "Rubans", "titre": "Les grains recristallisent en rubans fins autour d'« yeux » de feldspath plus résistants", "quand": "De 320 à 290 millions d'années", "scene": "vueMicroscope", "p": {"texture": "mylonite", "titre": "Dans la mylonite, au microscope", "lignes": ["le quartz s'étire en rubans", "fins autour d'« yeux » de", "feldspath plus résistants"], "legende": [["#e2ad94", "feldspath (yeux)"], ["#f1eee6", "rubans de quartz"], ["#8a7d66", "micas"]], "thermo": [430, 490]}},
        {"court": "Remontée", "titre": "Le jeu de la faille et l'érosion la remontent", "quand": "Depuis 290 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [10, 15], "age3": 290, "couleurPluton": "#cfc8bc", "texteAffleure": "la mylonite affleure le long de la faille", "texteArene": "une roche finement rubanée"}},
      ],
      proc: "mylonite", p: {},
      cond: PT_META({ echelle: "faille", champs: null, courbes: ["quartzDuctile", "feldspathDuctile", "graniteEau"],
        etiquettes: [["quartzDuctile", 282, 0.5, -90], ["feldspathDuctile", 432, 0.5, -90], ["cassant", 120, 0.72], ["ductile", 820, 0.72]], chemin: [
        { T: 300, P: 0.6, n: 1, t: "Un granite ou un gneiss déjà formé, en profondeur." },
        { T: 430, P: 0.45, n: 2, t: "Une grande zone de cisaillement le déforme vers 10–20 km, au-delà de ≈ 300 °C : le quartz ne casse plus, il s'étire." },
        { T: 490, P: 0.36, n: 3, t: "Les grains recristallisent en rubans fins autour d'« yeux » de feldspath plus résistants (cisaillement sud-armoricain, 320–290 Ma)." },
        { T: 15, P: 0, n: 4, t: "Le jeu de la faille et l'érosion la remontent." }] }),
      src: ["scholz"],
    },
    cataclasite: {
      exemple: "Exemple suivi : les cataclasites des grandes failles du Massif central, broyées à faible profondeur (de l'Hercynien à l'actuel).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Granite", "titre": "Une roche quelconque, ici un granite", "quand": "Avant la faille", "scene": "zoneFaille", "p": {"repos": true, "focus": "cataclasite", "texte": "une roche quelconque, ici un granite", "libelleAge": "avant la faille"}},
        {"court": "Faille cassante", "titre": "Une faille la traverse à moins de ≈ 10 km, sous ≈ 300 °C : le quartz reste cassant", "quand": "Pendant des millions d'années", "duree": "des millions d'années", "scene": "zoneFaille", "p": {"focus": "cataclasite", "libelleAge": "chaque séisme : quelques secondes"}},
        {"court": "Broyage", "titre": "Chaque glissement broie la roche en fragments anguleux, puis des fluides la recimentent", "quand": "À chaque séisme, puis entre deux", "scene": "vueMicroscope", "p": {"texture": "breche", "titre": "Dans la cataclasite, à la loupe", "ciment": "#d9d0c0", "lignes": ["fragments anguleux broyés", "à chaque glissement,", "recimentés par des fluides", "entre deux séismes"], "legende": [["#6f6a63", "fragments"], ["#d9d0c0", "ciment"]]}},
      ],
      proc: "cataclasite", p: {},
      cond: PT_META({ echelle: "faille", champs: null, courbes: ["quartzDuctile", "feldspathDuctile"],
        etiquettes: [["quartzDuctile", 282, 0.5, -90], ["feldspathDuctile", 432, 0.5, -90], ["cassant", 120, 0.72], ["ductile", 820, 0.72]], chemin: [
        { T: 90, P: 0.03, n: 1, t: "Une roche quelconque, ici un granite." },
        { T: 170, P: 0.14, n: 2, t: "Une faille la traverse à moins de ≈ 10 km, sous ≈ 300 °C : le quartz reste cassant." },
        { T: 230, P: 0.2, n: 3, t: "Chaque glissement broie la roche en fragments anguleux, puis des fluides la recimentent (de l'Hercynien à l'actuel)." }] }),
      src: ["scholz"],
    },
    pseudotachylite: {
      exemple: "Exemple suivi : les pseudotachylites de la faille des Hébrides extérieures (Écosse), étudiées par Sibson (1975) : un séisme fossile.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Roche sèche", "titre": "Une roche sèche, vers 8–10 km, dans le domaine cassant", "quand": "Avant le séisme", "scene": "zoneFaille", "p": {"repos": true, "focus": "pseudotachylite", "texte": "une roche sèche, vers 8–10 km, là où elle casse", "libelleAge": "avant le séisme"}},
        {"court": "Séisme", "titre": "Un séisme fait glisser les deux lèvres de la faille à environ un mètre par seconde", "quand": "Quelques secondes", "duree": "quelques secondes", "scene": "zoneFaille", "p": {"focus": "pseudotachylite", "decalage": 1, "libelleAge": "un séisme : quelques secondes", "texte": "séisme : les deux lèvres glissent à ≈ 1 m/s"}},
        {"court": "Fusion éclair", "titre": "Le frottement fond une mince tranche de roche au-delà de 1 000 °C ; le liquide se fige en verre en secondes à minutes", "quand": "Quelques secondes à minutes", "scene": "vueMicroscope", "p": {"texture": "pseudotachylite", "titre": "Dans la faille, à la loupe", "lignes": ["le frottement fond une", "mince tranche de roche :", "le liquide s'injecte dans", "les fissures et se fige", "en verre noir"], "legende": [["#1f1b18", "verre de friction"], ["#efe9dd", "fragments de granite"]], "thermo": [1200, 250]}},
      ],
      proc: "pseudotachylite", p: {},
      cond: PT_META({ echelle: "faille", champs: null, courbes: ["quartzDuctile", "graniteEau"],
        etiquettes: [["quartzDuctile", 282, 0.5, -90], ["cassant", 120, 0.72]], chemin: [
        { T: 250, P: 0.25, n: 1, t: "Une roche sèche, vers 8–10 km, dans le domaine cassant." },
        { n: 2, t: "Un séisme fait glisser les deux lèvres de la faille à environ un mètre par seconde." },
        { T: 1200, P: 0.25, n: 3, t: "Le frottement dégage en quelques secondes assez de chaleur pour fondre une mince tranche de roche, au-delà de 1 000 °C." },
        { T: 250, P: 0.25, t: "La chaleur se dissipe aussitôt dans la roche froide : le liquide se fige en verre en secondes à minutes." }] }),
      src: ["scholz", "sibson"],
    },
    impactite: {
      exemple: "Exemple suivi : l'astroblème de Rochechouart-Chassenon (Haute-Vienne), impact d'un astéroïde il y a 206,9 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Arrivée", "titre": "Un astéroïde d'≈ 1,5 km arrive à ≈ 20 km/s sur le socle du Limousin", "quand": "Il y a 206,9 millions d'années", "duree": "quelques secondes", "scene": "impactArrivee", "p": {"libelleAge": "il y a 206,9 millions d'années"}},
        {"court": "Onde de choc", "titre": "L'onde de choc traverse l'astéroïde en ≈ 0,1 s ; dans le socle, le quartz choqué de Rochechouart a enregistré 10–15 GPa", "quand": "Il y a 206,9 millions d'années", "duree": "une fraction de seconde", "scene": "impactChoc", "p": {"libelleAge": "il y a 206,9 millions d'années"}},
        {"court": "Fusion", "titre": "Près du point d'impact, au-delà de ≈ 60 GPa, la roche fond : verre et brèches remplissent le cratère", "quand": "Il y a 206,9 millions d'années", "duree": "quelques minutes", "scene": "impactRemplissage", "p": {"libelleAge": "il y a 206,9 millions d'années"}},
        {"court": "Érosion", "titre": "Le cratère (≈ 20 km) a été effacé par l'érosion ; ses brèches restent", "quand": "De 206,9 millions d'années à aujourd'hui", "duree": "207 millions d'années", "scene": "impactErosion", "p": {"ages": [206.9, 0]}},
      ],
      proc: "impact", p: {},
      cond: { type: "choc", chemin: [
        { P: 0.15, y: 0.78, n: 1, t: "Un astéroïde d'≈ 1,5 km arrive à ≈ 20 km/s sur le socle du Limousin." },
        { P: 15, y: 0.62, n: 2, t: "L'onde de choc traverse l'astéroïde en ≈ 0,1 s (1,5 km ÷ 20 km/s) ; dans le socle, le quartz choqué de Rochechouart a enregistré 10–15 GPa." },
        { P: 80, y: 0.5, n: 3, t: "Près du point d'impact, au-delà de ≈ 60 GPa, la roche fond : verre et brèches remplissent le cratère." },
        { P: 0.15, y: 0.36, n: 4, t: "Le cratère (≈ 20 km), formé il y a 206,9 Ma, a été effacé par l'érosion ; ses brèches restent." }] },
    },

    // ════════════════════════ R.4 métasomatose ════════════════════════
    serpentinite: {
      exemple: "Exemple suivi : les serpentinites du Queyras et du Chenaillet, manteau de l'océan alpin hydraté par l'eau de mer (165–150 millions d'années).",
      animDuree: 1.2,
      animCurseur: "arrivee",
      anim: [
        {"court": "Manteau à nu", "titre": "Sous une dorsale lente, le manteau remonte jusqu'au fond de l'océan alpin sans beaucoup fondre", "quand": "Vers 160 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "manteau", "lente": true, "suiviDepart": [-1.2, 8.2], "nom": "océan alpin", "libelleAge": "vers 160 millions d'années"}},
        {"court": "Eau de mer", "titre": "En refroidissant, il se fracture : l'eau de mer s'infiltre", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "dorsale", "p": {"suivi": "manteau", "lente": true, "suiviDepart": [-1.2, 8.2], "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "le manteau se fracture : l'eau de mer s'infiltre", "eau": true}},
        {"court": "Serpentinisation", "titre": "Sous ≈ 300–400 °C, l'olivine s'hydrate en serpentine et magnétite ; la roche gonfle et s'allège", "quand": "De 165 à 150 millions d'années", "duree": "des millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "serpentinite", "sansCompression": true, "tDebut": 400, "tFin": 250, "dureeRecrist": "des millions d'années", "lignes": ["l'eau de mer hydrate", "l'olivine : serpentine", "(verte) et magnétite", "(noire) ; la roche gonfle", "et s'allège"], "legende": [["#6f8f5a", "serpentine"], ["#cfdca6", "olivine restante"], ["#2f2f2f", "magnétite"]]}},
        {"court": "Charriage", "titre": "À la fermeture de l'océan, l'essentiel de son fond plonge (Queyras : jusqu'à ≈ 40 km, puis il remonte) ; une écaille restée près de la surface forme le Chenaillet", "quand": "De 50 millions d'années à aujourd'hui", "duree": "charriage en quelques millions d'années, puis érosion", "scene": "obduction", "p": {"ages": [50, 45, 35, 0]}},
      ],
      proc: "serpentinisation", p: {},
      cond: PT_META({ echelle: "reg", courbes: [], chemin: [
        { T: 900, P: 0.6, n: 1, t: "Sous une dorsale lente, le manteau remonte jusqu'au fond de l'océan alpin sans beaucoup fondre." },
        { T: 400, P: 0.08, n: 2, t: "En refroidissant, il se fracture : l'eau de mer s'infiltre." },
        { T: 250, P: 0.08, n: 3, t: "Sous ≈ 300–400 °C, l'olivine s'hydrate en serpentine (lizardite, chrysotile) et magnétite ; la roche gonfle et s'allège (165–150 Ma)." },
        { T: 450, P: 1.1, t: "La subduction alpine l'entraîne en profondeur : la serpentine recristallise en antigorite. Au-delà de 500 à 700 °C selon la pression, elle perdrait son eau." },
        { T: 15, P: 0, n: 4, t: "Elle remonte et est charriée avec les ophiolites : Queyras, Cap Corse." }] }),
      src: ["evans", "manatschal"],
    },
    greisen: {
      exemple: "Exemple suivi : le greisen de Montebras (Creuse), sommet de coupole granitique hercynienne riche en étain (330–300 millions d'années).",
      animCurseur: "arrivee",
      anim: [
        {"court": "Coupole", "titre": "Le sommet d'une coupole de granite finit de cristalliser à quelques kilomètres de profondeur", "quand": "Vers 310 millions d'années", "duree": "100 000 ans à 1 million d'années", "scene": "cristallisationLente", "p": {"tDebut": 850, "tFin": 700, "mineraux": [["quartz", 32], ["orthose", 30], ["plagioclases", 28], ["biotite", 7], ["muscovite", 3]], "dureeCristal": "100 000 ans à 1 million d'années"}},
        {"court": "Fluides", "titre": "Il libère des fluides chauds riches en fluor, bore, lithium, étain et tungstène", "quand": "Vers 310 millions d'années", "duree": "des milliers d'années", "scene": "aureole", "p": {"encaissant": "schistes", "fluides": true, "tDebut": 700, "tMax": 550, "couleurFluide": "#9b59b6", "labAureole": "le sommet du granite", "labFluides": "fluides à fluor, étain, tungstène", "libelleAge": "il y a ≈ 310 millions d'années", "duree": "des milliers d'années"}},
        {"court": "Greisenisation", "titre": "Vers 300–500 °C, ces fluides attaquent le granite : feldspaths et biotite laissent place au quartz, au mica blanc et à la topaze", "quand": "Vers 310 millions d'années", "duree": "des milliers d'années", "scene": "recristallisationFoliation", "p": {"texture": "greisen", "sansCompression": true, "tDebut": 550, "tFin": 400, "dureeRecrist": "des milliers d'années", "lignes": ["les fluides attaquent le", "granite : quartz, mica", "blanc et topaze", "remplacent les feldspaths"], "legende": [["#efece6", "quartz"], ["#dcd8c4", "mica blanc"], ["#f1e7a8", "topaze"]]}},
        {"court": "Filons à étain", "titre": "Cassitérite et wolframite se déposent en filons ; l'érosion les met au jour", "quand": "Depuis 310 millions d'années", "scene": "degagement", "p": {"forme": "filon", "nom": "filons à étain", "couleur": "#efece6", "couches": [["#d9ccb9", "arène granitique"], ["#e2d6c8", "granite"], ["#d8cbbb", ""]], "ages": [310, 0]}},
      ],
      proc: "greisen", p: { magmaCouleur: "#d4a0a0" },
      cond: PT_META({ echelle: "contact", courbes: ["graniteEau"], chemin: [
        { T: 700, P: 0.12, n: 1, t: "Le sommet d'une coupole de granite finit de cristalliser à quelques kilomètres de profondeur." },
        { T: 550, P: 0.1, n: 2, t: "Il libère des fluides chauds riches en fluor, bore, lithium, étain et tungstène." },
        { T: 400, P: 0.1, n: 3, t: "Vers 300–500 °C, ces fluides attaquent le granite : feldspaths et biotite laissent place au quartz, au mica blanc et à la topaze." },
        { T: 15, P: 0, n: 4, t: "Cassitérite et wolframite se déposent en filons : mines d'étain hercyniennes (330–300 Ma)." }] }),
      src: ["tuttle", "pirajno"],
    },
    fenite: {
      exemple: "Exemple suivi : le complexe de Fen (Telemark, Norvège), qui a donné son nom à la fénite, vers 580 millions d'années.",
      animCurseur: "arrivee",
      anim: [
        {"court": "Intrusion", "titre": "Une carbonatite s'installe dans la croûte", "quand": "Vers 580 millions d'années", "scene": "misePlacePluton", "p": {"zPluton": [4, 7], "age2": 581, "age3": 580, "labPluton": "carbonatite", "labAureole": "ses fluides transforment les roches voisines (fénites)"}},
        {"court": "Fluides alcalins", "titre": "Elle libère des fluides riches en sodium et en potassium", "quand": "Vers 580 millions d'années", "duree": "des milliers d'années", "scene": "aureole", "p": {"encaissant": "schistes", "fluides": true, "tDebut": 750, "tMax": 650, "couleurGranite": "#e9e2cb", "nomPluton": "carbonatite", "couleurFluide": "#9b59b6", "labFluides": "fluides riches en sodium et potassium", "libelleAge": "il y a ≈ 580 millions d'années", "duree": "des milliers d'années"}},
        {"court": "Fénitisation", "titre": "À plusieurs centaines de degrés, l'encaissant perd son quartz et gagne feldspath alcalin et ægyrine, sur une auréole de quelques mètres à kilomètres", "quand": "Vers 580 millions d'années", "duree": "des milliers d'années", "scene": "recristallisationFoliation", "p": {"texture": "fenite", "sansCompression": true, "tDebut": 650, "tFin": 500, "dureeRecrist": "des milliers d'années", "lignes": ["le quartz disparaît ;", "feldspath alcalin et", "ægyrine le remplacent"], "legende": [["#e2ad94", "feldspath alcalin"], ["#4f7d3a", "ægyrine"], ["#3b4a6a", "arfvedsonite"]]}},
        {"court": "Érosion", "titre": "L'érosion dégage le complexe et son auréole ; la fénite est absente de France", "quand": "Depuis 580 millions d'années", "scene": "erosionGranite", "p": {"zPluton": [4, 7], "age3": 580, "couleurPluton": "#e9e2cb", "texteAffleure": "le complexe et son auréole de fénite affleurent"}},
      ],
      proc: "fenite", p: {},
      cond: PT_META({ echelle: "contact", courbes: [], chemin: [
        { T: 750, P: 0.2, n: 1, t: "Une carbonatite ou une syénite néphélinique s'installe dans la croûte." },
        { T: 650, P: 0.2, n: 2, t: "Elle libère des fluides riches en sodium et en potassium." },
        { T: 500, P: 0.2, n: 3, t: "À plusieurs centaines de degrés, l'encaissant perd son quartz et gagne feldspath alcalin et aegyrine, sur une auréole de quelques mètres à kilomètres." },
        { T: 15, P: 0, n: 4, t: "L'érosion dégage le complexe et son auréole. Absente en France." }] }),
      src: ["elliott"],
    },
    rodingite: {
      exemple: "Exemple suivi : les rodingites de l'ophiolite du Chenaillet et du Queyras, filons de gabbro transformés dans la serpentinite de l'océan alpin.",
      animDuree: 1.2,
      animCurseur: "arrivee",
      anim: [
        {"court": "Filon de gabbro", "titre": "Un filon de gabbro traverse la péridotite du fond de l'océan alpin", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "dorsale", "p": {"suivi": "gabbro", "lente": true, "suiviDepart": [-1.2, 8.2], "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "du gabbro s'installe dans la péridotite"}},
        {"court": "Serpentinisation", "titre": "En se serpentinisant, la péridotite libère du calcium dans l'eau qui circule", "quand": "De 165 à 150 millions d'années", "duree": "des millions d'années", "scene": "dorsale", "p": {"suivi": "gabbro", "lente": true, "suiviDepart": [-1.2, 8.2], "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "la péridotite s'hydrate et libère du calcium", "eau": true}},
        {"court": "Métasomatose", "titre": "Vers 250–350 °C, ces fluides calciques transforment le gabbro : grenat grossulaire et diopside remplacent les feldspaths", "quand": "De 165 à 100 millions d'années", "duree": "des millions d'années", "scene": "recristallisationFoliation", "p": {"texture": "rodingite", "sansCompression": true, "tDebut": 400, "tFin": 300, "dureeRecrist": "des millions d'années", "lignes": ["des fluides riches en", "calcium changent les", "feldspaths du gabbro en", "grenat et en diopside"], "legende": [["#efd4b4", "grenat grossulaire"], ["#cfdcb4", "diopside"], ["#ece8de", "feldspath restant"]]}},
        {"court": "Charriage", "titre": "Charriée avec les ophiolites alpines", "quand": "De 50 millions d'années à aujourd'hui", "duree": "charriage en quelques millions d'années, puis érosion", "scene": "obduction", "p": {"ages": [50, 45, 35, 0]}},
      ],
      proc: "rodingite", p: { encaissant: ["#6f7f4a", "#5f7a3a", "#6f7f4a", "#7f9a4a", "#6f7f4a", "#5f7a3a"] },
      cond: PT_META({ echelle: "croute", courbes: [], chemin: [
        { T: 1100, P: 0.1, n: 1, t: "Un filon de gabbro traverse la péridotite du fond de l'océan alpin." },
        { T: 400, P: 0.1, n: 2, t: "En se serpentinisant, la péridotite libère du calcium dans l'eau qui circule." },
        { T: 300, P: 0.1, n: 3, t: "Vers 250–350 °C, ces fluides calciques transforment le gabbro : grenat grossulaire et diopside remplacent les feldspaths (165–100 Ma)." },
        { T: 400, P: 0.9 }, { T: 15, P: 0, n: 4, t: "Charriée avec les ophiolites alpines." }] }),
      src: ["bach", "manatschal"],
    },
    spilite: {
      exemple: "Exemple suivi : les basaltes en coussins spilitisés de l'ophiolite du Chenaillet, transformés par l'eau de mer au fond de l'océan alpin.",
      animDuree: 1.2,
      animCurseur: "arrivee",
      anim: [
        {"court": "Coussins", "titre": "Un basalte s'épanche sous la mer en coussins", "quand": "Vers 160 millions d'années", "duree": "des jours à des années", "scene": "dorsale", "p": {"suivi": "basalte", "lente": true, "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "le basalte s'épanche en coussins sur le fond"}},
        {"court": "Eau de mer chaude", "titre": "L'eau de mer, chauffée par la croûte encore chaude, circule dans la lave", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "dorsale", "p": {"suivi": "basalte", "lente": true, "nom": "océan alpin", "libelleAge": "vers 160 millions d'années", "texte": "l'eau de mer, chauffée, circule dans la lave", "eau": true}},
        {"court": "Spilitisation", "titre": "Vers 200–400 °C, le sodium de l'eau remplace le calcium du plagioclase (albite) ; chlorite et épidote verdissent la roche", "quand": "Vers 160 millions d'années", "duree": "des milliers d'années", "scene": "recristallisationFoliation", "p": {"texture": "schiste_vert", "sansCompression": true, "tDebut": 350, "tFin": 280, "dureeRecrist": "des milliers d'années", "lignes": ["le sodium de l'eau", "change le plagioclase", "en albite ; chlorite", "et épidote verdissent"], "legende": [["#4f8a4a", "chlorite"], ["#c9c35a", "épidote"], ["#e9ecdf", "albite"]]}},
        {"court": "Charriage", "titre": "Préservée dans les ophiolites charriées sur le continent, comme dans les vieilles séries volcaniques de Bretagne et des Vosges", "quand": "De 50 millions d'années à aujourd'hui", "duree": "charriage en quelques millions d'années, puis érosion", "scene": "obduction", "p": {"ages": [50, 45, 35, 0]}},
      ],
      proc: "spilite", p: {},
      cond: PT_META({ echelle: "croute", courbes: [], chemin: [
        { T: 1150, P: 0.03, n: 1, t: "Un basalte s'épanche sous la mer en coussins." },
        { T: 350, P: 0.05, n: 2, t: "L'eau de mer, chauffée par la croûte encore chaude, circule dans la lave." },
        { T: 280, P: 0.05, n: 3, t: "Vers 200–400 °C, le sodium de l'eau remplace le calcium du plagioclase (albite) ; chlorite et épidote verdissent la roche (480–350 Ma)." },
        { T: 15, P: 0, n: 4, t: "Préservée dans les ophiolites (Chenaillet) et dans les vieilles séries volcaniques : Bretagne, Vosges, Massif central." }] }),
      src: ["alt", "manatschal"],
    },
  };

  // ─────────────────────────────── API ───────────────────────────────
  const svgScene = (contenu, titre) => `<svg viewBox="0 0 ${W} ${H}" class="fs-svg" role="img" aria-label="${titre}">${contenu}</svg>`;

  function etapes(roche) {
    const f = ROCHES_F[roche.id];
    if (!f || !PROCESSUS[f.proc]) return null;
    return PROCESSUS[f.proc].map(([titre, scene, reglages], i) => {
      const p = Object.assign({ graine: roche.id + i }, f.p, reglages, f.pe && f.pe[i]);
      const t = (f.titres && f.titres[i]) || titre;
      return { titre: t, svg: svgScene(scene(p, roche), t) };
    });
  }

  const DIAGRAMMES = { pt: diagrammePT, evaporation: diagrammeEvaporation, silice: diagrammeSilice, calcite: diagrammeCalcite,
    carbonates: diagrammeCarbonatesMarins, ehph: diagrammeEhPh, enfouissement: diagrammeEnfouissement, climat: diagrammeClimat,
    grains: diagrammeGrains, choc: diagrammeChoc };
  const SOURCES_TYPE = {
    pt: (c) => [...new Set([...(c.courbes || []).map((n) => COURBES_PT[n].src), c.champs === "facies" ? "facies" : null, "profondeur"])].filter(Boolean),
    evaporation: () => ["mccaffrey", "warren", "sofianos"],
    silice: () => ["fournier", "rimstidt", "odp", "treguer"],
    calcite: () => ["plummer"],
    carbonates: () => ["ccd", "photique"],
    ehph: () => ["pourbaix"],
    enfouissement: (c) => [...new Set(["gradient", ...(c.seuils || []).map((n) => SEUILS_ENF[n].src)])],
    climat: () => ["h5", "safran"],
    grains: () => ["ferguson", "wentworth"],
    choc: () => ["stoffler"],
  };

  function conditions(roche) {
    const f = ROCHES_F[roche.id];
    return f && f.cond ? diagramme(f.cond, roche) : null;
  }

  // Même diagramme, à partir d'un objet `cond` quelconque : sert aux fiches minéraux (F.3)
  // et à toute fiche qui n'est pas une roche. `objet` ne sert qu'au texte de remplacement.
  function diagramme(cond, objet) {
    if (!cond || !DIAGRAMMES[cond.type]) return null;
    return `<div class="fc">${DIAGRAMMES[cond.type](cond, objet || { nom: "" })}${cond.note ? `<p class="fc-note">${cond.note}</p>` : ""}</div>`;
  }

  // Sources d'un diagramme donné (mêmes clés que SOURCES), sans passer par ROCHES_F
  function sourcesDe(conds, extra) {
    const cles = [];
    for (const c of [].concat(conds || []).filter(Boolean)) {
      if (SOURCES_TYPE[c.type]) cles.push.apply(cles, SOURCES_TYPE[c.type](c));
      if (c.src) cles.push.apply(cles, c.src);
    }
    cles.push.apply(cles, extra || []);
    return [...new Set(cles)].map((k) => SOURCES[k]).filter(Boolean);
  }

  function sources(roche) {
    const f = ROCHES_F[roche.id];
    if (!f || !f.cond) return "";
    // températures d'apparition affichées par la scène de cristallisation (C.2, 23/09/2026)
    const crist = (f.anim || []).some((e) => e.scene === "cristallisationLente") ? ["bowen", "naney", "maaloe"] : [];
    // montée par filons, mise en place en lames, boules et arène (scènes refaites le 25/09/2026)
    const aScene = (n) => (f.anim || []).some((e) => e.scene === n);
    if (aScene("monteeMagma")) crist.push("petford");
    if (aScene("misePlacePluton")) crist.push("cruden");
    if (aScene("erosionGranite")) crist.push("linton");
    const cles = [...new Set([...(SOURCES_TYPE[f.cond.type] ? SOURCES_TYPE[f.cond.type](f.cond) : []), ...(f.src || []), ...crist])];
    const items = cles.map((k) => SOURCES[k]).filter(Boolean);
    return items.length ? `<p class="page-source"><b>Formation</b> — ${items.join(" ")}</p>` : "";
  }

  // ─────────── températures d'apparition des minéraux dans un magma (étiquettes de la scène animée de cristallisation) ───────────
  // Ordres de grandeur pour un magma hydraté à ≈ 0,2 GPa (7 km) : série de Bowen (1928), solidus du granite avec eau
  // (Tuttle et Bowen 1958), relations de phases des magmas granitiques (Naney 1983). Le graphique « À quelle température
  // chaque minéral cristallise » de « Pour aller plus loin » a été RETIRÉ le 23/09/2026 (ce n'était pas ce qu'il voulait :
  // il pense à un diagramme pression–température des minéraux) ; ces tables servent encore à la scène de formation-anim.js.
  const GROUPE_MIN = [
    [/olivine|forsterite|fayalite/, "olivine"],
    [/pyroxene|augite|diopside|enstatite|hypersthene|aegyrine/, "pyroxène"],
    [/amphibole|hornblende|actinote|tremolite|glaucophane/, "amphibole"],
    [/plagioclase|labradorite|andesine|anorthite|albite|bytownite|oligoclase/, "plagioclase"],
    [/biotite|phlogopite/, "biotite"],
    [/muscovite/, "muscovite"],
    [/orthose|sanidine|microcline|feldspath_k|feldspathk/, "feldspath potassique"],
    [/quartz/, "quartz"],
    [/nepheline|leucite|analcime|sodalite|hauyne/, "feldspathoïde"],
    [/magnetite|ilmenite|chromite|spinelle|titanomagnetite/, "oxydes de fer et de titane"],
    [/apatite|zircon|sphene|titanite|monazite/, "accessoires (apatite, zircon)"],
  ];
  const groupeDe = (id) => (GROUPE_MIN.find(([re]) => re.test(id)) || [])[1];
  const FAMILLES_CRIST = {
    acide: { Tmax: 900, Tmin: 600, liquidus: 870, solidus: 660, nom: "magma riche en silice (granite, rhyolite)",
      t: { "accessoires (apatite, zircon)": [900, 800], "oxydes de fer et de titane": [860, 700], plagioclase: [850, 680],
        amphibole: [820, 700], biotite: [800, 670], "feldspath potassique": [730, 660], quartz: [720, 650], muscovite: [700, 650] } },
    intermediaire: { Tmax: 1200, Tmin: 650, liquidus: 1150, solidus: 700, nom: "magma intermédiaire (diorite, andésite)",
      t: { "accessoires (apatite, zircon)": [1100, 950], "oxydes de fer et de titane": [1080, 850], plagioclase: [1120, 850],
        pyroxène: [1080, 900], amphibole: [1000, 800], biotite: [900, 750], "feldspath potassique": [800, 720], quartz: [790, 700] } },
    basique: { Tmax: 1300, Tmin: 900, liquidus: 1250, solidus: 1000, nom: "magma basique (basalte, gabbro)",
      t: { "oxydes de fer et de titane": [1180, 1000], olivine: [1250, 1100], pyroxène: [1200, 1050], plagioclase: [1200, 1020],
        amphibole: [1050, 950], biotite: [980, 930], "feldspathoïde": [1150, 1000] } },
    ultrabasique: { Tmax: 1750, Tmin: 1200, liquidus: 1700, solidus: 1250, nom: "magma très pauvre en silice (péridotite, pyroxénite)",
      t: { olivine: [1700, 1350], "oxydes de fer et de titane": [1650, 1400], pyroxène: [1600, 1300], plagioclase: [1300, 1220] } },
  };
  function familleCrist(roche) {
    const part = {};
    for (const [id, v] of roche.mineraux || []) { const g = groupeDe(id); if (g) part[g] = (part[g] || 0) + v; }
    const q = part.quartz || 0, ol = part.olivine || 0, px = part["pyroxène"] || 0, pl = part.plagioclase || 0, fk = part["feldspath potassique"] || 0;
    if (ol + px >= 70) return "ultrabasique";
    if (q >= 15 || fk >= 15) return "acide";
    if (pl >= 30 && (px >= 10 || ol >= 5)) return "basique";
    return "intermediaire";
  }
  // C.2 animé : étapes datées d'une roche (null si elle n'a pas encore d'animation)
  function animation(roche) {
    const f = ROCHES_F[roche.id];
    // curseur : "depart" (défaut, la pastille n marque le début de l'étape n) ou "arrivee" (elle en marque la fin)
    // duree : facteur de durée des étapes (animDuree ; 1,2 pour les roches de l'ophiolite, demande du 23/09/2026)
    return f && f.anim ? { etapes: f.anim, exemple: f.exemple || "", curseur: f.animCurseur || "depart", duree: f.animDuree || 1 } : null;
  }

  window.Formation = { etapes, conditions, sources, diagramme, sourcesDe, animation,
    _ROCHES: ROCHES_F, _PROCESSUS: PROCESSUS, _SOURCES: SOURCES, _outils: { C, alea, couleursMin, crist: { FAMILLES_CRIST, familleCrist, groupeDe } } };
})();
