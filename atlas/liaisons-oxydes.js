// ============ Liaisons du cristal — scène de la famille « oxydes » ============
// 11/10/2026 (prototype : brucite et gibbsite, hydroxydes en feuillets). Coupe perpendiculaire aux feuillets, au bord d'un paquet :
// chaque feuillet = une couche de cations (Mg²⁺ ou Al³⁺) entre deux couches d'OH, chaque cation au centre d'un octaèdre de six OH
// (quatre dans le plan, un devant, un derrière) ; gibbsite (textes.dioct) : un site sur trois vide. D'un feuillet au suivant, les OH ne
// se tiennent que par des liaisons hydrogène. Mécanisme dessiné (dissolution par les protons, Furrer et Stumm 1986) : des H⁺ se fixent sur
// les OH du bord, qui deviennent des molécules d'eau encore liées au cation ; les liaisons cation–O lâchent (étape lente) et le cation
// part, habillé d'eau. Oxydes de fer et de manganèse (dissolution réductrice) : à faire.
// Variante textes.oxyde (hématite, 11/10/2026) : structure du corindon, couches d'oxygènes SERRÉES (pas d'OH ni de liaison hydrogène
// entre elles), deux sites sur trois occupés entre deux couches, le site vide décalé d'une couche à l'autre ; au bord, les oxygènes
// portent un H (OH de surface) et le cation suivi dépasse d'une marche (seul sur sa colonne), comme sur une marche réelle.
// Oxydes de fer (11/10/2026, priorité aux minéraux des sols) : onglet « Sol engorgé » (clé reduit) = dissolution RÉDUCTRICE, la seule
// qui compte dans les sols (Dos Santos Afonso et Stumm 1992 : le réducteur se fixe, cède un électron, Fe³⁺ → Fe²⁺, le Fe²⁺ se détache ;
// Jang et Brantley 2009 : le départ du Fe²⁺ est l'étape lente). Vitesses : Larsen et Postma 2001 (acide ascorbique, pH 3), qui comparent
// ferrihydrite, lépidocrocite et goethite. Variantes de dessin : textes.goethite (sur la grille de l'hématite, fer dans un site sur deux en
// doubles rangées, un O sur deux porte un H tourné vers les rangées vides), textes.desordre (ferrihydrite : sites pris au hasard, O qui
// ne tiennent qu'un fer = OH), textes.double (lépidocrocite : feuillets doubles OH / Fe / O / Fe / OH, tenus par des liaisons hydrogène).
// Variante textes.reste (rutile, anatase, 11/10/2026) : sur la grille serrée (textes.oxyde, motif textes.rutile ou textes.anatase), les H⁺ se
// fixent sur le bord mais les liaisons Ti–O (deux tiers de liaison) tiennent : rien ne part, les H⁺ repartent. Minuteurs grisés.
(function () {
  "use strict";
  const PAS = 40, X0 = 20, NE = 8, LO = 18;                 // pas des cations, colonne du bord, demi-hauteur d'un feuillet
  const YS = [50, 122, 194, 266];                           // couche d'OH du haut de chaque feuillet (cations à + LO, OH du bas à + 2 LO)
  const SU = 1;                                             // feuillet du cation suivi
  const cx = (i) => X0 + PAS * i, ox = (i) => X0 + PAS * i + PAS / 2;   // cations / OH (entre deux cations)
  const BORD = cx(NE) + PAS / 2 + 16;
  const BX = 556, BY = 262;                                 // bactérie du sol engorgé (décor de l'onglet reduit)
  const YO = [50, 86, 122, 158, 194, 230, 266, 302], SO = 3;   // oxyde : couches d'oxygènes, couche de cations du fer suivi (entre YO[SO] et YO[SO + 1])
  const YD = [50, 158, 266];                                 // double (lépidocrocite) : OH du haut de chaque feuillet (Fe à + LO et + 3 LO, O du cœur à + 2 LO, OH du bas à + 4 LO)
  const estOx = (d) => !!(d.textes && d.textes.oxyde), estDbl = (d) => !!(d.textes && d.textes.double);
  // Oxydes de manganèse (11/10/2026) : feuillets MnO₂ (une couche de Mn⁴⁺ entre deux couches d'O, sans H) écartés de ≈ 7 Å (YM : 108 px),
  // eau et cations entre eux (birnessite, vernadite), murs de deux octaèdres entre les feuillets (todorokite : tunnels), ou feuillet
  // Al/Li d'OH un sur deux (lithiophorite). Site vide (lacune) coiffé d'un Mn³⁺ dans la birnessite et la vernadite.
  const YM = [50, 158, 266], estMn = (d) => !!(d.textes && d.textes.mn);
  function lacMn(T, f, i) {
    if (f === SU && i >= NE - 1) return false;
    if (T.desordre) return hache(i, f) < 2;
    return !!T.lacunes && (i + 2 * f) % 6 === 2;
  }
  const hache = (i, j) => ((((i + 11) * 73856093) ^ ((j + 7) * 19349663)) >>> 0) % 10;   // désordre reproductible
  function presOx(d, j, i) {   // cation de la couche j (entre YO[j] et YO[j + 1]), colonne i ?
    if (j < 0 || j >= YO.length - 1 || i < 0 || i > NE) return false;
    if (i === NE) return j === SO;                                    // la marche : seul le fer suivi au bord
    const T = (d && d.textes) || {}, dj = ((j - SO) % 6 + 6) % 6;
    if (T.goethite) return (i + 2 * (dj % 2)) % 4 >= 2;               // doubles rangées pleines / vides, décalées d'une couche à l'autre
    if (T.rutile) return (i + j - SO + 60) % 2 === 1;                  // rutile : un site sur deux en damier (les chaînes d'octaèdres à arêtes communes filent perpendiculairement au dessin)
    if (T.anatase) return (i + Math.floor((j - SO) / 2)) % 2 === 1;     // anatase : un site sur deux, par paires de couches (octaèdres liés par des arêtes, en zigzag)
    if (T.desordre) return (j === SO && i === NE - 1) || hache(i, j) < 6;
    if (T.spinelle && T.lacunes && dj % 2 === 0 && !(j === SO && i >= NE - 1) && hache(i, j + 5) < 2) return false;   // maghémite : un site d'octaèdre sur six environ vide (tout le fer en Fe³⁺)
    if (T.spinelle) return dj % 2 === 0 ? (i + j) % 4 !== 0 : (i + j) % 4 === 0;   // magnétite : couches presque pleines (3/4) et presque vides (1/4) en alternance
    return (i + dj % 3) % 3 !== 0;                                    // corindon : deux sites sur trois
  }
  const vide = (d, i) => !!(d.textes && d.textes.dioct) && i % 3 === 0;   // un site sur trois vide, jamais le cation suivi (NE) ni son voisin de gauche
  const majuscule = (s) => s[0].toUpperCase() + s.slice(1);
  const nb = (x, O) => (x < 10 ? String(Math.round(x * 10) / 10).replace(".", ",") : O.sp(Math.round(x)));

  function decorOx(k, d, O, l, a) {
    const M = d.cation, vM = d.valences[`${M}-O`], pM = `${M}–O`;
    for (let jo = 0; jo < YO.length; jo++) {   // oxygènes : dessinés s'ils tiennent au moins un cation (couches jo − 1 et jo, colonnes i et i + 1)
      const y = YO[jo];
      for (let i = -1; i <= NE; i++) {
        if (i === NE && (jo === SO || jo === SO + 1)) continue;   // les deux O du fer suivi : dans les étapes
        const g = presOx(d, jo - 1, i) || presOx(d, jo, i), dr = presOx(d, jo - 1, i + 1) || presOx(d, jo, i + 1);
        if (!g && !dr) continue;
        const x = ox(i);
        a += O.atome(x, y, "O");
        if ((d.textes.goethite || d.textes.desordre) && jo > 0 && jo < YO.length - 1 && i >= 0) {   // OH dans le cristal (pas sur les bords coupés du dessin)
          const n = (j, c) => (presOx(d, j, c) ? 1 : 0), up = n(jo - 1, i) + n(jo - 1, i + 1), dn = n(jo, i) + n(jo, i + 1);
          const hy = d.textes.goethite ? (up === 0 ? -9 : dn === 0 ? 9 : 0) : (up + dn === 1 ? (up ? 9 : -9) : 0);
          if (hy) { l += O.lien(x, y, x, y + hy, { k: "oh" }); a += O.hlie(x, y + hy); continue; }
        }
        if (!dr && i >= NE - 2) { l += O.lien(x, y, x + 9, y, { k: "oh" }); a += O.hlie(x + 9, y); }   // OH de surface (au bord seulement : en haut et en bas, la couche voisine est hors du dessin)
      }
    }
    for (let j = 0; j < YO.length - 1; j++) for (let i = 0; i <= NE; i++) {
      if (!presOx(d, j, i) || (j === SO && i === NE)) continue;
      const x = cx(i), yc = YO[j] + LO, el = d.textes.ilmenite && Math.abs(j - SO) % 2 === 1 ? "Ti" : M;   // ilménite : une couche sur deux en titane
      const v = el === M ? vM : d.valences[`${el}-O`], pp = `${el}–O`;
      for (const [qx, qy] of [[ox(i - 1), YO[j]], [ox(i), YO[j]], [ox(i - 1), YO[j + 1]], [ox(i), YO[j + 1]]]) l += O.lien(x, yc, qx, qy, { k: "ion", v, p: pp });
      a += O.atome(x, yc, el);
    }
    return { l, a };
  }

  function decorDbl(k, d, O, l, a) {   // lépidocrocite : feuillets doubles ; dans le feuillet suivi, la rangée de fer du bas s'arrête une colonne avant (marche)
    const M = d.cation, vM = d.valences[`${M}-O`], pM = `${M}–O`;
    for (let f = 0; f < YD.length; f++) {
      const yu = YD[f], y1 = yu + LO, ym = yu + 2 * LO, y2 = yu + 3 * LO, yd = yu + 4 * LO, su = f === SU;
      const bas = (i) => i >= 0 && i <= (su ? NE - 1 : NE), haut = (i) => i >= 0 && i <= NE;
      for (let i = -1; i <= NE; i++) {
        const x = ox(i);
        if (x < 0) continue;
        if (!(su && i === NE)) { l += O.lien(x, yu, x, yu - 9, { k: "oh" }); a += O.atome(x, yu, "O") + O.hlie(x, yu - 9); }   // OH du dessus
        if (!(su && i === NE)) {                                                                                                  // O du cœur
          a += O.atome(x, ym, "O");
          if (i === NE) { l += O.lien(x, ym, x + 9, ym, { k: "oh" }); a += O.hlie(x + 9, ym); }   // au bord : OH de surface
        }
        if (bas(i) || bas(i + 1)) { l += O.lien(x, yd, x, yd + 9, { k: "oh" }); a += O.atome(x, yd, "O") + O.hlie(x, yd + 9); }   // OH du dessous
      }
      for (let i = 0; i <= NE; i++) {
        const x = cx(i);
        if (haut(i) && !(su && i === NE)) {
          for (const [qx, qy] of [[ox(i - 1), yu], [ox(i), yu], [ox(i - 1), ym], [ox(i), ym]]) l += O.lien(x, y1, qx, qy, { k: "ion", v: vM, p: pM });
          a += O.atome(x, y1, M);
        }
        if (bas(i)) {
          for (const [qx, qy] of [[ox(i - 1), ym], [ox(i), ym], [ox(i - 1), yd], [ox(i), yd]]) l += O.lien(x, y2, qx, qy, { k: "ion", v: vM, p: pM });
          a += O.atome(x, y2, M);
        }
      }
    }
    return { l, a };
  }

  function decorMn(k, d, O, l, a) {
    const T = d.textes, M = d.cation, vM = d.valences[`${M}-O`], pM = `${M}–O`, inter = T.inter || "Na";
    const Y = T.lithio ? [86, 158, 230, 302] : YM;   // lithiophorite : feuillets Al/Li et Mn collés par leurs liaisons hydrogène (≈ 4,7 Å chacun)
    for (let f = 0; f < Y.length; f++) {
      const yu = Y[f], yc = yu + LO, yd = yu + 2 * LO, su = f === SU;
      const al = T.lithio && f % 2 === 0, dx = T.desordre && f === 0 ? 13 : 0;   // lithiophorite : feuillets d'Al/Li ; vernadite : feuillet du haut décalé (empilement au hasard)
      for (let i = -1; i <= NE; i++) {   // oxygènes du feuillet (OH pour le feuillet Al/Li, H tournés vers les feuillets de Mn)
        if (su && i === NE) continue;
        const x = ox(i) + dx;
        if (x < 0 || x > BORD) continue;
        a += O.atome(x, yu, "O") + O.atome(x, yd, "O");
        if (al) for (const [y0, y1] of [[yu, yu - 9], [yd, yd + 9]]) { l += O.lien(x, y0, x, y1, { k: "oh" }); a += O.hlie(x, y1); } else if (i === NE) { for (const y of [yu, yd]) { l += O.lien(x, y, x + 9, y, { k: "oh" }); a += O.hlie(x + 9, y); } }   // OH du bord
      }
      for (let i = 0; i <= NE; i++) {
        if (su && i === NE) continue;
        const x = cx(i) + dx;
        if (x > BORD) continue;
        if (al) {   // gibbsite dont le site vide est pris par le lithium
          const el = hache(i, f + 5) < 3 ? "Li" : "Al", v = el === "Li" ? 1 / 6 : d.valences[`${el}-O`] ?? 0.5;
          for (const [qx, qy] of [[ox(i - 1) + dx, yu], [ox(i) + dx, yu], [ox(i - 1) + dx, yd], [ox(i) + dx, yd]]) l += O.lien(x, yc, qx, qy, { k: "ion", v, p: `${el}–O` });
          a += O.atome(x, yc, el);
          continue;
        }
        if (lacMn(T, f, i)) {   // site vide ; un Mn³⁺ le coiffe, au-dessus du feuillet, tenu par trois oxygènes (deux dans le plan du dessin)
          if (yu - 16 > 36 && !T.tunnels) {
            const v3 = d.valences[`${M}-O`] * 0.75;
            for (const qx of [ox(i - 1) + dx, ox(i) + dx]) l += O.lien(x, yu - 16, qx, yu, { k: "ion", v: v3, p: pM });
            a += O.atome(x, yu - 16, M, { cls: "lp-mn3" });
          }
          continue;
        }
        for (const [qx, qy] of [[ox(i - 1) + dx, yu], [ox(i) + dx, yu], [ox(i - 1) + dx, yd], [ox(i) + dx, yd]]) l += O.lien(x, yc, qx, qy, { k: "ion", v: vM, p: pM });
        a += O.atome(x, yc, M);
      }
      if (f === Y.length - 1 || T.lithio) continue;
      const ym = yd + 36;   // milieu de l'espace entre deux feuillets
      if (T.tunnels) {   // todorokite : murs de deux octaèdres entre les feuillets, tous les quatre sites → tunnels de 3 × 3 octaèdres
        for (const i of [2, 6]) {
          const x = cx(i);
          a += O.atome(ox(i - 1), ym, "O") + O.atome(ox(i), ym, "O");
          for (const yy of [yd + 18, yd + 54]) {
            for (const [qx, qy] of [[ox(i - 1), yy - 18], [ox(i), yy - 18], [ox(i - 1), yy + 18], [ox(i), yy + 18]]) l += O.lien(x, yy, qx, qy, { k: "ion", v: vM, p: pM });
            a += O.atome(x, yy, M);
          }
        }
        for (const [x, an] of [[cx(0) + 4, 60], [cx(4), 120], [cx(7) + 4, 250]]) a += O.eau(x, ym - 14, an, {});
        for (const x of [cx(4) - 20, cx(0) + 26]) a += O.ion(x, ym + 13, "Mg", "²⁺", { r: 9 });
      } else if (T.lithio) {   // liaisons hydrogène entre l'OH de l'Al et l'oxygène du manganèse
        // (dessinées par les H déjà posés : rien de plus)
      } else {   // birnessite, vernadite : un plan d'eau et de cations
        for (let i = 0; i <= NE; i += 2) a += O.eau(ox(i) - 6 + (T.desordre ? (hache(i, f + 3) - 5) * 2 : 0), ym + (i % 4 ? -6 : 6), i % 4 ? 70 : 250, {});
        for (const i of [1, 5]) a += O.ion(cx(i) + 2, ym + (i === 1 ? 4 : -4), inter, "⁺", { r: 9.5 });
      }
    }
    return { l, a };
  }

  function decor(k, d, O) {
    const M = d.cation, vM = d.valences[`${M}-O`], pM = `${M}–O`;
    let l = `<rect x="0" y="0" width="640" height="340" class="${k === "acide" ? "lp-f-acide" : k === "reduit" ? "lp-f-reduit" : "lp-f-eau"}"/>${O.relief.dessus([[0, 36], [BORD, 36], [BORD, 340]])}<path d="M0 36 H${BORD} V340 H0 Z" class="lp-f-cristal"/>`, a = "";
    const l0 = l.length;
    if (estMn(d)) ({ l, a } = decorMn(k, d, O, l, a));
    else if (estOx(d)) ({ l, a } = decorOx(k, d, O, l, a));
    else if (estDbl(d)) ({ l, a } = decorDbl(k, d, O, l, a));
    else for (let f = 0; f < YS.length; f++) {
      const yu = YS[f], yc = yu + LO, yd = yu + 2 * LO;
      for (let i = -1; i <= NE; i++) {   // OH du haut et du bas (le dernier, au bord, appartient au cation suivi dans son feuillet)
        if (f === SU && i === NE) continue;
        const x = ox(i);
        if (x < 0) continue;
        l += O.lien(x, yu, x, yu - 9, { k: "oh" }) + O.lien(x, yd, x, yd + 9, { k: "oh" });
        a += O.atome(x, yu, "O") + O.hlie(x, yu - 9) + O.atome(x, yd, "O") + O.hlie(x, yd + 9);
      }
      for (let i = 0; i <= NE; i++) {
        if (vide(d, i) || (f === SU && i === NE)) continue;
        const x = cx(i);
        for (const [qx, qy] of [[ox(i - 1), yu], [ox(i), yu], [ox(i - 1), yd], [ox(i), yd]]) l += O.lien(x, yc, qx, qy, { k: "ion", v: vM, p: pM });
        a += O.atome(x, yc, M);
      }
    }
    l = l.slice(0, l0) + O.relief.couche(l.slice(l0) + a) + l.slice(l0);
    if (k === "reduit" && estMn(d)) {   // oxydes de manganèse : le réducteur est un polyphénol (acteur P des étapes) ; eau du sol vers pH 4–6
      for (const [x, y, an] of [[470, 60, 20], [600, 120, 150], [455, 232, 300], [606, 318, 200], [470, 318, 60]]) a += O.eau(x, y, an, { decor: true });
      a += O.phenol(600, 250, 40, { decor: true });
      return { l, a };
    }
    if (k === "reduit") {   // sol engorgé : pas d'air, une bactérie qui cède des électrons, un peu d'acide (pH 3 au laboratoire)
      a += O.bacterie(BX, BY);
      for (const [x, y, an] of [[470, 60, 20], [590, 110, 150], [455, 232, 300], [606, 318, 200], [470, 318, 60]]) a += O.eau(x, y, an, { decor: true });
      for (const [x, y] of [[560, 40], [612, 196], [430, 296]]) a += O.hplus(x, y, { decor: true });
      return { l, a };
    }
    for (const [x, y, an] of [[470, 60, 20], [590, 110, 150], [520, 300, 60], [610, 250, 200], [455, 230, 300]]) a += O.eau(x, y, an, { decor: true });
    if (k === "acide") {
      for (const [x, y] of [[480, 120], [560, 40], [600, 180], [470, 290], [540, 220]]) a += O.hplus(x, y, { decor: true });
      for (const [x, y] of [[620, 300], [430, 40]]) a += O.ion(x, y, "Cl", "−", { decor: true, r: 11 });
    }
    return { l, a };
  }

  // Dissolution réductrice d'un oxyde de manganèse par un polyphénol (Stone et Morgan 1984 ; Matocha et al. 2001 : le complexe de surface se
  // forme lentement, les électrons passent aussitôt, le Mn²⁺ part) : le polyphénol chasse deux OH du bord et se fixe sur le Mn⁴⁺ (étape lente),
  // deux électrons passent (Mn⁴⁺ → Mn³⁺ → Mn²⁺, le polyphénol devient quinone), le Mn²⁺ part entouré d'eau, le bord recule.
  function etapesMn(k, d, O) {
    const T = d.textes || {}, M = d.cation, vM = d.valences[`${M}-O`], pM = `${M}–O`, o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const yu = YM[SU], yc = yu + LO, yd = yu + 2 * LO, x = cx(NE), xi = ox(NE - 1), xe = ox(NE);
    const v2 = vM / 2, p2 = `${M}²⁺–O`;   // Mn²⁺ : deux charges sur six oxygènes au lieu de quatre (Pauling)
    const io = (a, b, v = vM, p = pM) => ({ a, b, k: "ion", v, p }), oh = (a, b) => ({ a, b, k: "oh" });
    const pc = [x + 44.8, yc], po = [[x + 24, yc - 12], [x + 24, yc + 12]];   // polyphénol fixé : ses deux O à la place des deux OH du bord
    const A = {
      C: { t: "at", el: M, x, y: yc },
      Ou: { t: "at", el: "O", x: xe, y: yu }, Od: { t: "at", el: "O", x: xe, y: yd },
      Hu: { t: "h", x: xe + 9, y: yu }, Hd: { t: "h", x: xe + 9, y: yd },
      P: { t: "phenol", x: 540, y: 112, a: 150 },
      Wa: { t: "eau", x: 500, y: 300, a: 200, o: 0 }, Wb: { t: "eau", x: 560, y: 300, a: 30, o: 0 },
      E1: { t: "elec", x: pc[0], y: pc[1], o: 0 }, E2: { t: "elec", x: pc[0] + 4, y: pc[1] + 6, o: 0 },
      halo: { t: "halo", x, y: yc, r: 17 },
    };
    const B = { cu: io("C", [xi, yu]), cd: io("C", [xi, yd]), eu: io("C", "Ou"), ed: io("C", "Od"), hu: oh("Ou", "Hu"), hd: oh("Od", "Hd") };
    const R = O.relief, dl = decor(k, d, O).l, cv = R.devant([x, yc]);
    A.CV = Object.assign({ t: "at", el: "O", x: cv[0], y: cv[1], r: 8.5 }, R.avant);
    B.rv = io("C", "CV"); B.ra = io("C", R.arriere(dl, "O", [x, yc]));
    const e = [], suite = O.suite, ch = `${M}²⁺`, hyd = d.hydrate || `${M}(H₂O)₆²⁺`;
    e.push({ A, B, L: {}, g: [6, 0], h: { v: hv === null ? null : 0 },
      titre: "Le bord d'un feuillet, quand l'eau stagne",
      texte: `${T.debut || ""} Dans l'eau du sol arrive un polyphénol, une petite molécule organique lâchée par les feuilles mortes et les racines.`.trim() });
    e.push(suite(e[0], {
      titre: "Le polyphénol se fixe sur le manganèse du bord",
      texte: `Ses deux OH chassent les deux OH du bord, qui partent en molécules d'eau, et ses deux oxygènes se lient au ${M}⁴⁺. C'est l'étape lente : ${o.lettres || "durée non mesurée"} en moyenne par manganèse de la surface${o.lettres ? ", au laboratoire" : ""} ; une fois le polyphénol accroché, la suite va très vite.${T.lent_reduit ? " " + T.lent_reduit : ""}`,
      A: { P: { x: pc[0], y: pc[1], a: 150 }, Ou: { t: "eau", x: 470, y: 62, a: -60 }, Hu: { x: 470, y: 62, o: 0 }, Od: { t: "eau", x: 476, y: 300, a: 60 }, Hd: { x: 476, y: 300, o: 0 } },
      B: { eu: 0, ed: 0, hu: 0, hd: 0, pu: io("C", po[0]), pd: io("C", po[1]) }, h: Object.assign({ cours: true }, H),
    }));
    e.push(suite(e[1], {
      titre: `Deux électrons passent : ${M}⁴⁺ devient ${ch}`,
      texte: `Le polyphénol cède deux électrons au manganèse, l'un après l'autre (${M}⁴⁺ → ${M}³⁺ → ${ch}) : il devient une quinone. Avec deux charges au lieu de quatre, le manganèse ne tient plus ses oxygènes qu'à moitié (traits plus fins).`,
      A: { E1: { x: x + 14, y: yc - 6, o: 1 }, E2: { x: x + 14, y: yc + 6, o: 1 }, P: { cls: "q" } },
      B: { cu: io("C", [xi, yu], v2, p2), cd: io("C", [xi, yd], v2, p2), rv: io("C", "CV", v2, p2), ra: io("C", B.ra.b, v2, p2), pu: io("C", po[0], v2, p2), pd: io("C", po[1], v2, p2) },
      L: { lF: { x: xe + 4, y: yc + 34, t: ch } }, h: H,
    }));
    e[1].A.E1 = Object.assign({}, e[1].A.E1, { x: pc[0], y: pc[1] }); e[1].A.E2 = Object.assign({}, e[1].A.E2, { x: pc[0], y: pc[1] });   // partent du polyphénol
    const s = { x: 520, y: 100 };
    e.push(suite(e[2], {
      titre: `Le ${ch} part, habillé d'eau`,
      texte: `Ses dernières liaisons au feuillet lâchent : le ${ch} part entouré de six molécules d'eau (${hyd}), et la quinone s'éloigne. Cette étape est rapide.`,
      A: { C: s, halo: { x: s.x, y: s.y, o: 0 }, Ou: { x: s.x, y: s.y - 30, a: -90 }, Od: { x: s.x, y: s.y + 30, a: 90 },
        Wa: { x: s.x - 30, y: s.y, a: 180, o: 1 }, Wb: { x: s.x + 30, y: s.y, a: 0, o: 1 }, P: { x: 590, y: 236, a: 110 }, E1: { o: 0 }, E2: { o: 0 } },
      B: { cu: 0, cd: 0, rv: 0, ra: 0, pu: 0, pd: 0, wa: { a: "C", b: "Wa", k: "eau", v: v2, p: p2 }, wb: { a: "C", b: "Wb", k: "eau", v: v2, p: p2 },
        wu: { a: "C", b: "Ou", k: "eau", v: v2, p: p2 }, wd: { a: "C", b: "Od", k: "eau", v: v2, p: p2 } },
      L: { lF: 0, lC: { x: s.x, y: s.y + 62, t: hyd, m: 1 } }, h: H,
    }));
    const v = [cx(NE - 1), yc];
    e.push(suite(e[3], {
      titre: "Le bord recule d'un cran",
      texte: `Le manganèse voisin se retrouve au bord et attend son polyphénol. ${T.fin_reduit || ""}`.trim(),
      A: { halo: { x: v[0], y: v[1], o: 1 } }, h: H,
    }));
    return e;
  }

  function etapes(k, d, O) {
    if (estMn(d)) return etapesMn(k, d, O);
    const T = d.textes || {}, M = d.cation, vM = d.valences[`${M}-O`], pM = `${M}–O`, o = d.onglets[k] || {}, hv = o.t ?? null;
    const H = { v: hv, txt: o.txt, sous: / à /.test(o.fourchette || "") ? o.fourchette : "" };
    const red = k === "reduit", ox1 = estOx(d), dbl = estDbl(d), cote = ox1 || dbl;   // cote : l'O du bas du fer suivi porte son H sur le côté (OH de surface)
    const yu = ox1 ? YO[SO] : dbl ? YD[SU] : YS[SU], yc = yu + LO, yd = yu + 2 * LO, x = cx(NE), xi = ox(NE - 1), xe = ox(NE);
    const le = O.art(M, "le"), Le = majuscule(le), nom = O.nomEl(M);
    const v2 = red ? vM * 2 / 3 : vM, p2 = red ? `${M}²⁺–O` : pM;   // Fe²⁺ : deux charges sur six oxygènes au lieu de trois (Pauling)
    const io = (a, b) => ({ a, b, k: "ion", v: vM, p: pM }), io2 = (a, b) => ({ a, b, k: "ion", v: v2, p: p2 }), we = (b) => ({ a: "C", b, k: "eau", v: v2, p: red ? p2 : pM }), oh = (a, b) => ({ a, b, k: "oh" });
    const A = {
      C: { t: "at", el: M, x, y: yc },
      Ou: { t: "at", el: "O", x: xe, y: yu }, Od: { t: "at", el: "O", x: xe, y: yd },
      Hu: ox1 ? { t: "h", x: xe + 9, y: yu } : { t: "h", x: xe, y: yu - 9 }, Hd: cote ? { t: "h", x: xe + 9, y: yd } : { t: "h", x: xe, y: yd + 9 },
      Ha: { t: "hp", x: 470, y: 130 }, Hb: { t: "hp", x: 520, y: 180 },
      Wa: { t: "eau", x: 500, y: 90, a: 200 }, Wb: { t: "eau", x: 560, y: 150, a: 30 },
      halo: { t: "halo", x, y: yc, r: 17 },
    };
    if (red) A.E = { t: "elec", x: BX - 52, y: BY - 2 };
    const B = { cu: io("C", [xi, yu]), cd: io("C", [xi, yd]), eu: io("C", "Ou"), ed: io("C", "Od"), hu: oh("Ou", "Hu"), hd: oh("Od", "Hd") };
    // relief : les deux OH hors du plan du cation suivi (devant en contour, derrière dans la copie pâle)
    const R = O.relief, dl = decor(k, d, O).l, pc = [x, yc], cv = R.devant(pc);
    A.CV = Object.assign({ t: "at", el: "O", x: cv[0], y: cv[1], r: 8.5 }, R.avant);
    B.rv = io("C", "CV"); B.ra = io("C", R.arriere(dl, "O", pc));
    const e = [], suite = O.suite;
    const hp = ox1 ? { Ha: { t: "h", x: xe + 4, y: yu - 9 }, Hb: { t: "h", x: xe + 4, y: yd + 9 } }
      : dbl ? { Ha: { t: "h", x: xe + 8, y: yu + 6 }, Hb: { t: "h", x: xe + 4, y: yd + 9 } }
      : { Ha: { t: "h", x: xe + 8, y: yu + 6 }, Hb: { t: "h", x: xe + 8, y: yd - 6 } };
    if (red) {   // sol engorgé : l'électron d'abord, puis les H⁺, puis le Fe²⁺ part (étape lente)
      const ch = `${M}²⁺`, hyd = `${M}(H₂O)₆²⁺`, sansAir = "Sans air, les bactéries qui mangent la matière organique « respirent » le fer : elles lui cèdent les électrons qu'elles auraient donnés à l'oxygène.";
      e.push({ A, B, L: {}, g: [6, 0], h: { v: hv === null ? null : 0 },
        titre: "Le bord du cristal, sans air",
        texte: d.onglets.eau ? sansAir : `${T.debut || ""} ${sansAir}`.trim() });
      e.push(suite(e[0], {
        titre: `Un électron arrive : ${M}³⁺ devient ${ch}`,
        texte: `${Le} suivi reçoit un électron. Avec deux charges au lieu de trois, il tient moins ses six oxygènes : chaque liaison passe d'une demi-liaison à un tiers (traits plus fins).`,
        A: { E: { x: x + 6, y: yc, o: 0 } },
        B: { cu: io2("C", [xi, yu]), cd: io2("C", [xi, yd]), eu: io2("C", "Ou"), ed: io2("C", "Od"), rv: io2("C", "CV"), ra: io2("C", B.ra.b) },
        L: { lF: { x: xe + 22, y: yc + 5, t: ch } },
      }));
      e.push(suite(e[1], {
        titre: "Des H⁺ se fixent sur les oxygènes du bord",
        texte: `Deux H⁺ se posent sur les oxygènes du bord : chacun devient une molécule d'eau, à peine retenue par le ${ch}.`,
        A: hp, B: { eu: we("Ou"), ed: we("Od"), ha: oh("Ou", "Ha"), hb: oh("Od", "Hb") }, g: [4, 2],
      }));
      const s = { x: 520, y: 96 };
      e.push(suite(e[2], {
        titre: `Le ${ch} part, habillé d'eau`,
        texte: `Ses dernières liaisons au cristal lâchent et l'eau prend leur place : le ${ch} part, entouré de six molécules d'eau (${hyd}). C'est l'étape lente, et non l'arrivée de l'électron : ${o.lettres || "durée non mesurée"} en moyenne par fer de la surface, au laboratoire, où l'acide ascorbique (la vitamine C) remplace les bactéries.${T.lent_reduit ? " " + T.lent_reduit : ""}`,
        A: { C: s, halo: { x: s.x, y: s.y, o: 0 }, Ou: { t: "eau", x: s.x, y: s.y - 30, a: -90 }, Hu: { x: s.x, y: s.y - 30, o: 0 }, Ha: { x: s.x, y: s.y - 30, o: 0 },
          Od: { t: "eau", x: s.x, y: s.y + 30, a: 90 }, Hd: { x: s.x, y: s.y + 30, o: 0 }, Hb: { x: s.x, y: s.y + 30, o: 0 },
          Wa: { x: s.x - 30, y: s.y, a: 180 }, Wb: { x: s.x + 30, y: s.y, a: 0 } },
        B: { cu: 0, cd: 0, rv: 0, ra: 0, ha: 0, hb: 0, hu: 0, hd: 0, wa: we("Wa"), wb: we("Wb") }, g: [0, 6], h: Object.assign({ cours: true }, H),
        L: { lF: 0, lC: { x: s.x, y: s.y + 62, t: hyd, m: 1 } },
      }));
      const v = [cx(NE - 1), yc];
      e.push(suite(e[3], {
        titre: "Le bord recule d'un cran",
        texte: `Les oxygènes qu'il partageait restent à son voisin, qui se retrouve au bord et attend son électron. ${T.fin_reduit || "Le Fe²⁺, soluble, part avec l'eau qui stagne."}`,
        A: { halo: { x: v[0], y: v[1], o: 1 } }, h: H,
      }));
      return e;
    }
    e.push({ A, B, L: {}, g: [6, 0], h: { v: hv === null ? null : 0 },
      titre: k === "eau" ? (ox1 ? "Le bord du cristal" : "Le bord d'un paquet de feuillets") : "Le même bord, dans l'acide",
      texte: k === "eau"
        ? (T.debut || `Chaque feuillet : une couche ${O.art(M, "de")} entre deux couches d'OH ; chaque ${nom} tient six OH, en octaèdre. D'un feuillet au suivant, les OH ne se tiennent que par des liaisons hydrogène. Au bord, on suit ${O.art(M, "un")} (cerclé).`)
        : "L'acide libère des ions H⁺ (en vert) et des ions chlorure Cl⁻ (en gris), qui ne réagissent pas. Les H⁺ sont attirés par les OH du bord.",
    });
    e.push(suite(e[0], {
      titre: "Des H⁺ se fixent sur les OH du bord",
      texte: `${T.deuxH || `Deux H⁺ se posent sur les OH du bord : chacun devient une molécule d'eau, encore accrochée ${O.art(M, "au")}, mais bien moins fortement qu'un OH.`}${k === "eau" && T.eauH ? " " + T.eauH : ""}`,
      A: hp, B: { eu: we("Ou"), ed: we("Od"), ha: oh("Ou", "Ha"), hb: oh("Od", "Hb") }, g: [4, 2],
    }));
    const s = { x: 520, y: 96 };
    e.push(suite(e[1], {
      titre: `${Le} part, habillé d'eau`,
      texte: `Les liaisons ${pM} qui le tenaient encore au feuillet lâchent une à une, et l'eau prend leur place : ${le} part, entouré de six molécules d'eau (${d.hydrate}). C'est l'étape lente : ${o.lettres || "durée non mesurée"} en moyenne par unité de la surface.${T["lent_" + k] ? " " + T["lent_" + k] : ""}`,
      A: { C: s, halo: { x: s.x, y: s.y, o: 0 }, Ou: { t: "eau", x: s.x, y: s.y - 30, a: -90 }, Hu: { x: s.x, y: s.y - 30, o: 0 }, Ha: { x: s.x, y: s.y - 30, o: 0 },
        Od: { t: "eau", x: s.x, y: s.y + 30, a: 90 }, Hd: { x: s.x, y: s.y + 30, o: 0 }, Hb: { x: s.x, y: s.y + 30, o: 0 },
        Wa: { x: s.x - 30, y: s.y, a: 180 }, Wb: { x: s.x + 30, y: s.y, a: 0 } },
      B: { cu: 0, cd: 0, rv: 0, ra: 0, ha: 0, hb: 0, hu: 0, hd: 0, wa: we("Wa"), wb: we("Wb") }, g: [0, 6], h: Object.assign({ cours: true }, H),
      L: { lC: { x: s.x, y: s.y + 62, t: d.hydrate, m: 1 } },
    }));
    if (T.reste) {   // titane (rutile, anatase) : les H⁺ se fixent, mais les liaisons Ti–O tiennent ; rien ne part, les H⁺ repartent
      e[2] = suite(e[1], {
        titre: `${Le} ne part pas`,
        texte: `${T.reste} ${o.lettres ? "" : "Aucune vitesse de départ n'a été mesurée à 25 °C."}`.trim(),
        h: Object.assign({ cours: true }, H),
      });
      e.push(suite(e[2], {
        titre: "Les H⁺ repartent, le bord ne bouge pas",
        texte: `Les deux molécules d'eau rendent leur H⁺ à l'eau du sol et redeviennent des OH : le bord est le même qu'au début.${T["fin_" + k] ? " " + T["fin_" + k] : ""}`,
        A: { Ha: { t: "hp", x: 470, y: 130 }, Hb: { t: "hp", x: 520, y: 180 } },
        B: { eu: io("C", "Ou"), ed: io("C", "Od"), ha: 0, hb: 0 }, g: [6, 0], h: H,
      }));
      return e;
    }
    const v = [cx(vide(d, NE - 1) ? NE - 2 : NE - 1), yc];
    e.push(suite(e[2], {
      titre: "Le bord recule d'un cran",
      texte: `Les OH qu'il partageait avec son voisin restent à celui-ci : ${le} voisin se retrouve au bord, et tout recommence.${T["fin_" + k] ? " " + T["fin_" + k] : ""}`,
      A: { halo: { x: v[0], y: v[1], o: 1 } }, h: H,
    }));
    return e;
  }

  function energie(d, O) {
    const E = d.energie || {}, T = d.textes || {}, M = d.cation, rep = d.repere, z = T.charge || "²⁺", fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
    const duo = [
      { titre: `${M}–O`, sous: `liaison ${O.nature(`${M}–O`)} (électrons ${/mi-/.test(O.nature(`${M}–O`)) ? "en partie " : ""}cédés)`,
        schema: { type: "don", a: M, la: `${M}${z}`, ra: 17, fa: 12, b: "O", aria: `${majuscule(O.art(M, "le"))} cède ses électrons aux OH` },
        li: [`Ionique ${O.fraction(O.ionicite(M, "O"))} (Pauling). ${T.duoM || ""}`.trim(), T.lache || "C'est elle qui lâche : elle règle la vitesse."] },
      { titre: "O–H", sous: `liaison ${O.nature("O–H")} (électrons partagés)`,
        schema: { type: "partage", a: "O", b: "H", aria: "L'oxygène et l'hydrogène partagent leurs électrons" },
        li: [T.liOH || "Ionique à moins d'un tiers (Pauling) : l'hydrogène reste accroché à son oxygène. L'OH ne se casse pas : il part entier, devenu molécule d'eau.",
          T.entre || "Entre deux feuillets, les OH ne se tiennent que par des liaisons hydrogène, bien plus faibles : d'où le clivage parfait et la faible dureté."] },
    ];
    const EA = [["eaAcide", "Dans l'acide (H⁺)", "dans l'acide"], ["eaNeutre", "Vers la neutralité", "vers la neutralité"]].filter(([c]) => E[c] != null);
    let barres = null;
    if (EA.length) {
      const fac = (x) => fr1(Math.exp((x * 1000) / 8.314 * (1 / 298.15 - 1 / 308.15)));
      barres = { titre: "Énergie d'activation de la dissolution", unite: "kJ/mol", max: 100, graduations: [0, 25, 50, 75, 100], onglets: [{ k: "ea", nom: "Mesurée" }],
        rangs: EA.map(([c, nom]) => { const [a, b] = E[c]; return { nom, el: M, hachure: true, val: { ea: [a, b] }, txt: { ea: a === b ? `${fr1(a)} kJ/mol` : `${fr1(a)} à ${fr1(b)} kJ/mol` } }; }),
        explic: { ea: `L'énergie qu'il faut fournir pour que la réaction se fasse : plus elle est grande, plus la chaleur accélère la dissolution. De 25 à 35 °C, la vitesse est multipliée par ${EA.map(([c, , dans]) => E[c][0] === E[c][1] ? `${fac(E[c][0])} ${dans}` : `${fac(E[c][0])} à ${fac(E[c][1])} ${dans}`).join(", ")}.` } };
    }
    let temps = null;
    const ce = d.onglets.eau;
    if (rep && rep.eau && rep.eau.t && ce && ce.t) {
      const f = O.rond2(ce.t / rep.eau.t);
      temps = { titre: T.tempsTitre || "Ce que changent les OH", explic: `${T.tempsExplic || ""} ${majuscule(rep.la)} sert de repère. Barres : écart entre les valeurs publiées.`.trim(),
        rangees: [{ titre: "Une unité de la surface quitte le cristal, dans l'eau du sol à 25 °C",
          fois: f >= 1 ? `environ ${nb(f, O)} fois plus lent pour ${d.la}` : `environ ${nb(O.rond2(1 / f), O)} fois plus rapide pour ${d.la}`,
          pts: [{ el: rep.cation, min: rep.eau.tmin, max: rep.eau.tmax, v: rep.eau.t, et: `${rep.nom} · ${rep.eau.court}`, ou: "haut" },
            { el: M, min: ce.tmin, max: ce.tmax, v: ce.t, et: `${d.nom} · ${ce.court}`, ou: "bas" }] }] };
    }
    if (T.ilmenite) duo[1] = { titre: "Ti–O", sous: `liaison ${O.nature("Ti–O")} (électrons en partie cédés)`,
      schema: { type: "don", a: "Ti", la: "Ti⁴⁺", ra: 17, fa: 12, b: "O", aria: "Le titane cède ses électrons aux oxygènes" },
      li: [`Ionique ${O.fraction(O.ionicite("Ti", "O"))} (Pauling). Le titane répartit ses quatre charges sur six oxygènes : deux tiers de liaison chacune, deux fois plus que Fe–O.`,
        "C'est pourquoi le titane reste quand le fer part : le grain d'ilménite devient peu à peu un grain d'oxyde de titane (leucoxène)."] };
    // sol engorgé : les oxydes de fer réduits côte à côte (même réducteur, même pH), d'après LIAISONS_DONNEES
    const red = d.onglets && d.onglets.reduit;
    if (red && !d.onglets.eau && !T.mn) duo.splice(0, duo.length,
      { titre: `${M}³⁺–O`, sous: `liaison ${O.nature(`${M}–O`)} (électrons en partie cédés)`,
        schema: { type: "don", a: M, la: `${M}³⁺`, ra: 17, fa: 12, b: "O", aria: `Le fer à trois charges cède ses électrons aux oxygènes` },
        li: [`Ionique ${O.fraction(O.ionicite(M, "O"))} (Pauling). Le fer répartit ses trois charges sur six oxygènes : chaque liaison vaut une demi-liaison simple.`,
          "Tant que le fer garde ses trois charges, elle tient : à l'air, les oxydes de fer sont les minéraux les plus stables des sols."] },
      { titre: `${M}²⁺–O`, sous: "après l'arrivée d'un électron",
        schema: { type: "don", a: M, la: `${M}²⁺`, ra: 17, fa: 12, b: "O", aria: `Le fer à deux charges tient moins ses oxygènes` },
        li: ["Deux charges sur six oxygènes : un tiers de liaison seulement.", "Plus lâche, elle finit par céder : c'est le départ du Fe²⁺ qui règle la vitesse."] });
    if (T.mn) duo.splice(0, duo.length,
      { titre: `${M}⁴⁺–O`, sous: `liaison ${O.nature(`${M}–O`)} (électrons en partie cédés)`,
        schema: { type: "don", a: M, la: `${M}⁴⁺`, ra: 17, fa: 12, b: "O", aria: "Le manganèse à quatre charges cède ses électrons aux oxygènes" },
        li: [`Ionique ${O.fraction(O.ionicite(M, "O"))} (Pauling). Le manganèse répartit ses quatre charges sur six oxygènes : deux tiers de liaison chacune, plus que Fe³⁺–O (une demi).`,
          "Tant qu'il garde ses quatre charges, il tient bon : à l'air, les oxydes de manganèse ne se dissolvent pas."] },
      { titre: `${M}²⁺–O`, sous: "après l'arrivée de deux électrons",
        schema: { type: "don", a: M, la: `${M}²⁺`, ra: 17, fa: 12, b: "O", aria: "Le manganèse à deux charges tient moins ses oxygènes" },
        li: ["Deux charges sur six oxygènes : un tiers de liaison seulement, deux fois moins qu'avant.",
          "Le Mn²⁺ est soluble : il part avec l'eau, puis noircit en taches et en petites billes là où l'air revient."] });
    const tous = [].concat(temps || []);
    if (red) {
      const D = (window.LIAISONS_DONNEES || {}).mineraux || {};
      const ids = ["vernadite", "birnessite", "ferrihydrite", "lepidocrocite", "goethite", "hematite"].filter((i) => D[i] && D[i].onglets.reduit && D[i].onglets.reduit.t);
      const avecMn = ids.some((i) => D[i].cation === "Mn");
      if (ids.length > 1) tous.push({ titre: avecMn ? "Réduits, le manganèse part avant le fer" : "Réduits, les oxydes de fer ne partent pas au même rythme",
        explic: avecMn
          ? "Un atome de métal de la surface quitte le cristal, au laboratoire, avec 10 mmol/L de réducteur : vitamine C à pH 3 pour le fer (Larsen et Postma 2001), polyphénol (catéchol) vers pH 4 à 6 pour le manganèse (Matocha et al. 2001). Les réducteurs diffèrent, mais l'écart est trop grand pour venir d'eux seuls : avec la même vitamine C, un oxyde de manganèse (la manganite) part encore environ cent fois plus vite que la ferrihydrite (Jun et Martin 2003). C'est pourquoi, quand l'eau stagne, le manganèse quitte le sol avant le fer. Barres : écart entre les échantillons mesurés."
          : "Un fer de la surface quitte le cristal, sans air, avec le même réducteur et au même pH (3). Seul l'arrangement des atomes change : plus les grains sont fins et mal rangés, plus le fer part vite. Barres : écart entre les échantillons mesurés.",
        rangees: ids.map((i) => { const r = D[i].onglets.reduit; return { titre: `${majuscule(D[i].nom)}${i === d.id ? " (cette fiche)" : ""}`,
          pts: [{ el: D[i].cation, min: r.tmin, max: r.tmax, v: r.t, et: r.court, ou: "haut" }] }; }) });
    }
    return { duo, barres, temps: tous.length ? tous : null };
  }

  Liaisons.scene("oxydes", {
    onglets: (d) => [["eau", "Dans l'eau du sol"], ["acide", "Dans l'acide"], ["reduit", "Sol engorgé"]].filter(([k]) => d.onglets && d.onglets[k]).map(([k, nom]) => ({ k, nom })),
    decor, etapes, energie,
    legende: (d) => ({ "e:O": (d && d.textes && d.textes.legO) || "oxygène d'un OH du cristal", "i:Cl−": "Cl⁻, ne réagit pas",
      "t:avant": "atome juste devant le plan du dessin (en contour)", "t:arriere": "couche juste derrière le plan du dessin (plus petite, pâle)",
      "t:elec": "électron cédé par la bactérie", "t:bact": "bactérie du sol (en vrai, deux cents à quatre cents fois plus longue que tout le dessin)",
      "l:Fe²⁺–O:ion": "liaison Fe²⁺–O, plus faible (un tiers de liaison)", "l:Fe²⁺–O:eau": "liaison Fe²⁺–O avec l'eau",
      "l:Mn²⁺–O:ion": "liaison Mn²⁺–O, plus faible (un tiers de liaison)", "l:Mn²⁺–O:eau": "liaison Mn²⁺–O avec l'eau",
      "t:phenol": "polyphénol des feuilles mortes et des racines (ici le catéchol ; vert : ses carbones)" }),
    aria: (d) => estMn(d) ? `Coupe du bord d'un paquet de feuillets de ${d.nom}, étape par étape` : estOx(d) ? `Coupe du bord d'un cristal d'${d.nom}, étape par étape` : `Coupe du bord d'un paquet de feuillets de ${d.nom}, étape par étape`,
  });
})();
