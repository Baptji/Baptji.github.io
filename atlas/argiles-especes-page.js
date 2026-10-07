// ============================================================
// Page d'une espèce d'argile (#espece/<id>) sur le GABARIT DES FICHES MINÉRAUX (01/10/2026)
// Suite de cartes pleine largeur : identité en images (identite.js), nombres en images avec le bouton
// « Afficher les nombres » à 4 modes (nombres.js, + deux grandeurs propres aux argiles : CEC et surface
// spécifique), structure 3D, son groupe, pour aller plus loin, sources.
// Valeurs et sources : argiles-especes-valeurs.js (VAL_ESP). Chargé après lui et après nombres.js / identite.js ;
// les fonctions d'app.js (fmt, especeChip, sourcesFicheHTML, structure3DHTML) ne sont appelées qu'au rendu.
// ============================================================
(function () {
  const fr = (x, n = 1) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: n }).format(x);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const court = (nom) => nom.split(" (")[0];

  // fiche ARGILES qui porte les valeurs de l'espèce ou de son groupe (repères)
  function ficheDe(eid) {
    const e = ESPECES[eid];
    let g = null;
    CLASSIF.forEach((f) => f.groupes.forEach((x) => { if (!g && x.especes.includes(eid)) g = x; }));
    return (e.fiche && ARGILES.find((a) => a.id === e.fiche)) || ARGILES.find((a) => a.espece === eid)
      || (g && g.fiche && ARGILES.find((a) => a.id === g.fiche)) || null;
  }
  // rétention d'eau : aucune mesure par espèce → valeur de la fiche (milieu de sa fourchette pour les visuels)
  const eauFiche = (eid) => { const f = ficheDe(eid); return f && f.eauMin != null ? f : null; };

  // ─────────── fiches visibles par nombres.js ───────────
  function enregistrer() {
    if (!window.Nombres || typeof VAL_ESP === "undefined") return;
    Object.keys(ESPECES).forEach((id) => {
      Nombres.EXTRA[id] = {
        nom: ESPECES[id].nom,
        durete: ValeursEspeces.nombre(id, "dur"), densite: ValeursEspeces.nombre(id, "dens"),
        cec: ValeursEspeces.nombre(id, "cec"), surface: ValeursEspeces.nombre(id, "surf"),
        eau: eauFiche(id) ? (eauFiche(id).eauMin + eauFiche(id).eauMax) / 2 : null,
      };
    });
  }

  // repères : les fiches d'argiles de l'atlas (milieu de leur fourchette)
  const repFiches = (min, max, ids) => () => (typeof ARGILES === "undefined" ? [] : ARGILES
    .filter((a) => a[min] != null && a[max] != null && (!ids || ids.includes(a.id)))
    .map((a) => ({ v: (a[min] + a[max]) / 2, nom: court(a.nom) })));
  const valeursEspeces = (champ) => () => Object.keys(Nombres.EXTRA)
    .map((id) => Nombres.EXTRA[id][champ]).filter((x) => typeof x === "number" && x > 0);
  // barres comparées (même rendu que « masse d'un litre » des minéraux)
  const QUATRE = ["kaolinite", "illite", "smectites", "vermiculite"];   // repères de la comparaison
  function barres(refs, nom, v) {
    const lignes = refs.map((r) => ({ nom: r.nom, v: r.v })).concat([{ nom, v, lui: true }]).sort((a, b) => a.v - b.v);
    const max = Math.max(...lignes.map((l) => l.v));
    return `<div class="nb-litres">${lignes.map((l) => `<div class="nb-litre${l.lui ? " nb-lui-l" : ""}"><span>${esc(l.nom)}</span>
      <i><b style="width:${(l.v / max * 100).toFixed(1)}%"></b></i><span>${fr(l.v)}</span></div>`).join("")}</div>`;
  }
  // carrés : 1 carré = « pas » unités
  function carresDe(v, pas, legende) {
    const n = Math.max(1, Math.ceil(v / pas));
    const cases = [];
    for (let i = 0; i < n; i++) cases.push(`<i class="nb-carre"><b style="width:${(Math.max(0, Math.min(1, v / pas - i)) * 100).toFixed(1)}%"></b></i>`);
    return `<div class="nb-carres">${cases.join("")}</div><p class="nb-note">${legende}</p>`;
  }

  // ─────────── deux grandeurs propres aux argiles ───────────
  function grandeurs() {
    if (!window.Nombres) return;
    Nombres.GRANDEURS.cec = {
      champ: "cec", min: 0, max: 160, echelle: "racine", ticks: [0, 5, 20, 50, 100, 150], bins: 24,
      bouts: ["retient peu de cations", "en retient beaucoup"],
      texte: (v) => `${fr(v)} cmol⁺/kg`,
      reps: repFiches("cecMin", "cecMax"), objets: [],
      tous: valeursEspeces("cec"), population: "espèces d'argiles de l'atlas",
      plusQue: "CEC plus forte que", meme: "même CEC",
      carres: (v) => carresDe(v, 10, `1 carré = 10 cmol⁺/kg : ${fr(v)} cmol⁺/kg, soit ${fr(v / 10)} carré${v / 10 >= 2 ? "s" : ""}.`),
      // 1 cmol⁺ = 0,20 g de Ca²⁺ (40,08 g/mol ÷ 2 charges ÷ 100) ou 0,39 g de K⁺ (39,10 g/mol ÷ 100)
      concret: (v, id, nom) => `<p class="nb-titre">CEC en cmol⁺/kg, comparée aux grandes familles (milieu de la fourchette de leur fiche)</p>
        ${barres(repFiches("cecMin", "cecMax", QUATRE)(), nom, v)}
        <p class="nb-note">1 kg de ${esc(nom.toLowerCase())} peut retenir sur ses surfaces, prêts à être échangés avec l'eau du sol,
        ≈ ${fr(v * 0.2004)} g de calcium (Ca²⁺) ou ≈ ${fr(v * 0.391)} g de potassium (K⁺).</p>`,
    };
    Nombres.GRANDEURS.eau = {
      champ: "eau", min: 0, max: 520, echelle: "racine", ticks: [0, 20, 50, 100, 200, 300, 500], bins: 24,
      bouts: ["retient peu d'eau", "en retient beaucoup"],
      texte: (v) => `${fr(v)} g/100 g`,
      reps: repFiches("eauMin", "eauMax"), objets: [],
      tous: () => repFiches("eauMin", "eauMax")().map((r) => r.v), population: "fiches d'argiles de l'atlas",
      plusQue: "Retient plus d'eau que", meme: "même rétention",
      carres: (v) => carresDe(v, 50, `1 carré = 50 g d'eau pour 100 g d'argile : ${fr(v)} g/100 g.`),
      // 1 g/100 g = 10 g d'eau par kg = 1 cl ; un verre = 20 cl
      concret: (v, id, nom) => `<p class="nb-titre">Rétention d'eau en g/100 g, comparée aux grandes familles (milieu de la fourchette de leur fiche)</p>
        ${barres(repFiches("eauMin", "eauMax", QUATRE)(), nom, v)}
        <p class="nb-note">1 kg de ${esc(nom.toLowerCase())} retient ≈ ${fr(v * 10, 0)} g d'eau, soit ≈ ${fr(v / 100)} litre
        (≈ ${fr(v / 20)} verre${v / 20 >= 2 ? "s" : ""} de 20 cl).</p>`,
    };
    // objets de comparaison pour la surface (dimensions réglementaires)
    const OBJETS = [
      ["une table de ping-pong", 4.18],      // 2,74 × 1,525 m
      ["une place de parking", 12.5],        // 5 × 2,5 m
      ["un terrain de badminton", 81.74],    // 13,40 × 6,10 m
      ["un court de tennis", 260.76],        // 23,77 × 10,97 m
      ["un terrain de handball", 800],       // 40 × 20 m
    ];
    Nombres.GRANDEURS.surface = {
      champ: "surface", min: 0, max: 850, echelle: "racine", ticks: [0, 10, 50, 100, 200, 400, 800], bins: 24,
      bouts: ["peu de surface", "beaucoup de surface"],
      texte: (v) => `${fr(v)} m²/g`,
      reps: repFiches("surfMin", "surfMax"), objets: [],
      tous: valeursEspeces("surface"), population: "espèces d'argiles de l'atlas",
      plusQue: "Plus de surface que", meme: "même surface",
      carres: (v) => carresDe(v, 100, `1 carré = 100 m² par gramme : ${fr(v)} m²/g.`),
      concret: (v, id, nom) => {
        const o = OBJETS.reduce((m, x) => Math.abs(Math.log(v / x[1])) < Math.abs(Math.log(v / m[1])) ? x : m);
        const k = v / o[1];
        return `<p class="nb-titre">Surface en m²/g, comparée aux grandes familles (milieu de la fourchette de leur fiche)</p>
          ${barres(repFiches("surfMin", "surfMax", QUATRE)(), nom, v)}
          <p class="nb-note">Les surfaces de 1 g de ${esc(nom.toLowerCase())}, mises bout à bout, couvriraient ≈ ${fr(v, 0)} m² :
          ${k > 0.8 && k < 1.25 ? `environ ${o[0]}` : `≈ ${fr(k)} fois ${o[0]}`} (${fr(o[1])} m²).</p>`;
      },
    };
  }

  // ─────────── identité en images ───────────
  const FAM_COURT = ["1:1", "2:1 dioct.", "2:1 trioct.", "2:1:1 (chlorites)", "Inter\u00adstratifiés", "Fibreuses", "Para-cristallins"];
  function placeEspece(eid) {
    let r = null;
    CLASSIF.forEach((f, fi) => f.groupes.forEach((g, gi) => { if (!r && g.especes.includes(eid)) r = { fam: f, fi, groupe: g, gi }; }));
    return r;
  }
  // vue de dessus d'une couche d'octaèdres : chaque hexagone = un site ; dioctaédrique = un site sur trois vide
  // (motif de la gibbsite), trioctaédrique = tous occupés (motif de la brucite)
  function feuilletSVG(di) {
    const a = 11, w = Math.sqrt(3) * a, W = 132, H = 74;
    let s = "";
    for (let r = -1; r <= 5; r++) for (let q = -4; q <= 9; q++) {
      const cx = w * (q + r / 2) + 4, cy = 1.5 * a * r + 4;
      if (cx < -a || cx > W + a || cy < -a || cy > H + a) continue;
      const vide = di && ((q - r) % 3 + 3) % 3 === 0;
      const pts = [0, 1, 2, 3, 4, 5].map((i) => { const t = Math.PI / 180 * (60 * i - 30);
        return `${(cx + a * 0.93 * Math.cos(t)).toFixed(1)},${(cy + a * 0.93 * Math.sin(t)).toFixed(1)}`; }).join(" ");
      s += vide ? `<polygon points="${pts}" class="eo-vide"/>`
        : `<polygon points="${pts}" class="${di ? "eo-al" : "eo-mg"}"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.4" class="eo-ion"/>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${s}</svg>`;
  }
  function feuilletHTML(di, tri) {
    const fig = (on, svg, titre, texte) => `<figure class="eo-fig${on ? " on" : ""}">${svg}
      <figcaption><b>${titre}</b><span>${texte}</span></figcaption></figure>`;
    return `<div class="eo-grille">
        ${fig(di, feuilletSVG(true), "Dioctaédrique", "2 sites sur 3 occupés, par Al³⁺ ou Fe³⁺ ; le troisième reste vide")}
        ${fig(tri, feuilletSVG(false), "Trioctaédrique", "3 sites sur 3 occupés, par Mg²⁺ ou Fe²⁺")}
      </div>`;
  }
  const rang = (lib, valeur, visuel) => `<div class="id-ligne"><div class="id-tete"><span>${lib}</span><b>${valeur || ""}</b></div>${visuel || ""}</div>`;
  function identiteHTML(eid, place) {
    const e = ESPECES[eid], V = VAL_ESP[eid] || {};
    const familles = `<div class="id-rang">${CLASSIF.map((f, fi) => `<a href="#argrp/${fi}-0" class="id-chip${place && place.fi === fi ? " on" : ""}"
      aria-label="${esc(f.famille)}"><span>${FAM_COURT[fi] || esc(f.famille.split(" — ")[0])}</span></a>`).join("")}</div>`;
    const o = (e.octa || "").toLowerCase();
    const di = /\bdi/.test(o) || o.startsWith("di"), tri = /tri/.test(o);
    const feuilletO = o && o !== "—" ? feuilletHTML(di, tri) : "";
    const sys = V.sys && window.Identite && Identite.systemeHTML ? Identite.systemeHTML(V.sys.v) : "";
    const coul = V.coul && window.Identite && Identite.couleursHTML ? Identite.couleursHTML(V.coul.v) : "";
    return `<div class="id-grille">
      ${rang("Famille d'argiles", place ? esc(place.groupe.nom) : "", familles)}
      ${feuilletO ? rang("Feuillet octaédrique", esc(e.octa), feuilletO) : ""}
      ${rang("Système cristallin", V.sys ? esc(V.sys.v) + ValeursEspeces.appel(eid, "sys") : "non renseigné", sys)}
      ${rang("Couleurs", V.coul ? ValeursEspeces.appel(eid, "coul") : "non renseignées",
        V.coul ? coul + `<p class="id-note">${esc(V.coul.v)}</p>` : "")}
      ${V.ima ? rang("Statut IMA", "", `<p class="id-note">${esc(V.ima.v)}${ValeursEspeces.appel(eid, "ima")}</p>`) : ""}
    </div>`;
  }

  // ─────────── les nombres ───────────
  function tuile(eid, lib, k, champNb, unite, repere) {
    const V = VAL_ESP[eid] || {};
    const x = V[k];
    if (!x && repere) return `<div class="mesure mesure-vide">
      <div class="mesure-tete"><span>${lib}</span><b>non renseignée</b></div>
      <p class="mesure-texte esp-precision">Repère : ${repere}</p></div>`;
    const visuel = x && champNb && window.Nombres ? Nombres.blocHTML(champNb, eid) : "";
    // en gras : le nombre (ou la fourchette) de tête et son unité ; la suite du texte passe dessous
    const m = x ? x.v.match(/^[≈~]?\s*\d[\d\s,–-]*\d|^[≈~]?\s*\d/) : null;
    const tete = m ? m[0].trim() : x ? x.v : "";
    const reste = x ? x.v.slice(m ? m[0].length : x.v.length).replace(/^[\s;,]+/, "") : "";
    return `<div class="mesure${x ? "" : " mesure-vide"}">
      <div class="mesure-tete"><span>${lib}</span><b>${x ? `${esc(tete)}${unite ? ` <small>${unite}</small>` : ""}${ValeursEspeces.appel(eid, k)}` : "non renseignée"}</b></div>
      ${reste ? `<p class="mesure-texte esp-precision">${esc(reste)}</p>` : ""}${visuel}</div>`;
  }
  function nombresHTML(eid) {
    const V = VAL_ESP[eid] || {};
    const f = ficheDe(eid), fNom = f ? court(f.nom) : "";
    const rep = (min, max, u) => f && f[min] != null ? `${fmt(f[min])}–${fmt(f[max])} ${u} pour la fiche ${esc(fNom)}` : "";
    const ef = eauFiche(eid);
    const eau = ef ? `<div class="mesure">
        <div class="mesure-tete"><span>Rétention d'eau</span><b>${fmt(ef.eauMin)}–${fmt(ef.eauMax)} <small>g/100 g</small></b></div>
        <p class="mesure-texte esp-precision">Valeur de la fiche ${esc(court(ef.nom))} : aucune mesure sur cette espèce seule.</p>
        ${window.Nombres ? Nombres.blocHTML("eau", eid) : ""}</div>`
      : `<div class="mesure mesure-vide"><div class="mesure-tete"><span>Rétention d'eau</span><b>non renseignée</b></div></div>`;
    const ligne = (lib, k, unite) => V[k] ? `<div class="mesure-ligne"><span>${lib}</span><p>${esc(V[k].v)}${unite ? " " + unite : ""}${ValeursEspeces.appel(eid, k)}</p></div>`
      : `<div class="mesure-ligne mesure-vide"><span>${lib}</span><p>non renseignée</p></div>`;
    const choix = window.Nombres ? Nombres.selecteurHTML() : "";
    return `${choix}
      <div class="mesures">
        ${tuile(eid, "Dureté (échelle de Mohs)", "dur", "durete", "/ 10")}
        ${tuile(eid, "Masse volumique", "dens", "densite", "g/cm³")}
        ${tuile(eid, "Capacité d'échange de cations (CEC)", "cec", "cec", "cmol⁺/kg", rep("cecMin", "cecMax", "cmol⁺/kg"))}
        ${tuile(eid, "Surface spécifique", "surf", "surface", "m²/g", rep("surfMin", "surfMax", "m²/g"))}
        ${eau}
      </div>
      ${V.eauInter ? ligne("Eau entre les feuillets", "eauInter") : ""}
      ${ligne("Espacement basal mesuré", "d001")}
      <p class="pan-note esp-note-nr">« Non renseignée » : aucune mesure publiée sur cette espèce seule n'a été trouvée ; la valeur de la
      fiche de son groupe est donnée en repère. Sources en bas de page.</p>`;
  }

  // sources du schéma de la CEC (G.2), ajoutées à la liste de la page
  const cecSources = (h) => !window.CecSchema ? h : h && h.includes("</ul>") ? h.replace(/<\/ul>(?![\s\S]*<\/ul>)/, CecSchema.sourcesLi() + "</ul>")
    : `${h || ""}<section class="min-sources card"><h4>Sources</h4><ul>${CecSchema.sourcesLi()}</ul></section>`;

  function html(eid) {
    const e = ESPECES[eid], V = VAL_ESP[eid] || {};
    const place = placeEspece(eid);
    const fiche = place && place.groupe.fiche ? ARGILES.find((a) => a.id === place.groupe.fiche) : null;
    const sw = (e.fiche && (ARGILES.find((a) => a.id === e.fiche) || {}).swatch) || (fiche && fiche.swatch) || "var(--baseline)";
    const tete = `<div class="pan-tete">
        <div class="ox-img pan-photo" id="esppimg-${eid}"><span class="sw-ph"></span></div>
        <h1><span class="sw-big" style="background:${sw}"></span>${e.nom}</h1>
        <div class="formule">${e.formule}</div>
        ${place ? `<p class="sub crumb">Argiles <span>→</span> <a href="#argiles">${esc(place.fam.famille.split(" — ")[0])}</a>
          <span>→</span> <a href="#argrp/${place.fi}-${place.gi}">${esc(place.groupe.nom)}</a></p>` : ""}
      </div>`;
    const s3d = typeof Structure3D !== "undefined" && Structure3D.existe(eid)
      ? `<div class="card min-structure"><div data-s3d="${eid}" data-s3d-source="bas" data-s3d-replier></div></div>` : "";
    const plusLoin = V.fr ? `<div class="card min-plusloin"><h2>Pour aller plus loin</h2>
        <h4>Où la trouver</h4><p>${esc(V.fr.v)}${ValeursEspeces.appel(eid, "fr")}</p></div>` : "";
    return `<div class="page-min">
      <div class="card fiche-min">${tete}
        <p class="pan-texte min-intro">${e.note}</p>
        <section class="min-panneau min-large">${identiteHTML(eid, place)}</section>
        <section class="min-panneau min-large min-physique">${nombresHTML(eid)}</section>
      </div>
      ${s3d}
      ${window.CecSchema && ficheDe(eid) ? CecSchema.carte({ fiche: ficheDe(eid), nom: court(e.nom), cec: ValeursEspeces.nombre(eid, "cec") }) : ""}
      ${plusLoin}
      ${cecSources(ValeursEspeces.sources(eid, sourcesFicheHTML(eid, null, true)).replace('class="min-sources"', 'class="min-sources card"'))}
    </div>`;
  }

  enregistrer();
  grandeurs();
  window.EspecePage = { html };
})();
