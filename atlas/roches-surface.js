/* roches-surface.js — vue « Les roches par surface en France » (12/10/2026, à valider).
   Données : roches-surfaces.js (GÉNÉRÉ par tools/surfaces_geol50.py puis tools/surfaces_roches.py, BD Charm-50).
   Page #rocsurf (et #rocsurf/<tranche>), menu des Roches rangé par tranches de surface, choix de la vue gardé
   dans localStorage (« atlas-roc-vue » : "arbre" = classification du BRGM, "surface" = ce classement).
   Chargé après roches-arbre.js et roches-surfaces.js, avant app.js. */
(function () {
  const S = window.ROCHES_SURFACES;
  const VUES = [["arbre", "Par origine (BRGM)"], ["surface", "Par surface en France"]];
  // tranches de surface : grands groupes du menu (et de la barre repliée)
  const TRANCHES = [
    { k: "t5", nom: "Plus de 5 %", min: 5 },
    { k: "t1", nom: "1 à 5 %", min: 1 },
    { k: "t01", nom: "0,1 à 1 %", min: 0.1 },
    { k: "t001", nom: "0,01 à 0,1 %", min: 0.01 },
    { k: "t0", nom: "Moins de 0,01 %", min: 1e-9 },
    { k: "abs", nom: "Absentes de la carte", min: -1 },
  ];
  const nf = (x, d, min = 0) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d, minimumFractionDigits: min }).format(x);

  function vue() {
    try { const v = localStorage.getItem("atlas-roc-vue"); if (VUES.some(([k]) => k === v)) return v; } catch (e) { /* stockage indisponible */ }
    return "arbre";
  }
  function choisir(v) {
    try { localStorage.setItem("atlas-roc-vue", v); } catch (e) { /* stockage indisponible */ }
  }

  // roches de France (météorites à part), de la plus étendue à la plus rare
  function rang() {
    if (!S) return [];
    return ROCHES.filter((r) => r.categorie !== "meteoritique" && S.roches[r.id])
      .map((r) => ({ r, s: S.roches[r.id] }))
      .sort((a, b) => b.s.km2 - a.s.km2 || a.r.nom.localeCompare(b.r.nom, "fr"));
  }
  // moins de 0,5 km² : on la dit absente de la carte (traces de quelques polygones)
  const tranche = (s) => s.km2 < 0.5 ? TRANCHES[5] : TRANCHES.find((t) => s.pct >= t.min);
  function pctTxt(p) {
    if (p >= 1) return nf(p, 1, 1) + " %";
    if (p >= 0.1) return nf(p, 2, 2) + " %";
    if (p >= 0.01) return nf(p, 3, 3) + " %";
    return "< 0,01 %";
  }
  const kmTxt = (k) => k >= 100 ? nf(Math.round(k / 100) * 100, 0) + " km²" : nf(k, k >= 10 ? 0 : 1) + " km²";

  // boutons du haut des pages d'ensemble des Roches et du menu
  function boutons(dansMenu) {
    const v = vue();
    if (dansMenu) return `<div class="side-group"><h3>Classement</h3>` + VUES.map(([k, nom]) =>
      `<button class="rock-item ${v === k ? "on" : ""}" data-rocvue="${k}"><b>${nom}</b></button>`).join("") + `</div>`;
    return `<div class="rs-vues" role="group" aria-label="Classement des roches">` + VUES.map(([k, nom]) =>
      `<button class="chip ${v === k ? "on" : ""}" data-rocvue="${k}">${nom}</button>`).join("") + `</div>`;
  }

  // menu de gauche en vue « surface » : une tranche puis ses roches, la part de chacune à droite
  function menu(courant) {
    const liste = rang();
    let h = boutons(true) + `<div class="side-group rs-menu">`;
    TRANCHES.forEach((t) => {
      const ici = liste.filter((x) => tranche(x.s) === t);
      if (!ici.length) return;
      const on = location.hash === "#rocsurf/" + t.k ? "on" : ici.some((x) => x.r.id === courant) ? "chemin" : "";
      h += `<button class="rock-item rs-tranche ${on}" data-roctranche="${t.k}"><b>${t.nom}</b><span class="fac">${ici.length}</span></button>`;
      ici.forEach((x) => {
        h += `<button class="arbre-roche rs-roche ${x.r.id === courant ? "on" : ""}" data-id="${x.r.id}">
          <span class="sw" style="background:${x.r.swatch}"></span><span>${x.r.nom}</span>
          <span class="rs-pct">${t.k === "abs" ? "" : pctTxt(x.s.pct)}</span></button>`;
      });
    });
    return h + `</div>`;
  }

  function page() {
    const main = document.getElementById("main");
    if (!S) { main.innerHTML = `<div class="card"><p>Données de surface absentes (roches-surfaces.js).</p></div>`; return; }
    const liste = rang();
    const T = S.total_km2, max = liste[0].s.pct;
    const top10 = liste.slice(0, 10).reduce((a, x) => a + x.s.pct, 0);

    // part de chaque famille
    const fams = ["sedimentaire", "magmatique", "metamorphique"].map((c) => ({
      c, nom: CATEGORIES[c].nom + "s", pct: liste.filter((x) => x.r.categorie === c).reduce((a, x) => a + x.s.pct, 0),
    }));
    const pctReste = 100 - fams.reduce((a, f) => a + f.pct, 0);
    const barre = fams.map((f) => `<span class="rs-seg" style="width:${f.pct}%;background:${catColor(f.c)}"></span>`).join("")
      + `<span class="rs-seg rs-seg-reste" style="width:${pctReste}%"></span>`;
    const legende = fams.map((f) => `<span class="key"><i style="background:${catColor(f.c)}"></i>${f.nom} · <b>${nf(f.pct, 1)} %</b></span>`).join("")
      + `<span class="key"><i class="rs-reste-i"></i>Rattaché à aucune fiche · <b>${nf(pctReste, 1)} %</b></span>`;

    // classement, tranche par tranche
    let n = 0, lignes = "";
    TRANCHES.forEach((t) => {
      const ici = liste.filter((x) => tranche(x.s) === t);
      if (!ici.length) return;
      const somme = ici.reduce((a, x) => a + x.s.pct, 0);
      lignes += `<h3 class="rs-tr" id="rocsurf-${t.k}">${t.nom}<span>${ici.length} roche${ici.length > 1 ? "s" : ""}${t.k === "abs" ? "" : ` · ${pctTxt(somme)} du territoire à elles toutes`}</span></h3>`;
      if (t.k === "abs") {
        lignes += `<p class="sub">Moins de 0,5 km² sur toute la carte au 1/50 000 : la roche n'affleure pas en France (on la suit à l'étranger), n'est connue
          que par sondages et mines (sel gemme, anhydrite, sels potassiques), ou ne porte pas son propre nom sur la carte (elle est comptée avec la formation qui la contient).</p>
          <div class="rs-abs">` + ici.map((x) => {
            const etr = x.r.regions && x.r.regions.length && x.r.regions.every((g) => g.etranger);
            return `<a href="#roche/${x.r.id}" class="rs-abs-i"><span class="sw" style="background:${x.r.swatch}"></span>${x.r.nom}${etr ? `<small>absente de France</small>` : ""}</a>`;
          }).join("") + `</div>`;
        return;
      }
      ici.forEach((x) => {
        n++;
        const l = Math.max(0.15, 100 * x.s.pct / max);
        const forms = x.s.formations.map(([f, k]) => `<li>${f.length > 150 ? f.slice(0, 148) + "…" : f} <span>${kmTxt(k)}</span></li>`).join("");
        const plus = x.s.dominante_km2 > x.s.km2 * 1.05
          ? `<p>La carte de sa fiche la surligne sur ${kmTxt(x.s.dominante_km2)} : ${kmTxt(x.s.dominante_km2 - x.s.km2)} de plus, dans des formations rangées ici sous une autre roche nommée avant elle (« calcaires et marnes » compte pour le calcaire).</p>` : "";
        lignes += `<details class="rs-ligne" style="--c:${catColor(x.r.categorie)}">
          <summary><span class="rs-n">${n}</span><span class="sw" style="background:${x.r.swatch}"></span>
            <span class="rs-nom">${x.r.nom}</span>
            <span class="rs-barre"><i style="width:${l}%"></i></span>
            <span class="rs-val"><b>${pctTxt(x.s.pct)}</b><small>${kmTxt(x.s.km2)}</small></span></summary>
          <div class="rs-detail">
            <p><b>Plus grandes formations de la carte rangées sous cette roche :</b></p><ul>${forms}</ul>${plus}
            <a href="#roche/${x.r.id}" class="rs-fiche">Voir sa fiche →</a>
          </div></details>`;
      });
    });

    const reste = S.reste.map(([, nom, k]) => `<tr><td>${nom}</td><td class="num">${kmTxt(k)}</td><td class="num">${nf(100 * k / T, 1)} %</td></tr>`).join("");
    const exemples = S.non_rattachees.slice(0, 6).map(([f, k]) => `<li>${f.length > 140 ? f.slice(0, 138) + "…" : f} <span>${kmTxt(k)}</span></li>`).join("");

    main.innerHTML = `
    <div class="card hero">
      <h1>Les roches de France par surface</h1>
      <p class="sub" style="font-size:15px;max-width:78ch">Le <b>calcaire</b> affleure sur ${pctTxt(S.roches.calcaire.pct)} du territoire,
      à peu près autant que les <b>alluvions</b> des vallées. Les dix roches les plus étendues couvrent à elles seules ${nf(top10, 0)} % de la France ;
      plus de la moitié des fiches pèsent chacune moins d'un dixième de pour cent.</p>
      ${boutons(false)}
    </div>

    <div class="card">
      <h2>Part du territoire par famille</h2>
      <p class="sub">Surface de la carte géologique au 1/50 000 (${nf(T, 0)} km², France métropolitaine et Corse) rangée sous les fiches de l'atlas.</p>
      <div class="rs-familles" role="img" aria-label="Sédimentaires ${nf(fams[0].pct, 1)} %, magmatiques ${nf(fams[1].pct, 1)} %, métamorphiques ${nf(fams[2].pct, 1)} %">${barre}</div>
      <div class="legend">${legende}</div>
    </div>

    <div class="card">
      <h2>De la plus étendue à la plus rare</h2>
      <p class="sub">Une ligne par fiche, barre à la même échelle pour toutes (la plus longue = le calcaire). Un clic sur une ligne montre les formations
      de la carte qui la composent ; le nom de la fiche s'ouvre par « Voir sa fiche ».</p>
      <div class="rs-liste">${lignes}</div>
    </div>

    <div class="card">
      <h2>Ce qui n'est rattaché à aucune fiche : ${nf(pctReste, 1)} %</h2>
      <p class="sub">Les formations dont la description ne commence par aucune roche de l'atlas.</p>
      <div class="chart-wrap"><table class="data rs-reste"><thead><tr><th>Quoi</th><th class="num">Surface</th><th class="num">Part</th></tr></thead><tbody>${reste}</tbody></table></div>
      <details class="rs-plus"><summary>Les plus grandes formations non rattachées</summary><ul class="rs-ex">${exemples}</ul></details>
    </div>

    <div class="card">
      <details class="rs-plus"><summary><h2>Comment ce classement est calculé</h2></summary>
      <p>La carte géologique harmonisée du BRGM au 1/50 000 (BD Charm-50) découpe la France en un peu plus d'un million de polygones, chacun avec la
      description de sa formation (« Calcaires micritiques en bancs », « Limons des plateaux »…). L'atlas mesure la surface de chaque polygone
      puis range chaque formation sous <b>une seule</b> fiche, avec la règle qui colore déjà la carte des fiches : un mot de la roche
      (« granite » attrape granites et granitique, pas microgranite) cherché <b>au début</b> de la description, là où le BRGM nomme la roche
      dominante ; s'il y en a plusieurs, celle nommée en premier l'emporte. Rien n'est donc compté deux fois et le total ne dépasse pas la France.</p>
      <p><b>Ce que mesure ce chiffre</b> : la surface où la roche est celle qu'on trouve sous le sol, à l'échelle de la carte. Les formations
      superficielles (alluvions, lœss, colluvions, éboulis) recouvrent le socle : là où elles sont cartographiées, la roche dessous n'est pas comptée.
      Une roche en filons ou en petits massifs (aplite, pegmatite, lamprophyre) est souvent trop étroite pour avoir son polygone. Enfin, les cartes ont
      été levées sur plus d'un siècle : le même terrain peut s'appeler « schistes » d'un côté d'une limite de feuille et « siltites » de l'autre.</p>
      </details>
    </div>
    <p class="page-source">Source : BRGM, BD Charm-50, cartes géologiques départementales harmonisées au 1/50 000 (infoterre.brgm.fr) ;
      surfaces calculées par l'atlas (formule de l'aire sphérique, rayon terrestre moyen 6 371 km). Total obtenu : ${nf(T, 0)} km²
      (superficie officielle de la France métropolitaine : 543 940 à 551 695 km² selon la source).</p>`;

    document.title = "Roches par surface — Atlas géologique";
  }

  window.RochesSurface = { vue, choisir, boutons, menu, page, rang, TRANCHES };
})();
