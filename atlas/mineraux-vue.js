// ============ Vue d'ensemble des minéraux (#mineraux), refaite le 11/10/2026 sur le modèle des argiles ============
// Sa demande : « refaire la vue d'ensemble en me basant sur celle des argiles, mais sans la structure 3D de tous les
// minéraux, une image suffirait », et en haut les trois boutons du menu (tous les minéraux · minéraux principaux des
// sols · minéraux du sol par rôle), puis les classes de Strunz.
// Une seule page : une section par classe de Strunz (ou par groupe du sol, vue « rôle »), un panneau par groupe
//   · en-tête : code de Strunz, nom, nombre d'espèces, puce « Ce qui fait ce groupe » (note, motif, lien) ;
//   · une vignette par minéral : la photo de sa fiche (Wikipédia, chargée quand la carte arrive à l'écran), sinon la forme
//     calculée du cristal (cristal.js), sinon sa couleur ;
//   · trois jauges sur une échelle commune à tous les groupes : dureté, altérabilité, masse volumique (bulle au survol,
//     même mécanique que les argiles : ArgilesVue.BULLES).
// Ancres gardées : mincls-<n>, mingrp-<n>-<gi>, minsol-<groupe>[-<i>] (app.js, route).
(function () {
  "use strict";
  const fr = (x, n = 2) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: n });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const court = (nom) => String(nom).split(" (")[0].split(" —")[0].trim();

  // ── éléments affichés : minéral, espèce d'argile (« esp: »), fiche d'argile (« arg: ») ─────────────────────
  function element(e) {
    const id = typeof e === "string" ? e : e.id;
    if (id.startsWith("esp:")) {
      const k = id.slice(4), es = ESPECES[k];
      if (!es) return null;
      const g = CLASSIF.flatMap((fa) => fa.groupes).find((x) => x.especes.includes(k));
      const f = ARGILES.find((a) => a.id === (es.fiche || (g && g.fiche)));
      const dens = typeof VAL_ESP !== "undefined" && VAL_ESP[k] && VAL_ESP[k].dens;
      const d = dens ? (String(dens.v).replace(/\([^)]*\)/g, "").match(/\d+(?:,\d+)?/) || [])[0] : null;
      return { cle: "esp:" + k, attr: `data-espece="${k}"`, nom: court(es.nom), formule: es.formule || "",
        sw: f ? f.swatch : "var(--prod-argile)", titres: [court(es.nom), court(es.nom) + " (minéral)"],
        durete: null, stabilite: null, densite: d ? Number(d.replace(",", ".")) : null };
    }
    if (id.startsWith("arg:")) {
      const a = ARGILES.find((x) => x.id === id.slice(4));
      if (!a) return null;
      return { cle: "arg:" + a.id, attr: `data-goargile="${a.id}"`, nom: court(a.nom), formule: "", sw: a.swatch,
        titres: [decodeURIComponent((a.wikipedia || "").split("/wiki/").pop() || court(a.nom))], durete: null, stabilite: null, densite: null };
    }
    const m = MINERAUX[id];
    if (!m) return null;
    return { cle: id, id, attr: `data-min="${id}"`, nom: court(m.nom), formule: m.formule || "", sw: m.swatch, tag: e.tag || "",
      titres: [m.wiki || court(m.nom), court(m.nom) + " (minéral)"],
      durete: typeof m.durete === "number" && m.durete > 0 ? m.durete : null,   // 0 = liquide (mercure) : pas de dureté
      stabilite: typeof m.stabilite === "number" ? m.stabilite : null,
      densite: typeof m.densite === "number" ? m.densite : null };
  }
  const elementsDe = (liste) => liste.map(element).filter(Boolean);
  // code de Strunz d'un minéral (vue « rôle » : la classe de chacun sur sa vignette) ; argiles = phyllosilicates
  let CODES = null;
  function codeDe(el) {
    if (!CODES) {
      CODES = {};
      MIN_CLASSIF.forEach((c) => c.groupes.forEach((g) => groupeIds(g).forEach((id) => { if (!CODES[id]) CODES[id] = g.code || c.num; })));
    }
    if (el.id) return CODES[el.id] || "";
    const ph = (MIN_CLASSIF.find((c) => c.n === 9) || { groupes: [] }).groupes.find((g) => /^Phyllo/.test(g.nom));
    return ph ? ph.code : "";
  }

  // ── vignette ────────────────────────────────────────────────────────────
  const PAR_CLE = {};   // cle → élément (titres Wikipédia, pour le chargement de la photo)
  let avecCode = false;
  function carte(el) {
    PAR_CLE[el.cle] = el;
    const code = avecCode ? codeDe(el) : "";
    const f = el.formule.length > 30 ? el.formule.slice(0, 28) + "…" : el.formule;
    return `<button type="button" class="minv-carte" ${el.attr} style="--sw:${el.sw}">
      <span class="minv-img" data-minv-img="${esc(el.cle)}" aria-hidden="true"></span>${code ? `<span class="minv-code" title="Classe de Strunz">${code}</span>` : ""}
      <span class="minv-nom">${el.nom}${el.tag ? `<span class="min-tag">${el.tag}</span>` : ""}</span>
      ${f ? `<small class="minv-f">${f}</small>` : ""}
    </button>`;
  }
  const grille = (els) => `<div class="minv-grille">${els.map(carte).join("")}</div>`;

  // ── jauges sur une échelle commune à tous les groupes ─────────────────────
  const ECHELLES = {
    durete: { nom: "Dureté", unite: "(Mohs)", min: 1, max: 10, ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], n: 2 },
    stabilite: { nom: "Altérabilité", unite: "/ 10", min: 1, max: 10, ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], n: 1,
      bouts: "1 = s'altère vite, 10 = inaltérable" },
    densite: { nom: "Masse volumique", unite: "g/cm³", min: 0.8, max: 22, ticks: [1, 2, 3, 5, 10, 20], n: 2, log: true },
  };
  let nJauge = 0;
  function jauge(k, els, coul) {
    const E = ECHELLES[k];
    const pos = E.log
      ? (x) => Math.max(0, Math.min(100, (Math.log(x) - Math.log(E.min)) / (Math.log(E.max) - Math.log(E.min)) * 100))
      : (x) => Math.max(0, Math.min(100, (x - E.min) / (E.max - E.min) * 100));
    const pts = els.filter((e) => e[k] != null);
    if (!pts.length) return `<div class="argv-j"><span class="argv-j-nom">${E.nom}</span>
      <span class="argv-j-piste argv-j-vide"></span><span class="argv-j-val">non renseignée</span></div>`;
    const a = Math.min(...pts.map((e) => e[k])), b = Math.max(...pts.map((e) => e[k]));
    const val = a === b ? fr(a, E.n) : `${fr(a, E.n)} – ${fr(b, E.n)}`;
    const cle = `minv-${++nJauge}:${k}`;
    const lignes = els.map((e, i) => `<li data-e="${i}"><b>${esc(e.nom)}</b> ${e[k] != null ? fr(e[k], E.n) : "<i>pas de mesure</i>"}</li>`).join("");
    ArgilesVue.BULLES[cle] = `<p class="argv-b-t">${E.nom} de ce groupe : <b>${val} ${E.unite}</b></p>
      <p class="argv-b-n">Échelle commune à tous les groupes : ${fr(E.min)} à ${fr(E.max)} ${E.unite}${E.log ? ", logarithmique" : ""}.${E.bouts ? ` ${E.bouts}.` : ""}</p>
      <ul>${lignes}</ul>`;
    return `<div class="argv-j" data-bulle="${cle}">
      <span class="argv-j-nom">${E.nom}</span>
      <span class="argv-j-piste" role="img" aria-label="${E.nom} : ${val} ${E.unite}">
        ${E.ticks.map((t) => `<i style="left:${pos(t)}%"></i>`).join("")}
        <span class="argv-j-plage" style="left:${pos(a)}%;width:${Math.max(1.2, pos(b) - pos(a))}%;background:${coul}"></span>
        ${els.map((e, i) => e[k] != null ? `<b class="argv-j-pt" data-e="${i}" style="left:${pos(e[k])}%"></b>` : "").join("")}
      </span>
      <span class="argv-j-val"><b>${val}</b> ${E.unite}<small>ce groupe</small></span>
    </div>`;
  }
  const jauges = (els, coul) => els.some((e) => e.durete != null || e.densite != null)
    ? `<div class="argv-carac">${["durete", "stabilite", "densite"].map((k) => jauge(k, els, coul)).join("")}</div>` : "";

  // ── panneau d'un groupe ─────────────────────────────────────────────────
  let nInfo = 0;
  function panneau({ id, code, nom, info, corps, els, coul }) {
    const i = ++nInfo;
    return `<section class="card argv-grp minv-grp"${id ? ` id="${id}"` : ""} style="--argv-c:${coul}">
      <header class="argv-tete">
        ${code ? `<span class="strunz-code">${code}</span>` : `<span class="sw-big" style="background:${coul}"></span>`}
        <h3>${nom}</h3>
        <span class="badge outline">${els.length} espèce${els.length > 1 ? "s" : ""}</span>
        ${info ? `<button type="button" class="argv-info" aria-expanded="false" aria-controls="minv-info-${i}">Ce qui fait ce groupe</button>` : ""}
      </header>
      ${info ? `<div class="argv-info-txt" id="minv-info-${i}" hidden>${info}</div>` : ""}
      ${corps}
      ${jauges(els, coul)}
    </section>`;
  }
  const couleurDe = (els) => (els.find((e) => e.sw) || {}).sw || "var(--baseline)";

  // ── vue Strunz (tous les minéraux, ou seulement ceux du sol) ───────────────
  function vueStrunz(filtre) {
    return [...MIN_CLASSIF].sort((a, b) => a.n - b.n).map((c) => {
      let nEsp = 0;
      const groupes = c.groupes.map((g, gi) => {
        const id = `mingrp-${c.n}-${gi}`;
        const info = `${g.motif ? `<p><b>${g.motif}</b></p>` : ""}<p>${g.note || ""}</p>
          ${g.lien ? `<button class="min-chip" data-gopage="${g.lien.hash.slice(1)}">${g.lien.label}</button>` : ""}`;
        if (g.dynamique === "oxydes") {
          // oxydes rangés par élément (comme #oxydes) : un panneau par élément, l'ancre du groupe les enveloppe
          const panneaux = OXYDES.map((f) => {
            const els = elementsDe(filtre(f.especes.map((e) => e.id)));
            if (!els.length) return "";
            nEsp += els.length;
            return panneau({ nom: `${f.element} <span class="badge outline">${f.symbole}</span>`, els, coul: couleurDe(els),
              info: `<button class="min-chip" data-gopage="oxyde/${f.id}">Onglet ${f.element} : diagramme pH–Eh →</button>`,
              corps: grille(els) });
          }).join("");
          return panneaux ? `<div id="${id}" class="minv-ancre">${panneaux}</div>` : "";
        }
        let corps = "", tous = [], section = "";
        if (g.sousGroupes) {
          g.sousGroupes.forEach((sf) => {
            const els = elementsDe(filtre(sf.mineraux));
            if (!els.length) return;
            if (sf.section && sf.section !== section) { section = sf.section; corps += `<p class="minv-section">${section}</p>`; }
            corps += `<p class="min-sf">${sf.nom}</p>${grille(els)}`;
            tous = tous.concat(els);
          });
        } else {
          tous = elementsDe(filtre(g.mineraux));
          corps = grille(tous);
        }
        if (!tous.length) return "";
        nEsp += tous.length;
        return panneau({ id, code: g.code, nom: g.nom, info, corps, els: tous, coul: couleurDe(tous) });
      }).join("");
      if (!groupes) return "";
      const nGr = (groupes.match(/class="card argv-grp/g) || []).length;
      const plus = (c.encarts || []).map((e) => `<h3>${e.titre}</h3>${e.html}`).join("") + (c.plus || "")
        + (c.sources ? `<p class="page-source"><b>Sources</b> — ${c.sources.join(" ; ")}</p>` : "");
      return `<section class="argv-fam minv-cls" id="mincls-${c.n}">
        <h2><span class="num">${c.num}</span>${c.icone} ${c.classe}
          <span class="badge outline">${nGr} groupe${nGr > 1 ? "s" : ""} · ${nEsp} espèce${nEsp > 1 ? "s" : ""}</span>
          ${c.achever ? `<span class="badge" style="background:var(--prod-sable)">🚧 à compléter</span>` : ""}</h2>
        <p class="sub argv-fam-desc">${c.desc}</p>
        ${groupes}
        ${plus ? `<details class="pl-pli min-plus card"><summary>Pour aller plus loin : ${c.classe.toLowerCase()}</summary>${plus}</details>` : ""}
      </section>`;
    }).join("");
  }

  // ── vue « rôle dans le sol » (MIN_SOL) : groupes du sol, puis classe de Strunz de chaque minéral ──────────
  function vueRole() {
    return MIN_SOL.map((g) => {
      const sous = g.sous || [{ nom: g.nom, mineraux: g.mineraux }];
      const panneaux = sous.map((s, si) => {
        const els = elementsDe(s.mineraux);
        if (!els.length) return "";
        return panneau({ id: g.sous ? `minsol-${g.id}-${si}` : "", nom: s.nom, els, coul: g.swatch, corps: grille(els) });
      }).join("");
      const nEsp = sous.reduce((n, s) => n + elementsDe(s.mineraux).length, 0);
      return `<section class="argv-fam minv-cls" id="minsol-${g.id}" style="--minv-sol:${g.swatch}">
        <h2><span class="num">${g.court}</span>${g.nom}
          <span class="badge outline">${nEsp} espèce${nEsp > 1 ? "s" : ""}</span></h2>
        <p class="sub argv-fam-desc">${g.note}</p>
        ${panneaux}
      </section>`;
    }).join("");
  }

  // ── page ────────────────────────────────────────────────────────────────
  function html(vue) {
    nJauge = 0; nInfo = 0; avecCode = vue === "role";
    Object.keys(ArgilesVue.BULLES).forEach((k) => { if (k.startsWith("minv-")) delete ArgilesVue.BULLES[k]; });
    const vues = `<div class="minv-vues" role="group" aria-label="Classement">${MIN_VUES.map(([k, nom]) =>
      `<button type="button" data-minvue="${k}" aria-pressed="${k === vue}">${nom}</button>`).join("")}</div>`;
    const classes = [...MIN_CLASSIF].sort((a, b) => a.n - b.n);
    const sommaire = vue === "role"
      ? MIN_SOL.map((g) => `<button class="min-chip" data-minsol="${g.id}"><span class="sw" style="background:${g.swatch}"></span>${g.court}. ${g.nom}</button>`).join("")
      : classes.filter((c) => vue !== "sol" || c.groupes.flatMap(groupeIds).some((id) => MIN_SOL_IDS.has(id)))
        .map((c) => `<button class="min-chip" data-mincls="${c.n}"><b>${c.num}</b> ${c.classe}</button>`).join("");
    const corps = vue === "role" ? vueRole() : vueStrunz(vue === "sol" ? (ids) => ids.filter((id) => MIN_SOL_IDS.has(id)) : (ids) => ids);
    return `<div class="argv minv" data-minv>
    <div class="card hero">
      <h1>${vue === "tous" ? "Les minéraux" : "Les minéraux du sol"}</h1>
      <p class="sub argv-intro">La <b>brique</b> des roches : une composition chimique et une structure cristalline précises
        (le quartz, <code>SiO₂</code> ; la calcite, <code>CaCO₃</code>). Le granite, lui, est un mur : quartz + feldspath + mica.</p>
      ${vues}
      <div class="min-chips argv-sommaire">${sommaire}</div>
      <details class="cmp-puce"><summary>${vue === "role" ? "Comment lire ce classement" : "Comment lire la classification"}</summary>
        ${vue === "role"
          ? `<p>Les minéraux réellement présents dans les sols de France et actifs dans leur formation, rangés par rôle :
            ce que le sol hérite de la roche, ce qu'il fabrique. <b>Néoformé</b> : cristallisé dans le sol à partir des ions de
            sa solution, et non hérité de la roche.</p>`
          : `<p class="crumb">Classe de <b>Strunz</b> (I → X, selon l'anion) <span>→</span> groupe (selon la structure)
            <span>→</span> sous-famille <span>→</span> espèce.</p>
            <p>La classification de Strunz est la référence actuelle (IMA, Mindat). Les <b>silicates (IX)</b> forment à eux seuls
            ~92 % de la croûte terrestre.${vue === "sol" ? " Ici, seuls les minéraux principaux des sols." : ""}</p>`}
      </details>
    </div>
    ${corps}
    ${vue === "role" ? "" : `<div class="card">
      <h2>Pour aller plus loin : pourquoi classer par la structure ?</h2>
      <p>On pourrait ranger les minéraux par couleur ou par dureté, mais les minéralogistes ont choisi la <b>chimie</b> puis
      la <b>structure atomique</b>, parce que c'est elle qui commande presque tout le reste. Dans les <b>silicates</b> — 92 %
      du volume de la croûte terrestre — la brique de base est toujours la même : le tétraèdre <code>SiO₄</code>. Ce qui change,
      c'est la façon dont ces tétraèdres se relient.</p>
      <p>Isolés, ils donnent des minéraux compacts et denses (<b>nésosilicates</b> : olivine, grenat, zircon). Reliés en
      <b>chaînes</b>, ils font les minéraux sombres des roches volcaniques (pyroxènes, amphiboles). Empilés en <b>feuillets</b>,
      ils donnent tout ce qui se clive en lamelles : les <b>micas</b> et, en plus petit et un peu dégradé, les <b>argiles</b>.
      Reliés en <b>charpente 3D</b>, ils forment les minéraux les plus abondants et les plus durables : le <b>quartz</b> et les
      <b>feldspaths</b>.</p>
      <p>Cette logique a une conséquence directe pour l'altération : plus les tétraèdres sont connectés, plus le minéral résiste
      (c'est la « série de Goldich »). L'olivine, faite de briques isolées, se défait la première ; le quartz, charpente
      complète, traverse les âges et finit en sable. Les autres classes (carbonates, oxydes, sulfates, sulfures…) se rangent,
      elles, par leur <b>anion</b> — le groupement chimique qui les définit (CO₃, O, SO₄, S…).</p>
    </div>`}
    <details class="card cmp-puce argv-sources" data-minv-credits><summary>Crédits des photos</summary>
      <p>Photos de Wikimedia Commons (vignettes des articles de Wikipédia), sous licence libre. Sans photo : la forme du cristal,
      calculée (même dessin que sur la fiche).</p>
      <ul><li>Les photos affichées jusqu'ici apparaissent dans cette liste.</li></ul></details>
    </div>`;
  }

  // ── photos : chargées quand la vignette arrive à l'écran, six à la fois, gardées en mémoire ─────────────
  let CACHE = {};
  try { CACHE = JSON.parse(localStorage.getItem("atlas-photos-min") || "{}"); } catch (e) { CACHE = {}; }
  const garder = () => { try { localStorage.setItem("atlas-photos-min", JSON.stringify(CACHE)); } catch (e) { /* stockage indisponible */ } };
  const enCours = {};
  function photo(el) {
    if (CACHE[el.cle] !== undefined) return Promise.resolve(CACHE[el.cle]);
    if (enCours[el.cle]) return enCours[el.cle];
    enCours[el.cle] = (async () => {
      let reponse = false;   // false = aucune réponse (hors connexion) : on ne retient rien
      for (const t of el.titres) {
        try {
          const r = await fetch("https://fr.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(t));
          reponse = true;
          if (!r.ok) continue;
          const j = await r.json();
          if (j.thumbnail && j.thumbnail.source) { CACHE[el.cle] = j.thumbnail.source; garder(); return j.thumbnail.source; }
        } catch (e) { /* hors connexion */ }
      }
      if (reponse) { CACHE[el.cle] = ""; garder(); }
      return "";
    })();
    return enCours[el.cle];
  }
  const file = [];
  let actifs = 0;
  function suivant() {
    while (actifs < 6 && file.length) {
      const slot = file.shift();
      if (!slot.isConnected) continue;
      actifs++;
      remplir(slot).finally(() => { actifs--; suivant(); });
    }
  }
  function secours(slot, el) {
    const svg = el.id && window.Cristal && Cristal.existe(el.id) && Cristal.svg ? Cristal.svg(el.id, 0) : "";
    if (svg) { slot.innerHTML = svg; slot.classList.add("minv-cx"); }
    slot.classList.add("minv-fait");
  }
  async function remplir(slot) {
    const el = PAR_CLE[slot.dataset.minvImg];
    if (!el) return;
    const src = await photo(el);
    if (!slot.isConnected) return;
    if (!src) { secours(slot, el); return; }
    const im = new Image();
    im.alt = el.nom;
    im.decoding = "async";
    await new Promise((res) => { im.onload = res; im.onerror = res; im.src = src; });
    if (!slot.isConnected) return;
    if (!im.naturalWidth) { secours(slot, el); return; }
    slot.innerHTML = "";
    slot.appendChild(im);
    slot.classList.add("minv-fait", "minv-photo");
  }
  let obs = null;
  function brancher(racine) {
    const slots = racine.querySelectorAll("[data-minv-img]:not(.minv-fait)");
    if (!window.IntersectionObserver) { slots.forEach((s) => file.push(s)); suivant(); return; }
    if (obs) obs.disconnect();
    file.length = 0;
    obs = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        // déjà connue : tout de suite, sans attendre la file
        const el = PAR_CLE[en.target.dataset.minvImg];
        if (el && CACHE[el.cle] !== undefined) remplir(en.target); else file.push(en.target);
      });
      suivant();
    }, { rootMargin: "300px 0px" });
    slots.forEach((s) => obs.observe(s));
  }

  // contrôle : chaque élément de la vue existe et a ses trois grandeurs ; attendu { manquants: [], sansDurete: […] }
  function controle() {
    const ids = [...new Set(MIN_CLASSIF.flatMap((c) => c.groupes.flatMap(groupeIds)))];
    const manquants = ids.filter((id) => !MINERAUX[id]).concat(MIN_SOL.flatMap((g) => (g.sous || [g]).flatMap((s) => s.mineraux))
      .filter((e) => !element(e)).map((e) => e.id || e));
    return { especes: ids.length, manquants, sansDurete: ids.filter((id) => MINERAUX[id] && typeof MINERAUX[id].durete !== "number").length,
      sansDensite: ids.filter((id) => MINERAUX[id] && typeof MINERAUX[id].densite !== "number").length };
  }

  // ── gestes ──────────────────────────────────────────────────────────────
  document.addEventListener("toggle", (e) => {
    const d = e.target;
    if (!d.matches || !d.matches("[data-minv-credits]") || !d.open) return;
    const vus = [...document.querySelectorAll("[data-minv] .minv-photo")].map((s) => PAR_CLE[s.dataset.minvImg]).filter(Boolean);
    const ul = d.querySelector("ul");
    if (!vus.length) { ul.innerHTML = "<li>Aucune photo affichée pour l'instant.</li>"; return; }
    ul.innerHTML = vus.map((el, i) => `<li data-i="${i}"><b>${esc(el.nom)}</b> — …</li>`).join("");
    vus.forEach((el, i) => legendePhoto(CACHE[el.cle]).then((cap) => {
      const li = ul.querySelector(`li[data-i="${i}"]`);
      if (li) li.innerHTML = `<b>${esc(el.nom)}</b> — ${cap}`;
    }));
  }, true);

  window.MinerauxVue = { html, brancher, controle, element };
})();
