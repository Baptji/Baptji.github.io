'use strict';
/* Rendu du champ, image par image. Coordonnées en pixels d'art (48 par case), affichés à k pixels d'écran.
   Couches : fond en cache (herbe, routes, ferme, terre des champs), plantes et arbres rangée par rangée (le vent les
   fait onduler), machines au semis et à la récolte, vie (vie.js), ciel (ombres des nuages, brume, pluie, neige,
   orage), puis repères de jeu (champs mûrs, survol, sélection, ondes de clic, trouvailles).
   Lit au moment de l'appel les globales de jeu.js : S, F, planDe, voisin, cle. */

const Rendu = {
  cv: null, g: null, k: 1, dpr: 1, echelle: 0.5, lisse: false,
  fond: document.createElement('canvas'), gf: null, cleFond: '', solCles: [], dernierSol: 0,
  sprites: new Map(), voisins: [], jourVoisins: -1,
  revel: new Map(), parts: [], ondes: [], eclats: [], murs: [], unitesMures: new Set(), dernierMur: 0,
  survol: null, selection: null, pointeur: null, ventForce: 0.5, ventDir: 0, pl: null, reduit: matchMedia('(prefers-reduced-motion: reduce)').matches,

  init(cv) {
    this.cv = cv; this.g = cv.getContext('2d'); this.gf = this.fond.getContext('2d');
  },
  preparer() {
    const pl = this.pl = planDe(F());
    this.fond.width = pl.w * T; this.fond.height = pl.h * T;
    this.cleFond = ''; this.revel.clear(); this.parts = []; this.jourVoisins = -1;
    Vie.init(pl, F());
    this.dimensionner();
  },
  dimensionner() {
    const pl = this.pl, champ = this.cv.closest('.champ'), dpr = this.dpr = devicePixelRatio || 1;
    const largeur = champ.clientWidth - 30, hauteur = innerWidth > 900 ? champ.clientHeight - 128 : Infinity;
    const W = pl.w * T, H = pl.h * T, maxi = Math.min(largeur * dpr / W, hauteur * dpr / H);
    let k = Math.min(Math.floor(maxi), 2 * dpr);
    if (k < 1) k = maxi;                                // écran trop petit : réduction lissée
    this.k = k; this.echelle = k / dpr; this.lisse = k % 1 !== 0;
    this.cv.style.width = W * this.echelle + 'px'; this.cv.style.height = H * this.echelle + 'px';
    this.cv.width = Math.round(W * k); this.cv.height = Math.round(H * k);
  },
  // Centre d'une case en pixels CSS de la fenêtre, et case sous le pointeur
  centre(tx, ty) {
    const r = this.cv.getBoundingClientRect();
    return { x: r.left + (tx + 0.5) * T * this.echelle, y: r.top + (ty + 0.5) * T * this.echelle };
  },
  sous(e) {
    const r = this.cv.getBoundingClientRect(), px = (e.clientX - r.left) / this.echelle, py = (e.clientY - r.top) / this.echelle;
    return { tx: Math.floor(px / T), ty: Math.floor(py / T), px, py };
  },

  // ---------- Vignettes en cache ----------
  sprite(cle, w, h, dessin) {
    let s = this.sprites.get(cle);
    if (!s && this.sprites.size > 5000) this.sprites.clear();
    if (!s) { s = document.createElement('canvas'); s.width = w; s.height = h; dessin(s.getContext('2d')); this.sprites.set(cle, s); }
    return s;
  },
  spritePlante(c, p, v, s, pourri) {
    const pas = p >= 1 ? 13 : Math.min(12, Math.floor(p * 13));
    const pp = p >= 1 ? 1 : p < 0.06 ? Math.round(p * 200) / 200 : pas / 13 + 0.02;
    return this.sprite(`p${c.id}|${p < 0.06 ? 'l' + Math.round(p * 200) : pas}|${v}|${s}|${pourri ? 1 : 0}`, T, T + MARGE, g => dessinerPlante(g, 0, MARGE, c, pp, v, s, pourri));
  },
  spriteSol(o, echelle, v) {
    const cle = `s${echelle[0]}|${Math.round(o.mo * 4)}|${Math.round(o.sec * 4)}|${o.residus ? 1 : 0}${o.couvert ? 1 : 0}${o.goutte ? 1 : 0}${o.fum ? 1 : 0}|${Math.ceil(o.chaume * 3)}|${v}`;
    return [cle, this.sprite(cle, T, T, g => terre(g, 0, 0, v * 17 + 3, 41, { ...o, mo: Math.round(o.mo * 4) / 4, sec: Math.round(o.sec * 4) / 4, chaume: Math.ceil(o.chaume * 3) / 3 }, echelle))];
  },
  spriteArbre(type, x, y, pal, palId, s) {
    const v = (hasard(x, y, 11) * 4) | 0;
    return this.sprite(`a${type}|${v}|${palId}|${s}|${type === 'a' ? this.orientationHaie(x, y) : ''}`, T + 24, T + MARGE + 8, g => {
      if (type === 'f') bosquet(g, 12, MARGE, v, 7, pal, s);
      else haie(g, 12, MARGE, x, y, pal, s, this.pl);
    });
  },
  orientationHaie(x, y) { const pl = this.pl; return (voisinType(pl, x, y - 1, 'a') || voisinType(pl, x, y + 1, 'a')) ? 'v' : 'h'; },

  // ---------- Champs voisins : culture de la PAC et stade d'après le calendrier ----------
  voisinDe(f, u, j) {
    if (this.jourVoisins !== j) { this.voisins = []; this.jourVoisins = j; }
    let v = this.voisins[u];
    if (v) return v;
    const vo = voisin(f, u, j);
    v = { type: vo.type, c: vo.c || null, p: null, chaume: 0 };
    if (vo.type === 'culture') {
      const d = dateDe(j);
      for (const an of [d.an, d.an - 1]) {
        const debut = indexJour(an, 0) + Math.round((Date.UTC(an, vo.c.semis[0] - 1, 15) - Date.UTC(an, 0, 1)) / MS_JOUR);
        let p = (j - debut) / vo.c.cycle;
        if (p < 0) continue;
        if (vo.c.hiver && p <= 1) {
          // pas plus de la moitié du cycle avant le 1er février, puis une reprise lente au printemps
          const fev = indexJour(an + 1, 31), fin = debut + vo.c.cycle;
          p = j < fev ? Math.min(0.5, p) : 0.5 + 0.5 * Math.pow(clamp01((j - fev) / Math.max(1, fin - fev)), 1.5);
        }
        if (p <= 1.08) v.p = Math.min(1, p);
        else if (['Céréales', 'Oléagineux'].includes(vo.c.cat)) v.chaume = clamp01(1 - ((p - 1.08) * vo.c.cycle) / 45);
        break;
      }
    }
    return (this.voisins[u] = v);
  },

  // ---------- Fond : reconstruit chaque semaine ; terre des champs possédés mise à jour par case ----------
  optionsSol(f, mode, c) {
    const ru = ruMax(f, c);
    return {
      mo: c.mo, sec: clamp01((0.4 - c.r / ru) / 0.3),
      residus: !mode.labour && (!c.cult || c.p < 0.4) && !mode.couvert, couvert: mode.couvert && !c.cult,
      goutte: mode.irrigation === 'goutte' && f.irrigation, fum: c.fum > 0,
      chaume: !c.cult && c.chaume != null ? clamp01(1 - (S.jour - c.chaume) / 45) : 0,
    };
  },
  solCase(f, mode, x, y) {
    const c = f.cases[x + ',' + y]; if (!c) return;
    const [cle, s] = this.spriteSol(this.optionsSol(f, mode, c), mode.echelle, (hasard(x, y, 5) * 3) | 0);
    const i = y * this.pl.w + x;
    if (this.solCles[i] === cle) return;
    this.solCles[i] = cle;
    this.gf.drawImage(s, x * T, y * T);
  },
  majFond(f, t) {
    const pl = this.pl, mode = MODES[f.mode], d = dateDe(S.jour);
    const cle = `${S.active}|${f.mode}|${d.an}|${Math.floor(d.doy / 7)}|${Math.round(f.sec * 4)}|${Object.keys(f.parcelles).length}`;
    if (cle !== this.cleFond) {
      this.cleFond = cle;
      const g = this.gf, s = couleursSaison(d.doy, f.sec);
      this.solCles = new Array(pl.w * pl.h).fill('');
      for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) {
        const ty = pl.types[y][x], X = x * T, Y = y * T;
        if (ty === 'c') {
          const u = pl.unite[y * pl.w + x];
          if (f.parcelles[u]) { this.solCase(f, mode, x, y); continue; }
          const v = this.voisinDe(f, u, S.jour);
          if (v.type === 'culture') terre(g, X, Y, x, y, { mo: 2.2, sec: f.sec * 0.6, chaume: v.p === null ? v.chaume : 0 }, 'champs');
          else herbe(g, X, Y, x, y, s, true);
        } else if (ty === 'r' || ty === 'p') route(g, X, Y, x, y, pl, ty, s);
        else if (ty === 'e') eau(g, X, Y, x, y);
        else if (ty === 'b') toit(g, X, Y, x, y, pl);
        else herbe(g, X, Y, x, y, s, false);
      }
      if (pl.ferme && mode.echelle === 'champs') fermeCarree(g, pl.ferme[0] * T, pl.ferme[1] * T, s);
      this.dernierSol = t;
    } else if (t - this.dernierSol > 300) {
      this.dernierSol = t;
      for (const k in f.cases) { const [x, y] = k.split(',').map(Number); this.solCase(f, mode, x, y); }
    }
  },

  // ---------- Vent : ondulation qui traverse les champs par rafales ----------
  vent(t, j, m) {
    const force = Math.min(1, 0.3 + 0.6 * hasard(j, 5, 9) + (m.pluie > 5 ? 0.25 : 0)), dir = -0.3 + 0.6 * hasard(j, 6, 9);
    const cx = Math.cos(dir), cy = Math.sin(dir);
    this.ventForce = force; this.ventDir = dir;
    return (x, y) => force * Math.sin(t / 480 - (x * cx + y * cy) * 0.8) * (0.55 + 0.45 * Math.sin(t / 2100 - x * 0.23 - y * 0.07));
  },

  // ---------- Animation d'un champ : machine qui passe case par case (semis ou récolte) ----------
  // cases : [[x, y], …] ; avant : Map 'x,y' → { c, p, v, pourri } pour la récolte. Rend [{ x, y, fin }] (ms depuis maintenant).
  animerChamp(cases, type, machine, avant, retard = 0) {
    const rangs = new Map();
    for (const [x, y] of cases) { if (!rangs.has(y)) rangs.set(y, []); rangs.get(y).push(x); }
    const ys = [...rangs.keys()].sort((a, b) => a - b), ordre = [];
    ys.forEach((y, r) => { const xs = rangs.get(y).sort((a, b) => a - b); if (r % 2) xs.reverse(); for (const x of xs) ordre.push([x, y, r % 2 ? -1 : 1]); });
    const dur = this.reduit ? 1 : machine === 'personne' ? 300 : machine ? 230 : 160, t0 = performance.now() + retard, sortie = [];
    ordre.forEach(([x, y, sens], i) => {
      const k = x + ',' + y, a = avant?.get(k);
      this.revel.set(y * this.pl.w + x, { t0: t0 + i * dur, dur, sens, type, avant: a || null, machine: i === ordre.length - 1 ? machine && { dernier: true, type: machine } : machine && { type: machine } });
      sortie.push({ x, y, fin: retard + (i + 1) * dur });
    });
    return sortie;
  },

  // ---------- Image ----------
  dessiner(t, dt) {
    const f = F(), pl = this.pl, mode = MODES[f.mode], m = f.meteo || { tmin: 6, tmax: 14, pluie: 0, neige: 0 }, g = this.g;
    this.majFond(f, t);
    g.setTransform(this.k, 0, 0, this.k, 0, 0);
    g.imageSmoothingEnabled = this.lisse;
    g.drawImage(this.fond, 0, 0);
    Ciel.neigeAuSol(g, f, mode);
    const vent = this.reduit ? () => 0 : this.vent(t, S.jour, m), doy = dateDe(S.jour).doy;
    const pal = couleursFeuillage(doy), palId = Math.floor(doy / 6);
    if (t - this.dernierMur > 250) this.recenserMurs(f, t);
    // plantes et arbres, rangée par rangée
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) {
      const ty = pl.types[y][x];
      if (ty === 'c') this.planteCase(g, f, x, y, t, vent);
      else if (ty === 'f' || ty === 'a') g.drawImage(this.spriteArbre(ty, x, y, pal, palId, Math.max(-1, Math.min(1, Math.round(vent(x, y) * 1.3)))), x * T - 12, y * T - MARGE);
      else if (ty === 'e') this.reflets(g, x, y, t);
    }
    this.dessinerMachines(g, t);
    this.dessinerParticules(g, t, dt);
    Vie.dessinerSol(g, t, dt, f, m);
    Ciel.dessinerSol(g, t, f, m);
    Vie.dessinerAir(g, t, dt, f, m);
    Ciel.dessinerDessus(g, t, dt, f, m);
    this.dessinerReperes(g, t, f);
  },

  planteCase(g, f, x, y, t, vent) {
    const pl = this.pl, u = pl.unite[y * pl.w + x], i = y * pl.w + x, v = (hasard(x, y, 1) * 3) | 0;
    let c = null, p = 0, pourri = false;
    if (f.parcelles[u]) {
      const cs = f.cases[x + ',' + y];
      if (cs?.cult) { c = CULTURE[cs.cult]; p = cs.p; pourri = cs.mur > 12; }
    } else {
      const vo = this.voisinDe(f, u, S.jour);
      if (vo.type === 'culture' && vo.p !== null) { c = vo.c; p = vo.p; }
    }
    const w = vent(x, y), souple = c && SOUPLES.has(c.forme) && p > 0.25, s = souple ? Math.max(-2, Math.min(2, Math.round(w * 2.2))) : 0;
    const rv = this.revel.get(i);
    if (rv) {
      const a = (t - rv.t0) / rv.dur;
      if (a >= 1) this.revel.delete(i);
      else {
        const X = x * T, Y = y * T - MARGE, cut = Math.round(T * clamp01(a)), apres = c ? this.spritePlante(c, p, v, s, pourri) : null;
        const av = rv.avant ? this.spritePlante(rv.avant.c, rv.avant.p, rv.avant.v, s, rv.avant.pourri) : null;
        const [ax, aw, bx, bw] = rv.sens > 0 ? [X + cut, T - cut, X, cut] : [X, T - cut, X + T - cut, cut];
        if (av && aw > 0) g.drawImage(av, ax - X, 0, aw, T + MARGE, ax, Y, aw, T + MARGE);
        if (apres && bw > 0) g.drawImage(apres, bx - X, 0, bw, T + MARGE, bx, Y, bw, T + MARGE);
        return;
      }
    }
    if (!c) return;
    g.drawImage(this.spritePlante(c, p, v, s, pourri), x * T, y * T - MARGE);
    // reflet clair qui court sur les céréales mûrissantes
    if (p > 0.62 && w > 0.5 && (c.forme === 'epi' || c.forme === 'avoine')) { g.fillStyle = `rgba(255,244,200,${((w - 0.5) * 0.3).toFixed(2)})`; g.fillRect(x * T, y * T - 6, T, T + 6); }
  },
  reflets(g, x, y, t) {
    for (let i = 0; i < 4; i++) {
      const dx = ((t / 70 + hasard(x, y, i) * 48) % 48) | 0, yy = 6 + ((hasard(x, y, i + 9) * 36) | 0);
      g.fillStyle = 'rgba(200,230,250,.55)'; g.fillRect(x * T + dx, y * T + yy, Math.min(5, 48 - dx), 1);
    }
  },

  // ---------- Machines ----------
  dessinerMachines(g, t) {
    for (const [i, rv] of this.revel) {
      if (!rv.machine) continue;
      const a = (t - rv.t0) / rv.dur;
      if (a < 0 || a >= 1) continue;
      const x = i % this.pl.w, y = (i / this.pl.w) | 0, cx = x * T + (rv.sens > 0 ? a : 1 - a) * T, cy = y * T + T * 0.62;
      const type = rv.machine.type;
      g.save(); g.translate(Math.round(cx), Math.round(cy));
      if (rv.sens < 0) g.scale(-1, 1);
      if (type === 'personne') personne(g, -6, -24, t);
      else if (type === 'moissonneuse') moissonneuse(g, -50, -33, t);
      else if (type === 'semoir') tracteur(g, 2, -25, t, '#c8402a', type);
      else tracteur(g, -6, -25, t, '#3f7a3a', type);
      g.restore();
      // poussière, paille, terre
      if (Math.random() < 0.7 && !this.reduit) {
        const derriere = cx - rv.sens * (type === 'moissonneuse' ? 54 : type === 'arracheuse' ? 34 : 16);
        const col = type === 'moissonneuse' ? (Math.random() < 0.5 ? '#e8d08a' : '#c8a860') : type === 'arracheuse' ? '#8a6440' : '#b89870';
        this.parts.push({ x: derriere, y: cy - 4 + Math.random() * 6, vx: -rv.sens * (8 + Math.random() * 14), vy: -10 - Math.random() * 14, g: 30, t0: t, vie: 700 + Math.random() * 500, col, a: 0.8 });
      }
    }
  },
  dessinerParticules(g, t, dt) {
    const s = dt / 1000;
    this.parts = this.parts.filter(p => {
      const a = (t - p.t0) / p.vie;
      if (a >= 1) return false;
      p.x += p.vx * s; p.y += p.vy * s; p.vy += p.g * s;
      g.globalAlpha = p.a * (1 - a); g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), p.taille || 1, p.taille || 1);
      return true;
    });
    g.globalAlpha = 1;
  },
  // Petites graines lancées au semis case par case
  graines(x, y) {
    const t = performance.now(), cx = x * T + T / 2, cy = y * T + T / 2;
    for (let i = 0; i < 12; i++) { const a = Math.PI * (1.1 + i / 14), v = 20 + Math.random() * 30; this.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10, g: 120, t0: t, vie: 420, col: i % 2 ? '#d8b878' : '#8a6440', a: 1 }); }
  },
  onde(px, py) { this.ondes.push({ x: px, y: py, t0: performance.now() }); },

  // ---------- Repères : champs mûrs, survol, sélection, ondes, trouvaille ----------
  recenserMurs(f, t) {
    this.dernierMur = t; this.murs = []; this.unitesMures = new Set();
    const pl = this.pl;
    for (const k in f.cases) { const c = f.cases[k]; if (c.cult && c.p >= 1) { const [x, y] = k.split(',').map(Number); this.murs.push([x, y]); this.unitesMures.add(pl.unite[y * pl.w + x]); } }
  },
  contour(g, u, coul, lw, seulX, seulY) {
    const pl = this.pl, meme = (x, y) => x >= 0 && y >= 0 && x < pl.w && y < pl.h && pl.unite[y * pl.w + x] === u;
    g.fillStyle = coul;
    const cases = seulX != null ? [[seulX, seulY]] : Rendu.casesUnite(u);
    for (const [x, y] of cases) {
      const autre = seulX != null ? () => false : meme;
      if (!autre(x, y - 1)) g.fillRect(x * T, y * T, T, lw);
      if (!autre(x, y + 1)) g.fillRect(x * T, (y + 1) * T - lw, T, lw);
      if (!autre(x - 1, y)) g.fillRect(x * T, y * T, lw, T);
      if (!autre(x + 1, y)) g.fillRect((x + 1) * T - lw, y * T, lw, T);
    }
  },
  _casesUnite: new Map(),
  casesUnite(u) {
    const pl = this.pl, cle = pl.w + '|' + pl.h + '|' + u;
    let c = this._casesUnite.get(cle);
    if (!c) { c = []; for (let i = 0; i < pl.unite.length; i++) if (pl.unite[i] === u) c.push([i % pl.w, (i / pl.w) | 0]); this._casesUnite.set(cle, c); }
    return c;
  },
  dessinerReperes(g, t, f) {
    const pl = this.pl;
    // limite de la ferme : liseré doré sur les bords des champs possédés
    for (const [coul, l, o] of [['rgba(40,24,8,.35)', 1, 2], ['rgba(250,222,140,.8)', 2, 0]]) {
      g.fillStyle = coul;
      for (const k in f.cases) {
        const [x, y] = k.split(',').map(Number), a = (dx, dy) => f.cases[(x + dx) + ',' + (y + dy)];
        if (!a(0, -1)) g.fillRect(x * T, y * T + o, T, l);
        if (!a(0, 1)) g.fillRect(x * T, y * T + T - l - o, T, l);
        if (!a(-1, 0)) g.fillRect(x * T + o, y * T, l, T);
        if (!a(1, 0)) g.fillRect(x * T + T - l - o, y * T, l, T);
      }
    }
    // champs mûrs : contour qui palpite et étincelles
    const puls = 0.45 + 0.35 * Math.sin(t / 260);
    for (const u of this.unitesMures) this.contour(g, u, `rgba(255,214,90,${puls.toFixed(2)})`, 2);
    if (this.murs.length && !this.reduit && Math.random() < Math.min(0.9, 0.12 + this.murs.length * 0.02)) {
      const [x, y] = this.murs[(Math.random() * this.murs.length) | 0];
      this.eclats.push({ x: x * T + 4 + Math.random() * 40, y: y * T - 4 + Math.random() * 40, t0: t, vie: 650 });
    }
    this.eclats = this.eclats.filter(e => {
      const a = (t - e.t0) / e.vie; if (a >= 1) return false;
      const l = Math.round(Math.sin(a * Math.PI) * 3), x = Math.round(e.x), y = Math.round(e.y);
      g.fillStyle = '#fffbe0'; g.fillRect(x, y, 1, 1);
      g.fillStyle = 'rgba(255,240,170,.9)'; if (l) { g.fillRect(x - l, y, l, 1); g.fillRect(x + 1, y, l, 1); g.fillRect(x, y - l, 1, l); g.fillRect(x, y + 1, 1, l); }
      return true;
    });
    // trouvaille à ramasser
    const tr = S.trouvaille;
    if (tr && tr.ferme === f.id) {
      const bond = Math.abs(Math.sin(t / 300)) * 4, x = tr.x * T + 24, y = tr.y * T + 22 - bond;
      g.fillStyle = 'rgba(30,18,8,.25)'; g.fillRect(x - 4, tr.y * T + 30, 9, 2);
      g.fillStyle = '#fff3b0'; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(x, y - 4, 1, 9); g.fillRect(x - 4, y, 9, 1);
      if (Math.random() < 0.25) this.eclats.push({ x: x - 8 + Math.random() * 16, y: y - 8 + Math.random() * 14, t0: t, vie: 500 });
    }
    // survol et sélection
    if (this.survol) {
      const { tx, ty } = this.survol, u = tx >= 0 && ty >= 0 && tx < pl.w && ty < pl.h ? pl.unite[ty * pl.w + tx] : -1;
      if (u >= 0) {
        const a = 0.55 + 0.25 * Math.sin(t / 200);
        this.contour(g, u, `rgba(255,255,255,${a.toFixed(2)})`, 2);
        if (f.parcelles[u]) { g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(tx * T, ty * T, T, T); }
      }
    }
    const sel = this.selection;
    if (sel?.type === 'parcelle') this.contour(g, sel.u, '#ffe27a', 2);
    if (sel?.type === 'case') this.contour(g, -1, '#ffe27a', 2, sel.tx, sel.ty);
    // ondes de clic
    this.ondes = this.ondes.filter(o => {
      const a = (t - o.t0) / 420; if (a >= 1) return false;
      g.strokeStyle = `rgba(255,255,255,${(0.8 * (1 - a)).toFixed(2)})`; g.lineWidth = 2;
      g.beginPath(); g.arc(o.x, o.y, 4 + a * 22, 0, Math.PI * 2); g.stroke();
      return true;
    });
  },
};

// ---------- Machines (vue de côté, tournées vers la droite) ----------
function roue(g, cx, cy, r, t) {
  disque(g, cx, cy, r, '#2a2622'); disque(g, cx, cy, r - 1, '#3a3430');
  disque(g, cx, cy, Math.max(1, r - 3), '#a8a498'); if (r > 5) disque(g, cx, cy, r - 5, '#8a8680');
  const a = t / 120;
  for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; P(g, cx + Math.round(Math.cos(b) * (r - 1)), cy + Math.round(Math.sin(b) * (r - 1)), '#14100c'); }
  P(g, cx, cy, '#5a5650');
}
// Tracteur (36 × 26) avec son semoir ou sa remorque derrière
function tracteur(g, x, y, t, coul, outil) {
  const c = Math.floor(t / 110) % 2, cl = teinte(coul, 1.3), so = teinte(coul, 0.7);
  ellipse(g, x + 18, y + 25, 19, 2, OMBRE);
  if (outil === 'semoir') {
    R(g, x - 19, y + 11, 17, 8, '#d8a830'); R(g, x - 19, y + 11, 17, 2, '#f2cc5a'); R(g, x - 19, y + 18, 17, 1, '#a07018');
    R(g, x - 17, y + 8, 13, 3, '#c89a28'); R(g, x - 17, y + 8, 13, 1, '#e8be48');
    for (let i = 0; i < 5; i++) { R(g, x - 18 + i * 4, y + 19, 1, 4, '#5a4a3a'); disque(g, x - 18 + i * 4, y + 23, 1, '#3a3430'); }
    R(g, x - 3, y + 15, 6, 2, '#4a4038');
  } else if (outil === 'arracheuse') {
    R(g, x - 30, y + 7, 26, 12, '#8a6a42'); R(g, x - 30, y + 7, 26, 2, '#a88a5a'); R(g, x - 30, y + 18, 26, 1, '#5a4228');
    for (let i = 0; i < 9; i++) disque(g, x - 28 + i * 3, y + 6 - (i % 2), 2, i % 3 ? '#c9a070' : '#b88a5a');
    roue(g, x - 17, y + 21, 4, t); R(g, x - 4, y + 15, 6, 2, '#4a4038');
  }
  R(g, x + 12, y + 8 + c, 20, 10, coul); R(g, x + 12, y + 8 + c, 20, 2, cl); R(g, x + 12, y + 17 + c, 20, 1, so);
  for (let i = 0; i < 3; i++) R(g, x + 15 + i * 5, y + 11 + c, 3, 1, so);
  R(g, x + 32, y + 9 + c, 3, 9, '#3a3a3a'); for (let i = 0; i < 4; i++) R(g, x + 32, y + 10 + c + i * 2, 3, 1, '#7a7a7a');
  R(g, x + 31, y + 8 + c, 3, 2, '#fff2b0');
  R(g, x + 24, y + 1 + c, 2, 7, '#3a3430'); R(g, x + 23, y + c, 4, 2, '#2a2420');
  R(g, x + 4, y + 10 + c, 9, 8, so); R(g, x + 6, y + 4 + c, 6, 8, '#3a5a8a'); R(g, x + 6, y + 4 + c, 6, 1, '#5a7aaa');
  R(g, x + 7, y - 1 + c, 5, 5, '#e8b88a'); P(g, x + 10, y + 1 + c, '#3a2a1a');
  R(g, x + 4, y - 2 + c, 10, 2, '#d8b050'); R(g, x + 6, y - 4 + c, 6, 2, '#c8a040');
  ligne(g, x + 12, y + 6 + c, x + 15, y + 9 + c, '#2a2a2a'); P(g, x + 11, y + 6 + c, '#e8b88a');
  R(g, x + 1, y + 7 + c, 17, 2, so);
  roue(g, x + 9, y + 17, 8, t); roue(g, x + 28, y + 21, 4, t * 2);
}
// Moissonneuse-batteuse (60 × 34), barre de coupe et rabatteur à l'avant
function moissonneuse(g, x, y, t) {
  const c = Math.floor(t / 130) % 2, rouge = '#c8402a', cl = '#e86a4a', so = '#8a2a1a', a = t / 160;
  ellipse(g, x + 30, y + 33, 30, 2, OMBRE);
  R(g, x + 44, y + 20, 16, 8, '#c8b040'); R(g, x + 44, y + 27, 16, 1, '#8a7a2a'); R(g, x + 44, y + 20, 16, 1, '#e8d060');
  for (let i = 0; i < 5; i++) R(g, x + 45 + i * 3, y + 28, 1, 2, '#5a5a5a');
  for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; ligne(g, x + 52, y + 17, x + 52 + Math.round(Math.cos(b) * 7), y + 17 + Math.round(Math.sin(b) * 6), '#e8c848'); }
  disque(g, x + 52, y + 17, 1, '#6a5a2a');
  R(g, x + 4, y + 10 + c, 40, 16, rouge); R(g, x + 4, y + 10 + c, 40, 2, cl); R(g, x + 4, y + 25 + c, 40, 1, so);
  for (let i = 0; i < 4; i++) R(g, x + 8 + i * 8, y + 15 + c, 5, 1, so);
  R(g, x + 6, y + 3 + c, 18, 7, '#e8d08a'); R(g, x + 6, y + 3 + c, 18, 2, '#f6e4a8'); R(g, x + 5, y + 9 + c, 20, 1, so);
  ligne(g, x + 6, y + 6 + c, x - 6, y + 2 + c, '#9a2a1a'); R(g, x - 8, y + 1 + c, 3, 3, '#6a1a10');
  R(g, x + 28, y + 1 + c, 14, 10, rouge); R(g, x + 30, y + 3 + c, 10, 6, '#9fc4d8'); R(g, x + 30, y + 3 + c, 4, 2, '#d8ecf4'); R(g, x + 27, y + c, 16, 2, so);
  roue(g, x + 14, y + 26, 7, t); roue(g, x + 37, y + 28, 5, t);
}
// Maraîcher (12 × 26) au chapeau de paille, panier au bras
function personne(g, x, y, t) {
  const pas = Math.floor(t / 160) % 2;
  ellipse(g, x + 6, y + 25, 5, 1, OMBRE);
  R(g, x + 1, y + 2, 10, 2, '#d8b050'); R(g, x + 3, y, 6, 2, '#c8a040'); R(g, x + 3, y + 4, 6, 5, '#e8b88a'); P(g, x + 7, y + 6, '#3a2a1a');
  R(g, x + 2, y + 9, 8, 8, '#3a5a8a'); R(g, x + 2, y + 9, 8, 1, '#5a7aaa'); R(g, x + 4, y + 9, 1, 8, '#2a4a7a');
  R(g, x + 9, y + 11, 2, 5, '#e8b88a');
  R(g, x + 9, y + 15, 5, 4, '#a87a42'); R(g, x + 9, y + 15, 5, 1, '#c89a62'); P(g, x + 10, y + 14, '#7cbf52'); P(g, x + 12, y + 14, '#e86a3a');
  R(g, x + 3 + pas, y + 17, 2, 8, '#4a3a2a'); R(g, x + 7 - pas, y + 17, 2, 8, '#4a3a2a'); R(g, x + 2 + pas, y + 24, 3, 1, '#2a2018'); R(g, x + 6 - pas, y + 24, 3, 1, '#2a2018');
}

// ---------- Ciel : ombres des nuages, brume, pluie, neige, orage, lumière des saisons ----------
const Ciel = {
  gouttes: [], flocons: [], nuages: [], eclair: null, prochainEclair: 0, jour: -1, formes: null, neigeMotif: null,
  preparer() {
    this.formes = [0, 1, 2, 3].map(n => {
      const c = document.createElement('canvas'); c.width = 420; c.height = 240;
      const g = c.getContext('2d');
      for (let i = 0; i < 7; i++) {
        const x = 90 + hasard(n, i, 1) * 240, y = 70 + hasard(n, i, 2) * 100, r = 40 + hasard(n, i, 3) * 60;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.7, 'rgba(0,0,0,.8)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      return c;
    });
    const n = document.createElement('canvas'); n.width = n.height = 96;
    const g = n.getContext('2d'); g.fillStyle = '#f4f8fc'; g.fillRect(0, 0, 96, 96);
    for (let i = 0; i < 260; i++) { g.fillStyle = i % 3 ? '#ffffff' : '#dce6f0'; g.fillRect((hasard(i, 1, 1) * 96) | 0, (hasard(i, 2, 1) * 96) | 0, 1 + (i % 2), 1); }
    this.neigeMotif = n;
  },
  nouveauJour(j, m, W, H) {
    this.jour = j;
    const couvert = m.pluie + m.neige > 1, n = couvert ? 0 : Math.round(hasard(j, 3, 3) * 4);
    while (this.nuages.length < n) this.nuages.push({ x: -420 - Math.random() * W * 0.5, y: Math.random() * (H - 120) - 60, f: (Math.random() * 4) | 0, v: 6 + Math.random() * 6, s: 0.8 + Math.random() * 0.8 });
    this.nuages.length = Math.min(this.nuages.length, n);
  },
  // Neige au sol, sous les plantes et les arbres ; la ferme et les maisons du village restent lisibles
  neigeAuSol(g, f, mode) {
    const neige = Math.min(0.92, f.neigeSol / 8);
    if (neige <= 0.02) return;
    if (!this.formes) this.preparer();
    const pl = Rendu.pl, W = pl.w * T, H = pl.h * T;
    g.save(); g.beginPath(); g.rect(0, 0, W, H);
    if (pl.ferme && mode.echelle === 'champs') g.rect(pl.ferme[0] * T + 10, pl.ferme[1] * T + 12, 4 * T - 20, 4 * T - 20);
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) if (pl.types[y][x] === 'b') g.rect(x * T, y * T, T, T);
    g.clip('evenodd');
    g.globalAlpha = neige; g.fillStyle = g.createPattern(this.neigeMotif, 'repeat'); g.fillRect(0, 0, W, H);
    g.restore(); g.globalAlpha = 1;
  },
  dessinerSol(g, t, f, m) {
    const pl = Rendu.pl, W = pl.w * T, H = pl.h * T;
    if (!this.formes) this.preparer();
    if (this.jour !== S.jour) this.nouveauJour(S.jour, m, W, H);
    const neige = Math.min(0.92, f.neigeSol / 8);
    // gelée blanche qui scintille
    if (m.tmin < -0.5 && neige < 0.1 && !Rendu.reduit) for (let i = 0; i < 26; i++) {
      const x = (hasard(i, Math.floor(t / 700 + i * 0.37), 4) * W) | 0, y = (hasard(i, Math.floor(t / 700 + i * 0.37), 5) * H) | 0;
      g.fillStyle = 'rgba(240,248,255,.9)'; g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y, 3, 1);
    }
    // ombres des nuages qui glissent
    const dt = 1 / 60;
    for (const n of this.nuages) {
      if (!Rendu.reduit) n.x += n.v * dt * (0.6 + Rendu.ventForce);
      if (n.x > W + 40) { n.x = -420 * n.s - Math.random() * 200; n.y = Math.random() * (H - 120) - 60; }
      g.globalAlpha = 0.13; g.drawImage(this.formes[n.f], Math.round(n.x), Math.round(n.y), 420 * n.s, 240 * n.s);
    }
    g.globalAlpha = 1;
  },
  dessinerDessus(g, t, dt, f, m) {
    const pl = Rendu.pl, W = pl.w * T, H = pl.h * T, s = Math.min(0.05, dt / 1000), d = dateDe(S.jour), eau = m.pluie + m.neige;
    // lumière des saisons et du temps
    if (m.neige > 0.3) { g.fillStyle = 'rgba(200,210,225,.12)'; g.fillRect(0, 0, W, H); }
    else if (eau > 1) { g.fillStyle = `rgba(30,40,60,${Math.min(0.22, 0.08 + eau * 0.006).toFixed(3)})`; g.fillRect(0, 0, W, H); }
    else if (m.tmax >= 28) { g.fillStyle = `rgba(255,170,60,${Math.min(0.1, (m.tmax - 27) * 0.012).toFixed(3)})`; g.fillRect(0, 0, W, H); }
    else if (d.mois === 12 || d.mois <= 2) { g.fillStyle = 'rgba(150,180,220,.07)'; g.fillRect(0, 0, W, H); }
    // brume des matins d'automne et d'hiver
    if ((d.mois >= 10 || d.mois <= 3) && m.tmax - m.tmin < 4 && eau < 1) {
      for (let i = 0; i < 5; i++) {
        const x = ((t / 90 * (0.5 + i * 0.12) + i * 400) % (W + 600)) - 300, y = (i + 0.5) * H / 5;
        g.globalAlpha = 0.22; g.drawImage(this.formes[i % 4], x, y - 90, 640, 180);
      }
      g.globalAlpha = 1;
      g.fillStyle = 'rgba(230,236,240,.18)'; g.fillRect(0, 0, W, H);
    }
    if (Rendu.reduit) return;
    // pluie
    const neige = m.neige > 0.3, voulu = eau < 0.3 ? 0 : Math.min(neige ? 160 : 260, Math.round(24 + eau * (neige ? 8 : 10)));
    const tab = neige ? this.flocons : this.gouttes;
    (neige ? this.gouttes : this.flocons).length = 0;
    while (tab.length < voulu) tab.push({ x: Math.random() * W, y: Math.random() * H, v: 0.7 + Math.random() * 0.6 });
    tab.length = voulu;
    if (voulu) {
      if (neige) {
        g.fillStyle = 'rgba(255,255,255,.92)';
        for (const p of tab) {
          p.y += 18 * p.v * s; p.x += (Math.sin(t / 600 + p.v * 9) * 10 + 6) * s;
          if (p.y > H) { p.y = -2; p.x = Math.random() * W; } if (p.x > W) p.x = 0;
          g.fillRect(p.x | 0, p.y | 0, p.v > 1 ? 2 : 1, p.v > 1 ? 2 : 1);
        }
      } else {
        g.fillStyle = 'rgba(190,215,240,.55)';
        for (const p of tab) {
          p.y += 260 * p.v * s; p.x -= 50 * p.v * s;
          if (p.y > H) { p.y = -6; p.x = Math.random() * (W + 60); } if (p.x < -4) p.x += W;
          g.fillRect(p.x | 0, p.y | 0, 1, 5);
        }
        g.fillStyle = 'rgba(210,230,250,.7)';
        for (let i = 0; i < Math.min(14, voulu / 12); i++) { const x = (Math.random() * W) | 0, y = (Math.random() * H) | 0; g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.fillRect(x, y - 1, 1, 1); }
      }
    }
    // orage d'été : éclairs
    const orage = m.pluie >= 15 && m.tmax >= 21;
    if (orage && t > this.prochainEclair) {
      this.prochainEclair = t + 2500 + Math.random() * 6000;
      const pts = []; let x = Math.random() * W, y = 0;
      while (y < H * (0.4 + Math.random() * 0.4)) { pts.push([x, y]); x += (Math.random() - 0.5) * 60; y += 20 + Math.random() * 30; }
      this.eclair = { t0: t, pts };
    }
    if (this.eclair) {
      const a = (t - this.eclair.t0) / 380;
      if (a >= 1) this.eclair = null;
      else {
        g.fillStyle = `rgba(235,240,255,${(0.42 * (1 - a) * (a < 0.15 ? 1 : 0.6)).toFixed(3)})`; g.fillRect(0, 0, W, H);
        if (a < 0.35) { g.strokeStyle = '#fbf8ff'; g.lineWidth = 2; g.beginPath(); this.eclair.pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
      }
    }
  },
};
