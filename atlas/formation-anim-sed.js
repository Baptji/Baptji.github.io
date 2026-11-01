// ============ Formation des roches SÉDIMENTAIRES : scènes animées refaites (24/09/2026) ============
// Chargé après formation-anim.js, textures.js et textures-roches.js, avant app.js. Il AJOUTE des scènes à
// FormationAnim.SCENES et REMPLACE les étapes (`anim`, `exemple`, `cond`…) des roches sédimentaires dans Formation._ROCHES.
// Fichier séparé : une autre session retouchait formation-anim.js et formation.js (roches magmatiques) au même moment.
// Mêmes conventions que formation-anim.js : scène 480 × 240, { fond, anim(t, ta), devant? }, t = progression de l'étape
// (figée à la fin), ta = secondes écoulées (l'ambiance continue pendant l'arrêt sur image).
// Règles de ses retours (24/09/2026) : une diapo part de l'image finale de la précédente (même dessin, mêmes objets) ;
// chaque objet à l'écran est expliqué ; la vue rapprochée finale = le schéma « Texture de la roche » affiché sous
// l'animation (même tirage) ; un retour en surface montre son moteur (rivière qui creuse, soulèvement…).
(function () {
  "use strict";
  if (!window.Formation || !window.FormationAnim || !Formation._outils) return;
  const { alea } = Formation._outils;
  const SCENES = FormationAnim.SCENES, ROCHES_F = Formation._ROCHES, SOURCES = Formation._SOURCES;
  const W = 480, H = 240;

  // ─────────────────────────────── utilitaires (copie de formation-anim.js, identifiants préfixés « fs ») ───────────────────────────────
  const r1 = (x) => Math.round(x * 10) / 10;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lisse = (t) => t * t * (3 - 2 * t);
  const fen = (t, a, b) => lisse(clamp((t - a) / (b - a)));
  const attrs = (o) => Object.entries(o || {}).map(([k, v]) => v == null ? "" : ` ${k}="${v}"`).join("");
  const P = (l) => l.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
  const rect = (x, y, w, h, f, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" fill="${f}"${attrs(o)}/>`;
  const poly = (l, f, o) => `<polygon points="${P(l)}" fill="${f}"${attrs(o)}/>`;
  const pline = (l, c, sw, o) => `<polyline points="${P(l)}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${attrs(o)}/>`;
  const circ = (x, y, r, f, o) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(Math.max(0, r))}" fill="${f}"${attrs(o)}/>`;
  const ell = (x, y, rx, ry, f, o) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${f}"${attrs(o)}/>`;
  const line = (x1, y1, x2, y2, c, sw, o) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"${attrs(o)}/>`;
  const txt = (x, y, s, o = {}) => `<text x="${r1(x)}" y="${r1(y)}" class="fa-lab${o.petit ? " fa-petit" : ""}${o.clair ? " fa-clair" : ""}"${o.a ? ` text-anchor="${o.a}"` : ""}${o.op != null ? ` opacity="${r1(op(o.op) * 100) / 100}"` : ""}>${s}</text>`;
  let uid = 0;
  const nid = (p) => `fs${p}${++uid}`;
  const op = (x) => Math.round(clamp(x) * 100) / 100;
  const nombre = (v) => Math.round(v).toLocaleString("fr-FR").replace(/ | /g, " ");
  const dec = (v, n = 1) => (Math.round(v * 10 ** n) / 10 ** n).toFixed(n).replace(".", ",");
  const grp = (s, o) => o == null || o >= 1 ? s : o <= 0 ? "" : `<g opacity="${op(o)}">${s}</g>`;

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
  function lePlong(pts, u) {
    if (!pts._L) { let L = 0; pts._c = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); pts._c.push(L); } pts._L = L; }
    const d = clamp(u) * pts._L;
    let i = 1;
    while (i < pts.length - 1 && pts._c[i] < d) i++;
    const seg = pts._c[i] - pts._c[i - 1] || 1, f = (d - pts._c[i - 1]) / seg;
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    return { x: lerp(x1, x2, f), y: lerp(y1, y2, f), a: Math.atan2(y2 - y1, x2 - x1) };
  }
  // grain ou bloc : k coins, anguleux (rond = 0) → arrondi (rond = 1)
  function formeGrain(R, k = 6, allonge = 0.85) {
    const ang = [];
    for (let i = 0; i < k; i++) {
      const a = (i + (R() - 0.5) * 0.6) / k * Math.PI * 2, d = 0.82 + R() * 0.3;
      ang.push([Math.cos(a) * d, Math.sin(a) * d * allonge]);
    }
    const rnd = [], n = 18;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; rnd.push([Math.cos(a) * 0.92, Math.sin(a) * 0.92 * allonge]); }
    // on rééchantillonne le polygone anguleux sur 18 points pour pouvoir passer de l'un à l'autre
    const angN = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      // intersection du rayon d'angle a avec le polygone anguleux
      let best = null;
      for (let j = 0; j < k; j++) {
        const [x1, y1] = ang[j], [x2, y2] = ang[(j + 1) % k], dx = Math.cos(a), dy = Math.sin(a);
        const den = dx * (y2 - y1) - dy * (x2 - x1);
        if (Math.abs(den) < 1e-9) continue;
        const s = (x1 * (y2 - y1) - y1 * (x2 - x1)) / den, u = (dx * y1 - dy * x1) / -den;
        if (s > 0 && u >= -1e-6 && u <= 1 + 1e-6 && (best == null || s < best)) best = s;
      }
      angN.push([Math.cos(a) * (best || 0.8), Math.sin(a) * (best || 0.8)]);
    }
    return (rond, x = 0, y = 0, r = 1, rot = 0) => {
      const c = Math.cos(rot), s = Math.sin(rot);
      return angN.map(([ax, ay], i) => {
        const px = lerp(ax, rnd[i][0], rond) * r, py = lerp(ay, rnd[i][1], rond) * r;
        return [x + px * c - py * s, y + px * s + py * c];
      });
    };
  }
  function fleche(x1, y1, x2, y2, o = {}) {
    const c = o.c || "#27302d", sw = o.sw || 1.8, t = o.pointe || 6;
    const a = Math.atan2(y2 - y1, x2 - x1), bx = x2 - Math.cos(a) * t, by = y2 - Math.sin(a) * t;
    const n = [Math.cos(a + Math.PI / 2) * t * 0.55, Math.sin(a + Math.PI / 2) * t * 0.55];
    return `<g${o.op != null ? ` opacity="${op(o.op)}"` : ""}>${line(x1, y1, bx, by, c, sw)}${poly([[x2, y2], [bx + n[0], by + n[1]], [bx - n[0], by - n[1]]], c)}</g>`;
  }
  function degrade(haut, bas, vertical = true) {
    const k = nid("g");
    return { def: `<linearGradient id="${k}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient>`, url: `url(#${k})` };
  }
  function ciel(h = H, haut = "#b9d6e8", bas = "#edf4f7") {
    const g = degrade(haut, bas);
    return `<defs>${g.def}</defs>` + rect(0, 0, W, h, g.url);
  }
  function nuage(x, y, e = 1, gris) {
    const c = gris ? "#dfe4e7" : "#fff";
    return `<g opacity=".97">${ell(x, y, 20 * e, 8 * e, c)}${ell(x - 15 * e, y + 3 * e, 12 * e, 6 * e, c)}${ell(x + 15 * e, y + 3 * e, 14 * e, 6 * e, c)}${ell(x + 2 * e, y - 5 * e, 11 * e, 7 * e, c)}</g>`;
  }
  function soleil(x, y, r = 11) { return circ(x, y, r + 7, "#f6d77a", { opacity: 0.35 }) + circ(x, y, r, "#f2b632"); }
  function vegetation(surf, x0, x1, R, o = {}) {
    const pas = o.pas || 16, pente = o.pente || 1.1, e = o.echelle || 1;
    const herbe = [];
    for (let x = x0; x <= x1; x += 3) herbe.push([x, surf(x) + 0.4]);
    let s = o.sansHerbe ? "" : pline(herbe, "#5f8f45", 2.2);
    for (let x = x0 + pas * (0.3 + R() * 0.5); x < x1 - 3; x += pas * (0.65 + R() * 0.7)) {
      const y = surf(x), dy = (surf(x + 2) - surf(x - 2)) / 4;
      if (Math.abs(dy) > pente) continue;
      const h = (6 + R() * 4) * e, conif = R() < (o.coniferes ?? 0.3);
      s += rect(x - 0.7 * e, y - h * 0.45, 1.4 * e, h * 0.45 + 1.5, "#6b4f35");
      s += conif ? poly([[x, y - h - 1.5], [x - h * 0.34, y - h * 0.3], [x + h * 0.34, y - h * 0.3]], "#3f6b3a")
        : ell(x, y - h * 0.62, h * 0.36, h * 0.42, R() < 0.5 ? "#4f7d3c" : "#5d8a45");
    }
    return o.op != null ? grp(s, o.op) : s;
  }
  function pluie(x0, y0, w, h, ta, n, graine, sol) {
    const R = alea(graine);
    let s = "";
    for (let i = 0; i < n; i++) {
      const px = x0 + R() * w, ph = R(), u = (ta * 0.63 + ph) % 1;
      const bas = sol ? sol(px) - y0 : h, y = y0 + u * Math.min(h, bas);
      s += line(px - u * 8, y, px - u * 8 - 2, y + 7, "#5b95c6", 1.1, { opacity: op(Math.min(u * 8, (1 - u) * 8, 1)) });
    }
    return s;
  }
  function loupe(cx, cy, r, o = {}) {
    const k = nid("l");
    let fond = "";
    if (o.vers) {
      const [x, y] = o.vers, d = Math.hypot(x - cx, y - cy), phi = Math.atan2(y - cy, x - cx), b = Math.acos(Math.min(1, r / d));
      fond += poly([[x, y], [cx + Math.cos(phi + b) * r, cy + Math.sin(phi + b) * r], [cx + Math.cos(phi - b) * r, cy + Math.sin(phi - b) * r]], "rgba(255,255,255,.45)")
        + circ(x, y, o.rVers || 5, "none", { stroke: "#27302d", "stroke-width": 1.2 });
    }
    fond += `<clipPath id="${k}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` + circ(cx, cy, r + 3, "#fff") + circ(cx, cy, r, o.fond || "#f4f1ea");
    return {
      fond,
      dans: (contenu) => `<g clip-path="url(#${k})">${contenu}</g>`,
      bord: circ(cx, cy, r + 1.5, "none", { stroke: "#27302d", "stroke-width": 1.4 }),
    };
  }
  function cartouche(x, y, w, lignes, o = {}) {
    const h = 12 + lignes.length * 13;
    let s = rect(x, y, w, h, "rgba(255,255,255,.9)", { rx: 6, stroke: "rgba(0,0,0,.12)" });
    lignes.forEach(([c, t, extra], i) => {
      const yy = y + 15 + i * 13;
      if (c) s += rect(x + 8, yy - 8, 10, 10, c, Object.assign({ rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }, extra || {}));
      s += `<text x="${x + (c ? 23 : 8)}" y="${yy}" class="fa-leg">${t}</text>`;
    });
    return o.op != null ? grp(s, o.op) : s;
  }
  // bulle de texte sur fond blanc (plusieurs lignes), ancrée à gauche
  function bulle(x, y, lignes, o = {}) {
    const w = o.w || Math.max(...lignes.map((l) => l.replace(/<[^>]+>/g, "").length)) * 3.9 + 14, h = 8 + lignes.length * 10.5;
    let s = rect(x, y, w, h, "rgba(255,255,255,.92)", { rx: 5, stroke: "rgba(0,0,0,.14)" });
    lignes.forEach((l, i) => { s += `<text x="${r1(x + 7)}" y="${r1(y + 13 + i * 10.5)}" class="fa-leg">${l}</text>`; });
    return o.op != null ? grp(s, o.op) : s;
  }
  function compteur(x, y, age, o = {}) {
    const v = age < 10 ? String(Math.round(age * 10) / 10).replace(".", ",") : nombre(age);
    const txtAge = o.libelle || (age <= 0.05 ? "aujourd'hui" : `il y a ${v} million${age < 1.95 ? "" : "s"} d'années`);
    const w = txtAge.length * 4.15 + 16;
    const wl = Math.max(w, o.sous ? o.sous.length * 4.2 : 0);
    x = clamp(x, wl / 2 + 4, W - 4 - wl / 2);
    return rect(x - w / 2, y - 10, w, 19, "rgba(255,255,255,.9)", { rx: 5, stroke: "rgba(0,0,0,.14)" })
      + `<text x="${r1(x)}" y="${r1(y + 3.5)}" text-anchor="middle" class="fa-lab" style="stroke:none">${txtAge}</text>`
      + (o.sous ? `<text x="${r1(x)}" y="${r1(y + 20)}" text-anchor="middle" class="fa-leg">${o.sous}</text>` : "");
  }
  function thermometre(x, yHaut, hauteur_, v, vmin, vmax, ticks) {
    const yv = (u) => yHaut + hauteur_ - (u - vmin) / (vmax - vmin) * hauteur_;
    let s = rect(x - 5, yHaut, 10, hauteur_, "#ffffff", { rx: 5, stroke: "#27302d", "stroke-width": 1 })
      + circ(x, yHaut + hauteur_ + 10, 10, "#c0392b", { stroke: "#27302d", "stroke-width": 1 })
      + rect(x - 2.5, yv(clamp(v, vmin, vmax)), 5, yHaut + hauteur_ + 10 - yv(clamp(v, vmin, vmax)), "#c0392b");
    for (const u of ticks) s += line(x + 5, yv(u), x + 9, yv(u), "#27302d", 1) + txt(x + 12, yv(u) + 3.5, `${nombre(u)} °C`, { petit: true });
    return s;
  }
  // jauge verticale (vides, concentration…) : valeur v sur 0–vmax
  function jauge(x, y, h, v, vmax, o = {}) {
    const f = clamp(v / vmax);
    return rect(x - 6, y, 12, h, "#fff", { stroke: "#27302d", "stroke-width": 1, rx: 4 })
      + rect(x - 5, y + h * (1 - f), 10, h * f, o.couleur || "#8fc3e4", { opacity: 0.85, rx: 3 })
      + txt(x, y - 6, o.valeur || `${nombre(v)} %`, { a: "middle", petit: true })
      + (o.nom || []).map((l, i) => txt(x, y + h + 11 + i * 9, l, { a: "middle", petit: true })).join("");
  }
  // polygone lissé fermé (chemin SVG)
  function cheminFerme(pts) {
    const n = pts.length, m = (i) => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
    let d = `M${r1(m(n - 1)[0])} ${r1(m(n - 1)[1])}`;
    for (let i = 0; i < n; i++) { const [x, y] = pts[i], [mx, my] = m(i); d += ` Q${r1(x)} ${r1(y)} ${r1(mx)} ${r1(my)}`; }
    return d + "Z";
  }

  // ─────────────────────────────── la roche telle que la montre « Texture de la roche » ───────────────────────────────
  // Même tirage que le panneau affiché sous l'animation (Textures.tirage, mis en cache) : la dernière vue rapprochée d'une
  // animation EST ce schéma (sa remarque du 24/09/2026 sur la tillite : « la diapo 4 est différente de la vue loupe en dessous »).
  // Le dessin du mode « détritique » = motif du liant (un rectangle) puis les grains : on glisse les VIDES (eau des pores, en
  // bleu) entre les deux, donc visibles seulement dans le liant. Champ : 420 × 252 unités.
  const TW = 420, TH = 252;
  const cacheTex = {};
  // motif des vides : 14 taches par tuile de 30 unités, bien espacées (tirage fixe) ; leur rayon règle la surface couverte
  const TUILE = 30, PORES_TUILE = (() => { const R = alea("tuile-pores"), l = []; for (let e = 0; e < 3000 && l.length < 14; e++) { const x = R() * TUILE, y = R() * TUILE; if (l.every(([u, v]) => Math.min(Math.abs(u - x), TUILE - Math.abs(u - x)) ** 2 + Math.min(Math.abs(v - y), TUILE - Math.abs(v - y)) ** 2 > 42)) l.push([x, y]); } return l; })();
  function texRoche(roche) {
    if (!roche || !window.Textures) return null;
    if (cacheTex[roche.id] !== undefined) return cacheTex[roche.id];
    let tir = null;
    try { tir = Textures.tirage(roche); } catch (e) { tir = null; }
    if (!tir) return (cacheTex[roche.id] = null);
    try { Textures.panneau(roche); } catch (e) { /* remplit les pourcentages de la légende */ }
    const corps = tir.res.corps;
    const m = (tir.t.mode === "detritique" || tir.t.mode === "bioclastique") && corps.match(/^([\s\S]*?<rect x="-2" y="-2"[^>]*\/>)([\s\S]*)$/);
    const idL = nid("txL"), idG = nid("txG");
    const lignes = [];
    (tir.res.legende ? tir.res.legende.groupes : []).forEach((g) => g.lignes.forEach((l) => lignes.push({ nom: l.nom, couleur: l.couleur, pct: l.pct, role: l.role })));
    const liant = tir.res.mesure && tir.res.mesure.liant > 0.05 ? tir.res.mesure.liant : 0.35;
    return (cacheTex[roche.id] = {
      defs: `<defs><g id="${idL}">${m ? m[1] : ""}</g><g id="${idG}">${m ? m[2] : corps}</g></defs>`,
      idL, idG, K: tir.K, t: tir.t, lignes, liant, mode: tir.t.mode, entre: !!m,
    });
  }
  // la texture avec v % de vides (eau, en bleu) : pour un mode détritique, les vides sont posés entre le liant et les grains,
  // donc visibles seulement dans le liant, qui en est couvert à v ÷ (part du liant) ; sinon, voile de taches par-dessus.
  function texDessin(tx, v, v0, o = {}) {
    const c = clamp(v / 100 / (tx.entre ? tx.liant : 1), 0, 0.82), k = nid("pp");
    const r = Math.sqrt(c * TUILE * TUILE / (PORES_TUILE.length * Math.PI));
    const motif = r > 0.05 ? `<pattern id="${k}" patternUnits="userSpaceOnUse" width="${TUILE}" height="${TUILE}">${PORES_TUILE.map(([x, y]) => circ(x, y, r, o.eau || "#8fc3e4")).join("")}</pattern>` : "";
    const pores = motif && (tx.entre || o.forcer) ? `<defs>${motif}</defs><rect x="0" y="0" width="${TW}" height="${TH}" fill="url(#${k})"${tx.entre ? "" : ' opacity=".8"'}/>` : "";
    return `<use href="#${tx.idL}"/>` + (tx.entre ? pores + `<use href="#${tx.idG}"/>` : `<use href="#${tx.idG}"/>` + pores);
  }
  function texDansRect(tx, x, y, w, contenu) {
    const s = w / TW, k = nid("tr");
    return `<clipPath id="${k}"><rect x="0" y="0" width="${TW}" height="${TH}" rx="6"/></clipPath>`
      + `<g transform="translate(${r1(x)} ${r1(y)}) scale(${Math.round(s * 10000) / 10000})"><g clip-path="url(#${k})">${contenu}</g>`
      + `<rect x="0" y="0" width="${TW}" height="${TH}" rx="6" fill="none" stroke="#3b3f3c" stroke-width="${r1(1.4 / s)}"/></g>`;
  }
  // réglette d'échelle (même logique que le panneau) pour une texture dessinée à l'échelle s
  function texEchelle(tx, x, y, s) {
    const mm = [10, 5, 2, 1, 0.5, 0.2, 0.1].find((v) => v * tx.K <= 90) || 0.1, el = mm * tx.K * s;
    return rect(x - 4, y - 14, el + 8, 19, "rgba(255,255,255,.92)", { rx: 3 }) + line(x, y, x + el, y, "#3b3f3c", 1.4)
      + line(x, y - 3, x, y + 3, "#3b3f3c", 1.1) + line(x + el, y - 3, x + el, y + 3, "#3b3f3c", 1.1)
      + `<text x="${r1(x + el / 2)}" y="${r1(y - 4.5)}" text-anchor="middle" class="fa-leg">${String(mm).replace(".", ",")} mm</text>`;
  }
  // la texture dans un disque de loupe (centre cx, cy, rayon r) : on montre le centre du champ, à l'échelle s
  function texDansDisque(tx, cx, cy, r, s, contenu) {
    return `<g transform="translate(${r1(cx - TW / 2 * s)} ${r1(cy - TH / 2 * s)}) scale(${Math.round(s * 10000) / 10000})">${contenu}</g>`;
  }

  // ───────────── 1 · vue rapprochée finale : le schéma de la texture, animé selon le processus ─────────────
  // p.mode : "cimentation" (défaut : vides en bleu qui se comblent, jauge des vides), "depot" (la roche monte lit par lit
  // depuis le bas, sous une eau où tombent des particules), "croissance" (les cristaux naissent et grandissent dans une
  // saumure ou une boue, `dessous` = sa couleur), "fixe" (rien ne bouge). Autres réglages : titre, lignes (texte, ≤ 34
  // caractères par ligne), vides [début, fin] (%), eau, nomVides, jauge { nom, de, a, unite, max, couleur }, temperature
  // [de, a] (°C), dessous, nomDessous, duree.
  SCENES.loupeRoche = function (p, roche) {
    const tx = texRoche(roche);
    if (!tx) return SCENES.vueMicroscope ? SCENES.vueMicroscope(p, roche) : { fond: "", anim: () => "" };
    const X = 12, Y = 28, LW = 290, s = LW / TW, LH = TH * s;
    const mode = p.mode || (p.vides ? "cimentation" : "fixe");
    const V = p.vides || [0, 0];
    const vue = `${tx.t.vue || "Vue rapprochée"}, ${String(tx.t.champ).replace(".", ",")} × ${String(Math.round(tx.t.champ * 0.6 * 10) / 10).replace(".", ",")} mm`;
    const lignes = tx.lignes.filter((l) => l.pct == null || l.pct >= 0.5);
    const nL = Math.min(7, lignes.length), y0 = 38 + (p.lignes || []).length * 11 + 12;
    let leg = "";
    const nomCourt = (n) => { let x = n.replace(/\s*\([^)]*\)/, ""); if (x.length > 24) x = x.replace(/^(Fragments|Galets|Grains|Débris|Fantômes) (de |d')/, ""); return x.charAt(0).toUpperCase() + x.slice(1); };
    lignes.slice(0, 7).forEach((l, i) => {
      const y = y0 + i * 13, t = `${nomCourt(l.nom)}${l.pct != null ? ` ≈ ${Math.max(1, Math.round(l.pct))} %` : ""}`;
      leg += rect(318, y - 8, 10, 10, l.couleur, { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 })
        + `<text x="333" y="${y}" class="fa-leg"${t.length > 28 ? ' style="font-size:6.4px"' : ""}>${t}</text>`;
    });
    const extra = mode === "cimentation" ? [p.eau || "#8fc3e4", p.nomVides || "vides (eau entre les grains)"]
      : mode === "croissance" ? [p.dessous || "#cfe3e6", p.nomDessous || "saumure"] : mode === "depot" ? [p.eauFond || "#cfe4ef", p.nomDessous || "eau"] : null;
    if (extra) leg += rect(318, y0 + nL * 13 - 8, 10, 10, extra[0], { rx: 2, stroke: "rgba(0,0,0,.35)", "stroke-width": 0.6 }) + `<text x="333" y="${y0 + nL * 13}" class="fa-leg">${extra[1]}</text>`;
    // germes de la croissance (cristaux qui naissent un à un et grandissent)
    const R = alea("lr" + roche.id), germes = Array.from({ length: 90 }, () => ({ x: R() * TW, y: R() * TH, t0: R() * 0.55 }));
    const tombe = Array.from({ length: 40 }, () => ({ x: R() * TW, ph: R(), r: 1 + R() * 2 }));
    const clip = nid("lrc");
    const jaugeTexte = (v) => p.jauge ? `${String(p.jauge.unite === "%" || !p.jauge.unite ? nombre(v) : (Math.round(v * 10) / 10)).replace(".", ",")} ${p.jauge.unite || "%"}` : `${nombre(v)} %`;
    return {
      fond: tx.defs + rect(0, 0, W, H, "#f3f1ea") + txt(X, 17, p.titre || "Dans la roche, à la loupe")
        + `<text x="${X}" y="${r1(Y + LH + 12)}" class="fa-leg">${vue}. Reprise du schéma de « Texture de la roche », plus bas.</text>`,
      anim(t, ta) {
        const e = fen(t, 0.06, 0.9);
        let contenu;
        if (mode === "cimentation") contenu = texDessin(tx, lerp(V[0], V[1], e), V[0], { eau: p.eau });
        else if (mode === "depot") {
          const hy = TH * (1 - e);
          contenu = `<clipPath id="${clip}"><rect x="-2" y="${r1(hy)}" width="${TW + 4}" height="${r1(TH - hy + 2)}"/></clipPath>` + rect(-2, -2, TW + 4, TH + 4, p.eauFond || "#cfe4ef")
            + `<g clip-path="url(#${clip})">${texDessin(tx, lerp(V[0], V[1], e), Math.max(1, V[0]))}</g>`;
          for (const q of tombe) { const u = (q.ph + ta * 0.25) % 1, y = u * hy; if (y < hy - 2) contenu += circ(q.x, y, q.r, p.particule || "#f4efe2", { opacity: 0.85 }); }
          contenu += line(-2, hy, TW + 2, hy, "rgba(60,60,55,.5)", 1.2);
        } else if (mode === "croissance") {
          let m = ""; for (const g of germes) { const r = 40 * clamp((e - g.t0) / 0.4); if (r > 0.3) m += circ(g.x, g.y, r, "#fff"); }
          contenu = `<clipPath id="${clip}">${m || '<rect x="0" y="0" width="0" height="0"/>'}</clipPath>` + rect(-2, -2, TW + 4, TH + 4, p.dessous || "#cfe3e6")
            + `<g clip-path="url(#${clip})">${texDessin(tx, 0, 1)}</g>`;
        } else contenu = texDessin(tx, 0, 1);
        let s2 = texDansRect(tx, X, Y, LW, contenu);
        s2 += texEchelle(tx, X + 10, Y + LH - 8, s);
        (p.lignes || []).forEach((l, i) => { s2 += `<text x="318" y="${38 + i * 11}" class="fa-leg">${l}</text>`; });
        s2 += leg;
        if (mode === "cimentation") s2 += jauge(462, 112, 86, lerp(V[0], V[1], e), Math.max(40, V[0]), { nom: ["vides"] });
        else if (p.jauge) { const v = lerp(p.jauge.de, p.jauge.a, e); s2 += jauge(462, 112, 86, v, p.jauge.max || 100, { nom: [].concat(p.jauge.nom), couleur: p.jauge.couleur, valeur: jaugeTexte(v) }); }
        if (p.temperature) s2 += txt(462, 222, `≈ ${nombre(lerp(p.temperature[0], p.temperature[1], e))} °C`, { a: "middle", petit: true });
        s2 += txt(W - 8, 232, p.duree || "", { a: "end", petit: true });
        return s2;
      },
    };
  };

  // ───────────── 2 · enfouissement en colonne (comme la scène validée du grès et du calcaire), loupe = la vraie texture ─────────────
  // mêmes réglages que SCENES.enfouissement : couches, age0, age1, zmax, nomRoche, couleurRoche, surface, socle, vides, rythme,
  // gradient, loupeTexte ; la loupe montre le schéma « Texture de la roche », dont les vides se resserrent.
  SCENES.enfouissementSed = function (p, roche) {
    const tx = texRoche(roche);
    if (!tx) return SCENES.enfouissement(p, roche);
    const R = alea("es" + p.graine);
    const X0 = 14, X1 = 236, BAS = 216;
    const AGE0 = p.age0 ?? 470, AGE1 = p.age1 ?? 400, ZMAX = p.zmax ?? 2.2, KM = 150 / ZMAX;
    const VIDES = p.vides || [40, 26];
    const couches = p.couches || [];
    const points = Array.from({ length: 80 }, () => [X0 + R() * (X1 - X0), R(), R() < 0.2 ? (p.grainFonce || "#8a7f70") : (p.grainClair || "#fbf6ea")]);
    const LX = 420, LY = 90, LR = 50, ech = p.echelleLoupe || 0.45, TX = 404;
    const L = loupe(LX, LY, LR, { fond: "#f4f1ea" });
    const merG = degrade("#86bddb", "#5d9cc6");
    const pas = ZMAX <= 0.6 ? 0.1 : ZMAX <= 1.5 ? 0.25 : 0.5;
    return {
      fond: tx.defs + rect(0, 0, W, H, "#f3f1ea") + `<defs>${merG.def}</defs>` + L.fond,
      anim(t) {
        const O = 150 * t, gH = lerp(30, 30 * (100 - VIDES[0]) / (100 - VIDES[1]) * 0.98, t), gY = BAS - gH, SF = gY - O, z = O / KM, T = 10 + (p.gradient || 30) * z;
        let s = "";
        let y = gY;
        for (const [a0, a1, c, nom] of couches) {
          const ep = (a0 - a1) / (AGE0 - AGE1) * 150, e = clamp(gY - SF - (gY - y), 0, ep);
          if (e <= 0) break;
          s += rect(X0, y - e, X1 - X0, e, c);
          if (e > 15) s += txt(X0 + 8, y - e / 2 + 3.5, nom, { petit: true });
          y -= e;
        }
        s += rect(X0, SF - 14, X1 - X0, 14, p.surface ? p.surface[1] : merG.url) + txt(X0 + 8, SF - 4, p.surface ? p.surface[0] : "mer peu profonde", { petit: true, clair: true });
        s += rect(X0, gY, X1 - X0, gH, p.couleurRoche || "#cbb89a");
        for (const [x, v, c] of points) s += circ(x, gY + 2 + v * (gH - 4), 1.1, c);
        s += txt(X0 + 8, gY + gH / 2 + 3.5, p.nomRoche || "la roche");
        s += rect(X0, BAS, X1 - X0, H - BAS, "#7b8074") + txt(X0 + 8, H - 9, p.socle || "roches plus anciennes (socle)", { petit: true, clair: true });
        s += rect(X0, SF - 14, X1 - X0, H - SF + 14, "none", { stroke: "#5f625a", "stroke-width": 1 });
        const RX = 250;
        s += line(RX, SF, RX, BAS + 4, "#27302d", 1);
        for (let k = 0; k * KM <= O + 1; k = Math.round((k + pas) * 100) / 100) {
          const yy = SF + k * KM;
          s += line(RX - 4, yy, RX, yy, "#27302d", 1) + (Math.abs(k * 2 - Math.round(k * 2)) < 1e-6 || pas < 0.5 ? txt(RX + 5, yy + 3.5, k === 0 ? "0" : k < 1 ? `${nombre(k * 1000)} m` : `${dec(k, k % 1 ? 1 : 0)} km`, { petit: true }) : "");
        }
        s += poly([[RX - 1, gY], [RX - 8, gY - 4.5], [RX - 8, gY + 4.5]], "#c0392b");
        s += txt(RX + 36, gY + 3.5, `${z < 1 ? nombre(z * 1000) + " m" : dec(z) + " km"} · ${Math.round(T)} °C`);
        s += compteur(408, 18, lerp(AGE0, AGE1, t), { sous: p.rythme || "" });
        // loupe : la roche elle-même (même schéma que la texture), ses vides se resserrent sous le poids des couches
        const v = lerp(VIDES[0], VIDES[1], t);
        s += L.dans(rect(LX - LR, LY - LR, 2 * LR, 2 * LR, "#f4f1ea") + texDansDisque(tx, LX, LY, LR, ech, texDessin(tx, v, VIDES[0]))) + L.bord;
        s += line(RX - 10, gY, LX - LR * 0.7, LY + LR * 0.7, "rgba(39,48,45,.35)", 0.8, { "stroke-dasharray": "3 2" });
        const lt = p.loupeTexte || ["à la loupe : sous le poids des couches superposées,", "les grains se resserrent et l'eau est expulsée"];
        s += txt(TX, LY + LR + 13, lt[0], { a: "middle", petit: true }) + txt(TX, LY + LR + 23, lt[1], { a: "middle", petit: true })
          + txt(TX, LY + LR + 36, `vides : ${Math.round(v)} %`, { a: "middle" });
        return s;
      },
      curseur: (t) => t,
    };
  };

  // ───────────── 2 bis · remontée par l'érosion, dans la MÊME colonne que l'enfouissement ─────────────
  // Sa règle : « une roche ne prend pas l'ascenseur ». La colonne de l'étape d'enfouissement est reprise telle quelle ; la
  // région se soulève (flèches rouges, `moteur` = la cause écrite) et l'érosion enlève les couches par le haut (pluie,
  // surface continentale) jusqu'à ce que la roche affleure. Réglages : ceux de l'enfouissement (couches, age0 = âge du début
  // de la remontée, zmax), + age1 (fin), moteur, surfaceFin, nomRoche, couleurRoche.
  SCENES.exhumationSed = function (p, roche) {
    const R = alea("ex" + p.graine);
    const X0 = 14, X1 = 236, BAS = 216, gH = 26, gY = BAS - gH;
    const ZMAX = p.zmax ?? 2, KM = 150 / ZMAX;
    const couches = p.couches || [];
    const points = Array.from({ length: 80 }, () => [X0 + R() * (X1 - X0), R(), R() < 0.2 ? (p.grainFonce || "#8a7f70") : (p.grainClair || "#fbf6ea")]);
    const epTot = couches.reduce((a, c) => a + (c[0] - c[1]), 0) || 1;
    return {
      fond: ciel(H) + rect(0, 0, W, H, "rgba(243,241,234,.55)"),
      anim(t, ta) {
        const e = fen(t, 0.05, 0.92), O = lerp(150, 150 * (p.zFin || 0) / ZMAX, e), SF = gY - O, z = O / KM, T = 10 + (p.gradient || 30) * z;
        let s = "";
        // couches restantes, de la plus ancienne (en bas) à la plus jeune ; l'érosion les tronque par le haut
        let y = gY;
        for (const [a0, a1, c, nom] of couches) {
          const epc = (a0 - a1) / epTot * 150, hh = clamp(y - SF, 0, epc);
          if (hh <= 0) break;
          s += rect(X0, y - hh, X1 - X0, hh, c);
          if (hh > 15) s += txt(X0 + 8, y - hh / 2 + 3.5, nom, { petit: true });
          y -= hh;
        }
        s += rect(X0, gY, X1 - X0, gH, p.couleurRoche || "#cbb89a");
        for (const [x, v, c] of points) s += circ(x, gY + 2 + v * (gH - 4), 1.1, c);
        s += txt(X0 + 8, gY + gH / 2 + 3.5, p.nomRoche || "la roche");
        s += rect(X0, BAS, X1 - X0, H - BAS, "#7b8074") + txt(X0 + 8, H - 9, p.socle || "roches plus anciennes (socle)", { petit: true, clair: true });
        // surface continentale : sol, herbe, pluie qui ruisselle et emporte le dessus
        s += rect(X0, SF - 3, X1 - X0, 3, "#6f9d4f");
        s += pluie(X0 + 10, SF - 70, X1 - X0 - 20, 64, ta, 22, "ex1", () => SF - 4) + nuage(80 + 2 * Math.sin(ta * 0.3), SF - 76 > 20 ? SF - 76 : 20, 0.9) + nuage(180 + 2 * Math.sin(ta * 0.25), SF - 70 > 24 ? SF - 70 : 24, 0.8);
        for (let k = 0; k < 6; k++) { const u = (k / 6 + ta * 0.15) % 1; s += circ(X1 - 6 - u * 30, SF - 1.5, 1.2, "#8a7f70", { opacity: op(1 - u) }); }
        s += fleche(X1 + 2, SF - 1.5, X1 + 20, SF + 4, { c: "#5b95c6", sw: 1.4, pointe: 5 }) + txt(X1 + 4, SF - 6, "vers la mer", { petit: true, op: e < 0.95 ? 1 : 0 });
        if (e > 0.9) s += vegetation(() => SF - 2, X0 + 4, X1 - 4, alea("exv"), { op: fen(t, 0.9, 1), pas: 18 });
        s += rect(X0, Math.min(SF - 3, gY), X1 - X0, H - Math.min(SF - 3, gY), "none", { stroke: "#5f625a", "stroke-width": 1 });
        // moteur : la région se soulève
        for (const x of [50, 125, 200]) s += fleche(x, H - 4, x, H - 20, { c: "#c0392b", sw: 2, pointe: 6, op: 0.85 * (1 - fen(t, 0.9, 1)) });
        // règle : profondeur de la roche sous la surface
        const RX = 250, pas = ZMAX <= 0.6 ? 0.1 : ZMAX <= 1.5 ? 0.25 : 0.5;
        s += line(RX, SF, RX, gY + 4, "#27302d", 1);
        for (let k = 0; k * KM <= O + 1; k = Math.round((k + pas) * 100) / 100) {
          const yy = SF + k * KM;
          s += line(RX - 4, yy, RX, yy, "#27302d", 1) + txt(RX + 5, yy + 3.5, k === 0 ? "0" : k < 1 ? `${nombre(k * 1000)} m` : `${dec(k, k % 1 ? 1 : 0)} km`, { petit: true });
        }
        s += poly([[RX - 1, gY], [RX - 8, gY - 4.5], [RX - 8, gY + 4.5]], "#c0392b");
        s += txt(RX + 36, gY + 3.5, z > 0.02 ? `${z < 1 ? nombre(Math.round(z * 100) * 10) + " m" : dec(z) + " km"} · ${Math.round(T)} °C` : "à l'affleurement");
        s += compteur(408, 18, lerp(p.age0 ?? 100, p.age1 ?? 0, e));
        s += bulle(292, 58, (p.moteur || ["la région se soulève lentement ;", "la pluie et les rivières emportent la partie supérieure"]));
        s += txt(8, 14, e < 0.9 ? "le dessus s'érode : la roche se rapproche de la surface" : (p.titreFin || "la roche affleure"));
        if (p.zFin && e > 0.9) s += txt(RX + 36, gY + 16, p.texteFin || "", { petit: true });
        return s;
      },
      curseur: (t) => fen(t, 0.05, 0.92),
    };
  };

  // ───────────── 3 · CONGLOMÉRAT : piémont des Alpes et bassin de Valensole (une seule coupe, ouest à gauche) ─────────────
  // Sources : Planet-Terre (ENS Lyon, 2020) « Les Pénitents des Mées » (cônes de déjection coalescents de la paléo-Durance,
  // de la paléo-Bléone et de la paléo-Asse, galets bien arrondis venus des Alpes, plus de 800 m au sondage des Mées, plateau
  // 400 m au-dessus de la Durance) ; fiche BRGM/Agence de l'eau FRDG209 (bassin d'avant-pays de la collision alpine,
  // subsidence commandée par la faille de la Durance, porosité 1 à 5 %) ; Wikipédia « Plateau de Valensole » (surface
  // sommitale datée à 1,8 Ma). Phases : 0–0,45 érosion, transport, cône ; 0,45–0,7 enfoncement et enfouissement ;
  // 0,7–1 la sédimentation cesse, la Durance creuse, les Pénitents apparaissent. Hauteurs exagérées.
  const PM = { XF: 46, XA: 318, B0: 172, N1: 4, NB: 9, E2: 6, XS: 130, MPX: 7.8 };
  function piemont(p, T0, T1) {
    const R = alea("pm" + p.graine);
    const { XF, XA, B0, N1, NB, E2, MPX } = PM, XS = p.xs || PM.XS;
    const ysurf = (x) => 146 - 10 * clamp((x - XF) / (XA - XF));
    // enfoncement : le long de la faille (à l'ouest) ou, pour un bassin d'avant-pays, par flexion sous le poids de la chaîne
    const w = p.flexure ? (x) => 0.1 + 0.9 * clamp((x - XF) / (XA - XF)) : (x) => 1 - 0.62 * clamp((x - XF) / (XA - XF));
    const ep = (k, x) => k < N1 ? (B0 - ysurf(x)) / N1 : E2 * w(x);
    const NT = N1 + 1 + NB;
    const nDe = (T) => T < 0.15 ? 0 : T < 0.43 ? lerp(0, N1 + 1, (T - 0.15) / 0.28) : T < 0.45 ? N1 + 1 : T < 0.68 ? lerp(N1 + 1, NT, (T - 0.45) / 0.23) : NT;
    const D = (n, x) => Math.max(0, n - N1) * E2 * w(x);
    const baseLit = (k, n, x) => { let y = B0 + D(n, x); for (let j = 0; j < k; j++) y -= ep(j, x); return y; };
    const COUL = ["#c9b595", "#bda988", "#cdbb9c", "#b9a482"];
    // galets posés dans chaque lit (x, hauteur relative, rayon, couleur : calcaire, flysch, roches vertes, granite)
    const GAL = p.galets || ["#d9dcd9", "#ece4d2", "#d9b3a3", "#d9dcd9", "#ece4d2", "#cfc9bd"];   // quartz, calcaire, granite : les galets du schéma de texture
    const GR = p.style === "granite", AG = p.ages4 || [8, 5, 1.8, 0], LB = Object.assign({ ouest: "Provence", faille: "faille de la Durance", moteur: "chevauchement : la chaîne avance", nos: "nos galets" }, p.labels || {});
    const galets = Array.from({ length: NT + 1 }, () => Array.from({ length: 34 }, () => ({ x: XF + 4 + R() * (W - XF), v: 0.2 + R() * 0.6, r: 0.9 + R() * 1.1, c: GAL[Math.floor(R() * GAL.length)] })));
    const cime = [[XA, ysurf(XA)], [330, 128], [340, 120], [352, 104], [362, 98], [374, 80], [386, 74], [398, 60], [410, 52], [420, 58], [432, 42], [444, 48], [455, 34], [467, 44], [480, 40]];
    const chev = (x) => lerp(ysurf(XA), 214, (x - XA) / (W - XA));             // plan de chevauchement sous la chaîne
    const boules = Array.from({ length: 14 }, () => ({ x: XA + 14 + R() * 150, v: R(), r: 3 + R() * 4 }));
    const torrents = [[[446, 58], [432, 76], [414, 92], [392, 108], [366, 122], [340, 134], [XA + 2, ysurf(XA) - 1]],
      [[404, 70], [392, 88], [376, 104], [356, 118], [334, 132], [XA + 2, ysurf(XA) - 1]]];
    const cailloux = Array.from({ length: 26 }, () => ({ ph: R(), r: 1.8 + R() * 1.6, c: GAL[Math.floor(R() * GAL.length)], f: formeGrain(R, 5 + Math.floor(R() * 2)), rot: R() * 6 }));
    const blocs = Array.from({ length: 9 }, () => ({ x: 340 + R() * 110, ph: R(), r: 2 + R() * 2.5, f: formeGrain(R, 5) }));
    const clipSol = nid("pms"), clipM = nid("pmm");
    const tx = texRoche(p._roche);
    const ZL = { x: 214, y: 84, r: 40 };
    const phase = T0 < 0.3 ? 1 : T0 < 0.6 ? 2 : 3;
    return {
      fond: (tx ? tx.defs : "") + ciel(H),
      anim(t, ta) {
        const T = lerp(T0, T1, t), n = nDe(T);
        // vallée creusée par la Durance (phase 3)
        const inc = fen(T, 0.73, 0.96), XV = p.xs ? p.xs - 18 : 112, kV = 1.6;
        const yNos = (nn) => baseLit(N1, nn, XS) - ep(N1, XS) / 2;
        const yFond = lerp(ysurf(XV), baseLit(N1, NT, XV) + 10, inc);
        const sol = (x) => Math.max(ysurf(x), yFond - kV * Math.max(0, Math.abs(x - XV) - 9));
        // surface du moment : toit du lit le plus haut déjà posé (ou fond du bassin), puis la vallée qui l'entaille
        const couvre = (k, x) => { const f = clamp(n - k); return f <= 0 ? 0 : clamp((x - (XA - f * (XA - XF + 18))) / 16); };
        const dessus = (x) => { let y = B0 + D(n, x); for (let k = 0; k < NT; k++) { const c = couvre(k, x); if (c <= 0) break; y = Math.min(y, baseLit(k, n, x) - ep(k, x) * c); } return y; };
        const sols = (x) => x < XF ? 146 : Math.max(dessus(x), sol(x));
        const solPts = []; for (let x = 0; x <= W; x += 3) solPts.push([x, sols(x)]);
        let s = `<clipPath id="${clipSol}"><polygon points="${P(solPts.concat([[W, H], [0, H]]))}"/></clipPath>`;
        s += `<g clip-path="url(#${clipSol})">`;
        // substratum du bassin (molasses marines plus anciennes) et banc repère, décalés par la faille
        const sub = []; for (let x = XF; x <= W; x += 6) sub.push([x, B0 + D(n, x)]);
        s += poly(sub.concat([[W, H], [XF, H]]), "#a59c89");
        const rep = (dy) => { const a = []; for (let x = XF; x <= W; x += 6) a.push([x, B0 + dy + D(n, x)]); return a; };
        s += poly(rep(22).concat(rep(31).reverse()), "#d8d0bd");
        // les lits des cônes, du plus ancien au plus récent ; chacun s'étale depuis l'apex (à droite) vers l'ouest
        for (let k = 0; k < NT; k++) {
          const f = clamp(n - k);
          if (f <= 0) break;
          const front = XA - f * (XA - XF + 18);
          const haut = [], bas = [];
          for (let x = XF; x <= W; x += 4) {
            const b = baseLit(k, n, x), c = couvre(k, x);
            bas.push([x, b]); haut.push([x, b - ep(k, x) * c]);
          }
          const nos = k === N1;
          s += poly(haut.concat(bas.reverse()), nos ? "#d9b27f" : COUL[k % COUL.length], { stroke: "rgba(80,65,45,.35)", "stroke-width": 0.5 });
          for (const g of galets[k]) {
            if (g.x < front + 6) continue;
            const b = baseLit(k, n, g.x), y = b - ep(k, g.x) * g.v;
            s += circ(g.x, y, Math.min(g.r, ep(k, g.x) * 0.35), g.c, { stroke: "rgba(60,50,40,.35)", "stroke-width": 0.4 });
          }
        }
        s += `</g>`;
        // bloc stable à l'ouest (calcaires de Provence) et faille de la Durance
        const xf = (y) => XF + (y - 146) * 0.19;
        let g0 = poly([[0, 146], [XF, 146], [xf(H), H], [0, H]], "#d5cdb9");
        for (let y = 154; y < H; y += 9) g0 += line(0, y, xf(y), y, "rgba(120,105,80,.35)", 0.8);
        g0 += poly([[0, B0 + 22], [xf(B0 + 22), B0 + 22], [xf(B0 + 31), B0 + 31], [0, B0 + 31]], "#e6dfcf");
        s += `<g clip-path="url(#${clipSol})">${g0}</g>`;
        if (!p.flexure) s += line(XF, 146, xf(H), H, "#5a4a3a", 1.6);
        // la chaîne alpine chevauche le bord du bassin ; elle avance un peu (moteur du soulèvement)
        const av = GR ? 0 : 10 * fen(T, 0, 0.7), dy = GR ? -6 * fen(T, 0, 0.7) : -3 * fen(T, 0, 0.7);
        const mont = cime.map(([x, y], i) => [x - av, (GR ? lerp(y, 150, 0.35) : y) + dy]);
        // Alpes : la chaîne chevauche le bassin ; granite : le relief est limité par une faille normale (le bassin s'effondre)
        const chaine = GR ? mont.concat([[W, H], [XA - 26, H]]) : mont.concat([[W, 214 + dy], [XA - av, chev(XA) + dy]]);
        s += `<clipPath id="${clipM}"><polygon points="${P(chaine)}"/></clipPath>` + poly(chaine, GR ? "#cdb6a6" : "#9b9281");
        let pl = "";
        if (GR) { for (let i = 0; i < 160; i++) { const x = XA - 24 + (i * 37) % 180, y = 40 + (i * 53) % 200; pl += circ(x, y, 0.9, i % 3 ? "#e6b39a" : "#3f3229", { opacity: 0.6 }); } for (const b of boules) { const y = hauteur(mont, b.x) + 2 + b.v * 5; pl += ell(b.x, y, b.r * 1.3, b.r, "#dcc9ba", { stroke: "#8f8578", "stroke-width": 0.7 }); } }
        else { for (let k = 0; k < 7; k++) { const a = []; for (let x = XA - 20; x <= W; x += 8) a.push([x - av, 150 + dy - k * 17 + 9 * Math.sin((x + k * 30) / 26) + (x - XA) * 0.28]); pl += pline(a, k % 2 ? "rgba(70,60,50,.35)" : "rgba(235,228,210,.35)", 3); }
          pl += poly([[380, 0], [480, 0], [480, 62], [458, 44], [446, 56], [432, 50], [420, 66], [410, 60], [398, 72], [386, 80], [380, 76]].map(([x, y]) => [x - av, y + dy]), "#f4f7f8"); }
        s += `<g clip-path="url(#${clipM})">${pl}</g>`;
        s += GR ? line(XA, ysurf(XA), XA - 26, H, "#5a4a3a", 1.6) : line(XA - av, chev(XA) + dy, W, 214 + dy, "#5a4a3a", 1.6);
        if (phase < 3) {
          if (GR) { s += fleche(XA - 18, 178, XA - 18, 196, { c: "#c0392b", sw: 2, pointe: 6, op: 0.85 }) + fleche(XA + 12, 196, XA + 12, 178, { c: "#c0392b", sw: 2, pointe: 6, op: 0.85 }); }
          else { s += fleche(468, 206, 436, 196, { c: "#c0392b", sw: 2, pointe: 7, op: 0.85 }); s += fleche(452, 150, 452, 128, { c: "#c0392b", sw: 2, pointe: 7, op: 0.75 }); }
        }
        // torrents et rivière ; blocs qui se détachent, cailloux qui roulent et s'arrondissent
        for (const tr of torrents) s += pline(tr.map(([x, y]) => [x - av * (x > XA ? 1 : 0), y + dy * (x > XA ? 1 : 0)]), "#6d9fc4", 1.5, { opacity: 0.85 });
        const transport = T < 0.72 ? 1 : 1 - fen(T, 0.72, 0.8);
        const riviere = []; for (let x = XA; x >= XF + 2; x -= 6) riviere.push([x, sols(x) - 1.2]);
        const trajet = torrents[0].concat(riviere.slice(1));
        if (transport > 0) {
          s += pline(riviere, "#6d9fc4", 2, { opacity: 0.8 * transport });
          for (const c of cailloux) {
            const u = (c.ph + ta * 0.05) % 1, q = lePlong(trajet, u), rond = clamp((u - 0.12) / 0.6);
            s += poly(c.f(rond, q.x, q.y - c.r * 0.7, c.r, c.rot + ta * 2), c.c, { stroke: "rgba(40,35,30,.45)", "stroke-width": 0.5, opacity: op(transport) });
          }
          for (const b of blocs) {
            const u = (b.ph + ta * 0.09) % 1, x = b.x - av - u * u * 34, y = hauteur(mont, x) - b.r * 0.8;
            s += poly(b.f(0, x, y, b.r, u * 7), "#8c8474", { stroke: "rgba(40,35,30,.4)", "stroke-width": 0.4, opacity: op(transport * Math.min(1, (1 - u) * 4, u * 8)) });
          }
        }
        // météo : orages sur la chaîne ; soleil à la fin
        if (p.sec) s += soleil(300, 34, 10);
        s += grp(nuage(400 + 3 * Math.sin(ta * 0.3), 26, 1.1, true) + pluie(378, 34, 58, 90, ta, 16, "pm1", (x) => hauteur(mont, x)), p.sec ? 0.8 * Math.max(0, Math.sin(ta * 0.9)) : T < 0.9 ? 0.95 : 0.5);
        s += nuage(250 + 4 * Math.sin(ta * 0.25), 20, 0.8);
        // végétation (et lavande) à la fin
        const fin = fen(T, 0.93, 1);
        if (fin > 0) {
          s += vegetation((x) => sol(x), XF + 2, XA - 8, alea("pmv" + p.graine), { op: fin, pas: 22 });
          let lav = ""; for (let x = 170; x < 300; x += 5) lav += line(x, ysurf(x) - 0.6, x + 2.5, ysurf(x) - 0.6, "#8a6fb3", 1.4);
          s += grp(lav, fin) + txt(236, ysurf(236) + 12, "plateau de Valensole", { a: "middle", petit: true, op: fin });
        }
        // la couche suivie
        const nosLa = n > N1 + 0.3;
        if (nosLa) {
          const yN = yNos(n);
          s += circ(XS, yN, 3, "#c0392b", { stroke: "#fff", "stroke-width": 1 });
          if (phase < 3) s += line(XS + 3, yN, XS + 40, yN + 11, "#27302d", 0.8) + txt(XS + 42, yN + 14, LB.nos, { petit: true });
        }
        // vues rapprochées de l'usure d'un caillou (phase 1)
        if (T < 0.45) {
          const zz = p.zooms || [["arraché : anguleux", 0], ["roulé : émoussé", 0.5], ["plus loin : arrondi", 1]];
          const zooms = [[300, 74, 360, 116, zz[0][0], 0.1, zz[0][1]], [214, 74, 236, sols(236) - 2, zz[1][0], 0.17, zz[1][1]], [110, 82, 100, sols(100) - 2, zz[2][0], 0.24, zz[2][1]]];
          const disp = 1 - fen(T, 0.4, 0.44);
          zooms.forEach(([x, y, xv, yv, lab, a, rond]) => {
            const o = fen(T, a, a + 0.03) * disp;
            if (o <= 0) return;
            const L = loupe(x, y, 15, { vers: [xv, yv], rVers: 3 });
            const f = cailloux[3].f;
            s += grp(L.fond + L.dans(poly(f(rond, x, y, 10, 0.4), "#d9d2c1", { stroke: "#5a5248", "stroke-width": 0.8 })) + L.bord + txt(x, y + 27, lab, { a: "middle", petit: true }), o);
          });
        }
        // loupe de la couche enfouie (phase 2) : la vraie texture, vides qui se resserrent
        if (tx && phase === 2) {
          const o = fen(T, 0.5, 0.54);
          const VL = p.videsLoupe || [35, 25], v = lerp(VL[0], VL[1], fen(T, 0.5, 0.68)), L = loupe(ZL.x, ZL.y, ZL.r, { vers: [XS, yNos(n)], rVers: 3 });
          s += grp(L.fond + L.dans(texDansDisque(tx, ZL.x, ZL.y, ZL.r, p.echelleLoupe || 0.38, texDessin(tx, v, VL[0]))) + L.bord
            + txt(ZL.x, ZL.y + ZL.r + 12, `à la loupe : vides ${Math.round(v)} %`, { a: "middle", petit: true }), o);
        }
        // lecture : profondeur de la couche suivie
        if (phase > 1) {
          const prof = Math.max(0, (yNos(n) - ep(N1, XS) / 2 - Math.max(ysurf(XS), sol(XS))) * (p.mpx || MPX));
          const affleure = T > 0.94;
          const z = prof / 1000, temp = 10 + 30 * z;
          s += bulle(p.flexure ? 60 : phase === 2 ? 8 : 150, phase === 2 && !p.flexure ? 22 : 216, [affleure ? `● ${LB.nos} affleurent sur le flanc de la vallée` : `● ${LB.nos} : sous ≈ ${prof >= 1000 ? dec(prof / 1000) + " km" : nombre(Math.round(prof / 10) * 10) + " m"} de dépôts · ≈ ${nombre(temp)} °C`]);
        }
        // Pénitents des Mées, vue rapprochée (phase 3)
        const pe = fen(T, 0.86, 0.92);
        if (pe > 0 && p.penitents !== false) s += grp(penitents(64, 24, 168, 84, R) + line(150, 108, XS + 4, sol(XS + 4) - 2, "#27302d", 0.8, { "stroke-dasharray": "3 2" }), pe);
        // textes
        s += line(XV - 36, 238, XV - 36, 238, "none", 0);
        const TT = p.titres || ["la chaîne alpine progresse et se soulève ; les orages en assurent l'érosion", "torrents et rivières charrient les blocs, qui s'arrondissent en cours de route", "au pied de la chaîne, les galets s'accumulent en cônes, strate après strate",
          "le bassin s'affaisse le long de la faille : les cônes se superposent", "les rivières cessent de déposer et entaillent le substrat", "la Durance a entaillé 400 m : le poudingue affleure"];
        const titre = phase === 1 ? (T < 0.15 ? TT[0] : T < 0.3 ? TT[1] : TT[2]) : phase === 2 ? TT[3] : T < 0.86 ? TT[4] : TT[5];
        s += txt(8, 14, titre);
        if (phase < 3) s += GR ? txt(XA - 4, 236, LB.moteur, { a: "end", petit: true, clair: true }) : txt(398, 232, LB.moteur, { a: "middle", petit: true, clair: true });
        if (phase === 2 && !GR && !p.flexure) s += txt(XF + 12, 232, LB.faille, { petit: true, clair: true, op: fen(T, 0.46, 0.5) });
        if (phase === 2 && !GR && !p.flexure) s += fleche(XF + 20, 180, XF + 20, 196, { c: "#c0392b", sw: 1.8, pointe: 6, op: 0.8 });
        if (phase === 2 && p.flexure) for (const x of [220, 280]) s += fleche(x, 196, x, 214, { c: "#c0392b", sw: 1.8, pointe: 6, op: 0.8 * fen(T, 0.46, 0.5) });
        if (phase === 2 && p.flexure) s += txt(8, 27, "(sous le poids de la chaîne, la plaque se courbe : flèches rouges)", { petit: true, op: fen(T, 0.46, 0.5) });
        if (T > 0.8) s += txt(XV, yFond - 4, LB.riviere || "Durance", { a: "middle", petit: true, op: fen(T, 0.8, 0.84) }) + rect(XV - 8, yFond - 1.5, 16, 2.5, "#5d9cc6");
        s += txt(20, 160, LB.ouest, { petit: true, op: 0.8 });
        s += compteur(412, 14, phase === 1 ? lerp(AG[0], AG[1], T / 0.45) : phase === 2 ? lerp(AG[1], AG[2], (T - 0.45) / 0.27) : lerp(AG[2], AG[3], (T - 0.72) / 0.28));
        return s;
      },
      curseur: (t) => t,
    };
  }
  // les Pénitents des Mées (≈ 100 m) : lames et colonnes de poudingue séparées par des ravins, la Durance au pied
  function penitents(x, y, w, h, R0) {
    const R = alea("pen");
    const k = nid("pen");
    let s = `<clipPath id="${k}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/></clipPath>`;
    s += rect(x - 2, y - 2, w + 4, h + 4, "#fff", { rx: 6 });
    let d = rect(x, y, w, h, "#d6e6ef");
    const base = y + h - 16;
    // colonnes (triangles arrondis) alignées, de plus en plus petites vers l'arrière
    const cols = [];
    for (let i = 0; i < 9; i++) cols.push({ cx: x + 12 + i * (w - 24) / 8 + (R() - 0.5) * 6, hh: h * (0.42 + R() * 0.2), l: 10 + R() * 6 });
    d += poly([[x, base], [x + w, base], [x + w, y + h], [x, y + h]], "#9aa86f");
    for (const c of cols) {
      const pts = [[c.cx - c.l, base], [c.cx - c.l * 0.55, base - c.hh * 0.55], [c.cx - c.l * 0.2, base - c.hh * 0.95], [c.cx, base - c.hh], [c.cx + c.l * 0.25, base - c.hh * 0.9], [c.cx + c.l * 0.6, base - c.hh * 0.5], [c.cx + c.l, base]];
      d += `<path d="${cheminFerme(pts)}" fill="#c8b596" stroke="#8a7658" stroke-width=".7"/>`;
      for (let g = 0; g < 10; g++) { const u = R(), v = R(); d += circ(c.cx + (u - 0.5) * c.l * 1.2 * (1 - v * 0.8), base - v * c.hh * 0.85, 0.8 + R() * 0.8, ["#d9dcd9", "#ece4d2", "#d9b3a3"][g % 3]); }
      for (let g = 1; g < 4; g++) d += line(c.cx - c.l * (1 - g * 0.18) * 0.9, base - c.hh * g * 0.2, c.cx + c.l * (1 - g * 0.18) * 0.9, base - c.hh * g * 0.2, "rgba(110,90,60,.35)", 0.6);
    }
    d += rect(x, y + h - 7, w, 7, "#6aa3c8") + txt(x + w - 6, y + h - 1.5, "Durance", { a: "end", petit: true, clair: true });
    for (let i = 0; i < 5; i++) { const xx = x + 14 + i * 24 + R() * 10; d += ell(xx, base + 3, 3, 3.6, "#5d8a45"); }
    d += rect(x, y, w, 23, "rgba(255,255,255,.85)");
    s += `<g clip-path="url(#${k})">${d}</g>` + rect(x, y, w, h, "none", { rx: 5, stroke: "#27302d", "stroke-width": 1 });
    s += `<text x="${r1(x + 6)}" y="${r1(y + 10)}" class="fa-leg">Pénitents des Mées (≈ 100 m) :</text><text x="${r1(x + 6)}" y="${r1(y + 19)}" class="fa-leg">poudingue entaillé par les eaux de ruissellement</text>`;
    return s;
  }
  SCENES.piemontCone = (p, roche) => piemont(Object.assign({ _roche: roche }, p), 0, 0.45);
  SCENES.piemontEnfouissement = (p, roche) => piemont(Object.assign({ _roche: roche }, p), 0.45, 0.72);
  SCENES.piemontIncision = (p, roche) => piemont(Object.assign({ _roche: roche }, p), 0.72, 1);

  // ───────────── 4 · BRÈCHE : un pli de calcaire se soulève, ses falaises s'écroulent, l'éboulis se cimente ─────────────
  // Brèche du Tholonet (pied de la Sainte-Victoire) : relief né à la fin du Crétacé, fragments très anguleux (trajet très
  // court), eaux chargées de calcaire et d'argile qui cimentent l'éboulis en « béton naturel ». Phases : 0–0,5 le relief
  // monte, les blocs tombent et s'entassent au pied (talus à ≈ 35°) ; 0,5–1 l'éboulis grandit, l'eau s'infiltre et le soude.
  function eboulisPli(p, T0, T1) {
    const R = alea("eb" + p.graine), roche = p._roche, tx = texRoche(roche);
    const SOL = 190, XC = 194, PENTE = 1.45;                         // pied de la falaise, talus à ≈ 35° (tan = 1 / 1,45)
    const G = [[-10, 0.6], [20, 0.74], [50, 0.86], [80, 0.95], [110, 1], [140, 0.99], [160, 0.95], [176, 0.9], [184, 0.86], [190, 0.45], [196, 0.06], [204, 0]];
    const Gl = [[-10, 0.6], [20, 0.74], [50, 0.86], [80, 0.95], [110, 1], [140, 0.99], [170, 0.93], [200, 0.84], [240, 0.72], [280, 0.6]];
    const blocsT = Array.from({ length: 520 }, () => ({ u: R(), v: R(), r: 1.4 + R() ** 2 * 4.6, f: formeGrain(R, 4 + Math.floor(R() * 3), 0.8), c: ["#d9d3c3", "#cbc3af", "#e4dccb", "#bfb49c"][Math.floor(R() * 4)], rot: R() * 6 }));
    const chutes = Array.from({ length: 10 }, () => ({ ph: R(), yh: R(), d: R(), r: 2.6 + R() * 3.4, f: formeGrain(R, 5, 0.8) }));
    const gouttes = Array.from({ length: 22 }, () => ({ ph: R(), u: R() }));
    const clipR = nid("ebr"), clipT = nid("ebt");
    const phase = T0 < 0.3 ? 1 : 2;
    return {
      fond: (tx ? tx.defs : "") + ciel(H, "#bcd8ea", "#f2f1e8"),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        const A = p.froid ? 136 : 136 * lerp(0.5, 1, fen(T, 0, 0.45)) * (1 + 0.05 * fen(T, 0.5, 1));
        const relief = (x) => SOL - A * hauteur(G, x);
        const hT = 60 * fen(T, 0.1, 0.5) + 26 * fen(T, 0.5, 0.95);   // hauteur du talus
        const talus = (x) => x < XC - 8 ? SOL : Math.min(SOL, SOL - hT + (x - (XC - 8)) / PENTE);
        let s = "";
        // plaine au pied : sol rouge (climat chaud de la fin du Crétacé)
        s += rect(0, SOL, W, H - SOL, "#b9ad96") + rect(0, SOL, W, 7, p.froid ? "#8f8a78" : "#b86b4b") + (phase === 1 && !p.froid ? txt(W - 8, SOL + 17, "sols rouges de la plaine", { a: "end", petit: true, clair: true }) : "");
        for (let y = SOL + 16; y < H; y += 10) s += line(0, y, W, y, "rgba(110,95,70,.3)", 0.8);
        // le relief plissé : couches de calcaire parallèles au pli, coupées par la falaise
        const rel = []; for (let x = -10; x <= 206; x += 3) rel.push([x, relief(x)]);
        const relPoly = rel.concat([[206, H], [-10, H]]);
        s += `<clipPath id="${clipR}"><polygon points="${P(relPoly)}"/></clipPath>` + poly(relPoly, "#d8d1bf");
        let st = "";
        for (let k = 0; k < 14; k++) { const a = []; for (let x = -10; x <= 280; x += 5) a.push([x, SOL + 40 - A * hauteur(Gl, x) + k * 11 - 18]); st += pline(a, k % 3 === 0 ? "rgba(120,105,80,.55)" : "rgba(150,135,110,.35)", k % 3 === 0 ? 1.4 : 0.8); }
        for (let k = 0; k < 18; k++) { const x = 20 + k * 10; st += line(x, relief(x) + 4, x + 2, relief(x) + 12, "rgba(120,105,80,.3)", 0.7); }
        s += `<g clip-path="url(#${clipR})">${st}</g>`;
        s += vegetation(relief, 0, 176, alea("ebv"), { pas: 18, coniferes: 0.1 });
        // le talus d'éboulis : blocs anguleux de toutes tailles, entassés sans tri
        if (hT > 1) {
          const tal = [[XC - 8, SOL - hT], [XC - 8 + hT * PENTE, SOL], [XC - 8, SOL]];
          s += `<clipPath id="${clipT}"><polygon points="${P(tal)}"/></clipPath>` + poly(tal, "#cfc5ae");
          let b = "";
          for (const q of blocsT) {
            const x = XC - 8 + q.u * 86 * PENTE, y = SOL - q.v * 86;
            if (y < talus(x) - 0.5) continue;
            b += poly(q.f(0, x, y, q.r, q.rot), q.c, { stroke: "rgba(70,60,45,.55)", "stroke-width": 0.5 });
          }
          // l'eau qui s'infiltre (phase 2) : gouttes qui descendent entre les blocs, argile rouge qui gagne les vides
          if (phase === 2) {
            b += rect(XC - 10, SOL - 100, 140, 100, "#b57a58", { opacity: op(0.35 * fen(T, 0.55, 0.95)) });
            for (const g of gouttes) { const u = (g.ph + ta * 0.35) % 1, x = XC - 4 + g.u * hT * PENTE * 0.9, y0 = talus(x); b += line(x, y0 + u * (SOL - y0), x, y0 + u * (SOL - y0) + 3, "#4f8fc4", 1.1, { opacity: op(Math.min(1, (1 - u) * 5) * 0.9) }); }
          }
          s += `<g clip-path="url(#${clipT})">${b}</g>`;
          s += pline([[XC - 8, SOL - hT], [XC - 8 + hT * PENTE, SOL]], "rgba(70,60,45,.5)", 0.8);
        }
        // blocs qui se détachent de la falaise et roulent sur le talus (les plus gros vont le plus loin)
        const chute = T < 0.5 ? 1 : 1 - 0.6 * fen(T, 0.5, 0.7);
        for (const c of chutes) {
          const u = (c.ph + ta * 0.2) % 1, y0 = relief(186) + c.yh * (SOL - relief(186) - hT - 10);
          const xd = XC - 8 + (hT + 6) * PENTE * (0.3 + 0.7 * clamp(c.r / 5)) * (0.6 + 0.4 * c.d);
          let x, y;
          if (u < 0.3) { const v = u / 0.3; x = 188 + v * 8; y = y0 + v * v * (talus(196) - y0); }
          else { const v = clamp((u - 0.3) / 0.35); x = lerp(196, xd, v); y = talus(x) - c.r * 0.7; }
          s += poly(c.f(0, x, y, c.r, u * 9), "#cbc3af", { stroke: "rgba(60,50,40,.6)", "stroke-width": 0.6, opacity: op(chute * Math.min(1, u * 12, (1 - u) * 4)) });
        }
        // compression : le pli se forme et se soulève
        if (T < 0.55 && !p.froid) {
          const o = 1 - fen(T, 0.45, 0.55);
          s += fleche(4, 226, 40, 226, { c: "#c0392b", sw: 2.2, pointe: 7, op: 0.85 * o }) + fleche(300, 226, 264, 226, { c: "#c0392b", sw: 2.2, pointe: 7, op: 0.85 * o });
          s += fleche(110, 222, 110, 202, { c: "#c0392b", sw: 2, pointe: 7, op: 0.75 * o });
          s += txt(152, 236, "compression : les couches se plissent", { a: "middle", petit: true, clair: true, op: o });
        }
        // météo : orages de saison chaude
        const gel = Math.sin(ta * 1.2) > 0;
        if (p.froid) {
          // cycles de gel et de dégel : l'eau des fissures gèle la nuit (bleu) et gonfle, le bloc se détache au dégel
          for (let k = 0; k < 5; k++) { const y = relief(188) + 10 + k * 20; s += pline([[178, y], [184, y + 3], [188, y + 1]], gel ? "#9fd0ea" : "#6d5c48", 1.8); }
          s += grp(rect(0, 0, W, H, "#1c2a44"), gel ? 0.18 : 0) + (gel ? circ(430, 36, 7, "#eef3f5") : soleil(430, 40, 9));
          s += txt(8, 27, gel ? "la nuit, l'eau gèle dans les fissures et gonfle d'environ 9 %" : "au fil de la journée, la glace fond et les fragments détachés chutent", { petit: true });
        } else {
          s += grp(nuage(120 + 3 * Math.sin(ta * 0.3), 30, 1, true) + pluie(96, 38, 60, 120, ta, 14, "eb1", relief), 0.9);
          s += soleil(446, 50, 10);
        }
        // repère : nos fragments (au bas du talus, les premiers tombés)
        const XN = XC + 16, YN = SOL - 12;
        if (hT > 20) s += circ(XN, YN, 2.8, "#c0392b", { stroke: "#fff", "stroke-width": 1 });
        // loupe : la brèche elle-même (même schéma que la texture) ; vides en bleu, qui se comblent en phase 2
        if (tx && T > 0.3) {
          const o = fen(T, 0.3, 0.35), v = phase === 1 ? 35 : lerp(35, 6, fen(T, 0.55, 0.95));
          const L = loupe(388, 96, 46, { vers: [XN, YN], rVers: 3 });
          s += grp(L.fond + L.dans(texDansDisque(tx, 388, 96, 46, 0.42, texDessin(tx, v, 35))) + L.bord
            + txt(388, 154, phase === 1 ? "anguleux, pas triés, pleins de vides" : "l'argile et la calcite remplissent les vides", { a: "middle", petit: true })
            + txt(388, 165, `vides : ${Math.round(v)} %`, { a: "middle", petit: true }), o);
        }
        // textes
        const titre = p.froid ? "sous climat froid, la falaise se débite en fragments qui s'entassent à son pied" : phase === 1 ? (T < 0.2 ? "compression : une couche de calcaire se plisse et se soulève"
          : "de la falaise, des blocs tombent et ne roulent que sur une courte distance")
          : T < 0.75 ? "l'éboulis s'épaissit ; l'eau de pluie s'y infiltre" : "elle cimente les blocs, qui deviennent une brèche, chargée de calcaire et d'argile";
        s += txt(8, 14, titre);
        if (hT > 30) s += txt(XC - 8 + hT * PENTE * 0.62, SOL - 5, phase === 1 ? "éboulis (meuble)" : T < 0.8 ? "éboulis" : "brèche (cimentée)", { a: "middle", petit: true, clair: true });
        if (phase === 2) s += bulle(232, 204, ["tant qu'il reste meuble, il s'agit d'un éboulis ;", "une fois cimenté, il devient roche : c'est une brèche"], { op: fen(T, 0.6, 0.66) });
        s += compteur(410, 16, phase === 1 ? lerp(72, 67, T / 0.5) : lerp(67, 62, (T - 0.5) / 0.5), { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.eboulisChute = (p, roche) => eboulisPli(Object.assign({ _roche: roche }, p), 0, 0.5);
  SCENES.eboulisCimentation = (p, roche) => eboulisPli(Object.assign({ _roche: roche }, p), 0.5, 1);

  // ───────────── 5 · TILLITE : l'inlandsis du Ghaub (Namibie, 635 Ma) et son bourrelet de moraine ─────────────
  // D'après Domack et Hoffman (2011) : la glace, posée sur la plate-forme carbonatée d'Otavi, avance jusqu'au bas de son
  // talus ; là où elle se met à flotter (ligne d'échouage), elle lâche un bourrelet de moraine ; sous la glace flottante,
  // des blocs tombent dans la boue. À la déglaciation, la mer remonte et des calcaires (Maieberg) recouvrent la moraine.
  // Phases : 0–0,5 la glace avance et érode ; 0,5–1 elle fond, la mer monte, les calcaires se déposent.
  function inlandsis(p, T0, T1) {
    const R = alea("in" + p.graine), roche = p._roche, tx = texRoche(roche);
    const roc = (x) => x < 250 ? 150 + x * 0.02 + 1.5 * Math.sin(x / 23) : x < 430 ? 155 + (x - 250) * 0.36 : 220 + (x - 430) * 0.05;
    const XG = 386;                                                    // ligne d'échouage (la glace se met à flotter)
    const blocs = Array.from({ length: 70 }, () => ({ u: R(), v: R(), r: 0.8 + R() ** 2 * 3.2, c: ["#d9dcd9", "#e3dcd0", "#ece4d2", "#8f877a"][Math.floor(R() * 4)], f: formeGrain(R, 5) }));
    const tombes = Array.from({ length: 9 }, () => ({ x: XG + 10 + R() * 80, ph: R(), r: 1.2 + R() * 1.8 }));
    const clipG = nid("ing"), clipB = nid("inb");
    const phase = T0 < 0.3 ? 1 : 2;
    return {
      fond: tx ? tx.defs : "",
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        const fonte = fen(T, 0.52, 0.86), mer = lerp(176, 104, fen(T, 0.55, 0.92));
        const chaud = fen(T, 0.6, 0.95);
        let s = ciel(H, melange("#cfdbe3", "#b9d6e8", chaud), melange("#f1f4f6", "#edf4f7", chaud));
        // mer (niveau bas pendant la glaciation, qui remonte à la fonte)
        s += rect(0, mer, W, H - mer, melange("#9fb8c6", "#6fa6c9", chaud));
        // socle et plate-forme carbonatée d'Otavi (dolomies litées)
        const rocP = []; for (let x = 0; x <= W; x += 4) rocP.push([x, roc(x)]);
        s += `<clipPath id="${clipB}"><polygon points="${P(rocP.concat([[W, H], [0, H]]))}"/></clipPath>` + poly(rocP.concat([[W, H], [0, H]]), "#cdc7ba");
        let li = ""; for (let k = 1; k < 10; k++) li += pline(rocP.map(([x, y]) => [x, y + k * 8 + (x > 250 ? (x - 250) * 0.05 * k * 0.2 : 0)]), "rgba(120,110,95,.35)", 0.8);
        li += rect(0, 212, W, 30, "#b79f94") + txt(8, 232, "socle cristallin", { petit: true, clair: true });
        s += `<g clip-path="url(#${clipB})">${li}</g>` + txt(12, 176, "plate-forme faite de calcaires et de dolomies (groupe d'Otavi)", { petit: true, op: 1 - fen(T, 0.8, 0.9) * 0 });
        // la moraine : bourrelet à la ligne d'échouage + placage sur la plate-forme laissé par le recul
        const bour = fen(T, 0.25, 0.9), plac = fen(T, 0.55, 0.9);
        const mor = (x) => { const b = 18 * bour * Math.exp(-(((x - XG + 8) / 26) ** 2)), pl = x < XG ? 4 * plac : 0; return Math.max(b, pl); };
        const morP = []; for (let x = 0; x <= W; x += 3) morP.push([x, roc(x) - mor(x)]);
        s += poly(morP.concat(rocP.slice().reverse()), "#9a978c");
        for (const b of blocs) { const x = b.u * 470, e = mor(x); if (e < 2) continue; const y = roc(x) - e * (0.2 + 0.6 * b.v); s += poly(b.f(0, x, y, Math.min(b.r, e * 0.4), b.u * 9), b.c, { stroke: "rgba(40,40,35,.4)", "stroke-width": 0.35 }); }
        // calcaires de fin de glaciation (après la fonte)
        const cap = 5 * fen(T, 0.84, 1);
        if (cap > 0.2) { const capP = morP.map(([x, y]) => [x, y - (y > mer + 2 ? cap : 0)]); s += poly(capP.concat(morP.slice().reverse()), "#e8d7c3"); }
        // l'inlandsis : il avance (phase 1), puis s'amincit et recule (phase 2) ; au-delà de la ligne d'échouage, il flotte
        const front = lerp(XG, -60, fonte), eps = lerp(1, 0.25, fonte);
        // surface de la glace posée : dôme qui descend jusqu'au niveau de la plate-forme flottante à la ligne d'échouage
        const hGlace = (x) => { const u = clamp(x / Math.max(1, front)); return lerp(28, mer - 7, Math.pow(u, 2.2)) * eps + (1 - eps) * (roc(x) - 6); };
        if (front > -40) {
          const glace = []; for (let x = 0; x <= Math.max(0, front); x += 4) glace.push([x, Math.min(hGlace(x), roc(x) - 3)]);
          const flotte = phase === 1 ? [[XG - 2, mer - 7], [W, mer - 7], [W, mer + 22], [XG + 30, mer + 22], [XG, roc(XG) - 1]] : null;
          const gP = glace.concat([[Math.max(0, front), roc(Math.max(0, front))]]).concat(glace.slice().reverse().map(([x]) => [x, roc(x)]));
          s += `<clipPath id="${clipG}"><polygon points="${P(gP)}"/></clipPath>` + poly(gP, "#e8f2f6", { stroke: "#a9c3cf", "stroke-width": 1 });
          if (flotte) s += poly(flotte, "#dbe9ef", { stroke: "#a9c3cf", "stroke-width": 1 });
          // écoulement : lignes qui défilent vers le bord, débris à la base
          let ec = "";
          for (let k = 0; k < 5; k++) { const a = []; for (let x = 0; x <= front; x += 8) a.push([x, lerp(roc(x) - 6, Math.min(hGlace(x), roc(x) - 3), 0.2 + k * 0.15)]); ec += pline(a, "rgba(120,160,180,.45)", 0.8, { "stroke-dasharray": "6 5", "stroke-dashoffset": r1(-ta * 10 * eps) }); }
          for (let i = 0; i < 40; i++) { const x = ((i * 37 + ta * 6) % Math.max(10, front)), y = roc(x) - 2 - (i % 4) * 1.6; ec += circ(x, y, 0.8 + (i % 3) * 0.5, i % 4 ? "#8f877a" : "#6f685e"); }
          s += `<g clip-path="url(#${clipG})">${ec}</g>`;
          if (phase === 1) for (let k = 0; k < 3; k++) s += fleche(70 + k * 100, roc(70 + k * 100) - 40 + k * 10, 110 + k * 100, roc(110 + k * 100) - 34 + k * 10, { c: "#5c7f93", sw: 1.6, pointe: 6, op: 0.65 });
        }
        // icebergs à la dérive et blocs qui tombent dans la boue
        if (phase === 1 || fonte < 1) {
          const o = phase === 1 ? 1 : 1 - fen(T, 0.6, 0.8);
          for (const b of tombes) { const u = (b.ph + ta * 0.12) % 1, y0 = mer + 14, y = lerp(y0, roc(b.x) - 2, u); s += poly(blocs[3].f(0, b.x, y, b.r, u * 4), "#8f877a", { opacity: op(o * Math.min(1, (1 - u) * 6, u * 10)) }); }
          if (phase === 2) for (let i = 0; i < 3; i++) { const x = 300 + i * 60 + 20 * fen(T, 0.5, 0.8); s += poly([[x - 16, mer - 6], [x - 4, mer - 12], [x + 14, mer - 5], [x + 18, mer + 10], [x - 14, mer + 12]], "#e6f0f4", { stroke: "#a9c3cf", "stroke-width": 0.8, opacity: op(o) }); }
        }
        // loupe de la base de la glace (phase 1) : un bloc traîné sur la roche la raye et se raye lui-même ; farine de roche
        if (phase === 1 && T > 0.12 && T < 0.44) {
          const o = fen(T, 0.12, 0.16) * (1 - fen(T, 0.4, 0.44));
          const L = loupe(262, 70, 42, { vers: [200, roc(200) - 3], rVers: 3 });
          // la glace (en haut) glisse vers la droite et traîne un bloc sur la roche (en bas) : rayures des deux côtés
          let d = rect(220, 28, 84, 52, "#e8f2f6") + rect(220, 80, 84, 36, "#cdc7ba") + line(220, 80, 304, 80, "#8a8272", 1);
          for (let k = 0; k < 9; k++) { const x0 = 220 + ((k * 11 + ta * 5) % 90); d += line(x0, 82 + (k % 4) * 2.2, x0 + 9 + (k % 3) * 4, 82 + (k % 4) * 2.2, "#7d7566", 0.7); }
          for (let k = 0; k < 4; k++) d += line(222, 40 + k * 9, 304, 40 + k * 9, "rgba(120,160,180,.35)", 0.7, { "stroke-dasharray": "5 4", "stroke-dashoffset": r1(-ta * 12) });
          const bx = 250 + ((ta * 5) % 30);
          for (let i = 0; i < 22; i++) { const u = (i * 0.137 + ta * 0.2) % 1; d += circ(bx - 12 - u * 30, 77 + (i % 4), 0.7, "#a39c8e", { opacity: op(1 - u) }); }
          d += poly(blocs[5].f(0.15, bx, 70, 14, 0.2), "#b5ab9a", { stroke: "#5a5248", "stroke-width": 0.9 });
          for (let k = 0; k < 5; k++) d += line(bx - 11, 70 + k * 2.2, bx + 11, 71 + k * 2.2, "rgba(255,255,255,.8)", 0.6);
          d += fleche(226, 34, 250, 34, { c: "#5c7f93", sw: 1.3, pointe: 5 });
          s += grp(L.fond + L.dans(d) + L.bord + txt(262, 124, "à la base : le bloc rabote la roche", { a: "middle", petit: true }) + txt(262, 134, "et se raye (stries) ; la poussière forme une farine", { a: "middle", petit: true }), o);
        }
        // loupe de la moraine (fin de phase 1 et phase 2) : la tillite future, non triée, gorgée d'eau
        const XN = XG - 8, YN = roc(XN) - 6 * bour;
        if (bour > 0.5) s += circ(XN, YN, 2.6, "#c0392b", { stroke: "#fff", "stroke-width": 1 });
        if (tx && T > 0.45) {
          const o = fen(T, 0.45, 0.5);
          const L = loupe(118, 84, 40, { vers: [XN, YN], rVers: 3 });
          s += grp(L.fond + L.dans(texDansDisque(tx, 118, 84, 40, 0.45, texDessin(tx, 32, 32))) + L.bord
            + txt(118, 136, "la moraine : blocs, sable et farine glaciaire", { a: "middle", petit: true }) + txt(118, 146, "mêlés, sans aucun tri", { a: "middle", petit: true }), o);
        }
        if (cap > 1) s += txt(300, roc(300) - mor(300) - cap - 5, "calcaires de fin de glaciation", { a: "middle", petit: true });
        if (bour > 0.4 && phase === 1) s += txt(XG + 6, roc(XG) + 14, "moraine", { petit: true, clair: true });
        if (phase === 1) s += txt(XG + 22, mer - 16, "la glace flotte", { petit: true });
        const titre = phase === 1 ? (T < 0.14 ? "la Terre est presque entièrement gelée : la glace avance sur la plate-forme"
          : T < 0.4 ? "à sa base, elle arrache des blocs, les traîne et broie la roche en farine"
            : "dès qu'elle flotte, elle lâche tout en vrac : une moraine")
          : T < 0.8 ? "le climat bascule : la glace fond et recule, la mer remonte" : "des calcaires d'eau chaude se déposent sur la moraine noyée";
        s += txt(8, 14, titre);
        if (phase === 2 && chaud > 0.3) s += soleil(446, 50, 10 * chaud);
        s += compteur(412, phase === 1 ? 32 : 32, phase === 1 ? lerp(645, 636, T / 0.5) : lerp(636, 635, (T - 0.5) / 0.5));
        return s;
      },
    };
  }
  SCENES.inlandsisAvance = (p, roche) => inlandsis(Object.assign({ _roche: roche }, p), 0, 0.5);
  SCENES.inlandsisFonte = (p, roche) => inlandsis(Object.assign({ _roche: roche }, p), 0.5, 1);

  // ───────────── 5 bis · un glacier sur la terre ferme : le lobe du Rhône au Würm (moraine, lœss) ─────────────
  // Même logique que l'inlandsis, sans la mer : la glace descend des Alpes (à gauche) sur la plaine, arrache et broie à sa
  // base, pousse devant elle un bourrelet (moraine frontale) ; au-delà, les eaux de fonte étalent graviers et limons (plaine
  // d'épandage, nue). Phase 2 : la glace fond et recule par à-coups, chaque arrêt laisse un arc de moraine ; un lac occupe le
  // creux ; blocs erratiques. p.loess : le vent balaie la plaine nue et emporte les limons.
  function glacierTerre(p, T0, T1) {
    const R = alea("gt" + p.graine), roche = p._roche, tx = texRoche(roche);
    const sol = (x) => x < 120 ? 60 + x * 0.55 + 6 * Math.sin(x / 15) : 126 + (x - 120) * 0.12 + 1.5 * Math.sin(x / 31);
    const XF = 330;
    const blocs = Array.from({ length: 60 }, () => ({ u: R(), v: R(), r: 0.8 + R() ** 2 * 3, c: ["#d9dcd9", "#e3dcd0", "#ece4d2", "#8f877a"][Math.floor(R() * 4)], f: formeGrain(R, 5) }));
    const poussiere = Array.from({ length: 50 }, () => ({ ph: R(), y: R(), h: 6 + R() * 26 }));
    const clipG = nid("gtg");
    const phase = T0 < 0.3 ? 1 : 2;
    return {
      fond: (tx ? tx.defs : "") + ciel(H, "#cddbe3", "#f0f3f5"),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        let s = "";
        // les Alpes au loin, puis le sol
        s += poly([[0, 70], [30, 26], [58, 48], [86, 16], [120, 54], [150, 90], [0, 110]], "#b9c2c8", { opacity: 0.8 }) + poly([[22, 36], [30, 26], [38, 34]], "#f4f8fa") + poly([[78, 26], [86, 16], [95, 26]], "#f4f8fa");
        const solP = []; for (let x = 0; x <= W; x += 4) solP.push([x, sol(x)]);
        s += poly(solP.concat([[W, H], [0, H]]), "#9a927f");
        for (let k = 1; k < 8; k++) s += pline(solP.map(([x, y]) => [x, y + k * 12]), "rgba(80,70,55,.25)", 0.7);
        // front : il avance (phase 1) puis recule par à-coups (phase 2)
        const recul = fen(T, 0.52, 0.95), arrets = [XF, 270, 210];
        const front = phase === 1 ? lerp(200, XF, fen(T, 0, 0.3)) : lerp(XF, 120, recul);
        const eps = phase === 1 ? 1 : lerp(1, 0.35, recul);
        // moraines frontales : une à chaque arrêt du front
        const mor = (x) => { let e = 0; arrets.forEach((xa, i) => { const deja = phase === 1 ? (i === 0 ? fen(T, 0.2, 0.5) : 0) : (i === 0 ? 1 : clamp((xa - front) / 20 + 0.2) * (front < xa + 5 ? 1 : 0)); e = Math.max(e, (12 - i * 3) * deja * Math.exp(-(((x - xa - 6) / 14) ** 2))); }); return e + (phase === 2 && x < XF && x > front ? 2.5 : 0); };
        const morP = []; for (let x = 0; x <= W; x += 3) morP.push([x, sol(x) - mor(x)]);
        s += poly(morP.concat(solP.slice().reverse()), "#a8a294");
        for (const b of blocs) { const x = 110 + b.u * 300, e = mor(x); if (e < 2) continue; s += poly(b.f(0, x, sol(x) - e * (0.2 + 0.6 * b.v), Math.min(b.r, e * 0.4), b.u * 9), b.c, { stroke: "rgba(40,40,35,.4)", "stroke-width": 0.35 }); }
        // lac entre la moraine et la glace qui recule (phase 2)
        // lac retenu par la moraine frontale : surface HORIZONTALE au niveau de la crête, jusqu'où le sol remonte
        if (phase === 2 && front < XF - 20) {
          const niveau = sol(XF + 6) - mor(XF + 6) * 0.8, lac = [];
          for (let x = Math.max(front, 0); x <= XF + 4; x += 2) if (sol(x) - mor(x) > niveau) lac.push([x, sol(x) - mor(x)]);
          if (lac.length > 2) s += poly([[lac[0][0], niveau]].concat(lac, [[lac[lac.length - 1][0], niveau]]), "#7fb3d2", { opacity: 0.9 * fen(T, 0.62, 0.7) });
        }
        // plaine d'épandage : les eaux de fonte y étalent graviers et limons ; rivières en tresses
        for (let k = 0; k < 3; k++) s += pline(Array.from({ length: 30 }, (_, i) => { const x = XF + 14 + i * 5; return [x, sol(x) - 0.8 + Math.sin(i * 0.9 + k * 2) * 0.8]; }), "#7fb6d6", 1.3, { opacity: 0.8 });
        // la glace
        if (front > 10) {
          const gl = []; for (let x = 0; x <= front; x += 4) gl.push([x, sol(x) - 4 - (sol(x) - 20) * 0.55 * eps * Math.pow(clamp(1 - x / (front + 30)), 0.5) - 6 * eps]);
          const gP = gl.concat([[front, sol(front)]]).concat(gl.slice().reverse().map(([x]) => [x, sol(x)]));
          s += `<clipPath id="${clipG}"><polygon points="${P(gP)}"/></clipPath>` + poly(gP, "#e8f2f6", { stroke: "#a9c3cf", "stroke-width": 1 });
          let ec = ""; for (let i = 0; i < 36; i++) { const x = (i * 37 + ta * 6) % Math.max(10, front), y = sol(x) - 2 - (i % 4) * 1.6; ec += circ(x, y, 0.8 + (i % 3) * 0.5, i % 4 ? "#8f877a" : "#6f685e"); }
          for (let k = 0; k < 4; k++) { const a = []; for (let x = 0; x <= front; x += 8) a.push([x, sol(x) - 5 - k * 6 * eps]); ec += pline(a, "rgba(120,160,180,.45)", 0.8, { "stroke-dasharray": "6 5", "stroke-dashoffset": r1(-ta * 10 * eps) }); }
          s += `<g clip-path="url(#${clipG})">${ec}</g>`;
          if (phase === 1) for (let k = 0; k < 3; k++) s += fleche(40 + k * 80, sol(40 + k * 80) - 22, 76 + k * 80, sol(76 + k * 80) - 20, { c: "#5c7f93", sw: 1.6, pointe: 6, op: 0.65 });
        }
        // vent (lœss) : il soulève les limons de la plaine nue et les emporte au loin
        if (p.loess && phase === 2) for (const q of poussiere) { const u = (q.ph + ta * 0.3) % 1, x = XF + 10 + u * 160, y = sol(x) - 4 - q.h * Math.sin(u * Math.PI) * (0.4 + q.y); s += circ(x, y, 0.8, "#b9a57e", { opacity: op(Math.sin(u * Math.PI)) }); }
        if (p.loess && phase === 2) s += fleche(250, 62, 320, 62, { sw: 2.2, pointe: 7 }) + txt(326, 66, "vent", { petit: true });
        // loupes : base de la glace (phase 1), la moraine (vraie texture)
        const XN = XF + 4, YN = sol(XN) - mor(XN) * 0.5;
        if (phase === 1 && T > 0.08 && T < 0.4) {
          const o = fen(T, 0.08, 0.12) * (1 - fen(T, 0.36, 0.4)), L = loupe(250, 60, 36, { vers: [150, sol(150) - 3], rVers: 3 });
          let d = rect(214, 24, 72, 40, "#e8f2f6") + rect(214, 64, 72, 36, "#9a927f") + line(214, 64, 286, 64, "#6d6555", 1);
          for (let k = 0; k < 8; k++) { const x0 = 214 + ((k * 11 + ta * 5) % 76); d += line(x0, 66 + (k % 4) * 2, x0 + 8, 66 + (k % 4) * 2, "#6d6555", 0.7); }
          const bx = 240 + ((ta * 5) % 24); d += poly(blocs[5].f(0.15, bx, 55, 12, 0.2), "#b5ab9a", { stroke: "#5a5248", "stroke-width": 0.9 });
          for (let k = 0; k < 4; k++) d += line(bx - 9, 55 + k * 2.2, bx + 9, 56 + k * 2.2, "rgba(255,255,255,.8)", 0.6);
          s += grp(L.fond + L.dans(d) + L.bord + txt(250, 106, "à la base : blocs charriés, roche striée,", { a: "middle", petit: true }) + txt(250, 115, "poussière de roche (farine)", { a: "middle", petit: true }), o);
        }
        if (tx && (phase === 2 || T > 0.4)) {
          s += circ(XN, YN, 2.6, "#c0392b", { stroke: "#fff", "stroke-width": 1 });
          const o = fen(T, 0.4, 0.46), L = loupe(410, 80, 36, { vers: [XN, YN], rVers: 3 });
          s += grp(L.fond + L.dans(texDansDisque(tx, 410, 80, 36, p.echelleLoupe || 0.4, texDessin(tx, 30, 30))) + L.bord + txt(410, 126, p.texteLoupe || "la moraine : matériaux mêlés, sans tri", { a: "middle", petit: true }), o);
        }
        if (phase === 2 && T > 0.7) s += txt(215, sol(215) + 16, "arcs de moraines", { a: "middle", petit: true, clair: true });
        if (phase === 1 && T > 0.3) s += txt(XF + 6, sol(XF) + 16, "moraine frontale", { a: "middle", petit: true, clair: true });
        s += txt(400, sol(400) + 16, "plaine d'épandage", { a: "middle", petit: true, clair: true });
        const TT = p.titres || ["un glacier issu des Alpes gagne la plaine", "à sa base, il déchausse des blocs et pulvérise la roche", "il refoule devant lui un bourrelet de débris hétérogènes", "le réchauffement fait fondre le glacier, qui recule par paliers", "à chaque arrêt, un arc morainique ; un lac occupe la dépression"];
        s += txt(8, 14, phase === 1 ? (T < 0.1 ? TT[0] : T < 0.3 ? TT[1] : TT[2]) : T < 0.75 ? TT[3] : TT[4]);
        s += compteur(412, 30, 0, { libelle: phase === 1 ? (p.agesTexte || ["il y a ≈ 25 000 ans", ""])[0] : (p.agesTexte || ["", "il y a ≈ 18 000 ans"])[1] });
        return s;
      },
    };
  }
  SCENES.glacierTerreAvance = (p, roche) => glacierTerre(Object.assign({ _roche: roche }, p), 0, 0.5);
  SCENES.glacierTerreFonte = (p, roche) => glacierTerre(Object.assign({ _roche: roche }, p), 0.5, 1);

  // ───────────── 5 ter · le vent emporte les limons et les dépose loin (lœss, étape 2 ; refaite le 25/09/2026) ─────────────
  // Reprend à gauche l'image finale de l'étape 1 (glacier en recul, arcs de moraines, plaine d'épandage nue, même ciel) ; une
  // coupure marque la distance (des dizaines à des centaines de km) ; à droite, les collines de la steppe froide reçoivent les
  // poussières, qui s'accumulent en placage plus épais sur les versants abrités du vent.
  SCENES.ventLoess = function (p) {
    const R = alea("vl" + (p.graine || "")), XF = 150;
    const solG = (x) => x < 54 ? 60 + x * 1.1 : 126 + (x - 54) * 0.12 + 1.5 * Math.sin(x / 31);
    const solD = (x) => 150 - 16 * Math.exp(-(((x - 300) / 38) ** 2)) - 22 * Math.exp(-(((x - 400) / 45) ** 2)) + 2 * Math.sin(x / 13);
    // abri du vent : versant qui descend vers la droite (sous le vent) = placage plus épais
    const abri = (x) => clamp(0.55 + (solD(x + 3) - solD(x - 3)) * 0.12, 0.25, 1.3);
    const grains = Array.from({ length: 90 }, () => ({ ph: R(), h: R(), d: 0.35 + R() * 0.65 }));
    const herbe = Array.from({ length: 40 }, () => ({ x: 232 + R() * 244, h: 2 + R() * 3 }));
    return {
      fond: ciel(H, "#cddbe3", "#f0f3f5"),
      anim(t, ta) {
        let s = "";
        // à gauche : les Alpes au loin, le glacier qui a reculé, les moraines, la plaine d'épandage (fin de l'étape 1)
        s += poly([[0, 70], [14, 26], [26, 48], [39, 16], [54, 54], [68, 90], [0, 110]], "#b9c2c8", { opacity: 0.8 }) + poly([[10, 36], [14, 26], [18, 34]], "#f4f8fa") + poly([[35, 26], [39, 16], [43, 26]], "#f4f8fa");
        const G = []; for (let x = 0; x <= 207; x += 3) G.push([x, solG(x)]);
        s += poly(G.concat([[207, H], [0, H]]), "#9a927f");
        for (let k = 1; k < 7; k++) s += pline(G.map(([x, y]) => [x, y + k * 12]), "rgba(80,70,55,.25)", 0.7);
        const gl = []; for (let x = 0; x <= 52; x += 4) gl.push([x, solG(x) - 3 - 12 * Math.pow(1 - x / 60, 0.5)]);
        s += poly(gl.concat([[54, solG(54)]]).concat(gl.slice().reverse().map(([x]) => [x, solG(x)])), "#e8f2f6", { stroke: "#a9c3cf", "stroke-width": 1 });
        for (const [xm, e] of [[XF - 10, 7], [104, 5], [78, 4]]) { const m = []; for (let x = xm - 12; x <= xm + 12; x += 2) m.push([x, solG(x) - e * Math.cos((x - xm) / 12 * Math.PI / 2)]); s += poly(m.concat([[xm + 12, solG(xm + 12)], [xm - 12, solG(xm - 12)]]), "#a8a294"); }
        for (let k = 0; k < 3; k++) s += pline(Array.from({ length: 12 }, (_, i) => { const x = XF + 6 + i * 4; return [x, solG(x) - 0.8 + Math.sin(i * 0.9 + k * 2) * 0.8]; }), "#7fb6d6", 1.2, { opacity: 0.8 });
        s += txt(104, 190, "plaine d'épandage nue", { a: "middle", petit: true, clair: true });
        // coupure : la distance n'est pas à l'échelle
        s += poly([[207, 0], [214, 0], [220, H], [213, H]], "#f3f1ea") + pline([[207, 0], [213, H]], "#8f897d", 0.8, { "stroke-dasharray": "3 3" }) + pline([[214, 0], [220, H]], "#8f897d", 0.8, { "stroke-dasharray": "3 3" });
        s += txt(104, 214, "coupure (pointillés) : des dizaines", { a: "middle", petit: true, clair: true }) + txt(104, 224, "à des centaines de km", { a: "middle", petit: true, clair: true });
        // à droite : la steppe froide, collines (roches plus anciennes), placage de lœss qui s'épaissit
        const D = []; for (let x = 219; x <= W; x += 3) D.push([x, solD(x)]);
        s += poly(D.concat([[W, H], [219, H]]), "#b7a98b");
        for (let k = 1; k < 6; k++) s += pline(D.map(([x, y]) => [x, y + 10 + k * 13]), "rgba(90,78,60,.22)", 0.7);
        const e = 1 + 13 * lisse(clamp(t));
        const L = D.map(([x, y]) => [x, y - e * abri(x)]);
        s += poly(L.concat(D.slice().reverse()), "#e2cf9e", { stroke: "#c9b37c", "stroke-width": 0.6 });
        for (let k = 1; k < 4; k++) if (e > 4 * k) s += pline(D.map(([x, y]) => [x, y - (e * abri(x)) * k / 4]), "rgba(160,130,80,.35)", 0.5);
        for (const h of herbe) { const y = hauteur(L, h.x); s += line(h.x, y, h.x + 1, y - h.h, "#8f9a6a", 0.8); }
        // les poussières : soulevées de la plaine, emportées vers la droite, elles retombent sur les collines
        for (const g of grains) {
          const u = (g.ph + ta * 0.11) % 1, x = 125 + u * 355;
          if (x > 205 && x < 222) continue;
          const yb = x < 210 ? solG(x) : solD(x) - e * abri(x);
          const haut = 40 + 50 * g.h;
          const y = x < 250 ? lerp(yb - 3, haut, clamp((x - 125) / 80)) : lerp(haut, yb - 1, clamp((x - 250) / (150 + 80 * g.d)));
          s += circ(x, y, 0.9, "#a88f5c", { opacity: op(0.85 - 0.25 * g.d) });
        }
        s += fleche(140, 58, 190, 58, { sw: 2.2, pointe: 7 }) + txt(165, 50, "vent", { a: "middle", petit: true });
        s += txt(345, 185, "placage de lœss", { a: "middle", clair: true }) + txt(345, 196, "plus épais à l'abri du vent", { a: "middle", petit: true, clair: true });
        s += txt(440, 110, "steppe froide", { a: "middle", petit: true });
        s += compteur(330, 20, 0, { libelle: `il y a ≈ ${nombre(Math.round(lerp(30000, 12000, clamp(t)) / 500) * 500)} ans`, sous: "le lœss gagne ≈ 0,1 à 1 mm d'épaisseur par an" });
        return s;
      },
    };
  };

  // ───────────── 6 · DU RELIEF À LA MER : altération, transport, tri par la taille (sable, limon, argile, marne) ─────────────
  // Une seule coupe : relief à gauche (l'eau altère la roche : feldspath → argile, quartz intact), rivière, côte, plate-forme,
  // bassin. À l'embouchure, chaque classe de grains tombe plus ou moins loin selon son temps de chute (Ferguson et Church 2004 :
  // 0,2 mm ≈ 40 s par mètre d'eau calme, 20 µm ≈ 47 min, 2 µm ≈ 3 jours) : sable près du rivage, limon plus loin, argile au
  // large, en eau calme. p.cible = "sable" | "limon" | "argile" | "marne" (argile + calcite du plancton, `plancton`).
  // Phases : 0–0,5 altération et transport ; 0,5–1 tri et dépôt lit par lit dans la zone suivie.
  const ZONES = { sable: [152, 236], limon: [236, 336], argile: [336, 480], marne: [336, 480] };
  function littoral(p, T0, T1) {
    const R = alea("lt" + p.graine), roche = p._roche, tx = texRoche(roche), cible = p.cible || "sable";
    const MER = 80, XC = 150;
    const fondM = (x) => x < XC ? MER : x < 330 ? MER + 4 + (x - XC) * 0.16 : MER + 4 + 180 * 0.16 + (x - 330) * 0.42;
    const relief = (x) => x > XC ? MER : MER - 58 * Math.pow(Math.sin(Math.PI * clamp((x + 30) / (XC + 30))), 1.4) * (x < 20 ? 0.9 + x / 200 : 1) + 2 * Math.sin(x / 9);
    const CL = { sable: ["#e8c979", 2.3, 34, 70], limon: ["#a8946d", 1.6, 96, 176], argile: ["#6f7174", 1.2, 196, 320] };
    const grains = []; for (const k of ["sable", "limon", "argile"]) for (let i = 0; i < 30; i++) grains.push({ k, ph: R(), d: CL[k][2] + R() * (CL[k][3] - CL[k][2]), y0: R() * 3 });
    const plancton = Array.from({ length: 50 }, () => ({ x: 180 + R() * 300, ph: R() }));
    const zc = ZONES[cible], XN = (zc[0] + zc[1]) / 2 + (cible === "sable" ? -10 : 0);
    const epMax = 18, lits = 7;
    const clipS = nid("lts");
    const couleurLit = { sable: ["#ecdcae", "#e2cf98"], limon: ["#c3b59a", "#b3a488"], argile: ["#8f9194", "#a0a2a3"], marne: ["#b9b7ae", "#a3a39d"] }[cible];
    const phase = T0 < 0.3 ? 1 : 2;
    return {
      fond: (tx ? tx.defs : "") + ciel(MER + 2),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        let s = "";
        // mer et fond
        const eau = degrade("#8cc2de", "#3f7ea8");
        s += `<defs>${eau.def}</defs>` + rect(XC - 4, MER, W - XC + 4, H - MER, eau.url);
        const fondP = []; for (let x = 0; x <= W; x += 4) fondP.push([x, x < XC ? relief(x) : fondM(x)]);
        s += poly(fondP.concat([[W, H], [0, H]]), "#8a8272");
        for (let k = 1; k < 9; k++) s += pline(fondP.map(([x, y]) => [x, Math.max(y + k * 11, MER + 20 + k * 11)]), "rgba(60,55,45,.25)", 0.7);
        // dépôts : chaque zone reçoit sa classe ; dans la zone suivie, les lits s'empilent (phase 2)
        const dep = fen(T, 0.52, 0.97), n = dep * lits;
        const epZ = (x, z, e) => { const [a, b] = ZONES[z]; return e * Math.max(0, Math.sin(Math.PI * clamp((x - a + 14) / (b - a + 28)))); };
        const autre = 5 * fen(T, 0.2, 0.9);
        for (const z of ["sable", "limon", "argile"]) {
          if (z === (cible === "marne" ? "argile" : cible)) continue;
          const col = { sable: "#e8d6a0", limon: "#bdae92", argile: "#949597" }[z];
          const pts = []; for (let x = ZONES[z][0] - 14; x <= ZONES[z][1] + 14; x += 4) pts.push([x, fondM(x) - epZ(x, z, autre)]);
          s += poly(pts.concat(pts.slice().reverse().map(([x]) => [x, fondM(x) + 0.5])), col, { opacity: 0.9 });
        }
        let yLit = null;
        for (let k = 0; k < Math.ceil(n); k++) {
          const f = clamp(n - k), e0 = k * epMax / lits, e1 = e0 + f * epMax / lits;
          const haut = [], bas = [];
          for (let x = zc[0] - 14; x <= zc[1] + 14; x += 4) { bas.push([x, fondM(x) - epZ(x, cible === "marne" ? "marne" : cible, e0 + 0.001)]); haut.push([x, fondM(x) - epZ(x, cible === "marne" ? "marne" : cible, e1)]); }
          s += poly(haut.concat(bas.reverse()), couleurLit[k % 2], { stroke: "rgba(60,55,45,.3)", "stroke-width": 0.4 });
          if (k === 1) yLit = fondM(XN) - epZ(XN, cible === "marne" ? "marne" : cible, (e0 + e1) / 2);
        }
        // relief (terre) : couches de la roche mère, rivière, végétation
        const relP = []; for (let x = 0; x <= XC + 4; x += 3) relP.push([x, relief(x)]);
        const socle = relP.concat(relP.slice().reverse().map(([x, y]) => [x, y + 30 * clamp((XC - x) / 50)]));
        s += `<clipPath id="${clipS}"><polygon points="${P(socle)}"/></clipPath>` + poly(socle, p.couleurRelief || "#c9b8a3");
        let st = ""; for (let k = 0; k < 16; k++) { const x = 6 + (k * 23) % 150, y = relief(x) + 10 + (k * 13) % 50; st += ell(x, y, 5, 3.5, "#d9ccbb", { stroke: "#8f8578", "stroke-width": 0.6 }); }
        s += `<g clip-path="url(#${clipS})">${st}</g>`;
        s += vegetation(relief, 4, XC - 8, alea("ltv"), { pas: 15, pente: 1.4 });
        const riv = []; for (let x = 58; x <= XC; x += 4) riv.push([x, relief(x) + 1.2]);
        s += pline(riv, "#5b95c6", 2.2);
        // grains qui quittent l'embouchure et tombent plus ou moins loin (en continu)
        const flux = T < 0.1 ? fen(T, 0, 0.1) : 1;
        for (const g of grains) {
          const [c, r, d0] = CL[g.k], u = (g.ph + ta * (g.k === "sable" ? 0.2 : g.k === "limon" ? 0.14 : 0.09)) % 1;
          const x = XC + u * g.d, yb = fondM(x) - 2, y = MER + 3 + g.y0 + (yb - MER - 3) * Math.pow(u, g.k === "sable" ? 0.6 : g.k === "limon" ? 1.3 : 2.4);
          s += circ(x, y, r, c, { opacity: op(flux * Math.min(1, (1 - u) * 6, u * 10)) });
        }
        // plancton calcaire (marne) : de fines plaques de calcite tombent partout au large
        if (p.plancton) for (const q of plancton) { const u = (q.ph + ta * 0.08) % 1, y = MER + 4 + u * (fondM(q.x) - MER - 6); s += circ(q.x, y, 0.9, "#ffffff", { opacity: op(0.9 * Math.min(1, (1 - u) * 5)) }); }
        // vagues
        let v = ""; for (let x = XC; x < W; x += 12) v += `<path d="M${x} ${r1(MER + Math.sin(x / 13 + ta * 2.2))} q3 -2 6 0 t6 0" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="1"/>`;
        s += v + rect(XC - 6, MER - 1.5, 10, 3, "#e8d6a0");
        // météo
        s += grp(nuage(60 + 3 * Math.sin(ta * 0.3), 16, 0.9, true) + pluie(38, 22, 50, 40, ta, 12, "lt1", relief), 0.9);
        // étiquettes des zones
        for (const [z, lab] of [["sable", "sable"], ["limon", "limon"], ["argile", cible === "marne" ? "argile + calcite" : "argile"]]) {
          const xm = (ZONES[z][0] + ZONES[z][1]) / 2 + (z === "argile" ? 30 : 0);
          s += txt(xm, fondM(xm) + 14, lab, { a: "middle", petit: true, clair: true, op: fen(T, 0.2, 0.3) });
        }
        // temps de chute (cartouche) : la clé du tri
        s += grp(cartouche(300, 176, 176, [["#e8d49a", "sable 0,2 mm : ≈ 40 s par mètre d'eau"], ["#b9a88a", "limon 20 µm : ≈ 47 minutes"], ["#8e8f8d", "argile 2 µm : ≈ 3 jours"]]), fen(T, 0.14, 0.2));
        // loupe 1 : l'eau altère la roche du relief ; loupe 2 : la couche suivie (vraie texture)
        if (phase === 1 && T > 0.03) {
          const o = fen(T, 0.03, 0.08) * (1 - fen(T, 0.42, 0.48));
          const LX = 300, LY = 46, dx = LX - 228, dy = LY - 40;
          const L = loupe(LX, LY, 30, { vers: [96, relief(96) + 8], rVers: 3 });
          let d = rect(LX - 30, LY - 30, 60, 60, "#e8e1d4"), e = fen(T, 0.06, 0.4);
          const cel = [[212, 26, "q"], [232, 22, "f"], [248, 34, "q"], [214, 48, "f"], [236, 46, "b"], [252, 56, "f"], [222, 64, "q"], [242, 64, "f"]].map(([x, y, k]) => [x + dx, y + dy, k]);
          for (const [x, y, k] of cel) {
            if (k === "q") d += poly([[x - 7, y - 5], [x + 6, y - 7], [x + 8, y + 4], [x - 2, y + 8], [x - 8, y + 3]], "#ebe7de", { stroke: "#7d766b", "stroke-width": 0.6 });
            else { const c = k === "f" ? melange("#e6b39a", "#c9b08c", e) : melange("#3f3229", "#b0703a", e); d += poly([[x - 8, y - 6], [x + 7, y - 6], [x + 8, y + 6], [x - 7, y + 7]], c, { stroke: "#7d766b", "stroke-width": 0.6 }); if (e > 0.3) for (let j = 0; j < 4; j++) d += line(x - 6, y - 3 + j * 3, x + 6, y - 3 + j * 3, "rgba(90,70,50,.5)", 0.5, { opacity: op(e) }); }
          }
          for (let j = 0; j < 6; j++) { const u = (j / 6 + ta * 0.3) % 1; d += line(LX - 28 + j * 10, LY - 28 + u * 56, LX - 28 + j * 10, LY - 24 + u * 56, "#4f8fc4", 1, { opacity: 0.7 }); }
          s += grp(L.fond + L.dans(d) + L.bord + cartouche(LX + 36, LY - 14, 118, [["#ebe7de", "quartz : intact"], [melange("#e6b39a", "#c9b08c", e), "feldspath → argile"], [melange("#3f3229", "#b0703a", e), "mica noir → argile"]]), o);
        }
        if (tx && phase === 2 && yLit != null) {
          s += circ(XN, yLit, 2.6, "#c0392b", { stroke: "#fff", "stroke-width": 1 });
          const o = fen(T, 0.62, 0.68), lx = clamp(XN - 60, 230, 330), ly = 54;
          const L = loupe(lx, ly, 28, { vers: [XN, yLit], rVers: 3 });
          s += grp(L.fond + L.dans(texDansDisque(tx, lx, ly, 28, p.echelleLoupe || 0.4, texDessin(tx, p.videsLoupe || 40, 40))) + L.bord
            + txt(lx, ly + 38, p.texteLoupe || "", { a: "middle", petit: true }), o);
        }
        const titre = phase === 1 ? (T < 0.25 ? "sur le relief, l'eau de pluie altère la roche et libère grains et argiles" : "la rivière charrie grains et argiles jusqu'au littoral")
          : T < 0.62 ? "à l'embouchure, chaque grain tombe plus ou moins loin selon sa taille" : (p.titreDepot || "strate après strate, la zone suivie s'épaissit");
        s += txt(8, MER + 150 - 2, "", {});
        s += `<text x="8" y="14" class="fa-lab">${titre}</text>`;
        if (p.ages) s += compteur(412, 14, phase === 1 ? lerp(p.ages[0], p.ages[1], T / 0.5) : lerp(p.ages[1], p.ages[2], (T - 0.5) / 0.5), { libelle: p.libelleAge });
        return s;
      },
    };
  }
  SCENES.littoralErosion = (p, roche) => littoral(Object.assign({ _roche: roche }, p), 0, 0.5);
  SCENES.littoralDepot = (p, roche) => littoral(Object.assign({ _roche: roche }, p), 0.5, 1);

  // ───────────── 7 · TURBIDITES : avalanches sous-marines au pied d'une pente (grauwacke, flysch) ─────────────
  // Une coupe : delta et plateau (gauche), pente continentale, fond du bassin (droite). Le sable et la boue s'accumulent au
  // rebord du plateau ; un séisme les fait s'effondrer : un nuage d'eau chargée (courant de turbidité) dévale la pente, ralentit
  // sur le fond et dépose un banc GRANOCLASSÉ (grossier en bas, fin en haut) ; la boue retombe ensuite lentement. Phase 1 : une
  // avalanche (0–0,5) ; phase 2 : des centaines, les bancs s'empilent (0,5–1). p.ages [a0, a1, a2], p.nom (grauwacke | flysch).
  function turbidites(p, T0, T1) {
    const R = alea("tb" + p.graine), roche = p._roche, tx = texRoche(roche);
    const MER = 40, fondT = (x) => x < 150 ? 96 + x * 0.02 : x < 280 ? lerp(99, 200, lisse((x - 150) / 130)) : 200 + (x - 280) * 0.01;
    const relief = (x) => MER - 30 * Math.pow(clamp((70 - x) / 70), 0.8) + 2 * Math.sin(x / 7);
    const nuageT = Array.from({ length: 26 }, () => ({ dx: R(), dy: R(), r: 5 + R() * 8 }));
    const tas = (T) => 14 * (T < 0.3 ? fen(T, 0.04, 0.3) : T < 0.5 ? 1 - fen(T, 0.3, 0.36) : 0.5 + 0.5 * Math.sin(T * 60));
    const phase = T0 < 0.3 ? 1 : 2;
    const clipB = nid("tbc");
    return {
      fond: (tx ? tx.defs : "") + ciel(MER + 2),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        let s = "";
        const eau = degrade("#7fb6d6", "#274f73");
        s += `<defs>${eau.def}</defs>` + rect(0, MER, W, H - MER, eau.url);
        // terre et delta à gauche
        const terre = []; for (let x = 0; x <= 80; x += 3) terre.push([x, relief(x)]);
        s += poly(terre.concat([[80, MER + 2], [0, MER + 2]]), "#b9a88a") + vegetation(relief, 2, 66, alea("tbv"), { pas: 14 });
        s += pline(Array.from({ length: 14 }, (_, i) => [8 + i * 5, relief(8 + i * 5) + 1]), "#5b95c6", 2);
        // fond : plateau, pente, bassin
        const fondP = []; for (let x = 0; x <= W; x += 4) fondP.push([x, fondT(x)]);
        s += poly(fondP.concat([[W, H], [0, H]]), "#77705f");
        for (let k = 1; k < 5; k++) s += pline(fondP.map(([x, y]) => [x, y + k * 9]), "rgba(40,35,30,.25)", 0.7);
        // bancs déposés au fond du bassin : 1 en phase 1, puis des dizaines
        const nb = phase === 1 ? fen(T, 0.36, 0.5) : 1 + 9 * fen(T, 0.5, 0.97);
        // x du pied de pente à la hauteur y (les bancs viennent s'appuyer sur la pente)
        const xPente = (yy) => { let x = 150; while (x < 300 && fondT(x) < yy) x += 1; return x; };
        let y = 200;
        const gSable = degrade("#e9dcc0", "#9c8a6c");
        s += `<defs>${gSable.def}</defs>`;
        for (let k = 0; k < Math.ceil(nb); k++) {
          const f = clamp(nb - k), e1 = 3.2 * f, e2 = 1.6 * clamp((nb - k - 0.5) * 2);
          const a = xPente(y - e1), b2 = xPente(y);
          s += poly([[b2, y], [W, y], [W, y - e1], [a, y - e1]], gSable.url);
          if (e2 > 0) { const c = xPente(y - e1 - e2); s += poly([[a, y - e1], [W, y - e1], [W, y - e1 - e2], [c, y - e1 - e2]], "#5d5a50"); }
          y -= e1 + Math.max(0, e2);
        }
        const yTop = y;
        // tas instable au rebord du plateau
        const h = tas(T);
        if (h > 0.5) s += poly([[92, fondT(92)], [140, fondT(140) - h], [156, fondT(156) - h * 0.6], [168, fondT(168)]], "#cdbb96");
        // l'avalanche : nuage qui dévale la pente puis s'étale sur le fond (phase 1 une fois ; phase 2 en boucle)
        const cyc = phase === 1 ? clamp((T - 0.3) / 0.12) : ((T - 0.5) / 0.5 * 16) % 1;
        if ((phase === 1 && T > 0.3 && T < 0.44) || (phase === 2 && cyc < 0.6)) {
          const u = phase === 1 ? cyc : cyc / 0.6, x = lerp(150, 440, lisse(u)), yb = fondT(Math.min(x, 470));
          for (const q of nuageT) s += circ(x - q.dx * 60 * (0.4 + u), yb - 4 - q.dy * 16 * (0.5 + 0.5 * u), q.r * (0.6 + 0.4 * u), "#b3a58c", { opacity: op((0.75 - q.dx * 0.5) * (1 - fen(u, 0.8, 1))) });
          if (phase === 1) s += txt(x - 10, yb - 30, "courant de turbidité", { a: "middle", petit: true, clair: true });
        }
        // séisme (déclencheur)
        if (phase === 1 && T > 0.27 && T < 0.33) for (let k = 1; k <= 3; k++) s += circ(150, 110, k * 8 * fen(T, 0.27, 0.33), "none", { stroke: "#c0392b", "stroke-width": 1, opacity: op(1 - fen(T, 0.29, 0.33)) });
        // loupe : un banc granoclassé (phase 1), puis la roche (vraie texture, phase 2)
        if (phase === 1 && T > 0.4) {
          const o = fen(T, 0.4, 0.44), L = loupe(390, 100, 36, { vers: [380, 198], rVers: 3 });
          let d = rect(354, 64, 72, 72, "#5d5a50");
          for (let k = 0; k < 90; k++) { const v = (k % 10) / 9, rr = lerp(3.2, 0.7, v); d += circ(356 + ((k * 37) % 70), 134 - v * 52 + ((k * 13) % 5), rr, melange("#efe6d2", "#b9ad92", v)); }
          d += rect(354, 64, 72, 16, "#5d5a50");
          s += grp(L.fond + L.dans(d) + L.bord + txt(390, 148, "un banc granoclassé : grossier à la base, fin au sommet ;", { a: "middle", petit: true })
            + txt(390, 158, "puis la boue retombe lentement", { a: "middle", petit: true }), o);
        }
        if (phase === 2 && tx) {
          const o = fen(T, 0.56, 0.62), L = loupe(392, 86, 34, { vers: [410, yTop + 5], rVers: 3 });
          s += grp(L.fond + L.dans(texDansDisque(tx, 392, 86, 34, p.echelleLoupe || 0.4, texDessin(tx, 15, 15))) + L.bord + txt(392, 131, p.texteLoupe || "", { a: "middle", petit: true }), o);
          if (nb > 3) s += txt(W - 6, 212, "des centaines de bancs (quelques-uns seulement sont dessinés)", { a: "end", petit: true, clair: true });
        }
        s += txt(120, 90, "plateau", { petit: true, clair: true }) + txt(214, 150, "pente", { petit: true, clair: true }) + txt(300, 228, "fond du bassin, 2 à 4 km d'eau", { petit: true, clair: true });
        const titre = phase === 1 ? (T < 0.27 ? "le delta déverse sable et boue au rebord du plateau : le tas grossit"
          : T < 0.36 ? "un séisme : le tas s'effondre et dévale la pente" : "sur le fond, le nuage freine et laisse un banc")
          : "à chaque séisme, une avalanche : les bancs s'accumulent";
        s += txt(8, 14, titre);
        if (p.ages) s += compteur(412, 14, phase === 1 ? lerp(p.ages[0], p.ages[1], T / 0.5) : lerp(p.ages[1], p.ages[2], (T - 0.5) / 0.5));
        return s;
      },
    };
  }
  SCENES.turbiditeUne = (p, roche) => turbidites(Object.assign({ _roche: roche }, p), 0, 0.5);
  SCENES.turbiditePile = (p, roche) => turbidites(Object.assign({ _roche: roche }, p), 0.5, 1);

  // ───────────── 8 · LA VIE FABRIQUE LA ROCHE : plancton, éponges, coquilles, dans une mer ou un lac ─────────────
  // Une coupe d'eau : surface, colonne d'eau, fond. p.milieu : "large" (mer épicontinentale loin des côtes : craie),
  // "cotier" (côte à gauche, rivière qui apporte sable fin et micas : tuffeau), "faluns" (mer très peu profonde, vagues et
  // marées, coquilles), "ocean" (4 km d'eau, profondeur de compensation des carbonates : radiolarite), "lac" (lac de cratère :
  // diatomite). p.vie : liste parmi coccolithes, eponges, radiolaires, diatomees, coquilles, glauconie. Phase 1 : la vie et la
  // chute des squelettes (loupe sur l'organisme, avec sa taille) ; phase 2 : le fond s'épaissit lit par lit (loupe = texture).
  // p.silex : des rognons de silex apparaissent dans la craie à la fin.
  const ORG = {
    coccolithes: { nom: "coccolithophoridé", taille: "≈ 10 µm (un centième de mm)", couleur: "#ffffff", r: 0.9, vitesse: 0.12 },
    radiolaires: { nom: "radiolaire", taille: "≈ 0,1 mm", couleur: "#f1e6dc", r: 1.3, vitesse: 0.16 },
    diatomees: { nom: "diatomée", taille: "quelques centièmes de mm", couleur: "#f4f6f2", r: 1.0, vitesse: 0.12 },
    eponges: { nom: "éponge et ses spicules d'opale", taille: "spicules : quelques dixièmes de mm", couleur: "#dfe6e2", r: 1.1, vitesse: 0.2 },
    coquilles: { nom: "coquillages, bryozoaires", taille: "de quelques mm à quelques cm", couleur: "#f4ecd8", r: 2.2, vitesse: 0.3 },
  };
  function dessinOrganisme(k, x, y, r, ta) {
    let d = "";
    if (k === "coccolithes") {
      d += circ(x, y, r, "#f1f4ef", { stroke: "#9aa39c", "stroke-width": 0.8 });
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, px = x + Math.cos(a) * r * 0.78, py = y + Math.sin(a) * r * 0.78; d += ell(px, py, r * 0.28, r * 0.2, "#ffffff", { stroke: "#9aa39c", "stroke-width": 0.6, transform: `rotate(${r1(a * 57.3)} ${r1(px)} ${r1(py)})` }); }
      d += circ(x, y, r * 0.45, "#e6ece6", { stroke: "#9aa39c", "stroke-width": 0.6 });
      d += circ(x + r * 1.15, y + r * 0.95, r * 0.24, "#ffffff", { stroke: "#9aa39c", "stroke-width": 0.5 });
    } else if (k === "radiolaires") {
      d += circ(x, y, r, "none", { stroke: "#a4553c", "stroke-width": 1.2 });
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; d += line(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5, "#a4553c", 0.8); }
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.3; d += circ(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.13, "none", { stroke: "#a4553c", "stroke-width": 0.6 }); }
    } else if (k === "diatomees") {
      d += circ(x - r * 0.4, y, r * 0.8, "#f4f6f2", { stroke: "#6f8f82", "stroke-width": 1 });
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; d += line(x - r * 0.4 + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2, x - r * 0.4 + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75, "#9ab0a6", 0.5); }
      d += ell(x + r * 0.9, y + r * 0.4, r * 0.8, r * 0.22, "#f4f6f2", { stroke: "#6f8f82", "stroke-width": 0.9, transform: `rotate(-25 ${r1(x + r * 0.9)} ${r1(y + r * 0.4)})` });
    } else if (k === "eponges") {
      d += `<path d="M${r1(x - r * 0.6)} ${r1(y + r)} Q${r1(x - r)} ${r1(y - r * 0.2)} ${r1(x - r * 0.4)} ${r1(y - r)} L${r1(x + r * 0.4)} ${r1(y - r)} Q${r1(x + r)} ${r1(y - r * 0.2)} ${r1(x + r * 0.6)} ${r1(y + r)} Z" fill="#d9c9a0" stroke="#8a7a58" stroke-width=".8"/>`;
      for (let i = 0; i < 8; i++) { const px = x - r * 0.5 + (i % 4) * r * 0.33, py = y - r * 0.5 + Math.floor(i / 4) * r * 0.7; d += line(px - 3, py, px + 3, py, "#ffffff", 0.8) + line(px, py - 3, px, py + 3, "#ffffff", 0.8); }
    } else if (k === "coquilles") {
      d += `<path d="M${r1(x - r)} ${r1(y + r * 0.3)} Q${r1(x)} ${r1(y - r * 1.3)} ${r1(x + r)} ${r1(y + r * 0.3)} Z" fill="#f4ecd8" stroke="#8a7a58" stroke-width=".9"/>`;
      for (let i = 1; i < 6; i++) d += line(x, y + r * 0.3, x - r + i * r / 3, y - r * 0.3 + Math.abs(i - 3) * r * 0.2, "#b8a57a", 0.6);
      d += ell(x - r * 0.1, y + r * 0.9, r * 0.9, r * 0.28, "#8aa36a", { opacity: 0.8 }) + txt(x, y + r * 1.55, "bryozoaire", { a: "middle", petit: true });
    }
    return d;
  }
  function merVie(p, T0, T1) {
    const R = alea("mv" + p.graine), roche = p._roche, tx = texRoche(roche), mil = p.milieu || "large";
    const vie = p.vie || ["coccolithes"];
    const SURF = 36, FOND = mil === "ocean" ? 206 : mil === "faluns" ? 150 : 192;
    const bord = mil === "lac" ? (x) => x < 70 ? lerp(40, FOND, x / 70) : x > 410 ? lerp(FOND, 40, (x - 410) / 70) : FOND : (x) => FOND + (mil === "cotier" ? Math.max(0, 1 - x / 150) * -40 : 0);
    const parts = []; for (const k of vie.filter((v) => ORG[v])) for (let i = 0; i < (k === "coccolithes" ? 70 : 34); i++) parts.push({ k, x: 70 + R() * 400, ph: R(), dx: (R() - 0.5) * 10 });
    const epMax = 26, lits = 8;
    const couleurs = p.couleurs || ["#f4f1e9", "#fbf9f4"];
    const phase = T0 < 0.3 ? 1 : 2;
    const XN = p.xn || 300;
    const rognons = Array.from({ length: 40 }, (_, i) => ({ x: 20 + R() * 440, k: i % 4, r: 2 + R() * 2.5 }));
    const clipF = nid("mvf");
    return {
      fond: (tx ? tx.defs : "") + ciel(SURF + 2, mil === "lac" ? "#c7dde6" : "#b9d6e8"),
      anim(t, ta) {
        const T = lerp(T0, T1, t);
        let s = "";
        const eau = mil === "lac" ? degrade("#9cc4b4", "#4f7f6f") : mil === "ocean" ? degrade("#6aa2c8", "#16324f") : degrade("#8cc2de", "#3f7ea8");
        s += `<defs>${eau.def}</defs>` + rect(0, SURF, W, H - SURF, eau.url);
        // le fond et les lits qui s'y déposent
        const dep = phase === 1 ? 0.12 * fen(T, 0.1, 0.5) : lerp(0.12, 1, fen(T, 0.5, 0.97)), n = dep * lits;
        const fondP = []; for (let x = 0; x <= W; x += 4) fondP.push([x, bord(x)]);
        s += poly(fondP.concat([[W, H], [0, H]]), p.couleurFond || "#8a8272");
        for (let k = 1; k < 5; k++) s += pline(fondP.map(([x, y]) => [x, y + k * 9]), "rgba(40,35,30,.25)", 0.7);
        const epLit = epMax / lits;
        let yN = null;
        for (let k = 0; k < Math.ceil(n); k++) {
          const f = clamp(n - k), haut = [], bas = [];
          for (let x = 0; x <= W; x += 4) { const b = bord(x) - k * epLit, e = Math.max(0, (bord(x) === FOND || mil !== "lac") ? epLit * f : 0); bas.push([x, b]); haut.push([x, b - e]); }
          s += poly(haut.concat(bas.reverse()), couleurs[k % couleurs.length], { stroke: "rgba(90,80,60,.25)", "stroke-width": 0.4 });
          if (k === 1) yN = bord(XN) - 1.5 * epLit;
        }
        const yTop = bord(XN) - n * epLit;
        // rognons de silex dans la craie (à la fin)
        if (p.silex && phase === 2) { const o = fen(T, 0.8, 0.95); for (const q of rognons) { const lit = 1 + q.k * 2; if (lit >= n - 1.2) continue; const y = bord(q.x) - lit * epLit - epLit * 0.5; s += ell(q.x, y, q.r * 1.6 * o, q.r * 0.8 * o, "#3b3a3d"); } }
        // la vie : particules qui tombent de la surface (plancton) ou restes des animaux du fond
        const prod = phase === 1 ? fen(T, 0.02, 0.12) : 1;
        for (const q of parts) {
          const o = ORG[q.k], u = (q.ph + ta * o.vitesse * 0.5) % 1;
          const fondIci = bord(q.x) - (phase === 2 ? (n * epLit) : 0);
          const y0 = q.k === "eponges" || q.k === "coquilles" ? fondIci - 14 : SURF + 4;
          let y = lerp(y0, fondIci - 1, u), vis = Math.min(1, (1 - u) * 6, u * 10);
          // sous la profondeur de compensation, la calcite se dissout (radiolarite)
          if (mil === "ocean" && q.k === "coccolithes" && y > 150) vis *= clamp(1 - (y - 150) / 12);
          s += circ(q.x + q.dx * Math.sin(u * 6), y, o.r, o.couleur, { opacity: op(vis * prod) });
        }
        if (vie.includes("eponges")) for (let i = 0; i < 9; i++) { const x = 40 + i * 50 + (i % 2) * 14, y = bord(x) - (phase === 2 ? n * epLit : 0); s += dessinOrganisme("eponges", x, y - 5, 4.5, ta); }
        if (vie.includes("coquilles")) for (let i = 0; i < 12; i++) { const x = 20 + i * 38 + (i % 3) * 7, y = bord(x) - (phase === 2 ? n * epLit : 0); s += `<path d="M${r1(x - 4)} ${r1(y)} Q${r1(x)} ${r1(y - 6)} ${r1(x + 4)} ${r1(y)} Z" fill="#f4ecd8" stroke="#8a7a58" stroke-width=".6"/>`; }
        if (vie.includes("glauconie")) for (let i = 0; i < 18; i++) { const x = 30 + i * 25, y = bord(x) - (phase === 2 ? n * epLit : 0) - 1; s += circ(x, y, 1.3, "#5f8a4a"); }
        // milieu : vagues, côte, cratère, profondeur de compensation
        let v = ""; for (let x = 0; x < W; x += 12) v += `<path d="M${x} ${r1(SURF + Math.sin(x / 13 + ta * 2.2) * (mil === "faluns" ? 1.8 : 1))} q3 -2 6 0 t6 0" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="1"/>`;
        s += v;
        if (mil === "cotier") { s += poly([[0, SURF - 8], [60, SURF - 4], [120, SURF + 1], [0, SURF + 1]], "#b9a88a") + pline([[20, SURF - 6], [60, SURF - 2], [110, SURF + 1]], "#5b95c6", 1.8); for (let i = 0; i < 20; i++) { const u = (i / 20 + ta * 0.15) % 1; s += circ(110 + u * 200, SURF + 6 + u * u * 120, 1.1, "#d9c48f", { opacity: op((1 - u) * 1.2) }); } s += txt(6, SURF - 12, "la rivière apporte du sable fin et des micas", { petit: true }); }
        if (mil === "faluns") for (let i = 0; i < 6; i++) { const u = (i / 6 + ta * 0.2) % 1, x = 40 + u * 400; s += fleche(x, 120 + Math.sin(ta + i) * 3, x + 18 * Math.sin(ta * 0.8), 120 + Math.sin(ta + i) * 3, { c: "rgba(255,255,255,.7)", sw: 1.2, pointe: 4 }); }
        if (mil === "lac") { s += poly([[0, SURF - 30], [30, SURF - 36], [70, SURF - 2], [70, SURF + 2], [0, SURF + 2]], "#6f6258") + poly([[410, SURF + 2], [410, SURF - 2], [450, SURF - 38], [480, SURF - 30], [480, SURF + 2]], "#6f6258"); s += txt(4, SURF - 3, "cratère", { petit: true, clair: true }); }
        if (mil === "faluns") { const xr = ((ta * 22) % 620) - 70, yr = 90 + 6 * Math.sin(ta * 0.7); s += `<path d="M${r1(xr)} ${r1(yr)} q14 -7 34 -2 l8 -8 l-1 9 q6 1 10 1 l9 -7 l-3 8 l3 8 l-9 -6 q-12 5 -26 4 l-5 6 l-1 -6 q-12 -2 -19 -7 z" fill="#8c98a0" opacity=".85"/>` + (xr > 20 && xr < 440 ? txt(xr + 22, yr - 12, "requin", { a: "middle", petit: true, clair: true }) : ""); }
        if (mil === "ocean") { s += line(0, 150, W, 150, "#ffffff", 1, { "stroke-dasharray": "5 4", opacity: 0.7 }) + txt(8, 146, "sous la profondeur de compensation, la calcite se dissout", { petit: true, clair: true }); }
        // loupes : l'organisme (phase 1), puis la roche (phase 2)
        if (phase === 1 && T > 0.12) {
          const k = vie[0], o = fen(T, 0.12, 0.18), L = loupe(390, 96, 38, { fond: mil === "lac" ? "#e2efe9" : "#e6f1f6" });
          s += grp(L.fond + L.dans(dessinOrganisme(k, 390, 96, 20, ta)) + L.bord + txt(390, 146, ORG[k].nom, { a: "middle", petit: true }) + txt(390, 156, ORG[k].taille, { a: "middle", petit: true })
            + (k === "coccolithes" ? txt(390, 166, "(en bas à droite : une plaque effondrée)", { a: "middle", petit: true }) : ""), o);
        }
        if (phase === 2 && tx && yN != null) {
          s += circ(XN, yN, 2.6, "#c0392b", { stroke: "#fff", "stroke-width": 1 });
          const o = fen(T, 0.6, 0.66), L = loupe(392, 90, 34, { vers: [XN, yN], rVers: 3 });
          s += grp(L.fond + L.dans(texDansDisque(tx, 392, 90, 34, p.echelleLoupe || 0.42, texDessin(tx, p.videsLoupe || 45, 45))) + L.bord + txt(392, 135, p.texteLoupe || "", { a: "middle", petit: true }), o);
        }
        const TT = p.titres || ["", "", ""];
        s += txt(8, 14, phase === 1 ? (T < 0.3 ? TT[0] : TT[1]) : TT[2] || TT[1]);
        if (p.labFond) s += txt(8, H - 8, p.labFond, { petit: true, clair: true });
        if (p.ages) s += compteur(412, 14, phase === 1 ? lerp(p.ages[0], p.ages[1], T / 0.5) : lerp(p.ages[1], p.ages[2], (T - 0.5) / 0.5), { libelle: p.libelleAge });
        if (p.silex && phase === 2 && T > 0.85) s += txt(240, yTop - 6, "la silice issue des éponges s'agglomère en rognons : le silex", { a: "middle", petit: true, clair: true });
        return s;
      },
    };
  }
  SCENES.merVie = (p, roche) => merVie(Object.assign({ _roche: roche }, p), 0, 0.5);
  SCENES.merDepot = (p, roche) => merVie(Object.assign({ _roche: roche }, p), 0.5, 1);

  // ───────────── 9 · aujourd'hui : la mer attaque une falaise de craie (Étretat) ─────────────
  // la craie, litée, avec ses lits de silex ; les vagues creusent le pied, des pans tombent ; arche et aiguille au loin ;
  // au pied, la plage de galets de SILEX (la craie se dissout, le silex reste). p.silex : insiste sur les silex.
  SCENES.falaiseCraie = function (p, roche) {
    const R = alea("fc" + p.graine);
    const MER = 186;
    const falaise = (x, e) => x < 250 - 30 * e ? 60 + 6 * Math.sin(x / 40) : x < 262 - 30 * e ? lerp(60, MER - 8, (x - (250 - 30 * e)) / 12) : MER + 6;
    const galets = Array.from({ length: 60 }, () => ({ x: 240 + R() * 120, y: R(), r: 1.5 + R() * 2 }));
    return {
      fond: ciel(MER + 2),
      anim(t, ta) {
        const e = fen(t, 0.05, 0.95);
        let s = "";
        // arche et aiguille au loin (la falaise d'Aval)
        s += poly([[330, MER], [336, 120], [346, 104], [360, 100], [372, 108], [376, 140], [386, 108], [398, 102], [404, 120], [404, MER]], "#e8e4d8", { opacity: 0.7 });
        s += `<path d="M 356 ${MER} Q 360 150 372 150 Q 382 150 384 ${MER} Z" fill="#b9d6e8" opacity=".9"/>`;
        s += poly([[420, MER], [424, 132], [428, 118], [433, 132], [436, MER]], "#e8e4d8", { opacity: 0.75 }) + txt(428, 112, "aiguille", { a: "middle", petit: true });
        // la mer
        const eau = degrade("#8cc2de", "#3f7ea8");
        s += `<defs>${eau.def}</defs>` + rect(0, MER, W, H - MER, eau.url);
        // falaise de craie qui recule, lits de silex
        const xpied = 262 - 30 * e;
        const f = []; for (let x = 0; x <= xpied; x += 3) f.push([x, falaise(x, e)]);
        s += poly(f.concat([[xpied, MER + 6], [W, MER + 14], [W, H], [0, H]]), "#f1eee6");
        s += rect(xpied, MER, W - xpied, 14, "rgba(120,180,215,.85)") + txt(W - 8, MER + 38, "platier : la craie rabotée par la houle", { a: "end", petit: true });
        const Rs = alea("fcs");
        for (let k = 0; k < 9; k++) { const y = 74 + k * 13; s += line(0, y, 250 - 30 * e + (y - 60) * 0.1, y, "rgba(150,140,120,.35)", 0.8); for (let i = 0; i < 14; i++) { const x = 8 + i * 17 + (k % 2) * 8 + (Rs() - 0.5) * 7, keep = Rs() > 0.25, rx = 2.2 + Rs() * 2; if (keep && x < 244 - 30 * e) s += ell(x, y - 3, rx, 1.3 + Rs() * 0.6, "#3b3a3d"); } }
        s += vegetation((x) => falaise(x, e), 2, 236 - 30 * e, alea("fcv"), { pas: 20 });
        // encoche et pans qui tombent
        const xf = 262 - 30 * e;
        s += `<path d="M ${r1(xf - 12)} ${MER - 2} Q ${r1(xf - 20)} ${MER - 12} ${r1(xf - 10)} ${MER - 22} L ${r1(xf)} ${MER - 22} L ${r1(xf)} ${MER} Z" fill="#8cc2de"/>`;
        for (let i = 0; i < 4; i++) { const u = (i / 4 + ta * 0.12) % 1; if (u < 0.5) { const x = xf - 6 + u * 10, y = lerp(70, MER - 4, u * 2); s += rect(x, y, 6, 5, "#e6e1d4", { transform: `rotate(${r1(u * 400)} ${r1(x)} ${r1(y)})` }); } }
        // plage de galets de silex
        s += poly([[xf - 10, MER + 2], [380, MER + 2], [380, MER + 8], [xf - 10, MER + 8]], "#8d8a86");
        for (const g of galets) if (g.x > xf - 8) s += ell(g.x, MER + 3 + g.y * 5, g.r * 1.3, g.r, g.y < 0.6 ? "#4a4846" : "#7a7672");
        // vagues qui frappent le pied
        for (let i = 0; i < 5; i++) { const u = (i / 5 + ta * 0.4) % 1; s += `<path d="M ${r1(xf + 40 - u * 40)} ${r1(MER - 2 + Math.sin(u * 6))} q 4 -4 8 0" fill="none" stroke="#fff" stroke-width="1.4" opacity="${op(1 - u)}"/>`; }
        s += fleche(xf + 44, MER - 10, xf + 8, MER - 10, { c: "#27302d", sw: 1.4, pointe: 5 });
        s += txt(8, 14, p.titre || "la mer attaque la base de la falaise ; des pans s'effondrent et la craie recule");
        s += bulle(292, 28, p.lignes || ["la craie se dissout et s'érode rapidement ;", "le silex, très dur, subsiste : il forme", "les galets de la plage"]);
        s += txt(12, 70, "craie et lits de silex", { petit: true });
        s += txt(300, MER + 20, "galets de silex", { petit: true, clair: true });
        s += compteur(412, 14, 0, { libelle: "aujourd'hui" });
        return s;
      },
    };
  };

  //@@SCENES@@

  // ─────────────────────────────── données : étapes des roches sédimentaires (remplacent celles de formation.js) ───────────────────────────────
  const E = (court, titre, quand, duree, scene, p, extra) => Object.assign({ court, titre, quand, scene, p: p || {} }, duree ? { duree } : {}, extra || {});
  const poser = (id, o) => { if (ROCHES_F[id]) Object.assign(ROCHES_F[id], o); };

  SOURCES.valensole = "Poudingue de Valensole : formé par la coalescence de cônes issus des paléo-Durance, paléo-Bléone et paléo-Asse. Ses galets, bien arrondis, proviennent des Alpes (calcaires subalpins, flysch, roches cristallines) ; le sondage des Mées traverse plus de 800 m de sédiments, et le plateau domine la Durance d'environ 400 m (Planet-Terre, ENS de Lyon, « Les Pénitents des Mées », 2020). Dépôt d'avant-pays de la collision alpine, enfoncé le long de la faille de la Durance, il présente un ciment gréseux et une porosité de 1 à 5 % (fiche de la masse d'eau FRDG209, Agence de l'eau Rhône-Méditerranée, 2014). Plateau daté de 1,8 Ma (Wikipédia, « Plateau de Valensole »). Pour la couche suivie (≈ 350 m), la profondeur est estimée d'après sa position sous le plateau.";

  poser("conglomerat", {
    exemple: "Exemple suivi : poudingue de Valensole et Pénitents des Mées (Alpes-de-Haute-Provence), où des débris alpins se déposent entre 8 et 1,8 million d'années.",
    anim: [
      E("Érosion, cône", "Les Alpes montent et se soulèvent ; l'érosion orageuse, puis les torrents et les rivières qui roulent les blocs, les arrondit avant de les étaler en cônes au pied de la chaîne", "De 8 à 5 millions d'années", "3 millions d'années", "piemontCone", {}, { allonge: 2 }),
      E("Enfouissement", "Le long de la faille de la Durance, le bassin s'enfonce : de nouveaux cônes ensevelissent nos galets, peu à peu sous ≈ 350 m de sédiments", "De 5 millions à 1,8 million d'années", "3 millions d'années", "piemontEnfouissement", {}),
      E("Cimentation", "L'eau qui circule entre les galets dépose un ciment de calcite dans le sable environnant : les vides se comblent et le gravier devient poudingue", "Pendant l'enfouissement, vers 20 °C", null, "loupeRoche",
        { titre: "Dans le poudingue, à la loupe", lignes: ["L'eau de pluie infiltrée dissout", "légèrement les galets calcaires, puis", "précipite de nouveau la calcite dans les vides", "du sable entre les galets : l'ensemble", "se cimente. Les galets, eux, ne", "changent pas."], vides: [25, 3], temperature: [20, 20] }),
      E("Incision", "Le dépôt cesse ; la Durance creuse 400 m dans le plateau, et le ruissellement dégage le poudingue en colonnes : ce sont les Pénitents des Mées", "De 1,8 million d'années à aujourd'hui", "1,8 million d'années", "piemontIncision", {}),
    ],
    animCurseur: "depart",
    cond: { type: "enfouissement", tmax: 9, zmax: 1, seuils: [], chemin: [
      { age: 8, z: 0, n: 1, t: "Les rivières alpines usent la montagne, charrient les galets et les étalent en cônes au pied de la chaîne." },
      { age: 5, z: 0.02, n: 2, t: "Nos galets se mettent en place tandis que le long de la faille de la Durance le bassin s'enfonce." },
      { age: 2.3, z: 0.3, n: 3, t: "Sous ≈ 350 m de dépôts (≈ 20 °C), l'eau qui circule dépose un ciment de calcite." },
      { age: 1.8, z: 0.35, n: 4, t: "Le dépôt s'interrompt ; la Durance entaille le plateau, et le poudingue revient à l'air libre sur le versant de la vallée." },
      { age: 0, z: 0 }] },
    src: ["gradient", "valensole"],
  });

  SOURCES.tholonet = "Au pied d'un relief né à la fin du Crétacé, la brèche du Tholonet est formée d'éboulis anguleux, non polis (parcours très court), cimentés par des eaux chargées de calcaire et d'argile. Mal nommée « marbre », elle sert depuis le XVIIIᵉ siècle aux demeures d'Aix et de Marseille (B. de l'Esp, « Le marbre du Tholonet », 2018). Les brèches bégudiennes à daniennes, à matrice argileuse orangée, sont contemporaines du soulèvement (Accro2Géologie, « La Sainte-Victoire »). Une brèche compte au moins 50 % d'éléments anguleux de plus de 2 mm (Wikipédia, « Brèche (roche) »).";
  SOURCES.ghaub = "Tillite du Ghaub : bourrelet de moraine déposé à la ligne d'échouage d'un inlandsis, sur le bas du talus de la plate-forme carbonatée d'Otavi (Namibie), vers 635 Ma et à basse latitude (Domack E. W. et Hoffman P. F., 2011, <i>GSA Bulletin</i> 123, p. 1448 à 1477). Des calcaires de fin de glaciation (Maieberg) reposent directement sur la moraine, témoins d'une glaciation presque planétaire, la « Terre boule de neige » (Hoffman P. F. et al., 1998, <i>Science</i> 281, 1342). Profondeur d'enfouissement schématique.";

  if (window.Textures && Textures._ROCHES && Textures._ROCHES.breche_sedimentaire) Object.assign(Textures._ROCHES.breche_sedimentaire, {
    grains: [
      { cle: "calcite", ab: "Cal", nom: "Calcaire clair", fond: "#ece4d2", taches: "#cfc2a6", part: 0.36, role: "fragments issus des strates calcaires de la butte" },
      { cle: "gris:calcite", ab: "Cal", nom: "Calcaire gris", fond: "#cac7be", taches: "#aeaa9f", part: 0.15, role: "fragments d'autres strates du même relief" },
      { cle: "dolomite", ab: "Dol", nom: "Dolomie", fond: "#dcc6a0", taches: "#c2a97e", part: 0.07, role: "fragments beiges" },
      { cle: "quartz", ab: "Qz", nom: "Silex", fond: "#8f877c", part: 0.03, role: "éclats sombres" },
    ],
    liant: { titre: "Matrice : boue durcie entre les clastes", nom: "Matrice", fond: "#b57a58", taches: ["#9e6446", "#c79070", "#e8dcc6"], role: "argile teintée de rouge par l'oxyde de fer, cimentée à la calcite" },
  });
  poser("breche_sedimentaire", {
    exemple: "Exemple suivi : au pied de la Sainte-Victoire (Provence), la brèche du Tholonet : ces éboulis, cimentés voilà 70 à 60 millions d'années, ont été polis sous le nom de « marbre du Tholonet ».",
    anim: [
      E("Éboulis", "Un banc calcaire se plisse et remonte ; ses falaises lâchent des blocs qui ne roulent que sur quelques centaines de mètres : anguleux, ils s'entassent sans trier", "À la fin du Crétacé", "des millions d'années", "eboulisChute", {}, { allonge: 1.3 }),
      E("Cimentation", "L'éboulis s'alourdit ; l'eau de pluie, chargée de calcaire dissous et d'argile rouge, s'y infiltre et remplit les vides : le matériau meuble se transforme en roche, la brèche", "Au Paléogène inférieur, non loin de la surface", "des millions d'années", "eboulisCimentation", {}, { allonge: 1.2 }),
      E("Brèche", "Une fois sciée et polie, elle révèle des fragments anguleux emprisonnés dans une boue rouge durcie : voilà le « marbre » du Tholonet", "Aujourd'hui", null, "loupeRoche",
        { titre: "Dans la brèche, à la loupe", lignes: ["Des fragments anguleux, de toutes", "dimensions variées, dans une boue rouge durcie.", "Une fois polie, elle a été commercialisée sous le", "nom de « marbre du Tholonet »", "pour orner les demeures d'Aix", "dès le XVIIIᵉ siècle."], vides: [6, 1] }),
    ],
    cond: { type: "grains", agents: ["gravité (éboulis)", "ruissellement"], grains: [[2, 1000]], legende: [
      "Au pied des falaises, les blocs éboulés ne parcourent que quelques centaines de mètres : ils demeurent anguleux et non triés.",
      "De l'eau de pluie, chargée de calcaire et d'argile, pénètre l'éboulis et en comble les vides : il se mue en brèche.",
      "Débitée et polie, la brèche du Tholonet a servi de pierre d'ornement sous le nom de « marbre »."] },
    src: ["tholonet"],
  });

  poser("tillite", {
    exemple: "Exemple suivi : la tillite du Ghaub (Namibie), une moraine abandonnée il y a 635 millions d'années lors d'une glaciation presque planétaire, en bordure de la plate-forme d'Otavi.",
    anim: [
      E("Glacier", "La Terre est presque entièrement prise dans les glaces ; l'inlandsis progresse sur la plate-forme, déchausse des blocs, les traîne, raye la roche et la pulvérise ; là où il flotte, il lâche le tout en vrac", "Vers 640 millions d'années", "des millions d'années", "inlandsisAvance", {}, { allonge: 1.3 }),
      E("Fonte", "Le climat change : la glace fond et recule, la mer envahit la moraine et y dépose directement des calcaires d'eau chaude", "Vers 635 millions d'années", "quelques milliers d'années", "inlandsisFonte", {}, { allonge: 1.2 }),
      E("Enfouissement", "Des couches supérieures écrasent la moraine : blocs, sable et farine se compactent et chassent leur eau", "De 635 à 540 millions d'années", "près de 100 millions d'années", "enfouissementSed",
        { couches: [[635, 600, "#e8d7c3", "calcaires de fin de glaciation"], [600, 540, "#9aa28f", "schistes et grès"]], age0: 635, age1: 540, zmax: 2, nomRoche: "la moraine", couleurRoche: "#9a978c", vides: [32, 8], grainClair: "#e3dcd0", grainFonce: "#6f685e",
          loupeTexte: ["à la loupe : la farine se compacte", "entre les blocs, l'eau est expulsée"], echelleLoupe: 0.45 }),
      E("Tillite", "Consolidée, la moraine est devenue tillite : blocs et graviers de toutes tailles, dont certains striés par la glace, noyés dans une pâte de farine rocheuse", "Depuis 540 millions d'années", null, "loupeRoche",
        { titre: "Dans la tillite, à la loupe", lignes: ["Des fragments de toutes tailles,", "anguleux, parfois rayés, dans une", "pâte grise : la farine de roche", "broyée par la glace, compactée puis", "cimentée. Aucun tri : c'est la", "signature d'un dépôt glaciaire."], vides: [8, 1] }),
    ],
    cond: { type: "grains", agents: ["glacier"], grains: [[0.001, 3000]], legende: [
      "L'inlandsis déchausse des blocs, les traîne sur la roche (stries) et la réduit en une fine farine.",
      "Lorsqu'il flotte, le glacier relâche tout en vrac, sans tri : une moraine. À la fonte, la mer recouvre le dépôt de calcaires.",
      "Enfouie sous d'autres couches, la moraine se compacte, perd son eau et se cimente : il s'agit d'une tillite."] },
    src: ["ghaub"],
  });


  poser("argile", {
    anim: [
      E("Altération", "Sur les terres émergées, l'eau de pluie désagrège les roches : feldspaths et micas se transforment en minéraux argileux de moins de 2 µm, que les rivières emportent", "Vers 56 millions d'années", null, "littoralErosion", { cible: "argile", ages: [57, 56, 48] }),
      E("Décantation", "À l'embouchure, le sable se dépose rapidement, près du rivage ; l'argile, qu'il faut environ 3 jours pour parcourir un mètre d'eau calme, reste longtemps en suspension et se dépose surtout au large, là où l'eau est immobile ; dans l'eau salée, ses paillettes s'agglomèrent en flocons qui tombent plus vite (vasières des estuaires)", "De 56 à 48 millions d'années", "8 millions d'années", "littoralDepot",
        { cible: "argile", ages: [57, 56, 48], texteLoupe: "boue d'argile : paillettes gorgées d'eau", videsLoupe: 60, echelleLoupe: 0.5, titreDepot: "au large, dans une eau tranquille, l'argile se dépose : une boue fine s'accumule" }),
      E("Enfouissement", "Des strates la surmontent : la boue expulse son eau et se compacte, mais, peu enfouie, elle demeure une argile tendre", "Depuis 48 millions d'années", null, "enfouissementSed",
        { couches: [[48, 34, "#d8cdb0", "Éocène : sables"], [34, 20, "#c9bfa5", "Oligocène à Miocène inférieur"]], age0: 48, age1: 20, zmax: 0.5, nomRoche: "l'argile", couleurRoche: "#8f9194", vides: [60, 35], grainClair: "#b9bfc4", grainFonce: "#6f7780", echelleLoupe: 0.5,
          loupeTexte: ["à la loupe : les paillettes se couchent", "et se serrent, l'eau est expulsée"] }),
      E("Argile", "Lits d'argile très fine, parfois un peu plus silteux : roche tendre, plastique à l'état humide", "Aujourd'hui", null, "loupeRoche",
        { mode: "depot", titre: "Dans l'argile, au microscope", eauFond: "#cfdde3", particule: "#9a9c9c", nomDessous: "eau calme au-dessus du fond",
          lignes: ["Des lits de paillettes d'argile,", "trop fines pour être vues à l'œil,", "alternent avec des lits un peu plus", "silteux, apportés par les crues.", "Elles se déposent une à une, en", "eau calme, au fil des millénaires."] }),
    ],
    src: ["ferguson"],
  });

  SOURCES.heezen = "Courant de turbidité du séisme des Grands Bancs (Terre-Neuve, 1929), qui a rompu les câbles sous-marins les uns après les autres : Heezen B. C. et Ewing M. (1952), <i>American Journal of Science</i> 250, 849.";
  SOURCES.fontainebleau = "Sables de Fontainebleau : sable de quartz très pur déposé dans une mer peu profonde au Rupélien, parfois cimenté en grès (les rochers de la forêt) (Wikipédia, « Sables de Fontainebleau »).";

  poser("sable", {
    anim: [
      E("Altération", "Sur les terres émergées, l'eau désagrège les roches : les feldspaths deviennent argile, tandis que le quartz, quasi inaltérable, persiste en grains ; les cours d'eau acheminent le tout jusqu'à la mer", "Vers 34 millions d'années", null, "littoralErosion", { cible: "sable", ages: [35, 34, 28] }),
      E("Tri", "Au littoral, houle et courants nettoient le sable : les argiles s'éloignent au large, les grains de quartz, plus lourds, s'attardent sur la côte en bancs très purs", "Au Rupélien (33,9 à 27,3 Ma)", "des millions d'années", "littoralDepot",
        { cible: "sable", ages: [35, 34, 28], texteLoupe: "des grains de quartz lavés et triés", videsLoupe: 40, echelleLoupe: 0.42, titreDepot: "au voisinage du rivage, strate après strate, un sable de quartz presque pur" }),
      E("Resté meuble", "Coiffé d'à peine quelques dizaines de mètres de calcaire, il n'a jamais été assez enfoui ni chauffé pour se cimenter : il demeure meuble", "Depuis 28 millions d'années", "des dizaines de millions d'années", "enfouissementSed",
        { couches: [[28, 20, "#d8cdb0", "calcaires de Beauce"]], age0: 28, age1: 5, zmax: 0.15, nomRoche: "les sables", couleurRoche: "#efe6cf", vides: [40, 38], surface: ["plateau", "#9dbb86"], grainClair: "#fbf6ea", grainFonce: "#c9b98a",
          loupeTexte: ["à la loupe : des grains de quartz", "non soudés, le sable reste meuble"], echelleLoupe: 0.42 }),
      E("Sable", "Des grains de quartz arrondis et calibrés, en contact sans soudure : l'eau circule librement entre eux", "Aujourd'hui", null, "loupeRoche",
        { mode: "fixe", titre: "Dans le sable, au microscope", lignes: ["Des grains de quartz arrondis,", "de même taille, qui se touchent", "sans être soudés : l'eau circule", "entre eux. Par endroits, de la", "silice les a soudés : ce sont les", "rochers de grès de la forêt."] }),
    ],
    src: ["ferguson", "fontainebleau"],
  });

  poser("siltite", {
    anim: [
      E("Altération", "Sur un massif ancien, l'eau désagrège la roche ; grains fins de quartz, paillettes de mica et argiles sont entraînés par les cours d'eau", "Vers 500 millions d'années", null, "littoralErosion", { cible: "limon", ages: [502, 500, 466] }),
      E("Dépôt", "Plus loin que le sable, en eau calme, se déposent les limons (quelques centièmes de millimètre) : un grain de 20 µm met près de 47 minutes à tomber d'un mètre", "Vers 470 millions d'années", "des millions d'années", "littoralDepot",
        { cible: "limon", ages: [502, 500, 466], texteLoupe: "lits minces de limons et de paillettes de mica", videsLoupe: 45, echelleLoupe: 0.45, titreDepot: "au centre du plateau, les limons forment des lits minces" }),
      E("Enfouissement", "Des strates les surmontent sur plusieurs kilomètres : compactés et cimentés, les limons deviennent une roche dure, la siltite", "De 466 à 350 millions d'années", "plus de 100 millions d'années", "enfouissementSed",
        { couches: [[466, 420, "#7e8278", "Ordovicien-Silurien : schistes"], [420, 350, "#9aa28f", "Dévonien : schistes et grès"]], age0: 466, age1: 350, zmax: 4, nomRoche: "les limons", couleurRoche: "#9a9585", grainFonce: "#6b6a5c", grainClair: "#d9d3c4", vides: [45, 10], rythme: "≈ 35 m de dépôts par million d'années", echelleLoupe: 0.45,
          loupeTexte: ["à la loupe : les lits se resserrent,", "l'eau est chassée"] }),
      E("Plissement, érosion", "La collision hercynienne plie et relève la série ; durant des centaines de millions d'années, l'érosion aplanit la chaîne jusqu'à mettre la siltite à nu", "De 320 millions d'années à aujourd'hui", "320 millions d'années", "plissementErosion",
        { ages: [320, 300], couleurCouche: "#9a9585", grains: "#d9d3c4", nomCouche: "siltite", creteNom: " " }),
      E("Siltite", "Roche dure, fendue en plaquettes, faite de lits de limon et d'argile minces comme du papier, cimentés entre eux", "Aujourd'hui", null, "loupeRoche",
        { mode: "fixe", titre: "Dans la siltite, au microscope", lignes: ["Des lits de grains de limon (clairs)", "et d'argile (sombres), chacun", "déposé par une crue ou une", "tempête, puis soudés par", "l'enfouissement."] }),
    ],
    cond: { type: "enfouissement", tmax: 520, zmax: 6, seuils: ["quartz", "anchizone"], chemin: [
      { age: 500, z: 0, n: 1, t: "Sur un massif ancien, l'eau désagrège la roche : grains fins de quartz, micas et argiles sont entraînés par les cours d'eau." },
      { age: 470, z: 0, n: 2, t: "Au-delà du sable, en eau plus calme, les limons se déposent en lits fins." },
      { age: 466, z: 0.1, n: 3, t: "Des strates les surmontent : compactés et cimentés sous plusieurs kilomètres, ils passent à l'état de siltite." },
      { age: 320, z: 4, n: 4, t: "La collision hercynienne plie la série ; l'érosion rabote la chaîne, et la siltite gagne lentement la surface." },
      { age: 270, z: 0.5 }, { age: 0, z: 0 }] },
    src: ["gradient", "ferguson"],
  });

  poser("marne", {
    anim: [
      E("Altération", "Sur les terres proches, l'eau désagrège les roches : les cours d'eau transportent vers la mer des argiles très fines", "Au Jurassique (≈ 162 Ma)", null, "littoralErosion", { cible: "marne", plancton: true, ages: [163, 162, 158] }),
      E("Dépôt", "Loin des côtes, l'argile se dépose lentement tandis que les plaques de calcite du plancton tombent de la surface : ensemble, elles forment un sédiment à 35 à 65 % de calcite", "Au Jurassique (≈ 160 Ma)", "des millions d'années", "littoralDepot",
        { cible: "marne", plancton: true, ages: [163, 162, 158], texteLoupe: "argile et calcite du plancton, mêlées", videsLoupe: 60, echelleLoupe: 0.45, titreDepot: "argile fluviale et calcite planctonique sédimentent de concert" }),
      E("Enfouissement", "Sous l'effet de l'enfouissement, la boue se compacte, expulse son eau et se durcit en marne", "De 160 à 100 millions d'années", "des dizaines de millions d'années", "enfouissementSed",
        { couches: [[160, 145, "#9aa28f", "Jurassique supérieur"], [145, 100, "#c9bfa5", "Crétacé inférieur"]], age0: 160, age1: 100, zmax: 1.5, nomRoche: "la boue marneuse", couleurRoche: "#8e918b", grainFonce: "#6b6a5c", grainClair: "#d9d3c4", vides: [60, 25], rythme: "≈ 25 m par million d'années", echelleLoupe: 0.45,
          loupeTexte: ["à la loupe : la boue se compacte", "et perd son eau"] }),
      E("Marne", "Des lits légèrement plus calcaires se succèdent à des lits légèrement plus argileux : roche tendre, qui se désagrège à l'air (badlands des Terres Noires)", "Aujourd'hui", null, "loupeRoche",
        { mode: "depot", titre: "Dans la marne, au microscope", eauFond: "#d8e2e4", particule: "#ffffff", nomDessous: "eau calme au-dessus du fond",
          lignes: ["Argile (sombre) et calcite du", "plancton (claire) se déposent", "ensemble ; selon les années,", "l'un ou l'autre domine : des lits", "alternent. À l'air, la marne se", "délite : les Terres Noires."] }),
    ],
  });

  poser("grauwacke", {
    anim: [
      E("Avalanche", "Sur la bordure d'un bassin marin profond, un delta déverse sable et boue ; un séisme provoque l'effondrement de ce tas, qui glisse en avalanche sous-marine (courant de turbidité).", "Vers 560 millions d'années", "quelques heures pour une avalanche", "turbiditeUne", { ages: [562, 560, 540] }, { allonge: 1.2 }),
      E("Bancs", "Chaque avalanche dépose au fond un banc de sable mal calibré et chargé de boue ; les centaines de bancs s'accumulent", "De 560 à 540 millions d'années", "20 millions d'années", "turbiditePile",
        { ages: [562, 560, 540], texteLoupe: "grains anguleux noyés dans la boue", echelleLoupe: 0.45 }),
      E("Enfouissement", "À plusieurs kilomètres de profondeur, les bancs se compactent ; entre 200 et 300 °C, la boue située entre les grains se transforme en chlorite et en mica (très faible métamorphisme)", "De 540 à 350 millions d'années", "190 millions d'années", "enfouissementSed",
        { couches: [[540, 445, "#7e8278", "Cambrien-Ordovicien : grès et schistes"], [445, 360, "#9aa28f", "Silurien-Dévonien : schistes et grès"]], age0: 540, age1: 350, zmax: 6, nomRoche: "les sables mal triés", couleurRoche: "#8d8a7c", grainFonce: "#6b6a5c", grainClair: "#d9d3c4", vides: [30, 3], surface: ["mer profonde", "#3f6f95"], rythme: "≈ 30 m de dépôts par million d'années", echelleLoupe: 0.45,
          loupeTexte: ["à la loupe : la boue entre les grains", "durcit et verdit (chlorite)"] }),
      E("Plissement, érosion", "La collision hercynienne plie et relève la série ; l'érosion aplanit la chaîne, jusqu'à faire affleurer la grauwacke", "De 350 millions d'années à aujourd'hui", "350 millions d'années", "plissementErosion",
        { ages: [340, 300], couleurCouche: "#8d8a7c", grains: "#d9d3c4", nomCouche: "grauwacke", creteNom: "crête de grauwacke" }),
      E("Grauwacke", "Grès sombre, mal classé, où des grains anguleux de quartz et de feldspath baignent dans une matrice verdâtre d'argile et de chlorite", "Aujourd'hui", null, "loupeRoche",
        { mode: "fixe", titre: "Dans la grauwacke, au microscope", lignes: ["Des grains anguleux, jamais", "lavés : l'avalanche a tout déposé", "d'un coup, sable et boue mêlés.", "Chauffée, la boue est devenue", "chlorite et mica (vert)."] }),
    ],
    cond: { type: "enfouissement", tmax: 520, zmax: 8, seuils: ["quartz", "anchizone"], chemin: [
      { age: 480, z: 0, n: 1, t: "Au rebord du plateau, sable et boue s'amassent puis dévalent la pente en avalanches sous-marines." },
      { age: 470, z: 0.1, n: 2, t: "Au fond du bassin s'empilent des centaines de bancs granoclassés, à matrice argileuse abondante." },
      { age: 460, z: 0.5, n: 3, t: "Une fois enfouis à plusieurs kilomètres, ils gagnent le très faible métamorphisme : la matrice se transforme en chlorite et en mica." },
      { age: 350, z: 6, n: 4, t: "Sous la collision hercynienne, la série se plisse ; l'érosion, en rabotant la chaîne, rapproche peu à peu la grauwacke de la surface." },
      { age: 280, z: 1 }, { age: 0, z: 0 }] },
    src: ["gradient", "walderhaug", "heezen"],
  });

  poser("flysch", {
    anim: [
      E("Avalanche", "Sur la marge d'un océan en train de se refermer, sable et boue s'accumulent au bord du plateau ; un séisme les précipite en avalanche sous-marine", "Vers 90 millions d'années", "quelques heures pour une avalanche", "turbiditeUne", { ages: [92, 90, 70] }, { allonge: 1.2 }),
      E("Alternances", "Chaque avalanche laisse un banc de sable ; dans l'intervalle, la boue sédimente lentement : il en résulte des centaines d'alternances régulières", "De 90 à 70 millions d'années", "20 millions d'années", "turbiditePile",
        { ages: [92, 90, 70], texteLoupe: "bancs de grès fin et lits d'argile", echelleLoupe: 0.3 }),
      E("Enfouissement", "Ces alternances s'entassent au fond du bassin, puis gagnent plusieurs kilomètres de profondeur", "De 70 à 35 millions d'années", "35 millions d'années", "enfouissementSed",
        { couches: [[70, 56, "#9aa28f", "Maastrichtien à Paléocène : flysch"], [56, 35, "#8a8a7c", "Éocène : flysch"]], age0: 70, age1: 35, zmax: 4, nomRoche: "les bancs de flysch", couleurRoche: "#b8b19c", grainFonce: "#6b6a5c", grainClair: "#d9d3c4", vides: [35, 10], surface: ["mer profonde", "#3f6f95"], rythme: "≈ 100 m de dépôts par million d'années", echelleLoupe: 0.3,
          loupeTexte: ["à la loupe : bancs et lits", "se tassent et durcissent"] }),
      E("Plissement, érosion", "Happées par la collision (Alpes, Pyrénées), les alternances se plissent puis s'élèvent ; l'érosion les sculpte en falaises et en crêtes", "De 35 millions d'années à aujourd'hui", "35 millions d'années", "plissementErosion",
        { ages: [35, 20], couleurCouche: "#c9c2ab", grains: "#6b6a5c", nomCouche: "flysch", creteNom: "crête de flysch" }),
      E("Flysch", "Bancs de grès fin à base franche, alternés de lits argileux ; à leur surface, des traces de vers en méandres : les Helminthoïdes", "Aujourd'hui", null, "loupeRoche",
        { mode: "fixe", titre: "Dans le flysch, surface sciée", lignes: ["Un banc de grès par avalanche,", "un lit d'argile entre deux :", "des centaines de répétitions.", "Les « Helminthoïdes » sont des", "traces de vers qui fouillaient", "la boue du fond."] }),
    ],
    cond: { type: "enfouissement", tmax: 110, zmax: 6, seuils: ["quartz"], chemin: [
      { age: 92, z: 0, n: 1, t: "Sur la marge d'un océan en fermeture, sable et boue dévalent la pente en avalanches sous-marines." },
      { age: 88, z: 0.1, n: 2, t: "S'empilent alors des centaines d'alternances de bancs gréseux et de lits argileux." },
      { age: 70, z: 1, n: 3, t: "Au fond du bassin, elles gagnent plusieurs kilomètres de profondeur." },
      { age: 35, z: 4, n: 4, t: "Engagées dans la collision, elles se plissent puis remontent ; l'érosion les remet au jour." },
      { age: 0, z: 0 }] },
    src: ["gradient", "walderhaug", "heezen"],
  });

  poser("arkose", {
    anim: [
      E("Érosion, cône", "L'étirement de la chaîne hercynienne ouvre des bassins affaissés le long de failles. En climat sec, quelques orages arrachent au granite voisin sables et graviers ; parcourant peu de chemin, les grains restent anguleux et les feldspaths ne se transforment guère", "De 300 à 290 millions d'années", "10 millions d'années", "piemontCone",
        { style: "granite", sec: true, galets: ["#f1ede4", "#e2ad94", "#e2ad94", "#f1ede4", "#d9b3a3", "#ebe7de"], ages4: [300, 290, 230, 0],
          labels: { ouest: "socle", moteur: "faille : le bassin s'effondre", nos: "nos sables" },
          zooms: [["arraché : anguleux", 0], ["roulé : encore anguleux", 0.08], ["au bout : à peine émoussé", 0.22]],
          titres: ["la chaîne hercynienne s'allonge : un bassin s'affaisse sur une faille", "de rares orages détachent du granite sable et graviers", "ils forment des cônes d'étalement : grains anguleux, feldspaths intacts", "", "", ""] }, { allonge: 1.5 }),
      E("Enfouissement", "D'autres sédiments les couvrent (grès rouges du Permien, grès et argiles du Trias) ; à environ 1,8 km de profondeur, ils se resserrent", "De 290 à 230 millions d'années", "60 millions d'années", "enfouissementSed",
        { couches: [[290, 260, "#b9876c", "Permien : grès rouges"], [260, 230, "#cfa98c", "Trias : grès et argiles"]], age0: 290, age1: 230, zmax: 1.8, nomRoche: "les sables à feldspaths", couleurRoche: "#dcbfa6", grainFonce: "#e2ad94", grainClair: "#f1ede4", vides: [38, 24], surface: ["plaine sèche", "#d9c29a"], rythme: "≈ 30 m de dépôts par million d'années", echelleLoupe: 0.5,
          loupeTexte: ["à la loupe : grains de quartz (gris)", "et de feldspath (roses) se compactent"] }),
      E("Cimentation", "Vers 60 °C, argiles et un peu de silice précipitent entre les grains et les lient : le sable se transforme en arkose", "Pendant l'enfouissement", null, "loupeRoche",
        { titre: "Dans l'arkose, au microscope", vides: [24, 8], temperature: [55, 64], lignes: ["Des grains anguleux, à peine usés :", "quartz gris et feldspath rose, qui", "sous un climat humide serait", "devenu argile. L'eau qui circule", "dépose argiles et silice entre", "eux : le sable devient roche."] }),
      E("Remontée", "La région se soulève ; durant des dizaines de millions d'années, l'érosion décape les couches supérieures : l'arkose affleure en bordure du Massif central", "De 150 millions d'années à aujourd'hui", "150 millions d'années", "exhumationSed",
        { couches: [[290, 260, "#b9876c", "Permien : grès rouges"], [260, 230, "#cfa98c", "Trias : grès et argiles"]], age0: 150, age1: 0, zmax: 1.8, nomRoche: "l'arkose", couleurRoche: "#dcbfa6", grainFonce: "#e2ad94", grainClair: "#f1ede4",
          moteur: ["le Massif central se soulève ;", "la pluie et les rivières emportent la partie supérieure"], titreFin: "l'arkose affleure : grès roses à feldspaths" }),
    ],
    cond: { type: "enfouissement", tmax: 320, zmax: 4, seuils: ["quartz"], chemin: [
      { age: 300, z: 0, n: 1, t: "Sous l'effet de l'étirement hercynien, des bassins s'affaissent ; en climat sec, le granite voisin s'use rapidement, sans que ses feldspaths ne se dégradent." },
      { age: 290, z: 0.05, n: 2, t: "Le bassin se comble de sables anguleux riches en feldspath ; d'autres sédiments les surmontent." },
      { age: 230, z: 1.8, n: 3, t: "À environ 1,8 km (≈ 60 °C), ils sont compactés et liés par des argiles et de la silice." },
      { age: 150, z: 1.8, n: 4, t: "La région se soulève ; l'érosion décape les strates supérieures, et l'arkose revient au jour." },
      { age: 0, z: 0 }] },
    src: ["gradient"],
  });

  poser("molasse", {
    anim: [
      E("Érosion, dépôt", "Les Alpes progressent et se relèvent ; l'érosion orageuse, puis les rivières, étalent sables et galets au pied du massif", "De 30 à 20 millions d'années", "10 millions d'années", "piemontCone",
        { xs: 230, flexure: true, ages4: [30, 20, 8, 0], labels: { ouest: "Massif central", nos: "nos sables", riviere: "Isère" },
          titres: ["les Alpes progressent et se relèvent ; l'érosion orageuse les attaque", "torrents et cours d'eau entraînent galets, sables et boues", "au pied du massif, le bassin se comble de leurs débris, couche après couche", "", "", ""] }, { allonge: 1.5 }),
      E("Bassin d'avant-pays", "Le poids de la chaîne fait fléchir la plaque : le bassin plonge, surtout près du massif, et se comble ; nos sables disparaissent sous ≈ 1,5 km de débris", "De 20 à 8 millions d'années", "12 millions d'années", "piemontEnfouissement",
        { xs: 230, flexure: true, mpx: 40, ages4: [30, 20, 8, 0], videsLoupe: [38, 28], echelleLoupe: 0.5, labels: { ouest: "Massif central", nos: "nos sables", riviere: "Isère" },
          titres: ["", "", "", "sous la chaîne, la plaque se courbe ; le bassin s'abaisse et se remplit", "", ""] }),
      E("Cimentation partielle", "Entre 0,5 et 2 km de profondeur, la molasse n'a reçu qu'un ciment calcitique partiel : grès tendre, aisément taillable", "Pendant l'enfouissement", null, "loupeRoche",
        { titre: "Dans la molasse, au microscope", vides: [28, 18], temperature: [45, 55], lignes: ["Des grains de sable (quartz, calcaire,", "feldspath) à peine soudés par un", "peu de calcite : de nombreux vides subsistent", "restent ouverts. La roche reste", "tendre, facile à tailler : une pierre", "matériau de construction des Alpes du Nord."] }),
      E("Incision", "Le comblement du bassin s'arrête ; l'Isère et le Rhône entaillent le terrain, et la molasse apparaît sur les versants des vallées", "De 8 millions d'années à aujourd'hui", "8 millions d'années", "piemontIncision",
        { xs: 230, flexure: true, mpx: 40, penitents: false, ages4: [30, 20, 8, 0], labels: { ouest: "Massif central", nos: "nos sables", riviere: "Isère" },
          titres: ["", "", "", "", "les rivières cessent de déposer et entaillent le substrat", "la vallée entaille la molasse, qui se découvre sur ses versants"] }),
    ],
    cond: { type: "enfouissement", tmax: 40, zmax: 3, seuils: [], chemin: [
      { age: 30, z: 0, n: 1, t: "Les Alpes montent et s'usent ; au pied du massif, les rivières répartissent sables et galets." },
      { age: 20, z: 0.05, n: 2, t: "Chargée par la chaîne, la plaque s'affaisse : le bassin descend et se remplit sur des kilomètres d'épaisseur de débris." },
      { age: 10, z: 1.3, n: 3, t: "À environ 1,5 km de profondeur, la molasse reste en partie non cimentée : grès tendres alternant avec des marnes." },
      { age: 8, z: 1.5, n: 4, t: "Le remplissage du bassin prend fin ; les cours d'eau creusent, et la molasse réapparaît en surface." },
      { age: 0, z: 0 }] },
    src: ["gradient"],
  });

  const CRAIE = ["#f4f1e9", "#fbf9f4"];
  poser("craie", {
    anim: [
      E("Plancton", "Au large, sur 50 à 300 m d'eau, des algues microscopiques (coccolithophoridés) bâtissent de minuscules plaques de calcite ; sur le fond, les éponges construisent des squelettes d'opale", "Du Cénomanien au Campanien (100,5 à 72,2 Ma)", null, "merVie",
        { milieu: "large", vie: ["coccolithes", "eponges"], couleurs: CRAIE, ages: [92, 90, 86], labFond: "fond de la mer de la craie, 50 à 300 m",
          titres: ["au large, peu d'apports de sable ou d'argile parviennent à la mer", "de minuscules algues sécrètent des plaques de calcite", "plaques et débris se déposent : une boue blanche gagne le fond"] }),
      E("Boue blanche", "Une fois mortes, les plaques sédimentent au fond : une boue blanche quasi pure s'empile couche après couche ; la silice des éponges se rassemble en rognons de silex", "Pendant 28 millions d'années", "≈ 30 m par million d'années", "merDepot",
        { milieu: "large", vie: ["coccolithes", "eponges"], couleurs: CRAIE, ages: [92, 90, 86], silex: true, labFond: "fond de la mer de la craie, 50 à 300 m", texteLoupe: "coccolithes et petites coquilles", videsLoupe: 45, echelleLoupe: 0.42,
          titres: ["", "", "plaques et débris se déposent : une boue blanche gagne le fond"] }),
      E("Enfouissement faible", "Restée peu enfouie, la craie est à peine cimentée : elle conserve jusqu'à 40 % de vides", "Depuis 72 millions d'années", null, "enfouissementSed",
        { couches: [[72, 50, "#d8c7a0", "Paléogène : sables et argiles"]], age0: 72, age1: 50, zmax: 0.4, nomRoche: "la craie", couleurRoche: "#f4f1e9", grainFonce: "#e6dfd0", grainClair: "#ffffff", vides: [55, 42], rythme: "peu enfouie", echelleLoupe: 0.42,
          loupeTexte: ["à la loupe : la boue se resserre légèrement,", "mais les vides restent nombreux"] }),
      E("Craie", "Au microscope : coccolithes par milliards, rares coquilles de foraminifères, ciment presque absent ; roche blanche, tendre, poreuse", "Aujourd'hui", null, "loupeRoche",
        { titre: "Dans la craie, au microscope", vides: [42, 40], lignes: ["Une boue de coccolithes (plaques", "de calcite de quelques millièmes", "de mm) avec des coquilles de", "foraminifères. Presque rien ne", "les lie : la craie teinte les", "doigts et boit l'eau."] }),
      E("Falaises", "Le retrait de la mer de la craie, puis le soulèvement régional et l'érosion ont dégagé la craie ; aujourd'hui, la Manche en attaque le pied : falaises, arche et aiguille d'Étretat", "Aujourd'hui", null, "falaiseCraie", {}),
    ],
    src: ["photique"],
  });

  poser("silex", {
    anim: [
      E("Éponges", "Dans la mer de la craie, l'eau est très pauvre en silice, pourtant les éponges fabriquent des squelettes d'opale : c'est donc le vivant qui concentre cette silice", "Au Crétacé supérieur", null, "merVie",
        { milieu: "large", vie: ["eponges", "coccolithes"], couleurs: CRAIE, ages: [88, 87, 85], labFond: "fond de la mer de la craie",
          titres: ["au large, dans la mer de la craie", "au fond, les éponges édifient des spicules d'opale", ""] }),
      E("Rognons", "Dans l'eau des pores, située sous quelques mètres de boue, l'opale se dissout et reprécipite autour de points précis, en rognons de silex disposés en lits réguliers.", "Pendant le Crétacé supérieur, dans une craie peu enfouie", "des milliers à des millions d'années", "merDepot",
        { milieu: "large", vie: ["eponges", "coccolithes"], couleurs: CRAIE, ages: [88, 87, 85], silex: true, labFond: "fond de la mer de la craie", texteLoupe: "la silice remplace la craie", videsLoupe: 20, echelleLoupe: 0.45,
          titres: ["", "", "la boue se consolide ; la silice migre puis se rassemble en rognons"] }),
      E("Silex", "Peu à peu, la silice se substitue à la craie : opale d'abord, calcédoine ensuite ; les spicules et les coquilles laissent leurs fantômes", "Pendant l'enfouissement", null, "loupeRoche",
        { mode: "croissance", dessous: "#f1eee6", nomDessous: "craie pas encore remplacée", titre: "Dans le silex, au microscope",
          lignes: ["La silice précipite dans les pores", "de la craie et la remplace grain", "à grain : calcédoine (fibres de", "quartz). Il reste des fantômes de", "spicules et de foraminifères."] }),
      E("Galets", "La craie disparaît peu à peu par érosion et dissolution ; le silex, d'une grande dureté, résiste : galets des plages normandes et outils préhistoriques", "Aujourd'hui", null, "falaiseCraie",
        { titre: "la craie recule ; ses silex, eux, restent sur la plage", lignes: ["le silex, dur, se fracture en éclats", "tranchants : c'est la pierre des", "outils de la préhistoire"] }),
    ],
  });

  poser("tuffeau", {
    anim: [
      E("Mer côtière", "La Touraine est couverte d'une mer peu profonde ; les cours d'eau y déposent sable fin et micas ; coquillages, bryozoaires et éponges peuplent le fond, où se forme la glauconie verte", "Au Turonien (93,9 à 89,8 Ma)", null, "merVie",
        { milieu: "cotier", vie: ["coquilles", "eponges", "glauconie"], couleurs: ["#ece2c4", "#e4d8b5"], ages: [93, 92, 90], labFond: "fond de la mer du Turonien, sur quelques dizaines de mètres",
          titres: ["une mer peu profonde couvre la Touraine", "coquillages, bryozoaires et éponges peuplent le fond", ""] }),
      E("Dépôt", "Débris coquilliers, spicules, sable fin, micas et grains de glauconie se déposent ensemble : le mélange ne renferme qu'environ 50 % de calcite", "Au Turonien", "≈ 20 m par million d'années", "merDepot",
        { milieu: "cotier", vie: ["coquilles", "eponges", "glauconie"], couleurs: ["#ece2c4", "#e4d8b5"], ages: [93, 92, 90], labFond: "fond de la mer turonienne", texteLoupe: "coquilles, spicules, sable, glauconie", videsLoupe: 50, echelleLoupe: 0.42,
          titres: ["", "", "débris coquilliers, spicules, sable fin et glauconie se déposent"] }),
      E("Enfouissement faible", "Enfoui sur quelques centaines de mètres seulement, le tuffeau n'est que faiblement lié", "Depuis 90 millions d'années", null, "enfouissementSed",
        { couches: [[90, 66, "#e8e0c8", "Crétacé supérieur : craies"], [66, 40, "#d8c7a0", "Paléogène : sables et argiles"]], age0: 90, age1: 40, zmax: 0.4, nomRoche: "le tuffeau", couleurRoche: "#ece2c4", grainFonce: "#b8a57a", grainClair: "#fbf6ea", vides: [50, 45], rythme: "peu enfoui", echelleLoupe: 0.42,
          loupeTexte: ["à la loupe : un peu de calcite et", "d'opale soude à peine les grains"] }),
      E("Tuffeau", "Calcite et opale lient à peine les grains : pierre légère, tendre, facile à tailler, celle des châteaux de la Loire", "Aujourd'hui", null, "loupeRoche",
        { titre: "Dans le tuffeau, au microscope", vides: [45, 42], lignes: ["Débris de coquilles, spicules,", "sable fin et glauconie verte,", "à peine soudés : beaucoup de", "vides. Pierre légère et tendre,", "taillée pour les châteaux ; les", "carrières sont devenues caves."] }),
    ],
  });

  poser("falun", {
    anim: [
      E("Mer des faluns", "Bretagne et Bassin parisien étaient reliés par une mer chaude et très peu profonde, peuplée de coquillages, de bryozoaires et de requins ; la houle et les courants de marée brisaient les coquilles.", "Au Miocène (20 à 10 Ma)", null, "merVie",
        { milieu: "faluns", vie: ["coquilles"], couleurs: ["#e2d2a8", "#d8c592"], ages: [16, 15, 10], labFond: "fond de la mer des faluns, à des profondeurs allant de quelques mètres à plusieurs dizaines",
          titres: ["Mer chaude, très peu profonde, qu'on appelle « mer des faluns »", "coquillages et bryozoaires ; houle et marées fragmentent les coquilles", ""] }),
      E("Bancs", "Les courants trient les débris coquilliers, qui forment des bancs de sable coquillier", "Au Miocène", "des mètres par million d'années", "merDepot",
        { milieu: "faluns", vie: ["coquilles"], couleurs: ["#e2d2a8", "#d8c592"], ages: [16, 15, 10], labFond: "fond de la mer des faluns", texteLoupe: "coquilles brisées et sable", videsLoupe: 45, echelleLoupe: 0.4,
          titres: ["", "", "les débris triés forment des bancs de sable coquillier"] }),
      E("Peu enfoui", "Coiffé seulement de sables et de limons récents, le falun est souvent resté meuble ; par endroits (Anjou), un ciment de calcite déposé près de la surface en a fait un grès coquillier", "Depuis 10 millions d'années", null, "enfouissementSed",
        { couches: [[10, 0, "#c9b891", "sables et limons plus récents"]], age0: 10, age1: 0.1, zmax: 0.1, nomRoche: "le falun", couleurRoche: "#e2d2a8", grainFonce: "#b8a57a", grainClair: "#fbf6ea", vides: [45, 43], surface: ["plaine de la Loire", "#9dbb86"], rythme: "jamais enfoui profondément", echelleLoupe: 0.4,
          loupeTexte: ["à la loupe : coquilles et sable", "le plus souvent non soudés"] }),
      E("Falun", "Sable meuble de coquilles brisées, épandu autrefois dans les champs (le « falunage ») ; on y trouve des dents de requins", "Aujourd'hui", null, "loupeRoche",
        { mode: "fixe", titre: "Dans le falun, surface sciée", lignes: ["Coquilles entières et brisées,", "bryozoaires, grains de glauconie,", "dans un sable coquillier souvent", "meuble. On l'épandait sur les", "champs acides ; on y trouve des", "dents de requins."] }),
    ],
  });

  poser("radiolarite", {
    anim: [
      E("Plancton siliceux", "L'océan alpin porte 4 km d'eau. À la surface, les radiolaires élaborent un squelette d'opale ; le plancton calcaire, lui, fabrique des plaques de calcite", "Au Jurassique moyen et supérieur (165 à 145 Ma)", null, "merVie",
        { milieu: "ocean", vie: ["radiolaires", "coccolithes"], couleurs: ["#a4553c", "#b86a4e"], couleurFond: "#3e4b44", ages: [160, 158, 150], labFond: "fond de l'océan alpin, vers 4 km : basalte",
          titres: ["l'océan alpin : 4 km d'eau surmontent des fonds basaltiques", "à la surface, les radiolaires construisent un squelette d'opale", ""] }),
      E("Boue rouge", "Sous la profondeur de compensation, la calcite disparaît par dissolution ; seule la silice atteint le fond, où une boue rouge se dépose lentement", "Au Jurassique supérieur", "quelques mètres par million d'années", "merDepot",
        { milieu: "ocean", vie: ["radiolaires", "coccolithes"], couleurs: ["#a4553c", "#b86a4e"], couleurFond: "#3e4b44", ages: [160, 158, 150], labFond: "fond de l'océan alpin, vers 4 km : basalte", texteLoupe: "squelettes de radiolaires", videsLoupe: 30, echelleLoupe: 0.45,
          titres: ["", "", "seule la silice gagne le fond : une boue rouge, à très faible vitesse"] }),
      E("Enfouissement", "Enfouie sous des calcaires puis des schistes, la boue passe vers 40 °C à l'opale-CT, puis, entre 50 et 60 °C, à du quartz recristallisé", "De 150 à 100 millions d'années", "50 millions d'années", "enfouissementSed",
        { couches: [[150, 120, "#c9bfa5", "calcaires pélagiques"], [120, 100, "#9aa28f", "schistes"]], age0: 150, age1: 100, zmax: 1.6, nomRoche: "la boue à radiolaires", couleurRoche: "#a4553c", grainFonce: "#7d3a28", grainClair: "#e9d3c4", vides: [50, 10], surface: ["océan profond", "#274f73"], rythme: "très lent", echelleLoupe: 0.45,
          loupeTexte: ["à la loupe : l'opale recristallise", "en quartz, et soude la roche"] }),
      E("Radiolarite", "Quartz recristallisé et hématite rouge : la boue est devenue une roche très dure, le jaspe", "Aujourd'hui", null, "loupeRoche",
        { mode: "fixe", titre: "Dans la radiolarite, au microscope", lignes: ["Des squelettes de radiolaires", "(ronds, clairs) dans une pâte de", "quartz très fin rougi par un peu", "d'hématite : le jaspe rouge des", "ophiolites du Queyras."] }),
    ],
  });

  poser("diatomite", {
    anim: [
      E("Diatomées", "Dans les lacs de cratère, alimentés en silice par les roches volcaniques, les diatomées, algues microscopiques, bâtissent une coque (frustule) d'opale", "Entre 15 et 2 millions d'années", null, "merVie",
        { milieu: "lac", vie: ["diatomees"], couleurs: ["#ebe9e1", "#f5f3ee"], couleurFond: "#5f554d", ages: [8.1, 8, 7.9], labFond: "fond du lac de cratère",
          titres: ["un lac dans un cratère volcanique", "les diatomées édifient leur coque d'opale", ""] }),
      E("Lits blancs", "Une fois mortes, les frustules gagnent le fond : des lits blancs grandissent, de quelques millimètres par an", "Entre 15 et 2 millions d'années", "des millimètres par an", "merDepot",
        { milieu: "lac", vie: ["diatomees"], couleurs: ["#ebe9e1", "#f5f3ee"], couleurFond: "#5f554d", ages: [8.1, 8, 7.9], labFond: "fond du lac de cratère", texteLoupe: "frustules de diatomées", videsLoupe: 60, echelleLoupe: 0.45,
          titres: ["", "", "les frustules tombent : des lits blancs s'accumulent"] }),
      E("Diatomite", "L'opale, jamais chauffée au-delà d'une trentaine de degrés, n'a pas recristallisé : frustules intacts, roche légère criblée de vides", "Depuis le dépôt", null, "loupeRoche",
        { mode: "fixe", titre: "Dans la diatomite, au microscope", lignes: ["Des frustules de diatomées intacts,", "en opale, et un peu d'argile.", "Jamais chauffée, l'opale n'a pas", "recristallisé : la roche reste", "légère et pleine de vides. On s'en", "sert pour filtrer."] }),
    ],
  });

  poser("gaize", {
    anim: [
      E("Éponges", "Au fond de la mer albienne, les éponges sécrètent des spicules d'opale, mêlés d'argile et de grains verts de glauconie", "À l'Albien (113 à 100,5 Ma)", null, "merVie",
        { milieu: "large", vie: ["eponges", "glauconie"], couleurs: ["#b9b39a", "#aaa488"], ages: [108, 107, 104], labFond: "fond de la mer albienne",
          titres: ["la mer albienne recouvre l'Argonne", "au fond, les éponges édifient des spicules d'opale", ""] }),
      E("Dépôt", "Spicules, sable fin, argile et glauconie se déposent pour former un sable argileux", "À l'Albien", "≈ 20 m par million d'années", "merDepot",
        { milieu: "large", vie: ["eponges", "glauconie"], couleurs: ["#b9b39a", "#aaa488"], ages: [108, 107, 104], labFond: "fond de la mer albienne", texteLoupe: "spicules, sable et glauconie", videsLoupe: 50, echelleLoupe: 0.45,
          titres: ["", "", "spicules, sable fin, argile et glauconie s'accumulent"] }),
      E("Enfouissement", "Vers 40 °C, sous les craies du Crétacé supérieur, une part des spicules se dissout, et l'opale-CT se forme entre les grains", "De 100 à 70 millions d'années", null, "enfouissementSed",
        { couches: [[100, 85, "#e8e0c8", "Cénomanien : craie marneuse"], [85, 70, "#f1eee6", "craie"]], age0: 100, age1: 70, zmax: 1, nomRoche: "le sable à spicules", couleurRoche: "#b9b39a", grainFonce: "#5f8a4a", grainClair: "#e9e6d6", vides: [50, 40], echelleLoupe: 0.45,
          loupeTexte: ["à la loupe : les spicules se", "dissolvent en partie"] }),
      E("Gaize", "Ciment d'opale-CT : les grains sont soudés sans que les vides se comblent. Roche légère et poreuse mais dure, avec laquelle on a bâti les villages d'Argonne", "Aujourd'hui", null, "loupeRoche",
        { titre: "Dans la gaize, au microscope", vides: [40, 30], lignes: ["Des spicules d'éponges, du sable", "et de glauconie verte, soudés", "par un voile d'opale-CT qui laisse", "beaucoup de vides : une pierre", "légère et poreuse."] }),
    ],
  });

  // ── roches dont on garde les scènes de paysage (évaporation, marécage, profil d'altération…) : la vue rapprochée finale
  //    devient le schéma de la texture, et les remontées vers la surface ont désormais leur étape ──
  const ancien = (id, i) => Object.assign({}, ROCHES_F[id].anim[i]);
  const SAUMURE = "#cfe3e6";

  poser("gypse", { anim: [ancien("gypse", 0),
    E("Bancs de gypse", "Tant que le bassin reçoit de l'eau neuve et que la saumure demeure entre × 3,8 et × 10,6, du gypse cristallise au fond et grossit, et les bancs s'accumulent", "Au Priabonien", "des milliers d'années", "loupeRoche",
      { mode: "croissance", dessous: SAUMURE, nomDessous: "saumure", titre: "Dans le gypse, au microscope", lignes: ["Des cristaux de gypse naissent", "dans la saumure et grandissent", "jusqu'à se toucher. Cuit vers", "150 °C, le gypse perd les trois", "quarts de son eau : c'est le", "plâtre (« de Paris »)."] })] });

  poser("anhydrite", { anim: [ancien("anhydrite", 0),
    E("Gypse", "Dans la lagune, le sulfate de calcium cristallise, surtout sous forme de gypse, minéral qui emprisonne de l'eau", "Au Trias", "des milliers d'années", "enfouissementSed",
      { couches: [[230, 200, "#c9bfa5", "Trias : argiles et dolomies"], [200, 150, "#9aa28f", "Jurassique : marnes et calcaires"]], age0: 230, age1: 150, zmax: 1.8, nomRoche: "le gypse", couleurRoche: "#f2efe8", grainClair: "#ffffff", grainFonce: "#d8d2c4", vides: [8, 2], echelleLoupe: 0.45,
        loupeTexte: ["vers 42 à 58 °C (1 à 1,5 km), le gypse", "perd son eau et devient anhydrite"] }, { court: "Enfouissement", titre: "Enfoui sous d'autres couches, le gypse chauffe : au-delà de ≈ 42 à 58 °C (1 à 1,5 km), il perd son eau et devient anhydrite", quand: "De 230 à 150 millions d'années", duree: "80 millions d'années" }),
    E("Anhydrite", "L'anhydrite constitue une mosaïque de cristaux à clivages orthogonaux ; ramenée près de la surface, elle fixe de l'eau et devient gypse", "Depuis 150 millions d'années", null, "loupeRoche",
      { mode: "croissance", dessous: "#fbfaf6", nomDessous: "gypse pas encore transformé", titre: "Dans l'anhydrite, au microscope", lignes: ["En perdant son eau, le gypse se", "change en cristaux d'anhydrite,", "plus denses. Revenue près de la", "surface, l'anhydrite reprend de", "l'eau et gonfle : elle soulève", "parfois routes et tunnels."] })] });

  poser("sel", { anim: [ancien("sel", 0),
    E("Bancs de sel", "Il ne reste plus que 9 % de l'eau : des cubes de halite se forment en surface comme au fond, puis s'accumulent en couches", "Au Keuper", "des milliers d'années", "loupeRoche",
      { mode: "croissance", dessous: SAUMURE, nomDessous: "saumure", titre: "Dans le sel gemme, surface sciée", lignes: ["Des cristaux de halite (sel de", "cuisine) grandissent dans la", "saumure jusqu'à se toucher ; un", "peu de gypse et d'argile entre", "eux. Il ne reste alors que 9 %", "de l'eau de mer de départ."] }),
    ancien("sel", 2)] });

  poser("sylvinite", { anim: [ancien("sylvinite", 0),
    E("Sylvinite", "Au-delà de × 65, 1,5 % seulement de l'eau demeure : halite et sels potassiques précipitent ensemble, et une part de la sylvite dérive de la carnallite", "À l'Oligocène", "des milliers d'années", "loupeRoche",
      { mode: "croissance", dessous: SAUMURE, nomDessous: "saumure très concentrée", titre: "Dans la sylvinite, surface sciée", lignes: ["Halite (blanche) et sylvite", "(rosée, chlorure de potassium)", "cristallisent dans les dernières", "gouttes de saumure. En Alsace,", "on l'a extraite comme engrais", "jusqu'en 2002."] })] });

  poser("dolomie", { anim: [ancien("dolomie", 0), ancien("dolomie", 1),
    E("Dolomitisation", "Plus dense, la saumure pénètre les boues calcaires ; le magnésium se substitue à une partie du calcium, et la calcite cède la place à de petits cristaux de dolomite", "Au Jurassique, puis en profondeur", "des milliers à des millions d'années", "loupeRoche",
      { mode: "croissance", dessous: "#f3efe4", nomDessous: "boue calcaire pas encore remplacée", titre: "Dans la dolomie, au microscope", lignes: ["Le magnésium de la saumure", "remplace une partie du calcium :", "des cristaux de dolomite naissent", "et gagnent toute la boue. La", "la roche perd un peu de volume :", "de petits vides apparaissent."] }),
    ancien("dolomie", 3)] });

  poser("cargneule", { anim: [ancien("cargneule", 0), ancien("cargneule", 1),
    E("Dissolution", "Renouvelée sans cesse, l'eau souterraine dissout le gypse (2,4 g/L en eau pure) ; chargée de sulfate, elle change aussi la dolomie en calcite : il reste un réseau de cloisons de calcite criblé de cellules vides", "Depuis quelques millions d'années", "des milliers à des millions d'années", "loupeRoche",
      { mode: "fixe", titre: "Dans la cargneule, surface sciée", lignes: ["Des fragments de dolomie broyée,", "soudés par de la calcite ; les", "morceaux de gypse ont été", "dissous : il reste des cellules", "vides. D'où son aspect de roche", "« pourrie », criblée de trous."] })] });

  poser("phosphorite", { anim: [ancien("phosphorite", 0), ancien("phosphorite", 1), ancien("phosphorite", 2),
    E("Phosphorite", "Riche en grains phosphatés, en os et en dents de mammifères, cimentés par la calcite ; exploitée comme engrais au XIXᵉ siècle, elle a livré des milliers de fossiles", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la phosphorite, au microscope", lignes: ["Des grains de phosphate (apatite)", "ainsi que des débris d'os et de dents,", "liés par un ciment de calcite. Les", "poches du Quercy, vidées pour", "l'engrais vers 1870 à 1900, ont livré", "des milliers de fossiles."] })] });

  poser("roche_ferrifere", { anim: [ancien("roche_ferrifere", 0), ancien("roche_ferrifere", 1),
    E("Minette de Lorraine", "En France, la roche ferrifère la plus exploitée a une autre origine : la minette de Lorraine, formée d'oolithes ferrugineuses déposées dans une mer peu profonde du Jurassique (Aalénien) ; c'est elle que représente le schéma de texture", "Vers 175 millions d'années", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la minette de Lorraine, au microscope", lignes: ["Des oolithes : grains de fer", "(goethite) formés couche par couche", "par roulement sur le fond d'une mer", "peu profonde, en présence de débris de", "coquilles. Ce minerai de fer", "la Lorraine jusqu'en 1997."] })] });

  poser("travertin", { anim: [ancien("travertin", 0), ancien("travertin", 1),
    E("Travertin", "Couche après couche, la calcite enrobe mousses et brindilles, dont la décomposition laisse des vides : une roche litée et poreuse", "Aujourd'hui", "quelques millimètres à centimètres par an", "loupeRoche",
      { mode: "depot", eauFond: "#dcecf2", particule: "#ffffff", nomDessous: "eau de la cascade", titre: "Dans le travertin, surface sciée", lignes: ["Des lits compacts de calcite", "alternent avec des lits poreux :", "la calcite a enrobé des mousses", "qui ont pourri, laissant leurs", "moules vides. Scié, il fournit une", "pierre de parement."] })] });

  const tourbe0 = ancien("tourbe", 0); tourbe0.p = Object.assign({}, tourbe0.p, { texte2: tourbe0.p.texte1 });   // pas d'enfouissement dans une tourbière
  poser("tourbe", { anim: [tourbe0,
    E("Décomposition bloquée", "Dans une eau stagnante, acide et pauvre en oxygène, la décomposition est bloquée : les végétaux morts s'accumulent, à raison d'environ un millimètre par an", "Depuis 11 700 ans", "≈ 1 mm par an", "loupeRoche",
      { mode: "depot", eauFond: "#c8d6c0", particule: "#8a6a3f", nomDessous: "eau de la tourbière", jauge: { nom: ["oxygène"], de: 100, a: 5, max: 100, couleur: "#3f8fd2" }, titre: "Dans la tourbe, au microscope",
        lignes: ["Des tissus végétaux à peine", "décomposés (sphaignes, racines)", "au sein d'une matière brune très fine.", "Sans oxygène, les microbes ne", "les détruisent pas : 1 m de tourbe", "≈ 1 000 ans d'accumulation."] })] });

  const rangCharbon = (id, i) => { const e = ancien(id, i); e.p = Object.assign({}, e.p, { rythme: " " }); return e; };
  poser("lignite", { anim: [ancien("lignite", 0), ancien("lignite", 1), rangCharbon("lignite", 2),
    E("Lignite", "Demeurée peu chauffée, la tourbe n'a perdu qu'une partie de son eau : le bois reste reconnaissable", "Depuis 30 millions d'années", null, "loupeRoche",
      { mode: "fixe", titre: "Dans le lignite, au microscope", lignes: ["Des débris de bois encore", "reconnaissables dans un charbon", "brune, riche en eau. Le rang du", "charbon dépend de la chaleur", "subie : ici moins de ≈ 50 °C."] }),
    E("Remontée", "Les plis de la Provence et l'érosion ramènent la couche à l'affleurement au sud du bassin, à Fuveau ; elle plonge vers le nord : à Gardanne, on l'exploitait à plus de 1 000 m de profondeur (puits Yvon-Morandat), jusqu'en 2003", "De 30 millions d'années à aujourd'hui", "30 millions d'années", "exhumationSed",
      { couches: [[60, 45, "#c9a98a", "Paléogène : argiles"], [45, 30, "#d8cdb0", "calcaires de lac"]], age0: 30, age1: 0, zmax: 1.2, zFin: 1.0, nomRoche: "le lignite", couleurRoche: "#3a2d22", grainClair: "#6b5236", grainFonce: "#1f1a17",
        moteur: ["la Provence se plisse et s'élève ;", "l'érosion emporte une partie de la couverture"], titreFin: "à Gardanne, le lignite est à plus de 1 000 m : on l'exploite par puits", texteFin: "(puits Yvon-Morandat)" })],
    cond: Object.assign({}, ROCHES_F.lignite.cond, { chemin: [...ROCHES_F.lignite.cond.chemin.slice(0, 3), { age: 30, z: 1.2, n: 4, t: "Plissements provençaux et érosion amènent le lignite à quelques centaines de mètres sous le sol ; il fut exploité en galerie." }, { age: 0, z: 0.2 }] }) });

  poser("houille", { anim: [ancien("houille", 0), ancien("houille", 1), rangCharbon("houille", 2),
    E("Houille", "Chauffée à 100 à 200 °C, la tourbe perd son eau et ses matières volatiles : elle devient un charbon noir, en lits brillants et mats", "Depuis 295 millions d'années", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la houille, au microscope", lignes: ["Les lits brillants (bois et écorces", "transformés en vitrain) et les lits mats", "(débris fins, spores). Il n'y a", "presque plus d'eau : la houille", "brûle nettement mieux que le lignite."] }),
    E("Remontée", "La collision hercynienne plisse les bassins ; l'érosion décape plusieurs kilomètres de roches : la houille se retrouve à quelques centaines de mètres sous la surface, où elle s'exploite en mine", "De 295 millions d'années à aujourd'hui", "295 millions d'années", "exhumationSed",
      { couches: [[310, 300, "#6f6a60", "Carbonifère : grès et schistes"], [300, 290, "#9a8a70", "Stéphanien-Permien"]], age0: 290, age1: 0, zmax: 4, zFin: 0.4, gradient: 30, nomRoche: "la houille", couleurRoche: "#1f1a17", grainClair: "#4a4640", grainFonce: "#0f0d0c",
        moteur: ["la chaîne hercynienne se plisse ;", "l'érosion décape des kilomètres de roches"], titreFin: "la houille se trouve à quelques centaines de mètres : elle s'exploite en mine", texteFin: "(bassins du Nord et de Lorraine)" })],
    cond: Object.assign({}, ROCHES_F.houille.cond, { chemin: [...ROCHES_F.houille.cond.chemin.slice(0, 3), { age: 290, z: 4, n: 4, t: "La collision hercynienne plisse les bassins ; l'érosion décape des kilomètres de roches et rapproche la houille de la surface, où elle est exploitée en mine." }, { age: 0, z: 0.4 }] }) });

  poser("anthracite", { anim: [ancien("anthracite", 0), ancien("anthracite", 1), rangCharbon("anthracite", 2),
    E("Anthracite", "Au-delà de ≈ 200 °C, la quasi-totalité de la matière volatile a disparu : il subsiste un carbone presque pur, noir et brillant", "Depuis 290 millions d'années", null, "loupeRoche",
      { mode: "fixe", titre: "Dans l'anthracite, au microscope", lignes: ["Un carbone presque pur, brillant,", "accompagné de rares lits d'argile. On", "n'y reconnaît plus rien des", "plantes : la chaleur a tout", "transformé."] }),
    E("Remontée", "L'orogenèse alpine plie et relève la série ; l'érosion met à nu le charbon, extrait à La Mure jusqu'en 1997", "De 290 millions d'années à aujourd'hui", "290 millions d'années", "exhumationSed",
      { couches: [[310, 300, "#6f6a60", "Carbonifère : grès et schistes"], [300, 290, "#9a8a70", "Stéphanien-Permien"]], age0: 290, age1: 0, zmax: 6.6, zFin: 0.3, gradient: 30, nomRoche: "l'anthracite", couleurRoche: "#141210", grainClair: "#3d3a36", grainFonce: "#000000",
        moteur: ["la collision alpine plisse et redresse ;", "l'érosion enlève le dessus"], titreFin: "l'anthracite se trouve à quelques centaines de mètres : il s'exploite", texteFin: "(mine de La Mure)" })],
    cond: Object.assign({}, ROCHES_F.anthracite.cond, { chemin: [...ROCHES_F.anthracite.cond.chemin.slice(0, 3), { age: 290, z: 6.6, n: 4, t: "Plus tard, l'orogenèse alpine plisse et soulève la série ; l'érosion rapproche l'anthracite de la surface (La Mure)." }, { age: 0, z: 0.3 }] }) });

  poser("schiste_bitumineux", { anim: [ancien("schiste_bitumineux", 0),
    E("Boue noire", "En l'absence d'oxygène au fond, la matière organique se conserve : la boue devient noire et feuilletée, lit après lit", "Pendant le dépôt", "des milliers d'années par lit", "loupeRoche",
      { mode: "depot", eauFond: "#3d4a4f", particule: "#6f8f4a", nomDessous: "eau du fond, sans oxygène", titre: "Dans le schiste bitumineux, au microscope", lignes: ["Des lits riches en matière", "organique (noirs) alternent avec", "des lits d'argile et de silt : le", "plancton mort s'est conservé.", "Il se débite en feuillets", "(« schistes carton »)."] }),
    rangCharbon("schiste_bitumineux", 2),
    E("Remontée", "Le relief s'élève et l'érosion ramène la couche à l'affleurement dans les Causses et au pied des côtes de Moselle ; sous les plateaux lorrains, elle reste à quelques centaines de mètres", "De 100 millions d'années à aujourd'hui", "100 millions d'années", "exhumationSed",
      { couches: [[180, 150, "#9aa28f", "Jurassique : marnes et calcaires"], [150, 100, "#c9bfa5", "Crétacé inférieur"]], age0: 100, age1: 0, zmax: 1.6, zFin: 0, nomRoche: "la boue noire", couleurRoche: "#2f2d29", grainClair: "#6f6a60", grainFonce: "#141210",
        moteur: ["la région se soulève ;", "la pluie et les rivières emportent la partie supérieure"], titreFin: "les schistes carton affleurent (Causses)" })],
    cond: Object.assign({}, ROCHES_F.schiste_bitumineux.cond, { chemin: [...ROCHES_F.schiste_bitumineux.cond.chemin.slice(0, 3), { age: 100, z: 1.6, n: 4, t: "Le relief s'élève : l'érosion expose la roche dans les Causses, la rapproche de la surface en Lorraine." }, { age: 0, z: 0 }] }) });

  // altérations : la vue rapprochée finale devient le schéma de texture
  poser("bauxite", { anim: [ancien("bauxite", 0), ancien("bauxite", 1),
    E("Bauxite", "Des pisolithes rouges de boehmite (aluminium) et d'hématite (fer) : minerai d'aluminium dont le nom vient des Baux-de-Provence ; sous le climat actuel, trop sec, elles sont héritées", "Depuis 90 millions d'années", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la bauxite, au microscope", lignes: ["Des pisolithes (grains ronds en", "couches) de boehmite et d'hématite", "sur un fond de boehmite et de", "kaolinite : tout le reste a été", "emporté par l'eau. Décrite aux", "Baux-de-Provence, qui lui a donné son nom."] })] });
  poser("laterite", { anim: [ancien("laterite", 0), ancien("laterite", 1),
    E("Cuirasse", "Les saisons sèches indurent les oxydes de fer en cuirasse ; sous le climat actuel de Bordeaux (13,7 °C), ces cuirasses sont fossiles", "Depuis 34 millions d'années", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la cuirasse, surface sciée", lignes: ["Des pisolithes d'oxydes de fer", "(goethite, hématite) soudés dans", "une argile rouge, avec quelques", "grains de quartz rescapés. Dure", "à l'image de la brique : on en a bâti", "des pierres de construction."] })] });
  poser("meuliere", { anim: [ancien("meuliere", 0),
    E("Silicification", "L'assèchement des lacs et l'altération des argiles libèrent de la silice ; l'opale, puis la calcédoine, remplacent peu à peu le calcaire", "De 34 à 15 millions d'années", "des millions d'années", "loupeRoche",
      { mode: "croissance", dessous: "#ece6d4", nomDessous: "calcaire pas encore remplacé", titre: "Dans la meulière, au microscope", lignes: ["La silice précipite dans le", "calcaire et le remplace : opale,", "puis calcédoine. Le calcaire qui", "restait s'est ensuite dissous :", "d'où résultent les cavités. Roche dure et criblée", "de cavités : c'est la pierre des meules."] })] });
  poser("calcrete", { anim: [ancien("calcrete", 0), ancien("calcrete", 1),
    E("Calcrète", "Une croûte dure, épaisse de quelques décimètres à quelques mètres, formée de nodules de calcite cimentés par une calcite très fine et de grains de sable", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la calcrète, au microscope", lignes: ["Des nodules de calcite (clairs)", "liés par une calcite très fine,", "avec des grains de quartz issus des", "alluvions : la calcite précipite", "quand l'eau du sol perd son CO₂."] })] });
  poser("alterite", { anim: [ancien("alterite", 0), ancien("alterite", 1), ancien("alterite", 2),
    E("Arène", "Du granite subsistent le quartz, des feldspaths partiellement altérés et des micas, pris dans des argiles d'altération : un sable grossier qui se désagrège sous la main", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans l'arène, surface sciée", lignes: ["Grains de quartz intacts, feldspaths", "à demi changés en argile, paillettes", "de mica, dans les argiles", "d'altération : la place des grains", "la signature du granite est conservée, mais plus", "rien ne les tient."] })] });
  poser("terra_rossa", { anim: [ancien("terra_rossa", 0), ancien("terra_rossa", 1),
    E("Terra rossa", "Les impuretés du calcaire dissous forment une argile rouge où subsistent des nodules d'oxydes de fer et quelques grains résiduels", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la terra rossa, au microscope", lignes: ["Argile rouge (kaolinite, illite)", "colorée par l'hématite, nodules", "d'oxydes de fer, grains de quartz : il a", "fallu dissoudre des dizaines de", "mètres de calcaire pour en produire", "un mètre."] })] });
  poser("argile_silex", { anim: [ancien("argile_silex", 0), ancien("argile_silex", 1),
    E("Argile à silex", "Des silex, entiers ou brisés, emballés dans une argile brun-rouge : c'est la fraction insoluble de la craie", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans l'argile à silex, surface sciée", lignes: ["Des rognons de silex (intacts ou", "fracturés) dans une argile brun-rouge", "et un peu de sable : ce sont les résidus", "insolubles de la craie, demeurés sur", "place quand l'eau a emporté la", "calcite."] })] });

  // formations superficielles
  poser("alluvions", { anim: [ancien("alluvions", 0), ancien("alluvions", 1), ancien("alluvions", 2),
    E("Alluvions", "Galets et graviers émoussés, sable et limon : triés par le courant, sans jamais être cimentés", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans les alluvions, surface sciée", lignes: ["Galets et graviers arrondis par", "la rivière (quartz, calcaire,", "granite) dans un sable limoneux :", "le courant les a classés. Rien ne", "les lie : ce sont les graviers", "qu'on extrait des vallées."] })] });
  poser("colluvions", { anim: [ancien("colluvions", 0),
    E("Accumulation", "Le sol, déplacé sur quelques dizaines à quelques centaines de mètres, ne subit aucun classement et s'accumule au pied du versant", "Depuis le Néolithique", null, "loupeRoche",
      { mode: "fixe", titre: "Dans les colluvions, au microscope", lignes: ["Grains de quartz et débris", "de calcaire, emballés dans une terre fine", "(argile, limon, matière organique) :", "le sol de la partie haute du versant, entraîné", "vers le bas sans avoir été classé."] })] });
  poser("eboulis", { anim: [
    E("Gel et dégel", "Sous climat froid, l'eau gelée dans les fissures augmente de 9 % environ de volume et les élargit ; au dégel, les fragments se détachent et chutent, puis s'accumulent au pied de la falaise, les plus volumineux allant le plus loin", "Depuis la dernière glaciation", "des milliers d'années", "eboulisChute",
      { froid: true, libelleAge: "depuis ≈ 115 000 ans" }, { allonge: 1.2 }),
    E("Talus", "Anguleux, mal classés et non cimentés, ces fragments forment un éboulis ; si un ciment les liait, ils constitueraient une brèche", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans l'éboulis, surface sciée", lignes: ["Des blocs de calcaire anguleux, de", "toutes tailles, qui n'ont roulé", "d'à peine quelques mètres, pris dans un peu", "de terre fine. Aucun liant ne les unit :", "c'est un éboulis. Cimenté, il", "deviendrait une brèche."] })] });
  poser("moraine", { anim: [
    E("Glacier", "Lors du Würm, la langue du glacier du Rhône atteint les portes de Lyon depuis les Alpes ; à sa base, il ravine le socle, en extrait des blocs qu'il traîne et écrase en farine, et repousse devant lui un bourrelet de débris", "Pendant le Würm (≈ 25 000 ans)", "des milliers d'années", "glacierTerreAvance",
      { texteLoupe: "la moraine : matériaux mêlés, sans tri", agesTexte: ["il y a ≈ 25 000 ans", "il y a ≈ 18 000 ans"] }, { allonge: 1.2 }),
    E("Fonte", "Le réchauffement provoque un recul du glacier par à-coups, chaque pause déposant un arc de moraine ; les blocs erratiques et la farine glaciaire restent mêlés sans ordre", "À la fin du Würm", "quelques milliers d'années", "glacierTerreFonte",
      { texteLoupe: "la moraine : matériaux mêlés, sans tri", agesTexte: ["il y a ≈ 25 000 ans", "il y a ≈ 18 000 ans"] }),
    E("Moraine", "Blocs, cailloux et farine de roche sans aucun classement, certains fragments striés : à la différence de l'eau ou du vent, la glace ne classe pas", "Depuis la fonte", null, "loupeRoche",
      { mode: "fixe", titre: "Dans la moraine, surface sciée", lignes: ["Fragments de toutes tailles", "(quartz, calcaire, granite,", "gneiss), parfois rayés, dans une", "matrice meuble formée de farine de roche :", "la glace dépose tout ensemble,", "sans rien trier."] })] });
  poser("loess", { anim: [
    E("Plaines nues", "En bordure des glaciers, les eaux de fonte déposent des limons sur des plaines dénudées et desséchées", "Pendant la dernière glaciation", null, "glacierTerreFonte",
      { loess: true, texteLoupe: "limons des plaines d'épandage", agesTexte: ["", "il y a ≈ 20 000 ans"], titres: ["", "", "", "sur les marges du glacier, les eaux de fonte déposent des limons", "le vent arrache les limons à la plaine dénudée et les entraîne"] }),
    E("Vent", "Arrachés à la plaine nue par le vent, les limons de 10 à 60 µm sont transportés sur des dizaines à des centaines de kilomètres ; ils se déposent sur les collines de la steppe froide, en couches plus épaisses à l'abri du vent", "De ≈ 30 000 à 11 700 ans", "des dizaines de milliers d'années", "ventLoess", {}),
    E("Lœss", "Des couches de plusieurs mètres de limons très bien classés, légèrement calcaires, qui forment des sols très fertiles", "Depuis 11 700 ans", null, "loupeRoche",
      { mode: "fixe", titre: "Dans le lœss, au microscope", lignes: ["Grains de limon (10 à 60 µm),", "surtout du quartz, très bien classé", "emportés par le vent, agglutinés par une faible quantité de", "calcite et d'argile. En Alsace,", "il supporte des sols parmi les plus", "fertiles de France."] })] });
  poser("dunes", { anim: [ancien("dunes", 0),
    E("Tri", "Le vent écarte les graviers et disperse les poussières : le sable des dunes, à grains mats et émoussés, est très bien classé", "Aujourd'hui", null, "loupeRoche",
      { mode: "fixe", titre: "Dans le sable de dune, au microscope", lignes: ["Grains de quartz arrondis, de", "de même taille : le vent ne soulève", "que les grains de 0,1 à 0,5 mm.", "Quelques débris de coquilles", "issus de la plage. Aucun liant ne les", "soude : la dune avance."] })] });
  poser("vase_tangue", { anim: [ancien("vase_tangue", 1),
    E("Lits", "À chaque étale, une fine pellicule de vase se dépose ; lors des marées plus fortes, du sable coquillier (la tangue) se dépose : il en résulte une alternance de lits", "À chaque marée", null, "loupeRoche",
      { mode: "depot", eauFond: "#cfdfe3", particule: "#b9a88a", nomDessous: "eau de mer à l'étale", titre: "Dans la tangue, au microscope", lignes: ["Lits de sable fin coquillier", "(la tangue, clair) alternent avec", "alternant avec des lits de vase sombre : chaque", "marée ajoute sa pellicule. La", "tangue servait à amender les", "champs de Normandie."] })] });

  // évaporites : une pastille par ÉTAPE (le curseur va de la pastille n à la n + 1 pendant l'étape n) ; les autres points
  // du chemin restent dans la légende, sans numéro
  const renumeroter = (id, table) => {
    const c = ROCHES_F[id] && ROCHES_F[id].cond;
    if (!c || !c.chemin) return;
    c.chemin = c.chemin.map((q, i) => { const r = Object.assign({}, q); delete r.n; if (table[i] != null) r.n = table[i]; return r; });
  };
  renumeroter("gypse", [1, null, 2, null]);
  renumeroter("anhydrite", [1, null, 2, 3]);
  renumeroter("sel", [1, null, 2, 3]);
  renumeroter("sylvinite", [1, null, 2, null]);

  window.FormationAnimSed = { texRoche, texDessin, texDansRect, texDansDisque };
})();
