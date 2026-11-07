'use strict';
/* Squid Ferme : cartes tirées d'une graine.
   La même graine dans la même région donne la même carte sur tous les navigateurs : on peut se la passer.
   Le lieu sort au format de donnees/lieux.js, lu tel quel par jeu.js, decor.js, rendu.js et vie.js :
     champs    32 × 24 cases de 50 m (grande culture, ACS, agroforesterie) ;
     planches  32 × 24 cases de 10 m (maraîchage) ;
     types     une chaîne par rangée : c champ · h herbe · r route · p chemin · m ferme · b bâti · f bois · a haie · e mare ;
     unite     numéro de parcelle de chaque case (−1 hors parcelle) ;
     unites    { n cases, surf ha, rpg { 2015…2024 : code PAC }, rot : la rotation du voisin } ;
     ferme     coin haut-gauche de l'emprise 4 × 4 (champs) ou une case du bâti de la ferme (planches).
   On trace d'abord dans un sens fixe (départementale à l'horizontale), puis la carte est retournée au hasard. */
const Carte = (() => {
  const W = 32, H = 24, ANS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  // ---------- Hasard reproductible (même graine, même suite de nombres) ----------
  function hacher(s) {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^ h >>> 16) >>> 0;
  }
  function tirage(graine) {
    let a = hacher(graine);
    const r = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    r.ent = (x, y) => x + Math.floor(r() * (y - x + 1));
    r.choix = t => t[Math.floor(r() * t.length)];
    r.p = p => r() < p;
    return r;
  }
  const LETTRES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const nouvelleGraine = () => Array.from({ length: 6 }, () => LETTRES[Math.floor(Math.random() * LETTRES.length)]).join('');
  const normaliser = g => String(g || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  const idDe = (graine, region) => region + '-' + normaliser(graine);

  // ---------- Systèmes agricoles : rotations des voisins, nombre de prés, haies ----------
  // Codes PAC lus par jeu.js (RPG_CULTURE, RPG_HERBE) : PPH prairie permanente (pâturée), PRL prairie temporaire (fauchée).
  const SYSTEMES = {
    nord: { rot: [['BTN', 'BTH', 'PTC', 'BTH', 'ORP'], ['BTN', 'BTH', 'CZH', 'BTH', 'ORH'], ['LIP', 'BTH', 'BTN', 'BTH', 'PPR'], ['PTC', 'BTH', 'FVP', 'BTH', 'BTN', 'BTH']], pres: [1, 2], hameau: 0.75 },
    plaine: { rot: [['CZH', 'BTH', 'ORH'], ['BTN', 'BTH', 'ORP', 'CZH', 'BTH'], ['PPR', 'BTH', 'CZH', 'BTH', 'ORH'], ['MIS', 'BTH', 'ORP', 'BTH']], pres: [1, 1], hameau: 0.5 },
    bocage: { rot: [['MIS', 'BTH', 'PRL', 'PRL', 'PRL'], ['MIS', 'MIS', 'BTH', 'ORH'], ['MIS', 'BTH', 'PRL', 'PRL', 'BTH'], ['BTH', 'MIS', 'ORP', 'PRL']], pres: [4, 7], hameau: 0.55, haies: true },
    sud: { rot: [['TRN', 'BDH', 'SOG', 'BDH'], ['MIS', 'MIS', 'SOJ', 'BTH'], ['TRN', 'BTH', 'CZH', 'BTH'], ['TRN', 'BDH', 'FVP', 'BDH'], ['MIS', 'BTH', 'TRN', 'ORH']], pres: [1, 2], hameau: 0.5 },
  };
  const SYSTEME_DE = {
    flandre: 'nord', artois: 'nord', monchy: 'nord', santerre: 'nord', caux: 'nord',
    'plaine-caen': 'plaine', brie: 'plaine', beauce: 'plaine', gatinais: 'plaine', champagne: 'plaine', lorraine: 'plaine', alsace: 'plaine',
    bourgogne: 'plaine', sologne: 'plaine', berry: 'plaine', touraine: 'plaine', poitou: 'plaine', limagne: 'plaine',
    cotentin: 'bocage', thierache: 'bocage', 'franche-comte': 'bocage', bresse: 'bocage', nivernais: 'bocage', anjou: 'bocage', 'pays-nantais': 'bocage',
    leon: 'bocage', rennes: 'bocage', cornouaille: 'bocage', limousin: 'bocage', segala: 'bocage', savoie: 'bocage',
  };
  const systemeDe = region => SYSTEMES[SYSTEME_DE[region] || 'sud'];
  // Rotations des lots de maraîchage voisins
  const ROT_LEGUMES = [['PTC', 'POR', 'CAR', 'CHU', 'OIG', 'HAR'], ['CAR', 'CHU', 'PTC', 'EPI', 'POR'], ['OIG', 'HAR', 'PTC', 'CHU', 'CAR'], ['FRA', 'FRA', 'FRA', 'PTC', 'POR']];

  const LIEUXDITS = ['Le Mesnil', 'La Grande Couture', 'Les Hauts Champs', 'Le Plessis', 'La Croix Blanche', 'Le Moulin Brûlé', 'La Haie aux Merles',
    'Le Bois des Dames', 'Les Longues Raies', 'La Motte', 'Le Val Saint-Martin', 'Les Terres Noires', 'La Ferme des Tilleuls', 'Le Champ du Puits',
    'La Belle Épine', 'Les Quatre Vents', 'Le Petit Marais', 'La Vallée aux Prés', 'Le Fond des Saules', 'Les Alouettes', 'La Cense du Mont',
    'Le Tertre', 'Les Grands Ormes', 'La Mare aux Canes', 'Le Clos Fleuri', 'La Pierre Levée', 'Les Sablons', 'Le Haut Buisson', 'La Charmoye',
    'Les Coudrais', 'Le Pré Saint-Jean', 'La Garenne', 'Les Noyers', 'Le Chêne Rond', 'La Vieille Ferme', 'Les Riez', 'Le Bocquet', 'La Sablonnière'];

  // ---------- Outils de grille ----------
  const grille = v => Array.from({ length: H }, () => new Array(W).fill(v));
  const dans = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const V4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // Composantes connexes (4 voisins) des cases qui vérifient ok(x, y)
  function composantes(ok) {
    const vu = grille(false), out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (vu[y][x] || !ok(x, y)) continue;
      const c = [[x, y]]; vu[y][x] = true;
      for (let k = 0; k < c.length; k++) for (const [dx, dy] of V4) { const nx = c[k][0] + dx, ny = c[k][1] + dy; if (dans(nx, ny) && !vu[ny][nx] && ok(nx, ny)) { vu[ny][nx] = true; c.push([nx, ny]); } }
      out.push(c);
    }
    return out;
  }
  // Parcelles : chaque morceau d'un seul tenant devient une parcelle ; les trop petits rejoignent le voisin qui les borde le plus
  function parcelles(lab, T, min) {
    // une étiquette peut couvrir plusieurs morceaux : chacun devient une parcelle
    let n = 0; const nouv = grille(-1);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (lab[y][x] < 0 || nouv[y][x] >= 0) continue;
      const l = lab[y][x], pile = [[x, y]]; nouv[y][x] = n;
      while (pile.length) { const [a, b] = pile.pop(); for (const [dx, dy] of V4) { const nx = a + dx, ny = b + dy; if (dans(nx, ny) && lab[ny][nx] === l && nouv[ny][nx] < 0) { nouv[ny][nx] = n; pile.push([nx, ny]); } } }
      n++;
    }
    for (let tour = 0; tour < 4; tour++) {
      // taille et emprise de chaque parcelle : trop petite, ou large d'une seule case, elle est absorbée
      const taille = new Map(), boite = new Map();
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const l = nouv[y][x]; if (l < 0) continue; taille.set(l, (taille.get(l) || 0) + 1); const b = boite.get(l) || [x, y, x, y]; boite.set(l, [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)]); }
      let change = false;
      for (const [l, t] of taille) {
        const b = boite.get(l);
        if (t >= min && b[2] > b[0] && b[3] > b[1]) continue;
        const bord = new Map();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (nouv[y][x] === l) for (const [dx, dy] of V4) { const nx = x + dx, ny = y + dy; if (dans(nx, ny) && nouv[ny][nx] >= 0 && nouv[ny][nx] !== l) bord.set(nouv[ny][nx], (bord.get(nouv[ny][nx]) || 0) + 1); }
        const dest = [...bord.entries()].sort((a, b) => b[1] - a[1])[0];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (nouv[y][x] === l) { if (dest) nouv[y][x] = dest[0]; else { nouv[y][x] = -1; T[y][x] = 'h'; } }
        change = true;
      }
      if (!change) break;
    }
    return nouv;
  }
  // Numérote les parcelles de haut en bas puis de gauche à droite, et les décrit
  function numeroter(lab, decrire) {
    const vus = new Map(), ordre = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const l = lab[y][x]; if (l >= 0 && !vus.has(l)) { vus.set(l, ordre.length); ordre.push(l); } }
    const unite = [], n = new Array(ordre.length).fill(0);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const l = lab[y][x], u = l >= 0 ? vus.get(l) : -1; unite.push(u); if (u >= 0) n[u]++; }
    return { unite, unites: ordre.map((l, u) => decrire(l, n[u])) };
  }
  function rpgDe(rot, decalage) {
    const rpg = {}; ANS.forEach((an, i) => { rpg[an] = rot[(i + decalage) % rot.length]; });
    return { rpg, rot: rot.map((_, i) => rot[(i + decalage) % rot.length]) };
  }
  // Miroirs : la même carte vue de l'autre côté (gauche-droite, haut-bas)
  function retourner(T, lab, mx, my) {
    const X = x => mx ? W - 1 - x : x, Y = y => my ? H - 1 - y : y;
    const T2 = grille('h'), L2 = grille(-1);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { T2[Y(y)][X(x)] = T[y][x]; L2[Y(y)][X(x)] = lab[y][x]; }
    return [T2, L2];
  }

  // ---------- Champs : cases de 50 m ----------
  function champs(r, sys) {
    const T = grille('c'), pre = grille(false);
    const libre = (x, y) => dans(x, y) && T[y][x] === 'c' && !pre[y][x];
    // 1. la départementale, d'un bord à l'autre
    const ry = r.ent(8, 15);
    for (let x = 0; x < W; x++) T[ry][x] = 'r';
    // 2. une route qui la croise ou s'y embranche
    let rx = -99, rxHaut = false, rxBas = false;
    if (r.p(0.55)) {
      rx = r.ent(9, 22); const genre = r.choix(['tout', 'haut', 'bas']);
      rxHaut = genre !== 'bas'; rxBas = genre !== 'haut';
      for (let y = 0; y < H; y++) if (y < ry ? rxHaut : y > ry ? rxBas : false) T[y][rx] = 'r';
    }
    // 3. la ferme au carré (4 × 4 cases), à une case de la route, du côté où il y a le plus de place
    const haut = ry >= 12 ? r.p(0.8) : r.p(0.2), fy = haut ? ry - 5 : ry + 2;
    let fx = r.ent(3, W - 8);
    for (let k = 0; k < 40 && Math.abs(fx + 2 - rx) < 5; k++) fx = r.ent(3, W - 8);
    for (let y = fy - 1; y <= fy + 4; y++) for (let x = fx - 1; x <= fx + 4; x++) if (dans(x, y) && T[y][x] === 'c') T[y][x] = (y >= fy && y < fy + 4 && x >= fx && x < fx + 4) ? 'm' : 'h';
    // un bosquet contre la ferme, côté champs
    if (r.p(0.7)) { const by = haut ? fy - 2 : fy + 5, bx = r.p(0.5) ? fx - 1 : fx + 3; for (let x = bx; x < bx + 2; x++) if (libre(x, by)) T[by][x] = 'f'; }
    // 4. chemins de terre perpendiculaires à la route : celui de la ferme, puis un tous les 7 à 11 cases
    const cotes = [{ haut: true, y0: 0, y1: ry - 1 }, { haut: false, y0: ry + 1, y1: H - 1 }];
    const colonnes = { true: [], false: [] };
    const chemin = (x, cote, jusquA) => {
      const pas = cote.haut ? -1 : 1, depart = cote.haut ? ry - 1 : ry + 1;
      for (let y = depart; cote.haut ? y >= jusquA : y <= jusquA; y += pas) { if (T[y][x] === 'r') break; if (T[y][x] === 'c' || T[y][x] === 'f') T[y][x] = 'p'; else if (T[y][x] !== 'p') break; }
      colonnes[cote.haut].push({ x, fin: jusquA });
    };
    let cx = r.p(0.5) ? fx - 2 : fx + 5;
    if (cx < 2 || cx > W - 3 || Math.abs(cx - rx) < 3) cx = cx === fx - 2 ? fx + 5 : fx - 2;
    const coteF = cotes[haut ? 0 : 1];
    if (cx >= 2 && cx <= W - 3 && Math.abs(cx - rx) >= 3) chemin(cx, coteF, haut ? (r.p(0.6) ? 0 : r.ent(2, fy - 2)) : (r.p(0.6) ? H - 1 : r.ent(fy + 6, H - 3)));
    for (const cote of cotes) {
      const prof = cote.y1 - cote.y0 + 1; if (prof < 4) continue;
      if (rx >= 0 && (cote.haut ? rxHaut : rxBas)) colonnes[cote.haut].push({ x: rx, fin: cote.haut ? 0 : H - 1, route: true });
      for (let x = r.ent(4, 8); x < W - 3; x += r.ent(7, 11)) {
        if (colonnes[cote.haut].some(c => Math.abs(c.x - x) < 5)) continue;
        if (cote === coteF && x >= fx - 2 && x <= fx + 5) continue;
        const loin = cote.haut ? 0 : H - 1, court = cote.haut ? r.ent(0, Math.max(0, ry - 6)) : r.ent(Math.min(H - 1, ry + 5), H - 1);
        chemin(x, cote, r.p(0.6) ? loin : court);
      }
      // un chemin parallèle à la route relie deux chemins voisins quand le côté est profond
      if (prof >= 9 && r.p(0.6)) {
        const col = colonnes[cote.haut].slice().sort((a, b) => a.x - b.x), y = cote.haut ? ry - r.ent(4, prof - 3) : ry + r.ent(4, prof - 3);
        const paires = []; for (let k = 0; k + 1 < col.length; k++) { const a = col[k], b = col[k + 1], atteint = c => cote.haut ? c.fin <= y : c.fin >= y; if (atteint(a) && atteint(b) && b.x - a.x > 3) paires.push([a.x, b.x]); }
        const pr = paires.length ? r.choix(paires) : null;
        if (pr) { let ok = true; for (let x = pr[0] + 1; x < pr[1]; x++) if (T[y][x] !== 'c') ok = false; if (ok) for (let x = pr[0] + 1; x < pr[1]; x++) T[y][x] = 'p'; }
      }
    }
    // 5. le pré de la ferme, clôturé, contre la ferme ; ses vaches y paissent d'avril à novembre
    const fcx = fx + 2, fcy = fy + 2;
    let mieux = null;
    for (const [pw, ph] of [[r.ent(5, 7), r.ent(4, 5)], [5, 4], [4, 3], [3, 3]]) {
      for (let y = 0; y + ph <= H; y++) for (let x = 0; x + pw <= W; x++) {
        let ok = true, colle = false;
        for (let j = y; j < y + ph && ok; j++) for (let i = x; i < x + pw; i++) { if (!libre(i, j)) { ok = false; break; } for (const [dx, dy] of V4) if (dans(i + dx, j + dy) && T[j + dy][i + dx] === 'h') colle = true; }
        if (!ok || !colle) continue;
        const d = Math.hypot(x + pw / 2 - fcx, y + ph / 2 - fcy) + r() * 1.5;
        if (!mieux || d < mieux.d) mieux = { x, y, pw, ph, d };
      }
      if (mieux) break;
    }
    if (mieux) {
      for (let j = mieux.y; j < mieux.y + mieux.ph; j++) for (let i = mieux.x; i < mieux.x + mieux.pw; i++) pre[j][i] = true;
      if (mieux.pw >= 4 && mieux.ph >= 3 && r.p(0.85)) { const ex = r.ent(mieux.x + 1, mieux.x + mieux.pw - 2), ey = r.ent(mieux.y + 1, mieux.y + mieux.ph - 2); T[ey][ex] = 'e'; pre[ey][ex] = false; }
      // une haie le long des côtés qui donnent sur les champs
      for (const [dx, dy] of V4) if (r.p(sys.haies ? 0.9 : 0.55)) {
        const cases = [];
        for (let j = mieux.y; j < mieux.y + mieux.ph; j++) for (let i = mieux.x; i < mieux.x + mieux.pw; i++) { const nx = i + dx, ny = j + dy; if (dans(nx, ny) && !(nx >= mieux.x && nx < mieux.x + mieux.pw && ny >= mieux.y && ny < mieux.y + mieux.ph)) cases.push([nx, ny]); }
        if (cases.every(([x, y]) => libre(x, y))) for (const [x, y] of cases) T[y][x] = 'a';
      }
    }
    // 6. un ou deux bois, contre un bord de la carte, loin de la ferme
    const nbBois = r.ent(1, 2);
    for (let b = 0; b < nbBois; b++) {
      let s = null;
      for (let k = 0; k < 60 && !s; k++) {
        const bord = r.ent(0, 3), x = bord === 0 ? 0 : bord === 1 ? W - 1 : r.ent(0, W - 1), y = bord === 2 ? 0 : bord === 3 ? H - 1 : r.ent(0, H - 1);
        if (libre(x, y) && Math.hypot(x - fcx, y - fcy) >= 10) s = [x, y];
      }
      if (!s) continue;
      const voulu = r.ent(12, 26), pris = [s], cle = new Set([s[1] * W + s[0]]); T[s[1]][s[0]] = 'f';
      while (pris.length < voulu) {
        const cand = [];
        for (const [x, y] of pris) for (const [dx, dy] of V4) { const nx = x + dx, ny = y + dy; if (libre(nx, ny) && !cle.has(ny * W + nx)) cand.push([nx, ny, Math.hypot(nx - s[0], (ny - s[1]) * 1.3) + r() * 2.2]); }
        if (!cand.length) break;
        const c = cand.sort((a, b) => a[2] - b[2])[0]; T[c[1]][c[0]] = 'f'; cle.add(c[1] * W + c[0]); pris.push(c);
      }
    }
    // les encoches de bois se bouchent : un champ ne garde pas une dent d'une case
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (libre(x, y) && V4.filter(([dx, dy]) => dans(x + dx, y + dy) && T[y + dy][x + dx] === 'f').length >= 3) T[y][x] = 'f';
    // 7. un hameau le long de la départementale, au bout opposé à la ferme
    if (r.p(sys.hameau)) {
      const aDroite = fcx < W / 2, x0 = aDroite ? r.ent(W - 10, W - 7) : r.ent(1, 3), nb = r.ent(3, 6);
      let x = x0, poses = 0;
      while (poses < nb && x < W - 1 && x >= 1 && x < x0 + 10) {
        for (const dy of r.p(0.5) ? [-1, 1] : [1, -1]) {
          const y = ry + dy, yj = ry + 2 * dy;
          if (poses < nb && libre(x, y) && Math.abs(x - rx) > 1 && Math.hypot(x - fcx, y - fcy) > 6) { T[y][x] = 'b'; if (libre(x, yj) && r.p(0.7)) T[yj][x] = 'h'; poses++; }
        }
        x += r.ent(1, 2);
      }
    }
    // 8. bocage : des haies découpent les terres en petits champs
    if (sys.haies) {
      for (const cote of cotes) for (let k = r.ent(4, 6); k < cote.y1 - cote.y0; k += r.ent(5, 7)) {
        const y = cote.haut ? ry - k : ry + k; if (!dans(0, y)) continue;
        for (let x = 0; x < W; x++) if (libre(x, y)) T[y][x] = 'a';
      }
      for (let x = r.ent(5, 8); x < W - 3; x += r.ent(6, 9)) for (let y = 0; y < H; y++) if (libre(x, y) && (y < ry ? !colonnes.true.some(c => Math.abs(c.x - x) < 3) : !colonnes.false.some(c => Math.abs(c.x - x) < 3))) T[y][x] = 'a';
    }
    // 9. les champs : chaque îlot de terre est découpé en longues pièces perpendiculaires à la route
    const lab = grille(-1); let n = 0;
    for (const ilot of composantes(libre)) {
      const xs = ilot.map(c => c[0]), ys = ilot.map(c => c[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      let enLargeur = bw >= bh * 0.7; if (bw >= 6 && bh >= 6 && r.p(0.2)) enLargeur = !enLargeur;
      const [a0, a1, b0, b1] = enLargeur ? [x0, x1, y0, y1] : [y0, y1, x0, x1];
      const coupes = []; let a = a0;
      while (a <= a1) { let w = r.ent(3, 5); if (a1 - (a + w) + 1 < 3) w = a1 - a + 1; coupes.push([a, a + w - 1]); a += w; }
      for (const [s0, s1] of coupes) {
        const L = b1 - b0 + 1, lim = r.ent(8, 12), k = Math.max(1, Math.round(L / lim)), bornes = [b0];
        for (let i = 1; i < k; i++) bornes.push(b0 + Math.round(L * i / k) + r.ent(-1, 1));
        bornes.push(b1 + 1);
        for (let i = 0; i + 1 < bornes.length; i++) {
          for (const [x, y] of ilot) { const sa = enLargeur ? x : y, sb = enLargeur ? y : x; if (sa >= s0 && sa <= s1 && sb >= bornes[i] && sb < bornes[i + 1]) lab[y][x] = n; }
          n++;
        }
      }
    }
    const PRE = n; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (pre[y][x]) lab[y][x] = PRE;
    let fin = parcelles(lab, T, 6);
    const prePrincipal = mieux ? fin[mieux.y][mieux.x] : -1;
    // 10. d'autres prés (beaucoup en bocage), de préférence contre un bois, une haie ou un bord de carte
    const taille = new Map(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fin[y][x] >= 0) taille.set(fin[y][x], (taille.get(fin[y][x]) || 0) + 1);
    const prairies = new Map(); if (prePrincipal >= 0) prairies.set(prePrincipal, 'PPH');
    const voulu = r.ent(sys.pres[0], sys.pres[1]) - (prePrincipal >= 0 ? 1 : 0);
    const cand = [...taille.entries()].filter(([l, t]) => l !== prePrincipal && t >= 6 && t <= 40).map(([l]) => {
      let note = r() * 2;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fin[y][x] === l) { if (x === 0 || y === 0 || x === W - 1 || y === H - 1) note += 0.3; for (const [dx, dy] of V4) if (dans(x + dx, y + dy) && 'fab'.includes(T[y + dy][x + dx])) note += 0.5; }
      return [note, l];
    }).sort((a, b) => b[0] - a[0]);
    for (let k = 0; k < voulu && k < cand.length; k++) prairies.set(cand[k][1], sys.haies && r.p(0.4) ? 'PRL' : 'PPH');
    // 11. retournement, puis numérotation
    const mx = r.p(0.5), my = r.p(0.5);
    const [T2, L2] = retourner(T, fin, mx, my);
    const { unite, unites } = numeroter(L2, (l, nb) => {
      const herbe = prairies.get(l);
      const { rpg, rot } = herbe ? rpgDe([herbe], 0) : (() => { const ro = r.choix(sys.rot); return rpgDe(ro, r.ent(0, ro.length - 1)); })();
      return { surf: Math.round(nb * 25) / 100, rpg, rot, n: nb };
    });
    return { pas: 50, w: W, h: H, types: T2.map(l => l.join('')), unite, unites, ferme: [mx ? W - 4 - fx : fx, my ? H - 4 - fy : fy] };
  }

  // ---------- Planches : cases de 10 m (maraîchage) ----------
  function planches(r) {
    const T = grille('h'), lab = grille(-1);
    const ry = r.ent(1, 3);
    for (let x = 0; x < W; x++) T[ry][x] = 'r';
    // la ferme : un bloc bâti de 6 × 6 cases (60 m), sous la route
    const fx = r.ent(3, W - 10), fy = ry + 2;
    for (let y = fy; y < fy + 6; y++) for (let x = fx; x < fx + 6; x++) T[y][x] = 'b';
    const reserve = (x, y) => x >= fx - 1 && x <= fx + 6 && y >= fy - 1 && y <= fy + 6;
    // lots de 4 × 4 cases en colonnes x = 1, 6, 11… ; les allées tombent sur x = 5, 10, 15…
    const allees = [5, 10, 15, 20, 25].filter(a => a < fx - 1 || a > fx + 6);
    // chemin de la route au jardin, dans l'allée la plus proche de la ferme
    const cx = allees.sort((a, b) => Math.min(Math.abs(a - fx + 1), Math.abs(a - fx - 6)) - Math.min(Math.abs(b - fx + 1), Math.abs(b - fx - 6)))[0];
    for (let y = ry + 1; y < H - 1; y++) T[y][cx] = 'p';
    // haie brise-vent sur un bord et au fond ; mare contre la ferme, du côté opposé au chemin
    const hx = r.p(0.5) ? 0 : W - 1; for (let y = ry + 1; y < H; y++) if (T[y][hx] === 'h') T[y][hx] = 'a';
    for (let x = 0; x < W; x++) if (T[H - 1][x] === 'h' && r.p(0.85)) T[H - 1][x] = 'a';
    const mareX = cx < fx ? fx + 7 : fx - 3;
    if (mareX >= 1 && mareX + 1 < W - 1) for (let y = fy + 1; y < fy + 3; y++) for (let x = mareX; x < mareX + 2; x++) if (T[y][x] === 'h') T[y][x] = 'e';
    // quelques maisons de l'autre côté de la route
    if (ry >= 1) { const nb = r.ent(2, 4); for (let k = 0, x = r.ent(2, 6); k < nb && x < W - 2; k++, x += r.ent(4, 8)) if (Math.abs(x - fx - 3) > 4) T[ry - 1][x] = 'b'; }
    // le jardin : rangées de lots ; allées d'herbe entre les lots, un chemin de terre toutes les deux rangées
    let n = 0;
    for (let j = 0, y = fy; y + 4 <= H - 1; j++, y += 5) {
      for (let x = 1; x + 4 <= W - 1; x += 5) {
        let ok = true; for (let b = y; b < y + 4 && ok; b++) for (let a = x; a < x + 4; a++) if (T[b][a] !== 'h' || reserve(a, b)) { ok = false; break; }
        if (!ok) continue;
        for (let b = y; b < y + 4; b++) for (let a = x; a < x + 4; a++) { T[b][a] = 'c'; lab[b][a] = n; }
        n++;
      }
      if (j % 2 === 1 && y + 4 < H - 1) for (let a = 1; a < W - 1; a++) if (T[y + 4][a] === 'h' && !reserve(a, y + 4)) T[y + 4][a] = 'p';
    }
    const mx = r.p(0.5);
    const [T2, L2] = retourner(T, lab, mx, false);
    const { unite, unites } = numeroter(L2, (l, nb) => { const ro = r.choix(ROT_LEGUMES), { rpg, rot } = rpgDe(ro, r.ent(0, ro.length - 1)); return { surf: Math.round(nb) / 100, rpg, rot, n: nb }; });
    return { pas: 10, w: W, h: H, types: T2.map(l => l.join('')), unite, unites, ferme: [mx ? W - 1 - (fx + 2) : fx + 2, fy + 2] };
  }

  // ---------- Un lieu complet ----------
  const cache = new Map();
  function generer(graine, region) {
    graine = normaliser(graine) || 'SQUID';
    const id = idDe(graine, region);
    if (cache.has(id)) return cache.get(id);
    const R = REGIONS.find(x => x.id === region) || REGIONS[0], sys = systemeDe(R.id);
    const r = tirage(graine + '/' + R.id), nom = r.choix(LIEUXDITS);
    const L = { id, nom, pays: R.nom, climat: R.id, graine, genere: true, champs: champs(tirage(graine + '/champs/' + R.id), sys), planches: planches(tirage(graine + '/planches')) };
    cache.set(id, L);
    return L;
  }

  // ---------- Aperçu : la carte vue d'avion, sur un canevas ----------
  const TEINTES = { BTH: '#d8c070', BDH: '#d2b468', ORH: '#cbb873', ORP: '#d6c78a', BTN: '#7fae55', PTC: '#94b866', CZH: '#e2d24e', LIP: '#8fb7d0',
    FVP: '#7b9a4e', PPR: '#9fbf62', MIS: '#87b04a', TRN: '#e0b23a', SOG: '#b98c4e', SOJ: '#9cb35a', PRL: '#a9d07a', PPH: '#8cc66a',
    POR: '#7aa36a', CAR: '#8fbf5a', CHU: '#6f9f74', OIG: '#b6a46a', HAR: '#7fb15c', EPI: '#5f9a4e', FRA: '#a5c46c' };
  const FOND = { h: '#a7cf7e', r: '#8d8b86', p: '#cdb48a', m: '#c76a43', b: '#c0644a', f: '#3f7f3c', a: '#4f8f3f', e: '#5ea3d6' };
  function apercu(cv, pl, opts = {}) {
    const k = Math.max(1, window.devicePixelRatio || 1), larg = cv.clientWidth || 320, s = larg / pl.w;
    cv.width = Math.round(larg * k); cv.height = Math.round(s * pl.h * k);
    const g = cv.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, larg, s * pl.h);
    const an = opts.an || 2024, a = (x, y) => pl.types[y][x], u = (x, y) => x < 0 || y < 0 || x >= pl.w || y >= pl.h ? -2 : pl.unite[y * pl.w + x];
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) {
      const t = a(x, y), un = u(x, y);
      g.fillStyle = t === 'c' ? (un >= 0 ? TEINTES[pl.unites[un].rpg[an]] || '#c9b27a' : FOND.h) : FOND[t] || FOND.h;
      g.fillRect(x * s, y * s, s + 0.5, s + 0.5);
    }
    // limites des parcelles : un liseré clair
    g.strokeStyle = 'rgba(255,255,240,.55)'; g.lineWidth = Math.max(1, s * 0.08); g.beginPath();
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) {
      const un = u(x, y); if (un < 0) continue;
      if (u(x + 1, y) !== un && u(x + 1, y) >= 0) { g.moveTo((x + 1) * s, y * s); g.lineTo((x + 1) * s, (y + 1) * s); }
      if (u(x, y + 1) !== un && u(x, y + 1) >= 0) { g.moveTo(x * s, (y + 1) * s); g.lineTo((x + 1) * s, (y + 1) * s); }
    }
    g.stroke();
    // cour de la ferme
    if (pl.pas === 50 && pl.ferme) { g.fillStyle = '#e4d6bb'; g.fillRect((pl.ferme[0] + 1) * s, (pl.ferme[1] + 1) * s, 2 * s, 2 * s); }
    // champs de départ : contour doré
    if (opts.depart) {
      g.strokeStyle = '#f6c544'; g.lineWidth = Math.max(1.5, s * 0.16); g.beginPath();
      const dep = opts.depart, dd = (x, y) => dep.has(u(x, y));
      for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) {
        if (!dd(x, y)) continue;
        if (!dd(x, y - 1)) { g.moveTo(x * s, y * s); g.lineTo((x + 1) * s, y * s); }
        if (!dd(x, y + 1)) { g.moveTo(x * s, (y + 1) * s); g.lineTo((x + 1) * s, (y + 1) * s); }
        if (!dd(x - 1, y)) { g.moveTo(x * s, y * s); g.lineTo(x * s, (y + 1) * s); }
        if (!dd(x + 1, y)) { g.moveTo((x + 1) * s, y * s); g.lineTo((x + 1) * s, (y + 1) * s); }
      }
      g.stroke();
    }
  }

  return { generer, apercu, nouvelleGraine, normaliser, idDe, systemeDe, W, H };
})();
