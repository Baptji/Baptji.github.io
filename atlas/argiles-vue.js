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
    "0-0": "Sans aucune substitution, ce feuillet 1:1 d'aluminium est neutre : rien ne s'insère entre ses feuillets. Trois espèces partagent la même formule et ne se distinguent que par leur empilement.",
    "0-1": "Le feuillet est celui du kaolin, mais de l'eau peut s'intercaler (10 Å ; 7 Å une fois séchée, de façon irréversible) et les feuillets se roulent en tubes.",
    "0-2": "Il s'agit de l'homologue magnésien du kaolin. La couche de magnésium, plus large que celle de silicium, fait rester le feuillet plan, onduler ou s'enrouler en fibres selon l'espèce.",
    "0-3": "Dans ces serpentines, du fer³⁺ ou de l'aluminium remplace une part du silicium, ce qui compense l'écart de taille entre les deux couches. Ce sont aussi des minerais de fer oolithiques et des latérites à nickel.",
    "1-0": "Sans aucune substitution, ce feuillet 2:1 d'aluminium n'a pas de charge : rien ne se loge entre les feuillets et rien ne gonfle. La pyrophyllite sert de référence neutre parmi les 2:1 alumineux.",
    "1-1": "Dans ces smectites, la charge provient du feuillet octaédrique (Mg²⁺ à la place d'Al³⁺) ; faible et éloignée de la surface, elle laisse pénétrer l'eau, et l'argile gonfle. C'est la montmorillonite.",
    "1-2": "La charge de ces smectites vient du feuillet tétraédrique (Al³⁺ au lieu de Si⁴⁺), située plus près de la surface : les cations y sont mieux retenus et le gonflement reste un peu plus contraint.",
    "1-3": "Les substitutions touchent les deux feuillets : la charge est forte (0,6 à 0,9) et les feuillets sont plus serrés. Deux couches d'eau au plus s'y logent (14 Å), malgré l'une des CEC les plus élevées.",
    "1-4": "Une charge forte, compensée par des K⁺ anhydres, bloque les feuillets à 10 Å : aucune eau ne s'y loge, rien ne gonfle. Cette famille regroupe les illites des sols, la muscovite et le mica calcique (margarite).",
    "2-0": "Ce feuillet 2:1 au magnésium, sans substitution, n'a pas de charge et ses feuillets glissent les uns sur les autres. Il s'agit du talc, de dureté 1 sur l'échelle de Mohs.",
    "2-1": "Dans ces smectites magnésiennes, la charge vient du feuillet octaédrique, avec du lithium au lieu du magnésium (hectorite) ou des sites vacants (stevensite). Le gonflement y est fort.",
    "2-2": "La charge de ces smectites magnésiennes se trouve dans le feuillet tétraédrique (Al³⁺ au lieu de Si⁴⁺). La saponite caractérise les basaltes et les serpentinites altérés.",
    "2-3": "Cette vermiculite, la plus répandue, dérive d'une biotite dont le potassium a disparu. La charge reste élevée ; entre les feuillets, deux couches d'eau tout au plus prennent place (14 Å).",
    "2-4": "Les micas sombres présentent une charge forte, bloquée par K⁺ (Ca²⁺ dans la clintonite), et un feuillet riche en Mg, Fe ou Li. Biotites (de la phlogopite à l'annite) et micas lithiés sont les parents des vermiculites.",
    "3-0": "Dans cette chlorite, le feuillet 2:1 et le feuillet d'hydroxyde intercalé sont dioctaédriques, tous deux à l'aluminium. Une seule espèce appartient à ce type, formée lors d'altérations hydrothermales acides.",
    "3-1": "Chlorites mêlées : le feuillet 2:1 est dioctaédrique (Al) et le feuillet d'hydroxyde trioctaédrique (Mg ou Li). On les rencontre dans le métamorphisme de très bas degré et les pegmatites au lithium.",
    "3-2": "C'est le cas inverse : un feuillet 2:1 trioctaédrique et un feuillet d'hydroxyde dioctaédrique. Une seule espèce répond à cette définition, connue presque exclusivement à Franklin (New Jersey).",
    "3-3": "Les chlorites les plus communes ont deux feuillets trioctaédriques (Mg, Fe…). Le feuillet d'hydroxyde intercalé fixe l'espacement à 14 Å ; elles colorent en vert les schistes et les ardoises.",
    "4-0": "Des interstratifiés voient alterner deux types de feuillets dans un même cristal, régulièrement (ABAB) ou au hasard ; ils marquent une transformation en cours, comme la smectite qui devient illite en s'enfouissant.",
    "5-0": "Des rubans de feuillets 2:1, qui basculent régulièrement, délimitent des canaux remplis d'eau : ce sont des fibres et non des plaquettes. On les trouve dans les lacs et les sols riches en Mg et en silice.",
    "6-0": "Aucun empilement de feuillets ici : sphères creuses (allophane) et tubes (imogolite), de quelques nanomètres, constituent les premiers produits de l'altération des verres volcaniques.",
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
    "5-0": "sans objet : rubans et canaux, sans espace entre feuillets",
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
    const val = v.a === v.b ? fr(v.a, E.n) : `${fr(v.a, E.n)} à ${fr(v.b, E.n)}`;
    const graduations = [];
    for (let x = E.min; x <= E.max + 1e-9; x += E.pas) graduations.push(`<i style="left:${pos(x)}%"></i>`);
    const points = (v.pts || []).map((p) => `<b class="argv-j-pt" data-e="${p.eid}" style="left:${pos((p.a + p.b) / 2)}%"></b>`).join("");
    const sous = k === "d001" ? (v.variable ? "ce groupe · varie avec l'eau" : "ce groupe · stable") : "ce groupe";
    // bulle : la valeur du groupe, l'échelle, et ce que l'on sait espèce par espèce
    const lignes = (v.esp || []).map((p) => `<li data-e="${p.eid}"><b>${esc(ESPECES[p.eid].nom.split(" (")[0])}</b> ${p.txt ? esc(p.txt) : "<i>pas de mesure propre</i>"}</li>`).join("");
    BULLES[`${cle}:${k}`] = `<p class="argv-b-t">${E.nom} de ce groupe : <b>${val} ${E.unite}</b></p>
      <p class="argv-b-n">Même échelle pour tous les groupes : de ${fr(E.min)} à ${fr(E.max)} ${E.unite}.${k === "cec" || k === "eau"
        ? " Ce chiffre vaut pour tout le groupe." : k === "d001" && v.variable ? " Plongée dans l'eau, une smectite peut atteindre plus de 40 Å." : ""}</p>
      ${k === "eau" ? `<p class="argv-b-n">Aucune mesure n'est donnée espèce par espèce : seul l'ordre de grandeur du groupe est indiqué.</p>`
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
      ${window.ArgilesDevenir ? ArgilesDevenir.html(cle) : ""}
    </section>`;
  }

  function html() {
    const sommaire = CLASSIF.map((fam, fi) => `<button class="min-chip" data-argfam="${fi}">${COURT[fi] || fam.famille.split(/ [—:] /)[0]}</button>`).join("");
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
      <p class="sub argv-intro">Voici ce que deviennent les minéraux lorsqu'ils s'altèrent : de minuscules cristaux en feuillets
        (<b>phyllosilicates</b>, dont font partie les micas), qui forment la terre arable, la céramique et le retrait-gonflement des sols bâtis.</p>
      <div class="min-chips argv-sommaire">${sommaire}</div>
      <details class="cmp-puce"><summary>Comment lire la classification</summary>
        <p class="crumb">Classe des <b>silicates</b> <span>→</span> sous-classe des <b>phyllosilicates</b>
          <span>→</span> familles d'après l'agencement des feuillets <span>→</span> groupes <span>→</span> espèces.</p>
        <p>Chaque groupe est fixé par quatre critères structuraux, repris du tableau de référence de Wikipédia.
        <b>Feuillet O</b> : occupé par Al³⁺ (2 sites sur 3) = <b>dioctaédrique</b>, ou par Mg²⁺/Fe²⁺ (3 sites sur 3) = <b>trioctaédrique</b>.
        <b>Te/Si</b> recense les substitutions du feuillet <b>tétraédrique</b> (Te/Si = 4 ou 8 → aucune ; &lt; 4 ou &lt; 8 → de l'Al
        prend la place du Si). <b>Oc</b> recense celles du feuillet <b>octaédrique</b> (Oc = 12/12 → aucune). Ces substitutions génèrent un
        <b>déficit de charge</b>, comblé par des cations placés entre les feuillets : il détermine si l'argile <b>gonfle</b>
        (espacement variable) ou reste bloquée (espacement stable).</p>
      </details>
    </div>
    ${familles}
    <div class="card">
      <h2>Pour aller plus loin : les trois façons de naître, et deux sens du mot « argile »</h2>
      <p>Une argile se forme dans un sol selon trois voies. Par <b>héritage</b>, elle préexistait dans la roche et l'altération
      la met en liberté sans modification (l'illite des marnes). Par <b>transformation</b>, un minéral à feuillets se modifie
      progressivement : un mica perd son potassium, devient vermiculite puis smectite. Par <b>néoformation</b>, elle cristallise
      à partir des ions dissous dans l'eau du sol (la kaolinite des climats tropicaux, ≥ 22 °C).</p>
      <p>Les familles se distinguent par l'agencement de leurs deux briques élémentaires, le feuillet <b>T</b> (tétraèdres de silice)
      et le feuillet <b>O</b> (octaèdres d'aluminium, de magnésium ou de fer), et surtout par la <b>charge électrique</b> du feuillet,
      qui conditionne ce qui s'intercale entre les couches : rien (talc), de l'eau provoquant un gonflement (smectites), du potassium
      assurant un blocage (illites, micas). Un feuillet O occupé par Al³⁺ (2 sites sur 3) est <b>dioctaédrique</b> ; occupé par Mg²⁺/Fe²⁺
      (3 sites sur 3), il est <b>trioctaédrique</b> : presque chaque groupe existe sous les deux versions.</p>
      <p>Le mot lui-même recouvre <b>deux sens</b>. Au sens <b>granulométrique</b>, l'argile désigne toute particule de moins de 2 µm,
      quelle que soit sa nature ; au sens <b>minéralogique</b>, ce sont les phyllosilicates de cette page, même en gros cristaux.
      Les micas vrais et les serpentines, souvent visibles à l'œil nu, figurent ici car ils partagent cette structure en feuillets.
      Source : nomenclature <b>AIPEA / IMA</b> (Guggenheim et al.).</p>
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
