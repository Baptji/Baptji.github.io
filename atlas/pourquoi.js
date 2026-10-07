// ============ « Même phénomène, autres roches » : graphique comparatif en bas de fiche roche (C.7, 25/09/2026) ============
// Demande du 25/09/2026 : sur le modèle du diagramme graphite / diamant de la kimberlite, un petit graphique animé en bas de
// chaque fiche, qui montre les autres roches nées du même phénomène et POURQUOI on obtient l'une plutôt que l'autre.
// Ses choix (même jour) : familles par PHÉNOMÈNE, quitte à traverser l'arbre BRGM (« quand on voit plusieurs roches venir
// d'une chambre magmatique mais donner des choses différentes, ça pose question ») ; titre du type « Une chambre magmatique :
// plusieurs roches possibles » ; la roche de la fiche en rouge, les autres en gris ; le SURVOL d'une roche montre son nom ;
// le CLIC la passe en bleu et affiche sous le graphique une ligne qui l'explique, avec le lien vers sa fiche sur le côté.
// Chargé avant app.js. API : Pourquoi.carte(roche) → HTML de la carte ("" si la roche n'a pas encore de phénomène) ;
// Pourquoi.monter(el, roche) → lance le graphique ; Pourquoi.sources(roche) → ligne « page-source » du bas de page.
// Premier phénomène (prototype) : « chambre », la cristallisation fractionnée d'un basalte, sur les mesures publiées de
// Nandedkar, Ulmer et Müntener (2014). Les roches qui y figurent sans que ce soit LEUR phénomène (`ailleurs`) sont
// dessinées et cliquables, mais leur fiche portera le graphique de leur propre phénomène.
(function () {
  "use strict";

  // ─────────────────────────────── utilitaires (mêmes conventions que formation-anim.js) ───────────────────────────────
  const W = 480, PAS_IMAGE = 33;
  const ROUGE = "#c0392b", BLEU = "#2b6ea3";
  const r1 = (x) => Math.round(x * 10) / 10;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const attrs = (o) => Object.entries(o || {}).map(([k, v]) => v == null ? "" : ` ${k}="${v}"`).join("");
  const P = (l) => l.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
  const rect = (x, y, w, h, f, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" fill="${f}"${attrs(o)}/>`;
  const poly = (l, f, o) => `<polygon points="${P(l)}"${f ? ` fill="${f}"` : ""}${attrs(o)}/>`;
  const pline = (l, c, sw, o) => `<polyline points="${P(l)}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${attrs(o)}/>`;
  const line = (x1, y1, x2, y2, c, sw, o) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"${c ? ` stroke="${c}"` : ""} stroke-width="${sw}" stroke-linecap="round"${attrs(o)}/>`;
  const txt = (x, y, s, o = {}) => `<text x="${r1(x)}" y="${r1(y)}" class="fa-lab${o.petit ? " fa-petit" : ""}${o.cls ? " " + o.cls : ""}"${o.a ? ` text-anchor="${o.a}"` : ""}${attrs(o.attrs)}>${s}</text>`;
  const nombre = (v) => Math.round(v).toLocaleString("fr-FR").replace(/ | /g, " ");
  // dans le texte HTML : pas de retour à la ligne dans « 1 170 °C » ni avant « % »
  const insecable = (s) => s.replace(/(\d) (?=\d{3}\b)/g, "$1 ").replace(/ (°C|%|km|GPa)/g, " $1");
  function melange(a, b, t) {
    const v = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = v(a), B = v(b);
    return "#" + A.map((x, i) => Math.round(x + (B[i] - x) * clamp(t)).toString(16).padStart(2, "0")).join("");
  }
  // ligne parallèle à une polyligne, décalée de d (côté gauche du sens de parcours)
  function decale(pts, d) {
    return pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      return [p[0] + Math.sin(ang) * d, p[1] - Math.cos(ang) * d];
    });
  }
  // portion d'une polyligne jusqu'à la fraction u de sa longueur
  function partiel(pts, u) {
    if (u >= 1) return pts;
    let L = 0; const c = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); c.push(L); }
    const d = clamp(u) * L, out = [pts[0]];
    let i = 1;
    for (; i < pts.length && c[i] <= d; i++) out.push(pts[i]);
    if (i < pts.length) { const f = (d - c[i - 1]) / ((c[i] - c[i - 1]) || 1); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); }
    return out;
  }
  const ROCHES_ATLAS = () => (typeof ROCHES !== "undefined" ? ROCHES : []);
  const nomFiche = (id) => { const r = ROCHES_ATLAS().find((x) => x.id === id); return r ? r.nom : id; };
  const ICONES = {
    pause: `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1"/><rect x="9.5" y="2.5" width="3" height="11" rx="1"/></svg>`,
    lecture: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L4.9 2.1a.6.6 0 0 0-.9.5z"/></svg>`,
  };

  // couleurs des minéraux = celles des schémas « Texture de la roche » (textures.js, HABITUS)
  const MIN = {
    ol: { c: "#c3cc6a", nom: "olivine" },
    px: { c: "#6f7f4a", nom: "pyroxène" },
    amp: { c: "#3e5540", nom: "amphibole" },
    ox: { c: "#1d1d1f", nom: "oxydes (magnétite, spinelle)" },
    pl: { c: "#f5f2ea", nom: "plagioclase" },
    qz: { c: "#c7cbc9", nom: "quartz" },
    bt: { c: "#2f2a27", nom: "biotite" },
  };
  const ORDRE_MIN = ["ol", "px", "amp", "ox", "pl", "qz", "bt"];

  // ─────────────────────────────── les phénomènes ───────────────────────────────
  const PHENOMENES = {
    chambre: {
      scene: "chambre",
      titre: "Une chambre magmatique : plusieurs roches possibles",
      intro: "Un basalte venu du manteau refroidit dans une chambre, sous un volcan. Ses minéraux cristallisent l'un après l'autre et emportent surtout le magnésium, le fer et le calcium : le liquide qui reste s'enrichit en silice. La roche obtenue dépend du moment et de ce qui est prélevé : les cristaux tombés au fond, le liquide sorti en éruption, ou le liquide resté sur place.",
      mesure: "Chemin mesuré en laboratoire : un basalte à 3 % d'eau, refroidi par paliers de 1 170 à 700 °C sous 0,7 GPa (environ 25 km de profondeur) ; à chaque palier, les cristaux formés sont retirés, comme s'ils tombaient au fond de la chambre (Nandedkar et al. 2014).",
      // Nandedkar, Ulmer et Müntener (2014), chaîne principale des expériences : T (°C) ; F = part restée liquide, en % de la
      // masse de départ (tableau 2, « Liq (abs) ») ; si = silice du verre, recalculée sans l'eau à partir du tableau 4 ;
      // sol = minéraux formés depuis le palier précédent, en % de la masse de départ (proportions du tableau 2 × liquide du
      // palier précédent ; l'orthopyroxène, toujours < 1 %, est compté avec le pyroxène, le spinelle avec les oxydes,
      // l'apatite, < 0,1 %, n'est pas dessinée).
      paliers: [
        { T: 1170, F: 100, si: 50.3, sol: {} },
        { T: 1150, F: 98.1, si: 50.5, sol: { ol: 1.9 } },
        { T: 1100, F: 92.3, si: 50.5, sol: { ol: 3.7, px: 2.1 } },
        { T: 1070, F: 79.5, si: 50.8, sol: { ol: 0.8, px: 12.0 } },
        { T: 1040, F: 60.2, si: 53.8, sol: { px: 15.7, pl: 1.7, ox: 0.6 } },
        { T: 1010, F: 44.8, si: 57.1, sol: { px: 0.5, pl: 4.1, amp: 10.0, ox: 0.8 } },
        { T: 980, F: 41.1, si: 60.2, sol: { pl: 2.3, ox: 0.3 } },
        { T: 950, F: 35.3, si: 63.2, sol: { px: 0.2, pl: 4.1, amp: 1.5 } },
        { T: 920, F: 32.1, si: 65.2, sol: { pl: 1.0, amp: 1.9, ox: 0.1 } },
        { T: 890, F: 27.8, si: 69.1, sol: { pl: 3.5, amp: 0.4, ox: 0.1 } },
        { T: 860, F: 26.7, si: 69.8, sol: { pl: 0.6, amp: 0.5 } },
        { T: 830, F: 24.8, si: 72.5, sol: { pl: 1.5, amp: 0.2, ox: 0.2 } },
        { T: 780, F: 22.0, si: 74.8, sol: { pl: 2.2, amp: 0.6, ox: 0.1 } },
        { T: 730, F: 19.3, si: 77.4, sol: { pl: 2.3, amp: 0.4 } },
        { T: 700, F: 14.2, si: 78.2, sol: { pl: 2.3, qz: 2.0, bt: 0.7 } },
      ],
      // ce qui s'accumule au fond, d'après les minéraux de chaque palier (noms des cumulats : Nandedkar et al. 2014)
      cumulats: [
        { de: 1170, a: 1100, nom: "péridotite" },
        { de: 1100, a: 1040, nom: "pyroxénite" },
        { de: 1040, a: 950, nom: "gabbro" },
        { de: 950, a: 700, nom: "diorite" },
      ],
      // at = température du palier où la roche « sort » ; sortie : lave (éruption), place (reste en profondeur), fond
      // (cristaux accumulés) ; variante = autre profondeur ou autre magma (dessin en pointillé, expliqué dans le texte) ;
      // ailleurs = la fiche de cette roche portera le graphique d'un autre phénomène
      roches: [
        { id: "peridotite", at: 1150, sortie: "fond", court: "péridotite", ailleurs: true, nomY: 154,
          texte: "Les premiers cristaux, d'olivine, se forment dès 1 150 °C et tombent au fond : ils donnent une péridotite faite presque d'olivine seule, la dunite. La péridotite décrite dans sa fiche vient, elle, du manteau." },
        { id: "pyroxenite", at: 1070, sortie: "fond", court: "pyroxénite", nomY: 154,
          texte: "Entre 1 100 et 1 040 °C, c'est surtout du pyroxène qui cristallise ; accumulé au fond de la chambre, il donne une pyroxénite. Avec l'olivine d'avant, ces premiers cristaux représentent 35 à 40 % du magma de départ." },
        { id: "hornblendite", at: 1030, sortie: "fond", variante: true, court: "hornblendite", nomY: 140,
          texte: "Variante : plus profond (vers 35 km) ou plus riche en eau, l'amphibole cristallise avant le plagioclase, entre 1 050 et 950 °C. Accumulée presque seule au fond, elle donne une hornblendite (Ulmer et al. 2018)." },
        { id: "gabbro", at: 1010, sortie: "fond", court: "gabbro", nomY: 126,
          texte: "Vers 1 040 °C, le plagioclase rejoint le pyroxène, puis l'amphibole prend le relais vers 1 010 °C : les cristaux accumulés forment alors un gabbro, ici à amphibole. Sous une dorsale, à faible profondeur et avec peu d'eau, le plagioclase cristallise dès le début, avec l'olivine : les gabbros s'y forment plus tôt, sans amphibole (Villiger et al. 2004)." },
        { id: "basalte", at: 1100, sortie: "lave", court: "basalte", ailleurs: true,
          texte: "Tant que moins d'un quart du magma a cristallisé (au-dessus de 1 055 °C), le liquide garde environ 50 % de silice : sorti en éruption à ce moment, il donne un basalte." },
        { id: "andesite", at: 980, sortie: "lave", court: "andésite",
          texte: "Vers 980 °C, près de 60 % du magma a cristallisé et le liquide qui reste contient 60 % de silice : sorti en éruption, il donne une andésite." },
        { id: "diorite", at: 980, sortie: "place", court: "diorite",
          texte: "Le même liquide que l'andésite (60 % de silice, vers 980 °C), resté dans la croûte, cristallise lentement en cristaux visibles à l'œil nu : une diorite." },
        { id: "dacite", at: 920, sortie: "lave", court: "dacite",
          texte: "Vers 920 °C, il ne reste qu'un tiers du magma, un liquide à 65 % de silice : sorti en éruption, c'est une dacite." },
        { id: "tonalite", at: 920, sortie: "place", court: "tonalite",
          texte: "Le liquide de la dacite, resté en profondeur, cristallise en plagioclase, quartz et amphibole, presque sans feldspath potassique : une tonalite. À la fin, la bouillie de cristaux d'où s'échappe le dernier liquide, très riche en silice, est elle aussi une diorite ou une tonalite (Nandedkar et al. 2014)." },
        { id: "granodiorite", at: 890, sortie: "place", court: "granodiorite",
          texte: "Vers 890 °C, le liquide atteint 69 % de silice et s'enrichit en potassium : figé en profondeur, il donne une granodiorite, où le feldspath potassique accompagne le plagioclase." },
        { id: "rhyolite", at: 780, sortie: "lave", court: "rhyolite",
          texte: "Vers 780 °C, il ne reste qu'un cinquième du magma, un liquide à 75 % de silice : sorti en éruption, c'est une rhyolite." },
        { id: "trondhjemite", at: 730, sortie: "place", variante: true, court: "trondhjémite", nomDessous: true,
          texte: "Variante : au même stade, un magma pauvre en potassium, comme sous une dorsale, laisse un dernier liquide qui cristallise en plagioclase sodique et en quartz, presque sans feldspath potassique : une trondhjémite. Sous une dorsale, il faut pour cela que plus de 90 % du magma ait cristallisé, avec un apport de croûte océanique fondue (Wanless et al. 2010)." },
        { id: "granite", at: 700, sortie: "place", court: "granite", ailleurs: true,
          texte: "Vers 700 °C, il ne reste que 14 % du magma, un liquide à 78 % de silice ; il cristallise presque d'un coup, entre 700 et 650 °C, en quartz, feldspaths et biotite : un granite. La plupart des granites de France viennent pourtant d'une autre voie, la fusion de la croûte." },
      ],
      legende: `<span class="pq-sym">▲</span> sorti en éruption : une lave · <span class="pq-sym">■</span> resté en profondeur : une roche grenue · <span class="pq-sym">▼</span> cristaux tombés au fond : un cumulat · en pointillé : une variante, expliquée dans le texte de la roche.`,
      sources: `Chemin du liquide, minéraux formés et part restée liquide : Nandedkar R. H., Ulmer P. et Müntener O. (2014), <i>Contributions to Mineralogy and Petrology</i> 167, 1015 (tableaux 2 et 4 ; silice du liquide recalculée sans l'eau). Hornblendite : Ulmer P., Kaegi R. et Müntener O. (2018), <i>Journal of Petrology</i> 59, 11. Gabbros de dorsale : Villiger S., Ulmer P., Müntener O. et Thompson A. B. (2004), <i>Journal of Petrology</i> 45, 2369. Trondhjémite de dorsale : Wanless V. D., Perfit M. R., Ridley W. I. et Klein E. (2010), <i>Journal of Petrology</i> 51, 2377. Domaines de silice (basique, intermédiaire, acide) : Le Bas M. J. et al. (1986), <i>Journal of Petrology</i> 27, 745.`,
    },
  };
  // roche → phénomène de SA fiche (les roches `ailleurs` n'y sont pas) ; les autres phénomènes sont ajoutés par
  // pourquoi-phenomenes.js (Pourquoi.ajouter)
  const PHENOMENE_DE = {};
  function indexer(cle) { for (const rc of PHENOMENES[cle].roches) if (!rc.ailleurs) PHENOMENE_DE[rc.id] = cle; }
  Object.keys(PHENOMENES).forEach(indexer);

  // ─────────────────────────────── scène « chambre » ───────────────────────────────
  // Axe horizontal : température du magma (il refroidit de gauche à droite) ; axe vertical : silice du liquide, avec les
  // domaines basique / intermédiaire / acide. Le point suit le liquide ; chaque roche est une « sortie » du chemin :
  // ▲ au-dessus (lave), ■ au-dessous (restée en profondeur) ou ▼ jusqu'à la bande du bas (cristaux accumulés au fond).
  // La bande du bas se remplit des minéraux formés à chaque palier ; la jauge de droite = part encore liquide.
  function sceneChambre(ph) {
    const HH = 212;
    const X0 = 58, X1 = 436, Y0 = 24, Y1 = 158, B0 = 166, B1 = 182;
    const TMAX = 1200, TMIN = 650, SMIN = 44, SMAX = 80;
    const X = (T) => X0 + (TMAX - T) / (TMAX - TMIN) * (X1 - X0);
    const Y = (s) => Y1 - (s - SMIN) / (SMAX - SMIN) * (Y1 - Y0);
    const PAL = ph.paliers, T0 = PAL[0].T, TF = PAL[PAL.length - 1].T;
    function etat(T) {
      if (T >= T0) return { si: PAL[0].si, F: PAL[0].F };
      for (let k = 1; k < PAL.length; k++) {
        const a = PAL[k - 1], b = PAL[k];
        if (T >= b.T) { const f = (a.T - T) / (a.T - b.T); return { si: lerp(a.si, b.si, f), F: lerp(a.F, b.F, f) }; }
      }
      const z = PAL[PAL.length - 1];
      return { si: z.si, F: z.F };
    }
    const pos = (T) => [X(T), Y(etat(T).si)];
    // ligne du liquide entre Ta (le plus chaud) et Tb
    function troncon(Ta, Tb) {
      if (Tb >= Ta) return [pos(Ta)];
      const out = [pos(Ta)];
      for (const p of PAL) if (p.T < Ta && p.T > Tb) out.push([X(p.T), Y(p.si)]);
      out.push(pos(Tb));
      return out;
    }

    let s = rect(0, 0, W, HH, "#f3f1ea");
    // domaines de silice (IUGS : 45, 52, 63 %), grille des températures
    for (const [a, b, c] of [[SMIN, 45, "#e2d8c9"], [45, 52, "#e8dfd2"], [52, 63, "#eee8de"], [63, SMAX, "#f7f3ec"]]) s += rect(X0, Y(b), X1 - X0, Y(a) - Y(b), c);
    for (const T of [1100, 1000, 900, 800, 700]) s += line(X(T), Y0, X(T), Y1, "#ddd6c8", 0.6);
    for (const v of [45, 52, 63]) s += line(X0, Y(v), X1, Y(v), "#c9bfae", 0.6, { "stroke-dasharray": "3 2" });
    s += txt(X1 - 4, Y(63) - 4, "acide", { a: "end", petit: true, cls: "pq-dom" })
      + txt(X1 - 4, Y(52) - 4, "intermédiaire", { a: "end", petit: true, cls: "pq-dom" })
      + txt(X1 - 4, Y(45) - 4, "basique", { a: "end", petit: true, cls: "pq-dom" });
    s += rect(X0, Y0, X1 - X0, Y1 - Y0, "none", { stroke: "#8f897d", "stroke-width": 0.8 });
    for (const v of [45, 52, 63, 70, 80]) s += line(X0 - 3, Y(v), X0, Y(v), "#8f897d", 0.8) + txt(X0 - 5, Y(v) + 3, `${v}`, { a: "end", petit: true });
    s += txt(8, 15, "silice du liquide (%)", { petit: true });
    // fond de la chambre : les ▼ des cumulats y aboutissent (la bande des minéraux palier par palier a été retirée le
    // 25/09/2026 : « je ne comprends pas trop »)
    s += line(X0, B0, X1, B0, "#6f6a60", 1.4) + txt(X0 + 4, B0 + 10, "fond de la chambre : les cristaux s'y accumulent", { petit: true });
    // axe des températures
    for (const T of [1200, 1100, 1000, 900, 800, 700]) s += line(X(T), B1, X(T), B1 + 3, "#8f897d", 0.8) + txt(X(T), B1 + 12, T === 700 ? "700 °C" : nombre(T), { a: "middle", petit: true });
    s += txt((X0 + X1) / 2, B1 + 24, "température du magma : il refroidit de gauche à droite", { a: "middle", petit: true });
    // jauge « liquide restant »
    const GX = 448, GW = 10;
    s += txt(GX + GW / 2, Y0 - 12, "liquide", { a: "middle", petit: true }) + txt(GX + GW / 2, Y0 - 4, "restant", { a: "middle", petit: true });
    s += rect(GX, Y0, GW, Y1 - Y0, "#ffffff", { stroke: "#8f897d", "stroke-width": 0.8, rx: 2 });
    s += rect(GX + 1, Y1, GW - 2, 0, ROUGE, { class: "pq-jauge", rx: 1.5 });
    s += txt(GX + GW / 2, Y1 + 11, "100 %", { a: "middle", petit: true, cls: "pq-jauge-v" });
    // le chemin du liquide : tout le chemin en pointillé discret, puis le parcours, le chemin rouge (roche de la fiche)
    // et le bleu (roche choisie, décalé pour rester visible)
    const pts = PAL.map((p) => [X(p.T), Y(p.si)]);
    s += pline(pts, "#b3ab9c", 1, { "stroke-dasharray": "2 2" });
    s += `<polyline class="pq-parcours" fill="none" stroke="#5c615d" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" points=""/>`;
    s += `<polyline class="pq-rouge" fill="none" stroke="${ROUGE}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" points=""/>`;
    s += `<polyline class="pq-bleu" fill="none" stroke="${BLEU}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" points=""/>`;
    // les roches : glyphe + zone de survol, puis leurs noms (au-dessus de tout)
    const place = {};
    let glyphes = "", noms = "";
    for (const rc of ph.roches) {
      const [x, y] = pos(rc.at);
      let g, zone, lab;
      if (rc.sortie === "lave") {
        g = line(x, y - 2.5, x, y - 6, "", 1, { class: "pq-t" }) + poly([[x, y - 14.5], [x - 4.6, y - 6], [x + 4.6, y - 6]], "", { class: "pq-g" });
        zone = rect(x - 7, y - 17, 14, 14, "transparent", { class: "pq-zone" });
        lab = { x, y: y - 18, a: "middle" };
      } else if (rc.sortie === "place") {
        g = line(x, y + 2.5, x, y + 6, "", 1, { class: "pq-t" }) + (rc.variante
          ? poly([[x, y + 5.5], [x + 4.4, y + 10], [x, y + 14.5], [x - 4.4, y + 10]], "", { class: "pq-g" })
          : rect(x - 3.6, y + 6.4, 7.2, 7.2, "", { class: "pq-g" }).replace(' fill=""', ""));
        zone = rect(x - 7, y + 2, 14, 15, "transparent", { class: "pq-zone" });
        // à droite du carré ; sous le losange quand la place manque à droite (fin du chemin)
        lab = rc.nomDessous ? { x, y: y + 24, a: "middle" } : { x: x + 7, y: y + 14, a: "start" };
      } else {
        g = line(x, y + 3, x, B0 - 7, "", 1, { class: "pq-t pq-chute" }) + poly([[x - 4.5, B0 - 7.5], [x + 4.5, B0 - 7.5], [x, B0 - 1]], "", { class: "pq-g" });
        zone = rect(x - 6, y + 2, 12, B0 - y - 1, "transparent", { class: "pq-zone" });
        // hauteurs échelonnées (nomY) : les chutes sont proches, leurs noms ne doivent pas se recouvrir
        lab = { x: x + 5, y: rc.nomY || (y + B0) / 2 + 3, a: "start" };
      }
      place[rc.id] = { x, y, lab };
      glyphes += `<g class="pq-r${rc.variante ? " variante" : ""}" data-r="${rc.id}" tabindex="0" role="button" aria-label="${rc.court} : voir pourquoi">${g}${zone}</g>`;
      noms += txt(lab.x, lab.y, rc.court, { a: lab.a, petit: true, cls: "pq-nom", attrs: { "data-nom": rc.id, opacity: 0 } });
    }
    s += `<g class="pq-roches">${glyphes}</g>`;
    s += `<circle class="pq-point" r="4.2" cx="-20" cy="-20" fill="${ROUGE}" stroke="#ffffff" stroke-width="1.2"/>`;
    s += txt(X0 + 7, Y0 + 13, "", { cls: "pq-temp" }) + txt(X0 + 7, Y0 + 24, "", { petit: true, cls: "pq-reste" });
    s += noms;

    return {
      H: HH, svg: s, debut: T0, fin: TF,
      // v = température du moment ; ui = { page, choix, survol, uChoix (0 → 1 : tracé du chemin bleu), age(id) : secondes
      // écoulées depuis que le liquide a passé cette roche (Infinity sinon) }
      brancher(svg) {
        const $ = (q) => svg.querySelector(q);
        const parcours = $(".pq-parcours"), rouge = $(".pq-rouge"), bleu = $(".pq-bleu"), point = $(".pq-point");
        const temp = $(".pq-temp"), reste = $(".pq-reste"), jauge = $(".pq-jauge"), jaugeV = $(".pq-jauge-v");
        const groupes = {}, etiquettes = {};
        svg.querySelectorAll("[data-r]").forEach((g) => { groupes[g.dataset.r] = g; });
        svg.querySelectorAll("[data-nom]").forEach((t) => { etiquettes[t.dataset.nom] = t; });
        const at = {}; ph.roches.forEach((rc) => { at[rc.id] = rc.at; });
        return {
          dessiner(v, ui) {
            const e = etat(v), [px, py] = pos(v);
            const Tp = at[ui.page];
            // le point traîne le chemin rouge jusqu'à la roche de la fiche, puis un chemin gris
            rouge.setAttribute("points", P(troncon(T0, Math.max(v, Tp))));
            parcours.setAttribute("points", v < Tp ? P(troncon(Tp, v)) : "");
            if (ui.choix && ui.choix !== ui.page) bleu.setAttribute("points", P(partiel(decale(troncon(T0, at[ui.choix]), -3), ui.uChoix)));
            else bleu.setAttribute("points", "");
            const teinte = melange("#9e2a1c", "#efb25f", (e.si - 50) / 28);
            point.setAttribute("cx", r1(px)); point.setAttribute("cy", r1(py)); point.setAttribute("fill", teinte);
            temp.textContent = `${nombre(Math.round(v / 5) * 5)} °C`;
            reste.textContent = `il reste ${nombre(e.F)} % de liquide`;
            const h = (Y1 - Y0 - 2) * e.F / 100;
            jauge.setAttribute("y", r1(Y1 - 1 - h)); jauge.setAttribute("height", r1(h)); jauge.setAttribute("fill", teinte);
            jaugeV.textContent = `${nombre(e.F)} %`;
            // nom de passage : seulement la (ou les) dernière(s) roche(s) atteinte(s) par le liquide, un instant
            let recent = Infinity;
            for (const rc of ph.roches) if (v <= rc.at && ui.age(rc.id) < 1.1) recent = Math.min(recent, rc.at);
            for (const rc of ph.roches) {
              const passe = v <= rc.at, page = rc.id === ui.page, choix = rc.id === ui.choix && !page;
              const g = groupes[rc.id];
              g.classList.toggle("passe", passe);
              g.classList.toggle("page", page);
              g.classList.toggle("choix", choix);
              g.classList.toggle("survol", rc.id === ui.survol);
              // nom : permanent pour la roche de la fiche (dès que le liquide l'atteint) et la roche choisie ; au survol ;
              // sinon, un instant au passage du liquide
              const age = ui.age(rc.id);
              let o = 0;
              if ((page && passe) || choix || rc.id === ui.survol) o = 1;
              else if (rc.at === recent) o = age < 0.7 ? 0.85 : 0.85 * (1 - (age - 0.7) / 0.4);
              const t = etiquettes[rc.id];
              t.setAttribute("opacity", r1(clamp(o) * 100) / 100);
              t.classList.toggle("pq-nom-page", page);
              t.classList.toggle("pq-nom-choix", choix);
              t.classList.toggle("pq-nom-fort", page || choix || rc.id === ui.survol);
            }
          },
        };
      },
    };
  }
  // ─────────────────────────────── scène générique « diagramme » ───────────────────────────────
  // Un diagramme à deux axes (linéaires, logarithmiques ou en racine carrée ; y éventuellement orienté vers le bas pour une
  // profondeur), un fond propre au phénomène (domaines, courbes, noms de champs) et un ou plusieurs CHEMINS parcourus en même
  // temps. Une seule variable de progression v (température, profondeur, distance, temps…) va de ph.v.de à ph.v.a ; chaque
  // point d'un chemin porte sa valeur de v ([x, y, v]) ; sans v, le chemin est parcouru à vitesse constante sur tout l'intervalle
  // (ou sur [de, a] du chemin). Chaque roche est posée sur son chemin à la valeur `at` (ou en `p` = [x, y]) ; elle est
  // « atteinte » quand v la dépasse. Formes : rond, carre, tri (▲), tribas (▼), losange.
  function echelle(d, a0, a1) {
    const f = d.type === "log" ? Math.log10 : d.type === "sqrt" ? Math.sqrt : (x) => x;
    const fi = d.type === "log" ? (u) => Math.pow(10, u) : d.type === "sqrt" ? (u) => u * u : (u) => u;
    const u0 = f(d.min), u1 = f(d.max);
    const e = (x) => a0 + (f(Math.max(d.type === "log" ? 1e-12 : d.type === "sqrt" ? 0 : -Infinity, x)) - u0) / (u1 - u0) * (a1 - a0);
    e.inv = (p) => fi(u0 + (p - a0) / (a1 - a0) * (u1 - u0));
    return e;
  }
  function sceneDiagramme(ph) {
    const HH = ph.H || 224;
    const X0 = ph.cadre && ph.cadre.x0 || 58, X1 = ph.cadre && ph.cadre.x1 || 462, Y0 = 24, Y1 = HH - 40;
    const ax = ph.axes, X = echelle(ax.x, X0, X1), Y = ax.y.inverse ? echelle(ax.y, Y0, Y1) : echelle(ax.y, Y1, Y0);
    const Pd = (x, y) => [X(x), Y(y)];
    const vde = ph.v.de, va = ph.v.a;
    const fv = ph.v.log ? Math.log10 : (x) => x;
    const U = (v) => (fv(v) - fv(vde)) / (fv(va) - fv(vde));
    const V = (u) => ph.v.log ? Math.pow(10, fv(vde) + u * (fv(va) - fv(vde))) : vde + u * (va - vde);
    // aides de dessin en unités des axes, pour le fond
    const g = {
      X, Y, P: Pd, X0, X1, Y0, Y1, W, H: HH,
      zone: (L, f, o) => poly(L.map(([x, y]) => Pd(x, y)), f, o),
      rect: (x0, x1, y0, y1, f, o) => { const [a, b] = Pd(x0, y0), [c, d] = Pd(x1, y1); return rect(Math.min(a, c), Math.min(b, d), Math.abs(c - a), Math.abs(d - b), f, o); },
      courbe: (L, c, sw, o) => pline(L.map(([x, y]) => Pd(x, y)), c, sw || 1, o),
      tirets: (L, c, sw) => pline(L.map(([x, y]) => Pd(x, y)), c, sw || 0.9, { "stroke-dasharray": "3 2" }),
      texte: (x, y, s, o = {}) => { const [a, b] = Pd(x, y); return txt(a + (o.dx || 0), b + (o.dy || 0), s, Object.assign({ petit: true }, o)); },
      serie: (f, a, b, n = 40, log) => Array.from({ length: n + 1 }, (_, i) => { const t = log ? Math.pow(10, Math.log10(a) + (Math.log10(b) - Math.log10(a)) * i / n) : a + (b - a) * i / n; return f(t); }),
      clip: `<clipPath id="pq-cadre-${ph.cle}"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}"/></clipPath>`,
    };
    const cadreClip = `clip-path="url(#pq-cadre-${ph.cle})"`;

    let s = rect(0, 0, W, HH, "#f3f1ea") + `<defs>${g.clip}</defs>`;
    s += `<g ${cadreClip}>${ph.fond ? ph.fond(g) : ""}</g>`;
    if (!ax.cache) s += rect(X0, Y0, X1 - X0, Y1 - Y0, "none", { stroke: "#8f897d", "stroke-width": 0.8 });
    const tick = (t) => Array.isArray(t) ? t : [t, nombre(t) === "0" ? "0" : String(t).replace(".", ",")];
    for (const t of ax.x.ticks || []) { const [v, l] = tick(t); const x = X(v); s += line(x, Y1, x, Y1 + 3, "#8f897d", 0.8) + txt(x, Y1 + 12, l, { a: "middle", petit: true }); }
    for (const t of ax.y.ticks || []) { const [v, l] = tick(t); const y = Y(v); s += line(X0 - 3, y, X0, y, "#8f897d", 0.8) + txt(X0 - 5, y + 3, l, { a: "end", petit: true }); }
    if (ax.x.titre) s += txt((X0 + X1) / 2, Y1 + 25, ax.x.titre, { a: "middle", petit: true });
    if (ax.y.titre) s += txt(8, 14, ax.y.titre, { petit: true });

    // chemins → pixels, avec v par point
    const chemins = {};
    for (const [k, c] of Object.entries(ph.chemins || {})) {
      const L = c.pts || c;
      const px = L.map(([x, y]) => Pd(x, y));
      let vs;
      if (L.every((p) => p[2] != null)) vs = L.map((p) => p[2]);
      else {
        let tot = 0; const cum = [0];
        for (let i = 1; i < px.length; i++) { tot += Math.hypot(px[i][0] - px[i - 1][0], px[i][1] - px[i - 1][1]); cum.push(tot); }
        const a = c.de != null ? U(c.de) : 0, b = c.a != null ? U(c.a) : 1;
        vs = cum.map((l) => V(a + (b - a) * l / (tot || 1)));
      }
      chemins[k] = { px, us: vs.map(U) };
    }
    // position d'un chemin à la progression u (null avant son départ)
    function posU(ch, u) {
      const { px, us } = ch;
      if (u < us[0] - 1e-9) return null;
      for (let i = 1; i < px.length; i++) if (u <= us[i] + 1e-9) {
        const f = (u - us[i - 1]) / ((us[i] - us[i - 1]) || 1);
        return [lerp(px[i - 1][0], px[i][0], f), lerp(px[i - 1][1], px[i][1], f)];
      }
      return px[px.length - 1];
    }
    // tronçon d'un chemin entre ua et ub
    function tronconU(ch, ua, ub) {
      const { px, us } = ch;
      const a = Math.max(ua, us[0]); if (ub < a) return [];
      const out = [posU(ch, a)];
      for (let i = 0; i < px.length; i++) if (us[i] > a && us[i] < ub) out.push(px[i]);
      const e = posU(ch, Math.min(ub, us[us.length - 1])); if (e) out.push(e);
      return out;
    }
    const rochesU = {};
    for (const rc of ph.roches) rochesU[rc.id] = U(rc.at);

    for (const [k, ch] of Object.entries(chemins)) {
      const c = ph.chemins[k];
      s += pline(ch.px, "#b3ab9c", 1, { "stroke-dasharray": "2 2" });
      if (c.nom) { const [nx, ny] = c.nomPos ? Pd(c.nomPos[0], c.nomPos[1]) : ch.px[0]; s += txt(nx + (c.nomDx || 0), ny + (c.nomDy || 0), c.nom, { petit: true, a: c.nomA || "start", cls: "pq-dom" }); }
      s += `<polyline class="pq-parcours" data-ch="${k}" fill="none" stroke="#5c615d" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" points=""/>`;
    }
    s += `<polyline class="pq-rouge" fill="none" stroke="${ROUGE}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" points=""/>`;
    s += `<polyline class="pq-bleu" fill="none" stroke="${BLEU}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" points=""/>`;

    // glyphes des roches
    const FORMES = {
      rond: (x, y) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.3" class="pq-g"/>`,
      carre: (x, y) => `<rect x="${r1(x - 3.8)}" y="${r1(y - 3.8)}" width="7.6" height="7.6" class="pq-g"/>`,
      tri: (x, y) => poly([[x, y - 5.4], [x - 5, y + 3.4], [x + 5, y + 3.4]], "", { class: "pq-g" }),
      tribas: (x, y) => poly([[x, y + 5.4], [x - 5, y - 3.4], [x + 5, y - 3.4]], "", { class: "pq-g" }),
      losange: (x, y) => poly([[x, y - 5.2], [x + 4.6, y], [x, y + 5.2], [x - 4.6, y]], "", { class: "pq-g" }),
    };
    let glyphes = "", noms = "";
    for (const rc of ph.roches) {
      const ch = chemins[rc.chemin];
      let [x, y] = rc.p ? Pd(rc.p[0], rc.p[1]) : posU(ch, rochesU[rc.id]) || ch.px[0];
      if (rc.dp) { x += rc.dp[0]; y += rc.dp[1]; }
      const f = (FORMES[rc.forme] || FORMES.rond)(x, y).replace(' fill=""', "");
      // trait discret entre le chemin et une roche posée à côté (p)
      let trait = "";
      if ((rc.p || rc.dp) && ch && !rc.sansTrait) { const q = posU(ch, rochesU[rc.id]); if (q && Math.hypot(q[0] - x, q[1] - y) > 7) { const d = Math.hypot(q[0] - x, q[1] - y), k = 5.5 / d; trait = line(q[0], q[1], x + (q[0] - x) * k, y + (q[1] - y) * k, "", 0.9, { class: "pq-t pq-chute" }); } }
      glyphes += `<g class="pq-r${rc.variante ? " variante" : ""}" data-r="${rc.id}" tabindex="0" role="button" aria-label="${rc.court} : voir pourquoi">${trait}${f}${rect(x - 8, y - 8, 16, 16, "transparent", { class: "pq-zone" })}</g>`;
      const L = rc.lab || "d";
      const lab = Array.isArray(L) ? { x: x + L[0], y: y + L[1], a: L[2] || "start" }
        : L === "g" ? { x: x - 8, y: y + 3, a: "end" } : L === "h" ? { x, y: y - 9, a: "middle" } : L === "b" ? { x, y: y + 15, a: "middle" } : { x: x + 8, y: y + 3, a: "start" };
      noms += txt(lab.x, lab.y, rc.court, { a: lab.a, petit: true, cls: "pq-nom", attrs: { "data-nom": rc.id, opacity: 0 } });
    }
    s += `<g class="pq-roches">${glyphes}</g>`;
    for (const k of Object.keys(chemins)) s += `<circle class="pq-mobile" data-ch="${k}" r="3" cx="-20" cy="-20" fill="#6b706b" stroke="#ffffff" stroke-width="1"/>`;
    s += `<circle class="pq-point" r="4.2" cx="-20" cy="-20" fill="${ROUGE}" stroke="#ffffff" stroke-width="1.2"/>`;
    const LP = ph.lecturePos || [X0 + 7, Y0 + 13, "start"];
    s += txt(LP[0], LP[1], "", { cls: "pq-temp", a: LP[2] }) + txt(LP[0], LP[1] + 11, "", { petit: true, cls: "pq-reste", a: LP[2] });
    s += noms;

    return {
      H: HH, svg: s, debut: vde, fin: va, u: U, v: V, duree: ph.duree || 10,
      brancher(svg) {
        const $ = (q) => svg.querySelector(q);
        const rouge = $(".pq-rouge"), bleu = $(".pq-bleu"), point = $(".pq-point");
        const temp = $(".pq-temp"), reste = $(".pq-reste");
        const parcours = {}, mobiles = {}, groupes = {}, etiquettes = {};
        svg.querySelectorAll(".pq-parcours").forEach((e) => { parcours[e.dataset.ch] = e; });
        svg.querySelectorAll(".pq-mobile").forEach((e) => { mobiles[e.dataset.ch] = e; });
        svg.querySelectorAll("[data-r]").forEach((e) => { groupes[e.dataset.r] = e; });
        svg.querySelectorAll("[data-nom]").forEach((e) => { etiquettes[e.dataset.nom] = e; });
        const chDe = {}; ph.roches.forEach((rc) => { chDe[rc.id] = rc.chemin; });
        return {
          dessiner(v, ui) {
            const u = U(v), up = rochesU[ui.page], chP = chemins[chDe[ui.page]];
            for (const [k, ch] of Object.entries(chemins)) {
              const estP = ch === chP;
              parcours[k].setAttribute("points", P(estP ? (u > up ? tronconU(ch, up, u) : []) : tronconU(ch, 0, u)));
              const q = posU(ch, Math.min(u, ch.us[ch.us.length - 1]));
              const m = mobiles[k];
              if (!estP && q && u <= ch.us[ch.us.length - 1] + 0.02) { m.setAttribute("cx", r1(q[0])); m.setAttribute("cy", r1(q[1])); }
              else { m.setAttribute("cx", -20); m.setAttribute("cy", -20); }
            }
            rouge.setAttribute("points", chP ? P(tronconU(chP, 0, Math.min(u, up))) : "");
            if (ui.choix && ui.choix !== ui.page && chemins[chDe[ui.choix]]) bleu.setAttribute("points", P(partiel(decale(tronconU(chemins[chDe[ui.choix]], 0, rochesU[ui.choix]), -3), ui.uChoix)));
            else bleu.setAttribute("points", "");
            const q = chP && posU(chP, Math.min(u, chP.us[chP.us.length - 1]));
            if (q) { point.setAttribute("cx", r1(q[0])); point.setAttribute("cy", r1(q[1])); } else { point.setAttribute("cx", -20); point.setAttribute("cy", -20); }
            const l = ph.lire ? ph.lire(v, q ? [X.inv(q[0]), Y.inv(q[1])] : null) : "";
            const [l1, l2] = Array.isArray(l) ? l : [l, ""];
            temp.textContent = l1; reste.textContent = l2 || "";
            let recent = -Infinity;
            for (const rc of ph.roches) if (u >= rochesU[rc.id] - 1e-9 && ui.age(rc.id) < 1.1) recent = Math.max(recent, rochesU[rc.id]);
            for (const rc of ph.roches) {
              const passe = u >= rochesU[rc.id] - 1e-9, page = rc.id === ui.page, choix = rc.id === ui.choix && !page;
              const gr = groupes[rc.id];
              gr.classList.toggle("passe", passe); gr.classList.toggle("page", page);
              gr.classList.toggle("choix", choix); gr.classList.toggle("survol", rc.id === ui.survol);
              const age = ui.age(rc.id);
              let o = 0;
              if ((page && passe) || choix || rc.id === ui.survol) o = 1;
              else if (Math.abs(rochesU[rc.id] - recent) < 1e-9) o = age < 0.7 ? 0.85 : 0.85 * (1 - (age - 0.7) / 0.4);
              const t = etiquettes[rc.id];
              t.setAttribute("opacity", r1(clamp(o) * 100) / 100);
              t.classList.toggle("pq-nom-page", page); t.classList.toggle("pq-nom-choix", choix);
              t.classList.toggle("pq-nom-fort", page || choix || rc.id === ui.survol);
            }
          },
        };
      },
    };
  }
  const SCENES = { chambre: sceneChambre, diagramme: sceneDiagramme };

  // ─────────────────────────────── carte et lecteur ───────────────────────────────
  function carte(roche) {
    const cle = roche && PHENOMENE_DE[roche.id];
    if (!cle) return "";
    const ph = PHENOMENES[cle];
    return `<details class="card pourquoi replie-travaux" id="pourquoi"><summary><h2>${ph.titre} <span class="en-travaux">🚧 en travaux</span></h2></summary>
    <p class="sub">${insecable(ph.intro)}</p>
    <div class="pq"></div>
  </details>`;
  }

  function sources(roche) {
    const cle = roche && PHENOMENE_DE[roche.id];
    return cle ? `<p class="page-source"><b>${PHENOMENES[cle].titre}</b> — ${PHENOMENES[cle].sources}</p>` : "";
  }

  function monter(el, roche) {
    const cle = roche && PHENOMENE_DE[roche.id];
    if (!el || !cle) return null;
    const ph = PHENOMENES[cle], sc = SCENES[ph.scene](Object.assign(ph, { cle }));
    const reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const roches = {}; ph.roches.forEach((rc) => { roches[rc.id] = rc; });
    el.innerHTML = `
      <div class="pq-scene" style="aspect-ratio:${W} / ${sc.H}"><svg viewBox="0 0 ${W} ${sc.H}" role="group" aria-label="${ph.titre}">${sc.svg}</svg></div>
      <p class="pq-legende">${insecable(ph.mesure)}<br>${ph.legende}</p>
      <div class="pq-info"><span class="pq-pastille"></span><p class="pq-texte"></p><a class="pq-lien" hidden></a>
        <button type="button" class="fa-lecture pq-lecture"></button></div>`;
    const svg = el.querySelector("svg"), vue = sc.brancher(svg);
    const texte = el.querySelector(".pq-texte"), lien = el.querySelector(".pq-lien"), pastille = el.querySelector(".pq-pastille");
    const bouton = el.querySelector(".pq-lecture");

    // chronologie : départ figé, le liquide refroidit à vitesse constante, s'arrête un moment sur la roche de la fiche,
    // continue jusqu'au dernier palier, puis l'image finale reste affichée avant de recommencer
    // la progression u va de 0 à 1 (chambre : 1 170 → 700 °C à 47 °C par seconde, soit 10 s)
    const ATTENTE = 700, PAUSE = 1600, TIENT = 6500;       // millisecondes
    const U = sc.u || ((v) => (v - sc.debut) / (sc.fin - sc.debut)), V = sc.v || ((u) => sc.debut + u * (sc.fin - sc.debut));
    const DUREE = (sc.duree || 10) * 1000, up = clamp(U(roches[roche.id].at));
    const d1 = up * DUREE, d2 = (1 - up) * DUREE;
    const CYCLE = ATTENTE + d1 + PAUSE + d2 + TIENT;
    const uDe = (t) => t < ATTENTE ? 0 : t < ATTENTE + d1 ? (t - ATTENTE) / DUREE : t < ATTENTE + d1 + PAUSE ? up
      : t < ATTENTE + d1 + PAUSE + d2 ? up + (t - ATTENTE - d1 - PAUSE) / DUREE : 1;
    const Tde = (t) => V(uDe(t));
    const tDeU = (u) => u <= up ? ATTENTE + u * DUREE : ATTENTE + d1 + PAUSE + (u - up) * DUREE;
    const passageA = (v) => tDeU(clamp(U(v)));

    let tms = reduit ? CYCLE - TIENT : 0, lecture = !reduit, visible = false, raf = 0, dernier = 0, dernierDessin = 0;
    const ui = {
      page: roche.id, choix: null, survol: null, uChoix: 1, t0Choix: 0,
      age: (id) => { const t = tms - passageA(roches[id].at); return t >= 0 ? t / 1000 : Infinity; },
    };

    function majInfo() {
      const id = ui.choix || ui.page, rc = roches[id], estPage = id === ui.page;
      pastille.classList.toggle("choix", !estPage);
      texte.innerHTML = `<b>${nomFiche(id)}</b>${estPage ? " · cette fiche" : ""} — ${insecable(rc.texte)}`;
      if (estPage) { lien.hidden = true; lien.removeAttribute("href"); }
      else { lien.hidden = false; lien.href = "#roche/" + id; lien.textContent = "Voir sa fiche →"; }
    }
    function dessiner() {
      if (ui.choix && ui.uChoix < 1) ui.uChoix = clamp((performance.now() - ui.t0Choix) / 900);
      vue.dessiner(Tde(tms), ui);
    }
    function image(now) {
      raf = 0;
      if (!el.isConnected) return arreter();
      if (lecture) {
        tms += Math.min(100, now - dernier);
        if (tms >= CYCLE) tms = 0;
      }
      dernier = now;
      if (now - dernierDessin >= PAS_IMAGE) { dernierDessin = now; dessiner(); }
      planifier();
    }
    // on anime tant que la lecture est en cours, ou le temps de tracer le chemin bleu d'une roche choisie
    const actif = () => visible && !document.hidden && (lecture || (ui.choix && ui.uChoix < 1));
    function planifier() {
      if (actif()) { if (!raf) { dernier = performance.now(); raf = requestAnimationFrame(image); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; dessiner(); }
    }
    function majBouton() {
      bouton.innerHTML = lecture ? ICONES.pause : ICONES.lecture;
      bouton.setAttribute("aria-label", lecture ? "Mettre en pause" : "Lancer l'animation");
    }
    function choisir(id) {
      ui.choix = !id || id === ui.page || id === ui.choix ? null : id;
      ui.uChoix = ui.choix ? 0 : 1;
      ui.t0Choix = performance.now();
      majInfo(); dessiner(); planifier();
    }
    const survoler = (id) => { if (ui.survol !== id) { ui.survol = id; dessiner(); } };
    svg.addEventListener("pointerover", (e) => { const g = e.target.closest("[data-r]"); survoler(g ? g.dataset.r : null); });
    svg.addEventListener("pointerleave", () => survoler(null));
    svg.addEventListener("focusin", (e) => { const g = e.target.closest("[data-r]"); if (g) survoler(g.dataset.r); });
    svg.addEventListener("focusout", () => survoler(null));
    svg.addEventListener("click", (e) => { const g = e.target.closest("[data-r]"); if (g) choisir(g.dataset.r); });
    svg.addEventListener("keydown", (e) => {
      const g = e.target.closest("[data-r]");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); choisir(g.dataset.r); }
      else if (e.key === "Escape") choisir(null);
    });
    bouton.addEventListener("click", () => { lecture = !lecture; majBouton(); planifier(); });
    const surVisibilite = () => planifier();
    const obs = "IntersectionObserver" in window ? new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; planifier(); }, { threshold: 0.15 }) : null;
    function arreter() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (obs) obs.disconnect();
      document.removeEventListener("visibilitychange", surVisibilite);
    }
    document.addEventListener("visibilitychange", surVisibilite);
    if (obs) obs.observe(el); else visible = true;
    majBouton(); majInfo(); dessiner(); planifier();
    // contrôle (tests) : figer le graphique à la température T, choisir une roche
    const montrer = (T, choix) => {
      lecture = false; majBouton(); planifier();
      tms = T == null ? CYCLE - TIENT : tDeU(clamp(U(T)));
      if (choix !== undefined) { ui.choix = choix; ui.uChoix = 1; majInfo(); }
      dessiner();
    };
    return (el._pq = { arreter, montrer, etat: () => ({ T: Tde(tms), tms, cycle: CYCLE, lecture, visible, anime: !!raf, choix: ui.choix }) });
  }

  function ajouter(cle, ph) { PHENOMENES[cle] = ph; indexer(cle); }
  window.Pourquoi = { carte, monter, sources, ajouter, PHENOMENES, phenomene: (id) => PHENOMENE_DE[id] || null, _outils: { MIN, ROUGE, BLEU } };
})();
