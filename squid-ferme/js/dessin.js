'use strict';
/* Dessin en pixels « fins » : une case fait 24 × 24 pixels d'art, affichés à 2 ou 3 pixels d'écran. */

const T = 24;

// Hasard reproductible : même case, même dessin
function hasard(a, b, k) {
  let h = (a * 374761393 + b * 668265263 + k * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

function disque(g, cx, cy, r, c) {
  g.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy));
    g.fillRect(cx - w, cy + dy, 2 * w + 1, 1);
  }
}

function ellipse(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  for (let dy = -ry; dy <= ry; dy++) {
    const w = Math.round(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)));
    g.fillRect(cx - w, cy + dy, 2 * w + 1, 1);
  }
}

// ---------- Saisons ----------
function couleursSaison(mois) {
  if (mois === 12 || mois <= 2) return { h: '#8ea47a', c: '#a7ba95', p: '#dfe8e2', f: '#c9d6c8' };
  if (mois <= 5) return { h: '#6aac4a', c: '#86c25e', p: '#f4e36a', f: '#f6f2ea' };
  if (mois <= 8) return { h: '#86ab48', c: '#a2c05a', p: '#e9c94a', f: '#d9a64a' };
  return { h: '#999848', c: '#b3a656', p: '#c9763a', f: '#e0a050' };
}

function herbe(g, x0, y0, tx, ty, s, haute) {
  R(g, x0, y0, T, T, haute ? s.c : s.h);
  for (let i = 0; i < 9; i++) {
    const x = Math.floor(hasard(tx, ty, i) * 23), y = Math.floor(hasard(tx, ty, i + 40) * 22);
    R(g, x0 + x, y0 + y, 1, 2, haute ? s.h : s.c);
  }
  if (hasard(tx, ty, 99) < 0.3) {
    const x = Math.floor(hasard(tx, ty, 98) * 20) + 2, y = Math.floor(hasard(tx, ty, 97) * 20) + 2;
    R(g, x0 + x, y0 + y, 1, 1, hasard(tx, ty, 96) < 0.5 ? s.p : s.f);
  }
}

function melange(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const m = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${m(16)},${m(8)},${m(0)})`;
}

// Terre labourée ; plus elle est riche en azote, plus elle est sombre
function terre(g, x0, y0, tx, ty, azote, fumier) {
  const t = Math.min(1, Math.max(0, azote / 90));
  const fond = melange('#a2794e', '#5e3c22', t), sillon = melange('#86603b', '#452a16', t);
  R(g, x0, y0, T, T, fond);
  for (let y = 3; y < T; y += 6) R(g, x0 + 1, y0 + y, T - 2, 1, sillon);
  for (let i = 0; i < 5; i++) {
    R(g, x0 + Math.floor(hasard(tx, ty, i + 7) * 23), y0 + Math.floor(hasard(tx, ty, i + 17) * 23), 1, 1, '#b48a5e');
  }
  if (fumier > 0) for (let i = 0; i < 10; i++) {
    R(g, x0 + Math.floor(hasard(tx, ty, i + 60) * 22), y0 + Math.floor(hasard(tx, ty, i + 70) * 22), 2, 1, '#3a2414');
  }
}

// ---------- Plantes ----------
// stade : 0 semé, 1 levée, 2 jeune, 3 adulte, 4 mûr
function stadeDe(p) { return p >= 1 ? 4 : p >= 0.72 ? 3 : p >= 0.38 ? 2 : p >= 0.1 ? 1 : 0; }

const TOUFFES = [[6, 10], [17, 10], [6, 21], [17, 21]];

function plante(g, x0, y0, tx, ty, c, st, vent, pourri) {
  const k = c.coul, rnd = (i) => hasard(tx, ty, i + 200);
  if (st === 0) {
    for (const [x, y] of TOUFFES) { R(g, x0 + x - 1, y0 + y, 3, 1, '#3b2414'); R(g, x0 + x, y0 + y - 1, 1, 1, '#3b2414'); }
    return;
  }
  const f = FORMES[c.forme];
  f(g, x0, y0, c, k, st, rnd, vent);
  if (pourri) for (let i = 0; i < 8; i++) R(g, x0 + Math.floor(rnd(i + 90) * 22), y0 + Math.floor(rnd(i + 95) * 22), 2, 1, '#5a4228');
}

const FORMES = {
  epi(g, x0, y0, c, k, st, rnd, vent) {
    const H = [0, 2, 4, 7, 8][st];
    const tige = st === 4 ? k.m : st === 3 ? k.c : k.f;
    for (let row = 0; row < 4; row++) {
      const base = 6 + row * 6;
      for (let x = 1; x < 23; x += 2) {
        const i = row * 12 + x;
        const h = Math.max(1, Math.round(H * (0.8 + rnd(i) * 0.4)));
        R(g, x0 + x, y0 + base - h, 1, h, tige);
        if (st >= 3) {
          const dx = vent && rnd(i + 50) < 0.5 ? 1 : 0;
          R(g, x0 + x + dx, y0 + base - h - 2, 1, 3, st === 4 ? k.a : k.c);
          if (c.id === 'orge' && st === 4) R(g, x0 + x + dx, y0 + base - h - 4, 1, 2, k.a);
        }
      }
    }
  },
  mais(g, x0, y0, c, k, st, rnd, vent) {
    const H = [0, 3, 7, 12, 13][st];
    const tige = st === 4 ? k.m : k.f, feuille = st === 4 ? '#c9b47a' : k.c;
    for (const [x, base] of [[6, 11], [17, 11], [6, 22], [17, 22]]) {
      R(g, x0 + x, y0 + base - H, st >= 3 ? 2 : 1, H, tige);
      for (let hy = 2; hy < H - 1; hy += 3) {
        const d = ((hy / 3) | 0) % 2 ? 1 : -1;
        const sx = d > 0 ? x + 2 : x - 3;
        R(g, x0 + sx, y0 + base - hy, 3, 1, feuille);
        R(g, x0 + sx + (d > 0 ? 3 : -1), y0 + base - hy + 1, 1, 1, feuille);
      }
      if (st >= 3) {
        R(g, x0 + x + 2, y0 + base - Math.round(H * 0.55), 2, 4, st === 4 ? k.a : '#a6d06a');
        R(g, x0 + x + (vent ? 1 : 0), y0 + base - H - 2, 1, 2, '#c8a35a');
      }
    }
  },
  tournesol(g, x0, y0, c, k, st, rnd, vent) {
    const H = [0, 3, 7, 13, 14][st];
    for (const [x, base] of [[6, 11], [17, 11], [6, 22], [17, 22]]) {
      R(g, x0 + x, y0 + base - H, 1, H, st === 4 ? '#7a8a3a' : k.f);
      for (let hy = 2; hy < H - 2; hy += 4) {
        R(g, x0 + x - 3, y0 + base - hy, 3, 2, k.c);
        R(g, x0 + x + 1, y0 + base - hy - 2, 3, 2, k.c);
      }
      const top = y0 + base - H;
      if (st === 3) disque(g, x0 + x, top - 1, 1, '#7aa040');
      if (st === 4) {
        const dx = vent ? 1 : 0;
        disque(g, x0 + x + dx, top - 2, 2, k.m);
        R(g, x0 + x + dx - 1, top - 3, 3, 3, k.a);
      }
    }
  },
  topi(g, x0, y0, c, k, st, rnd, vent) {
    const H = [0, 3, 7, 12, 12][st];
    for (const [x, base] of [[5, 11], [9, 10], [16, 11], [19, 10], [5, 22], [9, 21], [16, 22], [19, 21]]) {
      const h = Math.round(H * (0.85 + rnd(x + base) * 0.3));
      R(g, x0 + x, y0 + base - h, 1, h, st === 4 ? k.m : k.f);
      if (st < 4) for (let hy = 2; hy < h - 1; hy += 3) R(g, x0 + x + (hy % 2 ? 1 : -2), y0 + base - hy, 2, 1, k.c);
      if (st === 3) R(g, x0 + x - 1 + (vent ? 1 : 0), y0 + base - h - 1, 2, 2, k.a);
    }
  },
  rosette(g, x0, y0, c, k, st, rnd) {
    const r = [0, 1, 2, 3, 4][st];
    for (const [x, base] of TOUFFES) {
      const cy = y0 + base - r;
      disque(g, x0 + x, cy, r, k.f);
      if (r >= 2) disque(g, x0 + x - 1, cy - 1, r - 2, st === 4 ? k.a : k.c);
      if (c.id === 'epinard' && r >= 3) { R(g, x0 + x + r, cy, 1, 1, k.c); R(g, x0 + x - r, cy + 1, 1, 1, k.a); }
    }
  },
  chou(g, x0, y0, c, k, st, rnd) {
    const r = [0, 1, 3, 4, 5][st];
    for (const [x, base] of TOUFFES) {
      const cy = y0 + base - r + 1;
      disque(g, x0 + x, cy, r, k.f);
      R(g, x0 + x - r, cy, 1, 1, k.a); R(g, x0 + x + r, cy - 1, 1, 1, k.a);
      if (st >= 3) {
        disque(g, x0 + x, cy, st === 4 ? 3 : 2, k.c);
        R(g, x0 + x - 1, cy - 2, 2, 1, k.m);
        R(g, x0 + x, cy, 1, 2, k.a);
      }
    }
  },
  racine(g, x0, y0, c, k, st, rnd) {
    const H = [0, 2, 4, 6, 7][st];
    for (const [x, base] of TOUFFES) {
      for (let f = -2; f <= 2; f++) {
        const h = H - Math.abs(f);
        for (let i = 1; i <= h; i++) {
          const px = x0 + x + Math.round((f * i) / 3), py = y0 + base - i;
          const col = c.id === 'betterave' && i <= 2 ? k.a : k.f;
          R(g, px, py, 1, 1, col);
          if (c.id !== 'betterave' && i > 1 && i % 2 === 0) R(g, px + (f >= 0 ? 1 : -1), py, 1, 1, k.c);
          if (c.id === 'betterave' && i > 2) R(g, px + (f >= 0 ? 1 : -1), py, 1, 1, k.c);
        }
      }
      if (st === 4) { R(g, x0 + x - 1, y0 + base, 3, 2, k.m); R(g, x0 + x, y0 + base + 2, 1, 1, k.m); }
    }
  },
  bulbe(g, x0, y0, c, k, st, rnd) {
    const H = [0, 3, 5, 8, 6][st];
    for (const [x, base] of TOUFFES) {
      const col = st === 4 ? k.c : k.f;
      R(g, x0 + x - 1, y0 + base - H + 1, 1, H - 1, col);
      R(g, x0 + x, y0 + base - H, 1, H, col);
      R(g, x0 + x + 1, y0 + base - H + 2, 1, H - 2, col);
      if (st === 4) {
        R(g, x0 + x + 2, y0 + base - 4, 3, 1, k.c);
        R(g, x0 + x - 1, y0 + base - 1, 3, 2, k.m);
        R(g, x0 + x, y0 + base - 1, 1, 1, k.a);
      }
    }
  },
  pdt(g, x0, y0, c, k, st, rnd) {
    const r = [0, 1, 3, 4, 4][st];
    for (let n = 0; n < 4; n++) {
      const [x, base] = TOUFFES[n];
      const cy = y0 + base - r;
      const feuille = st === 4 ? k.m : k.f;
      disque(g, x0 + x, cy, r, feuille);
      for (let i = 0; i < 4; i++) {
        const a = rnd(n * 10 + i) * 6.28;
        R(g, x0 + x + Math.round(Math.cos(a) * (r + 1)), cy + Math.round(Math.sin(a) * r), 1, 1, feuille);
      }
      if (r >= 3) disque(g, x0 + x - 1, cy - 1, 1, st === 4 ? '#cdbd6a' : k.c);
      if (st === 3) for (let i = 0; i < 3; i++) R(g, x0 + x - 2 + Math.floor(rnd(n * 7 + i + 30) * 5), cy - 2 + Math.floor(rnd(n * 7 + i + 40) * 4), 1, 1, k.a);
      if (st === 4) R(g, x0 + x + 1, cy + 1, 2, 1, '#8a6a3a');
    }
  },
  tomate(g, x0, y0, c, k, st, rnd) {
    for (const [x, base] of [[7, 22], [17, 22]]) {
      const H = [0, 4, 8, 14, 14][st];
      if (st >= 2) R(g, x0 + x + 3, y0 + base - H - 2, 1, H + 2, '#9b7448');
      for (let hy = 1; hy <= H; hy += 3) {
        const w = st >= 3 ? 3 : 2;
        R(g, x0 + x - w, y0 + base - hy - 1, 2 * w + 1, 2, k.f);
        R(g, x0 + x - w + 1, y0 + base - hy - 2, w, 1, k.c);
      }
      if (st >= 3) for (let i = 0; i < 5; i++) {
        R(g, x0 + x - 3 + Math.floor(rnd(x + i) * 7), y0 + base - 2 - Math.floor(rnd(x + i + 20) * (H - 2)), 2, 2, st === 4 ? k.m : k.a);
      }
    }
  },
  courgette(g, x0, y0, c, k, st, rnd) {
    const rx = [0, 2, 4, 6, 6][st], ry = [0, 1, 2, 3, 3][st];
    for (const [x, base] of [[7, 10], [16, 21]]) {
      const cy = y0 + base - ry;
      ellipse(g, x0 + x, cy, rx, ry, k.f);
      if (rx >= 4) { R(g, x0 + x - 3, cy - 1, 2, 1, k.c); R(g, x0 + x + 2, cy, 2, 1, k.c); }
      if (st >= 3) R(g, x0 + x - 1, cy - 1, 2, 2, k.a);
      if (st === 4) { R(g, x0 + x + 1, cy + 2, 5, 2, k.m); R(g, x0 + x + 2, cy + 2, 3, 1, '#4a8a3a'); }
    }
  },
  courge(g, x0, y0, c, k, st, rnd) {
    const n = [0, 2, 4, 6, 6][st];
    for (let i = 0; i < n; i++) {
      const x = 3 + Math.floor(rnd(i) * 18), y = 4 + Math.floor(rnd(i + 10) * 16);
      disque(g, x0 + x, y0 + y, st >= 3 ? 3 : 2, k.f);
      R(g, x0 + x - 1, y0 + y - 1, 2, 1, k.c);
    }
    if (st >= 3) for (let i = 0; i < 8; i++) R(g, x0 + 3 + i * 2, y0 + 12 + (i % 2), 2, 1, k.f);
    if (st === 3) R(g, x0 + 11, y0 + 13, 2, 2, k.a);
    if (st === 4) {
      ellipse(g, x0 + 12, y0 + 16, 5, 4, k.m);
      R(g, x0 + 10, y0 + 13, 1, 7, '#c4621a'); R(g, x0 + 14, y0 + 13, 1, 7, '#c4621a');
      R(g, x0 + 9, y0 + 14, 2, 1, '#f09a48');
      R(g, x0 + 12, y0 + 11, 1, 2, '#6a5a2a');
    }
  },
  legume(g, x0, y0, c, k, st, rnd) {
    const r = [0, 1, 2, 3, 3][st];
    for (let n = 0; n < 4; n++) {
      const [x, base] = TOUFFES[n];
      const cy = y0 + base - r;
      disque(g, x0 + x, cy, r, st === 4 ? k.m : k.f);
      if (st === 3) { R(g, x0 + x - 1, cy - 2, 1, 1, k.c); R(g, x0 + x + 2, cy, 1, 1, k.c); R(g, x0 + x, cy + 1, 1, 2, k.a); }
      if (st === 4) { R(g, x0 + x - 2, cy, 1, 2, k.a); R(g, x0 + x + 1, cy - 1, 1, 2, k.a); R(g, x0 + x + 2, cy + 1, 1, 2, k.a); }
    }
  },
  sarrasin(g, x0, y0, c, k, st, rnd) {
    const H = [0, 2, 4, 6, 6][st];
    for (const [x, base] of TOUFFES) {
      for (const dx of [-2, 0, 2]) {
        const h = H - Math.abs(dx) / 2;
        R(g, x0 + x + dx, y0 + base - h, 1, h, st === 4 ? k.m : k.a);
        R(g, x0 + x + dx - 1, y0 + base - h + 2, 1, 1, k.f);
        if (st >= 3) R(g, x0 + x + dx - 1, y0 + base - h - 1, 2, 2, st === 4 ? '#6a3428' : k.c);
      }
    }
  },
};

// ---------- La ferme ----------
function maison(g, x0, y0) {
  R(g, x0, y0, 96, 96, '#bfa274');
  for (let i = 0; i < 40; i++) R(g, x0 + Math.floor(hasard(i, 1, 3) * 94), y0 + Math.floor(hasard(i, 2, 3) * 94), 2, 1, '#a88c60');
  // Chemin
  R(g, x0 + 22, y0 + 64, 8, 32, '#d2b98a');
  // Maison
  const hx = x0 + 6, hy = y0 + 30;
  R(g, hx, hy, 42, 34, '#ece0c6');
  for (let y = 4; y < 34; y += 6) R(g, hx, hy + y, 42, 1, '#d8c8a6');
  R(g, hx + 30, hy - 26, 6, 14, '#8a7a6a'); R(g, hx + 29, hy - 27, 8, 2, '#6a5a4a');
  for (let r = 0; r < 20; r++) {
    const w = 10 + r * 2.2;
    R(g, Math.round(hx + 21 - w / 2 - 1), hy - 20 + r, Math.round(w + 2), 1, r % 4 === 3 ? '#86362a' : '#a8483a');
  }
  R(g, hx - 3, hy - 1, 48, 2, '#6a2a20');
  R(g, hx + 16, hy + 20, 9, 14, '#6b4426'); R(g, hx + 23, hy + 27, 1, 1, '#e8c860');
  for (const wx of [hx + 4, hx + 31]) {
    R(g, wx, hy + 8, 8, 8, '#6b4426'); R(g, wx + 1, hy + 9, 6, 6, '#9fd0e6'); R(g, wx + 4, hy + 9, 1, 6, '#6b4426');
    R(g, wx - 1, hy + 16, 10, 2, '#7a9a3a'); R(g, wx + 1, hy + 15, 1, 1, '#e86a8a'); R(g, wx + 6, hy + 15, 1, 1, '#f2d24a');
  }
  // Grange
  const bx = x0 + 54, by = y0 + 40;
  R(g, bx, by, 36, 30, '#b4442e');
  for (let x = 3; x < 36; x += 5) R(g, bx + x, by, 1, 30, '#9a3826');
  for (let r = 0; r < 12; r++) R(g, bx - 2 + Math.round(r * 0.6), by - 12 + r, 40 - Math.round(r * 1.2) + r * 0, 1, r % 3 === 2 ? '#4e4842' : '#625a52');
  R(g, bx - 3, by - 1, 42, 2, '#3e3832');
  R(g, bx + 10, by + 12, 16, 18, '#7a2a1e');
  R(g, bx + 10, by + 12, 16, 1, '#f2ece0'); R(g, bx + 10, by + 29, 16, 1, '#f2ece0');
  R(g, bx + 10, by + 12, 1, 18, '#f2ece0'); R(g, bx + 25, by + 12, 1, 18, '#f2ece0'); R(g, bx + 17, by + 12, 2, 18, '#f2ece0');
  for (let i = 0; i < 16; i++) { R(g, bx + 10 + i, by + 12 + Math.round(i * 17 / 15), 1, 1, '#f2ece0'); R(g, bx + 25 - i, by + 12 + Math.round(i * 17 / 15), 1, 1, '#f2ece0'); }
  R(g, bx + 15, by + 2, 6, 6, '#3e2a1e'); R(g, bx + 16, by + 3, 4, 4, '#e2c26a');
  // Bottes de foin
  for (const [x, y] of [[x0 + 58, y0 + 76], [x0 + 70, y0 + 78], [x0 + 64, y0 + 84]]) {
    R(g, x, y, 10, 7, '#e2c25a'); R(g, x, y + 2, 10, 1, '#c9a63a'); R(g, x + 1, y, 8, 1, '#f0d878');
  }
}

function panneau(g, x, y) {
  R(g, x, y, 2, 12, '#7a5532');
  R(g, x - 6, y - 2, 14, 9, '#a87a48'); R(g, x - 6, y - 2, 14, 1, '#c89a62'); R(g, x - 6, y + 6, 14, 1, '#6a4826');
  // « € » en pixels
  R(g, x - 1, y, 3, 1, '#3a2414'); R(g, x - 2, y + 1, 1, 3, '#3a2414'); R(g, x - 1, y + 4, 3, 1, '#3a2414');
  R(g, x - 3, y + 2, 4, 1, '#3a2414');
}

function arbuste(g, x, y, s) {
  disque(g, x, y, 4, '#3f7a3a'); disque(g, x - 1, y - 1, 2, '#5c9a4a');
  R(g, x - 1, y + 4, 2, 2, '#6a4a2a');
  if (s.p === '#c9763a') { R(g, x + 2, y - 2, 1, 1, '#d88a3a'); R(g, x - 3, y + 1, 1, 1, '#c9763a'); }
}

// Barrière autour d'une parcelle (rectangle en pixels d'art)
function barriere(g, x, y, w, h) {
  const bois = '#8a6236', clair = '#b08250';
  R(g, x, y, w, 1, clair); R(g, x, y + h - 1, w, 1, clair);
  R(g, x, y, 1, h, clair); R(g, x + w - 1, y, 1, h, clair);
  for (let i = 0; i <= w; i += 8) { R(g, x + Math.min(i, w - 2), y - 1, 2, 3, bois); R(g, x + Math.min(i, w - 2), y + h - 2, 2, 3, bois); }
  for (let i = 8; i < h; i += 8) { R(g, x - 1, y + i, 3, 2, bois); R(g, x + w - 2, y + i, 3, 2, bois); }
}
