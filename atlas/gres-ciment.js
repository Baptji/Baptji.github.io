// ============ Ce qui tient un grès : son ciment (12/10/2026, à valider) — route #roche/gres/ciment ============
// Sa demande (fiche du grès, « À quelle vitesse s'altère-t-elle ? ») : « ce qui va faire que la roche va s'altérer le plus va
// être le ciment ? Est-ce confirmé scientifiquement ? Si oui, une visualisation d'une seule page qui montre ça en fonction du
// type de ciment, et des vitesses d'altération calculées en fonction aussi. »
// Réponse construite : 1. est-ce confirmé (oui pour la chimie, pas seul : gel et sels prennent le relais quand le ciment ne se
// dissout pas) ; 2. les cinq ciments dessinés côte à côte ; 3. vitesse CALCULÉE pour chacun (réglages : milieu, eau qui passe),
// comparée à l'usure physique MESURÉE ; 4. sources.
// Calcul (une ligne par ciment) : le grain tombe quand son ciment est dissous, donc
//   recul (m/an) = masse de ciment emportée (kg/m²/an) / (masse volumique du ciment × part du ciment dans le volume),
//   masse emportée = le plus petit de : eau qui passe × solubilité (limite « solubilité ») et vitesse de réaction de
//   Palandri et Kharaka (2004) à 10 °C × surface réactive (×10 la façade) × part du temps mouillée (limite « réaction »).
// Pas d'information au survol (sa règle) : tout se lit au clic.
// API : GresCiment.page() (rend #main), GresCiment.calcul(id, milieu, q) → { fsol, fcin, f, mm100, limite },
//       GresCiment.controle() → [] attendu, GresCiment.reperes() → repères posés sur la réglette de la fiche du grès.
(function () {
  "use strict";
  const nf = (x, sig = 2) => x.toLocaleString("fr-FR", { maximumSignificantDigits: sig });
  const UNITES = "°C|%|mm|cm|km|m|mg|g|kg|kJ|mol|ans|an|L";
  const typo = (t) => t.replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\wÀ-ÿ]))`, "g"), "$1 ").replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ");
  const typoHTML = (h) => h.split(/(<[^>]*>)/).map((x) => (x.startsWith("<") ? x : typo(x))).join("");

  // ---------- 1. Sources ----------
  const SRC = {
    pk2004: "Palandri J. L., Kharaka Y. K. (2004). A compilation of rate parameters of water-mineral interaction kinetics for application to geochemical modeling. <i>U.S. Geological Survey Open File Report</i> 2004-1068 (constantes de vitesse à 25 °C et énergies d'activation : quartz, calcite, kaolinite, hématite, gypse).",
    tp2005: "Turkington A. V., Paradise T. R. (2005). Sandstone weathering: a century of research and innovation. <i>Geomorphology</i> 67, 229–253 (synthèse : propriétés de la roche, dont le ciment, et facteurs du milieu).",
    wells: "Wells T., Hancock G., Fryer J. Using laboratory simulations and gravestone measurements to estimate rates of sandstone weathering in the Hunter Valley, New South Wales, Australia (université de Newcastle, Australie). Grès du Trias, grains de quartz, liant argileux teinté de limonite ; pierres tombales de Wollombi : de 0,3 à 1,8 mm en 100 ans, avec une cadence qui s'accélère au fil des ans ; gel-dégel en laboratoire : 1,2 mm en 100 ans pour 5 cycles annuels.",
    sancho2003: "Sancho C., Fort R., Belmonte A. (2003). Weathering rates of historic sandstone structures in semiarid environments (Ebro basin, NE Spain). <i>Catena</i> 53, 53–64 (murs de châteaux datés : 1 à 8 mm en 100 ans, cité par Wells et al.).",
    rihosek2016: "Řihošek J., Bruthans J., Mašín D., Filippi M., Carling G. T., Schweigstillová J. (2016). Gravity-induced stress as a factor reducing decay of sandstone monuments in Petra, Jordan. <i>Journal of Cultural Heritage</i> (ciments de kaolinite, hématite, goethite et un peu de calcite ; recul des façades 10 à 220 mm en 1 000 ans, jusqu'à 350 ; les sels servent de ciment et chaque pluie les dissout).",
    bruthans2014: "Bruthans J. et al. (2014). Sandstone landforms shaped by negative feedback between stress and erosion. <i>Nature Geoscience</i> 7, 597–601 (un sable sans ciment, « verrouillé » par ses contacts entre grains, tient debout tant qu'il est comprimé).",
    mott2003: "Mottershead D., Gorbushina A., Lucas G., Wright J. (2003). The influence of marine salts, aspect and microbes in the weathering of sandstone in two historic structures. <i>Building and Environment</i> 38, 1193–1204 (vitesse multipliée par 3 selon l'orientation d'un même édifice, par 1,6 en bord de mer).",
    solub: "À 10 °C, les solubilités, établies à partir des constantes d'équilibre usuelles, s'établissent ainsi : calcite à l'équilibre avec le CO₂ de l'air (0,04 %) ou du sol (1 %) ; quartz ≈ 6 mg/L de silice ; gypse ≈ 2,4 g/L ; fer(III) ≈ 10⁻¹⁰ mol/L à pH neutre, en présence d'oxygène ; fer(II) ≈ 5 mg/L dans une eau de sol engorgé, valeur habituelle des nappes sans oxygène.",
  };
  const ORDRE_SRC = ["tp2005", "pk2004", "solub", "wells", "sancho2003", "rihosek2016", "mott2003", "bruthans2014"];
  const cite = (...k) => k.map((x) => `<button type="button" class="gc-ref" data-src="${x}">${ORDRE_SRC.indexOf(x) + 1}</button>`).join("");

  // ---------- 2. Les cinq ciments ----------
  // rho : masse volumique du minéral (kg/m³) ; part : part du volume de la roche occupée par le ciment (ordre de grandeur courant) ;
  // ceq : solubilité (kg/m³ = g/L) par milieu ; logk, ea, M : Palandri et Kharaka 2004, mécanisme neutre, 25 °C (mol/m²/s, J/mol, kg/mol) ;
  // phys : usure physique (gel, sels) MESURÉE, en mm en 100 ans, à l'air seulement ; mesures : valeurs publiées pour ce type de ciment.
  const CIMENTS = [
    { id: "siliceux", nom: "Siliceux", court: "silice", mineral: "quartz", formule: "SiO₂", couleur: "#9fb8c9",
      rho: 2650, part: 0.10, ceq: { air: 0.006, sol: 0.006, engorge: 0.006 }, logk: -13.40, ea: 87.7e3, M: 0.0601,
      tient: "Des auréoles de quartz ont grandi autour des grains jusqu'à les réunir : liant et grains sont donc de même nature.",
      cede: "Guère de perte : à l'échelle humaine, la silice reste en place. Seul le gel entrouvre des fentes, à l'instar du quartzite.",
      exemple: "Exemples : grès de Fontainebleau et grès armoricain, qui dessinent les crêtes de Bretagne.",
      phys: null, physNote: "comme pour le quartzite (fiche de l'Atlas) : il n'y a que le gel pour détacher des écailles", mesures: [] },
    { id: "ferrugineux", nom: "Ferrugineux", court: "oxydes de fer", mineral: "hématite", formule: "Fe₂O₃", couleur: "#b5523b",
      rho: 5260, part: 0.03, ceq: { air: 8e-9, sol: 8e-9, engorge: 0.0071 }, logk: -14.60, ea: 66.2e3, M: 0.1597, reduit: true,
      tient: "Chaque grain porte une fine couche rouge d'oxydes de fer qui les lie au niveau des contacts.",
      cede: "Hors d'un sol gorgé d'eau, rien ne bouge : le fer(III) ne se dissout pas. Mais sous eau, des bactéries le ramènent en fer(II) soluble ; la pellicule s'en va, le grès pâlit et s'effrite.",
      exemple: "Le grès rose vosgien doit sa couleur à une pellicule d'hématite, à laquelle s'associent quelques argiles et du quartz.",
      phys: [0.3, 1.8], physSrc: "wells", physNote: "mesures des cycles gel-dégel faites sur un grès au liant argileux et limoniteux", mesures: ["wells"] },
    { id: "argileux", nom: "Argileux", court: "argiles", mineral: "kaolinite", formule: "Al₂Si₂O₅(OH)₄", couleur: "#9aa77a",
      rho: 2600, part: 0.10, ceq: { air: 1.3e-5, sol: 1.3e-5, engorge: 1.3e-5 }, logk: -13.18, ea: 22.2e3, M: 0.2582,
      tient: "Des amas de minuscules feuillets argileux comblent les interstices entre les grains sans les unir franchement.",
      cede: "Quasi insoluble, l'argile n'en gonfle pas moins sous l'eau et perd de sa cohésion ; le gel et les sels parachèvent l'ouvrage.",
      exemple: "Pierres tombales de Wollombi (Australie) et façades de Pétra (Jordanie) servent de référence.",
      phys: [0.3, 1.8], physSrc: "wells", physNote: "gel-dégel, mesuré à Wollombi", mesures: ["wells", "rihosek2016"] },
    { id: "calcaire", nom: "Calcaire", court: "calcite", mineral: "calcite", formule: "CaCO₃", couleur: "#d8cfa6",
      rho: 2710, part: 0.20, ceq: { air: 0.060, sol: 0.175, engorge: 0.175 }, logk: -5.81, ea: 23.5e3, M: 0.1001,
      tient: "De la calcite a cristallisé dans les pores et remplit tout l'espace entre les grains.",
      cede: "La pluie, légèrement acide sous l'effet du CO₂, dissout la calcite comme elle dissout un calcaire : chaque grain libéré chute.",
      exemple: "Les molasses au pied des Alpes, ainsi que les grès calcaires du Bassin parisien.",
      phys: [0.3, 1.8], physSrc: "wells", physNote: "le gel agit également, mais la dissolution est plus rapide", mesures: [] },
    { id: "salin", nom: "Gypse ou sels", court: "gypse, sels", mineral: "gypse", formule: "CaSO₄·2H₂O", couleur: "#b9acd8",
      rho: 2310, part: 0.15, ceq: { air: 2.4, sol: 2.4, engorge: 2.4 }, logk: -2.79, ea: 0, M: 0.1722,
      tient: "Des cristaux de gypse ou de sels croissent dans les vides lors de l'évaporation de l'eau, surtout en climat sec.",
      cede: "En quelques minutes, chaque averse les dissout ; au séchage, ils cristallisent de nouveau et fendent la surface.",
      exemple: "Au menu : Pétra (Jordanie) et les croûtes salines des grès côtiers.",
      phys: [1, 22], physSrc: "rihosek2016", physNote: "recul des façades de Pétra, sels compris", mesures: ["rihosek2016"] },
  ];
  const C = Object.fromEntries(CIMENTS.map((c) => [c.id, c]));
  const MILIEUX = {
    air: { nom: "À l'air", detail: "façade ou rocher : entre deux averses, la pierre reste sèche (humide 30 % du temps), et gel comme sels sont possibles", w: 0.3 },
    sol: { nom: "Dans un sol aéré", detail: "sous terre : eau constante, CO₂ du sol (1 %), aucun gel ni embruns", w: 1 },
    engorge: { nom: "Dans un sol engorgé", detail: "sous la nappe : toujours noyé, sans oxygène, le fer passe en solution", w: 1 },
  };
  const T = 283.15, SURF = 10, AN = 3.156e7;
  const etat = { milieu: "air", q: 400, sel: "calcaire" };

  // ---------- 3. Le calcul ----------
  function calcul(id, milieu = etat.milieu, q = etat.q) {
    const c = C[id], m = MILIEUX[milieu];
    const k10 = Math.pow(10, c.logk) * Math.exp(-c.ea / 8.314 * (1 / T - 1 / 298.15));      // mol/m²/s à 10 °C
    const fsol = (q / 1000) * c.ceq[milieu];                                                // kg/m²/an
    // fer réduit par les bactéries en sol engorgé : la réaction n'est plus celle de l'oxyde au contact de l'eau neutre, elle ne limite plus
    const fcin = c.reduit && milieu === "engorge" ? Infinity : k10 * c.M * SURF * m.w * AN;
    const f = Math.min(fsol, fcin);
    const mm100 = f / (c.rho * c.part) * 1e5;                                               // m/an → mm en 100 ans
    const phys = milieu === "air" ? c.phys : null;
    const attendu = phys ? [Math.max(mm100, phys[0]), Math.max(mm100, phys[1])] : [mm100, mm100];
    return { k10, fsol, fcin, f, mm100, limite: fsol <= fcin ? "solubilite" : "reaction", phys, attendu };
  }
  // repères de la réglette « À quelle vitesse » de la fiche du grès (valeurs en mm/an, à l'air, 400 mm d'eau)
  function reperes() {
    const g = (a) => Math.sqrt(a[0] * a[1]);
    const qz = (typeof ROCHES !== "undefined" && ROCHES.find((r) => r.id === "quartzite")) || null;
    const sil = qz && qz.alteration ? qz.alteration.vmax : 0.002;
    return [
      { v: sil, label: "silice" },
      { v: g(calcul("argileux", "air", 400).attendu) / 100, label: "argile, fer" },
      { v: calcul("calcaire", "air", 400).mm100 / 100, label: "calcite" },
    ];
  }

  // ---------- 4. Mise en forme des nombres ----------
  const mmTxt = (x) => (x >= 0.001 ? `${nf(x)} mm` : `presque rien : ${nf(x)} mm`);
  const sig2 = (x) => Number(x.toPrecision(2));
  function duree(ans) {
    if (!isFinite(ans)) return "jamais";
    if (ans >= 1e9) { const v = sig2(ans / 1e9); return `${v.toLocaleString("fr-FR")} milliard${v >= 2 ? "s" : ""} d'années`; }
    if (ans >= 1e6) { const v = sig2(ans / 1e6); return `${v.toLocaleString("fr-FR")} million${v >= 2 ? "s" : ""} d'années`; }
    return `${sig2(ans).toLocaleString("fr-FR")} ans`;
  }
  const unMetre = (mm100) => duree(1e5 / mm100);
  const gm2 = (kg) => (kg === Infinity ? "pas de limite" : `${nf(kg * 1000)} g par m² et par an`);

  // ---------- 5. Dessins des ciments (vue au microscope : grains beiges, vides bleus) ----------
  const GRAINS = [[22, 24, 17], [58, 18, 15], [94, 26, 17], [38, 58, 18], [78, 60, 17], [112, 64, 12], [16, 88, 14], [56, 94, 15], [96, 96, 16]];
  function dessin(c) {
    let fond = "var(--gc-vide)", dedans = "", bord = "";
    const grains = (r = 0, trait = "var(--gc-grain-bord)", ep = 1) => GRAINS.map(([x, y, g]) => `<circle cx="${x}" cy="${y}" r="${g + r}" fill="var(--gc-grain)" stroke="${trait}" stroke-width="${ep}"/>`).join("");
    if (c.id === "siliceux") {
      // auréoles de quartz : chaque grain a grossi jusqu'à toucher ses voisins ; le contour d'origine reste en pointillés
      fond = "var(--gc-grain)";
      dedans = GRAINS.map(([x, y, g]) => `<circle cx="${x}" cy="${y}" r="${g + 7}" fill="var(--gc-grain)" stroke="var(--gc-grain-bord)" stroke-width="1"/>`).join("")
        + GRAINS.map(([x, y, g]) => `<circle cx="${x}" cy="${y}" r="${g}" fill="none" stroke="var(--gc-trait2)" stroke-width="1" stroke-dasharray="2 2"/>`).join("");
      bord = [[40, 40], [76, 40], [57, 76], [98, 80], [30, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="var(--gc-vide)"/>`).join("");
    } else if (c.id === "ferrugineux") {
      dedans = grains(0, c.couleur, 3.2);
    } else if (c.id === "argileux") {
      dedans = grains();
      const traits = [];
      for (let i = 0; i < 46; i++) {
        const x = (i * 37) % 128 + 2, y = (i * 53) % 116 + 2, a = (i * 47) % 180;
        traits.push(`<line x1="${x}" y1="${y}" x2="${x + 6 * Math.cos(a * Math.PI / 180)}" y2="${y + 6 * Math.sin(a * Math.PI / 180)}" stroke="${c.couleur}" stroke-width="2.2" stroke-linecap="round"/>`);
      }
      fond = "var(--gc-vide)";
      bord = dedans; dedans = traits.join("");
    } else if (c.id === "calcaire") {
      fond = c.couleur;
      const mosaique = [];
      for (let i = 0; i < 14; i++) { const x = (i * 41) % 124, y = (i * 29) % 112; mosaique.push(`<path d="M${x} ${y} l9 6 l-3 10" fill="none" stroke="var(--gc-trait2)" stroke-width="0.8"/>`); }
      dedans = mosaique.join("") + grains();
    } else if (c.id === "salin") {
      const aig = [];
      for (let i = 0; i < 52; i++) { const x = (i * 31) % 126 + 2, y = (i * 43) % 114 + 2, a = 60 + (i * 23) % 60; aig.push(`<line x1="${x}" y1="${y}" x2="${x + 9 * Math.cos(a * Math.PI / 180)}" y2="${y - 9 * Math.sin(a * Math.PI / 180)}" stroke="var(--gc-sel)" stroke-width="2.2" stroke-linecap="round"/>`); }
      dedans = aig.join(""); bord = grains();
    }
    return `<svg viewBox="0 0 130 118" class="gc-dessin" role="img" aria-label="Grès à ciment ${c.court}, vu au microscope">
      <rect width="130" height="118" fill="${fond}"/>${dedans}${bord}</svg>`;
  }

  // ---------- 6. Le graphique ----------
  const LMIN = -4, LMAX = 4, W = 800, X0 = 150, X1 = 768;
  const xl = (v) => X0 + (Math.log10(Math.max(v, Math.pow(10, LMIN))) - LMIN) / (LMAX - LMIN) * (X1 - X0);
  function graphique() {
    const RH = 58, Y0 = 46, H = Y0 + CIMENTS.length * RH + 34;
    const gres = (typeof ROCHES !== "undefined" && ROCHES.find((r) => r.id === "gres")) || null;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="gc-svg" role="img" aria-label="Vitesse d'altération calculée pour chaque ciment, en mm perdus en 100 ans">`;
    if (gres && gres.alteration) {
      const a = xl(gres.alteration.vmin * 100), b = xl(gres.alteration.vmax * 100);
      s += `<rect x="${a}" y="${Y0 - 8}" width="${b - a}" height="${CIMENTS.length * RH + 8}" class="gc-fiche"/>
        <text x="${(a + b) / 2}" y="${Y0 - 13}" text-anchor="middle" class="gc-t2">fourchette relevée sur la fiche du grès</text>`;
    }
    for (let d = LMIN; d <= LMAX; d++) {
      const x = xl(Math.pow(10, d));
      s += `<line x1="${x}" y1="${Y0 - 4}" x2="${x}" y2="${H - 28}" class="gc-grille"/>
        <text x="${x}" y="${H - 12}" text-anchor="middle" class="gc-t2">${Math.pow(10, d).toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</text>`;
    }
    s += `<text x="${X0}" y="16" class="gc-t2">perte en mm sur 100 ans, graduation logarithmique (un trait = ×10)</text>`;
    CIMENTS.forEach((c, i) => {
      const r = calcul(c.id), y = Y0 + i * RH + RH / 2 - 6, on = c.id === etat.sel;
      s += `<g class="gc-ligne${on ? " on" : ""}" data-gc="${c.id}" tabindex="0" role="button" aria-label="${c.nom} : détail du calcul">
        <rect x="0" y="${y - RH / 2 + 4}" width="${W}" height="${RH - 4}" class="gc-ligne-fond"/>
        <rect x="4" y="${y - 9}" width="18" height="18" rx="4" fill="${c.couleur}" stroke="var(--gc-trait2)"/>
        <text x="28" y="${y + 6}" class="gc-nom">${c.nom}</text>`;
      if (r.phys) s += `<rect x="${xl(r.phys[0])}" y="${y - 7}" width="${xl(r.phys[1]) - xl(r.phys[0])}" height="14" rx="7" class="gc-phys"/>`;
      else if (c.id === "siliceux" && etat.milieu === "air") {
        const qz = typeof ROCHES !== "undefined" && ROCHES.find((x) => x.id === "quartzite");
        if (qz && qz.alteration) s += `<rect x="${xl(qz.alteration.vmin * 100)}" y="${y - 7}" width="${xl(qz.alteration.vmax * 100) - xl(qz.alteration.vmin * 100)}" height="14" rx="7" class="gc-phys"/>`;
      }
      const xc = xl(r.mm100), coupe = r.mm100 < Math.pow(10, LMIN);
      s += coupe
        ? `<path d="M${X0 + 14} ${y - 7} l-12 7 l12 7 z" fill="${c.couleur}" stroke="var(--gc-trait)" stroke-width="1.4"/>
           <text x="${X0 + 20}" y="${y + 22}" class="gc-t2">dissolution : ${nf(r.mm100)} mm</text>`
        : `<circle cx="${xc}" cy="${y}" r="8" fill="${c.couleur}" stroke="var(--gc-trait)" stroke-width="1.8"/>
           <text x="${xc}" y="${y + 24}" text-anchor="middle" class="gc-val">${nf(r.mm100)}</text>`;
      s += `</g>`;
    });
    return s + "</svg>";
  }

  // ---------- 7. Détail du calcul d'un ciment ----------
  function detail(id) {
    const c = C[id], m = MILIEUX[etat.milieu], r = calcul(id);
    const qz = typeof ROCHES !== "undefined" && ROCHES.find((x) => x.id === "quartzite");
    const phys = r.phys || (id === "siliceux" && etat.milieu === "air" && qz && qz.alteration ? [qz.alteration.vmin * 100, qz.alteration.vmax * 100] : null);
    const att = phys ? [Math.max(r.mm100, phys[0]), Math.max(r.mm100, phys[1])] : null;
    const ceqMg = c.ceq[etat.milieu] * 1000;
    const lim = r.limite === "solubilite"
      ? "C'est la <b>solubilité</b> qui limite : la réaction est assez rapide pour que l'eau reparte saturée ; plus il passe d'eau, plus le grès recule."
      : "Ici, <b>la réaction</b> impose le rythme : l'eau repart presque vide sans que le minéral ait eu le temps de se dissoudre, si bien qu'un surcroît d'eau ne change rien.";
    const mes = c.mesures.map((k) => `<li>${{ wells: "Pierres tombales de Wollombi (Australie), ciment d'argile et de limonite : <b>0,3 à 1,8 mm</b> en 100 ans, à un rythme qui s'accroît avec l'âge.",
      rihosek2016: "À Pétra (Jordanie), kaolinite, oxydes de fer et sels érodent les façades de <b>1 à 22 mm</b> en 100 ans, jusqu'à 35 mm par endroits." }[k]} ${cite(k)}</li>`).join("");
    return `<h3><i class="gc-pastille" style="background:${c.couleur}"></i>Ciment ${c.court} : ${m.nom.toLowerCase()}, ${etat.q} mm d'eau par an</h3>
      <ol class="gc-etapes">
        <li><b>Ce que l'eau peut en emporter.</b> Un litre d'eau dissout au plus <b>${nf(ceqMg)} mg</b> de ${c.mineral} ${cite("solub")}.
          Pour ${etat.q} litres par m² et par an, cela représente au plus <b>${gm2(r.fsol)}</b>.</li>
        <li><b>Vitesse de dissolution.</b> ${c.reduit && etat.milieu === "engorge"
          ? "Privées d'oxygène, des bactéries transforment le fer(III) en fer(II), soluble : la dissolution lente de l'oxyde cesse alors de dicter la vitesse, qui n'est plus bridée par la réaction."
          : `Au laboratoire, on mesure ${nf(r.k10)} mol par m² de minéral et par seconde à 10 °C ${cite("pk2004")}. Pour une surface réactive dix fois plus grande que celle de la façade et une pierre humide ${Math.round(m.w * 100)} % du temps, on obtient au maximum <b>${gm2(r.fcin)}</b>.`}</li>
        <li><b>Le plus faible des deux termes l'emporte.</b> ${lim} Le recul s'établit donc à <b>${gm2(r.f)}</b>.</li>
        <li><b>En épaisseur de roche.</b> Le ciment représente environ ${Math.round(c.part * 100)} % du volume ; une fois dissous, les grains se détachent.
          Le grès s'use de <b>${mmTxt(r.mm100)} en 100 ans</b> : un mètre de grès s'use en <b>${unMetre(r.mm100)}</b>.</li>
        <li><b>Comparaison avec l'usure physique.</b> ${phys
          ? `Sous l'effet du gel, des sels et des cycles humide-sec, la pierre perd <b>${nf(phys[0])} à ${nf(phys[1])} mm</b>, soit ${c.physNote}${c.physSrc ? " " + cite(c.physSrc) : ""} sur 100 ans.
             Le résultat retenu est le plus rapide des deux : <b>${att[0] === att[1] ? nf(att[0]) : `${nf(att[0])} à ${nf(att[1])}`} mm en 100 ans</b>, ${r.mm100 >= phys[1] ? "<b>c'est le ciment qui décide</b>." : r.mm100 >= phys[0] ? "ciment et climat font jeu égal." : "<b>le climat est le facteur décisif</b> ; le ciment n'intervient presque pas."}`
          : "En souterrain, pas de gel ni d'embruns : la dissolution est le seul processus à l'œuvre."}</li>
      </ol>
      <p class="gc-tient"><b>Ce qui le maintient :</b> ${c.tient}<br><b>Ce qui le désagrège :</b> ${c.cede}</p>
      ${mes ? `<p class="gc-mes-t"><b>Mesuré sur le terrain</b></p><ul class="gc-mes">${mes}</ul>` : ""}`;
  }

  // ---------- 8. La page ----------
  function cartes() {
    return CIMENTS.map((c) => `<button type="button" class="gc-carte${c.id === etat.sel ? " on" : ""}" data-gc="${c.id}">
      ${dessin(c)}
      <span class="gc-carte-nom"><i class="gc-pastille" style="background:${c.couleur}"></i>${c.nom}</span>
      <span class="gc-carte-min">${c.mineral} · ${c.formule}</span>
      <span class="gc-carte-txt">${c.tient}</span>
      <span class="gc-carte-ex">${c.exemple}</span>
    </button>`).join("");
  }
  function verdicts() {
    const v = (id) => calcul(id, "air", 400);
    return `<div class="gc-classement">
      ${["salin", "calcaire", "argileux", "ferrugineux", "siliceux"].map((id) => {
        const c = C[id], r = v(id), qz = typeof ROCHES !== "undefined" && ROCHES.find((x) => x.id === "quartzite");
        const p = r.phys || (id === "siliceux" && qz ? [qz.alteration.vmin * 100, qz.alteration.vmax * 100] : [0, 0]);
        const a = Math.max(r.mm100, p[0]), b = Math.max(r.mm100, p[1]);
        return `<div class="gc-cl"><i class="gc-pastille" style="background:${c.couleur}"></i><b>${c.nom}</b>
          <span>${a === b ? nf(a) : `${nf(a)} à ${nf(b)}`} mm en 100 ans</span>
          <span class="gc-cl-qui">${r.mm100 >= p[1] ? "le ciment décide" : "le climat décide"}</span></div>`;
      }).join("")}</div>`;
  }
  function html() {
    const chips = Object.entries(MILIEUX).map(([k, m]) => `<button type="button" class="chip${k === etat.milieu ? " on" : ""}" data-milieu="${k}">${m.nom}</button>`).join("");
    return `<div class="gc-page">
    <div class="card rock-head">
      <h1><span class="sw-big" style="background:#c99e6a"></span> Le ciment qui lie un grès</h1>
      <p class="sub crumb"><b class="gc-fil" data-aller="roches">Roches</b> <span>→</span> <b class="gc-fil" data-aller="roche/gres">Grès</b> <span>→</span> Son ciment
        <span class="badge outline">nouvelle page, à valider</span></p>
      <p class="desc">Le grès est formé de sable agglutiné. Quartz en majorité, les grains se dissolvent guère : c'est le liant qui cède en premier. Suivant le minéral faisant office de colle, la roche se délite en quelques siècles ou résiste pendant des millions d'années.</p>
    </div>

    <div class="card">
      <h2>Est-ce confirmé ?</h2>
      <p><b>Oui pour la chimie.</b> Un grain se libère dès que son liant disparaît, sans passer lui-même en solution. La vitesse du grès épouse donc celle de son ciment, qui varie de plus de dix millions de fois d'un liant à l'autre (voir le calcul plus bas). Les travaux sur l'altération des grès comptent la nature et l'abondance du ciment parmi les critères majeurs, avec la porosité et la dimension des pores ${cite("tp2005")}.</p>
      <p><b>Mais pas seul.</b> Si le liant résiste à la dissolution (silice, oxydes de fer, argiles), la chimie traîne tant que le gel, les sels et les alternances d'humidité deviennent maîtres du rythme : le climat et les pores l'emportent alors sur la nature du liant ${cite("wells")}. Une même paroi s'érode trois fois plus vite d'un côté que de l'autre ${cite("mott2003")}, et un sable dépourvu de liant tient debout pourvu qu'il soit assez tassé ${cite("bruthans2014")}.</p>
      <p class="gc-bilan"><b>En somme :</b> le liant commande quand il se dissout (calcite, gypse, sels) ; quand il ne se dissout pas, le climat tranche.</p>
    </div>

    <div class="card">
      <h2>Les cinq ciments observés au microscope</h2>
      <p class="sub">Quartz en beige, vides en bleu, liant en couleur. Un clic sur un liant révèle son calcul.</p>
      <div class="gc-cartes">${cartes()}</div>
    </div>

    <div class="card">
      <h2>Vitesse d'altération calculée</h2>
      <p class="sub">Pour chaque liant, la pastille figure la dissolution <b>calculée</b>, la bande grise l'usure physique (gel, sels) <b>mesurée</b> sur des grès réels. Le grès cède selon la plus rapide des deux. Une ligne cliquée ouvre le détail.</p>
      <div class="gc-reglages">
        <div><span class="gc-reg-t">Où est le grès ?</span><div class="chips">${chips}</div><p class="gc-reg-d" data-milieu-d>${MILIEUX[etat.milieu].detail}</p></div>
        <label class="gc-eau"><span class="gc-reg-t">Eau qui passe sur la pierre : <b data-qv>${etat.q} mm par an</b></span>
          <input type="range" min="10" max="1000" step="10" value="${etat.q}" data-q>
          <span class="gc-reg-d">désert ≈ 10 · façade en France ≈ 400 (la moitié de la pluie) · rocher battu par la pluie ≈ 1 000</span></label>
      </div>
      <div class="gc-cadre" data-graph>${graphique()}</div>
      <div class="gc-detail" data-detail aria-live="polite">${detail(etat.sel)}</div>
      <p class="note">Estimation d'ordre de grandeur : part du ciment, surface réactive et durée mouillée varient selon les pierres, et les vitesses de labo dépassent souvent celles du terrain. Les écarts entre liants, de plusieurs décades, restent en revanche solides.</p>
    </div>

    <div class="card">
      <h2>Ce qu'il faut retenir</h2>
      <p class="sub">En France, sur la pierre (400 mm d'eau par an), du plus fragile au plus robuste :</p>
      ${verdicts()}
      <p>Un grès à liant gypseux ne tient que dans le désert : à 10 mm d'eau par an, il recule déjà d'environ ${nf(calcul("salin", "air", 10).mm100)} mm en 100 ans. Le liant calcaire ramène le grès à un calcaire poreux, qui redevient sable en quelques milliers à quelques dizaines de milliers d'années. Les liants siliceux et ferrugineux ne redoutent que le gel… hormis le fer enfoui dans un sol gorgé d'eau, qui se dissout (voir « Dans un sol engorgé » plus haut).</p>
    </div>

    <details class="card sources-roche"><summary><h2 style="display:inline">Sources</h2></summary>
      <ol class="gc-sources">${ORDRE_SRC.map((k) => `<li id="gc-src-${k}">${SRC[k]}</li>`).join("")}</ol>
    </details>
    </div>`;
  }

  function redessiner(main) {
    main.querySelector("[data-graph]").innerHTML = graphique();
    main.querySelector("[data-detail]").innerHTML = typoHTML(detail(etat.sel));
    main.querySelectorAll(".gc-carte").forEach((b) => b.classList.toggle("on", b.dataset.gc === etat.sel));
  }
  function monter(main) {
    main.addEventListener("click", (e) => {
      const ref = e.target.closest(".gc-ref");
      if (ref) {
        const det = main.querySelector(".sources-roche"), li = main.querySelector("#gc-src-" + ref.dataset.src);
        if (det) det.open = true;
        if (li) { li.scrollIntoView({ behavior: "smooth", block: "center" }); li.classList.remove("gc-vu"); void li.offsetWidth; li.classList.add("gc-vu"); }
        return;
      }
      const fil = e.target.closest("[data-aller]");
      if (fil) { location.hash = fil.dataset.aller; return; }
      const mil = e.target.closest("[data-milieu]");
      if (mil) {
        etat.milieu = mil.dataset.milieu;
        main.querySelectorAll("[data-milieu]").forEach((b) => b.classList.toggle("on", b === mil));
        main.querySelector("[data-milieu-d]").textContent = MILIEUX[etat.milieu].detail;
        redessiner(main);
        return;
      }
      const g = e.target.closest("[data-gc]");
      if (g) {
        etat.sel = g.dataset.gc;
        redessiner(main);
        if (g.classList.contains("gc-carte")) main.querySelector("[data-graph]").scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    main.addEventListener("keydown", (e) => {
      const g = e.target.closest && e.target.closest(".gc-ligne");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); etat.sel = g.dataset.gc; redessiner(main); main.querySelector(`.gc-ligne[data-gc="${etat.sel}"]`).focus(); }
    });
    const curseur = main.querySelector("[data-q]");
    curseur.addEventListener("input", () => {
      etat.q = +curseur.value;
      main.querySelector("[data-qv]").textContent = `${etat.q} mm par an`;
      redessiner(main);
    });
  }
  function page() {
    const main = document.getElementById("main");
    main.innerHTML = typoHTML(html());
    document.title = "Le ciment qui lie un grès, Atlas Sol";
    monter(main);
    window.scrollTo({ top: 0 });
  }

  // ---------- 9. Contrôles ----------
  // ordres de grandeur attendus (mm en 100 ans, à l'air, 400 mm d'eau) : si une constante est mal recopiée, ça se voit ici
  function controle() {
    const R = [], v = (id, mil = "air", q = 400) => calcul(id, mil, q).mm100;
    const dans = (x, a, b, n) => { if (!(x >= a && x <= b)) R.push(`${n} : ${x} hors de [${a} ; ${b}]`); };
    dans(v("calcaire"), 2, 8, "calcaire à l'air");                 // ≈ 4,4 ; un calcaire massif recule de ≈ 1 mm en 100 ans, ÷ 20 % de ciment
    dans(v("calcaire", "sol"), 8, 20, "calcaire en sol");
    dans(v("salin"), 100, 400, "gypse à l'air");
    dans(v("siliceux"), 1e-7, 1e-4, "quartz à l'air");
    dans(v("ferrugineux"), 1e-8, 1e-4, "fer à l'air");
    dans(v("ferrugineux", "engorge"), 0.5, 5, "fer en sol engorgé");
    dans(v("argileux"), 1e-6, 1e-2, "kaolinite à l'air");
    if (calcul("calcaire").limite !== "solubilite") R.push("calcite : devrait être limitée par la solubilité");
    if (calcul("siliceux").limite !== "reaction") R.push("quartz : devrait être limité par la réaction");
    for (const c of CIMENTS) {
      for (const k of [c.physSrc, ...c.mesures].filter(Boolean)) if (!SRC[k]) R.push(`${c.id} : source ${k} absente`);
      for (const m of Object.keys(MILIEUX)) if (!(c.ceq[m] > 0)) R.push(`${c.id} : solubilité ${m} manquante`);
    }
    // D.8.2 : les valeurs « gresCiment » de la fiche du grès doivent rester égales à ce calcul (à 2 % près)
    const gr = typeof ROCHES !== "undefined" && ROCHES.find((r) => r.id === "gres");
    const attendus = [["ferrugineux", "engorge"], ["calcaire", "air"], ["salin", "air"]].map(([c, m]) => calcul(c, m, 400).mm100 / 100);
    for (const x of ((gr && gr.alteration && gr.alteration.valeurs) || []).filter((x) => x.calcul === "gresCiment"))
      if (!attendus.some((a) => Math.abs(x.v / a - 1) < 0.02)) R.push(`${x.v} mm/an, valeur de la fiche du grès, ne cadre plus avec le calcul`);
    for (const k of ORDRE_SRC) if (!SRC[k]) R.push(`source ${k} listée mais absente`);
    for (const k of Object.keys(SRC)) if (!ORDRE_SRC.includes(k)) R.push(`source ${k} absente de la liste`);
    return R;
  }

  window.GresCiment = { page, calcul, controle, reperes, CIMENTS, MILIEUX, SRC };
  // repères de la réglette de la fiche du grès (rateStripSVG, app.js) : un trait par ciment, posé au chargement
  // D.8.2 (22/10/2026) : la fiche a maintenant des valeurs nettes (data.js), dont trois reprennent ce calcul : plus de repères
  const g = typeof ROCHES !== "undefined" && ROCHES.find((r) => r.id === "gres");
  if (g && g.alteration && !g.alteration.valeurs) g.alteration.reperes = reperes();
})();
