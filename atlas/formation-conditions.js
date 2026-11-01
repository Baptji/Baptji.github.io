// ============ Conditions de formation (C.4 refait, 25/09/2026) — formation-conditions.js ============
// Chargé après formation-anim-sed.js et avant app.js (index.html). Remplace le rendu des diagrammes de
// conditions de formation.js sans toucher à ce fichier : Formation.conditions, Formation.diagramme et
// Formation.sourcesDe sont redéfinis ici, et les `cond` des roches sont remplacés via Formation._ROCHES.
// Formation.sources (formation.js) est conservé tel quel : il lit `cond` et `src` de la roche, et les clés
// de sources propres aux nouveaux diagrammes sont ajoutées à `src` (voir `installer` en bas du fichier).
//
// Principes (demande du 25/09/2026 : « parfait et sans aucun défaut », traits noirs, concentrations et
// seuils pour les roches chimiques, plus de diagramme « taille des grains ») :
//  - UNE pastille par étape de l'animation, placée à l'état ATTEINT à la fin de l'étape (animCurseur
//    "arrivee") ; deux étapes aux mêmes conditions donnent des pastilles accolées (« 4 5 »), jamais
//    superposées ; une étape sans condition propre n'a pas de pastille (numéro cerclé dans la liste) ;
//  - étiquettes placées par un petit moteur de placement : aucune ne chevauche une autre étiquette, une
//    pastille ou le chemin, et aucune ne sort du cadre (sinon elle est signalée dans `window.__fc2`) ;
//  - chemin, flèches et pastilles en noir (encre), domaines en aplats clairs, courbes en gris foncé.
(function () {
  "use strict";
  const F = window.Formation;
  if (!F || !F._ROCHES) return;
  const ROCHES_F = F._ROCHES, SOURCES = F._SOURCES;
  const ANCIEN = { conditions: F.conditions, diagramme: F.diagramme, sourcesDe: F.sourcesDe };

  // ─────────────────────────────── 1. outils ───────────────────────────────
  const r1 = (x) => Math.round(x * 10) / 10;
  const nb = (x, d) => {
    if (d == null) { const a = Math.abs(x); d = a === 0 || a >= 1 || Number.isInteger(x) ? 0 : a < 0.01 ? 3 : a < 0.1 ? 2 : 1; }
    return x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  const esc = (s) => String(s).replace(/&(?![#a-z0-9]+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  let uid = 0;

  // largeur d'un texte (même police que le SVG : style de formation-conditions.css)
  const POLICE = 'system-ui, -apple-system, "Segoe UI", sans-serif';
  let ctx = null;
  const memo = new Map();
  function largeur(texte, taille, gras, italique) {
    const k = `${taille}|${gras ? 1 : 0}|${italique ? 1 : 0}|${texte}`;
    if (memo.has(k)) return memo.get(k);
    if (!ctx) { try { ctx = document.createElement("canvas").getContext("2d"); } catch (e) { ctx = null; } }
    let w;
    if (ctx) { ctx.font = `${italique ? "italic " : ""}${gras ? "600 " : "400 "}${taille}px ${POLICE}`; w = ctx.measureText(texte).width; }
    else w = texte.length * taille * 0.56;
    w *= 1.04; // marge : la police du SVG peut différer légèrement de celle du canvas
    memo.set(k, w);
    return w;
  }

  // ─────────────────────────────── 2. échelles ───────────────────────────────
  // def : { min, max, type: "lin" | "log" | "sqrt", pad0, pad1 (px aux deux bouts) } ; a0 → a1 en pixels
  function echelle(def, a0, a1) {
    const f = def.type === "log" ? Math.log10 : def.type === "sqrt" ? (v) => Math.sqrt(Math.max(0, v)) : (v) => v;
    const u0 = f(def.min), u1 = f(def.max);
    const sens = a1 >= a0 ? 1 : -1;
    const b0 = a0 + sens * (def.pad0 || 0), b1 = a1 - sens * (def.pad1 || 0);
    const s = (v) => b0 + (f(v) - u0) / (u1 - u0) * (b1 - b0);
    s.def = def;
    return s;
  }

  // ─────────────────────────────── 3. géométrie (placement) ───────────────────────────────
  // obstacles = polygones convexes ; test de chevauchement par axes séparateurs (SAT)
  function projeter(P, ax, ay) { let mn = Infinity, mx = -Infinity; for (const [x, y] of P) { const d = x * ax + y * ay; if (d < mn) mn = d; if (d > mx) mx = d; } return [mn, mx]; }
  function chevauche(A, B, marge = 0) {
    for (const P of [A, B]) for (let i = 0; i < P.length; i++) {
      const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
      let ax = y2 - y1, ay = x1 - x2; const L = Math.hypot(ax, ay) || 1; ax /= L; ay /= L;
      const [a0, a1] = projeter(A, ax, ay), [b0, b1] = projeter(B, ax, ay);
      if (a1 + marge <= b0 || b1 + marge <= a0) return false;
    }
    return true;
  }
  const rectPoly = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const cerclePoly = (x, y, r) => Array.from({ length: 8 }, (_, i) => [x + r * Math.cos(i * Math.PI / 4 + Math.PI / 8) / Math.cos(Math.PI / 8), y + r * Math.sin(i * Math.PI / 4 + Math.PI / 8) / Math.cos(Math.PI / 8)]);
  function segPoly(x1, y1, x2, y2, e) {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L * e, ny = (x2 - x1) / L * e;
    return [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]];
  }
  // boîte d'un texte : ancre (x, y) sur la ligne de base (de la 1re ligne), a = start | middle | end, rot en degrés autour de (x, y) ;
  // n lignes : interligne 1,15 × taille
  function boiteTexte(x, y, w, taille, a, rot, n = 1) {
    const dx = a === "middle" ? -w / 2 : a === "end" ? -w : 0, bas = 0.26 * taille + (n - 1) * 1.15 * taille;
    const loc = [[dx - 1.5, -0.8 * taille - 1.5], [dx + w + 1.5, -0.8 * taille - 1.5], [dx + w + 1.5, bas + 1.5], [dx - 1.5, bas + 1.5]];
    const t = (rot || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    return loc.map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
  }
  const dansRect = (P, R) => P.every(([x, y]) => x >= R[0] - 0.5 && x <= R[2] + 0.5 && y >= R[1] - 0.5 && y <= R[3] + 0.5);

  // ─────────────────────────────── 4. le graphique ───────────────────────────────
  // Cadre commun : viewBox 680 × 340 ; zone de tracé [X0, X1] × [Y0, Y1]
  const D = { W: 680, H: 340, X0: 60, X1: 620, Y0: 34, Y1: 292 };
  function graphique(o) {
    const G = {
      o, X0: D.X0, X1: D.X1, Y0: D.Y0, Y1: D.Y1,
      fond: [], domaines: [], courbes: [], chemin: [], textes: [], dessus: [], defs: [],
      obs: [],       // obstacles durs : textes, pastilles, chemin
      doux: [],      // obstacles souples (courbes) : pénalité
      alertes: [],   // étiquettes qu'il a fallu forcer
    };
    G.sx = echelle(o.x, G.X0, G.X1);
    G.sy = o.y.bas ? echelle(o.y, G.Y0, G.Y1) : echelle(o.y, G.Y1, G.Y0);
    G.P = (x, y) => [G.sx(x), G.sy(y)];
    G.clip = `fc2c${++uid}`;
    G.defs.push(`<clipPath id="${G.clip}"><rect x="${G.X0}" y="${G.Y0}" width="${G.X1 - G.X0}" height="${G.Y1 - G.Y0}"/></clipPath>`);
    G.zone = [G.X0 + 2, G.Y0 + 2, G.X1 - 2, G.Y1 - 2];
    return G;
  }
  const pts = (G, L) => L.map(([x, y]) => `${r1(G.sx(x))},${r1(G.sy(y))}`).join(" ");
  const ptsPx = (L) => L.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
  // tracés dans les unités des axes
  function polygone(G, L, cls, style) { G.domaines.push(`<polygon points="${pts(G, L)}" class="${cls}"${style ? ` style="${style}"` : ""}/>`); }
  function courbe(G, L, cls, obstacle = true) {
    G.courbes.push(`<polyline points="${pts(G, L)}" class="${cls}"/>`);
    if (obstacle) for (let i = 1; i < L.length; i++) { const [a, b] = G.P(...L[i - 1]), [c, d] = G.P(...L[i]); G.doux.push(segPoly(a, b, c, d, 1.5)); }
  }
  // obstacles d'un tracé déjà en pixels
  function obstacleLigne(G, P, e, dur) { for (let i = 1; i < P.length; i++) (dur ? G.obs : G.doux).push(segPoly(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], e)); }

  // ── étiquette placée : essaie les positions candidates dans l'ordre, garde la première libre ──
  // (aucun obstacle dur, aucune courbe traversée) ; à défaut, la libre qui traverse le moins de courbes ;
  // à défaut encore, et seulement si `oblig`, la moins gênante — signalée dans window.__fc2 pour la mise au point.
  // l : { t (texte), c (classe), taille, gras, it (italique), cands: [{ x, y (pixels), a, rot }], zone, oblig, dans (polygone px) }
  const bb = (P) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [x, y] of P) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; } return [a, b, c, d]; };
  const bbChevauche = (A, B) => A[0] < B[2] && B[0] < A[2] && A[1] < B[3] && B[1] < A[3];
  function touche(P, liste) { const b = bb(P); return liste.some((O) => bbChevauche(b, O.bb || (O.bb = bb(O))) && chevauche(P, O)); }
  function compte(P, liste) { const b = bb(P); let n = 0; for (const O of liste) if (bbChevauche(b, O.bb || (O.bb = bb(O))) && chevauche(P, O)) n++; return n; }
  function dansPoly(x, y, P) { let d = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; }
  function etiquette(G, l) {
    const taille = l.taille || 10.5, lignes = String(l.t).split("\n"), n = lignes.length;
    const w = Math.max(...lignes.map((s) => largeur(s, taille, l.gras, l.it)));
    const zone = l.zone || G.zone;
    // ancre au milieu du bloc : la 1re ligne remonte de la moitié des lignes suivantes
    const dy1 = -(n - 1) * 1.15 * taille / 2;
    let best = null, bestSoft = Infinity;
    for (const c of l.cands) {
      if (l.dans && !dansPoly(c.x, c.y - taille * 0.3, l.dans)) continue;
      const P = boiteTexte(c.x, c.y + dy1, w, taille, c.a || "start", c.rot, n);
      if (!dansRect(P, zone)) continue;
      if (touche(P, G.obs)) continue;
      const soft = compte(P, G.doux);
      if (soft < bestSoft) { bestSoft = soft; best = { c, P }; if (soft === 0) break; }
    }
    if (!best && l.alt && l.alt.length) {
      for (const t of l.alt) if (etiquette(G, Object.assign({}, l, { t, alt: null, oblig: false }))) return true;
    }
    if (!best) {
      if (!l.oblig) return false;
      let mini = Infinity;
      for (const c of l.cands) {
        const P = boiteTexte(c.x, c.y + dy1, w, taille, c.a || "start", c.rot, n);
        const k = compte(P, G.obs) * 10 + (dansRect(P, zone) ? 0 : 5);
        if (k < mini) { mini = k; best = { c, P }; }
      }
      if (!best) return false;
      G.alertes.push(l.t.replace(/\n/g, " "));
      if (window.__fc2debug) { // mise au point : ce qui bloque les premières positions
        const d = l.cands.slice(0, window.__fc2debugN || 4).map((c) => {
          const P = boiteTexte(c.x, c.y + dy1, w, taille, c.a || "start", c.rot, n);
          return `${dansRect(P, zone) ? "" : "HORS "}` + G.obs.filter((O) => chevauche(P, O)).map((O) => bb(O).map(Math.round).join(",")).join(" / ");
        });
        (window.__fc2dbg = window.__fc2dbg || []).push(l.t + " :: " + d.join(" || "));
      }
    }
    const { c, P } = best;
    P.bb = bb(P);
    G.obs.push(P);
    const cls = `fc2-t${l.c ? " " + l.c : ""}`, x = r1(c.x), y = r1(c.y + dy1);
    const corps = n === 1 ? esc(lignes[0]) : lignes.map((s, i) => `<tspan x="${x}"${i ? ` dy="${r1(1.15 * taille)}"` : ""}>${esc(s)}</tspan>`).join("");
    G.textes.push(`<text x="${x}" y="${y}" class="${cls}"${c.a && c.a !== "start" ? ` text-anchor="${c.a}"` : ""}${c.rot ? ` transform="rotate(${r1(c.rot)} ${r1(c.x)} ${r1(c.y)})"` : ""}>${corps}</text>`);
    return true;
  }
  // candidats autour d'un point (pixels) : à droite, à gauche, au-dessus, au-dessous, puis en diagonale, à deux distances
  function autour(x, y, d = 7, taille = 10.5) {
    const h = taille * 0.34, out = [];
    for (const k of [d, d + 7, d + 15]) out.push({ x: x + k, y: y + h, a: "start" }, { x: x - k, y: y + h, a: "end" }, { x, y: y - k - 1, a: "middle" }, { x, y: y + k + taille * 0.8, a: "middle" },
      { x: x + k * 0.8, y: y - k * 0.8, a: "start" }, { x: x - k * 0.8, y: y - k * 0.8, a: "end" }, { x: x + k * 0.8, y: y + k * 0.8 + taille * 0.6, a: "start" }, { x: x - k * 0.8, y: y + k * 0.8 + taille * 0.6, a: "end" });
    return out;
  }
  // candidats le long d'une courbe (unités des axes) : texte parallèle à la courbe, d'un côté ou de l'autre, à deux distances
  const FRACS = [0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8, 0.15, 0.85, 0.1, 0.9];
  function leLong(G, L, fracs = FRACS, cote = [1, -1], taille = 9.8) {
    // on ne garde que la partie de la courbe dans le cadre
    const P = [];
    for (let i = 0; i < L.length; i++) { const p = G.P(L[i][0], L[i][1]); if (p[0] >= G.X0 && p[0] <= G.X1 && p[1] >= G.Y0 && p[1] <= G.Y1) P.push(p); }
    if (P.length < 2) return [];
    const long = [0]; for (let i = 1; i < P.length; i++) long.push(long[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const tot = long[long.length - 1], out = [];
    for (const f of fracs) for (const e of [0, 7]) for (const s of cote) {
      const cible = f * tot; let i = 1; while (i < long.length - 1 && long[i] < cible) i++;
      const u = (cible - long[i - 1]) / ((long[i] - long[i - 1]) || 1);
      const x = lerp(P[i - 1][0], P[i][0], u), y = lerp(P[i - 1][1], P[i][1], u);
      let ang = Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]) * 180 / Math.PI;
      if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      const t = ang * Math.PI / 180, nx = Math.sin(t), ny = -Math.cos(t);
      // côté « + » : ligne de base à 4 px de la courbe ; côté « − » : le texte passe sous la courbe
      const d = (s > 0 ? -(4 + e) : taille * 0.8 + 4 + e);
      out.push({ x: x - nx * d, y: y - ny * d, a: "middle", rot: ang });
    }
    return out;
  }
  // candidats sur une grille dans une zone (unités des axes), du plus proche au plus loin d'un point préféré
  function candsZone(G, z, pref, o = {}) {
    const [ax, ay] = G.P(z[0], z[2]), [bx, by] = G.P(z[1], z[3]);
    const x0 = Math.max(Math.min(ax, bx), G.X0), x1 = Math.min(Math.max(ax, bx), G.X1), y0 = Math.max(Math.min(ay, by), G.Y0), y1 = Math.min(Math.max(ay, by), G.Y1);
    const [px, py] = G.P(pref[0], pref[1]), pasPx = o.pas || 7, out = [];
    for (let x = x0; x <= x1 + 0.1; x += pasPx) for (let y = y0; y <= y1 + 0.1; y += pasPx) out.push({ x, y: y + 3.5, a: o.a || "middle", rot: o.rot, d: Math.hypot(x - px, y - py) });
    return out.sort((a, b) => a.d - b.d);
  }

  // ── axes ──
  // ax : { ticks: [v…], fmt, titre, grille (bool, défaut vrai) } pour x et y ; y2 : { ticks: [[libellé, valeur de y]…], titre } ; x2 idem
  function axes(G, ax) {
    let s = `<rect x="${G.X0}" y="${G.Y0}" width="${G.X1 - G.X0}" height="${G.Y1 - G.Y0}" class="fc2-cadre"/>`;
    let g = "";
    const fx = ax.x.fmt || ((v) => nb(v)), fy = ax.y.fmt || ((v) => nb(v));
    const xs = ax.x.ticks.map((v) => [v, G.sx(v)]).filter(([, x]) => x >= G.X0 - 0.5 && x <= G.X1 + 0.5);
    const ys = ax.y.ticks.map((v) => [v, G.sy(v)]).filter(([, y]) => y >= G.Y0 - 0.5 && y <= G.Y1 + 0.5);
    for (const [v, x] of xs) {
      if (ax.x.grille !== false) g += `<line x1="${r1(x)}" y1="${G.Y0}" x2="${r1(x)}" y2="${G.Y1}" class="fc2-grille"/>`;
      s += `<line x1="${r1(x)}" y1="${G.Y1}" x2="${r1(x)}" y2="${G.Y1 + 4}" class="fc2-trait"/><text x="${r1(x)}" y="${G.Y1 + 15}" text-anchor="middle" class="fc2-tick">${esc(fx(v))}</text>`;
    }
    for (const [v, y] of ys) {
      if (ax.y.grille !== false) g += `<line x1="${G.X0}" y1="${r1(y)}" x2="${G.X1}" y2="${r1(y)}" class="fc2-grille"/>`;
      s += `<line x1="${G.X0 - 4}" y1="${r1(y)}" x2="${G.X0}" y2="${r1(y)}" class="fc2-trait"/><text x="${G.X0 - 7}" y="${r1(y + 3.6)}" text-anchor="end" class="fc2-tick">${esc(fy(v))}</text>`;
    }
    s += `<text x="${(G.X0 + G.X1) / 2}" y="${D.H - 12}" text-anchor="middle" class="fc2-axe">${esc(ax.x.titre)}</text>`;
    s += `<text x="15" y="${(G.Y0 + G.Y1) / 2}" text-anchor="middle" class="fc2-axe" transform="rotate(-90 15 ${(G.Y0 + G.Y1) / 2})">${esc(ax.y.titre)}</text>`;
    if (ax.y2) {
      for (const [lab, v] of ax.y2.ticks) {
        const y = G.sy(v); if (y < G.Y0 - 0.5 || y > G.Y1 + 0.5) continue;
        s += `<line x1="${G.X1}" y1="${r1(y)}" x2="${G.X1 + 4}" y2="${r1(y)}" class="fc2-trait"/><text x="${G.X1 + 7}" y="${r1(y + 3.6)}" class="fc2-tick">${esc(lab)}</text>`;
      }
      s += `<text x="${D.W - 12}" y="${(G.Y0 + G.Y1) / 2}" text-anchor="middle" class="fc2-axe" transform="rotate(90 ${D.W - 12} ${(G.Y0 + G.Y1) / 2})">${esc(ax.y2.titre)}</text>`;
    }
    if (ax.x2) {
      let premier = Infinity;
      for (const [lab, v] of ax.x2.ticks) {
        const x = G.sx(v); if (x < G.X0 - 0.5 || x > G.X1 + 0.5) continue;
        premier = Math.min(premier, x - largeur(lab, 10.5) / 2);
        s += `<line x1="${r1(x)}" y1="${G.Y0 - 4}" x2="${r1(x)}" y2="${G.Y0}" class="fc2-trait"/><text x="${r1(x)}" y="${G.Y0 - 8}" text-anchor="middle" class="fc2-tick">${esc(lab)}</text>`;
      }
      if (ax.x2.titre) {
        const w = largeur(ax.x2.titre, 10.5, false, true);
        s += premier - G.X0 > w + 14 ? `<text x="${r1(premier - 10)}" y="${G.Y0 - 8}" text-anchor="end" class="fc2-tick fc2-it">${esc(ax.x2.titre)}</text>`
          : `<text x="${G.X0}" y="${G.Y0 - 21}" class="fc2-tick fc2-it">${esc(ax.x2.titre)}</text>`;
      }
    }
    G.fond.push(g);
    G.axes = s;
  }

  // ── chemin numéroté ──
  // L : [{ x, y (unités), n, t, … }] ; les points sans coordonnées n'apparaissent que dans la liste.
  // Rendu : polyline .fc-chemin (data-num = « indice:numéro », lu par formation-anim.js pour le curseur),
  // flèches, pastilles noires, et un petit rond creux au départ s'il n'est pas numéroté.
  function chemin(G, L, o = {}) {
    const P = [], num = [];
    L.forEach((p) => { if (p.x == null || p.y == null || Number.isNaN(p.y)) return; if (p.n) num.push(`${P.length}:${p.n}`); P.push([G.sx(p.x), G.sy(p.y), p]); });
    if (!P.length) return;
    const xy = P.map(([x, y]) => [x, y]);
    // bandes (cristallisation, recristallisation…) : segment qui ARRIVE à un point portant `bande`, sous le chemin
    G.bandes = [];
    for (let i = 1; i < P.length; i++) if (P[i][2].bande) {
      const [x1, y1] = xy[i - 1], [x2, y2] = xy[i];
      G.domaines.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" class="fc2-bande"/>`);
      G.bandes.push({ x1, y1, x2, y2, lab: P[i][2].bande });
    }
    // un point portant `saut` : le segment qui y arrive n'est pas un changement de conditions de la même eau, de la même
    // roche (autre eau, autre époque) : tracé en pointillé fin ; la polyline .fc-chemin (lue par l'animation pour son
    // curseur) devient alors invisible et les tronçons sont tracés à part
    const sauts = P.some(([, , p], i) => i > 0 && p.saut);
    let s = `<polyline points="${ptsPx(xy)}" class="fc-chemin ${sauts ? "fc2-piste" : "fc2-chemin"}" data-num="${num.join(",")}"/>`;
    if (sauts) {
      let tr = [xy[0]];
      for (let i = 1; i < xy.length; i++) {
        if (P[i][2].saut) {
          if (tr.length > 1) s += `<polyline points="${ptsPx(tr)}" class="fc2-chemin"/>`;
          s += `<line x1="${r1(xy[i - 1][0])}" y1="${r1(xy[i - 1][1])}" x2="${r1(xy[i][0])}" y2="${r1(xy[i][1])}" class="fc2-saut"/>`;
          if (!P[i][2].n) G.dessus.push(`<circle cx="${r1(xy[i][0])}" cy="${r1(xy[i][1])}" r="3.6" class="fc2-depart"/>`);
          tr = [xy[i]];
        } else tr.push(xy[i]);
      }
      if (tr.length > 1) s += `<polyline points="${ptsPx(tr)}" class="fc2-chemin"/>`;
    }
    for (let i = 1; i < xy.length; i++) (P[i][2].saut ? G.doux : G.obs).push(segPoly(xy[i - 1][0], xy[i - 1][1], xy[i][0], xy[i][1], 3.2));
    for (const b of G.bandes) G.obs.push(segPoly(b.x1, b.y1, b.x2, b.y2, 6));
    // flèches au milieu des segments assez longs
    for (let i = 1; i < xy.length; i++) {
      const [x1, y1] = xy[i - 1], [x2, y2] = xy[i], L2 = Math.hypot(x2 - x1, y2 - y1);
      if (L2 < 30 || P[i][2].sansFleche || P[i][2].saut) continue;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, a = Math.atan2(y2 - y1, x2 - x1), t = 5.5;
      const tri = [[mx + Math.cos(a) * t, my + Math.sin(a) * t], [mx + Math.cos(a + 2.55) * t, my + Math.sin(a + 2.55) * t], [mx + Math.cos(a - 2.55) * t, my + Math.sin(a - 2.55) * t]];
      s += `<polygon points="${ptsPx(tri)}" class="fc2-fleche"/>`;
    }
    G.chemin.push(s);
    // départ (non numéroté)
    if (!P[0][2].n) {
      G.dessus.push(`<circle cx="${r1(xy[0][0])}" cy="${r1(xy[0][1])}" r="3.6" class="fc2-depart"/>`);
      G.obs.push(cerclePoly(xy[0][0], xy[0][1], 5));
    }
    // pastilles : les points qui coïncident ou presque (< 16 px) sont regroupés et dessinés accolés, dans l'ordre
    const R = 8.5, groupes = [];
    P.forEach(([x, y, p]) => {
      if (!p.n) return;
      const g = groupes.find((q) => q.pts.some(([a, b]) => Math.hypot(a - x, b - y) < 16));
      if (g) { g.n.push(p.n); g.pts.push([x, y]); } else groupes.push({ n: [p.n], pts: [[x, y]] });
    });
    for (const g of groupes) {
      g.x = g.pts.reduce((s, [a]) => s + a, 0) / g.pts.length; g.y = g.pts.reduce((s, [, b]) => s + b, 0) / g.pts.length;
      const k = g.n.length, larg = 2 * R * k;
      // centré sur le point, ramené dans le cadre si besoin (un trait relie alors le groupe à son point)
      let cx = clamp(g.x, G.X0 + larg / 2 + 1, G.X1 - larg / 2 - 1), cy = clamp(g.y, G.Y0 + R + 1, G.Y1 - R - 1);
      if (Math.hypot(cx - g.x, cy - g.y) > 3) G.dessus.push(`<line x1="${r1(g.x)}" y1="${r1(g.y)}" x2="${r1(cx)}" y2="${r1(cy)}" class="fc2-attache"/>`);
      g.n.forEach((n, i) => {
        const x = cx - larg / 2 + R + 2 * R * i;
        G.dessus.push(`<g class="fc-pastille" data-n="${n}"><circle cx="${r1(x)}" cy="${r1(cy)}" r="${R}" class="fc2-num"/><text x="${r1(x)}" y="${r1(cy + 3.7)}" text-anchor="middle" class="fc2-num-t">${n}</text></g>`);
        G.obs.push(cerclePoly(x, cy, R + 1.5));
      });
      g.cx = cx; g.cy = cy;
    }
    G.pastilles = groupes;
    // le curseur de l'animation glisse le long du chemin, par-dessus les pastilles
    G.curseur = `<circle r="6" class="fc-curseur" cx="-99" cy="-99"/>`;
  }

  // chemins secondaires, en gris tireté (ex. : les argiles qui partent au large pendant que le sable se dépose)
  // autres : [{ pts: [[x, y]…] (unités), lab }]
  function fantomes(G, autres) {
    for (const f of autres || []) {
      const P = f.pts.map(([x, y]) => G.P(x, y));
      let s = `<polyline points="${ptsPx(P)}" class="fc2-fantome"/>`;
      for (let i = 1; i < P.length; i++) {
        const [x1, y1] = P[i - 1], [x2, y2] = P[i], L2 = Math.hypot(x2 - x1, y2 - y1);
        G.doux.push(segPoly(x1, y1, x2, y2, 2.5));
        if (L2 < 30) continue;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, a = Math.atan2(y2 - y1, x2 - x1), t = 4.5;
        s += `<polygon points="${ptsPx([[mx + Math.cos(a) * t, my + Math.sin(a) * t], [mx + Math.cos(a + 2.55) * t, my + Math.sin(a + 2.55) * t], [mx + Math.cos(a - 2.55) * t, my + Math.sin(a - 2.55) * t]])}" class="fc2-fleche-fantome"/>`;
      }
      const [xf, yf] = P[P.length - 1];
      s += `<circle cx="${r1(xf)}" cy="${r1(yf)}" r="3" class="fc2-fin-fantome"/>`;
      G.chemin.unshift(s);
      G.obs.push(cerclePoly(xf, yf, 4));
      f._fin = [xf, yf];
    }
  }
  function etiquettesFantomes(G, autres) {
    for (const f of autres || []) if (f.lab && f._fin) etiquette(G, { t: f.lab, c: "fc2-lab-point", it: true, taille: 9.8, oblig: true, cands: autour(f._fin[0], f._fin[1], 8, 9.8) });
  }
  // bande de cristallisation (ou de réaction) le long d'un palier du chemin : de (x1, y) à (x2, y), en unités
  function bande(G, x1, x2, y, lab) {
    const [a, b] = [G.sx(x1), G.sx(x2)], yy = G.sy(y);
    G.domaines.push(`<line x1="${r1(a)}" y1="${r1(yy)}" x2="${r1(b)}" y2="${r1(yy)}" class="fc2-bande"/>`);
    return { a: Math.min(a, b), b: Math.max(a, b), y: yy, lab };
  }
  // étiquettes attachées au chemin : bandes (le long du segment) et points qui portent `lab`
  function etiquettesPoints(G, L) {
    for (const p of L) if (p.lab && p.x != null && p.y != null) {
      const [x, y] = G.P(p.x, p.y);
      etiquette(G, { t: p.lab, c: "fc2-lab-point", it: true, taille: 9.8, oblig: true, cands: autour(x, y, 10, 9.8) });
    }
    G.pointsFaits = true;
  }
  function etiquettesChemin(G, L) {
    if (!G.pointsFaits) etiquettesPoints(G, L);
    for (const b of G.bandes || []) {
      const mx = (b.x1 + b.x2) / 2, my = (b.y1 + b.y2) / 2, Lg = Math.hypot(b.x2 - b.x1, b.y2 - b.y1) || 1;
      const nx = -(b.y2 - b.y1) / Lg, ny = (b.x2 - b.x1) / Lg;
      let ang = Math.atan2(b.y2 - b.y1, b.x2 - b.x1) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      const rot = Math.abs(ang) < 8 ? 0 : ang;
      const c = [];
      for (const k of [0, 8, 16, 26]) for (const f of [0.5, 0.35, 0.65, 0.2, 0.8]) for (const s of [1, -1]) {
        const x = lerp(b.x1, b.x2, f), y = lerp(b.y1, b.y2, f);
        if (rot) c.push({ x: x + nx * s * (13 + k), y: y + ny * s * (13 + k) + 3, a: "middle", rot });
        else c.push({ x, y: y + (s > 0 ? 20 + k : -12 - k), a: "middle" });
      }
      for (const k of [10, 20]) c.push({ x: Math.max(b.x1, b.x2) + k, y: (b.y1 + b.y2) / 2 + 3.5 }, { x: Math.min(b.x1, b.x2) - k, y: (b.y1 + b.y2) / 2 + 3.5, a: "end" });
      etiquette(G, { t: b.lab, c: "fc2-lab-bande", gras: true, taille: 9.8, oblig: true, cands: c });
    }
  }

  function rendre(G, titre) {
    const svg = `<svg viewBox="0 0 ${D.W} ${D.H}" class="fc-svg fc2-svg" role="img" aria-label="${esc(titre)}"><defs>${G.defs.join("")}</defs>`
      + `<g clip-path="url(#${G.clip})">${G.fond.join("")}${G.domaines.join("")}${G.courbes.join("")}</g>`
      + G.axes + G.chemin.join("") + G.textes.join("") + G.dessus.join("") + (G.curseur || "") + `</svg>`;
    if (G.alertes.length) (window.__fc2 = window.__fc2 || []).push([titre, G.alertes.slice()]);
    return svg;
  }

  // liste numérotée sous le diagramme : une ligne par étape (même numéro que la pastille et l'animation)
  // le nom court de l'étape (champ `court` de l'animation) est repris en tête de ligne
  function legende(L, roche) {
    const A = roche && F.animation ? F.animation(roche) : null;
    const court = (n) => A && A.etapes[n - 1] && A.etapes[n - 1].court;
    const items = L.filter((p) => typeof p.t === "string" && p.t);
    if (!items.length) return "";
    return `<ol class="fc-etapes fc2-etapes">${items.map((p) => {
      const place = p.n && p.x != null && p.y != null && !Number.isNaN(p.y);
      const cls = !p.n ? ' class="fc-sans"' : place ? "" : ' class="fc2-hors"';
      const c = p.n && court(p.n);
      return `<li${p.n ? ` data-n="${p.n}"` : ""}${cls}><b>${p.n || ""}</b><span>${c ? `<strong>${c}</strong> — ` : ""}${p.t}</span></li>`;
    }).join("")}</ol>`;
  }

  // ─────────────────────────────── 5. types de diagrammes ───────────────────────────────
  const DIAG = {};
  const serie = (f, a, b, n = 48) => Array.from({ length: n + 1 }, (_, i) => f(a + (b - a) * i / n));
  const pas = (a, b, p) => { const t = []; for (let v = a; v <= b + 1e-9; v += p) t.push(Math.round(v * 1000) / 1000); return t; };
  // candidats d'étiquette à partir d'une liste de points (unités des axes)
  const candsData = (G, L, a = "middle") => L.map(([x, y, aa]) => ({ x: G.sx(x), y: G.sy(y) + 3.5, a: aa || a }));

  // ═════════════ 5.1 pression–température ═════════════
  // profondeur (km) ↔ pression (GPa) : croûte de masse volumique 2,8 sur 35 km, manteau à 3,3 dessous
  const kmDeGPa = (p) => p <= 0.9614 ? p / 0.027468 : 35 + (p - 0.9614) / 0.032373;
  const GPaDeKm = (d) => d <= 35 ? d * 0.027468 : 0.9614 + (d - 35) * 0.032373;
  // échelles : magmatiques en racine carrée (la croûte, où tout se joue, est dilatée), métamorphiques en linéaire
  const ECH_PT = {
    croute:  { T: 1400, P: 1.1, type: "sqrt", Tt: pas(0, 1400, 200), Pt: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1], km: [0, 5, 10, 20, 30, 40] },
    manteau: { T: 1800, P: 4, type: "sqrt", Tt: pas(0, 1800, 300), Pt: [0, 0.25, 0.5, 1, 1.5, 2, 3, 4], km: [0, 10, 25, 50, 75, 100, 125] },
    profond: { T: 2000, P: 8, type: "sqrt", Tt: pas(0, 2000, 400), Pt: [0, 0.5, 1, 2, 3, 4, 6, 8], km: [0, 25, 50, 100, 150, 200, 250] },
    reg:     { T: 1000, P: 1.6, type: "lin", Tt: pas(0, 1000, 200), Pt: pas(0, 1.6, 0.2), km: [0, 10, 20, 30, 40, 50] },
    hp:      { T: 1000, P: 3.2, type: "lin", Tt: pas(0, 1000, 200), Pt: pas(0, 3.2, 0.4), km: [0, 25, 50, 75, 100] },
    contact: { T: 1000, P: 0.6, type: "lin", Tt: pas(0, 1000, 200), Pt: pas(0, 0.6, 0.1), km: [0, 5, 10, 15, 20] },
    faille:  { T: 1400, P: 0.8, type: "lin", Tt: pas(0, 1400, 200), Pt: pas(0, 0.8, 0.1), km: [0, 5, 10, 15, 20, 25] },
    fond:    { T: 1200, P: 0.3, type: "lin", Tt: pas(0, 1200, 200), Pt: pas(0, 0.3, 0.05), km: [0, 2, 4, 6, 8, 10] },
  };
  // courbes de référence : points [T °C, P GPa]
  const COURBES = {
    peridotite: { nom: "solidus du manteau sec", src: "hirschmann", cls: "fc2-c-solidus", pts: (E) => serie((p) => [1120.661 + 132.899 * p - 5.104 * p * p, p], 0, E.P) },
    peridotiteEau: { nom: "solidus du manteau avec eau", src: "grove2006", cls: "fc2-c-solidus", pts: () => [[860, 2.0], [845, 2.3], [830, 2.6], [815, 2.9], [800, 3.2]] },
    // Tuttle et Bowen 1958, Luth et al. 1964 (jusqu'à 1 GPa) ; au-delà, prolongé à 625 °C (courbe presque verticale)
    // mesures de 0,05 à 1 GPa ; vers la surface il n'y a plus d'eau sous pression : la courbe rejoint le solidus du granite
    // SEC (≈ 950 °C), prolongement tracé en tirets (`debut`), qui ferme aussi le domaine fondu
    graniteEau: { nom: "solidus du granite avec eau", src: "tuttle", cls: "fc2-c-solidus", debut: [[950, 0], [770, 0.05]], pts: (E) => [[770, 0.05], [720, 0.1], [685, 0.2], [665, 0.3], [655, 0.4], [645, 0.5], [625, 1.0]].concat(E.P > 1 ? [[625, E.P]] : []) },
    jadeite: { nom: "albite → jadéite + quartz", src: "holland", cls: "fc2-c-reaction", pts: () => serie((t) => [t, 0.035 + 0.00265 * t], 150, 1000) },
    coesite: { nom: "quartz → coésite", src: "bose", cls: "fc2-c-reaction", pts: () => serie((t) => [t, 2.1945 + 0.0006901 * (t + 273.15)], 300, 1000) },
    diamant: { nom: "graphite → diamant", src: "kennedy", cls: "fc2-c-reaction", pts: (E) => serie((t) => [t, 1.94 + 0.0025 * t], 400, E.T) },
    kyAnd: { nom: "", src: "pattison", cls: "fc2-c-reaction", pts: () => [[550 - 0.45 / 0.00115, 0], [550, 0.45]] },
    andSil: { nom: "", src: "pattison", cls: "fc2-c-reaction", pts: () => [[550, 0.45], [550 + 0.45 / 0.0016, 0]] },
    kySil: { nom: "", src: "pattison", cls: "fc2-c-reaction", pts: () => [[550, 0.45], [1000, 0.45 + 0.00207 * 450]] },
    quartzDuctile: { nom: "le quartz devient ductile", src: "scholz", cls: "fc2-c-limite", pts: (E) => [[300, 0], [300, E.P]] },
    feldspathDuctile: { nom: "les feldspaths deviennent ductiles", src: "scholz", cls: "fc2-c-limite", pts: (E) => [[450, 0], [450, E.P]] },
  };
  // gradient géothermique : T = 10 °C + g × profondeur
  const gradient = (g, E) => serie((d) => [10 + g * d, GPaDeKm(d)], 0, kmDeGPa(E.P), 40).filter(([t]) => t <= E.T * 1.02);

  // ── faciès métamorphiques : pavage JOINTIF (aucun trou) ; limites progressives, positions indicatives ──
  // L_B schistes bleus, L_E éclogites, L_G granulites : sommets partagés d'un faciès à l'autre
  const L_B = [[0, 0.3], [100, 0.42], [200, 0.55], [300, 0.68], [400, 0.82], [500, 0.98]];
  const L_E = [[500, 1.25], [775, 1.39], [900, 1.45], [1100, 1.6], [1500, 1.8]];
  const FACIES = [
    { nom: "diagenèse", cls: "fc2-f-diag", pts: [[0, 0], [200, 0], [200, 0.55], [100, 0.42], [0, 0.3]], lab: [[95, 0.14], [100, 0.24], [60, 0.08]] },
    { nom: "très faible\ndegré", cls: "fc2-f-tfd", pts: [[200, 0], [300, 0], [300, 0.68], [200, 0.55]], lab: [[250, 0.1], [250, 0.3], [250, 0.45]] },
    { nom: "cornéennes", cls: "fc2-f-corn", pts: [[300, 0], [1500, 0], [1500, 0.2], [300, 0.2]], lab: [[650, 0.1], [450, 0.1], [850, 0.1], [650, 0.05], [400, 0.14]] },
    { nom: "schistes verts", cls: "fc2-f-sv", pts: [[300, 0.2], [500, 0.2], [500, 0.98], [400, 0.82], [300, 0.68]], lab: [[400, 0.42], [400, 0.3], [400, 0.58], [430, 0.7]] },
    { nom: "amphibolites", cls: "fc2-f-amph", pts: [[500, 0.2], [700, 0.2], [740, 0.8], [775, 1.39], [500, 1.25]], lab: [[610, 0.62], [610, 0.95], [600, 0.35], [610, 1.15]] },
    { nom: "granulites", cls: "fc2-f-gran", pts: [[700, 0.2], [1500, 0.2], [1500, 1.8], [1100, 1.6], [900, 1.45], [775, 1.39], [740, 0.8]], lab: [[880, 0.8], [880, 0.5], [900, 1.1], [850, 0.35]] },
    { nom: "schistes bleus", cls: "fc2-f-sb", pts: [...L_B, [500, 1.25], [500, 9], [0, 9]], lab: [[290, 1.2], [300, 1.45], [300, 2.4], [250, 1.0], [320, 1.8]] },
    { nom: "éclogites", cls: "fc2-f-ecl", pts: [...L_E, [1500, 9], [500, 9]], lab: [[800, 1.55], [860, 2.5], [700, 1.52], [900, 2.0], [650, 2.8]] },
  ];

  function cadrePT(c, titre) {
    const E = ECH_PT[c.echelle] || ECH_PT.croute;
    const G = graphique({ x: { min: 0, max: E.T }, y: { min: 0, max: E.P, type: E.type, bas: true, pad0: 12 } });
    axes(G, {
      x: { ticks: E.Tt, titre: "Température (°C)" },
      y: { ticks: E.Pt, titre: "Pression (GPa)", fmt: (v) => nb(v, v === 0 ? 0 : Math.abs(v * 10 - Math.round(v * 10)) > 1e-6 ? 2 : 1) },
      y2: { titre: "Profondeur (km)", ticks: E.km.map((d) => [nb(d), GPaDeKm(d)]).filter(([, p]) => p <= E.P + 1e-9) },
    });
    // surface : trait fin au niveau P = 0 (au-dessus, la bande blanche laisse la place aux pastilles de surface)
    G.fond.push(`<line x1="${G.X0}" y1="${r1(G.sy(0))}" x2="${G.X1}" y2="${r1(G.sy(0))}" class="fc2-surface"/>`);
    return { G, E };
  }
  // étiquettes des courbes demandées, le long de la courbe
  function etiquettesCourbes(G, E, noms, fr) {
    for (const n of noms) {
      const cb = COURBES[n]; if (!cb || !cb.nom) continue;
      const L = cb.pts(E).map(([t, p]) => G.P(t, p)).filter(([x, y]) => x >= G.X0 && x <= G.X1 && y >= G.Y0 && y <= G.Y1);
      const bouts = [];
      for (const [x, y] of L.length ? [L[0], L[L.length - 1]] : []) bouts.push({ x: x + 6, y: y + 3.5 }, { x: x - 6, y: y + 3.5, a: "end" }, { x, y: y - 7, a: "middle" }, { x, y: y + 13, a: "middle" });
      etiquette(G, { t: cb.nom, c: "fc2-lab-courbe", it: true, taille: 9.8, cands: [...leLong(G, cb.pts(E), fr), ...bouts], oblig: true });
    }
  }
  function tracerCourbes(G, E, noms) {
    for (const n of noms) {
      const cb = COURBES[n]; if (!cb) continue;
      if (cb.debut) courbe(G, cb.debut, "fc2-courbe fc2-c-prolonge");
      courbe(G, cb.pts(E), `fc2-courbe ${cb.cls}`);
    }
  }
  // domaine au-delà d'un solidus (fusion partielle) ; renvoie son contour en pixels (pour y placer l'étiquette)
  // contour d'un domaine au-delà d'une courbe : courbe (et son prolongement) puis bord droit du cadre
  function contourAuDela(E, n) {
    const cb = COURBES[n], L = [...(cb.debut || []).slice(0, -1), ...cb.pts(E)];
    return [...L, [E.T * 3, L[L.length - 1][1]], [E.T * 3, 0], [L[0][0], 0]];
  }
  function domaineFondu(G, E, n) {
    const poly = contourAuDela(E, n);
    polygone(G, poly, "fc2-fondu");
    return poly.map(([t, p]) => G.P(Math.min(t, E.T * 1.5), p));
  }
  // étiquette de champ : grille de positions dans la zone [xmin, xmax, ymin, ymax] (unités), la plus proche de `pref`
  function deuxLignes(t) {
    if (/\n/.test(t)) return [];
    const i = t.indexOf(" ("); if (i > 0) return [t.slice(0, i) + "\n" + t.slice(i + 1)];
    const m = t.split(" "); if (m.length < 3) return [];
    const k = Math.ceil(m.length / 2); return [m.slice(0, k).join(" ") + "\n" + m.slice(k).join(" ")];
  }
  function etiquetteZone(G, t, zone, pref, o = {}) {
    return etiquette(G, Object.assign({ t, c: o.c || "fc2-lab-champ", gras: o.gras !== false, taille: o.taille, it: o.it, oblig: o.oblig !== false,
      cands: [...(o.avant || []), ...candsZone(G, zone, pref, o)], dans: o.dans, alt: o.alt || deuxLignes(t) }));
  }
  // chemin P–T → unités du cadre
  const cheminPT = (L) => L.map((p) => Object.assign({}, p, { x: p.T, y: p.P }));

  // ── magmatiques : naissance du magma, montée, mise en place, cristallisation ──
  // c : { echelle, courbes, fondu, labFondu, etiquettes [[texte, T, P]…], chemin, note }
  const ZONE_FONDU = { croute: [[660, 1400, 0.02, 1.1], [1050, 0.95]], manteau: [[1150, 1800, 0.3, 4], [1620, 3.4]], profond: [[1300, 2000, 0.5, 8], [1800, 7.2]] };
  DIAG.magma = function (c, roche) {
    const { G, E } = cadrePT(c);
    const noms = c.courbes || (c.echelle === "croute" ? ["graniteEau", "peridotite"] : c.echelle === "profond" ? ["peridotite", "diamant"] : ["peridotite"]);
    const fondus = (c.fondu || [noms[0]]).map((n) => domaineFondu(G, E, n));
    const moho = c.echelle !== "croute" && E.P > 1;
    if (moho) { const y = G.sy(0.9614); G.courbes.push(`<line x1="${G.X0}" y1="${r1(y)}" x2="${G.X1}" y2="${r1(y)}" class="fc2-moho"/>`); G.doux.push(segPoly(G.X0, y, G.X1, y, 1)); }
    tracerCourbes(G, E, noms);
    const ch = cheminPT(c.chemin);
    chemin(G, ch);
    // étiquettes, de la plus contrainte à la plus libre
    etiquettesPoints(G, ch);
    etiquettesCourbes(G, E, noms);
    etiquettesChemin(G, ch);
    if (moho) etiquette(G, { t: "base de la croûte (Moho)", c: "fc2-lab-courbe", it: true, taille: 9.5, oblig: true,
      cands: [0.05, 0.25, 0.45, 0.15, 0.35, 0.55, 0.65].flatMap((f) => [-4, 12].map((dy) => ({ x: G.X0 + 6 + f * (G.X1 - G.X0), y: G.sy(0.9614) + dy }))) });
    const lf = c.labFondu || (c.echelle === "croute" ? "fusion partielle\n(avec eau)" : "manteau\npartiellement fondu");
    const [zf, pf] = ZONE_FONDU[c.echelle] || ZONE_FONDU.manteau;
    etiquetteZone(G, lf, zf, pf, { dans: fondus[0] });
    for (const [t, T, P] of c.etiquettes || []) etiquetteZone(G, t, [T - E.T * 0.18, T + E.T * 0.18, Math.max(0, P - E.P * 0.2), Math.min(E.P, P + E.P * 0.2)], [T, P]);
    return rendre(G, `Diagramme pression-température : ${roche.nom}`) + legende(ch, roche);
  };

  // ── métamorphiques : faciès jointifs, silicates d'alumine, jadéite, coésite, anatexie, gradients ──
  // c : { echelle, courbes, anatexie (bool), gradients [°C/km…], chemin, note, masquer [faciès] }
  const LAB_AL = { andalousite: [[400, 610, 0.02, 0.4], [480, 0.16]], sillimanite: [[600, 1000, 0.05, 1.2], [820, 0.4]], "disthène": [[300, 800, 0.5, 1.6], [650, 1.0]] };
  // zones des silicates d'alumine (T, P) : andalousite sous kyAnd et andSil ; sillimanite à droite ; disthène au-dessus
  const POLY_AL = {
    andalousite: [[158.7, 0], [550, 0.45], [831, 0]],
    sillimanite: [[831, 0], [550, 0.45], [1000, 1.38], [1500, 1.38], [1500, 0]],
    "disthène": [[0, 0], [158.7, 0], [550, 0.45], [1000, 1.38], [1000, 9], [0, 9]],
  };
  DIAG.meta = function (c, roche) {
    const { G, E } = cadrePT(c);
    for (const f of FACIES) polygone(G, f.pts, `fc2-facies ${f.cls}`);
    let anat = null;
    if (c.anatexie) { // au-delà du solidus du granite avec eau : la roche commence à fondre
      const poly = contourAuDela(E, "graniteEau");
      polygone(G, poly, "fc2-anatexie");
      anat = poly.map(([t, p]) => G.P(Math.min(t, E.T * 1.5), p));
    }
    for (const g of c.gradients || []) courbe(G, gradient(g, E), "fc2-courbe fc2-c-gradient");
    const noms = c.courbes || [];
    tracerCourbes(G, E, noms);
    const ch = cheminPT(c.chemin);
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquettesCourbes(G, E, noms.filter((n) => COURBES[n] && COURBES[n].nom));
    etiquettesChemin(G, ch);
    if (noms.includes("kySil")) for (const [nom, [z, pref]] of Object.entries(LAB_AL))
      etiquetteZone(G, nom, z, pref, { c: "fc2-lab-courbe", gras: false, it: true, taille: 9.8, dans: POLY_AL[nom].map(([t, p]) => G.P(Math.min(t, E.T * 1.5), Math.min(p, E.P * 1.5))) });
    for (const g of c.gradients || []) {
      const L = gradient(g, E);
      etiquette(G, { t: `${g} °C/km`, c: "fc2-lab-courbe", it: true, taille: 9.5, oblig: true, cands: leLong(G, L, [0.92, 0.85, 0.78, 0.7, 0.62, 0.55]) });
    }
    if (anat) etiquetteZone(G, "fusion partielle (anatexie)", [640, E.T, 0.02, E.P], [880, 0.3], { dans: anat });
    for (const f of FACIES) {
      if ((c.masquer || []).includes(f.nom)) continue;
      const pref = ((c.labFacies && c.labFacies[f.nom]) || f.lab)[0];
      const ts = f.pts.map(([t]) => t), ps = f.pts.map(([, p]) => p);
      const zone = [Math.max(0, Math.min(...ts)), Math.min(E.T, Math.max(...ts)), Math.max(0, Math.min(...ps)), Math.min(E.P, Math.max(...ps))];
      if (zone[0] >= zone[1] || zone[2] >= zone[3]) continue;
      etiquetteZone(G, f.nom, zone, pref, { c: "fc2-lab-facies", rot: f.rot, oblig: false, dans: f.pts.map(([t, p]) => G.P(Math.min(t, E.T * 1.5), Math.min(p, E.P * 1.5))) });
    }
    for (const [t, T, P] of c.etiquettes || []) etiquetteZone(G, t, [T - E.T * 0.18, T + E.T * 0.18, Math.max(0, P - E.P * 0.2), Math.min(E.P, P + E.P * 0.2)], [T, P]);
    return rendre(G, `Diagramme pression-température : ${roche.nom}`) + legende(ch, roche);
  };

  // ── roches de faille : cassant / ductile le long du géotherme ──
  DIAG.faille = function (c, roche) {
    const { G, E } = cadrePT(Object.assign({ echelle: "faille" }, c));
    // domaine ductile (au-delà de 300 °C pour le quartz) en aplat, domaine cassant en blanc
    polygone(G, [[300, 0], [E.T * 2, 0], [E.T * 2, E.P * 2], [300, E.P * 2]], "fc2-ductile");
    const geo = gradient(30, E);
    courbe(G, geo, "fc2-courbe fc2-c-gradient");
    const noms = c.courbes || ["quartzDuctile", "feldspathDuctile"];
    tracerCourbes(G, E, noms);
    if (c.fusionSeche) polygone(G, [[1000, 0], [E.T * 2, 0], [E.T * 2, E.P * 2], [1000, E.P * 2]], "fc2-fondu"); // roche sèche : fusion au-delà d'≈ 1 000 °C
    const ch = cheminPT(c.chemin);
    chemin(G, ch);
    for (const n of noms) {
      const T = n === "quartzDuctile" ? 300 : 450, t = n === "quartzDuctile" ? "quartz ductile →" : "feldspaths ductiles →";
      const cands = [];
      for (const P of [0.03, 0.06, 0.1, 0.14, 0.18, 0.78, 0.74, 0.7, 0.66, 0.62, 0.58]) cands.push({ x: G.sx(T) + 5, y: G.sy(P) + 3.5, a: "start" });
      etiquette(G, { t, c: "fc2-lab-courbe", it: true, taille: 9.5, oblig: true, cands });
    }
    etiquettesChemin(G, ch);
    etiquette(G, { t: "géotherme moyen (30 °C/km)", c: "fc2-lab-courbe", it: true, taille: 9.5, oblig: true, cands: leLong(G, geo, [0.75, 0.65, 0.85, 0.55, 0.45, 0.9, 0.35]) });
    etiquetteZone(G, "cassant", [0, 290, 0, E.P], [150, 0.7]);
    etiquetteZone(G, "ductile", [460, c.fusionSeche ? 990 : E.T, 0, E.P], [800, 0.7]);
    if (c.fusionSeche) etiquetteZone(G, "la roche sèche fond", [1000, E.T, 0, E.P], [1200, 0.6]);
    return rendre(G, `Diagramme pression-température : ${roche.nom}`) + legende(ch, roche);
  };

  // ── choc (impacts) : pression de choc et température qui reste après le passage de l'onde ──
  // French (1998), Traces of Catastrophe, fig. 4.1 et tableau 4.2 (d'après Stöffler 1971, 1984) :
  // métamorphisme ordinaire < 3–5 GPa et < 1 000 °C ; températures après choc d'une roche cristalline dense
  const STADES_CHOC = [
    { de: 2, a: 10, nom: "fractures", cls: "fc2-s0" },
    { de: 10, a: 35, nom: "quartz choqué", cls: "fc2-s1" },
    { de: 35, a: 45, nom: "verre diaplectique", cls: "fc2-s2" },
    { de: 45, a: 100, nom: "fusion", cls: "fc2-s3" },
    { de: 100, a: 300, nom: "vaporisation", cls: "fc2-s4" },
  ];
  const T_CHOC = [[2, 50], [6, 100], [10, 100], [13, 150], [20, 170], [30, 275], [35, 300], [45, 900], [60, 1500], [100, 2500]];
  DIAG.choc = function (c, roche) {
    const G = graphique({ x: { min: 0.1, max: 300, type: "log" }, y: { min: 0, max: 3000, pad0: 6 } });
    axes(G, { x: { ticks: [0.1, 1, 10, 100], titre: "Pression de l'onde de choc (GPa, échelle logarithmique)", fmt: (v) => nb(v) },
      y: { ticks: pas(0, 3000, 500), titre: "Température après le choc (°C)" } });
    for (const z of STADES_CHOC) G.domaines.push(`<rect x="${r1(G.sx(z.de))}" y="${G.Y0}" width="${r1(G.sx(z.a) - G.sx(z.de))}" height="${G.Y1 - G.Y0}" class="fc2-stade ${z.cls}"/>`);
    // domaine du métamorphisme ordinaire (croûte et manteau supérieur)
    polygone(G, [[0.1, 0], [3, 0], [3, 1000], [0.1, 1000]], "fc2-ordinaire");
    courbe(G, T_CHOC, "fc2-courbe fc2-c-solidus");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.P, y: p.T }));
    chemin(G, ch);
    etiquettesChemin(G, ch);
    etiquetteZone(G, "métamorphisme ordinaire", [0.1, 3, 0, 1000], [0.55, 600]);
    for (const z of STADES_CHOC) {
      const rect = [[z.de, 0], [z.a, 0], [z.a, 3000], [z.de, 3000]].map(([p, t]) => G.P(p, t));
      const w = largeur(z.nom, 9.8, true), large = G.sx(z.a) - G.sx(z.de) > w + 6;
      etiquetteZone(G, z.nom, [z.de, z.a, 1700, 3000], [Math.sqrt(z.de * z.a), 2800], { taille: 9.8, rot: large ? 0 : -90, dans: rect, pas: 5 });
    }
    return rendre(G, `Métamorphisme de choc : ${roche.nom}`) + legende(ch, roche);
  };

  // ═════════════ 5.2 roches sédimentaires ═════════════
  const interpLog = (T, x) => { // interpolation linéaire en log x dans une table [[x, y]…] triée
    if (x <= T[0][0]) return T[0][1]; if (x >= T[T.length - 1][0]) return T[T.length - 1][1];
    let i = 1; while (T[i][0] < x) i++;
    const u = (Math.log(x) - Math.log(T[i - 1][0])) / (Math.log(T[i][0]) - Math.log(T[i - 1][0]));
    return T[i - 1][1] + u * (T[i][1] - T[i - 1][1]);
  };
  const interpLin = (T, x) => {
    if (x <= T[0][0]) return T[0][1]; if (x >= T[T.length - 1][0]) return T[T.length - 1][1];
    let i = 1; while (T[i][0] < x) i++;
    const u = (x - T[i - 1][0]) / (T[i][0] - T[i - 1][0]);
    return T[i - 1][1] + u * (T[i][1] - T[i - 1][1]);
  };
  const rectData = (G, x0, x1, y0, y1, cls) => { const [a, b] = G.P(x0, y0), [c, d] = G.P(x1, y1); G.domaines.push(`<rect x="${r1(Math.min(a, c))}" y="${r1(Math.min(b, d))}" width="${r1(Math.abs(c - a))}" height="${r1(Math.abs(d - b))}" class="${cls}"/>`); };
  const polyPx = (G, L) => L.map(([x, y]) => G.P(x, y));
  // petit rond sur un seuil (point de rupture d'une courbe)
  const pointSeuil = (G, x, y) => { const [a, b] = G.P(x, y); G.courbes.push(`<circle cx="${r1(a)}" cy="${r1(b)}" r="3.2" class="fc2-seuil"/>`); G.obs.push(cerclePoly(a, b, 4)); return [a, b]; };

  // ── 5.2.1 évaporites : ce que l'eau porte de chaque sel, et le seuil au-delà duquel il cristallise ──
  // Pour 1 kg de l'eau contenue dans l'eau de mer (composition de référence, Millero et al. 2008), en masse du minéral :
  // gypse 1,83 g (limité par le calcium), halite 28,4 g (limitée par le sodium), sylvite 0,79 g (limitée par le potassium).
  // La concentration monte comme le facteur d'évaporation F ; seuils : gypse à × 3,8 et halite à × 10,6 (McCaffrey et al.
  // 1987), premiers sels de potassium vers × 65 (Warren 2021). Au-delà, ce qui arrive en plus cristallise (tracé simplifié :
  // palier).
  const SELS = {
    gypse: { nom: "gypse dissous", c0: 1.83, F: 3.8, seuil: "gypse : ≈ 7 g/kg" },
    halite: { nom: "sel dissous (halite)", c0: 28.4, F: 10.6, seuil: "sel : ≈ 300 g/kg" },
    sylvite: { nom: "potassium dissous (sylvite)", c0: 0.79, F: 65, seuil: "potassium : ≈ 50 g/kg" },
  };
  const STADES_EVAP = [[1, 3.8, "carbonates"], [3.8, 10.6, "gypse"], [10.6, 65, "sel gemme"], [65, 1000, "sels de potassium"]];
  DIAG.saumure = function (c, roche) {
    const xmin = c.xmin || 0.8, xmax = c.xmax || 130, ymin = c.ymin || 0.3;
    const G = graphique({ x: { min: xmin, max: xmax, type: "log" }, y: { min: ymin, max: 1000, type: "log" } });
    axes(G, {
      x: { ticks: [0.01, 0.1, 1, 2, 5, 10, 20, 50, 100].filter((v) => v >= xmin && v <= xmax), titre: "Concentration de l'eau (× celle de l'eau de mer)", fmt: (v) => "× " + nb(v) },
      y: { ticks: [0.01, 0.1, 1, 10, 100, 1000].filter((v) => v >= ymin), titre: "Dissous (grammes par kg d'eau)" },
      x2: { titre: "part de l'eau évaporée", ticks: [["0 %", 1], ["50 %", 2], ["74 %", 3.8], ["91 %", 10.6], ["98,5 %", 65]].filter(([, v]) => v >= xmin && v <= xmax) },
    });
    STADES_EVAP.forEach(([a, b], i) => { if (b > xmin && a < xmax) rectData(G, Math.max(a, xmin), Math.min(b, xmax), ymin, 1000, i % 2 ? "fc2-zone2" : "fc2-zone1"); });
    const actifs = c.sels || ["gypse"];
    const lignes = {};
    for (const [cle, S] of Object.entries(SELS)) {
      if (c.selsVisibles && !c.selsVisibles.includes(cle)) continue;
      const L = [[xmin, S.c0 * xmin], [S.F, S.c0 * S.F], [xmax, S.c0 * S.F]];
      courbe(G, L, `fc2-courbe ${actifs.includes(cle) ? "fc2-c-conc-actif" : "fc2-c-conc"}`);
      lignes[cle] = L;
    }
    if (c.eauDouce) { // saturation du gypse dans l'eau douce
      courbe(G, [[xmin, 2.4], [0.3, 2.4]], "fc2-courbe fc2-c-seuil");
    }
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.F, y: p.C }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    // seuils : un rond et sa valeur
    for (const [cle, L] of Object.entries(lignes)) {
      const S = SELS[cle]; if (S.F >= xmax || S.F <= xmin) continue;
      const [a, b] = pointSeuil(G, S.F, S.c0 * S.F);
      etiquette(G, { t: S.seuil, c: actifs.includes(cle) ? "fc2-lab-seuil" : "fc2-lab-courbe", taille: 9.8, oblig: true,
        cands: [{ x: a + 7, y: b - 7 }, { x: a - 7, y: b - 7, a: "end" }, { x: a + 7, y: b + 14 }, { x: a, y: b - 10, a: "middle" }, { x: a - 7, y: b + 14, a: "end" }, ...autour(a, b, 12, 9.8)] });
    }
    for (const [cle, L] of Object.entries(lignes)) etiquette(G, { t: SELS[cle].nom, c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, L.slice(0, 2)) });
    if (c.eauDouce) { // limite du gypse dans l'eau douce : candidats au-dessus puis au-dessous du trait, de gauche à droite
      const [xa, ya] = G.P(xmin, 2.4), [xb] = G.P(0.3, 2.4), cands = [];
      for (const dy of [-6, 14, 24]) for (let x = xa + 4; x < xb; x += 8) cands.push({ x, y: ya + dy });
      etiquette(G, { t: "eau douce : 2,4 g/kg au plus", c: "fc2-lab-courbe", it: true, taille: 9.5, oblig: true, cands });
    }
    etiquettesChemin(G, ch);
    // stade : ce qui cristallise dans chaque intervalle, en haut
    STADES_EVAP.forEach(([a, b, nom]) => {
      if (b <= xmin || a >= xmax) return;
      const xc = Math.sqrt(Math.max(a, xmin) * Math.min(b, xmax));
      etiquetteZone(G, nom, [Math.max(a, xmin), Math.min(b, xmax), 400, 1000], [xc, 800], { taille: 9.8, oblig: false });
    });
    return rendre(G, `Évaporation et seuils de cristallisation : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.2 gypse ou anhydrite ? (température et salinité) ──
  // Hardie (1967) : transition gypse → anhydrite à 58 °C dans l'eau pure, 18 °C dans une saumure saturée en sel. Activité de
  // l'eau d'une eau de mer concentrée F fois ≈ 0,98 (× 1), 0,93 (× 3,8), 0,75 (× 10,6) ; entre les deux, équation de van 't Hoff
  // calée sur ces deux températures (calcul de l'atlas).
  const AW = [[0.01, 1], [0.1, 0.998], [1, 0.981], [2, 0.962], [3.8, 0.93], [6, 0.88], [8, 0.83], [10.6, 0.75]];
  const Tgypse = (F) => 1 / (1 / 331.15 - 2 * Math.log(interpLog(AW, F)) / 1385.6) - 273.15;
  DIAG.anhydrite = function (c, roche) {
    const xmin = 0.05, xmax = 10.6;
    const G = graphique({ x: { min: xmin, max: xmax, type: "log" }, y: { min: 0, max: 100, pad0: 2 } });
    axes(G, { x: { ticks: [0.1, 0.2, 0.5, 1, 2, 5, 10], titre: "Concentration de l'eau (× celle de l'eau de mer)", fmt: (v) => "× " + nb(v) },
      y: { ticks: pas(0, 100, 20), titre: "Température (°C)" },
      x2: { ticks: [["eau douce", 0.1], ["eau de mer", 1], ["gypse", 3.8], ["sel", 10.6]] } });
    const L = serie((u) => [Math.pow(10, u), Tgypse(Math.pow(10, u))], Math.log10(xmin), Math.log10(xmax), 60);
    polygone(G, [...L, [xmax, 100], [xmin, 100]], "fc2-anhy");
    polygone(G, [...L, [xmax, 0], [xmin, 0]], "fc2-gyps");
    courbe(G, L, "fc2-courbe fc2-c-solidus");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.F, y: p.T }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "gypse ⇄ anhydrite", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, L) });
    etiquettesChemin(G, ch);
    etiquetteZone(G, "anhydrite stable\n(CaSO₄, sans eau)", [xmin, xmax, 60, 100], [0.3, 85]);
    etiquetteZone(G, "gypse stable\n(CaSO₄·2H₂O)", [xmin, xmax, 0, 40], [0.3, 15]);
    return rendre(G, `Gypse ou anhydrite : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.3 dolomie : rapport magnésium / calcium de la saumure ──
  // Eau de mer : Mg/Ca ≈ 5 (en moles ; Millero et al. 2008). Dès × 3,8, le gypse retire du calcium (le sulfate est en excès) :
  // calcul de l'atlas à produit de solubilité constant, sans coefficients d'activité — ordre de grandeur.
  const MGCA = (F) => {
    if (F <= 3.8) return 5.13;
    const K = (0.01066 * 3.8) * (0.02927 * 3.8), d = (0.02927 - 0.01066) * F;
    const u = (-d + Math.sqrt(d * d + 4 * K)) / 2;
    return 0.05475 * F / u;
  };
  DIAG.mgca = function (c, roche) {
    const G = graphique({ x: { min: 0.8, max: 12, type: "log" }, y: { min: 1, max: 50, type: "log" } });
    axes(G, { x: { ticks: [1, 2, 3.8, 5, 10], titre: "Concentration de la saumure (× celle de l'eau de mer)", fmt: (v) => "× " + nb(v, v === 3.8 ? 1 : 0) },
      y: { ticks: [1, 2, 5, 10, 20, 50], titre: "Magnésium ÷ calcium dans la saumure" },
      x2: { ticks: [["0 %", 1], ["50 %", 2], ["74 %", 3.8], ["91 %", 10.6]], titre: "part de l'eau évaporée" } });
    rectData(G, 3.8, 10.6, 1, 50, "fc2-zone2");
    const L = serie((u) => [Math.pow(10, u), MGCA(Math.pow(10, u))], Math.log10(0.8), Math.log10(12), 60);
    courbe(G, L, "fc2-courbe fc2-c-conc-actif");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.F, y: p.R }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "rapport magnésium/calcium de la saumure", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, L.slice(30)) });
    etiquettesChemin(G, ch);
    etiquetteZone(G, "le gypse cristallise\net extrait du calcium", [3.9, 10.4, 14, 48], [5.2, 30]);
    etiquetteZone(G, "eau de mer : Mg/Ca ≈ 5", [0.8, 3.8, 1, 4.5], [1.6, 3.5], { c: "fc2-lab-courbe", gras: false });
    return rendre(G, `Saumure et dolomitisation : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.4 silice dissoute : saturation de l'opale et du quartz ──
  const siliceOpale = (tc) => Math.pow(10, -731 / (tc + 273.15) + 4.52);                   // mg/kg, Fournier et Rowe 1977
  const siliceQuartz = (tc) => Math.pow(10, -0.0254 - 1107.12 / (tc + 273.15)) * 60084;     // mg/kg, Rimstidt 1997
  DIAG.silice = function (c, roche) {
    const TM = c.tmax || 120;
    const G = graphique({ x: { min: 0, max: TM }, y: { min: 0.1, max: 1000, type: "log" } });
    const pasT = TM > 200 ? 50 : 20;
    axes(G, { x: { ticks: pas(0, TM, pasT), titre: c.xlab || "Température de l'eau (°C) : elle s'élève lorsque la boue s'enfouit" },
      y: { ticks: [0.1, 1, 10, 100, 1000], titre: "Silice dissoute (mg par litre)" } });
    const Lo = serie((t) => [t, siliceOpale(t)], 0, TM), Lq = serie((t) => [t, siliceQuartz(t)], 0, TM);
    polygone(G, [...Lo, [TM, 1000], [0, 1000]], "fc2-sursat");
    polygone(G, [...Lq, [TM, 0.1], [0, 0.1]], "fc2-soussat");
    if (TM <= 150) { rectData(G, 35, 50, 0.1, 1000, "fc2-transition"); rectData(G, 46, 80, 0.1, 1000, "fc2-transition2"); }
    courbe(G, Lo, "fc2-courbe fc2-c-solidus");
    courbe(G, Lq, "fc2-courbe fc2-c-solidus");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.T, y: p.C }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "saturation de l'opale", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, Lo) });
    etiquette(G, { t: "saturation du quartz", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, Lq) });
    etiquettesChemin(G, ch);
    if (TM <= 150) {
      etiquetteZone(G, "opale-A → CT", [35, 50, 0.1, 1000], [42.5, 0.25], { c: "fc2-lab-courbe", gras: false, it: true, taille: 9.5, rot: -90, dans: polyPx(G, [[35, 0.1], [50, 0.1], [50, 1000], [35, 1000]]) });
      etiquetteZone(G, "opale-CT → quartz", [50, 80, 0.1, 1000], [65, 0.25], { c: "fc2-lab-courbe", gras: false, it: true, taille: 9.5 });
    }
    etiquetteZone(G, "l'opale précipite", [0, TM, 150, 1000], [TM * 0.2, 700]);
    etiquetteZone(G, "seul le quartz peut précipiter,\nmais très lentement", [0, TM, 5, 300], [TM * 0.72, 60], { dans: polyPx(G, [...Lq, ...Lo.slice().reverse()]) });
    etiquetteZone(G, "la silice se dissout", [0, TM, 0.1, 30], [TM * 0.75, 0.35], { dans: polyPx(G, [...Lq, [TM, 0.1], [0, 0.1]]) });
    return rendre(G, `Silice dissoute et saturation : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.5 calcite : calcium dissous et CO₂ ──
  // calcium à l'équilibre avec la calcite (mg/L) selon la pression partielle de CO₂ : calcul de l'atlas (Plummer et
  // Busenberg 1982, activités de Davies), valeurs reprises de formation.js
  const CA_CALCITE = { 10: [[-3.5, 24.9], [-3.4, 26.9], [-3, 37.0], [-2.5, 55.4], [-2, 83.5], [-1.5, 126.7], [-1, 193.3], [-0.5, 297.0], [0, 459.4]],
    25: [[-3.5, 19.4], [-3.4, 21.0], [-3, 28.8], [-2.5, 43.0], [-2, 64.7], [-1.5, 97.8], [-1, 148.8], [-0.5, 227.8], [0, 351.5]] };
  DIAG.calcite = function (c, roche) {
    const G = graphique({ x: { min: Math.pow(10, -3.5), max: 1, type: "log" }, y: { min: 0, max: 480, pad0: 4 } });
    axes(G, { x: { ticks: [0.001, 0.01, 0.1, 1], titre: "CO₂ au contact de l'eau (part de l'air : 0,01 = 1 %)", fmt: (v) => nb(v, v < 0.01 ? 3 : v < 0.1 ? 2 : v < 1 ? 1 : 0) },
      y: { ticks: pas(0, 400, 100), titre: "Calcium dissous (mg par litre)" },
      x2: { ticks: [["air", 0.0004], ["air du sol", 0.03]] } });
    const L10 = CA_CALCITE[10].map(([lp, ca]) => [Math.pow(10, lp), ca]), L25 = CA_CALCITE[25].map(([lp, ca]) => [Math.pow(10, lp), ca]);
    polygone(G, [...L10, [1, 480], [Math.pow(10, -3.5), 480]], "fc2-sursat");
    polygone(G, [...L25, [1, 0], [Math.pow(10, -3.5), 0]], "fc2-soussat");
    rectData(G, 0.01, 0.1, 0, 480, "fc2-zone1");
    courbe(G, [[0.0004, 0], [0.0004, 480]], "fc2-courbe fc2-c-limite");
    courbe(G, L10, "fc2-courbe fc2-c-solidus");
    courbe(G, L25, "fc2-courbe fc2-c-reaction");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.pco2, y: p.Ca }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "équilibre à 10 °C", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, L10) });
    etiquette(G, { t: "équilibre à 25 °C", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, L25) });
    etiquettesChemin(G, ch);
    etiquetteZone(G, "eau sursaturée :\nla calcite précipite", [Math.pow(10, -3.4), 0.3, 150, 470], [0.0015, 380]);
    etiquetteZone(G, "eau sous-saturée :\nle calcaire est dissous", [0.003, 1, 0, 150], [0.2, 40], { dans: polyPx(G, [...L25, [1, 0], [Math.pow(10, -3.5), 0]]) });
    return rendre(G, `Calcite, CO₂ et calcium dissous : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.6 apatite : phosphate dissous et pH ──
  // hydroxyapatite : Ca₅(PO₄)₃OH + 7 H⁺ = 5 Ca²⁺ + 3 H₂PO₄⁻ + H₂O, log K = 14,46 (Lindsay 1979) ; calcium fixé à 100 mg/L,
  // HPO₄²⁻ ajouté au-delà de pH 7,2 (pK₂ = 7,2), sans coefficients d'activité (calcul de l'atlas)
  const Papatite = (pH) => { const lh = (14.46 + 5 * 2.603 - 7 * pH) / 3; return Math.pow(10, lh) * (1 + Math.pow(10, pH - 7.2)) * 30974; };
  DIAG.apatite = function (c, roche) {
    const G = graphique({ x: { min: 4, max: 9 }, y: { min: 0.0001, max: 1000, type: "log" } });
    axes(G, { x: { ticks: [4, 5, 6, 7, 8, 9], titre: "pH de l'eau : acide ← → basique" },
      y: { ticks: [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000], titre: "Phosphate dissous (mg de phosphore par litre)", fmt: (v) => nb(v, v < 1 ? Math.round(-Math.log10(v)) : 0) } });
    const L = serie((ph) => [ph, Papatite(ph)], 4, 9, 50).filter(([, y]) => y <= 5000);
    polygone(G, [...L, [9, 1e4], [L[0][0], 1e4]], "fc2-sursat");
    polygone(G, [...L, [9, 1e-5], [4, 1e-5], [4, L[0][1]]], "fc2-soussat");
    courbe(G, L, "fc2-courbe fc2-c-solidus");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.pH, y: p.P }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "saturation de l'apatite", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, L) });
    etiquettesChemin(G, ch);
    etiquetteZone(G, "l'apatite précipite", [5.5, 9, 0.1, 1000], [7.8, 30]);
    etiquetteZone(G, "l'eau reste sous-saturée", [4, 7, 0.0001, 0.01], [4.9, 0.0005]);
    return rendre(G, `Phosphate dissous et apatite : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.7 carbonates marins : ion carbonate dissous et saturation de la calcite selon la profondeur ──
  // saturation : Ksp de la calcite (Mucci 1983, salinité 35) corrigé de la pression (Millero 1995), divisé par le calcium de
  // l'eau de mer (10,28 mmol/kg) ; température de 20 °C en surface à 2 °C en profondeur. Profil mesuré : ordre de grandeur de
  // l'Atlantique actuel (≈ 230 µmol/kg en surface, ≈ 110 en profondeur ; Broecker et Peng 1982).
  const tProfil = (z) => 2 + 18 * Math.exp(-z / 600);
  const co3Sat = (z) => {
    const T = tProfil(z) + 273.15, S = 35, t = T - 273.15;
    const lk = -171.9065 - 0.077993 * T + 2839.319 / T + 71.595 * Math.log10(T) + (-0.77712 + 0.0028426 * T + 178.34 / T) * Math.sqrt(S) - 0.07711 * S + 0.0041249 * Math.pow(S, 1.5);
    const P = z / 10, dV = -48.76 + 0.5304 * t, dK = (-11.76 + 0.3692 * t) * 1e-3, RT = 83.14 * T;
    const k = Math.pow(10, lk) * Math.exp(-dV * P / RT + 0.5 * dK * P * P / RT);
    return k / 0.01028 * 1e6;
  };
  const CO3_PROFIL = [[1, 230], [50, 230], [100, 225], [200, 195], [300, 170], [500, 145], [800, 128], [1000, 122], [1500, 118], [2000, 116], [3000, 113], [4000, 108], [5000, 102], [6000, 98]];
  const co3Mer = (z) => interpLog(CO3_PROFIL, Math.max(1, z));
  DIAG.mer = function (c, roche) {
    const G = graphique({ x: { min: 0, max: 300 }, y: { min: 1, max: 6000, type: "log", bas: true, pad0: 2 } });
    axes(G, { x: { ticks: pas(0, 300, 50), titre: "Ion carbonate dissous (micromoles par kg d'eau de mer)" },
      y: { ticks: [1, 10, 100, 1000, 6000], titre: "Profondeur d'eau (m, échelle logarithmique)", fmt: (v) => nb(v) } });
    const zs = serie((u) => Math.pow(10, u), 0, Math.log10(6000), 60);
    const Ls = zs.map((z) => [co3Sat(z), z]), Lm = zs.map((z) => [co3Mer(z), z]);
    // entre les deux courbes : sursaturé (en haut) ou sous-saturé (en bas)
    polygone(G, [...Lm, ...Ls.slice().reverse()], "fc2-sursat");
    rectData(G, 0, 300, 1, 200, "fc2-zone1");
    rectData(G, 0, 300, 4500, 5500, "fc2-ccd");
    courbe(G, Ls, "fc2-courbe fc2-c-seuil");
    courbe(G, Lm, "fc2-courbe fc2-c-eau");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.co3 != null ? p.co3 : co3Mer(p.z), y: p.z }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "saturation de la calcite", c: "fc2-lab-seuil", taille: 9.8, oblig: true, cands: leLong(G, Ls) });
    etiquette(G, { t: "teneur mesurée (Atlantique)", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, Lm) });
    etiquettesChemin(G, ch);
    etiquetteZone(G, "zone éclairée : le plancton\nsécrète la calcite", [150, 300, 1, 200], [240, 8]);
    etiquetteZone(G, "eau sursaturée :\nla calcite persiste", [45, 230, 250, 4000], [85, 900], { dans: [...Lm, ...Ls.slice().reverse()].map(([x, z]) => G.P(x, z)) });
    etiquetteZone(G, "profondeur de compensation (4,5 à 5,5 km)", [0, 300, 2500, 6000], [150, 3800], { taille: 9.8, c: "fc2-lab-courbe", gras: false, it: true });
    return rendre(G, `Carbonates marins : concentration de l'ion carbonate et saturation en calcite : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.8 fer : Eh–pH (domaines de POURBAIX.fer, partie Oxydes de l'atlas) ──
  DIAG.ehph = function (c, roche) {
    const sys = (typeof POURBAIX !== "undefined" ? POURBAIX : {})[c.systeme || "fer"];
    if (!sys) return "";
    const autre = (c.systeme || "fer") !== "fer";
    const G = graphique({ x: { min: 0, max: 14 }, y: { min: -1, max: 1.5 } });
    axes(G, { x: { ticks: pas(0, 14, 2), titre: "pH : acide ← → basique" }, y: { ticks: [-1, -0.5, 0, 0.5, 1, 1.5], titre: "Eh (V) : réducteur ↓, oxydant ↑", fmt: (v) => nb(v, 1) } });
    for (const d of sys.domaines) G.domaines.push(`<polygon points="${pts(G, d.points)}" style="fill:${d.couleur};opacity:.5" class="fc2-facies"/>`);
    for (const E0 of [1.229, 0]) courbe(G, [[0, E0], [14, E0 - 0.0592 * 14]], "fc2-courbe fc2-c-eau-lim");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.pH, y: p.Eh }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "au-dessus, l'eau se décompose en oxygène", c: "fc2-lab-courbe", it: true, taille: 9.5, cands: leLong(G, [[0, 1.229], [14, 1.229 - 0.0592 * 14]]) });
    etiquette(G, { t: "en hydrogène au-dessous", c: "fc2-lab-courbe", it: true, taille: 9.5, cands: leLong(G, [[0, 0], [14, -0.0592 * 14]]) });
    etiquettesChemin(G, ch);
    const NOMS = { fe2: "Fe²⁺ dissous", fe3: "Fe³⁺ dissous", fe0: "fer métal", feoh3: "oxydes de fer solides", feo4: "FeO₄²⁻ dissous" };
    for (const d of sys.domaines) {
      const nom = autre ? (d.court || d.nom) : NOMS[d.id]; if (!nom || !d.etiquette) continue;   // autre élément que le fer (F.4) : noms de POURBAIX
      const xs = d.points.map(([x]) => x), ys = d.points.map(([, y]) => y);
      etiquetteZone(G, nom, [Math.min(...xs), Math.max(...xs), Math.max(-1, Math.min(...ys)), Math.min(1.5, Math.max(...ys))], [d.etiquette[0], d.etiquette[1]],
        { dans: polyPx(G, d.points), taille: 9.8, oblig: false });
    }
    for (const [lab, ph, eh] of c.etiquettes || []) etiquetteZone(G, lab, [ph - 2.5, ph + 2.5, eh - 0.35, eh + 0.35], [ph, eh]);
    return rendre(G, `Diagramme Eh-pH ${autre ? (/^[aeiouéh]/i.test(sys.nom) ? "de l'" : "du ") + sys.nom.toLowerCase() : "du fer"} : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.9 enfouissement : profondeur au fil du temps, seuils de température ──
  // T = 10 °C en surface + 30 °C par km (gradient moyen) ; seuils : voir SEUILS_ENF
  const T_KM = (z) => 10 + 30 * z, Z_T = (T) => (T - 10) / 30;
  const SEUILS_ENF = {
    quartz: { de: 70, a: 80, nom: "le quartz cimente les grains (≈ 70 à 80 °C)", src: "walderhaug" },
    huile: { de: 100, a: 170, nom: "fenêtre à pétrole (≈ 100 à 170 °C)", src: "burnham" },
    lignite: { de: 0, a: 50, nom: "tourbe, puis lignite", src: "burnham" },
    subbitumineux: { de: 50, a: 100, nom: "charbon sub-bitumineux", src: "burnham" },
    houille: { de: 100, a: 200, nom: "houille (charbon bitumineux)", src: "burnham" },
    anthracite: { de: 200, a: 280, nom: "anthracite", src: "burnham" },
    anchizone: { de: 200, a: 300, nom: "très faible métamorphisme (≈ 200 à 300 °C)", src: "anchizone" },
    gypse: { de: 42, a: 58, nom: "gypse → anhydrite (≈ 42 à 58 °C)", src: "hardie" },
    opale: { de: 35, a: 56, nom: "opale → quartz (≈ 35 à 56 °C)", src: "odp" },
  };
  DIAG.enfouissement = function (c, roche) {
    const tmax = c.tmax, zmax = c.zmax || 6;
    const G = graphique({ x: { min: tmax, max: 0 }, y: { min: 0, max: zmax, bas: true, pad0: 11 } });
    const pasT = c.pasT || (tmax > 300 ? 100 : tmax > 150 ? 50 : tmax > 60 ? 20 : tmax > 25 ? 10 : tmax > 12 ? 5 : tmax > 4 ? 1 : 0.5);
    const pasZ = c.pasZ || (zmax > 6 ? 2 : zmax > 2.5 ? 1 : zmax > 1 ? 0.5 : 0.1);
    const yt = pas(0, zmax, pasZ);
    axes(G, { x: { ticks: pas(0, tmax, pasT), titre: "Temps (millions d'années avant aujourd'hui)", fmt: (v) => nb(v, v % 1 ? 1 : 0) },
      y: { ticks: yt, titre: "Profondeur d'enfouissement (km)", fmt: (v) => nb(v, pasZ < 1 && v % 1 ? (pasZ < 0.5 ? 1 : 1) : 0) },
      y2: { titre: "Température (°C)", ticks: yt.map((z) => [nb(T_KM(z)), z]) } });
    G.fond.push(`<line x1="${G.X0}" y1="${r1(G.sy(0))}" x2="${G.X1}" y2="${r1(G.sy(0))}" class="fc2-surface"/>`);
    const seuils = (c.seuils || []).map((n) => SEUILS_ENF[n]);
    seuils.forEach((z, i) => rectData(G, tmax, 0, Math.max(0, Z_T(z.de)), Math.min(zmax, Z_T(z.a)), i % 2 ? "fc2-seuil1" : "fc2-seuil0"));
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.age, y: p.z }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquettesChemin(G, ch);
    for (const z of seuils) {
      const z0 = Math.max(0, Z_T(z.de)), z1 = Math.min(zmax, Z_T(z.a));
      if (z0 >= zmax) continue;
      etiquetteZone(G, z.nom, [tmax, 0, z0, z1], [c.labDroite ? tmax * 0.15 : tmax * 0.85, (z0 + z1) / 2], { pas: 5 });
    }
    return rendre(G, `Histoire d'enfouissement : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.10 climat (échelle commune de l'atlas, H.5) ──
  const NORMALES = { Brest: [11.7, 1.67], Rennes: [12.0, 0.96], Paris: [12.7, 0.77], Strasbourg: [11.5, 0.86], Bordeaux: [13.7, 0.98],
    Lyon: [12.8, 0.86], Toulouse: [13.9, 0.64], Marseille: [15.9, 0.42], Montpellier: [15.1, 0.55], Perpignan: [15.7, 0.47],
    "Clermont-Ferrand": [11.4, 0.84], Chamonix: [5.2, 2.24], "Mont Aigoual": [7.7, 1.27], Nice: [15.8, 0.60] };
  DIAG.climat = function (c, roche) {
    const tmin = c.tmin != null ? c.tmin : -5, tmax = c.tmax || 30;
    const G = graphique({ x: { min: tmin, max: tmax }, y: { min: 0, max: 2.5 } });
    for (const [x1, x2, cls] of [[-60, 8, "fc2-froid"], [8, 15, "fc2-tempere"], [15, 22, "fc2-chaud"], [22, 60, "fc2-tropical"]]) rectData(G, Math.max(x1, tmin), Math.min(x2, tmax), 0, 2.5, cls);
    for (const v of [0.2, 0.5, 0.65, 1]) courbe(G, [[tmin, v], [tmax, v]], "fc2-courbe fc2-c-limite", false);
    axes(G, { x: { ticks: [tmin, 0, 8, 15, 22, tmax].filter((v, i, a) => a.indexOf(v) === i && v >= tmin && v <= tmax), titre: "Température moyenne annuelle (°C)" },
      y: { ticks: [0, 0.5, 1, 1.5, 2, 2.5], titre: "Pluie ÷ évapotranspiration potentielle", fmt: (v) => nb(v, 1) } });
    for (const [x1, x2, y1, y2] of c.domaines || []) rectData(G, x1, x2, y1, y2, "fc2-domaine");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.T == null ? null : clamp(p.T, tmin, tmax), y: p.ai }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    for (const v of c.villes || []) { const [T, ai] = NORMALES[v]; const [x, y] = G.P(T, ai); G.dessus.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="3" class="fc2-ville"/>`); G.obs.push(cerclePoly(x, y, 4)); }
    for (const v of c.villes || []) { const [T, ai] = NORMALES[v]; const [x, y] = G.P(T, ai); etiquette(G, { t: v, c: "fc2-lab-point", it: true, taille: 9.8, oblig: true, cands: autour(x, y, 6, 9.8) }); }
    etiquettesChemin(G, ch);
    for (const [lab, x, y] of c.etiquettes || []) etiquetteZone(G, lab, [x - 4, x + 4, Math.max(0, y - 0.25), Math.min(2.5, y + 0.25)], [x, y]);
    for (const [lab, x1, x2, y1, y2] of (c.domaines || []).map((d, i) => [(c.labDomaines || [])[i], ...d])) if (lab) etiquetteZone(G, lab, [x1, x2, y1, y2], [(x1 + x2) / 2, y2 - 0.12], { dans: polyPx(G, [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]) });
    for (const [lab, x] of [["froid", Math.max(tmin, -60) / 2 + 4], ["tempéré", 11.5], ["chaud", 18.5], ["tropical", Math.min(tmax, 40) / 2 + 11]]) if (x > tmin && x < tmax) etiquetteZone(G, lab, [x - 5, x + 5, 2.28, 2.45], [x, 2.38], { c: "fc2-lab-courbe", gras: false, it: true, taille: 9.8, oblig: false });
    for (const [lab, v] of [["semi-aride", 0.35], ["sec subhumide", 0.575], ["humide", 0.82]]) etiquetteZone(G, lab, [tmax - (tmax - tmin) * 0.3, tmax, v - 0.05, v + 0.05], [tmax - 3, v], { c: "fc2-lab-courbe", gras: false, it: true, taille: 9.5, oblig: false });
    return rendre(G, `Climat de formation : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.11 courant d'eau : diagramme de Hjulström (1935), recalculé ──
  // érosion : vitesse moyenne qui met un grain en mouvement dans 1 m d'eau, formule de Zhang Ruijin (1961), valable des
  // argiles cohésives aux galets : U = (h/d)^0,14 × [17,6 (ρs − ρ)/ρ d + 6,05 × 10⁻⁷ (10 + h)/d^0,72]^0,5 (unités SI) ;
  // dépôt : un grain en mouvement se dépose quand le courant tombe sous sa vitesse de chute (Ferguson et Church 2004).
  const vErosion = (dmm) => { const d = dmm / 1000, h = 1; return 100 * Math.pow(h / d, 0.14) * Math.sqrt(17.6 * 1.65 * d + 6.05e-7 * (10 + h) / Math.pow(d, 0.72)); };
  const vChute = (dmm) => { const d = dmm / 1000, R = 1.65, g = 9.81, nu = 1e-6; return 100 * R * g * d * d / (18 * nu + Math.sqrt(0.75 * R * g * d * d * d)); };
  const CLASSES = [[0.0005, 0.002, "argile"], [0.002, 0.063, "limon"], [0.063, 2, "sable"], [2, 64, "gravier"], [64, 256, "galets"], [256, 2000, "blocs"]];
  DIAG.courant = function (c, roche) {
    const G = graphique({ x: { min: 0.0005, max: 1000, type: "log" }, y: { min: 0.0001, max: 1000, type: "log" } });
    axes(G, { x: { ticks: [0.001, 0.01, 0.1, 1, 10, 100, 1000], titre: "Taille du grain (mm, échelle logarithmique)", fmt: (v) => nb(v, v < 1 ? Math.round(-Math.log10(v)) : 0) },
      y: { ticks: [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000], titre: "Vitesse du courant (cm par seconde)", fmt: (v) => nb(v, v < 1 ? Math.round(-Math.log10(v)) : 0) },
      x2: { ticks: CLASSES.map(([a, b, n]) => [n, Math.sqrt(a * Math.min(b, 1000))]).filter(([, v]) => v >= 0.0005 && v <= 1000) } });
    const ds = serie((u) => Math.pow(10, u), Math.log10(0.0005), 3, 80);
    const Le = ds.map((d) => [d, vErosion(d)]), Ld = ds.map((d) => [d, Math.min(vChute(d), vErosion(d) * 0.98)]);
    polygone(G, [...Le, [1000, 1e5], [0.0005, 1e5]], "fc2-erosion");
    polygone(G, [...Le, ...Ld.slice().reverse()], "fc2-transport");
    polygone(G, [...Ld, [1000, 1e-6], [0.0005, 1e-6]], "fc2-depot");
    for (const [a] of CLASSES.slice(1)) courbe(G, [[a, 0.0001], [a, 1000]], "fc2-courbe fc2-c-classe", false);
    courbe(G, Le, "fc2-courbe fc2-c-solidus");
    courbe(G, Ld, "fc2-courbe fc2-c-solidus");
    const autres = (c.autres || []).map((f) => Object.assign({}, f));
    fantomes(G, autres);
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.d, y: p.v }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquettesFantomes(G, autres);
    etiquette(G, { t: "le courant arrache le grain", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, Le.slice(10)) });
    etiquette(G, { t: "le grain tombe au fond", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, Ld.slice(20)) });
    etiquettesChemin(G, ch);
    etiquetteZone(G, "érosion", [0.001, 1000, 30, 1000], [0.01, 500]);
    etiquetteZone(G, "transport", [0.0005, 1000, 0.01, 100], [0.004, 3]);
    etiquetteZone(G, "dépôt", [0.0005, 1000, 0.0001, 10], [30, 0.1]);
    return rendre(G, `Courant, érosion, transport et dépôt : ${roche.nom}`) + legende(ch, roche);
  };

  // ── 5.2.12 vent : seuil de mise en mouvement (Shao et Lu 2000) et suspension (Bagnold 1941) ──
  // seuil : u*t = [0,0123 (ρs/ρa g d + γ/(ρa d))]^0,5, γ = 3 × 10⁻⁴ kg/s² ; suspension : u* > vitesse de chute dans l'air ;
  // vent à 10 m au-dessus d'un sol sableux nu (rugosité 0,1 mm) : U = u*/0,4 × ln(10/0,0001)
  const U10 = (us) => us / 0.4 * Math.log(10 / 1e-4) * 3.6; // km/h
  const usSeuil = (dmm) => { const d = dmm / 1000; return Math.sqrt(0.0123 * (2650 / 1.23 * 9.81 * d + 3e-4 / (1.23 * d))); };
  const wsAir = (dmm) => { const d = dmm / 1000, R = 2153, g = 9.81, nu = 1.5e-5; return R * g * d * d / (18 * nu + Math.sqrt(0.75 * R * g * d * d * d)); };
  DIAG.vent = function (c, roche) {
    const G = graphique({ x: { min: 0.002, max: 10, type: "log" }, y: { min: 2, max: 300, type: "log" } });
    axes(G, { x: { ticks: [0.01, 0.1, 1, 10], titre: "Taille du grain (mm, échelle logarithmique)", fmt: (v) => nb(v, v < 1 ? Math.round(-Math.log10(v)) : 0) },
      y: { ticks: [2, 5, 10, 20, 50, 100, 200], titre: "Vitesse du vent à 10 m (km/h)" },
      x2: { ticks: [["limon", 0.011], ["sable", 0.35], ["gravier", 5]] } });
    const ds = serie((u) => Math.pow(10, u), Math.log10(0.002), 1, 80);
    const S = ds.map((d) => U10(usSeuil(d))), W = ds.map((d) => U10(wsAir(d)));
    const Ls = ds.map((d, i) => [d, S[i]]), Lw = ds.map((d, i) => [d, W[i]]);
    const haut = ds.map((d, i) => [d, Math.max(S[i], W[i])]), bas = ds.map((d, i) => [d, Math.min(S[i], W[i])]);
    polygone(G, [...haut, [10, 1e4], [0.002, 1e4]], "fc2-erosion");      // suspension
    polygone(G, [...bas, [10, 0.1], [0.002, 0.1]], "fc2-depot");         // au repos, ou retombe
    // entre les deux courbes : bonds (le seuil est sous la chute) ou maintien en l'air (la chute est sous le seuil)
    polygone(G, [...haut, ...bas.slice().reverse()], "fc2-transport");
    for (const a of [0.063, 2]) courbe(G, [[a, 2], [a, 300]], "fc2-courbe fc2-c-classe", false);
    courbe(G, Ls, "fc2-courbe fc2-c-solidus");
    const Lwv = Lw.filter(([, v]) => v >= 1.5 && v <= 400);
    courbe(G, Lwv, "fc2-courbe fc2-c-reaction");
    const ch = c.chemin.map((p) => Object.assign({}, p, { x: p.d, y: p.v }));
    chemin(G, ch);
    etiquettesPoints(G, ch);
    etiquette(G, { t: "le vent entraîne le grain", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, Ls) });
    etiquette(G, { t: "vitesse de chute du grain", c: "fc2-lab-courbe", it: true, taille: 9.8, oblig: true, cands: leLong(G, Lwv) });
    etiquettesChemin(G, ch);
    // croisement des deux courbes (≈ 0,07 mm) : à gauche, les grains soulevés restent en l'air ; à droite, ils font des bonds
    let ix = 0; while (ix < ds.length - 1 && !(W[ix] < S[ix] && W[ix + 1] >= S[ix + 1])) ix++;
    const dx = ds[ix];
    etiquetteZone(G, "suspension :\nles poussières voyagent loin", [0.002, 10, 60, 300], [0.012, 170]);
    etiquetteZone(G, "une fois soulevé,\nle grain demeure en suspension", [0.002, dx, 3, 60], [0.008, 14], { dans: polyPx(G, [...haut.slice(0, ix + 1), ...bas.slice(0, ix + 1).reverse()]) });
    etiquetteZone(G, "bonds", [dx, 10, 20, 300], [0.6, 60], { dans: polyPx(G, [...haut.slice(ix), ...bas.slice(ix).reverse()]) });
    etiquetteZone(G, "au repos,\nou il retombe", [0.002, 10, 2, 20], [0.8, 5]);
    return rendre(G, `Vent : mise en mouvement et mise en suspension : ${roche.nom}`) + legende(ch, roche);
  };

  // ─────────────────────────────── 6. données des roches ───────────────────────────────
  // pt(T, P, n, t, o) : point d'un chemin P–T ; n = numéro de l'étape (état atteint À LA FIN de l'étape), t = texte de la
  // liste ; o : { bande: "cristallisation" (segment qui arrive à ce point surligné), lab: "étiquette du point" }
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const COND = {};
  const M = (echelle, chemin, o) => Object.assign({ type: "magma", echelle, chemin }, o || {});
  // départ commun des basaltes du Massif central : manteau solide qui remonte, franchit son solidus vers 100 km
  const MANTEAU_MC = () => pt(1500, 3.6, 0, "", { lab: "manteau solide" });

  // ═════ M.1 plutoniques ═════
  COND.granite = M("croute", [
    pt(650, 0.85, 0, "", { lab: "croûte épaissie" }),
    pt(850, 0.85, 1, "Épaissie par la collision varisque, la croûte s'échauffe et fond partiellement entre 750 et 850 °C, à 25 à 35 km : le liquide se sépare des minéraux demeurés solides."),
    pt(845, 0.2, 2, "Plus léger que les roches encaissantes (≈ 2,4 contre 2,7 tonnes par m³), le liquide se regroupe en veines, puis remonte par des dykes de quelques mètres d'épaisseur qu'il ouvre lui-même ; le massif se constitue en 1 000 à 100 000 ans."),
    pt(845, 0.2, 3, "Entre 5 et 10 km (≈ 0,2 GPa), il se répand en lames successives ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(680, 0.2, 4, "La cristallisation débute vers ≈ 850 °C et se poursuit jusqu'au solidus (≈ 680 °C) : plagioclase et biotite se forment d'abord, puis feldspath potassique et quartz ; en 100 000 ans à 1 million d'années, le massif se refroidit.", { bande: "cristallisation" }),
    pt(220, 0.2),
    pt(15, 0, 5, "Après l'enlèvement des 5 à 10 km de roches qui le recouvrent, le granite affleure : il se débite en boules et son arène s'accumule (granites cristallisés entre 360 et 290 Ma)."),
  ], { src: ["tuttle", "diffusion", "maaloe"] });
  COND.granodiorite = M("croute", [
    pt(750, 0.95, 0, "", { lab: "bas de la croûte" }),
    pt(900, 0.95, 1, "À 30 à 35 km, la base de la croûte se met à fondre vers 850 à 950 °C ; des magmas basiques issus du manteau apportent leur chaleur et leur matière et se mélangent au liquide."),
    pt(890, 0.3, 2, "Moins dense que l'encaissant, le magma se regroupe et remonte en 1 000 à 100 000 ans."),
    pt(890, 0.3, 3, "La mise en place s'effectue vers 7 à 12 km ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(700, 0.3, 4, "La cristallisation s'étend de ≈ 900 à ≈ 700 °C : plagioclase et amphibole apparaissent d'abord, quartz et feldspath potassique en fin de parcours ; en 100 000 ans à 1 million d'années, le massif se refroidit.", { bande: "cristallisation" }),
    pt(250, 0.3),
    pt(15, 0, 5, "L'érosion exhume le massif, mis en place entre 345 et 295 Ma (Margeride, Corse, Mont-Blanc)."),
  ], { src: ["tuttle", "diffusion"] });
  COND.tonalite = M("croute", [
    pt(820, 1.0, 0, "", { lab: "amphibolites" }),
    pt(950, 1.0, 1, "Vers 35 km, les roches basiques de la base de la croûte (amphibolites) entrent partiellement en fusion entre 900 et 1 000 °C : le liquide formé est riche en sodium et pauvre en potassium."),
    pt(940, 0.33, 2, "Moins dense que l'encaissant, le magma se regroupe et remonte en 1 000 à 100 000 ans."),
    pt(940, 0.33, 3, "Une mise en place vers 8 à 15 km ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(720, 0.33, 4, "La cristallisation se fait entre ≈ 950 et ≈ 720 °C et privilégie plagioclase, amphibole et biotite, le feldspath potassique étant presque absent.", { bande: "cristallisation" }),
    pt(260, 0.33),
    pt(15, 0, 5, "Exhumées par l'érosion, les tonalites varisques des Maures et de Corse (345 à 300 Ma) affleurent."),
  ], { src: ["tuttle", "diffusion"] });
  COND.charnockite = M("croute", [
    pt(850, 1.05, 0, "", { lab: "croûte profonde, sèche" }),
    pt(990, 1.05, 1, "Dans une croûte très chaude et pauvre en eau (≈ 38 km), la base fond vers 950 à 1 000 °C : privée d'eau, la roche exige une température nettement supérieure à celle d'un granite ordinaire."),
    pt(980, 0.65, 2, "Peu ascendant, le magma s'immobilise dans la croûte profonde, vers 20 à 25 km."),
    pt(800, 0.65, 3, "À sec, il cristallise entre ≈ 980 et ≈ 800 °C : l'orthopyroxène se substitue à la biotite et à l'amphibole.", { bande: "cristallisation" }),
    pt(450, 0.55),
    pt(15, 0, 4, "Seule une érosion prolongée, emportant 20 km de roches, le mène à l'affleurement : rares en France, les charnockites couvrent de vastes régions de l'Inde du Sud (≈ 2,5 milliards d'années)."),
  ], { src: ["tuttle"] });
  // basiques et intermédiaires nés du manteau : fusion vers 50–70 km, réservoir au bas de la croûte, puis mise en place
  const debutDiorite = (t1) => [pt(1450, 2.9, 0, "", { lab: "manteau solide" }), pt(1410, 2.0, 1, t1)];
  COND.diorite = M("manteau", [
    ...debutDiorite("Dans le manteau, vers 50 à 70 km de profondeur, un magma basique prend naissance."),
    pt(1200, 0.9),
    pt(1050, 0.9, 2, "À la base de la croûte (≈ 30 km), il se défait de ses premiers cristaux (olivine, pyroxène) et fond une partie de la croûte, devenant ainsi intermédiaire.", { bande: "premiers cristaux" }),
    pt(1050, 0.25, 3, "Une mise en place vers 5 à 10 km ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(850, 0.25, 4, "Entre ≈ 1 050 et ≈ 850 °C, il cristallise plagioclase et amphibole ; en 100 000 ans à 1 million d'années, le massif se refroidit.", { bande: "cristallisation" }),
    pt(240, 0.25),
    pt(15, 0, 5, "Chez la corsite, des orbicules de plagioclase et d'amphibole apparaissent dans les diorites varisques (345 à 300 Ma), que l'érosion a exhumées."),
  ], { src: ["hirschmann", "diffusion"] });
  COND.monzodiorite = M("manteau", [
    ...debutDiorite("Un manteau enrichi en potassium entre partiellement en fusion, vers 50 à 70 km."),
    pt(1200, 0.9),
    pt(1050, 0.9, 2, "À la base de la croûte, le magma perd ses premiers cristaux et s'enrichit en potassium.", { bande: "premiers cristaux" }),
    pt(1050, 0.25, 3, "Une mise en place vers 5 à 10 km ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(850, 0.25, 4, "Plagioclase, feldspath potassique et amphibole se forment entre ≈ 1 050 et ≈ 850 °C.", { bande: "cristallisation" }),
    pt(240, 0.25),
    pt(15, 0, 5, "Exhumées par l'érosion, les monzodiorites du batholite corse (345 à 290 Ma) affleurent aujourd'hui."),
  ], { src: ["hirschmann", "diffusion"] });
  COND.monzonite = M("manteau", [
    pt(1500, 3.6, 0, "", { lab: "manteau solide" }),
    pt(1410, 2.0, 1, "Vers 50 à 70 km, à la fin de la chaîne varisque, du manteau enrichi en potassium se met partiellement à fondre."),
    pt(1200, 0.8),
    pt(1000, 0.8, 2, "Dans un réservoir profond (≈ 30 km), le magma voit ses premiers cristaux se séparer de lui tandis que sa teneur en potassium grimpe.", { bande: "premiers cristaux" }),
    pt(1000, 0.2, 3, "Une mise en place vers 3 à 8 km ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(800, 0.2, 4, "Feldspath potassique et plagioclase cristallisent en proportions comparables, entre ≈ 1 000 et ≈ 800 °C.", { bande: "cristallisation" }),
    pt(200, 0.2),
    pt(15, 0, 5, "L'érosion a mis au jour les monzonites permiennes de l'Estérel et de Corse (300 à 270 Ma)."),
  ], { src: ["hirschmann", "diffusion"] });
  COND.syenite = M("manteau", [
    pt(1515, 3.5, 0, "", { lab: "manteau solide" }),
    pt(1490, 2.6, 1, "Vers 80 km, seules quelques pour cent du manteau entrent en fusion : le liquide s'enrichit en sodium et en potassium."),
    pt(1200, 0.8),
    pt(900, 0.8, 2, "Dans un réservoir profond, le magma se débarrasse d'olivine, de pyroxène et de plagioclase, ce qui accroît encore sa teneur en alcalins.", { bande: "premiers cristaux" }),
    pt(900, 0.2, 3, "Une mise en place vers 3 à 8 km ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(750, 0.2, 4, "Sa cristallisation s'effectue entre ≈ 900 et ≈ 750 °C et produit surtout du feldspath potassique, avec très peu de quartz.", { bande: "cristallisation" }),
    pt(200, 0.2),
    pt(15, 0, 5, "L'érosion a mis au jour les syénites varisques des Vosges (Champ du Feu) et de Corse (345 à 290 Ma)."),
  ], { src: ["hirschmann", "diffusion"] });
  COND.syenite_nephelinique = M("manteau", [
    pt(1525, 3.6, 0, "", { lab: "manteau solide" }),
    pt(1510, 3.0, 1, "À environ 100 km de profondeur, le manteau fond très peu : le liquide, appauvri en silice, se trouve enrichi en sodium."),
    pt(1200, 0.8),
    pt(900, 0.8, 2, "Au cours de son évolution dans un réservoir, le liquide accroît sa teneur en alcalins, mais il ne dispose jamais d'assez de silice pour former du quartz.", { bande: "premiers cristaux" }),
    pt(900, 0.15, 3, "Une mise en place vers 2 à 6 km ; sa chaleur modifie les roches encaissantes (auréole de contact)."),
    pt(750, 0.15, 4, "Faute de silice, le quartz ne peut pas se former : c'est la néphéline qui cristallise à sa place.", { bande: "cristallisation" }),
    pt(180, 0.15),
    pt(15, 0, 5, "Les complexes alcalins sont rares et presque absents de France ; les Khibiny (presqu'île de Kola) remontent à environ 380 Ma."),
  ], { src: ["hirschmann"] });
  COND.foidolite = M("manteau", [
    pt(1420, 3.6, 0, "", { lab: "manteau riche en CO₂" }),
    pt(1510, 3.2, 1, "Un manteau riche en CO₂ et en alcalins, situé vers 100 km, fond à peine ; le CO₂ fait baisser le point de fusion en dessous du solidus du manteau sec."),
    pt(1250, 0.8),
    pt(1050, 0.8, 2, "Très pauvre en silice, le magma change peu dans un réservoir profond.", { bande: "premiers cristaux" }),
    pt(1040, 0.15, 3, "Il se met en place vers 2 à 6 km, souvent avec des carbonatites."),
    pt(900, 0.15, 4, "La néphéline cristallise à la place des feldspaths, entre ≈ 1 050 et ≈ 900 °C.", { bande: "cristallisation" }),
    pt(180, 0.15),
    pt(15, 0, 5, "Iivaara (Finlande), dans la province alcaline de Kola (≈ 370 Ma), sert de localité type à cette roche, absente de France."),
  ], { src: ["hirschmann", "dasgupta"] });
  // ophiolite du Chenaillet : dorsale lente, chambre à 4–5 km sous un fond lui-même sous 3,5 km d'eau (≈ 0,16 GPa)
  const debutDorsale = (t1) => [pt(1350, 2.2, 0, "", { lab: "manteau solide" }), pt(1290, 0.6, 1, t1)];
  const finOphiolite = (t4, t5) => [pt(400, 0.08), pt(5, 0.035, 4, t4), pt(15, 0, 5, t5)];
  // gabbro (B.8, 27/10/2026) : une lentille de 50 à 200 m qui cristallise en quelques siècles puis refroidit vite (Nicollet et al. 2022)
  COND.gabbro = M("manteau", [
    ...debutDorsale("Entre 60 et 20 km de profondeur, sous la dorsale de l'océan alpin, le manteau s'élève et fond en partie."),
    pt(1230, 0.16, 2, "Le liquide s'accumule en une lentille de 50 à 200 m d'épaisseur, 4 à 5 km sous le fond de l'océan (lui-même sous ≈ 3,5 km d'eau)."),
    pt(1000, 0.16, 0, "", { bande: "cristallisation" }),
    pt(500, 0.16, 3, "Elle cristallise entre ≈ 1 200 et ≈ 1 000 °C en quelques centaines d'années (vers 161 Ma), puis l'eau de mer infiltrée la refroidit vers 500 °C en quelques milliers d'années."),
    pt(5, 0.035, 4, "En ≈ 1 million d'années, la faille de détachement l'amène au fond de l'océan, à ≈ 2 °C sous 3,5 km d'eau ; des brèches puis des laves en coussins la recouvrent."),
    pt(15, 0, 5, "Lors de la fermeture de l'océan (vers 50 Ma), une écaille de ce fond est charriée sans s'enfoncer : on foule aujourd'hui, au Chenaillet, un fond d'océan jurassique."),
  ], { src: ["hirschmann", "nicollet2022", "li2013", "masini2008", "manatschal"] });
  COND.trondhjemite = M("manteau", [
    ...debutDorsale("Le manteau ascendant, sous la dorsale de l'océan alpin, fond partiellement entre 60 et 20 km de profondeur."),
    pt(1200, 0.16, 2, "Le liquide circule par des chenaux et emplit une chambre située 4 à 5 km sous le plancher océanique, lequel se trouve sous ≈ 3,5 km d'eau."),
    pt(920, 0.16, 3, "Dans la chambre, le gabbro cristallise entre ≈ 1 200 et ≈ 1 000 °C ; à la fin, les liquides, chargés de silice et de sodium, forment vers 900 °C des filons clairs de trondhjémite (vers 160 Ma).", { bande: "cristallisation" }),
    ...finOphiolite("En ≈ 1 million d'années, la faille de détachement fait regagner au fond de l'océan le gabbro et sa trondhjémite.",
      "Le Chenaillet, situé aujourd'hui à 2 650 m, est une écaille de fond océanique charriée sans plonger, vers 50 Ma, lors de la fermeture de l'océan."),
  ], { src: ["hirschmann", "manatschal"] });
  // pyroxénite (27/10/2026, B.8) : lits de l'Ariège, cristallisés sur les parois d'un conduit vers 45 km (Bodinier et al. 1987),
  // puis la même remontée crétacée que la lherzolite de Lers (points 3 et 4 = ceux de la péridotite)
  COND.pyroxenite = M("manteau", [
    pt(1380, 1.9, 0, "", { lab: "magma venu de plus bas" }),
    pt(1300, 1.4),
    pt(1250, 1.4, 1, "Vers 45 km, un magma à ≈ 1 300 °C monte dans une fissure du manteau ; ses pyroxènes cristallisent sur les parois et la colmatent.", { bande: "cristallisation" }),
    pt(950, 1.4, 2, "D'autres fissures se colmatent et le liquide imprègne la roche autour (la harzburgite devient lherzolite) ; en se déformant, le manteau fait tourner ces bandes et les couche toutes dans un même plan : des lits parallèles. Il refroidit ensuite vers 950 °C."),
    pt(700, 0.6),
    pt(150, 0.02, 3, "Au Crétacé, l'Ibérie s'écarte de l'Europe : la croûte s'amincit et le manteau remonte jusqu'au fond d'un bassin marin (108 à 103 Ma)."),
    pt(15, 0, 4, "Quand l'Ibérie revient vers l'Europe, le manteau est coincé dans la chaîne pyrénéenne, où des plis à plan presque vertical le basculent ; l'érosion dégage ses lits à l'étang de Lers."),
  ], { src: ["hirschmann", "lagabrielle", "bodinier1987", "leroux2008", "avelallemant1969", "lacroix1901"] });
  COND.hornblendite = M("manteau", [
    pt(1250, 2.0, 1, "Vers 60 km, l'eau abaisse le point de fusion du manteau : à ≈ 1 250 °C se forme un magma basique riche en eau, là où le manteau sec resterait solide."),
    pt(1120, 0.7, 2, "Vers 25 km, il s'élève dans une chambre logée au cœur de la croûte."),
    pt(980, 0.7, 3, "En dessous d'environ 1 000 °C, l'amphibole remplace le pyroxène dans la cristallisation et s'accumule ; la présence d'eau rend ce processus possible.", { bande: "cumulats d'amphibole" }),
    pt(500, 0.7),
    pt(15, 0, 4, "Roche rare, mise au jour par l'érosion du socle varisque (345 à 290 Ma)."),
  ], { courbes: ["peridotite", "peridotiteEau"], src: ["hirschmann", "grove2006"] });
  COND.essexite = M("manteau", [
    pt(1525, 3.6, 0, "", { lab: "manteau solide" }),
    pt(1500, 2.7, 1, "Une faible fusion du manteau, vers 70 à 100 km, sous le Massif central, produit un magma basique pauvre en silice."),
    pt(1200, 0.3, 2, "Le magma s'élève et nourrit le stratovolcan du Cantal."),
    pt(1150, 0.05, 3, "Une fraction se solidifie sous l'édifice, entre 1 et 3 km de profondeur (vers 8 Ma)."),
    pt(950, 0.05, 4, "Entre ≈ 1 150 et ≈ 950 °C, néphéline, augite et plagioclase cristallisent en quelques milliers d'années ; malgré sa faible profondeur, la roche se présente à grain régulier.", { bande: "cristallisation" }),
    pt(100, 0.05),
    pt(15, 0, 5, "En quelques millions d'années, l'érosion du volcan expose ces intrusions."),
  ], { src: ["hirschmann"] });
  COND.peridotite = M("manteau", [
    pt(950, 1.4, 1, "Partie du manteau solide, sous le continent, la péridotite se trouve vers 45 km : à ≈ 950 °C, elle demeure sous son solidus et ne fond pas."),
    pt(700, 0.6, 2, "Au Crétacé, l'Ibérie se détache de l'Europe ; la croûte s'amincit et le manteau, en remontant, se refroidit."),
    pt(80, 0.02, 3, "Vers 108 à 103 Ma, des lambeaux de manteau sont exposés au fond de bassins marins, où l'érosion les réduit en brèches."),
    pt(15, 0, 4, "L'érosion fait apparaître la lherzolite de l'étang de Lers, coincée dans la chaîne pyrénéenne, quand l'Ibérie revient vers l'Europe."),
  ], { etiquettes: [["le manteau solide reste sous son solidus", 650, 2.6]], src: ["hirschmann", "lagabrielle"] });

  // ═════ M.2 volcaniques ═════
  COND.basalte = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Le manteau ascendant passe son solidus vers 100 km, puis fond de quelques pour cent jusque vers 70 km ; le liquide basaltique se détache alors des grains."),
    pt(1200, 0, 2, "Le magma ouvre une fracture et atteint la surface en quelques jours à quelques semaines, à une température proche de 1 200 °C."),
    pt(1100, 0, 3, "Une fontaine de lave s'élève puis s'étale en coulée, entre 1 100 et 1 200 °C (chaîne des Puys, il y a ≈ 8 400 ans)."),
    pt(1000, 0, 0, "", { bande: "cristallisation" }),
    pt(15, 0, 4, "La coulée se solidifie : la croûte prend en quelques heures, le cœur en quelques années ; le verre renferme des microlites de plagioclase, et le refroidissement engendre des prismes de retrait."),
  ], { src: ["hirschmann", "eruption", "diffusion"] });
  COND.trachybasalte = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Le manteau ascendant fond partiellement, entre 100 et 70 km."),
    pt(1200, 0.6),
    pt(1130, 0.6, 2, "Retenu dans la croûte (≈ 20 km), le basalte se défait d'un peu d'olivine et de pyroxène et s'enrichit légèrement en silice et en alcalins.", { bande: "premiers cristaux" }),
    pt(1100, 0, 3, "La plupart des coulées de la chaîne des Puys (entre ≈ 15 000 et ≈ 8 500 ans), de l'Aubrac et du Cantal résultent de fontaines de lave, puis d'un cône de scories, puis d'une coulée."),
    pt(1000, 0, 0, "", { bande: "cristallisation" }),
    pt(15, 0, 4, "Une coulée se fige en quelques heures en surface, en quelques années à cœur : il en résulte microlites, verre et prismes."),
  ], { src: ["hirschmann", "eruption"] });
  COND.basanite = M("manteau", [
    pt(1525, 3.6, 0, "", { lab: "manteau solide" }),
    pt(1500, 2.9, 1, "Entre 80 et 100 km, le manteau ne fond qu'à hauteur de quelques pour cent : le liquide est pauvre en silice."),
    pt(1200, 0, 2, "Le magma remonte rapidement, sans marquer d'arrêt : il n'a presque pas le temps d'évoluer."),
    pt(1120, 0, 3, "Le plateau du Devès est couvert de coulées (entre 3,5 et 0,6 Ma, surtout vers 2 et 1 Ma)."),
    pt(1000, 0, 0, "", { bande: "cristallisation" }),
    pt(15, 0, 4, "En se figeant, la coulée associe olivine et néphéline dans une pâte vitreuse, avant de former des prismes."),
  ], { src: ["hirschmann", "eruption"] });
  COND.picrite = M("manteau", [
    pt(1590, 3.4, 0, "", { lab: "panache chaud" }),
    pt(1520, 2.6, 1, "Sous La Réunion, dès plus de 120 km, un panache de manteau surchauffé fond davantage : le liquide est riche en magnésium."),
    pt(1230, 0, 2, "Le magma remonte ; en chemin, il s'enrichit en cristaux d'olivine accumulés dans le réservoir, sous le volcan."),
    pt(1160, 0, 3, "En avril 2007, des fontaines et des coulées contenant plus de 20 % de cristaux d'olivine ont atteint la mer."),
    pt(1000, 0, 0, "", { bande: "cristallisation" }),
    pt(15, 0, 4, "Solidifiée avec plus de 15 à 20 % d'olivine, la roche relève, au sens large, de la picrite (« océanites » du Piton de la Fournaise)."),
  ], { src: ["hirschmann", "eruption"] });
  COND.andesite = M("manteau", [
    pt(1300, 3.0, 1, "La plaque atlantique plonge sous les Antilles ; vers 100 km, l'eau qu'elle libère fait fondre le manteau au-dessus d'elle : à ≈ 1 300 °C, sec il resterait solide (≈ 1 450 °C), hydraté il fond (dès 800–860 °C, Grove et al. 2006)."),
    pt(1150, 0.2),
    pt(890, 0.2, 2, "Stocké à 7–8 km (200 MPa) sous la montagne Pelée, le magma perd ses cristaux et fond un peu de croûte : il devient andésite, à 875–900 °C avec 5 à 6 % d'eau (Pichavant et al. 2002).", { bande: "premiers cristaux" }),
    pt(880, 0, 3, "Un dôme surmonté d'une aiguille croît dans le cratère après que la nuée ardente du 8 mai 1902 a anéanti Saint-Pierre (≈ 28 000 morts)."),
    pt(750, 0, 0, "", { bande: "figement" }),
    pt(15, 0, 4, "Une pâte de microlites renferme de grands plagioclases zonés et des pyroxènes ; quelques années suffisent en surface, et des siècles au cœur du dôme, pour figer ce tableau."),
  ], { courbes: ["peridotite", "peridotiteEau"], src: ["hirschmann", "grove2006", "pichavant2002"] });
  COND.dacite = M("manteau", [
    pt(1300, 3.0, 1, "La plaque Juan de Fuca plonge sous les Cascades ; vers 100 km, l'eau qu'elle libère fait fondre le manteau au-dessus d'elle : à ≈ 1 300 °C, sec il resterait solide (≈ 1 450 °C), hydraté il fond (Grove et al. 2006). Il se forme un basalte."),
    pt(1150, 0.25),
    pt(900, 0.22, 2, "Stocké vers 7 km (220 MPa) sous le mont Saint Helens, à 870 à 930 °C, le magma abandonne ses premiers cristaux, fond un peu de croûte et se transforme en dacite (Rutherford et al. 1985).", { bande: "premiers cristaux" }),
    pt(880, 0, 3, "Après l'éruption du 18 mai 1980, un dôme de lave très visqueuse grandit dans le cratère du mont Saint Helens jusqu'en 1986."),
    pt(750, 0, 0, "", { bande: "figement" }),
    pt(15, 0, 4, "Elle se solidifie en une pâte vitreuse à microlites, renfermant des plagioclases zonés et des amphiboles."),
  ], { courbes: ["peridotite", "peridotiteEau"], src: ["hirschmann", "grove2006", "rutherford1985"] });
  COND.trachyte = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Sous la chaîne des Puys, le manteau fond partiellement : il se forme un basalte alcalin."),
    pt(1150, 0.33),
    pt(800, 0.33, 2, "Stocké à 10–12 km (300–350 MPa), le basalte perd olivine, pyroxène et plagioclase : le liquide restant devient trachyte, vers 700–825 °C, avec jusqu'à 8 % d'eau (Martel et al. 2013).", { bande: "premiers cristaux" }),
    pt(790, 0, 3, "Trop visqueux pour couler, il s'empile en dôme : le puy de Dôme, il y a ≈ 11 000 ans ; sa dernière éruption, explosive, date d'≈ 10 700 ans (Miallier et al. 2010)."),
    pt(700, 0, 0, "", { bande: "figement" }),
    pt(15, 0, 4, "Le dôme se refroidit en quelques années en surface, en quelques milliers d'années à cœur ; l'écoulement aligne les baguettes de feldspath : c'est la texture « trachytique »."),
  ], { src: ["hirschmann", "martel2013", "miallier2010", "diffusion"] });
  COND.trachyandesite = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Sous le Massif central, le manteau fond partiellement : il se forme un basalte alcalin."),
    pt(1150, 0.25),
    pt(1000, 0.25, 2, "Un basalte qui se différencie dans un réservoir de la croûte perd olivine, pyroxène et plagioclase ; le liquide résiduel devient une trachyandésite.", { bande: "premiers cristaux" }),
    pt(1000, 0, 3, "Entre 8,5 et 7 Ma, coulées, brèches et cendres bâtissent un volcan de plus de 3 000 m ; avec ses coulées et ses brèches, il couvre ≈ 70 km de diamètre (2 500 km²) (Nehlig et al. 2001)."),
    pt(850, 0, 0, "", { bande: "figement" }),
    pt(15, 0, 4, "Chaque coulée se solidifie en quelques jours à quelques années ; elle renferme de grands cristaux de plagioclase dans une pâte de microlites."),
    pt(15, 0, 5, "Trop haut et trop escarpé, l'édifice perd un flanc : l'avalanche de débris, constituée de roches froides, se répand sur des dizaines de kilomètres."),
    pt(15, 0, 6, "Des rivières, puis des glaciers, découpent le volcan en étoile et ne laissent subsister que les crêtes du puy Mary et du plomb du Cantal ; le Mont-Dore (de 3 à 0,25 Ma), plus jeune, a connu la même évolution."),
  ], { src: ["hirschmann", "nehlig2001"] });
  COND.latite = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Pendant la chaîne varisque, vers 335 Ma, un manteau enrichi en potassium entre partiellement en fusion sous les Vosges."),
    pt(1150, 0.25),
    pt(1000, 0.25, 2, "Dans la croûte, le magma se défait de ses premiers cristaux et gagne en potassium.", { bande: "premiers cristaux" }),
    pt(1000, 0, 3, "Dans le bassin viséen des Vosges du Sud (≈ 335 Ma), la lave se répand en coulées."),
    pt(850, 0, 0, "", { bande: "figement" }),
    pt(15, 0, 4, "La coulée se fige : plagioclase et feldspath potassique en proportions voisines, dans une pâte fine."),
    pt(15, 0, 5, "Plus résistante que les tufs et les grauwackes environnants, la coulée demeure en relief lorsque l'érosion dégage ces derniers."),
  ], { src: ["hirschmann"] });
  COND.phonolite = M("manteau", [
    pt(1525, 3.6, 0, "", { lab: "manteau solide" }),
    pt(1500, 2.9, 1, "À 80 à 100 km de profondeur, le manteau fond à peine ; il en résulte un basalte pauvre en silice."),
    pt(1150, 0.6),
    pt(900, 0.6, 2, "Au cours de son évolution dans un réservoir, le liquide s'enrichit en alcalins sans pouvoir former de quartz : c'est la néphéline qui apparaît.", { bande: "premiers cristaux" }),
    pt(900, 0, 3, "Très visqueuse, la lave se met en place sous forme de dôme et d'aiguille : Gerbier-de-Jonc et sucs du Meygal (de 13 à 2 Ma)."),
    pt(750, 0, 0, "", { bande: "figement" }),
    pt(15, 0, 4, "Cette roche se débite en dalles minces qui « sonnent » sous le marteau, d'où son nom."),
    pt(15, 0, 5, "Plus résistants que les scories et les roches voisines, ces sucs restent en relief lorsque celles-ci s'érodent : ce sont ceux du Velay et du Mézenc."),
  ], { src: ["hirschmann"] });
  COND.rhyolite = M("croute", [
    pt(700, 0.8, 0, "", { lab: "croûte" }),
    pt(880, 0.8, 1, "À la fin de la chaîne varisque, vers 30 km de profondeur, la croûte entre partiellement en fusion, entre 800 et 900 °C."),
    pt(860, 0.2, 2, "Riche en silice et en gaz, le magma s'accumule entre 5 et 8 km de profondeur."),
    pt(820, 0, 3, "Émis entre 800 et 850 °C, il est trop visqueux pour s'écouler loin : il forme des dômes ou se fragmente en ignimbrites (Estérel, de 295 à 250 Ma)."),
    pt(700, 0, 0, "", { bande: "figement" }),
    pt(15, 0, 4, "Solidifiée en quelques jours à quelques années, la lave conserve une pâte vitreuse ou très fine, où flottent quelques cristaux de quartz et de feldspath."),
    pt(15, 0, 5, "Peu à peu, l'érosion met au jour des rhyolites, plus résistantes que les grès et les tufs voisins : elles dessinent les reliefs rouges de l'Estérel."),
  ], { src: ["tuttle", "eruption"] });
  COND.obsidienne = M("croute", [
    pt(700, 0.7, 0, "", { lab: "croûte" }),
    pt(850, 0.7, 1, "Sous l'arc des îles Éoliennes, la croûte entre en fusion partielle vers 850 °C, vers 25 km : il en résulte un liquide fortement enrichi en silice."),
    pt(830, 0.2, 2, "Ayant perdu une partie de ses gaz, le magma stocké vers 5 à 8 km ne fera pas explosion : il s'épanchera."),
    pt(800, 0, 3, "Émise vers 800 °C, la lave rhyolitique édifie la coulée épaisse des Rocche Rosse (Lipari), vers 1230."),
    pt(700, 0, 0, "", { bande: "verre" }),
    pt(15, 0, 4, "Très visqueuse, elle devient rigide (vers 700 °C) avant que ses atomes aient pu s'ordonner : il en résulte un verre plutôt que des cristaux. Roche quasi absente de France."),
  ], { src: ["tuttle", "eruption"] });
  COND.ignimbrite = M("croute", [
    pt(700, 0.8, 0, "", { lab: "croûte" }),
    pt(850, 0.8, 1, "À la fin de la chaîne varisque, la croûte entre en fusion partielle vers 30 km."),
    pt(830, 0.2, 2, "Riche en gaz, un magma rhyolitique se loge entre 5 et 8 km."),
    pt(650, 0, 3, "L'éruption se fait explosive ; la colonne s'effondre en nuées ardentes qui dévalent les pentes et conservent encore 600 à 700 °C à leur arrêt."),
    pt(600, 0, 0, "", { bande: "soudure" }),
    pt(15, 0, 4, "Avant de refroidir, les ponces, toujours brûlantes, s'aplatissent et se soudent en fiammes : Estérel et Corse (300 à 270 Ma)."),
  ], { src: ["tuttle"] });
  COND.tuf_volcanique = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Sous le Massif central, le manteau entre partiellement en fusion."),
    pt(1150, 0.2),
    pt(950, 0.2, 2, "Le magma, dans un réservoir de la croûte, évolue en s'enrichissant en gaz.", { bande: "premiers cristaux" }),
    pt(950, 0, 3, "La détente brutale des gaz réduit le magma en cendres ; celles-ci se refroidissent dans l'air en quelques secondes (Cantal, vers 8 Ma)."),
    pt(15, 0, 4, "Les cendres se déposent en couches, puis se consolident ; peu à peu, le verre se transforme en argiles et en zéolites."),
  ], { src: ["hirschmann"] });
  COND.pouzzolane = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Sous la chaîne des Puys, le manteau entre partiellement en fusion."),
    pt(1180, 0, 2, "Chargé de gaz, le basalte remonte en quelques jours à quelques semaines."),
    pt(700, 0, 3, "Les bulles de gaz éclatent et projettent des lambeaux de lave vers 1 100 °C ; ceux-ci se figent dans l'air en quelques secondes.", { bande: "figement" }),
    pt(15, 0, 4, "Les scories forment un cône ; près du conduit, encore brûlantes, elles s'oxydent et prennent une teinte rougeâtre (chaîne des Puys, 95 000 à 6 900 ans)."),
  ], { src: ["hirschmann"] });
  COND.breche_volcanique = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Le manteau fond partiellement sous le Cantal."),
    pt(1150, 0.25),
    pt(1000, 0, 2, "Coulée après coulée, des magmas évolués forment le stratovolcan (de 8,5 à 7 Ma)."),
    pt(15, 0, 3, "Un flanc refroidi du volcan s'effondre (vers 7 Ma) : l'avalanche de débris se répand sur des dizaines de kilomètres."),
    pt(15, 0, 4, "Les blocs restent figés dans une matrice de cendres qui durcit et se transforme en argile."),
  ], { src: ["hirschmann", "nehlig2001"] });
  COND.komatiite = M("profond", [
    pt(1900, 7.0, 0, "", { lab: "panache" }),
    pt(1850, 6, 1, "Dans la Terre archéenne, plus chaude, un panache du manteau entre largement en fusion au-delà de 200 km."),
    pt(1700, 0, 2, "Très riche en magnésium, le liquide s'élève en quelques jours."),
    pt(1580, 0, 3, "Émis à près de 1 600 °C, avec une fluidité exceptionnelle pour une lave, il y a ≈ 3,5 milliards d'années (Barberton)."),
    pt(1250, 0, 0, "", { bande: "spinifex" }),
    pt(15, 0, 4, "Refroidi brusquement, il cristallise en gerbes d'aiguilles d'olivine : c'est la texture spinifex. Aucune komatiite n'est connue en France métropolitaine ; la Guyane en possède, d'environ 2,1 milliards d'années."),
  ], { etiquettes: [["diamant stable", 700, 6.6], ["graphite stable", 700, 1.2]], src: ["hirschmann", "kennedy", "arndt"] });
  COND.kimberlite = M("profond", [
    pt(1300, 6.0, 1, "Le liquide se forme là où le diamant est stable : entre 150 et 250 km, sous les vieux continents, un manteau riche en CO₂ et en eau fond très peu."),
    pt(1050, 0.08, 2, "Des fragments du manteau, avec leurs diamants, sont arrachés au passage d'un liquide qui remonte en quelques heures à quelques jours."),
    pt(1000, 0, 3, "Près de la surface, la détente des gaz fragmente la roche : la cheminée se remplit de brèche."),
    pt(15, 0, 4, "Les diamants persistent malgré leur instabilité en surface : la remontée, trop brève, et la surface, trop froide, empêchent leur conversion en graphite (Kimberley, vers 90 Ma)."),
  ], { etiquettes: [["diamant stable", 700, 6.6], ["graphite stable", 700, 1.2]], src: ["hirschmann", "kennedy", "sparks", "dasgupta"] });

  // ═════ M.3 hypovolcaniques ═════
  COND.microgranite = M("croute", [
    pt(700, 0.8, 0, "", { lab: "croûte" }),
    pt(820, 0.8, 1, "Par fusion partielle, la croûte produit un magma semblable à celui d'un granite ; quelques cristaux de quartz et de feldspath y croissent déjà."),
    pt(790, 0.06, 2, "En quelques heures à quelques jours, le magma, chargé de cristaux, pénètre en filons entre 1 et 3 km."),
    pt(720, 0.06, 0, "", { bande: "pâte fine" }),
    pt(60, 0.06, 3, "Près de la surface, le liquide se solidifie rapidement : un filon de 1 m se forme en quelques semaines, un de 50 m en un siècle environ ; autour des grands cristaux, la pâte demeure fine."),
    pt(15, 0, 4, "Résistant davantage que le socle altéré, le filon dessine une muraille (filons tardi-hercyniens et permiens, 300 à 270 Ma)."),
  ], { src: ["tuttle", "diffusion"] });
  COND.porphyre = M("croute", [
    pt(700, 0.8, 0, "", { lab: "croûte" }),
    pt(850, 0.8),
    pt(800, 0.35, 1, "De gros cristaux de quartz et de feldspath croissent lentement dans un réservoir profond, pendant que la croûte fond partiellement.", { bande: "gros cristaux" }),
    pt(790, 0.04, 2, "En filon près de la surface (0,5 à 2 km), le magma remonte avec ses gros cristaux."),
    pt(720, 0.04, 0, "", { bande: "pâte fine" }),
    pt(60, 0.04, 3, "Autour des gros cristaux, le liquide restant se solidifie vite en une pâte fine."),
    pt(15, 0, 4, "Les reliefs rouges de l'Estérel (300 à 270 Ma) doivent leur existence au porphyre, roche dure."),
  ], { src: ["tuttle", "diffusion"] });
  COND.aplite = M("croute", [
    pt(850, 0.22, 0, "", { lab: "granite encore liquide" }),
    pt(700, 0.22, 1, "La cristallisation du granite touche à sa fin (≈ 700 °C) : il subsiste un peu de liquide riche en eau et en silice.", { bande: "cristallisation du granite" }),
    pt(680, 0.15, 2, "Ce liquide ultime pénètre dans les fractures du massif, vers 5 km de profondeur."),
    pt(620, 0.15, 3, "Brusquement privé d'eau, il cristallise très rapidement, en grain fin et régulier.", { bande: "cristallisation rapide" }),
    pt(250, 0.15),
    pt(15, 0, 4, "L'érosion dégage le granite du Sidobre ainsi que ses filons clairs (vers 300 Ma)."),
  ], { src: ["tuttle"] });
  COND.pegmatite = M("croute", [
    pt(850, 0.22, 0, "", { lab: "granite encore liquide" }),
    pt(700, 0.22, 1, "Le granite est presque entièrement cristallisé : le dernier liquide concentre l'eau, le bore, le fluor et le lithium.", { bande: "cristallisation du granite" }),
    pt(680, 0.15, 2, "Il s'introduit en filons dans le granite et dans les roches qui l'entourent."),
    pt(480, 0.15, 3, "Très fluide et riche en eau, il cristallise bien en dessous du solidus habituel du granite (jusque vers 450 à 500 °C) et forme des cristaux géants.", { bande: "cristaux géants" }),
    pt(220, 0.15),
    pt(15, 0, 4, "Ces filons, exploités pour leurs grands cristaux, émergent sous l'effet de l'érosion (Chanteloube, Ambazac, 340 à 290 Ma)."),
  ], { src: ["tuttle", "london"] });
  COND.dolerite = M("manteau", [
    MANTEAU_MC(),
    pt(1450, 2.3, 1, "Le manteau fond partiellement : il se forme un basalte."),
    pt(1220, 0.45, 2, "En quelques jours à quelques semaines, le magma traverse la croûte."),
    pt(1170, 0.08, 3, "Il s'arrête à faible profondeur (1,5 à 4 km) sous forme de dykes et de sills."),
    pt(1000, 0.08, 0, "", { bande: "cristallisation" }),
    pt(70, 0.08, 4, "En quelques mois à quelques siècles, un grain moyen se forme : son refroidissement est plus lent que celui d'une coulée, mais plus rapide que celui d'un gabbro."),
    pt(15, 0, 5, "Plus durs que les schistes, dykes et sills émergent par érosion et forment murailles et corniches (Massif armoricain)."),
  ], { src: ["hirschmann", "diffusion"] });
  COND.lamprophyre = M("manteau", [
    pt(1300, 2.6, 1, "Vers 80 km, un manteau riche en eau et en potassium fond partiellement ; l'eau y abaisse le point de fusion."),
    pt(1150, 0.4, 2, "Le magma, riche en éléments volatils, remonte rapidement."),
    pt(1080, 0.06, 3, "Entre 1 et 5 km, il s'injecte en filons dans les schistes et les grès dévoniens de la rade de Brest."),
    pt(950, 0.06, 0, "", { bande: "cristallisation" }),
    pt(60, 0.06, 4, "La biotite et l'amphibole cristallisent en gros cristaux ; les feldspaths demeurent dans la pâte (minette, kersantite)."),
    pt(15, 0, 5, "Le kersanton, pierre des calvaires bretons (340 à 290 Ma), apparaît quand l'érosion découvre les schistes et leurs filons sombres."),
  ], { courbes: ["peridotite", "peridotiteEau"], src: ["hirschmann", "grove2006"] });
  COND.microdiorite = M("manteau", [
    ...debutDiorite("Dans le manteau, vers 50 à 70 km de profondeur, un magma basique prend naissance."),
    pt(1200, 0.9),
    pt(1000, 0.9, 2, "Dans la partie basse de la croûte, il évolue et voit apparaître plagioclase et amphibole.", { bande: "premiers cristaux" }),
    pt(950, 0.05, 3, "Il s'injecte en filons à faible profondeur (0,5 à 3 km)."),
    pt(850, 0.05, 0, "", { bande: "cristallisation" }),
    pt(60, 0.05, 4, "Solidifié en quelques semaines à quelques années, il présente un grain fin, avec plagioclase et amphibole."),
    pt(15, 0, 5, "Mis à nu après l'enlèvement des roches sus-jacentes, le filon affleure au bord de la rade de Brest ; il a servi de pierre de taille (pierre de Logonna)."),
  ], { src: ["hirschmann", "diffusion"] });

  // ═════ M.4 carbonatites ═════
  COND.carbonatite = M("manteau", [
    pt(1050, 2.6, 1, "Quelques fractions de CO₂ abaissent le point de fusion du manteau de plusieurs centaines de degrés : vers 80 km, un liquide riche en carbonates se forme entre 1 000 et 1 100 °C, nettement sous le solidus du manteau sec."),
    pt(900, 0.8, 2, "Le magma s'élève et, dans la croûte, les carbonates se détachent des silicates."),
    pt(540, 0, 3, "L'Ol Doinyo Lengai (Tanzanie) émet une lave noire, riche en carbonates, vers 540 °C ; à l'air, elle blanchit en quelques jours."),
    pt(15, 0, 4, "Les carbonatites se forment surtout en profondeur ; l'érosion les expose (de 3 000 millions d'années à aujourd'hui)."),
  ], { labFondu: "manteau sec partiellement fondu", src: ["hirschmann", "dasgupta"] });

  // ═════ R métamorphiques ═════
  // chemins horaires des collisions (la pression monte avant la température), retours décalés de l'aller
  const R = (echelle, chemin, o) => Object.assign({ type: "meta", echelle, chemin }, o || {});
  const AL = ["kyAnd", "andSil", "kySil"];
  const FOND_OCEAN = (t) => pt(5, 0.04, 1, t); // fond de l'océan : ≈ 2–5 °C sous 3–4 km d'eau
  COND.ardoise = R("reg", [
    pt(15, 0, 1, "Lit après lit, des argiles s'accumulent au fond de la mer, à l'Ordovicien (470 à 460 Ma)."),
    pt(190, 0.28, 2, "Entraînées par la collision varisque, elles s'enfoncent jusqu'à une dizaine de kilomètres (≈ 0,3 GPa)."),
    pt(300, 0.3, 3, "Entre 200 et 300 °C, les argiles se transforment en micas très fins, tous parallèles : la roche se débite alors en feuillets.", { bande: "recristallisation" }),
    pt(200, 0.12),
    pt(15, 0, 4, "Ardoisières d'Angers-Trélazé : l'érosion de la chaîne remonte les ardoises jusqu'à la surface."),
  ], { gradients: [10, 30, 60] });
  COND.micaschiste = R("reg", [
    pt(15, 0, 1, "Au fond d'un bassin (540 à 480 Ma), des argiles et des limons se déposent."),
    pt(480, 0.55, 2, "Lors de la collision varisque (360 à 340 Ma), la marge d'un continent plonge sous l'autre plaque : ses argiles atteignent ≈ 20 km de profondeur, la pression croissant plus vite que la température."),
    pt(560, 0.5, 3, "La chaleur atteint la roche : entre 450 et 600 °C, les argiles se muent en micas orientés ; biotite et grenat apparaissent, la staurotide par endroits (Lozère).", { bande: "recristallisation" }),
    pt(400, 0.28),
    pt(15, 0, 4, "Trop épaissie, la chaîne s'étire sur des failles normales (vers 315 Ma) ; l'érosion l'allège et la racine remonte. Vers 305 Ma, les micaschistes des Cévennes affleurent déjà : les charbons du Stéphanien (bassin d'Alès) s'y déposent, puis le Trias les recouvre."),
  ], { courbes: [...AL, "graniteEau"], gradients: [10, 30, 60], src: ["pattison", "faure2001", "white1992", "tuttle"] });
  COND.quartzite = R("reg", [
    pt(15, 0, 1, "Sur une plate-forme marine (grès armoricain, 478 à 470 Ma), des sables quartzeux s'accumulent."),
    pt(250, 0.3, 2, "Sous l'effet de la collision varisque, une dizaine de kilomètres les ensevelissent (340 à 325 Ma)."),
    pt(420, 0.4, 3, "Au-delà de ≈ 300 °C, le quartz recristallise : les grains se soudent en mosaïque, et la rupture traverse la roche au lieu de la contourner.", { bande: "recristallisation" }),
    pt(300, 0.15),
    pt(15, 0, 4, "Monts d'Arrée : là où l'érosion use la chaîne, la quartzite, très résistante, dessine les crêtes."),
  ], { gradients: [10, 30, 60] });
  COND.marbre = R("reg", [
    pt(15, 0, 1, "Sur une plate-forme marine (Jurassique, vers 150 Ma), des boues calcaires s'accumulent."),
    pt(300, 0.22, 2, "Sous les bassins qui s'ouvrent, la croûte pyrénéenne s'amincit et la chaleur augmente (145 à 110 Ma)."),
    pt(520, 0.26, 3, "Calcite recristallisée en grains de sucre : marbre de Saint-Béat (110 à 85 Ma), formé vers 500 °C mais sous faible pression (8 à 10 km).", { bande: "recristallisation" }),
    pt(330, 0.08),
    pt(15, 0, 4, "La collision pyrénéenne soulève la série, puis l'érosion dégage le marbre."),
  ], { courbes: AL, gradients: [10, 30, 60], src: ["pattison", "ducoux"] });
  COND.calcschiste = R("hp", [
    FOND_OCEAN("Au fond de l'océan alpin, sous 3 à 4 km d'eau, se déposent des boues calcaires et argileuses (Jurassique à Crétacé)."),
    pt(250, 0.9, 2, "À la fermeture de l'océan, la subduction emporte ces boues entre 30 et 50 km sans les réchauffer beaucoup (60 à 55 Ma)."),
    pt(440, 1.4, 3, "Calcite, mica blanc et quartz se recristallisent en feuillets luisants, dans le faciès des schistes bleus : 300 à 480 °C et 1 à 1,8 GPa selon les unités, plus chaud et plus profond vers l'est.", { bande: "recristallisation" }),
    pt(380, 0.6),
    pt(15, 0, 4, "Le long du plan de subduction, les roches remontent (de 50 à 35 Ma) et se rééquilibrent dans le faciès des schistes verts."),
  ], { courbes: ["jadeite"], gradients: [10, 30], src: ["holland", "agard"] });
  COND.schiste_vert = R("reg", [
    FOND_OCEAN("La dorsale de l'océan alpin engendre des basaltes (vers 160 Ma)."),
    pt(250, 0.32, 2, "Ces basaltes sont enfouis vers une quinzaine de kilomètres (50 à 40 Ma) par la fermeture de l'océan, puis par la collision."),
    pt(400, 0.5, 3, "Entre 300 et 500 °C, le basalte se transforme en chlorite, actinote, épidote et albite : il verdit.", { bande: "recristallisation" }),
    pt(300, 0.18),
    pt(15, 0, 4, "Les schistes verts remontent depuis 35 Ma : la chaîne s'étire, et l'érosion l'allège."),
  ], { gradients: [10, 30, 60] });
  COND.amphibolite = R("reg", [
    FOND_OCEAN("La dorsale d'un océan engendre des basaltes et des gabbros (vers 480 Ma)."),
    pt(450, 0.8, 2, "Lors de la collision varisque (380 à 360 Ma), l'océan se referme et sa croûte est entraînée entre 20 et 35 km."),
    pt(650, 0.8, 3, "Entre 500 et 750 °C, pyroxène et plagioclase se transforment en hornblende et plagioclase alignés (vers 360 Ma).", { bande: "recristallisation" }),
    pt(450, 0.32),
    pt(15, 0, 4, "L'amphibolite remonte avec la croûte (Limousin) : la chaîne s'étire, l'érosion l'allège."),
  ], { courbes: ["graniteEau"], gradients: [10, 30, 60], src: ["tuttle"] });
  COND.schiste_bleu = R("hp", [
    FOND_OCEAN("Des boues viennent recouvrir les basaltes de la dorsale, au fond d'un océan (vers 480 Ma)."),
    pt(250, 1.0, 2, "Entraînée rapidement en profondeur par la subduction, la roche, restée froide, se réchauffe à peine (370 à 365 Ma)."),
    pt(475, 1.7, 3, "Le glaucophane, amphibole bleue, cristallise à l'île de Groix, sous 1,6 à 1,8 GPa (≈ 55 à 60 km) et 450 à 500 °C (vers 360 Ma).", { bande: "recristallisation" }),
    pt(420, 0.7),
    pt(15, 0, 4, "Les minéraux bleus subsistent en partie après une remontée rapide le long du plan de subduction (360 à 350 Ma)."),
  ], { courbes: ["jadeite"], gradients: [10, 30], src: ["holland", "bosse"] });
  COND.eclogite = R("hp", [
    FOND_OCEAN("Au fond d'un océan, des basaltes naissent de l'activité de la dorsale (vers 480 Ma)."),
    pt(450, 1.4, 2, "Au-delà de 50 km, la subduction varisque emporte la croûte océanique (390 à 380 Ma)."),
    pt(720, 2.1, 3, "Entre 650 et 850 °C et ≈ 2 GPa (Haut-Allier, Lévézou), omphacite et grenat remplacent plagioclase et pyroxène : la roche gagne en densité (383 Ma à Najac, 358 Ma au Lévézou). Localement, la coésite indique plus de 2,8 GPa.", { bande: "recristallisation" }),
    pt(650, 0.9),
    pt(15, 0, 4, "Une écaille détachée remonte le long du plan de subduction ; en chemin, une partie se change en amphibolite (358 à 340 Ma)."),
  ], { courbes: ["jadeite", "coesite", "graniteEau"], gradients: [10, 30], src: ["holland", "bose", "lotout", "tuttle"] });
  COND.gneiss = R("reg", [
    pt(850, 0.2, 0, "", { lab: "magma granitique" }),
    pt(680, 0.2, 1, "Vers 7 km de profondeur, un granite cristallise (vers 480 Ma) : il constituera la roche de départ.", { bande: "cristallisation" }),
    pt(330, 0.2),
    pt(500, 0.8, 2, "Entre 360 et 345 Ma, la collision varisque fait descendre le granite, avec la croûte qui le porte, de 20 à 30 km."),
    pt(700, 0.75, 3, "Entre 650 et 750 °C, les minéraux se recristallisent et se séparent en lits clairs (quartz, feldspaths) et sombres (micas) ; la roche peut parfois commencer à fondre.", { bande: "recristallisation" }),
    pt(450, 0.4),
    pt(15, 0, 4, "La chaîne s'étire le long de ses failles ; l'érosion l'allège et le gneiss remonte avec la croûte (Haut-Allier)."),
  ], { courbes: [...AL, "graniteEau"], anatexie: true, src: ["pattison", "tuttle"] });
  COND.leptynite = R("reg", [
    pt(850, 0, 0, "", { lab: "lave acide" }),
    pt(15, 0, 1, "Vers 480 Ma, des laves claires, riches en silice, déferlent et se figent à la surface."),
    pt(500, 0.8, 2, "Lors de la collision varisque (380 à 360 Ma), ces roches sont enfouies entre 25 et 30 km."),
    pt(680, 0.8, 3, "Entre 600 et 750 °C, la roche recristallise en quartz et feldspaths à grain fin, presque dépourvue de mica.", { bande: "recristallisation" }),
    pt(420, 0.32),
    pt(15, 0, 4, "Avec les amphibolites voisines, elle remonte (Limousin, Vendée)."),
  ], { courbes: [...AL, "graniteEau"], gradients: [30], src: ["pattison", "tuttle"] });
  COND.granulite_meta = R("reg", [
    pt(15, 0, 1, "Au fond d'un bassin (540 à 480 Ma), des sédiments s'accumulent."),
    pt(650, 1.1, 2, "Elles se retrouvent à la base d'une croûte épaissie, vers 35 à 40 km (380 à 360 Ma)."),
    pt(850, 1.0, 3, "Au-delà de 750 °C, grenat et orthopyroxène prennent la place des micas en se décomposant ; l'eau repart avec un peu de liquide.", { bande: "recristallisation" }),
    pt(600, 0.4),
    pt(15, 0, 4, "Seule une remontée tectonique ou une érosion très profonde les conduit à l'air libre (Massif central)."),
  ], { courbes: [...AL, "graniteEau"], anatexie: true, src: ["pattison", "tuttle"] });
  COND.migmatite = R("reg", [
    pt(15, 0, 1, "Au fond d'un bassin (540 à 480 Ma), des argiles et des limons s'accumulent."),
    pt(650, 0.8, 2, "Lors de la collision varisque (360 à 340 Ma), elles sont enfouies entre 25 et 30 km."),
    pt(800, 0.45, 3, "À 0,4 à 0,5 GPa, dans le dôme du Velay, la roche atteint 750 à 850 °C et franchit le solidus du granite ; le liquide clair s'organise en lits (340 à 300 Ma).", { bande: "fusion partielle" }),
    pt(500, 0.18),
    pt(15, 0, 4, "Moins dense, la croûte fondue s'élève en dôme ; l'érosion le met au jour."),
  ], { courbes: [...AL, "graniteEau"], anatexie: true, src: ["pattison", "tuttle", "barbey"] });
  // contact, métasomatose : faible pression, forte chaleur
  COND.corneenne = R("contact", [
    pt(160, 0.15, 1, "Entre 5 et 6 km de profondeur, vers 150 à 200 °C, des argiles et des schistes gisent."),
    pt(330, 0.15, 2, "Tout près, un granite chaud (≈ 700 à 800 °C) s'injecte : sa chaleur se transmet à la roche voisine."),
    pt(560, 0.15, 3, "Entre 450 et 650 °C, sans compression supplémentaire, la roche forme andalousite et cordiérite, minéraux de basse pression ; l'auréole se réchauffe puis se refroidit en 10 000 à 100 000 ans.", { bande: "recristallisation" }),
    pt(250, 0.11),
    pt(15, 0, 4, "Une fois refroidie, l'auréole remonte avec son granite, avant d'être dégagée par l'érosion (Sidobre, vers 300 Ma)."),
  ], { courbes: [...AL, "graniteEau"], src: ["pattison", "tuttle", "diffusion"] });
  COND.skarn = R("contact", [
    pt(150, 0.12, 1, "Entre 4 et 5 km de profondeur, vers 150 °C, reposent des calcaires."),
    pt(300, 0.12, 2, "Tout près, un granite s'injecte, et sa cristallisation dégage des fluides chauds chargés de silice, de fer et de métaux."),
    pt(550, 0.12, 3, "Entre 400 et 650 °C, fluides et calcaire échangent leurs éléments : le CO₂ s'échappe, tandis que silice et fer pénètrent ; grenats et pyroxènes calciques cristallisent.", { bande: "échanges" }),
    pt(250, 0.09),
    pt(15, 0, 4, "Le skarn et son minerai de tungstène (Salau, Costabonne, 320 à 290 Ma) sont mis au jour par l'érosion."),
  ], { courbes: ["graniteEau"], src: ["tuttle"] });
  COND.greisen = R("contact", [
    pt(850, 0.1, 0, "", { lab: "coupole de granite" }),
    pt(700, 0.1, 1, "Vers 3 à 4 km de profondeur (≈ 0,1 GPa), le sommet d'une coupole de granite achève sa cristallisation.", { bande: "cristallisation" }),
    pt(550, 0.1, 2, "Des fluides chauds, riches en fluor, bore, lithium, étain et tungstène, s'échappent de ce corps."),
    pt(400, 0.1, 3, "Entre 300 et 500 °C, ces fluides altèrent le granite : au profit du quartz, du mica blanc et de la topaze, feldspaths et biotite disparaissent.", { bande: "greisenisation" }),
    pt(200, 0.08),
    pt(15, 0, 4, "Des filons de cassitérite et de wolframite se forment, puis l'érosion les découvre (Montebras, 330 à 300 Ma)."),
  ], { courbes: ["graniteEau"], src: ["tuttle", "pirajno"] });
  COND.fenite = R("contact", [
    pt(900, 0.2, 0, "", { lab: "carbonatite" }),
    pt(750, 0.2, 1, "Une carbonatite (ou une syénite néphélinique) se met en place vers 7 km."),
    pt(650, 0.2, 2, "Des fluides riches en sodium et en potassium envahissent les roches voisines, libérés par ce corps."),
    pt(500, 0.2, 3, "Sous l'effet de plusieurs centaines de degrés, l'encaissant voit disparaître son quartz au profit de feldspath alcalin et d'ægyrine, sur une auréole large de quelques mètres à quelques kilomètres.", { bande: "fénitisation" }),
    pt(250, 0.14),
    pt(15, 0, 4, "Le complexe et son auréole sont mis à nu par l'érosion (Fen, Norvège, vers 580 Ma) ; la fénite n'existe pas en France."),
  ], { src: ["elliott"] });
  COND.serpentinite = R("reg", [
    pt(950, 0.9, 0, "", { lab: "manteau" }),
    pt(500, 0.04, 1, "Au-dessous d'une dorsale lente, le manteau monte jusqu'au fond de l'océan alpin en fondant peu, puis se refroidit à l'arrivée."),
    pt(400, 0.08, 2, "La roche, en se refroidissant, se fissure, et l'eau de mer y pénètre."),
    pt(250, 0.08, 3, "Entre ≈ 300 et 400 °C, l'olivine s'hydrate et donne serpentine et magnétite ; la roche enfle et perd en densité (165 à 150 Ma).", { bande: "serpentinisation" }),
    pt(450, 1.1, 0, "", { lab: "Queyras" }),
    pt(15, 0, 4, "Lors de la fermeture de l'océan, la majeure partie de son fond s'enfonce (Queyras : jusqu'à ≈ 40 km, où la serpentine devient antigorite) avant de remonter ; une écaille restée près de la surface constitue le Chenaillet."),
  ], { src: ["evans", "manatschal"] });
  COND.rodingite = R("fond", [
    pt(1180, 0.1, 0, "", { lab: "magma basique" }),
    pt(1000, 0.1, 1, "Dans le fond de l'océan alpin, un filon de gabbro recoupe la péridotite et se solidifie.", { bande: "cristallisation" }),
    pt(400, 0.1, 2, "La péridotite environnante se serpentinise, et l'eau qui y circule s'enrichit en calcium."),
    pt(300, 0.1, 3, "Entre 250 et 350 °C, ces fluides calciques transforment le gabbro : grenat grossulaire et diopside se substituent aux feldspaths (165 à 150 Ma).", { bande: "métasomatose" }),
    pt(150, 0.05),
    pt(15, 0, 4, "C'est avec les ophiolites alpines (Chenaillet, Queyras) qu'a été charriée la rodingite."),
  ], { src: ["bach", "manatschal"] });
  COND.spilite = R("fond", [
    pt(1150, 0.035, 1, "En coussins au fond de l'océan alpin, sous ≈ 3,5 km d'eau, un basalte s'étale à ≈ 1 150 °C."),
    pt(350, 0.05, 2, "Chauffée par la croûte encore brûlante, l'eau de mer circule à travers la lave."),
    pt(280, 0.05, 3, "Entre 200 et 400 °C, le sodium de l'eau se substitue au calcium du plagioclase (albite) ; la chlorite et l'épidote verdissent la roche (vers 160 Ma).", { bande: "spilitisation" }),
    pt(100, 0.03),
    pt(15, 0, 4, "On la retrouve aussi dans les vieilles séries volcaniques de Bretagne et des Vosges, mais c'est dans l'ophiolite du Chenaillet, charriée sur le continent, qu'elle est conservée."),
  ], { src: ["alt", "manatschal"] });
  // roches de faille
  COND.mylonite = { type: "faille", chemin: [
    pt(250, 0.3, 1, "Vers 11 km de profondeur, à ≈ 250 °C, un granite déjà formé se trouve dans des conditions où son quartz se briserait."),
    pt(500, 0.42, 2, "Une grande zone de cisaillement l'entraîne vers 15 km ; des granites encore chauds s'y mettent en place le long de la faille, la roche atteignant ≈ 500 °C : son quartz cesse de se briser et s'étire."),
    pt(420, 0.3, 3, "Des rubans fins se recristallisent autour d'« yeux » de feldspath, plus résistants, tandis que le cisaillement fait remonter la roche.", { bande: "recristallisation" }),
    pt(15, 0, 4, "L'activité de la faille et l'érosion la font remonter (cisaillement sud-armoricain, 320 à 290 Ma)."),
  ], src: ["scholz"] };
  COND.cataclasite = { type: "faille", chemin: [
    pt(130, 0.1, 1, "Vers 4 km de profondeur (≈ 130 °C) se trouve une roche quelconque, ici un granite."),
    pt(220, 0.2, 2, "Vers 7 km, sous ≈ 300 °C, une faille traverse la roche : le quartz demeure cassant."),
    pt(220, 0.2, 3, "À chaque glissement, la roche se broie en fragments anguleux, que des fluides recimentent ensuite (de l'Hercynien à l'actuel)."),
  ], src: ["scholz"] };
  COND.pseudotachylite = { type: "faille", fusionSeche: true, chemin: [
    pt(270, 0.25, 1, "Vers 9 km (≈ 270 °C), une roche sèche se situe dans le domaine cassant."),
    pt(1150, 0.25, 2, "Lorsqu'un séisme fait glisser à ≈ 1 m/s les deux lèvres de la faille, le frottement élève en quelques secondes au-delà de 1 000 °C une mince tranche de roche."),
    pt(270, 0.28, 3, "La tranche fondue se change en verre en quelques secondes à quelques minutes ; sa chaleur est aussitôt absorbée par la roche froide qui l'entoure.", { bande: "trempe" }),
  ], src: ["scholz", "sibson"] };
  // impact
  COND.impactite = { type: "choc", chemin: [
    { P: 0.1, T: 15, n: 1, t: "Un astéroïde d'≈ 1,5 km arrive à ≈ 20 km/s sur le socle du Limousin, qui se trouve dans les conditions de pression et de température de surface." },
    { P: 12, T: 140, n: 2, t: "En ≈ 0,1 s (1,5 km ÷ 20 km/s), l'onde de choc traverse l'astéroïde ; le quartz choqué de Rochechouart, dans le socle, a enregistré 10 à 15 GPa, et la roche en conserve une élévation de ≈ 100 à 150 °C." },
    { P: 80, T: 2000, n: 3, t: "Au voisinage immédiat de l'impact, où la pression dépasse ≈ 60 GPa, la roche fond (plus de 1 500 °C) : verre et brèches comblent le cratère en quelques minutes." },
    { P: 80, T: 15, n: 4, t: "Le cratère (≈ 25 km), formé il y a 206,9 Ma, a disparu sous l'érosion ; les brèches, elles, demeurent, et le verre et les brèches se refroidissent en quelques années à quelques milliers d'années." },
  ], note: "Courbe : température conservée dans une roche cristalline compacte après le passage de l'onde, en fonction de la pression atteinte (French 1998). Chaque point représente une roche plus proche du point d'impact.", src: ["french1998", "stoffler"] };

  // ═════ S sédimentaires ═════
  // q(o) : point quelconque ; n = numéro de l'étape (état atteint à la fin de l'étape) ; sans coordonnées = étape sans position
  const q = (o, n, t, x) => Object.assign({}, o, n ? { n } : {}, t ? { t } : {}, x || {});
  // ── évaporites ──
  COND.gypse = { type: "saumure", sels: ["gypse"], chemin: [
    q({ F: 1, C: 1.84 }, 0, "", { lab: "eau de mer" }),
    q({ F: 3.8, C: 7.0 }, 1, "L'eau de mer s'introduit dans un bassin presque clos ; une fois les trois quarts de l'eau évaporés (× 3,8), le gypse dissous atteint ≈ 7 g par kilogramme d'eau, et tout excédent cristallise. Dans l'eau douce, la saturation survient dès ≈ 2,4 g ; dans l'eau de mer, la présence des autres ions la retarde."),
    q({ F: 7, C: 7.0 }, 2, "Tant que le bassin reçoit de nouveaux apports et que la saumure reste entre × 3,8 et × 10,6, le gypse supplémentaire cristallise : les bancs s'accumulent pendant des milliers d'années (Montmartre, Priabonien, ≈ 37 à 34 Ma)."),
  ] };
  COND.sel = { type: "saumure", sels: ["halite"], chemin: [
    q({ F: 1, C: 28.4 }, 0, "", { lab: "eau de mer" }),
    q({ F: 10.6, C: 301 }, 1, "À × 10,6, le sel dissous atteint ≈ 300 g par kilogramme d'eau, quand il ne reste plus que 9 % de celle-ci : c'est alors la halite qui cristallise, après les carbonates et le gypse."),
    q({ F: 30, C: 301 }, 2, "Tant que le bassin est alimenté, tout excédent de sel cristallise : des cubes de halite apparaissent à la surface et au fond, puis s'empilent en bancs (Keuper de Lorraine, Carnien, ≈ 230 Ma)."),
    q({}, 3, "Enfoui sous des kilomètres de couches, le sel se comporte comme un glacier : moins dense et plastique, il s'écoule et monte en dômes (bassin d'Aquitaine, mer du Nord). En Lorraine, peu enfoui, il est resté en couches horizontales, exploitées à Varangéville, dernière mine de sel gemme active de France."),
  ] };
  COND.sylvinite = { type: "saumure", sels: ["sylvite", "halite"], chemin: [
    q({ F: 1, C: 0.79 }, 0, "", { lab: "eau de mer" }),
    q({ F: 65, C: 51 }, 1, "Passé le gypse (× 3,8) puis le sel (× 10,6), et au-delà de ≈ × 65, l'eau ne représente plus que 1,5 % : le potassium dissous monte à ≈ 50 g par kilogramme d'eau (compté en sylvite) et les premiers sels de potassium apparaissent (bassin potassique d'Alsace, Rupélien, de 34 à 31 Ma)."),
    q({ F: 100, C: 51 }, 2, "La sylvinite résulte de la précipitation conjointe de halite et de sels de potassium ; la carnallite, en se transformant, fournit une partie de la sylvite."),
  ] };
  COND.cargneule = { type: "saumure", sels: ["gypse"], selsVisibles: ["gypse"], xmin: 0.01, xmax: 20, ymin: 0.01, eauDouce: true, chemin: [
    q({ F: 1, C: 1.84 }, 0, "", { lab: "eau de mer" }),
    q({ F: 3.8, C: 7.0 }, 1, "Au Trias (Keuper, ≈ 220 Ma), dans des lagunes en voie d'évaporation, le gypse cristallise dès × 3,8 avec les boues de dolomie."),
    q({ F: 0.03, C: 0.012 }, 2, "Vers 40 à 30 Ma, les nappes alpines écrasent ces couches tendres en brèche, et l'eau souterraine, douce et presque exempte de gypse, peut alors y circuler.", { lab: "eau souterraine", saut: true }),
    q({ F: 0.03, C: 2.4 }, 3, "Douce, l'eau souterraine dissout le gypse sans dépasser ≈ 2,4 g par kilogramme d'eau ; se renouvelant sans cesse, elle élimine finalement tout le gypse. Chargée de sulfate, elle change aussi une partie de la dolomie en calcite : il subsiste un réseau de cloisons de calcite autour de cellules vides, avec des restes de fragments de dolomie."),
  ] };
  COND.anhydrite = { type: "anhydrite", chemin: [
    q({ F: 1, T: 28 }, 0, "", { lab: "eau de mer" }),
    q({ F: 3.8, T: 30 }, 1, "Le gypse précipite tant que la saumure reste sous ≈ 47 °C : dans une lagune presque fermée du Trias (250 à 200 Ma), l'eau de mer s'évapore jusqu'à × 3,8 ; dans les saumures les plus chaudes et les plus salées, c'est directement l'anhydrite."),
    q({ F: 4, T: 70 }, 2, "Dans 1 à 2 km de couches (de 230 à 150 Ma), le gypse se réchauffe ; passé ≈ 45 à 58 °C, selon la salinité de l'eau qui l'imprègne, il se déshydrate pour devenir anhydrite."),
    q({ F: 0.1, T: 15 }, 3, "L'anhydrite constitue une mosaïque de cristaux dont les clivages se coupent à angle droit ; ramenée près de la surface, au contact de l'eau douce, elle refixe de l'eau et redevient gypse."),
  ] };
  COND.dolomie = { type: "mgca", chemin: [
    q({ F: 1.2, R: 5.13 }, 1, "Des boues calcaires se déposent dans une lagune chaude (Jurassique des Causses, ≈ 165 Ma). Le chemin part de l'eau de mer actuelle, où le rapport magnésium ÷ calcium vaut environ 5 ; au Jurassique, il était plus bas, entre 1 et 2."),
    q({ F: 3.8, R: 5.13 }), q({ F: 4.5, R: MGCA(4.5) }), q({ F: 5.2, R: MGCA(5.2) }),
    q({ F: 6, R: MGCA(6) }, 2, "En s'évaporant, l'eau se concentre ; dès × 3,8, le gypse cristallise et prélève du calcium, si bien que le rapport magnésium ÷ calcium de la saumure dépasse 10."),
    q({ F: 6, R: 3 }, 3, "Plus dense, la saumure s'infiltre dans les boues calcaires : le magnésium remplace une partie du calcium et la calcite se transforme en dolomite ; appauvrie en magnésium, la saumure voit alors son rapport diminuer."),
    q({}, 4, "La dolomie, dissoute de façon inégale, prend la forme de tours et d'arches : Montpellier-le-Vieux (depuis quelques millions d'années)."),
  ] };
  // ── silice ──
  COND.silex = { type: "silice", chemin: [
    q({ T: 12, C: 0.5 }, 1, "Dans la mer de la craie, éponges et radiolaires bâtissent des squelettes d'opale à partir d'une eau très pauvre en silice (moins de 1 mg/L) : le vivant est donc à l'origine de cette concentration."),
    q({ T: 12, C: 90 }),
    q({ T: 14, C: 25 }, 2, "Des rognons de silex apparaissent en lits réguliers : sous quelques mètres de boue, l'opale se dissout dans l'eau des pores (jusqu'à ≈ 90 mg/L), avant de se redéposer en certains points."),
    q({ T: 20, C: 10 }, 3, "Peu à peu, la silice se substitue à la craie : d'abord l'opale, puis la calcédoine ; l'eau tend vers la saturation en quartz (≈ 10 mg/L), et les fantômes des spicules demeurent visibles."),
    q({}, 4, "L'usure et la dissolution de la craie laissent subsister le silex, très dur : c'est ce qui compose les galets des plages normandes et les outils des premiers hommes."),
  ] };
  COND.radiolarite = { type: "silice", chemin: [
    q({ T: 20, C: 0.3 }, 1, "Les radiolaires façonnent leur squelette d'opale dans des eaux de surface pratiquement dénuées de silice, au-dessus de l'océan alpin (Jurassique supérieur, de 165 à 145 Ma)."),
    q({ T: 2, C: 8 }, 2, "La calcite se dissout au-delà de la profondeur de compensation (plus de 4 km) ; seule l'opale atteint le fond, où, à ≈ 2 °C, une boue rouge s'accumule à raison de quelques mètres par million d'années."),
    q({ T: 2, C: 73 }), q({ T: 20, C: 105 }),
    q({ T: 40, C: 150 }, 3, "Enfouie sous des calcaires puis des schistes, la boue s'échauffe et reste saturée en opale ; vers 40 °C, l'opale-A passe à l'état d'opale-CT."),
    q({ T: 60, C: 27 }, 4, "À 50 à 60 °C, l'opale-CT recristallise en quartz ; la silice dissoute revient à saturation, et la boue se durcit en une roche rougie par l'hématite (le jaspe)."),
  ] };
  COND.diatomite = { type: "silice", xlab: "Température de l'eau (°C)", chemin: [
    q({ T: 15, C: 20 }, 1, "Les diatomées, qui tirent leur silice de roches volcaniques, bâtissent dans les lacs de cratère du Massif central (≈ 20 mg/L) leur coque d'opale (frustule)."),
    q({ T: 12, C: 90 }, 2, "Une fois mortes, les coques tombent au fond ; une partie se dissout dans l'eau des pores jusqu'à saturer en opale (≈ 90 mg/L), et des lits blancs se forment, de quelques millimètres par an."),
    q({ T: 25, C: 117 }, 3, "N'ayant jamais dépassé une trentaine de degrés, l'opale n'a pas recristallisé : les frustules demeurent intacts, et la roche, criblée de vides, est très légère (de 15 à 2 Ma)."),
  ] };
  COND.gaize = { type: "silice", chemin: [
    q({ T: 14, C: 0.5 }, 1, "Des éponges édifient des spicules d'opale sur le fond de la mer albienne (de 113 à 100,5 Ma), où se mêlent argile et grains verts de glauconie."),
    q({ T: 16, C: 98 }, 2, "Un sable argileux se forme par accumulation de spicules, de sable fin, d'argile et de glauconie ; dans l'eau des pores, une part des spicules se dissout jusqu'à saturation de l'opale."),
    q({ T: 38, C: 145 }),
    q({ T: 40, C: 80 }, 3, "Sous les craies du Crétacé supérieur, vers 40 °C, la silice se redépose en opale-CT entre les grains, qui se soudent sans que les vides soient comblés."),
    q({ T: 40, C: 80 }, 4, "Légère et poreuse, cette roche n'en est pas moins dure : c'est avec elle qu'on a bâti les villages d'Argonne."),
  ] };
  COND.meuliere = { type: "silice", xlab: "Température de l'eau (°C)", chemin: [
    q({ T: 18, C: 5 }, 1, "Les calcaires de Brie et de Beauce sont déposés à l'Oligocène (≈ 30 Ma) par des lacs à eau pauvre en silice."),
    q({ T: 22, C: 110 }),
    q({ T: 22, C: 20 }, 2, "Lorsque les lacs s'assèchent, l'altération des argiles libère de la silice : l'eau atteint la saturation en opale, puis opale et calcédoine substituent peu à peu le calcaire (de 34 à 15 Ma) ; le calcaire résiduel se dissout et la meulière prend un aspect caverneux.", { bande: "silicification" }),
  ] };
  // ── calcite ──
  COND.travertin = { type: "calcite", chemin: [
    q({ pco2: 0.03, Ca: 12 }, 0, "", { lab: "eau de pluie" }),
    q({ pco2: 0.03, Ca: 125 }, 1, "Au sein du sol, racines et microbes enrichissent l'eau de pluie en CO₂ (≈ 3 % de l'air du sol) ; celle-ci dissout le calcaire jusqu'à l'équilibre, soit ≈ 125 mg de calcium par litre à 10 °C."),
    q({ pco2: 0.0004, Ca: 125 }),
    q({ pco2: 0.0004, Ca: 45 }, 2, "À la source et dans les cascades, le CO₂ se dégage vers l'air (0,04 %) : l'eau contient alors 4 à 5 fois plus de calcium que l'équilibre ne le permet, et la calcite précipite sur les mousses jusqu'à un retour vers l'équilibre."),
    q({ pco2: 0.0004, Ca: 45 }, 3, "Une roche litée et poreuse se forme lorsque la calcite enrobe mousses et brindilles, lit après lit, et que celles-ci pourrissent en laissant des vides (cascades pétrifiantes du Jura)."),
  ] };
  COND.calcrete = { type: "calcite", chemin: [
    q({ pco2: 0.03, Ca: 125 }, 0, "", { lab: "eau du sol" }),
    q({ pco2: 0.03, Ca: 250 }),
    q({ pco2: 0.005, Ca: 70 }, 1, "Dans un climat à saison sèche marquée (moins de 760 mm de pluie par an), la pluie dissout le calcaire près de la surface ; plus bas, l'eau perd son CO₂ et les racines la pompent : son calcium dépasse l'équilibre et la calcite précipite en nodules. Près d'une nappe, l'eau qui remonte par capillarité en dépose aussi."),
    q({}, 2, "Pendant des dizaines de milliers d'années, les nodules grandissent et s'agglomèrent en une dalle (Pléistocène, de 2,6 Ma à 11 700 ans)."),
    q({}, 3, "Croûte dure de quelques décimètres à quelques mètres, faite de nodules de calcite liés par une calcite fine et de grains de sable (Costières de Nîmes, Crau)."),
  ] };
  COND.breche_sedimentaire = { type: "calcite", chemin: [
    q({}, 1, "Une couche de calcaire se plisse et se soulève ; des blocs tombent de ses falaises et ne roulent que sur quelques centaines de mètres : anguleux, ils s'entassent sans classement (fin du Crétacé)."),
    q({ pco2: 0.03, Ca: 125 }, 0, "", { lab: "eau d'infiltration" }),
    q({ pco2: 0.001, Ca: 125 }),
    q({ pco2: 0.001, Ca: 40 }, 2, "L'éboulis devient une roche, la brèche, lorsque l'eau de pluie, chargée de calcaire dissous (≈ 125 mg de calcium par litre) et d'argile rouge, s'infiltre dans ses vides, y perd son CO₂ et devient sursaturée : la calcite précipite et soude les blocs."),
    q({}, 3, "Polie après sciage, la brèche du Tholonet révèle des fragments anguleux dans une boue rouge durcie : c'est le « marbre » du Tholonet."),
  ] };
  // ── apatite ──
  COND.phosphorite = { type: "apatite", chemin: [
    q({}, 1, "Creusant poches et conduits, l'eau de pluie, rendue acide par le CO₂ du sol, dissout le calcaire (karst, dès le Lutétien, ≈ 45 Ma)."),
    q({ pH: 4.5, P: 100 }, 2, "Des argiles et des restes de vertébrés comblent les poches ; l'eau qui percole à travers le guano de chauves-souris s'acidifie (pH ≈ 4 à 5) et entraîne des phosphates, à raison de quelques dizaines à quelques centaines de mg par litre, sans précipitation."),
    ...[5, 5.5, 6, 6.5, 7].map((ph) => q({ pH: ph, P: Math.min(100, 1.4 * Papatite(ph)) })),
    q({ pH: 7.5, P: 0.0007 }, 3, "Au contact du calcaire, l'eau se neutralise : à partir de pH ≈ 5, elle est sursaturée et l'apatite précipite ; vers pH 7,5, les phosphates dissous sont presque épuisés, d'où la formation de nodules et de croûtes de phosphorite (de 42 à 23 Ma)."),
    q({}, 4, "Un ciment de calcite emprisonne des grains phosphatés, des os et des dents de mammifères : roche exploitée comme engrais au XIXᵉ siècle, qui a livré des milliers de fossiles (Quercy)."),
  ] };
  // ── fer ──
  COND.roche_ferrifere = { type: "ehph", systeme: "fer", chemin: [
    q({ pH: 6.5, Eh: -0.3 }, 0, "", { lab: "fer dissous" }),
    q({ pH: 8, Eh: 0.45 }, 1, "Archéen : dans un océan privé d'oxygène, le fer demeure dissous (Fe²⁺). Transporté vers les plateaux par les courants, il s'oxyde au contact de l'oxygène issu des cyanobactéries, et les oxydes insolubles qui en résultent précipitent (vers 2 500 Ma)."),
    q({ pH: 8, Eh: -0.3 }, 2, "D'après l'explication la plus répandue, en l'absence d'oxygène le fer reste dissous et seule la silice se dépose ; quand l'oxygène revient, un nouveau lit d'oxydes de fer précipite. Ces alternances de lits de fer et de silice forment les fers rubanés (de 3 800 à 1 800 Ma)."),
    q({}, 3, "La roche ferrifère la plus exploitée en France, la minette lorraine, s'est formée autrement : des oolithes ferrugineuses se sont déposées dans une mer peu profonde et oxygénée du Jurassique (Aalénien, vers 175 Ma)."),
  ] };
  // ── carbonates marins : ion carbonate et saturation ──
  COND.craie = { type: "mer", chemin: [
    q({ z: 20 }, 1, "Au large, l'eau de surface d'une mer chaude présente un excès d'ion carbonate, environ cinq fois la saturation ; des coccolithophoridés, algues microscopiques, en tirent de minuscules plaques de calcite (du Cénomanien au Campanien, de 100,5 à 72,2 Ma)."),
    q({ z: 50 }), q({ z: 100 }),
    q({ z: 150 }, 2, "À leur mort, ces plaques sédimentent entre 50 et 300 m de profondeur ; l'eau reste sursaturée et rien ne se dissout. Il s'y dépose une boue blanche presque pure (≈ 30 m par million d'années), dont la silice apportée par les éponges se regroupe en rognons de silex."),
    q({}, 3, "Peu enfouie (quelques centaines de mètres), la craie est à peine cimentée : elle conserve jusqu'à 40 % de vides."),
    q({}, 4, "À l'examen microscopique, on distingue des coccolithes par milliards, quelques coquilles de foraminifères et presque aucun ciment ; la roche est blanche, tendre et poreuse."),
    q({}, 5, "Après le retrait de la mer de la craie et le soulèvement de la région, l'érosion a dégagé la craie ; la Manche en ronge désormais le pied, façonnant falaises, arche et aiguille d'Étretat."),
  ] };
  COND.tuffeau = { type: "mer", chemin: [
    q({ z: 10 }, 1, "Au Turonien (de 93,9 à 89,8 Ma), la Touraine est couverte par une mer peu profonde, sursaturée en calcite ; coquillages, bryozoaires et éponges y prospèrent, et les rivières y charrient sable fin et micas."),
    q({ z: 60 }, 2, "Sur la plate-forme s'accumulent ensemble débris de coquilles, spicules d'éponges, sable fin, micas et grains verts de glauconie : le mélange ne compte qu'environ 50 % de calcite."),
    q({}, 3, "Enfoui sur quelques centaines de mètres seulement, le tuffeau reste faiblement cimenté."),
    q({}, 4, "Calcite et opale ne font qu'effleurer la cohésion des grains : pierre légère et tendre, aisée à tailler, celle des châteaux de la Loire."),
  ] };
  COND.falun = { type: "mer", chemin: [
    q({ z: 5 }, 1, "Au Miocène (de 20 à 10 Ma), une mer chaude et très peu profonde relie la Bretagne au Bassin parisien. Très sursaturée en calcite, cette eau fait prospérer coquillages, bryozoaires et oursins, et les requins viennent y chasser."),
    q({ z: 15 }, 2, "Les vagues et les courants de marée fragmentent les coquilles et trient les débris ; ceux-ci forment des bancs de sable coquillier, à raison de quelques mètres par million d'années."),
    q({}, 3, "Peu enfoui, le falun est souvent resté meuble ; par endroits (Anjou), un ciment de calcite déposé près de la surface en a fait un grès coquillier assez solide pour y creuser des caves."),
    q({}, 4, "Sable de coquilles brisées, épandu jadis sur les champs (c'est le « falunage ») ; on en extrait aussi des dents de requins."),
  ] };
  COND.marne = { type: "mer", chemin: [
    q({}, 1, "Sur les terres voisines, l'altération de la roche par l'eau libère des argiles très fines, que les rivières conduisent à la mer (Jurassique, ≈ 162 Ma)."),
    q({ z: 15 }, 0, "", { lab: "plancton" }),
    q({ z: 60 }),
    q({ z: 150 }, 2, "Au large et en eau calme, argile et plaques de calcite du plancton se déposent ensemble : les plaques, fabriquées en surface dans une eau sursaturée, tombent au fond. La roche contient 35 à 65 % de calcite."),
    q({}, 3, "L'enfouissement comprime la boue et en expulse l'eau : elle se durcit en marne (de 160 à 100 Ma)."),
    q({}, 4, "Une roche tendre, qui se délite à l'air (badlands des Terres Noires), alterne des lits un peu plus calcaires avec des lits un peu plus argileux."),
  ] };
  // ── enfouissement ──
  const E = (tmax, zmax, seuils, chemin, o) => Object.assign({ type: "enfouissement", tmax, zmax, seuils, chemin }, o || {});
  COND.calcaire = E(175, 2, [], [
    q({ age: 167, z: 0 }, 1, "Coquillages, coraux et algues élaborent leur squelette (de 168 à 166 Ma) dans une mer chaude et peu profonde, sursaturée en calcite."),
    q({ age: 163, z: 0.05 }, 2, "Une fois morts, leurs débris et la boue calcaire recouvrent le fond sur quelques dizaines de mètres (Bathonien)."),
    q({ age: 72, z: 1.5 }, 3, "Sous d'autres couches (Crétacé inférieur, puis craie du Crétacé supérieur), la boue se compacte ; la calcite, qui la cimente dès les premières centaines de mètres, en fait un calcaire (de 163 à 72 Ma).", { bande: "cimentation par la calcite" }),
    q({ age: 40, z: 0.05 }, 4, "La mer de la craie se retire à la fin du Crétacé ; au Cénozoïque, les bordures du Bassin parisien (Bourgogne, Lorraine, Normandie) se soulèvent, l'érosion ôte les couches supérieures et le calcaire se retrouve à l'air libre (de 72 à 40 Ma)."),
    q({ age: 0, z: 0 }, 5, "Lapiaz, pertes, galeries et grottes naissent quand l'eau de pluie chargée de CO₂ attaque le calcaire le long des fissures (depuis 40 Ma)."),
  ], { src: ["plummer"] });
  COND.gres = E(490, 4, ["quartz"], [
    q({}, 1, "Un vieux massif s'altère et se dégrade : feldspaths et micas se transforment en argiles, tandis que le quartz persiste (vers 480 Ma)."),
    q({}, 2, "Les rivières entraînent les grains vers la mer : en chemin, ils s'arrondissent et se classent."),
    q({ age: 470, z: 0.05 }, 3, "À l'Ordovicien (de 478 à 470 Ma), le sable armoricain se dépose sur une plate-forme marine peu profonde."),
    q({ age: 400, z: 2.0 }, 4, "Enfoui vers 2 km sous d'autres couches (≈ 30 m par million d'années), le sable se compacte : ses vides tombent de ≈ 40 % à ≈ 26 %."),
    q({ age: 330, z: 2.6 }, 5, "Pendant des dizaines de millions d'années, au-delà de ≈ 70 à 80 °C, le quartz se dépose autour des grains et les soude : le sable se change en grès.", { bande: "cimentation par le quartz" }),
    q({ age: 300, z: 2.8 }, 6, "Raccourcie et plissée par la collision hercynienne (de 320 à 300 Ma), la série voit sa croûte épaissie se soulever par isostasie ; le fond de la mer émerge alors au-dessus du niveau de l'eau, et la mer se retire."),
    q({ age: 270, z: 0.3 }),
    q({ age: 0, z: 0 }, 7, "Rabotée par l'érosion, la chaîne laisse la croûte, allégée, remonter par isostasie ; le grès affleure et, plus dur que les roches voisines, subsiste en crêtes (Crozon, monts d'Arrée)."),
    q({}, 0, "Près de la surface, des eaux chargées de silice ont cimenté le grès de Fontainebleau."),
  ], { labDroite: true, src: ["paxton", "thiry"] });
  COND.conglomerat = E(9, 0.5, [], [
    q({ age: 8, z: 0 }),
    q({ age: 5, z: 0 }, 1, "Les Alpes s'élèvent : torrents et rivières façonnent des blocs arrondis, puis les étalent en cônes au pied de la chaîne (de 8 à 5 Ma)."),
    q({ age: 2.5, z: 0.3 }, 2, "Au fil du jeu de la faille de la Durance, le bassin s'affaisse : de nouveaux cônes ensevelissent nos galets sous ≈ 350 m de dépôts."),
    q({ age: 1.8, z: 0.35 }, 3, "Vers 20 °C, l'eau qui circule entre les galets précipite de la calcite dans le sable environnant ; les vides se comblent et le gravier se mue en poudingue.", { bande: "cimentation par la calcite" }),
    q({ age: 0, z: 0 }, 4, "La sédimentation prend fin ; la Durance entaille le plateau sur 400 m, et le ruissellement sculpte le poudingue en colonnes : ce sont les Pénitents des Mées (depuis 1,8 Ma)."),
  ], { src: ["valensole"] });
  COND.arkose = E(310, 3, ["quartz"], [
    q({ age: 290, z: 0 }, 1, "Dans une chaîne hercynienne en extension, des bassins s'effondrent le long de failles ; par climat sec, quelques orages arrachent sables et graviers au granite voisin : anguleux, les grains conservent leurs feldspaths (de 300 à 290 Ma)."),
    q({ age: 230, z: 1.8 }, 2, "Enfouis vers 1,8 km (≈ 60 °C) sous d'autres dépôts (grès rouges du Permien, grès et argiles du Trias), ils se compactent."),
    q({ age: 150, z: 1.8 }, 3, "Vers 60 °C, argiles et silice en faible quantité se déposent entre les grains et les soudent : le sable devient arkose, sans atteindre les 70 à 80 °C qui permettraient au quartz de vraiment cimenter.", { bande: "cimentation" }),
    q({ age: 0, z: 0 }, 4, "Pendant des dizaines de millions d'années, la région se soulève et l'érosion ôte les couches supérieures : l'arkose affleure en bordure du Massif central."),
  ]);
  COND.grauwacke = E(575, 8, ["quartz", "anchizone"], [
    q({ age: 560, z: 0 }, 1, "Un séisme, au bord d'un bassin marin profond, déclenche une avalanche sous-marine à sable et boue (courant de turbidité) qui dépose un banc mal classé (Briovérien, vers 560 Ma)."),
    q({ age: 540, z: 0.8 }, 2, "Au fond du bassin s'empilent des centaines de bancs granoclassés, riches en matrice argileuse (de 560 à 540 Ma)."),
    q({ age: 350, z: 7 }, 3, "À 200 à 300 °C, la boue entre les grains, enfouie entre 6 et 7 km sous les dépôts du Paléozoïque, se mue en chlorite et en mica, tandis que les bancs se compactent : très faible métamorphisme (de 540 à 350 Ma)."),
    q({ age: 280, z: 1 }),
    q({ age: 0, z: 0 }, 4, "La collision hercynienne plisse et soulève la série ; rabotée par l'érosion, la chaîne finit par exposer la grauwacke."),
    q({ age: 0, z: 0 }, 5, "Mal classé et sombre, ce grès présente des grains anguleux de quartz et de feldspath noyés dans une matrice verte d'argile et de chlorite."),
  ], { src: ["heezen"] });
  COND.siltite = E(510, 6, ["quartz", "anchizone"], [
    q({}, 1, "Sur un vieux massif, l'altération envoie dans les rivières grains fins de quartz, paillettes de mica et argiles (vers 500 Ma)."),
    q({ age: 466, z: 0.05 }, 2, "Au-delà du sable, en eau plus calme, les limons forment des lits fins : un grain de 20 µm met ≈ 47 minutes à tomber d'un mètre d'eau calme (vers 470 Ma)."),
    q({ age: 350, z: 4.5 }, 3, "Recouverts sur plusieurs kilomètres par d'autres couches, les limons, tassés et cimentés, deviennent une roche dure, la siltite (de 466 à 350 Ma)."),
    q({ age: 270, z: 0.5 }),
    q({ age: 0, z: 0 }, 4, "La collision hercynienne plisse et soulève la série ; l'érosion ronge la chaîne jusqu'à faire affleurer la siltite."),
    q({ age: 0, z: 0 }, 5, "Plaquettes : des lits de limon et d'argile, fins comme du papier, cimentés, forment une roche dure."),
  ], { src: ["ferguson"] });
  COND.molasse = E(32, 2.5, ["quartz"], [
    q({ age: 20, z: 0 }, 1, "Au pied de la chaîne, les Alpes s'élevant, les orages les érodent et les rivières étalent sables et galets (de 30 à 20 Ma)."),
    q({ age: 10, z: 1.3 }, 2, "Sous le poids de la chaîne, la plaque fléchit : le bassin s'enfonce, surtout près de la chaîne, et se remplit sans cesse ; nos sables sont enfouis sous ≈ 1,5 km de débris (de 20 à 8 Ma)."),
    q({ age: 8, z: 1.5 }, 3, "À 1,5 km (≈ 55 °C), la molasse n'est que partiellement cimentée par la calcite : c'est un grès tendre, facile à tailler, qui n'a pas atteint les 70 à 80 °C nécessaires à la soudure des grains par le quartz.", { bande: "cimentation partielle" }),
    q({ age: 0, z: 0 }, 4, "Le bassin ne se comble plus ; les rivières (Isère, Rhône) entaillent la vallée et mettent à découvert la molasse sur ses flancs (depuis 8 Ma)."),
  ]);
  COND.flysch = E(95, 6, ["quartz"], [
    q({ age: 90, z: 0 }, 1, "Quand l'océan se referme, un séisme provoque sur le talus une avalanche sous-marine à sable et boue, qui dépose un banc de sable (vers 90 Ma)."),
    q({ age: 70, z: 1.0 }, 2, "Dans l'intervalle, la boue se dépose lentement : il s'accumule des centaines de couches alternées et régulières (de 90 à 70 Ma)."),
    q({ age: 35, z: 4 }, 3, "Enfouies à plusieurs kilomètres au fond du bassin (≈ 130 °C), les alternances voient le quartz cimenter les bancs de grès (de 70 à 35 Ma)."),
    q({ age: 0, z: 0 }, 4, "Plissées et soulevées par la collision (Alpes, Pyrénées), ces roches sont découpées par l'érosion en falaises et en crêtes."),
    q({ age: 0, z: 0 }, 5, "Des bancs de grès fin, à base nette, alternent avec des lits d'argile ; des traces de vers en méandres marquent la surface des bancs : ce sont les Helminthoïdes."),
  ], { src: ["heezen"] });
  COND.houille = E(330, 8, ["lignite", "subbitumineux", "houille", "anthracite"], [
    q({ age: 315, z: 0 }, 1, "Au Carbonifère supérieur (de 323 à 299 Ma), d'immenses forêts de lycophytes géants (Lepidodendron, Sigillaria), de calamites et de fougères arborescentes croissent dans des marécages équatoriaux ; dans une eau privée d'oxygène, la tourbe s'accumule."),
    q({ age: 305, z: 1.5 }, 2, "Les bassins houillers subissent un enfoncement rapide : la tourbe est recouverte couche par couche et atteint le stade du lignite."),
    q({ age: 295, z: 4.5 }, 3, "Au-delà de ≈ 100 à 200 °C (de 3 à 6 km), la tourbe se déshydrate et perd ses matières volatiles : elle devient houille (Nord, Lorraine, Saint-Étienne)."),
    q({ age: 295, z: 4.5 }, 4, "Charbon noir, aux lits brillants alternant avec des lits mats."),
    q({ age: 270, z: 1.5 }),
    q({ age: 0, z: 0.4 }, 5, "Plissés par la collision hercynienne, les bassins sont ensuite dégagés par l'érosion, qui ôte des kilomètres de roches : la houille, à quelques centaines de mètres de la surface, est exploitée en mine."),
  ]);
  COND.lignite = E(80, 2.5, ["lignite", "subbitumineux"], [
    q({ age: 75, z: 0 }, 1, "Au Campanien (≈ 75 Ma), des forêts marécageuses couvrent le bassin lacustre de Fuveau et Gardanne : la tourbe s'y accumule."),
    q({ age: 60, z: 0.3 }, 2, "Des sédiments recouvrent la tourbe (de 74 à 60 Ma)."),
    q({ age: 30, z: 1.2 }, 3, "Restée sous ≈ 50 °C (≈ 1,2 km), elle ne dépasse pas le stade du lignite : le bois y est encore reconnaissable (de 60 à 30 Ma)."),
    q({ age: 30, z: 1.2 }, 4, "Demeurée tiède, la tourbe n'a perdu qu'un peu de son eau."),
    q({ age: 0, z: 1.0 }, 5, "Les plis de la Provence et l'érosion ramènent la couche à l'affleurement au sud du bassin, à Fuveau ; elle plonge vers le nord : à Gardanne, on l'exploitait à plus de 1 000 m de profondeur (puits Yvon-Morandat), jusqu'en 2003."),
  ]);
  COND.anthracite = E(330, 8, ["lignite", "subbitumineux", "houille", "anthracite"], [
    q({ age: 315, z: 0 }, 1, "Des forêts houillères du Carbonifère (de 320 à 300 Ma) accumulent de la tourbe."),
    q({ age: 305, z: 1.5 }, 2, "Sous des kilomètres de sédiments, la tourbe se trouve enfouie."),
    q({ age: 290, z: 6.6 }, 3, "Au-delà de ≈ 200 °C (≈ 6,5 km), la matière volatile s'échappe presque entièrement : il subsiste un carbone quasi pur."),
    q({ age: 290, z: 6.6 }, 4, "Charbon noir et brillant, presque dépourvu de matière volatile."),
    q({ age: 200, z: 3.5 }), q({ age: 30, z: 1.5 }),
    q({ age: 0, z: 0.3 }, 5, "L'érosion dégage le charbon, exploité à La Mure jusqu'en 1997, après que la formation des Alpes a plissé et soulevé la série."),
  ]);
  COND.schiste_bitumineux = E(190, 5.5, ["huile"], [
    q({ age: 182, z: 0 }, 1, "Au Toarcien (≈ 182 Ma), le plancton se multiplie dans une mer dont le fond est dépourvu d'oxygène."),
    q({ age: 175, z: 0.2 }, 2, "En l'absence d'oxygène au fond, la matière organique ne se détruit pas : la boue devient noire et feuilletée, lit après lit."),
    q({ age: 100, z: 1.6 }, 3, "Ne dépassant pas ≈ 2 km (≈ 60 °C), la roche n'atteint pas la fenêtre à pétrole (≈ 100 à 170 °C) : le kérogène reste intact, et il faut le distiller pour en extraire de l'huile."),
    q({ age: 0, z: 0 }, 4, "Le soulèvement régional et l'érosion ramènent la couche à l'affleurement dans les Causses et au pied des côtes de Moselle ; sous les plateaux lorrains, elle demeure à quelques centaines de mètres de profondeur."),
  ]);
  // ── courant d'eau (Hjulström) ──
  COND.sable = { type: "courant", autres: [{ pts: [[0.002, 60], [0.002, 0.0004]], lab: "argiles : au large" }], chemin: [
    q({ d: 0.2, v: 150 }, 0, "", { lab: "rivière" }),
    q({ d: 0.2, v: 60 }, 1, "L'eau altère les roches des terres émergées : les feldspaths se transforment en argile, tandis que le quartz subsiste sous forme de grains ; les rivières entraînent le tout vers la mer (vers 34 Ma)."),
    q({ d: 0.2, v: 1.5 }, 2, "Sur le littoral, le courant ralentit : sous ≈ 2 cm/s, les grains de sable de 0,2 mm sédimentent et forment des bancs très purs, tandis que les argiles, en suspension, gagnent le large (Rupélien, de 33,9 à 27,3 Ma)."),
    q({}, 3, "Trop peu enfoui et jamais suffisamment chauffé, il reste meuble, n'ayant été recouvert que de quelques dizaines de mètres de calcaires."),
    q({}, 4, "Quartz arrondi et trié, le sable de Fontainebleau laisse ses grains se toucher sans se souder : l'eau circule librement entre eux."),
  ] };
  COND.argile = { type: "courant", autres: [{ pts: [[0.2, 60], [0.2, 1.5]], lab: "sable : près du rivage" }], chemin: [
    q({ d: 0.002, v: 60 }, 0, "", { lab: "rivière" }),
    q({ d: 0.002, v: 20 }, 1, "Sur les terres émergées, l'eau de pluie altère les roches : feldspaths et micas se transforment en minéraux argileux de moins de 2 µm, que les rivières emportent en suspension (vers 56 Ma)."),
    q({ d: 0.002, v: 0.0004 }, 2, "Il faut environ 3 jours à une particule de 2 µm pour tomber d'un mètre d'eau calme (0,0004 cm/s) ; l'argile reste donc longtemps en suspension et se dépose surtout au large, où l'eau reste immobile ; dans l'eau salée, ses paillettes s'agglomèrent en flocons qui tombent plus vite (Yprésien, de 56 à 48 Ma)."),
    q({}, 3, "Recouverte par d'autres couches, la boue perd son eau et se compacte ; peu enfouie, elle reste néanmoins une argile tendre."),
    q({}, 4, "Lits d'argile très fine, parfois un peu plus silteux : roche tendre, plastique à l'état mouillé (argiles des Flandres)."),
  ] };
  COND.alluvions = { type: "courant", autres: [{ pts: [[0.5, 180], [0.5, 5]], lab: "sable" }, { pts: [[0.02, 180], [0.02, 0.02]], lab: "limon" }], chemin: [
    q({ d: 20, v: 250 }, 0, "", { lab: "crue" }),
    q({ d: 20, v: 180 }, 1, "Les versants se dégradent et fournissent des débris de toutes tailles ; en crue, le courant atteint 1 à 2 m/s et la rivière arrache puis roule graviers et galets."),
    q({ d: 20, v: 40 }, 2, "À mesure que le courant faiblit, les grains sédimentent chacun à sa propre vitesse ; graviers de 2 cm au fond du chenal dès ≈ 65 cm/s, sables sur les bancs sous ≈ 7 cm/s, limons seulement à la décrue, en eau presque immobile."),
    q({}, 3, "Des terrasses s'échelonnent (depuis ≈ 2,6 Ma), car la rivière, à chaque cycle glaciaire, comble puis recreuse sa vallée."),
    q({}, 4, "Triés par le courant, roulés, galets, graviers, sables et limons ne sont jamais cimentés (Val de Loire, plaine d'Alsace)."),
  ] };
  COND.colluvions = { type: "courant", chemin: [
    q({ d: 0.05, v: 80 }, 0, "", { lab: "ruissellement" }),
    q({ d: 0.05, v: 15 }, 1, "Le défrichement dénude le sol ; lors des orages, l'eau ruisselle sur la pente et entraîne la terre, les labours aidant (depuis le Néolithique, ≈ 7 000 ans)."),
    q({ d: 0.05, v: 0.1 }, 2, "Le ruissellement ralenti, au pied du versant, étale le sol sur quelques dizaines à centaines de mètres ; le parcours est trop court pour que les grains se classent."),
  ] };
  COND.vase_tangue = { type: "courant", autres: [{ pts: [[0.15, 50], [0.15, 1]], lab: "tangue" }], chemin: [
    q({ d: 0.004, v: 50 }, 0, "", { lab: "courant de marée" }),
    q({ d: 0.004, v: 0.001 }, 1, "Au moment de l'étale, le courant s'arrête : des particules fines, agglomérées en flocons plus rapides à tomber que les particules isolées, se déposent ; apparaissent vasières, puis prés salés (baie du Mont-Saint-Michel)."),
    q({}, 2, "À chaque étale, une fine pellicule de vase se dépose ; lors des marées plus fortes, le sable coquillier, dit tangue, se dépose dès que le courant tombe sous ≈ 1 cm/s : il en résulte une alternance de lits."),
  ] };
  // ── vent ──
  COND.dunes = { type: "vent", chemin: [
    q({ d: 0.3, v: 5 }, 0, "", { lab: "plage" }),
    q({ d: 0.3, v: 40 }, 1, "Dès ≈ 30 km/h, le vent fait sauter par bonds les grains de 0,1 à 0,5 mm prélevés sur les plages : la dune progresse de 1 à 5 m par an (dune du Pilat)."),
    q({ d: 0.3, v: 15 }, 2, "Le vent écarte les graviers (plus de 70 km/h seraient nécessaires pour un grain de 2 mm) et disperse au loin les poussières : le sable des dunes est très bien classé ; sous ≈ 30 km/h, son transport cesse."),
  ] };
  COND.loess = { type: "vent", chemin: [
    q({ d: 0.03, v: 10 }, 1, "Durant la dernière glaciation, sur les marges des glaciers, les eaux de fonte déposent des limons (10 à 60 µm) sur des plaines dénudées et desséchées."),
    q({ d: 0.03, v: 70 }, 2, "Au-delà de ≈ 35 km/h, pour ces grains collants, les vents forts les soulèvent et les maintiennent en suspension : ils se déplacent sur des centaines de kilomètres (de 115 000 à 11 700 ans)."),
    q({ d: 0.03, v: 3 }, 3, "Lorsque le vent tombe sous ≈ 7 km/h, freiné par l'herbe de la steppe, les limons retombent en couches de plusieurs mètres (collines du Kochersberg, Alsace)."),
  ] };
  // ── climat ──
  const K = (villes, domaines, labDomaines, chemin, o) => Object.assign({ type: "climat", villes, domaines, labDomaines, chemin }, o || {});
  COND.tourbe = K(["Brest", "Mont Aigoual", "Chamonix", "Paris"], [[-2, 13, 1, 2.5]], ["tourbières hautes"], [
    q({ T: 7, ai: 1.6 }, 1, "Là où les précipitations excèdent l'évapotranspiration (rapport supérieur à 1), sous climat frais, le sol demeure gorgé d'eau : les sphaignes y prospèrent (Jura, monts d'Arrée)."),
    q({ T: 7, ai: 1.6 }, 2, "Stagnante, acide et dépourvue d'oxygène, l'eau bloque toute décomposition : environ un millimètre de végétaux morts s'accumule chaque année depuis la fin de la dernière glaciation (11 700 ans)."),
    q({}, 0, "Sous climat plus sec, des tourbières basses peuvent aussi se développer, alimentées par une nappe."),
  ], { src: ["charman"] });
  COND.alterite = K(["Brest", "Clermont-Ferrand"], [[5, 30, 0.65, 2.5]], ["altération par hydrolyse"], [
    q({ T: 24, ai: 1.3 }, 1, "Sous climat tropical humide (de 66 à 23 Ma, au Paléogène), l'altération creuse dans les granites des profils épais de plusieurs dizaines de mètres."),
    q({ T: 24, ai: 1.3 }, 2, "L'eau infiltrée hydrolyse feldspaths et biotite en argiles, alors que le quartz demeure intact."),
    q({ T: 12, ai: 0.96 }, 3, "À Rennes aujourd'hui (12 °C, pluie ≈ évapotranspiration), l'arénisation se poursuit, mais plus lentement : beaucoup de profils sont hérités."),
    q({ T: 12, ai: 0.96 }, 4, "Il subsiste du granite le quartz, des feldspaths partiellement altérés et des micas, pris dans des argiles d'altération : un sable grossier qui se désagrège sous la main."),
  ]);
  COND.terra_rossa = K(["Marseille", "Nice"], [[13, 18, 0.45, 0.9]], ["terra rossa"], [
    q({ T: 15.1, ai: 0.55 }, 1, "À Montpellier (15,1 °C ; pluie égale à 55 % de l'évapotranspiration, étés secs), sous climat méditerranéen, l'eau dissout le calcaire, et les impuretés, de 2 à 5 %, restent sur place."),
    q({ T: 15.1, ai: 0.55 }, 2, "Dissoudre des dizaines de mètres de calcaire ne donne qu'un seul mètre d'argile ; les étés secs favorisent l'hématite, qui la colore en rouge (du Néogène à aujourd'hui)."),
    q({ T: 15.1, ai: 0.55 }, 3, "Des nodules d'oxydes de fer et quelques grains résiduels forment une argile rouge : ce sont les impuretés du calcaire dissous."),
  ]);
  COND.argile_silex = K([], [[10, 22, 0.65, 2]], ["dissolution de la craie"], [
    q({ T: 17, ai: 1.1 }, 1, "Sous un climat plus chaud et plus humide qu'aujourd'hui, les pluies du Néogène (de 23 à 2,6 Ma) attaquent la craie des plateaux."),
    q({ T: 12.7, ai: 0.77 }, 2, "La calcite passe en solution, tandis que silex et argiles, insolubles, demeurent en place : la dissolution se poursuit sous le climat actuel (Paris : 12,7 °C ; pluie égale à 77 % de l'évapotranspiration)."),
    q({ T: 12.7, ai: 0.77 }, 3, "Silex entiers ou brisés, emballés dans une argile brun-rouge : tout l'insoluble de la craie coiffe les plateaux du pays de Caux."),
  ]);
  COND.laterite = K(["Toulouse"], [[22, 30, 0.65, 1.8]], ["cuirasses\nlatéritiques"], [
    q({ T: 25, ai: 1.1 }, 1, "Pendant le Paléogène (de 66 à 34 Ma), le Sud-Ouest subit un climat tropical à saison sèche : sur des dizaines de mètres, la pluie entraîne cations et silice."),
    q({ T: 25, ai: 1.1 }, 2, "Les saisons sèches transforment en cuirasse les oxydes de fer et d'aluminium insolubles qui s'accumulent."),
    q({ T: 13.7, ai: 0.98 }, 3, "À Bordeaux aujourd'hui (13,7 °C, pluie ≈ évapotranspiration), le climat ne permet plus de telles formations : ces cuirasses sont fossiles."),
  ]);
  COND.bauxite = K([], [[22, 30, 1, 2.5]], ["bauxites"], [
    q({ T: 26, ai: 1.7 }, 1, "Pendant le Crétacé « moyen » (de 125 à 90 Ma), la Provence reçoit un climat tropical et très arrosé (plus de 22 °C, pluie supérieure à l'évapotranspiration) : l'eau, qui ne cesse de traverser le sol, emporte d'abord les cations, puis la silice des argiles."),
    q({ T: 26, ai: 1.7 }, 2, "Ne subsistent que les hydroxydes d'aluminium (gibbsite) et de fer : la formation d'une bauxite exige des millions d'années."),
    q({ T: 15.9, ai: 0.42 }, 3, "Le climat actuel de Marseille (15,9 °C ; pluie égale à 42 % de l'évapotranspiration) est trop sec : les bauxites des Baux-de-Provence ont été formées sous un autre climat."),
  ], { src: ["bardossy"] });
  COND.moraine = K(["Chamonix"], [], [], [
    q({ T: 2, ai: 0.86 }, 1, "Au Würm, la France est plus froide de 10 à 12 °C qu'aujourd'hui : le glacier du Rhône s'étend des Alpes jusqu'aux portes de Lyon ; à sa base, il arrache des blocs, les traîne et réduit la roche en farine."),
    q({ T: 12.8, ai: 0.86 }, 2, "Le réchauffement fait fondre le glacier, qui recule par à-coups (fin du Würm, jusqu'à 11 700 ans) ; chaque pause laisse un arc de moraine."),
    q({ T: 12.8, ai: 0.86 }, 3, "Blocs, cailloux et farine de roche sans aucun classement : à la différence de l'eau et du vent, la glace ne classe pas (Lyon aujourd'hui : 12,8 °C)."),
  ], { note: "On ignore le rapport pluie ÷ évapotranspiration du Würm : le glacier est donc placé à la valeur actuelle de Lyon, seule la température étant décalée.", src: ["dmg"] });
  COND.eboulis = K(["Chamonix"], [[-5, 8, 0.5, 2.5]], ["climat froid :\ngel et dégel"], [
    q({ T: 2, ai: 0.9 }, 1, "Durant la dernière glaciation (10 à 12 °C de moins qu'aujourd'hui), la succession de gel et de dégel occupe une bonne partie de l'année ; les fissures, élargies par l'eau gelée, libèrent des fragments qui s'amoncellent au pied des falaises (grèzes de Charente, Causses)."),
    q({ T: 5.2, ai: 2.0 }, 2, "Encore aujourd'hui, à Chamonix (5,2 °C), le gel fait éclater les parois ; les talus alpins, actifs, anguleux, mal classés et non cimentés le montrent ; cimentés, ils deviendraient brèche. Les grèzes de Charente, elles, sont fossiles."),
  ], { note: "On connaît mal le rapport pluie ÷ évapotranspiration de la dernière glaciation : le premier point ne donne que la température.", src: ["dmg"] });
  COND.tillite = K([], [], [], [
    q({ T: -40, ai: 1.25 }, 1, "Vers 640 Ma, la Terre est presque entièrement gelée, jusqu'à un équateur aussi froid que l'Antarctique actuel : sur la plate-forme d'Otavi (Namibie), la glace avance, arrache des blocs, les traîne et réduit la roche en farine ; là où elle flotte, elle libère tout pêle-mêle.", { lab: "Terre gelée" }),
    q({ T: 45, ai: 1.25 }, 2, "Vers 635 Ma, un basculement climatique intervient : le CO₂ accumulé par les volcans pendant la glaciation réchauffe brusquement la planète ; la glace fond, la mer submerge la moraine, et des calcaires de mer chaude s'y déposent aussitôt.", { lab: "effet de serre extrême" }),
    q({}, 3, "Sous le poids d'autres couches, la moraine voit ses blocs, son sable et sa farine se tasser, et l'eau s'échapper (de 635 à 540 Ma)."),
    q({}, 4, "La moraine s'est durcie en tillite : elle renferme blocs et graviers de toutes tailles, dont certains rayés par la glace, pris dans une pâte de farine de roche."),
  ], { note: "Les deux climats dépassent l'échelle de l'atlas : les points sont placés au bord du diagramme. Une Terre gelée n'a pas de sens pour le rapport pluie ÷ évapotranspiration : les points sont donc posés à mi-hauteur.", src: ["ghaub", "hoffman1998"] });

  // ─────────────────────────────── 7. installation ───────────────────────────────
  F._fc2 = { DIAG, COND, COURBES, graphique, axes, chemin, etiquette, etiquettesChemin, autour, leLong, courbe, polygone, bande, rendre, legende, largeur, echelle, D, nb, esc, pt };
  Object.assign(SOURCES, {
    french1998: "Métamorphisme de choc : French B. M. (1998), <i>Traces of Catastrophe</i>, Lunar and Planetary Institute, contribution 954, fig. 4.1 et tableau 4.2 (d'après Stöffler 1971 et 1984) : pression de l'onde et température qui reste après son passage, pour une roche cristalline dense ; métamorphisme ordinaire sous 3–5 GPa et 1 000 °C.",
    graniteSec: "Le solidus du granite, mesuré avec de l'eau de 0,05 à 1 GPa, rejoint à faible profondeur, faute d'eau sous pression, celui du granite sec (≈ 950 °C) : ce prolongement, en tirets, n'est qu'indicatif.",
    echelleRacine: "Diagrammes pression-température des roches magmatiques : l'échelle verticale suit la racine carrée de la pression, ce qui dilate les premiers kilomètres, où se déroule l'essentiel des étapes.",
    gradients: "Traits fins en pointillés : températures atteintes en profondeur avec un gradient de 10, 30 ou 60 °C par kilomètre (subduction froide, collision, voisinage d'un magma).",
    geotherme: "Géotherme moyen : 10 °C à la surface, avec un gradient de 30 °C par kilomètre.",
    etapes: "Les chemins sont schématiques : chaque pastille indique l'état où l'on se trouve à la fin de l'étape de même numéro dans l'animation (pastilles juxtaposées pour les étapes aux mêmes conditions ; numéro cerclé dans la liste pour une étape sans emplacement propre sur le diagramme).",
    millero2008: "Composition de l'eau de mer : Millero F. J. et al. (2008), <i>Deep-Sea Research I</i> 55, 50. Par litre d'eau : de quoi former 1,84 g de gypse (limité par le calcium), 28,4 g de halite et 0,79 g de sylvite ; magnésium ÷ calcium ≈ 5 (en moles).",
    saumurePalier: "Passé un seuil, la concentration cesse de croître : l'apport supplémentaire cristallise (tracé simplifié en palier ; en réalité, le calcium décroît un peu après le gypse, le sodium après le sel). Gypse dans l'eau pure : ≈ 2,4 g/L à 25 °C.",
    anhydriteCalc: "Courbe gypse ⇄ anhydrite : Hardie (1967) situe la transition à 58 °C dans l'eau pure et à 18 °C dans une saumure saturée en sel ; entre ces deux valeurs, l'atlas calcule la courbe (équation de van 't Hoff) à partir de l'activité de l'eau d'une eau de mer concentrée (≈ 0,98 à × 1, 0,93 à × 3,8, 0,75 à × 10,6).",
    mgcaCalc: "Rapport magnésium ÷ calcium de la saumure : l'atlas le calcule en supposant constant le produit de solubilité du gypse et en négligeant les coefficients d'activité (ordre de grandeur : ≈ 5 dans l'eau de mer, ≈ 10 à × 6, ≈ 28 à × 10,6).",
    lindsay1979: "Ca₅(PO₄)₃OH + 7 H⁺ = 5 Ca²⁺ + 3 H₂PO₄⁻ + H₂O : l'hydroxyapatite présente un log K de 14,46 (Lindsay W. L. 1979, <i>Chemical Equilibria in Soils</i>, Wiley). L'atlas calcule la courbe pour 100 mg de calcium par litre, en négligeant les coefficients d'activité.",
    mucci1983: "Saturation de la calcite : produit de solubilité de Mucci A. (1983), <i>American Journal of Science</i> 283, 780, corrigé de la pression (Millero F. J. 1995, <i>Geochimica et Cosmochimica Acta</i> 59, 661), pour 10,28 mmol de calcium par kg (≈ 42 µmol/kg d'ion carbonate en surface, ≈ 90–100 vers 4 km) ; calcul de l'atlas.",
    broecker1982: "Ion carbonate mesuré : profil schématique de l'Atlantique actuel, ≈ 230 µmol/kg en surface et ≈ 110 en profondeur (Broecker W. S. et Peng T.-H. 1982, <i>Tracers in the Sea</i>, Lamont-Doherty) ; le Pacifique, plus pauvre (≈ 70–80), dissout la calcite moins profond.",
    zhang1961: "Mise en mouvement des grains : formule de Zhang Ruijin (1961), valable des argiles cohésives aux galets, U = (h/d)^0,14 [17,6 (ρs − ρ)/ρ d + 6,05 × 10⁻⁷ (10 + h)/d^0,72]^0,5 (unités du système international), calculée pour 1 m d'eau.",
    hjulstrom: "Diagramme de Hjulström F. (1935), <i>Bulletin of the Geological Institution of the University of Upsala</i> 25, 221 ; courbes recalculées par l'atlas : mise en mouvement (Zhang 1961) ; dépôt quand le courant tombe sous la vitesse de chute du grain (Ferguson et Church 2004).",
    shaolu2000: "Vent : seuil de mise en mouvement de Shao Y. et Lu H. (2000), <i>Journal of Geophysical Research</i> 105, 22 437 ; un grain reste en suspension tant que le vent dépasse sa vitesse de chute (Bagnold R. A. 1941, <i>The Physics of Blown Sand and Desert Dunes</i>) ; vitesse du vent à 10 m calculée pour un sol sableux nu (rugosité 0,1 mm).",
    dmg: "Au dernier maximum glaciaire (vers 21 000 ans), les températures moyennes annuelles de la France étaient inférieures de 10 à 12 °C aux actuelles (Wikipédia, « Dernier maximum glaciaire »).",
    hoffman1998: "« Terre boule de neige » et calcaires de fin de glaciation : Hoffman P. F., Kaufman A. J., Halverson G. P. et Schrag D. P. (1998), <i>Science</i> 281, 1342.",
  });
  const courbesMagma = (c) => c.courbes || (c.echelle === "croute" ? ["graniteEau", "peridotite"] : c.echelle === "profond" ? ["peridotite", "diamant"] : ["peridotite"]);
  const SRC_DIAG = {
    magma: (c) => [...courbesMagma(c).map((n) => COURBES[n] && COURBES[n].src), courbesMagma(c).includes("graniteEau") ? "graniteSec" : null, "profondeur", "echelleRacine"],
    meta: (c) => [...(c.courbes || []).map((n) => COURBES[n] && COURBES[n].src), "facies", "profondeur", c.gradients ? "gradients" : null, c.anatexie ? "tuttle" : null, (c.courbes || []).includes("graniteEau") || c.anatexie ? "graniteSec" : null],
    faille: () => ["scholz", "geotherme", "profondeur"],
    choc: () => ["french1998"],
    saumure: () => ["mccaffrey", "warren", "millero2008", "saumurePalier"],
    anhydrite: () => ["hardie", "anhydriteCalc", "gradient"],
    mgca: () => ["millero2008", "mccaffrey", "adams", "mgcaCalc"],
    silice: (c) => ["fournier", "rimstidt", "odp", "treguer", (c.tmax || 120) > 100 ? "siliceChaud" : null],
    calcite: () => ["plummer"],
    apatite: () => ["lindsay1979", "quercy"],
    mer: () => ["mucci1983", "broecker1982", "ccd"],
    ehph: () => ["pourbaix"],
    enfouissement: (c) => ["gradient", ...(c.seuils || []).map((n) => SEUILS_ENF[n] && SEUILS_ENF[n].src)],
    climat: () => ["h5", "safran"],
    courant: () => ["hjulstrom", "zhang1961", "ferguson"],
    vent: () => ["shaolu2000"],
  };
  F._fc2.SRC_DIAG = SRC_DIAG;
  function installer(id, c) {
    const f = ROCHES_F[id];
    if (!f) { console.warn("formation-conditions : roche inconnue", id); return; }
    f.cond = c;
    f.animCurseur = c.curseur || "arrivee";
    const cles = (SRC_DIAG[c.type] ? SRC_DIAG[c.type](c) : []).concat(c.src || [], ["etapes"]).filter(Boolean);
    f.src = [...new Set([...(f.src || []), ...cles])];
  }
  for (const [id, c] of Object.entries(COND)) installer(id, c);
  F._fc2.installer = installer;
  F._fc2.COND = COND;

  function rendreCond(cond, objet) {
    const f = DIAG[cond && cond.type];
    if (!f) return null;
    return `<div class="fc fc2">${f(cond, objet || { nom: "" })}${cond.note ? `<p class="fc-note">${cond.note}</p>` : ""}</div>`;
  }
  // anciens formats (fiches minéraux, F.3) → nouveaux diagrammes, quand le type a été refait
  const CONVERSIONS = {
    pt: (c) => {
      const ch = c.chemin.map((p) => Object.assign({}, p));
      if (c.bande) { const i = ch.map((p) => !!p.n).lastIndexOf(true); if (i > 0) ch[i].bande = "cristallisation"; }
      const etq = (c.etiquettes || []).filter(([n]) => !COURBES[n] && ["andalousite", "sillimanite", "disthène", "graphite stable", "diamant stable"].includes(n));
      return c.champs === "facies" ? Object.assign({}, c, { type: "meta", chemin: ch, etiquettes: etq }) : Object.assign({}, c, { type: "magma", fondu: c.fondu, courbes: c.courbes, chemin: ch, etiquettes: etq });
    },
  };
  CONVERSIONS.carbonates = (c) => Object.assign({}, c, { type: "mer", chemin: c.chemin.map((p) => Object.assign({}, p, { z: p.z })) });
  CONVERSIONS.evaporation = (c) => {
    const sel = /^sel gemme/.test(c.couche || "") ? "halite" : /^sels de potassium/.test(c.couche || "") ? "sylvite" : "gypse", S = SELS[sel];
    return Object.assign({}, c, { type: "saumure", sels: [sel], chemin: c.chemin.map((p) => {
      if (p.an == null) return Object.assign({}, p);
      const F = 1 / (1 - Math.min(p.an, 5) / 5.03);
      return Object.assign({}, p, { F, C: S.c0 * Math.min(F, S.F) });
    }) });
  };
  F._fc2.CONVERSIONS = CONVERSIONS;
  F.conditions = function (roche) {
    const f = ROCHES_F[roche.id];
    if (f && f.cond && DIAG[f.cond.type]) return rendreCond(f.cond, roche);
    return ANCIEN.conditions ? ANCIEN.conditions(roche) : null;
  };
  F.diagramme = function (cond, objet) {
    if (!cond) return null;
    if (DIAG[cond.type]) return rendreCond(cond, objet);
    if (CONVERSIONS[cond.type]) { const c2 = CONVERSIONS[cond.type](cond); if (c2 && DIAG[c2.type]) return rendreCond(c2, objet); }
    return ANCIEN.diagramme ? ANCIEN.diagramme(cond, objet) : null;
  };
  F.sourcesDe = function (conds, extra) {
    const cles = [];
    const anciennes = ANCIEN.sourcesDe ? ANCIEN.sourcesDe : null;
    for (const c0 of [].concat(conds || []).filter(Boolean)) {
      const c = DIAG[c0.type] ? c0 : CONVERSIONS[c0.type] ? CONVERSIONS[c0.type](c0) : c0;
      if (SRC_DIAG[c.type]) cles.push(...SRC_DIAG[c.type](c).filter(Boolean));
      else if (anciennes) { for (const s of anciennes([c0])) cles.push(s); continue; }
      if (c.src) cles.push(...c.src);
    }
    cles.push(...(extra || []));
    return [...new Set(cles)].map((k) => SOURCES[k] || (typeof k === "string" && k.length > 40 ? k : null)).filter(Boolean);
  };
  F._fc2.rendreCond = rendreCond;
  F._fc2.ANCIEN = ANCIEN;
})();
