// ============ Atlas géologique — logique ============
"use strict";

const $ = (sel, root) => (root || document).querySelector(sel);
const NF = new Intl.NumberFormat("fr-FR");
const fmt = (x, sig) => new Intl.NumberFormat("fr-FR", sig ? { maximumSignificantDigits: sig } : {}).format(x);

function fmtRate(v) { return fmt(v, 2); }
function fmtMa(v) {
  if (v === 0) return "aujourd'hui";
  if (v < 1) return fmt(Math.round(v * 1000)) + " 000 ans"; // < 1 Ma : exprimé en milliers d'années
  return fmt(v) + " Ma";
}
function fmtAns(y) {
  if (y < 1e4) return "≈ " + fmt(Math.round(y / 10) * 10) + " ans";
  if (y < 1e6) return "≈ " + fmt(Math.round(y / 1000)) + " 000 ans";
  return "≈ " + fmt(y / 1e6, 2) + " millions d'années";
}
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
const catColor = (cat) => `var(--cat-${cat})`;
const prodColor = (id) => `var(--prod-${id})`;
const geomean = (r) => Math.sqrt(r.alteration.vmin * r.alteration.vmax);
// roches dont la « vitesse » est surtout de l'érosion physique / dissolution au contact de l'eau
const EROSION_IDS = new Set(["marne", "argile", "sable", "loess", "sel", "gypse", "tourbe", "sylvinite", "anhydrite", "vase_tangue"]);

// ---------------- tooltip ----------------
const tip = () => $("#tooltip");
function bindTips(container) {
  container.addEventListener("mousemove", (e) => {
    const t = e.target.closest("[data-tip]");
    const box = tip();
    if (!t) { box.style.display = "none"; return; }
    box.innerHTML = t.dataset.tip;
    box.style.display = "block";
    const bw = box.offsetWidth, bh = box.offsetHeight;
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + bw > innerWidth - 8) x = e.clientX - bw - 14;
    if (y + bh > innerHeight - 8) y = e.clientY - bh - 14;
    box.style.left = x + "px"; box.style.top = y + "px";
  });
  container.addEventListener("mouseleave", () => { tip().style.display = "none"; });
}

// ---------------- état & routage ----------------
const state = { query: "", oxEl: "fer", phehEl: "fe", phehPt: { ph: 6.5, eh: 0.4 }, phehLogA: -6 };
let map = null, geolLayer = null, geol50Layer = null;
const GEOL50_MINZOOM = 10;

function go(id) { location.hash = id ? "roche/" + id : ""; }
window.addEventListener("hashchange", route);

// La navigation est organisée en grandes PARTIES ; on la déduit de l'URL.
function currentSection() {
  const h = location.hash;
  if (h.startsWith("#roche/") || h === "#roches" || h.startsWith("#rocfam/") || h.startsWith("#rocbr/")) return "roches";
  if (h.startsWith("#argile/") || h.startsWith("#espece/") || h.startsWith("#argrp/") || h === "#argiles") return "argiles";
  if (h === "#mineraux" || h.startsWith("#mineral/") || h.startsWith("#mincls/") || h.startsWith("#mingrp/")) return "mineraux";
  if (h === "#oxydes" || h.startsWith("#oxyde/")) return "oxydes";
  if (h === "#amorphes") return "amorphes";
  return "accueil";
}

function route() {
  const mr = location.hash.match(/^#roche\/(.+)$/);
  const ma = location.hash.match(/^#argile\/(.+)$/);
  const mg = location.hash.match(/^#argrp\/(\d+)-(\d+)$/);
  const mc = location.hash.match(/^#mincls\/(\d+)$/);
  const mgr = location.hash.match(/^#mingrp\/(\d+)-(\d+)$/);
  const mm = location.hash.match(/^#mineral\/(.+)$/);
  const minId = mm && MINERAUX[decodeURIComponent(mm[1])] ? decodeURIComponent(mm[1]) : null;
  const me = location.hash.match(/^#espece\/(.+)$/);
  // une espèce fusionnée dans une autre (ESPECES_ALIAS, argiles-especes-valeurs.js) ouvre la fiche qui l'a reçue
  const espId = me ? ((k) => ESPECES[k] ? k
    : typeof ESPECES_ALIAS !== "undefined" && ESPECES[ESPECES_ALIAS[k]] ? ESPECES_ALIAS[k] : null)(decodeURIComponent(me[1])) : null;
  const rock = mr ? ROCHES.find((r) => r.id === decodeURIComponent(mr[1])) : null;
  const arg = ma ? ARGILES.find((a) => a.id === decodeURIComponent(ma[1])) : null;
  const cls = mc ? MIN_CLASSIF.find((c) => c.n === +mc[1]) : null;
  const clsG = mgr ? MIN_CLASSIF.find((c) => c.n === +mgr[1]) : null;
  if (rock) renderRock(rock);
  else if (arg) renderArgile(arg);
  else if (minId) renderMineralPage(minId);
  else if (espId) renderEspecePage(espId);
  else if (mg && CLASSIF[+mg[1]] && CLASSIF[+mg[1]].groupes[+mg[2]]) renderGroupeArgile(+mg[1], +mg[2]);
  else if (clsG && clsG.groupes[+mgr[2]]) renderMineralGroupe(clsG, +mgr[2]);
  else if (cls) renderMineralClasse(cls);
  else if (location.hash === "#roches") renderRoches();
  else if (location.hash.startsWith("#rocfam/") && ROCHES_ARBRE.find((f) => f.id === location.hash.slice(8)))
    renderRocheFamille(ROCHES_ARBRE.find((f) => f.id === location.hash.slice(8)));
  else if (location.hash.startsWith("#rocbr/") && brancheParCode(decodeURIComponent(location.hash.slice(7))))
    renderRocheBranche(brancheParCode(decodeURIComponent(location.hash.slice(7))));
  else if (location.hash === "#argiles") renderClassif();
  else if (location.hash === "#mineraux") renderMineraux();
  else if (location.hash === "#oxydes") renderOxydes();
  else if (location.hash.startsWith("#oxyde/")) renderOxydeElement(decodeURIComponent(location.hash.slice(7)));
  else if (location.hash === "#amorphes") renderAmorphes();
  else renderHub();
  renderSidebar();
  // arrivée depuis « Sa fiche dans la classification » : défiler jusqu'au minéral et le surligner
  const fid = window.__flashMin;
  window.__flashMin = null;
  const cibleFlash = fid ? document.querySelector(`#main [data-min="${fid}"], #main [data-minopen="${fid}"], #main [data-espece="${fid}"], #main [data-espece-bloc="${fid}"]`) : null;
  if (cibleFlash) {
    // getBoundingClientRect force la mise en page ; si elle n'est pas encore disponible
    // (onglet en arrière-plan), on réessaie un peu plus tard
    const placer = (essai) => {
      const r = cibleFlash.getBoundingClientRect();
      if (r.top === 0 && r.bottom === 0 && essai < 6) { setTimeout(() => placer(essai + 1), 150); return; }
      window.scrollTo({ top: Math.max(0, r.top + window.scrollY - window.innerHeight / 2) });
    };
    placer(0);
    cibleFlash.classList.add("flash");
    setTimeout(() => cibleFlash.classList.remove("flash"), 2600);
  } else {
    window.scrollTo({ top: 0 });
  }
}

// ---------------- barre latérale ----------------
function normalize(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

// Regroupement des 7 familles de CLASSIF en « grandes familles » pour le menu des argiles en colonnes
// emboîtées (G.1, même principe que l'arbre des roches B.1 et la charte des temps) : 2:1 dioctaédrique
// et trioctaédrique, dédoublées dans CLASSIF pour la symétrie du tableau, redeviennent une seule bande
// avec deux sous-bandes.
function grandeFamilleArgile(fam) {
  if (fam.famille.startsWith("Argiles 2:1:1")) return "2:1:1";
  if (fam.famille.startsWith("Argiles 2:1")) return "2:1";
  if (fam.famille.startsWith("Argiles 1:1")) return "1:1";
  if (fam.famille.startsWith("Interstratifiés")) return "Interstratifiés";
  if (fam.famille.startsWith("Argiles fibreuses")) return "Fibreuses";
  if (fam.famille.startsWith("Para-cristallins")) return "Para-cristallins";
  return fam.famille;
}
const ARGILE_GRANDES = (() => {
  const grandes = [];
  CLASSIF.forEach((fam) => {
    const nom = grandeFamilleArgile(fam);
    let g = grandes.find((x) => x.nom === nom);
    if (!g) { g = { nom, sousFamilles: [] }; grandes.push(g); }
    g.sousFamilles.push(fam);
  });
  return grandes;
})();

function renderSidebar() {
  const side = $("#sidebar");
  const sec = currentSection();
  // surligne la partie active dans la barre du haut
  document.querySelectorAll("#mainnav .chip").forEach((c) =>
    c.classList.toggle("on", c.dataset.section === sec));

  const current = (location.hash.match(/^#roche\/(.+)$/) || [])[1];
  const currentArg = (location.hash.match(/^#argile\/(.+)$/) || [])[1];
  const currentEsp = decodeURIComponent((location.hash.match(/^#espece\/(.+)$/) || [])[1] || "");
  const q = normalize(state.query);
  let html = "";

  // ---- pendant une recherche : résultats transversaux (roches + minéraux + argiles) ----
  if (q) {
    const rocks = ROCHES.filter((r) => normalize(r.nom).includes(q));
    const args = ARGILES.filter((a) => normalize(a.nom).includes(q));
    const mins = Object.entries(MINERAUX).filter(([, m]) => normalize(m.nom).includes(q)).slice(0, 20);
    if (rocks.length) {
      html += `<div class="side-group"><h3>Roches</h3>` + rocks.map((r) =>
        `<button class="rock-item" data-id="${r.id}"><span class="sw" style="background:${r.swatch}"></span>${r.nom}</button>`).join("") + `</div>`;
    }
    if (mins.length) {
      html += `<div class="side-group"><h3>Minéraux</h3>` + mins.map(([mid, m]) =>
        `<button class="rock-item" data-minopen="${mid}"><span class="sw" style="background:${m.swatch}"></span>${m.nom.split(" (")[0]}</button>`).join("") + `</div>`;
    }
    if (args.length) {
      html += `<div class="side-group"><h3>Argiles</h3>` + args.map((a) =>
        `<button class="rock-item" data-argile="${a.id}"><span class="sw" style="background:${a.swatch}"></span>${a.nom.split(" (")[0]}</button>`).join("") + `</div>`;
    }
    side.innerHTML = html || `<p class="sub" style="padding:10px">Aucune fiche ne correspond.</p>`;
    wireSidebar(side);
    return;
  }

  // ---- barre latérale contextuelle selon la partie ----
  if (sec === "accueil") {
    // Accueil : sommaire des parties (et non le menu d'une partie)
    const nOx = OXYDES.reduce((s, f) => s + f.especes.length, 0);
    const parties = [
      { page: "roches", nom: "Roches", n: ROCHES.length, sw: "var(--cat-sedimentaire)" },
      { page: "mineraux", nom: "Minéraux", n: Object.keys(MINERAUX).length, sw: "var(--cat-magmatique)" },
      { page: "argiles", nom: "Argiles", n: Object.keys(ESPECES).length, sw: "var(--prod-argile)" },
      { page: "oxydes", nom: "Oxydes", n: nOx, sw: "var(--prod-oxydes)" },
    ];
    html += `<div class="side-group"><h3>Sommaire de l'atlas</h3>`;
    parties.forEach((p) => {
      html += `<button class="rock-item" data-page="${p.page}">
        <span class="sw" style="background:${p.sw}"></span><b>${p.nom}</b><span class="fac">${p.n}</span></button>`;
      if (p.page === "roches") {
        ROCHES_ARBRE.forEach((fam) => {
          html += `<button class="rock-item sub-item" data-rocfam="${fam.id}">${fam.nom}</button>`;
        });
      }
    });
    html += `</div><div class="side-group"><h3>Annexe</h3>
      <button class="rock-item" data-page="amorphes">
        <span class="sw" style="background:linear-gradient(135deg,#6a5a52 50%,#4a3a2a 50%)"></span>Amorphes et minéraloïdes</button></div>`;
  } else if (sec === "roches") {
    // Arbre du lexique BRGM : famille → branches (codes) ; la branche ouverte déplie ses roches
    const curFam = (location.hash.match(/^#rocfam\/(.+)$/) || [])[1];
    const curBr = (location.hash.match(/^#rocbr\/(.+)$/) || [])[1];
    const place = current ? placeRoche(decodeURIComponent(current)) : null;
    const brOuverte = curBr ? decodeURIComponent(curBr) : (place ? place.branche.code : null);
    html += `<div class="side-group"><h3>Classification du BRGM</h3>
      <button class="rock-item ${location.hash === "#roches" ? "on" : ""}" data-page="roches">
        <span class="sw" style="background:linear-gradient(135deg,var(--cat-magmatique) 33%,var(--cat-sedimentaire) 33%,var(--cat-sedimentaire) 66%,var(--cat-metamorphique) 66%)"></span>
        <b>Vue d'ensemble</b></button></div>`;
    // Colonnes emboîtées (principe de la charte des temps) : bande famille | bande branche | roches.
    // Chaque bande est aussi haute que la liste qu'elle contient ; étiquette verticale, ramenée au code seul
    // après affichage si elle dépasse de la bande (voir la fin de renderSidebar).
    html += `<div class="arbre">`;
    for (const fam of ROCHES_ARBRE) {
      const famOn = fam.id === curFam ? "on" : (place && place.fam === fam) || (curBr && fam.branches.some((b) => b.code === curBr)) ? "chemin" : "";
      html += `<div class="arbre-fam" style="--c:${catColor(fam.id)}">
        <button class="arbre-band fam ${famOn}" data-rocfam="${fam.id}"><span>${fam.nom}</span></button>
        <div class="arbre-branches">`;
      for (const br of fam.branches) {
        const ids = br.groupes.flatMap((g) => g.roches);
        const mot = br.nom.replace(/^(Roches|Métamorphisme|Formations) (de |d')?/, "");
        const court = mot.charAt(0).toUpperCase() + mot.slice(1);
        const complet = `${br.code} · ${court}`;
        // l'étiquette verticale ne doit pas dicter la hauteur de la branche : une branche d'une ou deux roches (M.4 ·
        // Carbonatites) s'étirait sur 130 px pour loger son nom → on n'y écrit que le code (nom complet au survol)
        const etiquette = ids.length * 28 >= complet.length * 7.6 + 12 ? complet : br.code;
        const brOn = br.code === curBr ? "on" : place && place.branche === br ? "chemin" : "";
        html += `<div class="arbre-br">
          <button class="arbre-band br ${brOn}" data-rocbr="${br.code}" aria-label="${complet}" title="${complet}"><span>${etiquette}</span></button>
          <div class="arbre-roches">`;
        br.groupes.forEach((g, gi) => g.roches.forEach((id, ri) => {
          const r = ROCHES.find((x) => x.id === id);
          if (!r) return;
          html += `<button class="arbre-roche ${gi && !ri ? "sep" : ""} ${r.id === current ? "on" : ""}" data-id="${r.id}">
            <span class="sw" style="background:${r.swatch}"></span><span>${r.nom}</span></button>`;
        }));
        html += `</div></div>`;
      }
      html += `</div></div>`;
    }
    html += `</div>`;
  } else if (sec === "mineraux") {
    // Colonnes emboîtées (même principe que l'arbre des roches et le menu des argiles) :
    // classe de Strunz | groupe (ou famille d'oxydes pour la classe IV, cf. #oxydes) | minéraux.
    html += `<div class="side-group"><h3>Classes de Strunz</h3>
      <button class="rock-item ${location.hash === "#mineraux" ? "on" : ""}" data-page="mineraux">
        <span class="sw" style="background:linear-gradient(135deg,#e8d8a8 33%,#a04030 33%,#a04030 66%,#7f9fd4 66%)"></span>
        <b>Vue d'ensemble</b></button></div>`;
    let curCls = (location.hash.match(/^#min(?:cls|grp)\/(\d+)/) || [])[1];
    let curGrp = (location.hash.match(/^#mingrp\/\d+-(\d+)/) || [])[1];
    const curMin = decodeURIComponent((location.hash.match(/^#mineral\/(.+)$/) || [])[1] || "");
    if (curMin) MIN_CLASSIF.forEach((c) => c.groupes.forEach((g, gi) => {
      if (!curCls && groupeIds(g).includes(curMin)) { curCls = String(c.n); curGrp = String(gi); }
    }));
    html += `<div class="arbre">`;
    [...MIN_CLASSIF].sort((a, b) => a.n - b.n).forEach((c) => {
      const premierId = c.n === 4
        ? (OXYDES[0] && OXYDES[0].especes[0] && OXYDES[0].especes[0].id)
        : c.groupes.map(groupeIds).flat().find((id) => MINERAUX[id]);
      const coul = (premierId && MINERAUX[premierId] && MINERAUX[premierId].swatch) || "var(--baseline)";
      const clsOn = String(c.n) === curCls;
      let branchesHTML = "";
      if (c.n === 4) {
        // Classe IV : les sous-bandes sont les 12 familles d'oxydes par élément (détail : #oxydes).
        OXYDES.forEach((f) => {
          const especesHTML = f.especes.map((e) => `<button class="arbre-roche ${e.id === curMin ? "on" : ""}" data-min="${e.id}">
            <span class="sw" style="background:${f.couleur}"></span><span>${e.nom}</span></button>`).join("");
          branchesHTML += `<div class="arbre-br">
            <button class="arbre-band br" data-oxyde="${f.id}" data-court="${f.symbole}" title="${f.element}"><span>${f.element}</span></button>
            <div class="arbre-roches">${especesHTML}</div>
          </div>`;
        });
      } else {
        c.groupes.forEach((g, gi) => {
          const brOn = clsOn && String(gi) === curGrp;
          let especesHTML = "";
          const ajoute = (mid, sep) => {
            const m = MINERAUX[mid];
            if (!m) return;
            especesHTML += `<button class="arbre-roche ${sep ? "sep" : ""} ${mid === curMin ? "on" : ""}" data-min="${mid}">
              <span class="sw" style="background:${m.swatch}"></span><span>${m.nom.split(" (")[0]}</span></button>`;
          };
          if (g.sousGroupes) g.sousGroupes.forEach((sf, sfi) => sf.mineraux.forEach((mid, mi) => ajoute(mid, sfi && !mi)));
          else groupeIds(g).forEach((mid) => ajoute(mid, false));
          const court = (g.code || g.nom.split(" —")[0].split(" (")[0]).slice(0, 6);
          branchesHTML += `<div class="arbre-br">
            ${c.groupes.length > 1 ? `<button class="arbre-band br ${brOn ? "on" : ""}" data-mingrp="${c.n}-${gi}" data-court="${court}" title="${g.nom}">
              <span>${g.code || g.nom.split(" —")[0].split(" (")[0]}</span></button>` : ""}
            <div class="arbre-roches">${especesHTML}</div>
          </div>`;
        });
      }
      html += `<div class="arbre-fam" style="--c:${coul}">
        <button class="arbre-band fam ${clsOn ? "on" : ""}" data-mincls="${c.n}" title="${c.classe}"><span>${c.num}</span></button>
        <div class="arbre-branches">${branchesHTML}</div>
      </div>`;
    });
    html += `</div>`;
  } else if (sec === "argiles") {
    // Colonnes emboîtées (G.1, même principe que l'arbre des roches et la charte des temps) :
    // grande famille | sous-famille dioct./trioct. (si elle existe) | espèces, chaque bande aussi
    // haute que ce qu'elle contient.
    html += `<div class="side-group"><h3>Minéraux argileux</h3>
      <button class="rock-item ${location.hash === "#argiles" ? "on" : ""}" data-classif="1">
        <span class="sw" style="background:linear-gradient(135deg,#e9e4da 25%,#8fa387 25%,#8fa387 50%,#c9b98a 50%,#c9b98a 75%,#6f8f72 75%)"></span>
        <b>Classification complète</b></button></div>`;
    html += `<div class="arbre">`;
    for (const gf of ARGILE_GRANDES) {
      const fichesGf = [...new Set(gf.sousFamilles.flatMap((f) => f.groupes.map((g) => g.fiche)).filter(Boolean))]
        .map((id) => ARGILES.find((a) => a.id === id)).filter(Boolean);
      const coul = fichesGf.length ? fichesGf[0].swatch : "var(--baseline)";
      let gfChemin = false;
      let branchesHTML = "";
      for (const fam of gf.sousFamilles) {
        const trioct = /trioctaédriques/i.test(fam.famille);
        const sousLabel = gf.sousFamilles.length > 1 ? (trioct ? "Trioctaédrique" : "Dioctaédrique") : null;
        let brChemin = false;
        let especesHTML = "";
        fam.groupes.forEach((g, gi) => {
          g.especes.forEach((eid, ei) => {
            const es = ESPECES[eid];
            if (!es) return;
            const cible = es.fiche || (ARGILES.find((a) => a.id === eid) ? eid : null);
            const on = currentEsp ? eid === currentEsp : !!cible && cible === currentArg;
            if (on) { brChemin = true; gfChemin = true; }
            const sw = (ARGILES.find((a) => a.id === g.fiche) || {}).swatch || coul;
            especesHTML += `<button class="arbre-roche ${gi && !ei ? "sep" : ""} ${on ? "on" : ""}" data-espece="${eid}">
              <span class="sw" style="background:${sw}"></span><span>${es.nom}</span></button>`;
          });
        });
        branchesHTML += `<div class="arbre-br">
          ${sousLabel ? `<button class="arbre-band br ${brChemin ? "chemin" : ""}" data-court="${trioct ? "Trioct." : "Dioct."}"><span>${sousLabel}</span></button>` : ""}
          <div class="arbre-roches">${especesHTML}</div>
        </div>`;
      }
      html += `<div class="arbre-fam" style="--c:${coul}">
        <button class="arbre-band fam ${gfChemin ? "chemin" : ""}"><span>${gf.nom}</span></button>
        <div class="arbre-branches">${branchesHTML}</div>
      </div>`;
    }
    html += `</div>`;
  } else if (sec === "oxydes") {
    const curOx = (location.hash.match(/^#oxyde\/(.+)$/) || [])[1];
    html += `<div class="side-group"><h3>Oxydes &amp; hydroxydes</h3>
      <button class="rock-item ${location.hash === "#oxydes" ? "on" : ""}" data-page="oxydes">
        <span class="sw" style="background:linear-gradient(135deg,#b07830 50%,#3a3a40 50%)"></span><b>Vue d'ensemble</b></button>`;
    OXYDES.forEach((f) => {
      html += `<button class="rock-item sub-item ${f.id === curOx ? "on" : ""}" data-oxyde="${f.id}">
        <span class="sw" style="background:${f.couleur}"></span>${f.element} <span class="fac">${f.especes.length}</span></button>`;
    });
    html += `</div>`;
  } else if (sec === "amorphes") {
    html += `<div class="side-group"><h3>Amorphes et minéraloïdes</h3>
      <button class="rock-item ${location.hash === "#amorphes" ? "on" : ""}" data-page="amorphes">
        <span class="sw" style="background:linear-gradient(135deg,#6a5a52 50%,#4a3a2a 50%)"></span>
        <b>Vue d'ensemble</b></button>`;
    AMO_PARTIES.forEach((p) => { html += `<button class="rock-item sub-item" data-ancre="${p.id}">${p.nom}</button>`; });
    html += `</div>`;
  }
  side.innerHTML = html || `<p class="sub" style="padding:10px">Aucune fiche ne correspond.</p>`;
  wireSidebar(side);
  // arbre des roches : étiquette de branche trop longue pour sa bande → code seul
  // (seulement si la mise en page est disponible : hauteur 0 = barre non affichée)
  side.querySelectorAll(".arbre-band.br").forEach((b) => {
    const s = b.firstElementChild;
    const court = b.dataset.court || b.dataset.rocbr;
    if (court && b.clientHeight && s.getBoundingClientRect().height > b.clientHeight - 4) s.textContent = court;
  });
  // arbre des roches : amener la fiche ouverte dans la partie visible de la barre latérale
  const active = side.querySelector(".arbre-roche.on");
  if (active) {
    const ra = active.getBoundingClientRect(), rs = side.getBoundingClientRect();
    if (ra.top < rs.top || ra.bottom > rs.bottom) side.scrollTop += ra.top - rs.top - rs.height / 2;
  }
}

function wireSidebar(side) {
  side.querySelectorAll(".rock-item, .arbre-band, .arbre-roche").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.espece) return; // laissé à la délégation globale (navigation vers la fiche + surbrillance)
    if (b.dataset.ancre) {
      const cible = document.getElementById(b.dataset.ancre);
      if (cible) cible.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (b.dataset.classif) location.hash = "argiles";
    else if (b.dataset.arggrp) location.hash = "argrp/" + b.dataset.arggrp;
    else if (b.dataset.page) location.hash = b.dataset.page;
    else if (b.dataset.oxyde) location.hash = "oxyde/" + b.dataset.oxyde;
    else if (b.dataset.rocfam) location.hash = "rocfam/" + b.dataset.rocfam;
    else if (b.dataset.rocbr) location.hash = "rocbr/" + b.dataset.rocbr;
    else if (b.dataset.mingrp) location.hash = "mingrp/" + b.dataset.mingrp;
    else if (b.dataset.mincls != null) location.hash = "mincls/" + b.dataset.mincls;
    else if (b.dataset.minopen) location.hash = "mineral/" + b.dataset.minopen;
    else if (b.dataset.argile) location.hash = "argile/" + b.dataset.argile;
    else if (b.dataset.id) go(b.dataset.id);
  }));
}

// ---------------- échelle log commune ----------------
const LOG_MIN = -4, LOG_MAX = 3; // 0,0001 → 1000 mm/an (le sel gemme et la sylvinite montent à 130-150)
function xLog(v, x0, x1) {
  const t = (Math.log10(v) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return x0 + t * (x1 - x0);
}
const DECADES = [1e-4, 1e-3, 1e-2, 0.1, 1, 10, 100, 1000];

// ---------------- partie AMORPHES (minéraloïdes) ----------------
// G.10 (30/09/2026) : la page range ce qui n'est pas un minéral selon la condition qui lui manque — le réseau
// (1 · verres, 2 · gels et nanophases) ou la composition définie (3 · matière organique) — et dit, pour chaque
// substance, où sa fiche est rangée dans l'atlas. Les phases que l'IMA compte parmi les minéraux (opale,
// allophane, ferrihydrite…) restent dans leur partie : cette page les réunit par renvoi.
const AMO_PARTIES = [
  { id: "amo-verres", nom: "1 · Verres" },
  { id: "amo-gels", nom: "2 · Gels et nanophases" },
  { id: "amo-organique", nom: "3 · Matière organique" },
];
function renderAmorphes() {
  const petit = (t) => (t ? ` <small>${t}</small>` : "");
  // part d'un constituant dans la composition d'une roche (ex. 92 % de verre dans l'obsidienne)
  const part = (rid, mid) => {
    const r = ROCHES.find((x) => x.id === rid);
    const p = r && (r.mineraux || []).find((x) => x[0] === mid);
    return p ? `${p[1]} %` : "";
  };
  const nbRoches = (mid) => ROCHES.filter((r) => (r.mineraux || []).some((x) => x[0] === mid)).length;
  const roc = (id, detail) => {
    const r = ROCHES.find((x) => x.id === id);
    return r ? `<button class="min-chip" data-go="${id}"><span class="sw" style="background:${r.swatch}"></span>${r.nom.split(" (")[0]}${petit(detail)}</button>` : "";
  };
  const min = (id, detail) => {
    const m = MINERAUX[id];
    return m ? `<button class="min-chip" data-min="${id}"><span class="sw" style="background:${m.swatch}"></span>${m.nom.split(" (")[0]}${petit(detail)}</button>` : "";
  };
  const esp = (id) => {
    const e = ESPECES[id];
    // pastille de la fiche du groupe, comme dans le menu des argiles
    const g = CLASSIF.flatMap((fa) => fa.groupes).find((x) => x.especes.includes(id));
    const f = e && ARGILES.find((a) => a.id === (e.fiche || (g && g.fiche)));
    return e ? `<button class="min-chip" data-espece="${id}"><span class="sw" style="background:${f ? f.swatch : "var(--prod-argile)"}"></span>${e.nom}</button>` : "";
  };
  // où chaque phase mal cristallisée est rangée
  const locOpale = placeMineral("opale");
  let grpPara = "";
  CLASSIF.forEach((f, fi) => f.groupes.forEach((g, gi) => {
    if (!grpPara && g.especes.includes("allophane_e")) grpPara = `${fi}-${gi}`;
  }));
  const versArgiles = `<button class="min-chip" data-arggrp="${grpPara}">Argiles → para-cristallins</button>`;
  const versOxydes = (fid, el) => `<button class="min-chip" data-gopage="oxyde/${fid}">Oxydes → ${el}</button>`;
  const bloc = (c, titre, lieu, corps) => `<div class="ox-element" style="--c:${c}">
      <div class="groupe-head"><span class="sw-el" aria-hidden="true"></span><b>${titre}</b>${lieu ? `<span class="sub">${lieu}</span>` : ""}</div>
      ${corps}
    </div>`;

  $("#main").innerHTML = `
  <div class="card hero">
    <h1>🫧 Amorphes et minéraloïdes</h1>
    <p class="sub" style="font-size:15px;max-width:80ch">Un minéral est un solide naturel dont les atomes sont rangés en
    réseau et dont la composition s'écrit par une formule. Les substances de cette partie manquent l'une de ces deux
    dernières conditions : ce sont des <b>minéraloïdes</b>. Elles sont rangées ci-dessous selon la condition qui leur manque.</p>
  </div>

  <div class="card">
    <h2>Ce qui leur manque</h2>
    <div class="chart-wrap"><table class="data amo-grille">
      <thead><tr><th></th><th>Atomes rangés en réseau</th><th>Composition définie</th><th>Pourquoi</th></tr></thead>
      <tbody>
        <tr class="amo-ref"><td><b>Un minéral</b><br><small>ex. le quartz</small></td><td>oui</td><td>oui : SiO₂</td>
          <td>il cristallise assez lentement pour que ses atomes se rangent</td></tr>
        <tr><td><b>1 · Verres</b><br><small>obsidienne, ponce</small></td><td><b>non</b></td><td>à peu près : celle de la roche fondue</td>
          <td>un liquide figé avant que ses atomes aient pu se ranger</td></tr>
        <tr><td><b>2 · Gels et nanophases</b><br><small>opale, allophane, ferrihydrite</small></td><td><b>non</b>, ou sur quelques nanomètres</td>
          <td>variable, surtout en eau</td><td>déposés trop vite par une eau devenue sursaturée</td></tr>
        <tr><td><b>3 · Matière organique</b><br><small>ambre, bitume, charbons</small></td><td>non (sauf les cires, en partie)</td>
          <td><b>non</b> : un mélange de molécules</td><td>restes d'êtres vivants transformés par l'enfouissement</td></tr>
      </tbody>
    </table></div>
    <div class="note">La frontière n'est pas tranchée. L'IMA garde parmi les minéraux quelques substances amorphes décrites
    avant 1959, date à laquelle elle a commencé à approuver les espèces : l'opale, l'allophane, l'hisingérite. Leurs fiches
    restent dans les parties Minéraux et Argiles ; elles sont réunies ici au § 2.</div>
  </div>

  <div class="card amo-carte" id="amo-verres">
    <h2><span class="num">1</span>Les verres : un liquide figé trop vite</h2>
    <p class="sub">Une roche fondue qui se fige avant que ses atomes aient pu se ranger devient un verre. Deux raisons à
    cela : un refroidissement brutal (lave de basalte trempée dans l'eau), ou un liquide si visqueux que ses atomes
    bougent à peine (lave de rhyolite, riche en silice et pauvre en eau). Le verre se reconnaît à son éclat vitreux et à
    sa cassure en coquille (conchoïdale). Trois façons d'en produire :</p>
    ${bloc("var(--cat-magmatique)", "Une lave figée", "verre volcanique · fiches dans Roches", `
      <div class="min-chips">${roc("obsidienne", part("obsidienne", "verre") + " de verre, massif")}
        ${roc("tuf_volcanique", "cendres, " + part("tuf_volcanique", "verre"))}
        ${roc("pouzzolane", "scories, " + part("pouzzolane", "verre"))}
        ${roc("ignimbrite", "ponces soudées, " + part("ignimbrite", "verre"))}
        ${roc("basalte", "bordures trempées, hyaloclastites")}</div>
      <p class="sub amo-sans">Sans fiche à part : la <b>ponce</b>, verre de lave riche en silice gonflé de bulles, si léger
      qu'il flotte ; le <b>sidéromélane</b>, verre de basalte transparent, trempé dans l'eau (bordure des laves en coussins,
      hyaloclastites) ; la <b>tachylite</b>, verre de basalte opaque, chargé de microcristaux d'oxydes de fer.</p>`)}
    ${bloc("var(--cat-metamorphique)", "Une roche fondue par un séisme", "fiche dans Roches", `
      <div class="min-chips">${roc("pseudotachylite", part("pseudotachylite", "verre") + " de verre")}</div>
      <p class="sub amo-sans">Pendant un séisme, le frottement sur la faille fond la roche en veines de quelques
      millimètres, qui se figent aussitôt.</p>`)}
    ${bloc("#7a5c8a", "Une roche fondue par un impact", "fiche dans Roches", `
      <div class="min-chips">${roc("impactite", part("impactite", "verre") + " de verre")}</div>
      <p class="sub amo-sans">L'onde de choc d'une météorite fond la roche en un instant (Rochechouart). Sans fiche à part :
      la <b>lechatelierite</b>, verre de silice presque pure, née dans les impacts et dans les fulgurites (sable fondu par
      la foudre).</p>`)}
    <div class="note">Dans les compositions des roches, ce verre compte comme un constituant : ${min("verre", nbRoches("verre") + " roches en contiennent")}
    Sans réseau à défendre, il s'altère plus vite que les minéraux de même composition : il s'hydrate (palagonite, perlite),
    puis donne les gels du § 2 (allophane, imogolite), et enfin des argiles (halloysite, smectites).</div>
  </div>

  <div class="card amo-carte" id="amo-gels">
    <h2><span class="num">2</span>Gels et nanophases : déposés trop vite</h2>
    <p class="sub">Quand une eau devient brusquement sursaturée — un verre qui se dissout, du fer dissous qui rencontre
    l'oxygène, une source chaude qui refroidit — le solide se dépose avant de s'être rangé : un gel, ou des sphères, des
    tubes et des grains de quelques nanomètres, ordonnés sur quelques rangées d'atomes seulement. L'IMA compte la plupart
    de ces phases parmi les minéraux : leurs fiches sont rangées dans leur partie, et réunies ici.</p>
    <div class="chart-wrap"><table class="data amo-gels">
      <thead><tr><th>Substance</th><th>Forme</th><th>Née de</th><th>Fiche rangée dans</th></tr></thead>
      <tbody>
        <tr><td>${min("opale")}</td><td>silice amorphe hydratée, en microsphères de quelques centaines de nanomètres</td>
          <td>squelettes de diatomées, de radiolaires et d'éponges ; sources chaudes (geysérite)</td>
          <td>${locOpale ? `<button class="min-chip" data-gominloc="${locOpale.n}-${locOpale.gi}-opale">Minéraux → silice</button>` : ""}</td></tr>
        <tr><td>${esp("allophane_e")}</td><td>sphères creuses de 3,5 à 5 nm</td>
          <td rowspan="2">verre volcanique altéré : sols jeunes des volcans (andosols)</td><td rowspan="3">${versArgiles}</td></tr>
        <tr><td>${esp("imogolite")}</td><td>tubes d'≈ 2 nm de diamètre, longs de quelques µm</td></tr>
        <tr><td>${esp("hisingerite")}</td><td>sphères creuses d'≈ 14 nm, en feuillets de kaolinite ferrique</td>
          <td>altération des silicates et des sulfures de fer</td></tr>
        <tr><td>${min("ferrihydrite")}</td><td>grains de 2 à 6 nm</td>
          <td>fer dissous qui rencontre l'oxygène : sources, drains, racines des sols engorgés</td><td rowspan="2">${versOxydes("fer", "fer")}</td></tr>
        <tr><td>${min("limonite")}</td><td>mélange de goethite, de ferrihydrite et d'eau (terme de terrain)</td>
          <td>concrétions, chapeaux de fer, minerai des marais</td></tr>
        <tr><td>${min("vernadite")}</td><td>feuillets de MnO₂ empilés en désordre</td>
          <td>manganèse oxydé par les bactéries et les champignons</td><td>${versOxydes("manganese", "manganèse")}</td></tr>
      </tbody>
    </table></div>
    <p class="sub amo-sans">Sans fiche à part : la <b>palagonite</b>, gel jaune-orangé né de l'hydratation du verre de
    basalte, premier stade de son altération.</p>
    <div class="note">Avec le temps, ces phases se rangent et changent de partie : l'opale des éponges enfouies dans la craie
    devient la calcédoine puis le quartz des silex ; la ferrihydrite devient goethite ou hématite ; l'allophane devient
    halloysite puis kaolinite en quelques dizaines de milliers d'années.</div>
  </div>

  <div class="card amo-carte" id="amo-organique">
    <h2><span class="num">3</span>La matière organique : un mélange de molécules</h2>
    <p class="sub">Les restes de plantes et d'animaux ne forment pas une substance mais un mélange de grosses molécules
    de carbone, d'hydrogène et d'oxygène, sans formule unique. Selon ce qu'elle est devenue, la matière organique est
    rangée à quatre endroits de l'atlas.</p>
    ${bloc("#b0761a", "Des minéraloïdes organiques", "fiches dans cette partie", `
      <div class="min-chips">${min("ambre", "résine fossile")}${min("copal", "résine subfossile")}${min("jais", "bois fossile")}
        ${min("asphalte", "pétrole dégradé")}${min("ozokerite", "cire minérale")}</div>
      <p class="sub amo-sans">Assez homogènes pour être taillés, polis ou exploités comme une pierre, mais sans réseau ni
      formule : l'IMA ne les compte pas parmi les espèces.</p>`)}
    ${bloc("var(--cat-sedimentaire)", "Quand elle fait la roche", "fiches dans Roches", `
      <div class="min-chips">${roc("tourbe")}${roc("lignite")}${roc("houille")}${roc("anthracite")}
        ${roc("schiste_bitumineux", "roche mère du pétrole")}</div>
      <p class="sub amo-sans">Enfouie, elle perd son eau et ses gaz et s'enrichit en carbone : tourbe, lignite, houille, puis
      anthracite. Au bout du chemin, sous l'effet du métamorphisme, le carbone cristallise : c'est le ${min("graphite")},
      un vrai minéral.</p>`)}
    ${bloc("var(--prod-argile)", "Dans les sols", "", `
      <div class="min-chips">${min("matorg", nbRoches("matorg") + " roches en contiennent")}</div>
      <p class="sub amo-sans">L'humus : associée aux argiles, elle forme le complexe argilo-humique, qui retient l'eau et
      les éléments nutritifs.</p>`)}
    ${bloc("#5a4330", "Quand elle cristallise", "classe X des minéraux", `
      <div class="min-chips"><button class="min-chip" data-mincls="10">Minéraux → classe X, organiques</button></div>
      <p class="sub amo-sans">Quelques molécules sont assez pures pour cristalliser : oxalates (whewellite), hydrocarbures
      (évenkite), sels du guano. Ce sont des minéraux.</p>`)}
  </div>

  <div class="card">
    <h2>Pour aller plus loin : du désordre à l'ordre</h2>
    <p>L'ordre d'un solide n'est pas tout ou rien. Un verre garde un ordre à très courte distance — chaque silicium reste
    entouré de quatre oxygènes — mais ces tétraèdres s'enchaînent au hasard. Une nanophase comme la ferrihydrite est
    ordonnée sur quelques nanomètres, quelques mailles seulement. La calcédoine est déjà du quartz, en fibres trop fines
    pour l'œil ; le quartz d'un filon est ordonné sur des centimètres. C'est la diffraction des rayons X qui tranche : un
    cristal donne des raies fines, une nanophase quelques raies élargies (de deux à six pour la ferrihydrite), un verre une
    seule bosse très large.</p>
    <p>Le désordre est une énergie en réserve. À 25 °C, l'eau dissout environ 120 mg de silice par kilogramme au contact
    de l'opale, dix fois plus qu'au contact du quartz (≈ 11 mg/kg) : c'est pourquoi l'opale des squelettes se redissout
    dans les sédiments et nourrit les silex. Toutes ces phases sont métastables et finissent par se ranger : le verre se
    dévitrifie (l'obsidienne s'hydrate depuis sa surface, assez régulièrement pour servir d'horloge aux archéologues),
    l'opale devient calcédoine puis quartz, la ferrihydrite goethite ou hématite, l'allophane halloysite puis kaolinite,
    et le charbon, sous le métamorphisme, graphite.</p>
    <p>Pour la même raison, elles sont les premières à réagir dans les sols : le verre est la matière première des
    andosols, la ferrihydrite et l'allophane fixent le phosphore et la matière organique. Elles y pèsent bien plus que leur
    place dans les classifications ne le laisse croire.</p>
  </div>
  <p class="page-source"><b>Sources</b> — Définition du minéral : E.H. Nickel (1995), <i>Canadian Mineralogist</i> 33, 689.
    Statut des minéraux amorphes : liste officielle des minéraux de l'IMA-CNMNC (janvier 2026) ; « Amorphous Mineral
    Species », laboratoire de microsonde de l'université de l'Alberta (2022). Solubilité de la silice : Fournier et Rowe
    (1977) pour l'opale, Rimstidt (1997) pour le quartz. Tailles : Parfitt (2009, <i>Clay Minerals</i> 44) pour
    l'allophane, Cradwick et al. (1972, <i>Nature Physical Science</i> 240) pour l'imogolite, Eggleton et Tilley (1998,
    <i>Clays and Clay Minerals</i> 46) pour l'hisingérite. Ambre, copal, jais, bitume, ozokérite : sources détaillées
    dans chaque fiche.</p>`;
  document.title = "Amorphes et minéraloïdes — Atlas géologique";
}

// ---------------- ACCUEIL (hub des 3 parties) ----------------
function renderHub() {
  $("#main").innerHTML = `
  <div class="card hero hub-hero">
    <div class="hub-bandeau" aria-hidden="true"><i style="background:var(--cat-sedimentaire)"></i><i style="background:var(--cat-magmatique)"></i><i style="background:var(--prod-argile)"></i><i style="background:var(--prod-oxydes)"></i></div>
    <p class="hub-surtitre">Accueil</p>
    <h1>Atlas géologique</h1>
    <p class="sub" style="font-size:15px;max-width:75ch">Les roches de France, les minéraux qui les composent et ce que
    l'altération en fait. Les parties se lisent dans l'ordre où la matière se transforme : une roche est un assemblage
    de minéraux ; en s'altérant, ces minéraux donnent des argiles et des oxydes.</p>
  </div>

  <div class="hub-grid">
    <button class="hub-card" onclick="location.hash='roches'">
      <div class="hub-ic" style="background:var(--cat-sedimentaire)">🪨</div>
      <p class="hub-etape">1 · Les assemblages</p>
      <h2>Roches</h2>
      <p>Rangées selon le lexique du BRGM : magmatiques, sédimentaires, métamorphiques.
      Où elles affleurent, leur âge, leur altération.</p>
      <span class="hub-go">${ROCHES.length} roches →</span>
    </button>
    <button class="hub-card" onclick="location.hash='mineraux'">
      <div class="hub-ic" style="background:var(--cat-magmatique)">💎</div>
      <p class="hub-etape">2 · Leurs briques</p>
      <h2>Minéraux</h2>
      <p>Les substances pures, rangées selon la classification de Strunz : silicates, oxydes, carbonates,
      sulfures… Formule, propriétés, image.</p>
      <span class="hub-go">${Object.keys(MINERAUX).length} fiches →</span>
    </button>
    <button class="hub-card" onclick="location.hash='argiles'">
      <div class="hub-ic" style="background:var(--prod-argile)">🧱</div>
      <p class="hub-etape">3 · Ce qu'en fait l'altération</p>
      <h2>Argiles</h2>
      <p>Les phyllosilicates en feuillets nés de l'altération des silicates, rangés d'après leur structure.</p>
      <span class="hub-go">${Object.keys(ESPECES).length} espèces →</span>
    </button>
    <button class="hub-card" onclick="location.hash='oxydes'">
      <div class="hub-ic" style="background:var(--prod-oxydes)">🟠</div>
      <p class="hub-etape">3 · Ce qu'en fait l'altération</p>
      <h2>Oxydes</h2>
      <p>Oxydes et hydroxydes de fer, manganèse, aluminium, titane… : leurs conditions de formation et leurs
      diagrammes pH–Eh.</p>
      <span class="hub-go">${OXYDES.reduce((s, f) => s + f.especes.length, 0)} espèces →</span>
    </button>
  </div>

  <div class="card">
    <h2>🫧 Amorphes et minéraloïdes <span class="badge outline">annexe</span></h2>
    <p class="sub">Ce qui ressemble à un minéral sans en être un : les <b>verres</b> (obsidienne, ponce), les
    <b>gels et nanophases</b> (opale, allophane, ferrihydrite) et la <b>matière organique</b> (ambre, charbons).</p>
    <div class="min-chips">
      <button class="min-chip" onclick="location.hash='amorphes'"><b>🫧 Amorphes et minéraloïdes →</b></button>
    </div>
  </div>

  <div class="card">
    <h2>Pour aller plus loin : comment les parties s'enchaînent</h2>
    <p>Un <b>minéral</b> est une substance de composition et de structure cristalline définies : le quartz (SiO₂), la
    calcite (CaCO₃), l'orthose (KAlSi₃O₈). Une <b>roche</b> est un assemblage de minéraux : un granite associe quartz,
    feldspaths et micas. La partie Minéraux classe les substances par chimie et structure ; la partie Roches classe les
    assemblages par origine.</p>
    <p>À la surface, les minéraux formés en profondeur ou en mer ne sont plus stables. L'eau chargée de CO₂ les attaque
    à des vitesses très différentes : l'olivine et les plagioclases calciques s'altèrent vite, le quartz presque pas
    (série de Goldich). L'hydrolyse des feldspaths et des micas libère des ions en solution et laisse des
    <b>argiles</b> (kaolinite, smectites, illite) ; le fer libéré s'oxyde et précipite en <b>oxydes</b> (goethite,
    hématite), qui colorent les sols en ocre et en rouge.</p>
    <p>Les grains résistants, surtout le quartz, deviennent des sables ; argiles et oxydes forment la fraction fine.
    Transportés, ces produits se déposent et donnent de nouvelles roches sédimentaires ; laissés en place, ils
    constituent le matériau des sols.</p>
  </div>`;
  document.title = "Atlas géologique";
}

// ---------------- partie ROCHES (vue d'ensemble) ----------------
function renderRoches() {
  const sorted = [...ROCHES].sort((a, b) => geomean(b) - geomean(a));
  const rowH = 26, top = 46, left = 218, right = 985, H = top + sorted.length * rowH + 16;

  let svg = `<svg viewBox="0 0 1000 ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vitesses d'altération comparées des roches de France">`;
  for (const d of DECADES) {
    const x = xLog(d, left, right);
    svg += `<line x1="${x}" y1="${top - 8}" x2="${x}" y2="${H - 12}" class="hairline"/>
            <text x="${x}" y="${top - 16}" text-anchor="middle" class="tick-lab">${fmt(d, 2)}</text>`;
  }
  svg += `<text x="${right}" y="14" text-anchor="end" class="axis-lab">mm par an — échelle logarithmique</text>`;
  sorted.forEach((r, i) => {
    const y = top + i * rowH + rowH / 2;
    const xa = xLog(r.alteration.vmin, left, right), xb = xLog(r.alteration.vmax, left, right);
    const c = catColor(r.categorie);
    const star = EROSION_IDS.has(r.id) ? " *" : "";
    svg += `<text x="${left - 12}" y="${y + 4}" text-anchor="end" class="row-lab" data-go="${r.id}">${r.nom}${star}</text>
      <line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="${xa}" cy="${y}" r="4.5" fill="${c}" stroke="var(--surface)" stroke-width="2"/>
      <circle cx="${xb}" cy="${y}" r="4.5" fill="${c}" stroke="var(--surface)" stroke-width="2"/>
      <rect x="0" y="${y - rowH / 2}" width="1000" height="${rowH}" class="hover-row" data-go="${r.id}"
        data-tip="<b>${r.nom}</b>${fmtRate(r.alteration.vmin)} à ${fmtRate(r.alteration.vmax)} mm/an — ${FACILITE_LABELS[r.alteration.facilite].toLowerCase()}<br><i>Cliquer pour ouvrir la fiche</i>"/>`;
  });
  svg += "</svg>";

  const legend = Object.entries(CATEGORIES).map(([id, m]) =>
    `<span class="key"><i style="background:${catColor(id)}"></i>${m.nom}s</span>`).join("");

  const tableRows = sorted.map((r) => `<tr>
      <td><a href="#roche/${r.id}">${r.nom}</a></td><td>${CATEGORIES[r.categorie].nom}</td>
      <td class="num">${fmtRate(r.alteration.vmin)}</td><td class="num">${fmtRate(r.alteration.vmax)}</td>
      <td>${FACILITE_LABELS[r.alteration.facilite]}</td></tr>`).join("");

  $("#main").innerHTML = `
  <div class="card hero">
    <h1>Les roches de France</h1>
    <p class="sub" style="font-size:15px;max-width:78ch">Une <b>roche</b> est un <b>assemblage de minéraux</b> — comme un mur
    fait de plusieurs briques. On les range par <b>origine</b> : sédimentaires (déposées grain par grain), magmatiques
    (cristallisées depuis un magma), métamorphiques (transformées par la chaleur et la pression). Choisis-en une pour
    voir où elle affleure, son âge, et ce qu'elle devient en s'altérant.</p>
  </div>

  <div class="card">
    <h2>Vitesse d'altération comparée</h2>
    <p class="sub">Recul du front d'altération ou de dissolution, en mm par an (ordres de grandeur, climat tempéré : 8–15 °C, 600–1 100 mm/an).
    Chaque barre va de la vitesse minimale à la vitesse maximale typique. Cliquer sur une ligne ouvre la fiche.</p>
    <div class="legend">${legend}</div>
    <div class="chart-wrap" id="ov-chart">${svg}</div>
    <p class="sub">* Pour les roches meubles ou solubles (marnes, argiles, lœss, sables, gypse, sel et sels potassiques, anhydrite, vases, tourbe), la vitesse indiquée
    correspond surtout à l'<b>érosion physique</b> ou à la dissolution au contact direct de l'eau — pas à une lente altération chimique.</p>
    <button class="tbl-toggle" id="tbl-btn">Voir les données en tableau</button>
    <div id="tbl-box" hidden><table class="data"><thead><tr><th>Roche</th><th>Famille</th>
      <th class="num">v. min (mm/an)</th><th class="num">v. max (mm/an)</th><th>Altérabilité</th></tr></thead>
      <tbody>${tableRows}</tbody></table></div>
  </div>

  <div class="card">
    <h2>Lire les codes de la carte géologique</h2>
    <p class="sub">Sur les cartes BRGM, chaque formation porte un code : une lettre pour le système (l'âge ou la nature),
    un chiffre pour l'étage, parfois un suffixe pour le faciès local — ex. <span class="code-chip">Fz</span> alluvions récentes,
    <span class="code-chip">g1AR</span> Argiles vertes de Romainville. Chaque fiche roche liste ses codes typiques.</p>
    <div class="chart-wrap"><table class="data notation"><thead><tr><th>Code</th><th>Signification</th></tr></thead>
      <tbody>${NOTATION_GENERALE.map((n) => `<tr><td>${n.code}</td><td>${n.sens}</td></tr>`).join("")}</tbody></table></div>
    <p class="sub">Les notations exactes varient d'une feuille 1/50 000 à l'autre (elles ont été levées sur plus d'un siècle) :
    la légende de chaque carte fait foi — consultable sur <a href="https://infoterre.brgm.fr" target="_blank" rel="noopener">InfoTerre</a>.</p>
  </div>

  <div class="card">
    <h2>Pour aller plus loin : les trois grandes familles de roches</h2>
    <p>Toute roche raconte son histoire par son origine. Les <b>roches sédimentaires</b> (calcaire, craie, grès, argile…)
    naissent du dépôt et du compactage de débris ou de précipités chimiques au fond des mers, des lacs et des vallées :
    elles couvrent les trois quarts de la surface de la France et gardent la mémoire des climats passés — un calcaire, c'est
    un ancien fond marin, souvent tropical.</p>
    <p>Les <b>roches magmatiques</b> viennent d'un magma refroidi : lentement en profondeur, il donne de gros cristaux
    visibles (le granite et ses grains de quartz, feldspath et mica) ; brutalement en surface, il fige en roches sombres à
    cristaux minuscules (le basalte des volcans d'Auvergne). Ce sont les roches « mères » qui, en s'altérant, fabriquent
    l'essentiel des minéraux argileux.</p>
    <p>Les <b>roches métamorphiques</b> sont d'anciennes roches recuites par la chaleur et écrasées par la pression, sans
    jamais fondre : l'argile durcit en schiste puis en ardoise, le calcaire devient marbre, le granite devient gneiss. Leurs
    minéraux se réorganisent et s'alignent en lits — cette « foliation » explique pourquoi l'ardoise se débite en plaques
    régulières. Clique sur n'importe quelle roche pour ouvrir sa fiche : carte d'affleurement, âge, vitesse d'altération, et
    le bilan de ce qu'elle produit en se défaisant.</p>
  </div>`;

  $("#tbl-btn").addEventListener("click", () => {
    const b = $("#tbl-box"); b.hidden = !b.hidden;
    $("#tbl-btn").textContent = b.hidden ? "Voir les données en tableau" : "Masquer le tableau";
  });
  const chart = $("#ov-chart");
  bindTips(chart);
  chart.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go]");
    if (t) go(t.dataset.go);
  });
  document.title = "Roches — Atlas géologique";
}

// ---------------- arbre des roches (lexique BRGM) ----------------
function rocChipHTML(id) {
  const r = ROCHES.find((x) => x.id === id);
  if (!r) return "";
  return `<button class="min-chip" data-go="${r.id}"><span class="sw" style="background:${r.swatch}"></span>${r.nom}</button>`;
}

function rocheCrumbHTML(rock) {
  const p = placeRoche(rock.id);
  if (!p) return "";
  return `<p class="sub crumb">Roches <span>→</span> <b data-rocfam="${p.fam.id}" style="cursor:pointer;text-decoration:underline">${p.fam.nom}</b>
    <span>→</span> <b data-rocbr="${p.branche.code}" style="cursor:pointer;text-decoration:underline">${p.branche.code} · ${p.branche.nom}</b>
    ${p.branche.groupes.length > 1 ? `<span>→</span> ${p.groupe.nom}` : ""}</p>`;
}

function rocheBrgmHTML(rock) {
  if (!(rock.id in ROCHES_BRGM)) return "";
  const e = ROCHES_BRGM[rock.id];
  if (!e) return `<p class="sub"><b>Lexique BRGM :</b> hors lexique. ${ROCHES_HORS_LEXIQUE[rock.id] || ""}</p>`;
  const [terme, parent, proche] = e;
  return proche
    ? `<p class="sub"><b>Lexique BRGM :</b> pas de terme propre ; concept le plus proche : « ${terme} » (dans « ${parent} »).</p>`
    : `<p class="sub"><b>Lexique BRGM :</b> « ${terme} », dans « ${parent} ».</p>`;
}

function rocheGroupesHTML(br) {
  return br.groupes.map((g) => `
    <div class="groupe-bloc">
      ${br.groupes.length > 1 ? `<div class="groupe-head"><b>${g.nom}</b>
        ${g.brgm ? `<span class="badge outline">BRGM : ${g.brgm}</span>` : `<span class="badge outline">hors lexique</span>`}</div>` : ""}
      ${g.note ? `<p class="sub" style="margin:4px 0 8px">${g.note}</p>` : ""}
      <div class="min-chips">${g.roches.map(rocChipHTML).join("")}</div>
    </div>`).join("");
}

function renderRocheFamille(fam) {
  const n = fam.branches.reduce((s, b) => s + b.groupes.reduce((k, g) => k + g.roches.length, 0), 0);
  const autres = ROCHES_ARBRE.filter((f) => f !== fam)
    .map((f) => `<button class="min-chip" data-rocfam="${f.id}">${f.nom}</button>`).join("");
  const branches = fam.branches.map((br) => `
    <div class="groupe-bloc">
      <div class="groupe-head">
        <span class="strunz-code">${br.code}</span> <b>${br.nom}</b>
        <span class="badge outline">BRGM : ${br.brgm}</span>
        <button class="min-chip" data-rocbr="${br.code}" style="margin-left:auto">Ouvrir cette branche →</button>
      </div>
      <p class="sub" style="margin:4px 0 8px">${br.note}</p>
      <div class="min-chips">${br.groupes.flatMap((g) => g.roches).map(rocChipHTML).join("")}</div>
    </div>`).join("");

  $("#main").innerHTML = `
  <div class="card rock-head">
    <h1><span class="sw-big" style="background:${catColor(fam.id)}"></span>${fam.nom}</h1>
    <p class="sub crumb">Roches <span>→</span> <b>${fam.nom}</b> · <a href="#roches">vue d'ensemble</a></p>
    <p class="desc">${fam.desc}</p>
    <div class="tiles">
      <div class="tile"><div class="lab">Branches</div><div class="val">${fam.branches.length}</div></div>
      <div class="tile"><div class="lab">Roches décrites</div><div class="val">${n}</div></div>
    </div>
  </div>

  <div class="card">
    <h2>Les branches</h2>
    <p class="sub">Les codes (${fam.branches[0].code}…) sont propres à l'atlas ; le badge indique le nœud correspondant du Lexique
    Lithologie du BRGM.</p>
    ${branches}
  </div>

  <div class="card">
    <h2>Pour aller plus loin</h2>
    ${fam.plus}
  </div>

  <div class="card">
    <h2>Les autres familles</h2>
    <div class="min-chips">${autres}</div>
  </div>`;
  document.title = fam.nom + " — Atlas géologique";
}

function renderRocheBranche({ fam, branche: br }) {
  const n = br.groupes.reduce((k, g) => k + g.roches.length, 0);
  const voisines = fam.branches.filter((b) => b !== br)
    .map((b) => `<button class="min-chip" data-rocbr="${b.code}"><span class="strunz-code">${b.code}</span> ${b.nom}</button>`).join("");

  $("#main").innerHTML = `
  <div class="card rock-head">
    <h1><span class="num">${br.code}</span>${br.nom}</h1>
    <p class="sub crumb">Roches <span>→</span> <b data-rocfam="${fam.id}" style="cursor:pointer;text-decoration:underline">${fam.nom}</b>
      <span>→</span> cette branche · <a href="#roches">vue d'ensemble</a></p>
    <div class="crit-row"><span class="crit"><i>Nœud du lexique BRGM</i>${br.brgm}</span>
      <span class="crit"><i>Groupes</i>${br.groupes.length}</span>
      <span class="crit"><i>Roches décrites</i>${n}</span></div>
    <p class="desc" style="margin-top:14px">${br.note}</p>
  </div>

  <div class="card">
    <h2>${br.groupes.length > 1 ? "Les groupes" : "Les roches de cette branche"}</h2>
    <p class="sub">Cliquer sur une roche ouvre sa fiche.</p>
    ${rocheGroupesHTML(br)}
  </div>

  <div class="card">
    <h2>Pour aller plus loin</h2>
    ${br.plus}
  </div>

  <div class="card">
    <h2>Sa place dans la famille</h2>
    <p class="sub">${fam.desc}</p>
    ${voisines ? `<p class="sub" style="margin-bottom:4px"><b>Les autres branches</b> :</p><div class="min-chips">${voisines}</div>` : ""}
  </div>`;
  document.title = br.nom + " — Atlas géologique";
}

// ---------------- frise des temps géologiques (C.5) ----------------
// Charte ICS (echelle-temps.js), colonnes Ère → Système → (Sous-système) → Série → Étage (l'éon n'est pas affiché).
// Par défaut : seulement les ères où la roche s'est formée, dépliées jusqu'à la série ; une série est dépliée
// jusqu'aux étages quand un âge de la roche est assez précis (il touche au plus 2 séries). « Toute l'échelle » =
// toutes les ères, tous les étages. Hauteurs de lignes égales, comme sur la charte : l'échelle n'est linéaire
// qu'À L'INTÉRIEUR d'une ligne.
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
}
const FT_H = 22; // hauteur d'une ligne (px), reprise dans style.css
const FT_TITRES = ["", "Ère", "Système", "Sous-système", "Série", "Étage"];
const ftReglages = { tout: false, details: false }; // gardés d'une fiche à l'autre
const ftNombre = (t) => (/^\d{4,}$/.test(t) ? NF.format(+t) : t.replace(".", ","));
const ftTexteAge = (b) => (b.env ? "~ " : "") + ftNombre(b.txt) + (b.pm ? " ± " + ftNombre(b.pm) : "");
const ftArrondi = (v) => (v === 0 ? "0" : v >= 10 ? NF.format(Math.round(v)) : v >= 1 ? fmt(Math.round(v * 10) / 10) : fmt(v, 2));
const ftChemin = (n) => { const c = []; for (let x = n; x; x = x.parent) c.unshift(x); return c; };
const ftChevauche = (age, jeune, vieux) => Math.min(age.de, vieux) - Math.max(age.a, jeune);
const ftCol = (n) => Math.max(n.col, 1); // l'Hadéen (éon sans ère) s'affiche dans la colonne des ères
const ftAttr = (t) => t.replace(/"/g, "&quot;");

// âge du SOMMET d'une unité, tel qu'imprimé = base de la feuille plus jeune qui la précède
function ftSommet(n) {
  while (n.k) n = n.k[0];
  const j = ECHELLE_TEMPS.feuilles.indexOf(n);
  return j > 0 ? ECHELLE_TEMPS.feuilles[j - 1].base : { txt: "0", env: false, pm: null };
}
// unités de rang « ère » dans l'ordre (l'Hadéen compris)
const ftEres = () => ECHELLE_TEMPS.noeuds.filter((n) => n.col === 1 || (n.col === 0 && !n.k));

// Lignes affichées, regroupées en blocs d'ères contiguës
function ftBlocs(rock, tout) {
  const ages = rock.ages;
  const touche = (n) => ages.some((a) => ftChevauche(a, n.sommet, n.base.v) > 0);
  const series = ECHELLE_TEMPS.noeuds.filter((n) => n.col === 4);
  const precis = ages.filter((a) => series.filter((sr) => ftChevauche(a, sr.sommet, sr.base.v) > 0).length <= 2);
  const deplier = (sr) => precis.some((a) => ftChevauche(a, sr.sommet, sr.base.v) > 0);
  const eres = ftEres().filter((e) => tout || touche(e));
  const blocs = [];
  eres.forEach((e) => {
    const lignes = [];
    const f = (n) => {
      if (!n.k || (!tout && n.col === 4 && !deplier(n))) lignes.push(n);
      else n.k.forEach(f);
    };
    f(e);
    const dernier = blocs[blocs.length - 1];
    if (dernier && Math.abs(dernier.base - e.sommet) < 1e-9) { dernier.lignes.push(...lignes); dernier.base = e.base.v; }
    else blocs.push({ lignes, base: e.base.v, sommet: e.sommet });
  });
  return blocs;
}

function friseTableHTML(rock) {
  const { tout, details } = ftReglages;
  const blocs = ftBlocs(rock, tout);
  const lignes = blocs.flatMap((bl) => bl.lignes);
  const chemins = lignes.map((l) => ftChemin(l).filter((n) => n.col >= 1 || !n.k));
  const nbLignes = new Map();
  chemins.forEach((ch) => ch.forEach((n) => nbLignes.set(n, (nbLignes.get(n) || 0) + 1)));
  const cols = [...new Set(chemins.flat().map(ftCol))].sort((x, y) => x - y);
  const idx = (c) => (c > cols[cols.length - 1] ? cols.length : cols.indexOf(c));
  const ages = rock.ages;
  // une seule colonne de barres si les âges ne se chevauchent pas
  const chevauchement = ages.some((a, i) => ages.some((b, j) => j > i && ftChevauche(a, b.a, b.de) > 0));
  const colonnes = chevauchement ? ages.map((a) => [a]) : [ages];
  const numeroter = ages.length > 1;

  // lignes agrandies là où un nom vertical ne tiendrait pas en 10,5 px
  const hauteurs = lignes.map(() => FT_H), premiere = new Map();
  chemins.forEach((ch, r) => ch.forEach((n) => { if (!premiere.has(n)) premiere.set(n, r); }));
  premiere.forEach((r0, n) => {
    const rs = nbLignes.get(n);
    if (ftCol(n) > 3 || !n.k || rs < 2) return;
    const besoin = Math.ceil((n.n.length * 0.6 * 10.5 + 8) / rs);
    for (let r = r0; r < r0 + rs; r++) hauteurs[r] = Math.max(hauteurs[r], besoin);
  });

  const texteAge = (b) => (details ? ftTexteAge(b) : ftArrondi(b.v !== undefined ? b.v : +b.txt));
  let html = `<table class="ft${details ? " ft-details" : ""}"><thead><tr>${cols.map((c) => `<th>${FT_TITRES[c]}</th>`).join("")}
    <th class="ft-th-age">Âge (Ma)</th>${colonnes.map(() => "<th></th>").join("")}</tr></thead><tbody>`;
  const emis = new Set();
  let r = 0;
  blocs.forEach((bl, bi) => {
    if (bi > 0) {
      const sautes = ftEres().filter((e) => e.sommet >= blocs[bi - 1].base - 1e-9 && e.base.v <= bl.sommet + 1e-9).map((e) => e.n);
      html += `<tr class="ft-saut"><td colspan="${cols.length + 1 + colonnes.length}">⋯ ${sautes.join(", ")} ⋯</td></tr>`;
    }
    bl.lignes.forEach((ligne, k) => {
      const t0 = ligne.sommet, t1 = ligne.base.v;
      const touchee = ages.some((a) => ftChevauche(a, t0, t1) > 0);
      html += hauteurs[r] > FT_H ? `<tr style="height:${hauteurs[r]}px">` : "<tr>";
      chemins[r].forEach((n, i) => {
        if (emis.has(n)) return;
        emis.add(n);
        const suivant = chemins[r][i + 1];
        const span = idx(suivant ? ftCol(suivant) : cols[cols.length - 1] + 1) - idx(ftCol(n));
        const rs = nbLignes.get(n);
        const encre = luminance(n.c) > 0.55 ? "#1b1b1b" : "#ffffff";
        const vert = ftCol(n) <= 3 && span === 1 && rs > 1;
        const haut = hauteurs.slice(r, r + rs).reduce((x, y) => x + y, 0);
        const taille = vert ? Math.max(8.5, Math.min(13, (haut - 8) / (n.n.length * 0.6))) : 0;
        const parents = ftChemin(n).slice(1, -1).map((x) => x.n).join(" › ");
        const tipU = `<b>${n.n}</b>${parents ? `<span class="ft-tip-chemin">${parents}</span><br>` : ""}Début : ${ftTexteAge(n.base)} Ma<br>Fin : ${n.sommet === 0 ? "aujourd'hui" : ftTexteAge(ftSommet(n)) + " Ma"}<br>Durée : ${fmtMa(n.base.v - n.sommet)}`;
        const classes = ["ft-u", vert ? "ft-vert" : "", n.i ? "ft-inf" : "", n === ligne && touchee ? "ft-touche" : ""].filter(Boolean).join(" ");
        html += `<td class="${classes}" data-tip="${ftAttr(tipU)}"${rs > 1 ? ` rowspan="${rs}"` : ""}${span > 1 ? ` colspan="${span}"` : ""}
          style="background:${n.c};color:${encre}${taille ? `;font-size:${taille.toFixed(1)}px` : ""}"><span>${n.n}</span></td>`;
      });
      const sommet = ftSommet(ligne);
      html += `<td class="ft-age">${k === 0 ? `<span class="ft-haut" data-tip="${ftAttr(`<b>${ftTexteAge(sommet)} Ma</b>`)}">${t0 === 0 ? "0" : texteAge(sommet)}</span>` : ""}
        <span class="ft-bas" data-tip="${ftAttr(`<b>${ftTexteAge(ligne.base)} Ma</b>`)}">${texteAge(ligne.base)}</span></td>`;
      colonnes.forEach((groupe) => {
        let barre = "";
        groupe.forEach((a) => {
          const lo = Math.max(t0, a.a), hi = Math.min(t1, a.de);
          if (hi <= lo) return;
          const haut = (lo - t0) / (t1 - t0) * 100, h = (hi - lo) / (t1 - t0) * 100;
          const cl = ["ft-barre", a.a > t0 ? "debut" : "", a.de < t1 ? "fin" : ""].filter(Boolean).join(" ");
          const num = ages.indexOf(a) + 1;
          barre += `<i class="${cl}" style="top:${haut.toFixed(2)}%;height:${h.toFixed(2)}%" data-tip="${ftAttr(`<b>${a.label}</b>Début : ${fmtMa(a.de)}<br>Fin : ${fmtMa(a.a)}<br>Durée : ${fmtMa(a.de - a.a)}`)}"></i>`;
          if (numeroter && ((a.a >= t0 && a.a < t1) || (k === 0 && a.a < t0))) barre += `<b class="ft-num">${num}</b>`;
        });
        html += `<td class="ft-roche">${barre}</td>`;
      });
      html += "</tr>";
      r++;
    });
  });
  return html + "</tbody></table>";
}

function friseHTML(rock) {
  const bascule = (cle, nom) => `<label class="ft-bascule"><input type="checkbox" data-ftregl="${cle}"${ftReglages[cle] ? " checked" : ""}><i></i>${nom}</label>`;
  return `<div class="ft-reglages">${bascule("tout", "Toute l'échelle")}${bascule("details", "Âges détaillés")}</div>
    <div class="chart-wrap ft-wrap" id="ft-table">${friseTableHTML(rock)}</div>`;
}
function friseSourceHTML() {
  return `<p class="page-source">Échelle des temps géologiques : <a href="https://stratigraphy.org/chart" target="_blank" rel="noopener">Charte
    chronostratigraphique internationale</a>, ICS ${ECHELLE_TEMPS.version} (Cohen et al., <i>Episodes</i> 48 : 105-115, 2025,
    mise à jour de juin 2026) ; couleurs de la CCGM (Commission de la carte géologique du monde).</p>`;
}
function brancherFrise(rock) {
  const racine = $("#ft-table");
  if (!racine) return;
  bindTips(racine);
  racine.closest(".card").querySelectorAll("[data-ftregl]").forEach((c) => c.addEventListener("change", () => {
    ftReglages[c.dataset.ftregl] = c.checked;
    racine.innerHTML = friseTableHTML(rock);
  }));
}

// ---------------- réglette de vitesse ----------------
function rateStripSVG(rock) {
  const W = 1000, H = 108, x0 = 14, x1 = 986, cy = 66;
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vitesse d'altération sur une échelle logarithmique">`;
  svg += `<text x="${x0}" y="14" class="axis-lab">mm par an — échelle logarithmique (points gris : les ${ROCHES.length - 1} autres roches)</text>`;
  for (const d of DECADES) {
    const xd = xLog(d, x0, x1);
    svg += `<line x1="${xd}" y1="24" x2="${xd}" y2="${H - 24}" class="hairline"/>
      <text x="${xd}" y="${H - 8}" text-anchor="middle" class="tick-lab">${fmt(d, 2)}</text>`;
  }
  for (const r of ROCHES) {
    if (r.id === rock.id) continue;
    svg += `<circle cx="${xLog(geomean(r), x0, x1)}" cy="${cy}" r="4" fill="var(--baseline)"
      data-tip="<b>${r.nom}</b>${fmtRate(r.alteration.vmin)} à ${fmtRate(r.alteration.vmax)} mm/an"/>`;
  }
  const xa = xLog(rock.alteration.vmin, x0, x1), xb = xLog(rock.alteration.vmax, x0, x1);
  svg += `<rect x="${xa}" y="${cy - 7}" width="${Math.max(xb - xa, 6)}" height="14" rx="7"
      fill="${catColor(rock.categorie)}" stroke="var(--surface)" stroke-width="2"
      data-tip="<b>${rock.nom}</b>${fmtRate(rock.alteration.vmin)} à ${fmtRate(rock.alteration.vmax)} mm/an"/>
    <text x="${xa - 10}" y="${cy + 4}" text-anchor="end" class="band-lab">${fmtRate(rock.alteration.vmin)}</text>
    <text x="${xb + 10}" y="${cy + 4}" text-anchor="start" class="band-lab">${fmtRate(rock.alteration.vmax)}</text>`;
  svg += "</svg>";
  return svg;
}

// ---------------- produits pour 1 kg ----------------
function productsHTML(rock) {
  const present = PRODUITS_META.filter((p) => (rock.produits[p.id] || 0) > 0);
  const segs = present.map((p) => {
    const v = rock.produits[p.id];
    const pct = v / 10;
    const label = v >= 90 ? `<span>${fmt(v)} g</span>` : "";
    return `<div class="seg" style="flex:${v};background:${prodColor(p.id)}"
      data-tip="<b>${p.nom}</b>${fmt(v)} g pour 1 kg (${fmt(pct, 3)} %)">${label}</div>`;
  }).join("");
  const legend = present.map((p) => `<span class="key"><i style="background:${prodColor(p.id)}"></i>${p.nom}</span>`).join("");
  const rows = present.map((p) => `<tr><td><span class="key"><i style="background:${prodColor(p.id)};width:10px;height:10px;display:inline-block;border-radius:3px;margin-right:8px"></i>${p.id === "autre" && rock.autreLabel ? rock.autreLabel : p.nom}</span></td>
    <td class="num">${fmt(rock.produits[p.id])} g</td><td class="num">${fmt(rock.produits[p.id] / 10, 3)} %</td></tr>`).join("");
  return `<div class="pbar" id="pbar">${segs}</div><div class="legend">${legend}</div>
    <table class="data"><thead><tr><th>Produit</th><th class="num">pour 1 kg</th><th class="num">part</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="note">${rock.produitsNote}</div>
    ${window.BilanAlteration ? BilanAlteration.explicationHTML(rock) : ""}`;
}

// ---------------- triangle des textures (D.2) ----------------
function textureTriangleHTML(rock) {
  const p = rock.produits || {};
  const sable = p.sable || 0, limon = p.limon || 0, argile = p.argile || 0;
  if (sable + limon + argile <= 0) {
    return `<p class="sub">Triangle des textures non représentable : cette roche ne libère pratiquement pas de sable, de limon ou d'argile (l'essentiel part en solution).</p>`;
  }
  const r = geppaClasser(sable, limon, argile);
  const [x0, baseY, side] = [42, 268, 250];
  // escala : coordonnées cartésiennes normalisées (déjà issues de geppaXY) -> repère SVG
  const escala = ([nx, ny]) => [x0 + nx * side, baseY - ny * side];
  // toXY : fraction [argile, limon, sable] -> repère SVG (fait les deux conversions)
  const toXY = (frac) => escala(geppaXY(frac));
  const c = catColor(rock.categorie);
  let svg = `<svg viewBox="0 0 340 300" class="triangle-svg" role="img" aria-label="Triangle des textures GEPPA">`;
  svg += GEPPA_CLASSES.map((cl) => {
    const sommets = geppaPolyOf(cl);
    const pts = sommets.map(escala).map((p) => p.join(",")).join(" ");
    const surligne = r && r.classe.code === cl.code;
    const cx = sommets.reduce((s, p) => s + p[0], 0) / sommets.length;
    const cy = sommets.reduce((s, p) => s + p[1], 0) / sommets.length;
    const [lx2, ly2] = escala([cx, cy]);
    return `<polygon points="${pts}" fill="${surligne ? c : "none"}" fill-opacity="${surligne ? 0.22 : 0}"
        stroke="${surligne ? c : "var(--border)"}" stroke-width="${surligne ? 1.6 : 1}" pointer-events="all"
        data-tip="<b>${cl.nom}</b> (${cl.code})"/>
      <text x="${lx2}" y="${ly2}" text-anchor="middle" dominant-baseline="middle" class="tri-lab"${surligne ? ' font-weight="700"' : ""}>${cl.code}</text>`;
  }).join("");
  const [ax, ay] = toXY([1, 0]), [sx, sy] = toXY([0, 0]), [lxv, lyv] = toXY([0, 1]);
  svg += `<polygon points="${ax},${ay} ${sx},${sy} ${lxv},${lyv}" fill="none" stroke="var(--ink)" stroke-width="1.6"/>`;
  svg += `<text x="${ax}" y="${ay - 12}" text-anchor="middle" class="tri-axe">Argile 100 %</text>
    <text x="${sx - 6}" y="${sy + 18}" text-anchor="start" class="tri-axe">Sable 100 %</text>
    <text x="${lxv + 6}" y="${lyv + 18}" text-anchor="end" class="tri-axe">Limon 100 %</text>`;
  if (r) {
    const [px, py] = toXY(r.frac);
    svg += `<circle cx="${px}" cy="${py}" r="6" fill="${c}" stroke="var(--surface)" stroke-width="2"
      data-tip="<b>${rock.nom}</b>${fmt(r.frac[2] * 100, 3)} % sable · ${fmt(r.frac[1] * 100, 3)} % limon · ${fmt(r.frac[0] * 100, 3)} % argile<br>Classe GEPPA : <b>${r.classe.nom}</b>"/>`;
  }
  svg += "</svg>";
  const note = r
    ? `<p class="sub"><b>Texture dominante : ${r.classe.nom}</b> (${r.classe.code}) — d'après les seules proportions de sable, limon et argile produites (dissous et oxydes exclus, ${fmt(sable, 3)}/${fmt(limon, 3)}/${fmt(argile, 3)} g pour 1 kg, ramenés à 100 %).</p>`
    : "";
  return `<div class="chart-wrap">${svg}</div>${note}
    <p class="note">Triangle du GEPPA (Groupe d'étude des problèmes de pédologie appliquée, 1963), la référence en pédologie française (Baize, 1995). Limites granulométriques du GEPPA : argile &lt; 2 µm, limon 2–50 µm, sable 50–2000 µm — légèrement différentes de la convention sédimentologique 2–63 µm utilisée ci-dessus pour les produits d'altération ; le classement reste donc approximatif.</p>`;
}

// ---------------- bloc « Formation » en tête de fiche roche (C.1) ----------------
// Gabarit commun aux trois familles : étapes du processus (schémas C.2), conditions de formation (C.4),
// structure 3D du minéral principal (C.3). Le processus est celui de la BRANCHE de l'arbre BRGM ;
// `schema` / `conditions` pourront être fournis par fiche (champ `formation` de la roche) et remplaceront l'attente.
const FORMATION_GABARITS = {
  "M.1": { etapes: ["Fusion partielle en profondeur", "Montée du magma", "Cristallisation lente, à plusieurs kilomètres de profondeur", "Mise à l'affleurement par l'érosion"],
    conditions: "Diagramme pression–température : champs de cristallisation des minéraux et chemin de refroidissement du magma." },
  "M.2": { etapes: ["Fusion partielle en profondeur", "Montée du magma", "Éruption", "Refroidissement rapide en surface"],
    conditions: "Diagramme pression–température : cristallisation dans la chambre magmatique, puis trempe en surface." },
  "M.3": { etapes: ["Fusion partielle en profondeur", "Montée du magma", "Mise en place en filon ou en petit massif", "Refroidissement en deux temps : gros cristaux, puis pâte fine"],
    conditions: "Diagramme pression–température : cristallisation des premiers minéraux en profondeur, puis refroidissement près de la surface." },
  "M.4": { etapes: ["Fusion partielle du manteau, magma riche en carbonates", "Montée du magma", "Cristallisation des carbonates", "Mise à l'affleurement par l'érosion"],
    conditions: "Diagramme pression–température : domaine de stabilité du magma carbonaté." },
  "S.1": { etapes: ["Altération et érosion d'une roche source", "Transport des grains", "Dépôt en couches", "Diagenèse : compaction et cimentation"],
    conditions: "Enfouissement : profondeur et température atteintes pendant la diagenèse." },
  "S.2": { etapes: ["Production du carbonate, par des organismes ou par précipitation", "Accumulation sur le fond", "Enfouissement", "Diagenèse : compaction, cimentation, recristallisation"],
    conditions: "Saturation de l'eau en carbonate de calcium : température, CO₂ dissous, profondeur." },
  "S.3": { etapes: ["Ions dissous dans l'eau", "Précipitation, par saturation ou par des organismes", "Accumulation", "Enfouissement et diagenèse"],
    conditions: "Seuils de saturation : concentration de l'eau face à la solubilité des minéraux qui précipitent." },
  "S.4": { etapes: ["Accumulation de débris végétaux ou de plancton", "Enfouissement à l'abri de l'oxygène", "Maturation avec la profondeur : de la tourbe à l'anthracite"],
    conditions: "Enfouissement : température et durée de maturation de la matière organique." },
  "S.5": { etapes: ["Roche mère", "Altération chimique sur place", "Départ des éléments solubles", "Accumulation sur place de ce qui reste ou précipite"],
    conditions: "Climat et drainage : température, pluie ÷ ETP et durée de l'altération." },
  "S.6": { etapes: ["Altération et érosion", "Transport par l'eau, le vent, la glace ou la gravité", "Dépôt récent, non consolidé"],
    conditions: "Agent de transport et énergie du dépôt." },
  "R.1": { etapes: ["Roche d'origine (protolithe)", "Enfouissement lors d'une collision", "Recristallisation à haute pression et température", "Remontée à la surface"],
    conditions: "Diagramme pression–température : faciès métamorphiques et chemin suivi par la roche." },
  "R.2": { etapes: ["Roche d'origine (protolithe)", "Intrusion d'un magma voisin", "Recristallisation par la chaleur", "Refroidissement"],
    conditions: "Diagramme pression–température : faciès de contact, température décroissante en s'éloignant de l'intrusion." },
  "R.3": { etapes: ["Roche d'origine (protolithe)", "Déformation dans une zone de faille", "Broyage ou recristallisation des grains", "Remontée à la surface"],
    conditions: "Diagramme pression–température : régime cassant près de la surface, ductile en profondeur." },
  "R.4": { etapes: ["Roche d'origine (protolithe)", "Circulation de fluides chauds", "Échanges chimiques avec la roche", "Nouveaux minéraux"],
    conditions: "Diagramme pression–température et composition des fluides." },
};

// minéral principal (le plus abondant) ; s'il n'a pas de structure 3D, le plus abondant qui en a une,
// à condition qu'il forme au moins 15 % de la roche (sinon on montrerait un accessoire à 2 %)
function formationMineral3D(rock) {
  const liste = (rock.mineraux || []).slice().sort((a, b) => b[1] - a[1]);
  if (!liste.length) return { principal: null, affiche: null };
  const total = liste.reduce((s, [, p]) => s + p, 0);
  const pct = (p) => Math.round(p / total * 100);
  const principal = { id: liste[0][0], pct: pct(liste[0][1]) };
  const trouve = liste.find(([id, p]) => Structure3D.existe(id) && (id === principal.id || pct(p) >= 15));
  return { principal, affiche: trouve ? { id: trouve[0], pct: pct(trouve[1]) } : null };
}

function formationHTML(rock) {
  const place = placeRoche(rock.id);
  const g = (place && FORMATION_GABARITS[place.branche.code]) || null;
  const f = rock.formation || {};
  const attente = (t) => `<p class="form-attente">${t}</p>`;
  const nomMin = (id) => MINERAUX[id] ? MINERAUX[id].nom.split(" (")[0] : id;

  // schémas des étapes (formation.js, C.2) ; à défaut, gabarit de la branche avec cases vides
  const anim = window.FormationAnim && Formation.animation ? Formation.animation(rock) : null;
  const schemas = window.Formation && !anim ? Formation.etapes(rock) : null;
  const liste = schemas || (g ? g.etapes.map((titre, i) => ({ titre, svg: f.schemas && f.schemas[i] ? f.schemas[i] : "" })) : []);
  const etapes = liste.length ? `<ol class="form-etapes" style="--n:${liste.length}">${liste.map((e, i) => `
      <li><div class="form-case">${e.svg}</div><span><b>${i + 1}</b>${e.titre}</span></li>`).join("")}</ol>` : "";
  const conditions = (window.Formation && Formation.conditions(rock)) || f.conditions;

  const { principal, affiche } = formationMineral3D(rock);
  let structure;
  if (!principal) structure = attente("Composition non détaillée.");
  else {
    const total = rock.mineraux.reduce((s, [, p]) => s + p, 0);
    const chips = rock.mineraux.slice().sort((a, b) => b[1] - a[1]).map(([id, p]) => {
      const m = MINERAUX[id];
      const dispo = Structure3D.existe(id);
      const pct = Math.round(p / total * 100);
      return `<button type="button" class="min-chip${id === (affiche || {}).id ? " on" : ""}" data-s3d-pick="${id}" ${dispo ? "" : "disabled"}>
        <span class="sw" style="background:${m.swatch}"></span>${nomMin(id)} <small>${fmt(pct)} %</small></button>`;
    }).join("");
    const viewer = affiche ? `<div data-s3d="${affiche.id}" data-s3d-source="bas" data-s3d-replier data-s3d-tourne></div>`
      : attente(MINERAUX[principal.id] && /amorphe|verre|organique/i.test(MINERAUX[principal.id].famille || "")
        ? "Phase non cristalline : pas de réseau d'atomes ordonné à représenter."
        : "Structure atomique non encore disponible pour ce minéral.");
    structure = `<div class="min-chips" id="form-struct-chips">${chips}</div>
      <div id="form-struct-viewer">${viewer}</div>`;
  }

  const texture = window.Textures ? Textures.panneau(rock) : null;

  return `
  <div class="card form-schema">
    <h2>Étapes de formation</h2>
    ${anim ? `<div id="form-anim"></div>` : place ? `<p class="sub">Processus type ${/^métamorphisme/i.test(place.branche.nom) ? "du" : /^métasomatose/i.test(place.branche.nom) ? "de la" : "des"} ${place.branche.nom.toLowerCase()} (${place.branche.code}).</p>` : ""}
    ${anim ? "" : etapes}
    ${anim || schemas || f.schemas ? "" : attente("Schémas de chaque étape à venir.")}
  </div>

  <div class="card form-conditions">
    ${conditions || (g ? `<p class="form-prevu">${g.conditions}</p>` : "") + attente("Diagramme à venir.")}
  </div>

  ${texture ? `<div class="card form-texture">
    <h2>Schéma de la roche</h2>
    ${texture}
  </div>` : ""}

  <div class="card form-structure">
    ${structure}
  </div>`;
}

// ---------------- fiche roche ----------------
// mise en page allégée (02/10/2026) : panneaux en travaux, haut de panneau replié, photo en tête
const EN_TRAVAUX = `<span class="en-travaux">🚧 en travaux</span>`;
const replie = (html, titre = "Explications") => `<details class="haut-replie"><summary>${titre}</summary>${html}</details>`;

// crédit d'une photo Wikimedia (07/10/2026) : les licences libres (CC BY, CC BY-SA…) imposent
// d'afficher l'AUTEUR et la LICENCE. On les lit dans la page de description du fichier
// (Commons, ou Wikipédia en français pour les fichiers locaux), d'après l'adresse de la vignette.
const _creditsPhotos = {};
function creditPhoto(thumbUrl) {
  // vignettes servies par upload.wikimedia.org ou, depuis 2026, thumb.wikimedia.org
  const m = /(?:upload|thumb)\.wikimedia\.org\/wikipedia\/(commons|fr)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?]+)/.exec(thumbUrl || "");
  if (!m) return Promise.resolve(null);
  const fichier = decodeURIComponent(m[2]), wiki = m[1] === "commons" ? "commons.wikimedia.org" : "fr.wikipedia.org";
  const cle = wiki + "|" + fichier;
  if (!_creditsPhotos[cle]) {
    _creditsPhotos[cle] = fetch(`https://${wiki}/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata|url&titles=${encodeURIComponent("File:" + fichier)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        const page = j && j.query && Object.values(j.query.pages || {})[0];
        const info = page && page.imageinfo && page.imageinfo[0];
        if (!info) return null;
        const md = info.extmetadata || {};
        const texte = (h) => { const d = document.createElement("div"); d.innerHTML = h || ""; return d.textContent.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim(); };
        let auteur = texte(md.Artist && md.Artist.value) || texte(md.Credit && md.Credit.value);
        if (auteur.length > 60) auteur = auteur.slice(0, 57).trim() + "…";
        const licence = texte(md.LicenseShortName && md.LicenseShortName.value) || "licence libre";
        return { auteur, licence, page: info.descriptionurl || `https://${wiki}/wiki/File:${encodeURIComponent(fichier)}` };
      })
      .catch(() => null);
  }
  return _creditsPhotos[cle];
}
const escHTML = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// légende « Photo : auteur · licence ↗ » ; repli sur un lien vers la page de l'image
async function legendePhoto(thumbUrl) {
  const c = await creditPhoto(thumbUrl);
  if (!c) return `Photo Wikimedia Commons, licence libre`;
  return `<a href="${escHTML(c.page)}" target="_blank" rel="noopener">Photo : ${c.auteur ? escHTML(c.auteur) + " · " : ""}${escHTML(c.licence)} ↗</a>`;
}

// photo de la roche en haut à droite (vignette de l'article Wikipédia, auteur et licence dessous)
async function photoRoche(rock) {
  const slot = $("#roche-photo");
  if (!slot || !rock.wikipedia) return;
  try {
    const title = decodeURIComponent(rock.wikipedia.split("/wiki/")[1]);
    const r = await fetch("https://fr.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title));
    if (!r.ok) return;
    const j = await r.json();
    if (j.thumbnail && j.thumbnail.source && slot.isConnected) {
      slot.innerHTML = `<img src="${j.thumbnail.source}" alt="${rock.nom}"><div class="cap"></div>`;
      const cap = await legendePhoto(j.thumbnail.source);
      if (slot.isConnected) slot.querySelector(".cap").innerHTML = cap;
    }
  } catch { /* hors connexion : la pastille de couleur reste */ }
}

// minéraux de la roche selon dureté, altérabilité et masse volumique (02/10/2026) : un disque par minéral,
// d'aire proportionnelle à sa part ; trait noir = valeur de la roche (moyenne pondérée par les parts)
function mineralesProprietesHTML(rock) {
  const liste = (rock.mineraux || []).filter(([id]) => MINERAUX[id]);
  if (!liste.length) return "";
  const total = liste.reduce((s, [, p]) => s + p, 0);
  const LIGNES = [
    { champ: "durete", nom: "Dureté", min: 1, max: 10, ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], bouts: ["tendre", "dur"], u: (v) => `${fmt(v, 2)} (Mohs)` },
    { champ: "stabilite", nom: "Altérabilité", min: 1, max: 10, ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], bouts: ["s'altère vite", "inaltérable"], u: (v) => `${fmt(v, 2)}/10` },
    { champ: "densite", nom: "Masse volumique", min: 1, max: 5, ticks: [1, 2, 3, 4, 5], bouts: ["léger", "lourd"], u: (v) => `${fmt(v, 3)} g/cm³` },
  ];
  const W = 1000, G = 118, D = 985;
  const X = (L, v) => G + (Math.max(L.min, Math.min(L.max, v)) - L.min) / (L.max - L.min) * (D - G);
  let svg = "", y = 0;
  for (const L of LIGNES) {
    const pts = liste.map(([id, p]) => ({ id, p: p / total, v: MINERAUX[id][L.champ] })).filter((q) => typeof q.v === "number");
    if (!pts.length) continue;
    const pt = pts.reduce((s, q) => s + q.p, 0);
    const moy = pts.reduce((s, q) => s + q.p * q.v, 0) / pt;
    const ya = y + 38;
    svg += `<text x="0" y="${ya + 4}" class="mp-nom">${L.nom}</text>`
      + `<line x1="${G}" x2="${D}" y1="${ya}" y2="${ya}" class="mp-axe"/>`
      + L.ticks.map((t) => `<text x="${X(L, t)}" y="${ya + 30}" class="mp-tick">${fmt(t)}</text>`).join("")
      + `<text x="0" y="${ya + 19}" class="mp-bout">${L.bouts[0]} → ${L.bouts[1]}</text>`;
    // les plus gros d'abord, pour que les petits restent visibles par-dessus
    pts.slice().sort((a, b) => b.p - a.p).forEach((q) => {
      const m = MINERAUX[q.id], r = Math.max(2.5, 18 * Math.sqrt(q.p));
      svg += `<circle cx="${X(L, q.v).toFixed(1)}" cy="${ya}" r="${r.toFixed(1)}" fill="${m.swatch}" class="mp-disque"
        data-tip="<b>${m.nom.split(" (")[0]}</b>${fmt(Math.round(q.p * 100))} %"/>`;
    });
    const xm = X(L, moy).toFixed(1);
    svg += `<line x1="${xm}" x2="${xm}" y1="${ya - 21}" y2="${ya + 19}" class="mp-roche"/>`
      + `<text x="${xm}" y="${ya - 25}" class="mp-roche-t" text-anchor="middle">${rock.nom} : ${L.u(moy)}</text>`;
    y += 66;
  }
  const leg = liste.slice().sort((a, b) => b[1] - a[1]).map(([id, p]) =>
    `<span><i style="background:${MINERAUX[id].swatch}"></i>${MINERAUX[id].nom.split(" (")[0]} ${fmt(Math.round(p / total * 100))} %</span>`).join("");
  return `<div class="card min-proprietes">
    <div class="chart-wrap" id="mp-chart"><svg viewBox="0 0 ${W} ${y + 4}" class="mp-svg" role="img" aria-label="Dureté, altérabilité et masse volumique des minéraux de la roche">${svg}</svg></div>
  </div>`;
}

function renderRock(rock) {
  const a = rock.alteration || null;
  const hasRate = !!(a && a.vmin != null && a.vmax != null);
  const hasProd = !!rock.produits;
  const grise = "<span style=\"opacity:.55;font-style:italic\">non renseignée pour cette roche</span>";
  const cube = Math.cbrt(1 / rock.densite) * 1000; // arête (mm) d'un cube d'1 kg
  const tMin = hasRate ? cube / 2 / a.vmax : null, tMax = hasRate ? cube / 2 / a.vmin : null;
  const meter = a && a.facilite != null ? Array.from({ length: 5 }, (_, i) => `<i class="${i < a.facilite ? "f" : ""}"></i>`).join("") : "";

  $("#main").innerHTML = `<div class="page-roche">
  <div class="card rock-head">
    <h1><span class="sw-big" style="background:${rock.swatch}"></span>${rock.nom}
      <span class="badge" style="background:${catColor(rock.categorie)}">${CATEGORIES[rock.categorie].nom}</span>
      <span class="badge outline">${rock.sousType}</span>
      ${rock.codes ? `<span class="codes-tete">${rock.codes.map((c) => `<span class="code-chip" data-tip="<b>${c.code}</b>${c.sens}">${c.code}</span>`).join("")}</span>` : ""}</h1>
    ${rocheCrumbHTML(rock)}
    <div class="arg-photo roche-photo" id="roche-photo"><span class="sw-ph" style="background:${rock.swatch}"></span></div>
    <p class="desc">${rock.description}</p>
    <p class="sub"><b>Minéralogie :</b> ${rock.mineralogie}</p>
  </div>

  ${mineralesProprietesHTML(rock)}

  ${formationHTML(rock)}

  <div class="card map-card" id="map-card">
    <h2>${rock.regions && rock.regions.length && rock.regions.every((r) => r.etranger) ? "Où la trouver ?" : "Où la trouver en France ?"}</h2>
    ${rock.regions && rock.regions.length && rock.regions.every((r) => r.etranger) ? `<p class="sub"><b>Roche absente de France</b> (ou sans affleurement notable) : la pastille marque le site de référence à l'étranger, celui que suit l'animation de formation.</p>` : ""}
    <div class="map-boite"><div id="map"></div><button type="button" class="map-fs-btn map-fs-sur" id="map-fs-btn">⤢ Agrandir</button></div>
  </div>

  ${rock.varietes && rock.varietes.length ? `<div class="card form-varietes">
    <h2>Variétés &amp; faciès</h2>
    ${window.Textures ? Textures.varietes(rock) : ""}
  </div>` : ""}

  <div class="card">
    <h2>Quand s'est-elle formée ?</h2>
    ${rock.ages && rock.ages.length ? `${friseHTML(rock)}` : `<p class="sub">Âge de formation ${grise}.</p>`}
  </div>

  <details class="card replie-travaux"><summary><h2>À quelle vitesse s'altère-t-elle ? ${EN_TRAVAUX}</h2></summary>
    ${a && (a.mecanisme || a.climat) ? (`${a.mecanisme ? `<p><b>Mécanisme :</b> ${a.mecanisme}</p>` : ""}
    ${hasRate && a.climat ? `<p><b>Effet du climat / mesures :</b> ${a.climat}</p>` : ""}`) : ""}
    ${hasRate ? `<div class="chart-wrap" id="rate-chart">${rateStripSVG(rock)}</div>
    <div class="tiles">
      <div class="tile"><div class="lab">Un cube d'1 kg (arête ${fmt(Math.round(cube))} mm) exposé à l'air s'altère entièrement en…</div>
        <div class="val">${fmtAns(tMin)} <small>à</small> ${fmtAns(tMax)}</div></div>
      <div class="tile"><div class="lab">Production de régolithe (à vitesse moyenne)</div>
        <div class="val">${fmt(geomean(rock) * rock.densite, 2)} <small>g par m² et par an</small></div></div>
    </div>
    ${window.BilanAlteration ? BilanAlteration.pluieHTML(rock) : ""}` : `<p class="sub">Vitesse d'altération chiffrée ${grise}. Le mécanisme qualitatif est décrit ci-dessus.</p>`}
    ${window.BilanAlteration ? BilanAlteration.reactionsHTML(rock) : ""}
  </details>

  <details class="card replie-travaux"><summary><h2>1 kg altéré : qu'est-ce qui en sort ? ${EN_TRAVAUX}</h2></summary>
    ${hasProd ? `<p class="sub">Bilan de masse d'1 kg de ${rock.nom.toLowerCase()} entièrement altéré, en climat tempéré (8–15 °C, 600–1 100 mm/an), calculé à partir de sa composition minérale.</p>
    <div id="prod-chart">${productsHTML(rock)}</div>
    ${argilesProduitesHTML(rock)}
    <h3 style="margin-top:18px">Quelle texture, une fois altérée ?</h3>
    <p class="sub">La part solide de ce bilan — sable, limons, argiles — placée sur le triangle des textures, pour nommer le matériau qui en résulte.</p>
    <div id="texture-chart">${textureTriangleHTML(rock)}</div>` : `<p class="sub">Bilan de masse chiffré ${grise}. À la louche, d'après la minéralogie ci-dessus : le quartz donne du sable, les feldspaths et micas des argiles + ions dissous, les minéraux ferro-magnésiens (pyroxènes, amphiboles, biotite, olivine) des argiles + oxydes de fer.</p>`}
  </details>

  ${window.Pourquoi ? Pourquoi.carte(rock) : ""}

  <details class="card replie-travaux"><summary><h2>Pour aller plus loin</h2></summary>
    <p class="sub"><b>Usages :</b> ${rock.usages}</p>
    ${window.PlusLoin ? PlusLoin.html(rock) : ""}
  </details>
  <details class="card sources-roche"><summary><h2 style="display:inline">Sources</h2></summary>
  ${window.Formation ? Formation.sources(rock) : ""}
  ${window.Pourquoi ? Pourquoi.sources(rock) : ""}
  ${window.PlusLoin ? PlusLoin.sources(rock) : ""}
  ${(() => { const m = formationMineral3D(rock).affiche; return m ? `<p class="page-source" data-s3d-ref="${m.id}"></p>` : ""; })()}
  ${rock.ages && rock.ages.length ? friseSourceHTML() : ""}
  ${rock.pedologieAuto ? `<p class="page-source"><b>Côté sols</b> — Baize D. et Girard M.-C., dir. (2009), <i>Référentiel pédologique 2008</i>, AFES, Quæ (références du Référentiel, attribuées par grand type de matériau).</p>` : ""}
  ${rock.alteration && rock.alteration.vmin != null ? `<p class="page-source"><b>Vitesse selon la pluie</b> — Turc L. (1961), <i>Annales agronomiques</i> 12, 13 ; Maher K. (2011), <i>Earth and Planetary Science Letters</i> 312, 48 ; White A. F. et Blum A. E. (1995), <i>Geochimica et Cosmochimica Acta</i> 59, 1729.</p>` : ""}
  <p class="page-source"><b>Photo de la roche</b> — <a href="${rock.wikipedia}" target="_blank" rel="noopener">Wikipédia</a> / Wikimedia Commons (licences libres, auteurs sur la page de l'image).</p>
  ${rocheBrgmHTML(rock).replace('class="sub"', 'class="page-source"')}
  </details></div>`;

  ["rate-chart", "prod-chart", "texture-chart", "mp-chart"].forEach((id) => { const el = $("#" + id); if (el) bindTips(el); });
  const structChips = $("#form-struct-chips");
  if (structChips) structChips.addEventListener("click", (e) => {
    const b = e.target.closest("[data-s3d-pick]");
    if (!b || b.disabled) return;
    const id = b.dataset.s3dPick;
    structChips.querySelectorAll("[data-s3d-pick]").forEach((x) => x.classList.toggle("on", x === b));
    const viewer = $("#form-struct-viewer");
    viewer.innerHTML = "";
    const el = document.createElement("div");
    el.dataset.s3d = id;
    el.dataset.s3dSource = "bas";
    el.dataset.s3dReplier = "";   // maille et description dans le volet (02/10/2026)
    el.dataset.s3dTourne = "";    // rotation lente d'office (02/10/2026)
    viewer.appendChild(el);
    Structure3D.brancher(viewer);
  });
  if (rock.ages && rock.ages.length) brancherFrise(rock);
  // conditions : on retire le blanc au-dessus du diagramme (02/10/2026)
  const fcSvg = $(".form-conditions .fc-svg");
  if (fcSvg && fcSvg.viewBox && fcSvg.viewBox.baseVal) {
    const cur = fcSvg.querySelector(".fc-curseur");   // le curseur de l'animation attend hors champ : on l'ignore
    if (cur) cur.style.display = "none";
    const vb = fcSvg.viewBox.baseVal, haut = Math.max(vb.y, fcSvg.getBBox().y - 6);
    if (cur) cur.style.display = "";
    if (haut > vb.y + 2) fcSvg.setAttribute("viewBox", `${vb.x} ${haut} ${vb.width} ${vb.y + vb.height - haut}`);
  }
  if ($("#form-anim")) FormationAnim.monter($("#form-anim"), rock, { lien: $(".form-conditions .fc") });
  if ($("#pourquoi .pq")) Pourquoi.monter($("#pourquoi .pq"), rock);
  if (window.Textures) Textures.remplir($(".form-varietes"));
  if (window.BilanAlteration) BilanAlteration.brancherPluie($("#main"), rock);
  Structure3D.brancher($("#main"));
  bindTips($("#main .rock-head"));
  if (rock.regions && rock.regions.length) renderMap(rock);
  else { const mp = $("#map"); if (mp) mp.innerHTML = `<p class="sub" style="padding:14px;opacity:.55;font-style:italic">Localisation cartographique non renseignée pour cette roche.</p>`; }
  photoRoche(rock);
  document.title = rock.nom + " — Atlas géologique";
}

// ---------------- carte ----------------
// Mots-clés de lithologie (cherchés dans le champ DESCR des formations BD Charm-50) par type de
// roche. Une roche peut porter un champ `litho50` (tableau) pour surcharger ; à défaut, son nom.
// La correspondance est faite sur un DÉBUT DE MOT normalisé : « granite » attrape granite/granites/
// granitique mais PAS « microgranite » — chaque type reste distinct. Certains recouvrements sont
// volontaires (une marno-calcaire ressort pour la marne ET le calcaire). Là où la carte au 1/50 000
// ne distingue pas un type fin, le surlignage est logiquement vide : c'est honnête, pas un bug.
const LITHO50_KW = {
  // — Sédimentaires —
  calcaire: ["calcaire"], travertin: ["travertin"], craie: ["craie"], tuffeau: ["tuffeau"],
  dolomie: ["dolomi"], marne: ["marne", "marno"], argile: ["argile", "argilite", "argilo"],
  sable: ["sable", "sablo"], gres: ["gres"], conglomerat: ["conglomerat", "poudingue"],
  arkose: ["arkose"], grauwacke: ["grauwacke", "greywacke"], siltite: ["siltite", "silt"],
  breche_sedimentaire: ["breche"], molasse: ["molasse"], flysch: ["flysch"],
  tillite: ["tillite", "diamictite"], loess: ["loess", "lehm"], alluvions: ["alluvion", "alluvio"],
  colluvions: ["colluvion"], eboulis: ["eboulis", "greze"], moraine: ["moraine", "till"],
  alterite: ["alterite", "arene", "saprolite"], dunes: ["dune"],
  terra_rossa: ["terra rossa", "decalcification"], argile_silex: ["argile a silex"],
  gypse: ["gypse"], sel: ["halite", "sel gemme", "evaporite"], houille: ["houille", "charbon"],
  tourbe: ["tourbe"], lignite: ["lignite"], anthracite: ["anthracite"],
  schiste_bitumineux: ["bitumineux"], meuliere: ["meuliere"], silex: ["silex", "chert"],
  radiolarite: ["radiolarite"], diatomite: ["diatomite"], gaize: ["gaize"],
  phosphorite: ["phosphorite", "phosphate"], anhydrite: ["anhydrite"],
  sylvinite: ["sylvinite", "sylvite", "potass"], laterite: ["laterite", "cuirasse"],
  bauxite: ["bauxite"], cargneule: ["cargneule", "cornieule"], falun: ["falun"],
  vase_tangue: ["tangue", "maerl", "vase"], calcrete: ["calcrete", "croute calcaire"],
  roche_ferrifere: ["minette", "ferrifere", "ferrugineux"],
  // — Magmatiques —
  granite: ["granite", "leucogranite", "monzogranite", "syenogranite", "granitoide"],
  granodiorite: ["granodiorite"], tonalite: ["tonalite"],
  trondhjemite: ["trondhjemite", "plagiogranite"], diorite: ["diorite"], monzonite: ["monzonite"],
  monzodiorite: ["monzodiorite"], syenite: ["syenite"], pyroxenite: ["pyroxenite"],
  hornblendite: ["hornblendite"], syenite_nephelinique: ["nepheline"],
  foidolite: ["foidolite", "ijolite", "urtite", "melteigite"], charnockite: ["charnockite"],
  gabbro: ["gabbro", "norite"], basalte: ["basalte"], trachyandesite: ["trachyandesite"],
  trachyte: ["trachyte"], rhyolite: ["rhyolite"], andesite: ["andesite"], dacite: ["dacite"],
  phonolite: ["phonolite"], basanite: ["basanite", "tephrite"], latite: ["latite"],
  picrite: ["picrite"], spilite: ["spilite"], ignimbrite: ["ignimbrite"],
  tuf_volcanique: ["cinerite", "tuf volcanique"], obsidienne: ["obsidienne"],
  komatiite: ["komatiite"], kimberlite: ["kimberlite", "lamproite"],
  pouzzolane: ["pouzzolane", "scorie"], microgranite: ["microgranite"], aplite: ["aplite"],
  pegmatite: ["pegmatite"], dolerite: ["dolerite", "diabase"],
  lamprophyre: ["lamprophyre", "kersantite", "spessartite", "vaugnerite"], porphyre: ["porphyre"],
  peridotite: ["peridotite", "lherzolite", "harzburgite", "dunite", "wehrlite"],
  trachybasalte: ["trachybasalte"], breche_volcanique: ["breche volcanique", "agglomerat"],
  microdiorite: ["microdiorite"], essexite: ["essexite"], carbonatite: ["carbonatite", "sovite"],
  // — Métamorphiques —
  gneiss: ["gneiss"], micaschiste: ["micaschiste"], ardoise: ["ardoise", "schiste ardoisier"],
  quartzite: ["quartzite"], marbre: ["marbre", "cipolin"], serpentinite: ["serpentin"],
  amphibolite: ["amphibolite"], eclogite: ["eclogite"], migmatite: ["migmatite", "anatexite"],
  leptynite: ["leptynite"], granulite_meta: ["granulite"],
  schiste_bleu: ["glaucophan", "schiste bleu"], schiste_vert: ["prasinite", "schiste vert"],
  corneenne: ["corneenne", "hornfels"], skarn: ["skarn"], mylonite: ["mylonite", "ultramylonite"],
  cataclasite: ["cataclasite"], pseudotachylite: ["pseudotachylite"], greisen: ["greisen"],
  fenite: ["fenite"], rodingite: ["rodingite"], calcschiste: ["calcschiste", "schiste lustre"],
  // L'astroblème de Rochechouart est cartographié sous ses brèches, pas sous le mot « impactite ».
  impactite: ["impactite", "suevite", "astrobleme", "rochechouart"],
};
// Mots qui signalent une lithologie ACCESSOIRE (« …, parfois gypse et cargneules »).
const LITHO50_ACCESS = /(parfois|localement|eventuellement|rare|trace|accessoire|sporadique|lentille|intercalation|passee)/;

// Renvoie une fonction descr -> 0 (rien) · 1 (mentionnée en accessoire) · 2 (lithologie dominante).
// Le BRGM nomme la lithologie DOMINANTE en tête de description et les accessoires ensuite : un
// mot-clé trouvé au-delà des ~60 premiers caractères, ou précédé d'un marqueur d'accessoire, ne
// désigne donc pas la roche principale de la formation. (Les 60 caractères laissent passer les
// préfixes de contexte du type « Massif granitique du Champ-du-Feu sud - Granodiorite à… ».)
function litho50Matcher(rock) {
  const kws = (rock.litho50 || LITHO50_KW[rock.id] || [rock.nom]).map(normalize);
  const esc = kws.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean)
    .sort((a, b) => b.length - a.length); // longest d'abord (alternance ordonnée)
  if (!esc.length) return () => 0;
  const re = new RegExp("\\b(" + esc.join("|") + ")"); // début de mot (préfixe) → gère les pluriels
  return (descr) => {
    const d = normalize(descr || "");
    const m = re.exec(d);
    if (!m) return 0;
    const avant = d.slice(Math.max(0, m.index - 25), m.index);
    return (m.index > 60 || LITHO50_ACCESS.test(avant)) ? 1 : 2;
  };
}

function renderMap(rock) {
  const div = $("#map");
  if (typeof L === "undefined") {
    div.innerHTML = `<div class="map-fallback">Carte indisponible : la bibliothèque Leaflet n'a pas pu être chargée (connexion internet requise).<br>
      Régions typiques : ${rock.regions.map((r) => r.nom).join(" · ")}</div>`;
    return;
  }
  if (map) { map.remove(); map = null; }
  map = L.map(div, { scrollWheelZoom: false, preferCanvas: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: "© OpenStreetMap",
  }).addTo(map);
  geolLayer = L.tileLayer.wms("https://geoservices.brgm.fr/geologie", {
    layers: "GEOLOGIE", format: "image/png", version: "1.3.0",
    opacity: 0.55, attribution: "© BRGM — cartes géologiques de la France (1/1 000 000 → 1/50 000 selon le zoom)",
  }).addTo(map);
  const color = cssVar("--cat-" + rock.categorie) || "#2a78d6";
  const markers = rock.regions.map((r) =>
    L.circleMarker([r.lat, r.lng], { radius: 9, color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.95 })
      .bindPopup(`<b>${r.nom}</b>`));
  const group = L.featureGroup(markers).addTo(map);
  if (rock.regions.length === 1) map.setView([rock.regions[0].lat, rock.regions[0].lng], 8);
  else map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 8 });

  if ($("#geol-on")) $("#geol-on").addEventListener("change", (e) => {
    if (e.target.checked) geolLayer.addTo(map); else map.removeLayer(geolLayer);
  });
  if ($("#geol-op")) $("#geol-op").addEventListener("input", (e) => geolLayer.setOpacity(e.target.value / 100));

  wireGeol50(rock, color);
  wireMapFullscreen();
}

// Bouton "Agrandir" de la carte : augmente sa hauteur (largeur inchangée), sans passer en plein écran.
function wireMapFullscreen() {
  const mapDiv = $("#map"), btn = $("#map-fs-btn");
  if (!mapDiv || !btn) return;
  btn.addEventListener("click", () => {
    const on = mapDiv.classList.toggle("is-tall");
    btn.textContent = on ? "⤡ Réduire" : "⤢ Agrandir";
    if (map) setTimeout(() => map.invalidateSize(), 0);
  });
}

// ---------------- vecteur 1/50 000 (LOD, chargement à la demande) ----------------
function wireGeol50(rock, color) {
  if (typeof GEOL50 === "undefined") return;
  const match = litho50Matcher(rock);
  const status = $("#geol50-status");
  const setStatus = (t) => { if (status) status.textContent = t; };

  // Édition légère : la carte vectorisée 1/50 000 (3 Go) n'est pas livrée. Le fond
  // géologique au 1/1 000 000 ci-dessus, lui, reste disponible.
  if (GEOL50.edition === "legere") {
    setStatus("Version allégée : la carte vectorisée 1/50 000 (3 Go) n'est pas incluse. "
      + "Le fond géologique BRGM au 1/1 000 000 reste affiché.");
    return;
  }
  const loaded = new Set();

  const nomBas = rock.nom.toLowerCase();
  const STYLES = {
    2: { color: "#ffffff", weight: 0.7, fillColor: color, fillOpacity: 0.72 },
    1: { color: color, weight: 0.7, dashArray: "3,2", fillColor: color, fillOpacity: 0.2 },
    0: { color: "#8a8f98", weight: 0.35, fillColor: "#9aa0a8", fillOpacity: 0.05 },
  };
  geol50Layer = L.geoJSON(null, {
    style: (f) => STYLES[match(f.properties.d)],
    onEachFeature: (f, lyr) => {
      const s = match(f.properties.d);
      const tag = s === 2 ? `<br><span style="color:${color}">◆ formation à dominante « ${nomBas} »</span>`
        : s === 1 ? `<br><span style="color:${color}">◇ ${nomBas} présent, mais en accessoire</span>` : "";
      lyr.bindPopup(`<b>${f.properties.n || "—"}</b><br>${f.properties.d || "—"}` + tag);
    },
  });

  // Petite légende sur la carte (affichée avec le vecteur 1/50 000).
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "geol50-legend");
    div.innerHTML = `<span class="sw" style="background:${color}"></span>à dominante « ${nomBas} »` +
      `<br><span class="sw acc" style="background:${color}"></span>${nomBas} en accessoire` +
      `<br><small>fond : BD Charm-50 (BRGM) — 1/50 000 vectorisé</small>`;
    return div;
  };
  let legendOn = false;
  const showLegend = (on) => {
    if (on && !legendOn) { legend.addTo(map); legendOn = true; }
    else if (!on && legendOn) { legend.remove(); legendOn = false; }
  };

  function update() {
    if (!GEOL50.indexPret) { setStatus("Préparation de la carte vectorisée 1/50 000…"); return; }
    if (map.getZoom() < GEOL50_MINZOOM) {
      if (map.hasLayer(geol50Layer)) map.removeLayer(geol50Layer);
      geol50Layer.clearLayers(); loaded.clear(); showLegend(false);
      setStatus(`↔ Zoome (niveau ${GEOL50_MINZOOM}+) pour afficher la carte vectorisée 1/50 000 et surligner les « ${rock.nom.toLowerCase()} ».`);
      return;
    }
    const avail = GEOL50.deptsForBounds(map.getBounds()).filter((d) => GEOL50.index[d]);
    if (!avail.length) {
      showLegend(false);
      setStatus("Vecteur 1/50 000 non disponible pour cette zone (couverture : France métropolitaine).");
      return;
    }
    if (!map.hasLayer(geol50Layer)) geol50Layer.addTo(map);
    showLegend(true);
    avail.forEach((d) => {
      if (loaded.has(d)) return;
      loaded.add(d);
      const nom = GEOL50.index[d].nom;
      setStatus(`Chargement du 1/50 000 — ${nom}…`);
      GEOL50.load(d, (fc) => {
        if (!fc) { loaded.delete(d); setStatus(`Échec du chargement (${nom}).`); return; }
        geol50Layer.addData(fc);
        let dom = 0, acc = 0;
        fc.features.forEach((f) => { const s = match(f.properties.d); if (s === 2) dom++; else if (s === 1) acc++; });
        setStatus(`1/50 000 — ${nom} : ${fc.features.length} formations · ${dom} à dominante « ${nomBas} »`
          + (acc ? ` · ${acc} où elle n'est qu'accessoire` : ""));
      });
    });
  }
  map.on("zoomend moveend", update);
  GEOL50.quandIndexPret(update);   // l'index départemental arrive de façon asynchrone
  update();
}

// ---------------- Wikipédia ----------------
async function loadWiki(rock) {
  const box = $("#wiki");
  const title = decodeURIComponent(rock.wikipedia.split("/wiki/")[1]);
  try {
    const r = await fetch("https://fr.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title));
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    box.innerHTML = `${j.thumbnail ? `<figure class="wiki-fig"><img src="${j.thumbnail.source}" alt="${title}"><figcaption class="cap"></figcaption></figure>` : ""}
      <div><p class="ext">${j.extract}</p>
      <p class="cap">Extrait de l'article Wikipédia, licence CC BY-SA 4.0.</p>
      <a class="wiki-btn" target="_blank" rel="noopener" href="${rock.wikipedia}">Lire l'article complet sur Wikipédia ↗</a></div>`;
    if (j.thumbnail) legendePhoto(j.thumbnail.source).then((cap) => { const f = box.querySelector(".wiki-fig .cap"); if (f) f.innerHTML = cap; });
  } catch {
    box.innerHTML = `<div><p class="ext">Extrait indisponible (hors connexion ?).</p>
      <a class="wiki-btn" target="_blank" rel="noopener" href="${rock.wikipedia}">Ouvrir l'article Wikipédia ↗</a></div>`;
  }
}

function argilesProduitesHTML(rock) {
  if (!rock.argiles) return "";
  const chips = rock.argiles.length
    ? rock.argiles.map((id) => {
        const a = ARGILES.find((x) => x.id === id);
        return `<button class="min-chip" data-goargile="${id}">
          <span class="sw" style="background:${a.swatch}"></span>${a.nom.split(" (")[0]}
          <small>${a.type.split(" ")[0]}</small></button>`;
      }).join("")
    : `<span class="sub">— pratiquement aucune</span>`;
  return `<p class="sub" style="margin-top:16px;margin-bottom:0"><b>Quelles argiles cette roche fabrique-t-elle ?</b> (cliquer pour la fiche complète)</p>
    <div class="min-chips">${chips}</div>
    ${rock.argilesNote ? `<div class="note">${rock.argilesNote}</div>` : ""}`;
}

// ---------------- panneau latéral : fiches liées (A.2) ----------------
// Un minéral, une espèce d'argile ou une fiche d'argile cliqué depuis une page s'ouvre dans une colonne
// à droite, sans quitter la page en cours. Les liens cliqués DANS le panneau s'empilent (bouton Retour).
const panneau = { pile: [] }; // [{ type: "min" | "espece" | "argile", id }]
const PANNEAU_ETROIT = "(max-width: 1099px)"; // en dessous, le panneau recouvre la page au lieu de s'y ajouter

function panneauNom(it) {
  if (it.type === "min") return (MINERAUX[it.id] || {}).nom || it.id;
  if (it.type === "espece") return (ESPECES[it.id] || {}).nom || it.id;
  return ((ARGILES.find((a) => a.id === it.id) || {}).nom || it.id).split(" (")[0];
}

function ouvrirPanneau(type, id, empiler) {
  const valide = type === "min" ? MINERAUX[id] : type === "espece" ? ESPECES[id] : ARGILES.find((a) => a.id === id);
  if (!valide) return;
  const haut = panneau.pile[panneau.pile.length - 1];
  if (haut && haut.type === type && haut.id === id && !$("#panneau").hidden) return;
  if (empiler) panneau.pile.push({ type, id });
  else panneau.pile = [{ type, id }];
  afficherPanneau();
}

function fermerPanneau() {
  if ($("#panneau").hidden) return;
  panneau.pile = [];
  $("#panneau").hidden = true;
  $(".layout").classList.remove("avec-panneau");
  if (map) setTimeout(() => map.invalidateSize(), 0);
}

function retourPanneau() {
  if (panneau.pile.length > 1) { panneau.pile.pop(); afficherPanneau(); }
}

function afficherPanneau() {
  const it = panneau.pile[panneau.pile.length - 1];
  const prec = panneau.pile[panneau.pile.length - 2];
  const libelle = { min: "Minéral", espece: "Espèce argileuse", argile: "Argile" };
  $("#panneau-type").textContent = libelle[it.type];
  const retour = $(".pan-retour");
  retour.hidden = !prec;
  retour.textContent = prec ? "‹ " + panneauNom(prec) : "";
  const corps = $("#panneau-contenu");
  corps.innerHTML = it.type === "min" ? ficheMineralHTML(it.id)
    : it.type === "espece" ? ficheEspeceHTML(it.id) : ficheArgileHTML(it.id);
  Structure3D.brancher(corps);
  if (window.Cristal) Cristal.brancher(corps);
  brancherStructureMineral(corps);
  if (window.Nombres) Nombres.rendre(corps);
  const dejaOuvert = !$("#panneau").hidden;
  $("#panneau").hidden = false;
  $(".layout").classList.add("avec-panneau");
  $("#panneau").scrollTop = 0;
  if (!dejaOuvert && map) setTimeout(() => map.invalidateSize(), 0);
  // vignette : fichier local d'abord, sinon Wikipédia (même règle que les autres fiches)
  if (it.type === "min") {
    const m = MINERAUX[it.id];
    chargerVignetteMineral(it.id, "panimg-");
  } else if (it.type === "espece") {
    chargerVignetteEspece(it.id, "panimg-");
  } else if (it.type === "argile") {
    const a = ARGILES.find((x) => x.id === it.id);
    loadWikiThumbs([{
      id: a.id, nom: a.nom,
      wiki: decodeURIComponent((a.wikipedia || "").split("/wiki/").pop() || a.nom),
      wikiAlts: (a.especes || []).map((eid) => (ESPECES[eid] || {}).nom || "").filter(Boolean).map((n) => n.split(" (")[0]),
    }], "panimg-", "argiles");
  }
}

// vignette d'un minéral : fichier local d'abord, sinon Wikipédia
function chargerVignetteMineral(id, prefix) {
  const m = MINERAUX[id];
  // « Quartz », « Calcite »… sont des pages d'homonymie sur Wikipédia FR : repli sur « … (minéral) »
  const court = m.nom.split(" (")[0].split(" —")[0].trim();
  loadWikiThumbs([{ id, nom: m.nom, wiki: m.wiki, wikiAlts: [court + " (minéral)"] }], prefix, m.oxydeDe ? "oxydes" : "mineraux");
}

// page d'un minéral (#mineral/<id>) — GABARIT DE FICHE MINÉRAL (F.3, 22/09/2026)
// Suite de cartes pleine largeur, comme les fiches de roches : identité, puis la forme du cristal,
// puis la structure atomique, puis la formation (le texte de formation s'appuie sur les deux schémas).
function renderMineralPage(id) {
  $("#main").innerHTML = `<div class="page-min">
    <div class="card fiche-min">${ficheMineralHTML(id, true)}</div>
    ${structureCristalHTML(id, true)}
    ${rochesCardHTML(id)}
    ${window.AlterationSchema ? AlterationSchema.carte(id) : ""}
    ${plusLoinMineralHTML(id)}
    ${sourcesFicheHTML(id, placeMineral(id), true)}</div>`;
  chargerVignetteMineral(id, "minpimg-");
  Structure3D.brancher($("#main"));
  if (window.Cristal) Cristal.brancher($("#main"));
  brancherStructureMineral($("#main"));
  brancherFicheMineral($("#main"));
  if (window.Nombres) Nombres.rendre($("#main"));
  document.title = MINERAUX[id].nom + " — Atlas géologique";
}

// 02/10/2026 (sa demande) : carte « Comment se forme-t-il ? » RETIRÉE de la page (formationMineralCardHTML reste écrite) ;
// carte « Ce que donne son altération » (alteration-schema.js) entre les roches et « Pour aller plus loin »
// carte « Pour aller plus loin » de la page minéral, juste avant les sources (01/10/2026) : « Où la trouver » y a été déplacé
function plusLoinMineralHTML(id) {
  const m = MINERAUX[id];
  if (!m.contexte) return "";
  return `<div class="card min-plusloin"><h2>Pour aller plus loin</h2>
    <h4>Où la trouver</h4><p>${m.contexte}</p></div>`;
}

// structure cristalline 3D (structures3d.js), si la fiche en a une
function structure3DHTML(id) {
  return Structure3D.existe(id) ? `<h4>Structure atomique</h4><div data-s3d="${id}" data-s3d-source="bas" data-s3d-replier></div>` : "";
}

// où vit ce minéral dans la classification de Strunz
function placeMineral(id) {
  for (const c of MIN_CLASSIF) {
    const gi = c.groupes.findIndex((g) => (g.mineraux || []).includes(id));
    if (gi >= 0) return { n: c.n, gi, classe: c.classe, groupe: c.groupes[gi].nom };
  }
  return null;
}

const minFiche = (id) => (typeof MIN_F !== "undefined" && MIN_F[id]) || null;
const attenteMin = (t) => `<p class="form-attente">${t}</p>`;

// carte « Structure » (01/10/2026 : fusion de « Forme du cristal » (F.3) et « Structure atomique » (A.3)) — une seule vue,
// comme les argiles : 1 maille · 2 × 2 × 2 · Forme du cristal. Le bouton « Forme du cristal » de la visionneuse 3D
// (data-s3d-cristal) envoie l'événement « s3d-cristal » ; la vue du cristal a la même rangée de boutons pour revenir aux atomes.
// page = false : version du panneau latéral (titre h4, pas de carte)
function structureCristalHTML(id, page) {
  const m = MINERAUX[id], f = minFiche(id) || {};
  const s3d = Structure3D.existe(id), cx = !!(window.Cristal && Cristal.existe(id));
  const titre = page ? "" : "<h4>Structure</h4>";   // page : pas de titre, le cadre est ajusté à la vue (01/10/2026)
  const enveloppe = (corps, classe = "") => page ? `<div class="card min-structure ${classe}" data-ms>${titre}${corps}</div>`
    : `<section class="min-structure ${classe}" data-ms>${titre}${corps}</section>`;
  if (!s3d && !cx) return page ? enveloppe(attenteMin(/amorphe|verre|organique|minéraloïde/i.test(m.famille || "")
    ? "Phase non cristalline : pas de réseau d'atomes ordonné à représenter."
    : "Structure atomique et forme du cristal non encore disponibles pour ce minéral.")) : "";
  const pourquoi = f.forme ? `<h4>Pourquoi cette forme ?</h4><p class="${page ? "" : "pan-texte "}min-pourquoi">${f.forme}</p>` : "";
  const vueCristal = cx ? `<div class="ms-cristal"${s3d ? " hidden" : ""}>
      ${s3d ? `<div class="s3d-outils"><div class="s3d-seg"><button type="button" data-ms-rep="1" aria-pressed="false">1 maille</button><button type="button" data-ms-rep="2" aria-pressed="false">2 × 2 × 2</button><button type="button" aria-pressed="true">Forme du cristal</button></div></div>` : ""}
      ${page ? `<p class="sub">Cristal idéal, calculé à partir de la maille, de la classe de symétrie et des formes {hkl} décrites
        dans la littérature. Les lettres sont celles des faces, reprises dans la légende. Faire glisser pour tourner le cristal
        (double-clic : vue de départ).</p>` : ""}
      ${Cristal.panneau(id)}${pourquoi}
    </div>` : "";
  // sans forme décrite, le bouton reste visible mais grisé (règle de l'atlas : ce qui manque se voit)
  // sans forme dessinée, le texte écrit sous la vue va dans le volet « Maille et description » de la visionneuse (02/10/2026)
  const apres = cx ? "" : `<template class="s3d-apres"><p class="ms-manque">${f.sansForme || "Forme du cristal pas encore décrite pour ce minéral."}</p>${f.forme ? `<h4>Ce que montre la structure</h4><p class="min-pourquoi">${f.forme}</p>` : ""}</template>`;
  const vueAtomes = s3d ? `<div class="ms-atomes"><div data-s3d="${id}" data-s3d-source="bas" data-s3d-cristal="${cx ? "1" : "0"}">${apres}</div></div>` : "";
  return enveloppe(vueAtomes + vueCristal);
}

// bascule atomes ⇄ forme du cristal dans la carte « Structure »
function brancherStructureMineral(racine) {
  (racine || document).querySelectorAll("[data-ms]").forEach((el) => {
    if (el.dataset.msPret) return;
    el.dataset.msPret = "1";
    const atomes = el.querySelector(".ms-atomes"), cristal = el.querySelector(".ms-cristal");
    if (!atomes || !cristal) return;
    el.addEventListener("s3d-cristal", () => { atomes.hidden = true; cristal.hidden = false; });
    cristal.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ms-rep]");
      if (!b) return;
      cristal.hidden = true; atomes.hidden = false;
      // même répétition dans la visionneuse (son bouton fait le reste : reconstruction, cadrage)
      const bt = atomes.querySelector(`[data-rep="${b.dataset.msRep}"]`);
      if (bt && bt.getAttribute("aria-pressed") !== "true") bt.click();
      const v = atomes.querySelector(".s3d");
      if (v && v.visionneuse && v.visionneuse.redessiner) v.visionneuse.redessiner();
    });
  });
}

// carte « Comment se forme-t-il ? » (F.3) : un onglet par mode de formation, chacun avec son diagramme C.4
function formationMineralCardHTML(id) {
  const m = MINERAUX[id], f = minFiche(id);
  if (!f || !f.scenarios || !f.scenarios.length) return `<div class="card"><h2>Comment se forme-t-il ?</h2>
    ${attenteMin("Modes de formation non encore décrits pour ce minéral.")}</div>`;
  const onglets = f.scenarios.length > 1 ? `<div class="min-chips mf-onglets">${f.scenarios.map((sc, i) =>
    `<button type="button" class="min-chip${i === 0 ? " on" : ""}" data-mf-onglet="${i}">${sc.nom}</button>`).join("")}</div>` : "";
  const vues = f.scenarios.map((sc, i) => `<div class="mf-vue" data-mf-vue="${i}"${i === 0 ? "" : " hidden"}>
      ${f.scenarios.length > 1 ? "" : `<h4>${sc.nom}</h4>`}
      <p class="mf-texte">${sc.texte}</p>
      ${sc.cond === false ? (sc.sansDiagramme ? `<p class="sub">${sc.sansDiagramme}</p>` : "")
        : (window.Formation && Formation.diagramme(sc.cond, m)) || attenteMin("Diagramme à venir.")}
    </div>`).join("");
  return `<div class="card min-formation" data-mf>
    <h2>Comment se forme-t-il ?</h2>
    ${f.intro ? `<p class="sub">${f.intro}</p>` : ""}
    ${onglets}${vues}
  </div>`;
}

// carte « Roches de l'atlas qui en contiennent »
function rochesCardHTML(id) {
  const liste = rochesDuMineral(id);
  if (!liste.length) return "";
  return `<div class="card"><h2>Roches de l'atlas qui en contiennent (${fmt(liste.length)})</h2>
    <div class="min-chips">${liste.map(rocheChipHTML).join("")}</div></div>`;
}

// roches de l'atlas contenant ce minéral, de la plus riche à la plus pauvre
function rochesDuMineral(id) {
  return ROCHES.filter((r) => (r.mineraux || []).some(([mid]) => mid === id))
    .map((r) => {
      const total = r.mineraux.reduce((s, [, p]) => s + p, 0);
      return { r, pct: Math.round(r.mineraux.find(([mid]) => mid === id)[1] / total * 100) };
    })
    .sort((a, b) => b.pct - a.pct);
}
const rocheChipHTML = ({ r, pct }) => `<button class="min-chip" data-go="${r.id}">
  <span class="sw" style="background:${r.swatch}"></span>${r.nom.split(" (")[0]} <small>≈ ${fmt(pct)} %</small></button>`;

// onglets des modes de formation de la fiche minéral
function brancherFicheMineral(racine) {
  (racine || document).querySelectorAll("[data-mf]").forEach((el) => {
    if (el.dataset.mfPret) return;
    el.dataset.mfPret = "1";
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-mf-onglet]");
      if (!b) return;
      el.querySelectorAll("[data-mf-onglet]").forEach((x) => x.classList.toggle("on", x === b));
      el.querySelectorAll("[data-mf-vue]").forEach((v) => { v.hidden = v.dataset.mfVue !== b.dataset.mfOnglet; });
    });
  });
}

// page = true : fiche en pleine page (titre, fil d'Ariane cliquable) — le reste de la fiche est composé
// par renderMineralPage (forme du cristal, structure, formation, roches, sources)
function ficheMineralHTML(id, page) {
  const m = MINERAUX[id];
  const meter = Array.from({ length: 10 }, (_, i) => `<i class="small ${i < m.stabilite ? "g" : ""}"></i>`).join("");
  const loc = placeMineral(id);
  const roches = rochesDuMineral(id);
  const rocheChip = rocheChipHTML;
  const tete = `
    <div class="pan-tete">
      <div class="ox-img pan-photo" id="${page ? "minpimg-" : "panimg-"}${id}"><span class="sw-ph" style="background:${m.swatch}"></span></div>
      ${page ? `<h1><span class="sw-big" style="background:${m.swatch}"></span>${m.nom}</h1>`
        : `<h3><span class="sw-big" style="background:${m.swatch}"></span>${m.nom}</h3>`}
      <div class="formule">${m.formule}</div>
      ${!loc ? "" : page
        ? `<p class="sub crumb">Minéraux <span>→</span> <a href="#mincls/${loc.n}">${loc.classe}</a> <span>→</span> <a href="#mingrp/${loc.n}-${loc.gi}">${loc.groupe}</a></p>`
        : `<p class="sub crumb">${loc.classe} <span>→</span> ${loc.groupe}</p>`}
    </div>`;
  const ligne = (lib, val) => val ? `<tr><td>${lib}</td><td>${val}</td></tr>` : "";
  // nombre suivi de son visuel (nombres.js : repères, carrés, comparaison ou place dans l'atlas, au choix du lecteur)
  const visuel = (champ) => (window.Nombres ? Nombres.blocHTML(champ, id) : "");
  const ligneNb = (champ) => (visuel(champ) ? `<tr class="nb-ligne"><td colspan="2">${visuel(champ)}</td></tr>` : "");
  const identite = ligne("Famille", m.famille) + ligne("Système cristallin", m.systeme)
    + ligne("Couleurs", m.couleurs) + ligne("Éclat", m.eclat) + ligne("Statut IMA", m.ima);
  const physique = ligne("Dureté (Mohs)", m.durete ? `${fmt(m.durete)} / 10` : "") + ligneNb("durete")
    + ligne("Masse volumique", m.densite ? `${fmt(m.densite)} g/cm³${m.densiteCalc ? " <small style=\"color:var(--muted)\">(calculée d'après la maille, faute de mesure)</small>" : ""}` : "")
    + ligneNb("densite")
    + ligne("Clivage", m.clivage ? `${m.clivage}${m.clivage.includes("{") ? `<br><small style="color:var(--muted)">{001}, {110}… : notation cristallographique (indices de Miller) désignant les familles de plans selon lesquels le minéral se fend.</small>` : ""}` : "");
  const alteration = (m.stabilite ? `<tr><td>Résistance à l'altération<br><small style="color:var(--muted)">(série de Goldich)</small></td>
        <td>${visuel("stabilite") ? "" : `<div class="meter">${meter}</div>`}<small style="color:var(--muted)">${m.stabilite}/10 — ${m.stabilite <= 2 ? "s'altère en premier" : m.stabilite <= 5 ? "s'altère assez vite" : m.stabilite <= 8 ? "résistant" : "quasi inaltérable"}</small></td></tr>${ligneNb("stabilite")}` : "")
    + ligne("En s'altérant, donne", m.devient);
  const rochesHTML = roches.length ? `<h4>Roches de l'atlas qui en contiennent (${roches.length})</h4>
      <div class="min-chips">${roches.slice(0, 12).map(rocheChip).join("")}</div>
      ${roches.length > 12 ? `<details class="pan-suite"><summary>Les ${roches.length - 12} autres</summary>
        <div class="min-chips">${roches.slice(12).map(rocheChip).join("")}</div></details>` : ""}` : "";
  // (bouton « Sa place dans la classification » retiré le 01/10/2026 : le fil d'Ariane y mène déjà)
  const liens = m.argile || m.oxydeDe ? `<div class="pan-liens">
      ${m.argile ? `<button class="min-chip" data-goargile="${m.argile}">Fiche de l'argile →</button>` : ""}
      ${m.oxydeDe ? `<button class="min-chip" data-gopage="oxyde/${m.oxydeDe}">Partie Oxydes (diagramme pH–Eh) →</button>` : ""}
    </div>` : "";
  const sources = sourcesFicheHTML(id, loc);

  // bouton « Afficher les nombres » : seulement s'il y a au moins un nombre à montrer
  const choixNombres = window.Nombres && ["durete", "densite", "stabilite"].some((c) => Nombres.blocHTML(c, id))
    ? Nombres.selecteurHTML() : "";
  if (!page) {
    // panneau latéral : une seule colonne, même ordre que la page
    return `${tete}
    ${choixNombres}
    <table class="data">${identite}${physique}${ligne("Où la trouver", m.contexte)}${alteration}</table>
    ${m.note ? `<p class="pan-texte">${m.note}</p>` : ""}
    ${structureCristalHTML(id, false)}
    ${rochesHTML}
    <div class="pan-liens">
      <button class="min-chip" data-gopage="mineral/${id}">Fiche complète (forme, structure, formation) →</button>
    </div>
    ${liens}
    ${sources}`;
  }
  // page complète : en-tête + carte d'identité ; la suite est composée par renderMineralPage
  const bloc = (titre, corps, classe = "") => corps ? `<section class="min-panneau ${classe}">${titre ? `<h4>${titre}</h4>` : ""}${corps}</section>` : "";
  // 01/10/2026 : Identité et « Où la trouver » côte à côte ; propriétés physiques et altération sur toute la largeur,
  // un nombre par case avec son visuel dessous (les règles avaient besoin de place : en colonne étroite, illisibles)
  const tuile = (lib, val, champ) => `<div class="mesure${val ? "" : " mesure-vide"}">
      <div class="mesure-tete"><span>${lib}</span><b>${val || "non renseignée"}</b></div>${val ? visuel(champ) : ""}</div>`;
  const mesures = `<div class="mesures">
      ${tuile("Dureté (échelle de Mohs)", m.durete ? `${fmt(m.durete)} <small>/ 10</small>` : "", "durete")}
      ${tuile("Masse volumique", m.densite ? `${fmt(m.densite)} <small>g/cm³${m.densiteCalc ? " (calculée d'après la maille)" : ""}</small>` : "", "densite")}
    </div>
    ${m.clivage ? (() => {
      // 02/10/2026 (sa demande) : sous le texte, seulement les schémas des types de clivage ; les explications (type, angles,
      // plans, notation {hkl}) dans la bulle du « ? » à côté du titre (exception voulue à la règle « rien au survol »)
      const rangee = window.Clivage ? Clivage.html(id) : "";
      const expl = [window.Clivage ? Clivage.aide(id) : "",
        m.clivage.includes("{") ? "{001}, {110}… : notation cristallographique (indices de Miller) désignant les familles de plans selon lesquels le minéral se fend." : ""].filter(Boolean);
      const q = expl.length ? ` <span class="cl-aide" tabindex="0" aria-label="Explications">?<span class="cl-bulle" role="tooltip">${expl.map((t) => `<span>${t}</span>`).join("")}</span></span>` : "";
      return `<div class="mesure-ligne mesure-clivage"><span>Clivage${q}</span><div><p>${m.clivage}</p></div>${rangee ? `<div class="cl-ligne">${rangee}</div>` : ""}</div>`;
    })() : ""}`;
  const altere = `<div class="mesures">
      ${tuile("Résistance à l'altération", m.stabilite ? `${m.stabilite} <small>/ 10 · ${m.stabilite <= 2 ? "s'altère en premier" : m.stabilite <= 5 ? "s'altère assez vite" : m.stabilite <= 8 ? "résistant" : "quasi inaltérable"}</small>` : "", "stabilite")}
    </div>
    ${window.AlterationSchema && AlterationSchema.bouton(id) ? `<div class="as-voir-ligne">${AlterationSchema.bouton(id)}</div>` : ""}`;
  return `${tete}
    ${m.note ? `<p class="pan-texte min-intro">${m.note}</p>` : ""}
    ${bloc(window.Identite ? "" : "Identité", window.Identite ? Identite.html(id) : identite && `<table class="data">${identite}</table>`, "min-large")}
    ${bloc("", choixNombres + mesures, "min-large min-physique")}
    ${bloc("", altere, "min-large min-alteration")}
    ${liens}`;
}

// sources en bas de fiche (minéral ou espèce d'argile) : structure cristalline (COD), formes, formation, classification
function sourcesFicheHTML(id, loc, page) {
  const items = [];
  if (Structure3D.existe(id)) items.push(`<li data-s3d-ref="${id}">Structure cristalline : chargement de la référence…</li>`);
  if (window.Cristal && Cristal.existe(id)) {
    items.push(`<li>${Cristal.SOURCES.formes}</li>`);
    items.push(`<li>${Cristal.SOURCES.projection} Maille : le même affinement que la structure atomique.</li>`);
  }
  // (sources des diagrammes de formation retirées avec la carte « Comment se forme-t-il ? », 02/10/2026)
  if (window.AlterationSchema && AlterationSchema.existe(id)) items.push(`<li>${AlterationSchema.SOURCE}</li>`);
  for (const s of (MINERAUX[id] && MINERAUX[id].sources) || []) items.push(`<li>${s}</li>`);
  if (loc) items.push(`<li>Classification : tables de Nickel-Strunz, 10ᵉ édition (codes des classes et des groupes).</li>`);
  return items.length ? `<section class="min-sources${page ? " card" : ""}"><h4>Sources</h4><ul>${items.join("")}</ul></section>` : "";
}

// vignette d'une espèce d'argile : images/argiles/<id>.jpg, sinon Wikipédia
function chargerVignetteEspece(eid, prefix) {
  const court = ESPECES[eid].nom.split(" (")[0].trim();
  loadWikiThumbs([{ id: eid, nom: ESPECES[eid].nom, wiki: court, wikiAlts: [court + " (minéral)"] }], prefix, "argiles");
}

// page d'une espèce d'argile (#espece/<id>)
// 01/10/2026 : même gabarit que les fiches minéraux (argiles-especes-page.js) ; l'ancienne carte unique reste en repli
function renderEspecePage(eid) {
  $("#main").innerHTML = window.EspecePage ? EspecePage.html(eid)
    : `<div class="card fiche-min">${ficheEspeceHTML(eid, true)}</div>`;
  chargerVignetteEspece(eid, "esppimg-");
  Structure3D.brancher($("#main"));
  if (window.Nombres) Nombres.rendre($("#main"));
  if (window.CecSchema) CecSchema.monter($("#main"));
  document.title = ESPECES[eid].nom + " — Atlas géologique";
}

// page = true : fiche en pleine page (titre, fil d'Ariane cliquable)
function ficheEspeceHTML(eid, page) {
  const e = ESPECES[eid];
  // retrouve le groupe et la famille dans l'arbre
  let fam = null, groupe = null, lienGroupe = "";
  CLASSIF.forEach((f, fi) => f.groupes.forEach((g, gi) => {
    if (!groupe && g.especes.includes(eid)) { fam = f; groupe = g; lienGroupe = `${fi}-${gi}`; }
  }));
  const fiche = (e.fiche && ARGILES.find((a) => a.id === e.fiche)) || ARGILES.find((a) => a.espece === eid)
    || (groupe && groupe.fiche && ARGILES.find((a) => a.id === groupe.fiche)) || null;
  const sw = fiche ? fiche.swatch : "var(--baseline)";
  const famNom = fam ? fam.famille.split(" — ")[0] : "";
  const autres = groupe ? groupe.especes.filter((x) => x !== eid && ESPECES[x]) : [];
  const titre = `<span class="sw-big" style="background:${sw}"></span>${e.nom}`;
  const ficheNom = fiche ? fiche.nom.split(" (")[0] : "";
  return `
    <div class="pan-tete">
      <div class="ox-img pan-photo" id="${page ? "esppimg-" : "panimg-"}${eid}"><span class="sw-ph"></span></div>
      ${page ? `<h1>${titre}</h1>` : `<h3>${titre}</h3>`}
      <div class="formule">${e.formule}</div>
      ${!groupe ? "" : page
        ? `<p class="sub crumb">Argiles <span>→</span> <a href="#argiles">${famNom}</a> <span>→</span> <a href="#argrp/${lienGroupe}">${groupe.nom}</a></p>`
        : `<p class="sub crumb">${famNom} <span>→</span> ${groupe.nom}</p>`}
    </div>
    <p class="pan-texte">${e.note}</p>
    <table class="data">
      ${e.octa && e.octa !== "—" ? `<tr><td>Caractère du feuillet O</td><td>${e.octa}</td></tr>` : ""}
      ${groupe && groupe.teSi ? `<tr><td>Substitution tétraédrique</td><td>${groupe.teSi}</td></tr>` : ""}
      ${groupe && groupe.oc ? `<tr><td>Substitution octaédrique</td><td>${groupe.oc}</td></tr>` : ""}
      ${groupe && groupe.espace ? `<tr><td>Espacement des feuillets</td><td>${groupe.espace}</td></tr>` : ""}
      ${groupe && groupe.charge ? `<tr><td>Charge foliaire</td><td>${groupe.charge}</td></tr>` : ""}
    </table>
    ${typeof ValeursEspeces !== "undefined" ? ValeursEspeces.html(eid) : ""}
    ${fiche && fiche.cecMin != null ? `<h4>Propriétés de la fiche « ${ficheNom} »</h4>
      <p class="pan-note">Valeurs données pour l'ensemble de la fiche, pas mesurées sur cette espèce seule.</p>
      <table class="data">
        <tr><td>CEC (capacité d'échange)</td><td>${fmt(fiche.cecMin)}–${fmt(fiche.cecMax)} cmol⁺/kg</td></tr>
        ${fiche.surfMin != null ? `<tr><td>Surface spécifique</td><td>${fmt(fiche.surfMin)}–${fmt(fiche.surfMax)} m²/g</td></tr>` : ""}
        ${fiche.eauMin != null ? `<tr><td>Rétention d'eau</td><td>${fmt(fiche.eauMin)}–${fmt(fiche.eauMax)} g/100 g</td></tr>` : ""}
        ${fiche.gonflement ? `<tr><td>Gonflement</td><td>${fiche.gonflement}</td></tr>` : ""}
      </table>` : ""}
    ${structure3DHTML(eid)}
    ${autres.length ? `<h4>Autres espèces du groupe</h4><div class="min-chips">${autres.map((x) => especeChip(x, sw)).join("")}</div>` : ""}
    <div class="pan-liens">
      ${fiche ? `<button class="min-chip" data-goargile="${fiche.id}">Fiche ${ficheNom} (structure, sols, usages) →</button>` : ""}
      ${lienGroupe ? `<button class="min-chip" data-arggrp="${lienGroupe}">Page du groupe →</button>` : ""}
    </div>
    ${typeof ValeursEspeces !== "undefined" ? ValeursEspeces.sources(eid, sourcesFicheHTML(eid, null)) : sourcesFicheHTML(eid, null)}`;
}

function ficheArgileHTML(id) {
  const a = ARGILES.find((x) => x.id === id);
  const roches = (a.rochesSources || []).map((rid) => ROCHES.find((x) => x.id === rid)).filter(Boolean);
  return `
    <div class="pan-tete">
      <div class="ox-img pan-photo" id="panimg-${a.id}"><span class="sw-ph" style="background:${a.swatch}"></span></div>
      <h3><span class="sw-big" style="background:${a.swatch}"></span>${a.nom}</h3>
      <div class="formule">${a.formule}</div>
      ${a.groupe ? `<p class="sub crumb">${a.famille} <span>→</span> ${a.groupe}</p>` : ""}
    </div>
    ${a.description ? `<p class="pan-texte">${a.description}</p>` : ""}
    <table class="data">
      ${a.type ? `<tr><td>Type</td><td>${a.type}</td></tr>` : ""}
      ${a.cecMin != null ? `<tr><td>CEC (capacité d'échange)</td><td>${fmt(a.cecMin)}–${fmt(a.cecMax)} cmol⁺/kg</td></tr>` : ""}
      ${a.surfMin != null ? `<tr><td>Surface spécifique</td><td>${fmt(a.surfMin)}–${fmt(a.surfMax)} m²/g</td></tr>` : ""}
      ${a.eauMin != null ? `<tr><td>Rétention d'eau</td><td>${fmt(a.eauMin)}–${fmt(a.eauMax)} g/100 g</td></tr>` : ""}
      ${a.gonflement ? `<tr><td>Gonflement</td><td>${a.gonflement}</td></tr>` : ""}
      ${a.espacement ? `<tr><td>Espacement basal</td><td>${a.espacement}</td></tr>` : ""}
      ${a.chargeFoliaire ? `<tr><td>Charge foliaire</td><td>${a.chargeFoliaire}</td></tr>` : ""}
      ${a.octa ? `<tr><td>Feuillet O</td><td>${a.octa}</td></tr>` : ""}
    </table>
    ${a.especes ? `<h4>Espèces</h4><div class="min-chips">${a.especes.map((eid) => especeChip(eid, a.swatch)).join("")}</div>` : ""}
    ${a.origineDetail ? `<h4>D'où vient-elle ?</h4>
    <p class="pan-texte">${a.origine ? `<b>${a.origine}.</b> ` : ""}${a.origineDetail}</p>` : ""}
    ${a.pedologie ? `<h4>Dans les sols</h4>
    <p class="pan-texte">${a.pedologie}</p>` : ""}
    ${roches.length ? `<h4>Roches qui en produisent</h4>
      <div class="min-chips">${roches.map((r) => `<button class="min-chip" data-go="${r.id}"><span class="sw" style="background:${r.swatch}"></span>${r.nom.split(" (")[0]}</button>`).join("")}</div>` : ""}
    <div class="pan-liens">
      <button class="min-chip" data-gopage="argile/${a.id}">Page complète (structure, graphiques, usages) →</button>
    </div>`;
}

// ---------------- espèces d'argiles ----------------
function especeChip(eid, sw) {
  const e = ESPECES[eid];
  if (!e) return "";
  return `<button class="min-chip" data-espece="${eid}">${sw ? `<span class="sw" style="background:${sw}"></span>` : ""}${e.nom}
    <small>${e.formule.length > 34 ? e.formule.slice(0, 32) + "…" : e.formule}</small></button>`;
}

// ---------------- page classification ----------------
function renderClassif() {
  const fams = CLASSIF.map((fam, fi) => {
    const nbEsp = fam.groupes.reduce((s, g) => s + g.especes.length, 0);
    const fichesFam = [...new Set(fam.groupes.map((g) => g.fiche).filter(Boolean))]
      .map((id) => ARGILES.find((a) => a.id === id)).filter(Boolean);
    const coul = fichesFam.length ? fichesFam[0].swatch : "var(--baseline)";
    return `
    <div class="card">
      <h2 style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="sw-big" style="background:${coul};display:inline-block"></span> ${fam.famille}
        <span class="badge outline">${fam.groupes.length} groupe${fam.groupes.length > 1 ? "s" : ""} · ${nbEsp} espèces</span></h2>
      <p class="sub">${fam.desc}</p>
      ${fam.groupes.map((g, gi) => `
        <div class="groupe-bloc" id="argrp-${fi}-${gi}">
          <div class="groupe-head">
            <b>${g.nom}</b>
            <button class="min-chip" data-arggrp="${fi}-${gi}" style="margin-left:auto">Ouvrir ce groupe →</button>
          </div>
          <div class="crit-row">
            <span class="crit"><i>Feuillet O</i>${g.octa}</span>
            ${g.teSi ? `<span class="crit"><i>Tétraèdres</i>${g.teSi}</span>` : ""}
            ${g.oc ? `<span class="crit"><i>Octaèdres</i>${g.oc}</span>` : ""}
            ${g.espace ? `<span class="crit"><i>Espacement</i>${g.espace}</span>` : ""}
            <span class="crit"><i>Charge</i>${g.charge}</span>
          </div>
          <p class="sub" style="margin:8px 0 8px">${g.note}</p>
          <div class="min-chips">${g.especes.map((eid) => especeChip(eid, (ARGILES.find((a) => a.id === g.fiche) || {}).swatch || coul)).join("")}</div>
        </div>`).join("")}
    </div>`;
  }).join("");

  $("#main").innerHTML = `
  <div class="card hero">
    <h1>🧱 Les argiles</h1>
    <p class="sub" style="font-size:15px;max-width:80ch">Les argiles sont ce que <b>deviennent les minéraux quand ils
    s'altèrent</b> : l'eau et le CO₂ attaquent les feldspaths et les micas, et il en naît ces minuscules cristaux en feuillets
    qui font la terre des champs, la poterie et le retrait-gonflement des maisons. Chimiquement, ce sont des
    <b>phyllosilicates</b> — la même famille en feuillets que les micas, en plus petit.</p>
    <p class="sub crumb" style="font-size:13.5px">Classe des <b>silicates</b> <span>→</span> sous-classe des <b>phyllosilicates</b>
    <span>→</span> familles par type d'empilement <span>→</span> groupes <span>→</span> espèces.</p>
    <div class="note"><b>Comment lire la classification.</b> Chaque groupe est défini par quatre critères structuraux —
    ceux du tableau de référence de Wikipédia. <b>Feuillet O</b> : rempli d'Al³⁺ (2 sites sur 3) = <b>dioctaédrique</b>,
    ou de Mg²⁺/Fe²⁺ (3 sites sur 3) = <b>trioctaédrique</b>. <b>Te/Si</b> mesure les substitutions dans le feuillet
    <b>tétraédrique</b> (Te/Si = 4 ou 8 → aucune ; &lt; 4 ou &lt; 8 → de l'Al remplace du Si). <b>Oc</b> mesure celles du
    feuillet <b>octaédrique</b> (Oc = 12/12 → aucune). Ces substitutions créent un <b>déficit de charge</b> que doivent
    compenser des cations interfoliaires — et c'est ce qui décide si l'argile <b>gonfle</b> (espacement variable) ou
    reste verrouillée (espacement stable).</div>
  </div>
  ${fams}
  <div class="card">
    <h2>Pour aller plus loin : les trois façons de naître, et deux sens du mot « argile »</h2>
    <p>Une argile peut apparaître dans un sol de trois manières. Par <b>héritage</b> : elle était déjà dans la roche, l'altération
    la libère telle quelle (l'illite des marnes). Par <b>transformation</b> : un minéral en feuillets existant se modifie pas à
    pas — un mica perd son potassium et devient vermiculite, puis smectite. Par <b>néoformation</b> : elle cristallise à partir
    de zéro, à partir des ions dissous dans l'eau du sol (la kaolinite des climats tropicaux, ≥ 22 °C).</p>
    <p>Ce qui distingue les familles, c'est l'empilement des deux briques de base — le feuillet <b>T</b> (tétraèdres de silice)
    et le feuillet <b>O</b> (octaèdres d'aluminium, magnésium ou fer) — et surtout la <b>charge électrique</b> du feuillet, qui
    décide de ce qui se loge entre les couches : rien (talc), de l'eau qui fait gonfler (smectites), du potassium qui verrouille
    (illites, micas). Un feuillet O rempli d'Al³⁺ (2 sites sur 3) est <b>dioctaédrique</b> ; rempli de Mg²⁺/Fe²⁺ (3 sites sur 3),
    il est <b>trioctaédrique</b> — presque chaque groupe existe dans les deux versions.</p>
    <p>Attention enfin au mot lui-même : « argile » a <b>deux sens</b>. Un sens <b>granulométrique</b> (toute particule de moins
    de 2 µm, quelle que soit sa nature) et un sens <b>minéralogique</b> (les phyllosilicates de cette page, même en gros
    cristaux). Les micas vrais et les serpentines, souvent visibles à l'œil nu, sont rangés ici car ils partagent la même
    structure en feuillets. Source : nomenclature <b>AIPEA / IMA</b> (Guggenheim et al.).</p>
  </div>`;
  document.title = "Argiles — Atlas géologique";
}

// ---------------- page d'UN groupe d'argiles (= une colonne du tableau) ----------------
function renderGroupeArgile(fi, gi) {
  const fam = CLASSIF[fi], g = fam.groupes[gi];
  const fiche = g.fiche ? ARGILES.find((a) => a.id === g.fiche) : null;
  // les groupes voisins de la même famille, pour naviguer sans repasser par la liste
  const voisins = fam.groupes.map((o, i) => i === gi ? "" :
    `<button class="min-chip" data-arggrp="${fi}-${i}">${o.nom}</button>`).join("");

  $("#main").innerHTML = `
  <div class="card rock-head">
    <h1><span class="sw-big" style="background:${fiche ? fiche.swatch : "var(--baseline)"}"></span>${g.nom}</h1>
    <p class="sub crumb">Silicates <span>→</span> Phyllosilicates <span>→</span> <b>${fam.famille.split(" — ")[0]}</b>
      · <a href="#argiles">voir toute la classification</a></p>
    <div class="crit-row">
      <span class="crit"><i>Feuillet O</i>${g.octa}</span>
      ${g.teSi ? `<span class="crit"><i>Tétraèdres</i>${g.teSi}</span>` : ""}
      ${g.oc ? `<span class="crit"><i>Octaèdres</i>${g.oc}</span>` : ""}
      ${g.espace ? `<span class="crit"><i>Espacement</i>${g.espace}</span>` : ""}
      <span class="crit"><i>Charge foliaire</i>${g.charge}</span>
    </div>
    <p class="desc" style="margin-top:14px">${g.note}</p>
    ${fiche ? `<button class="wiki-btn" style="border:0;cursor:pointer;font:inherit" data-goargile="${fiche.id}">
      Fiche complète : ${fiche.nom.split(" (")[0]} (CEC, structure, sols, usages) →</button>` : ""}
  </div>
  ${window.ArgilesComparer ? ArgilesComparer.html(g) : ""}

  <div class="card">
    <h2>Les espèces de ce groupe</h2>
    <p class="sub">${g.especes.length} espèce${g.especes.length > 1 ? "s" : ""} partagent exactement ces critères structuraux.</p>
    ${g.especes.map((eid) => {
      const e = ESPECES[eid];
      if (!e) return "";
      const cible = e.fiche || (ARGILES.find((a) => a.id === eid) ? eid : null);
      const cibleNom = cible ? (ARGILES.find((a) => a.id === cible) || {}).nom : null;
      return `
      <div class="groupe-bloc" data-espece-bloc="${eid}">
        <div class="ox-fiche">
          <div class="ox-img" id="argimg-${eid}"><span class="sw-ph" style="background:${fiche ? fiche.swatch : "var(--baseline)"}"></span></div>
          <div class="ox-body">
            <div class="groupe-head" style="margin-bottom:4px"><b>${e.nom}</b>
              <span class="badge outline">${e.formule.length > 40 ? e.formule.slice(0, 38) + "…" : e.formule}</span>
              ${e.octa ? `<span class="origine-tag">${e.octa}</span>` : ""}</div>
            <p class="sub" style="margin:6px 0">${e.note}</p>
            <button class="min-chip" data-espece="${eid}">Fiche de l'espèce →</button>
            ${cible ? `<button class="min-chip" data-goargile="${cible}">Fiche complète : ${(cibleNom || cible).split(" (")[0]} →</button>` : ""}
          </div>
        </div>
      </div>`;
    }).join("")}
  </div>

  <div class="card">
    <h2>Sa place dans la famille</h2>
    <p class="sub">${fam.desc}</p>
    ${voisins.trim() ? `<p class="sub" style="margin-bottom:4px"><b>Les autres cas de cette famille</b>
      (mêmes feuillets, critères différents) :</p><div class="min-chips">${voisins}</div>` : ""}
  </div>`;

  loadWikiThumbs(g.especes.map((eid) => ({ id: eid, nom: (ESPECES[eid] || {}).nom || eid })), "argimg-", "argiles");
  // G.3 (07/10/2026) : petites fiches 3D des espèces du groupe, qui tournent ensemble (argiles-comparer.js)
  if (window.ArgilesComparer) ArgilesComparer.monter($("#main"));
  document.title = g.nom + " — Atlas géologique";
}

// ---------------- page classification des minéraux ----------------
function minChipHTML(mid) {
  const m = MINERAUX[mid];
  if (!m) return "";
  return `<button class="min-chip" data-min="${mid}">
    <span class="sw" style="background:${m.swatch}"></span>${m.nom.split(" (")[0]}
    <small>${m.formule.length > 26 ? m.formule.slice(0, 24) + "…" : m.formule}</small></button>`;
}

// espèces d'un groupe (les oxydes sont tirés de leur chapitre dédié)
function groupeIds(g) {
  return g.dynamique === "oxydes" ? OXYDES.flatMap((f) => f.especes.map((e) => e.id)) : g.mineraux;
}

// oxydes rangés par élément (fer, manganèse, aluminium, titane…) : un bloc par famille d'OXYDES,
// avec lien vers son onglet (diagramme de Pourbaix). Sert aux pages de classe, de groupe et d'ensemble.
function oxydesParElementHTML() {
  return OXYDES.map((f) => `<div class="ox-element" style="--c:${f.couleur}">
      <div class="groupe-head">
        <span class="sw-el" aria-hidden="true"></span>
        <b>${f.element}</b><span class="badge outline">${f.symbole}</span>
        <span class="sub">${f.especes.length} espèce${f.especes.length > 1 ? "s" : ""}</span>
        <button class="min-chip" data-gopage="oxyde/${f.id}" style="margin-left:auto">Ouvrir l'onglet ${f.element} →</button>
      </div>
      <div class="min-chips">${f.especes.map((e) => minChipHTML(e.id)).join("")}</div>
    </div>`).join("");
}

// ---------------- page d'UNE classe de Strunz ----------------
function renderMineralClasse(c) {
  const nbMin = c.groupes.reduce((s, g) => s + groupeIds(g).length, 0);
  const autres = MIN_CLASSIF.filter((o) => o.n !== c.n).sort((a, b) => a.n - b.n)
    .map((o) => `<button class="min-chip" data-mincls="${o.n}"><span class="num" style="margin-right:4px">${o.num}</span>${o.classe}</button>`).join("");

  const groupes = c.groupes.map((g, gi) => `
    <div class="groupe-bloc">
      <div class="groupe-head">
        ${g.code ? `<span class="strunz-code">${g.code}</span>` : ""}
        <b>${g.nom}</b>
        ${g.motif ? `<span class="badge outline">${g.motif}</span>` : ""}
        <button class="min-chip" data-mingrp="${c.n}-${gi}" style="margin-left:auto">Ouvrir ce groupe →</button>
      </div>
      <p class="sub" style="margin:4px 0 8px">${g.note}</p>
      ${g.dynamique === "oxydes" ? oxydesParElementHTML() : g.sousGroupes
        ? `<p class="sub" style="margin:6px 0 4px"><b>${g.sousGroupes.length} sous-familles</b>
             · ${groupeIds(g).length} minéraux décrits :</p>
           <div class="min-chips">${g.sousGroupes.map((sf) =>
             `<button class="min-chip" data-mingrp="${c.n}-${gi}">${sf.nom} <small>${sf.mineraux.length}</small></button>`).join("")}</div>`
        : `<div class="min-chips">${groupeIds(g).map(minChipHTML).join("")}</div>`}
    </div>`).join("");

  $("#main").innerHTML = `
  <div class="card rock-head">
    <h1><span class="num">${c.num}</span>${c.icone} ${c.classe}
      ${c.achever ? `<span class="badge" style="background:var(--prod-sable)">🚧 à compléter</span>` : ""}</h1>
    <p class="sub crumb">Minéraux <span>→</span> classification de Strunz <span>→</span> <b>classe ${c.num}</b>
      · <a href="#mineraux">voir toutes les classes</a></p>
    <p class="desc">${c.desc}</p>
    ${c.lien ? `<button class="wiki-btn" style="border:0;cursor:pointer;font:inherit" data-gopage="${c.lien.hash.slice(1)}">${c.lien.label}</button>` : ""}
    <div class="tiles">
      <div class="tile"><div class="lab">Numéro de Strunz</div><div class="val">${c.num}</div></div>
      <div class="tile"><div class="lab">Groupes</div><div class="val">${c.groupes.length}</div></div>
      <div class="tile"><div class="lab">Minéraux décrits</div><div class="val">${nbMin}</div></div>
    </div>
  </div>

  <div class="card">
    <h2>Les groupes de cette classe</h2>
    <p class="sub">Cliquer sur un minéral ouvre sa carte d'identité ; « Ouvrir ce groupe » donne le détail du groupe.
      Les badges (ex. ${c.groupes[0] && c.groupes[0].code ? c.groupes[0].code : "IX.A"}) situent chaque groupe dans les subdivisions officielles de Strunz —
      les lettres absentes correspondent à des subdivisions sans espèce courante, que l'atlas ne détaille pas.</p>
    ${groupes}
  </div>

  ${(c.encarts || []).map((e) => `<div class="card">
    <h2>${e.titre}</h2>
    ${e.html}
  </div>`).join("")}

  ${c.plus ? `<div class="card">
    <h2>Pour aller plus loin</h2>
    ${c.plus}
  </div>` : ""}

  <div class="card">
    <h2>Les autres classes de Strunz</h2>
    <div class="min-chips">${autres}</div>
  </div>
  ${c.sources ? `<p class="page-source"><b>Sources</b> — ${c.sources.join(" ; ")}</p>` : ""}`;
  document.title = c.classe + " — Atlas géologique";
}

// ---------------- page d'UN groupe de minéraux ----------------
function renderMineralGroupe(c, gi) {
  const g = c.groupes[gi];
  const ids = groupeIds(g);
  const voisins = c.groupes.map((o, i) => i === gi ? "" :
    `<button class="min-chip" data-mingrp="${c.n}-${i}">${o.nom}</button>`).join("");

  $("#main").innerHTML = `
  <div class="card rock-head">
    <h1>${g.nom}</h1>
    <p class="sub crumb">Minéraux <span>→</span> <b data-mincls="${c.n}" style="cursor:pointer;text-decoration:underline">${c.num} · ${c.classe}</b>
      <span>→</span> ce groupe · <a href="#mineraux">toutes les classes</a></p>
    ${g.motif ? `<div class="crit-row"><span class="crit"><i>Motif structural</i>${g.motif}</span>
      <span class="crit"><i>Code de Strunz</i>${g.code || c.num} — ${c.classe}</span>
      <span class="crit"><i>Minéraux décrits</i>${ids.length}</span></div>` : ""}
    <p class="desc" style="margin-top:14px">${g.note}</p>
    ${g.lien ? `<button class="wiki-btn" style="border:0;cursor:pointer;font:inherit" data-gopage="${g.lien.hash.slice(1)}">${g.lien.label}</button>` : ""}
  </div>

  ${g.sousGroupes ? `
  <div class="card">
    <h2>Les sous-familles</h2>
    <p class="sub">${g.sousGroupes.length} sous-familles regroupent ces ${ids.length} minéraux.
    Cliquer sur un minéral ouvre sa carte d'identité complète.</p>
    ${(function () { let cur = null; return g.sousGroupes.map((sf) => {
      let head = "";
      if (sf.section && sf.section !== cur) { head = `<h3 class="groupe-section">${sf.section}</h3>`; cur = sf.section; }
      return `${head}
      <div class="groupe-bloc">
        <div class="groupe-head"><b>${sf.nom}</b>
          ${sf.formule ? `<span class="badge outline">${sf.formule}</span>` : ""}</div>
        <p class="sub" style="margin:4px 0 8px">${sf.note}</p>
        <div class="min-chips">${sf.mineraux.map(minChipHTML).join("")}</div>
      </div>`; }).join(""); })()}
  </div>` : `
  <div class="card">
    <h2>Les minéraux de ce groupe</h2>
    <p class="sub">${g.dynamique === "oxydes"
      ? `${ids.length} espèces rangées par élément métallique (${OXYDES.length} familles). « Ouvrir l'onglet » donne les fiches illustrées et le diagramme de Pourbaix de l'élément.`
      : `${ids.length} minéral${ids.length > 1 ? "s partagent" : " partage"} ce motif structural.
    Cliquer ouvre la carte d'identité (formule, dureté, densité, altération).`}</p>
    ${g.dynamique === "oxydes" ? oxydesParElementHTML() : `<div class="min-chips">${ids.map(minChipHTML).join("")}</div>`}
  </div>`}

  <div class="card">
    <h2>Sa place dans la classe</h2>
    <p class="sub">${c.desc}</p>
    ${voisins.trim() ? `<p class="sub" style="margin-bottom:4px"><b>Les autres groupes de la classe ${c.num}</b> :</p>
      <div class="min-chips">${voisins}</div>` : ""}
  </div>`;
  document.title = g.nom + " — Atlas géologique";
}

// ---------------- vue d'ensemble des minéraux ----------------
function renderMineraux() {
  const cards = [...MIN_CLASSIF].sort((a, b) => a.n - b.n).map((c) => {
    const groupes = c.groupes.map((g) => {
      let ids = g.mineraux;
      if (g.dynamique === "oxydes") ids = OXYDES.flatMap((f) => f.especes.map((e) => e.id));
      return `<div class="groupe-bloc">
        <div class="groupe-head">${g.code ? `<span class="strunz-code">${g.code}</span>` : ""}<b>${g.nom}</b>
          ${g.motif ? `<span class="badge outline">${g.motif}</span>` : ""}
          ${g.lien ? `<button class="min-chip" data-gopage="${g.lien.hash.slice(1)}" style="margin-left:auto">${g.lien.label}</button>` : ""}
        </div>
        <p class="sub" style="margin:4px 0 8px">${g.note}</p>
        ${g.dynamique === "oxydes" ? oxydesParElementHTML() : `<div class="min-chips">${ids.map(minChipHTML).join("")}</div>`}
      </div>`;
    }).join("");
    return `<div class="card" id="mincls-${c.n}">
      <h2><span class="num">${c.num}</span>${c.icone} ${c.classe}${c.achever ? ` <span class="badge" style="background:var(--prod-sable)">🚧 à compléter</span>` : ""}</h2>
      <p class="sub">${c.desc}</p>
      <div class="min-chips" style="margin-bottom:8px">
        <button class="min-chip" data-mincls="${c.n}"><b>Ouvrir la classe ${c.num} →</b></button>
        ${c.lien ? `<button class="min-chip" data-gopage="${c.lien.hash.slice(1)}"><b>${c.lien.label}</b></button>` : ""}
      </div>
      ${groupes}
    </div>`;
  }).join("");

  $("#main").innerHTML = `
  <div class="card hero hub-hero">
    <div class="hub-bandeau" aria-hidden="true"><i style="background:var(--cat-magmatique)"></i></div>
    <p class="hub-surtitre">Minéraux</p>
    <h1>💎 Les minéraux</h1>
    <p class="sub" style="font-size:15px;max-width:78ch">Un <b>minéral</b> est une <b>substance pure</b> : une composition
    chimique et une structure cristalline précises (le quartz, c'est <code>SiO₂</code> ; la calcite, <code>CaCO₃</code>).
    C'est la <b>brique</b>. Une <b>roche</b>, elle, est un <b>assemblage de minéraux</b> — le mur fait de briques
    (le granite = quartz + feldspath + mica).</p>
    <p class="sub crumb" style="font-size:13.5px">Rangés selon la <b>classification de Strunz</b> (I → X), la référence actuelle
    (IMA, Mindat) — les <b>silicates (IX)</b> forment à eux seuls ~92 % de la croûte terrestre.</p>
  </div>
  ${cards}
  <div class="card">
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
  </div>`;
  document.title = "Minéraux — Atlas géologique";
}

// ---------------- page oxydes & hydroxydes ----------------
const OX_AXES = [
  { id: "t",   nom: "Température moyenne", min: 0, max: 35, step: 1, unite: "°C", def: 12 },
  { id: "eau", nom: "Régime hydrique", min: 0, max: 100, step: 5, unite: "", def: 50,
    labels: ["sec / saisons sèches", "humide drainé", "engorgé permanent"] },
  { id: "ph",  nom: "pH du sol", min: 3, max: 9, step: 0.1, unite: "", def: 6.5 },
  { id: "mo",  nom: "Matière organique", min: 0, max: 100, step: 5, unite: "", def: 40,
    labels: ["sol minéral nu", "sol ordinaire", "humifère / tourbeux"] },
];
const OX_PRESETS = [
  { nom: "🌦 Océanique (Bretagne)", t: 11, eau: 60, ph: 5.5, mo: 60 },
  { nom: "☀️ Méditerranéen", t: 16, eau: 22, ph: 7.6, mo: 18 },
  { nom: "🌴 Tropical humide", t: 26, eau: 70, ph: 4.6, mo: 50 },
  { nom: "💧 Gley (engorgé)", t: 11, eau: 95, ph: 6.8, mo: 70 },
  { nom: "🏜 Semi-aride", t: 18, eau: 10, ph: 8.2, mo: 8 },
];

function oxScore(cond, v) {
  let s = 1;
  for (const ax of OX_AXES) {
    const [a, b] = cond[ax.id];
    const span = ax.max - ax.min, x = v[ax.id];
    let d = 0;
    if (x < a) d = a - x; else if (x > b) d = x - b;
    s *= Math.exp(-((d / (0.13 * span)) ** 2));
  }
  return s;
}

function renderOxydes() {
  const cards = OXYDES.map((f) => `
    <div class="card ox-hub-card" data-oxyde="${f.id}" style="cursor:pointer">
      <h2 style="display:flex;align-items:center;gap:10px"><span class="sw-big" style="background:${f.couleur};display:inline-block"></span> ${f.element}
        <span class="badge outline">${f.especes.length} espèces</span>
        <span class="min-chip" style="margin-left:auto" data-oxyde="${f.id}">Ouvrir l'onglet →</span></h2>
      <p class="sub">${f.intro}</p>
      <div class="min-chips">${f.especes.map((m) => `<span class="min-chip" style="pointer-events:none"><span class="sw" style="background:${m.swatch}"></span>${m.nom.split(" (")[0]} <small>${m.formule}</small></span>`).join("")}</div>
    </div>`).join("");

  $("#main").innerHTML = `
  <div class="card hero">
    <h1>🟠 Oxydes, hydroxydes &amp; oxy-hydroxydes métalliques</h1>
    <p>Les <b>produits finaux de l'altération</b> : quand les silicates ont rendu leurs cations, il reste les métaux —
    fer, manganèse, aluminium, titane… — verrouillés sous forme d'oxydes. Ce sont les <b>pigments des paysages</b>
    (ocres, rouges, noirs) et des archives du climat. <b>Ouvre l'onglet d'un élément</b> pour le détail de ses espèces
    et son <b>diagramme de Pourbaix</b> (sous quelle forme le métal est stable selon le pH et l'oxydo-réduction).</p>
  </div>
  ${cards}
  ${reperesClimatHTML()}
  ${reperesClimatSourceHTML()}`;

  document.querySelectorAll("[data-oxyde]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation(); location.hash = "oxyde/" + b.dataset.oxyde;
  }));
  document.title = "Oxydes & hydroxydes — Atlas géologique";
}

// charge une vignette par item : d'abord une image LOCALE (images/<dossier>/<id>.jpg, déposée par
// l'utilisateur), sinon la vignette Wikipédia (Wikimedia, libre + lien = attribution).
// Si rien : on garde la pastille de couleur.
async function loadWikiThumbs(items, prefix, dossier) {
  for (const m of items) {
    const slot = document.getElementById(prefix + m.id);
    if (!slot) continue;
    if (dossier) {
      const ok = await new Promise((res) => {
        const im = new Image();
        im.onload = () => res(true); im.onerror = () => res(false);
        im.src = `images/${dossier}/${m.imgId || m.id}.jpg`;
      });
      if (ok) { slot.innerHTML = `<img src="images/${dossier}/${m.imgId || m.id}.jpg" alt="${m.nom}" loading="lazy"><div class="cap">photo locale</div>`; continue; }
    }
    const titres = [m.wiki || m.nom.split(" (")[0].split(" —")[0].trim(), ...(m.wikiAlts || [])];
    for (const title of titres) {
      try {
        const r = await fetch("https://fr.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title));
        if (!r.ok) continue;
        const j = await r.json();
        if (j.thumbnail && j.thumbnail.source) {
          const page = (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || "https://fr.wikipedia.org/wiki/" + encodeURIComponent(title);
          slot.innerHTML = `<a href="${page}" target="_blank" rel="noopener"><img src="${j.thumbnail.source}" alt="${m.nom}" loading="lazy"></a><div class="cap"></div>`;
          legendePhoto(j.thumbnail.source).then((cap) => { if (slot.isConnected) slot.querySelector(".cap").innerHTML = cap; });
          break;
        }
      } catch { /* pas d'image : la pastille de couleur reste */ }
    }
  }
}
function loadOxImages(especes) { return loadWikiThumbs(especes, "oximg-", "oxydes"); }

// schéma : formation des oxydes de fer selon le climat (température × humidité)
function feFormationCard() {
  const box = (x, y, w, h, fill, name, sub) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="rgba(0,0,0,.18)"/>
     <text x="${x + w / 2}" y="${y + h / 2 - 4}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">${name}</text>
     <text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,.88)">${sub}</text>`;
  const arr = (x1, y1, x2, y2, label, lx, ly) =>
    `<path d="M${x1},${y1} L${x2},${y2}" stroke="var(--ink2)" stroke-width="2" fill="none" marker-end="url(#feah)"/>
     ${label ? `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--ink2)">${label}</text>` : ""}`;
  const svg = `
  <svg viewBox="0 0 900 410" width="100%" role="img" style="max-width:900px;display:block">
    <title>Formation des oxydes de fer selon le climat</title>
    <defs>
      <marker id="feah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="var(--ink2)"/></marker>
      <linearGradient id="fetemp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f78c0"/><stop offset="1" stop-color="#c23a2a"/></linearGradient>
    </defs>
    ${box(18, 172, 150, 66, "#5a7060", "Fe²⁺ dissous", "fer réduit, mobile")}
    ${arr(168, 205, 228, 205, "+ O₂", 198, 195)}
    ${box(228, 172, 184, 66, "#8a4a2a", "Ferrihydrite", "le 1ᵉʳ précipité (gel)")}
    <rect x="500" y="66" width="9" height="292" rx="4.5" fill="url(#fetemp)"/>
    <text x="504" y="58" text-anchor="middle" font-size="11" font-weight="700" fill="#3f78c0">❄ 8–15 °C, humide</text>
    <text x="504" y="374" text-anchor="middle" font-size="11" font-weight="700" fill="#c23a2a">🔥 &gt; 15 °C, étés secs</text>
    ${arr(412, 192, 522, 104, "lent", 452, 132)}
    ${box(522, 72, 182, 64, "#b07830", "Goethite", "α-FeOOH · ocre-jaune")}
    ${arr(412, 218, 522, 316, "déshydratation", 452, 292)}
    ${box(522, 290, 182, 64, "#a04030", "Hématite", "α-Fe₂O₃ · rouge")}
    ${arr(412, 205, 522, 203, "", 0, 0)}
    ${box(522, 176, 182, 54, "#c96a2e", "Lépidocrocite", "γ-FeOOH · orange")}
    <text x="716" y="200" text-anchor="middle" font-size="10.5" fill="var(--ink2)">nappe battante,</text>
    <text x="716" y="214" text-anchor="middle" font-size="10.5" fill="var(--ink2)">sans calcaire</text>
    ${arr(704, 100, 748, 100, "feu + MO", 726, 90)}
    ${box(726, 70, 156, 62, "#7d4a38", "Maghémite", "γ-Fe₂O₃ · magnétique")}
  </svg>`;
  return `<div class="card">
    <h2>🌡️ Comment se forment les oxydes de fer ?</h2>
    <p class="sub">Tout part du fer réduit <b>Fe²⁺ dissous</b>. Dès qu'il rencontre l'oxygène, il précipite en quelques heures
    en <b>ferrihydrite</b>, un gel instable — le « premier jet ». La suite dépend du <b>climat</b>.</p>
    <div class="chart-wrap">${svg}</div>
    <p class="sub" style="margin-top:10px">Deux voies principales, commandées par la <b>température et l'humidité</b> :</p>
    <ul class="sub" style="margin:4px 0 8px;padding-left:20px">
      <li><b>Tempéré et humide (8–15 °C, pluie > 65 % de l'ETP), lentement</b> → <b>goethite</b> (α-FeOOH), la rouille ocre-jaune stable : la teinte de la plupart des sols français.</li>
      <li><b>Chaud à étés secs (> 15 °C, sol sec ≥ 45 jours d'affilée), par déshydratation</b> → <b>hématite</b> (α-Fe₂O₃), le rouge des terres méditerranéennes et tropicales.</li>
    </ul>
    <p class="sub">Le <b>rapport hématite/goethite</b> d'un sol est donc un <b>paléo-thermomètre</b>. Et deux voies latérales :
    quand une nappe monte et descend (oxydo-réduction alternée) <b>sans calcaire</b>, le fer se réoxyde en <b>lépidocrocite</b>
    orange ; un coup de chaleur avec de la matière organique (feux de brousse) transforme goethite ou ferrihydrite en
    <b>maghémite</b>, magnétique. La ferrihydrite, elle, ne survit que si la matière organique bloque sa maturation.</p>
  </div>`;
}

// ---------------- goethite ou hématite : chaleur, eau et temps (onglet fer) ----------------
// Vitesses relatives par la loi d'Arrhenius, k ∝ exp(−Ea/RT), rapportées à 25 °C. Énergies d'activation de
// cristallisation à partir de ferrihydrite mesurées par Shaw et al. (2005, Am. Mineral. 90) : hématite 69 kJ/mol,
// goethite 39 kJ/mol (60–137 °C, milieu alcalin) — un ordre de grandeur pour les sols, pas une mesure.
const FE_CINETIQUE = { R: 8.314, T25: 298.15, eaHm: 69000, eaGt: 39000 };
function feVitesse(ea, tC) {
  return Math.exp(ea / FE_CINETIQUE.R * (1 / FE_CINETIQUE.T25 - 1 / (tC + 273.15)));
}
const feNb = (v, d = 1) => v.toFixed(d).replace(".", ",").replace(/^-/, "−");

function feChaleurCard() {
  const HM = "#a8412f", GT = "#b07830";
  const grille = "display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;align-items:start";
  const curseur = (id, lab, min, max, val) => `
    <label class="sub" style="display:block;margin:0 0 2px" for="${id}">${lab} : <b id="${id}-val">${val} °C</b></label>
    <input type="range" id="${id}" min="${min}" max="${max}" step="1" value="${val}" style="width:100%;margin:0 0 10px">`;
  return `<div class="card" id="fe-chaleur">
    <h2>⏳ Goethite ou hématite : la chaleur, l'eau et le temps</h2>
    <p class="sub">La ferrihydrite, premier précipité du fer, devient goethite en se redissolvant, ou hématite en perdant son eau
    sur place. La température, le pH et l'eau décident de la voie et de la vitesse.</p>

    <h3 style="margin:16px 0 6px">Faut-il compter en degrés-jours ?</h3>
    <p class="sub">Non. Les degrés-jours sont linéaires, alors qu'une réaction chimique suit la loi d'Arrhenius, exponentielle. Avec
    les énergies d'activation mesurées par Shaw et al. (2005) — 69 kJ/mol pour l'hématite, 39 kJ/mol pour la goethite —, passer
    de 15 à 25 °C multiplie la vitesse de l'hématite par 2,6 et celle de la goethite par 1,7 : la chaleur avantage l'hématite.</p>
    <div style="${grille}">
      <div class="chart-wrap" id="fe-arrh-wrap"></div>
      <div>
        ${curseur("fe-t", "Température du sol", 0, 40, 15)}
        <div class="tiles" style="grid-template-columns:repeat(3,minmax(0,1fr));margin:0">
          <div class="tile"><div class="lab">Hématite</div><div class="val" id="fe-v-hm" style="color:${HM}">—</div></div>
          <div class="tile"><div class="lab">Goethite</div><div class="val" id="fe-v-gt" style="color:${GT}">—</div></div>
          <div class="tile"><div class="lab">Degrés-jours</div><div class="val" id="fe-v-dj">—</div></div>
        </div>
        <p class="sub" style="margin:6px 0 0">Vitesses rapportées à celle d'un sol à 25 °C.</p>
      </div>
    </div>

    <h3 style="margin:16px 0 6px">Une année de sol</h3>
    <p class="sub">À moyenne égale, des saisons marquées accélèrent la transformation : l'été chaud compte plus que l'hiver froid.
    Le calcul additionne la vitesse jour par jour et la convertit en jours à 25 °C.</p>
    <div style="${grille}">
      <div>
        ${curseur("fe-moy", "Température moyenne annuelle du sol", 0, 30, 12)}
        ${curseur("fe-amp", "Écart saisonnier (±)", 0, 15, 8)}
        <p class="sub" id="fe-regime" style="margin:0"></p>
      </div>
      <div class="tiles" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:0">
        <div class="tile"><div class="lab">Une année vaut, pour l'hématite</div><div class="val" id="fe-a-hm" style="color:${HM};font-size:18px">—</div></div>
        <div class="tile"><div class="lab">… et pour la goethite</div><div class="val" id="fe-a-gt" style="color:${GT};font-size:18px">—</div></div>
        <div class="tile" style="grid-column:1 / -1"><div class="lab">Effet des saisons (par rapport à la même moyenne sans saisons)</div>
          <div class="val" id="fe-a-sais" style="font-size:15px">—</div></div>
      </div>
    </div>

    <h3 style="margin:16px 0 6px">Ce qu'on observe</h3>
    <div style="${grille}">
      <div class="chart-wrap">${feRatioSVG(HM, GT)}</div>
      <table class="data" style="width:100%">
        <tr><td style="color:${HM};font-weight:650">Favorise l'hématite</td><td style="color:${GT};font-weight:650">Favorise la goethite</td></tr>
        <tr><td>chaleur</td><td>fraîcheur</td></tr>
        <tr><td>pH proche de 7–8</td><td>pH acide, ou très basique</td></tr>
        <tr><td>peu d'excès d'eau</td><td>excès d'eau</td></tr>
        <tr><td>peu de matière organique</td><td>matière organique abondante</td></tr>
      </table>
    </div>
    <ul class="sub" style="margin:10px 0 0;padding-left:20px;line-height:1.6">
      <li><b>Laboratoire :</b> de la ferrihydrite gardée 10 à 12 ans entre 4 et 25 °C s'est transformée à 20–100 % selon le pH ;
      entre 50 et 100 °C, il suffit de jours à mois (Schwertmann et al. 2004 ; Das et al. 2011).</li>
      <li><b>Sols :</b> la goethite domine quand il fait plus frais, plus humide, plus organique et plus acide (Kämpf et Schwertmann
      1983) ; la rubéfaction progresse avec l'âge des terrasses (Torrent et al. 1980).</li>
      <li><b>Feu :</b> la goethite devient hématite vers 250–350 °C, et un sol rougit après environ 45 min au-delà de 600 °C (Cornell
      et Schwertmann 2003 ; Ketterings et Bigham 2000). À la température d'un sol, l'hématite naît de la ferrihydrite, pas de la goethite.</li>
    </ul>
    <details style="margin-top:10px">
      <summary style="cursor:pointer;font-weight:600">Sources et limites</summary>
      <p class="sub" style="margin:8px 0 0;line-height:1.6">Loi d'Arrhenius : k(T) / k(25 °C) = exp[Ea/R · (1/298,15 − 1/T)], avec
      R = 8,314 J/(mol·K). Les énergies d'activation ont été mesurées entre 60 et 137 °C en milieu alcalin : pour un sol, c'est un ordre
      de grandeur. Régimes de température du sol : Soil Taxonomy (moyenne annuelle à 50 cm). Références : Schwertmann, Stanjek et Becher
      (2004) Clay Minerals 39 · Das, Hendry et Essilfie-Dughan (2011) Environ. Sci. Technol. 45 · Shaw et al. (2005) American
      Mineralogist 90 · Kämpf et Schwertmann (1983) Geoderma 29 · Torrent, Schwertmann et Schulze (1980) Geoderma 23 · Ketterings et
      Bigham (2000) Soil Sci. Soc. Am. J. 64 · Cornell et Schwertmann (2003) The Iron Oxides, Wiley-VCH.</p>
    </details>
  </div>`;
}

// part d'hématite mesurée à pH 7–8 (Schwertmann et al. 2004) : fourchettes publiées à 4 et 25 °C
function feRatioSVG(HM, GT) {
  const X0 = 58, X1 = 330, Y0 = 18, Y1 = 208;
  const py = (v) => Y1 - v * (Y1 - Y0);
  const barre = (x, lo, hi, lab) => `
    <rect x="${x - 30}" y="${py(hi)}" width="60" height="${py(lo) - py(hi)}" fill="${HM}" opacity="0.75" rx="3"/>
    <rect x="${x - 30}" y="${py(1)}" width="60" height="${py(hi) - py(1)}" fill="${GT}" opacity="0.18" rx="3"/>
    <text x="${x}" y="${py(hi) - 6}" text-anchor="middle" class="tick-lab">${feNb(lo)}–${feNb(hi)}</text>
    <text x="${x}" y="${Y1 + 18}" text-anchor="middle" class="tick-lab">${lab}</text>`;
  let s = "";
  for (let v = 0; v <= 1.0001; v += 0.25)
    s += `<line x1="${X0}" y1="${py(v)}" x2="${X1}" y2="${py(v)}" stroke="var(--grid)" stroke-width="1"/>
      <text x="${X0 - 8}" y="${py(v) + 4}" text-anchor="end" class="tick-lab">${feNb(v, 2)}</text>`;
  s += barre(135, 0.1, 0.2, "4 °C") + barre(255, 0.7, 0.8, "25 °C");
  s += `<text x="${(X0 + X1) / 2}" y="${Y1 + 38}" text-anchor="middle" class="axis-lab">ferrihydrite vieillie à pH 7–8</text>
    <text x="14" y="${(Y0 + Y1) / 2}" transform="rotate(-90 14 ${(Y0 + Y1) / 2})" text-anchor="middle" class="axis-lab">part d'hématite Hm/(Hm+Gt)</text>`;
  return `<svg viewBox="0 0 350 256" xmlns="http://www.w3.org/2000/svg" style="max-width:420px">${s}</svg>`;
}

function feArrheniusSVG(tC, HM, GT) {
  const X0 = 50, X1 = 500, Y0 = 16, Y1 = 238, yMax = 4;
  const px = (t) => X0 + t / 40 * (X1 - X0), py = (v) => Y1 - Math.min(v, yMax) / yMax * (Y1 - Y0);
  const courbe = (f) => Array.from({ length: 81 }, (_, i) => `${px(i / 2)},${py(f(i / 2))}`).join(" ");
  let s = "";
  for (let v = 0; v <= yMax; v++)
    s += `<line x1="${X0}" y1="${py(v)}" x2="${X1}" y2="${py(v)}" stroke="var(--grid)" stroke-width="1"/>
      <text x="${X0 - 8}" y="${py(v) + 4}" text-anchor="end" class="tick-lab">×${v}</text>`;
  for (let t = 0; t <= 40; t += 10)
    s += `<text x="${px(t)}" y="${Y1 + 18}" text-anchor="middle" class="tick-lab">${t} °C</text>`;
  s += `<line x1="${px(25)}" y1="${Y0}" x2="${px(25)}" y2="${Y1}" stroke="var(--baseline)" stroke-dasharray="3 4"/>
    <polyline points="${courbe((t) => t / 25)}" fill="none" stroke="var(--ink2)" stroke-width="2" stroke-dasharray="7 5"/>
    <polyline points="${courbe((t) => feVitesse(FE_CINETIQUE.eaGt, t))}" fill="none" stroke="${GT}" stroke-width="3"/>
    <polyline points="${courbe((t) => feVitesse(FE_CINETIQUE.eaHm, t))}" fill="none" stroke="${HM}" stroke-width="3"/>
    <line x1="${px(tC)}" y1="${Y0}" x2="${px(tC)}" y2="${Y1}" stroke="var(--ink)" stroke-width="1" opacity="0.4"/>
    <circle cx="${px(tC)}" cy="${py(feVitesse(FE_CINETIQUE.eaHm, tC))}" r="5" fill="${HM}"/>
    <circle cx="${px(tC)}" cy="${py(feVitesse(FE_CINETIQUE.eaGt, tC))}" r="5" fill="${GT}"/>
    <circle cx="${px(tC)}" cy="${py(tC / 25)}" r="4" fill="var(--ink2)"/>
    <text x="${X0 + 8}" y="${Y0 + 14}" class="tick-lab" style="fill:${HM};font-weight:650">hématite (Ea 69 kJ/mol)</text>
    <text x="${X0 + 8}" y="${Y0 + 30}" class="tick-lab" style="fill:${GT};font-weight:650">goethite (Ea 39 kJ/mol)</text>
    <text x="${X0 + 8}" y="${Y0 + 46}" class="tick-lab">degrés-jours (linéaire)</text>
    <text x="${(X0 + X1) / 2}" y="${Y1 + 38}" text-anchor="middle" class="axis-lab">vitesse relative, 1 = 25 °C</text>`;
  return `<svg viewBox="0 0 520 284" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function initFeChaleur() {
  const HM = "#a8412f", GT = "#b07830";
  const t = $("#fe-t"), moy = $("#fe-moy"), amp = $("#fe-amp");
  if (!t) return;
  const majT = () => {
    const tc = +t.value;
    $("#fe-t-val").textContent = `${tc} °C`;
    $("#fe-arrh-wrap").innerHTML = feArrheniusSVG(tc, HM, GT);
    $("#fe-v-hm").textContent = `×${feNb(feVitesse(FE_CINETIQUE.eaHm, tc), 2)}`;
    $("#fe-v-gt").textContent = `×${feNb(feVitesse(FE_CINETIQUE.eaGt, tc), 2)}`;
    $("#fe-v-dj").textContent = `×${feNb(tc / 25, 2)}`;
  };
  const majAnnee = () => {
    const m = +moy.value, a = +amp.value;
    let eqH = 0, eqG = 0, dj = 0;
    for (let j = 0; j < 365; j++) {
      const tj = m + a * Math.sin(2 * Math.PI * j / 365);
      eqH += feVitesse(FE_CINETIQUE.eaHm, tj); eqG += feVitesse(FE_CINETIQUE.eaGt, tj); dj += Math.max(tj, 0);
    }
    const pct = (x, ref) => {
      if (!(ref > 0)) return "—";
      const p = Math.round((x / ref - 1) * 100);
      return `${p > 0 ? "+" : p < 0 ? "−" : ""}${Math.abs(p)} %`;
    };
    $("#fe-moy-val").textContent = `${m} °C`;
    $("#fe-amp-val").textContent = `± ${a} °C`;
    $("#fe-a-hm").textContent = `${Math.round(eqH)} jours à 25 °C`;
    $("#fe-a-gt").textContent = `${Math.round(eqG)} jours à 25 °C`;
    $("#fe-a-sais").textContent = `hématite ${pct(eqH, 365 * feVitesse(FE_CINETIQUE.eaHm, m))} · goethite ${pct(eqG, 365 * feVitesse(FE_CINETIQUE.eaGt, m))} · degrés-jours ${pct(dj, 365 * Math.max(m, 0))}`;
    const balance = eqH / eqG;   // les deux vitesses valent 1 à 25 °C : ce rapport compare au sol de 25 °C
    $("#fe-regime").textContent = `Régime du sol (Soil Taxonomy) : ${m < 8 ? "frigide" : m < 15 ? "mésique" : m < 22 ? "thermique" : "hyperthermique"}. `
      + `Rapport hématite/goethite : ×${feNb(balance, 2)} par rapport à un sol à 25 °C.`;
  };
  t.addEventListener("input", majT);
  moy.addEventListener("input", majAnnee);
  amp.addEventListener("input", majAnnee);
  majT(); majAnnee();
}

// ---------------- onglet détaillé d'un élément (fiches + diagramme de Pourbaix) ----------------
function renderOxydeElement(id) {
  const fam = OXYDES.find((f) => f.id === id) || OXYDES[0];
  const sys0 = POURBAIX[fam.id];
  let sys = sys0 && PourbaixCalc.systeme(fam.id, state.phehLogA);
  const especes = fam.especes.map((m) => `
    <div class="groupe-bloc">
      <div class="ox-fiche">
        <div class="ox-img" id="oximg-${m.id}"><span class="sw-ph" style="background:${m.swatch}" title="couleur : ${m.couleurs || ""}"></span></div>
        <div class="ox-body">
          <div class="groupe-head" style="margin-bottom:4px"><b>${m.nom}</b>
            <span class="badge outline">${m.formule}</span>
            <span class="origine-tag ${m.badge ? "" : "pedo"}">${m.badge || "pédogénique"}</span></div>
          <div class="crit-row" style="margin:6px 0">
            ${m.systeme ? `<span class="crit"><i>Système</i>${m.systeme}</span>` : ""}
            ${m.durete != null ? `<span class="crit"><i>Dureté</i>${m.durete}/10</span>` : ""}
            ${m.densite != null ? `<span class="crit"><i>Densité</i>${m.densite}</span>` : ""}
            ${m.couleurs ? `<span class="crit"><i>Couleur</i>${m.couleurs}</span>` : ""}</div>
          ${m.contexte ? `<p class="sub" style="margin:4px 0"><b>Où :</b> ${m.contexte}</p>` : ""}
          <p class="sub" style="margin:4px 0">${m.note}</p>
          ${m.devient ? `<p class="sub" style="margin:4px 0"><b>Devient :</b> ${m.devient}</p>` : ""}
          ${m.condNote ? `<p class="sub" style="margin:4px 0;color:var(--ink2)"><b>Formation :</b> ${m.condNote}</p>` : ""}
        </div>
      </div>
    </div>`).join("");

  const article = sys && /^[aeiouyéèêh]/.test(sys.nom.toLowerCase()) ? "l'" : "le ";
  const diagramme = sys ? `
  <div class="card">
    <h2>Diagramme de Pourbaix (pH–Eh)</h2>
    <p class="sub">Sous quelle forme ${article}${sys.nom.toLowerCase()} est-il stable ? <b>Clique ou fais glisser</b> le point,
    ou choisis un milieu naturel. Le curseur règle la quantité de ${sys.nom.toLowerCase()} dissous : plus il y en a, plus tôt un solide précipite.</p>
    <div class="chips" style="margin-bottom:12px">${PHEH_MILIEUX.map((m, i) => `<button class="chip" data-phmil="${i}">${m.nom}</button>`).join("")}</div>
    <div class="pheh-conc">
      <label for="pheh-conc">${sys.nom} dissous</label>
      <div class="pheh-conc-piste">
        <input type="range" id="pheh-conc" min="${PourbaixCalc.MIN}" max="${PourbaixCalc.MAX}" step="0.1" value="${state.phehLogA}">
        <div class="pheh-conc-grad" aria-hidden="true">${[-8, -7, -6, -5, -4, -3, -2].map((n) => `<span>10<sup>${String(n).replace("-", "−")}</sup></span>`).join("")}</div>
      </div>
      <output for="pheh-conc" id="pheh-conc-val"><b id="pheh-conc-mol"></b><span id="pheh-conc-masse"></span></output>
      <button class="chip" id="pheh-conc-defaut">10⁻⁶ (repère)</button>
    </div>
    <div class="chart-wrap" id="pheh-wrap">${pourbaixSVG(sys)}</div>
    <div class="tiles" style="margin-top:6px">
      <div class="tile"><div class="lab">Conditions choisies</div><div class="val" id="pheh-xy">—</div></div>
      <div class="tile" style="grid-column:span 2"><div class="lab">Forme stable <span class="badge" id="pheh-type"></span></div><div class="val" id="pheh-forme">—</div>
        <div class="lab" id="pheh-desc" style="margin-top:4px;font-size:12.5px;line-height:1.5"></div></div>
      <div class="tile"><div class="lab">Minéral(aux)</div><div class="val" id="pheh-min" style="font-size:14px">—</div></div>
    </div>
    <div class="note">${sys.note} <b>Repère :</b> 25 °C, espèces dissoutes à la concentration du curseur (10⁻⁶ mol/L par défaut,
    le seuil de Pourbaix ; les valeurs citées dans les textes sont données pour 10⁻⁶) ; tiretés noirs : limites de stabilité
    de l'eau.${sys.source ? ` <b>Calcul :</b> ${sys.source}` : ""}</div>
    ${guideLecturePourbaix()}
  </div>` : `
  <div class="card">
    <h2>Diagramme de Pourbaix (pH–Eh)</h2>
    <p class="sub">Diagramme en préparation pour cet élément — à venir, à partir de sources fiables.</p>
  </div>`;

  const chaleur = fam.id === "fer";
  $("#main").innerHTML = `
  <div class="card rock-head">
    <h1><span class="sw-big" style="background:${fam.couleur};display:inline-block"></span> ${fam.element}</h1>
    <p class="sub crumb"><b data-page="oxydes" style="cursor:pointer;text-decoration:underline">Oxydes</b> <span>→</span> ${fam.element}
      · ${fam.especes.length} espèces</p>
    <p class="desc">${fam.intro}</p>
  </div>
  ${chaleur ? feFormationCard() : ""}
  ${chaleur ? feChaleurCard() : ""}
  <div class="card">
    <h2>Les espèces</h2>
    ${especes}
  </div>
  ${diagramme}
  ${reperesClimatHTML()}
  ${reperesClimatSourceHTML()}`;

  loadOxImages(fam.especes);
  document.querySelectorAll("[data-page]").forEach((b) => b.addEventListener("click", () => location.hash = b.dataset.page));
  if (chaleur) initFeChaleur();

  if (sys) {
    document.querySelectorAll("[data-phmil]").forEach((b) => b.addEventListener("click", () => {
      const m = PHEH_MILIEUX[+b.dataset.phmil];
      state.phehPt = { ph: m.ph, eh: m.eh }; majCurseur(); majLecture();
    }));
    // Le SVG est redessiné quand la concentration change : les gestes sont branchés sur son cadre, qui reste.
    const wrap = $("#pheh-wrap");
    function coords(ev) {
      const r = $("#pheh-svg").getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width * 1000, y = (ev.clientY - r.top) / r.height * 620;
      const ph = PHEH.phMin + (x - PHEH.X0) / (PHEH.X1 - PHEH.X0) * (PHEH.phMax - PHEH.phMin);
      const eh = PHEH.ehMin + (PHEH.Y1 - y) / (PHEH.Y1 - PHEH.Y0) * (PHEH.ehMax - PHEH.ehMin);
      return { ph: Math.min(Math.max(ph, PHEH.phMin), PHEH.phMax), eh: Math.min(Math.max(eh, PHEH.ehMin), PHEH.ehMax) };
    }
    // Le point ne suit le pointeur que bouton enfoncé ; toute fin de geste (relâché, annulé, capture perdue)
    // arrête le suivi, sinon le simple survol déplacerait le point.
    let drag = false;
    const stop = () => { drag = false; };
    wrap.addEventListener("pointerdown", (e) => {
      if (!e.target.closest("#pheh-svg")) return;
      drag = true;
      try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
      state.phehPt = coords(e); majCurseur(); majLecture();
    });
    wrap.addEventListener("pointermove", (e) => { if (drag && e.buttons) { state.phehPt = coords(e); majCurseur(); majLecture(); } });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => wrap.addEventListener(t, stop));
    // Curseur de concentration : le diagramme est recalculé (au plus une fois par image), le point ne bouge pas.
    const conc = $("#pheh-conc");
    let enAttente = false;
    function majConcentration() {
      const v = +conc.value;
      $("#pheh-conc-mol").textContent = PourbaixCalc.molaire(v);
      $("#pheh-conc-masse").textContent = PourbaixCalc.massique(fam.id, v);
      $("#pheh-conc-defaut").disabled = Math.abs(v - PourbaixCalc.DEFAUT) < 1e-9;
    }
    function redessiner() {
      enAttente = false;
      state.phehLogA = Math.round(+conc.value * 10) / 10;
      sys = PourbaixCalc.systeme(fam.id, state.phehLogA);
      wrap.innerHTML = pourbaixSVG(sys);
      majLecture();
    }
    conc.addEventListener("input", () => {
      majConcentration();
      if (!enAttente) { enAttente = true; requestAnimationFrame(redessiner); }
    });
    $("#pheh-conc-defaut").addEventListener("click", () => {
      conc.value = PourbaixCalc.DEFAUT; majConcentration(); redessiner();
    });
    majConcentration();
    function majCurseur() {
      const g = $("#pheh-cursor"), { ph, eh } = state.phehPt;
      g.innerHTML = `
        <line x1="${phX(ph)}" y1="${PHEH.Y0}" x2="${phX(ph)}" y2="${PHEH.Y1}" stroke="var(--ink)" stroke-width="1" opacity="0.35"/>
        <line x1="${PHEH.X0}" y1="${ehY(eh)}" x2="${PHEH.X1}" y2="${ehY(eh)}" stroke="var(--ink)" stroke-width="1" opacity="0.35"/>
        <circle cx="${phX(ph)}" cy="${ehY(eh)}" r="9" fill="var(--ink)" stroke="var(--surface)" stroke-width="3"/>`;
    }
    function majLecture() {
      const { ph, eh } = state.phehPt;
      $("#pheh-xy").innerHTML = `pH ${ph.toFixed(1)}<br>Eh ${eh >= 0 ? "+" : ""}${eh.toFixed(2)} V`;
      const dom = sys.domaines.find((d) => dansPolygone([ph, eh], d.points));
      if (dom) {
        $("#pheh-forme").textContent = dom.nom;
        $("#pheh-forme").title = dom.nom;
        const t = $("#pheh-type");
        t.style.visibility = "visible";
        t.style.background = dom.type === "dissous" ? "var(--prod-dissous)" : "var(--prod-limon)";
        t.textContent = dom.type === "dissous" ? "dissous — mobile" : "solide — immobile";
        $("#pheh-desc").textContent = dom.desc;
        const mins = dom.mineraux || (dom.mineral ? [dom.mineral] : []);
        $("#pheh-min").innerHTML = mins.length
          ? mins.filter((mid) => MINERAUX[mid]).map((mid) => `<button class="min-chip" data-min="${mid}" style="padding:2px 8px"><span class="sw" style="background:${MINERAUX[mid].swatch}"></span>${MINERAUX[mid].nom.split(" (")[0]}</button>`).join(" ")
          : "—";
      } else { $("#pheh-type").style.visibility = "hidden"; $("#pheh-forme").textContent = "—"; $("#pheh-desc").textContent = ""; $("#pheh-min").textContent = "—"; }
      if (eh > 1.229 - 0.0592 * ph || eh < -0.0592 * ph)
        $("#pheh-desc").textContent += " ⚠️ Hors du domaine de l'eau : irréalisable dans la nature.";
    }
    majCurseur(); majLecture();
  }
  document.title = fam.element + " — Oxydes — Atlas géologique";
}

// ---------------- visualiseur pH–Eh (Pourbaix) ----------------
const PHEH = { phMin: 0, phMax: 14, ehMin: -1.0, ehMax: 2.0, X0: 70, X1: 960, Y0: 30, Y1: 560 };
function phX(ph) { return PHEH.X0 + (ph - PHEH.phMin) / (PHEH.phMax - PHEH.phMin) * (PHEH.X1 - PHEH.X0); }
function ehY(eh) { return PHEH.Y1 - (eh - PHEH.ehMin) / (PHEH.ehMax - PHEH.ehMin) * (PHEH.Y1 - PHEH.Y0); }

function dansPolygone(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function guideLecturePourbaix() {
  return `<details class="pheh-guide" style="margin-top:12px">
    <summary style="cursor:pointer;font-weight:600">Comment lire ce diagramme</summary>
    <ul class="sub" style="margin:8px 0 0;padding-left:20px;line-height:1.6">
      <li><b>Axes :</b> le pH (acide à gauche, basique à droite) et l'Eh, le pouvoir oxydant de l'eau (riche en oxygène en haut,
      privée d'oxygène en bas). Un sol qui s'engorge fait descendre le point.</li>
      <li><b>Domaines :</b> la forme la plus stable de l'élément, dissoute (emportée par l'eau) ou solide (qui reste sur place).</li>
      <li><b>Limites :</b> chacune est une réaction. Verticale, elle n'échange que des protons (le pH décide) ; horizontale, que des
      électrons (le potentiel décide) ; oblique, les deux.</li>
      <li><b>Tiretés noirs :</b> au-delà, l'eau elle-même se décompose ; les milieux naturels restent entre les deux.</li>
      <li><b>10⁻⁶ mol/L :</b> le seuil de Pourbaix pour dire qu'un métal passe en solution. Le curseur change cette concentration :
      plus le métal dissous est abondant, plus tôt il précipite, et les domaines solides s'élargissent ; très dilué, il reste en
      solution plus loin, et de petites espèces dissoutes apparaissent sur les bords.</li>
      <li><b>Stable n'est pas immédiat :</b> le diagramme donne l'équilibre, pas la vitesse pour l'atteindre.</li>
    </ul>
  </details>`;
}

function pourbaixSVG(sys) {
  let out = "";
  // domaines (tous les polygones d'abord, pour qu'aucun ne recouvre une étiquette)
  for (const d of sys.domaines) {
    const pts = d.points.map(([p, e]) => `${phX(p)},${ehY(e)}`).join(" ");
    out += `<polygon points="${pts}" fill="${d.couleur}" stroke="var(--surface)" stroke-width="1.5" data-dom="${d.id}" style="cursor:crosshair"/>`;
  }
  // étiquettes : barycentre des sommets par défaut ; `etiquette: [pH, Eh]` la place, `false` la masque
  // (domaine trop petit, lisible au curseur) ; `court` n'écrit qu'une ligne, que `angle` (degrés) incline
  // le long d'une bande ; `renvoi: [pH, Eh]` relie par un trait une étiquette posée hors d'un domaine trop fin
  for (const d of sys.domaines) {
    if (d.etiquette === false) continue;
    const [cx, cy] = d.etiquette || [d.points.reduce((s, p) => s + p[0], 0) / d.points.length,
      d.points.reduce((s, p) => s + p[1], 0) / d.points.length];
    const x = phX(cx), y = ehY(cy);
    if (d.renvoi) {
      const rx = phX(d.renvoi[0]), ry = ehY(d.renvoi[1]);
      out += `<line x1="${x}" y1="${ry < y ? y - 14 : y + 5}" x2="${rx}" y2="${ry}" stroke="var(--ink2)" stroke-width="1" pointer-events="none"/>
      <circle cx="${rx}" cy="${ry}" r="2.5" fill="var(--ink2)" pointer-events="none"/>`;
    }
    out += d.court
      ? `<text x="${x}" y="${y}" text-anchor="middle" class="pheh-lab" pointer-events="none"${d.angle ? ` transform="rotate(${d.angle} ${x} ${y})"` : ""}>${d.court}</text>`
      : `<text x="${x}" y="${y}" text-anchor="middle" class="pheh-lab" pointer-events="none">${d.nom}</text>
      <text x="${x}" y="${y + 15}" text-anchor="middle" class="pheh-lab2" pointer-events="none">${d.formule}</text>`;
  }
  // lignes repères (phase métastable : ferrihydrite), tiretées, nommées le long du trait
  for (const l of sys.lignes || []) {
    out += `<polyline points="${l.points.map(([p, e]) => `${phX(p)},${ehY(e)}`).join(" ")}" fill="none" stroke="${l.couleur}"
      stroke-width="2.5" stroke-dasharray="9 5" pointer-events="none"/>`;
    if (l.etiquette) {
      const [p, e, a] = l.etiquette, x = phX(p), y = ehY(e);
      out += `<text x="${x}" y="${y - 7}" text-anchor="middle" class="pheh-lab2" style="fill:${l.couleur};font-weight:650"
        transform="rotate(${a || 0} ${x} ${y})" pointer-events="none">${l.nom}</text>`;
    }
  }
  // limites de stabilité de l'eau : Eh = E⁰ − 0,0592·pH
  // légende posée le long du tireté et calée sur le bord droit du cadre (elle débordait du SVG)
  const pente = Math.atan2(ehY(-0.0592) - ehY(0), phX(1) - phX(0)) * 180 / Math.PI;
  const wline = (E0, label, dy, finPH) => {
    const a = [PHEH.phMin, E0 - 0.0592 * PHEH.phMin];
    const b = [PHEH.phMax, E0 - 0.0592 * PHEH.phMax];
    const x = phX(finPH), y = ehY(E0 - 0.0592 * finPH) + dy;
    return `<line x1="${phX(a[0])}" y1="${ehY(a[1])}" x2="${phX(b[0])}" y2="${ehY(b[1])}"
        stroke="var(--ink2)" stroke-width="1.5" stroke-dasharray="6 5" pointer-events="none"/>
      <text x="${x}" y="${y}" text-anchor="end" transform="rotate(${pente} ${x} ${y})" class="pheh-lab2" pointer-events="none">${label}</text>`;
  };
  const eau = sys.eau || {};
  out += wline(1.229, "au-dessus : l'eau s'oxyde en O₂", -8, eau.o2 || 13.8);
  out += wline(0, "en dessous : l'eau se réduit en H₂", 16, eau.h2 || 13.8);
  // axes
  for (let p = 0; p <= 14; p += 2)
    out += `<line x1="${phX(p)}" y1="${PHEH.Y1}" x2="${phX(p)}" y2="${PHEH.Y1 + 6}" class="baseline"/>
      <text x="${phX(p)}" y="${PHEH.Y1 + 22}" text-anchor="middle" class="tick-lab">${p}</text>`;
  for (let e = -1.0; e <= 2.001; e += 0.5)
    out += `<line x1="${PHEH.X0 - 6}" y1="${ehY(e)}" x2="${PHEH.X0}" y2="${ehY(e)}" class="baseline"/>
      <text x="${PHEH.X0 - 12}" y="${ehY(e) + 4}" text-anchor="end" class="tick-lab">${e.toFixed(1)}</text>`;
  out += `<text x="${(PHEH.X0 + PHEH.X1) / 2}" y="${PHEH.Y1 + 44}" text-anchor="middle" class="axis-lab">pH (acide ← → basique)</text>
    <text x="18" y="${(PHEH.Y0 + PHEH.Y1) / 2}" class="axis-lab" transform="rotate(-90 18 ${(PHEH.Y0 + PHEH.Y1) / 2})" text-anchor="middle">Eh (volts) — réducteur ↓ / oxydant ↑</text>`;
  // curseur
  const { ph, eh } = state.phehPt;
  out += `<g id="pheh-cursor" pointer-events="none">
    <line x1="${phX(ph)}" y1="${PHEH.Y0}" x2="${phX(ph)}" y2="${PHEH.Y1}" stroke="var(--ink)" stroke-width="1" opacity="0.35"/>
    <line x1="${PHEH.X0}" y1="${ehY(eh)}" x2="${PHEH.X1}" y2="${ehY(eh)}" stroke="var(--ink)" stroke-width="1" opacity="0.35"/>
    <circle cx="${phX(ph)}" cy="${ehY(eh)}" r="9" fill="var(--ink)" stroke="var(--surface)" stroke-width="3"/>
  </g>`;
  return `<svg id="pheh-svg" viewBox="0 0 1000 620" xmlns="http://www.w3.org/2000/svg" style="touch-action:none">${out}</svg>`;
}

function renderPourbaix() {
  const sys = POURBAIX[state.phehEl] || POURBAIX.fe;
  const pills = Object.entries(POURBAIX).map(([id, s]) =>
    `<button class="chip ${id === state.phehEl ? "on" : ""}" data-phel="${id}">${s.nom}</button>`).join("");

  $("#main").innerHTML = `
  <div class="card hero">
    <h1>⚗️ Sous quelle forme ? — le visualiseur pH–Eh</h1>
    <p>Deux nombres décrivent la chimie d'une eau ou d'un sol : son <b>pH</b> (acide ou basique) et son <b>Eh</b>
    (le potentiel d'oxydo-réduction : riche en oxygène = oxydant en haut, privé d'oxygène = réducteur en bas).
    Ces <b>diagrammes de Pourbaix</b> montrent, pour chaque couple pH–Eh, la forme stable d'un métal :
    <b>dissous</b> (il voyage avec l'eau) ou <b>solide</b> (il reste sur place). <b>Clique ou fais glisser</b> le point
    sur le diagramme, ou choisis un milieu naturel type.</p>
  </div>

  <div class="card">
    <div class="chips" style="margin-bottom:8px">${pills}</div>
    <div class="chips" style="margin-bottom:12px">${PHEH_MILIEUX.map((m, i) => `<button class="chip" data-phmil="${i}">${m.nom}</button>`).join("")}</div>
    <div class="chart-wrap" id="pheh-wrap">${pourbaixSVG(sys)}</div>
    <div class="tiles" style="margin-top:6px">
      <div class="tile"><div class="lab">Conditions choisies</div><div class="val" id="pheh-xy">—</div></div>
      <div class="tile" style="grid-column:span 2"><div class="lab">Forme stable du ${sys.nom.toLowerCase()}</div><div class="val" id="pheh-forme">—</div>
        <div class="lab" id="pheh-desc" style="margin-top:4px;font-size:12.5px;line-height:1.5"></div></div>
      <div class="tile"><div class="lab">Fiche minérale</div><div class="val" id="pheh-min" style="font-size:14px">—</div></div>
    </div>
    <div class="note">${sys.note} <b>Repères :</b> diagramme simplifié (25 °C, concentrations ≈ 10⁻⁶ mol/L), à lire comme une
    carte qualitative — les frontières exactes dépendent des concentrations et des autres ions présents.</div>
  </div>

  <div class="card">
    <h2>Lire le diagramme comme un pédologue</h2>
    <p class="sub">Quelques trajets classiques :</p>
    <p>• <b>Un sol qui s'engorge</b> (l'hiver, une nappe monte) : le point descend verticalement — le fer solide repasse
    en Fe²⁺ dissous, migre, puis reprécipite en ocre là où l'oxygène revient : c'est la naissance des taches des
    <b>pseudogleys</b> et des horizons rouillés.</p>
    <p>• <b>Un drainage minier acide</b> : pyrite oxydée → le point file en haut à gauche (pH 2–3, Eh fort) — seul domaine
    où le fer ferrique reste dissous, d'où ces rivières orange qui précipitent leur fer dès que le pH remonte.</p>
    <p>• <b>Le manganèse retardataire</b> : son domaine dissous est bien plus vaste que celui du fer — dans un profil,
    les taches noires de Mn se déposent toujours plus loin (ou plus tard) que les taches ocre de fer.</p>
    <p>• <b>L'aluminium</b> ne « voit » pas l'Eh : seul le pH le mobilise, aux deux extrêmes — c'est le poison des sols
    trop acidifiés.</p>
  </div>`;

  // interactions
  document.querySelectorAll("[data-phel]").forEach((b) => b.addEventListener("click", () => {
    state.phehEl = b.dataset.phel; renderPourbaix();
  }));
  document.querySelectorAll("[data-phmil]").forEach((b) => b.addEventListener("click", () => {
    const m = PHEH_MILIEUX[+b.dataset.phmil];
    state.phehPt = { ph: m.ph, eh: m.eh };
    majCurseur(); majLecture();
  }));

  const svg = $("#pheh-svg");
  function coords(ev) {
    const r = svg.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width * 1000, y = (ev.clientY - r.top) / r.height * 620;
    const ph = PHEH.phMin + (x - PHEH.X0) / (PHEH.X1 - PHEH.X0) * (PHEH.phMax - PHEH.phMin);
    const eh = PHEH.ehMin + (PHEH.Y1 - y) / (PHEH.Y1 - PHEH.Y0) * (PHEH.ehMax - PHEH.ehMin);
    return { ph: Math.min(Math.max(ph, PHEH.phMin), PHEH.phMax), eh: Math.min(Math.max(eh, PHEH.ehMin), PHEH.ehMax) };
  }
  let drag = false;
  svg.addEventListener("pointerdown", (e) => {
    drag = true;
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
    state.phehPt = coords(e); majCurseur(); majLecture();
  });
  svg.addEventListener("pointermove", (e) => { if (drag && e.buttons) { state.phehPt = coords(e); majCurseur(); majLecture(); } });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => svg.addEventListener(t, () => { drag = false; }));

  function majCurseur() {
    const g = $("#pheh-cursor"), { ph, eh } = state.phehPt;
    g.innerHTML = `
      <line x1="${phX(ph)}" y1="${PHEH.Y0}" x2="${phX(ph)}" y2="${PHEH.Y1}" stroke="var(--ink)" stroke-width="1" opacity="0.35"/>
      <line x1="${PHEH.X0}" y1="${ehY(eh)}" x2="${PHEH.X1}" y2="${ehY(eh)}" stroke="var(--ink)" stroke-width="1" opacity="0.35"/>
      <circle cx="${phX(ph)}" cy="${ehY(eh)}" r="9" fill="var(--ink)" stroke="var(--surface)" stroke-width="3"/>`;
  }
  function majLecture() {
    const { ph, eh } = state.phehPt;
    $("#pheh-xy").innerHTML = `pH ${ph.toFixed(1)} · Eh ${eh >= 0 ? "+" : ""}${eh.toFixed(2)} V`;
    const dom = sys.domaines.find((d) => dansPolygone([ph, eh], d.points));
    if (dom) {
      $("#pheh-forme").innerHTML = `${dom.nom.replace(/ dissous$/, "")} <span class="badge" style="background:${dom.type === "dissous" ? "var(--prod-dissous)" : "var(--prod-limon)"}">${dom.type === "dissous" ? "dissous — mobile" : "solide — immobile"}</span>`;
      $("#pheh-desc").textContent = dom.desc;
      $("#pheh-min").innerHTML = dom.mineral
        ? `<button class="min-chip" data-min="${dom.mineral}"><span class="sw" style="background:${MINERAUX[dom.mineral].swatch}"></span>${MINERAUX[dom.mineral].nom.split(" (")[0]} →</button>`
        : "—";
    } else {
      $("#pheh-forme").textContent = "—"; $("#pheh-desc").textContent = ""; $("#pheh-min").textContent = "—";
    }
    // hors du domaine de l'eau ?
    const hautEau = 1.229 - 0.0592 * ph, basEau = -0.0592 * ph;
    if (eh > hautEau) $("#pheh-desc").textContent += " ⚠️ Au-dessus de la limite de stabilité de l'eau : conditions irréalisables dans une eau naturelle.";
    if (eh < basEau) $("#pheh-desc").textContent += " ⚠️ En dessous de la limite de stabilité de l'eau : conditions irréalisables dans une eau naturelle.";
  }
  majLecture();
  document.title = "Visualiseur pH–Eh — Atlas géologique";
}

// ---------------- schéma de structure des argiles ----------------
function structureSVG(a) {
  const X0 = 200, X1 = 830, W = 1000;
  const T = "#d9a441", O = "#b4552e", B = "#7f9f7a", KC = "#7a5fb0", WA = "#5b9bd5";
  // cas spéciaux : fibreuses (rubans à canaux) et para-cristallins (sphérules/tubes)
  if (a.id === "sepiolite") return structureFibreuse();
  if (a.id === "allophane") return structureParacristalline();
  const seq = {
    kaolinite: ["T", "O", "gapH", "T", "O"],
    serpentines: ["T", "O", "gapH", "T", "O"],
    illite: ["T", "O", "T", "gapK", "T", "O", "T"],
    smectites: ["T", "O", "T", "gapW", "T", "O", "T"],
    vermiculite: ["T", "O", "T", "gapV", "T", "O", "T"],
    chlorite: ["T", "O", "T", "B", "T", "O", "T"],
    talc: ["T", "O", "T", "gapN", "T", "O", "T"],
    interstratifies: ["T", "O", "T", "gapK", "T", "O", "T", "gapW", "T", "O", "T"],
    glauconite: ["T", "O", "T", "gapK", "T", "O", "T"],
  }[a.id] || ["T", "O", "T"];
  const hOf = { T: 24, O: 24, B: 22, gapH: 12, gapN: 14, gapK: 22, gapV: 30, gapW: 52 };
  let y = 14, out = "", firstTop = null, secondTop = null, unitCount = 0;

  const label = (txt, yy) => `<text x="${X0 - 14}" y="${yy}" text-anchor="end" class="band-lab">${txt}</text>`;
  for (const el of seq) {
    const h = hOf[el];
    if (el === "T") {
      if (firstTop === null) firstTop = y;
      else if (secondTop === null && unitCount >= 1) secondTop = y;
      for (let x = X0; x + 42 <= X1; x += 50)
        out += `<polygon points="${x},${y + h - 2} ${x + 42},${y + h - 2} ${x + 21},${y + 2}" fill="${T}"/>`;
      out += label("T — tétraèdres Si", y + h - 6);
    } else if (el === "O") {
      for (let x = X0; x + 42 <= X1; x += 50)
        out += `<polygon points="${x + 21},${y + 1} ${x + 42},${y + h / 2} ${x + 21},${y + h - 1} ${x},${y + h / 2}" fill="${O}"/>`;
      out += label("O — octaèdres Al/Mg/Fe", y + h / 2 + 4);
      unitCount++;
    } else if (el === "B") {
      out += `<rect x="${X0}" y="${y + 2}" width="${X1 - X0}" height="${h - 4}" rx="5" fill="${B}"/>
        <text x="${(X0 + X1) / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="12" fill="#fff">feuillet brucitique Mg(OH)₂ — soude les feuillets</text>`;
      out += label("interfoliaire", y + h / 2 + 4);
    } else if (el === "gapH") {
      out += `<text x="${(X0 + X1) / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="11.5" fill="var(--muted)">· · · liaisons hydrogène · · ·</text>`;
    } else if (el === "gapN") {
      out += `<text x="${(X0 + X1) / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="11.5" fill="var(--muted)">· · · forces de van der Waals (feuillets neutres, glissement facile) · · ·</text>`;
    } else if (el === "gapK") {
      for (let x = X0 + 60; x < X1 - 40; x += 130)
        out += `<circle cx="${x}" cy="${y + h / 2}" r="8" fill="${KC}"/>
          <text x="${x}" y="${y + h / 2 + 3.5}" text-anchor="middle" font-size="9.5" fill="#fff">K⁺</text>`;
      out += label("K⁺ fixés (non hydratés)", y + h / 2 + 4);
    } else if (el === "gapV" || el === "gapW") {
      for (let x = X0 + 26; x < X1 - 10; x += 34)
        out += `<circle cx="${x}" cy="${y + (el === "gapW" ? 12 : 8)}" r="3.5" fill="${WA}"/>
                <circle cx="${x + 15}" cy="${y + h - (el === "gapW" ? 12 : 8)}" r="3.5" fill="${WA}"/>`;
      for (let x = X0 + 90; x < X1 - 60; x += 190)
        out += `<circle cx="${x}" cy="${y + h / 2}" r="9" fill="${KC}"/>
          <text x="${x}" y="${y + h / 2 + 3.5}" text-anchor="middle" font-size="8.5" fill="#fff">${el === "gapW" ? "Ca²⁺" : "Mg²⁺"}</text>`;
      out += label(el === "gapW" ? "eau + cations échangeables" : "Mg²⁺ hydratés (2 couches d'eau max)", y + h / 2 + 4);
    }
    y += h;
  }
  const H = y + 30;
  // flèche d'espacement basal d001
  if (firstTop !== null && secondTop !== null) {
    const xa = X1 + 26;
    out += `<line x1="${xa}" y1="${firstTop + 4}" x2="${xa}" y2="${secondTop + 4}" stroke="var(--ink2)" stroke-width="1.5"/>
      <line x1="${xa - 5}" y1="${firstTop + 4}" x2="${xa + 5}" y2="${firstTop + 4}" stroke="var(--ink2)" stroke-width="1.5"/>
      <line x1="${xa - 5}" y1="${secondTop + 4}" x2="${xa + 5}" y2="${secondTop + 4}" stroke="var(--ink2)" stroke-width="1.5"/>
      <text x="${xa + 12}" y="${(firstTop + secondTop) / 2 + 8}" font-size="12" fill="var(--ink2)" transform="rotate(90 ${xa + 12} ${(firstTop + secondTop) / 2 + 8})">d(001)</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Structure en feuillets">${out}</svg>
    <div class="struct-legend">
      <span class="key"><i style="background:${T}"></i>Feuillet tétraédrique (Si-O)</span>
      <span class="key"><i style="background:${O}"></i>Feuillet octaédrique (Al, Mg, Fe)</span>
      <span class="key"><i style="background:${KC};border-radius:50%"></i>Cations interfoliaires</span>
      <span class="key"><i style="background:${WA};border-radius:50%"></i>Eau</span>
    </div>`;
}

// schéma spécial : argiles fibreuses (rubans 2:1 + canaux)
function structureFibreuse() {
  const T = "#d9a441", O = "#b4552e", WA = "#5b9bd5";
  let out = "";
  const ribbon = (x, y) => `
    <rect x="${x}" y="${y}" width="110" height="8" rx="2" fill="${T}"/>
    <rect x="${x}" y="${y + 8}" width="110" height="10" rx="2" fill="${O}"/>
    <rect x="${x}" y="${y + 18}" width="110" height="8" rx="2" fill="${T}"/>`;
  for (let row = 0; row < 3; row++) {
    const y = 20 + row * 44;
    const offset = row % 2 ? 85 : 0;
    for (let x = 200 + offset; x + 110 <= 840; x += 170) {
      out += ribbon(x, y);
      if (x + 170 + 110 <= 900) // canal entre deux rubans
        for (let wx = x + 122; wx < x + 158; wx += 12)
          out += `<circle cx="${wx}" cy="${y + 13}" r="3.2" fill="${WA}"/>`;
    }
  }
  out += `<text x="186" y="40" text-anchor="end" class="band-lab">rubans T-O-T</text>
    <text x="186" y="84" text-anchor="end" class="band-lab">canaux (eau zéolitique)</text>`;
  return `<svg viewBox="0 0 1000 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Structure fibreuse en rubans">${out}</svg>
    <div class="struct-legend">
      <span class="key"><i style="background:#d9a441"></i>Feuillet tétraédrique (Si-O)</span>
      <span class="key"><i style="background:#b4552e"></i>Feuillet octaédrique (Mg)</span>
      <span class="key"><i style="background:#5b9bd5;border-radius:50%"></i>Eau des canaux</span>
    </div>`;
}

// schéma spécial : allophane (sphérules creuses) & imogolite (nanotubes)
function structureParacristalline() {
  const O = "#b4552e", T = "#d9a441", WA = "#5b9bd5";
  let out = "";
  for (let x = 250; x <= 610; x += 120) {
    out += `<circle cx="${x}" cy="58" r="30" fill="none" stroke="${O}" stroke-width="9"/>
      <circle cx="${x}" cy="58" r="30" fill="none" stroke="${T}" stroke-width="3" stroke-dasharray="4 5"/>
      <circle cx="${x}" cy="58" r="10" fill="${WA}" opacity="0.5"/>`;
  }
  out += `<text x="740" y="46" class="band-lab">allophane : sphérules creuses ~4 nm</text>
    <text x="740" y="64" class="band-lab" style="font-size:11px">(paroi alumino-silicatée, eau au centre)</text>`;
  for (let x = 250; x <= 610; x += 95)
    out += `<rect x="${x}" y="120" width="70" height="20" rx="10" fill="none" stroke="${O}" stroke-width="7"/>`;
  out += `<text x="740" y="135" class="band-lab">imogolite : nanotubes ~2 nm</text>`;
  return `<svg viewBox="0 0 1000 165" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sphérules et nanotubes para-cristallins">${out}</svg>
    <div class="struct-legend">
      <span class="key"><i style="background:#b4552e"></i>Paroi Al (octaèdres)</span>
      <span class="key"><i style="background:#d9a441"></i>Silice</span>
      <span class="key"><i style="background:#5b9bd5;border-radius:50%"></i>Eau</span>
    </div>`;
}

// ---------------- réglettes de propriétés (argiles) ----------------
function propStrip(argile, key, minKey, maxKey, axisMax, unite, titre) {
  const W = 1000, H = 92, x0 = 14, x1 = 986, cy = 56;
  const x = (v) => x0 + v / axisMax * (x1 - x0);
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${titre}">`;
  const step = axisMax / 5;
  for (let i = 0; i <= 5; i++) {
    const xv = x(i * step);
    svg += `<line x1="${xv}" y1="22" x2="${xv}" y2="${H - 22}" class="hairline"/>
      <text x="${xv}" y="${H - 6}" text-anchor="middle" class="tick-lab">${fmt(Math.round(i * step))}</text>`;
  }
  for (const o of ARGILES) {
    if (o.id === argile.id) continue;
    svg += `<circle cx="${x((o[minKey] + o[maxKey]) / 2)}" cy="${cy}" r="4" fill="var(--baseline)"
      data-tip="<b>${o.nom}</b>${fmt(o[minKey])}–${fmt(o[maxKey])} ${unite}"/>`;
  }
  const xa = x(argile[minKey]), xb = x(argile[maxKey]);
  svg += `<rect x="${xa}" y="${cy - 7}" width="${Math.max(xb - xa, 6)}" height="14" rx="7"
      fill="var(--prod-argile)" stroke="var(--surface)" stroke-width="2"
      data-tip="<b>${argile.nom}</b>${fmt(argile[minKey])}–${fmt(argile[maxKey])} ${unite}"/>`;
  svg += "</svg>";
  return `<div class="prop-strip"><div class="lab"><b>${titre}</b> — ${unite} (points gris : les autres argiles)</div>
    <div class="chart-wrap">${svg}</div></div>`;
}

// ---------------- fiche argile ----------------
function renderArgile(a) {
  const sources = a.rochesSources.map((id) => {
    const r = ROCHES.find((x) => x.id === id);
    return r ? `<button class="min-chip" data-go="${r.id}"><span class="sw" style="background:${r.swatch}"></span>${r.nom.split(" (")[0]}</button>` : "";
  }).join("");

  $("#main").innerHTML = `
  <div class="card rock-head">
    <h1><span class="sw-big" style="background:${a.swatch}"></span>${a.nom}
      <span class="badge" style="background:var(--prod-argile)">Minéral argileux</span>
      <span class="badge outline">${a.type}</span></h1>
    <div class="ox-img arg-photo" id="argpimg-${a.id}"><span class="sw-ph" style="background:${a.swatch}"></span></div>
    ${a.groupe ? `<p class="sub crumb">Silicates <span>→</span> Phyllosilicates <span>→</span> ${a.famille} <span>→</span> <b>${a.groupe}</b>${a.espece ? ` <span>→</span> <b>espèce ${a.nom.split(" (")[0]}</b>` : ""}
      · <a href="#argiles">voir toute la classification</a></p>` : ""}
    <p class="desc">${a.description}</p>
    ${a.especes ? `<p class="sub" style="margin-bottom:4px"><b>${a.espece ? "Autres espèces du même groupe" : "Espèces du groupe"}</b> (cliquer pour la carte d'identité) :</p>
      <div class="min-chips">${a.especes.map((eid) => especeChip(eid, a.swatch)).join("")}</div>` : ""}
    <p class="sub"><b>Formule :</b> <span style="font-family:ui-monospace,Menlo,monospace">${a.formule}</span></p>
    <div class="meta-row">
      <div class="meta"><div class="lab">CEC (capacité d'échange)</div><div class="val">${fmt(a.cecMin)}–${fmt(a.cecMax)} cmol⁺/kg</div></div>
      <div class="meta"><div class="lab">Surface spécifique</div><div class="val">${fmt(a.surfMin)}–${fmt(a.surfMax)} m²/g</div></div>
      <div class="meta"><div class="lab">Rétention d'eau</div><div class="val">${fmt(a.eauMin)}–${fmt(a.eauMax)} g/100 g</div></div>
      <div class="meta"><div class="lab">Gonflement</div><div class="val" style="font-size:13.5px">${a.gonflement}</div></div>
      <div class="meta"><div class="lab">Espacement basal</div><div class="val" style="font-size:13.5px">${a.espacement}</div></div>
      <div class="meta"><div class="lab">Charge foliaire</div><div class="val">${a.chargeFoliaire}</div></div>
      <div class="meta"><div class="lab">En savoir plus</div><a class="wiki-btn" target="_blank" rel="noopener" href="${a.wikipedia}">Wikipédia ↗</a></div>
    </div>
    ${a.octa ? `<div class="crit-row" style="margin-top:14px">
      <span class="crit"><i>Feuillet O</i>${a.octa}</span>
      ${a.teSi ? `<span class="crit"><i>Substitution tétraédrique</i>${a.teSi}</span>` : ""}
      ${a.oc ? `<span class="crit"><i>Substitution octaédrique</i>${a.oc}</span>` : ""}
      <span class="crit"><i>Espacement basal</i>${a.espacement}</span>
    </div>` : ""}
  </div>

  <div class="card">
    <h2>Sa structure en feuillets</h2>
    <p class="sub">Type <b>${a.type}</b> : l'empilement des feuillets et ce qui les sépare (<b>${a.interfoliaire}</b>) décident de tout —
    gonflement, CEC, rétention d'eau. d(001) = espacement basal : ${a.espacement}.</p>
    <div id="struct-chart">${structureSVG(a)}</div>
  </div>

  ${window.EspacementBasal ? EspacementBasal.carte(a) : ""}

  <div class="card">
    <h2>Ses propriétés, comparées aux autres argiles</h2>
    <p class="sub">La <b>CEC</b> (capacité d'échange cationique, en centimoles de charges + par kg) mesure l'aptitude à retenir
    et échanger les nutriments (Ca²⁺, K⁺, Mg²⁺, NH₄⁺…) — c'est le « garde-manger » chimique du sol. La <b>surface spécifique</b>
    (surface développée par gramme, feuillets internes compris) commande la rétention d'eau.</p>
    <div id="prop-charts">
      ${propStrip(a, "cec", "cecMin", "cecMax", 170, "cmol⁺/kg", "Capacité d'échange cationique (CEC)")}
      ${propStrip(a, "surf", "surfMin", "surfMax", 1100, "m²/g", "Surface spécifique")}
      ${propStrip(a, "eau", "eauMin", "eauMax", 550, "g d'eau / 100 g d'argile", "Rétention d'eau (ordre de grandeur)")}
    </div>
  </div>

  ${window.CecSchema ? CecSchema.carte({ fiche: a }) : ""}

  <div class="card">
    <h2>D'où vient-elle ?</h2>
    <p class="sub"><span class="badge" style="background:var(--accent)">${a.origine}</span></p>
    <p>${a.origineDetail}</p>
    <p><b>Contexte de formation :</b> ${a.contexte}</p>
    <p class="sub" style="margin-bottom:0"><b>Roches qui en produisent</b> (cliquer pour la fiche roche) :</p>
    <div class="rock-chips">${sources}</div>
  </div>

  <div class="card">
    <h2>Dans les sols</h2>
    <p>${a.pedologie}</p>
    <div class="note"><b>Rappel des trois voies d'apparition d'une argile dans un sol :</b>
    <b>héritage</b> (elle était déjà dans la roche, l'altération la libère telle quelle),
    <b>transformation</b> (un minéral en feuillets existant se modifie : mica → vermiculite → smectite),
    <b>néoformation</b> (elle cristallise à partir des ions de la solution du sol : kaolinite, smectites, glauconite).</div>
  </div>

  <div class="card">
    <h2>Pour aller plus loin</h2>
    <p class="sub"><b>Usages :</b> ${a.usages}</p>
    <div class="wiki-box" id="wiki"><p class="ext">Chargement de l'extrait Wikipédia…</p></div>
  </div>
  ${window.CecSchema ? `<section class="min-sources card"><h4>Sources</h4><ul>${CecSchema.sourcesLi()}</ul></section>` : ""}`;

  ["struct-chart", "prop-charts"].forEach((id) => bindTips($("#" + id)));
  if (window.CecSchema) CecSchema.monter($("#main"));
  if (window.Structure3D) Structure3D.brancher($("#main"));
  loadWiki(a);
  loadWikiThumbs([{
    id: a.id, nom: a.nom,
    wiki: decodeURIComponent((a.wikipedia || "").split("/wiki/").pop() || a.nom),
    wikiAlts: (a.especes || []).map((eid) => (ESPECES[eid] || {}).nom || "").filter(Boolean).map((n) => n.split(" (")[0]),
  }], "argpimg-", "argiles");
  document.title = a.nom + " — Atlas géologique";
}

// ---------------- démarrage ----------------
ROCHES.forEach((r) => { if (ROCHE_EXTRAS[r.id]) Object.assign(r, ROCHE_EXTRAS[r.id]); });
// bilan « 1 kg altéré » calculé à partir de la composition (alteration-bilan.js, D.6)
if (window.BilanAlteration) { BilanAlteration.appliquer(ROCHES); BilanAlteration.appliquerSols(ROCHES); }

// clics délégués : fiches liées (panneau latéral), fiches argiles, fiches roches
document.addEventListener("click", (e) => {
  if (e.target.closest(".pan-fermer")) { fermerPanneau(); return; }
  if (e.target.closest(".pan-retour")) { retourPanneau(); return; }
  const dansPanneau = !!e.target.closest("#panneau");
  const dansMenu = !!e.target.closest("#sidebar");
  // lien de navigation cliqué dans le panneau : la page change derrière ; en affichage étroit,
  // le panneau la recouvrirait, donc on le ferme
  const quitter = () => { if (dansPanneau && matchMedia(PANNEAU_ETROIT).matches) fermerPanneau(); };
  // dans les parties Minéraux et Argiles (et depuis le menu), un lien de fiche ouvre sa page ;
  // ailleurs (roches, oxydes…), il ouvre le panneau à côté de la page en cours
  const pageDirecte = !dansPanneau && (dansMenu || currentSection() === "mineraux" || currentSection() === "argiles");
  const min = e.target.closest("[data-min]");
  if (min) {
    if (pageDirecte) location.hash = "mineral/" + min.dataset.min;
    else ouvrirPanneau("min", min.dataset.min, dansPanneau);
    return;
  }
  const esp = e.target.closest("[data-espece]");
  if (esp) {
    const eid = esp.dataset.espece;
    if (!pageDirecte) { ouvrirPanneau("espece", eid, dansPanneau); return; }
    if (location.hash !== "#espece/" + eid) location.hash = "espece/" + eid;
    return;
  }
  const ga = e.target.closest("[data-goargile]");
  if (ga) {
    if (pageDirecte) location.hash = "argile/" + ga.dataset.goargile;
    else ouvrirPanneau("argile", ga.dataset.goargile, dansPanneau);
    return;
  }
  const gp = e.target.closest("[data-gopage]");
  if (gp) { if (dansPanneau) fermerPanneau(); location.hash = gp.dataset.gopage; return; }
  const gg = e.target.closest("[data-arggrp]");
  if (gg) { quitter(); location.hash = "argrp/" + gg.dataset.arggrp; return; }
  const gc = e.target.closest("[data-mincls]");
  if (gc) { quitter(); location.hash = "mincls/" + gc.dataset.mincls; return; }
  const grf = e.target.closest("[data-rocfam]");
  if (grf) { quitter(); location.hash = "rocfam/" + grf.dataset.rocfam; return; }
  const grb = e.target.closest("[data-rocbr]");
  if (grb) { quitter(); location.hash = "rocbr/" + grb.dataset.rocbr; return; }
  const gmg = e.target.closest("[data-mingrp]");
  if (gmg) { quitter(); location.hash = "mingrp/" + gmg.dataset.mingrp; return; }
  const gml = e.target.closest("[data-gominloc]");
  if (gml) {
    const [n, gi, ...idParts] = gml.dataset.gominloc.split("-");
    window.__flashMin = idParts.join("-");
    if (dansPanneau) fermerPanneau();
    const cible = "#mingrp/" + n + "-" + gi;
    if (location.hash === cible) route(); else location.hash = cible;
    return;
  }
  const gpe = e.target.closest("[data-gopheh]");
  if (gpe) {
    quitter(); state.phehEl = gpe.dataset.gopheh;
    if (location.hash === "#pheh") route(); else location.hash = "pheh";
    return;
  }
  const gr = e.target.closest(".min-chip[data-go]");
  if (gr) { quitter(); go(gr.dataset.go); return; }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermerPanneau(); });

$("#search").addEventListener("input", (e) => { state.query = e.target.value; renderSidebar(); });
// navigation principale : chaque partie ouvre sa page d'accueil
const SECTION_HASH = { accueil: "", roches: "roches", mineraux: "mineraux", argiles: "argiles", oxydes: "oxydes", amorphes: "amorphes" };
document.querySelectorAll("#mainnav .chip").forEach((c) => c.addEventListener("click", () => {
  location.hash = SECTION_HASH[c.dataset.section] || "";
}));
$(".brand").addEventListener("click", () => { location.hash = ""; });
route();
