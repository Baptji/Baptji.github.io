// ============ Météorites (B.5, 08/10/2026) : étapes de formation animées et diagramme de conditions ============
// Chargé après formation-conditions.js (il lui faut Formation._fc2) et avant app.js. Même découpage que
// formation-anim-sed.js : des scènes AJOUTÉES à FormationAnim.SCENES, des entrées CRÉÉES dans Formation._ROCHES
// (anim, exemple, cond, src), un type de diagramme AJOUTÉ à Formation._fc2.DIAG.
// Scènes 480 × 240, { fond, anim(t, ta) } ; t = progression de l'étape (figée à la fin), ta = secondes écoulées.
// Diagramme « meteorite » : température selon le temps écoulé depuis les premiers solides du Système solaire (échelle
// logarithmique, 0,1 million d'années → 4 567 millions d'années = aujourd'hui) ; une pastille par étape (état atteint à
// la fin de l'étape), comme pour les autres roches.
(function () {
  "use strict";
  if (!window.Formation || !window.FormationAnim || !Formation._fc2) return;
  const SCENES = FormationAnim.SCENES, ROCHES_F = Formation._ROCHES, SOURCES = Formation._SOURCES, fc = Formation._fc2;
  const W = 480, H = 240;

  // ─────────────────────────────── outils (mêmes conventions que formation-anim-sed.js) ───────────────────────────────
  const r1 = (x) => Math.round(x * 10) / 10;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lisse = (t) => t * t * (3 - 2 * t);
  const fen = (t, a, b) => lisse(clamp((t - a) / (b - a)));
  const op = (x) => Math.round(clamp(x) * 100) / 100;
  const attrs = (o) => Object.entries(o || {}).map(([k, v]) => v == null ? "" : ` ${k}="${v}"`).join("");
  const P = (l) => l.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
  const rect = (x, y, w, h, f, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" fill="${f}"${attrs(o)}/>`;
  const poly = (l, f, o) => `<polygon points="${P(l)}" fill="${f}"${attrs(o)}/>`;
  const pline = (l, c, sw, o) => `<polyline points="${P(l)}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${attrs(o)}/>`;
  const circ = (x, y, r, f, o) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(Math.max(0, r))}" fill="${f}"${attrs(o)}/>`;
  const ell = (x, y, rx, ry, f, o) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(Math.max(0, rx))}" ry="${r1(Math.max(0, ry))}" fill="${f}"${attrs(o)}/>`;
  const line = (x1, y1, x2, y2, c, sw, o) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"${attrs(o)}/>`;
  const txt = (x, y, s, o = {}) => `<text x="${r1(x)}" y="${r1(y)}" class="fa-lab${o.petit ? " fa-petit" : ""}${o.clair ? " fa-clair" : ""}"${o.a ? ` text-anchor="${o.a}"` : ""}${o.op != null ? ` opacity="${op(o.op)}"` : ""}>${s}</text>`;
  const grp = (s, o) => o == null || o >= 1 ? s : o <= 0 ? "" : `<g opacity="${op(o)}">${s}</g>`;
  const nombre = (v) => Math.round(v).toLocaleString("fr-FR").replace(/ | /g, " ");
  let uid = 0;
  const nid = (p) => `mt${p}${++uid}`;
  const { alea } = Formation._outils;
  function melange(a, b, t) {
    const v = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = v(a), B = v(b);
    return "#" + A.map((x, i) => Math.round(x + (B[i] - x) * clamp(t)).toString(16).padStart(2, "0")).join("");
  }
  function fleche(x1, y1, x2, y2, o = {}) {
    const c = o.c || "#27302d", sw = o.sw || 1.6, t = o.pointe || 6;
    const a = Math.atan2(y2 - y1, x2 - x1), bx = x2 - Math.cos(a) * t, by = y2 - Math.sin(a) * t;
    const n = [Math.cos(a + Math.PI / 2) * t * 0.55, Math.sin(a + Math.PI / 2) * t * 0.55];
    return grp(line(x1, y1, bx, by, c, sw) + poly([[x2, y2], [bx + n[0], by + n[1]], [bx - n[0], by - n[1]]], c), o.op);
  }
  // bulle de texte sur fond blanc, ancrée à gauche (lignes de ≤ 40 caractères)
  function bulle(x, y, lignes, o = {}) {
    const w = o.w || Math.max(...lignes.map((l) => l.replace(/<[^>]+>/g, "").length)) * 3.9 + 14, h = 8 + lignes.length * 10.5;
    let s = rect(x, y, w, h, "rgba(255,255,255,.93)", { rx: 5, stroke: "rgba(0,0,0,.14)" });
    lignes.forEach((l, i) => { s += `<text x="${r1(x + 7)}" y="${r1(y + 13 + i * 10.5)}" class="fa-leg">${l}</text>`; });
    return grp(s, o.op);
  }
  // compteur d'âge en haut ou en bas : `libelle` pour un texte libre
  function compteur(x, y, libelle, o = {}) {
    const w = libelle.length * 4.15 + 16;
    x = clamp(x, w / 2 + 4, W - 4 - w / 2);
    return grp(rect(x - w / 2, y - 10, w, 19, "rgba(255,255,255,.92)", { rx: 5, stroke: "rgba(0,0,0,.14)" })
      + `<text x="${r1(x)}" y="${r1(y + 3.5)}" text-anchor="middle" class="fa-lab" style="stroke:none">${libelle}</text>`, o.op);
  }
  const ilYa = (ma) => `il y a ${ma < 10 ? String(Math.round(ma * 10) / 10).replace(".", ",") : nombre(ma)} million${ma >= 2 ? "s" : ""} d'années`;
  function thermometre(x, yHaut, h, v, vmin, vmax, ticks, o = {}) {
    const yv = (u) => yHaut + h - (clamp(u, vmin, vmax) - vmin) / (vmax - vmin) * h;
    let s = rect(x - 5, yHaut, 10, h, "#ffffff", { rx: 5, stroke: "#27302d", "stroke-width": 1 })
      + circ(x, yHaut + h + 9, 9, "#c0392b", { stroke: "#27302d", "stroke-width": 1 })
      + rect(x - 2.5, yv(v), 5, yHaut + h + 9 - yv(v), "#c0392b");
    for (const u of ticks) s += line(x + 5, yv(u), x + 9, yv(u), "#27302d", 1) + `<text x="${r1(x + 12)}" y="${r1(yv(u) + 3.2)}" class="fa-leg"${o.clair ? ' style="fill:#e8ecf2"' : ""}>${nombre(u)} °C</text>`;
    return s + `<text x="${r1(x)}" y="${r1(yHaut - 6)}" text-anchor="middle" class="fa-leg"${o.clair ? ' style="fill:#e8ecf2"' : ""}>≈ ${nombre(v)} °C</text>`;
  }
  function loupe(cx, cy, r, o = {}) {
    const k = nid("l");
    let fond = "";
    if (o.vers) {
      const [x, y] = o.vers, d = Math.hypot(x - cx, y - cy), phi = Math.atan2(y - cy, x - cx), b = Math.acos(Math.min(1, r / d));
      fond += poly([[x, y], [cx + Math.cos(phi + b) * r, cy + Math.sin(phi + b) * r], [cx + Math.cos(phi - b) * r, cy + Math.sin(phi - b) * r]], "rgba(255,255,255,.28)")
        + circ(x, y, o.rVers || 4, "none", { stroke: "#ffffff", "stroke-width": 1.2 });
    }
    fond += `<clipPath id="${k}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` + circ(cx, cy, r + 2.5, "#fff") + circ(cx, cy, r, o.fond || "#1d2233");
    return { fond, dans: (c) => `<g clip-path="url(#${k})">${c}</g>`, bord: circ(cx, cy, r + 1.3, "none", { stroke: "#27302d", "stroke-width": 1.3 }) };
  }
  // ciel étoilé (fond des scènes spatiales)
  function espace(graine, n = 70) {
    const k = nid("esp"), R = alea("esp" + graine);
    let s = `<defs><linearGradient id="${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1022"/><stop offset="1" stop-color="#1c2541"/></linearGradient></defs>` + rect(0, 0, W, H, `url(#${k})`);
    for (let i = 0; i < n; i++) s += circ(R() * W, R() * H, 0.4 + R() * 0.8, "#ffffff", { opacity: r1(0.25 + R() * 0.6) });
    return s;
  }
  const blanc = (x, y, s, o = {}) => `<text x="${r1(x)}" y="${r1(y)}" class="fa-lab${o.petit ? " fa-petit" : ""}" style="fill:#eef2f7;stroke:none"${o.a ? ` text-anchor="${o.a}"` : ""}${o.op != null ? ` opacity="${op(o.op)}"` : ""}>${s}</text>`;
  function soleil(x, y, r, ta = 0) {
    const k = nid("sol");
    return `<defs><radialGradient id="${k}"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd35a"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/></radialGradient></defs>`
      + circ(x, y, r * (2.4 + 0.08 * Math.sin(ta * 2)), `url(#${k})`, { opacity: 0.85 }) + circ(x, y, r, "#ffd86b");
  }
  // coupe d'un astéroïde : `couches` = [{ r (fraction du rayon), c }] de l'extérieur vers le centre
  function bosselé(cx, cy, r, graine, k = 26, amp = 0.07) {
    if (r > 20) { k = Math.max(k, 44); amp *= 0.7; }
    const R = alea("b" + graine), out = [];
    for (let i = 0; i < k; i++) { const a = i / k * 6.283; out.push([cx + Math.cos(a) * r * (1 + (R() - 0.5) * amp * 2), cy + Math.sin(a) * r * (1 + (R() - 0.5) * amp * 2)]); }
    return out;
  }

  // ─────────────────────────────── 1 · le disque autour du jeune Soleil ───────────────────────────────
  // p.zone : "interne" (près du Soleil : chondrites à enstatite), "ceinture" (entre Mars et Jupiter), "externe" (au-delà de
  // la ligne des glaces : chondrites carbonées) ; p.cai : montrer les premiers solides ; p.titre, p.lignes.
  const ZONES = { interne: 95, ceinture: 190, externe: 330 };
  SCENES.disqueSolaire = function (p) {
    const R = alea("ds" + (p.graine || "")), parts = Array.from({ length: 190 }, () => ({ a: 40 + Math.pow(R(), 0.8) * 400, th: R() * 6.283, s: 0.5 + R() * 1.1, t0: R() * 0.6 }));
    const cai = Array.from({ length: 14 }, () => ({ a: 45 + R() * 30, th: R() * 6.283, t0: R() * 0.25 }));
    const aZ = ZONES[p.zone || "ceinture"], XS = 46, YS = 132, NEIGE = 262;
    return {
      fond: espace(p.graine),
      anim(t, ta) {
        let s = "";
        const k = nid("dq");
        s += `<defs><linearGradient id="${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8a258" stop-opacity=".55"/><stop offset=".5" stop-color="#9c8f86" stop-opacity=".35"/><stop offset="1" stop-color="#8aa3c4" stop-opacity=".3"/></linearGradient></defs>`;
        s += ell(XS + 210, YS, 440, 34, `url(#${k})`);
        // ligne des glaces
        s += ell(XS, YS, NEIGE, NEIGE * 0.13, "none", { stroke: "#a9c9ee", "stroke-width": 0.9, "stroke-dasharray": "4 3", opacity: 0.8 });
        s += blanc(XS + NEIGE, YS + NEIGE * 0.13 + 12, "la zone glacée, située à ≈ 3 fois la distance qui sépare la Terre du Soleil", { petit: true, a: "middle" });
        // zone où naît la météorite
        s += ell(XS, YS, aZ, aZ * 0.13, "none", { stroke: "#ff6b5a", "stroke-width": 2, opacity: r1(0.4 + 0.5 * fen(t, 0.1, 0.4)) });
        // au-dessus de l'anneau, sauf loin du Soleil, où la loupe occupe le haut de la scène
        s += blanc(XS + aZ, aZ > 250 ? YS + aZ * 0.13 + 26 : YS - aZ * 0.13 - 7, p.ici || "ici naissent ses poussières", { a: "middle", op: fen(t, 0.15, 0.4) });
        // poussières en orbite (vitesse ∝ a^-1,5)
        for (const q of parts) {
          if (t < q.t0 * 0.8) continue;
          const th = q.th + ta * 9 * Math.pow(q.a / 60, -1.5);
          const x = XS + q.a * Math.cos(th), y = YS + q.a * 0.13 * Math.sin(th);
          if (x > W + 4) continue;
          s += circ(x, y, q.s, q.a > NEIGE ? "#dbe9fb" : "#d9b48a", { opacity: r1(0.5 + 0.5 * fen(t, q.t0 * 0.8, q.t0 * 0.8 + 0.2)) });
        }
        if (p.cai) for (const q of cai) {
          if (t < q.t0) continue;
          const th = q.th + ta * 9 * Math.pow(q.a / 60, -1.5);
          s += circ(XS + q.a * Math.cos(th), YS + q.a * 0.13 * Math.sin(th), 1.6, "#ffffff");
        }
        s += soleil(XS, YS, 15, ta);
        s += blanc(XS, YS + 30, "jeune Soleil", { a: "middle", petit: true });
        if (p.cai) s += blanc(XS + 8, 196, "points blancs : les premiers solides, inclusions", { petit: true, op: fen(t, 0.05, 0.25) }) + blanc(XS + 8, 205, "inclusions réfractaires, riches en calcium et en aluminium (4 567,3 Ma)", { petit: true, op: fen(t, 0.05, 0.25) });
        // loupe : des grains de poussière qui s'agglomèrent
        const L = loupe(408, 58, 38, { vers: [XS + aZ, YS], fond: "#151a2b" });
        let d = "";
        const Rl = alea("dl" + (p.graine || ""));
        for (let i = 0; i < 26; i++) {
          const a = Rl() * 6.283, d0 = 18 + Rl() * 24, d1 = 3 + Rl() * 10, dd = lerp(d0, d1, fen(t, 0.2, 0.85));
          d += circ(408 + Math.cos(a) * dd, 58 + Math.sin(a) * dd, 1.5 + Rl() * 1.6, p.zone === "externe" && i % 3 === 0 ? "#dbe9fb" : i % 4 === 0 ? "#cfd2d4" : "#c39d70");
        }
        s += L.fond + L.dans(d) + L.bord + blanc(408, 106, p.loupe || "les grains se collent", { a: "middle", petit: true });
        s += blanc(8, 15, p.titre || "Autour du jeune Soleil, un disque de gaz et de poussière est animé d'un mouvement de rotation");
        (p.lignes || []).forEach((l, i) => { s += blanc(8, 27 + i * 10, l, { petit: true }); });
        s += compteur(388, 228, p.age || ilYa(4567));
        return s;
      },
    };
  };

  // ─────────────────────────────── 2 · les chondres : un éclair de chaleur, quelques heures pour figer ───────────────────────────────
  const COUL_CH = { po: ["#c3cc6a", "#8f8b68"], bo: ["#c7cf72", "#625d48"], rp: ["#d4cfae", "#8c8a68"], pop: ["#b9bd82", "#7b7656"] };
  SCENES.chondresFlash = function (p) {
    const types = p.types || ["po", "bo", "po", "rp", "pop"];
    const R = alea("cf" + (p.graine || ""));
    const gouttes = types.map((ty, i) => ({ ty, x: 70 + i * (300 / types.length) + R() * 20, y: 92 + (i % 2) * 64 + R() * 14, r: 15 + R() * 9,
      grains: Array.from({ length: 22 }, () => ({ a: R() * 6.283, d: R(), s: 1.2 + R() * 2.2 })), cr: Array.from({ length: 9 }, () => ({ a: R() * 6.283, d: Math.sqrt(R()) * 0.85, s: 0.18 + R() * 0.15, ang: R() * 3 })) }));
    const T = (t) => t < 0.2 ? 200 : t < 0.32 ? lerp(200, p.tmax || 1750, fen(t, 0.2, 0.32)) : lerp(p.tmax || 1750, 450, fen(t, 0.36, 0.9));
    return {
      fond: rect(0, 0, W, H, "#1a1f30"),
      anim(t, ta) {
        let s = "";
        // l'éclair : un front chaud qui balaie la scène (onde de choc ou autre source de chaleur, encore discutée)
        const xf = lerp(-60, W + 60, fen(t, 0.18, 0.36));
        if (t > 0.16 && t < 0.42) { const k = nid("fl"); s += `<defs><linearGradient id="${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb347" stop-opacity="0"/><stop offset=".7" stop-color="#ffd07a" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>` + rect(xf - 70, 0, 70, H, `url(#${k})`); }
        const fondu = fen(t, 0.22, 0.34), cristal = fen(t, 0.45, 0.88);
        for (const g of gouttes) {
          const passe = xf > g.x - 10, chaud = passe ? fondu : 0, refr = cristal;
          const coul = chaud < 1 ? "#a08868" : melange("#ff9b3d", COUL_CH[g.ty][1], refr);
          if (chaud < 0.95) for (const q of g.grains) { const dd = q.d * g.r * (1.35 - 0.4 * chaud); s += circ(g.x + Math.cos(q.a + ta * 0.3) * dd, g.y + Math.sin(q.a + ta * 0.3) * dd, q.s * (1 - chaud * 0.6), "#b4977a", { opacity: r1(1 - chaud) }); }
          if (chaud > 0.05) {
            const k = nid("gt");
            let dedans = "";
            if (refr > 0) {
              const [cl] = COUL_CH[g.ty];
              if (g.ty === "bo") { for (let d = -g.r; d < g.r; d += 4.4) dedans += line(g.x - g.r, g.y + d, g.x + g.r, g.y + d + g.r * 0.25, cl, 2.1 * refr); }
              else if (g.ty === "rp") { for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; dedans += line(g.x - g.r * 0.4, g.y + g.r * 0.3, g.x - g.r * 0.4 + Math.cos(a) * g.r * 2 * refr, g.y + g.r * 0.3 + Math.sin(a) * g.r * 2 * refr, cl, 1); } }
              else for (const c of g.cr) { const x = g.x + Math.cos(c.a) * c.d * g.r, y = g.y + Math.sin(c.a) * c.d * g.r, rr = c.s * g.r * refr; dedans += poly(Array.from({ length: 6 }, (_, i) => [x + Math.cos(c.ang + i * 1.047) * rr, y + Math.sin(c.ang + i * 1.047) * rr * 0.75]), cl, { stroke: "#27302d", "stroke-width": 0.4 }); }
            }
            s += grp(`<clipPath id="${k}"><circle cx="${r1(g.x)}" cy="${r1(g.y)}" r="${r1(g.r)}"/></clipPath>` + circ(g.x, g.y, g.r, coul) + `<g clip-path="url(#${k})">${dedans}</g>` + circ(g.x, g.y, g.r, "none", { stroke: "#27302d", "stroke-width": 0.8 }), chaud);
          }
        }
        s += thermometre(426, 40, 150, T(t), 0, 2000, [0, 500, 1000, 1500, 2000], { clair: true });
        s += blanc(8, 15, t < 0.2 ? "Des amas de poussière flottent dans le disque" : t < 0.4 ? "Un éclair de chaleur : en quelques minutes, ils fondent" : "Les gouttes se figent et cristallisent en l'espace de quelques heures");
        s += blanc(8, 27, "taille réelle d'une goutte : 0,2 à 2 mm", { petit: true });
        if (t > 0.5) s += bulle(8, 186, ["Selon la vitesse du refroidissement : cristaux", "d'olivine dans du verre, barres parallèles", "ou fibres rayonnantes"], { op: fen(t, 0.5, 0.65) });
        s += compteur(300, 228, p.age || "Environ 1 à 3 millions d'années, après les premiers solides");
        return s;
      },
    };
  };

  // ─────────────────────────────── 3 · accrétion : chondres, métal et poussière s'agglomèrent en astéroïde ───────────────────────────────
  SCENES.accretionAsteroide = function (p) {
    const R = alea("ac" + (p.graine || "")), CX = 240, CY = 128, RMAX = p.rmax || 64;
    const parts = Array.from({ length: 110 }, () => ({ a: R() * 6.283, t0: R() * 0.8, v: 0.18 + R() * 0.2, k: R() }));
    const mouch = Array.from({ length: 160 }, () => ({ a: R() * 6.283, d: Math.sqrt(R()), k: R() }));
    return {
      fond: espace(p.graine),
      anim(t, ta) {
        let s = "";
        const r = lerp(6, RMAX, fen(t, 0, 0.85));
        // grains qui arrivent
        for (const q of parts) {
          const u = (t - q.t0) / q.v;
          if (u < 0 || u > 1) continue;
          const d = lerp(270, r, lisse(u)), x = CX + Math.cos(q.a) * d, y = CY + Math.sin(q.a) * d * 0.9;
          const c = p.glace && q.k < 0.3 ? "#dbe9fb" : q.k < 0.45 ? "#cfd2d4" : q.k < 0.7 ? "#c3cc6a" : "#9c8770";
          s += circ(x, y, q.k < 0.7 ? 1.8 : 1.2, c);
        }
        const corps = bosselé(CX, CY, r, p.graine, 30, 0.06);
        s += poly(corps, p.couleur || "#6c6457", { stroke: "#1b1f2c", "stroke-width": 1 });
        for (const m of mouch) { const d = m.d * r * 0.92; if (d > r - 2) continue; s += circ(CX + Math.cos(m.a) * d, CY + Math.sin(m.a) * d, Math.max(0.5, r / 40), m.k < 0.18 ? "#cfd2d4" : p.glace && m.k < 0.35 ? "#cfe0f3" : m.k < 0.6 ? "#a3ab5c" : "#4f4a42"); }
        // échelle
        s += line(CX - RMAX, CY - RMAX - 9, CX + RMAX, CY - RMAX - 9, "#eef2f7", 1.2, { opacity: r1(fen(t, 0.7, 0.9)) })
          + blanc(CX, CY - RMAX - 13, p.taille || "≈ 100 km", { a: "middle", petit: true, op: fen(t, 0.7, 0.9) });
        s += blanc(8, 15, p.titre || "Les chondres, les grains de métal et la poussière s'agglomèrent : un astéroïde se forme peu à peu");
        (p.lignes || []).forEach((l, i) => { s += blanc(8, 27 + i * 10, l, { petit: true }); });
        s += compteur(390, 228, p.age || "Au bout de ≈ 2 millions d'années, après les premiers solides");
        return s;
      },
    };
  };

  // ─────────────────────────────── 4 · l'astéroïde chauffe : métamorphisme, eau liquide ou début de fusion ───────────────────────────────
  // p.mode : "metamorphisme" (couches par type pétrologique), "eau" (la glace fond, l'eau circule), "fusionPartielle"
  // p.tmax (°C au point suivi), p.position (0 = centre, 1 = surface), p.nom (étiquette du point suivi)
  const TYPES = [{ r: 1, c: "#7d7564", n: "type 3 · moins de 600 °C" }, { r: 0.8, c: "#9d7c57", n: "type 4 · 600 à 700 °C" }, { r: 0.6, c: "#b97b48", n: "type 5 · 700 à 750 °C" }, { r: 0.42, c: "#d27a3c", n: "type 6 · 750 à 950 °C" }];
  SCENES.chauffageAsteroide = function (p) {
    const mode = p.mode || "metamorphisme", CX = 170, CY = 128, RR = 88, R = alea("ch" + (p.graine || ""));
    const al = Array.from({ length: 60 }, () => ({ a: R() * 6.283, d: Math.sqrt(R()) * 0.95, ph: R() * 6.283 }));
    const eau = Array.from({ length: 40 }, () => ({ a: R() * 6.283, d: 0.2 + R() * 0.7, v: (R() - 0.5) * 0.8 }));
    const tmax = p.tmax || (mode === "eau" ? 120 : mode === "fusionPartielle" ? 1150 : 850);
    const Tde = (t) => lerp(-20, tmax, fen(t, 0.05, 0.5)) - (tmax + 20) * 0.55 * fen(t, 0.6, 1);
    const pos = p.position ?? 0.25;
    return {
      fond: rect(0, 0, W, H, "#141a2b"),
      anim(t, ta) {
        let s = "";
        const chaud = fen(t, 0.05, 0.5) * (1 - 0.55 * fen(t, 0.6, 1));
        const corps = bosselé(CX, CY, RR, p.graine, 34, 0.04);
        if (mode === "metamorphisme") {
          s += poly(corps, TYPES[0].c, { stroke: "#0d111c", "stroke-width": 1 });
          TYPES.slice(1).forEach((c, i) => { s += circ(CX, CY, RR * c.r, melange(TYPES[0].c, c.c, fen(t, 0.1 + i * 0.08, 0.45 + i * 0.03))); });
        } else if (mode === "eau") {
          s += poly(corps, melange("#5a5450", "#3b3a3e", fen(t, 0.3, 0.8)), { stroke: "#0d111c", "stroke-width": 1 });
          s += circ(CX, CY, RR * 0.7, melange("#5a5450", "#2e3a48", fen(t, 0.3, 0.7)), { opacity: 0.8 });
        } else {
          s += poly(corps, "#7d7564", { stroke: "#0d111c", "stroke-width": 1 });
          s += circ(CX, CY, RR * 0.6, melange("#7d7564", "#d0703a", chaud));
          s += circ(CX, CY, RR * 0.32, melange("#7d7564", "#ec8a3a", chaud));
        }
        // aluminium 26 : des étincelles de plus en plus rares (demi-vie 717 000 ans)
        for (const q of al) { if (Math.sin(ta * 3 + q.ph) < 0.92 - 0.2 * (1 - t)) continue; if (R && (q.ph * 10 % 1) > 1.1 - t) continue; s += circ(CX + Math.cos(q.a) * q.d * RR, CY + Math.sin(q.a) * q.d * RR, 1.6, "#fff3b0"); }
        if (mode === "eau") {
          const liq = fen(t, 0.25, 0.45);
          for (const q of eau) { const a = q.a + ta * q.v; s += circ(CX + Math.cos(a) * q.d * RR, CY + Math.sin(a) * q.d * RR, 1.8, liq > 0.5 ? "#4f9de0" : "#dbe9fb", { opacity: r1(0.4 + 0.6 * (liq > 0.5 ? liq : 1 - liq)) }); }
          s += bulle(266, 44, ["La glace fond : l'eau liquide", "circule (≈ 50 à 150 °C) et change", "olivine et pyroxène en argiles,", "magnétite et carbonates."], { op: fen(t, 0.35, 0.5) });
        }
        if (mode === "metamorphisme") TYPES.forEach((c, i) => {
          // trait depuis le milieu de chaque couche, à droite du centre, vers son étiquette
          const y = 44 + i * 26, rm = RR * (i < 3 ? (c.r + TYPES[i + 1].r) / 2 : c.r / 2), am = -0.55 + i * 0.12;
          s += line(CX + Math.cos(am) * rm, CY + Math.sin(am) * rm, 280, y - 3, "#cfd6e0", 0.7, { opacity: r1(fen(t, 0.35, 0.5)) }) + blanc(284, y, c.n, { petit: true, op: fen(t, 0.35, 0.5) });
        });
        if (mode === "fusionPartielle") {
          // le liquide de fer-sulfure (gris) puis le premier liquide silicaté (orange) se rassemblent en veines
          for (let i = 0; i < 9; i++) { const a = i * 0.7, d0 = RR * 0.55; const d = lerp(d0, RR * 0.18, fen(t, 0.35, 0.75)); s += line(CX + Math.cos(a) * d0, CY + Math.sin(a) * d0, CX + Math.cos(a) * d, CY + Math.sin(a) * d, "#b9bcbf", 1.6, { opacity: r1(fen(t, 0.3, 0.45)) }); }
          s += bulle(266, 44, ["Vers 980 °C, le fer et son sulfure", "fondent et s'écoulent ; au-delà de", "≈ 1 100 °C, un peu de silicate", "fond à son tour et remonte."], { op: fen(t, 0.3, 0.45) });
        }
        // point suivi
        const xp = CX - pos * RR * 0.8, yp = CY + pos * RR * 0.6;
        s += circ(xp, yp, 4, "#e53b2c", { stroke: "#fff", "stroke-width": 1.4 }) + line(xp - 3, yp + 3, CX - RR * 0.55, CY + RR + 4, "#ffffff", 0.7) + blanc(CX - RR * 0.55, CY + RR + 13, p.nom || "notre pierre", { petit: true, a: "middle" });
        s += thermometre(426, 50, 140, Tde(t), mode === "eau" ? -100 : 0, mode === "eau" ? 200 : 1200, mode === "eau" ? [-100, 0, 100, 200] : [0, 400, 800, 1200], { clair: true });
        s += blanc(8, 15, p.titre || "De l'intérieur, l'aluminium 26, élément radioactif, réchauffe l'astéroïde");
        (p.lignes || []).forEach((l, i) => { s += blanc(8, 27 + i * 10, l, { petit: true }); });
        s += compteur(345, 228, p.age || "entre 2 et 60 millions d'années, à partir des premiers solides");
        return s;
      },
    };
  };

  // ─────────────────────────────── 5 · différenciation : le métal descend en noyau, une croûte basaltique se forme ───────────────────────────────
  SCENES.differenciation = function (p) {
    const CX = 170, CY = 128, RR = 90, R = alea("df" + (p.graine || "")), RN = p.noyau || 0.45;
    const gouttes = Array.from({ length: 70 }, () => ({ a: R() * 6.283, d: 0.5 + R() * 0.45, t0: R() * 0.4 }));
    const volc = Array.from({ length: 7 }, () => ({ a: -2.6 + R() * 2.2, t0: 0.6 + R() * 0.3 }));
    return {
      fond: rect(0, 0, W, H, "#141a2b"),
      anim(t, ta) {
        let s = "";
        const chaud = fen(t, 0, 0.3), rn = RR * RN * fen(t, 0.2, 0.65), ec = (p.croute === false ? 0 : 7) * fen(t, 0.55, 0.95);
        s += poly(bosselé(CX, CY, RR, p.graine, 34, 0.035), melange("#7d7564", "#d0803f", chaud * (1 - 0.6 * fen(t, 0.7, 1))), { stroke: "#0d111c", "stroke-width": 1 });
        s += circ(CX, CY, RR - ec, melange("#c46a35", "#6e7b3c", fen(t, 0.45, 0.9)), { opacity: r1(fen(t, 0.25, 0.5)) });
        if (ec > 0.5) s += circ(CX, CY, RR - ec / 2, "none", { stroke: "#3a332d", "stroke-width": r1(ec) });
        for (const g of gouttes) {
          if (t < g.t0) continue;
          const d = lerp(g.d * RR, rn * 0.7, fen(t, g.t0 + 0.05, g.t0 + 0.35));
          if (d <= rn) continue;
          s += circ(CX + Math.cos(g.a) * d, CY + Math.sin(g.a) * d, 2, "#c3c6c9");
        }
        s += circ(CX, CY, rn, "#a7abb0", { stroke: "#5d6166", "stroke-width": 0.8 });
        for (const v of volc) if (t > v.t0) { const x = CX + Math.cos(v.a) * RR, y = CY + Math.sin(v.a) * RR; s += circ(x, y, 3 + Math.sin(ta * 4 + v.a) * 0.8, "#ff7a2f", { opacity: r1(1 - fen(t, v.t0 + 0.2, v.t0 + 0.4)) }); }
        const lab = (x, y, xl, yl, tx, o) => line(x, y, xl - 3, yl - 3, "#cfd6e0", 0.7, { opacity: r1(o) }) + blanc(xl, yl, tx, { petit: true, op: o });
        s += lab(CX, CY, 280, 150, p.labNoyau || "noyau de fer-nickel", fen(t, 0.55, 0.7));
        s += lab(CX + RR * 0.65, CY - RR * 0.3, 280, 110, p.labManteau || "manteau d'olivine", fen(t, 0.6, 0.75));
        if (p.croute !== false) s += lab(CX + RR * 0.98, CY - RR * 0.18, 280, 72, p.labCroute || "croûte de basalte", fen(t, 0.75, 0.9));
        if (p.suivi) { const pos = { noyau: [CX - rn * 0.4, CY + rn * 0.2], manteau: [CX - RR * 0.62, CY - RR * 0.25], croute: [CX - RR * 0.95, CY - RR * 0.2] }[p.suivi]; s += circ(pos[0], pos[1], 4, "#e53b2c", { stroke: "#fff", "stroke-width": 1.4, opacity: r1(fen(t, 0.7, 0.85)) }); }
        s += thermometre(426, 50, 140, lerp(-20, p.tmax || 1500, fen(t, 0, 0.45)), 0, 1600, [0, 500, 1000, 1500], { clair: true });
        s += blanc(8, 15, p.titre || "Porté au-delà de 1 200 °C, l'astéroïde se liquéfie : le métal, plus dense, gagne le centre");
        (p.lignes || []).forEach((l, i) => { s += blanc(8, 27 + i * 10, l, { petit: true }); });
        s += compteur(150, 228, p.age || "Environ 1 à 3 millions d'années, après les premiers solides");
        return s;
      },
    };
  };

  // ─────────────────────────────── 6 · le noyau refroidit : figures de Widmanstätten ───────────────────────────────
  SCENES.noyauRefroidit = function (p) {
    const CX = 120, CY = 132, RR = 82, R = alea("nr" + (p.graine || ""));
    const lam = Array.from({ length: 46 }, (_, i) => ({ k: i % 3, x: R() * 2 - 1, y: R() * 2 - 1, L: 0.5 + R() * 1, t0: R() * 0.6 }));
    const ANG = [0.2, 1.25, 2.3];
    const T = (t) => lerp(1450, 380, fen(t, 0.05, 0.95));
    return {
      fond: rect(0, 0, W, H, "#141a2b"),
      anim(t) {
        let s = poly(bosselé(CX, CY, RR, p.graine, 34, 0.035), "#3a332d", { stroke: "#0d111c", "stroke-width": 1 })
          + circ(CX, CY, RR - 6, "#6e7b3c") + circ(CX, CY, RR * 0.45, melange("#d9a06a", "#a7abb0", fen(t, 0, 0.4)), { stroke: "#5d6166", "stroke-width": 0.8 });
        const L = loupe(330, 118, 74, { vers: p.breche ? [CX + RR - 4, CY - 10] : [CX + 10, CY - 8], fond: "#e3e2db" });
        let d = rect(250, 40, 160, 160, "#e3e2db");
        if (p.breche) {      // mésosidérite : fragments de croûte (fixes) et nodules de métal où les lamelles poussent
          const Rb = alea("br" + (p.graine || ""));
          d = rect(250, 40, 160, 160, "#8f9194");
          for (let i = 0; i < 16; i++) { const x = 262 + Rb() * 136, y = 52 + Rb() * 132; d += poly(bosselé(x, y, 8 + Rb() * 12, "c" + i, 7, 0.35), i % 3 ? "#7d7a6c" : "#c8c3b4", { stroke: "#27302d", "stroke-width": 0.5 }); }
          for (let i = 0; i < 12; i++) { const x = 262 + Rb() * 136, y = 52 + Rb() * 132; d += poly(bosselé(x, y, 5 + Rb() * 7, "m" + i, 9, 0.2), "#cfd2d4", { stroke: "#5d6166", "stroke-width": 0.5 }); }
        }
        // les lamelles poussent quand la température passe de 700 à 450 °C
        const prog = clamp((700 - T(t)) / 250);
        for (const q of p.breche ? [] : lam) {
          const u = clamp((prog - q.t0 * 0.6) / 0.4);
          if (u <= 0) continue;
          const cx = 330 + q.x * 70, cy = 118 + q.y * 70, a = ANG[q.k], l = q.L * 50 * u;
          d += line(cx - Math.cos(a) * l / 2, cy - Math.sin(a) * l / 2, cx + Math.cos(a) * l / 2, cy + Math.sin(a) * l / 2, ["#a3a7ab", "#8e9296", "#b2b5b8"][q.k], 6, { stroke: "#a3a7ab" })
            + line(cx - Math.cos(a) * l / 2, cy - Math.sin(a) * l / 2, cx + Math.cos(a) * l / 2, cy + Math.sin(a) * l / 2, ["#a3a7ab", "#8e9296", "#b2b5b8"][q.k], 4.5);
        }
        s += L.fond + L.dans(d) + L.bord;
        s += `<text x="318" y="${118 + 88}" text-anchor="middle" class="fa-leg" style="fill:#eef2f7">${p.breche ? "fragments de croûte et métal (gris)" : prog <= 0 ? "taénite : un seul cristal de fer-nickel" : "kamacite (gris) en lamelles dans la taénite"}</text>`;
        s += thermometre(426, 50, 140, T(t), 0, 1600, [0, 500, 1000, 1500], { clair: true });
        s += blanc(8, 15, p.titre || "Chaque million d'années, le noyau voit sa température baisser de quelques dizaines de degrés.");
        (p.lignes || ["Dans l'intervalle de 700 à 450 °C, le nickel se déplace au sein du métal solide :", "ce processus demande des millions d'années, et aucune forge ne saurait l'imiter."]).forEach((l, i) => { s += blanc(8, 27 + i * 10, l, { petit: true }); });
        s += compteur(120, 228, p.age || "une durée allant de quelques millions à plusieurs dizaines de millions d'années");
        return s;
      },
    };
  };

  // ─────────────────────────────── 7 · collision : l'astéroïde (ou Mars, la Lune, Vesta) perd un fragment ───────────────────────────────
  // p.cible : "asteroide" | "vesta" | "noyau" | "mars" | "lune" | "melange" | "injection"
  SCENES.collision = function (p) {
    const cible = p.cible || "asteroide", R = alea("co" + (p.graine || ""));
    const frag = Array.from({ length: 34 }, () => ({ a: R() * 6.283, v: 0.4 + R() * 0.9, s: 2 + R() * 5, k: 0.1 + R() * 0.9 }));
    Object.assign(frag[0], { k: 0, v: 0.55, a: 0.35, s: 5 });   // le fragment suivi (rouge), toujours dans le cadre
    const sol = cible === "mars" || cible === "lune";
    return {
      fond: sol ? "" : espace(p.graine),
      anim(t, ta) {
        let s = "";
        const choc = 0.28, u = fen(t, choc, 1);
        if (sol) {
          const ciel = cible === "mars" ? "#d9a774" : "#0b1022", terre = cible === "mars" ? "#a5532c" : "#8d8b86";
          s += rect(0, 0, W, H, ciel) + (cible === "lune" ? espace(p.graine, 40) : "");
          // cratère : creux au centre, bourrelet sur le pourtour
          const prof = (x) => { const w = 70 * u + 0.01, dx = Math.abs(x - 240) / w;
            return 170 + 3 * Math.sin(x / 40) + (dx < 1 ? (1 - dx * dx) * 34 * u - 9 * u : dx < 1.5 ? -9 * u * (1.5 - dx) * 2 : 0); };
          const pts = []; for (let x = 0; x <= W; x += 6) pts.push([x, prof(x)]);
          s += poly([...pts, [W, H], [0, H]], terre);
          if (cible === "mars") s += txt(8, 200, "surface de Mars", { petit: true, clair: true }) ; else s += blanc(8, 200, "surface de la Lune", { petit: true });
          // l'astéroïde arrive
          if (t < choc) { const k = fen(t, 0, choc); s += circ(lerp(60, 238, k), lerp(-10, 160, k), 6, "#6c6457"); }
          if (t >= choc && t < choc + 0.12) s += circ(240, 165, 30 * fen(t, choc, choc + 0.06) * (1 - fen(t, choc + 0.06, choc + 0.12)) + 1, "#fff2b0", { opacity: 0.9 });
          for (const f of frag) {
            if (t < choc) break;
            const a = -Math.PI / 2 + (f.a - 3.14) * 0.35, d = u * 220 * f.v;
            const x = 240 + Math.cos(a) * d, y = 160 + Math.sin(a) * d + 30 * u * u * (cible === "lune" ? 0.2 : 0.4) * (1 - f.v);
            s += circ(x, y, f.s * 0.5, f.k < 0.05 ? "#e53b2c" : terre, { opacity: r1(1 - fen(u, 0.8, 1) * (f.k < 0.05 ? 0 : 1)), ...(f.k < 0.05 ? { stroke: "#fff", "stroke-width": 0.8 } : {}) });
          }
          if (t > 0.45) s += bulle(300, 30, p.lignes || (cible === "mars" ? ["Lancés à plus de 5 km/s, quelques", "fragments échappent à la gravité de Mars."] : ["Il suffit de 2,4 km/s pour quitter", "la Lune : des éclats partent dans l'espace."]), { op: fen(t, 0.45, 0.6) });
        } else {
          const CX = 230, CY = 130, RR = cible === "vesta" ? 80 : 60;
          // impacteur
          if (t < choc) { const k = fen(t, 0, choc); s += circ(lerp(20, CX - RR * 0.7, k), lerp(20, CY - RR * 0.7, k), cible === "vesta" ? 12 : 9, "#6c6457", { stroke: "#1b1f2c" }); }
          const eclat = cible === "vesta" || p.reste ? 0.25 : 1;
          if (cible === "vesta") {
            s += circ(CX, CY, RR, "#3a332d") + circ(CX, CY, RR - 7, "#6e7b3c") + circ(CX, CY, RR * 0.4, "#a7abb0");
            if (t > choc) s += ell(CX - RR * 0.7, CY - RR * 0.7, 28 * u, 18 * u, "#141a2b");
          } else if (cible === "melange" || cible === "injection") {
            s += circ(CX + 40, CY + 10, RR, "#3a332d") + circ(CX + 40, CY + 10, RR - 7, "#6e7b3c") + circ(CX + 40, CY + 10, RR * 0.4, "#a7abb0");
            // le métal fondu de l'impacteur s'étale dans la cible
            if (t > choc) for (let i = 0; i < 26; i++) { const a = -2.4 + (i / 26) * 1.6, d = lerp(0, cible === "injection" ? RR * 0.7 : RR * 0.25, u) * (0.6 + (i % 3) * 0.2); s += circ(CX + 40 - RR * 0.7 + Math.cos(a + 3.14 + 1.6) * d * 0.6 + d * 0.5, CY + 10 - RR * 0.55 + Math.sin(a + 3.14 + 1.6) * d * 0.4 + d * 0.4, 3, "#c3c6c9"); }
          } else if (t < choc + 0.05 || eclat < 1) {
            const couches = cible === "noyau" ? [["#3a332d", RR], ["#6e7b3c", RR - 6], ["#a7abb0", RR * 0.45]] : [[p.couleur || "#7d7564", RR]];
            couches.forEach(([c, r]) => { s += poly(bosselé(CX, CY, r * (1 - 0.15 * u * (eclat < 1 ? 0 : 1)), p.graine + c, 30, 0.05), c, { stroke: "#0d111c", "stroke-width": 0.8 }); });
          }
          if (t >= choc && t < choc + 0.12) s += circ(CX - RR * 0.7, CY - RR * 0.7, 26 * fen(t, choc, choc + 0.05) * (1 - fen(t, choc + 0.06, choc + 0.12)) + 1, "#fff2b0", { opacity: 0.9 });
          if (t > choc && cible !== "melange" && cible !== "injection") for (const f of frag) {
            const d = u * 170 * f.v * (eclat < 1 ? 1 : 0.85), x0 = eclat < 1 ? CX - RR * 0.7 : CX, y0 = eclat < 1 ? CY - RR * 0.7 : CY;
            const a = eclat < 1 ? -2.36 + (f.a - 3.14) * 0.35 : f.a;
            const c = f.k < 0.06 ? "#e53b2c" : cible === "noyau" ? (f.k < 0.5 ? "#a7abb0" : f.k < 0.8 ? "#6e7b3c" : "#3a332d") : cible === "vesta" ? (f.k < 0.6 ? "#3a332d" : "#6e7b3c") : (p.couleur || "#7d7564");
            s += poly(bosselé(x0 + Math.cos(a) * d, y0 + Math.sin(a) * d, f.s * (eclat < 1 ? 0.6 : 1.4), "f" + f.a, 7, 0.3), c, f.k < 0.06 ? { stroke: "#fff", "stroke-width": 0.9 } : {});
          }
          if (cible === "melange" || cible === "injection") {
            const Lp = loupe(410, 70, 46, { vers: [CX - 10, CY - 20], fond: "#3a332d" });
            let d = "";
            const Rl = alea("ml" + (p.graine || ""));
            for (let i = 0; i < 14; i++) { const x = 380 + Rl() * 60, y = 40 + Rl() * 60, r = 4 + Rl() * 7; d += poly(bosselé(x, y, r, "m" + i, 7, cible === "injection" ? 0.12 : 0.35), cible === "injection" ? "#c9b84c" : i % 2 ? "#7d7a6c" : "#c8c3b4", { stroke: "#27302d", "stroke-width": 0.5 }); }
            const met = fen(t, choc + 0.1, 0.8);
            for (let i = 0; i < 18; i++) { const x = 372 + Rl() * 76, y = 32 + Rl() * 76; d += circ(x, y, (3 + Rl() * 6) * met, "#c3c6c9", { stroke: "#5d6166", "stroke-width": 0.5 }); }
            s += Lp.fond + Lp.dans(d) + Lp.bord + `<text x="410" y="${70 + 60}" text-anchor="middle" class="fa-leg" style="fill:#eef2f7">${cible === "injection" ? "le métal entoure l'olivine" : "croûte et métal mêlés"}</text>`;
          }
        }
        s += (cible === "mars" ? txt : blanc)(8, 15, p.titre || "Une collision brise l'astéroïde");
        if (p.lignes2) p.lignes2.forEach((l, i) => { s += blanc(8, 27 + i * 10, l, { petit: true }); });
        s += compteur(390, 228, p.age || "");
        if (!sol && t > choc + 0.2 && cible !== "melange" && cible !== "injection") s += blanc(8, 200, "en rouge : le fragment destiné à atterrir sur Terre", { petit: true, op: fen(t, choc + 0.2, choc + 0.35) });
        return s;
      },
    };
  };

  // ─────────────────────────────── 8 · le voyage : de la ceinture d'astéroïdes (ou de Mars) jusqu'à la Terre ───────────────────────────────
  SCENES.voyageEspace = function (p) {
    const SX = 150, SY = 122, RT = 46, RM = 70, RG = 114, RJ = 230, depart = p.depart || "ceinture", R = alea("vo" + (p.graine || ""));
    const ceinture = Array.from({ length: 160 }, () => ({ r: 92 + R() * 58, a: R() * 6.283 }));
    const r0 = depart === "mars" ? RM : depart === "lune" ? RT : 128;
    return {
      fond: espace(p.graine, 50),
      anim(t, ta) {
        let s = "";
        s += circ(SX, SY, RT, "none", { stroke: "#5fa8e8", "stroke-width": 0.9, opacity: 0.8 }) + circ(SX, SY, RM, "none", { stroke: "#d07a4a", "stroke-width": 0.9, opacity: 0.8 });
        s += `<circle cx="${SX}" cy="${SY}" r="${RJ}" fill="none" stroke="#c9a87a" stroke-width=".9" opacity=".7"/>`;
        for (const q of ceinture) { if (Math.abs(q.r - RG) < 3) continue; const a = q.a + ta * 0.05; s += circ(SX + Math.cos(a) * q.r, SY + Math.sin(a) * q.r, 0.8, "#9a9590"); }
        s += circ(SX, SY, RG, "none", { stroke: "#ff6b5a", "stroke-width": 0.8, "stroke-dasharray": "3 3", opacity: r1(depart === "ceinture" || depart === "vesta" ? 0.8 : 0) });
        s += soleil(SX, SY, 7, ta);
        const at = ta * 0.5, terre = [SX + Math.cos(at) * RT, SY + Math.sin(at) * RT];
        s += circ(terre[0], terre[1], 3, "#5fa8e8") + circ(SX + Math.cos(at * 0.53 + 2) * RM, SY + Math.sin(at * 0.53 + 2) * RM, 2.4, "#d07a4a");
        s += circ(SX + Math.cos(at * 0.084 + 0.5) * RJ, SY + Math.sin(at * 0.084 + 0.5) * RJ, 5, "#c9a87a");
        // orbite du fragment : dérive vers la lacune (a = RG) puis s'allonge jusqu'à croiser l'orbite de la Terre
        const derive = depart === "ceinture" || depart === "vesta" ? fen(t, 0, 0.35) : 1;
        const a = lerp(r0, depart === "mars" ? (RT + RM) / 2 + 4 : depart === "lune" ? RT : RG, derive);
        const e = depart === "lune" ? 0.05 : lerp(depart === "mars" ? 0.2 : 0.03, depart === "mars" ? (RM - RT) / (RM + RT) + 0.12 : 1 - (RT - 4) / RG, fen(t, 0.35, 0.85));
        const b = a * Math.sqrt(1 - e * e), c = a * e, ang = 0.6;
        const pts = []; for (let i = 0; i <= 60; i++) { const th = i / 60 * 6.283; const x = c + a * Math.cos(th), y = b * Math.sin(th); pts.push([SX + x * Math.cos(ang) - y * Math.sin(ang), SY + x * Math.sin(ang) + y * Math.cos(ang)]); }
        s += pline(pts, "#ff6b5a", 1.1, { opacity: 0.85 });
        const th = ta * 0.9, xf = c + a * Math.cos(th), yf = b * Math.sin(th);
        s += circ(SX + xf * Math.cos(ang) - yf * Math.sin(ang), SY + xf * Math.sin(ang) + yf * Math.cos(ang), 2.6, "#e53b2c", { stroke: "#fff", "stroke-width": 0.8 });
        s += blanc(SX + RT * 0.72, SY - RT * 0.72 - 4, "Terre", { petit: true, a: "middle" }) + blanc(SX - RM * 0.8, SY - RM * 0.75, "Mars", { petit: true, a: "middle" });
        s += blanc(SX + RJ * 0.55, SY + RJ * 0.45 - 70, "Jupiter", { petit: true });
        if (depart === "ceinture" || depart === "vesta") s += blanc(SX + RG * 0.72 + 4, SY + RG * 0.69 + 4, "lacune de Kirkwood (résonance 3:1)", { petit: true });
        s += blanc(8, 15, p.titre || "Le fragment dérive ; son orbite s'étire ensuite jusqu'à couper celle de la Terre");
        s += bulle(286, 34, p.lignes || ["Réchauffé par le rayonnement solaire, le fragment subit une poussée", "très lentement (effet Yarkovsky) jusqu'à une", "région où Jupiter l'attire à chaque révolution :", "son orbite s'étire vers l'intérieur."], { op: fen(t, 0.1, 0.25) });
        s += compteur(370, 228, p.age || "entre quelques millions et quelques dizaines de millions d'années");
        return s;
      },
    };
  };

  // ─────────────────────────────── 9 · la chute ───────────────────────────────
  // p.lieu, p.date, p.pierres (nombre de pierres dessinées), p.paysage : "village" | "champ" | "glace" | "desert", p.lignes
  SCENES.chute = function (p) {
    const R = alea("cu" + (p.graine || "")), SOL = 196, glace = p.paysage === "glace";
    const pierres = Array.from({ length: p.pierres || 1 }, (_, i) => ({ x: 250 + (R() - 0.5) * (p.pierres > 1 ? 180 : 0), d: R() * 0.12 }));
    const maisons = Array.from({ length: p.paysage === "village" ? 7 : 0 }, (_, i) => ({ x: 40 + i * 24 + R() * 8, h: 10 + R() * 6 }));
    const arbres = Array.from({ length: glace ? 0 : 16 }, () => ({ x: R() * W, h: 7 + R() * 6 }));
    return {
      fond: (() => {
        const k = nid("ci");
        let s = `<defs><linearGradient id="${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${glace ? "#9fc0dc" : "#7fb0d8"}"/><stop offset="1" stop-color="${glace ? "#e4eef6" : "#dbe9f1"}"/></linearGradient></defs>` + rect(0, 0, W, H, `url(#${k})`);
        s += rect(0, SOL, W, H - SOL, glace ? "#eef4f8" : p.paysage === "desert" ? "#d9b98a" : "#8fb26a");
        if (!glace) for (let x = 0; x < W; x += 30) s += rect(x, SOL, 28, H - SOL, x % 60 ? "#9cbb72" : "#88a95f");
        for (const a of arbres) s += rect(a.x - 0.8, SOL - a.h * 0.4, 1.6, a.h * 0.4, "#6b4f35") + ell(a.x, SOL - a.h * 0.7, a.h * 0.35, a.h * 0.42, "#4f7d3c");
        for (const m of maisons) s += rect(m.x, SOL - m.h, 16, m.h, "#e9e2d2", { stroke: "#7d6a55", "stroke-width": 0.6 }) + poly([[m.x - 2, SOL - m.h], [m.x + 8, SOL - m.h - 8], [m.x + 18, SOL - m.h]], "#8a5a3c");
        if (p.paysage === "village") s += rect(60, SOL - 34, 9, 34, "#e9e2d2", { stroke: "#7d6a55", "stroke-width": 0.6 }) + poly([[58, SOL - 34], [64.5, SOL - 50], [71, SOL - 34]], "#5b4a3a");
        // échelle d'altitude (schématique)
        s += line(16, 50, 16, SOL, "#27302d", 0.8) + [[100, 50], [50, 92], [20, 134], [0, SOL]].map(([km, y]) => line(13, y, 19, y, "#27302d", 0.8) + txt(22, y + 3, `${km} km`, { petit: true })).join("");
        return s;
      })(),
      anim(t, ta) {
        let s = "";
        // phase lumineuse : de 100 à ≈ 20 km
        const u = fen(t, 0.02, 0.38), x0 = 470, y0 = 50, x1 = 285, y1 = 134;
        const xb = lerp(x0, x1, u), yb = lerp(y0, y1, u);
        if (t < 0.46) {
          s += line(x0, y0, xb, yb, "#fff1a8", 3.5, { opacity: 0.55 }) + line(lerp(x0, xb, 0.6), lerp(y0, yb, 0.6), xb, yb, "#ffffff", 2, { opacity: 0.9 });
          s += circ(xb, yb, 7 + Math.sin(ta * 20) * 1.2, "#fff4c2") + circ(xb, yb, 13, "#ffb347", { opacity: 0.45 });
        }
        if (t > 0.36 && t < 0.5) s += circ(x1, y1, 20 * fen(t, 0.36, 0.41) * (1 - fen(t, 0.43, 0.5)) + 1, "#fff2b0", { opacity: 0.85 }) + txt(x1 + 22, y1 - 10, "détonations", { petit: true });
        // vol obscur : les pierres tombent presque à la verticale
        for (const q of pierres) {
          const v = fen(t, 0.44 + q.d, 0.8 + q.d * 0.5);
          if (v <= 0) continue;
          const x = lerp(x1, q.x, v), y = lerp(y1, SOL - 2, v * v);
          s += circ(x, y, 2.2, "#26231f");
          if (v >= 1) s += ell(q.x, SOL + 1, 4, 1.4, "#5a4632");
        }
        s += txt(8, 14, p.titre || "La chute");
        (p.lignes || []).forEach((l, i) => { s += txt(8, 26 + i * 10, l, { petit: true }); });
        if (t > 0.5) s += bulle(300, 150 - 40, ["Freinée vers 20 km d'altitude, elle s'éteint", "et finit sa chute en quelques minutes :", "seule sa surface a fondu (croûte noire", "de moins d'un millimètre)."], { op: fen(t, 0.5, 0.62) });
        if (glace && t > 0.82) s += bulle(28, 150, ["Prise dans la glace, charriée par le glacier,", "elle réapparaît là où le vent érode la glace bleue."], { op: fen(t, 0.82, 0.92) });
        s += compteur(390, 228, p.date || "");
        return s;
      },
    };
  };

  // ─────────────────────────────── 10 · Mars : un cumulat d'olivine dans une chambre magmatique ───────────────────────────────
  SCENES.marsChambre = function (p) {
    const R = alea("mc" + (p.graine || "")), SURF = 70;
    const cr = Array.from({ length: 70 }, () => ({ x: 150 + R() * 190, y0: 112 + R() * 50, t0: R() * 0.7, s: 2 + R() * 2.2 }));
    return {
      fond: rect(0, 0, W, SURF, "#d9a774") + poly([[0, SURF], [300, SURF], [380, 26], [440, SURF], [W, SURF], [W, H], [0, H]], "#9b4b2a") + txt(390, 20, "volcan martien", { petit: true }),
      anim(t, ta) {
        let s = "";
        const k = nid("ch"), T = lerp(1350, 1050, fen(t, 0.05, 0.95));
        s += ell(245, 150, 110, 46, melange("#ff8a3d", "#d46b35", fen(t, 0.3, 1)), { stroke: "#5a2a18", "stroke-width": 1 });
        s += line(390, SURF, 330, 120, "#ff8a3d", 5, { opacity: 0.8 });
        const fond = 150 + 46 * 0.75;
        let pile = 0;
        for (const c of cr) {
          const u = fen(t, c.t0, c.t0 + 0.25);
          if (u <= 0) continue;
          const y = lerp(c.y0, fond - (c.x % 12) * 0.5 - 2, u);
          s += poly(Array.from({ length: 6 }, (_, i) => [c.x + Math.cos(i * 1.047) * c.s, y + Math.sin(i * 1.047) * c.s * 0.75]), "#7fa04a", { stroke: "#2f3d1a", "stroke-width": 0.4 });
          if (u >= 1) pile++;
        }
        s += circ(200, fond - 3, 3.6, "#e53b2c", { stroke: "#fff", "stroke-width": 1.2, opacity: r1(fen(t, 0.6, 0.8)) });
        s += thermometre(426, 80, 120, T, 900, 1500, [900, 1100, 1300, 1500]);
        s += txt(8, 14, p.titre || "Sous un volcan martien, l'olivine se dépose au fond de la chambre magmatique");
        s += bulle(8, 84, ["Plus denses que le liquide, les olivines", "s'accumulent en un tapis : un cumulat", "(une dunite). Le liquide resté entre elles", "donne pyroxènes et feldspath."], { op: fen(t, 0.35, 0.5) });
        s += compteur(140, 228, p.age || ilYa(1340));
        return s;
      },
    };
  };

  // ─────────────────────────────── 11 · Lune : océan de magma puis régolithe ───────────────────────────────
  SCENES.luneOcean = function (p) {
    const R = alea("lo" + (p.graine || ""));
    const cr = Array.from({ length: 90 }, () => ({ x: 20 + R() * 400, y: 80 + R() * 110, flotte: R() < 0.45, t0: R() * 0.6 }));
    return {
      fond: espace(p.graine, 40),
      anim(t, ta) {
        let s = rect(0, 70, W, H - 70, melange("#ff7a35", "#c4602e", fen(t, 0.3, 1)));
        const ep = 16 * fen(t, 0.35, 0.95);
        for (const c of cr) {
          const u = fen(t, c.t0, c.t0 + 0.35);
          const y = c.flotte ? lerp(c.y, 72 + (c.x % 9), u) : lerp(c.y, H - 6 - (c.x % 14), u);
          s += c.flotte ? rect(c.x, y, 9, 3, "#f6f3ec", { stroke: "#9a9488", "stroke-width": 0.4 }) : poly(Array.from({ length: 6 }, (_, i) => [c.x + Math.cos(i * 1.047) * 3, y + Math.sin(i * 1.047) * 2.4]), "#5a6a38");
        }
        s += rect(0, 70, W, ep, "#e9e5da", { opacity: 0.9 });
        s += txt(8, 14, p.titre || "La jeune Lune est recouverte par un océan de magma", { clair: true });
        s += bulle(250, 100, ["Le plagioclase, plus léger que le magma,", "flotte et forme une croûte blanche", "d'anorthosite ; olivine et pyroxène", "coulent au fond."], { op: fen(t, 0.3, 0.45) });
        s += compteur(390, 228, p.age || "≈ 4,46 à 4,36 milliards d'années");
        return s;
      },
    };
  };
  SCENES.luneRegolithe = function (p) {
    const R = alea("lr" + (p.graine || ""));
    const imp = Array.from({ length: 14 }, (_, i) => ({ x: 30 + R() * 420, t0: i / 14 * 0.8, r: 6 + R() * 16 }));
    return {
      fond: espace(p.graine, 40),
      anim(t, ta) {
        const prof = (x) => 120 + imp.reduce((d, c) => d + (t > c.t0 && Math.abs(x - c.x) < c.r ? (1 - ((x - c.x) / c.r) ** 2) * c.r * 0.35 : 0), 0);
        const pts = []; for (let x = 0; x <= W; x += 4) pts.push([x, prof(x)]);
        // régolithe (gris) creusé de cratères, qui s'épaissit peu à peu sur la croûte d'anorthosite (blanc)
        let s = poly([...pts, [W, H], [0, H]], "#8c887f") + rect(0, 134 + 14 * fen(t, 0, 1), W, H, "#e3dfd4");
        for (const c of imp) if (t > c.t0 && t < c.t0 + 0.06) s += circ(c.x, prof(c.x), 10, "#fff2b0", { opacity: 0.85 });
        s += txt(8, 14, p.titre || "Durant des milliards d'années, les impacts brisent puis resoudent le sol lunaire", { clair: true });
        s += bulle(8, 170, ["Couche de régolithe (gris) posée sur la croûte d'anorthosite (blanc) :", "chaque choc pulvérise la roche et fait fondre un peu de verre", "et tasse des fragments en brèche."], { op: fen(t, 0.2, 0.35) });
        s += compteur(390, 228, p.age || "de 4 à 1 milliard d'années");
        return s;
      },
    };
  };

  // ─────────────────────────────── diagramme « meteorite » : température au fil du temps ───────────────────────────────
  // c : { chemin [{ age (Ma après les premiers solides), T (°C), n, t, lab, bande }], zones : ["types", "eau", "fusion", "fefs",
  //       "widman", "chondres"] }
  fc.DIAG.meteorite = function (c, roche) {
    const G = fc.graphique({ x: { min: 0.05, max: 6000, type: "log" }, y: { min: -160, max: 2000, pad0: 6 } });
    fc.axes(G, { x: { ticks: [0.1, 1, 10, 100, 1000, 4567], titre: "Temps écoulé depuis les premiers solides du Système solaire (millions d'années, échelle logarithmique)",
      fmt: (v) => v === 4567 ? "4 567" : fc.nb(v) },
      y: { ticks: [0, 500, 1000, 1500, 2000], titre: "Température (°C)" },
      x2: { ticks: [["aujourd'hui", 4567]], titre: "" } });
    const zones = c.zones || [];
    const rectZ = (x0, x1, y0, y1, cls) => { const [a, b] = G.P(x0, y1), [cx, d] = G.P(x1, y0); G.domaines.push(`<rect x="${r1(a)}" y="${r1(b)}" width="${r1(cx - a)}" height="${r1(d - b)}" class="${cls}"/>`); return [a, b, cx, d]; };
    const labs = [];
    const zoneLab = (t, box, pref = 0.5) => labs.push({ t, box, pref });
    if (zones.includes("fusion")) zoneLab("les silicates entrent en fusion (au-delà de ≈ 1 100 à 1 200 °C)", rectZ(0.05, 6000, 1150, 2000, "fc2-fondu"), 0.7);
    if (zones.includes("chondres")) zoneLab("chondres", rectZ(1, 3.5, 1450, 1950, "fc2-s3"), 0.5);
    // recuit des chondrites (types pétrologiques) : bandes sur toute la largeur, étiquettes à droite (le chemin y passe peu)
    if (zones.includes("types")) [[400, 600, "fc2-s0", "type 3"], [600, 700, "fc2-s1", "type 4"], [700, 750, "fc2-s2", "type 5"], [750, 950, "fc2-s3", "type 6"]]
      .forEach(([a, b, cls, n]) => zoneLab(n === "type 6" ? "recuit des chondrites : type 6" : n, rectZ(0.05, 6000, a, b, cls), 0.62));
    if (zones.includes("eau")) zoneLab("eau liquide (types 1 et 2)", rectZ(0.05, 6000, 0, 150, "fc2-eau"), 0.15);
    if (zones.includes("widman")) zoneLab("figures de Widmanstätten (700 → 450 °C)", rectZ(0.05, 6000, 450, 700, "fc2-s1"), 0.15);
    if (zones.includes("fefs")) { fc.courbe(G, [[0.05, 988], [6000, 988]], "fc2-courbe fc2-c-reaction"); labs.push({ t: "le fer et son sulfure fondent (988 °C)", ligne: 988 }); }
    fc.courbe(G, [[0.05, 0], [6000, 0]], "fc2-courbe fc2-c-limite", false);
    const ch = c.chemin.map((q) => Object.assign({}, q, { x: q.age, y: q.T }));
    fc.chemin(G, ch);
    fc.etiquettesChemin(G, ch);
    for (const l of labs) {
      if (l.ligne != null) {
        const y = G.sy(l.ligne), cands = [];
        for (const x of [0.75, 0.6, 0.45, 0.3, 0.15, 0.9]) for (const dy of [-4, 12]) cands.push({ x: lerp(G.X0, G.X1, x), y: y + dy, a: "middle" });
        fc.etiquette(G, { t: l.t, c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands });
        continue;
      }
      const [a, b, cx, d] = l.box, cands = [];
      const x0 = Math.max(a, G.X0) + 4, x1 = Math.min(cx, G.X1) - 4;
      let y0 = Math.max(b, G.Y0) + 10, y1 = Math.min(d, G.Y1) - 2;
      if (y1 < y0) y0 = y1 = (Math.max(b, G.Y0) + Math.min(d, G.Y1)) / 2 + 3.3;   // bande plus mince que le texte : centré dessus
      for (let y = y0; y <= y1 + 0.1; y += 5) for (let x = x0; x <= x1; x += 8) cands.push({ x, y, a: "start", dd: Math.abs(x - lerp(x0, x1, l.pref)) + Math.abs(y - (y0 + y1) / 2) });
      cands.sort((p1, p2) => p1.dd - p2.dd);
      fc.etiquette(G, { t: l.t, c: "fc2-lab-champ", gras: true, taille: 9.4, oblig: true, cands: cands.map((q) => ({ x: q.x, y: q.y, a: "start" })) });
    }
    return fc.rendre(G, `Histoire thermique : ${roche.nom}`) + fc.legende(ch, roche);
  };
  fc.SRC_DIAG.meteorite = (c) => ["metTemps", (c.zones || []).includes("types") ? "huss2006" : null, "connelly2012"];

  // ─────────────────────────────── sources ───────────────────────────────
  Object.assign(SOURCES, {
    metTemps: "Diagramme température–temps schématique : âges et températures arrondis, chemin indicatif entre les points datés. Temps compté depuis les inclusions réfractaires (4 567,3 millions d'années, Connelly et al. 2012) ; l'espace interplanétaire est représenté vers −60 à −100 °C.",
    connelly2012: "Âges des inclusions réfractaires (4 567,3 Ma) et des chondres (4 567,3 à 4 564,7 Ma) : Connelly J. N. et al. (2012), <i>Science</i> 338, 651.",
    huss2006: "Types pétrologiques et températures du métamorphisme des chondrites (type 3 < 600 °C ; type 4 ≈ 600–700 ; type 5 ≈ 700–750 ; type 6 ≈ 750–950 °C ; altération par l'eau des types 1 et 2 vers 20–150 °C) : Van Schmus W. R. et Wood J. A. (1967), <i>Geochimica et Cosmochimica Acta</i> 31, 747 ; Huss G. R. et al. (2006), dans <i>Meteorites and the Early Solar System II</i>, University of Arizona Press, p. 567.",
    gopel1994: "Âges de refroidissement des chondrites H (Sainte-Marguerite H4 vers 4 563 Ma, Kernouvé H6 vers 4 522 Ma, modèle « en pelure d'oignon ») : Göpel C., Manhès G. et Allègre C. J. (1994), <i>Earth and Planetary Science Letters</i> 121, 153 ; Trieloff M. et al. (2003), <i>Nature</i> 422, 502.",
    laigle: "Le 26 avril 1803, la chute de L'Aigle (Orne) livre plusieurs milliers de pierres, dont 37 kg ont été conservés (chondrite L6) ; Jean-Baptiste Biot mène l'enquête pour l'Académie des sciences. Références : catalogue de la Meteoritical Society ; Wikipédia, « Météorite de L'Aigle ».",
    l466: "Éclatement de l'astéroïde parent des chondrites L il y a ≈ 466 millions d'années (météorites fossiles de l'Ordovicien de Suède, âges de choc des chondrites L) : Schmitz B. et al. (2001), <i>Earth and Planetary Science Letters</i> 194, 1 ; Heck P. R. et al. (2004), <i>Nature</i> 430, 323.",
    yarkovsky: "Transport des fragments vers la Terre (effet Yarkovsky, résonance 3:1 avec Jupiter, lacunes de Kirkwood) : Wikipédia, « Météorite HED » et « Effet Yarkovsky » ; âges d'exposition aux rayons cosmiques : Eugster O. et al. (2006), dans <i>Meteorites and the Early Solar System II</i>, p. 829.",
    orgueil: "Chute d'Orgueil (Tarn-et-Garonne) le 14 mai 1864 : une vingtaine de pierres, 14 kg, chondrite CI1 ; altération par l'eau sur l'astéroïde : Wikipédia, « Météorite d'Orgueil », « Chondrite carbonée » ; Fujiya W. et al. (2012), <i>Nature Communications</i> 3, 627 (âge des carbonates).",
    piani2020: "Hydrogène des chondrites à enstatite : Piani L. et al. (2020), <i>Science</i> 369, 1110.",
    acapulco: "Acapulcoïtes et lodranites : l'astéroïde parent se forme 1,5 à 2 millions d'années après les premiers solides et se refroidit sous ≈ 1 000 °C entre 4 563,1 et 4 562,6 Ma. Sources : Wikipédia (en anglais), « Lodranite », « Acapulcoite ».",
    vesta: "Vesta et les météorites HED : la fusion, puis la formation d'une croûte basaltique, interviennent dès les premiers millions d'années ; le cratère Rheasilvia se creuse vers 1 milliard d'années, et les âges d'exposition s'étalent de 6 à 73 millions d'années. Sources : Wikipédia, « (4) Vesta », « Météorite HED ».",
    chassigny: "Chassigny (Haute-Marne) est tombée le 3 octobre 1815. Ce cumulat d'olivine, formé vers 1 340 Ma, a été éjecté de Mars vers 11 Ma, à l'instar des nakhlites. Références : Wikipédia, « Météorite de Chassigny », « Météorite martienne ».",
    lune: "Météorites lunaires : ALH 81005, découverte le 18 janvier 1982 dans le cadre du programme ANSMET, éjectée depuis moins de 20 millions d'années, issue de la croûte d'anorthosite de l'océan de magma. Source : Wikipédia, « Météorite lunaire ».",
    kruijer2014: "Les corps parents des fers se sont constitués au cours du premier million d'années ; leurs noyaux se sont séparés 1 à 1,5 million d'années après les premiers solides (Kruijer T. S. et al., 2014, <i>Science</i> 344, 1150). Les figures de Widmanstätten prennent forme entre 700 et 450 °C, à des vitesses de refroidissement de 100 à 10 000 °C par million d'années (Wikipédia, « Figures de Widmanstätten »). Quant aux âges d'exposition des fers IIIAB groupés, ils avoisinent 650 millions d'années (Voshage H., 1967, <i>Zeitschrift für Naturforschung</i> 22a, 477).",
    pallasite: "Pallasites : olivine du manteau et métal d'un noyau mêlés par une collision (Tarduno J. A. et al. 2012, <i>Science</i> 338, 939), refroidies de 2,5 à 18 °C par million d'années (Yang J. et al. 2010, <i>Geochimica et Cosmochimica Acta</i> 74, 4471).",
    meso: "Mésosidérites : mélange par collision vers 4 525 Ma (Haba M. K. et al. 2019, <i>Nature Geoscience</i> 12, 510), refroidissement de moins d'un degré par million d'années ; chute de Barea (Espagne) en 1842 : Wikipédia (anglais), « Mesosiderite ».",
  });


  // ─────────────────────────────── minéraux des météorites : forme et modes de formation (MIN_F, cartes de la fiche minéral) ───────────────────────────────
  if (typeof MIN_F !== "undefined") {
    const SD = "Aucun diagramme n'est tracé : la formation dépend de l'histoire de l'astéroïde (chaleur, absence d'oxygène) et non d'un couple de conditions mesurables.";
    const sc = (nom, texte) => ({ nom, texte, cond: false, sansDiagramme: SD });
    Object.assign(MIN_F, {
      taenite: { sansForme: "Sans faces cristallines propres, la taénite forme de minces bandes entre les lamelles de kamacite et constitue le fond des plessites.",
        forme: "Le fer et le nickel s'empilent en cubique à faces centrées, comme l'or : chaque atome compte 12 voisins. La taénite, riche en nickel, se démêle lentement : elle ne rejette la kamacite qu'en dessous de 700 °C, et cela sur des millions d'années.",
        intro: "Elle se forme dans le métal des astéroïdes fondus comme dans les grains métalliques des chondrites.",
        scenarios: [sc("Au sein du noyau d'un astéroïde en cours de refroidissement", "Au-delà de 700 °C environ, la totalité du métal est constituée de taénite. Lorsque le refroidissement atteint quelques dizaines de degrés par million d'années, celle-ci expulse des lamelles de kamacite pauvre en nickel, tandis qu'elle-même s'enrichit en nickel et subsiste sous forme de minces bandes brillantes : ce sont les figures de Widmanstätten."),
          sc("Tétrataénite, sous 320 °C", "Lorsque le refroidissement se poursuit très lentement sous 320 °C, les atomes de fer et de nickel s'alignent en plans alternés. Cette tétrataénite n'est connue que dans les météorites (Saint-Séverin, Charente).")] },
      cohenite: { sansForme: "Cristaux de quelques millimètres pris dans le métal, aux faces mal décrites : aucun dessin n'est proposé.",
        forme: "Chaque atome de carbone se loge au centre d'un prisme de six fers, les prismes se partageant leurs arêtes. Il s'agit de la structure de la cémentite des aciers.",
        intro: "Elle se forme lorsque du fer-nickel riche en carbone refroidit en l'absence d'oxygène.",
        scenarios: [sc("Rencontrée dans les météorites de fer à forte teneur en carbone", "Au refroidissement, le carbone dissous dans le métal précipite, sous forme de graphite ou de cohénite, dans les fers du groupe IAB et les uréilites, souvent au contact de nodules de troïlite."),
          sc("Dans le fer natif terrestre", "À Disko (Groenland), le fer réduit par le charbon renferme de la cohénite, à la manière d'une fonte naturelle.")] },
      schreibersite: { sansForme: "Elle forme des plaques et de fines aiguilles (rhabdites) dans le métal, sans cristal à faces à dessiner.",
        forme: "Il s'agit d'un composé métallique : chaque phosphore est enveloppé de neuf atomes de fer et de nickel, lesquels se touchent également. Cette structure explique son éclat et sa dureté (6,5 à 7).",
        intro: "Elle concentre le phosphore lorsque le métal d'un astéroïde se refroidit.",
        scenarios: [sc("Dans le métal qui refroidit", "Soluble dans le fer-nickel chaud, le phosphore s'en détache au refroidissement : il forme des plaques de plusieurs centimètres autour des nodules de troïlite, puis des aiguilles microscopiques (rhabdites) au cœur de la kamacite.")] },
      moissanite: { sansForme: "Présente sous forme de grains microscopiques dans les météorites : les plaquettes hexagonales vendues en collection ou en bijouterie sont de synthèse.",
        forme: "Le silicium et le carbone s'organisent en tétraèdres, à l'image du carbone du diamant, d'où une dureté de 9,5. Les couches peuvent s'empiler de dizaines de manières, ce qui définit les polytypes.",
        intro: "Certains grains naissent hors du Système solaire, au sein d'étoiles, tandis que d'autres se forment dans des milieux extrêmement réducteurs.",
        scenarios: [sc("Autour d'étoiles géantes, antérieurement au Soleil", "Les grains de moissanite contenus dans les chondrites carbonées se sont condensés dans l'atmosphère d'étoiles géantes rouges riches en carbone, avant de migrer dans le nuage à l'origine du Soleil. Il s'agit de « grains présolaires », plus anciens que le Système solaire lui-même."),
          sc("Dans des roches très réduites", "Quelques grains ont été signalés dans des kimberlites et des roches du manteau, où ils attestent d'un milieu dépourvu d'oxygène.")] },
      troilite: { sansForme: "Se présente en nodules arrondis et en lames dans le métal (lamelles de Reichenbach), sans cristal à faces qui se prête au dessin.",
        forme: "La nickéline adopte une structure où chaque fer occupe le centre d'un octaèdre de six soufres, les octaèdres s'empilant en colonnes. Contrairement à la pyrrhotite, aucun fer ne fait défaut.",
        intro: "Il s'agit du sulfure de fer caractéristique des milieux sans oxygène, présent dans presque toutes les météorites et sur la Lune.",
        scenarios: [sc("Dans le métal fondu d'un astéroïde", "Le fer et le soufre entrent en fusion conjointe dès 988 °C ; au refroidissement, le liquide sulfuré se détache du métal et cristallise en nodules de troïlite."),
          sc("Dans les chondrites", "Au sein du disque entourant le jeune Soleil, le soufre gazeux se fixa sur les grains de fer vers 400 °C : c'est de ce processus que provient la troïlite des chondrites.")] },
      oldhamite: { sansForme: "Elle se présente en petits grains arrondis, sans cristal à faces décrit.",
        forme: "Elle adopte la structure du sel gemme : chaque calcium est entouré de six soufres, et réciproquement, ce qui explique le clivage cubique.",
        intro: "Elle ne se forme que là où l'oxygène et l'eau sont absents.",
        scenarios: [sc("Au voisinage du Soleil, dans un gaz dépourvu d'oxygène", "Dans les chondrites à enstatite et les aubrites, le calcium, faute d'oxygène disponible, s'est combiné au soufre : ces météorites se sont donc formées dans un milieu extrêmement réducteur."),
          sc("Dans les terrils de charbon qui brûlent", "À la surface de la Terre, elle se rencontre dans des roches cuites par la combustion du charbon, à l'abri de l'oxygène.")] },
      daubreelite: { sansForme: "Elle forme des lames dans la troïlite et de petits grains, sans cristal à faces décrit.",
        forme: "Elle reprend la structure du spinelle, le soufre remplaçant l'oxygène : le chrome occupe les octaèdres, le fer les tétraèdres.",
        intro: "Elle naît lorsque le chrome, en l'absence d'oxygène, se combine au soufre.",
        scenarios: [sc("Présente dans la troïlite des météorites de fer", "Au refroidissement, la troïlite expulse le chrome qu'elle contenait en solution, sous forme de fines lames de daubréelite.")] },
      merrillite: { sansForme: "Elle se présente en grains sans forme propre, logés entre les autres minéraux, et ne fait donc l'objet d'aucun dessin.",
        forme: "Des tétraèdres de phosphate isolés sont reliés entre eux par du calcium, du magnésium et du sodium : la charpente est celle de la whitlockite, mais dépourvue d'hydrogène.",
        intro: "Phosphate caractéristique des milieux secs, comme les astéroïdes, la Lune ou Mars.",
        scenarios: [sc("Dans les chondrites recuites", "Au cours du recuit des chondrites (types 4 à 6), le phosphore du métal s'oxyde puis se lie au calcium des silicates : de petits grains de merrillite prennent alors naissance."),
          sc("Présente dans les basaltes lunaires et martiens", "En fin de cristallisation, la merrillite se charge en terres rares, en uranium et en thorium issus du magma.")] },
    });
  }

  // ─────────────────────────────── étapes et conditions des 10 fiches ───────────────────────────────
  const E = (court, titre, quand, duree, scene, p, extra) => Object.assign({ court, titre, quand, scene, p: p || {} }, duree ? { duree } : {}, extra || {});
  const loupe6 = (titre, lignes) => E("Au microscope", titre, "Aujourd'hui", null, "loupeRoche", { mode: "fixe", titre: "Dans la météorite, au microscope", lignes });
  function poser(id, o) {
    ROCHES_F[id] = Object.assign({ src: [] }, o);
    fc.installer(id, o.cond);
  }

  poser("chondrite_ordinaire", {
    exemple: "Exemple suivi : la pierre de L'Aigle (Orne), chute du 26 avril 1803, classée chondrite L6.",
    anim: [
      E("Disque", "Il y a 4 567 millions d'années, un disque de gaz et de poussière entoure le jeune Soleil ; c'est là que se condensent les premiers solides", "Il y a 4 567 millions d'années", null, "disqueSolaire", { zone: "ceinture", cai: true }),
      E("Chondres", "Sous l'effet d'un échauffement de courte durée (1 500 à 1 900 °C), des amas de poussière fondent en quelques minutes ; figés en quelques heures, ils donnent les chondres.", "Environ 1 à 3 millions d'années, après les premiers solides", "quelques heures pour chaque goutte", "chondresFlash", {}),
      E("Astéroïde", "Chondres, grains métalliques et poussière s'agglomèrent : il en résulte un astéroïde d'une centaine de kilomètres", "≈ 2 millions d'années après", null, "accretionAsteroide", {}),
      E("Recuit", "Sous l'effet de l'aluminium 26, le cœur atteint 750 à 950 °C sans fondre et recristallise (type 6) ; le refroidissement dure ensuite des dizaines de millions d'années.", "De 2 à ≈ 60 millions d'années après", "des dizaines de millions d'années", "chauffageAsteroide", { mode: "metamorphisme", position: 0.15, nom: "L'Aigle, au cœur (type 6)" }),
      E("Collision", "Voici ≈ 466 millions d'années, une collision disloque l'astéroïde des chondrites L, dont les débris se répandent", "Il y a ≈ 466 millions d'années", null, "collision", { cible: "asteroide", age: ilYa(466) }),
      E("Voyage", "Un fragment migre vers une zone où Jupiter étire son orbite, jusqu'à croiser celle de la Terre", "Pendant des millions d'années", "séjournant généralement 10 à 50 millions d'années dans l'espace", "voyageEspace", { depart: "ceinture", age: "10 à 50 millions d'années (rayons cosmiques)" }),
      E("Chute", "Le 26 avril 1803, vers 13 h, une boule de feu traverse la Normandie : plusieurs milliers de pierres s'abattent sur les environs de L'Aigle", "Le 26 avril 1803", null, "chute", { paysage: "village", pierres: 14, date: "26 avril 1803", titre: "Le 26 avril 1803, à L'Aigle (Orne)", lignes: ["Une boule de feu, des détonations, puis une averse de pierres", "de plusieurs milliers de pierres : 37 kg conservés."] }),
      loupe6("À l'observation microscopique, on distingue des chondres, des grains de métal et de sulfure au sein d'une matrice recristallisée.", ["Chondres d'olivine et de pyroxène", "aux bords estompés par le recuit,", "grains de fer-nickel et de troïlite.", "Le rapport de Biot sur cette chute", "a convaincu l'Académie que des", "pierres tombent du ciel."]),
    ],
    cond: { type: "meteorite", zones: ["fusion", "chondres", "types"], src: ["gopel1994", "l466", "yarkovsky", "laigle"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 0.9, T: -80, n: 1, t: "Froides, les poussières du disque gravitent autour du Soleil." },
      { age: 1.9, T: -60 }, { age: 2, T: 1750 },
      { age: 2.1, T: 30, n: 2, t: "Une montée soudaine en température (1 500 à 1 900 °C) les liquéfie ; figées en quelques heures, elles deviennent des chondres." },
      { age: 2.5, T: -30, n: 3, t: "Chondres, métal et poussière s'agglomèrent en astéroïde." },
      { age: 8, T: 850 },
      { age: 50, T: 400, n: 4, t: "En son cœur, la roche est recuite vers 750 à 950 °C (type 6), puis elle se refroidit lentement pendant des dizaines de millions d'années." },
      { age: 3000, T: -60 },
      { age: 4101, T: 350, n: 5, t: "Vers ≈ 466 millions d'années, la collision qui disloque l'astéroïde la réchauffe brièvement." },
      { age: 4540, T: -70, n: 6, t: "Une fois dans l'espace, il demeure vers −70 °C pendant des millions d'années." },
      { age: 4567, T: 15, n: 7, t: "Le 26 avril 1803, chute à L'Aigle." },
      { n: 8, t: "Vus au microscope, les chondres sont estompés, avec du métal et de la troïlite." }] },
  });

  poser("chondrite_carbonee", {
    exemple: "Exemple suivi : la pierre d'Orgueil (Tarn-et-Garonne), chute du 14 mai 1864, classée chondrite carbonée CI.",
    anim: [
      E("Disque froid", "Au-delà de la ligne des glaces, très loin du Soleil, poussières, glace et molécules organiques se rassemblent.", "Il y a 4 567 millions d'années", null, "disqueSolaire", { zone: "externe", ici: "ici : poussière, glace et matière organique", loupe: "poussière et glace se collent" }),
      E("Astéroïde", "Ces éléments, poussière, glace et matière organique, se réunissent pour former un petit astéroïde.", "Au bout de ≈ 3 millions d'années, après les premiers solides", null, "accretionAsteroide", { glace: true, couleur: "#4a4540", titre: "Ces éléments, poussière, glace et matière organique, se réunissent pour former un petit astéroïde.", age: "Au bout de ≈ 3 millions d'années, après les premiers solides" }),
      E("Eau liquide", "Réchauffée par l'aluminium 26, la glace se liquéfie : l'eau (≈ 50 à 150 °C) transforme l'olivine et le pyroxène en argiles, en magnétite et en carbonates", "≈ 3 à 6 millions d'années après", "quelques millions d'années", "chauffageAsteroide", { mode: "eau", tmax: 120, position: 0.4, nom: "Orgueil", age: "Vers ≈ 3 à 6 millions d'années, à partir des premiers solides", titre: "La glace fond : de l'eau liquide circule dans l'astéroïde" }),
      E("Collision et voyage", "Une collision détache un fragment, qui erre pendant des millions d'années avant de croiser l'orbite terrestre", "Bien plus tard", null, "collision", { cible: "asteroide", couleur: "#3d3934", age: "il y a quelques millions d'années" }),
      E("Chute", "Le 14 mai 1864, vers 20 h, une vingtaine de pierres noires chutent aux abords d'Orgueil.", "Le 14 mai 1864", null, "chute", { paysage: "champ", pierres: 8, date: "14 mai 1864", titre: "Le 14 mai 1864, à Orgueil (Tarn-et-Garonne)", lignes: ["Une vingtaine de pierres noires et friables,", "Pesant 14 kg au total, il s'agit de la plus grosse chondrite CI connue."] }),
      loupe6("Observée au microscope, elle montre une matrice argileuse, des amas de magnétite et des carbonates, sans aucun chondre", ["Tout a été transformé par l'eau :", "argiles en feuillets, framboïdes de", "magnétite, plaquettes de sulfure,", "carbonates. Sa chimie reste celle", "du Soleil, moins les gaz."]),
    ],
    cond: { type: "meteorite", zones: ["eau"], src: ["orgueil", "huss2006"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 1, T: -140, n: 1, t: "Loin du Soleil, la poussière, la glace et la matière organique se trouvent vers −140 °C." },
      { age: 3, T: -100, n: 2, t: "Elles s'agglomèrent en un petit astéroïde." },
      { age: 4, T: 0 },
      { age: 6, T: 110, n: 3, t: "L'eau liquide (≈ 50 à 150 °C) issue de la fonte de la glace convertit les minéraux en argiles, en magnétite et en carbonates." },
      { age: 100, T: -60 },
      { age: 4550, T: -70, n: 4, t: "Une collision éjecte un fragment qui poursuit son voyage dans l'espace." },
      { age: 4567, T: 15, n: 5, t: "Le 14 mai 1864, chute à Orgueil." },
      { n: 6, t: "En lame mince : argiles, magnétite et carbonates, sans aucun chondre." }] },
  });

  poser("chondrite_enstatite", {
    exemple: "Exemple suivi : la pierre de Saint-Sauveur (Haute-Garonne), chute de 1914, classée chondrite à enstatite EH5.",
    anim: [
      E("Près du Soleil", "Au plus près du Soleil, les poussières naissent dans un gaz presque dépourvu d'oxygène : le fer demeure à l'état de métal et de sulfure", "Il y a 4 567 millions d'années", null, "disqueSolaire", { zone: "interne", ici: "ici : sans oxygène, près du Soleil" }),
      E("Chondres", "Les chondres naissent : constitués d'enstatite presque pure, ils se figent en fibres rayonnantes", "1 à 3 millions d'années après", "quelques heures pour chaque goutte", "chondresFlash", { types: ["rp", "rp", "pop", "rp", "rp"] }),
      E("Astéroïde", "Les chondres se rassemblent avec une forte proportion de métal et de sulfures.", "≈ 2 millions d'années après", null, "accretionAsteroide", { couleur: "#8a877e" }),
      E("Recuit", "L'astéroïde chauffe vers 700 à 750 °C (type 5) puis refroidit lentement", "Entre 2 et quelques dizaines de millions d'années plus tard", "des dizaines de millions d'années", "chauffageAsteroide", { mode: "metamorphisme", position: 0.4, nom: "Saint-Sauveur (type 5)" }),
      E("Collision et voyage", "Une collision libère un fragment, dont l'orbite finit par couper celle de la Terre", "Bien plus tard", null, "collision", { cible: "asteroide", couleur: "#8a877e", age: "il y a quelques millions d'années" }),
      E("Chute", "En 1914, une pierre de 14 kg chute près de Saint-Sauveur, à proximité de Toulouse", "1914", null, "chute", { paysage: "champ", pierres: 1, date: "1914", titre: "En 1914, à Saint-Sauveur (Haute-Garonne)", lignes: ["Riche en métal, une pierre de 14 kg :", "une chondrite à enstatite EH5."] }),
      loupe6("Vue au microscope, elle présente des chondres d'enstatite, une forte proportion de métal et des sulfures rares", ["Chondres fibreux d'enstatite sans", "fer, fer-nickel chargé de silicium,", "troïlite, sulfures de calcium et de", "chrome : des minéraux qui ne naissent", "qu'en l'absence d'oxygène."]),
    ],
    cond: { type: "meteorite", zones: ["fusion", "chondres", "types"], src: ["piani2020", "yarkovsky"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 0.9, T: 60, n: 1, t: "Près du Soleil, des poussières sans oxygène." },
      { age: 1.9, T: 60 }, { age: 2, T: 1700 },
      { age: 2.1, T: 40, n: 2, t: "Chondres d'enstatite fondus puis figés." },
      { age: 2.5, T: 0, n: 3, t: "Accrétion de l'astéroïde." },
      { age: 8, T: 730 },
      { age: 40, T: 400, n: 4, t: "Recuit vers 700 à 750 °C (type 5), puis refroidissement lent." },
      { age: 3000, T: -50 },
      { age: 4550, T: -60, n: 5, t: "Collision, voyage dans l'espace." },
      { age: 4567, T: 15, n: 6, t: "En 1914, chute à Saint-Sauveur." },
      { n: 7, t: "Au microscope : enstatite, métal, sulfures." }] },
  });

  poser("achondrite_primitive", {
    exemple: "Exemple suivi : la pierre d'Acapulco (Mexique), survenue le 11 août 1976 ; on ne connaît aucune achondrite primitive en France.",
    anim: [
      E("Astéroïde", "De bonne heure, un astéroïde de matière chondritique se forme, 1,5 à 2 millions d'années après les premiers solides", "≈ 1,5 à 2 millions d'années après", null, "accretionAsteroide", { age: "Au bout de ≈ 1,5 à 2 millions d'années, depuis les premiers solides" }),
      E("Début de fusion", "Précoce et riche en aluminium 26, il atteint plus de 1 000 °C : le fer et son sulfure fondent puis s'écoulent, une faible part des silicates entre en fusion, et les chondres s'effacent", "≈ 2 à 4 millions d'années après", "quelques millions d'années", "chauffageAsteroide", { mode: "fusionPartielle", tmax: 1150, position: 0.3, nom: "Acapulco", titre: "Chauffé au-delà de 1 000 °C, l'astéroïde commence à fondre", age: "Vers ≈ 2 à 4 millions d'années, à partir des premiers solides" }),
      E("Refroidissement", "La chaleur décroît avant que la fusion ne s'achève : passé sous 1 000 °C, vers 4 563 Ma, les grains se recristallisent en mosaïque", "Vers 4 563 millions d'années", null, "chauffageAsteroide", { mode: "metamorphisme", tmax: 950, position: 0.3, nom: "Acapulco", titre: "La chaleur baisse : les grains recristallisent en mosaïque", age: ilYa(4563) }),
      E("Collision et voyage", "Une collision détache un fragment, qui gagne l'orbite terrestre", "Bien plus tard", null, "collision", { cible: "asteroide", age: "il y a quelques millions d'années" }),
      E("Chute", "Près d'Acapulco, une pierre de 1,9 kg s'écrase le 11 août 1976 ; quinze minutes plus tard, lorsqu'on la ramasse, elle est déjà froide au toucher.", "Le 11 août 1976", null, "chute", { paysage: "desert", pierres: 1, date: "11 août 1976", titre: "Le 11 août 1976, près d'Acapulco (Mexique)", lignes: ["Logée dans un trou de 30 cm, une pierre de 1,9 kg,", "froide au toucher quinze minutes après."] }),
      loupe6("Observés au microscope, des grains de taille homogène, recristallisés, côtoient du métal et de la troïlite", ["Grains d'olivine, de pyroxènes et de", "plagioclase de même taille, joints", "à 120° : une roche recuite, pas", "cristallisée d'un magma. Il reste", "du métal et du sulfure."]),
    ],
    cond: { type: "meteorite", zones: ["fusion", "fefs"], src: ["acapulco", "yarkovsky"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 1.8, T: 0, n: 1, t: "L'astéroïde s'accrète environ 1,5 à 2 millions d'années après les premiers solides." },
      { age: 3, T: 1150, n: 2, t: "Au-dessus de 980 °C, le fer et son sulfure entrent en fusion ; vers 1 100 à 1 200 °C, une faible part des silicates fond." },
      { age: 4.5, T: 950, n: 3, t: "Les grains recristallisent vers 4 563 Ma, lorsque la température descend sous ≈ 1 000 °C." },
      { age: 200, T: -40 },
      { age: 4550, T: -60, n: 4, t: "Collision et voyage dans l'espace." },
      { age: 4567, T: 25, n: 5, t: "Le 11 août 1976, chute près d'Acapulco." },
      { n: 6, t: "Au microscope : mosaïque de grains, métal, troïlite." }] },
  });

  poser("achondrite_asteroidale", {
    exemple: "Exemple suivi : la pierre de Juvinas (Ardèche), chutée le 15 juin 1821, relève de l'eucrite issue de l'astéroïde Vesta.",
    anim: [
      E("Vesta naît", "Dans le premier million d'années se constitue Vesta, astéroïde appelé à mesurer 525 km", "Quelque ≈ 1 million d'années après les premiers solides", null, "accretionAsteroide", { rmax: 72, taille: "≈ 525 km (Vesta)", titre: "Vesta, futur astéroïde de 525 km, s'agglomère", age: "Quelque ≈ 1 million d'années après les premiers solides" }),
      E("Fusion", "Vesta, chargé en aluminium 26, entre en fusion : le métal gagne le cœur tandis qu'un océan de magma l'enveloppe", "1 à 3 millions d'années après", "quelques millions d'années", "differenciation", { croute: false, titre: "Vesta fond : le métal descend en noyau" }),
      E("Croûte", "Remontant à la surface, le magma se fige en coulées de basalte : c'est la croûte de Vesta, constituée d'eucrites", "Jusqu'à ≈ 15 millions d'années après", "≈ 10 millions d'années", "differenciation", { suivi: "croute", tmax: 1200, titre: "Les laves remontent et se figent : une croûte de basalte", age: "parvenant à ≈ 15 millions d'années après les premiers solides" }),
      E("Rheasilvia", "Voici ≈ 1 milliard d'années, un choc provoqué par un astéroïde de 60 km sur Vesta crée le cratère Rheasilvia (500 km de large), qui arrache des fragments de croûte.", "Il y a ≈ 1 milliard d'années", null, "collision", { cible: "vesta", reste: true, titre: "Un impact géant creuse le cratère Rheasilvia sur Vesta", age: "il y a ≈ 1 milliard d'années" }),
      E("Voyage", "Les fragments migrent jusqu'à la résonance 3:1 avec Jupiter, dont l'action étire leur orbite jusqu'à atteindre celle de la Terre.", "Pendant des millions d'années", "6 à 73 millions d'années pour les HED", "voyageEspace", { depart: "vesta", age: "6 à 73 millions d'années (rayons cosmiques)" }),
      E("Chute", "Une pierre de 91 kg tombe près de Juvinas (Ardèche), le 15 juin 1821.", "Le 15 juin 1821", null, "chute", { paysage: "village", pierres: 2, date: "15 juin 1821", titre: "Le 15 juin 1821, à Juvinas (Ardèche)", lignes: ["Enfoncée dans le sol, une pierre de 91 kg :", "un basalte de l'astéroïde Vesta."] }),
      loupe6("Vue au microscope, elle montre des baguettes de plagioclase et de pyroxène, à la manière d'un basalte terrestre", ["Baguettes de plagioclase calcique", "englobées dans la pigeonite : la", "texture d'une dolérite, mais presque", "sans eau ni sodium. La sonde Dawn", "a cartographié son astéroïde."]),
    ],
    cond: { type: "meteorite", zones: ["fusion", "fefs"], src: ["vesta", "yarkovsky"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 0.9, T: 0, n: 1, t: "Vesta s'agglomère." },
      { age: 2.5, T: 1500, n: 2, t: "Sous l'effet de la chaleur, Vesta se différencie : un noyau métallique se forme, entouré d'un océan de magma." },
      { age: 15, T: 250, n: 3, t: "Les laves se solidifient en une croûte basaltique (eucrites), qu'enfouissent et recuisent les coulées suivantes." },
      { age: 2000, T: -60 },
      { age: 3567, T: 300, n: 4, t: "Voici ≈ 1 milliard d'années, le cratère Rheasilvia est creusé et projette des fragments de croûte." },
      { age: 4540, T: -70, n: 5, t: "Voyage dans l'espace, 6 à 73 millions d'années." },
      { age: 4567, T: 20, n: 6, t: "Le 15 juin 1821, chute à Juvinas." },
      { n: 7, t: "Vue au microscope, la roche combine plagioclase et pyroxène, dans une texture de basalte." }] },
  });

  poser("achondrite_martienne", {
    exemple: "Exemple suivi : la pierre de Chassigny (Haute-Marne), survenue le 3 octobre 1815, roche martienne.",
    anim: [
      E("Chambre magmatique", "Sous un volcan martien, les cristaux d'olivine sédimentent au fond d'une chambre magmatique et s'y accumulent", "Il y a ≈ 1 340 millions d'années", "des milliers à des millions d'années", "marsChambre", {}),
      E("Impact sur Mars", "Voici ≈ 11 millions d'années, un astéroïde heurte Mars ; des morceaux de la croûte sont éjectés à plus de 5 km/s.", "Il y a ≈ 11 millions d'années", null, "collision", { cible: "mars", titre: "Il y a ≈ 11 millions d'années, un astéroïde frappe Mars", age: ilYa(11) }),
      E("Voyage", "Le fragment gravite autour du Soleil, puis croise l'orbite terrestre", "Pendant ≈ 11 millions d'années", "≈ 11 millions d'années", "voyageEspace", { depart: "mars", age: "≈ 11 millions d'années (rayons cosmiques)", lignes: ["Éjecté de Mars, le fragment tourne autour", "du Soleil, sur une orbite qui finit par croiser celle de la Terre", "croiser celle de la Terre."] }),
      E("Chute", "Le matin du 3 octobre 1815, une pierre de 4 kg s'abat sur Chassigny, en Haute-Marne", "Le 3 octobre 1815", null, "chute", { paysage: "village", pierres: 1, date: "3 octobre 1815", titre: "Le 3 octobre 1815, à Chassigny (Haute-Marne)", lignes: ["Pierre de 4 kg dont l'origine martienne ne sera établie qu'au XXᵉ siècle", "qu'elle vient de Mars."] }),
      loupe6("Vu au microscope, il s'agit d'un cumulat d'olivine, la dunite martienne", ["Cristaux d'olivine jointifs, tombés", "au fond de la chambre magmatique ;", "entre eux, pyroxènes, feldspath et", "chromite. Ses gaz rares ne sont pas", "ceux de l'atmosphère actuelle de Mars."]),
    ],
    cond: { type: "meteorite", zones: ["fusion"], src: ["chassigny"], chemin: [
      { age: 3, T: 1500, lab: "Mars se forme et fond" },
      { age: 3227, T: 1300 },
      { age: 3260, T: 700, n: 1, t: "Voici ≈ 1 340 millions d'années, des olivines se déposent au fond d'une chambre magmatique martienne." },
      { age: 4200, T: -20 },
      { age: 4556, T: 300, n: 2, t: "Voici ≈ 11 millions d'années, l'impact qui l'arrache à Mars l'échauffe brièvement." },
      { age: 4563, T: -70, n: 3, t: "Voyage dans l'espace, ≈ 11 millions d'années." },
      { age: 4567, T: 15, n: 4, t: "Le 3 octobre 1815, chute à Chassigny." },
      { n: 5, t: "Au microscope : cumulat d'olivine." }] },
  });

  poser("achondrite_lunaire", {
    exemple: "Exemple suivi : ALH 81005, récoltée aux Allan Hills (Antarctique) le 18 janvier 1982, fut la première météorite identifiée comme lunaire.",
    anim: [
      E("Océan de magma", "L'océan de magma recouvre la jeune Lune ; le plagioclase, moins dense, surnage et forme une croûte d'anorthosite", "Il y a ≈ 4,46 à 4,36 milliards d'années", "des dizaines de millions d'années", "luneOcean", {}),
      E("Régolithe", "Durant des milliards d'années, les chocs pulvérisent le sol et agglomèrent les fragments en brèches", "De 4 à 1 milliard d'années", "des milliards d'années", "luneRegolithe", {}),
      E("Éjection", "Un choc survenu sur les hauts plateaux projette des éclats dans l'espace : une vitesse de 2,4 km/s suffit", "Il y a moins de 20 millions d'années", null, "collision", { cible: "lune", titre: "Un impact lance des éclats de la Lune dans l'espace", age: "il y a moins de 20 millions d'années" }),
      E("Chute en Antarctique", "Retombé sur l'Antarctique, le fragment est enfoui dans la glace, puis transporté par le glacier jusqu'aux Allan Hills, où le vent érode la glace bleue.", "Voici quelques milliers à dizaines de milliers d'années", null, "chute", { paysage: "glace", pierres: 1, date: "trouvée le 18 janvier 1982", titre: "Chute sur l'Antarctique, trouvée aux Allan Hills", lignes: ["Recueilli en 1982 par le programme, un éclat de 31 g", "ANSMET : la première roche lunaire venue seule."] }),
      loupe6("Vue au microscope, la roche présente une brèche faite de fragments d'anorthosite et de verre.", ["Fragments blancs d'anorthosite, éclats", "de pyroxène et billes de verre", "d'impact, soudés dans le sol lunaire", "pulvérisé : la même roche que celles", "rapportées par Apollo 16."]),
    ],
    cond: { type: "meteorite", zones: ["fusion"], src: ["lune"], chemin: [
      { age: 70, T: 1500, lab: "la Lune se forme" },
      { age: 180, T: 500, n: 1, t: "La cristallisation de l'océan de magma produit une croûte d'anorthosite (≈ 4,46 à 4,36 milliards d'années)." },
      { age: 2500, T: 60, n: 2, t: "Les chocs pulvérisent le régolithe puis l'agglomèrent en brèches (surface comprise entre −170 et +120 °C)." },
      { age: 4555, T: 250, n: 3, t: "Voici moins de 20 millions d'années, un choc l'expulse." },
      { age: 4567, T: -30, n: 4, t: "Retombée sur l'Antarctique, préservée par la glace, recueillie en 1982." },
      { n: 5, t: "Vue au microscope, elle combine anorthosite et verre dans une brèche." }] },
  });

  poser("meteorite_fer", {
    exemple: "Exemple suivi : la météorite de Saint-Aubin (Aube), fer du groupe IIIAB, a été retrouvée en 1968 sous forme de plusieurs masses (472 kg).",
    anim: [
      E("Astéroïde", "Très tôt, dans le premier million d'années, un astéroïde se forme par accrétion", "En moins d'un million d'années, à compter des premiers solides", null, "accretionAsteroide", { age: "Dans un délai inférieur au million d'années suivant les premiers solides", titre: "Poussières et grains de métal se collent : un astéroïde se forme très tôt" }),
      E("Noyau", "Très chargé en aluminium 26, il entre en fusion : le fer-nickel, plus dense, gagne le centre pour former un noyau", "1 à 1,5 million d'années après", "quelques centaines de milliers d'années", "differenciation", { suivi: "noyau", croute: true }),
      E("Widmanstätten", "Dans le noyau, la cristallisation se poursuit tandis que le refroidissement avance de quelques dizaines de degrés par million d'années ; entre 700 et 450 °C, des lamelles de kamacite se développent.", "Pendant des millions d'années", "allant de millions à dizaines de millions d'années", "noyauRefroidit", {}),
      E("Collision", "Une collision disloque l'astéroïde : le manteau et la croûte se dispersent, le noyau se fragmente", "Il y a ≈ 650 millions d'années (fers IIIAB)", null, "collision", { cible: "noyau", titre: "Une collision brise l'astéroïde jusqu'à son noyau", age: ilYa(650) }),
      E("Voyage", "Le fragment métallique erre pendant des centaines de millions d'années avant de croiser l'orbite terrestre", "Pendant des centaines de millions d'années", "≈ 650 millions d'années", "voyageEspace", { depart: "ceinture", age: "≈ 650 millions d'années (rayons cosmiques)" }),
      E("Trouvée", "Chute de date inconnue : les morceaux, au nombre de plusieurs, pèsent 472 kg et sont découverts en 1968 à Saint-Aubin, dans l'Aube.", "Trouvée en 1968", null, "chute", { paysage: "champ", pierres: 3, date: "trouvée en 1968", titre: "Saint-Aubin (Aube), trouvée en 1968", lignes: ["Chute de date inconnue : plusieurs masses", "de fer, 472 kg en tout."] }),
      loupe6("Après attaque à l'acide, une tranche polie fait apparaître les figures de Widmanstätten.", ["Lamelles de kamacite selon les faces", "d'un octaèdre, bordées de taénite,", "plessite entre elles, nodule de", "troïlite. Il a fallu des millions", "d'années pour les faire pousser."]),
    ],
    cond: { type: "meteorite", zones: ["fusion", "widman", "fefs"], src: ["kruijer2014"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 0.3, T: 0, n: 1, t: "Dans le premier million d'années, l'astéroïde s'accrète." },
      { age: 1.3, T: 1550, n: 2, t: "Le corps entre en fusion : le fer-nickel gagne le centre." },
      { age: 6, T: 1400, lab: "le noyau cristallise" },
      { age: 15, T: 700 },
      { age: 40, T: 450, n: 3, bande: "lamelles de kamacite", t: "Dans l'intervalle de 700 à 450 °C, les figures de Widmanstätten se forment." },
      { age: 3000, T: -60 },
      { age: 3917, T: 300, n: 4, t: "Voici ≈ 650 millions d'années, une collision fracture le noyau." },
      { age: 4500, T: -70, n: 5, t: "Pendant des centaines de millions d'années, elle voyage dans l'espace." },
      { age: 4567, T: 12, n: 6, t: "Chute de date inconnue, retrouvée en 1968 à Saint-Aubin." },
      { n: 7, t: "Tranche attaquée : figures de Widmanstätten." }] },
  });

  poser("pallasite", {
    exemple: "Exemple suivi : une pallasite du groupe principal, celle de Marburg (Hesse, Allemagne), la plus proche de la France, découverte en 1906.",
    anim: [
      E("Astéroïde fondu", "Un astéroïde entre en fusion et se différencie en un noyau métallique et un manteau d'olivine", "Environ 1 à 3 millions d'années, après les premiers solides", null, "differenciation", { suivi: "manteau", croute: true }),
      E("Collision", "Un noyau fondu venu d'un autre corps s'injecte dans ce manteau : le métal enveloppe alors les cristaux d'olivine.", "Quelques millions d'années après", null, "collision", { cible: "injection", titre: "Une collision injecte le métal d'un noyau dans un manteau d'olivine", age: "quelques millions d'années à compter des premiers solides" }),
      E("Refroidissement", "Enfoui, le mélange se refroidit très lentement, à raison de 2,5 à 18 °C par million d'années", "Pendant des dizaines de millions d'années", "des dizaines de millions d'années", "noyauRefroidit", { titre: "Le mélange enfoui refroidit de 2,5 à 18 °C par million d'années", lignes: ["Au sein des plages métalliques suffisamment larges, la kamacite", "pousse en lamelles, comme dans les fers."] }),
      E("Collision et voyage", "Une ultime collision détache un fragment, qui rejoint l'orbite terrestre", "Bien plus tard", null, "collision", { cible: "noyau", age: "voici des dizaines à des centaines de millions d'années" }),
      E("Trouvée", "Chute de date inconnue : une pallasite de 3 kg est découverte en 1906 à Marburg, en Allemagne", "Trouvée en 1906", null, "chute", { paysage: "champ", pierres: 1, date: "trouvée en 1906", titre: "Marburg (Hesse), trouvée en 1906", lignes: ["Pour une pallasite de 3 kg, aucune n'est connue", "en France."] }),
      loupe6("Sur une tranche polie apparaissent des cristaux d'olivine dans le fer-nickel", ["Cristaux d'olivine jaune-vert de 0,5", "à 2 cm, enchâssés dans le métal ;", "troïlite et chromite. En tranche fine,", "l'olivine laisse passer la lumière", "comme un vitrail."]),
    ],
    cond: { type: "meteorite", zones: ["fusion", "widman"], src: ["pallasite"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 2, T: 1500, n: 1, t: "L'astéroïde fond : noyau de métal, manteau d'olivine." },
      { age: 8, T: 1300, n: 2, t: "Par collision, le métal liquide d'un noyau se trouve injecté dans l'olivine du manteau." },
      { age: 30, T: 700 },
      { age: 150, T: 400, n: 3, bande: "lamelles de kamacite", t: "Refroidissement de 2,5 à 18 °C par million d'années." },
      { age: 3000, T: -60 },
      { age: 4500, T: -70, n: 4, t: "Collision, voyage dans l'espace." },
      { age: 4567, T: 10, n: 5, t: "Trouvée en 1906 à Marburg." },
      { n: 6, t: "Tranche polie : olivine dans le métal." }] },
  });

  poser("mesosiderite", {
    exemple: "Exemple suivi : la mésosidérite de Barea (Espagne), survenue en 1842 ; on n'en connaît aucune en France.",
    anim: [
      E("Deux astéroïdes", "Deux astéroïdes ont fondu : chacun possède un noyau métallique, un manteau et une croûte basaltique", "Dans les premiers millions d'années", null, "differenciation", { suivi: "croute", titre: "Deux astéroïdes fondent : chacun forme un noyau, un manteau et une croûte" }),
      E("Collision", "Vers 4 525 millions d'années, leur collision projette le métal fondu de l'un sur la croûte de l'autre, où il se mêle", "Il y a ≈ 4 525 millions d'années", null, "collision", { cible: "melange", titre: "Le métal fondu d'un astéroïde se mêle à la croûte d'un autre", age: ilYa(4525) }),
      E("Refroidissement", "Enfoui sous les débris, ce mélange se refroidit plus lentement que n'importe quelle autre météorite : moins d'un degré par million d'années", "Pendant des centaines de millions d'années", "des centaines de millions d'années", "noyauRefroidit", { breche: true, titre: "Enfoui, le mélange refroidit de moins d'un degré par million d'années", lignes: ["Le refroidissement le plus lent mesuré", "dans une météorite."] }),
      E("Collision et voyage", "Une collision plus récente libère un fragment, qui gagne l'orbite terrestre", "Bien plus tard", null, "collision", { cible: "noyau", age: "il y a des dizaines de millions d'années" }),
      E("Chute", "Une pierre de 3,2 kg s'abat sur Barea (Espagne) en 1842.", "1842", null, "chute", { paysage: "champ", pierres: 1, date: "1842", titre: "En 1842, à Barea (Espagne)", lignes: ["Cette pierre de 3,2 kg, de type mésosidérite, reste la plus proche de", "la France ; 7 chutes seulement sont recensées."] }),
      loupe6("Une tranche polie dévoile une brèche où se mêlent fragments de croûte et métal.", ["Fragments de basalte, de gabbro et", "d'orthopyroxène, nodules de fer-", "nickel, dans un mélange fin des", "deux : la trace d'une collision", "entre astéroïdes fondus."]),
    ],
    cond: { type: "meteorite", zones: ["fusion", "widman"], src: ["meso"], chemin: [
      { age: 0.1, T: 1350, lab: "premiers solides" },
      { age: 3, T: 1400, n: 1, t: "Deux astéroïdes ont fondu : noyau, manteau, croûte." },
      { age: 42, T: 1250, n: 2, t: "Vers 4 525 Ma, du métal fondu issu de l'un se disperse dans la croûte de l'autre." },
      { age: 900, T: 300, n: 3, t: "Enfoui, ce mélange perd moins d'un degré par million d'années." },
      { age: 4500, T: -70, n: 4, t: "Collision récente, voyage dans l'espace." },
      { age: 4567, T: 15, n: 5, t: "En 1842, chute à Barea (Espagne)." },
      { n: 6, t: "Sur une tranche polie se lit une brèche de croûte et de métal." }] },
  });
})();
