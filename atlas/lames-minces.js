/* lames-minces.js — panneau « Lames minces » en bas des fiches roches et minéraux (tâche A.5, 13/10/2026).

   Photos LIBRES seulement : Wikimedia Commons (domaine public, CC0, CC BY, CC BY-SA) et Virtual Microscope de
   l'Open University (CC BY-NC-SA 2.0). Index et vignettes GÉNÉRÉS par tools/lames_commons.py :
     lames.js                 ← window.LAMES_DONNEES (photos + rattachement aux fiches)
     lames/vignettes/<k>.webp ← vignette de 400 px, dans l'atlas (le panneau marche hors connexion)
   La GRANDE vue de la visionneuse est chargée depuis la source (Commons ≤ 1 920 px, Virtual Microscope ≈ 600 px) :
   elle ne pèse rien dans l'atlas. Hors connexion, la visionneuse garde la vignette agrandie.

   API : LamesMinces.carte("roche" | "mineral", id) → HTML de la carte ("" si aucune photo) ;
         LamesMinces.n(type, id) → nombre de photos ; LamesMinces.premiere(type, id) → { vignette, grande, credit } | null. */
(function () {
  "use strict";
  const D = window.LAMES_DONNEES || { photos: {}, fiches: { roche: {}, mineral: {} } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const LUM = {
    LPNA: "lumière polarisée non analysée (lumière naturelle)",
    LPA: "lumière polarisée analysée, nicols croisés",
    "réfléchie": "lumière réfléchie",
  };

  const nomRoche = (id) => { const r = (window.ROCHES || (typeof ROCHES !== "undefined" ? ROCHES : [])).find((x) => x.id === id); return r ? r.nom : id; };
  const nomMin = (id) => { const M = typeof MINERAUX !== "undefined" ? MINERAUX : {}; return M[id] ? M[id].nom.split(" (")[0] : id; };
  const nomFiche = (t, id) => (t === "r" ? nomRoche(id) : nomMin(id));

  // photos d'une fiche, dans l'ordre choisi par l'outil ; chaque entrée = [clé, rôle] (rôle « s » = sujet, « c » = cité)
  function photos(type, id) {
    const l = (D.fiches[type] || {})[id] || [];
    return l.map(([k, role]) => ({ k, role, ...D.photos[k] })).filter((p) => p.f);
  }

  // légende en français, construite à partir des données (les descriptions des fichiers sont en anglais) :
  // « Biotite (lame de gneiss) » sur une fiche minéral, « Basalte (enstatite) » sur une fiche roche
  const court = (n) => n.split(" (")[0].split(" /")[0].split(" &")[0].toLowerCase();
  const de = (n) => (/^[aeiouyéèêh]/i.test(n) ? "d'" : "de ") + n;
  function legende(p, type, id) {
    let sujet;
    if (type === "mineral") sujet = nomMin(id) + (p.r ? ` (lame ${de(court(nomRoche(p.r)))})` : "");
    else {
      const mt = (p.mt || []).map((m) => court(nomMin(m)));
      sujet = nomRoche(id) + (mt.length ? ` (${mt.slice(0, 2).join(", ")})` : "");
    }
    if (p.ech) sujet += ` — ${p.ech}`;
    return [sujet, p.lum, p.gx].filter(Boolean).join(" · ");
  }
  const cites = (p, type, id) => (p.m || []).filter((m) => !(type === "mineral" && m === id)).map(nomMin);

  function credit(p) {
    return `Photo : ${esc(p.a || "auteur non indiqué")} · ${p.lu ? `<a href="${esc(p.lu)}" target="_blank" rel="noopener">${esc(p.l)}</a>` : esc(p.l)}`
      + ` · <a href="${esc(p.p)}" target="_blank" rel="noopener">${p.src === "vm" ? "Virtual Microscope" : "Wikimedia Commons"} ↗</a>`;
  }

  function corps(type, id) {
    const l = photos(type, id);
    const vig = l.map((p, i) => `<button type="button" class="lx-vig" data-lx-i="${i}" aria-label="${esc(legende(p, type, id))}">
        <img src="${esc(p.f)}" alt="" loading="lazy">${p.lum ? `<span class="lx-lum">${p.lum}</span>` : ""}</button>`).join("");
    const sources = [...new Set(l.map((p) => p.src))];
    return `<h2>Lames minces</h2>
      <p class="sub">${type === "roche" ? "La roche" : "Le minéral"} vu${type === "roche" ? "e" : ""} au microscope, en tranche de 30 µm.
        LPNA : lumière naturelle ; LPA : entre nicols croisés, les couleurs y dépendent de l'orientation des cristaux.</p>
      <div class="lx-grille">${vig}</div>
      <details class="lx-credits"><summary>Crédits des photos (${l.length})</summary><ol>
        ${l.map((p) => `<li>${credit(p)}</li>`).join("")}</ol>
        <p>${sources.includes("commons") ? "Wikimedia Commons : licences libres, auteur et licence de chaque photo ci-dessus. " : ""}${sources.includes("vm") ? "Virtual Microscope (The Open University) : CC BY-NC-SA 2.0. " : ""}Vignettes réduites par l'atlas ; la grande vue est chargée depuis la source.</p></details>`;
  }

  // ---------------------------------------------------------------- visionneuse
  let V = null; // { el, type, id, liste, k }
  function montrer(type, id, k) {
    const liste = photos(type, id);
    if (!liste.length) return;
    if (!V) {
      const el = document.createElement("div");
      el.className = "lx-vue";
      el.innerHTML = `<div class="lx-vue-fond" data-lx-fermer></div>
        <figure class="lx-vue-cadre" role="dialog" aria-modal="true" aria-label="Lame mince">
          <button type="button" class="lx-vue-x" data-lx-fermer aria-label="Fermer">✕</button>
          <button type="button" class="lx-vue-nav lx-prec" data-lx-aller="-1" aria-label="Photo précédente">‹</button>
          <div class="lx-vue-img"><img alt=""><span class="lx-vue-attente" hidden></span></div>
          <button type="button" class="lx-vue-nav lx-suiv" data-lx-aller="1" aria-label="Photo suivante">›</button>
          <figcaption></figcaption></figure>`;
      document.body.appendChild(el);
      V = { el };
    }
    Object.assign(V, { type, id, liste, k: (k + liste.length) % liste.length });
    const p = liste[V.k];
    const img = V.el.querySelector(".lx-vue-img img"), att = V.el.querySelector(".lx-vue-attente");
    // la vignette d'abord (immédiate, hors connexion aussi), puis la grande vue quand elle est arrivée
    img.src = p.f;
    att.hidden = false; att.textContent = "Chargement de la grande vue…";
    const jeton = (V.jeton = {});
    const grand = new Image();
    grand.onload = () => { if (V.jeton === jeton) { img.src = p.g; att.hidden = true; } };
    grand.onerror = () => { if (V.jeton === jeton) att.textContent = "Grande vue indisponible (hors connexion ?) : vignette agrandie."; };
    grand.src = p.g;
    const j = p.paire ? liste.findIndex((x) => x.k === p.paire) : -1;
    const c = cites(p, type, id);
    V.el.querySelector("figcaption").innerHTML = `<p class="lx-vue-leg">${esc(legende(p, type, id))}</p>
      <p class="lx-vue-meta">${p.lum ? `<b>${p.lum}</b> : ${LUM[p.lum]}` : "Lumière non précisée par l'auteur"}
        ${j >= 0 ? ` · <button type="button" class="lx-puce" data-lx-aller-a="${j}">Même vue en ${esc(liste[j].lum)}</button>` : ""}</p>
      ${c.length ? `<p class="lx-vue-meta">Minéraux nommés par l'auteur : ${c.map(esc).join(", ")}.</p>` : ""}
      <p class="lx-vue-meta">${V.k + 1} / ${liste.length} · ${credit(p)}</p>`;
    V.el.classList.add("on");
    document.documentElement.classList.add("lx-bloque");
  }
  function fermer() {
    if (!V) return;
    V.el.classList.remove("on");
    document.documentElement.classList.remove("lx-bloque");
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-lx-i],[data-lx-fermer],[data-lx-aller],[data-lx-aller-a]");
    if (!t) return;
    if (t.closest(".lx-vue")) {
      if (t.hasAttribute("data-lx-fermer")) fermer();
      else if (t.hasAttribute("data-lx-aller")) montrer(V.type, V.id, V.k + Number(t.dataset.lxAller));
      else if (t.hasAttribute("data-lx-aller-a")) montrer(V.type, V.id, Number(t.dataset.lxAllerA));
      return;
    }
    const carte = t.closest(".lames-minces[data-lx]");
    if (!carte) return;
    const [type, id] = carte.dataset.lx.split(":");
    montrer(type, id, Number(t.dataset.lxI));
  });
  document.addEventListener("keydown", (e) => {
    if (!V || !V.el.classList.contains("on")) return;
    if (e.key === "Escape") { fermer(); e.stopPropagation(); }
    else if (e.key === "ArrowRight") montrer(V.type, V.id, V.k + 1);
    else if (e.key === "ArrowLeft") montrer(V.type, V.id, V.k - 1);
  }, true);
  // changer de page ferme la visionneuse
  window.addEventListener("hashchange", fermer);

  window.LamesMinces = {
    carte(type, id) {
      if (!photos(type, id).length) return "";
      return `<div class="card lames-minces" data-lx="${type}:${esc(id)}">${corps(type, id)}</div>`;
    },
    n: (type, id) => photos(type, id).length,
    premiere(type, id) {
      const p = photos(type, id).find((x) => x.role !== "c");
      return p ? { vignette: p.f, grande: p.g, page: p.p, credit: credit(p) } : null;
    },
    controle() {
      // attendu : [] (chaque fiche citée existe, chaque photo a vignette, grande vue, page, licence)
      const pb = [];
      const R = typeof ROCHES !== "undefined" ? ROCHES : [], M = typeof MINERAUX !== "undefined" ? MINERAUX : {};
      for (const [type, table] of Object.entries(D.fiches)) {
        for (const [id, l] of Object.entries(table)) {
          if (type === "roche" ? !R.some((r) => r.id === id) : !M[id]) pb.push(`fiche absente : ${type} ${id}`);
          if (l.length > 6) pb.push(`plus de 6 photos : ${type} ${id}`);
          for (const [k] of l) if (!D.photos[k]) pb.push(`photo inconnue ${k} (${type} ${id})`);
        }
      }
      for (const [k, p] of Object.entries(D.photos)) {
        for (const c of ["f", "g", "p", "l", "src"]) if (!p[c]) pb.push(`${k} : champ ${c} vide`);
        if (p.paire && !D.photos[p.paire]) pb.push(`${k} : paire ${p.paire} absente`);
      }
      return pb;
    },
  };
})();
