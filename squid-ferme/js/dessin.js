'use strict';
/* Dessin en pixels fins : une case fait 48 × 48 pixels d'art, affichés à un pixel d'écran sur un écran Retina.
   Les plantes sont dessinées dans des vignettes de 48 × 64 (16 pixels de marge au-dessus pour les cultures hautes),
   selon un stade de pousse continu p (0 à 1), une variante (0 à 2) et une inclinaison due au vent s (−2 à 2). */

const T = 48, MARGE = 16;

// ---------- Outils de dessin ----------
function hasard(a, b, k) {
  let h = (a * 374761393 + b * 668265263 + k * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function P(g, x, y, c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
function disque(g, cx, cy, r, c) {
  g.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); g.fillRect(cx - w, cy + dy, 2 * w + 1, 1); }
}
function ellipse(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  for (let dy = -ry; dy <= ry; dy++) { const w = Math.round(rx * Math.sqrt(1 - (dy * dy) / (ry * ry))); g.fillRect(cx - w, cy + dy, 2 * w + 1, 1); }
}
function ligne(g, x0, y0, x1, y1, c) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  g.fillStyle = c;
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1);
}
const _rgb = new Map();
function rgb(c) {
  let v = _rgb.get(c);
  if (!v) {
    if (c[0] === '#') { const n = parseInt(c.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    else v = c.match(/\d+/g).slice(0, 3).map(Number);
    _rgb.set(c, v);
  }
  return v;
}
const hex = (r, g, b) => '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
const _teintes = new Map();
function teinte(c, f) {            // f < 1 assombrit, f > 1 éclaircit
  const k = c + f; let v = _teintes.get(k);
  if (!v) {
    const [r, g, b] = rgb(c), m = x => Math.max(0, Math.min(255, Math.round(f < 1 ? x * f : x + (255 - x) * (f - 1))));
    v = hex(m(r), m(g), m(b)); _teintes.set(k, v);
  }
  return v;
}
function melange(a, b, t) {
  const A = rgb(a), B = rgb(b), m = i => Math.round(A[i] * (1 - t) + B[i] * t);
  return hex(m(0), m(1), m(2));
}
const OMBRE = 'rgba(30,18,8,.30)';

// ---------- Saisons ----------
// Couleurs de l'herbe interpolées jour après jour entre quatre saisons (jour de l'année).
const SAISONS = [
  [15, { h: '#8a9f74', c: '#a3b691', p: '#e6ece6', f: '#cfd8cc' }],
  [110, { h: '#69ab49', c: '#8bc863', p: '#f4e36a', f: '#f8f4ec' }],
  [196, { h: '#7ea645', c: '#9ebf59', p: '#e2452f', f: '#f2d24a' }],
  [290, { h: '#94984c', c: '#b0a85a', p: '#c9763a', f: '#e0a050' }],
];
function interpSaison(doy, table, f) {
  let i = table.length - 1;
  for (let k = 0; k < table.length; k++) if (doy >= table[k][0]) i = k;
  const [d0, a] = table[i], [d1b, b] = table[(i + 1) % table.length];
  const d1 = d1b <= d0 ? d1b + 365 : d1b, d = doy < d0 ? doy + 365 : doy;
  return f(a, b, clamp01((d - d0) / (d1 - d0)));
}
function couleursSaison(doy, sec) {
  let s = interpSaison(doy, SAISONS, (a, b, t) => ({ h: melange(a.h, b.h, t), c: melange(a.c, b.c, t), p: t < 0.5 ? a.p : b.p, f: t < 0.5 ? a.f : b.f }));
  if (sec > 0) s = { ...s, h: melange(s.h, '#c2ae62', sec), c: melange(s.c, '#d4c27a', sec) };
  return s;
}
const FEUILLAGES = [
  [20, ['#6f6650', '#8a7f62', '#5a523f']],
  [110, ['#4f8f3f', '#72b454', '#3a6a30']],
  [180, ['#3f7436', '#58924a', '#2f5a2a']],
  [285, ['#9a7a2a', '#c9a03a', '#6a5a2a']],
  [330, ['#7a6448', '#9a8058', '#5a4a36']],
];
function couleursFeuillage(doy) {
  return interpSaison(doy, FEUILLAGES, (a, b, t) => a.map((c, i) => melange(c, b[i], t)));
}

// ---------- Herbe ----------
function herbe(g, X, Y, tx, ty, s, haute) {
  const base = haute ? s.c : s.h, autre = haute ? s.h : s.c, sombre = teinte(base, 0.9);
  R(g, X, Y, T, T, base);
  for (let i = 0; i < 5; i++) ellipse(g, X + 5 + (hasard(tx, ty, i + 400) * 38 | 0), Y + 4 + (hasard(tx, ty, i + 410) * 40 | 0), 3 + (i % 3), 2, sombre);
  for (let i = 0; i < 46; i++) {
    const x = hasard(tx, ty, i) * 46 | 0, y = 2 + (hasard(tx, ty, i + 60) * 45 | 0);
    R(g, X + x, Y + y - 2, 1, 2, autre);
    if (i % 3 === 0) P(g, X + x + 1, Y + y - 1, teinte(autre, 0.86));
  }
  const n = hasard(tx, ty, 99) < 0.4 ? 1 + (hasard(tx, ty, 98) * 3 | 0) : 0;
  for (let i = 0; i < n; i++) {
    const x = X + 3 + (hasard(tx, ty, i + 90) * 41 | 0), y = Y + 3 + (hasard(tx, ty, i + 94) * 41 | 0), col = hasard(tx, ty, i + 97) < 0.5 ? s.p : s.f;
    P(g, x, y + 1, '#5a8a3a'); P(g, x - 1, y, teinte(col, 0.86)); P(g, x + 1, y, teinte(col, 0.86)); P(g, x, y - 1, teinte(col, 1.2)); P(g, x, y, col);
  }
}

// ---------- Terre ----------
// o : { mo, sec (0-1), residus, couvert, goutte, givre, fum, chaume (0-1) }
function terre(g, X, Y, tx, ty, o, echelle) {
  const riche = clamp01((o.mo - 0.8) / 3.5);
  const fond = melange('#a67c50', '#5c3c22', riche), sillon = melange('#8a6440', '#432a12', riche), clair = melange('#b88e60', '#80583a', riche);
  if (echelle === 'planches') {
    R(g, X, Y, T, T, '#7e9a50');
    for (let i = 0; i < 12; i++) R(g, X + (hasard(tx, ty, i + 5) * 46 | 0), Y + (hasard(tx, ty, i + 9) * 46 | 0), 1, 2, '#93ae62');
    R(g, X + 3, Y + 3, T - 6, T - 6, sillon);
    R(g, X + 4, Y + 3, T - 8, T - 7, fond);
    R(g, X + 4, Y + 3, T - 8, 1, clair);
    for (let i = 0; i < 18; i++) P(g, X + 5 + (hasard(tx, ty, i + 7) * 38 | 0), Y + 5 + (hasard(tx, ty, i + 17) * 37 | 0), i % 2 ? clair : sillon);
  } else {
    R(g, X, Y, T, T, fond);
    for (let y = 2; y < T; y += 6) { R(g, X, Y + y, T, 1, sillon); R(g, X, Y + y + 1, T, 1, teinte(fond, 0.94)); R(g, X, Y + y - 1, T, 1, teinte(fond, 1.06)); }
    for (let i = 0; i < 16; i++) {
      const x = hasard(tx, ty, i + 7) * 46 | 0, y = hasard(tx, ty, i + 17) * 46 | 0;
      R(g, X + x, Y + y, 2, 1, clair); P(g, X + x, Y + y + 1, sillon);
    }
    if (hasard(tx, ty, 33) < 0.5) { const x = X + 4 + (hasard(tx, ty, 34) * 40 | 0), y = Y + 4 + (hasard(tx, ty, 35) * 40 | 0); R(g, x, y, 2, 2, '#c8c0b0'); P(g, x, y, '#e8e2d6'); }
  }
  if (o.sec > 0) { g.fillStyle = `rgba(222,196,150,${(o.sec * 0.42).toFixed(2)})`; g.fillRect(X, Y, T, T); }
  if (o.sec > 0.5) for (let i = 0; i < 5; i++) {
    let x = X + 6 + (hasard(tx, ty, i + 700) * 34 | 0), y = Y + 6 + (hasard(tx, ty, i + 710) * 34 | 0);
    for (let j = 0; j < 7; j++) { P(g, x, y, '#6a4a2a'); x += hasard(tx, ty, i * 9 + j) < 0.5 ? 1 : 0; y += 1; if (j === 3) { P(g, x + 1, y, '#6a4a2a'); P(g, x + 2, y + 1, '#6a4a2a'); } }
  }
  if (o.chaume > 0) {
    const a = o.chaume, col = melange('#b89a5a', '#e2c886', a), so = melange('#8a7448', '#b09a5a', a);
    for (let y = 4; y < T; y += 6) for (let x = (y >> 1) % 3; x < T; x += 3) if (hasard(tx, ty, x * 7 + y) < 0.35 + a * 0.6) { P(g, X + x, Y + y, col); P(g, X + x, Y + y + 1, so); }
  }
  if (o.residus) for (let i = 0; i < 28; i++) R(g, X + (hasard(tx, ty, i + 600) * 44 | 0), Y + (hasard(tx, ty, i + 620) * 47 | 0), 3 + (i % 3), 1, i % 2 ? '#c9a95e' : '#a88a48');
  if (o.fum) for (let i = 0; i < 22; i++) { const x = X + (hasard(tx, ty, i + 60) * 45 | 0), y = Y + (hasard(tx, ty, i + 70) * 46 | 0); R(g, x, y, 3, 2, '#3a2414'); P(g, x + 1, y, '#5a3a20'); }
  if (o.couvert) {
    for (let i = 0; i < 90; i++) {
      const x = hasard(tx, ty, i + 800) * 45 | 0, y = hasard(tx, ty, i + 840) * 45 | 0;
      R(g, X + x, Y + y, 2, 2, i % 4 ? '#5d9a45' : '#86bf62'); if (i % 5 === 0) P(g, X + x + 1, Y + y - 1, '#a8d880');
    }
    for (let i = 0; i < 8; i++) { const x = X + 2 + (hasard(tx, ty, i + 900) * 43 | 0), y = Y + 2 + (hasard(tx, ty, i + 910) * 43 | 0); P(g, x, y, i % 2 ? '#a088d8' : '#f2e050'); P(g, x + 1, y, i % 2 ? '#8a70c8' : '#e2c840'); }
  }
  if (o.goutte) for (const x of [14, 33]) { R(g, X + x, Y + 4, 1, T - 8, '#2a2a2a'); for (let y = 8; y < T - 6; y += 8) P(g, X + x + 1, Y + y, '#4a6a8a'); }
  if (o.givre) for (let i = 0; i < 26; i++) P(g, X + (hasard(tx, ty, i + 950) * 47 | 0), Y + (hasard(tx, ty, i + 970) * 47 | 0), i % 3 ? '#eef6fb' : '#ffffff');
}

// ---------- Plantes ----------
// Touffe ombrée : ombre portée, masse sombre, masse claire, reflet
function touffe(g, x, cy, r, coul, clair, reflet) {
  ellipse(g, x + 1, cy + r, r, Math.max(1, Math.round(r / 3)), OMBRE);
  disque(g, x, cy, r, teinte(coul, 0.78));
  disque(g, x - (r > 2 ? 1 : 0), cy - (r > 2 ? 1 : 0), Math.max(0, r - 1), coul);
  if (r >= 3) disque(g, x - 1, cy - 2, r - 3, clair);
  if (reflet && r >= 3) P(g, x - r + 2, cy - r + 2, reflet);
}
// n colonnes × m rangées de plantes : centre en x, pied en y
function grille(n, m, f) {
  const px = T / n, py = T / m;
  for (let r = 0; r < m; r++) for (let q = 0; q < n; q++) f(Math.round(px * (q + 0.5)), Math.round(py * (r + 1)) - 1, r * n + q);
}
// Juste après le semis : lignes de semis, graines, puis premières pousses
function levee(g, x0, y0, p, rnd, pas) {
  for (let y = 4; y < T; y += pas) {
    R(g, x0, y0 + y, T, 1, 'rgba(40,24,10,.28)');
    for (let x = (y * 7) % 5; x < T; x += 5) P(g, x0 + x, y0 + y, '#d8b878');
  }
  if (p > 0.01) for (let y = 4; y < T; y += pas) for (let x = 1; x < T; x += 3) if (rnd(x + y * 7) < p * 20) { P(g, x0 + x, y0 + y - 1, '#7cbf52'); if (p > 0.035) P(g, x0 + x, y0 + y - 2, '#9ad86a'); }
}

function cereale(g, x0, y0, c, k, p, rnd, s, style) {
  if (p < 0.06) return levee(g, x0, y0, p, rnd, 6);
  const lin = style === 'lin';
  const H = Math.round(2 + (lin ? 10 : 9) * Math.min(1, p / 0.62));
  const mur = clamp01((p - 0.74) / 0.26);
  const vert = p < 0.3 ? k.f : melange(k.f, k.c, Math.min(1, (p - 0.3) / 0.45));
  const tige = mur > 0 ? melange(vert, k.m, mur) : vert, sombre = teinte(tige, 0.76), clair = teinte(tige, 1.2);
  const tete = mur > 0 ? melange(k.c, k.a, Math.min(1, mur * 1.4)) : teinte(k.c, 1.05);
  for (let row = 0; row < 8; row++) {
    const base = y0 + 5 + row * 6;
    R(g, x0, base + 1, T, 1, OMBRE);
    for (let x = row % 2; x < T; x += 2) {
      const i = row * 31 + x, h = Math.max(1, Math.round(H * (0.8 + rnd(i) * 0.4)));
      const xx = x0 + x, dx = Math.round(s * h / (H + 2)), bas = Math.ceil(h * 0.55), col = i % 3 ? tige : sombre;
      R(g, xx, base - bas + 1, 1, bas, col);
      if (h > bas) R(g, xx + (dx > 0 ? Math.ceil(dx / 2) : Math.floor(dx / 2)), base - h + 1, 1, h - bas, col);
      if (p > 0.18 && h > 3 && i % 2 === 0) P(g, xx + (i % 4 ? 1 : -1), base - (h >> 1), clair);
      if (p <= 0.52) continue;
      const ex = xx + dx, ey = base - h - 2;
      if (style === 'avoine') { P(g, ex, ey, tete); P(g, ex - 1, ey + 1, tete); P(g, ex + 1, ey + 2, teinte(tete, 0.9)); P(g, ex - 1, ey + 3, teinte(tete, 0.85)); }
      else if (lin) {
        if (p < 0.77) { if (rnd(i + 7) < 0.55) { P(g, ex, ey + 1, k.a); P(g, ex + 1, ey + 1, teinte(k.a, 1.3)); P(g, ex, ey, teinte(k.a, 0.85)); } }
        else P(g, ex, ey + 1, mur > 0.3 ? '#b89a58' : '#8aa860');
      } else {
        R(g, ex, ey, 1, 3, tete); P(g, ex, ey, teinte(tete, 1.25));
        if (mur > 0.5) P(g, ex, ey + 2, teinte(tete, 0.82));
        if (c.id === 'orge') { const d = dx >= 0 ? 1 : -1; P(g, ex + d, ey - 1, teinte(tete, 1.2)); P(g, ex + 2 * d, ey - 2, teinte(tete, 1.35)); }
        else if (c.id === 'seigle') P(g, ex, ey - 1, teinte(tete, 0.88));
      }
    }
  }
  if (!lin && p > 0.55 && p < 0.92) for (let i = 0; i < 3; i++) if (rnd(300 + i) < 0.4) {
    const x = x0 + 3 + (rnd(310 + i) * 41 | 0), y = y0 + 4 + (rnd(320 + i) * 40 | 0) - H;
    P(g, x, y + 2, '#4a7a2a'); P(g, x, y, '#e63c26'); P(g, x + 1, y, '#c42a18'); P(g, x, y + 1, '#c42a18'); P(g, x + 1, y + 1, '#f05a3a');
  }
}

function rampant(g, x0, y0, c, k, p, rnd, type) {
  if (p < 0.05) return levee(g, x0, y0, p, rnd, 24);
  const n = Math.round(2 + 10 * Math.min(1, p / 0.6));
  for (let i = 0; i < 6; i++) if (p > 0.3) ligne(g, x0 + 4 + (rnd(i + 80) * 40 | 0), y0 + 4 + (rnd(i + 90) * 40 | 0), x0 + 4 + (rnd(i + 100) * 40 | 0), y0 + 4 + (rnd(i + 110) * 40 | 0), teinte(k.f, 0.85));
  for (let i = 0; i < n; i++) {
    const x = x0 + 5 + (rnd(i) * 38 | 0), y = y0 + 6 + (rnd(i + 20) * 36 | 0);
    touffe(g, x, y, p > 0.4 ? 4 : 2, k.f, k.c, null); P(g, x - 1, y - 1, teinte(k.c, 1.25)); P(g, x + 1, y + 1, teinte(k.f, 0.8));
  }
  if (p > 0.4 && p < 0.8) for (let i = 0; i < 3; i++) {
    const x = x0 + 8 + (rnd(i + 50) * 32 | 0), y = y0 + 8 + (rnd(i + 60) * 30 | 0);
    P(g, x, y, k.a); P(g, x + 1, y, teinte(k.a, 1.2)); P(g, x, y + 1, teinte(k.a, 0.85)); P(g, x - 1, y, teinte(k.a, 0.85));
  }
  if (p <= 0.66) return;
  const m = clamp01((p - 0.66) / 0.34);
  [[14, 30], [32, 16], [30, 38]].slice(0, type === 'potiron' ? 2 : 3).forEach(([fx, fy]) => {
    const x = x0 + fx, y = y0 + fy;
    if (type === 'courgette') { R(g, x - 4, y + 1, 9, 1, OMBRE); R(g, x - 4, y - 2, 8, 3, k.m); R(g, x - 4, y - 2, 8, 1, teinte(k.m, 1.35)); P(g, x + 4, y - 1, '#c9a040'); }
    else if (type === 'potiron') {
      const r = Math.round(2 + 4 * m), col = melange('#7aa848', k.m, m), cs = teinte(col, 0.8);
      ellipse(g, x + 1, y + r, r + 1, 1, OMBRE); ellipse(g, x, y, r + 1, r, col);
      R(g, x - (r >> 1), y - r + 1, 1, 2 * r - 1, cs); R(g, x + (r >> 1), y - r + 1, 1, 2 * r - 1, cs);
      P(g, x - r + 1, y - 1, teinte(col, 1.3)); R(g, x, y - r - 1, 1, 2, '#6a5a2a');
    } else {
      const r = Math.round(2 + 2 * m), col = melange('#8ab85a', k.m, m);
      ellipse(g, x + 1, y + r, r, 1, OMBRE); disque(g, x, y, r, col); P(g, x - 1, y - 1, teinte(col, 1.3));
      if (m > 0.5) { P(g, x + 1, y, teinte(col, 0.8)); P(g, x - 1, y + 1, teinte(col, 0.8)); }
    }
  });
}

const FORMES = {
  epi(g, x0, y0, c, k, p, rnd, s) { cereale(g, x0, y0, c, k, p, rnd, s, 'epi'); },
  avoine(g, x0, y0, c, k, p, rnd, s) { cereale(g, x0, y0, c, k, p, rnd, s, 'avoine'); },
  lin(g, x0, y0, c, k, p, rnd, s) { cereale(g, x0, y0, c, k, p, rnd, s, 'lin'); },
  mais(g, x0, y0, c, k, p, rnd, s, sorgho) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 12);
    const H = Math.round(3 + 25 * Math.min(1, p / 0.66)), mur = clamp01((p - 0.8) / 0.2);
    const tige = mur > 0 ? melange(k.f, '#b8a468', mur) : k.f, feuille = mur > 0 ? melange(k.c, '#d0bc84', mur) : k.c, fs = teinte(feuille, 0.76);
    grille(4, 4, (cx, base, n) => {
      const x = x0 + cx + Math.round(rnd(n) * 2 - 1), b = y0 + base, h = Math.round(H * (0.88 + rnd(n + 20) * 0.24));
      const dx = i => Math.round(s * (i / h) * (i / h));
      ellipse(g, x + 2, b + 1, 4, 1, OMBRE);
      for (let i = 0; i < h; i++) { P(g, x + dx(i), b - i, tige); if (h > 10 && i < h - 3) P(g, x + 1 + dx(i), b - i, teinte(tige, 0.82)); }
      for (let hy = 3; hy < h - 2; hy += 4) {
        const d = (hy >> 2) % 2 ? 1 : -1, L = Math.min(7, 2 + ((h - hy) >> 2)), ox = x + dx(hy) + (d > 0 ? 1 : 0);
        for (let j = 1; j <= L; j++) { const yy = b - hy - (j <= L / 2 ? 1 : 0) + (j >= L - 1 ? 1 : 0); P(g, ox + d * j, yy, feuille); P(g, ox + d * j, yy + 1, fs); }
      }
      const tx = x + dx(h), ty = b - h;
      if (p > 0.58) {
        if (sorgho) { ellipse(g, tx, ty - 2, 2, 3, mur > 0 ? melange('#a8b85a', k.a, mur) : '#a8b85a'); P(g, tx - 1, ty - 4, teinte(k.a, 1.25)); P(g, tx + 1, ty - 1, teinte(k.a, 0.8)); }
        else { R(g, tx, ty - 3, 1, 3, '#dcc878'); for (const [a, b2] of [[-1, -2], [1, -2], [-2, -1], [2, -1]]) P(g, tx + a, ty + b2, '#c8a85a'); }
      }
      if (!sorgho && p > 0.64) {
        const cy = b - Math.round(h * 0.48), cx2 = x + 2 + dx(h >> 1);
        R(g, cx2, cy, 2, 5, mur > 0.3 ? '#cdb878' : '#9cc86a'); P(g, cx2 + 1, cy - 1, '#b8904a'); P(g, cx2, cy - 2, '#b8904a');
        if (mur > 0.6) P(g, cx2 + 1, cy + 1, k.a);
      }
    });
  },
  sorgho(g, x0, y0, c, k, p, rnd, s) { FORMES.mais(g, x0, y0, c, k, p, rnd, s, true); },
  tournesol(g, x0, y0, c, k, p, rnd, s) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 12);
    const H = Math.round(3 + 24 * Math.min(1, p / 0.6)), mur = clamp01((p - 0.82) / 0.18);
    const tige = mur > 0 ? melange(k.f, '#8a7a3a', mur) : k.f, feuille = mur > 0 ? melange(k.c, '#9a8a4a', mur) : k.c;
    grille(4, 4, (cx, base, n) => {
      const x = x0 + cx, b = y0 + base, h = Math.round(H * (0.9 + rnd(n) * 0.2)), dx = i => Math.round(s * (i / h) ** 2);
      ellipse(g, x + 2, b + 1, 4, 1, OMBRE);
      for (let i = 0; i < h; i++) P(g, x + dx(i), b - i, tige);
      for (let hy = 3; hy < h - 3; hy += 5) {
        const d = ((hy / 5) | 0) % 2 ? 1 : -1, lx = x + dx(hy) + d * 3;
        ellipse(g, lx, b - hy, 3, 2, feuille); R(g, lx - 2, b - hy + 1, 5, 1, teinte(feuille, 0.75)); P(g, lx - d, b - hy - 1, teinte(feuille, 1.2));
      }
      const tx = x + dx(h), ty = b - h - 2;
      if (p >= 0.42 && p < 0.6) { disque(g, tx, ty, 2, '#6a9a3a'); P(g, tx - 1, ty - 1, '#8aba5a'); }
      else if (p >= 0.6 && p < 0.84) {
        disque(g, tx, ty, 4, k.m);
        for (const [a, b2] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, 3]]) P(g, tx + a, ty + b2, teinte(k.m, 1.25));
        disque(g, tx, ty, 2, k.a); P(g, tx - 1, ty - 1, teinte(k.a, 1.5));
      } else if (p >= 0.84) { disque(g, tx, ty + 1, 3, melange('#6a4a1a', '#3a2a14', mur)); R(g, tx - 3, ty + 1, 7, 1, '#8a6a2a'); P(g, tx, ty - 1, '#9a7a3a'); }
    });
  },
  topi(g, x0, y0, c, k, p, rnd, s) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 12);
    const H = Math.round(3 + 26 * Math.min(1, p / 0.62)), mur = clamp01((p - 0.88) / 0.12);
    const tige = mur > 0 ? melange(k.f, '#7a6a3a', mur) : k.f;
    grille(5, 4, (cx, base, n) => {
      const x = x0 + cx, b = y0 + base, h = Math.round(H * (0.85 + rnd(n) * 0.3)), dx = i => Math.round(s * (i / h) ** 2);
      R(g, x - 1, b, 3, 1, OMBRE);
      for (let i = 0; i < h; i++) P(g, x + dx(i), b - i, tige);
      if (!mur) for (let hy = 2; hy < h - 1; hy += 3) { const d = hy % 2 ? 1 : -2; R(g, x + dx(hy) + d, b - hy, 2, 1, hy % 2 ? k.c : teinte(k.c, 0.8)); }
      if (p > 0.7 && p < 0.92) { const tx = x + dx(h), ty = b - h - 1; P(g, tx, ty - 1, k.a); P(g, tx - 1, ty, k.a); P(g, tx + 1, ty, k.a); P(g, tx, ty + 1, k.a); P(g, tx, ty, '#8a5a1a'); }
    });
  },
  colza(g, x0, y0, c, k, p, rnd, s) {
    if (p < 0.04) return levee(g, x0, y0, p, rnd, 6);
    if (p < 0.5) {
      const r = Math.round(1 + 3 * p / 0.5);
      grille(6, 6, (cx, base, n) => { const x = x0 + cx + Math.round(rnd(n) * 2 - 1), cy = y0 + base - r - 1; touffe(g, x, cy, r, k.f, k.c, null); if (r >= 3) P(g, x - 1, cy - 1, teinte(k.c, 1.25)); });
      return;
    }
    const q = (p - 0.5) / 0.5, H = Math.round(4 + 12 * Math.min(1, q / 0.45)), mur = clamp01((p - 0.9) / 0.1);
    const seche = clamp01((p - 0.82) / 0.18), tige = p >= 0.8 ? melange(k.f, '#9a8a50', seche) : k.f;
    const feuille = p >= 0.8 ? melange(k.c, '#8a8048', seche) : k.c, gousse = mur > 0 ? melange('#8aa848', '#a89a5a', mur) : melange('#7aa040', '#8aa848', seche);
    for (let row = 0; row < 8; row++) {
      const base = y0 + 5 + row * 6;
      R(g, x0, base + 1, T, 1, OMBRE);
      for (let q2 = 0; q2 < 9; q2++) {
        const n = row * 9 + q2, x = x0 + 2 + q2 * 5 + (row % 2 ? 2 : 0) + Math.round(rnd(n) * 2 - 1), h = Math.round(H * (0.85 + rnd(n + 50) * 0.3));
        const dx = i => Math.round(s * (i / h) ** 2);
        // feuillage : une masse feuillue à mi-hauteur qui couvre le sol
        ellipse(g, x + dx(h >> 1), base - (h >> 1), 2, 2, teinte(feuille, 0.8)); P(g, x - 1 + dx(h >> 1), base - (h >> 1) - 1, feuille);
        for (let i = 0; i < h; i++) P(g, x + dx(i), base - i, tige);
        P(g, x - 2, base - 1, feuille); P(g, x + 2, base - 2, teinte(feuille, 0.85));
        const tx = x + dx(h), ty = base - h;
        if (p < 0.6) R(g, tx - 1, ty - 2, 3, 2, '#9ab84a');
        else if (p < 0.8) { R(g, tx - 2, ty - 3, 5, 4, k.a); R(g, tx - 1, ty - 4, 3, 1, teinte(k.a, 1.3)); P(g, tx - 2, ty, teinte(k.a, 0.8)); P(g, tx + 2, ty - 1, teinte(k.a, 0.85)); P(g, tx - 1, ty - 3, teinte(k.a, 1.15)); }
        else { R(g, tx - 2, ty - 3, 5, 3, teinte(gousse, 0.82)); for (const [a, b] of [[-2, -4], [0, -5], [2, -4], [-1, -2], [1, -3]]) P(g, tx + a, ty + b, gousse); }
      }
    }
  },
  rosette(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 12);
    const r = Math.round(1 + 4 * Math.min(1, p / 0.8));
    grille(4, 4, (cx, base) => {
      const x = x0 + cx, cy = y0 + base - r - 1;
      touffe(g, x, cy, r, k.f, p >= 1 ? k.a : k.c, r >= 3 ? teinte(k.a, 1.3) : null);
      if (c.id === 'laitue' && r >= 3) {
        for (let a = 0; a < 8; a++) P(g, x + Math.round(Math.cos(a * 0.8) * (r + 0.5)), cy + Math.round(Math.sin(a * 0.8) * r), teinte(k.f, 0.72));
        disque(g, x, cy - 1, r - 2, k.a); P(g, x - 1, cy - 2, teinte(k.a, 1.3));
      }
      if (c.id === 'epinard' && r >= 3) { for (let a = 0; a < 5; a++) ellipse(g, x + Math.round(Math.cos(a * 1.26) * (r - 1)), cy + Math.round(Math.sin(a * 1.26) * (r - 1)), 1, 2, k.m); P(g, x, cy, teinte(k.a, 1.2)); }
    });
  },
  chou(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 16);
    const r = Math.round(1 + 6 * Math.min(1, p / 0.7)), fleur = c.id === 'choufleur';
    grille(3, 3, (cx, base, n) => {
      const x = x0 + cx, cy = y0 + base - r - 1;
      touffe(g, x, cy, r, k.f, fleur ? k.c : k.a, null);
      for (let a = 0; a < 7; a++) { const ang = a * 0.9 + n; P(g, x + Math.round(Math.cos(ang) * r), cy + Math.round(Math.sin(ang) * (r - 1)), teinte(k.f, 0.74)); }
      if (p > 0.55) {
        const rr = Math.round(1 + 3 * clamp01((p - 0.55) / 0.4));
        disque(g, x, cy, rr, fleur ? k.m : k.c); P(g, x - 1, cy - 1, '#ffffff');
        if (fleur) { P(g, x + 1, cy, k.a); P(g, x - 1, cy + 1, k.a); } else R(g, x - rr + 1, cy + 1, rr * 2 - 1, 1, teinte(k.c, 0.85));
      }
    });
  },
  choufleur(g, x0, y0, c, k, p, rnd) { FORMES.chou(g, x0, y0, c, k, p, rnd); },
  artichaut(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 16);
    const r = Math.round(2 + 6 * Math.min(1, p / 0.6));
    grille(3, 3, (cx, base) => {
      const x = x0 + cx, cy = y0 + base - r;
      touffe(g, x, cy, r, k.f, k.c, null);
      for (let a = 0; a < 9; a++) { const ang = a * 0.7; P(g, x + Math.round(Math.cos(ang) * (r + 1)), cy + Math.round(Math.sin(ang) * r), teinte(k.f, 0.78)); P(g, x + Math.round(Math.cos(ang) * (r - 1)), cy + Math.round(Math.sin(ang) * (r - 2)), teinte(k.c, 1.15)); }
      if (p > 0.6) {
        R(g, x, cy - r - 2, 1, r, k.m); ellipse(g, x, cy - r - 4, 2, 3, k.m); P(g, x - 1, cy - r - 5, teinte(k.m, 1.3)); R(g, x - 1, cy - r - 3, 3, 1, teinte(k.m, 0.8));
        if (p >= 1) { P(g, x, cy - r - 8, k.a); R(g, x - 1, cy - r - 7, 3, 1, k.a); }
      }
    });
  },
  racine(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 6);
    const H = Math.round(1 + 8 * Math.min(1, p / 0.6)), fin = c.id === 'carotte' || c.id === 'panais';
    grille(4, 4, (cx, base) => {
      const x = x0 + cx, b = y0 + base;
      ellipse(g, x + 1, b + 1, 4, 1, OMBRE);
      if (fin) {
        for (let f = -3; f <= 3; f++) {
          const h = H - Math.abs(f);
          for (let i = 1; i <= h; i++) {
            const px = x + Math.round(f * i / 3), py = b - i;
            if ((i + f) % 2 === 0 || i === h) P(g, px, py, (f + i) % 3 ? k.f : k.c);
            if (i > 2 && i % 2 === 0) P(g, px + (f >= 0 ? 1 : -1), py, teinte(k.c, 1.12));
          }
        }
      } else {
        for (let f = -2; f <= 2; f++) {
          const h = H - Math.abs(f);
          for (let i = 1; i <= h; i++) P(g, x + Math.round(f * i / 2.5), b - i, i <= 2 && c.id === 'betterave' ? k.a : k.f);
          ellipse(g, x + f * 2, b - h, 1 + (H > 5), 1 + (H > 6), f % 2 ? k.c : k.f);
        }
      }
      if (p > 0.85) { R(g, x - 1, b - 1, 3, 2, k.m); P(g, x - 1, b - 1, teinte(k.m, 1.25)); P(g, x + 1, b, teinte(k.m, 0.8)); }
    });
  },
  betsucre(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 12);
    const r = Math.round(1 + 5 * Math.min(1, p / 0.5));
    grille(4, 4, (cx, base, n) => {
      const x = x0 + cx, cy = y0 + base - r - 1;
      touffe(g, x, cy, r, k.f, k.c, null);
      for (let a = 0; a < 6; a++) { const ang = a * 1.05 + rnd(n) * 2; P(g, x + Math.round(Math.cos(ang) * (r + 1)), cy + Math.round(Math.sin(ang) * r), k.a); }
      if (r >= 4) { P(g, x - 1, cy - 1, teinte(k.c, 1.3)); P(g, x + 1, cy, teinte(k.c, 1.3)); }
      if (p >= 0.95) { ellipse(g, x, y0 + base - 1, 2, 1, k.m); P(g, x - 1, y0 + base - 1, '#ffffff'); }
    });
  },
  bulbe(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 6);
    const H = Math.round(2 + 9 * Math.min(1, p / 0.6)), couche = p > 0.9;
    grille(4, 4, (cx, base) => {
      const x = x0 + cx, b = y0 + base;
      ellipse(g, x + 1, b + 1, 3, 1, OMBRE);
      const col = couche ? melange(k.f, k.c, 0.7) : k.f, cl = teinte(col, 1.2), so = teinte(col, 0.75);
      if (!couche) {
        R(g, x - 2, b - H + 2, 1, H - 2, so); R(g, x, b - H, 1, H, col); R(g, x + 2, b - H + 1, 1, H - 1, col);
        P(g, x, b - H, cl); P(g, x + 1, b - H + 3, cl); if (H > 4) R(g, x - 1, b - H + 4, 1, H - 4, col);
      } else for (let i = 0; i < 7; i++) { P(g, x + i - 1, b - 2 - (i >> 2), col); P(g, x - i + 1, b - 3 - (i >> 1), so); }
      if (p > 0.82) { ellipse(g, x, b - 1, 3, 2, k.m); P(g, x - 2, b - 2, teinte(k.m, 1.3)); R(g, x, b - 4, 1, 2, teinte(k.m, 0.8)); P(g, x + 1, b, k.a); }
    });
  },
  poireau(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 8);
    const H = Math.round(2 + 11 * Math.min(1, p / 0.7));
    grille(5, 4, (cx, base) => {
      const x = x0 + cx, b = y0 + base;
      ellipse(g, x + 1, b + 1, 3, 1, OMBRE);
      if (p > 0.3) { R(g, x - 1, b - 3, 3, 3, k.m); P(g, x - 1, b - 3, '#ffffff'); }
      for (let i = 0; i < H; i++) { const w = Math.round(i / 3.2); P(g, x - w, b - 3 - i, k.f); P(g, x + w, b - 3 - i, teinte(k.f, 0.8)); if (i % 3 === 1) P(g, x, b - 3 - i, k.c); }
    });
  },
  pdt(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) { for (let y = 6; y < T; y += 12) { R(g, x0, y0 + y, T, 3, 'rgba(60,36,16,.25)'); R(g, x0, y0 + y - 1, T, 1, 'rgba(255,230,190,.12)'); } return levee(g, x0, y0, p, rnd, 12); }
    const r = Math.round(1 + 5 * Math.min(1, p / 0.55)), mur = clamp01((p - 0.82) / 0.18);
    const f = mur > 0 ? melange(k.f, '#a8984a', mur) : k.f, cl = mur > 0 ? melange(k.c, '#c8b86a', mur) : k.c;
    grille(4, 4, (cx, base, n) => {
      const x = x0 + cx + Math.round(rnd(n) * 2 - 1), cy = y0 + base - r - 1;
      touffe(g, x, cy, r, f, cl, null);
      for (let i = 0; i < 5; i++) { const a = rnd(n * 10 + i) * 6.28; P(g, x + Math.round(Math.cos(a) * (r + 1)), cy + Math.round(Math.sin(a) * r), teinte(f, 0.82)); }
      if (p > 0.48 && p < 0.74) for (let i = 0; i < 3; i++) {
        const fx = x - 2 + (rnd(n * 7 + i + 30) * 5 | 0), fy = cy - r + 1 + (rnd(n * 7 + i + 40) * 3 | 0);
        P(g, fx, fy, k.a); P(g, fx + 1, fy, teinte(k.a, 0.85)); P(g, fx, fy + 1, '#f2d24a');
      }
    });
  },
  tomate(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 24);
    const H = Math.round(3 + 18 * Math.min(1, p / 0.6));
    for (let row = 0; row < 2; row++) for (let q = 0; q < 4; q++) {
      const x = x0 + 6 + q * 12, b = y0 + 22 + row * 24, j = q * 9 + row * 40;
      ellipse(g, x + 1, b + 1, 5, 1, OMBRE);
      if (p > 0.2) { R(g, x + 3, b - H - 2, 1, H + 2, '#a07a4a'); P(g, x + 3, b - H - 2, '#c89a68'); }
      for (let hy = 1; hy <= H; hy += 3) { const w = p > 0.5 ? 3 : 2; R(g, x - w, b - hy - 1, 2 * w + 1, 2, k.f); R(g, x - w, b - hy, 2 * w + 1, 1, teinte(k.f, 0.78)); R(g, x - w + 1, b - hy - 2, w, 1, k.c); }
      if (p > 0.55) for (let i = 0; i < 4; i++) {
        const fx = x - 3 + (rnd(j + i) * 7 | 0), fy = b - 2 - (rnd(j + i + 20) * (H - 3) | 0), col = melange(k.a, k.m, clamp01((p - 0.75) / 0.25));
        R(g, fx, fy, 2, 2, col); P(g, fx, fy, teinte(col, 1.35));
      }
    }
  },
  courgette(g, x0, y0, c, k, p, rnd) { rampant(g, x0, y0, c, k, p, rnd, 'courgette'); },
  courge(g, x0, y0, c, k, p, rnd) { rampant(g, x0, y0, c, k, p, rnd, 'potiron'); },
  melon(g, x0, y0, c, k, p, rnd) { rampant(g, x0, y0, c, k, p, rnd, 'melon'); },
  fraise(g, x0, y0, c, k, p, rnd) {
    for (let i = 0; i < 70; i++) R(g, x0 + (rnd(i + 400) * 46 | 0), y0 + (rnd(i + 460) * 47 | 0), 2, 1, i % 3 ? '#d8c078' : '#b89a50');
    if (p < 0.05) return;
    const r = Math.round(1 + 3 * Math.min(1, p / 0.5));
    grille(4, 4, (cx, base) => {
      const x = x0 + cx, cy = y0 + base - r - 2;
      touffe(g, x, cy, r, k.f, k.c, null);
      if (p > 0.4 && p < 0.78) { P(g, x + 1, cy - 1, k.a); P(g, x - 2, cy + 1, k.a); }
      if (p > 0.72) {
        const col = melange('#e8e0a0', k.m, clamp01((p - 0.72) / 0.28));
        R(g, x + 2, cy + 1, 2, 2, col); R(g, x - 3, cy + 2, 2, 2, col); P(g, x + 2, cy + 1, teinte(col, 1.3)); P(g, x - 2, cy + 3, teinte(col, 0.7));
      }
    });
  },
  legume(g, x0, y0, c, k, p, rnd) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 8);
    const r = Math.round(1 + 3 * Math.min(1, p / 0.6)), sec = ['haricot', 'lentille', 'poischiche', 'soja'].includes(c.id);
    const mur = sec ? clamp01((p - 0.82) / 0.18) : 0;
    const f = mur > 0 ? melange(k.f, k.m, mur) : k.f, cl = mur > 0 ? melange(teinte(k.f, 1.2), teinte(k.m, 1.15), mur) : teinte(k.f, 1.2);
    grille(6, 6, (cx, base, n) => {
      const x = x0 + cx + Math.round(rnd(n) * 2 - 1), cy = y0 + base - r - 1;
      touffe(g, x, cy, r, f, cl, null);
      if (p > 0.48 && p < 0.75) { P(g, x - 1, cy - r + 1, k.c); P(g, x + 1, cy - 1, k.c); }
      if (p > 0.72) { P(g, x - 2, cy + 1, k.a); P(g, x - 2, cy + 2, k.a); P(g, x + 2, cy, k.a); P(g, x + 2, cy + 1, teinte(k.a, 0.85)); }
    });
  },
  feverole(g, x0, y0, c, k, p, rnd, s) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 8);
    const H = Math.round(2 + 12 * Math.min(1, p / 0.62)), mur = clamp01((p - 0.82) / 0.18);
    const tige = mur > 0 ? melange(k.f, '#3a2a1a', mur) : k.f, fe = mur > 0 ? melange(teinte(k.f, 1.18), '#5a4a3a', mur) : teinte(k.f, 1.18);
    grille(5, 4, (cx, base) => {
      const x = x0 + cx, b = y0 + base, dx = i => Math.round(s * (i / H) ** 2);
      ellipse(g, x + 1, b + 1, 3, 1, OMBRE);
      for (let i = 0; i < H; i++) { P(g, x + dx(i), b - i, tige); P(g, x + 1 + dx(i), b - i, teinte(tige, 0.8)); }
      for (let hy = 2; hy < H; hy += 3) { const o = dx(hy); P(g, x - 1 + o, b - hy, fe); P(g, x - 2 + o, b - hy, fe); P(g, x + 2 + o, b - hy - 1, teinte(fe, 0.85)); P(g, x + 3 + o, b - hy - 1, teinte(fe, 0.85)); }
      const o = dx(H);
      if (p > 0.5 && p < 0.76) { P(g, x - 1 + o, b - H + 3, k.c); P(g, x - 1 + o, b - H + 4, k.a); P(g, x + 2 + o, b - H + 5, k.c); }
      if (p > 0.74) { const col = mur > 0.4 ? '#2a2420' : '#5a8a3a'; R(g, x + 2 + dx(H >> 1), b - (H >> 1), 1, 3, col); R(g, x - 1 + dx(H >> 1), b - (H >> 1) + 1, 1, 3, col); }
    });
  },
  sarrasin(g, x0, y0, c, k, p, rnd, s) {
    if (p < 0.05) return levee(g, x0, y0, p, rnd, 6);
    const H = Math.round(2 + 8 * Math.min(1, p / 0.6)), mur = clamp01((p - 0.82) / 0.18);
    grille(8, 6, (cx, base, n) => {
      const x = x0 + cx, b = y0 + base, h = Math.round(H * (0.85 + rnd(n) * 0.3)), dx = Math.round(s * 0.6);
      R(g, x, b - h + 1, 1, h, mur > 0 ? melange(k.a, '#6a3428', mur) : k.a);
      P(g, x - 1, b - (h >> 1), k.f); P(g, x + 1, b - (h >> 1) - 1, teinte(k.f, 1.15));
      if (p > 0.45) { const fl = mur > 0 ? melange(k.c, '#6a3a2a', mur) : k.c; R(g, x - 1 + dx, b - h - 2, 3, 2, fl); P(g, x + dx, b - h - 3, teinte(fl, 1.1)); if (!mur) P(g, x + 1 + dx, b - h - 1, '#f8c8d8'); }
    });
  },
};
// Cultures que le vent fait onduler, et stade montré sur les vignettes des semences
const SOUPLES = new Set(['epi', 'avoine', 'lin', 'mais', 'sorgho', 'tournesol', 'topi', 'colza', 'feverole', 'sarrasin']);
const STADE_ICONE = { colza: 0.7, lin: 0.66, tournesol: 0.74, sarrasin: 0.7, pdt: 0.62, feverole: 0.62, topi: 0.8, tomate: 1, fraise: 1 };

// Plante entière dans une vignette (x0, y0 = coin de la case dans la vignette)
function dessinerPlante(g, x0, y0, c, p, v, s, pourri) {
  const rnd = i => hasard(v * 7 + 3, c.id.length * 13 + c.id.charCodeAt(0), i);
  FORMES[c.forme](g, x0, y0, c, c.coul, p, rnd, s);
  if (pourri) for (let i = 0; i < 26; i++) R(g, x0 + (rnd(i + 90) * 45 | 0), y0 + (rnd(i + 95) * 46 | 0), 2, 1, i % 3 ? '#5a4228' : '#7a6a58');
}

// ---------- Produits (16 × 16), sur les caisses et les cartes ----------
function produit(g, x, y, c) {
  const k = c.coul;
  switch (c.prod) {
    case 'epi':
      for (const [dx, a] of [[-4, -1], [0, 0], [4, 1]]) {
        for (let i = 0; i < 7; i++) P(g, x + 8 + dx + Math.round(-a * i / 4), y + 15 - i, teinte(k.m, 0.78));
        for (let i = 0; i < 4; i++) { const ex = x + 8 + dx + a * 2, ey = y + 1 + i * 2; P(g, ex - 1, ey + 1, k.a); P(g, ex, ey, teinte(k.a, 1.2)); P(g, ex + 1, ey + 1, teinte(k.a, 0.85)); P(g, ex, ey + 1, k.a); }
      }
      R(g, x + 5, y + 11, 7, 2, '#c8a85a'); P(g, x + 5, y + 11, '#e8d080'); break;
    case 'epi-mais':
      ellipse(g, x + 8, y + 8, 3, 6, k.a);
      for (let i = 0; i < 6; i++) { P(g, x + 7, y + 3 + i * 2, teinte(k.a, 1.25)); P(g, x + 9, y + 4 + i * 2, teinte(k.a, 0.82)); }
      ligne(g, x + 3, y + 15, x + 5, y + 4, '#9cc06a'); ligne(g, x + 4, y + 15, x + 6, y + 5, '#7cb85a'); ligne(g, x + 13, y + 15, x + 11, y + 5, '#7cb85a'); ligne(g, x + 12, y + 15, x + 10, y + 6, '#9cc06a');
      P(g, x + 8, y + 1, '#b8904a'); break;
    case 'grain': case 'lentille': case 'graine-blanche': case 'graine-beige': case 'graine-brune': case 'graine-jaune': case 'graine-noire': case 'graine-tournesol': {
      const col = { grain: c.id === 'sarrasin' ? '#6a3428' : '#c8a25a', lentille: '#8a8a4a', 'graine-blanche': '#f2ecda', 'graine-beige': '#d9b878',
        'graine-brune': '#6a4a2a', 'graine-jaune': '#e2c870', 'graine-noire': '#2e2a2a', 'graine-tournesol': '#3a3a3a' }[c.prod];
      ellipse(g, x + 8, y + 14, 7, 1, OMBRE);
      for (let i = 0; i < 6; i++) for (let j = 0; j <= i; j++) {
        const gx = x + 8 - i + j * 2, gy = y + 3 + i * 2;
        R(g, gx - 1, gy, 2, 2, (i + j) % 2 ? col : teinte(col, 0.8)); P(g, gx - 1, gy, teinte(col, 1.25));
        if (c.prod === 'graine-tournesol' && (i + j) % 3 === 0) P(g, gx, gy + 1, '#e8e8e8');
      }
      break;
    }
    case 'gousse':
      ellipse(g, x + 8, y + 9, 7, 3, teinte(k.m, 0.8)); ellipse(g, x + 8, y + 8, 6, 2, k.m);
      for (let i = 0; i < 4; i++) disque(g, x + 4 + i * 3, y + 8, 1, teinte(k.m, 1.3));
      R(g, x + 14, y + 4, 1, 3, '#5a8a3a'); P(g, x + 15, y + 3, '#5a8a3a'); break;
    case 'tubercule': case 'tubercule-rose': {
      const col = c.prod === 'tubercule' ? '#c9a070' : '#c9887a';
      ellipse(g, x + 6, y + 9, 5, 4, teinte(col, 0.85)); ellipse(g, x + 6, y + 8, 5, 3, col); ellipse(g, x + 11, y + 11, 4, 3, teinte(col, 0.9));
      P(g, x + 3, y + 7, teinte(col, 1.3)); P(g, x + 4, y + 6, teinte(col, 1.3)); P(g, x + 7, y + 9, teinte(col, 0.65)); P(g, x + 10, y + 11, teinte(col, 0.65)); P(g, x + 12, y + 10, teinte(col, 0.7)); break;
    }
    case 'betsucre':
      for (const [a, b] of [[5, 0], [8, 0], [11, 1]]) ligne(g, x + 8, y + 5, x + a, y + b, '#4f9a3a');
      ellipse(g, x + 8, y + 8, 4, 3, k.m); R(g, x + 6, y + 10, 5, 2, k.m); R(g, x + 7, y + 12, 3, 2, k.m); P(g, x + 8, y + 14, k.m);
      P(g, x + 6, y + 7, '#ffffff'); R(g, x + 9, y + 9, 2, 1, teinte(k.m, 0.85)); break;
    case 'carotte': case 'panais':
      for (const [a, b] of [[5, 0], [8, 0], [11, 1], [7, 1]]) ligne(g, x + 8, y + 4, x + a, y + b, '#4f9e3a');
      for (let i = 0; i < 11; i++) { const w = Math.max(0, 3 - (i >> 2)); R(g, x + 8 - w, y + 4 + i, 2 * w + 1, 1, k.m); }
      P(g, x + 6, y + 5, teinte(k.m, 1.3)); P(g, x + 9, y + 8, teinte(k.m, 0.8)); P(g, x + 7, y + 11, teinte(k.m, 0.8)); break;
    case 'betterave': case 'radis': case 'navet':
      for (const [a, b] of [[5, 0], [8, 0], [11, 1]]) ligne(g, x + 8, y + 5, x + a, y + b, c.prod === 'betterave' ? '#b0304f' : '#4f9a3a');
      disque(g, x + 8, y + 9, 4, k.m); R(g, x + 8, y + 13, 1, 3, k.m); P(g, x + 6, y + 7, teinte(k.m, 1.4)); P(g, x + 10, y + 11, teinte(k.m, 0.75));
      if (c.prod === 'navet') { R(g, x + 5, y + 6, 7, 2, k.a); P(g, x + 6, y + 6, teinte(k.a, 1.3)); } break;
    case 'oignon': case 'echalote': case 'ail':
      ellipse(g, x + 8, y + 10, 5, 4, k.m); R(g, x + 7, y + 3, 3, 4, teinte(k.m, 0.88)); P(g, x + 8, y + 2, teinte(k.m, 0.7)); P(g, x + 8, y + 1, teinte(k.m, 0.7));
      P(g, x + 5, y + 8, teinte(k.m, 1.3)); R(g, x + 8, y + 8, 1, 6, teinte(k.m, 0.82)); R(g, x + 6, y + 14, 5, 1, '#8a7a5a'); break;
    case 'salade': case 'feuilles': case 'chou':
      disque(g, x + 8, y + 8, 6, teinte(k.f, 0.82)); disque(g, x + 8, y + 8, 4, c.prod === 'chou' ? k.c : k.a); disque(g, x + 7, y + 7, 2, teinte(c.prod === 'chou' ? k.c : k.a, 1.2));
      P(g, x + 6, y + 5, '#ffffff'); for (let a = 0; a < 6; a++) P(g, x + 8 + Math.round(Math.cos(a) * 6), y + 8 + Math.round(Math.sin(a) * 6), teinte(k.f, 0.7)); break;
    case 'choufleur':
      disque(g, x + 8, y + 8, 6, k.f); disque(g, x + 8, y + 7, 4, k.m);
      for (const [a, b] of [[6, 5], [9, 6], [7, 8], [10, 8]]) P(g, x + a, y + b, k.a); P(g, x + 6, y + 5, '#ffffff'); break;
    case 'poireau':
      R(g, x + 6, y + 7, 4, 8, k.m); P(g, x + 6, y + 7, '#ffffff'); R(g, x + 5, y + 14, 6, 1, '#d8d0b0');
      ligne(g, x + 6, y + 7, x + 3, y + 0, k.f); ligne(g, x + 7, y + 7, x + 6, y + 0, teinte(k.f, 1.15)); ligne(g, x + 9, y + 7, x + 12, y + 1, teinte(k.f, 0.85)); R(g, x + 6, y + 5, 4, 2, k.c); break;
    case 'artichaut':
      ellipse(g, x + 8, y + 9, 5, 5, k.m);
      for (let i = 0; i < 4; i++) { R(g, x + 4 + i * 2, y + 6 + (i % 2), 1, 5, teinte(k.m, 0.75)); }
      R(g, x + 6, y + 3, 4, 2, k.a); P(g, x + 7, y + 2, teinte(k.a, 1.2)); R(g, x + 8, y + 14, 1, 2, '#6a8a4a'); break;
    case 'tomate': case 'fraise':
      if (c.prod === 'fraise') { for (let i = 0; i < 9; i++) { const w = Math.max(0, 4 - (i >> 1)); R(g, x + 8 - w, y + 5 + i, 2 * w + 1, 1, k.m); } for (const [a, b] of [[6, 7], [9, 8], [7, 10], [10, 6], [8, 12]]) P(g, x + a, y + b, '#f6e070'); }
      else { disque(g, x + 8, y + 9, 6, k.m); P(g, x + 5, y + 6, '#ffb8a8'); P(g, x + 6, y + 6, '#ffb0a0'); R(g, x + 9, y + 12, 3, 1, teinte(k.m, 0.78)); }
      R(g, x + 6, y + 3, 5, 2, '#4f9a3a'); P(g, x + 8, y + 1, '#3f7a2a'); P(g, x + 8, y + 2, '#3f7a2a'); break;
    case 'courgette':
      for (let i = 0; i < 12; i++) R(g, x + 2 + i, y + 10 - (i >> 1) + 1, 3, 3, k.m);
      for (let i = 0; i < 12; i += 2) P(g, x + 3 + i, y + 10 - (i >> 1) + 1, teinte(k.m, 1.4));
      R(g, x + 14, y + 3, 2, 2, '#c9a040'); break;
    case 'potiron': case 'melon':
      ellipse(g, x + 8, y + 9, 7, 6, k.m);
      R(g, x + 5, y + 4, 1, 11, teinte(k.m, 0.8)); R(g, x + 11, y + 4, 1, 11, teinte(k.m, 0.8)); R(g, x + 8, y + 3, 1, 12, teinte(k.m, 0.86));
      P(g, x + 3, y + 7, teinte(k.m, 1.3)); P(g, x + 4, y + 6, teinte(k.m, 1.3)); R(g, x + 8, y + 1, 1, 3, '#6a5a2a'); break;
    default: disque(g, x + 8, y + 8, 6, k.m);
  }
}

// Caisse en bois (36 × 30, produits qui débordent de 3 pixels au-dessus) avec le produit sur l'étiquette
function caisse(g, x, y, c) {
  const b = '#b47c44', bc = '#d4a066', bs = '#8a5a2e', bf = '#6a4220', m = c.coul.m;
  ellipse(g, x + 18, y + 30, 17, 1, OMBRE);
  for (let i = 0; i < 10; i++) { const px = x + 4 + i * 3 + (i % 2), py = y + 4 + (i % 3 === 0 ? -1 : i % 3); disque(g, px, py, 2, i % 2 ? m : teinte(m, 0.85)); P(g, px - 1, py - 1, teinte(m, 1.3)); }
  R(g, x, y + 6, 36, 22, b);
  for (const yy of [6, 13, 20]) { R(g, x, y + yy, 36, 1, bc); R(g, x, y + yy + 6, 36, 1, bs); }
  R(g, x, y + 27, 36, 2, bf);
  R(g, x, y + 6, 2, 22, bs); R(g, x + 34, y + 6, 2, 22, bf);
  for (const [nx, ny] of [[1, 8], [34, 8], [1, 23], [34, 23]]) P(g, x + nx, y + ny, '#3a2a1a');
  R(g, x + 9, y + 8, 18, 18, '#f4e8ca'); R(g, x + 9, y + 25, 18, 1, '#d6c49c'); R(g, x + 26, y + 8, 1, 18, '#e0d0a8');
  produit(g, x + 10, y + 9, c);
}

// Étoile dorée (11 × 11)
function etoile(g, x, y, plein) {
  const o = plein ? '#f2b630' : '#8a7a5a', c = plein ? '#ffd860' : '#b8a888', s = plein ? '#c8861a' : '#6a5a40';
  const lignes = ['.....o.....', '....oco....', '....oco....', 'oooocccoooo', '.occcccccso', '..occcccso.', '...occcso..', '..occsccso.', '..ocso.oso.', '.oso....oso', '.oo......oo'];
  lignes.forEach((l, j) => { for (let i = 0; i < 11; i++) { const ch = l[i]; if (ch !== '.') P(g, x + i, y + j, ch === 'o' ? s : ch === 's' ? o : c); } });
  if (plein) { P(g, x + 4, y + 4, '#fff6c8'); P(g, x + 5, y + 3, '#fff6c8'); }
}

// ---------- Trouvailles (16 × 16) ----------
function trouvailleIcone(g, x, y, id) {
  switch (id) {
    case 'silex': ellipse(g, x + 8, y + 9, 5, 6, '#5a5a62'); for (let i = 0; i < 5; i++) ligne(g, x + 4 + i * 2, y + 4, x + 5 + i * 2, y + 14, '#7a7a84'); P(g, x + 6, y + 5, '#b8b8c4'); break;
    case 'tesson': R(g, x + 3, y + 5, 10, 7, '#b8683a'); R(g, x + 3, y + 5, 10, 2, '#d88a5a'); for (let i = 0; i < 4; i++) P(g, x + 4 + i * 2, y + 9, '#7a3a1a'); P(g, x + 12, y + 11, '#8a4a2a'); break;
    case 'tegula': R(g, x + 2, y + 4, 12, 9, '#c0603a'); R(g, x + 2, y + 4, 2, 9, '#a04a2a'); R(g, x + 12, y + 4, 2, 9, '#a04a2a'); R(g, x + 4, y + 4, 8, 1, '#e08a5a'); break;
    case 'monnaie': disque(g, x + 8, y + 8, 6, '#b08a3a'); disque(g, x + 8, y + 8, 4, '#d8b860'); R(g, x + 7, y + 5, 3, 6, '#a07a2a'); P(g, x + 6, y + 5, '#fff0b0'); break;
    case 'fibule': ligne(g, x + 3, y + 11, x + 13, y + 5, '#7a8a5a'); disque(g, x + 4, y + 11, 2, '#9aaa6a'); ligne(g, x + 5, y + 12, x + 13, y + 7, '#5a6a3a'); P(g, x + 3, y + 10, '#c8d898'); break;
    case 'liard': disque(g, x + 8, y + 8, 6, '#8a6a4a'); disque(g, x + 8, y + 8, 5, '#a8865a'); R(g, x + 6, y + 6, 5, 1, '#6a4a2a'); R(g, x + 6, y + 9, 5, 1, '#6a4a2a'); P(g, x + 5, y + 5, '#d8b88a'); break;
    case 'cle': disque(g, x + 4, y + 8, 3, '#5a4a3a'); disque(g, x + 4, y + 8, 1, '#c8b89a'); R(g, x + 7, y + 7, 8, 2, '#5a4a3a'); R(g, x + 12, y + 9, 1, 3, '#5a4a3a'); R(g, x + 14, y + 9, 1, 2, '#5a4a3a'); break;
    case 'de': R(g, x + 5, y + 4, 6, 9, '#c8c8d0'); ellipse(g, x + 8, y + 4, 3, 2, '#d8d8e0'); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) P(g, x + 6 + i * 2, y + 6 + j * 2, '#8a8a96'); break;
    case 'pipe': R(g, x + 2, y + 6, 9, 2, '#e8e0d0'); R(g, x + 10, y + 4, 4, 7, '#e8e0d0'); R(g, x + 11, y + 4, 2, 2, '#5a4a3a'); P(g, x + 2, y + 6, '#c8c0b0'); break;
    case 'fer': for (let a = 0; a < 14; a++) { const ang = Math.PI * (0.1 + a / 13 * 1.8); P(g, x + 8 + Math.round(Math.cos(ang) * 6), y + 7 - Math.round(Math.sin(ang) * 6), '#6a6a72'); P(g, x + 8 + Math.round(Math.cos(ang) * 5), y + 7 - Math.round(Math.sin(ang) * 5), '#4a4a52'); } break;
    case 'bille': disque(g, x + 8, y + 9, 4, '#b8744a'); P(g, x + 6, y + 7, '#e8b08a'); P(g, x + 7, y + 7, '#d89a70'); break;
    case 'bouton': disque(g, x + 8, y + 8, 5, '#a88a3a'); disque(g, x + 8, y + 8, 3, '#c8a850'); P(g, x + 7, y + 6, '#fff0b0'); P(g, x + 8, y + 9, '#7a5a1a'); P(g, x + 9, y + 8, '#7a5a1a'); break;
    default: disque(g, x + 8, y + 8, 5, '#888');
  }
}

// ---------- Paysage réel : routes, chemins, eau, bois, haies, toits ----------
function voisinType(pl, x, y, types) { const t = x < 0 || y < 0 || x >= pl.w || y >= pl.h ? null : pl.types[y][x]; return t !== null && types.includes(t); }
// Route (14 px) ou chemin (9 px) qui rejoint les cases voisines du même réseau, sur un fond d'herbe
function route(g, X, Y, x, y, pl, t, s) {
  herbe(g, X, Y, x, y, s, false);
  const reseau = t === 'r' ? 'rm' : 'rpm', l = t === 'r' ? 18 : 10, a = (T - l) >> 1;
  const n = voisinType(pl, x, y - 1, reseau), su = voisinType(pl, x, y + 1, reseau), o = voisinType(pl, x - 1, y, reseau), e = voisinType(pl, x + 1, y, reseau);
  const bras = [];
  if (n) bras.push([X + a, Y, l, a + l]);
  if (su) bras.push([X + a, Y + a, l, T - a]);
  if (o) bras.push([X, Y + a, a + l, l]);
  if (e) bras.push([X + a, Y + a, T - a, l]);
  if (!bras.length) bras.push([X + a, Y + a, l, l]);
  const coul = t === 'r' ? '#77736b' : '#bfa274', bord = t === 'r' ? '#5f5b54' : '#a88a5c';
  for (const [bx, by, bw, bh] of bras) R(g, bx - 1, by - 1, bw + 2, bh + 2, bord);
  for (const [bx, by, bw, bh] of bras) R(g, bx, by, bw, bh, coul);
  if (t === 'r') {
    for (let i = 0; i < 26; i++) { const px = X + a + (hasard(x, y, i + 30) * l | 0), py = Y + (hasard(x, y, i + 40) * T | 0); if (n || su) P(g, px, py, i % 2 ? '#87837a' : '#67635c'); }
    for (let i = 0; i < 26; i++) { const px = X + (hasard(x, y, i + 50) * T | 0), py = Y + a + (hasard(x, y, i + 60) * l | 0); if (o || e) P(g, px, py, i % 2 ? '#87837a' : '#67635c'); }
    const c = (T >> 1) - 1;
    if ((o || e) && !n && !su) for (let i = 4; i < T; i += 14) R(g, X + i, Y + c, 7, 1, '#ece6d4');
    if ((n || su) && !o && !e) for (let i = 4; i < T; i += 14) R(g, X + c, Y + i, 1, 7, '#ece6d4');
  } else {
    const trace = '#a88a5c', mil = '#8fae5a', c = T >> 1;
    if (o || e || (!n && !su)) { R(g, o ? X : X + a, Y + c - 3, (o ? a : 0) + (e ? T - a : l), 2, trace); R(g, o ? X : X + a, Y + c + 2, (o ? a : 0) + (e ? T - a : l), 2, trace); R(g, o ? X : X + a, Y + c, (o ? a : 0) + (e ? T - a : l), 1, mil); }
    if (n || su) { R(g, X + c - 3, n ? Y : Y + a, 2, (n ? a : 0) + (su ? T - a : l), trace); R(g, X + c + 2, n ? Y : Y + a, 2, (n ? a : 0) + (su ? T - a : l), trace); R(g, X + c, n ? Y : Y + a, 1, (n ? a : 0) + (su ? T - a : l), mil); }
    for (let i = 0; i < 6; i++) P(g, X + a + (hasard(x, y, i + 50) * l | 0), Y + a + (hasard(x, y, i + 60) * l | 0), '#d2b88a');
  }
}
function eau(g, X, Y, x, y) {
  R(g, X, Y, T, T, '#4a82ac');
  for (let i = 0; i < 6; i++) R(g, X + 3 + (hasard(x, y, i + 70) * 36 | 0), Y + 3 + (hasard(x, y, i + 80) * 40 | 0), 6, 1, '#6ea4cc');
}
// Bois : quatre houppiers vus du dessus. Haie : arbustes alignés. s = inclinaison due au vent.
function bosquet(g, X, Y, x, y, pal, s) {
  const [f, c, sb] = pal;
  for (let i = 0; i < 5; i++) {
    const cx = X + 7 + (hasard(x, y, i + 90) * 34 | 0), cy = Y + 8 + (hasard(x, y, i + 100) * 30 | 0), r = 9 + (hasard(x, y, i + 110) * 5 | 0);
    ellipse(g, cx + 3, cy + r - 1, r, 3, OMBRE);
    disque(g, cx + 1, cy + 2, r, sb); disque(g, cx, cy, r, f);
    disque(g, cx - 2 + s, cy - 3, Math.max(2, r - 4), c);
    P(g, cx - 4 + s, cy - 6, teinte(c, 1.25)); P(g, cx + 2 + s, cy - 2, teinte(c, 1.15)); P(g, cx - 1 + s, cy + 3, teinte(f, 0.85));
  }
}
function haie(g, X, Y, x, y, pal, s, pl) {
  const [f, c, sb] = pal, vert = voisinType(pl, x, y - 1, 'a') || voisinType(pl, x, y + 1, 'a'), hor = voisinType(pl, x - 1, y, 'a') || voisinType(pl, x + 1, y, 'a');
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const j = (hasard(x, y, i + 120) * 6 | 0) - 3;
    if (vert && !hor) pts.push([X + 24 + j, Y + 4 + i * 10]); else pts.push([X + 4 + i * 10, Y + 24 + j]);
  }
  for (const [cx, cy] of pts) ellipse(g, cx + 2, cy + 6, 6, 2, OMBRE);
  for (const [cx, cy] of pts) { disque(g, cx + 1, cy + 1, 6, sb); disque(g, cx, cy, 6, f); disque(g, cx - 1 + s, cy - 2, 3, c); P(g, cx - 2 + s, cy - 3, teinte(c, 1.25)); }
}
// Toits du village (case de bâti), tuiles flamandes ou ardoise
function toit(g, X, Y, x, y, pl) {
  const b = (dx, dy) => voisinType(pl, x + dx, y + dy, 'b');
  const ardoise = hasard(Math.floor(x / 3), Math.floor(y / 3), 7) < 0.4, tuile = ardoise ? '#6e6a70' : '#b0503a';
  R(g, X, Y, T, T, tuile);
  for (let k = 2; k < T; k += 4) { R(g, X, Y + k, T, 1, teinte(tuile, 0.86)); for (let i = (k >> 2) % 2 ? 3 : 0; i < T; i += 6) P(g, X + i, Y + k - 1, teinte(tuile, 0.9)); }
  if (!b(0, -1)) R(g, X, Y, T, 2, teinte(tuile, 1.3));
  if (!b(0, 1)) { R(g, X, Y + T - 6, T, 6, '#c8b8a0'); R(g, X, Y + T - 6, T, 1, teinte(tuile, 0.55)); for (let i = 4; i < T; i += 12) R(g, X + i, Y + T - 5, 4, 3, '#7a96a8'); }
  if (!b(-1, 0)) R(g, X, Y, 1, T, teinte(tuile, 0.7));
  if (!b(1, 0)) R(g, X + T - 1, Y, 1, T, teinte(tuile, 0.7));
  if (hasard(x, y, 5) < 0.25) { R(g, X + 30, Y + 8, 5, 8, '#8a4a36'); R(g, X + 29, Y + 7, 7, 2, '#5a3a2a'); }
}

// ---------- La ferme au carré de l'Artois (4 × 4 cases, 192 × 192) ----------
// Logis au nord, étables à l'ouest, grange à l'est, porche et pigeonnier au sud, fumier au milieu de la cour.
const FERME = { cheminees: [[41, 14], [151, 14]], cour: [52, 64, 140, 126], pigeonnier: [96, 120], girouette: [162, 48], porche: [96, 172] };
function brique(g, x, y, w, h) {
  R(g, x, y, w, h, '#a8553c');
  for (let yy = 2; yy < h; yy += 3) R(g, x, y + yy, w, 1, '#c98e70');
  for (let yy = 0; yy < h; yy += 3) for (let xx = (yy / 3) % 2 ? 3 : 0; xx < w; xx += 6) P(g, x + xx, y + yy, '#c98e70');
  for (let i = 0; i < w * h / 40; i++) R(g, x + (hasard(x, y, i) * (w - 2) | 0), y + ((hasard(y, x, i) * h / 3) | 0) * 3, 2, 2, '#8e4430');
}
function toiture(g, x, y, w, h, vertical, coul) {
  const sombre = teinte(coul, 0.8), mid = vertical ? x + (w >> 1) : y + (h >> 1);
  if (!vertical) {
    R(g, x, y, w, mid - y, sombre); R(g, x, mid, w, y + h - mid, coul);
    for (let yy = y + 2; yy < y + h; yy += 3) { const c0 = teinte(yy < mid ? sombre : coul, 0.86); R(g, x, yy, w, 1, c0); for (let xx = x + ((yy - y) % 2 ? 2 : 0); xx < x + w; xx += 5) P(g, xx, yy - 1, c0); }
    R(g, x, mid - 1, w, 2, teinte(coul, 1.25)); R(g, x, y + h - 1, w, 1, teinte(coul, 0.55));
  } else {
    R(g, x, y, mid - x, h, sombre); R(g, mid, y, x + w - mid, h, coul);
    for (let xx = x + 2; xx < x + w; xx += 3) { const c0 = teinte(xx < mid ? sombre : coul, 0.86); R(g, xx, y, 1, h, c0); for (let yy = y + ((xx - x) % 2 ? 2 : 0); yy < y + h; yy += 5) P(g, xx - 1, yy, c0); }
    R(g, mid - 1, y, 2, h, teinte(coul, 1.25));
  }
}
function fenetre(g, x, y, w = 7, h = 9) {
  R(g, x - 1, y - 1, w + 2, h + 2, '#f2ece0'); R(g, x, y, w, h, '#7fa4b8');
  R(g, x + (w >> 1), y, 1, h, '#f2ece0'); R(g, x, y + (h >> 1), w, 1, '#f2ece0');
  P(g, x, y, '#b8d4e2'); P(g, x + 1, y, '#a8c8da'); R(g, x - 1, y + h + 1, w + 2, 1, '#e0d8c8');
}
function fermeCarree(g, x0, y0, s) {
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) herbe(g, x0 + i * T, y0 + j * T, 900 + i, 900 + j, s, false);
  // allée de graviers du porche vers le chemin
  R(g, x0 + 84, y0 + 170, 24, 22, '#c8b48a');
  for (let i = 0; i < 40; i++) P(g, x0 + 84 + (hasard(i, 3, 5) * 24 | 0), y0 + 170 + (hasard(i, 4, 5) * 22 | 0), i % 2 ? '#a8946a' : '#e0d0a8');
  // cour pavée et fumier
  R(g, x0 + 46, y0 + 56, 100, 80, '#b8aa8a');
  for (let yy = 58; yy < 136; yy += 4) for (let xx = 46 + (yy % 8 ? 2 : 0); xx < 146; xx += 4) { P(g, x0 + xx, y0 + yy, '#a2957a'); P(g, x0 + xx + 1, y0 + yy, '#c6b898'); }
  ellipse(g, x0 + 98, y0 + 102, 17, 4, OMBRE);
  ellipse(g, x0 + 96, y0 + 96, 16, 9, '#4a3420'); ellipse(g, x0 + 95, y0 + 94, 13, 7, '#5e4228');
  for (let i = 0; i < 40; i++) R(g, x0 + 84 + (hasard(i, 7, 7) * 24 | 0), y0 + 89 + (hasard(i, 8, 7) * 12 | 0), 2, 1, i % 3 ? '#b89a50' : '#8a7038');
  disque(g, x0 + 62, y0 + 72, 4, '#8a8a84'); disque(g, x0 + 62, y0 + 72, 2, '#2a3a4a'); R(g, x0 + 57, y0 + 66, 1, 6, '#5a4a3a'); R(g, x0 + 67, y0 + 66, 1, 6, '#5a4a3a'); R(g, x0 + 57, y0 + 66, 11, 1, '#5a4a3a');
  // charrette
  R(g, x0 + 118, y0 + 112, 16, 9, '#9a6a3a'); R(g, x0 + 118, y0 + 112, 16, 1, '#c08a52'); disque(g, x0 + 121, y0 + 122, 3, '#4a3a2a'); disque(g, x0 + 131, y0 + 122, 3, '#4a3a2a'); R(g, x0 + 107, y0 + 116, 11, 1, '#7a5a3a');
  // ailes ouest (étables) et est (grange)
  toiture(g, x0 + 14, y0 + 44, 33, 100, true, '#b4553c');
  toiture(g, x0 + 145, y0 + 44, 33, 100, true, '#a84e38');
  R(g, x0 + 47, y0 + 56, 3, 80, 'rgba(30,18,8,.25)');
  // logis au nord : toit d'ardoise et façade sur la cour
  toiture(g, x0 + 12, y0 + 14, 168, 32, false, '#686470');
  brique(g, x0 + 47, y0 + 46, 98, 12);
  for (const fx of [54, 70, 112, 128]) fenetre(g, x0 + fx, y0 + 48, 7, 7);
  R(g, x0 + 91, y0 + 48, 9, 10, '#3f6a4a'); R(g, x0 + 91, y0 + 48, 9, 1, '#f2ece0'); P(g, x0 + 98, y0 + 53, '#e8c860');
  R(g, x0 + 47, y0 + 58, 98, 2, 'rgba(30,18,8,.3)');
  for (const [cx, cy] of FERME.cheminees) { R(g, x0 + cx - 2, y0 + cy, 6, 9, '#8e4430'); R(g, x0 + cx - 3, y0 + cy - 1, 8, 2, '#5a3a2a'); P(g, x0 + cx - 1, y0 + cy + 2, '#c98e70'); }
  // aile sud : toit, façade extérieure, porche
  toiture(g, x0 + 12, y0 + 134, 168, 20, false, '#b4553c');
  brique(g, x0 + 12, y0 + 154, 168, 16);
  for (const fx of [24, 44, 140, 160]) fenetre(g, x0 + fx, y0 + 157, 5, 6);
  R(g, x0 + 84, y0 + 154, 24, 16, '#2e2218'); ellipse(g, x0 + 96, y0 + 155, 12, 3, '#2e2218');
  R(g, x0 + 85, y0 + 157, 9, 13, '#7a5232'); R(g, x0 + 98, y0 + 157, 9, 13, '#7a5232'); R(g, x0 + 85, y0 + 157, 9, 1, '#9a6a42'); R(g, x0 + 98, y0 + 157, 9, 1, '#9a6a42');
  R(g, x0 + 82, y0 + 151, 28, 2, '#e8dcc0');
  // pigeonnier au-dessus du porche
  brique(g, x0 + 86, y0 + 124, 20, 26);
  for (const [a, b] of [[90, 130], [96, 130], [102, 130], [93, 138], [99, 138]]) { R(g, x0 + a - 1, y0 + b, 3, 3, '#2e2218'); P(g, x0 + a, y0 + b - 1, '#2e2218'); R(g, x0 + a - 1, y0 + b + 3, 3, 1, '#e8dcc0'); }
  for (let r = 0; r < 14; r++) { const w = 4 + r * 2; R(g, x0 + 96 - (w >> 1), y0 + 110 + r, w, 1, r % 3 === 2 ? '#8f3f2c' : r < 7 ? '#c8644a' : '#a84e38'); }
  R(g, x0 + 95, y0 + 106, 2, 4, '#3a3430');
  R(g, x0 + 12, y0 + 170, 168, 2, 'rgba(30,18,8,.3)');
}

// ---------- Icône météo (24 × 24), animée ----------
function iconeMeteo(g, m, t) {
  g.clearRect(0, 0, 24, 24);
  const eau = m.pluie + m.neige, phase = t / 900;
  if (eau < 0.5) {
    const coul = m.tmax > 30 ? '#f08a2a' : '#f2c230';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + phase * 0.3, l = 9 + (Math.sin(phase * 2 + i) > 0 ? 1 : 0);
      P(g, 12 + Math.round(Math.cos(a) * l), 12 + Math.round(Math.sin(a) * l), coul); P(g, 12 + Math.round(Math.cos(a) * (l - 1)), 12 + Math.round(Math.sin(a) * (l - 1)), coul);
    }
    disque(g, 12, 12, 5, coul); disque(g, 11, 11, 3, teinte(coul, 1.3));
    if (m.tmin < 0) R(g, 0, 22, 24, 2, '#cfe8f6');
    return;
  }
  const dx = Math.round(Math.sin(phase) * 1.2);
  disque(g, 8 + dx, 9, 4, '#e8ecf0'); disque(g, 14 + dx, 8, 5, '#dfe4ea'); R(g, 4 + dx, 10, 16, 4, '#cfd6de'); R(g, 4 + dx, 13, 16, 1, '#b8c0ca');
  const neige = m.neige > 0.5, n = eau > 10 ? 6 : eau > 3 ? 4 : 2;
  for (let i = 0; i < n; i++) {
    const x = 5 + i * 3, y = 15 + ((Math.floor(t / 120) + i * 3) % 8);
    if (y < 24) neige ? P(g, x, y, '#ffffff') : R(g, x, y, 1, 2, '#4a90d9');
  }
}
