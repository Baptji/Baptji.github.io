'use strict';
/* Machines qui sortent de la ferme, roulent sur les routes, font leur tâche au champ et reviennent ; relais de trois
   tracteurs et bennes pour le grain ; règles de circulation (sens unique dans la cour, deux voies sur les chemins,
   un véhicule à la fois à la porte de la grange et au vidage, cédez-le-passage en s'engageant sur la route).
   Repris de la maquette (maquettes/visuels-3d/commun.js : trace, conduite, devant), en coordonnées du monde
   (x, z en cases ; un point est [x, z, r?] ; cap = atan2(dz, dx)). */

const Flotte = (() => {
  // ---------- Trajets : des droites raccordées par des arcs de cercle ----------
  // Tronçons { pts, r, recul, attendre, cedez } : chaque coin est arrondi (rayon r, réduit si les côtés sont courts) ;
  // entre deux tronçons, arrêt et départ dans l'autre sens (recul : marche arrière) ; attendre() bloque le départ du
  // tronçon ; cedez : [{ pt, tant() }] arrêts en cours de route.
  function trace(troncons) {
    const el = [], arrets = []; let L = 0;
    troncons.forEach(tr => {
      const P = tr.pts.filter((p, i) => !i || Math.hypot(p[0] - tr.pts[i - 1][0], p[1] - tr.pts[i - 1][1]) > 1e-4), n = P.length, sens = tr.recul ? -1 : 1, d = [], len = [], t = new Array(n).fill(0), rr = new Array(n).fill(0), e0 = el.length;
      if (tr.attendre) arrets.push({ s: L, tant: tr.attendre });
      for (let i = 0; i < n - 1; i++) { const dx = P[i + 1][0] - P[i][0], dy = P[i + 1][1] - P[i][1], l = Math.hypot(dx, dy) || 1e-9; len.push(l); d.push([dx / l, dy / l]); }
      for (let i = 1; i < n - 1; i++) {
        const th = Math.acos(Math.max(-1, Math.min(1, d[i - 1][0] * d[i][0] + d[i - 1][1] * d[i][1])));
        if (th < 1e-3) continue;
        const r = P[i][2] != null ? P[i][2] : tr.r != null ? tr.r : 0.4, lim = Math.min(i === 1 ? len[0] : len[i - 1] / 2, i === n - 2 ? len[i] : len[i] / 2);
        t[i] = Math.min(r * Math.tan(th / 2), lim); rr[i] = t[i] / Math.tan(th / 2);
      }
      let x = P[0][0], y = P[0][1];
      for (let i = 0; i < n - 1; i++) {
        const [dx, dy] = d[i], ex = P[i + 1][0] - dx * t[i + 1], ey = P[i + 1][1] - dy * t[i + 1], l = Math.hypot(ex - x, ey - y);
        if (l > 1e-6) { el.push({ arc: false, s0: L, L: l, x, y, dx, dy, sens }); L += l; }
        x = ex; y = ey;
        if (i < n - 2 && t[i + 1] > 0) {
          const [bx, by] = d[i + 1], g = Math.sign(dx * by - dy * bx), r = rr[i + 1], cx = x - dy * g * r, cy = y + dx * g * r;
          const th = Math.acos(Math.max(-1, Math.min(1, dx * bx + dy * by)));
          el.push({ arc: true, s0: L, L: r * th, cx, cy, r, f0: Math.atan2(y - cy, x - cx), g, sens }); L += r * th;
          x = P[i + 1][0] + bx * t[i + 1]; y = P[i + 1][1] + by * t[i + 1];
        }
      }
      (tr.cedez || []).forEach(c => {
        let best = null;
        for (let k = e0; k < el.length; k++) { const e = el[k]; if (e.arc) continue;
          const u = (c.pt[0] - e.x) * e.dx + (c.pt[1] - e.y) * e.dy; if (u < -1e-6 || u > e.L + 1e-6) continue;
          const dd = Math.hypot(e.x + e.dx * u - c.pt[0], e.y + e.dy * u - c.pt[1]); if (!best || dd < best.d) best = { d: dd, s: e.s0 + u }; }
        if (best && best.d < 0.6) arrets.push({ s: best.s, tant: c.tant, quand: c.quand });
      });
      arrets.push({ s: L, rebrousse: true });
    });
    arrets.sort((a, b) => a.s - b.s);
    const p0 = troncons[0].pts[0];
    let k = 0;
    function pose(s) {
      s = Math.max(0, Math.min(L, s));
      if (!el.length) return { x: p0[0], y: p0[1], cap: 0, recul: false };
      if (el[k].s0 > s) k = 0;
      while (k < el.length - 1 && el[k].s0 + el[k].L < s) k++;
      const e = el[k], u = s - e.s0; let x, y, cap;
      if (e.arc) { const f = e.f0 + e.g * u / e.r; x = e.cx + e.r * Math.cos(f); y = e.cy + e.r * Math.sin(f); cap = f + e.g * Math.PI / 2; }
      else { x = e.x + e.dx * u; y = e.y + e.dy * u; cap = Math.atan2(e.dy, e.dx); }
      if (e.sens < 0) cap += Math.PI;
      return { x, y, cap: Math.atan2(Math.sin(cap), Math.cos(cap)), recul: e.sens < 0 };
    }
    return { L, el, arrets, pose };
  }
  // ---------- Conduite : accélère, ralentit avant les virages, s'arrête aux arrêts, garde ses distances ----------
  function conduite(tr, o = {}) {
    return { tr, s: 0, v: 0, pause: 0, fini: tr.L < 1e-6, vmax: o.vmax || 1, acc: o.acc || 1, frein: o.frein || 2, alat: o.alat || 1, tempo: o.tempo == null ? 0.6 : o.tempo, passes: new Set(), but: Infinity };
  }
  function conduire(c, dt, gene = Infinity) {
    const tr = c.tr; if (c.fini) { c.v = 0; return; }
    if (c.pause > 0) { c.pause -= dt; c.v = 0; return; }
    const b = c.frein, s = c.s; let stop = null;
    const portee = c.vmax * c.vmax / (2 * b) + 0.4;                       // un arrêt ne compte qu'à portée de freinage
    for (const a of tr.arrets) {
      if (c.passes.has(a) || a.s < s - 1e-6) continue;
      if (a.rebrousse) { stop = a; break; }
      if (a.s - s > portee) continue;
      if (a.tant()) { stop = a; break; }
      if (a.s - s < 0.25) { c.passes.add(a); a.quand?.(); }      // la voie était libre au moment de s'engager
    }
    const fin = Math.min(stop.s, c.but);
    let lim = Math.min(c.vmax, Math.sqrt(2 * b * Math.max(0, fin - s)));
    for (const e of tr.el) {
      if (!e.arc || e.s0 + e.L < s) continue;
      if (e.s0 - s > c.vmax * c.vmax / (2 * b) + 0.1) break;
      lim = Math.min(lim, Math.sqrt(c.alat * e.r + 2 * b * Math.max(0, e.s0 - s)));
    }
    if (gene < Infinity) lim = Math.min(lim, Math.sqrt(2 * b * Math.max(0, gene - 0.08)));
    c.v = Math.min(c.v + c.acc * dt, lim);
    c.s = Math.min(s + c.v * dt, fin);
    if (c.s >= stop.s - 1e-6 && stop.rebrousse) {
      c.s = stop.s; c.v = 0; c.passes.add(stop);
      if (stop.s >= tr.L - 1e-6) c.fini = true; else c.pause = c.tempo;
    }
  }
  // ---------- Ce qui roule s'inscrit pour que chacun garde ses distances ----------
  const mobiles = new Map();
  const inscrire = (id, genre, boites) => mobiles.set(id, { id, genre, boites });
  const desinscrire = id => mobiles.delete(id);
  // Place libre devant une pose ({ x, y : z, cap }), av : du centre à l'avant, w : demi-largeur ; filtre(mobile, écart de cap)
  function devant(id, pose, av, w, portee = 2.5, filtre) {
    let g = Infinity; const c = Math.cos(pose.cap), s = Math.sin(pose.cap);
    mobiles.forEach(m => {
      if (m.id === id) return;
      for (const bx of m.boites()) {
        const dc = bx.cap - pose.cap; if (filtre && !filtre(m, dc)) continue;
        const dx = bx.x - pose.x, dy = bx.y - pose.y, lon = dx * c + dy * s, lat = -dx * s + dy * c;
        const ca = Math.abs(Math.cos(dc)), sa = Math.abs(Math.sin(dc)), el = ca * bx.l + sa * bx.w, ew = sa * bx.l + ca * bx.w;
        if (lon - el <= 0 || Math.abs(lat) >= w + ew) continue;          // garé à côté (ou derrière) : pas devant
        const e = lon - el - av; if (e < portee) g = Math.min(g, Math.max(0, e));
      }
    });
    return g;
  }
  // Quelqu'un (de ce genre) dans un rayon autour d'un point ?
  function presDe(pt, r, genre, sauf) {
    for (const m of mobiles.values()) { if (m.id === sauf || (genre && m.genre !== genre)) continue; for (const bx of m.boites()) if (Math.hypot(bx.x - pt[0], bx.y - pt[1]) < r) return true; }
    return false;
  }
  // Décale une ligne brisée vers la droite du sens de marche (voie de droite) ; les extrémités restent en place
  function aDroite(pts, off) {
    if (pts.length < 3) return pts;
    return pts.map((p, i) => {
      if (i === 0 || i === pts.length - 1) return p;
      const a = pts[i - 1], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
      return [p[0] - dz / l * off, p[1] + dx / l * off, p[2]];
    });
  }
  // Abscisse (s) du point du trajet le plus proche de pt, sur les droites
  function abscisse(tr, pt) {
    let best = null;
    for (const e of tr.el) { if (e.arc) continue;
      const u = Math.max(0, Math.min(e.L, (pt[0] - e.x) * e.dx + (pt[1] - e.y) * e.dy)), d = Math.hypot(e.x + e.dx * u - pt[0], e.y + e.dy * u - pt[1]);
      if (!best || d < best.d) best = { d, s: e.s0 + u }; }
    return best ? best.s : 0;
  }
  return { trace, conduite, conduire, inscrire, desinscrire, devant, presDe, aDroite, abscisse, mobiles };
})();
