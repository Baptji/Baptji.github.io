// Diagrammes pH–Eh recalculés à une autre activité des espèces dissoutes (curseur de concentration, H.3).
// Portage en JavaScript de tools/pourbaix.py (domaines = intersections de demi-plans) et de
// tools/pourbaix_mise_en_forme/etiquettes.py (placement des étiquettes). Constantes : pourbaix-especes.js.
// À 10⁻⁶ mol/L, on garde POURBAIX tel quel (étiquettes réglées et renvois posés à la main).
const PourbaixCalc = (() => {
  const DEFAUT = -6, MIN = -8, MAX = -2;
  const CADRE = [0, 14, -1, 2], AIRE_MIN = 0.003;
  const X0 = 70, X1 = 960, Y0 = 30, Y1 = 560;             // pixels du SVG (viewBox 1000 × 620), comme PHEH
  const px = (p) => X0 + p / 14 * (X1 - X0), py = (e) => Y1 - (e + 1) / 3 * (Y1 - Y0);
  const deX = (x) => (x - X0) / (X1 - X0) * 14, deY = (y) => (Y1 - y) / (Y1 - Y0) * 3 - 1;
  const LARG_NOM = 8.0, LARG_FORM = 6.6, MARGE = 3.0;
  const K = 0.0591597;
  const EAU = [1.229, 0].map((E0) => [[px(0), py(E0)], [px(14), py(E0 - 14 * K)]]);
  // masses molaires (g/mol) pour convertir la concentration en masse par litre
  const MASSE = { Fe: 55.845, Mn: 54.938, Al: 26.982, Ti: 47.867, Cu: 63.546, Zn: 65.38, Cr: 51.996, Mg: 24.305,
    Sn: 118.71, Zr: 91.224, U: 238.03, Nb: 92.906 };

  // ---------------------------------------------------------------- calcul des domaines
  function plans(cle, logA) {
    return POURBAIX_ESPECES[cle].especes.map((e) => ({ e, a: e.a + (e.aq ? logA / e.n : 0), b: e.b, g: e.g }));
  }

  // partie de poly où A·pH + B·E + C <= 0 (Sutherland–Hodgman)
  function decoupe(poly, A, B, C) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const P = poly[i], Q = poly[(i + 1) % poly.length];
      const fp = A * P[0] + B * P[1] + C, fq = A * Q[0] + B * Q[1] + C;
      if (fp <= 0) out.push(P);
      if (fp * fq < 0) {
        const t = fp / (fp - fq);
        out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
      }
    }
    const propre = out.length > 1
      ? out.filter((p, i) => Math.hypot(p[0] - out[(i + out.length - 1) % out.length][0], p[1] - out[(i + out.length - 1) % out.length][1]) > 1e-9)
      : out;
    return propre.length >= 3 ? propre : [];
  }

  function aire(poly) {
    let s = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      s += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(s) / 2;
  }

  function domaines(liste, combler = true) {
    const [ph0, ph1, e0, e1] = CADRE, out = [];
    liste.forEach((s, i) => {
      let poly = [[ph0, e0], [ph1, e0], [ph1, e1], [ph0, e1]];
      for (let j = 0; j < liste.length && poly.length; j++) {
        if (i === j) continue;
        const t = liste[j], A = s.b - t.b, B = s.g - t.g, C = s.a - t.a;
        if (Math.abs(A) < 1e-12 && Math.abs(B) < 1e-12) {
          if (C > 1e-12 || (Math.abs(C) <= 1e-12 && j < i)) poly = [];
          continue;
        }
        poly = decoupe(poly, A, B, C);
      }
      if (poly.length) out.push({ s, poly, aire: aire(poly) });
    });
    // un liseré plus petit que le seuil d'affichage laisserait un vide : on retire l'espèce et on recalcule,
    // ses voisines se rejoignent. tools/pourbaix.py se contente de l'écarter (combler = false, pour le contrôle) :
    // à 10⁻⁶, POURBAIX a ainsi un liseré vide invisible sur l'étain.
    const fins = out.filter((d) => d.aire < AIRE_MIN).map((d) => d.s);
    if (!combler) return out.filter((d) => d.aire >= AIRE_MIN);
    if (fins.length) return domaines(liste.filter((s) => !fins.includes(s)));
    return out;
  }

  // ---------------------------------------------------------------- convention « concentration totale » (H.8)
  // Takeno (2005), PHREEQC : un solide k n'est tracé que si la SOMME du métal dissous à l'équilibre avec lui
  // reste sous le seuil C. Avec Phi_s pris à l'activité C/n_s (convention de pourbaix.py), le métal porté par
  // l'espèce s vaut C·10^(n_s·(Phi_k − Phi_s)) ; d'où le critère log10 Σ_s 10^(n_s·(Phi_k − Phi_s)) ≤ 0.
  // Cette fonction est convexe : le domaine du solide reste convexe, son bord côté solution devient une courbe.
  function logTotal(k, aq, x, y) {
    const pk = k.a + k.b * x + k.g * y;
    let m = -Infinity;
    const t = aq.map((s) => { const v = s.e.n * (pk - (s.a + s.b * x + s.g * y)); if (v > m) m = v; return v; });
    let somme = 0;
    for (const v of t) somme += 10 ** (v - m);
    return m + Math.log10(somme);
  }

  // demi-plans n·(pH, E) ≤ c d'un polygone convexe, quel que soit son sens de parcours
  function demiPlans(poly) {
    let A = 0;
    for (let i = 0; i < poly.length; i++) A += poly[i][0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * poly[i][1];
    const s = A > 0 ? 1 : -1;
    return poly.map((p, i) => {
      const q = poly[(i + 1) % poly.length], nx = s * (q[1] - p[1]), ny = -s * (q[0] - p[0]);
      return [nx, ny, nx * p[0] + ny * p[1]];
    });
  }

  // partie du domaine S (convexe, solide k le plus stable des solides) où le métal dissous total reste ≤ C :
  // rayons tirés d'un point intérieur, bord du polygone ou courbe log Σ = 0 trouvée par dichotomie
  function solideTotal(k, S, aq) {
    const f = (x, y) => logTotal(k, aq, x, y), hp = demiPlans(S);
    const dedans = (x, y) => hp.every(([nx, ny, c]) => nx * x + ny * y <= c + 1e-9);
    const xs = S.map((p) => p[0]), ys = S.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    // candidats ramenés de 1 % vers le centre du polygone : le point de départ des rayons doit être STRICTEMENT dedans
    const gx = S.reduce((s, p) => s + p[0], 0) / S.length, gy = S.reduce((s, p) => s + p[1], 0) / S.length;
    let c = null, fc = Infinity;
    const essayer = (x, y) => {
      x += 0.01 * (gx - x); y += 0.01 * (gy - y);
      if (dedans(x, y)) { const v = f(x, y); if (v < fc) { fc = v; c = [x, y]; } }
    };
    S.forEach((p, i) => { const q = S[(i + 1) % S.length]; essayer((p[0] + q[0]) / 2, (p[1] + q[1]) / 2); });
    for (let i = 0; i <= 40; i++) for (let j = 0; j <= 40; j++) essayer(x0 + (x1 - x0) * i / 40, y0 + (y1 - y0) * j / 40);
    if (!c || fc > 0) return [];
    // directions régulières à l'écran (pixels), plus une vers chaque sommet pour garder les coins nets
    const ux = 14 / (X1 - X0), uy = 3 / (Y1 - Y0);
    const angles = [];
    for (let i = 0; i < 360; i++) angles.push(i * Math.PI / 180);
    S.forEach(([x, y]) => angles.push((Math.atan2((y - c[1]) / uy, (x - c[0]) / ux) + 2 * Math.PI) % (2 * Math.PI)));
    angles.sort((a, b) => a - b);
    // point du bord le long du rayon d'angle th : sortie du polygone si le solide y tient encore, sinon courbe Σ = 0
    const rayon = (th) => {
      const dx = Math.cos(th) * ux, dy = Math.sin(th) * uy;
      let t = Infinity;
      for (const [nx, ny, cc] of hp) {
        const den = nx * dx + ny * dy;
        if (den > 1e-15) t = Math.min(t, (cc - nx * c[0] - ny * c[1]) / den);
      }
      if (!isFinite(t) || t <= 0) return null;
      if (f(c[0] + t * dx, c[1] + t * dy) <= 0) return { p: [c[0] + t * dx, c[1] + t * dy], bord: true };
      let a = 0, b = t;
      for (let it = 0; it < 40; it++) { const m = (a + b) / 2; if (f(c[0] + m * dx, c[1] + m * dy) > 0) b = m; else a = m; }
      return { p: [c[0] + a * dx, c[1] + a * dy], bord: false };
    };
    const ecart = (p, q) => Math.hypot((p[0] - q[0]) / ux, (p[1] - q[1]) / uy);
    const pts = angles.map((th) => ({ th, r: rayon(th) })).filter((x) => x.r);
    const out = [];
    pts.forEach((A, i) => {
      out.push(A.r.p);
      const B = pts[(i + 1) % pts.length];
      let thB = B.th;
      if (thB <= A.th) thB += 2 * Math.PI;
      if (A.r.bord !== B.r.bord) {
        // passage bord droit ⇄ courbe : on cherche l'angle exact du coin
        let a = A.th, b = thB, ra = A.r, rb = B.r;
        for (let it = 0; it < 18; it++) {
          const m = (a + b) / 2, rm = rayon(m);
          if (!rm) break;
          if (rm.bord === A.r.bord) { a = m; ra = rm; } else { b = m; rb = rm; }
        }
        out.push(ra.p, rb.p);
      } else if (!A.r.bord && ecart(A.r.p, B.r.p) > 4) {
        // courbe : points intermédiaires tous les ≈ 4 px
        const n = Math.min(16, Math.ceil(ecart(A.r.p, B.r.p) / 4));
        for (let k = 1; k < n; k++) { const r = rayon(A.th + (thB - A.th) * k / n); if (r) out.push(r.p); }
      }
    });
    for (let i = out.length - 1; i > 0; i--) if (ecart(out[i], out[i - 1]) < 0.05) out.splice(i, 1);
    // points alignés retirés (bords droits du polygone)
    const simple = out.filter((p, i) => {
      const a = out[(i + out.length - 1) % out.length], b = out[(i + 1) % out.length];
      return Math.abs((p[0] - a[0]) / ux * (b[1] - a[1]) / uy - (p[1] - a[1]) / uy * (b[0] - a[0]) / ux) > 1e-3;
    });
    return simple.length >= 3 ? simple : [];
  }

  // Domaines en concentration totale : partition des espèces dissoutes seules (droites, inchangée), puis
  // solides posés PAR-DESSUS (solides d'abord dans la liste : c'est le premier domaine trouvé au curseur).
  function domainesTotal(liste) {
    const aq = liste.filter((s) => s.e.aq), so = liste.filter((s) => !s.e.aq);
    const solides = domaines(so, false)
      .map(({ s, poly }) => ({ s, poly: solideTotal(s, poly, aq) }))
      .filter((d) => d.poly.length && aire(d.poly) >= AIRE_MIN)
      .map((d) => Object.assign(d, { aire: aire(d.poly) }));
    return { solides, dissous: domaines(aq), aq };
  }

  // ---------------------------------------------------------------- étiquettes (etiquettes.py)
  function signee(a, b, x, y) {
    const [x0, y0] = a, [x1, y1] = b;
    return ((x1 - x0) * (y - y0) - (y1 - y0) * (x - x0)) / Math.hypot(x1 - x0, y1 - y0);
  }

  // distance signée au bord le plus proche (positive à l'intérieur) : une droite par arête, n·(x, y) + c
  function preparer(pp) {
    let A = 0;
    for (let i = 0; i < pp.length; i++) A += pp[i][0] * pp[(i + 1) % pp.length][1] - pp[(i + 1) % pp.length][0] * pp[i][1];
    const s = A > 0 ? 1 : -1, nx = [], ny = [], nc = [];
    for (let i = 0; i < pp.length; i++) {
      const [x0, y0] = pp[i], [x1, y1] = pp[(i + 1) % pp.length], L = Math.hypot(x1 - x0, y1 - y0);
      if (L <= 1e-9) continue;
      nx.push(-s * (y1 - y0) / L); ny.push(s * (x1 - x0) / L); nc.push(s * ((y1 - y0) * x0 - (x1 - x0) * y0) / L);
    }
    const n = nx.length;
    // plancher : on arrête dès que la distance passe sous ce seuil (le point ne peut plus gagner)
    return (x, y, plancher) => {
      let m = Infinity;
      for (let i = 0; i < n; i++) {
        const d = nx[i] * x + ny[i] * y + nc[i];
        if (d < m) { m = d; if (m < plancher) return m; }
      }
      return m;
    };
  }

  function coupeEau(coins) {
    return EAU.some(([a, b]) => {
      const d = coins.map(([x, y]) => signee(a, b, x, y));
      return Math.max(...d) > -MARGE && Math.min(...d) < MARGE;
    });
  }

  // meilleure position du texte (w × [haut, bas] px, incliné de `angle`) : grille de 6 px puis affinage au pixel
  function essai(pp, dist, w, haut, bas, angle, eviterEau, obstacles) {
    const th = angle * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    // un point d'obstacle (trait d'une ligne repère) ne doit pas tomber dans le cadre du texte, marge comprise
    const touche = (x, y) => obstacles.some(([ox, oy]) => {
      const dx = ox - x, dy = oy - y, u = dx * c + dy * s, v = -dx * s + dy * c;
      return u > -w / 2 - MARGE && u < w / 2 + MARGE && v > haut - MARGE && v < bas + MARGE;
    });
    const locaux = [[-w / 2, haut], [w / 2, haut], [-w / 2, bas], [w / 2, bas]];
    const xs = pp.map((p) => p[0]), ys = pp.map((p) => p[1]);
    let meilleur = null;
    const du = locaux.map(([u, v]) => [u * c - v * s, u * s + v * c]);
    const tester = (x, y) => {
      const plancher = Math.max(MARGE, meilleur ? meilleur[0] : MARGE);
      let score = Infinity;
      for (const [dx, dy] of du) {
        score = Math.min(score, dist(x + dx, y + dy, plancher));
        if (score < plancher) return;
      }
      if (meilleur && score <= meilleur[0]) return;
      if (eviterEau && coupeEau(du.map(([dx, dy]) => [x + dx, y + dy]))) return;
      if (obstacles.length && touche(x, y)) return;
      meilleur = [score, x, y];
    };
    const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
    for (let y = ymin; y <= ymax; y += 6) for (let x = xmin; x <= xmax; x += 6) tester(x, y);
    if (!meilleur) return null;
    const [, bx, by] = meilleur;
    for (let y = by - 6; y <= by + 6; y += 1.5) for (let x = bx - 6; x <= bx + 6; x += 1.5) tester(x, y);
    return [meilleur[1], meilleur[2]];
  }

  function angleBande(pp) {
    let best = [0, 0];
    for (let i = 0; i < pp.length; i++) {
      const [x0, y0] = pp[i], [x1, y1] = pp[(i + 1) % pp.length], L = Math.hypot(x1 - x0, y1 - y0);
      if (L > best[0]) {
        let a = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
        while (a >= 90) a -= 180;
        while (a < -90) a += 180;
        best = [L, a];
      }
    }
    return best[1];
  }

  const longueur = (t) => [...t].length;

  // les 4 coins d'un texte (px), et test de recouvrement de deux cadres (axes séparateurs)
  function cadre(x, y, w, haut, bas, angle) {
    const th = angle * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    return [[-w / 2, haut], [w / 2, haut], [w / 2, bas], [-w / 2, bas]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
  }
  function recouvre(A, B) {
    for (const P of [A, B])
      for (let i = 0; i < 4; i++) {
        const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % 4], nx = y0 - y1, ny = x1 - x0;
        const pa = A.map(([x, y]) => nx * x + ny * y), pb = B.map(([x, y]) => nx * x + ny * y);
        if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false;
      }
    return true;
  }
  const arr = (v, n) => Math.round(v * 10 ** n) / 10 ** n;

  // `trous` : polygones (pixels) posés par-dessus le domaine ; −distance au trou = borne basse de la distance réelle
  function placer(poly, h, obstacles, trous = []) {
    const pp = poly.map(([p, e]) => [px(p), py(e)]), d0 = preparer(pp), dt = trous.map(preparer);
    const dist = !dt.length ? d0 : (x, y, plancher) => {
      let m = d0(x, y, plancher);
      for (const f of dt) {
        if (m < plancher) return m;
        m = Math.min(m, -f(x, y, -Infinity));
      }
      return m;
    };
    const wn = Math.max(longueur(h.nom) * LARG_NOM, longueur(h.formule) * LARG_FORM), wc = longueur(h.court) * LARG_NOM;
    const a = angleBande(pp);
    const modes = [["complet", wn, -12, 19, 0], ["court", wc, -11, 4, 0]];
    if (Math.abs(a) >= 2) modes.push(["incline", wc, -11, 4, a]);
    if (Math.abs(a + 90) >= 1) modes.push(["vertical", wc, -11, 4, -90]);
    for (const eviterEau of [true, false])
      for (const [mode, w, haut, bas, ang] of modes) {
        const pos = essai(pp, dist, w, haut, bas, ang, eviterEau, obstacles);
        if (pos) {
          const r = { etiquette: [arr(deX(pos[0]), 2), arr(deY(pos[1]), 3)] };
          if (mode !== "complet") r.court = h.court;
          if (ang) r.angle = arr(ang, 1);
          r._cadre = cadre(pos[0], pos[1], w, haut, bas, ang);
          return r;
        }
      }
    return null;
  }

  // ---------------------------------------------------------------- lignes repères (ligne() d'exporter2.py)
  function dans(pt, poly) {
    let signe = null;
    for (let i = 0; i < poly.length; i++) {
      const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length];
      const cr = (x1 - x0) * (pt[1] - y0) - (y1 - y0) * (pt[0] - x0);
      if (Math.abs(cr) < 1e-12) continue;
      if (signe === null) signe = cr > 0;
      else if ((cr > 0) !== signe) return false;
    }
    return true;
  }

  function ligne(spec, liste, doms) {
    const sous = liste.filter((s) => s.e.aq || s.e.sym === spec.phase);
    const d = domaines(sous).find((x) => x.s.e.sym === spec.phase);
    if (!d) return null;
    const permis = doms.filter((x) => spec.dans.includes(x.s.e.id)).map((x) => x.poly);
    // espèce qui l'emporte juste de l'autre côté d'une arête (pour écarter les limites qui ne sont pas des précipitations)
    const voisine = (a, b) => {
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      let best = null;
      for (const sg of [1, -1]) {
        const x = mx + sg * 0.01 * (b[1] - a[1]) / L, y = my - sg * 0.01 * (b[0] - a[0]) / L;
        let m = null;
        for (const t of sous) { const v = t.a + t.b * x + t.g * y; if (!m || v < m[0]) m = [v, t]; }
        if (m[1] !== d.s) best = m[1];
      }
      return best;
    };
    return tracer(spec, d.poly, (p) => permis.some((pl) => dans(p, pl)), voisine, () => 200);
  }

  // même ligne en concentration totale : bord de la zone où la phase précipite (somme du dissous ≥ C) ;
  // permis = point dont le domaine affiché (solide d'abord) est dans `spec.dans`
  function ligneTotal(spec, liste, T) {
    const ph = liste.find((s) => s.e.sym === spec.phase);
    if (!ph) return null;
    const [ph0, ph1, e0, e1] = CADRE;
    const poly = solideTotal(ph, [[ph0, e0], [ph1, e0], [ph1, e1], [ph0, e1]], T.aq);
    if (!poly.length) return null;
    const ids = new Set(spec.dans);
    const domaineDe = (p) => {
      const s = T.solides.find((x) => dans(p, x.poly)) || T.dissous.find((x) => dans(p, x.poly));
      return s && s.s.e.id;
    };
    const voisine = (a, b) => {
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      for (const sg of [1, -1]) {
        const x = mx + sg * 0.01 * (b[1] - a[1]) / L, y = my - sg * 0.01 * (b[0] - a[0]) / L;
        if (dans([x, y], poly)) continue;
        let m = null;
        for (const t of T.aq) { const v = t.a + t.b * x + t.g * y; if (!m || v < m[0]) m = [v, t]; }
        return m[1];
      }
      return null;
    };
    const pas = (a, b) => Math.max(2, Math.ceil(Math.hypot(px(b[0]) - px(a[0]), py(b[1]) - py(a[1])) / 2));
    return tracer(spec, poly, (p) => ids.has(domaineDe(p)), voisine, pas);
  }

  function tracer(spec, poly, permis, voisine, pas) {
    const n = poly.length;
    const bord = (p) => Math.abs(p[0]) < 1e-9 || Math.abs(p[0] - 14) < 1e-9 || Math.abs(p[1] + 1) < 1e-9 || Math.abs(p[1] - 2) < 1e-9;
    const series = [];
    let cur = [];
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n];
      if (bord(a) && bord(b) && (Math.abs(a[0] - b[0]) < 1e-9 || Math.abs(a[1] - b[1]) < 1e-9)) continue;
      const v = spec.sauf && voisine(a, b);
      if (v && spec.sauf.includes(v.e.id)) { if (cur.length) { series.push(cur); cur = []; } continue; }
      const N = pas(a, b);
      for (let k = 0; k <= N; k++) {
        const p = [a[0] + k / N * (b[0] - a[0]), a[1] + k / N * (b[1] - a[1])];
        if (permis(p)) cur.push(p);
        else if (cur.length) { series.push(cur); cur = []; }
      }
    }
    if (cur.length) series.push(cur);
    if (!series.length) return null;
    const serie = series.reduce((m, s) => (s.length > m.length ? s : m));
    if (serie.length < 2) return null;
    const simple = [serie[0]];
    for (let i = 1; i < serie.length - 1; i++) {
      const [x0, y0] = simple[simple.length - 1], [x1, y1] = serie[i], [x2, y2] = serie[i + 1];
      if (Math.abs((x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0)) > 1e-7) simple.push(serie[i]);
    }
    simple.push(serie[serie.length - 1]);
    return { id: spec.id, nom: spec.nom, couleur: spec.couleur, points: simple.map(([p, e]) => [arr(p, 3), arr(e, 3)]) };
  }

  // points du trait tous les 4 px (obstacles pour les étiquettes des domaines)
  function echantillons(points) {
    const out = [];
    for (let i = 0; i < points.length - 1; i++) {
      const x0 = px(points[i][0]), y0 = py(points[i][1]), x1 = px(points[i + 1][0]), y1 = py(points[i + 1][1]);
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4));
      for (let k = 0; k <= n; k++) out.push([x0 + k / n * (x1 - x0), y0 + k / n * (y1 - y0)]);
    }
    return out;
  }

  // nom de la ligne le long d'un de ses segments, sans toucher les étiquettes des domaines ni sortir du cadre
  function etiquetteLigne(l, cadres) {
    const w = longueur(l.nom) * 6.8, segs = [];
    for (let i = 0; i < l.points.length - 1; i++) {
      const a = l.points[i], b = l.points[i + 1];
      segs.push({ a, b, L: Math.hypot(px(b[0]) - px(a[0]), py(b[1]) - py(a[1])) });
    }
    segs.sort((u, v) => v.L - u.L);
    let repli = null;
    for (const { a, b, L } of segs) {
      let ang = Math.atan2(py(b[1]) - py(a[1]), px(b[0]) - px(a[0])) * 180 / Math.PI;
      ang = ang >= 90 ? ang - 180 : ang < -90 ? ang + 180 : ang;
      for (const t of [0.5, 0.35, 0.65, 0.2, 0.8]) {
        const p = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
        const lab = [arr(p[0], 2), arr(p[1], 3), arr(ang, 1)];
        if (!repli) repli = lab;
        if (L < w + 12) continue;
        const C = cadre(px(p[0]), py(p[1]), w, -18, -4, ang);
        if (C.some(([x, y]) => x < X0 || x > X1 || y < Y0 || y > Y1)) continue;
        if (!cadres.some((B) => recouvre(C, B))) return lab;
      }
    }
    return repli;
  }

  // ---------------------------------------------------------------- système habillé à l'activité 10^logA
  const cache = new Map();
  // total = convention « concentration totale » (Takeno 2005) au lieu de « chaque espèce » (Pourbaix 1966)
  function systeme(cle, logA, total = false) {
    const base = POURBAIX[cle], donnees = POURBAIX_ESPECES[cle];
    logA = Math.round(logA * 10) / 10;
    if (!base || !donnees || (logA === DEFAUT && !total)) return base;
    const k = cle + ":" + logA + (total ? ":total" : "");
    if (cache.has(k)) return cache.get(k);
    const liste = plans(cle, logA);
    let doms, lignes, trous = [];
    if (total) {
      const T = domainesTotal(liste);
      doms = [...T.solides, ...T.dissous];
      trous = T.solides.map((d) => d.poly.map(([p, e]) => [px(p), py(e)]));
      lignes = (donnees.lignes || []).map((spec) => ligneTotal(spec, liste, T)).filter(Boolean);
    } else {
      doms = domaines(liste);
      lignes = (donnees.lignes || []).map((spec) => ligne(spec, liste, doms)).filter(Boolean);
    }
    const obstacles = lignes.flatMap((l) => echantillons(l.points)), cadres = [];
    const domainesHab = doms.map(({ s, poly }) => {
      const e = s.e, ref = base.domaines.find((d) => d.id === e.id);
      const h = ref || { id: e.id || e.sym, nom: e.nom || e.sym.slice(3), formule: e.formule || e.sym.slice(3),
        couleur: e.couleur || "rgba(90, 140, 200, 0.16)", desc: e.desc || "", mineraux: e.mineraux };
      const points = poly.map(([p, q]) => [arr(p, 3), arr(q, 3)]);
      const d = { id: h.id, nom: h.nom, formule: h.formule, type: e.aq ? "dissous" : "solide", couleur: h.couleur, desc: h.desc };
      if (h.mineraux) d.mineraux = h.mineraux;
      if (h.mineral) d.mineral = h.mineral;
      d.points = points;
      const lab = placer(poly, { nom: h.nom, formule: h.formule, court: e.court || h.nom }, obstacles, e.aq ? trous : []);
      const couvert = (pt) => total && e.aq && doms.some((x) => !x.s.e.aq && dans(pt, x.poly));
      if (lab) { cadres.push(lab._cadre); delete lab._cadre; Object.assign(d, lab); }
      else if (ref && ref.renvoi && dans(ref.renvoi, poly) && !couvert(ref.renvoi))
        Object.assign(d, { etiquette: ref.etiquette, court: ref.court, renvoi: ref.renvoi });
      else d.etiquette = false;
      return d;
    });
    for (const l of lignes) l.etiquette = etiquetteLigne(l, cadres);
    const sys = Object.assign({}, base, { domaines: domainesHab, lignes, logA, total, superpose: total });
    cache.set(k, sys);
    return sys;
  }

  // ---------------------------------------------------------------- affichage de la concentration
  const EXPOSANTS = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const puissance = (n) => "10" + String(n).split("").map((c) => EXPOSANTS[c]).join("");
  const virgule = (v, n) => v.toFixed(n).replace(".", ",");

  // « 10⁻⁶ mol/L » ou « 3,2 × 10⁻⁵ mol/L »
  function molaire(logA) {
    logA = Math.round(logA * 10) / 10;
    const e = Math.floor(logA + 1e-9), m = 10 ** (logA - e);
    return (Math.abs(m - 1) < 1e-6 ? puissance(e) : `${virgule(m, 1)} × ${puissance(e)}`) + " mol/L";
  }

  // même concentration en masse du métal par litre : « ≈ 56 µg/L »
  function massique(cle, logA) {
    const M = MASSE[POURBAIX_ESPECES[cle].M];
    let g = 10 ** (Math.round(logA * 10) / 10) * M;
    const unites = [[1, "g/L"], [1e-3, "mg/L"], [1e-6, "µg/L"], [1e-9, "ng/L"]];
    const [f, u] = unites.find(([f]) => g >= f * 0.9995) || unites[unites.length - 1];
    g /= f;
    // deux chiffres significatifs : 56 µg/L, 5,6 µg/L, 560 µg/L
    const n = g >= 10 ? 0 : 1;
    if (g >= 100) g = Math.round(g / 10) * 10;
    return `≈ ${virgule(g, n).replace(/,0$/, "")} ${u}`;
  }

  return { systeme, molaire, massique, DEFAUT, MIN, MAX, _domaines: (cle, logA) => domaines(plans(cle, logA), false),
    _total: (cle, logA) => domainesTotal(plans(cle, logA)), _outils: { plans, domaines, solideTotal, logTotal } };
})();
