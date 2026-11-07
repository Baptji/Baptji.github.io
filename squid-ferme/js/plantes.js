'use strict';
/* Les 41 cultures en 3D, par familles de silhouettes, et leurs stades de pousse.
   Chaque modèle est une géométrie fusionnée (couleurs par sommet), instanciée case par case. Les modèles « teintés »
   sont dessinés en blanc et gris : leur couleur vient de l'instance (vert qui jaunit, blé qui dore, féverole qui
   noircit). Une plante peut avoir plusieurs pièces (tige + fleurs, fanes + collet) posées aux mêmes endroits.
   decrire(e) rend, pour l'état d'une case, la liste des pièces visibles et la couleur du sol. Le calendrier réel
   tranche les stades qui en dépendent : pas de colza en fleur hors d'avril-mai, pas de blé doré avant juin. */

const Plantes = (() => {
  const K = K3, G = K.G, B = '#ffffff', GR = '#e2e2e2', GR2 = '#c9c9c9';
  const V3 = T3.Vector3, HAUT = new V3(0, 1, 0);
  const F = (L, w, a0, arc, ry, b, c = B, n = 3, pointe) => K.piece(G.feuille(L, w, a0, arc, n, pointe), c, b || [0, 0, 0], [0, ry, 0]);
  const rosette = (k, L, w, a0, arc, y, cols, off = 0, n = 3, pointe) => { const p = []; for (let i = 0; i < k; i++) p.push(F(L * (0.85 + 0.3 * K.hasard(i + k)), w, a0, arc, off + i * Math.PI * 2 / k + K.hasard(i * 3 + k) * 0.4, [0, y, 0], cols[i % cols.length], n, pointe)); return p; };
  const brin = (b, d, h, r, c = B) => K.oriente(G.brin(h, r), c, b, d);
  const boule = (c, p, s, sub = 0) => K.piece(sub === 1 ? G.ico1() : sub === -1 ? G.octa() : G.ico(), c, p, null, s);

  // ---------- Céréales à paille ----------
  // Épi : épillets en deux rangées alternées le long de l'axe (proche), un seul fuseau (loin) ; barbes pour orge, seigle, triticale.
  function epi(type, top, d, proche, pend) {
    const v = new V3(...d).normalize();
    if (pend) v.set(v.x * 0.6 + pend[0], -0.5, v.z * 0.6 + pend[1]).normalize();
    const q = new T3.Quaternion().setFromUnitVectors(HAUT, v), u = new V3(1, 0, 0).applyQuaternion(q);
    const L = { seigle: 0.075, orge: 0.05, triticale: 0.06, ble: 0.058 }[type], r = type === 'seigle' ? 0.0058 : type === 'orge' ? 0.0062 : 0.0076;
    const out = [], at = t => [top[0] + v.x * t, top[1] + v.y * t, top[2] + v.z * t];
    if (!proche) out.push(K.piece(G.octa(), B, at(L / 2), null, [r * 1.6, L / 2, r * 1.9], q));
    else {
      const np = 5, qa = new T3.Quaternion(), qb = new T3.Quaternion();
      qa.setFromAxisAngle(new V3(0, 0, 1), 0.45); qb.setFromAxisAngle(new V3(0, 0, 1), -0.45);
      for (let j = 0; j < np; j++) for (const sg of [-1, 1]) {
        const t = (j + 0.5 + (sg > 0 ? 0.5 : 0)) / (np + 0.6) * L, c = at(t);
        out.push(K.piece(G.octa(), j % 2 ? B : GR, [c[0] + u.x * sg * r * 0.85, c[1] + u.y * sg * r * 0.85, c[2] + u.z * sg * r * 0.85], null, [r, L / (np * 2) * 1.25, r * 1.3], q.clone().multiply(sg > 0 ? qa : qb)));
      }
      out.push(K.piece(G.octa(), B, at(L * 1.02), null, [r * 0.7, L * 0.08, r * 0.8], q));
    }
    if (type !== 'ble') {
      const lb = { orge: 0.075, seigle: 0.05, triticale: 0.04 }[type], nb = proche ? 5 : 2;
      for (let k = 0; k < nb; k++) {
        const a = k / nb * 6.28, base = at(L * (0.35 + 0.6 * k / nb)), w = new V3(v.x + Math.cos(a) * 0.18, v.y, v.z + Math.sin(a) * 0.18).normalize();
        out.push(K.oriente(G.brin(lb, 0.0011), GR, base, [w.x, w.y, w.z]));
      }
    }
    return out;
  }
  // Panicule d'avoine : épillets pendants au bout de rameaux fins
  function panicule(top, d, proche) {
    const out = [brin(top, d, 0.05, 0.0018, GR)];
    const n = proche ? 7 : 3;
    for (let k = 0; k < n; k++) {
      const a = k * 2.4, h = 0.012 + k * 0.006, b = K.bout(top, d, h), dir = [Math.cos(a) * 0.9, 0.25, Math.sin(a) * 0.9], tip = K.bout(b, dir, 0.022);
      out.push(brin(b, dir, 0.022, 0.0009, GR));
      out.push(K.piece(G.octa(), B, [tip[0], tip[1] - 0.008, tip[2]], null, proche ? [0.0045, 0.01, 0.0045] : [0.006, 0.012, 0.006]));
    }
    return out;
  }
  // Touffe de tiges : 4 talles qui s'écartent, une feuille drapeau, l'épi au bout (ou rien en montaison)
  function cereale(type, proche, h = 0.3) {
    const p = [], n = 4;
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996 + 0.4, r = i ? 0.013 + (i % 2) * 0.008 : 0.002, b = [Math.cos(a) * r, 0, Math.sin(a) * r];
      const k = i ? 0.13 : 0.03, d = [Math.cos(a) * k, 1, Math.sin(a) * k], hi = h * (0.9 + ((i * 7) % 4) * 0.045);
      p.push(brin(b, d, hi, 0.0062, GR));
      p.push(F(0.085, 0.014, 0.55, 1.35, -a + 1.1, K.bout(b, d, hi * 0.38), GR2, 2));
      p.push(F(0.07, 0.012, 0.75, 1.2, -a - 1.9, K.bout(b, d, hi * (type ? 0.62 : 0.7)), GR, 2));
      if (!type) p.push(F(0.08, 0.015, 1.0, 1.4, -a + 2.6, K.bout(b, d, hi * 0.15), B, 2));
      const top = K.bout(b, d, hi);
      if (type === 'avoine') p.push(...panicule(top, d, proche));
      else if (type) p.push(...epi(type.replace('_mur', ''), top, d, proche, type === 'orge_mur' ? [Math.cos(a) * 0.5, Math.sin(a) * 0.5] : null));
    }
    return K.fusion(p);
  }

  // ---------- Maïs, sorgho ----------
  function mais(h, feuilles, panache) {
    const p = [K.piece(G.cyl(0.009, 0.014, h, 5), GR, [0, h / 2, 0])];
    for (let i = 0; i < feuilles; i++) {
      const y = 0.06 + i * (h * 0.8 / feuilles), L = 0.21 - i * 0.012;
      p.push(F(L, 0.03, 0.8, 1.75, i * Math.PI + (i % 2) * 0.35 + 0.3, [0, y, 0], i % 2 ? B : GR, 3));
    }
    if (panache) {
      for (let k = 0; k < 5; k++) { const a = k * 1.26; p.push(brin([0, h, 0], k ? [Math.cos(a) * 0.55, 1, Math.sin(a) * 0.55] : [0, 1, 0], k ? 0.06 : 0.085, 0.0022, '#f4f0d8')); }
      p.push(K.piece(G.cyl(0.016, 0.013, 0.085, 6), '#eaf0c8', [0.028, h * 0.52, 0], [0, 0, -0.42]));
      p.push(K.piece(G.cone(0.006, 0.03, 4), '#f0e0a8', [0.05, h * 0.52 + 0.045, 0], [0, 0, -0.42]));
    }
    return K.fusion(p);
  }

  // ---------- Colza : rosette d'hiver, montaison, fleurs, siliques ----------
  const POINTES_COLZA = (() => { const t = [[0, 0.42, 0]]; for (let k = 0; k < 5; k++) { const a = k * 1.256 + 0.3; t.push([Math.cos(a) * 0.065, 0.33 + (k % 2) * 0.04, Math.sin(a) * 0.065]); } return t; })();
  function colzaTiges(siliques) {
    const p = [brin([0, 0, 0], [0, 1, 0], 0.42, 0.006, GR)];
    POINTES_COLZA.slice(1).forEach(([x, y, z], k) => { const b = [0, 0.16 + k * 0.025, 0], d = [x, y - b[1], z]; p.push(brin(b, d, Math.hypot(x, y - b[1], z), 0.0035, GR)); });
    p.push(...rosette(4, 0.07, 0.04, 0.4, 0.8, 0.0, [GR, GR2], 0.3, 2, 0.6));
    for (let i = 0; i < 4; i++) p.push(F(0.05, 0.022, 0.3, 0.5, i * 1.6, [0, 0.12 + i * 0.05, 0], B, 2));
    if (siliques) POINTES_COLZA.forEach(([x, y, z], k) => { for (let j = 0; j < 6; j++) { const a = j * 1.05 + k, b = [x, y - 0.06 + j * 0.01, z]; p.push(brin(b, [Math.cos(a) * 0.7, 0.9, Math.sin(a) * 0.7], 0.035, 0.0016, j % 2 ? B : GR)); } });
    else POINTES_COLZA.forEach(([x, y, z]) => p.push(boule(GR, [x, y + 0.005, z], [0.012, 0.016, 0.012])));
    return K.fusion(p);
  }
  function colzaFleurs() {
    const p = [];
    POINTES_COLZA.forEach(([x, y, z], k) => { for (let j = 0; j < 4; j++) { const a = j * 1.57 + k; p.push(boule(j % 2 ? '#f7dc2a' : '#f1c814', [x + Math.cos(a) * 0.011, y - 0.004 + j * 0.006, z + Math.sin(a) * 0.011], [0.017, 0.012, 0.017], -1)); } });
    return K.fusion(p);
  }

  // ---------- Tournesol (les capitules regardent l'est, +x) ----------
  function tournesolTige(h) {
    const p = [K.piece(G.cyl(0.008, 0.013, h, 5), GR, [0, h / 2, 0])];
    for (let i = 0; i < 9; i++) p.push(F(0.11 - i * 0.004, 0.08, 0.2, 1.0, i * 2.2, [0, 0.07 + i * h * 0.085, 0], i % 2 ? B : GR, 3, 0.5));
    return K.fusion(p);
  }
  function capitule(type, h) {
    const p = [], q = new T3.Quaternion().setFromUnitVectors(HAUT, type === 'mur' ? new V3(0.45, -0.89, 0) : new V3(0.94, 0.34, 0));
    const c = type === 'mur' ? [0.045, h - 0.03, 0] : [0.03, h + 0.01, 0];
    p.push(K.piece(G.cyl(0.004, 0.006, 0.05, 4), '#6a8a3a', [0.01, h - 0.01, 0], [0, 0, -0.5]));
    if (type === 'bouton') { p.push(K.piece(G.ico(), '#5f8a38', c, null, [0.026, 0.022, 0.026])); return K.fusion(p); }
    p.push(K.piece(G.cyl(0.05, 0.05, 0.016, 12), type === 'mur' ? '#4a3420' : '#5a3a1c', c, null, 1, q));
    p.push(K.piece(G.cyl(0.052, 0.04, 0.012, 12), type === 'mur' ? '#7a6a3a' : '#6a8a3a', [c[0] - 0.008, c[1] - (type === 'mur' ? -0.006 : 0.004), c[2]], null, 1, q));
    if (type === 'fleur') for (let k = 0; k < 14; k++) {
      const a = k / 14 * Math.PI * 2, o = new V3(Math.cos(a) * 0.065, 0, Math.sin(a) * 0.065).applyQuaternion(q);
      p.push(K.piece(G.octa(), k % 2 ? '#f6c41a' : '#f0b010', [c[0] + o.x, c[1] + o.y, c[2] + o.z], null, [0.016, 0.004, 0.009], q.clone().multiply(new T3.Quaternion().setFromAxisAngle(HAUT, -a))));
    }
    return K.fusion(p);
  }

  // ---------- Bibliothèque des modèles ----------
  const FAB = {
    levee: () => K.fusion([0, 1, 2, 3].map(i => F(0.042, 0.011, 1.3, 0.6, i * 2.1, [(i - 1) * 0.004, 0, 0], i % 2 ? B : GR, 2))),
    cotyl: () => K.fusion([brin([0, 0, 0], [0, 1, 0], 0.016, 0.002), F(0.02, 0.016, 0.3, 0.2, 0, [0, 0.015, 0], B, 2, 0.5), F(0.02, 0.016, 0.3, 0.2, Math.PI, [0, 0.015, 0], GR, 2, 0.5)]),
    touffe: () => K.fusion(rosette(8, 0.1, 0.017, 1.2, 1.5, 0, [B, GR], 0.2)),
    tiges: () => cereale(null, false, 0.3),
    epi_ble: () => cereale('ble', false), epi_ble_p: () => cereale('ble', true),
    epi_orge: () => cereale('orge', false, 0.27), epi_orge_p: () => cereale('orge', true, 0.27),
    epi_orge_mur: () => cereale('orge_mur', false, 0.27), epi_orge_mur_p: () => cereale('orge_mur', true, 0.27),
    epi_seigle: () => cereale('seigle', false, 0.36), epi_seigle_p: () => cereale('seigle', true, 0.36),
    epi_triticale: () => cereale('triticale', false, 0.32), epi_triticale_p: () => cereale('triticale', true, 0.32),
    epi_avoine: () => cereale('avoine', false), epi_avoine_p: () => cereale('avoine', true),
    mais_jeune: () => K.fusion([K.piece(G.cyl(0.006, 0.01, 0.06, 4), GR, [0, 0.03, 0]), ...rosette(5, 0.15, 0.024, 1.05, 1.6, 0.01, [B, GR], 0, 3)]),
    mais: () => mais(0.66, 8, true),
    sorgho: () => mais(0.5, 7, false),
    sorgho_tete: () => K.fusion([K.piece(G.cyl(0.003, 0.004, 0.04, 4), '#c8c0a0', [0, 0.52, 0]), boule('#ffffff', [0, 0.565, 0], [0.024, 0.045, 0.024], 1)]),
    sarrasin: () => { const p = []; for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4, d = [Math.cos(a) * 0.25, 1, Math.sin(a) * 0.25]; p.push(brin([0, 0, 0], d, 0.18, 0.003, GR)); for (let j = 0; j < 3; j++) p.push(F(0.035, 0.032, 0.3, 0.4, a + j * 2, K.bout([0, 0, 0], d, 0.05 + j * 0.04), j % 2 ? B : GR, 2, 0.45)); } return K.fusion(p); },
    sarrasin_fleurs: () => { const p = []; for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4, t = K.bout([0, 0, 0], [Math.cos(a) * 0.25, 1, Math.sin(a) * 0.25], 0.18); for (let j = 0; j < 3; j++) p.push(boule(j % 2 ? '#f6eef2' : '#f2c6d2', [t[0] + (j - 1) * 0.008, t[1] + j * 0.004, t[2]], [0.012, 0.01, 0.012], -1)); } return K.fusion(p); },
    legume: () => { const p = []; for (let i = 0; i < 4; i++) { const a = i * 1.6; p.push(brin([0, 0, 0], [Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6], 0.1, 0.0025, GR)); } for (let i = 0; i < 11; i++) { const a = i * 2.4, r = 0.012 + (i % 3) * 0.012; p.push(F(0.034, 0.022, 0.45, 0.7, a, [Math.cos(a) * r, 0.025 + i * 0.0075, Math.sin(a) * r], i % 2 ? B : GR, 2, 0.5)); } return K.fusion(p); },
    legume_fleurs: () => K.fusion([0, 1, 2, 3, 4].map(i => { const a = i * 1.9 + 0.3; return boule(i % 2 ? '#f6f2fa' : '#d8b8ea', [Math.cos(a) * 0.03, 0.1 + (i % 2) * 0.012, Math.sin(a) * 0.03], [0.009, 0.007, 0.009]); })),
    gousses: () => K.fusion([0, 1, 2, 3, 4, 5, 6].map(i => { const a = i * 2.2; return K.piece(G.octa(), i % 2 ? B : GR, [Math.cos(a) * 0.028, 0.05 + (i % 3) * 0.015, Math.sin(a) * 0.028], [0.35, a, 0.2], [0.005, 0.018, 0.004]); })),
    feverole: () => { const p = []; for (let i = 0; i < 3; i++) { const a = i * 2.1, b = [Math.cos(a) * 0.012, 0, Math.sin(a) * 0.012], d = [Math.cos(a) * 0.08, 1, Math.sin(a) * 0.08]; p.push(brin(b, d, 0.28, 0.0045, GR)); for (let j = 0; j < 4; j++) p.push(F(0.045, 0.024, 0.35, 0.4, a + j * 1.7, K.bout(b, d, 0.07 + j * 0.05), j % 2 ? B : GR, 2, 0.5)); } return K.fusion(p); },
    feverole_fleurs: () => { const p = []; for (let i = 0; i < 3; i++) { const a = i * 2.1; for (let j = 0; j < 2; j++) { const t = K.bout([Math.cos(a) * 0.012, 0, Math.sin(a) * 0.012], [Math.cos(a) * 0.08, 1, Math.sin(a) * 0.08], 0.17 + j * 0.05); p.push(boule('#f4f2ee', [t[0] + 0.008, t[1], t[2]], [0.009, 0.007, 0.007], -1), boule('#2a2420', [t[0] + 0.011, t[1] + 0.001, t[2] + 0.004], 0.0035, -1)); } } return K.fusion(p); },
    lin: () => { const p = []; for (let i = 0; i < 5; i++) { const a = i * 1.26, d = [Math.cos(a) * 0.08, 1, Math.sin(a) * 0.08], b = [Math.cos(a) * 0.006, 0, Math.sin(a) * 0.006]; p.push(brin(b, d, 0.24, 0.0022, GR)); const t = K.bout(b, d, 0.24); p.push(boule(B, t, 0.006)); p.push(F(0.03, 0.005, 0.8, 0.6, a, K.bout(b, d, 0.1), B, 2)); } return K.fusion(p); },
    lin_fleurs: () => K.fusion([0, 1, 2, 3, 4].map(i => { const a = i * 1.26, t = K.bout([Math.cos(a) * 0.006, 0, Math.sin(a) * 0.006], [Math.cos(a) * 0.08, 1, Math.sin(a) * 0.08], 0.245); return K.piece(G.octa(), i % 2 ? '#7f9ee8' : '#94b2f0', t, null, [0.012, 0.004, 0.012]); })),
    pdt: () => K.fusion([[0, 0.07, 0, 0.07], [0.055, 0.055, 0.025, 0.055], [-0.05, 0.055, -0.03, 0.052], [0.01, 0.06, -0.055, 0.05], [-0.02, 0.05, 0.05, 0.05], [0.03, 0.1, 0.01, 0.04]].map(([x, y, z, r], i) => boule(i % 2 ? B : GR, [x, y, z], r))),
    pdt_fleurs: () => K.fusion([[0.01, 0.13, 0.02, '#f6f2fc'], [-0.04, 0.11, 0.04, '#c7a3e6'], [0.05, 0.11, -0.03, '#f6f2fc'], [-0.02, 0.12, -0.05, '#f6f2fc'], [0.035, 0.14, 0.03, '#e0c8f0']].map(([x, y, z, c]) => boule(c, [x, y, z], 0.014))),
    butte: () => { const g = G.cyl(0.115, 0.115, 1, 7); g.rotateZ(Math.PI / 2); return K.fusion([K.piece(g, B, [0, -0.055, 0])]); },
    betterave: () => K.fusion(rosette(8, 0.12, 0.05, 0.75, 1.05, 0.008, [B, GR, GR2], 0.2, 3, 0.55)),
    collet_bett: () => K.fusion([boule('#e8dcc0', [0, 0.006, 0], [0.03, 0.02, 0.03])]),
    topi: () => { const p = []; for (let i = 0; i < 3; i++) { const a = i * 2.1, d = [Math.cos(a) * 0.06, 1, Math.sin(a) * 0.06], b = [Math.cos(a) * 0.015, 0, Math.sin(a) * 0.015]; p.push(brin(b, d, 0.72, 0.008, GR)); for (let j = 0; j < 5; j++) p.push(F(0.08, 0.036, 0.3, 0.9, a + j * 2.3, K.bout(b, d, 0.15 + j * 0.11), j % 2 ? B : GR, 3, 0.5)); } return K.fusion(p); },
    topi_fleurs: () => { const p = []; for (let i = 0; i < 3; i++) { const a = i * 2.1, t = K.bout([Math.cos(a) * 0.015, 0, Math.sin(a) * 0.015], [Math.cos(a) * 0.06, 1, Math.sin(a) * 0.06], 0.72); for (let j = 0; j < 3; j++) p.push(K.piece(G.octa(), '#f2c230', [t[0] + (j - 1) * 0.02, t[1] - j * 0.02, t[2]], null, [0.018, 0.005, 0.018])); } return K.fusion(p); },
    fanes: () => { const p = []; for (let i = 0; i < 8; i++) { const a = i * 0.785 + K.hasard(i) * 0.3; p.push(brin([0, 0, 0], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.075, 0.0016, GR)); p.push(F(0.06, 0.028, 1.0, 0.9, a, [0, 0.03, 0], i % 2 ? B : GR, 3, 0.25)); } return K.fusion(p); },
    feuilles_rac: () => K.fusion(rosette(6, 0.075, 0.036, 0.95, 1.0, 0.004, [B, GR], 0.4, 3, 0.55)),
    collet: () => K.fusion([boule(B, [0, 0.006, 0], [0.02, 0.016, 0.02])]),
    tubes: () => { const p = []; for (let i = 0; i < 6; i++) { const a = i * 1.05; p.push(brin([0, 0.01, 0], [Math.cos(a) * 0.18, 1, Math.sin(a) * 0.18], 0.13, 0.0042, i % 2 ? B : GR)); } return K.fusion(p); },
    tubes_mur: () => K.fusion(rosette(6, 0.11, 0.008, 0.6, 2.3, 0.012, [B, GR], 0, 3)),
    bulbe: () => K.fusion([boule(B, [0, 0.014, 0], [0.026, 0.024, 0.026], 1), K.piece(G.cone(0.008, 0.02, 5), GR, [0, 0.042, 0])]),
    laitue: () => K.fusion([boule('#a8d870', [0, 0.03, 0], [0.042, 0.034, 0.042], 1), ...rosette(8, 0.062, 0.05, 0.55, 0.95, 0.004, ['#8cc85a', '#7ab84c', '#98d066'], 0, 3, 0.4)]),
    epinard: () => K.fusion(rosette(9, 0.062, 0.03, 0.65, 0.85, 0.003, ['#2f6a2a', '#3a7a32', '#2a5f26'], 0, 3, 0.5)),
    poireau: () => { const p = [K.piece(G.cyl(0.011, 0.014, 0.09, 6), '#eef0e2', [0, 0.045, 0])]; for (let i = 0; i < 6; i++) p.push(F(0.12, 0.022, 1.45 - i * 0.05, 1.1, (i % 2) * Math.PI + i * 0.12, [0, 0.07 + i * 0.006, 0], i % 2 ? '#4f7f66' : '#5a8c72', 3)); return K.fusion(p); },
    chou: () => K.fusion([boule('#7aa89a', [0, 0.05, 0], [0.058, 0.05, 0.058], 1), ...rosette(7, 0.085, 0.07, 0.45, 0.75, 0.006, ['#6a9a8a', '#5f8f80', '#73a394'], 0, 3, 0.45)]),
    chou_feuilles: () => K.fusion(rosette(8, 0.1, 0.06, 1.0, 0.95, 0.004, ['#4f8a5a', '#5a9666', '#47804f'], 0, 3, 0.5)),
    choufleur_tete: () => K.fusion([boule('#f2ead0', [0, 0.05, 0], [0.042, 0.026, 0.042], 1)]),
    artichaut: () => K.fusion([K.piece(G.cyl(0.008, 0.01, 0.18, 5), '#8aa89a', [0, 0.09, 0]), ...rosette(8, 0.15, 0.06, 0.75, 1.35, 0.01, ['#8aa89a', '#9ab8a8', '#7f9e90'], 0, 3, 0.4)]),
    artichaut_boutons: () => K.fusion([[0, 0.2, 0], [0.04, 0.16, 0.02], [-0.035, 0.15, -0.03]].map(([x, y, z], i) => boule(i ? '#6f8a6a' : '#7a6a80', [x, y, z], [0.022, 0.028, 0.022]))),
    tomate: () => K.fusion([K.piece(G.cyl(0.004, 0.005, 0.36, 4), '#a8865a', [0.012, 0.18, 0]), ...[0.06, 0.12, 0.18, 0.24].map((y, i) => boule(i % 2 ? '#3f7f34' : '#4a8c3c', [(i % 2 ? -0.01 : 0.01), y, (i % 2 ? 0.01 : -0.012)], 0.05 - i * 0.006))]),
    tomates: () => K.fusion([[0.04, 0.08, 0.01], [-0.035, 0.12, 0.03], [0.03, 0.16, -0.035], [-0.03, 0.19, -0.02], [0.035, 0.22, 0.025], [0.0, 0.1, 0.045]].map(([x, y, z]) => boule(B, [x, y, z], 0.016))),
    courgette: () => K.fusion([...rosette(6, 0.09, 0.08, 0.45, 0.6, 0.01, ['#3f7f34', '#4a8a3a'], 0, 3, 0.45), boule('#f2b52a', [0.03, 0.04, 0.02], [0.014, 0.01, 0.014]), boule('#f2b52a', [-0.03, 0.035, -0.025], [0.012, 0.009, 0.012])]),
    courgette_fruits: () => K.fusion([K.piece(G.cyl(0.012, 0.011, 0.075, 6), '#2f5a2a', [0.05, 0.012, 0.01], [0, 0.4, Math.PI / 2]), K.piece(G.cyl(0.011, 0.01, 0.065, 6), '#3a6a30', [-0.04, 0.011, 0.04], [0, -0.8, Math.PI / 2])]),
    courge: () => { const p = []; for (let i = 0; i < 10; i++) { const a = i * 2.4, r = 0.03 + (i % 4) * 0.045; p.push(F(0.065, 0.06, 0.25, 0.35, a, [Math.cos(a) * r, 0.004, Math.sin(a) * r], i % 2 ? '#4f8a3a' : '#5a9644', 2, 0.45)); } return K.fusion(p); },
    potiron: () => K.fusion([boule(B, [0.07, 0.03, 0.04], [0.055, 0.038, 0.055], 1), K.piece(G.cyl(0.004, 0.005, 0.02, 4), '#6a7a3a', [0.07, 0.068, 0.04])]),
    melon_plant: () => { const p = []; for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.02 + (i % 3) * 0.04; p.push(F(0.045, 0.04, 0.25, 0.3, a, [Math.cos(a) * r, 0.003, Math.sin(a) * r], i % 2 ? '#5a8a3a' : '#66964a', 2, 0.45)); } return K.fusion(p); },
    melon_fruit: () => K.fusion([boule(B, [0.05, 0.026, -0.03], [0.032, 0.028, 0.032], 1)]),
    fraise: () => K.fusion(rosette(7, 0.042, 0.036, 0.65, 0.65, 0.004, ['#3f7a34', '#4a8a3c', '#36702f'], 0, 2, 0.45)),
    fraise_fleurs: () => K.fusion([[0.03, 0.04, 0.01], [-0.025, 0.038, 0.025], [0.01, 0.042, -0.03], [-0.02, 0.036, -0.02]].map(([x, y, z]) => boule('#fafaf2', [x, y, z], [0.009, 0.004, 0.009]))),
    fraise_baies: () => K.fusion([[0.035, 0.015, 0.012], [-0.03, 0.013, 0.028], [0.012, 0.014, -0.034], [-0.025, 0.012, -0.022], [0.04, 0.012, -0.012]].map(([x, y, z]) => K.piece(G.cone(0.009, 0.016, 5), B, [x, y, z], [Math.PI, 0, 0]))),
    couvert: () => { const p = []; for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.3, d = [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3]; p.push(brin([0, 0, 0], d, 0.12, 0.0025, '#5d9a45')); const t = K.bout([0, 0, 0], d, 0.12); p.push(boule(i % 2 ? '#f2e050' : '#e8d43a', t, [0.012, 0.009, 0.012])); } p.push(...rosette(5, 0.05, 0.035, 0.5, 0.6, 0.004, ['#5d9a45', '#6aa850'], 0, 2, 0.5)); return K.fusion(p); },
    pre: () => K.fusion(rosette(6, 0.06, 0.008, 1.35, 0.95, 0, [B, GR], 0.3, 2)),
    fleurs_pre: () => K.fusion([[0.02, 0.05, 0.01, '#f8f6ee'], [-0.03, 0.045, 0.02, '#f2d23a'], [0.005, 0.055, -0.03, '#f8f6ee'], [0.04, 0.04, -0.02, '#d8322a']].flatMap(([x, y, z, c]) => [brin([x, 0, z], [0, 1, 0], y, 0.0012, '#5a8a3a'), boule(c, [x, y, z], [0.008, 0.005, 0.008])])),
    friche: () => K.fusion([...rosette(7, 0.085, 0.008, 1.4, 0.8, 0, [B, GR, GR2], 0.1, 2), brin([0, 0, 0], [0.1, 1, 0], 0.11, 0.0015, GR), boule(GR2, [0.011, 0.11, 0], [0.006, 0.014, 0.006])]),
    chaume: () => K.fusion([0, 1, 2, 3].map(i => { const a = i * 1.6; return brin([Math.cos(a) * 0.01, 0, Math.sin(a) * 0.01], [Math.cos(a) * 0.2, 1, Math.sin(a) * 0.2], 0.032, 0.0035, i % 2 ? B : GR); })),
    andain: () => { const g = G.cyl(0.045, 0.05, 1, 7); g.rotateZ(Math.PI / 2); return K.fusion([K.piece(g, B, [0, 0.03, 0], null, [1, 0.75, 1])]); },
    botte: () => K.fusion([K.piece(G.boite(0.095, 0.05, 0.058), B, [0, 0.025, 0]), K.piece(G.boite(0.004, 0.052, 0.06), '#8a8a8a', [-0.022, 0.025, 0]), K.piece(G.boite(0.004, 0.052, 0.06), '#8a8a8a', [0.022, 0.025, 0])]),
    sillon: () => { const g = K.toit(0.085, 0.018, 1); g.rotateY(Math.PI / 2); return K.fusion([K.piece(g, B, [0, 0, 0])]); },
    residus: () => K.fusion([0, 1, 2, 3, 4, 5].map(i => K.piece(G.boite(0.05, 0.004, 0.006), i % 2 ? B : GR, [(K.hasard(i) - 0.5) * 0.12, 0.004, (K.hasard(i + 9) - 0.5) * 0.12], [0, K.hasard(i + 4) * 6, 0]))),
    goutte: () => { const g = G.cyl(0.006, 0.006, 0.9, 4); g.rotateZ(Math.PI / 2); return K.fusion([K.piece(g, '#262626', [0, 0.012, -0.18]), K.piece(g.clone(), '#262626', [0, 0.012, 0.18])]); },
    planche: () => K.fusion([K.piece(G.boite(0.88, 0.035, 0.88), B, [0, 0.0175, 0])]),
    agro_tronc: () => K.fusion([K.piece(G.cyl(0.035, 0.05, 0.5, 6), '#6b4426', [0, 0.25, 0]), K.piece(G.cyl(0.012, 0.018, 0.16, 4), '#6b4426', [0.05, 0.46, 0.02], [0, 0, -0.7])]),
    agro_houppier: () => K.fusion([K.piece(G.ico1(), B, [0, 0.7, 0], null, [0.22, 0.28, 0.22]), K.piece(G.ico1(), GR, [0.1, 0.6, 0.06], null, 0.16), K.piece(G.ico(), B, [-0.08, 0.82, -0.04], null, 0.13)]),
  };
  // Modèles de près (les épis détaillés) : remplacent ceux de loin quand la caméra s'approche
  const PROCHE = new Set(['epi_ble', 'epi_orge', 'epi_orge_mur', 'epi_seigle', 'epi_triticale', 'epi_avoine']);
  // Souplesse au vent (0 = immobile) et ombres portées
  const SOUPLE = {
    levee: 0.6, cotyl: 0.3, touffe: 0.8, tiges: 1.0, epi_ble: 1.0, epi_orge: 1.0, epi_orge_mur: 0.9, epi_seigle: 1.0, epi_triticale: 1.0, epi_avoine: 1.0,
    mais_jeune: 0.4, mais: 0.3, sorgho: 0.35, sorgho_tete: 0.35, sarrasin: 0.6, sarrasin_fleurs: 0.6, legume: 0.4, legume_fleurs: 0.4, gousses: 0.4,
    feverole: 0.5, feverole_fleurs: 0.5, lin: 1.1, lin_fleurs: 1.1, pdt: 0.25, pdt_fleurs: 0.25, betterave: 0.3, topi: 0.22, topi_fleurs: 0.22,
    fanes: 0.6, feuilles_rac: 0.4, tubes: 0.5, tubes_mur: 0.3, laitue: 0.1, epinard: 0.2, poireau: 0.4, chou: 0.1, chou_feuilles: 0.2,
    artichaut: 0.2, artichaut_boutons: 0.2, tomate: 0.12, tomates: 0.12, courgette: 0.15, courge: 0.15, melon_plant: 0.15, fraise: 0.15,
    couvert: 0.6, pre: 0.9, fleurs_pre: 0.9, friche: 0.8, chaume: 0.1, colza_rosette: 0.3, colza_tiges: 0.55, colza_siliques: 0.55, colza_fleurs: 0.55,
    tournesol_jeune: 0.3, tournesol_tige: 0.15, agro_houppier: 0.03, capitule_bouton: 0.15, capitule_fleur: 0.15, capitule_mur: 0.15,
  };
  const OMBRE = new Set(['mais', 'sorgho', 'tournesol_tige', 'topi', 'capitule_fleur', 'capitule_mur', 'agro_tronc', 'agro_houppier']);
  Object.assign(FAB, {
    colza_rosette: () => K.fusion(rosette(7, 0.11, 0.052, 0.5, 0.9, 0, [B, GR], 0, 3, 0.6)),
    colza_tiges: () => colzaTiges(false), colza_siliques: () => colzaTiges(true), colza_fleurs: colzaFleurs,
    tournesol_jeune: () => K.fusion([K.piece(G.cyl(0.005, 0.007, 0.05, 4), GR, [0, 0.025, 0]), ...rosette(4, 0.08, 0.065, 0.45, 0.7, 0.03, [B, GR], 0.3, 3, 0.5)]),
    tournesol_tige: () => tournesolTige(0.6), capitule_bouton: () => capitule('bouton', 0.6), capitule_fleur: () => capitule('fleur', 0.6), capitule_mur: () => capitule('mur', 0.6),
  });
  const cache = new Map();
  const geo = cle => { let g = cache.get(cle); if (!g) { if (!FAB[cle]) throw new Error('modèle inconnu : ' + cle); g = FAB[cle](); cache.set(cle, g); } return g; };

  // ---------- Dispositions dans une case : rangs le long de x (le sens de passage des machines) ----------
  // n rangs × m plantes par rang ; j : désordre (0 = alignées) ; z0 : décalage des rangs
  const DISPO = {
    cer: { n: 6, m: 6, j: 0.6 }, lev: { n: 6, m: 6, j: 0.45 }, r4: { n: 4, m: 4, j: 0.12 }, r5: { n: 4, m: 5, j: 0.15 },
    colza: { n: 5, m: 6, j: 0.5 }, butte: { n: 3, m: 1, j: 0 }, pdt: { n: 3, m: 4, j: 0.12 }, buis: { n: 5, m: 5, j: 0.45 },
    lin: { n: 6, m: 7, j: 0.6 }, m3: { n: 3, m: 3, j: 0.12 }, m4: { n: 4, m: 4, j: 0.12 }, m5: { n: 5, m: 5, j: 0.15 },
    pre: { n: 5, m: 5, j: 0.95 }, andain: { n: 2, m: 1, j: 0 }, bottes: { n: 3, m: 3, j: 0.7 }, sillon: { n: 10, m: 1, j: 0 },
    res: { n: 3, m: 3, j: 0.9 }, goutte: { n: 1, m: 1, j: 0 }, planche: { n: 1, m: 1, j: 0 }, agro: { n: 1, m: 2, j: 0.08 },
  };

  // ---------- Couleurs ----------
  const CER = {
    ble: { h: 1, jeune: '#6aa847', vert: '#5f9a3c', mur: '#e2c46a', epi: 'epi_ble' },
    epeautre: { h: 1.08, jeune: '#6aa847', vert: '#62983e', mur: '#d0a468', epi: 'epi_ble' },
    orge: { h: 0.88, jeune: '#72ac4e', vert: '#6aa45a', mur: '#e2cc84', epi: 'epi_orge' },
    seigle: { h: 1.25, jeune: '#6e9c7c', vert: '#6a9a6c', mur: '#cdb47e', epi: 'epi_seigle' },
    triticale: { h: 1.12, jeune: '#6aa44f', vert: '#64984a', mur: '#dcbc74', epi: 'epi_triticale' },
    avoine: { h: 1, jeune: '#78a85a', vert: '#74a456', mur: '#dccb8e', epi: 'epi_avoine' },
  };
  const LEG = { pois: 0.85, lentille: 0.7, poischiche: 0.85, soja: 1.5, haricot: 1.05, haricotvert: 1.05 };
  const COLLET = { carotte: '#ec7a26', panais: '#ebdfb4', betterave: '#7a1e3a', radis: '#d8344a', navet: '#e6daf0' };
  const BULBE = { oignon: '#c8924a', echalote: '#b26e58', ail: '#eee8da' };
  const SEC = '#b8a04e', NEIGE = '#f2f6fa';

  // Sol nu : brun selon la matière organique, plus clair s'il est sec
  const SOL_C = new T3.Color();
  function couleurSol(mo, sec) {
    const riche = clamp01((mo - 0.8) / 3.5);
    SOL_C.copy(K.col('#a67c50')).lerp(K.col('#5c3c22'), riche);
    if (sec > 0) SOL_C.lerp(K.col('#d8c098'), sec * 0.4);
    return SOL_C.clone();
  }
  const mix = (a, b, t) => K.melange(a, b, t);

  // ---------- Description d'une case ----------
  // e : { c, p, mur, prairie ('ppn' pâture | 'fauche'), friche, chaume (0-1), labour, couvert, residus, fum, goutte, mo, sec, neige, mois, doy, planches, herbe }
  function decrire(e) {
    const P = [], mois = e.mois;
    let sol = couleurSol(e.mo ?? 2.2, e.sec || 0), couvre = 0, canopee = null;
    const pose = (g, d, s, col, o) => { const pt = Object.assign({ g, d, s: Array.isArray(s) ? s : [s, s, s], col: typeof col === 'string' ? K.col(col) : col }, o); P.push(pt); return pt; };
    if (e.c) {
      const c = e.c, f = c.forme, p = Math.min(1, e.p), pourri = e.mur > 12, k = (a, b) => clamp01((p - a) / (b - a));
      const fin = col => { let v = typeof col === 'string' ? K.col(col).clone() : col.clone(); if (pourri) v.lerp(K.col('#8a7a5a'), 0.55); if (e.sec > 0.3) v.lerp(K.col(SEC), (e.sec - 0.3) * 0.45); return v; };
      const lev = (dicot, d = 'lev') => { pose(dicot ? 'cotyl' : 'levee', d, 0.45 + 0.55 * k(0, 0.07), fin(dicot ? '#7ab84e' : '#6aa847')); couvre = p * 2; canopee = '#6aa847'; };
      if (f === 'epi' || f === 'avoine') {
        const v = CER[c.id] || CER.ble, [s1, s2, s3] = c.hiver ? [0.05, 0.6, 0.76] : [0.07, 0.3, 0.6];
        if (p < s1) lev(false, 'cer');
        else if (p < s2) { const q = k(s1, s2); pose('touffe', 'cer', [0.55 + 0.55 * q, 0.45 + 0.75 * q, 0.55 + 0.55 * q], fin(v.jeune)); couvre = 0.4 + 0.5 * q; canopee = v.jeune; }
        else if (p < s3) { const q = k(s2, s3); pose('tiges', 'cer', [1, (0.45 + 0.5 * q) * v.h, 1], fin(mix(v.jeune, v.vert, q))); couvre = 0.95; canopee = v.vert; }
        else {
          let m = k(c.hiver ? 0.84 : 0.74, 0.98); if (c.hiver && mois < 6) m = Math.min(m, 0.3); if (mois >= 9 || mois <= 2) m = 1;
          const g = v.epi === 'epi_orge' && p >= 0.97 ? 'epi_orge_mur' : v.epi;
          const col = mix(v.vert, v.mur, m);
          pose(g, 'cer', [1, v.h * (0.92 + 0.08 * k(s3, s3 + 0.08)), 1], fin(col), { tilt: pourri ? 0.55 : 0.05, proche: true });
          couvre = 0.95; canopee = mix(v.vert, v.mur, m);
        }
      } else if (f === 'mais' || f === 'sorgho') {
        const sorgho = f === 'sorgho';
        if (p < 0.06) lev(false, 'r4');
        else if (p < 0.3) { pose('mais_jeune', 'r4', 0.35 + 0.75 * k(0.06, 0.3), fin('#5c9436')); couvre = 0.2 + p; canopee = '#5c9436'; }
        else {
          let m = k(0.8, 1); if (mois < 9 && !sorgho) m = Math.min(m, 0.25);
          const col = fin(mix('#5c9436', '#c8b27a', m)), s = [1, 0.4 + 0.6 * k(0.3, 0.62), 1];
          pose(sorgho ? 'sorgho' : 'mais', 'r4', s, col, { tilt: pourri ? 0.4 : 0.03 });
          if (sorgho && p > 0.55) pose('sorgho_tete', 'r4', s, fin(mix('#8aa04a', '#9a3a22', k(0.55, 0.85))), { tilt: pourri ? 0.4 : 0.03 });
          couvre = 0.75; canopee = mix('#5c9436', '#c8b27a', m);
        }
      } else if (f === 'colza') {
        const hiver = mois >= 10 || mois <= 2;
        if (p < 0.06) lev(true, 'colza');
        else if (p < 0.5 || hiver) { pose('colza_rosette', 'colza', 0.4 + 0.6 * k(0.06, 0.45), fin(mois === 12 || mois <= 2 ? '#56705c' : '#4f7f5a')); couvre = 0.3 + 0.5 * k(0.06, 0.45); canopee = '#4f7f5a'; }
        else if (mois === 3) { pose('colza_tiges', 'colza', [1, 0.55, 1], fin('#6a9a48')); couvre = 0.8; canopee = '#6a9a48'; }
        else if (mois === 4 || mois === 5) { pose('colza_tiges', 'colza', 1, fin('#6a9a48')); pose('colza_fleurs', 'colza', 1, fin('#ffffff')); couvre = 0.95; canopee = '#e8cc30'; }
        else { const m = Math.max(k(0.75, 1), mois >= 7 ? 0.7 : 0.2); pose('colza_siliques', 'colza', 1, fin(mix('#7aa04a', '#8a7448', m))); couvre = 0.9; canopee = mix('#7aa04a', '#8a7448', m); }
      } else if (f === 'tournesol') {
        const o = { rot: 0 };
        if (p < 0.06) lev(true, 'r4');
        else if (p < 0.4) { pose('tournesol_jeune', 'r4', 0.4 + 0.7 * k(0.06, 0.4), fin('#4f8a36'), o); couvre = 0.3 + p; canopee = '#4f8a36'; }
        else {
          const s = [1, 0.5 + 0.5 * k(0.4, 0.62), 1], m = k(0.82, 1);
          pose('tournesol_tige', 'r4', s, fin(mix('#4f8a36', '#7a6a3a', m)), o);
          const tete = p < 0.58 ? 'capitule_bouton' : (p < 0.82 && (mois === 7 || mois === 8)) ? 'capitule_fleur' : p < 0.82 ? 'capitule_bouton' : 'capitule_mur';
          pose(tete, 'r4', s, fin('#ffffff'), o);
          couvre = 0.8; canopee = mix('#4f8a36', '#7a6a3a', m);
        }
      } else if (f === 'lin') {
        if (p < 0.06) lev(true, 'lin');
        else { const m = k(0.72, 1), s = [1, 0.3 + 0.7 * k(0.06, 0.5), 1]; pose('lin', 'lin', s, fin(mix('#6f9a5a', '#c8a860', m))); if (p > 0.45 && p < 0.72 && (mois === 6 || mois === 7)) pose('lin_fleurs', 'lin', s, fin('#ffffff')); couvre = 0.8; canopee = mix('#6f9a5a', '#c8a860', m); }
      } else if (f === 'legume') {
        const h = LEG[c.id] || 1, sec = c.id !== 'haricotvert';
        if (p < 0.06) lev(true, 'buis');
        else {
          const s = [1, h * (0.35 + 0.65 * k(0.06, 0.55)), 1].map((v, i) => i === 1 ? v : 0.6 + 0.4 * k(0.06, 0.4)), m = sec ? k(0.75, 1) : 0;
          pose('legume', 'buis', s, fin(mix('#5a9a3e', '#b8a060', m)));
          if (p > 0.4 && p < 0.7) pose('legume_fleurs', 'buis', s, fin('#ffffff'));
          if (p >= 0.65) pose('gousses', 'buis', s, fin(mix('#6aa84a', '#a89058', m)));
          couvre = 0.5 + 0.4 * k(0.06, 0.5); canopee = mix('#5a9a3e', '#b8a060', m);
        }
      } else if (f === 'feverole') {
        if (p < 0.06) lev(true, 'buis');
        else { const s = [1, 0.3 + 0.7 * k(0.06, 0.55), 1], m = k(0.75, 1); pose('feverole', 'buis', s, fin(mix('#4a7a3a', '#3a3026', m))); if (p > 0.4 && p < 0.68) pose('feverole_fleurs', 'buis', s, fin('#ffffff')); couvre = 0.7; canopee = mix('#4a7a3a', '#3a3026', m); }
      } else if (f === 'sarrasin') {
        if (p < 0.06) lev(true, 'buis');
        else { const s = 0.4 + 0.6 * k(0.06, 0.45), m = k(0.85, 1); pose('sarrasin', 'buis', s, fin(mix('#6a9a48', '#8a4a32', m))); if (p > 0.35 && p < 0.9) pose('sarrasin_fleurs', 'buis', s, fin(mix('#ffffff', '#9a6a50', m))); couvre = 0.75; canopee = mix('#7aa058', '#8a4a32', m); }
      } else if (f === 'pdt') {
        pose('butte', 'butte', 1, couleurSol((e.mo ?? 2.2) + 0.4, e.sec || 0));
        if (p >= 0.12) {
          const m = k(0.78, 1), s = (0.35 + 0.65 * k(0.12, 0.45)) * (1 - 0.4 * m);
          pose('pdt', 'pdt', s, fin(mix('#3f7f34', p >= 1 ? '#6a5a36' : '#a09040', m)), { y: 0.05 });
          if (p > 0.45 && p < 0.72 && (mois === 6 || mois === 7)) pose('pdt_fleurs', 'pdt', s, fin('#ffffff'), { y: 0.05 });
          couvre = 0.25 + 0.5 * k(0.12, 0.45) * (1 - m); canopee = '#3f7f34';
        }
      } else if (f === 'betsucre') {
        if (p < 0.06) lev(true, 'r5');
        else { const s = 0.3 + 0.75 * k(0.06, 0.5); pose('betterave', 'r5', s, fin(mix('#2f7a34', '#7a9a3a', k(0.88, 1) * 0.6))); pose('collet_bett', 'r5', Math.max(0.5, s), fin('#ffffff')); couvre = 0.2 + 0.75 * k(0.06, 0.5); canopee = '#2f7a34'; }
      } else if (f === 'topi') {
        if (p < 0.06) lev(true, 'r4');
        else { const s = [1, 0.2 + 0.8 * k(0.06, 0.7), 1], m = k(0.9, 1); pose('topi', 'r4', s, fin(mix('#4f8a36', '#7a6a3a', m))); if (p > 0.72 && mois >= 9) pose('topi_fleurs', 'r4', s, fin('#ffffff')); couvre = 0.8; canopee = '#4f8a36'; }
      } else if (f === 'racine') {
        const fines = c.id === 'carotte' || c.id === 'panais';
        if (p < 0.06) lev(true, 'm5');
        else { const s = 0.35 + 0.65 * k(0.06, 0.5); pose(fines ? 'fanes' : 'feuilles_rac', 'm5', s, fin(c.id === 'betterave' ? '#3f6a3a' : fines ? '#4f9a3a' : '#5a9a40')); if (p > 0.35) pose('collet', 'm5', 0.5 + 0.6 * k(0.35, 1), fin(COLLET[c.id] || '#e8dcc0')); couvre = 0.5; canopee = '#4f9a3a'; }
      } else if (f === 'bulbe') {
        if (p < 0.06) lev(false, 'm5');
        else { const mur = p > 0.86, s = 0.35 + 0.65 * k(0.06, 0.5); pose(mur ? 'tubes_mur' : 'tubes', 'm5', s, fin(mur ? mix('#5f8f6a', '#c8b060', k(0.86, 1)) : (c.id === 'ail' ? '#7a9a6a' : '#5f8f6a'))); if (p > 0.3) pose('bulbe', 'm5', 0.4 + 0.7 * k(0.3, 1), fin(BULBE[c.id] || '#c8924a')); couvre = 0.35; canopee = '#5f8f6a'; }
      } else if (f === 'rosette') {
        if (p < 0.06) lev(true, 'm5');
        else { pose(c.id === 'laitue' ? 'laitue' : 'epinard', 'm5', 0.3 + 0.75 * k(0.06, 0.8), fin('#ffffff')); couvre = 0.5; canopee = c.id === 'laitue' ? '#8cc85a' : '#2f6a2a'; }
      } else if (f === 'poireau') { if (p < 0.06) lev(false, 'm5'); else { pose('poireau', 'm5', 0.35 + 0.7 * k(0.06, 0.7), fin('#ffffff')); couvre = 0.4; canopee = '#4f7f66'; } }
      else if (f === 'chou') { if (p < 0.06) lev(true, 'm4'); else { pose('chou', 'm4', 0.35 + 0.75 * k(0.06, 0.85), fin('#ffffff')); couvre = 0.6; canopee = '#6a9a8a'; } }
      else if (f === 'choufleur') { if (p < 0.06) lev(true, 'm4'); else { const s = 0.35 + 0.75 * k(0.06, 0.7); pose('chou_feuilles', 'm4', s, fin('#ffffff')); if (p > 0.6) pose('choufleur_tete', 'm4', 0.4 + 0.7 * k(0.6, 1), fin('#ffffff')); couvre = 0.6; canopee = '#4f8a5a'; } }
      else if (f === 'artichaut') { if (p < 0.06) lev(true, 'm3'); else { const s = 0.35 + 0.75 * k(0.06, 0.6); pose('artichaut', 'm3', s, fin('#ffffff')); if (p > 0.6) pose('artichaut_boutons', 'm3', s, fin('#ffffff')); couvre = 0.6; canopee = '#8aa89a'; } }
      else if (f === 'tomate') { if (p < 0.06) lev(true, 'm4'); else { const s = [1, 0.3 + 0.7 * k(0.06, 0.6), 1]; pose('tomate', 'm4', s, fin('#ffffff')); if (p > 0.5) pose('tomates', 'm4', s, fin(mix('#7aa040', '#d8402a', k(0.72, 0.95)))); couvre = 0.5; canopee = '#3f7f34'; } }
      else if (f === 'courgette') { if (p < 0.06) lev(true, 'm3'); else { const s = 0.35 + 0.75 * k(0.06, 0.5); pose('courgette', 'm3', s, fin('#ffffff')); if (p > 0.5) pose('courgette_fruits', 'm3', s, fin('#ffffff')); couvre = 0.65; canopee = '#3f7f34'; } }
      else if (f === 'courge' || f === 'melon') {
        const melon = f === 'melon';
        if (p < 0.06) lev(true, 'm3');
        else { const s = 0.35 + 0.75 * k(0.06, 0.55); pose(melon ? 'melon_plant' : 'courge', 'm3', s, fin('#ffffff')); if (p > 0.45) pose(melon ? 'melon_fruit' : 'potiron', 'm3', 0.4 + 0.65 * k(0.45, 0.85), fin(melon ? mix('#7a9a4a', '#d2c890', k(0.7, 1)) : mix('#9aa840', '#e8842a', k(0.7, 0.95)))); couvre = 0.6; canopee = '#4f8a3a'; }
      } else if (f === 'fraise') {
        sol = sol.lerp(K.col('#d8c07a'), 0.6);
        if (p < 0.06) lev(true, 'm5');
        else { const s = 0.5 + 0.5 * k(0.06, 0.4); pose('fraise', 'm5', s, fin('#ffffff')); if (mois === 4 || mois === 5) pose('fraise_fleurs', 'm5', s, fin('#ffffff')); if ((mois === 5 || mois === 6) && p > 0.6) pose('fraise_baies', 'm5', s, fin(mix('#e8e0a0', '#d8282a', k(0.6, 0.9)))); couvre = 0.45; canopee = '#3f7a34'; }
      } else { if (p < 0.06) lev(true); else { pose('legume', 'buis', 0.4 + 0.6 * k(0.06, 0.5), fin('#5a9a3e')); couvre = 0.5; canopee = '#5a9a3e'; } }
    } else if (e.prairie) {
      const s = couleursSaison(e.doy, e.sec || 0), herbe = K.col(s.c), doy = e.doy, fauche = e.prairie === 'fauche';
      sol = K.col(s.h).clone();
      if (fauche && doy >= 152 && doy < 160) { pose('pre', 'pre', [1, 0.35, 1], herbe); pose('andain', 'andain', 1, K.col('#c9b85a')); }
      else if (fauche && doy >= 160 && doy < 178) { pose('pre', 'pre', [1, 0.45, 1], herbe); pose('botte', 'bottes', 1, K.col('#d4c26e'), { dens: 0.35 }); }
      else {
        const haut = e.prairie === 'ppn' ? 0.55 : fauche && doy > 120 && doy < 152 ? 1.25 : fauche && doy >= 178 && doy < 230 ? 0.55 : 0.85;
        pose('pre', 'pre', [1, haut * (doy < 70 || doy > 320 ? 0.6 : 1), 1], herbe);
        if (doy > 120 && doy < 200 && !(fauche && doy >= 152)) pose('fleurs_pre', 'pre', [1, haut, 1], K.col('#ffffff'), { dens: 0.35 });
      }
      couvre = 1; canopee = null;
    } else if (e.friche) {
      const s = couleursSaison(e.doy, e.sec || 0);
      sol = K.col(s.h).clone(); pose('friche', 'pre', 1, K.col(s.c)); couvre = 1;
    } else {
      // Terre sans culture : chaume, andains et petites bottes après la moisson, couvert, résidus, labour
      if (e.chaume > 0) {
        const paille = mix('#a89060', '#e2c886', e.chaume);
        sol = sol.lerp(K.col('#cdb478'), 0.25 + 0.6 * e.chaume);
        pose('chaume', 'cer', [1, 0.6 + 0.4 * e.chaume, 1], paille);
        if (e.paille && e.chaume > 0.93) pose('andain', 'andain', 1, K.col('#e6d28a'));
        else if (e.paille && e.chaume > 0.6) pose('botte', 'bottes', 1, K.col('#dcc06a'), { dens: 0.4 });
      } else if (e.couvert) { pose('couvert', 'buis', 0.6 + 0.4 * clamp01(e.couvertAge ?? 1), K.col('#ffffff')); couvre = 0.6; canopee = '#5d9a45'; }
      else if (e.labour) pose('sillon', 'sillon', 1, sol.clone().lerp(K.col('#c8a070'), 0.1));
      if (e.residus && !e.chaume) pose('residus', 'res', 1, K.col('#c9a95e'));
    }
    if (e.arbres != null) {
      const a = 0.18 + 0.82 * clamp01(e.arbres / 30), fe = couleursFeuillage(e.doy);
      pose('agro_tronc', 'agro', a, K.col('#ffffff'), { tilt: 0.02 });
      pose('agro_houppier', 'agro', a, K.melange(fe[0], fe[1], 0.4).lerp(K.col(NEIGE), (e.neige || 0) * 0.45), { tilt: 0.02 });
    }
    if (e.fum) sol.lerp(K.col('#3a2414'), 0.35);
    if (e.goutte && e.planches) pose('goutte', 'goutte', 1, K.col('#ffffff'));
    if (canopee) sol.lerp(K.col(canopee).clone().multiplyScalar(0.8), clamp01(couvre) * 0.85);
    if (e.neige > 0.02) { sol.lerp(K.col(NEIGE), e.neige); for (const pt of P) if (pt.g !== 'botte') pt.col = pt.col.clone().lerp(K.col(NEIGE), e.neige * (['sillon', 'chaume', 'residus', 'butte', 'planche'].includes(pt.g) ? 1 : pt.s[1] < 0.6 ? 0.8 : 0.45)); }
    return { parts: P, sol };
  }
  return { geo, decrire, DISPO, PROCHE, SOUPLE, OMBRE, couleurSol };
})();
