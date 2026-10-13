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
    wells: "Wells T., Hancock G., Fryer J. Using laboratory simulations and gravestone measurements to estimate rates of sandstone weathering in the Hunter Valley, New South Wales, Australia (université de Newcastle, Australie). Grès du Trias, grains de quartz, ciment d'argile tachée de limonite ; pierres tombales de Wollombi : 0,3 à 1,8 mm en 100 ans, qui accélère avec l'âge ; gel–dégel au laboratoire : 1,2 mm en 100 ans pour 5 gels par an.",
    sancho2003: "Sancho C., Fort R., Belmonte A. (2003). Weathering rates of historic sandstone structures in semiarid environments (Ebro basin, NE Spain). <i>Catena</i> 53, 53–64 (murs de châteaux datés : 1 à 8 mm en 100 ans, cité par Wells et al.).",
    rihosek2016: "Řihošek J., Bruthans J., Mašín D., Filippi M., Carling G. T., Schweigstillová J. (2016). Gravity-induced stress as a factor reducing decay of sandstone monuments in Petra, Jordan. <i>Journal of Cultural Heritage</i> (ciments de kaolinite, hématite, goethite et un peu de calcite ; recul des façades 10 à 220 mm en 1 000 ans, jusqu'à 350 ; les sels servent de ciment et chaque pluie les dissout).",
    bruthans2014: "Bruthans J. et al. (2014). Sandstone landforms shaped by negative feedback between stress and erosion. <i>Nature Geoscience</i> 7, 597–601 (un sable sans ciment, « verrouillé » par ses contacts entre grains, tient debout tant qu'il est comprimé).",
    mott2003: "Mottershead D., Gorbushina A., Lucas G., Wright J. (2003). The influence of marine salts, aspect and microbes in the weathering of sandstone in two historic structures. <i>Building and Environment</i> 38, 1193–1204 (vitesse multipliée par 3 selon l'orientation d'un même édifice, par 1,6 en bord de mer).",
    solub: "Solubilités dans l'eau à 10 °C calculées avec les constantes d'équilibre usuelles : calcite en équilibre avec le CO₂ de l'air (0,04 %) ou d'un sol (1 %) ; quartz ≈ 6 mg/L de silice ; gypse ≈ 2,4 g/L ; fer(III) ≈ 10⁻¹⁰ mol/L à pH neutre en présence d'oxygène ; fer(II) ≈ 5 mg/L dans l'eau d'un sol engorgé (valeur courante des nappes sans oxygène).",
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
      tient: "Le quartz a poussé autour des grains (auréoles) jusqu'à les souder : grains et ciment sont le même minéral.",
      cede: "Presque rien : la silice ne se dissout pas à l'échelle humaine. Seul le gel ouvre les fissures, comme dans un quartzite.",
      exemple: "Grès de Fontainebleau, grès armoricain des crêtes bretonnes.",
      phys: null, physNote: "comme le quartzite (fiche de l'Atlas) : seul le gel en détache des écailles", mesures: [] },
    { id: "ferrugineux", nom: "Ferrugineux", court: "oxydes de fer", mineral: "hématite", formule: "Fe₂O₃", couleur: "#b5523b",
      rho: 5260, part: 0.03, ceq: { air: 8e-9, sol: 8e-9, engorge: 0.0071 }, logk: -14.60, ea: 66.2e3, M: 0.1597, reduit: true,
      tient: "Une pellicule rouge d'oxydes de fer enrobe chaque grain et colle les grains à leurs points de contact.",
      cede: "À l'air, rien : le fer(III) est insoluble. Dans un sol engorgé, les bactéries le réduisent en fer(II) soluble et la pellicule part : le grès blanchit et se défait.",
      exemple: "Grès rose des Vosges (pellicule d'hématite, avec un peu d'argile et de quartz).",
      phys: [0.3, 1.8], physSrc: "wells", physNote: "gel–dégel, mesuré sur un grès à ciment d'argile et de limonite", mesures: ["wells"] },
    { id: "argileux", nom: "Argileux", court: "argiles", mineral: "kaolinite", formule: "Al₂Si₂O₅(OH)₄", couleur: "#9aa77a",
      rho: 2600, part: 0.10, ceq: { air: 1.3e-5, sol: 1.3e-5, engorge: 1.3e-5 }, logk: -13.18, ea: 22.2e3, M: 0.2582,
      tient: "Des paquets de petits feuillets d'argile bouchent les vides entre les grains, sans vraiment les souder.",
      cede: "L'argile ne se dissout presque pas, mais elle boit l'eau, gonfle et se ramollit ; le gel et les sels font le reste.",
      exemple: "Pierres tombales de Wollombi (Australie), façades de Petra (Jordanie).",
      phys: [0.3, 1.8], physSrc: "wells", physNote: "gel–dégel, mesuré à Wollombi", mesures: ["wells", "rihosek2016"] },
    { id: "calcaire", nom: "Calcaire", court: "calcite", mineral: "calcite", formule: "CaCO₃", couleur: "#d8cfa6",
      rho: 2710, part: 0.20, ceq: { air: 0.060, sol: 0.175, engorge: 0.175 }, logk: -5.81, ea: 23.5e3, M: 0.1001,
      tient: "De la calcite a cristallisé dans les vides et remplit tout l'espace entre les grains.",
      cede: "La pluie, un peu acide à cause du CO₂, dissout la calcite comme elle dissout un calcaire : chaque grain libéré tombe.",
      exemple: "Les molasses du pied des Alpes, grès calcaires du Bassin parisien.",
      phys: [0.3, 1.8], physSrc: "wells", physNote: "le gel agit aussi, mais la dissolution va plus vite", mesures: [] },
    { id: "salin", nom: "Gypse ou sels", court: "gypse, sels", mineral: "gypse", formule: "CaSO₄·2H₂O", couleur: "#b9acd8",
      rho: 2310, part: 0.15, ceq: { air: 2.4, sol: 2.4, engorge: 2.4 }, logk: -2.79, ea: 0, M: 0.1722,
      tient: "Des cristaux de gypse ou de sels poussent dans les vides quand l'eau s'évapore, surtout en climat sec.",
      cede: "Chaque pluie les redissout en quelques minutes ; en séchant, les sels recristallisent et font éclater la surface.",
      exemple: "Petra (Jordanie) ; croûtes de sel des grès de bord de mer.",
      phys: [1, 22], physSrc: "rihosek2016", physNote: "recul des façades de Petra, sels compris", mesures: ["rihosek2016"] },
  ];
  const C = Object.fromEntries(CIMENTS.map((c) => [c.id, c]));
  const MILIEUX = {
    air: { nom: "À l'air", detail: "façade, rocher : la pierre sèche entre deux pluies (mouillée 30 % du temps), gel et sels possibles", w: 0.3 },
    sol: { nom: "Dans un sol aéré", detail: "sous terre : toujours humide, CO₂ du sol (1 %), ni gel ni embruns", w: 1 },
    engorge: { nom: "Dans un sol engorgé", detail: "sous la nappe : toujours mouillé, sans oxygène, le fer devient soluble", w: 1 },
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
        <text x="${(a + b) / 2}" y="${Y0 - 13}" text-anchor="middle" class="gc-t2">fourchette de la fiche du grès</text>`;
    }
    for (let d = LMIN; d <= LMAX; d++) {
      const x = xl(Math.pow(10, d));
      s += `<line x1="${x}" y1="${Y0 - 4}" x2="${x}" y2="${H - 28}" class="gc-grille"/>
        <text x="${x}" y="${H - 12}" text-anchor="middle" class="gc-t2">${Math.pow(10, d).toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</text>`;
    }
    s += `<text x="${X0}" y="16" class="gc-t2">mm perdus en 100 ans — échelle logarithmique (chaque trait : ×10)</text>`;
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
      : "C'est la <b>réaction</b> qui limite : l'eau repart presque vide, le minéral n'a pas le temps de se dissoudre ; ajouter de l'eau ne change rien.";
    const mes = c.mesures.map((k) => `<li>${{ wells: "Pierres tombales de Wollombi (Australie), ciment d'argile et de limonite : <b>0,3 à 1,8 mm</b> en 100 ans, de plus en plus vite avec l'âge.",
      rihosek2016: "Façades de Petra (Jordanie), ciments de kaolinite et d'oxydes de fer, sels : <b>1 à 22 mm</b> en 100 ans, jusqu'à 35 mm par endroits." }[k]} ${cite(k)}</li>`).join("");
    return `<h3><i class="gc-pastille" style="background:${c.couleur}"></i>Ciment ${c.court} — ${m.nom.toLowerCase()}, ${etat.q} mm d'eau par an</h3>
      <ol class="gc-etapes">
        <li><b>Combien l'eau peut en emporter.</b> Un litre d'eau dissout au plus <b>${nf(ceqMg)} mg</b> de ${c.mineral} ${cite("solub")}.
          Avec ${etat.q} litres par m² et par an, cela fait au plus <b>${gm2(r.fsol)}</b>.</li>
        <li><b>À quelle vitesse il se dissout.</b> ${c.reduit && etat.milieu === "engorge"
          ? "Sans oxygène, des bactéries réduisent le fer(III) en fer(II) soluble : ce n'est plus la dissolution lente de l'oxyde qui compte, la réaction ne limite pas."
          : `Mesurée au laboratoire : ${nf(r.k10)} mol par m² de minéral et par seconde à 10 °C ${cite("pk2004")}. Avec une surface réactive dix fois celle de la façade et une pierre mouillée ${Math.round(m.w * 100)} % du temps : au plus <b>${gm2(r.fcin)}</b>.`}</li>
        <li><b>Le plus petit des deux gagne.</b> ${lim} Il part donc <b>${gm2(r.f)}</b>.</li>
        <li><b>En épaisseur de roche.</b> Le ciment occupe environ ${Math.round(c.part * 100)} % du volume ; quand il est parti, les grains tombent.
          Le grès recule de <b>${mmTxt(r.mm100)} en 100 ans</b> : un mètre de grès en <b>${unMetre(r.mm100)}</b>.</li>
        <li><b>Comparé à l'usure physique.</b> ${phys
          ? `Gel, sels, alternance humide–sec : <b>${nf(phys[0])} à ${nf(phys[1])} mm</b> en 100 ans (${c.physNote}${c.physSrc ? " " + cite(c.physSrc) : ""}).
             Vitesse attendue : la plus rapide des deux, soit <b>${att[0] === att[1] ? nf(att[0]) : `${nf(att[0])} à ${nf(att[1])}`} mm en 100 ans</b>
             — ${r.mm100 >= phys[1] ? "<b>c'est le ciment qui décide</b>." : r.mm100 >= phys[0] ? "ciment et climat font jeu égal." : "<b>c'est le climat qui décide</b>, le ciment n'y est presque pour rien."}`
          : "Sous terre, ni gel ni embruns : seule la dissolution compte."}</li>
      </ol>
      <p class="gc-tient"><b>Ce qui le tient :</b> ${c.tient}<br><b>Ce qui le fait céder :</b> ${c.cede}</p>
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
      <h1><span class="sw-big" style="background:#c99e6a"></span> Ce qui tient un grès : son ciment</h1>
      <p class="sub crumb"><b class="gc-fil" data-aller="roches">Roches</b> <span>→</span> <b class="gc-fil" data-aller="roche/gres">Grès</b> <span>→</span> Son ciment
        <span class="badge outline">nouvelle page, à valider</span></p>
      <p class="desc">Un grès, c'est du sable collé. Les grains sont presque tous du quartz, qui ne se dissout pratiquement pas : ce qui cède, c'est la colle entre eux. Selon le minéral qui sert de colle, un grès se défait en quelques siècles ou tient des millions d'années.</p>
    </div>

    <div class="card">
      <h2>Est-ce confirmé ?</h2>
      <p><b>Oui pour la chimie.</b> Un grain n'a pas besoin d'être dissous pour partir : il suffit que son ciment le soit. La vitesse de dissolution d'un grès est donc celle de son ciment, et elle change d'un facteur de plus de dix millions d'un ciment à l'autre (calcul plus bas). Les synthèses sur l'altération des grès rangent la nature et la quantité du ciment parmi les propriétés de la roche qui comptent le plus, à côté de la porosité et de la taille des pores ${cite("tp2005")}.</p>
      <p><b>Mais pas tout seul.</b> Quand le ciment ne se dissout presque pas (silice, oxydes de fer, argiles), la chimie devient si lente que ce sont le gel, les sels et l'alternance humide–sec qui fixent la vitesse : là, le climat et les pores comptent plus que le minéral du ciment ${cite("wells")}. Un même édifice s'use trois fois plus vite sur une face que sur une autre ${cite("mott2003")}, et un sable sans aucun ciment peut tenir debout s'il est assez comprimé ${cite("bruthans2014")}.</p>
      <p class="gc-bilan"><b>En une phrase :</b> le ciment décide quand il est soluble (calcite, gypse, sels) ; quand il ne l'est pas, c'est le climat qui décide.</p>
    </div>

    <div class="card">
      <h2>Les cinq ciments, au microscope</h2>
      <p class="sub">Grains de quartz en beige, vides en bleu, ciment en couleur. Clique sur un ciment pour voir son calcul.</p>
      <div class="gc-cartes">${cartes()}</div>
    </div>

    <div class="card">
      <h2>Vitesse d'altération calculée</h2>
      <p class="sub">Pour chaque ciment, la pastille donne la vitesse de dissolution <b>calculée</b> ; la bande grise, l'usure physique (gel, sels) <b>mesurée</b> sur des grès réels. Le grès s'use à la plus rapide des deux. Clique sur une ligne pour le détail du calcul.</p>
      <div class="gc-reglages">
        <div><span class="gc-reg-t">Où est le grès ?</span><div class="chips">${chips}</div><p class="gc-reg-d" data-milieu-d>${MILIEUX[etat.milieu].detail}</p></div>
        <label class="gc-eau"><span class="gc-reg-t">Eau qui passe sur la pierre : <b data-qv>${etat.q} mm par an</b></span>
          <input type="range" min="10" max="1000" step="10" value="${etat.q}" data-q>
          <span class="gc-reg-d">désert ≈ 10 · façade en France ≈ 400 (la moitié de la pluie) · rocher battu par la pluie ≈ 1 000</span></label>
      </div>
      <div class="gc-cadre" data-graph>${graphique()}</div>
      <div class="gc-detail" data-detail aria-live="polite">${detail(etat.sel)}</div>
      <p class="note">Calcul d'ordre de grandeur : la part du ciment, la surface réactive et le temps mouillé changent d'une pierre à l'autre, et les vitesses du laboratoire surestiment souvent celles du terrain. Les écarts entre ciments (plusieurs facteurs de dix) sont, eux, robustes.</p>
    </div>

    <div class="card">
      <h2>Ce qu'il faut retenir</h2>
      <p class="sub">À l'air, en France (400 mm d'eau par an sur la pierre), du plus fragile au plus solide :</p>
      ${verdicts()}
      <p>Un grès à ciment de gypse ne survit qu'au désert : avec 10 mm d'eau par an, il recule déjà d'environ ${nf(calcul("salin", "air", 10).mm100)} mm en 100 ans. Le ciment calcaire fait du grès un calcaire très poreux : il redevient sable en quelques milliers à quelques dizaines de milliers d'années. Les ciments siliceux et ferrugineux ne craignent que le gel… sauf le ciment ferrugineux enfoui dans un sol engorgé, où le fer se dissout (choisis « Dans un sol engorgé » plus haut).</p>
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
    document.title = "Ce qui tient un grès : son ciment — Atlas géologique";
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
    for (const k of ORDRE_SRC) if (!SRC[k]) R.push(`source ${k} listée mais absente`);
    for (const k of Object.keys(SRC)) if (!ORDRE_SRC.includes(k)) R.push(`source ${k} absente de la liste`);
    return R;
  }

  window.GresCiment = { page, calcul, controle, reperes, CIMENTS, MILIEUX, SRC };
  // repères de la réglette de la fiche du grès (rateStripSVG, app.js) : un trait par ciment, posé au chargement
  const g = typeof ROCHES !== "undefined" && ROCHES.find((r) => r.id === "gres");
  if (g && g.alteration) g.alteration.reperes = reperes();
})();
