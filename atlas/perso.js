/* perso.js — couche PERSONNELLE de l'atlas : photos de lames minces (10/10/2026).

   Les photos et leur index vivent dans perso/ (dossier de travail seulement) :
     perso/lames/index.js            ← GÉNÉRÉ par tools/lames_strekeisen.py (window.LAMES_PERSO_DONNEES)
     perso/lames/strekeisen/…        ← photos d'Alex Strekeisen (tous droits réservés : voir tools/lames_strekeisen.py), vignettes dans vignettes/
   Rien n'est chargé si window.ATLAS_PERSO n'est pas vrai (edition.js) : les paquets et le site en ligne
   l'ont à false et n'ont pas le dossier perso/.

   API : LamesPerso.carte("roche" | "mineral", id) → HTML d'une carte (vide si rien), remplie dès que l'index
   arrive ; LamesPerso.n(type, id) → nombre de photos. Tout le reste (filtres, visionneuse) passe par un
   écouteur de clic posé une fois sur le document. */
(function () {
  "use strict";
  const ACTIF = window.ATLAS_PERSO === true;
  const PREMIERES = 12; // vignettes montrées avant « Afficher les autres »
  let D = null; // window.LAMES_PERSO_DONNEES une fois chargé

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const LUM = { LPNA: "lumière polarisée non analysée (PPL)", LPA: "lumière polarisée analysée, nicols croisés (XPL)", "réfléchie": "lumière réfléchie" };

  // photos d'une fiche, page la plus générale d'abord (titre le plus court : « Granite » avant « Alkali Feldspar Granite »)
  function photos(type, id) {
    const l = D && D.fiches[type] && D.fiches[type][id];
    if (!l || !l.length) return [];
    const ordre = {};
    l.forEach((p) => { if (!(p.p in ordre)) ordre[p.p] = (D.pages[p.p] || p.p).length; });
    return l.map((p, i) => ({ ...p, i })).sort((a, b) => ordre[a.p] - ordre[b.p] || a.i - b.i);
  }

  // la même vue dans l'autre lumière : photo VOISINE (le site les range par paires LPNA puis LPA), même page,
  // même grossissement, même champ (les légendes d'une paire diffèrent souvent : « Garnet (isotropic)… »)
  const gross = (l) => (l.match(/\b(\d+(?:[.,]\d+)?)\s?x\b/i) || [])[1] || "";
  function paire(liste, k) {
    const a = liste[k];
    if (!a.lum || a.lum === "réfléchie") return -1;
    for (const j of [k + 1, k - 1]) {
      const b = liste[j];
      if (b && b.p === a.p && b.lum && b.lum !== a.lum && b.lum !== "réfléchie" && b.champ === a.champ && gross(b.l) === gross(a.l)) return j;
    }
    return -1;
  }

  function vignette(p, k) {
    return `<button type="button" class="lm-vig" data-lm-k="${k}" title="${esc(D.pages[p.p] || "")}">
      <img src="${D.source.dossier}vignettes/${encodeURI(p.f)}" alt="" loading="lazy">
      ${p.lum ? `<span class="lm-lum">${p.lum}</span>` : ""}</button>`;
  }

  function corps(el) {
    const [type, id] = el.dataset.lames.split(":");
    const tout = photos(type, id);
    const filtre = el._filtre || { page: "", lum: "" };
    const liste = tout.filter((p) => (!filtre.page || p.p === filtre.page) && (!filtre.lum || p.lum === filtre.lum));
    el._liste = liste;
    const pages = [];
    tout.forEach((p) => { if (!pages.some((x) => x[0] === p.p)) pages.push([p.p, 0]); pages.find((x) => x[0] === p.p)[1]++; });
    const lums = ["LPNA", "LPA"].filter((l) => tout.some((p) => p.lum === l));
    const ouvert = el._ouvert || liste.length <= PREMIERES + 4;
    const vus = ouvert ? liste : liste.slice(0, PREMIERES);
    const puce = (attr, val, txt, on) => `<button type="button" class="lm-puce${on ? " on" : ""}" ${attr}="${esc(val)}">${txt}</button>`;
    return `<div class="lm-tete"><h2>Lames minces</h2><span class="lm-tag" title="Couche personnelle : n'est ni dans les paquets ni en ligne">perso</span>
        <span class="lm-n">${tout.length} photo${tout.length > 1 ? "s" : ""}</span></div>
      ${pages.length > 1 ? `<div class="lm-filtres">${puce("data-lm-page", "", "Toutes", !filtre.page)}${pages.map(([k, n]) => puce("data-lm-page", k, `${esc(D.pages[k] || k)} <i>${n}</i>`, filtre.page === k)).join("")}</div>` : ""}
      ${lums.length > 1 ? `<div class="lm-filtres">${puce("data-lm-lum", "", "Les deux lumières", !filtre.lum)}${lums.map((l) => puce("data-lm-lum", l, l, filtre.lum === l)).join("")}</div>` : ""}
      <div class="lm-grille">${vus.map((p, k) => vignette(p, k)).join("")}</div>
      ${vus.length < liste.length ? `<button type="button" class="lm-plus" data-lm-plus>Afficher les ${liste.length - vus.length} autres</button>` : ""}
      <p class="lm-credit">LPNA : lumière polarisée non analysée · LPA : nicols croisés. Photos : Alessandro Da Mommio,
        <a href="${D.source.site}" target="_blank" rel="noopener">alexstrekeisen.it</a> ·
        <a href="${D.source.licenceUrl}" target="_blank" rel="noopener">${D.source.licence}</a>.</p>`;
  }

  function remplir(racine) {
    if (!D) return;
    (racine || document).querySelectorAll(".lames-carte[data-lames]").forEach((el) => {
      const [type, id] = el.dataset.lames.split(":");
      if (!photos(type, id).length) { el.remove(); return; }
      el.innerHTML = corps(el);
      el.hidden = false;
    });
  }

  // ---------------------------------------------------------------- visionneuse
  let V = null; // { el, liste, k }
  function montrer(liste, k) {
    if (!V) {
      const el = document.createElement("div");
      el.className = "lm-vue";
      el.innerHTML = `<div class="lm-vue-fond" data-lm-fermer></div>
        <figure class="lm-vue-cadre"><button type="button" class="lm-vue-x" data-lm-fermer aria-label="Fermer">✕</button>
          <button type="button" class="lm-vue-nav lm-prec" data-lm-aller="-1" aria-label="Photo précédente">‹</button>
          <img alt=""><button type="button" class="lm-vue-nav lm-suiv" data-lm-aller="1" aria-label="Photo suivante">›</button>
          <figcaption></figcaption></figure>`;
      document.body.appendChild(el);
      V = { el };
    }
    V.liste = liste; V.k = (k + liste.length) % liste.length;
    const p = liste[V.k], j = paire(liste, V.k);
    V.el.querySelector("img").src = D.source.dossier + encodeURI(p.f);
    V.el.querySelector("figcaption").innerHTML = `<p class="lm-vue-leg">${esc(p.l)}</p>
      <p class="lm-vue-meta">${p.lum ? `<b>${p.lum}</b> (${LUM[p.lum]})` : ""}${p.champ ? ` · champ ${esc(p.champ)}` : ""}
        ${j >= 0 ? ` · <button type="button" class="lm-puce" data-lm-aller-a="${j}">Même vue en ${liste[j].lum}</button>` : ""}</p>
      <p class="lm-vue-meta">${V.k + 1} / ${liste.length} · <a href="${D.source.site.replace(/\/english\/$/, "")}/english/${esc(p.p)}.php" target="_blank" rel="noopener">${esc(D.pages[p.p] || p.p)} ↗</a>
        · Photo : Alessandro Da Mommio · <a href="${D.source.licenceUrl}" target="_blank" rel="noopener">${D.source.licence}</a></p>`;
    V.el.classList.add("on");
    document.documentElement.classList.add("lm-bloque");
  }
  function fermer() {
    if (!V) return;
    V.el.classList.remove("on");
    document.documentElement.classList.remove("lm-bloque");
  }

  if (ACTIF) {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-lm-k],[data-lm-page],[data-lm-lum],[data-lm-plus],[data-lm-fermer],[data-lm-aller],[data-lm-aller-a]");
      if (!t) return;
      if (t.closest(".lm-vue")) {
        if (t.hasAttribute("data-lm-fermer")) fermer();
        else if (t.hasAttribute("data-lm-aller")) montrer(V.liste, V.k + Number(t.dataset.lmAller));
        else if (t.hasAttribute("data-lm-aller-a")) montrer(V.liste, Number(t.dataset.lmAllerA));
        return;
      }
      const carte = t.closest(".lames-carte");
      if (!carte) return;
      if (t.hasAttribute("data-lm-k")) return montrer(carte._liste, Number(t.dataset.lmK));
      const f = carte._filtre || (carte._filtre = { page: "", lum: "" });
      if (t.hasAttribute("data-lm-page")) { f.page = t.dataset.lmPage; carte._ouvert = false; }
      if (t.hasAttribute("data-lm-lum")) { f.lum = t.dataset.lmLum; carte._ouvert = false; }
      if (t.hasAttribute("data-lm-plus")) carte._ouvert = true;
      carte.innerHTML = corps(carte);
    });
    document.addEventListener("keydown", (e) => {
      if (!V || !V.el.classList.contains("on")) return;
      if (e.key === "Escape") { fermer(); e.stopPropagation(); }
      else if (e.key === "ArrowRight") montrer(V.liste, V.k + 1);
      else if (e.key === "ArrowLeft") montrer(V.liste, V.k - 1);
    }, true);

    // l'index est injecté (compatible file://, comme geol50 et les structures 3D)
    const s = document.createElement("script");
    s.src = "perso/lames/index.js";
    s.onload = () => { D = window.LAMES_PERSO_DONNEES || null; remplir(); };
    s.onerror = () => document.querySelectorAll(".lames-carte[data-lames]").forEach((el) => el.remove());
    document.head.appendChild(s);
  }

  window.LamesPerso = {
    carte(type, id) {
      if (!ACTIF) return "";
      if (D && !photos(type, id).length) return "";
      const el = `<div class="card lames-carte" data-lames="${type}:${esc(id)}" hidden></div>`;
      if (D) setTimeout(() => remplir(), 0); // rempli juste après l'insertion dans la page
      return el;
    },
    n: (type, id) => photos(type, id).length,
  };
})();
