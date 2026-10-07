// ============ « En s'altérant, donne » en petit schéma (02/10/2026) ============
// Demande : remplacer le texte de la fiche minéral par un schéma + le nom des molécules ; 2ᵉ passe (même jour) : l'acide
// carbonique (et non « le CO₂ ») comme attaquant, la réaction COMPLÈTE avec ses coefficients (eau consommée ou rendue, CO₂
// dégagé…), et, quand plusieurs issues existent, une possibilité par onglet avec sa condition écrite en clair.
// Les réactions viennent de alteration-reactions.js, GÉNÉRÉ et vérifié par tools/alteration_reactions.py (données :
// tools/alteration_donnees.py) : chaque élément et la charge sont conservés. Minéral sans réaction : ancien texte `devient`.
// Lecture d'un schéma : ce qui réagit (le minéral, puis ce qui l'attaque) → ce qui RESTE sur place / PART avec l'eau /
// PART dans l'air ; chaque espèce porte son coefficient ; l'équation complète est écrite dessous.
// Chargé avant app.js ; app.js appelle AlterationSchema.html(id).
(function () {
  "use strict";
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const R = () => window.ALT_REACTIONS || {};
  const E = () => window.ALT_ESPECES || {};
  const mineraux = () => (typeof MINERAUX !== "undefined" ? MINERAUX : {});
  const coul = (id, defaut) => (id && mineraux()[id] && mineraux()[id].swatch) || defaut;

  // petits dessins (36 × 36)
  const cristal = (c, t = 44) => `<svg viewBox="0 0 36 36" width="${t}" height="${t}" aria-hidden="true">
      <path d="M18 3 L31 10 L31 26 L18 33 L5 26 L5 10 Z" fill="${c}" stroke="var(--ink2)" stroke-width="1.2"/>
      <path d="M18 3 L18 33 M5 10 L18 17 L31 10" fill="none" stroke="var(--ink2)" stroke-width=".8" opacity=".55"/></svg>`;
  const DESSIN = {
    argile: (c) => `<svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${5 + (i % 2) * 3}" y="${8 + i * 4.5}" width="23" height="3" rx="1.2" fill="${c}" stroke="var(--ink2)" stroke-width=".7"/>`).join("")}</svg>`,
    oxyde: (c) => `<svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
      <path d="M8 22 C5 15 11 9 17 11 C21 6 30 10 28 17 C32 22 26 30 19 27 C13 31 7 28 8 22 Z" fill="${c}" stroke="var(--ink2)" stroke-width=".8"/>
      <circle cx="27" cy="27" r="3" fill="${c}" stroke="var(--ink2)" stroke-width=".7"/><circle cx="7" cy="10" r="2.2" fill="${c}" stroke="var(--ink2)" stroke-width=".7"/></svg>`,
    sel: (c) => `<svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
      <path d="M6 14 L16 8 L28 12 L30 24 L19 30 L7 25 Z" fill="${c}" stroke="var(--ink2)" stroke-width=".9"/>
      <path d="M16 8 L17 19 L30 24 M17 19 L7 25" fill="none" stroke="var(--ink2)" stroke-width=".6" opacity=".5"/></svg>`,
    grain: (c) => cristal(c, 34),
  };
  const COUL_DEFAUT = { argile: "#d8cfbf", oxyde: "#b5653a", sel: "#e8e3d6", grain: "#cfcfcf" };
  const SOLIDES = new Set(["argile", "oxyde", "sel", "grain"]);

  // coefficient écrit « 4 × » (des pastilles numérotées se lisaient comme des étapes)
  const fois = (n) => `<span class="as-x">${n} ×</span>`;
  const txt = (nom, f, note) => `<span class="as-txt"><span class="as-nom">${esc(nom)}</span><span class="as-f">${f}</span>${note ? `<small>${note}</small>` : ""}</span>`;
  const bulle = (e) => `<span class="as-bulle as-${e.t}">${e.f}</span>`;
  // une ligne : coefficient, dessin, nom et formule
  function ligne(n, k, reactif, ici) {
    const e = E()[k];
    if (SOLIDES.has(e.t)) {
      const corps = `${fois(n)}${DESSIN[e.t](coul(e.id, COUL_DEFAUT[e.t]))}${txt(e.nom, e.f)}`;
      const cls = `as-ligne${ici && e.id === ici ? " as-ici" : ""}`;
      return e.lien ? `<button class="${cls} as-lien" data-gopage="${e.lien}">${corps}</button>` : `<div class="${cls}">${corps}</div>`;
    }
    return `<div class="as-ligne">${fois(n)}${bulle(e)}${txt(e.nom, "", (reactif && NOTE_REACTIF[k]) || "")}</div>`;
  }
  // ce qui accompagne le minéral : précision sur son origine
  const NOTE_REACTIF = { H2CO3: "le CO₂ dissous dans l'eau de pluie et du sol", O2: "dissous dans l'eau", "Mg2+": "apporté par l'eau du sol",
    H4SiO4: "silice dissoute de l'eau du sol", "Cl-": "eau salée", H2S: "traces dans l'air", "Ca2+": "dissous dans l'eau",
    "H2PO4-": "dissous dans l'eau", "SO4_2-": "dissous dans l'eau" };
  const FLECHE = `<div class="as-fleche" aria-hidden="true"><svg viewBox="0 0 40 20"><path d="M2 10 H30" stroke="currentColor" stroke-width="2.5"/><path d="M28 3 L38 10 L28 17 Z" fill="currentColor"/></svg></div>`;
  const groupe = (cls, titre, corps) => `<div class="as-groupe as-${cls}"><div class="as-titre">${titre}</div>${corps}</div>`;

  function reactionHTML(id, r, v, ici) {
    const m = mineraux()[id] || {};
    const nomMin = (m.nom || id).split(" (")[0];
    const lienMin = ici ? ` as-lien" data-gopage="mineral/${id}` : "";
    const minLigne = (n, suffixe = "") => `<${ici ? "button" : "div"} class="as-ligne${lienMin}">${fois(n)}${cristal(m.swatch || "#ccc", 34)}${txt(nomMin + suffixe, r.formule)}</${ici ? "button" : "div"}>`;
    if (v.intact) {
      return `<div class="as-reaction">
        <div class="as-cadre as-avant">${groupe("depart", "Ce qui réagit", minLigne(1))}</div>${FLECHE}
        <div class="as-cadre as-apres">${groupe("reste", "Reste sur place", minLigne(1, ", intact"))}</div></div>`;
    }
    const nMin = (v.reactifs.find(([, k]) => k === id) || [1])[0];
    const autres = v.reactifs.filter(([, k]) => k !== id);
    const sorte = (f) => v.produits.filter(([, k]) => f(E()[k].t));
    const reste = sorte((t) => SOLIDES.has(t)), eau = sorte((t) => ["ion", "molecule", "eau"].includes(t)), air = sorte((t) => t === "gaz");
    const lignes = (L, reactif) => L.map(([n, k]) => ligne(n, k, reactif, ici)).join("");
    const terme = (n, k) => `${n > 1 ? n + " " : ""}${k === id ? r.formule : E()[k].f}`;
    const eq = v.reactifs.map(([n, k]) => terme(n, k)).join(" + ") + " → " + v.produits.map(([n, k]) => terme(n, k)).join(" + ");
    return `<div class="as-reaction">
        <div class="as-cadre as-avant">${groupe("depart", "Ce qui réagit", minLigne(nMin) + lignes(autres, true))}</div>${FLECHE}
        <div class="as-cadre as-apres">
          ${groupe("reste", "Reste sur place", reste.length ? lignes(reste) : `<span class="as-rien">rien : tout part</span>`)}
          ${eau.length ? groupe("part", "Part avec l'eau", lignes(eau)) : ""}
          ${air.length ? groupe("air", "Part en gaz", lignes(air)) : ""}
        </div>
      </div>
      <p class="as-equation"><span>Équation</span> ${eq}</p>`;
  }

  function html(id) {
    const r = R()[id];
    if (!r || !r.voies || !r.voies.length) return "";
    const plusieurs = r.voies.length > 1;
    const voies = r.voies.map((v, i) => {
      const cond = v.texte ? esc(v.texte.charAt(0).toUpperCase() + v.texte.slice(1)) + "." : "";
      return `<section class="as-voie${plusieurs ? " as-teinte as-t" + (i % 4) : ""}">
        ${plusieurs ? `<h5 class="as-voie-titre"><span>Possibilité ${i + 1}</span> ${esc(v.titre)}</h5>` : v.titre ? `<h5 class="as-voie-titre">${esc(v.titre)}</h5>` : ""}
        ${cond ? `<p class="as-cond">${cond}</p>` : ""}
        ${reactionHTML(id, r, v)}
      </section>`;
    }).join(`<div class="as-ou"><span>ou</span></div>`);
    return `<div class="as-bloc">
      ${voies}
      ${r.note ? `<p class="as-note-min">Formule utilisée : ${esc(r.note)}.</p>` : ""}
    </div>`;
  }

  // carte à part, au-dessus de « Pour aller plus loin » (02/10/2026, sa demande) ; le panneau d'altération n'a plus qu'un bouton
  const SOURCE = "Altération : réactions équilibrées par l'atlas (chaque élément et la charge conservés) ; conditions de climat d'après l'échelle de l'atlas (température moyenne annuelle, pluie rapportée à l'ETP) et les grands types d'altération de G. Pedro (1968), « Distribution des principaux types d'altération chimique à la surface du globe », Revue de géographie physique et de géologie dynamique, 10 (5), p. 457-470 : smectites quand l'eau s'écoule peu, kaolinite en climat chaud et humide, gibbsite en climat tropical très humide.";
  const existe = (id) => !!(R()[id] && R()[id].voies && R()[id].voies.length);

  // « D'où vient-il ? » (02/10/2026, sa demande) : les réactions de l'atlas dont un produit est ce minéral, rangées par
  // importance du minéral de départ dans les roches de l'atlas (somme de ses teneurs) ; 4 schémas, les autres dans un volet
  let poidsCache = null;
  function poids(id) {
    if (!poidsCache) {
      poidsCache = {};
      for (const r of (typeof ROCHES !== "undefined" ? ROCHES : [])) for (const [m, p] of (r.mineraux || [])) poidsCache[m] = (poidsCache[m] || 0) + p;
    }
    return poidsCache[id] || 0;
  }
  function origines(id) {
    const L = [];
    for (const [src, r] of Object.entries(R())) {
      if (src === id || !mineraux()[src]) continue;
      r.voies.forEach((v, i) => { if (!v.intact && v.produits.some(([, k]) => E()[k].id === id)) L.push({ src, v }); });
    }
    // formations depuis un autre minéral qui ne sont pas son altération de surface (enfouissement, cémentation, vase…)
    for (const o of ((window.ALT_ORIGINES || {})[id] || [])) if (mineraux()[o.src] && R()[o.src]) L.push({ src: o.src, v: o });
    return L.sort((a, b) => poids(b.src) - poids(a.src) || nomDe(a.src).localeCompare(nomDe(b.src), "fr"));
  }
  // milieux où il naît directement (modes de formation de la fiche, sans leurs diagrammes) ; fiches de groupe : une espèce type
  const TYPE_DE = { pyroxenes: "augite", amphiboles: "hornblende", chlorite_m: "clinochlore", grenat: "almandin" };
  function milieux(id) {
    const F = typeof MIN_F !== "undefined" ? MIN_F : {};
    const f = F[id] && F[id].scenarios && F[id].scenarios.length ? F[id] : F[TYPE_DE[id]];
    // (« À l'air libre : arène ou kaolinite » de l'orthose décrit son altération, pas sa formation : écarté)
    return f && f.scenarios ? f.scenarios.filter((sc) => sc.nom && sc.texte && !/^À l'air libre/.test(sc.nom)) : [];
  }
  const nomDe = (id) => (mineraux()[id] ? mineraux()[id].nom.split(" (")[0] : id);
  function origineHTML({ src, v }, j, cible) {
    const r = R()[src];
    const cond = v.texte ? esc(v.texte.charAt(0).toUpperCase() + v.texte.slice(1)) + "." : "";
    return `<section class="as-voie as-teinte as-o${j % 4}">
      <h5 class="as-voie-titre"><span>Depuis</span> <button class="as-src" data-gopage="mineral/${src}">${esc(nomDe(src))}</button>${v.titre ? ` · ${esc(v.titre)}` : ""}</h5>
      ${cond ? `<p class="as-cond">${cond}</p>` : ""}
      ${reactionHTML(src, r, v, cible)}
    </section>`;
  }
  const milieuHTML = (sc, j) => `<section class="as-voie as-teinte as-milieu as-o${j % 4}">
      <h5 class="as-voie-titre">${esc(sc.nom)}</h5><p class="as-cond">${sc.texte.replace(/\s+/g, " ").trim()}</p></section>`;
  const PREMIERS = 4;
  function carteOrigine(id) {
    const L = origines(id), M = milieux(id), m = mineraux()[id] || {};
    const OU = `<div class="as-ou"><span>ou</span></div>`;
    let corps = "";
    if (L.length) {
      const reste = L.slice(PREMIERS);
      corps += `<div data-as-premiers><p class="as-cond">Les minéraux de l'atlas qui en donnent (le produit est encadré), du plus répandu dans les roches au plus rare.</p>
      ${L.slice(0, PREMIERS).map((o, j) => origineHTML(o, j, id)).join(OU)}</div>
      ${reste.length ? `<div class="as-autres-ligne">
        <button class="as-voir" data-as-autres aria-expanded="false">Voir les ${reste.length} autres façons de le former</button>
        <input type="search" class="as-cherche" data-as-cherche placeholder="Rechercher un minéral, un milieu…" aria-label="Rechercher parmi les façons de le former">
      </div><p class="as-trouve" data-as-trouve hidden></p><div data-as-suite></div>` : ""}`;
    }
    if (M.length) {
      corps += `<h3 class="as-sous">${L.length ? "Il se forme aussi directement" : "Il ne naît pas de l'altération d'un autre minéral"}</h3>
      <p class="as-cond">${L.length ? "Sans minéral de départ, dans l'un de ces milieux :" : "Il se forme directement (ou se concentre), dans l'un de ces milieux :"}</p>
      ${M.map((sc, j) => milieuHTML(sc, j + (L.length ? Math.min(L.length, PREMIERS) : 0))).join(OU)}`;
    } else if (!L.length && m.contexte) {
      corps += `<section class="as-voie as-teinte as-milieu as-o0"><h5 class="as-voie-titre">Où et comment il se forme</h5><p class="as-cond">${m.contexte}</p></section>`;
    }
    return corps ? `<div class="card min-alt-origine" data-as-origine="${id}"><h2>D'où vient-il ?</h2>${corps}</div>` : "";
  }
  // le volet des autres origines se remplit à l'ouverture (la kaolinite en a plus de cent) ; la recherche filtre TOUTES les
  // origines (minéral de départ, condition, produits ; sans tenir compte des accents) et masque les 4 premières pendant ce temps
  const sansAccent = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const texteDe = (o) => sansAccent([nomDe(o.src), o.v.titre, o.v.texte, ...(o.v.produits || []).map(([, k]) => E()[k].nom + " " + E()[k].f)].join(" "));
  const OU_ = `<div class="as-ou"><span>ou</span></div>`;
  function remplir(carte, q) {
    const id = carte.dataset.asOrigine, box = carte.querySelector("[data-as-suite]");
    const premiers = carte.querySelector("[data-as-premiers]"), trouve = carte.querySelector("[data-as-trouve]");
    const btn = carte.querySelector("button[data-as-autres]");
    const L = origines(id);
    if (q) {
      const mots = sansAccent(q).split(/\s+/).filter(Boolean);
      const R_ = L.filter((o) => { const t = texteDe(o); return mots.every((m) => t.includes(m)); });
      premiers.hidden = true; trouve.hidden = false;
      trouve.textContent = R_.length ? `${R_.length} résultat${R_.length > 1 ? "s" : ""} sur ${L.length}` : `Aucun résultat sur ${L.length}`;
      box.innerHTML = R_.map((o, j) => origineHTML(o, j, id)).join(OU_);
      btn.setAttribute("aria-expanded", "true");
    } else {
      premiers.hidden = false; trouve.hidden = true;
      const ouvert = btn.dataset.ouvert === "1";
      box.innerHTML = ouvert ? L.slice(PREMIERS).map((o, j) => origineHTML(o, j + PREMIERS, id)).join(OU_) : "";
      btn.setAttribute("aria-expanded", ouvert ? "true" : "false");
      btn.textContent = ouvert ? "Masquer les autres façons de le former" : `Voir les ${L.length - PREMIERS} autres façons de le former`;
    }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-as-autres]");
    if (!b) return;
    const carte = b.closest("[data-as-origine]"), champ = carte.querySelector("[data-as-cherche]");
    b.dataset.ouvert = b.dataset.ouvert === "1" ? "0" : "1";
    if (champ) champ.value = "";
    remplir(carte, "");
  });
  document.addEventListener("input", (e) => {
    const c = e.target.closest("[data-as-cherche]");
    if (c) remplir(c.closest("[data-as-origine]"), c.value.trim());
  });

  // carte « Ce que donne son altération » : les schémas, ou le texte de la fiche quand il n'y a pas de réaction
  const carteAlteration = (id) => {
    const m = mineraux()[id] || {};
    const corps = existe(id) ? html(id) : m.devient ? `<p class="as-cond">${m.devient}</p>` : "";
    return corps ? `<div class="card min-alt-schema" id="alteration-resultats"><h2>Ce que donne son altération</h2>${corps}</div>` : "";
  };
  const carte = (id) => carteAlteration(id) + carteOrigine(id);
  const bouton = (id) => carteAlteration(id) ? `<button class="as-voir" data-as-voir>Voir les résultats de l'altération ↓</button>` : "";
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-as-voir]")) return;
    const c = document.getElementById("alteration-resultats");
    if (c) c.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  window.AlterationSchema = { html, carte, bouton, SOURCE, existe, origines };
})();
