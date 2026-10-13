// ============ Liaisons du cristal — MOTEUR : « Au plus près du cristal » et « Énergie de liaison et cinétique » ============
// 09/10/2026. Demande de l'utilisateur : montrer « finement mais simplement » comment l'eau ou l'acide défont un cristal, au niveau
// des atomes, avec la force des liaisons ; d'abord la magnésite, puis TOUS les minéraux (chantier « ultracode », étape 1).
// Trois couches, chacune son propriétaire :
//   liaisons.js            le MOTEUR (ce fichier) : lecteur, minuteur, anneau, onglets, légende générée, carte d'énergie, axe des temps ;
//   liaisons-<famille>.js  une SCÈNE par famille de mécanisme : Liaisons.scene(nom, gabarit) — décor, étapes, textes, carte d'énergie ;
//   liaisons-donnees.js    les NOMBRES, GÉNÉRÉ par tools/liaisons_donnees.py depuis tools/liaisons/<famille>.json (ne jamais retoucher).
// Contrat complet du gabarit et des données : tools/liaisons/API.md. Contrôle : tools/planche_liaisons.html.
// Branchement : Liaisons.cartes(id) dans renderMineralPage (app.js) après « Ce que donne son altération » ; Liaisons.brancher(racine).
(function () {
  "use strict";
  const rad = (d) => d * Math.PI / 180, lerp = (a, b, t) => a + (b - a) * t, f1 = (v) => (+v).toFixed(1);
  const borne = (x) => Math.max(0, Math.min(1, x));
  const DUREE_ETAPE = 12000, DUREE_TRANSITION = 1100, D_COMPTE = DUREE_ETAPE * 0.8;
  const SCENES = {};
  const DONNEES = () => window.LIAISONS_DONNEES || { mineraux: {}, sources: {} };

  // ---------- 1. Éléments : nom, électronégativité de Pauling, rayon dans la scène ----------
  // χ : échelle de Pauling (valeurs révisées d'Allred 1961, tables usuelles). Rayons : px dans la scène 640 × 340, choisis pour
  // la lecture (les cations suivis plus gros que leurs voisins, comme les « billes » de la 3D), pas à l'échelle.
  const EL = {
    H: ["hydrogène", 2.20, 4.2], Li: ["lithium", 0.98, 9], Be: ["béryllium", 1.57, 7], B: ["bore", 2.04, 5.5],
    C: ["carbone", 2.55, 5.5], N: ["azote", 3.04, 5.5], O: ["oxygène", 3.44, 7.5], F: ["fluor", 3.98, 8],
    Na: ["sodium", 0.93, 12], Mg: ["magnésium", 1.31, 10.5], Al: ["aluminium", 1.61, 9.5], Si: ["silicium", 1.90, 6.5],
    P: ["phosphore", 2.19, 6.5], S: ["soufre", 2.58, 9], Cl: ["chlore", 3.16, 11], K: ["potassium", 0.82, 13.5],
    Ca: ["calcium", 1.00, 12], Sc: ["scandium", 1.36, 10.5], Ti: ["titane", 1.54, 9.5], V: ["vanadium", 1.63, 9.5],
    Cr: ["chrome", 1.66, 9.5], Mn: ["manganèse", 1.55, 10.5], Fe: ["fer", 1.83, 10.5], Co: ["cobalt", 1.88, 10.5],
    Ni: ["nickel", 1.91, 10.5], Cu: ["cuivre", 1.90, 10.5], Zn: ["zinc", 1.65, 10.5], As: ["arsenic", 2.18, 9],
    Se: ["sélénium", 2.55, 9], Br: ["brome", 2.96, 12], Sr: ["strontium", 0.95, 13], Y: ["yttrium", 1.22, 12],
    Zr: ["zirconium", 1.33, 11], Nb: ["niobium", 1.6, 10.5], Mo: ["molybdène", 2.16, 10], Ag: ["argent", 1.93, 11],
    Cd: ["cadmium", 1.69, 11], Sn: ["étain", 1.96, 11], Sb: ["antimoine", 2.05, 10.5], Te: ["tellure", 2.1, 11],
    I: ["iode", 2.66, 13], Cs: ["césium", 0.79, 15], Ba: ["baryum", 0.89, 14], La: ["lanthane", 1.10, 13],
    Ce: ["cérium", 1.12, 13], Nd: ["néodyme", 1.14, 13], Hf: ["hafnium", 1.3, 11], Ta: ["tantale", 1.5, 10.5],
    W: ["tungstène", 2.36, 10], Pt: ["platine", 2.28, 10.5], Au: ["or", 2.54, 11], Hg: ["mercure", 2.00, 11.5],
    Pb: ["plomb", 1.87, 13], Bi: ["bismuth", 2.02, 12], Th: ["thorium", 1.3, 13], U: ["uranium", 1.38, 13],
    Ow: ["oxygène de l'eau", 3.44, 8],
  };
  const nomEl = (el) => (EL[el] ? EL[el][0] : el);
  const rayon = (el) => (EL[el] ? EL[el][2] : 9);
  const voyelle = (m) => /^[aeiouyéèêâîôûœ]/i.test(m) || /^hydr/i.test(m);
  // art("Mg", "le") → « le magnésium » ; "du" → « du magnésium » / « de l'aluminium » ; "au" → « au magnésium » / « à l'or »
  function art(el, forme = "le") {
    const n = nomEl(el), v = voyelle(n);
    return ({ le: v ? `l'${n}` : `le ${n}`, du: v ? `de l'${n}` : `du ${n}`, au: v ? `à l'${n}` : `au ${n}`, un: `un ${n}`, de: v ? `d'${n}` : `de ${n}` })[forme] || n;   // noms d'éléments : tous masculins
  }
  // caractère ionique de Pauling : 1 − exp(−Δχ²/4)
  function ionicite(a, b) { const x = EL[a], y = EL[b]; if (!x || !y) return null; const d = x[1] - y[1]; return 1 - Math.exp(-(d * d) / 4); }
  function nature(p) {   // p = "Mg–O"
    const [a, b] = p.split(/[–-]/), f = ionicite(a, b);
    if (f == null) return "";
    return f >= 0.6 ? "surtout ionique" : f >= 0.3 ? "mi-ionique, mi-covalente" : "covalente";
  }

  // couleurs : celles de la 3D (palette VESTA de structures3d.js), adoucies par des variables CSS quand liaisons.css en définit
  const VESTA = { H: "#ffcccc", C: "#814929", O: "#fe0300", Mg: "#fb7b15", Ca: "#5a96bd", Fe: "#b57100", Si: "#1b3bfa", Al: "#81b2d6",
    Na: "#f9dc3c", K: "#a121f6", Cl: "#31fc02", S: "#fffa00" };
  const hexDe = (el) => { const c = window.Structure3D && Structure3D.outils && Structure3D.outils.COULEURS; return (c && c[el]) || VESTA[el] || "#9a9a9a"; };
  const couleur = (el) => (el === "Ow" ? "var(--lp-ow)" : `var(--lp-e-${el}, ${hexDe(el)})`);
  function clair(el) {   // fond clair de la scène : les couleurs très claires reçoivent un liseré
    if (el === "Ow") return false;
    const h = hexDe(el).replace("#", ""), [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.62;
  }

  // ---------- 2. Primitives de dessin (chaînes SVG, chacune avec sa clé de légende data-lg) ----------
  const opa = (o) => (o != null && o < 0.999 ? ` opacity="${o.toFixed(2)}"` : "");
  function atome(x, y, el, o = {}) {
    const lg = o.lg === false ? "" : ` data-lg="${o.lg || (el === "Ow" ? "t:eau" : "e:" + el)}"`;
    return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(o.r ?? rayon(el))}" class="lp-at${clair(el) ? " lp-clair" : ""}${o.cls ? " " + o.cls : ""}" style="fill:${couleur(el)}"${opa(o.o)}${lg}/>`;
  }
  function eau(x, y, a, o = {}) {   // molécule d'eau : O au centre, deux H à 104,5° (dessinés à ± 52°)
    const h = [a - 52, a + 52].map((d) => [x + 13 * Math.cos(rad(d)), y + 13 * Math.sin(rad(d))]);
    const X = f1(x), Y = f1(y);
    return `<g${o.decor ? ' class="lp-decor"' : ""}${opa(o.o)} data-lg="t:eau">${h.map(([hx, hy]) => `<line x1="${X}" y1="${Y}" x2="${f1(hx)}" y2="${f1(hy)}" class="lp-l-oh" stroke-width="2.6"/>`).join("")}`
      + h.map(([hx, hy]) => `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="4.2" class="lp-a-h"/>`).join("")
      + `<circle cx="${X}" cy="${Y}" r="8" class="lp-a-ow"/></g>`;
  }
  const hplus = (x, y, o = {}) => `<g${o.decor ? ' class="lp-decor"' : ""}${opa(o.o)} data-lg="t:hp"><circle cx="${f1(x)}" cy="${f1(y)}" r="6" class="lp-a-hp"/><text x="${f1(x)}" y="${f1(y + 3.6)}" text-anchor="middle" class="lp-signe">+</text></g>`;
  // électron (dissolution réductrice des oxydes de fer, 11/10/2026) et bactérie du sol (décor)
  const electron = (x, y, o = {}) => `<g${o.decor ? ' class="lp-decor"' : ""}${opa(o.o)} data-lg="t:elec"><circle cx="${f1(x)}" cy="${f1(y)}" r="5.5" class="lp-a-elec"/><text x="${f1(x)}" y="${f1(y + 3.4)}" text-anchor="middle" class="lp-signe">−</text></g>`;
  const bacterie = (x, y, l = 96, h = 30) => `<g class="lp-decor" data-lg="t:bact"><rect x="${f1(x - l / 2)}" y="${f1(y - h / 2)}" width="${l}" height="${h}" rx="${h / 2}" class="lp-bact"/>`
    + `<path d="M${f1(x - l / 2)} ${f1(y)} q-10 -6 -18 2 M${f1(x + l / 2)} ${f1(y - 4)} q12 -8 20 0" class="lp-bact-fl"/><ellipse cx="${f1(x - 8)}" cy="${f1(y)}" rx="${f1(l / 5)}" ry="${f1(h / 5)}" class="lp-bact-in"/></g>`;
  // polyphénol (catéchol : cycle de six carbones + deux OH voisins), réducteur des oxydes de manganèse (11/10/2026) ; q = quinone (les deux
  // OH ont cédé leurs H et leurs électrons : deux C=O)
  function phenol(x, y, a = 0, o = {}, q = false) {
    const R = 13, P = [0, 1, 2, 3, 4, 5].map((i) => [x + R * Math.cos(rad(a + 60 * i)), y + R * Math.sin(rad(a + 60 * i))]);
    let s = `<g${o.decor ? ' class="lp-decor"' : ""}${opa(o.o)} data-lg="t:phenol"><polygon points="${P.map(([u, v]) => f1(u) + "," + f1(v)).join(" ")}" class="lp-cycle"/>`
      + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R * 0.55)}" class="lp-cycle-in"/>`;
    for (const i of [0, 1]) {   // les deux oxygènes sur deux carbones voisins, tournés vers a et a + 60°
      const [cx, cy] = P[i], ox = x + 24 * Math.cos(rad(a + 60 * i)), oy = y + 24 * Math.sin(rad(a + 60 * i));
      s += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(ox)}" y2="${f1(oy)}" class="lp-l-cyc" stroke-width="${q ? 4.4 : 2.4}"/>`;
      if (!q) { const hx = ox + 9 * Math.cos(rad(a + 60 * i + 50)), hy = oy + 9 * Math.sin(rad(a + 60 * i + 50)); s += `<line x1="${f1(ox)}" y1="${f1(oy)}" x2="${f1(hx)}" y2="${f1(hy)}" class="lp-l-oh" stroke-width="2.4"/><circle cx="${f1(hx)}" cy="${f1(hy)}" r="3.8" class="lp-a-h"/>`; }
      s += `<circle cx="${f1(ox)}" cy="${f1(oy)}" r="6.5" class="lp-at" style="fill:${couleur("O")}"/>`;
    }
    return s + "</g>";
  }
  const hlie = (x, y, o = {}) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="4.2" class="lp-a-h"${opa(o.o)} data-lg="t:h"/>`;
  function ion(x, y, el, signe, o = {}) {   // ion en solution, signe dessiné dedans (Cl⁻, Na⁺…)
    const r = o.r ?? rayon(el);
    return `<g${o.decor ? ' class="lp-decor"' : ""}${opa(o.o)} data-lg="i:${el}${signe}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" class="lp-at" style="fill:${couleur(el)}"/>`
      + `<text x="${f1(x)}" y="${f1(y + r * 0.36)}" text-anchor="middle" class="lp-signe" style="font-size:${Math.round(r * 1.2)}px">${signe}</text></g>`;
  }
  // largeur d'un trait ∝ valence de liaison (Brown et Altermatt 1985) ; O–H de l'eau à part (H dessiné petit)
  const largeur = (k, v, w) => w ?? (k === "oh" ? 2.6 : Math.max(2, 5.3 * (v ?? 0.33)));
  // lien : k = "cov" (dans un groupe anionique, couleur de son atome central el), "ion" (cation–anion), "eau" (cation–eau), "oh"
  function lien(x1, y1, x2, y2, o = {}) {
    const k = o.k || "ion", w = largeur(k, o.v, o.w);
    const style = k === "cov" ? ` style="stroke:${couleur(o.el || "C")}"` : "";
    const lg = o.p && k !== "oh" ? ` data-lg="l:${o.p}:${k}:${w.toFixed(1)}:${o.el || ""}"` : "";
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" class="lp-l-${k}" stroke-width="${f1(w)}"${style}${opa(o.o)}${o.rompt ? ' stroke-dasharray="4 4"' : ""}${lg}/>`;
  }

  // ---------- 3. États, transitions, dessin générique des acteurs ----------
  // Un ÉTAT = { A: acteurs, B: liaisons, L: étiquettes, g: jauge, h: minuteur, titre, texte }.
  //   A[k] = { x, y, o?, t: "at" | "eau" | "h" | "hp" | "bulle" | "halo", el?, r?, a? (angle d'une molécule d'eau) } ;
  //   B[k] = { a, b (clé d'acteur ou [x, y]), k: "cov" | "ion" | "eau" | "oh", v (valence) ou w, el (couleur d'un "cov"), p ("C–O") } ;
  //   L[k] = { x, y, t (texte), m (centré) } ; h = { v (s ou null), cours (l'étape lente : le minuteur compte), txt, sous }.
  function suite(prev, ch) {   // une étape = la précédente + des changements (0 = la liaison ou l'étiquette disparaît)
    const n = { A: {}, B: {}, L: {}, g: ch.g || prev.g, h: ch.h || prev.h };
    for (const k in prev.A) n.A[k] = Object.assign({}, prev.A[k]);
    for (const k in prev.B) n.B[k] = Object.assign({}, prev.B[k]);
    for (const k in prev.L) n.L[k] = Object.assign({}, prev.L[k]);
    for (const k in ch.A || {}) n.A[k] = Object.assign({}, n.A[k], ch.A[k]);
    for (const k in ch.B || {}) n.B[k] = ch.B[k] === 0 ? Object.assign({}, n.B[k], { o: 0 }) : Object.assign({}, n.B[k] || {}, ch.B[k]);
    for (const k in ch.L || {}) n.L[k] = ch.L[k] === 0 ? Object.assign({}, n.L[k], { o: 0 }) : ch.L[k];
    n.titre = ch.titre; n.texte = ch.texte;
    return n;
  }
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const angleLerp = (a, b, t) => a + ((((b - a + 540) % 360) - 180) * t);
  // interpolation de deux états. Nature d'un acteur (t, el) changée en fin de transition (un H⁺ devient H en se liant) ;
  // liaison qui naît : seulement en fin de transition, quand les atomes sont proches ; liaison qui casse : tiretée, éteinte en
  // première moitié.
  function melange(f, g, t) {
    const A = {}, B = {}, L = {};
    for (const k of new Set([...Object.keys(f.A), ...Object.keys(g.A)])) {
      const a = f.A[k] || Object.assign({}, g.A[k], { o: 0 }), b = g.A[k] || Object.assign({}, a, { o: 0 });
      const oa = a.o ?? 1, ob = b.o ?? 1, fin = t >= 0.85;
      A[k] = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), a: angleLerp(a.a ?? 0, b.a ?? 0, t),
        r: a.r != null || b.r != null ? lerp(a.r ?? b.r, b.r ?? a.r, t) : null, o: lerp(oa, ob, t), t: fin ? b.t : a.t, el: fin ? b.el : a.el, cls: b.cls ?? a.cls, lg: b.lg ?? a.lg };
    }
    for (const k of new Set([...Object.keys(f.B), ...Object.keys(g.B)])) {
      const a = f.B[k], b = g.B[k], ref = b || a;
      const oa = a ? (a.o ?? 1) : 0, ob = b ? (b.o ?? 1) : 0;
      const o = oa === 0 && ob > 0 ? ob * borne((t - 0.6) / 0.4) : oa > 0 && ob === 0 ? oa * (1 - borne(t / 0.5)) : lerp(oa, ob, t);
      const wa = largeur((a || ref).k, (a || ref).v, (a || ref).w), wb = largeur(ref.k, ref.v, ref.w);
      B[k] = { a: ref.a, b: ref.b, k: t < 0.5 && a ? a.k : ref.k, el: ref.el, p: ref.p, o, w: lerp(wa, wb, t), rompt: oa > 0 && ob === 0 && t > 0 };
    }
    for (const k of new Set([...Object.keys(f.L), ...Object.keys(g.L)])) {
      const a = f.L[k], b = g.L[k], ref = b || a;
      const oa = a ? (a.o ?? 1) : 0, ob = b ? (b.o ?? 1) : 0;
      if (a && b && a.t !== b.t) {
        const de = t < 0.5;
        L[k] = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), t: de ? a.t : b.t, m: de ? a.m : b.m, o: de ? oa * (1 - 2 * t) : ob * (2 * t - 1) };
      } else {
        const p = a || b, q = b || a;
        L[k] = { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), t: ref.t, m: ref.m, o: lerp(oa, ob, t) };
      }
    }
    return { A, B, L, g: t < 0.5 ? f.g : g.g };
  }
  // dessin des acteurs en deux calques { l, a } comme le décor : liaisons (fixes puis animées) SOUS tous les atomes
  function dessiner(st, jauge) {
    const A = st.A, pt = (r) => (typeof r === "string" ? [A[r].x, A[r].y] : r);
    let l = "", s = "", halos = "";
    for (const k in A) { const b = A[k]; if (b.t === "bulle" && b.o > 0.01) l += `<circle cx="${f1(b.x)}" cy="${f1(b.y)}" r="${f1(b.r)}" class="lp-bulle" opacity="${b.o.toFixed(2)}"/>`; }
    for (const k in st.B) {
      const b = st.B[k];
      if (b.o < 0.01) continue;
      const [x1, y1] = pt(b.a), [x2, y2] = pt(b.b);
      l += lien(x1, y1, x2, y2, { k: b.k, w: b.w, el: b.el, p: b.p, o: b.o, rompt: b.rompt });
    }
    for (const k in A) {
      const c = A[k];
      if (!(c.o > 0.01)) continue;
      const o = { o: c.o };
      if (c.t === "eau") s += eau(c.x, c.y, c.a, o);
      else if (c.t === "hp") s += hplus(c.x, c.y, o);
      else if (c.t === "h") s += hlie(c.x, c.y, o);
      else if (c.t === "elec") s += electron(c.x, c.y, o);
      else if (c.t === "phenol") s += phenol(c.x, c.y, c.a, o, c.cls === "q");
      else if (c.t === "halo") halos += `<circle cx="${f1(c.x)}" cy="${f1(c.y)}" r="${f1(c.r)}" class="lp-halo" opacity="${c.o.toFixed(2)}"/>`;
      else if (c.t === "at") s += atome(c.x, c.y, c.el, Object.assign(o, c.r != null ? { r: c.r } : {}, c.cls ? { cls: c.cls } : {}, c.lg ? { lg: c.lg } : {}));
    }
    s += halos;
    for (const k in st.L) {
      const e = st.L[k];
      if (e.o < 0.01) continue;
      s += `<text x="${f1(e.x)}" y="${f1(e.y)}" class="lp-t-lab"${e.m ? ' text-anchor="middle"' : ""}${opa(e.o)}>${e.t}</text>`;
    }
    if (jauge && st.g) {   // jauge des voisins de l'atome suivi : g = [nombre de cases de chaque classe…], le reste vide
      s += `<text x="16" y="24" class="lp-t-jauge">${jauge.titre}</text>`;
      let i = 0;
      // classe CSS, ou "e:Fe" = pastille de la couleur d'un élément
      const pastille = (c, x) => (c.startsWith("e:") ? `<circle cx="${x}" cy="42" r="7" class="lp-at" style="fill:${couleur(c.slice(2))}"/>` : `<circle cx="${x}" cy="42" r="7" class="${c}"/>`);
      st.g.forEach((n, j) => { for (let m = 0; m < n; m++, i++) s += pastille(jauge.classes[j], 24 + i * 19); });
      for (; i < jauge.n; i++) s += `<circle cx="${24 + i * 19}" cy="42" r="7" class="lp-j-vide"/>`;
    }
    return { l, a: s };
  }

  // ---------- 4. Durées en toutes lettres, du milliardième de seconde au million d'années ----------
  const AN = 31557600, sp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const pl = (n, mot) => `${sp(n)} ${mot}${n >= 2 ? "s" : ""}`;
  function duree(s) {   // pendant le comptage : arrondi PAR DÉFAUT (jamais « 60 s » ni « 60 min »)
    if (!(s > 0)) return "0 s";
    const fl = Math.floor;
    if (s < 1e-6) return `${pl(Math.max(1, fl(s * 1e9)), "milliardième")} de s`;
    if (s < 1e-3) return `${pl(fl(s * 1e6), "millionième")} de s`;
    if (s < 1) return `${pl(fl(s * 1e3), "millième")} de s`;
    if (s < 60) return `${fl(s)} s`;
    if (s < 3600) return `${fl(s / 60)} min`;
    if (s < 86400) return `${fl(s / 3600)} h ${String(fl((s % 3600) / 60)).padStart(2, "0")}`;
    if (s < AN) return pl(fl(s / 86400), "jour");
    const an = s / AN;
    if (an < 1e6) return pl(fl(an), "an");
    const m = an / 1e6, x = m < 10 ? fl(m * 10) / 10 : fl(m);
    return `${String(x).replace(".", ",")} million${x >= 2 ? "s" : ""} d'années`;
  }

  // nombres et proportions en mots, pour les textes des scènes
  const UNITES_L = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
  const lettres = (n, fem) => (n === 1 ? (fem ? "une" : "un") : Number.isInteger(n) && n < UNITES_L.length ? UNITES_L[n] : sp(n));
  function fraction(f) {   // part ionique en mots (Pauling)
    if (f < 0.2) return "à moins d'un cinquième";
    if (f < 0.29) return "au quart environ";
    if (f < 0.4) return "au tiers environ";
    if (f < 0.58) return "à moitié environ";
    if (f < 0.71) return "aux deux tiers environ";
    if (f < 0.85) return "aux trois quarts environ";
    return "presque entièrement";
  }
  function rond2(x) { const p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; }   // 2 chiffres significatifs
  // durée en mots vagues, pour une comparaison dans le texte (« en quelques secondes »)
  function quelques(t) {
    if (t < 1) return "moins d'une seconde";
    if (t < 60) return "quelques secondes";
    if (t < 3600) return "quelques minutes";
    if (t < 86400) return "quelques heures";
    if (t < AN) return "quelques jours";
    if (t < 100 * AN) return "quelques années";
    if (t < 1e5 * AN) return "des milliers d'années";
    return "des millions d'années";
  }

  // ---------- 5. La carte de la scène ----------
  const LG_ORDRE = (k) => (k.startsWith("e:") ? 0 : k.startsWith("t:eau") ? 1 : k.startsWith("t:hp") ? 2 : k.startsWith("i:") ? 3 : k.startsWith("t:h") ? 4 : k.includes(":cov:") ? 5 : k.includes(":ion:") ? 6 : 7);
  function legendeHTML(cles, gab, d) {
    const noms = (gab.legende && gab.legende(d)) || {};
    const item = (k) => {
      const [type, a, b, c, el] = k.split(":");
      let svg = "", nom = noms[k] || noms[`${type}:${a}:${b}`] || noms[`${type}:${a}`];
      if (type === "e") { svg = `<svg viewBox="0 0 20 20">${atome(10, 10, a, { r: Math.min(8, rayon(a) * 0.75), lg: false })}</svg>`; nom = nom || nomEl(a); }
      else if (type === "t" && a === "eau") { svg = `<svg viewBox="0 0 34 20"><line x1="14" y1="11" x2="6" y2="5" class="lp-l-oh" stroke-width="2.4"/><line x1="14" y1="11" x2="6" y2="17" class="lp-l-oh" stroke-width="2.4"/><circle cx="6" cy="5" r="3.6" class="lp-a-h"/><circle cx="6" cy="17" r="3.6" class="lp-a-h"/><circle cx="16" cy="11" r="7" class="lp-a-ow"/></svg>`; nom = nom || "molécule d'eau"; }
      else if (type === "t" && a === "hp") { svg = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6" class="lp-a-hp"/><text x="10" y="13.5" text-anchor="middle" class="lp-signe">+</text></svg>`; nom = nom || "H⁺ de l'acide (porté par l'eau : H₃O⁺)"; }
      else if (type === "t" && a === "elec") { svg = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="5.5" class="lp-a-elec"/><text x="10" y="13.4" text-anchor="middle" class="lp-signe">−</text></svg>`; nom = nom || "électron"; }
      else if (type === "t" && a === "phenol") { svg = `<svg viewBox="0 0 34 24"><polygon points="10,4 18,4 22,12 18,20 10,20 6,12" class="lp-cycle"/><line x1="22" y1="12" x2="29" y2="12" class="lp-l-cyc" stroke-width="2"/><circle cx="29" cy="12" r="4" class="lp-at" style="fill:${couleur("O")}"/></svg>`; nom = nom || "polyphénol"; }
      else if (type === "t" && a === "bact") { svg = `<svg viewBox="0 0 34 20"><rect x="3" y="4" width="28" height="12" rx="6" class="lp-bact"/></svg>`; nom = nom || "bactérie"; }
      else if (type === "t" && a === "h") { svg = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="4.2" class="lp-a-h"/></svg>`; nom = nom || "hydrogène lié"; }
      else if (type === "t" && (a === "avant" || a === "arriere")) { svg = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="${a === "avant" ? 7.5 : 5.5}" class="lp-at ${a === "avant" ? "lp-avant" : "lp-arriere"}" style="fill:${couleur(b || "Cl")}"/></svg>`; nom = nom || (a === "avant" ? "ion devant le plan du dessin" : "ion derrière le plan du dessin"); }
      else if (type === "i") { const e = a.replace(/[⁺⁻+−-]+$/, ""), sg = a.slice(e.length); svg = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" class="lp-at" style="fill:${couleur(e)}"/><text x="12" y="16" text-anchor="middle" class="lp-signe" style="font-size:13px">${sg}</text></svg>`; nom = nom || `ion ${a}`; }
      else if (type === "l") {
        const st = b === "cov" ? ` style="stroke:${couleur(el || "C")}"` : "";
        svg = `<svg viewBox="0 0 34 20"><line x1="2" y1="10" x2="32" y2="10" class="lp-l-${b}" stroke-width="${c}"${st}/></svg>`;
        nom = nom || (b === "eau" ? `liaison ${a.split(/[–-]/)[0]}–O avec l'eau` : `liaison ${a}, ${nature(a)}`);
      }
      return `<span>${svg}${nom}</span>`;
    };
    // une seule entrée par liaison (la première épaisseur rencontrée), dans l'ordre : atomes, eau, ions, liaisons
    const vus = new Set(), garde = [];
    for (const k of cles) { const cle = k.startsWith("l:") ? k.split(":").slice(0, 3).join(":") : k; if (!vus.has(cle)) { vus.add(cle); garde.push(k); } }
    garde.sort((x, y) => LG_ORDRE(x) - LG_ORDRE(y));
    return garde.map(item).join("");
  }
  const clesLegende = (svg) => [...svg.matchAll(/data-lg="([^"]+)"/g)].map((m) => m[1]);

  function carteScene(id, d, gab) {
    const ong = gab.onglets(d);
    return `<div class="card lp lp-carte-scene" data-lp-scene="${id}">
      <div class="lp-tete">
        <h2>Au plus près du cristal</h2>
        <div class="lp-choix" role="group" aria-label="Ce qui attaque le cristal">
          ${ong.map((o, i) => `<button type="button" data-k="${o.k}" aria-pressed="${i === 0}">${o.nom}</button>`).join("")}
        </div>
      </div>
      <div class="lp-scene">
        <div class="lp-horloge" aria-live="off"><span class="lp-h-lab">Temps réel</span><b data-lp-hv>0 s</b><span class="lp-h-sous" data-lp-hs></span><span class="lp-h-cond" data-lp-hc></span></div>
        <svg viewBox="0 0 640 340" role="img" aria-label="${gab.aria ? gab.aria(d) : "Coupe du bord du cristal, étape par étape"}"><g data-lp-fl></g><g data-lp-ml></g><g data-lp-fa></g><g data-lp-ma></g></svg>
      </div>
      <div class="lp-pas">
        <button type="button" class="lp-btn" data-lp-prec aria-label="Étape précédente">◀</button>
        <div class="lp-points" data-lp-points></div>
        <button type="button" class="lp-btn" data-lp-suiv aria-label="Étape suivante">▶</button>
        <span class="lp-esp"></span>
        <button type="button" class="lp-btn" data-lp-jouer>Pause</button>
      </div>
      <div class="lp-etape" aria-live="polite"><p class="lp-et-titre" data-lp-titre></p><p class="lp-et-texte" data-lp-texte></p></div>
      <div class="lp-legende" data-lp-legende></div>
    </div>`;
  }

  // ---------- 6. Énergie de liaison et cinétique ----------
  // axe des temps COMMUN à tous les minéraux : du dixième de milliardième de seconde à 10 millions d'années (log)
  const T0 = -10, T1 = Math.log10(1e7 * AN);
  const posT = (t) => ((Math.log10(t) - T0) / (T1 - T0)) * 100;
  const pc = (x) => x.toFixed(1) + "%";
  // repères en mots (« millionième » = un millionième de seconde) ; ceux sans 1 disparaissent sur téléphone ; le dernier est calé à droite
  const REPERES = [[1e-9, "milliardième"], [1e-6, "millionième", 1], [1e-3, "millième"], [1, "seconde", 1], [3600, "heure"],
    [AN, "an", 1], [1e6 * AN, "1 million d'années", 1, 1]];   // pas de « 1 000 ans » : le dernier repère, calé à droite, le recouvrait
  function tempsHTML(rangees) {
    const r = rangees.map((rg) => {
      const pts = rg.pts.map((p) => {
        const l = posT(p.min), w = Math.max(0.6, posT(p.max) - l), x = posT(p.v);
        const place = x < 18 ? `left:${pc(l)}` : x > 82 ? `left:${pc(posT(p.max))};transform:translateX(calc(-100% + 7px))` : `left:${pc(x)};transform:translateX(-50%)`;
        const fond = `background:${couleur(p.el)}`;
        return `<span class="lp-plage" style="left:${pc(l)};width:${pc(w)};${fond}"></span><span class="lp-pt" style="left:${pc(x)};${fond}"></span>`
          + `<span class="lp-et lp-${p.ou || "haut"}" style="${place}">${p.et}</span>`;
      }).join("");
      const vs = rg.pts.map((p) => posT(p.v)).sort((u, v) => u - v);
      const ecart = rg.pts.length === 2 ? `<div class="lp-ecart" style="left:${pc(vs[0])};width:${pc(vs[1] - vs[0])}"></div>` : "";
      return `<p class="lp-t-titre">${rg.titre}${rg.fois ? ` <span class="lp-fois">· ${rg.fois.replace(/^environ 1 fois plus (?:lent|rapide) pour (.+)$/, "à peu près au même rythme pour $1")}</span>` : ""}</p><div class="lp-t-piste"><div class="lp-ligne"></div>${ecart}${pts}</div>`;
    }).join("");
    const ticks = REPERES.map(([t, n, garde, droite]) => `<span class="${garde ? "" : "lp-t-sec"}${droite ? " lp-t-droite" : ""}" style="left:${pc(posT(t))}">${n}</span>`).join("");
    return `<div class="lp-temps">${r}<div class="lp-t-axe" aria-hidden="true">${ticks}</div></div>`;
  }
  function schemaLiaison(s) {   // petit schéma : électrons partagés (covalente) ou cédés (ionique)
    const A = `<circle cx="62" cy="32" r="${s.ra || 22}" class="lp-at" style="fill:${couleur(s.a)}"/><text x="62" y="37" text-anchor="middle" class="lp-signe" style="font-size:${s.fa || 14}px">${s.la || s.a}</text>`;
    const B = `<circle cx="158" cy="32" r="26" class="lp-at" style="fill:${couleur(s.b)}"/><text x="158" y="37" text-anchor="middle" class="lp-signe" style="font-size:14px">${s.lb || s.b}</text>`;
    if (s.type === "partage") return `<svg viewBox="0 0 220 64" role="img" aria-label="${s.aria}">${A}${B}<ellipse cx="110" cy="32" rx="22" ry="12" fill="none" style="stroke:var(--lp-ow)" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="102" cy="32" r="5" class="lp-a-ow"/><circle cx="118" cy="32" r="5" class="lp-a-ow"/></svg>`;
    return `<svg viewBox="0 0 220 64" role="img" aria-label="${s.aria}"><defs><marker id="lp-fl-e" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--lp-ow)"/></marker></defs>${A}${B}<path d="M80 22 Q112 2 140 14" fill="none" style="stroke:var(--lp-ow)" stroke-width="1.5" marker-end="url(#lp-fl-e)"/><circle cx="176" cy="13" r="5" class="lp-a-ow"/></svg>`;
  }
  function barresPos(B, r, k) {
    const x = (v) => borne(v / B.max) * 100, [a, b] = r.val[k], l = x(Math.min(a, b));
    return { l, w: Math.max(0.6, x(Math.max(a, b)) - l) };
  }
  function carteEnergie(id, d, gab) {
    const E = gab.energie ? gab.energie(d, OUTILS) : null;
    if (!E) return "";
    const duo = (E.duo || []).map((x) => `<article class="lp-liaison">${schemaLiaison(x.schema)}<h3>${x.titre} <small>· ${x.sous}</small></h3><ul>${x.li.map((li) => `<li>${li}</li>`).join("")}</ul></article>`).join("");
    let barres = "";
    if (E.barres) {
      const B = E.barres, k0 = B.onglets[0].k;
      const rangs = B.rangs.map((r, i) => {
        const p = barresPos(B, r, k0);
        const st = r.hachure ? `background:repeating-linear-gradient(135deg, ${couleur(r.el)} 0 5px, transparent 5px 9px);border:1.5px solid ${couleur(r.el)}` : `background:${couleur(r.el)}`;
        return `<div class="lp-rang"><span>${r.nom}</span><div class="lp-piste"><i data-lp-b="${i}" style="left:${pc(p.l)};width:${pc(p.w)};${st}"></i></div><span class="lp-num" data-lp-v="${i}">${r.txt[k0]}</span></div>`;
      }).join("");
      const gr = B.graduations, axe = gr.map((v, i) => `<span style="left:${pc(borne(v / B.max) * 100)}${i === 0 ? ";transform:none" : i === gr.length - 1 ? ";transform:translateX(-100%)" : ""}">${sp(v)}</span>`).join("");
      barres = `<div class="lp-graph" data-lp-energie>
        <div class="lp-graph-tete"><h3>${B.titre}</h3>
          ${B.onglets.length > 1 ? `<div class="lp-choix" role="group" aria-label="Où se trouve le cristal">${B.onglets.map((o, i) => `<button type="button" data-k="${o.k}" aria-pressed="${i === 0}">${o.nom}</button>`).join("")}</div>` : ""}
        </div>
        <div class="lp-rangs">${rangs}<div class="lp-rang lp-rang-axe" aria-hidden="true"><span></span><div class="lp-axe">${axe}</div><span class="lp-axe-unite">${B.unite}</span></div></div>
        <p class="lp-explic" data-lp-eexplic>${B.explic[k0]}</p>
      </div>`;
    }
    const temps = [].concat(E.temps || []).map((T) => `<div class="lp-graph"><h3>${T.titre}</h3><p class="lp-explic">${T.explic}</p>${tempsHTML(T.rangees)}</div>`).join("");   // un graphique ou plusieurs
    const src = (d.sources || []).concat(E.sources || []);
    return `<div class="card lp lp-carte-energie" data-lp-carte-energie="${id}">
      <h2>Énergie de liaison et cinétique</h2>
      ${duo ? `<div class="lp-duo">${duo}</div>` : ""}${barres}${temps}
      ${src.length ? `<details class="lp-sources"><summary>Sources et calculs</summary><ol>${src.map((s) => `<li>${s}</li>`).join("")}</ol></details>` : ""}
    </div>`;
  }

  // ---------- 7. Lecteur ----------
  // Un seul temps par étape, `te` (ms depuis l'arrivée sur l'étape), qui n'avance que si la scène est à l'écran (IntersectionObserver,
  // 30 % visible) et l'onglet affiché : transition de la scène (1,1 s), comptage du minuteur pendant l'étape lente (0,8 × 12 s), anneau
  // et passage à l'étape suivante en lecture (12 s). Le minuteur ne compte qu'en avant : une étape lente repart de la valeur de fin de
  // l'étape précédente ; toute autre étape (retour, changement d'onglet) affiche aussitôt sa valeur. Sans vitesse mesurée (h.v null),
  // le minuteur est grisé.
  let lecteur = null;   // une seule scène à la fois (page minéral) : l'ancienne est arrêtée au rendu suivant
  function choix(racine, f) {
    racine.querySelectorAll(".lp-choix button").forEach((b) => b.addEventListener("click", () => {
      racine.querySelectorAll(".lp-choix button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      f(b.dataset.k);
    }));
  }
  function preparer(id) {   // données + gabarit d'un minéral, ou null
    const d = DONNEES().mineraux[id], sc = d && (d.scene || d.famille);
    if (!d || !SCENES[sc]) return null;
    return { d: Object.assign({ id }, d), gab: SCENES[sc] };
  }
  function scenarios(d, gab) {
    const S = {};
    for (const o of gab.onglets(d)) S[o.k] = gab.etapes(o.k, d, OUTILS);
    return S;
  }

  function monterScene(carte) {
    const { d, gab } = preparer(carte.dataset.lpScene);
    const q = (s) => carte.querySelector(s);
    const svg = q("svg"), bJouer = q("[data-lp-jouer]"), horlogeEl = q(".lp-horloge");
    const calque = { fl: q("[data-lp-fl]"), ml: q("[data-lp-ml]"), fa: q("[data-lp-fa]"), ma: q("[data-lp-ma]") };
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ONG = gab.onglets(d), SCEN = scenarios(d, gab), jauge = gab.jauge ? gab.jauge(d) : null;
    const LEG = {}, DEC = {};
    for (const o of ONG) {   // légende de chaque onglet : seulement ce qui est dessiné (décor + toutes les étapes)
      DEC[o.k] = gab.decor(o.k, d, OUTILS);
      let tout = DEC[o.k].l + DEC[o.k].a;
      for (const e of SCEN[o.k]) { const m = dessiner(melange(e, e, 1), jauge); tout += m.l + m.a; }
      LEG[o.k] = legendeHTML(clesLegende(tout), gab, d);
    }
    let scen = "", idx = 0, depuis = SCEN[ONG[0].k][0], cible = depuis, h0 = 0, te = 0, sceneFinie = false;
    let lecture = !reduit, anneauPlein = false, visible = false, raf = 0, dernier = 0, decorDe = "";
    const n = () => SCEN[scen].length;

    function horloge() {
      const h = cible.h || { v: 0 };
      horlogeEl.classList.toggle("lp-h-grise", h.v === null);
      if (h.v === null) { q("[data-lp-hv]").textContent = "pas de vitesse mesurée"; q("[data-lp-hs]").textContent = ""; return; }
      const u = h.cours && !reduit ? borne(te / D_COMPTE) : 1, fini = u >= 1;
      const depart = h0 > 0 ? h0 : Math.min(1, h.v / 1000);   // compte en échelle logarithmique depuis la fin de l'étape précédente
      const v = fini ? h.v : u <= 0 ? h0 : Math.exp(lerp(Math.log(depart), Math.log(h.v), 1 - Math.pow(1 - u, 2.2)));
      q("[data-lp-hv]").textContent = fini && h.txt ? h.txt : duree(v);
      q("[data-lp-hs]").textContent = fini && h.sous ? h.sous : "";
    }
    const anneau = (p) => { const b = carte.querySelector('[data-lp-points] button[aria-current="step"]'); if (b) b.style.setProperty("--p", p.toFixed(3)); };
    const actuel = () => (sceneFinie ? cible : melange(depuis, cible, ease(borne(te / DUREE_TRANSITION))));
    function rendre() {
      if (!sceneFinie) {
        const tS = reduit ? 1 : borne(te / DUREE_TRANSITION);
        const m = dessiner(melange(depuis, cible, ease(tS)), jauge);
        calque.ml.innerHTML = m.l; calque.ma.innerHTML = m.a;
        sceneFinie = tS >= 1;
      }
      horloge();
      anneau(lecture ? borne(te / DUREE_ETAPE) : anneauPlein ? 1 : 0);
    }
    function afficher() {
      q("[data-lp-titre]").textContent = `${idx + 1}/${n()} · ${cible.titre}`;
      q("[data-lp-texte]").textContent = cible.texte;
      q("[data-lp-hc]").textContent = (d.onglets && d.onglets[scen] && d.onglets[scen].cond) || "";
      carte.querySelectorAll("[data-lp-points] button").forEach((b, i) => {
        if (i === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
        b.style.setProperty("--p", "0");
      });
      q("[data-lp-prec]").disabled = idx === 0;
      q("[data-lp-suiv]").disabled = idx === n() - 1;
    }
    function points() {
      const p = q("[data-lp-points]");
      p.innerHTML = SCEN[scen].map((_, i) => `<button type="button" aria-label="Étape ${i + 1}">${i + 1}</button>`).join("");
      p.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => { arretLecture(); aller(i); }));
    }
    function aller(i, s = scen) {
      const autre = s !== scen;
      depuis = autre ? SCEN[s][i] : actuel();   // changement d'onglet : pas de transition depuis l'autre scénario
      scen = s; idx = i; cible = SCEN[s][i]; te = 0; sceneFinie = false; anneauPlein = false;
      h0 = i > 0 && SCEN[s][i - 1].h ? SCEN[s][i - 1].h.v || 0 : 0;
      if (decorDe !== s) {
        calque.fl.innerHTML = DEC[s].l; calque.fa.innerHTML = DEC[s].a; decorDe = s;
        q("[data-lp-legende]").innerHTML = LEG[s];
      }
      if (autre) points();
      afficher(); rendre(); planifier();
    }

    // boucle : tourne seulement à l'écran, et seulement s'il reste quelque chose à animer ou une lecture en cours
    const enCours = () => lecture || (!reduit && (!sceneFinie || (cible.h && cible.h.cours && te < D_COMPTE)));
    const tourner = () => visible && !document.hidden && enCours();
    function image(now) {
      if (!svg.isConnected) { arreter(); return; }
      te += Math.max(0, Math.min(100, now - dernier));   // l'horodatage d'une image peut précéder `dernier` : jamais de pas négatif
      dernier = now;
      if (lecture && te >= DUREE_ETAPE) {
        if (idx < n() - 1) aller(idx + 1);
        else { lecture = false; anneauPlein = true; majBouton(); }
      }
      rendre();
      raf = tourner() ? requestAnimationFrame(image) : 0;   // la boucle se poursuit sans reprendre `dernier`
    }
    function planifier() {   // hors de la boucle : la lancer (et prendre l'heure de départ) ou l'arrêter
      if (tourner()) { if (!raf) { dernier = performance.now(); raf = requestAnimationFrame(image); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    const majBouton = () => { bJouer.textContent = lecture ? "Pause" : "Lecture"; };
    function arretLecture() { lecture = false; majBouton(); }
    q("[data-lp-prec]").addEventListener("click", () => { arretLecture(); if (idx > 0) aller(idx - 1); });
    q("[data-lp-suiv]").addEventListener("click", () => { arretLecture(); if (idx < n() - 1) aller(idx + 1); });
    bJouer.addEventListener("click", () => {
      if (lecture) arretLecture();
      else { lecture = true; majBouton(); if (idx === n() - 1) { aller(0); return; } anneauPlein = false; }
      rendre(); planifier();
    });
    choix(carte, (k) => { lecture = !reduit; majBouton(); aller(0, k); });

    const surVisibilite = () => planifier();
    const obs = "IntersectionObserver" in window
      ? new IntersectionObserver((es) => { visible = es[es.length - 1].intersectionRatio >= 0.299; planifier(); }, { threshold: [0, 0.3] }) : null;
    function arreter() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; lecture = false;
      if (obs) obs.disconnect();
      document.removeEventListener("visibilitychange", surVisibilite);
    }
    document.addEventListener("visibilitychange", surVisibilite);
    if (obs) obs.observe(q(".lp-scene")); else visible = true;
    majBouton(); aller(0, ONG[0].k);
    return {
      arreter,
      etat: () => ({ scen, idx, te, lecture, visible, horloge: q("[data-lp-hv]").textContent, sous: q("[data-lp-hs]").textContent }),
      aller: (i, s) => { arretLecture(); aller(i, s || scen); },
      voir: (v) => { visible = v; planifier(); },   // tests : simule l'entrée ou la sortie de l'écran
    };
  }

  // ---------- 8. API ----------
  function cartes(id) {
    const P = preparer(id);
    return P ? carteScene(id, P.d, P.gab) + carteEnergie(id, P.d, P.gab) : "";
  }
  function brancher(racine) {
    if (lecteur) { lecteur.arreter(); lecteur = null; }
    const carte = racine.querySelector("[data-lp-scene]");
    if (carte && preparer(carte.dataset.lpScene)) { lecteur = monterScene(carte); carte._lp = lecteur; }
    const ce = racine.querySelector("[data-lp-carte-energie]"), g = ce && ce.querySelector("[data-lp-energie]");
    if (g) {
      const P = preparer(ce.dataset.lpCarteEnergie), B = P.gab.energie(P.d, OUTILS).barres;
      choix(g, (k) => {
        B.rangs.forEach((r, i) => {
          const p = barresPos(B, r, k), el = g.querySelector(`[data-lp-b="${i}"]`);
          el.style.left = pc(p.l); el.style.width = pc(p.w);
          g.querySelector(`[data-lp-v="${i}"]`).textContent = r.txt[k];
        });
        g.querySelector("[data-lp-eexplic]").textContent = B.explic[k];
      });
    }
  }
  // gabarit d'une famille (contrat : tools/liaisons/API.md) : { onglets(d), decor(k, d, O), etapes(k, d, O), jauge?(d),
  // legende?(d), aria?(d), energie?(d, O) }
  function scene(nom, gabarit) { SCENES[nom] = gabarit; }
  // relief (10/10/2026) : la couche juste derrière le plan du dessin = le cristal redessiné, décalé en biais (DA), réduit (K) et pâle ;
  // devant, seuls les voisins des atomes suivis (contour tireté, décalés de DV). derriere(p) = où tombe le point p de la copie.
  const RELIEF = { DA: [18, -15], DV: [-22, 17], K: 0.94, C: [320, 250] };
  const relief = {
    DA: RELIEF.DA, DV: RELIEF.DV, K: RELIEF.K,
    derriere: (p) => [RELIEF.C[0] + RELIEF.K * (p[0] + RELIEF.DA[0] - RELIEF.C[0]), RELIEF.C[1] + RELIEF.K * (p[1] + RELIEF.DA[1] - RELIEF.C[1])],
    devant: (p) => [p[0] + RELIEF.DV[0], p[1] + RELIEF.DV[1]],
    couche: (svg) => { const K = RELIEF.K, tx = (1 - K) * RELIEF.C[0] + K * RELIEF.DA[0], ty = (1 - K) * RELIEF.C[1] + K * RELIEF.DA[1];
      return `<g class="lp-couche-arriere" transform="matrix(${K} 0 0 ${K} ${f1(tx)} ${f1(ty)})">${svg.replace(/ data-lg="[^"]*"/g, "")}</g><g data-lg="t:arriere"></g>`; },
    dessus: (pts) => `<path d="M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L")} L${pts.slice().reverse().map((q) => relief.derriere(q)).map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L")} Z" class="lp-f-dessus"/>`,
    proche: (pts, p) => { let k = 0, b = 1e9; pts.forEach((q, i) => { const dd = Math.hypot(q[0] - p[0], q[1] - p[1]); if (dd < b) { b = dd; k = i; } }); return k; },
    avant: { cls: "lp-avant", lg: "t:avant" },
    // l'atome el de la couche de derrière le plus proche de p, lu dans le SVG du cristal (cercles des atomes : style fill:var(--lp-e-el…))
    arriere: (svg, el, p) => {
      const pts = [...svg.matchAll(new RegExp(`<circle cx="([-\\d.]+)" cy="([-\\d.]+)"[^>]*fill:var\\(--lp-e-${el},`, "g"))].map((m) => relief.derriere([+m[1], +m[2]]));
      return pts[relief.proche(pts, p)];
    },
  };
  const OUTILS = { relief, rad, lerp, f1, borne, suite, atome, eau, hplus, hlie, ion, lien, electron, bacterie, phenol, rayon, nomEl, art, ionicite, nature, couleur, duree,
    lettres, fraction, rond2, quelques, sp, AN };

  window.Liaisons = {
    cartes, brancher, scene, outils: OUTILS,
    existe: (id) => !!preparer(id),
    _test: { preparer, scenarios, dessiner, melange, duree, legendeHTML, clesLegende, SCENES, DUREE_ETAPE, DUREE_TRANSITION, posT },
  };
})();
