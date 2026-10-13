// ============ Vue d'ensemble des argiles (#argiles), refaite le 08/10/2026 à la demande de l'utilisateur ============
// « On est perdu entre la vue d'ensemble et le groupe de chaque argile » : les pages de groupe (#argrp) sont supprimées.
// Une seule page : un panneau par groupe (une colonne du tableau de Wikipédia, CLASSIF), qui réunit
//   · le nom du groupe et deux lignes sur ce qui le fait (RESUME) ;
//   · la comparaison des espèces en 3D (argiles-comparer.js), texte sous les figures replié dans des puces ;
//   · trois caractéristiques du groupe avec un indicateur compact sur une échelle commune à tous les groupes :
//     CEC et rétention d'eau (fiche ARGILES du groupe), masse volumique (fourchette des espèces, VAL_ESP) ;
//   · une puce « En savoir plus » (note du groupe, lien vers la fiche complète).
// #argrp/<f>-<g> et #argfam/<f> ouvrent cette page à la hauteur du groupe ou de la famille (app.js, route).
(function () {
  "use strict";
  const fr = (x, n = 2) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: n });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // deux lignes au plus : ce qui fait le groupe
  const RESUME = {
    "0-0": "Feuillet 1:1 d'aluminium sans aucune substitution, donc neutre : rien ne s'insère entre les feuillets. Trois espèces de même formule, qui ne diffèrent que par l'empilement.",
    "0-1": "Même feuillet que le kaolin, mais une couche d'eau peut s'insérer entre les feuillets (10 Å ; 7 Å une fois séchée, pour toujours) et les feuillets s'enroulent en tubes.",
    "0-2": "L'équivalent magnésien du kaolin. Le feuillet de magnésium est plus large que celui de silicium : selon l'espèce, il reste plat, ondule ou s'enroule en fibres.",
    "0-3": "Serpentines où l'aluminium ou le fer³⁺ remplace une partie du silicium, ce qui rattrape l'écart de taille entre les deux feuillets. Minerais de fer oolithiques, latérites à nickel.",
    "1-0": "Feuillet 2:1 d'aluminium sans aucune substitution : charge nulle, rien entre les feuillets, aucun gonflement. La pyrophyllite est la référence neutre des 2:1 alumineuses.",
    "1-1": "Smectites dont la charge naît dans le feuillet octaédrique (Mg²⁺ à la place d'Al³⁺) : faible et loin de la surface, elle laisse entrer l'eau et l'argile gonfle. La montmorillonite.",
    "1-2": "Smectites dont la charge naît dans le feuillet tétraédrique (Al³⁺ à la place de Si⁴⁺), plus près de la surface : les cations sont mieux tenus, le gonflement un peu moins libre.",
    "1-3": "Substitutions dans les deux feuillets : charge forte (0,6 à 0,9), feuillets tenus plus serrés. Deux couches d'eau au plus (14 Å), mais l'une des CEC les plus élevées.",
    "1-4": "Charge forte compensée par des K⁺ sans eau, qui bloquent les feuillets à 10 Å : ni eau ni gonflement. Des illites des sols à la muscovite et au mica calcique (margarite).",
    "2-0": "Feuillet 2:1 de magnésium sans substitution : charge nulle, les feuillets glissent les uns sur les autres. Le talc, dureté 1 de l'échelle de Mohs.",
    "2-1": "Smectites magnésiennes dont la charge naît dans le feuillet octaédrique : du lithium à la place du magnésium (hectorite) ou des sites vides (stevensite). Fort gonflement.",
    "2-2": "Smectites magnésiennes dont la charge naît dans le feuillet tétraédrique (Al³⁺ à la place de Si⁴⁺). La saponite est la smectite des basaltes et des serpentinites altérés.",
    "2-3": "La vermiculite la plus courante, née d'une biotite qui a perdu son potassium. Charge forte, deux couches d'eau au plus entre les feuillets (14 Å).",
    "2-4": "Micas sombres : charge forte bloquée par K⁺ (Ca²⁺ dans la clintonite), feuillet de Mg, Fe ou Li. Biotites (phlogopite ↔ annite) et micas au lithium, parents des vermiculites.",
    "3-0": "Chlorite dont le feuillet 2:1 et le feuillet d'hydroxyde intercalé sont tous deux dioctaédriques (aluminium). Une seule espèce, des altérations hydrothermales acides.",
    "3-1": "Chlorites mixtes : feuillet 2:1 dioctaédrique (Al), feuillet d'hydroxyde trioctaédrique (Mg ou Li). Métamorphisme de très bas degré, pegmatites au lithium.",
    "3-2": "Le cas inverse : feuillet 2:1 trioctaédrique, feuillet d'hydroxyde dioctaédrique. Une seule espèce, connue presque uniquement à Franklin (New Jersey).",
    "3-3": "Les chlorites courantes : les deux feuillets sont trioctaédriques (Mg, Fe…). Le feuillet d'hydroxyde intercalé bloque l'espacement à 14 Å ; elles verdissent schistes et ardoises.",
    "4-0": "Deux types de feuillets alternent dans un même cristal, régulièrement (ABAB) ou au hasard : des étapes de transformation, comme la smectite qui devient illite en s'enfouissant.",
    "5-0": "Feuillets 2:1 découpés en rubans qui s'inversent régulièrement, avec des canaux remplis d'eau entre eux : des fibres, pas des plaquettes. Lacs et sols riches en Mg et en silice.",
    "6-0": "Pas de feuillets empilés : des sphères creuses (allophane) et des tubes (imogolite) de quelques nanomètres, premiers produits de l'altération des verres volcaniques.",
  };
  // étiquette courte d'une famille (sommaire du haut)
  const COURT = ["1:1", "2:1 dioct.", "2:1 trioct.", "2:1:1", "Interstratifiés", "Fibreuses", "Para-cristallins"];

  // ── caractéristiques du groupe, sur une échelle commune ───────────────────
  const ECHELLES = {
    cec: { nom: "CEC", unite: "cmol⁺/kg", min: 0, max: 200, pas: 50, n: 0 },
    eau: { nom: "Rétention d'eau", unite: "g / 100 g", min: 0, max: 500, pas: 100, n: 0 },
    dens: { nom: "Masse volumique", unite: "g/cm³", min: 2, max: 3.8, pas: 0.5, n: 2 },
    d001: { nom: "Espacement des feuillets", unite: "Å", min: 0, max: 32, pas: 5, n: 2 },
  };
  // espacement d(001) des groupes dont il varie avec l'eau (sinon : de la plus petite à la plus grande valeur des espèces)
  // smectites : 9,7 Å sèche à ≈ 19 Å (gonflement cristallin), bien plus dans l'eau (Norrish 1954) ; vermiculites : 9,0 à 14,8 Å
  // (Walker 1956) ; halloysite : 7,2 Å sèche, 10 Å hydratée (Joussein et al. 2005) — mêmes valeurs que la 3D (espacement-basal.js)
  const VARIABLE = { "0-1": [7.2, 10.1], "1-1": [9.7, 19], "1-2": [9.7, 19], "2-1": [9.7, 19], "2-2": [9.7, 19], "1-3": [9.0, 14.8], "2-3": [9.0, 14.8] };
  const SANS_ESPACE = {
    "5-0": "sans objet : des rubans et des canaux, pas d'espace entre feuillets",
    "6-0": "sans objet : pas de feuillets empilés",
  };
  // nombres d'un texte de VAL_ESP (« 2,55–2,57 sèche ; ≈ 2,1 hydratée ») ; ce qui est entre parenthèses est ignoré
  const nombres = (t) => (String(t).replace(/\([^)]*\)/g, "").match(/\d+(?:,\d+)?/g) || []).map((x) => Number(x.replace(",", ".")));
  const valEsp = (eid, champ) => (typeof VAL_ESP !== "undefined" && VAL_ESP[eid] && VAL_ESP[eid][champ]) || null;
  function caracteristiques(g, cle) {
    const fiche = g.fiche ? ARGILES.find((a) => a.id === g.fiche) : null;
    const out = {};
    const parEspece = (champ, filtre, premier) => g.especes.map((eid) => {
      const v = valEsp(eid, champ);
      const xs = v ? nombres(v.v).filter(filtre) : [];
      return xs.length ? { eid, txt: v.v, a: premier ? xs[0] : Math.min(...xs), b: premier ? xs[0] : Math.max(...xs) } : { eid, txt: v ? v.v : null };
    });
    if (fiche) {
      out.cec = { a: fiche.cecMin, b: fiche.cecMax, esp: parEspece("cec", (x) => x >= 0 && x < 400) };
      out.eau = { a: fiche.eauMin, b: fiche.eauMax, esp: g.especes.map((eid) => ({ eid, txt: null })) };
    }
    const dens = parEspece("dens", (x) => x > 1 && x < 6);
    const pd = dens.filter((p) => p.a != null);
    if (pd.length) out.dens = { a: Math.min(...pd.map((p) => p.a)), b: Math.max(...pd.map((p) => p.b)), esp: dens, pts: pd };
    if (SANS_ESPACE[cle]) out.d001 = { vide: SANS_ESPACE[cle] };
    else {
      // point de chaque espèce = première valeur de son texte (la valeur sèche, ou le pic mesuré)
      const dd = parEspece("d001", (x) => x > 5 && x < 40, true), pdd = dd.filter((p) => p.a != null);
      const V = VARIABLE[cle];
      if (V || pdd.length) out.d001 = { a: V ? V[0] : Math.min(...pdd.map((p) => p.a)), b: V ? V[1] : Math.max(...pdd.map((p) => p.a)),
        esp: dd, pts: pdd, variable: !!V };
    }
    return out;
  }
  const BULLES = {};   // « f-g:grandeur » → contenu de la bulle au survol
  function jauge(cle, k, v, coul) {
    const E = ECHELLES[k];
    const pos = (x) => Math.max(0, Math.min(100, (x - E.min) / (E.max - E.min) * 100));
    if (!v || v.vide) return `<div class="argv-j"><span class="argv-j-nom">${E.nom}</span>
      <span class="argv-j-piste argv-j-vide"></span><span class="argv-j-val">${v && v.vide ? `<small>${v.vide}</small>` : "non renseignée"}</span></div>`;
    const val = v.a === v.b ? fr(v.a, E.n) : `${fr(v.a, E.n)} – ${fr(v.b, E.n)}`;
    const graduations = [];
    for (let x = E.min; x <= E.max + 1e-9; x += E.pas) graduations.push(`<i style="left:${pos(x)}%"></i>`);
    const points = (v.pts || []).map((p) => `<b class="argv-j-pt" data-e="${p.eid}" style="left:${pos((p.a + p.b) / 2)}%"></b>`).join("");
    const sous = k === "d001" ? (v.variable ? "ce groupe · varie avec l'eau" : "ce groupe · stable") : "ce groupe";
    // bulle : la valeur du groupe, l'échelle, et ce que l'on sait espèce par espèce
    const lignes = (v.esp || []).map((p) => `<li data-e="${p.eid}"><b>${esc(ESPECES[p.eid].nom.split(" (")[0])}</b> ${p.txt ? esc(p.txt) : "<i>pas de mesure propre</i>"}</li>`).join("");
    BULLES[`${cle}:${k}`] = `<p class="argv-b-t">${E.nom} de ce groupe : <b>${val} ${E.unite}</b></p>
      <p class="argv-b-n">Échelle commune à tous les groupes : ${fr(E.min)} à ${fr(E.max)} ${E.unite}.${k === "cec" || k === "eau"
        ? " Valeur donnée pour l'ensemble des espèces du groupe." : k === "d001" && v.variable ? " Dans l'eau, une smectite peut dépasser 40 Å." : ""}</p>
      ${k === "eau" ? `<p class="argv-b-n">Pas de mesure espèce par espèce : c'est l'ordre de grandeur du groupe.</p>`
        : lignes ? `<p class="argv-b-n">Espèce par espèce${v.pts ? " (un point par espèce mesurée)" : ""} :</p><ul>${lignes}</ul>` : ""}`;
    return `<div class="argv-j" data-bulle="${cle}:${k}">
      <span class="argv-j-nom">${E.nom}</span>
      <span class="argv-j-piste" role="img" aria-label="${E.nom} : ${val} ${E.unite}, sur une échelle de ${fr(E.min)} à ${fr(E.max)}">
        ${graduations.join("")}
        <span class="argv-j-plage" style="left:${pos(v.a)}%;width:${Math.max(1.2, pos(v.b) - pos(v.a))}%;background:${coul}"></span>${points}
      </span>
      <span class="argv-j-val"><b>${val}</b> ${E.unite}<small>${sous}</small></span>
    </div>`;
  }

  // ── panneau d'un groupe ─────────────────────────────────────────────────
  function panneauGroupe(fam, fi, g, gi) {
    const cle = `${fi}-${gi}`;
    const fiche = g.fiche ? ARGILES.find((a) => a.id === g.fiche) : null;
    const coul = fiche ? fiche.swatch : "var(--baseline)";
    const c = caracteristiques(g, cle);
    const intro = window.ArgilesComparer ? ArgilesComparer.introDe(g) : "";
    return `<section class="card argv-grp" id="argrp-${cle}" style="--argv-c:${coul}">
      <header class="argv-tete">
        <span class="sw-big" style="background:${coul}"></span>
        <h3>${g.nom}</h3>
        <span class="badge outline">${g.especes.length} espèce${g.especes.length > 1 ? "s" : ""}</span>
        <button type="button" class="argv-info" aria-expanded="false" aria-controls="argv-info-${cle}">Ce qui fait ce groupe</button>
      </header>
      <div class="argv-info-txt" id="argv-info-${cle}" hidden>
        <p>${RESUME[cle] || g.note}</p>
        ${intro ? `<p><b>D'une espèce à l'autre.</b> ${intro}</p>` : ""}
        ${fiche ? `<button class="min-chip" data-goargile="${fiche.id}">Fiche complète : ${fiche.nom.split(" (")[0]} →</button>` : ""}
      </div>
      ${window.ArgilesComparer ? ArgilesComparer.html(g) : ""}
      <div class="argv-carac">${["d001", "cec", "eau", "dens"].map((k) => jauge(cle, k, c[k], coul)).join("")}</div>
    </section>`;
  }

  function html() {
    const sommaire = CLASSIF.map((fam, fi) => `<button class="min-chip" data-argfam="${fi}">${COURT[fi] || fam.famille.split(" — ")[0]}</button>`).join("");
    const familles = CLASSIF.map((fam, fi) => {
      const nbEsp = fam.groupes.reduce((s, g) => s + g.especes.length, 0);
      return `<section class="argv-fam" id="argfam-${fi}">
        <h2>${fam.famille}
          <span class="badge outline">${fam.groupes.length} groupe${fam.groupes.length > 1 ? "s" : ""} · ${nbEsp} espèces</span></h2>
        <p class="sub argv-fam-desc">${fam.desc}</p>
        ${fam.groupes.map((g, gi) => panneauGroupe(fam, fi, g, gi)).join("")}
      </section>`;
    }).join("");
    return `<div class="argv" data-argv>
    <div class="card hero">
      <h1>Les argiles</h1>
      <p class="sub argv-intro">Ce que <b>deviennent les minéraux quand ils s'altèrent</b> : de minuscules cristaux en feuillets
        (des <b>phyllosilicates</b>, comme les micas), qui font la terre des champs, la poterie et le retrait-gonflement des maisons.</p>
      <div class="min-chips argv-sommaire">${sommaire}</div>
      <details class="cmp-puce"><summary>Comment lire la classification</summary>
        <p class="crumb">Classe des <b>silicates</b> <span>→</span> sous-classe des <b>phyllosilicates</b>
          <span>→</span> familles par type d'empilement <span>→</span> groupes <span>→</span> espèces.</p>
        <p>Chaque groupe est défini par quatre critères structuraux, ceux du tableau de référence de Wikipédia.
        <b>Feuillet O</b> : rempli d'Al³⁺ (2 sites sur 3) = <b>dioctaédrique</b>, ou de Mg²⁺/Fe²⁺ (3 sites sur 3) = <b>trioctaédrique</b>.
        <b>Te/Si</b> mesure les substitutions dans le feuillet <b>tétraédrique</b> (Te/Si = 4 ou 8 → aucune ; &lt; 4 ou &lt; 8 → de l'Al
        remplace du Si). <b>Oc</b> mesure celles du feuillet <b>octaédrique</b> (Oc = 12/12 → aucune). Ces substitutions créent un
        <b>déficit de charge</b> que compensent des cations entre les feuillets : c'est ce qui décide si l'argile <b>gonfle</b>
        (espacement variable) ou reste bloquée (espacement stable).</p>
      </details>
    </div>
    ${familles}
    <div class="card">
      <h2>Pour aller plus loin : les trois façons de naître, et deux sens du mot « argile »</h2>
      <p>Une argile peut apparaître dans un sol de trois manières. Par <b>héritage</b> : elle était déjà dans la roche, l'altération
      la libère telle quelle (l'illite des marnes). Par <b>transformation</b> : un minéral en feuillets existant se modifie pas à
      pas — un mica perd son potassium et devient vermiculite, puis smectite. Par <b>néoformation</b> : elle cristallise à partir
      des ions dissous dans l'eau du sol (la kaolinite des climats tropicaux, ≥ 22 °C).</p>
      <p>Ce qui distingue les familles, c'est l'empilement des deux briques de base — le feuillet <b>T</b> (tétraèdres de silice)
      et le feuillet <b>O</b> (octaèdres d'aluminium, magnésium ou fer) — et surtout la <b>charge électrique</b> du feuillet, qui
      décide de ce qui se loge entre les couches : rien (talc), de l'eau qui fait gonfler (smectites), du potassium qui bloque
      (illites, micas). Un feuillet O rempli d'Al³⁺ (2 sites sur 3) est <b>dioctaédrique</b> ; rempli de Mg²⁺/Fe²⁺ (3 sites sur 3),
      il est <b>trioctaédrique</b> — presque chaque groupe existe dans les deux versions.</p>
      <p>Attention enfin au mot lui-même : « argile » a <b>deux sens</b>. Un sens <b>granulométrique</b> (toute particule de moins
      de 2 µm, quelle que soit sa nature) et un sens <b>minéralogique</b> (les phyllosilicates de cette page, même en gros
      cristaux). Les micas vrais et les serpentines, souvent visibles à l'œil nu, sont rangés ici car ils partagent la même
      structure en feuillets. Source : nomenclature <b>AIPEA / IMA</b> (Guggenheim et al.).</p>
    </div>
    <details class="card cmp-puce argv-sources" data-argv-sources><summary>Sources des modèles 3D</summary>
      <ul><li>Chargement…</li></ul></details>
    </div>`;
  }

  // contrôle : chaque groupe a son résumé (≤ 200 signes) et ses trois jauges calculables ; attendu []
  function controle() {
    const pb = [];
    CLASSIF.forEach((fam, fi) => fam.groupes.forEach((g, gi) => {
      const cle = `${fi}-${gi}`, r = RESUME[cle];
      if (!r) pb.push(cle + " : pas de résumé");
      else if (r.length > 200) pb.push(`${cle} : résumé de ${r.length} signes`);
      const c = caracteristiques(g, cle);
      ["d001", "cec", "eau", "dens"].forEach((k) => { if (!c[k]) pb.push(`${cle} : ${k} non renseignée`); });
    }));
    return pb;
  }

  // ── gestes (un seul écouteur par type, posé une fois) ──────────────────
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".argv-info");
    if (!b) return;
    const ouvert = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(ouvert));
    document.getElementById(b.getAttribute("aria-controls")).hidden = !ouvert;
  });
  document.addEventListener("toggle", (e) => {
    const d = e.target;
    if (!d.matches || !d.matches("[data-argv-sources]") || !d.open || d.dataset.rempli) return;
    d.dataset.rempli = "1";
    ArgilesComparer.sourcesDe(CLASSIF.flatMap((f) => f.groupes)).then((liste) => {
      d.querySelector("ul").innerHTML = liste.map((x) => `<li>${x}</li>`).join("");
    });
  }, true);
  let bulle = null;
  const cacher = () => { if (bulle) bulle.hidden = true; };
  document.addEventListener("pointermove", (e) => {
    const j = e.target.closest && e.target.closest(".argv-j[data-bulle]");
    if (!j || e.pointerType === "touch") { cacher(); return; }
    if (!bulle) { bulle = document.createElement("div"); bulle.className = "argv-bulle"; document.body.appendChild(bulle); }
    if (bulle.dataset.k !== j.dataset.bulle) { bulle.innerHTML = BULLES[j.dataset.bulle] || ""; bulle.dataset.k = j.dataset.bulle; }
    // l'espèce dont le point est sous la souris est surlignée dans la liste
    const pt = e.target.closest(".argv-j-pt");
    bulle.querySelectorAll("li").forEach((li) => li.classList.toggle("on", !!pt && li.dataset.e === pt.dataset.e));
    bulle.hidden = false;
    const r = bulle.getBoundingClientRect();
    let x = e.clientX + 16, y = e.clientY + 16;
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 16;
    if (y + r.height > innerHeight - 8) y = Math.max(8, e.clientY - r.height - 16);
    bulle.style.left = x + "px"; bulle.style.top = y + "px";
  });
  window.addEventListener("scroll", cacher, { passive: true });

  window.ArgilesVue = { html, RESUME, caracteristiques, controle, BULLES };   // BULLES : aussi les jauges de mineraux-vue.js
})();
