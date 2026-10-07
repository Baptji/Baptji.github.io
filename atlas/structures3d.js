// ============ Structures cristallines en 3D (chantier A.3) ============
// Moteur commun, sans dépendance, compatible file:// :
//   • données : structures/<fichier>.js, produits par tools/cif_vers_structure.py à partir des CIF de la
//     Crystallography Open Database (atomes de la maille, symétrie déjà appliquée) ;
//     structures/index.js dit quelle fiche de l'atlas (minéral, espèce d'argile) a une structure ;
//   • calcul à l'affichage : répétition de la maille, liaisons (distances maximales par paire), polyèdres
//     de coordination (enveloppe convexe des voisins) ;
//   • rendu : canvas 2D, algorithme du peintre (billes, demi-liaisons, faces triées par profondeur), fond blanc.
//     Pas de WebGL : aucune limite de contextes quand plusieurs visionneuses sont ouvertes (page + panneau).
//
// Usage :  <div data-s3d="quartz"></div>  puis  Structure3D.brancher(racine)
//          ou  Structure3D.afficher(element, "quartz", { mode, repetition, vue, surligner })
(function () {
  "use strict";

  // couleurs des éléments : palette par défaut de VESTA (usage courant en minéralogie)
  const COULEURS = {
    H: "#ffcccc", Li: "#86df73", Be: "#5ed77b", B: "#1ff01f", C: "#814929", N: "#b0b9e6", O: "#fe0300",
    F: "#b0b9e6", Na: "#f9dc3c", Mg: "#fb7b15", Al: "#81b2d6", Si: "#1b3bfa", P: "#c09cc2", S: "#fffa00",
    Cl: "#31fc02", K: "#a121f6", Ca: "#5a96bd", Ti: "#78caff", V: "#e51900", Cr: "#00009e", Mn: "#a8089e",
    Fe: "#b57100", Co: "#0000af", Ni: "#b7bbbd", Cu: "#2247dc", Zn: "#8f8f81", As: "#74d057", Sr: "#00ff27",
    Zr: "#00ff00", Nb: "#4cb276", Ag: "#bcbcbc", Sn: "#9a8eb9", Sb: "#d8834f", Ba: "#1ffe0e", Ce: "#d2d2d2",
    W: "#8d8a80", Au: "#fed60a", Hg: "#d3b7cb", Pb: "#56595f", Th: "#009dd2", U: "#7a8cfd", Pt: "#d0d0e0", Bi: "#d230ff", Mo: "#54b5b5", Hf: "#4dc2ff", Sc: "#b5b5c8", Cs: "#0efeb9",
    Ow: "#9fd3f5", Oh: "#1e4f8f", Os: "#62c7b3",
    Y: "#67988e", La: "#5ac449", Pr: "#5ac449", Nd: "#50c347", Sm: "#46c33e", Eu: "#3fc335", Gd: "#38c32c", Dy: "#2fc023",
  };
  const NOMS = {
    H: "Hydrogène", Li: "Lithium", Be: "Béryllium", B: "Bore", C: "Carbone", N: "Azote", O: "Oxygène", F: "Fluor",
    Na: "Sodium", Mg: "Magnésium", Al: "Aluminium", Si: "Silicium", P: "Phosphore", S: "Soufre", Cl: "Chlore",
    K: "Potassium", Ca: "Calcium", Ti: "Titane", V: "Vanadium", Cr: "Chrome", Mn: "Manganèse", Fe: "Fer",
    Co: "Cobalt", Ni: "Nickel", Cu: "Cuivre", Zn: "Zinc", As: "Arsenic", Sr: "Strontium", Zr: "Zirconium",
    Nb: "Niobium", Ag: "Argent", Sn: "Étain", Sb: "Antimoine", Ba: "Baryum", Ce: "Cérium", W: "Tungstène",
    Au: "Or", Hg: "Mercure", Pb: "Plomb", Th: "Thorium", U: "Uranium", Pt: "Platine", Bi: "Bismuth", Mo: "Molybdène", Hf: "Hafnium", Sc: "Scandium", Cs: "Césium",
    Ow: "eau (molécule, oxygène au centre)", Oh: "eau autour d'un cation", Os: "eau fixée en surface",
    Y: "Yttrium", La: "Lanthane", Pr: "Praséodyme", Nd: "Néodyme", Sm: "Samarium", Eu: "Europium", Gd: "Gadolinium", Dy: "Dysprosium",
  };
  // rayon des billes (Å, choisi pour la lisibilité) et rayon ionique de Shannon (Å, vue compacte)
  const BILLE = { H: 0.17, Li: 0.3, Be: 0.24, Zr: 0.38, Sn: 0.38, O: 0.34, F: 0.34, Cl: 0.52, S: 0.36, C: 0.24, B: 0.24, N: 0.26, P: 0.3, Si: 0.3, Al: 0.32,
    Mg: 0.36, Fe: 0.37, Mn: 0.37, Ti: 0.34, Zn: 0.36, Cu: 0.36, Cr: 0.34, Ca: 0.42, Na: 0.42, K: 0.5, Ba: 0.52, Sr: 0.48, Pb: 0.5,
    Co: 0.37, Ni: 0.36, V: 0.34, Ow: 0.4, Oh: 0.4, Os: 0.4, Ce: 0.46, Y: 0.44, La: 0.46, Nd: 0.46, U: 0.46,
    Au: 0.42, Ag: 0.42, Pt: 0.41, As: 0.38, Sb: 0.42, Bi: 0.46, Hg: 0.44, Mo: 0.38, W: 0.38, Th: 0.46, Nb: 0.36, Hf: 0.38, Sc: 0.36, Cs: 0.56 };
  const IONIQUE = { H: 0.3, Li: 0.76, Be: 0.27, Zr: 0.72, Sn: 0.69, O: 1.4, F: 1.33, Cl: 1.81, S: 1.84, C: 0.16, B: 0.2, N: 0.3, P: 0.3, Si: 0.4, Al: 0.54,
    Mg: 0.72, Fe: 0.7, Mn: 0.7, Ti: 0.6, Zn: 0.74, Cu: 0.73, Cr: 0.62, Ca: 1.0, Na: 1.02, K: 1.51, Ba: 1.42, Sr: 1.26, Pb: 1.19,
    Co: 0.745, Ni: 0.69, V: 0.58, Ag: 1.15, Hg: 1.02, Mo: 0.65, As: 0.58, Sb: 0.76, W: 0.6, Th: 1.05, U: 1.0, Nb: 0.64, Hf: 0.71, Sc: 0.745, Cs: 1.74, Ow: 1.4, Oh: 1.4, Os: 1.4, Ce: 1.143, Y: 1.019, La: 1.16, Nd: 1.109 };
  // longueur maximale d'une liaison (Å). « A-B » : A est le centre, B le ligand (sert aux polyèdres).
  const LIAISONS = {
    "Si-O": 1.85, "Al-O": 2.1, "Mg-O": 2.4, "Fe-O": 2.45, "Mn-O": 2.35, "Ti-O": 2.1, "Cr-O": 2.1, "Zr-O": 2.4,
    "Zn-O": 2.2, "Cu-O": 2.5, "Ca-O": 2.65, "Na-O": 2.9, "K-O": 3.15, "Ba-O": 3.2, "Sr-O": 2.9, "Pb-O": 2.9,
    "Be-O": 1.8, "Sn-O": 2.2, "Li-O": 2.3, "Al-F": 2.0, "C-O": 1.4, "S-O": 1.6, "P-O": 1.7, "B-O": 1.6, "N-O": 1.4, "O-H": 1.1,
    "Na-Cl": 3.0, "K-Cl": 3.35, "Ca-F": 2.5, "Fe-S": 2.6, "Zn-S": 2.45, "Cu-S": 2.5, "Pb-S": 3.1, "S-S": 2.25, "C-C": 1.7,
    // composés organiques (classe X) : liaisons covalentes du carbone et de l'azote, métaux liés à l'azote
    "C-H": 1.2, "N-H": 1.15, "C-N": 1.6, "S-C": 1.9, "Cu-N": 2.3, "Ni-N": 2.1, "Co-N": 2.2, "Ca-Cl": 3.0, "Cu-Cl": 2.95,
    // eau entre les feuillets (pseudo-élément Ow) : cations hydratés
    "Mg-Ow": 2.4, "Ca-Ow": 2.65, "Na-Ow": 2.9, "Li-Ow": 2.3,
    // couronne d'un cation (Oh) : G.4, eau autour des cations entre les feuillets et dans la couche diffuse
    "Mg-Oh": 2.4, "Ca-Oh": 2.65, "Na-Oh": 2.9, "Li-Oh": 2.3,
    "Ce-O": 2.8, "Y-O": 2.6, "La-O": 2.8, "Nd-O": 2.8, "V-O": 2.2, "U-O": 2.6,
    // éléments natifs (F.4, 01/10/2026) : premiers voisins seulement — métaux 2,48 (Fe) à 2,88 Å (Au) ; semi-métaux : liaisons
    // dans la couche plissée (As 2,52, Sb 2,91, Bi 3,07 Å), pas entre les couches (3,12 à 3,53 Å)
    "Au-Au": 3.0, "Ag-Ag": 3.0, "Cu-Cu": 2.7, "Pt-Pt": 2.9, "Fe-Fe": 2.6, "As-As": 2.7, "Sb-Sb": 3.1, "Bi-Bi": 3.25,
    // halogénures (F.4 classe III) : chlorargyrite Ag–Cl 2,77 ; cryolite Na–F 2,23–2,6 ; carnallite K–Cl 3,15–3,3 Å
    "Ag-Cl": 3.0, "Na-F": 2.75,
    // sulfures (F.4 classe II) : premiers voisins — Ag–S 2,44–2,69 ; Hg–S 2,37 (chaînes du cinabre) ; Ni–As 2,41–2,47 ;
    // Fe–As 2,37–2,41 ; As–S 2,23–2,37 ; Sb–S 2,42–2,68 ; Mo–S 2,37 ; Ni–S 2,44 ; Fe–S jusqu'à 2,55 (pyrrhotite)
    "Ag-S": 2.8, "Hg-S": 2.6, "Ni-As": 2.55, "Fe-As": 2.5, "As-S": 2.45, "Sb-S": 2.75, "Mo-S": 2.5, "Ni-S": 2.55,
    // borates, sulfates, tungstates (classes VI–VII) : Mo–O 1,77 (wulfénite) ; W–O 1,78–2,11 ; Mg–Cl 2,61 (boracite)
    "Mo-O": 2.0, "W-O": 2.25, "Mg-Cl": 2.7,
    // phosphates, arséniates, vanadates (classe VIII) : As–O 1,65–1,71 ; Co–O 2,03–2,16 ; Pb–Cl 3,11–3,16 (groupe de l'apatite)
    "As-O": 1.8, "Co-O": 2.3, "Pb-Cl": 3.2,
    // oxydes (classe IV) : Th–O 2,42 (thorianite) ; Nb–O 1,8–2,2 (columbite, pyrochlore)
    "Th-O": 2.6, "Nb-O": 2.25,
    // silicates (classe IX)
    "Ni-O": 2.3, "Hf-O": 2.4, "Ce-F": 2.6, "Mg-F": 2.2, "Sc-O": 2.4, "Cs-O": 3.6, "K-Ow": 3.15, "Ba-Ow": 3.2, "Sr-Ow": 2.9, "Cs-Ow": 3.6, "Li-F": 2.0, "Be-F": 1.7,
  };
  const POLYEDRES = ["Si", "Al", "Mg", "Fe", "Mn", "Ti", "Cr", "Zr", "Sn", "Be", "C", "S", "P", "B"];

  const donnees = {};
  const attentes = {};
  let INDEX = {};

  // ── données ───────────────────────────────────────────────────────────
  function enregistrer(d) {
    donnees[d.id] = d;
    (attentes[d.id] || []).forEach((cb) => cb(d));
    delete attentes[d.id];
  }

  function charger(fichier, cb) {
    if (donnees[fichier]) return cb(donnees[fichier]);
    if (attentes[fichier]) return attentes[fichier].push(cb);
    attentes[fichier] = [cb];
    const s = document.createElement("script");
    s.src = "structures/" + fichier + ".js";
    s.onerror = () => { (attentes[fichier] || []).forEach((f) => f(null)); delete attentes[fichier]; };
    document.head.appendChild(s);
  }

  // ── géométrie ─────────────────────────────────────────────────────────
  const rad = (d) => d * Math.PI / 180;
  const sous = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const scal = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const vect = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norme = (a) => Math.hypot(a[0], a[1], a[2]);
  const unit = (a) => { const n = norme(a) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
  const mult = (A, B) => A.map((l) => [0, 1, 2].map((j) => l[0] * B[0][j] + l[1] * B[1][j] + l[2] * B[2][j]));

  // vecteurs de base (lignes) : a sur x, b dans le plan xy
  function baseMaille([a, b, c, al, be, ga]) {
    const cx = c * Math.cos(rad(be));
    const cy = c * (Math.cos(rad(al)) - Math.cos(rad(be)) * Math.cos(rad(ga))) / Math.sin(rad(ga));
    return [[a, 0, 0], [b * Math.cos(rad(ga)), b * Math.sin(rad(ga)), 0], [cx, cy, Math.sqrt(Math.max(c * c - cx * cx - cy * cy, 0))]];
  }
  const cart = (B, f) => [0, 1, 2].map((k) => f[0] * B[0][k] + f[1] * B[1][k] + f[2] * B[2][k]);

  function longueurLiaison(e1, e2, T = LIAISONS) {
    if (T[e1 + "-" + e2]) return { max: T[e1 + "-" + e2], centre: 0 };
    if (T[e2 + "-" + e1]) return { max: T[e2 + "-" + e1], centre: 1 };
    return null;
  }

  // enveloppe convexe d'un petit nuage (≤ 12 points) : faces triangulaires orientées vers l'extérieur
  function enveloppe(pts) {
    const n = pts.length, faces = [];
    if (n === 3) return [[0, 1, 2]];
    const g = pts.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n, s[2] + p[2] / n], [0, 0, 0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
      let nr = vect(sous(pts[j], pts[i]), sous(pts[k], pts[i]));
      if (norme(nr) < 1e-6) continue;
      nr = unit(nr);
      let pos = 0, neg = 0;
      for (let m = 0; m < n; m++) {
        if (m === i || m === j || m === k) continue;
        const d = scal(nr, sous(pts[m], pts[i]));
        if (d > 0.02) pos++; else if (d < -0.02) neg++;
      }
      if (pos && neg) continue;
      faces.push(scal(nr, sous(g, pts[i])) > 0 ? [i, k, j] : [i, j, k]);
    }
    return faces;
  }

  // ── scène : atomes répétés, liaisons, polyèdres, arêtes de maille ───────
  function construire(d, o) {
    const B = baseMaille(d.maille);
    const rep = o.repetition;
    const eps = 0.02;
    // marge (en fraction de maille) pour aller chercher les voisins hors du bloc
    // (plus large pour un cristal moléculaire : il faut pouvoir compléter des molécules de 10 Å)
    const marge = [0, 1, 2].map((k) => Math.min(1, (o.molecules ? 9 : 3.3) / norme(B[k])));
    const cand = [];
    const dec = o.decalage || [0, 0, 0];   // déplace l'origine de la maille (fractions)
    for (const a0 of d.atomes) {
      const a = [a0[0], (a0[1] + dec[0]) % 1, (a0[2] + dec[1]) % 1, (a0[3] + dec[2]) % 1, a0[4], a0[5], a0[6]];
      // objet isolé (particule, sauf tube infini le long de c) : aucune copie voisine à examiner (27 fois moins de candidats)
      const seul = d.particule && d.particule !== "tube";
      for (let i = seul ? 0 : -1; i <= (seul ? 0 : rep[0]); i++) for (let j = seul ? 0 : -1; j <= (seul ? 0 : rep[1]); j++) for (let k = seul ? 0 : -1; k <= (seul ? 0 : rep[2]); k++) {
        const f = [a[1] + i, a[2] + j, a[3] + k];
        if (f.some((x, c) => x < -marge[c] || x > rep[c] + marge[c])) continue;
        cand.push({
          el: a[0], etiquette: a[4], occ: a[5] || null, f, p: cart(B, f), echelle: (a[6] && a[6].echelle) ?? 1,
          dedans: f.every((x, c) => x >= -eps && x <= rep[c] + eps),
        });
      }
    }
    // voisins entre candidats (grille de 3,4 Å, clés NUMÉRIQUES et table des longueurs par paire d'éléments : 30/09/2026,
    // les clés texte coûtaient la moitié du temps pour 5 000 atomes, et l'animation reconstruit la scène à chaque image)
    const cellule = (x) => Math.floor(x / 3.4) + 512;
    const cleN = (gx, gy, gz) => (gx * 1024 + gy) * 1024 + gz;
    const grille = new Map();
    cand.forEach((c, i) => {
      c.g = [cellule(c.p[0]), cellule(c.p[1]), cellule(c.p[2])];
      const k = cleN(c.g[0], c.g[1], c.g[2]);
      const l = grille.get(k);
      if (l) l.push(i); else grille.set(k, [i]);
    });
    const voisins = cand.map(() => []);
    const TL = d.liaisons ? Object.assign({}, LIAISONS, d.liaisons) : LIAISONS;   // modèle construit : distances propres
    const ELS = [...new Set(cand.map((c) => c.el))], idx = new Map(ELS.map((e, i) => [e, i]));
    const TAB = ELS.map((a) => ELS.map((b) => longueurLiaison(a, b, TL)));
    cand.forEach((c) => { c.ei = idx.get(c.el); });
    const autourDe = (c, f) => {
      const [gx, gy, gz] = c.g;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const l = grille.get(cleN(gx + dx, gy + dy, gz + dz));
        if (l) for (const j of l) f(j);
      }
    };
    cand.forEach((c, i) => {
      const Tc = TAB[c.ei];
      autourDe(c, (j) => {
          if (j <= i) return;
          const L = Tc[cand[j].ei];
          if (!L) return;
          const q = cand[j].p, dist = Math.hypot(c.p[0] - q[0], c.p[1] - q[1], c.p[2] - q[2]);
          if (dist > 0.1 && dist <= L.max) {
            voisins[i].push({ j, centre: L.centre === 0 });
            voisins[j].push({ j: i, centre: L.centre === 1 });
          }
      });
    });
    // on garde le bloc de mailles, puis les ligands des centres de polyèdres (polyèdres complets), puis les H
    // des oxygènes gardés ; les gros cations (K, Na, Ca hors polyèdres) ne font pas entrer leurs voisins extérieurs
    const centresPoly = o.polyedres || d.polyedres || POLYEDRES;
    const garde = cand.map((c) => c.dedans);
    if (o.ligandsHors !== false) {
      for (let passe = 0; passe < 2; passe++) {
        const ajout = [];
        cand.forEach((c, i) => {
          if (!garde[i] || !(passe === 0 ? centresPoly.includes(c.el) : c.el === "O")) return;
          for (const v of voisins[i]) if (v.centre && !garde[v.j]) ajout.push(v.j);
        });
        ajout.forEach((j) => { garde[j] = true; });
      }
    }
    // cristal moléculaire (composés organiques) : on complète chaque molécule ou ion organique coupé par le bord
    // du bloc en suivant les liaisons covalentes entre non-métaux (C, H, N, O, S) ; un H ou un C resté sans
    // aucune liaison (position désordonnée orpheline) est retiré
    if (o.molecules) {
      const COV = new Set(["C", "H", "N", "O", "S"]);
      let ajoute = true;
      while (ajoute) {
        ajoute = false;
        cand.forEach((c, i) => {
          if (!garde[i] || !COV.has(c.el)) return;
          for (const v of voisins[i]) if (!garde[v.j] && COV.has(cand[v.j].el)) { garde[v.j] = true; ajoute = true; }
        });
      }
      cand.forEach((c, i) => {
        if (garde[i] && (c.el === "H" || c.el === "C") && !voisins[i].some((v) => garde[v.j])) garde[i] = false;
      });
    }
    // atome d'une face ou d'une arête du bloc sans aucune liaison gardée (ex. O basal du feuillet suivant) : retiré
    cand.forEach((c, i) => {
      if (!garde[i] || !c.dedans) return;
      const bord = c.f.some((x, k) => x < eps || x > rep[k] - eps);
      if (bord && voisins[i].length && !voisins[i].some((v) => garde[v.j])) garde[i] = false;
    });
    // liaisons hydrogène O–H···O : H···O ≤ 2,45 Å et angle O–H···O ≥ 130° (critère géométrique usuel).
    // L'accepteur doit être dans le bloc (un O de bord retiré juste avant est repris s'il accepte une liaison).
    const hydro = [];
    cand.forEach((h, i) => {
      if (!garde[i] || h.el !== "H") return;
      const don = voisins[i].find((v) => cand[v.j].el === "O");
      if (!don) return;
      const pd = cand[don.j].p;
      autourDe(h, (j) => {
          const o = cand[j];
          if (o.el !== "O" || j === don.j || !(garde[j] || o.dedans)) return;
          const u = sous(pd, h.p), w = sous(o.p, h.p);
          const dist = norme(w);
          if (dist < 1.2 || dist > 2.45) return;
          const angle = Math.acos(scal(u, w) / norme(u) / dist) * 180 / Math.PI;
          if (angle < 130) return;
          garde[j] = true;
          hydro.push([i, j]);
      });
    });
    const nouvel = new Map();
    const atomes = [];
    cand.forEach((c, i) => {
      if (!garde[i]) return;
      c.coordination = voisins[i].filter((v) => v.centre).length;   // avant coupure au bord du bloc
      nouvel.set(i, atomes.length);
      atomes.push(c);
    });
    const liaisons = [];
    const ligands = atomes.map(() => []);
    cand.forEach((c, i) => {
      if (!garde[i]) return;
      for (const v of voisins[i]) {
        if (!garde[v.j]) continue;
        if (v.j > i) liaisons.push([nouvel.get(i), nouvel.get(v.j)]);
        if (v.centre) ligands[nouvel.get(i)].push(nouvel.get(v.j));
      }
    });
    const polyedres = [];
    atomes.forEach((a, i) => {
      if (!centresPoly.includes(a.el)) return;
      const lig = ligands[i];
      const mini = a.el === "C" || a.el === "B" ? 3 : 4;
      // polyèdre tronqué par le bord du bloc (ligandsHors: false) : on ne le dessine pas
      if (lig.length < mini || lig.length > 12 || lig.length < a.coordination) return;
      const faces = enveloppe(lig.map((j) => atomes[j].p));
      if (faces.length) polyedres.push({ centre: i, sommets: lig, faces });
    });
    polyedres.forEach((Q) => { atomes[Q.centre].estCentre = true; });   // lu à chaque image : pas de recherche
    const dansPoly = new Set();
    polyedres.forEach((P) => P.sommets.forEach((j) => dansPoly.add(P.centre + "-" + j)));
    // arêtes du bloc de mailles
    const coins = [];
    for (const i of [0, rep[0]]) for (const j of [0, rep[1]]) for (const k of [0, rep[2]]) coins.push(cart(B, [i, j, k]));
    // particule (tube, sphère : modèles construits, la « maille » n'est qu'une boîte) : pas d'arêtes de maille
    const aretes = d.particule ? [] : [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
    const centre = [0, 1, 2].map((k) => (Math.min(...atomes.map((a) => a.p[k])) + Math.max(...atomes.map((a) => a.p[k]))) / 2);
    const rayon = Math.max(...atomes.map((a) => norme(sous(a.p, centre)))) + 1.6;
    const hydrogene = hydro.map(([i, j]) => [nouvel.get(i), nouvel.get(j)]);
    return { B, atomes, liaisons, hydrogene, polyedres, dansPoly, coins, aretes, centre, rayon };
  }

  // ── orientation ───────────────────────────────────────────────────────
  // repère de l'écran (lignes X, Y, Z) exprimé dans le repère cartésien ; X × Y = Z (pas d'image miroir)
  function vueSelon(B, axe) {
    const [a, b, c] = B.map(unit);
    const perp = (v, n) => unit(sous(v, n.map((x) => x * scal(v, n))));
    let X, Y, Z;
    if (axe === "c") { Z = c; X = perp(a, Z); Y = vect(Z, X); }
    else if (axe === "a") { Z = a; Y = perp(c, Z); X = vect(Y, Z); }
    else { Z = b; Y = perp(c, Z); X = vect(Y, Z); }
    return [X, Y, Z];
  }
  function rotation(ax, ay) {   // rotation autour de l'axe horizontal (ax) puis vertical (ay) de l'écran
    const [cx, sx, cy, sy] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay)];
    const Rx = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]];
    const Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]];
    return mult(Ry, Rx);
  }
  function orientationInitiale(scene, vue) {
    const v = vue || { axe: "a", inclinaison: [14, -28] };
    const R = vueSelon(scene.B, v.axe || "a");
    const [ix, iy] = v.inclinaison || [0, 0];
    return mult(rotation(rad(ix), rad(iy)), R);
  }

  function rotationAxe(u, a) {   // Rodrigues : rotation d'angle a autour de l'axe unitaire u (repère cartésien)
    const [x, y, z] = u, c = Math.cos(a), si = Math.sin(a), t = 1 - c;
    return [[c + x * x * t, x * y * t - z * si, x * z * t + y * si],
      [y * x * t + z * si, c + y * y * t, y * z * t - x * si],
      [z * x * t - y * si, z * y * t + x * si, c + z * z * t]];
  }
  function orthonormer(R) {
    const r0 = unit(R[0]);
    const r1 = unit(sous(R[1], r0.map((v) => v * scal(R[1], r0))));
    return [r0, r1, vect(r0, r1)];
  }

  // ── rendu ─────────────────────────────────────────────────────────────
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function couleurAtome(a) {
    if (a._rgb) return a._rgb;
    return (a._rgb = couleurAtomeCalc(a));
  }
  function couleurAtomeCalc(a) {
    if (!a.occ) return hexRgb(COULEURS[a.el] || "#ff1493");
    const tot = Object.values(a.occ).reduce((s, x) => s + x, 0) || 1;
    return Object.entries(a.occ).reduce((s, [el, x]) => {
      const c = hexRgb(COULEURS[el] || "#ff1493");
      return s.map((v, i) => v + c[i] * x / tot);
    }, [0, 0, 0]).map(Math.round);
  }
  const rgb = (c, f = 1, a = 1) => `rgba(${c.map((v) => Math.round(Math.min(255, v * f))).join(",")},${a})`;
  const eclaircir = (c, t) => c.map((v) => v + (255 - v) * t);

  const sprites = new Map();
  function sprite(c, r) {
    const cle = c.join(",") + "|" + r;
    if (sprites.has(cle)) return sprites.get(cle);
    const t = Math.ceil(r * 2 + 2);
    const cv = document.createElement("canvas");
    cv.width = cv.height = t;
    const g = cv.getContext("2d");
    const m = t / 2;
    const gr = g.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.05, m, m, r);
    gr.addColorStop(0, rgb(eclaircir(c, 0.75)));
    gr.addColorStop(0.45, rgb(c));
    gr.addColorStop(1, rgb(c, 0.55));
    g.fillStyle = gr;
    g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();
    g.lineWidth = Math.max(0.6, r * 0.05);
    g.strokeStyle = "rgba(0,0,0,.35)";
    g.stroke();
    if (sprites.size > 600) sprites.clear();
    sprites.set(cle, cv);
    return cv;
  }

  // ── cote de l'espacement basal (G.5) ─────────────────────────────────
  // v.cote = { feuillets: [[bas, haut], …] } : hauteurs (Å) des plans d'oxygène extérieurs de chaque feuillet
  // dans UNE maille, mesurées perpendiculairement aux feuillets depuis le plan z = 0 (h = z × d de la maille).
  // On répète ces feuillets sur la hauteur du bloc ; entre deux feuillets consécutifs : l'espace interfoliaire.
  function coteGeom(v) {
    const B = v.scene.B, rep = v.repetition;
    const n = unit(vect(B[0], B[1]));
    const dm = scal(B[2], n);
    const H = rep[2] * dm;
    const couches = [];
    for (let k = -1; k <= rep[2]; k++) v.cote.feuillets.forEach(([b, h]) => {
      const c = [b + k * dm, h + k * dm];
      if (c[0] >= -0.6 && c[1] <= H + 0.6) couches.push(c);
    });
    couches.sort((x, y) => x[0] - y[0]);
    const bandes = [];
    for (let i = 0; i + 1 < couches.length; i++) bandes.push([couches[i][1], couches[i + 1][0]]);
    return { B, rep, n, dm, couches, bandes };
  }
  function enveloppe2D(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const bas = [], haut = [];
    for (const q of p) { while (bas.length > 1 && x(bas[bas.length - 2], bas[bas.length - 1], q) <= 0) bas.pop(); bas.push(q); }
    for (const q of p.reverse()) { while (haut.length > 1 && x(haut[haut.length - 2], haut[haut.length - 1], q) <= 0) haut.pop(); haut.push(q); }
    return bas.slice(0, -1).concat(haut.slice(0, -1));
  }

  function dessiner(v) {
    if (v.morpho) { window.ArgilesStructure.dessiner(v); return; }
    const { canvas, scene, R } = v;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    const g = canvas.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#fff";
    g.fillRect(0, 0, w, h);
    // cadrage : étendue projetée mesurée à l'orientation de départ (recalculée à chaque changement de vue,
    // pas pendant la rotation, pour que la taille ne saute pas sous la souris)
    const e = v.etendue || { x: scene.rayon * 2, y: scene.rayon * 2 };
    const echelle = Math.min(w * 0.86 / e.x, h * 0.84 / e.y, Math.min(w, h) / 2 / scene.rayon * 1.6) * v.zoom;
    const D = scene.rayon * 5;     // légère perspective
    const proj = (p) => {
      const q = sous(p, scene.centre);
      const x = scal(R[0], q), y = scal(R[1], q), z = scal(R[2], q);
      const f = D / (D - z);
      return [w / 2 + x * echelle * f, h / 2 - y * echelle * f, z, f];
    };
    const P = scene.atomes.map((a) => proj(a.p));
    const cote = v.cote ? coteGeom(v) : null;
    if (cote) {
      const { B: Bc, rep, dm } = cote;
      const dalle = (h0, h1) => enveloppe2D([h0, h1].flatMap((h) =>
        [[0, 0], [rep[0], 0], [rep[0], rep[1]], [0, rep[1]]].map(([i, j]) => proj(cart(Bc, [i, j, h / dm]))))); 
      g.fillStyle = "rgba(70,140,210,.26)";
      g.strokeStyle = "rgba(40,110,190,.45)";
      g.lineWidth = 1;
      cote.bandes.forEach(([h0, h1]) => {
        const e = dalle(h0, h1);
        g.beginPath(); e.forEach((q, k) => (k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.fill();
      });
    }
    const mode = v.mode;
    const surl = v.surligner;
    const estSurligne = (a) => !surl || surl(a);
    const items = [];
    const rayonAtome = (a) => rayonBrut(a) * a.echelle;   // échelle < 1 : atome qui apparaît ou disparaît (animation)
    const rayonBrut = (a) => {
      if (mode === "compact") return (v.rayons && v.rayons[a.el]) || IONIQUE[a.el] || 0.8;   // rayons propres : métaux natifs
      // argiles (vue avec cote) : l'eau et les cations entre les feuillets restent bien visibles
      if (a.el === "Ow" || a.el === "Oh" || a.el === "Os") return 0.5;
      if (v.cote && ["K", "Na", "Ca", "Cs"].includes(a.el)) return BILLE[a.el];
      // vue « Structure » des argiles : les cations entre les feuillets et ceux de la couche diffuse ressortent (G.4)
      if (v.particule && ["K", "Na", "Ca", "Cs"].includes(a.el)) return BILLE[a.el] * 1.6;
      if (v.particule && a.el === "Mg" && !a.estCentre) return BILLE.Mg * 1.6;
      if (mode === "polyedres") {
        const centre = !!a.estCentre;
        if (!centre && v.cote && a.el === "Mg") return BILLE.Mg;   // Mg²⁺ entre les feuillets (vermiculite)
        return (BILLE[a.el] || 0.35) * (centre ? 0.55 : 0.6);
      }
      return BILLE[a.el] || 0.35;
    };
    const centresPoly = new Set(scene.polyedres.map((Q) => Q.centre));
    // atomes
    scene.atomes.forEach((a, i) => {
      const r = rayonAtome(a) * echelle * P[i][3];
      items.push({ z: P[i][2], t: "atome", i, r });
    });
    // liaisons (en demi-liaisons colorées) — masquées dans les polyèdres et en vue compacte
    if (mode !== "compact") {
      scene.liaisons.forEach(([i, j]) => {
        // en vue polyèdres, seules les liaisons O–H restent (les gros cations K, Ca, Na restent isolés)
        if (mode === "polyedres" && scene.atomes[i].el !== "H" && scene.atomes[j].el !== "H") return;
        const m = [(P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2, (P[i][2] + P[j][2]) / 2];
        items.push({ z: (P[i][2] + m[2]) / 2 - 0.01, t: "demi", de: i, vers: j, m });
        items.push({ z: (P[j][2] + m[2]) / 2 - 0.01, t: "demi", de: j, vers: i, m });
      });
    }
    // faces des polyèdres
    if (mode === "polyedres") {
      const lum = unit([-0.4, 0.55, 0.75]);
      scene.polyedres.forEach((Q) => {
        const c = couleurAtome(scene.atomes[Q.centre]);
        const vis = estSurligne(scene.atomes[Q.centre]);
        Q.faces.forEach((f) => {
          const pts = f.map((k) => P[Q.sommets[k]]);
          const p3 = f.map((k) => scene.atomes[Q.sommets[k]].p);
          const nr = unit(vect(sous(p3[1], p3[0]), sous(p3[2], p3[0])));
          const nEcran = [scal(R[0], nr), scal(R[1], nr), scal(R[2], nr)];
          const face = nEcran[2] >= 0;
          const eclair = 0.62 + 0.38 * Math.abs(scal(nEcran, lum));
          items.push({ z: (pts[0][2] + pts[1][2] + pts[2][2]) / 3 + (face ? 0.02 : -0.02), t: "face", pts, c, eclair, face, vis });
        });
      });
    }
    // liaisons hydrogène (tirets bleus), de la bille de H à la bille de O
    if (v.hydrogene && mode !== "compact") {
      scene.hydrogene.forEach(([h, o]) => {
        items.push({ z: (P[h][2] + P[o][2]) / 2, t: "hydro", h, o });
      });
    }
    // arêtes de la maille
    const C = scene.coins.map(proj);
    scene.aretes.forEach(([i, j]) => items.push({ z: (C[i][2] + C[j][2]) / 2, t: "arete", a: C[i], b: C[j] }));

    items.sort((x, y) => x.z - y.z);
    const largeurLiaison = Math.max(1.5, 0.13 * echelle);
    for (const it of items) {
      if (it.t === "atome") {
        const a = scene.atomes[it.i];
        if (a.echelle < 0.03) continue;
        const r = Math.max(1.2, Math.round(it.r * 2) / 2);
        const sp = sprite(couleurAtome(a), Math.round(r * dpr * 2) / 2);
        g.globalAlpha = estSurligne(a) ? 1 : 0.18;
        g.drawImage(sp, P[it.i][0] - sp.width / dpr / 2, P[it.i][1] - sp.height / dpr / 2, sp.width / dpr, sp.height / dpr);
        g.globalAlpha = 1;
      } else if (it.t === "demi") {
        const a = scene.atomes[it.de], b = scene.atomes[it.vers];
        const p = P[it.de];
        const dx = it.m[0] - p[0], dy = it.m[1] - p[1];
        const L = Math.hypot(dx, dy);
        if (L < 0.5) continue;
        // départ au bord de la bille pour ne pas traverser l'atome
        const r0 = mode === "polyedres" ? 0 : rayonAtome(a) * echelle * p[3] * 0.7;
        if (r0 >= L) continue;
        const x0 = p[0] + dx / L * r0, y0 = p[1] + dy / L * r0;
        g.globalAlpha = estSurligne(a) && estSurligne(b) ? 1 : 0.18;
        g.lineCap = "butt";
        g.strokeStyle = "rgba(0,0,0,.45)";
        g.lineWidth = largeurLiaison + 1.4;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(it.m[0], it.m[1]); g.stroke();
        g.strokeStyle = rgb(couleurAtome(a), 0.95);
        g.lineWidth = largeurLiaison;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(it.m[0], it.m[1]); g.stroke();
        g.globalAlpha = 1;
      } else if (it.t === "face") {
        g.beginPath();
        g.moveTo(it.pts[0][0], it.pts[0][1]);
        g.lineTo(it.pts[1][0], it.pts[1][1]);
        g.lineTo(it.pts[2][0], it.pts[2][1]);
        g.closePath();
        const base = it.vis ? 1 : 0.25;
        g.fillStyle = rgb(eclaircir(it.c, 0.25), it.eclair, (it.face ? 0.62 : 0.4) * base);
        g.fill();
        g.lineJoin = "round";
        g.strokeStyle = rgb(it.c, 0.5, 0.55 * base);
        g.lineWidth = 0.8;
        g.stroke();
      } else if (it.t === "hydro") {
        const a = P[it.h], b = P[it.o];
        const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
        const ra = rayonAtome(scene.atomes[it.h]) * echelle * a[3], rb = rayonAtome(scene.atomes[it.o]) * echelle * b[3];
        if (L <= ra + rb) continue;
        g.globalAlpha = estSurligne(scene.atomes[it.h]) ? 1 : 0.18;
        g.strokeStyle = "rgba(20,110,200,.9)";
        g.lineWidth = Math.max(1.3, 0.05 * echelle);
        g.setLineDash([Math.max(3, 0.12 * echelle), Math.max(2.5, 0.09 * echelle)]);
        g.beginPath(); g.moveTo(a[0] + dx / L * ra, a[1] + dy / L * ra); g.lineTo(b[0] - dx / L * rb, b[1] - dy / L * rb); g.stroke();
        g.setLineDash([]);
        g.globalAlpha = 1;
      } else if (it.t === "arete") {
        g.strokeStyle = "rgba(40,40,40,.55)";
        g.lineWidth = 1;
        g.setLineDash([4, 3]);
        g.beginPath(); g.moveTo(it.a[0], it.a[1]); g.lineTo(it.b[0], it.b[1]); g.stroke();
        g.setLineDash([]);
      }
    }
    if (cote && cote.couches.length >= 2) {
      const { B: Bc, rep, dm, n } = cote;
      // flèche : d'un feuillet au suivant, ou sur une période choisie (interstratifiés réguliers : [0, 2]) ; false = aucune
      const fl = v.cote.fleche, [i0, i1] = fl || [0, 1];
      const c0 = cote.couches[i0], c1 = cote.couches[Math.min(i1, cote.couches.length - 1)];
      // bords gauche et droit du bloc à l'écran (coins des plans des deux feuillets), milieu du bloc pour les hauteurs :
      // la cote reste en place quand la structure tourne
      const coins = [c0[0], c1[1]].flatMap((h) => [[0, 0], [rep[0], 0], [rep[0], rep[1]], [0, rep[1]]]
        .map(([i, j]) => proj(cart(Bc, [i, j, h / dm]))[0]));
      const xs = coins.concat(P.map((q) => q[0]));        // les polyèdres complétés dépassent parfois du bloc
      const xd = Math.max(...xs) + 14, xg = Math.min(...xs) - 10;
      const A = cart(Bc, [rep[0] / 2, rep[1] / 2, c0[0] / dm]);
      const pn = (h) => proj([A[0] + n[0] * (h - c0[0]), A[1] + n[1] * (h - c0[0]), A[2] + n[2] * (h - c0[0])]);
      const ya = pn(c0[0])[1], yb = pn(c1[0])[1];
      g.strokeStyle = "#222"; g.fillStyle = "#222"; g.lineWidth = 1.4;
      if (fl !== false) {
        g.beginPath(); g.moveTo(xd, ya); g.lineTo(xd, yb); g.stroke();
        [[ya, 1], [yb, -1]].forEach(([y, s]) => {
          const sens = Math.sign(yb - ya) * s;
          g.beginPath(); g.moveTo(xd - 6, y); g.lineTo(xd + 6, y); g.stroke();
          g.beginPath(); g.moveTo(xd, y); g.lineTo(xd - 3.5, y + sens * 7); g.lineTo(xd + 3.5, y + sens * 7); g.closePath(); g.fill();
        });
        g.font = "600 13px system-ui, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle";
        g.fillText("d(001) = " + fmt(c1[0] - c0[0], 2) + " Å", xd + 9, (ya + yb) / 2);
      }
      g.font = "12px system-ui, sans-serif"; g.textAlign = "right"; g.textBaseline = "middle";
      const f0 = cote.couches[0];
      g.fillStyle = "#333"; g.fillText("feuillet · " + fmt(f0[1] - f0[0], 1) + " Å", xg, pn((f0[0] + f0[1]) / 2)[1]);
      // espaces nommés (interstratifiés) : un libellé par espace, sinon « interfoliaire » pour le premier
      const noms = v.cote.noms || ["interfoliaire"];
      g.fillStyle = "#1f5f9e";
      noms.forEach((nom, k) => {
        const a = cote.couches[k], b = cote.couches[k + 1];
        if (b) g.fillText(nom + " · " + fmt(b[0] - a[1], 1) + " Å", xg, pn((a[1] + b[0]) / 2)[1]);
      });
    }
    // trièdre a, b, c en bas à gauche (sauf particule : la « maille » n'est qu'une boîte ; tube : seul c, son axe, compte)
    const ox = 34, oy = h - 30, lg = 20;
    [["a", "#c0392b"], ["b", "#1e8449"], ["c", "#1f4fb5"]].forEach(([nom, coul], k) => {
      if (v.particule && (v.particule !== "tube" || k < 2)) return;
      const u = unit(scene.B[k]);
      const x = scal(R[0], u), y = scal(R[1], u);
      g.strokeStyle = coul; g.fillStyle = coul; g.lineWidth = 2;
      g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + x * lg, oy - y * lg); g.stroke();
      g.font = "600 11px system-ui, sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(nom, ox + x * (lg + 8), oy - y * (lg + 8));
    });
  }

  // ── visionneuse ───────────────────────────────────────────────────────
  const fmt = (x, n = 3) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: n });
  function groupeLisible(g) {
    let t = (g || "").replace(/:.*$/, "").trim().split(/\s+/);
    if (t.length === 4 && t[1] === "1" && t[3] === "1") t = [t[0], t[2]];
    return t.map((s) => s.replace(/^-(\d)/, "$1̅").replace(/^(\d)(\d)$/, (m, a, b) => a + "₀₁₂₃₄₅₆₇₈₉"[b])).join("");
  }
  function sourceHTML(d) {
    const s = d.source || {};
    if (s.modele) return "Modèle construit par l'atlas : aucune structure affinée (détail en bas de page).";
    const au = s.auteurs || [];
    const noms = au.map((x) => x.split(",")[0].trim());
    const qui = noms.length > 2 ? noms[0] + " et al." : noms.join(" et ");
    const lien = `https://www.crystallography.net/cod/${s.cod}.html`;
    return `Structure : ${qui} (${s.annee})${s.revue ? ", <i>" + s.revue + "</i>" + (s.volume ? " " + s.volume : "") : ""}
      — <a href="${lien}" target="_blank" rel="noopener">COD ${s.cod}</a>`;
  }
  // référence complète (bas de page des fiches)
  function referenceHTML(d) {
    const s = d.source || {};
    if (s.modele) return s.modele + (s.references ? " Sources : " + s.references.join(" ") : "");
    const au = (s.auteurs || []).map((x) => {
      const [nom, prenoms] = x.split(",").map((y) => y.trim());
      return prenoms ? `${nom} ${prenoms}` : nom;
    });
    const qui = au.length > 1 ? au.slice(0, -1).join(", ") + " et " + au[au.length - 1] : au.join("");
    const lienCOD = `https://www.crystallography.net/cod/${s.cod}.html`;
    return `Structure cristalline : ${qui} (${s.annee}). ${s.titre ? "« " + s.titre + " ». " : ""}`
      + `${s.revue ? "<i>" + s.revue + "</i>" + (s.volume ? " " + s.volume : "") + (s.pages ? ", p. " + s.pages : "") + ". " : ""}`
      + `${s.doi ? `<a href="https://doi.org/${s.doi}" target="_blank" rel="noopener">doi:${s.doi}</a>. ` : ""}`
      + `Données : Crystallography Open Database, fiche <a href="${lienCOD}" target="_blank" rel="noopener">COD ${s.cod}</a>.`;
  }
  // « Ow » = oxygène d'une molécule d'eau (eau entre les feuillets des argiles) : bille bleue, notée H₂O
  const symbole = (el) => (el === "Ow" || el === "Oh" || el === "Os" ? "H₂O" : el);
  function legendeHTML(d, avecH) {
    // un élément qui n'occupe QUE des sites mixtes n'a pas de pastille propre (aucune bille n'a sa couleur pure) :
    // chaque site mixte a sa pastille, de la couleur mélangée réellement dessinée
    const vus = {};
    const mixtes = new Map();
    d.atomes.forEach((a) => {
      if (a[5]) {
        const els = Object.keys(a[5]);
        const t = Object.entries(a[5]).map(([el, x]) => `${el} ${fmt(x * 100, 0)} %`).join(" + ");
        if (!mixtes.has(t)) mixtes.set(t, { nom: els.join("/"), couleur: rgb(couleurAtome({ occ: a[5] })) });
      } else vus[a[0]] = true;
    });
    const EAUX = ["Ow", "Oh", "Os"], rangEau = (x) => EAUX.indexOf(x) + 1;   // les eaux en dernier : entre les feuillets, autour d'un cation, en surface
    const ordre = Object.keys(vus).sort((x, y) => rangEau(x) - rangEau(y) || (x === "O") - (y === "O") || (x === "H") - (y === "H") || x.localeCompare(y));
    // argiles : l'eau « Ow » est celle d'entre les feuillets (les autres eaux ont leur pseudo-élément, G.4)
    const argile = d.cote || d.brut || vus.Oh || vus.Os;
    const nom = (el) => (el === "Ow" && argile ? "eau entre les feuillets" : NOMS[el] || "");
    return ordre.map((el) => `<span class="s3d-el"><i style="background:${COULEURS[el] || "#ff1493"}"></i>${symbole(el)} <small>${nom(el)}</small></span>`).join("")
      + [...mixtes].map(([t, m]) => `<span class="s3d-el"><i style="background:${m.couleur}"></i>${m.nom} <small>site partagé : ${t}</small></span>`).join("")
      + (avecH ? `<span class="s3d-el"><i class="s3d-tiret"></i>liaison hydrogène</span>` : "");
  }

  function afficher(conteneur, cle, options) {
    const entree = INDEX[cle] || { fichier: cle };
    const o = Object.assign({ cle }, entree, options || {});
    conteneur.classList.add("s3d");
    conteneur.innerHTML = `<div class="s3d-attente">Chargement de la structure…</div>`;
    // `fichiers` : structures supplémentaires dont l'entrée a besoin (interstratifiés : le second feuillet ; imogolite : le faisceau)
    const tous = [entree.fichier].concat(entree.fichiers || []);
    const recu = {};
    let reste = tous.length;
    tous.forEach((f) => charger(f, (d) => {
      recu[f] = d;
      if (--reste) return;
      const manque = tous.find((x) => !recu[x]);
      if (manque) { conteneur.innerHTML = `<div class="s3d-attente">Structure indisponible (structures/${manque}.js).</div>`; return; }
      monter(conteneur, recu[entree.fichier], o);
    }));
  }

  // compteur d'eau (G.4, 30/09/2026) : rétention approximative en haut à droite de la vue, pour les argiles (argiles-eau.js)
  // volet « Maille et description » / « Description » (option replier) : reste ouvert d'un état d'eau ou d'une échelle à l'autre
  const suivreVolet = (conteneur, o) => {
    const det = conteneur.querySelector(".s3d-details");
    if (det) det.addEventListener("toggle", () => { o._detOuvert = det.open; });
    // références rangées dans le volet (texte « après », 02/10/2026) : remplies à chaque nouveau rendu
    conteneur.querySelectorAll(".s3d-apres [data-s3d-ref]").forEach((el) => {
      const entree = INDEX[el.dataset.s3dRef];
      if (entree) charger(entree.fichier, (d) => { if (d) el.innerHTML = referenceHTML(d); });
      el.setAttribute("data-s3d-monte", "");
    });
  };
  const noteEau = (o) => (o.etats && window.ArgilesEau && ArgilesEau.a(o.cle) ? ArgilesEau.noteCompteur(o.cle, o._etat || 0) : "");
  function compteur(conteneur, o) {
    const A = window.ArgilesEau;
    if (!o.etats || !A || !A.a(o.cle)) return null;
    const canvas = conteneur.querySelector("canvas");
    const el = document.createElement("div");
    el.className = "s3d-compteur";
    el.setAttribute("aria-live", "polite");
    canvas.insertAdjacentElement("afterend", el);
    const placer = () => { el.style.top = canvas.offsetTop + 8 + "px"; };
    const montrer = (b) => { el.innerHTML = A.compteurHTML(b); };
    placer();
    montrer(A.bilan(o.cle, o._etat || 0));
    return { placer, montrer, bilan: (i) => A.bilan(o.cle, i), el };
  }

  function monter(conteneur, d0, o) {
    // états (argiles gonflantes, G.5) : o.etats = [{ nom, construire(structure publiée) → structure à afficher }] ;
    // la structure construite porte sa répétition, sa cote et une note (etatNote)
    // « 2 × 2 » d'une entrée qui a sa propre structure pour cela (fichierPlus : faisceau d'imogolite)
    const base = (o._plus && o.fichierPlus && donnees[o.fichierPlus]) || d0;
    let d = base;
    if (o.etats) {
      if (o._etat === undefined) o = Object.assign({}, o, { _etat: o.etatDefaut || 0 });
      d = o.etats[o._etat].construire(base, !!o._plus);
    }
    // « Structure » (argiles, 30/09/2026) : un petit objet entier, atome par atome (argiles-particules.js) ;
    // « Vue d'ensemble » : la forme des feuillets à l'échelle du nanomètre, en surfaces (argiles-structure.js)
    const particule = o._atomes && window.ArgilesParticules && ArgilesParticules.a(o.cle) ? ArgilesParticules.construire(o.cle, o._etat || 0) : null;
    if (particule) d = particule;
    const morpho = o._morpho && window.ArgilesStructure && ArgilesStructure.a(o.cle) ? ArgilesStructure.scene(o.cle, o._etat || 0) : null;
    const v = {
      morpho,
      rayons: o.rayonsCompacts || d.rayonsCompacts || null,
      particule: d.particule || null,
      mode: o._mode || o.mode || d.mode || "billes",
      repetition: (o.etats && d.repetition) || o.repetition || d.repetition || [1, 1, 1],
      zoom: 1,
      hydrogene: o.hydrogene !== false,
      cote: (o.etats && d.cote) || o.cote || null,
      rotation: o.rotation === true ? 4 : o.rotation || 0,   // degrés par seconde, autour de la normale aux feuillets (c*)
      rotationAxe: (particule && particule.rotationAxe) || (particule ? "normale" : o.rotationAxe || "normale"),   // ou "b" (argiles fibreuses vues le long de c)
      surligner: typeof o.surligner === "function" ? o.surligner
        : Array.isArray(o.surligner) ? (a) => o.surligner.some((e) => a.etiquette.split("/").includes(e) || a.el === e) : null,
    };
    const opts = () => ({ repetition: v.repetition, ligandsHors: o.ligandsHors ?? d.ligandsHors,
      polyedres: o.polyedres || d.polyedres, decalage: (o.etats && d.decalage) || o.decalage || d.decalage, molecules: o.molecules || d.molecules });
    const [a, b, c, al, be, ga] = d.maille;
    const angles = [al, be, ga].every((x) => Math.abs(x - 90) < 0.01) ? ""
      : [["α", al], ["β", be], ["γ", ga]].filter(([, x]) => Math.abs(x - 90) >= 0.01).map(([n, x]) => ` · ${n} = ${fmt(x, 2)}°`).join("");
    const avecH = d.atomes.some((x) => x[0] === "H");
    const boutons = (liste, attr, actif) => liste.map(([val, lib]) =>
      `<button type="button" data-${attr}="${val}" aria-pressed="${val === actif}">${lib}</button>`).join("");
    const vueDep = particule ? d.vue : o.vue || d.vue;
    const vue0 = vueDep;
    const axe0 = vue0 && vue0.axe && !(vue0.inclinaison || []).some(Boolean) ? vue0.axe : "";   // vue de départ « selon a »…
    const note = (particule ? [d.note, o.noteEspece] : [o.note, d.etatNote]).filter(Boolean).join("<br>");
    // rangée d'échelles des argiles : 1 maille · 2 × 2 · Structure (remplace 1 maille / 2 × 2 × 2 et Un espace / Plusieurs feuillets)
    const echelles = o.echelles ? o.echelles.filter(([k]) => (k !== "e" || (window.ArgilesStructure && ArgilesStructure.a(o.cle)))
      && (k !== "s" || (window.ArgilesParticules && ArgilesParticules.a(o.cle)))) : null;
    const echActive = o._morpho ? "e" : o._atomes ? "s" : o._plus ? "2" : "1";
    if (morpho) {
      conteneur.innerHTML = `
      ${o.etats ? `<div class="s3d-outils s3d-etats"><div class="s3d-seg">${o.etats.map((e, i) =>
        `<button type="button" data-etat="${i}" aria-pressed="${i === o._etat}">${e.nom}</button>`).join("")}</div></div>` : ""}
      <canvas class="s3d-vue" role="img" aria-label="${morpho.titre} : faire glisser pour tourner"></canvas>
      <div class="s3d-outils">
        <div class="s3d-seg">${boutons(echelles, "ech", echActive)}</div>
        <div class="s3d-seg"><button type="button" data-zoom="1.2" aria-label="Zoomer">+</button><button type="button" data-zoom="0.83" aria-label="Dézoomer">−</button></div>
        <div class="s3d-seg"><button type="button" data-tourne aria-pressed="true">Rotation</button></div>
        <button type="button" class="map-fs-btn" data-grand>⤢ Agrandir</button>
      </div>
      ${o.replier ? `<div class="s3d-pied">` : ""}<div class="s3d-legende">${morpho.legende}</div>
      ${o.replier ? `<details class="s3d-details"${o._detOuvert ? " open" : ""}><summary>Description</summary>` : ""}<p class="s3d-info">${morpho.note}${noteEau(o) ? `<br>${noteEau(o)}` : ""}</p>${o.apres ? `<div class="s3d-apres">${o.apres}</div>` : ""}${o.replier ? "</details></div>" : ""}`;
      suivreVolet(conteneur, o);
      return monterMorpho(conteneur, d0, o, v);
    }
    conteneur.innerHTML = `
      ${o.etats ? `<div class="s3d-outils s3d-etats"><div class="s3d-seg">${o.etats.map((e, i) =>
        `<button type="button" data-etat="${i}" aria-pressed="${i === o._etat}">${e.nom}</button>`).join("")}</div></div>` : ""}
      <canvas class="s3d-vue" role="img" aria-label="Structure cristalline de ${d.nom} en 3D : faire glisser pour tourner"></canvas>
      <div class="s3d-outils">
        <div class="s3d-seg">${boutons([["billes", o.replier ? "Billes" : "Billes et liaisons"], ["polyedres", "Polyèdres"], ["compact", "Compact"]], "mode", v.mode)}</div>
        <div class="s3d-seg">${boutons(o.replier ? [["a", "a"], ["b", "b"], ["c", "c"]] : [["a", "selon a"], ["b", "selon b"], ["c", "selon c"]], "axe", axe0)}</div>
        ${echelles ? `<div class="s3d-seg">${boutons(echelles, "ech", echActive)}</div>`
          : v.cote ? (o.etats ? `<div class="s3d-seg">${boutons([["0", "Un espace"], ["1", "Plusieurs feuillets"]], "plus", o._plus ? "1" : "0")}</div>` : "")
          : d.particule ? (o.cristal ? `<div class="s3d-seg"><button type="button" data-cristal aria-pressed="false"${o.cristal === "oui" ? "" : " disabled"}>Forme du cristal</button></div>` : "")
          : `<div class="s3d-seg">${boutons([["1", "1 maille"], ["2", "2 × 2 × 2"]], "rep", v.repetition.join("") === "111" ? "1" : "")}${o.cristal
            ? `<button type="button" data-cristal aria-pressed="false"${o.cristal === "oui" ? "" : " disabled"}>Forme du cristal</button>` : ""}</div>`}
        ${avecH ? `<div class="s3d-seg"><button type="button" data-hydro aria-pressed="${v.hydrogene}">${o.replier ? "Liaisons H" : "Liaisons hydrogène"}</button></div>` : ""}
        <div class="s3d-seg"><button type="button" data-zoom="1.2" aria-label="Zoomer">+</button><button type="button" data-zoom="0.83" aria-label="Dézoomer">−</button></div>
        ${v.rotation ? `<div class="s3d-seg"><button type="button" data-tourne aria-pressed="true">Rotation</button></div>` : ""}
        <button type="button" class="map-fs-btn" data-grand>⤢ Agrandir</button>
      </div>
      ${o.replier ? `<div class="s3d-pied">` : ""}<div class="s3d-legende">${legendeHTML(d, avecH && v.hydrogene)}</div>
      ${o.replier ? `<details class="s3d-details"${o._detOuvert ? " open" : ""}><summary>Maille et description</summary>` : ""}<p class="s3d-info">${d.info ? d.info : d.particule === "sphere" ? `Modèle construit : une sphère de ${d.atomes.length} atomes`
        : d.particule === "tube" ? `Modèle construit : période le long des tubes c = ${fmt(c)} Å · ${d.atomes.length} atomes par période`
        : `Maille : a = ${fmt(a)} Å, b = ${fmt(b)} Å, c = ${fmt(c)} Å${angles} · groupe d'espace ${groupeLisible(d.groupe)}
        · ${d.atomes.length} atomes par maille`}${note ? `<br>${note}` : ""}${noteEau(o) ? `<br>${noteEau(o)}` : ""}${o.source === false ? "" : `<br>${sourceHTML(d)}`}</p>${o.apres ? `<div class="s3d-apres">${o.apres}</div>` : ""}${o.replier ? "</details></div>" : ""}`;
    suivreVolet(conteneur, o);
    const canvas = conteneur.querySelector("canvas");
    v.canvas = canvas;
    const cpt = compteur(conteneur, o);
    const reconstruire = () => { v.scene = construire(d, opts()); };
    const cadrer = () => {
      const S = v.scene;
      const xs = [], ys = [];
      S.atomes.forEach((a) => {
        const q = sous(a.p, S.centre);
        xs.push(scal(v.R[0], q)); ys.push(scal(v.R[1], q));
      });
      // les coins de la maille comptent, sauf pour une particule : sa « maille » n'est qu'une boîte invisible, plus grande
      // pendant une animation qu'à l'arrivée (le cadrage sautait à la fin)
      if (!v.particule) S.coins.forEach((c) => {
        const q = sous(c, S.centre);
        xs.push(scal(v.R[0], q)); ys.push(scal(v.R[1], q));
      });
      // l'étendue doit tenir autour du centre de rotation : on prend deux fois l'écart maximal au centre
      v.etendue = { x: 2 * Math.max(...xs.map(Math.abs)) + 1.4, y: 2 * Math.max(...ys.map(Math.abs)) + 1.4 };
      if (v.cote) v.etendue.x *= 1.9;   // place pour la cote à droite et les étiquettes à gauche
    };
    reconstruire();
    v.R = o._R || orientationInitiale(v.scene, vueDep);
    cadrer();
    let attente = 0;
    const redessiner = () => {
      if (attente) return;
      attente = requestAnimationFrame(() => { attente = 0; if (canvas.isConnected) dessiner(v); });
    };
    v.redessiner = redessiner;

    // rotation au glisser (souris, stylet, doigt)
    let dernier = null;
    canvas.addEventListener("pointerdown", (e) => { dernier = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", (e) => {
      if (!dernier || !e.buttons && e.pointerType === "mouse") { dernier = null; return; }
      const dx = e.clientX - dernier[0], dy = e.clientY - dernier[1];
      dernier = [e.clientX, e.clientY];
      v.R = mult(rotation(dy * 0.01, dx * 0.01), v.R);
      redessiner();
    });
    const fin = () => { dernier = null; };
    canvas.addEventListener("pointerup", fin);
    canvas.addEventListener("pointercancel", fin);
    canvas.addEventListener("lostpointercapture", fin);
    canvas.addEventListener("dblclick", () => { v.R = orientationInitiale(v.scene, vueDep); v.zoom = 1; cadrer(); redessiner(); });
    // zoom : pincement du pavé tactile (ctrl + molette) seulement, la molette seule fait défiler la page
    canvas.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      v.zoom = Math.min(6, Math.max(0.3, v.zoom * Math.exp(-e.deltaY * 0.01)));
      redessiner();
    }, { passive: false });

    conteneur.querySelector(".s3d-outils:not(.s3d-etats)").addEventListener("click", (e) => {
      const bt = e.target.closest("button");
      if (!bt || bt.hasAttribute("data-tourne")) return;
      if (bt.dataset.plus !== undefined) {   // un espace ⇄ plusieurs feuillets (argiles) : on reconstruit la vue
        if (v.anime || (bt.dataset.plus === "1") === !!o._plus) return;
        monter(conteneur, d0, Object.assign({}, o, { _plus: bt.dataset.plus === "1", _R: v.R, _tourne: v.tourne, _mode: v.mode }));
        return;
      }
      if (bt.dataset.ech !== undefined) { changerEchelle(conteneur, d0, o, v, bt.dataset.ech); return; }
      // forme du cristal : c'est la fiche qui bascule de vue (app.js, brancherStructureMineral)
      if (bt.hasAttribute("data-cristal")) { conteneur.dispatchEvent(new CustomEvent("s3d-cristal", { bubbles: true })); return; }
      // agrandir le panneau (hauteur seulement, comme la carte) ; le ResizeObserver redessine
      if (bt.hasAttribute("data-grand")) {
        const on = canvas.classList.toggle("is-tall");
        bt.textContent = on ? "⤡ Réduire" : "⤢ Agrandir";
        return;
      }
      const seg = bt.parentElement;
      if (bt.dataset.mode) { v.mode = bt.dataset.mode; }
      if (bt.dataset.axe) { v.R = vueSelon(v.scene.B, bt.dataset.axe); v.zoom = 1; cadrer(); }
      if (bt.dataset.rep) { v.repetition = bt.dataset.rep === "2" ? [2, 2, 2] : [1, 1, 1]; reconstruire(); v.zoom = 1; cadrer(); }
      if (bt.dataset.zoom) { v.zoom = Math.min(6, Math.max(0.3, v.zoom * Number(bt.dataset.zoom))); }
      if (bt.hasAttribute("data-hydro")) {
        v.hydrogene = !v.hydrogene;
        bt.setAttribute("aria-pressed", String(v.hydrogene));
        conteneur.querySelector(".s3d-legende").innerHTML = legendeHTML(d, v.hydrogene);
      } else if (!bt.dataset.zoom) seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
      if (bt.dataset.mode || bt.dataset.rep) seg.parentElement.querySelectorAll("[data-axe]").forEach((x) => x.setAttribute("aria-pressed", "false"));
      redessiner();
    });

    // états : changement direct, ou animé quand l'entrée fournit `transition(base, de, vers)` → (u de 0 à 1) → structure
    // (argiles qui gonflent : les feuillets s'écartent, l'eau entre par les bords)
    v.remplacer = (d2) => {
      d = d2;
      if (d2.cote) v.cote = d2.cote;
      if (d2.repetition) v.repetition = d2.repetition;
      reconstruire();
    };
    if (o.etats) conteneur.querySelector(".s3d-etats").addEventListener("click", (e) => {
      const bt = e.target.closest("[data-etat]");
      if (!bt || v.anime || +bt.dataset.etat === o._etat) return;
      const vers = +bt.dataset.etat;
      const fin = () => monter(conteneur, d0, Object.assign({}, o, { _etat: vers, _R: v.R, _tourne: v.tourne, _mode: v.mode }));
      const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
      // « Structure » en atomes : passage animé fourni par argiles-particules.js (feuillets qui s'écartent, eau qui entre par les bords)
      const f = reduit ? null : particule ? (window.ArgilesParticules.transition ? ArgilesParticules.transition(o.cle, o._etat, vers) : null)
        : o.transition ? o.transition(base, o._etat, vers, !!o._plus) : null;
      if (!f) { fin(); return; }
      conteneur.querySelectorAll("[data-etat]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
      v.anime = true;
      // cadrage : on passe en douceur de celui du départ à celui de l'arrivée — centre de rotation, rayon et étendue interpolés,
      // jamais recalculés sur l'image en cours (30/09 : des molécules qui entrent par le bord déplaçaient le centre → saccades)
      // centre de départ pris sur la PREMIÈRE IMAGE de l'animation (même repère que les suivantes : une particule animée a sa
      // propre boîte, fixe) ; l'étendue, elle, ne dépend pas du repère
      const e0 = v.etendue;
      v.remplacer(f(0));
      const c0 = v.scene.centre.slice(), r0 = v.scene.rayon;
      v.remplacer(f(1)); cadrer(); const e1 = v.etendue, c1 = v.scene.centre.slice(), r1 = v.scene.rayon;
      const grandit = e1.x + e1.y > e0.x + e0.y;
      const lisse = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
      const mix = (a, b, k) => a + (b - a) * k;
      const duree = (2600 + 1400 * Math.min(1, Math.abs(e1.y - e0.y) / 30)) * (o._plus ? 1.5 : particule ? 1.4 : 1);
      const bA = cpt && cpt.bilan(o._etat), bB = cpt && cpt.bilan(vers);
      let t0 = null;
      const pas = (t) => {
        if (!canvas.isConnected) return;
        if (t0 === null) t0 = t;
        const u = Math.min(1, (t - t0) / duree);
        v.remplacer(f(u));
        if (cpt) cpt.montrer(ArgilesEau.melange(bA, bB, lisse(u)));
        // le cadrage suit les feuillets : il s'ouvre tôt quand ils s'écartent, se resserre tard quand ils se rapprochent
        const k = grandit ? lisse(u / 0.5) : lisse((u - 0.45) / 0.55);
        v.scene.centre = [0, 1, 2].map((i) => mix(c0[i], c1[i], k));
        v.scene.rayon = mix(r0, r1, k);
        v.etendue = { x: mix(e0.x, e1.x, k), y: mix(e0.y, e1.y, k) };
        dessiner(v);
        if (u < 1) requestAnimationFrame(pas); else fin();
      };
      requestAnimationFrame(pas);
    });

    // rotation lente autour de la normale aux feuillets : seulement à l'écran, jamais pendant un glisser,
    // arrêtée si l'utilisateur préfère réduire les animations
    if (v.rotation) {
      v.tourne = o._tourne ?? !matchMedia("(prefers-reduced-motion: reduce)").matches;
      const bt = conteneur.querySelector("[data-tourne]");
      bt.setAttribute("aria-pressed", String(v.tourne));
      bt.addEventListener("click", () => { v.tourne = !v.tourne; bt.setAttribute("aria-pressed", String(v.tourne)); });
      let visible = true, tPrec = 0, tDessin = 0;
      if (window.IntersectionObserver) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
      const tic = (t) => {
        if (!canvas.isConnected) return;
        if (v.tourne && visible && !document.hidden && !dernier && tPrec) {
          const dt = Math.min(0.1, (t - tPrec) / 1000);
          const axe = v.rotationAxe === "b" ? unit(v.scene.B[1]) : unit(vect(v.scene.B[0], v.scene.B[1]));
          v.R = orthonormer(mult(v.R, rotationAxe(axe, rad(v.rotation * dt))));
          if (t - tDessin > 33) { tDessin = t; dessiner(v); }
        }
        tPrec = t;
        requestAnimationFrame(tic);
      };
      requestAnimationFrame(tic);
    }

    // liquide (mercure, F.4) : les atomes s'agitent autour de leur position (≈ 0,25 Å, mouvements lents et lisses,
    // trois fréquences par atome) — seulement à l'écran, arrêté si l'utilisateur préfère réduire les animations
    if (d.agitation && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let visible = true, tDessin = 0;
      if (window.IntersectionObserver) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
      const A = d.agitation;
      const bouge = (t) => {
        if (!canvas.isConnected) return;
        if (visible && !document.hidden && !dernier && t - tDessin > 40) {
          tDessin = t;
          const s = t / 1000;
          v.scene.atomes.forEach((at, i) => {
            if (!at.p0) { at.p0 = at.p.slice(); at.ph = [i * 1.7, i * 2.3 + 1, i * 3.1 + 2]; }
            at.p = [0, 1, 2].map((k) => at.p0[k] + A * Math.sin(s * (1.3 + 0.37 * k) + at.ph[k]) * Math.cos(s * 0.7 + at.ph[(k + 1) % 3]));
          });
          dessiner(v);
        }
        requestAnimationFrame(bouge);
      };
      requestAnimationFrame(bouge);
    }

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => { if (!canvas.isConnected) ro.disconnect(); else { redessiner(); if (cpt) cpt.placer(); } });
      ro.observe(canvas);
    }
    conteneur.visionneuse = v;
    try { dessiner(v); } catch (err) { /* pas encore mis en page : le dessin suivant s'en charge */ }
    redessiner();
    return v;
  }

  // 1 maille ⇄ 2 × 2 : même orientation ; vers ou depuis « Structure » : vue de départ de la nouvelle échelle
  function changerEchelle(conteneur, d0, o, v, ech) {
    const active = o._morpho ? "e" : o._atomes ? "s" : o._plus ? "2" : "1";
    if (v.anime || ech === active) return;
    const garde = (active === "1" || active === "2") && (ech === "1" || ech === "2");   // même orientation entre 1 maille et 2 × 2
    monter(conteneur, d0, Object.assign({}, o, { _plus: ech === "2", _morpho: ech === "e", _atomes: ech === "s", _R: garde ? v.R : undefined,
      _tourne: v.tourne, _mode: o._morpho ? o._modeAtomes || v.mode : v.mode, _modeAtomes: o._morpho ? o._modeAtomes : v.mode }));
  }

  // visionneuse « Structure » : même canvas, glisser, zoom, rotation lente, Agrandir et états ; dessin par argiles-structure.js
  function monterMorpho(conteneur, d0, o, v) {
    const canvas = conteneur.querySelector("canvas");
    v.canvas = canvas;
    const cpt = compteur(conteneur, o);
    const infoMorpho = () => v.morpho.note + (noteEau(o) ? "<br>" + noteEau(o) : "");
    v.zoom = 1;
    const R0 = () => ArgilesStructure.orientation(v.morpho);
    v.R = R0();
    let attente = 0;
    const redessiner = () => {
      if (attente) return;
      attente = requestAnimationFrame(() => { attente = 0; if (canvas.isConnected) dessiner(v); });
    };
    v.redessiner = redessiner;
    let dernier = null;
    canvas.addEventListener("pointerdown", (e) => { dernier = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", (e) => {
      if (!dernier || !e.buttons && e.pointerType === "mouse") { dernier = null; return; }
      const dx = e.clientX - dernier[0], dy = e.clientY - dernier[1];
      dernier = [e.clientX, e.clientY];
      v.R = mult(rotation(dy * 0.01, dx * 0.01), v.R);
      redessiner();
    });
    const fin = () => { dernier = null; };
    canvas.addEventListener("pointerup", fin);
    canvas.addEventListener("pointercancel", fin);
    canvas.addEventListener("lostpointercapture", fin);
    canvas.addEventListener("dblclick", () => { v.R = R0(); v.zoom = 1; redessiner(); });
    canvas.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      v.zoom = Math.min(8, Math.max(0.3, v.zoom * Math.exp(-e.deltaY * 0.01)));
      redessiner();
    }, { passive: false });
    conteneur.querySelector(".s3d-outils:not(.s3d-etats)").addEventListener("click", (e) => {
      const bt = e.target.closest("button");
      if (!bt || bt.hasAttribute("data-tourne")) return;
      if (bt.dataset.ech !== undefined) { changerEchelle(conteneur, d0, o, v, bt.dataset.ech); return; }
      if (bt.hasAttribute("data-grand")) {
        const on = canvas.classList.toggle("is-tall");
        bt.textContent = on ? "⤡ Réduire" : "⤢ Agrandir";
        return;
      }
      if (bt.dataset.zoom) { v.zoom = Math.min(8, Math.max(0.3, v.zoom * Number(bt.dataset.zoom))); redessiner(); }
    });
    // états : l'épaisseur des espaces suit l'eau, en douceur
    if (o.etats) conteneur.querySelector(".s3d-etats").addEventListener("click", (e) => {
      const bt = e.target.closest("[data-etat]");
      if (!bt || v.anime || +bt.dataset.etat === o._etat) return;
      const de = o._etat, vers = +bt.dataset.etat;
      const fin = () => monter(conteneur, d0, Object.assign({}, o, { _etat: vers, _R: undefined, _tourne: v.tourne }));
      conteneur.querySelectorAll("[data-etat]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
      if (matchMedia("(prefers-reduced-motion: reduce)").matches || !ArgilesStructure.change(o.cle, de, vers)) {
        const R = v.R; v.morpho = ArgilesStructure.scene(o.cle, vers); dessiner(v);
        conteneur.querySelector(".s3d-legende").innerHTML = v.morpho.legende;
        o._etat = vers; v.R = R;
        conteneur.querySelector(".s3d-info").innerHTML = infoMorpho();
        if (cpt) cpt.montrer(cpt.bilan(vers));
        return;
      }
      v.anime = true;
      const duree = 2600;
      const bA = cpt && cpt.bilan(de), bB = cpt && cpt.bilan(vers);
      let t0 = null;
      const pas = (t) => {
        if (!canvas.isConnected) return;
        if (t0 === null) t0 = t;
        const u = Math.min(1, (t - t0) / duree);
        v.morpho = ArgilesStructure.scene(o.cle, de, vers, u * u * (3 - 2 * u));
        if (cpt) cpt.montrer(ArgilesEau.melange(bA, bB, u * u * (3 - 2 * u)));
        dessiner(v);
        if (u < 1) requestAnimationFrame(pas);
        else {
          v.anime = false; o._etat = vers;
          conteneur.querySelector(".s3d-legende").innerHTML = v.morpho.legende;
          conteneur.querySelector(".s3d-info").innerHTML = infoMorpho();
        }
      };
      requestAnimationFrame(pas);
    });
    // rotation lente autour de l'axe propre de l'objet (normale des plaquettes, verticale des tubes)
    v.tourne = o._tourne ?? !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bt = conteneur.querySelector("[data-tourne]");
    bt.setAttribute("aria-pressed", String(v.tourne));
    bt.addEventListener("click", () => { v.tourne = !v.tourne; bt.setAttribute("aria-pressed", String(v.tourne)); });
    let visible = true, tPrec = 0, tDessin = 0;
    if (window.IntersectionObserver) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
    const tic = (t) => {
      if (!canvas.isConnected) return;
      if (v.tourne && visible && !document.hidden && !dernier && tPrec) {
        const dt = Math.min(0.1, (t - tPrec) / 1000);
        v.R = orthonormer(mult(v.R, rotationAxe(v.morpho.axe, rad(5 * dt))));
        if (t - tDessin > 33 && !v.anime) { tDessin = t; dessiner(v); }
      }
      tPrec = t;
      requestAnimationFrame(tic);
    };
    requestAnimationFrame(tic);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => { if (!canvas.isConnected) ro.disconnect(); else { redessiner(); if (cpt) cpt.placer(); } });
      ro.observe(canvas);
    }
    conteneur.visionneuse = v;
    try { dessiner(v); } catch (err) { /* pas encore mis en page */ }
    redessiner();
    return v;
  }

  // <div data-s3d="id" data-s3d-source="bas"> : visionneuse sans ligne de source ;
  // <li data-s3d-ref="id"> : reçoit la référence complète de la structure
  function brancher(racine) {
    const r = racine || document;
    r.querySelectorAll("[data-s3d]:not([data-s3d-monte])").forEach((el) => {
      el.setAttribute("data-s3d-monte", "");
      const opt = el.dataset.s3dSource === "bas" ? { source: false } : {};
      // fiches minéraux (01/10/2026) : bouton « Forme du cristal » à côté de 1 maille / 2 × 2 × 2 (grisé si la forme manque)
      if (el.dataset.s3dCristal !== undefined) {
        opt.cristal = el.dataset.s3dCristal === "1" ? "oui" : "non";
        opt.replier = true;   // maille et description repliées sous un petit bouton (01/10/2026, place gagnée)
        // fiches minéraux : rotation lente comme les argiles (01/10/2026), sauf si l'entrée de l'index en décide autrement
        const e = INDEX[el.dataset.s3d];
        if (!e || e.rotation === undefined) opt.rotation = true;
      }
      // pages d'espèces d'argiles (01/10/2026) : même présentation compacte (a b c, texte replié)
      if (el.dataset.s3dReplier !== undefined) opt.replier = true;
      // fiches roches (02/10/2026) : rotation lente d'office
      if (el.dataset.s3dTourne !== undefined) opt.rotation = true;
      // texte écrit sous la vue (<template class="s3d-apres">) : rangé dans le volet « Maille et description » (02/10/2026)
      const apres = el.querySelector("template.s3d-apres");
      if (apres) { opt.apres = apres.innerHTML; opt.replier = true; }
      afficher(el, el.dataset.s3d, opt);
    });
    r.querySelectorAll("[data-s3d-ref]:not([data-s3d-monte])").forEach((el) => {
      el.setAttribute("data-s3d-monte", "");
      const entree = INDEX[el.dataset.s3dRef];
      if (!entree) return;
      charger(entree.fichier, (d) => { if (d) el.innerHTML = referenceHTML(d); });
    });
  }

  window.Structure3D = {
    enregistrer, charger, afficher, brancher, construire, referenceHTML,
    outils: { mult, rotation, rad, unit, vect, scal, sous, norme, orthonormer, sprite, rgb, eclaircir, hexRgb, COULEURS, dessiner },
    index: (table) => { INDEX = table; },
    completer: (cle, entree) => { INDEX[cle] = Object.assign(INDEX[cle] || {}, entree); },
    existe: (cle) => !!INDEX[cle],
    entree: (cle) => INDEX[cle] || null,
    donnees,
  };
})();
