// ═══════════════════════════════════════════════════════════════════════════════
// nombres.js — les nombres des fiches minéraux en images (01/10/2026)
// Dureté, masse volumique et résistance à l'altération : au lieu d'un nombre seul, un visuel, au choix du lecteur
// (bouton en haut de la fiche, choix gardé d'une fiche à l'autre) :
//   « reperes »  A · curseur sur une règle avec des repères connus (échelle de Mohs, eau, or, série de Goldich…)
//   « carres »   B · carrés remplis (1 carré = 1 point de Mohs, 1 kg par litre, 1 rang de Goldich)
//   « concret »  C · le nombre traduit en gestes et en objets (raye le verre, masse d'un litre…)
//   « atlas »    D · sa place parmi tous les minéraux de l'atlas (histogramme, le sien en rouge)
// Usage : <div data-nb="durete" data-nb-id="quartz"></div> puis Nombres.rendre(racine) ; Nombres.selecteurHTML().
// Le dessin est fait à la largeur réelle du bloc (les textes gardent leur taille) et refait si elle change.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  const CLE = "atlas-nombres";
  const MODES = [["reperes", "Repères"], ["carres", "Carrés"], ["concret", "Comparaison"], ["atlas", "Dans l'atlas"]];
  let mode = "reperes";
  try { const m = localStorage.getItem(CLE); if (MODES.some(([k]) => k === m)) mode = m; } catch (e) { /* stockage indisponible */ }

  const fmt = (x, n = 2) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: n }).format(x);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // EXTRA : fiches qui ne sont pas dans MINERAUX (espèces d'argiles, G.12) — { id: { nom, durete, densite, cec, surface… } }
  const EXTRA = {};
  const fiche = (id) => MINERAUX[id] || EXTRA[id];
  const nomCourt = (id) => (fiche(id) ? fiche(id).nom.split(" (")[0] : id);
  const valeur = (id, champ) => {
    const m = fiche(id);
    const v = m && m[champ];
    return typeof v === "number" && v > 0 ? v : null;
  };

  // ─────────── les trois grandeurs ───────────
  // reps : repères posés sur la règle (minéraux de l'échelle de Mohs, de la série de Goldich…) ; objets : repères du quotidien
  const MOHS = [["talc", 1], ["gypse_m", 2], ["calcite", 3], ["fluorine", 4], ["apatite", 5], ["orthose", 6], ["quartz", 7],
    ["topaze", 8], ["corindon", 9], ["diamant", 10]];
  const ARTICLE = { talc: "le talc", gypse_m: "le gypse", calcite: "la calcite", fluorine: "la fluorine", apatite: "l'apatite",
    orthose: "l'orthose", quartz: "le quartz", topaze: "la topaze", corindon: "le corindon", diamant: "le diamant" };
  const GRANDEURS = {
    durete: {
      champ: "durete", min: 1, max: 10, echelle: "lin", ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      bouts: ["tendre", "dur"], pas: 0.5,
      texte: (v) => `${fmt(v)} sur l'échelle de Mohs`,
      reps: () => MOHS.map(([id, v]) => ({ id, v, nom: nomCourt(id) })),
      objets: [{ v: 2.5, nom: "ongle" }, { v: 3.5, nom: "pièce de cuivre" }, { v: 5.5, nom: "verre" }, { v: 6.5, nom: "acier" }],
      plusQue: "Plus dur que", meme: "aussi dur",
    },
    densite: {
      champ: "densite", min: 0, max: 22, echelle: "racine", ticks: [0, 1, 3, 5, 10, 15, 20],
      bouts: ["léger", "lourd"], bins: 26,
      texte: (v) => `${fmt(v)} g/cm³`,
      reps: () => [{ v: 1, nom: "Eau" }, { id: "quartz", v: valeur("quartz", "densite"), nom: "Quartz" },
        { id: "galene", v: valeur("galene", "densite"), nom: "Galène" }, { v: 7.87, nom: "Fer" },
        { id: "or_natif", v: valeur("or_natif", "densite"), nom: "Or" }].filter((r) => r.v),
      objets: [],
      plusQue: "Plus lourd que", meme: "aussi lourd",
    },
    stabilite: {
      champ: "stabilite", min: 1, max: 10, echelle: "lin", ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      bouts: ["s'altère en premier", "quasi inaltérable"], pas: 1, vert: true,
      texte: (v) => `${v}/10 — ${v <= 2 ? "s'altère en premier" : v <= 5 ? "s'altère assez vite" : v <= 8 ? "résistant" : "quasi inaltérable"}`,
      // série de Goldich (1938) : les minéraux courants des roches, avec la note que leur donne l'atlas
      reps: () => ["olivine", "pyroxenes", "amphiboles", "biotite", "plagioclases", "orthose", "muscovite", "quartz"]
        .filter((id) => MINERAUX[id]).map((id) => ({ id, v: MINERAUX[id].stabilite, nom: nomCourt(id) })),
      objets: [],
      plusQue: "Plus résistant à l'altération que", meme: "aussi résistant",
    },
  };

  // position sur la règle (0–1)
  const pos = (G, v) => {
    const t = Math.max(G.min, Math.min(G.max, v));
    if (G.echelle === "racine") return (Math.sqrt(t) - Math.sqrt(G.min)) / (Math.sqrt(G.max) - Math.sqrt(G.min));
    return (t - G.min) / (G.max - G.min);
  };
  const largeurTexte = (s, taille = 11) => s.length * taille * 0.56 + 4;

  // étiquettes posées en rangées, sans chevauchement : chaque étiquette prend la première rangée où elle tient
  function ranger(items, W, taille) {
    const rangs = [];
    items.sort((a, b) => a.x - b.x).forEach((it) => {
      const l = largeurTexte(it.lab, taille);
      it.x0 = Math.max(2, Math.min(W - 2 - l, it.x - l / 2));
      let r = 0;
      while (rangs[r] !== undefined && rangs[r] > it.x0 - 6) r++;
      rangs[r] = it.x0 + l;
      it.rang = r;
    });
    return rangs.length;
  }

  // ─────────── A · règle avec curseur ───────────
  function reperes(G, v, id, W) {
    const g = 10, d = W - 10, X = (x) => g + pos(G, x) * (d - g);
    const yAxe = 34, yNum = 47, y0 = 64, h = 13;
    const items = G.reps().filter((r) => r.id !== id).map((r) => ({ x: X(r.v), v: r.v, lab: r.nom, type: "rep" }))
      .concat(G.objets.map((o) => ({ x: X(o.v), v: o.v, lab: `${o.nom} ${fmt(o.v)}`, type: "obj" })));
    const nr = ranger(items, W, 11);
    const H = y0 + nr * h + (G.bouts ? 16 : 2);
    const xm = X(v);
    const nom = `${nomCourt(id)} · ${fmt(v)}`;
    const lm = largeurTexte(nom, 12);
    const xl = Math.max(2 + lm / 2, Math.min(W - 2 - lm / 2, xm));
    let s = `<svg class="nb-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(nom)}">`;
    s += `<line x1="${g}" y1="${yAxe}" x2="${d}" y2="${yAxe}" class="nb-axe"/>`;
    G.ticks.forEach((t) => {
      const x = X(t);
      s += `<line x1="${x}" y1="${yAxe - 4}" x2="${x}" y2="${yAxe + 4}" class="nb-axe"/><text x="${x}" y="${yNum}" class="nb-num" text-anchor="middle">${fmt(t)}</text>`;
    });
    items.forEach((it) => {
      const y = y0 + it.rang * h;
      s += `<line x1="${it.x}" y1="${yAxe + 5}" x2="${it.x}" y2="${y - 9}" class="nb-tige${it.type === "obj" ? " nb-tige-obj" : ""}"/>`;
      s += `<text x="${it.x0}" y="${y}" class="${it.type === "obj" ? "nb-obj" : "nb-rep"}">${esc(it.lab)}</text>`;
    });
    if (G.bouts) {
      s += `<text x="${g}" y="${H - 3}" class="nb-bout">← ${G.bouts[0]}</text>`;
      s += `<text x="${d}" y="${H - 3}" class="nb-bout" text-anchor="end">${G.bouts[1]} →</text>`;
    }
    s += `<path d="M${xm} ${yAxe - 1} l-7 -12 h14 z" class="nb-curseur"/>`;
    s += `<text x="${xl}" y="13" class="nb-lui" text-anchor="middle">${esc(nom)}</text>`;
    return s + "</svg>";
  }

  // ─────────── B · carrés remplis ───────────
  function carres(G, v, id) {
    if (G.carres) return G.carres(v, id);   // grandeur ajoutée par un autre fichier (CEC, surface des argiles)
    let n, unite, legende;
    if (G.champ === "densite") {
      n = Math.max(1, Math.ceil(v));
      legende = `1 carré = 1 g/cm³, soit 1 kg par litre (la masse d'un litre d'eau) : ${fmt(v)} carrés.`;
    } else {
      n = 10;
      legende = G.champ === "durete" ? `${fmt(v)} carrés sur 10 (échelle de Mohs).` : `${v} carrés sur 10 (série de Goldich).`;
    }
    const cases = [];
    for (let i = 0; i < n; i++) {
      const part = Math.max(0, Math.min(1, v - i));
      cases.push(`<i class="nb-carre${G.vert ? " nb-vert" : ""}"><b style="width:${fmt(part * 100, 1).replace(",", ".")}%"></b></i>`);
    }
    return `<div class="nb-carres">${cases.join("")}</div><p class="nb-note">${legende}</p>`;
  }

  // ─────────── C · comparaison concrète ───────────
  function concret(G, v, id) {
    if (G.concret) return G.concret(v, id, nomCourt(id));
    const nom = nomCourt(id);
    if (G.champ === "durete") {
      const outils = [["l'ongle", 2.5], ["une pièce de cuivre", 3.5], ["une lame de couteau", 5.5], ["une lime d'acier", 6.5]];
      const pastilles = outils.map(([o, h]) => v > h + 0.2 ? `<span class="nb-pas nb-ok">résiste à ${o}</span>`
        : v < h - 0.2 ? `<span class="nb-pas nb-non">rayé par ${o}</span>` : `<span class="nb-pas">à peine marqué par ${o}</span>`);
      pastilles.push(v > 5.7 ? `<span class="nb-pas nb-ok">raye le verre</span>`
        : v < 5.3 ? `<span class="nb-pas nb-non">ne raye pas le verre</span>` : `<span class="nb-pas">raye à peine le verre</span>`);
      const dessous = MOHS.filter(([, h]) => h < v - 0.01).pop(), dessus = MOHS.find(([, h]) => h > v + 0.01);
      const egal = MOHS.find(([, h]) => Math.abs(h - v) < 0.01);
      const le = (r) => `${ARTICLE[r[0]]} (${r[1]})`;
      const ph = egal ? (egal[0] === id
          ? `C'est le repère n° ${egal[1]} de l'échelle de Mohs : il raye ${dessous ? le(dessous) : "tous les autres"} et il est rayé par ${dessus ? le(dessus) : "aucun autre"}.`
          : `Aussi dur que ${le(egal)}, repère n° ${egal[1]} de l'échelle de Mohs.`)
        : `Sur l'échelle de Mohs, entre ${dessous ? le(dessous) : "le bas de l'échelle"} et ${dessus ? le(dessus) : "le haut de l'échelle"}.`;
      return `<div class="nb-pastilles">${pastilles.join("")}</div><p class="nb-note">${ph}</p>`;
    }
    if (G.champ === "densite") {
      // masse d'un litre : l'eau, quelques repères et le minéral, rangés du plus léger au plus lourd
      const refs = G.reps().filter((r) => r.id !== id && r.nom !== "Fer");
      const lignes = refs.map((r) => ({ nom: r.nom, v: r.v })).concat([{ nom, v, lui: true }]).sort((a, b) => a.v - b.v);
      const max = Math.max(...lignes.map((l) => l.v));
      const barres = lignes.map((l) => `<div class="nb-litre${l.lui ? " nb-lui-l" : ""}"><span>${esc(l.nom)}</span>
        <i><b style="width:${(l.v / max * 100).toFixed(1)}%"></b></i><span>${fmt(l.v)} kg</span></div>`).join("");
      const balle = Math.round(157 * v / 10) * 10;
      const ph = `Un caillou de ${esc(nom.toLowerCase())} de la taille d'une balle de tennis (≈ 157 cm³) pèserait ≈ ${fmt(balle, 0)} g${v < 1 ? " — et flotterait sur l'eau" : ""}.`;
      return `<p class="nb-titre">Masse d'un litre</p><div class="nb-litres">${barres}</div><p class="nb-note">${ph}</p>`;
    }
    // résistance à l'altération : place dans la série de Goldich
    const refs = G.reps();
    const chaine = [];
    let pose = false;
    refs.forEach((r) => {
      if (!pose && r.id !== id && r.v > v) { chaine.push({ nom, lui: true }); pose = true; }
      chaine.push({ nom: r.nom, lui: r.id === id, v: r.v });
      if (r.id === id) pose = true;
    });
    if (!pose) chaine.push({ nom, lui: true });
    const html = chaine.map((c) => `<span class="nb-pas${c.lui ? " nb-lui-p" : ""}">${esc(c.nom)}</span>`).join(`<span class="nb-fleche">→</span>`);
    return `<div class="nb-pastilles nb-chaine">${html}</div>
      <p class="nb-note">Dans une roche exposée à la pluie, ces minéraux disparaissent de gauche à droite (série de Goldich).</p>`;
  }

  // ─────────── D · sa place parmi les minéraux de l'atlas ───────────
  const cacheTous = {};
  function tous(champ) {
    if (!cacheTous[champ]) cacheTous[champ] = Object.keys(MINERAUX).map((i) => valeur(i, champ)).filter((x) => x !== null);
    return cacheTous[champ];
  }
  function atlas(G, v, id, W) {
    const vals = G.tous ? G.tous() : tous(G.champ);   // G.tous / G.population : autre population que les minéraux
    const g = 10, d = W - 10, X = (x) => g + pos(G, x) * (d - g);
    // classes : pas fixe (dureté 0,5, Goldich 1) ou bandes égales sur l'échelle en racine (masse volumique)
    let bornes = [];
    if (G.pas) for (let b = G.min - G.pas / 2; b < G.max + G.pas / 2 + 1e-9; b += G.pas) bornes.push(b);
    else {
      const a = Math.sqrt(G.min), b = Math.sqrt(G.max);
      for (let i = 0; i <= G.bins; i++) bornes.push((a + (b - a) * i / G.bins) ** 2);
    }
    const n = bornes.slice(0, -1).map((b, i) => vals.filter((x) => x >= b && x < bornes[i + 1]).length);
    const k = bornes.findIndex((b, i) => i < bornes.length - 1 && v >= b && v < bornes[i + 1]);
    const nmax = Math.max(...n);
    const yb = 72, hmax = 44;
    const H = yb + 34;
    let s = `<svg class="nb-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Place parmi les minéraux de l'atlas">`;
    n.forEach((c, i) => {
      const x1 = Math.max(g, X(bornes[i])), x2 = Math.min(d, X(bornes[i + 1]));
      const hh = c ? Math.max(1.5, c / nmax * hmax) : 0;
      if (hh) s += `<rect x="${x1 + 0.6}" y="${yb - hh}" width="${Math.max(1, x2 - x1 - 1.2)}" height="${hh}" class="${i === k ? "nb-barre-lui" : "nb-barre"}"/>`;
    });
    s += `<line x1="${g}" y1="${yb}" x2="${d}" y2="${yb}" class="nb-axe"/>`;
    G.ticks.forEach((t) => { s += `<text x="${X(t)}" y="${yb + 13}" class="nb-num" text-anchor="middle">${fmt(t)}</text>`; });
    if (G.bouts) {
      s += `<text x="${g}" y="${H - 3}" class="nb-bout">← ${G.bouts[0]}</text>`;
      s += `<text x="${d}" y="${H - 3}" class="nb-bout" text-anchor="end">${G.bouts[1]} →</text>`;
    }
    const xm = X(v);
    const nom = nomCourt(id);
    const lm = largeurTexte(nom, 12);
    s += `<path d="M${xm} ${yb - hmax - 3} l-6 -10 h12 z" class="nb-curseur"/>`;
    s += `<text x="${Math.max(2 + lm / 2, Math.min(W - 2 - lm / 2, xm))}" y="11" class="nb-lui" text-anchor="middle">${esc(nom)}</text>`;
    s += "</svg>";
    const moins = vals.filter((x) => x < v).length;
    const pc = Math.round(moins / vals.length * 100);
    return s + `<p class="nb-note">${G.plusQue} ${pc} % des ${vals.length} ${G.population || "minéraux de l'atlas"} dont la valeur est connue.</p>`;
  }

  // ─────────── rendu ───────────
  function dessinerBloc(el) {
    const G = GRANDEURS[el.dataset.nb];
    const id = el.dataset.nbId;
    const v = G && valeur(id, G.champ);
    if (!G || v === null) { el.innerHTML = ""; return; }
    const W = Math.max(220, Math.floor(el.clientWidth || el.parentElement.clientWidth || 320));
    el._nbW = W;
    el.dataset.nbMode = mode;
    el.innerHTML = mode === "carres" ? carres(G, v, id) : mode === "concret" ? concret(G, v, id)
      : mode === "atlas" ? atlas(G, v, id, W) : reperes(G, v, id, W);
  }
  let ro = null;
  function rendre(racine) {
    const r = racine || document;
    if (!ro && window.ResizeObserver) ro = new ResizeObserver((entrees) => entrees.forEach((e) => {
      const el = e.target;
      if (!el.isConnected) { ro.unobserve(el); return; }
      const W = Math.floor(el.clientWidth);
      if ((mode === "reperes" || mode === "atlas") && W && Math.abs(W - (el._nbW || 0)) > 2) dessinerBloc(el);
    }));
    r.querySelectorAll("[data-nb]").forEach((el) => {
      dessinerBloc(el);
      if (ro && !el._nbVu) { el._nbVu = true; ro.observe(el); }
    });
    r.querySelectorAll("[data-nb-choix]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.nbChoix === mode)));
  }
  function choisir(m) {
    if (!MODES.some(([k]) => k === m)) return;
    mode = m;
    try { localStorage.setItem(CLE, m); } catch (e) { /* stockage indisponible : le choix vaut pour la visite */ }
    rendre(document);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-nb-choix]");
    if (b) choisir(b.dataset.nbChoix);
  });

  // bouton en haut de la fiche : le même choix vaut pour toutes les fiches
  const selecteurHTML = () => `<div class="nb-choix"><span>Afficher les nombres :</span>
    <div class="s3d-seg">${MODES.map(([k, lib]) => `<button type="button" data-nb-choix="${k}" aria-pressed="${k === mode}">${lib}</button>`).join("")}</div></div>`;
  // un bloc à poser sous la ligne du tableau ; rien si la valeur manque
  const blocHTML = (champ, id) => (GRANDEURS[champ] && valeur(id, GRANDEURS[champ].champ) !== null
    ? `<div class="nb" data-nb="${champ}" data-nb-id="${id}"></div>` : "");

  window.Nombres = { rendre, choisir, selecteurHTML, blocHTML, GRANDEURS, EXTRA, mode: () => mode };
})();
