// ============ Espacement basal d(001) des argiles en 3D (chantier G.5, 29/09/2026) ============
// Toutes les argiles de l'atlas (fiches #argile, espèces #espece, fiches minéraux « _m ») reçoivent leur structure
// en 3D avec l'espace interfoliaire en bleu, la flèche d(001) et une rotation lente autour de la normale aux feuillets
// (options `cote` et `rotation` de structures3d.js). Choix de l'utilisateur : la 3D plutôt qu'un schéma 2D.
//
// COUCHES : pour chaque structure (fichier structures/<f>.js), hauteurs (Å, perpendiculaires aux feuillets) des plans
// d'oxygènes extérieurs de chaque feuillet dans une maille, après décalage de l'origine. CALCULÉES, pas saisies :
// script feuillets.py du scratchpad de la session G.5 (cations tétraédriques = sites de Si ou de Zn à 4 ligands,
// O basaux et apical de chacun, feuillets tétraédriques appariés en feuillets 2:1, feuillets 1:1 fermés par le plan
// d'OH le plus éloigné). d = d(001) de la structure, e = épaisseur du feuillet.
(function () {
  "use strict";

  const COUCHES = {
    kaolinite: {"decalage": [0, 0, 0.0457], "repetition": [1, 2, 3], "feuillets": [[0.4, 4.67]], "d": 7.13, "e": 4.27},
    dickite: {"decalage": [0, 0, 0.5294], "repetition": [1, 2, 2], "feuillets": [[0.4, 4.7], [7.55, 11.85]], "d": 7.15, "e": 4.3},
    nacrite: {"decalage": [0, 0, 0.5419], "repetition": [1, 3, 2], "feuillets": [[0.4, 4.68], [7.58, 11.85]], "d": 7.18, "e": 4.28},
    lizardite: {"decalage": [0, 0, 0.0589], "repetition": [1, 3, 3], "feuillets": [[0.4, 4.72]], "d": 7.23, "e": 4.32},
    amesite: {"decalage": [0, 0, 0.5307], "repetition": [1, 2, 2], "feuillets": [[0.4, 4.71], [7.44, 11.71]], "d": 7.02, "e": 4.29},
    cronstedtite: {"decalage": [0, 0, 0.9358], "repetition": [1, 2, 3], "feuillets": [[0.4, 4.78]], "d": 7.1, "e": 4.38},
    nepouite: {"decalage": [0, 0, 0.0148], "repetition": [1, 2, 3], "feuillets": [[0.4, 4.44]], "d": 7.26, "e": 4.04},
    pyrophyllite: {"decalage": [0, 0, 0.3935], "repetition": [1, 2, 2], "feuillets": [[0.4, 6.83]], "d": 9.19, "e": 6.43},
    talc: {"decalage": [0, 0, 0.3914], "repetition": [1, 2, 2], "feuillets": [[0.4, 6.92]], "d": 9.35, "e": 6.52},
    montmorillonite: {"decalage": [0, 0, 0.0234], "repetition": [1, 2, 2], "feuillets": [[0.4, 6.94]], "d": 15.0, "e": 6.54},
    nontronite: {"decalage": [0, 0, 0.387], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.03]], "d": 9.6, "e": 6.63},
    hectorite: {"decalage": [0, 0, 0.849], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.04]], "d": 10.66, "e": 6.64},
    vermiculite: {"decalage": [0, 0, 0.8799], "repetition": [1, 2, 1], "feuillets": [[0.4, 7.05], [14.73, 21.38]], "d": 14.33, "e": 6.65},
    illite: {"decalage": [0, 0, 0.8732], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.02]], "d": 9.94, "e": 6.62},
    glauconite: {"decalage": [0, 0, 0.3728], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.05]], "d": 9.99, "e": 6.65},
    celadonite: {"decalage": [0, 0, 0.3776], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.22]], "d": 10.09, "e": 6.82},
    muscovite: {"decalage": [0, 0, 0.6849], "repetition": [1, 2, 1], "feuillets": [[0.4, 7.0], [10.4, 17.0]], "d": 10.0, "e": 6.6},
    biotite: {"decalage": [0, 0, 0.872], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.1]], "d": 10.09, "e": 6.7},
    phlogopite: {"decalage": [0, 0, 0.8677], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.07]], "d": 10.16, "e": 6.67},
    paragonite: {"decalage": [0, 0, 0.6914], "repetition": [1, 2, 1], "feuillets": [[0.4, 6.96], [10.02, 16.58]], "d": 9.62, "e": 6.56},
    lepidolite: {"decalage": [0, 0, 0.8698], "repetition": [1, 2, 2], "feuillets": [[0.4, 6.97]], "d": 9.97, "e": 6.57},
    margarite: {"decalage": [0, 0, 0.6955], "repetition": [1, 2, 1], "feuillets": [[0.4, 7.06], [9.93, 16.59]], "d": 9.53, "e": 6.66},
    annite: {"decalage": [0, 0, 0.8722], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.11]], "d": 10.09, "e": 6.71},
    zinnwaldite: {"decalage": [0, 0, 0.8723], "repetition": [1, 2, 2], "feuillets": [[0.4, 6.98]], "d": 9.92, "e": 6.58},
    clintonite: {"decalage": [0, 0, 0.8907], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.13]], "d": 9.64, "e": 6.73},
    clinochlore: {"decalage": [0, 0, 0.2607], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.04]], "d": 14.27, "e": 6.64},
    chamosite: {"decalage": [0, 0, 0.261], "repetition": [1, 2, 2], "feuillets": [[0.4, 6.99]], "d": 14.15, "e": 6.59},
    sudoite: {"decalage": [0, 0, 0.2626], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.05]], "d": 14.18, "e": 6.65},
    cookeite: {"decalage": [0, 0, 0.6332], "repetition": [1, 2, 1], "feuillets": [[0.4, 7.09], [14.55, 21.24]], "d": 14.15, "e": 6.69},
    franklinfurnaceite: {"decalage": [0, 0, 0.272], "repetition": [1, 2, 2], "feuillets": [[0.4, 7.44]], "d": 14.4, "e": 7.04}
  };

  // ── quelle structure pour quelle argile ─────────────────────────────────
  // [fichier, note] ; note = ce qu'il faut savoir quand la structure n'est pas celle de l'espèce elle-même
  const FIBRES = "Aucun espace interfoliaire : des rubans de feuillets 2:1 ménagent entre eux des canaux (eau zéolitique), vus ici de bout.";
  const ARGILES3D = {
    // espèces (ESPECES, pages #espece/<id>)
    kaolinite_e: ["kaolinite"], dickite: ["dickite"], nacrite: ["nacrite"],
    halloysite: ["kaolinite", "Aucune structure affinée pour l'halloysite, dont les feuillets s'enroulent en tubes. Feuillet montré : celui de la kaolinite (Bish 1993), à plat."],
    endellite: ["kaolinite", "L'endellite est une halloysite qui a conservé sa couche d'eau. Aucune structure affinée : feuillet montré, celui de la kaolinite (Bish 1993), à plat."],
    odinite: ["cronstedtite", "Structure non affinée pour l'odinite ; on montre la cronstedtite, autre argile 1:1 riche en fer."],
    chrysotile: ["lizardite", "Feuillets enroulés en fibres, sans maille plane : on montre la lizardite, le même feuillet à plat."],
    antigorite: ["antigorite", "Structure modulée de Capitani et Mellini (2004), polysome m = 17 : une maille = une onde complète de 43,5 Å ; la couche de magnésium ondule et la couche tétraédrique change de côté à chaque demi-onde."],
    lizardite: ["lizardite"],
    berthierine: ["cronstedtite", "Pas de structure affinée pour la berthiérine : on montre la cronstedtite, serpentine ferrifère."],
    greenalite: ["cronstedtite", "Pas de structure affinée pour la greenalite : on montre la cronstedtite, serpentine ferrifère."],
    amesite: ["amesite"], cronstedtite: ["cronstedtite"], nepouite: ["nepouite", "Modèle de Brindley et Wan (1975), hydrogènes non placés."],
    pyrophyllite: ["pyrophyllite"], talc_e: ["talc"],
    willemseite: ["talc", "Structure affinée récente absente pour la willemséite, talc nickelifère : on montre le talc."],
    minnesotaite: ["talc", "Pas de structure affinée pour la minnesotaïte, talc ferrifère : on montre le talc."],
    ferripyrophyllite: ["pyrophyllite", "Pas de structure affinée pour la ferripyrophyllite, pyrophyllite ferrifère : on montre la pyrophyllite."],
    montmorillonite: ["montmorillonite", "Feuillet : modèle de Viani et al. (2002)."],
    beidellite: ["montmorillonite", "Pas de structure affinée pour la beidellite : on montre la montmorillonite, smectite dioctaédrique voisine (sa charge tient aux octaèdres, celle de la beidellite aux tétraèdres)."],
    nontronite: ["nontronite", "Feuillet : modèle de Manceau et al. (1998), feuillet de fer."],
    saponite: ["hectorite", "Structure non affinée pour la saponite ; on montre l'hectorite échangée au césium, smectite trioctaédrique voisine."],
    hectorite: ["hectorite", "Feuillet : hectorite de Breu et al. (2003), dont le césium a été retiré."],
    stevensite: ["hectorite", "Structure non affinée pour la stevensite ; on montre l'hectorite échangée au césium, smectite trioctaédrique voisine."],
    sauconite: ["hectorite", "Structure non affinée pour la sauconite, smectite zincifère ; on figure l'hectorite échangée au césium, smectite trioctaédrique voisine."],
    volkonskoite: ["montmorillonite", "Pas de structure affinée pour la volkonskoïte, smectite chromifère : on montre la montmorillonite."],
    swinefordite: ["hectorite", "Pas de structure affinée pour la swinefordite, smectite lithinifère : on montre l'hectorite, autre smectite au lithium."],
    vermiculite_e: ["vermiculite", "Billes bleues : des molécules d'eau (oxygène au centre, hydrogènes non localisés) ; au centre de l'image, un Mg²⁺ entouré de six d'entre elles."],
    illite_e: ["illite", "Illite-1M de Gualtieri et al. (2008) : 0,65 K⁺ par demi-maille, un site sur trois reste vide (tous sont dessinés)."],
    glauconite_e: ["glauconite", "Modèle de Drits et al. (2010) : les sites octaédriques, en réalité occupés par Fe³⁺, Al et Mg, y sont notés Al."],
    celadonite: ["celadonite"],
    sericite: ["muscovite", "La séricite n'est que de la muscovite en paillettes microscopiques : même structure."],
    muscovite_e: ["muscovite"], biotite_e: ["biotite"], phlogopite: ["phlogopite"], paragonite: ["paragonite"],
    lepidolite: ["lepidolite"], margarite: ["margarite"],
    brammallite: ["paragonite", "Structure non affinée : la brammallite est une illite sodique ; on montre la paragonite, un mica sodique."],
    annite: ["annite"], zinnwaldite: ["zinnwaldite"], clintonite: ["clintonite"],
    clinochlore: ["clinochlore"], chamosite: ["chamosite"], sudoite: ["sudoite"], cookeite: ["cookeite"],
    franklinfurnaceite: ["franklinfurnaceite"],
    pennantite: ["clinochlore", "Pas de structure affinée pour la pennantite, chlorite manganésifère : on montre le clinochlore."],
    nimite: ["clinochlore", "Pas de structure affinée pour la nimite, chlorite nickelifère : on montre le clinochlore."],
    baileychlore: ["clinochlore", "Pas de structure affinée pour la baileychlore, chlorite zincifère : on montre le clinochlore."],
    donbassite: ["sudoite", "Structure non affinée pour la donbassite, chlorite entièrement dioctaédrique ; on montre la sudoïte, chlorite en partie dioctaédrique."],
    sepiolite_e: ["sepiolite", FIBRES], palygorskite: ["palygorskite", FIBRES],
    // fiches minéraux de la partie Minéraux (#mineral/<id>)
    kaolinite_m: ["kaolinite"], illite_m: ["illite"], smectites_m: ["montmorillonite"], chlorite_m: ["clinochlore"],
    // fiches argiles (#argile/<id>) : clé « fiche:<id> »
    "fiche:kaolinite": ["kaolinite"], "fiche:serpentines": ["lizardite", "On montre ici la lizardite (Mellini 1982), serpentine à feuillets plans."],
    "fiche:talc": ["talc", "On montre le talc (Perdikatsis et Burzlaff 1981) ; la pyrophyllite, sa version alumineuse, possède sa propre page d'espèce."],
    "fiche:smectites": ["montmorillonite", "Feuillet : modèle de montmorillonite de Viani et al. (2002)."],
    "fiche:vermiculite": ["vermiculite", "Billes bleues : des molécules d'eau (oxygène au centre, hydrogènes non localisés) ; au centre de l'image, un Mg²⁺ entouré de six d'entre elles."],
    "fiche:illite": ["illite", "Illite-1M de Gualtieri et al. (2008)."], "fiche:glauconite": ["glauconite", "Modèle de Drits et al. (2010) : les sites octaédriques, en réalité occupés par Fe³⁺, Al et Mg, y sont notés Al."],
    "fiche:chlorite": ["clinochlore", "Structure montrée : le clinochlore (Zanazzi et al. 2006), la chlorite la plus courante."],
    "fiche:sepiolite": ["sepiolite", FIBRES],
  };
  // 30/09/2026 : plus aucune argile sans 3D. Interstratifiés : empilements construits plus bas (INTERSTRAT) ; para-cristallins :
  // modèles construits par tools/modeles_argiles.py (imogolite, allophane) et kaolinite ferrique (hisingérite).
  const TUBE = "Tube ouvert aux deux extrémités : l'eau pénètre à l'intérieur comme entre les tubes.";
  Object.assign(ARGILES3D, {
    hisingerite: ["hisingerite", "Structure non affinée : le modèle de l'atlas reprend le feuillet 1:1 de la kaolinite, dans lequel Fe³⁺ occupe la place de Al. Dans la réalité, ces feuillets de 7 Å se courbent en sphères creuses (bouton « Structure »)."],
    imogolite: ["imogolite", "Vu de bout, un tube présente une période de 8,4 Å le long de son axe." + TUBE],
    allophane_e: ["allophane", "Sphère complète : environ 3,3 nm de diamètre aux oxygènes, 3,5 nm aux hydrogènes."],
    "fiche:allophane": ["allophane", "L'imogolite dispose de sa propre page d'espèce ; une sphère d'allophane complète mesure ≈ 3,3 nm aux oxygènes et 3,5 nm aux hydrogènes."],
    rectorite: ["paragonite"], corrensite: ["clinochlore"], tosudite: ["sudoite"], aliettite: ["talc"],
    hydrobiotite: ["biotite"], kaolinite_smectite: ["kaolinite"], "fiche:interstratifies": ["illite"],
  });
  COUCHES.hisingerite = Object.assign({}, COUCHES.kaolinite);

  // ce qui remplit l'espace interfoliaire, pour la phrase de la fiche argile
  const CONTENU = {
    kaolinite: "les OH d'un feuillet forment des liaisons hydrogène avec les O du feuillet voisin : l'espacement demeure fixe",
    serpentines: "liaisons hydrogène : l'espacement est fixe",
    talc: "entre eux, pas de cation : les feuillets sont neutres et restent unis par des forces de van der Waals, ce qui permet au talc de glisser sous le doigt",
    smectites: "cations (Ca²⁺, Na⁺) enveloppés d'eau : l'espacement dépend de l'humidité",
    vermiculite: "Mg²⁺ enveloppé de deux couches d'eau ; la forte charge des feuillets limite le gonflement",
    illite: "K⁺ non hydratés, installés dans les cavités des deux surfaces : l'espacement reste bloqué",
    glauconite: "K⁺ non hydratés : l'espacement est verrouillé",
    chlorite: "un feuillet d'hydroxyde Mg(OH)₂, relié par liaisons hydrogène : espacement immuable",
  };
  const fr = (x, n = 2) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: n });


  // ── argiles qui gonflent : états d'hydratation construits et ANIMÉS (29/09/2026) ──
  // Demandes : les formes hydratées du schéma 2D en 3D ; une animation qui montre l'eau arriver et repartir ; le gonflement
  // faible de l'illite et de la glauconite visible.
  // Le FEUILLET vient de la structure publiée ; l'ESPACE INTERFOLIAIRE est construit ici : d(001) et hauteurs des plans d'eau
  // publiés, positions dans le plan schématiques (grille compacte, une molécule pour ≈ 10 Å², écartée des cations). Deux
  // feuillets et un espace (trois feuillets pour l'illite et la glauconite), empilés droit (ceux d'une smectite sont en réalité
  // tournés au hasard). Supermaille 2a × 3b = 12 demi-mailles O10(OH)2 : charge ≈ 0,33 → 2 Ca²⁺ ou 4 Na⁺ par espace.
  // Eau liquide : molécules tirées au hasard (graine fixe) à la densité de l'eau, 0,0334 molécule par Å³ (1 g/cm³).
  const NA = 2, NB = 3, S0 = 1.2, EAU_LIQ = 0.0334;
  const rad = (x) => x * Math.PI / 180;
  function base3(m) {   // mêmes conventions que structures3d.js : a sur x, b dans le plan xy, normale aux feuillets = z
    const [a, b, c, al, be, ga] = m;
    const cx = c * Math.cos(rad(be)), cy = c * (Math.cos(rad(al)) - Math.cos(rad(be)) * Math.cos(rad(ga))) / Math.sin(rad(ga));
    return [[a, 0, 0], [b * Math.cos(rad(ga)), b * Math.sin(rad(ga)), 0], [cx, cy, Math.sqrt(Math.max(c * c - cx * cx - cy * cy, 0))]];
  }
  const cart = (B, f) => [0, 1, 2].map((k) => f[0] * B[0][k] + f[1] * B[1][k] + f[2] * B[2][k]);
  const lisse = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const seg = (u, a, b) => lisse((u - a) / (b - a));
  function alea(graine) { let s = graine >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // le feuillet publié, prêt à empiler (mis en cache par structure)
  const PREP = {};
  function preparer(base, couches) {
    if (PREP[base.id]) return PREP[base.id];
    const B = base3(base.maille);
    const [h0, h1] = couches.feuillets[0];
    const e = h1 - h0, dz = couches.decalage[2];
    const [a, b, , , , ga] = base.maille;
    const bx = b * Math.cos(rad(ga)), by = b * Math.sin(rad(ga));
    const feuil = [];
    base.atomes.forEach((at) => {
      if (["Ca", "Na", "Cs", "K", "Ow"].includes(at[0])) return;   // cations entre feuillets et eau : retirés
      let f = [at[1], at[2], (at[3] + dz) % 1];
      let p = cart(B, f);
      if (p[2] > h1 + 1) { f = [f[0], f[1], f[2] - 1]; p = cart(B, f); }
      if (p[2] < h0 - 1 || p[2] > h1 + 1) return;
      const Y = p[1] / by, X = (p[0] - Y * bx) / a;
      feuil.push({ el: at[0], X, Y, h: p[2] - h0, lab: at[4], occ: at[5] });
    });
    const A = NA * a, Bb = NB * b;
    const dist = (p, q) => {   // distance dans la supermaille (images périodiques dans le plan), p = [u, v, z]
      let dx = p[0] - q[0], dy = p[1] - q[1];
      dx -= Math.round(dx); dy -= Math.round(dy);
      return Math.hypot(dx * A + dy * Bb * Math.cos(rad(ga)), dy * Bb * Math.sin(rad(ga)), (p[2] || 0) - (q[2] || 0));
    };
    // creux hexagonaux de la surface, où se logent les cations : points les plus éloignés des O de surface
    const surf = [];
    feuil.filter((x) => x.el === "O" && x.h > e - 0.7).forEach((x) => {
      for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) surf.push([(x.X + i) / NA, (x.Y + j) / NB]);
    });
    const creux = [];
    for (let i = 0; i < 20; i++) for (let j = 0; j < 30; j++) {
      const q = [i / 20 / NA, j / 30 / NB];
      creux.push({ q, m: Math.min(...surf.map((s) => dist(q, s))) });
    }
    creux.sort((x, y) => y.m - x.m);
    const deux = [];
    creux.forEach((c) => { if (deux.length < 2 && deux.every((k) => dist(k, c.q) > 2.5)) deux.push(c.q); });
    const sites = [];
    for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) deux.forEach(([u, v]) => sites.push([u + i / NA, v + j / NB]));
    // contenu PUBLIÉ de l'espace interfoliaire (K⁺ des micas, feuillet d'hydroxyde des chlorites…), hauteurs mesurées depuis le
    // milieu de l'espace : sert aux interstratifiés, qui empilent tels quels les feuillets et l'espace d'une structure publiée
    const interfol = [], mi = e + (couches.d - e) / 2;
    base.atomes.forEach((at) => {
      let p = cart(B, [at[1], at[2], (at[3] + dz) % 1]);
      while (p[2] - h0 < 0) p = p.map((x, k) => x + B[2][k]);
      while (p[2] - h0 >= B[2][2]) p = p.map((x, k) => x - B[2][k]);
      const h = p[2] - h0;
      if (h <= e + 0.9 || h >= couches.d - 0.9) return;
      const Y = p[1] / by, X = (p[0] - Y * bx) / a;
      interfol.push({ el: at[0], X, Y, dz: h - mi, lab: at[4], occ: at[5] });
    });
    return (PREP[base.id] = { base, e, d: couches.d, feuil, A, Bb, ga, dist, sites, interfol });
  }
  function choisir(P, n) {   // n sites aussi éloignés que possible les uns des autres
    if (!n) return [];
    const choix = [P.sites[0]];
    while (choix.length < Math.min(n, P.sites.length)) {
      let mieux = null, dmax = -1;
      P.sites.forEach((t) => { const m = Math.min(...choix.map((c) => P.dist(c, t))); if (m > dmax) { dmax = m; mieux = t; } });
      choix.push(mieux);
    }
    return choix;
  }

  // contenu d'UN espace interfoliaire dans un état donné ; positions verticales mesurées depuis le plan médian (dz)
  // etat = { d, cation, n, eau: 0 | 1 | 2 | "liquide", plan (écart des plans d'eau au cation, 2 couches) }
  function espace(P, etat) {
    const g = etat.d - P.e;
    const cats = [], eaux = [];
    const libre = (q, dMin) => eaux.every((w) => P.dist(q, [w.u, w.v, w.dz]) >= dMin) && cats.every((c) => P.dist(q, [c.u, c.v, c.dz]) >= 2.3);
    // coq : molécule de la couronne d'un cation (dessinée en bleu plus soutenu, « eau autour d'un cation », G.4)
    const ajEau = (q, coq) => eaux.push(coq ? { u: q[0], v: q[1], dz: q[2], coq: true } : { u: q[0], v: q[1], dz: q[2] });
    const dMO = { Ca: 2.4, Na: 2.4, Mg: 2.07, K: 2.9 }[etat.cation] || 2.4;
    const coquille = (c, dv) => {   // six molécules d'eau en octaèdre autour d'un cation
      const rh = Math.sqrt(dMO * dMO - dv * dv);
      for (let s = 0; s < 6; s++) {
        const ang = rad(s * 60 + 30), haut = s % 2 ? -dv : dv;
        const y = rh * Math.sin(ang) / (P.Bb * Math.sin(rad(P.ga))), x = (rh * Math.cos(ang) - y * P.Bb * Math.cos(rad(P.ga))) / P.A;
        ajEau([c.u + x, c.v + y, c.dz + haut], true);
      }
    };
    const tirage = alea(13);
    const grille = (dz, ou, ov) => {
      const nA = 3 * NA / 2, nB = 3 * NB;   // ≈ 3,45 × 3,0 Å : une molécule pour ≈ 10 Å²
      for (let v = 0; v < nB; v++) for (let u = 0; u < nA; u++) {
        const q = [(u + (v % 2) * 0.5 + ou) / nA, (v + ov) / nB, dz];
        // plans incomplets (remplissage < 1) : une partie des places reste vide, tirée au hasard (graine fixe)
        if (tirage() < (etat.remplissage ?? 1) && libre(q, 2.6)) ajEau(q);
      }
    };
    const pos = choisir(P, etat.n);
    if (etat.eau === "liquide") {
      pos.forEach(([u, v], i) => {
        const c = { el: etat.cation, u, v, dz: (g - 5) * (i / Math.max(1, pos.length - 1) - 0.5) };
        cats.push(c); coquille(c, dMO / Math.sqrt(3));
      });
      const R = alea(7), n = Math.round(P.A * P.Bb * Math.sin(rad(P.ga)) * (g - 3.2) * EAU_LIQ);
      let essais = 0;
      while (eaux.length < n + 6 * pos.length && essais++ < 60000) {
        const q = [R(), R(), (R() - 0.5) * (g - 3.2)];
        if (libre(q, 2.6)) ajEau(q);
      }
    } else {
      pos.forEach(([u, v]) => cats.push({ el: etat.cation, u, v, dz: 0 }));
      if (etat.eau === 1) {
        grille(0, 0, 0);
        // une seule couche : pas de couronne complète, mais les molécules au contact d'un cation en font partie
        eaux.forEach((w) => { if (cats.some((c) => P.dist([w.u, w.v, w.dz], [c.u, c.v, c.dz]) <= dMO + 0.45)) w.coq = true; });
      }
      if (etat.eau === 2) {
        const p = etat.plan || 1.2;
        cats.forEach((c) => coquille(c, p));
        grille(p, 0, 0);
        grille(-p, 0.5, 0.5);
      }
    }
    return { d: etat.d, cats, eaux };
  }

  // empilement : feuillets + espaces (chaque élément de `esp` porte d, cats [{el,u,v,dz,s}], eaux [{u,v,dz,s}], s = échelle,
  // et parfois `autres` : contenu publié [{el,X,Y,dz,lab,occ}], répété sur la supermaille).
  // `types` (interstratifiés) : feuillet de chaque niveau, du bas vers le haut (P préparés) ; par défaut, P partout.
  function assembler(P, esp, note, types) {
    const T = (k) => (types && types[k]) || P;
    const atomes = [];
    const pose = (el, u, v, h, lab, occ, s) => {
      const r = [((u % 1) + 1) % 1, ((v % 1) + 1) % 1, 0];
      const a = [el, r[0], r[1], h, lab, occ || null];
      if (s !== undefined && s < 0.999) a.push({ echelle: s });
      atomes.push(a);
    };
    const bas = [S0 + 0.4];
    esp.forEach((x) => bas.push(bas[bas.length - 1] + x.d));
    const C = bas[bas.length - 1] + T(bas.length - 1).e + 4;
    bas.forEach((z, k) => {
      for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++)
        T(k).feuil.forEach((x) => pose(x.el, (x.X + i) / NA, (x.Y + j) / NB, z + x.h, x.lab, x.occ));
    });
    esp.forEach((x, k) => {
      const mi = bas[k] + (x.d + T(k).e) / 2;
      x.cats.forEach((c) => { if (c.s === undefined || c.s > 0.02) pose(c.el, c.u, c.v, mi + c.dz, c.el, null, c.s); });
      x.eaux.forEach((w) => { if (w.s === undefined || w.s > 0.02) pose(w.coq ? "Oh" : "Ow", w.u, w.v, mi + w.dz, "H2O", null, w.s); });
      (x.autres || []).forEach((y) => {
        for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) pose(y.el, (y.X + i) / NA, (y.Y + j) / NB, mi + y.dz, y.lab, y.occ);
      });
    });
    atomes.forEach((a) => { a[3] /= C; });
    const b = P.base;
    return { id: b.id + "-modele", nom: b.nom, formule: b.formule, groupe: "P 1", source: b.source,
      maille: [P.A, P.Bb, C, 90, 90, P.ga], atomes, repetition: [1, 1, 1], decalage: [0, 0, 0],
      cote: { feuillets: bas.map((z, k) => [z, z + T(k).e]) }, etatNote: note };
  }

  // passage d'un état à un autre, u de 0 à 1 : les feuillets s'écartent (ou se rapprochent), l'eau entre par les bords
  // du cristal (ou en sort), les cations montent ou descendent avec le plan médian
  function transition(P, A, B) {
    const paires = A.map((a, k) => {
      const b = B[k];
      const ouvre = b.d > a.d + 0.05, ferme = b.d < a.d - 0.05;
      // eau : chaque molécule d'arrivée reprend la plus proche du départ (≤ 3,5 Å), les autres entrent ou sortent
      const libres = a.eaux.map((w, i) => i);
      const bouge = [], entre = [];
      b.eaux.forEach((w) => {
        let mi = -1, dm = 3.5;
        libres.forEach((i) => { const x = a.eaux[i], dd = P.dist([x.u, x.v, x.dz], [w.u, w.v, w.dz]); if (dd < dm) { dm = dd; mi = i; } });
        if (mi >= 0) { bouge.push([a.eaux[mi], w]); libres.splice(libres.indexOf(mi), 1); } else entre.push(w);
      });
      const sort = libres.map((i) => a.eaux[i]);
      const memeCat = a.cats.length === b.cats.length && a.cats.every((c, i) => c.el === b.cats[i].el);
      return { a, b, ouvre, ferme, bouge, entre, sort, memeCat };
    });
    const bord = (v) => (v < 0.5 ? 0 : 0.999);
    // plusieurs espaces qui changent : l'un après l'autre (décalage de 0,15), chacun sur sa propre fenêtre de temps
    const changent = paires.map((p, k) => (p.a.d !== p.b.d || p.bouge.length !== p.a.eaux.length || p.entre.length || !p.memeCat ? k : -1)).filter((k) => k >= 0);
    const dec = 0.15, fen = 1 - dec * Math.max(0, changent.length - 1);
    return (U) => paires.map(({ a, b, ouvre, ferme, bouge, entre, sort, memeCat }, k) => {
      const r = changent.indexOf(k);
      const u = r < 0 ? U : Math.min(1, Math.max(0, (U - r * dec) / fen));
      const uL = ouvre ? seg(u, 0, 0.5) : ferme ? seg(u, 0.45, 1) : seg(u, 0, 1);
      const d = a.d + (b.d - a.d) * uL;
      const cats = memeCat
        ? a.cats.map((c, i) => ({ el: c.el, u: c.u, v: c.v, dz: c.dz + (b.cats[i].dz - c.dz) * uL }))
        : a.cats.map((c) => Object.assign({}, c, { s: 1 - seg(u, 0.05, 0.4) }))
          .concat(b.cats.map((c) => Object.assign({}, c, { s: seg(u, 0.55, 0.9) })));
      const eaux = [];
      const uW = seg(u, 0.1, 0.9);
      bouge.forEach(([x, y]) => {
        let dv = y.v - x.v, du = y.u - x.u; dv -= Math.round(dv); du -= Math.round(du);
        eaux.push({ u: x.u + du * uW, v: x.v + dv * uW, dz: x.dz + (y.dz - x.dz) * uW, coq: uW < 0.5 ? x.coq : y.coq });
      });
      sort.forEach((w) => {   // ressort par le bord le plus proche, les plus proches du bord d'abord
        const e = bord(w.v), t0 = 0.45 * Math.abs(w.v - e) / 0.5, p = seg(u, t0, t0 + 0.3);
        eaux.push({ u: w.u, v: w.v + (e - w.v) * p, dz: w.dz, s: 1 - seg(p, 0.6, 1), coq: w.coq });
      });
      entre.forEach((w) => {   // entre par le bord le plus proche, les plus proches du bord d'abord
        const e = bord(w.v), t0 = (ouvre ? 0.2 : 0.1) + 0.5 * Math.abs(w.v - e) / 0.5, p = seg(u, t0, t0 + 0.28);
        if (p > 0) eaux.push({ u: w.u, v: e + (w.v - e) * p, dz: w.dz, s: seg(p, 0, 0.35), coq: w.coq });
      });
      return { d, cats, eaux, autres: a.autres };
    });
  }

  // ── les modèles : smectites, vermiculite, illite et glauconite (feuillets gonflants intercalés) ──
  const SMECTITES = { montmorillonite: true, hectorite: true, nontronite: true };
  const NOTE_MODELE = " Entre les feuillets, on suit le modèle de l'atlas : épaisseurs et hauteurs publiées, positions schématiques dans le plan, feuillets superposés bien droits.";
  const ETATS_SMECTITE = [
    { nom: "Sèche", d: 9.7, cation: "Ca", n: 2, eau: 0,
      note: "Sèche : sans eau, les feuillets se touchent presque, d(001) ≈ 9,7 Å (Karaborni et al. 1996 ; 9,69 Å mesurés par Gournis et al. 2008 sur une montmorillonite chauffée à 300 °C)." },
    { nom: "1 couche d'eau", d: 12.6, cation: "Ca", n: 2, eau: 1,
      note: "Une couche d'eau, les cations en son milieu : d(001) = 12,5 à 12,9 Å selon le cation et l'humidité (Ferrage et al. 2005)." },
    { nom: "2 couches d'eau", d: 15.6, cation: "Ca", n: 2, eau: 2,
      note: "Deux couches d'eau, à 1,2 Å de part et d'autre des cations : chaque Ca²⁺ est entouré de six molécules d'eau ; d(001) = 15,5 à 16 Å (Ferrage et al. 2005). C'est l'état d'une smectite calcique à l'air humide." },
    { nom: "Dans l'eau", d: 40, cation: "Na", n: 4, eau: "liquide",
      note: "Dans l'eau, une smectite sodique se dilate couche par couche jusqu'à ≈ 19 Å, puis se dissocie brutalement à 40 Å et plus (Norrish 1954 ; Karaborni et al. 1996). Une smectite calcique plafonne, elle, vers 19 Å (Norrish 1954). L'eau liquide est disposée au hasard, à la densité de l'eau, Na⁺ étant entourés de six molécules ; le passage de Ca²⁺ à Na⁺ relève d'un échange de cations, non d'un effet de l'eau." },
  ];
  const NOMS_ETATS = ETATS_SMECTITE.map((e) => e.nom);
  // vermiculite magnésienne : sèche 9,02 Å (Walker 1956), une couche d'eau 11,51 Å (Weiss et al. 1994), deux couches 14,33 Å
  // (structure de Shirozu et Bailey 1966 : plans d'eau à ≈ 1,17 Å du Mg²⁺)
  const ETATS_VERMICULITE = [
    { d: 9.02, cation: "Mg", n: 4, eau: 0, note: "Séchée par chauffage : privés d'eau, les feuillets entrent en contact, d(001) = 9,02 Å, comme dans le talc (Walker 1956)." },
    { d: 11.51, cation: "Mg", n: 4, eau: 1, note: "Avec une seule couche d'eau entourant les Mg²⁺, d(001) = 11,51 Å ; cet état apparaît vers 150 °C (Weiss, Valvoda et Chmielová 1994)." },
    { d: 14.33, cation: "Mg", n: 4, eau: 2, plan: 1.17, remplissage: 0.62, note: "À l'air humide, état naturel : deux couches d'eau, Mg²⁺ entouré de six molécules, plans d'eau légèrement incomplets (sites occupés à 62 %), d(001) = 14,33 Å (Shirozu et Bailey 1966 ; 14,36 Å chez Walker 1956)." },
    { d: 14.81, cation: "Mg", n: 4, eau: 2, plan: 1.24, remplissage: 1, note: "Dans l'eau, les deux plans d'eau se complètent et l'espacement passe de 14,36 à 14,81 Å (Walker 1956, repris par Weiss et al. 1994) ; pas plus : sa charge forte retient les feuillets et l'empêche de s'ouvrir comme une smectite." },
  ];
  // illite et glauconite : l'espace verrouillé par K⁺ ne bouge jamais ; leur gonflement faible vient des quelques espaces qui
  // ont perdu leur potassium (feuillets gonflants intercalés) : ceux-là se comportent comme une smectite calcique
  const GONFLE_FAIBLE = { illite: { d: 9.94, nK: 8, nom: "une illite" }, glauconite: { d: 9.99, nK: 10, nom: "une glauconite" } };
  const NOTE_FAIBLE = (x, plus) => `${x.nom[0].toUpperCase() + x.nom.slice(1)} reste rarement pure : une partie de ses espaces interfoliaires ont perdu leur potassium et se conduisent en smectite, ce qui explique son gonflement modeste.` + (plus
    ? "Ici, cinq feuillets : sur les quatre espaces, trois sont verrouillés par K⁺ (≈ 10 Å) et ne bougent jamais ; un seul, sans potassium, gonfle."
    : "Trois feuillets ici : en bas, un espace verrouillé par K⁺ (≈ 10 Å), immobile ; au-dessus, un espace sans potassium, gonflant.");
  const ETATS_FAIBLE = ETATS_SMECTITE.slice(0, 3).concat([{ d: 19, cation: "Ca", n: 2, eau: "liquide",
    note: "Immergé, l'espace calcique sans potassium s'élargit jusqu'à ≈ 19 Å (3 à 4 couches d'eau), sans davantage : un espace calcique ne gonfle pas indéfiniment (Norrish 1954). L'espace verrouillé par K⁺, lui, ne s'ouvre pas." }]);

  // état i → liste des espaces ; note
  // halloysite : une seule couche d'eau possible (≈ 10 Å) ; séchée, elle se referme à ≈ 7,2 Å pour toujours
  // (halloysite-(10 Å) et halloysite-(7 Å), Joussein et al. 2005)
  const HALLOYSITE = { halloysite: true, endellite: true };
  const ETATS_HALLOYSITE = [
    { d: 7.2, n: 0, eau: 0, note: "Sèche : l'eau est partie et les feuillets se referment à ≈ 7,2 Å — définitivement : une halloysite séchée ne reprend plus son eau (halloysite-(7 Å) ; Joussein et al. 2005)." },
    { d: 10.0, n: 0, eau: 1, note: "Une couche d'eau entre les feuillets : ≈ 10 Å, l'halloysite fraîche (halloysite-(10 Å), ou endellite ; Joussein et al. 2005). Deux molécules d'eau par Al₂Si₂O₅(OH)₄." },
    { d: 10.0, n: 0, eau: 1, note: "Une seule couche d'eau seulement : l'halloysite ne retient qu'environ 10 Å." },
    { d: 10.0, n: 0, eau: 1, note: "Immergée, l'halloysite fraîche garde sa couche d'eau (≈ 10 Å) ; séchée, elle reste à 7,2 Å." },
  ];

  // « plusieurs feuillets » : trois espaces empilés (quatre pour l'illite et la glauconite, dont un seul sans potassium)
  const NOTE_PLUS = " Plusieurs feuillets : chaque espace se comporte comme celui du modèle, mais pas tous en même temps — dans un même cristal, des espaces à une et à deux couches d'eau coexistent (Ferrage et al. 2005) ; l'animation les fait changer l'un après l'autre.";
  function modele(fichier, cle) {
    const fois = (x, plus) => (plus ? [x, x, x] : [x]);
    if (HALLOYSITE[cle]) return { etats: ETATS_HALLOYSITE, espaces: (P, i, plus) => fois(espace(P, ETATS_HALLOYSITE[i]), plus),
      note: (i) => ETATS_HALLOYSITE[i].note };
    if (SMECTITES[fichier]) return { etats: ETATS_SMECTITE, espaces: (P, i, plus) => fois(espace(P, ETATS_SMECTITE[i]), plus),
      note: (i) => ETATS_SMECTITE[i].note };
    if (fichier === "vermiculite") return { etats: ETATS_VERMICULITE, espaces: (P, i, plus) => fois(espace(P, ETATS_VERMICULITE[i]), plus),
      note: (i) => ETATS_VERMICULITE[i].note + " Feuillet : vermiculite de Shirozu et Bailey (1966)." };
    const f = GONFLE_FAIBLE[fichier];
    if (f) return { etats: ETATS_FAIBLE,
      espaces: (P, i, plus) => {
        const K = espace(P, { d: f.d, cation: "K", n: f.nK, eau: 0 }), S = espace(P, ETATS_FAIBLE[i]);
        return plus ? [K, K, S, K] : [K, S];
      },
      note: (i, plus) => NOTE_FAIBLE(f, plus) + " " + ETATS_FAIBLE[i].note.replace(/^[^:]*: /, "Espace sans potassium :") };
    return null;
  }
  // ── interstratifiés (30/09/2026 : « que toutes les argiles aient une structure 3D ») ──
  // Aucune structure affinée : l'atlas EMPILE les feuillets de deux structures publiées, chacun avec son espace. Espace après un
  // feuillet A : celui de la structure publiée de A, tel quel (Na⁺ ou K⁺ d'un mica, feuillet d'hydroxyde d'une chlorite, rien
  // pour le talc et la kaolinite) ; après un feuillet B : l'espace construit d'une smectite calcique (ou d'une vermiculite), qui
  // suit les quatre états. Les feuillets de B sont ramenés à la maille de A dans le plan (écarts ≤ 2 %).
  // un / plus : suite des feuillets de bas en haut, pour « 1 maille » et « 2 × 2 ».
  const NOTE_IS = " Modèle de l'atlas : aucune structure affinée n'existe pour un interstratifié ; feuillets repris de structures publiées, empilés droit (dans la réalité, souvent tournés au hasard), positions de l'eau schématiques. Espacements mesurés : Moore et Reynolds (1997).";
  const INTERSTRAT = {
    rectorite: { A: "paragonite", B: "montmorillonite", un: "ABA", plus: "ABABA", noms: ["mica", "smectite"], regulier: true,
      note: "Rectorite : un feuillet de mica sodique, un feuillet de smectite, en alternance stricte. Mica : structure de la paragonite (Lin et Bailey 1984), Na⁺ entre ses feuillets ; smectite : feuillet de la montmorillonite (Viani et al. 2002), Ca²⁺ et eau entre ses feuillets. La période (mica + smectite) donne un pic à ≈ 24 à 25 Å à l'air." },
    corrensite: { A: "clinochlore", B: "hectorite", un: "ABA", plus: "ABABA", noms: ["chlorite", "smectite"], regulier: true,
      note: "Corrensite : un feuillet de chlorite, un feuillet de smectite trioctaédrique, en alternance stricte. Chlorite : clinochlore (Zanazzi et al. 2006) avec son feuillet d'hydroxyde ; smectite : feuillet de l'hectorite (Breu et al. 2003). Période ≈ 29 Å à l'air, ≈ 24 Å chauffée." },
    tosudite: { A: "sudoite", B: "montmorillonite", un: "ABA", plus: "ABABA", noms: ["chlorite", "smectite"], regulier: true,
      note: "Tosudite : un feuillet de chlorite dioctaédrique, un feuillet de smectite dioctaédrique, en alternance stricte. Chlorite : sudoïte (Eggleton et Bailey 1967) avec son feuillet d'hydroxyde ; smectite : feuillet de la montmorillonite (Viani et al. 2002). Période ≈ 29 à 30 Å à l'air." },
    aliettite: { A: "talc", B: "hectorite", un: "ABA", plus: "ABABA", noms: ["talc", "smectite"], regulier: true,
      note: "Aliettite : un feuillet de talc, un feuillet de saponite, en alternance stricte. Talc : Perdikatsis et Burzlaff (1981), rien entre ses feuillets ; smectite trioctaédrique : feuillet de l'hectorite (Breu et al. 2003). Période ≈ 24 à 25 Å à l'air." },
    hydrobiotite: { A: "biotite", B: "vermiculite", un: "ABA", plus: "ABABA", noms: ["biotite", "vermiculite"], regulier: true, vermiculite: true,
      note: "Hydrobiotite : un feuillet de biotite, un feuillet de vermiculite, en alternance stricte — la biotite a perdu son potassium un espace sur deux. Biotite : Brigatti et Davoli (1990), K⁺ entre ses feuillets ; vermiculite : Shirozu et Bailey (1966), Mg²⁺ et eau. Période ≈ 24 Å à l'air." },
    kaolinite_smectite: { A: "kaolinite", B: "montmorillonite", un: "ABA", plus: "AABABBA", noms: ["kaolinite", "smectite"],
      note: "Kaolinite/smectite : feuillets 1:1 de kaolinite (Bish 1993) et feuillets 2:1 de smectite (montmorillonite, Viani et al. 2002) mêlés AU HASARD dans la même pile — pas de période, donc pas d'espacement basal unique. « 2 × 2 » montre une suite tirée au hasard." },
    "fiche:interstratifies": { A: "illite", B: "montmorillonite", un: "ABA", plus: "ABBABA", noms: ["illite", "smectite"],
      note: "Illite/smectite désordonné : feuillets d'illite (Gualtieri et al. 2008, K⁺ entre eux) et de smectite (montmorillonite, Viani et al. 2002, Ca²⁺ et eau) mêlés au hasard, à peu près moitié-moitié. Au fil de l'enfouissement, la part d'illite augmente et l'empilement s'ordonne (R1, puis R3)." },
  };
  const ETATS_IS = ETATS_SMECTITE.slice(0, 3).concat([{ d: 19, cation: "Ca", n: 2, eau: "liquide" }]);
  const NOTES_IS = [
    "À l'état sec, les espaces de smectite se referment à ≈ 9,7 Å, tandis que les autres demeurent inchangés.",
    "Une couche d'eau dans les espaces de smectite : ≈ 12,6 Å ; les autres demeurent inchangés.",
    "Deux couches d'eau dans les espaces de smectite, à l'air humide : ≈ 15,6 Å ; les autres demeurent inchangés.",
    "Dans l'eau, un espace de smectite calcique s'ouvre jusqu'à ≈ 19 Å et pas davantage (Norrish 1954) ; les autres demeurent inchangés.",
  ];
  function interstratConstruit(cle, i, plus) {
    const k = cle + "|" + i + "|" + (plus ? 1 : 0);
    if (!CACHE[k]) {
      const X = INTERSTRAT[cle], D = Structure3D.donnees;
      const PA = preparer(D[X.A], COUCHES[X.A]), PB = preparer(D[X.B], COUCHES[X.B]);
      const etat = (X.vermiculite ? ETATS_VERMICULITE : ETATS_IS)[i];
      const seq = (plus ? X.plus : X.un).split("");
      const types = seq.map((t) => (t === "A" ? PA : PB));
      const pub = { d: PA.d, cats: [], eaux: [], autres: PA.interfol }, sp = espace(PB, etat);
      const esp = seq.slice(0, -1).map((t) => (t === "A" ? pub : sp));
      const note = X.note + " " + (X.vermiculite ? etat.note.replace(/^([^:]*?) ?: /, "$1, espaces de vermiculite : ") : NOTES_IS[i]) + NOTE_IS;
      CACHE[k] = { P: PA, PB, esp, types, note, noms: seq.slice(0, -1).map((t) => X.noms[t === "A" ? 0 : 1]) };
    }
    return CACHE[k];
  }
  function interstratAssemble(cle, x, esp, note) {
    const s = assembler(x.P, esp, note, x.types);
    s.cote.noms = x.noms;
    if (INTERSTRAT[cle].regulier) s.cote.fleche = [0, 2]; else s.cote.fleche = false;
    return s;
  }

  const CACHE = {};
  function etatConstruit(fichier, base, couches, i, plus, cleArg) {
    const cle = fichier + (HALLOYSITE[cleArg] ? "-h" : "") + "|" + i + "|" + (plus ? 1 : 0);
    if (!CACHE[cle]) {
      const P = preparer(base, couches), M = modele(fichier, cleArg);
      CACHE[cle] = { P, esp: M.espaces(P, i, plus), note: M.note(i, plus) + NOTE_MODELE + (plus && !GONFLE_FAIBLE[fichier] ? NOTE_PLUS : "") };
    }
    return CACHE[cle];
  }

  // ── les mêmes boutons sur TOUTES les argiles (demande du 29/09 : « sinon on pense que c'est manquant ») ──
  // Là où l'eau n'entre pas entre les feuillets, les quatre états montrent la même structure et une phrase dit pourquoi.
  const FAMILLE = { kaolinite: "11", dickite: "11", nacrite: "11", lizardite: "11", amesite: "11", cronstedtite: "11", nepouite: "11",
    pyrophyllite: "neutre", talc: "neutre",
    celadonite: "mica", muscovite: "mica", biotite: "mica", phlogopite: "mica", paragonite: "mica",
    lepidolite: "mica", margarite: "mica", annite: "mica", zinnwaldite: "mica", clintonite: "mica",
    clinochlore: "chlorite", chamosite: "chlorite", sudoite: "chlorite", cookeite: "chlorite", franklinfurnaceite: "chlorite",
    sepiolite: "fibre", palygorskite: "fibre", hisingerite: "11", antigorite: "11", imogolite: "tube", allophane: "sphere" };
  const SANS_EAU = {
    "11": "Entre les feuillets, rien ne varie avec l'eau : ils sont retenus par des liaisons hydrogène que l'eau ne pénètre pas, si bien que l'espacement reste le même, sec ou immergé. L'eau ne se fixe que sur les faces et les bords du cristal (vue « Structure »).",
    neutre: "Entre les feuillets, rien ne varie avec l'eau : neutres, sans cation à hydrater entre eux, ils ne laissent pas l'eau entrer ; l'espacement reste le même, sec ou immergé. Les faces, dépourvues de charge, repoussent l'eau : seuls les bords la retiennent (vue « Structure »).",
    mica: "Entre les feuillets, l'eau ne change rien : les cations (K⁺, Na⁺ ou Ca²⁺ selon l'espèce) ne s'hydratent pas et verrouillent l'empilement ; espacement identique, sec ou immergé. L'eau ne se fixe que sur les faces et les bords (vue « Structure »).",
    chlorite: "Entre les feuillets, l'eau ne modifie rien : un feuillet d'hydroxyde occupe l'espace et soude l'ensemble ; l'espacement demeure le même. L'eau se fixe seulement sur faces et bords (vue « Structure »).",
    fibre: "L'eau ne change rien : elle s'insinue dans les canaux puis en sort sans écarter les rubans.",
    tube: "L'eau ne modifie rien : elle pénètre le tube et les intervalles entre tubes, sans les déformer.",
    sphere: "L'eau ne change rien : elle pénètre la sphère par les perforations de sa paroi et en ressort sans la déformer.",
  };
  const SANS_EAU_CLE = {};
  const publiee = (b, c, note, plus) => Object.assign({}, b,
    c ? { decalage: c.decalage, repetition: plus ? [c.repetition[0], c.repetition[1] * 2, c.repetition[2] * 2] : c.repetition, cote: { feuillets: c.feuillets } }
      : { repetition: b.particule ? (plus ? [1, 1, 2] : [1, 1, 1]) : plus ? [2, 2, 2] : [1, 1, 1] }, { etatNote: note });

  // « 2 × 2 » : deux fois plus de mailles dans le plan (le long de b, horizontal en vue « selon a ») et plusieurs feuillets
  const deux = (s, plus) => (plus ? Object.assign(s, { repetition: [s.repetition[0], s.repetition[1] * 2, s.repetition[2]] }) : s);
  function entree(cle) {
    const [fichier, note] = ARGILES3D[cle];
    const c = COUCHES[fichier];
    const e = { fichier, mode: "polyedres", rotation: true,
      echelles: [["1", "1 maille"], ["2", "2 × 2"], ["s", "Structure"], ["e", "Vue d'ensemble"]] };
    const X = INTERSTRAT[cle];
    if (X) {
      return Object.assign(e, { fichiers: [X.B], vue: { axe: "a" }, etatDefaut: 2,
        etats: NOMS_ETATS.map((nom, i) => ({ nom, construire: (b, plus) => {
          const x = interstratConstruit(cle, i, plus);
          return deux(interstratAssemble(cle, x, x.esp, x.note), plus);
        } })),
        transition: (b, i, j, plus) => {
          const x = interstratConstruit(cle, i, plus), y = interstratConstruit(cle, j, plus);
          const f = transition(x.PB, x.esp, y.esp);
          return (u) => deux(interstratAssemble(cle, x, f(u), ""), plus);
        },
        note: "Bandes bleues : les espaces entre les feuillets ;" + (X.regulier ? "flèche : la période de l'alternance (un feuillet de chaque)." : "aucune flèche : sans alternance régulière, il n'existe pas d'espacement basal unique.") });
    }
    if (fichier === "allophane") e.echelles = [["1", "1 sphère"], ["e", "Vue d'ensemble"]];
    if (fichier === "imogolite") Object.assign(e, { fichiers: ["imogolite_faisceau"], fichierPlus: "imogolite_faisceau",
      echelles: [["1", "1 tube"], ["2", "2 × 2 tubes"], ["s", "Structure"], ["e", "Vue d'ensemble"]] });
    if (fichier === "antigorite") Object.assign(e, { vue: { axe: "b" } });
    const M = c && modele(fichier, cle);
    // vue de départ « selon a » (bouton allumé) : les feuillets sont horizontaux et tournent sur leur axe
    if (M) Object.assign(e, { vue: { axe: "a" }, etatDefaut: cle === "halloysite" ? 0 : cle === "endellite" ? 1 : 2,
      etats: NOMS_ETATS.map((nom, i) => ({ nom, construire: (b, plus) => {
        const x = etatConstruit(fichier, b, c, i, plus, cle);
        return deux(assembler(x.P, x.esp, x.note), plus);
      } })),
      // animation entre deux états (moteur : option `transition`)
      transition: (b, i, j, plus) => {
        const x = etatConstruit(fichier, b, c, i, plus, cle), y = etatConstruit(fichier, b, c, j, plus, cle);
        const f = transition(x.P, x.esp, y.esp);
        return (u) => deux(assembler(x.P, f(u), ""), plus);
      } });
    else {
      const sansEau = SANS_EAU_CLE[cle] || SANS_EAU[FAMILLE[fichier]] || "";
      Object.assign(e, { etatDefaut: 0, etats: NOMS_ETATS.map((nom) => ({ nom, construire: (b, plus) => publiee(b, c, sansEau, plus) })) },
        c ? { vue: { axe: "a" } } : FAMILLE[fichier] === "fibre" ? { vue: { axe: "c" }, rotationAxe: "b" }
          : FAMILLE[fichier] === "tube" ? { vue: { axe: "c", inclinaison: [-22, 0] }, rotationAxe: "b" }
          : fichier === "antigorite" ? { vue: { axe: "b" } } : { vue: { axe: "a", inclinaison: [14, -20] }, rotationAxe: "b" });
    }
    if (note) e.noteEspece = note;   // repris sous la vue « Structure » (argiles-particules.js)
    const texte = c ? "Bande bleue : l'espace interfoliaire ; flèche : l'espacement basal d(001)." : "";
    const n = [texte, note].filter(Boolean).join(" ");
    if (n) e.note = n;
    return e;
  }
  if (window.Structure3D) Object.keys(ARGILES3D).forEach((cle) => Structure3D.completer(cle, entree(cle)));

  // ── carte de la fiche argile ─────────────────────────────────────────────
  function carte(a) {
    const cle = "fiche:" + a.id;
    if (!ARGILES3D[cle]) return "";
    // tout ce qui suit la vue va dans son volet « Maille et description » (02/10/2026)
    const vue = (apres = "") => `<div data-s3d="${cle}" data-s3d-source="bas"><template class="s3d-apres">${apres}<p class="page-source" data-s3d-ref="${cle}"></p></template></div>`;
    const aide = "Un glissement fait tourner la vue, et un double-clic la remet à son point de départ. « Structure » offre un cristal entier, détaillé atome par atome (tube, plaquette, fibre…), tandis que « Vue d'ensemble » donne la forme de la particule au nanomètre près.";
    if (a.id === "interstratifies") return `<div class="card" id="eb-3d"><h2>L'espacement basal d(001)</h2>
      <p class="sub">Ici, deux sortes de feuillets s'alternent au sein d'un même cristal : illite (≈ 10 Å, verrouillée par
      K⁺) et smectite (≈ 15 Å, avec deux couches d'eau), disposées au hasard. L'écart d'un feuillet au suivant n'est donc plus constant, et
      le premier pic de diffraction ne livre pas un vrai d(001). Aucune structure affinée n'existe : la vue est un empilement bâti
      à partir des deux structures publiées. Les boutons au-dessus de la vue gonflent les espaces de smectite. ${aide}
      Voir les deux constituants : <button class="min-chip" data-goargile="illite">Illite</button>
      <button class="min-chip" data-goargile="smectites">Smectites</button></p>${vue()}</div>`;
    if (a.id === "allophane") return `<div class="card" id="eb-3d"><h2>Sa structure en 3D</h2>
      <p class="sub">Aucun espacement basal : l'allophane ne superpose pas de feuillets plans. Sa paroi est un feuillet unique, courbé, aluminium au dehors, silicium au dedans, refermé en sphère creuse ; l'imogolite est le même feuillet enroulé en tube.
      Aucune structure affinée : la vue est un modèle construit. ${aide}</p>${vue()}</div>`;
    const c = COUCHES[ARGILES3D[cle][0]];
    const somme = a.id === "smectites" ? `<p class="eb-somme">L'espacement varie avec l'eau : ≈ 9,7 Å sèche, 12,5 à 12,9 Å avec
      une couche d'eau, 15,5 à 16 Å avec deux, 40 Å et plus dans l'eau pour une smectite sodique. Choisir l'état au-dessus de la vue.</p>`
      : c ? `<p class="eb-somme"><b>d(001) = ${fr(c.d)} Å</b> = feuillet ${fr(c.e)} Å + espace interfoliaire ${fr(c.d - c.e)} Å.
      Entre les feuillets : ${CONTENU[a.id] || ""}.</p>` : "";
    return `<div class="card" id="eb-3d">
      <h2>L'espacement basal d(001)</h2>
      <p class="sub">${c ? `On nomme ainsi l'écart entre un feuillet et le suivant, mesuré perpendiculairement aux feuillets : l'épaisseur du
      feuillet additionnée de l'espace qui le sépare du suivant. Elle se lit aux rayons X (premier pic de diffraction, d'où l'indice 001).`
      : "Aucun espacement basal au sens strict : la sépiolite ne superpose pas de feuillets plans."}
      Au-dessus de la vue, les boutons la montrent à sec, avec une ou deux couches d'eau, ou immergée. ${aide}</p>
      ${somme}
      ${vue(a.id === "smectites" ? `<p class="page-source">États d'hydratation : Ferrage E., Lanson B., Sakharov B. A. et Drits V. A. (2005),
      <i>American Mineralogist</i> 90, p. 1358–1374 ; Karaborni S. et al. (1996), <i>Science</i> 271, p. 1102–1104 ; Gournis D. et al.
      (2008), <i>Physics and Chemistry of Minerals</i> 35, p. 49–58 ; Norrish K. (1954), <i>Discussions of the Faraday Society</i> 18, p. 120–134.</p>` : "")}
    </div>`;
  }

  window.EspacementBasal = { carte, COUCHES, ARGILES3D, INTERSTRAT, FAMILLE, preparer, espace, NA, NB,
    ETATS: { smectite: ETATS_SMECTITE, vermiculite: ETATS_VERMICULITE, faible: ETATS_FAIBLE, halloysite: ETATS_HALLOYSITE, is: ETATS_IS } };
})();
