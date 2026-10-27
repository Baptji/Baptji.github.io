'use strict';
/* La vie autour de la ferme, en temps réel (quelle que soit la vitesse du jeu) : vols d'oiseaux (oies en migration
   au printemps et à l'automne), corbeaux qui picorent les semis et s'envolent quand on approche, papillons sur les
   fleurs, lièvre, poules dans la cour, fumée des cheminées, pigeons du pigeonnier, girouette, voitures sur les
   routes, camion de livraison, feuilles mortes. Coordonnées en pixels d'art. */

const Vie = {
  etres: [], pl: null, routes: [], sortie: null, prochain: {}, fleurs: [], dernierFleurs: 0,

  init(pl, f) {
    this.pl = pl; this.etres = []; this.fleurs = [];
    const t = performance.now();
    this.prochain = { oiseaux: t + 5000, corbeaux: t + 2500, lievre: t + 20000, voiture: t + 3000, pigeons: t + 12000, fumee: t, feuille: t, papillon: t + 2000 };
    this.routes = [];
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) if ('rp'.includes(pl.types[y][x]) && (x === 0 || y === 0 || x === pl.w - 1 || y === pl.h - 1)) this.routes.push(y * pl.w + x);
    this.sortie = this.cheminSortie(pl);
    this.fermeVisible = !!pl.ferme && MODES[f.mode].echelle === 'champs';
    if (this.fermeVisible) {
      const [fx, fy] = pl.ferme, [x0, y0, x1, y1] = FERME.cour;
      for (let i = 0; i < 5; i++) {
        const x = fx * T + x0 + Math.random() * (x1 - x0), y = fy * T + y0 + Math.random() * (y1 - y0);
        this.etres.push({ type: 'poule', x, y, cx: x, cy: y, dir: 1, etat: 'picore', fin: t + Math.random() * 2000, col: ['#f2ece0', '#c8743a', '#f2ece0', '#8a4a2a', '#e8e0d0'][i], zone: [fx * T + x0, fy * T + y0, fx * T + x1, fy * T + y1] });
      }
    }
  },

  // Parcours en largeur sur les cases dont le type est accepté
  parcours(depart, accepte, diagonales) {
    const pl = this.pl, W = pl.w, H = pl.h, prev = new Int32Array(W * H).fill(-2), file = [depart];
    const pas = diagonales ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    prev[depart] = -1;
    for (let q = 0; q < file.length; q++) {
      const i = file[q], x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of pas) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx; if (prev[j] !== -2 || !accepte(pl.types[ny][nx])) continue;
        prev[j] = i; file.push(j);
      }
    }
    return prev;
  },
  remonter(prev, fin) { const p = []; for (let i = fin; i !== -1; i = prev[i]) p.push(i); return p.reverse(); },
  // Points (centres des cases), prolongés d'une case hors de la carte aux bouts qui touchent le bord
  points(cases) {
    const pl = this.pl, pts = cases.map(i => [(i % pl.w) * T + T / 2, ((i / pl.w) | 0) * T + T / 2]);
    const hors = ([x, y]) => [x < T ? x - T : x > (pl.w - 1) * T ? x + T : x, y < T ? y - T : y > (pl.h - 1) * T ? y + T : y];
    if (pts.length) { const a = hors(pts[0]), b = hors(pts.at(-1)); if (a[0] !== pts[0][0] || a[1] !== pts[0][1]) pts.unshift(a); if (b[0] !== pts.at(-1)[0] || b[1] !== pts.at(-1)[1]) pts.push(b); }
    return pts;
  },
  // De la ferme jusqu'au bord de la carte par les routes et les chemins
  cheminSortie(pl) {
    if (!pl.ferme) return null;
    const [fx, fy] = pl.ferme, depart = (fy + 1) * pl.w + fx + 1, bati = 'mb';
    const prev = this.parcours(depart, t => 'mbrp'.includes(t));
    let fin = -1, mieux = Infinity;
    for (let i = 0; i < prev.length; i++) {
      if (prev[i] === -2) continue;
      const x = i % pl.w, y = (i / pl.w) | 0, ty = pl.types[y][x];
      if ((x === 0 || y === 0 || x === pl.w - 1 || y === pl.h - 1) && (ty === 'r' || ty === 'p')) { const n = this.remonter(prev, i).length + (ty === 'p' ? 6 : 0); if (n < mieux) { mieux = n; fin = i; } }
    }
    if (fin < 0) return null;
    const cases = this.remonter(prev, fin), k = cases.findIndex(i => !bati.includes(pl.types[(i / pl.w) | 0][i % pl.w]));
    if (k < 1) return this.points(cases);
    const pts = this.points(cases.slice(k)), a = cases[k - 1], b = cases[k];
    pts.unshift([((a % pl.w) + (b % pl.w) + 1) * T / 2, (((a / pl.w) | 0) + ((b / pl.w) | 0) + 1) * T / 2]);
    return pts;
  },
  // Position à la distance d sur une ligne brisée, décalée sur la voie de droite
  surLigne(pts, d, voie) {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], l = Math.hypot(x1 - x0, y1 - y0);
      if (d <= l || i === pts.length - 1) {
        const a = Math.min(1, d / l), dx = (x1 - x0) / l, dy = (y1 - y0) / l;
        return { x: x0 + (x1 - x0) * a - dy * voie, y: y0 + (y1 - y0) * a + dx * voie, dx: Math.round(dx), dy: Math.round(dy), fini: d > l && i === pts.length - 1 };
      }
      d -= l;
    }
    return { x: 0, y: 0, dx: 1, dy: 0, fini: true };
  },
  // Camion de livraison qui quitte la ferme ; plusieurs livraisons d'affilée partent l'une après l'autre
  livraison() {
    if (!this.sortie || Rendu.reduit) return;
    const enRoute = this.etres.filter(e => e.type === 'camion');
    if (enRoute.length >= 3) return;
    const d = enRoute.length ? Math.min(0, Math.min(...enRoute.map(e => e.d)) - 60) : 0;
    this.etres.push({ type: 'camion', pts: this.sortie, d, v: 26, t0: performance.now() });
  },

  // ---------- Naissances ----------
  naitre(t, f, m) {
    const pl = this.pl, W = pl.w * T, H = pl.h * T, P = this.prochain, d = dateDe(S.jour), doy = d.doy, eau = m.pluie + m.neige;
    const compte = type => this.etres.reduce((n, e) => n + (e.type === type), 0);
    if (t > P.oiseaux) {
      P.oiseaux = t + 22000 + Math.random() * 30000;
      const migration = (doy > 55 && doy < 120) || (doy > 250 && doy < 320);
      if (migration && Math.random() < 0.7) {
        const versNord = doy < 180, n = 7 + ((Math.random() * 9) | 0), x = W * (0.2 + Math.random() * 0.6), vx = (Math.random() - 0.5) * 14, vy = versNord ? -24 : 24;
        const oiseaux = []; for (let i = 0; i < n; i++) { const r = Math.ceil(i / 2), cote = i % 2 ? 1 : -1; oiseaux.push({ ox: cote * r * 7, oy: r * 6 * (versNord ? 1 : -1), ph: Math.random() * 6 }); }
        this.etres.push({ type: 'vol', x, y: versNord ? H + 60 : -60, vx, vy, oiseaux, grand: true, col: '#3a3836' });
      } else {
        const n = 3 + ((Math.random() * 6) | 0), a = Math.random() * Math.PI * 2, v = 42 + Math.random() * 20;
        const x = W / 2 - Math.cos(a) * (W / 2 + 60), y = H / 2 - Math.sin(a) * (H / 2 + 60);
        const oiseaux = []; for (let i = 0; i < n; i++) oiseaux.push({ ox: (Math.random() - 0.5) * 40, oy: (Math.random() - 0.5) * 30, ph: Math.random() * 6 });
        this.etres.push({ type: 'vol', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, oiseaux, grand: false, col: '#2e2c2a' });
      }
    }
    if (t > P.corbeaux) {
      P.corbeaux = t + 6000 + Math.random() * 9000;
      const semis = [];
      for (const k in f.cases) { const c = f.cases[k]; if (c.cult && c.p < 0.12) semis.push(k); }
      if (semis.length && compte('corbeau') < 5) {
        const n = 1 + ((Math.random() * 3) | 0);
        for (let i = 0; i < n; i++) {
          const [x, y] = semis[(Math.random() * semis.length) | 0].split(',').map(Number), cx = x * T + 6 + Math.random() * 36, cy = y * T + 8 + Math.random() * 34;
          const depuis = Math.random() < 0.5 ? -40 : W + 40;
          this.etres.push({ type: 'corbeau', etat: 'arrive', x: depuis, y: cy - 120, x0: depuis, y0: cy - 120, cx, cy, t0: t + i * 300, dir: depuis < 0 ? 1 : -1, fin: 0 });
        }
      }
    }
    if (t > P.lievre) {
      P.lievre = t + 45000 + Math.random() * 60000;
      const y = (2 + Math.random() * (pl.h - 4)) * T, gauche = Math.random() < 0.5;
      this.etres.push({ type: 'lievre', x: gauche ? -12 : W + 12, y, dir: gauche ? 1 : -1, v: 46, pause: W * (0.3 + Math.random() * 0.4), etat: 'court', t0: t });
    }
    if (t > P.voiture && this.routes.length > 1) {
      P.voiture = t + 12000 + Math.random() * 22000;
      // une voiture sur les routes, ou un tracteur sur les chemins, d'un bord de la carte à un autre
      for (let essai = 0; essai < 6 && compte('voiture') < 2; essai++) {
        const a = this.routes[(Math.random() * this.routes.length) | 0], prev = this.parcours(a, ty => 'rp'.includes(ty), true);
        const buts = this.routes.filter(b => b !== a && prev[b] !== -2 && this.remonter(prev, b).length > 8);
        if (!buts.length) continue;
        const cases = this.remonter(prev, buts[(Math.random() * buts.length) | 0]), pts = this.points(cases);
        const route = cases.filter(i => pl.types[(i / pl.w) | 0][i % pl.w] === 'r').length / cases.length > 0.6;
        const an = d.an, couleurs = !route ? ['#3f7a3a', '#c8402a', '#3f7a3a'] : an < 1975 ? ['#8a9aa8', '#3a5a7a', '#c8c0a8', '#7a2a2a', '#d8d0b8'] : an < 2000 ? ['#c83a2a', '#e8e0d0', '#2a4a8a', '#3a6a3a', '#d8b030'] : ['#e8e8e8', '#2a2a2e', '#8a8e94', '#2a4a7a', '#a82a2a'];
        this.etres.push({ type: 'voiture', pts, d: 0, v: route ? 34 + Math.random() * 14 : 16, col: couleurs[(Math.random() * couleurs.length) | 0] });
        break;
      }
    }
    if (this.fermeVisible && t > P.pigeons && eau < 2) {
      P.pigeons = t + 30000 + Math.random() * 40000;
      const [fx, fy] = pl.ferme;
      this.etres.push({ type: 'pigeons', cx: fx * T + FERME.pigeonnier[0], cy: fy * T + FERME.pigeonnier[1] - 30, t0: t, n: 3 + ((Math.random() * 3) | 0) });
    }
    // fumée : plus dense par temps froid
    if (this.fermeVisible && t > P.fumee) {
      P.fumee = t + (m.tmax < 8 ? 260 : m.tmax < 16 ? 520 : 1400);
      const [fx, fy] = pl.ferme, ch = FERME.cheminees[(Math.random() * (m.tmax < 16 ? 2 : 1)) | 0];
      this.etres.push({ type: 'fumee', x: fx * T + ch[0] + 0.5, y: fy * T + ch[1] - 2, t0: t, vie: 3200 + Math.random() * 1500 });
    }
    // feuilles mortes en automne
    if (doy > 262 && doy < 335 && t > P.feuille) {
      P.feuille = t + 160 + Math.random() * 260;
      const x = (Math.random() * pl.w) | 0, y = (Math.random() * pl.h) | 0;
      if (pl.types[y][x] === 'f' || pl.types[y][x] === 'a') {
        const pal = couleursFeuillage(doy);
        this.etres.push({ type: 'feuille', x: x * T + Math.random() * T, y: y * T + Math.random() * 20, vy: 8 + Math.random() * 6, t0: t, vie: 3500 + Math.random() * 2000, col: pal[(Math.random() * 3) | 0], ph: Math.random() * 6 });
      }
    }
    // papillons par beau temps
    if (t > P.papillon) {
      P.papillon = t + 2500;
      if (t - this.dernierFleurs > 4000) { this.dernierFleurs = t; this.fleurs = this.chercherFleurs(f); }
      const voulu = doy > 95 && doy < 275 && m.tmax > 14 && eau < 0.5 ? Math.min(6, 1 + (this.fleurs.length >> 2)) : 0;
      if (compte('papillon') < voulu) {
        const cible = this.ciblePapillon(), cols = ['#f6f4ec', '#f2e070', '#f0a040', '#f6f4ec', '#c8d8f8'];
        this.etres.push({ type: 'papillon', x: cible.x + (Math.random() - 0.5) * 200, y: cible.y - 120, cible, col: cols[(Math.random() * cols.length) | 0], t0: t, vie: 40000 + Math.random() * 30000, ph: Math.random() * 6 });
      }
    }
  },
  chercherFleurs(f) {
    const pl = this.pl, out = [], fleurit = (c, p) => {
      const z = { colza: [0.6, 0.8], lin: [0.55, 0.77], tournesol: [0.6, 0.84], pdt: [0.48, 0.74], sarrasin: [0.45, 0.82], feverole: [0.5, 0.76], legume: [0.48, 0.75], fraise: [0.4, 0.78], courgette: [0.4, 0.8], courge: [0.4, 0.8], melon: [0.4, 0.8], topi: [0.7, 0.92], epi: [0.55, 0.9] }[c.forme];
      return z && p >= z[0] && p <= z[1];
    };
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) {
      if (pl.types[y][x] !== 'c') continue;
      const u = pl.unite[y * pl.w + x]; let c = null, p = 0;
      if (f.parcelles[u]) { const cs = f.cases[x + ',' + y]; if (cs?.cult) { c = CULTURE[cs.cult]; p = cs.p; } }
      else { const v = Rendu.voisinDe(f, u, S.jour); if (v.c && v.p !== null) { c = v.c; p = v.p; } }
      if (c && fleurit(c, p)) out.push([x, y]);
    }
    return out;
  },
  ciblePapillon() {
    const pl = this.pl;
    if (this.fleurs.length) { const [x, y] = this.fleurs[(Math.random() * this.fleurs.length) | 0]; return { x: x * T + 8 + Math.random() * 32, y: y * T + 4 + Math.random() * 30 }; }
    return { x: Math.random() * pl.w * T, y: Math.random() * pl.h * T };
  },

  // ---------- Mouvements et dessin ----------
  dessinerSol(g, t, dt, f, m) {
    if (Rendu.reduit) return;
    this.naitre(t, f, m);
    const s = Math.min(0.05, dt / 1000), W = this.pl.w * T, H = this.pl.h * T, ptr = Rendu.pointeur;
    // girouette sur la grange
    if (this.fermeVisible) {
      const [fx, fy] = this.pl.ferme, gx = fx * T + FERME.girouette[0], gy = fy * T + FERME.girouette[1], a = Rendu.ventDir + Math.sin(t / 1700) * 0.25;
      R(g, gx, gy - 6, 1, 6, '#3a3430');
      const ex = Math.round(Math.cos(a) * 3), ey = Math.round(Math.sin(a) * 2);
      P(g, gx + ex, gy - 6 + ey, '#2a2420'); P(g, gx - ex, gy - 6 - ey, '#2a2420'); P(g, gx + 2 * ex, gy - 6 + ey, '#2a2420'); P(g, gx - 2 * ex, gy - 7 - ey, '#c8a040');
    }
    this.etres = this.etres.filter(e => {
      switch (e.type) {
        case 'poule': {
          if (t > e.fin) {
            if (e.etat === 'picore') { const [x0, y0, x1, y1] = e.zone; e.cx = x0 + Math.random() * (x1 - x0); e.cy = y0 + Math.random() * (y1 - y0); e.etat = 'marche'; e.dir = e.cx > e.x ? 1 : -1; e.fin = t + 6000; }
            else { e.etat = 'picore'; e.fin = t + 1200 + Math.random() * 3000; }
          }
          if (e.etat === 'marche') {
            const dx = e.cx - e.x, dy = e.cy - e.y, l = Math.hypot(dx, dy);
            if (l < 1) { e.etat = 'picore'; e.fin = t + 1000 + Math.random() * 3000; } else { e.x += dx / l * 9 * s; e.y += dy / l * 9 * s; }
          }
          poule(g, Math.round(e.x), Math.round(e.y), e.dir, e.col, e.etat === 'picore' && Math.floor(t / 220) % 3 === 0, e.etat === 'marche' && Math.floor(t / 140) % 2);
          return true;
        }
        case 'corbeau': {
          if (t < e.t0) return true;
          if (e.etat === 'arrive') {
            const a = Math.min(1, (t - e.t0) / 1800), u = 1 - (1 - a) * (1 - a);
            e.x = e.x0 + (e.cx - e.x0) * u; e.y = e.y0 + (e.cy - e.y0) * u - Math.sin(a * Math.PI) * 20;
            if (a >= 1) { e.etat = 'sol'; e.fin = t + 9000 + Math.random() * 12000; e.saut = 0; }
            return true;
          }
          if (e.etat === 'sol') {
            const peur = ptr && Math.hypot(ptr.px - e.x, ptr.py - e.y) < 40;
            if (t > e.fin || peur) { e.etat = 'part'; e.t0 = t; e.x0 = e.x; e.y0 = e.y; e.dir = Math.random() < 0.5 ? -1 : 1; e.cx = e.x + e.dir * (W * 0.7); e.cy = e.y - 260; return true; }
            if (t > e.saut) { e.saut = t + 700 + Math.random() * 1600; if (Math.random() < 0.5) { e.dir = Math.random() < 0.5 ? -1 : 1; e.x += e.dir * 3; } }
            corbeau(g, Math.round(e.x), Math.round(e.y), e.dir, Math.floor(t / 260) % 4 === 0);
          }
          return true;
        }
        case 'lievre': {
          const avance = e.etat === 'court';
          if (avance) { e.x += e.dir * e.v * s; e.fait = (e.fait || 0) + e.v * s; }
          if (avance && !e.paused && e.fait >= e.pause) { e.etat = 'assis'; e.paused = true; e.fin = t + 1600 + Math.random() * 1500; }
          if (e.etat === 'assis' && t > e.fin) e.etat = 'court';
          lievre(g, Math.round(e.x), Math.round(e.y - (avance ? Math.abs(Math.sin(t / 95)) * 3 : 0)), e.dir, avance, Math.floor(t / 95) % 2);
          return e.x > -20 && e.x < W + 20;
        }
        case 'voiture': case 'camion': {
          e.d += e.v * s;
          if (e.d < 0) return true;                            // attend son tour dans la cour
          const p = this.surLigne(e.pts, e.d, e.type === 'camion' ? 2 : 4);
          if (p.fini) return false;
          if (e.type === 'camion') { camion(g, Math.round(p.x), Math.round(p.y), p.dx, p.dy, t); if (Math.random() < 0.3) Rendu.parts.push({ x: p.x - p.dx * 17, y: p.y - p.dy * 17 - 3, vx: -p.dx * 6, vy: -8, g: -2, t0: t, vie: 900, col: '#9a948a', a: 0.6, taille: 2 }); }
          else voiture(g, Math.round(p.x), Math.round(p.y), p.dx, p.dy, e.col);
          return true;
        }
        default: return true;
      }
    });
  },
  dessinerAir(g, t, dt, f, m) {
    if (Rendu.reduit) return;
    const s = Math.min(0.05, dt / 1000), W = this.pl.w * T, H = this.pl.h * T, vent = Rendu.ventForce * Math.cos(Rendu.ventDir);
    this.etres = this.etres.filter(e => {
      switch (e.type) {
        case 'fumee': {
          const a = (t - e.t0) / e.vie; if (a >= 1) return false;
          const age = (t - e.t0) / 1000, x = e.x + age * (4 + vent * 12) + Math.sin(age * 1.7 + e.t0) * 2, y = e.y - age * 10, r = Math.round(2 + a * 7);
          g.globalAlpha = 0.5 * (1 - a); disque(g, Math.round(x), Math.round(y), r, a < 0.3 ? '#d8d4d0' : '#c4c0bc'); g.globalAlpha = 1;
          return true;
        }
        case 'feuille': {
          const a = (t - e.t0) / e.vie; if (a >= 1) return false;
          const age = (t - e.t0) / 1000;
          g.globalAlpha = a > 0.8 ? (1 - a) * 5 : 1;
          const fx = Math.round(e.x + age * (6 + vent * 10) + Math.sin(age * 3 + e.ph) * 5), fy = Math.round(e.y + age * e.vy);
          if (Math.floor(t / 180 + e.ph) % 2) { R(g, fx, fy, 3, 2, e.col); P(g, fx + 2, fy + 1, teinte(e.col, 0.75)); } else { R(g, fx + 1, fy, 1, 3, e.col); P(g, fx, fy + 1, teinte(e.col, 0.8)); }
          g.globalAlpha = 1;
          return true;
        }
        case 'papillon': {
          if (t - e.t0 > e.vie) { e.cible = { x: e.x + (Math.random() - 0.5) * 400, y: -100 }; if (e.y < -50) return false; }
          const dx = e.cible.x - e.x, dy = e.cible.y - e.y, l = Math.hypot(dx, dy);
          if (l < 6 && t - e.t0 < e.vie) e.cible = Math.random() < 0.7 ? { x: e.x + (Math.random() - 0.5) * 60, y: e.y + (Math.random() - 0.5) * 40 } : this.ciblePapillon();
          else { e.x += dx / l * 16 * s + Math.sin(t / 130 + e.ph) * 0.5; e.y += dy / l * 16 * s + Math.cos(t / 90 + e.ph) * 0.6; }
          papillon(g, Math.round(e.x), Math.round(e.y), e.col, Math.floor(t / 90 + e.ph) % 2);
          return true;
        }
        case 'vol': {
          e.x += e.vx * s; e.y += e.vy * s;
          for (const o of e.oiseaux) {
            const x = Math.round(e.x + o.ox + Math.sin(t / 400 + o.ph) * 2), y = Math.round(e.y + o.oy + (e.grand ? 0 : Math.sin(t / 260 + o.ph) * 3)), aile = Math.floor(t / (e.grand ? 210 : 110) + o.ph) % 2;
            g.globalAlpha = 0.16; oiseau(g, x + 22, y + 40, '#000', aile, e.grand); g.globalAlpha = 1;
            oiseau(g, x, y, e.col, aile, e.grand);
          }
          return e.x > -220 && e.x < W + 220 && e.y > -220 && e.y < H + 220;
        }
        case 'corbeau': {
          if (e.etat === 'arrive' && t >= e.t0) oiseau(g, Math.round(e.x), Math.round(e.y), '#1e1c1c', Math.floor(t / 120) % 2, false);
          if (e.etat === 'part') {
            const a = (t - e.t0) / 2200; if (a >= 1) return false;
            const x = e.x0 + (e.cx - e.x0) * a, y = e.y0 + (e.cy - e.y0) * a * a;
            oiseau(g, Math.round(x), Math.round(y), '#1e1c1c', Math.floor(t / 90) % 2, false);
          }
          return true;
        }
        case 'pigeons': {
          const a = (t - e.t0) / 7000; if (a >= 1) return false;
          for (let i = 0; i < e.n; i++) {
            const ang = a * Math.PI * 2 * 1.5 + i * 0.5, r = 34 + Math.sin(a * Math.PI) * 26;
            oiseau(g, Math.round(e.cx + Math.cos(ang) * r * 1.3), Math.round(e.cy + Math.sin(ang) * r * 0.7 - Math.sin(a * Math.PI) * 10), '#dcdce4', Math.floor(t / 100 + i) % 2, false);
          }
          return true;
        }
        default: return true;
      }
    });
  },
};

// ---------- Petits êtres ----------
function oiseau(g, x, y, col, aile, grand) {
  g.fillStyle = col;
  const n = grand ? 6 : 4;
  g.fillRect(x - 1, y, 3, grand ? 2 : 1); if (grand) g.fillRect(x, y - 2, 1, 2);
  for (let i = 2; i <= n; i++) {
    const dy = aile ? -Math.round((i - 1) * 0.6) : Math.round((i - 1) * 0.45);
    g.fillRect(x - i, y + dy, 1, 1); g.fillRect(x + i, y + dy, 1, 1);
    if (grand && i < n) { g.fillRect(x - i, y + dy + 1, 1, 1); g.fillRect(x + i, y + dy + 1, 1, 1); }
  }
}
function poule(g, x, y, d, col, picore, pas) {
  const so = teinte(col, 0.8);
  ellipse(g, x, y + 5, 5, 1, OMBRE);
  ellipse(g, x, y, 4, 3, col); ellipse(g, x - d, y + 1, 3, 2, so);
  R(g, d > 0 ? x - 6 : x + 5, y - 3, 2, 3, so); P(g, x - 5 * d, y - 4, so);
  const hx = x + (picore ? 5 : 4) * d, hy = y + (picore ? 1 : -3);
  if (!picore) R(g, x + 3 * d, y - 2, 1, 2, col);
  disque(g, hx, hy, 1, col); P(g, hx, hy - 2, '#d8302a'); P(g, hx - d, hy - 2, '#d8302a'); P(g, hx + 2 * d, hy, '#e8a030'); P(g, hx + d, hy - 1, '#1a1a1a');
  R(g, x - 1 + (pas ? 1 : 0), y + 3, 1, 2, '#d8a030'); R(g, x + 2 - (pas ? 1 : 0), y + 3, 1, 2, '#d8a030');
}
function corbeau(g, x, y, d, picore) {
  ellipse(g, x, y + 4, 5, 1, OMBRE);
  ellipse(g, x, y, 4, 2, '#1e1c1c'); R(g, d > 0 ? x - 7 : x + 4, y - 1, 4, 2, '#1e1c1c'); P(g, x - d, y - 1, '#3a3638');
  const hx = x + 4 * d, hy = y + (picore ? 2 : -2);
  disque(g, hx, hy, 1, '#1e1c1c'); R(g, d > 0 ? hx + 2 : hx - 3, hy + (picore ? 1 : 0), 2, 1, '#6a6660'); P(g, hx, hy - 1, '#6a6a70');
  R(g, x - 1, y + 2, 1, 2, '#3a3430'); R(g, x + 1, y + 2, 1, 2, '#3a3430');
}
function lievre(g, x, y, d, court, pas) {
  const brun = '#9a7a52', sombre = '#7a5a3a';
  ellipse(g, x, y + 6, 7, 1, OMBRE);
  if (court) {
    ellipse(g, x, y, 7, 3, brun); ellipse(g, x - d, y + 1, 5, 2, sombre); R(g, d > 0 ? x - 8 : x + 7, y - 2, 2, 2, '#f2ece0');
    disque(g, x + 7 * d, y - 2, 2, brun); P(g, x + 8 * d, y - 3, '#2a2420');
    for (let i = 0; i < 6; i++) { P(g, x + (5 - Math.round(i * 0.6)) * d, y - 4 - i, sombre); P(g, x + (6 - Math.round(i * 0.6)) * d, y - 4 - i, brun); }
    P(g, x + 2 * d, y - 9, '#2a2420');
    if (pas) { R(g, x - 6 * d, y + 3, 3, 1, sombre); R(g, x + 4 * d, y + 3, 3, 1, sombre); } else { R(g, x - 2, y + 3, 2, 2, sombre); R(g, x + 1, y + 3, 2, 2, sombre); }
  } else {
    ellipse(g, x, y, 4, 5, brun); ellipse(g, x - d, y + 2, 3, 3, sombre); R(g, x - 4 * d, y + 3, 2, 2, '#f2ece0');
    disque(g, x + 2 * d, y - 6, 2, brun); P(g, x + 3 * d, y - 7, '#2a2420');
    R(g, x + d, y - 15, 1, 8, sombre); R(g, x + 2 * d, y - 15, 1, 8, brun); P(g, x + d, y - 15, '#2a2420'); P(g, x + 2 * d, y - 15, '#2a2420');
  }
}
function papillon(g, x, y, col, ouvert) {
  R(g, x, y - 1, 1, 3, '#3a3430');
  if (ouvert) { R(g, x - 2, y - 2, 2, 2, col); R(g, x + 1, y - 2, 2, 2, col); R(g, x - 2, y, 2, 1, teinte(col, 0.85)); R(g, x + 1, y, 2, 1, teinte(col, 0.85)); }
  else { R(g, x - 1, y - 3, 1, 2, col); R(g, x + 1, y - 3, 1, 2, col); }
}
// Vus du dessus ; (dx, dy) = direction de la marche
function voiture(g, x, y, dx, dy, col) {
  const h = dx !== 0, av = h ? dx : dy, L = 20, l = 9, w = h ? L : l, ht = h ? l : L, x0 = Math.round(x - w / 2), y0 = Math.round(y - ht / 2);
  g.fillStyle = OMBRE; g.fillRect(x0 + 1, y0 + 2, w, ht);
  R(g, x0, y0, w, ht, col);
  if (h) {
    R(g, x0, y0, w, 1, teinte(col, 1.35)); R(g, x0, y0 + ht - 1, w, 1, teinte(col, 0.7));
    R(g, x0 + 6, y0 + 2, 8, 5, teinte(col, 0.8)); R(g, av > 0 ? x0 + 14 : x0 + 4, y0 + 2, 2, 5, '#9fc4d8'); R(g, av > 0 ? x0 + 4 : x0 + 14, y0 + 2, 2, 5, '#6a8aa0');
    const avant = av > 0 ? x0 + w - 1 : x0, arriere = av > 0 ? x0 : x0 + w - 1;
    P(g, avant, y0 + 1, '#fff6c0'); P(g, avant, y0 + ht - 2, '#fff6c0'); P(g, arriere, y0 + 1, '#d83a2a'); P(g, arriere, y0 + ht - 2, '#d83a2a');
  } else {
    R(g, x0, y0, 1, ht, teinte(col, 1.35)); R(g, x0 + w - 1, y0, 1, ht, teinte(col, 0.7));
    R(g, x0 + 2, y0 + 6, 5, 8, teinte(col, 0.8)); R(g, x0 + 2, av > 0 ? y0 + 14 : y0 + 4, 5, 2, '#9fc4d8'); R(g, x0 + 2, av > 0 ? y0 + 4 : y0 + 14, 5, 2, '#6a8aa0');
    const avant = av > 0 ? y0 + ht - 1 : y0, arriere = av > 0 ? y0 : y0 + ht - 1;
    P(g, x0 + 1, avant, '#fff6c0'); P(g, x0 + w - 2, avant, '#fff6c0'); P(g, x0 + 1, arriere, '#d83a2a'); P(g, x0 + w - 2, arriere, '#d83a2a');
  }
}
function camion(g, x, y, dx, dy, t) {
  const h = dx !== 0, av = h ? dx : dy;
  const plateau = (bx, by, bw, bh) => {
    R(g, bx, by, bw, bh, '#7a5228');
    for (let i = 0; i < bw - 2; i += 6) for (let j = 0; j < bh - 2; j += 6) { R(g, bx + 1 + i, by + 1 + j, 5, 5, '#b47c44'); R(g, bx + 1 + i, by + 1 + j, 5, 1, '#d4a066'); P(g, bx + 3 + i, by + 3 + j, '#e8c860'); }
  };
  if (h) {
    const x0 = Math.round(x - 16), y0 = Math.round(y - 6);
    g.fillStyle = OMBRE; g.fillRect(x0 + 2, y0 + 3, 32, 12);
    plateau(av > 0 ? x0 : x0 + 10, y0, 22, 12);
    const cx = av > 0 ? x0 + 22 : x0; R(g, cx, y0, 10, 12, '#2a5a8a'); R(g, cx, y0, 10, 1, '#4a7aaa');
    R(g, av > 0 ? cx + 6 : cx + 1, y0 + 2, 3, 8, '#9fc4d8'); P(g, av > 0 ? cx + 9 : cx, y0 + 1, '#fff6c0'); P(g, av > 0 ? cx + 9 : cx, y0 + 10, '#fff6c0');
  } else {
    const x0 = Math.round(x - 6), y0 = Math.round(y - 16);
    g.fillStyle = OMBRE; g.fillRect(x0 + 2, y0 + 3, 12, 32);
    plateau(x0, av > 0 ? y0 : y0 + 10, 12, 22);
    const cy = av > 0 ? y0 + 22 : y0; R(g, x0, cy, 12, 10, '#2a5a8a'); R(g, x0, cy, 1, 10, '#4a7aaa');
    R(g, x0 + 2, av > 0 ? cy + 6 : cy + 1, 8, 3, '#9fc4d8'); P(g, x0 + 1, av > 0 ? cy + 9 : cy, '#fff6c0'); P(g, x0 + 10, av > 0 ? cy + 9 : cy, '#fff6c0');
  }
}
